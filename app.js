import express from "express";
import UpgradeRouter from "./routes/upgrade.router.js";
import GameStartRouter from "./routes/gameStart.router.js";
import SquadRouter from "./routes/squad.router.js";
import cookieParser from "cookie-parser";
import UserRouter from "./routes/users.router.js";
import characterRouter from "./routes/characters.router.js";
import rankingRouter from "./routes/ranking.router.js";
import InventoryRouter from "./routes/inventory.router.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

app.use("/FutsalGame", [
  InventoryRouter,
  UserRouter,
  characterRouter,
  UpgradeRouter,
  GameStartRouter,
  SquadRouter,
  rankingRouter
]);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
