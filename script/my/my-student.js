var my_student = function() {
	var self = this;
	self.ID = ko.observable(0);
	self.DisplayName = ko.observable('请登录');
	self.Photo = ko.observable('../../images/my-default.jpg');
	self.FavCount = ko.observable(0);
	self.UserID = ko.observable(getLocalItem('UserID'));
	self.UserType = ko.observable(getLocalItem('UserType'));

	self.goMyinfo = function() {
		common.transfer('my-info.html', true);		
	}
	self.goMoreInfo=function(){
		common.transfer('moreInfo.html');
	}

	if (self.UserID() > 0) {
		self.getStudent = function() {
			//使用mui
			mui.ajax(common.gServerUrl + "API/Account/GetInfo?userid=" + self.UserID() + "&usertype=" + self.UserType(), {
				dataType: 'json',
				type: 'GET',
				success: function(responseText) {
					self.ID(responseText.ID);
					self.DisplayName(responseText.DisplayName);
					if (responseText.Photo)
						self.Photo(responseText.Photo);
					self.FavCount(responseText.FavCount);
					//self.UserID(responseText.UserID);
				}
			})
		}();
	}
}
ko.applyBindings(my_student);