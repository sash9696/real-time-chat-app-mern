

import express, { request } from 'express';

const router = express.Router();
import {accessChats,fetchAllChats,createGroup,renameGroup,addToGroup ,removeFromGroup} from '../controllers/chatControllers.js'

import { Auth } from '../middleware/user.js';


router.post('/', Auth, accessChats);
router.get('/', Auth, fetchAllChats);

router.post('/group', Auth, createGroup);
router.patch('/group/rename', Auth, renameGroup);

//add something to the grp
router.patch('/groupAdd', Auth, addToGroup);
router.patch('/groupRemove', Auth, removeFromGroup);

router.delete('removeUser', Auth)

// user = {
//     name:'john',
//     age:20
// }

// if u r changing soethign lets say name or age patch request
// if u r replacing this with new object put req



export default router;