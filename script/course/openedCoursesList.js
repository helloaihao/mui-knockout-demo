var viewModel = function() {
	self.course = ko.observableArray([]);
	self.active = ko.observable(true);
	self.getCourse = function() {
		mui.ajax(common.gServerUrl + "API/Course/GetCourseByUserID?userId=101", {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				result[0].IsEnabled = false;
				self.course(result);
				//mui.toast("able:" + self.course()[0].IsEnabled);
			},
			error: function() {
				mui.toast("error");
			}
		});
	}();
	
	self.changeEnabled = function() {
		mui.toast(this.IsEnabled);
		this.IsEnabled = !this.IsEnabled;
	};
	
	self.gotoAddCourse = function() {
		common.transfer("../../modules/course/addCourse.html", true);
	};
	
	self.gotoTime = function() {
		common.transfer("../../modules/course/availableTime.html", true);
	};
};
ko.applyBindings(viewModel);
