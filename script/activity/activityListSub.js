var viewModel = function() {
	var self = this;
	var page = 1;
	self.activitys = ko.observableArray([]);
	var activityUrl = common.gServerUrl + "API/Activity/GetActivityInfoList?page=";
	
	mui.init({
		pullRefresh: {
			container: '#pullrefreshMy',
			down: {
				contentrefresh: common.gContentRefreshDown,
				callback: pulldownRefresh
			},
			up: {
				contentrefresh: common.gContentRefreshUp,
				contentnomore: common.gContentNomoreUp,
				callback: pullupRefresh
			}
		}
	});
	
	//下拉刷新
	function pulldownRefresh() {
		setTimeout(function() {
			mui('#pullrefreshMy').pullRefresh().endPulldownToRefresh(); //refresh completed
			mui('#pullrefreshMy').pullRefresh().refresh(true);
			page = 1; //重新加载第1页
			self.getActivity();
		}, 1500);
	}

	//上拉加载
	function pullupRefresh(pullrefreshId, worksArray) {
		setTimeout(function() {
			page++;
			if (plus.networkinfo.getCurrentType() > 1) {
				mui.ajax(activityUrl + page, {
					type: 'GET',
					success: function(responseText) {
						var result = eval("(" + responseText + ")");
						if (result && result.length > 0) {
								self.activitys(self.activitys().concat(result));
							
							if (result.length < common.gListPageSize) {
								mui('#pullrefreshMy').pullRefresh().endPullupToRefresh(true);
							} else {
								mui('#pullrefreshMy').pullRefresh().endPullupToRefresh(false); //false代表还有数据
							}
						} else {
							mui('#pullrefreshMy').pullRefresh().endPullupToRefresh(true); //true代表没有数据了
						}
					}
				});
			}
		}, 1500)
	};
	
	
	self.getActivity = function() {
		mui.ajax(activityUrl + page, {
			dataType: 'json',
			type: "GET",
			success: function(responseText) {
				self.activitys(responseText);
			}
		})
	};

	self.gotoInfo = function(data) {
		common.transfer('activityInfo.html', false, {
			aid: data.ID
		});
	}

	mui.back = function() {
		common.confirmQuit();
	}
	mui.plusReady(function() {
		self.getActivity();
	});
	
};

ko.applyBindings(viewModel);