import React from 'react';
import { Utensils, MapPin, Navigation, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export function Sidebar({
    searchParams,
    setSearchParams,
    onSearch,
    stops = [],
    routeSummary
}) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="sidebar">
            <div className="header">
                <h1>Crawlme 🍔</h1>
                <p>Plan your ultimate food crawl</p>
            </div>

            <div className="control-panel">
                <div className="input-group">
                    <label><Utensils size={18} /> Food Type</label>
                    <input
                        type="text"
                        name="foodType"
                        value={searchParams.foodType}
                        onChange={handleChange}
                        placeholder="e.g. Burgers, Tacos"
                    />
                </div>

                <div className="input-group">
                    <label><Settings size={18} /> Stops</label>
                    <div className="range-wrapper">
                        <input
                            type="range"
                            name="stops"
                            min="2"
                            max="20"
                            value={searchParams.stops}
                            onChange={handleChange}
                        />
                        <span>{searchParams.stops}</span>
                    </div>
                </div>

                <div className="input-group">
                    <label><MapPin size={18} /> Radius (miles)</label>
                    <div className="range-wrapper">
                        <input
                            type="range"
                            name="radius"
                            min="1"
                            max="20"
                            value={searchParams.radius}
                            onChange={handleChange}
                        />
                        <span>{searchParams.radius} mi</span>
                    </div>
                </div>

                <button className="primary-btn" onClick={onSearch}>
                    Find Crawl
                </button>
            </div>

            {routeSummary && (
                <div className="route-summary">
                    <h3>Route Summary</h3>
                    <div className="summary-stats">
                        <div>
                            <strong>{routeSummary.distance}</strong>
                            <span>Distance</span>
                        </div>
                        <div>
                            <strong>{routeSummary.duration}</strong>
                            <span>Duration</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="stops-list">
                {stops.map((stop, index) => (
                    <motion.div
                        key={stop.id || index}
                        className="stop-item"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="stop-marker">{index + 1}</div>
                        <div className="stop-info">
                            <h4>{stop.displayName}</h4>
                            <p>{stop.formattedAddress}</p>
                            {stop.rating && (
                                <div className="rating">
                                    {'★'.repeat(Math.round(stop.rating))}
                                    <span>({stop.userRatingCount})</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
