import {TurnEvent} from './TurnEvent.js'

/**
*
*/
export function GameUIDock(params){
	var gameUIParams;
	var currentTurn;

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
		if(gameEngineEvent instanceof TurnEvent){	
			this.currentTurn = 	gameEngineEvent.turn();	
			// remove all colors
			d3.select('.company-colors').classed("company-colors-red",false);
			d3.select('.company-colors').classed("company-colors-blue",false);
			//
			var color = gameEngineEvent.turn().activeParty;
			var turnNo = gameEngineEvent.turn().no;
			var colorClass = "company-colors-" + color;			
			d3.select('.company-colors').classed(colorClass,true);
			d3.select('.turn-no').text(turnNo);

			d3.select('.turn-next-button').style('background-color',this.currentTurn.activeParty);

			this.dockDeselectUnit();
		}else{
			switch(gameEngineEvent.eventType){
				case "UNIT_SELECTED":					
					this.dockSelectUnit(gameEngineEvent.originator);
				break;
				case "BATTLE_PERFORMED":
					var battleOutcome = gameEngineEvent.battleOutcome;

					if(battleOutcome.attackingUnit._owner==this.currentTurn.activeParty){						
						this.dockSelectUnit(battleOutcome.attackingUnit);
					}
					else{												
						this.dockSelectUnit(battleOutcome.defendingUnit);
					}
				break;
				case "UNIT_UPDATE":					
					this.dockSelectUnit(gameEngineEvent.originator);
				break;
				default:
					console.log("[handleGameEngineEvent] Unknown event received ",this,gameEngineEvent);
				break;
			}
		}	
		console.log("Received event",gameEngineEvent);
	},

	_findAssetMatchingUnit: function(unit){
		var assets = this.gameUIParams.unitAssets.assets;
		for(var i = 0; i<assets.length; i++){
			var asset = this.gameUIParams.unitAssets.assets[i];
			if(asset.catalog+"-"+asset.displayId == unit._displayStyle)
				return asset;
		}		
	},

	dockDeselectUnit: function(){
		d3.select('.game-dock').style("visibility", "hidden");
	},

	_isActiveUnit: function(unit){
    	return unit._owner == this.currentTurn.activeParty;
    },

	dockSelectUnit: function (unit){
		var asset = this._findAssetMatchingUnit(unit);
		if(asset && this._isActiveUnit(unit)){
			d3.select('.game-dock').style("visibility", "visible");
			
			d3.select('.game-dock-unit-icon use').attr('xlink:href','/assets/svg/'+asset.resource);
			d3.select('.game-dock-unit-name').text(unit.unitName);
			d3.select('.game-dock-unit-name').style('background-color',this.currentTurn.activeParty);
			d3.select('.game-dock-unit-strength').text(unit._strength);
			d3.select('.game-dock-unit-movement .current').text(unit.remainingMoveUnits+"/");
			d3.select('.game-dock-unit-movement .total').text(unit._moveUnits);
			var healthStyle = Math.ceil(100*unit.health/10);
			var colorIndex = Math.max(Math.ceil(healthStyle/25)-1,0);
			healthStyle += "%";
			
			var colors = ["red","#c7c748","orange","green"];
			var color = colors[colorIndex];
			d3.select('.game-dock-unit-health-current').style("width",healthStyle);						
			d3.select('.game-dock-unit-health-current').style("background-color",colors[colorIndex]);						
			var healthText = ''+unit.health+"/10";
			d3.select('.game-dock-unit-health-current').text(healthText);
		}
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
