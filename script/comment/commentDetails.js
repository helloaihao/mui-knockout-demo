var viewModel = function() {
	var self = this;
	self.title = ko.observable("");
	self.addTime = ko.observable("");
	self.readCount = ko.observable("");
	self.likeCount = ko.observable("");
	self.remark = ko.observable("");
	self.subjectName = ko.observable("");
	self.contentText = ko.observable("");
	self.comments = ko.observableArray([]);
	
	self.getComment = function() {
		mui.ajax(common.gServerUrl +"API/Comment/GetMyComments?UserId=101", {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				self.title(result.WorkTitle);
				self.addTime(result.AddTime);
			},
			error: function() {
				mui.toast("ERROR");
			}
		});
	};
	
	self.setComment = function() {
		mui.ajax(common.gServerUrl + "API/Comment/AddComment", {
				type: "POST",
				data: {
					AuthorID: getLocalItem("UserID"),
					WorkTitle: self.title()
				},
				success: function(responseText) {
					mui.toast("添加成功");
				},
				error: function(xhr) {
					mui.toast("error");
				}
			});
	}();
};

ko.applyBindings(viewModel);
