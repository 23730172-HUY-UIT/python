import React, { useEffect, useState } from 'react';
import { SummaryIcon1, SummaryIcon2, SummaryIcon3, SummaryIcon4, PackageCheckIcon, AlertTriangleIcon } from '../components/Icons';
import { getDashboardData } from '../api';

const renderTableRows = (data) => data.map((item, index) => (
    <tr key={index}>
        <td>{item.name}</td>
        <td>{item.product_id || item.id}</td>
        <td>{item.store}</td>
        <td>{item.amount}</td>
    </tr>
));

const DashboardContent = ({ lowStockItems = [], onNavigate }) => {
    const [data, setData] = useState({
        onhands: [],
        orders: [],
        users: [],
        brands: [],
        categories: [],
        issues: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const d = await getDashboardData();
                setData({
                    onhands: d.onhands || [],
                    orders: d.orders || [],
                    users: d.users || [],
                    brands: d.brands || [],
                    categories: d.categories || [],
                    issues: d.issues || []
                });
            } catch (err) {
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const { onhands, orders, users, brands, categories, issues } = data;
    const itemListData = onhands.slice(0, 4).map(item => ({
        name: item.product_name,
        product_id: item.product_id || item.id,
        store: item.store,
        amount: `${item.quantity} pcs`,
    }));
    // Lấy danh sách order urgent hoặc order mới nhất
    let urgentOrders = orders.filter(o => o.urgent === 1);
    let orderListData = urgentOrders.length > 0
        ? urgentOrders.slice(0, 4)
        : orders.slice(0, 4);
    const totalQuantityInHand = onhands.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
    const totalItems = onhands.length;
    const totalCategories = categories.length;
    const totalBrands = brands.length;
    const totalUsers = users.length;
    const totalIssues = issues.length;
    const totalOrders = orders.length;
    const readyToShip = onhands.filter(item => String(item.status) === '1').length;
    const toBeReceived = onhands.filter(item => String(item.status) === '0').length;

    if (loading) return <div style={{textAlign:'center',padding:'2rem'}}>Loading dashboard...</div>;
    if (error) return <div style={{textAlign:'center',padding:'2rem'}}>{error}</div>;

    // Tính toán lowStockItems từ dữ liệu thực tế nếu không truyền vào
    const lowStock = lowStockItems.length > 0 ? lowStockItems : onhands.filter(item => item.quantity <= (item.minStock || 0));

    return (
        <div className="dashboard-content-wrapper">
            {lowStock && lowStock.length > 0 &&
                <section className="card low-stock-alert-card">
                    <div className="card-header">
                        <h3><AlertTriangleIcon /> Low Stock Alerts</h3>
                        <a href="#" className="view-all-link" onClick={(e) => { e.preventDefault(); onNavigate('Items', 'low-stock'); }}>View All</a>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Current Stock</th>
                                <th>Min. Stock</th>
                                <th>Location</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lowStock.slice(0, 3).map(item => (
                                <tr key={item.product_id}>
                                    <td>{item.product_name}</td>
                                    <td>{item.quantity} {item.unit}</td>
                                    <td>{item.minStock} {item.unit}</td>
                                    <td>{item.store}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            }
            <div className="dashboard-grid">
                <section className="card item-list-card">
                    <div className="card-header">
                        <h3>Item List</h3>
                        <a href="#" className="view-all-link" onClick={(e) => { e.preventDefault(); onNavigate('Items'); }}>View All</a>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr><th>Item Name</th><th>ID</th><th>Store</th><th>Amount</th></tr>
                        </thead>
                        <tbody>{renderTableRows(itemListData)}</tbody>
                    </table>
                </section>
                <section className="card order-list-card">
                    <div className="card-header">
                        <h3>Order List</h3>
                        <a href="#" className="view-all-link" onClick={(e) => { e.preventDefault(); onNavigate('Orders'); }}>View All</a>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr><th>Order Code</th><th>Customer</th><th>Status</th><th>Created</th></tr>
                        </thead>
                        <tbody>
                            {orderListData.map(order => (
                                <tr key={order.order_id}>
                                    <td>{order.order_code || order.order_id}</td>
                                    <td>{order.customer_name || order.customer || '-'}</td>
                                    <td>{order.status || '-'}</td>
                                    <td>{order.created_at ? new Date(order.created_at).toLocaleString() : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
                <section className="card item-summary-card">
                   <div className="card-header"><h3>Item Summary</h3></div>
                    <div className="summary-grid">
                        <div className="summary-item">
                            <div className="summary-icon bg-orange"><SummaryIcon1 /></div>
                            <div className="summary-info"><strong>{totalQuantityInHand}</strong><span>Quantity in Hand</span></div>
                        </div>
                        <div className="summary-item">
                            <div className="summary-icon bg-purple"><SummaryIcon2 /></div>
                            <div className="summary-info"><strong>{toBeReceived}</strong><span>To be received</span></div>
                        </div>
                    </div>
                </section>
                <section className="card product-summary-card">
                    <div className="card-header"><h3>Product Summary</h3></div>
                    <div className="summary-grid">
                        <div className="summary-item">
                            <div className="summary-icon bg-cyan"><SummaryIcon3 /></div>
                            <div className="summary-info"><strong>{totalBrands}</strong><span>Number of Brands</span></div>
                        </div>
                        <div className="summary-item">
                            <div className="summary-icon bg-pink"><SummaryIcon4 /></div>
                            <div className="summary-info"><strong>{totalCategories}</strong><span>Number of Categories</span></div>
                        </div>
                    </div>
                </section>
                 <section className="card total-items-card">
                    <div className="card-header"><h3>Total items</h3></div>
                    <div className="summary-grid">
                        <div className="summary-item">
                            <div className="summary-icon bg-cyan"><SummaryIcon3 /></div>
                            <div className="summary-info"><strong>{totalItems}</strong><span>Total Number of Items</span></div>
                        </div>
                        <div className="summary-item">
                            <div className="summary-icon bg-green"><PackageCheckIcon /></div>
                            <div className="summary-info"><strong>{readyToShip}</strong><span>Ready to Ship</span></div>
                        </div>
                    </div>
                </section>
                 <section className="card total-assets-card">
                    <div className="card-header"><h3>Total assets</h3></div>
                    <div className="summary-grid">
                       <div className="summary-item">
                            <div className="summary-icon bg-cyan"><SummaryIcon3 /></div>
                            <div className="summary-info"><strong>{totalItems}</strong><span>Total Number of assets</span></div>
                        </div>
                        <div className="summary-item">
                            <div className="summary-icon bg-pink"><SummaryIcon2 /></div>
                            <div className="summary-info"><strong>{toBeReceived}</strong><span>To be received</span></div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
export default DashboardContent;