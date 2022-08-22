import postModels from "../models/post.models"

import cloudinary from 'cloudinary'
import userModels from "../models/user.models";
cloudinary.config({
    cloud_name: 'dn8eat7qp',
    api_key: '373842539682416',
    api_secret: 'fpSKVj04tZYQlxw0AAtN0SU2ObY'
})

export const CreatePost = async (req, res) => {
    // console.log(req.body)
    const { content, image } = req.body;
    if (!content) {
        return res.json({ error: "Please Write Somethings" })
    }


    try {
        const post = new postModels({ content, image, postedBy: req.user._id })
        post.save();
        res.json(post)

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server Error" })
    }
}

export const UploadImage = async (req, res) => {
    // console.log(req.files)


    try {

        const result = await cloudinary.uploader.upload(req.files.image.path);
        // console.log('url', result);
        res.json({
            url: result.secure_url,
            public_id: result.public_id
        })


    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server Error" })
    }
}


export const PostByUser = async (req, res) => {
    // console.log(req.files)


    try {

        // const posts = await postModels.find({ postedBy: req.user._id })
        const posts = await postModels.find()
            .populate(
                'postedBy', '_id name image'
            ).sort({ createdAt: -1 }).limit(10)

        // console.log(posts)
        res.json(posts)

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server Error" })
    }
}


export const PostDetails = async (req, res) => {


    try {

        const post = await postModels.findById(req.params._id)
            .populate('postedBy', '_id name image')
            .populate('comments.postedBy', '_id name image')

        // console.log(post)
        res.json(post)

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server Error" })
    }

}

export const UpdatePost = async (req, res) => {

    // console.log(req.body)

    try {
        const post = await postModels.findByIdAndUpdate(req.params._id, req.body, { new: true })

        // // console.log(post)
        res.json(post)

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server Error" })
    }
}


export const DeletePost = async (req, res) => {

    // console.log(req.body)

    try {
        const post = await postModels.findByIdAndDelete(req.params._id)

        // remove the image from cloudinary
        if (post.image && post.image.public_id) {
            const image = await cloudinary.uploader.destroy(post.image.public_id);

        }

        res.json({ ok: true })

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server Error" })
    }
}



export const NewsFeed = async (req, res) => {
    try {

        const user = await userModels.findById(req.user._id);
        let following = user.following;
        following.push(req.user._id);

        // pagination
        // const currentPage = req.params.page || 3;
        // const perPage = 3;

        const posts = await postModels.find({ postedBy: { $in: following } })
            .populate('postedBy', '_id name image')
            .populate('comments.postedBy', '_id name image')
            .sort({ createdAt: -1 })
            .limit(10)


        console.log(posts, "post tht send")
        console.log(req.params.page, "pages")
        return res.json(posts)


    } catch (error) {
        console.log(error)
    }
}



export const LikePost = async (req, res) => {
    try {
        // console.log(req.body);
        const post = await postModels.findByIdAndUpdate(req.body._id, {
            $addToSet: { likes: req.user._id }
        }, { new: true });

        res.json(post);

    } catch (error) {
        console.log(error)
    }
};



export const UnlikePost = async (req, res) => {
    try {
        // console.log(req.body);
        const post = await postModels.findByIdAndUpdate(req.body._id, {
            $pull: { likes: req.user._id }
        }, { new: true });

        res.json(post);
    } catch (error) {
        console.log(error)
    }
};


export const AddComment = async (req, res) => {
    try {
        const { postId, comment } = req.body;
        const post = await postModels.findByIdAndUpdate(postId, {
            $push: { comments: { text: comment, postedBy: req.user._id } }
        },
            { new: true }
        )
            .populate('postedBy', '_id name image')
            .populate('comments.postedBy', '_id name image')

        res.json(post);

    } catch (error) {
        console.log(error)
    }
}



export const RemoveComment = async (req, res) => {
    try {
        const { postId, comment } = req.body;
        const post = await postModels.findByIdAndUpdate(postId, {
            $pull: { comments: { _id: comment._id } }
        },
            { new: true }
        );

        res.json(post);
    } catch (error) {
        console.log(error)
    }
}


export const TotalPost = async (req, res) => {
    try {
        const total = await postModels.find().estimatedDocumentCount();
        res.json(total)
    } catch (error) {
        console.log(error)
    }
}


export const Posts = async (req, res) => {
    try {
        const posts = await postModels.find({ Reported: false })
            .populate('postedBy', '_id name image')
            .populate('comments.postedBy', '_id name image')
            .sort({ createdAt: -1 })
            .limit(15);

        res.json(posts)

    } catch (error) {
        console.log(error)
    }
}


export const ReportHandler = async (req, res) => {
    try {

        const post = await postModels.findOneAndUpdate({ _id: req.params.id },
            { Reported: true },
            { new: true })
        res.json(post);

    } catch (err) {
        console.log(err)
    }
}


export const gettingAllReportedPosts = async (req, res) => {
    try {

        const posts = await postModels.find({ Reported: true })
        res.json(posts);
        // console.log(posts, 'posts')
    } catch (err) {
        console.log(err)
    }
}

export const LastWeekPosts = async (req, res) => {
    try {

        const posts = await postModels.find(
            {
                createdAt: {
                    $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000)
                }
            }
        ).estimatedDocumentCount()
        res.json(posts);
        // console.log(posts, 'posts from last weeks')
    } catch (err) {
        console.log(err)
    }
}


export const LastWeekPostsBlock = async (req, res) => {
    try {

        const posts = await postModels.find(
            { Reported: true }
        )

        let postCount = posts.length
        res.json(postCount);
        // console.log(posts, 'posts from last weeks reported')
    } catch (err) {
        console.log(err)
    }
}
