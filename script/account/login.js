var login = function() {
	var self = this;
	var networkState; //网络状态
	self.UserName = ko.observable('');
	self.Password = ko.observable('');
	var index;
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
					//mui.toast(index.getURL() + "第1");
					var index = plus.webview.getLaunchWebview() || plus.webview.getWebviewById('indexID');
					plus.webview.close(index); //关闭首页webview
					//mui.toast(index.getURL() + "第2");
					var result = responseText; //eval("(" + responseText + ")");
					setLocalItem("UserID", result.UserID);
					setLocalItem("UserName", result.UserName);
					setLocalItem("Token", result.Token);
					setLocalItem("UserType", result.UserType);
					mui.toast("登录成功，正在返回...");
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
		// H5 plus事件处理

//	function plusReady() {
//		//获取当前应用首页窗口对象
//
//		console.log(index);
//		networkState = plus.networkinfo.getCurrentType();
//	}
//	if (window.plus) {
//		plusReady();
//	} else {
//		document.addEventListener('plusready', plusReady, false);
//	}
}
ko.applyBindings(login);