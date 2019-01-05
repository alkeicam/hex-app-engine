function GameUtils(){};
GameUtils._safeIdSelector = function (elementId){
	if($.type(elementId) === "string"){
		var safeId = elementId.replace( /(:|\.|\[|\]|,)/g, "\\$1" );
		return safeId;
	}

	return elementId;
};

GameUtils._uiElementClassesRemove = function (element, classPrefix){
	var classList = $(element).attr('class').split(/\s+/);

	var classesToRemove = "";

	$.each(classList, function(index, item) {			 
	    if (item.slice(0, classPrefix.length) == classPrefix) {
	        classesToRemove += item+" ";
	    }
	});
	$(element).removeClass(classesToRemove);
};

GameUtils.save = function(id, targetObject){
    window.localStorage.setItem(id, JSON.stringify(targetObject));
};

GameUtils.load = function(id){	
    return JSON.parse(window.localStorage.getItem(id));
};

GameUtils.generateEmptyTilesMapSpecification = function(rows, cols){
	console.log("Going to generate blank tile specification: rows, cols", rows , cols)

    var i,j;

    var tiles = [];


    for ( i = 0; i < cols; i++ ){
      odd = i % 2;
      //x = i * (size * this.opts.hexRatio) + this.opts.offsetX;
      jLimit = rows + (odd ? 1 : 0)
		console.log("JLimit: ",jLimit);
      for ( j = 0; j < jLimit; j++ ){

        var tile = {
            r: j,
            q: i,
            moveUnitsCost: 1,
            displayStyle: null,
            terrainType: null,
            sightCost: 1,
            defenceBonus: 0
        };
        var hexId = 'h_'+i+"_"+j;
        tiles.push(tile);
        console.log("Created tile: ", tile, hexId);
       // y = j * size + (odd ? -size / 2 : 0 ) + this.opts.offsetY;
        //if(x<0) continue;
        //count++;

        //debugString = ''+x+" "+y+" "+i+" "+j+" "+count+" "+size+" "+jLimit;
        //var debugX = x+this.opts.offsetX/2;
        //var debugY = y+this.opts.offsetY/2;
        //
        //fill = '';

        
        //grid += hex.replace('{{x}}',x).replace('{{y}}',y).replace('{{fill}}',fill).replace('{{debug}}',debugString).replace('{{id}}',hexId).replace('{{debugId}}',hexId).replace('{{debugX}}',debugX).replace('{{debugY}}',debugY);        
      }
    }

    return tiles;
};