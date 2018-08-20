banner = (function() {
    function refresh(){
        for(i=0;i<$('.adsbygoogle').length;i++) {
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.log(e);
                break;
            }
        }
    }
    return {refresh: refresh}
})();