var my_student = function() {
	var self = this;
	self.ID = ko.observable(0);
	self.DisplayName = ko.observable('请登录');
	self.Photo = ko.observable('../../images/my-default.jpg');
	self.FavCount = ko.observable(0);
	self.UserID = ko.observable(getLocalItem('UserID'));
	self.UserType = ko.observable(getLocalItem('UserType'));

	self.goMyinfo = function() {
		common.transfer('myInfo.html', true);
	}
	self.goMoreInfo=function(){
		common.transfer('moreInfo.html');
	}
	self.goMyOrders = function(){
		common.transfer('myOrders.html', true);
	}
	self.goMessageList = function(){
		common.transfer('messageList.html', true);
	}
	self.goMyAttention = function(){
		common.transfer('myAttention.html', true);
	}

	if (self.UserID() > 0) {
		self.getStudent = function() {
			var ajaxUrl = common.gServerUrl + "API/Account/GetInfo?userid=" + self.UserID() + "&usertype=" + self.UserType();
			
			//console.log(ajaxUrl);
			mui.ajax(ajaxUrl, {
				dataType: 'json',
				type: 'GET',
				success: function(responseText) {
					//console.log(responseText);
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