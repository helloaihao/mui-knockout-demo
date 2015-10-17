var myInfo = function() {
	var self = this;

	self.UserID = ko.observable(getLocalItem('UserID'));
	self.UserType = ko.observable('');
	self.UserType(getLocalItem('UserType'));

	//self.ID = ko.observable(" ");.//用户id
	self.UserName = ko.observable(getLocalItem('UserName')); //手机
	self.DisplayName = ko.observable(''); //姓名
	self.Photo = ko.observable(''); //头像
	self.Birthday = ko.observable(''); //生日
	self.Gender = ko.observable(); //性别
	self.GenderText = ko.observable(''); //性别文本
	self.Province = ko.observable(""); //默认广东省
	self.City = ko.observable(""); //默认广州市
	self.District = ko.observable(""); //默认天河区
	self.Place = ko.computed(function(){ //位置
		return self.Province() + ' ' + self.City() + ' ' + self.District();
	})
	
	self.SubjectName = ko.observable(''); //所属科目名称
	self.SubjectID = ko.observable(0); //所属科目
	self.TeachAge = ko.observable(0); //教龄
	self.Introduce = ko.observable(''); //简介
	self.Password = ko.observable(""); //密码
	self.NewUserName = ko.observable(""); //新的手机号
	self.VerifyCode = ko.observable(""); //验证码
	self.RemainTime = ko.observable(0); //验证码剩余等待时间
	self.WaitTime = 15; //验证码默认等待时间
	self.Path = ko.observable('../../images/my-photo.png'); //图片路径
	self.Base64 = ko.observable(''); //图片的base64字符串

	self.selectPic = function() {
		mui.ready(function() {
			picture.SelectPicture(true, false, function(retValue) {
				self.Base64(retValue[0].Base64);
				self.Path(self.Base64());
			}); //需要裁剪
		});
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
			console.log(self.Birthday());
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
				self.Birthday(), function(value) {
					self.Birthday(value);
				});

			/*//self.Birthday("2014-12-09");
			var dDate = new Date();
			dDate.setFullYear(2014, 7, 16);
			var minDate = new Date();
			minDate.setFullYear(1990, 0, 1);
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
			});*/
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
				self.SubjectName(items[0].text);
				self.SubjectID(items[0].value);
			});
		});
	}
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
		
		mui.ajax(common.gServerUrl + "API/Account/GetInfo?userid=" + self.UserID() + "&usertype=" + self.UserType(), {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				//self.UserID = responseText.ID;
				self.initData(result);
			}
		})
	})
	
	self.initData = function(teacher){
		//self.UserName(teacher.UserName);
		self.DisplayName(teacher.DisplayName);
		self.Photo(teacher.Photo);
		if (teacher.Photo != '')
			self.Path(common.getPhotoUrl(teacher.Photo));
		if (teacher.Birthday)
			self.Birthday(teacher.Birthday.split(" ")[0]);
		self.Gender(teacher.Gender);
		self.GenderText(common.getTextByValue(common.gJsonGenderType, teacher.Gender));
		if (teacher.SubjectID) {
			self.SubjectID(teacher.SubjectID);
			self.SubjectName(teacher.SubjectName);
		}
		if (teacher.TeachAge)
			self.TeachAge(teacher.TeachAge);
		
		self.Province(common.StrIsNull(teacher.Province));
		self.City(common.StrIsNull(teacher.City));
		self.District(common.StrIsNull(teacher.District));
		self.Introduce(common.StrIsNull(teacher.Introduce));
	}

	self.changeUserName = function() {
		common.transfer('modifyPhoneNumber.html', true);
	}

	//提交修改
	self.setInfo = function() {
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
			}
		})
	}

	self.getVerifyCode = function() {
		if (self.RemainTime() > 0) {
			mui.toast("不可频繁操作");
			return;
		}
		if (self.NewUserName() == "") {
			mui.toast('手机号不能为空');
		} else if (!(/^1[3|4|5|7|8][0-9]\d{4,8}$/.test(self.NewUserName()))) {
			mui.toast("手机号码不合法")
		} else {
			//账号是否存在,此处不存在success
			mui.ajax(common.gServerUrl + "API/Account/CheckAccount?userName=" + self.NewUserName() + "&exists=false", {
				type: 'GET',
				success: function(responseText) {
					mui.ajax(common.gServerUrl + "Common/GetVerifyCode?mobile=" + self.NewUserName(), {
						//dataType:'json',
						type: 'GET',
						success: function(responseText) {
							//var result = eval("(" + responseText + ")");
							mui.toast(responseText);
							self.RemainTime(self.WaitTime);
							self.CheckTime();
						},
						error: function(responseText) {
							mui.toast(responseText);
						}
					})
				},
				error: function(responseText) {
					mui.toast('手机号已注册');
					//return false;
				}
			})
		}
	}
	self.CheckTime = function() {
		//验证码计时器
		if (self.RemainTime() == 0) {
			return;
		} else {
			self.RemainTime(self.RemainTime() - 1);
			setTimeout(function() {
				self.CheckTime()
			}, 1000);
		}
	}
	self.saveUserNeme = function() {
		//保存修改手机号
		if (self.NewUserName() == "") {
			mui.toast('新手机号不能为空');
		}
		if (self.VerifyCode() == "") {
			mui.toast('验证码不能为空');
			return;
		}
		if (self.Password() == "") {
			mui.toast('密码不能为空');
			return;
		}
		mui.ajax(common.gServerUrl + "API/Account/SetAccount", {
			type: 'POST',
			data: {
				ID: self.UserID(),
				UserName: self.NewUserName(),
				Password: self.Password(),
				VerifyCode: self.VerifyCode()
			},
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				setLocalItem("UserName", result.UserName);
			}
		});
	}
}
ko.applyBindings(myInfo);