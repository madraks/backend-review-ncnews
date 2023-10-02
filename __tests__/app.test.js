const app = require("../app.js")
const db = require("../db/connection.js");
const request = require('supertest');
const seed = require("../db/seeds/seed.js")
const data = require("../db/data/test-data/index.js");
beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
})

describe("GET /api/topics", () => {
  it('should return a 200 status code', () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
  })
  it('should return an array of topic objects with two properties: slug and description', () => {
    return request(app)
      .get("/api/topics")
      .then(({ body }) => {
        expect(body.topics).toHaveLength(3);
        body.topics.forEach((topic) => {
          expect(topic).toHaveProperty('slug', expect.any(String));
          expect(topic).toHaveProperty('description', expect.any(String));
        })
      })
  })
  it('should return a 404 status code when trying to request a bad path', () => {
    return request(app)
      .get("/api/toooopics")
      .expect(404)
      .then(({ body }) => {
        expect(body).not.toBe(undefined);
        expect(body.message).toBe('404: Path not found');
      })
  })
})

describe('GET /api', () => {
  it('should return a status 200', () => {
    return request(app)
      .get('/api')
      .expect(200)
  })
  it('should return an object that describes all available endpoints. each endpoint should have the properties description, queries, and exampleResponse', () => {
    return request(app)
      .get('/api')
      .then(({ body }) => {
        expect(Array.isArray(body)).not.toBe(true);
        expect(typeof body).toBe("object");
        for (const end in body.endpoints) {
          const object = body.endpoints[end];
          expect(object).toHaveProperty('description', expect.any(String));
          expect(object).toHaveProperty('queries', expect.any(Array));
          expect(object).toHaveProperty('exampleResponse', expect.any(Object));
        }
      })
  })
  it('should return with status 404 when path is invalid', () => {
    return request(app)
      .get('/ai')
      .expect(404)
      .then(({body}) => {
        expect(body.message).toBe('404: Path not found')
      })
  })
})