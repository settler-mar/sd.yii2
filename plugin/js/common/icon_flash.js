var iconFlash = (function(){

    var iconFlashInterval = null;
    var defaultIcon = true;

    function toggleIcon() {
        var icon = defaultIcon ? 'img/favicon-32x32-little.png' : 'img/favicon-32x32.png';
        defaultIcon = !defaultIcon;
        chrome.runtime.sendMessage({action: 'icon_flash_change', icon: icon});
    }

    function start() {
        defaultIcon = true;
        toggleIcon();
        iconFlashInterval = setInterval(toggleIcon, iconFlashTime);

    }
    function stop() {
        clearInterval(iconFlashInterval);
        defaultIcon = false;
        toggleIcon();
    }

    return {
        start:start,
        stop:stop
    }
})();