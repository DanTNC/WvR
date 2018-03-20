var express = require('express');
var path = require('path');
var router = express.Router();

router.get('/:room', function(req, res) {
	console.log("[GET] '/play/'" + req.params.room);
	res.sendFile(path.resolve(__dirname, '../view/play.html'));
	console.log(path.resolve(__dirname, '../view/play.html'));
});

module.exports = router;