import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ProfessorHeader from '../../components/professorHeader';
import './professorDashboard.css'; // Novo CSS
import { jwtDecode } from 'jwt-decode';

// Componente para exibir o menu de opções da turma
const ClassOptions = ({ idTurma, nomeMateria, onClose }) => {
    const navigate = useNavigate();

    const options = [
        { label: "Avaliar Alunos (P1/P2/PF)", action: () => navigate(`/professor/turma/${idTurma}/avaliar-alunos`) },
        { label: "Cadastrar Materiais e Atividades", action: () => navigate(`/professor/turma/${idTurma}/cadastrar-recursos`) },
        { label: "Ver Entregas de Atividades", action: () => navigate(`/professor/turma/${idTurma}/ver-entregas`) },
    ];

    return (
        <div className="class-options-overlay" onClick={onClose}>
            <div className="class-options-menu" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>
                <h3>Opções da Turma: {nomeMateria}</h3>
                <div className="options-list">
                    {options.map((option, index) => (
                        <button key={index} className="option-btn" onClick={option.action}>
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ProfessorDashboard = () => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null); // Turma para abrir o menu

    useEffect(() => {
        const fetchClasses = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // O CPF deve ser passado no header, mas a rota da API usa o CPF do token.
                // Decodificando o token para garantir que o usuário é professor, embora o auth middleware já faça isso.
                const user = jwtDecode(token);
                if (user.tipo !== 'professor') {
                    navigate('/'); 
                    return;
                }

                setLoading(true);
                const response = await api.get('/class/professor', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setClasses(response.data.classes || []);
                setError(null);

            } catch (err) {
                console.error("Erro ao carregar turmas:", err);
                setError("Falha ao carregar as turmas. Verifique a conexão com o servidor.");
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, [navigate]);

    const handleSelectClass = (turma) => {
        setSelectedClass(turma);
    };

    if (loading) {
        return (
            <>
                <ProfessorHeader />
                <div className="professor-dashboard-container">
                    <p className="loading-text">Carregando turmas...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <ProfessorHeader />
            <div className="professor-dashboard-container">
                <h1 className="dashboard-title">Minhas Turmas</h1>

                {error && <p className="error-message">{error}</p>}
                
                {!loading && classes.length === 0 && !error && (
                    <div className="no-data-message">
                        Nenhuma turma associada a você neste período letivo.
                    </div>
                )}

                <div className="classes-grid">
                    {Array.isArray(classes) && classes.map(turma => (
                        <div 
                            key={turma.id} 
                            className="class-card" 
                            onClick={() => handleSelectClass(turma)}
                        >
                            <h2 className="class-title">{turma.nomeMateria}</h2>
                            <p className="class-detail">ID: {turma.id}</p>
                            <p className="class-detail">Período: {turma.nomePeriodoLetivo}</p>
                            <p className="class-detail">Alunos: {turma.numAlunos}/{turma.maxAlunos}</p>
                            <button className="manage-btn">Gerenciar</button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Renderiza o menu de opções se uma turma for selecionada */}
            {selectedClass && (
                <ClassOptions 
                    idTurma={selectedClass.id}
                    nomeMateria={selectedClass.nomeMateria}
                    onClose={() => setSelectedClass(null)}
                />
            )}
        </>
    );
};

export default ProfessorDashboard;