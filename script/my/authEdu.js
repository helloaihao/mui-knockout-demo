var authEdu = function() {
	var self = this;
	self.Auth=ko.observable({});
	self.AuthStatus = ko.observable("确认信息正确后，请提交审核"); //身份认证状态（显示）
	self.Editable = ko.observable(true); //是否可编辑并提交认证
	self.Base64 = ko.observable(''); //所选图片的base64字符串
	self.Path = ko.observable(''); //图片路径

	mui.plusReady(function() {
		var self = this;
		var web = plus.webview.currentWebview();
		if (typeof(web.data) !== "undefined") {
			var auth = web.data;
		
			if (auth && auth.AuthType) {
				self.Auth(auth);
				self.Path(common.getPhotoUrl(auth.PicPath));
				self.AuthStatus(common.getAuthStatusStr(auth.Approved, auth.PicPath));
				if (auth.Approved == common.gDictAuthStatusType.Rejected) {
					self.AuthStatus(self.AuthStatus() + '：' + auth.RejectReason);
				}
				self.Editable(auth.Approved == common.gDictAuthStatusType.NotAuth && common.StrIsNull(auth.PicPath) == '');
			}
		}
	})
	
	self.selectPic = function() {
		if (!self.Editable()) return;

		mui.ready(function() {
			picture.SelectPicture(false, false, function(retValue) {
				self.Path(retValue[0].Base64);
				self.Base64(retValue[0].Base64);
			}); //不需要裁剪，单选
		})
	}

	self.authEduSub = function() {
		if (!self.Editable()) return;

		if (self.Base64() == '') {
			mui.toast('请选择证件照片');
			return;
		}
		var ajaxurl = common.gServerUrl + "API/TeacherAuth/SetEduAuth?userId=" + getLocalItem('UserID');
		mui.ajax(ajaxurl,{
			type:"POST",
			contentType: 'application/json',
			data: JSON.stringify(self.Base64()),
			success: function(responseText) {
				var auth = JSON.parse(responseText);
				if (auth && auth.AuthType) {
					self.Auth(auth);
					self.Path(common.getPhotoUrl(auth.PicPath));
					self.AuthStatus(common.getAuthStatusStr(auth.Approved, auth.PicPath));
					self.Editable(auth.Approved == common.gDictAuthStatusType.NotAuth && common.StrIsNull(auth.PicPath) == '');
				}

				mui.toast('保存成功');
			}
		})
	}
}
ko.applyBindings(authEdu);