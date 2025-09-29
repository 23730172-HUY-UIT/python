
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SearchIcon, EditIcon, TrashIcon } from '../components/Icons';
import AddOrderModal from '../components/AddOrderModal';
import OrderDetailModal from '../components/OrderDetailModal';
import { getOrders, createOrder, updateOrder, deleteOrder as apiDeleteOrder, createTransaction } from '../api';

const getOrderStatusDisplay = (status) => {
    switch (status) {
        case "0": // Assuming status might come as string from DB
            return { text: 'Pending', className: 'status-pending' };
        case "1":
            return { text: 'Paid', className: 'status-paid' };
        case "2":
            return { text: 'Unpaid', className: 'status-unpaid' };
        case "3":
            return { text: 'Delivered', className: 'status-delivered' };
        case "4":
            return { text: 'Stuck', className: 'status-stuck' };
        case "5":
            return { text: 'Preparing', className: 'status-preparing' };
        default:
            return { text: 'Unknown', className: 'status-unknown' };
    }
};

const OrderManagementPage = () => {
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [detailOrder, setDetailOrder] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const handleOpenDetailModal = (order) => {
        setDetailOrder(order);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setDetailOrder(null);
    };
    const actionButtonRef = useRef(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await getOrders();
            setOrders(data);
        } catch (err) {
            setError('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchOrders();
    }, []);

    const handleOpenAddModal = () => {
        actionButtonRef.current = document.activeElement;
        setEditingOrder(null);
        setIsOrderModalOpen(true);
    };

    const handleOpenEditModal = (order) => {
        actionButtonRef.current = document.activeElement;
        setEditingOrder(order);
        setIsOrderModalOpen(true);
    };
    
    const handleDeleteOrder = async (orderId) => {
        if(window.confirm('Are you sure you want to delete this order?')) {
            const orderToDelete = orders.find(o => o.order_id === orderId);
            await apiDeleteOrder(orderId);
            await createTransaction({
                user_id: null, // FIXME: Add real user ID
                action_type: 'delete',
                entity_type: 'order',
                entity_id: orderId,
                data_before: orderToDelete, // Log the deleted order data
                data_after: null,
                description: `Deleted order ${orderId}`
            });
            fetchOrders();
        }
    };

    const handleCloseModal = () => {
        setIsOrderModalOpen(false);
        if (actionButtonRef.current) {
            actionButtonRef.current.focus();
        }
    };

    const handleSaveOrder = async (orderData) => {
        if (editingOrder) {
            const dataBefore = orders.find(o => o.order_id === editingOrder.order_id);
            await updateOrder({ ...editingOrder, ...orderData, order_id: editingOrder.order_id });
            await createTransaction({
                user_id: null, // FIXME: Add real user ID
                action_type: 'update',
                entity_type: 'order',
                entity_id: editingOrder.order_id,
                data_before: dataBefore,
                data_after: { ...editingOrder, ...orderData },
                description: `Updated order ${editingOrder.order_id}`
            });
        } else {
            const res = await createOrder(orderData);
            const newId = res?.order?.order_id || res?.order_id || 'unknown';
            await createTransaction({
                user_id: null, // FIXME: Add real user ID
                action_type: 'create',
                entity_type: 'order',
                entity_id: newId,
                data_before: null,
                data_after: { ...orderData, order_id: newId },
                description: `Created order ${newId}`
            });
        }
        fetchOrders();
    };

    const filteredOrders = useMemo(() => {
        let tempOrders = orders;

        if (activeFilter !== 'all') {
            tempOrders = tempOrders.filter(order => order.tag === activeFilter);
        }

        return tempOrders.filter(order => 
            (order.order_id && order.order_id.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.client_name && order.client_name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [orders, searchTerm, activeFilter]);

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="items-page">
            <AddOrderModal
                isOpen={isOrderModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveOrder}
                orderToEdit={editingOrder}
            />
            <OrderDetailModal
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                order={detailOrder}
            />

            <div className="page-header">
                <h2>Order Management</h2>
                <p>Manage all your orders in one place.</p>
            </div>

            <div className="card items-table-card">
                 <div className="order-filter-bar">
                    <button onClick={() => setActiveFilter('all')} className={activeFilter === 'all' ? 'active' : ''}>All Orders</button>
                    <button onClick={() => setActiveFilter('urgent')} className={activeFilter === 'urgent' ? 'active' : ''}>Urgent</button>
                    <button onClick={() => setActiveFilter('at-risk')} className={activeFilter === 'at-risk' ? 'active' : ''}>At Risk</button>
                    <button onClick={() => setActiveFilter('stuck')} className={activeFilter === 'stuck' ? 'active'.toLowerCase() : ''}>Stuck</button>
                    <button onClick={() => setActiveFilter('ready')} className={activeFilter === 'ready' ? 'active' : ''}>Ready for Shipping</button>
                </div>
                <div className="items-table-toolbar">
                    <div className="search-bar-items">
                         <SearchIcon />
                        <input 
                            type="text" 
                            placeholder="Search by Order ID or Customer" 
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <div className="items-table-actions">
                         <button className="btn btn-primary" onClick={handleOpenAddModal}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Create New Order
                        </button>
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th><input type="checkbox" /></th>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Order Date</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedOrders.map((order, idx) => (
                            <tr key={order.order_id || idx} style={{ cursor: 'pointer' }} onClick={e => {
                                // Only open detail if not clicking an action button
                                if (!(e.target.closest('.action-btn'))) {
                                    handleOpenDetailModal(order);
                                }
                            }}>
                                <td><input type="checkbox" /></td>
                                <td>{order.order_id}</td>
                                <td>{order.client_name}</td>
                                <td>{order.order_date ? new Date(order.order_date).toLocaleDateString() : ''}</td>
                                <td>${order.grand_total}</td>
                                <td>
                                    <span className={`status-badge ${getOrderStatusDisplay(order.order_status).className}`}>
                                        {getOrderStatusDisplay(order.order_status).text}
                                    </span>
                                </td>
                                <td>
                                    <button 
                                      className="action-btn" 
                                      aria-label={`Edit ${order.order_id}`}
                                      onClick={e => { e.stopPropagation(); handleOpenEditModal(order); }}
                                    >
                                        <EditIcon />
                                    </button>
                                    <button 
                                      className="action-btn delete" 
                                      aria-label={`Delete ${order.order_id}`}
                                      onClick={e => { e.stopPropagation(); handleDeleteOrder(order.order_id); }}
                                    >
                                        <TrashIcon />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <div className="pagination">
                    <div className="pagination-info">
                        Showing 
                        <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="25">25</option>
                        </select> 
                         &nbsp;to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} records
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

export default OrderManagementPage;