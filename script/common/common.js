var common = {
	//Web API地址
	gServerUrl: "http://cloud.linkeol.com/",gVideoServerUrl: "http://video.linkeol.com/",gWebsiteUrl:"http://www.linkeol.com/",
	//gServerUrl: "http://172.16.30.90:8090/",gVideoServerUrl: "http://172.16.30.90:8099/",gWebsiteUrl: "http://172.16.30.90:8081/",
	//gServerUrl:"http://192.168.1.66:8090/",gVideoServerUrl:"http://192.168.1.66:8099/",gWebsiteUrl:"http://192.168.1.66:8080/",

	//判断字符串是否为空，空则返回""
	StrIsNull: function(str) {
		if (str != null)
			return str;
		else
			return "";
	},

	JsonConvert: function(jsonSrc, ValueField, TextField) {
		var jsonDest = [];
		if (typeof(jsonSrc) == "string") {
			jsonSrc = JSON.parse(jsonSrc);
		}
		if (jsonSrc) {
			for (var i = 0; i < jsonSrc.length; i++) {
				jsonDest.push({
					'value': jsonSrc[i][ValueField],
					'text': jsonSrc[i][TextField]
				});
			}
		}

		return jsonDest;
	},

	/**
	 * 根据值获取对应的显示文本
	 * @param {Object} jsonSrc json字符串或数组（必须为value和text键值对的）
	 * @param {String} value 数值
	 * @return {String} 对应的文本
	 */
	getTextByValue: function(jsonSrc, value) {
		if (typeof(jsonSrc) == "string") {
			jsonSrc = JSON.parse(jsonSrc);
		}
		if (jsonSrc) {
			for (var i = 0; i < jsonSrc.length; i++) {
				if (jsonSrc[i].value == value) {
					return jsonSrc[i].text;
				}
			}
		}

		return '';
	},

	//页面跳转
	transfer: function(targetUrl, checkLogin, extras, createNew, autoShowWhileShow, id) {
		var tmpUrl = targetUrl;
		var localUserID = getLocalItem('UserID');

		if (checkLogin && (common.StrIsNull(localUserID) == '' || localUserID <= 0)) {
			//保存当前页面ID
			setLocalItem(common.gVarLocalPageIDBeforeLogin, plus.webview.currentWebview().id);
			tmpUrl = '../account/login.html';
			autoShowWhileShow = true; //跳转至登录页面，强行设置自动打开页面
		}
		createNew = true;
		if (createNew === true) {
			var ws = plus.webview.getWebviewById(targetUrl);
			plus.webview.close(ws);
		}

		if (typeof autoShowWhileShow == "undefined")
			autoShowWhileShow = true;

		if (typeof id == "undefined")
			id = tmpUrl;


		mui.openWindow({
			url: tmpUrl,
			id: id,
			extras: extras,
			createNew: true,
			show: {
				autoShow: autoShowWhileShow,
				aniShow: "slide-in-right",
				duration: "100ms"
			},
			waiting: {
				autoShow: true
			}
		});
	},

	/**
	 * 判断是否首页的子页面
	 * @param {String} webviewId 页面的ID
	 */
	isIndexChild: function(webviewId) {
		var index = plus.webview.getLaunchWebview() || plus.webview.getWebviewById('indexID');
		for (var i = 0; i < index.children().length; i++) {
			if (index.children()[i].id == webviewId) {
				return true;
			}
		}

		return false;
	},

	getIndexChild: function(pos) {
		if (!pos) pos = 0;
		var index = plus.webview.getLaunchWebview() || plus.webview.getWebviewById('indexID');
		var reloadID = 0;

		for (var i = 0; i < index.children().length; i++) {
			if (index.children()[i].id == common.gIndexChildren[pos].webviewId) {
				reloadID = i;
				break;
			}
		}
		return index.children()[reloadID];

	},

	/**
	 * 不创建新webview显示首页，并选中第pos个选项卡
	 * @param {Int}} pos 选项卡的顺序（从0开始）
	 * @param {Boolean} reload 是否刷新该选项卡对应页面
	 * 
	 */
	showIndexWebview: function(pos, reload) {
		mui.plusReady(function() {
			var index = plus.webview.getLaunchWebview() || plus.webview.getWebviewById('indexID');
			var reloadID = 0;
			if (!pos) pos = 0;
			for (var i = 0; i < index.children().length; i++) {
				if (index.children()[i].id == common.gIndexChildren[pos].webviewId) {
					reloadID = i;
					break;
				}
			}
			if (reload) {
				index.children()[reloadID].reload();
			}
			index.evalJS('setActive(' + pos + ')');
			index.show("slide-in-right", "100ms");
		});
	},

	//显示当前页面
	showCurrentWebview: function() {
		mui.plusReady(function() {
			var ws = plus.webview.currentWebview();
			if (ws.parent())
				ws.parent().show();
			else
				ws.show();
			plus.nativeUI.closeWaiting();
		});
	},

	//根据银行卡号获取所属银行
	getMateBank: function(bankNum) {
		var result;
		bankNum = bankNum.replace(/\s+/g, ""); //去空格
		var resultNum = Number(bankNum.substr(0, 6)); //截取前6位数字
		bankList.forEach(function(item) { //匹配银行
			if (item.value == resultNum) {
				result = item.text;
				return;
			}
		});
		//console.log(typeof result);
		if (typeof result == "undefined") {
			return "";
		} else {
			result = result.split("-")[0] + "-" + result.split("-")[2]; //截取字段
			return result;
		}
	},

	//银行卡号处理
	getbankcardNum: function(bankcard) {
		var reg = /.{4}/g,
			rs = bankcard.match(reg);
		rs.push(bankcard.substring(rs.join('').length));
		var result = rs.toString().replace(/\d{4},/g, "**** ");
		return result; //返回 **** **** **** *** /\d{4}/ 
	},

	confirmQuit: function() {
		var btnArray = ['确认', '取消'];
		mui.confirm('确认退出乐评家？', '退出提示', btnArray, function(e) {
			if (e.index == 0) {
				removeLocalItem("workTypeID");
				plus.runtime.quit();
			}
		});
	},

	/**
	 * 设置当前控件为禁用，并返回操作结果
	 * @return {Boolean} 若当前控件原状态是启用则返回true，其它情况返回false
	 */
	setDisabled: function(e) {
		var obj = e || event;
		if (obj) {
			if (obj.srcElement.disabled == true) {
				mui.toast("不可频繁操作");
				return false;
			} else {
				obj.srcElement.disabled = true;
				return true;
			}
		} else {
			return true;
		}
	},

	//设置当前控件为启用
	setEnabled: function(e) {
		var obj = e || event;
		//console.log(obj);
		if (obj) {
			//console.log(obj.srcElement.disabled);
			obj.srcElement.disabled = false;
		}
	},

	//根据认证状态及图片路径获取其中文描述
	getAuthStatusStr: function(authStatus, picPath) {
		switch (authStatus) {
			case 1:
				if (common.StrIsNull(picPath) == '')
					return '未认证';
				else
					return '待认证';
			case 2:
				return '未通过';
			case 3:
				return '已认证';
			default:
				return '';
		}
	},

	//根据QueryString参数名称获取值
	getQueryStringByName: function(name, url) {
		if (url == 'undefined') {
			url = location.search;
		}
		var result = url.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));

		if (result == null || result.length < 1) {
			return "";
		}

		return result[1];
	},

	//计算数组中某一列的总和
	getArraySum: function(array, field) {
		var ret = 0;
		array.forEach(function(item) {
			ret += item[field];
		})
		ret = ret.toFixed(2);

		return ret;
	},

	//提交动作（收藏、赞）
	postAction: function(actionType, targetType, targetID) {
		var ret = false;
		var ajaxUrl = common.gServerUrl + 'API/Action';
		mui.ajax(ajaxUrl, {
			type: 'POST',
			async: false,
			data: {
				UserID: getLocalItem('UserID'),
				ActionType: actionType,
				TargetType: targetType,
				TargetID: targetID
			},
			success: function(responseText) {
				ret = true;
			}
		})

		return ret;
	},

	//对象克隆
	clone: function(obj) {
		var o;
		if (typeof obj == "object") {
			if (obj === null) {
				o = null;
			} else {
				if (obj instanceof Array) {
					o = [];
					for (var i = 0, len = obj.length; i < len; i++) {
						o.push(common.clone(obj[i]));
					}
				} else {
					o = {};
					for (var k in obj) {
						o[k] = common.clone(obj[k]);
					}
				}
			}
		} else {
			o = obj;
		}
		return o;
	},

	//初始化科目及类别的下拉数据源
	initSubjectsTemplate: function() {

		var allSubjectStr = getLocalItem(common.gVarLocalAllSubjectsStr);
		if (common.StrIsNull(allSubjectStr) == '') return; //若未取值，则无需初始化
		var subjects = JSON.parse(allSubjectStr);
		var previousClass = 0;

		var allSubjectClasses = [],
			allSubjects = [],
			allSubjectsBoth = [],
			allSubjectsIndex = [];
		//增加“全部分类”
		allSubjectClasses.push({
			subjectClass: 0,
			subjectClassName: '全部分类'
		});

		//增加“全部”
		allSubjects.push({
			id: 0,
			subjectName: '全部',
			subjectClass: 0,
			subjectClassName: '分类',
			subjectType: '类型',
			selected: true //默认选中
		});

		if (subjects.length > 0) {
			subjects.forEach(function(item) {
				if (item.SubjectClass != previousClass) {
					allSubjectClasses.push({
						subjectClass: item.SubjectClass,
						subjectClassName: item.SubjectClassName
					});

					allSubjectsBoth.push({
						value: item.SubjectClass,
						text: item.SubjectClassName,
						children: []
					})

					//增加每一类“全部”
					allSubjects.push({
						id: 0,
						subjectName: '全部',
						subjectClass: item.SubjectClass,
						subjectClassName: item.SubjectClassName,
						subjectType: '类型',
						selected: false
					});

					previousClass = item.SubjectClass;
				}

				allSubjects.push({
					id: item.ID,
					subjectName: item.SubjectName,
					subjectClass: item.SubjectClass,
					subjectClassName: item.SubjectClassName,
					subjectType: item.subjectType,
					selected: false
				});

				allSubjectsBoth[allSubjectsBoth.length - 1].children.push({
					value: item.ID,
					text: item.SubjectName
				});

				if (item.IsHome) {
					allSubjectsIndex.push({
						id: item.ID,
						subjectName: item.SubjectName,
						subjectClass: item.SubjectClass,
						dispOrderIndex: item.DispOrderIndex
					})
				}
			})
		}

		//首页显示的科目排序
		if (allSubjectsIndex.length > 0) {
			allSubjectsIndex.sort(function(left, right) {
				return left.dispOrderIndex == right.dispOrderIndex ? 0 : (left.dispOrderIndex < right.dispOrderIndex ? -1 : 1);
			})
		}

		setLocalItem(common.gVarLocalAllSubjectClassesJson, JSON.stringify(allSubjectClasses));
		setLocalItem(common.gVarLocalAllSubjectsJson, JSON.stringify(allSubjects));
		setLocalItem(common.gVarLocalAllSubjectsBothJson, JSON.stringify(allSubjectsBoth));
		setLocalItem(common.gVarLocalAllSubjectsIndexJson, JSON.stringify(allSubjectsIndex));
	},

	//从服务器获取所有科目
	getAllSubjectsStr: function() {
		if (getLocalItem(common.gVarLocalAllSubjectsStr) == "") {
			var sub = '[{"ID":1,"SubjectName":"笛子","SubjectClass":1,"SubjectType":11,"IsHome":true,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":2,"SubjectName":"唢呐","SubjectClass":1,"SubjectType":11,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":3,"SubjectName":"笙","SubjectClass":1,"SubjectType":11,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":4,"SubjectName":"葫芦丝","SubjectClass":1,"SubjectType":11,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":5,"SubjectName":"管子","SubjectClass":1,"SubjectType":11,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":6,"SubjectName":"二胡","SubjectClass":1,"SubjectType":12,"IsHome":true,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":7,"SubjectName":"广东高胡","SubjectClass":1,"SubjectType":12,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":8,"SubjectName":"京胡","SubjectClass":1,"SubjectType":12,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":9,"SubjectName":"板胡","SubjectClass":1,"SubjectType":12,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":10,"SubjectName":"琵琶","SubjectClass":1,"SubjectType":13,"IsHome":true,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":11,"SubjectName":"中阮","SubjectClass":1,"SubjectType":13,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":12,"SubjectName":"古筝","SubjectClass":1,"SubjectType":13,"IsHome":true,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":13,"SubjectName":"柳琴","SubjectClass":1,"SubjectType":13,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":14,"SubjectName":"扬琴","SubjectClass":1,"SubjectType":13,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":15,"SubjectName":"箜篌","SubjectClass":1,"SubjectType":13,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":16,"SubjectName":"民族打击乐","SubjectClass":1,"SubjectType":14,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"民族乐器"},{"ID":17,"SubjectName":"小号","SubjectClass":2,"SubjectType":21,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":18,"SubjectName":"长号","SubjectClass":2,"SubjectType":21,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":19,"SubjectName":"圆号","SubjectClass":2,"SubjectType":21,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":20,"SubjectName":"大号","SubjectClass":2,"SubjectType":21,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":21,"SubjectName":"萨克斯","SubjectClass":2,"SubjectType":21,"IsHome":true,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":22,"SubjectName":"长笛","SubjectClass":2,"SubjectType":21,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":23,"SubjectName":"单簧管","SubjectClass":2,"SubjectType":21,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":24,"SubjectName":"巴松","SubjectClass":2,"SubjectType":21,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":25,"SubjectName":"双簧管","SubjectClass":2,"SubjectType":21,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":26,"SubjectName":"小提琴","SubjectClass":2,"SubjectType":22,"IsHome":true,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":27,"SubjectName":"中提琴","SubjectClass":2,"SubjectType":22,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":28,"SubjectName":"大提琴","SubjectClass":2,"SubjectType":22,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":29,"SubjectName":"倍大提琴","SubjectClass":2,"SubjectType":22,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":30,"SubjectName":"竖琴","SubjectClass":2,"SubjectType":22,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":31,"SubjectName":"钢琴","SubjectClass":2,"SubjectType":23,"IsHome":true,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":32,"SubjectName":"电子琴","SubjectClass":2,"SubjectType":23,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":33,"SubjectName":"手风琴","SubjectClass":2,"SubjectType":23,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":34,"SubjectName":"西洋打击乐","SubjectClass":2,"SubjectType":24,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"西洋乐器"},{"ID":35,"SubjectName":"吉他","SubjectClass":3,"SubjectType":31,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"流行音乐"},{"ID":36,"SubjectName":"贝斯","SubjectClass":3,"SubjectType":32,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"流行音乐"},{"ID":37,"SubjectName":"爵士鼓","SubjectClass":3,"SubjectType":33,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"流行音乐"},{"ID":38,"SubjectName":"电脑音乐","SubjectClass":3,"SubjectType":34,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"流行音乐"},{"ID":39,"SubjectName":"戏曲","SubjectClass":4,"SubjectType":41,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"戏曲"},{"ID":41,"SubjectName":"美声唱法","SubjectClass":5,"SubjectType":51,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"声乐"},{"ID":42,"SubjectName":"民族唱法","SubjectClass":5,"SubjectType":52,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"声乐"},{"ID":43,"SubjectName":"通俗唱法","SubjectClass":5,"SubjectType":53,"IsHome":false,"SubjectEnabled":true,"DispOrder":0,"DispOrderIndex":0,"SubjectClassName":"声乐"}]';
			setLocalItem(common.gVarLocalAllSubjectsStr, sub);
			common.initSubjectsTemplate();
		}
		var info = plus.push.getClientInfo();
		var ajaxUrl = common.gServerUrl + 'Common/Subject/GetList?devicetoken=' + info.token + '&clientid=' + info.clientid;
		//var ajaxUrl = common.gServerUrl + 'Common/Subject/GetList';
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				//plus.storage.setItem(common.gVarLocalAllSubjects, responseText);
				setLocalItem(common.gVarLocalAllSubjectsStr, responseText);
				common.initSubjectsTemplate();
			}
		})
	},

	//获取科目类别数组
	getAllSubjectClasses: function() {

		var allSubjectClasses = getLocalItem(common.gVarLocalAllSubjectClassesJson);

		return JSON.parse(allSubjectClasses);
	},

	//获取科目数组
	getAllSubjects: function() {
		var allSubjects = getLocalItem(common.gVarLocalAllSubjectsJson);

		return JSON.parse(allSubjects);
	},

	//获取科目及类别的二级数组
	getAllSubjectsBoth: function() {
		var allSubjectsBoth = getLocalItem(common.gVarLocalAllSubjectsBothJson);

		return JSON.parse(allSubjectsBoth);
	},

	//获取首页显示科目的数组
	getAllSubjectsIndex: function() {
		var allSubjectsIndex = getLocalItem(common.gVarLocalAllSubjectsIndexJson);
		return JSON.parse(allSubjectsIndex);
	},

	//根据起始时间和结束时间返回类似“9月20日 15:00~16:00”
	formatTime: function(btime, etime) {
		if (!btime) return;

		var bdate;
		if (btime instanceof Date)
			bdate = btime;
		else {
			bdate = new Date(btime.replace(/-/gi, '/'));
		}
		if (isNaN(bdate)) { //非日期格式，原文返回
			return btime;
		}
		var ehour = 0;
		if (etime) {
			if (etime instanceof Date)
				ehour = etime.getHours();
			else
				ehour = (new Date(etime.replace(/-/gi, '/'))).getHours();
		} else
			ehour = bdate.getHours() + 1;
		var ret = (bdate.getMonth() + 1) + '月' + bdate.getDate() + '日' + ' ' + bdate.getHours() + ':00~' + ehour + ':00';

		return ret;
	},

	//消息页面的跳转
	gotoMessage: function() {
		common.transfer("/modules/my/messageList.html", true);
	},

	//判断是否已有登录信息缓存
	hasLogined: function() {
		return (common.StrIsNull(getLocalItem('UUID')) != '' && common.StrIsNull(getLocalItem('UserID')) != '');
	},

	//获取未读消息
	getUnreadCount: function(callback) {
		//console.log(common.hasLogined());
		if (common.hasLogined() == false) {
			mui.ajax(common.gServerUrl + "API/Message/GetUnreadCount", {
				dataType: 'json',
				type: "GET",
				data: {
					receiver: getLocalItem('UserID'),
					lastTime: getLocalItem('msgLastTime')
				},
				success: function(responseText) {
					console.log(responseText);
					callback(responseText);
				}
			});
		}
	},

	//传递作品参数的方法
	extrasUp: function(item) {
		var upExtras;
		if (common.gDictUserType.teacher == getLocalItem("UserType")) {
			upExtras = {
				workTypeID: 0, //老师，无需作品类型传递
				workTitle: item == 0 ? '我的作品' : '学生作业'
			}
		} else {
			var userTypeDes = common.gJsonWorkTypeStudent; //默认设置为学生作品类型
			if (item < userTypeDes.length) {
				upExtras = {
					workTypeID: userTypeDes[item].value,
					workTitle: item == 0 ? '我的作品' : '我的作业'
				}
			}
		}
		return upExtras;
	},

	/**
	 * 根据图片名获取其图片
	 * @param {String} photo 图片名
	 */
	getPhotoUrl: function(photo) {
		return common.gServerUrl + 'Images/' + photo;
	},
	getPhotoUrl2: function(photo) {
		return common.gWebsiteUrl + 'Pics/' + photo;
	},

	/**
	 * 获取视频缩略图
	 * @param {String} photo 图片名
	 */
	getThumbnail: function(photo) {
		return common.gVideoServerUrl + 'Thumbnails/' + photo;
	},

	/*
	 * 获取当前页面名称（不带后缀名）
	 */
	getPageName: function() {
		var a = location.href;
		var b = a.split("/");
		var c = b.slice(b.length - 1, b.length).toString(String).split(".");
		return c.slice(0, 1);
	},



	gContentRefreshDown: '刷新中...', //下拉时显示的文字
	gContentRefreshUp: '努力加载中...', //上拉时显示的文字
	gContentNomoreUp: '没有更多数据了', //上拉无数据时显示的文字
	gListPageSize: 8, //列表每页默认数量
	gVarWaitingSeconds: 60, //默认等待验证秒数

	//用户类型枚举
	gDictUserType: {
		teacher: 32,
		student: 64
	},
	//消息类型
	gMessageModule: {
		commentModule: 1, //点评
		workDownloadModule: 2, //作品下载
		courseModule: 3, //课程表
		homeworkModule: 4, //作业
		teacherAuthModule: 5 //老师认证
	},

	//性别类型枚举
	gDictGenderType: {
		male: 0,
		female: 1
	},

	//作品点评状态
	gDictWorkType: {
		notComment: 1, //未点评
		Commenting: 2, //点评中
		Commented: 3 //已点评
	},

	//老师认证
	gDictTeacherAuthType: {
		IDAuth: 1, //身份认证
		EduAuth: 2, //学历认证
		ProTitleAuth: 3 //职称认证
	},

	//老师认证状态
	gDictAuthStatusType: {
		NotAuth: 1, //未认证
		Rejected: 2, //已拒绝
		Authed: 3 //已认证
	},

	//账户明细类型
	gDictAccountDetailType: {
		NotFinish: 1, //未完成
		Finished: 2, //已完成
		Transfered: 3 //已转账
	},

	//动作类型
	gDictActionType: {
		Favorite: 1, //收藏
		Like: 2 //赞
	},

	//动作对象类型
	gDictActionTargetType: {
		Works: 1, //作品
		News: 2, //新闻
		User: 3 //用户
	},

	//课时调整状态
	gDictLessonFeedbackStatus: {
		Normal: 1, //正常
		Handling: 2, //处理中
		Rejected: 3 //已拒绝
	},

	//订单状态
	gDictOrderStatus: {
		NotPay: 1, //未支付
		Payed: 2, //已支付
		Refunded: 3 //已退款
	},

	//订单货品类型
	gDictOrderTargetType: {
		Comment: 1, //点评
		CourseToUser: 2, //约课
		Download: 3 //下载
	},

	//课程类型
	gDictCourseType: {
		One2One: 1, //可约课程
		One2More: 2 //已有课程
	},

	//作品来源类型
	gDictWorkSourceType: {
		Teacher: 1, //老师
		Activity: 2 //活动
	},

	//是否类型JSON
	gJsonYesorNoType: [{
		value: 1,
		text: '是'
	}, {
		value: 0,
		text: '否'
	}],

	//性别类型JSON
	gJsonGenderType: [{
		value: 0,
		text: '男'
	}, {
		value: 1,
		text: '女'
	}],

	//老师作品类型
	gJsonWorkTypeTeacher: [{
		value: 1,
		text: "分解教程"
	}, {
		value: 2,
		text: "完整教程"
	}, {
		value: 3,
		text: "演出作品"
	}],

	//学生作品类型
	gJsonWorkTypeStudent: [{
		value: 104,
		text: "学生作品"
	}, {
		value: 105,
		text: "学生作业"
	}],

	//老师评级
	gJsonTeacherLever: [{
		value: 0,
		text: "全部",
		ctext: "全部"
	}, {
		value: 3,
		text: "★★",
		ctext: "二星级"
	}, {
		value: 4,
		text: "★★★",
		ctext: "三星级"
	}, {
		value: 5,
		text: "★★★★",
		ctext: "四星级"
	}, {
		value: 6,
		text: "★★★★★",
		ctext: "五星级"
	}],

	//老师排序
	gJsonTeacherSort: [{
		value: 1,
		text: "评分降序"
	}, {
		value: 2,
		text: "星级升序"
	}, {
		value: 3,
		text: "星级降序"
	}, {
		value: 4,
		text: "教龄降序"
	}],

	//作品排序
	gJsonWorkSort: [{
		value: 5,
		text: "日期降序"
	}, {
		value: 6,
		text: "浏览降序"
	}, {
		value: 7,
		text: "点赞降序"
	}],

	//点评排序
	gJsonCommentSort: [{
		value: 8,
		text: "状态"
	}, {
		value: 9,
		text: "日期"
	}],

	//作品权限类型JSON
	gJsonWorkPublicType: [{
		value: 0,
		text: '不公开'
	}, {
		value: 1,
		text: '公开'
	}],

	//老师级别
	gProfessionalType: [{
		value: 1,
		text: '教授/国家一级演员'
	}, {
		value: 2,
		text: '副教授/国家二级演员'
	}],

	//课程类型
	gJsonCourseType: [{
		value: 1,
		text: '可约课程'
	}, {
		value: 2,
		text: '已有课程'
	}],

	//图片类型
	gAuthImgage: [{
		value: 0,
		text: '图片预览'
	}, {
		value: 1,
		text: '选择图片'
	}],

	//首页的子页面id
	gIndexChildren: [{
		value: 0,
		webviewId: "modules/home/home.html"
	}, {
		value: 1,
		webviewId: "modules/activity/activityList.html"
	}, {
		value: 2,
		webviewId: "modules/course/myCourse.html"
	}, {
		value: 3,
		webviewId: "modules/works/workIndex.html"
	}, {
		value: 4,
		webviewId: "modules/my/my.html"
	}],


	gArrayDayOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
	gVarLocalDownloadTask: 'global.downloadTasks', //下载任务，包括已完成下载和未完成下载
	gVarLocalUploadTask: 'global.UploadTasks',
	gVarLocalAllSubjectsStr: 'global.AllSubjectsStr',
	gVarLocalAllSubjectsBothJson: 'global.AllSubjectsBothJson', //科目及科目类型的二级Json
	gVarLocalAllSubjectClassesJson: 'global.AllSubjectClassesJson', //所有科目类型的Json
	gVarLocalAllSubjectsJson: 'global.AllSubjectsJson', //所有科目的Json
	gVarLocalAllSubjectsIndexJson: 'global.AllSubjectsIndexJson', //所有首页显示科目的Json
	gVarLocalPageIDBeforeLogin: 'global.PageIDBeforeLogin', //登录前的页面ID

	/*获取网络状态值
	 * CONNECTION_UNKNOW: 网络连接状态未知  固定值0
	 * CONNECTION_NONE: 未连接网络  固定值1
	 * CONNECTION_ETHERNET: 有线网络  固定值2
	 * CONNECTION_WIFI: 无线WIFI网络  固定值3
	 * CONNECTION_CELL2G: 蜂窝移动2G网络  固定值4
	 * CONNECTION_CELL3G: 蜂窝移动3G网络  固定值5
	 * CONNECTION_CELL4G: 蜂窝移动4G网络  固定值6
	 * @description 获取网络状态的函数
	 */
	//gNetworkState: plus.networkinfo.getCurrentType(),
};

(function(w) {

	var addPaddingTop = function(dom, num) {
		var tmp = dom.style.paddingTop;
		if (!tmp) tmp = "0px";
		tmp = parseFloat(tmp.substring(0, tmp.length - 2));
		dom.style.paddingTop = tmp + num + 'px';

	}

	var addMarginTop = function(dom, num) {
		var tmp = dom.style.marginTop;
		if (!tmp) tmp = "0px";
		tmp = parseFloat(tmp.substring(0, tmp.length - 2));
		dom.style.marginTop = tmp + num + 'px';
	}

	var addHeight = function(dom, num) {
		var tmp = dom.offsetHeight;
		dom.style.height = tmp + num + 'px';
	}

	var addTop = function(dom, num) {
		var tmp = dom.style.top;
		tmp = parseFloat(tmp.substring(0, tmp.length - 2));
		dom.style.top = tmp + num + 'px';
	}

	/*document.addEventListener('plusready', function() {
		console.log("Immersed-UserAgent: " + navigator.userAgent);
	}, false);*/

	var immersed = 0;
	var ms = (/Html5Plus\/.+\s\(.*(Immersed\/(\d+\.?\d*).*)\)/gi).exec(navigator.userAgent);
	if (ms && ms.length >= 3) {
		immersed = parseFloat(ms[2]);
	}
	w.immersed = immersed;

	if (!immersed) {
		return;
	}
	var head = document.getElementsByTagName('header')[0];
	if (head) {
		addHeight(head, immersed);
		addPaddingTop(head, immersed);
		var headSon = head.getElementsByClassName('mui-bar-nav-em')[0];
		if (headSon) {
			addPaddingTop(headSon, immersed);
			var headRed = headSon.getElementsByTagName('i')[0];
			if (headRed) {
				addTop(headRed, immersed);
				console.log(headRed.style.top);
			}
		}
	}

	var content = document.getElementsByClassName('mui-content')[0];
	if (content) {
		addMarginTop(content, immersed);
	}

	//		var t = document.getElementById('header');
	//		t && (t.style.paddingTop = immersed + 'px', t.style.background = '-webkit-linear-gradient(top,rgba(215,75,40,1),rgba(215,75,40,0.8))', t.style.color = '#FFF');
	//		t = document.getElementById('content');
	//		t && (t.style.marginTop = immersed + 'px');
	//		t = document.getElementById('dcontent');
	//		t && (t.style.marginTop = immersed + 'px');
	//		t = document.getElementById('map');
	//		t && (t.style.marginTop = immersed + 'px');

})(window);