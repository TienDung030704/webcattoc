function notFoundHandle(req, res) {
  res.error(`Can not ${req.method} ${req.url}`, 404);
}
module.exports = notFoundHandle;
