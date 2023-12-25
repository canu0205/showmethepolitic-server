const express = require("express");
const router = express.Router();

const controller = require("../controllers/test.controller.js");

router.post("/", controller.createTest);

module.exports = router;
