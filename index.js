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


app.get('/farms',index);
app.get('/farms/new', newFarmPage)
app.get('/farms/:id',showFarm)
app.post('/farms', createFarm)
app.delete('/farms/:id',deleteFarm)
app.get('/farms/:id/products/new',createFarmProductPage)
app.post('/farms/:id/products',newFarmProduct)





// Farm Routes
// app.get('/farms', async (req, res) => {
//     const farms = await Farm.find({})
//     res.render('farms/index', { farms})
// })

// app.get('/farms/new', verify, (req, res) => {
//     res.render('farms/new')
// })

// app.get('/farms/:id', async (req, res) => {
//     const { id } = req.params;
//     const farm = await Farm.findById(id).populate('products');
//     res.render('farms/show', { farm });
// })

// app.post('/farms', verify, async (req, res) => {
//     const farm = new Farm(req.body)
//     await farm.save();
//     const farmOwner = await User.findById(req.userId)
//     console.log(req.userId)
//     console.log('owner:',farmOwner)
//     if(farmOwner){
//         farmOwner.farm = farm;
//     }
//    await farmOwner.save();
//     console.log('updated:', farmOwner); 
//     req.flash('Success', 'Made a new Farm Entry!')
//     res.redirect('/farms')
// })

// app.delete('/farms/:id', async(req,res) =>  {
//     const {id} = req.params;
//     const FarmDelete = await Farm.findByIdAndDelete(id);
//     res.redirect('/farms')
// })

// Linking products to farm

// //Mongo-Relationship: Creating a model field that appears inside another
// app.get('/farms/:id/products/new', async(req, res) => {
//     const { id } = req.params;
//     const farm = await Farm.findById(id);
//     res.render('products/new', { categories, farm })
// })

// app.post('/farms/:id/products', async (req, res) => {
//     const {id} = req.params;
//     const farm = await Farm.findById(id);
//     console.log(farm);
//     const { name, price, category } = req.body;
//     const product = new Product({ name, price, category })
//     farm.products.push(product);
//     product.farm=farm;
//     await farm.save();
//     await product.save();
//     res.redirect(`/farms/${id}`);
// })


// // Products Routes


// app.get('/products', wrapAsync(async (req, res, next) => {
//     const { category } = req.query;
//     if (category) {
//         const products = await Product.find({ category })
//         res.render('products/index', { products, category })

//     } else {
//         const products = await Product.find({})
//         res.render('products/index', { products, category: 'All' })
//     }
// }))

// app.get('/products/new', (req, res) => {
//     res.render('products/new', { categories })
// })
// app.post('/products', wrapAsync(async (req, res, next) => {
//     const newProduct = new Product(req.body);
//     await newProduct.save();
//     res.redirect(`/products/${newProduct._id}`)
// }))

// app.get('/products/:id', wrapAsync(async (req, res, next) => {
//     const { id } = req.params;
//     const product = await Product.findById(id).populate('farm','name')
//     console.log(product);
//     if (!product) {
//         throw new AppError('No Product Found', 404);
//     }
//     res.render('products/show', { product })
// }))

// app.get('/products/:id/edit', wrapAsync(async (req, res, next) => {
//     const { id } = req.params;
//     const product = await Product.findById(id);
//     if (!product) {
//         throw new AppError('No Product Found', 404);
//     }
//     res.render('products/edit', { product, categories })
// }))


// app.put('/products/:id', wrapAsync(async (req, res, next) => {
    //     const { id } = req.params;
    //     // await makes every other thing to wait till the query and update has been made.
    //     const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
//     console.log('hello');
//     // with await its now possible to access product._id
//     res.redirect(`/products/${product._id}`);
// }))

// app.delete('/products/:id', wrapAsync(async (req, res) => {
    //     const { id } = req.params;
    //     const productDelete = await Product.findByIdAndDelete(id, req.body)
    //     res.redirect('/products');
    // }))
    


    function wrapAsync(fn) {
        return function (req, res, next) {
            fn(req, res, next).catch(e => next(e))
        }
    }


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
