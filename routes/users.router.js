import express from 'express';
import { prisma } from '../utils/prisma/prismaClient.js'
import { CreateAccessToken } from '../utils/token/tokenCreate.js'
import { CreateRefreshToken } from '../utils/token/tokenCreate.js'
import bcrypt from 'bcrypt';

const usersRouter = express.Router();

// 회원가입
usersRouter.post('/Sign-Up', async (req, res, next) => {
    const { name, nickname, id, password, confirmPassword } = req.body;
    const isExistUser = await prisma.users.findFirst({
        where: {
            id: id
        }
    });

    if (isExistUser) {
        return res.status(404).json({ message: `이미 존재하는 아이디입니다.` });
    }

    if (confirmPassword === undefined) {
        return res.status(404).json({ message: `비밀번호 확인을 입력하세요` });
    }

    if (password !== confirmPassword) {
        return res.status(404).json({ message: `비밀번호와 비밀번호 확인이 일치하지 않습니다.` });
    }    

    const hashedPassword = await bcrypt.hash(password, 10);

    // 유저 생성해서 Users table에 저장
    const user = await prisma.users.create({
        data: {
            name: name,
            nickname: nickname,
            id: id,
            password: hashedPassword
        }
    });   

    // 랭킹 생성해서 Ranking table에 저장
    const rank = await prisma.ranking.create({
        data:{
            userId : user.userId            
        }
    });

    // 스쿼드 생성해서 Squad table에 저장
    const squad = await prisma.squad.create({
        data:{
            userId : user.userId
        }
    });

    return res
        .status(201)
        .json({ message: `${id}로 회원가입이 완료되었습니다.` });
});

// 로그인
// 1. 클라가 서버에 로그인 요청
// 1-1 아이디가 UserDB에 있는지 확인
// 1-2 비밀번호가 맞는지 확인
// 2. 인증 절차 수행, 인증이 유효하면 Access Token과 Refresh Token을 클라에게 발급, Refresh Token은 DB에 저장

// 1. 클라는 요청 시 요청 헤더의 Authoriztion에 발급 받은 Access Token을 "Bearer JWT 토큰" 형식으로 담아 보내준다.
// 2. 서버는 전달 받은 JWT를 검증하고 응답한다.

// 1. 만약 Access Token이 만료됐으면 서버는 DB에 저장되어 있는 Refresh Token을 이용해 새로운 Access token을 발급 받는다.
// 1-1 이때 재발급 요청은 별도의 router에서 진행한다. ( 예: /token/refresh)
// 2. 서버는 요청을 보낸 클라의 Refresh Token과 DB에 저장되어 있는 Refresh Token을 비교해 유효한 것으로 판단되면 
//    새로운 Access Token을 발급하고 클라에게 전달한다.
// 3. 클라가 로그아웃을 한다면 DB에서 Refresh Token을 삭제해 사용할 수 없도록 하고, 
//    다시 로그인하면 새로 생성된 Refresh Token을 DB에 저장한다.

// 로그인
usersRouter.post('/Sign-In', async (req, res, next) => {
    // 아이디, 비밀번호 가져오기
    const { id, password } = req.body;

    // userDB에 아이디가 있는지 확인
    const user = await prisma.users.findFirst({
        where: {
            id: id
        }
    });

    // 아이디 검사
    if (!user) {
        return res.status(404).json({ message: `${id}은 존재하지 않는 아이디 입니다.` });
    }    
    
    // 비밀번호 검사
    if (!(await bcrypt.compare(password, user.password))) {
        return res.status(404).json({ message: `비밀번호가 일치하지 않습니다.` });
    }

    const auth = req.headers.authorization;

    // JWT로 AccessToken 생성
    const s2cAccessToken = CreateAccessToken(id);
    // JWT로 RefreshToken 생성
    const s2cRefreshToken = CreateRefreshToken(id);
    
    res.cookie('accessToken', s2cAccessToken);

    // 응답 헤더에 accessToken 기록
    //res.header("authorization", s2cAccessTokens);

    return res.status(200).json({ message: `${id}로 로그인에 성공했습니다.`});
})

export default usersRouter;