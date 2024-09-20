import jwt from 'jsonwebtoken';
import { prisma } from "../utils/prisma/prismaClient.js";
import { ValidateToken } from "../utils/token/tokenCreate.js";
import dotenv from "dotenv";

dotenv.config();

export default async function (req, res, next) {
    const { authorization } = req.headers;
    const { id } = req.body;

    do {
        // AccessToken이 없음
        if (authorization === undefined || authorization.length == 0) {
            req.authLoginState = process.env.LOGIN_AUTH_FAIL_AUTHORIZATION_NOT_FOUND;
        }
        else {
            // AccessToken이 있음
            const [tokenType, accessToken] = authorization.split(' ');
            if (tokenType !== process.env.TOKEN_TYPE_CHECK) {
                req.authLoginState = process.env.LOGIN_AUTH_FAIL_TOKEN_TYPE_NOT_MATCH;
            }

            // 토큰 검증
            const decodedToken = ValidateToken(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY);
            if (!decodedToken) {
                req.authLoginState = process.env.LOGIN_AUTH_FAIL_TOKEN_EXPIRED;
                break;
            }
            
            // 다른 대상의 accessToken을 들고 오면 경고 날림
            if(decodedToken.id !== id )
            {
                req.authLoginState = process.env.LOGIN_AUTH_FAIL_DIFFERENT_ACCESS_TOKEN;
                break;
            }

            req.authLoginState = process.env.LOGIN_AUTH_SUCCESS;
        }
    } while (0);

    next();
}