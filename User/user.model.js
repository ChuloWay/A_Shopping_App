const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    name: {
        type: String
    },
    password: {
        type: String
    },
    email: {
        type: String
    }
});
const User = mongoose.model('User', UserSchema);

module.exports = {
    UserSchema,
    User,
}