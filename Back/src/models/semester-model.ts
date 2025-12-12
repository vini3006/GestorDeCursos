export class Semester{ // Definição da classe Período Letivo, representando a entidade na tabela 'periodoLetivo'.
    public id?: number;
    public nome?: string;
    public dataInicio?: Date;
    public dataFim?: Date;

    /**
     * Construtor da classe Semester.
     */
    constructor(id: number,  nome: string, dataInicio: Date, dataFim: Date){
        this.id = id;
        this.nome = nome;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
    }
}