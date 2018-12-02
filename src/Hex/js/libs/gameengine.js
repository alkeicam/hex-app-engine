/*
 * ************************************************************* *
 * Name       : Main(custom)                                     *
 * Date       : March 2012                                       *
 * Owner      : CreativeMilk                                     *
 * Url        : www.creativemilk.net                             *
 * Version    : 1.0                                              *
 * Updated    : 2014-03-09 21:40:27 UTC+02:00                    *
 * Developer  : Mark                                             *
 * Dependency : see below                                        *
 * Lib        : 1.7+                                             *
 * Licence    : NOT free                                         *
 * This is part of a themeforest file                            *
 * ************************************************************* *
 */ 
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

function GameEngineEvent(params){
	var originator;	// may be unit
	var battleOutcome;	// if any
	var eventType;	// UNIT_SELECTED, BATTLE_PERFORMED, UNIT_UPDATE

	if (window === this){
		return new GameEngineEvent(params);
	}
	this._initialize(params);

	return this;
};

GameEngineEvent.prototype = {
	_initialize: function(params){
		this.originator = params.originator;
		this.battleOutcome = params.battleOutcome;
		this.eventType = params.eventType;
	},
};

function BattleOutcome(params){
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

function Hex() {				//  (q,r, params) or (hexId, params)
	var q;
	var r;

	var _hexId;					//
	var _moveUnitsCost;			// float, positive
	var _displayStyle;			// string, map class
	var _terrainType;			// string, unique terrain type
	var _sightCost;				// integer, positive
	var _defenceBonus;			// percentage, float (+/-)

	if (window === this) {

         if(arguments.length==2){ 
         	return new Hex(arguments[0],arguments[1]); 
         }else if(arguments.length==3){
         	return new Hex(arguments[0],arguments[1],arguments[2]);
         }else {
         	console.log("[Hex] ERROR - constructor called with wrong number of arguments");
         	return undefined;
         }
    }
    if(arguments.length==2){
    	this._initFromHexId(arguments[0],arguments[1]);

    }else{
    	this._initialize(arguments[0],arguments[1],arguments[2]);	
    }  
    return this;
};

Hex.prototype = {
	_initialize: function(q,r,params){
		this.q = q;
		this.r = r;
		this._hexId = q+","+r;
		if(params){
			this._moveUnitsCost = (params["moveUnitsCost"]>0)?params["moveUnitsCost"]:1;
			this._displayStyle = (params["displayStyle"])?params["displayStyle"]:"map-forest";
			this._sightCost = (params["sightCost"]>1)?params["sightCost"]:1;
			this._defenceBonus = ("defenceBonus" in params)?params["defenceBonus"]:0.0;
			this._terrainType = ("terrainType" in params)?params["terrainType"]:"PLAINS";
		}	
	},
	_initFromHexId: function(hexId,params){
		var hexXAndY = hexId.split(",");
		var hexX = Number(hexXAndY[0]);
		var hexY = Number(hexXAndY[1]);

		this._initialize(hexX,hexY,params);
	},
	/**
	* Hexes are equal if have the same id.
	*/
	equals: function(hex){
		return this._hexId == hex._hexId;
	},

	toString: function(){
		return "Hex: [q: "+this.q+", r: "+this.r+"]";
	}	
};

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




// =========
function Node (data, priority) {
	if (window === this) {
         return new Node(data, priority);
    }

    this.data = data;
    this.priority = priority;
};
Node.prototype.toString = function(){return this.priority};


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

function Unit(params){
	var _unitId;				// 
	var position; 				// Hex
	var _moveUnits;				// integer, positive
	var remainingMoveUnits;		// integer, positive
	var health;					// integer, positive	
	var _sight;					// integer, positive
	var _range;					// integer, positive, when >1 then ranged unit
	var _strength;				// integer, positive, base strength
	var _rangedStrength;		// integer, positive, base strength
	var experience;				// integer, positive
	var _displayStyle;			// base style

	var _currentDisplayStyle;	// current style used for rendering
	


	var _fIsEligibleAttackPath;			// function to check if attack along given path is eligible 
	var _fIsEligibleSightPath;			// function to check if sight along given path is eligible
	var _fAttack;				// function to calculate attack strength
	var _fDefend;				// function to calculate defence strength
	var _fMoveRange;			// function to calculate move cost between two tiles
	var _fExperience;			// function to calculate experience gain after battle

	var _owner;					// unit owner

	// About object is returned if there is no 'params' parameter
	var about = {
		Version: 1.0,
		Author: "Maciej Grula",
		Created: "2015",
		Updated: "29 December 2015",
		About: "Unit"
	};

	if (params) {
 
      // Avoid clobbering the window scope:
      // return a new GE object if we're in the wrong scope
      if (window === this) {
         return new Unit(params);
      }
 
      // We're in the correct object scope:
      // Init 
      this.initializeUnit(params);
      return this;
   } else {
      // No 'id' parameter was given, return the 'about' object
      return about;
   }
};

Unit.prototype = {
	/**
	* params: {
	*	unitId, position, moveUnits, remainingMoveUnits,  health, sight, range, strange, rangedStrength, experience
	*}
	*/
	initializeUnit: function(params){
		this._unitId = params["unitId"];
		this.position = params["position"];
		this._moveUnits = params["moveUnits"];
		this.remainingMoveUnits = params["remainingMoveUnits"];
		this.health = params["health"];
		this._sight = params["sight"];
		this._range = params["range"];
		this._strength = params["strength"];				
		this._rangedStrength = params["rangedStrength"];
		this.experience = params["experience"];
		this._displayStyle = params["displayStyle"];
		

		this._fIsEligibleAttackPath = params["fIsEligibleAttackPath"];	
		this._fIsEligibleSightPath = params["fIsEligibleSightPath"];
		this._fAttack = params["fAttack"];
		this._fDefend = params["fDefend"];
		this._fMoveRange = params["fMoveRange"];
		this._fExperience = params["fExperience"];

		this._owner = params["owner"];

		this.reapplyStyle();
	},
	/**
	*  Returns true when given attack line is valid
	*
	* Returns: boolean
	*/
	attackRange : function(attackLineHexes){
		return (this._fIsEligibleAttackPath)(attackLineHexes);
	},
	/**
	* - zwraca wartosc sily przy ataku
	* 
	* Returns: double
	*/
	attack : function(targetUnit) {
		return (this._fAttack)(targetUnit);
	},
	/**
	* - zwraca wartosc sily przy obronie
	*/
	defend : function(targetUnit) {
		return (this._fDefend)(targetUnit);
	},

	equals: function(unit){
		return this._unitId == unit._unitId;
	},
	
	gainExperience: function(opponentStrength,damageInflicted, damageReceived){
		var experienceGained = (this._fExperience)(opponentStrength,damageInflicted, damageReceived);
		this.experience += experienceGained;
	},
	getCurrentStyle: function(){
		var ratio = Math.ceil(100*this.health/10.0);
		return this._displayStyle+"-"+ratio;
	},
	/**
	* Returns true when sight line is valid (ie nothing blocks the sight)
	*
	* Returns: list of Hex
	*/
	sightRange : function(sightLineHexes){
		return (this._fIsEligibleSightPath)(sightLineHexes);
	},
	/**
	* Zwraca hexy, ktore sa w zasiegu ruchu danej jednostki
	*/
	moveRange: function(hexFrom,hexTo){
		return (this._fMoveRange)(hexFrom,hexTo);
	},

	reapplyStyle: function(){
		var ratio = Math.ceil(100*this.health/10.0);

		this._currentDisplayStyle = this._displayStyle+"-"+ratio;
		// var   = this.__currentDisplayStyle
		// if(ratio==0){
		// 	this._displayStyle = this._displayStyle0;
		// } else if(ratio<=25){
		// 	this._displayStyle = this._displayStyle25;
		// } else if(ratio<=50){
		// 	this._displayStyle = this._displayStyle50;
		// } else if(ratio<=75){
		// 	this._displayStyle = this._displayStyle75;
		// } else if(ratio<=100){
		// 	this._displayStyle = this._displayStyle100;
		// }
	},
	toString: function(){
		return "Unit: [unitId: "+this._unitId+"]";
	}
	
};



/**
* params {
	
	hexMapTiles - array of hex tiles
	units - array of units
}
*/
function GE(params){

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
      this.initializeEngine(params);
      return this;
   } else {
      // No 'id' parameter was given, return the 'about' object
      return about;
   }
};


GE.prototype = {
	addEventHandler: function (functionObject, functionHandler){
		var handler = {
			hObject: functionObject,
			hFunction: functionHandler
		};
		this.eventHandlers.push(handler);
	},
	addMapHex: function (hex){
		this.hexMap[hex._hexId] = hex;
	},
	addUnit: function (unit){
		this.unitsMap[unit._unitId] = unit;
	},

	/**
	* Transforms between coordinate systems - Cube to Hex
	*/
	cubeToHex: function(cube){
		var q = cube.x;
		var r = cube.z;

		return new Hex(q,r,null);		// warning this will erase all hex properties
	},

	
	/**
	* Caclulates costs from hexId to other hexes. It can be constrained on maxCost (only hexes that are no
	* further then maxCost will be returned) or by goalHex (when goal hex is reached the algorithm stops)
	*
	* Returns result struct containing:
	* result {
	* 	previousMap: {hexId: previousHexId} - optimal nodes to reach given node
	*	costMap: {hexId: cost} - optimal cost to reach node from starting node
	}
	*/
	algorithmDijikstra: function(hex, costFunction, costFunctionObject, maxCost, goalHex){

		var SAFETYMAXITERATIONS = 99999;

		var frontier = PriorityQueue();
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
				console.log("[algorithmDijikstra] ERROR - max iterations found. Stopping algorithm.");
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
		// attack costs one move unit
		attackUnit.remainingMoveUnits = attackUnit.remainingMoveUnits-1;

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
		
		var result = BattleOutcome({
			attackingUnit: attackUnit,
			defendingUnit: defendUnit,
			attackerDamageInflicted: (attackUnit.equals(strongerUnit))?damageToWeakerUnit:damageToStrongerUnit,
			attackerDamageReceived: (attackUnit.equals(strongerUnit))?damageToStrongerUnit:damageToWeakerUnit,
			defenderDamageInflicted: (defendUnit.equals(strongerUnit))?damageToWeakerUnit:damageToStrongerUnit,
			defenderDamageReceived: (defendUnit.equals(strongerUnit))?damageToStrongerUnit:damageToWeakerUnit			
		});

		if(strongerUnit.health==0){ 
			this.uiUnitDie(strongerUnit)
			result.casualty = strongerUnit;
		};
		if(weakerUnit.health==0){
			this.uiUnitDie(weakerUnit);
			result.casualty = weakerUnit;
		};
		return result;
	},

	attackRangeForUnit: function(unit){
		
		var preliminaryAttackRange = this.algorithmDijikstra(unit.position,function(){return 1}, null, unit._range);

		// now calculate if all hexes further than 1 hex are reachable
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
	* Returns Hex from engine
	*/
	getHexData: function (hexId){
		var hex = this.hexMap[hexId];
		return hex;
	},

	/**
	* Return neighbour hexData object
	* Returns null/undefined when no neighbour is found
	* Directions: N, NE, SE, S, SW, NW
	*
	* Returns: Hex
	*/
	getHexNeighbour: function (hex, direction) {
		
		
		var hexX = hex.q;
		var hexY = hex.r;

		var resultHexId;

		switch(direction){
			case "N":
				resultHexId = hexX+","+(hexY-1);
			break;
			case "NE":
				resultHexId = (hexX+1)+","+(hexY-1);
			break;
			case "SE":
				resultHexId = (hexX+1)+","+(hexY);
			break;
			case "S":
				resultHexId = (hexX)+","+(hexY+1);
			break;
			case "SW":
				resultHexId = (hexX-1)+","+(hexY+1);
			break;
			case "NW":
				resultHexId = (hexX-1)+","+(hexY);
			break;
			default:
				return null;

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

	initializeEngine: function (engineParams){
		this.engineParams = engineParams;
		this.hexMap = {};
		this.unitsMap = {};
		this.eventHandlers = [];

		// initialize map tiles
		

		for (var arrayIdx in engineParams.hexMapTiles){
			var hexData = engineParams.hexMapTiles[arrayIdx];
			// register hex in engine
			this.addMapHex(hexData);	

			// apply style for map tile
			$(GameUtils._safeIdSelector("#"+hexData._hexId)).addClass(hexData._displayStyle);
		}

		for (var arrayIdx in engineParams.units){
			var unitData = engineParams.units[arrayIdx];
			// register hex in engine
			this.addUnit(unitData);	

			// apply style for unit
			//$(this._safeIdSelector("#"+unitData._unitId)).addClass(unitData._currentDisplayStyle);			
			if(unitData._owner == this.engineParams.owner){
				this._uiAddUnitFlag(unitData);
			}
			this.uiUnitRerender(unitData);
			this.uiAddUnitClickHandler(unitData);
		}	

		for(var idx in engineParams.eventHandlers){
			var handler = engineParams.eventHandlers[idx];
			this.addEventHandler(handler.hObject,handler.hFunction);
		}
		
		
		this.uiEnableUnitDragAndDropSupport();	

		console.log("[initializeEngine] Initialized with params: {1}",engineParams);


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
				var hex = this.cubeToHex(cubeRound);				
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
		if(battleOutcome.casualty.equals(defendUnit))
			this.positionUnit(attackUnit,defendUnitPosition);

		attackUnit.reapplyStyle();
		defendUnit.reapplyStyle();

		this.uiUnitRerender(attackUnit);
		this.uiUnitRerender(defendUnit);

	

		var gameEvent = GameEngineEvent({
			originator: attackUnit,
			battleOutcome: battleOutcome,
			eventType: "BATTLE_PERFORMED"
		});

		this.publishEvent(gameEvent);

		console.log("[meleeAttack] Attack performed with result: ",battleOutcome);
	},
	/**
	* Returns array of Hex that are in move range for unit
	*
	* Returns: Hex array
	*/
	moveRangeForUnit: function (unit){
		var result = this.algorithmDijikstra(unit.position,unit.moveRange, unit, unit.remainingMoveUnits);

        var hexes = [];
        for( var item in result.previousMap){
            var hex = this.getHexData(item);                        
            hexes.push(hex);
        }
        return hexes;
	},

	moveUnit: function (unit, destinationHex){
		var unitData = unit;
		var previousHexData = unitData.position;
		var hexData = destinationHex;

		// find shortest path to destination hex to check if hex is reachable
		var path = this.pathToHexForUnit(unit, destinationHex);
		if(!path){
			console.log("[moveUnit] ERROR unit: "+unit.toString()+" requested move to: "+destinationHex.toString()+" but no path found.");
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
				unitData.remainingMoveUnits = unitData.remainingMoveUnits-hex._moveUnitsCost;	
				consumedMoveUnits+=hex._moveUnitsCost;
				neighbourHex = hex;
			}
			// position unit at destination neighbour
			this.positionUnit(unit, neighbourHex);
			// now the attack
			this.meleeAttack(unit, unitAtDestination);


		}else if(unitAtDestination && unitAtDestination._owner==unit._owner){
			// target hex is occupied by friendly unit, do nothing
			console.log("[moveUnit] Destination hex for unit {1} occupied by friendly unit {2}",unit, unitAtDestination);
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


			var gameEvent = GameEngineEvent({
				originator: unit,				
				eventType: "UNIT_UPDATE"
			});

			this.publishEvent(gameEvent);
			console.log("[moveUnit] moved unit: "+unit._unitId+" from ["+previousHexData._hexId+"] to ["+destinationHex._hexId+"] consuming: "+consumedMoveUnits+" movement where distance was: "+this.distancePlain(previousHexData,hexData)+".");
		}			
	},

	/**
	*
	*/
	pathToHexForUnit: function (unit, destinationHex){
		var result = this.algorithmDijikstra(unit.position,unit.moveRange, unit, unit.remainingMoveUnits, destinationHex);

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
			console.log("[publishEvent] published event {1}", gameEngineEvent);
		}
	},
	rangedAttack: function(attackUnit, defendUnit){				
		var battleOutcome = this.attack(attackUnit, defendUnit,2,4);		

		attackUnit.reapplyStyle();
		defendUnit.reapplyStyle();

		this.uiUnitRerender(attackUnit);
		this.uiUnitRerender(defendUnit);

		console.log("[meleeAttack] Attack performed with result: ",battleOutcome);
	},

	
	sightRangeForUnit: function(unit){
		
		var preliminarySightRange = this.algorithmDijikstra(unit.position,function(){return 1}, null, unit._sight);

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
    * Returns position object
    */
    uiCalculateElementPositionMiddleOfHex: function(element, hex){
    	
    	var hexMiddlePosition = this._uiGetElementMiddlePosition($(GameUtils._safeIdSelector("#"+hex._hexId)));

    	var elementPosition = {
    		//left: hexMiddlePosition.left-element.width()/2,
    		//top: hexMiddlePosition.top-element.height()/2

    		left: hexMiddlePosition.left-element[0].getBoundingClientRect().width/2,
    		top: hexMiddlePosition.top-element[0].getBoundingClientRect().height/2

    		
    	};

    	return elementPosition;
    },

	uiHexMapRerender: function (hex){
		var classList = $(GameUtils._safeIdSelector("#"+hex._hexId)).attr('class').split(/\s+/);

		var classesToRemove = "";

		$.each(classList, function(index, item) {			 
		    if (item.slice(0, "map-".length) == "map-") {
		        classesToRemove += item+" ";
		    }
		});
		$(GameUtils._safeIdSelector("#"+hex._hexId)).removeClass(classesToRemove);
		$(GameUtils._safeIdSelector("#"+hex._hexId)).addClass(hex._displayStyle);
	},

	uiEnableUnitDragAndDropSupport: function(){
		var gameEngine = this;

		$("."+this.engineParams.unitClass).draggable({ snap: "."+this.engineParams.hexClass+" ."+this.engineParams.snapTargetClass+"", snapMode: "both",revert: "invalid" });		

		$("."+this.engineParams.hexClass).droppable({
	        //accept: '#secd_line_icon li',
	        drop: function(event, ui) { 
	            var hexId = $(this).attr("id");	            
	            var unitId = $(ui.draggable).attr("id");

	            var unit = gameEngine.getUnitData(unitId);
	            var hex = gameEngine.getHexData(hexId);
	            
	            var departureHex = unit.position;
	            gameEngine.moveUnit(unit,hex);
	            //var lineHexes = gameEngine.lineConnectingHexes(departureHex,hex);
	            //gameEngine.uiHighlightHexes(lineHexes);
	            gameEngine.uiUnitRerender(unit);	           

	        },
	        accept: function(el) {
	            /* This is a filter function, you can perform logic here 
	               depending on the element being filtered: */
	            return true;
	        }
	    });
	},

	uiAddUnitClickHandler: function (unit){
		var unitElement = $(GameUtils._safeIdSelector("#"+unit._unitId));
		if(!unitElement.length)
			return;
		unitElement.on('click', {ctx: this, u: unit},function(event) {
		  	// var moveRange = event.data.ctx.moveRangeForUnit(event.data.u);
		  	// event.data.ctx.uiHighlightHexes(moveRange);
		  	

			var gameEvent = GameEngineEvent({
				originator: event.data.u,				
				eventType: "UNIT_SELECTED"
			});

			event.data.ctx.publishEvent(gameEvent);

		  	event.data.ctx.uiSelectUnit(event.data.u)
			console.log("[uiAddUnitClickHandler] clicked unit ",unit);
		});
	},
	/**
	* Takes array of Hex objects and hihglights them on map
	*/
	uiHighlightHexes: function (hexArray){
		// dehighlight all hexes
		for( var idx in this.hexMap){
			var hex = this.hexMap[idx];
			var element = $(GameUtils._safeIdSelector("#"+hex._hexId));
			if(element.hasClass("highlight")){
				element.removeClass("highlight");
			}
		}

		for( var index in hexArray){
			var hex = hexArray[index];
			$(GameUtils._safeIdSelector("#"+hex._hexId)).addClass("highlight");
		}
		

	},

	/**
	* Takes array of Hex objects and toggles hihglights for them on map
	*/
	uiToggleHighlightHexes: function (hexArray){
		for( var index in hexArray){
			var hex = hexArray[index];
			$(GameUtils._safeIdSelector("#"+hex._hexId)).toggleClass("highlight");
		}
	},

	uiSelectUnit: function(unit){
		var moveRange = this.moveRangeForUnit(unit);
		this.uiHighlightHexes(moveRange);
		console.log("[uiSelectUnit] Selected unit {1} ",unit);
	},

	uiUnitDie : function(unit){
		
		$(GameUtils._safeIdSelector("#"+unit._unitId)).remove();
	},

	uiUnitRerender: function (unit){

		// handle display style		
		var unitElement = $(GameUtils._safeIdSelector("#"+unit._unitId));
		if(!unitElement.length)
			return;
		GameUtils._uiElementClassesRemove(unitElement, "unit-");

		unitElement.addClass(unit._currentDisplayStyle);

		// handle unit position
		var hex = unit.position;
		if(hex){
			//
			var newPosition = this.uiCalculateElementPositionMiddleOfHex(unitElement, hex);
			unitElement.css(newPosition);
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
	},
	
	
	_uiAddUnitFlag: function(unit){
		
		var unitElement = $("#"+GameUtils._safeIdSelector(unit._unitId));
		var flagDivHTML = "<div style=\"width: 50%; height: 50%; position: absolute; margin-top: 0px; margin-top: -50%; margin-left: 25%; background-image: url("+this.engineParams.companyColors+"); background-size: cover; z-index: 120; background-clip: content-box;\"></div>";
		unitElement.prepend(flagDivHTML);		
	},

	_uiGetElementMiddlePosition: function(element){
		var elementMid = {
			//left: element[0].getBoundingClientRect().left/2+element[0].getBoundingClientRect().right/2, 
			//top: element[0].getBoundingClientRect().bottom/2+element[0].getBoundingClientRect().top/2
			left: element.offset().left/2+(element.offset().left+element[0].getBoundingClientRect().width)/2, 
			top: element.offset().top/2+ (element.offset().top+element[0].getBoundingClientRect().height)/2
		};
		return elementMid;
		
	}

};

