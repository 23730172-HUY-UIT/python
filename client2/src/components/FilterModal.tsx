import React, { useState } from 'react';
import Modal from './Modal';

const FilterModal = ({ isOpen, onClose, onApply }) => {
    const [filters, setFilters] = useState({
        store: '',
        storeType: 'Office',
    });

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="small" titleId="filter-modal-title">
            <div className="filter-form">
                <h3 className="modal-title" id="filter-modal-title">Filter</h3>
                <div className="form-group">
                    <label>Store</label>
                    <select className="form-control" value={filters.store} onChange={e => setFilters({...filters, store: e.target.value})}>
                        <option value="">Select store</option>
                        <option value="HQ Main Store">HQ Main Store</option>
                        <option value="22 House Store">22 House Store</option>
                        <option value="Tafo House Store">Tafo House Store</option>
                    </select>
                </div>

                <div className="checkbox-group-vertical">
                    <div className="checkbox-group">
                        <input type="checkbox" id="hq-main-store" defaultChecked/>
                        <label htmlFor="hq-main-store">HQ Main Store</label>
                    </div>
                     <div className="checkbox-group">
                        <input type="checkbox" id="22-house-store" />
                        <label htmlFor="22-house-store">22 House Store</label>
                    </div>
                     <div className="checkbox-group">
                        <input type="checkbox" id="tafo-house-store" />
                        <label htmlFor="tafo-house-store">Tafo House Store</label>
                    </div>
                </div>

                <div className="form-group">
                    <label>Select store</label>
                    <div className="radio-group-horizontal">
                        <div className="radio-group">
                            <input type="radio" id="office" name="storeType" value="Office" checked={filters.storeType === 'Office'} onChange={e => setFilters({...filters, storeType: e.target.value})} />
                            <label htmlFor="office">Office</label>
                        </div>
                         <div className="radio-group">
                            <input type="radio" id="work-from-home" name="storeType" value="Work from Home" checked={filters.storeType === 'Work from Home'} onChange={e => setFilters({...filters, storeType: e.target.value})} />
                            <label htmlFor="work-from-home">Work from Home</label>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleApply}>Apply</button>
                </div>
            </div>
        </Modal>
    );
};

export default FilterModal;