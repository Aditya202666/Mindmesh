const errorHandler = (err, req, res, next) => {

  if (process.env.NODE_ENV === "development") {
    // console.info("Error Stack:", err.stack);
  } else {
    console.info("Error Message:", err.message);
  }

  res.status(err.statusCode).json({success:err.success, message:err.message})
  
};
export default errorHandler ;
