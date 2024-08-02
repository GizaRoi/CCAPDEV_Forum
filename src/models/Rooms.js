const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const model = mongoose.model;
const {Post, Reply, ChildReply} = require('./Posts');

const RoomSchema = new Schema({
    room: {
        type: String,
        required: true
    },
    members: {
        type: Number
    },
    pic: {
        type: String,
        required: true
    },
    posts: [{type: Schema.Types.ObjectId, ref: 'Post'}]
});

const Room = mongoose.model('rooms', RoomSchema);
module.exports = Room;