const express = require('express');
const mongoose = require('mongoose');
const app = express();
const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSMongoose = require('@adminjs/mongoose');
const bodyParser = require('body-parser')
const path = require('path')
const methodOverride = require('method-override')
const AppError = require('./AppError');
const session = require('express-session');
const flash = require('connect-flash')

const {ProductResourceOptions} = require('./models/product.option')
const {UserResourceOptions} = require("./models/user.options")
const {FarmResourceOptions} = require("./models/farm.options")

// init adminJS
AdminJS.registerAdapter(AdminJSMongoose);
const adminJS = new AdminJS({
    databases: [],
    rootPath: '/admin',
    resources: [UserResourceOptions, FarmResourceOptions, ProductResourceOptions]
});
const adminJSRouter = AdminJSExpress.buildRouter(adminJS);


app.use(adminJS.options.rootPath, adminJSRouter);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


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

// User Controllers
const {registerPage} = require('./controllers/user');
const {registerUser} = require('./controllers/user');
const {me} = require('./controllers/user');
const {login} = require('./controllers/user');
const {logout} = require('./controllers/user');


// User Routes
app.get('/register',registerPage);
app.post('/register',registerUser);
app.get('/me',me);
app.post('/login',login);
app.post('/logout',logout);


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
