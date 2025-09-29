import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const AddItemModal = ({ isOpen, onClose, onSave, itemToEdit, brands, categories }) => {
    const isEditMode = !!itemToEdit;

    const getInitialFormData = () => ({
        product_name: '',
        product_image: '',
        brand_id: brands.length > 0 ? brands[0].id : '',
        categories_id: categories.length > 0 ? categories[0].id : '',
        quantity: 0,
        minStock: 0,
        unit: 'pcs',
        store: 'Main Warehouse',
        rate: 0,
        active: 1,
        status: 1,
    });

    const [formData, setFormData] = useState(getInitialFormData());

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && itemToEdit) {
                setFormData({
                    product_name: itemToEdit.product_name || '',
                    product_image: itemToEdit.product_image || '',
                    product_id: itemToEdit.product_id,
                    brand_id: itemToEdit.brand_id || (brands.length > 0 ? brands[0].id : ''),
                    categories_id: itemToEdit.categories_id || (categories.length > 0 ? categories[0].id : ''),
                    quantity: itemToEdit.quantity || 0,
                    minStock: itemToEdit.minStock || 0,
                    unit: itemToEdit.unit || 'pcs',
                    store: itemToEdit.store || 'Main Warehouse',
                    rate: itemToEdit.rate || 0,
                    active: itemToEdit.active !== undefined ? itemToEdit.active : 1,
                    status: itemToEdit.status !== undefined ? itemToEdit.status : 1,
                });
            } else {
                setFormData(getInitialFormData());
            }
        }
    }, [itemToEdit, isOpen, isEditMode, brands, categories]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const numericFields = ['brand_id', 'categories_id', 'quantity', 'rate', 'active', 'status', 'minStock'];
        let finalValue;

        if (numericFields.includes(name)) {
            finalValue = value === '' ? '' : Number(value);
        } else {
            finalValue = value;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : finalValue
        }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSave = { ...formData };

        dataToSave.quantity = Number(dataToSave.quantity) || 0;
        dataToSave.rate = Number(dataToSave.rate) || 0;
        dataToSave.minStock = Number(dataToSave.minStock) || 0;

        if (!isEditMode) {
            delete dataToSave.product_id;
        }
        
        onSave(dataToSave);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} titleId="item-modal-title">
            <form onSubmit={handleSubmit} className="add-item-form">
                <h3 className="modal-title" id="item-modal-title">{isEditMode ? 'Edit Item' : 'Add New Item'}</h3>
                <div className="form-grid">
                    {isEditMode && (
                        <div className="form-group full-width">
                            <label htmlFor="product_id">Product ID</label>
                            <input type="text" id="product_id" name="product_id" className="form-control" readOnly value={formData.product_id || ''} />
                        </div>
                    )}
                    <div className="form-group full-width">
                        <label htmlFor="product_name">Product Name *</label>
                        <input type="text" id="product_name" name="product_name" placeholder="Enter product name" className="form-control" required value={formData.product_name} onChange={handleChange}/>
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="product_image">Product Image URL</label>
                        <input type="text" id="product_image" name="product_image" placeholder="Enter image URL" className="form-control" value={formData.product_image} onChange={handleChange}/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="categories_id">Category *</label>
                        <select id="categories_id" name="categories_id" className="form-control" required value={formData.categories_id} onChange={handleChange}>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="brand_id">Brand *</label>
                        <select id="brand_id" name="brand_id" className="form-control" required value={formData.brand_id} onChange={handleChange}>
                            {brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="quantity">Quantity *</label>
                        <input type="number" id="quantity" name="quantity" placeholder="e.g. 10" className="form-control" required value={formData.quantity} onChange={handleChange} min="0" />
                    </div>
                     <div className="form-group">
                        <label htmlFor="minStock">Min. Stock Level *</label>
                        <input type="number" id="minStock" name="minStock" placeholder="e.g. 5" className="form-control" required value={formData.minStock} onChange={handleChange} min="0" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="rate">Rate (Price) *</label>
                        <input type="number" id="rate" name="rate" placeholder="e.g. 99.99" className="form-control" required value={formData.rate} onChange={handleChange} min="0" step="0.01" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="unit">Unit *</label>
                        <input type="text" id="unit" name="unit" placeholder="e.g. pcs, kg, box" className="form-control" required value={formData.unit} onChange={handleChange}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="store">Store Location</label>
                        <input type="text" id="store" name="store" placeholder="e.g. Main Warehouse" className="form-control" value={formData.store} onChange={handleChange}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="active">Active Status *</label>
                        <select id="active" name="active" className="form-control" required value={formData.active} onChange={handleChange}>
                            <option value={1}>Active</option>
                            <option value={0}>Inactive</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="status">Availability Status *</label>
                        <select id="status" name="status" className="form-control" required value={formData.status} onChange={handleChange}>
                            <option value={1}>Available</option>
                            <option value={0}>Unavailable</option>
                        </select>
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button type="submit" className="btn btn-primary">{isEditMode ? 'Save Changes' : 'Add Product'}</button>
                </div>
            </form>
        </Modal>
    );
};

export default AddItemModal;