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
			/*此处可能有bug，若之前所选科目已经刷新到无数据了，
			    再切换为有多页数据的科目，似乎无法翻页了，会一直显示“没有更多数据了”*/
			page = 1;
			count = 0;
			mui('#pullrefreshMy').pullRefresh().refresh(true); //还原为显示第一页
			self.getWorks();
			mui('#popSubjects').popover('toggle');
		}
		//作品排序
	var ul = document.getElementById('sortList');
	var lis = ul.getElementsByTagName("li");
	for (var i = 0; i < lis.length; i++) {
		lis[i].onclick = function() {
			if (this.id == "defaultSort") {
				//默认排序
				self.getWorks();
			} else if (this.id == "dateSort") {
				//日期排序
				self.works().sort(function(a, b) {
					//从小到大
					return dateNum(a.AddTime.split(' ')[0]) > dateNum(b.AddTime.split(' ')[0]) ? 1 : -1
				});

			} else if (this.id == "nameSort") {
				//名称排序
				self.works().sort(function(a, b) {
					return a.Title.localeCompare(b.Title);
				})

			}

		}
	}
	//日期转化为数字
	function dateNum(item) {
		var arr = [];
		arr = item.split("-");
		var str = arr.join("");
		return Number(str);
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
		common.confirmQuit();
	});
}
ko.applyBindings(workListAll);