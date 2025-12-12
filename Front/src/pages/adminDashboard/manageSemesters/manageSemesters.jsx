import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './manageSemesters.css'; 
import AdminHeader from '../../../components/AdminHeader';

// -------------------------------------------------------------
// COMPONENTES AUXILIARES (MODAL)
// -------------------------------------------------------------

const SemesterModal = ({ onClose, onSave, semesterToEdit }) => {
  // Estado inicial
  const [formData, setFormData] = useState({ 
    nome: '', 
    dataInicio: '', 
    dataFim: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Se houver um semestre para editar, preenche o formulário ao abrir
  useEffect(() => {
    if (semesterToEdit) {
      setFormData({
        nome: semesterToEdit.nome,
        // Converte data ISO para YYYY-MM-DD para o input aceitar
        dataInicio: semesterToEdit.dataInicio ? semesterToEdit.dataInicio.split('T')[0] : '',
        dataFim: semesterToEdit.dataFim ? semesterToEdit.dataFim.split('T')[0] : ''
      });
    }
  }, [semesterToEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { nome, dataInicio, dataFim } = formData;

    // Validação básica de datas
    if (new Date(dataInicio) > new Date(dataFim)) {
        setError("A data de início não pode ser maior que a data de fim.");
        setLoading(false);
        return;
    }

    const payload = {
      nome,
      dataInicio, // O backend/BD geralmente aceita YYYY-MM-DD ou ISO
      dataFim
    };
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      let response;
      
      if (semesterToEdit) {
        // EDIÇÃO (PUT)
        response = await api.put(`/semester/admin/${semesterToEdit.id}`, payload, config);
        onSave(response.data.updatedsemester || response.data, true); // true indica edição
      } else {
        // CRIAÇÃO (POST)
        response = await api.post('/semester/admin/', payload, config);
        onSave(response.data.newsemester || response.data, false); // false indica criação
      }
      
      onClose(); 
      
    } catch (err) {
      console.error("Erro ao salvar período:", err);
      setError(err.response?.data?.msg || "Erro ao salvar dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{semesterToEdit ? 'Editar Período' : 'Novo Período Letivo'}</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="modal-error">{error}</p>}
          
          <label htmlFor="nome">Nome do Semestre (ex: 2025.1):</label>
          <input 
            name="nome" 
            type="text" 
            placeholder="Ex: 2025/1" 
            onChange={handleChange} 
            value={formData.nome} 
            required 
          />
          
          <label htmlFor="dataInicio">Data de Início:</label>
          <input 
            id="dataInicio"
            name="dataInicio" 
            type="date" 
            onChange={handleChange} 
            value={formData.dataInicio} 
            required 
          />

          <label htmlFor="dataFim">Data de Término:</label>
          <input 
            id="dataFim"
            name="dataFim" 
            type="date" 
            onChange={handleChange} 
            value={formData.dataFim} 
            required 
          />
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Cancelar</button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Salvando...' : (semesterToEdit ? 'Atualizar' : 'Adicionar')}
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

const ManageSemesters = () => {
  const navigate = useNavigate();
  
  // Estados
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentSemester, setCurrentSemester] = useState(null); // Para edição
  const [message, setMessage] = useState({ text: '', type: '' });

  // Helper para formatar data (YYYY-MM-DD -> DD/MM/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    // Ajuste de fuso horário simples para visualização ou uso de UTC
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  // Buscar Todos os Semestres
  const fetchSemesters = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const token = localStorage.getItem('token');
      // Rota GET definida no seu backend router: router.get("admin/", ...)
      // Assumindo que o prefixo no app.use é /semesters
      const response = await api.get('/semester/admin/', { headers: { Authorization: `Bearer ${token}` }});
      setSemesters(response.data); 
    } catch (error) {
      console.error("Erro ao carregar períodos:", error);
      setMessage({ text: 'Falha ao carregar lista de períodos.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Deletar Semestre
  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza? Isso pode afetar turmas vinculadas.")) return;
    try {
        const token = localStorage.getItem('token');
        await api.delete(`/semester/admin/${id}`, { headers: { Authorization: `Bearer ${token}` }});
        
        setSemesters(semesters.filter(s => s.id !== id));
        setMessage({ text: `Período removido com sucesso!`, type: 'success' });
    } catch (error) {
        setMessage({ text: `Erro ao remover: ${error.response?.data?.msg || 'Erro desconhecido'}`, type: 'error' });
    }
  };

  // Abrir Modal de Edição
  const handleEditClick = (semester) => {
    setCurrentSemester(semester);
    setShowModal(true);
  };

  // Abrir Modal de Criação
  const handleAddClick = () => {
    setCurrentSemester(null);
    setShowModal(true);
  };

  // Callback após salvar (criar ou editar)
  const handleSaveSuccess = (savedSemester, isEdit) => {
    if (isEdit) {
        setSemesters(semesters.map(s => s.id === savedSemester.id ? savedSemester : s));
        setMessage({ text: "Período atualizado com sucesso!", type: 'success' });
    } else {
        // Se o backend retorna apenas o objeto novo, adicionamos na lista
        // Se precisar recarregar tudo para garantir a ordem, chame fetchSemesters()
        setSemesters([...semesters, savedSemester]);
        setMessage({ text: "Novo período criado com sucesso!", type: 'success' });
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  return (
    <div className="manage-semesters-layout">
      
      {/* HEADER FIXO (Igual ao ManageUsers) */}
      <AdminHeader />

      {/* CONTEÚDO */}
      <main className="manage-content">
        <h1 className="page-title">Gerenciar Períodos Letivos</h1>
        
        <div className="action-bar">
          <button onClick={() => navigate('/admin/dashboard')} className="btn-back">← Voltar</button>
          <button onClick={handleAddClick} className="btn-add">Adicionar Período</button>
        </div>
        
        {message.text && (
            <div className={`message-feedback message-${message.type}`}>{message.text}</div>
        )}

        <div className="table-container shadow-md">
          {loading ? (
            <p className="loading-state">Carregando períodos...</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome / Ano</th>
                  <th>Início</th>
                  <th>Término</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {semesters.length === 0 ? (
                  <tr><td colSpan="4" className="no-data">Nenhum período cadastrado.</td></tr>
                ) : (
                  semesters.map(sem => (
                    <tr key={sem.id}> 
                      <td><strong>{sem.nome}</strong></td>
                      <td>{formatDate(sem.dataInicio)}</td>
                      <td>{formatDate(sem.dataFim)}</td>
                      <td>
                        {/* Botão Editar */}
                        <button onClick={() => handleEditClick(sem)} className="btn-action btn-edit" title="Editar">
                           ✏️
                        </button>
                        {/* Botão Excluir */}
                        <button onClick={() => handleDelete(sem.id)} className="btn-action btn-remove" title="Excluir">
                           🗑️
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
        <SemesterModal 
            onClose={() => setShowModal(false)} 
            onSave={handleSaveSuccess} 
            semesterToEdit={currentSemester}
        />
      )}
      
      <footer className="admin-footer-simple">© 2025 Sistema de Gestão.</footer>
    </div>
  );
};

export default ManageSemesters;