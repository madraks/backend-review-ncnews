const db = require('../db/connection.js')

exports.fetchAllUsers = () => {
  const query = `SELECT username, name, avatar_url FROM users;`

  return db.query(query)
  .then((result) => {
      return result.rows;
  })
}

exports.fetchByUsername = (username) => {
  const query = `SELECT * FROM users WHERE username = $1`;

  return db.query(query, [username])
  .then((result) => {
    if(result.rows.length === 0) {
      return Promise.reject({status: 404, message: '404: User not found'})
    }
    return result.rows[0];
  })
}