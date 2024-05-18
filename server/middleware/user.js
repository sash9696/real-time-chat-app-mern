import user from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const Auth = async (req,res,next) => {

    //authenticating incoming requests
    //any req made to auth/valid it must first pass to this authentication process

    //so for any reason it fails
    //we send back invalid token response

    try {
        // let token = req.headers.authorization.spli(' ')[0];
        //when u r browser
        // let token = req.headers.authorization.split(' ')[1];
        let token = req.headers.authorization;

        //using postman

        console.log('token',{token:req.headers.authorization})

        if(token.length < 500){
            console.log('Auth',{token})

            const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
            const rootUser = await user
                .findOne({_id: verifiedUser.id})
                .select('-password');
            req.token = token;
            req.rootUser = rootUser;
            req.rootUserId = rootUser._id;
        }else{
            let data = jwt.decode(token);
            req.rootUserEmail = data.email;
            const googleUser = await user.findOne({email: req.rootUserEmail}).select('-password');
            req.rootUser = googleUser;
            req.token = token;
            req.rootUserId = googleUser._id;
        }

        next();

    } catch (error) {
        console.log('Auth Error: ',error)
        res.json({ message: "User is not valid" })
    }
}