import {LatinSentences} from './latin-sentences.js' 

export function JoinController(opts){

	if (window === this) {
         return new JoinController(opts);
    }
    this._initialize(opts);
    return this;
};

JoinController.prototype = {
    model: {
        userEmpire: {
            battleCry: "",
            name: ""
        },
        user: {
            email: "",
            password: "",
            consent: ""
        },
        validation: {
            userEmpire: {
                name: 2,
                battleCry: 2
            },
            user: {
                email: 2,
                password: true,
                consent: 2
            }
        }
    },

    iface: {
        app: {}
    },

    opts: {

    },

    latinSentences: new LatinSentences(),

    handleClickJoin: function(){
        var that = this;
        this.model.validation.user.email = this.iface.app.validateEmail(this.model.user.email) ? 1 : 0;        
        this.model.validation.userEmpire.name = this.model.userEmpire.name.length >= 6 ? 1 : 0;
        this.model.validation.userEmpire.battleCry = this.model.userEmpire.battleCry.length >= 2 ? 1 : 0;
        this.model.validation.user.consent = this.model.user.consent ? 1 : 0;

        var isValid = this.model.validation.user.email==1 && this.model.validation.userEmpire.name==1 && this.model.validation.userEmpire.battleCry==1 && this.model.validation.user.consent==1;


        if(isValid)
            this.iface.app.userJoin(this.model.user.email, this.model.user.password, this.model.userEmpire.name, this.model.userEmpire.battleCry)            
            .catch(function(error){
                that.model.validation.user.email = 0;
            })
    },

    _initialize: function (opts){
        
        for (var key in opts) {
            if ( opts.hasOwnProperty(key) ) { this.opts[key] = opts[key]; }
        }
        this.opts = opts || {};   
        
        this.iface.app = this.opts.appInstance;

        var latinSentences = new LatinSentences();

        this.model.userEmpire.battleCry = this._startSentenceWithUppercaser(latinSentences.draw()[0]);
    },

    _startSentenceWithUppercaser: function(sentence) 
    {
        return sentence.charAt(0).toUpperCase() + sentence.slice(1);
    }
}