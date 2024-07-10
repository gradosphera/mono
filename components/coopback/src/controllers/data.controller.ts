import catchAsync from '../utils/catchAsync';
import { dataService } from '../services/index';
import type { IGetDocuments, RGenerate, RGetDocuments } from '../types';
import httpStatus from 'http-status';
import pick from '../utils/pick';
import { IGetResponse } from '../types/common';

export const generateDocument = catchAsync(async (req: RGenerate, res) => {
  const document = await dataService.generateDocument(req.body);

  res.status(httpStatus.CREATED).send(document);
});

export const getDocuments = catchAsync(async (req: RGetDocuments, res) => {
  let filter = req.query?.filter
  let limit = req.query?.limit as number
  let page = req.query?.page as number

  const documents: IGetResponse = await dataService.queryDocuments(filter, page, limit);

  res.status(httpStatus.OK).send(documents);
});
