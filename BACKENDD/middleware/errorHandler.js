// Global error handler middleware

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message || "Something went wrong";

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    message    = "Invalid ID format";
    statusCode = 400;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message    = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    message    = Object.values(err.errors).map(e => e.message).join(", ");
    statusCode = 400;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError")  { message = "Invalid token";  statusCode = 401; }
  if (err.name === "TokenExpiredError")  { message = "Token expired. Please login again."; statusCode = 401; }

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") { message = "File too large. Max 5MB allowed."; statusCode = 400; }

  console.error(`[${statusCode}] ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
