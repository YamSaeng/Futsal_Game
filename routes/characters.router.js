import express from 'express';
import { prisma } from '../utils/prisma/prismaClient.js';

const CharactersRouter = express.Router();

// DB 선수 전체 정보 조회
CharactersRouter.get('/Character/CheckAll', async (req, res, next) => {
  try {
    const Check = await prisma.characterDB.findMany();
    return res.status(200).json({ ...Check });
  } catch (error) {
    res.status(500).json({ error: '선수 목록 조회에 실패했어요' });
    console.log(error);
  }
});

// DB 특정 선수 정보 조회
CharactersRouter.get(
  '/Character/OneCheck/:characterDBId',
  async (req, res, next) => {
    try {
      const characterDBId = req.params.characterDBId; // 코드는 URI의 parameter로 전달 받기

      const findCharacter = await prisma.characterDB.findUnique({
        where: {
          characterDBId: +characterDBId, // 앞에 parseInt 또는 + 붙이면 숫자로 바뀐다.
        },
      });
      if (!findCharacter) {
        res.status(404).json({ error: '존재하지 않는 선수 정보 입니다.' });
        return;
      }

      res.status(200).json({ ...findCharacter });
    } catch (error) {
      res.status(500).json({ error: '선수 조회에 실패했어요' });
      console.log(error);
    }
  }
);

export default CharactersRouter;
