//			mui('#list1').on('tap', '.mui-table-view-cell', function() {
//				var p = this.parentNode;
//				var pp = p.parentNode;
//				mui(pp).popover('hide');
//				var ca = this.childNodes[1];
//				console.log(ca);
//				var subjectVal = ca.innerHTML;
//				document.getElementById('select1').innerHTML = subjectVal;
//			});
//			mui('#list2').on('tap', '.mui-table-view-cell', function() {
//				var p = this.parentNode;
//				var pp = p.parentNode;
//				mui(pp).popover('hide');
//				var ca = this.childNodes[1];
//				console.log(ca);
//				var subjectVal = ca.innerHTML;
//				document.getElementById('select2').innerHTML = subjectVal;
//			});


var commentList = function() {

	mui.init({
		pullRefresh: {
			container: '#pullrefresh',
			down: {
				callback: pulldownRefresh
			},
			up: {
				contentrefresh: '正在加载...',
				callback: pullupRefresh
			}
		}
	});

//mui('#middlePopover2').popover('toggle');
	var self = this;
	self.works = ko.observableArray([]);
	var pageNum = 1;
	//加载作品
	self.getWorks = function() {
		mui.ajax(common.gServerUrl + "API/Work?page=" + pageNum, {
			type: 'GET',
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				self.works(result);
			},
			error: function() {
				mui.toast("ERROR");
			}
		})
	}();
	//刷新

	function pulldownRefresh() {
		setTimeout(function() {
			pageNum++;
			mui.ajax(common.gServerUrl + "API/Work?page=" + pageNum, {
				type: 'GET',
				success: function(responseText) {
					var result = eval("(" + responseText + ")");
					self.works(self.works().concat(result));
					mui('#pullrefresh').pullRefresh().endPulldownToRefresh();

				}
			});
		}, 1500);
	}

	var count = 0;

	function pullupRefresh() {
		setTimeout(function() {
			pageNum++;
			mui.ajax(common.gServerUrl + "API/Work?page=" + pageNum, {
				type: 'GET',
				success: function(responseText) {
					mui('#pullrefresh').pullRefresh().endPullupToRefresh((++count > 2));
					var result = eval("(" + responseText + ")");
					self.works(self.works().concat(result));
				}
			});
		}, 1500);
	}

	if (mui.os.plus) {
		mui.plusReady(function() {
			setTimeout(function() {
				mui('#pullrefresh').pullRefresh().pullupLoading();
			}, 1000);

			if (plus.os.vendor == 'Apple') {
				mui('.mui-scroll-wrapper').scroll();
			}
		});
	} else {
		mui.ready(function() {
			mui('#pullrefresh').pullRefresh().pullupLoading();
		});
	}
}
ko.applyBindings(commentList);