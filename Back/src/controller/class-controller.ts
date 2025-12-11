import { Request, Response } from "express"; //gerenciamento das requisições
import classService from "../services/class-service";
import { Class } from "../models/class-model";

const classController = {
    getAll: async(req: Request, res: Response) => {
        try{
            const classes = await classService.getAll();
            return res.status(200).json(classes);
        } catch (err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao buscar turmas!"});
        }
    },

    createClass: async(req: Request, res: Response) => {
        const { idMateria, cpfProfessor, maxAlunos, idPeriodoLetivo, dataFechamentoFila } = req.body;

        if (!idMateria || !cpfProfessor || !maxAlunos || !idPeriodoLetivo || !dataFechamentoFila) {
            return res.status(400).json({
                msg: "Disciplina, cpf do professor associado, número máximo de alunos, período letivo e data de fechamento do período de inscrição são obrigatórios!"
            });
        }

        try {
            const newClass: Class | null = await classService.createClass(idMateria, cpfProfessor, maxAlunos, idPeriodoLetivo, dataFechamentoFila);

            return res.status(201).json({newClass, msg: "Turma criada com sucesso!" });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ msg: "Erro ao criar turma!" });
        }
    },

    tryEnrolling: async(req: Request, res: Response) => {
        const cpfAluno = (req as any).user.cpf;
        const { idTurma } = req.params;

        if (!idTurma || !cpfAluno) {
            return res.status(400).json({ msg: "Dados incompletos!" });
        }

        try {
            const result = await classService.tryEnrolling(cpfAluno, Number(idTurma));

            if (result.status === 'INSERTED') {
                return res.status(201).json({ msg: "Inscrição registrada na fila de espera." });
            }
            
            if (result.status === 'ALREADY_QUEUED') {
                return res.status(409).json({ 
                    msg: "Você já está inscrito na fila de espera para esta turma." 
                });
            }
            
            if (result.status === 'PROFESSOR_BLOCKED') {
                return res.status(403).json({ 
                    msg: "Acesso negado: Professores não podem se inscrever nas turmas em que são responsáveis." 
                });
            }

            if (result.status === 'NOT_FOUND') {
                return res.status(404).json({
                    msg: "Turma não encontrada."
                });
            }
            
            return res.status(400).json({ msg: "Inscrição não pôde ser realizada devido a um erro de regra de negócio." });
            
        } catch (err) {
            return res.status(500).json({ msg: "Erro ao tentar realizar inscrição!" });
        }
    },

    processWaitingList: async(req: Request, res: Response) => { 
        const { idTurma } = req.params;

        if(!idTurma){
            return res.status(400).json({ msg: "Turma não informada!" });
        }

        try {
            const { processed, inserted } = await classService.processWaitingList(Number(idTurma));

            if (!processed) {
                return res.status(200).json({processed: false, inserted, msg: "Lista não pôde ser processada no momento (talvez a data de fechamento não tenha chegado)."});
        }

            return res.status(200).json({processed: true, inserted, msg: "Lista de espera processada com sucesso!"});
        } catch (err) {
            console.error(err);
            return res.status(500).json({ msg: "Erro ao processar lista" });
        }
    },
    
    getAllFromProfessor: async(req: Request, res: Response) => {
        const cpfProfessor = (req as any).user.cpf;

        if(!cpfProfessor){
            return res.status(400).json({msg: "CPF não informado!"});
        }

        try {
            const result = await classService.getAllFromProfessor(cpfProfessor);
            return res.status(200).json({classes: result.classes, hasClasses: result.hasClasses});
        } catch(err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao buscar turmas!"});
        }
    },

    getAllStudentsFromClass: async(req: Request, res: Response) => {
        const { idTurma } = req.params;

        if(!idTurma){
            return res.status(400).json({msg: "Turma não informada!"});
        }
        
        try {
            const result = await classService.getAllStudentsFromClass(Number(idTurma));
            return res.status(200).json(result);
        }catch(err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao buscar alunos!"});
        }
    },

    evaluateStudent: async(req: Request, res: Response) => {
        const { idTurma, cpfAluno } = req.params;
        const { notaP1, notaP2, notaPF } = req.body;

        if(!idTurma || !cpfAluno){
            return res.status(400).json({msg: "Turma ou aluno não informados!"});
        }

        if(notaP1 === undefined && notaP2 === undefined && notaPF === undefined){
            return res.status(400).json({msg: "Nada para atualizar!"});
        }

        try {
            await classService.evaluateStudent(cpfAluno, Number(idTurma), notaP1, notaP2, notaPF);
            res.status(200).json({msg: "Notas lançadas com sucesso!"});
        }catch(err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao lançar notas!"});
        }
    },

    registerMaterial: async(req: Request, res: Response) => {
        const cpfProfessor = (req as any).user.cpf;
        const { idTurma } = req.params;
        const { titulo, link, descricao } = req.body;

        if(!idTurma || !cpfProfessor || !titulo || !link){
            return res.status(400).json({msg: "Dados necessários não informados!"});
        }

        try{
            const result = await classService.registerMaterial(cpfProfessor, Number(idTurma), titulo, link, descricao);

            if(result === null){
                return res.status(404).json({msg: "Turma não encontrada!"});
            }
            return res.status(200).json({result, msg: "Material cadastrado com sucesso!"});
        } catch(err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao cadastrar material!"});
        }
    },

    registerActivity: async(req: Request, res: Response) => {
        const cpfProfessor = (req as any).user.cpf;
        const { idTurma } = req.params;
        const { titulo, descricao, dataFechamento, notaMaxima } = req.body;

        if(!idTurma || !cpfProfessor || !titulo || !descricao || !dataFechamento || notaMaxima === undefined){
            return res.status(400).json({msg: "Dados necessários não informados!"});
        }

        const closingDate = new Date(dataFechamento);
        if(isNaN(closingDate.getTime())){
            return res.status(400).json({ msg: "Data de fechamento inválida!" });
        }

        try{
            const result = await classService.registerActivity(cpfProfessor, Number(idTurma), titulo, descricao, closingDate, notaMaxima);

            if(result === null){
                return res.status(404).json({msg: "Turma não encontrada!"});
            }
            return res.status(200).json({result, msg: "Atividade cadastrada com sucesso!"});
        } catch(err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao cadastrar atividade!"});
        }
    },

    getMaterialsFromClass: async(req: Request, res: Response) => {
        const cpfAluno = (req as any).user.cpf;
        const { idTurma } = req.params;

        if(!idTurma || !cpfAluno){
            return res.status(400).json({msg: "Turma ou aluno não informados!"});
        }

        try{
            const materials = await classService.getMaterialsFromClass(cpfAluno, Number(idTurma));

            if(materials === null){
                return res.status(404).json({msg: "Aluno não pertence à turma!"});
            }
            return res.status(200).json(materials);
        } catch(err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao buscar materiais!"});
        }
    },

    getActivitiesFromClass: async(req: Request, res: Response) => {
        const cpfAluno = (req as any).user.cpf;
        const { idTurma } = req.params;

        if(!idTurma || !cpfAluno){
            return res.status(400).json({msg: "Turma ou aluno não informados!"});
        }

        try {
            const activities = await classService.getActivitiesFromClass(cpfAluno, Number(idTurma));

            if(activities === null){
                return res.status(404).json({msg: "Aluno não pertence à turma!"});
            }
            return res.status(200).json(activities);
        } catch(err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao buscar atividades!"});
        }
    },

    sendActivity: async(req: Request, res: Response) => {
        const cpfAluno = (req as any).user.cpf;
        const { idAtividade } = req.params;
        const { arquivo } = req.body;

        if(!idAtividade || !cpfAluno  || !arquivo){
            return res.status(400).json({msg: "Dados necessários não informados!"});
        }

        try {
            const result = await classService.sendActivity(Number(idAtividade), cpfAluno, arquivo);

            if(result === null){
                return res.status(404).json({msg: "Aluno não pertence à turma ou atividade inexistente!"});
            }
            return res.status(200).json({msg: "Atividade entregue com sucesso!"});
        } catch(err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao entregar atividade!"});
        }
    },

    getActivitiesFromClassProfessor: async(req: Request, res: Response) => {
        const cpfProfessor = (req as any).user.cpf;
        const { idTurma } = req.params;

        if(!idTurma || !cpfProfessor){
            return res.status(400).json({msg: "Turma ou aluno não informados!"});
        }

        try {
            const activities = await classService.getActivitiesFromClassProfessor(cpfProfessor, Number(idTurma));

            if(activities === null){
                return res.status(404).json({msg: "Professor não pertence à turma!"});
            }
            return res.status(200).json(activities);
        } catch(err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao buscar atividades!"});
        }
    },

    evaluateActivity: async(req: Request, res: Response) => {
        const cpfProfessor = (req as any).user.cpf;
        const { idAtividade, cpfAluno } = req.params;
        const { nota } = req.body;

        if(!idAtividade || !cpfProfessor || !cpfAluno || nota === undefined ){
            return res.status(400).json({msg: "Dados necessários não informados!"});
        }

        try{
            const grade = await classService.evaluateActivity(cpfProfessor, cpfAluno, Number(idAtividade), Number(nota));

            if(grade === null){
                return res.status(404).json({msg: "Professor não pertence à turma!"});
            }

            return res.status(200).json({nota: grade, msg: "Nota lançada com sucesso!"});
        } catch(err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao lançar nota!"});
        }
    }, 
    
    getGrades: async(req: Request, res: Response) => {
        const cpfAluno = (req as any).user.cpf;
        const { idTurma } = req.params;

        if(!idTurma || !cpfAluno){
            return res.status(400).json({msg: "Turma ou aluno não informados!"});
        }

        try{
            const grades = await classService.getGrades(cpfAluno, Number(idTurma));

            if(grades === null){
                return res.status(404).json({msg: "Aluno não pertence à turma!"});
            }
            return res.status(200).json(grades);
        } catch(err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao buscar notas!"});
        }
    },

    getAcademicRecord: async(req: Request, res: Response) => {
        const cpfAluno = (req as any).user.cpf;

        if(!cpfAluno){
            return res.status(400).json({msg: "Aluno não informado!"});
        }

        try{
            const record = await classService.getAcademicRecord(cpfAluno);

            if(record === null){
                return res.status(404).json({msg: "Aluno não encontrado!"});
            }
            return res.status(200).json(record);
        } catch(err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao buscar histórico!"});
        }
    }
}

export default classController;