import express from 'express';
import { prisma } from '../utils/prisma/prismaClient.js'
import { CreateAccessToken, CreateRefreshToken, ValidateToken } from '../utils/token/tokenCreate.js'
import { MakeTime, TimeDifference } from '../utils/time/time.js';
import bcrypt from 'bcrypt';
import loginAuthMiddleware from '../middlewares/loginAuth.middleware.js';
import dotenv from 'dotenv';
import authMiddleware from '../middlewares/auth.middleware.js';

const usersRouter = express.Router();
dotenv.config();

// 회원가입
usersRouter.post('/Sign-Up', async (req, res, next) => {
    const { name, nickname, id, password, confirmPassword } = req.body;
    const isExistUser = await prisma.users.findFirst({
        where: {
            id: id
        }
    });

    // 아이디, 이름, 별명이 비어있는지 
    if (id.length == 0) {
        return res.status(404).json({ message: `아이디를 입력해주세요.` });
    }

    if (name.length == 0) {
        return res.status(404).json({ message: `이름을 입력해주세요.` });
    }

    if (nickname.length == 0) {
        return res.status(404).json({ message: `별명을 입력해주세요,` });
    }
    
    // 정규식 이용해서 이름과 별명에 한글 자음, 모음, 숫자, 공백이 포함되지 않도록 함
    let nameNicknameRule = /^[가-힣A-Za-z]+$/;    
    if (!nameNicknameRule.test(name)) {
        return res.status(404).json({ message: `이름에는 한글 자음, 모음, 숫자, 공백이 입력되면 안됩니다.` })
    }

    if (!nameNicknameRule.test(nickname)) {
        return res.status(404).json({ message: `별명에는 한글 자음, 모음, 숫자, 공백이 입력되면 안됩니다.` })
    }

    // 정규식으로 아이디를 검사 ( 소문자 영어 + 숫자 조합만 통과)
    const engNumIdRule = /^(?=[a-za-z])(?=.*[0-9]).{2,10}$/;
    if (!engNumIdRule.test(id)) {
        return res.status(409).json({ message: '아이디를 소문자 영어와 숫자를 조합해 입력하세요 ( 최소 2글자, 최대 10글자 )' });
    }

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
        data: {
            userId: user.userId
        }
    });

    // 스쿼드 생성해서 Squad table에 저장
    const squad = await prisma.squad.create({
        data: {
            userId: user.userId
        }
    });

    return res
        .status(201)
        .json({ message: `${id}로 회원가입이 완료되었습니다.` });
});

//------------------------------------------------------
// 처음 로그인
//------------------------------------------------------
async function FirstLogin(id, refreshTokenDBData, res) {
    if (refreshTokenDBData === null) {
        // RefreshToken이 Table에 없음
        // 처음 로그인 대상으로 해석
        // JWT로 AccessToken 생성
        const s2cAccessToken = CreateAccessToken(id);
        // JWT로 RefreshToken 생성
        const s2cRefreshToken = CreateRefreshToken(id);

        // 응답 헤더에 accessToken 기록
        res.header("authorization", s2cAccessToken);

        const nowTime = MakeTime(false);
        const expiredAtTokenTime = MakeTime(false, parseInt(process.env.REFRESH_TOKEN_EXPIRE_TIME_DB));

        // RefreshToken DB에 저장
        const refreshToken = await prisma.refreshTokens.create({
            data: {
                id: id,
                token: s2cRefreshToken,
                createdAt: nowTime,
                expiredAt: expiredAtTokenTime
            }
        });

        return res.status(200).json({ message: `${id}로 로그인에 성공했습니다.` });
    }
    else {
        // RefreshToken이 Table에 있음
        // 1. 이전에 처음 로그인 대상으로 accessToken을 발급받고, RefreshToken을 발급받았지만
        //    accessToken을 헤더에 기록하지 않은 경우
        // 2. 불량 유저 ( 근거가 애매함 ) 남의 아이디를 도용해 접근하면 확실히 불량유저

        // return res.status(200).json({message : `로그인 했던 유저입니다. AccessToken을 헤더에 입력해서 다시 로그인하세요.`});
        const s2cAccessToken = CreateAccessToken(id);
        res.header("authorization", s2cAccessToken);

        return res.status(200).json({ message: `${id}로 로그인에 성공했습니다.` });
    }
}

//---------------------------------------------------------------
// AccessToken 만료
//---------------------------------------------------------------
async function AccessTokenExpired(id, refreshTokenDBData, res) {
    if (refreshTokenDBData !== null) {
        // AccessToken을 가지고 있고, AccessToken이 만료됨
        // refreshToken을 DB에 가지고 있음

        // AccessToken을 재발급
        // RefreshToken이 만료되었는지 확인
        const refreshTokenCheck = ValidateToken(refreshTokenDBData, process.env.REFRESH_TOKEN_SECRET_KEY);
        if (!refreshTokenCheck) {
            // RefreshDB createdAt, ex piredAt 컬럼 사용 용도 : 
            // JWT 없이 Refresh Token의 Expire 시간을 제어할 수 있는 용도로 사용
            // 예) JWT로 3시간 후 만료로 발급했으나 모종의 이유로 1시간 후 만료로 바꿔야하는 경우,
            //     JWT는 수정을 할 수 없기 때문에 DB에 있는 시간값으로 판정한다.

            // 현재 시간과 db에 저장되어 있는 시간 차를 구함
            const dbTimeDifferenceSecond = TimeDifference(refreshTokenDBData.expiredAt, "second");

            // 상수값으로 설정해둔 Refresh Token 만료 시간을 지나면 
            if (dbTimeDifferenceSecond >= parseInt(process.env.REFRESH_TOKEN_EXPIRE_DB_CHECK_TIME)) {
                // RefreshToken을 재발급
                const s2cRefreshToken = CreateRefreshToken(id);

                // 현재 시간을 구함
                const nowTime = MakeTime(false);
                // Refresh Token 만료 시간을 구함
                const expiredTime = MakeTime(false, parseInt(process.env.REFRESH_TOKEN_EXPIRE_TIME_DB));

                // Refresh Token을 업데이트
                await prisma.refreshTokens.update({
                    where: { id: id },
                    data: {
                        token: s2cRefreshToken,
                        createdAt: nowTime,
                        expiredAt: expiredTime
                    }
                });
            }
        }

        const s2cAccessToken = CreateAccessToken(id);
        res.header("authorization", s2cAccessToken);

        return res.status(200).json({ message: `AccessToken이 재발급 되었습니다. ${id}로 로그인에 성공했습니다. ` });
    }
    else {
        // AccessToken을 가지고 있고, AccessToken이 만료됨
        // refreshToken을 DB에 가지고 있지 않음
        // 불량 유저로 판정 ( 서버에 문제가 생겨 refreshToken을 기록 못할경우가 있어서 불량 유저로 판정하기엔 무리)      
        // return res.status(404).json({ message: `비정상 로그인 시도` });

        return res.status(404).json({ message: `refreshToken DB Empty` });
    }
}

function DifferentAccessToken(refreshTokenDBData, res) {
    if (refreshTokenDBData == null) {
        return res.status(404).json({ message: `처음 로그인하는 아이디입니다. 헤더에 있는 authorization 지우고 로그인하세요.` })
    }
    else {
        return res.status(404).json({ message: `다른 ID의 AccessToken으로 로그인을 시도했습니다. 올바른 AccessToken을 입력하세요.` });
    }
}

// 로그인
usersRouter.post('/Sign-In', loginAuthMiddleware, async (req, res, next) => {
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

    // RefreshTokens 테이블에 RefreshToken이 있는지 확인
    const refreshTokenExist = await prisma.refreshTokens.findFirst({
        where: {
            id: id
        }
    });

    switch (req.authLoginState) {
        case process.env.LOGIN_AUTH_FAIL_AUTHORIZATION_NOT_FOUND:
            // AccessToken이 없음
            FirstLogin(id, refreshTokenExist, res);
            break;
        case process.env.LOGIN_AUTH_FAIL_TOKEN_TYPE_NOT_MATCH:
            // AccessToken을 가지고 있지만 토큰 타입이 일치하지 않음
            return res.status(404).json({ message: '토큰 타입이 일치하지 않습니다.' });
        case process.env.LOGIN_AUTH_FAIL_TOKEN_EXPIRED:
            // AccessToken이 만료됨
            AccessTokenExpired(id, refreshTokenExist, res);
            break;
        case process.env.LOGIN_AUTH_FAIL_DIFFERENT_ACCESS_TOKEN:
            DifferentAccessToken(refreshTokenExist, res);
            break;
        case process.env.LOGIN_AUTH_SUCCESS:
            // 로그인 성공
            return res.status(200).json({ message: `${id}로 로그인에 성공했습니다.` });
    }
})

// 로그 아웃
// 로그 아웃을 하면 해당 아이디의 액세스 토큰은 유효하지 않아야함
// 유효하지 않아야 다른 기능에 접근하면 거절할 수 있기 때문
usersRouter.post('/Sign-Out', authMiddleware, async (req, res, next) => {
    const refreshTokenExist = await prisma.refreshTokens.findFirst({
        where: {
            id: req.user.id
        }
    });

    if (!refreshTokenExist) {
        return res.status(404).json({ message: `Error` });
    }        
})

export default usersRouter;