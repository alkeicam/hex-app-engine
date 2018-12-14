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
		this.uiEnableUnitDragAndDropSupport();
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

			attackUnit.reapplyStyle();
			defendUnit.reapplyStyle();

			this.uiUnitRerender(attackUnit);
			this.uiUnitRerender(defendUnit);
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
			this.uiUnitRerender(unitData);
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

	_uiHandleBearingAfterDrag: function(target, targetElement){
		var directions = {
			"1,0": 0,
			"1,-1": 1,
			"-1,-1": 2,
			"-1,0": 3,
			"-1,1": 4,
			"1,1": 5
		};

		var tX = target.x.baseVal.value;
		var tY = target.y.baseVal.value;
		var sX = targetElement.x.baseVal.value;
		var sY = targetElement.y.baseVal.value;				
		var mX = sX-tX;
		var mY = sY-tY;
		
		if(!target.getAttribute('data-snap-pmx')){
			var dmX = mX;
			var dmY = mY;
		}else{
			var dmX = mX-target.getAttribute('data-snap-pmx');
			var dmY = mY-target.getAttribute('data-snap-pmy');
		}

		target.setAttribute('data-snap-pmx', mX);
		target.setAttribute('data-snap-pmy', mY);

		var sgnX = Math.sign(dmX);
		var sgnY = -Math.sign(dmY);

		var result = directions[''+sgnX+","+sgnY];
		var fillArray = target.getAttribute("fill").split("-");
		fillArray[3] = result;
		target.setAttribute("fill",fillArray.join("-"));
		return result;
	},

	uiEnableUnitDragAndDropSupport: function(){
		var gameEngine = this.rendererParams.gameEngine;
		var renderer = this;

		Draggable.create(".ui-draggable",{
			onDragEnd:function() {
				//console.log("drag ended",this);
				var snapElement = renderer._elementOfClassFromPoint(this.pointerEvent.clientX, this.pointerEvent.clientY,"snaptarget");
				//console.log(snapElement);
				if(!snapElement)
					return;
				var matrixBeforeSnap = this.target.transform.baseVal[0].matrix;
				//console.log("Matrix old: ", matrixBeforeSnap);

				var tX = this.target.x.baseVal.value;
				var tY = this.target.y.baseVal.value;
				var sX = snapElement.x.baseVal.value;
				var sY = snapElement.y.baseVal.value;				
				var mX = sX-tX;
				var mY = sY-tY;
				var direction = renderer._uiHandleBearingAfterDrag(this.target, snapElement);
				console.log(mX,mY,direction);
				matrixBeforeSnap.e = mX;
				matrixBeforeSnap.f = mY;

				var hexId = snapElement.getAttribute("id");	            
	            var unitId = this.target.getAttribute("id");

	            var unit = gameEngine.getUnitData(unitId);
	            var hex = gameEngine.getHexData(hexId);
	            
	            
	            gameEngine.moveUnit(unit,hex);

			}
		});
	},

	uiEnableUnitDragAndDropSupportOld: function(){
		var gameEngine = this.rendererParams.gameEngine;
		var renderer = this;

		$("."+this.rendererParams.unitClass).draggable(
			{ 
				snap: "."+renderer.rendererParams.hexClass+" ."+renderer.rendererParams.snapTargetClass+"", 
				snapMode: "both",
				revert: "invalid" 
			}).bind('drag', function(event, ui){
    			// update coordinates manually, since top/left style props don't work on SVG
    			
    			var m = event.target.getScreenCTM();
    			var p = event.target.parentElement.createSVGPoint();
				p.x = event.clientX;
				p.y = event.clientY;
				p = p.matrixTransform(m.inverse());

				event.target.setAttribute('x', p.x);
    			event.target.setAttribute('y', p.y);
    			// event.target.setAttribute('x', ui.position.left);
    			// event.target.setAttribute('y', ui.position.top);
  			})
  			.bind('drop', function(event, ui){
    			// update coordinates manually, since top/left style props don't work on SVG
    			
    // 			var m = event.target.getScreenCTM();
    // 			var p = event.target.parentElement.createSVGPoint();
				// p.x = event.clientX;
				// p.y = event.clientY;
				// p = p.matrixTransform(m.inverse());

				// event.target.setAttribute('x', p.x);
    // 			event.target.setAttribute('y', p.y);
    			// event.target.setAttribute('x', ui.position.left);

    			// event.target.setAttribute('y', ui.position.top);
    			console.log("dropped");
  			});			

		$("."+this.rendererParams.hexClass).droppable({
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
	            //gameEngine.uiUnitRerender(unit);	           
	            renderer.uiUnitRerender(unit);	           

	        },
	        accept: function(el) {
	            /* This is a filter function, you can perform logic here 
	               depending on the element being filtered: */
	            return true;
	        }
	    });
	    console.log("[Draggable] Draggable support initialized.");
	},

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
		var moveRange = this.rendererParams.gameEngine.moveRangeForUnit(unit);
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