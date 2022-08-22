import mongoose, { Schema } from "mongoose";

const { ObjectId } = Schema

const postSchema = new Schema({

    content: {
        type: {},
        required: true
    },
    postedBy: {
        type: ObjectId,
        ref: 'User'
    },
    image: {
        url: String,
        public_id: String
    },
    likes: [{ type: ObjectId, ref: 'User' }],
    comments: [
        {
            text: String,
            created: { type: Date, default: Date.now },
            postedBy: { type: ObjectId, ref: 'User' }
        }
    ],
    Reported: { type: Boolean, default: false }


}, { timestamps: true });


export default mongoose.model('Post', postSchema);