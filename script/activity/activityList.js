var viewModel = function() {
	var self = this;

	self.activitys = ko.observableArray([]);

	self.getActivity = function() {
		mui.ajax(common.gServerUrl + "API/Activity/GetActivityInfoList", {
			dataType: 'json',
			type: "GET",
			success: function(responseText) {
				self.activitys(responseText);
			}
		})
	}();

	self.gotoInfo = function(data) {
		common.transfer('activityInfo.html', false, {
			aid: data.ID
		});
	}

	mui.back = function() {
		common.confirmQuit();
	}
};

ko.applyBindings(viewModel);