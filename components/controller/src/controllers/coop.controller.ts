import catchAsync from '../utils/catchAsync';
import { coopService, documentService } from '../services';
import { Cooperative } from 'cooptypes';
import { Request, Response } from 'express';

export const loadInfo = catchAsync(async (req: Request, res: Response) => {
  const cooperative = await coopService.loadInfo(String(process.env.COOPNAME));
  res.send(cooperative);
});

export const loadContacts = catchAsync(async (req: Request, res: Response) => {
  const contacts = await coopService.loadContacts(String(process.env.COOPNAME));

  res.send(contacts);
});

export const loadStaff = catchAsync(async (req, res: Response) => {
  const { coopname } = req.query;
  const staff = await coopService.loadStaff(coopname);
  res.send(staff);
});
