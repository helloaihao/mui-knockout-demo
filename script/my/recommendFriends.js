var recommendFriends=function(){
	var shareContent="好好用的app哦";
	var shares = null,bhref = false;
	var shareID="";
	var shardEX="";
	var shareUrl="www.baidu.com";//分享附上的链接，为公司主页，后期填补
	var shareTitle="90%的人不知道的音乐App"//分享内容的标题
	var shareContent="我敢说，你绝对不知道有这么好用的app";//分享的内容
	
	
	var ul = document.getElementById("recommendArray");

	var lis = ul.getElementsByTagName("li");

	for (var i = 0; i < lis.length; i++) {
		lis[i].onclick = function() {
			mui.toast(this.id);
			if (this.id == "weichatFriend") {
				//微信好友
				shareID = "weixin";
				shardEX = "WXSceneSession";
			} else if (this.id == "weichatMoments") {
				//微信朋友圈
				shareID = "weixin";
				shardEX = "WXSceneTimeline";
			} else if (this.id == "weichatMoments") {
				shareID = "qq";

			}
			self.shareAction(shareID, shardEX);
		}

	}
	self.shareAction = function(id, ex) {
		var s = null;
		if (!id || !(s = shares[id])) {
			mui.toast("无效的分享服务！");
			return;
		}
		if (s.authenticated) {
			mui.toast("---已授权---");
			self.shareMessage(s, ex);
		} else {
			mui.toast("---未授权---");
			s.authorize(function() {
				self.shareMessage(s, ex);
			}, function(e) {
				mui.toast("认证授权失败：" + e.code + " - " + e.message);
			});
		}
	}
	
	self.shareMessage = function(s, ex) {
		var msg = {
			content: shareContent,
			extra: {
				scene: ex
			}
		};
		if (bhref) {
			msg.href = shareUrl;
			msg.title = shareTitle;
			msg.content = shareContent;
			msg.thumbs = ["../../images/ewm.png"];
			msg.pictures = ["../../images/ewm.png"];
		} 
		outLine(JSON.stringify(msg));
		s.send(msg, function() {
			mui.toast("分享到\"" + s.description + "\"成功！ ");
		}, function(e) {
			mui.toast("分享到\"" + s.description + "\"失败: " + e.code + " - " + e.message);
		});
	}

}
ko.applyBindings(recommendFriends);