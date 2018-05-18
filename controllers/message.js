
var Message    = require('../proxy').Message;
var eventproxy = require('eventproxy');
var authMiddleWare = require('../middlewares/auth');

exports.index = function (req, res, next) {
  const decoded = authMiddleWare.verify_token(req.headers.authorization);
  const user_id = decoded.iss;
  var ep = new eventproxy();
  ep.fail(next);
  ep.all('has_read_messages', 'hasnot_read_messages', function (messages_read, messages_unread) {
    res.send({status:0, message:"success",data:{messages_read, messages_unread}});
  });

  ep.all('has_read', 'unread', function (has_read, unread) {
    [has_read, unread].forEach(function (msgs, idx) {
      var epfill = new eventproxy();
      epfill.fail(next);
      epfill.after('message_ready', msgs.length, function (docs) {
        docs = docs.filter(function (doc) {//过滤掉is_invalid=true的消息，is_invalid=true表示没有此摄影师或者回复被删除或者此图片被删除
          return !doc.is_invalid;
        });
        ep.emit(idx === 0 ? 'has_read_messages' : 'hasnot_read_messages', docs);
      });
      msgs.forEach(function (doc) {
        Message.getMessageRelations(doc, epfill.group('message_ready'));
      });
    });
    
    //Message.updateMessagesToRead(user_id, unread);
  });

  Message.getReadMessagesByUserId(user_id, ep.done('has_read'));
  Message.getUnreadMessageByUserId(user_id, ep.done('unread'));
};

//单条消息设置为已读
exports.read = function (req, res, next) {
  const id = req.query.id;

  Message.updateOneMessageToRead(id, function(err, message){
  	if (err) {
          return next(err);
        }
    res.send({status:0, message:"success",data:{}});
  });
};

//所有消息设置为已读
exports.allread = function (req, res, next) {
	const message = req.body.message;
	const decoded = authMiddleWare.verify_token(req.headers.authorization);
  	const user_id = decoded.iss;
  Message.updateMessagesToRead(user_id, message, function(err, message){
  	if (err) {
          return next(err);
        }
    res.send({status:0, message:"success",data:{}});
  });
};

