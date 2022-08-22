import userModels from '../models/user.models';
import postModels from '../models/post.models';
const jwt = require('jsonwebtoken');




export const reqSignIn = async (req, res, next) => {
    let token

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1]

            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            console.log(decoded, "from decode.")
            req.user = await userModels.findById({ _id: decoded._id }).select('-password')
            next()
        } catch (error) {
            console.error(error)

            res.status(401).send('Not authorized, token failed')
        }
    }

    if (!token) {
        res.status(401).send('Not authorized, token failed')
    }
};


export const canEditDelete = async (req, res, next) => {
    try {

        const post = await postModels.findById(req.params._id);
        // console.log('post in edit and delete middlewear', post.postedBy);
        // console.log('post in edit and delete middlewear', req.user._id);
        if (req.user._id.toString() !== post.postedBy.toString()) {
            console.log('error')
            return res.json({ error: 'Unathorized, from eidt' })
        } else {
            console.log('byby')
            next();
        }

    } catch (error) {
        console.log(error)
    }
}



export const isAdmin = async (req, res, cb) => {
    try {

        const user = await userModels.findById(req.user._id);
        if (user.Role !== 'Admin') {
            return res.status(400).send("Unathorized")
        } else {
            cb();
        }

    } catch (err) {
        console.log(err)
    }
}