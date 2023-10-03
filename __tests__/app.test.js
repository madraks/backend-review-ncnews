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

describe('GET /*', () => {
  it('should return a status 404 when passed a path that doesnt exist', () => {
    return request(app)
      .get('/dontexist')
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe('404: Path not found')
      })
  })
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
    const file = require('../endpoints.json');

    return request(app)
      .get('/api')
      .then(({ body }) => {
        expect(Object.keys(body.endpoints).length).not.toBe(0);
        expect(body.endpoints).toEqual(file);
      })
  })

})

describe('GET /api/articles/:article_id', () => {
  it('should return a status 200', () => {
    return request(app)
      .get('/api/articles/3')
      .expect(200);
  })
  it('should return the correct item from the table', () => {
    const article = {
      article_id: 3,
      title: "Eight pug gifs that remind me of mitch",
      topic: "mitch",
      author: "icellusedkars",
      body: "some gifs",
      created_at: "2020-11-03T09:12:00.000Z",
      votes: 0,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    }

    return request(app)
      .get('/api/articles/3')
      .then(({ body }) => {
        expect(Array.isArray(body.article)).not.toBe(true);
        expect(typeof body.article).toBe('object');
        expect(body.article.article_id).toBe(3);
        expect(body.article).toEqual(article);

        expect(body.article).toHaveProperty('author', expect.any(String));
        expect(body.article).toHaveProperty('title', expect.any(String));
        expect(body.article).toHaveProperty('article_id', expect.any(Number));
        expect(body.article).toHaveProperty('body', expect.any(String));
        expect(body.article).toHaveProperty('topic', expect.any(String));
        expect(body.article).toHaveProperty('created_at', expect.any(String));
        expect(body.article).toHaveProperty('votes', expect.any(Number));
        expect(body.article).toHaveProperty('article_img_url', expect.any(String));

      })
  })
  it('should return a status 404 and a message indicating the article doesnt exist when no such id is found', () => {
    return request(app)
      .get('/api/articles/434')
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe('404: Article not found')
      })
  })
  it('should return a status 400 when trying to access the endpoint with a value that is not a number', () => {
    return request(app)
      .get('/api/articles/NaN')
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('400: Bad request');
      })
  })
  it('should return a status 400 when trying to access the endpoint with a REAL number', () => {
    return request(app)
      .get('/api/articles/1.2')
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('400: Invalid ID');
      })
  })
  it('should not be subject to SQL injection and will receive a status 400 along with a message', () => {
    return request(app)
      .get('/api/articles/1; DROP TABLE articles; SELECT * FROM topics;')
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('400: Bad request')
      })
  })
})