
import React, { useState, useMemo, useEffect } from 'react';
import { CostIcon, IssueIcon, SummaryIcon3, UserPlusIcon, TrashIcon, EditIcon, ItemsIcon, AlertTriangleIcon, ClockIcon, ArchiveBoxIcon, PackageCheckIcon } from '../components/Icons';
import Modal from '../components/Modal';

import { getUsers, getTasks, getIssues } from '../api';

const ManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [issues, setIssues] = useState([]);
    const [modalData, setModalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const [usersData, tasksData, issuesData] = await Promise.all([
                    getUsers(),
                    getTasks(),
                    getIssues(),
                ]);
                setUsers(usersData);
                setTasks(tasksData);
                setIssues(issuesData);
            } catch (err) {
                setError('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const openIssues = useMemo(() => issues.filter(i => i.status === 'Pending'), [issues]);
    const activeUsers = useMemo(() => users.filter(u => u.status === 'Active'), [users]);

    const handleModalClose = () => setModalData(null);

    const renderTaskTable = (data) => (
        <table className="data-table">
            <thead>
                <tr>
                    <th>Task Description</th>
                    <th>Assigned To</th>
                    <th>Priority</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {data.map(task => (
                    <tr key={task.id}>
                        <td>{task.description}</td>
                        <td>{task.assignedTo}</td>
                        <td>{task.priority}</td>
                        <td>
                            {task.assignedTo === 'Unassigned' && (
                                <button className="btn btn-secondary" style={{width: 'auto', padding: '4px 12px'}}>Assign</button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderUserTable = (data) => (
        <table className="data-table">
            <thead>
                <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {data.map(user => (
                    <tr key={user.id}>
                        <td>
                            <div className="user-info">
                                <img src={user.avatar} alt={user.name} />
                                <div className="user-details">
                                    <strong>{user.name}</strong>
                                    <span>{user.email}</span>
                                </div>
                            </div>
                        </td>
                        <td>{user.role}</td>
                        <td><span className={`status-badge ${user.status.toLowerCase()}`}>{user.status}</span></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderIssueTable = (data) => (
        <table className="data-table">
            <thead>
                <tr>
                    <th>Item Model</th>
                    <th>Issue</th>
                    <th>Reported By</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {data.map(issue => (
                    <tr key={issue.id}>
                        <td>{issue.item}</td>
                        <td>{issue.issue}</td>
                        <td>{issue.reportedBy}</td>
                        <td><span className={`status-badge ${issue.status.toLowerCase()}`}>{issue.status}</span></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div className="management-page">
            <div className="page-header">
                <h2>Management Dashboard</h2>
                <p>Deep data overview for supervisors.</p>
            </div>

            <div className="management-summary-grid">
                <div className="summary-item card non-interactive">
                    <div className="summary-icon bg-purple"><CostIcon /></div>
                    <div className="summary-info"><strong>$1,2M</strong><span>Total Cost</span></div>
                </div>
                <div className="summary-item card" onClick={() => setModalData({ title: 'Open Issues', content: renderIssueTable(openIssues)})}>
                    <div className="summary-icon bg-orange"><IssueIcon /></div>
                    <div className="summary-info"><strong>{openIssues.length}</strong><span>Open Issues</span></div>
                </div>
                <div className="summary-item card" onClick={() => setModalData({ title: 'Active Users', content: renderUserTable(activeUsers)})}>
                    <div className="summary-icon bg-cyan"><SummaryIcon3 /></div>
                    <div className="summary-info"><strong>{activeUsers.length}</strong><span>Active Users</span></div>
                </div>
                 <div className="summary-item card non-interactive">
                    <div className="summary-icon bg-green"><ItemsIcon /></div>
                    <div className="summary-info"><strong>450</strong><span>Items in Stock</span></div>
                </div>
            </div>

            <div className="management-main-grid">
                <div className="card user-management-card">
                    <div className="card-header">
                        <h3>User Management</h3>
                        <button className="btn btn-primary">
                            <UserPlusIcon /> Create User
                        </button>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th className="action-cell">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="user-info">
                                            <img src={user.avatar} alt={user.name} />
                                            <div className="user-details">
                                                <strong>{user.name}</strong>
                                                <span>{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{user.role}</td>
                                    <td><span className={`status-badge ${user.status.toLowerCase()}`}>{user.status}</span></td>
                                    <td className="action-cell">
                                        <button className="action-btn" aria-label={`Edit ${user.name}`}><EditIcon /></button>
                                        <button className="action-btn delete" aria-label={`Delete ${user.name}`}><TrashIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                 <div className="card">
                    <div className="card-header">
                        <h3>Order KPIs</h3>
                        <a href="#" className="view-all-link" onClick={e => e.preventDefault()}>View All</a>
                    </div>
                    <div className="summary-grid">
                        <div className="summary-item kpi-card">
                            <div className="summary-icon bg-danger"><AlertTriangleIcon /></div>
                            <div className="summary-info"><strong>8</strong><span>Urgent Orders</span></div>
                        </div>
                        <div className="summary-item kpi-card">
                            <div className="summary-icon bg-orange"><ClockIcon /></div>
                            <div className="summary-info"><strong>22</strong><span>At Risk of Delay</span></div>
                        </div>
                        <div className="summary-item kpi-card">
                            <div className="summary-icon bg-cyan"><ArchiveBoxIcon /></div>
                            <div className="summary-info"><strong>5</strong><span>Stuck in Processing</span></div>
                        </div>
                        <div className="summary-item kpi-card">
                            <div className="summary-icon bg-green"><PackageCheckIcon /></div>
                            <div className="summary-info"><strong>42</strong><span>Ready for Shipping</span></div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3>Assignable Tasks</h3>
                        <a href="#" className="view-all-link" onClick={() => setModalData({ title: 'All Tasks', content: renderTaskTable(tasks)})}>View All</a>
                    </div>
                    <table className="data-table">
                         <thead>
                            <tr>
                                <th>Task Description</th>
                                <th>Priority</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.filter(t => t.assignedTo === 'Unassigned').map(task => (
                                <tr key={task.id}>
                                    <td>{task.description}</td>
                                    <td>{task.priority}</td>
                                    <td><button className="btn btn-secondary" style={{width: 'auto', padding: '4px 12px'}}>Assign</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

             <div className="card">
                <div className="card-header">
                    <h3>Issue Log</h3>
                     <a href="#" className="view-all-link" onClick={() => setModalData({ title: 'All Issues', content: renderIssueTable(issues)})}>View All</a>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Item Model</th>
                            <th>Issue</th>
                            <th>Reported By</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {issues.map(issue => (
                            <tr key={issue.id}>
                                <td>{issue.item}</td>
                                <td>{issue.issue}</td>
                                <td>{issue.reportedBy}</td>
                                <td><span className={`status-badge ${issue.status.toLowerCase()}`}>{issue.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={!!modalData} onClose={handleModalClose} titleId="management-detail-modal">
                {modalData && (
                    <>
                        <h3 className="modal-title" id="management-detail-modal">{modalData.title}</h3>
                        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            {modalData.content}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleModalClose}>Close</button>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default ManagementPage;