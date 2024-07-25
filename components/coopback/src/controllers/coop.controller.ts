import catchAsync from '../utils/catchAsync';
import { coopService, documentService } from '../services';
import { Cooperative } from 'cooptypes';
import { generator } from '../services/document.service';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';

export const loadInfo = catchAsync(async (req, res) => {
  const cooperative = await coopService.loadInfo(String(process.env.COOPNAME));
  res.send(cooperative);
});

export const loadContacts = catchAsync(async (req, res) => {
  const contacts = await coopService.loadContacts(String(process.env.COOPNAME));

  res.send(contacts);
});

export const loadAgenda = catchAsync(async (req, res) => {
  const { coopname } = req.query;
  const agenda = await coopService.loadAgenda(coopname);

  const complexAgenda: Cooperative.Documents.IComplexAgenda[] = [];

  for (const { action, table } of agenda) {
    const documents = await documentService.buildComplexDocument(action);
    if (documents.statement.document) complexAgenda.push({ documents, action, table });
  }

  res.send(complexAgenda);
});

export const loadStaff = catchAsync(async (req, res) => {
  const { coopname } = req.query;
  const staff = await coopService.loadStaff(coopname);
  res.send(staff);
});
