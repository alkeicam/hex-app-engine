/**
*
*/
export function GameUIDock(params){
	var gameUIParams;

	if (window === this){
		return new GameUIDock(params);
	}
	this._initialize(params);

	return this;

};

GameUIDock.prototype = {
	_initialize: function (params){

		this.gameUIParams = {};

		this.addCompanyColors(params["companyColors"]);
		var owner = params["company"].owner();

		var unitsArray = params["units"]; 
		for (var idx in unitsArray){
			var unit = unitsArray[idx];
			if(owner == unit._owner){
				this.addUnitToDock(unit);
				this.addUnitClickHandler(unit);
			}
		}
		this.gameUIParams = params;
		console.log("Initialized GameUIDock with params {1}",params);
	},
	addCompanyColors: function(companyColorURL){
		$(".dock").prepend("<img class=\"company-colors\" src=\""+companyColorURL+"\">");
	},
	addUnitToDock: function(unit){
		$(".dock").append("<div id=\""+this.getUnitElementId(unit)+"\" class=\""+this.getUnitElementBaseClass()+" "+unit.getCurrentStyle()+"\"></div>");
	},
	deselectUnit: function(unit){
		var unitElement = $("#"+GameUtils._safeIdSelector(this.getUnitElementId(unit)));
		GameUtils._uiElementClassesRemove(unitElement, "dock-unit");
		unitElement.addClass(this.getUnitElementBaseClass());
	},
	getUnitElement: function(unit){
		var unitElement = $("#"+GameUtils._safeIdSelector(this.getUnitElementId(unit)));
		if(unitElement.length!=0)
			return unitElement;
	},
	getUnitElementId: function(unit){
		return "dock-unit-id-"+unit._unitId;
	},
	getUnitElementBaseClass: function(){
		return "dock-unit";
	},
	getUnitElementSelectedClass: function(){
		return "dock-unit-selected";
	},
	handleGameEngineEvent: function(gameEngineEvent){
		switch(gameEngineEvent.eventType){
			case "UNIT_SELECTED":
				this.deselectAllUnits();
				this.selectUnit(gameEngineEvent.originator);
			break;
			case "BATTLE_PERFORMED":
				var battleOutcome = gameEngineEvent.battleOutcome;

				if(battleOutcome.attackingUnit._owner==this.gameUIParams.company.owner())
					this.updateUnit(battleOutcome.attackingUnit);
				else
					this.updateUnit(battleOutcome.defendingUnit);
			break;
			case "UNIT_UPDATE":
				this.updateUnit(gameEngineEvent.originator);
			break;
			default:
				console.log("[handleGameEngineEvent] Unknown event received ",this,gameEngineEvent);
			break;
		}
		console.log("Received event",gameEngineEvent);
	},
	selectUnit: function(unit){
		var unitElement = this.getUnitElement(unit);
		if(!unitElement)
			return;		
		GameUtils._uiElementClassesRemove(unitElement, "dock-unit");
		unitElement.addClass(this.getUnitElementSelectedClass());

		// only one unit may be selected so deselect any other selected unit
		var unitsArray = this.gameUIParams["units"];
		for(var idx in unitsArray){
			var otherUnit = unitsArray[idx];
			if(otherUnit._owner==this.gameUIParams.company.owner() && !otherUnit.equals(unit)){
				this.deselectUnit(otherUnit);
			}
		}

	},
	deselectAllUnits: function(){
		// only one unit may be selected so deselect any other selected unit
		var unitsArray = this.gameUIParams["units"];
		for(var idx in unitsArray){
			var otherUnit = unitsArray[idx];
			if(otherUnit._owner==this.gameUIParams.company.owner()){
				this.deselectUnit(otherUnit);
			}
		}		
	},
	
	updateUnit: function(unit){
		var unitElement = this.getUnitElement(unit);
		if(!unitElement)
			return;
		GameUtils._uiElementClassesRemove(unitElement, unit._displayStyle);
		unitElement.addClass(unit.getCurrentStyle());

	},
	addUnitClickHandler: function (unit){
		var unitElement = this.getUnitElement(unit);
		if(!unitElement)
			return;
		unitElement.on('click', {ctx: this, u: unit},function(event) {
			// var moveRange = event.data.ctx.moveRangeForUnit(event.data.u);
			// event.data.ctx.uiHighlightHexes(moveRange);
			// console.log("[uiAddUnitClickHandler] clicked unit: "+unit.toString() );
			event.data.ctx.selectUnit(event.data.u);
		});
	},
	
};
