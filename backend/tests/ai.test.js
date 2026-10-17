const request = require('supertest');
const app = require('../index');

describe('AI Assistant API Tests', () => {
  let authToken = null;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@enterprise.ai',
        password: 'admin123',
      });

    expect(res.status).toBe(200);
    authToken = res.body.token;
  });

  it('GET /api/ai/status without token should return 401', async () => {
    const res = await request(app).get('/api/ai/status');
    expect(res.status).toBe(401);
  });

  it('GET /api/ai/status with token should return AI configuration state', async () => {
    const res = await request(app)
      .get('/api/ai/status')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('configured');
    expect(res.body).toHaveProperty('provider');
    expect(res.body).toHaveProperty('model');
    expect(res.body.configured).toBe(true);
    expect(res.body.provider).toBe('gemini');
    expect(res.body.model).toBe('gemini-2.5-flash');
  });

  it('POST /api/ai/chat without token should return 401', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({ message: 'Hello' });

    expect(res.status).toBe(401);
  });

  it('POST /api/ai/chat with empty message should return 400', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('POST /api/ai/chat with query should return intelligent response', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ message: 'Give me a brief 1-sentence status of project deadlines.' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('response');
    expect(typeof res.body.response).toBe('string');
    expect(res.body.response.length).toBeGreaterThan(5);
    expect(res.body).toHaveProperty('model');
  }, 20000); // 20s timeout for live AI network call
});
