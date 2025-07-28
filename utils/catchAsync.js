// @desc : This wrapper function catch error in async functions and pass them to Express error-handling middleware
export default (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
