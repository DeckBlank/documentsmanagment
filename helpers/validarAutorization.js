const  authenticateToken = async function(req, res, next) {
  // Gather the jwt access token from the request header
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401).json({mensaje:"No tienes permisos"}) // if there isn't any token
  try {
        var decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (e) {
       return res.status(403).json('No tienes permisos')
    }
  next()
}

module.exports = authenticateToken;
