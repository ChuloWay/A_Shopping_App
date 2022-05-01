const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose');
const methodOverride = require('method-override')

const Product = require('./models/product');

mongoose.connect('mongodb://localhost:27017/farmStand', { useNewUrlParser: true })
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


const categories= ['fruit', 'vegetables', 'dairy'];


app.get('/products', async (req, res) => {
    const products = await Product.find({})
    res.render('products/index', { products })
})
app.get('/products/new', (req, res) => {
    res.render('products/new', {categories} )
})
app.post('/products', async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    console.log(newProduct);
    res.redirect(`/products/${newProduct._id}`)
})

app.get('/products/:id', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id)
    console.log(product);
    res.render('products/show', { product })
})

app.get('/products/:id/edit', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.render('products/edit', { product, categories })
})

app.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    // await makes every other thing to wait till the query and update has been made.
    const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    console.log('hello');
    // with await its now possible to access product._id
    res.redirect(`/products/${product._id}`);
})


app.listen(3000, () => {
    console.log('App is listening on port 3000');
})