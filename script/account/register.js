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
	self.WaitTime = 60; //验证码默认等待时间

	var userType;
	mui.ready(function() {
		userType = new mui.PopPicker();
		userType.setData([{
			value: common.gDictUserType.student,
			text: '学生'
		}, {
			value: common.gDictUserType.teacher,
			text: '老师'
		}]);
	});

	self.setUserType = function() {
		userType.show(function(items) {
			self.UserTypeText(items[0].text);
			self.UserType(items[0].value);
		});
	}

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
							self.RemainTime(self.WaitTime);
							self.CheckTime();
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
		if(self.UserType() <= 0){
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

		mui.ajax(common.gServerUrl + "API/Account/Register", {
			type: 'POST',
			data: {
				UserName: self.UserName(),
				Password: self.Password(),
				UserType: self.UserType(),
				VerifyCode: self.CheckNum()
			},
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				setLocalItem("UserID", result.UserID);
				setLocalItem("UserName", result.UserName);
				setLocalItem("Token", result.Token);
				setLocalItem("UserType", result.UserType);

				common.transfer('../my/myInfo.html', false, {
					isRegister: true
				});
				/*if (self.UserType() == common.gDictUserType.teacher) {
					common.transfer('registerTeacher.html');
				} else {
					common.transfer('registerStudent.html');
				}*/
			}
		});
	}
}
ko.applyBindings(register);