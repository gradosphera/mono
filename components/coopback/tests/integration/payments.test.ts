import app from '../../src/app';
import request from 'supertest';
import httpStatus from 'http-status';
import { setupTestDB } from '../utils/setupTestDB';
import faker from 'faker';
import { generateUsername } from '../utils/generateUsername';
import { User } from '../../src/models';
import { IGenerateJoinCoop, IGeneratedDocument, IIndividualData } from 'coopdoc-generator-ts';
import {
  IBankAccount,
  IDeletePaymentMethod,
  IDocument,
  IJoinCooperative,
  ISavePaymentMethod,
  ISbpDetails,
} from '../../src/types';
import ecc from 'eosjs-ecc';
import { admin, chairman, insertUsers, userOne, userTwo, voskhod } from '../fixtures/user.fixture';
import { adminAccessToken, userOneAccessToken, userTwoAccessToken } from '../fixtures/token.fixture';
import { fixtureAction, insertAction, insertActions, installInitialCooperativeData } from '../fixtures/document.fixture';
import { Cooperative, SovietContract } from 'cooptypes';
import { participantOne } from '../fixtures/participant.fixture';
import { PrivateKey } from '@wharfkit/antelope';
import exp from 'constants';

const public_key = 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV';

setupTestDB();

describe('Проверка получения документов', () => {
  let sbpPaymentData: ISavePaymentMethod;
  let bankPaymentData: ISavePaymentMethod;

  beforeEach(() => {
    sbpPaymentData = {
      username: '',
      method_id: 1,
      method_type: 'sbp',
      data: { phone: '+7900-888-988-00' } as ISbpDetails,
    };

    bankPaymentData = {
      username: '',
      method_id: 2,
      method_type: 'bank_transfer',
      data: {
        account_number: '40817810099910004312',
        currency: 'RUB',
        card_number: '1234567890123456',
        bank_name: 'Sberbank',
        details: {
          bik: '123456789',
          corr: '30101810400000000225',
          kpp: '123456789',
        },
      } as IBankAccount,
    };
  });

  describe('GET /v1/payments/initial', () => {
    test('получаем платежный ордер на вступление', async () => {
      const coopData = voskhod;

      await insertUsers([coopData, chairman, admin]);
      await installInitialCooperativeData();

      const email = faker.internet.email().toLowerCase();
      const newUser = {
        email: email,
        role: 'user',
        public_key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
        username: generateUsername(),
        referer: '',
        type: 'individual',
        individual_data: {
          first_name: faker.name.firstName(),
          last_name: faker.name.lastName(),
          middle_name: '',
          birthdate: '2023-04-01',
          phone: '+1234567890',
          email: email,
          full_address: 'Russia, Moscow, Tverskaya street, 10',
        },
      };

      const registeredUser = await request(app).post('/v1/users').send(newUser).expect(httpStatus.CREATED);

      expect(registeredUser.body.tokens.access.token).toBeDefined();

      const dbUser = await User.findOne({ username: newUser.username });
      expect(dbUser).toBeDefined();
      expect(dbUser?.status).toBe('created');

      const privateData = (await dbUser?.getPrivateData()) as IIndividualData;

      expect(privateData).toBeDefined();

      const options: IGenerateJoinCoop = {
        action: 'joincoop',
        code: 'registrator',
        coopname: 'voskhod',
        username: newUser.username,
        signature: 'this is imaged signature',
        skip_save: false,
      };

      let res = await request(app)
        .post('/v1/documents/generate')
        .set('Authorization', `Bearer ${registeredUser.body.tokens.access.token}`)
        .send(options);

      expect(res.status).toBe(httpStatus.CREATED);

      expect(res.body.meta).toBeDefined();
      expect(res.body.binary).toBeDefined();
      expect(res.body.html).toBeDefined();
      expect(res.body.hash).toBeDefined();

      let res_regenerated = await request(app)
        .post('/v1/documents/generate')
        .set('Authorization', `Bearer ${registeredUser.body.tokens.access.token}`)
        .send(res.body.meta);

      expect(res.status).toBe(httpStatus.CREATED);

      expect(res.body.hash).toEqual(res_regenerated.body.hash);

      const generatedDocument: IGeneratedDocument = res.body;

      const key = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';
      const wif = await PrivateKey.fromString(key);
      const sign = await wif.signDigest(generatedDocument.hash).toString();

      const signedDocument: IDocument = {
        hash: generatedDocument.hash,
        meta: generatedDocument.meta,
        signature: sign,
        public_key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
      };

      const joinCoopData: IJoinCooperative = {
        username: newUser.username,
        statement: signedDocument,
      };

      const joincoop_result = await request(app)
        .post('/v1/users/join-cooperative')
        .set('Authorization', `Bearer ${registeredUser.body.tokens.access.token}`)
        .send(joinCoopData);
      // console.log(joincoop_result.body);
      expect(joincoop_result.status).toBe(httpStatus.OK);

      const dbUser2 = await User.findOne({ username: newUser.username });
      expect(dbUser2).toBeDefined();
      expect(dbUser2?.status).toBe('joined');
      expect(dbUser2?.statement).toBeDefined();
      // console.log(dbUser2);

      const initialPayment = await request(app)
        .post('/v1/payments/initial')
        .set('Authorization', `Bearer ${registeredUser.body.tokens.access.token}`)
        .send({ provider: 'yookassa' });

      expect(initialPayment.status).toBe(httpStatus.CREATED);
      expect(initialPayment.body?.details?.token).toBeDefined();
      expect(initialPayment.body?.order_id).toBeDefined();
      expect(initialPayment.body?.provider).toBe('yookassa');
    });
  });
  describe('POST /v1/payments/methods/:username + add', () => {
    test('401 при добавлении реквизитов самому себе без авторизации', async () => {
      await insertUsers([userOne]);

      sbpPaymentData.username = userOne.username;

      const documents = await request(app).post(`/v1/payments/methods/${userOne.username}/add`).send(sbpPaymentData);

      expect(documents.status).toBe(httpStatus.UNAUTHORIZED);
    });

    test('403 при добавлении реквизитов кому-то со своей авторизацией', async () => {
      await insertUsers([userOne, userTwo]);

      sbpPaymentData.username = userOne.username;

      const documents = await request(app)
        .post(`/v1/payments/methods/${userTwo.username}/add`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(sbpPaymentData);

      expect(documents.status).toBe(httpStatus.FORBIDDEN);
    });

    test('200 при добавлении реквизитов СБП самому себе и получение их', async () => {
      await insertUsers([userOne]);

      sbpPaymentData.username = userOne.username;

      const documents = await request(app)
        .post(`/v1/payments/methods/${userOne.username}/add`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(sbpPaymentData);

      expect(documents.status).toBe(httpStatus.OK);

      const list = await request(app)
        .get(`/v1/payments/methods/${userOne.username}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send();

      expect(list.status).toBe(httpStatus.OK);
    });

    test('200 при добавлении реквизитов СБП админом кому-то и получение их', async () => {
      await insertUsers([userOne, admin]);

      sbpPaymentData.username = userOne.username;

      const documents = await request(app)
        .post(`/v1/payments/methods/${userOne.username}/add`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(sbpPaymentData);

      expect(documents.status).toBe(httpStatus.OK);

      const list = await request(app)
        .get(`/v1/payments/methods/${userOne.username}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send();

      expect(list.status).toBe(httpStatus.OK);
    });

    test('200 при извлечении списка всех реквизитов админом', async () => {
      await insertUsers([voskhod, userOne, admin]);

      sbpPaymentData.username = userOne.username;

      const documents = await request(app)
        .post(`/v1/payments/methods/${userOne.username}/add`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(sbpPaymentData);

      expect(documents.status).toBe(httpStatus.OK);

      const list = await request(app).get(`/v1/payments/methods`).set('Authorization', `Bearer ${adminAccessToken}`).send();
      expect(list.status).toBe(httpStatus.OK);

      expect(list.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 100,
        totalPages: 1,
        totalResults: 2,
      });
    });

    test('200 при добавлении СБП и банковских реквизитов самому себе и получение их', async () => {
      await insertUsers([userOne]);

      sbpPaymentData.username = userOne.username;

      await request(app)
        .post(`/v1/payments/methods/${userOne.username}/add`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(sbpPaymentData)
        .expect(httpStatus.OK);

      bankPaymentData.username = userOne.username;

      await request(app)
        .post(`/v1/payments/methods/${userOne.username}/add`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(bankPaymentData)
        .expect(httpStatus.OK);

      const list = await request(app)
        .get(`/v1/payments/methods/${userOne.username}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send();

      expect(list.status).toBe(httpStatus.OK);

      expect(list.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 100,
        totalPages: 1,
        totalResults: 2,
      });
    });

    test('403 при получении чужого списка платежных методов не админом', async () => {
      await insertUsers([userOne, userTwo]);

      sbpPaymentData.username = userOne.username;

      await request(app)
        .post(`/v1/payments/methods/${userOne.username}/add`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(sbpPaymentData)
        .expect(httpStatus.OK);

      bankPaymentData.username = userTwo.username;

      let res = await request(app)
        .post(`/v1/payments/methods/${userTwo.username}/add`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send(bankPaymentData);

      expect(res.status).toBe(httpStatus.OK);

      const list = await request(app)
        .get(`/v1/payments/methods/${userTwo.username}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send();

      expect(list.status).toBe(httpStatus.FORBIDDEN);
    });

    test('200 при получение двух методов двух пользователей админом', async () => {
      await insertUsers([userOne, userTwo, admin]);

      sbpPaymentData.username = userOne.username;

      await request(app)
        .post(`/v1/payments/methods/${userOne.username}/add`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(sbpPaymentData)
        .expect(httpStatus.OK);

      bankPaymentData.username = userTwo.username;

      let res = await request(app)
        .post(`/v1/payments/methods/${userTwo.username}/add`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send(bankPaymentData);

      expect(res.status).toBe(httpStatus.OK);

      const list = await request(app).get(`/v1/payments/methods/`).set('Authorization', `Bearer ${adminAccessToken}`).send();

      expect(list.status).toBe(httpStatus.OK);

      expect(list.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 100,
        totalPages: 1,
        totalResults: 2,
      });
    });

    test('200 при обновлении собственных реквизитов после добавления пользователем', async () => {
      await insertUsers([userOne, userTwo, admin]);

      sbpPaymentData.username = userOne.username;

      await request(app)
        .post(`/v1/payments/methods/${userOne.username}/add`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(sbpPaymentData)
        .expect(httpStatus.OK);

      const sbpPaymentData2 = sbpPaymentData;

      sbpPaymentData2.data = { phone: '111111111' };

      let res = await request(app)
        .post(`/v1/payments/methods/${userOne.username}/add`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(sbpPaymentData2);

      expect(res.status).toBe(httpStatus.OK);

      const list = await request(app)
        .get(`/v1/payments/methods/${userOne.username}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send();

      expect(list.status).toBe(httpStatus.OK);
      // console.log(list.body.results[0]);

      expect(list.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 100,
        totalPages: 1,
        totalResults: 1,
      });

      expect(list.body.results[0].data.phone).toBe(sbpPaymentData2.data.phone);
    });
  });

  describe('POST /v1/payments/methods/:username/delete', () => {
    test('200 при удалении собственных реквизитов после добавления', async () => {
      await insertUsers([userOne, userTwo, admin]);

      sbpPaymentData.username = userOne.username;

      await request(app)
        .post(`/v1/payments/methods/${userOne.username}/add`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(sbpPaymentData)
        .expect(httpStatus.OK);

      const dataForDelete: IDeletePaymentMethod = {
        method_id: sbpPaymentData.method_id,
      };

      await request(app)
        .post(`/v1/payments/methods/${userOne.username}/delete`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(dataForDelete)
        .expect(httpStatus.OK);

      const list = await request(app)
        .get(`/v1/payments/methods/${userOne.username}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send();

      expect(list.status).toBe(httpStatus.OK);
      // console.log('list.body: ', list.body);

      expect(list.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 100,
        totalPages: 0,
        totalResults: 0,
      });
    });

    test('403 при удалении чужих реквизитов', async () => {
      await insertUsers([userOne, userTwo, admin]);

      sbpPaymentData.username = userOne.username;

      await request(app)
        .post(`/v1/payments/methods/${userOne.username}/add`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(sbpPaymentData)
        .expect(httpStatus.OK);

      const dataForDelete: IDeletePaymentMethod = {
        method_id: sbpPaymentData.method_id,
      };

      await request(app)
        .post(`/v1/payments/methods/${userOne.username}/delete`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send(dataForDelete)
        .expect(httpStatus.FORBIDDEN);
    });

    test('200 при удалении нескольких версий собственных реквизитов под одним method_id', async () => {
      await insertUsers([userOne, userTwo, admin]);

      sbpPaymentData.username = userOne.username;

      await request(app)
        .post(`/v1/payments/methods/${userOne.username}/add`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(sbpPaymentData)
        .expect(httpStatus.OK);

      await request(app)
        .post(`/v1/payments/methods/${userOne.username}/add`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(sbpPaymentData)
        .expect(httpStatus.OK);

      const dataForDelete: IDeletePaymentMethod = {
        method_id: sbpPaymentData.method_id,
      };

      await request(app)
        .post(`/v1/payments/methods/${userOne.username}/delete`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(dataForDelete)
        .expect(httpStatus.OK);

      const list = await request(app)
        .get(`/v1/payments/methods/${userOne.username}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send();

      expect(list.status).toBe(httpStatus.OK);
      // console.log('list.body: ', list.body);

      expect(list.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 100,
        totalPages: 0,
        totalResults: 0,
      });
    });

    test('200 при удалении чужих реквизитов админом', async () => {
      await insertUsers([userOne, userTwo, admin]);

      sbpPaymentData.username = userOne.username;

      await request(app)
        .post(`/v1/payments/methods/${userOne.username}/add`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(sbpPaymentData)
        .expect(httpStatus.OK);

      const dataForDelete: IDeletePaymentMethod = {
        method_id: sbpPaymentData.method_id,
      };

      await request(app)
        .post(`/v1/payments/methods/${userOne.username}/delete`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(dataForDelete)
        .expect(httpStatus.OK);

      const list = await request(app)
        .get(`/v1/payments/methods/${userOne.username}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send();

      expect(list.status).toBe(httpStatus.OK);
      // console.log('list.body: ', list.body);

      expect(list.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 100,
        totalPages: 0,
        totalResults: 0,
      });
    });
  });
});
