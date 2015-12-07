var shareUrl = "www.linkeol.com"; //分享附上的链接，为公司主页
var shareTitle = "90%的人不知道的音乐网站" //分享内容的标题
var shareContent = "我敢说，你绝对不知 道有这么好用的网站"; //分享的内容*/
var shareImg = ["_www/images/logo.png"];

var ul = document.getElementById("recommendArray");
var lis = ul.getElementsByTagName("li");
for (var i = 0; i < lis.length; i++) {
	lis[i].onclick = function() {
		mui.toast("敬请期待");
		//mui.toast(this.id);
		/*if (lis[i] == "qqFriend") {
			mui.toast("敬请期待");
		} else {
			Share.sendShare(this.id, shareTitle, shareContent, shareUrl, shareImg);
		}*/
	};
}
mui.plusReady(function() {
	Share.updateSerivces()
})