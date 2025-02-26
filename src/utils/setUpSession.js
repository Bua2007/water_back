import { THIRTY_DAYS } from '../constants/constants.js';

export const setupSession = (res, session) => {
    res.cookie('refreshToken', session.refreshToken, {
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + THIRTY_DAYS),
    });
    res.cookie('sessionId', session._id, {
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + THIRTY_DAYS),
    });
};
