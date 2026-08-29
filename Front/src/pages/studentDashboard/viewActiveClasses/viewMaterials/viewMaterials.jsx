import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentHeader from '../../../../components/studentHeader';
import api from '../../../../services/api';
import './viewMaterials.css';

const ViewMaterials = () => {
    // Pega o idTurma da URL
    const { idTurma } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [materials, setMaterials] = useState([]);
    const [error, setError] = useState(null);
    const [className, setClassName] = useState("Carregando Turma...");

    // Função auxiliar para formatar a data
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        // Garante que a data seja tratada corretamente
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    };

    // Função para buscar os materiais
    const fetchMaterials = async () => {
        setLoading(true);
        setError(null);
        setClassName("Carregando Turma...");
        
        try {
            const response = await api.get(`/class/student/materials/${idTurma}`);
            
            const fetchedMaterials = response.data;

            if (fetchedMaterials.length > 0) {
                setClassName(fetchedMaterials[0].className); 
            } else {
                // Se o array estiver vazio, tentamos um nome genérico.
                // Idealmente, você faria uma chamada separada se o array estiver vazio,
                // mas vamos manter a simplicidade por enquanto.
                setClassName(`Turma ID ${idTurma} (Sem Materiais)`); 
            }
            
            setMaterials(fetchedMaterials); // Define todos os materiais

        } catch (err) {
            console.error("Erro ao buscar materiais:", err);
            
            if (err.response && err.response.status === 404) {
                 setError("Você não está matriculado nesta turma, a turma não existe, ou o servidor não retornou dados.");
                 setClassName(`Turma ID ${idTurma}`); 
            } else {
                 setError("Não foi possível carregar os materiais. Verifique a conexão com a API.");
                 setClassName(`Turma ID ${idTurma}`); 
            }
            setMaterials([]);
            
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (idTurma) {
            fetchMaterials();
        } else {
            setError("ID da turma não encontrado na URL.");
            setLoading(false);
        }
    }, [idTurma]);

    if (loading) {
        return (
            <>
                <StudentHeader />
                <div className="materials-container">
                    <p className="loading-text">Carregando materiais de {className}...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <StudentHeader />
            <div className="materials-container">
                <header className="materials-header">
                    <h1 className="header-title">Materiais de Apoio</h1>
                    <h2 className="header-subtitle">{className}</h2>
                    <button className="back-button" onClick={() => navigate(-1)}>
                        &larr; Voltar para Turmas
                    </button>
                </header>

                {error && <div className="message error">{error}</div>}

                <div className="materials-list">
                    {materials.length === 0 ? (
                        <p className="no-data-message">Não há materiais postados para esta turma ainda.</p>
                    ) : (
                        materials.map(material => (
                            <div key={material.id} className="material-card">
                                <div className="material-content">
                                    <h3 className="material-title">{material.titulo}</h3>
                                    <p className="material-description">{material.descricao}</p>
                                    <p className="material-date">Postado em: {formatDate(material.dataPostagem)}</p>
                                </div>
                                
                                {/* O link deve estar na propriedade 'link' do objeto material */}
                                <a 
                                    href={material.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="material-link-button"
                                >
                                    Acessar Material 🔗
                                </a>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default ViewMaterials;