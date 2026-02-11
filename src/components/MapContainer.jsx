import React, { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';
import { MAP_LIBRARIES, GOOGLE_MAP_ID } from '../constants';
import { AdvancedMarker } from './AdvancedMarker';

const containerStyle = {
    width: '100%',
    height: '100%'
};

const defaultCenter = {
    lat: 40.7128, // Default to NYC if geolocation fails
    lng: -74.0060
};

const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    mapId: GOOGLE_MAP_ID, // Required for Advanced Markers
    // Note: Cloud-based styling via Map ID is preferred over 'styles' array for Advanced Markers
};

export function MapContainer({ apiKey, center, userLocation, directions, stops, setMapInstance }) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey,
        libraries: MAP_LIBRARIES
    });

    const [map, setMap] = useState(null);

    const onLoad = useCallback(function callback(map) {
        setMap(map);
        setMapInstance(map);
    }, [setMapInstance]);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
        setMapInstance(null);
    }, [setMapInstance]);

    if (!isLoaded) return <div className="map-loading">Loading Map...</div>;

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={userLocation || center || defaultCenter}
            zoom={13}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={mapOptions}
        >
            {/* User Location Marker (Advanced) */}
            {userLocation && map && (
                <AdvancedMarker
                    map={map}
                    position={userLocation}
                    title="Your Location"
                />
            )}

            {/* Stop Markers (Advanced) */}
            {stops && map && stops.map((stop, index) => (
                <AdvancedMarker
                    key={stop.id || index}
                    map={map}
                    position={stop.location} // New Places API uses .location directly
                    title={stop.displayName} // New Places API uses .displayName
                    index={index}
                />
            ))}

            {/* Route Renderer (Hidden Markers) */}
            {directions && (
                <DirectionsRenderer
                    directions={directions}
                    options={{
                        suppressMarkers: true, // Hide default markers to avoiding duplication/deprecation
                        polylineOptions: {
                            strokeColor: "#FF9900",
                            strokeWeight: 5,
                            strokeOpacity: 0.8
                        }
                    }}
                />
            )}
        </GoogleMap>
    );
}
