const responseHandler = (
  res,
  statusCode = 200,
  message = "Successful",
  data = {}
) => {
  res.status(statusCode).json({ success: true, message, data });
};

export { responseHandler };
