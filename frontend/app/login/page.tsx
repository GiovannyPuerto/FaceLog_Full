"use client";

import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import Link from 'next/link';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import Image from 'next/image';
import { Sun, Moon, Globe, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../../i18n';
import { useHydrated } from '../../hooks/useHydrated';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/Login.css';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, error, loading } = useAuth();
    const { t, i18n } = useTranslation();
    const [theme, setTheme] = useState('light');
    const hydrated = useHydrated();

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Sincronizar el idioma de i18next con el estado local si es necesario
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
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        login(username, password);
    };

    if (!hydrated) {
        return <LoadingSpinner />;
    }

    return (
        <>
            <div className="home-button-container">
                <Link href="/landing" className="control-button" title="Home">
                    <Home size={22} />
                </Link>
            </div>

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
                    title={t('language')}
                >
                    <Globe size={22} />
                    <span className="language-text ms-1">{i18n.language.toUpperCase()}</span>
                </div>
            </div>

            <Container 
                className="modern-container d-flex align-items-center justify-content-center" 
                style={{ minHeight: '100vh' }}
            >
                <Card className="modern-card w-100" style={{ maxWidth: '450px' }}>
                    <Card.Body className="p-1 p-md-5">
                        <div className="text-center mb-4">
                                <Image className= "logo" src="/logo.png" alt="Face Log Logo" width={260} height={115} priority />
                            <p className="modern-text mb-4" style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                                {t('login_subtitle')}
                            </p>
                        </div>
                        
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-4" controlId="formBasicUsername">
                                <Form.Label className="modern-label">
                                     {t('login_username_label')}
                                </Form.Label>
                                <Form.Control 
                                    type="text" 
                                    placeholder={t('login_username_placeholder')}
                                    value={username} 
                                    onChange={(e) => setUsername(e.target.value)} 
                                    required 
                                    className="modern-input"
                                />
                            </Form.Group>

                            <Form.Group className="mb-4" controlId="formBasicPassword">
                                <Form.Label className="modern-label">
                                     {t('login_password_label')}
                                </Form.Label>
                                <Form.Control 
                                    type="password" 
                                    placeholder={t('login_password_placeholder')}
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                    className="modern-input"
                                />
                            </Form.Group>

                            {error && (
                                <Alert variant="danger" className="modern-alert mb-4">
                                    ⚠️ {t('login_error_generic')}
                                </Alert>
                            )}

                            <Button 
                                variant="primary" 
                                type="submit" 
                                className="modern-button w-100 mb-4" 
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        {t('login_loading_button')}
                                    </>
                                ) : (
                                    <>
                                         {t('login_button')}
                                    </>
                                )}
                            </Button>
                        </Form>
                        
                        <div className="text-center">
                            <p className="modern-text mb-3">
                                {t('login_no_account')} {' '}
                                <Link href="/register" className="modern-link">
                                    {t('login_register_link')}
                                </Link>
                            </p>
                            <p className="modern-text mb-0">
                                <Link href="/forgot-password" className="modern-link">
                                    {t('login_forgot_password')}
                                </Link>
                            </p>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        </>
    );
}