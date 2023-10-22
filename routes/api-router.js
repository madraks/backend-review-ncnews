const apiRouter = require('express').Router();
const express = require('express');
const { getAllTopics } = require('../controllers/topics.controllers.js');
const { getAllApis } = require('../controllers/api.controllers.js');
const { getArticleById, getAllArticles, getAllCommentsByArticleId, postComment, patchArticleVotes } = require('../controllers/articles.controllers.js');
const { deleteComment, patchCommentVote } = require('../controllers/comments.controllers.js');
const { getAllUsers, getByUsername } = require('../controllers/users.controllers.js');

apiRouter.get('/', getAllApis)

apiRouter.get("/topics", getAllTopics);

apiRouter.get('/articles', getAllArticles);

apiRouter
  .route('/articles/:article_id')
  .get(getArticleById)
  .patch(patchArticleVotes);

apiRouter
  .route('/articles/:article_id/comments')
  .get(getAllCommentsByArticleId)
  .post(postComment)

apiRouter
  .route('/comments/:comment_id')
  .delete(deleteComment)
  .patch(patchCommentVote)

apiRouter.get('/users', getAllUsers)

apiRouter.get('/users/:username', getByUsername);

module.exports = apiRouter;