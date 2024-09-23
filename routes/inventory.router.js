import express from "express";
import { prisma } from "../utils/prisma/prismaClient.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// 나의 계정에 있는 CharacterDB(보유 선수 목록) 조회하기
router.get("/Inventory/Check", authMiddleware, async (req, res, next) => {
  //authMiddleware에서 인증한 유저 아이디 가져오기
  const userId = req.user.userId;

  //유저 아이디로 인벤토리 찾기
  const inventory = await prisma.inventory.findMany({
    where: { userId: userId },
  });

  if (!inventory) {
    return res
      .status(404)
      .json({ error: "해당 유저가 가진 인벤토리를 찾을 수 없습니다." });
  }

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
    const upgradedCharacter = {
      inventoryId: inventory.inventoryId,
      ...character,
      upgrade: upgrade.upgrade,
    };
    for (let key in character) {
      if (upgrade[key]) {
        upgradedCharacter[key] = Math.floor(
          character[key] * (upgrade[key] / 100)
        );
      }
    }
    characters.push(upgradedCharacter);
  }

  const characters = [];
  const promiseAll = [];
  for (let i = 0; i < inventory.length; i++) {
    promiseAll.push(upgradeCharacter(inventory[i]));
  }
  await Promise.all(promiseAll);
  
  characters.sort((a, b) => a.inventoryId - b.inventoryId);

  return res.status(200).json({ ...characters });
});


// 다른 사람의 계정에 있는 CharacterDB(보유 선수 목록) 조회하기
router.get("/Inventory/Check/:userId", async (req, res, next) => {
  //url에서 유저 아이디 받아오기
  const { userId } = req.params;

  //유저 아이디로 인벤토리 찾기
  const inventory = await prisma.inventory.findMany({
    where: { userId: +userId },
  });

  if (!inventory) {
    return res
      .status(404)
      .json({ error: "해당 유저가 가진 인벤토리를 찾을 수 없습니다." });
  }

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
    const upgradedCharacter = {
      inventoryId: inventory.inventoryId,
      ...character,
      upgrade: upgrade.upgrade,
    };
    for (let key in character) {
      if (upgrade[key]) {
        upgradedCharacter[key] = Math.floor(
          character[key] * (upgrade[key] / 100)
        );
      }
    }
    characters.push(upgradedCharacter);
  }
  const characters = [];
  const promiseAll = [];
  for (let i = 0; i < inventory.length; i++) {
    promiseAll.push(upgradeCharacter(inventory[i]));
  }
  await Promise.all(promiseAll);

  characters.sort((a, b) => a.inventoryId - b.inventoryId);

  return res.status(200).json({ ...characters });
});

// 선수 방출하기
router.delete('/Inventory/Delete/:id', authMiddleware, async(req, res, next) => {
  const id = req.params.id;

  const isExistPlayer = await prisma.inventory.findUnique({
    where: {
      inventoryId: +id,
    },
  });
  if(!isExistPlayer){
    return res.status(404).json({ message: '해당 선수를 찾을 수 없습니다.'});
  }

  await prisma.inventory.delete({
    where: {
      inventoryId: +id,
    },
  });

  return res.status(200).json( `${id}번 선수 방출했습니다.` );
});

export default router;