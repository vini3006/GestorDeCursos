export class Subject{
    public id?: number;
    public nome?: string;
    public periodo?: number;
    public idCurso?: number;

    constructor(id: number, nome: string, periodo: number){
        this.id = id;
        this.nome = nome;
        this.periodo = periodo;
        this.idCurso = this.idCurso;
    }
}