var viewModel = function() {
	var self = this;
	var pageID = 1;
	var thisUrl = common.gServerUrl + "API/Teacher"; //接口url
	var pageUrl = "?page=";
	var subjectUrl = "&subjectID=";
	var starUrl = "&star=";
	var sortUrl = "&sortType=";
	var refreshFlag = true;
	var ppSubject, ppStar, ppSort; //选择器
	self.teacherList = ko.observableArray([]); //选项文字
	self.dbStar = ko.observable("星级");
	self.dbSort = ko.observable("排序");
	//接收属性
	var subjectID, starID, sortID;
	var Title, AuthorName, AuthorID;
	self.displayCheck = ko.observable(false); //是否显示选择
	self.dbSubject = ko.observable("科目");
	//获取老师列表
	self.getTeacherList = function() {
		pageID = 1;
		var curl = pageUrl + pageID;
		refreshFlag = true;
		if (typeof(subjectID) === "number" && subjectID > 0) {
			curl += subjectUrl + subjectID;
		}
		if (typeof(starID) === "number" && starID > 0) {
			curl += starUrl + starID;
		}
		if (typeof(sortID) === "number" && sortID > 0) {
			curl += sortUrl + sortID;
		}
		//console.log(thisUrl + curl);
		mui.ajax(thisUrl + curl, {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				self.teacherList(result);
			},
			error: function() {
				mui.toast("ERROR");
			}
		});
		//mui('.mui-scroll-wrapper').scroll().scrollTo(0, 0, 100); //滚动到最顶部

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
	//下拉刷新
	function pulldownRefresh() {
		setTimeout(function() {
			
			pageID++;
			var curl = pageUrl + pageID;
			if (typeof(subjectID) === "number") {
				curl += subjectUrl + subjectID;
			}
			if (typeof(starID) === "number") {
				curl += starUrl + starID;
			}
			if (typeof(sortID) === "number") {
				curl += sortUrl + sortID;
			}
			mui.ajax(thisUrl + curl, {
				type: 'GET',
				success: function(responseText) {
					if (responseText === "") {
						refreshFlag = false;
					}
					var result = eval("(" + responseText + ")");
					self.teacherList(self.teacherList().concat(result));
					mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
				}
			});
		}, 1500);
	}

	var count = 0;
	function pullupRefresh() {
		setTimeout(function() {
			mui('#pullrefresh').pullRefresh().endPullupToRefresh((++count > 2));
			pageID++;
			var curl = pageUrl + pageID;
			if (typeof(subjectID) === "number") {
				curl += subjectUrl + subjectID;
			}
			if (typeof(starID) === "number") {
				curl += starUrl + starID;
			}
			if (typeof(sortID) === "number") {
				curl += sortUrl + sortID;
			}
			mui.ajax(thisUrl + curl, {
				type: 'GET',
				success: function(responseText) {
					var result = eval("(" + responseText + ")");
					self.teacherList(self.teacherList().concat(result));
				}
			});
		}, 1500);
	};

	if (mui.os.plus) {
		mui.plusReady(function() {
			setTimeout(function() {
				mui('#pullrefresh').pullRefresh().pullupLoading();
			}, 1000);

		});
	} else {
		mui.ready(function() {
			mui('#pullrefresh').pullRefresh().pullupLoading();
		});
	}

	self.setSubject = function() {
		ppSubject.show(function(items) {
			self.dbSubject(items[0].text);
			subjectID = items[0].value;
			self.getTeacherList();
		});
	};
	self.setStar = function() {
		ppStar.show(function(items) {
			self.dbStar(items[0].ctext);
			starID = items[0].value;
			self.getTeacherList();
		});
	};

	self.setSort = function() {
		ppSort.show(function(items) {
			self.dbSort(items[0].text);
			sortID = items[0].value;
			self.getTeacherList();
		});
	}

	self.gotoTeacherInfo = function() {
		var tmpID = this.UserID;
		mui.openWindow({
			url: "../../modules/teacher/teacherInfo.html",
			extras: {
				teacherID: tmpID
			},
			show: {
				autoShow: false,
			},
			waiting: {
				autoShow: true
			}
		});
	};

	self.gotoSubmitClass = function() {
		var radios = document.getElementsByName('radio');
		var pos = -1;
		for (var i = 0; i < radios.length; i++) {
			if (radios[i].checked) {
				pos = i;
			}
		}
		mui.openWindow({
			url: '../student/submitCommnet.html',
			show: {
				autoShow: true,
				aniShow: "slide-in-right",
				duration: "100ms"
			},
			waiting: {
				autoShow: false
			},
			extras: {
				AuthorID: self.AuthorID,
				WorkTitle: self.Title,
				AuthorName: self.AuthorName,
				CommenterID: self.teacherList()[pos].UserID
			}
		});
	};
	mui.plusReady(function() {
		var web = plus.webview.currentWebview(); //页面间传值

		if (typeof(web.Subject) !== "undefined") {
			self.dbSubject(web.Subject.text);
			subjectID = web.Subject.value;
		}
		if (typeof(web.starText) !== "undefined") {
			self.dbStar(web.starText.ctext);
			starID = web.starText.value;
		}
		if (typeof(web.DisplayCheck) !== "undefined") {
			self.displayCheck(web.DisplayCheck);
			self.Title = web.Title;
			self.AuthorName = web.AuthorName;
			self.AuthorID = web.AuthorID;
		}
		self.getTeacherList();
		ppSubject = new mui.PopPicker();
		mui.ajax(common.gServerUrl + "Common/Subject/Get", {
			dataType: 'json',
			type: "GET",
			success: function(responseText) {
				var arr = common.JsonConvert(responseText, 'ID', 'SubjectName');
				ppSubject.setData(arr);
			}
		});
		ppStar = new mui.PopPicker();
		ppStar.setData(common.gJsonTeacherLever);
		ppSort = new mui.PopPicker();
		ppSort.setData(common.gJsonTeacherSort);
	});
};

ko.applyBindings(viewModel);