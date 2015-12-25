var myAttention = function() {
	var self = this;
	self.AttentionList = ko.observableArray([]); //关注我的用户列表
	self.FavUsers = ko.observableArray([]); //我关注的用户列表（老师或学生）
	self.PageWorks = ko.observable(1); //作品页码
	self.PageUsers = ko.observable(1); //用户页码
	self.Photo = ko.observable('../../images/my-default.png'); //头像路径
	mui.ready(function() {
		var self = this;
		
		//关注我的人
		var attentedUrl = common.gServerUrl + "API/Action/GetFavoritedUserList?userId=" + getLocalItem("UserID");
		mui.ajax(attentedUrl, {
			type: 'GET',
			success: function(responseText) {
				var attented = JSON.parse(responseText);
				self.AttentionList(attented);
				common.showCurrentWebview();
			}
		});
		
		//我关注的人
		var ajaxUrl = common.gServerUrl + 'API/Action?userid=' + getLocalItem('UserID') + '&targetType=' + common.gDictActionTargetType.User + '&page=' + self.PageUsers();
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				var favUsers = JSON.parse(responseText);
				self.FavUsers(favUsers);
			}
		})
	})

	self.gotoUserInfo = function() {
		var user = this;
		if (user.UserType == common.gDictUserType.teacher) {
			common.transfer('../../modules/teacher/teacherInfo.html', false, {
				teacherID: user.ID
			}, false, false);
		} else if (user.UserType == common.gDictUserType.student) {
			common.transfer('../../modules/student/studentInfo.html', false, {
				studentID: user.ID
			}, false, false);
		}

	}

	self.gotoWorkInfo = function() {
		common.transfer("../works/WorksDetails.html", false, {
			works: this
		}, false, false);
	}
}
ko.applyBindings(myAttention);