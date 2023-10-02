const express = require('express');
const app = express();
const { getAllTopics } = require('./controllers/topics.controllers.js');

app.use(express.json());

app.get("/api/topics", getAllTopics);

app.all("/*", (req, res, next) => {
  res.status(404).send({ message: "404: Path not found"})
})

app.use((err, req, res, next) => {
  res.status(500).send({message: "500: Internal Server Error"})
})

module.exports = app;