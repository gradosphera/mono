import express from 'express';
import auth from '../../middlewares/auth';
import { createProxyMiddleware } from 'http-proxy-middleware';
import config from '../../config/config';

const router = express.Router();

router.route('/').get(
  auth('readGraph'),
  createProxyMiddleware({
    target: config.graphql_service,
    changeOrigin: true,
  })
);

export default router;
