const express = require('express');
const app = express();

const {Product} = require('../models/product.model');
const { Farm } = require('../models/farm.model');  
const {User} = require('../models/user.model');
const verify = require('../verify');




module.exports.index= (async (req, res) => {
    const farms = await Farm.find({})
    res.render('farms/index', { farms})
})

module.exports.newFarmPage = ('/farms/new', verify, (req, res) => {
    res.render('farms/new')
})

module.exports.showFarm=('/farms/:id', async (req, res) => {
    const { id } = req.params;
    const farm = await Farm.findById(id).populate('products');
    res.render('farms/show', { farm });
})

module.exports.createFarm=('/farms', verify, async (req, res) => {
    const farm = new Farm(req.body)
    await farm.save();
    const farmOwner = await User.findById(req.userId)
    console.log(req.userId)
    console.log('owner:',farmOwner)
    if(farmOwner){
        farmOwner.farm = farm;
    }
   await farmOwner.save();
    console.log('updated:', farmOwner); 
    req.flash('Success', 'Made a new Farm Entry!')
    res.redirect('/farms')
})

module.exports.deleteFarm=('/farms/:id', async(req,res) =>  {
    const {id} = req.params;
    const FarmDelete = await Farm.findByIdAndDelete(id);
    res.redirect('/farms')
})

// Linking products to farm

//Mongo-Relationship: Creating a model field that appears inside another
module.exports.createFarmProductPage=('/farms/:id/products/new', async(req, res) => {
    const { id } = req.params;
    const farm = await Farm.findById(id);
    res.render('products/new', { categories, farm })
})

module.exports.newFarmProduct=('/farms/:id/products', async (req, res) => {
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
