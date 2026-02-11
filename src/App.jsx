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

        try {
            const { Place } = await window.google.maps.importLibrary("places");

            // New Places API (Text Search)
            const request = {
                textQuery: searchParams.foodType,
                fields: ['displayName', 'location', 'rating', 'userRatingCount', 'formattedAddress', 'id'],
                locationBias: userLocation, // Bias towards user location
                maxResultCount: 20, // Fetch enough to sort
            };

            const { places: results } = await Place.searchByText(request);

            if (results && results.length > 0) {
                // Sort by rating and rating count (heuristic)
                const sortedResults = results.sort((a, b) => {
                    const scoreA = (a.rating || 0) * (Math.log10(a.userRatingCount || 1));
                    const scoreB = (b.rating || 0) * (Math.log10(b.userRatingCount || 1));
                    return scoreB - scoreA;
                });

                const topPlaces = sortedResults.slice(0, searchParams.stops);
                setPlaces(topPlaces);
                calculateRoute(topPlaces);
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

    const calculateRoute = (waypoints) => {
        if (!window.google) return;

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
                optimizeWaypoints: true,
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

                    // Sort places based on optimized waypoint order
                    const optimizedOrder = result.routes[0].waypoint_order;
                    const sortedPlaces = optimizedOrder.map(index => waypoints[index]);
                    setPlaces(sortedPlaces);

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

    return (
        <div className="app-container" style={{ display: 'flex', width: '100%', height: '100vh' }}>
            <Sidebar
                searchParams={searchParams}
                setSearchParams={setSearchParams}
                onSearch={handleSearch}
                stops={places}
                routeSummary={routeSummary}
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
