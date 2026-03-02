import request from 'supertest';
import app from '../../app';
import { createTestUser, clearUsers } from '../testUtils';

describe('Notification API Integration Tests', () => {
    let token: string;

    beforeAll(async () => {
        const { token: userToken } = await createTestUser();
        token = userToken;
    });

    afterAll(async () => {
        await clearUsers();
    });

    describe('GET /api/v1/notifications', () => {
        test('should reject unauthorized requests', async () => {
            const res = await request(app).get('/api/v1/notifications');
            expect(res.statusCode).toBe(401);
        });

        test('should retrieve list of notifications', async () => {
            const res = await request(app)
                .get('/api/v1/notifications')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('notifications');
            expect(Array.isArray(res.body.data.notifications)).toBe(true);
        });
    });

    describe('GET /api/v1/notifications/unread-count', () => {
        test('should reject unauthorized requests', async () => {
            const res = await request(app).get('/api/v1/notifications/unread-count');
            expect(res.statusCode).toBe(401);
        });
    });

    describe('PATCH /api/v1/notifications/read-all', () => {
        test('should require auth token', async () => {
            const res = await request(app).patch('/api/v1/notifications/read-all');
            expect(res.statusCode).toBe(401);
        });

        test('should mark all notifications as read', async () => {
            const res = await request(app)
                .patch('/api/v1/notifications/read-all')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBeDefined();
        });
    });

    describe('PATCH /api/v1/notifications/:id/read', () => {
        test('should reject malformed Object ID for notification', async () => {
            const res = await request(app)
                .patch('/api/v1/notifications/invalid-id/read')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(400); // Validation error handled nicely
        });

        test('should return 404 for non-existent notification ID', async () => {
            const fakeId = '654321098765432109876543'; // Valid mongo Object ID format
            const res = await request(app)
                .patch(`/api/v1/notifications/${fakeId}/read`)
                .set('Authorization', `Bearer ${token}`);

            // Because there's no notification with this ID
            expect(res.statusCode).toBe(404);
        });
    });
});
