// import {Hex} from './Hex.js'
// import {Unit} from './Unit.js'
// import {GE} from './gameengine.js'
// import {GameUIDock} from './game-ui-dock.js'
// import {Renderer} from './Renderer.js'
// import {Company} from './Company.js'
 import {HexMap} from './map.js'
// import {Turn} from './Turn.js'


export function MapEditor(eventHandlersArray, mapSpecification, mapAssets){
	var eventHandlers;
    var mapAssets;
    var selectedTile;
    var mapSpecification;

	if (window === this) {
         return new MapEditor(eventHandlersArray, mapSpecification, mapAssets);
    }
    this._initializeMapEditorData(eventHandlersArray, mapSpecification, mapAssets);
    return this;
};

MapEditor.prototype = {
	_initializeMapEditorData: function(eventHandlersArray, mapSpecification, mapAssets){
        this.eventHandlers = eventHandlersArray;
        this.mapAssets = mapAssets;
        this.mapSpecification = mapSpecification;

        // var mapAssets = {};
        // mapAssets = {
        //     assets: [
        //         {
        //             description: "Base catalog - desert tile with tent",
        //             catalog: "base",
        //             displayId: "desert-tent",
        //             resource: "base.svg#layer1",
        //             viewbox: "0 0 37.04 31.75"
        //         },
        //         {
        //             description: "Base catalog - forrest",
        //             catalog: "base",
        //             displayId: "plains-forrest",
        //             resource: "base.svg#layer1",
        //             viewbox: "37.04 0 37.04 31.75"
        //         }
        //     ]
        // }



        // var mapSpecification = {};

        // mapSpecification = {rows: 2 , cols: 7,tiles: [
        //     {
        //         r: 0,
        //         q: 0,
        //         moveUnitsCost: 1,
        //         displayStyle: "base-desert-tent",
        //         terrainType: "DESERT",
        //         sightCost: 1,
        //         defenceBonus: 0
        //     },
        //     {
        //         r: 0,
        //         q: 1,
        //         moveUnitsCost: 2,
        //         displayStyle: "base-plains-forrest",
        //         terrainType: "FOREST",
        //         sightCost: 1,
        //         defenceBonus: 0.7
        //     },
        //     {
        //         r: 0,
        //         q: 2,
        //         moveUnitsCost: 2,
        //         displayStyle: "base-plains-forrest",
        //         terrainType: "FOREST",
        //         sightCost: 1,
        //         defenceBonus: 0.7
        //     },
        //     {
        //         r: 0,
        //         q: 3,
        //         moveUnitsCost: 2,
        //         displayStyle: "base-plains-forrest",
        //         terrainType: "FOREST",
        //         sightCost: 1,
        //         defenceBonus: 0.7
        //     },
        //     {
        //         r: 0,
        //         q: 4,
        //         moveUnitsCost: 2,
        //         displayStyle: "base-plains-forrest",
        //         terrainType: "FOREST",
        //         sightCost: 1,
        //         defenceBonus: 0.7
        //     },
        //     {
        //         r: 0,
        //         q: 5,
        //         moveUnitsCost: 2,
        //         displayStyle: "base-plains-forrest",
        //         terrainType: "FOREST",
        //         sightCost: 1,
        //         defenceBonus: 0.7
        //     },
        //     {
        //         r: 0,
        //         q: 6,
        //         moveUnitsCost: 2,
        //         displayStyle: "base-plains-forrest",
        //         terrainType: "FOREST",
        //         sightCost: 1,
        //         defenceBonus: 0.7
        //     },

        //     // 2nd row
        //     {
        //         r: 1,
        //         q: 0,
        //         moveUnitsCost: 1,
        //         displayStyle: "base-desert-tent",
        //         terrainType: "DESERT",
        //         sightCost: 1,
        //         defenceBonus: 0
        //     },
        //     {
        //         r: 1,
        //         q: 1,
        //         moveUnitsCost: 1,
        //         displayStyle: "base-desert-tent",
        //         terrainType: "DESERT",
        //         sightCost: 1,
        //         defenceBonus: 0
        //     },
        //     {
        //         r: 1,
        //         q: 2,
        //         moveUnitsCost: 1,
        //         displayStyle: "base-desert-tent",
        //         terrainType: "DESERT",
        //         sightCost: 1,
        //         defenceBonus: 0
        //     },
        //     {
        //         r: 1,
        //         q: 3,
        //         moveUnitsCost: 2,
        //         displayStyle: "base-plains-forrest",
        //         terrainType: "FOREST",
        //         sightCost: 1,
        //         defenceBonus: 0.7
        //     },
        //     {
        //         r: 1,
        //         q: 4,
        //         moveUnitsCost: 2,
        //         displayStyle: "base-plains-forrest",
        //         terrainType: "FOREST",
        //         sightCost: 1,
        //         defenceBonus: 0.7
        //     },
        //     {
        //         r: 1,
        //         q: 5,
        //         moveUnitsCost: 2,
        //         displayStyle: "base-plains-forrest",
        //         terrainType: "FOREST",
        //         sightCost: 1,
        //         defenceBonus: 0.7
        //     },
        //     {
        //         r: 1,
        //         q: 6,
        //         moveUnitsCost: 2,
        //         displayStyle: "base-plains-forrest",
        //         terrainType: "FOREST",
        //         sightCost: 1,
        //         defenceBonus: 0.7
        //     },

        //     // 3rd            
        //     {
        //         r: 2,
        //         q: 1,
        //         moveUnitsCost: 1,
        //         displayStyle: "base-desert-tent",
        //         terrainType: "DESERT",
        //         sightCost: 1,
        //         defenceBonus: 0
        //     },
        //     {
        //         r: 2,
        //         q: 3,
        //         moveUnitsCost: 2,
        //         displayStyle: "base-plains-forrest",
        //         terrainType: "FOREST",
        //         sightCost: 1,
        //         defenceBonus: 0.7
        //     },
        //     {
        //         r: 2,
        //         q: 5,
        //         moveUnitsCost: 2,
        //         displayStyle: "base-plains-forrest",
        //         terrainType: "FOREST",
        //         sightCost: 1,
        //         defenceBonus: 0.7
        //     }
        // ]};

        


        var hexMap = new HexMap({
          cols: mapSpecification.cols,
          rows: mapSpecification.rows,
          size: 100,
          spacing: 4,
          offsetX: 0, //58,
          offsetY: 45, //58,
          debug: true,
          mapSpecification: mapSpecification,          
          mapAssets: mapAssets
        });

        //d3.select('.map-editor-hexes').append(hexMap.createSVG())

        d3.select('.map-editor-hexes').append(function() {
          return hexMap.createSVG();
        });
        

        this.initializeClickHandler();
        this.initializeToolTileSelector();
               
	},
    initializeToolTileSelector: function(){
        var dataArray = [];
        dataArray.push({description: '--Please choose an option--'});
        //newArray.push.apply(newArray, dataArray1);
        dataArray = dataArray.concat(this.mapAssets.assets);

        var that = this;

        d3.select('#tile-fill-select').selectAll('option').data(dataArray).enter().append("option").text(function(d) { console.log(d.description); return d.description; })
        .attr("value", function (d, i) {
            if(d.catalog && d.displayId){
                console.log(''+d.catalog+'-'+d.displayId);
                return ''+d.catalog+'-'+d.displayId;
            }else{
                return '';
            }
        });

        d3.select('#tile-fill-select').on("change", function(d) {
            console.log(this.value);
            var elementToUpdateId = that.selectedTile.elementId;
            that.setFillForElementWithId(elementToUpdateId, this.value);
            
        });

        d3.select('#tile-terrain-type-select').on("change", function(d) {
            console.log(this.value);
            var elementToUpdateId = that.selectedTile.elementId;
            that.setElementPropertyForElementWithId(elementToUpdateId, 'terrainType', this.value);
            
        });

        d3.select('#tile-movement-cost').on("input", function() {
            var elementToUpdateId = that.selectedTile.elementId;
            that.setElementPropertyForElementWithId(elementToUpdateId, 'moveUnitsCost', this.value);
        });

        d3.select('#tile-sight-cost').on("input", function() {
            var elementToUpdateId = that.selectedTile.elementId;
            that.setElementPropertyForElementWithId(elementToUpdateId, 'sightCost', this.value);
        });

        d3.select('#tile-defence-bonus').on("input", function() {
            var elementToUpdateId = that.selectedTile.elementId;
            that.setElementPropertyForElementWithId(elementToUpdateId, 'defenceBonus', this.value);
        });

        d3.select('#map-name').on("input", function() {
            that.mapSpecification.mapName = this.value;
            
        });

        var mapName = this.mapSpecification.mapName ? this.mapSpecification.mapName:'';
        d3.select('#map-name').property('value',mapName);  
    },

    setElementPropertyForElementWithId: function(id, propertyName, value){
        var mapSpecificationElement = this.getMapSpecificationForId(id);
        if(mapSpecificationElement){
            mapSpecificationElement[propertyName] = value;               
        }
    },



    setFillForElementWithId: function(id, value){
        var mapSpecificationElement = this.getMapSpecificationForId(id);
        if(mapSpecificationElement){
            mapSpecificationElement.displayStyle = value;  
             d3.select('#'+id).attr('fill','url(#'+value+")");              
        }
    },

    getMapSpecificationForId: function(id){
        var idArray = id.replace('h_','').split('_');
        for(var i=0; i<this.mapSpecification.tiles.length;i++){
            var mapSpecificationElement = this.mapSpecification.tiles[i];

            if(mapSpecificationElement.q == idArray[0] && mapSpecificationElement.r == idArray[1]){
                return mapSpecificationElement;                
            }
        }
    },


    initializeClickHandler: function(){
        var that = this;

        d3.selectAll('.hex').on("click",  function(d,i) {             
            
            var fill = d3.select(this).attr('fill');  
            if(fill.startsWith('url')){
                fill = fill.replace('url(#','').replace(')','');            
            }else{
                fill = '';
            }
            
            var event = {elementId: this.id, elementFill: fill};
            that.publishEvent(event);
            that.onTileSelect(event);
            that.selectedTile = event;


            d3.selectAll('.hex').attr("stroke", null);
            d3.select(this).attr("stroke", "yellow");
            d3.select(this).attr("stroke-width", 3);

        });
    },

    onTileSelect: function(event){
        d3.select('#tile-fill-select').property('value',event.elementFill);
        var mapSpecificationElement = this.getMapSpecificationForId(event.elementId);
        var terrainType = mapSpecificationElement.terrainType ? mapSpecificationElement.terrainType: '';
        var moveCost = mapSpecificationElement.moveUnitsCost ? mapSpecificationElement.moveUnitsCost:0;
        var sightCost = mapSpecificationElement.sightCost ? mapSpecificationElement.sightCost:0;
        var defenceBonus = mapSpecificationElement.defenceBonus ? mapSpecificationElement.defenceBonus : 0;
        
        d3.select('#tile-terrain-type-select').property('value',terrainType);

        d3.select('#tile-movement-cost').property('value',moveCost);        
        d3.select('#tile-sight-cost').property('value',sightCost);  
        d3.select('#tile-defence-bonus').property('value',defenceBonus);  
        


              
    },

    publishEvent: function(hexEvent){
        for(var idx in this.eventHandlers){
            var handler = this.eventHandlers[idx];
            // call handler
            handler.hFunction.apply(handler.hObject,[hexEvent]);         
        }
        console.log("[publishEvent] published event {1}", hexEvent);
    },

    downloadMap: function(){
        var exportObj = this.mapSpecification;
        var exportName = "mapSpecification.js";
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", exportName + ".json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
};