export function BattleEditor(configuringUser){

	if (window === this) {
         return new BattleEditor(configuringUser);
    }
    this._initialize(configuringUser);
    return this;
};

BattleEditor.prototype = {
    model: {
        kind: '', // browse - user selects scenario, scenario - user enters with already selected scenario
        scenarioId: '',
        scenario: {},
        opponentId: '',  
        opponent: {},      
        userId: '',    
        user: {},    
        battle: {
            startingParty: 'red',
            turnTimeLimitS: null,
            redUserId: null,
            blueUserId: null,
            scenarioId: null,
        },
        userCreatingParty: 'red',
        battleParametersConfigured: function(){
            var condition1 = this.battle.startingParty?true:false;
            var condition2 = this.battle.turnTimeLimitS > 0?true:false;
            var result = condition1 && condition2;
            return result;
        },
        battleOpponentConfigured: function(){
            var condition1 = this.battle.redUserId?true:false;
            var condition2 = this.battle.blueUserId?true:false;
            var condition3 = this.battle.redUserId != this.battle.blueUserId;

            var result = condition1 && condition2 && condition3;
            return result;
        },
        battleConfigured: function(){
            var condition1 = this.battleParametersConfigured();
            var condition2 = this.battleOpponentConfigured();
            var condition3 = this.battle.scenarioId != null;
            var result = condition1 && condition2 && condition3;
            return result;
        },
        availableUsers: [],
        userCarousel: {},
    },

	_initialize: function(configuringUser){            
        this.initializeRivetFormatters();
        this.model.user =  configuringUser;       
	},

    initializeRivetFormatters: function(){        
    },   

    handleAvailableUsersChanged: function(availableUsersArray){
        console.log('Handling available users.',availableUsersArray);
        this.model.availableUsers = availableUsersArray;
        var carousels = bulmaExtensions.bulmaCarousel.attach(); // carousels now contains an array of all Carousel instances
        this.model.userCarousel = carousels[0];
    },

    handleEvent: function(event){
        console.log('Got event',event);
        switch(event.kind){
            case 'scenarioSelected':
                this.model.scenarioId = event.scenario.scenarioId;
                this.model.scenario = event.scenario;
                this.model.battle.scenarioId = event.scenario.scenarioId;
                break;
        }
    },

    setOpponentSelected: function(currentUserId, opponentId){
        this.model.opponentId = opponentId;
        if(this.model.userCreatingParty == 'red'){
            this.model.battle.redUserId = currentUserId;
            this.model.battle.blueUserId = opponentId;
        }else{
            this.model.battle.redUserId = opponentId;
            this.model.battle.blueUserId = currentUserId;
        }

        for(var i=0; i<this.model.availableUsers.length; i++){
            var potentialOpponent = this.model.availableUsers[i];
            if(potentialOpponent.uid == opponentId){
                this.model.opponent = potentialOpponent;
                break;
            }
        }
        console.log('Set up opponents', currentUserId, opponentId);
    },
        
};