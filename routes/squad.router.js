import express from 'express';
import { prisma } from '../utils/prisma/prismaClient.js';
import { executeTransaction } from '../utils/transaction/executeTransaction.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/Squad/:inventoryId', authMiddleware, async (req, res, next) => {
  const userId = req.user.userId;
  const { inventoryId } = req.params;
  const inventory = await prisma.inventory.findFirst({
    where: { inventoryId: +inventoryId },
  });
  if (!inventory) {
    return res.status(404).json({
      errormessage: '존재하지 않는 인벤토리id입니다.',
    });
  }
  if (inventory.userId !== userId) {
    return res.status(400).json({
      errormessage: '인증된 ID와 Inventory 사용자가 일치하지 않습니다.',
    });
  }
  const characterDB = await prisma.characterDB.findFirst({
    where: { characterDBId: inventory.characterDBId },
  });

  const squad = await prisma.squad.findFirst({
    where: { userId },
  });

  if (inventory.equip !== null) {
    const equipLocation = inventory.equip;
    const result = async (tx) => {
      const squadout = await tx.squad.update({
        where: { squadId: squad.squadId },
        data: {
          [equipLocation]: null,
        },
      });
      const equipUpdate = await tx.inventory.update({
        where: { inventoryId: inventory.inventoryId },
        data: {
          equip: null,
        },
      });
    };
    executeTransaction(result);
    return res
      .status(201)
      .json({ message: `${characterDB.name}이 스쿼드에서 제외 되었습니다.` });
  }

  let location;
  if (squad.characterA === null) {
    location = 'characterA';
  } else if (squad.characterB === null) {
    location = 'characterB';
  } else if (squad.characterC === null) {
    location = 'characterC';
  } else {
    location = null;
  }
  if (location === null) {
    return res
      .status(404)
      .json({ errormessage: '스쿼드에 빈 자리가 없습니다' });
  }
  const result = async (tx) => {
    const squadIn = await tx.squad.update({
      where: { squadId: squad.squadId },
      data: {
        [location]: inventory.inventoryId,
      },
    });
    const equipUpdate = await tx.inventory.update({
      where: { inventoryId: inventory.inventoryId },
      data: {
        equip: location,
      },
    });
  };
  executeTransaction(result);
  return res
    .status(201)
    .json({ message: `${characterDB.name}이 스쿼드에 추가 되었습니다.` });
});

router.patch('/Squad/All-Out', authMiddleware, async (req, res, next) => {
  const userId = req.user.userId;
  const squad = await prisma.squad.findFirst({
    where: { userId },
  });
  const inventoryA = await prisma.inventory.findFirst({
    where: { inventoryId: squad.characterA },
  });
  const inventoryB = await prisma.inventory.findFirst({
    where: { inventoryId: squad.characterB },
  });
  const inventoryC = await prisma.inventory.findFirst({
    where: { inventoryId: squad.characterC },
  });
  const result = async (tx) => {
    const squadUpdate = await tx.squad.update({
      where: { userId },
      data: {
        characterA: null,
        characterB: null,
        characterC: null,
      },
    });
    const inventoryUpdateA = await tx.inventory.update({
      where: { inventoryId: inventoryA.inventoryId },
      data: {
        equip: null,
      },
    });
    const inventoryUpdateB = await tx.inventory.update({
      where: { inventoryId: inventoryB.inventoryId },
      data: {
        equip: null,
      },
    });
    const inventoryUpdateC = await tx.inventory.update({
      where: { inventoryId: inventoryC.inventoryId },
      data: {
        equip: null,
      },
    });
  };
  executeTransaction(result);

  return res.status(200).json({ message: '스쿼드를 해제 하였습니다.' });
});

router.get('/Squad/Check', authMiddleware, async (req, res, next) => {
  //authMiddleware에서 인증한 유저 아이디 가져오기
  const userId = req.user.userId;

  //유저 아이디로 스쿼드 찾기
  const squad = await prisma.squad.findFirst({
    where: { userId },
  });

  //캐릭터에 업그레이드 수치 합산(곱) 함수
  async function upgradeCharacter(inventory) {
    const character = await prisma.characterDB.findFirst({
      where: {
        characterDBId: inventory.characterDBId,
      },
    });
    const upgrade = await prisma.upgradeDB.findFirst({
      where: {
        upgrade: inventory.upgrade,
      },
    });
    for (let key in character) {
      if (upgrade[key]) {
        character[key] = character[key] * (upgrade[key] / 100);
      }
    }
    return character;
  }

  //스쿼드에 저장된 캐릭터 불러오기
  let inventoryA;
  let characterA;
  if (squad.characterA !== null) {
    inventoryA = await prisma.inventory.findFirst({
      where: { inventoryId: squad.characterA },
    });
    //불러온 캐릭터에 업그레이드 수치 합산
    characterA = await upgradeCharacter(inventoryA);
  } else {
    characterA = null;
  }

  //반복
  let inventoryB;
  let characterB;
  if (squad.characterA !== null) {
    inventoryB = await prisma.inventory.findFirst({
      where: { inventoryId: squad.characterB },
    });
    characterB = await upgradeCharacter(inventoryB);
  } else {
    characterB = null;
  }

  let inventoryC;
  let characterC;
  if (squad.characterA !== null) {
    inventoryC = await prisma.inventory.findFirst({
      where: { inventoryId: squad.characterC },
    });
    characterC = await upgradeCharacter(inventoryC);
  } else {
    characterC = null;
  }

  //불러온 스쿼드 바디로 전달
  return res.status(200).json({
    squad: {
      A: characterA,
      B: characterB,
      C: characterC,
    },
  });
});

router.get('/Squad/Check/:userId', async (req, res, next) => {
  //url에서 유저 아이디 받아오기
  const { userId } = req.params;

  //유저 아이디로 스쿼드 검색
  const squad = await prisma.squad.findFirst({
    where: { userId: +userId },
  });

  //유효성 체크
  if (!squad) {
    return res
      .status(404)
      .json({ errormessage: '존재하지 않는 유저id입니다.' });
  }

  //이하 동일
  async function upgradeCharacter(inventory) {
    const character = await prisma.characterDB.findFirst({
      where: {
        characterDBId: inventory.characterDBId,
      },
    });
    const upgrade = await prisma.upgradeDB.findFirst({
      where: {
        upgrade: inventory.upgrade,
      },
    });
    for (let key in character) {
      if (upgrade[key]) {
        character[key] = character[key] * (upgrade[key] / 100);
      }
    }
    return character;
  }

  let inventoryA;
  let characterA;
  if (squad.characterA !== null) {
    inventoryA = await prisma.inventory.findFirst({
      where: { inventoryId: squad.characterA },
    });
    characterA = await upgradeCharacter(inventoryA);
  } else {
    characterA = null;
  }

  let inventoryB;
  let characterB;
  if (squad.characterA !== null) {
    inventoryB = await prisma.inventory.findFirst({
      where: { inventoryId: squad.characterB },
    });
    characterB = await upgradeCharacter(inventoryB);
  } else {
    characterB = null;
  }

  let inventoryC;
  let characterC;
  if (squad.characterA !== null) {
    inventoryC = await prisma.inventory.findFirst({
      where: { inventoryId: squad.characterC },
    });
    characterC = await upgradeCharacter(inventoryC);
  } else {
    characterC = null;
  }

  return res.status(200).json({
    squad: {
      A: characterA,
      B: characterB,
      C: characterC,
    },
  });
});

export default router;
