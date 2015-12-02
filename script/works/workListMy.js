var workListMy = function() {
	var self = this;
	
	var authorID; //作品拥有者
	var sortID;
	var page = 1;
	var count = 0; //刷新检测值
	var workTypeID;		//作品类型的取值（学生用户有效，老师用户则无需分类）
	var pullupValue = 1;
	var uploadingWorks;
	var videoPath;
	self.workDes = ko.observable("作业");
	self.worksList = ko.observableArray([]);
	self.tmplSubjects = ko.observableArray([]);
	self.tmplSubjectClasses = ko.observableArray([]);
	self.currentSubject = ko.observable({}); //当前选中的科目
	self.currentWorkTypes = ko.observable(0);
	self.currentSort = ko.observable(5);
	
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
	
	self.getAjaxUrl = function(){
		var curl = "?userID=" + authorID + "&page=" + page;
		if (typeof self.currentSubject().id === "number") {
			curl += "&subject=" + self.currentSubject().id;
			curl += "&subjectClass=" + self.currentSubject().subjectClass;
		}
		if (typeof(sortID) === "number" && sortID > 0) {
			curl += "&sortType=" + sortID;
		}
		if (typeof(workTypeID) === "number" && workTypeID > 0) {
			curl += "&workType=" + workTypeID;
		}
		
		return common.gServerUrl + "API/Work" + curl;
	}

	//加载作品
	self.getWorks = function() {
		mui.ajax(self.getAjaxUrl(), {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				
				self.worksList.removeAll(); //先移除所有
				if (result && result.length > 0) {
					result.forEach(function(item) {
						var obj = new worksItem(item);
						self.worksList.push(obj);
						//console.log(obj.VideoThumbnail());
					})
					upload.initTasks(refreshUploadState);
					
					common.showCurrentWebview();
				}
				else{
					common.showCurrentWebview();
				}
			}
		});
	};
	
	//下拉刷新
	function pulldownRefresh() {
		setTimeout(function() {
			mui('#pullrefreshMy').pullRefresh().endPulldownToRefresh(); //refresh completed
			page = 1;					//重新加载第1页
			self.getWorks();
		}, 1500);
	}
	
	//上拉加载
	function pullupRefresh(pullrefreshId, worksArray) {
		setTimeout(function() {
			page++;
			if (plus.networkinfo.getCurrentType() > 1) {
				mui.ajax(self.getAjaxUrl(), {
					type: 'GET',
					success: function(responseText) {
						var result = eval("(" + responseText + ")");
						if (result && result.length > 0) {
							result.forEach(function(item) {
								var obj = new worksItem(item);
								self.worksList.push(obj);
							})
						}
						if (self.worksList().length <= 2) {
							mui('#pullrefreshMy').pullRefresh().disablePullupToRefresh();
						} else {
							mui('#pullrefreshMy').pullRefresh().enablePullupToRefresh();
						}
						//mui('#pullrefreshMy').pullRefresh().endPullupToRefresh((++count > 2));
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
	
	//跳转到作品详情页面
	self.goWorksDetails = function(data) {
		common.transfer("../works/WorksDetails.html", false, {
			works: data.works
		}, false, false)
	}
	
	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		if (typeof(web.teacherID) !== "undefined") {
			authorID = web.teacherID;
			self.displayCheck(web.displayCheck);
		} else {
			authorID = getLocalItem("UserID"); //获取自己的作品
		}
		if (getLocalItem("workTypeID") != "undefined") {
			workTypeID = getLocalItem("workTypeID");
			if (workTypeID == common.gJsonWorkTypeStudent[0].value) {
				self.workDes("作品");
			}
		}
		if( getLocalItem("teacherID") != "undefined") {
			authorID = getLocalItem("teacherID");
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
		//console.log(common.gJsonWorkTypeStudent[0].value);
		common.transfer("addWorks.html",true,common.extrasUp());
	};

	/*mui.init({
		beforeback: function() {
			common.transfer('../../index.html');
			return false;
		}
	})*/
	
	window.addEventListener("refreshMyworks", function(event) {
		if (event.detail.worksStatus) {
			self.worksList().forEach(function(item) {
				if (item.works.ID == event.detail.worksId) {
					self.worksList.remove(item);
				}
			});
		}
	});
}
ko.applyBindings(workListMy);