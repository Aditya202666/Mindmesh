const errorHandler = (err, req, res) =>{

    if (process.env.NODE_ENV === "development") {
        console.error("Error Stack:", err.stack);
      } else {
        console.error("Error Message:", err.message);
      }

    res.status(err.statusCode).json({success: err.success, message:err.message})

}

export {errorHandler}