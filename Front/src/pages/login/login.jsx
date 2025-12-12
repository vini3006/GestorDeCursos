import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { jwtDecode } from 'jwt-decode'
import './login.css';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  // Mantive seus estados iguais
  const [formData, setFormData] = useState({
    matricula: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

useEffect(() => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (token && userString) {
        try {
            const user = JSON.parse(userString);
            
            // 🌟 NOVO: Verifica o tipo do usuário logado 🌟
            if (user.tipo === 'administrador') {
                navigate('/admin/dashboard', { replace: true });
            } else if(user.tipo === 'professor'){
                navigate('/professor/dashboard', { replace: true }); 
            } else {
                navigate('/', { replace: true })
            }
        } catch (e) {
            // Limpa dados se houver erro no JSON e mantém na tela de login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }
}, [navigate]);

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({ matricula: '', password: '', confirmPassword: '' });
    setErrors({});
    setMessage({ text: '', type: '' });
  };

  const validateForm = () => {
    const newErrors = {};

    // 1. Validação da Matrícula
    if (!formData.matricula) {
      newErrors.matricula = 'Matrícula é obrigatória'; // Ajuste a mensagem
    }

    // 2. Validação da Senha (Se for Login)
    if (isLogin) {
      if (!formData.password) {
        newErrors.password = 'Senha é obrigatória';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };


  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await api.post('users/login', {
        matricula: formData.matricula,
        senha: formData.password 
      });

      const { token } = response.data;

      const decodedToken = jwtDecode(token);
      const userTipo = decodedToken.tipo;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ tipo: userTipo, matricula: decodedToken.matricula, cpf: decodedToken.cpf }));
      
      setMessage({ text: 'Login realizado com sucesso!', type: 'success' });
      
      // Pequeno delay para usuário ver a mensagem
      setTimeout(() => {
        
        if (userTipo === 'administrador') {
            navigate('/admin/dashboard');
        } else {
            // Se não for administrador, redireciona para a rota padrão ou outra dashboard
            navigate('/'); 
        }
        // --------------------------------------------------
        
      }, 1000);

    } catch (error) {
      console.error('Erro ao fazer login:', error);
      
      // Tratamento de erro melhorado para Axios
      const errorMsg = error.response?.data?.msg || 'Erro ao conectar com o servidor.';
      
      setMessage({ 
        text: errorMsg, 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };
  // -------------------------------------

  const handlePasswordRecovery = async (e) => {
    e.preventDefault();
    setMessage({ text: 'Funcionalidade em desenvolvimento', type: 'error' });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          {/* Certifique-se que a imagem está na pasta public }
          <img src="/gesTAuto.png" alt="GesTAuto Logo" className="login-logo"/>*/}
          <h1 className="login-title">{isLogin ? 'Bem-vindo de volta!' : 'Recuperar Senha'}</h1>
          <p className="login-subtitle">
            {isLogin ? 'Faça login para acessar o sistema' : 'Digite seu email para receber instruções'}
          </p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={isLogin ? handleLogin : handlePasswordRecovery} className="login-form">
          <div className="form-group">
            <label htmlFor="matricula" className="form-label">Matricula</label>
            <input
              type="text"
              id="matricula"
              name="matricula"
              value={formData.matricula}
              onChange={handleChange}
              className={`form-input ${errors.matricula ? 'input-error' : ''}`}
              placeholder="Matricula"
              disabled={loading}
            />
            {errors.matricula && <span className="error-message">{errors.matricula}</span>}
          </div>

          {isLogin && (
            <div className="form-group">
              <label htmlFor="password" className="form-label">Senha</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="••••••••"
                disabled={loading}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
          )}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? <span className="loading-spinner"></span> : (isLogin ? 'Entrar' : 'Enviar Instruções')}
          </button>
        </form>

        <div className="login-footer">
          <button type="button" onClick={toggleForm} className="toggle-button" disabled={loading}>
            {isLogin ? 'Esqueceu sua senha?' : 'Voltar para o login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;