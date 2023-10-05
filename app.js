const express = require('express');
const app = express();
const { handleCustomErrors, handlePsqlErrors, handleServerErrors} = require('./errors/index.js')
const { getAllTopics } = require('./controllers/topics.controllers.js');
const { getAllApis } = require('./controllers/api.controllers.js');
const { getArticleById, getAllArticles, getAllCommentsByArticleId, postComment, patchArticleVotes } = require('./controllers/articles.controllers.js');
const { deleteComment } = require('./controllers/comments.controllers.js');
const { getAllUsers } = require('./controllers/users.controllers.js');

app.use(express.json());

app.get("/api", getAllApis);

app.get("/api/topics", getAllTopics);

app.get('/api/articles', getAllArticles);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getAllCommentsByArticleId)

app.post("/api/articles/:article_id/comments", postComment);

app.patch("/api/articles/:article_id", patchArticleVotes);

app.delete("/api/comments/:comment_id", deleteComment)

app.get('/api/users', getAllUsers)

app.all("/*", (req, res) => {
  res.status(404).send({ message: "404: Path not found" })
})

app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handleServerErrors);


module.exports = app;