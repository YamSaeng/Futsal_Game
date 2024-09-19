import { prisma } from "../prisma/prismaClient.js";
import { Prisma } from "@prisma/client";

export const executeTransaction = async (transactionLogic) => {
  return await prisma.$transaction(
    async (tx) => {
      return await transactionLogic(tx);
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
    }
  );
};
