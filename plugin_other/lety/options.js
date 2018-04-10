document.addEventListener('DOMContentLoaded', function () {
    var options = ['showPrice', 'showUserNotifications', 'showPromoNotifications', 'showCashbackHints'];

    options.forEach(function(option) {
        Storage.get(option, function (item) {
            if(typeof item === "undefined"){
                Storage.set(option, true);
                item = true;
            }

            document.getElementById(option).checked = item;
        });

        document.getElementById(option).addEventListener('click', function() {
            var value = document.getElementById(option).checked;
            Storage.set(option, value);
        });
    });
});