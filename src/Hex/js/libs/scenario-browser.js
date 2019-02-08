export function ScenarioBrowser(){

	if (window === this) {
         return new ScenarioBrowser();
    }
    this._initialize();
    return this;
};

ScenarioBrowser.prototype = {
    handlers: [],

    model: {
        scenarios: [],
        // maps: [
        //     {
        //         map: {
        //             mapName: 'Polska Large',
        //             mapId: '73f48fc2-f129-42da-a87f-64ce0e8b28e9'
        //         },
        //         visible: 'public'
        //     },
        //     {
        //         map: {
        //             mapName: 'Polska small',
        //             mapId: '73f48fc2-f129-42da-a87f-64ce0e8b2ccc'
        //         },
        //         visible: 'public'
        //     },
        //     {
        //         map: {
        //             mapName: 'Europe',
        //             mapId: 'faefdd5a-0e04-48c9-b865-3e70e8791855'
        //         },
        //         visible: 'private'
        //     }
        // ],
        maps: [],
        currentFilterVisibility: 'all', // all, public
        currentFilterName: '', // name or tags in the scenario
        currentSelected: 
                        {
                            scenario: {
                                scenarioName: 'Polska Large',
                                scenarioId: '73f48fc2-f129-42da-a87f-64ce0e8b28e9'
                            }
                        }
    },

	_initialize: function(){            
        this.initializeRivetFormatters();         
	},

    initializeRivetFormatters: function(){
        rivets.formatters.scenarioFilter = function(elements, filter, filter2){
            return elements.filter(function(element) {                

                var matchVisibility = filter.length > 0 ? element.visible === filter : true;

                if(filter === 'all')
                    matchVisibility = true;
                // filter by scenario name
                var idxName = element.scenario.name.toLowerCase().indexOf(filter2);

                // filter by tags

                var idxTags = element.scenario.tags.toLowerCase().indexOf(filter2);
                                
                var matchName = filter2.length > 0 ? idxName > -1 : true;
                var matchTags = filter2.length > 0 ? idxTags > -1 : true;
                //var matchPhrase = filter2.length > 0 ? element.mapName === filter2 : true;

                return matchVisibility && (matchName || matchTags);
            });
        }

    },

    initializeWithScenarios: function(scenario, userScenariosArray, publicScenariosArray){
        this._initialize();

        if(scenario){
            this.model.currentSelected.scenario = {
                scenarioName: scenario.name ,
                scenarioId: scenario.scenarioId
            }    
            this._publishEvent({
                kind: 'scenarioSelected',
                scenario: scenario
            });
        }else{
            this.model.currentSelected.scenario = {
                scenarioName: null ,
                scenarioId: null
            }
        }

        

        var scenariosArray = [];


        for(var i = 0; i< userScenariosArray.length; i++){
            var scenarioElement = {
                scenario: userScenariosArray[i],
                visible: 'private'
            }
            scenariosArray.push(scenarioElement);
        }

        /// dodac sortowanie

        this.model.scenarios = scenariosArray;
    },

    addHandlers: function(handlersArray){
        this.handlers = handlersArray;
    },

    setCurrentFilterVisibility: function(filter){
        this.model.currentFilterVisibility = filter;
    },

    _publishEvent: function(event){
        for(var idx in this.handlers){
            var handler = this.handlers[idx];
            // call handler
            handler.hFunction.apply(handler.hObject,[event]);         
        }        
    },

    setCurrentSelected: function(scenarioId){
        var selectedScenario = {};
        for(var i=0; i<this.model.scenarios.length; i++){
            if(this.model.scenarios[i].scenario.scenarioId == scenarioId){
                selectedScenario = this.model.scenarios[i].scenario;
                break;
            }
        }
        this.model.currentSelected.scenario = selectedScenario;
        
        this._publishEvent({
            kind: 'scenarioSelected',
            scenario: selectedScenario
        });
    }
};