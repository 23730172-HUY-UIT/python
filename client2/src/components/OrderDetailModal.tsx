import React from 'react';

const OrderDetailModal = ({ isOpen, onClose, order }) => {
    if (!isOpen || !order) return null;

    return (
        <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.25)', zIndex: 1000 }}>
            <div
                className="modal order-detail-modal"
                style={{
                    background: '#fff',
                    borderRadius: '18px',
                    boxShadow: '0 8px 32px rgba(60,60,100,0.18)',
                    maxWidth: 520,
                    margin: '60px auto',
                    padding: '2.5rem 2rem',
                    position: 'relative',
                    minWidth: 340,
                    color: '#222',
                    fontFamily: 'inherit',
                }}
            >
                <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 22, margin: 0 }}>Order Details <span style={{ color: '#888', fontWeight: 400, fontSize: 16 }}>#{order.order_id}</span></h3>
                    <button className="close-btn" onClick={onClose} style={{ fontSize: 28, background: 'none', border: 'none', color: '#888', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
                </div>
                <div className="modal-body" style={{ fontSize: 16 }}>
                    <div style={{ marginBottom: 8 }}><strong>Customer:</strong> <span style={{ color: '#2a2a2a' }}>{order.client_name}</span></div>
                    <div style={{ marginBottom: 8 }}><strong>Date:</strong> <span style={{ color: '#2a2a2a' }}>{order.order_date ? new Date(order.order_date).toLocaleDateString() : ''}</span></div>
                    <div style={{ marginBottom: 18 }}><strong>Status:</strong> <span style={{ color: '#2a2a2a' }}>{order.order_status}</span></div>
                    <h4 style={{marginTop: '1rem', marginBottom: 10, fontWeight: 600, fontSize: 18}}>Order Items</h4>
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', background: '#fafbfc', borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
                        <thead>
                            <tr style={{ background: '#f3f4f8', color: '#444' }}>
                                <th style={{ padding: '8px 10px', fontWeight: 600, fontSize: 15, borderBottom: '1px solid #e0e0e0' }}>Product</th>
                                <th style={{ padding: '8px 10px', fontWeight: 600, fontSize: 15, borderBottom: '1px solid #e0e0e0' }}>Quantity</th>
                                <th style={{ padding: '8px 10px', fontWeight: 600, fontSize: 15, borderBottom: '1px solid #e0e0e0' }}>Price</th>
                                <th style={{ padding: '8px 10px', fontWeight: 600, fontSize: 15, borderBottom: '1px solid #e0e0e0' }}>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items && order.items.length > 0 ? order.items.map((item, idx) => (
                                <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f7f8fa' }}>
                                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f0f0f0' }}>{item.product_name}</td>
                                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f0f0f0', textAlign: 'right' }}>${parseFloat(item.rate).toFixed(2)}</td>
                                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f0f0f0', textAlign: 'right' }}>${(parseFloat(item.rate) * item.quantity).toFixed(2)}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} style={{ textAlign: 'center', color: '#aaa', padding: 16 }}>No items</td></tr>
                            )}
                        </tbody>
                    </table>
                    <div style={{textAlign: 'right', marginTop: '1rem', fontSize: 18}}>
                        <strong>Total: <span style={{ color: '#1976d2' }}>${order.grand_total}</span></strong>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;
