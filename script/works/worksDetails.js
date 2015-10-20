var worksDetails = function() {
	var self = this;
	var WorkID,AuthorID;
	self.AuthorName = ko.observable('');
	self.SubjectID = ko.observable('');
	self.Subject = {value:0, text:''};
	//作品的元素绑定

	self.Title = ko.observable("作品标题"); //作品标题
	self.AddTime = ko.observable("2015-09-11"); //添加时间
	self.ReadCount = ko.observable("1254"); //已看
	self.Remark = ko.observable("未公开"); //作品权限
	self.RemarkValue = 1; //作品权限数值
	self.SubjectName = ko.observable("钢琴"); //科目
	self.LikeCount = ko.observable("456"); //点赞
	self.FavCount = ko.observable("0"); //点赞
	self.ContentText = ko.observable("作品内容作品内容");
	self.imgUrl = ko.observable('');
	self.findTeacherComment=ko.observable("找老师点评");
	//评论的相关元素绑定
	self.teacherComment = ko.observableArray([]); //各个老师评论数组
	//分享的参数
	var shares = null,bhref = false;
	var shareID="";
	var shardEX="";
	var shareUrl="";//分享附上的链接，链接到作品
	//var shareTitle=""//分享内容的标题
	//var shareContent="";//分享的内容
	
	//分享功能
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
	/**
	 * 分享操作
	 * @param {String} id
	 */
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
	/**
	 * 发送分享消息
	 * @param {plus.share.ShareService} s
	 */
	self.shareMessage = function(s, ex) {
		var msg = {
			content: self.ContentText(),
			extra: {
				scene: ex
			}
		};
		if (bhref) {
			msg.href = shareUrl;
			msg.title = self.Title();
			msg.content = self.ContentText();
			msg.thumbs = ["_www/images/my-photo.jpg"];
			msg.pictures = ["_www/images/my-photo.jpg"];
		}
		
		s.send(msg, function() {
			mui.toast("分享到\"" + s.description + "\"成功！ ");
		}, function(e) {
			mui.toast("分享到\"" + s.description + "\"失败: " + e.code + " - " + e.message);
		});
	}
	// H5 plus事件处理

	function plusReady() {
		updateSerivces();
		if (plus.os.name == "Android") {
			Intent = plus.android.importClass("android.content.Intent");
			File = plus.android.importClass("java.io.File");
			Uri = plus.android.importClass("android.net.Uri");
			main = plus.android.runtimeMainActivity();
		}
	}
	if (window.plus) {
		plusReady();
	} else {
		document.addEventListener("plusready", plusReady, false);
	}
	/**
	 * 更新分享服务
	 */
	function updateSerivces() {
		plus.share.getServices(function(s) {
			shares = {};
			for (var i in s) {
				var t = s[i];
				shares[t.id] = t;
			}
		}, function(e) {
			outSet("获取分享服务列表失败：" + e.message);
		});
	}
	//在ready获取上级页面的数据
	mui.ready(function() {
		mui.plusReady(function() {
			var workVaule = plus.webview.currentWebview();
			WorkID=workVaule.WorkID; //由上级页面传此参数到此页面
			AuthorID=workVaule.AuthorID; //由上一级页面传此参数到此页面
			mui.toast(WorkID);
			self.getComment();
		});
	});
	//获取作品和评论
	self.getComment = function() {
		mui.ajax(common.gServerUrl + "API/Work/" + WorkID, {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				//alert(responseText);
				self.Title(result.Title);
				self.AddTime(result.AddTime.split(" ")[0]);
				self.ReadCount(result.ReadCount);
				self.RemarkValue = result.Remark;
				self.Remark(common.gJsonWorkRemarkType[result.Remark].text);
				self.SubjectName(result.SubjectName);
				self.SubjectID(result.SubjectID);
				self.LikeCount(result.LikeCount);
				self.FavCount(result.FavCount);
				self.ContentText(result.ContentText);
				self.AuthorName(result.AuthorName);
			}
		});
		mui.ajax(common.gServerUrl + "Common/Comment/GetCommentsByWork?WorkID=" + WorkID, {
			type: 'Get',
			success: function(responseText) {
				//var result = JSON.parse(responseText);
				var result = eval("(" + responseText + ")");
				result.forEach(function(item, i, array) {
						self.teacherComment.push(Comment(item));
					})
					//self.teacherComment(result);
					//setLocalItem('CommentId',result.id)
					//self.CommentRules(result[0].CommentToRules);
					//self.feedback(result.CommentFeedbacks);
			}
		});

	}

	//删除作品
	self.worksDelete = function() {
			var btnArray = ['是', '否'];
			mui.confirm('确认删除吗', '您点击了删除', btnArray, function(e) {
				if (e.index == 0) {
					mui.ajax(common.gServerUrl + "API/Work/" + WorkID, {
						type: 'DELETE',
						success: function(responseText) {
							mui.toast("删除成功");
						},
						error: function(responseText) {
							mui.toast(responseText);
						}
					});
				}
			});
		}
		//修改作品
	self.worksSet = function() {
		
		}
		//点评的模型

	function Comment(model) {
			var obj = {};
			obj.ID = model ? model.ID : 0;
			obj.AuthoID = model ? model.AuthoID : 0;
			obj.AuthorName = model ? model.AuthorName : '';
			obj.CommenterID = model ? model.CommenterID : 0;
			obj.CommenterName = model ? model.CommenterName : '';
			obj.TotalComment = model ? model.TotalComment : '';
			var ctr = [];
			if (model && model.CommentToRules) {
				var arr = JSON.parse(model.CommentToRules);
				ctr = arr;
			}
			obj.CommentToRules = ko.observableArray(ctr);
			var feedbacks = [];
			if (model && model.CommentFeedbacks) {
				var arr = JSON.parse(model.CommentFeedbacks);
				feedbacks = arr;
			}
			obj.CommentFeedbacks = ko.observableArray(feedbacks);

			return obj;
		}
		//添加咨询
	self.addfeedbacks = function() {
			/*var oldComment = this;
			var theComment = {};
			for (var p in oldComment)
				theComment[p] = oldComment[p];*/
			var theComment = this;

			//e.detail.gesture.preventDefault(); //修复iOS 8.x平台存在的bug，使用plus.nativeUI.prompt会造成输入法闪一下又没了
			var btnArray = ['确定', '取消'];
			mui.prompt('请输入你要咨询的评内容：', '', '咨询', btnArray, function(e) {
				if (e.index == 0) {
					mui.ajax(common.gServerUrl + "API/Comment/AddCommentFeedback", {
						type: "POST",
						data: {
							CommentID: theComment.ID,
							Question: e.value
						},
						success: function() {
							var tmp = theComment.CommentFeedbacks;
							if (!tmp)
								tmp = [];
							var newFB = {
								'Question': e.value,
								'Answer': ''
							};
							tmp.push(newFB);
							theComment.CommentFeedbacks = tmp; //JSON.stringify(tmp);
							//self.teacherComment.replace(oldComment, theComment);

							mui.toast("添加咨询成功");
						}
					})
				}
			})
		}
		//找老师点评
	self.getTeacherComment = function() {
		self.Subject.value = self.SubjectID();
		self.Subject.text = self.SubjectName();
			mui.openWindow({
				url: '../../modules/teacher/teacherList.html',
				show: {
					autoShow: true,
					aniShow: "slide-in-right",
					duration: "100ms"
				},
				waiting: {
					autoShow: false
				},
				extras: {
					WorkID: WorkID,
					AuthorID: AuthorID,
					Title: self.Title(),
					AuthorName: self.AuthorName(),
					Subject: Subject,
					DisplayCheck: true
				}
			});
		}
		//作品权限 更改
	self.workRemorkSet = function() {
		mui.toast("公开");
		if (self.RemarkValue == 1) {
			self.RemarkValue = 0;
		} else if (self.RemarkValue == 0) {
			self.RemarkValue = 1;
		}
		mui.ajax(common.gServerUrl + "API/Work/" + WorkID, {
			type: "PUT",
			data: {
				ID: WorkID,
				AuthorID: AuthorID,
				Remark: self.RemarkValue
			},
			success: function(responseText) {
				self.Remark(common.gJsonWorkRemarkType[self.RemarkValue].text);
				mui.toast("权限已修改为" + self.Remark);
			}
		})
	}

	//赞
	self.Like = function() {
		var ret = common.postAction(common.gDictActionType.Like, common.gDictActionTargetType.Works, WorkID);
		if (ret) {
			self.LikeCount(self.LikeCount() + 1);
			mui.toast('感谢您的赞许');
		}
	}

	//收藏
	self.Fav = function() {
		var ret = common.postAction(common.gDictActionType.Favorite, common.gDictActionTargetType.Works, WorkID);
		if (ret) {
			self.FavCount(self.FavCount() + 1);
			mui.toast('收藏成功');
		}
	}
	//关闭分享窗口
	self.closeShare=function(){
		mui('#middlePopover').popover('toggle');
	}
	
}
ko.applyBindings(worksDetails);