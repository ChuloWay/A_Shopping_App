const {User} = require('../models/user.model');
const verify = require('../verify');
const  jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');



module.exports.registerPage=('/register', (req,res)=>{
    res.render('register')
})

module.exports.registerUser=('/register', async(req,res)=>{
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);

  User.create({
        name: req.body.name,
        email: req.body.email,
        // farm: req.body.farm,
        password: hashedPassword
    },
        function (err, user) {
            if (err)
                return res.status(500).send("There was a problem registering the user.");
            // create a token
            var token = jwt.sign({ id: user._id }, config.secret, {
                expiresIn: 86400 // expires in 24 hours
            });
            req.headers.authorization = token
            console.log(req.headers.cookie)
            res.status(200).send({ auth: true, token: token });
        }); 
    });



module.exports.me=('/me',verify, function(req, res, next) {
    //   res.status(200).send(decoded);
    User.findById(req.userId,
        // removes password from being seen
        {password: 0}, function(err, user){
        if (err) return res.status(500).send("There was a problem");
        if(!user) return res.status(404).send("No User");

        console.log(req.headers.cookie);

        res.status(200).send(user)
    })
    });
  


module.exports.login=('/login', (req,res)=>{
    User.findOne({email: req.body.email}, function(err,user) {
        if(err) return res.status(500).send("server error")
        if(!user) return res.status(404).send("No User") 
        
        const validPassword = bcrypt.compareSync(req.body.password, user.password);
        if(!validPassword) return res.status(401).send({auth: false, token: null});

        const token = jwt.sign({ id: user._id}, config.secret, {
            expiresIn: 86400
        });
        res.status(200).send({auth: true, token: token});

    })
})

module.exports.logout=('/logout', (req,res)=>{
    res.status(200).send({ auth: false, token: null});
});