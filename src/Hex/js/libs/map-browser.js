export function MapBrowser(){

	if (window === this) {
         return new MapBrowser();
    }
    this._initialize();
    return this;
};

MapBrowser.prototype = {
    model: {
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
        currentFilterName: '', // all, public
        currentSelected: 
                        {
                            map: {
                                mapName: 'Polska Large',
                                mapId: '73f48fc2-f129-42da-a87f-64ce0e8b28e9'
                            }
                        }
    },

	_initialize: function(){            
        this.initializeRivetFormatters();         
	},

    initializeRivetFormatters: function(){
        rivets.formatters.mapFilter = function(elements, filter, filter2){
            return elements.filter(function(element) {                

                var matchVisibility = filter.length > 0 ? element.visible === filter : true;

                if(filter === 'all')
                    matchVisibility = true;

                var idx = element.map.mapName.toLowerCase().indexOf(filter2);
                                
                var matchPhrase = filter2.length > 0 ? idx > -1 : true;
                //var matchPhrase = filter2.length > 0 ? element.mapName === filter2 : true;

                return matchVisibility && matchPhrase;
            });
        }

    },

    initializeWithMaps: function(map, userMapsArray, publicMapsArray){
        this._initialize();

        if(map){
            this.model.currentSelected.map = {
                mapName: map.mapName ,
                mapId: map.mapId
            }    
        }else{
            this.model.currentSelected.map = {
                mapName: null ,
                mapId: null
            }
        }

        

        var mapsArray = [];


        for(var i = 0; i< userMapsArray.length; i++){
            var mapElement = {
                map: userMapsArray[i],
                visible: 'private'
            }
            mapsArray.push(mapElement);
        }

        this.model.maps = mapsArray;
    },
    setCurrentFilterVisibility: function(filter){
        this.model.currentFilterVisibility = filter;
    },
    setCurrentSelected: function(mapId){
        var selectedMap = {};
        for(var i=0; i<this.model.maps.length; i++){
            if(this.model.maps[i].map.mapId == mapId){
                selectedMap = this.model.maps[i].map
                break;
            }
        }
        this.model.currentSelected.map = selectedMap;
    }
};