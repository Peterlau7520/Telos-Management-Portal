const express = require('express');
const router = express.Router();
router.use(function (req, res, next) {
  console.log(req.user, "hhhhhhhhhhhhhhh")
  if (!req.user) {
    res.redirect('/login');
  } else {
    next();
  }
});




module.exports = router;
