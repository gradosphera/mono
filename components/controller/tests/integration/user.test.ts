import faker from 'faker';
import httpStatus from 'http-status';
import app from '../../src/app';
import { setupTestDB } from '../utils/setupTestDB';
import { User } from '../../src/models';
import { userOne, userTwo, admin, insertUsers } from '../fixtures/user.fixture';
import { userOneAccessToken, adminAccessToken, userTwoAccessToken } from '../fixtures/token.fixture';
import request from 'supertest';
import { generateUsername } from '../../src/utils/generate-username';
import { IIndividualData } from '../../src/types';

setupTestDB();

describe('User routes', () => {
  describe('POST /v1/users', () => {
    let newUser;

    beforeEach(() => {
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

    test('should return 201 and successfully create new user if data is ok', async () => {
      await insertUsers([admin]);

      const res = await request(app).post('/v1/users').set('Authorization', `Bearer ${adminAccessToken}`).send(newUser);

      if (res.status !== httpStatus.CREATED) {
        console.error(res.body); // Выводит тело ответа, если статус не CREATED
      }

      expect(res.status).toBe(httpStatus.CREATED);

      expect(res.body.user).toBeDefined();
      expect(res.body.tokens).toBeDefined();

      const dbUser = await User.findOne({ username: newUser.username });
      expect(dbUser).toBeDefined();

      const privateData = (await dbUser?.getPrivateData()) as IIndividualData;
      expect(privateData).toBeDefined();

      expect(privateData.first_name).toEqual(newUser.individual_data.first_name);
      expect(privateData.last_name).toEqual(newUser.individual_data.last_name);

      expect(dbUser?.toObject()).toMatchObject({ email: newUser.email, role: newUser.role, is_email_verified: false });
    });

    test('should not be able to create an admin as well', async () => {
      await insertUsers([admin]);
      newUser.role = 'member';

      await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('успешная регистрация без токена доступа', async () => {
      await request(app).post('/v1/users').send(newUser).expect(httpStatus.CREATED);
    });

    test('should return 201 if logged in user is not admin', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newUser)
        .expect(httpStatus.CREATED);
      // TODO здесь мы допускаем регистрацию любому кто вызовет этот метод.
      // Возможно, следует пересмотреть на бэкенд (админа), который добавляет пользователей после каптчи.
    });

    test('should return 400 error if email is invalid', async () => {
      await insertUsers([admin]);
      newUser.email = 'invalidEmail';

      await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('емейл уже занят', async () => {
      await insertUsers([admin, userOne]);
      newUser.email = userOne.email;

      await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if role is neither user nor admin', async () => {
      await insertUsers([admin]);
      newUser.role = 'invalid';

      await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/users/add', () => {
    let newUser;

    beforeEach(() => {
      const email = faker.internet.email().toLowerCase();
      newUser = {
        email: email,
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

    test('should return 201 and successfully add new user if data is ok', async () => {
      await insertUsers([admin]);

      const res = await request(app).post('/v1/users/add').set('Authorization', `Bearer ${adminAccessToken}`).send(newUser);

      // if (res.status !== httpStatus.CREATED) {
      // console.error(res.body); // Выводит тело ответа, если статус не CREATED
      // }

      expect(res.status).toBe(httpStatus.CREATED);

      expect(res.body.user).toBeDefined();
      expect(res.body.user.username).toBeDefined();

      const dbUser = await User.findOne({ username: res.body.user.username });
      expect(dbUser).toBeDefined();

      const privateData = (await dbUser?.getPrivateData()) as IIndividualData;
      expect(privateData).toBeDefined();

      expect(privateData.first_name).toEqual(newUser.individual_data?.first_name);
      expect(privateData.last_name).toEqual(newUser.individual_data?.last_name);

      expect(dbUser?.toObject()).toMatchObject({ email: newUser.email, role: 'user', is_email_verified: false });
    });

    test('should return 403 if service user is not admin but data new user is ok', async () => {
      await insertUsers([userTwo]);

      const res = await request(app)
        .post('/v1/users/add')
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send(newUser);

      expect(res.status).toBe(httpStatus.FORBIDDEN);
    });

    test('should return 401 if service user is not have access token', async () => {
      const res = await request(app).post('/v1/users/add').send(newUser);

      expect(res.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/users', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app).get('/v1/users').set('Authorization', `Bearer ${adminAccessToken}`).send();

      // console.log(res.body);
      expect(res.status).toBe(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);

      expect(res.body.results[0]).toEqual({
        username: userOne.username,
        id: userOne._id.toString(),
        email: userOne.email,
        role: userOne.role,
        is_email_verified: userOne.is_email_verified,
        has_account: false,
        is_registered: userOne.is_registered,
        private_data: {
          ...userOne.individual_data,
          _id: expect.any(String),
          block_num: 0,
          _created_at: expect.any(String),
        },
        public_key: userOne.public_key,
        referer: '',
        statement: userOne.statement,
        status: userOne.status,
        message: userOne.message,
        type: userOne.type,
      });
    });

    test('should return 401 if access token is missing', async () => {
      await insertUsers([userOne, userTwo, admin]);

      await request(app).get('/v1/users').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if a non-admin is trying to access all users', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app).get('/v1/users').set('Authorization', `Bearer ${userOneAccessToken}`).send();

      expect(res.status).toBe(httpStatus.FORBIDDEN);
    });

    test('should correctly apply filter on username field', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ username: userOne.username })
        .send()
        .expect(httpStatus.OK);

      // console.log('res.body', res.body);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(userOne._id.toString());
    });

    test('should correctly apply filter on role field', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ role: 'user' })
        .send();

      expect(res.status).toBe(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });

      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(userOne._id.toString());
      expect(res.body.results[1].id).toBe(userTwo._id.toString());
    });

    test('should correctly sort the returned array if descending sort param is specified', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'role:desc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0].id).toBe(userOne._id.toString());
      expect(res.body.results[1].id).toBe(userTwo._id.toString());
      expect(res.body.results[2].id).toBe(admin._id.toString());
    });

    test('should correctly sort the returned array if ascending sort param is specified', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'role:asc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0].id).toBe(admin._id.toString());
      expect(res.body.results[1].id).toBe(userOne._id.toString());
      expect(res.body.results[2].id).toBe(userTwo._id.toString());
    });

    test('should correctly sort the returned array if multiple sorting criteria are specified', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'role:desc,username:asc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);

      const expectedOrder = [userOne, userTwo, admin].sort((a, b) => {
        if (a.role < b.role) {
          return 1;
        }
        if (a.role > b.role) {
          return -1;
        }
        return a.username < b.username ? -1 : 1;
      });

      expectedOrder.forEach((user, index) => {
        expect(res.body.results[index].id).toBe(user._id.toString());
      });
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 2,
        totalPages: 2,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(userOne._id.toString());
      expect(res.body.results[1].id).toBe(userTwo._id.toString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ page: 2, limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 2,
        limit: 2,
        totalPages: 2,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(admin._id.toString());
    });
  });

  describe('GET /v1/users/:userId', () => {
    test('should return 200 and the user object if data is ok', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .get(`/v1/users/${userOne.username}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');
      // expect(res.body).toEqual({
      //   id: userOne._id.toString(),
      //   email: userOne.email,
      //   name: userOne.name,
      //   role: userOne.role,
      //   is_email_verified: userOne.is_email_verified,
      // });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);

      await request(app).get(`/v1/users/${userOne.username}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is trying to get another user', async () => {
      await insertUsers([userOne, userTwo]);

      await request(app)
        .get(`/v1/users/${userTwo.username}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 200 and the user object if admin is trying to get another user', async () => {
      await insertUsers([userOne, admin]);

      await request(app)
        .get(`/v1/users/${userOne.username}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    test('should return 404 error if user is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .get(`/v1/users/${userOne.username}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  // describe('DELETE /v1/users/:userId', () => {
  //   test('should return 204 if data is ok', async () => {
  //     await insertUsers([userOne]);

  //     await request(app)
  //       .delete(`/v1/users/${userOne.username}`)
  //       .set('Authorization', `Bearer ${userOneAccessToken}`)
  //       .send()
  //       .expect(httpStatus.NO_CONTENT);

  //     const dbUser = await User.findById(userOne._id);
  //     expect(dbUser).toBeNull();
  //   });

  //   test('should return 401 error if access token is missing', async () => {
  //     await insertUsers([userOne]);

  //     await request(app).delete(`/v1/users/${userOne.username}`).send().expect(httpStatus.UNAUTHORIZED);
  //   });

  //   test('should return 403 error if user is trying to delete another user', async () => {
  //     await insertUsers([userOne, userTwo]);

  //     await request(app)
  //       .delete(`/v1/users/${userTwo.username}`)
  //       .set('Authorization', `Bearer ${userOneAccessToken}`)
  //       .send()
  //       .expect(httpStatus.FORBIDDEN);
  //   });

  //   test('should return 204 if admin is trying to delete another user', async () => {
  //     await insertUsers([userOne, admin]);

  //     await request(app)
  //       .delete(`/v1/users/${userOne.username}`)
  //       .set('Authorization', `Bearer ${adminAccessToken}`)
  //       .send()
  //       .expect(httpStatus.NO_CONTENT);
  //   });

  //   test('should return 400 error if userId is not a valid mongo id', async () => {
  //     await insertUsers([admin]);

  //     await request(app)
  //       .delete('/v1/users/invalidId')
  //       .set('Authorization', `Bearer ${adminAccessToken}`)
  //       .send()
  //       .expect(httpStatus.BAD_REQUEST);
  //   });

  //   test('should return 404 error if user already is not found', async () => {
  //     await insertUsers([admin]);

  //     await request(app)
  //       .delete(`/v1/users/${userOne.username}`)
  //       .set('Authorization', `Bearer ${adminAccessToken}`)
  //       .send()
  //       .expect(httpStatus.NOT_FOUND);
  //   });
  // });

  describe('PATCH /v1/users/:userId', () => {
    test('should return 403 and fail update user if not admin', async () => {
      await insertUsers([userOne]);
      const updateBody = {
        email: faker.internet.email().toLowerCase(),
      };

      const res = await request(app)
        .patch(`/v1/users/${userOne.username}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody);

      expect(res.status).toBe(httpStatus.FORBIDDEN);
    });

    test('should return 200 and successfully update user if data is ok and is admin', async () => {
      await insertUsers([userOne, admin]);
      const updateBody = {
        email: faker.internet.email().toLowerCase(),
      };

      const res = await request(app)
        .patch(`/v1/users/${userOne.username}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody);

      expect(res.status).toBe(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');

      const dbUser = await User.findById(userOne._id);
      expect(dbUser).toBeDefined();
      expect(dbUser).toMatchObject({ email: updateBody.email, role: 'user' });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);
      const updateBody = {
        email: faker.internet.email().toLowerCase(),
      };

      await request(app).patch(`/v1/users/${userOne.username}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if user is updating another user', async () => {
      await insertUsers([userOne, userTwo]);
      const updateBody = {
        email: faker.internet.email().toLowerCase(),
      };

      await request(app)
        .patch(`/v1/users/${userTwo.username}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 200 and successfully update user if admin is updating another user', async () => {
      await insertUsers([userOne, admin]);
      const updateBody = {
        email: faker.internet.email().toLowerCase(),
      };

      await request(app)
        .patch(`/v1/users/${userOne.username}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    test('should return 404 if admin is updating another user that is not found', async () => {
      await insertUsers([admin]);
      const updateBody = {
        email: faker.internet.email().toLowerCase(),
      };

      await request(app)
        .patch(`/v1/users/${userOne.username}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 if email is invalid', async () => {
      await insertUsers([userOne, admin]);
      const updateBody = { email: 'invalidEmail' };

      await request(app)
        .patch(`/v1/users/${userOne.username}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if email is already taken', async () => {
      await insertUsers([userOne, userTwo, admin]);
      const updateBody = { email: userTwo.email };

      await request(app)
        .patch(`/v1/users/${userOne.username}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if email is my email then taken', async () => {
      await insertUsers([userOne, admin]);
      const updateBody = { email: userOne.email };

      await request(app)
        .patch(`/v1/users/${userOne.username}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if username is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .get('/v1/users/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });
});
