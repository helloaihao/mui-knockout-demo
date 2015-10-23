var upload = upload || {};

var uploadVideoUrl = common.gServerUrl + 'API/Video/Upload';

/**
 * 上传视频
 * @param {String} path 视频路径
 * @param {String} name 视频上传时的唯一名称
 * @param {int} userid 上传者UserID
 * @param {int} workid 视频对应作品的ID
 */
upload.uploadVideo = function(path, name, userid, workid) {
	var url = uploadVideoUrl + '?userId=' + userid + '&workId='+workid;
	var uploadTmp = plus.uploader.createUpload(url, {
		method: "POST",
		blocksize: 102400
	}, function(ul, number) {
		console.log(number);
	});

	uploadTmp.setRequestHeader('Authorization', getAuth()); //加上请求的认证信息

	var addResult = uploadTmp.addFile(path, {
		key: name
	});
	addResult = addResult && uploadTmp.addData('userId', userid);
	addResult = addResult && uploadTmp.addData('workId', workid);

	if (addResult) {
		uploadTmp.start();
	}
}