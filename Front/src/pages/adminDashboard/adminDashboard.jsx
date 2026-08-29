import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './adminDashboard.css'; 
import AdminHeader from '../../components/AdminHeader';

// -------------------------------------------------------------
// DADOS DE NAVEGAÇÃO COM DESCRIÇÕES
// -------------------------------------------------------------
const navButtons = [
  { 
    label: 'Gerenciar Usuários', 
    path: '/admin/users', 
    icon: '👤', 
    description: 'Adicione, edite ou remova contas de alunos, professores e administradores do sistema.' 
  },
  { 
    label: 'Gerenciar Ensino', 
    path: '/admin/education', 
    icon: '📚', 
    description: 'Crie e edite matérias, turmas, e defina a estrutura curricular da instituição.' 
  },
  { 
    label: 'Gerenciar Períodos Letivos', 
    path: '/admin/semesters', 
    icon: '🗓️', 
    description: 'Crie e gerencie os períodos (semestres) ativos e passados, definindo suas datas de início e fim.' 
  },
  { 
    label: 'Ver Dados', 
    path: '/admin/data', 
    icon: '📊', 
    description: 'Acesse relatórios e estatísticas consolidadas sobre matrículas, turmas e desempenho geral.' 
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false); 
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="admin-layout-simple">
      
      {/* HEADER */}
     <AdminHeader />

      {/* CONTEÚDO PRINCIPAL COM BOTÕES */}
      <main className="main-content-buttons">
        <h1 className="dashboard-title">Bem-vindo(a) ao Painel do Administrador</h1>
        <p className="dashboard-subtitle">Selecione uma opção para gerenciar o sistema.</p>
        
        {message.text && (
            <div className={`message ${message.type}`}>{message.text}</div>
        )}

        <div className="button-grid">
          {navButtons.map(button => (
            // Se o seu CSS do AdminDashboard ainda não tiver a classe .button-description, 
            // você precisará adicioná-la ou adaptar o AdminDashboard.css.
            <button 
              key={button.path} 
              className="dashboard-nav-button"
              onClick={() => handleNavigation(button.path)}
              disabled={loading}
            >
              <span className="button-icon">{button.icon}</span>
              <span className="button-label">{button.label}</span>
              <span className="button-description">{button.description}</span> {/* 🚨 DESCRIÇÃO ADICIONADA */}
            </button>
          ))}
        </div>
      </main>
      
      {/* FOOTER */}
      <footer className="admin-footer-simple">
        © 2025 Sistema de Gestão. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default AdminDashboard;