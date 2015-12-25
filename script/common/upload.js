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
	//console.log(url);
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
 * @return {Array} 上传任务数组
 */
upload.initTasks = function(callback){
	var tmp = plus.storage.getItem(common.gVarLocalUploadTask);
	var arrRet = [];
	//console.log(tmp);
	var tasks = JSON.parse(tmp);
	if(tasks && tasks.length > 0){
		tasks.forEach(function(item){
			var ret = upload.uploadVideo(item.videopath, item.workid, callback);
			arrRet.push(ret);
		})
	}
	
	return arrRet;
}

/**
 * 根据作品ID删除上传任务
 * @param {Int} workId 作品ID
 */
upload.deleteTask = function(workId){
	//从本地缓存中删除
	var tmp = plus.storage.getItem(common.gVarLocalUploadTask);
	var tasks = JSON.parse(tmp);
	for (var j = 0; j < tasks.length; j++) {
		if (tasks[j].workid == workId) {
			tasks.pop(tasks[j]);
			break;
		}
	}
	plus.storage.setItem(common.gVarLocalUploadTask, JSON.stringify(tasks));
}

