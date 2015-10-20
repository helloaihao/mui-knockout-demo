var video = video || {};

//临时文件夹，保存临时视频处理文件
var tempPath = '_doc/temp/';

/**
 * 返回视频的视图模型
 * @param {String} srcPath 源文件的本地URL路径，可用于文件的读取
 * @param {String} dstPath 转换后文件的本地URL路径
 * @return {Object} 该视频对象
 */
video.returnVideoVM = function(srcPath, dstPath) {
	var self = this;
	self.srcPath = srcPath;
	self.dstPath = dstPath;
}

//利用数组记录返回的视频路径
var _returnVideos = [];
//备份的回调函数
var _callback = null;

/**
 * 生成临时文件名及路径
 * @param {int} index 标识，防止循环调用时返回相同的文件名
 * @return {String} 返回文件路径
 */
generateTempFilePath = function(index) {
	var strIndex = index ? index : '0';
	return tempPath + (new Date()).getTime().toString() + index + '.jpg';
}

/**
 * 选择本地视频，并实现压缩、转换为base64
 * @param {Boolean} multiple 是否多选
 * @param {Function} callback 回调函数
 * @return none
 */
video.SelectVideo = function(multiple, callback) {
	var self = this;
	self.videos = new mui.PopPicker();

	//备份回调函数
	if (callback) {
		_callback = callback;
	}

	//点击空白区域或取消按钮，直接释放本弹出框
	self.videos.mask[0].addEventListener('tap', function() {
		self.videos.dispose();
	}, false);
	self.videos.cancel.addEventListener('tap', function() {
		self.videos.dispose();
	}, false);

	self.videos.setData([{
		value: 0,
		text: '录像'
	}, {
		value: 1,
		text: '相册中选择'
	}]);
	self.videos.show(function(items) {
		if (items[0].value == 0) { //录像
			var cmr = plus.camera.getCamera();
			/*alert('supportedVideoResolutions:'+cmr.supportedVideoResolutions);
			alert('supportedVideoFormats:'+cmr.supportedVideoFormats);*/
			
			cmr.startVideoCapture(function(path) {
				_returnVideos = [];
				plus.gallery.save(path);
				var videoVM = new self.returnVideoVM(path, generateTempFilePath());
				_returnVideos.push(videoVM);
				
				if (_callback) {
					_callback(_returnVideos);
				}
			}, function(e) {}, {
				filename: "_doc/gallery/",
				index: 1,
				resolution: "640*480",
				format: "mp4"
			});
		} else if (items[0].value == 1) { //从相册选择
			plus.gallery.pick(function(e) {
				_returnVideos = [];
				if (multiple && e.files) {
					var index = 0;
					e.files.forEach(function(item) {
						var videoVM = new self.returnVideoVM(item, generateTempFilePath(index));
						index++;
						_returnVideos.push(videoVM);
					})
				} else {
					var videoVM = new self.returnVideoVM(e, generateTempFilePath());
					_returnVideos.push(videoVM);
				}
				
				if (_callback) {
					_callback(_returnVideos);
				}
			}, function(e) {}, {
				filter: "video"
			});
		}

		self.videos.dispose();
	});
}