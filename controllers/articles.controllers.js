const { commentData } = require('../db/data/test-data/index.js');
const { fetchArticleById, fetchAllArticles, fetchAllCommentsByArticleId } = require('../models/articles.models.js');

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  
  fetchArticleById(article_id)
  .then((article) => {
    res.status(200).send({article});
  })
  .catch((err) => {
    next(err);
  })
}

exports.getAllArticles = (req, res, next) => {
  
  fetchAllArticles()
    .then((articles) => {
      res.status(200).send({articles});
    })
    .catch((err) => {
      next(err);
    })
}

exports.getAllCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const promiseFetchArticle = [fetchArticleById(article_id)];
  return Promise.all(promiseFetchArticle)
  .then(() => {
    return fetchAllCommentsByArticleId(article_id)
  })
  .then((comments) => {
    res.status(200).send({comments});
  })
  .catch((err) => {
    next(err)
  })
}
