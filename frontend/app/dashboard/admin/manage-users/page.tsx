"use client";
//frontend/app/dashboard/admin/manage-users/page.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../../../lib/api';
import useAuth from '../../../../hooks/useAuth';
import { Container, Card, Button, Table, Form, Row, Col, Modal, Alert, Spinner, Badge } from 'react-bootstrap';
import { useHydrated } from '../../../../hooks/useHydrated';
import '../../../../styles/AdminManage-Users.css';

const getRoleColor = (role) => {
    switch (role) {
        case 'admin': return 'danger';
        case 'instructor': return 'warning';
        case 'student': return 'info';
        default: return 'secondary';
    }
};

const getRoleText = (role, t) => {
    switch (role) {
        case 'admin': return t('admin_manage_users.role_admin');
        case 'instructor': return t('admin_manage_users.role_instructor');
        case 'student': return t('admin_manage_users.role_student');
        default: return role;
    }
};

function ManageUsersPageContent() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [filters, setFilters] = useState({ username: '', email: '', first_name: '', last_name: '', role: '', is_active: '' });

    const fetchUsers = async () => {
        if (!user || user.role !== 'admin') return;
        try {
            setLoading(true);
            const response = await api.get('auth/users/', { params: filters });
            setUsers(response.data.results || []);
        } catch (err) {
            setError(t("admin_manage_users.error"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [user, filters]);

    const handleDelete = async (userId) => {
        if (!confirm(t("admin_manage_users.confirm_delete"))) return;
        try {
            await api.delete(`auth/users/${userId}/`);
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            alert(t("admin_manage_users.error_deleting"));
        }
    };

    const handleOpenModal = (userToEdit = null) => {
        setEditingUser(userToEdit);
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        if (!editingUser) {
            data.role = data.role || 'student';
        }

        const promise = editingUser
            ? api.patch(`auth/users/${editingUser.id}/`, data)
            : api.post('auth/users/', data);

        try {
            await promise;
            await fetchUsers();
            setShowModal(false);
        } catch (err) {
            alert(t("admin_manage_users.error_saving", {
                error: err.response?.data?.detail || Object.values(err.response?.data || {}).flat().join(', ') || t("admin_manage_users.unknown_error")
            }));
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplyFilters = () => {
        fetchUsers();
    };

    if (loading) {
        return (
            <div className="modern-loading">
                <Spinner animation="border" className="modern-spinner" />
                <div className="modern-loading-text">{t('admin_manage_users.loading')}</div>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="modern-alert m-4">
                {error}
            </Alert>
        );
    }

    return (
        <>
            <style jsx global>{`
                
            `}</style>


            <div className="modern-users-container">
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div className="page-header">
                        <h1 className="modern-title">
                            {t('admin_manage_users.title') || 'Gestionar Usuarios'}
                        </h1>
                        <Button 
                            onClick={() => handleOpenModal()} 
                            className="modern-button-primary"
                        >
                            {t('admin_manage_users.create_user') || 'Crear Usuario'}
                        </Button>
                    </div>

                    <div className="filter-section">
                        <div className="filter-grid">
                            <div className="form-group">
                                <label className="modern-label">
                                    {t('admin_manage_users.filter_by_username') || 'Username'}
                                </label>
                                <input 
                                    type="text" 
                                    name="username" 
                                    value={filters.username} 
                                    onChange={handleFilterChange}
                                    className="modern-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="modern-label">
                                    {t('admin_manage_users.filter_by_email') || 'Email'}
                                </label>
                                <input 
                                    type="text" 
                                    name="email" 
                                    value={filters.email} 
                                    onChange={handleFilterChange}
                                    className="modern-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="modern-label">
                                    {t('admin_manage_users.filter_by_role') || 'Rol'}
                                </label>
                                <select 
                                    name="role" 
                                    value={filters.role} 
                                    onChange={handleFilterChange}
                                    className="modern-input"
                                >
                                    <option value="">{t('admin_manage_users.all_roles') || 'Todos'}</option>
                                    <option value="student">{t('admin_manage_users.role_student') || 'Estudiante'}</option>
                                    <option value="instructor">{t('admin_manage_users.role_instructor') || 'Instructor'}</option>
                                    <option value="admin">{t('admin_manage_users.role_admin') || 'Admin'}</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="modern-label">
                                    {t('admin_manage_users.filter_by_status') || 'Estado'}
                                </label>
                                <select
                                    name="is_active" 
                                    value={filters.is_active} 
                                    onChange={handleFilterChange}
                                    className="modern-input"
                                >
                                    <option value="">{t('admin_manage_users.all_statuses') || 'Todos'}</option>
                                    <option value="true">{t('admin_manage_users.status_active') || 'Activo'}</option>
                                    <option value="false">{t('admin_manage_users.status_inactive') || 'Inactivo'}</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <Button 
                                    onClick={handleApplyFilters} 
                                    className="modern-button-primary"
                                >
                                    {t('admin_manage_users.filter_button')}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Card className="modern-card">
                        <Table responsive className="modern-table mb-0">
                            <thead>
                                <tr>
                                    <th>{t('admin_manage_users.table_header_username') || 'Nombre'}</th>
                                    <th>{t('admin_manage_users.table_header_full_name') || 'Nombre Completo'}</th>
                                    <th>{t('admin_manage_users.table_header_email') || 'Email'}</th>
                                    <th>{t('admin_manage_users.table_header_role') || 'Rol'}</th>
                                    <th>{t('admin_manage_users.table_header_status') || 'Estado'}</th>
                                    <th>{t('admin_manage_users.table_header_actions') || 'Acciones'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4">
                                            <span className="text-muted">
                                                {t('admin_manage_users.no_users') || 'No se encontraron usuarios'}
                                            </span>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map(u => (
                                        <tr key={u.id}>
                                            <td data-label="Username">{u.username}</td>
                                            <td data-label="Nombre">{u.first_name} {u.last_name}</td>
                                            <td data-label="Email">{u.email}</td>
                                            <td data-label="Rol">
                                                <Badge 
                                                    bg={getRoleColor(u.role)} 
                                                    className="modern-badge"
                                                >
                                                    {getRoleText(u.role, t)}
                                                </Badge>
                                            </td>
                                            <td data-label="Estado">
                                                <span className={`status-badge ${u.is_active ? 'status-active' : 'status-inactive'}`}>
                                                    {u.is_active ? t('admin_manage_users.status_active') : t('admin_manage_users.status_inactive')}
                                                </span>
                                            </td>
                                            <td data-label="Acciones">
                                                <div className="d-flex gap-2">
                                                    <Button 
                                                        onClick={() => handleOpenModal(u)}
                                                        className="modern-button-warning"
                                                        size="sm"
                                                    >
                                                        {t('admin_manage_users.edit_button')}
                                                    </Button>
                                                    <Button 
                                                        onClick={() => handleDelete(u.id)}
                                                        className="modern-button-danger"
                                                        size="sm"
                                                    >
                                                        {t('admin_manage_users.delete_button')}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </Card>
                </div>
            </div>

            {/* Modal para Crear/Editar Usuario */}
            <Modal 
                show={showModal} 
                onHide={() => setShowModal(false)} 
                size="lg" 
                centered
                className="modern-modal"
            >
                <Modal.Header closeButton className="modern-modal-header">
                    <Modal.Title className="modern-modal-title">
                        {editingUser ? t('admin_manage_users.modal_edit_title') : t('admin_manage_users.modal_create_title')}
                    </Modal.Title>
                </Modal.Header>
                
                <Form onSubmit={handleSave}>
                    <Modal.Body className="modern-modal-body">
                        <Row className="g-3">
                            {!editingUser && (
                                <>
                                    <Col md={6}>
                                        <Form.Label className="modern-label">{t('admin_manage_users.modal_username_label')}</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            name="username" 
                                            defaultValue={editingUser?.username}
                                            className="modern-input"
                                            required
                                        />
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label className="modern-label">{t('admin_manage_users.modal_password_label')}</Form.Label>
                                        <Form.Control 
                                            type="password" 
                                            name="password"
                                            className="modern-input"
                                            required={!editingUser}
                                        />
                                    </Col>
                                </>
                            )}
                            
                            <Col md={6}>
                                <Form.Label className="modern-label">{t('admin_manage_users.modal_name_label')}</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name="first_name" 
                                    defaultValue={editingUser?.first_name}
                                    className="modern-input"
                                />
                            </Col>
                            
                            <Col md={6}>
                                <Form.Label className="modern-label">{t('admin_manage_users.modal_lastname_label')}</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name="last_name" 
                                    defaultValue={editingUser?.last_name}
                                    className="modern-input"
                                />
                            </Col>
                            
                            <Col md={8}>
                                <Form.Label className="modern-label">{t('admin_manage_users.modal_email_label')}</Form.Label>
                                <Form.Control 
                                    type="email" 
                                    name="email" 
                                    defaultValue={editingUser?.email}
                                    className="modern-input"
                                />
                            </Col>

                            {(!editingUser || editingUser.role !== 'admin') && (
                                <Col md={4}>
                                    <Form.Label className="modern-label">{t('admin_manage_users.modal_role_label')}</Form.Label>
                                    <Form.Select 
                                        name="role" 
                                        defaultValue={editingUser?.role}
                                        className="modern-input"
                                        required={!editingUser}
                                    >
                                        <option value="student">{t('admin_manage_users.role_student')}</option>
                                        <option value="instructor">{t('admin_manage_users.role_instructor')}</option>
                                    </Form.Select>
                                </Col>
                            )}

                            {editingUser?.role === 'student' && (
                                <Col md={6}>
                                    <Form.Label className="modern-label">{t('admin_manage_users.modal_student_id_label')}</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="student_id" 
                                        defaultValue={editingUser?.student_id}
                                        className="modern-input"
                                    />
                                </Col>
                            )}
                            
                            <Col md={12}>
                                <Form.Check 
                                    type="checkbox" 
                                    name="is_active" 
                                    label={t('admin_manage_users.modal_active_label')}
                                    defaultChecked={editingUser?.is_active}
                                    className="modern-label mt-3"
                                />
                            </Col>
                        </Row>
                    </Modal.Body>
                    
                    <Modal.Footer className="modern-modal-footer">
                        <Button 
                            variant="secondary" 
                            onClick={() => setShowModal(false)}
                            className="me-2"
                        >
                            {t('admin_manage_users.modal_cancel')}
                        </Button>
                        <Button 
                            type="submit"
                            className="modern-button-success"
                        >
                            {t('admin_manage_users.modal_save')}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}

export default function ManageUsersPage() {
    const hydrated = useHydrated();
    return hydrated ? <ManageUsersPageContent /> : null;
}