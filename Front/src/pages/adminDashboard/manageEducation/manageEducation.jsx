import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './manageEducation.css'
import AdminHeader from '../../../components/AdminHeader';

// -------------------------------------------------------------
// DADOS DE NAVEGAÇÃO INTERNA
// -------------------------------------------------------------
const educationButtons = [
  { label: 'Gerenciar Cursos', path: '/admin/education/courses', icon: '🎓' },
  { label: 'Gerenciar Disciplinas', path: '/admin/education/subjects', icon: '📘' },
  { label: 'Gerenciar Turmas', path: '/admin/education/classes', icon: '👨‍🏫' },
];

const ManageEducation = () => {
  const navigate = useNavigate();
  
  const [message] = useState({ text: '', type: '' });
  
  const handleNavigation = (path) => {
    navigate(path);
  };
  
  // ---------------------------------------------------------------------
  // FUNÇÃO DE RENDERIZAÇÃO
  // ---------------------------------------------------------------------
  return (
    // 💡 Classe de layout padronizada para 'admin-layout-simple'
    <div className="admin-layout-simple"> 
      
      {/* 💡 CORRIGIDO: Renderização do AdminHeader */}
      <AdminHeader /> 

      {/* CONTEÚDO PRINCIPAL COM BOTÕES */}
      <main className="main-content-buttons">
        <h1 className="dashboard-title">Gerenciar Ensino da Instituição</h1>
        <p className="dashboard-subtitle">Selecione o que você deseja gerenciar.</p>
        
        {message.text && (
            <div className={`message ${message.type}`}>{message.text}</div>
        )}
        
        {/* Botão de Voltar para o Dashboard Principal */}
        <div className="action-bar-top">
            <button onClick={() => navigate('/admin/dashboard')} className="btn-back">
                ← Voltar para o Dashboard
            </button>
        </div>

        <div className="button-grid">
          {educationButtons.map(button => (
            <button 
              key={button.path} 
              className="dashboard-nav-button"
              onClick={() => handleNavigation(button.path)}
            >
              <span className="button-icon">{button.icon}</span>
              <span className="button-label">{button.label}</span>
            </button>
          ))}
        </div>
      </main>
      
      {/* FOOTER */}
      <footer className="admin-footer-simple">
        © 2025 Sistema de Gestão.
      </footer>
    </div>
  );
};

export default ManageEducation;