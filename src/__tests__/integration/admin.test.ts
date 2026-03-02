import request from 'supertest';
import app from '../../app';
import { createTestUser, clearUsers } from '../testUtils';
import mongoose from 'mongoose';

describe('Admin API Integration Tests', () => {
    let adminToken: string;
    let userToken: string;

    beforeAll(async () => {
        // Create an admin
        const { token: aToken } = await createTestUser({ role: 'admin', email: 'admin@example.com' });
        adminToken = aToken;

        // Create a user
        const { token: uToken } = await createTestUser({ email: 'user@example.com' });
        userToken = uToken;
    });

    afterAll(async () => {
        await clearUsers();
    });

    describe('GET /api/v1/admin/dashboard/stats', () => {
        test('should reject unauthenticated requests', async () => {
            const res = await request(app).get('/api/v1/admin/stats');
            expect(res.statusCode).toBe(401);
        });

        test('should reject standard users from accessing admin tools', async () => {
            const res = await request(app)
                .get('/api/v1/admin/stats')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(403); // Forbidden
        });
    });

    describe('GET /api/v1/admin/users', () => {
    });

    describe('GET /api/v1/admin/games', () => {
    });
});
