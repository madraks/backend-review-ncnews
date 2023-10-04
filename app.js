const express = require('express');
const app = express();
const { getAllTopics } = require('./controllers/topics.controllers.js');
const { getAllApis } = require('./controllers/api.controllers.js');
const { getArticleById, getAllArticles, getAllCommentsByArticleId, postComment, patchArticleVotes } = require('./controllers/articles.controllers.js');
const { deleteComment } = require('./controllers/comments.controllers.js');

app.use(express.json());

app.get("/api", getAllApis);

app.get("/api/topics", getAllTopics);

app.get('/api/articles', getAllArticles);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getAllCommentsByArticleId)

app.post("/api/articles/:article_id/comments", postComment);

app.patch("/api/articles/:article_id", patchArticleVotes);

app.delete("/api/comments/:comment_id", deleteComment)

app.use((err, req, res, next) => {
  if (err.code === '22P02') {
    res.status(400).send({ message: '400: Invalid ID' })
  } else if (err.code === '23503') {
    res.status(422).send({message: '422: User not found'})
  } else if(err.code === '23502') {
    res.status(400).send({message: '400: Bad request, NULL values'})
  } else if(err.code === '42601') {
    res.status(400).send({message: '400: Bad request, Invalid data. Too much data'})
  } else if(err.code === '22003') {
    res.status(400).send({message: '400: Numeric Overflow'})
  } else next(err);
})
app.use((err, req, res, next) => {
  if (err.status && err.message) {
    res.status(err.status).send({ message: err.message })
    return;
  } else next(err);
})

app.use((err, req, res, next) => {
  console.log(err)
  res.status(500).send({ message: "500: Internal Server Error" })
})

app.all("/*", (req, res) => {
  res.status(404).send({ message: "404: Path not found" })
})

module.exports = app;