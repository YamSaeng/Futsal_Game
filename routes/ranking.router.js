import express from 'express';
import { prisma } from '../utils/prisma/prismaClient.js'
import { executeTransaction } from '../utils/transaction/executeTransaction.js';

const rankingRouter = express.Router();

let previousRankings = {};

export async function DBRankingChangeScore() {    
    const currentRankings = await prisma.ranking.findMany({
        orderBy: {
            rankingScore: 'desc'
        }
    });

    // 순서대로 순회하며 랭킹 설정
    let rank = 1;
    currentRankings.map((currentRanking) => {
        currentRanking.rank = rank;
        rank++;
    });


    // 순위 변동 계산
    for (let pRankKey in previousRankings) {
        const pRankData = previousRankings[pRankKey];
        for (let cRankKey in currentRankings) {
            const cRankData = currentRankings[cRankKey];
            if (pRankData.userId == cRankData.userId) {
                const rankChangeScore = pRankData.rank - cRankData.rank;

                cRankData.rankChangeScore = rankChangeScore;
                break;
            }
        }
    }

    const rankingTableUpdateFinish = async (tx) => {
        // ranking Table에 순위와 순위 변동을 기록
        await Promise.all(
            currentRankings.map(async (currentRanking) => {
                await tx.ranking.update({
                    where: {
                        userId: currentRanking.userId
                    },
                    data: {
                        rank: currentRanking.rank,
                        rankChangeScore: currentRanking.rankChangeScore
                    }
                })
            })
        );
    };
    await executeTransaction(rankingTableUpdateFinish);

    // 현재 시점 순위 변동 저장
    previousRankings = currentRankings;
}

rankingRouter.get('/Ranking/AllCheck', async (req, res, next) => {
    // rankingScore 컬럼을 기준으로 내림차순한 전체 데이터 값들을 가져옴
    const currentRankings = await prisma.ranking.findMany({
        orderBy: {
            rankingScore: 'desc'
        }
    });

    // 순위 변동 결과 반환
    return res.status(200).json({ ... currentRankings });
});

rankingRouter.get('/Ranking/SingleCheck/:userId', async (req, res, next) => {
    const { userId } = req.params;

    const userRanking = await prisma.ranking.findFirst({
        where: {
            userId: +userId
        }
    })

    return res.status(200).json({ userRanking });
});

export default rankingRouter;