'use client';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from '../context/AuthContext';
import AppNavbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import useAuth from '../hooks/useAuth';
import I18nProvider from '../components/I18nProvider'; // New import
import LoadingSpinner from '../components/LoadingSpinner'; // Importar LoadingSpinner
import { usePathname } from 'next/navigation';

function AppLayout({ children }) {
    const { user, isSidebarOpen, loading } = useAuth(); // Obtener el estado loading
    const pathname = usePathname();

    const noLayoutPages = ['/login', '/register', '/forgot-password', '/reset-password'];
    const isAuthPage = noLayoutPages.some(path => pathname.startsWith(path));

    const showLayout = user && !isAuthPage;

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {loading && <LoadingSpinner />} {/* Mostrar spinner si está cargando */}
            {/* Sidebar fijo solo si hay usuario */}
            {showLayout && <Sidebar />}

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Navbar sticky */}
                {showLayout && <AppNavbar />}

                {/* Contenido principal */}
                <main
                    className="main-content"
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        marginTop: showLayout ? '0px' : '0',
                        marginLeft: showLayout && isSidebarOpen ? '225px' : '0px',
                        transition: 'all 0.3s ease',
                        padding: '1rem'
                    }}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es" data-bs-theme="dark">
            <head>
                <script src="https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"></script>
            </head>
            <body>
                <I18nProvider> {/* Wrap with I18nProvider */}
                    <AuthProvider>
                        <AppLayout>{children}</AppLayout>
                    </AuthProvider>
                </I18nProvider>
            </body>
        </html>
    );
}