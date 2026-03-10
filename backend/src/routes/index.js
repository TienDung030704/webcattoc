const express = require("express");
const { readdirSync } = require("fs");

const router = express.Router();
const postfix = ".route.js";

readdirSync(__dirname)
  .filter((_name) => _name.endsWith(postfix))
  .forEach((fileName) => {
    const resource = fileName.replace(postfix, "");
    router.use(`/${resource}`, require(`./${fileName}`));
  });

module.exports = router;
