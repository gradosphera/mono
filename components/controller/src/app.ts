import express, { type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import cors from 'cors';
import config from './config/config';
import morgan from './config/morgan';

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

// sanitize request data (GraphQL variables могут содержать сырой XML/HTML — xss-clean ломает BPMN и пр.)
const xssMiddleware = xss();
app.use((req: Request, res: Response, next: NextFunction) => {
  const p = req.path ?? '';
  if (p === '/v1/graphql' || p.endsWith('/v1/graphql')) {
    return next();
  }
  return xssMiddleware(req, res, next);
});
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

export default app;
