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
				self.subjectText(arr[0].text);
				self.Subject = arr[0].value;
			}
		});
		
		starName = new mui.PopPicker();
		starName.setData(common.gJsonTeacherLever);
		self.starText(common.gJsonTeacherLever[0].text);
		self.starID = common.gJsonTeacherLever[0].value;
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
		if( typeof(self.Subject) === "undefined" ) {
			mui.toast("请选择科目");
			return ;
		}
		if( typeof(self.starID) === "undefined" ) {
			mui.toast("请选择星级");
			return ;
		}
		
		common.transfer("../../modules/teacher/teacherListHeader.html", false, {
			Subject: self.Subject,
				starText: self.starID
		});
	};
}

ko.applyBindings(viewModel);