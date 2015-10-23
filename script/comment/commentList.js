var commentList = function() {
	var self = this;
	self.works = ko.observableArray([]);
	var pageNum = 1;
	self.UnreadCount = ko.observable("0");
	//加载作品
	self.getWorks = function() {
		 self.getUnreadCount;
		mui.ajax(common.gServerUrl + "API/Work?page=" + pageNum, {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				self.works(result);
			},
			error: function() {
				mui.toast("ERROR");
			}
		})
	}();
	//刷新
	var count = 0;
	self.pullupRefresh = function() {
		setTimeout(function() {
			mui('#pullrefresh').pullRefresh().endPullupToRefresh((++count > 2));
			pageNum++;
			mui.ajax(common.gServerUrl + "API/Work?page=" + pageNum, {
				type: 'GET',
				success: function(responseText) {
					var result = eval("(" + responseText + ")");
					self.works(self.works().concat(result));
				}
			});
		}, 1500)
		
		mui.ready(function() {
			mui('#pullrefresh').pullRefresh().pullupLoading();
		})
	}
	//跳转至消息页面
	self.goMessageList = function(){
		common.gotoMessage();
	}
	//获取未读消息数量
	self.getUnreadCount = function(){
		common.getUnreadCount(self.UnreadCount());
	}
	
	function plusReady() {
		if (plus.networkinfo.getCurrentType() == 1) {
			mui.toast("网络还没连接哦");
		}
	}
	if (window.plus) {
		plusReady();
	} else {
		document.addEventListener('plusready', plusReady, false);
	}
}
ko.applyBindings(commentList);

