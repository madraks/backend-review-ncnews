const articles = require('../db/data/test-data/articles.js');
const { fetchArticleById, fetchAllArticles, fetchAllCommentsByArticleId, insertComment, updateArticleVotes } = require('../models/articles.models.js');

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
  const promises = [fetchArticleById(article_id), fetchAllCommentsByArticleId(article_id)];
  return Promise.all(promises)
  .then(([article, comments]) => {
    res.status(200).send({comments});
  })
  .catch((err) => {
    next(err)
  })
}

exports.postComment = (req, res, next) => {
  const {article_id} = req.params;
  const comment = req.body;

  const promises = [fetchArticleById(article_id), insertComment(article_id, comment)];
  return Promise.all(promises)
  .then(([article, comment]) => {
    res.status(201).send({comment})
  })
  .catch((err) => {
    next(err)
  })
}

exports.patchArticleVotes = (req, res, next) => {
  const {article_id} = req.params;
  const inc_votes = req.body;

  const promises = [fetchArticleById(article_id), updateArticleVotes(article_id, inc_votes)];

  return Promise.all(promises)
  .then(([article, updatedArticle]) => {
    res.status(200).send({updatedArticle})
  })
  .catch((err) => {
    next(err);
  })
}