'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import Link from 'next/link';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Globe } from 'lucide-react';
import '../../i18n';
import '../../styles/Forgot-password.css';

export default function ForgotPasswordPage() {
    const { t, i18n } = useTranslation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const router = useRouter();
    const [theme, setTheme] = useState('light');

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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await api.post('auth/password/reset/', { email });
            const token = response.data.token;
            
            setSuccess(t('forgot_password_success_message'));
            
            setTimeout(() => {
                router.push(`/reset-password?token=${token}`);
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.error || t('forgot_password_error_message'));
            setLoading(false);
        }
    };

    return (
        <>
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
                    <Card.Body className="p-4 p-md-5">
                        <div className="text-center mb-4">
                            <div className="d-flex justify-content-center align-items-center mb-3">
                                <div 
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        background: 'var(--button-gradient)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '24px',
                                        marginRight: '15px',
                                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
                                    }}
                                >
                                    🔑
                                </div>
                                <h1 className="modern-title mb-0">
                                    {t('forgot_password_page_title')}
                                </h1>
                            </div>
                            <p className="modern-text mb-4" style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                                {t('forgot_password_page_subtitle')}
                            </p>
                        </div>
                        
                        {success ? (
                            <Alert variant="success" className="modern-alert alert-success mb-4">
                                ✅ {success}
                            </Alert>
                        ) : (
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-4" controlId="formBasicEmail">
                                    <Form.Label className="modern-label">
                                         {t('forgot_password_email_label')}
                                    </Form.Label>
                                    <Form.Control 
                                        type="email" 
                                        placeholder={t('forgot_password_email_placeholder')} 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        required 
                                        className="modern-input"
                                    />
                                </Form.Group>

                                {error && (
                                    <Alert variant="danger" className="modern-alert alert-danger mb-4">
                                        ⚠️ {error}
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
                                            {t('forgot_password_sending_button')}
                                        </>
                                    ) : (
                                        <>
                                             {t('forgot_password_send_link_button')}
                                        </>
                                    )}
                                </Button>
                            </Form>
                        )}
                        
                        <div className="text-center">
                            <p className="modern-text mb-0">
                                {t('forgot_password_remembered_password')} {' '}
                                <Link href="/login" className="modern-link">
                                    {t('forgot_password_back_to_login')}
                                </Link>
                            </p>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        </>
    );
}