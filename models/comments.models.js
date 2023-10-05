const db = require('../db/connection.js')

exports.removeComment = (commentId) => {
  const query = `DELETE from comments WHERE comment_id = $1;`;

  return db.query(query, [commentId])
  .then((result) => {
    if(result.rowCount === 0) {
      return Promise.reject({status: 404, message: '404: Comment not found'})
    }
  })
}