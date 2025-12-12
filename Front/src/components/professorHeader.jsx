import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './professorHeader.css'; // Importa o novo CSS

const ProfessorHeader = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ displayName: 'Carregando...', role: '' });
  
  // Rota do dashboard do professor
  const PROFESSOR_DASHBOARD_ROUTE = '/professor/dashboard';
  const LOGO_TEXT = 'Portal do Professor'; // Título alterado

  // Busca dados do usuário logado ao montar o componente
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

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
    navigate('/userprofile'); // Mantém a mesma rota de edição de perfil
  };

  const formatRole = (role) => {
    if (!role) return '';
    // Garante que "professor" seja exibido corretamente, se a API retornar
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <header className="professor-header-simple fixed-header">
      <div className="logo-text" onClick={() => navigate(PROFESSOR_DASHBOARD_ROUTE)} style={{cursor: 'pointer'}}>
        {LOGO_TEXT}
      </div>
      
      <div className="header-user-info">
        <div className="user-text">
          <span className="user-name">{userInfo.displayName}</span>
          <span className="user-role">{formatRole(userInfo.role)}</span>
        </div>
        
        {/* Botão de Editar Perfil */}
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

export default ProfessorHeader;