const Issue = require("../models/issue.model");
const Politician = require("../models/politician.model");

module.exports = {
  updateIssue: async (req, res, next) => {
    try {
      const { title, content, politicians } = req.body;
      const issue = new Issue({ title, content });
      await issue.save();

      politicians.map(async (politician) => {
        const { name, party, position, image } = politician;
        const newPolitician = new Politician({
          name,
          party,
          position,
          image,
          issue_id: issue._id,
        });
        await newPolitician.save();
        return newPolitician;
      });

      res.status(201).json({ issue, politicians });
    } catch (err) {
      next(err);
    }
  },

  updatePolitician: async (req, res, next) => {
    try {
      const { name, party, position, image } = req.body;
      const politician = new Politician({
        name,
        party,
        position,
        image,
      });
      await politician.save();
      res.status(201).json({ issue, politician });
    } catch (err) {
      next(err);
    }
  },
};
