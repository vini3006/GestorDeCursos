export class Account{ // Definição da classe Conta, representando a entidade na tabela 'conta' e usada para login.
    public matricula?: string;
    public senha?: string;
    public tipo?: 'administrador' | 'professor' | 'aluno' | string;
    public dataCriacao?: Date;
    public cpf?: string;

    /**
     * Construtor da classe Account.
     */
    constructor(matricula: string, senha:string, tipo: string, dataCriacao: Date, cpf: string){
        this.matricula = matricula;
        this.senha = senha;
        this.tipo = tipo;
        this.dataCriacao = dataCriacao;
        this.cpf = cpf;
    }
}