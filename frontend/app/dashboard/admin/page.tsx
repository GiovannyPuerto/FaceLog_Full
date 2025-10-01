"use client";
// frontend/app/dashboard/admin/page.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../../lib/api';
import useAuth from '../../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import '../../../styles/AdminDashboard.css';

const StatCard = ({ title, value, extra = null, gradient, icon }) => (
    <div
        className="stat-card"
        style={{ '--stat-gradient': gradient } as React.CSSProperties & Record<string, any>}
    >
        <div className="stat-card-body">
            <div className="stat-icon">{icon}</div>
            <div className="stat-content">
                <div className="stat-label">{title}</div>
                <div className="stat-value">{value}</div>
                {extra && <div className="stat-extra">{extra}</div>}
            </div>
        </div>
    </div>
);

export default function AdminDashboardPage() {

    const { t } = useTranslation();
    const { user, loading: authLoading } = useAuth();
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        let isMounted = true;

        const fetchGlobalReportData = async () => {
            setLoading(true);

            try {
                const response = await api.get('attendance/report/global/');
                if (isMounted) {
                    setReportData(response.data);
                    setError(null);
                }
            } catch (err) {
                console.error("Failed to fetch global report", err);
                if (isMounted) {
                    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                        setError("No tienes permiso para ver este dashboard.");
                    } else {
                        setError("No se pudo cargar el reporte global.");
                    }
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        if (!authLoading && user) {
            fetchGlobalReportData();
        }

        return () => {
            isMounted = false;
        };
    }, [user, authLoading]);

    if (!isMounted) {
        return null;
    }

    return (
        <>
            
            <div className="dashboard-container">
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <h1 className="modern-title">
                        {t('admin_dashboard.title')}
                    </h1>

                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-icon">⏳</div>
                            <div className="loading-text">{t('admin_dashboard.loading')}</div>
                        </div>
                    ) : error ? (
                        <div className="error-container">
                            <div className="error-icon">❌</div>
                            <div className="error-text">{error}</div>
                        </div>
                    ) : reportData ? (
                        <div className="stats-grid">
                            <StatCard title={t('admin_dashboard.total_fichas')} value={reportData.total_fichas} gradient="var(--stat1-gradient)" icon="📚"/>
                            <StatCard title={t('admin_dashboard.total_instructors')} value={reportData.total_instructors} gradient="var(--stat2-gradient)" icon="👨‍🏫"/>
                            <StatCard title={t('admin_dashboard.total_students')} value={reportData.total_students} gradient="var(--stat3-gradient)" icon="👥"/>
                            <StatCard title={t('admin_dashboard.total_sessions')} value={reportData.total_sessions} gradient="var(--stat4-gradient)" icon="📅"/>
                            <StatCard title={t('admin_dashboard.total_excuses')} value={reportData.total_excuses} gradient="var(--stat5-gradient)" icon="📄"/>
                            <StatCard title={t('admin_dashboard.pending_excuses')} value={reportData.pending_excuses_count} gradient="var(--stat1-gradient)" icon="🤔"/>
                        </div>
                    ) : (
                        <div className="loading-container">
                            <div className="loading-icon">🤷</div>
                            <div className="loading-text">{t('admin_dashboard.no_data')}</div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
