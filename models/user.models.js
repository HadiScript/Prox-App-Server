import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({

    name: { type: String, trim: true, required: true },
    username: { type: String, trim: true, required: true, unique: true },

    department: { type: String },
    isConfirmed: { type: String, default: "requested" },
    Role: { type: String, default: "student" },
    Block: { type: Boolean, default: false },

    email: { type: String, trim: true, required: true, unique: true },
    password: { type: String, required: true, min: 6, max: 64 },
    secret: { type: String, trim: true, required: true },

    // any kind of data can be save here :
    about: {},

    image: {
        url: String,
        public_id: String
    },
    following: [{ type: Schema.ObjectId, ref: 'User' }],
    followers: [{ type: Schema.ObjectId, ref: 'User' }],



}, { timestamps: true });


export default mongoose.model('User', userSchema);