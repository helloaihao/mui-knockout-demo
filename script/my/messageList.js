//knockoutjs
var message_notification = function() {
	var self = this;
	self.messages = ko.observableArray([]);
	var pageNum = 1;
	var receiverId = getLocalItem("UserID");
	self.getMessage = function() {
		mui.ajax(common.gServerUrl + "API/Message/GetMyMessage?receiver=" + receiverId + "&page=" + pageNum, {
			dataType: 'json',
			type: 'GET',
			success: function(responseText) {
				self.messages(responseText);
				if (responseText.length > 0)
					setLocalItem("msgLastTime", responseText[responseText.length - 1].SendTime);
			}
		})
	}

	self.removeMessages = function() {
		var message = this;
		var btnArray = ['是', '否'];
		mui.confirm('确认删除吗', '您点击了删除', btnArray, function(e) {
			if (e.index == 0) {
				mui.ajax(common.gServerUrl + "API/Message/" + message.ID, {
					type: 'DELETE',
					success: function(responseText) {
						this.messages.remove(message);
					}
				});
			}
		});
	}

	mui.init({
		pullRefresh: {
			container: '#pullrefresh',
			down: {
				callback: pulldownRefresh
			},
			up: {
				contentrefresh: '正在加载...',
				callback: pullupRefresh
			}
		}
	});

	function pulldownRefresh() {
		setTimeout(function() {
			mui('#pullrefresh').pullRefresh().endPulldownToRefresh(); //refresh completed
			pageNum = 1;					//重新加载第1页
			self.getMessage();
		}, 1500);
	}

	//var count = 0;
	function pullupRefresh() {
		setTimeout(function() {
			pageNum++;
			mui.ajax(common.gServerUrl + "API/Message/GetMyMessage?receiver=" + receiverId + "&page=" + pageNum, {
				dataType: 'json',
				type: 'GET',
				success: function(responseText) {
					self.messages(self.messages().concat(responseText));
					if (self.responseText == null || self.responseText.length <= 4) {
						mui('#pullrefresh').pullRefresh().disablePullupToRefresh();
					} else {
						mui('#pullrefresh').pullRefresh().enablePullupToRefresh();
					}
				}
			});
		}, 1500);
	}

	if (mui.os.plus) {
		mui.plusReady(function() {
			if (plus.os.vendor == 'Apple') {
				mui('.mui-scroll-wrapper').scroll();
			}
		});
	}

	mui.plusReady(function() {
		self.getMessage();
	});
}
ko.applyBindings(message_notification);