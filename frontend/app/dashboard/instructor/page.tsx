"use client";

import { useState, useEffect } from 'react';
import useAuth from '../../../hooks/useAuth';
import Link from 'next/link';
import api from '../../../lib/api';
import { Container, Card, Row, Col, Button, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import '../../../i18n';
import '../../../styles/InstructorDashboard.css';

const StatCard = ({ title, value, icon, color }) => (
    <Card className="modern-stat-card h-100">
        <Card.Body className="d-flex align-items-center p-4">
            <div 
                className="modern-stat-icon me-3"
                style={{ ['--stat-color' as any]: color } as React.CSSProperties}
            >
                {icon}
            </div>
            <div className="flex-grow-1">
                <h3 className="modern-stat-title mb-1">{title}</h3>
                <p className="modern-stat-value mb-0">{value}</p>
            </div>
        </Card.Body>
    </Card>
);

export default function InstructorDashboard() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        const fetchSummary = async () => {
            if (user?.role !== 'instructor') return;
            try {
                setLoading(true);
                const response = await api.get('attendance/dashboard/instructor/summary/');
                setSummary(response.data);
            } catch (error) {
                console.error("Failed to fetch instructor summary", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchSummary();
    }, [user]);

    return (
        <>
            <style jsx global>{`
                
            `}</style>

            

            <div className="modern-dashboard-container">
                <div className="main-Content">
                    <h1 className="modern-title">
                        {isClient ? t('dashboard_title') : '\u00A0'}
                    </h1>
                    
                    {loading ? (
                        <div className="modern-loading">
                            <Spinner animation="border" className="modern-spinner" />
                            <div className="modern-loading-text">
                                {isClient ? t('loading_summary') : '\u00A0'}
                            </div>
                        </div>
                    ) : summary && (
                        <Row className="g-4 mb-5">
                            <Col xs={12} sm={6} lg={3}>
                                <StatCard 
                                    title={isClient ? t('assigned_fichas') : '\u00A0'} 
                                    value={summary.total_assigned_fichas} 
                                    icon="📚"
                                    color="var(--stat-primary)"
                                />
                            </Col>
                            <Col xs={12} sm={6} lg={3}>
                                <StatCard 
                                    title={isClient ? t('today_sessions') : '\u00A0'} 
                                    value={summary.today_sessions} 
                                    icon="📅"
                                    color="var(--stat-success)"
                                />
                            </Col>
                            <Col xs={12} sm={6} lg={3}>
                                <StatCard 
                                    title={isClient ? t('pending_excuses') : '\u00A0'} 
                                    value={summary.pending_excuses} 
                                    icon="⏳"
                                    color="var(--stat-warning)"
                                />
                            </Col>
                            <Col xs={12} sm={6} lg={3}>
                                <StatCard 
                                    title={isClient ? t('total_students') : '\u00A0'} 
                                    value={summary.total_students_in_assigned_fichas} 
                                    icon="👥"
                                    color="var(--stat-info)"
                                />
                            </Col>
                        </Row>
                    )}

                    <Card className="modern-action-card">
                        <Card.Body className="p-5 text-center">
                            <h2 className="modern-card-title">
                                {isClient ? t('attendance_manage_title') : '\u00A0'}
                            </h2>
                            <p className="modern-card-description">
                                {isClient ? t('attendance_manage_desc') : '\u00A0'}
                            </p>
                            <Link 
                                href="/dashboard/instructor/attendance"
                                className="modern-action-button"
                            >
                                 {isClient ? t('attendance_button') : '\u00A0'}
                            </Link>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </>
    );
}