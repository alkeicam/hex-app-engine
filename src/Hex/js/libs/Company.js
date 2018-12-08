/**
* 
*/
export function Company(owner,companyColorsSrc){
	var _owner;
	var _companyColorsSrc;	

	if (window === this){
		return new Company(owner, companyColorsSrc);
	}
	this._initialize(owner, companyColorsSrc);

	return this;
}

Company.prototype = {
	_initialize: function(owner, companyColorsSrc){
		this._companyColorsSrc = companyColorsSrc;
		this._owner = owner;
	},
	companyColorsSrc: function(){
		return this._companyColorsSrc;
	},
	owner: function(){
		return this._owner;
	}
}
