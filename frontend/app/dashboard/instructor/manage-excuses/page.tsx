"use client";

import { useState, useEffect } from 'react';
import api from '../../../../lib/api';
import useAuth from '../../../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useHydrated } from '../../../../hooks/useHydrated';
import axios from 'axios';
import '../../../../styles/InstructorManageExcuses.css';

// Simple Modal Component with theme support
const Modal = ({ children, onClose }) => (
    <div className="modal-overlay">
        <div className="modal-content">
            <button onClick={onClose} className="modal-close-btn">&times;</button>
            {children}
        </div>
    </div>
);

// Helper to get color based on status
const getStatusColor = (status) => {
    switch (status) {
        case 'approved': return 'status-approved';
        case 'rejected': return 'status-rejected';
        case 'pending': return 'status-pending';
        default: return 'status-default';
    }
};

export default function ManageExcusesPageContent() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const hydrated = useHydrated();

    const [excuses, setExcuses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [currentExcuseToReview, setCurrentExcuseToReview] = useState(null);
    const [reviewComment, setReviewComment] = useState('');
    const [filters, setFilters] = useState({ student: '', date_from: '', date_to: '', status: 'pending' });

    const handleViewAttachment = async (url) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('authToken');
            if (!token) {
                alert('Authentication token not found. Please log in again.');
                return;
            }
            try {
                const response = await axios.get(url, {
                    responseType: 'blob',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const file = new Blob([response.data], { type: response.headers['content-type'] });
                const fileURL = URL.createObjectURL(file);
                
                const filename = decodeURIComponent(url.substring(url.lastIndexOf('/') + 1));
                const newWindow = window.open('', '_blank');

                if (newWindow) {
                    newWindow.document.title = filename;
                    const iframe = newWindow.document.createElement('iframe');
                    iframe.src = fileURL;
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                    iframe.style.border = 'none';
                    iframe.style.margin = '0';
                    iframe.style.padding = '0';
                    iframe.style.overflow = 'hidden';
                    
                    newWindow.document.body.style.margin = '0';
                    newWindow.document.body.appendChild(iframe);
                    
                    newWindow.addEventListener('unload', () => {
                        URL.revokeObjectURL(fileURL);
                    });
                } else {
                    alert('Popup blocked! Please allow popups for this site to view attachments.');
                    // Fallback to old method
                    window.open(fileURL, '_blank');
                }
            } catch (error) {
                console.error('Error downloading file:', error);
                alert('Could not download file.');
            }
        }
    };

    const fetchExcuses = async () => {
        if (!user || user.role !== 'instructor') return;
        try {
            setLoading(true);
            const response = await api.get('excuses/', { params: filters });
            setExcuses(response.data.results || response.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch excuses", err);
            setError(t('manage_excuses.error_loading'));
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        if (!user || user.role !== 'instructor') return;
        try {
            const response = await api.get('auth/users/', { params: { role: 'student' } });
            setStudents(response.data.results || []);
        } catch (err) {
            console.error("Failed to fetch students for filter", err);
        }
    };

    useEffect(() => {
        fetchExcuses();
        fetchStudents();
    }, [user]);

    const handleOpenReviewModal = (excuse) => {
        setCurrentExcuseToReview(excuse);
        setReviewComment(excuse.review_comment || '');
        setIsReviewModalOpen(true);
    };

    const handleReviewExcuse = async (newStatus) => {
        if (!currentExcuseToReview) return;
        try {
            const response = await api.patch(`excuses/${currentExcuseToReview.id}/`, { 
                status: newStatus,
                review_comment: reviewComment
            });
            setExcuses(excuses.map(ex => ex.id === currentExcuseToReview.id ? response.data : ex));
            setIsReviewModalOpen(false);
            setCurrentExcuseToReview(null);
            setReviewComment('');
        } catch (err) {
            const errorMsg = err.response?.data?.detail || t('manage_excuses.unknown_error');
            alert(t('manage_excuses.error_reviewing', { status: newStatus, error: errorMsg }));
            console.error(`Failed to ${newStatus} excuse`, err);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplyFilters = () => {
        fetchExcuses();
    };

    if (!hydrated) {
        return null;
    }

    return (
        <>
            <style jsx global>{`
                
            `}</style>

            

            <div className="excuses-container">
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h1 className="modern-title">
                        {t('manage_excuses.title')}
                    </h1>
                    
                    <div className="modern-card">
                        <div className="card-header">
                            <h2 className="card-title">{t('manage_excuses.page_title')}</h2>
                        </div>

                        {/* Filter Section */}
                        <div style={{ padding: '1.5rem' }}>
                            <div className="filter-section">
                                <div className="filter-grid">
                                    <div className="form-group">
                                        <label className="form-label">{t('manage_excuses.filter_student')}</label>
                                        <select 
                                            name="student" 
                                            value={filters.student} 
                                            onChange={handleFilterChange} 
                                            className="form-select"
                                        >
                                            <option value="">{t('manage_excuses.filter_all_students')}</option>
                                            {students.map(s => (
                                                <option key={s.id} value={s.id}>
                                                    {s.first_name} {s.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('manage_excuses.filter_status')}</label>
                                        <select 
                                            name="status" 
                                            value={filters.status} 
                                            onChange={handleFilterChange} 
                                            className="form-select"
                                        >
                                            <option value="">{t('manage_excuses.filter_all_statuses')}</option>
                                            <option value="pending">{t('manage_excuses.status_pending')}</option>
                                            <option value="approved">{t('manage_excuses.status_approved')}</option>
                                            <option value="rejected">{t('manage_excuses.status_rejected')}</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('manage_excuses.filter_date_from')}</label>
                                        <input 
                                            type="date" 
                                            name="date_from" 
                                            value={filters.date_from} 
                                            onChange={handleFilterChange} 
                                            className="form-input" 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('manage_excuses.filter_date_to')}</label>
                                        <input 
                                            type="date" 
                                            name="date_to" 
                                            value={filters.date_to} 
                                            onChange={handleFilterChange} 
                                            className="form-input" 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <button onClick={handleApplyFilters} className="modern-button">
                                            {t('manage_excuses.apply_filters')}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="loading-container">
                                    <div style={{ fontSize: '3rem' }}></div>
                                    <div className="loading-text">{t('manage_excuses.loading')}</div>
                                </div>
                            ) : error ? (
                                <div className="error-container">
                                    <div style={{ fontSize: '3rem' }}></div>
                                    <div className="error-text">{t('manage_excuses.error_loading')}</div>
                                </div>
                            ) : (
                                <ul className="excuse-list">
                                    {excuses.length > 0 ? (
                                        excuses.map(excuse => (
                                            <li key={excuse.id} className="excuse-item">
                                                <div className="excuse-content">
                                                    <div className="excuse-header">
                                                        <div style={{ flex: '1' }}>
                                                            <div className="excuse-student">
                                                                 {excuse.student?.first_name} {excuse.student?.last_name}
                                                            </div>
                                                            <div className="excuse-meta">

                                                            </div>
                                                            <div className="excuse-meta">
                                                                {t('manage_excuses.excuse_card_session', { date: new Date(excuse.session.date).toLocaleDateString('es-CO') })}
                                                            </div>
                                                            {excuse.document_url && (
                                                                <button 
                                                                    onClick={() => handleViewAttachment(excuse.document_url)} 
                                                                    className="attachment-link"
                                                                >
                                                                    📎 {t('manage_excuses.view_attachment')}
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="excuse-actions">
                                                            <span className={`status-badge ${getStatusColor(excuse.status)}`}>
                                                                {t(`manage_excuses.status_${excuse.status}`)}
                                                            </span>
                                                            {excuse.status === 'pending' && (
                                                                <button 
                                                                    onClick={() => handleOpenReviewModal(excuse)} 
                                                                    className="review-button"
                                                                >
                                                                    {t('manage_excuses.review_button')}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="excuse-reason">
                                                        <strong>{t('manage_excuses.reason_label')}</strong> {excuse.reason}
                                                    </div>
                                                    {excuse.review_comment && (
                                                        <div className="review-comment">
                                                            <strong>{t('manage_excuses.review_comment_label')}</strong> {excuse.review_comment}
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                        ))
                                    ) : (
                                        <div className="empty-container">
                                            <div style={{ fontSize: '3rem' }}></div>
                                            <div className="empty-text">
                                                {t('manage_excuses.no_excuses_found')}
                                            </div>
                                        </div>
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isReviewModalOpen && currentExcuseToReview && (
                <Modal onClose={() => setIsReviewModalOpen(false)}>
                    <h2 className="modal-title">{t('manage_excuses.modal_title')}</h2>
                    <div className="modal-info">
                        <strong>{t('manage_excuses.modal_student_label')}</strong> {currentExcuseToReview.student.first_name} {currentExcuseToReview.student.last_name}
                    </div>
                    <div className="modal-info">
                        <strong>{t('manage_excuses.modal_session_label')}</strong> {currentExcuseToReview.session.ficha.numero_ficha} - {new Date(currentExcuseToReview.session.date).toLocaleDateString('es-CO')}
                    </div>
                    <div className="modal-reason">
                        <strong>{t('manage_excuses.reason_label')}</strong> {currentExcuseToReview.reason}
                    </div>
                    {currentExcuseToReview.document_url && (
                        <div style={{ marginBottom: '1rem' }}>
                            <button 
                                onClick={() => handleViewAttachment(currentExcuseToReview.document_url)} 
                                className="attachment-link"
                            >
                                📎 {t('manage_excuses.view_attachment')}
                            </button>
                        </div>
                    )}
                    <div className="form-group" style={{ marginTop: '1.5rem' }}>
                        <label className="form-label">
                            {t('manage_excuses.modal_review_comment_label')}
                        </label>
                        <textarea 
                            value={reviewComment} 
                            onChange={(e) => setReviewComment(e.target.value)} 
                            rows={4} 
                            className="modal-textarea"
                            placeholder={t('manage_excuses.modal_review_comment_placeholder')}
                        />
                    </div>
                    <div className="modal-actions">
                        <button 
                            type="button" 
                            onClick={() => handleReviewExcuse('approved')} 
                            className="approve-button"
                        >
                            {t('manage_excuses.approve_button')}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => handleReviewExcuse('rejected')} 
                            className="reject-button"
                        >
                            {t('manage_excuses.reject_button')}
                        </button>
                    </div>
                </Modal>
            )}
        </>
    );
}

