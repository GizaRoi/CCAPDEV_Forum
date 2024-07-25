const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const model = mongoose.model;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: { 
        type: String,
        required: true,
    },
    profilePicture: {
        type: String
    },
    bio: {
        type: String,
        default: ''
    },
    posts: [{type: Schema.Types.ObjectId, ref: 'Post'}]
});

const User = model('users', UserSchema);

module.exports = User;