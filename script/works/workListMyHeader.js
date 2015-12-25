var worksHeader = function() {
	var self = this;
	var workTypeID;
	self.workTitle = ko.observable('');
	mui.init();

	mui.plusReady(function() {
		var workIndex = plus.webview.currentWebview();
		if (typeof workIndex.workTypeID != "undefined" && workIndex.workTypeID >= 0) { //0代表老师的所有作品类型
			workTypeID = workIndex.workTypeID;
			setLocalItem("workTypeID", workTypeID);
			self.workTitle(workIndex.workTitle);
		}
		removeLocalItem("teacherID"); //清空该键值的内容
		if (typeof workIndex.ID != "undefined" && workIndex.ID > 0) { //ID代表作者UserID
			ID = workIndex.ID;
			setLocalItem("teacherID", ID);
		}
		var topPx = '48px';
		if (plus.os.vendor == 'Apple') {
			topPx = '63px';
		}
		var pageMy = mui.preload({

			url: "worksListMyWorks.html",
			id: "worksListMyWorks.html",
			styles: {
				top: topPx,
				bottom: '0px',
			}
		});
		workIndex.append(pageMy);
	});
}
ko.applyBindings(worksHeader);