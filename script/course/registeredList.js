var registeredList = function() {
	var self = this;

	self.studentList = ko.observableArray([]); 	//管理报名者数组列表
	self.regList = ko.observableArray([]);		//已报名学生列表
	self.dispList = ko.observableArray([]);		//显示的列表
	var all = document.getElementById('checkId');
	var course;
	
	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		if (typeof(web.course) !== "undefined") {
			course = web.course;
		}
		if(course == "undefined") return;
		
		//获取关注我的学生列表
		var ajaxUrl = common.gServerUrl + "API/Action/GetFavoritedUserList?userId=" + getLocalItem("UserID");
		mui.ajax(ajaxUrl, {
			type: 'GET',
			success: function(responseText) {
				var list = JSON.parse(responseText);
				self.studentList(list);
		
				//获取已报名的学生列表
				var ajaxUrl = common.gServerUrl + "API/CourseToUser/GetListByCourseID?courseID=" + course.ID;
				mui.ajax(ajaxUrl, {
					type: 'GET',
					success: function(responseText) {
						var list2 = JSON.parse(responseText);
						self.regList(list2);
						
						//两者均有返回
						if(self.studentList().length > 0 || self.regList().length > 0){
							for(var j = self.studentList().length - 1; j >= 0; j--){
								var student = self.studentList()[j];
								for(var i = self.regList().length - 1; i >= 0; i--){
									var reg = self.regList()[i];

									if(student.ID == reg.ID){
										var obj = {
											ID: student.ID,
											Photo: student.Photo,
											DisplayName: student.DisplayName,
											Gender: student.Gender,
											TheAge: student.TheAge,
											Province: student.Province,
											City: student.City,
											District: student.District,
											Checked: ko.observable(true)
										};
										self.dispList.push(obj);
										
										//剔除
										self.regList.remove(reg);
										self.studentList.remove(student);
									}
								}
							}
							
							//还有未列出的关注我的学生
							if(self.studentList().length > 0){
								self.studentList().forEach(function(student){
									var obj = {
										ID: student.ID,
										Photo: student.Photo,
										DisplayName: student.DisplayName,
										Gender: student.Gender,
										TheAge: student.TheAge,
										Province: student.Province,
										City: student.City,
										District: student.District,
										Checked: ko.observable(false)
									};
									self.dispList.push(obj);
								})
							}
							
							//还有未列出的已报名学生
							if(self.regList().length > 0){
								self.regList().forEach(function(reg){
									var obj = {
										ID: reg.ID,
										Photo: reg.Photo,
										DisplayName: reg.DisplayName,
										Gender: reg.Gender,
										TheAge: reg.TheAge,
										Province: reg.Province,
										City: reg.City,
										District: reg.District,
										Checked: ko.observable(true)
									};
									self.dispList.push(obj);
								})
							}
						}
					}
				})
			}
		})
	})

	self.checkAll = function(){
		var status = all.checked;

		self.dispList().forEach(function(item){
			item.Checked(!status);
		})
	}

	//获取选中的学生UserID串（逗号隔开）
	self.getValues = function(){
		var ret = '';
		self.dispList().forEach(function(item){
			if(item.Checked()){
				if(ret == ''){
					ret = item.ID.toString();
				}
				else{
					ret += ','+item.ID.toString();
				}
			}
		})
		
		return ret;
	}

	self.ensure = function() {
		var IDs = self.getValues();
		if(IDs == ''){
			mui.toast('请选择至少一个学生');
			return;
		}
		
		//判断是否超过最大人数
		if(IDs.indexOf(',') >= 0 && IDs.split(',').length > course.MaxStudent){
			mui.toast('所选人数已超过课程最大学生数（'+course.MaxStudent+'人）');
			return;
		}
		
		var ajaxUrl = common.gServerUrl + "API/CourseToUser/ImportCourseToUser?courseId=" + course.ID + "&studentIDs="+IDs;
		plus.nativeUI.showWaiting();
		mui.ajax(ajaxUrl, {
			type: 'POST',
			success: function(responseText) {
				mui.toast("保存成功");
				mui.back();
				plus.nativeUI.closeWaiting();
			},
			error: function(responseText){
				plus.nativeUI.closeWaiting();
			}
		})
	}
}
ko.applyBindings(registeredList);