var viewModel = function() {
	var self = this;
	var lJson = [{LocationType:1,Cost:0},{LocationType:2,Cost:0}];
	var ppSubject, subjectID;
	self.dbSubject = ko.observable("请选择科目");
	self.dbTitle = ko.observable("");
	self.dbIntro = ko.observable("");
	self.dbMaxStudent = ko.observable("");
	self.dbSPrice = ko.observable("");
	self.dbTPrice = ko.observable("");
	self.dbLowAge = ko.observable("");
	self.dbHighAge = ko.observable("");
	
	self.lJson = ko.observableArray();
	mui.ready(function() {
		ppSubject = new mui.PopPicker();
		mui.ajax(common.gServerUrl + "Common/Subject/Get", {
			dataType: 'json',
			type: "GET",
			success: function(responseText) {
				var arr = common.JsonConvert(responseText, 'ID', 'SubjectName');
				ppSubject.setData(arr);
			}
		});

	});
	
	var isNum = function(s) {
		if( s!= null ) {
			var r, re;
			re = /\d*/i;
			r = s.match(re);
			return r==s ? true : false;
		}
		return false;
	}
	
	self.dbAgeLimits = ko.computed(function() {
		if( !isNum(self.dbLowAge()) ) {
			mui.toast("请输入数字");
			self.dbLowAge("");
		}
		if( !isNum(self.dbHighAge()) ) {
			mui.toast("请输入数字");
			self.dbHighAge("");
		}
		if( self.dbLowAge()!="" && self.dbHighAge()!="" && self.dbLowAge() > self.dbHighAge() ) {
			mui.toast("请输入正确的年龄要求 （小~大）");
			self.dbLowAge("");
			self.dbHighAge("");
		}
		//console.log(self.dbLowAge() +" + "+ self.dbHighAge());
		if( self.dbLowAge() !== "" && self.dbHighAge() !== "") {
			return self.dbLowAge() + "~" + self.dbHighAge() + "岁";
		} else if(self.dbLowAge() !== "") {
			return self.dbLowAge() + "岁以上";
		} else if(self.dbHighAge() !== "") {
			return self.dbHighAge() + "岁以下";
		} else {
			return "全年龄";
		}
	}, self);
	
	self.setSubject = function() {
		ppSubject.show(function(items) {
			self.dbSubject(items[0].text);
			subjectID = items[0].value;
		});
	};
	
	self.addCourse = function() {
		lJson[0].Cost = self.dbSPrice();
		lJson[1].Cost = self.dbTPrice();
		console.log(JSON.stringify(lJson));
		mui.ajax(common.gServerUrl + "API/Course?locationJson="+self.lJson(), {
				type: "POST",
				data: {
					UserID: getLocalItem("UserID"),
					CourseName: self.dbTitle,
					MaxStudnet: self.dbMaxStudent,
					SubjectID: subjectID,
					SubjectName: self.dbSubject,
					Price: 10
				},
				success: function(responseText) {
					mui.toast("添加成功");
				},
				error: function(xhr) {
					mui.toast("error");
				}
			});
	};
};

ko.applyBindings(viewModel);
