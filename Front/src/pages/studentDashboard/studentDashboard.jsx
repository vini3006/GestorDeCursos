import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentHeader from "../../components/studentHeader" // Ajuste o caminho
import api from '../../services/api'; 
import './studentDashboard.css'; 
import { jwtDecode } from 'jwt-decode';

// -------------------------------------------------------------
// DADOS DE NAVEGAÇÃO DO ALUNO 
// -------------------------------------------------------------
const navButtons = [
  { 
    label: 'Ver Turmas Ativas', 
    path: '/student/active-classes', 
    icon: '📚', 
    description: 'Acesse materiais, atividades e notas das turmas em que você está matriculado.' 
  },
  { 
    label: 'Gerenciar Matrículas', 
    path: '/student/enroll', 
    icon: '📝', 
    description: 'Procure turmas abertas, matricule-se e verifique sua posição na fila de espera.' 
  },
  { 
    label: 'Ver Histórico Escolar', 
    path: '/student/academic-record', 
    icon: '📊', 
    description: 'Visualize seu histórico de cursos, médias finais e situação de aprovação/reprovação.' 
  },
];

const StudentDashboard = () => {
    const navigate = useNavigate();
    
    // Checa token e tipo de usuário ao carregar
    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            // Se não tem token, VAI DIRETO para login e NÃO RENDERIZA NADA do dashboard.
            navigate('/login', { replace: true });
            return;
        }

        try {
            // Verifica se o usuário é realmente um ALUNO
            const user = jwtDecode(token);
            if (user.tipo !== 'aluno') {
                // Token válido, mas tipo incorreto: Limpa e VAI DIRETO para a home/login.
                localStorage.removeItem('token');
                navigate('/', { replace: true });
            }
            // Se o token existe e o tipo é 'aluno', o useEffect termina e a renderização prossegue.

        } catch (error) {
            // Token inválido (expirado ou malformado): Limpa e VAI DIRETO para login.
            console.error("Token inválido:", error);
            localStorage.removeItem('token');
            navigate('/login', { replace: true });
        }
        
    }, [navigate]); // Dependência em navigate

    const handleNavigation = (path) => {
        navigate(path);
    };
    
    // 🚨 PONTO CHAVE: Retorna null se o token não existir (e o useEffect deve redirecionar).
    // Se o token existir, prossegue com a renderização.
    if (!localStorage.getItem('token')) {
        return null; 
    }

    return (
        <div className="student-layout-simple">
            
            {/* HEADER */}
            <StudentHeader />

            {/* CONTEÚDO PRINCIPAL COM BOTÕES */}
            <main className="main-content-buttons">
                <h1 className="dashboard-title">Painel do Aluno</h1>
                <p className="dashboard-subtitle">Selecione uma opção para gerenciar seus estudos.</p>
                
                <div className="button-grid">
                    {navButtons.map(button => (
                        <button 
                            key={button.path} 
                            className="dashboard-nav-button"
                            onClick={() => handleNavigation(button.path)}
                            // O loading foi removido, disabled pode ser removido ou definido como false
                        >
                            <span className="button-icon">{button.icon}</span>
                            <span className="button-label">{button.label}</span>
                            <span className="button-description">{button.description}</span>
                        </button>
                    ))}
                </div>
            </main>
            
            {/* FOOTER */}
            <footer className="student-footer-simple">
                © 2025 Sistema de Gestão. Todos os direitos reservados.
            </footer>
        </div>
    );
};

export default StudentDashboard;