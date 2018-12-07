/**
* Model representing single hex in game Map.
* Each hex has its position in the Map model (q - column,r - row)
* Each hex is described using following attributes:
* - base cost of movement for eventuall unit to pass (for instance to pass mountain it will require more move points then to move through plains)
* - base sight cost representing if how the unit can see through the terrain (for fog of war support)
* - base defence bonus - for instance in the mountain melee units can better defend
* - display class representing hint for game ui on how to render given hex
*/
export function Hex() {				//  (q,r, params) or (hexId, params)
	var q;
	var r;

	var _hexId;					// "q,r" - pair of hex position separated by "," comma
	var _moveUnitsCost;			// default cost of moving via this hex, float, positive, default 1
	var _displayStyle;			// string, map class, default map-forest
	var _terrainType;			// string, unique terrain type, default PLAINS
	var _sightCost;				// cost of seeing via this tile, float, positive, default 1
	var _defenceBonus;			// percentage, float (+/-), default 0

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

