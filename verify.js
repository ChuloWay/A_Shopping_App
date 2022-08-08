const jwt = require('jsonwebtoken');
const config = require('./config');

function verifyToken(req,res,next){
    const token = req.headers['x-access-token'];
    if(!token)
    return res.status(403).send({ auth: false, message: 'No token'})

    jwt.verify(token, config.secret, function(err, decoded){
        if(err)
        return res.status(500).send({auth: false, message: 'Failed My Gee'});
        req.userId = decoded.id;
        console.log(req.userId);
        next()
    });
};

module.exports = verifyToken;