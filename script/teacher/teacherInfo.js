var teacherInfo = function() {
	var self = this;
	
	self.teacherInfo = ko.observable();		//老师详情对象
	self.workResolve = ko.observableArray([]); //分解视频  数组
	self.workFull = ko.observableArray([]); //完整视频  数组
	self.workShow = ko.observableArray([]); //演出作品  数组
	self.workResolve = ko.observableArray([]); //分解视频  数组
	self.Photo = ko.observable('../../images/my-default.png'); //头像
	self.DisplayName = ko.observable("袁怡航"); //教师姓名
	self.SubjectName = ko.observable("钢琴"); //课程名字
	self.TeachAge = ko.observable("3"); //教龄
	self.Province = ko.observable("广东省"); //省份
	self.City = ko.observable("广州市"); //市级
	self.District = ko.observable("天河区"); //区级
	self.Score = ko.observable("3"); //得分
	self.FavCount = ko.observable("212"); //关注
	self.Star = ko.observable(0); //星级
	self.logoimgurl = ko.observable("../../images/videoLogo.png"); //视频上的播放logo
	self.photoimgurl = ko.observable("../../images/video-default.png"); //视频显示的图片
	self.title = ko.observable("成人钢琴教程 视频 钢琴 左手 分解 和炫"); //视频标题

	var TUserID; //老师UserId，由上级页面传此参数
	self.UserType = 32; //getLocalItem('UserType');
	self.Courses = ko.observableArray([]); //课程数组
	self.CourseName = ko.observable("") //课程标题
	self.Introduce = ko.observable("") //个人简介
	self.Price = ko.observable("") //课程标题
		//var tUserId = 0; 	//此数据应当由上级页面传此参数
	var pageSize = 3; //视频显示数量3

	self.getTeacherInfo = function() {
		mui.ajax(common.gServerUrl + "API/Account/GetInfo?userid=" + TUserID + "&usertype=" + common.gDictUserType.teacher, {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				self.teacherInfo(result);
				
				if (common.StrIsNull(result.Photo) != '')
					self.Photo(common.getPhotoUrl(result.Photo));
				self.DisplayName(result.DisplayName);
				self.SubjectName(result.SubjectName);
				self.TeachAge(result.TeachAge);
				self.Province(result.Province);
				self.City(result.City);
				self.District(result.District);
				self.Score(result.Score);
				self.FavCount(result.FavCount);
				self.Star(result.Star);
				self.Introduce(result.Introduce);

				
			},
			error: function(responseText) {
				mui.toast("获取信息失败");
			}
		});
	};
	self.openWork = function() {
			common.transfer('../works/worksList.html', false, {
				workType: 1
			});
		}
		//查看作品详情
	self.goWorksDetail = function(data) {
			common.transfer("../works/WorksDetails.html", false, {
				works: data
			})
		}
		//获取分解视频
	self.getworkResolve = function() {
			mui.ajax(common.gServerUrl + "API/Work?userID=" + TUserID + "&workType=" + common.gJsonWorkTypeTeacher[0].value + "&pageSize=" + pageSize, {
				type: "GET",
				success: function(responseText) {
					var result = eval("(" + responseText + ")");

					self.workResolve(result);
				}
			})
		}
		//获取完整教程
	self.getworkFull = function() {
		mui.ajax(common.gServerUrl + "API/Work?userID=" + TUserID + "&workType=" + common.gJsonWorkTypeTeacher[1].value + "&pageSize=" + pageSize, {
			type: "GET",
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				self.workFull(result);
			}
		})
	};
	//获取演出作品
	self.getwork = function() {
		mui.ajax(common.gServerUrl + "API/Work?userID=" + TUserID + "&workType=" + common.gJsonWorkTypeTeacher[2].value + "&pageSize=" + pageSize, {
			type: "GET",
			success: function(responseText) {
				var result = eval("(" + responseText + ")");

				self.workShow(result);
			}
		})
	}

	//老师课程
	self.getlesson = function() {
			mui.ajax(common.gServerUrl + "API/Course/GetCourseByUserID?userId=" + TUserID, {
				type: 'GET',
				success: function(responseText) {
					var result = eval("(" + responseText + ")");
					self.Courses(result);
				},
				error: function(responseText) {
					mui.toast("获取课程失败");
				}

			})
		}
		//帮我点评
	self.gotoComment = function() {
			common.transfer('../works/worksList.html', true, {
				teacher: self.teacherInfo(),
				displayCheck: true
			});
		}
		//预约上课
	self.appiontLesson = function() {
			common.transfer('../student/aboutLesson.html', true, {
				teacherName: self.DisplayName(),
				teacherPhoto: self.Photo(),
				userID: TUserID,
				courses: self.Courses()
			});
		}
		//关注
	self.Fav = function() {
			var ret = common.postAction(common.gDictActionType.Favorite, common.gDictActionTargetType.User, TUserID);
			if (ret) {
				self.FavCount(self.FavCount() + 1);

				mui.toast('收藏成功');
			}
		}
		//关闭分享窗口
	self.closeShare = function() {
			mui('#middlePopover').popover('toggle');
		}
		//浏览老师相册
	self.goTeacherAlbum = function() {
		common.transfer("../../modules/my/myAlbum.html", false, {
			userID: TUserID
		})
	}

	mui.plusReady(function() {
		//plus.nativeUI.showWaiting();
		var web = plus.webview.currentWebview();
		if (typeof(web.teacherID) !== "undefined") {
			TUserID = web.teacherID;
		}
		getTeacherInfo();
		self.getworkResolve();
		self.getworkFull();
		self.getwork();
		self.getlesson();
	});
}
ko.applyBindings(teacherInfo);