const jwt = require("jsonwebtoken");
require('dotenv').config()

const jwt_secret = process.env.SECRET_KEY;

const fetchuser = (req, res, next)=>{
    // get the user from the auth-token
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({error: "Please authenticate using a valid token"})
    }
    try {
        const data = jwt.verify(token, jwt_secret)
        req.user = data.user;
        next();     
    } catch (error) {
        res.status(401).send({error: "Please authenticate using a valid user"})
    }
}

module.exports = fetchuser;