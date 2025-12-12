export class Class{ // Definição da classe Turma, representando a entidade na tabela 'turma'.
    public id?: number;
    public idMateria?: number;
    public cpfProfessor?: string;
    public numAlunos?: number;
    public maxAlunos?: number;
    public idPeriodoLetivo?: number;
    public dataFechamentoFila?: Date

    /**
     * Construtor da classe Class.
     */
    constructor(id: number, idMateria: number, cpfProfessor: string, numAlunos:number, maxAlunos: number, idPeriodoLetivo: number, dataFechamentoFila: Date){
        this.id = id;
        this.idMateria = idMateria;
        this.cpfProfessor = cpfProfessor;
        this.numAlunos = numAlunos;
        this.maxAlunos = maxAlunos;
        this.idPeriodoLetivo = idPeriodoLetivo;
        this.dataFechamentoFila = dataFechamentoFila;
    }
}