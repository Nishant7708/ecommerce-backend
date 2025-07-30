
import mongoose from "mongoose";
import chalk from "chalk";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(chalk.green.italic(
      `MongoDB Connected to ${conn.connection.name} at ${conn.connection.host} : ${conn.connection.port}`
    ));
  } catch (error) {
    console.log(chalk.red(`MongoDB Connection Failed`, error.message));

  }
};
export default connectDB;
