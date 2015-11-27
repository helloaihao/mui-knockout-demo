var myInfo = function() {
	var self = this;
	var bValue = false;
	self.UserID = ko.observable(getLocalItem('UserID'));
	self.UserType = ko.observable('');
	self.UserType(getLocalItem('UserType'));

	self.IsRegister = ko.observable(false);

	//self.ID = ko.observable(" ");.//用户id
	self.UserName = ko.observable(getLocalItem('UserName')); //手机
	self.DisplayName = ko.observable(''); //姓名
	self.Photo = ko.observable(''); //头像
	self.Birthday = ko.observable(''); //生日
	self.Gender = ko.observable(0); //性别
	self.GenderText = ko.observable('选择性别'); //性别文本
	self.Province = ko.observable("广东省"); //默认广东省
	self.City = ko.observable("广州市"); //默认广州市
	self.District = ko.observable("天河区"); //默认天河区
	self.Place = ko.computed(function() { //位置
		return self.Province() + ' ' + self.City() + ' ' + self.District();
	})

	self.SubjectName = ko.observable('请选择科目'); //所属科目名称
	self.SubjectID = ko.observable(0); //所属科目
	self.TeachAge = ko.observable(0); //教龄
	self.Introduce = ko.observable(''); //简介
	self.Path = ko.observable('../../images/my-default.png'); //图片路径
	self.Base64 = ko.observable(''); //图片的base64字符串
	self.Score = ko.observable(''); //老师得分

	self.selectPic = function() {
		picture.SelectPicture(true, false, function(retValue) {
			self.Base64(retValue[0].Base64);
			self.Path(self.Base64());
		}); //需要裁剪

	}

	//性别获取
	self.setUserGender = function() {
		mui.ready(function() {
			self.genders.show(function(items) {
				self.GenderText(items[0].text);
				self.Gender(items[0].value);
			});
		});
	}

	//生日获取
	self.getBirthday = function() {
		var now = new Date();
		var year = 1900 + now.getYear();
		if (self.Birthday() == '') {
			self.Birthday('2005-01-01');
		}

		dtPicker.PopupDtPicker({
				'type': 'date',
				'beginYear': 1980,
				'endYear': year
			},
			self.Birthday(),
			function(value) {
				//self.Birthday(value.format('yyyy-MM-dd'));
				self.Birthday(value.split(' ')[0]);
			});
	}

	//地址获取
	self.address = function() {
		mui.ready(function() {
			self.places.show(function(items) {
				cityValueMon = (items[0] || {}).text + " " + common.StrIsNull((items[1] || {}).text) + " " + common.StrIsNull((items[2] || {}).text);
				self.Province(cityValueMon.split(" ")[0]);
				self.City(cityValueMon.split(" ")[1]);
				self.District(cityValueMon.split(" ")[2]);
			});
		})
	}

	//科目获取
	self.getSubject = function() {
		mui.ready(function() {
			self.subjects.show(function(items) {
				self.SubjectName(items[1].text);
				self.SubjectID(items[1].value);
			});
		});
	}
	var genders, places, subjects;
	mui.plusReady(function() {
		/*var currentWebview=plus.webview.getWebviewById('register.html');
		currentWebview.evalJS("closeWebview()");*/
		self.genders = new mui.PopPicker();
		self.genders.setData(common.gJsonGenderType);

		self.places = new mui.PopPicker({
			layer: 3
		});
		self.places.setData(cityData3);
		self.subjects = new mui.PopPicker({
			layer: 2
		});
		self.subjects.setData(common.getAllSubjectsBoth());

		mui.ajax(common.gServerUrl + "API/Account/GetInfo?userid=" + self.UserID() + "&usertype=" + self.UserType(), {
			type: 'GET',
			success: function(responseText) {
				//console.log(responseText);
				if (responseText != "") {
					var result = eval("(" + responseText + ")");
					//self.UserID = responseText.ID;
					self.initData(result);
					common.showCurrentWebview();
				}
			}
		})
	})
	self.initData = function(result) {
		//self.UserName(result.UserName);
		self.DisplayName(result.DisplayName);
		self.Photo(result.Photo);
		if (common.StrIsNull(result.Photo) != '')
			self.Path(common.getPhotoUrl(result.Photo));

		if (result.Birthday)
			self.Birthday(result.Birthday.split(" ")[0]);
		self.Gender(result.Gender);
		self.GenderText(common.getTextByValue(common.gJsonGenderType, result.Gender));
		if (result.SubjectID) {
			self.SubjectID(result.SubjectID);
			self.SubjectName(result.SubjectName);
		}
		if (result.TeachAge)
			self.TeachAge(result.TeachAge);
		if (result.Score)
			self.Score(result.Score);
		self.Province(common.StrIsNull(result.Province));
		self.City(common.StrIsNull(result.City));
		self.District(common.StrIsNull(result.District));
		self.Introduce(common.StrIsNull(result.Introduce));
	}

	self.changeUserName = function() {
		common.transfer('modifyPhone.html', true);
	}

	//提交修改
	self.setInfo = function() {
		if (common.StrIsNull(self.DisplayName()) == "") {
			mui.toast('姓名不能为空');
			return;
		}
		if (self.UserType() == common.gDictUserType.teacher) {
			if (self.SubjectID() <= 0) {
				mui.toast('请选择科目');
				return;
			}
		}
		if (common.StrIsNull(self.GenderText()) == "") {
			mui.toast('请选择性别');
			return;
		}
		if (common.StrIsNull(self.Province()) == "") {
			mui.toast('请选择位置');
			return;
		}
		if (self.UserType() == common.gDictUserType.teacher) {
			if (common.StrIsNull(self.Introduce()) == "") {
				mui.toast('自我简介不能为空');
				return;
			}
		}

		var infoUrl;
		var data = {
			DisplayName: self.DisplayName(),
			Gender: self.Gender(),
			Province: self.Province(),
			City: self.City(),
			District: self.District()
		};
		if (self.Base64() != '') {
			data.PhotoBase64 = self.Base64();
		}
		if (self.UserType() == common.gDictUserType.student) {
			infoUrl = common.gServerUrl + "API/Student?userID=";
			data.Birthday = self.Birthday();
		} else {
			infoUrl = common.gServerUrl + "Common/Teacher?userID=";
			data.SubjectID = self.SubjectID();
			data.TeachAge = self.TeachAge();
			data.Introduce = self.Introduce();
		}

		mui.ajax(infoUrl + self.UserID(), {
			type: "PUT",
			//contentType: 'application/json',
			data: data,
			success: function(responseText) {
				mui.toast("修改成功");
				bValue = true;
				mui.back();
			}
		})
	}

	mui.init({
		beforeback: function() {
			if (bValue) {
				var myinfo = plus.webview.currentWebview().opener();
				mui.fire(myinfo, 'refreshMyinfo', {
					imgPath: self.Path(),
					displayName: self.DisplayName(),
					userScore: self.Score()
				});
			}

		}
	})
	window.addEventListener('refreshUserName', function(event) {
		self.UserName(getLocalItem('UserName'));
	})
}
ko.applyBindings(myInfo);