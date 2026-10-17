const request = require('supertest');
const app = require('../index');

describe('Authentication API Tests', () => {
  let authToken = null;

  it('POST /api/auth/login with missing email/password should return 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('POST /api/auth/login with invalid credentials should return 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid@user.com',
        password: 'wrongpassword',
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid email or password');
  });

  it('POST /api/auth/login with valid demo admin credentials should return 200 with JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@enterprise.ai',
        password: 'admin123',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('admin@enterprise.ai');
    expect(res.body.user.role).toBe('admin');
    expect(res.body.user).not.toHaveProperty('password');

    authToken = res.body.token;
  });

  it('GET /api/auth/me without token should return 401', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me with valid token should return 200 with user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('admin@enterprise.ai');
    expect(res.body.user.role).toBe('admin');
  });
});
