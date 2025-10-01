"use client";

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import useAuth from '../../../hooks/useAuth';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import '../../../styles/AprendizDashboard.css';


// Helper to get color based on status
const getStatusColor = (status) => {
    switch (status) {
        case 'present':
            return 'status-present';
        case 'absent':
            return 'status-absent';
        case 'late':
            return 'status-late';
        case 'excused':
            return 'status-excused';
        default:
            return 'status-default';
    }
};

const StatCard = ({ title, value, description }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-transform hover:-translate-y-1">
        <h3 className="text-lg font-semibold text-gray-400">{title}</h3>
        <p className="text-3xl font-bold text-white mt-2">{value}</p>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
    </div>
);


export default function StudentDashboardPage() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const router = useRouter();
    const [summary, setSummary] = useState(null);
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [absences, setAbsences] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user || user.role !== 'student') return;
            try {
                const [summaryRes, upcomingRes, absencesRes, logsRes] = await Promise.all([
                    api.get('attendance/dashboard/apprentice/summary/'),
                    api.get('attendance/dashboard/apprentice/upcoming-sessions/'),
                    api.get('attendance/absences/'),
                    api.get('attendance/attendance-logs/')
                ]);
                setSummary(summaryRes.data);
                setUpcomingSessions(upcomingRes.data.results || upcomingRes.data);
                setAbsences(absencesRes.data.results || absencesRes.data);
                setLogs(logsRes.data.results || logsRes.data);
            } catch (err) {
                setError(t('student_dashboard.error_loading'));
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, t]);

    if (!isMounted) {
        return null; // O un spinner de carga
    }

    return (
        <>
            <style jsx global>{`
                
            `}</style>


            <div className="student-dashboard-container">
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h1 className="modern-title">
                        {t('student_dashboard.title')}
                    </h1>
                    
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-icon">⏳</div>
                            <div className="loading-text">{t('student_dashboard.loading')}</div>
                        </div>
                    ) : (
                        <>
                            {summary && (
                                <div style={{ marginBottom: '3rem' }}>
                                    <h2 className="section-title">{t('student_dashboard.summary_title')}</h2>
                                    <div className="stats-grid">
                                        <div className="stat-card success">
                                            <div className="stat-card-body">
                    
                                                <div className="stat-content">
                                                    <div className="stat-label">{t('student_dashboard.attendance_percentage')}</div>
                                                    <div className="stat-value">{summary.attendance_percentage}%</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="stat-card danger">
                                            <div className="stat-card-body">
                                                <div className="stat-content">
                                                    <div className="stat-label">{t('student_dashboard.absences')}</div>
                                                    <div className="stat-value">{summary.absent_count}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="stat-card warning">
                                            <div className="stat-card-body">
                                                
                                                <div className="stat-content">
                                                    <div className="stat-label">{t('student_dashboard.late_arrivals')}</div>
                                                    <div className="stat-value">{summary.late_count}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h2 className="section-title">{t('student_dashboard.attendance_history_title')}</h2>
                                <div className="history-card">
                                    <ul className="history-list">
                                        {logs.length > 0 ? (
                                            logs.map(log => (
                                                <li key={log.id} className="history-item">
                                                    <div>
                                                        <div className="history-date">
                                                            {new Date(log.session.date).toLocaleDateString(undefined, { 
                                                                year: 'numeric', 
                                                                month: 'long', 
                                                                day: 'numeric' 
                                                            })}
                                                        </div>
                                                        <div className="history-ficha">
                                                            {t('student_dashboard.ficha')}: {log.session.ficha.numero_ficha}
                                                        </div>
                                                    </div>
                                                    <div className="history-details">
                                                        {log.check_in_time && (
                                                            <div className="history-time">
                                                                {t('student_dashboard.check_in_time')}: {new Date(log.check_in_time).toLocaleTimeString()}
                                                            </div>
                                                        )}
                                                        <span className={`status-badge ${getStatusColor(log.status)}`}>
                                                            {log.status === 'present' ? t('student_dashboard.status_present') :
                                                             log.status === 'absent' ? t('student_dashboard.status_absent') :
                                                             log.status === 'late' ? t('student_dashboard.status_late') :
                                                             log.status === 'excused' ? t('student_dashboard.status_excused') : log.status}
                                                        </span>
                                                        {log.status === 'absent' && (
                                                            <button
                                                                onClick={() => router.push(`/dashboard/student/excuses?session_id=${log.session.id}`)}
                                                                className="add-excuse-button"
                                                            >
                                                                Agregar Excusa
                                                            </button>
                                                        )}
                                                    </div>
                                                </li>
                                            ))
                                        ) : (
                                            <div className="empty-container">
                                                <div className="empty-icon">📭</div>
                                                <div className="empty-text">
                                                    {t('student_dashboard.no_records')}
                                                </div>
                                            </div>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
