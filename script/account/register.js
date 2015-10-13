var register = function() {

	var cleanvalue = "";
	self.UserTypeText = ko.observable("请选择用户类型");
	self.UserName = ko.observable("");//用户名，即手机号
	self.Password = ko.observable("");//密码
	self.CheckNum = ko.observable("");//验证码
	self.ConPassword = ko.observable("");//确认密码
	self.UserType = ko.observable(); //用户类型
	self.RemainTime = ko.observable(0); //验证码剩余等待时间
	self.WaitTime = 15; //验证码默认等待时间

	var userType;	
	mui.ready(function() {
			userType = new mui.PopPicker();
			userType.setData([{
				value: 64,
				text: '学生'
			}, {
				value: 32,
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
				mui.ajax(common.gServerUrl + "API/Account/CheckAccount?userName=" + self.UserName()+"&exists=false", {
					type: 'GET',
					success: function(responseText) {
						mui.ajax(common.gServerUrl + "Common/GetVerifyCode?mobile=" + self.UserName(), {
							//dataType:'json',
							type: 'GET',
							success: function(responseText) {
								//var result = eval("(" + responseText + ")");
								//mui.toast(responseText);
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
		if (self.UserName() == "") {
			mui.toast('手机号不能为空');
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

		mui.ajax(common.gServerUrl + "API/Account/Register", {
			type: 'POST',
			data: {
				UserName: self.UserName(),
				Password: self.Password(),
				UserType: self.UserType(),
				VerifyCode: self.CheckNum()
			},
			success: function(responseText) {
				//alert(responseText);
				var result = eval("(" + responseText + ")");
				setLocalItem("UserID", result.UserID);
				setLocalItem("UserName", result.UserName);
				setLocalItem("Token", result.Token);
				setLocalItem("UserType", result.UserType);

				/*alert("登录成功，请跳转"); */ //此处应跳转至主页面
				if (self.UserType() == 32) {
					//老师注册页
					window.location = "registerTeacher.html";
				} else {
					//学生注册页
					window.location = "registerStudent.html";
				}
			}
		});

	}
}
ko.applyBindings(register);