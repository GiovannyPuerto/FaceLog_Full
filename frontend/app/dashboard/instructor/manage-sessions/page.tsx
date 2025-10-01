"use client";
// frontend/app/dashboard/instructor/manage-sessions/page.tsx
import { useState, useEffect } from 'react';
import api from '../../../../lib/api';
import useAuth from '../../../../hooks/useAuth';
import { Container, Card, Button, Table, Form, Row, Col, Modal, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useHydrated } from '../../../../hooks/useHydrated';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import '../../../../styles/InstructorManageSesions.css';

export default function ManageSessionsPage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [fichas, setFichas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingSession, setEditingSession] = useState(null);
    const [filters, setFilters] = useState({ date: '', ficha: '', is_active: '' });
    const hydrated = useHydrated();

    const fetchSessions = async () => {
        if (!user || user.role !== 'instructor') return;
        try {
            setLoading(true);
            const response = await api.get('attendance/sessions/', { params: filters });
            setSessions(response.data.results || response.data);
        } catch (err) {
            setError(t('manage_sessions.error_loading'));
        } finally {
            setLoading(false);
        }
    };

    const fetchInstructorFichas = async () => {
        if (!user || user.role !== 'instructor') return;
        try {
            const response = await api.get('attendance/my-fichas/');
            setFichas(response.data.results || []);
        } catch (err) {
            console.error("Failed to fetch instructor fichas for filter/modal", err);
        }
    };

    useEffect(() => {
        fetchSessions();
        fetchInstructorFichas();
    }, [user]);

    const handleDelete = async (sessionId) => {
        if (!confirm(t('manage_sessions.confirm_delete'))) return;
        try {
            await api.delete(`attendance/sessions/${sessionId}/`);
            setSessions(sessions.filter(s => s.id !== sessionId));
        } catch (err) {
            alert(t('manage_sessions.error_deleting'));
        }
    };

    const handleOpenModal = (session = null) => {
        setEditingSession(session);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSession(null);
    };
    
    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        data.is_active = data.is_active === 'on' ? 'true' : 'false';

        const promise = editingSession
            ? api.patch(`attendance/sessions/${editingSession.id}/`, data)
            : api.post('attendance/sessions/', data);

        try {
            await promise;
            await fetchSessions();
            setShowModal(false);
        } catch (err) {
            const errorMessage = err.response?.data?.detail || Object.values(err.response?.data || {}).flat().join(', ') || 'Error desconocido';
            alert(t('manage_sessions.error_saving', { error: errorMessage }));
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplyFilters = () => {
        fetchSessions();
    };

    if (!hydrated) {
        return <LoadingSpinner />;
    }

    if (loading) {
        return (
            <div className="modern-loading">
                <Spinner animation="border" className="modern-spinner" />
                <div className="modern-loading-text">{t('manage_sessions.loading')}</div>
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

            

            <div className="modern-sessions-container">
                <Container fluid className="h-100">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="modern-title">
                            {t('manage_sessions.title')}
                        </h1>
                        <Button 
                            onClick={() => handleOpenModal()} 
                            className="modern-button-primary"
                        >
                            {t('manage_sessions.create_session')}
                        </Button>
                    </div>

                    {/* Sección de Filtros */}
                    <Card className="modern-filter-card">
                        <Row className="g-3">
                            <Col md={3}>
                                <Form.Label className="modern-label">{t('manage_sessions.filter_by_ficha')}</Form.Label>
                                <Form.Select 
                                    name="ficha" 
                                    value={filters.ficha} 
                                    onChange={handleFilterChange}
                                    className="modern-input"
                                >
                                    <option value="">{t('manage_sessions.all_fichas')}</option>
                                    {fichas.map(f => (
                                        <option key={f.id} value={f.id}>{f.numero_ficha}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col md={3}>
                                <Form.Label className="modern-label">{t('manage_sessions.filter_by_date')}</Form.Label>
                                <Form.Control 
                                    type="date" 
                                    name="date" 
                                    value={filters.date} 
                                    onChange={handleFilterChange}
                                    className="modern-input"
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Label className="modern-label">{t('manage_sessions.filter_by_status')}</Form.Label>
                                <Form.Select 
                                    name="is_active" 
                                    value={filters.is_active} 
                                    onChange={handleFilterChange}
                                    className="modern-input"
                                >
                                    <option value="">{t('manage_sessions.all_statuses')}</option>
                                    <option value="true">{t('manage_sessions.status_active')}</option>
                                    <option value="false">{t('manage_sessions.status_inactive')}</option>
                                </Form.Select>
                            </Col>
                            <Col md={3} className="d-flex align-items-end">
                                <Button 
                                    onClick={handleApplyFilters} 
                                    className="modern-button-primary w-100"
                                >
                                    {t('manage_sessions.apply_filters')}
                                </Button>
                            </Col>
                        </Row>
                    </Card>

                    {/* Tabla de Sesiones */}
                    <div className="d-none d-lg-block">
                        <Card className="modern-card">
                            <Table responsive className="modern-table mb-0">
                                <thead>
                                    <tr>
                                        <th>{t('manage_sessions.table_header_ficha')}</th>
                                        <th>{t('manage_sessions.table_header_date')}</th>
                                        <th>{t('manage_sessions.table_header_start')}</th>
                                        <th>{t('manage_sessions.table_header_end')}</th>
                                        <th>{t('manage_sessions.table_header_leniency')}</th>
                                        <th>{t('manage_sessions.table_header_status')}</th>
                                        <th>{t('manage_sessions.table_header_actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessions.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-4">
                                                <span className="text-muted">{t('manage_sessions.no_sessions_found')}</span>
                                            </td>
                                        </tr>
                                    ) : (
                                        sessions.map(session => (
                                            <tr key={session.id}>
                                                <td>{session.ficha.numero_ficha}</td>
                                                <td>{session.date}</td>
                                                <td>{session.start_time}</td>
                                                <td>{session.end_time}</td>
                                                <td>{session.permisividad || 0} {t('manage_sessions.leniency_minutes')}</td>
                                                <td>
                                                    <span className={`status-badge ${session.is_active ? 'status-active' : 'status-inactive'}`}>
                                                        {session.is_active ? t('manage_sessions.status_active') : t('manage_sessions.status_inactive')}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <Button onClick={() => handleOpenModal(session)} className="modern-button-warning" size="sm">{t('manage_sessions.edit_button')}</Button>
                                                        <Button onClick={() => handleDelete(session.id)} className="modern-button-danger" size="sm">{t('manage_sessions.delete_button')}</Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </Card>
                    </div>

                    {/* Mobile and Tablet Card View */}
                    <div className="d-lg-none">
                        {sessions.length === 0 ? (
                            <Card className="modern-card text-center py-4">
                                <span className="text-muted">{t('manage_sessions.no_sessions_found')}</span>
                            </Card>
                        ) : (
                            sessions.map(session => (
                                <Card key={session.id} className="modern-card mb-3">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h5 className="fw-bold">{session.ficha.numero_ficha}</h5>
                                            <span className={`status-badge ${session.is_active ? 'status-active' : 'status-inactive'}`}>
                                                {session.is_active ? t('manage_sessions.status_active') : t('manage_sessions.status_inactive')}
                                            </span>
                                        </div>
                                        <p className="text-muted small mb-2">{session.date}</p>
                                        <Row>
                                            <Col>
                                                <p className="small mb-1"><strong>{t('manage_sessions.table_header_start')}:</strong> {session.start_time}</p>
                                                <p className="small mb-1"><strong>{t('manage_sessions.table_header_end')}:</strong> {session.end_time}</p>
                                                <p className="small mb-0"><strong>{t('manage_sessions.table_header_leniency')}:</strong> {session.permisividad || 0} {t('manage_sessions.leniency_minutes')}</p>
                                            </Col>
                                        </Row>
                                        <hr />
                                        <div className="d-flex justify-content-end gap-2 mt-2">
                                            <Button onClick={() => handleOpenModal(session)} className="modern-button-warning" size="sm">{t('manage_sessions.edit_button')}</Button>
                                            <Button onClick={() => handleDelete(session.id)} className="modern-button-danger" size="sm">{t('manage_sessions.delete_button')}</Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            ))
                        )}
                    </div>
                </Container>
            </div>

            {/* Modal para Crear/Editar Sesión */}
            <Modal 
                show={showModal} 
                onHide={handleCloseModal} 
                size="lg" 
                centered
                className="modern-modal"
            >
                <Modal.Header closeButton className="modern-modal-header">
                    <Modal.Title className="modern-modal-title">
                        {editingSession ? t('manage_sessions.modal_edit_title') : t('manage_sessions.modal_create_title')}
                    </Modal.Title>
                </Modal.Header>
                
                <Form onSubmit={handleSave}>
                    <Modal.Body className="modern-modal-body">
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Label className="modern-label">{t('manage_sessions.table_header_ficha')}</Form.Label>
                                <Form.Select 
                                    name="ficha_id" 
                                    defaultValue={editingSession?.ficha.id}
                                    className="modern-input"
                                    required
                                >
                                    <option value="">{t('manage_sessions.modal_select_ficha')}</option>
                                    {fichas.map(f => (
                                        <option key={f.id} value={f.id}>{f.numero_ficha}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                            
                            <Col md={6}>
                                <Form.Label className="modern-label">{t('manage_sessions.modal_date')}</Form.Label>
                                <Form.Control 
                                    type="date" 
                                    name="date" 
                                    defaultValue={editingSession?.date}
                                    className="modern-input"
                                    required
                                />
                            </Col>
                            
                            <Col md={6}>
                                <Form.Label className="modern-label">{t('manage_sessions.modal_start_time')}</Form.Label>
                                <Form.Control 
                                    type="time" 
                                    name="start_time" 
                                    defaultValue={editingSession?.start_time}
                                    className="modern-input"
                                    required
                                />
                            </Col>
                            
                            <Col md={6}>
                                <Form.Label className="modern-label">{t('manage_sessions.modal_end_time')}</Form.Label>
                                <Form.Control 
                                    type="time" 
                                    name="end_time" 
                                    defaultValue={editingSession?.end_time}
                                    className="modern-input"
                                    required
                                />
                            </Col>
                            
                            <Col md={6}>
                                <Form.Label className="modern-label">{t('manage_sessions.modal_leniency')}</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    name="permisividad" 
                                    defaultValue={editingSession?.permisividad || 0}
                                    className="modern-input"
                                    min="0"
                                    placeholder="0"
                                />
                            </Col>
                            
                            <Col md={6} className="d-flex align-items-center">
                                <Form.Check 
                                    type="checkbox" 
                                    name="is_active" 
                                    label={t('manage_sessions.modal_active_session')}
                                    defaultChecked={editingSession?.is_active}
                                    className="modern-label mt-4"
                                />
                            </Col>
                        </Row>
                    </Modal.Body>
                    
                    <Modal.Footer className="modern-modal-footer">
                        <Button 
                            variant="secondary" 
                            onClick={handleCloseModal}
                            className="me-2"
                        >
                            {t('manage_sessions.modal_cancel')}
                        </Button>
                        <Button 
                            type="submit"
                            className="modern-button-success"
                        >
                            {t('manage_sessions.modal_save')}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}