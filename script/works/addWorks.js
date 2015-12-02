var viewModel = function() {
	var self = this;
	
	self.pageTitle = ko.observable('作品');
	self.teacherText = ko.observable("请选择老师");
	self.subjectText = ko.observable("请选择科目");
	self.workTypeID = ko.observable(0);
	self.workTypeText = ko.observable("请选择类型");
	self.titleText = ko.observable('');
	self.contentText = ko.observable('');
	self.filePath = ko.observable(''); //视频文件路径
	self.fileName = ko.observable(''); //视频文件名称
	self.publicText = ko.observable('是');
	var ppSubject, ppWorkType, ppPublic, ppTeacher;
	var teacherID, subjectID, publicID = 1;
	var userType = getLocalItem("UserType");

	mui.plusReady(function() {
		ppSubject = new mui.PopPicker({
			layer: 2
		});
		ppWorkType = new mui.PopPicker();
		ppWorkType.setData(common.gJsonWorkTypeTeacher);

		ppSubject.setData(common.getAllSubjectsBoth());
		ppPublic = new mui.PopPicker();
		ppPublic.setData(common.gJsonYesorNoType);
		
		//初始化老师弹窗及选择
		ppTeacher = new mui.PopPicker();
		var ajaxUrl = common.gServerUrl + 'API/Action?userid=' + getLocalItem('UserID') + '&targetType=' + common.gDictActionTargetType.User + '&userType=' + common.gDictUserType.teacher + '&page=1&pageSize=9999';
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				var myTeachers = JSON.parse(responseText);
				if(myTeachers.length > 0){
					ppTeacher.setData(common.JsonConvert(myTeachers, 'ID', 'DisplayName'));
					self.teacherText(myTeachers[0].DisplayName);
					teacherID = myTeachers[0].ID;
				}
			}
		});
		var localTeacherID = getLocalItem("localTeacherID");
		var localTeacherText = getLocalItem("localTeacherText");
		if(localTeacherID && localTeacherText){
			teacherID = localTeacherID;
			self.teacherText(localTeacherText);
		}
		
		//初始化科目选择
		var localSubjectID = getLocalItem("localSubjectID");
		var localSubjectText = getLocalItem("localSubjectText");
		if(localSubjectID && localSubjectText){
			subjectID = localSubjectID;
			self.subjectText(localSubjectText);
		}
		
		var workIndex = plus.webview.currentWebview();
		if (workIndex.workTypeID && userType == common.gDictUserType.student) {
			self.workTypeID(workIndex.workTypeID);
			if (workIndex.workTypeID == 104) {
				self.titleText(getLocalItem('DisplayName') + "的作品(" + newDate().format('yyyyMMdd') + ')');
				self.contentText(self.titleText());
			} else if (workIndex.workTypeID == 105) {
				self.titleText(getLocalItem('DisplayName') + "的作业(" + newDate().format('yyyyMMdd') + ')');
				self.contentText(self.titleText());
				self.pageTitle('作业');
			}
		}
		else{
			//初始化类型选择
			var localWorkTypeID = getLocalItem("localWorkTypeID");
			var localWorkTypeText = getLocalItem("localWorkTypeText");
			if(localWorkTypeID && localWorkTypeText){
				self.workTypeID(localWorkTypeID);
				self.workTypeText(localWorkTypeText);
			}
			else{
				self.workTypeID(common.gJsonWorkTypeTeacher[0].value);
				self.workTypeText(common.gJsonWorkTypeTeacher[0].text);
			}
			self.titleText(getLocalItem('DisplayName') + "的作品(" + newDate().format('yyyyMMdd') + ')');
			self.contentText(self.titleText());
		}
		
		common.showCurrentWebview();
	});

	//老师选择
	self.setTeacher = function() {
		ppTeacher.show(function(items) {
			self.teacherText(items[0].text);
			teacherID = items[0].value;
			setLocalItem("localTeacherID", items[0].text);
			setLocalItem("localTeacherID", items[0].value);
		});
	};

	//科目选择
	self.setSubject = function() {
		ppSubject.show(function(items) {
			self.subjectText(items[1].text);
			subjectID = items[1].value;
			setLocalItem("localSubjectText", items[1].text);
			setLocalItem("localSubjectID", items[1].value);
		});
	};

	//类型选择
	self.setWorkType = function() {
		ppWorkType.show(function(items) {
			self.workTypeText(items[0].text);
			self.workTypeID(items[0].value);
			setLocalItem("localWorkTypeText", items[0].text);
			setLocalItem("localWorkTypeID", items[0].value);
		});
	};

	//是与否选择
	self.setPublicType = function() {
		ppPublic.show(function(items) {
			self.publicText(items[0].text);
			publicID = items[0].value;
		});
	};

	//添加文件
	self.addFile = function() {
		videoPicker.SelectVideo(false, function(value) {
			if (value) {
				self.filePath(value[0].srcPath);
				self.fileName(value[0].fileName);
				
				var videoPos = document.getElementById('videoPos');
				videoPos.innerHTML = '<div class="video-js-box"><video controls width="168px" height="105px" class="video-js" data-setup="{}"><source src="' + value[0].srcPath + '" /></video></div>'
				VideoJS.setupAllWhenReady();
			}
		});
	}

	//上传
	self.upload = function() {
		if (self.titleText() == "") {
			mui.toast('请填写标题');
			return;
		}

		//上传学生作业时，必须选择课程
		if ((common.gDictUserType.student && self.workTypeID == 105) && (!teacherID || teacherID <= 0)) {
			mui.toast('请选择课程');
			return;
		}
		//上传非学生作业时，必须选择科目
		if ((common.gDictUserType.student && self.workTypeID == 105) && (!subjectID || subjectID <= 0)) {
			mui.toast('请选择科目');
			return;
		}
		if (self.workTypeID() <= 0) {
			mui.toast('请选择类型');
			return;
		}
		if (self.contentText() == "") {
			mui.toast('请完善描述');
			return;
		}
		if (self.filePath() == "") {
			mui.toast('请选择作品');
			return;
		}

		var arrTmp = self.filePath().split('.');
		var ext = arrTmp[arrTmp.length - 1];
		mui.ajax(common.gServerUrl + "Common/Work", {
			type: "POST",
			data: {
				AuthorID: getLocalItem("UserID"),
				Title: self.titleText(),
				SubjectID: subjectID,
				WorkSrcType: common.gDictWorkSourceType.Teacher,
				WorkSrcID: teacherID,
				ContentText: self.contentText(),
				WorkType: self.workTypeID(),
				IsPublic: publicID == 1 ? true : false,
				Video: self.fileName() + '.' + ext
			},
			success: function(responseText) {
				if (responseText) {
					mui.toast("已保存，等待上传完成");
					var obj = JSON.parse(responseText);

					//保存至本地缓存
					var oldTasks = plus.storage.getItem(common.gVarLocalUploadTask);
					var arr = JSON.parse(oldTasks) || [];
					arr.push({
						workid: obj.ID,
						worktype: self.workTypeID(),
						videopath: self.filePath()
					});
					plus.storage.setItem(common.gVarLocalUploadTask, JSON.stringify(arr));
					
					/*var myworks = plus.webview.getWebviewById("worksListMyHeader.html");
					if (typeof myworks == "undefined") {
						plus.webview.close(myworks.id);
					}*/
					common.transfer("worksListMyHeader.html", true, {
						workTypeID: self.workTypeID(),
						workTitle: userType == common.gDictUserType.teacher ? '我的作品' : self.workTypeText
					}, false, false)

					/*var myworks = plus.webview.getWebviewById('worksListMyWorks.html');
					myworks.addEventListener('loaded',function () {
						myworks.evalJS("upload.uploadVideo("+obj+",'"+videopath+"')");
					})*/

					/*self.subjectText("请选择科目");
					self.workTypeText("请选择类别");
					self.titleText("");
					self.contentText("");
					subjectID = 0;
					workTypeID = 0;
					publicID = 1;
					self.filePath('');
					self.fileName('');*/
				}
			}
		});
	};
}
ko.applyBindings(viewModel);