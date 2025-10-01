"use client";
// frontend/app/landing/page.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '../../hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { Globe, LogIn, UserPlus, Shield, Users, BarChart3, FileCheck, Calendar, Layout, CheckCircle, Sun, Moon } from 'lucide-react';
import '../../styles/landing.css';
export default function HomePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    useEffect(() => {
        if (!loading && user) {
            switch (user.role) {
                case 'instructor':
                    router.replace('/dashboard/instructor');
                    break;
                case 'student':
                    router.replace('/dashboard/student');
                    break;
                case 'admin':
                    router.replace('/dashboard/admin');
                    break;
                default:
                    router.replace('/login');
            }
        }
    }, [user, loading, router]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'es' ? 'en' : 'es';
        i18n.changeLanguage(newLang);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <div className="landing-page">
                {/* Header */}
                <header className="modern-header">
                    <div className="modern-header-content">
                        <div className="modern-logo-section">
                            <h1 className="modern-logo-text">FaceLog</h1>
                        </div>
                        <div className="modern-header-actions">
                            <Link href="/login" className="modern-btn modern-btn-outline">
                                <LogIn size={20} />
                                {t('landing_login_button')}
                            </Link>
                            <Link href="/register" className="modern-btn modern-btn-primary">
                                <UserPlus size={20} />
                                {t('landing_register_button')}
                            </Link>
                            <button
                                onClick={toggleTheme}
                                className="modern-btn modern-btn-icon"
                                title="Toggle theme"
                            >
                                {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
                            </button>
                            <button
                                onClick={toggleLanguage}
                                className="modern-btn modern-btn-icon"
                                title={t('language')}
                            >
                                <Globe size={20} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="modern-hero">
                    <Image
                        src="/logo.png"
                        alt={t('landing_logo_alt')}
                        width={250}
                        height={250}
                        style={{objectFit: 'contain', marginBottom: '1rem'}}
                    />
                    <h2 className="modern-hero-title" dangerouslySetInnerHTML={{ __html: t('landing_welcome_title') }}></h2>
                    <p className="modern-hero-subtitle">
                        {t('landing_subtitle')}
                    </p>
                    <div className="modern-hero-actions">
                        <Link href="/login" className="modern-btn modern-btn-primary modern-btn-large">
                            <LogIn size={24} />
                            {t('landing_login_hero_button')}
                        </Link>
                        <Link href="/register" className="modern-btn modern-btn-outline modern-btn-large">
                            <UserPlus size={24} />
                            {t('landing_register_hero_button')}
                        </Link>
                    </div>
                </section>

                {/* Features Section */}
                <section className="modern-section">
                    <h3 className="modern-section-title">
                        {t('landing_features_title')}
                    </h3>
                    <div className="modern-features-grid">
                        <div className="modern-feature-card">
                            <div className="modern-feature-icon">
                                <Shield size={28} />
                            </div>
                            <h4 className="modern-feature-title">{t('landing_feature_facial_recognition_title')}</h4>
                            <p className="modern-feature-desc">
                                {t('landing_feature_facial_recognition_desc')}
                            </p>
                        </div>
                        <div className="modern-feature-card">
                            <div className="modern-feature-icon">
                                <Users size={28} />
                            </div>
                            <h4 className="modern-feature-title">{t('landing_feature_user_management_title')}</h4>
                            <p className="modern-feature-desc">
                                {t('landing_feature_user_management_desc')}
                            </p>
                        </div>
                        <div className="modern-feature-card">
                            <div className="modern-feature-icon">
                                <BarChart3 size={28} />
                            </div>
                            <h4 className="modern-feature-title">{t('landing_feature_reports_title')}</h4>
                            <p className="modern-feature-desc">
                                {t('landing_feature_reports_desc')}
                            </p>
                        </div>
                        <div className="modern-feature-card">
                            <div className="modern-feature-icon">
                                <FileCheck size={28} />
                            </div>
                            <h4 className="modern-feature-title">{t('landing_feature_excuses_title')}</h4>
                            <p className="modern-feature-desc">
                                {t('landing_feature_excuses_desc')}
                            </p>
                        </div>
                        <div className="modern-feature-card">
                            <div className="modern-feature-icon">
                                <Calendar size={28} />
                            </div>
                            <h4 className="modern-feature-title">{t('landing_feature_sessions_title')}</h4>
                            <p className="modern-feature-desc">
                                {t('landing_feature_sessions_desc')}
                            </p>
                        </div>
                        <div className="modern-feature-card">
                            <div className="modern-feature-icon">
                                <Layout size={28} />
                            </div>
                            <h4 className="modern-feature-title">{t('landing_feature_interface_title')}</h4>
                            <p className="modern-feature-desc">
                                {t('landing_feature_interface_desc')}
                            </p>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="modern-section">
                    <h3 className="modern-section-title">
                        {t('landing_how_it_works_title')}
                    </h3>
                    <div className="modern-steps-grid">
                        <div className="modern-step-card">
                            <div className="modern-step-number">1</div>
                            <h4 className="modern-step-title">{t('landing_step1_title')}</h4>
                            <p className="modern-step-desc">
                                {t('landing_step1_desc')}
                            </p>
                        </div>
                        <div className="modern-step-card">
                            <div className="modern-step-number">2</div>
                            <h4 className="modern-step-title">{t('landing_step2_title')}</h4>
                            <p className="modern-step-desc">
                                {t('landing_step2_desc')}
                            </p>
                        </div>
                        <div className="modern-step-card">
                            <div className="modern-step-number">3</div>
                            <h4 className="modern-step-title">{t('landing_step3_title')}</h4>
                            <p className="modern-step-desc">
                                {t('landing_step3_desc')}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="modern-section">
                    <div className="modern-benefits-container">
                        <h3 className="modern-section-title">
                            {t('landing_benefits_title')}
                        </h3>
                        <div className="modern-benefits-grid">
                            <div className="modern-benefit-item">
                                <div className="modern-benefit-icon">
                                    <CheckCircle size={20} />
                                </div>
                                <div className="modern-benefit-content">
                                    <h4>{t('landing_benefit_efficiency_title')}</h4>
                                    <p>{t('landing_benefit_efficiency_desc')}</p>
                                </div>
                            </div>
                            <div className="modern-benefit-item">
                                <div className="modern-benefit-icon">
                                    <CheckCircle size={20} />
                                </div>
                                <div className="modern-benefit-content">
                                    <h4>{t('landing_benefit_security_title')}</h4>
                                    <p>{t('landing_benefit_security_desc')}</p>
                                </div>
                            </div>
                            <div className="modern-benefit-item">
                                <div className="modern-benefit-icon">
                                    <CheckCircle size={20} />
                                </div>
                                <div className="modern-benefit-content">
                                    <h4>{t('landing_benefit_accessibility_title')}</h4>
                                    <p>{t('landing_benefit_accessibility_desc')}</p>
                                </div>
                            </div>
                            <div className="modern-benefit-item">
                                <div className="modern-benefit-icon">
                                    <CheckCircle size={20} />
                                </div>
                                <div className="modern-benefit-content">
                                    <h4>{t('landing_benefit_analysis_title')}</h4>
                                    <p>{t('landing_benefit_analysis_desc')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Technologies Section */}
                <section className="modern-section">
                    <h3 className="modern-section-title">
                        {t('landing_technologies_title')}
                    </h3>
                    <p className="modern-about-text">
                        {t('landing_technologies_desc')}
                    </p>
                    <div className="modern-tech-grid">
                        <div className="modern-tech-card">
                            <h4 className="modern-tech-title">{t('landing_tech_django_title')}</h4>
                            <p className="modern-tech-desc">{t('landing_tech_django_desc')}</p>
                        </div>
                        <div className="modern-tech-card">
                            <h4 className="modern-tech-title">{t('landing_tech_nextjs_title')}</h4>
                            <p className="modern-tech-desc">{t('landing_tech_nextjs_desc')}</p>
                        </div>
                        <div className="modern-tech-card">
                            <h4 className="modern-tech-title">{t('landing_tech_tensorflow_title')}</h4>
                            <p className="modern-tech-desc">{t('landing_tech_tensorflow_desc')}</p>
                        </div>
                        <div className="modern-tech-card">
                            <h4 className="modern-tech-title">{t('landing_tech_postgresql_title')}</h4>
                            <p className="modern-tech-desc">{t('landing_tech_postgresql_desc')}</p>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section className="modern-section">
                    <div className="modern-about-container">
                        <h3 className="modern-section-title">
                            {t('landing_about_title')}
                        </h3>
                        <p className="modern-about-text">
                            {t('landing_about_desc1')}
                        </p>
                        <p className="modern-about-text">
                            {t('landing_about_desc2')}
                        </p>
                    </div>
                </section>

                {/* Footer */}
                <footer className="modern-footer">
                    <p>{t('landing_footer_text')}</p>
                </footer>
            </div>
        </>
    );
}