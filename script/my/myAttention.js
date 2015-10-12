var myAttention = function() {
	var self = this;
	self.FavWorks = ko.observableArray([]);		//收藏的作品列表
	self.FavUsers = ko.observableArray([]);		//收藏的用户列表（老师或学生）
	self.PageWorks = ko.observable(1);			//作品页码
	self.PageUsers = ko.observable(1);			//用户页码

	mui.ready(function() {
		var self = this;
		var ajaxUrl = common.gServerUrl + 'API/Action?userid='
			+ getLocalItem('UserID') + '&targetType=' + common.gDictActionTargetType.Works + '&page='
			+ self.PageWorks();
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				var favWorks = JSON.parse(responseText);
				self.FavWorks(favWorks);
			}
		})
		
		
		var ajaxUrl = common.gServerUrl + 'API/Action?userid='
			+ getLocalItem('UserID') + '&targetType=' + common.gDictActionTargetType.User + '&page='
			+ self.PageUsers();
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				var favUsers = JSON.parse(responseText);
				self.FavUsers(favUsers);
			}
		})
	})

}
ko.applyBindings(myAttention);