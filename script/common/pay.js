var Pay = {
	var pays = {};
	mui.plusReady(function() {
		plus.payment.getChannels(function(channels) {
			for (var i in channels) {
				var channel = channels[i];
				pays[channel.id] = channel;
				checkServices(channel);
			}
		}, function(e) {
			mui.toast("获取支付通道失败");
		})
	})

	//检测是否安装支付服务
	var checkServices = function(pc) {
		if (!pc.serviceReady) {
			var txt = null;
			switch (pc.id) {
				case "alipay":
					txt = "检测到系统未安装“支付宝快捷支付服务”，无法完成支付操作，是否立即安装？";
					break;
				case "wxpay":
					txt = "系统未安装“" + pc.description + "”服务，无法完成支付，是否立即安装？";
					break;
				default:
					break;
			}
			plus.nativeUI.confirm(txt, function(e) {
				if (e.index == 0) {
					pc.installService();
				}
			}, pc.description);
		}
	}

	//order：支付订单信息，由支付通道定义的数据格式，通常是由业务服务器生成或向支付服务器获取，是经过加密的字符串信息。
	var pay = function(payid, order) {
		plus.payment.request(pays[payid], order, function(result) {
			mui.toast("支付成功");
		}, function(e) {
			mui.toast("支付失败");	// + e.code);
		});
	}
}