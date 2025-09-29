import React, { useState, useMemo, useEffect } from 'react';
import { PackageCheckIcon, ArchiveBoxIcon, EditIcon, TrashIcon } from '../components/Icons';

import { getBrands, getItems, createBrand, updateBrand, deleteBrand, createTransaction } from '../api';

const BrandPage = () => {
    const [brands, setBrands] = useState([]);
    const [brandForm, setBrandForm] = useState({ brand_id: '', brand_name: '' });
    const [editingBrand, setEditingBrand] = useState(null);
    const [formError, setFormError] = useState('');
    const [items, setItems] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [brandsData, itemsData] = await Promise.all([
                getBrands(),
                getItems(),
            ]);
            setBrands(brandsData);
            setItems(itemsData);
        } catch (err) {
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchAll();
    }, []);

    const handleInputChange = (e) => {
        setBrandForm({ ...brandForm, [e.target.name]: e.target.value });
        setFormError('');
    };

    const handleEditBrand = (brand) => {
        setEditingBrand(brand);
        setBrandForm({ brand_id: brand.brand_id, brand_name: brand.brand_name });
        setFormError('');
    };

    const handleDeleteBrand = async (brand) => {
        if (!window.confirm(`Delete brand "${brand.brand_name}"?`)) return;
        // Lấy dữ liệu trước khi xóa
        const dataBefore = { ...brand };
        const res = await deleteBrand(brand.brand_id);
        if (res && res.success) {
            await createTransaction({
                user_id: null, // Có thể lấy từ localStorage nếu có user đăng nhập
                action_type: 'delete',
                entity_type: 'brand',
                entity_id: brand.brand_id,
                data_before: dataBefore,
                data_after: null,
                description: `Deleted brand ${brand.brand_name}`
            });
            fetchAll();
        } else {
            setFormError(res && res.message ? res.message : 'Delete failed');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!brandForm.brand_name.trim()) {
            setFormError('Brand name is required');
            return;
        }
        // Kiểm tra trùng tên brand (không phân biệt hoa thường)
        const nameLower = brandForm.brand_name.trim().toLowerCase();
        const isDuplicate = brands.some(b => b.brand_name.trim().toLowerCase() === nameLower && (!editingBrand || b.brand_id !== editingBrand.brand_id));
        if (isDuplicate) {
            setFormError('Brand name already exists');
            return;
        }
        if (editingBrand) {
            // Lấy dữ liệu trước khi update
            const oldBrand = brands.find(b => b.brand_id === brandForm.brand_id);
            const res = await updateBrand({ brand_id: brandForm.brand_id, brand_name: brandForm.brand_name, brand_active: 1, brand_status: 1 });
            if (res && res.success) {
                await createTransaction({
                    user_id: null,
                    action_type: 'update',
                    entity_type: 'brand',
                    entity_id: brandForm.brand_id,
                    data_before: oldBrand,
                    data_after: { ...oldBrand, brand_name: brandForm.brand_name },
                    description: `Updated brand ${brandForm.brand_id}`
                });
                setBrandForm({ brand_id: '', brand_name: '' });
                setEditingBrand(null);
                fetchAll();
            } else {
                setFormError(res && res.message ? res.message : 'Update failed');
            }
        } else {
            const res = await createBrand({ brand_name: brandForm.brand_name, brand_active: 1, brand_status: 1 });
            if (res && res.success) {
                await createTransaction({
                    user_id: null,
                    action_type: 'create',
                    entity_type: 'brand',
                    entity_id: res.brand_id || null,
                    data_before: null,
                    data_after: { brand_name: brandForm.brand_name },
                    description: `Created brand ${brandForm.brand_name}`
                });
                setBrandForm({ brand_id: '', brand_name: '' });
                setEditingBrand(null);
                fetchAll();
            } else {
                setFormError(res && res.message ? res.message : 'Create failed');
            }
        }
    };

    const handleCancel = () => {
        setBrandForm({ brand_id: '', brand_name: '' });
        setEditingBrand(null);
        setFormError('');
    };

    const brandsData = useMemo(() => {
        const brandsMap = new Map();
        brands.forEach(b => {
            brandsMap.set(b.brand_id, { brand_name: b.brand_name, items: [], productTypes: new Set() });
        });
        items.forEach(item => {
            const brandInfo = brandsMap.get(item.brand_id);
            if (brandInfo) {
                brandInfo.items.push(item);
                brandInfo.productTypes.add(item.product_name);
            }
        });
        return Array.from(brandsMap.values()).map(data => ({
            brand_name: data.brand_name,
            totalItems: data.items.length,
            productTypeCount: data.productTypes.size,
            items: data.items,
        }));
    }, [items, brands]);

    if (selectedBrand) {
        const brand = brandsData.find(b => b.brand_name === selectedBrand);
        return (
            <div className="items-page">
                <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                        <h2>Items for {selectedBrand}</h2>
                        <p>Detailed list of items from this brand.</p>
                    </div>
                    <button className="btn btn-secondary" onClick={() => setSelectedBrand(null)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path></svg>
                        Back to Brands
                    </button>
                </div>
                <div className="card items-table-card">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Image</th>
                                <th>Store</th>
                                <th>Quantity</th>
                                <th>Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {brand.items.map(item => (
                                <tr key={item.product_id}>
                                    <td>{item.product_name}</td>
                                    <td>{item.product_id}</td>
                                    <td>{item.store}</td>
                                    <td>{item.quantity}</td>
                                    <td>${Number(item.rate).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="management-page">
            <div className="page-header">
                <h2>Brands Overview</h2>
                <p>Summary of all brands and their products in the inventory.</p>
            </div>
            <div className="card" style={{marginBottom: '2rem', maxWidth: 440, boxShadow: '0 2px 12px #0001', borderRadius: 12, padding: 24}}>
                <form onSubmit={handleSubmit}>
                    <div style={{display:'flex', gap:12, alignItems:'center'}}>
                        <input
                            type="text"
                            name="brand_name"
                            value={brandForm.brand_name}
                            onChange={handleInputChange}
                            placeholder="Brand name"
                            style={{
                                flex:1,
                                fontSize: '1.1rem',
                                padding: '12px 16px',
                                border: '1.5px solid #d0d7de',
                                borderRadius: 8,
                                outline: 'none',
                                transition: 'border 0.2s, box-shadow 0.2s',
                                boxShadow: '0 1px 4px #0001',
                                background: '#f9fafb',
                            }}
                            onFocus={e => e.target.style.border = '#0d6efd 2px solid'}
                            onBlur={e => e.target.style.border = '#d0d7de 1.5px solid'}
                        />
                        <button className="btn btn-primary brand-form-btn" type="submit">
                            {editingBrand ? 'Update' : 'Add'}
                        </button>
                        {editingBrand && (
                            <button className="btn btn-secondary brand-form-btn" type="button" onClick={handleCancel}>Cancel</button>
                        )}
                    </div>
                    {formError && <div style={{color:'#d32f2f',marginTop:6, fontSize:'0.97rem'}}>{formError}</div>}
                </form>
            </div>
            <style>{`
                .brand-form-btn {
                    min-width: 70px;
                    padding: 7px 14px;
                    font-size: 1rem;
                    border-radius: 7px;
                    box-shadow: 0 1px 4px #0001;
                    transition: background 0.18s, color 0.18s, box-shadow 0.18s, border 0.18s;
                }
                .btn.btn-primary.brand-form-btn {
                    background: linear-gradient(90deg, #0d6efd 60%, #3b82f6 100%);
                    border: none;
                    color: #fff;
                }
                .btn.btn-primary.brand-form-btn:hover {
                    background: linear-gradient(90deg, #2563eb 60%, #0d6efd 100%);
                    box-shadow: 0 2px 8px #0d6efd22;
                }
                .btn.btn-secondary.brand-form-btn {
                    background: #f3f4f6;
                    color: #222;
                    border: 1.5px solid #d0d7de;
                }
                .btn.btn-secondary.brand-form-btn:hover {
                    background: #e5e7eb;
                    color: #0d6efd;
                    border: 1.5px solid #0d6efd;
                }
                input:focus {
                    border: 2px solid #0d6efd !important;
                    background: #fff;
                    box-shadow: 0 2px 8px #0d6efd22;
                }
            `}</style>
            <div className="management-summary-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {brandsData.map(brand => (
                    <div className="card" key={brand.brand_name + brand.totalItems}>
                        <div className="card-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                            <h3 style={{margin:0}}>{brand.brand_name}</h3>
                            <div style={{display:'flex',gap:4}}>
                                <button className="icon-btn" title="Edit" style={{marginRight:4}} onClick={() => handleEditBrand(brands.find(b=>b.brand_name===brand.brand_name))}>
                                    <EditIcon />
                                </button>
                                <button className="icon-btn" title="Delete" onClick={() => handleDeleteBrand(brands.find(b=>b.brand_name===brand.brand_name))}>
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                        <div className="summary-grid" style={{ gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                             <div className="summary-item">
                                <div className="summary-icon bg-cyan"><PackageCheckIcon /></div>
                                <div className="summary-info"><strong>{brand.productTypeCount}</strong><span>Product Types</span></div>
                            </div>
                            <div className="summary-item">
                                <div className="summary-icon bg-green"><ArchiveBoxIcon /></div>
                                <div className="summary-info"><strong>{brand.totalItems}</strong><span>Total Items</span></div>
                            </div>
                        </div>
                         <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setSelectedBrand(brand.brand_name)}>
                            View Items
                        </button>
                    </div>
                ))}
            </div>
            <style>{`
                .icon-btn {
                    background: none;
                    border: none;
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: background 0.15s;
                }
                .icon-btn:hover {
                    background: #f0f0f0;
                }
            `}</style>
        </div>
    );
};

export default BrandPage;
