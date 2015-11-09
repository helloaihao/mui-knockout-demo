var upload = upload || {};

var uploadVideoUrl = common.gVideoServerUrl + 'API/Video/Upload';

/**
 * 上传视频
 * @param {String} path 视频路径
 * @param {int} workid 作品ID
 * @param {Function} callback 状态改变时的回调函数
 */
upload.uploadVideo = function(path, workid, callback) {
	var url = uploadVideoUrl + '?workId=' + workid;
	var uploadTmp = plus.uploader.createUpload(url, {
		method: "POST",
		blocksize: 102400
	}, function(ul, status) {	//上传完成后的回调
		//console.log(status);
		//上传成功
		if(status == 200) callback(ul, true);
	});
	uploadTmp.setRequestHeader('Authorization', getAuth()); //加上请求的认证信息
	uploadTmp.addEventListener("statechanged", function(ul, responseStatus) {
		callback(ul);
	}, false);
//	console.log(path + '~' + workid)
	var addResult = uploadTmp.addFile(path, {
		key: workid.toString()
	});
	if (addResult) {
		uploadTmp.start();
		return uploadTmp;
	}
}

/**
 * 初始化上传任务
 * @param {Function} callback 状态改变时的回调函数
 */
upload.initTasks = function(callback){
	var tmp = plus.storage.getItem(common.gVarLocalUploadTask);
	//console.log(tmp);
	var tasks = JSON.parse(tmp);
	if(tasks && tasks.length > 0){
		tasks.forEach(function(item){
			upload.uploadVideo(item.videopath, item.workid, callback);
		})
	}
}

