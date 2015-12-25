var ws = null;
var scan = null;
// 二维码扫描成功
function onmarked(type, result) {
	//scan.cancel();
	switch (type) {
		case plus.barcode.QR:
			type = "QR";
			break;
		default:
			type = "其它";
			break;
	}
	result = result.replace(/\n/g, '');
	common.transfer("favUser.html", false, {
		result: result
	}, false, false);
	/*
	plus.webview.close(plus.webview.currentWebview());*/
	//plus.webview.create("myInfoTeacher.html","myInfoTeacher.html",{},)
	//plus.webview.close(ws);
}

function onerror(error) {
	console.log("扫描失败")
}

function closeScan() {
	scan.cancel();
}

mui.plusReady(function() {
	// 获取窗口对象
	ws = plus.webview.currentWebview();
	// 开始扫描
	ws.addEventListener('show', function() {
		scan = new plus.barcode.Barcode('bcid', [plus.barcode.QR]); //只识别二维码
		//common.showCurrentWebview();
		scan.onmarked = onmarked;
		scan.onerror = onerror;
		scan.start();
	});
})