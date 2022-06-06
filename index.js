const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const AppError = require('./AppError');

const Product = require('./models/product');
const Farm = require('./models/farm');  

const categories = ['fruit', 'vegetable', 'dairy'];


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

//middleware used to get access to req.body
app.use(express.urlencoded({ extended: true }))
// middleware used to make other forms of http verbs
app.use(methodOverride('_method'))

// Farm Routes
app.get('/farms', async (req, res) => {
    const farms = await Farm.find({})
    res.render('farms/index', { farms })
})

app.get('/farms/new', (req, res) => {
    res.render('farms/new')
})

app.get('/farms/:id', async (req, res) => {
    const { id } = req.params;
    const farm = await Farm.findById(id).populate('products');
    res.render('farms/show', { farm });
})

app.post('/farms', async (req, res) => {
    const farm = new Farm(req.body)
    await farm.save();
    console.log(farm); 
    res.redirect('/farms')
})

app.delete('/farms/:id', async(req,res) =>  {
    const {id} = req.params;
    const FarmDelete = await Farm.findByIdAndDelete(id);
    res.redirect('/farms')
})

// Linking products to farm

//Mongo-Relationship: Creating a model field that appears inside another
app.get('/farms/:id/products/new', async(req, res) => {
    const { id } = req.params;
    const farm = await Farm.findById(id);
    res.render('products/new', { categories, farm })
})

app.post('/farms/:id/products', async (req, res) => {
    const {id} = req.params;
    const farm = await Farm.findById(id);
    console.log(farm);
    const { name, price, category } = req.body;
    const product = new Product({ name, price, category })
    farm.products.push(product);
    product.farm=farm;
    await farm.save();
    await product.save();
    res.redirect(`/farms/${id}`);
})


// Products Routes


app.get('/products', wrapAsync(async (req, res, next) => {
    const { category } = req.query;
    if (category) {
        const products = await Product.find({ category })
        res.render('products/index', { products, category })

    } else {
        const products = await Product.find({})
        res.render('products/index', { products, category: 'All' })
    }
}))

app.get('/products/new', (req, res) => {
    res.render('products/new', { categories })
})
app.post('/products', wrapAsync(async (req, res, next) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.redirect(`/products/${newProduct._id}`)
}))

app.get('/products/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id).populate('farm','name')
    console.log(product);
    if (!product) {
        throw new AppError('No Product Found', 404);
    }
    res.render('products/show', { product })
}))

app.get('/products/:id/edit', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
        throw new AppError('No Product Found', 404);
    }
    res.render('products/edit', { product, categories })
}))

function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(e => next(e))
    }
}

app.put('/products/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    // await makes every other thing to wait till the query and update has been made.
    const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    console.log('hello');
    // with await its now possible to access product._id
    res.redirect(`/products/${product._id}`);
}))

app.delete('/products/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const productDelete = await Product.findByIdAndDelete(id, req.body)
    res.redirect('/products');
}))

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
