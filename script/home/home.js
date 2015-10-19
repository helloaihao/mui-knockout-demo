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
			mui.openWindow({
				url: "../../modules/teacher/teacherInfo.html",
				extras: {
					teacherID: this.UserID
				},
				waiting: {
					autoShow: false
				}
			});
		}
		//跳转至消息页面
	self.goMessageList = function() {
			common.gotoMessage();
		}
		//获取未读消息数量
	self.getUnreadCount = function() {
		common.getUnreadCount(self.UnreadCount());
	}
};
ko.applyBindings(home);