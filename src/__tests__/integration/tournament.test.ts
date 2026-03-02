import request from 'supertest';
import app from '../../app';
import { createTestUser, clearUsers } from '../testUtils';

describe('Tournament API Integration Tests', () => {
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

    describe('GET /api/v1/tournaments', () => {
        test('should list tournaments without authentication', async () => {
            const res = await request(app).get('/api/v1/tournaments');
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
        });
    });

    describe('GET /api/v1/tournaments/:id', () => {
        test('should return 404 for invalid tournament ID type safely', async () => {
            const res = await request(app).get('/api/v1/tournaments/invalid-id');
            // Safely handled as 400 or 404 cast error
            expect(res.statusCode).toBeGreaterThanOrEqual(400);
        });

        test('should return 404 for non-existent tournament', async () => {
            const fakeId = '654321098765432109876543';
            const res = await request(app).get(`/api/v1/tournaments/${fakeId}`);
            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/tournaments', () => {
        test('should reject unauthorized creation attempts', async () => {
            const res = await request(app)
                .post('/api/v1/tournaments')
                .send({
                    title: 'New Event'
                });

            expect(res.statusCode).toBe(401);
        });

        test('should enforce validation rules for new tournaments', async () => {
            const res = await request(app)
                .post('/api/v1/tournaments')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    description: 'Missing title'
                });

            expect(res.statusCode).toBe(400); // validation error
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/v1/tournaments/mine/list', () => {
        test('should reject unauthenticated access to personal tournaments', async () => {
            const res = await request(app).get('/api/v1/tournaments/mine/list');
            expect(res.statusCode).toBe(401);
        });

        test('should list user specific tournaments safely', async () => {
            const res = await request(app)
                .get('/api/v1/tournaments/mine/list')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('Payment verification routes', () => {
        test('should require auth for initiating payments', async () => {
            const fakeId = '654321098765432109876543';
            const res = await request(app).post(`/api/v1/tournaments/${fakeId}/pay`);
            expect(res.statusCode).toBe(401);
        });

        test('should handle missing payment intents properly', async () => {
            const fakeId = '654321098765432109876543';
            const res = await request(app)
                .post(`/api/v1/tournaments/${fakeId}/pay`)
                .set('Authorization', `Bearer ${token}`);

            // Will fail as tournament isn't found
            expect(res.statusCode).toBe(404);
        });
    });

    describe('GET /api/v1/tournaments/dashboard/transactions', () => {
        test('should enforce authentication', async () => {
            const res = await request(app).get('/api/v1/tournaments/dashboard/transactions');
            expect(res.statusCode).toBe(401);
        });
    });
});
