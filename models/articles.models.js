const db = require('../db/connection.js');

exports.fetchArticleById = (articleId) => {
  if (isNaN(articleId)) {
    return Promise.reject({ status: 400, message: "400: Bad request"} )
  }

  const query = `SELECT * FROM articles
  WHERE article_id = $1;`;

  return db.query(query, [articleId])
    .then((result) => {
      if(result.rows.length === 0) {
        return Promise.reject({ status: 404, message: "404: Article not found"})
      }
      return result.rows[0];
    })
    .catch((err) => {
      return Promise.reject(err);
    })
}