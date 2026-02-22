import mongoose from "mongoose";

const connection = {};

async function connectDB() {
    // console.log(process.env.MONGO_URI);

  if (connection.isConnected) {
    return;
  }

  const db = await mongoose.connect(process.env.MONGO_URI, );

  console.log("Database connected :)")

  connection.isConnected = db.connections[0].readyState;
}

export default connectDB;
