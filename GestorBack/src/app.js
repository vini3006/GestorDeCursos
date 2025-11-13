const express = require("express"); // Bibliotecas para funcionamento da API
const app = express();
const cors = require("cors");

// Configuração da utilização das libs 
app.use(cors()); 
app.use(express.json());
app.set("view engine", "ejs"); 

const userRouter = require("./routes/userRoute");

app.get("/", (req, res) => {res.send("FLUMINENSE FOOTBALL CLUB")});
app.use("/user", userRouter);
app.listen(3001, () => {console.log("Servidor rodando na porta 3001")});