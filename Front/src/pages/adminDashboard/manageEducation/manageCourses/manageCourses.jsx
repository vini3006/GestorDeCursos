import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../services/api';
import './manageCourses.css'; 
import AdminHeader from '../../../../components/AdminHeader';

// Definindo a estrutura básica do curso para o estado inicial
const emptyCourse = { id: null, nome: '', maxAlunos: 0 };

// -------------------------------------------------------------
// COMPONENTES AUXILIARES (MODAL)
// -------------------------------------------------------------

const CourseModal = ({ onClose, onSaveSuccess, courseToEdit }) => {
  // ... (Toda a lógica e estados do Modal, mantida idêntica à versão anterior) ...
  const [formData, setFormData] = useState({ 
    nome: '', 
    maxAlunos: 0,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (courseToEdit) {
      setFormData({
        nome: courseToEdit.nome,
        maxAlunos: courseToEdit.maxAlunos || 0,
      });
    } else {
      setFormData(emptyCourse);
    }
  }, [courseToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ 
        ...formData, 
        [name]: name === 'maxAlunos' ? parseInt(value) || 0 : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { nome, maxAlunos } = formData;
    
    if (!nome || maxAlunos <= 0) {
        setError("O nome é obrigatório e o Máximo de Alunos deve ser positivo.");
        setLoading(false);
        return;
    }

    const payload = { nome, maxAlunos };
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      let response;
      const isEdit = courseToEdit !== null;
      
      if (isEdit) {
        response = await api.put(`/course/${courseToEdit.id}`, payload, config);
        onSaveSuccess(response.data, true); 
      } else {
        response = await api.post('/course/admin', payload, config);
        onSaveSuccess(response.data, false); 
      }
      
      onClose(); 
      
    } catch (err) {
      console.error("Erro ao salvar curso:", err);
      setError(err.response?.data?.msg || "Erro ao salvar dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{courseToEdit ? `Editar Curso: ${courseToEdit.nome}` : 'Novo Curso'}</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="message-feedback message-error">{error}</p>} 
          
          <label htmlFor="nome">Nome do Curso:</label>
          <input 
            name="nome" 
            type="text" 
            placeholder="Ex: Engenharia de Software" 
            onChange={handleChange} 
            value={formData.nome} 
            required 
          />
          
          <label htmlFor="maxAlunos">Máximo de Alunos:</label>
          <input 
            id="maxAlunos"
            name="maxAlunos" 
            type="number" 
            onChange={handleChange} 
            value={formData.maxAlunos} 
            required
            min={1} 
          />
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Cancelar</button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Salvando...' : (courseToEdit ? 'Atualizar' : 'Adicionar')}
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

const ManageCourses = () => {
  const navigate = useNavigate();
  
  // Estados
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null); 
  const [message, setMessage] = useState({ text: '', type: '' });

  // ... (fetchCourses, handleDelete, handleEditClick, handleAddClick, handleSaveSuccess, useEffect - mantidos idênticos) ...

  const fetchCourses = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.get('/course/', { headers: { Authorization: `Bearer ${token}` }});
        setCourses(response.data); 
      }
    } catch (error) {
      if (error.response?.status === 401) { 
        localStorage.removeItem('token'); 
        navigate('/'); 
      }
      setMessage({ text: 'Falha ao carregar lista de cursos.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja remover o curso "${nome}"?`)) return;
    try {
        const token = localStorage.getItem('token');
        await api.delete(`/course/admin/${id}`, { headers: { Authorization: `Bearer ${token}` }});
        setCourses(courses.filter(c => c.id !== id));
        setMessage({ text: `Curso "${nome}" removido com sucesso!`, type: 'success' });
    } catch (error) {
        setMessage({ text: `Erro ao remover: ${error.response?.data?.msg || 'Erro desconhecido'}`, type: 'error' });
    }
  };

  const handleEditClick = (course) => {
    setCurrentCourse(course);
    setShowModal(true);
  };

  const handleAddClick = () => {
    setCurrentCourse(null);
    setShowModal(true);
  };

  const handleSaveSuccess = (savedCourse, isEdit) => {
    if (isEdit) {
        fetchCourses();
        setMessage({ text: "Curso atualizado com sucesso!", type: 'success' });
    } else {
        fetchCourses(); 
        setMessage({ text: "Novo curso criado com sucesso!", type: 'success' });
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);


  return (
    <div className="manage-semesters-layout"> 
      
      <AdminHeader />

      <main className="manage-content"> 
        <h1 className="page-title">Gerenciar Cursos</h1>
        
        <div className="action-bar">
          <button onClick={() => navigate('/admin/education')} className="btn-back">← Voltar para Ensino</button>
          <button onClick={handleAddClick} className="btn-add">Adicionar Curso</button>
        </div>
        
        {message.text && (
            <div className={`message-feedback message-${message.type}`}>{message.text}</div>
        )}

        <div className="table-container shadow-md">
          {loading ? (
            <p className="loading-state">Carregando cursos...</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome do Curso</th>
                  <th>Máx. de Alunos</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {courses.length === 0 ? (
                  <tr><td colSpan="4" className="no-data">Nenhum curso cadastrado.</td></tr>
                ) : (
                  courses.map(course => (
                    <tr key={course.id}> 
                      <td>{course.id}</td>
                      <td><strong>{course.nome}</strong></td>
                      <td>{course.maxAlunos}</td>
                      <td>
                        {/* 💡 CORRIGIDO: Usando .btn-action e Emojis para igualar o visual do Semestres */}
                        <button onClick={() => handleEditClick(course)} className="btn-action btn-edit" title="Editar">
                           ✏️
                        </button>
                        <button onClick={() => handleDelete(course.id, course.nome)} className="btn-action btn-remove" title="Excluir">
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
        <CourseModal 
            onClose={() => setShowModal(false)} 
            onSaveSuccess={handleSaveSuccess} 
            courseToEdit={currentCourse}
        />
      )}
      
      <footer className="admin-footer-simple">© 2025 Sistema de Gestão.</footer>
    </div>
  );
};

export default ManageCourses;