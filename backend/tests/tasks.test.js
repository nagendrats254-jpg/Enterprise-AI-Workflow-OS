const request = require('supertest');
const app = require('../index');

describe('Tasks API Integration Tests', () => {
  let authToken = null;
  let createdTaskId = null;

  beforeAll(async () => {
    // Authenticate as Admin to get valid token
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@enterprise.ai',
        password: 'admin123',
      });

    expect(res.status).toBe(200);
    authToken = res.body.token;
  });

  it('GET /api/tasks without token should return 401', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });

  it('GET /api/tasks with token should return 200 and list of tasks', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('tasks');
    expect(Array.isArray(res.body.tasks)).toBe(true);
  });

  it('POST /api/tasks with missing fields should return 400', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: '',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('POST /api/tasks with valid payload should create a task', async () => {
    const newTask = {
      title: 'Automated Test Task',
      description: 'Created by automated Jest test suite',
      project_id: 1,
      priority: 'high',
      deadline: '2026-12-31T23:59:59.000Z',
    };

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newTask);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('task');
    expect(res.body.task.title).toBe(newTask.title);
    expect(res.body.task.priority).toBe(newTask.priority);

    createdTaskId = res.body.task.id;
  });

  it('GET /api/tasks/:id for newly created task should return 200', async () => {
    if (!createdTaskId) return;

    const res = await request(app)
      .get(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('task');
    expect(res.body.task.id).toBe(createdTaskId);
  });

  it('PATCH /api/tasks/:id/status should update task status', async () => {
    if (!createdTaskId) return;

    const res = await request(app)
      .patch(`/api/tasks/${createdTaskId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'in_progress' });

    expect(res.status).toBe(200);
    expect(res.body.task.status).toBe('in_progress');
  });

  it('DELETE /api/tasks/:id should remove the created task', async () => {
    if (!createdTaskId) return;

    const res = await request(app)
      .delete(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Task deleted');
  });

  it('GET /api/tasks/999999 for non-existent task should return 404', async () => {
    const res = await request(app)
      .get('/api/tasks/999999')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(404);
  });
});
