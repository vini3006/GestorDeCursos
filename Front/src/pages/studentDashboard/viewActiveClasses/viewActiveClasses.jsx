import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentHeader from '../../../components/studentHeader';
import api from '../../../services/api';
import './viewActiveClasses.css';

// Componente de Modal Integrado (Mantido)
const GradesModal = ({ isOpen, onClose, grades, className }) => {
    if (!isOpen) return null;

    // Função para determinar a situação (Aprovado/Reprovado/Em Curso)
    const getSituation = (media) => {
        if (media === null || media === undefined) return "Em Curso / Não Avaliado";
        if (media >= 7.0) return "Aprovado ✅";
        
        // Se a média é menor que 7.0, mas já tem nota de PF (e passou com ela), é Aprovado
        if (media < 7.0 && grades.PF !== null && media >= 5.0) return "Aprovado ✅"; 
        
        // Se a média é menor que 7.0 e AINDA NÃO tem nota de PF, está Em Prova Final
        if (media < 7.0 && grades.PF === null) return "Em Prova Final"; 
        
        return "Reprovado ❌";
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>&times;</button>
                <h2 className="modal-title">Notas Finais - {className}</h2>
                
                {grades && grades.error ? (
                     <p className="loading-message" style={{color: '#c0392b'}}>
                        {grades.error}
                    </p>
                ) : grades ? (
                    <>
                        <table className="grades-table">
                            <thead>
                                <tr>
                                    <th>Avaliação</th>
                                    <th>Nota</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td>P1</td><td>{grades.P1 !== null ? grades.P1.toFixed(1) : '-'}</td></tr>
                                <tr><td>P2</td><td>{grades.P2 !== null ? grades.P2.toFixed(1) : '-'}</td></tr>
                                <tr><td>Prova Final (PF)</td><td>{grades.PF !== null ? grades.PF.toFixed(1) : '-'}</td></tr>
                            </tbody>
                        </table>

                        <div className="final-result">
                            <p className="media">
                                Média Final: 
                                <span>{grades.mediaFinal !== null ? grades.mediaFinal.toFixed(2) : 'Aguardando...'}</span>
                            </p>
                            <p className="situation">
                                Situação: 
                                <span className={`situation-${getSituation(grades.mediaFinal).split(' ')[0].toLowerCase()}`}>
                                    {getSituation(grades.mediaFinal)}
                                </span>
                            </p>
                        </div>
                    </>
                ) : (
                    <p className="loading-message">Buscando notas...</p>
                )}
            </div>
        </div>
    );
};


// Componente principal: ViewActiveClasses
const ViewActiveClasses = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [error, setError] = useState(null);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [gradesData, setGradesData] = useState(null);

    const fetchActiveClasses = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/class/student/'); 
            
            setClasses(response.data);

        } catch (err) {
            console.error("Erro ao buscar turmas ativas:", err);
            setError("Não foi possível carregar suas turmas ativas. Verifique a conexão com o servidor.");
            setClasses([]); // Garante que a lista fique vazia em caso de erro
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveClasses();
    }, []);

    const handleViewGrades = async (idTurma) => {
        setSelectedClassId(idTurma);
        setGradesData(null); 
        setIsModalOpen(true); 

        try {
            const response = await api.get(`/class/student/${idTurma}/grades`); 
            setGradesData(response.data);
        } catch (error) {
            console.error("Erro ao buscar notas:", error);
            setGradesData({ error: "Não foi possível carregar as notas. Tente novamente." });
        }
    };

    const handleViewMaterials = (idTurma) => {
        navigate(`/student/classes/${idTurma}/materials`);
    };

    const handleViewActivities = (idTurma) => {
        navigate(`/student/classes/${idTurma}/activities`);
    };

    if (loading) {
        return (
            <>
                <StudentHeader />
                <div className="main-content-classes"><p className="loading-text">Carregando turmas...</p></div>
            </>
        );
    }
    
    const classNameForModal = classes.find(c => c.id === selectedClassId)?.nomeMateria || 'Turma';

    return (
        <>
            <StudentHeader />
            <div className="main-content-classes">
                <h1 className="dashboard-title">Minhas Turmas Ativas</h1>
                <p className="dashboard-subtitle">Selecione uma turma para acessar materiais, atividades e notas.</p>

                {error && <div className="message error">{error}</div>}

                <div className="classes-grid">
                    {classes.length === 0 ? (
                        <p className="no-data-message">Você não está matriculado em nenhuma turma ativa.</p>
                    ) : (
                        classes.map((turma) => (
                            <div key={turma.id} className="class-card">
                                <h2 className="card-title">{turma.nomeMateria}</h2>
                                <p className="card-subtitle">Período: {turma.nomePeriodo}</p>

                                <div className="card-actions">
                                    <button 
                                        className="action-btn primary" 
                                        onClick={() => handleViewMaterials(turma.id)}
                                    >
                                        Ver Materiais 📚
                                    </button>
                                    <button 
                                        className="action-btn primary" 
                                        onClick={() => handleViewActivities(turma.id)}
                                    >
                                        Ver Atividades 📝
                                    </button>
                                    <button 
                                        className="action-btn secondary" 
                                        onClick={() => handleViewGrades(turma.id)}
                                    >
                                        Ver Notas 📊
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal de Notas Integrado */}
            <GradesModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                grades={gradesData} 
                className={classNameForModal}
            />
        </>
    );
};

export default ViewActiveClasses;