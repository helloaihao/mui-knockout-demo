var myUserAttented = function() {
	var self = this;
	self.AttentionList = ko.observableArray([]); //关注我的人列表
	self.Photo = ko.observable('../../images/my-default.png'); //头像路径
	var Page = 1; //页码

	mui.ready(function() {
		var self=this;
		var attentedUrl = common.gServerUrl + "API/Action/GetFavoritedUserList?userId="+ getLocalItem("UserID");
		mui.ajax(attentedUrl, {
			type: 'GET',
			success: function(responseText) {
				var attented = JSON.parse(responseText);
				self.AttentionList(attented);
			}
		})
	})

}
ko.applyBindings(myUserAttented);