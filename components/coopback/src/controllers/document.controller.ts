import catchAsync from '../utils/catchAsync';
import { documentService } from '../services/index';
import type {
  IGetDocuments,
  RDeletePaymentMethod,
  RGenerate,
  RGetDocuments,
  RGetListPaymentMethods,
  RSavePaymentMethod,
} from '../types';
import httpStatus from 'http-status';
import pick from '../utils/pick';
import { IGetResponse } from '../types/common';
import { Cooperative } from 'cooptypes';
import ApiError from '../utils/ApiError';

export const generateDocument = catchAsync(async (req: RGenerate, res) => {
  const document = await documentService.generateDocument(req.body);
  console.log('test');

  res.status(httpStatus.CREATED).send(document);
});

export const getDocuments = catchAsync(async (req: RGetDocuments, res) => {
  let filter = req.query?.filter;
  let limit = req.query?.limit as number;
  let page = req.query?.page as number;

  const documents = await documentService.queryDocuments(filter, page, limit);
  console.log('test');

  res.status(httpStatus.OK).send(documents);
});
