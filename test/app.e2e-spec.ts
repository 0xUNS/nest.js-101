import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from 'src/user/dto';

describe('AppController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();
        await app.listen(3000);

        prisma = app.get(PrismaService);
        await prisma.cleanDb();
        pactum.request.setBaseUrl('http://localhost:3000');
    });

    afterAll(() => app.close());

    describe('Auth', () => {
        const dto: AuthDto = { email: 'acab@tmail.com', password: 'pw1234' };

        describe('Signup', () => {
            it('should signup', async () => {
                return pactum
                    .spec()
                    .post('/auth/signup')
                    .withBody(dto)
                    .expectStatus(201)
                    .inspect();
            });
            it('should throw if email empty', () => {
                return pactum
                    .spec()
                    .post('/auth/signup')
                    .withBody({ password: 'pw1234' })
                    .expectStatus(400);
            });
            it('should throw if password empty', () => {
                return pactum
                    .spec()
                    .post('/auth/signup')
                    .withBody({ email: 'acab@tmail.com' })
                    .expectStatus(400);
            });
            it('should throw if no body provided', () => {
                return pactum.spec().post('/auth/signup').expectStatus(400);
            });
        });

        describe('Signin', () => {
            it('should signin', async () => {
                return pactum
                    .spec()
                    .post('/auth/signin')
                    .withBody(dto)
                    .expectStatus(200)
                    .stores('userAt', 'access_token'); // Store user access token
            });
            it('should throw if email empty', () => {
                return pactum
                    .spec()
                    .post('/auth/signin')
                    .withBody({ password: 'pw1234' })
                    .expectStatus(400);
            });
            it('should throw if password empty', () => {
                return pactum
                    .spec()
                    .post('/auth/signin')
                    .withBody({ email: 'acab@tmail.com' })
                    .expectStatus(400);
            });
            it('should throw if no body provided', () => {
                return pactum.spec().post('/auth/signin').expectStatus(400);
            });
        });
    });

    describe('User', () => {
        describe('Get current user', () => {
            it('should get current user', () => {
                return pactum
                    .spec()
                    .get('/users/me')
                    .withHeaders({ Authorization: 'Bearer $S{userAt}' })
                    .expectStatus(200);
            });
        });
        describe('Edit user', () => {
            it('should edit user', () => {
                const dto: EditUserDto = {
                    firstName: 'John',
                    email: 'john@example.com',
                };
                return pactum
                    .spec()
                    .patch('/users')
                    .withHeaders({ Authorization: 'Bearer $S{userAt}' })
                    .withBody(dto)
                    .expectStatus(200)
                    .expectBodyContains(dto.firstName)
                    .expectBodyContains(dto.email)
                    .inspect();
            });
        });
    });

    describe('Bookmarks', () => {
        describe('Get bookmarks', () => {});
        describe('Get bookmark by id', () => {});
        describe('Edit bookmark by id', () => {});
        describe('Delete bookmark by id', () => {});
    });
});
