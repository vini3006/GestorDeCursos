export class Semester{
    public id?: number;
    public nome?: string;
    public dataInicio?: Date;
    public dataFim?: Date;

    constructor(id: number,  nome: string, dataInicio: Date, dataFim: Date){
        this.id = id;
        this.nome = nome;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
    }
}