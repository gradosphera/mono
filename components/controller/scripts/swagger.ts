import swaggerJsdoc from 'swagger-jsdoc';
import swaggerDefinition from '../src/docs/swaggerDef';
import fs from 'fs'
import path from 'path';

const specs = swaggerJsdoc({
  swaggerDefinition,
  apis: ['src/docs/*.yml', 'src/**/*.ts'],
});


fs.writeFileSync(path.join(__dirname, '../src/docs/swagger.json'), JSON.stringify(specs, null, 2));
