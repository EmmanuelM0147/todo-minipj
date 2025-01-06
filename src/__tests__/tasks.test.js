const request = require('supertest');
const express = require('express');
const session = require('express-session');
const taskRoutes = require('../routes/tasks');

const app = express();

app.use(session({
  secret: 'test-secret',
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  req.session.user = { id: 'test-user-id', username: 'testuser' };
  next();
});

app.use(express.json());
app.use('/tasks', taskRoutes);

describe('Task Routes', () => {
  test('GET /tasks should return 200', async () => {
    const response = await request(app).get('/tasks');
    expect(response.status).toBe(200);
  });

  test('POST /tasks should create a new task', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({
        title: 'Test Task',
        description: 'Test Description'
      });
    expect(response.status).toBe(302); 
  });

  test('PUT /tasks/:id/status should update task status', async () => {
    const response = await request(app)
      .put('/tasks/test-task-id/status')
      .send({
        status: 'completed'
      });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
});