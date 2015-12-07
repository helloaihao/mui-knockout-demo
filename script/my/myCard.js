var myCard=function(){
	var self=this;
	self.bankcardArray=ko.observableArray([]);
	self.addBankcard=function(){
		common.transfer("addCard.html",false);
	}
}
ko.applyBindings(myCard);
