
import React, { useState, useMemo, useEffect } from 'react';
import { SearchIcon, AlertTriangleIcon, ClockIcon, ArchiveBoxIcon, OnHandIcon } from '../components/Icons';

type FilterType = 'all' | 'lowStock' | 'expiringSoon';

import { getItems } from '../api';

const OnHandPage = () => {
    const [onHandItems, setOnHandItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOnHand = async () => {
            try {
                setLoading(true);
                const data = await getItems();
                // Đảm bảo dữ liệu là mảng, và các trường đúng chuẩn
                setOnHandItems(Array.isArray(data) ? data : []);
            } catch (err) {
                setError('Failed to fetch on-hand items');
            } finally {
                setLoading(false);
            }
        };
        fetchOnHand();
    }, []);

    // Tổng hợp dữ liệu: tổng quantity, low stock, stock by location, danh sách low stock
    const { summary, locations, lowStockItems } = useMemo(() => {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        let totalQuantity = 0;
        let lowStockCount = 0;
        let expiringSoonCount = 0;
        const locationQuantities = {};
        const lowStockList = [];

        onHandItems.forEach(item => {
            totalQuantity += Number(item.quantity) || 0;
            if (Number(item.quantity) <= Number(item.minStock || item.minBalance || 0)) {
                lowStockCount++;
                lowStockList.push(item);
            }
            // Không có expiryDate trong API, bỏ qua expiringSoon
            if (item.store) {
                locationQuantities[item.store] = (locationQuantities[item.store] || 0) + (Number(item.quantity) || 0);
            }
        });

        const sortedLocations = Object.entries(locationQuantities).sort(([, a], [, b]) => Number(b) - Number(a));

        return {
            summary: {
                totalQuantity,
                lowStockCount,
                expiringSoonCount,
                topLocation: sortedLocations.length > 0 ? sortedLocations[0][0] : 'N/A',
            },
            locations: sortedLocations.map(([name, qty]) => ({ name, qty })),
            lowStockItems: lowStockList,
        };
    }, [onHandItems]);

    const maxLocationCount = locations.length > 0 ? locations[0].qty : 0;
    // Modal hiển thị danh sách low stock
    const [showLowStockModal, setShowLowStockModal] = useState(false);

    const renderLowStockModal = () => (
        <div className="modal-overlay" onClick={() => setShowLowStockModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ minWidth: 500 }}>
                <div className="modal-header">
                    <h3>Low Stock Items</h3>
                    <button className="modal-close" onClick={() => setShowLowStockModal(false)}>&times;</button>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Model</th>
                            <th>Location</th>
                            <th>Quantity</th>
                            <th>Min Stock</th>
                            <th>Expiry Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lowStockItems.length === 0 && (
                            <tr><td colSpan={6} style={{ textAlign: 'center' }}>No low stock items</td></tr>
                        )}
                        {lowStockItems.map(item => (
                            <tr key={item.product_id}>
                                <td>{item.product_name}</td>
                                <td>{item.model || ''}</td>
                                <td>{item.location || ''}</td>
                                <td>{item.quantity}</td>
                                <td>{item.minStock}</td>
                                <td>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : ''}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const filteredItems = useMemo(() => {
        let tempItems = onHandItems;

        // Lọc lowStock đúng trường
        if (activeFilter === 'lowStock') {
            tempItems = tempItems.filter(item => Number(item.quantity) <= Number(item.minStock || 0));
        }

        // Lọc theo location (store)
        if (selectedLocation) {
            tempItems = tempItems.filter(item => item.store === selectedLocation);
        }

        // Search theo product_name, store
        return tempItems.filter(item =>
            (item.product_name && item.product_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.store && item.store.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [onHandItems, searchTerm, activeFilter, selectedLocation]);


    const handleFilterChange = (filter: FilterType) => {
        setActiveFilter(filter);
        setSelectedLocation(null);
        setCurrentPage(1);
    };

    const handleLocationSelect = (locationName: string) => {
        setSelectedLocation(prev => (prev === locationName ? null : locationName));
        setActiveFilter('all');
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


    return (
        <div className="management-page">
            <div className="page-header">
                <h2>On Hand Inventory</h2>
                <p>A detailed overview of your current stock levels and locations.</p>
            </div>

            <div className="management-summary-grid">
                <div 
                    className={`summary-item card ${activeFilter === 'all' && !selectedLocation ? 'active-filter' : ''}`}
                    onClick={() => handleFilterChange('all')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleFilterChange('all')}
                >
                    <div className="summary-icon bg-green"><ArchiveBoxIcon /></div>
                    <div className="summary-info"><strong>{summary.totalQuantity.toLocaleString()}</strong><span>Total Quantity in Stock</span></div>
                </div>
                <div 
                    className={`summary-item card ${activeFilter === 'lowStock' ? 'active-filter' : ''}`}
                    onClick={() => setShowLowStockModal(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setShowLowStockModal(true)}
                >
                    <div className="summary-icon bg-danger"><AlertTriangleIcon /></div>
                    <div className="summary-info"><strong>{summary.lowStockCount}</strong><span>Low Stock Items</span></div>
                </div>
                <div 
                    className={`summary-item card ${activeFilter === 'expiringSoon' ? 'active-filter' : ''}`}
                    onClick={() => handleFilterChange('expiringSoon')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleFilterChange('expiringSoon')}
                >
                    <div className="summary-icon bg-orange"><ClockIcon /></div>
                    <div className="summary-info"><strong>{summary.expiringSoonCount}</strong><span>Expiring in 30 days</span></div>
                </div>
                 <div className="summary-item card non-interactive">
                    <div className="summary-icon bg-cyan"><OnHandIcon /></div>
                    <div className="summary-info"><strong>{summary.topLocation}</strong><span>Top Stocked Location</span></div>
                </div>
            </div>

            <div className="management-main-grid" style={{ gridTemplateColumns: '2.5fr 1fr', alignItems: 'stretch' }}>
                <div className="card items-table-card" style={{ gridColumn: '1' }}>
                    <div className="items-table-toolbar">
                        <div className="search-bar-items">
                            <SearchIcon />
                            <input 
                                type="text" 
                                placeholder="Search by item, model, or location" 
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>

                    <table className="data-table styled-table">
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', paddingLeft: 16 }}>Item</th>
                                <th style={{ textAlign: 'center' }}>Model</th>
                                <th style={{ textAlign: 'center' }}>Location</th>
                                <th style={{ textAlign: 'center' }}>Quantity</th>
                                <th style={{ textAlign: 'center' }}>Min Stock</th>
                                <th style={{ textAlign: 'center' }}>Expiry Date</th>
                                <th style={{ textAlign: 'center' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedItems.length === 0 && (
                                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#888', fontStyle: 'italic', background: '#f9f9f9' }}>No data</td></tr>
                            )}
                            {paginatedItems.map(item => {
                                const isLowStock = Number(item.quantity) <= Number(item.minStock || 0);
                                return (
                                    <tr key={item.product_id} className={isLowStock ? 'row-low-stock' : ''} style={{ background: isLowStock ? '#fff6f6' : undefined }}>
                                        <td style={{ fontWeight: isLowStock ? 600 : 400, color: isLowStock ? '#d32f2f' : undefined, textAlign: 'left' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ borderRadius: 6, background: '#f5f5f5', padding: '2px 8px', fontWeight: 500 }}>{item.product_name}</span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center', color: '#555' }}>{item.model || <span style={{ color: '#bbb' }}>-</span>}</td>
                                        <td style={{ textAlign: 'center', color: '#1976d2', fontWeight: 500 }}>{item.store || <span style={{ color: '#bbb' }}>-</span>}</td>
                                        <td style={{ textAlign: 'center', fontWeight: 500 }}>{item.quantity}</td>
                                        <td style={{ textAlign: 'center', color: '#888' }}>{item.minStock || <span style={{ color: '#bbb' }}>-</span>}</td>
                                        <td style={{ textAlign: 'center', color: '#bbb' }}>-</td>
                                        <td style={{ textAlign: 'center' }}>
                                            {isLowStock ? (
                                                <span className="status-badge low-stock" style={{ background: '#ffebee', color: '#d32f2f', borderRadius: 12, padding: '2px 10px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                    <AlertTriangleIcon style={{ width: 16, height: 16, color: '#d32f2f' }} /> Low Stock
                                                </span>
                                            ) : (
                                                <span className="status-badge ok" style={{ background: '#e8f5e9', color: '#388e3c', borderRadius: 12, padding: '2px 10px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                    <ArchiveBoxIcon style={{ width: 16, height: 16, color: '#388e3c' }} /> OK
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    
                    <div className="pagination">
                        <div className="pagination-info">
                            Showing 
                            <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select> 
                            &nbsp;to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} records
                        </div>
                        <div className="pagination-controls">
                            <button 
                                className="pagination-btn" 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                                aria-label="Go to previous page"
                            >
                                &lt;
                            </button>
                             {[...Array(Math.min(totalPages, 4)).keys()].map(num => (
                                <button 
                                    key={num}
                                    className={`pagination-btn ${currentPage === num + 1 ? 'active' : ''}`}
                                    onClick={() => setCurrentPage(num + 1)}
                                    aria-label={`Go to page ${num + 1}`}
                                >
                                    {num + 1}
                                </button>
                            ))}
                            <button 
                                className="pagination-btn" 
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(currentPage + 1)}
                                aria-label="Go to next page"
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ gridColumn: '2' }}>
                    <div className="card-header" style={{ marginBottom: 0 }}>
                        <h3>Stock by Location</h3>
                    </div>
                    <div className="location-summary-list">
                        {locations.map(loc => (
                             <div 
                                key={loc.name} 
                                className={`location-summary-item interactive ${selectedLocation === loc.name ? 'selected-location' : ''}`}
                                onClick={() => handleLocationSelect(loc.name)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleLocationSelect(loc.name)}
                             >
                                <div className="location-summary-header">
                                    <span>{loc.name}</span>
                                    <span>{loc.qty} in stock</span>
                                </div>
                                <div className="location-progress-bar">
                                    <div 
                                        className="location-progress" 
                                        style={{ width: `${(loc.qty / (locations[0]?.qty || 1)) * 100}%`}}
                                    ></div>
                                </div>
                             </div>
                        ))}
                    </div>
                </div>
            </div>
    {showLowStockModal && renderLowStockModal()}
    </div>
    );
};

export default OnHandPage;