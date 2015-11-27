var worksDetails = function() {
	var self = this;

	self.UserID = getLocalItem("UserID"); //当前用户UserID
	//作品的元素绑定
	self.Works = ko.observable({}); //作品实例
	self.mv = ko.observable();
	self.initWorksValue = function(works) {
		var self = this;
		self.WorkID = ko.observable(works.ID); //作品编码
		self.AuthorID = ko.observable(works.AuthorID); //作品作者UserID
		self.AuthorName = ko.observable(works.AuthorName); //作品作者名称
		self.SubjectID = ko.observable(works.SubjectID); //作品科目ID
		self.Title = ko.observable(works.Title); //作品标题
		self.AddTime = ko.observable(works.AddTime.split(' ')[0]); //添加时间
		self.ReadCount = ko.observable(works.ReadCount); //浏览次数
		self.IsPublic = ko.observable(works.IsPublic); //作品是否公开
		self.IsPublicText = ko.computed(function() {
			return common.getTextByValue(common.gJsonWorkPublicType, self.IsPublic());
		}); //作品是否公开的文字143135
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
	var shareTitle = "";
	var shareContent = "这个作品相当精彩";
	var shareUrl = "";
	var shareImg = "";

	//分享功能
	var ull = document.getElementById("recommendArray");
	var lis = ull.getElementsByTagName("li");
	for (var i = 0; i < lis.length; i++) {
		lis[i].onclick = function() {
			Share.sendShare(this.id, shareTitle, shareContent, shareUrl, shareImg);
			mui('#middlePopover').popover('toggle');
		}
	}
	self.closeShare = function() { //关闭分享窗口
			mui('#middlePopover').popover('toggle');
		}
		//获取视频
	self.getVideo = function(workId) {
			//			console.log(workId);
			mui.ajax(common.gServerUrl + "API/Video/GetVideoUrl/?workId=" + workId, {
				type: 'GET',
				success: function(responseText) {
					var obj = JSON.parse(responseText);
					//console.log(responseText);
					var videoPos = document.getElementById('videoPos');
					//					var vwidth = window.screen.width;
					//					var vheight = vwidth * 3 / 4;common.gVideoServerUrl + obj.VideoUrl
					//console.log(common.gVideoServerUrl + obj.VideoUrl);
					videoPos.innerHTML = '<div class="video-js-box" style="margin:5px auto"><video controls width="' + 320 + 'px" height="' + 240 + 'px" class="video-js" poster: ' + Works().imgUrl + ' data-setup="{}"><source src="' + common.gVideoServerUrl + obj.VideoUrl + '" type="video/mp4" /></video></div>'
					VideoJS.setupAllWhenReady();
					shareUrl=common.gVideoServerUrl + obj.VideoUrl;
					shareImg=Works().imgUrl;
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
	var workobj, workVaule;
	mui.plusReady(function() {
		Share.updateSerivces();
		workVaule = plus.webview.currentWebview();
		if (workVaule) {
			workobj = workVaule.works;
			obj = new self.initWorksValue(workVaule.works);
			self.Works(obj);
			self.getVideo(obj.WorkID());
			shareTitle="我在乐评+上分享了"+self.Works().Title()+"的视频";
		}
		common.showCurrentWebview();
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
							var workparent = workVaule.opener(); //获取当前页面的创建者
							console.log(workparent);
							//workparent.evalJS("resetWorks()");
							mui.back();
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
			common.transfer('../../modules/teacher/teacherListHeader.html', true, {
				works: workobj,
				displayCheck: true
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
			self.Works().LikeCount(self.Works().LikeCount() + 1);
			mui.toast('感谢您的赞许');
		}
	}

	//收藏
	self.Fav = function() {
		if (self.IsAuthor()) return; //作者本人不允许收藏

		var ret = common.postAction(common.gDictActionType.Favorite, common.gDictActionTargetType.Works, self.Works().WorkID());
		if (ret) {
			self.Works().FavCount(self.Works().FavCount() + 1);
			mui.toast('收藏成功');
		}
	}
	mui.init({
		beforeback: function() {
			var workParent = plus.webview.currentWebview().opener();
			if (workParent.id == 'worksListAllWorks.html') {
				mui.fire(workParent, 'refreshwoks', {
					LikeCount: self.Works().LikeCount(),
					worksId: self.Works().WorkID(),
				});
			}

		}
	});

}
ko.applyBindings(worksDetails);