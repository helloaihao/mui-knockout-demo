var viewModel = function() {
	var self = this;
	var pageID = 1;
	var thisUrl = common.gServerUrl + "API/Teacher"; //接口url
	var pageUrl = "?page=";
	var subjectUrl = "&subject=";
	var subjectClassUrl = "&subjectClass=";
	var starUrl = "&star=";
	var sortUrl = "&sortType=";
	var refreshFlag = true;
	var ppSubject, ppStar, ppSort; //选择器
	self.teacherList = ko.observableArray([]); //选项文字
	self.dbStar = ko.observable("星级");
	self.dbSort = ko.observable("排序");
	self.SubjectID = ko.observable(0); //上一个页面传递过来的科目ID
	//接收属性
	var starID, sortID;
	var works;
	self.displayCheck = ko.observable(false); //是否显示选择
	self.tmplSubjects = ko.observableArray([]);
	self.tmplSubjectClasses = ko.observableArray([]);

	self.currentSubject = ko.observable({}); //当前选中的科目
	//获取老师列表
	self.getTeacherList = function() {
		var curl = pageUrl + pageID;
		refreshFlag = true;

		if (typeof self.currentSubject().id === "function") {
			curl += subjectUrl + self.currentSubject().id();
			curl += subjectClassUrl + self.currentSubject().subjectClass();
		}
		if (typeof(starID) === "number" && starID > 0) {
			curl += starUrl + starID;
		}
		if (typeof(sortID) === "number" && sortID > 0) {
			curl += sortUrl + sortID;
		}

//		console.log(thisUrl + curl);
		mui.ajax(thisUrl + curl, {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				self.teacherList(result);
			}
		});
	};

	mui.init({
		pullRefresh: {
			container: '#pullrefresh',
			down: {
				callback: pulldownRefresh
			},
			up: {
				contentrefresh: '正在加载...',
				callback: pullupRefresh
			}
		}
	});
	//下拉刷新
	function pulldownRefresh() {
		setTimeout(function() {
			pageID++;
			var curl = pageUrl + pageID;
			if (typeof self.currentSubject().id === "function") {
				curl += subjectUrl + self.currentSubject().id();
				curl += subjectClassUrl + self.currentSubject().subjectClass();
			}
			if (typeof(starID) === "number") {
				curl += starUrl + starID;
			}
			if (typeof(sortID) === "number") {
				curl += sortUrl + sortID;
			}
			mui.ajax(thisUrl + curl, {
				type: 'GET',
				success: function(responseText) {
					if (responseText === "") {
						refreshFlag = false;
					}
					var result = eval("(" + responseText + ")");
					self.teacherList(self.teacherList().concat(result));
					mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
				}
			});
		}, 1500);
	}

	var count = 0;

	function pullupRefresh() {
		setTimeout(function() {
			mui('#pullrefresh').pullRefresh().endPullupToRefresh((++count > 2));
			pageID++;
			var curl = pageUrl + pageID;
			if (typeof self.currentSubject().id === "function") {
				curl += subjectUrl + self.currentSubject().id();
				curl += subjectClassUrl + self.currentSubject().subjectClass();
			}
			if (typeof(starID) === "number") {
				curl += starUrl + starID;
			}
			if (typeof(sortID) === "number") {
				curl += sortUrl + sortID;
			}
			mui.ajax(thisUrl + curl, {
				type: 'GET',
				success: function(responseText) {
					var result = eval("(" + responseText + ")");
					self.teacherList(self.teacherList().concat(result));
				}
			});
		}, 1500);
	};

	if (mui.os.plus) {
		mui.plusReady(function() {
			setTimeout(function() {
				mui('#pullrefresh').pullRefresh().pullupLoading();
			}, 1000);
			if (plus.os.vendor == 'Apple') {
				mui('.mui-scroll-wrapper').scroll();
			}
		});
	} else {
		mui.ready(function() {
			mui('#pullrefresh').pullRefresh().pullupLoading();
		});
	}

	//选择科目
	self.selectSubject = function(data) {
		self.currentSubject(data);
		self.teacherList.removeAll(); //先移除所有

		/*此处可能有bug，若之前所选科目已经刷新到无数据了，
		    再切换为有多页数据的科目，似乎无法翻页了，会一直显示“没有更多数据了”*/
		pageID = 1; //还原为显示第一页
		self.getTeacherList();
		mui('#popSubjects').popover('toggle');
	}

	self.setStar = function() {
		ppStar.show(function(items) {
			self.dbStar(items[0].ctext);
			starID = items[0].value;
			self.getTeacherList();
		});
	};

	self.setSort = function() {
		ppSort.show(function(items) {
			self.dbSort(items[0].text);
			sortID = items[0].value;
			self.getTeacherList();
		});
	}

	self.gotoTeacherInfo = function() {
		var tmpID = this.UserID;
		common.transfer('../../modules/teacher/teacherInfo.html', false, {
			teacherID: tmpID
		});
	};

	self.gotoSubmitClass = function() {
		var radios = document.getElementsByName('radio');
		var pos = -1;
		for (var i = 0; i < radios.length; i++) {
			if (radios[i].checked) {
				pos = i;
			}
		}
		common.transfer('../student/submitComment.html', true, {
			works: self.works,
			teacher: self.teacherList()[pos]
		});
	};
	mui.plusReady(function() {
		var web = plus.webview.currentWebview(); //页面间传值

		if (typeof(web.displayCheck) !== "undefined") {
			self.displayCheck(web.displayCheck);
			self.works = web.works;
		}
		self.getTeacherList();

		self.tmplSubjectClasses(common.getAllSubjectClasses());
		self.tmplSubjects(common.getAllSubjects());
		if (self.tmplSubjects().length > 0) {
			self.currentSubject(self.tmplSubjects()[0]);
		}
	});
};

ko.applyBindings(viewModel);