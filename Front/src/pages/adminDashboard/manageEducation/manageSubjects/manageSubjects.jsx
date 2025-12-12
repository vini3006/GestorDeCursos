import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../services/api';
import './manageSubjects.css'; 
import AdminHeader from '../../../../components/AdminHeader';

// -------------------------------------------------------------
// COMPONENTES AUXILIARES (MODAL)
// -------------------------------------------------------------

const SubjectModal = ({ onClose, onSaveSuccess, subjectToEdit, courses }) => {
  const [formData, setFormData] = useState({ 
    nome: '', 
    periodo: 1, 
    idCurso: courses.length > 0 ? courses[0].id : '', // Define o primeiro curso como padrão
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isEdit = subjectToEdit !== null;

  // Se houver uma disciplina para editar, preenche o formulário ao abrir
  useEffect(() => {
    if (subjectToEdit) {
      setFormData({
        nome: subjectToEdit.nome,
        periodo: subjectToEdit.periodo || 1,
        // Garante que o ID do curso da disciplina é selecionado, ou o primeiro disponível
        idCurso: subjectToEdit.idCurso || (courses.length > 0 ? courses[0].id : ''), 
      });
    } else if (courses.length > 0 && !formData.idCurso) {
      // Se for criação e o idCurso ainda não foi setado, usa o primeiro da lista
      setFormData(prev => ({ ...prev, idCurso: courses[0].id }));
    }
  }, [subjectToEdit, courses]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ 
        ...formData, 
        [name]: (name === 'periodo' || name === 'idCurso') ? parseInt(value) || 1 : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { nome, periodo, idCurso } = formData;
    
    if (!nome || periodo < 1 || periodo > 10) {
        setError("O nome é obrigatório e o Período deve ser entre 1 e 10.");
        setLoading(false);
        return;
    }

    if (!isEdit && (!idCurso || idCurso === '')) {
        setError("Selecione um curso para vincular a disciplina.");
        setLoading(false);
        return;
    }

    const payload = { nome, periodo, idCurso };
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      let response;
      
      if (isEdit) {
        // EDIÇÃO (PUT): O backend só precisa de nome e periodo para atualizar
        const updatePayload = { nome, periodo }; 
        response = await api.put(`/subject/admin/${subjectToEdit.id}`, updatePayload, config);
      } else {
        // CRIAÇÃO (POST): Precisa de nome, periodo E idCurso
        response = await api.post('/subject/admin', payload, config);
      }
      
      onSaveSuccess(response.data, isEdit); 
      onClose(); 
      
    } catch (err) {
      console.error("Erro ao salvar disciplina:", err);
      setError(err.response?.data?.msg || "Erro ao salvar dados.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{isEdit ? `Editar Disciplina: ${subjectToEdit.nome}` : 'Nova Disciplina'}</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="message-feedback message-error">{error}</div>} 
          
          <label htmlFor="nome">Nome da Disciplina:</label>
          <input 
            name="nome" 
            type="text" 
            placeholder="Ex: Introdução à Programação" 
            onChange={handleChange} 
            value={formData.nome} 
            required 
          />
          
          <label htmlFor="periodo">Período (Semestre) de Oferta:</label>
          <input 
            id="periodo"
            name="periodo" 
            type="number" 
            onChange={handleChange} 
            value={formData.periodo} 
            required
            min={1}
            max={10} 
          />
          
          {/* Campo de Seleção de Curso (Apenas para Criação) */}
          {!isEdit && (
            <>
              <label htmlFor="idCurso">Vincular ao Curso:</label>
              <select 
                id="idCurso"
                name="idCurso" 
                onChange={handleChange} 
                value={formData.idCurso} 
                required
                disabled={courses.length === 0}
              >
                {courses.length === 0 ? (
                  <option value="" disabled>Carregando ou nenhum curso disponível</option>
                ) : (
                  courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.nome} (ID: {course.id})
                    </option>
                  ))
                )}
              </select>
            </>
          )}

          {isEdit && <p className="small-info">Para alterar o Curso da disciplina, utilize o menu de Vínculos.</p>}
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Cancelar</button>
            <button type="submit" className="btn-save" disabled={loading || (!isEdit && courses.length === 0)}>
              {loading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Adicionar')}
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

const ManageSubjects = () => {
  const navigate = useNavigate();
  
  // Estados
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]); // Novo estado para cursos
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null); 
  const [message, setMessage] = useState({ text: '', type: '' });

  // Buscar Todos os Cursos
  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      // Rota GET: /course/
      const response = await api.get('/course/', { headers: { Authorization: `Bearer ${token}` }});
      setCourses(response.data); 
    } catch (error) {
      console.error("Erro ao carregar cursos para modal:", error);
    }
  };

  // Buscar Todas as Disciplinas
  const fetchSubjects = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/subject/', { headers: { Authorization: `Bearer ${token}` }});
      
      if (Array.isArray(response.data)) {
        setSubjects(response.data); 
      } else {
        setSubjects([]);
        console.error("A API de disciplinas não retornou um array:", response.data);
      }
      
    } catch (error) {
      setSubjects([]); 
      setMessage({ text: 'Falha ao carregar lista de disciplinas. Verifique a rota /subject/.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Deletar Disciplina
  const handleDelete = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja remover a disciplina "${nome}"?`)) return;
    try {
        const token = localStorage.getItem('token');
        // Rota DELETE: /subject/admin/:id
        await api.delete(`/subject/admin/${id}`, { headers: { Authorization: `Bearer ${token}` }});
        
        setSubjects(subjects.filter(s => s.id !== id));
        setMessage({ text: `Disciplina "${nome}" removida com sucesso!`, type: 'success' });
    } catch (error) {
        setMessage({ text: `Erro ao remover: ${error.response?.data?.msg || 'Erro desconhecido'}`, type: 'error' });
    }
  };

  const handleEditClick = (subject) => {
    setCurrentSubject(subject);
    setShowModal(true);
  };

  const handleAddClick = () => {
    setCurrentSubject(null);
    setShowModal(true);
  };

  // Callback após salvar (criação ou edição)
  const handleSaveSuccess = (savedSubject, isEdit) => {
    // Recarregar do servidor para garantir a ordem e o estado correto, resolvendo a necessidade de F5
    fetchSubjects(); 
    
    if (isEdit) {
        setMessage({ text: "Disciplina atualizada com sucesso!", type: 'success' });
    } else {
        setMessage({ text: "Nova disciplina criada com sucesso!", type: 'success' });
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchCourses(); // Chamada para carregar os cursos
  }, []);

  const getCourseName = (idCurso) => {
    if (!idCurso) return 'N/A';
    // O array 'courses' precisa estar carregado para que esta função funcione
    const course = courses.find(c => c.id === idCurso); 
    return course ? course.nome : `ID: ${idCurso} (Não Encontrado)`;
  };

  return (
    <div className="manage-semesters-layout"> 
      
      <AdminHeader />

      <main className="manage-content"> 
        <h1 className="page-title">Gerenciar Disciplinas</h1>
        
        <div className="action-bar">
          <button onClick={() => navigate('/admin/dashboard')} className="btn-back">← Voltar</button>
          <button 
            onClick={handleAddClick} 
            className="btn-add"
            title={courses.length === 0 ? "Carregando cursos..." : "Adicionar Disciplina"}
            disabled={courses.length === 0 && !loading} // Desabilita se não tiver cursos carregados
          >
            Adicionar Disciplina
          </button>
        </div>
        
        {message.text && (
            <div className={`message-feedback message-${message.type}`}>{message.text}</div>
        )}

        <div className="table-container shadow-md">
          {loading ? (
            <p className="loading-state">Carregando disciplinas...</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome da Disciplina</th>
                  <th>Período</th>
                  <th>Curso</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {subjects.length === 0 ? (
                  <tr><td colSpan="5" className="no-data">Nenhuma disciplina cadastrada.</td></tr>
                ) : (
                  subjects.map(subject => (
                    <tr key={subject.id}> 
                      <td>{subject.id}</td>
                      <td><strong>{subject.nome}</strong></td>
                      <td>{subject.periodo}° Período</td>
                      <td>{getCourseName(subject.idCurso)}</td>
                      <td>
                        <button onClick={() => handleEditClick(subject)} className="btn-action btn-edit" title="Editar">
                           ✏️
                        </button>
                        <button onClick={() => handleDelete(subject.id, subject.nome)} className="btn-action btn-remove" title="Excluir">
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
        <SubjectModal 
            onClose={() => setShowModal(false)} 
            onSaveSuccess={handleSaveSuccess} 
            subjectToEdit={currentSubject}
            courses={courses}
        />
      )}
      
      <footer className="admin-footer-simple">© 2025 Sistema de Gestão.</footer>
    </div>
  );
};

export default ManageSubjects;