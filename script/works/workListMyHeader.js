var worksHeader = function() {
	var self = this;
	var workTypeID;
	self.workTitle = ko.observable('');
	mui.init();

	mui.plusReady(function() {
		var workIndex = plus.webview.currentWebview();
		if (typeof workIndex.workTypeID != "undefined" && workIndex.workTypeID >= 0) {
			workTypeID = workIndex.workTypeID;
			ID = workIndex.ID;
			self.workTitle(workIndex.workTitle);
			setLocalItem("workTypeID", workTypeID);
			setLocalItem("teacherID", ID);
		}
		var pageMy = mui.preload({
			url: "worksListMyWorks.html",
			id: "worksListMyWorks.html",
			styles: {
				top: "48px",
				bottom: '0px',
			}
		});
		workIndex.append(pageMy);
	});
}
ko.applyBindings(worksHeader);