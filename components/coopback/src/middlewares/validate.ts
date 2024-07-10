import joi from 'joi';
import http from 'http-status';
import pick from '../utils/pick';
import ApiError from '../utils/ApiError';

const validate = (schema) => (req, res, next) => {
  // Фильтрация ключей, чтобы убедиться, что они существуют и не пусты
  const validKeys = ['params', 'query', 'body'].filter(key => req[key] && Object.keys(req[key]).length > 0);
  const object = pick(req, validKeys);

  const { value, error } = joi
    .compile(schema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new ApiError(http.BAD_REQUEST, errorMessage));
  }
  Object.assign(req, value);
  return next();
};


export default validate;
