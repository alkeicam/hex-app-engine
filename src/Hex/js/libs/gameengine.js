import {BattleOutcome} from './BattleOutcome.js'
import {Hex} from './Hex.js'
import {Unit} from './Unit.js'
import {HexEvent} from './HexEvent.js'
import {UnitEvent} from './UnitEvent.js'
import {GameEngineEvent} from './GameEngineEvent.js'

 function LOGGER(){
    var oldConsoleLog = null;
    var pub = {};

    pub.enableLogger =  function enableLogger() 
                        {
                            if(oldConsoleLog == null)
                                return;

                            window['console']['log'] = oldConsoleLog;
                        };

    pub.disableLogger = function disableLogger()
                        {
                            oldConsoleLog = console.log;
                            window['console']['log'] = function() {};
                        };

    return pub;
};

var logger = LOGGER();



/**
* TODO add documentation
*/
function Cube(x,y,z){
	var x;
	var y;
	var z;

	if (window === this) {
         return new Cube(x,y,z);
    }

    this.x = x;
    this.y = y;
    this.z = z;

    return this;

};

Cube.prototype = {

};



//========= Path calculation ========
/**
* Helper class for path calculations
*/
// =========
function Node (data, priority) {
	if (window === this) {
         return new Node(data, priority);
    }

    this.data = data;
    this.priority = priority;
};
Node.prototype.toString = function(){return this.priority};


/**
* Helper class for path calculations
*/
// takes an array of objects with {data, priority}
function PriorityQueue (arr) {
	if (window === this) {
         return new PriorityQueue(arr);
    }

    this.heap = [];
    if (arr) for (i=0; i< arr.length; i++)
        this.push(arr[i].data, arr[i].priority);
};

PriorityQueue.prototype = {
    push: function(data, priority) {
        var node = new Node(data, priority);
        this.bubble(this.heap.push(node) -1);      
    },
    
    // removes and returns the data of highest priority
    pop: function() {
        //var topVal = this.heap[1].data;
        var topNode = this.heap.shift();
        //this.heap[1] = this.heap.pop();
        //this.sink(1); return topVal;
        return topNode.data;
    },
    
    // bubbles node i up the binary tree based on
    // priority until heap conditions are restored
    bubble: function(i) {
        while (i > 0) { 
            var parentIndex = i >> 1; // <=> floor(i/2)
            
            // if equal, no bubble (maintains insertion order)
            if (!this.isHigherPriority(i, parentIndex)) break;
            
            this.swap(i, parentIndex);
            i = parentIndex;
    }   },
        
    // does the opposite of the bubble() function
    sink: function(i) {
        while (i*2 < this.heap.length) {
            // if equal, left bubbles (maintains insertion order)
            var leftHigher = !this.isHigherPriority(i*2 +1, i*2);
            var childIndex = leftHigher? i*2 : i*2 +1;
            
            // if equal, sink happens (maintains insertion order)
            if (this.isHigherPriority(i,childIndex)) break;
            
            this.swap(i, childIndex);
            i = childIndex;
    }   },
        
    // swaps the addresses of 2 nodes
    swap: function(i,j) {
        var temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    },
        
    // returns true if node i is higher priority than j
    isHigherPriority: function(i,j) {
        return this.heap[i].priority < this.heap[j].priority;
    },

    isEmpty: function(){
    	return !this.heap.length;
    }
};
// =========





/**
* params {
	
	hexMapTiles - array of hex tiles
	units - array of units
}
*/
export function GE(params){

	var engineParams;

	/*
	var unitData = {
		_unitId = 1,
		mapPosition: hexData,
		_moveUnits = 9;
		remainingMoveUnits: 9,	
		_sight = 2;	
		_range
		_strength
		_rangedStrength

		attackRange() - zwraca hexy ktore jednostka moze zaatakowac
		movementRange() - zwraca hexy do ktorych moze pojsc jednostka w ramach posiadanych punktow ruchu
		sightRange() - zwraca hexy, ktore "widzi jednostka"
		attack(unitHexData, targetUnit, targetUnitHexData) - zwraca wartosc sily przy ataku
		defend(unitHexData, targetUnit, targetUnitHexData) - zwraca wartosc sily przy obronie
	}
	var hexData = {
		hexId = "1,3",
		moveUnitsCost: 2,
		displayStyle: "map-forest"
		sightCost = 99;
		defenceBonus = 0,1;

	}
	*/

	var hexMap;
	var unitsMap;
	var eventHandlers;	// array of event handlers {hObject, hFunction}

	var renderer; 	// renderer object for handling hex and unit on the board presentation and interaction
	// About object is returned if there is no 'params' parameter
	var about = {
		Version: 1.0,
		Author: "Maciej Grula",
		Created: "2015",
		Updated: "29 December 2015"
	};

	if (params) {
 
      // Avoid clobbering the window scope:
      // return a new GE object if we're in the wrong scope
      if (window === this) {
         return new GE(params);
      }
 
      // We're in the correct object scope:
      // Init 
      this._initializeEngine(params);
      return this;
   } else {
      // No 'id' parameter was given, return the 'about' object
      return about;
   }
};


GE.prototype = {

	/**
	* Returns array of validation errors if any engine param is invalid.
	*/
	_validateEngineParams: function (engineParams){
		var engineParamsErrorsArray = [];
		
		if(!engineParams.hexMapTiles||engineParams.hexMapTiles.length==0||!engineParams.hexMapTiles[0] instanceof Hex){
			engineParamsErrorsArray.push("engineParams.hexMapTiles - map hexes model not provided");
		}
		if(!engineParams.units||engineParams.units.length==0||!engineParams.units[0] instanceof Unit){
			engineParamsErrorsArray.push("engineParams.units - units model not provided");
		}
		if(!engineParams.eventHandlers||engineParams.eventHandlers.length==0){
			engineParamsErrorsArray.push("engineParams.eventHandlers - no handlers registered for engine");
		}
		return engineParamsErrorsArray;

	},
	
	/**
	* Initializes engine with mode data:
	* map - hexes representing map
	* units 
	* event handlers of objects that are interested in receiving notifications from engine (like after move, after battle)
	*/
	_initializeEngine: function (engineParams){
		this.engineParams = engineParams;
		this.hexMap = {};
		this.unitsMap = {};
		this.eventHandlers = [];
		this.renderer = {};

		var errorsArray = this._validateEngineParams(engineParams);
		if(errorsArray.length>0){
			console.log("Error initializing engine due to invalid params", errorsArray);
			return;
		}

		for(var idx in engineParams.eventHandlers){
			var handler = engineParams.eventHandlers[idx];
			this._addEventHandler(handler.hObject,handler.hFunction);
		}

		// initialize map tiles		
		for (var arrayIdx in engineParams.hexMapTiles){
			var hexData = engineParams.hexMapTiles[arrayIdx];
			// register hex in engine
			this._addMapHex(hexData);	

			// apply style for map tile - renderer
			//$(GameUtils._safeIdSelector("#"+hexData._hexId)).addClass(hexData._displayStyle);
			var event = new HexEvent(hexData,"INITIALIZED");
			this.publishEvent(event);
		}

		for (var arrayIdx in engineParams.units){
			var unitData = engineParams.units[arrayIdx];

			// register unit in engine
			this._addUnit(unitData);	

			var event = new UnitEvent(unitData,"INITIALIZED", this.engineParams.company);
			this.publishEvent(event);

			// // apply style for unit - renderer
			// //$(this._safeIdSelector("#"+unitData._unitId)).addClass(unitData._currentDisplayStyle);			
			// if(unitData._owner == this.engineParams.owner){
			// 	this._uiAddUnitFlag(unitData);
			// }
			// this.uiUnitRerender(unitData);
			// this.uiAddUnitClickHandler(unitData);
		}	


		
		this.renderer = engineParams.renderer;

		//this.uiEnableUnitDragAndDropSupport();	

		console.log("[initializeEngine] Initialized with params: {1}",engineParams);
	},	

	_addEventHandler: function (functionObject, functionHandler){
		var handler = {
			hObject: functionObject,
			hFunction: functionHandler
		};
		this.eventHandlers.push(handler);
	},
	_addMapHex: function (hex){
		this.hexMap[hex._hexId] = hex;
	},
	_addUnit: function (unit){
		this.unitsMap[unit._unitId] = unit;
	},

	/**
	* Transforms between coordinate systems - Cube to Hex
	*/
	_cubeToHex: function(cube){
		var q = cube.x;
		var r = cube.z;

		return new Hex(q,r,null);		// warning this will erase all hex properties
	},

	
	/**
	* Caclulates costs from hexId to other hexes. It can be constrained on maxCost (only hexes that are no
	* further then maxCost will be returned) or by goalHex (when goal hex is reached the algorithm stops)
	*
	*
	* Params:
	* hex - starting hex
	* costFunction - javascript function that can calculate the cost of moving between two neighbour hexes provided by algorithm
	* costFunctionObject - object whose costFunction implementation will be called
	* maxCost - upper limit for path calculation, when shortest path cost is greater than this value then it is assumed that destination hex is unreachable (as no shortest path exists)
	* goalHex - destination hex to which shortest path shall be calculated
	* 
	* Returns result struct containing:
	* result {
	* 	previousMap: {hexId: previousHexId} - optimal nodes to reach given node
	*	costMap: {hexId: cost} - optimal cost to reach node from starting node
	}
	*/
	_algorithmDijikstra: function(hex, costFunction, costFunctionObject, maxCost, goalHex){

		var SAFETYMAXITERATIONS = 99999;

		var frontier = new PriorityQueue();
		frontier.push(hex._hexId,0);

		var cameFrom = {};
		var costSoFar = {};

		if(maxCost!=0 && !maxCost){
			maxCost = 999999999;
		}		

		cameFrom[String(hex._hexId)] = null;
		costSoFar[String(hex._hexId)] = 0;
		var iterationCounter = 0;

		while(!frontier.isEmpty()){
			iterationCounter++;
			if(iterationCounter>SAFETYMAXITERATIONS){
				console.log("[_algorithmDijikstra] ERROR - max iterations found. Stopping algorithm.");
				break;

			}
			var currentHexId = frontier.pop();

			var currentHex = this.getHexData(currentHexId);

			if(goalHex && (currentHex._hexId == goalHex._hexId)){
				break;
			}

			var neighbours = this.getHexNeighbours(currentHex); //{direction, hexData}

			for( var neighbourKey in neighbours){
				var neighbourHex = neighbours[neighbourKey];
				var costFromFunction = (costFunctionObject)?costFunction.apply(costFunctionObject,[currentHex, neighbourHex]):costFunction(currentHex, neighbourHex);
				var newCost = costSoFar[currentHexId] + costFromFunction;

				if(newCost>maxCost){
					continue;
				}

				
				if( (! (neighbourHex._hexId in costSoFar)) || newCost < costSoFar[neighbourHex._hexId]){
					costSoFar[neighbourHex._hexId] = newCost;
					frontier.push(neighbourHex._hexId,newCost);
					cameFrom[neighbourHex._hexId] = currentHex._hexId;
				}
			}
		}	
		var result = {
			previousMap: cameFrom,
			costMap: costSoFar
		}

		return result;
	},
	/**
	* Returns: BattleOutcome
	*/
	attack: function(attackUnit, defendUnit, baseDamage, baseDamageSpread){		
		var attackStrength = attackUnit.attack(defendUnit);
		var defendStrength = defendUnit.defend(attackUnit);

		var strongerUnit = (attackStrength>defendStrength)?attackUnit:defendUnit;
		var strongerUnitStrength = (attackStrength>defendStrength)?attackStrength:defendStrength;

		var weakerUnit = (attackStrength<=defendStrength)?attackUnit:defendUnit;
		var weakerUnitStrength = (attackStrength<=defendStrength)?attackStrength:defendStrength;

		var r = Math.max(attackStrength,defendStrength)/Math.min(attackStrength,defendStrength);
		var m = 0.5+Math.pow(r+3,4)/512;		

		var minDmgToStrongerUnit = baseDamage/m;
		var minDmgToWeakerUnit = baseDamage*m;

		var dmgSpreadToStrongerUnit = baseDamageSpread/m;
		var dmgSpreadToWeakerUnit = baseDamageSpread*m;

		var damageToStrongerUnit = Math.max(Math.floor(minDmgToStrongerUnit+this.generateRandom(0,dmgSpreadToStrongerUnit)),1);
		var damageToWeakerUnit = Math.max(Math.floor(minDmgToWeakerUnit+this.generateRandom(0,dmgSpreadToWeakerUnit)),1);

		strongerUnit.health = Math.max(strongerUnit.health-damageToStrongerUnit,0);
		weakerUnit.health = Math.max(weakerUnit.health-damageToWeakerUnit,0);

		strongerUnit.gainExperience(weakerUnitStrength,damageToWeakerUnit,damageToStrongerUnit);
		weakerUnit.gainExperience(strongerUnitStrength,damageToStrongerUnit,damageToWeakerUnit);

		if(strongerUnit.health==0&&weakerUnit.health==0){
			if(damageToWeakerUnit>damageToStrongerUnit){
				strongerUnit.health = 1;				
			}else{
				weakerUnit.health = 1;
			}
		}
		
		var result = new BattleOutcome({
			attackingUnit: attackUnit,
			defendingUnit: defendUnit,
			attackerDamageInflicted: (attackUnit.equals(strongerUnit))?damageToWeakerUnit:damageToStrongerUnit,
			attackerDamageReceived: (attackUnit.equals(strongerUnit))?damageToStrongerUnit:damageToWeakerUnit,
			defenderDamageInflicted: (defendUnit.equals(strongerUnit))?damageToWeakerUnit:damageToStrongerUnit,
			defenderDamageReceived: (defendUnit.equals(strongerUnit))?damageToStrongerUnit:damageToWeakerUnit			
		});

		if(strongerUnit.health==0){ 			
			var gameEvent = new UnitEvent(strongerUnit,"DIE",this.engineParams.company);
			this.publishEvent(gameEvent);

			result.casualty = strongerUnit;
		};
		if(weakerUnit.health==0){
			//this.uiUnitDie(weakerUnit);
			var gameEvent = new UnitEvent(weakerUnit,"DIE",this.engineParams.company);
			this.publishEvent(gameEvent);

			result.casualty = weakerUnit;
		};
		return result;
	},

	attackRangeForUnit: function(unit){
		
		var preliminaryAttackRange = this._algorithmDijikstra(unit.position,function(){return 1}, null, unit._range);

		// now calculate if all hexes further than 1 hex are reachable
		// for instance range units may have attack range > 1
        var hexes = [];
        for( var item in preliminaryAttackRange.costMap){
        	var rangeCost = preliminaryAttackRange.costMap[item];
        	var hex = this.getHexData(item);                        
        	if(rangeCost==1){
        		hexes.push(hex);
        	}else if (rangeCost>1){
        		var isEligibleAttackRange = unit.attackRange(this.lineConnectingHexes(unit.position, hex));
        		if(isEligibleAttackRange){
        			hexes.push(hex);
        		}
        	}                        
        }
        return hexes;
    },

	dictionaryToString: function(dictionary){
		var result = "Dictionary=[";
		for (var item in dictionary){
			result += ""+item+":"+dictionary[item]+",";
		}
		result += "]";
		return result;
	},

	/**
	* Calculates distance between two hexes. It assumes that each hex has a 1 distance value.
	*/
	distancePlain: function (fromHex, toHex){		

		var distance = (Math.abs(fromHex.q - toHex.q) 
          + Math.abs(fromHex.q + fromHex.r - toHex.q - toHex.r)
          + Math.abs(fromHex.r - toHex.r)) / 2;

		return distance;
	},

	fieldOfView: function (hexId, sight) {

	},

	fieldOfViewForUnit: function (unitId) {
		//return 	this.fieldOfView(this.getUnitData(unitId).mapPosition,this.getUnitData(unitId).sight);
	},
	generateRandom: function(min, max){
		var random = Math.random() * (max - min) + min;
		return random;
	},
	generateRandomInt: function (min, max){
		var random = Math.floor(Math.random() * (max - min + 1)) + min;
		return random;
	},

	/**
	* Returns Unit from engine
	*/
	getUnitData: function (unitId){
		var unit = this.unitsMap[unitId];
		return unit;
	},
	/**
	* returns units map
	*/
	getUnitsMap: function(){
		return this.unitsMap;
	},
	/**
	* Returns Hex from engine
	*/
	getHexData: function (hexId){
		var hex = this.hexMap[hexId];
		return hex;
	},

	getHexMap: function(){
		return this.hexMap;
	},

	/**
	* Return neighbour hexData object
	* Returns null/undefined when no neighbour is found
	* Directions: N, NE, SE, S, SW, NW
	*
	* Returns: Hex
	*/
	getHexNeighbour: function (hex, direction) {
		
		
		// var hexX = hex.q;
		// var hexY = hex.r;

		var resultHexId;
		// hex ids are reverted - q,r

		//if q not odd 
		if(hex.q % 2){
			// odd
			switch(direction){
			case "N":
				resultHexId = (hex.q)+","+(hex.r-1);
			break;
			case "NE":
				resultHexId = (hex.q+1)+","+(hex.r-1);
			break;
			case "SE":
				resultHexId = (hex.q+1)+","+(hex.r);
			break;
			case "S":
				resultHexId = (hex.q)+","+(hex.r+1);
			break;
			case "SW":
				resultHexId = (hex.q-1)+","+(hex.r);
			break;
			case "NW":
				resultHexId = (hex.q-1)+","+(hex.r-1);
			break;
			default:
				return null;

			}
		}else{
			// even
			switch(direction){
			case "N":
				resultHexId = (hex.q)+","+(hex.r-1);
			break;
			case "NE":
				resultHexId = (hex.q+1)+","+(hex.r);
			break;
			case "SE":
				resultHexId = (hex.q+1)+","+(hex.r+1);
			break;
			case "S":
				resultHexId = (hex.q)+","+(hex.r+1);
			break;
			case "SW":
				resultHexId = (hex.q-1)+","+(hex.r+1);
			break;
			case "NW":
				resultHexId = (hex.q-1)+","+(hex.r);
			break;
			default:
				return null;

			}
		}
		
		return this.getHexData(resultHexId);
	},

	/**
	* Returns list of {direction, hexData} pairs of neighbour hexes for given hex.
	* Directions are one of: "N","NE","SE","S","SW","NW"
	*
	* Returns: map {direction, hexData}
	*/
	getHexNeighbours: function (hex){
		var neighboursHexData = {};

		var directions = ["N","NE","SE","S","SW","NW"];
		//var directions = ["E","NE","SE","W","SW","NW"];

		for (var direction in directions){
			var neighbourHexData = this.getHexNeighbour(hex,directions[direction]);

			// add neighbour only when found
			if(neighbourHexData)
				neighboursHexData[directions[direction]] = neighbourHexData;
		}

		return neighboursHexData;
	},
	/**
	*	Returns Unit that occupies given Hex
	*/
	getUnitAtHex: function (hex) {
		for (var unitId in this.unitsMap){
			var unitData = this.unitsMap[unitId];
			if(unitData.position._hexId==hex._hexId)
				return unitData;
		}
	},

	hexesInRange: function (hex, range){

	},

	/*
	* Transforms between coordinate systems - Hex to Cube
	*/
	hexToCube: function (hex){
		var x = hex.q
    	var z = hex.r
    	var y = -x-z

    	return new Cube(x, y, z);
	},



	isMoveAllowed: function (unit, targetHex){
		// // get unit
		// var unitData = unit;
		// // get hex occupied by unit
		// var departureHex = unitData.mapPosition;
		// // get destination hex data
		// var destinationHex = targetHex;

		// // find unit occupying destinationHex
		// var unitAtDestinationHex = this.getUnitAtHex(targetHex);

		// // when there is another unit at hex than you may not move there
		// if(!unitAtDestinationHex)
		// 	return false;

		// var remainingMoveUnits = unitData.remainingMoveUnits;
		// var hexTerrainCost = destinationHex._moveUnitsCost;
		// if(remainingMoveUnits>=hexTerrainCost)
		// 	return true;
		var inRangeHexArray = this.moveRangeForUnit(unit);
		for( var idx in inRangeHexArray){
			var hex = inRangeHexArray[idx];
			if(targetHex.equals(hex)){
				return true;
			}
		}

		return false;
	},

	/**
	* Calculates all hexes lying on the line connecting hexfrom and hexto
	* 
	* Returns: array of Hex objects connecting from and to (including from and to)
	*/
	lineConnectingHexes: function (hexFrom, hexTo){
		

		var cubeFrom = this.hexToCube(hexFrom);
		var cubeTo = this.hexToCube(hexTo);

		var distance = this.distancePlain(hexFrom,hexTo);
		var results = [];
		var debugString = "";

		if(distance==0){
			results.push(hexFrom);
			debugString += hexFrom.toString();			
		} else {		
			for (var i=0;i<=distance;i++){
				var cubeLerp = this._cubeLERP(cubeFrom,cubeTo,1.0/distance * i);
				var cubeRound = this._cubeRound(cubeLerp);
				var hex = this._cubeToHex(cubeRound);				
				results.push(this.getHexData(hex._hexId));
				debugString += hex.toString()+",";
			}
		}

		console.log("[lineConnectingHexes] Line connecting "+hexFrom._hexId+" and "+hexTo._hexId+" is ["+debugString+"]");
		return results;
	},

	meleeAttack: function(attackUnit, defendUnit){
		var defendUnitPosition = defendUnit.position;

		var battleOutcome = this.attack(attackUnit, defendUnit,4,4);
		if(battleOutcome.casualty && battleOutcome.casualty.equals(defendUnit))
			this.positionUnit(attackUnit,defendUnitPosition);

		// attackUnit.reapplyStyle();
		// defendUnit.reapplyStyle();

		// this.uiUnitRerender(attackUnit);
		// this.uiUnitRerender(defendUnit);

		// consume move points from attack
		this.consumeMovePoints(attackUnit,-1);
	

		var gameEvent = new GameEngineEvent({
			originator: attackUnit,
			battleOutcome: battleOutcome,
			eventType: "BATTLE_PERFORMED"
		});

		this.publishEvent(gameEvent);

		console.log("[meleeAttack] Attack performed with result: ",battleOutcome);
	},

	/**
	* Returns array of Hex that are in move range for unit.
	* It takes into consideration:
	* - terrain movement cost
	* - unit movement specifics
	* - unit remaining move points
	* - whether hex is occupied by friendly unit or not
	*
	* Returns: Hex array
	*/
	moveRangeForUnit: function (unit){
		var result = this._algorithmDijikstra(unit.position,unit.moveRange, unit, unit.remainingMoveUnits);

        var hexes = [];
        for( var item in result.previousMap){
            var hex = this.getHexData(item);  
            var unitAtHex = this.getUnitAtHex(hex);
            if(unitAtHex&&unitAtHex._owner==unit._owner) {
            	// when hex is occupied by friendly hex then do not allow it to be reached
            	continue;
            }            
            hexes.push(hex);
        }
        return hexes;
	},

	/**
	* Consumes unit move points.
	* When negative value is passed then all remaining points are removed
	*/
	consumeMovePoints: function (unit, pointsToConsume){
		if(pointsToConsume>=0)
			unit.remainingMoveUnits = unit.remainingMoveUnits - pointsToConsume;
		else{
			// for negative consume all remaining move points
			unit.remainingMoveUnits = 0;
		}
	},

	/**
	* Method handles unit movement.
	* First it checks if the destinationHex is reachable for the unit taking into consideration unit remaining move points, unit characteristics and terrain cost.
	*
	* It also checks if there is an unit already at the destination hex. When unit at destination is a foe unit then unit is moved to the foe adjacent hex
	* (which consumes move points) and performs attach.
	* When unit at destination is a friendly unit then move is cancelled as only one unit can occupy given hex.
	*
	* 
	*/
	moveUnit: function (unit, destinationHex){
		var unitData = unit;
		var previousHexData = unitData.position;
		var hexData = destinationHex;

		// find shortest path to destination hex to check if hex is reachable
		var path = this.pathToHexForUnit(unit, destinationHex);
		if(!path){
			console.log("[moveUnit] ERROR unit: "+unit.toString()+" requested move from:"+previousHexData.toString()+" to: "+destinationHex.toString()+" but no path found.");
			var gameEvent = new GameEngineEvent({
				originator: unit,				
				eventType: "UNIT_UPDATE"
			});

			this.publishEvent(gameEvent);
			return;
		}
		var consumedMoveUnits = 0;

		// check if there is a unit occupying destination hex
		var unitAtDestination = this.getUnitAtHex(destinationHex);

		if(unitAtDestination && unitAtDestination._owner!=unit._owner){
			// move to destination unit neighbour hex and attack
			var neighbourHex = path[0];
			for (var i = 1; i< path.length-1;i++){
				var hex = path[i];
				//unitData.remainingMoveUnits = unitData.remainingMoveUnits-hex._moveUnitsCost;	
				consumedMoveUnits+=hex._moveUnitsCost;
				neighbourHex = hex;
			}
			// consume move points from move
			this.consumeMovePoints(unit,consumedMoveUnits);
			// position unit at destination neighbour
			this.positionUnit(unit, neighbourHex);
			// now the attack
			this.meleeAttack(unit, unitAtDestination);


		}else if(unitAtDestination && unitAtDestination._owner==unit._owner){
			// target hex is occupied by friendly unit, do nothing
			console.log("[moveUnit] Destination hex for unit {1} occupied by friendly unit {2}",unit, unitAtDestination);
			var gameEvent = new GameEngineEvent({
				originator: unit,				
				eventType: "UNIT_UPDATE"
			});

			this.publishEvent(gameEvent);
			return;
		}else{
			// subtract move units for move
			for (var i = 1; i< path.length;i++){
				var hex = path[i];
				unitData.remainingMoveUnits = unitData.remainingMoveUnits-hex._moveUnitsCost;	
				consumedMoveUnits+=hex._moveUnitsCost;
			}	
			// position unit at destination
			this.positionUnit(unit, destinationHex);


			var gameEvent = new GameEngineEvent({
				originator: unit,				
				eventType: "UNIT_UPDATE"
			});

			this.publishEvent(gameEvent);
			console.log("[moveUnit] moved unit: "+unit._unitId+" from ["+previousHexData._hexId+"] to ["+destinationHex._hexId+"] consuming: "+consumedMoveUnits+" movement where distance was: "+this.distancePlain(previousHexData,hexData)+".");
		}			
	},

	/**
	* Calculates shortest path from unit to the destinationHex taking into consideration:
	* - unit remaining move points
	* - unit characteristics
	* - terrain move cost along the path
	* 
	* 
	* When there is no path to destinationHex (it is somehow unreachable) then null is returned.
	* When path is found then path that contains from hexes is returned
	*/
	pathToHexForUnit: function (unit, destinationHex){

		//params: starting hex, costFunction that will be used to calculate each step, costFunctionObject, upper limit of cost that can be handled by unit maxCost, goalHex - destination hex
		var result = this._algorithmDijikstra(unit.position,unit.moveRange, unit, unit.remainingMoveUnits, destinationHex);

        var hexes = [];

        hexes.push(destinationHex);

        var previousHex = this.getHexData(result.previousMap[destinationHex._hexId]);
                	
        
        while(previousHex){
        	hexes.push(previousHex);
			previousHex = this.getHexData(result.previousMap[previousHex._hexId]);        	
        }
        hexes = hexes.reverse(); 
        var resultLength = hexes.length;

        if(hexes[0].equals(unit.position) && hexes[resultLength-1].equals(destinationHex)){
        	return hexes;
        }else{
        	return null;
        }
	},

	positionUnit: function (unit, destinationHex){
		var unitData = unit;
		var hexData = destinationHex;
		
		unitData.position = hexData;

		console.log("[positionUnit] positioned unit: "+unit._unitId+" to hex: "+destinationHex._hexId);
	},

	publishEvent: function(gameEngineEvent){
		for(var idx in this.eventHandlers){
			var handler = this.eventHandlers[idx];
			// call handler
			handler.hFunction.apply(handler.hObject,[gameEngineEvent]);			
		}
		console.log("[publishEvent] published event {1}", gameEngineEvent);
	},

	rangedAttack: function(attackUnit, defendUnit){				
		var battleOutcome = this.attack(attackUnit, defendUnit,2,4);		

		this.uiUnitRerender(attackUnit);
		this.uiUnitRerender(defendUnit);

		console.log("[rangedAttack] Attack performed with result: ",battleOutcome);
	},

	
	sightRangeForUnit: function(unit){
		
		var preliminarySightRange = this._algorithmDijikstra(unit.position,function(){return 1}, null, unit._sight);

		// now calculate if all hexes further than 1 hex are reachable
        var hexes = [];
        for( var item in preliminarySightRange.costMap){
        	var sightCost = preliminarySightRange.costMap[item];
        	var hex = this.getHexData(item);                        
        	if(sightCost==1){
        		hexes.push(hex);
        	}else if (sightCost>1){
        		var isEligibleSightRange = unit.sightRange(this.lineConnectingHexes(unit.position, hex));
        		if(isEligibleSightRange){
        			hexes.push(hex);
        		}
        	}                        
        }
        return hexes;
    },

    /**
    * Returns true when unit belongs to the owner that owns current turn.
    */
    isActiveUnit: function(unit){
    	return unit._owner == this.engineParams["turn"].activeParty;
    },

    /**
    * Handles new turn.
    * Resets units movement points
    */
    nextTurn: function(newTurn){    	
    	this.engineParams["turn"] = newTurn;
    	// restore maximum movement points for units whose turn is active
    	for( var idx in this.getUnitsMap()){
			var unit = this.getUnitsMap()[idx];			
			if(unit._owner == newTurn.activeParty){
				// units that belong to active party should have their movement restored
				unit.restoreMovePoints();			
			}
		}
    },
	
	_cubeLERP: function (cubeFrom, cubeTo, lerpParam){
		return new Cube(cubeFrom.x + (cubeTo.x - cubeFrom.x) * lerpParam,
                cubeFrom.y + (cubeTo.y - cubeFrom.y) * lerpParam,
                cubeFrom.z + (cubeTo.z - cubeFrom.z) * lerpParam);
	},

	_cubeRound: function (cube){
		
	    var rx = Math.round(cube.x);
	    var ry = Math.round(cube.y);
	    var rz = Math.round(cube.z);

	    var x_diff = Math.abs(rx - cube.x);
	    var y_diff = Math.abs(ry - cube.y);
	    var z_diff = Math.abs(rz - cube.z);

	    if (x_diff > y_diff && x_diff > z_diff){
	    	rx = -ry-rz;
	    } else if ( y_diff > z_diff) {
	        ry = -rx-rz;
	    }
	    else {
	        rz = -rx-ry;
	    }

	    return new Cube(rx, ry, rz);
	}
};

