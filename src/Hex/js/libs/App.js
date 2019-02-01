  export function App(opts) {
  if (!(this instanceof App)) { return new App(opts); }

  for (var key in opts) {
    if ( opts.hasOwnProperty(key) ) { this.opts[key] = opts[key]; }
  }
  
  this.instance = Math.round(Math.random() * 2000);
  this.initialize();
  return this;
}

App.prototype = {  

  opts: {    
  },

  model: {
    user: {},
    maps: []
  },

  timeout: 5000,

  initialize: function(){
    var that = this;
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        that.model.user = user;        
        var mapRef = firebase.database().ref('/userMap/' + that.model.user.uid).orderByChild('modifiedSort');
        console.log(mapRef);
        mapRef.on('value', function(snapshot) {
          console.log(snapshot.val());  
          if(snapshot.val()){
            that.model.maps.length = 0;
            snapshot.forEach(function(child) {
              that.model.maps.push(child.val());              
            });            
            console.log(that.model.maps);
          }else{
            that.model.maps.length = 0;   
            that.model.maps = [];
          }
        });
      } else {
        that.model.user = {};
        that.model.maps = [];
      }
    });
  },

  userJoin: function() {
    var email = d3.select('#email');
    var pass = d3.select('#pass');
    var consents = d3.select('#consent');

    var emailValue = email.property("value");
    var passValue = pass.property("value");

    var consentsAgreed = consents.property('checked');

    var valid = true;

    if(!this.validateEmail( emailValue )){
      d3.select('#email-invalid-1').classed('is-hidden',null);
      d3.select('#email-invalid-2').classed('is-hidden',null);
      d3.select('#email-valid').classed('is-hidden', true);
      d3.select('#email').classed('is-danger', true);
      d3.select('#email').classed('is-success',null);
      valid = valid && false;
    }else{
      d3.select('#email-invalid-1').classed('is-hidden', true);
      d3.select('#email-invalid-2').classed('is-hidden', true);
      d3.select('#email-valid').classed('is-hidden',null);
      d3.select('#email').classed('is-danger',null);
      d3.select('#email').classed('is-success', true);      
      valid = valid && true;
    }

    if(!consentsAgreed){
      d3.select('#consents-invalid').classed('is-hidden',null);
      valid = valid && false;
    }else{
      d3.select('#consents-invalid').classed('is-hidden',true);
      valid = valid && true;
    }
    
    if(valid){
      firebase.auth().createUserWithEmailAndPassword(emailValue, passValue).then(function(user){
        console.log(user);
        window.location.replace("MapEditor.html");
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
        console.log(error);
      });
    }
  },

  userSignOut: function(){
    firebase.auth().signOut().then(function() {
      window.location.replace("login.html");
    }).catch(function(error) {
      // An error happened.
    });
  },

  mapCreateStepOne: function(createMapModalId){
    d3.select('#'+createMapModalId).classed('is-active',true);    
  },

  mapCreateStepOneCancel: function(createMapModalId){
    d3.select('#'+createMapModalId).classed('is-active',null);
  },

  mapCreateStepTwo: function(createMapModalId){
    var mapName = d3.select('#map-create-name').property("value");
    var rows = d3.select('#map-create-rows').property("value");
    var cols = d3.select('#map-create-cols').property("value");

    this.backendCreateMap(mapName, rows, cols);

    d3.select('#'+createMapModalId).classed('is-active',null);
  },

  mapDelete: function(mapId){
    var that = this;
    this.backendLoadMap(mapId).then(function(map){
      console.log(map);
      that.backendDeleteMap(map).then(function(){
        that.backendDeleteUserMap(map).then(function(){
          console.log('Deleted');  
          d3.select('.notification,.delete-success').classed('is-hidden',null);  

        
          setTimeout(function(){
            d3.select('.notification,.delete-success').classed('is-hidden',true);
          },that.timeout);    
        }).catch(function(error){
          console.log(error);    
        });
      }).catch(function(error){
        console.log(error);  
      });  
    }).catch(function(error){
      console.log(error);
    });
  },

  mapClone: function(mapId){
    var that = this;
    this.backendLoadMap(mapId).then(function(map){
      var cloneMapId = that.backendCreateMap(map.mapName+'-clone', map.rows, map.cols);
      that.backendLoadMap(mapId).then(function(mapCloned){
        mapCloned.mapSpecification = map.mapSpecification;
        that.backendSaveMap(mapCloned);
      }).catch(function(error){
        console.log(error);
      });
    }).catch(function(error){
      console.log(error);
    });
  },

  validateEmail: function(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  },

  backendGetLoggedUser: function(){
    var user = firebase.auth().currentUser;
    return user;
  },

  backendDeleteMap: function(map){
    return new Promise(function(resolve, reject){
      firebase.database().ref('/maps/' + map.mapId).remove().then(function(){
        return resolve();
      }).catch(function(error){
        return reject();
      });
      
    });
  },

  backendDeleteUserMap: function(map){
    return new Promise(function(resolve, reject){
      firebase.database().ref('/userMap/' + map.userId+"/"+map.mapId).remove().then(function(){
        return resolve();      
      }).catch(function(error){
        return reject();  
      });
      
    });
  },

  backendCreateMap: function(mapName, rows, cols){
    var mapId = this.backendGenerateUUID();

   var tilesSpecification = GameUtils.generateEmptyTilesMapSpecification(parseInt(rows), parseInt(cols));

    var mapSpecification = {
      mapName: mapName,
      cols: parseInt(cols),
      rows: parseInt(rows),
      tiles: tilesSpecification
    };

    var map = {
      mapId: mapId,
      mapName: mapName,
      cols: parseInt(cols),
      rows: parseInt(rows),
      userId: this.backendGetLoggedUser().uid,
      created: Date.now(),
      modified: Date.now(),
      modifiedSort: -Date.now(),
      mapSpecification: mapSpecification
    }

    this.backendSaveMap(map);
    this.backendSaveUserMap(map);

    return mapId;

  },

  handleEditorEvent: function(event){
    var mapSpecification = event.mapSpecification?event.mapSpecification:null;
    var mapId = event.mapId?event.mapId:null;
    var that = this;

    if(mapSpecification&&mapId){
      this.backendLoadMap(mapId).then(function(map){
        map.mapSpecification = mapSpecification;
        map.modified = Date.now();
        map.modifiedSort = -Date.now();
        map.mapName = mapSpecification.mapName;

        that.backendSaveMap(map);
        that.backendSaveUserMap(map);

        d3.select('.notification,.save-success').classed('is-hidden',null);  

        
        setTimeout(function(){
          d3.select('.notification,.save-success').classed('is-hidden',true);
        },3000); 

      });
    }    
  },

  backendLoadMap: function(mapId){
    return new Promise(function(resolve, reject){
      var mapRef = firebase.database().ref('/maps/' + mapId).once('value').then(function(snapshot){
        if(snapshot)
          return resolve(snapshot.val());
        else 
          return reject();
      });
    });
  },

  backendSaveMap: function(map){
    firebase.database().ref('/maps/' + map.mapId).set(map);
  },

  backendSaveUserMap: function(map){
    firebase.database().ref('/userMap/' + map.userId+"/"+map.mapId).set(map);
  },

  backendGenerateUUID: function() {
      return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      )
  }
};