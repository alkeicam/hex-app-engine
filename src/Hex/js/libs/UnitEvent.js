/**
* Represents a event originated in Game Engine for some Unit in the game.
*/
export function UnitEvent(unit, type, company){
	var _unit;
	var _type; // INITIALIZED, DIE	
	var _company;

	if (window === this){
		return new UnitEvent(unit, type, company);
	}
	this._initialize(unit, type, company);

	return this;
}

UnitEvent.prototype = {
	_initialize: function(unit, type, company){
		this._unit = unit;
		this._type = type;
		this._company = company;
	},
	
	unit: function(){
		return this._unit;
	},
	type: function(){
		return this._type;
	},
	company: function(){
		return this._company;
	}
}
