var moreInfo = function() {
	var self = this;
	self.VerifyCode = ko.observable(""); //验证码
	self.Password = ko.observable(""); //原密码
	self.newPassword = ko.observable(""); //新密码
	self.ConPassword = ko.observable(""); //确认密码
	var UserName = getLocalItem('UserName'); //手机号
	var UserID = getLocalItem('UserID'); //用户id
	self.RemainTime = ko.observable(0); //验证码剩余等待时间
	self.feedBackText = ko.observable(""); //意见反馈文本
	/*更多页面 js
	 */
	self.goChangePassword = function() {
		//跳转到修改密码页面
		common.transfer('changePassword.html', true)
	}
	self.goFeedback = function() {
		//跳转到意见反馈页面
		common.transfer('feedBack.html')
	}
	self.goRecommendFriends = function() {
		//跳转到推荐好友页面
		common.transfer('recommendFriends.html');
	}
	self.quitLogin = function() {
			//退出登录
			if (getLocalItem('UserID') < 0 || getLocalItem('UserID') == "") {
				mui.toast("没有登录哦");
			} else {
				var index = plus.webview.getLaunchWebview() || plus.webview.getWebviewById('indexID');
				plus.webview.close(index);
				//console.log(index);
				removeLocalItem('UserID');
				removeLocalItem('UserName');
				removeLocalItem('Token');
				removeLocalItem('UserType');
				plus.storage.removeItem(common.getPageName() + '.SubjectName');
				plus.storage.removeItem(common.getPageName() + '.SubjectID');
				plus.storage.removeItem(common.getPageName() + '.WorkTypeName');
				plus.storage.removeItem(common.getPageName() + '.WorkTypeID');

				mui.toast("注销成功");
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
				});
			}
		}
		
	//获取验证码
	self.getVerifyCode = function() {
		//获取验证码
		mui.ajax(common.gServerUrl + "Common/GetVerifyCode?mobile=" + UserName, {
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

	self.saveNewPassword = function() {
			//保存密码
			if (self.VerifyCode() == "") {
				mui.toast('验证码不能为空');
				return;
			}
			if (self.Password() == "") {
				mui.toast('原密码不能为空');
				return;
			}
			if (self.newPassword() == "") {
				mui.toast('新密码不能为空');
				return;
			}
			if (self.newPassword() != self.ConPassword()) {
				mui.toast('请输入一致密码');
				return;
			}
			mui.ajax(common.gServerUrl + "Common/Account/SetPassword", {
				type: 'POST',
				data: {
					ID: self.UserID,
					Password: self.Password(),
					NewPassword: self.newPassword(),
					VerifyCode: self.VerifyCode()
				},
				success: function(responseText) {
					mui.toast("修改成功，正在返回...");
					common.transfer('moreInfo.html');
				}
			});
		}
		/*意见反馈js
		 */
	self.feedBackSub = function() {
		//意见提交
		if (self.feedBackText() == "") {
			mui.toast("请您先写下对我们的宝贵建议~~");
		} else {
			mui.ajax(common.gServerUrl + "API/Feedback", {
				type: 'POST',
				data: {
					UserID: UserID,
					ContentText: self.feedBackText()
				},
				success: function(responseText) {
					mui.toast("提交成功，感谢你的宝贵建议，祝您天天开心");
					mui.back();
				}
			})
		}
	}

}
ko.applyBindings(moreInfo);