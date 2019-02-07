import {HexMap} from './map.js'


export function MapEditor(eventHandlersArray, mapId, mapSpecification, mapAssets, scenarioId, editMode, deploymentSpecification, victoryConditions){
	var eventHandlers;
    var mapAssets;
    
    var mapSpecification;

    var currentlySelectedTiles;

    var mapId;

    var scenarioId;

	if (window === this) {
         return new MapEditor(eventHandlersArray, mapId, mapSpecification, mapAssets, scenarioId, editMode, deploymentSpecification, victoryConditions);
    }
    this._initializeMapEditorData(eventHandlersArray, mapId,  mapSpecification, mapAssets, scenarioId, editMode, deploymentSpecification, victoryConditions);
    return this;
};

MapEditor.prototype = {
    model: {
        editMode: null,
        deploymentSpecificationHolder: {
            deploymentTiles: []
        },
        victoryConditionsHolder: {
            red: {
                primaryVictoryCondition: {},
                secondaryVictoryCondition: {}
            },
            blue: {
                primaryVictoryCondition: {},
                secondaryVictoryCondition: {}
            }
        }
    },

	_initializeMapEditorData: function(eventHandlersArray, mapId, mapSpecification, mapAssets, scenarioId, editMode, deploymentSpecification, victoryConditions){
        this.eventHandlers = eventHandlersArray;
        this.mapAssets = mapAssets;
        this.mapSpecification = mapSpecification;
        this.currentlySelectedTiles = [];
        this.mapId = mapId;
        this.scenarioId = scenarioId;

        this.model.editMode = editMode;
        console.log("Model",this.model);
        var hexMap = new HexMap({
          cols: mapSpecification.cols,
          rows: mapSpecification.rows,
          size: 100,
          spacing: 4,
          offsetX: 0, //58,
          offsetY: 45, //58,
          debug: false,
          mapSpecification: mapSpecification,          
          mapAssets: mapAssets
        });

        d3.select('.map-editor-hexes').append(function() {
          return hexMap.createSVG();
        });

        // setup victory conditions

        for(var i=0; victoryConditions && i < victoryConditions.length; i++){
            var victoryCondition = victoryConditions[i];
            this.model.victoryConditionsHolder[victoryCondition.party].primaryVictoryCondition = victoryCondition.primaryVictoryCondition;
            this.model.victoryConditionsHolder[victoryCondition.party].secondaryVictoryCondition = victoryCondition.secondaryVictoryCondition;
        }

        console.log("Model",this.model);
        

        // setup deployment specification
        for(var i = 0; deploymentSpecification && i<deploymentSpecification.length; i++ ){
            this.model.deploymentSpecificationHolder.deploymentTiles.push(deploymentSpecification[i]);
        }
        
        console.log("Model",this.model);

        // apply deployment colors (if applicable)
        this.applyDeploymentSpecificationColors();

        this.applyVictoryConditionsColors();
        
        this.initializeMapPresentation();

        this.initializeClickHandler();
        this.initializeToolTileSelector();
               
	},
    initializeToolTileSelector: function(){
        var dataArray = [];
        dataArray.push({description: '--Please choose an option--'});
        //newArray.push.apply(newArray, dataArray1);
        dataArray = dataArray.concat(this.mapAssets.assets.sort((a,b)=> (a.catalog+a.displayId).localeCompare(b.catalog+b.displayId) ));

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

        // handling modification in toolbar elements

        d3.select('#tile-fill-select').on("change", function(d) {            
            for(var i=0; i<that.currentlySelectedTiles.length;i++){
                var elementToUpdateId = that.currentlySelectedTiles[i].elementId;
                that.setFillForElementWithId(elementToUpdateId, this.value);    
                that.setDefaultPropertyValuesByAssetForElementWithId(elementToUpdateId, this.value)
            }                        
        });

        d3.select('#tile-deployment-select').on("change", function(d) {            
            for(var i=0; i<that.currentlySelectedTiles.length;i++){
                var elementToUpdateId = that.currentlySelectedTiles[i].elementId;                

                that.setDeploymentForTile(elementToUpdateId, this.value)
            }                        
        });

        // d3.select('#tile-terrain-type-select').on("change", function(d) {
        //     for(var i=0; i<that.currentlySelectedTiles.length;i++){
        //         var elementToUpdateId = that.currentlySelectedTiles[i].elementId;
        //         that.setElementPropertyForElementWithId(elementToUpdateId, 'terrainType', this.value);    
        //     }                        
        // });

        // d3.select('#tile-movement-cost').on("input", function() {
        //     for(var i=0; i<that.currentlySelectedTiles.length;i++){
        //         var elementToUpdateId = that.currentlySelectedTiles[i].elementId;
        //         that.setElementPropertyForElementWithId(elementToUpdateId, 'moveUnitsCost', this.value);    
        //     }
            
        // });

        // d3.select('#tile-sight-cost').on("input", function() {
        //     for(var i=0; i<that.currentlySelectedTiles.length;i++){
        //         var elementToUpdateId = that.currentlySelectedTiles[i].elementId;
        //         that.setElementPropertyForElementWithId(elementToUpdateId, 'sightCost', this.value);    
        //     }
            
        // });

        // d3.select('#tile-defence-bonus').on("input", function() {
        //     for(var i=0; i<that.currentlySelectedTiles.length;i++){
        //         var elementToUpdateId = that.currentlySelectedTiles[i].elementId;
        //         that.setElementPropertyForElementWithId(elementToUpdateId, 'defenceBonus', this.value);    
        //     }
            
        // });

        d3.select('#map-name').on("input", function() {
            that.mapSpecification.mapName = this.value;
            
        });

        var mapName = this.mapSpecification.mapName ? this.mapSpecification.mapName:'';
        d3.select('#map-name').property('value',mapName);  
    },

    setDefaultPropertyValuesByAssetForElementWithId: function(id, asset){

        var paramsMap = [
            {                
                iTerrainType: 'default',
                iFeature: 'default',                
                //oTerrainType = '',
                oMoveUnitsCost: 1,
                oSightCost: 1,
                oDefenceBonus: 0.0
            },
            {                
                iTerrainType: 'desert',
                iFeature: 'default',                
                //oTerrainType = '',
                oMoveUnitsCost: 1,
                oSightCost: 1,
                oDefenceBonus: -0.5
            },
            {                
                iTerrainType: 'city',
                iFeature: 'default',                
                //oTerrainType = '',
                oMoveUnitsCost: 1,
                oSightCost: 1,
                oDefenceBonus: 0.5
            },
            {                
                iTerrainType: 'glacier',
                iFeature: 'default',                
                //oTerrainType = '',
                oMoveUnitsCost: 2,
                oSightCost: 1,
                oDefenceBonus: 0.0
            },
            {                
                iTerrainType: 'hills',
                iFeature: 'default',                
                //oTerrainType = '',
                oMoveUnitsCost: 2,
                oSightCost: 1,
                oDefenceBonus: 0.5
            },            
            {                
                iTerrainType: 'hills',
                iFeature: 'forrest',                
                //oTerrainType = '',
                oMoveUnitsCost: 2,
                oSightCost: 2,
                oDefenceBonus: 1.0
            },
            {                
                iTerrainType: 'mountains',
                iFeature: 'default',                
                //oTerrainType = '',
                oMoveUnitsCost: 100,
                oSightCost: 100,
                oDefenceBonus: 2
            },
            {                
                iTerrainType: 'ocean',
                iFeature: 'default',                
                //oTerrainType = '',
                oMoveUnitsCost: 100,
                oSightCost: 100,
                oDefenceBonus: 0
            },
            {                
                iTerrainType: 'plains',
                iFeature: 'default',                
                //oTerrainType = '',
                oMoveUnitsCost: 1,
                oSightCost: 1,
                oDefenceBonus: 0.0
            },
            {                
                iTerrainType: 'plains',
                iFeature: 'forrest',                
                //oTerrainType = '',
                oMoveUnitsCost: 2,
                oSightCost: 2,
                oDefenceBonus: 0.5
            }


        ];

        // base-plains-blank
        // CATALOG-TERRAINTYPE-FEATURE
        var catalog = asset.split('-')[0];
        var terrainType = asset.split('-')[1];
        var feature = asset.split('-')[2];

        
        // find matching param mapping for given terrain and feature
        var matchingParam = paramsMap.find(elem => elem.iTerrainType.toUpperCase() === terrainType.toUpperCase() && elem.iFeature.toUpperCase() === feature.toUpperCase());
        
        // when none found, try to find default terrain setting
        if(!matchingParam){
            matchingParam = paramsMap.find(elem => elem.iTerrainType.toUpperCase() === terrainType.toUpperCase() && elem.iFeature.toUpperCase() === 'DEFAULT');            
        }
        // when none found, then use global defaults
        if(!matchingParam){
            matchingParam = paramsMap.find(elem => elem.iTerrainType.toUpperCase() === 'DEFAULT' && elem.iFeature.toUpperCase() === 'DEFAULT');            
        }

        // set properties
        this.setElementPropertyForElementWithId(id, 'terrainType', terrainType.toUpperCase());   
        this.setElementPropertyForElementWithId(id, 'moveUnitsCost', matchingParam.oMoveUnitsCost);
        this.setElementPropertyForElementWithId(id, 'sightCost', matchingParam.oSightCost); 
        this.setElementPropertyForElementWithId(id, 'defenceBonus', matchingParam.oDefenceBonus); 


    },

    navigateBackToScenario: function(){
        window.location.href = '/ScenarioEditor.html?scenarioId='+this.scenarioId;
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

    setDeploymentForTile: function(id, value){
        var deploymentSpecification = this.getDeploymentSpecificationForId(id);
        var idArray = id.replace('h_','').split('_');

        if(deploymentSpecification){
            deploymentSpecification.party = value
        }else{
            deploymentSpecification = {
                party: value,
                q: idArray[0],
                r: idArray[1]
            }
            this.model.deploymentSpecificationHolder.deploymentTiles.push(deploymentSpecification);
        }

        d3.select('#'+id).attr("stroke", value);
        d3.select('#'+id).attr("stroke-width", 3);
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

    getDeploymentSpecificationForId: function(id){
        var idArray = id.replace('h_','').split('_');

        for(var i=0; i<this.model.deploymentSpecificationHolder.deploymentTiles.length;i++){
            var deploymentSpecificationElement = this.model.deploymentSpecificationHolder.deploymentTiles[i];

            if(deploymentSpecificationElement.q == idArray[0] && deploymentSpecificationElement.r == idArray[1]){
                return deploymentSpecificationElement;                
            }
        }
    },


    initializeClickHandler: function(){
        var that = this;

        d3.selectAll('.hex').on("click",  function(d,i) {             
            var multiSelect = d3.event.shiftKey? true: false;

            var fill = d3.select(this).attr('fill');  
            if(fill.startsWith('url')){
                fill = fill.replace('url(#','').replace(')','');            
            }else{
                fill = '';
            }            
            
            var event = {elementId: this.id, elementFill: fill, multiSelect: multiSelect, element: this };
            that.publishEvent(event);
            that.onTileSelect(event);
        });
    },

    applyDeploymentSpecificationColors: function(){
        if(this.model.deploymentSpecificationHolder.deploymentTiles.length > 0){
            for(var i=0; i<this.model.deploymentSpecificationHolder.deploymentTiles.length; i++ ){
                var deploymentTile = this.model.deploymentSpecificationHolder.deploymentTiles[i];
                var id = "h_"+deploymentTile.q+"_"+deploymentTile.r;
                d3.select('#'+id).attr("stroke", deploymentTile.party);
                d3.select('#'+id).attr("stroke-width", 3);
                
            }
        }
    },

    markTileVictoryCondition: function(tile, party, kind){
        var colors = {
            red: {
                primary: 'maroon',
                secondary: '#C08080'
            },
            blue: {
                primary: 'navy',
                secondary: '#8080C0'  
            }
        }

        var id = "h_"+tile.q+"_"+tile.r;
        var color = colors[party][kind];
        d3.select('#'+id).attr("stroke", color);
        d3.select('#'+id).attr("stroke-width", 4);
    },

    markTileAsPrimaryVictoryCondition: function(party){
        var selectedTile = this.currentlySelectedTiles[0];

        var mapSpecificationElement = this.getMapSpecificationForId(selectedTile.elementId);

        this.model.victoryConditionsHolder[party].primaryVictoryCondition = {
            q: mapSpecificationElement.q,
            r: mapSpecificationElement.r
        }

        this.markTileVictoryCondition(this.model.victoryConditionsHolder[party].primaryVictoryCondition, party, 'primary');

        this._recolourTiles();

    },  

    markTileAsSecondaryVictoryCondition: function(party){
        var selectedTile = this.currentlySelectedTiles[0];

        var mapSpecificationElement = this.getMapSpecificationForId(selectedTile.elementId);

        this.model.victoryConditionsHolder[party].secondaryVictoryCondition = {
            q: mapSpecificationElement.q,
            r: mapSpecificationElement.r
        }

        this.markTileVictoryCondition(this.model.victoryConditionsHolder[party].secondaryVictoryCondition, party, 'secondary');
        this._recolourTiles();
    },  

    applyVictoryConditionsColors: function(){

        if(this.model.victoryConditionsHolder.red && this.model.victoryConditionsHolder.red.primaryVictoryCondition){
            var tile = this.model.victoryConditionsHolder.red.primaryVictoryCondition;
            this.markTileVictoryCondition(tile, 'red','primary');
        }

        if(this.model.victoryConditionsHolder.red && this.model.victoryConditionsHolder.red.secondaryVictoryCondition){
            var tile = this.model.victoryConditionsHolder.red.secondaryVictoryCondition;
            this.markTileVictoryCondition(tile, 'red','secondary');
        }

        if(this.model.victoryConditionsHolder.blue && this.model.victoryConditionsHolder.blue.primaryVictoryCondition){
            var tile = this.model.victoryConditionsHolder.blue.primaryVictoryCondition;
            this.markTileVictoryCondition(tile, 'blue','primary');
        }

        if(this.model.victoryConditionsHolder.blue && this.model.victoryConditionsHolder.blue.secondaryVictoryCondition){
            var tile = this.model.victoryConditionsHolder.blue.secondaryVictoryCondition;
            this.markTileVictoryCondition(tile, 'blue','secondary');
        }

        
    },

    onTileSelect: function(event){

        // initialize toolbar properties on click
        d3.select('#tile-fill-select').property('value',event.elementFill);
        var mapSpecificationElement = this.getMapSpecificationForId(event.elementId);
        var terrainType = mapSpecificationElement.terrainType ? mapSpecificationElement.terrainType: '';
        var moveCost = mapSpecificationElement.moveUnitsCost ? mapSpecificationElement.moveUnitsCost:0;
        var sightCost = mapSpecificationElement.sightCost ? mapSpecificationElement.sightCost:0;
        var defenceBonus = mapSpecificationElement.defenceBonus ? mapSpecificationElement.defenceBonus : 0;
        

        var deploymentSpecificationElement = this.getDeploymentSpecificationForId(event.elementId);

        d3.select('#tile-terrain-type-select').property('value',terrainType);

        if(deploymentSpecificationElement)
            d3.select('#tile-deployment-select').property('value',deploymentSpecificationElement.party);
        else
            d3.select('#tile-deployment-select').property('value',"");

        d3.select('#tile-movement-cost').property('value',moveCost);        
        d3.select('#tile-sight-cost').property('value',sightCost);  
        d3.select('#tile-defence-bonus').property('value',defenceBonus);  
        
        // handle selection

        this._recolourTiles(event);
        
        

        if(!event.multiSelect){
            // single tile select            
            // clean list of currently selected 
            this.currentlySelectedTiles.length = 0;
        }
        

        // add to the selected list
         this.currentlySelectedTiles.push(event);
        // highligh clicked element
        d3.select(event.element).attr("stroke", "yellow");
        d3.select(event.element).attr("stroke-width", 3);
              
    },

    _recolourTiles: function(event){
        // unhighlight all
        d3.selectAll('.hex').attr("stroke", null);

        // // unhighlight all - when deployment color is applied then color is not removed
        // d3.selectAll('.hex').each(function(d,i){
        //     if(d3.select(this).attr("stroke") == 'yellow')
        //         d3.select(this).attr("stroke", null);
        // });
        // highligh deployment (if applicable)
        
        this.applyDeploymentSpecificationColors();
        this.applyVictoryConditionsColors();

        if(event && event.multiSelect){
            // multi select
            // highlight already selected
            for(var i=0;i<this.currentlySelectedTiles.length;i++){
                var element = this.currentlySelectedTiles[i].element;
                d3.select(element).attr("stroke", "yellow");
                d3.select(element).attr("stroke-width", 3);
            }            
        }
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
        // var exportObj = this.mapSpecification;
        // var exportName = "mapSpecification.js";
        // var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
        // var downloadAnchorNode = document.createElement('a');
        // downloadAnchorNode.setAttribute("href",     dataStr);
        // downloadAnchorNode.setAttribute("download", exportName + ".json");
        // document.body.appendChild(downloadAnchorNode); // required for firefox
        // downloadAnchorNode.click();
        // downloadAnchorNode.remove();

        GameUtils.downloadObjectAsJSON(this.mapSpecification, "mapSpecification.js");
    },

    saveMap: function(){        
        var event = {
            kind: 'saveMap',
            mapSpecification: this.mapSpecification,
            mapId: this.mapId
        }
        this.publishEvent(event);   
            
    },

    saveScenarioDeployment: function(){        
        var event = {
            kind: 'saveScenarioDeployment',
            deploymentSpecification: this.model.deploymentSpecificationHolder.deploymentTiles,
            mapId: this.mapId,
            scenarioId: this.scenarioId
        }
        this.publishEvent(event);   
            
    },

    saveScenarioVictoryConditions: function(){
        var event = {
            kind: 'saveScenarioVictory',
            victoryConditions: this.model.victoryConditionsHolder,
            mapId: this.mapId,
            scenarioId: this.scenarioId
        }
        this.publishEvent(event);   
    },

    initializeMapPresentation: function(){
        var mapSizeClassArray = this.calculateMapSizeClass(this.mapSpecification.rows, this.mapSpecification.cols);
        d3.select('.map-editor-hexes').classed(mapSizeClassArray[0],true);
        d3.select('.map-editor-hexes').classed(mapSizeClassArray[1],true);

        // var zoom = d3.behavior.zoom()
        //     .scaleExtent([1, 10])
        //     .on("zoom", zoomed);
    },
    /**
    * SMALL 
    * MEDIUM > 20 cols
    * LARGE > 100 cols
    */
    calculateMapSizeClass: function(rows, cols){
        var result = [];

        var thresholds = [[15,'nano-map'],[30,'tiny-map'],[60,'small-map'],[90,'medium-map'],[120,'large-map']];

        for(var i=0; i<thresholds.length;i++){
            var threshold = thresholds[i];
            if(cols<=threshold[0]){
                result[1] = 'x-'+threshold[1];
                break;
            }
        }

        for(var i=0; i<thresholds.length;i++){
            var threshold = thresholds[i];
            if(rows<=threshold[0]){
                result[0] = 'y-'+threshold[1];
                break;
            }
        }

        return result;
    }
};