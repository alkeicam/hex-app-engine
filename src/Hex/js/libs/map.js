export function buildHexGrid(opts) {
  if (!(this instanceof buildHexGrid)) { return new buildHexGrid(opts); }

  for (var key in opts) {
    if ( opts.hasOwnProperty(key) ) { this.opts[key] = opts[key]; }
  }
  
  this.instance = Math.round(Math.random() * 2000);

  return this.createSVG();
}

buildHexGrid.prototype = {
  opts: {
    cols: 6,
    rows: 6,
    spacing: 0,
    size: 300,
    offsetX: 0,
    offsetY: 0,
    debug: false
  },

  createPolygon: function(size,sides) {

    sides = sides || 6;
    size = size || 150;
    
    size = size * 0.59;

    var i = sides,
    points = [];

    while (i--) {
      points.push(
        Math.round(size + size * Math.sin(i * (Math.PI * 2) / sides))
        +','+
        Math.round(size + size * Math.cos(i * (Math.PI * 2) / sides))
        );
    }

    return '<polygon class="hexagon ui-droppable snaptarget" id="hex'+this.instance+'" points="'+points.join(' ')+'"></polygon>';

  },
  // should be called after hex polygon is in defs and unit pattern is in defs
  createUnit: function(unitId, asset, r, q, direction, health){
    var unitPattern = 'unit-{{asset}}-{{direction}}-{{health}}';
    unitPattern = unitPattern.replace('{{asset}}',asset).replace('{{direction}}',direction).replace('{{health}}',health);

    var unit = '<use id="{{unitId}}" x="{{x}}" y="{{y}}" fill="url(#{{unitPattern}})" '+(this.opts.debug==true?'stroke="blue"':'')+' '+(this.opts.debug==true?'data-debug="{{debug}}"':'')+' class="unit2 ui-draggable" xlink:href="#hex'+this.instance+'" />';
    unit = unit.replace('{{unitId}}',unitId).replace('{{x}}',r).replace('{{y}}',q).replace('{{unitPattern}}',unitPattern);

    return unit;
  },

  createUnitPattern: function(asset, layer){    
    var p = '', 
    width = 127,
    height = 222.25001,
    i, j, iOffset, jOffset, x, y, viewBox, id;

    iOffset = width/4;
    jOffset = height/6;

    for(i=0;i<4;i++){
      for(j=0;j<6;j++){
        x = i*iOffset;
        y = j*jOffset;

        viewBox = ''+x+' '+y+' '+width/4+' '+height/6;
        id = 'unit-'+asset+'-'+j+'-'+(3-i);

        p +=  '<pattern id="{{id}}" viewBox="{{viewbox}}" width="100%" height="100%">'    
        p += '<use href="/assets/svg/unit-{{asset}}.svg#{{layer}}"></use>'    
        p += '</pattern>'

        p = p.replace('{{viewbox}}',viewBox).replace('{{asset}}',asset).replace('{{layer}}',layer).replace('{{id}}',id)
      }
    }

    return p;
    
  },

  createPattern: function(){

                
    var p = '<pattern id="star" viewBox="0 0 31.75 37.041668" width="100%" height="100%">'
    //var p = '<pattern id="star" >'
    p += '<use href="/assets/svg/r3svg.svg#layer1"></use>'
    //p += '<circle cx="10" cy="10" r="10" stroke="#393" fill="#393" />'
    p += '</pattern>'

    p += '<pattern id="star2" viewBox="31.75 0 31.75 37.041668" width="100%" height="100%">'
    p += '<use href="/assets/svg/r3svg.svg#layer1"></use>'
    p += '</pattern>'



    p += this.createUnitPattern('cat12-tank','layer1');

    return p;
  },

  calculateXYFromRQ: function(r,q){
    var x,y, size, odd;

    size = this.opts.size + this.opts.spacing
    odd = q % 2;

    y = q * (size * 0.87) + this.opts.offsetY;
    x = r * size + (odd ? 0 : size / 2 ) + this.opts.offsetX;

    return {x: x, y: y};
  },
  
  createGrid: function(){
    //var hex = '<use x="{{x}}" y="{{y}}" fill="{{fill}}" class="hex" xlink:href="#hex'+this.instance+'" />',
    
    var hex = '<use id="{{id}}" x="{{x}}" y="{{y}}" fill="url(#star)" '+(this.opts.debug==true?'stroke="blue"':'')+' '+(this.opts.debug==true?'data-debug="{{debug}}"':'')+' class="hex snaptarget" xlink:href="#hex'+this.instance+'" />',
    hex2 = '<use id="{{id}}" x="{{x}}" y="{{y}}" fill="url(#star2)" '+(this.opts.debug==true?'stroke="blue"':'')+' '+(this.opts.debug==true?'data-debug="{{debug}}"':'')+'  class="hex snaptarget" xlink:href="#hex'+this.instance+'" />',    
    //var hex = '<use x="{{x}}" y="{{y}}" fill="{{fill}}" class="hex" xlink:href="/assets/svg/r1svg.svg#layer1"/>',        
    odd = false,
    size = this.opts.size + this.opts.spacing,
    grid = '',
    total = this.opts.rows * this.opts.cols,
    count = 0,
    x, y, i, j, fill, debugString, jLimit, hexId;

    for ( i = 0; i < this.opts.rows; i++ ){
      odd = i % 2;
      y = i * (size * 0.87) + this.opts.offsetY;
      jLimit = this.opts.cols - (odd ? 0 : 1);
      for ( j = 0; j < jLimit; j++ ){
        x = j * size + (odd ? 0 : size / 2 ) + this.opts.offsetX;
        //if(x<0) continue;
        count++;

        debugString = ''+x+" "+y+" "+i+" "+j+" "+count+" "+size+" "+jLimit;
        hexId = ''+j+","+i;
        fill = 'hsla('+Math.round((count / total) * 50)+', 80%, ' + Math.round((Math.random()*15) + 40) +'%, 1)';
        if(odd)
          grid += hex.replace('{{x}}',x).replace('{{y}}',y).replace('{{fill}}',fill).replace('{{debug}}',debugString).replace('{{id}}',hexId);
        else
          grid += hex2.replace('{{x}}',x).replace('{{y}}',y).replace('{{fill}}',fill).replace('{{debug}}',debugString).replace('{{id}}',hexId);
      }
    }
    //(unitId, asset, r, q, direction, health)
    var xy = this.calculateXYFromRQ(0,0);
    grid += this.createUnit('unit-1','cat12-tank',xy.x,xy.y,0,3);

    xy = this.calculateXYFromRQ(4,2);
    grid += this.createUnit('unit-2','cat12-tank',xy.x,xy.y,3,1);

    return grid;
  },

  createSVG: function(){
    var div = document.createElement('div'),
    size = this.opts.size + this.opts.spacing;

    div.innerHTML = '<svg id="svgroot" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 '
    + (size * this.opts.cols) + ' '
    + (size * this.opts.rows * 0.95) +'">'
    
    + '<defs>'
    + this.createPattern()
    + this.createPolygon(this.opts.size)
    + '</defs>'
    + this.createGrid()
    + '</svg>';

    return div.children[0];
  }
};


// document.body.appendChild(buildHexGrid({
//   cols: 6,
//   rows: 50,
//   size: 100,
//   spacing: 20,
//   offsetX: -5, //58,
// }));

////////////////////////////////////////


(function(){
  "use strict";

  var W = window,
  D = document,
  winHeight = W.innerHeight,
  winScroll = W.scrollY,
  rAF = W.requestAnimationFrame || W.mozRequestAnimationFrame || W.webkitRequestAnimationFrame || W.msRequestAnimationFrame || W.oRequestAnimationFrame || function(callback) { W.setTimeout(callback, 20); };
  
  function onResize(){
    winHeight = W.innerHeight;
  }
  W.addEventListener('resize', onResize);
  
/*  function onScroll(){
    winScroll = D.scrollTop || D.body.scrollTop;
    console.log(winScroll);
  }
  D.addEventListener('scroll', onScroll);*/

  function viewPoll(opts) {
    if (!(this instanceof viewPoll)) { return new viewPoll(opts); }
    
    var selector;
    
    if ( typeof opts === 'string' ) {
      selector = opts;
    } else {
      for (var key in opts) {
        if ( opts.hasOwnProperty(key) ) { this.opts[key] = opts[key]; }
      }
      selector = opts.selector;
    }
    
    this.elems = Array.prototype.slice.call(D.querySelectorAll(selector)),
    this.count = this.elems.length;
    
    var i = this.count;
    while (i--) {
      this.elems[i]._visible = false;
    }

    W.addEventListener('resize', this.update.bind(this), false);
    D.addEventListener('scroll', this.update.bind(this), false);
    D.addEventListener('touchmove', this.update.bind(this), false);
    
    this.update();
  }

  viewPoll.prototype = {
    opts: { // Defaults
      selector: '',
      show: function(el){},
      hide: function(){},
      onlyAdd: false,
      class: 'in-view'
    },
    
    colliding: function(y1, h1, y2, h2) {
      return (
        (y2 >= y1 && y2 <= y1 + h1) ||
        (y2 + h2 >= y1 && y2 + h2 <= y1 + h1)
        );
    },
    
    destroy: function(){
      W.removeEventListener('resize', this.update);
      D.removeEventListener('scroll', this.update);
      D.removeEventListener('touchmove', this.update);
    },

    updateElemRects: function() {

      if ( this.count === 0 ) {
        this.destroy();
        return;
      }

      var i = this.count,
      elem, rect, y, h, inView;

      while (i--) {
        elem = this.elems[i];
        rect = elem.getBoundingClientRect();
        y =  rect.top;
        h = rect.bottom - rect.top;

        if ( this.colliding(0, winHeight, y, h) ) {
          elem.classList.add(this.opts.class);
          this.opts.show.call(elem,elem);
          if ( this.opts.onlyAdd ) { this.elems.splice(i,1); }
        } else  {
          elem.classList.remove(this.opts.class);
          this.opts.hide.call(elem,elem);
        }
      }

      this.count = this.elems.length;
    },

    update: function() {
      rAF(this.updateElemRects.bind(this));
    }
  };
  
  return W.viewPoll = viewPoll;
  
})();

setTimeout(viewPoll.bind(this,{
  selector: '.hex'
}),600);
