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
    offsetY: 0
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

    return '<polygon id="hex'+this.instance+'" points="'+points.join(' ')+'"></polygon>';

  },

  createPattern: function(){

                
    var p = '<pattern  id="star" width="100%" height="100%">'
    //var p = '<pattern id="star" >'
    p += '<use href="/assets/svg/r1svg.svg#layer1"></use>'
    //p += '<circle cx="10" cy="10" r="10" stroke="#393" fill="#393" />'
    p += '</pattern>'

    return p;
  },
  
  createGrid: function(){
    //var hex = '<use x="{{x}}" y="{{y}}" fill="{{fill}}" class="hex" xlink:href="#hex'+this.instance+'" />',
    var hex = '<use x="{{x}}" y="{{y}}" fill="url(#star)" stroke="blue" class="hex" xlink:href="#hex'+this.instance+'" />',    
    //var hex = '<use x="{{x}}" y="{{y}}" fill="{{fill}}" class="hex" xlink:href="/assets/svg/r1svg.svg#layer1"/>',        
    odd = false,
    size = this.opts.size + this.opts.spacing,
    grid = '',
    total = this.opts.rows * this.opts.cols,
    count = 0,
    x, y, i, j, fill;

    for ( i = 0; i < this.opts.rows; i++ ){
      odd = i % 2;
      y = i * (size * 0.87) + this.opts.offsetY;
      for ( j = 0; j < this.opts.cols + (odd ? 1 : 0); j++ ){
        x = j * size + (odd ? -size / 2 : 0 ) + this.opts.offsetX;
        count++;

        fill = 'hsla('+Math.round((count / total) * 50)+', 80%, ' + Math.round((Math.random()*15) + 40) +'%, 1)';
        
        grid += hex.replace('{{x}}',x).replace('{{y}}',y).replace('{{fill}}',fill);
      }
    }
    
    return grid;
  },

  createSVG: function(){
    var div = document.createElement('div'),
    size = this.opts.size + this.opts.spacing;

    div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 '
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
