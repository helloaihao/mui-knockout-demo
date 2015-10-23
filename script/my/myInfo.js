var myInfo = function() {
	var self = this;

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
	self.Password = ko.observable(""); //密码
	self.NewUserName = ko.observable(""); //新的手机号
	self.VerifyCode = ko.observable(""); //验证码
	self.RemainTime = ko.observable(0); //验证码剩余等待时间
	self.WaitTime = 15; //验证码默认等待时间
	self.Path = ko.observable('../../images/my-default.jpg'); //图片路径
	self.Base64 = ko.observable(''); //图片的base64字符串

	self.selectPic = function() {
//		mui.ready(function() {
			picture.SelectPicture(true, false, function(retValue) {
				self.Base64(retValue[0].Base64);
				self.Path(self.Base64());
			}); //需要裁剪
//		});
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
				self.SubjectName(items[0].text);
				self.SubjectID(items[0].value);
			});
		});
	}
	var genders, places, subjects;
	mui.plusReady(function() {
//		mui.ready(function() {
		self.genders = new mui.PopPicker();
		self.genders.setData(common.gJsonGenderType);

		self.places = new mui.PopPicker({
			layer: 3
		});
		self.places.setData(cityData3);

		var web = plus.webview.currentWebview();
		if (typeof(web.isRegister) !== "undefined") {
			self.IsRegister(true); //注册的第二步
			
		}

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
				console.log(responseText);
				if( responseText != "" ) {
					var result = eval("(" + responseText + ")");
				//self.UserID = responseText.ID;
					self.initData(result);
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
		
		self.Province(common.StrIsNull(result.Province));
		self.City(common.StrIsNull(result.City));
		self.District(common.StrIsNull(result.District));
		
		self.Introduce(common.StrIsNull(result.Introduce));
	}

	self.changeUserName = function() {
		common.transfer('modifyPhoneNumber.html', true);
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
				if (self.IsRegister() == true) {
					plus.webview.close(index); //关闭首页webview
					mui.toast("注册成功，正在返回...");
//					common.transfer('../../index.html');
				} else {
					mui.toast("修改成功");
//					if (self.UserType() == common.gDictUserType.student)
//						common.transfer('myInfoStudent.html');
//					else
//						common.transfer('myInfoTeacher.html');
				}
				var index = plus.webview.getLaunchWebview() || plus.webview.getWebviewById('indexID');	//获取首页Webview对象
				plus.webview.close(index);	//关闭首页
				mui.openWindow({
					id: 'indexID',
					url: "../../index.html",
					show: {
						autoShow: true,
						aniShow: "slide-in-right",
						duration: "100ms"
					},
					waiting: {
						autoShow: false
					},
					createNew: true
				})
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