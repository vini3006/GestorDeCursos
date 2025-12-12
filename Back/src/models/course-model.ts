export class Course{ // Definição da classe Curso, representando a entidade na tabela 'curso'.
    id?: number; 
    nome?: string; 
    maxAlunos?: number; 

    /**
     * Construtor da classe Course.
     */
    constructor(id: number, nome: string, maxAlunos: number){
        this.id = id;
        this.nome = nome;
        this.maxAlunos = maxAlunos;
    }
}