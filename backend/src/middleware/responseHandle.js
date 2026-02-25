const constants = require("../config/constant");

function responseHandle(req, res, next) {
  //success
  res.success = (data, status = constants.httpCodes.ok) => {
    res.status(status).json({
      status: "success",
      data,
    });
  };

  //error
  res.error = (error, status = constants.httpCodes.internalServerError) => {
    res.status(status).json({
      error: error,
    });
  };
  //Unauthorize
  res.unauthorized = () => {
    res.error("Unauthorized", constants.httpCodes.unauthorized);
  };

  next();
}
module.exports = responseHandle;
