import catchAsync from '../utils/catchAsync';
import { documentService } from '../services/index';
import type { RGenerate, RGetDocuments } from '../types';

import httpStatus from 'http-status';

export const generateDocument = catchAsync(async (req: RGenerate, res) => {
  const document = await documentService.generateDocument(req.body);

  res.status(httpStatus.CREATED).send(document);
});

export const getDocuments = catchAsync(async (req: RGetDocuments, res) => {
  const filter = req.query?.filter;
  const limit = req.query?.limit as number;
  const page = req.query?.page as number;

  const documents = await documentService.queryDocuments(filter, page, limit);

  res.status(httpStatus.OK).send(documents);
});
