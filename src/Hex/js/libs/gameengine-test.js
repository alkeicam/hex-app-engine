import {Hex} from './Hex.js'
import {Unit} from './Unit.js'
import {GE} from './gameengine.js'
import {GameUIDock} from './game-ui-dock.js'
import {Renderer} from './Renderer.js'
import {Company} from './Company.js'
import {HexMap} from './map.js'
import {Turn} from './Turn.js'


export function Test(){
	var testData;

	if (window === this) {
         return new Test();
    }
    this._initializeTestData();
    return this;
};

Test.prototype = {
	_initializeTestData: function(){
		this.testData = {};
		this.testData[""] = "";

		var company = new Company("red","https://dl.dropboxusercontent.com/u/13589251/Hex/user/colors-large.png");

		var hexArray = [];
		var startingHex;

        var mapAssets = {};
        mapAssets = {
            assets: [
                {
                    description: "Base catalog - desert tile with tent",
                    catalog: "base",
                    displayId: "desert-tent",
                    resource: "base.svg#layer1",
                    viewbox: "0 0 37.04 31.75"
                },
                {
                    description: "Base catalog - forrest",
                    catalog: "base",
                    displayId: "plains-forrest",
                    resource: "base.svg#layer1",
                    viewbox: "37.04 0 37.04 31.75"
                }
            ]
        }

        var unitAssets = {};
        unitAssets = {
            assets: [
                {
                    description: "Base catalog - modern tank",
                    catalog: "base",
                    displayId: "tank",
                    resource: "unit-base_ww2-tank-opt.svg#layer1"                    
                },
                {
                    description: "Base catalog - modern infantry",
                    catalog: "base",
                    displayId: "infantry",
                    resource: "unit-base_ww2-infantry-opt.svg#layer1"                    
                },
                {
                    description: "Base catalog - modern ranged",
                    catalog: "base",
                    displayId: "artillery",
                    resource: "unit-base_ww2-ranged-opt.svg#layer1"                    
                }              
            ]
        }

        var mapSpecification = {};

        mapSpecification = {rows: 2 , cols: 7,tiles: [
            {
                r: 0,
                q: 0,
                moveUnitsCost: 1,
                displayStyle: "base-desert-tent",
                terrainType: "DESERT",
                sightCost: 1,
                defenceBonus: 0
            },
            {
                r: 0,
                q: 1,
                moveUnitsCost: 2,
                displayStyle: "base-plains-forrest",
                terrainType: "FOREST",
                sightCost: 1,
                defenceBonus: 0.7
            },
            {
                r: 0,
                q: 2,
                moveUnitsCost: 2,
                displayStyle: "base-plains-forrest",
                terrainType: "FOREST",
                sightCost: 1,
                defenceBonus: 0.7
            },
            {
                r: 0,
                q: 3,
                moveUnitsCost: 2,
                displayStyle: "base-plains-forrest",
                terrainType: "FOREST",
                sightCost: 1,
                defenceBonus: 0.7
            },
            {
                r: 0,
                q: 4,
                moveUnitsCost: 2,
                displayStyle: "base-plains-forrest",
                terrainType: "FOREST",
                sightCost: 1,
                defenceBonus: 0.7
            },
            {
                r: 0,
                q: 5,
                moveUnitsCost: 2,
                displayStyle: "base-plains-forrest",
                terrainType: "FOREST",
                sightCost: 1,
                defenceBonus: 0.7
            },
            {
                r: 0,
                q: 6,
                moveUnitsCost: 2,
                displayStyle: "base-plains-forrest",
                terrainType: "FOREST",
                sightCost: 1,
                defenceBonus: 0.7
            },

            // 2nd row
            {
                r: 1,
                q: 0,
                moveUnitsCost: 1,
                displayStyle: "base-desert-tent",
                terrainType: "DESERT",
                sightCost: 1,
                defenceBonus: 0
            },
            {
                r: 1,
                q: 1,
                moveUnitsCost: 1,
                displayStyle: "base-desert-tent",
                terrainType: "DESERT",
                sightCost: 1,
                defenceBonus: 0
            },
            {
                r: 1,
                q: 2,
                moveUnitsCost: 1,
                displayStyle: "base-desert-tent",
                terrainType: "DESERT",
                sightCost: 1,
                defenceBonus: 0
            },
            {
                r: 1,
                q: 3,
                moveUnitsCost: 2,
                displayStyle: "base-plains-forrest",
                terrainType: "FOREST",
                sightCost: 1,
                defenceBonus: 0.7
            },
            {
                r: 1,
                q: 4,
                moveUnitsCost: 2,
                displayStyle: "base-plains-forrest",
                terrainType: "FOREST",
                sightCost: 1,
                defenceBonus: 0.7
            },
            {
                r: 1,
                q: 5,
                moveUnitsCost: 2,
                displayStyle: "base-plains-forrest",
                terrainType: "FOREST",
                sightCost: 1,
                defenceBonus: 0.7
            },
            {
                r: 1,
                q: 6,
                moveUnitsCost: 2,
                displayStyle: "base-plains-forrest",
                terrainType: "FOREST",
                sightCost: 1,
                defenceBonus: 0.7
            },

            // 3rd            
            {
                r: 2,
                q: 1,
                moveUnitsCost: 1,
                displayStyle: "base-desert-tent",
                terrainType: "DESERT",
                sightCost: 1,
                defenceBonus: 0
            },
            {
                r: 2,
                q: 3,
                moveUnitsCost: 2,
                displayStyle: "base-plains-forrest",
                terrainType: "FOREST",
                sightCost: 1,
                defenceBonus: 0.7
            },
            {
                r: 2,
                q: 5,
                moveUnitsCost: 2,
                displayStyle: "base-plains-forrest",
                terrainType: "FOREST",
                sightCost: 1,
                defenceBonus: 0.7
            }
        ]};

        for(var hexSpecification of mapSpecification.tiles){
            //var hexSpecification = mapSpecification[idx];
            var hex = new Hex(hexSpecification.q,hexSpecification.r,{                                            
                    moveUnitsCost: hexSpecification.moveUnitsCost,
                    displayStyle: hexSpecification.displayStyle,
                    terrainType: hexSpecification.terrainType,
                    sightCost: hexSpecification.sightCost,
                    defenceBonus: hexSpecification.defenceBonus
                });
            hexArray.push(hex);
        };

        

        

        // for(var x = -4;x<=4;x++){
        //     for(var y=-1;y<=9;y++){
        //         var hex = new Hex(y,x,{                        
        //             //moveUnitsCost: Math.floor(Math.random() * (3 - 1 + 1)) + 1,
        //             moveUnitsCost: 1,
        //             displayStyle: "map-forest",
        //             terrainType: "FOREST",
        //             sightCost: 1,
        //             defenceBonus: 0
        //         });
        //         if(x==0&&y==3){
        //         	startingHex = hex;
        //         }
        //         hexArray.push(hex);
        //     }
        // };



        

        var unitsArray = [];

        var unitsSpecification = [
            {
                unitId: "red-1",
                position: hexArray[2],
                remainingMoveUnits: 2,
                unitName: 'Infantry',
                moveUnits: 2,
                health: 10,
                sight: 3,
                bearing: 0,
                range: 2,
                rangedStrength: 0,
                strength: 22,
                experience: 0,
                owner: "red",
                displayStyle: "base-infantry",  // should match unit assets catalog, displayId
                
                fIsEligibleAttackPath: function(attackLineHex){
                    
                    
                    if(attackLineHex.length==1)
                        return true;

                    var obstacleTerrainTypes = {"MOUNTAINS":"MOUNTAINS","SEA":"SEA"};
                    for( var idx in   attackLineHex){
                        var hex = attackLineHex[idx];
                        if(hex._terrainType in obstacleTerrainTypes){
                            return false;
                        }                       
                    }

                    return true;
                },
                fIsEligibleSightPath: function(sightLineHex){
                    
                    
                    if(sightLineHex.length==1)
                        return true;

                    var obstacleTerrainTypes = {"MOUNTAINS":"MOUNTAINS","SEA":"SEA"};
                    for( var idx in   sightLineHex){
                        var hex = sightLineHex[idx];
                        if(hex._terrainType in obstacleTerrainTypes){
                            return false;
                        }                       
                    }

                    return true;
                },
                fAttack: function(unit){
                    return 2*this._strength;
                },
                fDefend: function(unit){
                    var defendHex = this.position;
                    return (this._strength)*(1+defendHex._defenceBonus);
                },
                fExperience: function (opponentStrength,damageInflicted, damageReceived){
                    var experienceGained = 0;
                    if(damageInflicted>2*damageReceived){
                        experienceGained = 1;
                    }
                    return experienceGained;
                },
                fMoveRange: function(hexFrom, hexTo){
                    return hexTo._moveUnitsCost;
                    // dodac dla naziemnych, ze jak jeset hexTo zajete przez jakas jednostke to impassable
                },
            },
            {
                unitId: "red-2",
                position: hexArray[10],
                remainingMoveUnits: 2,
                unitName: 'Artillery',
                moveUnits: 2,
                health: 10,
                sight: 3,
                bearing: 0,
                range: 2,
                rangedStrength: 32,
                strength: 16,
                experience: 0,
                owner: "red",
                displayStyle: "base-artillery",  // should match unit assets catalog, displayId
                
                fIsEligibleAttackPath: function(attackLineHex){
                    
                    
                    if(attackLineHex.length==1)
                        return true;

                    var obstacleTerrainTypes = {"MOUNTAINS":"MOUNTAINS","SEA":"SEA"};
                    for( var idx in   attackLineHex){
                        var hex = attackLineHex[idx];
                        if(hex._terrainType in obstacleTerrainTypes){
                            return false;
                        }                       
                    }

                    return true;
                },
                fIsEligibleSightPath: function(sightLineHex){
                    
                    
                    if(sightLineHex.length==1)
                        return true;

                    var obstacleTerrainTypes = {"MOUNTAINS":"MOUNTAINS","SEA":"SEA"};
                    for( var idx in   sightLineHex){
                        var hex = sightLineHex[idx];
                        if(hex._terrainType in obstacleTerrainTypes){
                            return false;
                        }                       
                    }

                    return true;
                },
                fAttack: function(unit){
                    return 2*this._strength;
                },
                fDefend: function(unit){
                    var defendHex = this.position;
                    return (this._strength)*(1+defendHex._defenceBonus);
                },
                fExperience: function (opponentStrength,damageInflicted, damageReceived){
                    var experienceGained = 0;
                    if(damageInflicted>2*damageReceived){
                        experienceGained = 1;
                    }
                    return experienceGained;
                },
                fMoveRange: function(hexFrom, hexTo){
                    return hexTo._moveUnitsCost;
                    // dodac dla naziemnych, ze jak jeset hexTo zajete przez jakas jednostke to impassable
                },
            },
            {
                unitId: "blue-1",
                unitName: 'Modern Tank',
                position: hexArray[15],
                remainingMoveUnits: 2,
                moveUnits: 2,
                health: 10,
                sight: 3,
                bearing: 1,
                range: 2,
                rangedStrength: 0,
                strength: 24,
                experience: 0,
                owner: "blue",
                displayStyle: "base-tank",
                
                fIsEligibleAttackPath: function(attackLineHex){
                    
                    
                    if(attackLineHex.length==1)
                        return true;

                    var obstacleTerrainTypes = {"MOUNTAINS":"MOUNTAINS","SEA":"SEA"};
                    for( var idx in   attackLineHex){
                        var hex = attackLineHex[idx];
                        if(hex._terrainType in obstacleTerrainTypes){
                            return false;
                        }                       
                    }

                    return true;
                },
                fIsEligibleSightPath: function(sightLineHex){
                    
                    
                    if(sightLineHex.length==1)
                        return true;

                    var obstacleTerrainTypes = {"MOUNTAINS":"MOUNTAINS","SEA":"SEA"};
                    for( var idx in   sightLineHex){
                        var hex = sightLineHex[idx];
                        if(hex._terrainType in obstacleTerrainTypes){
                            return false;
                        }                       
                    }

                    return true;
                },
                fAttack: function(unit){
                    return 2*this._strength;
                },
                fDefend: function(unit){
                    var defendHex = this.position;
                    // this unit receives defence bonus from terrain
                    return (this._strength)*(1+defendHex._defenceBonus);
                },
                fExperience: function (opponentStrength,damageInflicted, damageReceived){
                    var experienceGained = 0;
                    if(damageInflicted>2*damageReceived){
                        experienceGained = 1;
                    }
                    return experienceGained;
                },
                fMoveRange: function(hexFrom, hexTo){
                    return hexTo._moveUnitsCost;
                    // dodac dla naziemnych, ze jak jeset hexTo zajete przez jakas jednostke to impassable
                },
            },
        ];

        for(var unitSpecification of unitsSpecification){
            var unitData = new Unit(unitSpecification);
            unitsArray.push(unitData);
        };


        // for(var i=1;i<=8;i++){
        //     var unitData = new Unit({
        //         unitId: i,
        //         position: startingHex,
        //         remainingMoveUnits: 2,
        //         moveUnits: 1,
        //         health: 5,
        //         sight: 3,
        //         range: 2,
        //         rangedStrength: 0,
        //         strength: 2,
        //         experience: 0,
        //         owner: (i%2==0)?"red":"yellow",
        //         displayStyle: "unit-troop",
                
        //         fIsEligibleAttackPath: function(attackLineHex){
                	
                	
        //         	if(attackLineHex.length==1)
        //         		return true;

        //         	var obstacleTerrainTypes = {"MOUNTAINS":"MOUNTAINS","SEA":"SEA"};
        //         	for( var idx in   attackLineHex){
        //         		var hex = attackLineHex[idx];
        //         		if(hex._terrainType in obstacleTerrainTypes){
        //         			return false;
        //         		}                		
        //         	}

        //         	return true;
        //         },
        //         fIsEligibleSightPath: function(sightLineHex){
                	
                	
        //         	if(sightLineHex.length==1)
        //         		return true;

        //         	var obstacleTerrainTypes = {"MOUNTAINS":"MOUNTAINS","SEA":"SEA"};
        //         	for( var idx in   sightLineHex){
        //         		var hex = sightLineHex[idx];
        //         		if(hex._terrainType in obstacleTerrainTypes){
        //         			return false;
        //         		}                		
        //         	}

        //         	return true;
        //         },
        //         fAttack: function(unit){
        //         	return 2*this._strength;
        //         },
        //         fDefend: function(unit){
        //         	return this._strength;
        //         },
        //         fExperience: function (opponentStrength,damageInflicted, damageReceived){
        //         	var experienceGained = 0;
        //         	if(damageInflicted>2*damageReceived){
        //         		experienceGained = 1;
        //         	}
        //         	return experienceGained;
        //         },
        //         fMoveRange: function(hexFrom, hexTo){
        //         	return hexTo._moveUnitsCost;
        //         	// dodac dla naziemnych, ze jak jeset hexTo zajete przez jakas jednostke to impassable
        //         },
        //     });
        //     unitsArray.push(unitData);
        // }

        var hexMap = new HexMap({
          cols: 8,
          rows: 2,
          size: 100,
          spacing: 5,
          offsetX: 0, //58,
          offsetY: 45, //58,
          debug: true,
          mapSpecification: mapSpecification,
          unitsSpecification: unitsSpecification,
          mapAssets: mapAssets,
          unitAssets: unitAssets
        });
        document.body.appendChild(hexMap.createSVG());


        // prepare gameUI
        var gameUIParams = {            
            units: unitsArray,            
            company: company,
            unitAssets: unitAssets
        };

        var gameUI = new GameUIDock(gameUIParams);
        this.testData["gameUIDock"] = gameUI;
        
        var gameUIhandler = {
        	hObject: gameUI,
        	hFunction: gameUI.handleGameEngineEvent
        };

        

        var rendererEventHandlersMap = [];
        rendererEventHandlersMap.push(gameUIhandler)

    	var renderer = new Renderer({
    		eventHandlers: rendererEventHandlersMap, 
    		hexClass: "hexagon",	// renderer, snapping
            unitClass: "unit2",	// renderer, snapping
            snapTargetClass: "snaptarget" // renderer, snapping
    	}); 



        // prepare game engine
        var rendererHandler = {
        	hObject: renderer,
        	hFunction: renderer.handleGameEngineEvent
        };
        var eventHandlersMap = [];        
        eventHandlersMap.push(gameUIhandler);
        eventHandlersMap.push(rendererHandler);

       var startingTurn = new Turn(1,"red");
        
        var gameEngineParams = {
            hexMapTiles:  hexArray,
            units: unitsArray,
            hexClass: "hexagon",	// renderer, snapping
            unitClass: "unit2",	// renderer, snapping
            snapTargetClass: "snaptarget", // renderer, snapping
            eventHandlers: eventHandlersMap,
            company: company,
            turn: startingTurn
        };

        

        var gameEngine = new GE(gameEngineParams);
        

        this.testData["gameEngine"] = gameEngine;
        renderer.bindGameEngine(gameEngine);
        renderer.bindHexMap(hexMap);                
	},

	testHexInitialize: function(){
		var hex1 = Hex(0,0,{moveUnitCost: 2, displayStyle: "map-mountain", sightCost:1});
		var hex2 = Hex(0,0,{moveUnitCost: 2, displayStyle: "map-mountain", sightCost:1});
		var hex3 = Hex("0,0",{moveUnitCost: 2, displayStyle: "map-mountain", sightCost:1, defenceBonus: 0.1});
		console.log("[Test.testHexInitialize] Executed");
		return true;
	},
	testUnitAttack: function(){
		var unit1 = this.testData["gameEngine"].getUnitData(1);
		var unit2 = this.testData["gameEngine"].getUnitData(2);

		this.testData["gameEngine"].attack(unit1,unit2,4,4);
	},
	testUnitMeleeAttack: function(){
		var unit1 = this.testData["gameEngine"].getUnitData(1);
		var unit2 = this.testData["gameEngine"].getUnitData(2);

		var hex1 = this.testData["gameEngine"].getHexData("4,0");
		this.testData["gameEngine"].positionUnit(unit1,hex1);
		this.testData["gameEngine"].uiUnitRerender(unit1);

		var hex2 = this.testData["gameEngine"].getHexData("3,0");
		this.testData["gameEngine"].positionUnit(unit2,hex2);
		this.testData["gameEngine"].uiUnitRerender(unit2);

		this.testData["gameEngine"].meleeAttack(unit1,unit2);
		console.log("");
	},
	testUnitRangedAttack: function(){
		var unit1 = this.testData["gameEngine"].getUnitData(1);
		var unit2 = this.testData["gameEngine"].getUnitData(2);

		this.testData["gameEngine"].rangedAttack(unit1,unit2);
	},
	testUnitMoveRange: function(){
		var unit = this.testData["gameEngine"].getUnitData(1);
		var hex = this.testData["gameEngine"].getHexData("4,0");
		this.testData["gameEngine"].positionUnit(unit,hex);
		var hexArray = this.testData["gameEngine"].moveRangeForUnit(unit);
		this.testData["gameEngine"].uiHighlightHexes(hexArray);

		return hexArray.length==19;

	},
	testUnitIsMoveAllowed: function(){
		var unit = this.testData["gameEngine"].getUnitData(1);
		var hex = this.testData["gameEngine"].getHexData("4,0");
		this.testData["gameEngine"].positionUnit(unit,hex);
		
		var hexTarget1 = this.testData["gameEngine"].getHexData("0,0");
		var hexTarget2 = this.testData["gameEngine"].getHexData("3,0");

		var result = true;

		result = result && !this.testData["gameEngine"].isMoveAllowed(unit,hexTarget1);
		
		result = result && this.testData["gameEngine"].isMoveAllowed(unit,hexTarget2);

		return result;
	},
	testUnitPathToHex: function(){
		var unit = this.testData["gameEngine"].getUnitData(1);
		var hex = this.testData["gameEngine"].getHexData("4,0");
		this.testData["gameEngine"].positionUnit(unit,hex);
		
		var hexTarget1 = this.testData["gameEngine"].getHexData("0,0");
		var hexTarget2 = this.testData["gameEngine"].getHexData("2,1");

		var result = true;

		result = result && (this.testData["gameEngine"].pathToHexForUnit(unit,hexTarget1)==null);
		
		result = result && (this.testData["gameEngine"].pathToHexForUnit(unit,hexTarget2)!=null);

		this.testData["gameEngine"].uiHighlightHexes(this.testData["gameEngine"].pathToHexForUnit(unit,hexTarget2));

		return result;
	},
	testUnitAttackRange:function(){
		var unit = this.testData["gameEngine"].getUnitData(1);
		var hex = this.testData["gameEngine"].getHexData("4,0");
		this.testData["gameEngine"].positionUnit(unit,hex);
		
		var impassableHex = this.testData["gameEngine"].getHexData("3,0");
		impassableHex._terrainType = "MOUNTAINS";
		impassableHex._displayStyle = "map-mountains";		


		var impassableHex2 = this.testData["gameEngine"].getHexData("2,1");
		impassableHex2._terrainType = "MOUNTAINS";
		impassableHex2._displayStyle = "map-mountains";		

		var impassableHex3 = this.testData["gameEngine"].getHexData("4,-1");
		impassableHex3._terrainType = "MOUNTAINS";
		impassableHex3._displayStyle = "map-mountains";	

		this.testData["gameEngine"].uiHexMapRerender(impassableHex);
		this.testData["gameEngine"].uiHexMapRerender(impassableHex2);
		this.testData["gameEngine"].uiHexMapRerender(impassableHex3);
		
		var attackRangeHexes = this.testData["gameEngine"].attackRangeForUnit(unit);

		this.testData["gameEngine"].uiHighlightHexes(attackRangeHexes);
		
		return attackRangeHexes.length==13;
	},
	testUnitSightRange:function(){
		var unit = this.testData["gameEngine"].getUnitData(1);
		var hex = this.testData["gameEngine"].getHexData("4,0");
		this.testData["gameEngine"].positionUnit(unit,hex);
		
		var impassableHex = this.testData["gameEngine"].getHexData("3,0");
		impassableHex._terrainType = "MOUNTAINS";
		impassableHex._displayStyle = "map-mountains";		


		var impassableHex2 = this.testData["gameEngine"].getHexData("2,1");
		impassableHex2._terrainType = "MOUNTAINS";
		impassableHex2._displayStyle = "map-mountains";		

		var impassableHex3 = this.testData["gameEngine"].getHexData("4,-1");
		impassableHex3._terrainType = "MOUNTAINS";
		impassableHex3._displayStyle = "map-mountains";	

		this.testData["gameEngine"].uiHexMapRerender(impassableHex);
		this.testData["gameEngine"].uiHexMapRerender(impassableHex2);
		this.testData["gameEngine"].uiHexMapRerender(impassableHex3);
		
		var sightRangeHexes = this.testData["gameEngine"].sightRangeForUnit(unit);

		this.testData["gameEngine"].uiHighlightHexes(sightRangeHexes);
		
		return sightRangeHexes.length==13;
	},
};