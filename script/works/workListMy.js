var workListMy = function() {
	var self = this;

	var authorID =  1038; //作品拥有者
	var sortID;
	var page = 1;
	var count = 0; //刷新检测值
	var workTypeID; //作品类型的取值（学生用户查看个人作品/作业时有效，老师用户则无需分类）
	var pullupValue = 1;
	var uploadingWorks;
	var videoPath;
	var arrUploaderTasks = [];

	self.workDes = ko.observable("作品");
	self.worksList = ko.observableArray([]);
	self.tmplSubjects = ko.observableArray([]);
	self.tmplSubjectClasses = ko.observableArray([]);
	self.currentSubject = ko.observable({}); //当前选中的科目
	self.currentWorkTypes = ko.observable(0);
	self.currentSort = ko.observable(5);

	mui.init({
		pullRefresh: {
			container: '#pullrefreshMy',
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
					upload.deleteTask(item.works.ID);
					mui.toast('上传完成');
					page = 1; //重新加载第1页
					self.getWorks();
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
		self.Percentage = ko.computed(function() {
			return self.TotalSize() == 0 ? '0%' : Math.round(self.UploadedSize() / self.TotalSize() * 100).toString() + '%';
		});
	}

	self.getAjaxUrl = function() {
		var curl = "?userID=" + authorID + "&page=" + page;
		if (typeof self.currentSubject().id === "number") {
			curl += "&subject=" + self.currentSubject().id;
			curl += "&subjectClass=" + self.currentSubject().subjectClass;
		}
		if (typeof(sortID) === "number" && sortID > 0) {
			curl += "&sortType=" + sortID;
		}

		if (typeof(workTypeID) === "number" && workTypeID > 0 || typeof(workTypeID) === "string" && workTypeID != "") {
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
				//console.log(responseText);
				self.worksList.removeAll(); //先移除所有
				if (result && result.length > 0) {
					result.forEach(function(item) {
						var obj = new worksItem(item);
						self.worksList.push(obj);
						//console.log(obj.VideoThumbnail());
					})
					mui('#pullrefreshMy').pullRefresh().refresh(true);	//重置上拉加载
					
					arrUploaderTasks = upload.initTasks(refreshUploadState);

					common.showCurrentWebview();
				} else {
					common.showCurrentWebview();
				}

				//console.log(plus.webview.currentWebview().opener().id);
			}
		});
	};

	//下拉刷新
	function pulldownRefresh() {
		setTimeout(function() {
			mui('#pullrefreshMy').pullRefresh().endPulldownToRefresh(); //refresh completed
			mui('#pullrefreshMy').pullRefresh().refresh(true);
			page = 1; //重新加载第1页
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
							if (result.length < common.gListPageSize) {
								mui('#pullrefreshMy').pullRefresh().endPullupToRefresh(true);
							} else {
								mui('#pullrefreshMy').pullRefresh().endPullupToRefresh(false); //false代表还有数据
							}
						} else {
							mui('#pullrefreshMy').pullRefresh().endPullupToRefresh(true); //true代表没有数据了
						}

						/*if (self.worksList().length < common.gListPageSize) {
							mui('#pullrefreshMy').pullRefresh().disablePullupToRefresh();	//禁用上拉刷新
						} else {
							mui('#pullrefreshMy').pullRefresh().enablePullupToRefresh();	//启用上拉刷新
						}*/

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

	//停止任务（h5+有bug，暂时无法实现）
	self.handleTask = function(data) {
		if (data.IsFinish() == false) {

			arrUploaderTasks.forEach(function(task) {
				if (task.url.indexOf('workId=' + data.works.ID) > 0) {
					task.abort();
					console.log(task.state);
					/*switch(task.state){
						case 0:				//初始状态
							task.start();	//管用
							break;
						case 5:				//暂停状态
							task.resume();	//plus的bug，无效
							break;
						default:
							task.resume();	//abort和resume均为bug，无效
							break;
					}*/
				}
			})
		}
	}

	//取消任务
	self.cancelTask = function(data) {
		if (data.IsFinish() == false) {
			if (arrUploaderTasks.length > 0) {
				arrUploaderTasks.forEach(function(task) {
					if (task.url.indexOf('workId=' + data.works.ID) > 0) {
						if (task.state == 3) {
							mui.toast("上传已开始，无法取消");
							return;
						} else {
							var btnArray = ['是', '否'];
							mui.confirm('确认取消吗', '您点击了取消', btnArray, function(e) {
								if (e.index == 0) {
									task.abort();
									mui.ajax(common.gServerUrl + 'Common/Work/' + data.works.ID, {
										type: 'DELETE',
										success: function(responseText) {
											mui.toast('成功取消了本次上传');
											upload.deleteTask(data.works.ID);

											self.worksList.remove(data);
										}
									});
								}
							});
						}
					}
				})
			} else {
				var btnArray = ['是', '否'];
				mui.confirm('确认取消吗', '您点击了取消', btnArray, function(e) {
					if (e.index == 0) {
						mui.ajax(common.gServerUrl + 'Common/Work/' + data.works.ID, {
							type: 'DELETE',
							success: function(responseText) {
								mui.toast('成功取消了本次上传');
								upload.deleteTask(data.works.ID);

								self.worksList.remove(data);
							}
						});
					}
				});
			}

		}
	}

	//跳转到作品详情页面
	self.goWorksDetails = function(data) {
		if (data.IsFinish()) {
			common.transfer("../works/WorksDetails.html", false, {
				works: data.works
			}, false, false)
		}

	}

	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		authorID = getLocalItem("UserID"); //默认获取自己的作品
		if (typeof(web.teacherID) !== "undefined") {
			authorID = web.teacherID;
			self.displayCheck(web.displayCheck);
		}

		if (getLocalItem("workTypeID") != "") {
			workTypeID = getLocalItem("workTypeID");
			if (workTypeID == common.gJsonWorkTypeStudent[1].value) {
				self.workDes("作业");
			}
		}
		if (getLocalItem("teacherID") != "") {
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
		common.transfer("addWorks.html", true, common.extrasUp());
	};
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