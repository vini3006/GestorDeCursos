    import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import ProfessorHeader from '../../../components/professorHeader';
import './evaluateStudents.css';

// Função utilitária para calcular a média localmente (para feedback imediato)
// Segue a lógica do seu service: (P1+P2)/2, se PF existe: ((P1+P2)/2 + PF)/2
const calculateLocalMean = (p1, p2, pf) => {
    if (p1 === null || p2 === null) return null;
    
    // Converte para float antes de calcular, garantindo que não seja string
    const floatP1 = parseFloat(p1) || 0;
    const floatP2 = parseFloat(p2) || 0;
    const floatPF = parseFloat(pf) || 0;
    
    let mean = (floatP1 + floatP2) / 2;
    
    if (pf !== null) {
        mean = (mean + floatPF) / 2;
    }
    
    return mean;
};


const EvaluateStudentsPage = () => {
    // Captura o idTurma da URL (ex: /professor/turma/123/avaliar-alunos)
    const { idTurma } = useParams(); 
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Usa um objeto para rastrear o status de salvamento de cada aluno
    const [savingStatus, setSavingStatus] = useState({}); 

    // Simulação do nome da turma (idealmente viria junto com a lista de alunos na API)
    const [className, setClassName] = useState(`Turma ID: ${idTurma}`);


    useEffect(() => {
        const fetchStudents = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                setLoading(true);
                // Rota: GET /professor/students/:idTurma
                const response = await api.get(`/class/professor/students/${idTurma}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // O serviço retorna o array de alunos diretamente
                setStudents(response.data || []);
                setError(null);

            } catch (err) {
                console.error("Erro ao carregar alunos:", err);
                setError("Falha ao carregar a lista de alunos desta turma. Verifique a API.");
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [idTurma, navigate]);

    // Lida com a mudança de nota em um campo específico (P1, P2, PF)
    const handleGradeChange = (cpf, field, value) => {
        // Garante que o valor seja um número válido (0-10) ou vazio (null)
        let numValue = value === '' ? null : parseFloat(value);
        if (numValue !== null) {
            numValue = Math.max(0, Math.min(numValue, 10.0));
        }
        
        setStudents(prevStudents => 
            prevStudents.map(student => {
                if (student.cpfAluno === cpf) {
                    const updatedStudent = { ...student, [field]: numValue };

                    // Calcula a média final localmente para feedback visual imediato
                    const localMean = calculateLocalMean(
                        updatedStudent.notaP1, 
                        updatedStudent.notaP2, 
                        updatedStudent.notaPF
                    );

                    // Retorna o aluno com a nota atualizada e a média final local calculada
                    return { ...updatedStudent, mediaFinal: localMean }; 
                }
                return student;
            })
        );
    };

    // Função para salvar as notas de UM aluno específico
    const handleSaveStudentGrades = async (student) => {
        // Define o status de salvamento apenas para este aluno
        setSavingStatus(prev => ({ ...prev, [student.cpfAluno]: true }));
        setError(null);

        // Prepara o payload, enviando apenas os campos com notas
        const payload = {
            notaP1: student.notaP1,
            notaP2: student.notaP2,
            notaPF: student.notaPF,
        };
        
        try {
            const token = localStorage.getItem('token');
            // Rota: PATCH /professor/students/:idTurma/:cpfAluno
            const response = await api.patch(`/professor/students/${idTurma}/${student.cpfAluno}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // O backend retorna o objeto atualizado (com a média final OFICIAL)
            const updatedData = response.data;

            setStudents(prevStudents => 
                prevStudents.map(s => 
                    s.cpfAluno === student.cpfAluno
                        ? { ...s, ...updatedData } // Atualiza a linha com os dados oficiais do servidor
                        : s
                )
            );
            
            alert(`Notas de ${student.nome} salvas com sucesso! Média Final: ${updatedData.mediaFinal.toFixed(2)}`);

        } catch (err) {
            console.error(`Erro ao salvar notas do aluno ${student.cpfAluno}:`, err);
            // Mensagem de erro mais amigável
            setError(`Falha ao salvar notas de ${student.nome}. Verifique a conexão e as regras de negócio.`);
        } finally {
            // Remove o status de salvamento
            setSavingStatus(prev => ({ ...prev, [student.cpfAluno]: false }));
        }
    };

    // Verifica se um aluno específico está salvando
    const isSaving = (cpf) => savingStatus[cpf] === true;

    if (loading) {
        return (
            <>
                <ProfessorHeader />
                <div className="evaluate-container">
                    <p className="loading-text">Carregando alunos...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <ProfessorHeader />
            <div className="evaluate-container">
                <h1 className="page-title">Avaliação de Notas - {className}</h1>

                {error && <div className="error-box">{error}</div>}
                
                {students.length === 0 && !error ? (
                    <div className="no-data">Nenhum aluno encontrado nesta turma.</div>
                ) : (
                    <div className="grades-table-wrapper">
                        <table className="grades-table">
                            <thead>
                                <tr>
                                    <th>Nome do Aluno</th>
                                    <th>CPF</th>
                                    <th>P1 (0-10)</th>
                                    <th>P2 (0-10)</th>
                                    <th>PF (0-10)</th>
                                    <th>Média Final</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student.cpfAluno}>
                                        <td>{student.nome}</td>
                                        <td>{student.cpfAluno}</td>
                                        <td>
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                step="0.01"
                                                value={student.notaP1 !== null ? student.notaP1 : ''}
                                                onChange={(e) => handleGradeChange(student.cpfAluno, 'notaP1', e.target.value)}
                                                className="grade-input"
                                                disabled={isSaving(student.cpfAluno)}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                step="0.01"
                                                value={student.notaP2 !== null ? student.notaP2 : ''}
                                                onChange={(e) => handleGradeChange(student.cpfAluno, 'notaP2', e.target.value)}
                                                className="grade-input"
                                                disabled={isSaving(student.cpfAluno)}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                step="0.01"
                                                value={student.notaPF !== null ? student.notaPF : ''}
                                                onChange={(e) => handleGradeChange(student.cpfAluno, 'notaPF', e.target.value)}
                                                className="grade-input"
                                                disabled={isSaving(student.cpfAluno)}
                                            />
                                        </td>
                                        <td className={`final-media ${student.mediaFinal >= 7.0 ? 'approved' : student.mediaFinal >= 5.0 ? 'pf-status' : 'failed'}`}>
                                            {student.mediaFinal !== null ? parseFloat(student.mediaFinal).toFixed(2) : 'N/A'}
                                        </td>
                                        <td>
                                            <button
                                                className="save-student-btn"
                                                onClick={() => handleSaveStudentGrades(student)}
                                                disabled={isSaving(student.cpfAluno)}
                                            >
                                                {isSaving(student.cpfAluno) ? 'Salvando...' : 'Salvar'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                <button 
                    className="back-btn mt-3" 
                    onClick={() => navigate('/professor/dashboard')}
                    disabled={loading}
                >
                    Voltar para o Dashboard
                </button>
            </div>
        </>
    );
};

export default EvaluateStudentsPage;