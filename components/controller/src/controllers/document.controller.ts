import catchAsync from '../utils/catchAsync';
import { documentService } from '../services/index';
import type { RGenerate } from '../types';

import httpStatus from 'http-status';

export const generateDocument = catchAsync(async (req: RGenerate, res) => {
  const document = await documentService.generateDocument(req.body);

  res.status(httpStatus.CREATED).send(document);
});
