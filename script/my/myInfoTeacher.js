var my_teacher = function() {
	var self = this;
	self.ID = ko.observable(0);
	self.DisplayName = ko.observable('请登录');
	self.Photo = ko.observable('../../images/my-default.png');
	self.FavCount = ko.observable(0);
	self.UserID = ko.observable(getLocalItem('UserID'));
	self.UserType = ko.observable(getLocalItem('UserType'));
	
	self.goMyUserAttented = function() {
		common.transfer('../teacher/myUserAttented.html', true, {}, true);
	}
	self.goMyinfo = function() {
		common.transfer('myInfo.html', true, {}, true);
	}
	self.goMoreInfo = function() {
		common.transfer('moreInfo.html', true, {}, true);
	}
	self.goAuth = function() {
		common.transfer('teacherAuth.html', true);
	}
	self.goMyAccount = function() {
		common.transfer('myAccountMain.html', true);
	}
	self.goMessageList = function() {
		common.transfer('messageList.html', true);
	}
	self.goMyAttention = function() {
		common.transfer('myAttention.html', true);
	}
	self.goMyAlbum = function() {
		common.transfer('myAlbum.html', true);
	}
	self.goHelp = function() {
		//reloadThis();
		mui.toast("点击了帮助");
	}
	if (self.UserID() > 0) {
		self.getStudent = function() {
			var ajaxUrl = common.gServerUrl + "API/Account/GetInfo?userid=" + self.UserID() + "&usertype=" + self.UserType();
			mui.ajax(ajaxUrl, {
				dataType: 'json',
				type: 'GET',
				success: function(responseText) {
					//console.log(responseText);
					self.ID(responseText.ID);
					self.DisplayName(responseText.DisplayName);
					if (responseText.Photo)
						self.Photo(common.getPhotoUrl(responseText.Photo));
					self.FavCount(responseText.FavCount);
					//self.UserID(responseText.UserID);
					if (self.DisplayName() == "请登录") {
						mui.alert('还没完善信息哦，点击头像完善信息，马上就去~', '信息不完整', self.goMyinfo());
					}
				}
			})

		}();
	}
	mui.back = function() {
		common.confirmQuit();
	}
}
ko.applyBindings(my_teacher);