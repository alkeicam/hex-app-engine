  export function App(opts) {
  if (!(this instanceof App)) { return new App(opts); }

  for (var key in opts) {
    if ( opts.hasOwnProperty(key) ) { this.opts[key] = opts[key]; }
  }
  
  this.instance = Math.round(Math.random() * 2000);
  //this.initialize();
  return this;
}

App.prototype = {  

  opts: {    
  },

  model: {    
    user: {},
    userData: {},// additional data of the logged in user
    empire: {}, //currently logged in user empire

    maps: [],
    scenarios: [],
    scenarioHolder: {},  // stores scenario object during create and scenario configuration    
    isDeploymentConfigured: false,
    isVictoryConditionsConfigured: false,
    userMarkedAsInactive: false
  },
  view: {
    tagsInputs: {}
  },

  timeout: 5000,
  //inactivityTimeMs: 5*60000, // 15 minutes
  inactivityTimeMs: 60000, // 60 seconds
  

  initialized: function(){
    var that = this;
    return new Promise(function(resolve, reject){
      firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION).then(function(){
        firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
            that.model.user = user;                 

            that.observeUserMaps();
            that.observeUserScenarios();

            that.loadUserEntitySingle('userEmpire').then(function(resultArray){
              var sth = resultArray[0];
              that.model.empire = resultArray[0];
            });


            // add user to the list of active users
            //that.saveAvailableUser(user);

            // // set inactivity timer
            // that.detectInactivity();
            firebase.database().ref('.info/connected').on('value', function (snapshot) {
              // If we're not currently connected, don't do anything.
              if (snapshot.val() == false) {
                return;
              };

              // If we are currently connected, then use the 'onDisconnect()'
              // method to add a set which will only trigger once this
              // client has disconnected by closing the app,
              // losing internet, or any other means.
              //userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase)
              firebase.database().ref('/usersAvailable/' + user.uid).onDisconnect().set(null)
              .then(function () {
                // The promise returned from .onDisconnect().set() will
                // resolve as soon as the server acknowledges the onDisconnect()
                // request, NOT once we've actually disconnected:
                // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect

                // We can now safely set ourselves as 'online' knowing that the
                // server will mark us as offline once we lose connection.
                that.saveAvailableUser(user);
                //userStatusDatabaseRef.set(isOnlineForDatabase);
              });
            });
            


        } else {
            that.model.user = {};
            that.model.maps = [];
            that.model.scenarios = [];
            that.model.scenarioHolder = {};
            window.location.replace("/login.html");
        }

        
          

          resolve();
        });  
      });
      
      
    });
  },

  detectInactivity: function(){
    var that = this;
    var timer = setTimeout(that.markCurrentUserInactive, that.inactivityTimeMs);    

    window.onload = resetTimer;
    // DOM Events
    document.onmousemove = resetTimer;
    document.onkeypress = resetTimer;
    document.onload = resetTimer;
    document.onmousemove = resetTimer;
    document.onmousedown = resetTimer; // touchscreen presses
    document.ontouchstart = resetTimer;
    document.onclick = resetTimer;     // touchpad clicks
    document.onscroll = resetTimer;    // scrolling with arrow keys
    document.onkeypress = resetTimer;

    function resetTimer(){
      clearTimeout(timer);
      timer = setTimeout(that.markCurrentUserInactive, that.inactivityTimeMs); // 1000 milisec = 1 sec       
    }    

    // also mark inactivity when user closes the tab
    window.onbeforeunload = that.markCurrentUserInactive;
  },
  

  markCurrentUserInactive: function(internal){
    console.log('User marked as inactive');
    var that = null;
    if(!internal)
      that = window.appProxy;
    else
      that = this;
     //= internal !=null ? this:window.appProxy;

    if(!that.model.userMarkedAsInactive){
      var user = that.backendGetLoggedUser();
      that.backendDeleteAvailableUser({
        uid: user.uid
      });
      that.model.userMarkedAsInactive = true;  
    }    
  },

  //this.model.user.email, this.model.userEmpire.name, this.model.userEmpire.battleCry
  userJoin: function(email, password, empireName, empireBattleCry) {
    var that = this;

    return new Promise(function(resolve, reject){
      firebase.auth().createUserWithEmailAndPassword(email, password).then(function (user) {
        that.backendSaveUserEntity('userEmpire', user.user.uid, {
          i: that.backendGenerateUUID(),
          bc: empireBattleCry,
          n: empireName,
          bw: 0,
          bl:0,
          r:0
        }).then(function(){
          resolve();        
          window.location.replace("/");
        })
        
  
      }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        reject(error);
      });
    });
    
    
  },

  userSignOut: function(){
    firebase.auth().signOut().then(function() {
      window.location.replace("login.html");
    }).catch(function(error) {
      window.location.replace("login.html");
    });
  },

  loadUserEntity: function(entityName, orderByField){
    var resultArray = [];
    var that = this;
    var orderBy = orderByField || 'modifiedSort';

    return new Promise(function(resolve, reject){
      var entityRef = firebase.database().ref('/'+entityName+'/' + that.model.user.uid).orderByChild(orderBy);

      entityRef.on('value', function(snapshot) {        
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

  loadUserEntitySingle: function(entityName, orderByField){
    var resultArray = [];
    var that = this;
    var orderBy = orderByField || 'modifiedSort';

    return new Promise(function(resolve, reject){
      var entityRef = firebase.database().ref('/'+entityName+'/' + that.model.user.uid).orderByChild(orderBy);

      entityRef.on('value', function(snapshot) {        
        if(snapshot.val()){       
          resultArray.push(snapshot.val());                                            
        }else{}
        console.log(resultArray);
        return resolve(resultArray);                      
      });
    });
  },


  observeUserEntity: function(entityName, orderByField, targetModelFieldName){
    
    var that = this;
    var orderBy = orderByField || 'modifiedSort';
    
    var entityRef = firebase.database().ref('/'+entityName+'/' + that.model.user.uid).orderByChild(orderBy);

    entityRef.on('value', function(snapshot) {        
      var resultArray = [];
      if(snapshot.val()){          
        snapshot.forEach(function(child) {            
          resultArray.push(child.val());              
        });                      
      }else{}
      console.log(resultArray);
      that.model[targetModelFieldName] = resultArray;
    });    
  },

  observeUserPendingInvitation: function(handler){
    
    this.observeUserEntityWithHandler('userInvitations/pending',null,handler);
  },


  observeUserEntityWithHandler: function(entityName, orderByField, handler){
    
    var that = this;
    var orderBy = orderByField || 'modifiedSort';
    
    var entityRef = firebase.database().ref('/'+entityName+'/' + that.model.user.uid).orderByChild(orderBy);

    entityRef.on('value', function(snapshot) {        
      var resultArray = [];
      if(snapshot.val()){          
        snapshot.forEach(function(child) {            
          resultArray.push(child.val());              
        });                      
      }else{}
      
      handler.hFunction.apply(handler.hObject,[resultArray]);      
    });    
  },

  observeAvailableUsers: function(handler){
    var that = this;
    var availableUsersRef = firebase.database().ref('/usersAvailable').limitToLast(10);

    availableUsersRef.on('value', function(snapshot) {
      var resultArray = [];

      if(snapshot.val()){          
          snapshot.forEach(function(child) {   
            var user = child.val();
            // when user is the current user then skip as we add only "other" users
            if(user.uid != that.model.user.uid)
              resultArray.push(child.val());              
          });                      
        }else{}      

      // will hold array of users available  
      
      handler.hFunction.apply(handler.hObject,[resultArray]);      
      
    });
  },

  observeUserPlayInvitations: function(handler){
    var that = this;
    var userPlayInvitationsRef = firebase.database().ref('/usersInvitations').limitToLast(10);

    availableUsersRef.on('value', function(snapshot) {
      var resultArray = [];

      if(snapshot.val()){          
          snapshot.forEach(function(child) {   
            var user = child.val();
            // when user is the current user then skip as we add only "other" users
            if(user.uid != that.model.user.uid)
              resultArray.push(child.val());              
          });                      
        }else{}      

      // will hold array of users available  
      
      handler.hFunction.apply(handler.hObject,[resultArray]);      
      
    });
  },

  observeUserMaps: function(orderByField){
    this.observeUserEntity('userMap', 'modifiedSort', 'maps');
  },

  loadUserMaps: function(orderByField){
    // var resultArray = [];
    // var that = this;
    // var orderBy = orderByField || 'modifiedSort';

    // return new Promise(function(resolve, reject){
    //   var mapRef = firebase.database().ref('/userMap/' + that.model.user.uid).orderByChild(orderBy);

    //   mapRef.on('value', function(snapshot) {        
    //     if(snapshot.val()){          
    //       snapshot.forEach(function(child) {            
    //         resultArray.push(child.val());              
    //       });                      
    //     }else{}
    //     console.log(resultArray);
    //     return resolve(resultArray);                      
    //   });

      
    // });
    return this.loadUserEntity('userMap', orderByField);
  },

  observeUserScenarios: function(orderByField){
    this.observeUserEntity('userScenario', 'modifiedSort', 'scenarios');
  },

  loadUserScenarios: function(orderByField){
    // var resultArray = [];
    // var that = this;
    // var orderBy = orderByField || 'modifiedSort';

    // return new Promise(function(resolve, reject){
    //   var scenarioRef = firebase.database().ref('/userScenario/' + that.model.user.uid).orderByChild(orderBy);

    //   scenarioRef.on('value', function(snapshot) {        
    //     if(snapshot.val()){          
    //       snapshot.forEach(function(child) {            
    //         resultArray.push(child.val());              
    //       });                      
    //     }else{}
    //     console.log(resultArray);
    //     return resolve(resultArray);                      
    //   });

      
    // });
    return this.loadUserEntity('userScenario', orderByField);
  },

  scenarioChangeMap: function(mapId){
    var that = this;
    console.log('Changed',mapId);
    this.backendLoadMap(mapId).then(function(map){
      that.model.scenarioHolder.map = map; 
      that.model.scenarioHolder.deploymentSpecification = [];
      that.model.isDeploymentConfigured = false;
      that.model.scenarioHolder.victoryConditions = {};
      that.model.isVictoryConditionsConfigured = false;

      that.saveCurrentScenario();
    }, function(error){
      console.log(error);
      that.showNotificationError();
    }).catch(function(error){
      console.log(error);
      that.showNotificationError();
    });
    
  },

  saveCurrentScenario: function(){
    //beware, here we need to make sure that variables used by rivet are not interfering
    var scenario = this.model.scenarioHolder;    
    scenario.tags = this.view.tagsInputs[0].getValue();



    this.saveScenario(scenario);
  },

  downloadCurrentScenario: function(){
    var scenarioId = this.model.scenarioHolder.scenarioId;

    this.backendLoadScenario(scenarioId).then(function(scenario){
      GameUtils.downloadObjectAsJSON(scenario, scenario.name);  
    });
    
  },

  saveMap: function(map){
    map.modified = Date.now();
    map.modifiedSort = -Date.now();
    

    this.backendSaveMap(map);
    this.backendSaveUserMap(map);

    this.showNotificationSuccess();
  },

  saveAvailableUser: function(user){
    var userEntity = {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email
    }
    this.backendSaveAvailableUser(userEntity);
  },



  saveScenario: function(scenario){

    // set some defaults
    scenario.teaser = scenario.teaser || '';
    if(!scenario.map){
      scenario.map = {
        mapId: '',
        mapName: ''
      }
    }    
    scenario.deploymentSpecification = scenario.deploymentSpecification || {};
    scenario.victoryConditions = scenario.victoryConditions || {};

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
        scenarioCloned.teaser = scenario.teaser || '';
        scenarioCloned.map = scenario.map || {};        
        scenarioCloned.rulesAndConditions = scenario.rulesAndConditions || {};        
        scenarioCloned.deploymentSpecification = scenario.deploymentSpecification || [];
        scenarioCloned.victoryConditions = scenario.victoryConditions || {};

        // that.backendSaveScenario(scenarioCloned);
        // that.backendSaveUserScenario(scenarioCloned);
        that.saveScenario(scenarioCloned);
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
      var newMapName = map.mapName+'-clone';
      var cloneMapId = that.backendCreateMap(newMapName, map.rows, map.cols);
      that.backendLoadMap(cloneMapId).then(function(mapCloned){
        mapCloned.mapSpecification = map.mapSpecification;
        if(mapCloned.mapSpecification)
          mapCloned.mapSpecification.mapName = newMapName;

        // that.backendSaveMap(mapCloned);
        // that.backendSaveUserMap(mapCloned);
        that.saveMap(mapCloned);
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
      // that.backendSaveMap(map);  
      // that.backendSaveUserMap(map);  
      that.saveMap(map);  
    }).catch(function(error){
      console.log(error);
    });
  },

  scenarioRequestPublic: function(scenarioId){
    var that = this;
    this.backendLoadScenario(scenarioId).then(function(scenario){
      // send scenario for public review
      scenario.isPublic = -1;
      that.saveScenario(scenario);    
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
    // todo add loading userExtension
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
      // deploymentSpecification: {},
      // victoryConditions: {},
      // map: {},
      //tags: tags.split(',')   
      tags: tags,
      teaser: ''
    };
    

    // this.backendSaveScenario(scenario);
    // this.backendSaveUserScenario(scenario);
    this.saveScenario(scenario);


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

    // this.backendSaveMap(map);
    // this.backendSaveUserMap(map);
    this.saveMap(map);
    return mapId;

  },

  handleEditorEvent: function(event){
    var mapSpecification = event.mapSpecification?event.mapSpecification:null;
    var mapId = event.mapId?event.mapId:null;
    var scenarioId = event.scenarioId;
    var that = this;

    var eventType = event.kind;

    switch(eventType){
      case 'saveMap':
        if(mapSpecification&&mapId){
          this.backendLoadMap(mapId).then(function(map){
            map.mapSpecification = mapSpecification;
            map.modified = Date.now();
            map.modifiedSort = -Date.now();
            map.mapName = mapSpecification.mapName;

            // that.backendSaveMap(map);
            // that.backendSaveUserMap(map);

            // that.showNotificationSuccess();
            that.saveMap(map);

          });
        }      
        break;
      case 'saveScenarioDeployment':
        this.backendLoadScenario(scenarioId).then(function(scenario){
          scenario.deploymentSpecification = event.deploymentSpecification;
          // that.backendSaveScenario(scenario);
          // that.backendSaveUserScenario(scenario);

          // // save in holder for futher save
          // //that.model.scenarioHolder.deploymentSpecification = event.deploymentSpecification

          // that.showNotificationSuccess();
          that.saveScenario(scenario);
        });
        break;
      case 'saveScenarioVictory':
        this.backendLoadScenario(scenarioId).then(function(scenario){
          // process victory conditions         
          var victoryConditions = [{
              party: 'red',
              primaryVictoryCondition: event.victoryConditions.red.primaryVictoryCondition || {},
              secondaryVictoryCondition: event.victoryConditions.red.secondaryVictoryCondition || {}
            },
            {
              party: 'blue',
              primaryVictoryCondition: event.victoryConditions.blue.primaryVictoryCondition || {},
              secondaryVictoryCondition: event.victoryConditions.blue.secondaryVictoryCondition || {}
            }
          ];

          

          scenario.victoryConditions = victoryConditions;


          // that.backendSaveScenario(scenario);
          // that.backendSaveUserScenario(scenario);

          // // save in holder for futher save
          // //that.model.scenarioHolder.deploymentSpecification = event.deploymentSpecification

          // that.showNotificationSuccess();
          that.saveScenario(scenario);
        });
        break;
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
    var that = this;

    return new Promise(function(resolve, reject){
      var mapRef = firebase.database().ref('/scenarios/' + scenarioId).once('value').then(function(snapshot){
        if(snapshot){
          var scenario = snapshot.val();
          that.model.isDeploymentConfigured = scenario.deploymentSpecification && scenario.deploymentSpecification.length > 0 ? true:false;
          that.model.isVictoryConditionsConfigured = scenario.victoryConditions && scenario.victoryConditions.length == 2 ? true:false;
          return resolve(scenario);
        }
        else 
          return reject();
      });
    });
  },

  backendSaveScenario: function(scenario){
    firebase.database().ref('/scenarios/' + scenario.scenarioId).set(scenario);
  },

  backendSaveAvailableUser: function(user){
    firebase.database().ref('/usersAvailable/' + user.uid).set(user);
  },

  backendDeleteAvailableUser: function(user){
    firebase.database().ref('/usersAvailable/' + user.uid).set(null);
  },

  backendSaveUserScenario: function(scenario){
    firebase.database().ref('/userScenario/' + scenario.userId+"/"+scenario.scenarioId).set(scenario);
  },

  backendSaveUserEntity: function(entityName, userId, entity){
    var entityPath = '/'+entityName+'/' + userId ;
    return new Promise(function(resolve, reject){
      firebase.database().ref(entityPath).set(entity,function(error){
        resolve();
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