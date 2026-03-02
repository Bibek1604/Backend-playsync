import request from 'supertest';
import app from '../../app';
import { User } from '../../modules/auth/auth.model';

describe('Auth API Integration Tests', () => {
    const testUser = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
    };

    beforeAll(async () => {
        await User.deleteOne({ email: testUser.email });
    });

    afterAll(async () => {
        await User.deleteOne({ email: testUser.email });
    });

    describe('POST /api/v1/auth/register/user', () => {
        test('should validate missing fields', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register/user')
                .send({
                    fullName: testUser.fullName,
                    email: testUser.email,
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('should register new user', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register/user')
                .send(testUser);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        test('should login with valid credentials', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        test('should fail with invalid email', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'wrong@example.com',
                    password: testUser.password,
                });

            // The API returns 401 Unauthorized for invalid email/password based on the previous test output
            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });
});
