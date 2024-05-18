import Chat from "../models/chatModel.js";
import user from "../models/userModel.js";

export const accessChats = async (req, res) => {
  // scenario where root user wants to access the chat history with another user
  //that is user Id

  const { userId } = req.body;

  //ashish is loggoin in tha app => rootuser
  //priyanka, pradyumna => userId

  if (!userId) res.send({ message: "Provide User's Id" });

  //if the chat exists
  //userId, rootuserid
  //the user doing login sign up is rootuserid
  //

  let chatExists = await Chat.find({
    isGroup: false,

    $and: [
      { users: { $elemMatch: { $eq: userId } } }, //this condition checks if users array contains an element that exactly matches the userId
      { users: { $elemMatch: { $eq: req.rootUserId } } }, //this condition checks if users array contains an element that exactly matches the rootUserId
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  //result of this query
  //this query returns the chat documents that match specific conditions
  //each chat document will have users field populated with actual user objects(excluding password) instaed of just user ids
  //additionally latest message field of chat document will be populated with the actual messafe object

  
  chatExists = await userId.populate(chatExists, {
    path: "latestMessage.sender",
    select: "name email profilePic",
  });

  if (chatExists.length > 0) {
    res.status(200).send(chatExists[0]);
  } else {
    //create a new chat if no existing is found

    let data = {
      chatName: "sender",
      users: [userId, req.rootUserId],
      isGroup: false,
    };

    try {
      const newChat = await Chat.create(data);

      const chat = await Chat.find({ _id: newChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(chat);
    } catch (error) {
      res.status(500).json(error);
    }
  }
};

export const fetchAllChats = async (req, res) => {

    try {

        const chats = await Chat.find({
            users: {$elemMatch: {$eq: req.rootUserId}}
        })
        .populate('users')
        .populate('latestMessage')
        .populate('groupAdmin')
        .sort({updatedAt: -1}); //ordered based on updated at with most recently updated documents appearing in the chats

        const finalChats = await user.populate(chats, {
            path:'latestMessage.sender',
            select: 'name email, profilePic'
        });

        res.status(200).json(finalChats);

        
    } catch (error) {
        res.status(500).send(error);
        console.log('error while fetching all chats', error)
    }
};

export const createGroup = async (req, res) => {
    const {chatName, users} = req.body;

    if(!chatName || !users){
        res.status(400).json({
            message:'Please fill all the fields'
        });
    };
    console.log('parsedUsers',{users})

    const parsedUsers = JSON.parse(users);

    if(parsedUsers.length < 2){
        res.status(400).json({
            message:'Group should contain more than 2 users'
        });
    };
    parsedUsers.push(req.rootUser);

    try {

        const chat = await Chat.create({
                chatName: chatName,
                users: parsedUsers,
                isGroup:true,
                groupAdmin: req.rootUserId,
        });

        console.log('chat007',{chat} )

    
        const createdChat  = await Chat.findOne({_id: chat._id})
            .populate('users', '-password')
            .populate('groupAdmin', '-password');
        // console.log('createdChat',{createdChat})
        res.send(createdChat);
        
    } catch (error) {
        console.log('createdChatError; ',error)
        res.sendStatus(500);
    }
};

export const renameGroup = async (req, res) => {
    const {chatId, chatName} = req.body;

    console.log('renameGroup',{chatId, chatName})
    if(!chatId || !chatName){
        res.status(400).send('Provide Chat id and Chat name')
    };

    try {
        const chat  = await Chat.findByIdAndUpdate(chatId, {
            $set: {chatName},
        },{ new: true })
        .populate('users', '-password')
        .populate('groupAdmin', '-password');

        console.log('renameGroup',{chat})

        if(!chat) res.status(404);
        res.status(200).send(chat);
        
    } catch (error) {
        console.log('Rename Group Error: ',error)
        res.status(500).send(error);

    }
};

export const addToGroup = async (req, res) => {
    const {userId, chatId} = req.body;

    const existing = await Chat.findOne({_id: chatId});

    if(!existing.users.includes(userId)){
        const chat = await Chat.findByIdAndUpdate(chatId, {
            $push: {users: userId}
        })
        .populate('groupAdmin', '-password')
        .populate('users', '-password');
         
        if(!chat) res.status(404);
        res.status(200).send(chat);
    }else{
        res.status(409).send('user already exists');
    }
};

export const removeFromGroup = async (req, res) => {
    const {userId, chatId} = req.body;

    const existing = await Chat.findOne({_id: chatId});

    if(existing.users.includes(userId)){
        const chat = await Chat.findByIdAndUpdate(chatId, {
            $pull: {users: userId},
            
        },{ new: true })
        .populate('groupAdmin', '-password')
        .populate('users', '-password');
         
        console.log('removeFromGroup',{chat})
        if(!chat) res.status(404);
        res.status(200).send(chat);
    }else{
        res.status(409).send('user does not exists');
    }
};
