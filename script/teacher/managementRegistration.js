var manageRegistration = function() {
	var self = this;
	self.manageRegList = ko.observableArray([]); //管理报名者数组列表
	self.checkedAllStatus = ko.observable(false); //全选按钮状态
	self.checkedChildStatus = ko.observable();

	mui.ready(function() {
		var ajaxUrl = common.gServerUrl + "API/Action/GetFavoritedUserList?userId=" + getLocalItem("UserID");
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				var manageReg = JSON.parse(responseText);
				//var favUsers = eval("(" + responseText + ")");
				self.manageRegList(manageReg);
			}
		})

	})
	self.checkedEvent = function() {
		if (checkedAllStatus) {
			self.checkedChildStatus(true);
		} else {
			self.checkedChildStatus(false);
		}
	}
	self.checkedAll=function(){
		var chechAll=document.getElementById("checkId");
		chechAll.checked=true;
	}

}
ko.applyBindings(manageRegistration);