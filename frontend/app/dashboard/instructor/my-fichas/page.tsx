"use client";
//Frontend/app/dashboard/instructor/my-fichas/page.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../../../lib/api';
import useAuth from '../../../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import '../../../../i18n';
import { Sun, Moon, Globe } from 'lucide-react';
import { useHydrated } from '../../../../hooks/useHydrated';
import '../../../../styles/InstructorMy-fichas.css';

export default function MyFichasPage() {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const [theme, setTheme] = useState('light');
    const hydrated = useHydrated();

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const savedLang = localStorage.getItem('i18nextLng') || 'es';
        if (i18n.language !== savedLang) {
            i18n.changeLanguage(savedLang);
        }
    }, [i18n]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'es' ? 'en' : 'es';
        i18n.changeLanguage(newLang);
        localStorage.setItem('i18nextLng', newLang);
    };
    const [fichas, setFichas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ numero_ficha: '', programa_formacion: '' });

    const fetchFichas = async () => {
        if (!user || user.role !== 'instructor') return;
        try {
            setLoading(true);
            const response = await api.get('attendance/my-fichas/', { params: filters });
            setFichas(response.data.results || []);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch fichas", err);
            setError("No se pudieron cargar las fichas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFichas();
    }, [user]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplyFilters = () => {
        fetchFichas();
    };

    return (
        <>
            <style jsx global>{`
                
            `}</style>


                        {hydrated && (
                <div className="control-buttons-container">
                    <div 
                        className="control-button"
                        onClick={toggleTheme}
                        title={t('common_change_theme')}
                    >
                        {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
                    </div>
                    <div 
                        className="control-button"
                        onClick={toggleLanguage}
                        title={t('common_change_language')}
                    >
                        <Globe size={22} />
                        <span className="language-text ms-1">{i18n.language.toUpperCase()}</span>
                    </div>
                </div>
            )}

            <div className="fichas-container">
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <h1 className="modern-title">
                         {hydrated ? t('my_fichas_title') : <>&nbsp;</>}
                    </h1>

                    {/* Filter Section */}
                    <div className="filter-section">
                        <div className="filter-grid">
                            <div className="form-group">
                                <label className="form-label">{hydrated ? t('my_fichas_filter_number_label') : <>&nbsp;</>}</label>
                                <input 
                                    type="text" 
                                    name="numero_ficha" 
                                    value={filters.numero_ficha} 
                                    onChange={handleFilterChange} 
                                    className="form-input"
                                    placeholder={hydrated ? t('my_fichas_filter_number_placeholder') : ''}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{hydrated ? t('my_fichas_filter_program_label') : <>&nbsp;</>}</label>
                                <input 
                                    type="text" 
                                    name="programa_formacion" 
                                    value={filters.programa_formacion} 
                                    onChange={handleFilterChange} 
                                    className="form-input"
                                    placeholder={hydrated ? t('my_fichas_filter_program_placeholder') : ''}
                                />
                            </div>
                            <div className="form-group">
                                <button onClick={handleApplyFilters} className="modern-button">
                                     {hydrated ? t('my_fichas_filter_button') : <>&nbsp;</>}
                                </button>

                            </div>
                        </div>
                    </div>

                    {(!hydrated || loading) ? (
                        <div className="loading-container">
                            <div className="loading-icon"></div>
                            <div className="loading-text">Cargando...</div>
                        </div>
                    ) : error ? (
                        <div className="error-container">
                            <div className="error-icon"></div>
                            <div className="error-text">{t('my_fichas_error_loading', { error: error })}</div>
                        </div>
                    ) : (
                        <div className="fichas-grid">
                            {fichas.length > 0 ? (
                                fichas.map(ficha => (
                                    <div key={ficha.id} className="ficha-card">
                                        <div className="ficha-header">
                                            <h2 className="ficha-numero">
                                                 {t('my_fichas_ficha_label')} {ficha.numero_ficha}
                                            </h2>
                                            <p className="ficha-programa">{ficha.programa_formacion}</p>
                                        </div>
                                        
                                        <div className="ficha-details">
                                            <div className="detail-item">
                                                <span className="detail-label"> {t('my_fichas_journey_label')}</span>
                                                <span className="detail-value">{ficha.jornada}</span>
                                            </div>
                                        </div>

                                        <div className="ficha-footer">
                                            <div className="students-count">
                                                <div className="students-icon"></div>
                                                <span>{t('my_fichas_students_label')} {ficha.students.length}</span>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-end gap-4">
                                                <Link href={`/dashboard/fichas/${ficha.id}/report`} className="action-link-button report">{t('my_fichas_view_report_button')}</Link>
                                                <Link href={`/dashboard/fichas/${ficha.id}/attendance`} className="action-link-button attendance">{t('my_fichas_view_attendance_button')}</Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-container" style={{ gridColumn: '1 / -1' }}>
                                    <div className="empty-icon"></div>
                                    <div className="empty-text">{t('my_fichas_no_fichas_assigned')}</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}