import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../../../components/AdminHeader';
import api from '../../../../services/api';
import './manageReports.css'; // 💡 IMPORTANDO O ARQUIVO CSS SEPARADO

// --- COMPONENTE AUXILIAR: ReportCard ---
const ReportCard = ({ title, data, headers }) => {
    if (!data || data.length === 0) {
        return (
            <div className="report-card">
                <h3>{title}</h3>
                <p className="no-data">Nenhum dado encontrado.</p>
            </div>
        );
    }

    return (
        <div className="report-card">
            <h3>{title}</h3>
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            {headers.map((header, index) => (
                                <th key={index}>{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, rowIndex) => (
                            <tr key={rowIndex}>
                                {Object.values(item).map((value, colIndex) => (
                                    <td key={colIndex}>
                                        {/* Formata números com uma casa decimal se for média/nota */}
                                        {typeof value === 'number' ? value.toFixed(1) : value}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// -------------------------------------------------------------
// COMPONENTE PRINCIPAL: ReportViewer
// -------------------------------------------------------------

const ReportViewer = () => {
    const navigate = useNavigate();
    
    const [reports, setReports] = useState({
        avgGrades: [],
        belowFive: [],
        mostActiveProfessor: [],
        betterRatedClasses: [],
        studentProfessors: [],
        mostActiveStudent: [],
    });

    const [subjects, setSubjects] = useState([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };


    // Busca Matérias (Para filtro de relatório)
    const fetchSubjects = useCallback(async () => {
        try {
            const response = await api.get('/subject/', config);
            if (Array.isArray(response.data) && response.data.length > 0) {
                setSubjects(response.data);
                setSelectedSubjectId(response.data[0].id); 
            } else if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
                setSubjects([response.data]);
                setSelectedSubjectId(response.data.id);
            } else {
                setSubjects([]);
            }
        } catch (error) {
            console.error("Erro ao carregar matérias:", error);
            setMessage({ text: "Não foi possível carregar as matérias para o filtro.", type: "error" });
        }
    }, [config]);


    // Busca todos os relatórios (exceto o que depende do ID da matéria)
    const fetchReports = useCallback(async () => {
        setLoading(true);
        setMessage({ text: '', type: '' });
        
        try {
            const [
                belowFiveRes,
                mostActiveProfRes,
                betterRatedRes,
                bothRes,
                mostActiveStudentRes,
            ] = await Promise.all([
                api.get('/reports/belowFive', config),
                api.get('/reports/mostClassesProfessor', config),
                api.get('/reports/betterRatedClasses', config),
                api.get('/reports/both', config),
                api.get('/reports/mostActiveStudent', config),
            ]);
            

            setReports(prev => ({
                ...prev,
                belowFive: belowFiveRes.data || [],
                mostActiveProfessor: mostActiveProfRes.data || [],
                betterRatedClasses: betterRatedRes.data || [],
                studentProfessors: bothRes.data || [],
                mostActiveStudent: mostActiveStudentRes.data || [],
            }));

        } catch (error) {
            console.error("Erro ao carregar relatórios:", error);
            setMessage({ text: 'Falha ao carregar um ou mais relatórios. Verifique o console para detalhes.', type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [config]);


    // Busca Média Geral de Notas por Turma (Depende do idMateria)
    const fetchAvgGrades = useCallback(async () => {
        if (!selectedSubjectId) {
             setReports(prev => ({ ...prev, avgGrades: [] })); 
             return;
        }
        setLoading(true);
        try {
            const response = await api.get(`/reports/avgGrades/${selectedSubjectId}`, config);
            setReports(prev => ({
                ...prev,
                avgGrades: response.data || [],
            }));
        } catch (error) {
            console.error("Erro ao carregar média de notas:", error);
            setMessage({ text: 'Falha ao carregar a média de notas para a matéria selecionada.', type: 'error' });
            setReports(prev => ({ ...prev, avgGrades: [] })); 
        } finally {
            setLoading(false);
        }
    }, [selectedSubjectId, config]);


    useEffect(() => {
        fetchSubjects();
        fetchReports();
    }, [fetchSubjects, fetchReports]);
    
    useEffect(() => {
        if (selectedSubjectId) {
            fetchAvgGrades();
        }
    }, [selectedSubjectId, fetchAvgGrades]);

    
    const handleSubjectChange = (e) => {
        setSelectedSubjectId(Number(e.target.value)); // Garante que o ID é um número
    };


    return (
        <div className="report-viewer-layout"> 
            <AdminHeader />

            <main className="manage-content"> 
                <h1 className="page-title">📊 Painel de Relatórios</h1>
                
                <div className="action-bar">
                    <button onClick={() => navigate('/admin/dashboard')} className="btn-back">← Voltar ao Painel</button>
                </div>
                
                {message.text && (
                    <div className={`message-feedback message-${message.type}`}>{message.text}</div>
                )}
                
                {/* RELATÓRIO: Média Geral de Notas por Período/Matéria */}
                <div className="report-filter-section">
                    <h3>Média Geral de Notas por Período/Matéria</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <label htmlFor="subject-select">Selecione a Matéria:</label>
                        <select 
                            id="subject-select"
                            onChange={handleSubjectChange} 
                            value={selectedSubjectId} 
                            disabled={loading || subjects.length === 0}
                        >
                             {subjects.length === 0 ? (
                                <option value="">Nenhuma matéria disponível</option>
                            ) : (
                                subjects.map(sub => (
                                    <option key={sub.id} value={sub.id}>
                                        {sub.nome} ({sub.periodo}° Período)
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    <ReportCard
                        title={`Média por Período (Matéria: ${subjects.find(s => s.id === selectedSubjectId)?.nome || 'Selecionada'})`}
                        data={reports.avgGrades}
                        headers={['Matéria', 'Período', 'Média Geral']}
                    />
                </div>
                
                <hr />

                {/* Demais Relatórios (Mantidos com o mesmo padrão) */}
                <ReportCard
                    title="Top 3 Melhores Turmas (Desempenho Médio)"
                    data={reports.betterRatedClasses}
                    headers={['Matéria', 'Período Letivo', 'Média Geral']}
                />
                
                <hr />

                <ReportCard
                    title="Alunos com Notas Abaixo da Média (Nota Final < 5.0)"
                    data={reports.belowFive}
                    headers={['Aluno', 'CPF', 'Matéria', 'Período', 'Nota Final']}
                />

                <hr />

                <ReportCard
                    title="Professor Mais Ativo (Maior Número de Turmas)"
                    data={reports.mostActiveProfessor}
                    headers={['Nome', 'CPF', 'Total de Turmas']}
                />
                
                <hr />

                <ReportCard
                    title="Usuários com Papel Duplo (Aluno e Professor)"
                    data={reports.studentProfessors}
                    headers={['Nome', 'CPF']}
                />
                
                <hr />
                
                <ReportCard
                    title="Aluno com Maior Número de Matérias Cursadas"
                    data={reports.mostActiveStudent}
                    headers={['Nome', 'CPF', 'Total de Matérias']}
                />
                
            </main>

            <footer className="admin-footer-simple">© 2025 Sistema de Gestão.</footer>
        </div>
    );
};

export default ReportViewer;