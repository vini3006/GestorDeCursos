import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './manageUsers.css'; 
import AdminHeader from '../../../components/AdminHeader';
// -------------------------------------------------------------
// COMPONENTES AUXILIARES (MODAL)
// -------------------------------------------------------------

const AddUserModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ 
    nome: '', 
    cpf: '', 
    matricula: '', 
    tipo: 'aluno', 
    dt_nascimento: '', 
    email: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { nome, cpf, matricula, tipo, dt_nascimento, email } = formData;

    // Validação simples da data
    const dateParts = dt_nascimento.split('-'); 
    if (dateParts.length !== 3) {
        setError("Data de nascimento inválida.");
        setLoading(false);
        return;
    }

    // Senha padrão: DDMMYYYY
    const senhaPadrao = dateParts[2] + dateParts[1] + dateParts[0];

    const payload = {
      cpf,
      nome,
      dt_nascimento: new Date(dt_nascimento).toISOString().split('T')[0],
      email,
      matricula,
      senha: senhaPadrao,
      dataCriacao: new Date().toISOString().slice(0, 19).replace('T', ' '),
      tipo,
    };
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await api.post('/users/admin', payload, config); 
      
      // Sucesso! Avisa o pai para recarregar a lista
      onSuccess(); 
      onClose(); 
      
    } catch (err) {
      console.error("Erro ao adicionar usuário:", err);
      setError(err.response?.data?.msg || "Erro ao registrar usuário.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Adicionar Novo Usuário</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="modal-error">{error}</p>}
          
          <label>Nome Completo:</label>
          <input name="nome" type="text" placeholder="Ex: João Silva" onChange={handleChange} value={formData.nome} required />
          
          <label>CPF:</label>
          <input name="cpf" type="text" placeholder="000.000.000-00" onChange={handleChange} value={formData.cpf} required />
          
          <label>Email:</label>
          <input name="email" type="email" placeholder="email@exemplo.com" onChange={handleChange} value={formData.email} required />
          
          <label>Matrícula:</label>
          <input name="matricula" type="text" placeholder="Ex: 2025001" onChange={handleChange} value={formData.matricula} required />
          
          <label htmlFor="dt_nascimento">Data de Nascimento:</label>
          <input 
            id="dt_nascimento"
            name="dt_nascimento" 
            type="date" 
            onChange={handleChange} 
            value={formData.dt_nascimento} 
            required 
          />
          
          <label>Tipo de Usuário:</label>
          <select name="tipo" onChange={handleChange} value={formData.tipo} required>
            <option value="aluno">Aluno</option>
            <option value="professor">Professor</option>
            <option value="admin">Administrador</option>
          </select>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Cancelar</button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Salvando...' : 'Adicionar'}
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

const ManageUsers = () => {
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Buscar Todos os Usuários
  const fetchAllUsers = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/users/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data); 
    } catch (error) {
      console.error("Erro ao carregar lista:", error);
      setMessage({ text: 'Falha ao carregar lista de usuários.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (matricula) => { 
    if (!window.confirm("Tem certeza que deseja remover este usuário?")) return;

    try {
        const token = localStorage.getItem('token');
        await api.delete(`/users/admin/${matricula}`, {
            headers: { Authorization: `Bearer ${token}` }
        }); 
        
        // Remove da lista visualmente sem precisar recarregar tudo (Performance)
        setUsers(users.filter(user => user.matricula !== matricula));
        setMessage({ text: `Usuário removido com sucesso!`, type: 'success' });

    } catch (error) {
        setMessage({ text: `Erro: ${error.response?.data?.msg || 'Falha ao remover'}`, type: 'error' });
    }
  };

  // Função chamada quando o Modal termina de salvar com sucesso
  const handleSuccessCallback = () => {
    fetchAllUsers(); // Recarrega a lista do servidor para garantir dados frescos
    setMessage({ text: "Novo usuário adicionado com sucesso!", type: 'success' });
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  return (
    <div className="manage-layout">
      
      {/* HEADER FIXO */}
      <AdminHeader />

      {/* CONTEÚDO */}
      <main className="manage-content">
        <h1 className="page-title">Gerenciar Usuários</h1>
        
        <div className="action-bar">
          <button onClick={() => navigate('/admin/dashboard')} className="btn-back">← Voltar</button>
          <button onClick={() => setShowModal(true)} className="btn-add">Adicionar Usuário</button>
        </div>
        
        {message.text && (
            <div className={`message-feedback message-${message.type}`}>{message.text}</div>
        )}

        <div className="table-container shadow-md">
          {loading ? (
            <p className="loading-state">Carregando lista de usuários...</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Matrícula</th>
                  <th>Tipo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan="4" className="no-data">Nenhum usuário encontrado.</td></tr>
                ) : (
                  users.map(user => (
                    <tr key={user.matricula}> 
                      <td><strong>{user.nome}</strong></td>
                      <td>{user.matricula}</td>
                      <td>{user.tipo.charAt(0).toUpperCase() + user.tipo.slice(1)}</td>
                      <td>
                        {/* Botão Remover com ícone */}
                        <button 
                            onClick={() => handleDelete(user.matricula)}  
                            className="btn-action btn-remove" 
                            title="Excluir Usuário">
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
        <AddUserModal 
            onClose={() => setShowModal(false)} 
            onSuccess={handleSuccessCallback} 
        />
      )}
      
      <footer className="admin-footer-simple">
        © 2025 Sistema de Gestão.
      </footer>
    </div>
  );
};

export default ManageUsers;