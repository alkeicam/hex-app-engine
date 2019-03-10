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

GameUtils.initializeRivetBinders = function () {
    rivets.binders['conditionalClass-*'] = function (el, value) {
        el.style.setProperty(this.args[0], value);
    };
};

GameUtils.initializeRivetFormatters = function(){
    rivets.formatters.fromTimestamp = function(value){
            var theDate = new Date(value);

            var result = theDate.toLocaleDateString(undefined, {  
                day : 'numeric',
                month : 'short',
                year : 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
            return result;
        }

        // <a rv-href="group.Id | formatString 'group.aspx?id=@value&name=@0&owner=@1' group.Name group.Owner">My Link</a>
        rivets.formatters.hrefBuilder = function (value, text) {
            text = text.replace('@value', value);

            var args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
            args.shift(); args.shift(); //remove the "value" and "text" arguments from the array
            
            for (var i = 0; i < args.length; i++) {
                text = text.replace('@' + i, args[i]);
            }    

            return text;
        };

        rivets.formatters.variableBuilder = function (value, text) {
            text = text.replace('@value', value);

            var args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
            args.shift(); args.shift(); //remove the "value" and "text" arguments from the array
            
            for (var i = 0; i < args.length; i++) {
                text = text.replace('@' + i, args[i]);
            }    

            return text;
        };

        rivets.formatters.eq = function (value, arg) {            
            return value == arg;
        };

        rivets.formatters.neq = function (value, arg) {            
            return value != arg;
        };

        rivets.formatters.split = function (value) {  
            var result = [];
            if(!value)
                return result;
            try{
                result = value.trim().split(',');
            }catch(exception){
                result = [];
            }                  
            return result;
        };

        rivets.formatters.notEmpty = function(value){
            if(value)
                return true;
            return false;                    
        }

        rivets.formatters.empty = function(value){
            if(value)
                return false;
            return true;                    
        }

        rivets.formatters.emptyObject = function(value){      
            if(!value)
                return true;      
            return Object.keys(value).length === 0 && value.constructor === Object;                    
        }

        rivets.formatters.notEmptyObject = function(value){            
            if(!value)
                return false;
            return !(Object.keys(value).length === 0 && value.constructor === Object);                    
        }

        rivets.formatters.size = function(value){            
            if(!value)
                return 0;
            return value.length;                    
        }

        rivets.formatters.sizeGte = function(value, arg){            
            if(!value)
                return false;
            if(!value.length)
                return false;
            return value.length >= arg;                    
        }

        rivets.formatters.sizeLt = function(value, arg){            
            if(!value)
                return false;
            if(!value.length)
                return false;
            return value.length < arg;                    
        }

        rivets.formatters.sizeLte = function(value, arg){            
            if(!value)
                return false;
            if(!value.length)
                return false;
            return value.length <= arg;                    
        }

        rivets.formatters.gt = function(value, arg){            
            if(!value)
                return false;                            
            return value > arg;                    
        }

        rivets.formatters.gte = function(value, arg){            
            if(!value)
                return false;                            
            return value >= arg;                    
        }

        rivets.formatters.lt = function(value, arg){            
            if(!value)
                return false;                            
            return value < arg;                    
        }
        rivets.formatters.lte = function(value, arg){            
            if(!value)
                return false;                            
            return value <= arg;                    
        }

        rivets.formatters.betweenLo = function(value, arg1, arg2){            
            if(!value)
                return false;                            
            return value > arg1 && value <= arg2;                    
        }

        rivets.formatters.itemAt = function(value, index){            
            if(!(value && value instanceof Array))
                return null; 
            return value[index || 0];                    
        }

        rivets.formatters.addNumber = function(value, arg){            
            return value + arg;                  
        }

};

GameUtils.downloadObjectAsJSON = function(targetObject, fileName){    
        var exportObj = targetObject;
        var exportName = fileName;
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", exportName + ".json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    
}

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