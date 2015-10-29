var wgtVer = null; //设置更新包版本号
var ServerVersion = ""; //检查最新增量包版本号
var downloadUrl = "" //增量包下载地址
	/*
	 * 更新流程
	 *(1)从服务器获取是否有最新增量号 checkVersion() checkUpdate()
	 *(2)下载增量包  downloadWgt()
	 *(3)安装增量包 installWgt(path)
	 */

//页面初始化时获取当前的更新包版本号
function plusReady() {
	plus.runtime.getProperty(plus.runtime.appid, function(inf) {
		wgtVer = inf.version;
		//checkVersion();
	})
}
if (window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

	//版本检测

function checkVersion() {
		mui.ajax(common.gServerUrl + "API/Common/GetLatestVersion", {
			type: "GET",
			success: function(responseTest) {
				var result = eval("(" + responseTest + ")");
				ServerVersion = result.Version;
				downloadUrl = common.gServerUrl + result.Url;
				mui.toast("ServerVersion:"+ServerVersion+",downloadUrl:"+downloadUrl);
				checkUpdate();
				
			}
		});
	}
	//检测是否有增量包

function checkUpdate() {
		ServerVersion = transformNum(ServerVersion);
		wgtVer = transformNum(wgtVer);
		mui.toast("ServerVersion:"+ServerVersion+",wgtVer:"+wgtVer);
		if (ServerVersion != "") {
			if (wgtVer && (wgtVer != ServerVersion)) {
				downloadWgt();
			} else {
				console.log("已是最新版本");
			}
		}else{
			mui.toast("获取不到最新版本号，请检查错误");
		}

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
//版本号字符串转化为数字
function transformNum(txt) {
		var result = "";
		var txtArr = txt.split(".");
		for (var i = 0; i < txtArr.length; i++) {
			result += txtArr[i];
		}
		return Number(result);
	}