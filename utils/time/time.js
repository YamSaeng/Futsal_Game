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