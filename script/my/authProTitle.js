var authProTitle=function(){
	var self=this;
	self.Editable = ko.observable(true); //是否可编辑并提交认证
	self.ProfessionalText=ko.observable("请选择职称");
	self.Professional=ko.observable(0);
	self.Image = picture.LastPic; //最后选择的图片或显示的图片
	self.Base64 = picture.LastPicBase64; //最后选择图片的base64字符串
	
	
	var  ProfessionalType;
	mui.ready(function() {
			ProfessionalType = new mui.PopPicker();
			ProfessionalType.setData(common.gProfessionalType);
		});
		//职称选择
	self.chooseAuthPro=function(){
		ProfessionalType.show(function(items) {
				self.ProfessionalText(items[0].text);
				self.Professional(items[0].value);
			});
	}
	mui.ready(function() {
		var self = this;
		var data = common.getQueryStringByName('data');
		var auth = JSON.parse(decodeURI(data));
		if (auth && auth.AuthType) {
			self.Auth(auth);
			self.Image(common.gServerUrl + 'Common/GetImage/?url=' + auth.PicPath);
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
	self.authProTitleSub=function(){
		if(self.Professional()==0){
			mui.toast("请选择职称");
			return;
		}
		var ajaxurl=common.gServerUrl+"API/TeacherAuth/SetProTitleAuth?userId="+
			getLocalItem('UserID') + '&proTitleType=' + self.Professional();
		mui.ajax(ajaxurl,{
			type:"POST",
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
ko.applyBindings(authProTitle);