import catchAsync from '../utils/catchAsync';
import { coopService, dataService } from '../services';
import { Cooperative } from 'cooptypes';
import { generator } from '../services/data.service';

export const loadInfo = catchAsync(async (req, res) => {
  const cooperative: Cooperative.Model.ICooperativeData | null = await generator.constructCooperative(
    String(process.env.COOPNAME)
  );

  if (!cooperative) throw new Error('Кооператив не найден');

  const announce = cooperative?.announce
    ? JSON.parse(cooperative.announce)
    : { phone: cooperative?.phone, email: cooperative?.email };

  const result = {
    full_name: cooperative?.full_name,
    full_address: cooperative?.full_address,
    details: cooperative?.details,
    phone: announce.phone,
    email: announce.email,
    description: cooperative?.description,
    chairman: {
      first_name: cooperative?.chairman.first_name,
      last_name: cooperative?.chairman.last_name,
      middle_name: cooperative?.chairman.middle_name,
    },
  };

  res.send(result);
});

export const loadAgenda = catchAsync(async (req, res) => {
  const { coopname } = req.query;
  const agenda = await coopService.loadAgenda(coopname);

  const complexAgenda: Cooperative.Documents.IComplexAgenda[] = [];

  for (const { action, table } of agenda) {
    const documents = await dataService.buildComplexDocument(action);
    if (documents.statement.document) complexAgenda.push({ documents, action, table });
  }

  res.send(complexAgenda);
});

export const loadStaff = catchAsync(async (req, res) => {
  const { coopname } = req.query;
  const staff = await coopService.loadStaff(coopname);
  res.send(staff);
});

export const loadMembers = catchAsync(async (req, res) => {
  const { coopname } = req.query;

  const members = await coopService.loadMembers(coopname);

  res.send(members);
});
