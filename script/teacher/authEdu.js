var authEdu = function() {
	var self = this;
	self.Auth=ko.observable({});
	self.AuthStatus = ko.observable("确认信息正确后，请提交审核"); //身份认证状态（显示）
	self.Editable = ko.observable(true); //是否可编辑并提交认证
	self.Image = picture.LastPic; //最后选择的图片或显示的图片
	self.Base64 = picture.LastPicBase64; //最后选择图片的base64字符串

	mui.ready(function() {
		var self = this;
		var data = common.getQueryStringByName('data');
		var auth = JSON.parse(decodeURI(data));
		if (auth && auth.AuthType) {
			self.Auth(auth);
			self.Image(common.gServerUrl + 'Common/GetImage/?url=' + auth.PicPath);
			self.IDNumber(auth.IDNumber);
			self.AuthStatus(common.getAuthStatusStr(auth.Approved, auth.PicPath));
			if (auth.Approved == common.gDictAuthStatusType.Rejected) {
				self.AuthStatus(self.AuthStatus() + '：' + auth.RejectReason);
			}
			self.Editable(auth.Approved == common.gDictAuthStatusType.NotAuth && common.StrIsNull(auth.PicPath) == '');
		}
	})
	self.selectPic = function() {
		if (!self.Editable()) return;

		mui.ready(function() {
			picture.SelectPicture(false); //不需要裁剪
		});
	}

	self.authEduSub = function() {
		var ajaxurl = common.gServerUrl + "API/TeacherAuth/SetEduAuth?" + getLocalItem('UserID');
		mui.ajax(ajaxurl,{
			type:"POST",
			contentType: 'application/json',
			data: JSON.stringify(self.Base64()),
			success: function(responseText) {
				var auth = JSON.parse(responseText);
				if (auth && auth.AuthType) {
					console.log(auth.PicPath);
					self.Auth(auth);
					self.Image(common.gServerUrl + 'Common/GetImage/?url=' + auth.PicPath);
					self.AuthStatus(common.getAuthStatusStr(auth.Approved, auth.PicPath));
					self.Editable(auth.Approved == common.gDictAuthStatusType.NotAuth && common.StrIsNull(auth.PicPath) == '');
				}

				mui.toast('保存成功');
			}
		})
	}
}
ko.applyBindings(authEdu);