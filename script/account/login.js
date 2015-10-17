var login = function() {
	var self = this;
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
					closeWebview(index); //关闭首页webview
					//mui.toast(index.getURL() + "第2");
					var result = responseText; //eval("(" + responseText + ")");
					setLocalItem("UserID", result.UserID);
					setLocalItem("UserName", result.UserName);
					setLocalItem("Token", result.Token);
					setLocalItem("UserType", result.UserType);
					mui.toast("登录成功，正在返回首页...");
					common.transfer('../../index.html');
					//plus.webview.create('../../index.html',plus.runtime.appid).show();
					//closewebview(login);//登录成功后关闭登录窗口
					//mui.toast(index.getURL() + "第3");
					//mui.toast(index.getURL());
					//plus.webview.show(index.getURL());
					//window.location.href="../../index.html";
					//common.transfer('../../index.html');
					 
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
	function plusReady() {
		//获取当前应用首页窗口对象
		index = plus.webview.getWebviewById(plus.runtime.appid);
		login=plus.webview.currentWebview();
	}
	if (window.plus) {
		plusReady();
	} else {
		document.addEventListener('plusready', plusReady, false);
	}
	//关闭页面的函数
	function closeWebview(webviewObj) {
		plus.webview.close(webviewObj);
		mui.toast("关闭页面")
	}
	//创建窗口页面的函数
	function createWebview(webviewUrl,webviewId){
		plus.webview.create(webviewUrl,webviewId);
	}


}
ko.applyBindings(login);