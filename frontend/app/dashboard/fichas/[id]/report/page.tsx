"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '../../../../../lib/api';
import useAuth from '../../../../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import '../../../../../i18n';
import { useHydrated } from '../../../../../hooks/useHydrated';
import '../../../../../styles/InstructorFichasReport.css';

export default function FichaReportPage() {
    const { user } = useAuth();
    const params = useParams();
    const fichaId = params.id;
    const { t } = useTranslation();
    const hydrated = useHydrated();

    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchReportData = async () => {
            if (!user || !fichaId) return;
            if (user.role !== 'admin' && user.role !== 'instructor') return;

            try {
                setLoading(true);
                const response = await api.get(`attendance/fichas/${fichaId}/attendance-report/`);
                if (isMounted) {
                    setReportData(response.data);
                    setError(null);
                }
            } catch (err) {
                console.error("Failed to fetch report data", err);
                if (isMounted) {
                    setError(t('ficha_report.error_loading'));
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        if (user && fichaId) {
            fetchReportData();
        }

        return () => {
            isMounted = false;
        };
    }, [user, fichaId, t]);

    const backUrl = user?.role === 'admin' ? '/dashboard/admin/manage-fichas' : '/dashboard/instructor/my-fichas';

    return (
        <>
            <style jsx global>{`
               
            `}</style>

            <div className="fichas-container">
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    {hydrated && (
                        <Link href={backUrl} className="back-button">
                            {t('ficha_report.back_button')}
                        </Link>
                    )}
                    <h1 className="modern-title">
                        {hydrated ? `${t('ficha_report.title_prefix')} ${reportData?.ficha?.numero_ficha || fichaId}` : ''}
                    </h1>

                    {(!hydrated || loading) ? (
                        <div className="loading-container">
                            <div className="loading-icon"></div>
                            <div className="loading-text">{t('ficha_report.loading')}</div>
                        </div>
                    ) : error ? (
                        <div className="error-container">
                            <div className="error-icon"></div>
                            <div className="error-text">{t('ficha_report.error', { error: error })}</div>
                        </div>
                    ) : reportData ? (
                        <div className="report-section">
                            <div className="report-summary">
                                <div className="summary-item">
                                    <h3>{t('ficha_report.total_students')}</h3>
                                    <p>{reportData.total_students}</p>
                                </div>
                                <div className="summary-item">
                                    <h3>{t('ficha_report.total_present')}</h3>
                                    <p>{reportData.total_present}</p>
                                </div>
                                <div className="summary-item">
                                    <h3>{t('ficha_report.total_absent')}</h3>
                                    <p>{reportData.total_absent}</p>
                                </div>
                                <div className="summary-item">
                                    <h3>{t('ficha_report.total_late')}</h3>
                                    <p>{reportData.total_late}</p>
                                </div>
                            </div>

                            {reportData.detailed_records && reportData.detailed_records.length > 0 && (
                                <div className="report-detail-table-container">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">{t('ficha_report.detailed_records_title')}</h2>
                                    <table className="report-detail-table">
                                        <thead>
                                            <tr>
                                                <th>{t('ficha_report.table_header_student')}</th>
                                                <th>{t('ficha_report.table_header_date')}</th>
                                                <th>{t('ficha_report.table_header_status')}</th>
                                                <th>{t('ficha_report.table_header_time')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.detailed_records.map((record, index) => (
                                                <tr key={`${record.student_name}-${record.date}-${index}`}>
                                                    <td>{record.student_name}</td>
                                                    <td>{new Date(record.date).toLocaleDateString('es-CO')}</td>
                                                    <td>{record.status}</td>
                                                    <td>{record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString('es-CO') : t('ficha_report.not_applicable')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="empty-container">
                            <div className="empty-icon"></div>
                            <div className="empty-text">{t('ficha_report.no_data')}</div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
