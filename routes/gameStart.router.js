import express from "express";
import { prisma } from "../utils/prisma/prismaClient.js";
import { executeTransaction } from "../utils/transaction/executeTransaction.js";

const router = express.Router();

//인증미들웨어 포함안된상태 나중에 넣을 예정
router.post("/:target/Play", async (req, res, next) => {
  const { target } = req.params;
  const targetId = +target;
  const userId = req.user.userId;
  //유저 검색
  const user = await prisma.users.findFirst({
    where: { userId },
  });

  const targetUser = await prisma.users.findFirst({
    where: { userId: targetId },
  });

  //스쿼드 검색
  const squad = await prisma.squad.findFirst({
    where: { userId },
  });

  const target_squad = await prisma.squad.findFirst({
    where: { userId: targetId },
  });

  //스쿼드의 캐릭터(능력치 + 업그레이드) 가져오는 함수
  async function getCharacter(members, squad, userId) {
    const characters = {};

    await Promise.all(
      members.map(async (val) => {
        const characterDBId = squad[val];

        const inventory = await prisma.inventoryCharacter.findFirst({
          where: {
            userId,
            characterDBId,
          },
        });

        const character = await prisma.characterDB.findFirst({
          where: {
            characterDBId,
          },
          select: {
            name: true,
            shoot: true,
            speed: true,
            pass: true,
            dribble: true,
            defence: true,
          },
        });

        const upgrade = await prisma.upgradeDB.findFirst({
          where: {
            upgrade: inventory.upgrade,
          },
        });

        const data = {
          ...character,
        };

        for (let key in data) {
          if (upgrade[key]) {
            data[key] = data[key] * upgrade[key];
          }
        }

        characters[val] = data;
      })
    );

    return characters;
  }

  //캐릭터의 능력치 전체 객체내에 배열로 반환
  function characterStatus(Members, Characters) {
    const status = {};

    Members.forEach((a) => {
      for (let key in Characters[a]) {
        if (status[key]) {
          status[key].push(Characters[a][key]);
        } else {
          status[key] = [Characters[a][key]];
        }
      }
    });

    return status;
  }

  //user 스쿼드
  const userMembers = Object.keys(squad).filter((key) =>
    key.startsWith("character")
  );
  const userCharacters = await getCharacter(userMembers, squad, userId);
  const userStatus = characterStatus(userMembers, userCharacters);

  //target 스쿼드
  const targetMembers = Object.keys(target_squad).filter((key) =>
    key.startsWith("character")
  );
  const targetCharacters = await getCharacter(
    targetMembers,
    target_squad,
    targetId
  );
  const targetStatus = characterStatus(targetMembers, targetCharacters);

  //골 찬스를 받을 선수 데이터[이름, 슛]
  const chanceCharacter = (characters, SpeedSum, length) => {
    let random = Math.random();
    for (let i = 0; i < length; i++) {
      const speed = characters.speed[i];
      if (random <= speed / SpeedSum) {
        return [characters.name[i], characters.shoot[i]];
      }
      random -= speed / SpeedSum;
    }
    return [characters.name[length - 1], characters.shoot[length - i]];
  };

  //경기를 위한 밑준비
  const length = userStatus.name.length;
  const userSpeedSum = userStatus.speed.reduce((a, b) => a + b);
  const targetSpeedSum = targetStatus.speed.reduce((a, b) => a + b);

  const userChance =
    userSpeedSum +
    userStatus.dribble.reduce((a, b) => a + b) +
    userStatus.pass.reduce((a, b) => a + b);
  const targetChance =
    targetSpeedSum +
    targetStatus.dribble.reduce((a, b) => a + b) +
    targetStatus.pass.reduce((a, b) => a + b);

  const userDefence = userStatus.defence.reduce((a, b) => a + b) / length;
  const targetDefence = targetStatus.defence.reduce((a, b) => a + b) / length;

  let time = 0;
  let userScore = 0;
  let targetScore = 0;
  let result = "";
  const logs = [];

  //경기 시작
  while (time < 45) {
    //경기 시간
    time += Math.random() * 10;

    const minute = Math.floor(time);
    const second = Math.floor((time % 1) * 60);

    //확률 골 찬스
    if (Math.random() <= userChance / (userChance + targetChance)) {
      //userChance
      const chance = chanceCharacter(userCharacters, userSpeedSum, length);
      logs.push(
        `${minute}분 ${second}초 ${user.nickname}팀 ${chance[0]}선수 달려갑니다!`
      );
      //logs.push([분, 초, 유저닉네임(팀), 캐릭터, 골성공유무, 유저점수, 타겟점수])
      if (Math.random() < chance[1] / (chance[1] + targetDefence)) {
        //골 성공
        userScore++;
        logs.push(
          `${minute}분 ${second}초 ${user.nickname}팀 ${chance[0]}선수 골에 성공합니다. ${userScore}:${targetScore}`
        );
      } else {
        //골 실패
        logs.push(
          `${minute}분 ${second}초 ${user.nickname}팀 ${chance[0]}선수 골 기회를 놓치고맙니다. ${userScore}:${targetScore}`
        );
      }
    } else {
      //targetChance
      const chance = chanceCharacter(targetCharacters, targetSpeedSum, length);
      logs.push(
        `${minute}분 ${second}초 ${targetUser.nickname}팀 ${chance[0]}선수 달려갑니다!`
      );
      if (Math.random() < chance[1] / (chance[1] + userDefence)) {
        //골 성공
        targetScore++;
        logs.push(
          `${minute}분 ${second}초 ${targetUser.nickname}팀 ${chance[0]}선수 골에 성공합니다. ${userScore}:${targetScore}`
        );
      } else {
        //골 실패
        logs.push(
          `${minute}분 ${second}초 ${targetUser.nickname}팀 ${chance[0]}선수 골 기회를 놓치고맙니다. ${userScore}:${targetScore}`
        );
      }
    }

    //무승부 처리
    if (time >= 45 && userScore === targetScore) {
      logs.push(`총 시간 ${minute}분 ${second}초 무승부로 끝이 납니다.`);
      result = "draw";
      break;
    }

    if (time >= 40 && userScore !== targetScore) {
      if (userScore > targetScore) {
        logs.push(
          `총 시간 ${minute}분 ${second}초 ${user.nickname}팀의 승리입니다.`
        );
        result = "win";
        break;
      } else {
        logs.push(
          `총 시간 ${minute}분 ${second}초 ${user.nickname}팀의 패배입니다.`
        );
        result = "defeat";
        break;
      }
    }
  }

  //게임기록
  const finish = async (tx) => {
    const create = await tx.gameRecord.create({
      data: {
        nameA: user.nickname,
        nameB: targetUser.nickname,
        score: `${userScore}:${targetScore}`,
        result,
        logs,
      },
    });
    return create;
  };
  await executeTransaction(finish);

  //응답
  return res.status(200).json({ ...logs });
});

//레이팅 게임-----------------------------------------------------------------------------------------------------------------
router.post("/Rating/Play", async (req, res, next) => {
  //유저 검색
  const userId = req.user.userId;
  const user = await prisma.users.findFirst({
    where: { userId },
  });

  const userRank = await prisma.ranking.findFirst({
    where: { userId },
  });

  const userRankingScore = userRank.rankingScore;

  //상대 검색
  let num = 100;
  let targetRanks = await prisma.ranking.findMany({
    where: {
      rankingScore: {
        gte: userRankingScore - num,
        lte: userRankingScore + num,
      },
      userId: {
        not: userId,
      },
    },
  });

  //상대를 못찾을경우 범위를 늘려가며 검색
  if (targetRanks.length === 0) {
    while (targetRanks.length === 0) {
      num += 100;
      targetRanks = await prisma.ranking.findMany({
        where: {
          rankingScore: {
            gte: userRankingScore - num,
            lte: userRankingScore + num,
          },
          userId: {
            not: userId,
          },
        },
      });
    }
  }

  //대상 한명 랜덤 지정
  const randomIndex = Math.floor(Math.random() * target.length);
  const targetRank = targetRanks[randomIndex];
  const targetId = targetRank.userId;
  const targetUser = await prisma.users.findFirst({
    where: { userId: targetId },
  });
  const targetRankingScore = targetRank.rankingScore;

  //스쿼드 검색
  const squad = await prisma.squad.findFirst({
    where: { userId },
  });

  const target_squad = await prisma.squad.findFirst({
    where: { userId: targetId },
  });

  //스쿼드의 캐릭터(능력치 + 업그레이드) 가져오는 함수
  async function getCharacter(members, squad, userId) {
    const characters = {};

    await Promise.all(
      members.map(async (val) => {
        const characterDBId = squad[val];

        const inventory = await prisma.inventoryCharacter.findFirst({
          where: {
            userId,
            characterDBId,
          },
        });

        const character = await prisma.characterDB.findFirst({
          where: {
            characterDBId,
          },
          select: {
            name: true,
            shoot: true,
            speed: true,
            pass: true,
            dribble: true,
            defence: true,
          },
        });

        const upgrade = await prisma.upgradeDB.findFirst({
          where: {
            upgrade: inventory.upgrade,
          },
        });

        const data = {
          ...character,
        };

        for (let key in data) {
          if (upgrade[key]) {
            data[key] = data[key] * upgrade[key];
          }
        }

        characters[val] = data;
      })
    );

    return characters;
  }

  //캐릭터의 능력치 전체 객체내에 배열로 반환
  function characterStatus(Members, Characters) {
    const status = {};

    Members.forEach((a) => {
      for (let key in Characters[a]) {
        if (status[key]) {
          status[key].push(Characters[a][key]);
        } else {
          status[key] = [Characters[a][key]];
        }
      }
    });

    return status;
  }

  //user 스쿼드
  const userMembers = Object.keys(squad).filter((key) =>
    key.startsWith("character")
  );
  const userCharacters = await getCharacter(userMembers, squad, userId);
  const userStatus = characterStatus(userMembers, userCharacters);

  //target 스쿼드
  const targetMembers = Object.keys(target_squad).filter((key) =>
    key.startsWith("character")
  );
  const targetCharacters = await getCharacter(
    targetMembers,
    target_squad,
    targetId
  );
  const targetStatus = characterStatus(targetMembers, targetCharacters);

  //골 찬스를 받을 선수 데이터[이름, 슛]
  const chanceCharacter = (characters, SpeedSum, length) => {
    let random = Math.random();
    for (let i = 0; i < length; i++) {
      const speed = characters.speed[i];
      if (random <= speed / SpeedSum) {
        return [characters.name[i], characters.shoot[i]];
      }
      random -= speed / SpeedSum;
    }
    return [characters.name[length - 1], characters.shoot[length - i]];
  };

  //경기를 위한 밑준비
  const length = userStatus.name.length;
  const userSpeedSum = userStatus.speed.reduce((a, b) => a + b);
  const targetSpeedSum = targetStatus.speed.reduce((a, b) => a + b);

  const userChance =
    userSpeedSum +
    userStatus.dribble.reduce((a, b) => a + b) +
    userStatus.pass.reduce((a, b) => a + b);
  const targetChance =
    targetSpeedSum +
    targetStatus.dribble.reduce((a, b) => a + b) +
    targetStatus.pass.reduce((a, b) => a + b);

  const userDefence = userStatus.defence.reduce((a, b) => a + b) / length;
  const targetDefence = targetStatus.defence.reduce((a, b) => a + b) / length;

  let time = 0;
  let userScore = 0;
  let targetScore = 0;
  let result = "";
  const logs = [];

  //경기 끝나고 랭킹스코어 변동을 위한 변수
  const userOdds =
    1 / (1 + 10 ** ((targetRankingScore - userRankingScore) / 400));
  let newRankingScore;

  //경기 시작
  while (time < 45) {
    //경기 시간
    time += Math.random() * 10;

    const minute = Math.floor(time);
    const second = Math.floor((time % 1) * 60);

    //확률 골 찬스
    if (Math.random() <= userChance / (userChance + targetChance)) {
      //userChance
      const chance = chanceCharacter(userCharacters, userSpeedSum, length);
      logs.push(
        `${minute}분 ${second}초 ${user.nickname}팀 ${chance[0]}선수 달려갑니다!`
      );
      //logs.push([분, 초, 유저닉네임(팀), 캐릭터, 골성공유무, 유저점수, 타겟점수])
      if (Math.random() < chance[1] / (chance[1] + targetDefence)) {
        //골 성공
        userScore++;
        logs.push(
          `${minute}분 ${second}초 ${user.nickname}팀 ${chance[0]}선수 골에 성공합니다. ${userScore}:${targetScore}`
        );
      } else {
        //골 실패
        logs.push(
          `${minute}분 ${second}초 ${user.nickname}팀 ${chance[0]}선수 골 기회를 놓치고맙니다. ${userScore}:${targetScore}`
        );
      }
    } else {
      //targetChance
      const chance = chanceCharacter(targetCharacters, targetSpeedSum, length);
      logs.push(
        `${minute}분 ${second}초 ${targetUser.nickname}팀 ${chance[0]}선수 달려갑니다!`
      );
      if (Math.random() < chance[1] / (chance[1] + userDefence)) {
        //골 성공
        targetScore++;
        logs.push(
          `${minute}분 ${second}초 ${targetUser.nickname}팀 ${chance[0]}선수 골에 성공합니다. ${userScore}:${targetScore}`
        );
      } else {
        //골 실패
        logs.push(
          `${minute}분 ${second}초 ${targetUser.nickname}팀 ${chance[0]}선수 골 기회를 놓치고맙니다. ${userScore}:${targetScore}`
        );
      }
    }

    //무승부 처리
    if (time >= 45 && userScore === targetScore) {
      logs.push(`총 시간 ${minute}분 ${second}초 무승부로 끝이 납니다.`);
      result = "draw";
      newRankingScore = Math.floor(userRankingScore + 25 * (0.5 - userOdds));
      break;
    }

    if (time >= 40 && userScore !== targetScore) {
      if (userScore > targetScore) {
        logs.push(
          `총 시간 ${minute}분 ${second}초 ${user.nickname}팀의 승리입니다.`
        );
        result = "win";
        newRankingScore = Math.floor(userRankingScore + 50 * (1 - userOdds));
        break;
      } else {
        logs.push(
          `총 시간 ${minute}분 ${second}초 ${user.nickname}팀의 패배입니다.`
        );
        result = "defeat";
        newRankingScore = Math.floor(userRankingScore + 50 * (0 - userOdds));
        break;
      }
    }
  }

  //게임기록
  const finish = async (tx) => {
    const create = await tx.gameRecord.create({
      data: {
        nameA: user.nickname,
        nameB: targetUser.nickname,
        score: `${userScore}:${targetScore}`,
        result,
        logs,
      },
    });
    const update = await tx.ranking.update({
      data: {
        rankingScore: newRankingScore,
        [result]: { increment: 1 },
      },
    });
  };
  await executeTransaction(finish);

  //응답
  return res.status(200).json({ ...logs });
});

export default router;
