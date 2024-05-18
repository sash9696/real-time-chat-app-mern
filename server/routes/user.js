
import express from "express";
import { login, register,validUser, logout, getUserById, updateInfo,searchUsers } from "../controllers/user.js";
import {Auth} from '../middleware/user.js';

const router = express.Router();


router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/valid', Auth, validUser);

//auth and validUser works together
//client makes  get req to auth/valid
//the req first goes to ehere AUth
//if AUth successfully authnticates the request
//(valid token, user data is retrieved)
//it populates the necessary autheication related properties for ex re.rootUser, req.token
//then control is passed to the validUser controller which then use this req object to pergorm its logic and functinality
//and also it generates a response based on the aunthenticated user's context;



router.get('/auth/logout', Auth, logout);
// router.post('/api/google', googleAuth);
router.get('/api/user?',Auth, searchUsers);
router.get('/api/users/:id',Auth, getUserById);
router.patch('/api/users/update/:id', Auth, updateInfo);


export default router;

