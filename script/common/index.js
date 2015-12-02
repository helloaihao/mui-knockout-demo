var viewModelIndex = function() {
	var self = this;
	self.UserName = ko.observable(getLocalItem('UserName'));
	self.UserID = ko.observable(getLocalItem('UserID'));
	self.UserType = ko.observable(getLocalItem('UserType'));
	self.UnreadCount = ko.observable(0);
	self.MyHref = ko.observable('modules/my/myInfoStudent.html');
	//self.worksList = ko.observable('modules/works/worksListHeader.html');
	self.worksText=ko.observable('作品');

	if (self.UserType() == common.gDictUserType.teacher) {
		self.MyHref('modules/my/myInfoTeacher.html');
	}else if (self.UserType() == common.gDictUserType.student){
		self.worksText('作业');
	}
	//跳转至消息页面
	self.goMessageList = function() {
		common.gotoMessage();
	}

	//获取未读消息数量
	self.getUnreadCount = function() {
		var self = this;
		common.getUnreadCount(self.UnreadCount());
	}

	mui.plusReady(function() {
		common.getAllSubjectsStr();
	})
};
ko.applyBindings(viewModelIndex);