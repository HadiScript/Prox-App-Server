import express from 'express';
import {
    Register,
    Login,
    currentUser,
    ForgotPassword,
    UpdateProfile,
    FindStudents,
    UserFollow,
    addFollow,
    UserFollowing,
    UserUnfollow,
    removeFollow,
    SearcchUser,
    GetUser,
    GetRequestedUsers,
    Confirmed,
    GetAllUsers,
    AdminUpdateProfile,
    GetAllBlockedUsers,
    LastWeekBlockedUsers,
    LastWeekRequestedUsers,
    // RemoveUser
} from '../controller/authContrl';
import { isAdmin, reqSignIn } from '../middlewears/authMiddlewears';
const router = express.Router();


router.post('/register', Register);
router.post('/login', Login);
router.post('/forgot-password', ForgotPassword);
router.get('/current-user', reqSignIn, currentUser);
router.put('/update-profile', reqSignIn, UpdateProfile);

router.get('/find-students', reqSignIn, FindStudents);
router.put('/user-follow', reqSignIn, addFollow, UserFollow);
router.get('/user-following', reqSignIn, UserFollowing);
router.put('/user-unfollow', reqSignIn, removeFollow, UserUnfollow);
router.get('/search-user/:query', SearcchUser);
router.get('/user/:username', GetUser);
router.get('/users', reqSignIn, GetAllUsers);


// admin current
router.get(`/current-admin`, reqSignIn, isAdmin, currentUser);

// admins
router.get('/all-requested-users', reqSignIn, isAdmin, GetRequestedUsers);
router.put('/admin/confirm-user/:_id', reqSignIn, isAdmin, Confirmed);

router.get('/admin/all-user', reqSignIn, isAdmin, GetAllUsers);
router.get('/admin/all-blocked-user', reqSignIn, isAdmin, GetAllBlockedUsers);
router.put('/admin/change-user-password', reqSignIn, isAdmin, AdminUpdateProfile);



// having middlewear that remove all the post of this user first
// router.delete('/admin/remove-user', reqSignIn, isAdmin, RemoveUser);

// getting last week posts
router.get('/last-week/blocked/users', reqSignIn, isAdmin, LastWeekBlockedUsers)
router.get('/last-week/requested/users', reqSignIn, isAdmin, LastWeekRequestedUsers)



export default router;