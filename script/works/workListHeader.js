var workListHeader = function() {
	var self = this;
	
	//跳转至消息页面
	self.goMessageList = function() {
		common.gotoMessage();
	}
	//获取未读消息数量
	self.getUnreadCount = function() {
		common.getUnreadCount(self.UnreadCount());
	}
	//添加作品
	self.gotoAddWorks = function() {
		common.transfer('../../modules/works/addWorks.html', true);
	};
}
ko.applyBindings(workListHeader);