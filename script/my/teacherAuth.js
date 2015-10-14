var teacherAuth = function() {
	var self = this;
	self.IDAuthStatus = ko.observable(""); //身份认证状态
	self.EduAuthStatus = ko.observable(""); //学历认证状态
	self.ProTitleAuthStatus = ko.observable(""); //职称认证状态

	self.IDAuth = ko.observable({}); //身份认证信息
	self.EduAuth = ko.observable({}); //学历认证信息
	self.ProTitleAuth = ko.observable({}); //职称认证信息

	self.auths = ko.observableArray([]);

	self.init = function() {
		mui.ready(function() {
			mui.ajax(common.gServerUrl + "API/TeacherAuth?userId=" + getLocalItem('UserID'), {
				dataType: 'json',
				type: "GET",
				success: function(responseText) {
					self.auths(responseText);
					self.auths().forEach(function(item) {
						switch (item.AuthType) {
							case common.gDictTeacherAuthType.IDAuth:
								self.IDAuthStatus(common.getAuthStatusStr(item.Approved, item.PicPath));
								self.IDAuth(item);
								break;
							case common.gDictTeacherAuthType.EduAuth:
								self.EduAuthStatus(common.getAuthStatusStr(item.Approved, item.PicPath));
								self.EduAuth(item);
								break;
							case common.gDictTeacherAuthType.ProTitleAuth:
								self.ProTitleAuthStatus(common.getAuthStatusStr(item.Approved, item.PicPath));
								self.ProTitleAuth(item);
								break;
						}
					})
					if (self.IDAuthStatus() == '') self.IDAuthStatus('未认证');
					if (self.EduAuthStatus() == '') self.EduAuthStatus('未认证');
					if (self.ProTitleAuthStatus() == '') self.ProTitleAuthStatus('未认证');
				}
			})
		});
	}();

	self.goauthID = function() {
		common.transfer('authID.html?data=' + JSON.stringify(self.IDAuth()));
	}
	self.goauthEdu = function() {
		common.transfer('authEdu.html?data=' + JSON.stringify(self.EduAuth()));
	}
	self.goauthPro = function() {
		common.transfer('authProTitle.html?data=' + JSON.stringify(self.ProTitleAuth()));
	}
}
ko.applyBindings(teacherAuth);