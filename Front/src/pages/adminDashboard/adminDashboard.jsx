import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './adminDashboard.css'; // Importa o novo CSS
import AdminHeader from '../../components/AdminHeader';
// -------------------------------------------------------------
// DADOS DE NAVEGAÇÃO
// -------------------------------------------------------------
const navButtons = [
  { label: 'Gerenciar Usuários', path: '/admin/users', icon: '👤' },
  { label: 'Gerenciar Ensino', path: '/admin/education', icon: '📚' },
  { label: 'Gerenciar Períodos Letivos', path: '/admin/semesters', icon: '🗓️' },
  { label: 'Ver Dados', path: '/admin/data', icon: '📊' },
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
            // A key é o caminho, garantindo que seja única
            <button 
              key={button.path} 
              className="dashboard-nav-button"
              onClick={() => handleNavigation(button.path)}
              disabled={loading}
            >
              <span className="button-icon">{button.icon}</span>
              <span className="button-label">{button.label}</span>
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