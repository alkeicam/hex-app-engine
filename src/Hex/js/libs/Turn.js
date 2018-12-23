/**
* Model representing game turn.
*/
export function Turn() {				//  (no, active party)
	var no;
	var activeParty;

	if (window === this) {

         if(arguments.length==2){ 
         	return new Turn(arguments[0],arguments[1]); 
         }
         // else if(arguments.length==3){
         // 	return new Hex(arguments[0],arguments[1],arguments[2]);
         // }
         else {
         	console.log("[Hex] ERROR - constructor called with wrong number of arguments");
         	return undefined;
         }
    }
    if(arguments.length==2){
    	this._initialize(arguments[0],arguments[1]);

    }
    // else{
    // 	this._initialize(arguments[0],arguments[1],arguments[2]);	
    // }  
    return this;
};

Turn.prototype = {
	_initialize: function(turnNo, activeParty){
		this.no = turnNo;
		this.activeParty = activeParty;
		
		// if(params){
		// 	this._moveUnitsCost = (params["moveUnitsCost"]>0)?params["moveUnitsCost"]:1;
		// 	this._displayStyle = (params["displayStyle"])?params["displayStyle"]:"map-forest";
		// 	this._sightCost = (params["sightCost"]>1)?params["sightCost"]:1;
		// 	this._defenceBonus = ("defenceBonus" in params)?params["defenceBonus"]:0.0;
		// 	this._terrainType = ("terrainType" in params)?params["terrainType"]:"PLAINS";
		// }	
	},
	// _initFromHexId: function(hexId,params){
	// 	var hexXAndY = hexId.split(",");
	// 	var hexX = Number(hexXAndY[0]);
	// 	var hexY = Number(hexXAndY[1]);

	// 	this._initialize(hexX,hexY,params);
	// },
};

