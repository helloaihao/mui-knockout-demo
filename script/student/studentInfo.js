var studentInfo = function() {
	var self = this;
	var sUserID = 110;		//学生UserID，需从上一个页面传递而得，暂测试使用
	var sUserType = 64;		//学生用户类型
	var page = 1;
	self.Photo = ko.observable("../../images/my-default.png"); //头像
	self.DisplayName = ko.observable("袁怡航"); //姓名
	self.Gender = ko.observable("女"); //性别
	self.Years = ko.observable("7"); //年龄
	self.Province = ko.observable("广东省"); //省份
	self.City = ko.observable("广州市"); //市级
	self.District = ko.observable("天河区"); //区级
	self.Score = ko.observable("3"); //得分
	self.FavCount = ko.observable("212"); //关注
	self.UserID = getLocalItem('UserID');
	self.UserType = getLocalItem('UserType');
	self.works = ko.observableArray([]);
	//var nowDate=new Date();

	self.getStudentInfo = function() {
		mui.ajax(common.gServerUrl + "API/Account/GetInfo?userid=" + sUserID + "&usertype=" + sUserType, {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				//alert(responseText);
				self.DisplayName(result.DisplayName);
				self.Gender(common.gJsonGenderType[result.Gender].text);
				self.Years(result.Age);
				self.Province(result.Province);
				self.City(result.City);
				self.District(result.District);
				self.Score(result.Score);
				self.FavCount(result.FavCount);
				setTimeout(self.loadWork, 1500);
			}
		})
	}()
	
	setTimeout(function() {
		//此处需要uesrID，测试使用，省略
		mui.ajax(common.gServerUrl + "API/Work?page=" + page, {
			type: "GET",
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				self.works(result);
			}
		})
	}, 150);

	//刷新
	var count = 0;
	self.pullupRefresh = function() {
		setTimeout(function() {
			mui('#pullrefresh').pullRefresh().endPullupToRefresh((++count > 2));
			//var table = document.body.querySelector('.mui-table-view');
			page++;
			//此处需要uesrID，测试使用，省略
			mui.ajax(common.gServerUrl + "API/Work?page=" + page, {
				type: 'GET',
				success: function(responseText) {				
					var result = eval("(" + responseText + ")");
					self.works(self.works().concat(result));
				}
			});
		}, 1500);
		mui.ready(function() {
			mui('#pullrefresh').pullRefresh().pullupLoading();
		})
	}

	//关注
	self.Fav = function(){
		var ret = common.postAction(common.gDictActionType.Favorite, common.gDictActionTargetType.User, sUserID);
		if(ret){
			self.FavCount(self.FavCount() + 1);
			mui.toast('收藏成功');
		}
	}
}
ko.applyBindings(studentInfo);