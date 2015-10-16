var Lesson = function() {
	var self = this;
	self.times = ko.observableArray(['请选择课时']);
	//self.showTimes = ko.observableArray(['请选择课时']);
	self.teacherName = ko.observable('袁怡航');
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
	mui.plusReady(function() {
		var web = plus.webview.currentWebview(); //页面间传值
		if( typeof(web.chosenTimes) !== "undefined") {
			self.times(web.chosenTimes.sort());
			//self.times().forEach(function(item){
				//var a = common.formatTime(item);
				//self.showTimes.push(a);
			//});
		}
		if( typeof(web.teacherName) !== "undefined") {
			self.teacherName(web.teacherName);
		}
	});
};

ko.applyBindings(Lesson);
