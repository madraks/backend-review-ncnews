const express = require('express');
const app = express();
const { getAllTopics } = require('./controllers/topics.controllers.js');
const {getAllApis} = require('./controllers/api.controllers.js');
const { getArticleById, getAllArticles } = require('./controllers/articles.controllers.js');


app.get("/api", getAllApis);

app.get("/api/topics", getAllTopics);

app.get('/api/articles', getAllArticles);

app.get("/api/articles/:article_id", getArticleById);

app.all("/*", (req, res, next) => {
  res.status(404).send({ message: "404: Path not found"})
})

app.use((err, req, res, next) => {
  if(err.status && err.message) {
    res.status(err.status).send({message: err.message})
  } else next(err);
})

app.use((err, req, res, next) => {
  if(err.code === '22P02') {
    res.status(400).send({message: '400: Invalid ID'})
  } else next(err);
})

app.use((err, req, res, next) => {
  console.log(err)
  res.status(500).send({message: "500: Internal Server Error"})
})

module.exports = app;