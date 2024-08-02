const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const model = mongoose.model;
const User = require('./Users.js');

const ChildReplySchema = new Schema({
    user: {
        type: String,
        required: true
    },
    reply: {
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    },
    repliedTo: {type: Schema.Types.ObjectId, ref:'replies'},
    up: {type: Number,
        default: 0},
    down: {type: Number,
        default: 0}
});

const ReplySchema = new Schema({
    user: {
        type: String,
        required: true
    },
    reply: {
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    },
    repliedTo: {type: Schema.Types.ObjectId, ref: 'posts'},
    up: {type: Number,
        default: 0},
    down: {type: Number,
        default: 0}
});

const PostSchema = new Schema({
    user: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    room: {
        type: String,
        required: true,
    },
    post: {
        type: String,
        required: true
    },
    up: {
        type: Number,
        default: 0
    },
    down: {
        type: Number,
        default: 0
    },
});

const Post = model('posts', PostSchema);
const Reply = model('replies', ReplySchema);
const ChildReply = model('child_replies', ChildReplySchema);

module.exports = { Post, Reply, ChildReply };