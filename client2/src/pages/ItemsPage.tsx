import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SearchIcon, EditIcon } from '../components/Icons';
import AddItemModal from '../components/AddItemModal';
import FilterModal from '../components/FilterModal';
import { getItems, createItem, updateItem, deleteItem, getBrands, getCategories, createTransaction } from '../api';

const GridIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const ListIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;

const ProductCard = ({ item, onEdit, brandName, categoryName }) => (
    <div className="product-card">
        <div className="product-card-content">
            <h4>{item.product_name}</h4>
            <div className="product-card-details">
                <span>{brandName}</span>•<span>{categoryName}</span>
            </div>
            <div className="product-card-stock-info">
                <span>Quantity: {item.quantity}</span>
                <span className="rate">${Number(item.rate).toFixed(2)}</span>
            </div>
            <div className="product-card-id">Product ID: {item.product_id}</div>
        </div>
        <div className="product-card-footer">
            <div className="product-card-status-badges">
                 <span className={`status-badge ${item.active ? 'active' : 'inactive'}`}>
                    {item.active ? 'Active' : 'Inactive'}
                </span>
                <span className={`status-badge ${item.status ? 'available' : 'unavailable'}`}>
                    {item.status ? 'Available' : 'Unavailable'}
                </span>
            </div>
            <button className="action-btn" aria-label={`Edit ${item.product_name}`} onClick={() => onEdit(item)}>
                <EditIcon />
            </button>
        </div>
    </div>
);


const ItemsPage = () => {
    const [viewMode, setViewMode] = useState('grid');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const location = useLocation();
    const [filters, setFilters] = useState({ store: '', custom: null });
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const actionButtonRef = useRef(null);

    const [items, setItems] = useState([]);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const [itemsData, brandsData, categoriesData] = await Promise.all([
                    getItems(),
                    getBrands(),
                    getCategories(),
                ]);
                setItems(itemsData);
                setBrands(brandsData);
                setCategories(categoriesData);
            } catch (err) {
                setError('Failed to fetch data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    // Lắng nghe query param để filter low-stock nếu có
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('filter') === 'low-stock') {
            setFilters(prev => ({ ...prev, custom: 'low-stock' }));
        }
    }, [location.search]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters, searchTerm]);

    const handleOpenAddModal = () => {
        actionButtonRef.current = document.activeElement;
        setEditingItem(null);
        setIsItemModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        actionButtonRef.current = document.activeElement;
        setEditingItem(item);
        setIsItemModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsItemModalOpen(false);
        if (actionButtonRef.current) {
            actionButtonRef.current.focus();
        }
    };

    const handleSaveItem = async (itemData) => {
        if (editingItem) {
            const oldItem = { ...editingItem };
            const res = await updateItem({ ...editingItem, ...itemData });
            if (res && res.success) {
                await createTransaction({
                    user_id: null,
                    action_type: 'update',
                    entity_type: 'item',
                    entity_id: editingItem.product_id,
                    data_before: oldItem,
                    data_after: { ...oldItem, ...itemData },
                    description: `Updated item ${editingItem.product_id}`
                });
                setItems(prev => prev.map(i => i.product_id === editingItem.product_id ? { ...i, ...itemData } : i));
                setIsItemModalOpen(false);
                setEditingItem(null);
            }
        } else {
            // Không tự tạo product_id, backend sẽ sinh tự động
            const newItem = {
                ...itemData,
                minStock: 5, 
                unit: 'pcs',
                store: 'HD Main Store',
            };
            const res = await createItem(newItem);
            if (res && res.success) {
                await createTransaction({
                    user_id: null,
                    action_type: 'create',
                    entity_type: 'item',
                    entity_id: res.product_id || null,
                    data_before: null,
                    data_after: { ...newItem, product_id: res.product_id || null },
                    description: `Created item ${newItem.product_name}`
                });
                setItems(prev => [...prev, { ...newItem, product_id: res.product_id || null }]);
                setIsItemModalOpen(false);
                setEditingItem(null);
            }
        }
    };

    const filteredItems = useMemo(() => {
        return items
            .filter(item => 
                item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .filter(item => {
                // Example filter logic, can be expanded
                if (!filters.store) return true;
                return item.store === filters.store;
            })
            .filter(item => {
                if (filters.custom === 'low-stock') {
                    return item.quantity <= item.minStock;
                }
                return true;
            });
    }, [items, searchTerm, filters]);

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleApplyFilters = (appliedFilters) => {
        setFilters(prev => ({ ...prev, store: appliedFilters.store }));
        setCurrentPage(1);
    };

    const handleDeleteItem = async (product_id) => {
        try {
            const dataBefore = items.find(i => i.product_id === product_id);
            const res = await deleteItem(product_id);
            if (res && res.success) {
                await createTransaction({
                    user_id: null,
                    action_type: 'delete',
                    entity_type: 'item',
                    entity_id: product_id,
                    data_before: dataBefore,
                    data_after: null,
                    description: `Deleted item ${dataBefore ? dataBefore.product_name : product_id}`
                });
                setItems(prev => prev.filter(i => i.product_id !== product_id));
            }
        } catch (err) {
            setError('Failed to delete item');
        }
    };

    return (
        <div className="items-page">
            <AddItemModal 
                isOpen={isItemModalOpen} 
                onClose={handleCloseModal}
                onSave={handleSaveItem}
                itemToEdit={editingItem}
                brands={brands.map(b => ({ id: b.brand_id ?? b.id, name: b.brand_name ?? b.name }))}
                categories={categories.map(c => ({ id: c.categories_id ?? c.id, name: c.categories_name ?? c.name }))}
            />
            <FilterModal 
                isOpen={showFilterModal} 
                onClose={() => setShowFilterModal(false)} 
                onApply={handleApplyFilters}
            />
            
            <div className="page-header">
                <h2>All Items</h2>
                <p>Items detail information</p>
            </div>

            <div className="card items-table-card">
                 {filters.custom === 'low-stock' && (
                    <div style={{ padding: '1rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger-color)', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--danger-color)' }}>
                        <strong>Showing low stock items.</strong>
                        <button className="btn btn-danger-outline" onClick={() => setFilters(prev => ({...prev, custom: null}))}>Clear Filter</button>
                    </div>
                )}
                <div className="items-table-toolbar">
                    <div className="search-bar-items">
                         <SearchIcon />
                        <input 
                            type="text" 
                            placeholder="Search Product Name" 
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                            }}
                        />
                    </div>
                    <div className="items-table-actions">
                        <div className="items-view-switcher">
                            <button className={`btn btn-secondary ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><ListIcon /> List</button>
                            <button className={`btn btn-secondary ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><GridIcon /> Grid</button>
                        </div>
                         <button className="btn btn-primary" onClick={handleOpenAddModal}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Add Product
                        </button>
                    </div>
                </div>

                {viewMode === 'list' ? (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th><input type="checkbox" /></th>
                                <th>Product Name</th>
                                <th>Product ID</th>
                                <th>Brand</th>
                                <th>Category</th>
                                <th>Quantity</th>
                                <th>Rate</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedItems.map(item => {
                                const brandName = brands.find(b => (b.id === item.brand_id || b.brand_id === item.brand_id))?.name || brands.find(b => (b.id === item.brand_id || b.brand_id === item.brand_id))?.brand_name || 'N/A';
                                const categoryName = categories.find(c => (c.id === item.categories_id || c.categories_id === item.categories_id))?.name || categories.find(c => (c.id === item.categories_id || c.categories_id === item.categories_id))?.categories_name || 'N/A';
                                return (
                                <tr key={item.product_id}>
                                    <td><input type="checkbox" /></td>
                                    <td>{item.product_name}</td>
                                    <td>{item.product_id}</td>
                                    <td>{brandName}</td>
                                    <td>{categoryName}</td>
                                    <td>{item.quantity}</td>
                                    <td>${Number(item.rate).toFixed(2)}</td>
                                    <td>
                                        <span className={`status-badge ${item.active ? 'active' : 'inactive'}`}>
                                            {item.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                          className="action-btn" 
                                          aria-label={`Edit ${item.product_name}`}
                                          onClick={() => handleOpenEditModal(item)}
                                        >
                                            <EditIcon />
                                        </button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                ) : (
                    <div className="items-grid-container">
                        {paginatedItems.map(item => {
                            if (!item || !item.product_id) return null;
                            const brandName = brands.find(b => b.id === item.brand_id)?.name || 'N/A';
                            const categoryName = categories.find(c => c.id === item.categories_id)?.name || 'N/A';
                            return (
                                <div key={item.product_id}>
                                    <ProductCard
                                        item={item}
                                        onEdit={handleOpenEditModal}
                                        brandName={brandName}
                                        categoryName={categoryName}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
                
                <div className="pagination">
                    <div className="pagination-info">
                        Showing 
                        <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="40">40</option>
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
        </div>
    );
};

export default ItemsPage;