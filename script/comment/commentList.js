var commentList = function() {
	var self = this;
	var pageNum = 1;
	var sortID;
	
	self.comments = ko.observableArray([]);
	self.tmplSubjects = ko.observableArray([]);
	self.tmplSubjectClasses = ko.observableArray([]);
	
	self.currentSubject = ko.observable({});	//当前选中的科目
	
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

	mui.plusReady(function() {
		self.getMyComments();
		
		var subjectvm = new subjectsViewModel();
		self.tmplSubjectClasses(subjectvm.getSubjectClasses());
		self.tmplSubjects(subjectvm.getSubjects());
		if(self.tmplSubjects().length > 0){
			self.currentSubject(self.tmplSubjects()[0]);
		}
	});
	//拼接请求Url
	self.getAjaxUrl=function(){
		var ajaxUrl = common.gServerUrl + "API/Comment/GetMyComments?userId="+getLocalItem("UserID");
		ajaxUrl += "&page="+pageNum;
		
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
		//console.log(self.getAjaxUrl());
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
	self.selectSubject = function(data){
		self.currentSubject(data);
		self.comments.removeAll();		//先移除所有
		
		/*此处可能有bug，若之前所选科目已经刷新到无数据了，
		    再切换为有多页数据的科目，似乎无法翻页了，会一直显示“没有更多数据了”*/
		pageNum = 1;						//还原为显示第一页
		self.getMyComments();
		mui('#popSubjects').popover('toggle');
	}
	
	//跳转至点评详情
	self.goCommentDetail = function(data){
		common.transfer('commentDetails.html', true, {
			comment: data
		})
	}
	
	//刷新
	function pulldownRefresh() {
		setTimeout(function() {
			pageNum++;
			mui.ajax(self.getAjaxUrl(), {
				type: 'GET',
				success: function(responseText) {
					var result = eval("(" + responseText + ")");
					self.comments(self.comments().concat(result));
					mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
				}
			});
		}, 1500);
	}

	var count = 0;

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
				}
			});
		}, 1500);
	}

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
}
ko.applyBindings(commentList);