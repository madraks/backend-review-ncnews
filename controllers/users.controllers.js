const {fetchAllUsers, fetchByUsername} = require('../models/users.models.js')

exports.getAllUsers = (req, res, next) => {

  fetchAllUsers()
  .then((users) => {
    res.status(200).send({users})
  })
  .catch((err) => {
    next(err)
  })
}

exports.getByUsername = (req, res, next) => {
  const {username} = req.params;

  fetchByUsername(username)
  .then((user) => {
    res.status(200).send({user})
  })
  .catch((err) => {
    next(err);
  })
}