require("dotenv").config();
require("module-alias/register");
require("./polyfill");

const express = require("express");
const cors = require("cors");
const passport = require("passport");
const cookieParser = require("cookie-parser");

const rootRouter = require("@/routes");
const responseHandle = require("@/middleware/responseHandle");
const notFoundHandle = require("@/middleware/notFoundHandle");

const app = express();
const port = 3000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use("/uploads", express.static("uploads"));
app.use(responseHandle);

// Router
app.use("/api", rootRouter);

// Error handle
app.use(notFoundHandle);

app.listen(port, () => {
  console.log(`Demo app listening on port ${port}`);
});
