import app from '../../src/app';
import request from 'supertest';
import httpStatus from 'http-status';
import { setupTestDB } from '../utils/setupTestDB';
import { generateUsername } from '../../src/utils/generate-username';
import { User } from '../../src/models';
import { IGeneratedDocument, IIndividualData } from '@coopenomics/factory';
import { IDocument, IJoinCooperative } from '../../src/types';
import ecc from 'eosjs-ecc';
import { admin, chairman, insertUsers, userOne, userTwo, voskhod } from '../fixtures/user.fixture';
import { adminAccessToken, userOneAccessToken } from '../fixtures/token.fixture';
import { fixtureAction, insertAction, insertActions, installInitialCooperativeData } from '../fixtures/document.fixture';
import { SovietContract } from 'cooptypes';
import { participantOne } from '../fixtures/participant.fixture';

const public_key = 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV';

setupTestDB();

describe('Проверка получения документов', () => {
  describe('GET /v1/documents/get-documents', () => {
    test('Нельзя без авторизации получить все документы', async () => {
      const documents = await request(app).get('/v1/documents/get-documents').send();

      expect(documents.status).toBe(httpStatus.UNAUTHORIZED);
    });

    test('Нельзя без авторизации админа получить все документы', async () => {
      await insertUsers([userOne]);

      const documents = await request(app)
        .get('/v1/documents/get-documents')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send();

      expect(documents.status).toBe(httpStatus.FORBIDDEN);
    });

    test('Успешное генерация и извлечение списка документов', async () => {
      const coopData = voskhod;

      await insertUsers([coopData, chairman, admin]);
      await installInitialCooperativeData();

      const registeredUser = await request(app).post('/v1/users').send(participantOne);

      expect(registeredUser.status).toBe(httpStatus.CREATED);

      const options: any = {
        action: 'joincoop',
        code: 'registrator',
        coopname: coopData.username,
        username: participantOne.username,
        signature: 'this is imaged signature',
        skip_save: false,
      };

      const res = await request(app)
        .post('/v1/documents/generate')
        .set('Authorization', `Bearer ${registeredUser.body.tokens.access.token}`)
        .send(options);

      expect(res.status).toBe(httpStatus.CREATED);
      expect(res.body.meta).toBeDefined();
      expect(res.body.binary).toBeDefined();
      expect(res.body.html).toBeDefined();
      expect(res.body.hash).toBeDefined();

      const signature = await ecc.sign(res.body.hash, '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3');

      //   //имитируем событие парсинга заявления из блокчейна
      const newsubmitted_document = fixtureAction(
        1,
        SovietContract.Actions.Registry.NewSubmitted.actionName,
        participantOne.username,
        coopData.username,
        'soviet',
        {
          coopname: coopData.username,
          username: participantOne.username,
          action: SovietContract.Actions.Registry.NewSubmitted.actionName,
          package: '0000000000000000000000000000000000000000000000000000000000000000',
          decision_id: 1,
          document: {
            meta: res.body.meta,
            hash: res.body.hash,
            signature,
            public_key: public_key,
          },
        } as any
      );

      await insertActions(newsubmitted_document);

      //добавляем голоса за решение
      //имитируем событие парсинга решения из блокчейна
      const vorfor_action1 = fixtureAction(
        1,
        SovietContract.Actions.Decisions.VoteFor.actionName,
        participantOne.username,
        coopData.username,
        'soviet',
        {
          coopname: coopData.username,
          member: 'ant',
          decision_id: '1',
        } as any
      );

      await insertActions(vorfor_action1);

      const vorfor_action2 = fixtureAction(
        1,
        SovietContract.Actions.Decisions.VoteFor.actionName,
        participantOne.username,
        coopData.username,
        'soviet',
        {
          coopname: coopData.username,
          member: 'ant',
          decision_id: '2',
        } as any
      );

      await insertActions(vorfor_action2);

      const vorfor_action3 = fixtureAction(
        1,
        SovietContract.Actions.Decisions.VoteFor.actionName,
        participantOne.username,
        coopData.username,
        'soviet',
        {
          coopname: coopData.username,
          member: 'ant',
          decision_id: '3',
        } as any
      );

      await insertActions(vorfor_action3);

      //TODO генерируем решение совета и добавляем его в блокчейн
      //generate

      //имитируем событие парсинга решения из блокчейна
      const newdecision_document = fixtureAction(
        1,
        SovietContract.Actions.Registry.NewDecision.actionName,
        participantOne.username,
        coopData.username,
        'soviet',
        {
          coopname: coopData.username,
          username: participantOne.username,
          action: SovietContract.Actions.Registry.NewDecision.actionName,
          package: '0000000000000000000000000000000000000000000000000000000000000000',
          decision_id: '1',
          document: {
            meta: res.body.meta,
            hash: res.body.hash,
            signature,
            public_key: public_key,
          },
        } as any
      );

      await insertActions(newdecision_document);

      const newdecision_document2 = fixtureAction(
        1,
        SovietContract.Actions.Registry.NewDecision.actionName,
        participantOne.username,
        coopData.username,
        'soviet',
        {
          coopname: coopData.username,
          username: participantOne.username,
          action: SovietContract.Actions.Registry.NewDecision.actionName,
          package: '0000000000000000000000000000000000000000000000000000000000000000',
          decision_id: '2',
          document: {
            meta: res.body.meta,
            hash: res.body.hash,
            signature,
            public_key: public_key,
          },
        } as any
      );

      await insertActions(newdecision_document2);

      const newdecision_document3 = fixtureAction(
        1,
        SovietContract.Actions.Registry.NewDecision.actionName,
        participantOne.username,
        coopData.username,
        'soviet',
        {
          coopname: coopData.username,
          username: participantOne.username,
          action: SovietContract.Actions.Registry.NewDecision.actionName,
          package: '0000000000000000000000000000000000000000000000000000000000000000',
          decision_id: '3',
          document: {
            meta: res.body.meta,
            hash: res.body.hash,
            signature,
            public_key: public_key,
          },
        } as any
      );

      await insertActions(newdecision_document3);

      //получаем документ
      const documents = await request(app)
        .get('/v1/documents/get-documents')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ limit: 1 })
        .send();

      expect(documents.body.results.length).toBeDefined();
      expect(documents.status).toBe(httpStatus.OK);
    });
  });
});
