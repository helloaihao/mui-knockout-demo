var worksDetails = function() {
	var self = this;

	self.UserID = getLocalItem("UserID"); //当前用户UserID

	//作品的元素绑定
	self.Works = ko.observable({}); //作品实例
	self.mv = ko.observable();
	self.initWorksValue = function(works) {
		console.log(JSON.stringify(works));
		var self = this;
		self.WorkID = ko.observable(works.ID); //作品编码
		self.AuthorID = ko.observable(works.AuthorID); //作品作者UserID
		self.AuthorName = ko.observable(works.AuthorName); //作品作者名称
		self.SubjectID = ko.observable(works.SubjectID); //作品科目ID
		self.Title = ko.observable(works.Title); //作品标题
		console.log(works.AddTime);
		self.AddTime = ko.observable(works.AddTime.split(' ')[0]); //添加时间
		self.ReadCount = ko.observable(works.ReadCount); //浏览次数
		self.IsPublic = ko.observable(works.IsPublic); //作品是否公开
		self.IsPublicText = ko.computed(function() {
			return common.getTextByValue(common.gJsonWorkPublicType, self.IsPublic());
		}); //作品是否公开的文字
		self.IsPublicOppositeText = ko.computed(function() {
			return common.getTextByValue(common.gJsonWorkPublicType, !self.IsPublic());
		}); //作品是否公开的相反文字
		self.SubjectName = ko.observable(works.SubjectName); //科目名称
		self.LikeCount = ko.observable(works.LikeCount); //点赞次数
		self.FavCount = ko.observable(works.FavCount); //收藏数
		self.ContentText = ko.observable(works.ContentText);
		if (common.StrIsNull(works.VideoThumbnail) != '')
			self.imgUrl = common.getThumbnail(works.VideoThumbnail);
		else
			self.imgUrl = '';
	}
	self.IsAuthor = ko.computed(function() {
		if (!self.Works().AuthorID)
			return false;

		if (self.UserID == self.Works().AuthorID())
			return true;
		else
			return false;
	})

	//评论的相关元素绑定
	self.teacherComment = ko.observableArray([]); //各个老师评论数组
	//分享的参数
	var shares = null,
		bhref = false;
	var shareID = "";
	var shardEX = "";
	var shareUrl = ""; //分享附上的链接，链接到作品
	//var shareTitle=""//分享内容的标题
	//var shareContent="";//分享的内容

	//分享功能
	var ull = document.getElementById("recommendArray");
	var lis = ull.getElementsByTagName("li");
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



	//获取视频
	self.getVideo = function(workId) {
			console.log(workId);
			mui.ajax(common.gServerUrl + "API/Video/GetVideoUrl/?workId=" + workId, {
				type: 'GET',
				success: function(responseText) {
					var obj = JSON.parse(responseText);
					var videoPos = document.getElementById('videoPos');
					var vwidth = window.screen.width;
					var vheight = vwidth * 3 / 4;
					videoPos.innerHTML = '<div class="video-js-box" style="margin:20px auto"><video controls width="' + vwidth +'px" height="' + vheight + 'px" class="video-js" poster: ' + Works().imgUrl + ' data-setup="{}"><source src="' + common.gVideoServerUrl + obj.VideoUrl + '" type="video/mp4" /></video></div>'
					VideoJS.setupAllWhenReady();
				}
			});
		}
		/*var req = new XMLHttpRequest();
    req.onload = function () {
        var obj = JSON.parse(this.response);
        self.src({
       		type: obj.Type,
       		src: common.gServerUrl + obj.VideoUrl
       	});
       	self.play();
    };
    req.open('GET', common.gServerUrl + "API/Video/GetVideoUrl/?workId="+workId, true);
    req.setRequestHeader("Authorization", getAuth());
    req.send(null);*/


	//获取上级页面的数据
	mui.plusReady(function() {
		var workVaule = plus.webview.currentWebview();
		if (workVaule) {
			var obj = new self.initWorksValue(workVaule.works);
			self.Works(obj);
			self.getVideo(obj.WorkID());
		}
		self.getComment();
	});

	//获取评论
	self.getComment = function() {
		mui.ajax(common.gServerUrl + "Common/Comment/GetCommentsByWork?WorkID=" + self.Works().WorkID(), {
			type: 'Get',
			success: function(responseText) {
				//console.log(responseText);
				var result = eval("(" + responseText + ")");
				result.forEach(function(item, i, array) {
					self.teacherComment.push(Comment(item));
				})
			}
		});
	}

	//删除作品
	self.worksDelete = function() {
			var btnArray = ['是', '否'];
			mui.confirm('确认删除吗', '您点击了删除', btnArray, function(e) {
				if (e.index == 0) {
					mui.ajax(common.gServerUrl + "Common/Work/" + self.Works().WorkID(), {
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
			mui.prompt('请输入咨询内容：', '', '咨询', btnArray, function(e) {
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
			mui.openWindow({
				url: '../../modules/teacher/teacherListHeader.html',
				show: {
					autoShow: true,
					aniShow: "slide-in-right",
					duration: "100ms"
				},
				waiting: {
					autoShow: false
				},
				extras: {
					WorkID: self.Works().WorkID(),
					AuthorID: self.Works().AuthorID,
					Title: self.Works().Title(),
					AuthorName: self.Works().AuthorName(),
					SubjectID: self.Works().SubjectID(),
					DisplayCheck: true
				}
			});
		}
		//设置作品是否公开
	self.setPublic = function() {
		var ispublic = self.Works().IsPublic();
		mui.ajax(common.gServerUrl + "Common/Work/" + self.Works().WorkID(), {
			type: "PUT",
			data: {
				AuthorID: self.Works().AuthorID(),
				IsPublic: !ispublic
			},
			success: function(responseText) {
				self.Works().IsPublic(!ispublic);
				mui.toast("成功设置为" + self.Works().IsPublicText());
			}
		})
	}

	//赞
	self.Like = function() {
		if (self.IsAuthor()) return; //作者本人不允许赞

		var ret = common.postAction(common.gDictActionType.Like, common.gDictActionTargetType.Works, self.Works().WorkID());
		if (ret) {
			self.LikeCount(self.LikeCount() + 1);
			mui.toast('感谢您的赞许');
		}
	}

	//收藏
	self.Fav = function() {
			if (self.IsAuthor()) return; //作者本人不允许收藏

			var ret = common.postAction(common.gDictActionType.Favorite, common.gDictActionTargetType.Works, self.Works().WorkID());
			if (ret) {
				self.FavCount(self.FavCount() + 1);
				mui.toast('收藏成功');
			}
		}
		//关闭分享窗口
	self.closeShare = function() {
		mui('#middlePopover').popover('toggle');
	}
}
ko.applyBindings(worksDetails);