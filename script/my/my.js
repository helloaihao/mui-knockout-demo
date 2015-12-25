var my = function() {
	var self = this;
	self.ID = ko.observable(0);
	self.DisplayName = ko.observable('登录');
	self.Photo = ko.observable('../../images/my-default.png');
	self.Province = ko.observable(''); //省份
	self.City = ko.observable(''); //城市
	self.District = ko.observable(''); //地区
	self.FavCount = ko.observable(0); //关注人数
	self.PhotoCount = ko.observable(0); //照片数量
	self.starCount = ko.observable(0); //星级
	self.UserID = ko.observable(getLocalItem('UserID'));
	self.UserType = ko.observable(getLocalItem('UserType'));
	self.Score = ko.observable(0); //老师得分
	self.auths = ko.observableArray([]); //认证数组
	self.IDAuthApproved = ko.observable(0);
	self.hasNewMessage = ko.observable(false); //有新消息

	self.goMyCollection = function() {
		common.transfer('myCollection.html', true, {}, false, false);
	}
	self.goMyinfo = function() {
		common.transfer('myInfo.html', true, {}, true, false);
	}
	self.goMoreInfo = function() {
		common.transfer('moreInfo.html', false, {}, false);
	}
	self.goAuth = function() {
		var index = plus.webview.getLaunchWebview() || plus.webview.getWebviewById('indexID'); //取消“我”红点
		if (!self.hasNewMessage() && UserType() == common.gDictUserType.teacher && common.gDictAuthStatusType.Authed == IDAuthApproved()) {
			mui.fire(index, 'refreshMessageStatusFalse', {});
		}
		common.transfer('teacherAuth.html', true, {
			authMessage: self.auths()
		}, false, false);
	}
	self.goMyAccount = function() {
		common.transfer('myAccount.html', true, {
			Photo: self.Photo()
		}, true, false);
	}
	self.goMessageList = function() {
		var index = plus.webview.getLaunchWebview() || plus.webview.getWebviewById('indexID'); //取消“我”红点
		if (UserType() == common.gDictUserType.teacher && common.gDictAuthStatusType.Authed == IDAuthApproved()) {
			mui.fire(index, 'refreshMessageStatusFalse', {});
		}
		if (UserType() == common.gDictUserType.teacher && common.gDictAuthStatusType.Authed != IDAuthApproved()) {
			mui.fire(index, 'refreshMessageStatus', {});
		}
		self.hasNewMessage(false); //取消消息列表红点
		var page1 = common.getIndexChild(0); //取消铃铛红点
		if (page1) {
			mui.fire(page1, 'refreshMessageStatusFalse', {});
		}
		common.transfer('messageList.html', true);
	}
	self.goMyAttention = function() {
		common.transfer('myAttention.html', true);
	}
	self.goMyAlbum = function() {
		common.transfer('myAlbum.html', true);
	}
	self.goHelp = function() {
		common.transfer('../my/help.html', false);
	}
	self.goMyOrders = function() { //订单
		common.transfer('myOrders.html', true, {
			Photo: self.Photo()
		});
	}
	self.goMyDownloads = function() { //下载
		common.transfer('../works/mydownloadHeader.html', true);
	}

	self.qrcodeEvent = function() {
		if (self.UserID() > 0) {
			common.transfer("qrcode.html", false, {}, false, true);
		} else {
			mui.toast("亲~登录后才能扫一扫哦")
		}
	}

	self.getInfo = function() {
		var ajaxUrl = common.gServerUrl + "API/Account/GetInfo?userid=" + self.UserID() + "&usertype=" + self.UserType();
		mui.ajax(ajaxUrl, {
			dataType: 'json',
			type: 'GET',
			success: function(responseText) {
				//console.log(responseText);
				self.ID(responseText.ID);
				self.DisplayName(responseText.DisplayName);
				self.Province(responseText.Province);
				self.City(responseText.City);
				self.District(responseText.District);
				if (responseText.PhotoCount)
					self.PhotoCount(responseText.PhotoCount);
				if (responseText.Photo)
					self.Photo(common.getPhotoUrl(responseText.Photo));
				else
					self.Photo('../../images/my-default.png');
				self.FavCount(responseText.FavCount);
				if (responseText.Score)
					self.Score(responseText.Score);
				if (responseText.starCount)
					self.starCount(responseText.Star);
			}
		})
	}

	self.getMyAuth = function() {
		mui.ajax(common.gServerUrl + "API/TeacherAuth?userId=" + getLocalItem('UserID'), {
			dataType: 'json',
			type: "GET",
			success: function(responseText) {
				self.auths(responseText);
				if (responseText && responseText.length > 0) {
					responseText.forEach(function(item) {
						switch (item.AuthType) {
							case common.gDictTeacherAuthType.IDAuth:
								self.IDAuthApproved(item.Approved);
								break;
						}
					});
				}
			}
		})
	}


	mui.plusReady(function() {
		if (self.UserID() > 0) {
			self.getInfo();

			var urlPart = 'modules/student/studentInfo.html?id=';
			if (self.UserType() == common.gDictUserType.teacher) {
				self.getMyAuth();
				urlPart = 'modules/teacher/teacherInfo.html?id=';
			}

			var qrcode = new QRCode(document.getElementById("qrcode"), {
				width: 200, //设置宽高
				height: 200
			});

			qrcode.makeCode(common.gWebsiteUrl + urlPart + self.UserID());

		}
		
		var index = plus.webview.getLaunchWebview() || plus.webview.getWebviewById('indexID'); //取消“我”红点
		if (UserType() == common.gDictUserType.teacher && common.gDictAuthStatusType.Authed != IDAuthApproved()) {
			mui.fire(index, 'refreshMessageStatus', {});
		}
	})

	window.addEventListener('refreshPhotoCount', function(event) {
		self.PhotoCount(event.detail.PhotoCount);
	});
	
	window.addEventListener('refreshMyinfo', function(event) {
		if (event.detail.userScore != "") {
			self.Score(event.detail.userScore);
		}
		if (event.detail.displayName != "") {
			self.DisplayName(event.detail.displayName);
		}
		if (event.detail.imgPath != "") {
			self.Photo(event.detail.imgPath);
		}
	});
	window.addEventListener("refreshAuth", function(event) {
		if (event.detail.auths && event.detail.auths.length > 0) {
			self.auths(event.detail.auths);
			self.auths().forEach(function(item) {
				switch (item.AuthType) {
					case common.gDictTeacherAuthType.IDAuth:
						self.IDAuthApproved(item.Approved);
						break;
				}
			});
		}
	});

	self.refreshMessageNotice = function(status) {
		self.hasNewMessage(status);
	}
	window.addEventListener("refreshMessageStatus", function(event) {
		self.refreshMessageNotice(true);
	});
	window.addEventListener("refreshMessageStatusFalse", function(event) {
		self.refreshMessageNotice(false);
		var index = plus.webview.getLaunchWebview() || plus.webview.getWebviewById('indexID'); //取消“我”红点
		if (UserType() == common.gDictUserType.teacher && common.gDictAuthStatusType.Authed == IDAuthApproved()) {
			mui.fire(index, 'refreshMessageStatusFalse', {});
		}
	});
	mui.back = function() {
		var qrp = document.getElementById("qrcodePopover");
		if (qrp.className.indexOf("mui-active") > 0) {
			mui('#qrcodePopover').popover('toggle');
		} else {
			common.confirmQuit();
		}
	}
}
ko.applyBindings(my);