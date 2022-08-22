import { comparePassword, hashPassword } from "../helpers/authHelper";
import userModels from "../models/user.models";
import jwt from 'jsonwebtoken'
// import { nanoid } from 'nanoid'

// import expressJwt from 'express-jwt'

export const Register = async (req, res) => {
    // console.log(`register end point ==> ${req.body}`)

    const { name, email, password, secret } = req.body;

    // validation 
    if (!name) {
        return res.json({ error: 'Name is required' });
    }
    if (!password || password.length < 6) {
        return res.json({ error: 'Password is required and should be 6 charactor long' });
    }
    if (!secret) {
        return res.json({ error: 'Answer is required' });
    }

    const exist = await userModels.findOne({ email });

    if (exist) {
        return res.json({ error: 'Email is taken' });
    }

    // hashing the password
    const hashed = await hashPassword(password);

    const user = new userModels({ name, email, password: hashed, secret, username: Math.random().toString().slice(2, 9) });

    try {
        await user.save();
        return res.json({ ok: true })
    } catch (err) {
        console.log('failed error', err);
        res.status(500).json({ err: 'Error, Try again' })
    }
};


export const Login = async (req, res) => {


    try {
        const { email, password } = req.body;

        let user = await userModels.findOne({ email });
        if (!user)
            return res.json({ error: 'No user found' });


        // check password 
        const match = await comparePassword(password, user.password);
        if (!match)
            return res.json({ error: 'Credentials is not correct' });

        // create a signed token
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '2d' });

        user.password = undefined
        user.secret = undefined

        res.json({ user, token })

    } catch (error) {
        console.log('failed error', error);
        res.status(500).json({ error: 'Error, Try again' })
    }
}


export const currentUser = async (req, res) => {
    try {
        let user = await userModels.findById(req.user._id);
        res.json({ ok: true })

    } catch (error) {
        console.log('failed error', error);
        res.status(500).json({ error: 'Error, Try again' })
    }
}


export const ForgotPassword = async (req, res) => {
    // console.log(req.body)

    const { email, newPassword, secret } = req.body

    if (!newPassword || newPassword.length < 6) {
        return res.json({ error: 'New Password is required and should be 6 charactor long' });
    }

    if (!secret) {
        return res.json({ error: 'Answer is required' });
    }

    const user = await userModels.findOne({ email, secret });

    if (!user) {
        return res.json({ error: 'No account is found !' });
    }

    try {
        const hashed = await hashPassword(newPassword);

        await userModels.findByIdAndUpdate(user._id, { password: hashed })

        return res.json({ success: "Your password has been reset" })

    } catch (error) {
        console.log('failed error', error);
        res.status(500).json({ error: 'Error, Try again' })
    }
}



export const UpdateProfile = async (req, res) => {

    // console.log(req.body)

    try {

        const data = {};


        if (req.body.username) {
            data.username = req.body.username
        }
        if (req.body.about) {
            data.about = req.body.about
        }
        if (req.body.name) {
            data.name = req.body.name
        }
        if (req.body.isConfirmed) {
            data.isConfirmed = req.body.isConfirmed;
        }

        if (req.body.password) {
            if (req.body.password.length < 6) {
                return res.json({ error: "password required & should be minimum 6 chr long" })
            } else {
                data.password = await hashPassword(req.body.password);
            }
        }

        if (req.body.secret) {
            data.secret = req.body.secret
        }


        if (req.body.image) {
            data.image = req.body.image
        }


        let user = await userModels.findByIdAndUpdate(req.user._id, data, { new: true });
        // console.log('updated user', user)

        user.password = undefined
        user.secret = undefined

        res.json(user);


    } catch (error) {
        if (error.code === 11000) {
            return res.json({ error: "Duplicate error" })
        }
        console.log('failed error', error);
    }
}




export const AdminUpdateProfile = async (req, res) => {

    console.log(req.body, "from 'admin password chanage")

    try {

        const data = {};



        if (req.body.password) {
            if (req.body.password.length < 6) {
                return res.json({ error: "password required & should be minimum 6 chr long" })
            } else {
                data.password = await hashPassword(req.body.password);
            }
        }

        if (req.body.Block) {
            data.Block = req.body.Block
        }

        if (req.body.Role) {
            data.Role = req.body.Role
        }


        let user = await userModels.findByIdAndUpdate(req.body._id, data, { new: true });

        user.password = undefined
        user.secret = undefined

        res.json(user);


    } catch (error) {
        if (error.code === 11000) {
            return res.json({ error: "Duplicate error" })
        }
        console.log('failed error', error);
    }
}




export const FindStudents = async (req, res) => {
    try {

        let user = await userModels.findById(req.user._id);
        console.log("from fonding users")
        // users following ...
        let following = user.following;
        following.push(user._id);

        let students = await userModels.find({ _id: { $nin: following } })
            .select('-password -secret')
            .limit(10);

        // console.log(students)
        res.json(students);

    } catch (error) {
        console.log('failed error', error);
    }
}

// add follow middleWear
export const addFollow = async (req, res, cb) => {
    try {
        const user = await userModels.findByIdAndUpdate(req.body._id, {
            $addToSet: { followers: req.user._id }
        })
        cb();
    } catch (error) {
        console.log('failed error', error);
    }
}

export const UserFollow = async (req, res) => {
    try {
        const user = await userModels.findByIdAndUpdate(req.user._id, {
            $addToSet: { following: req.body._id }
        },
            { new: true }
        ).select('-password -secret')
        res.json(user)
    } catch (error) {
        console.log('failed error', error);
    }
}



export const UserFollowing = async (req, res) => {
    try {
        const user = await userModels.findById(req.user._id);
        const following = await userModels.find({ _id: user.following })
            .limit(100);

        res.json(following)
    } catch (err) {
        console.log(err)
    }
}
// findByIdAndUpdate
export const removeFollow = async (req, res, cb) => {
    try {
        const user = await userModels.findByIdAndUpdate(req.body._id, {
            $pull: { followers: req.user._id }
        })
        cb();
    } catch (error) {
        console.log(error)
    }
}

export const UserUnfollow = async (req, res) => {
    try {
        const user = await userModels.findByIdAndUpdate(req.user._id, {
            $pull: { following: req.body._id }
        }, { new: true });

        res.json(user);
    } catch (error) {
        console.log(error)
    }
}


export const SearcchUser = async (req, res) => {
    const { query } = req.params
    if (!query) return;
    try {

        const user = await userModels.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { username: { $regex: query, $options: 'i' } }
            ]
        }).select('-password -secret');

        res.json(user);

    } catch (error) {
        console.log(error)
    }
}


export const GetUser = async (req, res) => {
    try {
        const user = await userModels.findOne({ username: req.params.username }).select('-password -secret');
        res.json(user);
    } catch (error) {
        console.log(error)
    }
}



export const GetAllUsers = async (req, res) => {
    console.log(req.body.blocked, "from getting all users")
    try {

        const user = await userModels.find().select('-password');
        res.json(user);

    } catch (error) {
        console.log(error)
    }
}



export const GetAllBlockedUsers = async (req, res) => {
    console.log(req.body.blocked, "from getting all users")
    try {

        const user = await userModels.find({ Block: true }).select('-password');
        res.json(user);

    } catch (error) {
        console.log(error)
    }
}



export const GetRequestedUsers = async (req, res) => {
    try {
        const users = await userModels.find({ isConfirmed: 'requested' }).select('-password');

        res.json(users);
        // console.log(users)
    } catch (error) {
        console.log(error)
    }
}




export const Confirmed = async (req, res) => {

    // console.log(req.body)

    try {

        const data = {};
        if (req.body.isConfirmed) {
            data.isConfirmed = req.body.isConfirmed;
        }


        let user = await userModels.findByIdAndUpdate(req.params._id, data, { new: true });

        user.password = undefined
        user.secret = undefined

        res.json(user);
        console.log(user, "from confirmed")


    } catch (error) {
        if (error.code === 11000) {
            return res.json({ error: "Duplicate error" })
        }
        console.log('failed error', error);
    }
}



export const LastWeekBlockedUsers = async (req, res) => {
    try {

        const users = await userModels.find({ Block: true })
        let countsUsers = users.length
        res.json(countsUsers);
        console.log(countsUsers, 'users from last weeks blocked')
    } catch (err) {
        console.log(err)
    }
}


export const LastWeekRequestedUsers = async (req, res) => {
    try {

        const users = await userModels.find({ isConfirmed: "requested" })
        let countsUsers = users.length
        res.json(countsUsers);
        console.log(countsUsers, 'users from last weeks requested')
    } catch (err) {
        console.log(err)
    }
}
