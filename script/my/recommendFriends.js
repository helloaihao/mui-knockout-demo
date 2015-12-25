var shareUrl = common.gWebsiteUrl+'modules/home/aboutUs.html'; //分享附上的链接，为公司主页
var shareTitle = "我就知道你喜欢学音乐" //分享内容的标题
var shareContent = "学音乐的那点事"; //分享的内容*/
var shareImg = ["_www/favicon.ico"];

var ul = document.getElementById("recommendArray");
var lis = ul.getElementsByTagName("li");
for (var i = 0; i < lis.length; i++) {
	lis[i].onclick = function() {
		Share.sendShare(this.id, shareTitle, shareContent, shareUrl, shareImg);
	};
}
mui.plusReady(function() {
	Share.updateSerivces();
	//qrcode.makeCode(common.gWebsiteUrl+'modules/home/aboutUs.html?device=app');
})