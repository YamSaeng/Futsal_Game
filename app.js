import express from 'express';
import UpgradeRouter from './routes/upgrade.router.js';
import GameStartRouter from './routes/gameStart.router.js';
import SquadRouter from './routes/squad.router.js';
import cookieParser from 'cookie-parser';
import UserRouter from './routes/users.router.js';
import characterRouter from './routes/characters.router.js';
import RankingRouter from './routes/ranking.router.js';
import InventoryRouter from './routes/inventory.router.js';
import PickUpRouter from './routes/pickup.router.js';
import { DBRankingChangeScore } from './routes/ranking.router.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

// 'http' 폴더 내 정적 파일 제공 (예: CSS, JS, 이미지)
app.use(express.static('http'));

// '/Signin' 경로로 Signin.html 파일 제공
// process.cwd()은 현재 작업 디렉토리의 경로를 반환하는 함수
app.get('/Signin', (req, res) => {
  res.sendFile('http/Signin.html', { root: process.cwd() });
});

app.get('/Signup', (req, res) => {
  res.sendFile('http/Signup.html', { root: process.cwd() });
});

app.get('/Main', (req, res) => {
  res.sendFile('http/Main.html', { root: process.cwd() });
});

app.use('/FutsalGame', [
  UserRouter,
  characterRouter,
  UpgradeRouter,
  GameStartRouter,
  SquadRouter,
  RankingRouter,
  InventoryRouter,
  PickUpRouter,
]);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});

DBRankingChangeScore();

setInterval(() => {
  DBRankingChangeScore();
}, process.env.RANKING_RANK_CHANGE_TIME);
