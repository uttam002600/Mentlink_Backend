// require("dotenv").config({ path: "./env" });

import dotenv from "dotenv";
import connectDB from "./db/index.js";

import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8001, () => {
      console.log(`Running server successfully at port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connnecrtion failed !!", err);
  });
