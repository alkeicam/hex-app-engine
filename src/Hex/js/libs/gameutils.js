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