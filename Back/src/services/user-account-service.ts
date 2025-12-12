import db from '../config/database'; // Arquivo de configuração de conexão com o banco de dados.
import { User } from '../models/user-model';
import { Account } from '../models/account-model';

// Objeto de serviço com funções de CRUD e autenticação para Usuário e Conta.
const userService = {
    /**
     * Busca todos os usuários, retornando nome, CPF, matrícula e tipo de conta.
     * Realiza JOIN entre as tabelas 'usuario' e 'conta'.
     */
    getAllUsers: async(): Promise<any[]> => { 
        const [users]: any = await db.execute(`SELECT u.cpf AS cpf, u.nome AS nome, c.matricula AS matricula, c.tipo AS tipo FROM conta c INNER JOIN usuario u ON u.cpf = c.cpf;`);

        console.log("Dados retornados pelo getAllUsers:", users);

        return users;
    },

    /**
     * Cadastra um novo usuário na tabela 'usuario' e/ou uma nova conta na tabela 'conta'.
     * Lógica: Se o CPF já existe, apenas insere uma nova conta (se o tipo de conta for diferente).
     * Se o CPF não existe, insere o registro do usuário e a primeira conta.
     */
    insertUser: async(user: User, account: Account): Promise<any> => { 
        if (!user.cpf) {
            return { msg: "CPF não fornecido." };
        }

        // Verifica a existência do usuário pelo CPF.
        const [userRows] = await db.execute<any[]>(`SELECT cpf, nome from usuario WHERE cpf = ?;`, [user.cpf]);
        const userExists = userRows.length > 0;

        let newAccountId: number;
        let userName: string;
        
        
        if (userExists) {
            // Se usuário existe, verifica se o tipo de conta já foi registrado.
            const [accountRows] = await db.execute<any[]>(`SELECT tipo from conta WHERE cpf = ?;`, [user.cpf]);
            const listaTipos = accountRows.map(r => r.tipo);
            const tipoExiste = listaTipos.includes(account.tipo);
            
            userName = userRows[0].nome;

            if (tipoExiste) {
                return { msg: `Usuário de CPF = ${user.cpf} já possui uma conta do tipo ${account.tipo}` };
            } 

            // Insere apenas a nova conta para o CPF existente.
            const [newAccountResult] = await db.execute(`INSERT INTO conta (matricula, senha, tipo, cpf, dataCriacao) VALUES (?, ?, ?, ?, ?)`, 
                [account.matricula, account.senha, account.tipo, user.cpf, account.dataCriacao]);
            
            newAccountId = (newAccountResult as any).insertId;

        } else { 
            // Insere novo registro na tabela 'usuario'.
            await db.execute(`INSERT INTO usuario VALUES (?, ?, ?, ?)`, 
                [user.cpf, user.nome, user.dt_nascimento, user.email]);
            
            userName = user.nome ?? ''; 

            // Insere o registro na tabela 'conta'.
            const [newAccountResult] = await db.execute(`INSERT INTO conta (matricula, senha, tipo, cpf, dataCriacao) VALUES (?, ?, ?, ?, ?)`, 
                [account.matricula, account.senha, account.tipo, user.cpf, account.dataCriacao]);
            
            newAccountId = (newAccountResult as any).insertId;
        }

        return { 
            newUser: { 
                id: newAccountId, 
                nome: userName, 
                matricula: account.matricula, 
                tipo: account.tipo,
                cpf: account.cpf
            }, 
            msg: "Usuário e conta inseridos com sucesso!"
        };
    },

    /**
     * Busca uma conta pelo número de matrícula (usado no login).
     * Retorna dados do usuário (nome, cpf) e da conta (matrícula, tipo, senha).
     */
    getAccountByMatricula: async(matricula: string): Promise<any | null> => { //seleciona uma conta em função da matrícula
        const [contas]: any = await db.execute(`SELECT u.nome AS nome, u.cpf AS cpf, c.matricula AS matricula, c.tipo AS tipo, c.senha as senha FROM conta c INNER JOIN usuario u ON u.cpf = c.cpf WHERE matricula = ?;`, [matricula]);

        if (contas.length == 0) {
            return null;
        }

        return contas[0];
    },

    /**
     * Atualiza o e-mail (tabela 'usuario' via CPF) e/ou a senha (tabela 'conta' via matrícula) do usuário logado.
     */
    updateAccount: async(cpf: string, matricula: string, updates: { email?: string, senha?: string }) => { //usuario altera seus próprios dados do perfil, sendo eles email e/ou senha (1.5)
        const { email, senha } = updates;

        const result = { emailAtualizado: false, senhaAtualizada: false }; // Objeto de feedback para o controller.

        // Realiza as atualizações se os campos foram fornecidos.
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
    
    /**
     * Remove uma conta do sistema pela matrícula.
     * Se o usuário não tiver mais contas, ele é removido da tabela 'usuario'.
     */
    deleteAccount: async(matricula: string) => { //remove uma conta da base de dados
        // Busca o CPF associado à matrícula.
        const [rows]: any = await db.execute(`SELECT cpf FROM conta WHERE matricula = ?;`, [matricula]); //identifica qual usuario é o dono da conta

        if(rows.length == 0){ // Se a conta não existe.
            return { erro: "Conta não encontrada!"};
        }

        const cpf = rows[0].cpf;

        // Deleta o registro da conta.
        await db.execute(`DELETE FROM conta WHERE matricula = ?;`, [matricula]);

        // Conta quantas contas restaram para este CPF.
        const [contas]: any = await db.execute(`SELECT COUNT(*) AS total FROM conta WHERE cpf = ?;`, [cpf]); //verifica se ainda há contas associadas ao cpf daquele usuário
        
        let userDeleted = false;

        // Se o total de contas for zero, deleta o registro do usuário.
        if(contas[0].total === 0){ //se nao existirem mais contas associadas àquele usuário, ele é removido do banco de dados
            await db.execute(`DELETE FROM usuario WHERE cpf = ?;`, [cpf]);
            userDeleted = true;
        }
        return { contaDeletada: matricula, usuarioDeletado: userDeleted, cpf }; 
    },
}

export default userService;