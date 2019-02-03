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
    maps: [],
    scenarios: [],
    scenarioHolder: {}  // stores scenario object during create and scenario configuration
  },
  view: {
    tagsInputs: {}
  },

  timeout: 5000,

  initialize: function(){
    var that = this;
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        that.model.user = user;        
        
        // load user maps
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

        // load user scenarios
        var scenarioRef = firebase.database().ref('/userScenario/' + that.model.user.uid).orderByChild('modifiedSort');
        console.log(scenarioRef);
        scenarioRef.on('value', function(snapshot) {
          console.log(snapshot.val());  
          if(snapshot.val()){
            that.model.scenarios.length = 0;
            snapshot.forEach(function(child) {
              that.model.scenarios.push(child.val());              
            });            
            console.log(that.model.scenarios);
          }else{
            that.model.scenarios.length = 0;   
            that.model.scenarios = [];
          }
        });

        // load public maps


      } else {
        that.model.user = {};
        that.model.maps = [];
        that.model.scenarios = [];
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
      window.location.replace("login.html");
    });
  },

  loadUserMaps: function(){
    var resultArray = [];
    var that = this;

    return new Promise(function(resolve, reject){
      var mapRef = firebase.database().ref('/userMap/' + that.model.user.uid).orderByChild('modifiedSort');

      mapRef.on('value', function(snapshot) {        
        if(snapshot.val()){          
          snapshot.forEach(function(child) {            
            resultArray.push(child.val());              
          });                      
        }else{}
        console.log(resultArray);
        return resolve(resultArray);                      
      });

      
    });
  },

  scenarioChangeMap: function(mapId){
    var that = this;
    console.log('Changed',mapId);
    this.backendLoadMap(mapId).then(function(map){
      that.model.scenarioHolder.map = map;       
    }, function(error){
      console.log(error);
      that.showNotificationError();
    }).catch(function(error){
      console.log(error);
      that.showNotificationError();
    });
    
  },

  saveCurrentScenario: function(){
    var scenario = this.model.scenarioHolder;
    scenario.tags = this.view.tagsInputs[0].getValue();

    this.saveScenario(scenario);
  },

  saveScenario: function(scenario){

    // set some defaults
    scenario.teaser = scenario.teaser || '';

    scenario.modified = Date.now();
    scenario.modifiedSort = -Date.now();

    
    this.backendSaveScenario(scenario);
    this.backendSaveUserScenario(scenario);

    this.showNotificationSuccess();
  },

  scenarioCreateStepOne: function(modalId){
    d3.select('#'+modalId).classed('is-active',true);    
  },



  scenarioCreateStepOneCancel: function(modalId){
    d3.select('#'+modalId).classed('is-active',null);
  },

  scenarioCreateStepTwo: function(modalId){
    // this is a fix as rivet rv-value does not work poperly with tagsinput component
    var tags = d3.select('#scenario-create-tags').property("value");
    

    
    //this.backendCreateScenario(this.model.scenarioHolder.name, this.model.scenarioHolder.turns, this.model.scenarioHolder.powerIndex, this.model.scenarioHolder.tags);
    this.backendCreateScenario(this.model.scenarioHolder.name, this.model.scenarioHolder.turns, this.model.scenarioHolder.powerIndex, tags);
    this.model.scenarioHolder = {};

    d3.select('#'+modalId).classed('is-active',null);
    d3.select('#scenario-create-tags').attr("value",null);    
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

  showNotificationSuccess: function(){
    d3.select('.notification,.operation-success').classed('is-hidden',null);  
    
    setTimeout(function(){
      d3.select('.notification,.operation-success').classed('is-hidden',true);
    },this.timeout);    
  },

  showNotificationError: function(){
    d3.select('.notification,.operation-failure').classed('is-hidden',null);  
    
    setTimeout(function(){
      d3.select('.notification,.operation-failure').classed('is-hidden',true);
    },this.timeout);    
  },

  scenarioDelete: function(scenarioId){
    var that = this;
    this.backendLoadScenario(scenarioId).then(function(scenario){
      
      that.backendDeleteScenario(scenario).then(function(){
        that.backendDeleteUserScenario(scenario).then(function(){          
          that.showNotificationSuccess();
        }, function(error){
          console.log(error);    
          that.showNotificationError();
        }).catch(function(error){
          console.log(error);    
          that.showNotificationError();
        });
      },function(error){
          console.log(error);    
          that.showNotificationError();
        }).catch(function(error){
        console.log(error);  
        that.showNotificationError();
      });  
    },function(error){
          console.log(error);    
          that.showNotificationError();
        }).catch(function(error){
      console.log(error);
      that.showNotificationError();
    });
  },

  scenarioClone: function(scenarioId){
    var that = this;
    this.backendLoadScenario(scenarioId).then(function(scenario){

      //backendCreateScenario: function(name, turns, powerIndex, tags){

      //var cloneScenarioId = that.backendCreateScenario(scenario.name+'-clone', scenario.turns, scenario.powerIndex, scenario.tags.join());
      var cloneScenarioId = that.backendCreateScenario(scenario.name+'-clone', scenario.turns, scenario.powerIndex, scenario.tags);

      that.backendLoadScenario(cloneScenarioId).then(function(scenarioCloned){
        scenarioCloned.teaser = scenario.teaser;
        scenarioCloned.rulesAndConditions = scenario.rulesAndConditions;
        scenarioCloned.teaser = scenario.teaser;
        scenarioCloned.deploymentSpecification = scenario.deploymentSpecification;
        scenarioCloned.victoryConditions = scenario.victoryConditions;

        that.backendSaveScenario(scenarioCloned);
        that.backendSaveUserScenario(scenarioCloned);
      }).catch(function(error){
        console.log(error);
        that.showNotificationError();
      });
    }).catch(function(error){
      console.log(error);
      that.showNotificationError();
    });
  },

  mapDelete: function(mapId){
    var that = this;
    this.backendLoadMap(mapId).then(function(map){
      console.log(map);
      that.backendDeleteMap(map).then(function(){
        that.backendDeleteUserMap(map).then(function(){
          console.log('Deleted');  
          that.showNotificationSuccess();
        }).catch(function(error){
          console.log(error);    
          that.showNotificationError();
        });
      }).catch(function(error){
        console.log(error);  
        that.showNotificationError();
      });  
    }).catch(function(error){
      console.log(error);
      that.showNotificationError();
    });
  },

  mapClone: function(mapId){
    var that = this;
    this.backendLoadMap(mapId).then(function(map){
      var cloneMapId = that.backendCreateMap(map.mapName+'-clone', map.rows, map.cols);
      that.backendLoadMap(cloneMapId).then(function(mapCloned){
        mapCloned.mapSpecification = map.mapSpecification;
        mapCloned.isPublic = map.isPublic;

        that.backendSaveMap(mapCloned);
        that.backendSaveUserMap(mapCloned);
      }).catch(function(error){
        console.log(error);
        that.showNotificationError();
      });
    }).catch(function(error){
      console.log(error);
      that.showNotificationError();
    });
  },


  mapRequestPublic: function(mapId){
    var that = this;
    this.backendLoadMap(mapId).then(function(map){
      // send map for public review
      map.isPublic = -1;
      that.backendSaveMap(map);  
      that.backendSaveUserMap(map);    
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
        return reject(error);
      });
      
    });
  },

  backendDeleteUserMap: function(map){
    return new Promise(function(resolve, reject){
      firebase.database().ref('/userMap/' + map.userId+"/"+map.mapId).remove().then(function(){
        return resolve();      
      }).catch(function(error){
        return reject(error);  
      });
      
    });
  },


  backendDeleteScenario: function(scenario){
    return new Promise(function(resolve, reject){
      firebase.database().ref('/scenarios/' + scenario.scenarioId).remove().then(function(){
        return resolve();
      }).catch(function(error){
        return reject(error);
      });
      
    });
  },

  backendDeleteUserScenario: function(scenario){
    return new Promise(function(resolve, reject){
      firebase.database().ref('/userScenario/' + scenario.userId+"/"+scenario.scenarioId).remove().then(function(){
        return resolve();      
      }).catch(function(error){
        return reject(error);  
      });
      
    });
  },


  backendCreateScenario: function(name, turns, powerIndex, tags){
    
    var id = this.backendGenerateUUID();

    var scenario = {
      scenarioId: id,
      name: name,
      userId: this.backendGetLoggedUser().uid,
      created: Date.now(),
      modified: Date.now(),
      modifiedSort: -Date.now(),
      isPublic: 0,
      powerIndex: powerIndex,
      turns: turns,
      deploymentSpecification: null,
      victoryConditions: null,
      map: null,
      //tags: tags.split(',')   
      tags: tags,
      teaser: null
    };
    

    this.backendSaveScenario(scenario);
    this.backendSaveUserScenario(scenario);

    return id;
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
      mapSpecification: mapSpecification,
      isPublic: 0
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

        that.showNotificationSuccess();

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

  backendLoadScenario: function(scenarioId){
    return new Promise(function(resolve, reject){
      var mapRef = firebase.database().ref('/scenarios/' + scenarioId).once('value').then(function(snapshot){
        if(snapshot)
          return resolve(snapshot.val());
        else 
          return reject();
      });
    });
  },

  backendSaveScenario: function(scenario){
    firebase.database().ref('/scenarios/' + scenario.scenarioId).set(scenario);
  },

  backendSaveUserScenario: function(scenario){
    firebase.database().ref('/userScenario/' + scenario.userId+"/"+scenario.scenarioId).set(scenario);
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