var viewModel = function() {
	var self = this;
	self.subjectText = ko.observable("请选择科目");
	self.starText = ko.observable("请选择星级");
	var subjectName, starName;
	var Subject, starID;
	mui.ready(function() {
		subjectName = new mui.PopPicker();
		mui.ajax(common.gServerUrl + "Common/Subject/Get", {
			dataType: 'json',
			type: "GET",
			success: function(responseText) {
				var arr = common.JsonConvert(responseText, 'ID', 'SubjectName');
				subjectName.setData(arr);
			}
		});
		starName = new mui.PopPicker();
		starName.setData(common.gJsonTeacherLever);
	});
	//科目获取
	self.setSubject = function() {
		subjectName.show(function(items) {
			self.subjectText(items[0].text);
			Subject = items[0];
		});
	};
	self.setStar = function() {
		starName.show(function(items) {
			self.starText(items[0].text);
			starID = items[0];
		});
	};
	self.gotoTeacherList = function() {
		if( typeof(Subject) === "undefined" ) {
			mui.toast("请选择科目");
			return ;
		}
		if( typeof(starID) === "undefined" ) {
			mui.toast("请选择星级");
			return ;
		}
		var webview = mui.openWindow({
			url: "../../modules/teacher/teacherList.html",
			extras: {
				//subjectName: self.subjectText(),
				Subject: Subject,
				starText: starID
			},
			waiting: {
				autoShow: false
			}
		});
	};
}

ko.applyBindings(viewModel);