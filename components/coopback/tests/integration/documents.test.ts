import app from '../../src/app';
import request from 'supertest';
import httpStatus from 'http-status';
import { setupTestDB } from '../utils/setupTestDB';
import faker from 'faker';
import { generateUsername } from '../utils/generateUsername';
import { User } from '../../src/models';
import { IGenerateJoinCoop, IGeneratedDocument, IIndividualData } from 'coopdoc-generator-ts';
import { IDocument, IJoinCooperative } from '../../src/types';
import ecc from 'eosjs-ecc'
import { admin, insertUsers, userOne, userTwo } from '../fixtures/user.fixture';
import { adminAccessToken } from '../fixtures/token.fixture';
import { fixtureAction, insertAction, insertActions, installInitialCooperativeData } from '../fixtures/document.fixture';
import { SovietContract } from 'cooptypes';

setupTestDB();

describe('Проверка получения документов', () => {
  describe('GET /v1/data/get-documents', () => {

    test('Нельзя без авторизации админа получить все документы', async () => {
      await insertUsers([admin]);

      const documents = await request(app).get('/v1/data/get-documents').send()

      expect(documents.status).toBe(httpStatus.UNAUTHORIZED);
    });

    test('Успешное получение списка документов', async () => {
      await insertUsers([admin]);
      installInitialCooperativeData()

      const registeredUser = await request(app).post('/v1/users').send(userOne)

      expect(registeredUser.status).toBe(httpStatus.CREATED);

      const options: IGenerateJoinCoop = {
        action: 'joincoop',
        code: 'registrator',
        coopname: 'voskhod',
        username: userOne.username,
        signature: 'this is imaged signature'
      };

      let res = await request(app).post('/v1/data/generate').set('Authorization', `Bearer ${registeredUser.body.tokens.access.token}`).send(options);

      expect(res.status).toBe(httpStatus.CREATED);
      expect(res.body.meta).toBeDefined();
      expect(res.body.binary).toBeDefined();
      expect(res.body.html).toBeDefined();
      expect(res.body.hash).toBeDefined();

      const signature = await ecc.sign(res.body.hash, '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3')

      //имитируем событие парсинга заявления из блокчейна
      const newsubmitted_document = fixtureAction(1, SovietContract.Actions.Registry.NewSubmitted.actionName, userOne.username, 'voskhod', 'soviet', {
        coopname: 'voskhod',
        username: userOne.username,
        action: SovietContract.Actions.Registry.NewSubmitted.actionName,
        decision_id: 1,
        document: {
          meta: res.body.meta,
          hash: res.body.hash,
          signature,
          public_key: userOne.public_key
        }
      } as SovietContract.Actions.Registry.NewSubmitted.INewSubmitted)

      await insertActions(newsubmitted_document)


      //добавляем голоса за решение
      //имитируем событие парсинга решения из блокчейна
      const vorfor_action1 = fixtureAction(1, SovietContract.Actions.Decisions.VoteFor.actionName, userOne.username, 'voskhod', 'soviet', {
        coopname: 'voskhod',
        member: 'ant',
        decision_id: "1",
      } as SovietContract.Actions.Decisions.VoteFor.IVoteForDecision)

      await insertActions(vorfor_action1)

      const vorfor_action2 = fixtureAction(1, SovietContract.Actions.Decisions.VoteFor.actionName, userOne.username, 'voskhod', 'soviet', {
        coopname: 'voskhod',
        member: 'ant',
        decision_id: "2",
      } as SovietContract.Actions.Decisions.VoteFor.IVoteForDecision)

      await insertActions(vorfor_action2)

      const vorfor_action3 = fixtureAction(1, SovietContract.Actions.Decisions.VoteFor.actionName,userOne.username, 'voskhod', 'soviet', {
        coopname: 'voskhod',
        member: 'ant',
        decision_id: "3",
      } as SovietContract.Actions.Decisions.VoteFor.IVoteForDecision)

      await insertActions(vorfor_action3)

      //TODO генерируем решение совета и добавляем его в блокчейн
      //generate


      //имитируем событие парсинга решения из блокчейна
      const newdecision_document = fixtureAction(1, SovietContract.Actions.Registry.NewDecision.actionName, userOne.username, 'voskhod', 'soviet', {
        coopname: 'voskhod',
        username: userOne.username,
        action: SovietContract.Actions.Registry.NewDecision.actionName,
        decision_id: "1",
        document: {
          meta: res.body.meta,
          hash: res.body.hash,
          signature,
          public_key: userOne.public_key
        }
      } as SovietContract.Actions.Registry.NewDecision.INewDecision)

      await insertActions(newdecision_document)

      const newdecision_document2 = fixtureAction(1, SovietContract.Actions.Registry.NewDecision.actionName, userOne.username, 'voskhod', 'soviet', {
        coopname: 'voskhod',
        username: userOne.username,
        action: SovietContract.Actions.Registry.NewDecision.actionName,
        decision_id: "2",
        document: {
          meta: res.body.meta,
          hash: res.body.hash,
          signature,
          public_key: userOne.public_key
        }
      } as SovietContract.Actions.Registry.NewDecision.INewDecision)

      await insertActions(newdecision_document2)

      const newdecision_document3 = fixtureAction(1, SovietContract.Actions.Registry.NewDecision.actionName, userOne.username, 'voskhod', 'soviet', {
        coopname: 'voskhod',
        username: userOne.username,
        action: SovietContract.Actions.Registry.NewDecision.actionName,
        decision_id: "3",
        document: {
          meta: res.body.meta,
          hash: res.body.hash,
          signature,
          public_key: userOne.public_key
        }
      } as SovietContract.Actions.Registry.NewDecision.INewDecision)

      await insertActions(newdecision_document3)


      //получаем документ
      const documents = await request(app).get('/v1/data/get-documents').set('Authorization', `Bearer ${adminAccessToken}`).query({ limit: 1 }).send()

      console.log("documentss: ", documents.body)
      expect(documents.body.results.length).toBeDefined()
      expect(documents.status).toBe(httpStatus.OK);

    });
  })
})
