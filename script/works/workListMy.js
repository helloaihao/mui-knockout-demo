var workListAll = function() {
	var self = this;
	var pageNum = 1;
	var receiverId = 1;
	var teacherID;
	var thisUrl = common.gServerUrl + "API/Work"; //接口url
	var pageUrl = "?page=";
	var subjectUrl = "&subject=";
	var sortUrl = "&sortType=";
	var subjectID, sortID;
	var page = 1;
	var ppSubject, ppSort;
	self.works = ko.observableArray([]);
	//var receiverId = getLocalItem("UserID");
	//加载作品
	self.getWorks = function() {
		var curl = pageUrl + page;
		if (typeof(subjectID) === "number" && subjectID > 0) {
			curl += subjectUrl + subjectID;
		}
		if (typeof(sortID) === "number" && sortID > 0) {
			curl += sortUrl + sortID;
		}
		mui.ajax(thisUrl + curl, {
			type: 'GET',
			success: function(responseText) {
				//console.log(responseText);
				var result = eval("(" + responseText + ")");
				self.works(result);
				//console.log(JSON.stringify(self.works()));
			}
		});
	};
	//下拉加载
	self.pulldownRefresh = function() {
			setTimeout(function() {
				mui('#pullrefreshMy').pullRefresh().endPulldownToRefresh(); //refresh completed
			}, 1500);
		}
		//上拉刷新
	var count = 0;
	self.pullupRefresh = function(pullrefreshId, worksArray) {
		setTimeout(function() {
			mui('#pullrefreshMy').pullRefresh().endPullupToRefresh((++count > 2));
			page++;
			var curl = pageUrl + page;
			if (typeof(subjectID) === "number" && subjectID > 0) {
				curl += subjectUrl + subjectID;
			}
			if (typeof(sortID) === "number" && sortID > 0) {
				curl += sortUrl + sortID;
			}
			mui.ajax(thisUrl + curl, {
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
				mui('#pullrefreshMy').pullRefresh().pullupLoading();
			}, 1000);
			if (plus.os.vendor == 'Apple') {
				mui('.mui-scroll-wrapper').scroll();
			}
		});
	} else {
		mui.ready(function() {
			mui('#pullrefreshMy').pullRefresh().pullupLoading();
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
	//跳转到作品详情页面
	self.goWorksDetails = function(data) {
		common.transfer("../works/WorksDetails.html", false,{
			works: data
		})
	} 
	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		if (typeof(web.teacherID) !== "undefined") {
			teacherID = web.teacherID;
			self.displayCheck(web.displayCheck);
		}
		self.getWorks();
	});
}
ko.applyBindings(workListAll);