const express = require('express');
const app = express();
const { getAllTopics } = require('./controllers/topics.controllers.js');
const {getAllApis} = require('./controllers/api.controllers.js');

app.use(express.json());

app.get("/api", getAllApis);

app.get("/api/topics", getAllTopics);

app.all("/*", (req, res, next) => {
  res.status(404).send({ message: "404: Path not found"})
})

app.use((err, req, res, next) => {
  if(err.status && err.message) {
    res.status(err.status).send({message: err.message})
  }
  res.status(500).send({message: "500: Internal Server Error"})
})

module.exports = app;