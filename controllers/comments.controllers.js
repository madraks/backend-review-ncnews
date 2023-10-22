const { removeComment, updateCommentVote } = require('../models/comments.models.js');

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  removeComment(comment_id)
  .then(() => {
    res.status(204).send()
  })
  .catch((err) => {
    next(err)
  })
}

exports.patchCommentVote = (req, res, next) => {
  const {comment_id} = req.params;
  const {inc_votes} = req.body;

  updateCommentVote(comment_id, inc_votes)
  .then((updatedComment) => {
    res.status(200).send(updatedComment)
  })
  .catch((err) => {
    next(err);
  })
}