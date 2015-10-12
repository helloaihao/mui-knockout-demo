var workList = function() {
	var self = this;
	var pageNum = 1;
	var receiverId = 1;
	var teacherID;
	self.works = ko.observableArray([]);
	self.displayCheck = ko.observable(false);
	self.UnreadCount = ko.observable("0");
	//var receiverId = getLocalItem("UserID");
	//加载作品
	self.getWorks = function() {
		self.getUnreadCount;
		mui.ajax(common.gServerUrl + "API/Work?page=" + pageNum, {
			type: 'GET',
			success: function(responseText) {
				//alert(responseText);
				var result = eval("(" + responseText + ")");
				self.works(result);
			},
			error: function() {
				mui.toast("ERROR");
			}

		});
		
	}();
	//刷新
	var count = 0;
	self.pullupRefresh = function() {
		setTimeout(function() {
			mui('#pullrefresh').pullRefresh().endPullupToRefresh((++count > 2));
			//var table = document.body.querySelector('.mui-table-view');
			pageNum++;
			mui.ajax(common.gServerUrl + "API/Work?page=" + pageNum, {
				type: 'GET',
				success: function(responseText) {
					/*tmp = ko.observableArray([]);
					tmp(responseText);*/
					var result = eval("(" + responseText + ")");
					self.works(self.works().concat(result));
					//self.messages(self.messages().concat(responseText));
				}
			});


		}, 1500);
		mui.ready(function() {
			mui('#pullrefresh').pullRefresh().pullupLoading();
		})
	}
	
	//跳转到作品详情页面
	self.goWorksDetails=function(){
		var works=this;
		mui.openWindow({
			url:'WorksDetails.html',
			show: {
				autoShow: true,
				aniShow: "slide-in-right",
				duration: "100ms"
			},
			waiting: {
				autoShow: false
			},
			extras:{
				WorkID:works.ID,
				AuthorID:works.AuthorID
			}
		});
	}
	
	self.gotoSubmitClass = function() {
		var radios = document.getElementsByName('radio');
		var pos = -1;
		for(var i = 0; i < radios.length; i ++) {
			if( radios[i].checked ) {
				pos = i;
			}
		}
		mui.openWindow({
			url:'../student/submitClass.html',
			show: {
				autoShow: true,
				aniShow: "slide-in-right",
				duration: "100ms"
			},
			waiting: {
				autoShow: false
			},
			extras:{
				WorkID:works.ID,
				AuthorID:works.AuthorID,
				WorkTitle: self.works()[pos].Title,
				AuthorName: self.works()[pos].AuthorName,
				CommenterID: teacherID
			}
		});
	}
	//跳转至消息页面
	self.goMessageList = function(){
		common.gotoMessage();
	}
	//获取未读消息数量
	self.getUnreadCount = function(){
		common.getUnreadCount(self.UnreadCount());
	}
	
	mui.plusReady(function(){
		var web = plus.webview.currentWebview();
		if( typeof(web.teacherID) !== "undefined" ) {
			teacherID = web.teacherID;
			self.displayCheck(web.displayCheck);
		}
	})
}
ko.applyBindings(workList);