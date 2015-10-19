var workList = function() {
	var self = this;
	var pageNum = 1;
	var receiverId = 1;
	var teacherID;
	var thisUrl = common.gServerUrl + "API/Work"; //接口url
	var pageUrl = "?page=";
	var subjectUrl = "&subject=";
	var sortUrl = "&sortType=";
	var subjectID, sortID;
	var page = 1;
	var ppSubject, ppSort;
	self.works = ko.observableArray([]);
	self.displayCheck = ko.observable(false); //控制单选框和确认按钮是否显示
	self.UnreadCount = ko.observable("0");
	self.dbSubject = ko.observable("科目");
	self.dbSort = ko.observable("排序");
	//var receiverId = getLocalItem("UserID");
	//加载作品
	self.getWorks = function() {
		var curl = pageUrl + page;
		if (typeof(subjectID) === "number" && subjectID > 0) {
			curl += subjectUrl + subjectID;
		}
		if (typeof(sortID) === "number" && sortID > 0) {
			curl += sortUrl + sortID;
		}
		mui.ajax(thisUrl + curl, {
			type: 'GET',
			success: function(responseText) {
				//console.log(responseText);
				var result = eval("(" + responseText + ")");
				self.works(result);
			},
			error: function() {
				mui.toast("ERROR");
			}

		});
		//mui('#pullrefresh').pullRefresh().refresh(true);

	};
	//刷新
	var count = 0;
	self.pullupRefresh = function() {
		setTimeout(function() {
			mui('#pullrefresh').pullRefresh().endPullupToRefresh((++count > 2));
			page++;
			var curl = pageUrl + page;
			if (typeof(subjectID) === "number" && subjectID > 0) {
				curl += subjectUrl + subjectID;
			}
			if (typeof(sortID) === "number" && sortID > 0) {
				curl += sortUrl + sortID;
			}
			mui.ajax(thisUrl + curl, {
				type: 'GET',
				success: function(responseText) {
					var result = eval("(" + responseText + ")");
					self.works(self.works().concat(result));
				}
			});
		}, 1500)
		mui.ready(function() {
			mui('#pullrefresh').pullRefresh().pullupLoading();
		})
	};
	//预加载详情页面
	var worksDetails = mui.preload({
		url: 'WorksDetails.html',
		extras: {
			WorkID: works.ID,
			AuthorID: works.AuthorID
		}
	});
	//跳转到作品详情页面
	self.goWorksDetails = function() {
		var works = this;
		mui.openWindow({
			url: 'WorksDetails.html',
			show: {
				autoShow: true,
				aniShow: "slide-in-right",
				duration: "100ms"
			},
			waiting: {
				autoShow: false
			},
			extras: {
				WorkID: works.ID,
				AuthorID: works.AuthorID
			}
		});
	}

	self.gotoSubmitClass = function() {
			var radios = document.getElementsByName('radio');
			var pos = -1;
			for (var i = 0; i < radios.length; i++) {
				if (radios[i].checked) {
					pos = i;
				}
			}
			mui.openWindow({
				url: '../student/submitClass.html',
				show: {
					autoShow: true,
					aniShow: "slide-in-right",
					duration: "100ms"
				},
				waiting: {
					autoShow: false
				},
				extras: {
					WorkID: works.ID,
					AuthorID: works.AuthorID,
					WorkTitle: self.works()[pos].Title,
					AuthorName: self.works()[pos].AuthorName,
					CommenterID: teacherID
				}
			});
		}
		//跳转至消息页面
	self.goMessageList = function() {
			common.gotoMessage();
		}
		//获取未读消息数量
	self.getUnreadCount = function() {
		common.getUnreadCount(self.UnreadCount());
	}

	self.setSubject = function() {
		ppSubject.show(function(items) {
			self.dbSubject(items[0].text);
			subjectID = items[0].value;
			self.getWorks();
		});
	};

	self.setSort = function() {
		ppSort.show(function(items) {
			self.dbSort(items[0].text);
			sortID = items[0].value;
			self.getWorks();
		});
	};

	self.gotoAddWorks = function() {
		common.transfer('../../modules/works/addWorks.html', true);
	};
	ppSubject = new mui.PopPicker();
	mui.ajax(common.gServerUrl + "Common/Subject/Get", {
			dataType: 'json',
			type: "GET",
			success: function(responseText) {
				var arr = common.JsonConvert(responseText, 'ID', 'SubjectName');
				ppSubject.setData(arr);
			}
		});
	ppSort = new mui.PopPicker();
	ppSort.setData(common.gJsonWorkSort);
	self.getWorks();
}
ko.applyBindings(workList);