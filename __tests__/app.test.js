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
  it('should return a status 200 and the correct item from the table', () => {
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
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.article)).not.toBe(true);
        expect(typeof body.article).toBe('object');
        expect(body.article.article_id).toBe(3);
        expect(body.article).toEqual(article);
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
        expect(body.message).toBe('400: Bad request, Invalid data type or ID');
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
describe('GET /api/articles', () => {
  it('should return with a status 200 and return an array filled with article objects', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(13);
        body.articles.forEach(article => {
          expect(article).toHaveProperty('author', expect.any(String))
          expect(article).toHaveProperty('title', expect.any(String))
          expect(article).toHaveProperty('article_id', expect.any(Number))
          expect(article).toHaveProperty('topic', expect.any(String))
          expect(article).toHaveProperty('created_at', expect.any(String))
          expect(article).toHaveProperty('votes', expect.any(Number))
          expect(article).toHaveProperty('article_img_url', expect.any(String))
          expect(article).toHaveProperty('comment_count', expect.any(String))
        })
      })
  })
  it('should be ordered by date in descending order', () => {
    return request(app)
      .get('/api/articles')
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy('created_at', { descending: true })
      })
  })
  describe('GET /api/articles when the table is empty', () => {
    beforeEach(() => {
      return db.query(`DROP TABLE IF EXISTS comments;`)
        .then(() => {
          return db.query(`DROP TABLE IF EXISTS articles;`);
        })
        .then(() => {
          return db.query(`
      CREATE TABLE articles (
        article_id SERIAL PRIMARY KEY,
        title VARCHAR NOT NULL,
        topic VARCHAR NOT NULL REFERENCES topics(slug),
        author VARCHAR NOT NULL REFERENCES users(username),
        body VARCHAR NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        votes INT DEFAULT 0 NOT NULL,
        article_img_url VARCHAR DEFAULT 'https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700'
      );`);
        })
        .then(() => {
          return db.query(`
      CREATE TABLE comments (
        comment_id SERIAL PRIMARY KEY,
        body VARCHAR NOT NULL,
        article_id INT REFERENCES articles(article_id) NOT NULL,
        author VARCHAR REFERENCES users(username) NOT NULL,
        votes INT DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
        })
    })
    it('should return a 404 and appropriate message when no results are returned', () => {
      return request(app)
        .get('/api/articles')
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe('404: No articles found')
        })
    })
  })
})
describe('GET /api/articles/:article_id/comments', () => {
  it('should receive a status 200 when requested with a valid id, and return an array of comments sorted from most recent', () => {
    return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then(({ body }) => {
        expect(body.comments.length).toBe(11);
        expect(body.comments).toBeSortedBy('created_at', { descending: true })

        body.comments.forEach((comment) => {
          expect(comment).toHaveProperty('comment_id', expect.any(Number))
          expect(comment).toHaveProperty('votes', expect.any(Number))
          expect(comment).toHaveProperty('created_at', expect.any(String))
          expect(comment).toHaveProperty('author', expect.any(String))
          expect(comment).toHaveProperty('body', expect.any(String))
          expect(comment).toHaveProperty('article_id', expect.any(Number))
        })
      })
  })
  it('should respond with a 404 when the article id doesnt exist', () => {
    return request(app)
      .get('/api/articles/272/comments')
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe('404: Article not found')
      })
  })
  it('should respond with a 200 status and empty array when the article exists, but there are no comments', () => {
    return request(app)
      .get('/api/articles/4/comments')
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toEqual([]);
      })
  })
  it('should return a status 400 and an appropriate message when the article_id is not a number', () => {
    return request(app)
      .get('/api/articles/notanumber/comments')
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('400: Bad request')
      })
  })
  it('should return a status 400 when passed with a REAL', () => {
    return request(app)
      .get('/api/articles/1.2/comments')
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('400: Bad request, Invalid data type or ID');
      })
  })
  it('should not be subject to a SQL injection and will receive a status 400 with an appropriate message', () => {
    return request(app)
      .get('/api/articles/1; DROP DATABASE nc_news;/comments')
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('400: Bad request')
      })
  })
})
describe('POST /api/articles/:article_id/comments', () => {
  it('should return a status 201 when inserted with a valid comment and EXISTING user and return the comment to the body', () => {
    const newComment = { username: "rogersop", body: "I am not a rabbit" }
    return request(app)
      .post('/api/articles/7/comments')
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment.comment_id).toBe(19);
        expect(body.comment.body).toBe('I am not a rabbit')
        expect(body.comment.article_id).toBe(7);
        expect(body.comment.author).toBe('rogersop')
        expect(body.comment.votes).toBe(0)
        expect(body.comment).toHaveProperty('created_at', expect.any(String));
      })
  })
  it('should return a 404 when inserted with a valid comment from a user that doesnt exist in the users table and return an error message', () => {
    const newComment = { username: "PennyKoala", body: "I sell Eucalyptus" };
    return request(app)
      .post('/api/articles/7/comments')
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe('404: ID not found')
      })
  })
  it('should return a 404 when the article is not found and return an appropriate message', () => {
    const newComment = { username: "rogersop", body: "I am not a rabbit" }
    return request(app)
      .post('/api/articles/364/comments')
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe('404: ID not found')
      })
  })
  it('should return a 400 when the article id is invalid with an appropriate error message', () => {
    const newComment = { username: 'rogersop', body: 'My comment is invalid' }
    return request(app)
      .post('/api/articles/INVALID/comments')
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('400: Bad request, Invalid data type or ID')
      })
  })
  it('should return a 400 when sent an empty object', () => {
    return request(app)
      .post('/api/articles/7/comments')
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('400: Bad request, NULL values')
      })
  })
  it('should return a 400 when sent an object with valid properies, but body contains arrays and objects even when the user is valid', () => {
    return request(app)
      .post('/api/articles/7/comments')
      .send({ username: 'rogersop', body: [1, 3, { hello: 'bro' }, 4] })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('400: Bad request, Invalid data. Too much data')
      })
  })
})
describe('PATCH /api/articles/:article_id', () => {
  it('should return a status 200 and responds with the updated article when adding votes', () => {
    const newVote = { inc_votes: 10 }
    return request(app)
      .patch('/api/articles/1')
      .send(newVote)
      .expect(200)
      .then(({ body }) => {
        expect(body.updatedArticle.article_id).toBe(1);
        expect(body.updatedArticle.votes).toBe(110)
      })
  })
  it('should return a status 200 and responds with the updated article when subtracting votes', () => {
    const newVote = { inc_votes: -10 }
    return request(app)
      .patch('/api/articles/2')
      .send(newVote)
      .expect(200)
      .then(({ body }) => {
        expect(body.updatedArticle.article_id).toBe(2)
        expect(body.updatedArticle.votes).toBe(-10)
      })
  })
  it('should return a 404 when the article doesnt exist and an appropriate message', () => {
    const newVote = { inc_votes: -10 }
    return request(app)
      .patch('/api/articles/342')
      .send(newVote)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe('404: Article not found');
      })
  })
  it('should return a 200 when sent an empty object and an unupdated article, essentially performs as a get', () => {
    return request(app)
      .patch('/api/articles/2')
      .send()
      .expect(200)
      .then(({ body }) => {
        expect(body.updatedArticle.votes).toBe(0)
      })
  })
  it('should respond with a 200 and unchanged article object when send an object with incorrect property', () => {
    return request(app)
      .patch('/api/articles/1')
      .send({invalidKey: 10})
      .expect(200)
      .then(({body}) => {
        expect(body.updatedArticle.votes).toBe(100)
      })
  })
  it('should return a 400 when sent an object with the correct property but incorrect data type', () => {
    return request(app)
      .patch('/api/articles/1')
      .send({ inc_votes: 'hello' })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('400: Bad request, Invalid data type or ID')
      })
  })
  it('should return a 400 when sent an object with the correct property but the number is too large to handle', () => {
    return request(app)
      .patch('/api/articles/3')
      .send({ inc_votes: Number.MAX_SAFE_INTEGER + 1 })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('400: Numeric Overflow')
      })
  })
  it('should return a 400 when sent an object with the correct property but the number is too large negatively to handle', () => {
    return request(app)
      .patch('/api/articles/3')
      .send({ inc_votes: Number.MIN_SAFE_INTEGER - 1 })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('400: Numeric Overflow')
      })
  })
});

describe('DELETE /api/comments/:comment_id', () => {
  it('should return a status 204 to confirm the comment has been successfully deleted', () => {
    return request(app)
      .delete('/api/comments/1')
      .expect(204)
  })
  it('should return a status 404 when the comment id is not found', () => {
    return request(app)
      .delete('/api/comments/134')
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe('404: Comment not found');
      })
  })
})

describe('GET /api/users', () => {
  it('should return with a status 200 and an array of objects, each object with a valid user', () => {
    const file = require('../db/data/test-data/users.js')
    return request(app)
      .get('/api/users')
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.users)).toBe(true)
        expect(body.users).toEqual(file)
        expect(body.users).toHaveLength(4)

        body.users.forEach((user) => {
          expect(user).toHaveProperty('username', expect.any(String))
          expect(user).toHaveProperty('name', expect.any(String))
          expect(user).toHaveProperty('avatar_url', expect.any(String))
        })
      })
  })
})

describe('GET /api/aricles TOPIC query feature', () => {
  it('should respond with a 200 and returns an array of objects of specified topic', () => {
    return request(app)
    .get('/api/articles?topic=cats')
    .expect(200)
    .then(({body}) => {
      expect(body.articles).toHaveLength(1);
    })
  })
  it('should respond with a 404 not found and a message stating no such topic found', () => {
    return request(app)
    .get('/api/articles?topic=dogs')
    .expect(404)
    .then(({body}) => {
      // console.log(body)
      expect(body.message).toBe('404: No topic found')
    })
  })
  it('should respond with a 200 and empty array when the topic exists, but there are no articles for it', () => {
    return request(app)
    .get('/api/articles?topic=paper')
    .expect(200)
    .then(({body}) => {
      // console.log(body)
    })
  })
})