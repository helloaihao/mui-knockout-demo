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
	}();

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
		//上拉加载
	var count = 0;
	self.pullupRefresh = function() {
		setTimeout(function() {
			mui('#pullrefresh').pullRefresh().endPullupToRefresh((++count > 2));
			pageNum++;
			mui.ajax(common.gServerUrl + "API/Message/GetMyMessage?receiver=" + receiverId + "&page=" + pageNum, {
				dataType: 'json',
				type: 'GET',
				success: function(responseText) {
					/*tmp = ko.observableArray([]);
					tmp(responseText);*/
					self.messages(self.messages().concat(responseText));
				}
			});
		}, 1500);
		mui.ready(function() {
			mui('#pullrefresh').pullRefresh().pullupLoading();
		})
	}
}
ko.applyBindings(message_notification);

/*var msgList = new message_notification();
ko.applyBindings(msgList);*/