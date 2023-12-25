const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TestSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: String,
});

module.exports = mongoose.model("Test", TestSchema);
