import express from 'express';
import { prisma } from '../utils/prisma/prismaClient.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { executeTransaction } from '../utils/transaction/executeTransaction.js';

const router = express.Router();

// 캐시 구매
router.patch('/Cash', authMiddleware, async (req, res, next) => {
  // userId코드 받아오기
  const userId = req.user.userId;
  const cash = req.user.cash;
  // 유저의 cash잔고를 찾아서 추가(update)하기
  await prisma.users.update({
    where: { userId: userId }, // userId(고유코드)를 통해 해당 User인지 판별
    data: {
      cash: +cash + 5000, // 5000만큼 캐시 더해주기
    },
  });

  return res.status(200).json({
    message: `캐시가 5000원 추가되었습니다. 현재 캐시 잔액: ${cash + 5000}원`,
  });
});

// 캐시 뽑기 (선수 영입)
router.post('/Pick-up', authMiddleware, async (req, res, next) => {
  // userId코드 받아오기
  const userId = req.user.userId;
  const cash = req.user.cash;
  // 캐시 확인
  if (cash < 1200) {
    return res
      .status(400)
      .json({ message: '캐시가 부족합니다. (1200원 이상 필요합니다.)' });
  }

  // CharacterDB에 저장된 선수카드 갯수
  const characterDB = await prisma.characterDB.findMany();

  // 랜덤으로 뽑을 선수번호
  const randomId = Math.ceil(Math.random() * characterDB.length);

  
  // 캐시 차감
  const pickUp = async (tx) => {
    const cash = await tx.users.update({
      where: { userId: userId },
      data: {
        cash: req.user.cash - 1200,
      },
    });
    // 선수 뽑기
    const pick = await tx.inventory.create({
      data: {
        userId: userId,
        characterDBId: randomId,
      },
    });
    // 뽑은 선수 정보
    const characterInfo = await tx.characterDB.findFirst({
      where: {
        characterDBId: randomId,
      },
    });
    return characterInfo;
  };
  const player = await executeTransaction(pickUp);
  return res.status(200).json(player);
});

// 캐시 뽑기 11연뽑
router.post('/Pick-up/All-at-once', authMiddleware, async(req, res, next) => {
  const userId = req.user.userId;
  const cash = req.user.cash;
  const pickUpCount = 11;
  // 캐시 확인
  if (cash < 10000) {
    return res
      .status(400)
      .json({ message: '캐시가 부족합니다. (10000원 이상 필요합니다.)' });
  }

  // CharacterDB에 저장된 선수카드 갯수
  const characterDB = await prisma.characterDB.findMany();

  // 랜덤번호 배열에 담기
  let randomId = [];
  for(let i =0; i< pickUpCount; i++){
    randomId.push(Math.ceil(Math.random() * characterDB.length));
  }  
  
  let characterInfo = [];  
  const pickUp = async (tx) => {
    // 캐시 차감
    const cash = await tx.users.update({
      where: { userId: userId },
      data: {
        cash: req.user.cash - 10000,
      },
    });
    // N회 선수 뽑기
    for(let i = 0; i < pickUpCount; i++){
      const character = await tx.inventory.create({
        data: {
          userId: userId,
          characterDBId: randomId[i],
        },
      });
      characterInfo.push(character);
    }    
    // 뽑은 선수 정보 반환
    return characterInfo;
  };
  await executeTransaction(pickUp);
  return res.status(200).json({...characterInfo});
});

export default router;
