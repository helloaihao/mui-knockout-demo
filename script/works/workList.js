var workList = function() {
	var self = this;
	var pageNum = 1;
	var receiverId = 1;
	var sortID;
	self.teacherInfo = ko.observable(); //点评老师对象
	self.works = ko.observableArray([]);
	self.displayCheck = ko.observable(false); //控制单选框和确认按钮是否显示
	self.UnreadCount = ko.observable("0");
	self.dbSubject = ko.observable("科目");
	self.dbSort = ko.observable("排序");
	//var receiverId = getLocalItem("UserID");

	self.tmplSubjects = ko.observableArray([]);
	self.tmplSubjectClasses = ko.observableArray([]);

	self.currentSubject = ko.observable({}); //当前选中的科目

	//拼接请求Url
	self.getAjaxUrl = function() {
		var ajaxUrl = common.gServerUrl + "API/Work?userID=" + getLocalItem("UserID");
		ajaxUrl += "&page=" + pageNum;

		if (typeof self.currentSubject().id === "function") {
			ajaxUrl += "&subject=" + self.currentSubject().id();
			ajaxUrl += "&subjectClass=" + self.currentSubject().subjectClass();
		}
		if (typeof(sortID) === "number" && sortID > 0) {
			ajaxUrl += "&sortType=" + sortID;
		}
		//mui.toast(ajaxUrl);
		return ajaxUrl;
	}

	//加载作品
	self.getWorks = function() {
		mui.ajax(self.getAjaxUrl(), {
			type: 'GET',
			success: function(responseText) {
//				console.log(responseText);
				var result = eval("(" + responseText + ")");
				self.works(result);
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

	document.querySelector('#dbSubject').addEventListener('tap', function() {
		mui('#popSubjects').popover('toggle');
	});
	document.querySelector('#dbSort').addEventListener('tap', function() {
		mui('#middlePopover2').popover('toggle');
	});

	function pulldownRefresh() {
		setTimeout(function() {
			pageNum++;
			mui.ajax(self.getAjaxUrl(), {
				type: 'GET',
				success: function(responseText) {
					var result = eval("(" + responseText + ")");
					self.works(self.works().concat(result));
					mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
				}
			});
		}, 1500)
	}

	//刷新
	var count = 0;

	function pullupRefresh() {
		setTimeout(function() {
			mui('#pullrefresh').pullRefresh().endPullupToRefresh((++count > 2));
			pageNum++;
			mui.ajax(self.getAjaxUrl(), {
				type: 'GET',
				success: function(responseText) {
					var result = eval("(" + responseText + ")");
					self.works(self.works().concat(result));
				}
			});
		}, 1500)
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
		self.works.removeAll(); //先移除所有

		/*此处可能有bug，若之前所选科目已经刷新到无数据了，
		    再切换为有多页数据的科目，似乎无法翻页了，会一直显示“没有更多数据了”*/
		pageNum = 1; //还原为显示第一页
		self.getWorks();
		mui('#popSubjects').popover('toggle');
	}

	//	//预加载详情页面
	//	var worksDetails = mui.preload({
	//		url: 'WorksDetails.html',
	//		extras: {
	//			WorkID: works
	//		}
	//	});

	//跳转到作品详情页面
	self.goWorksDetails = function(data) {
		common.transfer("WorksDetails.html", false, {
			works: data
		})
	}

	self.gotoSubmitClass = function() {
		var radios = document.getElementsByName('radio');
		var pos = -1;
		for (var i = 0; i < radios.length; i++) {
			if (radios[i].checked) {
				pos = i;
				break;
			}
		}
		if (pos == -1) {
			mui.toast("请选择需要点评的作品");
			return;
		}
		var info = self.teacherInfo();
		if (typeof(info) === "undefined") {
			common.transfer('../teacher/teacherListHeader.html', true, {
				works: self.works()[pos],
				displayCheck: true
			});
		} else {
			common.transfer('../student/submitComment.html', true, {
				works: self.works()[pos],
				teacher: teacherInfo()
			});
		}
	}

	self.gotoAddWorks = function() {
		common.transfer('addWorks.html')
	};
	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		if (typeof(web.displayCheck) !== "undefined") {
			self.teacherInfo(web.teacher);
			self.displayCheck(web.displayCheck);
		}

		self.tmplSubjectClasses(common.getAllSubjectClasses());
		self.tmplSubjects(common.getAllSubjects());
		if(self.tmplSubjects().length > 0){
			self.currentSubject(self.tmplSubjects()[0]);
		}
		
		self.getWorks();
	});
}

ko.applyBindings(workList);