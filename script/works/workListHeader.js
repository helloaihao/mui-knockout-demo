var workListHeader = function() {
	var self = this;
	self.myWorks = ko.observableArray([]); //我的作品数组
	self.workTitle=ko.observable("我的作业");
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
	mui.plusReady(function(){
		if(getLocalItem('UserType')==common.gDictUserType.student){
			self.workTitle("我的作品");
		}
	})
}
ko.applyBindings(workListHeader);