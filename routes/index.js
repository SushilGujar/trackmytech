var express = require('express');
var router = express.Router();
var request = require('request');
// default route
router.all('/', function(req, res) {
    res.render('index');
});
// route for user
router.post('/user', function(req, res) {
    console.log('Phone', req.body.phone);
    res.render('trackmytech');
});
module.exports = router;
