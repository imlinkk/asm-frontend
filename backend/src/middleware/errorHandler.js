const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal server error";

  if (error.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${error.path}`;
  }

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
  }

  if (error.code === 11000) {
    statusCode = 400;
    message = "Duplicate value";
  }

  res.status(statusCode).json({
    message,
    errors: error.errors || undefined
  });
};

module.exports = errorHandler;
