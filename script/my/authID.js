var authID = function() {
	var self = this;
	self.IDNumber = ko.observable(""); //身份证号码
	self.Auth = ko.observable({}); //身份认证信息
	self.AuthStatus = ko.observable('确认信息正确后，请提交审核'); //身份认证状态（显示）
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
			if(auth.Approved == common.gDictAuthStatusType.Rejected){
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

	self.authIDSub = function() {
		if (!self.Editable()) return;

		if (self.Image() == '') {
			mui.toast('请选择证件照片');
			return;
		}
		if (self.IDNumber() == '') {
			mui.toast('请输入证件号码');
			return;
		}

		var ajaxUrl = common.gServerUrl + 'API/TeacherAuth/SetIDAuth?userId=' +
			getLocalItem('UserID') + '&idNumber=' + self.IDNumber();
//		var ajaxUrl = common.gServerUrl + 'API/TeacherAuth/SetIDAuth?userId=5&idNumber=' + self.IDNumber();
//		console.log(ajaxUrl);
		mui.ajax(ajaxUrl, {
			type: 'POST',
			contentType: 'application/json', //如此contentType/data的写法，才能上传图片的base64
			data: JSON.stringify(self.Base64()),
			success: function(responseText) {
				var auth = JSON.parse(responseText);
				if (auth && auth.AuthType) {
					console.log(auth.PicPath);
					self.Auth(auth);
					self.Image(common.gServerUrl + 'Common/GetImage/?url=' + auth.PicPath);
					self.IDNumber(auth.IDNumber);
					self.AuthStatus(common.getAuthStatusStr(auth.Approved, auth.PicPath));
					self.Editable(auth.Approved == common.gDictAuthStatusType.NotAuth && common.StrIsNull(auth.PicPath) == '');
				}

				mui.toast('保存成功');
			}
		})
	}
}
ko.applyBindings(authID);