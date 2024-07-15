import httpStatus from 'http-status';
import passport from 'passport';
import ApiError from '../utils/ApiError';
import { roleRights } from '../config/roles';

const { UNAUTHORIZED, FORBIDDEN } = httpStatus;

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(UNAUTHORIZED, 'Please authenticate'));
  }
  req.user = user;

  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights?.includes(requiredRight));

    // if (process.env.IS_PRODUCTION) {
    if (!hasRequiredRights && req.params.username !== user.username) {
      return reject(new ApiError(FORBIDDEN, 'Недостаточно прав доступа'));
    }
    // }
  }

  resolve();
};

const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

export default auth;
