import express from 'express';
import {
    CreatePost,
    UploadImage,
    PostByUser,
    PostDetails,
    UpdatePost,
    DeletePost,
    NewsFeed,
    LikePost,
    UnlikePost,
    AddComment,
    RemoveComment,
    TotalPost,
    Posts,
    ReportHandler,
    gettingAllReportedPosts,
    LastWeekPosts,
    LastWeekPostsBlock
} from '../controller/postCntrl';
import { reqSignIn, canEditDelete, isAdmin } from '../middlewears/authMiddlewears';
const router = express.Router();


import formidable from 'express-formidable';


router.post('/create-post', reqSignIn, CreatePost);
router.post('/upload-image',
    reqSignIn,
    formidable({ maxFileSize: 5 * 1024 * 1024 }),
    UploadImage
);

router.get('/users-post', reqSignIn, PostByUser);
router.get('/user-post/:_id', reqSignIn, PostDetails);
router.put('/update-post/:_id', reqSignIn, canEditDelete, UpdatePost);
router.delete('/delete-post/:_id', reqSignIn, canEditDelete, DeletePost);

// news-feed
router.get('/news-feed/', reqSignIn, NewsFeed);


// like & dislike
router.put(`/like-post`, reqSignIn, LikePost);
router.put(`/unlike-post`, reqSignIn, UnlikePost);
// comments 
router.put(`/add-comment`, reqSignIn, AddComment);
router.put(`/remove-comment`, reqSignIn, RemoveComment);

router.get('/total-post', TotalPost)


router.get('/posts', Posts);

// admins
router.delete('/admin/delete-post/:_id', reqSignIn, isAdmin, DeletePost);

// admin remove comments 
// put req
router.put('/admin/remove-comment/', reqSignIn, isAdmin, RemoveComment);
router.put('/report-post/:id', reqSignIn, isAdmin, ReportHandler);
router.get('/all-report-posts', reqSignIn, isAdmin, gettingAllReportedPosts);
// report-post/${post._id


// getting last week posts
router.get('/last-week/posts', reqSignIn, isAdmin, LastWeekPosts)
router.get('/last-week/reported/posts', reqSignIn, isAdmin, LastWeekPostsBlock)


export default router;