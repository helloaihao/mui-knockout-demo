/**
 * 获取任务状态中文描述
 * @param {int} state 任务状态
 */
var getStateStr = function(state) {
	switch (state) {
		case 0:
			return "已停止";
		case 1:
			return "请求连接...";
		case 2:
			return "已建立连接";
		case 3:
			return "传输中";
		case 4:
			return "已完成";
		case 5:
			return "暂停中";
		default:
			return "";
	}
}

var uploadVideoUrl = common.gServerUrl + 'API/Video/Upload';

/**
 * 上传视频
 * @param {String} path 视频路径
 * @param {String} name 视频上传时的唯一名称
 * @param {int} userid 上传者UserID
 * @param {int} workid 视频对应作品的ID
 */
var uploadVideo = function(path, name, userid, workid, workstitle) {
	var url = uploadVideoUrl + '?userId=' + userid + '&workId=' + workid;
	var uploadTmp = plus.uploader.createUpload(url, {
		method: "POST",
		blocksize: 102400
	}, function(ul, status) {
		console.log(status);
	});

	uploadTmp.setRequestHeader('Authorization', getAuth()); //加上请求的认证信息
	//uploadTmp.setRequestHeader('WorksTitle', workstitle); //记录作品标题
	uploadTmp.addEventListener("statechanged", function(ul, responseStatus) {
		
		console.log("title:" + ul.getResponseHeader('WorksTitle') + "upload:" + JSON.stringify(ul) + "State: " + ul.state + " , Status: " + responseStatus);
	}, false);

	var addResult = uploadTmp.addFile(path, {
		key: name
	});
	/*addResult = addResult && uploadTmp.addData('userId', userid);
	addResult = addResult && uploadTmp.addData('workId', workid);*/

	if (addResult) {
		uploadTmp.start();
		return uploadTmp;
	}
}

/**
 * 获取所有未完成的上传任务（会产生错误，暂未用）
 */
var getAllUploads = function() {
	plus.uploader.enumerate(function(arr) {
		console.log('arr');
		//self.tasks(arr);
	});
}

/**
 * 根据Upload对象返回用于显示的视图模型
 * @param {Object} uploadObj plus.uploader.Upload对象
 * @param {String} title 对应作品标题
 */
var uploadItem = function(uploadObj, title) {
	var self = this;
	
	//self.uploadTask = ko.observable(uploadObj);
	self.WorkTitle = title;
	//self.State = ko.computed(function(){getStateStr(self.uploadTask().state)});
	self.UploadedSize = ko.observable(uploadObj.uploadedSize);
	//self.TotalSize = ko.computed(function(){self.uploadTask().totalSize});
	self.Ratio = ko.computed(function() {
		if (self.TotalSize() > 1024 * 1024) {
			var de = (Math.round(self.TotalSize() * 100 / 1024 / 1024) / 100).toString() + 'M';
			var nu = (Math.round(self.UploadedSize() * 100 / 1024 / 1024) / 100).toString() + 'M';
			return nu + '/' + de;
		} else {
			var de = (Math.round(self.TotalSize() * 100 / 1024) / 100).toString() + 'K';
			var nu = (Math.round(self.UploadedSize() * 100 / 1024) / 100).toString() + 'K';
			return nu + '/' + de;
		}
	});
	self.Percentage = ko.computed(function() {
		return self.TotalSize() == 0 ? '100%' : Math.round(self.UploadedSize() / self.TotalSize() * 100).toString() + '%';
		//return '100%';
	});
}

var viewModel = function() {
	var self = this;

	self.tasks = ko.observableArray([]); //所有上传任务对象

	/**
	 * 获取所有未完成的上传任务
	 */
	/*self.getAllUploads = function(){
		plus.uploader.enumerate(function(uploads){
			console.log('arr'+uploads.length);
			self.tasks(uploads);
		});
	}*/

	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		console.log(web.workId + '|' + web.videoPath + '|' + web.videoName);

		if (typeof(web.workId) !== "undefined" && typeof(web.videoPath) !== "undefined" && typeof(web.videoName) !== "undefined") {
			var workId = web.workId;
			var videoPath = web.videoPath;
			var videoName = web.videoName;
			var worksTitle = web.worksTitle;

			var ret = uploadVideo(videoPath, videoName, getLocalItem("UserID"), workId.toString(), worksTitle);

			if (ret) {
				var obj = new uploadItem(ret, worksTitle);
				self.tasks.push(obj);
			}
		}

		//getAllUploads();
	});
}
ko.applyBindings(viewModel);