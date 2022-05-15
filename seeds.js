const mongoose = require('mongoose');
const Product = require('./models/product');

mongoose.connect('mongodb://localhost:27017/farmStand2', { useNewUrlParser: true})
.then(()=>{
    console.log("Connection Started On MongoDb!!");
})
.catch(err=>{
    console.log('Oh No Error In Connecting To Mongo');
    console.log(err);
})

// const p = new Product({
//     name:'Ruby Grapefruit',
//     price:1.99,
//     category:'fruit'
// })
// p.save().then(res =>{
//     console.log(res);
// })
// .catch(err =>{
//     console.log(err);
// })
const seedProducts = [
    {
        name: 'Fairy EggPlant',
        price: 1.00,
        category: 'vegetable'
    },
    {
        name: 'Organic Goddess Melon',
        price: 4.99,
        category:'fruit'
    },
    {
        name:'Organic Celery',
        price:3.99,
        category:'fruit'
    }
]

Product.insertMany(seedProducts)
.then(res =>{
    console.log(res);
})
.catch(err=>{
    console.log(err);
});