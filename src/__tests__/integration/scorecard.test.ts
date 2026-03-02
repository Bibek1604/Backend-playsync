import request from 'supertest';
import app from '../../app';
import { createTestUser, clearUsers } from '../testUtils';
import mongoose from 'mongoose';

describe('Scorecard API Integration Tests', () => {
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

    describe('GET /api/v1/scorecard', () => {
        test('should reject requests without auth token', async () => {
            const res = await request(app).get('/api/v1/scorecard');
            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/v1/scorecard/trend', () => {
        test('should reject requests without auth token', async () => {
            const res = await request(app).get('/api/v1/scorecard/trend');
            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });

        test('should retrieve XP trend data with valid token', async () => {
            const res = await request(app)
                .get('/api/v1/scorecard/trend')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
});
