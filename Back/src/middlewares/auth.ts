import { Request, Response, NextFunction } from "express"; //arquivo que faz a autenticação dos usuários
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;
if (!SECRET) throw new Error("JWT_SECRET não definida");

export function auth(req: Request, res: Response, next: NextFunction){
    const header = req.headers.authorization; //recebe a parte do cabeçalho HTTP que possui o token de acesso

    if(!header) {
        return res.status(401).json({msg: "Token não enviado!"});
    }

    const [type, token] = header.split(" ");

    if(type !== "Bearer" || !token) {
        return res.status(401).json({msg: "Token inválido!"});
    }

    try {
        const decoded = jwt.verify(token, SECRET);
        (req as any).user = decoded;
        next();
    } catch (err){
        return res.status(401).json({msg:"Token expirado ou inválido!"});
    }
}