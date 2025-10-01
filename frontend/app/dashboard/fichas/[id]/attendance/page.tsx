"use client";
// frontend/app/dashboard/fichas/[id]/attendance/page.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '../../../../../lib/api'; // Adjust path as needed
import useAuth from '../../../../../hooks/useAuth'; // Adjust path as needed
import '../../../../../styles/InstructorFichasAttendance.css';

export default function FichaAttendancePage() {
    const { user } = useAuth();
    const params = useParams();
    const fichaId = params.id;

    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [fichaDetails, setFichaDetails] = useState(null); // New state for ficha details
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAttendance = async () => {
        if (!user || user.role !== 'instructor' || !fichaId) return;
        console.log("Fetching attendance for fichaId:", fichaId); // Add this line
        try {
            setLoading(true);
            // Assuming an API endpoint for fetching attendance for a specific ficha
            const response = await api.get(`attendance/fichas/${fichaId}/attendance-report/`);
            
            setAttendanceRecords(response.data.detailed_records);
            setFichaDetails(response.data.ficha);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch attendance records", err);
            setError("No se pudieron cargar los registros de asistencia.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [user, fichaId]);

    const getStatusColorClass = (status) => {
        switch (status.toLowerCase()) {
            case 'present': return 'bg-green-100 text-green-800 border-green-400';
            case 'absent': return 'bg-red-100 text-red-800 border-red-400';
            case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-400';
            case 'excused': return 'bg-blue-100 text-blue-800 border-blue-400';
            default: return 'bg-gray-100 text-gray-800 border-gray-400';
        }
    };

    const handleStatusChange = async (attendanceId, newStatus) => {
        try {
            // Optimistically update the UI
            setAttendanceRecords(prevRecords =>
                prevRecords.map(record =>
                    record.id === attendanceId ? { ...record, status: newStatus } : record
                )
            );

            await api.patch(`/attendance/attendance-log/${attendanceId}/update/`, { status: newStatus });
            // If successful, no need to re-fetch, UI is already updated
        } catch (err) {
            console.error("Failed to update attendance status", err);
            setError("No se pudo actualizar el estado de asistencia.");
            // Revert UI on error if optimistic update was done
            fetchAttendance(); // Re-fetch to ensure data consistency
        }
    };

    return (
        <>
            <style jsx global>{`
               
            `}</style>

            <div className="fichas-container">
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <Link href="/dashboard/instructor/my-fichas" className="back-button">
                        ← Volver a Mis Fichas
                    </Link>
                    <h1 className="modern-title">
                        Asistencia de Ficha {fichaDetails ? fichaDetails.numero_ficha : fichaId}
                    </h1>

                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-icon"></div>
                            <div className="loading-text">Cargando registros de asistencia...</div>
                        </div>
                    ) : error ? (
                        <div className="error-container">
                            <div className="error-icon"></div>
                            <div className="error-text">Error: {error}</div>
                        </div>
                    ) : attendanceRecords.length > 0 ? (
                        <div className="attendance-table-container">
                            <table className="attendance-table">
                                <thead>
                                    <tr>
                                        <th>Aprendiz</th>
                                        <th>Fecha</th>
                                        <th>Estado</th>
                                        <th>Hora de Registro</th>
                                        <th>Detalles de Excusa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceRecords.map((record, index) => (
                                        <tr key={`${record.student_name}-${record.date}-${index}`}>
                                            <td>{record.student_name}</td>
                                            <td>{new Date(record.date).toLocaleDateString('es-CO')}</td>
                                            <td>
                                                <select
                                                    value={record.status}
                                                    onChange={(e) => handleStatusChange(record.id, e.target.value)}
                                                    className={`p-1 rounded-md border ${getStatusColorClass(record.status)}`}
                                                >
                                                    <option value="present">Presente</option>
                                                    <option value="absent">Ausente</option>
                                                    <option value="late">Tarde</option>
                                                    <option value="excused">Excusado</option>
                                                </select>
                                            </td>
                                            <td>{record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString('es-CO') : 'N/A'}</td>
                                            <td>
                                                {record.status === 'excused' && record.excuse_reason && (
                                                    <div>
                                                        <p><strong>Razón:</strong> {record.excuse_reason}</p>
                                                        {record.excuse_document_url ? (
                                                            <a 
                                                                href={record.excuse_document_url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                className="text-blue-500 hover:underline"
                                                            >
                                                                Ver Adjunto
                                                            </a>
                                                        ) : (
                                                            <p>No hay adjunto</p>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-container">
                            <div className="empty-icon"></div>
                            <div className="empty-text">No hay registros de asistencia para esta ficha.</div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}