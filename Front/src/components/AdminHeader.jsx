import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './adminHeader.css';

const AdminHeader = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ displayName: 'Carregando...', role: '' });
  
  // Busca dados do usuário logado ao montar o componente
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return; // Deixa o comportamento de redirecionamento para a página pai

        const response = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const { nome, tipo } = response.data;
        setUserInfo({ 
          displayName: nome || 'Usuário', 
          role: tipo || ''
        });
      } catch (error) {
        console.error("Erro ao carregar header:", error);
        // Não faz logout automático aqui para evitar loops, apenas mostra erro ou nome padrão
      } 
    };

    fetchUserInfo();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleEditProfile = () => {
    navigate('/userprofile'); // Redireciona para a nova rota
  };

  const formatRole = (role) => {
    if (!role) return '';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <header className="admin-header-simple fixed-header">
      <div className="logo-text" onClick={() => navigate('/admin/dashboard')} style={{cursor: 'pointer'}}>
        Painel de Administração
      </div>
      
      <div className="header-user-info">
        <div className="user-text">
          <span className="user-name">{userInfo.displayName}</span>
          <span className="user-role">{formatRole(userInfo.role)}</span>
        </div>
        
        {/* Botão de Editar Perfil (Ícone de engrenagem ou texto) */}
        <button onClick={handleEditProfile} className="header-btn profile-btn" title="Editar Meus Dados">
            ⚙️ Perfil
        </button>

        <button onClick={handleLogout} className="header-btn logout-button-simple">
          Sair
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;