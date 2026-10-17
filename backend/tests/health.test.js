const request = require('supertest');
const app = require('../index');

describe('Health & System API Tests', () => {
  it('GET /api/health should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'Enterprise SaaS API');
    expect(res.body).toHaveProperty('mode');
    expect(res.body.mode).toContain('supabase');
  });

  it('GET /api/nonexistent-route should return 404', async () => {
    const res = await request(app).get('/api/nonexistent-route');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('not found');
  });
});
