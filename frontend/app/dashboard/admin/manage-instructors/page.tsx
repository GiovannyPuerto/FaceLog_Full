"use client";
//frontend/app/dashboard/admin/manage-instructors/page.tsx
import { useState, useEffect } from 'react';
import api from '../../../../lib/api';
import useAuth from '../../../../hooks/useAuth';
import { Container, Card, Button, Table, Form, Row, Col, Modal, Alert, Spinner, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

export default function ManageInstructorsPage() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingInstructor, setEditingInstructor] = useState(null);

    const fetchInstructors = async () => {
        if (!user || user.role !== 'admin') return;
        try {
            setLoading(true);
            const response = await api.get('auth/users/', { params: { role: 'instructor' } });
            setInstructors(response.data.results || []);
        } catch (err) {
            setError(t('admin_manage_instructors.error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstructors();
    }, [user]);

    const handleDelete = async (instructorId) => {
        if (!confirm(t('admin_manage_instructors.confirm_delete'))) return;
        try {
            await api.delete(`auth/users/${instructorId}/`);
            setInstructors(instructors.filter(i => i.id !== instructorId));
        } catch (err) {
            alert(t('admin_manage_instructors.error_deleting'));
        }
    };

    const handleOpenModal = (instructor = null) => {
        setEditingInstructor(instructor);
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        if (!editingInstructor) {
            data.role = 'instructor';
        }

        const promise = editingInstructor
            ? api.patch(`auth/users/${editingInstructor.id}/`, data)
            : api.post('auth/users/', data);

        try {
            await promise;
            await fetchInstructors();
            setShowModal(false);
        } catch (err) {
            alert(t('admin_manage_instructors.error_saving', { error: err.response?.data?.detail || Object.values(err.response?.data || {}).flat().join(', ') || t('unknown_error') }));
        }
    };

    if (loading) {
        return (
            <div className="modern-loading">
                <Spinner animation="border" className="modern-spinner" />
                <div className="modern-loading-text">{t('admin_manage_instructors.loading')}</div>
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
                :root {
                    --bg-primary: #f8f9fa;
                    --bg-card: #ffffff;
                    --text-primary: #212529;
                    --text-secondary: #6c757d;
                    --border-color: #e9ecef;
                    --button-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    --button-hover: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
                    --button-success: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    --button-success-hover: linear-gradient(135deg, #218838 0%, #1ea085 100%);
                    --button-danger: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                    --button-danger-hover: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
                    --button-warning: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
                    --button-warning-hover: linear-gradient(135deg, #e0a800 0%, #d39e00 100%);
                    --shadow-card: 0 8px 25px rgba(0, 0, 0, 0.08);
                    --shadow-hover: 0 12px 35px rgba(0, 0, 0, 0.12);
                    --alert-danger-bg: #f8d7da;
                    --alert-danger-border: #f1aeb5;
                    --alert-danger-text: #842029;
                    --modal-bg: #ffffff;
                    --modal-border: #dee2e6;
                    --table-bg: #ffffff;
                    --table-text: #212529;
                    --table-hover-bg: rgba(102, 126, 234, 0.05);
                }

                [data-theme="dark"] {
                    --bg-primary: #0d1117;
                    --bg-card: #161b22;
                    --text-primary: #f0f6fc;
                    --text-secondary: #8b949e;
                    --border-color: #30363d;
                    --button-gradient: linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%);
                    --button-hover: linear-gradient(135deg, #4493f8 0%, #1b5fc1 100%);
                    --button-success: linear-gradient(135deg, #238636 0%, #2ea043 100%);
                    --button-success-hover: linear-gradient(135deg, #1a6928 0%, #238636 100%);
                    --button-danger: linear-gradient(135deg, #f85149 0%, #da3633 100%);
                    --button-danger-hover: linear-gradient(135deg, #da3633 0%, #c93026 100%);
                    --button-warning: linear-gradient(135deg, #d29922 0%, #b08800 100%);
                    --button-warning-hover: linear-gradient(135deg, #b08800 0%, #9c7700 100%);
                    --shadow-card: 0 8px 25px rgba(0, 0, 0, 0.3);
                    --shadow-hover: 0 12px 35px rgba(0, 0, 0, 0.4);
                    --alert-danger-bg: #2d1b1e;
                    --alert-danger-border: #8b2635;
                    --alert-danger-text: #f85149;
                    --modal-bg: #21262d;
                    --modal-border: #30363d;
                    --table-bg: #161b22;
                    --table-text: #f0f6fc;
                    --table-hover-bg: rgba(88, 166, 255, 0.1);
                }

                body {
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                    transition: all 0.3s ease;
                }

                .modern-instructors-container {
                    background: var(--bg-primary);
                    min-height: 100vh;
                    padding: 30px;
                    transition: background-color 0.3s ease;
                }

                .modern-title {
                    color: var(--text-primary);
                    font-weight: 800;
                    font-size: 2.2rem;
                    margin-bottom: 2rem;
                    background: var(--button-gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .modern-card {
                    background: var(--bg-card) !important;
                    border: 2px solid var(--border-color) !important;
                    border-radius: 20px !important;
                    box-shadow: var(--shadow-card) !important;
                    transition: all 0.3s ease !important;
                    overflow: hidden;
                }

                .modern-card:hover {
                    box-shadow: var(--shadow-hover) !important;
                }

                .modern-button-primary {
                    background: var(--button-gradient) !important;
                    border: none !important;
                    border-radius: 12px !important;
                    padding: 12px 24px !important;
                    font-weight: 600 !important;
                    font-size: 1rem !important;
                    transition: all 0.3s ease !important;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: white !important;
                }

                .modern-button-primary:hover {
                    background: var(--button-hover) !important;
                    transform: translateY(-2px) !important;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2) !important;
                    color: white !important;
                }

                .modern-button-success {
                    background: var(--button-success) !important;
                    border: none !important;
                    border-radius: 12px !important;
                    padding: 10px 20px !important;
                    font-weight: 600 !important;
                    transition: all 0.3s ease !important;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: white !important;
                }

                .modern-button-success:hover {
                    background: var(--button-success-hover) !important;
                    transform: translateY(-1px) !important;
                    color: white !important;
                }

                .modern-button-danger {
                    background: var(--button-danger) !important;
                    border: none !important;
                    border-radius: 8px !important;
                    padding: 6px 12px !important;
                    font-weight: 600 !important;
                    transition: all 0.3s ease !important;
                    font-size: 0.9rem;
                    color: white !important;
                }

                .modern-button-danger:hover {
                    background: var(--button-danger-hover) !important;
                    transform: translateY(-1px) !important;
                    color: white !important;
                }

                .modern-button-warning {
                    background: var(--button-warning) !important;
                    border: none !important;
                    border-radius: 8px !important;
                    padding: 6px 12px !important;
                    font-weight: 600 !important;
                    transition: all 0.3s ease !important;
                    color: #212529 !important;
                    font-size: 0.9rem;
                }

                .modern-button-warning:hover {
                    background: var(--button-warning-hover) !important;
                    transform: translateY(-1px) !important;
                    color: #212529 !important;
                }

                .modern-input {
                    background: var(--bg-card) !important;
                    border: 2px solid var(--border-color) !important;
                    border-radius: 12px !important;
                    padding: 12px 15px !important;
                    color: var(--text-primary) !important;
                    transition: all 0.3s ease !important;
                }

                .modern-input:focus {
                    border-color: #667eea !important;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
                    background: var(--bg-card) !important;
                    color: var(--text-primary) !important;
                }

                .modern-label {
                    color: var(--text-primary) !important;
                    font-weight: 600 !important;
                    font-size: 1rem !important;
                    margin-bottom: 8px !important;
                }

                .modern-table {
                    background: var(--table-bg) !important;
                    color: var(--table-text) !important;
                }

                .modern-table th {
                    background: var(--button-gradient) !important;
                    color: white !important;
                    font-weight: 700 !important;
                    padding: 15px 12px !important;
                    font-size: 0.95rem !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                    border: none !important;
                }

                .modern-table td {
                    padding: 12px !important;
                    border-bottom: 1px solid var(--border-color) !important;
                    color: var(--table-text) !important;
                    font-weight: 500 !important;
                    vertical-align: middle !important;
                    background: var(--table-bg) !important;
                }

                /* Asegurar que todos los elementos dentro de las celdas tengan el color correcto */
                .modern-table td,
                .modern-table td *:not(.btn):not(.status-badge) {
                    color: var(--table-text) !important;
                }

                /* Específicamente para los spans con clase text-muted */
                .modern-table td .text-muted {
                    color: var(--text-secondary) !important;
                }

                .modern-table tbody tr:hover {
                    background: var(--table-hover-bg) !important;
                }

                .modern-table tbody tr:hover td {
                    background: var(--table-hover-bg) !important;
                }

                .modern-modal .modal-content {
                    background: var(--modal-bg) !important;
                    border: 1px solid var(--modal-border) !important;
                    border-radius: 20px !important;
                    overflow: hidden;
                }

                .modern-modal-header {
                    background: var(--button-gradient) !important;
                    border: none !important;
                    padding: 24px 30px !important;
                }

                .modern-modal-title {
                    color: white !important;
                    font-weight: 700 !important;
                    font-size: 1.4rem !important;
                    margin: 0 !important;
                }

                .modern-modal-body {
                    padding: 30px !important;
                    background: var(--modal-bg) !important;
                }

                .modern-modal-footer {
                    background: var(--modal-bg) !important;
                    border: none !important;
                    padding: 20px 30px !important;
                }

                .modern-alert {
                    background: var(--alert-danger-bg) !important;
                    border: 1px solid var(--alert-danger-border) !important;
                    color: var(--alert-danger-text) !important;
                    border-radius: 12px !important;
                    font-weight: 500 !important;
                    border-left: 5px solid var(--alert-danger-text) !important;
                }

                .modern-loading {
                    background: var(--bg-card);
                    border-radius: 20px;
                    padding: 60px;
                    text-align: center;
                    box-shadow: var(--shadow-card);
                    border: 2px solid var(--border-color);
                    margin: 30px;
                    margin-left: 255px;
                }

                .modern-loading-text {
                    color: var(--text-secondary);
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin-top: 20px;
                }

                .modern-spinner {
                    width: 3rem !important;
                    height: 3rem !important;
                }

                .status-badge {
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .status-active {
                    background: var(--button-success);
                    color: white !important;
                }

                .status-inactive {
                    background: var(--text-secondary);
                    color: white !important;
                }

                .theme-toggle {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: var(--bg-card);
                    border: 2px solid var(--border-color);
                    border-radius: 50%;
                    width: 55px;
                    height: 55px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    color: var(--text-primary);
                    box-shadow: var(--shadow-card);
                    font-size: 1.2rem;
                    z-index: 9999;
                }

                .theme-toggle:hover {
                    transform: scale(1.1) rotate(180deg);
                    box-shadow: var(--shadow-hover);
                }

                @media (max-width: 991.98px) {
                    .modern-instructors-container {
                        margin-left: 220px;
                        padding: 20px;
                    }
                    
                    .modern-loading {
                        margin-left: 240px;
                        padding: 40px;
                    }
                }

                @media (max-width: 768px) {
                    .modern-instructors-container {
                        margin-left: 0;
                        padding: 15px;
                    }
                    
                    .modern-loading {
                        margin: 15px;
                        padding: 30px;
                    }
                    
                    .modern-title {
                        font-size: 1.8rem;
                    }
                    
                    .theme-toggle {
                        top: 15px;
                        right: 15px;
                        width: 45px;
                        height: 45px;
                        font-size: 1rem;
                    }
                }

                @media (max-width: 767.98px) {
                    .modern-table thead {
                        display: none;
                    }

                    .modern-table tbody,
                    .modern-table tr {
                        display: block;
                        width: 100%;
                    }

                    .modern-table tr {
                        margin-bottom: 1rem;
                        border: 1px solid var(--border-color);
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: var(--shadow-card);
                        background: var(--table-bg) !important;
                    }

                    .modern-table td {
                        display: block;
                        text-align: right;
                        padding-left: 15px;
                        border: none;
                        border-bottom: 1px solid var(--border-color);
                        background: var(--table-bg) !important;
                    }

                    .modern-table td:last-child {
                        border-bottom: none;
                    }

                    .modern-table td::before {
                        content: attr(data-label);
                        float: left;
                        font-weight: 700;
                        color: var(--text-secondary);
                        padding-right: 15px;
                    }
                }
            `}</style>

            <div className="modern-instructors-container">
                <Container fluid className="h-100">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="modern-title">
                            {t('admin_manage_instructors.title')}
                        </h1>
                        <Button 
                            onClick={() => handleOpenModal()} 
                            className="modern-button-primary"
                        >
                            {t('admin_manage_instructors.create_instructor')}
                        </Button>
                    </div>

                    {/* Tabla de Instructores */}
                    <Card className="modern-card">
                        <Table responsive className="modern-table mb-0">
                            <thead>
                                <tr>
                                    <th>{t('admin_manage_instructors.table_header_username')}</th>
                                    <th>{t('admin_manage_instructors.table_header_full_name')}</th>
                                    <th>{t('admin_manage_instructors.table_header_email')}</th>
                                    <th>{t('admin_manage_instructors.table_header_status')}</th>
                                    <th>{t('admin_manage_instructors.table_header_actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {instructors.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-4">
                                            <span className="text-muted">
                                                {t('admin_manage_instructors.no_instructors')}
                                            </span>
                                        </td>
                                    </tr>
                                ) : (
                                    instructors.map(instructor => (
                                        <tr key={instructor.id}>
                                            <td data-label={t('admin_manage_instructors.table_header_username')}>{instructor.username}</td>
                                            <td data-label={t('admin_manage_instructors.table_header_full_name')}>{instructor.first_name} {instructor.last_name}</td>
                                            <td data-label={t('admin_manage_instructors.table_header_email')}>{instructor.email}</td>
                                            <td data-label={t('admin_manage_instructors.table_header_status')}>
                                                <span className={`status-badge ${instructor.is_active ? 'status-active' : 'status-inactive'}`}>
                                                    {instructor.is_active ? t('admin_manage_instructors.status_active') : t('admin_manage_instructors.status_inactive')}
                                                </span>
                                            </td>
                                            <td data-label={t('admin_manage_instructors.table_header_actions')}>
                                                <div className="d-flex gap-2">
                                                    <Button 
                                                        onClick={() => handleOpenModal(instructor)}
                                                        className="modern-button-warning"
                                                        size="sm"
                                                    >
                                                        {t('admin_manage_instructors.edit_button')}
                                                    </Button>
                                                    <Button 
                                                        onClick={() => handleDelete(instructor.id)}
                                                        className="modern-button-danger"
                                                        size="sm"
                                                    >
                                                        {t('admin_manage_instructors.delete_button')}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </Card>
                </Container>
            </div>

            {/* Modal para Crear/Editar Instructor */}
            <Modal 
                show={showModal} 
                onHide={() => setShowModal(false)} 
                size="lg" 
                centered
                className="modern-modal"
            >
                <Modal.Header closeButton className="modern-modal-header">
                    <Modal.Title className="modern-modal-title">
                        {editingInstructor ? t('admin_manage_instructors.modal_edit_title') : t('admin_manage_instructors.modal_create_title')}
                    </Modal.Title>
                </Modal.Header>
                
                <Form onSubmit={handleSave}>
                    <Modal.Body className="modern-modal-body">
                        <Row className="g-3">
                            {!editingInstructor && (
                                <>
                                    <Col md={6}>
                                        <Form.Label className="modern-label">{t('admin_manage_instructors.modal_username_label')}</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            name="username" 
                                            defaultValue={editingInstructor?.username}
                                            className="modern-input"
                                            required
                                        />
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label className="modern-label">{t('admin_manage_instructors.modal_password_label')}</Form.Label>
                                        <Form.Control 
                                            type="password" 
                                            name="password"
                                            className="modern-input"
                                            required={!editingInstructor}
                                        />
                                    </Col>
                                </>
                            )}
                            
                            <Col md={6}>
                                <Form.Label className="modern-label">{t('admin_manage_instructors.modal_name_label')}</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name="first_name" 
                                    defaultValue={editingInstructor?.first_name}
                                    className="modern-input"
                                />
                            </Col>
                            
                            <Col md={6}>
                                <Form.Label className="modern-label">{t('admin_manage_instructors.modal_lastname_label')}</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name="last_name" 
                                    defaultValue={editingInstructor?.last_name}
                                    className="modern-input"
                                />
                            </Col>
                            
                            <Col md={12}>
                                <Form.Label className="modern-label">{t('admin_manage_instructors.modal_email_label')}</Form.Label>
                                <Form.Control 
                                    type="email" 
                                    name="email" 
                                    defaultValue={editingInstructor?.email}
                                    className="modern-input"
                                />
                            </Col>
                            
                            <Col md={12}>
                                <Form.Check 
                                    type="checkbox" 
                                    name="is_active" 
                                    label={t('admin_manage_instructors.modal_active_label')}
                                    defaultChecked={editingInstructor?.is_active}
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
                            {t('admin_manage_instructors.modal_cancel')}
                        </Button>
                        <Button 
                            type="submit"
                            className="modern-button-success"
                        >
                            {t('admin_manage_instructors.modal_save')}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}