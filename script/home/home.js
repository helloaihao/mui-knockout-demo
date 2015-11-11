var home = function() {
	var self = this;
	self.Teachers = ko.observableArray([]);
	self.count = 3;
	self.UnreadCount = ko.observable("0");
	self.getTeachers = function() {
		self.getUnreadCount;
		mui.ajax(common.gServerUrl + "API/Teacher/GetIndexTeachers?count=" + self.count, {
			dataType: 'json',
			type: "GET",
			success: function(responseText) {
				self.Teachers(responseText);
			}
		});
	}();

	self.gotoTeacher = function() {
		common.transfer('../../modules/teacher/teacherInfo.html', false, {
			teacherID: this.UserID
		});
	}
	self.gotoMore = function() {
		common.transfer('../../modules/home/allSubject.html');
	}

	//跳转至消息页面
	self.goMessageList = function() {
		common.gotoMessage();
	}

	//获取未读消息数量
	self.getUnreadCount = function() {
		common.getUnreadCount(self.UnreadCount());
	}

	/*mui.plusReady(function() {
		common.confirmQuit;

	});*/
	mui.back = function() {
		/*var btnArray = ['确认', '取消'];
		mui.confirm('确认退出乐评+？', '退出提示', btnArray, function(e) {
			if (e.index == 0) {
				plus.runtime.quit();
			}
		});*/
		common.confirmQuit();
	}
};
ko.applyBindings(home);