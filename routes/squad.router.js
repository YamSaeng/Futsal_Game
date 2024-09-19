import express from "express";
import { prisma } from "../utils/prisma/prismaClient.js";
import { executeTransaction } from "../utils/executeTransaction.js";

const router = express.Router();

router.post("/Squad-In/:inventoryId", async (req, res, next) => {
  const userId = req.user.userId;
  const { inventoryId } = req.params;
  const inventory = await prisma.inventory.findFirst({
    where: { inventoryId: +inventoryId },
  });
  if (inventory.userId !== userId) {
    return res.status(400).json({
      errormessage: "인증된 ID와 Inventory 사용자가 일치하지 않습니다.",
    });
  }
  if (inventory.equip !== null) {
  }
});

export default router;
