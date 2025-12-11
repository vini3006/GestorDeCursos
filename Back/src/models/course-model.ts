export class Course{
    id?: number;
    nome?: string;
    maxAlunos?: number;

    constructor(id: number, nome: string, maxAlunos: number){
        this.id = id;
        this.nome = nome;
        this.maxAlunos = maxAlunos;
    }
}