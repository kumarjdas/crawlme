import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { MapContainer } from './components/MapContainer';
import { GOOGLE_MAPS_API_KEY, DEFAULT_SEARCH_PARAMS } from './constants';

export default function App() {
    const [searchParams, setSearchParams] = useState(DEFAULT_SEARCH_PARAMS);
    const [userLocation, setUserLocation] = useState(null); // Current "Center" of the crawl
    const [userGeoLocation, setUserGeoLocation] = useState(null); // Actual GPS location (backup)
    const [mapInstance, setMapInstance] = useState(null);
    const [places, setPlaces] = useState([]);
    const [directions, setDirections] = useState(null);
    const [routeSummary, setRouteSummary] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [routeOptions, setRouteOptions] = useState({ optimize: true });

    // 1. Get Device Location on Mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const loc = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setUserGeoLocation(loc);
                    // Only set userLocation if not already set by URL params
                    if (!userLocation) {
                        setUserLocation(loc);
                    }
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }
    }, [userLocation]); // Dependency helps check if URL loaded first

    // 2. Parse URL Params on Mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const startParam = params.get('start');
        const qParam = params.get('q');
        const rParam = params.get('r');
        const stopsParam = params.get('stops'); // Comma-separated place IDs? or names?
        // Note: Rehydrating full stops from IDs requires fetching details. 
        // For simplicity/MVP, we might just share the configuration and let the user 'Search' again,
        // OR we try to share the full state. 
        // Let's try to restore the CONFIG first, as re-fetching exact stops is complex without IDs.

        if (startParam) {
            const [lat, lng] = startParam.split(',').map(Number);
            if (!isNaN(lat) && !isNaN(lng)) {
                setUserLocation({ lat, lng });
            }
        }
        if (qParam || rParam) {
            setSearchParams(prev => ({
                ...prev,
                foodType: qParam || prev.foodType,
                radius: rParam ? Number(rParam) : prev.radius,
            }));
        }

    }, []);

    const handleSearch = useCallback(async () => {
        if (!mapInstance || !userLocation) {
            alert("Map not ready or location not found. Please wait.");
            return;
        }

        setIsSearching(true);
        setPlaces([]);
        setDirections(null);
        setRouteSummary(null);
        setRouteOptions({ optimize: true });

        try {
            const { Place } = await window.google.maps.importLibrary("places");
            await window.google.maps.importLibrary("geometry");

            const request = {
                textQuery: searchParams.foodType,
                fields: ['displayName', 'location', 'rating', 'userRatingCount', 'formattedAddress', 'id'],
                locationBias: userLocation,
                maxResultCount: 20,
            };

            const { places: results } = await Place.searchByText(request);

            if (results && results.length > 0) {
                const radiusMeters = searchParams.radius * 1609.34;
                const filteredResults = results.filter(place => {
                    if (!place.location) return false;
                    const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
                        new window.google.maps.LatLng(userLocation),
                        place.location
                    );
                    return distance <= radiusMeters;
                });

                if (filteredResults.length === 0) {
                    alert(`No places found within ${searchParams.radius} miles.`);
                    setIsSearching(false);
                    return;
                }

                const sortedResults = filteredResults.sort((a, b) => {
                    const scoreA = (a.rating || 0) * Math.pow(a.userRatingCount || 0, 0.4);
                    const scoreB = (b.rating || 0) * Math.pow(b.userRatingCount || 0, 0.4);
                    return scoreB - scoreA;
                });

                const topPlaces = sortedResults.slice(0, searchParams.stops);
                setPlaces(topPlaces);
                calculateRoute(topPlaces, true); // Initial search optimizes route
            } else {
                alert("No places found.");
                setIsSearching(false);
            }

        } catch (error) {
            console.error("Places Search Error:", error);
            alert("Error finding places. Make sure Places API (New) is enabled.");
            setIsSearching(false);
        }

    }, [mapInstance, userLocation, searchParams]);

    const calculateRoute = (waypoints, optimize = true) => {
        if (!window.google || waypoints.length === 0) {
            setDirections(null);
            setRouteSummary(null);
            return;
        }

        const directionsService = new window.google.maps.DirectionsService();

        const waypointsData = waypoints.map(place => ({
            location: place.location,
            stopover: true
        }));

        directionsService.route(
            {
                origin: userLocation,
                destination: userLocation,
                waypoints: waypointsData,
                optimizeWaypoints: optimize,
                travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                setIsSearching(false);
                if (status === window.google.maps.DirectionsStatus.OK) {
                    setDirections(result);

                    const route = result.routes[0];
                    let totalDistance = 0;
                    let totalDuration = 0;

                    route.legs.forEach(leg => {
                        totalDistance += leg.distance.value;
                        totalDuration += leg.duration.value;
                    });

                    if (optimize) {
                        const optimizedOrder = result.routes[0].waypoint_order;
                        const sortedPlaces = optimizedOrder.map(index => waypoints[index]);
                        setPlaces(sortedPlaces);
                    }

                    setRouteSummary({
                        distance: (totalDistance / 1609.34).toFixed(1) + ' mi',
                        duration: Math.round(totalDuration / 60) + ' min'
                    });
                } else {
                    console.error("Directions request failed due to " + status);
                    alert("Could not calculate route.");
                }
            }
        );
    };

    // --- Stop Management ---
    const handleRemoveStop = (indexToRemove) => {
        const newPlaces = places.filter((_, index) => index !== indexToRemove);
        setPlaces(newPlaces);
        setRouteOptions({ optimize: false });
        calculateRoute(newPlaces, false);
    };

    const handleReorderStops = (newPlaces) => {
        setPlaces(newPlaces);
        setRouteOptions({ optimize: false });
        calculateRoute(newPlaces, false);
    };

    const handleAddStop = async (query) => {
        if (!mapInstance) return;
        setIsSearching(true);
        try {
            const { Place } = await window.google.maps.importLibrary("places");
            const request = {
                textQuery: query,
                fields: ['displayName', 'location', 'rating', 'userRatingCount', 'formattedAddress', 'id'],
                locationBias: userLocation,
                maxResultCount: 1,
            };
            const { places: results } = await Place.searchByText(request);

            if (results && results.length > 0) {
                const newPlace = results[0];
                if (places.some(p => p.id === newPlace.id)) {
                    alert("This place is already in your crawl!");
                    setIsSearching(false);
                    return;
                }
                const newPlaces = [...places, newPlace];
                setPlaces(newPlaces);
                setRouteOptions({ optimize: false });
                calculateRoute(newPlaces, false);
            } else {
                alert("Could not find place: " + query);
                setIsSearching(false);
            }
        } catch (error) {
            console.error("Add Stop Error:", error);
            alert("Error adding stop.");
            setIsSearching(false);
        }
    };

    // --- New Features ---
    const handleSetStartLocation = async (query) => {
        if (!query) {
            // Reset to device location
            if (userGeoLocation) {
                setUserLocation(userGeoLocation);
                // Optionally clear route?
            }
            return;
        }

        setIsSearching(true);
        try {
            const { Place } = await window.google.maps.importLibrary("places");
            const request = {
                textQuery: query,
                fields: ['location', 'displayName'],
                maxResultCount: 1
            };
            const { places: results } = await Place.searchByText(request);
            if (results && results.length > 0) {
                const loc = results[0].location;
                // Convert to simple lat/lng object if needed,/though maps object works usually.
                // But keeping it consistent:
                setUserLocation({ lat: loc.lat(), lng: loc.lng() });
                setIsSearching(false);
            } else {
                alert("Location not found.");
                setIsSearching(false);
            }
        } catch (error) {
            alert("Error finding location.");
            setIsSearching(false);
        }
    };

    const handleShareCrawl = () => {
        if (!userLocation) return;
        const params = new URLSearchParams();
        params.set('start', `${userLocation.lat},${userLocation.lng}`);
        params.set('q', searchParams.foodType);
        params.set('r', searchParams.radius);

        // Construct URL
        const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        navigator.clipboard.writeText(url).then(() => {
            alert("Link copied to clipboard!");
        });
    };

    const handleNavigate = () => {
        if (!userLocation || places.length === 0) return;

        const origin = `${userLocation.lat},${userLocation.lng}`;
        // Last place is also destination (Round trip usually, but let's use the last stop logic or just return to start?)
        // The app logic assumes Start -> Stop 1 -> ... -> Stop N -> Start.
        // Google Maps URL limit is strict.

        const waypoints = places.map(p => encodeURIComponent(p.formattedAddress)).join('|');
        const destination = origin; // Round trip

        const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;
        window.open(url, '_blank');
    };


    return (
        <div className="app-container">
            <Sidebar
                searchParams={searchParams}
                setSearchParams={setSearchParams}
                onSearch={handleSearch}
                stops={places}
                routeSummary={routeSummary}
                onRemoveStop={handleRemoveStop}
                onReorderStops={handleReorderStops}
                onAddStop={handleAddStop}
                onSetStartLocation={handleSetStartLocation}
                onShare={handleShareCrawl}
                onNavigate={handleNavigate}
            />
            <div className="map-container-wrapper">
                <MapContainer
                    apiKey={GOOGLE_MAPS_API_KEY}
                    center={userLocation}
                    userLocation={userLocation}
                    directions={directions}
                    stops={places}
                    setMapInstance={setMapInstance}
                />
                {isSearching && (
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '20px',
                        zIndex: 1000
                    }}>
                        Processing... 🥔
                    </div>
                )}
            </div>
        </div>
    );
}
