export class Subject{ // Definição da classe Matéria/Disciplina, representando a entidade na tabela 'materia'.
    public id?: number;
    public nome?: string;
    public periodo?: number;
    public idCurso?: number; // Chave estrangeira que referencia a qual Curso a matéria pertence.

    /**
     * Construtor da classe Subject.
     */
    constructor(id: number, nome: string, periodo: number, idCurso: number){
        this.id = id;
        this.nome = nome;
        this.periodo = periodo;
        this.idCurso = idCurso;
    }
}