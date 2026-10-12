import fs from 'fs';
import os from 'os';
import path from 'path';
import request from 'supertest';
import { createApp } from './app';

describe('app', () => {
  let dbFilePath: string;
  const app = createApp();

  beforeEach(() => {
    dbFilePath = path.join(os.tmpdir(), `app-${Date.now()}-${Math.random()}.json`);
    process.env.DB_FILE_PATH = dbFilePath;
  });

  afterEach(() => {
    if (fs.existsSync(dbFilePath)) {
      fs.unlinkSync(dbFilePath);
    }
    delete process.env.DB_FILE_PATH;
  });

  it('returns ok on the health check', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('creates a user by username and fetches it back', async () => {
    const createRes = await request(app).post('/api/users').send({ username: 'alice' });
    expect(createRes.status).toBe(200);
    expect(createRes.body.username).toBe('alice');

    const getRes = await request(app).get(`/api/users/${createRes.body.id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.id).toBe(createRes.body.id);
  });

  it('rejects entry routes for a non-existent user', async () => {
    const res = await request(app).get('/api/users/unknown-user/entries');
    expect(res.status).toBe(404);
  });

  it('upserts a watch entry for a valid user', async () => {
    const userRes = await request(app).post('/api/users').send({ username: 'bob' });
    const userId = userRes.body.id;

    const putRes = await request(app)
      .put(`/api/users/${userId}/entries/tt0111161`)
      .send({ watched: true, rating: 4.5 });

    expect(putRes.status).toBe(200);
    expect(putRes.body.watched).toBe(true);
    expect(putRes.body.rating).toBe(4.5);
    expect(putRes.body.watchedAt).not.toBeNull();

    const listRes = await request(app).get(`/api/users/${userId}/entries`);
    expect(listRes.body).toHaveLength(1);
    expect(listRes.body[0].watchedAt).toBe(putRes.body.watchedAt);
  });

  it('rejects a watch entry update with an out-of-range or misaligned rating', async () => {
    const userRes = await request(app).post('/api/users').send({ username: 'dave' });
    const userId = userRes.body.id;

    for (const rating of [-1, 5.5, 3.25, 6]) {
      const putRes = await request(app)
        .put(`/api/users/${userId}/entries/tt0111161`)
        .send({ rating });
      expect(putRes.status).toBe(400);
    }
  });

  it('accepts a null rating to clear it', async () => {
    const userRes = await request(app).post('/api/users').send({ username: 'erin' });
    const userId = userRes.body.id;

    const putRes = await request(app)
      .put(`/api/users/${userId}/entries/tt0111161`)
      .send({ rating: null });

    expect(putRes.status).toBe(200);
    expect(putRes.body.rating).toBeNull();
  });

  it('creates a list and adds a movie to it for a valid user', async () => {
    const userRes = await request(app).post('/api/users').send({ username: 'carol' });
    const userId = userRes.body.id;

    const listRes = await request(app)
      .post(`/api/users/${userId}/lists`)
      .send({ name: 'Favorites' });
    expect(listRes.status).toBe(201);

    const addMovieRes = await request(app)
      .post(`/api/users/${userId}/lists/${listRes.body.id}/movies`)
      .send({ imdbId: 'tt0111161' });

    expect(addMovieRes.status).toBe(200);
    expect(addMovieRes.body.movieIds).toContain('tt0111161');
  });
});
