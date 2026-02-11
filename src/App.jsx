import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { MapContainer } from './components/MapContainer';
import { GOOGLE_MAPS_API_KEY, DEFAULT_SEARCH_PARAMS } from './constants';

export default function App() {
    const [searchParams, setSearchParams] = useState(DEFAULT_SEARCH_PARAMS);
    const [userLocation, setUserLocation] = useState(null);
    const [mapInstance, setMapInstance] = useState(null);
    const [places, setPlaces] = useState([]);
    const [directions, setDirections] = useState(null);
    const [routeSummary, setRouteSummary] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [routeOptions, setRouteOptions] = useState({ optimize: true });

    // Get User Location on Mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                    // Fallback handled by MapContainer defaultCenter
                }
            );
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
        setRouteOptions({ optimize: true }); // Reset optimization on new search

        try {
            const { Place } = await window.google.maps.importLibrary("places");
            await window.google.maps.importLibrary("geometry"); // For radius checking

            // New Places API (Text Search)
            const request = {
                textQuery: searchParams.foodType,
                fields: ['displayName', 'location', 'rating', 'userRatingCount', 'formattedAddress', 'id'],
                locationBias: userLocation, // Bias towards user location
                maxResultCount: 20, // Fetch enough to sort and filter
            };

            const { places: results } = await Place.searchByText(request);

            if (results && results.length > 0) {
                // 1. Filter by Radius (Strict)
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

                // 2. Sort by heuristic
                const sortedResults = filteredResults.sort((a, b) => {
                    const scoreA = (a.rating || 0) * (Math.log10(a.userRatingCount || 1));
                    const scoreB = (b.rating || 0) * (Math.log10(b.userRatingCount || 1));
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

        // Map new Place objects to Waypoints
        const waypointsData = waypoints.map(place => ({
            location: place.location, // Place.location is a LatLng object
            stopover: true
        }));

        directionsService.route(
            {
                origin: userLocation,
                destination: userLocation, // Round trip
                waypoints: waypointsData,
                optimizeWaypoints: optimize, // Use flag
                travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                setIsSearching(false);
                if (status === window.google.maps.DirectionsStatus.OK) {
                    setDirections(result);

                    // Calculate summary
                    const route = result.routes[0];
                    let totalDistance = 0;
                    let totalDuration = 0;

                    route.legs.forEach(leg => {
                        totalDistance += leg.distance.value;
                        totalDuration += leg.duration.value;
                    });

                    // Update places order ONLY if optimized
                    if (optimize) {
                        const optimizedOrder = result.routes[0].waypoint_order;
                        const sortedPlaces = optimizedOrder.map(index => waypoints[index]);
                        setPlaces(sortedPlaces);
                    }
                    // If not optimized, we assume 'waypoints' (from state) is already in the desired order

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

    // --- Stop Management Handlers ---

    const handleRemoveStop = (indexToRemove) => {
        const newPlaces = places.filter((_, index) => index !== indexToRemove);
        setPlaces(newPlaces);
        setRouteOptions({ optimize: false });
        calculateRoute(newPlaces, false);
    };

    const handleReorderStops = (newPlaces) => {
        setPlaces(newPlaces);
        setRouteOptions({ optimize: false }); // User explicitly ordered, so disable auto-optimize
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
                // Check for duplicates
                if (places.some(p => p.id === newPlace.id)) {
                    alert("This place is already in your crawl!");
                    setIsSearching(false);
                    return;
                }

                const newPlaces = [...places, newPlace];
                setPlaces(newPlaces);
                setRouteOptions({ optimize: false }); // User added specific stop, don't shuffle everything
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


    return (
        <div className="app-container" style={{ display: 'flex', width: '100%', height: '100vh' }}>
            <Sidebar
                searchParams={searchParams}
                setSearchParams={setSearchParams}
                onSearch={handleSearch}
                stops={places}
                routeSummary={routeSummary}
                onRemoveStop={handleRemoveStop}
                onReorderStops={handleReorderStops}
                onAddStop={handleAddStop}
            />
            <div className="map-container-wrapper" style={{ flex: 1 }}>
                <MapContainer
                    apiKey={GOOGLE_MAPS_API_KEY}
                    center={userLocation} // Will center on user
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
                        Planning your crawl... 🥔
                    </div>
                )}
            </div>
        </div>
    );
}
