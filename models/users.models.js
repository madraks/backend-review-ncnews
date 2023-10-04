const db = require('../db/connection.js')

exports.fetchAllUsers = () => {
  const query = `SELECT username, name, avatar_url FROM users;`

  return db.query(query)
  .then((result) => {
    if(result.rows.length === 0) {
      return Promise.reject({status: 404, message: '404: No users found'})
    } else {
      return result.rows;
    }
  })
}