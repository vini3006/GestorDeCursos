import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../services/api';
import './manageClasses.css'; 
import AdminHeader from '../../../../components/AdminHeader';

// Função auxiliar para formatar datas (para exibição)
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
};

// -------------------------------------------------------------
// COMPONENTES AUXILIARES (MODAL)
// -------------------------------------------------------------

const ClassModal = ({ onClose, onSaveSuccess, dataAuxiliar }) => {
  
  const { subjects, professors, activeSemesters } = dataAuxiliar;
  
  const [formData, setFormData] = useState({ 
    idMateria: subjects.length > 0 ? subjects[0].id : '', 
    cpfProfessor: professors.length > 0 ? professors[0].cpf : '',
    maxAlunos: 30, 
    idPeriodoLetivo: activeSemesters.length > 0 ? activeSemesters[0].id : '',
    dataFechamentoFila: '', 
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Verifica se há dados auxiliares para a criação
  const isReady = subjects.length > 0 && professors.length > 0 && activeSemesters.length > 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ 
        ...formData, 
        [name]: (name === 'maxAlunos' || name.startsWith('id')) ? parseInt(value) || value : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { idMateria, cpfProfessor, maxAlunos, idPeriodoLetivo, dataFechamentoFila } = formData;
    
    // Validação básica
    if (!isReady) {
        setError("Dados auxiliares não carregados (Matérias, Professores ou Períodos Ativos).");
        setLoading(false);
        return;
    }
    
    if (maxAlunos <= 0) {
        setError("O Máximo de Alunos deve ser positivo.");
        setLoading(false);
        return;
    }

    if (!dataFechamentoFila) {
        setError("A Data de Fechamento da Fila é obrigatória.");
        setLoading(false);
        return;
    }

    const payload = { 
        idMateria, 
        cpfProfessor, 
        maxAlunos, 
        idPeriodoLetivo, 
        dataFechamentoFila 
    };
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Rota POST: /class/admin
      const response = await api.post('/class/admin', payload, config);
      
      onSaveSuccess(response.data); 
      onClose(); 
      
    } catch (err) {
      console.error("Erro ao criar turma:", err);
      setError(err.response?.data?.msg || "Erro ao criar turma. Verifique se a matéria já tem turma neste período ou se a data é inválida.");
    } finally {
      setLoading(false);
    }
  };


  if (!isReady && !loading) {
      return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Não é possível criar Turma</h2>
                <p className="message-feedback message-error">
                    Não há Matérias, Professores ou Períodos Letivos Ativos disponíveis para a criação da turma.
                </p>
                <div className="modal-actions">
                    <button type="button" onClick={onClose} className="btn-cancel">Fechar</button>
                </div>
            </div>
        </div>
      );
  }


  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Criar Nova Turma</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="message-feedback message-error">{error}</div>} 
          
          <div className="modal-grid">

            {/* Matéria */}
            <div className="full-row">
                <label htmlFor="idMateria">Matéria:</label>
                <select 
                    name="idMateria" 
                    onChange={handleChange} 
                    value={formData.idMateria} 
                    required 
                    disabled={subjects.length === 0 || loading}
                >
                    {subjects.map(sub => (
                        <option key={sub.id} value={sub.id}>
                            {sub.nome} (P: {sub.periodo})
                        </option>
                    ))}
                </select>
            </div>
            
            {/* Professor */}
            <div className="full-row">
                <label htmlFor="cpfProfessor">Professor:</label>
                <select 
                    name="cpfProfessor" 
                    onChange={handleChange} 
                    value={formData.cpfProfessor} 
                    required
                    disabled={professors.length === 0 || loading}
                >
                    {professors.map(prof => (
                        <option key={prof.cpf} value={prof.cpf}>
                            {prof.nome} (CPF: {prof.cpf})
                        </option>
                    ))}
                </select>
            </div>

            {/* Período Letivo */}
            <div>
                <label htmlFor="idPeriodoLetivo">Período Letivo:</label>
                <select 
                    name="idPeriodoLetivo" 
                    onChange={handleChange} 
                    value={formData.idPeriodoLetivo} 
                    required
                    disabled={activeSemesters.length === 0 || loading}
                >
                    {activeSemesters.map(sem => (
                        <option key={sem.id} value={sem.id}>
                            {sem.nome} ({formatDate(sem.dataInicio)} - {formatDate(sem.dataFim)})
                        </option>
                    ))}
                </select>
            </div>

            {/* Máximo de Alunos */}
            <div>
                <label htmlFor="maxAlunos">Máximo de Alunos:</label>
                <input 
                    name="maxAlunos" 
                    type="number" 
                    onChange={handleChange} 
                    value={formData.maxAlunos} 
                    required
                    min={1} 
                />
            </div>

            {/* Data Limite */}
            <div className="full-row">
                <label htmlFor="dataFechamentoFila">Data Limite de Inscrição (Fila):</label>
                <input 
                    name="dataFechamentoFila" 
                    type="date" 
                    onChange={handleChange} 
                    value={formData.dataFechamentoFila} 
                    required 
                />
            </div>
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Cancelar</button>
            <button type="submit" className="btn-save" disabled={loading || !isReady}>
              {loading ? 'Criando...' : 'Criar Turma'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// COMPONENTE PRINCIPAL
// -------------------------------------------------------------

const ManageClasses = () => {
  const navigate = useNavigate();
  
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Estados para dados auxiliares
  const [subjects, setSubjects] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [activeSemesters, setActiveSemesters] = useState([]);

  const handleProcessQueue = async (classId) => {
    setMessage({ text: '', type: '' });
    if (!window.confirm(`Tem certeza que deseja processar a lista de espera da Turma ID ${classId}?`)) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Rota Assumida: POST /class/processQueue/:id
        // A requisição deve enviar o ID da turma para o backend processar a fila.
        const response = await api.put(`/class/processQueue/${classId}`, {}, config); 
        
        // Se o processamento for bem-sucedido
        setMessage({ text: `Lista de espera da Turma ID ${classId} processada com sucesso! ${response.data.msg || ''}`, type: 'success' });
        fetchClasses(); // Recarrega as turmas para atualizar a contagem de alunos
        
    } catch (error) {
        console.error("Erro ao processar lista:", error);
        setMessage({ 
            text: error.response?.data?.msg || `Falha ao processar lista da Turma ID ${classId}.`, 
            type: 'error' 
        });
    }
  };
  // --- Funções de Busca ---

  // 1. Busca Matérias (Rota: GET /subject/)
  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/subject/', { headers: { Authorization: `Bearer ${token}` }});
      if (Array.isArray(response.data)) {
        setSubjects(response.data);
      }
    } catch (error) {
      console.error("Erro ao carregar matérias:", error);
    }
  };

  // 2. Busca Professores (Rota: GET /reports/allProfessors)
    const fetchProfessors = async () => {
        try {
        const token = localStorage.getItem('token');
        const response = await api.get('/reports/allProfessors', { headers: { Authorization: `Bearer ${token}` }});
        if (Array.isArray(response.data)) {
            // Assumindo que a rota retorna objetos com a propriedade 'cpf' e 'nome'
            setProfessors(response.data);
        }
        } catch (error) {
        console.error("Erro ao carregar professores:", error);
        }
    };

  // 3. Busca Períodos Letivos Ativos (Rota: GET /semester/admin, com filtro no frontend)
  const fetchActiveSemesters = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/semester/admin', { headers: { Authorization: `Bearer ${token}` }});
      
      if (Array.isArray(response.data)) {
        // FILTRO APLICADO: Apenas períodos onde a data de fechamento da fila ainda não passou
        const now = new Date();
        const active = response.data.filter(sem => {
            // Usa 'dataFim' para filtrar períodos que ainda aceitam a criação de turmas
            return new Date(sem.dataFim) > now;
        });

        setActiveSemesters(active);
      }
    } catch (error) {
      console.error("Erro ao carregar períodos ativos:", error);
    }
  };


  // 4. Busca Turmas (Rota: GET /class/)
  const fetchClasses = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/class/', { headers: { Authorization: `Bearer ${token}` }});
      
      if (Array.isArray(response.data)) {
        setClasses(response.data); 
      } else {
        setClasses([]);
        console.error("A API de turmas não retornou um array:", response.data);
      }
    } catch (error) {
      setMessage({ text: 'Falha ao carregar lista de turmas.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Funções de Ação
  const handleDelete = () => {
      setMessage({ text: 'A exclusão de turmas é automática ou feita por outra interface, conforme a regra de negócio.', type: 'error' });
  };

  const handleSaveSuccess = () => {
    fetchClasses(); 
    setMessage({ text: "Nova turma criada com sucesso!", type: 'success' });
  };

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchProfessors();
    fetchActiveSemesters();
  }, []);

  const dataAuxiliar = { subjects, professors, activeSemesters };
  const hasAuxiliaryData = subjects.length > 0 && professors.length > 0 && activeSemesters.length > 0;
  
  // Funções auxiliares para lookup dos nomes na tabela
  const getSubjectName = (id) => {
    const subject = subjects.find(sub => sub.id === id);
    return subject ? `${subject.nome} (P${subject.periodo})` : `ID: ${id}`;
  };
  
  const getProfessorName = (cpf) => {
    const professor = professors.find(prof => prof.cpf === cpf);
    return professor ? professor.nome : `CPF: ${cpf}`;
  };

  const getSemesterName = (id) => {
    const semester = activeSemesters.find(sem => sem.id === id);
    return semester ? semester.nome : `ID: ${id}`;
  };

  // Total de colunas após a remoção da coluna "Ações" (6 colunas)
  const COL_SPAN_COUNT = 6; 

  return (
    <div className="manage-semesters-layout"> 
      
      <AdminHeader/>

      <main className="manage-content"> 
        <h1 className="page-title">Gerenciar Turmas</h1>
        
        <div className="action-bar">
          <button onClick={() => navigate('/admin/dashboard')} className="btn-back">← Voltar</button>
          <button 
            onClick={() => setShowModal(true)} 
            className="btn-add"
            title={!hasAuxiliaryData ? "Faltam Matérias, Professores ou Períodos Ativos" : "Adicionar Turma"}
            disabled={loading || !hasAuxiliaryData}
          >
            Adicionar Turma
          </button>
        </div>
        
        {message.text && (
            <div className={`message-feedback message-${message.type}`}>{message.text}</div>
        )}

        <div className="table-container shadow-md">
          {loading ? (
            <p className="loading-state">Carregando turmas...</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Matéria (Período)</th>
                  <th>Professor</th>
                  <th>Período Letivo</th>
                  <th>Alunos (Mat/Max)</th>
                  <th>Fechamento Fila</th>
                  <th>Processar Lista</th>
                </tr>
              </thead>
              <tbody>
                {classes.length === 0 ? (
                  <tr><td colSpan={COL_SPAN_COUNT} className="no-data">Nenhuma turma cadastrada.</td></tr>
                ) : (
                  classes.map(cl => (
                    <tr key={cl.id}> 
                      <td>{cl.id}</td>
                      <td>{getSubjectName(cl.idMateria)}</td>
                      <td>{getProfessorName(cl.cpfProfessor)}</td>
                      <td>{getSemesterName(cl.idPeriodoLetivo)}</td>
                      <td>{cl.numAlunos || 0} / {cl.maxAlunos}</td>
                      <td>{formatDate(cl.dataFechamentoFila)}</td>
                      <td>
                        <button 
                            onClick={() => handleProcessQueue(cl.id)} 
                            className="btn-action" 
                            title={`Processar a fila de espera da turma ${cl.id}`}
                        >
                           ⚙️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {showModal && (
        <ClassModal 
            onClose={() => setShowModal(false)} 
            onSaveSuccess={handleSaveSuccess} 
            dataAuxiliar={dataAuxiliar}
        />
      )}
      
      <footer className="admin-footer-simple">© 2025 Sistema de Gestão.</footer>
    </div>
  );
};

export default ManageClasses;