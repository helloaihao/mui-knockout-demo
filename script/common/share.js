var Share = Share || {};
var shares = null;
var share_img = ''; //分享显示图片
var share_thumb_img = '' //缩略图
var share_content = ''; //分享内容
var share_href = ''; //分享链接
var share_title = ''; //分享标题

/**
 * 打开分享操作列表
 * @param {Object} shareTypeID 类型id 必填
 * @param {Object} shareTitle 标题 必填
 * @param {Object} shareContent 内容 必填
 * @param {Object} shareImg 图片 必选 可以本地路径可以网络路径，本地路径需为绝对路径 
 * @param {Object} shareURL 链接 必填,格式:'http://linkeol.com'
 */

Share.sendShare = function(shareTypeID, shareTitle, shareContent, shareURL, shareImg) {
	Share.updateSerivces();
	share_title = shareTitle;
	share_content = shareContent;
	
	if (shareImg == '') {
		share_img = ["_www/images/logo.png"];
		share_thumb_img = ["_www/images/logo.png"];
	} else if (shareImg.indexOf("http") >= 0) {
		plus.downloader.createDownload(shareImg, {
			filename: "_images/share/"
		}, function(d, status) {
			if (status == 200) {
				shareLocalImg = plus.io.convertLocalFileSystemURL(d.filename);
				share_img = [shareLocalImg];
				share_thumb_img = [shareLocalImg];
			} else {
				//console.log("下载失败！");
				share_img = ["_www/favicon.ico"];
				share_thumb_img = ["_www/favicon.ico"];

			}
		}).start();
	} else {
		share_img = shareImg;
		share_thumb_img = shareImg;
	}
	share_href = shareURL;
	if (share_href == '') {
		share_bhref = false;
	} else {
		share_bhref = true;
	}
	Share.shareShow(shareTypeID);
}

/**
 * ☆重要：需要在plusready配置此方法☆
 * 更新/初始化分享服务
 * 
 */
Share.updateSerivces = function() {
		plus.share.getServices(function(s) {
			shares = {};
			for (var i in s) {
				var t = s[i];
				shares[t.id] = t;
			}
		}, function(e) {
			console.log("获取分享服务列表失败：" + e.message);
		});
	}
	/**
	 * 分享类型
	 * @param {String} shareTypeID
	 */
Share.shareShow = function(shareTypeID) {
		var ids = [{
			shareID: "sinaWeibo",
			id: "sinaweibo"
		}, {
			shareID: "weichatFriend",
			id: "weixin",
			ex: "WXSceneSession"
		}, {
			shareID: "weichatMoments",
			id: "weixin",
			ex: "WXSceneTimeline"
		}, {
			shareID: "qqFriend",
			id: "qq"
		}];
		for (var i in ids) {
			if (ids[i].shareID == shareTypeID) {
				Share.shareAction(ids[i].id, ids[i].ex);
			}
		}
	}
	/**
	 * 分享操作
	 * @param {Object} id
	 */
Share.shareAction = function(id, ex) {
		var s = null;
		if (!id || !(s = shares[id])) {
			mui.toast("无效的分享服务！");
			return;
		}
		if (s.authenticated) {
			Share.shareMessage(s, ex);
		} else {
			s.authorize(function() {
				Share.shareMessage(s, ex);
			}, function(e) {
				mui.toast("认证授权失败：" + e.code + " - " + e.message);
			});
		}
	}
	/**
	 * 发送分享消息
	 * @param {plus.share.ShareService} s
	 * 
	 */
Share.shareMessage = function(s, ex) {
	var msg = {
		extra: {
			scene: ex
		}
	};
	msg.href = share_href;
	msg.content = share_content;
	msg.title = share_title;
	msg.thumbs = share_thumb_img;
	msg.pictures = share_img;

	s.send(msg, function() {
		console.log("分享到\"" + s.description + "\"成功，返回应用 "); //分享给qq好友，微信好友如果不返回应用，无法监听到分享成功回调
	}, function(e) {
		console.log("分享到\"" + s.description + "\"失败！ " + e.code + " - " + e.message);
	});
}