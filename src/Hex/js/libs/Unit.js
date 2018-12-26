/**
* Model - Unit module
*/
/**
* Represents an unit in the model
*
* Unit is described using following properties:
* - position which is represented by the current Hex instance on which the unit is placed
* - movement points representing how mobile is the unit
* - remaining movement points representing how many points are left to be used in the current move
* - health
* - sight representing range of sight for unit (in hex distance)
* - range attack range when unit is a ranged type of unit
* - range attack strength when unit is a ranged type of unit
* - attack strength 
* - unit experience points
* - unit base display style (css class ) for ui engine to render unit
* - unit current  display style (css class ) for ui engine to render unit (to control unit visualization when damaged )
*/
export function Unit(params){
	var _unitId;	
	var unitName;			// 
	var position; 				// Hex
	var _moveUnits;				// integer, positive
	var remainingMoveUnits;		// integer, positive
	var health;					// integer, positive	
	var bearing;				// unit bearing, integer, positive
	var _sight;					// integer, positive
	var _range;					// attack range, integer, positive, when >1 then ranged unit
	var _strength;				// melee attack strength,integer, positive, base strength
	var _rangedStrength;		// range attack strength, integer, positive, base strength
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
		this.unitName = params["unitName"];
		this._unitId = params["unitId"];
		this.position = params["position"];
		this._moveUnits = params["moveUnits"];
		this.remainingMoveUnits = params["remainingMoveUnits"];
		this.bearing = params["bearing"];
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
	* This is a template function that for each specific unit provides a method to calculate single step cost
	* of moving from hexFrom to hexTo. 
	* Implementation of this method for a given unit is called each time when unit movement is considered.
	* 
	* It is assumed that hexFrom and hexTo are NEIGHBOUR hexes
	* as the cost of moving from non neighbour hexes is calculated by game engine algorithm.
	*
	* It calls method that was provided during initialization of the unit
	*/
	moveRange: function(hexFrom,hexTo){
		return (this._fMoveRange)(hexFrom,hexTo);
	},

	/**
	* Restore unit move points to its maximum.
	*/
	restoreMovePoints: function(){
		this.remainingMoveUnits = this._moveUnits;
	},

	toString: function(){
		return "Unit: [unitId: "+this._unitId+"]";
	}
	
};