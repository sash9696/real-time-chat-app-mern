import user from "../models/userModel.js";
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';

export const register = async (req, res) => {
  //user.findOne
  const { firstName, lastName, email, password } = req.body;
  // console.log('register',{body: req.body})

  try {
    const existingUser = await user.findOne({ email });

    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    const fullName = `${firstName} ${lastName}`;

    const newUser = new user({ email, password, name: fullName });

    const token = await newUser.generateAuthToken();
    await newUser.save();

    res.json({ message: "success", token: token });
  } catch (error) {
    console.error("Error during register " + error);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  console.log('login',{body: req.body})


  try {
    const validUser = await user.findOne({ email });

    if (!validUser) res.status(200).json({ message: "User does not exist" });

    const isValidPassword = await bcrypt.compare(password, validUser.password);

    if (!isValidPassword) {
      res.status(200).json({ message: "Invalid Credentials" });
    } else {
      const token = await validUser.generateAuthToken();
      await validUser.save();

      res.cookie("userToken", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      //using the cookie to store the token to make it easier client side coe

      res.status(200).json({ token: token, status: 200 });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const validUser = async (req, res) => {
  try {
    const validUser = await user
      .findOne({
        _id: req.rootUserId,
      })
      .select("-password");

    if (!validUser) res.json({ message: "User is not valid" });

    res.status(201).json({
      user: validUser,
      token: req.token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
};

export const logout = (req, res) => {
  req.rootUser.tokens = req.rootUser.tokens.filter((e) => e.token != req.token);
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const selectedUser = await user.findOne({ _id: id }).select("-password");
    res.status(200).json(selectedUser);
  } catch (error) {
    console.error("Error: while getting user by id ", error);
    res.status(500).json({ error: error });
  }
};

export const updateInfo = async (req,res) => {
    const {id} = req.params;
    const {bio , name} = req.body;
    const updatedUser = await user.findByIdAndUpdate(id, {name, bio});
    return updatedUser;
}
export const searchUsers = async (req, res) => {
  // const { search } = req.query;
  const search = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
        ],
      }
    : {};

  const users = await user.find(search).find({ _id: { $ne: req.rootUserId } });
  res.status(200).send(users);
};
export const googleAuth = async (req, res) => {
  try {
    const { tokenId } = req.body;
    const client = new OAuth2Client(process.env.CLIENT_ID);
    const verify = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.CLIENT_ID,
    });
    const { email_verified, email, name, picture } = verify.payload;
    if (!email_verified) res.json({ message: 'Email Not Verified' });
    const userExist = await user.findOne({ email }).select('-password');
    if (userExist) {
      res.cookie('userToken', tokenId, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.status(200).json({ token: tokenId, user: userExist });
    } else {
      const password = email + process.env.CLIENT_ID;
      const newUser = await user({
        name: name,
        profilePic: picture,
        password,
        email,
      });
      await newUser.save();
      res.cookie('userToken', tokenId, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res
        .status(200)
        .json({ message: 'User registered Successfully', token: tokenId });
    }
  } catch (error) {
    res.status(500).json({ error: error });
    console.log('error in googleAuth backend' + error);
  }
};
