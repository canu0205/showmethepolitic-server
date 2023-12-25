var express = require("express");
var router = express.Router();

const users = require("./users.route");
const bucket = require("./bucket.route");
const clova = require("./clova.route");
const update = require("./update.route");
const test = require("./test.route");

router.use("/users", users);
router.use("/bucket", bucket);
router.use("/clova", clova);
router.use("/update", update);
router.use("/test", test);

/* GET home page. */
// router.get("/", function (req, res, next) {
//   res.render("index", { title: "Express" });
// });

module.exports = router;
