import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AdminHeader from '../../components/AdminHeader';
import './UserProfile.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [formData, setFormData] = useState({
    id: '', 
    nome: '',
    email: '',
    cpf: '', 
    matricula: '',
    novaSenha: '',
    confirmarSenha: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/users/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = response.data;
        setFormData({
            id: data.id,
            nome: data.nome,
            email: data.email,
            cpf: data.cpf,
            matricula: data.matricula,
            novaSenha: '',
            confirmarSenha: ''
        });

      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        setMessage({ text: 'Erro ao carregar seus dados.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (formData.novaSenha && formData.novaSenha !== formData.confirmarSenha) {
        setMessage({ text: 'As senhas não conferem.', type: 'error' });
        return;
    }

    try {
        const token = localStorage.getItem('token');
        
        // Monta o payload. O nome vai junto mas não foi alterado.
        const payload = {
            nome: formData.nome, 
            email: formData.email,
        };

        if (formData.novaSenha) {
            payload.senha = formData.novaSenha;
        }

        await api.put('/users/', payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        setMessage({ text: 'Dados atualizados com sucesso!', type: 'success' });
        setFormData(prev => ({ ...prev, novaSenha: '', confirmarSenha: '' }));

    } catch (error) {
        console.error("Erro ao atualizar:", error);
        setMessage({ text: error.response?.data?.msg || 'Falha ao atualizar perfil.', type: 'error' });
    }
  };

  return (
    <div className="profile-layout">
      <AdminHeader />

      <main className="profile-content">
        <h1 className="page-title">Meu Perfil</h1>

        <div className="profile-card shadow-md">
            {message.text && (
                <div className={`message-feedback message-${message.type}`}>{message.text}</div>
            )}

            {loading ? <p>Carregando...</p> : (
                <form onSubmit={handleSave} className="profile-form">
                    
                    {/* SEÇÃO DE DADOS PESSOAIS (Somente Leitura) */}
                    <div className="section-title">Dados de Identificação (Não editáveis)</div>
                    
                    <div className="form-group">
                        <label>Nome Completo</label>
                        <input 
                            type="text" 
                            value={formData.nome} 
                            disabled 
                            className="input-disabled"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Matrícula</label>
                            <input type="text" value={formData.matricula} disabled className="input-disabled"/>
                        </div>
                        <div className="form-group">
                            <label>CPF</label>
                            <input type="text" value={formData.cpf} disabled className="input-disabled"/>
                        </div>
                    </div>

                    <hr className="divider" />
                    
                    {/* SEÇÃO EDITÁVEL */}
                    <div className="section-title">Dados de Acesso e Contato</div>

                    <div className="form-group">
                        <label>Email de Contato</label>
                        <input 
                            name="email" 
                            type="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                            placeholder="Seu email principal"
                        />
                    </div>

                    <div className="form-row" style={{marginTop: '20px'}}>
                        <div className="form-group">
                            <label>Nova Senha</label>
                            <input 
                                name="novaSenha" 
                                type="password" 
                                placeholder="Deixe em branco para manter"
                                value={formData.novaSenha} 
                                onChange={handleChange} 
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirmar Nova Senha</label>
                            <input 
                                name="confirmarSenha" 
                                type="password" 
                                placeholder="Confirme a nova senha"
                                value={formData.confirmarSenha} 
                                onChange={handleChange} 
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={() => navigate(-1)} className="btn-cancel">Cancelar</button>
                        <button type="submit" className="btn-save">Salvar Alterações</button>
                    </div>
                </form>
            )}
        </div>
      </main>

      <footer className="admin-footer-simple">© 2025 Sistema de Gestão.</footer>
    </div>
  );
};

export default UserProfile;