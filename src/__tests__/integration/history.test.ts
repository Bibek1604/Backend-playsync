import request from 'supertest';
import app from '../../app';
import { createTestUser, clearUsers } from '../testUtils';

describe('History API Integration Tests', () => {
    let token: string;

    beforeAll(async () => {
        const { token: userToken } = await createTestUser();
        token = userToken;
    });

    afterAll(async () => {
        await clearUsers();
    });

    describe('GET /api/v1/history', () => {
        test('should reject requests without auth token', async () => {
            const res = await request(app).get('/api/v1/history');
            expect(res.statusCode).toBe(401);
        });
        test('should accept pagination parameters', async () => {
            const res = await request(app)
                .get('/api/v1/history?page=1&limit=5')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('GET /api/v1/history/stats', () => {
        test('should reject unauthorized requests', async () => {
            const res = await request(app).get('/api/v1/history/stats');
            expect(res.statusCode).toBe(401);
        });

        test('should retrieve user participation stats', async () => {
            const res = await request(app)
                .get('/api/v1/history/stats')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
        });
    });

    describe('GET /api/v1/history/count', () => {
        test('should require authentication', async () => {
            const res = await request(app).get('/api/v1/history/count');
            expect(res.statusCode).toBe(401);
        });
    });
});
