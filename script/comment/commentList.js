var commentList = function() {
	var self = this;
	var pageNum = 1;
	var sortID;
	var count = 0; //刷新检测次数
	var contentfreshDownPrompt = "正在刷新...";
	var contentfreshUpPrompt = "正在加载";
	self.comments = ko.observableArray([]);
	self.tmplSubjects = ko.observableArray([]);
	self.tmplSubjectClasses = ko.observableArray([]);

	self.currentSubject = ko.observable({}); //当前选中的科目

	mui.init({
		pullRefresh: {
			container: '#pullrefresh',
			down: {
				contentrefresh: contentfreshDownPrompt,
				callback: pulldownRefresh
			},
			up: {
				contentrefresh: contentfreshUpPrompt,
				callback: pullupRefresh
			}
		}
	});

	mui.plusReady(function() {
		self.getMyComments();
		self.tmplSubjectClasses(common.getAllSubjectClasses());
		self.tmplSubjects(common.getAllSubjects());
		if (self.tmplSubjects().length > 0) {
			self.currentSubject(self.tmplSubjects()[0]);
		}
	});

	mui.back = function() {
		common.confirmQuit();
	}

	//拼接请求Url
	self.getAjaxUrl = function() {
			var ajaxUrl = common.gServerUrl + "API/Comment/GetMyComments?userId=" + getLocalItem("UserID");
			ajaxUrl += "&page=" + pageNum;

			if (typeof self.currentSubject().id === "function") {
				ajaxUrl += "&subject=" + self.currentSubject().id();
				ajaxUrl += "&subjectClass=" + self.currentSubject().subjectClass();
			}
			if (typeof(sortID) === "number" && sortID > 0) {
				ajaxUrl += "&sortType=" + sortID;
			}

			return ajaxUrl;
		}
		//加载点评
	self.getMyComments = function() {
		if (!common.hasLogined()) return;

		mui.ajax(self.getAjaxUrl(), {
			type: 'GET',
			success: function(responseText) {
				//console.log(responseText);
				var result = eval("(" + responseText + ")");
				self.comments(result);
			}
		})
	};

	//选择科目
	self.selectSubject = function(data) {
			self.currentSubject(data);
			self.comments.removeAll(); //先移除所有
			pageNum = 1; //还原为显示第一页
			count = 0; //还原刷新次数
			mui('#pullrefreshMy').pullRefresh().refresh(true);
			self.getMyComments();
			mui('#popSubjects').popover('toggle');
		}
		//点评排序
	self.commentSort = function() {
		self.comments.removeAll(); //先移除所有
		sortID = this.value;
		count = 0; //还原刷新次数
		pageNum = 1; //还原为显示第一页
		mui('#pullrefresh').pullRefresh().refresh(true);
		self.getMyComments();
		mui('#popSort').popover('toggle');
	}

	//跳转至点评详情
	self.goCommentDetail = function(data) {
			common.transfer('commentDetails.html', true, {
				comment: data
			})
		}
		//下拉加载

	function pulldownRefresh() {
		setTimeout(function() {
			mui('#pullrefresh').pullRefresh().endPulldownToRefresh(); //refresh completed
		}, 1500);
	}
	//刷新


	function pullupRefresh() {
		setTimeout(function() {
			pageNum++;
			//console.log(self.getAjaxUrl());
			mui.ajax(self.getAjaxUrl(), {
				type: 'GET',
				success: function(responseText) {
					mui('#pullrefresh').pullRefresh().endPullupToRefresh((++count > 2));
					var result = eval("(" + responseText + ")");
					//console.log(responseText);
					self.comments(self.comments().concat(result));
				},
				error: function(responseText) {}
			});
		}, 1500);
	}

	if (mui.os.plus) {
		mui.plusReady(function() {
			if (plus.os.vendor == 'Apple') {
				mui('.mui-scroll-wrapper').scroll();
			}
		});
	}

	//日期转化为数字
	function dateNum(item) {
		var arr = [];
		arr = item.split("-");
		var str = arr.join("");
		return Number(str);
	}
	//跳转到点评界面
	self.gotoAddComment = function() {
			common.transfer('../works/worksList.html', true, {
				displayCheck: true
			});
		}
		//跳转到登录
	self.goLogin = function() {
		common.transfer('../../modules/account/login.html', true);
	};


}
ko.applyBindings(commentList);