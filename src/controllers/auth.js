import { registerUser } from '../services/auth.js';
import { loginUser } from '../services/auth.js';
import { THIRTY_DAYS } from '../constants/index.js';
import { logoutUser } from '../services/auth.js';
import { refreshUsersSession, loginOrRegisterUser } from '../services/auth.js';
import { requestResetToken } from '../services/auth.js';
import { resetPassword } from '../services/auth.js';
import { generateOuthURL, validateCode } from '../utils/googleOAuth2.js';
import { sendVerificationEmail, verifyEmail } from '../services/auth.js';
import { env } from '../utils/env.js';

export const registerUserController = async (req, res) => {
  const newUser = await registerUser(req.body);

  const session = await loginUser(req.body);

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user! There is your AuthToken',
    data: { newUser, accessToken: session.accessToken },
  });
};

export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
    secure:  true,
    // secure:false,
    sameSite: 'None',
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
    secure: true,
    // secure:false,
      sameSite: 'None',
  });

  res.json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const logoutUserController = async (req, res) => {
  console.log(req.cookies.sessionId);
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }

  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
};

export const refreshUserSessionController = async (req, res) => {
  console.log(req.cookies);
  const session = await refreshUsersSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  setupSession(res, session);
  // setupSession(res, session._id, session.refreshToken);
  // замінити сетап той що вище

  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const requestResetEmailController = async (req, res) => {
  await requestResetToken(req.body.email);
  res.json({
    message: 'Reset password email was successfully sent!',
    status: 200,
    data: {},
  });
};

export const resetPasswordController = async (req, res) => {
  await resetPassword(req.body);
  res.json({
    message: 'Password was successfully reset!',
    status: 200,
    data: {},
  });
};

export async function getOAuthURLController(req, res) {
  const url = generateOuthURL();

  res.send({
    status: 200,
    message: 'Successfully get Google OAuth URL',
    data: url,
  });
}

export async function confirmOAuthController(req, res) {
  const { code } = req.body;

  const ticket = await validateCode(code);

  const session = await loginOrRegisterUser({
    email: ticket.payload.email,
    name: ticket.payload.name,
  });

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });

  res.json({
    status: 200,
    message: 'Login with Google successfully',
    data: {
      accessToken: session.accessToken,
    },
  });
}

export const sendVerificationEmailController = async (req, res) => {
  const user = req.user;
  const token = await sendVerificationEmail(user);

  res.status(200).json({
    status: 200,
    message: 'Verification email sent successfully',
    data: { token },
  });
};

export const verifyEmailController = async (req, res) => {
  const { token } = req.query;
  const user = await verifyEmail(token);

  res.redirect(`${env('APP_DOMAIN')}/email-verified`);
};
