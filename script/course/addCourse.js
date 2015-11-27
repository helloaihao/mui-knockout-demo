var viewModel = function() {
	var self = this;
	var courseNew;
	var ppSubject, ppCourseType;
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
		CourseType: ko.observable(1),
		CourseTypeName: ko.observable(common.getTextByValue(common.gJsonCourseType, common.gDictCourseType.One2One)),
		SubjectID: ko.observable(0),
		SubjectName: ko.observable(''),
		AgeMin: ko.observable(null),
		AgeMax: ko.observable(null),
		BeginTime: ko.observable(new Date().format('yyyy-MM-dd')),
		LessonCount: ko.observable(null),
		Introduce: ko.observable(''),
		ClasstimeJson: ko.observable(''),
		MaxStudent: ko.observable(null),
		Locations: Locations,
		SubjectName: ko.observable(null)
	});

	//=====上课时间设定begin=====
	var beginHour = 8; //开始时间
	var endHour = 21; //结束时间
	self.Hours = ko.observableArray([]); //小时数组
	for (var i = beginHour; i <= endHour; i++) {
		self.Hours.push(i);
	}
	self.DayOfWeek = ko.observableArray(['日', '一', '二', '三', '四', '五', '六']); //星期数组
	self.DayOfWeekValue = ko.observableArray([0, 1, 2, 3, 4, 5, 6]); //星期的值数组
	self.Classtimes = ko.observableArray([]); //上课时间
	self.classtimeCount = ko.observable(0); //上课时间总个数
	self.ClasstimesText = ko.observableArray([]);

	//初始化单元格
	self.initCell = function(dayofweek, hour) {
		var self = this;
		var ret = {
			dayofweek: dayofweek,
			hour: hour,
			free: false
		};

		if (self.Classtimes()) {
			self.Classtimes().forEach(function(freetime) {
				if (dayofweek == freetime.DayOfWeek && freetime.Time.indexOf(hour) >= 0) {
					//console.log('true');
					ret = {
						dayofweek: dayofweek,
						hour: hour,
						free: true
					};
					return;
				}
			})
		}

		return ret;
	}

	ko.bindingHandlers.cellValue = {
		init: function(element, valueAccessor) {

		},
		update: function(element, valueAccessor, allBindings) {
			//var self = this;
			var value = ko.unwrap(valueAccessor());
			element.value = value;
			element.onclick = function() {
				//console.log(this.value.free);
				this.value.free = !this.value.free;
				this.className = this.value.free ? 'busytime' : 'freetime';

				//获取数组中对应的位置
				var index = -1;

				for (var i = 0; i < self.Classtimes().length; i++) {
					if (self.Classtimes()[i].DayOfWeek == this.value.dayofweek) {
						index = i;
						break;
					}
				}
				if (this.value.free) {
					//若无该天的时间，则增加该天
					if (index == -1) {
						var newday = {
							DayOfWeek: this.value.dayofweek,
							Time: []
						}
						self.Classtimes().push(newday)
						index = self.Classtimes().length - 1;
					}
					var times = self.Classtimes()[index].Time;
					times.push(this.value.hour); //增加该时间段
					times.sort();
					self.classtimeCount(self.classtimeCount() + 1);
				} else {
					if (index >= 0) {
						var times = self.Classtimes()[index].Time;
						var len = times.length;
						for (var i = 0; i < len; i++) {
							if (times[i] == this.value.hour) {
								times.splice(i, 1); //移除该时间段
								if (times.length == 0) { //若改天无数据，则移除该天
									self.Classtimes().splice(index, 1);
								}
							}
						}
						self.classtimeCount(self.classtimeCount() - 1);
					}
				}
			}
			if (value.free) {
				element.className = 'busytime';
			} else {
				element.className = 'freetime';
			}
		}
	}

	//选择课时后确定返回
	self.back = function() {
		//var self = this;
		if (self.classtimeCount() <= 0) {
			mui.toast('请选择至少一个课时');
		} else {
			self.ClasstimesText.removeAll();
			self.Classtimes.sort(function(left, right) {
				return left.DayOfWeek == right.DayOfWeek ? 0 : (left.DayOfWeek < right.DayOfWeek ? -1 : 1);
			})
			self.Classtimes().forEach(function(item) {
				item.Time.forEach(function(item2) {
					var str = '星期' + self.DayOfWeek()[item.DayOfWeek] + ' ' + item2 + ':00~' + (item2 + 1) + ':00';
					self.ClasstimesText.push(str);
				})
			})
			mui('#popChooseTime').popover('toggle');
		}
	}

	//开启选择课时弹窗
	self.openPopChooseTime = function() {
		document.body.scrollTop = 0;
		mui('#popChooseTime').popover('show');
	}

	//关闭选择课时弹窗
	self.closePopChooseTime = function() {
			mui('#popChooseTime').popover('hide');
		}
		//=====上课时间设定end=====

	mui.plusReady(function() {
		ppSubject = new mui.PopPicker({
			layer: 2
		});
		ppSubject.setData(common.getAllSubjectsBoth());

		ppCourseType = new mui.PopPicker();
		ppCourseType.setData(common.gJsonCourseType);

		//判断是否有传递进入的参数
		var web = plus.webview.currentWebview();
		if (web.course) {
			//修改时，course实例作为参数传递进来。由于均为ko变量，必须如下形式赋值
			var c = web.course;
			//console.log(JSON.stringify(c));

			self.course().ID(c.ID);
			self.course().CourseName(c.CourseName);
			self.course().SubjectID(c.SubjectID);
			self.course().CourseType(c.CourseType);
			self.course().CourseTypeName(common.getTextByValue(common.gJsonCourseType, c.CourseType));
			self.course().SubjectName(c.SubjectName);
			self.course().MaxStudent(c.MaxStudent);
			self.course().LessonCount(c.LessonCount);
			self.course().AgeMin(c.AgeMin <= 0 ? null : c.AgeMin);
			self.course().AgeMax(c.AgeMax <= 0 ? null : c.AgeMax);
			self.course().BeginTime(common.StrIsNull(c.BeginTime) == '' ? '' : c.BeginTime.split(' ')[0]);
			self.course().Introduce(c.Introduce);
			self.course().ClasstimeJson(c.ClasstimeJson);
			self.Classtimes(JSON.parse(c.ClasstimeJson));
			var counter = 0;
			if (self.Classtimes()) {
				self.Classtimes().forEach(function(item) {
					counter += item.Time.length;
					item.Time.forEach(function(item2) {
						var str = '星期' + self.DayOfWeek()[item.DayOfWeek] + ' ' + item2 + ':00~' + (item2 + 1) + ':00';
						self.ClasstimesText.push(str);
					})
				})
			}
			self.classtimeCount(counter);
			var locations = JSON.parse(c.LocationJson);
			if (locations) {
				locations.forEach(function(item) {
					self.Locations().forEach(function(item2) {
						if (item.LocationType == item2.LocationType()) {
							item2.Cost(item.Cost <= 0 ? null : item.Cost);
						}
					})
				})
			}

			common.showCurrentWebview();
		}
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
			self.course().SubjectName(items[1].text);
			self.course().SubjectID(items[1].value);
		});
	};

	self.setCourseType = function() {
		ppCourseType.show(function(items) {
			self.course().CourseTypeName(items[0].text);
			self.course().CourseType(items[0].value);
		});
	};

	//选择日期
	self.chooseDate = function() {
		var now = new Date();
		var year = 1900 + now.getYear();
		if (self.course().BeginTime() == '') {
			self.course().BeginTime(new Date());
		}

		dtPicker.PopupDtPicker({
				'type': 'date',
				'beginYear': year,
				'endYear': year + 1
			},
			self.course().BeginTime(),
			function(value) {
				self.course().BeginTime(value.split(' ')[0]);
			});
	}

	//保存
	self.saveCourse = function() {
		//判断是否有课程名称
		if (self.course().CourseName() == '') {
			mui.toast('课程名称不能为空');
			return;
		}
		//console.log(self.course().CourseType());
		//判断是否有课程名称
		if (self.course().CourseType() <= 0) {
			mui.toast('请选择课程类型');
			return;
		}
		//判断是否已选科目
		if (self.course().SubjectID() <= 0) {
			mui.toast('请选择所属科目');
			return;
		}
		//判断是否填写了人数限制
		if (self.course().CourseType() == common.gDictCourseType.One2More && self.course().MaxStudent() <= 0) {
			mui.toast('人数限制必须为大于零的整数');
			return;
		}
		//判断是否填写了开始日期
		if (self.course().CourseType() == common.gDictCourseType.One2More && self.course().MaxStudent() <= 0) {
			mui.toast('开始日期不能为空');
			return;
		}
		//判断是否填写了总课时数
		if (self.course().CourseType() == common.gDictCourseType.One2More && self.course().LessonCount() <= 0) {
			mui.toast('总课时数必须为大于零的整数');
			return;
		}
		//判断是否有课程介绍
		if (self.course().Introduce() == '') {
			mui.toast('课程介绍不能为空');
			return;
		}
		//判断是否存在至少一种授课方式
		var json = '';
		var ret = getLocationJson(function(v) {
			json = v;
		});
		if (self.course().CourseType() == common.gDictCourseType.One2One && !ret) {
			mui.toast('请设置至少一种授课方式');
			return;
		}
		//判断是否已选择了上课时间
		if (self.course().CourseType() == common.gDictCourseType.One2More && self.classtimeCount() <= 0) {
			mui.toast('请选择上课时间');
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
				CourseType: self.course().CourseType(),
				BeginTime: self.course().BeginTime(),
				LessonCount: self.course().LessonCount(),
				Introduce: self.course().Introduce(),
				MaxStudent: self.course().MaxStudent(),
				SubjectID: self.course().SubjectID(),
				AgeMin: self.course().AgeMin(),
				AgeMax: self.course().AgeMax(),
				//SubjectName:self.course().SubjectName(),
				ClasstimeJson: JSON.stringify(self.Classtimes()),
				IsEnabled: true
			},
			success: function(responseText) {
				courseNew=eval("(" + responseText + ")");
				mui.toast("保存成功");
				mui.back();
				//ToDo：此处应该跳转至开设课程列表，并刷新列表
			}
		});
	};
	mui.init({
		beforeback: function() {
			var myCourses = plus.webview.currentWebview().opener();
			if (self.course().ID() > 0) { //此时为修改页面传递参数
				mui.fire(myCourses, 'refreshCourses', {
					courseId: self.course().ID(),
					CourseName: self.course().CourseName(),
					CourseType: self.course().CourseType(),
					BeginTime: self.course().BeginTime(),
					LessonCount: self.course().LessonCount(),
					Introduce: self.course().Introduce(),
					MaxStudent: self.course().MaxStudent(),
					SubjectID: self.course().SubjectID(),
					AgeMin: self.course().AgeMin(),
					AgeMax: self.course().AgeMax(),
					SubjectName: self.course().SubjectName(),
					ClasstimeJson: JSON.stringify(self.Classtimes())
				});
				return true;
			} else {
				mui.fire(myCourses, 'refreshCourseList', {
					course: courseNew
				});
				return true;
			}
		}
	})
};

ko.applyBindings(viewModel);