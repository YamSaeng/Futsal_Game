import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

export function CreateAccessToken(id) {
    const accessToken = jwt.sign(
        { id: id },
        process.env.ACCESS_TOKEN_SECRET_KEY,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME }
    );

    return process.env.TOKEN_TYPE + accessToken;
}

export function CreateRefreshToken(id) {
    const refreshToken = jwt.sign(
        { id: id },
        process.env.REFRESH_TOKEN_SECRET_KEY,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_TIME },
    );

    return process.env.TOKEN_TYPE + refreshToken;
}

export function ValidateToken(token, secretkey) {
    try {
        const payload = jwt.verify(token, secretkey);
        return payload;
    }
    catch (error) {
        return null;
    }
}