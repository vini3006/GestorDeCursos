export class Account{ //declara a classe conta
    public matricula?: string;
    public senha?: string;
    public tipo?: 'administrador' | 'professor' | 'aluno' | string;
    public dataCriacao?: Date;
    public cpf?: string;

    constructor(matricula: string, senha:string, tipo: string, dataCriacao: Date, cpf: string){
        this.matricula = matricula;
        this.senha = senha;
        this.tipo = tipo;
        this.dataCriacao = dataCriacao;
        this.cpf = cpf;
    }
}