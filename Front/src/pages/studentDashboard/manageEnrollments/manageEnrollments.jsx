import React, { useState, useEffect } from 'react';
import StudentHeader from '../../../components/studentHeader';
import api from '../../../services/api';
import './manageEnrollments.css';

// Componente principal: ManageEnrollments
const ManageEnrollments = () => {
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [error, setError] = useState(null);
    const [statusMessage, setStatusMessage] = useState(null); // Mensagens de sucesso/conflito
    const [isSubmitting, setIsSubmitting] = useState(null); // ID da turma em processo de inscrição

    // Função auxiliar para formatar a data
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    };
    
    // Função auxiliar para filtrar turmas
    const filterOpenClasses = (classesList) => {
        const now = new Date();
        return classesList.filter(turma => {
            if (!turma.dataFechamentoFila) return true; // Se não tem data de fechamento, consideramos aberta
            
            const closingDate = new Date(turma.dataFechamentoFila);
            return closingDate > now;
        });
    };

    // Função para buscar todas as turmas
    const fetchClasses = async () => {
        setLoading(true);
        setError(null);
        try {
            // Rota da API: /class/ (Permitido para aluno)
            const response = await api.get('/class/');
            
            const filtered = filterOpenClasses(response.data);
            setClasses(filtered);

        } catch (err) {
            console.error("Erro ao buscar turmas:", err);
            setError("Não foi possível carregar as turmas disponíveis.");
        } finally {
            setLoading(false);
        }
    };

    // Função para tentar se inscrever na fila
    const handleEnroll = async (idTurma) => {
        setIsSubmitting(idTurma);
        setStatusMessage(null);
        setError(null);

        try {
            // Rota da API: POST /class/student/:idTurma
            const response = await api.post(`/class/student/${idTurma}`);
            
            if (response.status === 201) {
                setStatusMessage({ type: 'success', text: response.data.msg });
            }

        } catch (err) {
            console.error("Erro ao tentar matricular:", err);
            const msg = err.response?.data?.msg || "Erro desconhecido ao tentar inscrição.";
            
            // Lógica de status code do Controller:
            if (err.response?.status === 409) { // ALREADY_QUEUED
                 setStatusMessage({ type: 'warning', text: msg });
            } else if (err.response?.status === 403 || err.response?.status === 404) { // PROFESSOR_BLOCKED / NOT_FOUND
                 setError(msg);
            } else {
                 setError(msg);
            }

        } finally {
            setIsSubmitting(null);
            // Re-fetch para ver se o status da turma mudou (opcional, mas bom para UX)
            // fetchClasses(); 
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);
    
    // Limpa a mensagem de status após 5 segundos
    useEffect(() => {
        if (statusMessage) {
            const timer = setTimeout(() => setStatusMessage(null), 7000);
            return () => clearTimeout(timer);
        }
    }, [statusMessage]);


    if (loading) {
        return (
            <>
                <StudentHeader />
                <div className="enrollments-container"><p className="loading-text">Buscando turmas abertas...</p></div>
            </>
        );
    }

    return (
        <>
            <StudentHeader />
            <div className="enrollments-container">
                <h1 className="dashboard-title">Gerenciar Matrículas</h1>
                <p className="dashboard-subtitle">Turmas com fila de espera aberta. Inscreva-se para garantir sua vaga.</p>

                {statusMessage && (
                    <div className={`message ${statusMessage.type}`}>
                        {statusMessage.text}
                    </div>
                )}
                {error && <div className="message error">{error}</div>}

                <div className="classes-grid">
                    {classes.length === 0 ? (
                        <p className="no-data-message">Nenhuma turma com fila de inscrição aberta no momento.</p>
                    ) : (
                        classes.map((turma) => (
                            <div key={turma.id} className="class-card">
                                <h2 className="card-title">{turma.nomeMateria}</h2>
                                <p className="card-subtitle">Período: {turma.nomePeriodo || 'N/A'}</p>
                                
                                <div className="class-details">
                                    <p>Professor: {turma.nomeProfessor || 'Não Atribuído'}</p>
                                    <p className="closing-date">
                                        Fechamento da Fila: {formatDate(turma.dataFechamentoFila)}
                                    </p>
                                </div>

                                <div className="card-actions">
                                    <button 
                                        className="action-btn primary" 
                                        onClick={() => handleEnroll(turma.id)}
                                        disabled={isSubmitting === turma.id}
                                    >
                                        {isSubmitting === turma.id ? 'Processando...' : 'Inscrever-se na Fila 📝'}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default ManageEnrollments;