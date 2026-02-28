require("dotenv").config();
require("module-alias/register");
require("./polyfill");

const express = require("express");
const cors = require("cors");

const rootRouter = require("@/routes");
const notFoundHandle = require("@/middleware/notFoundHandle");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Router
app.use("/api", rootRouter);

// Error handle
app.use(notFoundHandle);

app.listen(port, () => {
  console.log(`Demo app listening on port ${port}`);
});
