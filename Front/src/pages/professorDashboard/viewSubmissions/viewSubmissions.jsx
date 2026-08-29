import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { jwtDecode } from 'jwt-decode';
import './viewSubmissions.css';

// Componente para exibir e gerenciar entregas de atividades
const ViewSubmissions = () => {
    const { idTurma } = useParams(); // ID da turma vem da URL
    const navigate = useNavigate();

    // Estados de dados
    const [activities, setActivities] = useState([]);
    const [selectedActivity, setSelectedActivity] = useState(null); // Atividade em foco (para mostrar entregas)
    const [submissions, setSubmissions] = useState([]); // Entregas da atividade selecionada

    // Estados de UI e carregamento
    const [loading, setLoading] = useState(true); // Carregando atividades
    const [isSubmissionsLoading, setIsSubmissionsLoading] = useState(false); // NOVO: Carregando entregas
    const [error, setError] = useState(null);
    const [evaluationStatus, setEvaluationStatus] = useState({}); // { idAtividade: 'success' | 'error' }

    // Estado para armazenar a nota que o professor está digitando para um aluno específico
    const [newScores, setNewScores] = useState({}); // { 'idAtividade-cpfAluno': 'valorDaNota' }
    
    // Decodifica o token para obter o CPF (mantido)
    const getCpf = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return null;
        }
        try {
            const user = jwtDecode(token);
            if (user.tipo !== 'professor') {
                 navigate('/professor/dashboard');
                 return null;
            }
            return user.cpf;
        } catch (e) {
            navigate('/login');
            return null;
        }
    };

    // Função para buscar a lista de atividades da turma (Mantido)
    useEffect(() => {
        const fetchActivities = async () => {
            const cpfProfessor = getCpf();
            if (!cpfProfessor || !idTurma) {
                setError("Dados de professor ou turma ausentes.");
                setLoading(false);
                return;
            }

            try {
                const response = await api.get(`class/professor/activities/${idTurma}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                setActivities(response.data || []);
                setError(null);

            } catch (err) {
                console.error("Erro ao carregar atividades:", err);
                setError("Falha ao carregar as atividades. Verifique se a rota '/professor/activities/:idTurma' está correta e ativa.");
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, [idTurma, navigate]);

    // Função para buscar as entregas de uma atividade específica (CORRIGIDA)
    const fetchSubmissions = async (idAtividade) => {
        
        const activityDetails = activities.find(act => act.id === idAtividade);

        if (selectedActivity && selectedActivity.id === idAtividade) {
            // Se já estiver selecionado, desseleciona
            setSelectedActivity(null);
            setSubmissions([]);
            return;
        }

        setSelectedActivity(activityDetails);
        setSubmissions([]); // Limpa as entregas anteriores
        setIsSubmissionsLoading(true);

        try {
            // 🚨 ENDPOINT NECESSÁRIO NO BACKEND: /professor/activity/:idAtividade/submissions
            // Este endpoint deve retornar uma lista de entregas.
            
            const response = await api.get(`class/professor/activities/${idAtividade}/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            // Assumindo que a API retorna um array de objetos:
            // [{ cpfAluno, nomeAluno, linkEntrega, notaAtual }]
            setSubmissions(response.data || []);

        } catch (err) {
            console.error("Erro ao carregar entregas:", err);
            // Mostrar erro na área de detalhes
            setSubmissions(null); 
            alert("Não foi possível carregar as entregas desta atividade. Verifique o endpoint de submissions.");
        } finally {
            setIsSubmissionsLoading(false);
        }
    };

    // Lida com a mudança de nota no input (Mantido)
    const handleScoreChange = (idAtividade, cpfAluno, value) => {
        setNewScores(prev => ({
            ...prev,
            [`${idAtividade}-${cpfAluno}`]: value
        }));
    };

    // Função para enviar a nota do aluno (Mantido)
    const handleEvaluate = async (idAtividade, cpfAluno) => {
        const nota = newScores[`${idAtividade}-${cpfAluno}`];

        if (nota === undefined || nota === null || nota === '') {
            alert('Por favor, insira uma nota.');
            return;
        }
        
        const notaNumerica = Number(nota);
        if (isNaN(notaNumerica) || notaNumerica < 0 || notaNumerica > selectedActivity.notaMaxima) {
            alert(`A nota deve ser um número entre 0 e ${selectedActivity.notaMaxima}.`);
            return;
        }

        setEvaluationStatus(prev => ({ ...prev, [cpfAluno]: 'loading' }));

        try {
            // Rota: router.patch("/professor/activities/:idAtividade/:cpfAluno")
            await api.patch(`class/professor/activities/${idAtividade}/${cpfAluno}`, 
                { nota: notaNumerica },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            // Atualiza a nota na lista de entregas
            setSubmissions(prev => prev.map(sub => 
                sub.cpfAluno === cpfAluno ? { ...sub, notaAtual: notaNumerica } : sub
            ));
            
            setEvaluationStatus(prev => ({ ...prev, [cpfAluno]: 'success' }));
            setTimeout(() => setEvaluationStatus(prev => ({ ...prev, [cpfAluno]: null })), 3000);

        } catch (error) {
            console.error("Erro ao avaliar atividade:", error);
            setEvaluationStatus(prev => ({ ...prev, [cpfAluno]: 'error' }));
            alert("Falha ao salvar a nota. Tente novamente.");
        }
    };

    if (loading) {
        return <div className="submissions-container"><p>Carregando atividades...</p></div>;
    }

    if (error) {
        return <div className="submissions-container"><p className="error-message">{error}</p></div>;
    }

    return (
        <div className="submissions-container">
            <h1>Entregas de Atividades da Turma ID: {idTurma}</h1>

            <div className="activities-list">
                <h3>Atividades Cadastradas:</h3>
                {activities.length === 0 ? (
                    <p>Nenhuma atividade avaliativa cadastrada nesta turma.</p>
                ) : (
                    activities.map(activity => (
                        <div 
                            key={activity.id} 
                            className={`activity-card ${selectedActivity && selectedActivity.id === activity.id ? 'selected' : ''}`}
                            onClick={() => fetchSubmissions(activity.id)}
                        >
                            <h4>{activity.titulo}</h4>
                            <p>Fechamento: {new Date(activity.dataFechamento).toLocaleDateString()}</p>
                            <p>Nota Máxima: **{activity.notaMaxima}**</p>
                            <button className="view-btn">{selectedActivity && selectedActivity.id === activity.id ? 'Fechar Entregas' : 'Ver Entregas'}</button>
                        </div>
                    ))
                )}
            </div>

            {selectedActivity && (
                <div className="submissions-detail">
                    <h2>Entregas para: {selectedActivity.titulo}</h2>
                    <p>Descrição: {selectedActivity.descricao}</p>
                    <p className="max-score">Valor Máximo: {selectedActivity.notaMaxima}</p>
                    
                    {isSubmissionsLoading && <p>Carregando entregas dos alunos...</p>}
                    
                    {!isSubmissionsLoading && submissions === null && (
                        <p className="error-message">Não foi possível buscar a lista de entregas.</p>
                    )}

                    {!isSubmissionsLoading && submissions && submissions.length === 0 && (
                         <p>Nenhuma entrega encontrada para esta atividade.</p>
                    )}

                    {!isSubmissionsLoading && submissions && submissions.length > 0 && (
                        <table className="submissions-table">
                            <thead>
                                <tr>
                                    <th>Aluno</th>
                                    <th>Link da Entrega</th>
                                    <th>Nota Atual</th>
                                    <th>Nova Nota (Máx: {selectedActivity.notaMaxima})</th>
                                    <th>Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map(submission => (
                                    <tr key={submission.cpfAluno}>
                                        <td>{submission.nomeAluno}</td>
                                        <td>
                                            {submission.linkEntrega ? (
                                                <a href={submission.linkEntrega} target="_blank" rel="noopener noreferrer" className="link-entrega">
                                                    Visualizar Entrega
                                                </a>
                                            ) : (
                                                <span className="no-submission">Não entregue</span>
                                            )}
                                        </td>
                                        <td className="current-score">
                                            {submission.notaAtual !== null ? submission.notaAtual : '-'}
                                        </td>
                                        <td className="score-input-cell">
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max={selectedActivity.notaMaxima}
                                                // Garante que o input seja controlado
                                                value={newScores[`${selectedActivity.id}-${submission.cpfAluno}`] !== undefined 
                                                       ? newScores[`${selectedActivity.id}-${submission.cpfAluno}`] 
                                                       : submission.notaAtual || ''}
                                                onChange={(e) => handleScoreChange(selectedActivity.id, submission.cpfAluno, e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <button
                                                className={`evaluate-btn ${evaluationStatus[submission.cpfAluno]}`}
                                                onClick={() => handleEvaluate(selectedActivity.id, submission.cpfAluno)}
                                                disabled={evaluationStatus[submission.cpfAluno] === 'loading' || !submission.linkEntrega}
                                            >
                                                {evaluationStatus[submission.cpfAluno] === 'loading' && 'Salvando...'}
                                                {evaluationStatus[submission.cpfAluno] === 'success' && 'Salvo!'}
                                                {evaluationStatus[submission.cpfAluno] === 'error' && 'Erro!'}
                                                {!evaluationStatus[submission.cpfAluno] && 'Salvar Nota'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default ViewSubmissions;