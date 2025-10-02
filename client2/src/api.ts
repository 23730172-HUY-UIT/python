// Dashboard Data
import { getCookie } from './hooks/getCookie';
export const fetchCSRFToken = async () => {
    // Gửi GET để backend set cookie csrftoken cho trình duyệt
    // Gửi GET tới endpoint cho phép GET để backend set cookie csrftoken
    await fetch('/api/csrf/', {
        method: 'GET',
        credentials: 'include'
    });
    const csrfToken = getCookie('csrftoken');
    console.log('CSRF token fetched:', csrfToken);
    return csrfToken;
};

// Auth
export const login = async (usernameOrEmail, password) => {
    const csrfToken = await fetchCSRFToken();
    const payload = { username: usernameOrEmail, password };
    const headers = { 'Content-Type': 'application/json' };
    if (csrfToken) headers['X-CSRFToken'] = csrfToken;
    const response = await fetch('/api/login/', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        credentials: 'include',
    });
    const data = await response.json();
    console.log('API login response data:', data);
    if (response.ok && data.success && data.user) {
        return data.user;
    } else {
        throw new Error(data.message || 'Invalid credentials');
    }
};

export const getDashboardData = async () => {
    // Lấy dữ liệu tổng hợp từ các API con
    const [onhands, orders, users, brands, categories, issues] = await Promise.all([
        getOnHandItems(),
        getOrders(),
        getUsers(),
        getBrands(),
        getCategories(),
        getIssues(),
    ]);
    return {
        onhands,
        orders,
        users,
        brands,
        categories,
        issues,
    };
};

// All Items (giả lập, dùng getItems nếu muốn lấy thật)
export const getAllItems = async () => {
    // Có thể gọi lại getItems hoặc trả về dữ liệu giả lập
    return await getItems();
};

// Tasks (giả lập)
export const getTasks = async () => {
    return [
        { id: 1, title: 'Check inventory', completed: false },
        { id: 2, title: 'Update price list', completed: true },
    ];
};
// Upload image, trả về url
export const uploadImage = async (file) => {
    const apiUrl = '/api/';
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(apiUrl + 'upload.php', {
        method: 'POST',
        body: formData,
    });
    const data = await res.json();
    return data;
};

// --- API Django RESTful ---

// Brands
export const getBrands = async () => {
    const res = await fetch('/api/brands/');
    const data = await res.json();
    return data.brands || [];
};
export const createBrand = async (brand) => {
    const res = await fetch('/api/brands/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brand),
    });
    return await res.json();
};
export const updateBrand = async (id, brand) => {
    const res = await fetch(`/api/brands/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brand),
    });
    return await res.json();
};
export const deleteBrand = async (id) => {
    const res = await fetch(`/api/brands/${id}/`, { method: 'DELETE' });
    return await res.json();
};

// Categories
export const getCategories = async () => {
    const res = await fetch('/api/categories/');
    const data = await res.json();
    return data.categories || [];
};
export const createCategory = async (category) => {
    const res = await fetch('/api/categories/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
    });
    return await res.json();
};
export const updateCategory = async (id, category) => {
    const res = await fetch(`/api/categories/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
    });
    return await res.json();
};
export const deleteCategory = async (id) => {
    const res = await fetch(`/api/categories/${id}/`, { method: 'DELETE' });
    return await res.json();
};

// Products (Items)
export const getItems = async () => {
    const res = await fetch('/api/products/');
    const data = await res.json();
    if (Array.isArray(data)) return data;
    return data.items || data.products || data.results || [];
};
export const createItem = async (item) => {
    const res = await fetch('/api/products/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
    });
    return await res.json();
};
export const updateItem = async (id, item) => {
    const res = await fetch(`/api/products/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
    });
    return await res.json();
};
export const deleteItem = async (id) => {
    const res = await fetch(`/api/products/${id}/`, { method: 'DELETE' });
    return await res.json();
};

// Lấy thông tin chi tiết một item
export const getItem = async (id) => {
    const res = await fetch(`/api/products/${id}/`);
    const data = await res.json();
    return data.item || data;
};

// Lấy danh sách items với filter (nếu backend hỗ trợ)
export const getFilteredItems = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/products/${query ? '?' + query : ''}`);
    const data = await res.json();
    return data.items || [];
};

// Orders
export const getOrders = async () => {
    const res = await fetch('/api/orders/');
    const data = await res.json();
    return data.orders || [];
};
export const createOrder = async (order) => {
    const res = await fetch('/api/orders/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
    });
    return await res.json();
};
export const updateOrder = async (id, order) => {
    const res = await fetch(`/api/orders/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
    });
    return await res.json();
};
export const deleteOrder = async (id) => {
    const res = await fetch(`/api/orders/${id}/`, { method: 'DELETE' });
    return await res.json();
};

// Users
export const getUsers = async () => {
    const res = await fetch('/api/users/');
    const data = await res.json();
    return data.users || [];
};
export const createUser = async (user) => {
    const res = await fetch('/api/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
    });
    return await res.json();
};
export const updateUser = async (id, user) => {
    const res = await fetch(`/api/users/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
    });
    return await res.json();
};
export const deleteUser = async (id) => {
    const res = await fetch(`/api/users/${id}/`, { method: 'DELETE' });
    return await res.json();
};

// Issues
export const getIssues = async () => {
    const res = await fetch('/api/issues/');
    const data = await res.json();
    return data.issues || [];
};
export const createIssue = async (issue) => {
    const res = await fetch('/api/issues/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issue),
    });
    return await res.json();
};
export const updateIssue = async (id, issue) => {
    const res = await fetch(`/api/issues/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issue),
    });
    return await res.json();
};
export const deleteIssue = async (id) => {
    const res = await fetch(`/api/issues/${id}/`, { method: 'DELETE' });
    return await res.json();
};

// Transactions
export const getTransactions = async () => {
    const res = await fetch('/api/transactions/');
    const data = await res.json();
    return data.transactions || [];
};
export const createTransaction = async (transaction) => {
    const res = await fetch('/api/transactions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
    });
    return await res.json();
};
export const updateTransaction = async (id, transaction) => {
    const res = await fetch(`/api/transactions/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
    });
    return await res.json();
};
export const deleteTransaction = async (id) => {
    const res = await fetch(`/api/transactions/${id}/`, { method: 'DELETE' });
    return await res.json();
};

// OnHandItems
export const getOnHandItems = async () => {
    const res = await fetch('/api/onhanditems/');
    const data = await res.json();
    return data.onHandItems || [];
};

export const logout = async () => {
    const response = await fetch('/api/logout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    return data;
};

let data: any;

// Use a singleton pattern to fetch data only once
async function loadData() {
    if (!data) {
        try {
            // Fetch from an absolute path to be safe against routing changes
            const response = await fetch('/src/data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            data = await response.json();
        } catch (error) {
            console.error("Could not load data.json:", error);
            throw new Error("Failed to load application data.");
        }
    }
    return data;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

