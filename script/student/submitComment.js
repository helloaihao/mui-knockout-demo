var viewModel = function() {
	var self = this;
	//self.workID = ko.observable();
	var AuthorID, CommenterID = 99;
	self.WorkTitle = ko.observable();
	self.AuthorName = ko.observable();
	self.teacherName = ko.observable();
	self.teacherSubject = ko.observable();
	
	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		AuthorID = web.AuthorID;
		CommenterID = web.CommenterID;
		self.WorkTitle(web.WorkTitle);
		self.AuthorName(web.AuthorName);
		self.getTeacher();
	});
	
	self.getTeacher = function() {
		mui.ajax(common.gServerUrl +"API/Account/GetInfo?usertype=32&userid=" + CommenterID, {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				self.teacherName(result.DisplayName);
				self.teacherSubject(result.SubjectName);
			},
			error: function() {
				mui.toast("ERROR");
			}
		});
	};
	//popover的关闭功能
	self.closePopover=function(){
		mui('#middlePopover').popover('hide');
	}
};

ko.applyBindings(viewModel);
