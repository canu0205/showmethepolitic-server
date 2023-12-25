const Test = require("../models/test.model");

module.exports = {
  createTest: async (req, res, next) => {
    try {
      const { title, content } = req.body;
      const test = new Test({ title, content });
      await test.save();
      res.status(201).json(test);
    } catch (err) {
      next(err);
    }
  },
};
