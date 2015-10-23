var wgtVer = null; //设置更新包版本号
var checkUrl = "http://1.shixiapp.sinaapp.com/upload/version.php"; //检查最新增量包版本号
var downloadUrl = "http://1.shixiapp.sinaapp.com/upload/H506D8436.wgt" //增量包下载地址
var checkState=true;

//页面初始化时获取当前的更新包版本号
function plusReady() {
	plus.runtime.getProperty(plus.runtime.appid, function(inf) {
		wgtVer = inf.version;
		if (checkState) {
			checkUpdate();
		} 
		
	})
}
if (window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}
//检测是否有增量包
function checkUpdate() {
		alert("当前安装包版本：" + plus.runtime.version + ",增量包版本：" + wgtVer);
		plus.nativeUI.showWaiting("检查更新...");
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			switch (xhr.readyState) {
				case 4:
					plus.nativeUI.closeWaiting();
					if (xhr.status = 200) {
						newVer = parseFloat(xhr.responseText.split('<')[0]);
						mui.toast("检测更新成功：" + newVer);
						if (newVer && wgtVer && (newVer != wgtVer)) {
							downloadWgt();
						} else {
							mui.toast("无新版本可更新！");
						}
					} else {
						mui.toast("检测更新失败！");
					}
					break;
				default:
					break;
			}
		}
		xhr.open('GET', checkUrl);
		xhr.send();
	}


	//下载增量包wgt
function downloadWgt() {
		plus.nativeUI.showWaiting("下载wgt文件...");
		plus.downloader.createDownload(downloadUrl, {
			filename: "_doc/update/"
		}, function(d, status) {
			if (status == 200) {
				console.log("下载wgt成功：" + d.filename);
				installWgt(d.filename); // 安装wgt包
			} else {
				console.log("下载wgt失败！");
				alert("下载wgt失败！");
			}
		}).start();
	}

	//更新应用资源
function installWgt(path) {
	plus.nativeUI.showWaiting("安装wgt文件...");
	plus.runtime.install(path, {}, function() {
		plus.nativeUI.closeWaiting();
		console.log("安装wgt文件成功！");
		plus.nativeUI.alert("应用资源更新完成！", function() {
			checkState=false;
			var wvs = plus.webview.all();
			for (var i = 0; i < wvs.length; i++) {
				if (plus.webview.currentWebview().id != wvs[i].id) {
					plus.webview.close(wvs[i]);
				}
			}
			plus.runtime.restart();
		}, "更新提醒", "确定");
	}, function(e) {
		plus.nativeUI.closeWaiting();
		console.log("安装wgt文件失败[" + e.code + "]：" + e.message);
		alert("安装wgt文件失败[" + e.code + "]：" + e.message);
	});
}