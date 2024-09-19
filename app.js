import express from "express";
import UpgradeRouter from "./routes/upgrade.router.js";
import GameStartRouter from "./routes/gameStart.router.js";
import SquadRouter from "./routes/squad.router.js";

const app = express();
const PORT = 3000;

app.use(express.json());

app.use("/FutsalGame", [UpgradeRouter, GameStartRouter, SquadRouter]);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
