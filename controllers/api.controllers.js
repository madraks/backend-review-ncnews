const {fetchAllApis} = require('../models/api.models.js');

exports.getAllApis = (req, res, next) => {
  fetchAllApis()
  .then((endpoints) => {
    res.status(200).send({endpoints});
  })
  .catch((err) => {
    next(err);
  })
}