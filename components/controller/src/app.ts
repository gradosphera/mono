import express from 'express';
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import cors from 'cors';
import httpStatus from 'http-status';
import config from './config/config';
import morgan from './config/morgan';
import routes from './routes/v1/index';
import { HttpApiError } from './utils/httpApiError';

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet({ hsts: false }));

// parse json request body
app.use(express.json({ limit: '2mb' }));

// parse urlencoded request body
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// v1 api routes
app.use('/v1', routes);

// Пропуск к NestJS для маршрутов, которые обрабатывает Nest (GraphQL, расширения и т.д.)
// Express routes (/v1/system, ...) обрабатываются выше; остальные /v1/* идут в Nest
app.use((req, res, next) => {
  if (req.path.startsWith('/v1/')) {
    return next();
  }
  next(new HttpApiError(httpStatus.NOT_FOUND, 'Not found'));
});

export default app;
