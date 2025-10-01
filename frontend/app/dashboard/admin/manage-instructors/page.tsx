"use client";
//frontend/app/dashboard/admin/manage-instructors/page.tsx
import { useState, useEffect } from 'react';
import api from '../../../../lib/api';
import useAuth from '../../../../hooks/useAuth';
import { Container, Card, Button, Table, Form, Row, Col, Modal, Alert, Spinner, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useHydrated } from '../../../../hooks/useHydrated';
import '../../../../styles/AdminManage-instructors.css';

function ManageInstructorsPageContent() {
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

export default function ManageInstructorsPage() {
    const hydrated = useHydrated();
    return hydrated ? <ManageInstructorsPageContent /> : null;
}