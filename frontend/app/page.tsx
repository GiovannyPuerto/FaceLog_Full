
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '../hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function HomePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { t, i18n } = useTranslation();

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

    const toggleLanguage = () => {
        const newLang = i18n.language === 'es' ? 'en' : 'es';
        i18n.changeLanguage(newLang);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <Image
                                src="/logo.png"
                                alt={t('landing_logo_alt')}
                                width={50}
                                height={50}
                                className="mr-3"
                            />
                            <h1 className="text-2xl font-bold text-gray-900">FaceLog</h1>
                        </div>
                        <div className="flex space-x-4">
                            <Link
                                href="/login"
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                            >
                                {t('landing_login_button')}
                            </Link>
                            <Link
                                href="/register"
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200"
                            >
                                {t('landing_register_button')}
                            </Link>
                            <button
                                onClick={toggleLanguage}
                                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200 flex items-center space-x-2"
                                title={t('language')}
                            >
                                <Globe size={20} />
                                <span>{i18n.language.toUpperCase()}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Hero Section */}
                    <div className="text-center">
                        <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl" dangerouslySetInnerHTML={{ __html: t('landing_welcome_title') }}>
                        </h2>
                        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                            {t('landing_subtitle')}
                        </p>
                        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                            <div className="rounded-md shadow">
                                <Link
                                    href="/login"
                                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                                >
                                    {t('landing_login_hero_button')}
                                </Link>
                            </div>
                            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                                <Link
                                    href="/register"
                                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                                >
                                    {t('landing_register_hero_button')}
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="mt-16">
                        <h3 className="text-3xl font-extrabold text-gray-900 text-center">
                            {t('landing_features_title')}
                        </h3>
                        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h4 className="text-xl font-semibold text-gray-900">{t('landing_feature_facial_recognition_title')}</h4>
                                <p className="mt-2 text-gray-600">
                                    {t('landing_feature_facial_recognition_desc')}
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h4 className="text-xl font-semibold text-gray-900">{t('landing_feature_user_management_title')}</h4>
                                <p className="mt-2 text-gray-600">
                                    {t('landing_feature_user_management_desc')}
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h4 className="text-xl font-semibold text-gray-900">{t('landing_feature_reports_title')}</h4>
                                <p className="mt-2 text-gray-600">
                                    {t('landing_feature_reports_desc')}
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h4 className="text-xl font-semibold text-gray-900">{t('landing_feature_excuses_title')}</h4>
                                <p className="mt-2 text-gray-600">
                                    {t('landing_feature_excuses_desc')}
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h4 className="text-xl font-semibold text-gray-900">{t('landing_feature_sessions_title')}</h4>
                                <p className="mt-2 text-gray-600">
                                    {t('landing_feature_sessions_desc')}
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h4 className="text-xl font-semibold text-gray-900">{t('landing_feature_interface_title')}</h4>
                                <p className="mt-2 text-gray-600">
                                    {t('landing_feature_interface_desc')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* How It Works Section */}
                    <div className="mt-16">
                        <h3 className="text-3xl font-extrabold text-gray-900 text-center">
                            {t('landing_how_it_works_title')}
                        </h3>
                        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
                            <div className="text-center">
                                <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
                                <h4 className="text-xl font-semibold text-gray-900">{t('landing_step1_title')}</h4>
                                <p className="mt-2 text-gray-600">
                                    {t('landing_step1_desc')}
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
                                <h4 className="text-xl font-semibold text-gray-900">{t('landing_step2_title')}</h4>
                                <p className="mt-2 text-gray-600">
                                    {t('landing_step2_desc')}
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
                                <h4 className="text-xl font-semibold text-gray-900">{t('landing_step3_title')}</h4>
                                <p className="mt-2 text-gray-600">
                                    {t('landing_step3_desc')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Benefits Section */}
                    <div className="mt-16 bg-gray-50 p-8 rounded-lg">
                        <h3 className="text-3xl font-extrabold text-gray-900 text-center">
                            {t('landing_benefits_title')}
                        </h3>
                        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h4 className="text-lg font-medium text-gray-900">{t('landing_benefit_efficiency_title')}</h4>
                                    <p className="mt-1 text-gray-600">
                                        {t('landing_benefit_efficiency_desc')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h4 className="text-lg font-medium text-gray-900">{t('landing_benefit_security_title')}</h4>
                                    <p className="mt-1 text-gray-600">
                                        {t('landing_benefit_security_desc')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h4 className="text-lg font-medium text-gray-900">{t('landing_benefit_accessibility_title')}</h4>
                                    <p className="mt-1 text-gray-600">
                                        {t('landing_benefit_accessibility_desc')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h4 className="text-lg font-medium text-gray-900">{t('landing_benefit_analysis_title')}</h4>
                                    <p className="mt-1 text-gray-600">
                                        {t('landing_benefit_analysis_desc')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Technologies Section */}
                    <div className="mt-16">
                        <h3 className="text-3xl font-extrabold text-gray-900 text-center">
                            {t('landing_technologies_title')}
                        </h3>
                        <p className="mt-4 text-gray-600 text-center max-w-3xl mx-auto">
                            {t('landing_technologies_desc')}
                        </p>
                        <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
                            <div className="text-center">
                                <div className="bg-blue-100 p-4 rounded-lg">
                                    <h4 className="text-lg font-semibold text-gray-900">{t('landing_tech_django_title')}</h4>
                                    <p className="mt-2 text-sm text-gray-600">{t('landing_tech_django_desc')}</p>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="bg-blue-100 p-4 rounded-lg">
                                    <h4 className="text-lg font-semibold text-gray-900">{t('landing_tech_nextjs_title')}</h4>
                                    <p className="mt-2 text-sm text-gray-600">{t('landing_tech_nextjs_desc')}</p>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="bg-blue-100 p-4 rounded-lg">
                                    <h4 className="text-lg font-semibold text-gray-900">{t('landing_tech_tensorflow_title')}</h4>
                                    <p className="mt-2 text-sm text-gray-600">{t('landing_tech_tensorflow_desc')}</p>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="bg-blue-100 p-4 rounded-lg">
                                    <h4 className="text-lg font-semibold text-gray-900">{t('landing_tech_postgresql_title')}</h4>
                                    <p className="mt-2 text-sm text-gray-600">{t('landing_tech_postgresql_desc')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="mt-16 bg-white p-8 rounded-lg shadow-md">
                        <h3 className="text-3xl font-extrabold text-gray-900 text-center">
                            {t('landing_about_title')}
                        </h3>
                        <p className="mt-4 text-gray-600 text-center max-w-3xl mx-auto">
                            {t('landing_about_desc1')}
                        </p>
                        <p className="mt-4 text-gray-600 text-center max-w-3xl mx-auto">
                            {t('landing_about_desc2')}
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <p>{t('landing_footer_text')}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
