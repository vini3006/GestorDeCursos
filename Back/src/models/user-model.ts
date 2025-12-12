export class User { // Definição da classe usuário, representando a entidade na tabela 'usuario' do banco de dados.
    public cpf?: string;
    public nome?: string;
    public dt_nascimento?: Date;
    public email?:string;

    /**
     * Construtor da classe User.
     */
    constructor(cpf: string, nome: string, dt_nascimento: Date, email: string){
        this.cpf = cpf;
        this.nome = nome;
        this.dt_nascimento = dt_nascimento;
        this.email = email;
    }
}