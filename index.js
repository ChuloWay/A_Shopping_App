const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSMongoose = require('@adminjs/mongoose');

AdminJS.registerAdapter(AdminJSMongoose);

const bodyParser = require('body-parser')
const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const AppError = require('./AppError');
const session = require('express-session');
const flash = require('connect-flash')

const {Product} = require('./models/product.model');
const { Farm } = require('./models/farm.model');  
const {User} = require('./User/user.model')
const {ProductResourceOptions} = require('./models/product.option')
const {UserResourceOptions} = require("./User/user.options")
const {FarmResourceOptions} = require("./models/farm.options")
// init adminJS
const adminJS = new AdminJS({
    databases: [],
    rootPath: '/admin',
    resources: [UserResourceOptions, FarmResourceOptions, ProductResourceOptions]
});
const adminJSRouter = AdminJSExpress.buildRouter(adminJS);


app.use(adminJS.options.rootPath, adminJSRouter);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const  jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('./config');
const verify = require('./verify');


const categories = ['fruit', 'vegetable', 'dairy'];

const sessionOptions = { secret:'topsecret', resave: false, saveUninitialized: false};
app.use(session(sessionOptions));
app.use(flash());


mongoose.connect('mongodb://localhost:27017/testfarm', { useNewUrlParser: true })
    .then(() => {
        console.log("Connection Started On MongoDb!!");
    })
    .catch(err => {
        console.log('Oh No Error In Connecting To Mongo');
        console.log(err);
    })



    // Adding Authentication and Authorization For CRUD to be Performed.


app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use((req,res,next)=>{
    res.locals.messages= req.flash('Success');
    next();
})

//middleware used to get access to req.body
app.use(express.urlencoded({ extended: true }))
// middleware used to make other forms of http verbs
app.use(methodOverride('_method'))


app.get('/', (req,res)=>{
    res.send("started")
})

app.get('/register', (req,res)=>{
    res.render('register')
})

app.post('/register', async(req,res)=>{
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



app.get('/me',verify, function(req, res, next) {
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
  


app.post('/login', (req,res)=>{
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

app.post('/logout', (req,res)=>{
    res.status(200).send({ auth: false, token: null});
});



// Farm Controllers
const {index} = require('./controllers/farms')
const {newFarmPage} = require('./controllers/farms')
const {showFarm} = require('./controllers/farms')
const {createFarm} = require('./controllers/farms')
const {deleteFarm} = require('./controllers/farms')
const {createFarmProductPage} = require('./controllers/farms')
const {newFarmProduct} = require('./controllers/farms')

// Farm Routes
app.get('/farms',index);
app.get('/farms/new', newFarmPage)
app.get('/farms/:id',showFarm)
app.post('/farms', createFarm)
app.delete('/farms/:id',deleteFarm)
app.get('/farms/:id/products/new',createFarmProductPage)
app.post('/farms/:id/products',newFarmProduct)


// Product Controllers
const {productIndex} = require('./controllers/products');
const {newProductPage} = require('./controllers/products');
const {createProduct} = require('./controllers/products');
const {showProduct} = require('./controllers/products');
const {editProductPage} = require('./controllers/products');
const {editproduct} = require('./controllers/products');
const {deleteProduct} = require('./controllers/products');

// Product Routes
app.get('/products',productIndex);
app.get('/products/new',newProductPage);
app.post('/products',createProduct);
app.get('/products/:id',showProduct);
app.get('/products/:id/edit',editProductPage);
app.put('/products/:id',editproduct);
app.delete('/products/:id',deleteProduct);



const handleValidationError = err => {
    console.dir(err);
    return new AppError(`Validation Failed .... ${err.message}`, 400)
}


app.use((err, req, res, next) => {
    console.log(err.name);
    if (err.name === 'ValidationError') err = handleValidationError(err)
    next(err)
})

app.use((err, req, res, next) => {
    const { status = 500, message = 'Something Went wrong' } = err;

    res.status(status).send(message);
})


app.listen(3000, () => {
    console.log('App is listening on port 3000');
})
