/**
* Represents a event originated in Game Engine for turn change.
*/
export function TurnEvent(turn){	
	var _turn; 

	if (window === this){
		return new TurnEvent(turn);
	}
	this._initialize(turn);

	return this;
}

TurnEvent.prototype = {
	_initialize: function(turn){
		this._turn = turn;		
	},
	
	
	turn: function(){
		return this._turn;
	}
}
