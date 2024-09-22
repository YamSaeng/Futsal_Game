import jwt from 'jsonwebtoken';
import { prisma } from "../utils/prisma/prismaClient.js";
import { CreateAccessToken, ValidateToken } from "../utils/token/tokenCreate.js";
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
            const [c2sTokenType, c2sAccessToken] = authorization.split(' ');
            if (c2sTokenType !== process.env.TOKEN_TYPE_CHECK) {
                req.authLoginState = process.env.LOGIN_AUTH_FAIL_TOKEN_TYPE_NOT_MATCH;
            }        

            const decodedToken = jwt.decode(c2sAccessToken);            
            if(decodedToken.id !== id)
            {
                req.authLoginState = process.env.LOGIN_AUTH_FAIL_DIFFERENT_ACCESS_TOKEN;
                break;
            }

            // 토큰 검증
            const verifyToken = ValidateToken(c2sAccessToken, process.env.ACCESS_TOKEN_SECRET_KEY);                        
            if (!verifyToken) {
                req.authLoginState = process.env.LOGIN_AUTH_FAIL_TOKEN_EXPIRED;
                break;
            }            

            req.authLoginState = process.env.LOGIN_AUTH_SUCCESS;
        }
    } while (0);

    next();
}