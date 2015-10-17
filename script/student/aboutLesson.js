var Lesson = function() {
	var self = this;
	self.times = ko.observableArray(['请选择课时']);
	//self.showTimes = ko.observableArray(['请选择课时']);
	self.teacherName = ko.observable('袁怡航');
	self.userID = ko.observable(0);
	self.photo = ko.observable('');
	//选择课时
	self.gotoChooseTime = function() {
		self.times([]);
		common.transfer('chooseTime.html', true, {
			chosenTimes: self.times()
		});
	};
	//支付
	self.gotoPay = function() {
		common.transfer('../../index.html', true);
	};
	//获取参数
	//mui.plusReady(function() {
	mui.ready(function() {
		/*var web = plus.webview.currentWebview(); //页面间传值
		if(typeof(web.chosenTimes) !== "undefined") {
			self.times(web.chosenTimes.sort());
		}
		if(typeof(web.userID) !== "undefined") {
			self.userID(web.userID);
		}
		if(typeof(web.photo) !== "undefined") {
			self.photo(web.photo);
		}
		if(typeof(web.teacherName) !== "undefined") {
			self.teacherName(web.teacherName);
		}*/
	});
};

ko.applyBindings(Lesson);
