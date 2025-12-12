import { Request, Response, NextFunction } from "express"; // Importa tipos do Express para middlewares.
import jwt from "jsonwebtoken"; // Biblioteca para manipulação de JSON Web Tokens (JWT).

// Variável de ambiente (chave secreta) para assinar/verificar tokens.
const SECRET = process.env.JWT_SECRET!;
if (!SECRET) throw new Error("JWT_SECRET não definida"); // Garante que a chave secreta existe.

/**
 * Middleware de autenticação (auth).
 * Verifica se um JWT válido foi fornecido no cabeçalho Authorization.
 */
export function auth(req: Request, res: Response, next: NextFunction){
    const header = req.headers.authorization; // Tenta obter o cabeçalho 'Authorization'.

    if(!header) {
        return res.status(401).json({msg: "Token não enviado!"}); // Se não houver cabeçalho, nega o acesso.
    }

    const [type, token] = header.split(" "); // Divide o cabeçalho no formato: [Tipo] [Token]

    if(type !== "Bearer" || !token) {
        return res.status(401).json({msg: "Token inválido!"}); // Verifica se o formato é 'Bearer <token>'.
    }

    try {
        const decoded = jwt.verify(token, SECRET); // 1. Verifica a validade do token usando a chave secreta.
        (req as any).user = decoded; // 2. Armazena o payload decodificado (dados do usuário) no objeto request.
        next(); // 3. Prossegue para o próximo middleware/controller.
    } catch (err){
        return res.status(401).json({msg:"Token expirado ou inválido!"}); // Captura erros de expiração ou assinatura inválida do token.
    }
}