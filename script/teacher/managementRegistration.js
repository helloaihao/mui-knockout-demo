var manageRegistration = function() {
	var self = this;
	self.manageRegList = ko.observableArray([]); //管理报名者数组列表
	var checkAll = document.getElementById('checkId');

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
	checkAll.addEventListener('tap', function() {
		var checkboxArray = document.body.querySelectorAll('input[type="checkbox"]');
		if (checkAll.checked) {
			checkboxArray.forEach(function(box) {
				box.checked = true;
			})
		}else{
			checkboxArray.forEach(function(box) {
				box.checked = false;
			})
		}

	});
	self.ensure=function(){
		mui.toast('点击确定按钮');
	}


}
ko.applyBindings(manageRegistration);