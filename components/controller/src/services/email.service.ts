import { createTransport } from 'nodemailer';
import config from '../config/config';
import logger from '../config/logger';

const { email, env } = config;

export const transport = createTransport(email.smtp);

/* istanbul ignore next */
if (env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.error('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
export const sendEmail = async (to, subject, text) => {
  console.log('send email', { from: email.from, to, subject, text });

  const msg = { from: email.from, to, subject, text };
  await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
export const sendResetKeyEmail = async (to, token) => {
  const subject = 'Восстановление доступа';

  const resetPasswordUrl = `${config.base_url}/#/${config.coopname}/auth/reset-key?token=${token}`;
  const text = `Мы получили запрос на перевыпуск приватного ключа,
Для перевыпуска нажмите на ссылку: ${resetPasswordUrl}. Время действия ссылки - 10 минут.

Если вы не запрашивали перевыпуск ключа - проигнорируйте это сообщение.`;

  await sendEmail(to, subject, text);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
export const sendInviteEmail = async (to, token) => {
  const subject = 'Приглашение в Цифровой Кооператив';

  const inviteUrl = `${config.base_url}/#/${config.coopname}/auth/reset-key?token=${token}`;
  const text = `Вам отправлено приглашение на подключение к Цифровому Кооперативу в качестве действующего пайщика.
Для того, чтобы воспользоваться приглашением и получить ключ доступа, пожалуйста, нажмите на ссылку: ${inviteUrl}

Время действия ссылки - 24 часа.`;

  await sendEmail(to, subject, text);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
export const sendVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `http://link-to-app/verify-email?token=${token}`;
  const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;
  await sendEmail(to, subject, text);
};
