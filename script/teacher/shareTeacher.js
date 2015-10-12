var shareTeacher = function() {
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
	self.UserType = getLocalItem('UserType');
	self.lesson = ko.observableArray([]); //课程数组
	self.CourseName = ko.observable("") //课程标题
	self.Introduce = ko.observable("") //课程标题
	self.Price = ko.observable("") //课程标题
	var tUserId = 99; //测试使用，此数据应当由上级页面传此参数
	var pageSize = 3; //视频显示数量3
	
	var shareContent="";
	var shares = null,bhref = false;
	var shareID="";
	var shardEX="";
	var shareUrl="";//分享附上的链接，为公司主页，后期填补
	var shareTitle=""//分享内容的标题
	var shareContent="";//分享的内容


	var ul = document.getElementById("recommendArray");

	var lis = ul.getElementsByTagName("li");

	for (var i = 0; i < lis.length; i++) {
		lis[i].onclick = function() {
			mui.toast(this.id);
			if (this.id == "weichatFriend") {
				//微信好友
				shareID = "weixin";
				shardEX = "WXSceneSession";
			} else if (this.id == "weichatMoments") {
				//微信朋友圈
				shareID = "weixin";
				shardEX = "WXSceneTimeline";
			} else if (this.id == "weichatMoments") {
				shareID = "qq";

			}
			self.shareAction(shareID, shardEX);
		}

	}
	self.shareAction = function(id, ex) {
		var s = null;
		if (!id || !(s = shares[id])) {
			mui.toast("无效的分享服务！");
			return;
		}
		if (s.authenticated) {
			mui.toast("---已授权---");
			self.shareMessage(s, ex);
		} else {
			mui.toast("---未授权---");
			s.authorize(function() {
				self.shareMessage(s, ex);
			}, function(e) {
				mui.toast("认证授权失败：" + e.code + " - " + e.message);
			});
		}
	}
	self.shareMessage = function(s, ex) {
		var msg = {
			content: shareContent,
			extra: {
				scene: ex
			}
		};
		if (bhref) {
			msg.href = shareUrl;
			msg.title = shareTitle;
			msg.content = shareContent;
			msg.thumbs = ["../../images/ewm.png"];
			msg.pictures = ["../../images/ewm.png"];
		}
		outLine(JSON.stringify(msg));
		s.send(msg, function() {
			mui.toast("分享到\"" + s.description + "\"成功！ ");
		}, function(e) {
			mui.toast("分享到\"" + s.description + "\"失败: " + e.code + " - " + e.message);
		});
	}


	self.getTeacherInfo = function() {
		mui.ajax(common.gServerUrl + "API/Account/GetInfo?userid=" + self.UserID + "&usertype=" + self.UserType, {
			//dataType:'json',
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
	}()
	
	//关闭分享窗口
	self.closeShare=function(){
		mui('#middlePopover').popover('toggle');
	}
	//跳转到做品分享页面
	self.openWork = function() {
			//mui.toast(worktype);
			mui.openWindow({
				//url:'/modules/works/worksList.html',
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
			mui.ajax(common.gServerUrl + "API/Work?userID=" + tUserId + "&workType=" + common.gJsonWorkType[0] + "&pageSize=" + pageSize, {
				type: "GET",
				success: function(responseText) {
					var result = eval("(" + responseText + ")");
					self.workResolve(result);
				}
			})
		}()
		//获取完整教程
	self.getworkFull = function() {
			mui.ajax(common.gServerUrl + "API/Work?userID=" + tUserId + "&workType=" + common.gJsonWorkType[1] + "&pageSize=" + pageSize, {
				type: "GET",
				success: function(responseText) {
					var result = eval("(" + responseText + ")");
					self.workFull(result);
				}
			})
		}()
		//获取演出作品
	self.getworkFull = function() {
		mui.ajax(common.gServerUrl + "API/Work?userID=" + tUserId + "&workType=" + common.gJsonWorkType[2] + "&pageSize=" + pageSize, {
			type: "GET",
			success: function(responseText) {
				var result = eval("(" + responseText + ")");

				self.workShow(result);
			}
		})
	}()

	//老师课程
	self.getlesson = function() {
			mui.ajax(common.gServerUrl + "API/Course/GetCourseByUserID?userId=" + tUserId, {
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
	self.getComment = function() {
			//mui.toast("点击了“帮我点评”，此功能尚未完善");
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
					teacherID: 101,
					displayCheck: true
				}
			});
		}
		//预约上课
	self.appiontLesson = function() {
		mui.toast("点击了“预约上课”，此功能尚未完善");
	}

}
ko.applyBindings(shareTeacher);