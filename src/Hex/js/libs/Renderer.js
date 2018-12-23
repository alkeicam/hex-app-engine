import {HexEvent} from './HexEvent.js'
import {UnitEvent} from './UnitEvent.js'
import {GameEngineEvent} from './GameEngineEvent.js'

export function Renderer(params){
	var rendererParams;
	var eventHandlers;

	if (params) {

	      // Avoid clobbering the window scope:
	      // return a new GE object if we're in the wrong scope
	      if (window === this) {
	      	return new GE(params);
	      }

	      // We're in the correct object scope:
	      // Init 
	      this._initialize(params);
	      return this;
   } else {
   		console.log("[ERROR] Error initializing renderer. Empty params.")
      // No parameters were given, return the 'about' object
		return {
	      	Component: "Renderer",
			Version: 1.0,
			Author: "Maciej Grula",
			Created: "2015",
			Updated: "29 December 2015"
			}
   	}
};

Renderer.prototype = {

	_initialize: function(params){
		this.rendererParams = params;
		this.eventHandlers = [];

		for(var idx in params.eventHandlers){
			var handler = params.eventHandlers[idx];
			this._addEventHandler(handler.hObject,handler.hFunction);
		}
		// to na razie wykomentowane bo potrzebuje gameenginu wiec inicjalizuje D&D przy podpieciu gameenginu
		//this.uiEnableUnitDragAndDropSupport();
		console.log("Renderer initialized.",this.rendererParams);
	},

	handleGameEngineEvent: function(gameEngineEvent){
		if(gameEngineEvent instanceof HexEvent){
			console.log("Handling event",gameEngineEvent);
			this._handleHexEvent(gameEngineEvent)
		}
		if(gameEngineEvent instanceof UnitEvent){
			console.log("Handling event",gameEngineEvent);
			this._handleUnitEvent(gameEngineEvent)
		}
		if(gameEngineEvent instanceof GameEngineEvent){
			console.log("Handling event",gameEngineEvent);
			this._handleGameEngineEvent(gameEngineEvent)
		}

	},

	_handleHexEvent: function(hexEvent){
		var hexData = hexEvent.hex();
		// apply style for map tile - renderer
		$(GameUtils._safeIdSelector("#"+hexData._hexId)).addClass(hexData._displayStyle);
	},

	_handleGameEngineEvent: function(gameEngineEvent){
		if(gameEngineEvent.eventType=="BATTLE_PERFORMED"){
			var battleOutcome = gameEngineEvent.battleOutcome;
			var attackUnit = battleOutcome.attackingUnit;
			var defendUnit = battleOutcome.defendingUnit;


			this.uiUnitRerender(attackUnit);
			this.uiUnitRerender(defendUnit);

			var unit = gameEngineEvent.originator;
			this.uiSelectUnit(unit);
		}
		if(gameEngineEvent.eventType=="UNIT_UPDATE"){
			var unit = gameEngineEvent.originator;
			// automatically select unit after update so field will be highlighted
			this.uiSelectUnit(unit);			
		}
	},

	_handleUnitEvent: function(unitEvent){
		var unitData = unitEvent.unit();
		var type = unitEvent.type();

		if(type=="INITIALIZED"){
			// apply style for unit - renderer
			//$(this._safeIdSelector("#"+unitData._unitId)).addClass(unitData._currentDisplayStyle);			
			if(unitData._owner == unitEvent.company().owner()){
				this._uiAddUnitFlag(unitData,unitEvent.company());
			}
			//this.uiUnitRerender(unitData);
			this.uiAddUnitClickHandler(unitData);		
		}
		if(type=="DIE"){
			this.uiUnitDie(unitData);
		}
			
	},

	bindGameEngine: function (gameEngine){
		this.rendererParams.gameEngine = gameEngine;
		// FIXME zaleznosc pomuedzy game engine a renderer
		this.uiEnableUnitDragAndDropSupport();
	},

	bindHexMap: function (hexMap){
		this.rendererParams.hexMap = hexMap;		
	},


	_publishEvent: function(gameEngineEvent){
		for(var idx in this.eventHandlers){
			var handler = this.eventHandlers[idx];
			// call handler
			handler.hFunction.apply(handler.hObject,[gameEngineEvent]);
			console.log("[publishEvent] published event {1}", gameEngineEvent);
		}
	},

	_addEventHandler: function (functionObject, functionHandler){
		var handler = {
			hObject: functionObject,
			hFunction: functionHandler
		};
		this.eventHandlers.push(handler);
	},
	    /**
	}
	}
	}
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

	_clientXYToSVGXY: function(clientX, clientY){
		var root = document.getElementById("svgroot");
		var uupos = root.createSVGPoint();
		uupos.x = clientX;
		uupos.y = clientY;
		var ctm = root.getScreenCTM();
		if(ctm = ctm.inverse())
			uupos = uupos.matrixTransform(ctm);
		return uupos;

	},
	_elementOfClassFromPoint: function(clientX, clientY, className){
		var returnElement;
		var elements = document.elementsFromPoint(clientX, clientY);
		for(var element of elements){
			if(element.classList&&element.classList.contains(className)){
        		returnElement = element;
        		break;
        	}
		}
		return returnElement;
	},
	/**
	* Returns unit bearing after moving from current unit position towards targetElement.
	*
	* target - html element representing unit
	* targetElement - html element representing target hex
	*/
	_uiHandleBearingAfterDrag: function(target, targetElement){
		console.log("[Renderer] _uiHandleBearingAfterDrag");
		// var directions = {
		// 	"1,0": 0,
		// 	"1,-1": 1,
		// 	"-1,-1": 2,
		// 	"-1,0": 3,
		// 	"-1,1": 4,
		// 	"1,1": 5
		// };
		var directions = {
			"0,1": 0,
			"1,1": 1,
			"1,-1": 2,
			"0,-1": 3,
			"-1,-1": 4,
			"-1,1": 5,
			"1,0": 1
			
		};

		

		var tX = d3.select(target).attr('drag-start-x');;
		var tY = d3.select(target).attr('drag-start-y');;
		var sX = d3.select(targetElement).attr('x');
		var sY = d3.select(targetElement).attr('y');


		var dmX = sX-tX;
		var dmY = sY-tY;
				

		var sgnX = Math.sign(dmX);
		var sgnY = -Math.sign(dmY);
		console.log(''+sgnX+","+sgnY);
		var result = directions[''+sgnX+","+sgnY];

		return result;

	},

	uiDragStarted: function(){
		console.log('Started',this,d3.event);
		d3.select(this).attr('drag-start-x',this.x.baseVal.value);
		d3.select(this).attr('drag-start-y',this.y.baseVal.value);
	},

	uiDragged: function(){
		console.log(this,d3.event);
		d3.select(this).attr("x", d3.event.x-this.getBBox().width/2).attr("y", d3.event.y-this.getBBox().height/2);
	},

	uiDragEnd: function(){
		console.log(this,d3.event);
		var snapElement = this._elementOfClassFromPoint(d3.event.sourceEvent.clientX, d3.event.sourceEvent.clientY,"snaptarget");
		var snapX = d3.select(snapElement).attr("x");
		var snapY = d3.select(snapElement).attr("y");
		d3.select(this).attr("x", snapX).attr("y", snapY);

	},

	uiEnableUnitDragAndDropSupport: function(){
		var gameEngine = this.rendererParams.gameEngine;
		var renderer = this;
		var unitsSVG = d3.selectAll('.ui-draggable');
		console.log(unitsSVG);
		unitsSVG.call(d3.drag()
			.on("start", function(){
				console.log('Started',this,d3.event);
				d3.select(this).attr('drag-start-x',this.x.baseVal.value);
				d3.select(this).attr('drag-start-y',this.y.baseVal.value);
			}).on("drag", function(){
				console.log(this,d3.event);
				d3.select(this).attr("x", d3.event.x-this.getBBox().width/2).attr("y", d3.event.y-this.getBBox().height/2);
			}).on("end",function(){
				d3.select(this).attr('drag-start-x');
				console.log(this,d3.event);
				var snapElement = renderer._elementOfClassFromPoint(d3.event.sourceEvent.clientX, d3.event.sourceEvent.clientY,"snaptarget");
				
				var hexId = d3.select(snapElement).attr("id");				
				var hex = gameEngine.getHexData(hexId);

				var unitId = d3.select(this).attr("id");
				var unit = gameEngine.getUnitData(unitId);

				if(unit.position.equals(hex)){
					// no real move, do nothing
					return;
				}
				if(!snapElement){
					renderer.uiUnitRerender(unit);
					return;
				}

				var snapX = d3.select(snapElement).attr("x");
				var snapY = d3.select(snapElement).attr("y");
				d3.select(this).attr("x", snapX).attr("y", snapY);

				// handle unit bearing after move
				var direction = renderer._uiHandleBearingAfterDrag(this, snapElement);
				unit.bearing = direction;							

				gameEngine.moveUnit(unit,hex);
				renderer.uiUnitRerender(unit);
			}));
		
		// for (var unit of unitsSVG){
		// 	console.log(unit);
			

		// 	// unit.on('dragmove', function(e){
  // 	// 		e.preventDefault()
  // 	// 		this.move(e.detail.p.x, e.detail.p.y)
  // 	// 		// events are still bound e.g. dragend will fire anyway
		// 	// }).on('dragend', function(e){
	 //  // 			console.log('drag end');
	 //  // 			// events are still bound e.g. dragend will fire anyway
		// 	// });
		// };
		

		// Draggable.create(".ui-draggable",{
		// 	onDragEnd:function() {
		// 		//console.log("drag ended",this);
		// 		var snapElement = renderer._elementOfClassFromPoint(this.pointerEvent.clientX, this.pointerEvent.clientY,"snaptarget");
		// 		//console.log(snapElement);
		// 		if(!snapElement)
		// 			return;
		// 		var matrixBeforeSnap = this.target.transform.baseVal[0].matrix;
		// 		//console.log("Matrix old: ", matrixBeforeSnap);

		// 		var tX = this.target.x.baseVal.value;
		// 		var tY = this.target.y.baseVal.value;
		// 		var sX = snapElement.x.baseVal.value;
		// 		var sY = snapElement.y.baseVal.value;								

		// 		var matrix = renderer.uiCalculateTransformMatrix({x: tX, y: tY},{x: sX, y: sY});

		// 		var direction = renderer._uiHandleBearingAfterDrag(this.target, snapElement);
		// 		console.log(matrix,direction);
		// 		console.log('[onDragEnd] Before:',matrixBeforeSnap);
		// 		matrixBeforeSnap.e = matrix.e;
		// 		matrixBeforeSnap.f = matrix.f;
		// 		console.log('[onDragEnd] After:',matrixBeforeSnap);

		// 		var hexId = snapElement.getAttribute("id");	            
	 //            var unitId = this.target.getAttribute("id");

	 //            var unit = gameEngine.getUnitData(unitId);
	 //            var hex = gameEngine.getHexData(hexId);
	            
	 //            console.log('After drop:',this.target);
	 //            gameEngine.moveUnit(unit,hex);
	 //            renderer.uiUnitRerender(unit);

		// 	}
		// });
	},

	// uiEnableUnitDragAndDropSupportOld: function(){
	// 	var gameEngine = this.rendererParams.gameEngine;
	// 	var renderer = this;

	// 	$("."+this.rendererParams.unitClass).draggable(
	// 		{ 
	// 			snap: "."+renderer.rendererParams.hexClass+" ."+renderer.rendererParams.snapTargetClass+"", 
	// 			snapMode: "both",
	// 			revert: "invalid" 
	// 		}).bind('drag', function(event, ui){
 //    			// update coordinates manually, since top/left style props don't work on SVG
    			
 //    			var m = event.target.getScreenCTM();
 //    			var p = event.target.parentElement.createSVGPoint();
	// 			p.x = event.clientX;
	// 			p.y = event.clientY;
	// 			p = p.matrixTransform(m.inverse());

	// 			event.target.setAttribute('x', p.x);
 //    			event.target.setAttribute('y', p.y);
 //    			// event.target.setAttribute('x', ui.position.left);
 //    			// event.target.setAttribute('y', ui.position.top);
 //  			})
 //  			.bind('drop', function(event, ui){
 //    			// update coordinates manually, since top/left style props don't work on SVG
    			
 //    // 			var m = event.target.getScreenCTM();
 //    // 			var p = event.target.parentElement.createSVGPoint();
	// 			// p.x = event.clientX;
	// 			// p.y = event.clientY;
	// 			// p = p.matrixTransform(m.inverse());

	// 			// event.target.setAttribute('x', p.x);
 //    // 			event.target.setAttribute('y', p.y);
 //    			// event.target.setAttribute('x', ui.position.left);

 //    			// event.target.setAttribute('y', ui.position.top);
 //    			console.log("dropped");
 //  			});			

	// 	$("."+this.rendererParams.hexClass).droppable({
	//         //accept: '#secd_line_icon li',
	//         drop: function(event, ui) { 
	//             var hexId = $(this).attr("id");	            
	//             var unitId = $(ui.draggable).attr("id");

	//             var unit = gameEngine.getUnitData(unitId);
	//             var hex = gameEngine.getHexData(hexId);
	            
	//             var departureHex = unit.position;
	//             gameEngine.moveUnit(unit,hex);
	//             //var lineHexes = gameEngine.lineConnectingHexes(departureHex,hex);
	//             //gameEngine.uiHighlightHexes(lineHexes);
	//             //gameEngine.uiUnitRerender(unit);	           
	//             renderer.uiUnitRerender(unit);	           

	//         },
	//         accept: function(el) {
	//             /* This is a filter function, you can perform logic here 
	//                depending on the element being filtered: */
	//             return true;
	//         }
	//     });
	//     console.log("[Draggable] Draggable support initialized.");
	// },

	uiAddUnitClickHandler: function (unit){
		var unitElement = $(GameUtils._safeIdSelector("#"+unit._unitId));
		if(!unitElement.length)
			return;
		unitElement.on('click', {ctx: this, u: unit},function(event) {
		  	// var moveRange = event.data.ctx.moveRangeForUnit(event.data.u);
		  	// event.data.ctx.uiHighlightHexes(moveRange);
		  	

			var gameEvent = new GameEngineEvent({
				originator: event.data.u,				
				eventType: "UNIT_SELECTED"
			});

			event.data.ctx._publishEvent(gameEvent);

		  	event.data.ctx.uiSelectUnit(event.data.u)
			console.log("[uiAddUnitClickHandler] clicked unit ",unit);
		});
	},

	uiAddClass: function(element, className){
		element.classList.add(className);
	},

	/**
	* Takes array of Hex objects and hihglights them on map
	*/
	uiHighlightHexes: function (hexArray){
		// dehighlight all hexes
		for( var idx in this.rendererParams.gameEngine.getHexMap()){
			var hex = this.rendererParams.gameEngine.getHexMap()[idx];
			var element = $(GameUtils._safeIdSelector("#"+hex._hexId));
			if(element.hasClass("highlight")){
				element.removeClass("highlight");
			}
		}

		for( var index in hexArray){
			var hex = hexArray[index];
			var element = $(GameUtils._safeIdSelector("#"+hex._hexId));
			var element2 = element[0];
			if(element2)
				//element2.addClass("highlight");
				this.uiAddClass(element2,'highlight');
		}
		

	},
	/**
	* Hihglights unit.
	* All other units are dehighlighted.
	*/
	uiHighlightUnit: function (unit){
		//  dehighlight all units
		for( var idx in this.rendererParams.gameEngine.getUnitsMap()){
			var unit2 = this.rendererParams.gameEngine.getUnitsMap()[idx];
			var selector2 = "#"+unit2._unitId;
			d3.select(selector2).classed('unit-highlight',false);			
		}
		// and apply highlight to the unit
		var selector = "#"+unit._unitId;
		d3.select(selector).classed('unit-highlight',true);
	},

	/**
	* Only unit which belongs to the Company that owne the turn will become active.
	* when unit is selected:
	* - the unit is highlighted
	* - unit move range is highlighted
	*/
	uiSelectUnit: function(unit){
		var moveRange = this.rendererParams.gameEngine.moveRangeForUnit(unit);
		var isActive = this.rendererParams.gameEngine.isActiveUnit(unit);
		if(isActive){
			this.uiHighlightHexes(moveRange);
			this.uiHighlightUnit(unit);
			console.log("[uiSelectUnit] Selected unit: ",unit);	
		}else{
			console.log("[uiSelectUnit] Not selecting unit as the unit is not active.",unit);	
		}
		
	},

	uiUnitDie : function(unit){		
		$(GameUtils._safeIdSelector("#"+unit._unitId)).remove();
	},

	_calculateHealthIndex: function (unit){
		var healthIndicator =  Math.ceil(4*unit.health/10.0) - 1;
		return healthIndicator;
	},

	/**
	* Returns fill attribute value for given unit
	*/
	_calculateUnitFill: function(unit){
		// rerender unit state (health)
		var healthIndex = this._calculateHealthIndex(unit);

		var fillPattern = 'url(#unit-{{flag}}-{{asset}}-{{direction}}-{{health}})';
    	fillPattern = fillPattern.replace('{{asset}}',unit._displayStyle).replace('{{direction}}',unit.bearing).replace('{{health}}',healthIndex).replace('{{flag}}',unit._owner);
    	return fillPattern;
	},
	/**
	* Rerenders unit on map.
	* Takes into consideration:
	* - unit health
	* - unit bearing
	* - unit position
	*
	*/ 
	uiUnitRerender: function (unit){

		// handle display style		
		var unitElement = $(GameUtils._safeIdSelector("#"+unit._unitId))[0];
		if(!unitElement)
			return;
		
		// calculate unit icon (bearing, health)
		var fill = 	this._calculateUnitFill(unit);	
		d3.select(unitElement).attr("fill",fill);

		//handle unit position (rerender unit using its position)
		var hex = unit.position;
		if(hex){
			var xy = this.rendererParams.hexMap.calculateXYFromRQ(hex.r, hex.q);
			d3.select(unitElement).attr("x",xy.x).attr("y",xy.y);
		}
		
	},

	uiCalculateTransformMatrix(fromXY, toXY){
		var dx = toXY.x - fromXY.x;
		var dy = toXY.y - fromXY.y;
		var matrix = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
		matrix.e = dx;
		matrix.f = dy;
		return matrix;
	},

	_uiAddUnitFlag: function(unit, company){
		
		var unitElement = $("#"+GameUtils._safeIdSelector(unit._unitId));
		var flagDivHTML = "<div style=\"width: 50%; height: 50%; position: absolute; margin-top: 0px; margin-top: -50%; margin-left: 25%; background-image: url("+company.companyColorsSrc()+"); background-size: cover; z-index: 120; background-clip: content-box;\"></div>";
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