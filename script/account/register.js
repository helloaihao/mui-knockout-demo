var register = function() {
	var cleanvalue = "";
	self.UserTypeText = ko.observable("请选择用户类型");
	self.UserName = ko.observable(""); //用户名，即手机号
	self.Password = ko.observable(""); //密码
	self.CheckNum = ko.observable(""); //验证码
	self.ConPassword = ko.observable(""); //确认密码
	self.UserType = ko.observable(0); //用户类型
	self.RemainTime = ko.observable(0); //验证码剩余等待时间
	self.Agreed = ko.observable(true); //同意协议
	self.registerTitle = ko.observable('注册');

	/*
	 * registerInfo 相关绑定
	 */
	self.UserType = ko.observable(''); //用户类型
	self.DisplayName = ko.observable(''); //姓名
	self.Photo = ko.observable(''); //头像
	self.Birthday = ko.observable('请选择生日'); //生日
	self.Gender = ko.observable(0); //性别
	self.GenderText = ko.observable('请选择性别'); //性别文本
	self.Province = ko.observable("请选择地址"); //默认广东省
	self.City = ko.observable(""); //默认广州市
	self.District = ko.observable(""); //默认天河区
	self.Place = ko.computed(function() { //位置
		return self.Province() + ' ' + self.City() + ' ' + self.District();
	});
	self.SubjectName = ko.observable('请选择科目'); //所属科目名称
	self.SubjectID = ko.observable(0); //所属科目
	self.TeachAge = ko.observable("0"); //教龄
	self.Introduce = ko.observable(''); //简介
	self.Path = ko.observable('../../images/my-default.png'); //图片路径
	self.Base64 = ko.observable(''); //图片的base64字符串
	//头像裁剪
	self.selectPic = function() {
			picture.SelectPicture(true, false, function(retValue) {
				self.Base64(retValue[0].Base64);
				self.Path(self.Base64());
			}); //需要裁剪

		}
		//用户类型选择
	self.setUserType = function() {
			userType.show(function(items) {
				self.UserTypeText(items[0].text);
				self.UserType(items[0].value);
			});
		}
		//验证码获取
	self.getVerifyCode = function() {
			if (self.RemainTime() > 0) {
				mui.toast("不可频繁操作");
				return;
			}
			if (self.UserName() == "") {
				mui.toast('手机号不能为空');
			} else if (!(/^1[3|4|5|7|8][0-9]\d{4,8}$/.test(self.UserName()))) {
				mui.toast("手机号码不合法")
			} else {
				//账号是否存在,此处不存在success
				mui.ajax(common.gServerUrl + "API/Account/CheckAccount?userName=" + self.UserName() + "&exists=false", {
					type: 'GET',
					success: function(responseText) {
						mui.ajax(common.gServerUrl + "Common/GetVerifyCode?mobile=" + self.UserName(), {
							//dataType:'json',
							type: 'GET',
							success: function(responseText) {
								//var result = eval("(" + responseText + ")");
								mui.toast(responseText);
								self.RemainTime(common.gVarWaitingSeconds);
								self.CheckTime();
							}
						})
					}
				})
			}
		}
		//验证码计时器
	self.CheckTime = function() {
			if (self.RemainTime() == 0) {
				return;
			} else {
				self.RemainTime(self.RemainTime() - 1);
				setTimeout(function() {
					self.CheckTime()
				}, 1000);
			}
		}
		//注册按钮实现
	self.registerUser = function() {
			if (self.UserType() <= 0) {
				mui.toast('请选择用户类型');
				return;
			}
			if (self.UserName() == "") {
				mui.toast('手机号不能为空');
				return;
			}
			if (self.CheckNum() == "") {
				mui.toast('验证码不能为空');
				return;
			}
			if (self.Password() == "") {
				mui.toast('密码不能为空');
				return;
			}
			if (self.Password() != self.ConPassword()) {
				mui.toast('请输入一致密码');
				return;
			}
			if (self.Agreed() == false) {
				mui.toast('请阅读并同意服务协议');
				return;
			}
			mui.ajax(common.gServerUrl + "API/Account/CheckAccount?userName=" + self.UserName() + "&exists=false", {
				type: "GET",
				success: function() {
					//setLocalItem('Usertype',);
					document.getElementById('registerInfo').className = "pin-mui-content";
					//document.getElementById('registerFirst').style = "display:none";
					document.getElementById('registerFirst').setAttribute("class", "hideDiv");
					self.registerTitle("完善信息");
				},
				error: function() {
					mui.toast("账号已注册，请返回登录~");
				}
			})
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
			mui.ready(function() {
				console.log("点击了生日获取");
				//console.log(self.Birthday());
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
		//提交注册
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
			if (self.UserType() == common.gDictUserType.student) {
				if (common.StrIsNull(self.Birthday()) == "") {
					mui.toast('生日不能为空');
					return;
				}
			}
			if (self.UserType() == common.gDictUserType.teacher) {
				if (common.StrIsNull(self.TeachAge()) == "") {
					mui.toast('教龄不能为空');
					return;
				}
			}
			
			var data = {
				UserName: self.UserName(),
				DisplayName: self.DisplayName(),
				Password: self.Password(),
				UserType: self.UserType(),
				VerifyCode: self.CheckNum(),
				Gender: self.Gender(),
				Province: decodeURI(self.Province()),
				City: decodeURI(self.City()),
				District: decodeURI(self.District()),
				Birthday: self.Birthday(),
				SubjectID: self.SubjectID(),
				TeachAge: self.TeachAge(),
				Introduce: self.Introduce()
			};
			if (self.Base64() != '') {
				data.PhotoBase64 = self.Base64();
			}
			mui.ajax(common.gServerUrl + "API/Account/Register", {
				type: 'POST',
				data: data,
				success: function(responseText) {
					var result = eval("(" + responseText + ")");
					setLocalItem("UserID", result.UserID);
					setLocalItem("UserName", result.UserName);
					setLocalItem("Token", result.Token);
					setLocalItem("UserType", result.UserType);
					//plus.webview.close(index); //关闭首页webview
					mui.toast("注册成功，正在返回...");
					var index = plus.webview.getLaunchWebview() || plus.webview.getWebviewById('indexID'); //获取首页Webview对象
					plus.webview.close(index); //关闭首页
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
			});
		}
	
	//预加载数据
	var userType, genders, places, subjects;
	mui.ready(function() {
		userType = new mui.PopPicker();
		userType.setData([{
			value: common.gDictUserType.student,
			text: '学生'
		}, {
			value: common.gDictUserType.teacher,
			text: '老师'
		}]);
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
	});
}
ko.applyBindings(register);