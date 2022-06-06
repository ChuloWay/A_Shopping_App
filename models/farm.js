const mongoose = require('mongoose');
const Product = require('./product');
const {Schema} = mongoose;


const  farmSchema = new Schema({
    name: {
        type:String,
        requires: [true, 'Farm Must Have A Name']
    },
    city: {
        type: String
    },
    email: {
        type: String,
        required: [true, 'Email Required']
    },
    products: [
        {
            type:Schema.Types.ObjectId,
            ref: 'Product'
        }
    ]
})

farmSchema.post('findOneAndDelete', async function (farm) {
    if(farm.products.length){
       const resData = await Product.deleteMany({_id: { $in: farm.products}})
       console.log(resData);
    }
})

const Farm = mongoose.model('Farm', farmSchema);

module.exports = Farm;