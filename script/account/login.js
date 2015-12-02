var login = function() {
	var self = this;
	self.UserName = ko.observable('');
	self.Password = ko.observable('');
	//登录
	self.checkLogin = function() {
			if (self.UserName() == "") {
				mui.toast("用户名不能为空");
				return;
			}
			if (self.Password() == "") {
				mui.toast("密码为空");
				return;
			}
			mui.ajax(common.gServerUrl + "Common/Login", {
				dataType: 'json',
				type: "POST",
				data: {
					UserName: self.UserName(),
					Password: self.Password()
				},
				success: function(responseText) {
					var result = responseText;
					//console.log(JSON.stringify(result));
					setLocalItem("UserID", result.UserID);
					setLocalItem("UserName", result.UserName);
					setLocalItem("DisplayName", result.DisplayName);
					setLocalItem("Token", result.Token);
					setLocalItem("UserType", result.UserType);
					var index = plus.webview.getLaunchWebview() || plus.webview.getWebviewById('indexID');
					plus.webview.close(index); //关闭首页webview
					mui.toast("登录成功，正在返回...");
					mui.openWindow({
							id: 'indexID',
							url: "../../index.html",
							show: {
								autoShow: false,
								aniShow: "slide-in-right",
								duration: "100ms"
							},
							waiting: {
								autoShow: true
							},
							createNew: true
						})
						//plus.webview.close(plus.webview.currentWebview());
						//plus.webview.create('../../index.html').show();
						//closewebview(login);//登录成功后关闭登录窗口
				}
			});
		}
		//注册页面
	self.registerUser = function() {
			mui.openWindow({
				url: 'register.html',
				id:'register.html',
				show: {
					autoShow: true,
					aniShow: "slide-in-right",
					duration: "100ms"
				},
				waiting: {
					autoShow: false
				}
			});
		}
		//忘记密码
	self.forgetpw = function() {
			mui.openWindow({
				url: "../my/forgetPassword.html",
				show: {
					autoShow: true,
					aniShow: "slide-in-right",
					duration: "100ms"
				},
				waiting: {
					autoShow: false
				}
			})
		}
}
ko.applyBindings(login);