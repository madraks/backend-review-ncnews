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

exports.updateCommentVote = (commentId, votes = 0) => {
  const array = [votes, commentId];
  let query = `UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *`;

  return db.query(query, array)
  .then((result) => {
    if(result.rows.length === 0) {
      return Promise.reject({status: 404, message: '404: Comment not found'})
    }
    return result.rows[0];
  })
}