import app from '../../src/app';
import request from 'supertest';
import httpStatus from 'http-status';
import { setupTestDB } from '../utils/setupTestDB';
import faker from 'faker';
import { generateUsername } from '../../src/utils/generate-username';
import { User } from '../../src/models';
import { IGenerateJoinCoop, IGeneratedDocument, IIndividualData } from 'coopdoc-generator-ts';
import { IDocument, IJoinCooperative } from '../../src/types';
import ecc from 'eosjs-ecc';
import { admin, chairman, insertUsers, voskhod } from '../fixtures/user.fixture';
import { installInitialCooperativeData } from '../fixtures/document.fixture';
import { PrivateKey } from '@wharfkit/antelope';

setupTestDB();

describe('Проверка данных', () => {
  let newUser;

  beforeEach(async () => {
    const coopData = voskhod;

    await insertUsers([coopData, chairman, admin]);
    await installInitialCooperativeData();

    const email = faker.internet.email().toLowerCase();
    newUser = {
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
        phone: '+71234567890',
        email: email,
        full_address: 'Russia, Moscow, Tverskaya street, 10',
      },
    };
  });

  describe('POST /v1/users/join-cooperative', () => {
    let newUser;

    beforeEach(async () => {
      const email = faker.internet.email().toLowerCase();
      newUser = {
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
          phone: '+71234567890',
          email: email,
          full_address: 'Russia, Moscow, Tverskaya street, 10',
        },
      };
    });

    test('should successfully create a new user', async () => {
      const registeredUser = await request(app).post('/v1/users').send(newUser).expect(httpStatus.CREATED);

      expect(registeredUser.body.tokens.access.token).toBeDefined();

      const dbUser = await User.findOne({ username: newUser.username });
      expect(dbUser).toBeDefined();
      expect(dbUser?.status).toBe('created');
    });

    test('should generate a document for joining the cooperative', async () => {
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
      // console.log('res.body: ', res.body);

      expect(res.status).toBe(httpStatus.CREATED);

      expect(res.body.meta).toBeDefined();
      expect(res.body.binary).toBeDefined();
      expect(res.body.html).toBeDefined();
      expect(res.body.hash).toBeDefined();
    });

    test('should regenerate the generated document', async () => {
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

      // console.log('res.body', res_regenerated.body);

      expect(res.status).toBe(httpStatus.CREATED);

      expect(res.body.hash).toEqual(res_regenerated.body.hash);
    });

    test('should return 500 error if signature is invalid', async () => {
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
        signature: 'any imaged signature',
        skip_save: false,
      };
      let res = await request(app)
        .post('/v1/documents/generate')
        .set('Authorization', `Bearer ${registeredUser.body.tokens.access.token}`)
        .send(options);
      expect(res.status).toBe(httpStatus.CREATED);

      const generatedDocument: IGeneratedDocument = res.body;

      const signedDocument: IDocument = {
        hash: generatedDocument.hash,
        meta: generatedDocument.meta,
        signature: 'invalid_signature',
        public_key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
      };

      const joinCoopData: IJoinCooperative = {
        username: newUser.username,
        statement: signedDocument,
      };

      let joincoop_result = await request(app)
        .post('/v1/users/join-cooperative')
        .set('Authorization', `Bearer ${registeredUser.body.tokens.access.token}`)
        .send(joinCoopData);
      // console.log(joincoop_result.body);
      expect(joincoop_result.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    });

    test('should return 400 error if public_key is mismatch', async () => {
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
        signature: 'any imaged signature',
        skip_save: false,
      };
      let res = await request(app)
        .post('/v1/documents/generate')
        .set('Authorization', `Bearer ${registeredUser.body.tokens.access.token}`)
        .send(options);

      expect(res.status).toBe(httpStatus.CREATED);

      const generatedDocument: IGeneratedDocument = res.body;

      // const sign = await ecc.sign(generatedDocument.hash, '5JA8KCpXbCfWA9fS4zHKgcBPbnNaRha8iKHhZLV7ks9Gs3LenpU');
      const key = '5JA8KCpXbCfWA9fS4zHKgcBPbnNaRha8iKHhZLV7ks9Gs3LenpU';
      const wif = await PrivateKey.fromString(key);
      const sign = await wif.signDigest(generatedDocument.hash).toString();

      const signedDocument: IDocument = {
        hash: generatedDocument.hash,
        meta: generatedDocument.meta,
        signature: sign,
        public_key: 'EOS6FJnarqm25tRS8EoW5dLgW47C42tKa32BKCu98u2xhsbzwR1c8',
      };

      const joinCoopData: IJoinCooperative = {
        username: newUser.username,
        statement: signedDocument,
      };

      let joincoop_result = await request(app)
        .post('/v1/users/join-cooperative')
        .set('Authorization', `Bearer ${registeredUser.body.tokens.access.token}`)
        .send(joinCoopData);
      // console.log(joincoop_result.body);
      expect(joincoop_result.status).toBe(httpStatus.BAD_REQUEST);
    });

    test('should join the cooperative', async () => {
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

      let joincoop_result = await request(app)
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
    });
  });

  // ---
  // test('регистрируем пользователя в блокчейне', async () => {
  //   await request(app)
  //   .post('/v1/auth/register')
  //   // .set('Authorization', `Bearer ${adminAccessToken}`)
  //   .send(newUser)
  //   .expect(httpStatus.BAD_REQUEST);
  // })

  // test('should return 201 and successfully register user if request data is ok', async () => {
  //   await request(app)
  //   .post('/v1/documents/generate')
  //   // .set('Authorization', `Bearer ${adminAccessToken}`)
  //   .send(newUser)
  //   .expect(httpStatus.BAD_REQUEST);
  // })
});
