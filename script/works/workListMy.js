var workListMy = function() {
	var self = this;
	var teacherID; //作品拥有者
	var thisUrl = common.gServerUrl + "API/Work"; //接口url
	var useridUrl = "?userID=";
	var pageUrl = "&page=";
	var subjectUrl = "&subject=";
	var subjectClassUrl = "&subjectClass=";
	var sortUrl = "&sortType=";
	var sortID;
	var page = 1;
	var count = 0; //刷新检测值
	var workTypeUrl = "&workType=";
	var workTypeID;
	var pullupValue = 1;
	var uploadingWorks;
	var videoPath;
	var contentnomore = "上拉显示更多";
	self.UserType = ko.observable(getLocalItem('UserType'));
	self.worksList = ko.observableArray([]);
	self.tmplSubjects = ko.observableArray([]);
	self.tmplSubjectClasses = ko.observableArray([]);
	self.currentSubject = ko.observable({}); //当前选中的科目
	self.currentWorkTypes = ko.observable({});
	common.gJsonWorkTypeTeacher.unshift({value:0,text: "全部"});
	common.gJsonWorkTypeStudent.unshift({value:0,text: "全部"});
	/*var counter = 0;*/
	mui.init({
		pullRefresh: {
			container: '#pullrefreshMy',
			up: {
				contentrefresh: '正在加载...',
				callback: pullupRefresh
			},
			down: {
				callback: pulldownRefresh
			}
		}
	});
	var refreshUploadState = function(task, finished) {
		for (var i = 0; i < self.worksList().length; i++) {
			var item = self.worksList()[i];
			if (task.url.indexOf('workId=' + item.works.ID) > 0) {
				//if (finished && item.UploadedSize() == item.TotalSize()) {
				if (finished) {
					item.UploadedSize(item.TotalSize());
					item.IsFinish(true);
					//更换缩略图
					item.VideoThumbnail('');
					//console.log(item.works.VideoThumbnail);
					item.VideoThumbnail(item.works.VideoThumbnail);

					//从本地缓存中删除
					var tmp = plus.storage.getItem(common.gVarLocalUploadTask);
					var tasks = JSON.parse(tmp);
					for (var j = 0; j < tasks.length; j++) {
						if (tasks[j].workid == item.works.ID) {
							tasks.pop(tasks[j]);
							break;
						}
					}
					plus.storage.setItem(common.gVarLocalUploadTask, JSON.stringify(tasks));
					mui.toast('上传完成');
					return;
				}

				if (item.TotalSize() <= 0 && task.totalSize > 0) {
					item.TotalSize(task.totalSize);
				}
				item.UploadedSize(task.uploadedSize);

				return;
			}
		}
	}

	/**
	 * 根据作品实例对象返回用于显示的视图模型
	 * @param {Object} worksObj 作品实例
	 */
	var worksItem = function(worksObj) {
		var self = this;

		self.works = worksObj;
		self.VideoThumbnail = ko.observable(worksObj.VideoThumbnail);
		self.IsFinish = ko.observable(worksObj.IsFinish); //专门用ko变量记录，便于更新
		self.UploadedSize = ko.observable(0);
		self.TotalSize = ko.observable(0);
		/*self.Ratio = ko.computed(function() {
			var de = (Math.round(self.TotalSize() * 100 / 1024 / 1024) / 100).toString() + 'M';
			var nu = (Math.round(self.UploadedSize() * 100 / 1024 / 1024) / 100).toString() + 'M';
			return nu + '/' + de;
		});*/
		self.Percentage = ko.computed(function() {
			return self.TotalSize() == 0 ? '0%' : Math.round(self.UploadedSize() / self.TotalSize() * 100).toString() + '%';
		});
		/*self.LastTime = ko.observable(new Date().getTime());	//时间戳，单位为毫秒
		self.Counter = ko.observable(0);	//计数器，避免太频繁的刷新
		self.LastUploadedSize = ko.observable(0);	//上一次记录时所上传的文件大小
		self.Speed = ko.observable('0 K/s');	//上传速率*/
	}

	//加载作品
	self.getWorks = function() {
		if (!teacherID) {
			return;
		}
		var curl = useridUrl + teacherID + pageUrl + page;
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

		mui.ajax(thisUrl + curl, {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				if (result && result.length > 0) {
					result.forEach(function(item) {
						var obj = new worksItem(item);
						self.worksList.push(obj);
						//console.log(obj.VideoThumbnail());
					})
					upload.initTasks(refreshUploadState);
				}
			}
		});
	};
	//下拉加载
	function pulldownRefresh() {
			setTimeout(function() {
				mui('#pullrefreshMy').pullRefresh().endPulldownToRefresh(); //refresh completed
				if (!teacherID) {
					return;
				}
				var curl = useridUrl + teacherID + pageUrl + 1;
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
					mui.ajax(thisUrl + curl, {
						type: 'GET',
						success: function(responseText) {
							mui('#pullrefreshMy').pullRefresh().endPullupToRefresh((++count > 2));
							var result = eval("(" + responseText + ")");
							if (result && result.length > 0) {
								result.forEach(function(item) {
									var obj = new worksItem(item);
									self.worksList.push(obj);
								})
							}
						}

					});
				}
			}, 1500);
		}
		//上拉刷新

	function pullupRefresh(pullrefreshId, worksArray) {
		setTimeout(function() {
			if (!teacherID) {
				return;
			}
			page++;
			var curl = useridUrl + teacherID + pageUrl + page;
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
				mui.ajax(thisUrl + curl, {
					type: 'GET',
					success: function(responseText) {
						mui('#pullrefreshMy').pullRefresh().endPullupToRefresh((++count > 2));
						var result = eval("(" + responseText + ")");
						if (result && result.length > 0) {
							result.forEach(function(item) {
								var obj = new worksItem(item);
								self.worksList.push(obj);
							})
						}
					}

				});
			}
		}, 1500)
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
			//			console.log(self.currentSubject().id);
			self.worksList.removeAll(); //先移除所有
			page = 1; //还原为显示第一页
			count = 0; //还原刷新次数
			mui('#pullrefreshMy').pullRefresh().refresh(true);
			self.getWorks();
			mui('#popSubjects').popover('toggle');
		}
		//作品排序
	self.sortWorks = function() {
			self.worksList.removeAll();
			sortID = this.value;
			page = 1; //还原为显示第一页
			count = 0; //还原刷新次数
			mui('#pullrefreshMy').pullRefresh().refresh(true);
			self.getWorks();
			mui('#popSort').popover('toggle');
		}
		//跳转到作品详情页面
	self.goWorksDetails = function(data) {
			common.transfer("../works/WorksDetails.html", false, {
				works: data.works
			})
		}
		//作品类型筛选
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
	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		if (typeof(web.teacherID) !== "undefined") {
			teacherID = web.teacherID;
			self.displayCheck(web.displayCheck);
		} else {
			teacherID = getLocalItem("UserID"); //获取自己的作品
		}
		self.getWorks();
		self.tmplSubjectClasses(common.getAllSubjectClasses());
		self.tmplSubjects(common.getAllSubjects());
		if (self.tmplSubjects().length > 0) {
			self.currentSubject(self.tmplSubjects()[0]);
		}
	});
	//添加作品
	self.gotoAddWorks = function() {
		common.transfer('../../modules/works/addWorks.html', true);
	};
	//跳转到登录
	self.goLogin = function() {
		common.transfer('../../modules/account/login.html', true);
	};
	//退出按钮
	mui.back = function() {
		common.confirmQuit();
	}
}
ko.applyBindings(workListMy);