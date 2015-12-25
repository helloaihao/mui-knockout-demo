var viewModel = function(){
	var self = this;
	var ID = 10;
	
	self.activity = ko.observableArray([]);
	self.Thumbnail = ko.observable('');
	
	self.getActivity = function() {
		mui.ajax(common.gServerUrl + "API/Activity/GetActivityInfoByID?ID=" + ID, {
			dataType: 'json',
			type: "GET",
			success: function(responseText) {
				self.activity(responseText);
				self.Thumbnail(self.activity().Thumbnail);
			}
		})
	};
	
	//关闭分享窗口
	self.closeShare = function() {
		mui('#middlePopover').popover('toggle');
	}
	
	self.gotoSchedule = function(data) {
		common.transfer('activitySchedule.html', false, {
			aid: data.ID
		});
	}
	
	self.gotoNews = function() {
		common.transfer('/modules/home/web.html', false, {
			url: 'http://mp.weixin.qq.com/s?__biz=MzIwOTA4MDMzOA==&mid=402038844&idx=1&sn=fd4e2026683d2c3aee0b4dbc76964c31#rd'
		});
	}
	
	self.gotoRehearsal = function(data) {
		common.transfer('activityRehearsal.html', false, {
			aid: data.ID
		});
	}
	
	self.gotoCalendar = function(data) {
		common.transfer('activityCalendar.html', false, {
			aid: data.ID
		});
	}
	
	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		if (typeof(web.aid) !== "undefined") {
			ID = web.aid;
		}
		self.getActivity();
	});
};
ko.applyBindings(viewModel);
