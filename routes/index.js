const express = require('express');
const router = express.Router();
router.use(function (req, res, next) {
  console.log(req.account, "hello")
  if (req.user == undefined) {
   /* res.redirect('/login');*/
    next();
  } else {
    next();
  }
});




module.exports = router;
