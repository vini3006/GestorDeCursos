import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from "../../../services/api" // Certifique-se de que o caminho para o seu Axios está correto
import './registerResource.css'

// Componente para cadastrar Material ou Atividade
const RegisterResource = ({ user = {}, classes = [] }) => {
    const { idTurma: idTurmaParam } = useParams(); 

    // Estado para controlar o tipo de recurso selecionado: 'material' ou 'atividade'
    const [resourceType, setResourceType] = useState('material');
    
    // Estado para a turma selecionada
    const [selectedClassId, setSelectedClassId] = useState(idTurmaParam ? Number(idTurmaParam) : null);
    
    // NOVO ESTADO: Para armazenar o nome da turma
    const [selectedClassName, setSelectedClassName] = useState('');

    // Estado dos dados do formulário
    const [formData, setFormData] = useState({
        titulo: '',
        link: '', // Apenas para Material
        descricao: '',
        dataFechamento: '', // Apenas para Atividade
        notaMaxima: '' // Apenas para Atividade
    });

    // Estados de UI
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    
    // 1. Efeito para definir o ID da turma
    useEffect(() => {
        if (idTurmaParam) {
            setSelectedClassId(Number(idTurmaParam));
        }
    }, [idTurmaParam]);
    
    // 2. NOVO Efeito para encontrar o NOME da turma com base no ID e na lista de classes
    useEffect(() => {
        if (selectedClassId && classes && classes.length > 0) {
            const turmaEncontrada = classes.find(c => c.id === selectedClassId);
            if (turmaEncontrada) {
                // Assumindo que 'nomeMateria' é o campo que contém o nome da turma
                setSelectedClassName(turmaEncontrada.nomeMateria); 
            } else {
                setSelectedClassName(`ID ${selectedClassId} (Nome não encontrado)`);
            }
        } else if (idTurmaParam) {
             // Se não encontrou o nome mas tem o ID da URL (caso as props 'classes' sejam carregadas depois)
             setSelectedClassName(`ID ${idTurmaParam}`);
        }
    }, [selectedClassId, classes, idTurmaParam]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleResourceTypeChange = (e) => {
        setResourceType(e.target.value);
        // Limpa os dados específicos ao mudar o tipo de recurso
        setFormData({
            titulo: '',
            link: '',
            descricao: '',
            dataFechamento: '',
            notaMaxima: ''
        });
        setMessage({ text: '', type: '' });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedClassId) {
            return setMessage({ text: "Selecione uma turma.", type: 'error' });
        }

        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            let response;

            if (resourceType === 'material') {
                if (!formData.titulo || !formData.link) {
                    throw new Error("Título e Link são obrigatórios para Material.");
                }
                
                // 🌟 ROTA ATUALIZADA: /professor/registerMaterial/:idTurma 🌟
                response = await api.post(`/class/professor/registerMaterial/${selectedClassId}`, {
                    titulo: formData.titulo,
                    link: formData.link,
                    descricao: formData.descricao
                });
                
            } else if (resourceType === 'atividade') {
                if (!formData.titulo || !formData.descricao || !formData.dataFechamento || formData.notaMaxima === '' || isNaN(Number(formData.notaMaxima))) {
                    throw new Error("Todos os campos (Título, Descrição, Data, Nota Máxima) são obrigatórios para Atividade.");
                }
                
                // 🌟 ROTA ATUALIZADA: /professor/registerActivity/:idTurma 🌟
                response = await api.post(`/class/professor/registerActivity/${selectedClassId}`, {
                    titulo: formData.titulo,
                    descricao: formData.descricao,
                    dataFechamento: formData.dataFechamento, // O backend deve converter string para Date
                    notaMaxima: Number(formData.notaMaxima)
                });
            }

            setMessage({ text: response.data.msg || `${resourceType === 'material' ? 'Material' : 'Atividade'} cadastrado com sucesso!`, type: 'success' });
            
            // Limpa o formulário após sucesso
            setFormData({
                titulo: '',
                link: '',
                descricao: '',
                dataFechamento: '',
                notaMaxima: ''
            });

        } catch (error) {
            console.error(`Erro ao cadastrar ${resourceType}:`, error);
            const errorMsg = error.response?.data?.msg || error.message || `Erro ao conectar com o servidor.`;
            setMessage({ text: errorMsg, type: 'error' });
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="register-resources-container">
            <h2>Cadastrar Material ou Atividade</h2>

            {/* Seletor de Tipo de Recurso */}
            <div className="resource-type-selector">
                <label htmlFor="resourceType">Tipo de Recurso:</label>
                <select id="resourceType" value={resourceType} onChange={handleResourceTypeChange}>
                    <option value="material">Material Didático</option>
                    <option value="atividade">Atividade Avaliativa</option>
                </select>
            </div>
            
            {/* Seletor de Turma (Visível apenas se o ID não veio da URL) */}
            {classes && classes.length > 0 && !idTurmaParam && (
                 <div className="class-selector">
                    <label htmlFor="classId">Turma:</label>
                    <select 
                        id="classId" 
                        value={selectedClassId || ''} 
                        onChange={(e) => {
                            const newClassId = Number(e.target.value);
                            setSelectedClassId(newClassId);
                            // Atualiza o nome da turma imediatamente ao selecionar
                            const turmaEncontrada = classes.find(c => c.id === newClassId);
                            if (turmaEncontrada) {
                                setSelectedClassName(turmaEncontrada.nomeMateria);
                            }
                        }}
                    >
                        <option value="" disabled>Selecione a Turma</option>
                        {classes.map(c => (
                            // Use uma identificação clara da turma.
                            <option key={c.id} value={c.id}>
                                Turma {c.id} - {c.subjectName} ({c.periodName})
                            </option>
                        ))}
                    </select>
                 </div>
            )}
            
            {/* NOVO JSX: Exibe o nome da turma (se disponível) ou ID */}
            {idTurmaParam && selectedClassId && (
                <div className="current-class-info">
                    Cadastrando para a turma: <strong>{selectedClassName || `ID ${selectedClassId}`}</strong>
                </div>
            )}


            <form onSubmit={handleSubmit} className="resource-form">
                
                {/* CAMPOS COMUNS */}
                <div className="form-group">
                    <label htmlFor="titulo">Título:</label>
                    <input
                        type="text"
                        id="titulo"
                        name="titulo"
                        value={formData.titulo}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="descricao">Descrição:</label>
                    <textarea
                        id="descricao"
                        name="descricao"
                        value={formData.descricao}
                        onChange={handleChange}
                        // Descrição é obrigatória para Atividade e opcional para Material.
                        required={resourceType === 'atividade'}
                    />
                </div>


                {/* CAMPOS ESPECÍFICOS */}
                {resourceType === 'material' && (
                    <div className="form-group">
                        <label htmlFor="link">Link (URL):</label>
                        <input
                            type="url"
                            id="link"
                            name="link"
                            value={formData.link}
                            onChange={handleChange}
                            required
                        />
                    </div>
                )}

                {resourceType === 'atividade' && (
                    <>
                        <div className="form-group">
                            <label htmlFor="dataFechamento">Data de Fechamento:</label>
                            <input
                                type="date"
                                id="dataFechamento"
                                name="dataFechamento"
                                value={formData.dataFechamento}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="notaMaxima">Nota Máxima:</label>
                            <input
                                type="number"
                                id="notaMaxima"
                                name="notaMaxima"
                                value={formData.notaMaxima}
                                onChange={handleChange}
                                min="0.1" // Nota máxima deve ser maior que 0
                                step="0.1"
                                required
                            />
                        </div>
                    </>
                )}
                
                {/* Mensagem e Botão */}
                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <button type="submit" disabled={loading || !selectedClassId}>
                    {loading ? 'Cadastrando...' : `Cadastrar ${resourceType === 'material' ? 'Material' : 'Atividade'}`}
                </button>
            </form>
        </div>
    );
};

export default RegisterResource;