var worksHeader = function() {
	var self = this;
	mui.init({
		subpages: [{
			url: "worksListAllWorks.html",
			id: "worksListAllWorks.html",
			styles: {
				top: "90px",
				bottom: '0px',
			}
		}]
	});
	// 所有作品页面选择类
	var currentWebview = null;
	document.querySelector("#workListSort").addEventListener('tap', function() {
		currentWebview = plus.webview.currentWebview().children()[0];
		currentWebview.evalJS("mui('#popSort').popover('toggle')");
	});
	document.querySelector("#workListSubject").addEventListener('tap', function() {
		currentWebview = plus.webview.currentWebview().children()[0];
		currentWebview.evalJS("mui('#popSubjects').popover('toggle')");
	});
	document.querySelector("#workListType").addEventListener('tap', function() {
		currentWebview = plus.webview.currentWebview().children()[0];
		currentWebview.evalJS("mui('#popType').popover('toggle')");
	});

}
ko.applyBindings(worksHeader);