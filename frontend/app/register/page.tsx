"use client";

import { useState, useRef, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import Link from 'next/link';
import { Container, Card, Form, Button, Alert, Modal, Row, Col, Image } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useHydrated } from '../../hooks/useHydrated';
import { Sun, Moon, Globe, Home } from 'lucide-react';
import '../../i18n';
import '../../styles/Register.css';

// --- Camera Capture Modal Component (using react-bootstrap) ---
const CameraCaptureModal = ({ isOpen, onClose, onCapture }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const { t } = useTranslation();

    const startCamera = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error("Error accessing camera: ", error);
                alert(t('register_camera_error_alert'));
            }
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(onCapture, 'image/jpeg');
        }
    };

    useEffect(() => {
        if (isOpen) {
            startCamera();
        }
        return () => stopCamera();
    }, [isOpen]);

    return (
        <Modal show={isOpen} onHide={onClose} size="lg" centered className="modern-modal">
            <Modal.Header closeButton className="modern-modal-header">
                <Modal.Title className="modern-modal-title">
                    {t('register_camera_modal_title')}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center modern-modal-body">
                <div style={{ position: 'relative', width: '100%' }}>
                    <video ref={videoRef} autoPlay playsInline className="modern-video"></video>
                    <div className="camera-overlay">
                        <div className="face-guide"></div>
                    </div>
                </div>
                <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                <p className="mt-3 modern-camera-text">
                    {t('register_camera_modal_instructions')}
                </p>
            </Modal.Body>
            <Modal.Footer className="modern-modal-footer">
                <Button variant="secondary" onClick={onClose} className="modern-button-secondary">
                    {t('register_camera_modal_close_button')}
                </Button>
                <Button variant="primary" onClick={handleCapture} className="modern-button-primary">
                    {t('register_camera_modal_capture_button')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

// --- Main Register Page Component (using react-bootstrap) ---
export default function RegisterPage() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', password2: '', first_name: '', last_name: '', student_id: '', ficha_numero: '' });
    const { register, error, loading } = useAuth();
    const { t, i18n } = useTranslation();
    const [theme, setTheme] = useState('light');

    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [faceImage, setFaceImage] = useState(null); // Stores actual image file/blob
    const [faceImagePreview, setFaceImagePreview] = useState(null); // Stores URL for preview
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
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // New functions
    const handleCapture = (imageBlob) => {
        const newImage = new File([imageBlob], `face_${Date.now()}.jpeg`, { type: 'image/jpeg' });
        setFaceImage(newImage);
        if (faceImagePreview) {
            URL.revokeObjectURL(faceImagePreview); // Clean up previous preview URL
        }
        setFaceImagePreview(URL.createObjectURL(imageBlob));
        setIsCameraOpen(false); // Close modal after capturing the single image
    };

    const handleRemoveImage = () => { // No index needed, just remove the single image
        if (faceImagePreview) {
            URL.revokeObjectURL(faceImagePreview); // Clean up preview URL
        }
        setFaceImage(null);
        setFaceImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.password2) { alert(t("passwords_do_not_match")); return; }
        if (!faceImage) { alert(t("register_no_face_image_error")); return; } // New validation

        const dataToSubmit = new FormData();
        for (const key in formData) {
            dataToSubmit.append(key, formData[key]);
        }
        // Append single face image to formData
        dataToSubmit.append('face_image', faceImage); // Changed from 'face_images' to 'face_image'

        await register(dataToSubmit);
    };

    return (
        <>
            <style jsx global>{`
                
            `}</style>

            <div className="home-button-container">
                <Link href="/landing" className="control-button" title="Home">
                    <Home size={22} />
                </Link>
            </div>

            <div className="control-buttons-container">
                <div
                    className="control-button"
                    onClick={toggleTheme}
                    title={hydrated ? t('common_change_theme') : 'Cambiar tema'}
                >
                    {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
                </div>
                <div
                    className="control-button"
                    onClick={toggleLanguage}
                    title={hydrated ? t('language') : 'Idioma'}
                >
                    <Globe size={22} />
                    <span className="language-text ms-1">{i18n.language.toUpperCase()}</span>
                </div>
            </div>

            <Container className="modern-container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
                <Card className="modern-card w-100" style={{ maxWidth: '900px' }}>
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
                                    📝
                                </div>
                                <h1 className="modern-title mb-0">
                                    {hydrated ? t('register_page_title') : 'Crear Nueva Cuenta'}
                                </h1>
                            </div>
                            <p className="modern-text mb-4" style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                                {hydrated ? t('register_page_subtitle') : 'Únete a nuestra comunidad y comienza tu viaje'}
                            </p>
                        </div>

                        <Form onSubmit={handleSubmit}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Control
                                            name="first_name"
                                            placeholder={hydrated ? t('register_first_name_placeholder') : 'Nombre(s)'}
                                            onChange={handleChange}
                                            required
                                            className="modern-input"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Control
                                            name="last_name"
                                            placeholder={hydrated ? t('register_last_name_placeholder') : 'Apellido(s)'}
                                            onChange={handleChange}
                                            required
                                            className="modern-input"
                                        />
                                                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Control
                                            name="username"
                                            placeholder={hydrated ? t('register_username_placeholder') : 'Nombre de Usuario'}
                                            onChange={handleChange}
                                            required
                                            className="modern-input"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Control
                                            name="email"
                                            type="email"
                                            placeholder={hydrated ? t('register_email_placeholder') : 'Correo Electrónico'}
                                            onChange={handleChange}
                                            required
                                            className="modern-input"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Control
                                            name="password"
                                            type="password"
                                            placeholder={hydrated ? t('register_password_placeholder') : 'Contraseña'}
                                            onChange={handleChange}
                                            required
                                            className="modern-input"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Control
                                            name="password2"
                                            type="password"
                                            placeholder={hydrated ? t('register_confirm_password_placeholder') : 'Confirmar Contraseña'}
                                            onChange={handleChange}
                                            required
                                            className="modern-input"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Control
                                            name="student_id"
                                            placeholder={hydrated ? t('register_student_id_placeholder') : 'Número de Documento'}
                                            onChange={handleChange}
                                            required
                                            className="modern-input"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Control
                                            name="ficha_numero"
                                            placeholder={hydrated ? t('register_ficha_number_placeholder') : 'Número de Ficha'}
                                            onChange={handleChange}
                                            required
                                            className="modern-input"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            
                            <div className="modern-photo-section text-center">
                                <Form.Label className="modern-label d-block mb-3">
                                     {hydrated ? t('face_photos_title') : 'Fotos de Rostro (Mínimo 1)'}
                                </Form.Label>
                                <Button
                                    variant="info"
                                    onClick={() => setIsCameraOpen(true)}
                                    className="modern-button-info mb-3"
                                    disabled={!!faceImage} // Disable if an image is already captured
                                >
                                     {hydrated ? t('take_photo_button') : 'Tomar Foto'}
                                </Button>
                                <div className="d-flex flex-wrap justify-content-center">
                                    {faceImagePreview && ( // Only show if a preview exists
                                        <div className="photo-preview">
                                            <Image 
                                                src={faceImagePreview} 
                                                alt={t('photo_preview_alt', { index: 1 })} 
                                                roundedCircle 
                                                style={{ width: '120px', height: '120px', objectFit: 'cover' }} 
                                            />
                                            <div
                                                className="photo-remove-btn"
                                                onClick={handleRemoveImage} // No index needed
                                            >
                                                ×
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {!faceImagePreview && ( // Show message if no photo captured
                                    <p className="modern-text mt-3 mb-0">
                                         {hydrated ? t('no_photos_captured_yet') : 'Aún no se han capturado fotos'}
                                    </p>
                                )}
                            </div>
                            
                            {error && (
                                <Alert variant="danger" className="modern-alert mt-3">
                                    ⚠️ {error}
                                </Alert>
                            )}
                            
                            <Button 
                                variant="success" 
                                type="submit" 
                                className="modern-button-success w-100 mt-4" 
                                disabled={loading || !faceImage} // Disable if no faceImage
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        {hydrated ? t('registering_button') : 'Registrando...'}
                                    </>
                                ) : (
                                    <>
                                         {hydrated ? t('create_account_button') : 'Crear Cuenta'}
                                    </>
                                )}
                            </Button>
                        </Form>
                        <div className="text-center mt-4">
                            <p className="modern-text">
                                {hydrated ? t('already_have_account') : '¿Ya tienes una cuenta?'} {' '}
                                <Link href="/login" className="modern-link">
                                    {hydrated ? t('login_here_link') : 'Inicia sesión aquí'}
                                </Link>
                            </p>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
            <CameraCaptureModal 
                isOpen={isCameraOpen} 
                onClose={() => setIsCameraOpen(false)} 
                onCapture={handleCapture} 
            />
        </>
    );
}