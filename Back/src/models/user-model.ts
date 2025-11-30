export class User { //definição da classe usuario, com os atributos sendo "opcionais" no contexto do back end
    public cpf?: string;
    public nome?: string;
    public dt_nascimento?: Date;
    public email?:string;

    constructor(cpf: string, nome: string, dt_nascimento: Date, email: string){
        this.cpf = cpf;
        this.nome = nome;
        this.dt_nascimento = dt_nascimento;
        this.email = email;
    }
}