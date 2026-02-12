import { useEffect, useRef } from 'react';

export const AdvancedMarker = ({ map, position, title, index }) => {
    const markerRef = useRef(null);

    useEffect(() => {
        if (!map || !window.google) return;

        // cleanup previous marker if exists (though we rely on unmount usually)
        if (markerRef.current) {
            markerRef.current.map = null;
        }

        let content = null;
        if (index !== undefined) {
            const pin = new window.google.maps.marker.PinElement({
                glyphText: `${index + 1}`,
                background: "#FF9900",
                borderColor: "#CC7A00",
                glyphColor: "white",
            });
            content = pin;
        }

        const marker = new window.google.maps.marker.AdvancedMarkerElement({
            map,
            position,
            title,
            content,
        });

        markerRef.current = marker;

        return () => {
            marker.map = null;
        };
    }, [map, position, title, index]);

    return null;
};
