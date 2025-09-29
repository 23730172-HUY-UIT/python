import React, { useState, useEffect } from 'react';
import { getItems } from '../api';
import Modal from './Modal';
import { TrashIcon } from './Icons';

// Note: The backend expects product_id, not name.
const emptyItem = { product_id: null, name: '', quantity: 1, price: 0 };

// Renamed 'customer' to 'client_name' for consistency with the database.
const initialFormData = {
    client_name: '',
    client_contact: '', // Added for NOT NULL constraint
    order_date: new Date().toISOString().split('T')[0],
    order_status: 'Pending', // Changed from 'status'
    items: [{...emptyItem}],
};


const AddOrderModal = ({ isOpen, onClose, onSave, orderToEdit }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [products, setProducts] = useState([]);
    const isEditMode = !!orderToEdit;

    // Fetch in-stock products for autocomplete
    useEffect(() => {
        if (isOpen) {
            getItems().then(items => {
                // Only show products with quantity > 0
                setProducts((items || []).filter(item => Number(item.quantity) > 0));
            });
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                // In a real app, you'd fetch the full order details
                // For now, we map what we have.
                setFormData({
                    ...initialFormData,
                    ...orderToEdit,
                    client_name: orderToEdit.client_name || '',
                    client_contact: orderToEdit.client_contact || '',
                    order_date: orderToEdit.order_date || new Date().toISOString().split('T')[0],
                    order_status: orderToEdit.order_status || 'Pending',
                    // The items would need to be mapped here as well
                });
            } else {
                setFormData(initialFormData);
            }
        }
    }, [orderToEdit, isOpen, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };


    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...formData.items];

        if (name === 'name') {
            const found = products.find(p => p.product_name === value);
            if (found) {
                // IMPORTANT: Store product_id along with other details
                newItems[index] = { product_id: found.product_id, name: found.product_name, quantity: 1, price: found.rate, locked: true };
            } else {
                // If cleared or not found, reset
                newItems[index] = { ...emptyItem, locked: false };
            }
        } else {
            newItems[index] = { ...newItems[index], [name]: value };
        }
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, {...emptyItem}]
        }));
    };
    
    const removeItem = (index) => {
        if (formData.items.length <= 1) return; // Keep at least one item
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const calculateTotal = () => {
        return formData.items.reduce((total, item) => {
            const quantity = parseFloat(String(item.quantity)) || 0;
            const price = parseFloat(String(item.price)) || 0;
            return total + (quantity * price);
        }, 0).toFixed(2);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Filter out items that don't have a product_id
        const validItems = formData.items.filter(item => item.product_id != null);
        if (validItems.length !== formData.items.length) {
            alert('Please make sure all items are selected from the product list.');
            return;
        }

        // TODO: Add user_id from global state/context before saving
        // For example: const userId = useAuth().user.id;
        const dataToSave = {
            ...formData,
            items: validItems,
            user_id: 1, // FIXME: Replace with actual logged-in user ID
            
            // The backend likely calculates these, but we send defaults to satisfy NOT NULL.
            sub_total: calculateTotal(),
            total_amount: calculateTotal(), // Simplified, VAT etc. should be handled
            grand_total: calculateTotal(), // Simplified
            payment_type: 1, // Default to 'Cash' or first option
            payment_status: 2, // Default to 'Due'
            payment_place: 1, // Default to first option
            paid: 0,
            due: calculateTotal(),
            vat: 0, // Simplified
            discount: 0, // Simplified
        };

        onSave(dataToSave);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} titleId="order-modal-title">
            <form onSubmit={handleSubmit} className="add-item-form">
                <h3 className="modal-title" id="order-modal-title">{isEditMode ? `Edit Order #${orderToEdit?.id}` : 'Create New Order'}</h3>

                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="client_name">Customer Name *</label>
                        <input type="text" id="client_name" name="client_name" placeholder="Enter customer name" className="form-control" required value={formData.client_name} onChange={handleChange}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="client_contact">Customer Contact *</label>
                        <input type="text" id="client_contact" name="client_contact" placeholder="Enter contact number" className="form-control" required value={formData.client_contact} onChange={handleChange}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="order_date">Order Date *</label>
                        <input type="date" id="order_date" name="order_date" className="form-control" required value={formData.order_date} onChange={handleChange}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="order_status">Status *</label>
                        <select id="order_status" name="order_status" className="form-control" required value={formData.order_status} onChange={handleChange}>
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Canceled">Canceled</option>
                        </select>
                    </div>

                    <div className="form-group full-width">
                        <label>Order Items</label>
                        {formData.items.map((item, index) => (
                            <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Search and select a product..."
                                    className="form-control"
                                    style={{flex: 3}}
                                    value={item.name}
                                    onChange={e => handleItemChange(index, e)}
                                    list={`product-list-${index}`}
                                    required
                                    autoComplete="off"
                                    readOnly={item.locked}
                                    onFocus={e => { if (item.locked) e.target.blur(); }}
                                />
                                <datalist id={`product-list-${index}`}>
                                    {products.map((p) => (
                                        <option key={p.product_id} value={p.product_name} />
                                    ))}
                                </datalist>
                                <input type="number" name="quantity" placeholder="Qty" className="form-control" style={{flex: 1}} value={item.quantity} onChange={(e) => handleItemChange(index, e)} required min="1" />
                                <input type="number" name="price" placeholder="Price" className="form-control" style={{flex: 1}} value={item.price} readOnly onChange={(e) => handleItemChange(index, e)} required min="0" step="0.01" />
                                <button type="button" className="action-btn delete" onClick={() => removeItem(index)} aria-label="Remove item" disabled={formData.items.length <= 1}>
                                    <TrashIcon />
                                </button>
                            </div>
                        ))}
                         <button type="button" className="btn btn-secondary" onClick={addItem} style={{marginTop: '0.5rem', width: 'auto', padding: '0.5rem 1rem'}}>
                            Add Item
                        </button>
                    </div>
                    
                    <div className="form-group full-width" style={{textAlign: 'right'}}>
                        <h4>Total: ${calculateTotal()}</h4>
                    </div>
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button type="submit" className="btn btn-primary">{isEditMode ? 'Save Changes' : 'Create Order'}</button>
                </div>
            </form>
        </Modal>
    );
};

export default AddOrderModal;
