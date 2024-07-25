const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const model = mongoose.model;
const User = require('./Users.js');

const ChildReplySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
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
    up: {type: Number},
    down: {type: Number}
});

const ReplySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
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
    replies: [{type: Schema.Types.ObjectId, ref: 'child_replies'}],
    up: {type: Number},
    down: {type: Number}
});

const PostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
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
        type: Schema.Types.ObjectId,
        ref: 'rooms',
        required: true,
    },
    post: {
        type: String,
        required: true
    },
    up: {
        type: Number
    },
    down: {
        type: Number
    },
    replies: [{type: Schema.Types.ObjectId, ref:'replies'}]
});

const Post = model('posts', PostSchema);
const Reply = model('replies', ReplySchema);
const ChildReply = model('child_replies', ChildReplySchema);

module.exports = { Post, Reply, ChildReply };