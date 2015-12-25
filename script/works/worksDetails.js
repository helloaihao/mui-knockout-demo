var worksDetails = function() {
	var self = this;
	var workIsDel = false;
	self.isPay = ko.observable(false); //作品是否付费
	self.UserID = getLocalItem("UserID"); //当前用户UserID
	self.DownloadAmount = ko.observable(0); //下载价格
	//作品的元素绑定
	self.Works = ko.observable({}); //作品实例
	self.mv = ko.observable();
	var videoUrl; //视频地址
	self.initWorksValue = function(works) {
		var self = this;
		self.WorkID = ko.observable(works.ID); //作品编码
		self.AuthorID = ko.observable(works.AuthorID); //作品作者UserID
		self.UserType = ko.observable(works.UserType); //作品作者用户类型
		self.AuthorPhoto = ko.observable(common.getPhotoUrl(works.AuthorPhoto)); //作品作者头像
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
			return '设置为' + common.getTextByValue(common.gJsonWorkPublicType, !self.IsPublic());
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
		if (typeof self.Works().AuthorID == "undefined")
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
	var shareContent = "你看了没";
	var shareUrl = common.gWebsiteUrl + "modules/works/workInfo.html?id=";
	var shareImg = "";

	//分享功能
	var ull = document.getElementById("recommendArray");
	var lis = ull.getElementsByTagName("li");
	for (var i = 0; i < lis.length; i++) {
		lis[i].onclick = function() {
			//mui.toast("敬请期待");
			Share.sendShare(this.id, shareTitle, shareContent, shareUrl + self.Works().WorkID(), shareImg);
			mui('#middlePopover').popover('toggle');
		}
	}

	//关闭分享窗口
	self.closeShare = function() {
		mui('#middlePopover').popover('toggle');
	}

	//获取视频
	self.getVideo = function(workId, toggle) {
		//console.log(workId);
		mui.ajax(common.gServerUrl + "API/Video/GetVideoUrl/?workId=" + workId, {
			type: 'GET',
			success: function(responseText) {
				//console.log(responseText);
				var obj = JSON.parse(responseText);
				var videoPos = document.getElementById('videoPos');
				videoPos.innerHTML = '<div class="video-js-box" style="margin:5px auto"><video controls width="100%" height="' + 240 + 'px" class="video-js" poster="' + Works().imgUrl + '" data-setup="{}"><source src="' + common.gVideoServerUrl + obj.VideoUrl + '" type="video/mp4" /></video></div>'
				VideoJS.setupAllWhenReady();
				self.isPay(true);
				videoUrl = common.gVideoServerUrl + obj.VideoUrl;
				shareImg = Works().imgUrl;

				if (toggle) mui('#bottomPopover').popover('toggle');
			},
			error: function(XMLHttpRequest) {
				//status为403则作品需要付费但是为付费
				if (XMLHttpRequest.status == 403) {
					var ret = XMLHttpRequest.responseText;
					//console.log(ret);
					self.DownloadAmount(JSON.parse(ret).Price);

					var videoPos = document.getElementById('videoPos');
					videoPos.innerHTML = '<div class="video-bg" style="background-image: url(' + Works().imgUrl + '); background-size: cover"><span>该视频需要付费~</span><a onclick="payWork()" href="#"><em>付费</em></a></div>';
					self.isPay(false);
				} else if (XMLHttpRequest.status == 404) {
					//status为404为作品不存在
					mui.toast("作品不存在或未公开，请刷新后重试")
					mui.back();
				}

				if (toggle) mui('#bottomPopover').popover('toggle');
			}
		});
	}

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

	//跳转用户详情页面
	self.gotoAuthor = function() {
		var url = '../student/studentInfo.html';
		var arg = {
			studentID: self.Works().AuthorID()
		};
		if (self.Works().UserType() == common.gDictUserType.teacher) {
			url = '../teacher/teacherInfo.html';
			arg = {
				teacherID: self.Works().AuthorID()
			};
		}
		common.transfer(url, false, arg, false, false);
	}

	//删除作品
	self.worksDelete = function() {
		var btnArray = ['是', '否'];
		mui.confirm('确认删除吗', '您点击了删除', btnArray, function(e) {
			if (e.index == 0) {
				mui.ajax(common.gServerUrl + "Common/Work/" + self.Works().WorkID(), {
					type: 'DELETE',
					success: function(responseText) {
						workIsDel = true;
						mui.toast("删除成功");
						mui.back();
					}
				});
			}
		});
	}

	//修改作品
	self.worksSet = function() {

	}

	//作品下载
	self.downWork = function() {
		if (self.isPay()) {
			var oldTasks = plus.storage.getItem(common.gVarLocalDownloadTask);
			if (common.StrIsNull(oldTasks) == '') oldTasks = '[]';

			var arr = JSON.parse(oldTasks) || [];
			var data = {
				workId: self.Works().WorkID(),
				workTitle: self.Works().Title(),
				workAuthorId: self.Works().AuthorID(),
				workAuthorName: self.Works().AuthorName(),
				workimgUrl: self.Works().imgUrl,
				workSubjectName: self.Works().SubjectName(),
				workContentText: self.Works().ContentText(),
				IsFinish: false,
				videopath: videoUrl, //远程路径
				localpath: '' //本地路径
			}
			var downloaded = false;
			arr.forEach(function(item) {
				if (item.workId == data.workId) {
					downloaded = true;
					return;
				}
			})
			if (!downloaded)
				arr.push(data);

			plus.storage.setItem(common.gVarLocalDownloadTask, JSON.stringify(arr));
			common.transfer("mydownloadHeader.html", true, {}, false, true);
		} else {
			//弹出支付框
			mui('#bottomPopover').popover('toggle');
		}
	}

	//作品支付
	self.payWork = function() {
		if (UserID <= 0) {
			common.transfer("../account/login.html");
		} else {
			//弹出支付框
			mui('#bottomPopover').popover('toggle');
		}
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
		if (self.IsAuthor()) { //作者本人不允许赞
			mui.toast('自己的作品不需要点赞了吧~');
			return;
		}

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

	self.closePopover = function() {
		mui('#bottomPopover').popover("hide");
	}

	//支付方式，默认为微信支付
	self.PayType = ko.observable('wxpay');
	self.checkPayType = function() {
		//PayType(event.srcElement.value);
	}

	self.Order = ko.observable({}); //由我的订单传递过来的订单参数
	self.ViewOrder = ko.observable(false); //标记是否由我的订单跳转而来，默认为否
	self.OrderNO = ko.observable(''); //请求后返回的订单号
	//支付的生成订单
	self.gotoPay = function() {
		var ajaxUrl;
		var comment;

		//支付方式的数值
		var paytype = 3;
		if (self.PayType() == 'wxpay') {
			paytype = 1;
		} else if (self.PayType() == 'alipay') {
			paytype = 2;
		} else {
			paytype = 3;
		}

		if (!self.ViewOrder()) { //不是由我的订单跳转而来
			if (!self.Works().WorkID()) {
				mui.toast("请选择需下载的作品");
				return;
			}
			if (self.PayType() == '') {
				mui.toast("请选择支付方式");
				return;
			}

			//准备下载信息
			download = {
				WorkID: self.Works().WorkID(),
				WorkTitle: self.Works().Title(),
				AuthorID: self.Works().AuthorID(),
				DownloaderID: UserID,
				Amount: self.DownloadAmount()
			}

			ajaxUrl = common.gServerUrl + 'API/Download/?payType=' + paytype;
		} else {
			ajaxUrl = common.gServerUrl + 'API/Order/ResubmitOrder?id=' + self.Order().ID + '&payType=' + paytype;
		}

		plus.nativeUI.showWaiting();
		//新增则保存下载信息；修改则保存新的支付方式。均返回订单信息
		mui.ajax(ajaxUrl, {
			type: 'POST',
			data: self.ViewOrder() ? self.Order() : download,
			success: function(responseText) { //responseText为微信支付所需的json
				var ret = JSON.parse(responseText);
				var orderID = ret.orderID;
				if (ret.requestJson == '') { //无需网上支付，下载成功
					mui.toast("已成功提交");
					//重新获取视频
					self.getVideo(self.Works().WorkID(), true);
					plus.nativeUI.closeWaiting();
				} else {
					var requestJson = JSON.stringify(ret.requestJson);

					//根据支付方式、订单信息，调用支付操作
					Pay.pay(self.PayType(), requestJson, function(tradeno) { //成功后的回调函数
						var aurl = common.gServerUrl + 'API/Order/SetOrderSuccess?id=' + orderID + '&otherOrderNO=' + tradeno;
						mui.ajax(aurl, {
							type: 'PUT',
							success: function(respText) {
								//重新获取视频
								self.getVideo(self.Works().WorkID(), true);
								plus.nativeUI.closeWaiting();
							}
						})
					}, function() {
						plus.nativeUI.closeWaiting();
					});
				}
			}
		})
	};

	/**
	 * 为显示订单的作品信息而获取数据
	 * @param {Int} downloadID 下载ID
	 */
	self.getDataForOrder = function(downloadID) {
		self.ViewOrder(true); //标记由我的订单跳转而来

		var ajaxUrl = common.gServerUrl + 'API/Work/GetWorksByCommentID?downloadID=' + downloadID;
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				var data = JSON.parse(responseText);

				if (data) {
					var obj = new self.initWorksValue(data);
					self.Works(obj);
					self.getVideo(obj.WorkID());
					shareTitle = "我在乐评家上分享了" + self.Works().Title() + "的视频";
					self.getComment();
				}
			}
		});
	}

	//获取上级页面的数据
	var workobj, workVaule;
	mui.plusReady(function() {
		Share.updateSerivces(); //初始化分享
		workVaule = plus.webview.currentWebview();
		if (workVaule) {
			//从订单跳转过来
			if (typeof(workVaule.order) != "undefined") {
				self.Order(workVaule.order);
				self.DownloadAmount(self.Order().Amount);
				getDataForOrder(self.Order().TargetID);
			} else {
				workobj = workVaule.works;
				obj = new self.initWorksValue(workVaule.works);
				self.Works(obj);
				self.getVideo(obj.WorkID());
				shareTitle = "我在乐评家上分享了" + self.Works().Title() + "的视频";
				self.getComment();
			}
		}
		common.showCurrentWebview();
	});

	mui.init({
		beforeback: function() {
			var workParent = workVaule.opener();
			if (workParent != null) {
				if (workParent.id == 'worksListAllWorks.html') {
					if (workIsDel) {
						mui.fire(workParent, 'refreshAllworks', {
							worksId: self.Works().WorkID(),
							worksStatus: workIsDel
						});
					} else {
						mui.fire(workParent, 'refreshwoks', {
							LikeCount: self.Works().LikeCount(),
							worksId: self.Works().WorkID(),
						});
					}
					return true;
				} else if (workParent.id == 'worksListMyWorks.html') {
					mui.fire(workParent, 'refreshMyworks', {
						worksId: self.Works().WorkID(),
						worksStatus: workIsDel
					})
				}
			}
		}
	});

}
ko.applyBindings(worksDetails);