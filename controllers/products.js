const {Product} = require('../models/product.model');



function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(e => next(e))
    }
}



module.exports.productIndex=('/products', wrapAsync(async (req, res, next) => {
    const { category } = req.query;
    if (category) {
        const products = await Product.find({ category })
        res.render('products/index', { products, category })

    } else {
        const products = await Product.find({})
        res.render('products/index', { products, category: 'All' })
    }
}))

module.exports.newProductPage=('/products/new', (req, res) => {
    res.render('products/new', { categories })
})

module.exports.createProduct=('/products', wrapAsync(async (req, res, next) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.redirect(`/products/${newProduct._id}`)
}))

module.exports.showProduct=('/products/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id).populate('farm','name')
    console.log(product);
    if (!product) {
        throw new AppError('No Product Found', 404);
    }
    res.render('products/show', { product })
}))

module.exports.editProductPage=('/products/:id/edit', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
        throw new AppError('No Product Found', 404);
    }
    res.render('products/edit', { product, categories })
}))

module.exports.editproduct=('/products/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    // await makes every other thing to wait till the query and update has been made.
    const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    console.log('hello');
    // with await its now possible to access product._id
    res.redirect(`/products/${product._id}`);
}))

module.exports.deleteProduct=('/products/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const productDelete = await Product.findByIdAndDelete(id, req.body)
    res.redirect('/products');
}))
