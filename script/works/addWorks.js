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

	mui.ready(function() {
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
		workTypeName.setData(common.gJsonWorkType);
		publicName = new mui.PopPicker();
		publicName.setData(common.gJsonYesorNoType);
	});
	
	//科目选择
	self.setSubject = function() {
		subjectName.show(function(items) {
			self.subjectText(items[0].text);
			subjectID = items[0].value;
		});
	};
	
	//类型选择
	self.setWorkType = function() {
		workTypeName.show(function(items) {
			self.workTypeText(items[0].text);
			workTypeID = items[0].value;
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

		mui.ajax(common.gServerUrl + "API/Work", {
			type: "POST",
			data: {
				AuthorID: getLocalItem("UserID"),
				Title: self.titleText(),
				SubjectID: subjectID,
				ContentText: self.contentText(),
				WorkType: workTypeID,
				IsPublic: publicID == 1 ? true : false
			},
			success: function(responseText) {
				if(responseText){
					mui.toast("已保存，等待上传完成");
					var obj = JSON.parse(responseText);
					var videopath = self.filePath();
					var videoname = self.fileName();
					var workstitle = self.titleText();
					common.transfer('worksUploading.html', true, {
						workId: obj.ID,
						videoPath: videopath,
						videoName: videoname,
						worksTitle: workstitle
					});
					
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