import React, { useState, useEffect } from 'react';
import { ExportIcon } from '../components/Icons';

import { getAllItems, getOnHandItems, getTransactions } from '../api';

const ExportReportPage = () => {
    const [allItems, setAllItems] = useState([]);
    const [onHandItems, setOnHandItems] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const [itemsData, onHandData, transData] = await Promise.all([
                    getAllItems(),
                    getOnHandItems(),
                    getTransactions(),
                ]);
                setAllItems(itemsData);
                setOnHandItems(onHandData);
                setTransactions(transData);
            } catch (err) {
                setError('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const exportToCsv = (data, filename = 'export.csv') => {
        if (!data || data.length === 0) {
            alert("No data available to export.");
            return;
        }

        const headers = Object.keys(data[0]);
        // Sanitize data for CSV export
        const replacer = (key, value) => value === null ? '' : value;
        const csvRows = data.map(row =>
            headers.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(',')
        );

        const csvString = [headers.join(','), ...csvRows].join('\r\n');
        
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleExportAllItems = () => {
        const itemsToExport = allItems.map(item => ({
            product_id: item.product_id,
            product_name: item.product_name,
            brand_id: item.brand_id,
            categories_id: item.categories_id,
            quantity: item.quantity,
            rate: item.rate,
            active: item.active,
            status: item.status,
            store: item.store, // Including extra info for context
        }));
        exportToCsv(itemsToExport, 'all-items-report.csv');
    };

    const handleExportOnHand = () => {
        exportToCsv(onHandItems, 'on-hand-stock-report.csv');
    };
    
    const handleExportTransactions = () => {
        exportToCsv(transactions, 'transaction-history-report.csv');
    };

    return (
        <div className="management-page">
            <div className="page-header">
                <h2>Export Reports</h2>
                <p>Download your inventory data in CSV format.</p>
            </div>

            <div className="management-summary-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                <div className="card">
                    <div className="card-header"><h3>All Items Report</h3></div>
                    <p style={{marginBottom: '1.5rem', color: 'var(--secondary-text)', minHeight: '60px'}}>
                        Export a comprehensive list of all items in the inventory, including details like model, store, quantity, and price.
                    </p>
                    <button className="btn btn-primary" onClick={handleExportAllItems} style={{width: '100%', gap: '8px'}}>
                        <ExportIcon /> Export All Items
                    </button>
                </div>

                <div className="card">
                    <div className="card-header"><h3>On-Hand Stock Report</h3></div>
                    <p style={{marginBottom: '1.5rem', color: 'var(--secondary-text)', minHeight: '60px'}}>
                        Export a snapshot of the current on-hand inventory, including quantities, locations, and expiry dates.
                    </p>
                    <button className="btn btn-primary" onClick={handleExportOnHand} style={{width: '100%', gap: '8px'}}>
                        <ExportIcon /> Export On-Hand Stock
                    </button>
                </div>

                <div className="card">
                    <div className="card-header"><h3>Transaction History</h3></div>
                    <p style={{marginBottom: '1.5rem', color: 'var(--secondary-text)', minHeight: '60px'}}>
                        A detailed log of all inventory movements, including stock in, stock out, and adjustments.
                    </p>
                    <button className="btn btn-primary" onClick={handleExportTransactions} style={{width: '100%', gap: '8px'}}>
                        <ExportIcon /> Export Transactions
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportReportPage;