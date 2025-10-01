"use client";
//frontend/app/dashboard/profile/page.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../../lib/api';
import useAuth from '../../../hooks/useAuth';
import { useHydrated } from '../../../hooks/useHydrated';
import '../../../styles/profile.css';

// Modal Component with theme support
const Modal = ({ children, onClose }) => (
    <div className="modal-overlay">
        <div className="modal-content">
            <button onClick={onClose} className="modal-close-btn">&times;</button>
            {children}
        </div>
    </div>
);

function ProfilePageContent() {
    const { t } = useTranslation('profile');
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordError, setPasswordError] = useState(null);
    const [passwordSuccess, setPasswordSuccess] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const response = await api.get('auth/profile/');
                setProfile(response.data);
            } catch (err) {
                setError(t('perfil_error_loading'));
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            email: formData.get('email'),
            student_id: formData.get('student_id'),
        };

        if (profile?.role !== 'student') {
            delete data.student_id;
        }

        setError(null);
        setSuccess(null);

        try {
            const response = await api.patch('auth/profile/', data);
            setProfile(response.data);
            setSuccess(t('perfil_update_success'));
        } catch (err) {
            const apiError = err.response?.data;
            const errorMessage = apiError ? Object.values(apiError).join(', ') : t('common_unknown_error');
            setError(`${t('perfil_error_update')}: ${errorMessage}`);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(null);

        const formData = new FormData(e.target);
        const old_password = formData.get('old_password');
        const new_password = formData.get('new_password');
        const new_password2 = formData.get('new_password2');

        if (new_password !== new_password2) {
            setPasswordError(t('perfil_password_mismatch'));
            return;
        }

        try {
            await api.put('auth/password/change/', { old_password, new_password, new_password2 });
            setPasswordSuccess("Contraseña actualizada con éxito.");
            setTimeout(() => {
                setIsPasswordModalOpen(false);
                setPasswordSuccess(null);
            }, 2000);
        } catch (err) {
            const apiError = err.response?.data;
            const errorMessage = apiError ? Object.values(apiError).flat().join(' ') : 'Error desconocido.';
            setPasswordError(`Error: ${errorMessage}`);
        }
    };

    const isLoading = authLoading || loading;

    return (
        <>
            <div className="profile-container">
                <div className="profile-wrapper">
                    <h1 className="modern-title">
                         {t('perfil_title')}
                    </h1>
                    
                    {isLoading ? (
                        <div className="loading-container">
                            <div className="loading-icon"></div>
                            <div className="loading-text">{t('perfil_loading')}</div>
                        </div>
                    ) : error && !profile ? (
                        <div className="error-container">
                            <div className="error-icon">❌</div>
                            <div className="error-text">{t('common_error')}: {error}</div>
                        </div>
                    ) : profile && (
                        <div className="profile-card">
                            <form onSubmit={handleSubmit} className="profile-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">{t('username_label')}</label>
                                        <input 
                                            type="text" 
                                            name="username" 
                                            defaultValue={profile.username} 
                                            className="form-input"
                                            readOnly 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('email_label')}</label>
                                        <input 
                                            type="email" 
                                            name="email" 
                                            defaultValue={profile.email} 
                                            className="form-input"
                                            required 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('username_label')}</label>
                                        <input 
                                            type="text" 
                                            name="first_name" 
                                            defaultValue={profile.first_name} 
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('last_name_label')}</label>
                                        <input 
                                            type="text" 
                                            name="last_name" 
                                            defaultValue={profile.last_name} 
                                            className="form-input"
                                        />
                                    </div>
                                    {profile.role === 'student' && (
                                        <div className="form-group">
                                            <label className="form-label">ID de Estudiante</label>
                                            <input 
                                                type="text" 
                                                name="student_id" 
                                                defaultValue={profile.student_id || ''} 
                                                className="form-input"
                                            />
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label className="form-label">{t('role_label')}</label>
                                        <div className="readonly-field">
                                            {profile.role}
                                        </div>
                                    </div>
                                    {profile.role === 'instructor' && profile.fichas && profile.fichas.length > 0 && (
                                        <div className="form-group">
                                            <label className="form-label">{t('assigned_fichas_label')}</label>
                                            <div className="readonly-field">
                                                {profile.fichas.map(fichaId => fichaId).join(', ')}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="form-actions">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsPasswordModalOpen(true)} 
                                        className="modern-button secondary-button"
                                    >
                                        {t('change_password_modal_title')}   
                                    </button>
                                    <div className="message-container">
                                        {error && (
                                            <div className="error-message">
                                                ❌ {error}
                                            </div>
                                        )}
                                        {success && (
                                            <div className="success-message">
                                                 {success}
                                            </div>
                                        )}
                                        <button type="submit" className="modern-button">
                                            {t('save_changes_button')}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {isPasswordModalOpen && (
                <Modal onClose={() => setIsPasswordModalOpen(false)}>
                    <h2 className="modal-title">{t('change_password_button')}</h2>
                    <form onSubmit={handleChangePassword} className="modal-form">
                        <div className="form-group">
                            <label className="form-label">{t('current_password_label')}</label>
                            <input 
                                type="password" 
                                name="old_password" 
                                className="form-input"
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t('new_password_label')}</label>
                            <input 
                                type="password" 
                                name="new_password" 
                                className="form-input"
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t('confirm_new_password_label')}</label>
                            <input 
                                type="password" 
                                name="new_password2" 
                                className="form-input"
                                required 
                            />
                        </div>
                        
                        {passwordError && (
                            <div className="error-message"> {passwordError}</div>
                        )}
                        {passwordSuccess && (
                            <div className="success-message"> {passwordSuccess}</div>
                        )}

                        <div className="modal-actions">
                            <button 
                                type="button" 
                                onClick={() => setIsPasswordModalOpen(false)} 
                                className="modern-button secondary-button"
                            >
                                {t('cancel_button')}
                            </button>
                            <button type="submit" className="modern-button success-button">
                                  {t('update_password_button')}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
}

export default function PerfilPage() {
    const hydrated = useHydrated();
    return hydrated ? <ProfilePageContent /> : null;
}