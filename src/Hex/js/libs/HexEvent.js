/**
* Represents a event originated in Game Engine for some Hex in the game.
*/
export function HexEvent(hex, type){
	var _hex;
	var _type; // INITIALIZED	

	if (window === this){
		return new HexEvent(hex, type);
	}
	this._initialize(hex, type);

	return this;
}

HexEvent.prototype = {
	_initialize: function(hex, type){
		this._hex = hex;
		this._type = type;
	},
	
	hex: function(){
		return this._hex;
	}
}
