const jwt = require('jsonwebtoken');
const config = require('./config');




function verifyToken(req,res,next){
    // const {authorization} = req.headers;
    const token = req.headers['authorization'];
    console.log('isvalid:' , req.headers);
    if(!token)
    return res.status(403).send({ auth: false, message: 'No token'})

    jwt.verify(token, config.secret, function(err, decoded){
        if(err)
        return res.status(500).send({auth: false, message: 'Failed My Gee'});
        req.userId = decoded.id;
        // console.log(req.userId);
        next()
    });
};

module.exports = verifyToken;


// const auth = (req,res,next)=>{
//     const {authorization}= req.headers;
//     if(!authorization){
//         return res.sendStatus(403);
//     }
//     const token = authorization.split(" ")[1];
//     try{
//         const data = jwt.verify(token, config.secret)
//     } catch {
//         return res.sendStatus(403);
//     }
// }