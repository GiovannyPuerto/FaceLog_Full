"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '../../../../lib/api';
import useAuth from '../../../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import '../../../../i18n';
import { useHydrated } from '../../../../hooks/useHydrated';
import '../../../../styles/ApprendizExcuses.css';

const Modal = ({ children, onClose }) => (
    <div className="modal-overlay">
        <div className="modal-content">
            <button onClick={onClose} className="modal-close-btn">&times;</button>
            {children}
        </div>
    </div>
);

const getStatusColor = (status) => {
    switch (status) {
        case 'approved': return 'status-approved';
        case 'rejected': return 'status-rejected';
        case 'pending': return 'status-pending';
        default: return 'status-default';
    }
};

export default function StudentExcusesPage() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const hydrated = useHydrated();
    const [excuses, setExcuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [absentSessions, setAbsentSessions] = useState([]);
    const [selectedSessionId, setSelectedSessionId] = useState('');
    const [filters, setFilters] = useState({ status: '', date_from: '', date_to: '' });

    const fetchExcuses = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const response = await api.get('excuses/', { params: filters });
            setExcuses(response.data.results || response.data);
        } catch (err) {
            setError(t('student_excuses.error'));
        } finally {
            setLoading(false);
        }
    };

    const searchParams = useSearchParams();
    const sessionIdFromUrl = searchParams.get('session_id');

    useEffect(() => {
        if(user) fetchExcuses();
    }, [user, filters]);

    useEffect(() => {
        if (sessionIdFromUrl) {
            handleOpenCreateModal(sessionIdFromUrl);
        }
    }, [sessionIdFromUrl]);

    const handleOpenCreateModal = async (initialSessionId = null) => {
        try {
            const response = await api.get('attendance/absences/');
            setAbsentSessions(response.data.results || response.data);
            setIsModalOpen(true);
            if (initialSessionId) {
                setSelectedSessionId(initialSessionId);
            }
        } catch (err) {
            setError(t('student_excuses.error_loading_absences'));
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSessionId('');
    }

    const handleCreateExcuse = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
            await api.post('excuses/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            handleCloseModal();
            fetchExcuses();
        } catch (err) {
            const apiError = err.response?.data;
            const errorMessage = apiError ? Object.values(apiError).flat().join(' ') : t('manage_excuses.unknown_error');
            alert(t('student_excuses.error_creating', { error: errorMessage }));
        }
    };

    const handleDelete = async (excuseId) => {
        if (window.confirm(t('student_excuses.confirm_delete'))) {
            try {
                await api.delete(`/excuses/${excuseId}/`);
                fetchExcuses();
            } catch (err) {
                alert(t('student_excuses.error_deleting'));
            }
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplyFilters = () => {
        fetchExcuses();
    }

    if (!hydrated) {
        return (
            <div className="loading-container">
                <div className="loading-icon">⏳</div>
                <div className="loading-text">Cargando...</div>
            </div>
        );
    }

    return (
        <>
            <div className="student-excuses-container">
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="page-header">
                        <h1 className="modern-title">{t('student_excuses.title')}</h1>
                        <button onClick={() => handleOpenCreateModal()} className="modern-button">
                            {t('student_excuses.create_excuse')}
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-icon">⏳</div>
                            <div className="loading-text">{t('student_excuses.loading')}</div>
                        </div>
                    ) : error ? (
                        <div className="error-container">
                            <div className="error-icon">❌</div>
                            <div className="error-text">{error}</div>
                        </div>
                    ) : (
                        <div className="excuses-card">
                            <div className="excuses-card-header">
                                <div className="filter-grid">
                                    <div className="form-group">
                                        <label className="form-label">{t('student_excuses.filter_status_label')}</label>
                                        <select name="status" value={filters.status} onChange={handleFilterChange} className="form-select">
                                            <option value="">{t('student_excuses.filter_all_statuses')}</option>
                                            <option value="pending">{t('student_excuses.status_pending')}</option>
                                            <option value="approved">{t('student_excuses.status_approved')}</option>
                                            <option value="rejected">{t('student_excuses.status_rejected')}</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('student_excuses.filter_date_from_label')}</label>
                                        <input type="date" name="date_from" value={filters.date_from} onChange={handleFilterChange} className="form-input" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('student_excuses.filter_date_to_label')}</label>
                                        <input type="date" name="date_to" value={filters.date_to} onChange={handleFilterChange} className="form-input" />
                                    </div>
                                    <div className="form-group">
                                        <button onClick={handleApplyFilters} className="modern-button">{t('student_excuses.filter_button')}</button>
                                    </div>
                                </div>
                            </div>
                            <ul className="excuses-list">
                                {excuses.length > 0 ? (
                                    excuses.map(excuse => (
                                        <li key={excuse.id} className="excuse-item">
                                            <div className="excuse-content">
                                                <div className="excuse-main">
                                                    <div className="excuse-session">
                                                        {t('student_excuses.session_date')} {new Date(excuse.session.date).toLocaleDateString('es-CO', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </div>
                                                    <div className="excuse-reason">
                                                         {excuse.reason}
                                                    </div>
                                                    {excuse.review_comment && (
                                                        <div className="excuse-review-comment">
                                                            <strong>Comentario del Instructor:</strong> {excuse.review_comment}
                                                        </div>
                                                    )}
                                                    {excuse.attachment && (
                                                        <a href={excuse.attachment} target="_blank" rel="noopener noreferrer" className="attachment-link">
                                                            📎 {t('student_excuses.view_attachment')}
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="excuse-actions">
                                                    <span className={`status-badge ${getStatusColor(excuse.status)}`}>
                                                        {excuse.status === 'approved' ? t('student_excuses.status_approved') : 
                                                         excuse.status === 'rejected' ? t('student_excuses.status_rejected') : 
                                                         excuse.status === 'pending' ? t('student_excuses.status_pending') : excuse.status}
                                                    </span>
                                                    <div className="excuse-date">
                                                        {t('student_excuses.sent_date')}: {new Date(excuse.created_at).toLocaleDateString()}
                                                    </div>
                                                    {excuse.status === 'pending' && (
                                                        <button onClick={() => handleDelete(excuse.id)} className="delete-button">
                                                            {t('student_excuses.delete_button')}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <div className="empty-container">
                                        <div className="empty-icon">📭</div>
                                        <div className="empty-text">
                                            {t('student_excuses.no_excuses_filtered')}
                                        </div>
                                    </div>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <Modal onClose={handleCloseModal}>
                    <h2 className="modal-title">{t('student_excuses.modal_title')}</h2>
                    <form onSubmit={handleCreateExcuse} className="modal-form">
                        <div className="form-group">
                            <label className="form-label">{t('student_excuses.modal_session_label')}</label>
                            <select 
                                name="session" 
                                className="form-select" 
                                required
                                value={selectedSessionId}
                                onChange={(e) => setSelectedSessionId(e.target.value)}
                            >
                                <option value="">{t('student_excuses.modal_select_session')}</option>
                                {absentSessions.map(att => (
                                    <option key={att.session.id} value={att.session.id}>
                                         {att.session.ficha.numero_ficha} - {new Date(att.session.date).toLocaleDateString()}
                                    </option>
                                ))}
                            </select>
                            {absentSessions.length === 0 && (
                                <div className="warning-message">
                                     {t('student_excuses.modal_no_absent_sessions')}
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t('student_excuses.modal_reason_label')}</label>
                            <textarea 
                                name="reason" 
                                rows={4} 
                                className="form-textarea" 
                                placeholder={t('student_excuses.modal_reason_placeholder_short')}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t('student_excuses.modal_attachment_label')}</label>
                            <input 
                                type="file" 
                                name="document" 
                                className="form-file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                        </div>
                        <div className="modal-actions">
                            <button 
                                type="button" 
                                onClick={handleCloseModal} 
                                className="modern-button secondary-button"
                            >
                                {t('student_excuses.modal_cancel')}
                            </button>
                            <button 
                                type="submit" 
                                className="modern-button success-button"
                            >
                                 {t('student_excuses.modal_submit')}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
}