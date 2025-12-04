import db from '../config/database'; //arquivo que acessa o banco de dados diretamente
import { User } from '../models/user-model';
import { Account } from '../models/account-model';

const userService = {
    getAllUsers: async(): Promise<User[]> => { //definindo o tipo de retorno da função com a classe usuario
        const [rows] = await db.execute(`SELECT * from usuario;`);

        const users = rows as User[];

        return users;
    },

    insertUser: async(user: User, account: Account) => { //insere usuario e sua(s) respectiva(s) conta(s) (1.1)
        if(!user.cpf){ //caso a chave primária de usuário não tenha sido fornecida
            return {msg: "CPF não fornecido."}
        }else if(user.cpf){
            const [rows] = await db.execute<any[]>(`SELECT cpf from usuario WHERE cpf = ?;`, [user.cpf]);

            if(rows.length > 0){ // faz a inserção de uma nova conta para um usuário já existente
                const [rows] = await db.execute(`SELECT tipo from conta WHERE cpf = ?;`, [user.cpf]);
                const listaTipos = (rows as any[]).map(r => r.tipo); //cria uma lista com os tipos de rows
                const existe = listaTipos.includes(account.tipo);

                if(existe){
                    return {msg: `Usuário de CPF = ${user.cpf} ja possui uma conta do tipo ${account.tipo}`};
                } else if (!existe){
                    const [newAccount] = await db.execute(`INSERT INTO conta (matricula, senha, tipo, cpf, dataCriacao) VALUES (?, ?, ?, ?, ?)`, [account.matricula, account.senha, account.tipo, user.cpf, account.dataCriacao]);

                    return {newAccount, msg: "Conta inserida com sucesso!"};
                }
            } else { //insere o usuario e a conta em caso de ser um novo usuário
                const [newUser] = await db.execute(`INSERT INTO usuario VALUES (?, ?, ?, ?)`, [user.cpf, user.nome, user.dt_nascimento, user.email]);
                
                const [newAccount] = await db.execute(`INSERT INTO conta (matricula, senha, tipo, cpf, dataCriacao) VALUES (?, ?, ?, ?, ?)`, [account.matricula, account.senha, account.tipo, user.cpf, account.dataCriacao]);

                return {newUser, newAccount, msg: "Usuario e conta inseridos com sucesso!"};
            }
        }
    }, 

    getAccountByMatricula: async(matricula: string): Promise<Account | null> => { //seleciona uma conta em função da matrícula
        const [rows] = await db.execute(`SELECT * FROM conta WHERE matricula = ?;`, [matricula]);
        
        const contas = rows as Account[];

        if (contas.length == 0) {
            return null;
        }

        return contas[0];
    },

    updateAccount: async(cpf: string, matricula: string, updates: { email?: string, senha?: string }) => { //usuario altera seus próprios dados do perfil, sendo eles email e/ou senha (1.5)
        const { email, senha } = updates;

        const result = { emailAtualizado: false, senhaAtualizada: false }; //objeto para ser retornado ao controller, dizendo se os dados foram, ou não, atualizados

        //realiza as atualizações caso requisitado
        if (email) { 
            await db.execute(`UPDATE usuario SET email = ? WHERE cpf = ?;`, [email, cpf]);
            result.emailAtualizado = true;
        }

        if (senha) {
            await db.execute(`UPDATE conta SET senha = ? WHERE matricula = ?;`, [senha, matricula]);
            result.senhaAtualizada = true;
        }

        return result;
    },
    
    deleteAccount: async(matricula: string) => { //remove uma conta da base de dados
        const [rows]: any = await db.execute(`SELECT cpf FROM conta WHERE matricula = ?;`, [matricula]); //identifica qual usuario é o dono da conta

        if(rows.length == 0){ //se não tiver ninguém, não há conta a ser removida
            return { erro: "Conta não encontrada!"};
        }

        const cpf = rows[0].cpf;

        await db.execute(`DELETE FROM conta WHERE matricula = ?;`, [matricula]);

        const [contas]: any = await db.execute(`SELECT COUNT(*) AS total FROM conta WHERE cpf = ?;`, [cpf]); //verifica se ainda há contas associadas ao cpf daquele usuário
        
        let userDeleted = false;

        if(contas[0].total === 0){ //se nao existirem mais contas associadas àquele usuário, ele é removido do banco de dados
            await db.execute(`DELETE FROM usuario WHERE cpf = ?;`, [cpf]);
            userDeleted = true;
        }
        return { contaDeletada: matricula, usuarioDeletado: userDeleted, cpf }; 
    },

    getAllAcounts: async(): Promise<Account[]> => { //seleciona todas as contas, mesmo que o usuario seja o mesmo.
        const [rows] = await db.execute(`SELECT * FROM conta;`)

        const accounts = rows as Account[];

        return accounts;
    }
}

export default userService;