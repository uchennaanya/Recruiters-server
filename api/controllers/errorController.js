import CustomError from "../utils/CustomError.js";

const devError = (res, error) => {
  res.status(error.statusCode).json({
    status: error.statusCode,
    message: error.message,
    stackTrace: error.stack,
    error: error,
  });
};

const castErrorHandler = (err) => {
  return new CustomError(
    `Invalid value ${err.value} for field ${err.path}`,
    400
  );
};

const duplicateErrorHandler = (err) => {
  return new CustomError(`User already exist`, 400);
};

const validationErrorHandler = (err) => {
  const errors = Object.values(err.errors).map((val) => val.message);
  const errorMessage = errors.join(`. ` );

  return new CustomError(errorMessage, 400);
};

const handleExpiredJWT = (err) => {
  return new CustomError("JWT has expired. please login again", 401);
};

const handleJWTError = (err) => {
  return new CustomError("Invalid token. please login again", 401);
};

const prodError = (res, error) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.statusCode,
      message: error.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

const errCtrl = (error, req, res, next) => {
  error.statusCode = error.statusCode || 400;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    devError(res, error);
  } else if (process.env.NODE_ENV === "production") {
    if (error.name === "CastError") error = castErrorHandler(error);
    if (error.statusCode === 11000) error = duplicateErrorHandler(error);
    if (error.name === "ValidationError") error = validationErrorHandler(error);
    if (error.name === "TokenExpiredError") error = handleExpiredJWT(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError(error);

    prodError(res, error);
  }
};

export default errCtrl;
