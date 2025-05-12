import mongoose from "mongoose";
import 'dotenv/config'

async function connect() {
    mongoose
      .connect(process.env.DB_URI)
      .then(() => console.log("mongoDB is connected!"))
      .catch((e) => console.log(e));
  }
  
  export default connect