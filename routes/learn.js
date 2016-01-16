var express = require('express'),
	router = express.Router();


router.get('/', function(req, res, next){
	res.render('learn');
});

router.get('/lessons', function(req, res, next){
	req.app.db.model.Learn
		.find({})
		.exec(function(err, lessons){
			res.send({
				lessons: lessons
			});
		});
});

router.get('/lessons/:id', function(req, res, next){
	req.app.db.model.Learn
		.findOne({ _id: req.params.id })
		.exec(function(err, lesson){
			res.send({
				lesson: lesson
			});
		});
});

router.post('/lessons', function(req, res, next){
	var lesson = req.app.db.model.Learn;
	
	var doc = new lesson({
		lessonName: req.body.lessonName,
		lessonUrl: req.body.lessonUrl,
		lessonLearn: req.body.lessonLearn
	});

	doc.save(function(err, doc, numberAffected){
		res.send(doc);
	});
});

router.put('/lessons/:id', function(req, res, next){
	var doc = {
		lessonName: req.body.lessonName,
		lessonUrl: req.body.lessonUrl,
		lessonLearn: req.body.lessonLearn		
	};

	req.app.db.model.Learn
		.findOneAndUpdate({ _id: req.params.id }, doc,
			function(err, doc){
				res.send(doc);
			});
});

router.delete('/lessons/:id', function(req, res, next){
	req.app.db.model.Learn
		.findByIdAndRemove(req.params.id,
			function(err, lesson){
				res.send(lesson);
			});
});

module.exports = router;
