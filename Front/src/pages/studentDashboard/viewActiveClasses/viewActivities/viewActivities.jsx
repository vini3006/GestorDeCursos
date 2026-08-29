import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentHeader from '../../../../components/studentHeader';
import api from '../../../../services/api';
import './viewActivities.css';

// Componente de Modal de Entrega (Integrado)
const SubmissionModal = ({ isOpen, onClose, activityId, activityTitle, onSubmit }) => {
    const [link, setLink] = useState('');
    const [submissionError, setSubmissionError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmissionError(null);
        setSubmitting(true);

        if (!link.trim()) {
            setSubmissionError("O campo de link não pode estar vazio.");
            setSubmitting(false);
            return;
        }

        try {
            // Chama a função passada pelo componente pai
            await onSubmit(activityId, link);
            setLink(''); // Limpa o link após sucesso
            onClose();
        } catch (error) {
            console.error("Erro ao enviar atividade:", error);
            const msg = error.response?.data?.msg || "Falha na entrega. Tente novamente.";
            setSubmissionError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>&times;</button>
                <h2 className="modal-title">Entregar: {activityTitle}</h2>
                
                <form onSubmit={handleSubmit} className="submission-form">
                    <p className="form-info">Insira o **link** do seu arquivo (Google Drive, GitHub, etc.) para entrega da atividade.</p>
                    
                    <div className="form-group">
                        <label htmlFor="submissionLink">Link do Arquivo:</label>
                        <input
                            id="submissionLink"
                            type="url"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            placeholder="Ex: https://drive.google.com/..."
                            required
                        />
                    </div>

                    {submissionError && <div className="message error">{submissionError}</div>}
                    
                    <button type="submit" className="submit-btn" disabled={submitting}>
                        {submitting ? 'Enviando...' : 'Confirmar Entrega'}
                    </button>
                </form>
            </div>
        </div>
    );
};


// Componente principal: ViewActivities
const ViewActivities = () => {
    const { idTurma } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState([]);
    const [error, setError] = useState(null);
    const [className, setClassName] = useState(`Turma ID ${idTurma}`);
    
    // Estados para o Modal de Entrega
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedActivityId, setSelectedActivityId] = useState(null);
    const [selectedActivityTitle, setSelectedActivityTitle] = useState('');
    
    const [successMessage, setSuccessMessage] = useState(null); // Feedback de sucesso
    
    // Função auxiliar para formatar a data
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // Função principal para buscar as atividades
    const fetchActivities = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Rota da API: /student/activities/:idTurma
            const response = await api.get(`/class/student/activities/${idTurma}`);
            const fetchedActivities = response.data;
            
            // 🚨 LEMBRETE: Se o service não fizer JOIN para o nome da matéria, ele continuará sendo 'Turma ID X'
            // Assumindo que a rota de materiais que criamos injetou o className, faremos o mesmo aqui
            if (fetchedActivities.length > 0 && fetchedActivities[0].className) {
                setClassName(fetchedActivities[0].className);
            } else {
                setClassName(`Turma ID ${idTurma} (Atividades)`);
            }

            setActivities(fetchedActivities);

        } catch (err) {
            console.error("Erro ao buscar atividades:", err);
            setError("Não foi possível carregar as atividades. Verifique sua matrícula ou a conexão.");
            setActivities([]);
            
        } finally {
            setLoading(false);
        }
    };
    
    // Função que será passada para o modal para lidar com a entrega
    const handleSubmission = async (idAtividade, link) => {
        const submissionData = { arquivo: link };
        
        // Rota da API: /student/activities/send/:idAtividade (POST)
        const response = await api.post(`/class/student/activities/send/${idAtividade}`, submissionData);
        
        if (response.status === 200) {
            setSuccessMessage("Atividade entregue com sucesso!");
            // Opcional: Atualizar o estado local ou recarregar a lista para marcar como entregue
        }
    };
    
    // Abre o modal e define a atividade selecionada
    const handleOpenModal = (activity) => {
        const closingDate = new Date(activity.dataFechamento);
        const now = new Date();

        if (now > closingDate) {
            setError("Esta atividade já foi fechada e não pode mais ser entregue.");
            setSuccessMessage(null); // Limpa sucesso anterior
            return;
        }

        setSelectedActivityId(activity.id);
        setSelectedActivityTitle(activity.titulo);
        setSuccessMessage(null);
        setError(null);
        setIsModalOpen(true);
    };

    useEffect(() => {
        if (idTurma) {
            fetchActivities();
        } else {
            setError("ID da turma não encontrado na URL.");
            setLoading(false);
        }
    }, [idTurma]);
    
    // Limpa a mensagem de sucesso após 5 segundos
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);


    if (loading) {
        return (
            <>
                <StudentHeader />
                <div className="activities-container">
                    <p className="loading-text">Carregando atividades de {className}...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <StudentHeader />
            <div className="activities-container">
                <header className="activities-header">
                    <h1 className="header-title">Atividades Avaliativas</h1>
                    <h2 className="header-subtitle">{className}</h2>
                    <button className="back-button" onClick={() => navigate(-1)}>
                        &larr; Voltar para Turmas
                    </button>
                </header>

                {successMessage && <div className="message success">{successMessage}</div>}
                {error && <div className="message error">{error}</div>}

                <div className="activities-list">
                    {activities.length === 0 ? (
                        <p className="no-data-message">Não há atividades avaliativas cadastradas para esta turma.</p>
                    ) : (
                        activities.map(activity => {
                            const closingDate = new Date(activity.dataFechamento);
                            const isLate = new Date() > closingDate;

                            return (
                                <div key={activity.id} className={`activity-card ${isLate ? 'late' : ''}`}>
                                    <div className="activity-content">
                                        <h3 className="activity-title">{activity.titulo}</h3>
                                        <p className="activity-description">{activity.descricao}</p>
                                        <div className="activity-details">
                                            <p>Nota Máxima: {activity.notaMaxima ? parseFloat(activity.notaMaxima).toFixed(1) : 'N/A'}</p>
                                            <p className="closing-date">Data de Fechamento: **{formatDate(closingDate)}**</p>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        className={`action-btn ${isLate ? 'disabled' : 'primary'}`}
                                        onClick={() => handleOpenModal(activity)}
                                        disabled={isLate}
                                    >
                                        {isLate ? 'Prazo Encerrado 🔒' : 'Entregar Atividade 📤'}
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            
            {/* Modal de Entrega */}
            <SubmissionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                activityId={selectedActivityId}
                activityTitle={selectedActivityTitle}
                onSubmit={handleSubmission}
            />
        </>
    );
};

export default ViewActivities;