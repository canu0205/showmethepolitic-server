const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PoliticianSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  party: String,
  position: String,
  email: String,
  image: String,
  opinions: [
    {
      issue_id: {
        type: Schema.Types.ObjectId,
        ref: "Issue",
      },
      opinion: String,
    },
  ],
});

module.exports = mongoose.model("Politician", PoliticianSchema);
