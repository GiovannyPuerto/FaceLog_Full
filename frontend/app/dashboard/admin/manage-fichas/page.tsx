"use client";

//frontend/app/dashboard/admin/manage-fichas/page.tsx
import { useState, useEffect, useCallback } from 'react';

import Link from 'next/link';
import api from '../../../../lib/api';
import useAuth from '../../../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import '../../../../styles/Admin-fichas.css';

// Modal Component with theme support
const Modal = ({ children, onClose }) => (
    <div className="modal-overlay">
        <div className="modal-content">
            <button onClick={onClose} className="modal-close-btn">&times;</button>
            {children}
        </div>
    </div>
);

export default function ManageFichasPage() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [fichas, setFichas] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFicha, setEditingFicha] = useState(null);
    const [filters, setFilters] = useState({ numero_ficha: '', programa_formacion: '', instructor: '' });

    const fetchFichas = useCallback(async () => {
        if (!user || user.role !== 'admin') return;
        setLoading(true);
        try {
            const response = await api.get('attendance/fichas/', { params: filters });
            setFichas(response.data.results || []);
        } catch (err) {
            setError(t('admin_manage_fichas.error'));
        } finally {
            setLoading(false);
        }
    }, [user, filters]);

    useEffect(() => {
        const fetchInstructors = async () => {
            if (!user || user.role !== 'admin') return;
            try {
                const response = await api.get('auth/users/', { params: { role: 'instructor' } });
                setInstructors(response.data.results || []);
            } catch (err) {
                console.error("Failed to fetch instructors for filter", err);
            }
        };

        if (user) {
            fetchFichas();
            fetchInstructors();
        }
    }, [user, fetchFichas]);

    const handleApplyFilters = () => {
        fetchFichas();
    };

    const handleDelete = async (fichaId) => {
        if (!confirm(t('admin_manage_fichas.confirm_delete'))) return;
        try {
            await api.delete(`attendance/fichas/${fichaId}/`);
            alert("Ficha eliminada con éxito.");
            fetchFichas(); // Refresh list
        } catch (err) {
            alert(t('admin_manage_fichas.error_deleting'));
        }
    };

    const handleOpenModal = (ficha = null) => {
        setEditingFicha(ficha);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingFicha(null);
    };
    
    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            numero_ficha: formData.get('numero_ficha'),
            programa_formacion: formData.get('programa_formacion'),
            jornada: formData.get('jornada'),
            instructor_ids: formData.getAll('instructor_ids')
        };
        
        if (!data.numero_ficha || !data.programa_formacion) {
            alert(t('admin_manage_fichas.required_fields'));
            return;
        }

        try {

            if (editingFicha) {
                await api.patch(`attendance/fichas/${editingFicha.id}/`, data);
            } else {
                await api.post('attendance/fichas/', data);
            }
            alert("Ficha guardada con éxito.");
            fetchFichas(); // Refresh list

            handleCloseModal();
        } catch (err) {

            alert(t('admin_manage_fichas.error_saving', { error: err.response?.data?.detail || Object.values(err.response?.data || {}).flat().join(', ') || t('unknown_error') }));

            const errorMsg = err.response?.data?.detail || Object.values(err.response?.data || {}).flat().join(', ') || 'Error desconocido';
            alert(`Error al guardar la ficha: ${errorMsg}`);
 
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };


    if (loading) return <div className="text-center p-10">Cargando fichas...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

    return (
        <>

            <div className="manage-fichas-container">
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-icon">⏳</div>
                            <div className="loading-text">{t('admin_manage_fichas.loading')}</div>
                        </div>
                    ) : error ? (
                        <div className="error-container">
                            <div className="error-icon">❌</div>
                            <div className="error-text">{error}</div>
                        </div>
                    ) : (
                        <>
                            <div className="page-header">
                                <h1 className="modern-title">
                                    {t('admin_manage_fichas.title')}
                                </h1>
                                <button onClick={() => handleOpenModal()} className="modern-button">
                                    {t('admin_manage_fichas.create_ficha')}
                                </button>
                            </div>

                            <div className="filter-section">
                                <div className="filter-grid">
                                    <div className="form-group">
                                        <label className="form-label">{t('admin_manage_fichas.filter_by_number')}</label>
                                        <input 
                                            type="text" 
                                            name="numero_ficha" 
                                            value={filters.numero_ficha} 
                                            onChange={handleFilterChange} 
                                            className="form-input"
                                            placeholder={t('admin_manage_fichas.filter_by_number') + '...'}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('admin_manage_fichas.filter_by_program')}</label>
                                        <input 
                                            type="text" 
                                            name="programa_formacion" 
                                            value={filters.programa_formacion} 
                                            onChange={handleFilterChange} 
                                            className="form-input"
                                            placeholder={t('admin_manage_fichas.filter_by_program') + '...'}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('admin_manage_fichas.filter_by_instructor')}</label>
                                        <select 
                                            name="instructor" 
                                            value={filters.instructor} 
                                            onChange={handleFilterChange} 
                                            className="form-select"
                                        >
                                            <option value="">{t('admin_manage_fichas.all_instructors')}</option>
                                            {instructors.map(inst => (
                                                <option key={inst.id} value={inst.id}>
                                                    {inst.first_name} {inst.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <button onClick={handleApplyFilters} className="modern-button">
                                            {t('admin_manage_fichas.filter_button')}
                                        </button>
                                    </div>
                                </div>
                            </div>


                
                                <div className="table-card">
                                <table className="modern-table">
                                    <thead className="table-header">
                                        <tr>
                                            <th>{t('admin_manage_fichas.table_header_number')}</th>
                                            <th>{t('admin_manage_fichas.table_header_program')}</th>
                                            <th>{t('admin_manage_fichas.table_header_journey')}</th>
                                            <th>{t('admin_manage_fichas.table_header_instructors')}</th>
                                            <th>{t('admin_manage_fichas.table_header_actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fichas.map(ficha => (
                                            <tr key={ficha.id} className="table-row">
                                                <td className="table-cell" data-label={t('admin_manage_fichas.table_header_number')}>{ficha.numero_ficha}</td>
                                                <td className="table-cell" data-label={t('admin_manage_fichas.table_header_program')}>{ficha.programa_formacion}</td>
                                                <td className="table-cell" data-label={t('admin_manage_fichas.table_header_journey')}>{ficha.jornada || 'N/A'}</td>
                                                <td className="table-cell" data-label={t('admin_manage_fichas.table_header_instructors')}>
                                                    {ficha.instructors?.map(i => i.username).join(', ') || 'N/A'}
                                                </td>
                                                <td className="table-cell" data-label={t('admin_manage_fichas.table_header_actions')}>
                                                    <div className="action-buttons">
                                                        <button 
                                                            onClick={() => handleOpenModal(ficha)} 
                                                            className="action-button action-edit"
                                                        >
                                                            {t('admin_manage_fichas.edit_button')}
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(ficha.id)} 
                                                            className="action-button action-delete"
                                                        >
                                                            {t('admin_manage_fichas.delete_button')}
                                                        </button>
                                                        <Link 
                                                            href={`/dashboard/fichas/${ficha.id}/report`} 
                                                            className="action-button action-report"
                                                        >
                                                            {t('admin_manage_fichas.report_button')}
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                </div>
            </div>

            {isModalOpen && (
                <Modal onClose={() => setIsModalOpen(false)}>
                    <h2 className="modal-title">
                        {editingFicha ? t('admin_manage_fichas.modal_edit_title') : t('admin_manage_fichas.modal_create_title')}
                    </h2>
                    <form onSubmit={handleSave} className="modal-form">
                        <div className="form-group">
                            <label className="form-label">{t('admin_manage_fichas.modal_number_label')}</label>
                            <input 
                                type="text" 
                                name="numero_ficha" 
                                defaultValue={editingFicha?.numero_ficha} 
                                className="form-input" 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t('admin_manage_fichas.modal_program_label')}</label>
                            <input 
                                type="text" 
                                name="programa_formacion" 
                                defaultValue={editingFicha?.programa_formacion} 
                                className="form-input" 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t('admin_manage_fichas.modal_journey_label')}</label>
                            <input 
                                type="text" 
                                name="jornada" 
                                defaultValue={editingFicha?.jornada} 
                                className="form-input" 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t('admin_manage_fichas.modal_instructors_label')}</label>
                            <select 
                                multiple 
                                name="instructor_ids" 
                                defaultValue={editingFicha?.instructors?.map(i => i.id)} 
                                className="form-multiselect"
                            >
                                {instructors.map(inst => (
                                    <option key={inst.id} value={inst.id}>
                                        {inst.first_name} {inst.last_name} ({inst.username})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button 
                                type="button" 
                                onClick={() => setIsModalOpen(false)} 
                                className="modern-button secondary-button"
                            >
                                {t('admin_manage_fichas.modal_cancel')}
                            </button>
                            <button 
                                type="submit" 
                                className="modern-button success-button"
                            >
                                {t('admin_manage_fichas.modal_save')}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
}
