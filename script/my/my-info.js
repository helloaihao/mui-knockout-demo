var my_info = function() {
	var self = this;
	//self.ID = ko.observable(" ");.//用户id
	self.UserName = ko.observable(''); //手机
	self.DisplayName = ko.observable(''); //姓名
	self.Photo = ko.observable('../../images/my-default.jpg'); //头像
	self.Birthday = ko.observable(''); //生日
	self.Gender = ko.observable(); //性别
	self.Place = ko.observable(""); //住址
	self.SubjectName = ko.observable('');
	self.subjectID = ko.observable(0);
	self.Introduce = ko.observable('');
	self.UserID = getLocalItem('UserID');
	self.UserType = getLocalItem('UserType');
	self.Password = ko.observable(""); //密码
	self.NewUserName = ko.observable(""); //新的手机号
	self.VerifyCode = ko.observable(""); //验证码
	self.RemainTime = ko.observable(0); //验证码剩余等待时间
	self.WaitTime = 15; //验证码默认等待时间
	/*
	 * my-info js
	 */
	//性别获取
	self.setUserGender = function() {
			mui.ready(function() {
				self.genders.show(function(items) {
					self.UserGenderText(items[0].text);
					self.Gender(items[0].value);
				});
			});
		}
		//生日获取
	self.getBirthday = function() {
			//self.Birthday("2014-12-09");
			var dDate = new Date();
			dDate.setFullYear(2014, 7, 16);
			var minDate = new Date();
			minDate.setFullYear(1990, 0, 1);
			var maxDate = new Date();
			maxDate.setFullYear(2016, 11, 31);
			plus.nativeUI.pickDate(function(e) {
				var d = e.date;
				self.Birthday(d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate());
			}, function(e) {
				mui.toast("您没有选择日期");
			}, {
				title: "请选择日期",
				date: dDate,
				minDate: minDate,
				maxDate: maxDate
			});
		}
		//地址获取
	self.address = function() {
		mui.ready(function() {
			self.places.show(function(items) {
				cityValueMon = (items[0] || {}).text + " " + common.StrIsNull((items[1] || {}).text) + " " + common.StrIsNull((items[2] || {}).text);
				self.CityValue(cityValueMon);
				self.Province(self.CityValue().split(" ")[0]);
				self.City(self.CityValue().split(" ")[1]);
				self.District(self.CityValue().split(" ")[2]);
			});
		})
	}

	//if (common.StrIsNull(getLocalItem('UUID')) != '') {
		self.getStudent = function() {
			mui.ajax(common.gServerUrl + "API/Account/GetInfo?userid=" + self.UserID + "&usertype=" + self.UserType, {
				type: 'GET',
				success: function(responseText) {
					var result = eval("(" + responseText + ")");				
					self.UserID=responseText.ID;
					self.UserName(result.UserName);
					self.DisplayName(result.DisplayName);
					self.Photo(result.Photo);
					self.Birthday(result.Birthday.split(" ")[0]);
					self.Gender(common.gJsonGenderType[result.Gender].text);
					self.Place(result.Place);
					
				}
			})
		}();
	//}
	self.changeUserName = function() {
		common.transfer('modifyPhoneNumber.html');
	}
	//提交修改
	self.setInfo=function(){
		var infoUrl;
		mui.alert('您确定修改吗', '乐评+', function() {});
		if(self.UserType()=32){
			infoUrl=common.gServerUrl+"API/Teacher?userID=";
		}else{
			infoUrl=common.gServerUrl+"API/Student?userID=";
		}
		mui.ajax(infoUrl+self.UserID,{
			type:"PUT",
			data:{
				ID:self.UserID,
				DisplayName:self.DisplayName(),
				Photo:self.Photo(),
				Birthday:self.Birthday(),
				Place:self.Place(),
				Gender:self.Gender()
			},
			success:function(responseText){
				mui.toast("信息修改成功");
			}
			
		})
	}
	/*修改手机号页面 （modifyPhoneNumber.html） js
	 */
	self.getVerifyCode = function() {
		if (self.RemainTime() > 0) {
			mui.toast("不可频繁操作");
			return;
		}
		if (self.NewUserName() == "") {
			mui.toast('手机号不能为空');
		} else if (!(/^1[3|4|5|7|8][0-9]\d{4,8}$/.test(self.NewUserName()))) {
			mui.toast("手机号码不合法")
		} else {
			//账号是否存在,此处不存在success
			mui.ajax(common.gServerUrl + "API/Account/CheckAccount?userName=" + self.NewUserName() + "&exists=false", {
				type: 'GET',
				success: function(responseText) {
					mui.ajax(common.gServerUrl + "Common/GetVerifyCode?mobile=" + self.NewUserName(), {
						//dataType:'json',
						type: 'GET',
						success: function(responseText) {
							//var result = eval("(" + responseText + ")");
							mui.toast(responseText);
							self.RemainTime(self.WaitTime);
							self.CheckTime();
						},
						error: function(responseText) {
							mui.toast(responseText);
						}
					})
				},
				error: function(responseText) {
					mui.toast('手机号已注册');
					//return false;
				}
			})
		}
	}
	self.CheckTime = function() {
		//验证码计时器
		if (self.RemainTime() == 0) {
			return;
		} else {
			self.RemainTime(self.RemainTime() - 1);
			setTimeout(function() {
				self.CheckTime()
			}, 1000);
		}
	}
	self.saveUserNeme = function() {
		//保存修改手机号
		if (self.NewUserName() == "") {
			mui.toast('新手机号不能为空');
		}
		if (self.VerifyCode() == "") {
			mui.toast('验证码不能为空');
			return;
		}
		if (self.Password() == "") {
			mui.toast('密码不能为空');
			return;
		}
		mui.ajax(common.gServerUrl + "API/Account/SetAccount", {
			type: 'POST',
			data: {
				ID:self.UserID,
				UserName: self.NewUserName(),
				Password:self.Password(),
				VerifyCode: self.VerifyCode()
			},
			success: function(responseText) {
				var result = eval("(" + responseText + ")");
				setLocalItem("UserName", result.UserName);	
			}
		});
	}


}
ko.applyBindings(my_info);