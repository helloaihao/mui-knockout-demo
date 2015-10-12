var registerSet = function() {
	var self = this;
	self.DisplayName = ko.observable(""); //用户名字
	self.Gender = ko.observable(""); //用户性别，0为女，1为男
	self.UserGenderText = ko.observable("请选择性别");
	self.Birthday = ko.observable("请选择日期");
	self.CityValue = ko.observable("请选择地区");
	//self.UserID = 6;//仅用于测试的id
	self.UserID = getLocalItem("UserID"); //实际使用id获得方式
	self.Province = ko.observable("广东省"); //默认广东省
	self.City = ko.observable("广州市"); //默认广州市
	self.District = ko.observable("天河区"); //默认天河区
	self.SubjectName = ko.observable("请选择科目");
	self.SubjectID = ko.observable("");
	self.TeachAge = ko.observable(""); //教龄
	self.Introduce = ko.observable(""); //简介

	var genders, places, subjects;

	mui.ready(function() {
		self.genders = new mui.PopPicker();
		self.genders.setData(common.gJsonGenderType);

		self.places = new mui.PopPicker({
			layer: 3
		});
		self.places.setData(cityData3);

		mui.ajax(common.gServerUrl + 'Common/Subject/Get', {
			type: 'GET',
			success: function(responseText) {
				self.subjects = new mui.PopPicker();
				var arr = common.JsonConvert(responseText, 'ID', 'SubjectName');
				self.subjects.setData(arr);
			}
		})
	})

	//地址获取
	self.address = function() {
			mui.ready(function() {
				self.places.show(function(items) {
					cityValueMon = (items[0] || {}).text + " " + common.StrIsNull((items[1] || {}).text) + " " + common.StrIsNull((items[2] || {}).text);
					self.CityValue(cityValueMon);
					self.Province(self.CityValue().split(" ")[0]);
					self.City(self.CityValue().split(" ")[1]);
					self.District(self.CityValue().split(" ")[2]);
				});
			})
		}
		//性别获取
	self.setUserGender = function() {
			mui.ready(function() {
				self.genders.show(function(items) {
					self.UserGenderText(items[0].text);
					self.Gender(items[0].value);
				});
			});
		}
		//生日获取
	self.getBirthday = function() {
			//self.Birthday("2014-12-09");
			var dDate = new Date();
			dDate.setFullYear(2014, 7, 16);
			var minDate = new Date();
			minDate.setFullYear(1900, 0, 1);
			var maxDate = new Date();
			maxDate.setFullYear(2016, 11, 31);
			plus.nativeUI.pickDate(function(e) {
				var d = e.date;
				self.Birthday(d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate());
			}, function(e) {
				mui.toast("您没有选择日期");
			}, {
				title: "请选择日期",
				date: dDate,
				minDate: minDate,
				maxDate: maxDate
			});
		}
		//科目获取
	self.getSubject = function() {
			mui.ready(function() {
				self.subjects.show(function(items) {
					self.SubjectName(items[0].text);
					self.SubjectID(items[0].value);
				});
			});
		}
		//学生注册第二页
	self.regStu = function() {
			mui.ajax(common.gServerUrl + "API/Student?userID=" + self.UserID, {
				type: "PUT",
				data: {
					DisplayName: self.DisplayName(),
					Gender: self.Gender(),
					Birthday: self.Birthday(),
					Province: self.Province(),
					City: self.City(),
					District: self.District()
				},
				success: function(responseText) {
					mui.toast("注册成功")
					window.location = "login.html";
				},
				error: function(responseText) {
					mui.toast("Error");
				}
			});
		}
		//老师注册第二页
	self.regTea = function() {
		mui.ajax(common.gServerUrl + "API/Teacher?userID=" + self.UserID, {
			type: "PUT",
			data: {
				DisplayName: self.DisplayName(),
				SubjectID: self.SubjectID(),
				Gender: self.Gender(),
				TeachAge: self.TeachAge(),
				Introduce: self.Introduce()
			},
			success: function(responseText) {
				mui.toast("注册成功")
				window.location = "login.html";
			},
			error: function(responseText) {
				mui.toast("Error");
			}
		});
	}
}
ko.applyBindings(registerSet);