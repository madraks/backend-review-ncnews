const fs = require('fs/promises');

exports.fetchAllApis = () => {

  return fs.readFile(`${__dirname}/../endpoints.json`, "utf-8")
    .then((file) => {
      return JSON.parse(file);
    })
    .catch((err) => {
      if(err.code === 'ENOENT') {
        return Promise.reject({status: 404, message: "404: File not found"});
      }
    })
}