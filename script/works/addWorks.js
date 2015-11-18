var viewModel = function() {
	var self = this;

	self.subjectText = ko.observable("请选择科目");
	self.workTypeText = ko.observable("请选择类型");
	self.titleText = ko.observable('');
	self.contentText = ko.observable('');
	self.filePath = ko.observable('');	//视频文件路径
	self.fileName = ko.observable('');	//视频文件名称
	self.publicText = ko.observable('是');

	var subjectName, workTypeName, publicName;
	var workTypeID, subjectID, publicID = 1;

	mui.plusReady(function() {
		subjectName = new mui.PopPicker();
		mui.ajax(common.gServerUrl + "Common/Subject/Get", {
			dataType: 'json',
			type: "GET",
			success: function(responseText) {
				var arr = common.JsonConvert(responseText, 'ID', 'SubjectName');
				subjectName.setData(arr);
			}
		});
		workTypeName = new mui.PopPicker();
		if(getLocalItem("UserType") == common.gDictUserType.teacher.toString()){
			workTypeName.setData(common.gJsonWorkTypeTeacher);
		}
		else{
			workTypeName.setData(common.gJsonWorkTypeStudent);
		}
		publicName = new mui.PopPicker();
		publicName.setData(common.gJsonYesorNoType);
		
		//从本地缓存读取之前所选的科目
		var cacheSubjectName = plus.storage.getItem(common.getPageName()+'.SubjectName');
		
		if(cacheSubjectName && cacheSubjectName != '') self.subjectText(cacheSubjectName);
		var cacheSubjectID = plus.storage.getItem(common.getPageName()+'.SubjectID');
		
		if(cacheSubjectID && cacheSubjectID != '') subjectID = cacheSubjectID;
		//从本地缓存读取之前所选的类型
		var cacheWorkTypeName = plus.storage.getItem(common.getPageName()+'.WorkTypeName');
		if(cacheWorkTypeName && cacheWorkTypeName != '') self.workTypeText(cacheWorkTypeName);
		var cacheWorkTypeID = plus.storage.getItem(common.getPageName()+'.WorkTypeID');
		if(cacheWorkTypeID && cacheWorkTypeID != '') workTypeID = cacheWorkTypeID;
	});
	
	//科目选择
	self.setSubject = function() {
		subjectName.show(function(items) {
			self.subjectText(items[0].text);
			subjectID = items[0].value;
			//保存所选科目到本地缓存
			plus.storage.setItem(common.getPageName()+'.SubjectName', self.subjectText());
			plus.storage.setItem(common.getPageName()+'.SubjectID', subjectID.toString());
		});
	};
	
	//类型选择
	self.setWorkType = function() {
		workTypeName.show(function(items) {
			self.workTypeText(items[0].text);
			workTypeID = items[0].value;
			//保存所选类型到本地缓存
			plus.storage.setItem(common.getPageName()+'.WorkTypeName', self.workTypeText());
			plus.storage.setItem(common.getPageName()+'.WorkTypeID', workTypeID.toString());
		});
	};

	//是与否选择
	self.setPublicType = function() {
		publicName.show(function(items) {
			self.publicText(items[0].text);
			publicID = items[0].value;
		});
	};

	//添加文件
	self.addFile = function() {
		videoPicker.SelectVideo(false, function(value) {
			if(value){
				self.filePath(value[0].srcPath);
				self.fileName(value[0].fileName);
			}
		});
	}
	//上传
	self.upload = function() {
		if (self.titleText() == "") {
			mui.toast('请填写标题');
			return;
		}

		if (!subjectID || subjectID <= 0) {
			mui.toast('请选择科目');
			return;
		}
		if (!workTypeID || workTypeID <= 0) {
			mui.toast('请选择类型');
			return;
		}
		if (self.contentText() == "") {
			mui.toast('请完善描述');
			return;
		}
		if (self.filePath() == "") {
			mui.toast('请添加作品');
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
				ContentText: self.contentText(),
				WorkType: workTypeID,
				IsPublic: publicID == 1 ? true : false,
				Video: self.fileName() + '.' + ext
			},
			success: function(responseText) {
				if(responseText){
					mui.toast("已保存，等待上传完成");
					var obj = JSON.parse(responseText);
					
					//保存至本地缓存
					var oldTasks = plus.storage.getItem(common.gVarLocalUploadTask);
					var arr = JSON.parse(oldTasks) || [];
					arr.push({
						workid: obj.ID,
						videopath: self.filePath()
					});
					plus.storage.setItem(common.gVarLocalUploadTask, JSON.stringify(arr));
					
					var index = plus.webview.getLaunchWebview() || plus.webview.getWebviewById('indexID');	//获取首页Webview对象
					plus.webview.close(index);	//关闭首页
					common.transfer('../../index.html', true, {page: 3}, true);
					
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