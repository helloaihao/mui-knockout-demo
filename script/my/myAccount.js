var myAccount = function() {
	var self = this;
	self.DisplayName = ko.observable(""); //用户名
	self.Balance = ko.observable(0); //我的余额
	self.DetailsNotFinish = ko.observableArray([]); //未完成明细
	self.DetailsFinished = ko.observableArray([]); //已完成明细
	self.DetailsTrasfered = ko.observableArray([]); //已转账明细
	self.SumAccount = ko.observable('0'); //未完成小计
	self.Photo = ko.observable('');

	mui.plusReady(function() {
			var self = this;
			mui.ajax(common.gServerUrl + "API/Account/GetInfo?userid=" + getLocalItem("UserID") + "&usertype=" + getLocalItem('UserType'), {
				type: 'GET',
				success: function(responseText) {
					var result = eval("(" + responseText + ")");
					self.DisplayName(result.DisplayName);
				}
			});
			var ajaxUrl = common.gServerUrl + 'API/Account/GetBalance?userid=' + getLocalItem('UserID') + '&usertype=' + getLocalItem('UserType');
			mui.ajax(ajaxUrl, {
				type: 'GET',
				success: function(responseText) {
					var balance = JSON.parse(responseText);
					self.Balance(balance);
				}
			})
			var current = plus.webview.currentWebview();
			if (common.StrIsNull(current.Photo) != "") {
				self.Photo(current.Photo);
			}
			self.SumNotFinish();
		})
		//未完成
	self.SumNotFinish = function() {
			var ajaxUrl = common.gServerUrl + 'API/Account/GetAccountDetails?userid=' + getLocalItem('UserID') + '&usertype=' + getLocalItem('UserType') + '&accountDetailType=';
			//common.gDictAccountDetailType.NotFinish;
			mui.ajax(ajaxUrl + common.gDictAccountDetailType.NotFinish, {
				type: 'GET',
				success: function(responseText) {
					var detailsNotFinish = JSON.parse(responseText);
					self.DetailsNotFinish(detailsNotFinish);
					self.SumAccount(common.getArraySum(self.DetailsNotFinish(), 'Amount'));
					
					common.showCurrentWebview();
				}
			})
		}
		//已完成
	self.SumFinish = function() {
		var ajaxUrl = common.gServerUrl + 'API/Account/GetAccountDetails?userid=' + getLocalItem('UserID') + '&usertype=' + getLocalItem('UserType') + '&accountDetailType=';
		mui.ajax(ajaxUrl + common.gDictAccountDetailType.Finished, {
			type: 'GET',
			success: function(responseText) {
				var detailsFinish = JSON.parse(responseText);
				self.DetailsFinished(detailsFinish);
				self.SumAccount(common.getArraySum(self.DetailsFinished(), 'Amount'));
			}
		})
	}

	//已到账
	self.SumTrasfered = function() {
			var ajaxUrl = common.gServerUrl + 'API/Account/GetAccountDetails?userid=' + getLocalItem('UserID') + '&usertype=' + getLocalItem('UserType') + '&accountDetailType=';
			mui.ajax(ajaxUrl + common.gDictAccountDetailType.Transfered, {
				type: 'GET',
				success: function(responseText) {
					var detailsTrasfered = JSON.parse(responseText);
					self.DetailsTrasfered(detailsTrasfered);
					self.SumAccount(common.getArraySum(self.DetailsTrasfered(), 'Amount'));
				}
			})
		}
		//提现
	self.Withdraw = function() {
		//mui.toast("敬请期待");
		common.transfer("myCard.html",false);
	}
	window.addEventListener('refeshBalance', function(event) {
		if (event.detail.newBalance) {
			self.Balance(event.detail.newBalance);
		}
	});
}
ko.applyBindings(myAccount);