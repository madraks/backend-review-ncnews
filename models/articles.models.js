const db = require('../db/connection.js');
const format = require('pg-format');

exports.fetchArticleById = (articleId) => {
  if (isNaN(articleId)) {
    return Promise.reject({ status: 400, message: "400: Bad request"} )
  }

  const query = `SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.body, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.article_id) AS comment_count FROM articles
  LEFT JOIN comments ON comments.article_id = articles.article_id
  WHERE articles.article_id = $1
  GROUP BY comments.article_id, articles.article_id;
`;

  return db.query(query, [articleId])
    .then((result) => {
      if(result.rows.length === 0) {
        return Promise.reject({ status: 404, message: "404: Article not found"})
      }
      return result.rows[0];
    })
}

exports.fetchAllArticles = (topic, sortby = 'date', order = 'DESC') => {
  
  const validSortbys = {
    date: "created_at",
    DESC: 'DESC',
    desc: 'desc',
    asc: 'asc',
    ASC: 'ASC',
  }

  if(!validSortbys[sortby]) {
    return Promise.reject({status: 400, message: "400: Bad request"})
  }
  
  let query = `SELECT articles.article_id, articles.author, title, topic, articles.created_at, articles.votes, article_img_url, COUNT(comments.article_id) AS comment_count 
  FROM articles
  LEFT JOIN comments ON comments.article_id = articles.article_id
  LEFT JOIN topics ON articles.topic = topics.slug`

  if(topic) {
    const lookup = {}
    let query2 = query;
    return db.query(`SELECT slug FROM topics;`)
      .then((result) => {
        result.rows.forEach((obj) => {
          lookup[obj.slug] = obj.slug;
        })
        return lookup;
      })
      .then((map) => {
        if (map[topic] === undefined) {
          return Promise.reject({status: 404, message: '404: No topic found'})
        } else {
          query2 += `\nWHERE articles.topic = $1\nGROUP BY articles.article_id, comments.article_id\nORDER BY articles.${validSortbys[sortby]} ${validSortbys[order]} `
        }
        return query2;
      })
      .then((finalQuery) => {
        return db.query(finalQuery, [topic])
          .then((result) => {
            return result.rows;
          })
      })
  }

    query += `\nGROUP BY articles.article_id, comments.article_id
  ORDER BY articles.${validSortbys[sortby]} ${validSortbys[order]};
  `

  return db.query(query)
    .then((result) => {
      if(result.rows.length === 0) {
        return Promise.reject({status: 404, message: '404: No articles found'})
      } else {
        return result.rows;
      }
    })
}

exports.fetchAllCommentsByArticleId = (article_id) => {

  if(isNaN(article_id)) {
    return Promise.reject({status:400, message: '400: Bad request'})
  }
  let query = `SELECT * FROM comments
  WHERE article_id = $1
  ORDER BY comments.created_at DESC`;

  return db.query(query, [article_id])
    .then((result) => {
      return result.rows;
    })
}

exports.insertComment = (article_id, comment) => {

  const {username, body} = comment;

  const formattedArray = [body, username, article_id]

  const query = format(`INSERT INTO comments (body, author, article_id) VALUES %L RETURNING *;`,
  [formattedArray]);

  return db.query(query)
  .then((result) => {
      return result.rows[0];
    })
}

exports.updateArticleVotes = (article_id, votes = 0) => {
  
  const array = [votes, article_id]
  const query = `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;`;

  return db.query(query, array)
  .then((result) => {
      if(result.rows.length === 0) {
        return Promise.reject({status: 404, message: '404: Article not found'})
      }
      return result.rows[0]
    })
}