var ws = null;
var scan = null;
// 二维码扫描成功
function onmarked(type, result) {
	switch (type) {
		case plus.barcode.QR:
			type = "QR";
			break;
		default:
			type = "其它";
			break;
	}
	result = result.replace(/\n/g, '');
	
	common.transfer("favUser.html", true, {
		result: result
	},false,false);
	//plus.webview.close(ws);
}
mui.plusReady(function() {
	// 获取窗口对象
	ws = plus.webview.currentWebview();
	// 开始扫描
	ws.addEventListener('show', function() {
		scan = new plus.barcode.Barcode('bcid',[plus.barcode.QR]);//只识别二维码
		scan.onmarked = onmarked;
		scan.start();
		common.showCurrentWebview();
	});
	// 显示页面并关闭等待框
	ws.show("pop-in");
})