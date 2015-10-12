var server = ""; //"http://demo.dcloud.net.cn/helloh5/uploader/upload.php";
var files = [];

// 上传文件
function upload() {
		if (files.length <= 0) {
			plus.nativeUI.alert("没有添加上传文件！");
			return false;
		}
		mui.openWindow({
			url: './addWorksPlan.html',
			show: {
				duration: "100ms"
			},
			waiting: {
				autoShow: false
			}
		});

		//console.log('clear');
		plus.uploader.clear();
		var fe = document.getElementById("addchild");
		var child = fe.childNodes;
		while (child.length > 0) {
			fe.removeChild(child[0]);
		}


		empty.style.display = "block";

		mui.ajax(common.gServerUrl + "API/Work" + self.UserID, {
			type: "PUT",
			data: {
				DisplayName: self.DisplayName(),
				SubjectID: self.SubjectID(),
				TeachAge: self.TeachAge(),
				Introduce: self.Introduce()
			},
			success: function(responseText) {
				mui.toast("注册成功")
				window.location = "login.html";
			},
			error: function(responseText) {
				mui.toast("Error");
			}
		});

		//outSet("开始上传：");
		//var wt = plus.nativeUI.showWaiting();
		//		var task = plus.uploader.createUpload(server, {
		//				method: "POST"
		//			},
		//			function(t, status) { //上传完成
		//				if (status == 200) {
		//					mui.toast("上传成功：" + t.responseText);
		//					//					plus.storage.setItem("uploader", t.responseText);
		//					//					var w = plus.webview.create("uploader_ret.html", "uploader_ret.html", {
		//					//						scrollIndicator: 'none',
		//					//						scalable: false
		//					//					});
		//					//					w.addEventListener("loaded", function() {
		//					//						wt.close();
		//					//						w.show("slide-in-right", 300);
		//					//					}, false);
		//				} else {
		//					mui.toast("上传失败：" + status);
		//					//					wt.close();
		//				}
		//			}
		//		);
		//		task.addData("client", "HelloH5+");
		//		task.addData("uid", getUid());
		//		for (var i = 0; i < files.length; i++) {
		//			var f = files[i];
		//			task.addFile(f.path, {
		//				key: f.name
		//			});
		//		}
		//		task.start();
	}
	// 从相册添加文件

function appendByGallery() {
		plus.gallery.pick(function(p) {
			appendFile(p);
		});
	}
	// 添加文件
var index = 1;

function appendFile(p) {
		var fe = document.getElementById("addchild");

		var li = document.createElement("li");
		var n = p.substr(p.lastIndexOf('/') + 1);

		li.innerText = n;
		fe.appendChild(li);


		files.push({
			name: "uploadkey" + index,
			path: p
		});
		index++;
		empty.style.display = "none";
	}
	// 产生一个随机数

function getUid() {
	return Math.floor(Math.random() * 100000000 + 10000000).toString();
}

var viewModel = function() {
	var self = this;
	self.subjectText = ko.observable("请选择科目");
	self.subjectTypeText = ko.observable("请选择类别");
	self.titleText = ko.observable('');
	self.contentText = ko.observable('');
	var subjectFlag = false;
	var typeFlag = false;
	var empty = document.getElementById('empty');
	var subjectName, WorkTypeName;
	var workTypeID, subjectID;

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
		WorkTypeName = new mui.PopPicker();
		WorkTypeName.setData(common.gJsonWorkType);
	});
	//科目获取
	self.setSubject = function() {
		subjectName.show(function(items) {
			self.subjectText(items[0].text);
			subjectID = items[0].value;
			subjectFlag = true;
		});
	};

	
	self.setSubjectType = function() {
		WorkTypeName.show(function(items) {
			self.subjectTypeText(items[0].text);
			workTypeID = items[0].value;
			typeFlag = true;
		});
	};

	self.updateSubject = function() {
		if (subjectFlag && typeFlag && self.titleText() != "") {
//						if (files.length <= 0) {
//							mui.toast("没有添加上传文件！");
//							return false;
//						}
			mui.openWindow({
				url: './addWorksPlan.html',
				show: {
					duration: "100ms"
				},
				waiting: {
					autoShow: false
				}
			});

			//console.log('clear');
			//plus.uploader.clear();
			var fe = document.getElementById("addchild");
			var child = fe.childNodes;
			while (child.length > 0) {
				fe.removeChild(child[0]);
			}


			empty.style.display = "block";
	
			mui.ajax(common.gServerUrl + "API/Work", {
				type: "POST",
				data: {
					AuthorID: getLocalItem("UserID"),
					Title: self.titleText(),
					SubjectID: subjectID,
					ContentText: self.contentText(),
					SubjectName: self.subjectText(),
					WorkType: workTypeID
				},
				success: function(responseText) {
					mui.toast("上传成功")
				},
				error: function(xhr) {
					mui.toast("error");
				}
			});

			subjectFlag = typeFlag = false;
			self.subjectText("请选择科目");
			self.subjectTypeText("请选择类别");
			self.titleText("");
			self.contentText("");
		} else {
			mui.toast('请补充完整数据');
		}
	};
}
ko.applyBindings(viewModel);