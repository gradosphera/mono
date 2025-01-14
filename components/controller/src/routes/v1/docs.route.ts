import { Router } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import { serve, setup } from 'swagger-ui-express';
import swaggerDefinition from '../../docs/swaggerDef';

const router = Router();

const specs = swaggerJsdoc({
  swaggerDefinition,
  apis: ['src/docs/*.yml', 'src/**/*.ts'],
});

router.use('/', serve);
router.get(
  '/',
  setup(specs, {
    explorer: true,
  })
);

export default router;
