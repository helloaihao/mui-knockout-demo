var viewModel = function() {
	var self = this;

	var ppSubject;
	self.Locations = ko.observableArray([{
		LocationType: ko.observable(1), //学生上门
		Cost: ko.observable(null)
	}, {
		LocationType: ko.observable(2), //老师上门
		Cost: ko.observable(null)
	}]);

	self.course = ko.observable({ //当前新增或者修改的课程实例
		ID: ko.observable(0),
		CourseName: ko.observable(''),
		SubjectID: ko.observable(0),
		SubjectName: ko.observable('请选择科目'),
		AgeMin: ko.observable(null),
		AgeMax: ko.observable(null),
		Introduce: ko.observable(''),
		MaxStudent: ko.observable(1),
		Locations: Locations
	});

	mui.plusReady(function() {
	//mui.ready(function() {
		ppSubject = new mui.PopPicker();
		mui.ajax(common.gServerUrl + "Common/Subject/Get", {
			dataType: 'json',
			type: "GET",
			success: function(responseText) {
				var arr = common.JsonConvert(responseText, 'ID', 'SubjectName');
				ppSubject.setData(arr);
			}
		});

		//判断是否有传递进入的参数
		var web = plus.webview.currentWebview();
		if (web.course) {
			//修改时，course实例作为参数传递进来。由于均为ko变量，必须如下形式赋值
			var c = web.course;

			self.course().ID(c.ID);
			self.course().CourseName(c.CourseName);
			self.course().SubjectID(c.SubjectID);
			self.course().SubjectName(c.SubjectName);
			self.course().AgeMin(c.AgeMin <= 0 ? null : c.AgeMin);
			self.course().AgeMax(c.AgeMax <= 0 ? null : c.AgeMax);
			self.course().Introduce(c.Introduce);
			self.course().MaxStudent(c.MaxStudnet);
			var locations = JSON.parse(c.LocationJson);
			locations.forEach(function(item) {
				self.Locations().forEach(function(item2) {
					if (item.LocationType == item2.LocationType()) {
						item2.Cost(item.Cost <= 0 ? null : item.Cost);
					}
				})
			})
		}
		/*var tmp = common.getQueryStringByName('course');
		if (tmp) {
			var c = JSON.parse(decodeURI(tmp));

			self.course().ID(c.ID);
			self.course().CourseName(c.CourseName);
			self.course().SubjectID(c.SubjectID);
			self.course().SubjectName(c.SubjectName);
			self.course().AgeMin(c.AgeMin <= 0 ? null : c.AgeMin);
			self.course().AgeMax(c.AgeMax <= 0 ? null : c.AgeMax);
			self.course().Introduce(c.Introduce);
			self.course().MaxStudent(c.MaxStudnet);
			var locations = JSON.parse(c.LocationJson);
			locations.forEach(function(item) {
				self.Locations().forEach(function(item2) {
					if (item.LocationType == item2.LocationType()) {
						item2.Cost(item.Cost <= 0 ? null : item.Cost);
					}
				})
			})
		}*/
	});

	var isNum = function(s) {
		if (s) {
			var r, re;
			re = /\d*/i;
			r = s.match(re);
			return r == s ? true : false;
		}
		return false;
	}

	//获取授课方式的Json
	var arrJson = [];
	self.getLocationJson = function(callback) {
		var result = false;
		arrJson = [];
		self.Locations().forEach(function(item) {
			var obj = {
				LocationType: item.LocationType(),
				Cost: parseInt(item.Cost() ? item.Cost() : 0)
			}
			if (obj.Cost > 0) //只要存在至少一种授课方式便返回true
				result = true;

			arrJson.push(obj);
		})

		callback(JSON.stringify(arrJson));
		return result;
	}

	//根据授课方式类型获取中文描述
	self.getLocationName = function(v) {
		switch (v) {
			case 1:
				return '学生上门';
			case 2:
				return '老师上门';
			case 3:
				return '指定地点';
			default:
				return '学生上门';
		}
	}

	self.setSubject = function() {
		ppSubject.show(function(items) {
			self.course().SubjectName(items[0].text);
			self.course().SubjectID(items[0].value);
		});
	};

	//保存
	self.saveCourse = function() {
		//判断是否有课程名称
		if (self.course().CourseName() == '') {
			mui.toast('课程名称不能为空');
			return;
		}
		//判断是否已选科目
		if (self.course().SubjectID() <= 0) {
			mui.toast('请选择所属科目');
			return;
		}
		//判断是否已选科目
		if (self.course().Introduce() == '') {
			mui.toast('课程介绍不能为空');
			return;
		}
		//判断是否存在至少一种授课方式
		var json = '';
		var ret = getLocationJson(function(v) {
			json = v;
		});
		if (!ret) {
			mui.toast('请设置至少一种授课方式');
			return;
		}

		var type = 'POST';
		var ajaxUrl = common.gServerUrl + "API/Course?locationJson=";
		if (self.course().ID() > 0) { //此时为修改
			type = 'PUT';
			ajaxUrl = common.gServerUrl + "API/Course?id=" + self.course().ID() + "&locationJson=";
		}
		mui.ajax(ajaxUrl + encodeURI(json), {
			type: type,
			data: {
				UserID: getLocalItem("UserID"),
				CourseName: self.course().CourseName(),
				Introduce: self.course().Introduce(),
				MaxStudent: self.course().MaxStudent(),
				SubjectID: self.course().SubjectID(),
				AgeMin: self.course().AgeMin(),
				AgeMax: self.course().AgeMax(),
				IsEnabled: true
			},
			success: function(responseText) {
				mui.toast("保存成功");
				//ToDo：此处应该跳转至开设课程列表，并刷新列表
			}
		});
	};
};

ko.applyBindings(viewModel);