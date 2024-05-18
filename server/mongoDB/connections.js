
import mongoose from "mongoose";


const mongoDBConnect = () => {
    try {
        mongoose.connect(process.env.URL);
        console.log("MongoDB - Connected");
        
    } catch (error) {
        console.log("Error - MongoDB Connection ", error);
    }

};

export default mongoDBConnect;