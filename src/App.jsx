import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { MapContainer } from './components/MapContainer';
import { GOOGLE_MAPS_API_KEY, DEFAULT_SEARCH_PARAMS } from './constants';

export default function App() {
    const [searchParams, setSearchParams] = useState(DEFAULT_SEARCH_PARAMS);
    const [userLocation, setUserLocation] = useState(null);
    const [userGeoLocation, setUserGeoLocation] = useState(null);
    const [mapInstance, setMapInstance] = useState(null);
    const [places, setPlaces] = useState([]);
    const [directions, setDirections] = useState(null);
    const [routeSummary, setRouteSummary] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isLocating, setIsLocating] = useState(true); // Default to locating
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
                    if (!userLocation) {
                        setUserLocation(loc);
                    }
                    setIsLocating(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setIsLocating(false);
                }
            );
        } else {
            setIsLocating(false);
        }
    }, [userLocation]);

    // ... (rest of effects)

    // Layout
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
                {isLocating && !userLocation ? (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        background: '#0a0a0a',
                        color: '#ff9900',
                        fontSize: '1.2rem'
                    }}>
                        Locating you... 🛰️
                    </div>
                ) : (
                    <MapContainer
                        apiKey={GOOGLE_MAPS_API_KEY}
                        center={userLocation}
                        userLocation={userLocation}
                        directions={directions}
                        stops={places}
                        setMapInstance={setMapInstance}
                    />
                )}
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
