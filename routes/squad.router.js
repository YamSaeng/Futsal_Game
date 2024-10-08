import express from 'express';
import { prisma } from '../utils/prisma/prismaClient.js';
import { executeTransaction } from '../utils/transaction/executeTransaction.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

//스쿼드 인앤아웃
router.post(
  '/Squad/in-out/:inventoryId',
  authMiddleware,
  async (req, res, next) => {
    const userId = req.user.userId;
    const { inventoryId } = req.params;
    const inventory = await prisma.inventory.findFirst({
      where: { inventoryId: +inventoryId },
    });

    //유효성체크
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

    //빈자리 찾기
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

    //선발
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
  }
);

//스쿼드 올아웃
router.patch('/Squad/All-Out', authMiddleware, async (req, res, next) => {
  console.log('PATCH 요청이 들어옴');
  const userId = req.user.userId;
  const squad = await prisma.squad.findFirst({
    where: { userId },
  });

  const members = Object.keys(squad).filter((key) =>
    key.startsWith('character')
  );

  //스쿼드가 참조한 인벤토리 불러오기
  const inventoryIds = [];
  for (let i = 0; i < members.length; i++) {
    if (squad[members[i]]) {
      inventoryIds.push(squad[members[i]]);
    }
  }
  const inventorys = await prisma.inventory.findMany({
    where: { inventoryId: { in: inventoryIds } },
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
    for (let i = 0; i < inventorys.length; i++) {
      await tx.inventory.update({
        where: { inventoryId: inventorys[i].inventoryId },
        data: {
          equip: null,
        },
      });
    }
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
        character[key] = Math.floor(character[key] * (upgrade[key] / 100));
      }
    }
    return character;
  }

  //스쿼드에 저장된 캐릭터 불러오기
  let inventoryA;
  let characterA;
  //스쿼드 null 체크
  if (squad.characterA !== null) {
    inventoryA = await prisma.inventory.findFirst({
      where: { inventoryId: squad.characterA },
    });
    //불러온 캐릭터에 업그레이드 수치 합산
    characterA = await upgradeCharacter(inventoryA);
    characterA.upgrade = inventoryA.upgrade;
    characterA.squad = 'characterA';
  } else {
    characterA = null;
  }

  //반복
  let inventoryB;
  let characterB;
  if (squad.characterB !== null) {
    inventoryB = await prisma.inventory.findFirst({
      where: { inventoryId: squad.characterB },
    });
    characterB = await upgradeCharacter(inventoryB);
    characterB.upgrade = inventoryB.upgrade;
    characterB.squad = 'characterB';
  } else {
    characterB = null;
  }

  let inventoryC;
  let characterC;
  if (squad.characterC !== null) {
    inventoryC = await prisma.inventory.findFirst({
      where: { inventoryId: squad.characterC },
    });
    characterC = await upgradeCharacter(inventoryC);
    characterC.upgrade = inventoryC.upgrade;
    characterC.squad = 'characterC';
  } else {
    characterC = null;
  }

  //불러온 스쿼드 바디로 전달
  return res.status(200).json({
    A: characterA,
    B: characterB,
    C: characterC,
  });
});

export default router;
