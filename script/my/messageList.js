//knockoutjs
var message_notification = function() {
	var self = this;
	self.messages = ko.observableArray([]);
	var pageNum = 1;
	var receiverId = getLocalItem("UserID");
	var worksContent;
	//获取消息
	self.getMessage = function() {
		plus.runtime.setBadgeNumber(0);
		mui.ajax(common.gServerUrl + "API/Message/GetMyMessage?receiver=" + receiverId + "&page=" + pageNum, {
			dataType: 'json',
			type: 'GET',
			success: function(responseText) {
				self.messages(responseText);
				mui('#pullrefresh').pullRefresh().refresh(true);	//重置上拉加载
				if (responseText.length > 0)
					setLocalItem("msgLastTime", responseText[responseText.length - 1].SendTime);
			}
		})
	}

	//删除消息
	self.removeMessages = function() {
		var message = this;
		var btnArray = ['是', '否'];
		mui.confirm('确认删除吗', '您点击了删除', btnArray, function(e) {
			if (e.index == 0) {
				mui.ajax(common.gServerUrl + "API/Message/" + message.ID, {
					type: 'DELETE',
					success: function(responseText) {
						self.messages.remove(message);
					}
				});
			}
		});
	}

	//根据点评id获取作品
	/*self.getWorksByCommentID = function(commentId) {
		var ajaxurl = common.gServerUrl + "API/Work/GetWorksByCommentID?commentID=" + commentId;
		console.log(commentId);
		mui.ajax(ajaxurl, {
			type: "GET",
			success: function(responseText) {
				console.log(responseText);
				worksContent = eval("(" + responseText + ")");
			}
		})
	}*/

	//跳转到消息详情
	self.goMessagesDetail = function() {
		var message = this;
		//console.log(JSON.stringify(message));
		//点评——作品详情  上课-课程表
		if (message.ModuleID == common.gMessageModule.commentModule) {
			if (getLocalItem('UserType') == common.gDictUserType.teacher) {
				var ajaxurl = common.gServerUrl + "API/Comment/" + message.SourceID;
				mui.ajax(ajaxurl, {
					type: "GET",
					success: function(responseText) {
						var comment = eval("(" + responseText + ")");
						common.transfer("../comment/commentDetails.html", false, {
							comment: comment
						}, false, false);
					}
				})
			} else {
				var ajaxurl = common.gServerUrl + "API/Work/GetWorksByCommentID?commentID=" + message.SourceID;
				mui.ajax(ajaxurl, {
					type: "GET",
					success: function(responseText) {
						worksContent = eval("(" + responseText + ")");
						common.transfer("../works/WorksDetails.html", false, {
							works: worksContent
						}, false, false);
					}
				})
			}
		}
		else if (message.ModuleID == common.gMessageModule.workDownloadModule) {
			common.transfer("../works/mydownloadHeader.html")
		}
		else if (message.ModuleID == common.gMessageModule.courseModule) {
			common.showIndexWebview(2, false);
			//common.transfer("../course/myCourse.hrml", false, {}, false, false);
		}
		else if (message.ModuleID == common.gMessageModule.homeworkModule){
			if (getLocalItem('UserType') == common.gDictUserType.teacher) {
				setLocalItem('comment.workType', common.gJsonWorkTypeStudent[1].value); //学生作业
				common.transfer("../comment/commentListHeader.html", true, {}, false, false);
			} else {
				common.transfer("../works/worksListMyHeader.html", true, common.extrasUp(1), false, false); //1为学生作业下标
			}
		}
		else if (message.ModuleID == common.gMessageModule.teacherAuthModule){
			common.transfer('../my/teacherAuth.html', true, {}, false, false);
		}
	}

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

	function pulldownRefresh() {
		setTimeout(function() {
			mui('#pullrefresh').pullRefresh().endPulldownToRefresh(); //refresh completed
			mui('#pullrefresh').pullRefresh().refresh(true);
			pageNum = 1; //重新加载第1页
			self.getMessage();
		}, 1500);
	}

	//var count = 0;
	function pullupRefresh() {
		setTimeout(function() {
			pageNum++;
			mui.ajax(common.gServerUrl + "API/Message/GetMyMessage?receiver=" + receiverId + "&page=" + pageNum, {
				dataType: 'json',
				type: 'GET',
				success: function(responseText) {
					if (responseText && responseText.length > 0) {
						self.messages(self.messages().concat(responseText));
						if (responseText.length < common.gListPageSize) {
							mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
						} else {
							mui('#pullrefresh').pullRefresh().endPullupToRefresh(false); //false代表还有数据
						}
					} else {
						mui('#pullrefresh').pullRefresh().endPullupToRefresh(true); //true代表没有数据了
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

	mui.plusReady(function() {
		self.getMessage();
	});
}
ko.applyBindings(message_notification);