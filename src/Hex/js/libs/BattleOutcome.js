/**
* Represents a battle result between two units.
*/
export function BattleOutcome(params){
	var attackingUnit;
	var defendingUnit;
	var attackerDamageInflicted;
	var attackerDamageReceived;
	var defenderDamageInflicted;
	var defenderDamageReceived;
	var casualty;					// unit that has died during a battle (if any)

	if (window === this){
		return new BattleOutcome(params);
	}
	this._initialize(params);

	return this;
}

BattleOutcome.prototype = {
	_initialize: function(params){
		this.attackingUnit = params["attackingUnit"];
		this.defendingUnit = params["defendingUnit"];
		this.attackerDamageInflicted = params["attackerDamageInflicted"];
		this.attackerDamageReceived = params["attackerDamageReceived"];
	
		this.defenderDamageInflicted = params["defenderDamageInflicted"];
		this.defenderDamageReceived = params["defenderDamageReceived"];
		this.casualty = params["casualty"];
	}
}
