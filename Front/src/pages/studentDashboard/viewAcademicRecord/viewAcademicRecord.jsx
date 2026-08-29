import React, { useState, useEffect } from 'react';
import StudentHeader from '../../../components/studentHeader';
import api from '../../../services/api'; 
import './viewAcademicRecord.css';

// Componente principal: ViewAcademicRecord
const ViewAcademicRecord = () => {
    const [loading, setLoading] = useState(true);
    const [record, setRecord] = useState([]);
    const [error, setError] = useState(null);

    // Função auxiliar para formatar a data (apenas Mês/Ano ou Ano)
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        // A data é dataConclusao, podemos mostrar o mês/ano
        const options = { year: 'numeric', month: 'short' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    };

    // Função para buscar o histórico acadêmico
    const fetchAcademicRecord = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Rota da API: GET /class/student/academicrecord
            const response = await api.get('/class/student/record');
            setRecord(response.data);

        } catch (err) {
            console.error("Erro ao buscar histórico:", err);
            
            if (err.response && err.response.status === 404) {
                 setError("Nenhum registro encontrado no histórico acadêmico.");
            } else {
                 setError("Não foi possível carregar o histórico. Verifique a conexão com a API.");
            }
            setRecord([]);
            
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAcademicRecord();
    }, []);

    // Função para determinar a classe CSS da situação (Aprovado/Reprovado)
    const getSituationClass = (situacao) => {
        if (!situacao) return '';
        const lowerCaseSituacao = situacao.toLowerCase();
        if (lowerCaseSituacao.includes('aprovado')) {
            return 'status-approved';
        } else if (lowerCaseSituacao.includes('reprovado')) {
            return 'status-failed';
        }
        return 'status-pending'; // Outras situações como 'Em Curso' ou 'Trancado'
    };


    if (loading) {
        return (
            <>
                <StudentHeader />
                <div className="record-container">
                    <p className="loading-text">Carregando Histórico Acadêmico...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <StudentHeader />
            <div className="record-container">
                <header className="record-header">
                    <h1 className="header-title">Histórico Acadêmico</h1>
                    <p className="header-subtitle">Visualize seu desempenho em turmas concluídas.</p>
                </header>

                {error && <div className="message error">{error}</div>}

                <div className="record-table-wrapper">
                    {record.length === 0 ? (
                        <p className="no-data-message">Você ainda não possui turmas concluídas no seu histórico.</p>
                    ) : (
                        <table className="academic-table">
                            <thead>
                                <tr>
                                    <th>Matéria</th>
                                    <th>Período</th>
                                    <th>Nota Final</th>
                                    <th>Situação</th>
                                    <th>Conclusão</th>
                                </tr>
                            </thead>
                            <tbody>
                                {record.map((item, index) => (
                                    <tr key={index}>
                                        <td className="materia-cell">{item.nomeMateria || 'N/A'}</td>
                                        <td>{item.nomePeriodo || 'N/A'}</td>
                                        <td className="note-cell">{item.notaFinal ? parseFloat(item.notaFinal).toFixed(2) : 'N/A'}</td>
                                        <td className={getSituationClass(item.situacao)}>
                                            {item.situacao ? item.situacao.charAt(0).toUpperCase() + item.situacao.slice(1).toLowerCase() : 'N/A'}
                                        </td>
                                        <td>{formatDate(item.dataConclusao)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
};

export default ViewAcademicRecord;