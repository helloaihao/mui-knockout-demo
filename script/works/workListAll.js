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
	common.gJsonWorkTypeTeacher.unshift({
		value: 0,
		text: "全部"
	});
	//var contentnomore = "上拉显示更多"
	var ppSubject, ppSort;
	self.works = ko.observableArray([]);
	self.tmplSubjects = ko.observableArray([]);
	self.tmplSubjectClasses = ko.observableArray([]);
	self.currentSubject = ko.observable({}); //当前选中的科目
	self.currentWorkTypes = ko.observable(0);
	self.currentSort = ko.observable(5);

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
		if (typeof self.currentSubject().id === "number") {
			curl += subjectUrl + self.currentSubject().id;
			curl += subjectClassUrl + self.currentSubject().subjectClass;
		}
		if (typeof(sortID) === "number" && sortID > 0) {
			curl += sortUrl + sortID;
		}
		if (typeof(workTypeID) === "number" && workTypeID > 0) {
			curl += workTypeUrl + workTypeID;
		}
		mui.ajax(thisUrl + curl, {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				self.works(result);
			}
		});
	}

	//下拉加载
	function pulldownRefresh() {
		//console.log('上拉');
		setTimeout(function() {
			mui('#pullrefreshAll').pullRefresh().endPulldownToRefresh(); //refresh completed
			var curl = pageUrl + 1;
			if (typeof self.currentSubject().id === "number") {
				curl += subjectUrl + self.currentSubject().id;
				curl += subjectClassUrl + self.currentSubject().subjectClass;
			}
			if (typeof(sortID) === "number" && sortID > 0) {
				curl += sortUrl + sortID;
			}
			if (typeof(workTypeID) === "number" && workTypeID > 0) {
				curl += workTypeUrl + workTypeID;
			}
			if (plus.networkinfo.getCurrentType() > 1) {
				//contentnomore = "上拉显示更多";
				mui.ajax(thisUrl + curl, {
					type: 'GET',
					success: function(responseText) {
						self.works.removeAll(); //先移除所有,防止视频已删除还保留
						var result = eval("(" + responseText + ")");
						self.works(result);
					}
				});
			}
		}, 1500);

	}

	//上拉刷新pullupRefresh
	function pullupRefresh(pullrefreshId, worksArray) {
		setTimeout(function() {
			//this.endPullUpToRefresh((++count > 2));
			page++;
			var curl = pageUrl + page;
			if (typeof self.currentSubject().id === "number") {
				curl += subjectUrl + self.currentSubject().id;
				curl += subjectClassUrl + self.currentSubject().subjectClass;
			}
			if (typeof(sortID) === "number" && sortID > 0) {
				curl += sortUrl + sortID;
			}
			if (typeof(workTypeID) === "number" && workTypeID > 0) {
				curl += workTypeUrl + workTypeID;
			}
			//console.log(thisUrl + curl);
			if (plus.networkinfo.getCurrentType() > 1) {
				mui.ajax(thisUrl + curl, {
					type: 'GET',
					success: function(responseText) {
						var result = eval("(" + responseText + ")");
						if (result.length > 0) {
							mui('#pullrefreshAll').pullRefresh().endPullupToRefresh(false);
							self.works(self.works().concat(result));
							if (self.works().length <= 2) {
								mui('#pullrefreshAll').pullRefresh().disablePullupToRefresh();
							} else {
								mui('#pullrefreshAll').pullRefresh().enablePullupToRefresh();
							}
						}else{
							mui('#pullrefreshAll').pullRefresh().endPullupToRefresh(true);
						}

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
			self.currentWorkTypes(this.value);
			self.works.removeAll();
			workTypeID = this.value;
			page = 1; //还原为显示第一页
			count = 0; //还原刷新次数
			mui('#pullrefreshAll').pullRefresh().refresh(true);
			self.getWorks();
			mui('#popType').popover('toggle');

		}
		//作品排序
	self.sortWorks = function() {
			self.currentSort(this.value);
			self.works.removeAll();
			sortID = this.value;
			page = 1; //还原为显示第一页
			count = 0; //还原刷新次数
			mui('#pullrefreshAll').pullRefresh().refresh(true);
			self.getWorks();
			console.log(sortID);
			mui('#popSort').popover('toggle');
		}
		//跳转到作品详情页面
	self.goWorksDetails = function(data) {
			common.transfer("WorksDetails.html", false, {
				works: data
			}, false, false)
		}
		/*	self.IsAuthor = ko.computed(function() {
					if (self.UserID == this.AuthorID())
						return true;
					else
						return false;
				})*/
		//赞
	self.Like = function() {
		var tmp = common.clone(this);
		//mui.toast(this.LikeCount);
		if (this.AuthorID == self.UserID) {
			mui.toast("作者本人不允许赞");
			return
		} else {
			var ret = common.postAction(common.gDictActionType.Like, common.gDictActionTargetType.Works, this.ID);
			if (ret) {
				tmp.LikeCount = tmp.LikeCount + 1;
				self.works.replace(this, tmp);
				mui.toast('感谢您的赞许');
			}
		}
	}
	mui.plusReady(function() {
		self.getWorks();
		self.tmplSubjectClasses(common.getAllSubjectClasses());
		self.tmplSubjects(common.getAllSubjects());
		if (self.tmplSubjects().length > 0) {
			self.currentSubject(self.tmplSubjects()[0]);
		}
	});
	window.addEventListener('refreshwoks', function(event) {
		self.works().forEach(function(item) {
			var tmp = common.clone(item);
			if (item.ID == event.detail.worksId) {
				tmp.LikeCount = event.detail.LikeCount;
				self.works.replace(item, tmp);
			}
		});
	});
}
ko.applyBindings(workListAll);