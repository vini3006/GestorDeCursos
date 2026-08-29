import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Presumindo que 'api' está em '../services/api'
import './studentHeader.css'; // Importa o novo CSS (que será idêntico ao do professor)

const StudentHeader = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ displayName: 'Carregando...', role: '' });
  
  // Rotas e Título específicos do Aluno
  const STUDENT_DASHBOARD_ROUTE = '/aluno/dashboard';
  const LOGO_TEXT = 'Portal do Aluno'; 

  // Busca dados do usuário logado
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Reutiliza a rota /users/me para buscar nome e tipo (cpf/aluno)
        const response = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const { nome, tipo } = response.data;
        setUserInfo({ 
          displayName: nome || 'Aluno', 
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
    navigate('/userprofile'); // Rota de edição de perfil (compartilhada)
  };

  const formatRole = (role) => {
    if (!role) return '';
    // Garante que "aluno" seja exibido corretamente
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    // Usa uma classe específica para o aluno (embora o CSS será igual)
    <header className="student-header-simple fixed-header"> 
      <div className="logo-text" onClick={() => navigate(STUDENT_DASHBOARD_ROUTE)} style={{cursor: 'pointer'}}>
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

export default StudentHeader;