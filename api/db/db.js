import mongoose from "mongoose";

export default function connect() {
  if (process.env.NODE_ENV === "development") {
    mongoose.connect(process.env.DB_LOCAL_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
  } else {
    mongoose.connect(
      process.env.DB_LOCAL_URI,
      // process.env.DB_URI_ONLINE,
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }
    );
  }

  const connection = mongoose.connection;
  connection.once("open", () => {
    console.log("DB Connected!");
  });
  connection.on("error", (err) => {
    console.error("Connection failed!", err.message);
  });
}
