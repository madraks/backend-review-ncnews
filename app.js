const express = require('express');
const app = express();
const apiRouter = require('./routes/api-router');
const { handleCustomErrors, handlePsqlErrors, handleServerErrors} = require('./errors/index.js')

app.use(express.json());

app.use("/api", apiRouter);

app.all("/*", (req, res) => {
  res.status(404).send({ message: "404: Path not found" })
})

app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handleServerErrors);


module.exports = app;