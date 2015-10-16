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
					closewebview(); //关闭首页webview
					var result = responseText; //eval("(" + responseText + ")");
					setLocalItem("UserID", result.UserID);
					setLocalItem("UserName", result.UserName);
					setLocalItem("Token", result.Token);
					setLocalItem("UserType", result.UserType);
					mui.toast("登录成功，正在返回首页...");
					//mui.toast(index.getURL());
					//plus.webview.show(index.getURL());
					//window.location.href="../../index.html";
					common.transfer('../../index.html');


					//var nwaiting=plus.nativeUI.showWaiting();//原生等待框
					//webviewShow = plus.webview.create("../../index.html");//创建界面
					//webviewShow.addEventListener("loaded", function() { //注册新webview的载入完成事件
					//nwaiting.close(); //新webview的载入完毕后关闭等待框
					// webviewShow.show("slide-in-right",150); //把新webview窗体显示出来，显示动画效果为速度150毫秒的右侧移入动画
					// }, false);

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
		index = plus.webview.getLaunchWebview();
	}
	if (window.plus) {
		plusReady();
	} else {
		document.addEventListener('plusready', plusReady, false);
	}

	function closewebview() {
		plus.webview.close(index);
	}


}
ko.applyBindings(login);