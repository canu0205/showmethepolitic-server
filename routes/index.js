const express = require("express");
const router = express.Router();

const users = require("./users.route");
const bucket = require("./bucket.route");
const clova = require("./clova.route");
const update = require("./update.route");
const read = require("./read.route");
const test = require("./test.route");

router.use("/users", users);
router.use("/bucket", bucket);
router.use("/clova", clova);
router.use("/update", update);
router.use("/read", read);
router.use("/test", test);

module.exports = router;
