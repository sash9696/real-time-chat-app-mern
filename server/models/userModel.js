//schemas

import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: "Available",
    },
    profilePic: {
      type: String,
      default: "https://icon-library.com/images/anonymous-avatar-icon-25.jpg",
    },
    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

//midleware tha can run before saving the user document to the database
//to store password

userSchema.pre("save", async function (next) {
  //this keyword is pointing to document that being saved
  //referst to the instance of userSchema that is currently being saved to the databe

  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.methods.generateAuthToken = async function () {
  try {
    let token = jwt.sign(
      {
        id: this._id,
        email: this.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    return token;
  } catch (error) {
    console.log("Error: While generating Token");
  }
};

const userModel = mongoose.model('User', userSchema);

export default userModel;
