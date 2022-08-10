const mongoose = require('mongoose');
const Schema = mongoose.Schema
const UserSchema = new mongoose.Schema({
    name: {
        type: String
    },
    password: {
        type: String
    },
    email: {
        type: String
    },
    farm:{
        type: Schema.Types.ObjectId,
        ref: 'Farm'
    }
});
const User = mongoose.model('User', UserSchema);

module.exports = {
    UserSchema,
    User,
}