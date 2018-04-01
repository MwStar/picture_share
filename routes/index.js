var express = require('express');
var router = express.Router();
var models  = require('../models/index');
var User    = models.User;

/* GET home page. */
/*router.get('/', function(req, response, next) {
  console.log("请求--"+req);*/
	/*userModel.create({userName:'zfpx',password:11},function(err,doc){
        if(err)console.log(err);
        else
          console.log("create----"+doc);// doci
    });*/
 /* var user = new User({
    loginname:'dddd',
    pass:'111111',
  })
  user.save(function(err,res){
    if (err){console.log("Error"+err);}
    else{console.log("新的用户："+user);}
  })*/
	/*topicModal.find({}, (err, result, res) => {
            if(err) return console.log(err)
            else {
            	console.log("result---"+result)
            	response.render('index', { title: result })
            }
     })*/
//});

module.exports = router;
