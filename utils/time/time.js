import dotenv from 'dotenv';

dotenv.config();

export function MakeTime(isUTC, day = 0, hour = 0, minute = 0, second = 0) {
    const nowTime = new Date();

    if (isUTC == false) {
        nowTime.setHours(nowTime.getHours() + parseInt(process.env.LOCAL_TIME));
    }

    nowTime.setDate(nowTime.getDate() + day);
    nowTime.setHours(nowTime.getHours() + hour);
    nowTime.setMinutes(nowTime.getMinutes() + minute);
    nowTime.setSeconds(nowTime.getSeconds() + second);

    return nowTime;
}

// 시간 차 계산해서 format에 따라 반환
export function TimeDifference(time, format) {
    const nowTime = new Date();    

    switch (format) {
        case "day":
            return Math.floor(Math.floor((time - nowTime) / 1000) / 86400);
        case "hour":
            return Math.floor(Math.floor((time - nowTime) / 1000) / 3600);
        case "minute":
            return Math.floor(Math.floor((time - nowTime) / 1000) / 60);
        case "second":
            return Math.floor((time - nowTime) / 1000);
    }
}