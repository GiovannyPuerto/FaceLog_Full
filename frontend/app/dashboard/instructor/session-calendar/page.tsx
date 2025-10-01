"use client";
// frontend/app/dashboard/instructor/session-calendar/page.tsx
import { useState, useEffect } from 'react';
import api from '../../../../lib/api';
import useAuth from '../../../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useHydrated } from '../../../../hooks/useHydrated';
import '../../../../styles/InstructorSessionCalendar.css'

export default function SessionCalendarPage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const hydrated = useHydrated();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    const fetchSessions = async () => {
        if (!user || user.role !== 'instructor') return;
        try {
            setLoading(true);
            const response = await api.get('attendance/sessions/');
            setSessions(response.data.results || response.data);
        } catch (err) {
            setError(t('session_calendar.error_loading'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, [user]);

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const handlePrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const getSessionsForDay = (day) => {
        return sessions.filter(session => {
            const sessionDate = new Date(session.date);
            const adjustedSessionDate = new Date(sessionDate.getUTCFullYear(), sessionDate.getUTCMonth(), sessionDate.getUTCDate());
            return adjustedSessionDate.toDateString() === day.toDateString();
        });
    };

    const monthName = hydrated ? t('session_calendar.months', { returnObjects: true })[currentDate.getMonth()] : '';

    return (
        <>
            <style jsx global>{`
                
            `}</style>

            <div className="calendar-container">
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h1 className="modern-title">
                        {hydrated ? t('session_calendar.title') : <>&nbsp;</>}
                    </h1>

                    {(!hydrated || loading) ? (
                        <div className="loading-container">
                            <div className="loading-icon"></div>
                            <div className="loading-text">{hydrated ? t('session_calendar.loading') : 'Cargando...'}</div>
                        </div>
                    ) : error ? (
                        <div className="error-container">
                            <div className="error-icon"></div>
                            <div className="error-text">{hydrated ? t('session_calendar.error_loading') : 'Error'}</div>
                        </div>
                    ) : (
                        <div className="calendar-card">
                            <div className="calendar-header">
                                <button onClick={handlePrevMonth} className="calendar-nav-button">
                                    {hydrated ? t('session_calendar.previous_month') : <>&nbsp;</>}
                                </button>
                                <h2 className="calendar-month-title">
                                    {monthName} {currentDate.getFullYear()}
                                </h2>
                                <button onClick={handleNextMonth} className="calendar-nav-button">
                                    {hydrated ? t('session_calendar.next_month') : <>&nbsp;</>}
                                </button>
                            </div>

                            <div className="calendar-content">
                                <div className="calendar-weekdays">
                                    <div className="weekday-header">{hydrated ? t('session_calendar.weekday_sun') : 'D'}</div>
                                    <div className="weekday-header">{hydrated ? t('session_calendar.weekday_mon') : 'L'}</div>
                                    <div className="weekday-header">{hydrated ? t('session_calendar.weekday_tue') : 'M'}</div>
                                    <div className="weekday-header">{hydrated ? t('session_calendar.weekday_wed') : 'M'}</div>
                                    <div className="weekday-header">{hydrated ? t('session_calendar.weekday_thu') : 'J'}</div>
                                    <div className="weekday-header">{hydrated ? t('session_calendar.weekday_fri') : 'V'}</div>
                                    <div className="weekday-header">{hydrated ? t('session_calendar.weekday_sat') : 'S'}</div>
                                </div>
                                
                                <div className="calendar-grid">
                                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                        <div key={`empty-${i}`} className="calendar-day" style={{ opacity: 0 }}></div>
                                    ))}
                                    {daysInMonth.map(day => {
                                        const daySessions = getSessionsForDay(day);
                                        const isToday = day.toDateString() === new Date().toDateString();
                                        const hasSession = daySessions.length > 0;
                                        
                                        return (
                                            <div 
                                                key={day.toISOString()} 
                                                className={`calendar-day ${isToday ? 'today' : ''} ${hasSession ? 'has-sessions' : ''}`}
                                                title={hydrated && hasSession ? t(daySessions.length > 1 ? 'session_calendar.day_title_multiple_sessions' : 'session_calendar.day_title_single_session', { count: daySessions.length }) : ''}
                                            >
                                                <div className="day-number">{day.getDate()}</div>
                                                {hasSession && (
                                                    <div className="sessions-container">
                                                        {daySessions.map(session => (
                                                            <div 
                                                                key={session.id} 
                                                                className="session-pill"
                                                                title={hydrated ? t('session_calendar.session_pill_title', { ficha: session.ficha.numero_ficha, time: session.start_time }) : ''}
                                                            >
                                                                {session.ficha.numero_ficha} ({session.start_time})
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}