export function InvitationManager(invitationButtonElementInstance) {

    if (window === this) {
        return new InvitationManager(invitationButtonElementInstance);
    }
    this._initialize(invitationButtonElementInstance);
    return this;
};

InvitationManager.prototype = {
    PENDING_COUNTDOWN_SECONDS: 20,
    model: {
        pendingInvitation: {},
        pendingInvitationTimeLeft: 20,
        calulcateOdds: function () {
            var totalBattlesA;
            var totalBattlesB;
            var sumOfBattles;
            var winRatioA;
            var winRatioB;
            var battleFactorA;
            var battleFactorB;
            var winRatioModifiedA;
            var winRatioMofifiedB;
            var sumWinRatioModified;

            totalBattlesA = this.pendingInvitation.ybw + this.pendingInvitation.ybl;
            totalBattlesB = this.pendingInvitation.bw + this.pendingInvitation.bl;
            sumOfBattles = totalBattlesA + totalBattlesB;
            winRatioA = this.pendingInvitation.ybw / this.pendingInvitation.ybl;
            winRatioB = this.pendingInvitation.bw / this.pendingInvitation.bl;
            battleFactorA = Math.log2(100 * totalBattlesA + 2) / sumOfBattles;
            battleFactorB = Math.log2(100 * totalBattlesB + 2) / sumOfBattles;
            winRatioModifiedA = battleFactorA * winRatioA;
            winRatioMofifiedB = battleFactorB * winRatioB;
            sumWinRatioModified = winRatioModifiedA + winRatioMofifiedB;

            return winRatioModifiedA / sumWinRatioModified;
        }
    },

    uiElement: null,

    _initialize: function (invitationButtonElementInstance) {
        this.uiElement = invitationButtonElementInstance;

        
    },

    handleInvitationStateChanged: function (invitationsArray) {
        console.log('Handling invitation state changed.', invitationsArray);
        this.model.pendingInvitation = invitationsArray[0];
        this.uiElement.dispatch('click');

        // handle timer
        var that = this;
        this.model.pendingInvitationTimeLeft = this.PENDING_COUNTDOWN_SECONDS;
        var pendingTimer = setInterval(function () {
            
            that.model.pendingInvitationTimeLeft -= 1;
            if (that.model.pendingInvitationTimeLeft <= 0){
                clearInterval(pendingTimer);
                d3.select('#invitationCloseTrigger').dispatch('click');
            }                
        }, 1000);
    },

    initializeRivetFormatters: function () {
    },
};