var commentList = function() {
	var self = this;

	var workType = common.gJsonWorkTypeStudent[0].value; //默认显示学生作品的点评请求
	
	var pageNum = 1;
	var sortID;
	var count = 0; //刷新检测次数
	self.comments = ko.observableArray([]);
	self.tmplSubjects = ko.observableArray([]);
	self.tmplSubjectClasses = ko.observableArray([]);
	self.isTeacher = ko.observable(true);
	self.commentDes = ko.observable("还没有点评过作品呢~");
	self.currentSubject = ko.observable({}); //当前选中的科目
	self.currentSort = ko.observable(8);

	mui.init({
		pullRefresh: {
			container: '#pullrefresh',
			down: {
				contentrefresh: common.gContentRefreshDown,
				callback: pulldownRefresh
			},
			up: {
				contentrefresh: common.gContentRefreshUp,
				contentnomore: common.gContentNomoreUp,
				callback: pullupRefresh
			}
		}
	});

	mui.plusReady(function() {
		self.isTeacher(getLocalItem("UserType") == common.gDictUserType.teacher);

		var workTypeTmp = getLocalItem('comment.workType');
		if (typeof workTypeTmp != "undefined" && workTypeTmp == common.gJsonWorkTypeStudent[1].value) {
			workType = workTypeTmp;
			if (self.isTeacher()) {
				self.commentDes("还没有学生交过作业呢~");
			}
		}
		if(!self.isTeacher()){
			self.commentDes('还没有点评呢，快让老师帮忙点评吧！');
		}
		
		self.getMyComments();
		
		self.tmplSubjectClasses(common.getAllSubjectClasses());
		self.tmplSubjects(common.getAllSubjects());
		if (self.tmplSubjects().length > 0) {
			self.currentSubject(self.tmplSubjects()[0]);
		}
	});

	//拼接请求Url
	self.getAjaxUrl = function() {
		var ajaxUrl = common.gServerUrl + "API/Comment/GetMyComments?userId=" + getLocalItem("UserID");
		ajaxUrl += "&page=" + pageNum;

		if (typeof self.currentSubject().id === "number") {
			ajaxUrl += "&subject=" + self.currentSubject().id;
			ajaxUrl += "&subjectClass=" + self.currentSubject().subjectClass;
		}
		if (typeof(sortID) === "number" && sortID > 0) {
			ajaxUrl += "&sortType=" + sortID;
		}
		
		if (workType > 0) {
			ajaxUrl += "&workType=" + workType;
		}

		return ajaxUrl;
	}

	//加载点评
	self.getMyComments = function() {
		if (!common.hasLogined()) return;
		//console.log(self.getAjaxUrl());
		mui.ajax(self.getAjaxUrl(), {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				self.comments(result);
				mui('#pullrefresh').pullRefresh().refresh(true);	//重置上拉加载
				common.showCurrentWebview();
			}
		})
	};

	//选择科目
	self.selectSubject = function(data) {
		self.currentSubject(data);
		self.comments.removeAll(); //先移除所有
		pageNum = 1; //还原为显示第一页
		count = 0; //还原刷新次数
		mui('#pullrefresh').pullRefresh().refresh(true);
		self.getMyComments();
		mui('#popSubjects').popover('toggle');
	}

	//点评排序
	self.commentSort = function() {
		self.currentSort(this.value);
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
		}, false, false)
	}

	//下拉刷新
	function pulldownRefresh() {
		setTimeout(function() {
			mui('#pullrefresh').pullRefresh().endPulldownToRefresh(); //refresh completed
			page = 1;					//重新加载第1页
			self.getMyComments();
		}, 1500);
	}

	//上拉加载
	function pullupRefresh() {
		setTimeout(function() {
			pageNum++;
			mui.ajax(self.getAjaxUrl(), {
				type: 'GET',
				success: function(responseText) {
					var result = eval("(" + responseText + ")");
					if (result && result.length > 0) {
						self.comments(self.comments().concat(result));
						if(result.length < common.gListPageSize){
							mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
						}
						else{
							mui('#pullrefresh').pullRefresh().endPullupToRefresh(false);	//false代表还有数据
						}
					} else {
						mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);	//true代表没有数据了
					}
				}
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
	
	window.addEventListener("refreshComments", function(event) {
		if (event.detail.comment) {
			var retComment = event.detail.comment;
			var arrTmp = [];
			self.comments().forEach(function(item) {
				if (item.ID == retComment.ID) {
					item.CommentToRules = retComment.CommentToRules;
					item.IsFinish = retComment.IsFinish;
					item.TotalComment = retComment.TotalComment;
				}
				
				arrTmp.push(item);
			});
			
			self.comments.removeAll();
			self.comments(arrTmp);
		}
	});
}
ko.applyBindings(commentList);