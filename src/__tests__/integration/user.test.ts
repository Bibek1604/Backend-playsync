import request from 'supertest';
import app from '../../app';
import { createTestUser, clearUsers } from '../testUtils';

describe('User API Integration Tests', () => {
    let token: string;
    let userId: string;

    beforeAll(async () => {
        const { user, token: userToken } = await createTestUser();
        token = userToken;
        userId = user._id.toString();
    });

    afterAll(async () => {
        await clearUsers();
    });

    describe('GET /api/v1/users/me', () => {
        test('should reject unauthorized requests', async () => {
            const res = await request(app).get('/api/v1/users/me');
            expect(res.statusCode).toBe(401);
        });

        test('should retrieve personal profile data', async () => {
            const res = await request(app)
                .get('/api/v1/users/me')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.fullName).toBe('Test User');
            // Make sure sensitive data is not returned
            expect(res.body.data.password).toBeUndefined();
        });
    });

    describe('PATCH /api/v1/users/profile', () => {
        test('should reject requests without auth token', async () => {
            const res = await request(app)
                .patch('/api/v1/users/profile')
                .send({
                    bio: 'New bio details'
                });

            expect(res.statusCode).toBe(401);
        });

        test('should update user profile correctly', async () => {
            const newName = 'Updated Test Name';
            const res = await request(app)
                .patch('/api/v1/users/profile')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    fullName: newName
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.fullName).toBe(newName);
        });
    });

    describe('GET /api/v1/users/:id', () => {
        test('should retrieve other users profile when providing correct ID', async () => {
            const res = await request(app)
                .get(`/api/v1/users/${userId}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
            // Should exclude sensitive info even internally
            expect(res.body.data.password).toBeUndefined();
        });

        test('should fail when searching for invalid user ID format', async () => {
            const res = await request(app)
                .get(`/api/v1/users/xyz123`);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('should fail when searching for non-existing user', async () => {
            const fakeId = '654321098765432109876543';
            const res = await request(app)
                .get(`/api/v1/users/${fakeId}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });
});
