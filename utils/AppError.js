// Define a custom error class for handling operational errors
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${this.statusCode}`.startsWith(4) ? "fail" : "error";
    this.isOperational = true;
    // capture stack trace for better debugging (only in dev-Enviroment)
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
