const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    dateTime: {
        type: Date,
        default: Date.now
    },
    message: {
        type: String,
        required: true
    }
});

const MessageSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        required: true
    },
    username: {
        type: String,
    },
    
    dateTime: {
        type: Date,
        default: Date.now
    },
    message: {
        type: String,
        required: true
    },
    upvote: {
        type: Number,
        default: 0
    },
    downvote: {
        type: Number,
        default: 0
    },
    comments: [CommentSchema] // Array of CommentSchema objects
});

const TopicSchema = new mongoose.Schema({
    topicName: {
        type: String,
        required: true
    },
    topicId: {
        type: String,
        required: true
    },
    messages: [MessageSchema] // Array of MessageSchema objects
});

module.exports = mongoose.model('Topic', TopicSchema);
