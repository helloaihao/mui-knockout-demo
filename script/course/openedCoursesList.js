var viewModel = function() {
	var self = this;

	self.courses = ko.observableArray([]);
	self.active = ko.observable(true);
	self.getCourse = function() {
		mui.ajax(common.gServerUrl + "API/Course/GetAllCourseByUserID?userId=" + getLocalItem("UserID"), {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				self.courses(result);
			},
			error: function() {
				mui.toast("error");
			}
		});
	}();

	self.submitEnabled = function(item) {
		mui.ajax(common.gServerUrl + "API/Course/" + item.ID, {
			type: 'PUT',
			data: {
				IsEnabled: item.IsEnabled,
				UserID: item.UserID
			},
			success: function(responseText) {
				self.courses.remove(item);
				self.courses.push(item);
				self.courses.sort(function(left, right) {
					return left.ID == right.ID ? 0 : (left.ID < right.ID ? -1 : 1);
				});

				var tips = item.IsEnabled ? "已启用" : "已停用";
				mui.toast(tips);
			}
		});
	}

	self.setEnabled = function($data) {
		var obj = $data;
		if (!$data.IsEnabled) {
			$data.IsEnabled = true;
			submitEnabled($data);
		}
	};

	self.setDisabled = function($data) {
		var obj = $data;
		if ($data.IsEnabled) {
			$data.IsEnabled = false;
			submitEnabled($data);
		}
	};

	self.removeCourse = function() {
		var course = this;
		var btnArray = ['是', '否'];
		mui.confirm('确认删除吗', '您点击了删除', btnArray, function(e) {
			if (e.index == 0) {
				mui.ajax(common.gServerUrl + "API/Course/" + course.ID, {
					type: 'DELETE',
					success: function(responseText) {
						self.courses.remove(course);
						mui.toast("删除成功");
					}
				});
			}
		});
	}

	self.gotoEditCourse = function() {
		//window.location = "../../modules/course/addCourse.html?course="+encodeURI(JSON.stringify(this));
		common.transfer("../../modules/course/addCourse.html", true, {course: this});
	};

	self.gotoRegistered = function() {
		common.transfer("../../modules/course/registeredList.html", true, {course: this});
	};

	self.gotoAddCourse = function() {
		common.transfer("../../modules/course/addCourse.html", true);
	};

	self.gotoTime = function() {
		common.transfer("../../modules/course/availableTime.html", true);
	};
};
ko.applyBindings(viewModel);