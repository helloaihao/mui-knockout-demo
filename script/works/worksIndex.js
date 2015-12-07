var worksIndex = function() {
	var self = this;

	self.isTeacher = ko.observable(false); //是否老师身份
	self.taskType = ko.observable("我的作业"); //tasks作业的意思

	//跳转到我的作品页面
	self.goMyworks = function() {
		common.transfer("worksListMyHeader.html", true, common.extrasUp(0), false, false); //0为学生作品下标
	}

	//跳转到上传作品页面
	self.goUpworks = function() {
		common.transfer("addWorks.html", true, common.extrasUp(0), false, false);
	}

	//跳转到我的作业（学生作业）页面
	self.goMytasks = function() {
		if (getLocalItem('UserType') == common.gDictUserType.student)
			common.transfer("worksListMyHeader.html", true, common.extrasUp(1), false, false); //1为学生作业下标
		else if (getLocalItem('UserType') == common.gDictUserType.teacher) {
			setLocalItem('comment.workType', common.gJsonWorkTypeStudent[1].value); //学生作业
			common.transfer("../comment/commentListHeader.html", true, {}, false, false);
		}
	}

	//跳转到上传作业页面
	self.goUptasks = function() {
		common.transfer("addWorks.html", true, common.extrasUp(1), false, false);
	}

	//跳转到我的点评页面
	self.goComments = function() {
		setLocalItem('comment.workType', common.gJsonWorkTypeStudent[0].value); //学生作品
		common.transfer("../comment/commentListHeader.html", true, {}, false, false);
	}

	//跳转到所有作品页面
	self.goAllworks = function() {
		common.transfer("worksListAllHeader.html");
	}
	mui.plusReady(function() {
		if (getLocalItem('UserID') > 0) {
			var current = plus.webview.currentWebview();
			if (common.gDictUserType.teacher == getLocalItem("UserType")) {
				self.taskType("学生作业");
				self.isTeacher(true);
			}
		}

	})

	function preloadWeb(preloadUrl, extras) {
		var page = mui.preload({
			url: preloadUrl,
			id: preloadUrl,
			extras: extras
		});
	}
	//退出按钮
	mui.back = function() {
		common.confirmQuit();
	}
}
ko.applyBindings(worksIndex);