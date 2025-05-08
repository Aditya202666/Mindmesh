
const verifyToken = async(req, res, next) =>{

    const secureToken = req.cookies?.Mind
    const unsecureToken = req.header("Mesh")
    console.log()
    console.log({
        secureToken : secureToken,
        unsecureToken: unsecureToken
    })
    next()
}

export { verifyToken }