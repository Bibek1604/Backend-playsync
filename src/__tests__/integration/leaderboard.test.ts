import request from 'supertest';
import app from '../../app';

describe('Leaderboard API Integration Tests', () => {

    describe('GET /api/v1/leaderboard', () => {
        test('should accept pagination parameters', async () => {
            const res = await request(app).get('/api/v1/leaderboard?page=1&limit=5');
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('GET /api/v1/leaderboard/stats', () => {
        test('should retrieve global leaderboard stats', async () => {
            const res = await request(app).get('/api/v1/leaderboard/stats');
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
            expect(res.body.data).toHaveProperty('totalPlayers');
        });
    });
});
