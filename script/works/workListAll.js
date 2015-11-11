var workListAll = function() {
	var self = this;
	var pageNum = 1;
	var receiverId = 1;
	var thisUrl = common.gServerUrl + "API/Work"; //接口url
	var pageUrl = "?page=";
	var subjectUrl = "&subject=";
	var subjectClassUrl = "&subjectClass=";
	var sortUrl = "&sortType=";
	var sortID;
	var page = 1;
	var count = 0; //上拉刷新检测次数
	var ppSubject, ppSort;
	self.works = ko.observableArray([]);
	self.tmplSubjects = ko.observableArray([]);
	self.tmplSubjectClasses = ko.observableArray([]);

	self.currentSubject = ko.observable({}); //当前选中的科目

	//加载作品
	self.getWorks = function() {
		var curl = pageUrl + page;
		if (typeof self.currentSubject().id === "function") {
			curl += subjectUrl + self.currentSubject().id();
			curl += subjectClassUrl + self.currentSubject().subjectClass();
		}
		if (typeof(sortID) === "number" && sortID > 0) {
			curl += sortUrl + sortID;
		}
		mui.ajax(thisUrl + curl, {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				self.works(result);
			}
		});
		//mui('#pullrefresh').pullRefresh().refresh(true);
	};

	//下拉加载
	self.pulldownRefresh = function() {
		setTimeout(function() {
			mui('#pullrefreshAll').pullRefresh().endPulldownToRefresh(); //refresh completed
		}, 1500);
	}

	//上拉刷新pullupRefresh
	self.pullupRefresh = function(pullrefreshId, worksArray) {
		setTimeout(function() {
			mui('#pullrefreshAll').pullRefresh().endPullupToRefresh((++count > 2));
			//this.endPullUpToRefresh((++count > 2));
			page++;
			var curl = pageUrl + page;
			if (typeof self.currentSubject().id === "function") {
				curl += subjectUrl + self.currentSubject().id();
				curl += subjectClassUrl + self.currentSubject().subjectClass();
			}
			if (typeof(sortID) === "number" && sortID > 0) {
				curl += sortUrl + sortID;
			}
			if (plus.networkinfo.status > 1) {
				mui.ajax(thisUrl + curl, {
					type: 'GET',
					success: function(responseText) {
						var result = eval("(" + responseText + ")");
						self.works(self.works().concat(result));
					}
				});
			} else {
				mui.toast("网络出现错误，请您检查下...");
			}
		}, 1500);
	};
	if (mui.os.plus) {
		mui.plusReady(function() {
			if (plus.os.vendor == 'Apple') {
				mui('.mui-scroll-wrapper').scroll();
			}
		});
	}

	/*	//预加载详情页面
		var worksDetails = mui.preload({
			url: 'WorksDetails.html',
			extras: {
				WorkID: works.ID,
				AuthorID: works.AuthorID
			}
		});*/
	//选择科目
	self.selectSubject = function(data) {
			self.currentSubject(data);
			self.works.removeAll(); //先移除所有
			page = 1; //还原为显示第一页
			count = 0;
			mui('#pullrefreshMy').pullRefresh().refresh(true);
			self.getWorks();
			mui('#popSubjects').popover('toggle');
		}
		//选择类别
	self.selectWorksType = function() {
			self.worksList.removeAll();
			workTypeID = this.value;
			page = 1; //还原为显示第一页
			count = 0; //还原刷新次数
			mui('#pullrefreshMy').pullRefresh().refresh(true);
			self.getWorks();
			mui('#popType').popover('toggle');
			//console.log(this.value);

		}
		//作品排序
	self.sortWorks = function() {
			self.worksList.removeAll();
			workTypeID = this.value;
			page = 1; //还原为显示第一页
			count = 0; //还原刷新次数
			mui('#pullrefreshMy').pullRefresh().refresh(true);
			self.getWorks();
			mui('#popSort').popover('toggle');
		}
		//跳转到作品详情页面
	self.goWorksDetails = function(data) {
		common.transfer("WorksDetails.html", false, {
			works: data
		})
	}
	mui.plusReady(function() {
		self.getWorks();
		var subjectvm = new subjectsViewModel();
		self.tmplSubjectClasses(subjectvm.getSubjectClasses());
		self.tmplSubjects(subjectvm.getSubjects());
		if (self.tmplSubjects().length > 0) {
			self.currentSubject(self.tmplSubjects()[0]);
		}
	});
	
	mui.back = function() {
		common.confirmQuit();
	}
}
ko.applyBindings(workListAll);