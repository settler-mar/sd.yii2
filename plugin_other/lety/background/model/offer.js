var Offer = Backbone.Model.extend({
    defaults: {
        "id": "",
        "title": "",
        "image": "",
        "code": "",
        "isTop": "",
        "shopId": "",
        "injDesc": "",
        "shortDesc": "",
        "activateOfferUrl": ""
    },

    initialize: function () {
        var self = this;
    }
});