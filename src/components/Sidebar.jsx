import React, { useState } from 'react';
import { Utensils, MapPin, Settings, X, Plus, GripVertical, Navigation, Download } from 'lucide-react';
import { motion, Reorder, useDragControls } from 'framer-motion';

const ReorderItem = ({ stop, index, onRemove }) => {
    const dragControls = useDragControls();

    return (
        <Reorder.Item
            value={stop}
            dragListener={false}
            dragControls={dragControls}
            style={{ background: 'transparent', border: 'none' }}
        >
            <motion.div
                className="stop-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                layoutId={stop.id}
            >
                <div
                    className="drag-handle"
                    style={{ cursor: 'grab', marginRight: '10px', color: '#666', touchAction: 'none' }}
                    onPointerDown={(e) => dragControls.start(e)}
                >
                    <GripVertical size={16} />
                </div>
                <div className="stop-marker">{index + 1}</div>
                <div className="stop-info">
                    <h4>{stop.displayName || stop.name}</h4>
                    <p>{stop.formattedAddress || stop.vicinity}</p>
                    {stop.rating && (
                        <div className="rating">
                            {'★'.repeat(Math.round(stop.rating))}
                            <span>({stop.userRatingCount || stop.user_ratings_total})</span>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => onRemove(index)}
                    style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginLeft: 'auto' }}
                >
                    <X size={16} />
                </button>
            </motion.div>
        </Reorder.Item>
    );
};

export function Sidebar({
    searchParams,
    setSearchParams,
    onSearch,
    stops = [],
    routeSummary,
    onRemoveStop,
    onReorderStops,
    onAddStop,
    onSetStartLocation,
    onNavigate,
    onExportCSV
}) {
    const [addStopQuery, setAddStopQuery] = useState('');
    const [startLocationQuery, setStartLocationQuery] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value }));
    };

    const handleAddStopSubmit = (e) => {
        e.preventDefault();
        if (addStopQuery.trim()) {
            onAddStop(addStopQuery);
            setAddStopQuery('');
        }
    };

    const handleStartLocationBlur = () => {
        if (startLocationQuery.trim()) {
            onSetStartLocation(startLocationQuery);
        }
    };

    return (
        <div className="sidebar">
            <div className="header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>Crawlme 🍔</h1>
                </div>
                <p>Plan your ultimate food crawl</p>
            </div>

            <div className="control-panel">
                <div className="input-group">
                    <label><MapPin size={18} /> Starting Location</label>
                    <input
                        type="text"
                        value={startLocationQuery}
                        onChange={(e) => setStartLocationQuery(e.target.value)}
                        onBlur={handleStartLocationBlur}
                        onKeyDown={(e) => e.key === 'Enter' && handleStartLocationBlur()}
                        placeholder="Current Location (or type address)"
                    />
                </div>

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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <h3 style={{ margin: 0 }}>Route Summary</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <button
                                onClick={onNavigate}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    background: '#FF9900', border: 'none', borderRadius: '5px',
                                    padding: '5px 10px', color: 'white', cursor: 'pointer', fontSize: '12px',
                                    justifyContent: 'center'
                                }}
                            >
                                <Navigation size={14} /> Navigate
                            </button>
                            <button
                                onClick={onExportCSV}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    background: '#4CAF50', border: 'none', borderRadius: '5px',
                                    padding: '5px 10px', color: 'white', cursor: 'pointer', fontSize: '12px',
                                    justifyContent: 'center'
                                }}
                            >
                                <Download size={14} /> Export CSV
                            </button>
                        </div>
                    </div>
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

            {/* Add Stop Section */}
            {stops.length > 0 && (
                <div className="add-stop-section" style={{ padding: '0 20px 10px' }}>
                    <form onSubmit={handleAddStopSubmit} style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            value={addStopQuery}
                            onChange={(e) => setAddStopQuery(e.target.value)}
                            placeholder="Add specific place..."
                            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #333', background: '#222', color: 'white' }}
                        />
                        <button type="submit" style={{ background: '#333', border: 'none', color: 'white', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                            <Plus size={18} />
                        </button>
                    </form>
                </div>
            )}

            <div className="stops-list">
                <Reorder.Group axis="y" values={stops} onReorder={onReorderStops} style={{ listStyle: 'none', padding: 0 }}>
                    {stops.map((stop, index) => (
                        <ReorderItem
                            key={stop.id || stop.place_id || index}
                            stop={stop}
                            index={index}
                            onRemove={onRemoveStop}
                        />
                    ))}
                </Reorder.Group>
            </div>
        </div>
    );
}
