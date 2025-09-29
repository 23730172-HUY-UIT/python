import React, { useState, useMemo, useEffect } from 'react';
import { getTransactions } from '../api';
import { SearchIcon } from '../components/Icons';

const getStatusBadgeClass = (type) => {
    switch (type) {
        case 'Import':
            return 'delivered'; // green
        case 'Export':
            return 'shipped'; // blue
        case 'Move':
            return 'pending'; // yellow
        default:
            return 'inactive'; // gray
    }
};

const TransactionPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);

    useEffect(() => {
        setLoading(true);
        getTransactions()
            .then((data) => {
                setTransactions(data);
                setLoading(false);
            })
            .catch((err) => {
                setError('Failed to load transactions');
                setLoading(false);
            });
    }, []);

    const filteredTransactions = useMemo(() => {
        let filtered = transactions;
        if (searchTerm.trim()) {
            const lowercasedTerm = searchTerm.toLowerCase();
            filtered = transactions.filter(t =>
                (t.entity_type && t.entity_type.toLowerCase().includes(lowercasedTerm)) ||
                (t.action_type && t.action_type.toLowerCase().includes(lowercasedTerm)) ||
                (t.description && t.description.toLowerCase().includes(lowercasedTerm)) ||
                (t.entity_id && String(t.entity_id).toLowerCase().includes(lowercasedTerm)) ||
                (t.id && String(t.id).toLowerCase().includes(lowercasedTerm))
            );
        }
        // Sort by id ASC (từ bé đến lớn)
        return [...filtered].sort((a, b) => Number(a.id) - Number(b.id));
    }, [transactions, searchTerm]);
    
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (loading) return <div>Loading transactions...</div>;
    if (error) return <div style={{color:'red'}}>{error}</div>;
    return (
        <div className="items-page">
            <div className="page-header">
                <h2>Transaction Log (Audit)</h2>
                <p>All system actions (create, update, delete) are recorded here for audit purposes.</p>
            </div>
            <div className="card items-table-card">
                <div className="items-table-toolbar">
                    <div className="search-bar-items" style={{width: '100%', maxWidth: '500px'}}>
                        <SearchIcon />
                        <input
                            type="text"
                            placeholder="Search by entity, action, description, or ID..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Time</th>
                            <th>User</th>
                            <th>Action</th>
                            <th>Entity</th>
                            <th>Entity ID</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedTransactions.map(t => (
                            <tr key={t.id}>
                                <td>{t.id}</td>
                                <td>{t.created_at ? new Date(t.created_at).toLocaleString() : ''}</td>
                                <td>{t.user_id || ''}</td>
                                <td>{t.action_type}</td>
                                <td>{t.entity_type}</td>
                                <td>{t.entity_id}</td>
                                <td>{t.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="pagination">
                    <div className="pagination-info">
                        Showing 
                        <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                            <option value="15">15</option>
                            <option value="30">30</option>
                            <option value="50">50</option>
                        </select> 
                         &nbsp;to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} records
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
        </div>
    );
};

export default TransactionPage;