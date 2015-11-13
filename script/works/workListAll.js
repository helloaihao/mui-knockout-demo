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
	var workTypeUrl = "&workType=";
	var workTypeID;
	var page = 1;
	var count = 0; //上拉刷新检测次数
	self.sortList = ko.observableArray([]);
	//var contentnomore = "上拉显示更多"
	var ppSubject, ppSort;
	self.works = ko.observableArray([]);
	self.tmplSubjects = ko.observableArray([]);
	self.tmplSubjectClasses = ko.observableArray([]);
	self.currentSubject = ko.observable({}); //当前选中的科目

	//刷新界面
	mui.init({
		pullRefresh: {
			container: '#pullrefreshAll',
			up: {
				contentrefresh: '正在加载...',
				callback: pullupRefresh
			},
			down: {
				callback: pulldownRefresh
			}
		}
	});
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
	function pulldownRefresh() {
		setTimeout(function() {
			mui('#pullrefreshAll').pullRefresh().endPulldownToRefresh(); //refresh completed
			setTimeout(function() {
				var curl = pageUrl + "1";
				if (typeof self.currentSubject().id === "function") {
					curl += subjectUrl + self.currentSubject().id();
					curl += subjectClassUrl + self.currentSubject().subjectClass();
				}
				if (typeof(sortID) === "number" && sortID > 0) {
					curl += sortUrl + sortID;
				}

				if (plus.networkinfo.getCurrentType() > 1) {
					//contentnomore = "上拉显示更多";
					mui.ajax(thisUrl + curl, {
						type: 'GET',
						success: function(responseText) {
							var result = eval("(" + responseText + ")");
							self.works(self.works().concat(result));
						}
					});
				}
			}, 1500);
		}, 1500);
	}

	//上拉刷新pullupRefresh
	function pullupRefresh(pullrefreshId, worksArray) {
		setTimeout(function() {
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
			if (typeof(workTypeID) === "number" && workTypeID > 0) {
				curl += workTypeUrl + workTypeID;
			}


			if (plus.networkinfo.getCurrentType() > 1) {
				//contentnomore = "上拉显示更多";
				mui('#pullrefreshAll').pullRefresh().endPullupToRefresh((++count > 2));
				mui.ajax(thisUrl + curl, {
					type: 'GET',
					success: function(responseText) {
						var result = eval("(" + responseText + ")");
						self.works(self.works().concat(result));
					}
				});

			};
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
			mui('#pullrefreshAll').pullRefresh().refresh(true);
			self.getWorks();
			mui('#popSubjects').popover('toggle');
		}
		//选择类别
	self.selectWorksType = function() {
			self.works.removeAll();
			workTypeID = this.value;
			page = 1; //还原为显示第一页
			count = 0; //还原刷新次数
			mui('#pullrefreshAll').pullRefresh().refresh(true);
			self.getWorks();
			mui('#popType').popover('toggle');
			//console.log(this.value);

		}
		//作品排序
	self.sortWorks = function() {
			self.works.removeAll();
			workTypeID = this.value;
			page = 1; //还原为显示第一页
			count = 0; //还原刷新次数
			mui('#pullrefreshAll').pullRefresh().refresh(true);
			self.getWorks();
			mui('#popSort').popover('toggle');
		}
		//跳转到作品详情页面
	self.goWorksDetails = function(data) {
		common.transfer("WorksDetails.html", false, {
			works: data
		})
	}

	Array.prototype.removeArray=function(dx) {
		for (var i = 0, n = 0; i < this.length; i++) {
			if (this[i] != this[dx]) {
				this[n++] = this[i]
			}
		}
		this.length -= 1
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