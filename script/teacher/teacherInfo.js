var teacherInfo = function() {
	var self = this;
	self.workResolve = ko.observableArray([]); //分解视频  数组
	self.workFull = ko.observableArray([]); //完整视频  数组
	self.workShow = ko.observableArray([]); //演出作品  数组
	self.workResolve = ko.observableArray([]); //分解视频  数组
	self.DisplayName = ko.observable("袁怡航"); //教师姓名
	self.SubjectName = ko.observable("钢琴"); //课程名字
	self.TeachAge = ko.observable("3"); //教龄
	self.Province = ko.observable("广东省"); //省份
	self.City = ko.observable("广州市"); //市级
	self.District = ko.observable("天河区"); //区级
	self.Score = ko.observable("3"); //得分
	self.FavCount = ko.observable("212"); //关注
	self.Infoimgurl = ko.observable("../../images/teacherInfo.png"); //视频上的播放logo
	self.photoimgurl = ko.observable("../../images/my-photo.png"); //视频显示的图片
	self.title = ko.observable("成人钢琴教程 视频 钢琴 左手 分解 和炫"); //视频标题

	self.UserID = getLocalItem('UserID');
	self.UserType = 32;//getLocalItem('UserType');
	self.lesson = ko.observableArray([]); //课程数组
	self.CourseName = ko.observable("") //课程标题
	self.Introduce = ko.observable("") //课程标题
	self.Price = ko.observable("") //课程标题
	//var tUserId = 0; 	//此数据应当由上级页面传此参数
	var pageSize = 3; 	//视频显示数量3

	self.getTeacherInfo = function() {
		mui.ajax(common.gServerUrl + "API/Account/GetInfo?userid=" + self.UserID + "&usertype=" + common.gDictUserType.teacher, {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				self.DisplayName(result.DisplayName);
				self.SubjectName(result.SubjectName);
				self.TeachAge(result.TeachAge);
				self.Province(result.Province);
				self.City(result.City);
				self.District(result.District);
				self.Score(result.Score);
				self.FavCount(result.FavCount);
			},
			error: function(responseText) {
				mui.toast("获取信息失败");
			}
		});
	};
	self.openWork = function() {
			//mui.toast(worktype);
			mui.openWindow({
				url: '../works/worksList.html',
				show: {
					autoShow: true,
					aniShow: "slide-in-right",
					duration: "100ms"
				},
				waiting: {
					autoShow: false
				},
				extras: {
					workType: 1
				}
			})
		}
		//获取分解视频
	self.getworkResolve = function() {
			mui.ajax(common.gServerUrl + "API/Work?userID=" + self.UserID + "&workType=" + common.gJsonWorkType[0] + "&pageSize=" + pageSize, {
				type: "GET",
				success: function(responseText) {
					var result = eval("(" + responseText + ")");
					
					self.workResolve(result);
				}
			})
		}()
		//获取完整教程
	self.getworkFull = function() {
			mui.ajax(common.gServerUrl + "API/Work?userID=" + self.UserID + "&workType=" + common.gJsonWorkType[1] + "&pageSize=" + pageSize, {
				type: "GET",
				success: function(responseText) {
					var result = eval("(" + responseText + ")");
					self.workFull(result);
				}
			})
		}()
		//获取演出作品
	self.getworkFull = function() {
		mui.ajax(common.gServerUrl + "API/Work?userID=" + self.UserID + "&workType=" + common.gJsonWorkType[2] + "&pageSize=" + pageSize, {
			type: "GET",
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				
				self.workShow(result);
			}
		})
	}()

	//老师课程
	self.getlesson = function() {
		mui.ajax(common.gServerUrl + "API/Course/GetCourseByUserID?userId=" + self.UserID, {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				self.lesson(result);
			},
			error: function(responseText) {
				mui.toast("获取课程失败");
			}

		})
	}()
	//帮我点评
	self.gotoComment=function(){
		//alert("点击了帮我点评");
		mui.openWindow({
			url:'../works/worksList.html',
			show: {
				autoShow: true,
				aniShow: "slide-in-right",
				duration: "100ms"
			},
			waiting: {
				autoShow: false
			},
			extras:{
				teacherID: self.UserID,
				displayCheck: true
			}
		});
	}
	//预约上课
	self.appiontLesson=function(){
		alert("点击了“预约上课”，此功能尚未完善");
	}
	//关注
	self.Fav = function(){
		var ret = common.postAction(common.gDictActionType.Favorite, common.gDictActionTargetType.User, self.UserID);
		if(ret){
			self.FavCount(self.FavCount() + 1);
			
			mui.toast('收藏成功');
		}
	}
	//关闭分享窗口
	self.closeShare=function(){
		mui('#middlePopover').popover('toggle');
	}
	
	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		if( typeof(web.teacherID) !== "undefined" ) {
			self.UserID = web.teacherID;
			mui.toast(self.UserID);
		}
		getTeacherInfo();
	});
}
ko.applyBindings(teacherInfo);