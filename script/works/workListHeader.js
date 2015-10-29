var workListHeader = function() {
	var self = this;
//	self.displayCheck = ko.observable(false); //控制单选框和确认按钮是否显示
//	self.UnreadCount = ko.observable("0");
//	self.dbSubject = ko.observable("科目");
//	self.dbSort = ko.observable("排序");
	//跳转至消息页面
	self.goMessageList = function() {
			common.gotoMessage();
		}
		//获取未读消息数量
	self.getUnreadCount = function() {
			common.getUnreadCount(self.UnreadCount());
		}
		//添加作品
	self.gotoAddWorks = function() {
		common.transfer('workListHeader.html')
			//common.transfer('../../modules/works/addWorks.html', true);
	};
//	self.setSubject = function() {
//		ppSubject.show(function(items) {
//			self.dbSubject(items[0].text);
//			subjectID = items[0].value;
//			self.getWorks();
//		});
//	};
//
//	self.setSort = function() {
//		ppSort.show(function(items) {
//			self.dbSort(items[0].text);
//			sortID = items[0].value;
//			self.getWorks();
//		});
//	};
//
//	mui.plusReady(function() {
//		var web = plus.webview.currentWebview();
//		if (typeof(web.teacherID) !== "undefined") {
//			teacherID = web.teacherID;
//			self.displayCheck(web.displayCheck);
//		}
//		ppSubject = new mui.PopPicker();
//		mui.ajax(common.gServerUrl + "Common/Subject/Get", {
//			dataType: 'json',
//			type: "GET",
//			success: function(responseText) {
//				var arr = common.JsonConvert(responseText, 'ID', 'SubjectName');
//				ppSubject.setData(arr);
//			}
//		});
//		ppSort = new mui.PopPicker();
//		ppSort.setData(common.gJsonWorkSort);
//		self.getWorks();
//	});
}
ko.applyBindings(workListHeader);