//本文档务必在knockout.js后加载

var picture = picture || {};

//保存于私有资源文档的临时图片处理文件
picture.tempFile = '_doc/temp/tmp.jpg';

//上传图片的视图模型
picture.pictureViewModel = function(src, imgbase64, len) {
	var self = this;
	self.src = src;
	self.imgbase64 = imgbase64;
	self.len = len;
	console.log(src + " " + len);
}

//最后一张图片的路径以及base64字符串
picture.LastPic = ko.observable('');
picture.LastPicBase64 = ko.observable('');

//利用全局的ko数组变量记录所有选择的照片
picture.SelectedPics = ko.observableArray([]);

//选择本地照片，并实现压缩、转换为base64
//crop为是否裁剪；multiple为是否多选
picture.SelectPicture = function(crop, multiple) {
	var self = this;
	self.pictures = new mui.PopPicker();

	//点击空白区域或取消按钮，直接释放本弹出框
	self.pictures.mask[0].addEventListener('tap', function() {
		self.pictures.dispose();
	}, false);
	self.pictures.cancel.addEventListener('tap', function() {
		self.pictures.dispose();
	}, false);

	self.pictures.setData([{
		value: 0,
		text: '拍照'
	}, {
		value: 1,
		text: '相册中选择'
	}]);
	self.pictures.show(function(items) {
		if (items[0].value == 0) { //拍照
			var cmr = plus.camera.getCamera();
			cmr.captureImage(function(path) {
				plus.gallery.save(path);
				if (crop)
					self.CropImage(plus.io.convertLocalFileSystemURL(path));
				else
					self.ZoomImageToBase64(path);
			}, function(e) {}, {
				filename: "_doc/gallery/",
				index: 1
			});
		} else if (items[0].value == 1) { //从相册选择
			plus.gallery.pick(function(e) {
				if (multiple && e.files) {
					self.SelectedPics.removeAll();
					for (var i in e.files) {
						self.ZoomImageToBase64(e.files[i]); //选择多张时，无需裁剪
					}
				} else {
					if (crop)
						self.CropImage(plus.io.convertLocalFileSystemURL(e));
					else
						self.ZoomImageToBase64(e);
				}
			}, function(e) {}, {
				filter: "image",
				multiple: multiple
			});
		}
		self.pictures.dispose();
	});
}

//cropperjs对象
picture.cropper = null;

//确定裁剪
picture.CropConfirm = function(src) {
	var self = this;

	//转换cropper选中区域的对象，以符合plus.zip中压缩图片option要求
	var chosen = self.cropper.getData();
	var clip = {
		left: chosen.x,
		top: chosen.y,
		width: chosen.width,
		height: chosen.height
	}
	self.ZoomImageToBase64(plus.io.convertAbsoluteFileSystem(src), clip);
	document.body.removeChild(event.srcElement.parentElement);
}

//取消裁剪
picture.CropCancel = function() {
	document.body.removeChild(event.srcElement.parentElement);
}

//裁剪图片（动态生成div、img及按钮，并初始化裁剪区域）
picture.CropImage = function(src) {
	var self = this;
	var div = document.createElement("div"); //此处需要美化裁剪界面以及按钮样式
	div.className = "cropper-container11";
			div.style.position = "fixed";
			div.style.left = 0;
			div.style.top = 0;
			div.style.right = 0;
			div.style.bottom = 0;
			div.style.zIndex = 20;
			div.style.backgroundColor = "lightgray";
			div.style.padding = 0;
	div.innerHTML = "<img style='margin:0;padding:0;border:0;' src='" + src + "' /><button class='mui-btn mui-btn-primary' onclick='picture.CropConfirm(\"" + src + "\")'>确定</button><button class='mui-btn mui-btn-warning' onclick='picture.CropCancel()'>取消</button>"
	document.body.appendChild(div);

	var image = document.querySelector('.cropper-container11 > img');
	self.cropper = new Cropper(image, {
		aspectRatio: 1 / 1,
		autoCrop: true,
		responsive: false,
		checkImageOrigin: false,
		highlight: false,
		drapCrop: false,
		movable: false,
		rotatable: false,
		scalable: false,
		zoomable: false,
		mouseWheelZoom: false,
		doubleClickToggle: false,
		minCropBoxWidth: 50,
		minCropBoxHeight: 50
	});
}

//获取图片较大的边，参数img为页面中的IMG，返回0为宽度、1为高度
picture.GetLargerSide = function(img) {
	if (img.width >= img.height)
		return 0;
	else
		return 1;
}

//利用plus的文件系统API，把文件转换为Base64
picture.ConvertToBase64 = function(srcFile) {
	var self = this;
	plus.io.requestFileSystem(plus.io.PRIVATE_DOC,
		function(fs) {
			var rootEntry = fs.root;
			var reader = null;
			rootEntry.getFile(srcFile, {},
				function(entry) {
					entry.file(function(file) {
							reader = new plus.io.FileReader();
							reader.onloadend = function(e) {
								console.log("Read success");

								//本地路径转换为平台绝对路径才能访问得到
								var picVM = new self.pictureViewModel(
									plus.io.convertLocalFileSystemURL(srcFile), e.target.result, file.size);
								self.SelectedPics.push(picVM);
								self.LastPic(picVM.src);
								self.LastPicBase64(e.target.result);
							};
							reader.readAsDataURL(file);
						},
						function(e) {
							console.log(e.message);
						});
				});
		});
}

//利用plus的io，压缩图片大小，之后开始转换Base64。clip为裁剪区域的参数
picture.ZoomImageToBase64 = function(srcFile, clip) {
	var self = this;
	//console.log(JSON.stringify(clip));

	//若clip不为空则裁剪，否则仅压缩
	var option = null;
	if (clip) {
		option = {
			src: srcFile,
			dst: this.tempFile,
			overwrite: true,
			clip: clip
		}
	} else {
		option = {
			src: srcFile,
			dst: this.tempFile,
			overwrite: true,
			width: 1024 //不裁剪时，强制压缩宽度为1024
		}
	}
	plus.zip.compressImage(option,
		function() {
			console.log("Zoom success!");
			self.ConvertToBase64(self.tempFile);
		}, function(error) {
			console.log("Zoom error!" + error.message);
		});
}