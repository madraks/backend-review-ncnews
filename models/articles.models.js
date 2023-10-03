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
}

exports.fetchAllArticles = (sortby = 'date', order = 'DESC') => {
  const validSortbys = {
    date: "created_at",
    DESC: 'DESC',
    desc: 'desc',
    asc: 'asc',
    ASC: 'ASC'
  }

  if(!validSortbys[sortby]) {
    return Promise.reject({status: 400, message: "400: Bad request"})
  }

  const query = `SELECT articles.article_id, articles.author, title, topic, articles.created_at, articles.votes, article_img_url, COUNT(comments.article_id) AS comment_count FROM articles
  LEFT JOIN comments
    ON comments.article_id = articles.article_id
  GROUP BY articles.article_id, comments.article_id
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