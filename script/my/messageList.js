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
			mui.ajax(common.gServerUrl + "API/Message/GetMyMessage?receiver=" + receiverId + "&page=" + pageNum, {
				dataType: 'json',
				type: 'GET',
				success: function(responseText) {
					self.messages(self.messages().concat(responseText));
					mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
				}
			});
		}, 1500);
	}

	var count = 0;

	function pullupRefresh() {
		setTimeout(function() {
			mui('#pullrefresh').pullRefresh().endPullupToRefresh((++count > 2));
			mui.ajax(common.gServerUrl + "API/Message/GetMyMessage?receiver=" + receiverId + "&page=" + pageNum, {
				dataType: 'json',
				type: 'GET',
				success: function(responseText) {
					self.messages(self.messages().concat(responseText));
				}
			});
		}, 1500);
	}

	if (mui.os.plus) {
		mui.plusReady(function() {
			setTimeout(function() {
				mui('#pullrefresh').pullRefresh().pullupLoading();
			}, 1000);
		});
	} else {
		mui.ready(function() {
			mui('#pullrefresh').pullRefresh().pullupLoading();
		});
	}

	mui.plusReady(function(){
		plus.uploader.enumerate(function(uploads){
			console.log('arr'+uploads.length);
			mui.toast('arr'+uploads.length);
			//self.tasks(uploads);
		});
	});
}
ko.applyBindings(message_notification);