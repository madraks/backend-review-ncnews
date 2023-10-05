
exports.handleCustomErrors = (err, req, res, next) => {
  if(err.status && err.message) {
    res.status(err.status).send({message: err.message})
  } else next (err);
};

exports.handlePsqlErrors = (err, req, res, next) => {
  if (err.code === '22P02') {
    res.status(400).send({ message: '400: Bad request, Invalid data type or ID' })
  } else if (err.code === '23503') {
    res.status(404).send({message: '404: ID not found'})
  } else if(err.code === '23502') {
    res.status(400).send({message: '400: Bad request, NULL values'})
  } else if(err.code === '42601') {
    res.status(400).send({message: '400: Bad request, Invalid data. Too much data'})
  } else if(err.code === '22003') {
    res.status(400).send({message: '400: Numeric Overflow'})
  } else next(err);
};

exports.handleServerErrors = (err, req, res, next) => {
  console.log(err);
  res.status(500).send({message: '500: Internal Server Error'})
}