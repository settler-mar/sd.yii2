/*!
 * Retina.js v1.3.0
 *
 * Copyright 2014 Imulus, LLC
 * Released under the MIT license
 *
 * Retina.js is an open source script that makes it easy to serve
 * high-resolution images to devices with retina displays.
 */

(function() {
    var root = (typeof exports === 'undefined' ? window : exports);
    var config = {
        // An option to choose a suffix for 2x images
        retinaImageSuffix : '@2x',

        // Ensure Content-Type is an image before trying to load @2x image
        // https://github.com/imulus/retinajs/pull/45)
        check_mime_type: true,

        // Resize high-resolution images to original image's pixel dimensions
        // https://github.com/imulus/retinajs/issues/8
        force_original_dimensions: true
    };

    function Retina() {}

    root.Retina = Retina;

    Retina.configure = function(options) {
        if (options === null) {
            options = {};
        }

        for (var prop in options) {
            if (options.hasOwnProperty(prop)) {
                config[prop] = options[prop];
            }
        }
    };

    Retina.init = function(context) {
        if (context === null) {
            context = root;
        }

        var existing_onload = context.onload || function(){};

        context.onload = function() {
            var images = document.getElementsByTagName('img'), retinaImages = [], i, image;
            for (i = 0; i < images.length; i += 1) {
                image = images[i];
                if (!!!image.getAttributeNode('data-no-retina')) {
                    retinaImages.push(new RetinaImage(image));
                }
            }
            existing_onload();
        };
    };

    Retina.isRetina = function(){
        var mediaQuery = '(-webkit-min-device-pixel-ratio: 1.5), (min--moz-device-pixel-ratio: 1.5), (-o-min-device-pixel-ratio: 3/2), (min-resolution: 1.5dppx)';

        if (root.devicePixelRatio > 1) {
            return true;
        }

        if (root.matchMedia && root.matchMedia(mediaQuery).matches) {
            return true;
        }

        return false;
    };


    var regexMatch = /\.\w+$/;
    function suffixReplace (match) {
        return config.retinaImageSuffix + match;
    }

    function RetinaImagePath(path, at_2x_path) {
        this.path = path || '';
        if (typeof at_2x_path !== 'undefined' && at_2x_path !== null) {
            this.at_2x_path = at_2x_path;
            this.perform_check = false;
        } else {
            if (undefined !== document.createElement) {
                var locationObject = document.createElement('a');
                locationObject.href = this.path;
                locationObject.pathname = locationObject.pathname.replace(regexMatch, suffixReplace);
                this.at_2x_path = locationObject.href;
            } else {
                var parts = this.path.split('?');
                parts[0] = parts[0].replace(regexMatch, suffixReplace);
                this.at_2x_path = parts.join('?');
            }
            this.perform_check = true;
        }
    }

    root.RetinaImagePath = RetinaImagePath;

    RetinaImagePath.confirmed_paths = [];

    RetinaImagePath.prototype.is_external = function() {
        return !!(this.path.match(/^https?\:/i) && !this.path.match('//' + document.domain) );
    };

    RetinaImagePath.prototype.check_2x_variant = function(callback) {
        var http, that = this;
        if (this.is_external()) {
            return callback(false);
        } else if (!this.perform_check && typeof this.at_2x_path !== 'undefined' && this.at_2x_path !== null) {
            return callback(true);
        } else if (this.at_2x_path in RetinaImagePath.confirmed_paths) {
            return callback(true);
        } else {
            http = new XMLHttpRequest();
            http.open('HEAD', this.at_2x_path);
            http.onreadystatechange = function() {
                if (http.readyState !== 4) {
                    return callback(false);
                }

                if (http.status >= 200 && http.status <= 399) {
                    if (config.check_mime_type) {
                        var type = http.getResponseHeader('Content-Type');
                        if (type === null || !type.match(/^image/i)) {
                            return callback(false);
                        }
                    }

                    RetinaImagePath.confirmed_paths.push(that.at_2x_path);
                    return callback(true);
                } else {
                    return callback(false);
                }
            };
            http.send();
        }
    };


    function RetinaImage(el) {
        this.el = el;
        this.path = new RetinaImagePath(this.el.getAttribute('src'), this.el.getAttribute('data-at2x'));
        var that = this;
        this.path.check_2x_variant(function(hasVariant) {
            if (hasVariant) {
                that.swap();
            }
        });
    }

    root.RetinaImage = RetinaImage;

    RetinaImage.prototype.swap = function(path) {
        if (typeof path === 'undefined') {
            path = this.path.at_2x_path;
        }

        var that = this;
        function load() {
            if (! that.el.complete) {
                setTimeout(load, 5);
            } else {
                if (config.force_original_dimensions) {
                    that.el.setAttribute('width', that.el.offsetWidth);
                    that.el.setAttribute('height', that.el.offsetHeight);
                }

                that.el.setAttribute('src', path);
            }
        }
        load();
    };


    if (Retina.isRetina()) {
        Retina.init(root);
    }
})();

/*! fancyBox v2.1.5 fancyapps.com | fancyapps.com/fancybox/#license */
(function(r,G,f,v){var J=f("html"),n=f(r),p=f(G),b=f.fancybox=function(){b.open.apply(this,arguments)},I=navigator.userAgent.match(/msie/i),B=null,s=G.createTouch!==v,t=function(a){return a&&a.hasOwnProperty&&a instanceof f},q=function(a){return a&&"string"===f.type(a)},E=function(a){return q(a)&&0<a.indexOf("%")},l=function(a,d){var e=parseInt(a,10)||0;d&&E(a)&&(e*=b.getViewport()[d]/100);return Math.ceil(e)},w=function(a,b){return l(a,b)+"px"};f.extend(b,{version:"2.1.5",defaults:{padding:15,margin:20,
width:800,height:600,minWidth:100,minHeight:100,maxWidth:9999,maxHeight:9999,pixelRatio:1,autoSize:!0,autoHeight:!1,autoWidth:!1,autoResize:!0,autoCenter:!s,fitToView:!0,aspectRatio:!1,topRatio:0.5,leftRatio:0.5,scrolling:"auto",wrapCSS:"",arrows:!0,closeBtn:!0,closeClick:!1,nextClick:!1,mouseWheel:!0,autoPlay:!1,playSpeed:3E3,preload:3,modal:!1,loop:!0,ajax:{dataType:"html",headers:{"X-fancyBox":!0}},iframe:{scrolling:"auto",preload:!0},swf:{wmode:"transparent",allowfullscreen:"true",allowscriptaccess:"always"},
keys:{next:{13:"left",34:"up",39:"left",40:"up"},prev:{8:"right",33:"down",37:"right",38:"down"},close:[27],play:[32],toggle:[70]},direction:{next:"left",prev:"right"},scrollOutside:!0,index:0,type:null,href:null,content:null,title:null,tpl:{wrap:'<div class="fancybox-wrap" tabIndex="-1"><div class="fancybox-skin"><div class="fancybox-outer"><div class="fancybox-inner"></div></div></div></div>',image:'<img class="fancybox-image" src="{href}" alt="" />',iframe:'<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen'+
(I?' allowtransparency="true"':"")+"></iframe>",error:'<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',closeBtn:'<a title="Close" class="fancybox-item fancybox-close" href="javascript:;"></a>',next:'<a title="Next" class="fancybox-nav fancybox-next" href="javascript:;"><span></span></a>',prev:'<a title="Previous" class="fancybox-nav fancybox-prev" href="javascript:;"><span></span></a>'},openEffect:"fade",openSpeed:250,openEasing:"swing",openOpacity:!0,
openMethod:"zoomIn",closeEffect:"fade",closeSpeed:250,closeEasing:"swing",closeOpacity:!0,closeMethod:"zoomOut",nextEffect:"elastic",nextSpeed:250,nextEasing:"swing",nextMethod:"changeIn",prevEffect:"elastic",prevSpeed:250,prevEasing:"swing",prevMethod:"changeOut",helpers:{overlay:!0,title:!0},onCancel:f.noop,beforeLoad:f.noop,afterLoad:f.noop,beforeShow:f.noop,afterShow:f.noop,beforeChange:f.noop,beforeClose:f.noop,afterClose:f.noop},group:{},opts:{},previous:null,coming:null,current:null,isActive:!1,
isOpen:!1,isOpened:!1,wrap:null,skin:null,outer:null,inner:null,player:{timer:null,isActive:!1},ajaxLoad:null,imgPreload:null,transitions:{},helpers:{},open:function(a,d){if(a&&(f.isPlainObject(d)||(d={}),!1!==b.close(!0)))return f.isArray(a)||(a=t(a)?f(a).get():[a]),f.each(a,function(e,c){var k={},g,h,j,m,l;"object"===f.type(c)&&(c.nodeType&&(c=f(c)),t(c)?(k={href:c.data("fancybox-href")||c.attr("href"),title:c.data("fancybox-title")||c.attr("title"),isDom:!0,element:c},f.metadata&&f.extend(!0,k,
c.metadata())):k=c);g=d.href||k.href||(q(c)?c:null);h=d.title!==v?d.title:k.title||"";m=(j=d.content||k.content)?"html":d.type||k.type;!m&&k.isDom&&(m=c.data("fancybox-type"),m||(m=(m=c.prop("class").match(/fancybox\.(\w+)/))?m[1]:null));q(g)&&(m||(b.isImage(g)?m="image":b.isSWF(g)?m="swf":"#"===g.charAt(0)?m="inline":q(c)&&(m="html",j=c)),"ajax"===m&&(l=g.split(/\s+/,2),g=l.shift(),l=l.shift()));j||("inline"===m?g?j=f(q(g)?g.replace(/.*(?=#[^\s]+$)/,""):g):k.isDom&&(j=c):"html"===m?j=g:!m&&(!g&&
k.isDom)&&(m="inline",j=c));f.extend(k,{href:g,type:m,content:j,title:h,selector:l});a[e]=k}),b.opts=f.extend(!0,{},b.defaults,d),d.keys!==v&&(b.opts.keys=d.keys?f.extend({},b.defaults.keys,d.keys):!1),b.group=a,b._start(b.opts.index)},cancel:function(){var a=b.coming;a&&!1!==b.trigger("onCancel")&&(b.hideLoading(),b.ajaxLoad&&b.ajaxLoad.abort(),b.ajaxLoad=null,b.imgPreload&&(b.imgPreload.onload=b.imgPreload.onerror=null),a.wrap&&a.wrap.stop(!0,!0).trigger("onReset").remove(),b.coming=null,b.current||
b._afterZoomOut(a))},close:function(a){b.cancel();!1!==b.trigger("beforeClose")&&(b.unbindEvents(),b.isActive&&(!b.isOpen||!0===a?(f(".fancybox-wrap").stop(!0).trigger("onReset").remove(),b._afterZoomOut()):(b.isOpen=b.isOpened=!1,b.isClosing=!0,f(".fancybox-item, .fancybox-nav").remove(),b.wrap.stop(!0,!0).removeClass("fancybox-opened"),b.transitions[b.current.closeMethod]())))},play:function(a){var d=function(){clearTimeout(b.player.timer)},e=function(){d();b.current&&b.player.isActive&&(b.player.timer=
setTimeout(b.next,b.current.playSpeed))},c=function(){d();p.unbind(".player");b.player.isActive=!1;b.trigger("onPlayEnd")};if(!0===a||!b.player.isActive&&!1!==a){if(b.current&&(b.current.loop||b.current.index<b.group.length-1))b.player.isActive=!0,p.bind({"onCancel.player beforeClose.player":c,"onUpdate.player":e,"beforeLoad.player":d}),e(),b.trigger("onPlayStart")}else c()},next:function(a){var d=b.current;d&&(q(a)||(a=d.direction.next),b.jumpto(d.index+1,a,"next"))},prev:function(a){var d=b.current;
d&&(q(a)||(a=d.direction.prev),b.jumpto(d.index-1,a,"prev"))},jumpto:function(a,d,e){var c=b.current;c&&(a=l(a),b.direction=d||c.direction[a>=c.index?"next":"prev"],b.router=e||"jumpto",c.loop&&(0>a&&(a=c.group.length+a%c.group.length),a%=c.group.length),c.group[a]!==v&&(b.cancel(),b._start(a)))},reposition:function(a,d){var e=b.current,c=e?e.wrap:null,k;c&&(k=b._getPosition(d),a&&"scroll"===a.type?(delete k.position,c.stop(!0,!0).animate(k,200)):(c.css(k),e.pos=f.extend({},e.dim,k)))},update:function(a){var d=
a&&a.type,e=!d||"orientationchange"===d;e&&(clearTimeout(B),B=null);b.isOpen&&!B&&(B=setTimeout(function(){var c=b.current;c&&!b.isClosing&&(b.wrap.removeClass("fancybox-tmp"),(e||"load"===d||"resize"===d&&c.autoResize)&&b._setDimension(),"scroll"===d&&c.canShrink||b.reposition(a),b.trigger("onUpdate"),B=null)},e&&!s?0:300))},toggle:function(a){b.isOpen&&(b.current.fitToView="boolean"===f.type(a)?a:!b.current.fitToView,s&&(b.wrap.removeAttr("style").addClass("fancybox-tmp"),b.trigger("onUpdate")),
b.update())},hideLoading:function(){p.unbind(".loading");f("#fancybox-loading").remove()},showLoading:function(){var a,d;b.hideLoading();a=f('<div id="fancybox-loading"><div></div></div>').click(b.cancel).appendTo("body");p.bind("keydown.loading",function(a){if(27===(a.which||a.keyCode))a.preventDefault(),b.cancel()});b.defaults.fixed||(d=b.getViewport(),a.css({position:"absolute",top:0.5*d.h+d.y,left:0.5*d.w+d.x}))},getViewport:function(){var a=b.current&&b.current.locked||!1,d={x:n.scrollLeft(),
y:n.scrollTop()};a?(d.w=a[0].clientWidth,d.h=a[0].clientHeight):(d.w=s&&r.innerWidth?r.innerWidth:n.width(),d.h=s&&r.innerHeight?r.innerHeight:n.height());return d},unbindEvents:function(){b.wrap&&t(b.wrap)&&b.wrap.unbind(".fb");p.unbind(".fb");n.unbind(".fb")},bindEvents:function(){var a=b.current,d;a&&(n.bind("orientationchange.fb"+(s?"":" resize.fb")+(a.autoCenter&&!a.locked?" scroll.fb":""),b.update),(d=a.keys)&&p.bind("keydown.fb",function(e){var c=e.which||e.keyCode,k=e.target||e.srcElement;
if(27===c&&b.coming)return!1;!e.ctrlKey&&(!e.altKey&&!e.shiftKey&&!e.metaKey&&(!k||!k.type&&!f(k).is("[contenteditable]")))&&f.each(d,function(d,k){if(1<a.group.length&&k[c]!==v)return b[d](k[c]),e.preventDefault(),!1;if(-1<f.inArray(c,k))return b[d](),e.preventDefault(),!1})}),f.fn.mousewheel&&a.mouseWheel&&b.wrap.bind("mousewheel.fb",function(d,c,k,g){for(var h=f(d.target||null),j=!1;h.length&&!j&&!h.is(".fancybox-skin")&&!h.is(".fancybox-wrap");)j=h[0]&&!(h[0].style.overflow&&"hidden"===h[0].style.overflow)&&
(h[0].clientWidth&&h[0].scrollWidth>h[0].clientWidth||h[0].clientHeight&&h[0].scrollHeight>h[0].clientHeight),h=f(h).parent();if(0!==c&&!j&&1<b.group.length&&!a.canShrink){if(0<g||0<k)b.prev(0<g?"down":"left");else if(0>g||0>k)b.next(0>g?"up":"right");d.preventDefault()}}))},trigger:function(a,d){var e,c=d||b.coming||b.current;if(c){f.isFunction(c[a])&&(e=c[a].apply(c,Array.prototype.slice.call(arguments,1)));if(!1===e)return!1;c.helpers&&f.each(c.helpers,function(d,e){if(e&&b.helpers[d]&&f.isFunction(b.helpers[d][a]))b.helpers[d][a](f.extend(!0,
{},b.helpers[d].defaults,e),c)});p.trigger(a)}},isImage:function(a){return q(a)&&a.match(/(^data:image\/.*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg)((\?|#).*)?$)/i)},isSWF:function(a){return q(a)&&a.match(/\.(swf)((\?|#).*)?$/i)},_start:function(a){var d={},e,c;a=l(a);e=b.group[a]||null;if(!e)return!1;d=f.extend(!0,{},b.opts,e);e=d.margin;c=d.padding;"number"===f.type(e)&&(d.margin=[e,e,e,e]);"number"===f.type(c)&&(d.padding=[c,c,c,c]);d.modal&&f.extend(!0,d,{closeBtn:!1,closeClick:!1,nextClick:!1,arrows:!1,
mouseWheel:!1,keys:null,helpers:{overlay:{closeClick:!1}}});d.autoSize&&(d.autoWidth=d.autoHeight=!0);"auto"===d.width&&(d.autoWidth=!0);"auto"===d.height&&(d.autoHeight=!0);d.group=b.group;d.index=a;b.coming=d;if(!1===b.trigger("beforeLoad"))b.coming=null;else{c=d.type;e=d.href;if(!c)return b.coming=null,b.current&&b.router&&"jumpto"!==b.router?(b.current.index=a,b[b.router](b.direction)):!1;b.isActive=!0;if("image"===c||"swf"===c)d.autoHeight=d.autoWidth=!1,d.scrolling="visible";"image"===c&&(d.aspectRatio=
!0);"iframe"===c&&s&&(d.scrolling="scroll");d.wrap=f(d.tpl.wrap).addClass("fancybox-"+(s?"mobile":"desktop")+" fancybox-type-"+c+" fancybox-tmp "+d.wrapCSS).appendTo(d.parent||"body");f.extend(d,{skin:f(".fancybox-skin",d.wrap),outer:f(".fancybox-outer",d.wrap),inner:f(".fancybox-inner",d.wrap)});f.each(["Top","Right","Bottom","Left"],function(a,b){d.skin.css("padding"+b,w(d.padding[a]))});b.trigger("onReady");if("inline"===c||"html"===c){if(!d.content||!d.content.length)return b._error("content")}else if(!e)return b._error("href");
"image"===c?b._loadImage():"ajax"===c?b._loadAjax():"iframe"===c?b._loadIframe():b._afterLoad()}},_error:function(a){f.extend(b.coming,{type:"html",autoWidth:!0,autoHeight:!0,minWidth:0,minHeight:0,scrolling:"no",hasError:a,content:b.coming.tpl.error});b._afterLoad()},_loadImage:function(){var a=b.imgPreload=new Image;a.onload=function(){this.onload=this.onerror=null;b.coming.width=this.width/b.opts.pixelRatio;b.coming.height=this.height/b.opts.pixelRatio;b._afterLoad()};a.onerror=function(){this.onload=
this.onerror=null;b._error("image")};a.src=b.coming.href;!0!==a.complete&&b.showLoading()},_loadAjax:function(){var a=b.coming;b.showLoading();b.ajaxLoad=f.ajax(f.extend({},a.ajax,{url:a.href,error:function(a,e){b.coming&&"abort"!==e?b._error("ajax",a):b.hideLoading()},success:function(d,e){"success"===e&&(a.content=d,b._afterLoad())}}))},_loadIframe:function(){var a=b.coming,d=f(a.tpl.iframe.replace(/\{rnd\}/g,(new Date).getTime())).attr("scrolling",s?"auto":a.iframe.scrolling).attr("src",a.href);
f(a.wrap).bind("onReset",function(){try{f(this).find("iframe").hide().attr("src","//about:blank").end().empty()}catch(a){}});a.iframe.preload&&(b.showLoading(),d.one("load",function(){f(this).data("ready",1);s||f(this).bind("load.fb",b.update);f(this).parents(".fancybox-wrap").width("100%").removeClass("fancybox-tmp").show();b._afterLoad()}));a.content=d.appendTo(a.inner);a.iframe.preload||b._afterLoad()},_preloadImages:function(){var a=b.group,d=b.current,e=a.length,c=d.preload?Math.min(d.preload,
e-1):0,f,g;for(g=1;g<=c;g+=1)f=a[(d.index+g)%e],"image"===f.type&&f.href&&((new Image).src=f.href)},_afterLoad:function(){var a=b.coming,d=b.current,e,c,k,g,h;b.hideLoading();if(a&&!1!==b.isActive)if(!1===b.trigger("afterLoad",a,d))a.wrap.stop(!0).trigger("onReset").remove(),b.coming=null;else{d&&(b.trigger("beforeChange",d),d.wrap.stop(!0).removeClass("fancybox-opened").find(".fancybox-item, .fancybox-nav").remove());b.unbindEvents();e=a.content;c=a.type;k=a.scrolling;f.extend(b,{wrap:a.wrap,skin:a.skin,
outer:a.outer,inner:a.inner,current:a,previous:d});g=a.href;switch(c){case "inline":case "ajax":case "html":a.selector?e=f("<div>").html(e).find(a.selector):t(e)&&(e.data("fancybox-placeholder")||e.data("fancybox-placeholder",f('<div class="fancybox-placeholder"></div>').insertAfter(e).hide()),e=e.show().detach(),a.wrap.bind("onReset",function(){f(this).find(e).length&&e.hide().replaceAll(e.data("fancybox-placeholder")).data("fancybox-placeholder",!1)}));break;case "image":e=a.tpl.image.replace("{href}",
g);break;case "swf":e='<object id="fancybox-swf" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%"><param name="movie" value="'+g+'"></param>',h="",f.each(a.swf,function(a,b){e+='<param name="'+a+'" value="'+b+'"></param>';h+=" "+a+'="'+b+'"'}),e+='<embed src="'+g+'" type="application/x-shockwave-flash" width="100%" height="100%"'+h+"></embed></object>"}(!t(e)||!e.parent().is(a.inner))&&a.inner.append(e);b.trigger("beforeShow");a.inner.css("overflow","yes"===k?"scroll":
"no"===k?"hidden":k);b._setDimension();b.reposition();b.isOpen=!1;b.coming=null;b.bindEvents();if(b.isOpened){if(d.prevMethod)b.transitions[d.prevMethod]()}else f(".fancybox-wrap").not(a.wrap).stop(!0).trigger("onReset").remove();b.transitions[b.isOpened?a.nextMethod:a.openMethod]();b._preloadImages()}},_setDimension:function(){var a=b.getViewport(),d=0,e=!1,c=!1,e=b.wrap,k=b.skin,g=b.inner,h=b.current,c=h.width,j=h.height,m=h.minWidth,u=h.minHeight,n=h.maxWidth,p=h.maxHeight,s=h.scrolling,q=h.scrollOutside?
h.scrollbarWidth:0,x=h.margin,y=l(x[1]+x[3]),r=l(x[0]+x[2]),v,z,t,C,A,F,B,D,H;e.add(k).add(g).width("auto").height("auto").removeClass("fancybox-tmp");x=l(k.outerWidth(!0)-k.width());v=l(k.outerHeight(!0)-k.height());z=y+x;t=r+v;C=E(c)?(a.w-z)*l(c)/100:c;A=E(j)?(a.h-t)*l(j)/100:j;if("iframe"===h.type){if(H=h.content,h.autoHeight&&1===H.data("ready"))try{H[0].contentWindow.document.location&&(g.width(C).height(9999),F=H.contents().find("body"),q&&F.css("overflow-x","hidden"),A=F.outerHeight(!0))}catch(G){}}else if(h.autoWidth||
h.autoHeight)g.addClass("fancybox-tmp"),h.autoWidth||g.width(C),h.autoHeight||g.height(A),h.autoWidth&&(C=g.width()),h.autoHeight&&(A=g.height()),g.removeClass("fancybox-tmp");c=l(C);j=l(A);D=C/A;m=l(E(m)?l(m,"w")-z:m);n=l(E(n)?l(n,"w")-z:n);u=l(E(u)?l(u,"h")-t:u);p=l(E(p)?l(p,"h")-t:p);F=n;B=p;h.fitToView&&(n=Math.min(a.w-z,n),p=Math.min(a.h-t,p));z=a.w-y;r=a.h-r;h.aspectRatio?(c>n&&(c=n,j=l(c/D)),j>p&&(j=p,c=l(j*D)),c<m&&(c=m,j=l(c/D)),j<u&&(j=u,c=l(j*D))):(c=Math.max(m,Math.min(c,n)),h.autoHeight&&
"iframe"!==h.type&&(g.width(c),j=g.height()),j=Math.max(u,Math.min(j,p)));if(h.fitToView)if(g.width(c).height(j),e.width(c+x),a=e.width(),y=e.height(),h.aspectRatio)for(;(a>z||y>r)&&(c>m&&j>u)&&!(19<d++);)j=Math.max(u,Math.min(p,j-10)),c=l(j*D),c<m&&(c=m,j=l(c/D)),c>n&&(c=n,j=l(c/D)),g.width(c).height(j),e.width(c+x),a=e.width(),y=e.height();else c=Math.max(m,Math.min(c,c-(a-z))),j=Math.max(u,Math.min(j,j-(y-r)));q&&("auto"===s&&j<A&&c+x+q<z)&&(c+=q);g.width(c).height(j);e.width(c+x);a=e.width();
y=e.height();e=(a>z||y>r)&&c>m&&j>u;c=h.aspectRatio?c<F&&j<B&&c<C&&j<A:(c<F||j<B)&&(c<C||j<A);f.extend(h,{dim:{width:w(a),height:w(y)},origWidth:C,origHeight:A,canShrink:e,canExpand:c,wPadding:x,hPadding:v,wrapSpace:y-k.outerHeight(!0),skinSpace:k.height()-j});!H&&(h.autoHeight&&j>u&&j<p&&!c)&&g.height("auto")},_getPosition:function(a){var d=b.current,e=b.getViewport(),c=d.margin,f=b.wrap.width()+c[1]+c[3],g=b.wrap.height()+c[0]+c[2],c={position:"absolute",top:c[0],left:c[3]};d.autoCenter&&d.fixed&&
!a&&g<=e.h&&f<=e.w?c.position="fixed":d.locked||(c.top+=e.y,c.left+=e.x);c.top=w(Math.max(c.top,c.top+(e.h-g)*d.topRatio));c.left=w(Math.max(c.left,c.left+(e.w-f)*d.leftRatio));return c},_afterZoomIn:function(){var a=b.current;a&&(b.isOpen=b.isOpened=!0,b.wrap.css("overflow","visible").addClass("fancybox-opened"),b.update(),(a.closeClick||a.nextClick&&1<b.group.length)&&b.inner.css("cursor","pointer").bind("click.fb",function(d){!f(d.target).is("a")&&!f(d.target).parent().is("a")&&(d.preventDefault(),
b[a.closeClick?"close":"next"]())}),a.closeBtn&&f(a.tpl.closeBtn).appendTo(b.skin).bind("click.fb",function(a){a.preventDefault();b.close()}),a.arrows&&1<b.group.length&&((a.loop||0<a.index)&&f(a.tpl.prev).appendTo(b.outer).bind("click.fb",b.prev),(a.loop||a.index<b.group.length-1)&&f(a.tpl.next).appendTo(b.outer).bind("click.fb",b.next)),b.trigger("afterShow"),!a.loop&&a.index===a.group.length-1?b.play(!1):b.opts.autoPlay&&!b.player.isActive&&(b.opts.autoPlay=!1,b.play()))},_afterZoomOut:function(a){a=
a||b.current;f(".fancybox-wrap").trigger("onReset").remove();f.extend(b,{group:{},opts:{},router:!1,current:null,isActive:!1,isOpened:!1,isOpen:!1,isClosing:!1,wrap:null,skin:null,outer:null,inner:null});b.trigger("afterClose",a)}});b.transitions={getOrigPosition:function(){var a=b.current,d=a.element,e=a.orig,c={},f=50,g=50,h=a.hPadding,j=a.wPadding,m=b.getViewport();!e&&(a.isDom&&d.is(":visible"))&&(e=d.find("img:first"),e.length||(e=d));t(e)?(c=e.offset(),e.is("img")&&(f=e.outerWidth(),g=e.outerHeight())):
(c.top=m.y+(m.h-g)*a.topRatio,c.left=m.x+(m.w-f)*a.leftRatio);if("fixed"===b.wrap.css("position")||a.locked)c.top-=m.y,c.left-=m.x;return c={top:w(c.top-h*a.topRatio),left:w(c.left-j*a.leftRatio),width:w(f+j),height:w(g+h)}},step:function(a,d){var e,c,f=d.prop;c=b.current;var g=c.wrapSpace,h=c.skinSpace;if("width"===f||"height"===f)e=d.end===d.start?1:(a-d.start)/(d.end-d.start),b.isClosing&&(e=1-e),c="width"===f?c.wPadding:c.hPadding,c=a-c,b.skin[f](l("width"===f?c:c-g*e)),b.inner[f](l("width"===
f?c:c-g*e-h*e))},zoomIn:function(){var a=b.current,d=a.pos,e=a.openEffect,c="elastic"===e,k=f.extend({opacity:1},d);delete k.position;c?(d=this.getOrigPosition(),a.openOpacity&&(d.opacity=0.1)):"fade"===e&&(d.opacity=0.1);b.wrap.css(d).animate(k,{duration:"none"===e?0:a.openSpeed,easing:a.openEasing,step:c?this.step:null,complete:b._afterZoomIn})},zoomOut:function(){var a=b.current,d=a.closeEffect,e="elastic"===d,c={opacity:0.1};e&&(c=this.getOrigPosition(),a.closeOpacity&&(c.opacity=0.1));b.wrap.animate(c,
{duration:"none"===d?0:a.closeSpeed,easing:a.closeEasing,step:e?this.step:null,complete:b._afterZoomOut})},changeIn:function(){var a=b.current,d=a.nextEffect,e=a.pos,c={opacity:1},f=b.direction,g;e.opacity=0.1;"elastic"===d&&(g="down"===f||"up"===f?"top":"left","down"===f||"right"===f?(e[g]=w(l(e[g])-200),c[g]="+=200px"):(e[g]=w(l(e[g])+200),c[g]="-=200px"));"none"===d?b._afterZoomIn():b.wrap.css(e).animate(c,{duration:a.nextSpeed,easing:a.nextEasing,complete:b._afterZoomIn})},changeOut:function(){var a=
b.previous,d=a.prevEffect,e={opacity:0.1},c=b.direction;"elastic"===d&&(e["down"===c||"up"===c?"top":"left"]=("up"===c||"left"===c?"-":"+")+"=200px");a.wrap.animate(e,{duration:"none"===d?0:a.prevSpeed,easing:a.prevEasing,complete:function(){f(this).trigger("onReset").remove()}})}};b.helpers.overlay={defaults:{closeClick:!0,speedOut:200,showEarly:!0,css:{},locked:!s,fixed:!0},overlay:null,fixed:!1,el:f("html"),create:function(a){a=f.extend({},this.defaults,a);this.overlay&&this.close();this.overlay=
f('<div class="fancybox-overlay"></div>').appendTo(b.coming?b.coming.parent:a.parent);this.fixed=!1;a.fixed&&b.defaults.fixed&&(this.overlay.addClass("fancybox-overlay-fixed"),this.fixed=!0)},open:function(a){var d=this;a=f.extend({},this.defaults,a);this.overlay?this.overlay.unbind(".overlay").width("auto").height("auto"):this.create(a);this.fixed||(n.bind("resize.overlay",f.proxy(this.update,this)),this.update());a.closeClick&&this.overlay.bind("click.overlay",function(a){if(f(a.target).hasClass("fancybox-overlay"))return b.isActive?
b.close():d.close(),!1});this.overlay.css(a.css).show()},close:function(){var a,b;n.unbind("resize.overlay");this.el.hasClass("fancybox-lock")&&(f(".fancybox-margin").removeClass("fancybox-margin"),a=n.scrollTop(),b=n.scrollLeft(),this.el.removeClass("fancybox-lock"),n.scrollTop(a).scrollLeft(b));f(".fancybox-overlay").remove().hide();f.extend(this,{overlay:null,fixed:!1})},update:function(){var a="100%",b;this.overlay.width(a).height("100%");I?(b=Math.max(G.documentElement.offsetWidth,G.body.offsetWidth),
p.width()>b&&(a=p.width())):p.width()>n.width()&&(a=p.width());this.overlay.width(a).height(p.height())},onReady:function(a,b){var e=this.overlay;f(".fancybox-overlay").stop(!0,!0);e||this.create(a);a.locked&&(this.fixed&&b.fixed)&&(e||(this.margin=p.height()>n.height()?f("html").css("margin-right").replace("px",""):!1),b.locked=this.overlay.append(b.wrap),b.fixed=!1);!0===a.showEarly&&this.beforeShow.apply(this,arguments)},beforeShow:function(a,b){var e,c;b.locked&&(!1!==this.margin&&(f("*").filter(function(){return"fixed"===
f(this).css("position")&&!f(this).hasClass("fancybox-overlay")&&!f(this).hasClass("fancybox-wrap")}).addClass("fancybox-margin"),this.el.addClass("fancybox-margin")),e=n.scrollTop(),c=n.scrollLeft(),this.el.addClass("fancybox-lock"),n.scrollTop(e).scrollLeft(c));this.open(a)},onUpdate:function(){this.fixed||this.update()},afterClose:function(a){this.overlay&&!b.coming&&this.overlay.fadeOut(a.speedOut,f.proxy(this.close,this))}};b.helpers.title={defaults:{type:"float",position:"bottom"},beforeShow:function(a){var d=
b.current,e=d.title,c=a.type;f.isFunction(e)&&(e=e.call(d.element,d));if(q(e)&&""!==f.trim(e)){d=f('<div class="fancybox-title fancybox-title-'+c+'-wrap">'+e+"</div>");switch(c){case "inside":c=b.skin;break;case "outside":c=b.wrap;break;case "over":c=b.inner;break;default:c=b.skin,d.appendTo("body"),I&&d.width(d.width()),d.wrapInner('<span class="child"></span>'),b.current.margin[2]+=Math.abs(l(d.css("margin-bottom")))}d["top"===a.position?"prependTo":"appendTo"](c)}}};f.fn.fancybox=function(a){var d,
e=f(this),c=this.selector||"",k=function(g){var h=f(this).blur(),j=d,k,l;!g.ctrlKey&&(!g.altKey&&!g.shiftKey&&!g.metaKey)&&!h.is(".fancybox-wrap")&&(k=a.groupAttr||"data-fancybox-group",l=h.attr(k),l||(k="rel",l=h.get(0)[k]),l&&(""!==l&&"nofollow"!==l)&&(h=c.length?f(c):e,h=h.filter("["+k+'="'+l+'"]'),j=h.index(this)),a.index=j,!1!==b.open(h,a)&&g.preventDefault())};a=a||{};d=a.index||0;!c||!1===a.live?e.unbind("click.fb-start").bind("click.fb-start",k):p.undelegate(c,"click.fb-start").delegate(c+
":not('.fancybox-item, .fancybox-nav')","click.fb-start",k);this.filter("[data-fancybox-start=1]").trigger("click");return this};p.ready(function(){var a,d;f.scrollbarWidth===v&&(f.scrollbarWidth=function(){var a=f('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo("body"),b=a.children(),b=b.innerWidth()-b.height(99).innerWidth();a.remove();return b});if(f.support.fixedPosition===v){a=f.support;d=f('<div style="position:fixed;top:20px;"></div>').appendTo("body");var e=20===
d[0].offsetTop||15===d[0].offsetTop;d.remove();a.fixedPosition=e}f.extend(b.defaults,{scrollbarWidth:f.scrollbarWidth(),fixed:f.support.fixedPosition,parent:f("body")});a=f(r).width();J.addClass("fancybox-lock-test");d=f(r).width();J.removeClass("fancybox-lock-test");f("<style type='text/css'>.fancybox-margin{margin-right:"+(d-a)+"px;}</style>").appendTo("head")})})(window,document,jQuery);
$(document).ready(function() {
    $("iframe[src*=insigit]").css("display", "none");

    /***************** Waypoints ******************/
    $('.wp1').waypoint(function() {
        $('.wp1').addClass('animated fadeInUp');
    }, {
        offset: '75%'
    });
    $('.wp2').waypoint(function() {
        $('.wp2').addClass('animated fadeInUp');
    }, {
        offset: '75%'
    });
    $('.wp3').waypoint(function() {
        $('.wp3').addClass('animated fadeInRight');
    }, {
        offset: '75%'
    });
    $('.wp4').waypoint(function() {
        $('.wp4').addClass('animated fadeInUp');
    }, {
        offset: '95%'
    });
    $('.wp5').waypoint(function() {
        $('.wp5').addClass('animated fadeInUp');
    }, {
        offset: '93%'
    });
    $('.wp6').waypoint(function() {
        $('.wp6').addClass('animated fadeInUp');
    }, {
        offset: '90%'
    });

    /***************** Initiate Flexslider ******************/
    $('.flexslider').flexslider({
        animation: "slide",
        slideshowSpeed: 10000,
        animationDuration: 400,
        pauseOnHover: true
    });

    /***************** Initiate Fancybox ******************/
    $('.single_image').fancybox({
        padding: 4,
    });

    /***************** Tooltips ******************/
    //$('[data-toggle="tooltip"]').tooltip();

    /***************** Nav Transformicon ******************/
    /* When user clicks the Icon */
    $('.nav-toggle').click(function() {
        $(this).toggleClass('active');
        $('.header-nav').toggleClass('open');
        event.preventDefault();
    });
    /* When user clicks a link */
    $('.header-nav li a').click(function() {
        $('.nav-toggle').toggleClass('active');
        $('.header-nav').toggleClass('open');
    });

    /***************** Header BG Scroll ******************/
    $(function() {
        var scroll = {
            control: {
                fixeds: function() {
                    $('section.navigation').addClass('fixed');
                    $('section.navigation').removeClass('not-fixed');
                    $('header').css({
                        "border-bottom": "solid 1px rgba(255, 255, 255, 0)",
                        "padding": "10px 0"
                    });
                    $('header .member-actions').css({
                        "top": "17px",
                    });
                    $('header .navicon').css({
                        "top": "23px",
                    });
                },
                notfixed: function() {
                    $('section.navigation').removeClass('fixed');
                    $('section.navigation').addClass('not-fixed');
                    $('header').css({
                        "border-bottom": "solid 1px rgba(255, 255, 255, 0.2)",
                        "padding": "10px 0"
                    });
                    $('header .member-actions').css({
                        "top": "17px",
                    });
                    $('header .navicon').css({
                        "top": "23px",
                    });
                },
                init: function() {
                    var scroll = $(window).scrollTop();

                    if (scroll >= 20) {
                        this.fixeds();
                    } else {
                        this.notfixed();
                    }   
                },
                events: function() {
                    var self = this;
                    self.init();

                    $(window).scroll(function() {
                        self.init();
                    });
                }
            }
        }

        scroll.control.events();
    });

    /***************** Smooth Scrolling ******************/
    $(function() {
        $('a[href*=#]:not([href=#])').click(function() {
            var href = $(this).attr('href').replace(/#.*$/, '');
            if (href === '') {
//            if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                if (target.length) {
                    $('html,body').animate({
                        scrollTop: target.offset().top - $('.navigation').height()
                    }, 1000);
                    return false;
                }
            }
        });
    });
});
/*
 * jQuery FlexSlider v2.5.0
 * Copyright 2012 WooThemes
 * Contributing Author: Tyler Smith
 */!function($){$.flexslider=function(e,t){var a=$(e);a.vars=$.extend({},$.flexslider.defaults,t);var n=a.vars.namespace,i=window.navigator&&window.navigator.msPointerEnabled&&window.MSGesture,s=("ontouchstart"in window||i||window.DocumentTouch&&document instanceof DocumentTouch)&&a.vars.touch,r="click touchend MSPointerUp keyup",o="",l,c="vertical"===a.vars.direction,d=a.vars.reverse,u=a.vars.itemWidth>0,v="fade"===a.vars.animation,p=""!==a.vars.asNavFor,m={},f=!0;$.data(e,"flexslider",a),m={init:function(){a.animating=!1,a.currentSlide=parseInt(a.vars.startAt?a.vars.startAt:0,10),isNaN(a.currentSlide)&&(a.currentSlide=0),a.animatingTo=a.currentSlide,a.atEnd=0===a.currentSlide||a.currentSlide===a.last,a.containerSelector=a.vars.selector.substr(0,a.vars.selector.search(" ")),a.slides=$(a.vars.selector,a),a.container=$(a.containerSelector,a),a.count=a.slides.length,a.syncExists=$(a.vars.sync).length>0,"slide"===a.vars.animation&&(a.vars.animation="swing"),a.prop=c?"top":"marginLeft",a.args={},a.manualPause=!1,a.stopped=!1,a.started=!1,a.startTimeout=null,a.transitions=!a.vars.video&&!v&&a.vars.useCSS&&function(){var e=document.createElement("div"),t=["perspectiveProperty","WebkitPerspective","MozPerspective","OPerspective","msPerspective"];for(var n in t)if(void 0!==e.style[t[n]])return a.pfx=t[n].replace("Perspective","").toLowerCase(),a.prop="-"+a.pfx+"-transform",!0;return!1}(),a.ensureAnimationEnd="",""!==a.vars.controlsContainer&&(a.controlsContainer=$(a.vars.controlsContainer).length>0&&$(a.vars.controlsContainer)),""!==a.vars.manualControls&&(a.manualControls=$(a.vars.manualControls).length>0&&$(a.vars.manualControls)),""!==a.vars.customDirectionNav&&(a.customDirectionNav=2===$(a.vars.customDirectionNav).length&&$(a.vars.customDirectionNav)),a.vars.randomize&&(a.slides.sort(function(){return Math.round(Math.random())-.5}),a.container.empty().append(a.slides)),a.doMath(),a.setup("init"),a.vars.controlNav&&m.controlNav.setup(),a.vars.directionNav&&m.directionNav.setup(),a.vars.keyboard&&(1===$(a.containerSelector).length||a.vars.multipleKeyboard)&&$(document).bind("keyup",function(e){var t=e.keyCode;if(!a.animating&&(39===t||37===t)){var n=39===t?a.getTarget("next"):37===t?a.getTarget("prev"):!1;a.flexAnimate(n,a.vars.pauseOnAction)}}),a.vars.mousewheel&&a.bind("mousewheel",function(e,t,n,i){e.preventDefault();var s=a.getTarget(0>t?"next":"prev");a.flexAnimate(s,a.vars.pauseOnAction)}),a.vars.pausePlay&&m.pausePlay.setup(),a.vars.slideshow&&a.vars.pauseInvisible&&m.pauseInvisible.init(),a.vars.slideshow&&(a.vars.pauseOnHover&&a.hover(function(){a.manualPlay||a.manualPause||a.pause()},function(){a.manualPause||a.manualPlay||a.stopped||a.play()}),a.vars.pauseInvisible&&m.pauseInvisible.isHidden()||(a.vars.initDelay>0?a.startTimeout=setTimeout(a.play,a.vars.initDelay):a.play())),p&&m.asNav.setup(),s&&a.vars.touch&&m.touch(),(!v||v&&a.vars.smoothHeight)&&$(window).bind("resize orientationchange focus",m.resize),a.find("img").attr("draggable","false"),setTimeout(function(){a.vars.start(a)},200)},asNav:{setup:function(){a.asNav=!0,a.animatingTo=Math.floor(a.currentSlide/a.move),a.currentItem=a.currentSlide,a.slides.removeClass(n+"active-slide").eq(a.currentItem).addClass(n+"active-slide"),i?(e._slider=a,a.slides.each(function(){var e=this;e._gesture=new MSGesture,e._gesture.target=e,e.addEventListener("MSPointerDown",function(e){e.preventDefault(),e.currentTarget._gesture&&e.currentTarget._gesture.addPointer(e.pointerId)},!1),e.addEventListener("MSGestureTap",function(e){e.preventDefault();var t=$(this),n=t.index();$(a.vars.asNavFor).data("flexslider").animating||t.hasClass("active")||(a.direction=a.currentItem<n?"next":"prev",a.flexAnimate(n,a.vars.pauseOnAction,!1,!0,!0))})})):a.slides.on(r,function(e){e.preventDefault();var t=$(this),i=t.index(),s=t.offset().left-$(a).scrollLeft();0>=s&&t.hasClass(n+"active-slide")?a.flexAnimate(a.getTarget("prev"),!0):$(a.vars.asNavFor).data("flexslider").animating||t.hasClass(n+"active-slide")||(a.direction=a.currentItem<i?"next":"prev",a.flexAnimate(i,a.vars.pauseOnAction,!1,!0,!0))})}},controlNav:{setup:function(){a.manualControls?m.controlNav.setupManual():m.controlNav.setupPaging()},setupPaging:function(){var e="thumbnails"===a.vars.controlNav?"control-thumbs":"control-paging",t=1,i,s;if(a.controlNavScaffold=$('<ol class="'+n+"control-nav "+n+e+'"></ol>'),a.pagingCount>1)for(var l=0;l<a.pagingCount;l++){if(s=a.slides.eq(l),i="thumbnails"===a.vars.controlNav?'<img src="'+s.attr("data-thumb")+'"/>':"<a>"+t+"</a>","thumbnails"===a.vars.controlNav&&!0===a.vars.thumbCaptions){var c=s.attr("data-thumbcaption");""!==c&&void 0!==c&&(i+='<span class="'+n+'caption">'+c+"</span>")}a.controlNavScaffold.append("<li>"+i+"</li>"),t++}a.controlsContainer?$(a.controlsContainer).append(a.controlNavScaffold):a.append(a.controlNavScaffold),m.controlNav.set(),m.controlNav.active(),a.controlNavScaffold.delegate("a, img",r,function(e){if(e.preventDefault(),""===o||o===e.type){var t=$(this),i=a.controlNav.index(t);t.hasClass(n+"active")||(a.direction=i>a.currentSlide?"next":"prev",a.flexAnimate(i,a.vars.pauseOnAction))}""===o&&(o=e.type),m.setToClearWatchedEvent()})},setupManual:function(){a.controlNav=a.manualControls,m.controlNav.active(),a.controlNav.bind(r,function(e){if(e.preventDefault(),""===o||o===e.type){var t=$(this),i=a.controlNav.index(t);t.hasClass(n+"active")||(a.direction=i>a.currentSlide?"next":"prev",a.flexAnimate(i,a.vars.pauseOnAction))}""===o&&(o=e.type),m.setToClearWatchedEvent()})},set:function(){var e="thumbnails"===a.vars.controlNav?"img":"a";a.controlNav=$("."+n+"control-nav li "+e,a.controlsContainer?a.controlsContainer:a)},active:function(){a.controlNav.removeClass(n+"active").eq(a.animatingTo).addClass(n+"active")},update:function(e,t){a.pagingCount>1&&"add"===e?a.controlNavScaffold.append($("<li><a>"+a.count+"</a></li>")):1===a.pagingCount?a.controlNavScaffold.find("li").remove():a.controlNav.eq(t).closest("li").remove(),m.controlNav.set(),a.pagingCount>1&&a.pagingCount!==a.controlNav.length?a.update(t,e):m.controlNav.active()}},directionNav:{setup:function(){var e=$('<ul class="'+n+'direction-nav"><li class="'+n+'nav-prev"><a class="'+n+'prev" href="#">'+a.vars.prevText+'</a></li><li class="'+n+'nav-next"><a class="'+n+'next" href="#">'+a.vars.nextText+"</a></li></ul>");a.customDirectionNav?a.directionNav=a.customDirectionNav:a.controlsContainer?($(a.controlsContainer).append(e),a.directionNav=$("."+n+"direction-nav li a",a.controlsContainer)):(a.append(e),a.directionNav=$("."+n+"direction-nav li a",a)),m.directionNav.update(),a.directionNav.bind(r,function(e){e.preventDefault();var t;(""===o||o===e.type)&&(t=a.getTarget($(this).hasClass(n+"next")?"next":"prev"),a.flexAnimate(t,a.vars.pauseOnAction)),""===o&&(o=e.type),m.setToClearWatchedEvent()})},update:function(){var e=n+"disabled";1===a.pagingCount?a.directionNav.addClass(e).attr("tabindex","-1"):a.vars.animationLoop?a.directionNav.removeClass(e).removeAttr("tabindex"):0===a.animatingTo?a.directionNav.removeClass(e).filter("."+n+"prev").addClass(e).attr("tabindex","-1"):a.animatingTo===a.last?a.directionNav.removeClass(e).filter("."+n+"next").addClass(e).attr("tabindex","-1"):a.directionNav.removeClass(e).removeAttr("tabindex")}},pausePlay:{setup:function(){var e=$('<div class="'+n+'pauseplay"><a></a></div>');a.controlsContainer?(a.controlsContainer.append(e),a.pausePlay=$("."+n+"pauseplay a",a.controlsContainer)):(a.append(e),a.pausePlay=$("."+n+"pauseplay a",a)),m.pausePlay.update(a.vars.slideshow?n+"pause":n+"play"),a.pausePlay.bind(r,function(e){e.preventDefault(),(""===o||o===e.type)&&($(this).hasClass(n+"pause")?(a.manualPause=!0,a.manualPlay=!1,a.pause()):(a.manualPause=!1,a.manualPlay=!0,a.play())),""===o&&(o=e.type),m.setToClearWatchedEvent()})},update:function(e){"play"===e?a.pausePlay.removeClass(n+"pause").addClass(n+"play").html(a.vars.playText):a.pausePlay.removeClass(n+"play").addClass(n+"pause").html(a.vars.pauseText)}},touch:function(){function t(t){t.stopPropagation(),a.animating?t.preventDefault():(a.pause(),e._gesture.addPointer(t.pointerId),w=0,p=c?a.h:a.w,f=Number(new Date),l=u&&d&&a.animatingTo===a.last?0:u&&d?a.limit-(a.itemW+a.vars.itemMargin)*a.move*a.animatingTo:u&&a.currentSlide===a.last?a.limit:u?(a.itemW+a.vars.itemMargin)*a.move*a.currentSlide:d?(a.last-a.currentSlide+a.cloneOffset)*p:(a.currentSlide+a.cloneOffset)*p)}function n(t){t.stopPropagation();var a=t.target._slider;if(a){var n=-t.translationX,i=-t.translationY;return w+=c?i:n,m=w,y=c?Math.abs(w)<Math.abs(-n):Math.abs(w)<Math.abs(-i),t.detail===t.MSGESTURE_FLAG_INERTIA?void setImmediate(function(){e._gesture.stop()}):void((!y||Number(new Date)-f>500)&&(t.preventDefault(),!v&&a.transitions&&(a.vars.animationLoop||(m=w/(0===a.currentSlide&&0>w||a.currentSlide===a.last&&w>0?Math.abs(w)/p+2:1)),a.setProps(l+m,"setTouch"))))}}function s(e){e.stopPropagation();var t=e.target._slider;if(t){if(t.animatingTo===t.currentSlide&&!y&&null!==m){var a=d?-m:m,n=t.getTarget(a>0?"next":"prev");t.canAdvance(n)&&(Number(new Date)-f<550&&Math.abs(a)>50||Math.abs(a)>p/2)?t.flexAnimate(n,t.vars.pauseOnAction):v||t.flexAnimate(t.currentSlide,t.vars.pauseOnAction,!0)}r=null,o=null,m=null,l=null,w=0}}var r,o,l,p,m,f,g,h,S,y=!1,x=0,b=0,w=0;i?(e.style.msTouchAction="none",e._gesture=new MSGesture,e._gesture.target=e,e.addEventListener("MSPointerDown",t,!1),e._slider=a,e.addEventListener("MSGestureChange",n,!1),e.addEventListener("MSGestureEnd",s,!1)):(g=function(t){a.animating?t.preventDefault():(window.navigator.msPointerEnabled||1===t.touches.length)&&(a.pause(),p=c?a.h:a.w,f=Number(new Date),x=t.touches[0].pageX,b=t.touches[0].pageY,l=u&&d&&a.animatingTo===a.last?0:u&&d?a.limit-(a.itemW+a.vars.itemMargin)*a.move*a.animatingTo:u&&a.currentSlide===a.last?a.limit:u?(a.itemW+a.vars.itemMargin)*a.move*a.currentSlide:d?(a.last-a.currentSlide+a.cloneOffset)*p:(a.currentSlide+a.cloneOffset)*p,r=c?b:x,o=c?x:b,e.addEventListener("touchmove",h,!1),e.addEventListener("touchend",S,!1))},h=function(e){x=e.touches[0].pageX,b=e.touches[0].pageY,m=c?r-b:r-x,y=c?Math.abs(m)<Math.abs(x-o):Math.abs(m)<Math.abs(b-o);var t=500;(!y||Number(new Date)-f>t)&&(e.preventDefault(),!v&&a.transitions&&(a.vars.animationLoop||(m/=0===a.currentSlide&&0>m||a.currentSlide===a.last&&m>0?Math.abs(m)/p+2:1),a.setProps(l+m,"setTouch")))},S=function(t){if(e.removeEventListener("touchmove",h,!1),a.animatingTo===a.currentSlide&&!y&&null!==m){var n=d?-m:m,i=a.getTarget(n>0?"next":"prev");a.canAdvance(i)&&(Number(new Date)-f<550&&Math.abs(n)>50||Math.abs(n)>p/2)?a.flexAnimate(i,a.vars.pauseOnAction):v||a.flexAnimate(a.currentSlide,a.vars.pauseOnAction,!0)}e.removeEventListener("touchend",S,!1),r=null,o=null,m=null,l=null},e.addEventListener("touchstart",g,!1))},resize:function(){!a.animating&&a.is(":visible")&&(u||a.doMath(),v?m.smoothHeight():u?(a.slides.width(a.computedW),a.update(a.pagingCount),a.setProps()):c?(a.viewport.height(a.h),a.setProps(a.h,"setTotal")):(a.vars.smoothHeight&&m.smoothHeight(),a.newSlides.width(a.computedW),a.setProps(a.computedW,"setTotal")))},smoothHeight:function(e){if(!c||v){var t=v?a:a.viewport;e?t.animate({height:a.slides.eq(a.animatingTo).height()},e):t.height(a.slides.eq(a.animatingTo).height())}},sync:function(e){var t=$(a.vars.sync).data("flexslider"),n=a.animatingTo;switch(e){case"animate":t.flexAnimate(n,a.vars.pauseOnAction,!1,!0);break;case"play":t.playing||t.asNav||t.play();break;case"pause":t.pause()}},uniqueID:function(e){return e.filter("[id]").add(e.find("[id]")).each(function(){var e=$(this);e.attr("id",e.attr("id")+"_clone")}),e},pauseInvisible:{visProp:null,init:function(){var e=m.pauseInvisible.getHiddenProp();if(e){var t=e.replace(/[H|h]idden/,"")+"visibilitychange";document.addEventListener(t,function(){m.pauseInvisible.isHidden()?a.startTimeout?clearTimeout(a.startTimeout):a.pause():a.started?a.play():a.vars.initDelay>0?setTimeout(a.play,a.vars.initDelay):a.play()})}},isHidden:function(){var e=m.pauseInvisible.getHiddenProp();return e?document[e]:!1},getHiddenProp:function(){var e=["webkit","moz","ms","o"];if("hidden"in document)return"hidden";for(var t=0;t<e.length;t++)if(e[t]+"Hidden"in document)return e[t]+"Hidden";return null}},setToClearWatchedEvent:function(){clearTimeout(l),l=setTimeout(function(){o=""},3e3)}},a.flexAnimate=function(e,t,i,r,o){if(a.vars.animationLoop||e===a.currentSlide||(a.direction=e>a.currentSlide?"next":"prev"),p&&1===a.pagingCount&&(a.direction=a.currentItem<e?"next":"prev"),!a.animating&&(a.canAdvance(e,o)||i)&&a.is(":visible")){if(p&&r){var l=$(a.vars.asNavFor).data("flexslider");if(a.atEnd=0===e||e===a.count-1,l.flexAnimate(e,!0,!1,!0,o),a.direction=a.currentItem<e?"next":"prev",l.direction=a.direction,Math.ceil((e+1)/a.visible)-1===a.currentSlide||0===e)return a.currentItem=e,a.slides.removeClass(n+"active-slide").eq(e).addClass(n+"active-slide"),!1;a.currentItem=e,a.slides.removeClass(n+"active-slide").eq(e).addClass(n+"active-slide"),e=Math.floor(e/a.visible)}if(a.animating=!0,a.animatingTo=e,t&&a.pause(),a.vars.before(a),a.syncExists&&!o&&m.sync("animate"),a.vars.controlNav&&m.controlNav.active(),u||a.slides.removeClass(n+"active-slide").eq(e).addClass(n+"active-slide"),a.atEnd=0===e||e===a.last,a.vars.directionNav&&m.directionNav.update(),e===a.last&&(a.vars.end(a),a.vars.animationLoop||a.pause()),v)s?(a.slides.eq(a.currentSlide).css({opacity:0,zIndex:1}),a.slides.eq(e).css({opacity:1,zIndex:2}),a.wrapup(f)):(a.slides.eq(a.currentSlide).css({zIndex:1}).animate({opacity:0},a.vars.animationSpeed,a.vars.easing),a.slides.eq(e).css({zIndex:2}).animate({opacity:1},a.vars.animationSpeed,a.vars.easing,a.wrapup));else{var f=c?a.slides.filter(":first").height():a.computedW,g,h,S;u?(g=a.vars.itemMargin,S=(a.itemW+g)*a.move*a.animatingTo,h=S>a.limit&&1!==a.visible?a.limit:S):h=0===a.currentSlide&&e===a.count-1&&a.vars.animationLoop&&"next"!==a.direction?d?(a.count+a.cloneOffset)*f:0:a.currentSlide===a.last&&0===e&&a.vars.animationLoop&&"prev"!==a.direction?d?0:(a.count+1)*f:d?(a.count-1-e+a.cloneOffset)*f:(e+a.cloneOffset)*f,a.setProps(h,"",a.vars.animationSpeed),a.transitions?(a.vars.animationLoop&&a.atEnd||(a.animating=!1,a.currentSlide=a.animatingTo),a.container.unbind("webkitTransitionEnd transitionend"),a.container.bind("webkitTransitionEnd transitionend",function(){clearTimeout(a.ensureAnimationEnd),a.wrapup(f)}),clearTimeout(a.ensureAnimationEnd),a.ensureAnimationEnd=setTimeout(function(){a.wrapup(f)},a.vars.animationSpeed+100)):a.container.animate(a.args,a.vars.animationSpeed,a.vars.easing,function(){a.wrapup(f)})}a.vars.smoothHeight&&m.smoothHeight(a.vars.animationSpeed)}},a.wrapup=function(e){v||u||(0===a.currentSlide&&a.animatingTo===a.last&&a.vars.animationLoop?a.setProps(e,"jumpEnd"):a.currentSlide===a.last&&0===a.animatingTo&&a.vars.animationLoop&&a.setProps(e,"jumpStart")),a.animating=!1,a.currentSlide=a.animatingTo,a.vars.after(a)},a.animateSlides=function(){!a.animating&&f&&a.flexAnimate(a.getTarget("next"))},a.pause=function(){clearInterval(a.animatedSlides),a.animatedSlides=null,a.playing=!1,a.vars.pausePlay&&m.pausePlay.update("play"),a.syncExists&&m.sync("pause")},a.play=function(){a.playing&&clearInterval(a.animatedSlides),a.animatedSlides=a.animatedSlides||setInterval(a.animateSlides,a.vars.slideshowSpeed),a.started=a.playing=!0,a.vars.pausePlay&&m.pausePlay.update("pause"),a.syncExists&&m.sync("play")},a.stop=function(){a.pause(),a.stopped=!0},a.canAdvance=function(e,t){var n=p?a.pagingCount-1:a.last;return t?!0:p&&a.currentItem===a.count-1&&0===e&&"prev"===a.direction?!0:p&&0===a.currentItem&&e===a.pagingCount-1&&"next"!==a.direction?!1:e!==a.currentSlide||p?a.vars.animationLoop?!0:a.atEnd&&0===a.currentSlide&&e===n&&"next"!==a.direction?!1:a.atEnd&&a.currentSlide===n&&0===e&&"next"===a.direction?!1:!0:!1},a.getTarget=function(e){return a.direction=e,"next"===e?a.currentSlide===a.last?0:a.currentSlide+1:0===a.currentSlide?a.last:a.currentSlide-1},a.setProps=function(e,t,n){var i=function(){var n=e?e:(a.itemW+a.vars.itemMargin)*a.move*a.animatingTo,i=function(){if(u)return"setTouch"===t?e:d&&a.animatingTo===a.last?0:d?a.limit-(a.itemW+a.vars.itemMargin)*a.move*a.animatingTo:a.animatingTo===a.last?a.limit:n;switch(t){case"setTotal":return d?(a.count-1-a.currentSlide+a.cloneOffset)*e:(a.currentSlide+a.cloneOffset)*e;case"setTouch":return d?e:e;case"jumpEnd":return d?e:a.count*e;case"jumpStart":return d?a.count*e:e;default:return e}}();return-1*i+"px"}();a.transitions&&(i=c?"translate3d(0,"+i+",0)":"translate3d("+i+",0,0)",n=void 0!==n?n/1e3+"s":"0s",a.container.css("-"+a.pfx+"-transition-duration",n),a.container.css("transition-duration",n)),a.args[a.prop]=i,(a.transitions||void 0===n)&&a.container.css(a.args),a.container.css("transform",i)},a.setup=function(e){if(v)a.slides.css({width:"100%","float":"left",marginRight:"-100%",position:"relative"}),"init"===e&&(s?a.slides.css({opacity:0,display:"block",webkitTransition:"opacity "+a.vars.animationSpeed/1e3+"s ease",zIndex:1}).eq(a.currentSlide).css({opacity:1,zIndex:2}):0==a.vars.fadeFirstSlide?a.slides.css({opacity:0,display:"block",zIndex:1}).eq(a.currentSlide).css({zIndex:2}).css({opacity:1}):a.slides.css({opacity:0,display:"block",zIndex:1}).eq(a.currentSlide).css({zIndex:2}).animate({opacity:1},a.vars.animationSpeed,a.vars.easing)),a.vars.smoothHeight&&m.smoothHeight();else{var t,i;"init"===e&&(a.viewport=$('<div class="'+n+'viewport"></div>').css({overflow:"hidden",position:"relative"}).appendTo(a).append(a.container),a.cloneCount=0,a.cloneOffset=0,d&&(i=$.makeArray(a.slides).reverse(),a.slides=$(i),a.container.empty().append(a.slides))),a.vars.animationLoop&&!u&&(a.cloneCount=2,a.cloneOffset=1,"init"!==e&&a.container.find(".clone").remove(),a.container.append(m.uniqueID(a.slides.first().clone().addClass("clone")).attr("aria-hidden","true")).prepend(m.uniqueID(a.slides.last().clone().addClass("clone")).attr("aria-hidden","true"))),a.newSlides=$(a.vars.selector,a),t=d?a.count-1-a.currentSlide+a.cloneOffset:a.currentSlide+a.cloneOffset,c&&!u?(a.container.height(200*(a.count+a.cloneCount)+"%").css("position","absolute").width("100%"),setTimeout(function(){a.newSlides.css({display:"block"}),a.doMath(),a.viewport.height(a.h),a.setProps(t*a.h,"init")},"init"===e?100:0)):(a.container.width(200*(a.count+a.cloneCount)+"%"),a.setProps(t*a.computedW,"init"),setTimeout(function(){a.doMath(),a.newSlides.css({width:a.computedW,"float":"left",display:"block"}),a.vars.smoothHeight&&m.smoothHeight()},"init"===e?100:0))}u||a.slides.removeClass(n+"active-slide").eq(a.currentSlide).addClass(n+"active-slide"),a.vars.init(a)},a.doMath=function(){var e=a.slides.first(),t=a.vars.itemMargin,n=a.vars.minItems,i=a.vars.maxItems;a.w=void 0===a.viewport?a.width():a.viewport.width(),a.h=e.height(),a.boxPadding=e.outerWidth()-e.width(),u?(a.itemT=a.vars.itemWidth+t,a.minW=n?n*a.itemT:a.w,a.maxW=i?i*a.itemT-t:a.w,a.itemW=a.minW>a.w?(a.w-t*(n-1))/n:a.maxW<a.w?(a.w-t*(i-1))/i:a.vars.itemWidth>a.w?a.w:a.vars.itemWidth,a.visible=Math.floor(a.w/a.itemW),a.move=a.vars.move>0&&a.vars.move<a.visible?a.vars.move:a.visible,a.pagingCount=Math.ceil((a.count-a.visible)/a.move+1),a.last=a.pagingCount-1,a.limit=1===a.pagingCount?0:a.vars.itemWidth>a.w?a.itemW*(a.count-1)+t*(a.count-1):(a.itemW+t)*a.count-a.w-t):(a.itemW=a.w,a.pagingCount=a.count,a.last=a.count-1),a.computedW=a.itemW-a.boxPadding},a.update=function(e,t){a.doMath(),u||(e<a.currentSlide?a.currentSlide+=1:e<=a.currentSlide&&0!==e&&(a.currentSlide-=1),a.animatingTo=a.currentSlide),a.vars.controlNav&&!a.manualControls&&("add"===t&&!u||a.pagingCount>a.controlNav.length?m.controlNav.update("add"):("remove"===t&&!u||a.pagingCount<a.controlNav.length)&&(u&&a.currentSlide>a.last&&(a.currentSlide-=1,a.animatingTo-=1),m.controlNav.update("remove",a.last))),a.vars.directionNav&&m.directionNav.update()},a.addSlide=function(e,t){var n=$(e);a.count+=1,a.last=a.count-1,c&&d?void 0!==t?a.slides.eq(a.count-t).after(n):a.container.prepend(n):void 0!==t?a.slides.eq(t).before(n):a.container.append(n),a.update(t,"add"),a.slides=$(a.vars.selector+":not(.clone)",a),a.setup(),a.vars.added(a)},a.removeSlide=function(e){var t=isNaN(e)?a.slides.index($(e)):e;a.count-=1,a.last=a.count-1,isNaN(e)?$(e,a.slides).remove():c&&d?a.slides.eq(a.last).remove():a.slides.eq(e).remove(),a.doMath(),a.update(t,"remove"),a.slides=$(a.vars.selector+":not(.clone)",a),a.setup(),a.vars.removed(a)},m.init()},$(window).blur(function(e){focused=!1}).focus(function(e){focused=!0}),$.flexslider.defaults={namespace:"flex-",selector:".slides > li",animation:"fade",easing:"swing",direction:"horizontal",reverse:!1,animationLoop:!0,smoothHeight:!1,startAt:0,slideshow:!0,slideshowSpeed:7e3,animationSpeed:600,initDelay:0,randomize:!1,fadeFirstSlide:!0,thumbCaptions:!1,pauseOnAction:!0,pauseOnHover:!1,pauseInvisible:!0,useCSS:!0,touch:!0,video:!1,controlNav:!0,directionNav:!0,prevText:"Previous",nextText:"Next",keyboard:!0,multipleKeyboard:!1,mousewheel:!1,pausePlay:!1,pauseText:"Pause",playText:"Play",controlsContainer:"",manualControls:"",customDirectionNav:"",sync:"",asNavFor:"",itemWidth:0,itemMargin:0,minItems:1,maxItems:0,move:0,allowOneSlide:!0,start:function(){},before:function(){},after:function(){},end:function(){},added:function(){},removed:function(){},init:function(){}},$.fn.flexslider=function(e){if(void 0===e&&(e={}),"object"==typeof e)return this.each(function(){var t=$(this),a=e.selector?e.selector:".slides > li",n=t.find(a);1===n.length&&e.allowOneSlide===!0||0===n.length?(n.fadeIn(400),e.start&&e.start(t)):void 0===t.data("flexslider")&&new $.flexslider(this,e)});var t=$(this).data("flexslider");switch(e){case"play":t.play();break;case"pause":t.pause();break;case"stop":t.stop();break;case"next":t.flexAnimate(t.getTarget("next"),!0);break;case"prev":case"previous":t.flexAnimate(t.getTarget("prev"),!0);break;default:"number"==typeof e&&t.flexAnimate(e,!0)}}}(jQuery);
/*!
 * classie v1.0.1
 * class helper functions
 * from bonzo https://github.com/ded/bonzo
 * MIT license
 * 
 * classie.has( elem, 'my-class' ) -> true/false
 * classie.add( elem, 'my-new-class' )
 * classie.remove( elem, 'my-unwanted-class' )
 * classie.toggle( elem, 'my-class' )
 */

/*jshint browser: true, strict: true, undef: true, unused: true */
/*global define: false, module: false */

( function( window ) {

'use strict';

// class helper functions from bonzo https://github.com/ded/bonzo

function classReg( className ) {
  return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
}

// classList support for class management
// altho to be fair, the api sucks because it won't accept multiple classes at once
var hasClass, addClass, removeClass;

if ( 'classList' in document.documentElement ) {
  hasClass = function( elem, c ) {
    return elem.classList.contains( c );
  };
  addClass = function( elem, c ) {
    elem.classList.add( c );
  };
  removeClass = function( elem, c ) {
    elem.classList.remove( c );
  };
}
else {
  hasClass = function( elem, c ) {
    return classReg( c ).test( elem.className );
  };
  addClass = function( elem, c ) {
    if ( !hasClass( elem, c ) ) {
      elem.className = elem.className + ' ' + c;
    }
  };
  removeClass = function( elem, c ) {
    elem.className = elem.className.replace( classReg( c ), ' ' );
  };
}

function toggleClass( elem, c ) {
  var fn = hasClass( elem, c ) ? removeClass : addClass;
  fn( elem, c );
}

var classie = {
  // full names
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass,
  toggleClass: toggleClass,
  // short names
  has: hasClass,
  add: addClass,
  remove: removeClass,
  toggle: toggleClass
};

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( classie );
} else if ( typeof exports === 'object' ) {
  // CommonJS
  module.exports = classie;
} else {
  // browser global
  window.classie = classie;
}

})( window );

/*-------------------------------

	POPUP.JS

	Simple Popup plugin for jQuery

	@author Todd Francis
	@version 2.2.3

-------------------------------*/

;(function(b,t){b.fn.popup=function(h){var q=this.selector,m=new b.Popup(h);b(document).on("click.popup",q,function(n){var k=h&&h.content?h.content:b(this).attr("href");n.preventDefault();m.open(k,void 0,this)});return this.each(function(){b(this).data("popup",m)})};b.Popup=function(h){function q(a){var d;b.each(a,function(a,c){if(c)return d=c,!1});return d}function m(a){return"function"===typeof a?"function":a instanceof b?"jQuery":"#"===a.substr(0,1)||"."===a.substr(0,1)?"inline":-1!==b.inArray(a.substr(a.length-
3),u)?"image":"http"===a.substr(0,4)?"external":"ajax"}function n(c){r&&r.fadeOut("fast",function(){b(this).remove()});var d=!0;void 0===f&&(d=!1,f=b('<div class="'+a.o.containerClass+'">'),p=b(a.o.markup).appendTo(f),b(a.o.closeContent).one("click",function(){a.close()}).appendTo(f),b(t).resize(a.center),f.appendTo(b("body")).css("opacity",0));var e=b("."+a.o.contentClass,f);a.width?e.css("width",a.width,10):e.css("width","");a.height?e.css("height",a.height,10):e.css("height","");p.hasClass(a.o.contentClass)?
p.html(c):p.find("."+a.o.contentClass).html(c);d?a.o.replaced.call(a,f,g):a.o.show.call(a,f,g)}function k(a,d){var b=(new RegExp("[?&]"+a+"=([^&]*)")).exec(d);return b&&decodeURIComponent(b[1].replace(/\+/g," "))}var a=this,u=["png","jpg","gif"],l,s,g,f,r,p;a.ele=void 0;a.o=b.extend(!0,{},{backClass:"popup_back",backOpacity:.7,containerClass:"popup_cont",closeContent:'<div class="popup_close">&times;</div>',markup:'<div class="popup"><div class="popup_content"/></div>',contentClass:"popup_content",
preloaderContent:'<p class="preloader">Loading</p>',activeClass:"popup_active",hideFlash:!1,speed:200,popupPlaceholderClass:"popup_placeholder",keepInlineChanges:!0,modal:!1,content:null,type:"auto",width:null,height:null,typeParam:"pt",widthParam:"pw",heightParam:"ph",beforeOpen:function(a){},afterOpen:function(){},beforeClose:function(){},afterClose:function(){},error:function(){},show:function(a,b){var e=this;e.center();a.animate({opacity:1},e.o.speed,function(){e.o.afterOpen.call(e)})},replaced:function(a,
b){this.center().o.afterOpen.call(this)},hide:function(a,b){void 0!==a&&a.animate({opacity:0},this.o.speed)},types:{inline:function(c,d){var e=b(c);e.addClass(a.o.popupPlaceholderClass);a.o.keepInlineChanges||(s=e.html());d.call(this,e.children())},image:function(c,d){var e=this;b("<img />").one("load",function(){var a=this;setTimeout(function(){d.call(e,a)},0)}).one("error",function(){a.o.error.call(a,c,"image")}).attr("src",c).each(function(){this.complete&&b(this).trigger("load")})},external:function(c,
d){var e=b("<iframe />").attr({src:c,frameborder:0,width:a.width,height:a.height});d.call(this,e)},html:function(a,b){b.call(this,a)},jQuery:function(a,b){b.call(this,a.html())},"function":function(b,d){d.call(this,b.call(a))},ajax:function(c,d){b.ajax({url:c,success:function(a){d.call(this,a)},error:function(b){a.o.error.call(a,c,"ajax")}})}}},h);a.open=function(c,d,e){c=void 0===c||"#"===c?a.o.content:c;if(null===c)return a.o.error.call(a,c,l),!1;void 0!==e&&(a.ele&&a.o.activeClass&&b(a.ele).removeClass(a.o.activeClass),
a.ele=e,a.ele&&a.o.activeClass&&b(a.ele).addClass(a.o.activeClass));if(void 0===g){g=b('<div class="'+a.o.backClass+'"/>').appendTo(b("body")).css("opacity",0).animate({opacity:a.o.backOpacity},a.o.speed);if(!a.o.modal)g.one("click.popup",function(){a.close()});a.o.hideFlash&&b("object, embed").css("visibility","hidden");a.o.preloaderContent&&(r=b(a.o.preloaderContent).appendTo(b("body")))}d=q([d,a.o.type]);l=d="auto"===d?m(c):d;a.width=a.o.width?a.o.width:null;a.height=a.o.height?a.o.height:null;
if(-1===b.inArray(d,["inline","jQuery","function"])){e=k(a.o.typeParam,c);var f=k(a.o.widthParam,c),h=k(a.o.heightParam,c);d=null!==e?e:d;a.width=null!==f?f:a.width;a.height=null!==h?h:a.height}a.o.beforeOpen.call(a,d);a.o.types[d]?a.o.types[d].call(a,c,n):a.o.types.ajax.call(a,c,n)};a.close=function(){a.o.beforeClose.call(a);"inline"===l&&a.o.keepInlineChanges&&(s=b("."+a.o.contentClass).html());void 0!==g&&g.animate({opacity:0},a.o.speed,function(){a.cleanUp()});a.o.hide.call(a,f,g);return a};a.cleanUp=
function(){g.add(f).remove();f=g=void 0;b(t).unbind("resize",a.center);a.o.hideFlash&&b("object, embed").css("visibility","visible");a.ele&&a.o.activeClass&&b(a.ele).removeClass(a.o.activeClass);var c=b("."+a.o.popupPlaceholderClass);"inline"==l&&c.length&&c.html(s).removeClass(a.o.popupPlaceholderClass);l=null;a.o.afterClose.call(a);return a};a.center=function(){f.css(a.getCenter());g.css({height:document.documentElement.clientHeight});return a};a.getCenter=function(){var a=f.children().outerWidth(!0),
b=f.children().outerHeight(!0);return{top:.5*document.documentElement.clientHeight-.5*b,left:.5*document.documentElement.clientWidth-.5*a}}}})(jQuery,window);
;(function ( $, window, document, undefined ) {

  /**
   * animo is a powerful little tool that makes managing CSS animations extremely easy. Stack animations, set callbacks, make magic.
   * Modern browsers and almost all mobile browsers support CSS animations (http://caniuse.com/css-animation).
   *
   * @author Daniel Raftery : twitter/ThrivingKings
   * @version 1.0.1
  */
  function animo( element, options, callback, other_cb ) {
    
    // Default configuration
    var defaults = {
    	duration: 1,
    	animation: null,
    	iterate: 1,
    	timing: "linear",
      keep: false
    };

    // Browser prefixes for CSS
    this.prefixes = ["", "-moz-", "-o-animation-", "-webkit-"];

    // Cache the element
    this.element = $(element);

    this.bare = element;

    // For stacking of animations
    this.queue = [];

    // Hacky
    this.listening = false;

    // Figure out where the callback is
    var cb = (typeof callback == "function" ? callback : other_cb);

    // Options can sometimes be a command
    switch(options) {

      case "blur":

      	defaults = {
      		amount: 3,
      		duration: 0.5,
      		focusAfter: null
      	};

      	this.options = $.extend( defaults, callback );

  	    this._blur(cb);

        break;

      case "focus":

  	  	this._focus();

        break;

      case "rotate":

        defaults = {
          degrees: 15,
          duration: 0.5
        };

        this.options = $.extend( defaults, callback );

        this._rotate(cb);

        break;

      case "cleanse":

        this.cleanse();

        break;

      default:

	    this.options = $.extend( defaults, options );

	    this.init(cb);
  	
      break;
    }
  }

  animo.prototype = {

    // A standard CSS animation
    init: function(callback) {
      
      var $me = this;

      // Are we stacking animations?
      if(Object.prototype.toString.call( $me.options.animation ) === '[object Array]') {
      	$.merge($me.queue, $me.options.animation);
      } else {
	      $me.queue.push($me.options.animation);
	    }

	    $me.cleanse();

	    $me.animate(callback);
      
    },

    // The actual adding of the class and listening for completion
    animate: function(callback) {

    	this.element.addClass('animated');

      this.element.addClass(this.queue[0]);

      this.element.data("animo", this.queue[0]);

      var ai = this.prefixes.length;

      // Add the options for each prefix
      while(ai--) {

      	this.element.css(this.prefixes[ai]+"animation-duration", this.options.duration+"s");

      	this.element.css(this.prefixes[ai]+"animation-iteration-count", this.options.iterate);

      	this.element.css(this.prefixes[ai]+"animation-timing-function", this.options.timing);

      }

      var $me = this, _cb = callback;

      if($me.queue.length>1) {
        _cb = null;
      }

      // Listen for the end of the animation
      this._end("AnimationEnd", function() {

        // If there are more, clean it up and move on
      	if($me.element.hasClass($me.queue[0])) {

	    		if(!$me.options.keep) {
            $me.cleanse();
          }

          $me.queue.shift();

	    		if($me.queue.length) {

		      	$me.animate(callback);
		      }
			  }
		  }, _cb);
    },

    cleanse: function() {

    	this.element.removeClass('animated');

  		this.element.removeClass(this.queue[0]);

      this.element.removeClass(this.element.data("animo"));

  		var ai = this.prefixes.length;

  		while(ai--) {

      	this.element.css(this.prefixes[ai]+"animation-duration", "");

      	this.element.css(this.prefixes[ai]+"animation-iteration-count", "");

      	this.element.css(this.prefixes[ai]+"animation-timing-function", "");

        this.element.css(this.prefixes[ai]+"transition", "");

        this.element.css(this.prefixes[ai]+"transform", "");

        this.element.css(this.prefixes[ai]+"filter", "");

      }
    },

    _blur: function(callback) {

      if(this.element.is("img")) {

      	var svg_id = "svg_" + (((1 + Math.random()) * 0x1000000) | 0).toString(16).substring(1);
      	var filter_id = "filter_" + (((1 + Math.random()) * 0x1000000) | 0).toString(16).substring(1);

      	$('body').append('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" id="'+svg_id+'" style="height:0;"><filter id="'+filter_id+'"><feGaussianBlur stdDeviation="'+this.options.amount+'" /></filter></svg>');

      	var ai = this.prefixes.length;

    		while(ai--) {

        	this.element.css(this.prefixes[ai]+"filter", "blur("+this.options.amount+"px)");

        	this.element.css(this.prefixes[ai]+"transition", this.options.duration+"s all linear");

        }

        this.element.css("filter", "url(#"+filter_id+")");

        this.element.data("svgid", svg_id);
      
      } else {

        var color = this.element.css('color');

        var ai = this.prefixes.length;

        // Add the options for each prefix
        while(ai--) {

          this.element.css(this.prefixes[ai]+"transition", "all "+this.options.duration+"s linear");

        }

        this.element.css("text-shadow", "0 0 "+this.options.amount+"px "+color);
        this.element.css("color", "transparent");
      }

      this._end("TransitionEnd", null, callback);

      var $me = this;

      if(this.options.focusAfter) {

        var focus_wait = window.setTimeout(function() {

          $me._focus();

          focus_wait = window.clearTimeout(focus_wait);

        }, (this.options.focusAfter*1000));
      }

    },

    _focus: function() {

    	var ai = this.prefixes.length;

      if(this.element.is("img")) {

    		while(ai--) {

        	this.element.css(this.prefixes[ai]+"filter", "");

        	this.element.css(this.prefixes[ai]+"transition", "");

        }

        var $svg = $('#'+this.element.data('svgid'));

        $svg.remove();
      } else {

        while(ai--) {

          this.element.css(this.prefixes[ai]+"transition", "");

        }

        this.element.css("text-shadow", "");
        this.element.css("color", "");
      }
    },

    _rotate: function(callback) {

      var ai = this.prefixes.length;

      // Add the options for each prefix
      while(ai--) {

        this.element.css(this.prefixes[ai]+"transition", "all "+this.options.duration+"s linear");

        this.element.css(this.prefixes[ai]+"transform", "rotate("+this.options.degrees+"deg)");

      }

      this._end("TransitionEnd", null, callback);

    },

    _end: function(type, todo, callback) {

      var $me = this;

      var binding = type.toLowerCase()+" webkit"+type+" o"+type+" MS"+type;

      this.element.bind(binding, function() {
        
        $me.element.unbind(binding);

        if(typeof todo == "function") {

          todo();
        }

        if(typeof callback == "function") {

          callback($me);
        }
      });
      
    }
  };

  $.fn.animo = function ( options, callback, other_cb ) {
    
    return this.each(function() {
			
			new animo( this, options, callback, other_cb );

		});

  };

})( jQuery, window, document );
/*!
Waypoints - 3.1.1
Copyright © 2011-2015 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blog/master/licenses.txt
*/
!function(){"use strict";function t(o){if(!o)throw new Error("No options passed to Waypoint constructor");if(!o.element)throw new Error("No element option passed to Waypoint constructor");if(!o.handler)throw new Error("No handler option passed to Waypoint constructor");this.key="waypoint-"+e,this.options=t.Adapter.extend({},t.defaults,o),this.element=this.options.element,this.adapter=new t.Adapter(this.element),this.callback=o.handler,this.axis=this.options.horizontal?"horizontal":"vertical",this.enabled=this.options.enabled,this.triggerPoint=null,this.group=t.Group.findOrCreate({name:this.options.group,axis:this.axis}),this.context=t.Context.findOrCreateByElement(this.options.context),t.offsetAliases[this.options.offset]&&(this.options.offset=t.offsetAliases[this.options.offset]),this.group.add(this),this.context.add(this),i[this.key]=this,e+=1}var e=0,i={};t.prototype.queueTrigger=function(t){this.group.queueTrigger(this,t)},t.prototype.trigger=function(t){this.enabled&&this.callback&&this.callback.apply(this,t)},t.prototype.destroy=function(){this.context.remove(this),this.group.remove(this),delete i[this.key]},t.prototype.disable=function(){return this.enabled=!1,this},t.prototype.enable=function(){return this.context.refresh(),this.enabled=!0,this},t.prototype.next=function(){return this.group.next(this)},t.prototype.previous=function(){return this.group.previous(this)},t.invokeAll=function(t){var e=[];for(var o in i)e.push(i[o]);for(var n=0,r=e.length;r>n;n++)e[n][t]()},t.destroyAll=function(){t.invokeAll("destroy")},t.disableAll=function(){t.invokeAll("disable")},t.enableAll=function(){t.invokeAll("enable")},t.refreshAll=function(){t.Context.refreshAll()},t.viewportHeight=function(){return window.innerHeight||document.documentElement.clientHeight},t.viewportWidth=function(){return document.documentElement.clientWidth},t.adapters=[],t.defaults={context:window,continuous:!0,enabled:!0,group:"default",horizontal:!1,offset:0},t.offsetAliases={"bottom-in-view":function(){return this.context.innerHeight()-this.adapter.outerHeight()},"right-in-view":function(){return this.context.innerWidth()-this.adapter.outerWidth()}},window.Waypoint=t}(),function(){"use strict";function t(t){window.setTimeout(t,1e3/60)}function e(t){this.element=t,this.Adapter=n.Adapter,this.adapter=new this.Adapter(t),this.key="waypoint-context-"+i,this.didScroll=!1,this.didResize=!1,this.oldScroll={x:this.adapter.scrollLeft(),y:this.adapter.scrollTop()},this.waypoints={vertical:{},horizontal:{}},t.waypointContextKey=this.key,o[t.waypointContextKey]=this,i+=1,this.createThrottledScrollHandler(),this.createThrottledResizeHandler()}var i=0,o={},n=window.Waypoint,r=window.onload;e.prototype.add=function(t){var e=t.options.horizontal?"horizontal":"vertical";this.waypoints[e][t.key]=t,this.refresh()},e.prototype.checkEmpty=function(){var t=this.Adapter.isEmptyObject(this.waypoints.horizontal),e=this.Adapter.isEmptyObject(this.waypoints.vertical);t&&e&&(this.adapter.off(".waypoints"),delete o[this.key])},e.prototype.createThrottledResizeHandler=function(){function t(){e.handleResize(),e.didResize=!1}var e=this;this.adapter.on("resize.waypoints",function(){e.didResize||(e.didResize=!0,n.requestAnimationFrame(t))})},e.prototype.createThrottledScrollHandler=function(){function t(){e.handleScroll(),e.didScroll=!1}var e=this;this.adapter.on("scroll.waypoints",function(){(!e.didScroll||n.isTouch)&&(e.didScroll=!0,n.requestAnimationFrame(t))})},e.prototype.handleResize=function(){n.Context.refreshAll()},e.prototype.handleScroll=function(){var t={},e={horizontal:{newScroll:this.adapter.scrollLeft(),oldScroll:this.oldScroll.x,forward:"right",backward:"left"},vertical:{newScroll:this.adapter.scrollTop(),oldScroll:this.oldScroll.y,forward:"down",backward:"up"}};for(var i in e){var o=e[i],n=o.newScroll>o.oldScroll,r=n?o.forward:o.backward;for(var s in this.waypoints[i]){var a=this.waypoints[i][s],l=o.oldScroll<a.triggerPoint,h=o.newScroll>=a.triggerPoint,p=l&&h,u=!l&&!h;(p||u)&&(a.queueTrigger(r),t[a.group.id]=a.group)}}for(var c in t)t[c].flushTriggers();this.oldScroll={x:e.horizontal.newScroll,y:e.vertical.newScroll}},e.prototype.innerHeight=function(){return this.element==this.element.window?n.viewportHeight():this.adapter.innerHeight()},e.prototype.remove=function(t){delete this.waypoints[t.axis][t.key],this.checkEmpty()},e.prototype.innerWidth=function(){return this.element==this.element.window?n.viewportWidth():this.adapter.innerWidth()},e.prototype.destroy=function(){var t=[];for(var e in this.waypoints)for(var i in this.waypoints[e])t.push(this.waypoints[e][i]);for(var o=0,n=t.length;n>o;o++)t[o].destroy()},e.prototype.refresh=function(){var t,e=this.element==this.element.window,i=this.adapter.offset(),o={};this.handleScroll(),t={horizontal:{contextOffset:e?0:i.left,contextScroll:e?0:this.oldScroll.x,contextDimension:this.innerWidth(),oldScroll:this.oldScroll.x,forward:"right",backward:"left",offsetProp:"left"},vertical:{contextOffset:e?0:i.top,contextScroll:e?0:this.oldScroll.y,contextDimension:this.innerHeight(),oldScroll:this.oldScroll.y,forward:"down",backward:"up",offsetProp:"top"}};for(var n in t){var r=t[n];for(var s in this.waypoints[n]){var a,l,h,p,u,c=this.waypoints[n][s],d=c.options.offset,f=c.triggerPoint,w=0,y=null==f;c.element!==c.element.window&&(w=c.adapter.offset()[r.offsetProp]),"function"==typeof d?d=d.apply(c):"string"==typeof d&&(d=parseFloat(d),c.options.offset.indexOf("%")>-1&&(d=Math.ceil(r.contextDimension*d/100))),a=r.contextScroll-r.contextOffset,c.triggerPoint=w+a-d,l=f<r.oldScroll,h=c.triggerPoint>=r.oldScroll,p=l&&h,u=!l&&!h,!y&&p?(c.queueTrigger(r.backward),o[c.group.id]=c.group):!y&&u?(c.queueTrigger(r.forward),o[c.group.id]=c.group):y&&r.oldScroll>=c.triggerPoint&&(c.queueTrigger(r.forward),o[c.group.id]=c.group)}}for(var g in o)o[g].flushTriggers();return this},e.findOrCreateByElement=function(t){return e.findByElement(t)||new e(t)},e.refreshAll=function(){for(var t in o)o[t].refresh()},e.findByElement=function(t){return o[t.waypointContextKey]},window.onload=function(){r&&r(),e.refreshAll()},n.requestAnimationFrame=function(e){var i=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||t;i.call(window,e)},n.Context=e}(),function(){"use strict";function t(t,e){return t.triggerPoint-e.triggerPoint}function e(t,e){return e.triggerPoint-t.triggerPoint}function i(t){this.name=t.name,this.axis=t.axis,this.id=this.name+"-"+this.axis,this.waypoints=[],this.clearTriggerQueues(),o[this.axis][this.name]=this}var o={vertical:{},horizontal:{}},n=window.Waypoint;i.prototype.add=function(t){this.waypoints.push(t)},i.prototype.clearTriggerQueues=function(){this.triggerQueues={up:[],down:[],left:[],right:[]}},i.prototype.flushTriggers=function(){for(var i in this.triggerQueues){var o=this.triggerQueues[i],n="up"===i||"left"===i;o.sort(n?e:t);for(var r=0,s=o.length;s>r;r+=1){var a=o[r];(a.options.continuous||r===o.length-1)&&a.trigger([i])}}this.clearTriggerQueues()},i.prototype.next=function(e){this.waypoints.sort(t);var i=n.Adapter.inArray(e,this.waypoints),o=i===this.waypoints.length-1;return o?null:this.waypoints[i+1]},i.prototype.previous=function(e){this.waypoints.sort(t);var i=n.Adapter.inArray(e,this.waypoints);return i?this.waypoints[i-1]:null},i.prototype.queueTrigger=function(t,e){this.triggerQueues[e].push(t)},i.prototype.remove=function(t){var e=n.Adapter.inArray(t,this.waypoints);e>-1&&this.waypoints.splice(e,1)},i.prototype.first=function(){return this.waypoints[0]},i.prototype.last=function(){return this.waypoints[this.waypoints.length-1]},i.findOrCreate=function(t){return o[t.axis][t.name]||new i(t)},n.Group=i}(),function(){"use strict";function t(t){this.$element=e(t)}var e=window.jQuery,i=window.Waypoint;e.each(["innerHeight","innerWidth","off","offset","on","outerHeight","outerWidth","scrollLeft","scrollTop"],function(e,i){t.prototype[i]=function(){var t=Array.prototype.slice.call(arguments);return this.$element[i].apply(this.$element,t)}}),e.each(["extend","inArray","isEmptyObject"],function(i,o){t[o]=e[o]}),i.adapters.push({name:"jquery",Adapter:t}),i.Adapter=t}(),function(){"use strict";function t(t){return function(){var i=[],o=arguments[0];return t.isFunction(arguments[0])&&(o=t.extend({},arguments[1]),o.handler=arguments[0]),this.each(function(){var n=t.extend({},o,{element:this});"string"==typeof n.context&&(n.context=t(this).closest(n.context)[0]),i.push(new e(n))}),i}}var e=window.Waypoint;window.jQuery&&(window.jQuery.fn.waypoint=t(window.jQuery)),window.Zepto&&(window.Zepto.fn.waypoint=t(window.Zepto))}();
/** Abstract base class for collection plugins v1.0.1.
	Written by Keith Wood (kbwood{at}iinet.com.au) December 2013.
	Licensed under the MIT (http://keith-wood.name/licence.html) license. */
(function(){var j=false;window.JQClass=function(){};JQClass.classes={};JQClass.extend=function extender(f){var g=this.prototype;j=true;var h=new this();j=false;for(var i in f){h[i]=typeof f[i]=='function'&&typeof g[i]=='function'?(function(d,e){return function(){var b=this._super;this._super=function(a){return g[d].apply(this,a||[])};var c=e.apply(this,arguments);this._super=b;return c}})(i,f[i]):f[i]}function JQClass(){if(!j&&this._init){this._init.apply(this,arguments)}}JQClass.prototype=h;JQClass.prototype.constructor=JQClass;JQClass.extend=extender;return JQClass}})();(function($){JQClass.classes.JQPlugin=JQClass.extend({name:'plugin',defaultOptions:{},regionalOptions:{},_getters:[],_getMarker:function(){return'is-'+this.name},_init:function(){$.extend(this.defaultOptions,(this.regionalOptions&&this.regionalOptions[''])||{});var c=camelCase(this.name);$[c]=this;$.fn[c]=function(a){var b=Array.prototype.slice.call(arguments,1);if($[c]._isNotChained(a,b)){return $[c][a].apply($[c],[this[0]].concat(b))}return this.each(function(){if(typeof a==='string'){if(a[0]==='_'||!$[c][a]){throw'Unknown method: '+a;}$[c][a].apply($[c],[this].concat(b))}else{$[c]._attach(this,a)}})}},setDefaults:function(a){$.extend(this.defaultOptions,a||{})},_isNotChained:function(a,b){if(a==='option'&&(b.length===0||(b.length===1&&typeof b[0]==='string'))){return true}return $.inArray(a,this._getters)>-1},_attach:function(a,b){a=$(a);if(a.hasClass(this._getMarker())){return}a.addClass(this._getMarker());b=$.extend({},this.defaultOptions,this._getMetadata(a),b||{});var c=$.extend({name:this.name,elem:a,options:b},this._instSettings(a,b));a.data(this.name,c);this._postAttach(a,c);this.option(a,b)},_instSettings:function(a,b){return{}},_postAttach:function(a,b){},_getMetadata:function(d){try{var f=d.data(this.name.toLowerCase())||'';f=f.replace(/'/g,'"');f=f.replace(/([a-zA-Z0-9]+):/g,function(a,b,i){var c=f.substring(0,i).match(/"/g);return(!c||c.length%2===0?'"'+b+'":':b+':')});f=$.parseJSON('{'+f+'}');for(var g in f){var h=f[g];if(typeof h==='string'&&h.match(/^new Date\((.*)\)$/)){f[g]=eval(h)}}return f}catch(e){return{}}},_getInst:function(a){return $(a).data(this.name)||{}},option:function(a,b,c){a=$(a);var d=a.data(this.name);if(!b||(typeof b==='string'&&c==null)){var e=(d||{}).options;return(e&&b?e[b]:e)}if(!a.hasClass(this._getMarker())){return}var e=b||{};if(typeof b==='string'){e={};e[b]=c}this._optionsChanged(a,d,e);$.extend(d.options,e)},_optionsChanged:function(a,b,c){},destroy:function(a){a=$(a);if(!a.hasClass(this._getMarker())){return}this._preDestroy(a,this._getInst(a));a.removeData(this.name).removeClass(this._getMarker())},_preDestroy:function(a,b){}});function camelCase(c){return c.replace(/-([a-z])/g,function(a,b){return b.toUpperCase()})}$.JQPlugin={createPlugin:function(a,b){if(typeof a==='object'){b=a;a='JQPlugin'}a=camelCase(a);var c=camelCase(b.name);JQClass.classes[c]=JQClass.classes[a].extend(b);new JQClass.classes[c]()}}})(jQuery);
/* http://keith-wood.name/countdown.html
   Countdown for jQuery v2.0.2.
   Written by Keith Wood (kbwood{at}iinet.com.au) January 2008.
   Available under the MIT (http://keith-wood.name/licence.html) license. 
   Please attribute the author if you use it. */
(function($){var w='countdown';var Y=0;var O=1;var W=2;var D=3;var H=4;var M=5;var S=6;$.JQPlugin.createPlugin({name:w,defaultOptions:{until:null,since:null,timezone:null,serverSync:null,format:'dHMS',layout:'',compact:false,padZeroes:false,significant:0,description:'',expiryUrl:'',expiryText:'',alwaysExpire:false,onExpiry:null,onTick:null,tickInterval:1},regionalOptions:{'':{labels:['Years','Months','Weeks','Days','Hours','Minutes','Seconds'],labels1:['Year','Month','Week','Day','Hour','Minute','Second'],compactLabels:['y','m','w','d'],whichLabels:null,digits:['0','1','2','3','4','5','6','7','8','9'],timeSeparator:':',isRTL:false}},_getters:['getTimes'],_rtlClass:w+'-rtl',_sectionClass:w+'-section',_amountClass:w+'-amount',_periodClass:w+'-period',_rowClass:w+'-row',_holdingClass:w+'-holding',_showClass:w+'-show',_descrClass:w+'-descr',_timerElems:[],_init:function(){var c=this;this._super();this._serverSyncs=[];var d=(typeof Date.now=='function'?Date.now:function(){return new Date().getTime()});var e=(window.performance&&typeof window.performance.now=='function');function timerCallBack(a){var b=(a<1e12?(e?(performance.now()+performance.timing.navigationStart):d()):a||d());if(b-g>=1000){c._updateElems();g=b}f(timerCallBack)}var f=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||null;var g=0;if(!f||$.noRequestAnimationFrame){$.noRequestAnimationFrame=null;setInterval(function(){c._updateElems()},980)}else{g=window.animationStartTime||window.webkitAnimationStartTime||window.mozAnimationStartTime||window.oAnimationStartTime||window.msAnimationStartTime||d();f(timerCallBack)}},UTCDate:function(a,b,c,e,f,g,h,i){if(typeof b=='object'&&b.constructor==Date){i=b.getMilliseconds();h=b.getSeconds();g=b.getMinutes();f=b.getHours();e=b.getDate();c=b.getMonth();b=b.getFullYear()}var d=new Date();d.setUTCFullYear(b);d.setUTCDate(1);d.setUTCMonth(c||0);d.setUTCDate(e||1);d.setUTCHours(f||0);d.setUTCMinutes((g||0)-(Math.abs(a)<30?a*60:a));d.setUTCSeconds(h||0);d.setUTCMilliseconds(i||0);return d},periodsToSeconds:function(a){return a[0]*31557600+a[1]*2629800+a[2]*604800+a[3]*86400+a[4]*3600+a[5]*60+a[6]},resync:function(){var d=this;$('.'+this._getMarker()).each(function(){var a=$.data(this,d.name);if(a.options.serverSync){var b=null;for(var i=0;i<d._serverSyncs.length;i++){if(d._serverSyncs[i][0]==a.options.serverSync){b=d._serverSyncs[i];break}}if(b[2]==null){var c=($.isFunction(a.options.serverSync)?a.options.serverSync.apply(this,[]):null);b[2]=(c?new Date().getTime()-c.getTime():0)-b[1]}if(a._since){a._since.setMilliseconds(a._since.getMilliseconds()+b[2])}a._until.setMilliseconds(a._until.getMilliseconds()+b[2])}});for(var i=0;i<d._serverSyncs.length;i++){if(d._serverSyncs[i][2]!=null){d._serverSyncs[i][1]+=d._serverSyncs[i][2];delete d._serverSyncs[i][2]}}},_instSettings:function(a,b){return{_periods:[0,0,0,0,0,0,0]}},_addElem:function(a){if(!this._hasElem(a)){this._timerElems.push(a)}},_hasElem:function(a){return($.inArray(a,this._timerElems)>-1)},_removeElem:function(b){this._timerElems=$.map(this._timerElems,function(a){return(a==b?null:a)})},_updateElems:function(){for(var i=this._timerElems.length-1;i>=0;i--){this._updateCountdown(this._timerElems[i])}},_optionsChanged:function(a,b,c){if(c.layout){c.layout=c.layout.replace(/&lt;/g,'<').replace(/&gt;/g,'>')}this._resetExtraLabels(b.options,c);var d=(b.options.timezone!=c.timezone);$.extend(b.options,c);this._adjustSettings(a,b,c.until!=null||c.since!=null||d);var e=new Date();if((b._since&&b._since<e)||(b._until&&b._until>e)){this._addElem(a[0])}this._updateCountdown(a,b)},_updateCountdown:function(a,b){a=a.jquery?a:$(a);b=b||this._getInst(a);if(!b){return}a.html(this._generateHTML(b)).toggleClass(this._rtlClass,b.options.isRTL);if($.isFunction(b.options.onTick)){var c=b._hold!='lap'?b._periods:this._calculatePeriods(b,b._show,b.options.significant,new Date());if(b.options.tickInterval==1||this.periodsToSeconds(c)%b.options.tickInterval==0){b.options.onTick.apply(a[0],[c])}}var d=b._hold!='pause'&&(b._since?b._now.getTime()<b._since.getTime():b._now.getTime()>=b._until.getTime());if(d&&!b._expiring){b._expiring=true;if(this._hasElem(a[0])||b.options.alwaysExpire){this._removeElem(a[0]);if($.isFunction(b.options.onExpiry)){b.options.onExpiry.apply(a[0],[])}if(b.options.expiryText){var e=b.options.layout;b.options.layout=b.options.expiryText;this._updateCountdown(a[0],b);b.options.layout=e}if(b.options.expiryUrl){window.location=b.options.expiryUrl}}b._expiring=false}else if(b._hold=='pause'){this._removeElem(a[0])}},_resetExtraLabels:function(a,b){for(var n in b){if(n.match(/[Ll]abels[02-9]|compactLabels1/)){a[n]=b[n]}}for(var n in a){if(n.match(/[Ll]abels[02-9]|compactLabels1/)&&typeof b[n]==='undefined'){a[n]=null}}},_adjustSettings:function(a,b,c){var d=null;for(var i=0;i<this._serverSyncs.length;i++){if(this._serverSyncs[i][0]==b.options.serverSync){d=this._serverSyncs[i][1];break}}if(d!=null){var e=(b.options.serverSync?d:0);var f=new Date()}else{var g=($.isFunction(b.options.serverSync)?b.options.serverSync.apply(a[0],[]):null);var f=new Date();var e=(g?f.getTime()-g.getTime():0);this._serverSyncs.push([b.options.serverSync,e])}var h=b.options.timezone;h=(h==null?-f.getTimezoneOffset():h);if(c||(!c&&b._until==null&&b._since==null)){b._since=b.options.since;if(b._since!=null){b._since=this.UTCDate(h,this._determineTime(b._since,null));if(b._since&&e){b._since.setMilliseconds(b._since.getMilliseconds()+e)}}b._until=this.UTCDate(h,this._determineTime(b.options.until,f));if(e){b._until.setMilliseconds(b._until.getMilliseconds()+e)}}b._show=this._determineShow(b)},_preDestroy:function(a,b){this._removeElem(a[0]);a.empty()},pause:function(a){this._hold(a,'pause')},lap:function(a){this._hold(a,'lap')},resume:function(a){this._hold(a,null)},toggle:function(a){var b=$.data(a,this.name)||{};this[!b._hold?'pause':'resume'](a)},toggleLap:function(a){var b=$.data(a,this.name)||{};this[!b._hold?'lap':'resume'](a)},_hold:function(a,b){var c=$.data(a,this.name);if(c){if(c._hold=='pause'&&!b){c._periods=c._savePeriods;var d=(c._since?'-':'+');c[c._since?'_since':'_until']=this._determineTime(d+c._periods[0]+'y'+d+c._periods[1]+'o'+d+c._periods[2]+'w'+d+c._periods[3]+'d'+d+c._periods[4]+'h'+d+c._periods[5]+'m'+d+c._periods[6]+'s');this._addElem(a)}c._hold=b;c._savePeriods=(b=='pause'?c._periods:null);$.data(a,this.name,c);this._updateCountdown(a,c)}},getTimes:function(a){var b=$.data(a,this.name);return(!b?null:(b._hold=='pause'?b._savePeriods:(!b._hold?b._periods:this._calculatePeriods(b,b._show,b.options.significant,new Date()))))},_determineTime:function(k,l){var m=this;var n=function(a){var b=new Date();b.setTime(b.getTime()+a*1000);return b};var o=function(a){a=a.toLowerCase();var b=new Date();var c=b.getFullYear();var d=b.getMonth();var e=b.getDate();var f=b.getHours();var g=b.getMinutes();var h=b.getSeconds();var i=/([+-]?[0-9]+)\s*(s|m|h|d|w|o|y)?/g;var j=i.exec(a);while(j){switch(j[2]||'s'){case's':h+=parseInt(j[1],10);break;case'm':g+=parseInt(j[1],10);break;case'h':f+=parseInt(j[1],10);break;case'd':e+=parseInt(j[1],10);break;case'w':e+=parseInt(j[1],10)*7;break;case'o':d+=parseInt(j[1],10);e=Math.min(e,m._getDaysInMonth(c,d));break;case'y':c+=parseInt(j[1],10);e=Math.min(e,m._getDaysInMonth(c,d));break}j=i.exec(a)}return new Date(c,d,e,f,g,h,0)};var p=(k==null?l:(typeof k=='string'?o(k):(typeof k=='number'?n(k):k)));if(p)p.setMilliseconds(0);return p},_getDaysInMonth:function(a,b){return 32-new Date(a,b,32).getDate()},_normalLabels:function(a){return a},_generateHTML:function(c){var d=this;c._periods=(c._hold?c._periods:this._calculatePeriods(c,c._show,c.options.significant,new Date()));var e=false;var f=0;var g=c.options.significant;var h=$.extend({},c._show);for(var i=Y;i<=S;i++){e|=(c._show[i]=='?'&&c._periods[i]>0);h[i]=(c._show[i]=='?'&&!e?null:c._show[i]);f+=(h[i]?1:0);g-=(c._periods[i]>0?1:0)}var j=[false,false,false,false,false,false,false];for(var i=S;i>=Y;i--){if(c._show[i]){if(c._periods[i]){j[i]=true}else{j[i]=g>0;g--}}}var k=(c.options.compact?c.options.compactLabels:c.options.labels);var l=c.options.whichLabels||this._normalLabels;var m=function(a){var b=c.options['compactLabels'+l(c._periods[a])];return(h[a]?d._translateDigits(c,c._periods[a])+(b?b[a]:k[a])+' ':'')};var n=(c.options.padZeroes?2:1);var o=function(a){var b=c.options['labels'+l(c._periods[a])];return((!c.options.significant&&h[a])||(c.options.significant&&j[a])?'<span class="'+d._sectionClass+'">'+'<span class="'+d._amountClass+'">'+d._minDigits(c,c._periods[a],n)+'</span>'+'<span class="'+d._periodClass+'">'+(b?b[a]:k[a])+'</span></span>':'')};return(c.options.layout?this._buildLayout(c,h,c.options.layout,c.options.compact,c.options.significant,j):((c.options.compact?'<span class="'+this._rowClass+' '+this._amountClass+(c._hold?' '+this._holdingClass:'')+'">'+m(Y)+m(O)+m(W)+m(D)+(h[H]?this._minDigits(c,c._periods[H],2):'')+(h[M]?(h[H]?c.options.timeSeparator:'')+this._minDigits(c,c._periods[M],2):'')+(h[S]?(h[H]||h[M]?c.options.timeSeparator:'')+this._minDigits(c,c._periods[S],2):''):'<span class="'+this._rowClass+' '+this._showClass+(c.options.significant||f)+(c._hold?' '+this._holdingClass:'')+'">'+o(Y)+o(O)+o(W)+o(D)+o(H)+o(M)+o(S))+'</span>'+(c.options.description?'<span class="'+this._rowClass+' '+this._descrClass+'">'+c.options.description+'</span>':'')))},_buildLayout:function(c,d,e,f,g,h){var j=c.options[f?'compactLabels':'labels'];var k=c.options.whichLabels||this._normalLabels;var l=function(a){return(c.options[(f?'compactLabels':'labels')+k(c._periods[a])]||j)[a]};var m=function(a,b){return c.options.digits[Math.floor(a/b)%10]};var o={desc:c.options.description,sep:c.options.timeSeparator,yl:l(Y),yn:this._minDigits(c,c._periods[Y],1),ynn:this._minDigits(c,c._periods[Y],2),ynnn:this._minDigits(c,c._periods[Y],3),y1:m(c._periods[Y],1),y10:m(c._periods[Y],10),y100:m(c._periods[Y],100),y1000:m(c._periods[Y],1000),ol:l(O),on:this._minDigits(c,c._periods[O],1),onn:this._minDigits(c,c._periods[O],2),onnn:this._minDigits(c,c._periods[O],3),o1:m(c._periods[O],1),o10:m(c._periods[O],10),o100:m(c._periods[O],100),o1000:m(c._periods[O],1000),wl:l(W),wn:this._minDigits(c,c._periods[W],1),wnn:this._minDigits(c,c._periods[W],2),wnnn:this._minDigits(c,c._periods[W],3),w1:m(c._periods[W],1),w10:m(c._periods[W],10),w100:m(c._periods[W],100),w1000:m(c._periods[W],1000),dl:l(D),dn:this._minDigits(c,c._periods[D],1),dnn:this._minDigits(c,c._periods[D],2),dnnn:this._minDigits(c,c._periods[D],3),d1:m(c._periods[D],1),d10:m(c._periods[D],10),d100:m(c._periods[D],100),d1000:m(c._periods[D],1000),hl:l(H),hn:this._minDigits(c,c._periods[H],1),hnn:this._minDigits(c,c._periods[H],2),hnnn:this._minDigits(c,c._periods[H],3),h1:m(c._periods[H],1),h10:m(c._periods[H],10),h100:m(c._periods[H],100),h1000:m(c._periods[H],1000),ml:l(M),mn:this._minDigits(c,c._periods[M],1),mnn:this._minDigits(c,c._periods[M],2),mnnn:this._minDigits(c,c._periods[M],3),m1:m(c._periods[M],1),m10:m(c._periods[M],10),m100:m(c._periods[M],100),m1000:m(c._periods[M],1000),sl:l(S),sn:this._minDigits(c,c._periods[S],1),snn:this._minDigits(c,c._periods[S],2),snnn:this._minDigits(c,c._periods[S],3),s1:m(c._periods[S],1),s10:m(c._periods[S],10),s100:m(c._periods[S],100),s1000:m(c._periods[S],1000)};var p=e;for(var i=Y;i<=S;i++){var q='yowdhms'.charAt(i);var r=new RegExp('\\{'+q+'<\\}([\\s\\S]*)\\{'+q+'>\\}','g');p=p.replace(r,((!g&&d[i])||(g&&h[i])?'$1':''))}$.each(o,function(n,v){var a=new RegExp('\\{'+n+'\\}','g');p=p.replace(a,v)});return p},_minDigits:function(a,b,c){b=''+b;if(b.length>=c){return this._translateDigits(a,b)}b='0000000000'+b;return this._translateDigits(a,b.substr(b.length-c))},_translateDigits:function(b,c){return(''+c).replace(/[0-9]/g,function(a){return b.options.digits[a]})},_determineShow:function(a){var b=a.options.format;var c=[];c[Y]=(b.match('y')?'?':(b.match('Y')?'!':null));c[O]=(b.match('o')?'?':(b.match('O')?'!':null));c[W]=(b.match('w')?'?':(b.match('W')?'!':null));c[D]=(b.match('d')?'?':(b.match('D')?'!':null));c[H]=(b.match('h')?'?':(b.match('H')?'!':null));c[M]=(b.match('m')?'?':(b.match('M')?'!':null));c[S]=(b.match('s')?'?':(b.match('S')?'!':null));return c},_calculatePeriods:function(c,d,e,f){c._now=f;c._now.setMilliseconds(0);var g=new Date(c._now.getTime());if(c._since){if(f.getTime()<c._since.getTime()){c._now=f=g}else{f=c._since}}else{g.setTime(c._until.getTime());if(f.getTime()>c._until.getTime()){c._now=f=g}}var h=[0,0,0,0,0,0,0];if(d[Y]||d[O]){var i=this._getDaysInMonth(f.getFullYear(),f.getMonth());var j=this._getDaysInMonth(g.getFullYear(),g.getMonth());var k=(g.getDate()==f.getDate()||(g.getDate()>=Math.min(i,j)&&f.getDate()>=Math.min(i,j)));var l=function(a){return(a.getHours()*60+a.getMinutes())*60+a.getSeconds()};var m=Math.max(0,(g.getFullYear()-f.getFullYear())*12+g.getMonth()-f.getMonth()+((g.getDate()<f.getDate()&&!k)||(k&&l(g)<l(f))?-1:0));h[Y]=(d[Y]?Math.floor(m/12):0);h[O]=(d[O]?m-h[Y]*12:0);f=new Date(f.getTime());var n=(f.getDate()==i);var o=this._getDaysInMonth(f.getFullYear()+h[Y],f.getMonth()+h[O]);if(f.getDate()>o){f.setDate(o)}f.setFullYear(f.getFullYear()+h[Y]);f.setMonth(f.getMonth()+h[O]);if(n){f.setDate(o)}}var p=Math.floor((g.getTime()-f.getTime())/1000);var q=function(a,b){h[a]=(d[a]?Math.floor(p/b):0);p-=h[a]*b};q(W,604800);q(D,86400);q(H,3600);q(M,60);q(S,1);if(p>0&&!c._since){var r=[1,12,4.3482,7,24,60,60];var s=S;var t=1;for(var u=S;u>=Y;u--){if(d[u]){if(h[s]>=t){h[s]=0;p=1}if(p>0){h[u]++;p=0;s=u;t=1}}t*=r[u]}}if(e){for(var u=Y;u<=S;u++){if(e&&h[u]){e--}else if(!e){h[u]=0}}}return h}})})(jQuery);
!function(a,b){"function"==typeof define&&define.amd?define(["jquery"],b):"object"==typeof exports?module.exports=b(require("jquery")):b(a.jQuery)}(this,function(a){"function"!=typeof Object.create&&(Object.create=function(a){function b(){}return b.prototype=a,new b});var b={init:function(b){return this.options=a.extend({},a.noty.defaults,b),this.options.layout=this.options.custom?a.noty.layouts.inline:a.noty.layouts[this.options.layout],a.noty.themes[this.options.theme]?this.options.theme=a.noty.themes[this.options.theme]:this.options.themeClassName=this.options.theme,this.options=a.extend({},this.options,this.options.layout.options),this.options.id="noty_"+(new Date).getTime()*Math.floor(1e6*Math.random()),this._build(),this},_build:function(){var b=a('<div class="noty_bar noty_type_'+this.options.type+'"></div>').attr("id",this.options.id);if(b.append(this.options.template).find(".noty_text").html(this.options.text),this.$bar=null!==this.options.layout.parent.object?a(this.options.layout.parent.object).css(this.options.layout.parent.css).append(b):b,this.options.themeClassName&&this.$bar.addClass(this.options.themeClassName).addClass("noty_container_type_"+this.options.type),this.options.buttons){this.options.closeWith=[],this.options.timeout=!1;var c=a("<div/>").addClass("noty_buttons");null!==this.options.layout.parent.object?this.$bar.find(".noty_bar").append(c):this.$bar.append(c);var d=this;a.each(this.options.buttons,function(b,c){var e=a("<button/>").addClass(c.addClass?c.addClass:"gray").html(c.text).attr("id",c.id?c.id:"button-"+b).attr("title",c.title).appendTo(d.$bar.find(".noty_buttons")).on("click",function(b){a.isFunction(c.onClick)&&c.onClick.call(e,d,b)})})}this.$message=this.$bar.find(".noty_message"),this.$closeButton=this.$bar.find(".noty_close"),this.$buttons=this.$bar.find(".noty_buttons"),a.noty.store[this.options.id]=this},show:function(){var b=this;return b.options.custom?b.options.custom.find(b.options.layout.container.selector).append(b.$bar):a(b.options.layout.container.selector).append(b.$bar),b.options.theme&&b.options.theme.style&&b.options.theme.style.apply(b),"function"===a.type(b.options.layout.css)?this.options.layout.css.apply(b.$bar):b.$bar.css(this.options.layout.css||{}),b.$bar.addClass(b.options.layout.addClass),b.options.layout.container.style.apply(a(b.options.layout.container.selector),[b.options.within]),b.showing=!0,b.options.theme&&b.options.theme.style&&b.options.theme.callback.onShow.apply(this),a.inArray("click",b.options.closeWith)>-1&&b.$bar.css("cursor","pointer").one("click",function(a){b.stopPropagation(a),b.options.callback.onCloseClick&&b.options.callback.onCloseClick.apply(b),b.close()}),a.inArray("hover",b.options.closeWith)>-1&&b.$bar.one("mouseenter",function(){b.close()}),a.inArray("button",b.options.closeWith)>-1&&b.$closeButton.one("click",function(a){b.stopPropagation(a),b.close()}),-1==a.inArray("button",b.options.closeWith)&&b.$closeButton.remove(),b.options.callback.onShow&&b.options.callback.onShow.apply(b),"string"==typeof b.options.animation.open?(b.$bar.css("height",b.$bar.innerHeight()),b.$bar.on("click",function(a){b.wasClicked=!0}),b.$bar.show().addClass(b.options.animation.open).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",function(){b.options.callback.afterShow&&b.options.callback.afterShow.apply(b),b.showing=!1,b.shown=!0,b.hasOwnProperty("wasClicked")&&(b.$bar.off("click",function(a){b.wasClicked=!0}),b.close())})):b.$bar.animate(b.options.animation.open,b.options.animation.speed,b.options.animation.easing,function(){b.options.callback.afterShow&&b.options.callback.afterShow.apply(b),b.showing=!1,b.shown=!0}),b.options.timeout&&b.$bar.delay(b.options.timeout).promise().done(function(){b.close()}),this},close:function(){if(!(this.closed||this.$bar&&this.$bar.hasClass("i-am-closing-now"))){var b=this;if(this.showing)return void b.$bar.queue(function(){b.close.apply(b)});if(!this.shown&&!this.showing){var c=[];return a.each(a.noty.queue,function(a,d){d.options.id!=b.options.id&&c.push(d)}),void(a.noty.queue=c)}b.$bar.addClass("i-am-closing-now"),b.options.callback.onClose&&b.options.callback.onClose.apply(b),"string"==typeof b.options.animation.close?b.$bar.addClass(b.options.animation.close).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",function(){b.options.callback.afterClose&&b.options.callback.afterClose.apply(b),b.closeCleanUp()}):b.$bar.clearQueue().stop().animate(b.options.animation.close,b.options.animation.speed,b.options.animation.easing,function(){b.options.callback.afterClose&&b.options.callback.afterClose.apply(b)}).promise().done(function(){b.closeCleanUp()})}},closeCleanUp:function(){var b=this;b.options.modal&&(a.notyRenderer.setModalCount(-1),0==a.notyRenderer.getModalCount()&&a(".noty_modal").fadeOut(b.options.animation.fadeSpeed,function(){a(this).remove()})),a.notyRenderer.setLayoutCountFor(b,-1),0==a.notyRenderer.getLayoutCountFor(b)&&a(b.options.layout.container.selector).remove(),"undefined"!=typeof b.$bar&&null!==b.$bar&&("string"==typeof b.options.animation.close?(b.$bar.css("transition","all 100ms ease").css("border",0).css("margin",0).height(0),b.$bar.one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd",function(){b.$bar.remove(),b.$bar=null,b.closed=!0,b.options.theme.callback&&b.options.theme.callback.onClose&&b.options.theme.callback.onClose.apply(b)})):(b.$bar.remove(),b.$bar=null,b.closed=!0)),delete a.noty.store[b.options.id],b.options.theme.callback&&b.options.theme.callback.onClose&&b.options.theme.callback.onClose.apply(b),b.options.dismissQueue||(a.noty.ontap=!0,a.notyRenderer.render()),b.options.maxVisible>0&&b.options.dismissQueue&&a.notyRenderer.render()},setText:function(a){return this.closed||(this.options.text=a,this.$bar.find(".noty_text").html(a)),this},setType:function(a){return this.closed||(this.options.type=a,this.options.theme.style.apply(this),this.options.theme.callback.onShow.apply(this)),this},setTimeout:function(a){if(!this.closed){var b=this;this.options.timeout=a,b.$bar.delay(b.options.timeout).promise().done(function(){b.close()})}return this},stopPropagation:function(a){a=a||window.event,"undefined"!=typeof a.stopPropagation?a.stopPropagation():a.cancelBubble=!0},closed:!1,showing:!1,shown:!1};a.notyRenderer={},a.notyRenderer.init=function(c){var d=Object.create(b).init(c);return d.options.killer&&a.noty.closeAll(),d.options.force?a.noty.queue.unshift(d):a.noty.queue.push(d),a.notyRenderer.render(),"object"==a.noty.returns?d:d.options.id},a.notyRenderer.render=function(){var b=a.noty.queue[0];"object"===a.type(b)?b.options.dismissQueue?b.options.maxVisible>0?a(b.options.layout.container.selector+" > li").length<b.options.maxVisible&&a.notyRenderer.show(a.noty.queue.shift()):a.notyRenderer.show(a.noty.queue.shift()):a.noty.ontap&&(a.notyRenderer.show(a.noty.queue.shift()),a.noty.ontap=!1):a.noty.ontap=!0},a.notyRenderer.show=function(b){b.options.modal&&(a.notyRenderer.createModalFor(b),a.notyRenderer.setModalCount(1)),b.options.custom?0==b.options.custom.find(b.options.layout.container.selector).length?b.options.custom.append(a(b.options.layout.container.object).addClass("i-am-new")):b.options.custom.find(b.options.layout.container.selector).removeClass("i-am-new"):0==a(b.options.layout.container.selector).length?a("body").append(a(b.options.layout.container.object).addClass("i-am-new")):a(b.options.layout.container.selector).removeClass("i-am-new"),a.notyRenderer.setLayoutCountFor(b,1),b.show()},a.notyRenderer.createModalFor=function(b){if(0==a(".noty_modal").length){var c=a("<div/>").addClass("noty_modal").addClass(b.options.theme).data("noty_modal_count",0);b.options.theme.modal&&b.options.theme.modal.css&&c.css(b.options.theme.modal.css),c.prependTo(a("body")).fadeIn(b.options.animation.fadeSpeed),a.inArray("backdrop",b.options.closeWith)>-1&&c.on("click",function(b){a.noty.closeAll()})}},a.notyRenderer.getLayoutCountFor=function(b){return a(b.options.layout.container.selector).data("noty_layout_count")||0},a.notyRenderer.setLayoutCountFor=function(b,c){return a(b.options.layout.container.selector).data("noty_layout_count",a.notyRenderer.getLayoutCountFor(b)+c)},a.notyRenderer.getModalCount=function(){return a(".noty_modal").data("noty_modal_count")||0},a.notyRenderer.setModalCount=function(b){return a(".noty_modal").data("noty_modal_count",a.notyRenderer.getModalCount()+b)},a.fn.noty=function(b){return b.custom=a(this),a.notyRenderer.init(b)},a.noty={},a.noty.queue=[],a.noty.ontap=!0,a.noty.layouts={},a.noty.themes={},a.noty.returns="object",a.noty.store={},a.noty.get=function(b){return a.noty.store.hasOwnProperty(b)?a.noty.store[b]:!1},a.noty.close=function(b){return a.noty.get(b)?a.noty.get(b).close():!1},a.noty.setText=function(b,c){return a.noty.get(b)?a.noty.get(b).setText(c):!1},a.noty.setType=function(b,c){return a.noty.get(b)?a.noty.get(b).setType(c):!1},a.noty.clearQueue=function(){a.noty.queue=[]},a.noty.closeAll=function(){a.noty.clearQueue(),a.each(a.noty.store,function(a,b){b.close()})};var c=window.alert;return a.noty.consumeAlert=function(b){window.alert=function(c){b?b.text=c:b={text:c},a.notyRenderer.init(b)}},a.noty.stopConsumeAlert=function(){window.alert=c},a.noty.defaults={layout:"top",theme:"defaultTheme",type:"alert",text:"",dismissQueue:!0,template:'<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>',animation:{open:{height:"toggle"},close:{height:"toggle"},easing:"swing",speed:500,fadeSpeed:"fast"},timeout:!1,force:!1,modal:!1,maxVisible:5,killer:!1,closeWith:["click"],callback:{onShow:function(){},afterShow:function(){},onClose:function(){},afterClose:function(){},onCloseClick:function(){}},buttons:!1},a(window).on("resize",function(){a.each(a.noty.layouts,function(b,c){c.container.style.apply(a(c.container.selector))})}),window.noty=function(b){return a.notyRenderer.init(b)},a.noty.layouts.bottom={name:"bottom",options:{},container:{object:'<ul id="noty_bottom_layout_container" />',selector:"ul#noty_bottom_layout_container",style:function(){a(this).css({bottom:0,left:"5%",position:"fixed",width:"90%",height:"auto",margin:0,padding:0,listStyleType:"none",zIndex:9999999})}},parent:{object:"<li />",selector:"li",css:{}},css:{display:"none"},addClass:""},a.noty.layouts.bottomCenter={name:"bottomCenter",options:{},container:{object:'<ul id="noty_bottomCenter_layout_container" />',selector:"ul#noty_bottomCenter_layout_container",style:function(){a(this).css({bottom:20,left:0,position:"fixed",width:"310px",height:"auto",margin:0,padding:0,listStyleType:"none",zIndex:1e7}),a(this).css({left:(a(window).width()-a(this).outerWidth(!1))/2+"px"})}},parent:{object:"<li />",selector:"li",css:{}},css:{display:"none",width:"310px"},addClass:""},a.noty.layouts.bottomLeft={name:"bottomLeft",options:{},container:{object:'<ul id="noty_bottomLeft_layout_container" />',selector:"ul#noty_bottomLeft_layout_container",style:function(){a(this).css({bottom:20,left:20,position:"fixed",width:"310px",height:"auto",margin:0,padding:0,listStyleType:"none",zIndex:1e7}),window.innerWidth<600&&a(this).css({left:5})}},parent:{object:"<li />",selector:"li",css:{}},css:{display:"none",width:"310px"},addClass:""},a.noty.layouts.bottomRight={name:"bottomRight",options:{},container:{object:'<ul id="noty_bottomRight_layout_container" />',selector:"ul#noty_bottomRight_layout_container",style:function(){a(this).css({bottom:20,right:20,position:"fixed",width:"310px",height:"auto",margin:0,padding:0,listStyleType:"none",zIndex:1e7}),window.innerWidth<600&&a(this).css({right:5})}},parent:{object:"<li />",selector:"li",css:{}},css:{display:"none",width:"310px"},addClass:""},a.noty.layouts.center={name:"center",options:{},container:{object:'<ul id="noty_center_layout_container" />',selector:"ul#noty_center_layout_container",style:function(){a(this).css({position:"fixed",width:"310px",height:"auto",margin:0,padding:0,listStyleType:"none",zIndex:1e7});var b=a(this).clone().css({visibility:"hidden",display:"block",position:"absolute",top:0,left:0}).attr("id","dupe");a("body").append(b),b.find(".i-am-closing-now").remove(),b.find("li").css("display","block");var c=b.height();b.remove(),a(this).hasClass("i-am-new")?a(this).css({left:(a(window).width()-a(this).outerWidth(!1))/2+"px",top:(a(window).height()-c)/2+"px"}):a(this).animate({left:(a(window).width()-a(this).outerWidth(!1))/2+"px",top:(a(window).height()-c)/2+"px"},500)}},parent:{object:"<li />",selector:"li",css:{}},css:{display:"none",width:"310px"},addClass:""},a.noty.layouts.centerLeft={name:"centerLeft",options:{},container:{object:'<ul id="noty_centerLeft_layout_container" />',selector:"ul#noty_centerLeft_layout_container",style:function(){a(this).css({left:20,position:"fixed",width:"310px",height:"auto",margin:0,padding:0,listStyleType:"none",zIndex:1e7});var b=a(this).clone().css({visibility:"hidden",display:"block",position:"absolute",top:0,left:0}).attr("id","dupe");a("body").append(b),b.find(".i-am-closing-now").remove(),b.find("li").css("display","block");var c=b.height();b.remove(),a(this).hasClass("i-am-new")?a(this).css({top:(a(window).height()-c)/2+"px"}):a(this).animate({top:(a(window).height()-c)/2+"px"},500),window.innerWidth<600&&a(this).css({left:5})}},parent:{object:"<li />",selector:"li",css:{}},css:{display:"none",width:"310px"},addClass:""},a.noty.layouts.centerRight={name:"centerRight",options:{},container:{object:'<ul id="noty_centerRight_layout_container" />',selector:"ul#noty_centerRight_layout_container",style:function(){a(this).css({right:20,position:"fixed",width:"310px",height:"auto",margin:0,padding:0,listStyleType:"none",zIndex:1e7});var b=a(this).clone().css({visibility:"hidden",display:"block",position:"absolute",top:0,left:0}).attr("id","dupe");a("body").append(b),b.find(".i-am-closing-now").remove(),b.find("li").css("display","block");var c=b.height();b.remove(),a(this).hasClass("i-am-new")?a(this).css({top:(a(window).height()-c)/2+"px"}):a(this).animate({top:(a(window).height()-c)/2+"px"},500),window.innerWidth<600&&a(this).css({right:5})}},parent:{object:"<li />",selector:"li",css:{}},css:{display:"none",width:"310px"},addClass:""},a.noty.layouts.inline={name:"inline",options:{},container:{object:'<ul class="noty_inline_layout_container" />',selector:"ul.noty_inline_layout_container",style:function(){a(this).css({width:"100%",height:"auto",margin:0,padding:0,listStyleType:"none",zIndex:9999999})}},parent:{object:"<li />",selector:"li",css:{}},css:{display:"none"},addClass:""},a.noty.layouts.top={name:"top",options:{},container:{object:'<ul id="noty_top_layout_container" />',selector:"ul#noty_top_layout_container",style:function(){a(this).css({top:0,left:"5%",position:"fixed",width:"90%",height:"auto",margin:0,padding:0,listStyleType:"none",zIndex:9999999})}},parent:{object:"<li />",selector:"li",css:{}},css:{display:"none"},addClass:""},a.noty.layouts.topCenter={name:"topCenter",options:{},container:{object:'<ul id="noty_topCenter_layout_container" />',selector:"ul#noty_topCenter_layout_container",style:function(){a(this).css({top:20,left:0,position:"fixed",width:"310px",height:"auto",margin:0,padding:0,listStyleType:"none",zIndex:1e7}),a(this).css({left:(a(window).width()-a(this).outerWidth(!1))/2+"px"})}},parent:{object:"<li />",selector:"li",css:{}},css:{display:"none",width:"310px"},addClass:""},a.noty.layouts.topLeft={name:"topLeft",options:{},container:{object:'<ul id="noty_topLeft_layout_container" />',selector:"ul#noty_topLeft_layout_container",style:function(){a(this).css({top:20,left:20,position:"fixed",width:"310px",height:"auto",margin:0,padding:0,listStyleType:"none",zIndex:1e7}),window.innerWidth<600&&a(this).css({left:5})}},parent:{object:"<li />",selector:"li",css:{}},css:{display:"none",width:"310px"},addClass:""},a.noty.layouts.topRight={name:"topRight",options:{},container:{object:'<ul id="noty_topRight_layout_container" />',selector:"ul#noty_topRight_layout_container",style:function(){a(this).css({top:20,right:20,position:"fixed",width:"310px",height:"auto",margin:0,padding:0,listStyleType:"none",zIndex:1e7}),window.innerWidth<600&&a(this).css({right:5})}},parent:{object:"<li />",selector:"li",css:{}},css:{display:"none",width:"310px"},addClass:""},a.noty.themes.bootstrapTheme={name:"bootstrapTheme",modal:{css:{position:"fixed",width:"100%",height:"100%",backgroundColor:"#000",zIndex:1e4,opacity:.6,display:"none",left:0,top:0}},style:function(){var b=this.options.layout.container.selector;switch(a(b).addClass("list-group"),this.$closeButton.append('<span aria-hidden="true">&times;</span><span class="sr-only">Close</span>'),this.$closeButton.addClass("close"),this.$bar.addClass("list-group-item").css("padding","0px"),this.options.type){case"alert":case"notification":this.$bar.addClass("list-group-item-info");break;case"warning":this.$bar.addClass("list-group-item-warning");break;case"error":this.$bar.addClass("list-group-item-danger");break;case"information":this.$bar.addClass("list-group-item-info");break;case"success":this.$bar.addClass("list-group-item-success")}this.$message.css({fontSize:"13px",lineHeight:"16px",textAlign:"center",padding:"8px 10px 9px",width:"auto",position:"relative"})},callback:{onShow:function(){},onClose:function(){}}},a.noty.themes.defaultTheme={name:"defaultTheme",helpers:{borderFix:function(){if(this.options.dismissQueue){var b=this.options.layout.container.selector+" "+this.options.layout.parent.selector;switch(this.options.layout.name){case"top":a(b).css({borderRadius:"0px 0px 0px 0px"}),a(b).last().css({borderRadius:"0px 0px 5px 5px"});break;case"topCenter":case"topLeft":case"topRight":case"bottomCenter":case"bottomLeft":case"bottomRight":case"center":case"centerLeft":case"centerRight":case"inline":a(b).css({borderRadius:"0px 0px 0px 0px"}),a(b).first().css({"border-top-left-radius":"5px","border-top-right-radius":"5px"}),a(b).last().css({"border-bottom-left-radius":"5px","border-bottom-right-radius":"5px"});break;case"bottom":a(b).css({borderRadius:"0px 0px 0px 0px"}),a(b).first().css({borderRadius:"5px 5px 0px 0px"})}}}},modal:{css:{position:"fixed",width:"100%",height:"100%",backgroundColor:"#000",zIndex:1e4,opacity:.6,display:"none",left:0,top:0}},style:function(){switch(this.$bar.css({overflow:"hidden",background:"url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAoCAQAAAClM0ndAAAAhklEQVR4AdXO0QrCMBBE0bttkk38/w8WRERpdyjzVOc+HxhIHqJGMQcFFkpYRQotLLSw0IJ5aBdovruMYDA/kT8plF9ZKLFQcgF18hDj1SbQOMlCA4kao0iiXmah7qBWPdxpohsgVZyj7e5I9KcID+EhiDI5gxBYKLBQYKHAQoGFAoEks/YEGHYKB7hFxf0AAAAASUVORK5CYII=') repeat-x scroll left top #fff"}),this.$message.css({fontSize:"13px",lineHeight:"16px",textAlign:"center",padding:"8px 10px 9px",width:"auto",position:"relative"}),this.$closeButton.css({position:"absolute",top:4,right:4,width:10,height:10,background:"url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAQAAAAnOwc2AAAAxUlEQVR4AR3MPUoDURSA0e++uSkkOxC3IAOWNtaCIDaChfgXBMEZbQRByxCwk+BasgQRZLSYoLgDQbARxry8nyumPcVRKDfd0Aa8AsgDv1zp6pYd5jWOwhvebRTbzNNEw5BSsIpsj/kurQBnmk7sIFcCF5yyZPDRG6trQhujXYosaFoc+2f1MJ89uc76IND6F9BvlXUdpb6xwD2+4q3me3bysiHvtLYrUJto7PD/ve7LNHxSg/woN2kSz4txasBdhyiz3ugPGetTjm3XRokAAAAASUVORK5CYII=)",display:"none",cursor:"pointer"}),this.$buttons.css({padding:5,textAlign:"right",borderTop:"1px solid #ccc",backgroundColor:"#fff"}),this.$buttons.find("button").css({marginLeft:5}),this.$buttons.find("button:first").css({marginLeft:0}),this.$bar.on({mouseenter:function(){a(this).find(".noty_close").stop().fadeTo("normal",1)},mouseleave:function(){a(this).find(".noty_close").stop().fadeTo("normal",0)}}),this.options.layout.name){case"top":this.$bar.css({borderRadius:"0px 0px 5px 5px",borderBottom:"2px solid #eee",borderLeft:"2px solid #eee",borderRight:"2px solid #eee",boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)"});break;case"topCenter":case"center":case"bottomCenter":case"inline":this.$bar.css({borderRadius:"5px",border:"1px solid #eee",boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)"}),this.$message.css({fontSize:"13px",textAlign:"center"});break;case"topLeft":case"topRight":case"bottomLeft":case"bottomRight":case"centerLeft":case"centerRight":this.$bar.css({borderRadius:"5px",border:"1px solid #eee",boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)"}),this.$message.css({fontSize:"13px",textAlign:"left"});break;case"bottom":this.$bar.css({borderRadius:"5px 5px 0px 0px",borderTop:"2px solid #eee",borderLeft:"2px solid #eee",borderRight:"2px solid #eee",boxShadow:"0 -2px 4px rgba(0, 0, 0, 0.1)"});break;default:this.$bar.css({border:"2px solid #eee",boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)"})}switch(this.options.type){case"alert":case"notification":this.$bar.css({backgroundColor:"#FFF",borderColor:"#CCC",color:"#444"});break;case"warning":this.$bar.css({backgroundColor:"#FFEAA8",borderColor:"#FFC237",color:"#826200"}),this.$buttons.css({borderTop:"1px solid #FFC237"});break;case"error":this.$bar.css({backgroundColor:"red",borderColor:"darkred",color:"#FFF"}),this.$message.css({fontWeight:"bold"}),this.$buttons.css({borderTop:"1px solid darkred"});break;case"information":this.$bar.css({backgroundColor:"#57B7E2",borderColor:"#0B90C4",color:"#FFF"}),this.$buttons.css({borderTop:"1px solid #0B90C4"});break;case"success":this.$bar.css({backgroundColor:"lightgreen",borderColor:"#50C24E",color:"darkgreen"}),this.$buttons.css({borderTop:"1px solid #50C24E"});break;default:this.$bar.css({backgroundColor:"#FFF",borderColor:"#CCC",color:"#444"})}},callback:{onShow:function(){a.noty.themes.defaultTheme.helpers.borderFix.apply(this)},onClose:function(){a.noty.themes.defaultTheme.helpers.borderFix.apply(this)}}},a.noty.themes.relax={name:"relax",helpers:{},modal:{css:{position:"fixed",width:"100%",height:"100%",backgroundColor:"#000",zIndex:1e4,opacity:.6,display:"none",left:0,top:0}},style:function(){switch(this.$bar.css({overflow:"hidden",margin:"4px 0",borderRadius:"2px"}),this.$message.css({fontSize:"14px",lineHeight:"16px",textAlign:"center",padding:"10px",width:"auto",position:"relative"}),this.$closeButton.css({position:"absolute",top:4,right:4,width:10,height:10,background:"url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAQAAAAnOwc2AAAAxUlEQVR4AR3MPUoDURSA0e++uSkkOxC3IAOWNtaCIDaChfgXBMEZbQRByxCwk+BasgQRZLSYoLgDQbARxry8nyumPcVRKDfd0Aa8AsgDv1zp6pYd5jWOwhvebRTbzNNEw5BSsIpsj/kurQBnmk7sIFcCF5yyZPDRG6trQhujXYosaFoc+2f1MJ89uc76IND6F9BvlXUdpb6xwD2+4q3me3bysiHvtLYrUJto7PD/ve7LNHxSg/woN2kSz4txasBdhyiz3ugPGetTjm3XRokAAAAASUVORK5CYII=)",display:"none",cursor:"pointer"}),this.$buttons.css({padding:5,textAlign:"right",borderTop:"1px solid #ccc",backgroundColor:"#fff"}),this.$buttons.find("button").css({marginLeft:5}),this.$buttons.find("button:first").css({marginLeft:0}),this.$bar.on({mouseenter:function(){a(this).find(".noty_close").stop().fadeTo("normal",1)},mouseleave:function(){a(this).find(".noty_close").stop().fadeTo("normal",0)}}),this.options.layout.name){case"top":this.$bar.css({borderBottom:"2px solid #eee",borderLeft:"2px solid #eee",borderRight:"2px solid #eee",borderTop:"2px solid #eee",boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)"});break;case"topCenter":case"center":case"bottomCenter":case"inline":this.$bar.css({border:"1px solid #eee",boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)"}),this.$message.css({fontSize:"13px",textAlign:"center"});break;case"topLeft":case"topRight":case"bottomLeft":case"bottomRight":case"centerLeft":case"centerRight":this.$bar.css({border:"1px solid #eee",boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)"}),this.$message.css({fontSize:"13px",textAlign:"left"});break;case"bottom":this.$bar.css({borderTop:"2px solid #eee",borderLeft:"2px solid #eee",borderRight:"2px solid #eee",borderBottom:"2px solid #eee",boxShadow:"0 -2px 4px rgba(0, 0, 0, 0.1)"});break;default:this.$bar.css({border:"2px solid #eee",boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)"})}switch(this.options.type){case"alert":case"notification":this.$bar.css({backgroundColor:"#FFF",borderColor:"#dedede",color:"#444"});break;case"warning":this.$bar.css({backgroundColor:"#FFEAA8",borderColor:"#FFC237",color:"#826200"}),this.$buttons.css({borderTop:"1px solid #FFC237"});break;case"error":this.$bar.css({backgroundColor:"#FF8181",borderColor:"#e25353",color:"#FFF"}),this.$message.css({fontWeight:"bold"}),this.$buttons.css({borderTop:"1px solid darkred"});break;case"information":this.$bar.css({backgroundColor:"#78C5E7",borderColor:"#3badd6",color:"#FFF"}),this.$buttons.css({borderTop:"1px solid #0B90C4"});break;case"success":this.$bar.css({backgroundColor:"#BCF5BC",borderColor:"#7cdd77",color:"darkgreen"}),this.$buttons.css({borderTop:"1px solid #50C24E"});break;default:this.$bar.css({backgroundColor:"#FFF",borderColor:"#CCC",color:"#444"})}},callback:{onShow:function(){},onClose:function(){}}},window.noty});
/*!
 * MockJax - jQuery Plugin to Mock Ajax requests
 *
 * Version:  1.5.3
 * Released:
 * Home:   http://github.com/appendto/jquery-mockjax
 * Author:   Jonathan Sharp (http://jdsharp.com)
 * License:  MIT,GPL
 *
 * Copyright (c) 2011 appendTo LLC.
 * Dual licensed under the MIT or GPL licenses.
 * http://appendto.com/open-source-licenses
 */
(function($) {
	var _ajax = $.ajax,
		mockHandlers = [],
		mockedAjaxCalls = [],
		CALLBACK_REGEX = /=\?(&|$)/,
		jsc = (new Date()).getTime();


	// Parse the given XML string.
	function parseXML(xml) {
		if ( window.DOMParser == undefined && window.ActiveXObject ) {
			DOMParser = function() { };
			DOMParser.prototype.parseFromString = function( xmlString ) {
				var doc = new ActiveXObject('Microsoft.XMLDOM');
				doc.async = 'false';
				doc.loadXML( xmlString );
				return doc;
			};
		}

		try {
			var xmlDoc = ( new DOMParser() ).parseFromString( xml, 'text/xml' );
			if ( $.isXMLDoc( xmlDoc ) ) {
				var err = $('parsererror', xmlDoc);
				if ( err.length == 1 ) {
					throw('Error: ' + $(xmlDoc).text() );
				}
			} else {
				throw('Unable to parse XML');
			}
			return xmlDoc;
		} catch( e ) {
			var msg = ( e.name == undefined ? e : e.name + ': ' + e.message );
			$(document).trigger('xmlParseError', [ msg ]);
			return undefined;
		}
	}

	// Trigger a jQuery event
	function trigger(s, type, args) {
		(s.context ? $(s.context) : $.event).trigger(type, args);
	}

	// Check if the data field on the mock handler and the request match. This
	// can be used to restrict a mock handler to being used only when a certain
	// set of data is passed to it.
	function isMockDataEqual( mock, live ) {
		var identical = true;
		// Test for situations where the data is a querystring (not an object)
		if (typeof live === 'string') {
			// Querystring may be a regex
			return $.isFunction( mock.test ) ? mock.test(live) : mock == live;
		}
		$.each(mock, function(k) {
			if ( live[k] === undefined ) {
				identical = false;
				return identical;
			} else {
				if ( typeof live[k] === 'object' && live[k] !== null ) {
					if ( identical && $.isArray( live[k] ) ) {
						identical = $.isArray( mock[k] ) && live[k].length === mock[k].length;
					}
					identical = identical && isMockDataEqual(mock[k], live[k]);
				} else {
					if ( mock[k] && $.isFunction( mock[k].test ) ) {
						identical = identical && mock[k].test(live[k]);
					} else {
						identical = identical && ( mock[k] == live[k] );
					}
				}
			}
		});

		return identical;
	}

    // See if a mock handler property matches the default settings
    function isDefaultSetting(handler, property) {
        return handler[property] === $.mockjaxSettings[property];
    }

	// Check the given handler should mock the given request
	function getMockForRequest( handler, requestSettings ) {
		// If the mock was registered with a function, let the function decide if we
		// want to mock this request
		if ( $.isFunction(handler) ) {
			return handler( requestSettings );
		}

		// Inspect the URL of the request and check if the mock handler's url
		// matches the url for this ajax request
		if ( $.isFunction(handler.url.test) ) {
			// The user provided a regex for the url, test it
			if ( !handler.url.test( requestSettings.url ) ) {
				return null;
			}
		} else {
			// Look for a simple wildcard '*' or a direct URL match
			var star = handler.url.indexOf('*');
			if (handler.url !== requestSettings.url && star === -1 ||
					!new RegExp(handler.url.replace(/[-[\]{}()+?.,\\^$|#\s]/g, "\\$&").replace(/\*/g, '.+')).test(requestSettings.url)) {
				return null;
			}
		}

		// Inspect the data submitted in the request (either POST body or GET query string)
		if ( handler.data ) {
			if ( ! requestSettings.data || !isMockDataEqual(handler.data, requestSettings.data) ) {
				// They're not identical, do not mock this request
				return null;
			}
		}
		// Inspect the request type
		if ( handler && handler.type &&
				handler.type.toLowerCase() != requestSettings.type.toLowerCase() ) {
			// The request type doesn't match (GET vs. POST)
			return null;
		}

		return handler;
	}

	// Process the xhr objects send operation
	function _xhrSend(mockHandler, requestSettings, origSettings) {

		// This is a substitute for < 1.4 which lacks $.proxy
		var process = (function(that) {
			return function() {
				return (function() {
					var onReady;

					// The request has returned
					this.status     = mockHandler.status;
					this.statusText = mockHandler.statusText;
					this.readyState	= 4;

					// We have an executable function, call it to give
					// the mock handler a chance to update it's data
					if ( $.isFunction(mockHandler.response) ) {
						mockHandler.response(origSettings);
					}
					// Copy over our mock to our xhr object before passing control back to
					// jQuery's onreadystatechange callback
					if ( requestSettings.dataType == 'json' && ( typeof mockHandler.responseText == 'object' ) ) {
						this.responseText = JSON.stringify(mockHandler.responseText);
					} else if ( requestSettings.dataType == 'xml' ) {
						if ( typeof mockHandler.responseXML == 'string' ) {
							this.responseXML = parseXML(mockHandler.responseXML);
							//in jQuery 1.9.1+, responseXML is processed differently and relies on responseText
							this.responseText = mockHandler.responseXML;
						} else {
							this.responseXML = mockHandler.responseXML;
						}
					} else {
						this.responseText = mockHandler.responseText;
					}
					if( typeof mockHandler.status == 'number' || typeof mockHandler.status == 'string' ) {
						this.status = mockHandler.status;
					}
					if( typeof mockHandler.statusText === "string") {
						this.statusText = mockHandler.statusText;
					}
					// jQuery 2.0 renamed onreadystatechange to onload
					onReady = this.onreadystatechange || this.onload;

					// jQuery < 1.4 doesn't have onreadystate change for xhr
					if ( $.isFunction( onReady ) ) {
						if( mockHandler.isTimeout) {
							this.status = -1;
						}
						onReady.call( this, mockHandler.isTimeout ? 'timeout' : undefined );
					} else if ( mockHandler.isTimeout ) {
						// Fix for 1.3.2 timeout to keep success from firing.
						this.status = -1;
					}
				}).apply(that);
			};
		})(this);

		if ( mockHandler.proxy ) {
			// We're proxying this request and loading in an external file instead
			_ajax({
				global: false,
				url: mockHandler.proxy,
				type: mockHandler.proxyType,
				data: mockHandler.data,
				dataType: requestSettings.dataType === "script" ? "text/plain" : requestSettings.dataType,
				complete: function(xhr) {
					mockHandler.responseXML = xhr.responseXML;
					mockHandler.responseText = xhr.responseText;
                    // Don't override the handler status/statusText if it's specified by the config
                    if (isDefaultSetting(mockHandler, 'status')) {
					    mockHandler.status = xhr.status;
                    }
                    if (isDefaultSetting(mockHandler, 'statusText')) {
					    mockHandler.statusText = xhr.statusText;
                    }

					this.responseTimer = setTimeout(process, mockHandler.responseTime || 0);
				}
			});
		} else {
			// type == 'POST' || 'GET' || 'DELETE'
			if ( requestSettings.async === false ) {
				// TODO: Blocking delay
				process();
			} else {
				this.responseTimer = setTimeout(process, mockHandler.responseTime || 50);
			}
		}
	}

	// Construct a mocked XHR Object
	function xhr(mockHandler, requestSettings, origSettings, origHandler) {
		// Extend with our default mockjax settings
		mockHandler = $.extend(true, {}, $.mockjaxSettings, mockHandler);

		if (typeof mockHandler.headers === 'undefined') {
			mockHandler.headers = {};
		}
		if ( mockHandler.contentType ) {
			mockHandler.headers['content-type'] = mockHandler.contentType;
		}

		return {
			status: mockHandler.status,
			statusText: mockHandler.statusText,
			readyState: 1,
			open: function() { },
			send: function() {
				origHandler.fired = true;
				_xhrSend.call(this, mockHandler, requestSettings, origSettings);
			},
			abort: function() {
				clearTimeout(this.responseTimer);
			},
			setRequestHeader: function(header, value) {
				mockHandler.headers[header] = value;
			},
			getResponseHeader: function(header) {
				// 'Last-modified', 'Etag', 'content-type' are all checked by jQuery
				if ( mockHandler.headers && mockHandler.headers[header] ) {
					// Return arbitrary headers
					return mockHandler.headers[header];
				} else if ( header.toLowerCase() == 'last-modified' ) {
					return mockHandler.lastModified || (new Date()).toString();
				} else if ( header.toLowerCase() == 'etag' ) {
					return mockHandler.etag || '';
				} else if ( header.toLowerCase() == 'content-type' ) {
					return mockHandler.contentType || 'text/plain';
				}
			},
			getAllResponseHeaders: function() {
				var headers = '';
				$.each(mockHandler.headers, function(k, v) {
					headers += k + ': ' + v + "\n";
				});
				return headers;
			}
		};
	}

	// Process a JSONP mock request.
	function processJsonpMock( requestSettings, mockHandler, origSettings ) {
		// Handle JSONP Parameter Callbacks, we need to replicate some of the jQuery core here
		// because there isn't an easy hook for the cross domain script tag of jsonp

		processJsonpUrl( requestSettings );

		requestSettings.dataType = "json";
		if(requestSettings.data && CALLBACK_REGEX.test(requestSettings.data) || CALLBACK_REGEX.test(requestSettings.url)) {
			createJsonpCallback(requestSettings, mockHandler, origSettings);

			// We need to make sure
			// that a JSONP style response is executed properly

			var rurl = /^(\w+:)?\/\/([^\/?#]+)/,
				parts = rurl.exec( requestSettings.url ),
				remote = parts && (parts[1] && parts[1] !== location.protocol || parts[2] !== location.host);

			requestSettings.dataType = "script";
			if(requestSettings.type.toUpperCase() === "GET" && remote ) {
				var newMockReturn = processJsonpRequest( requestSettings, mockHandler, origSettings );

				// Check if we are supposed to return a Deferred back to the mock call, or just
				// signal success
				if(newMockReturn) {
					return newMockReturn;
				} else {
					return true;
				}
			}
		}
		return null;
	}

	// Append the required callback parameter to the end of the request URL, for a JSONP request
	function processJsonpUrl( requestSettings ) {
		if ( requestSettings.type.toUpperCase() === "GET" ) {
			if ( !CALLBACK_REGEX.test( requestSettings.url ) ) {
				requestSettings.url += (/\?/.test( requestSettings.url ) ? "&" : "?") +
					(requestSettings.jsonp || "callback") + "=?";
			}
		} else if ( !requestSettings.data || !CALLBACK_REGEX.test(requestSettings.data) ) {
			requestSettings.data = (requestSettings.data ? requestSettings.data + "&" : "") + (requestSettings.jsonp || "callback") + "=?";
		}
	}

	// Process a JSONP request by evaluating the mocked response text
	function processJsonpRequest( requestSettings, mockHandler, origSettings ) {
		// Synthesize the mock request for adding a script tag
		var callbackContext = origSettings && origSettings.context || requestSettings,
			newMock = null;


		// If the response handler on the moock is a function, call it
		if ( mockHandler.response && $.isFunction(mockHandler.response) ) {
			mockHandler.response(origSettings);
		} else {

			// Evaluate the responseText javascript in a global context
			if( typeof mockHandler.responseText === 'object' ) {
				$.globalEval( '(' + JSON.stringify( mockHandler.responseText ) + ')');
			} else {
				$.globalEval( '(' + mockHandler.responseText + ')');
			}
		}

		// Successful response
		jsonpSuccess( requestSettings, callbackContext, mockHandler );
		jsonpComplete( requestSettings, callbackContext, mockHandler );

		// If we are running under jQuery 1.5+, return a deferred object
		if($.Deferred){
			newMock = new $.Deferred();
			if(typeof mockHandler.responseText == "object"){
				newMock.resolveWith( callbackContext, [mockHandler.responseText] );
			}
			else{
				newMock.resolveWith( callbackContext, [$.parseJSON( mockHandler.responseText )] );
			}
		}
		return newMock;
	}


	// Create the required JSONP callback function for the request
	function createJsonpCallback( requestSettings, mockHandler, origSettings ) {
		var callbackContext = origSettings && origSettings.context || requestSettings;
		var jsonp = requestSettings.jsonpCallback || ("jsonp" + jsc++);

		// Replace the =? sequence both in the query string and the data
		if ( requestSettings.data ) {
			requestSettings.data = (requestSettings.data + "").replace(CALLBACK_REGEX, "=" + jsonp + "$1");
		}

		requestSettings.url = requestSettings.url.replace(CALLBACK_REGEX, "=" + jsonp + "$1");


		// Handle JSONP-style loading
		window[ jsonp ] = window[ jsonp ] || function( tmp ) {
			data = tmp;
			jsonpSuccess( requestSettings, callbackContext, mockHandler );
			jsonpComplete( requestSettings, callbackContext, mockHandler );
			// Garbage collect
			window[ jsonp ] = undefined;

			try {
				delete window[ jsonp ];
			} catch(e) {}

			if ( head ) {
				head.removeChild( script );
			}
		};
	}

	// The JSONP request was successful
	function jsonpSuccess(requestSettings, callbackContext, mockHandler) {
		// If a local callback was specified, fire it and pass it the data
		if ( requestSettings.success ) {
			requestSettings.success.call( callbackContext, mockHandler.responseText || "", status, {} );
		}

		// Fire the global callback
		if ( requestSettings.global ) {
			trigger(requestSettings, "ajaxSuccess", [{}, requestSettings] );
		}
	}

	// The JSONP request was completed
	function jsonpComplete(requestSettings, callbackContext) {
		// Process result
		if ( requestSettings.complete ) {
			requestSettings.complete.call( callbackContext, {} , status );
		}

		// The request was completed
		if ( requestSettings.global ) {
			trigger( "ajaxComplete", [{}, requestSettings] );
		}

		// Handle the global AJAX counter
		if ( requestSettings.global && ! --$.active ) {
			$.event.trigger( "ajaxStop" );
		}
	}


	// The core $.ajax replacement.
	function handleAjax( url, origSettings ) {
		var mockRequest, requestSettings, mockHandler;

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			origSettings = url;
			url = undefined;
		} else {
			// work around to support 1.5 signature
			origSettings = origSettings || {};
			origSettings.url = url;
		}

		// Extend the original settings for the request
		requestSettings = $.extend(true, {}, $.ajaxSettings, origSettings);

		// Iterate over our mock handlers (in registration order) until we find
		// one that is willing to intercept the request
		for(var k = 0; k < mockHandlers.length; k++) {
			if ( !mockHandlers[k] ) {
				continue;
			}

			mockHandler = getMockForRequest( mockHandlers[k], requestSettings );
			if(!mockHandler) {
				// No valid mock found for this request
				continue;
			}

			mockedAjaxCalls.push(requestSettings);

			// If logging is enabled, log the mock to the console
			$.mockjaxSettings.log( mockHandler, requestSettings );


			if ( requestSettings.dataType && requestSettings.dataType.toUpperCase() === 'JSONP' ) {
				if ((mockRequest = processJsonpMock( requestSettings, mockHandler, origSettings ))) {
					// This mock will handle the JSONP request
					return mockRequest;
				}
			}


			// Removed to fix #54 - keep the mocking data object intact
			//mockHandler.data = requestSettings.data;

			mockHandler.cache = requestSettings.cache;
			mockHandler.timeout = requestSettings.timeout;
			mockHandler.global = requestSettings.global;

			copyUrlParameters(mockHandler, origSettings);

			(function(mockHandler, requestSettings, origSettings, origHandler) {
				mockRequest = _ajax.call($, $.extend(true, {}, origSettings, {
					// Mock the XHR object
					xhr: function() { return xhr( mockHandler, requestSettings, origSettings, origHandler ); }
				}));
			})(mockHandler, requestSettings, origSettings, mockHandlers[k]);

			return mockRequest;
		}

		// We don't have a mock request
		if($.mockjaxSettings.throwUnmocked === true) {
			throw('AJAX not mocked: ' + origSettings.url);
		}
		else { // trigger a normal request
			return _ajax.apply($, [origSettings]);
		}
	}

	/**
	* Copies URL parameter values if they were captured by a regular expression
	* @param {Object} mockHandler
	* @param {Object} origSettings
	*/
	function copyUrlParameters(mockHandler, origSettings) {
		//parameters aren't captured if the URL isn't a RegExp
		if (!(mockHandler.url instanceof RegExp)) {
			return;
		}
		//if no URL params were defined on the handler, don't attempt a capture
		if (!mockHandler.hasOwnProperty('urlParams')) {
			return;
		}
		var captures = mockHandler.url.exec(origSettings.url);
		//the whole RegExp match is always the first value in the capture results
		if (captures.length === 1) {
			return;
		}
		captures.shift();
		//use handler params as keys and capture resuts as values
		var i = 0,
		capturesLength = captures.length,
		paramsLength = mockHandler.urlParams.length,
		//in case the number of params specified is less than actual captures
		maxIterations = Math.min(capturesLength, paramsLength),
		paramValues = {};
		for (i; i < maxIterations; i++) {
			var key = mockHandler.urlParams[i];
			paramValues[key] = captures[i];
		}
		origSettings.urlParams = paramValues;
	}


	// Public

	$.extend({
		ajax: handleAjax
	});

	$.mockjaxSettings = {
		//url:        null,
		//type:       'GET',
		log:          function( mockHandler, requestSettings ) {
			if ( mockHandler.logging === false ||
				 ( typeof mockHandler.logging === 'undefined' && $.mockjaxSettings.logging === false ) ) {
				return;
			}
			if ( window.console && console.log ) {
				var message = 'MOCK ' + requestSettings.type.toUpperCase() + ': ' + requestSettings.url;
				var request = $.extend({}, requestSettings);

				if (typeof console.log === 'function') {
					console.log(message, request);
				} else {
					try {
						console.log( message + ' ' + JSON.stringify(request) );
					} catch (e) {
						console.log(message);
					}
				}
			}
		},
		logging:       true,
		status:        200,
		statusText:    "OK",
		responseTime:  500,
		isTimeout:     false,
		throwUnmocked: false,
		contentType:   'text/plain',
		response:      '',
		responseText:  '',
		responseXML:   '',
		proxy:         '',
		proxyType:     'GET',

		lastModified:  null,
		etag:          '',
		headers: {
			etag: 'IJF@H#@923uf8023hFO@I#H#',
			'content-type' : 'text/plain'
		}
	};

	$.mockjax = function(settings) {
		var i = mockHandlers.length;
		mockHandlers[i] = settings;
		return i;
	};
	$.mockjaxClear = function(i) {
		if ( arguments.length == 1 ) {
			mockHandlers[i] = null;
		} else {
			mockHandlers = [];
		}
		mockedAjaxCalls = [];
	};
	$.mockjax.handler = function(i) {
		if ( arguments.length == 1 ) {
			return mockHandlers[i];
		}
	};
	$.mockjax.mockedAjaxCalls = function() {
		return mockedAjaxCalls;
	};
})(jQuery);
/**
*  Ajax Autocomplete for jQuery, version %version%
*  (c) 2015 Tomas Kirda
*
*  Ajax Autocomplete for jQuery is freely distributable under the terms of an MIT-style license.
*  For details, see the web site: https://github.com/devbridge/jQuery-Autocomplete
*/

/*jslint  browser: true, white: true, plusplus: true, vars: true */
/*global define, window, document, jQuery, exports, require */

// Expose plugin as an AMD module if AMD loader is present:
(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object' && typeof require === 'function') {
        // Browserify
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    'use strict';

    var
        utils = (function () {
            return {
                escapeRegExChars: function (value) {
                    return value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
                },
                createNode: function (containerClass) {
                    var div = document.createElement('div');
                    div.className = containerClass;
                    div.style.position = 'absolute';
                    div.style.display = 'none';
                    return div;
                }
            };
        }()),

        keys = {
            ESC: 27,
            TAB: 9,
            RETURN: 13,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40
        };

    function Autocomplete(el, options) {
        var noop = function () { },
            that = this,
            defaults = {
                ajaxSettings: {},
                autoSelectFirst: false,
                appendTo: document.body,
                serviceUrl: null,
                lookup: null,
                onSelect: null,
                width: 'auto',
                minChars: 1,
                maxHeight: 300,
                deferRequestBy: 0,
                params: {},
                formatResult: Autocomplete.formatResult,
                delimiter: null,
                zIndex: 9999,
                type: 'GET',
                noCache: false,
                onSearchStart: noop,
                onSearchComplete: noop,
                onSearchError: noop,
                preserveInput: false,
                containerClass: 'autocomplete-suggestions',
                tabDisabled: false,
                dataType: 'text',
                currentRequest: null,
                triggerSelectOnValidInput: true,
                preventBadQueries: true,
                lookupFilter: function (suggestion, originalQuery, queryLowerCase) {
                    return suggestion.value.toLowerCase().indexOf(queryLowerCase) !== -1;
                },
                paramName: 'query',
                transformResult: function (response) {
                    return typeof response === 'string' ? $.parseJSON(response) : response;
                },
                showNoSuggestionNotice: false,
                noSuggestionNotice: 'No results',
                orientation: 'bottom',
                forceFixPosition: false
            };

        // Shared variables:
        that.element = el;
        that.el = $(el);
        that.suggestions = [];
        that.badQueries = [];
        that.selectedIndex = -1;
        that.currentValue = that.element.value;
        that.intervalId = 0;
        that.cachedResponse = {};
        that.onChangeInterval = null;
        that.onChange = null;
        that.isLocal = false;
        that.suggestionsContainer = null;
        that.noSuggestionsContainer = null;
        that.options = $.extend({}, defaults, options);
        that.classes = {
            selected: 'autocomplete-selected',
            suggestion: 'autocomplete-suggestion'
        };
        that.hint = null;
        that.hintValue = '';
        that.selection = null;

        // Initialize and set options:
        that.initialize();
        that.setOptions(options);
    }

    Autocomplete.utils = utils;

    $.Autocomplete = Autocomplete;

    Autocomplete.formatResult = function (suggestion, currentValue) {
        // Do not replace anything if there current value is empty
        if (!currentValue) {
            return suggestion.value;
        }
        
        var pattern = '(' + utils.escapeRegExChars(currentValue) + ')';

        return suggestion.value
            .replace(new RegExp(pattern, 'gi'), '<strong>$1<\/strong>')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/&lt;(\/?strong)&gt;/g, '<$1>');
    };

    Autocomplete.prototype = {

        killerFn: null,

        initialize: function () {
            var that = this,
                suggestionSelector = '.' + that.classes.suggestion,
                selected = that.classes.selected,
                options = that.options,
                container;

            // Remove autocomplete attribute to prevent native suggestions:
            that.element.setAttribute('autocomplete', 'off');

            that.killerFn = function (e) {
                if ($(e.target).closest('.' + that.options.containerClass).length === 0) {
                    that.killSuggestions();
                    that.disableKillerFn();
                }
            };

            // html() deals with many types: htmlString or Element or Array or jQuery
            that.noSuggestionsContainer = $('<div class="autocomplete-no-suggestion"></div>')
                                          .html(this.options.noSuggestionNotice).get(0);

            that.suggestionsContainer = Autocomplete.utils.createNode(options.containerClass);

            container = $(that.suggestionsContainer);

            container.appendTo(options.appendTo);

            // Only set width if it was provided:
            if (options.width !== 'auto') {
                container.width(options.width);
            }

            // Listen for mouse over event on suggestions list:
            container.on('mouseover.autocomplete', suggestionSelector, function () {
                that.activate($(this).data('index'));
            });

            // Deselect active element when mouse leaves suggestions container:
            container.on('mouseout.autocomplete', function () {
                that.selectedIndex = -1;
                container.children('.' + selected).removeClass(selected);
            });

            // Listen for click event on suggestions list:
            container.on('click.autocomplete', suggestionSelector, function () {
                that.select($(this).data('index'));
            });

            that.fixPositionCapture = function () {
                if (that.visible) {
                    that.fixPosition();
                }
            };

            $(window).on('resize.autocomplete', that.fixPositionCapture);

            that.el.on('keydown.autocomplete', function (e) { that.onKeyPress(e); });
            that.el.on('keyup.autocomplete', function (e) { that.onKeyUp(e); });
            that.el.on('blur.autocomplete', function () { that.onBlur(); });
            that.el.on('focus.autocomplete', function () { that.onFocus(); });
            that.el.on('change.autocomplete', function (e) { that.onKeyUp(e); });
            that.el.on('input.autocomplete', function (e) { that.onKeyUp(e); });
        },

        onFocus: function () {
            var that = this;

            that.fixPosition();

            if (that.el.val().length >= that.options.minChars) {
                that.onValueChange();
            }
        },

        onBlur: function () {
            this.enableKillerFn();
        },
        
        abortAjax: function () {
            var that = this;
            if (that.currentRequest) {
                that.currentRequest.abort();
                that.currentRequest = null;
            }
        },

        setOptions: function (suppliedOptions) {
            var that = this,
                options = that.options;

            $.extend(options, suppliedOptions);

            that.isLocal = $.isArray(options.lookup);

            if (that.isLocal) {
                options.lookup = that.verifySuggestionsFormat(options.lookup);
            }

            options.orientation = that.validateOrientation(options.orientation, 'bottom');

            // Adjust height, width and z-index:
            $(that.suggestionsContainer).css({
                'max-height': options.maxHeight + 'px',
                'width': options.width + 'px',
                'z-index': options.zIndex
            });
        },


        clearCache: function () {
            this.cachedResponse = {};
            this.badQueries = [];
        },

        clear: function () {
            this.clearCache();
            this.currentValue = '';
            this.suggestions = [];
        },

        disable: function () {
            var that = this;
            that.disabled = true;
            clearInterval(that.onChangeInterval);
            that.abortAjax();
        },

        enable: function () {
            this.disabled = false;
        },

        fixPosition: function () {
            // Use only when container has already its content

            var that = this,
                $container = $(that.suggestionsContainer),
                containerParent = $container.parent().get(0);
            // Fix position automatically when appended to body.
            // In other cases force parameter must be given.
            if (containerParent !== document.body && !that.options.forceFixPosition) {
                return;
            }

            // Choose orientation
            var orientation = that.options.orientation,
                containerHeight = $container.outerHeight(),
                height = that.el.outerHeight(),
                offset = that.el.offset(),
                styles = { 'top': offset.top, 'left': offset.left };

            if (orientation === 'auto') {
                var viewPortHeight = $(window).height(),
                    scrollTop = $(window).scrollTop(),
                    topOverflow = -scrollTop + offset.top - containerHeight,
                    bottomOverflow = scrollTop + viewPortHeight - (offset.top + height + containerHeight);

                orientation = (Math.max(topOverflow, bottomOverflow) === topOverflow) ? 'top' : 'bottom';
            }

            if (orientation === 'top') {
                styles.top += -containerHeight;
            } else {
                styles.top += height;
            }

            // If container is not positioned to body,
            // correct its position using offset parent offset
            if(containerParent !== document.body) {
                var opacity = $container.css('opacity'),
                    parentOffsetDiff;

                    if (!that.visible){
                        $container.css('opacity', 0).show();
                    }

                parentOffsetDiff = $container.offsetParent().offset();
                styles.top -= parentOffsetDiff.top;
                styles.left -= parentOffsetDiff.left;

                if (!that.visible){
                    $container.css('opacity', opacity).hide();
                }
            }

            // -2px to account for suggestions border.
            if (that.options.width === 'auto') {
                styles.width = (that.el.outerWidth() - 2) + 'px';
            }

            $container.css(styles);
        },

        enableKillerFn: function () {
            var that = this;
            $(document).on('click.autocomplete', that.killerFn);
        },

        disableKillerFn: function () {
            var that = this;
            $(document).off('click.autocomplete', that.killerFn);
        },

        killSuggestions: function () {
            var that = this;
            that.stopKillSuggestions();
            that.intervalId = window.setInterval(function () {
                if (that.visible) {
                    that.el.val(that.currentValue);
                    that.hide();
                }
                
                that.stopKillSuggestions();
            }, 50);
        },

        stopKillSuggestions: function () {
            window.clearInterval(this.intervalId);
        },

        isCursorAtEnd: function () {
            var that = this,
                valLength = that.el.val().length,
                selectionStart = that.element.selectionStart,
                range;

            if (typeof selectionStart === 'number') {
                return selectionStart === valLength;
            }
            if (document.selection) {
                range = document.selection.createRange();
                range.moveStart('character', -valLength);
                return valLength === range.text.length;
            }
            return true;
        },

        onKeyPress: function (e) {
            var that = this;

            // If suggestions are hidden and user presses arrow down, display suggestions:
            if (!that.disabled && !that.visible && e.which === keys.DOWN && that.currentValue) {
                that.suggest();
                return;
            }

            if (that.disabled || !that.visible) {
                return;
            }

            switch (e.which) {
                case keys.ESC:
                    that.el.val(that.currentValue);
                    that.hide();
                    break;
                case keys.RIGHT:
                    if (that.hint && that.options.onHint && that.isCursorAtEnd()) {
                        that.selectHint();
                        break;
                    }
                    return;
                case keys.TAB:
                    if (that.hint && that.options.onHint) {
                        that.selectHint();
                        return;
                    }
                    if (that.selectedIndex === -1) {
                        that.hide();
                        return;
                    }
                    that.select(that.selectedIndex);
                    if (that.options.tabDisabled === false) {
                        return;
                    }
                    break;
                case keys.RETURN:
                    if (that.selectedIndex === -1) {
                        that.hide();
                        return;
                    }
                    that.select(that.selectedIndex);
                    break;
                case keys.UP:
                    that.moveUp();
                    break;
                case keys.DOWN:
                    that.moveDown();
                    break;
                default:
                    return;
            }

            // Cancel event if function did not return:
            e.stopImmediatePropagation();
            e.preventDefault();
        },

        onKeyUp: function (e) {
            var that = this;

            if (that.disabled) {
                return;
            }

            switch (e.which) {
                case keys.UP:
                case keys.DOWN:
                    return;
            }

            clearInterval(that.onChangeInterval);

            if (that.currentValue !== that.el.val()) {
                that.findBestHint();
                if (that.options.deferRequestBy > 0) {
                    // Defer lookup in case when value changes very quickly:
                    that.onChangeInterval = setInterval(function () {
                        that.onValueChange();
                    }, that.options.deferRequestBy);
                } else {
                    that.onValueChange();
                }
            }
        },

        onValueChange: function () {
            var that = this,
                options = that.options,
                value = that.el.val(),
                query = that.getQuery(value);

            if (that.selection && that.currentValue !== query) {
                that.selection = null;
                (options.onInvalidateSelection || $.noop).call(that.element);
            }

            clearInterval(that.onChangeInterval);
            that.currentValue = value;
            that.selectedIndex = -1;

            // Check existing suggestion for the match before proceeding:
            if (options.triggerSelectOnValidInput && that.isExactMatch(query)) {
                that.select(0);
                return;
            }

            if (query.length < options.minChars) {
                that.hide();
            } else {
                that.getSuggestions(query);
            }
        },

        isExactMatch: function (query) {
            var suggestions = this.suggestions;

            return (suggestions.length === 1 && suggestions[0].value.toLowerCase() === query.toLowerCase());
        },

        getQuery: function (value) {
            var delimiter = this.options.delimiter,
                parts;

            if (!delimiter) {
                return value;
            }
            parts = value.split(delimiter);
            return $.trim(parts[parts.length - 1]);
        },

        getSuggestionsLocal: function (query) {
            var that = this,
                options = that.options,
                queryLowerCase = query.toLowerCase(),
                filter = options.lookupFilter,
                limit = parseInt(options.lookupLimit, 10),
                data;

            data = {
                suggestions: $.grep(options.lookup, function (suggestion) {
                    return filter(suggestion, query, queryLowerCase);
                })
            };

            if (limit && data.suggestions.length > limit) {
                data.suggestions = data.suggestions.slice(0, limit);
            }

            return data;
        },

        getSuggestions: function (q) {
            var response,
                that = this,
                options = that.options,
                serviceUrl = options.serviceUrl,
                params,
                cacheKey,
                ajaxSettings;

            options.params[options.paramName] = q;
            params = options.ignoreParams ? null : options.params;

            if (options.onSearchStart.call(that.element, options.params) === false) {
                return;
            }

            if ($.isFunction(options.lookup)){
                options.lookup(q, function (data) {
                    that.suggestions = data.suggestions;
                    that.suggest();
                    options.onSearchComplete.call(that.element, q, data.suggestions);
                });
                return;
            }

            if (that.isLocal) {
                response = that.getSuggestionsLocal(q);
            } else {
                if ($.isFunction(serviceUrl)) {
                    serviceUrl = serviceUrl.call(that.element, q);
                }
                cacheKey = serviceUrl + '?' + $.param(params || {});
                response = that.cachedResponse[cacheKey];
            }

            if (response && $.isArray(response.suggestions)) {
                that.suggestions = response.suggestions;
                that.suggest();
                options.onSearchComplete.call(that.element, q, response.suggestions);
            } else if (!that.isBadQuery(q)) {
                that.abortAjax();

                ajaxSettings = {
                    url: serviceUrl,
                    data: params,
                    type: options.type,
                    dataType: options.dataType
                };

                $.extend(ajaxSettings, options.ajaxSettings);

                that.currentRequest = $.ajax(ajaxSettings).done(function (data) {
                    var result;
                    that.currentRequest = null;
                    result = options.transformResult(data, q);
                    that.processResponse(result, q, cacheKey);
                    options.onSearchComplete.call(that.element, q, result.suggestions);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    options.onSearchError.call(that.element, q, jqXHR, textStatus, errorThrown);
                });
            } else {
                options.onSearchComplete.call(that.element, q, []);
            }
        },

        isBadQuery: function (q) {
            if (!this.options.preventBadQueries){
                return false;
            }

            var badQueries = this.badQueries,
                i = badQueries.length;

            while (i--) {
                if (q.indexOf(badQueries[i]) === 0) {
                    return true;
                }
            }

            return false;
        },

        hide: function () {
            var that = this,
                container = $(that.suggestionsContainer);

            if ($.isFunction(that.options.onHide) && that.visible) {
                that.options.onHide.call(that.element, container);
            }

            that.visible = false;
            that.selectedIndex = -1;
            clearInterval(that.onChangeInterval);
            $(that.suggestionsContainer).hide();
            that.signalHint(null);
        },

        suggest: function () {
            if (this.suggestions.length === 0) {
                if (this.options.showNoSuggestionNotice) {
                    this.noSuggestions();
                } else {
                    this.hide();
                }
                return;
            }

            var that = this,
                options = that.options,
                groupBy = options.groupBy,
                formatResult = options.formatResult,
                value = that.getQuery(that.currentValue),
                className = that.classes.suggestion,
                classSelected = that.classes.selected,
                container = $(that.suggestionsContainer),
                noSuggestionsContainer = $(that.noSuggestionsContainer),
                beforeRender = options.beforeRender,
                html = '',
                category,
                formatGroup = function (suggestion, index) {
                        var currentCategory = suggestion.data[groupBy];

                        if (category === currentCategory){
                            return '';
                        }

                        category = currentCategory;

                        return '<div class="autocomplete-group"><strong>' + category + '</strong></div>';
                    };

            if (options.triggerSelectOnValidInput && that.isExactMatch(value)) {
                that.select(0);
                return;
            }

            // Build suggestions inner HTML:
            $.each(that.suggestions, function (i, suggestion) {
                if (groupBy){
                    html += formatGroup(suggestion, value, i);
                }

                html += '<div class="' + className + '" data-index="' + i + '">' + formatResult(suggestion, value) + '</div>';
            });

            this.adjustContainerWidth();

            noSuggestionsContainer.detach();
            container.html(html);

            if ($.isFunction(beforeRender)) {
                beforeRender.call(that.element, container);
            }

            that.fixPosition();
            container.show();

            // Select first value by default:
            if (options.autoSelectFirst) {
                that.selectedIndex = 0;
                container.scrollTop(0);
                container.children('.' + className).first().addClass(classSelected);
            }

            that.visible = true;
            that.findBestHint();
        },

        noSuggestions: function() {
             var that = this,
                 container = $(that.suggestionsContainer),
                 noSuggestionsContainer = $(that.noSuggestionsContainer);

            this.adjustContainerWidth();

            // Some explicit steps. Be careful here as it easy to get
            // noSuggestionsContainer removed from DOM if not detached properly.
            noSuggestionsContainer.detach();
            container.empty(); // clean suggestions if any
            container.append(noSuggestionsContainer);

            that.fixPosition();

            container.show();
            that.visible = true;
        },

        adjustContainerWidth: function() {
            var that = this,
                options = that.options,
                width,
                container = $(that.suggestionsContainer);

            // If width is auto, adjust width before displaying suggestions,
            // because if instance was created before input had width, it will be zero.
            // Also it adjusts if input width has changed.
            // -2px to account for suggestions border.
            if (options.width === 'auto') {
                width = that.el.outerWidth() - 2;
                container.width(width > 0 ? width : 300);
            }
        },

        findBestHint: function () {
            var that = this,
                value = that.el.val().toLowerCase(),
                bestMatch = null;

            if (!value) {
                return;
            }

            $.each(that.suggestions, function (i, suggestion) {
                var foundMatch = suggestion.value.toLowerCase().indexOf(value) === 0;
                if (foundMatch) {
                    bestMatch = suggestion;
                }
                return !foundMatch;
            });

            that.signalHint(bestMatch);
        },

        signalHint: function (suggestion) {
            var hintValue = '',
                that = this;
            if (suggestion) {
                hintValue = that.currentValue + suggestion.value.substr(that.currentValue.length);
            }
            if (that.hintValue !== hintValue) {
                that.hintValue = hintValue;
                that.hint = suggestion;
                (this.options.onHint || $.noop)(hintValue);
            }
        },

        verifySuggestionsFormat: function (suggestions) {
            // If suggestions is string array, convert them to supported format:
            if (suggestions.length && typeof suggestions[0] === 'string') {
                return $.map(suggestions, function (value) {
                    return { value: value, data: null };
                });
            }

            return suggestions;
        },

        validateOrientation: function(orientation, fallback) {
            orientation = $.trim(orientation || '').toLowerCase();

            if($.inArray(orientation, ['auto', 'bottom', 'top']) === -1){
                orientation = fallback;
            }

            return orientation;
        },

        processResponse: function (result, originalQuery, cacheKey) {
            var that = this,
                options = that.options;

            result.suggestions = that.verifySuggestionsFormat(result.suggestions);

            // Cache results if cache is not disabled:
            if (!options.noCache) {
                that.cachedResponse[cacheKey] = result;
                if (options.preventBadQueries && result.suggestions.length === 0) {
                    that.badQueries.push(originalQuery);
                }
            }

            // Return if originalQuery is not matching current query:
            if (originalQuery !== that.getQuery(that.currentValue)) {
                return;
            }

            that.suggestions = result.suggestions;
            that.suggest();
        },

        activate: function (index) {
            var that = this,
                activeItem,
                selected = that.classes.selected,
                container = $(that.suggestionsContainer),
                children = container.find('.' + that.classes.suggestion);

            container.find('.' + selected).removeClass(selected);

            that.selectedIndex = index;

            if (that.selectedIndex !== -1 && children.length > that.selectedIndex) {
                activeItem = children.get(that.selectedIndex);
                $(activeItem).addClass(selected);
                return activeItem;
            }

            return null;
        },

        selectHint: function () {
            var that = this,
                i = $.inArray(that.hint, that.suggestions);

            that.select(i);
        },

        select: function (i) {
            var that = this;
            that.hide();
            that.onSelect(i);
        },

        moveUp: function () {
            var that = this;

            if (that.selectedIndex === -1) {
                return;
            }

            if (that.selectedIndex === 0) {
                $(that.suggestionsContainer).children().first().removeClass(that.classes.selected);
                that.selectedIndex = -1;
                that.el.val(that.currentValue);
                that.findBestHint();
                return;
            }

            that.adjustScroll(that.selectedIndex - 1);
        },

        moveDown: function () {
            var that = this;

            if (that.selectedIndex === (that.suggestions.length - 1)) {
                return;
            }

            that.adjustScroll(that.selectedIndex + 1);
        },

        adjustScroll: function (index) {
            var that = this,
                activeItem = that.activate(index);

            if (!activeItem) {
                return;
            }

            var offsetTop,
                upperBound,
                lowerBound,
                heightDelta = $(activeItem).outerHeight();

            offsetTop = activeItem.offsetTop;
            upperBound = $(that.suggestionsContainer).scrollTop();
            lowerBound = upperBound + that.options.maxHeight - heightDelta;

            if (offsetTop < upperBound) {
                $(that.suggestionsContainer).scrollTop(offsetTop);
            } else if (offsetTop > lowerBound) {
                $(that.suggestionsContainer).scrollTop(offsetTop - that.options.maxHeight + heightDelta);
            }

            if (!that.options.preserveInput) {
                that.el.val(that.getValue(that.suggestions[index].value));
            }
            that.signalHint(null);
        },

        onSelect: function (index) {
            var that = this,
                onSelectCallback = that.options.onSelect,
                suggestion = that.suggestions[index];

            that.currentValue = that.getValue(suggestion.value);

            if (that.currentValue !== that.el.val() && !that.options.preserveInput) {
                that.el.val(that.currentValue);
            }

            that.signalHint(null);
            that.suggestions = [];
            that.selection = suggestion;

            if ($.isFunction(onSelectCallback)) {
                onSelectCallback.call(that.element, suggestion);
            }
        },

        getValue: function (value) {
            var that = this,
                delimiter = that.options.delimiter,
                currentValue,
                parts;

            if (!delimiter) {
                return value;
            }

            currentValue = that.currentValue;
            parts = currentValue.split(delimiter);

            if (parts.length === 1) {
                return value;
            }

            return currentValue.substr(0, currentValue.length - parts[parts.length - 1].length) + value;
        },

        dispose: function () {
            var that = this;
            that.el.off('.autocomplete').removeData('autocomplete');
            that.disableKillerFn();
            $(window).off('resize.autocomplete', that.fixPositionCapture);
            $(that.suggestionsContainer).remove();
        }
    };

    // Create chainable jQuery plugin:
    $.fn.autocomplete = $.fn.devbridgeAutocomplete = function (options, args) {
        var dataKey = 'autocomplete';
        // If function invoked without argument return
        // instance of the first matched element:
        if (arguments.length === 0) {
            return this.first().data(dataKey);
        }

        return this.each(function () {
            var inputElement = $(this),
                instance = inputElement.data(dataKey);

            if (typeof options === 'string') {
                if (instance && typeof instance[options] === 'function') {
                    instance[options](args);
                }
            } else {
                // If instance already exists, destroy it:
                if (instance && instance.dispose) {
                    instance.dispose();
                }
                instance = new Autocomplete(this, options);
                inputElement.data(dataKey, instance);
            }
        });
    };
}));

$(function() {
    var urlPrefix = '';

    $.extend({
        getUrlVars: function() {
            var vars = [], hash;
            var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
            for(var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                vars[hash[0]] = hash[1];
            }
            return vars;
        },
        getUrlVar: function(name) {
            return $.getUrlVars()[name];
        }
    });

    var ajax = {
        control: {
            sendFormData: function(form, url, logName, successCallback) {
                $(document).on( "submit", form, function(e) {
                    e.preventDefault();
                    
                    var self = $(this),
                          dataForm = $(this).serialize(),
                          submitButton = $(this).find("button[type=submit]"),
                          oldButtonValue = submitButton.html();

                    submitButton.attr("disabled", "disabled").html('<i class="fa fa-cog fa-spin"></i>');

                    $.ajax({
                        method: "post",
                        url: urlPrefix + url,
                        data: dataForm,
                        success: function(response) {
                            var response = $.parseJSON(response);

                            if(response.error) {
                                for(key in response) {
                                    if(response[key][0] !== undefined) {
                                        var formError = noty({
                                            text: "<b>Ошибка!</b> " + response[key][0],
                                            animation: {
                                                open: 'animated fadeInLeft',
                                                close: 'animated flipOutX',
                                                easing: 'swing',
                                                speed: 300
                                            },
                                            type: 'error',
                                            theme: 'relax',
                                            layout: 'topRight',
                                            timeout: 7000
                                        });
                                    }
                                }
                            } else {
                                successCallback(response);
                            }
                        },
                        error: function(jqxhr) {
                            errors.control.log(logName, jqxhr);

                            var formErrorAjax = noty({
                                text: "<b>Технические работы!</b><br>В данный момент времени" + 
                                        " произведённое действие невозможно. Попробуйте позже." +
                                        " Приносим свои извинения за неудобство.",
                                animation: {
                                    open: 'animated fadeInLeft',
                                    close: 'animated flipOutX',
                                    easing: 'swing',
                                    speed: 300
                                },
                                type: 'warning',
                                theme: 'relax',
                                layout: 'topRight',
                                timeout: 10000
                            });
                        },
                        complete: function() {
                            submitButton.removeAttr("disabled").html(oldButtonValue);
                        }
                    });
                });
            }
        }
    }

    var errors = {
        control: {
            log: function(type, jqxhr) {
                $("<div id='error-container' style='display:none;'>" + jqxhr.responseText + "</div>").appendTo("body");

                var errorContainer = $("#error-container"),
                      errorMessage = type + ": " + jqxhr.status + " " + jqxhr.statusText + " ";

                if(errorContainer.find("h2:first").text() == "Details") {
                    errorMessage += "- ";
                    errorContainer.find("div").each(function(index) {
                        if(index > 4) return false;
                        var delimiter = ", ";
                        if(index == 4) delimiter = "";
                        errorMessage += $(this).text() + delimiter;
                    });
                }

                $.ajax({
                    method: "post",
                    url: urlPrefix + "/ajax-error",
                    data: "message=" + errorMessage,
                });

                errorContainer.remove();
            }
        }
    }
    
    var header = {
        control: {
            headerStoresMenu: $("#top").find(".stores"), 
            storesSubmenu: $("#top").find(".stores").find(".submenu"),
            popupSignUp: $("#top").find(".popup_content").find(".sign-up"),
            storeShow: '',
            storeHide: '',
            passwordRecovery: function() {
                var passwordRecoveryHash = $.getUrlVar("prv");

                if(passwordRecoveryHash !== undefined && passwordRecoveryHash != '') {
                    $.ajax({
                        method: "post",
                        url: urlPrefix + "/password-recovery/update",
                        data: "prv=" + passwordRecoveryHash,
                        error: function (jqxhr) {
                            errors.control.log('Password Recovery Update Ajax Error', jqxhr);

                            var formErrorAjax = noty({
                                text: "<b>Технические работы!</b><br>В данный момент времени" + 
                                        " произведённое действие невозможно. Попробуйте позже." +
                                        " Приносим свои извинения за неудобство.",
                                animation: {
                                    open: 'animated fadeInLeft',
                                    close: 'animated flipOutX',
                                    easing: 'swing',
                                    speed: 300
                                },
                                type: 'warning',
                                theme: 'relax',
                                layout: 'topRight',
                                timeout: 10000
                            });
                        },
                        success: function(response) {
                            var response = $.parseJSON(response);

                            if(response.error) {
                                for(key in response) {
                                    if(response[key][0] !== undefined) {
                                        var passRecovError = noty({
                                            text: "<b>Ошибка!</b> " + response[key][0],
                                            animation: {
                                                open: 'animated fadeInLeft',
                                                close: 'animated flipOutX',
                                                easing: 'swing',
                                                speed: 300
                                            },
                                            type: 'error',
                                            theme: 'relax',
                                            modal: true,
                                            layout: 'center',
                                            timeout: 7000
                                        });
                                    }
                                }
                            } else {
                                var passRecovSuccess = noty({
                                    text: "<b>Поздравляем!</b><br> Пароль успешно изменён. Новый пароль: <b>" + response.password + "</b><br><br>",
                                    animation: {
                                        open: 'animated fadeInLeft',
                                        close: 'animated flipOutX',
                                        easing: 'swing',
                                        speed: 300
                                    },
                                    type: 'success',
                                    theme: 'relax',
                                    layout: 'center',
                                    timeout: false,
                                    modal: true,
                                    closeWith: ['button']
                                });
                            }
                        },
                        complete: function() {
                            window.history.pushState(null, null, '/');
                        }
                    });
                } 
            },
            events: function() {
                var self = this;
                self.headerStoresMenu.hover(function() {
                    if($(window).width() > 991) {
                        clearTimeout(self.storeHide);
                        self.storeShow = setTimeout(function() {
                            self.storesSubmenu.clearQueue();
                            self.storesSubmenu.css("display", "block").animate({"opacity": 1}, 350);
                        }, 200);
                    }
                }, function() {
                    if($(window).width() > 991) {
                        clearTimeout(self.storeShow);
                        self.storeHide = setTimeout(function() {
                            self.storesSubmenu.clearQueue();
                            self.storesSubmenu.animate({"opacity": 0}, 200, function() {
                                $(this).css("display", "none");
                            });
                        }, 300);
                    }
                });

                this.passwordRecovery();

                if($(window).width() > 991) {
                    $(".form-search-dp input").autocomplete({
                        serviceUrl: '/search',
                        noCache: 'true',
                        deferRequestBy: 300,
                        triggerSelectOnValidInput: false,
                        onSelect: function (suggestion) {
                            location.href = '/stores/' + suggestion.data.route;
                        }
                    });
                }

                $("form[name=search] .fa").click(function() {
                    $(this).closest("form").submit();
                });

                $(".dobrohead i, .dobro .circle .c .fa-heart").animo({animation: "pulse", iterate: "infinite"});

                var activeCategory = $(".header-nav nav ul.primary-nav .submenu .tree a[href='"+location.pathname+"']");

                if(activeCategory.length > 0) {
                    activeCategory.addClass("active");
                }
            }
        }
    }

    var coupons = {
        control: {
            events: function() {
                $.countdown.regionalOptions['ru'] = {
                    labels: ['Лет', 'Месяцев', 'Недель', 'Дней', 'Часов', 'Минут', 'Секунд'],
                    labels1: ['Год', 'Месяц', 'Неделя', 'День', 'Час', 'Минута', 'Секунда'],
                    labels2: ['Года', 'Месяца', 'Недели', 'Дня', 'Часа', 'Минуты', 'Секунды'],
                    compactLabels: ['л', 'м', 'н', 'д'], compactLabels1: ['г', 'м', 'н', 'д'],
                    whichLabels: function(amount) {
                        var units = amount % 10;
                        var tens = Math.floor((amount % 100) / 10);
                        return (amount == 1 ? 1 : (units >= 2 && units <= 4 && tens != 1 ? 2 :
                            (units == 1 && tens != 1 ? 1 : 0)));
                    },
                    digits: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
                    timeSeparator: ':', 
                    isRTL: false
                };

                $.countdown.setDefaults($.countdown.regionalOptions['ru']);

                $("#top").find('.coupons .current-coupon .time .clock').each(function() {
                    var self = $(this);
                    var dateEnd = new Date(self.attr("data-end").replace(/-/g, "/")); 
                    self.countdown({until: dateEnd, compact: true}); 
                });

                $("#top").find('.coupons .current-coupon .countdown-amount').each(function() {
                    var self = $(this);

                    if(self.text() == "00:00:00") {
                        self.closest(".current-coupon").find(".expiry").css("display", "table-cell");
                    }
                });

                $("#top").find(".coupons .current-coupon .text .additional a").click(function() {
                    $(this).next("span").toggle();
                    $(this).text(function(i, v) {
                        v = v.split(" ");
                        
                        if(v.indexOf('Показать') != -1) {
                            v[0] = 'Скрыть';
                        } else {
                            v[0] = 'Показать';
                        }

                        v = v.join(" ");
                        return v;
                    });

                    return false;
                });

                $("#top").find(".categories .search-store-coupons input").keyup(function() {
                    var iValue = $(this).val().toLowerCase();

                    if(iValue != "") {
                        $(".categories .coupons-stores li a").each(function() {
                            var storeName = $(this).text().toLowerCase();

                            if(storeName.indexOf(iValue) != -1) {
                                $(this).parent().css("display", "block");
                            } else {
                                $(this).parent().css("display", "none");
                            }
                        });
                    } else {
                        $(".categories .coupons-stores li").css("display", "block");
                    }
                });

                $(document).on("click", "#top .coupons .current-coupon .text .coupon-goto a[href=#showpromocode]", function() {
                    var self = $(this);

                    self.next("div").css("display", "block");
                    self.text("Использовать купон");
                    self.attr("target", "_blank");
                    self.attr("href", "/goto/coupon:" + self.closest(".current-coupon").attr("data-uid"));

                    return false;
                });       
            }
        }
    }

    var popup = {
        control: {
            starNomination: function(index) {
                  var stars = $("#top .popup .feedback.popup-content .rating .fa-wrapper .fa");
                  
                  stars.removeClass("fa-star").addClass("fa-star-o");

                  for(var i = 0; i < index; i++) {
                    stars.eq(i).removeClass("fa-star-o").addClass("fa-star");
                  }
            },
            registration: function(settings) {
                var self = this;
                for (selector in settings) {
                    $(selector).popup({
                        content : settings[selector],
                        type : 'html',
                        afterOpen: function() {
                            var activeElement = $("#top a.popup_active").attr("href"),
                                  settings = {
                                        /*'#login' : {
                                            'h3' : 'Вход на сайт',
                                            'button' : 'Войти в личный кабинет',
                                            'input[type=password]' : 'Введите ваш пароль',
                                            'h4' : 'Или войдите к нам с помощью соцсетей:',
                                            '.sign-up-tagline' : 'Совершая вход на сайт, Вы соглашаетесь с нашими <a href="/terms">Правилами</a>',
                                            '.terms' : '<a href="#password-recovery" class="ignore-hash">Забыли пароль?</a>',
                                            'input[name=type]' : 'login'
                                        },
                                        '#registration' : {
                                            'h3' : 'Начните экономить уже сегодня!',
                                            'button' : 'Присоединиться и начать экономить',
                                            'input[type=password]' : 'Придумайте пароль',
                                            'h4' : 'Или присоединяйтесь к нам с помощью соцсетей:',
                                            '.sign-up-tagline' : 'Регистрация полностью бесплатна и займёт у Вас несколько секунд',
                                            '.terms' : 'Регистрируясь, я соглашаюсь с <a href="/terms">Правилами</a>',
                                            'input[name=type]' : 'registration'
                                        },*/
                                        /*'#givefeedback' : {
                                            'h3' : 'Отзыв о сайте',
                                            'input[name=type]' : 'feedback'
                                        },*/
                                        '#reviewstore' : {
                                            'h3' : 'Отзыв о магазине ' + $("#store-information").attr("data-store-name"),
                                            'input[name=type]' : 'review_' + $("#store-information").attr("data-store-id")
                                        }
                                    };

                            /*if($.inArray(activeElement, ['#login', '#registration']) != -1) {
                                var popupWindow = $("#top").find(".popup_content").find(".sign-up");
                                popupWindow.find(".social-icon").prepend("" + 
                                        "<div id=\"uLogin6dab3a2d\"" + 
                                        "data-ulogin=\"display=buttons;fields=first_name,email,last_name,nickname,sex,bdate,photo," + 
                                        "photo_big;optional=phone,city,country;lang=ru;providers=vkontakte,odnoklassniki," + 
                                        "facebook,twitter;redirect_uri=http%3A%2F%2Fsecretdiscounter.ru%2Fauthorizationsocial_login\">" +
                                        "<img src=\"/images/account/vk.png\" data-uloginbutton=\"vkontakte\" alt=\"vkontakte-ulogin\">" +
                                        "<img src=\"/images/account/fb.png\" data-uloginbutton=\"facebook\" alt=\"facebook-ulogin\">" +
                                        "<img src=\"/images/account/tw.png\" data-uloginbutton=\"twitter\" alt=\"twitter-ulogin\">" +
                                        "<img src=\"/images/account/ok.png\" data-uloginbutton=\"odnoklassniki\" alt=\"odnoklassniki-ulogin\">" +
                                        "</div>");
                            }*/
                            if($.inArray(activeElement, ['#givefeedback', '#reviewstore']) != -1) {
                                var popupWindow = $("#top").find(".popup_content").find(".feedback");
                            }

                            for (key in settings[activeElement]) {
                                if($.inArray(key, ['h3', 'button', 'h4']) != -1) {
                                    popupWindow.find(key).text(settings[activeElement][key]);
                                }
                                if($.inArray(key, ['.sign-up-tagline', '.terms']) != -1) {
                                    popupWindow.find(key).html(settings[activeElement][key]);
                                }
                                if($.inArray(key, ['input[type=password]']) != -1) {
                                    popupWindow.find(key).attr('placeholder', settings[activeElement][key]);
                                }
                                if($.inArray(key, ['input[name=type]']) != -1) {
                                    popupWindow.find(key).val(settings[activeElement][key]);
                                }
                            }

                            if(activeElement != "#cert") {
                                popupWindow.animate({'opacity' : 1}, 300);
                                uLogin.customInit('uLogin6dab3a2d');
                            }
                        }
                    });                    
                }
            },
            events: function() {
                var self = this,
                      popups = {
                            //'a[href=#login]' : $("#top").find('.popup-login').html(),
                            //'a[href=#registration]' : $("#top").find('.popup-login').html(),
                            /*'a[href=#givefeedback]' :  $("#top").find('.popup-givefeedback').html(),
                            'a[href=#reviewstore]' :  $("#top").find('.popup-givefeedback').html(),*/
                            'a[href=#cert]' :  $("#top").find('.popup-cert').html(),
                            //'a[href=#password-recovery]' : $("#top").find('.popup-recovery').html()
                      }

                //this.registration(popups);

                /*$(document).on("click", "#top a[href=#password-recovery]", function() {
                    $("#top .popup-sign-up").closest(".popup").next(".popup_close").click();
                });*/

                /*$(document).on("mouseover", "#top .popup .feedback.popup-content .rating .fa-wrapper .fa", function(e) {
                      self.starNomination($(this).index() + 1);
                }).on("mouseleave", "#top .popup .feedback.popup-content .rating .fa-wrapper", function(e) {
                      self.starNomination($("#top .popup .feedback.popup-content input[name=rating]").val());                
                }).on("click", "#top .popup .feedback.popup-content .rating .fa-wrapper .fa", function(e) {
                      self.starNomination($(this).index() + 1);

                      $("#top .popup .feedback.popup-content input[name=rating]").val($(this).index() + 1);
                });*/

                /*ajax.control.sendFormData("#top .signup-form", "/authorization", "Auth Ajax Error", function(data) {
                    if(data.type == 'registration') {
                        location.href = urlPrefix + "/account" + data.param;
                    } else {
                        location.href = urlPrefix + "/account";
                    }
                });*/

                /*ajax.control.sendFormData("#top .recovery-form", "/password-recovery/instructions", "Password Recovery Instructions Ajax Error", function() {
                    $("#top .recovery").closest(".popup").next(".popup_close").click();

                    var passNotySuccess = noty({
                        text: "<b>Поздравляем!</b><br> Инструкции по восстановлению пароля успешно" +
                                " отправлены на указанный email адрес. Если письмо не пришло в течение 2 минут, посмотрите в папке «Спам».",
                        animation: {
                            open: 'animated fadeInLeft',
                            close: 'animated flipOutX',
                            easing: 'swing',
                            speed: 300
                        },
                        type: 'success',
                        theme: 'relax',
                        layout: 'topRight',
                        timeout: 7000
                    });                    
                });*/
            }
        }
    }

    /*var reviews = {
        control: {
            events: function() {
                // add a comment to the site
                ajax.control.sendFormData("#top .feedback-form", "/reviews", "Reviews Ajax Error", function() {
                    $("#top .feedback").closest(".popup").next(".popup_close").click();

                    var reviewSuccess = noty({
                        text: "<b>Спасибо!</b><br>Ваш отзыв успешно добавлен и будет" +
                                " опубликован на сайте после модерации.",
                        animation: {
                            open: 'animated fadeInLeft',
                            close: 'animated flipOutX',
                            easing: 'swing',
                            speed: 300
                        },
                        type: 'success',
                        theme: 'relax',
                        layout: 'topRight',
                        timeout: 7000
                    });
                });     
            }
        }
    }*/

    var catalog = {
        control: {
            events: function() {
                $("#top .dropdown-select .dropOut li").click(function() {
                    location.href = $(this).find("a").attr("href");
                });
            }
        }
    }

    var favorites = {
        control: {
            events: function() {
                $("#top").find(".favorite-link.ia").click(function() {
                    var self = $(this);
                    var type = self.attr("data-state"),
                          affiliate_id = self.attr("data-affiliate-id");

                    if(type == "add") {
                        self.find(".fa").removeClass("muted");
                    }

                    self.find(".fa").removeClass("pulse2").addClass("fa-spin");

                    $.ajax({
                        method: "post",
                        url: urlPrefix + "/account/favorites",
                        data: "type=" + type + "&affiliate_id=" + affiliate_id,
                        error: function (jqxhr) {
                            errors.control.log('Favorites Ajax Error', jqxhr);

                            var favErrorAjax = noty({
                                text: "<b>Технические работы!</b><br>В данный момент времени" + 
                                        " произведённое действие невозможно. Попробуйте позже." +
                                        " Приносим свои извинения за неудобство.",
                                animation: {
                                    open: 'animated fadeInLeft',
                                    close: 'animated flipOutX',
                                    easing: 'swing',
                                    speed: 300
                                },
                                type: 'warning',
                                theme: 'relax',
                                layout: 'topRight',
                                timeout: 10000
                            });

                            if(type == "add") {
                                self.find(".fa").addClass("muted");
                            }

                            self.find(".fa").removeClass("fa-spin").addClass("pulse2");
                        },
                        success: function(response) {
                            var response = $.parseJSON(response);

                            if(response.error) {
                                for(key in response) {
                                    if(response[key][0] !== undefined) {
                                        var favoritesError = noty({
                                            text: "<b>Ошибка!</b> " + response[key][0],
                                            animation: {
                                                open: 'animated fadeInLeft',
                                                close: 'animated flipOutX',
                                                easing: 'swing',
                                                speed: 300
                                            },
                                            type: 'error',
                                            theme: 'relax',
                                            layout: 'topRight',
                                            timeout: 7000
                                        });
                                    }
                                }

                                if(type == "add") {
                                    self.find(".fa").addClass("muted");
                                }

                                self.find(".fa").removeClass("fa-spin").addClass("pulse2");
                            } else {
                                var favoritesSuccess = noty({
                                    text: response.msg,
                                    animation: {
                                        open: 'animated fadeInLeft',
                                        close: 'animated flipOutX',
                                        easing: 'swing',
                                        speed: 300
                                    },
                                    type: 'success',
                                    theme: 'relax',
                                    layout: 'topRight',
                                    timeout: 7000
                                });

                                if(type == "add") {
                                    self.attr({
                                        "data-state": "delete",
                                        "data-original-title": "Удалить из избранного"
                                    });

                                    self.find(".fa").removeClass("fa-spin fa-star-o").addClass("pulse2 fa-star");
                                } else if(type == "delete") {
                                    self.attr({
                                        "data-state": "add",
                                        "data-original-title" : "Добавить в избранное"
                                    });                   

                                    self.find(".fa").removeClass("fa-spin fa-star").addClass("pulse2 fa-star-o muted");             
                                }
                            }
                        }
                    });       

                    return false;                
                });
            }
        }
    }


    
    popup.control.events();
    header.control.events();
    coupons.control.events();
    //reviews.control.events();
    catalog.control.events();
    favorites.control.events();
});


// $(window).load(function(){
//
//     /* Scrollbar Init
//     ------------------------------------*/
//     // $("#top").find(".submenu .tree").mCustomScrollbar({
//     //     axis:"y",
//     //     setHeight: 300
//     // });
//     if($("#top").find(".c-wrapper").length < 1){
//        return true;
//     }
//     $("#top").find(".c-wrapper").mCustomScrollbar({
//         axis:"y",
//         setHeight: 700
//     });
//     $("#top").find(".cm-wrapper").mCustomScrollbar({
//         axis:"y",
//         setHeight: 640
//     });
//     // $("#top").find(".view-store .additional-information").mCustomScrollbar({
//     //     axis:"y",
//     //     setHeight: 65
//     // });
//     $("#top").find(".funds .fund .title").mCustomScrollbar({
//         axis:"y",
//         setHeight: 45,
//         theme: "dark"
//     }); 
//     $("#top").find(".autocomplete-suggestions").mCustomScrollbar({
//         axis:"y",
//         setHeight: 300
//     }); 
//     $("#top").find(".comments .current-comment .text .comment").mCustomScrollbar({
//         axis:"y",
//         setHeight: 150,
//         theme: "dark"
//     }); 
//     $("#top").find(".categories ul:not(.subcategories)").mCustomScrollbar({
//         axis:"y",
//         setHeight: 250
//     });
//
//     /*$('[data-toggle="tooltip"]').tooltip({
//         delay: {
//             show: 500, hide: 2000
//         }
//     });*/
// });


$('.short-description__handle.more a').click(function(e){
    e.preventDefault();
    var div = $(this).parent();
    $(div).siblings('.short-description__handle.less').show();
    $(div).hide();
    $('.short-description__description').toggleClass('less');
});

$('.short-description__handle.less a').click(function(e){
    e.preventDefault();
    var div = $(this).parent();
    $(div).siblings('.short-description__handle.more').show();
    $(div).hide();
    $('.short-description__description').toggleClass('less');
});

$('.additional-information__handle.more a').click(function(e){
    e.preventDefault();
    var div = $(this).parent();
    $(div).siblings('.additional-information__handle.less').show();
    $(div).hide();
    $('.additional-information').toggleClass('open');
});
$('.additional-information__handle.less a').click(function(e){
    e.preventDefault();
    var div = $(this).parent();
    $(div).siblings('.additional-information__handle.more').show();
    $(div).hide();
    $('.additional-information').toggleClass('open');
});
$('.store-coupons__show-less').click(function(e){
    e.preventDefault();
    $('.store-coupons__buttons.more').show();
    $('.store-coupons__buttons.less').hide();
    $('.coupons-item.more').hide();
});
$('.store-coupons__show-more').click(function(e){
    e.preventDefault();
   $('.store-coupons__buttons.less').show();
   $('.store-coupons__buttons.more').hide();
   $('.coupons-item.more').show();
});

$(function() {
    function parseNum(str){
        return parseFloat(
          String(str)
            .replace(',','.')
            .match(/-?\d+(?:\.\d+)?/g, '') || 0
          , 10
        );
    }

    $('.short-calc-cashback').find('select,input').on('change keyup click',function () {
        $this=$(this).closest('.short-calc-cashback');
        curs=parseNum($this.find('select').val());
        val=$this.find('input').val();
        if(parseNum(val)!=val){
            val=$this.find('input').val(parseNum(val));
        }
        val=parseNum(val);

        koef=$this.find('input').attr('data-cashback').trim();
        promo=$this.find('input').attr('data-cashback-promo').trim();
        currency=$this.find('input').attr('data-cashback-currency').trim();

        if(koef==promo){
            promo=0;
        }

        if(koef.indexOf('%')>0){
            result=parseNum(koef)*val*curs/100;
        }else{
            curs=parseNum($this.find('[code='+currency+']').val());
            result=parseNum(koef)*curs
        }

        if(parseNum(promo)>0) {
            if(promo.indexOf('%')>0){
                promo=parseNum(promo)*val*curs/100;
            }else{
                promo=parseNum(promo)*curs
            }

            if(promo>0) {
                out = "<span class=old_price>" + result.toFixed(2) + "</span> " + promo.toFixed(2)
            }else{
                out=result.toFixed(2)
            }
        }else{
            out=result.toFixed(2)
        }


        $this.find('.calc-result_value').html(out)
    }).click()
});
var notification = (function() {
  var notification_box =false;
  var is_init=false;
  var confirm_opt={
    title:"Удаление",
    question:"Вы действительно хотите удалить?",
    buttonYes:"Да",
    buttonNo:"Нет",
    callbackYes:false,
    callbackNo:false,
    obj:false,
  };

  var alert_opt={
    title:"",
    question:"Сообщение",
    buttonYes:"Да",
    callbackYes:false,
    obj:false,
  };


  function init(){
    is_init=true;
    notification_box=$('.notification_box');
    if(notification_box.length>0)return;

    $('body').append("<div class='notification_box'></div>");
    notification_box=$('.notification_box');

    notification_box.on('click','.notify_control',closeModal);
    notification_box.on('click','.notify_close',closeModal);
    notification_box.on('click',closeModalFon);
  }

  function closeModal(){
    $('html').removeClass('show_notifi');
  }
  function closeModalFon(e){
    var target = e.target || e.srcElement;
    if(target.className=="notification_box"){
      closeModal();
    }
  }

  function alert(data){
    if(!data)data={};
    data=objects(alert_opt,data);

    if(!is_init)init();

    notyfy_class='notify_box ';
    if(data.notyfy_class)notyfy_class+=data.notyfy_class;

    box_html='<div class="'+notyfy_class+'">';
    box_html+='<div class="notify_title">';
    box_html+=data.title;
    box_html+='<span class="notify_close"></span>';
    box_html+='</div>';

    box_html+='<div class="notify_content">';
    box_html+=data.question;
    box_html+='</div>';

    if(data.buttonYes||data.buttonNo) {
      box_html += '<div class="notify_control">';
      if (data.buttonYes)box_html += '<div class="notify_btn_yes">' + data.buttonYes + '</div>';
      if (data.buttonNo)box_html += '<div class="notify_btn_no">' + data.buttonNo + '</div>';
      box_html += '</div>';
    };

    box_html+='</div>';
    notification_box.html(box_html);


    setTimeout(function() {
      $('html').addClass('show_notifi');
    },100)
  }

  function confirm(data){
    if(!data)data={};
    data=objects(confirm_opt,data);

    if(!is_init)init();

    box_html='<div class="notify_box">';
    box_html+='<div class="notify_title">';
    box_html+=data.title;
    box_html+='<span class="notify_close"></span>';
    box_html+='</div>';

    box_html+='<div class="notify_content">';
    box_html+=data.question;
    box_html+='</div>';

    if(data.buttonYes||data.buttonNo) {
      box_html += '<div class="notify_control">';
      if (data.buttonYes)box_html += '<div class="notify_btn_yes">' + data.buttonYes + '</div>';
      if (data.buttonNo)box_html += '<div class="notify_btn_no">' + data.buttonNo + '</div>';
      box_html += '</div>';
    }

    box_html+='</div>';
    notification_box.html(box_html);

    if(data.callbackYes!=false){
      notification_box.find('.notify_btn_yes').on('click',data.callbackYes.bind(data.obj));
    }
    if(data.callbackNo!=false){
      notification_box.find('.notify_btn_no').on('click',data.callbackNo.bind(data.obj));
    }

    setTimeout(function() {
      $('html').addClass('show_notifi');
    },100)

  }

  return {
    alert: alert,
    confirm: confirm
  };

})();


$('[ref=popup]').on('click',function (e){
  e.preventDefault();
  $this=$(this)
  el=$($this.attr('href'));
  data=el.data();

  data.question=el.html();
  notification.alert(data);
});

$(window).load(function() {

  $('.accordion .accordion-control').on('click', function (e) {
    e.preventDefault();
    $this = $(this);
    $accordion = $this.closest('.accordion');

    if ($accordion.hasClass('open')) {
      $accordion.find('.accordion-content').hide(300);
      $accordion.removeClass('open')
    } else {
      $accordion.find('.accordion-content').show(300);
      $accordion.addClass('open')
    }
    return false;
  });
})

objects = function (a,b) {
  var c = b,
    key;
  for (key in a) {
    if (a.hasOwnProperty(key)) {
      c[key] = key in b ? b[key] : a[key];
    }
  }
  return c;
};

(function() {
  function img_load_finish(){
    data=this;
    data.img.attr('src',data.src);
  }

  imgs=$('section:not(.navigation)').find('.logo img');
  for (var i=0;i<imgs.length;i++){
    img=imgs.eq(i);
    src=img.attr('src');
    img.attr('src','/images/template-logo.jpg');
    data={
      src:src,
      img:img
    };
    image=$('<img/>',{
      src:src
    }).on('load',img_load_finish.bind(data))
  }
})();

(function() {
  els=$('.ajax_load');
  for(i=0;i<els.length;i++){
    el=els.eq(i);
    url=el.attr('res');
    $.get(url,function (data) {
      $this=$(this);
      $this.html(data);
      ajaxForm($this);
    }.bind(el))
  }
})();

$('input[type=file]').on('change',function(evt){
  var file = evt.target.files; // FileList object
  var f = file[0];
  // Only process image files.
  if (!f.type.match('image.*')) {
    return false;
  }
  var reader = new FileReader();

  data= {
    'el': this,
    'f': f
  };
  reader.onload = (function(data) {
    return function(e) {
      img=$('[for="'+data.el.name+'"]');
      if(img.length>0){
        img.attr('src',e.target.result)
      }
    };
  })(data);
  // Read in the image file as a data URL.
  reader.readAsDataURL(f);
});

$('body').on('click','a.ajaxFormOpen',function(e){
  e.preventDefault();
  href=this.href.split('#');
  href=href[href.length-1];

  data={
    buttonYes:false,
    notyfy_class:"notify_white loading",
    question:''
  };
  modal_class=$(this).data('modal-class');

  notification.alert(data);
  $.get('/'+href,function(data){
    $('.notify_box').removeClass('loading');
    $('.notify_box .notify_content').html(data.html);
    ajaxForm($('.notify_box .notify_content'));
    if(modal_class){
      $('.notify_box .notify_content .row').addClass(modal_class);
    }
  },'json')
});
function ajaxForm(els) {
  var fileApi = window.File && window.FileReader && window.FileList && window.Blob ? true : false;
  var defaults = {
    error_class: '.has-error',
  };

  function onPost(post){
    var data=this;
    form=data.form;
    wrap=data.wrap;
    if(post.render){
      post.notyfy_class="notify_white";
      notification.alert(post);
    }else{
      wrap.removeClass('loading');
      wrap.html(post.html);
      ajaxForm(wrap);
    }
  }

  function onFail(){
    var data=this;
    form=data.form;
    wrap=data.wrap;
    wrap.removeClass('loading');
    wrap.html('Ошибка обработки формы попробуйте позже');
    ajaxForm(wrap);

  }

  function onSubmit(e){
    e.preventDefault();
    var data=this;
    form=data.form;
    wrap=data.wrap;

    if(form.yiiActiveForm){
      form.yiiActiveForm('validate');
    };

    isValid=(form.find(data.param.error_class).length==0);

    if(!isValid){
      return false;
    }else{
      required=form.find('input.required');
      for(i=0;i<required.length;i++){
        if(required.eq(i).val().length<1){
          return false
        }
      }
    }

    if(!form.serializeObject)addSRO();

    var post=form.serializeObject();
    form.addClass('loading');
    form.html('');

    $.post(
      data.url,
      post,
      onPost.bind(data),
      'json'
    ).fail(onFail.bind(data));

    return false;
  }

  els.find('[required]')
    .addClass('required')
    .removeAttr('required');

  for(var i=0;i<els.length;i++){
    wrap=els.eq(i);
    form=wrap.find('form');
    data={
      form:form,
      param:defaults,
      wrap:wrap
    };
    data.url=form.attr('action') || location.href;
    data.method= form.attr('method') || 'post';
    form.off('submit');
    form.on('submit', onSubmit.bind(data));
  }
}

function addSRO(){
  $.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
      if (o[this.name]) {
        if (!o[this.name].push) {
          o[this.name] = [o[this.name]];
        }
        o[this.name].push(this.value || '');
      } else {
        o[this.name] = this.value || '';
      }
    });
    return o;
  };
};
addSRO();
$('body').on('click','a[href=#login],a[href=#registration],a[href=#resetpassword]',function(e){
  e.preventDefault();
  //при открытии формы регистрации закрыть, если отрыто - попап использования купона без регистрации
  var popup = $("a[href='#showpromocode-noregister']").data('popup');
  if (popup) {
    popup.close();
  } else {
    popup = $('div.popup_cont, div.popup_back');
    if (popup) {
      popup.hide();
    }
  }
  href=this.href.split('#');
  href=href[href.length-1];

  data={
    buttonYes:false,
    notyfy_class:"notify_white loading",
    question:''
  };
  notification.alert(data);
  $.get('/'+href,function(data){
    $('.notify_box').removeClass('loading');
    $('.notify_box .notify_content').html(data.html);
    ajaxForm($('.notify_box .notify_content'));
  },'json')
});

$(function() {
  function starNomination(index) {
    var stars = $(".notify_content .rating .fa-wrapper .fa");
    stars.removeClass("fa-star").addClass("fa-star-o");
    for (var i = 0; i < index; i++) {
      stars.eq(i).removeClass("fa-star-o").addClass("fa-star");
    }
  }

  $(document).on("mouseover", ".notify_content .rating .fa-wrapper .fa", function (e) {
    starNomination($(this).index() + 1);
  }).on("mouseleave", ".notify_content .rating .fa-wrapper", function (e) {
    starNomination($(".notify_content input[name=\"Reviews[rating]\"]").val());
  }).on("click", ".notify_content .rating .fa-wrapper .fa", function (e) {
    starNomination($(this).index() + 1);

    $(".notify_content input[name=\"Reviews[rating]\"]").val($(this).index() + 1);
  });
});

ajaxForm($('.ajax_form'));


$("a[href='#showpromocode-noregister']").popup({
  content : '<div class="coupon-noregister">'+
  '<div class="coupon-noregister__icon"><img src="/images/templates/swa.png" alt=""></div>'+
  '<div class="coupon-noregister__text">Для получения кэшбэка необходимо</br>авторизоваться на сайте</div>' +
  '<div class="coupon-noregister__buttons">'+
  '<a href="goto/coupon:{id}" target="_blank" class="btn  btn-popup">Воспользоваться</br>купоном</br>без регистрации</a>'+
  '<a href="#registration" class="btn btn-popup">Зарегистрироваться</br>и получить</br>ещё и кэшбэк</a>'+
  '</div>'+
  '<div>',
  type : 'html',
  beforeOpen: function() {
    //заменить в контенте {id}
    var id = $(this.ele).data('id');
    this.o.content = this.o.content.replace('{id}', id);
    //если закрыли принудительно, то показать
    popup = $('div.popup_cont, div.popup_back');
    if (popup) {
      popup.show();
    }
  },
  afterOpen: function() {
    $('.popup_content')[0].innerHTML = this.o.content;
  }
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJldGluYS5qcyIsImpxdWVyeS5mYW5jeWJveC5wYWNrLmpzIiwic2NyaXB0cy5qcyIsImpxdWVyeS5mbGV4c2xpZGVyLW1pbi5qcyIsImNsYXNzaWUuanMiLCJqcXVlcnkucG9wdXAubWluLmpzIiwiYW5pbW8uanMiLCJqcXVlcnkud2F5cG9pbnRzLm1pbi5qcyIsImpxdWVyeS5wbHVnaW4ubWluLmpzIiwianF1ZXJ5LmNvdW50ZG93bi5taW4uanMiLCJqcXVlcnkubm90eS5wYWNrYWdlZC5taW4uanMiLCJqcXVlcnkubW9ja2pheC5qcyIsImpxdWVyeS5hdXRvY29tcGxldGUuanMiLCJtYWluLmpzIiwibm90aWZpY2F0aW9uLmpzIiwiZm9yX2FsbC5qcyIsImpxdWVyeS5hamF4Rm9ybS5qcyIsIm15LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbFVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNMQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeGxCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzl3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyohXHJcbiAqIFJldGluYS5qcyB2MS4zLjBcclxuICpcclxuICogQ29weXJpZ2h0IDIwMTQgSW11bHVzLCBMTENcclxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXHJcbiAqXHJcbiAqIFJldGluYS5qcyBpcyBhbiBvcGVuIHNvdXJjZSBzY3JpcHQgdGhhdCBtYWtlcyBpdCBlYXN5IHRvIHNlcnZlXHJcbiAqIGhpZ2gtcmVzb2x1dGlvbiBpbWFnZXMgdG8gZGV2aWNlcyB3aXRoIHJldGluYSBkaXNwbGF5cy5cclxuICovXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcm9vdCA9ICh0eXBlb2YgZXhwb3J0cyA9PT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiBleHBvcnRzKTtcclxuICAgIHZhciBjb25maWcgPSB7XHJcbiAgICAgICAgLy8gQW4gb3B0aW9uIHRvIGNob29zZSBhIHN1ZmZpeCBmb3IgMnggaW1hZ2VzXHJcbiAgICAgICAgcmV0aW5hSW1hZ2VTdWZmaXggOiAnQDJ4JyxcclxuXHJcbiAgICAgICAgLy8gRW5zdXJlIENvbnRlbnQtVHlwZSBpcyBhbiBpbWFnZSBiZWZvcmUgdHJ5aW5nIHRvIGxvYWQgQDJ4IGltYWdlXHJcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2ltdWx1cy9yZXRpbmFqcy9wdWxsLzQ1KVxyXG4gICAgICAgIGNoZWNrX21pbWVfdHlwZTogdHJ1ZSxcclxuXHJcbiAgICAgICAgLy8gUmVzaXplIGhpZ2gtcmVzb2x1dGlvbiBpbWFnZXMgdG8gb3JpZ2luYWwgaW1hZ2UncyBwaXhlbCBkaW1lbnNpb25zXHJcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2ltdWx1cy9yZXRpbmFqcy9pc3N1ZXMvOFxyXG4gICAgICAgIGZvcmNlX29yaWdpbmFsX2RpbWVuc2lvbnM6IHRydWVcclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gUmV0aW5hKCkge31cclxuXHJcbiAgICByb290LlJldGluYSA9IFJldGluYTtcclxuXHJcbiAgICBSZXRpbmEuY29uZmlndXJlID0gZnVuY3Rpb24ob3B0aW9ucykge1xyXG4gICAgICAgIGlmIChvcHRpb25zID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7fTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAodmFyIHByb3AgaW4gb3B0aW9ucykge1xyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xyXG4gICAgICAgICAgICAgICAgY29uZmlnW3Byb3BdID0gb3B0aW9uc1twcm9wXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgUmV0aW5hLmluaXQgPSBmdW5jdGlvbihjb250ZXh0KSB7XHJcbiAgICAgICAgaWYgKGNvbnRleHQgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgY29udGV4dCA9IHJvb3Q7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgZXhpc3Rpbmdfb25sb2FkID0gY29udGV4dC5vbmxvYWQgfHwgZnVuY3Rpb24oKXt9O1xyXG5cclxuICAgICAgICBjb250ZXh0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgaW1hZ2VzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2ltZycpLCByZXRpbmFJbWFnZXMgPSBbXSwgaSwgaW1hZ2U7XHJcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBpbWFnZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgIGltYWdlID0gaW1hZ2VzW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKCEhIWltYWdlLmdldEF0dHJpYnV0ZU5vZGUoJ2RhdGEtbm8tcmV0aW5hJykpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXRpbmFJbWFnZXMucHVzaChuZXcgUmV0aW5hSW1hZ2UoaW1hZ2UpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBleGlzdGluZ19vbmxvYWQoKTtcclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuXHJcbiAgICBSZXRpbmEuaXNSZXRpbmEgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciBtZWRpYVF1ZXJ5ID0gJygtd2Via2l0LW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDEuNSksIChtaW4tLW1vei1kZXZpY2UtcGl4ZWwtcmF0aW86IDEuNSksICgtby1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAzLzIpLCAobWluLXJlc29sdXRpb246IDEuNWRwcHgpJztcclxuXHJcbiAgICAgICAgaWYgKHJvb3QuZGV2aWNlUGl4ZWxSYXRpbyA+IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocm9vdC5tYXRjaE1lZGlhICYmIHJvb3QubWF0Y2hNZWRpYShtZWRpYVF1ZXJ5KS5tYXRjaGVzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgdmFyIHJlZ2V4TWF0Y2ggPSAvXFwuXFx3KyQvO1xyXG4gICAgZnVuY3Rpb24gc3VmZml4UmVwbGFjZSAobWF0Y2gpIHtcclxuICAgICAgICByZXR1cm4gY29uZmlnLnJldGluYUltYWdlU3VmZml4ICsgbWF0Y2g7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gUmV0aW5hSW1hZ2VQYXRoKHBhdGgsIGF0XzJ4X3BhdGgpIHtcclxuICAgICAgICB0aGlzLnBhdGggPSBwYXRoIHx8ICcnO1xyXG4gICAgICAgIGlmICh0eXBlb2YgYXRfMnhfcGF0aCAhPT0gJ3VuZGVmaW5lZCcgJiYgYXRfMnhfcGF0aCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLmF0XzJ4X3BhdGggPSBhdF8yeF9wYXRoO1xyXG4gICAgICAgICAgICB0aGlzLnBlcmZvcm1fY2hlY2sgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodW5kZWZpbmVkICE9PSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbG9jYXRpb25PYmplY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbk9iamVjdC5ocmVmID0gdGhpcy5wYXRoO1xyXG4gICAgICAgICAgICAgICAgbG9jYXRpb25PYmplY3QucGF0aG5hbWUgPSBsb2NhdGlvbk9iamVjdC5wYXRobmFtZS5yZXBsYWNlKHJlZ2V4TWF0Y2gsIHN1ZmZpeFJlcGxhY2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hdF8yeF9wYXRoID0gbG9jYXRpb25PYmplY3QuaHJlZjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHZhciBwYXJ0cyA9IHRoaXMucGF0aC5zcGxpdCgnPycpO1xyXG4gICAgICAgICAgICAgICAgcGFydHNbMF0gPSBwYXJ0c1swXS5yZXBsYWNlKHJlZ2V4TWF0Y2gsIHN1ZmZpeFJlcGxhY2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hdF8yeF9wYXRoID0gcGFydHMuam9pbignPycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucGVyZm9ybV9jaGVjayA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJvb3QuUmV0aW5hSW1hZ2VQYXRoID0gUmV0aW5hSW1hZ2VQYXRoO1xyXG5cclxuICAgIFJldGluYUltYWdlUGF0aC5jb25maXJtZWRfcGF0aHMgPSBbXTtcclxuXHJcbiAgICBSZXRpbmFJbWFnZVBhdGgucHJvdG90eXBlLmlzX2V4dGVybmFsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuICEhKHRoaXMucGF0aC5tYXRjaCgvXmh0dHBzP1xcOi9pKSAmJiAhdGhpcy5wYXRoLm1hdGNoKCcvLycgKyBkb2N1bWVudC5kb21haW4pICk7XHJcbiAgICB9O1xyXG5cclxuICAgIFJldGluYUltYWdlUGF0aC5wcm90b3R5cGUuY2hlY2tfMnhfdmFyaWFudCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIGh0dHAsIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIGlmICh0aGlzLmlzX2V4dGVybmFsKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGZhbHNlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnBlcmZvcm1fY2hlY2sgJiYgdHlwZW9mIHRoaXMuYXRfMnhfcGF0aCAhPT0gJ3VuZGVmaW5lZCcgJiYgdGhpcy5hdF8yeF9wYXRoICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayh0cnVlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYXRfMnhfcGF0aCBpbiBSZXRpbmFJbWFnZVBhdGguY29uZmlybWVkX3BhdGhzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayh0cnVlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgIGh0dHAub3BlbignSEVBRCcsIHRoaXMuYXRfMnhfcGF0aCk7XHJcbiAgICAgICAgICAgIGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaHR0cC5yZWFkeVN0YXRlICE9PSA0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaHR0cC5zdGF0dXMgPj0gMjAwICYmIGh0dHAuc3RhdHVzIDw9IDM5OSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25maWcuY2hlY2tfbWltZV90eXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0eXBlID0gaHR0cC5nZXRSZXNwb25zZUhlYWRlcignQ29udGVudC1UeXBlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSBudWxsIHx8ICF0eXBlLm1hdGNoKC9eaW1hZ2UvaSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIFJldGluYUltYWdlUGF0aC5jb25maXJtZWRfcGF0aHMucHVzaCh0aGF0LmF0XzJ4X3BhdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayh0cnVlKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaHR0cC5zZW5kKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcblxyXG4gICAgZnVuY3Rpb24gUmV0aW5hSW1hZ2UoZWwpIHtcclxuICAgICAgICB0aGlzLmVsID0gZWw7XHJcbiAgICAgICAgdGhpcy5wYXRoID0gbmV3IFJldGluYUltYWdlUGF0aCh0aGlzLmVsLmdldEF0dHJpYnV0ZSgnc3JjJyksIHRoaXMuZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWF0MngnKSk7XHJcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMucGF0aC5jaGVja18yeF92YXJpYW50KGZ1bmN0aW9uKGhhc1ZhcmlhbnQpIHtcclxuICAgICAgICAgICAgaWYgKGhhc1ZhcmlhbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuc3dhcCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcm9vdC5SZXRpbmFJbWFnZSA9IFJldGluYUltYWdlO1xyXG5cclxuICAgIFJldGluYUltYWdlLnByb3RvdHlwZS5zd2FwID0gZnVuY3Rpb24ocGF0aCkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgcGF0aCA9IHRoaXMucGF0aC5hdF8yeF9wYXRoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIGZ1bmN0aW9uIGxvYWQoKSB7XHJcbiAgICAgICAgICAgIGlmICghIHRoYXQuZWwuY29tcGxldGUpIHtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQobG9hZCwgNSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY29uZmlnLmZvcmNlX29yaWdpbmFsX2RpbWVuc2lvbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmVsLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCB0aGF0LmVsLm9mZnNldFdpZHRoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmVsLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgdGhhdC5lbC5vZmZzZXRIZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoYXQuZWwuc2V0QXR0cmlidXRlKCdzcmMnLCBwYXRoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBsb2FkKCk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICBpZiAoUmV0aW5hLmlzUmV0aW5hKCkpIHtcclxuICAgICAgICBSZXRpbmEuaW5pdChyb290KTtcclxuICAgIH1cclxufSkoKTtcclxuIiwiLyohIGZhbmN5Qm94IHYyLjEuNSBmYW5jeWFwcHMuY29tIHwgZmFuY3lhcHBzLmNvbS9mYW5jeWJveC8jbGljZW5zZSAqL1xyXG4oZnVuY3Rpb24ocixHLGYsdil7dmFyIEo9ZihcImh0bWxcIiksbj1mKHIpLHA9ZihHKSxiPWYuZmFuY3lib3g9ZnVuY3Rpb24oKXtiLm9wZW4uYXBwbHkodGhpcyxhcmd1bWVudHMpfSxJPW5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL21zaWUvaSksQj1udWxsLHM9Ry5jcmVhdGVUb3VjaCE9PXYsdD1mdW5jdGlvbihhKXtyZXR1cm4gYSYmYS5oYXNPd25Qcm9wZXJ0eSYmYSBpbnN0YW5jZW9mIGZ9LHE9ZnVuY3Rpb24oYSl7cmV0dXJuIGEmJlwic3RyaW5nXCI9PT1mLnR5cGUoYSl9LEU9ZnVuY3Rpb24oYSl7cmV0dXJuIHEoYSkmJjA8YS5pbmRleE9mKFwiJVwiKX0sbD1mdW5jdGlvbihhLGQpe3ZhciBlPXBhcnNlSW50KGEsMTApfHwwO2QmJkUoYSkmJihlKj1iLmdldFZpZXdwb3J0KClbZF0vMTAwKTtyZXR1cm4gTWF0aC5jZWlsKGUpfSx3PWZ1bmN0aW9uKGEsYil7cmV0dXJuIGwoYSxiKStcInB4XCJ9O2YuZXh0ZW5kKGIse3ZlcnNpb246XCIyLjEuNVwiLGRlZmF1bHRzOntwYWRkaW5nOjE1LG1hcmdpbjoyMCxcclxud2lkdGg6ODAwLGhlaWdodDo2MDAsbWluV2lkdGg6MTAwLG1pbkhlaWdodDoxMDAsbWF4V2lkdGg6OTk5OSxtYXhIZWlnaHQ6OTk5OSxwaXhlbFJhdGlvOjEsYXV0b1NpemU6ITAsYXV0b0hlaWdodDohMSxhdXRvV2lkdGg6ITEsYXV0b1Jlc2l6ZTohMCxhdXRvQ2VudGVyOiFzLGZpdFRvVmlldzohMCxhc3BlY3RSYXRpbzohMSx0b3BSYXRpbzowLjUsbGVmdFJhdGlvOjAuNSxzY3JvbGxpbmc6XCJhdXRvXCIsd3JhcENTUzpcIlwiLGFycm93czohMCxjbG9zZUJ0bjohMCxjbG9zZUNsaWNrOiExLG5leHRDbGljazohMSxtb3VzZVdoZWVsOiEwLGF1dG9QbGF5OiExLHBsYXlTcGVlZDozRTMscHJlbG9hZDozLG1vZGFsOiExLGxvb3A6ITAsYWpheDp7ZGF0YVR5cGU6XCJodG1sXCIsaGVhZGVyczp7XCJYLWZhbmN5Qm94XCI6ITB9fSxpZnJhbWU6e3Njcm9sbGluZzpcImF1dG9cIixwcmVsb2FkOiEwfSxzd2Y6e3dtb2RlOlwidHJhbnNwYXJlbnRcIixhbGxvd2Z1bGxzY3JlZW46XCJ0cnVlXCIsYWxsb3dzY3JpcHRhY2Nlc3M6XCJhbHdheXNcIn0sXHJcbmtleXM6e25leHQ6ezEzOlwibGVmdFwiLDM0OlwidXBcIiwzOTpcImxlZnRcIiw0MDpcInVwXCJ9LHByZXY6ezg6XCJyaWdodFwiLDMzOlwiZG93blwiLDM3OlwicmlnaHRcIiwzODpcImRvd25cIn0sY2xvc2U6WzI3XSxwbGF5OlszMl0sdG9nZ2xlOls3MF19LGRpcmVjdGlvbjp7bmV4dDpcImxlZnRcIixwcmV2OlwicmlnaHRcIn0sc2Nyb2xsT3V0c2lkZTohMCxpbmRleDowLHR5cGU6bnVsbCxocmVmOm51bGwsY29udGVudDpudWxsLHRpdGxlOm51bGwsdHBsOnt3cmFwOic8ZGl2IGNsYXNzPVwiZmFuY3lib3gtd3JhcFwiIHRhYkluZGV4PVwiLTFcIj48ZGl2IGNsYXNzPVwiZmFuY3lib3gtc2tpblwiPjxkaXYgY2xhc3M9XCJmYW5jeWJveC1vdXRlclwiPjxkaXYgY2xhc3M9XCJmYW5jeWJveC1pbm5lclwiPjwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2PicsaW1hZ2U6JzxpbWcgY2xhc3M9XCJmYW5jeWJveC1pbWFnZVwiIHNyYz1cIntocmVmfVwiIGFsdD1cIlwiIC8+JyxpZnJhbWU6JzxpZnJhbWUgaWQ9XCJmYW5jeWJveC1mcmFtZXtybmR9XCIgbmFtZT1cImZhbmN5Ym94LWZyYW1le3JuZH1cIiBjbGFzcz1cImZhbmN5Ym94LWlmcmFtZVwiIGZyYW1lYm9yZGVyPVwiMFwiIHZzcGFjZT1cIjBcIiBoc3BhY2U9XCIwXCIgd2Via2l0QWxsb3dGdWxsU2NyZWVuIG1vemFsbG93ZnVsbHNjcmVlbiBhbGxvd0Z1bGxTY3JlZW4nK1xyXG4oST8nIGFsbG93dHJhbnNwYXJlbmN5PVwidHJ1ZVwiJzpcIlwiKStcIj48L2lmcmFtZT5cIixlcnJvcjonPHAgY2xhc3M9XCJmYW5jeWJveC1lcnJvclwiPlRoZSByZXF1ZXN0ZWQgY29udGVudCBjYW5ub3QgYmUgbG9hZGVkLjxici8+UGxlYXNlIHRyeSBhZ2FpbiBsYXRlci48L3A+JyxjbG9zZUJ0bjonPGEgdGl0bGU9XCJDbG9zZVwiIGNsYXNzPVwiZmFuY3lib3gtaXRlbSBmYW5jeWJveC1jbG9zZVwiIGhyZWY9XCJqYXZhc2NyaXB0OjtcIj48L2E+JyxuZXh0Oic8YSB0aXRsZT1cIk5leHRcIiBjbGFzcz1cImZhbmN5Ym94LW5hdiBmYW5jeWJveC1uZXh0XCIgaHJlZj1cImphdmFzY3JpcHQ6O1wiPjxzcGFuPjwvc3Bhbj48L2E+JyxwcmV2Oic8YSB0aXRsZT1cIlByZXZpb3VzXCIgY2xhc3M9XCJmYW5jeWJveC1uYXYgZmFuY3lib3gtcHJldlwiIGhyZWY9XCJqYXZhc2NyaXB0OjtcIj48c3Bhbj48L3NwYW4+PC9hPid9LG9wZW5FZmZlY3Q6XCJmYWRlXCIsb3BlblNwZWVkOjI1MCxvcGVuRWFzaW5nOlwic3dpbmdcIixvcGVuT3BhY2l0eTohMCxcclxub3Blbk1ldGhvZDpcInpvb21JblwiLGNsb3NlRWZmZWN0OlwiZmFkZVwiLGNsb3NlU3BlZWQ6MjUwLGNsb3NlRWFzaW5nOlwic3dpbmdcIixjbG9zZU9wYWNpdHk6ITAsY2xvc2VNZXRob2Q6XCJ6b29tT3V0XCIsbmV4dEVmZmVjdDpcImVsYXN0aWNcIixuZXh0U3BlZWQ6MjUwLG5leHRFYXNpbmc6XCJzd2luZ1wiLG5leHRNZXRob2Q6XCJjaGFuZ2VJblwiLHByZXZFZmZlY3Q6XCJlbGFzdGljXCIscHJldlNwZWVkOjI1MCxwcmV2RWFzaW5nOlwic3dpbmdcIixwcmV2TWV0aG9kOlwiY2hhbmdlT3V0XCIsaGVscGVyczp7b3ZlcmxheTohMCx0aXRsZTohMH0sb25DYW5jZWw6Zi5ub29wLGJlZm9yZUxvYWQ6Zi5ub29wLGFmdGVyTG9hZDpmLm5vb3AsYmVmb3JlU2hvdzpmLm5vb3AsYWZ0ZXJTaG93OmYubm9vcCxiZWZvcmVDaGFuZ2U6Zi5ub29wLGJlZm9yZUNsb3NlOmYubm9vcCxhZnRlckNsb3NlOmYubm9vcH0sZ3JvdXA6e30sb3B0czp7fSxwcmV2aW91czpudWxsLGNvbWluZzpudWxsLGN1cnJlbnQ6bnVsbCxpc0FjdGl2ZTohMSxcclxuaXNPcGVuOiExLGlzT3BlbmVkOiExLHdyYXA6bnVsbCxza2luOm51bGwsb3V0ZXI6bnVsbCxpbm5lcjpudWxsLHBsYXllcjp7dGltZXI6bnVsbCxpc0FjdGl2ZTohMX0sYWpheExvYWQ6bnVsbCxpbWdQcmVsb2FkOm51bGwsdHJhbnNpdGlvbnM6e30saGVscGVyczp7fSxvcGVuOmZ1bmN0aW9uKGEsZCl7aWYoYSYmKGYuaXNQbGFpbk9iamVjdChkKXx8KGQ9e30pLCExIT09Yi5jbG9zZSghMCkpKXJldHVybiBmLmlzQXJyYXkoYSl8fChhPXQoYSk/ZihhKS5nZXQoKTpbYV0pLGYuZWFjaChhLGZ1bmN0aW9uKGUsYyl7dmFyIGs9e30sZyxoLGosbSxsO1wib2JqZWN0XCI9PT1mLnR5cGUoYykmJihjLm5vZGVUeXBlJiYoYz1mKGMpKSx0KGMpPyhrPXtocmVmOmMuZGF0YShcImZhbmN5Ym94LWhyZWZcIil8fGMuYXR0cihcImhyZWZcIiksdGl0bGU6Yy5kYXRhKFwiZmFuY3lib3gtdGl0bGVcIil8fGMuYXR0cihcInRpdGxlXCIpLGlzRG9tOiEwLGVsZW1lbnQ6Y30sZi5tZXRhZGF0YSYmZi5leHRlbmQoITAsayxcclxuYy5tZXRhZGF0YSgpKSk6az1jKTtnPWQuaHJlZnx8ay5ocmVmfHwocShjKT9jOm51bGwpO2g9ZC50aXRsZSE9PXY/ZC50aXRsZTprLnRpdGxlfHxcIlwiO209KGo9ZC5jb250ZW50fHxrLmNvbnRlbnQpP1wiaHRtbFwiOmQudHlwZXx8ay50eXBlOyFtJiZrLmlzRG9tJiYobT1jLmRhdGEoXCJmYW5jeWJveC10eXBlXCIpLG18fChtPShtPWMucHJvcChcImNsYXNzXCIpLm1hdGNoKC9mYW5jeWJveFxcLihcXHcrKS8pKT9tWzFdOm51bGwpKTtxKGcpJiYobXx8KGIuaXNJbWFnZShnKT9tPVwiaW1hZ2VcIjpiLmlzU1dGKGcpP209XCJzd2ZcIjpcIiNcIj09PWcuY2hhckF0KDApP209XCJpbmxpbmVcIjpxKGMpJiYobT1cImh0bWxcIixqPWMpKSxcImFqYXhcIj09PW0mJihsPWcuc3BsaXQoL1xccysvLDIpLGc9bC5zaGlmdCgpLGw9bC5zaGlmdCgpKSk7anx8KFwiaW5saW5lXCI9PT1tP2c/aj1mKHEoZyk/Zy5yZXBsYWNlKC8uKig/PSNbXlxcc10rJCkvLFwiXCIpOmcpOmsuaXNEb20mJihqPWMpOlwiaHRtbFwiPT09bT9qPWc6IW0mJighZyYmXHJcbmsuaXNEb20pJiYobT1cImlubGluZVwiLGo9YykpO2YuZXh0ZW5kKGsse2hyZWY6Zyx0eXBlOm0sY29udGVudDpqLHRpdGxlOmgsc2VsZWN0b3I6bH0pO2FbZV09a30pLGIub3B0cz1mLmV4dGVuZCghMCx7fSxiLmRlZmF1bHRzLGQpLGQua2V5cyE9PXYmJihiLm9wdHMua2V5cz1kLmtleXM/Zi5leHRlbmQoe30sYi5kZWZhdWx0cy5rZXlzLGQua2V5cyk6ITEpLGIuZ3JvdXA9YSxiLl9zdGFydChiLm9wdHMuaW5kZXgpfSxjYW5jZWw6ZnVuY3Rpb24oKXt2YXIgYT1iLmNvbWluZzthJiYhMSE9PWIudHJpZ2dlcihcIm9uQ2FuY2VsXCIpJiYoYi5oaWRlTG9hZGluZygpLGIuYWpheExvYWQmJmIuYWpheExvYWQuYWJvcnQoKSxiLmFqYXhMb2FkPW51bGwsYi5pbWdQcmVsb2FkJiYoYi5pbWdQcmVsb2FkLm9ubG9hZD1iLmltZ1ByZWxvYWQub25lcnJvcj1udWxsKSxhLndyYXAmJmEud3JhcC5zdG9wKCEwLCEwKS50cmlnZ2VyKFwib25SZXNldFwiKS5yZW1vdmUoKSxiLmNvbWluZz1udWxsLGIuY3VycmVudHx8XHJcbmIuX2FmdGVyWm9vbU91dChhKSl9LGNsb3NlOmZ1bmN0aW9uKGEpe2IuY2FuY2VsKCk7ITEhPT1iLnRyaWdnZXIoXCJiZWZvcmVDbG9zZVwiKSYmKGIudW5iaW5kRXZlbnRzKCksYi5pc0FjdGl2ZSYmKCFiLmlzT3Blbnx8ITA9PT1hPyhmKFwiLmZhbmN5Ym94LXdyYXBcIikuc3RvcCghMCkudHJpZ2dlcihcIm9uUmVzZXRcIikucmVtb3ZlKCksYi5fYWZ0ZXJab29tT3V0KCkpOihiLmlzT3Blbj1iLmlzT3BlbmVkPSExLGIuaXNDbG9zaW5nPSEwLGYoXCIuZmFuY3lib3gtaXRlbSwgLmZhbmN5Ym94LW5hdlwiKS5yZW1vdmUoKSxiLndyYXAuc3RvcCghMCwhMCkucmVtb3ZlQ2xhc3MoXCJmYW5jeWJveC1vcGVuZWRcIiksYi50cmFuc2l0aW9uc1tiLmN1cnJlbnQuY2xvc2VNZXRob2RdKCkpKSl9LHBsYXk6ZnVuY3Rpb24oYSl7dmFyIGQ9ZnVuY3Rpb24oKXtjbGVhclRpbWVvdXQoYi5wbGF5ZXIudGltZXIpfSxlPWZ1bmN0aW9uKCl7ZCgpO2IuY3VycmVudCYmYi5wbGF5ZXIuaXNBY3RpdmUmJihiLnBsYXllci50aW1lcj1cclxuc2V0VGltZW91dChiLm5leHQsYi5jdXJyZW50LnBsYXlTcGVlZCkpfSxjPWZ1bmN0aW9uKCl7ZCgpO3AudW5iaW5kKFwiLnBsYXllclwiKTtiLnBsYXllci5pc0FjdGl2ZT0hMTtiLnRyaWdnZXIoXCJvblBsYXlFbmRcIil9O2lmKCEwPT09YXx8IWIucGxheWVyLmlzQWN0aXZlJiYhMSE9PWEpe2lmKGIuY3VycmVudCYmKGIuY3VycmVudC5sb29wfHxiLmN1cnJlbnQuaW5kZXg8Yi5ncm91cC5sZW5ndGgtMSkpYi5wbGF5ZXIuaXNBY3RpdmU9ITAscC5iaW5kKHtcIm9uQ2FuY2VsLnBsYXllciBiZWZvcmVDbG9zZS5wbGF5ZXJcIjpjLFwib25VcGRhdGUucGxheWVyXCI6ZSxcImJlZm9yZUxvYWQucGxheWVyXCI6ZH0pLGUoKSxiLnRyaWdnZXIoXCJvblBsYXlTdGFydFwiKX1lbHNlIGMoKX0sbmV4dDpmdW5jdGlvbihhKXt2YXIgZD1iLmN1cnJlbnQ7ZCYmKHEoYSl8fChhPWQuZGlyZWN0aW9uLm5leHQpLGIuanVtcHRvKGQuaW5kZXgrMSxhLFwibmV4dFwiKSl9LHByZXY6ZnVuY3Rpb24oYSl7dmFyIGQ9Yi5jdXJyZW50O1xyXG5kJiYocShhKXx8KGE9ZC5kaXJlY3Rpb24ucHJldiksYi5qdW1wdG8oZC5pbmRleC0xLGEsXCJwcmV2XCIpKX0sanVtcHRvOmZ1bmN0aW9uKGEsZCxlKXt2YXIgYz1iLmN1cnJlbnQ7YyYmKGE9bChhKSxiLmRpcmVjdGlvbj1kfHxjLmRpcmVjdGlvblthPj1jLmluZGV4P1wibmV4dFwiOlwicHJldlwiXSxiLnJvdXRlcj1lfHxcImp1bXB0b1wiLGMubG9vcCYmKDA+YSYmKGE9Yy5ncm91cC5sZW5ndGgrYSVjLmdyb3VwLmxlbmd0aCksYSU9Yy5ncm91cC5sZW5ndGgpLGMuZ3JvdXBbYV0hPT12JiYoYi5jYW5jZWwoKSxiLl9zdGFydChhKSkpfSxyZXBvc2l0aW9uOmZ1bmN0aW9uKGEsZCl7dmFyIGU9Yi5jdXJyZW50LGM9ZT9lLndyYXA6bnVsbCxrO2MmJihrPWIuX2dldFBvc2l0aW9uKGQpLGEmJlwic2Nyb2xsXCI9PT1hLnR5cGU/KGRlbGV0ZSBrLnBvc2l0aW9uLGMuc3RvcCghMCwhMCkuYW5pbWF0ZShrLDIwMCkpOihjLmNzcyhrKSxlLnBvcz1mLmV4dGVuZCh7fSxlLmRpbSxrKSkpfSx1cGRhdGU6ZnVuY3Rpb24oYSl7dmFyIGQ9XHJcbmEmJmEudHlwZSxlPSFkfHxcIm9yaWVudGF0aW9uY2hhbmdlXCI9PT1kO2UmJihjbGVhclRpbWVvdXQoQiksQj1udWxsKTtiLmlzT3BlbiYmIUImJihCPXNldFRpbWVvdXQoZnVuY3Rpb24oKXt2YXIgYz1iLmN1cnJlbnQ7YyYmIWIuaXNDbG9zaW5nJiYoYi53cmFwLnJlbW92ZUNsYXNzKFwiZmFuY3lib3gtdG1wXCIpLChlfHxcImxvYWRcIj09PWR8fFwicmVzaXplXCI9PT1kJiZjLmF1dG9SZXNpemUpJiZiLl9zZXREaW1lbnNpb24oKSxcInNjcm9sbFwiPT09ZCYmYy5jYW5TaHJpbmt8fGIucmVwb3NpdGlvbihhKSxiLnRyaWdnZXIoXCJvblVwZGF0ZVwiKSxCPW51bGwpfSxlJiYhcz8wOjMwMCkpfSx0b2dnbGU6ZnVuY3Rpb24oYSl7Yi5pc09wZW4mJihiLmN1cnJlbnQuZml0VG9WaWV3PVwiYm9vbGVhblwiPT09Zi50eXBlKGEpP2E6IWIuY3VycmVudC5maXRUb1ZpZXcscyYmKGIud3JhcC5yZW1vdmVBdHRyKFwic3R5bGVcIikuYWRkQ2xhc3MoXCJmYW5jeWJveC10bXBcIiksYi50cmlnZ2VyKFwib25VcGRhdGVcIikpLFxyXG5iLnVwZGF0ZSgpKX0saGlkZUxvYWRpbmc6ZnVuY3Rpb24oKXtwLnVuYmluZChcIi5sb2FkaW5nXCIpO2YoXCIjZmFuY3lib3gtbG9hZGluZ1wiKS5yZW1vdmUoKX0sc2hvd0xvYWRpbmc6ZnVuY3Rpb24oKXt2YXIgYSxkO2IuaGlkZUxvYWRpbmcoKTthPWYoJzxkaXYgaWQ9XCJmYW5jeWJveC1sb2FkaW5nXCI+PGRpdj48L2Rpdj48L2Rpdj4nKS5jbGljayhiLmNhbmNlbCkuYXBwZW5kVG8oXCJib2R5XCIpO3AuYmluZChcImtleWRvd24ubG9hZGluZ1wiLGZ1bmN0aW9uKGEpe2lmKDI3PT09KGEud2hpY2h8fGEua2V5Q29kZSkpYS5wcmV2ZW50RGVmYXVsdCgpLGIuY2FuY2VsKCl9KTtiLmRlZmF1bHRzLmZpeGVkfHwoZD1iLmdldFZpZXdwb3J0KCksYS5jc3Moe3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6MC41KmQuaCtkLnksbGVmdDowLjUqZC53K2QueH0pKX0sZ2V0Vmlld3BvcnQ6ZnVuY3Rpb24oKXt2YXIgYT1iLmN1cnJlbnQmJmIuY3VycmVudC5sb2NrZWR8fCExLGQ9e3g6bi5zY3JvbGxMZWZ0KCksXHJcbnk6bi5zY3JvbGxUb3AoKX07YT8oZC53PWFbMF0uY2xpZW50V2lkdGgsZC5oPWFbMF0uY2xpZW50SGVpZ2h0KTooZC53PXMmJnIuaW5uZXJXaWR0aD9yLmlubmVyV2lkdGg6bi53aWR0aCgpLGQuaD1zJiZyLmlubmVySGVpZ2h0P3IuaW5uZXJIZWlnaHQ6bi5oZWlnaHQoKSk7cmV0dXJuIGR9LHVuYmluZEV2ZW50czpmdW5jdGlvbigpe2Iud3JhcCYmdChiLndyYXApJiZiLndyYXAudW5iaW5kKFwiLmZiXCIpO3AudW5iaW5kKFwiLmZiXCIpO24udW5iaW5kKFwiLmZiXCIpfSxiaW5kRXZlbnRzOmZ1bmN0aW9uKCl7dmFyIGE9Yi5jdXJyZW50LGQ7YSYmKG4uYmluZChcIm9yaWVudGF0aW9uY2hhbmdlLmZiXCIrKHM/XCJcIjpcIiByZXNpemUuZmJcIikrKGEuYXV0b0NlbnRlciYmIWEubG9ja2VkP1wiIHNjcm9sbC5mYlwiOlwiXCIpLGIudXBkYXRlKSwoZD1hLmtleXMpJiZwLmJpbmQoXCJrZXlkb3duLmZiXCIsZnVuY3Rpb24oZSl7dmFyIGM9ZS53aGljaHx8ZS5rZXlDb2RlLGs9ZS50YXJnZXR8fGUuc3JjRWxlbWVudDtcclxuaWYoMjc9PT1jJiZiLmNvbWluZylyZXR1cm4hMTshZS5jdHJsS2V5JiYoIWUuYWx0S2V5JiYhZS5zaGlmdEtleSYmIWUubWV0YUtleSYmKCFrfHwhay50eXBlJiYhZihrKS5pcyhcIltjb250ZW50ZWRpdGFibGVdXCIpKSkmJmYuZWFjaChkLGZ1bmN0aW9uKGQsayl7aWYoMTxhLmdyb3VwLmxlbmd0aCYma1tjXSE9PXYpcmV0dXJuIGJbZF0oa1tjXSksZS5wcmV2ZW50RGVmYXVsdCgpLCExO2lmKC0xPGYuaW5BcnJheShjLGspKXJldHVybiBiW2RdKCksZS5wcmV2ZW50RGVmYXVsdCgpLCExfSl9KSxmLmZuLm1vdXNld2hlZWwmJmEubW91c2VXaGVlbCYmYi53cmFwLmJpbmQoXCJtb3VzZXdoZWVsLmZiXCIsZnVuY3Rpb24oZCxjLGssZyl7Zm9yKHZhciBoPWYoZC50YXJnZXR8fG51bGwpLGo9ITE7aC5sZW5ndGgmJiFqJiYhaC5pcyhcIi5mYW5jeWJveC1za2luXCIpJiYhaC5pcyhcIi5mYW5jeWJveC13cmFwXCIpOylqPWhbMF0mJiEoaFswXS5zdHlsZS5vdmVyZmxvdyYmXCJoaWRkZW5cIj09PWhbMF0uc3R5bGUub3ZlcmZsb3cpJiZcclxuKGhbMF0uY2xpZW50V2lkdGgmJmhbMF0uc2Nyb2xsV2lkdGg+aFswXS5jbGllbnRXaWR0aHx8aFswXS5jbGllbnRIZWlnaHQmJmhbMF0uc2Nyb2xsSGVpZ2h0PmhbMF0uY2xpZW50SGVpZ2h0KSxoPWYoaCkucGFyZW50KCk7aWYoMCE9PWMmJiFqJiYxPGIuZ3JvdXAubGVuZ3RoJiYhYS5jYW5TaHJpbmspe2lmKDA8Z3x8MDxrKWIucHJldigwPGc/XCJkb3duXCI6XCJsZWZ0XCIpO2Vsc2UgaWYoMD5nfHwwPmspYi5uZXh0KDA+Zz9cInVwXCI6XCJyaWdodFwiKTtkLnByZXZlbnREZWZhdWx0KCl9fSkpfSx0cmlnZ2VyOmZ1bmN0aW9uKGEsZCl7dmFyIGUsYz1kfHxiLmNvbWluZ3x8Yi5jdXJyZW50O2lmKGMpe2YuaXNGdW5jdGlvbihjW2FdKSYmKGU9Y1thXS5hcHBseShjLEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywxKSkpO2lmKCExPT09ZSlyZXR1cm4hMTtjLmhlbHBlcnMmJmYuZWFjaChjLmhlbHBlcnMsZnVuY3Rpb24oZCxlKXtpZihlJiZiLmhlbHBlcnNbZF0mJmYuaXNGdW5jdGlvbihiLmhlbHBlcnNbZF1bYV0pKWIuaGVscGVyc1tkXVthXShmLmV4dGVuZCghMCxcclxue30sYi5oZWxwZXJzW2RdLmRlZmF1bHRzLGUpLGMpfSk7cC50cmlnZ2VyKGEpfX0saXNJbWFnZTpmdW5jdGlvbihhKXtyZXR1cm4gcShhKSYmYS5tYXRjaCgvKF5kYXRhOmltYWdlXFwvLiosKXwoXFwuKGpwKGV8Z3xlZyl8Z2lmfHBuZ3xibXB8d2VicHxzdmcpKChcXD98IykuKik/JCkvaSl9LGlzU1dGOmZ1bmN0aW9uKGEpe3JldHVybiBxKGEpJiZhLm1hdGNoKC9cXC4oc3dmKSgoXFw/fCMpLiopPyQvaSl9LF9zdGFydDpmdW5jdGlvbihhKXt2YXIgZD17fSxlLGM7YT1sKGEpO2U9Yi5ncm91cFthXXx8bnVsbDtpZighZSlyZXR1cm4hMTtkPWYuZXh0ZW5kKCEwLHt9LGIub3B0cyxlKTtlPWQubWFyZ2luO2M9ZC5wYWRkaW5nO1wibnVtYmVyXCI9PT1mLnR5cGUoZSkmJihkLm1hcmdpbj1bZSxlLGUsZV0pO1wibnVtYmVyXCI9PT1mLnR5cGUoYykmJihkLnBhZGRpbmc9W2MsYyxjLGNdKTtkLm1vZGFsJiZmLmV4dGVuZCghMCxkLHtjbG9zZUJ0bjohMSxjbG9zZUNsaWNrOiExLG5leHRDbGljazohMSxhcnJvd3M6ITEsXHJcbm1vdXNlV2hlZWw6ITEsa2V5czpudWxsLGhlbHBlcnM6e292ZXJsYXk6e2Nsb3NlQ2xpY2s6ITF9fX0pO2QuYXV0b1NpemUmJihkLmF1dG9XaWR0aD1kLmF1dG9IZWlnaHQ9ITApO1wiYXV0b1wiPT09ZC53aWR0aCYmKGQuYXV0b1dpZHRoPSEwKTtcImF1dG9cIj09PWQuaGVpZ2h0JiYoZC5hdXRvSGVpZ2h0PSEwKTtkLmdyb3VwPWIuZ3JvdXA7ZC5pbmRleD1hO2IuY29taW5nPWQ7aWYoITE9PT1iLnRyaWdnZXIoXCJiZWZvcmVMb2FkXCIpKWIuY29taW5nPW51bGw7ZWxzZXtjPWQudHlwZTtlPWQuaHJlZjtpZighYylyZXR1cm4gYi5jb21pbmc9bnVsbCxiLmN1cnJlbnQmJmIucm91dGVyJiZcImp1bXB0b1wiIT09Yi5yb3V0ZXI/KGIuY3VycmVudC5pbmRleD1hLGJbYi5yb3V0ZXJdKGIuZGlyZWN0aW9uKSk6ITE7Yi5pc0FjdGl2ZT0hMDtpZihcImltYWdlXCI9PT1jfHxcInN3ZlwiPT09YylkLmF1dG9IZWlnaHQ9ZC5hdXRvV2lkdGg9ITEsZC5zY3JvbGxpbmc9XCJ2aXNpYmxlXCI7XCJpbWFnZVwiPT09YyYmKGQuYXNwZWN0UmF0aW89XHJcbiEwKTtcImlmcmFtZVwiPT09YyYmcyYmKGQuc2Nyb2xsaW5nPVwic2Nyb2xsXCIpO2Qud3JhcD1mKGQudHBsLndyYXApLmFkZENsYXNzKFwiZmFuY3lib3gtXCIrKHM/XCJtb2JpbGVcIjpcImRlc2t0b3BcIikrXCIgZmFuY3lib3gtdHlwZS1cIitjK1wiIGZhbmN5Ym94LXRtcCBcIitkLndyYXBDU1MpLmFwcGVuZFRvKGQucGFyZW50fHxcImJvZHlcIik7Zi5leHRlbmQoZCx7c2tpbjpmKFwiLmZhbmN5Ym94LXNraW5cIixkLndyYXApLG91dGVyOmYoXCIuZmFuY3lib3gtb3V0ZXJcIixkLndyYXApLGlubmVyOmYoXCIuZmFuY3lib3gtaW5uZXJcIixkLndyYXApfSk7Zi5lYWNoKFtcIlRvcFwiLFwiUmlnaHRcIixcIkJvdHRvbVwiLFwiTGVmdFwiXSxmdW5jdGlvbihhLGIpe2Quc2tpbi5jc3MoXCJwYWRkaW5nXCIrYix3KGQucGFkZGluZ1thXSkpfSk7Yi50cmlnZ2VyKFwib25SZWFkeVwiKTtpZihcImlubGluZVwiPT09Y3x8XCJodG1sXCI9PT1jKXtpZighZC5jb250ZW50fHwhZC5jb250ZW50Lmxlbmd0aClyZXR1cm4gYi5fZXJyb3IoXCJjb250ZW50XCIpfWVsc2UgaWYoIWUpcmV0dXJuIGIuX2Vycm9yKFwiaHJlZlwiKTtcclxuXCJpbWFnZVwiPT09Yz9iLl9sb2FkSW1hZ2UoKTpcImFqYXhcIj09PWM/Yi5fbG9hZEFqYXgoKTpcImlmcmFtZVwiPT09Yz9iLl9sb2FkSWZyYW1lKCk6Yi5fYWZ0ZXJMb2FkKCl9fSxfZXJyb3I6ZnVuY3Rpb24oYSl7Zi5leHRlbmQoYi5jb21pbmcse3R5cGU6XCJodG1sXCIsYXV0b1dpZHRoOiEwLGF1dG9IZWlnaHQ6ITAsbWluV2lkdGg6MCxtaW5IZWlnaHQ6MCxzY3JvbGxpbmc6XCJub1wiLGhhc0Vycm9yOmEsY29udGVudDpiLmNvbWluZy50cGwuZXJyb3J9KTtiLl9hZnRlckxvYWQoKX0sX2xvYWRJbWFnZTpmdW5jdGlvbigpe3ZhciBhPWIuaW1nUHJlbG9hZD1uZXcgSW1hZ2U7YS5vbmxvYWQ9ZnVuY3Rpb24oKXt0aGlzLm9ubG9hZD10aGlzLm9uZXJyb3I9bnVsbDtiLmNvbWluZy53aWR0aD10aGlzLndpZHRoL2Iub3B0cy5waXhlbFJhdGlvO2IuY29taW5nLmhlaWdodD10aGlzLmhlaWdodC9iLm9wdHMucGl4ZWxSYXRpbztiLl9hZnRlckxvYWQoKX07YS5vbmVycm9yPWZ1bmN0aW9uKCl7dGhpcy5vbmxvYWQ9XHJcbnRoaXMub25lcnJvcj1udWxsO2IuX2Vycm9yKFwiaW1hZ2VcIil9O2Euc3JjPWIuY29taW5nLmhyZWY7ITAhPT1hLmNvbXBsZXRlJiZiLnNob3dMb2FkaW5nKCl9LF9sb2FkQWpheDpmdW5jdGlvbigpe3ZhciBhPWIuY29taW5nO2Iuc2hvd0xvYWRpbmcoKTtiLmFqYXhMb2FkPWYuYWpheChmLmV4dGVuZCh7fSxhLmFqYXgse3VybDphLmhyZWYsZXJyb3I6ZnVuY3Rpb24oYSxlKXtiLmNvbWluZyYmXCJhYm9ydFwiIT09ZT9iLl9lcnJvcihcImFqYXhcIixhKTpiLmhpZGVMb2FkaW5nKCl9LHN1Y2Nlc3M6ZnVuY3Rpb24oZCxlKXtcInN1Y2Nlc3NcIj09PWUmJihhLmNvbnRlbnQ9ZCxiLl9hZnRlckxvYWQoKSl9fSkpfSxfbG9hZElmcmFtZTpmdW5jdGlvbigpe3ZhciBhPWIuY29taW5nLGQ9ZihhLnRwbC5pZnJhbWUucmVwbGFjZSgvXFx7cm5kXFx9L2csKG5ldyBEYXRlKS5nZXRUaW1lKCkpKS5hdHRyKFwic2Nyb2xsaW5nXCIscz9cImF1dG9cIjphLmlmcmFtZS5zY3JvbGxpbmcpLmF0dHIoXCJzcmNcIixhLmhyZWYpO1xyXG5mKGEud3JhcCkuYmluZChcIm9uUmVzZXRcIixmdW5jdGlvbigpe3RyeXtmKHRoaXMpLmZpbmQoXCJpZnJhbWVcIikuaGlkZSgpLmF0dHIoXCJzcmNcIixcIi8vYWJvdXQ6YmxhbmtcIikuZW5kKCkuZW1wdHkoKX1jYXRjaChhKXt9fSk7YS5pZnJhbWUucHJlbG9hZCYmKGIuc2hvd0xvYWRpbmcoKSxkLm9uZShcImxvYWRcIixmdW5jdGlvbigpe2YodGhpcykuZGF0YShcInJlYWR5XCIsMSk7c3x8Zih0aGlzKS5iaW5kKFwibG9hZC5mYlwiLGIudXBkYXRlKTtmKHRoaXMpLnBhcmVudHMoXCIuZmFuY3lib3gtd3JhcFwiKS53aWR0aChcIjEwMCVcIikucmVtb3ZlQ2xhc3MoXCJmYW5jeWJveC10bXBcIikuc2hvdygpO2IuX2FmdGVyTG9hZCgpfSkpO2EuY29udGVudD1kLmFwcGVuZFRvKGEuaW5uZXIpO2EuaWZyYW1lLnByZWxvYWR8fGIuX2FmdGVyTG9hZCgpfSxfcHJlbG9hZEltYWdlczpmdW5jdGlvbigpe3ZhciBhPWIuZ3JvdXAsZD1iLmN1cnJlbnQsZT1hLmxlbmd0aCxjPWQucHJlbG9hZD9NYXRoLm1pbihkLnByZWxvYWQsXHJcbmUtMSk6MCxmLGc7Zm9yKGc9MTtnPD1jO2crPTEpZj1hWyhkLmluZGV4K2cpJWVdLFwiaW1hZ2VcIj09PWYudHlwZSYmZi5ocmVmJiYoKG5ldyBJbWFnZSkuc3JjPWYuaHJlZil9LF9hZnRlckxvYWQ6ZnVuY3Rpb24oKXt2YXIgYT1iLmNvbWluZyxkPWIuY3VycmVudCxlLGMsayxnLGg7Yi5oaWRlTG9hZGluZygpO2lmKGEmJiExIT09Yi5pc0FjdGl2ZSlpZighMT09PWIudHJpZ2dlcihcImFmdGVyTG9hZFwiLGEsZCkpYS53cmFwLnN0b3AoITApLnRyaWdnZXIoXCJvblJlc2V0XCIpLnJlbW92ZSgpLGIuY29taW5nPW51bGw7ZWxzZXtkJiYoYi50cmlnZ2VyKFwiYmVmb3JlQ2hhbmdlXCIsZCksZC53cmFwLnN0b3AoITApLnJlbW92ZUNsYXNzKFwiZmFuY3lib3gtb3BlbmVkXCIpLmZpbmQoXCIuZmFuY3lib3gtaXRlbSwgLmZhbmN5Ym94LW5hdlwiKS5yZW1vdmUoKSk7Yi51bmJpbmRFdmVudHMoKTtlPWEuY29udGVudDtjPWEudHlwZTtrPWEuc2Nyb2xsaW5nO2YuZXh0ZW5kKGIse3dyYXA6YS53cmFwLHNraW46YS5za2luLFxyXG5vdXRlcjphLm91dGVyLGlubmVyOmEuaW5uZXIsY3VycmVudDphLHByZXZpb3VzOmR9KTtnPWEuaHJlZjtzd2l0Y2goYyl7Y2FzZSBcImlubGluZVwiOmNhc2UgXCJhamF4XCI6Y2FzZSBcImh0bWxcIjphLnNlbGVjdG9yP2U9ZihcIjxkaXY+XCIpLmh0bWwoZSkuZmluZChhLnNlbGVjdG9yKTp0KGUpJiYoZS5kYXRhKFwiZmFuY3lib3gtcGxhY2Vob2xkZXJcIil8fGUuZGF0YShcImZhbmN5Ym94LXBsYWNlaG9sZGVyXCIsZignPGRpdiBjbGFzcz1cImZhbmN5Ym94LXBsYWNlaG9sZGVyXCI+PC9kaXY+JykuaW5zZXJ0QWZ0ZXIoZSkuaGlkZSgpKSxlPWUuc2hvdygpLmRldGFjaCgpLGEud3JhcC5iaW5kKFwib25SZXNldFwiLGZ1bmN0aW9uKCl7Zih0aGlzKS5maW5kKGUpLmxlbmd0aCYmZS5oaWRlKCkucmVwbGFjZUFsbChlLmRhdGEoXCJmYW5jeWJveC1wbGFjZWhvbGRlclwiKSkuZGF0YShcImZhbmN5Ym94LXBsYWNlaG9sZGVyXCIsITEpfSkpO2JyZWFrO2Nhc2UgXCJpbWFnZVwiOmU9YS50cGwuaW1hZ2UucmVwbGFjZShcIntocmVmfVwiLFxyXG5nKTticmVhaztjYXNlIFwic3dmXCI6ZT0nPG9iamVjdCBpZD1cImZhbmN5Ym94LXN3ZlwiIGNsYXNzaWQ9XCJjbHNpZDpEMjdDREI2RS1BRTZELTExY2YtOTZCOC00NDQ1NTM1NDAwMDBcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCI+PHBhcmFtIG5hbWU9XCJtb3ZpZVwiIHZhbHVlPVwiJytnKydcIj48L3BhcmFtPicsaD1cIlwiLGYuZWFjaChhLnN3ZixmdW5jdGlvbihhLGIpe2UrPSc8cGFyYW0gbmFtZT1cIicrYSsnXCIgdmFsdWU9XCInK2IrJ1wiPjwvcGFyYW0+JztoKz1cIiBcIithKyc9XCInK2IrJ1wiJ30pLGUrPSc8ZW1iZWQgc3JjPVwiJytnKydcIiB0eXBlPVwiYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2hcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCInK2grXCI+PC9lbWJlZD48L29iamVjdD5cIn0oIXQoZSl8fCFlLnBhcmVudCgpLmlzKGEuaW5uZXIpKSYmYS5pbm5lci5hcHBlbmQoZSk7Yi50cmlnZ2VyKFwiYmVmb3JlU2hvd1wiKTthLmlubmVyLmNzcyhcIm92ZXJmbG93XCIsXCJ5ZXNcIj09PWs/XCJzY3JvbGxcIjpcclxuXCJub1wiPT09az9cImhpZGRlblwiOmspO2IuX3NldERpbWVuc2lvbigpO2IucmVwb3NpdGlvbigpO2IuaXNPcGVuPSExO2IuY29taW5nPW51bGw7Yi5iaW5kRXZlbnRzKCk7aWYoYi5pc09wZW5lZCl7aWYoZC5wcmV2TWV0aG9kKWIudHJhbnNpdGlvbnNbZC5wcmV2TWV0aG9kXSgpfWVsc2UgZihcIi5mYW5jeWJveC13cmFwXCIpLm5vdChhLndyYXApLnN0b3AoITApLnRyaWdnZXIoXCJvblJlc2V0XCIpLnJlbW92ZSgpO2IudHJhbnNpdGlvbnNbYi5pc09wZW5lZD9hLm5leHRNZXRob2Q6YS5vcGVuTWV0aG9kXSgpO2IuX3ByZWxvYWRJbWFnZXMoKX19LF9zZXREaW1lbnNpb246ZnVuY3Rpb24oKXt2YXIgYT1iLmdldFZpZXdwb3J0KCksZD0wLGU9ITEsYz0hMSxlPWIud3JhcCxrPWIuc2tpbixnPWIuaW5uZXIsaD1iLmN1cnJlbnQsYz1oLndpZHRoLGo9aC5oZWlnaHQsbT1oLm1pbldpZHRoLHU9aC5taW5IZWlnaHQsbj1oLm1heFdpZHRoLHA9aC5tYXhIZWlnaHQscz1oLnNjcm9sbGluZyxxPWguc2Nyb2xsT3V0c2lkZT9cclxuaC5zY3JvbGxiYXJXaWR0aDowLHg9aC5tYXJnaW4seT1sKHhbMV0reFszXSkscj1sKHhbMF0reFsyXSksdix6LHQsQyxBLEYsQixELEg7ZS5hZGQoaykuYWRkKGcpLndpZHRoKFwiYXV0b1wiKS5oZWlnaHQoXCJhdXRvXCIpLnJlbW92ZUNsYXNzKFwiZmFuY3lib3gtdG1wXCIpO3g9bChrLm91dGVyV2lkdGgoITApLWsud2lkdGgoKSk7dj1sKGsub3V0ZXJIZWlnaHQoITApLWsuaGVpZ2h0KCkpO3o9eSt4O3Q9cit2O0M9RShjKT8oYS53LXopKmwoYykvMTAwOmM7QT1FKGopPyhhLmgtdCkqbChqKS8xMDA6ajtpZihcImlmcmFtZVwiPT09aC50eXBlKXtpZihIPWguY29udGVudCxoLmF1dG9IZWlnaHQmJjE9PT1ILmRhdGEoXCJyZWFkeVwiKSl0cnl7SFswXS5jb250ZW50V2luZG93LmRvY3VtZW50LmxvY2F0aW9uJiYoZy53aWR0aChDKS5oZWlnaHQoOTk5OSksRj1ILmNvbnRlbnRzKCkuZmluZChcImJvZHlcIikscSYmRi5jc3MoXCJvdmVyZmxvdy14XCIsXCJoaWRkZW5cIiksQT1GLm91dGVySGVpZ2h0KCEwKSl9Y2F0Y2goRyl7fX1lbHNlIGlmKGguYXV0b1dpZHRofHxcclxuaC5hdXRvSGVpZ2h0KWcuYWRkQ2xhc3MoXCJmYW5jeWJveC10bXBcIiksaC5hdXRvV2lkdGh8fGcud2lkdGgoQyksaC5hdXRvSGVpZ2h0fHxnLmhlaWdodChBKSxoLmF1dG9XaWR0aCYmKEM9Zy53aWR0aCgpKSxoLmF1dG9IZWlnaHQmJihBPWcuaGVpZ2h0KCkpLGcucmVtb3ZlQ2xhc3MoXCJmYW5jeWJveC10bXBcIik7Yz1sKEMpO2o9bChBKTtEPUMvQTttPWwoRShtKT9sKG0sXCJ3XCIpLXo6bSk7bj1sKEUobik/bChuLFwid1wiKS16Om4pO3U9bChFKHUpP2wodSxcImhcIiktdDp1KTtwPWwoRShwKT9sKHAsXCJoXCIpLXQ6cCk7Rj1uO0I9cDtoLmZpdFRvVmlldyYmKG49TWF0aC5taW4oYS53LXosbikscD1NYXRoLm1pbihhLmgtdCxwKSk7ej1hLncteTtyPWEuaC1yO2guYXNwZWN0UmF0aW8/KGM+biYmKGM9bixqPWwoYy9EKSksaj5wJiYoaj1wLGM9bChqKkQpKSxjPG0mJihjPW0saj1sKGMvRCkpLGo8dSYmKGo9dSxjPWwoaipEKSkpOihjPU1hdGgubWF4KG0sTWF0aC5taW4oYyxuKSksaC5hdXRvSGVpZ2h0JiZcclxuXCJpZnJhbWVcIiE9PWgudHlwZSYmKGcud2lkdGgoYyksaj1nLmhlaWdodCgpKSxqPU1hdGgubWF4KHUsTWF0aC5taW4oaixwKSkpO2lmKGguZml0VG9WaWV3KWlmKGcud2lkdGgoYykuaGVpZ2h0KGopLGUud2lkdGgoYyt4KSxhPWUud2lkdGgoKSx5PWUuaGVpZ2h0KCksaC5hc3BlY3RSYXRpbylmb3IoOyhhPnp8fHk+cikmJihjPm0mJmo+dSkmJiEoMTk8ZCsrKTspaj1NYXRoLm1heCh1LE1hdGgubWluKHAsai0xMCkpLGM9bChqKkQpLGM8bSYmKGM9bSxqPWwoYy9EKSksYz5uJiYoYz1uLGo9bChjL0QpKSxnLndpZHRoKGMpLmhlaWdodChqKSxlLndpZHRoKGMreCksYT1lLndpZHRoKCkseT1lLmhlaWdodCgpO2Vsc2UgYz1NYXRoLm1heChtLE1hdGgubWluKGMsYy0oYS16KSkpLGo9TWF0aC5tYXgodSxNYXRoLm1pbihqLGotKHktcikpKTtxJiYoXCJhdXRvXCI9PT1zJiZqPEEmJmMreCtxPHopJiYoYys9cSk7Zy53aWR0aChjKS5oZWlnaHQoaik7ZS53aWR0aChjK3gpO2E9ZS53aWR0aCgpO1xyXG55PWUuaGVpZ2h0KCk7ZT0oYT56fHx5PnIpJiZjPm0mJmo+dTtjPWguYXNwZWN0UmF0aW8/YzxGJiZqPEImJmM8QyYmajxBOihjPEZ8fGo8QikmJihjPEN8fGo8QSk7Zi5leHRlbmQoaCx7ZGltOnt3aWR0aDp3KGEpLGhlaWdodDp3KHkpfSxvcmlnV2lkdGg6QyxvcmlnSGVpZ2h0OkEsY2FuU2hyaW5rOmUsY2FuRXhwYW5kOmMsd1BhZGRpbmc6eCxoUGFkZGluZzp2LHdyYXBTcGFjZTp5LWsub3V0ZXJIZWlnaHQoITApLHNraW5TcGFjZTprLmhlaWdodCgpLWp9KTshSCYmKGguYXV0b0hlaWdodCYmaj51JiZqPHAmJiFjKSYmZy5oZWlnaHQoXCJhdXRvXCIpfSxfZ2V0UG9zaXRpb246ZnVuY3Rpb24oYSl7dmFyIGQ9Yi5jdXJyZW50LGU9Yi5nZXRWaWV3cG9ydCgpLGM9ZC5tYXJnaW4sZj1iLndyYXAud2lkdGgoKStjWzFdK2NbM10sZz1iLndyYXAuaGVpZ2h0KCkrY1swXStjWzJdLGM9e3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6Y1swXSxsZWZ0OmNbM119O2QuYXV0b0NlbnRlciYmZC5maXhlZCYmXHJcbiFhJiZnPD1lLmgmJmY8PWUudz9jLnBvc2l0aW9uPVwiZml4ZWRcIjpkLmxvY2tlZHx8KGMudG9wKz1lLnksYy5sZWZ0Kz1lLngpO2MudG9wPXcoTWF0aC5tYXgoYy50b3AsYy50b3ArKGUuaC1nKSpkLnRvcFJhdGlvKSk7Yy5sZWZ0PXcoTWF0aC5tYXgoYy5sZWZ0LGMubGVmdCsoZS53LWYpKmQubGVmdFJhdGlvKSk7cmV0dXJuIGN9LF9hZnRlclpvb21JbjpmdW5jdGlvbigpe3ZhciBhPWIuY3VycmVudDthJiYoYi5pc09wZW49Yi5pc09wZW5lZD0hMCxiLndyYXAuY3NzKFwib3ZlcmZsb3dcIixcInZpc2libGVcIikuYWRkQ2xhc3MoXCJmYW5jeWJveC1vcGVuZWRcIiksYi51cGRhdGUoKSwoYS5jbG9zZUNsaWNrfHxhLm5leHRDbGljayYmMTxiLmdyb3VwLmxlbmd0aCkmJmIuaW5uZXIuY3NzKFwiY3Vyc29yXCIsXCJwb2ludGVyXCIpLmJpbmQoXCJjbGljay5mYlwiLGZ1bmN0aW9uKGQpeyFmKGQudGFyZ2V0KS5pcyhcImFcIikmJiFmKGQudGFyZ2V0KS5wYXJlbnQoKS5pcyhcImFcIikmJihkLnByZXZlbnREZWZhdWx0KCksXHJcbmJbYS5jbG9zZUNsaWNrP1wiY2xvc2VcIjpcIm5leHRcIl0oKSl9KSxhLmNsb3NlQnRuJiZmKGEudHBsLmNsb3NlQnRuKS5hcHBlbmRUbyhiLnNraW4pLmJpbmQoXCJjbGljay5mYlwiLGZ1bmN0aW9uKGEpe2EucHJldmVudERlZmF1bHQoKTtiLmNsb3NlKCl9KSxhLmFycm93cyYmMTxiLmdyb3VwLmxlbmd0aCYmKChhLmxvb3B8fDA8YS5pbmRleCkmJmYoYS50cGwucHJldikuYXBwZW5kVG8oYi5vdXRlcikuYmluZChcImNsaWNrLmZiXCIsYi5wcmV2KSwoYS5sb29wfHxhLmluZGV4PGIuZ3JvdXAubGVuZ3RoLTEpJiZmKGEudHBsLm5leHQpLmFwcGVuZFRvKGIub3V0ZXIpLmJpbmQoXCJjbGljay5mYlwiLGIubmV4dCkpLGIudHJpZ2dlcihcImFmdGVyU2hvd1wiKSwhYS5sb29wJiZhLmluZGV4PT09YS5ncm91cC5sZW5ndGgtMT9iLnBsYXkoITEpOmIub3B0cy5hdXRvUGxheSYmIWIucGxheWVyLmlzQWN0aXZlJiYoYi5vcHRzLmF1dG9QbGF5PSExLGIucGxheSgpKSl9LF9hZnRlclpvb21PdXQ6ZnVuY3Rpb24oYSl7YT1cclxuYXx8Yi5jdXJyZW50O2YoXCIuZmFuY3lib3gtd3JhcFwiKS50cmlnZ2VyKFwib25SZXNldFwiKS5yZW1vdmUoKTtmLmV4dGVuZChiLHtncm91cDp7fSxvcHRzOnt9LHJvdXRlcjohMSxjdXJyZW50Om51bGwsaXNBY3RpdmU6ITEsaXNPcGVuZWQ6ITEsaXNPcGVuOiExLGlzQ2xvc2luZzohMSx3cmFwOm51bGwsc2tpbjpudWxsLG91dGVyOm51bGwsaW5uZXI6bnVsbH0pO2IudHJpZ2dlcihcImFmdGVyQ2xvc2VcIixhKX19KTtiLnRyYW5zaXRpb25zPXtnZXRPcmlnUG9zaXRpb246ZnVuY3Rpb24oKXt2YXIgYT1iLmN1cnJlbnQsZD1hLmVsZW1lbnQsZT1hLm9yaWcsYz17fSxmPTUwLGc9NTAsaD1hLmhQYWRkaW5nLGo9YS53UGFkZGluZyxtPWIuZ2V0Vmlld3BvcnQoKTshZSYmKGEuaXNEb20mJmQuaXMoXCI6dmlzaWJsZVwiKSkmJihlPWQuZmluZChcImltZzpmaXJzdFwiKSxlLmxlbmd0aHx8KGU9ZCkpO3QoZSk/KGM9ZS5vZmZzZXQoKSxlLmlzKFwiaW1nXCIpJiYoZj1lLm91dGVyV2lkdGgoKSxnPWUub3V0ZXJIZWlnaHQoKSkpOlxyXG4oYy50b3A9bS55KyhtLmgtZykqYS50b3BSYXRpbyxjLmxlZnQ9bS54KyhtLnctZikqYS5sZWZ0UmF0aW8pO2lmKFwiZml4ZWRcIj09PWIud3JhcC5jc3MoXCJwb3NpdGlvblwiKXx8YS5sb2NrZWQpYy50b3AtPW0ueSxjLmxlZnQtPW0ueDtyZXR1cm4gYz17dG9wOncoYy50b3AtaCphLnRvcFJhdGlvKSxsZWZ0OncoYy5sZWZ0LWoqYS5sZWZ0UmF0aW8pLHdpZHRoOncoZitqKSxoZWlnaHQ6dyhnK2gpfX0sc3RlcDpmdW5jdGlvbihhLGQpe3ZhciBlLGMsZj1kLnByb3A7Yz1iLmN1cnJlbnQ7dmFyIGc9Yy53cmFwU3BhY2UsaD1jLnNraW5TcGFjZTtpZihcIndpZHRoXCI9PT1mfHxcImhlaWdodFwiPT09ZillPWQuZW5kPT09ZC5zdGFydD8xOihhLWQuc3RhcnQpLyhkLmVuZC1kLnN0YXJ0KSxiLmlzQ2xvc2luZyYmKGU9MS1lKSxjPVwid2lkdGhcIj09PWY/Yy53UGFkZGluZzpjLmhQYWRkaW5nLGM9YS1jLGIuc2tpbltmXShsKFwid2lkdGhcIj09PWY/YzpjLWcqZSkpLGIuaW5uZXJbZl0obChcIndpZHRoXCI9PT1cclxuZj9jOmMtZyplLWgqZSkpfSx6b29tSW46ZnVuY3Rpb24oKXt2YXIgYT1iLmN1cnJlbnQsZD1hLnBvcyxlPWEub3BlbkVmZmVjdCxjPVwiZWxhc3RpY1wiPT09ZSxrPWYuZXh0ZW5kKHtvcGFjaXR5OjF9LGQpO2RlbGV0ZSBrLnBvc2l0aW9uO2M/KGQ9dGhpcy5nZXRPcmlnUG9zaXRpb24oKSxhLm9wZW5PcGFjaXR5JiYoZC5vcGFjaXR5PTAuMSkpOlwiZmFkZVwiPT09ZSYmKGQub3BhY2l0eT0wLjEpO2Iud3JhcC5jc3MoZCkuYW5pbWF0ZShrLHtkdXJhdGlvbjpcIm5vbmVcIj09PWU/MDphLm9wZW5TcGVlZCxlYXNpbmc6YS5vcGVuRWFzaW5nLHN0ZXA6Yz90aGlzLnN0ZXA6bnVsbCxjb21wbGV0ZTpiLl9hZnRlclpvb21Jbn0pfSx6b29tT3V0OmZ1bmN0aW9uKCl7dmFyIGE9Yi5jdXJyZW50LGQ9YS5jbG9zZUVmZmVjdCxlPVwiZWxhc3RpY1wiPT09ZCxjPXtvcGFjaXR5OjAuMX07ZSYmKGM9dGhpcy5nZXRPcmlnUG9zaXRpb24oKSxhLmNsb3NlT3BhY2l0eSYmKGMub3BhY2l0eT0wLjEpKTtiLndyYXAuYW5pbWF0ZShjLFxyXG57ZHVyYXRpb246XCJub25lXCI9PT1kPzA6YS5jbG9zZVNwZWVkLGVhc2luZzphLmNsb3NlRWFzaW5nLHN0ZXA6ZT90aGlzLnN0ZXA6bnVsbCxjb21wbGV0ZTpiLl9hZnRlclpvb21PdXR9KX0sY2hhbmdlSW46ZnVuY3Rpb24oKXt2YXIgYT1iLmN1cnJlbnQsZD1hLm5leHRFZmZlY3QsZT1hLnBvcyxjPXtvcGFjaXR5OjF9LGY9Yi5kaXJlY3Rpb24sZztlLm9wYWNpdHk9MC4xO1wiZWxhc3RpY1wiPT09ZCYmKGc9XCJkb3duXCI9PT1mfHxcInVwXCI9PT1mP1widG9wXCI6XCJsZWZ0XCIsXCJkb3duXCI9PT1mfHxcInJpZ2h0XCI9PT1mPyhlW2ddPXcobChlW2ddKS0yMDApLGNbZ109XCIrPTIwMHB4XCIpOihlW2ddPXcobChlW2ddKSsyMDApLGNbZ109XCItPTIwMHB4XCIpKTtcIm5vbmVcIj09PWQ/Yi5fYWZ0ZXJab29tSW4oKTpiLndyYXAuY3NzKGUpLmFuaW1hdGUoYyx7ZHVyYXRpb246YS5uZXh0U3BlZWQsZWFzaW5nOmEubmV4dEVhc2luZyxjb21wbGV0ZTpiLl9hZnRlclpvb21Jbn0pfSxjaGFuZ2VPdXQ6ZnVuY3Rpb24oKXt2YXIgYT1cclxuYi5wcmV2aW91cyxkPWEucHJldkVmZmVjdCxlPXtvcGFjaXR5OjAuMX0sYz1iLmRpcmVjdGlvbjtcImVsYXN0aWNcIj09PWQmJihlW1wiZG93blwiPT09Y3x8XCJ1cFwiPT09Yz9cInRvcFwiOlwibGVmdFwiXT0oXCJ1cFwiPT09Y3x8XCJsZWZ0XCI9PT1jP1wiLVwiOlwiK1wiKStcIj0yMDBweFwiKTthLndyYXAuYW5pbWF0ZShlLHtkdXJhdGlvbjpcIm5vbmVcIj09PWQ/MDphLnByZXZTcGVlZCxlYXNpbmc6YS5wcmV2RWFzaW5nLGNvbXBsZXRlOmZ1bmN0aW9uKCl7Zih0aGlzKS50cmlnZ2VyKFwib25SZXNldFwiKS5yZW1vdmUoKX19KX19O2IuaGVscGVycy5vdmVybGF5PXtkZWZhdWx0czp7Y2xvc2VDbGljazohMCxzcGVlZE91dDoyMDAsc2hvd0Vhcmx5OiEwLGNzczp7fSxsb2NrZWQ6IXMsZml4ZWQ6ITB9LG92ZXJsYXk6bnVsbCxmaXhlZDohMSxlbDpmKFwiaHRtbFwiKSxjcmVhdGU6ZnVuY3Rpb24oYSl7YT1mLmV4dGVuZCh7fSx0aGlzLmRlZmF1bHRzLGEpO3RoaXMub3ZlcmxheSYmdGhpcy5jbG9zZSgpO3RoaXMub3ZlcmxheT1cclxuZignPGRpdiBjbGFzcz1cImZhbmN5Ym94LW92ZXJsYXlcIj48L2Rpdj4nKS5hcHBlbmRUbyhiLmNvbWluZz9iLmNvbWluZy5wYXJlbnQ6YS5wYXJlbnQpO3RoaXMuZml4ZWQ9ITE7YS5maXhlZCYmYi5kZWZhdWx0cy5maXhlZCYmKHRoaXMub3ZlcmxheS5hZGRDbGFzcyhcImZhbmN5Ym94LW92ZXJsYXktZml4ZWRcIiksdGhpcy5maXhlZD0hMCl9LG9wZW46ZnVuY3Rpb24oYSl7dmFyIGQ9dGhpczthPWYuZXh0ZW5kKHt9LHRoaXMuZGVmYXVsdHMsYSk7dGhpcy5vdmVybGF5P3RoaXMub3ZlcmxheS51bmJpbmQoXCIub3ZlcmxheVwiKS53aWR0aChcImF1dG9cIikuaGVpZ2h0KFwiYXV0b1wiKTp0aGlzLmNyZWF0ZShhKTt0aGlzLmZpeGVkfHwobi5iaW5kKFwicmVzaXplLm92ZXJsYXlcIixmLnByb3h5KHRoaXMudXBkYXRlLHRoaXMpKSx0aGlzLnVwZGF0ZSgpKTthLmNsb3NlQ2xpY2smJnRoaXMub3ZlcmxheS5iaW5kKFwiY2xpY2sub3ZlcmxheVwiLGZ1bmN0aW9uKGEpe2lmKGYoYS50YXJnZXQpLmhhc0NsYXNzKFwiZmFuY3lib3gtb3ZlcmxheVwiKSlyZXR1cm4gYi5pc0FjdGl2ZT9cclxuYi5jbG9zZSgpOmQuY2xvc2UoKSwhMX0pO3RoaXMub3ZlcmxheS5jc3MoYS5jc3MpLnNob3coKX0sY2xvc2U6ZnVuY3Rpb24oKXt2YXIgYSxiO24udW5iaW5kKFwicmVzaXplLm92ZXJsYXlcIik7dGhpcy5lbC5oYXNDbGFzcyhcImZhbmN5Ym94LWxvY2tcIikmJihmKFwiLmZhbmN5Ym94LW1hcmdpblwiKS5yZW1vdmVDbGFzcyhcImZhbmN5Ym94LW1hcmdpblwiKSxhPW4uc2Nyb2xsVG9wKCksYj1uLnNjcm9sbExlZnQoKSx0aGlzLmVsLnJlbW92ZUNsYXNzKFwiZmFuY3lib3gtbG9ja1wiKSxuLnNjcm9sbFRvcChhKS5zY3JvbGxMZWZ0KGIpKTtmKFwiLmZhbmN5Ym94LW92ZXJsYXlcIikucmVtb3ZlKCkuaGlkZSgpO2YuZXh0ZW5kKHRoaXMse292ZXJsYXk6bnVsbCxmaXhlZDohMX0pfSx1cGRhdGU6ZnVuY3Rpb24oKXt2YXIgYT1cIjEwMCVcIixiO3RoaXMub3ZlcmxheS53aWR0aChhKS5oZWlnaHQoXCIxMDAlXCIpO0k/KGI9TWF0aC5tYXgoRy5kb2N1bWVudEVsZW1lbnQub2Zmc2V0V2lkdGgsRy5ib2R5Lm9mZnNldFdpZHRoKSxcclxucC53aWR0aCgpPmImJihhPXAud2lkdGgoKSkpOnAud2lkdGgoKT5uLndpZHRoKCkmJihhPXAud2lkdGgoKSk7dGhpcy5vdmVybGF5LndpZHRoKGEpLmhlaWdodChwLmhlaWdodCgpKX0sb25SZWFkeTpmdW5jdGlvbihhLGIpe3ZhciBlPXRoaXMub3ZlcmxheTtmKFwiLmZhbmN5Ym94LW92ZXJsYXlcIikuc3RvcCghMCwhMCk7ZXx8dGhpcy5jcmVhdGUoYSk7YS5sb2NrZWQmJih0aGlzLmZpeGVkJiZiLmZpeGVkKSYmKGV8fCh0aGlzLm1hcmdpbj1wLmhlaWdodCgpPm4uaGVpZ2h0KCk/ZihcImh0bWxcIikuY3NzKFwibWFyZ2luLXJpZ2h0XCIpLnJlcGxhY2UoXCJweFwiLFwiXCIpOiExKSxiLmxvY2tlZD10aGlzLm92ZXJsYXkuYXBwZW5kKGIud3JhcCksYi5maXhlZD0hMSk7ITA9PT1hLnNob3dFYXJseSYmdGhpcy5iZWZvcmVTaG93LmFwcGx5KHRoaXMsYXJndW1lbnRzKX0sYmVmb3JlU2hvdzpmdW5jdGlvbihhLGIpe3ZhciBlLGM7Yi5sb2NrZWQmJighMSE9PXRoaXMubWFyZ2luJiYoZihcIipcIikuZmlsdGVyKGZ1bmN0aW9uKCl7cmV0dXJuXCJmaXhlZFwiPT09XHJcbmYodGhpcykuY3NzKFwicG9zaXRpb25cIikmJiFmKHRoaXMpLmhhc0NsYXNzKFwiZmFuY3lib3gtb3ZlcmxheVwiKSYmIWYodGhpcykuaGFzQ2xhc3MoXCJmYW5jeWJveC13cmFwXCIpfSkuYWRkQ2xhc3MoXCJmYW5jeWJveC1tYXJnaW5cIiksdGhpcy5lbC5hZGRDbGFzcyhcImZhbmN5Ym94LW1hcmdpblwiKSksZT1uLnNjcm9sbFRvcCgpLGM9bi5zY3JvbGxMZWZ0KCksdGhpcy5lbC5hZGRDbGFzcyhcImZhbmN5Ym94LWxvY2tcIiksbi5zY3JvbGxUb3AoZSkuc2Nyb2xsTGVmdChjKSk7dGhpcy5vcGVuKGEpfSxvblVwZGF0ZTpmdW5jdGlvbigpe3RoaXMuZml4ZWR8fHRoaXMudXBkYXRlKCl9LGFmdGVyQ2xvc2U6ZnVuY3Rpb24oYSl7dGhpcy5vdmVybGF5JiYhYi5jb21pbmcmJnRoaXMub3ZlcmxheS5mYWRlT3V0KGEuc3BlZWRPdXQsZi5wcm94eSh0aGlzLmNsb3NlLHRoaXMpKX19O2IuaGVscGVycy50aXRsZT17ZGVmYXVsdHM6e3R5cGU6XCJmbG9hdFwiLHBvc2l0aW9uOlwiYm90dG9tXCJ9LGJlZm9yZVNob3c6ZnVuY3Rpb24oYSl7dmFyIGQ9XHJcbmIuY3VycmVudCxlPWQudGl0bGUsYz1hLnR5cGU7Zi5pc0Z1bmN0aW9uKGUpJiYoZT1lLmNhbGwoZC5lbGVtZW50LGQpKTtpZihxKGUpJiZcIlwiIT09Zi50cmltKGUpKXtkPWYoJzxkaXYgY2xhc3M9XCJmYW5jeWJveC10aXRsZSBmYW5jeWJveC10aXRsZS0nK2MrJy13cmFwXCI+JytlK1wiPC9kaXY+XCIpO3N3aXRjaChjKXtjYXNlIFwiaW5zaWRlXCI6Yz1iLnNraW47YnJlYWs7Y2FzZSBcIm91dHNpZGVcIjpjPWIud3JhcDticmVhaztjYXNlIFwib3ZlclwiOmM9Yi5pbm5lcjticmVhaztkZWZhdWx0OmM9Yi5za2luLGQuYXBwZW5kVG8oXCJib2R5XCIpLEkmJmQud2lkdGgoZC53aWR0aCgpKSxkLndyYXBJbm5lcignPHNwYW4gY2xhc3M9XCJjaGlsZFwiPjwvc3Bhbj4nKSxiLmN1cnJlbnQubWFyZ2luWzJdKz1NYXRoLmFicyhsKGQuY3NzKFwibWFyZ2luLWJvdHRvbVwiKSkpfWRbXCJ0b3BcIj09PWEucG9zaXRpb24/XCJwcmVwZW5kVG9cIjpcImFwcGVuZFRvXCJdKGMpfX19O2YuZm4uZmFuY3lib3g9ZnVuY3Rpb24oYSl7dmFyIGQsXHJcbmU9Zih0aGlzKSxjPXRoaXMuc2VsZWN0b3J8fFwiXCIsaz1mdW5jdGlvbihnKXt2YXIgaD1mKHRoaXMpLmJsdXIoKSxqPWQsayxsOyFnLmN0cmxLZXkmJighZy5hbHRLZXkmJiFnLnNoaWZ0S2V5JiYhZy5tZXRhS2V5KSYmIWguaXMoXCIuZmFuY3lib3gtd3JhcFwiKSYmKGs9YS5ncm91cEF0dHJ8fFwiZGF0YS1mYW5jeWJveC1ncm91cFwiLGw9aC5hdHRyKGspLGx8fChrPVwicmVsXCIsbD1oLmdldCgwKVtrXSksbCYmKFwiXCIhPT1sJiZcIm5vZm9sbG93XCIhPT1sKSYmKGg9Yy5sZW5ndGg/ZihjKTplLGg9aC5maWx0ZXIoXCJbXCIraysnPVwiJytsKydcIl0nKSxqPWguaW5kZXgodGhpcykpLGEuaW5kZXg9aiwhMSE9PWIub3BlbihoLGEpJiZnLnByZXZlbnREZWZhdWx0KCkpfTthPWF8fHt9O2Q9YS5pbmRleHx8MDshY3x8ITE9PT1hLmxpdmU/ZS51bmJpbmQoXCJjbGljay5mYi1zdGFydFwiKS5iaW5kKFwiY2xpY2suZmItc3RhcnRcIixrKTpwLnVuZGVsZWdhdGUoYyxcImNsaWNrLmZiLXN0YXJ0XCIpLmRlbGVnYXRlKGMrXHJcblwiOm5vdCgnLmZhbmN5Ym94LWl0ZW0sIC5mYW5jeWJveC1uYXYnKVwiLFwiY2xpY2suZmItc3RhcnRcIixrKTt0aGlzLmZpbHRlcihcIltkYXRhLWZhbmN5Ym94LXN0YXJ0PTFdXCIpLnRyaWdnZXIoXCJjbGlja1wiKTtyZXR1cm4gdGhpc307cC5yZWFkeShmdW5jdGlvbigpe3ZhciBhLGQ7Zi5zY3JvbGxiYXJXaWR0aD09PXYmJihmLnNjcm9sbGJhcldpZHRoPWZ1bmN0aW9uKCl7dmFyIGE9ZignPGRpdiBzdHlsZT1cIndpZHRoOjUwcHg7aGVpZ2h0OjUwcHg7b3ZlcmZsb3c6YXV0b1wiPjxkaXYvPjwvZGl2PicpLmFwcGVuZFRvKFwiYm9keVwiKSxiPWEuY2hpbGRyZW4oKSxiPWIuaW5uZXJXaWR0aCgpLWIuaGVpZ2h0KDk5KS5pbm5lcldpZHRoKCk7YS5yZW1vdmUoKTtyZXR1cm4gYn0pO2lmKGYuc3VwcG9ydC5maXhlZFBvc2l0aW9uPT09dil7YT1mLnN1cHBvcnQ7ZD1mKCc8ZGl2IHN0eWxlPVwicG9zaXRpb246Zml4ZWQ7dG9wOjIwcHg7XCI+PC9kaXY+JykuYXBwZW5kVG8oXCJib2R5XCIpO3ZhciBlPTIwPT09XHJcbmRbMF0ub2Zmc2V0VG9wfHwxNT09PWRbMF0ub2Zmc2V0VG9wO2QucmVtb3ZlKCk7YS5maXhlZFBvc2l0aW9uPWV9Zi5leHRlbmQoYi5kZWZhdWx0cyx7c2Nyb2xsYmFyV2lkdGg6Zi5zY3JvbGxiYXJXaWR0aCgpLGZpeGVkOmYuc3VwcG9ydC5maXhlZFBvc2l0aW9uLHBhcmVudDpmKFwiYm9keVwiKX0pO2E9ZihyKS53aWR0aCgpO0ouYWRkQ2xhc3MoXCJmYW5jeWJveC1sb2NrLXRlc3RcIik7ZD1mKHIpLndpZHRoKCk7Si5yZW1vdmVDbGFzcyhcImZhbmN5Ym94LWxvY2stdGVzdFwiKTtmKFwiPHN0eWxlIHR5cGU9J3RleHQvY3NzJz4uZmFuY3lib3gtbWFyZ2lue21hcmdpbi1yaWdodDpcIisoZC1hKStcInB4O308L3N0eWxlPlwiKS5hcHBlbmRUbyhcImhlYWRcIil9KX0pKHdpbmRvdyxkb2N1bWVudCxqUXVlcnkpOyIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgJChcImlmcmFtZVtzcmMqPWluc2lnaXRdXCIpLmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xyXG5cclxuICAgIC8qKioqKioqKioqKioqKioqKiBXYXlwb2ludHMgKioqKioqKioqKioqKioqKioqL1xyXG4gICAgJCgnLndwMScpLndheXBvaW50KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoJy53cDEnKS5hZGRDbGFzcygnYW5pbWF0ZWQgZmFkZUluVXAnKTtcclxuICAgIH0sIHtcclxuICAgICAgICBvZmZzZXQ6ICc3NSUnXHJcbiAgICB9KTtcclxuICAgICQoJy53cDInKS53YXlwb2ludChmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcud3AyJykuYWRkQ2xhc3MoJ2FuaW1hdGVkIGZhZGVJblVwJyk7XHJcbiAgICB9LCB7XHJcbiAgICAgICAgb2Zmc2V0OiAnNzUlJ1xyXG4gICAgfSk7XHJcbiAgICAkKCcud3AzJykud2F5cG9pbnQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnLndwMycpLmFkZENsYXNzKCdhbmltYXRlZCBmYWRlSW5SaWdodCcpO1xyXG4gICAgfSwge1xyXG4gICAgICAgIG9mZnNldDogJzc1JSdcclxuICAgIH0pO1xyXG4gICAgJCgnLndwNCcpLndheXBvaW50KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoJy53cDQnKS5hZGRDbGFzcygnYW5pbWF0ZWQgZmFkZUluVXAnKTtcclxuICAgIH0sIHtcclxuICAgICAgICBvZmZzZXQ6ICc5NSUnXHJcbiAgICB9KTtcclxuICAgICQoJy53cDUnKS53YXlwb2ludChmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcud3A1JykuYWRkQ2xhc3MoJ2FuaW1hdGVkIGZhZGVJblVwJyk7XHJcbiAgICB9LCB7XHJcbiAgICAgICAgb2Zmc2V0OiAnOTMlJ1xyXG4gICAgfSk7XHJcbiAgICAkKCcud3A2Jykud2F5cG9pbnQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnLndwNicpLmFkZENsYXNzKCdhbmltYXRlZCBmYWRlSW5VcCcpO1xyXG4gICAgfSwge1xyXG4gICAgICAgIG9mZnNldDogJzkwJSdcclxuICAgIH0pO1xyXG5cclxuICAgIC8qKioqKioqKioqKioqKioqKiBJbml0aWF0ZSBGbGV4c2xpZGVyICoqKioqKioqKioqKioqKioqKi9cclxuICAgICQoJy5mbGV4c2xpZGVyJykuZmxleHNsaWRlcih7XHJcbiAgICAgICAgYW5pbWF0aW9uOiBcInNsaWRlXCIsXHJcbiAgICAgICAgc2xpZGVzaG93U3BlZWQ6IDEwMDAwLFxyXG4gICAgICAgIGFuaW1hdGlvbkR1cmF0aW9uOiA0MDAsXHJcbiAgICAgICAgcGF1c2VPbkhvdmVyOiB0cnVlXHJcbiAgICB9KTtcclxuXHJcbiAgICAvKioqKioqKioqKioqKioqKiogSW5pdGlhdGUgRmFuY3lib3ggKioqKioqKioqKioqKioqKioqL1xyXG4gICAgJCgnLnNpbmdsZV9pbWFnZScpLmZhbmN5Ym94KHtcclxuICAgICAgICBwYWRkaW5nOiA0LFxyXG4gICAgfSk7XHJcblxyXG4gICAgLyoqKioqKioqKioqKioqKioqIFRvb2x0aXBzICoqKioqKioqKioqKioqKioqKi9cclxuICAgIC8vJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuXHJcbiAgICAvKioqKioqKioqKioqKioqKiogTmF2IFRyYW5zZm9ybWljb24gKioqKioqKioqKioqKioqKioqL1xyXG4gICAgLyogV2hlbiB1c2VyIGNsaWNrcyB0aGUgSWNvbiAqL1xyXG4gICAgJCgnLm5hdi10b2dnbGUnKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAkKCcuaGVhZGVyLW5hdicpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH0pO1xyXG4gICAgLyogV2hlbiB1c2VyIGNsaWNrcyBhIGxpbmsgKi9cclxuICAgICQoJy5oZWFkZXItbmF2IGxpIGEnKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcubmF2LXRvZ2dsZScpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAkKCcuaGVhZGVyLW5hdicpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvKioqKioqKioqKioqKioqKiogSGVhZGVyIEJHIFNjcm9sbCAqKioqKioqKioqKioqKioqKiovXHJcbiAgICAkKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzY3JvbGwgPSB7XHJcbiAgICAgICAgICAgIGNvbnRyb2w6IHtcclxuICAgICAgICAgICAgICAgIGZpeGVkczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnc2VjdGlvbi5uYXZpZ2F0aW9uJykuYWRkQ2xhc3MoJ2ZpeGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnc2VjdGlvbi5uYXZpZ2F0aW9uJykucmVtb3ZlQ2xhc3MoJ25vdC1maXhlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJ2hlYWRlcicpLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYm9yZGVyLWJvdHRvbVwiOiBcInNvbGlkIDFweCByZ2JhKDI1NSwgMjU1LCAyNTUsIDApXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicGFkZGluZ1wiOiBcIjEwcHggMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnaGVhZGVyIC5tZW1iZXItYWN0aW9ucycpLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidG9wXCI6IFwiMTdweFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJ2hlYWRlciAubmF2aWNvbicpLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidG9wXCI6IFwiMjNweFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG5vdGZpeGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCdzZWN0aW9uLm5hdmlnYXRpb24nKS5yZW1vdmVDbGFzcygnZml4ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAkKCdzZWN0aW9uLm5hdmlnYXRpb24nKS5hZGRDbGFzcygnbm90LWZpeGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnaGVhZGVyJykuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJib3JkZXItYm90dG9tXCI6IFwic29saWQgMXB4IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInBhZGRpbmdcIjogXCIxMHB4IDBcIlxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJ2hlYWRlciAubWVtYmVyLWFjdGlvbnMnKS5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRvcFwiOiBcIjE3cHhcIixcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAkKCdoZWFkZXIgLm5hdmljb24nKS5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRvcFwiOiBcIjIzcHhcIixcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBpbml0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2Nyb2xsID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2Nyb2xsID49IDIwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZml4ZWRzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub3RmaXhlZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gICBcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBldmVudHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmluaXQoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJCh3aW5kb3cpLnNjcm9sbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5pbml0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNjcm9sbC5jb250cm9sLmV2ZW50cygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLyoqKioqKioqKioqKioqKioqIFNtb290aCBTY3JvbGxpbmcgKioqKioqKioqKioqKioqKioqL1xyXG4gICAgJChmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCdhW2hyZWYqPSNdOm5vdChbaHJlZj0jXSknKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGhyZWYgPSAkKHRoaXMpLmF0dHIoJ2hyZWYnKS5yZXBsYWNlKC8jLiokLywgJycpO1xyXG4gICAgICAgICAgICBpZiAoaHJlZiA9PT0gJycpIHtcclxuLy8gICAgICAgICAgICBpZiAobG9jYXRpb24ucGF0aG5hbWUucmVwbGFjZSgvXlxcLy8sICcnKSA9PT0gdGhpcy5wYXRobmFtZS5yZXBsYWNlKC9eXFwvLywgJycpICYmIGxvY2F0aW9uLmhvc3RuYW1lID09PSB0aGlzLmhvc3RuYW1lKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0gJCh0aGlzLmhhc2gpO1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0Lmxlbmd0aCA/IHRhcmdldCA6ICQoJ1tuYW1lPScgKyB0aGlzLmhhc2guc2xpY2UoMSkgKyAnXScpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRhcmdldC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCdodG1sLGJvZHknKS5hbmltYXRlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsVG9wOiB0YXJnZXQub2Zmc2V0KCkudG9wIC0gJCgnLm5hdmlnYXRpb24nKS5oZWlnaHQoKVxyXG4gICAgICAgICAgICAgICAgICAgIH0sIDEwMDApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0pOyIsIi8qXHJcbiAqIGpRdWVyeSBGbGV4U2xpZGVyIHYyLjUuMFxyXG4gKiBDb3B5cmlnaHQgMjAxMiBXb29UaGVtZXNcclxuICogQ29udHJpYnV0aW5nIEF1dGhvcjogVHlsZXIgU21pdGhcclxuICovIWZ1bmN0aW9uKCQpeyQuZmxleHNsaWRlcj1mdW5jdGlvbihlLHQpe3ZhciBhPSQoZSk7YS52YXJzPSQuZXh0ZW5kKHt9LCQuZmxleHNsaWRlci5kZWZhdWx0cyx0KTt2YXIgbj1hLnZhcnMubmFtZXNwYWNlLGk9d2luZG93Lm5hdmlnYXRvciYmd2luZG93Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkJiZ3aW5kb3cuTVNHZXN0dXJlLHM9KFwib250b3VjaHN0YXJ0XCJpbiB3aW5kb3d8fGl8fHdpbmRvdy5Eb2N1bWVudFRvdWNoJiZkb2N1bWVudCBpbnN0YW5jZW9mIERvY3VtZW50VG91Y2gpJiZhLnZhcnMudG91Y2gscj1cImNsaWNrIHRvdWNoZW5kIE1TUG9pbnRlclVwIGtleXVwXCIsbz1cIlwiLGwsYz1cInZlcnRpY2FsXCI9PT1hLnZhcnMuZGlyZWN0aW9uLGQ9YS52YXJzLnJldmVyc2UsdT1hLnZhcnMuaXRlbVdpZHRoPjAsdj1cImZhZGVcIj09PWEudmFycy5hbmltYXRpb24scD1cIlwiIT09YS52YXJzLmFzTmF2Rm9yLG09e30sZj0hMDskLmRhdGEoZSxcImZsZXhzbGlkZXJcIixhKSxtPXtpbml0OmZ1bmN0aW9uKCl7YS5hbmltYXRpbmc9ITEsYS5jdXJyZW50U2xpZGU9cGFyc2VJbnQoYS52YXJzLnN0YXJ0QXQ/YS52YXJzLnN0YXJ0QXQ6MCwxMCksaXNOYU4oYS5jdXJyZW50U2xpZGUpJiYoYS5jdXJyZW50U2xpZGU9MCksYS5hbmltYXRpbmdUbz1hLmN1cnJlbnRTbGlkZSxhLmF0RW5kPTA9PT1hLmN1cnJlbnRTbGlkZXx8YS5jdXJyZW50U2xpZGU9PT1hLmxhc3QsYS5jb250YWluZXJTZWxlY3Rvcj1hLnZhcnMuc2VsZWN0b3Iuc3Vic3RyKDAsYS52YXJzLnNlbGVjdG9yLnNlYXJjaChcIiBcIikpLGEuc2xpZGVzPSQoYS52YXJzLnNlbGVjdG9yLGEpLGEuY29udGFpbmVyPSQoYS5jb250YWluZXJTZWxlY3RvcixhKSxhLmNvdW50PWEuc2xpZGVzLmxlbmd0aCxhLnN5bmNFeGlzdHM9JChhLnZhcnMuc3luYykubGVuZ3RoPjAsXCJzbGlkZVwiPT09YS52YXJzLmFuaW1hdGlvbiYmKGEudmFycy5hbmltYXRpb249XCJzd2luZ1wiKSxhLnByb3A9Yz9cInRvcFwiOlwibWFyZ2luTGVmdFwiLGEuYXJncz17fSxhLm1hbnVhbFBhdXNlPSExLGEuc3RvcHBlZD0hMSxhLnN0YXJ0ZWQ9ITEsYS5zdGFydFRpbWVvdXQ9bnVsbCxhLnRyYW5zaXRpb25zPSFhLnZhcnMudmlkZW8mJiF2JiZhLnZhcnMudXNlQ1NTJiZmdW5jdGlvbigpe3ZhciBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksdD1bXCJwZXJzcGVjdGl2ZVByb3BlcnR5XCIsXCJXZWJraXRQZXJzcGVjdGl2ZVwiLFwiTW96UGVyc3BlY3RpdmVcIixcIk9QZXJzcGVjdGl2ZVwiLFwibXNQZXJzcGVjdGl2ZVwiXTtmb3IodmFyIG4gaW4gdClpZih2b2lkIDAhPT1lLnN0eWxlW3Rbbl1dKXJldHVybiBhLnBmeD10W25dLnJlcGxhY2UoXCJQZXJzcGVjdGl2ZVwiLFwiXCIpLnRvTG93ZXJDYXNlKCksYS5wcm9wPVwiLVwiK2EucGZ4K1wiLXRyYW5zZm9ybVwiLCEwO3JldHVybiExfSgpLGEuZW5zdXJlQW5pbWF0aW9uRW5kPVwiXCIsXCJcIiE9PWEudmFycy5jb250cm9sc0NvbnRhaW5lciYmKGEuY29udHJvbHNDb250YWluZXI9JChhLnZhcnMuY29udHJvbHNDb250YWluZXIpLmxlbmd0aD4wJiYkKGEudmFycy5jb250cm9sc0NvbnRhaW5lcikpLFwiXCIhPT1hLnZhcnMubWFudWFsQ29udHJvbHMmJihhLm1hbnVhbENvbnRyb2xzPSQoYS52YXJzLm1hbnVhbENvbnRyb2xzKS5sZW5ndGg+MCYmJChhLnZhcnMubWFudWFsQ29udHJvbHMpKSxcIlwiIT09YS52YXJzLmN1c3RvbURpcmVjdGlvbk5hdiYmKGEuY3VzdG9tRGlyZWN0aW9uTmF2PTI9PT0kKGEudmFycy5jdXN0b21EaXJlY3Rpb25OYXYpLmxlbmd0aCYmJChhLnZhcnMuY3VzdG9tRGlyZWN0aW9uTmF2KSksYS52YXJzLnJhbmRvbWl6ZSYmKGEuc2xpZGVzLnNvcnQoZnVuY3Rpb24oKXtyZXR1cm4gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpKS0uNX0pLGEuY29udGFpbmVyLmVtcHR5KCkuYXBwZW5kKGEuc2xpZGVzKSksYS5kb01hdGgoKSxhLnNldHVwKFwiaW5pdFwiKSxhLnZhcnMuY29udHJvbE5hdiYmbS5jb250cm9sTmF2LnNldHVwKCksYS52YXJzLmRpcmVjdGlvbk5hdiYmbS5kaXJlY3Rpb25OYXYuc2V0dXAoKSxhLnZhcnMua2V5Ym9hcmQmJigxPT09JChhLmNvbnRhaW5lclNlbGVjdG9yKS5sZW5ndGh8fGEudmFycy5tdWx0aXBsZUtleWJvYXJkKSYmJChkb2N1bWVudCkuYmluZChcImtleXVwXCIsZnVuY3Rpb24oZSl7dmFyIHQ9ZS5rZXlDb2RlO2lmKCFhLmFuaW1hdGluZyYmKDM5PT09dHx8Mzc9PT10KSl7dmFyIG49Mzk9PT10P2EuZ2V0VGFyZ2V0KFwibmV4dFwiKTozNz09PXQ/YS5nZXRUYXJnZXQoXCJwcmV2XCIpOiExO2EuZmxleEFuaW1hdGUobixhLnZhcnMucGF1c2VPbkFjdGlvbil9fSksYS52YXJzLm1vdXNld2hlZWwmJmEuYmluZChcIm1vdXNld2hlZWxcIixmdW5jdGlvbihlLHQsbixpKXtlLnByZXZlbnREZWZhdWx0KCk7dmFyIHM9YS5nZXRUYXJnZXQoMD50P1wibmV4dFwiOlwicHJldlwiKTthLmZsZXhBbmltYXRlKHMsYS52YXJzLnBhdXNlT25BY3Rpb24pfSksYS52YXJzLnBhdXNlUGxheSYmbS5wYXVzZVBsYXkuc2V0dXAoKSxhLnZhcnMuc2xpZGVzaG93JiZhLnZhcnMucGF1c2VJbnZpc2libGUmJm0ucGF1c2VJbnZpc2libGUuaW5pdCgpLGEudmFycy5zbGlkZXNob3cmJihhLnZhcnMucGF1c2VPbkhvdmVyJiZhLmhvdmVyKGZ1bmN0aW9uKCl7YS5tYW51YWxQbGF5fHxhLm1hbnVhbFBhdXNlfHxhLnBhdXNlKCl9LGZ1bmN0aW9uKCl7YS5tYW51YWxQYXVzZXx8YS5tYW51YWxQbGF5fHxhLnN0b3BwZWR8fGEucGxheSgpfSksYS52YXJzLnBhdXNlSW52aXNpYmxlJiZtLnBhdXNlSW52aXNpYmxlLmlzSGlkZGVuKCl8fChhLnZhcnMuaW5pdERlbGF5PjA/YS5zdGFydFRpbWVvdXQ9c2V0VGltZW91dChhLnBsYXksYS52YXJzLmluaXREZWxheSk6YS5wbGF5KCkpKSxwJiZtLmFzTmF2LnNldHVwKCkscyYmYS52YXJzLnRvdWNoJiZtLnRvdWNoKCksKCF2fHx2JiZhLnZhcnMuc21vb3RoSGVpZ2h0KSYmJCh3aW5kb3cpLmJpbmQoXCJyZXNpemUgb3JpZW50YXRpb25jaGFuZ2UgZm9jdXNcIixtLnJlc2l6ZSksYS5maW5kKFwiaW1nXCIpLmF0dHIoXCJkcmFnZ2FibGVcIixcImZhbHNlXCIpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXthLnZhcnMuc3RhcnQoYSl9LDIwMCl9LGFzTmF2OntzZXR1cDpmdW5jdGlvbigpe2EuYXNOYXY9ITAsYS5hbmltYXRpbmdUbz1NYXRoLmZsb29yKGEuY3VycmVudFNsaWRlL2EubW92ZSksYS5jdXJyZW50SXRlbT1hLmN1cnJlbnRTbGlkZSxhLnNsaWRlcy5yZW1vdmVDbGFzcyhuK1wiYWN0aXZlLXNsaWRlXCIpLmVxKGEuY3VycmVudEl0ZW0pLmFkZENsYXNzKG4rXCJhY3RpdmUtc2xpZGVcIiksaT8oZS5fc2xpZGVyPWEsYS5zbGlkZXMuZWFjaChmdW5jdGlvbigpe3ZhciBlPXRoaXM7ZS5fZ2VzdHVyZT1uZXcgTVNHZXN0dXJlLGUuX2dlc3R1cmUudGFyZ2V0PWUsZS5hZGRFdmVudExpc3RlbmVyKFwiTVNQb2ludGVyRG93blwiLGZ1bmN0aW9uKGUpe2UucHJldmVudERlZmF1bHQoKSxlLmN1cnJlbnRUYXJnZXQuX2dlc3R1cmUmJmUuY3VycmVudFRhcmdldC5fZ2VzdHVyZS5hZGRQb2ludGVyKGUucG9pbnRlcklkKX0sITEpLGUuYWRkRXZlbnRMaXN0ZW5lcihcIk1TR2VzdHVyZVRhcFwiLGZ1bmN0aW9uKGUpe2UucHJldmVudERlZmF1bHQoKTt2YXIgdD0kKHRoaXMpLG49dC5pbmRleCgpOyQoYS52YXJzLmFzTmF2Rm9yKS5kYXRhKFwiZmxleHNsaWRlclwiKS5hbmltYXRpbmd8fHQuaGFzQ2xhc3MoXCJhY3RpdmVcIil8fChhLmRpcmVjdGlvbj1hLmN1cnJlbnRJdGVtPG4/XCJuZXh0XCI6XCJwcmV2XCIsYS5mbGV4QW5pbWF0ZShuLGEudmFycy5wYXVzZU9uQWN0aW9uLCExLCEwLCEwKSl9KX0pKTphLnNsaWRlcy5vbihyLGZ1bmN0aW9uKGUpe2UucHJldmVudERlZmF1bHQoKTt2YXIgdD0kKHRoaXMpLGk9dC5pbmRleCgpLHM9dC5vZmZzZXQoKS5sZWZ0LSQoYSkuc2Nyb2xsTGVmdCgpOzA+PXMmJnQuaGFzQ2xhc3MobitcImFjdGl2ZS1zbGlkZVwiKT9hLmZsZXhBbmltYXRlKGEuZ2V0VGFyZ2V0KFwicHJldlwiKSwhMCk6JChhLnZhcnMuYXNOYXZGb3IpLmRhdGEoXCJmbGV4c2xpZGVyXCIpLmFuaW1hdGluZ3x8dC5oYXNDbGFzcyhuK1wiYWN0aXZlLXNsaWRlXCIpfHwoYS5kaXJlY3Rpb249YS5jdXJyZW50SXRlbTxpP1wibmV4dFwiOlwicHJldlwiLGEuZmxleEFuaW1hdGUoaSxhLnZhcnMucGF1c2VPbkFjdGlvbiwhMSwhMCwhMCkpfSl9fSxjb250cm9sTmF2OntzZXR1cDpmdW5jdGlvbigpe2EubWFudWFsQ29udHJvbHM/bS5jb250cm9sTmF2LnNldHVwTWFudWFsKCk6bS5jb250cm9sTmF2LnNldHVwUGFnaW5nKCl9LHNldHVwUGFnaW5nOmZ1bmN0aW9uKCl7dmFyIGU9XCJ0aHVtYm5haWxzXCI9PT1hLnZhcnMuY29udHJvbE5hdj9cImNvbnRyb2wtdGh1bWJzXCI6XCJjb250cm9sLXBhZ2luZ1wiLHQ9MSxpLHM7aWYoYS5jb250cm9sTmF2U2NhZmZvbGQ9JCgnPG9sIGNsYXNzPVwiJytuK1wiY29udHJvbC1uYXYgXCIrbitlKydcIj48L29sPicpLGEucGFnaW5nQ291bnQ+MSlmb3IodmFyIGw9MDtsPGEucGFnaW5nQ291bnQ7bCsrKXtpZihzPWEuc2xpZGVzLmVxKGwpLGk9XCJ0aHVtYm5haWxzXCI9PT1hLnZhcnMuY29udHJvbE5hdj8nPGltZyBzcmM9XCInK3MuYXR0cihcImRhdGEtdGh1bWJcIikrJ1wiLz4nOlwiPGE+XCIrdCtcIjwvYT5cIixcInRodW1ibmFpbHNcIj09PWEudmFycy5jb250cm9sTmF2JiYhMD09PWEudmFycy50aHVtYkNhcHRpb25zKXt2YXIgYz1zLmF0dHIoXCJkYXRhLXRodW1iY2FwdGlvblwiKTtcIlwiIT09YyYmdm9pZCAwIT09YyYmKGkrPSc8c3BhbiBjbGFzcz1cIicrbisnY2FwdGlvblwiPicrYytcIjwvc3Bhbj5cIil9YS5jb250cm9sTmF2U2NhZmZvbGQuYXBwZW5kKFwiPGxpPlwiK2krXCI8L2xpPlwiKSx0Kyt9YS5jb250cm9sc0NvbnRhaW5lcj8kKGEuY29udHJvbHNDb250YWluZXIpLmFwcGVuZChhLmNvbnRyb2xOYXZTY2FmZm9sZCk6YS5hcHBlbmQoYS5jb250cm9sTmF2U2NhZmZvbGQpLG0uY29udHJvbE5hdi5zZXQoKSxtLmNvbnRyb2xOYXYuYWN0aXZlKCksYS5jb250cm9sTmF2U2NhZmZvbGQuZGVsZWdhdGUoXCJhLCBpbWdcIixyLGZ1bmN0aW9uKGUpe2lmKGUucHJldmVudERlZmF1bHQoKSxcIlwiPT09b3x8bz09PWUudHlwZSl7dmFyIHQ9JCh0aGlzKSxpPWEuY29udHJvbE5hdi5pbmRleCh0KTt0Lmhhc0NsYXNzKG4rXCJhY3RpdmVcIil8fChhLmRpcmVjdGlvbj1pPmEuY3VycmVudFNsaWRlP1wibmV4dFwiOlwicHJldlwiLGEuZmxleEFuaW1hdGUoaSxhLnZhcnMucGF1c2VPbkFjdGlvbikpfVwiXCI9PT1vJiYobz1lLnR5cGUpLG0uc2V0VG9DbGVhcldhdGNoZWRFdmVudCgpfSl9LHNldHVwTWFudWFsOmZ1bmN0aW9uKCl7YS5jb250cm9sTmF2PWEubWFudWFsQ29udHJvbHMsbS5jb250cm9sTmF2LmFjdGl2ZSgpLGEuY29udHJvbE5hdi5iaW5kKHIsZnVuY3Rpb24oZSl7aWYoZS5wcmV2ZW50RGVmYXVsdCgpLFwiXCI9PT1vfHxvPT09ZS50eXBlKXt2YXIgdD0kKHRoaXMpLGk9YS5jb250cm9sTmF2LmluZGV4KHQpO3QuaGFzQ2xhc3MobitcImFjdGl2ZVwiKXx8KGEuZGlyZWN0aW9uPWk+YS5jdXJyZW50U2xpZGU/XCJuZXh0XCI6XCJwcmV2XCIsYS5mbGV4QW5pbWF0ZShpLGEudmFycy5wYXVzZU9uQWN0aW9uKSl9XCJcIj09PW8mJihvPWUudHlwZSksbS5zZXRUb0NsZWFyV2F0Y2hlZEV2ZW50KCl9KX0sc2V0OmZ1bmN0aW9uKCl7dmFyIGU9XCJ0aHVtYm5haWxzXCI9PT1hLnZhcnMuY29udHJvbE5hdj9cImltZ1wiOlwiYVwiO2EuY29udHJvbE5hdj0kKFwiLlwiK24rXCJjb250cm9sLW5hdiBsaSBcIitlLGEuY29udHJvbHNDb250YWluZXI/YS5jb250cm9sc0NvbnRhaW5lcjphKX0sYWN0aXZlOmZ1bmN0aW9uKCl7YS5jb250cm9sTmF2LnJlbW92ZUNsYXNzKG4rXCJhY3RpdmVcIikuZXEoYS5hbmltYXRpbmdUbykuYWRkQ2xhc3MobitcImFjdGl2ZVwiKX0sdXBkYXRlOmZ1bmN0aW9uKGUsdCl7YS5wYWdpbmdDb3VudD4xJiZcImFkZFwiPT09ZT9hLmNvbnRyb2xOYXZTY2FmZm9sZC5hcHBlbmQoJChcIjxsaT48YT5cIithLmNvdW50K1wiPC9hPjwvbGk+XCIpKToxPT09YS5wYWdpbmdDb3VudD9hLmNvbnRyb2xOYXZTY2FmZm9sZC5maW5kKFwibGlcIikucmVtb3ZlKCk6YS5jb250cm9sTmF2LmVxKHQpLmNsb3Nlc3QoXCJsaVwiKS5yZW1vdmUoKSxtLmNvbnRyb2xOYXYuc2V0KCksYS5wYWdpbmdDb3VudD4xJiZhLnBhZ2luZ0NvdW50IT09YS5jb250cm9sTmF2Lmxlbmd0aD9hLnVwZGF0ZSh0LGUpOm0uY29udHJvbE5hdi5hY3RpdmUoKX19LGRpcmVjdGlvbk5hdjp7c2V0dXA6ZnVuY3Rpb24oKXt2YXIgZT0kKCc8dWwgY2xhc3M9XCInK24rJ2RpcmVjdGlvbi1uYXZcIj48bGkgY2xhc3M9XCInK24rJ25hdi1wcmV2XCI+PGEgY2xhc3M9XCInK24rJ3ByZXZcIiBocmVmPVwiI1wiPicrYS52YXJzLnByZXZUZXh0Kyc8L2E+PC9saT48bGkgY2xhc3M9XCInK24rJ25hdi1uZXh0XCI+PGEgY2xhc3M9XCInK24rJ25leHRcIiBocmVmPVwiI1wiPicrYS52YXJzLm5leHRUZXh0K1wiPC9hPjwvbGk+PC91bD5cIik7YS5jdXN0b21EaXJlY3Rpb25OYXY/YS5kaXJlY3Rpb25OYXY9YS5jdXN0b21EaXJlY3Rpb25OYXY6YS5jb250cm9sc0NvbnRhaW5lcj8oJChhLmNvbnRyb2xzQ29udGFpbmVyKS5hcHBlbmQoZSksYS5kaXJlY3Rpb25OYXY9JChcIi5cIituK1wiZGlyZWN0aW9uLW5hdiBsaSBhXCIsYS5jb250cm9sc0NvbnRhaW5lcikpOihhLmFwcGVuZChlKSxhLmRpcmVjdGlvbk5hdj0kKFwiLlwiK24rXCJkaXJlY3Rpb24tbmF2IGxpIGFcIixhKSksbS5kaXJlY3Rpb25OYXYudXBkYXRlKCksYS5kaXJlY3Rpb25OYXYuYmluZChyLGZ1bmN0aW9uKGUpe2UucHJldmVudERlZmF1bHQoKTt2YXIgdDsoXCJcIj09PW98fG89PT1lLnR5cGUpJiYodD1hLmdldFRhcmdldCgkKHRoaXMpLmhhc0NsYXNzKG4rXCJuZXh0XCIpP1wibmV4dFwiOlwicHJldlwiKSxhLmZsZXhBbmltYXRlKHQsYS52YXJzLnBhdXNlT25BY3Rpb24pKSxcIlwiPT09byYmKG89ZS50eXBlKSxtLnNldFRvQ2xlYXJXYXRjaGVkRXZlbnQoKX0pfSx1cGRhdGU6ZnVuY3Rpb24oKXt2YXIgZT1uK1wiZGlzYWJsZWRcIjsxPT09YS5wYWdpbmdDb3VudD9hLmRpcmVjdGlvbk5hdi5hZGRDbGFzcyhlKS5hdHRyKFwidGFiaW5kZXhcIixcIi0xXCIpOmEudmFycy5hbmltYXRpb25Mb29wP2EuZGlyZWN0aW9uTmF2LnJlbW92ZUNsYXNzKGUpLnJlbW92ZUF0dHIoXCJ0YWJpbmRleFwiKTowPT09YS5hbmltYXRpbmdUbz9hLmRpcmVjdGlvbk5hdi5yZW1vdmVDbGFzcyhlKS5maWx0ZXIoXCIuXCIrbitcInByZXZcIikuYWRkQ2xhc3MoZSkuYXR0cihcInRhYmluZGV4XCIsXCItMVwiKTphLmFuaW1hdGluZ1RvPT09YS5sYXN0P2EuZGlyZWN0aW9uTmF2LnJlbW92ZUNsYXNzKGUpLmZpbHRlcihcIi5cIituK1wibmV4dFwiKS5hZGRDbGFzcyhlKS5hdHRyKFwidGFiaW5kZXhcIixcIi0xXCIpOmEuZGlyZWN0aW9uTmF2LnJlbW92ZUNsYXNzKGUpLnJlbW92ZUF0dHIoXCJ0YWJpbmRleFwiKX19LHBhdXNlUGxheTp7c2V0dXA6ZnVuY3Rpb24oKXt2YXIgZT0kKCc8ZGl2IGNsYXNzPVwiJytuKydwYXVzZXBsYXlcIj48YT48L2E+PC9kaXY+Jyk7YS5jb250cm9sc0NvbnRhaW5lcj8oYS5jb250cm9sc0NvbnRhaW5lci5hcHBlbmQoZSksYS5wYXVzZVBsYXk9JChcIi5cIituK1wicGF1c2VwbGF5IGFcIixhLmNvbnRyb2xzQ29udGFpbmVyKSk6KGEuYXBwZW5kKGUpLGEucGF1c2VQbGF5PSQoXCIuXCIrbitcInBhdXNlcGxheSBhXCIsYSkpLG0ucGF1c2VQbGF5LnVwZGF0ZShhLnZhcnMuc2xpZGVzaG93P24rXCJwYXVzZVwiOm4rXCJwbGF5XCIpLGEucGF1c2VQbGF5LmJpbmQocixmdW5jdGlvbihlKXtlLnByZXZlbnREZWZhdWx0KCksKFwiXCI9PT1vfHxvPT09ZS50eXBlKSYmKCQodGhpcykuaGFzQ2xhc3MobitcInBhdXNlXCIpPyhhLm1hbnVhbFBhdXNlPSEwLGEubWFudWFsUGxheT0hMSxhLnBhdXNlKCkpOihhLm1hbnVhbFBhdXNlPSExLGEubWFudWFsUGxheT0hMCxhLnBsYXkoKSkpLFwiXCI9PT1vJiYobz1lLnR5cGUpLG0uc2V0VG9DbGVhcldhdGNoZWRFdmVudCgpfSl9LHVwZGF0ZTpmdW5jdGlvbihlKXtcInBsYXlcIj09PWU/YS5wYXVzZVBsYXkucmVtb3ZlQ2xhc3MobitcInBhdXNlXCIpLmFkZENsYXNzKG4rXCJwbGF5XCIpLmh0bWwoYS52YXJzLnBsYXlUZXh0KTphLnBhdXNlUGxheS5yZW1vdmVDbGFzcyhuK1wicGxheVwiKS5hZGRDbGFzcyhuK1wicGF1c2VcIikuaHRtbChhLnZhcnMucGF1c2VUZXh0KX19LHRvdWNoOmZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCh0KXt0LnN0b3BQcm9wYWdhdGlvbigpLGEuYW5pbWF0aW5nP3QucHJldmVudERlZmF1bHQoKTooYS5wYXVzZSgpLGUuX2dlc3R1cmUuYWRkUG9pbnRlcih0LnBvaW50ZXJJZCksdz0wLHA9Yz9hLmg6YS53LGY9TnVtYmVyKG5ldyBEYXRlKSxsPXUmJmQmJmEuYW5pbWF0aW5nVG89PT1hLmxhc3Q/MDp1JiZkP2EubGltaXQtKGEuaXRlbVcrYS52YXJzLml0ZW1NYXJnaW4pKmEubW92ZSphLmFuaW1hdGluZ1RvOnUmJmEuY3VycmVudFNsaWRlPT09YS5sYXN0P2EubGltaXQ6dT8oYS5pdGVtVythLnZhcnMuaXRlbU1hcmdpbikqYS5tb3ZlKmEuY3VycmVudFNsaWRlOmQ/KGEubGFzdC1hLmN1cnJlbnRTbGlkZSthLmNsb25lT2Zmc2V0KSpwOihhLmN1cnJlbnRTbGlkZSthLmNsb25lT2Zmc2V0KSpwKX1mdW5jdGlvbiBuKHQpe3Quc3RvcFByb3BhZ2F0aW9uKCk7dmFyIGE9dC50YXJnZXQuX3NsaWRlcjtpZihhKXt2YXIgbj0tdC50cmFuc2xhdGlvblgsaT0tdC50cmFuc2xhdGlvblk7cmV0dXJuIHcrPWM/aTpuLG09dyx5PWM/TWF0aC5hYnModyk8TWF0aC5hYnMoLW4pOk1hdGguYWJzKHcpPE1hdGguYWJzKC1pKSx0LmRldGFpbD09PXQuTVNHRVNUVVJFX0ZMQUdfSU5FUlRJQT92b2lkIHNldEltbWVkaWF0ZShmdW5jdGlvbigpe2UuX2dlc3R1cmUuc3RvcCgpfSk6dm9pZCgoIXl8fE51bWJlcihuZXcgRGF0ZSktZj41MDApJiYodC5wcmV2ZW50RGVmYXVsdCgpLCF2JiZhLnRyYW5zaXRpb25zJiYoYS52YXJzLmFuaW1hdGlvbkxvb3B8fChtPXcvKDA9PT1hLmN1cnJlbnRTbGlkZSYmMD53fHxhLmN1cnJlbnRTbGlkZT09PWEubGFzdCYmdz4wP01hdGguYWJzKHcpL3ArMjoxKSksYS5zZXRQcm9wcyhsK20sXCJzZXRUb3VjaFwiKSkpKX19ZnVuY3Rpb24gcyhlKXtlLnN0b3BQcm9wYWdhdGlvbigpO3ZhciB0PWUudGFyZ2V0Ll9zbGlkZXI7aWYodCl7aWYodC5hbmltYXRpbmdUbz09PXQuY3VycmVudFNsaWRlJiYheSYmbnVsbCE9PW0pe3ZhciBhPWQ/LW06bSxuPXQuZ2V0VGFyZ2V0KGE+MD9cIm5leHRcIjpcInByZXZcIik7dC5jYW5BZHZhbmNlKG4pJiYoTnVtYmVyKG5ldyBEYXRlKS1mPDU1MCYmTWF0aC5hYnMoYSk+NTB8fE1hdGguYWJzKGEpPnAvMik/dC5mbGV4QW5pbWF0ZShuLHQudmFycy5wYXVzZU9uQWN0aW9uKTp2fHx0LmZsZXhBbmltYXRlKHQuY3VycmVudFNsaWRlLHQudmFycy5wYXVzZU9uQWN0aW9uLCEwKX1yPW51bGwsbz1udWxsLG09bnVsbCxsPW51bGwsdz0wfX12YXIgcixvLGwscCxtLGYsZyxoLFMseT0hMSx4PTAsYj0wLHc9MDtpPyhlLnN0eWxlLm1zVG91Y2hBY3Rpb249XCJub25lXCIsZS5fZ2VzdHVyZT1uZXcgTVNHZXN0dXJlLGUuX2dlc3R1cmUudGFyZ2V0PWUsZS5hZGRFdmVudExpc3RlbmVyKFwiTVNQb2ludGVyRG93blwiLHQsITEpLGUuX3NsaWRlcj1hLGUuYWRkRXZlbnRMaXN0ZW5lcihcIk1TR2VzdHVyZUNoYW5nZVwiLG4sITEpLGUuYWRkRXZlbnRMaXN0ZW5lcihcIk1TR2VzdHVyZUVuZFwiLHMsITEpKTooZz1mdW5jdGlvbih0KXthLmFuaW1hdGluZz90LnByZXZlbnREZWZhdWx0KCk6KHdpbmRvdy5uYXZpZ2F0b3IubXNQb2ludGVyRW5hYmxlZHx8MT09PXQudG91Y2hlcy5sZW5ndGgpJiYoYS5wYXVzZSgpLHA9Yz9hLmg6YS53LGY9TnVtYmVyKG5ldyBEYXRlKSx4PXQudG91Y2hlc1swXS5wYWdlWCxiPXQudG91Y2hlc1swXS5wYWdlWSxsPXUmJmQmJmEuYW5pbWF0aW5nVG89PT1hLmxhc3Q/MDp1JiZkP2EubGltaXQtKGEuaXRlbVcrYS52YXJzLml0ZW1NYXJnaW4pKmEubW92ZSphLmFuaW1hdGluZ1RvOnUmJmEuY3VycmVudFNsaWRlPT09YS5sYXN0P2EubGltaXQ6dT8oYS5pdGVtVythLnZhcnMuaXRlbU1hcmdpbikqYS5tb3ZlKmEuY3VycmVudFNsaWRlOmQ/KGEubGFzdC1hLmN1cnJlbnRTbGlkZSthLmNsb25lT2Zmc2V0KSpwOihhLmN1cnJlbnRTbGlkZSthLmNsb25lT2Zmc2V0KSpwLHI9Yz9iOngsbz1jP3g6YixlLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIixoLCExKSxlLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLFMsITEpKX0saD1mdW5jdGlvbihlKXt4PWUudG91Y2hlc1swXS5wYWdlWCxiPWUudG91Y2hlc1swXS5wYWdlWSxtPWM/ci1iOnIteCx5PWM/TWF0aC5hYnMobSk8TWF0aC5hYnMoeC1vKTpNYXRoLmFicyhtKTxNYXRoLmFicyhiLW8pO3ZhciB0PTUwMDsoIXl8fE51bWJlcihuZXcgRGF0ZSktZj50KSYmKGUucHJldmVudERlZmF1bHQoKSwhdiYmYS50cmFuc2l0aW9ucyYmKGEudmFycy5hbmltYXRpb25Mb29wfHwobS89MD09PWEuY3VycmVudFNsaWRlJiYwPm18fGEuY3VycmVudFNsaWRlPT09YS5sYXN0JiZtPjA/TWF0aC5hYnMobSkvcCsyOjEpLGEuc2V0UHJvcHMobCttLFwic2V0VG91Y2hcIikpKX0sUz1mdW5jdGlvbih0KXtpZihlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIixoLCExKSxhLmFuaW1hdGluZ1RvPT09YS5jdXJyZW50U2xpZGUmJiF5JiZudWxsIT09bSl7dmFyIG49ZD8tbTptLGk9YS5nZXRUYXJnZXQobj4wP1wibmV4dFwiOlwicHJldlwiKTthLmNhbkFkdmFuY2UoaSkmJihOdW1iZXIobmV3IERhdGUpLWY8NTUwJiZNYXRoLmFicyhuKT41MHx8TWF0aC5hYnMobik+cC8yKT9hLmZsZXhBbmltYXRlKGksYS52YXJzLnBhdXNlT25BY3Rpb24pOnZ8fGEuZmxleEFuaW1hdGUoYS5jdXJyZW50U2xpZGUsYS52YXJzLnBhdXNlT25BY3Rpb24sITApfWUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRvdWNoZW5kXCIsUywhMSkscj1udWxsLG89bnVsbCxtPW51bGwsbD1udWxsfSxlLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsZywhMSkpfSxyZXNpemU6ZnVuY3Rpb24oKXshYS5hbmltYXRpbmcmJmEuaXMoXCI6dmlzaWJsZVwiKSYmKHV8fGEuZG9NYXRoKCksdj9tLnNtb290aEhlaWdodCgpOnU/KGEuc2xpZGVzLndpZHRoKGEuY29tcHV0ZWRXKSxhLnVwZGF0ZShhLnBhZ2luZ0NvdW50KSxhLnNldFByb3BzKCkpOmM/KGEudmlld3BvcnQuaGVpZ2h0KGEuaCksYS5zZXRQcm9wcyhhLmgsXCJzZXRUb3RhbFwiKSk6KGEudmFycy5zbW9vdGhIZWlnaHQmJm0uc21vb3RoSGVpZ2h0KCksYS5uZXdTbGlkZXMud2lkdGgoYS5jb21wdXRlZFcpLGEuc2V0UHJvcHMoYS5jb21wdXRlZFcsXCJzZXRUb3RhbFwiKSkpfSxzbW9vdGhIZWlnaHQ6ZnVuY3Rpb24oZSl7aWYoIWN8fHYpe3ZhciB0PXY/YTphLnZpZXdwb3J0O2U/dC5hbmltYXRlKHtoZWlnaHQ6YS5zbGlkZXMuZXEoYS5hbmltYXRpbmdUbykuaGVpZ2h0KCl9LGUpOnQuaGVpZ2h0KGEuc2xpZGVzLmVxKGEuYW5pbWF0aW5nVG8pLmhlaWdodCgpKX19LHN5bmM6ZnVuY3Rpb24oZSl7dmFyIHQ9JChhLnZhcnMuc3luYykuZGF0YShcImZsZXhzbGlkZXJcIiksbj1hLmFuaW1hdGluZ1RvO3N3aXRjaChlKXtjYXNlXCJhbmltYXRlXCI6dC5mbGV4QW5pbWF0ZShuLGEudmFycy5wYXVzZU9uQWN0aW9uLCExLCEwKTticmVhaztjYXNlXCJwbGF5XCI6dC5wbGF5aW5nfHx0LmFzTmF2fHx0LnBsYXkoKTticmVhaztjYXNlXCJwYXVzZVwiOnQucGF1c2UoKX19LHVuaXF1ZUlEOmZ1bmN0aW9uKGUpe3JldHVybiBlLmZpbHRlcihcIltpZF1cIikuYWRkKGUuZmluZChcIltpZF1cIikpLmVhY2goZnVuY3Rpb24oKXt2YXIgZT0kKHRoaXMpO2UuYXR0cihcImlkXCIsZS5hdHRyKFwiaWRcIikrXCJfY2xvbmVcIil9KSxlfSxwYXVzZUludmlzaWJsZTp7dmlzUHJvcDpudWxsLGluaXQ6ZnVuY3Rpb24oKXt2YXIgZT1tLnBhdXNlSW52aXNpYmxlLmdldEhpZGRlblByb3AoKTtpZihlKXt2YXIgdD1lLnJlcGxhY2UoL1tIfGhdaWRkZW4vLFwiXCIpK1widmlzaWJpbGl0eWNoYW5nZVwiO2RvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIodCxmdW5jdGlvbigpe20ucGF1c2VJbnZpc2libGUuaXNIaWRkZW4oKT9hLnN0YXJ0VGltZW91dD9jbGVhclRpbWVvdXQoYS5zdGFydFRpbWVvdXQpOmEucGF1c2UoKTphLnN0YXJ0ZWQ/YS5wbGF5KCk6YS52YXJzLmluaXREZWxheT4wP3NldFRpbWVvdXQoYS5wbGF5LGEudmFycy5pbml0RGVsYXkpOmEucGxheSgpfSl9fSxpc0hpZGRlbjpmdW5jdGlvbigpe3ZhciBlPW0ucGF1c2VJbnZpc2libGUuZ2V0SGlkZGVuUHJvcCgpO3JldHVybiBlP2RvY3VtZW50W2VdOiExfSxnZXRIaWRkZW5Qcm9wOmZ1bmN0aW9uKCl7dmFyIGU9W1wid2Via2l0XCIsXCJtb3pcIixcIm1zXCIsXCJvXCJdO2lmKFwiaGlkZGVuXCJpbiBkb2N1bWVudClyZXR1cm5cImhpZGRlblwiO2Zvcih2YXIgdD0wO3Q8ZS5sZW5ndGg7dCsrKWlmKGVbdF0rXCJIaWRkZW5cImluIGRvY3VtZW50KXJldHVybiBlW3RdK1wiSGlkZGVuXCI7cmV0dXJuIG51bGx9fSxzZXRUb0NsZWFyV2F0Y2hlZEV2ZW50OmZ1bmN0aW9uKCl7Y2xlYXJUaW1lb3V0KGwpLGw9c2V0VGltZW91dChmdW5jdGlvbigpe289XCJcIn0sM2UzKX19LGEuZmxleEFuaW1hdGU9ZnVuY3Rpb24oZSx0LGkscixvKXtpZihhLnZhcnMuYW5pbWF0aW9uTG9vcHx8ZT09PWEuY3VycmVudFNsaWRlfHwoYS5kaXJlY3Rpb249ZT5hLmN1cnJlbnRTbGlkZT9cIm5leHRcIjpcInByZXZcIikscCYmMT09PWEucGFnaW5nQ291bnQmJihhLmRpcmVjdGlvbj1hLmN1cnJlbnRJdGVtPGU/XCJuZXh0XCI6XCJwcmV2XCIpLCFhLmFuaW1hdGluZyYmKGEuY2FuQWR2YW5jZShlLG8pfHxpKSYmYS5pcyhcIjp2aXNpYmxlXCIpKXtpZihwJiZyKXt2YXIgbD0kKGEudmFycy5hc05hdkZvcikuZGF0YShcImZsZXhzbGlkZXJcIik7aWYoYS5hdEVuZD0wPT09ZXx8ZT09PWEuY291bnQtMSxsLmZsZXhBbmltYXRlKGUsITAsITEsITAsbyksYS5kaXJlY3Rpb249YS5jdXJyZW50SXRlbTxlP1wibmV4dFwiOlwicHJldlwiLGwuZGlyZWN0aW9uPWEuZGlyZWN0aW9uLE1hdGguY2VpbCgoZSsxKS9hLnZpc2libGUpLTE9PT1hLmN1cnJlbnRTbGlkZXx8MD09PWUpcmV0dXJuIGEuY3VycmVudEl0ZW09ZSxhLnNsaWRlcy5yZW1vdmVDbGFzcyhuK1wiYWN0aXZlLXNsaWRlXCIpLmVxKGUpLmFkZENsYXNzKG4rXCJhY3RpdmUtc2xpZGVcIiksITE7YS5jdXJyZW50SXRlbT1lLGEuc2xpZGVzLnJlbW92ZUNsYXNzKG4rXCJhY3RpdmUtc2xpZGVcIikuZXEoZSkuYWRkQ2xhc3MobitcImFjdGl2ZS1zbGlkZVwiKSxlPU1hdGguZmxvb3IoZS9hLnZpc2libGUpfWlmKGEuYW5pbWF0aW5nPSEwLGEuYW5pbWF0aW5nVG89ZSx0JiZhLnBhdXNlKCksYS52YXJzLmJlZm9yZShhKSxhLnN5bmNFeGlzdHMmJiFvJiZtLnN5bmMoXCJhbmltYXRlXCIpLGEudmFycy5jb250cm9sTmF2JiZtLmNvbnRyb2xOYXYuYWN0aXZlKCksdXx8YS5zbGlkZXMucmVtb3ZlQ2xhc3MobitcImFjdGl2ZS1zbGlkZVwiKS5lcShlKS5hZGRDbGFzcyhuK1wiYWN0aXZlLXNsaWRlXCIpLGEuYXRFbmQ9MD09PWV8fGU9PT1hLmxhc3QsYS52YXJzLmRpcmVjdGlvbk5hdiYmbS5kaXJlY3Rpb25OYXYudXBkYXRlKCksZT09PWEubGFzdCYmKGEudmFycy5lbmQoYSksYS52YXJzLmFuaW1hdGlvbkxvb3B8fGEucGF1c2UoKSksdilzPyhhLnNsaWRlcy5lcShhLmN1cnJlbnRTbGlkZSkuY3NzKHtvcGFjaXR5OjAsekluZGV4OjF9KSxhLnNsaWRlcy5lcShlKS5jc3Moe29wYWNpdHk6MSx6SW5kZXg6Mn0pLGEud3JhcHVwKGYpKTooYS5zbGlkZXMuZXEoYS5jdXJyZW50U2xpZGUpLmNzcyh7ekluZGV4OjF9KS5hbmltYXRlKHtvcGFjaXR5OjB9LGEudmFycy5hbmltYXRpb25TcGVlZCxhLnZhcnMuZWFzaW5nKSxhLnNsaWRlcy5lcShlKS5jc3Moe3pJbmRleDoyfSkuYW5pbWF0ZSh7b3BhY2l0eToxfSxhLnZhcnMuYW5pbWF0aW9uU3BlZWQsYS52YXJzLmVhc2luZyxhLndyYXB1cCkpO2Vsc2V7dmFyIGY9Yz9hLnNsaWRlcy5maWx0ZXIoXCI6Zmlyc3RcIikuaGVpZ2h0KCk6YS5jb21wdXRlZFcsZyxoLFM7dT8oZz1hLnZhcnMuaXRlbU1hcmdpbixTPShhLml0ZW1XK2cpKmEubW92ZSphLmFuaW1hdGluZ1RvLGg9Uz5hLmxpbWl0JiYxIT09YS52aXNpYmxlP2EubGltaXQ6Uyk6aD0wPT09YS5jdXJyZW50U2xpZGUmJmU9PT1hLmNvdW50LTEmJmEudmFycy5hbmltYXRpb25Mb29wJiZcIm5leHRcIiE9PWEuZGlyZWN0aW9uP2Q/KGEuY291bnQrYS5jbG9uZU9mZnNldCkqZjowOmEuY3VycmVudFNsaWRlPT09YS5sYXN0JiYwPT09ZSYmYS52YXJzLmFuaW1hdGlvbkxvb3AmJlwicHJldlwiIT09YS5kaXJlY3Rpb24/ZD8wOihhLmNvdW50KzEpKmY6ZD8oYS5jb3VudC0xLWUrYS5jbG9uZU9mZnNldCkqZjooZSthLmNsb25lT2Zmc2V0KSpmLGEuc2V0UHJvcHMoaCxcIlwiLGEudmFycy5hbmltYXRpb25TcGVlZCksYS50cmFuc2l0aW9ucz8oYS52YXJzLmFuaW1hdGlvbkxvb3AmJmEuYXRFbmR8fChhLmFuaW1hdGluZz0hMSxhLmN1cnJlbnRTbGlkZT1hLmFuaW1hdGluZ1RvKSxhLmNvbnRhaW5lci51bmJpbmQoXCJ3ZWJraXRUcmFuc2l0aW9uRW5kIHRyYW5zaXRpb25lbmRcIiksYS5jb250YWluZXIuYmluZChcIndlYmtpdFRyYW5zaXRpb25FbmQgdHJhbnNpdGlvbmVuZFwiLGZ1bmN0aW9uKCl7Y2xlYXJUaW1lb3V0KGEuZW5zdXJlQW5pbWF0aW9uRW5kKSxhLndyYXB1cChmKX0pLGNsZWFyVGltZW91dChhLmVuc3VyZUFuaW1hdGlvbkVuZCksYS5lbnN1cmVBbmltYXRpb25FbmQ9c2V0VGltZW91dChmdW5jdGlvbigpe2Eud3JhcHVwKGYpfSxhLnZhcnMuYW5pbWF0aW9uU3BlZWQrMTAwKSk6YS5jb250YWluZXIuYW5pbWF0ZShhLmFyZ3MsYS52YXJzLmFuaW1hdGlvblNwZWVkLGEudmFycy5lYXNpbmcsZnVuY3Rpb24oKXthLndyYXB1cChmKX0pfWEudmFycy5zbW9vdGhIZWlnaHQmJm0uc21vb3RoSGVpZ2h0KGEudmFycy5hbmltYXRpb25TcGVlZCl9fSxhLndyYXB1cD1mdW5jdGlvbihlKXt2fHx1fHwoMD09PWEuY3VycmVudFNsaWRlJiZhLmFuaW1hdGluZ1RvPT09YS5sYXN0JiZhLnZhcnMuYW5pbWF0aW9uTG9vcD9hLnNldFByb3BzKGUsXCJqdW1wRW5kXCIpOmEuY3VycmVudFNsaWRlPT09YS5sYXN0JiYwPT09YS5hbmltYXRpbmdUbyYmYS52YXJzLmFuaW1hdGlvbkxvb3AmJmEuc2V0UHJvcHMoZSxcImp1bXBTdGFydFwiKSksYS5hbmltYXRpbmc9ITEsYS5jdXJyZW50U2xpZGU9YS5hbmltYXRpbmdUbyxhLnZhcnMuYWZ0ZXIoYSl9LGEuYW5pbWF0ZVNsaWRlcz1mdW5jdGlvbigpeyFhLmFuaW1hdGluZyYmZiYmYS5mbGV4QW5pbWF0ZShhLmdldFRhcmdldChcIm5leHRcIikpfSxhLnBhdXNlPWZ1bmN0aW9uKCl7Y2xlYXJJbnRlcnZhbChhLmFuaW1hdGVkU2xpZGVzKSxhLmFuaW1hdGVkU2xpZGVzPW51bGwsYS5wbGF5aW5nPSExLGEudmFycy5wYXVzZVBsYXkmJm0ucGF1c2VQbGF5LnVwZGF0ZShcInBsYXlcIiksYS5zeW5jRXhpc3RzJiZtLnN5bmMoXCJwYXVzZVwiKX0sYS5wbGF5PWZ1bmN0aW9uKCl7YS5wbGF5aW5nJiZjbGVhckludGVydmFsKGEuYW5pbWF0ZWRTbGlkZXMpLGEuYW5pbWF0ZWRTbGlkZXM9YS5hbmltYXRlZFNsaWRlc3x8c2V0SW50ZXJ2YWwoYS5hbmltYXRlU2xpZGVzLGEudmFycy5zbGlkZXNob3dTcGVlZCksYS5zdGFydGVkPWEucGxheWluZz0hMCxhLnZhcnMucGF1c2VQbGF5JiZtLnBhdXNlUGxheS51cGRhdGUoXCJwYXVzZVwiKSxhLnN5bmNFeGlzdHMmJm0uc3luYyhcInBsYXlcIil9LGEuc3RvcD1mdW5jdGlvbigpe2EucGF1c2UoKSxhLnN0b3BwZWQ9ITB9LGEuY2FuQWR2YW5jZT1mdW5jdGlvbihlLHQpe3ZhciBuPXA/YS5wYWdpbmdDb3VudC0xOmEubGFzdDtyZXR1cm4gdD8hMDpwJiZhLmN1cnJlbnRJdGVtPT09YS5jb3VudC0xJiYwPT09ZSYmXCJwcmV2XCI9PT1hLmRpcmVjdGlvbj8hMDpwJiYwPT09YS5jdXJyZW50SXRlbSYmZT09PWEucGFnaW5nQ291bnQtMSYmXCJuZXh0XCIhPT1hLmRpcmVjdGlvbj8hMTplIT09YS5jdXJyZW50U2xpZGV8fHA/YS52YXJzLmFuaW1hdGlvbkxvb3A/ITA6YS5hdEVuZCYmMD09PWEuY3VycmVudFNsaWRlJiZlPT09biYmXCJuZXh0XCIhPT1hLmRpcmVjdGlvbj8hMTphLmF0RW5kJiZhLmN1cnJlbnRTbGlkZT09PW4mJjA9PT1lJiZcIm5leHRcIj09PWEuZGlyZWN0aW9uPyExOiEwOiExfSxhLmdldFRhcmdldD1mdW5jdGlvbihlKXtyZXR1cm4gYS5kaXJlY3Rpb249ZSxcIm5leHRcIj09PWU/YS5jdXJyZW50U2xpZGU9PT1hLmxhc3Q/MDphLmN1cnJlbnRTbGlkZSsxOjA9PT1hLmN1cnJlbnRTbGlkZT9hLmxhc3Q6YS5jdXJyZW50U2xpZGUtMX0sYS5zZXRQcm9wcz1mdW5jdGlvbihlLHQsbil7dmFyIGk9ZnVuY3Rpb24oKXt2YXIgbj1lP2U6KGEuaXRlbVcrYS52YXJzLml0ZW1NYXJnaW4pKmEubW92ZSphLmFuaW1hdGluZ1RvLGk9ZnVuY3Rpb24oKXtpZih1KXJldHVyblwic2V0VG91Y2hcIj09PXQ/ZTpkJiZhLmFuaW1hdGluZ1RvPT09YS5sYXN0PzA6ZD9hLmxpbWl0LShhLml0ZW1XK2EudmFycy5pdGVtTWFyZ2luKSphLm1vdmUqYS5hbmltYXRpbmdUbzphLmFuaW1hdGluZ1RvPT09YS5sYXN0P2EubGltaXQ6bjtzd2l0Y2godCl7Y2FzZVwic2V0VG90YWxcIjpyZXR1cm4gZD8oYS5jb3VudC0xLWEuY3VycmVudFNsaWRlK2EuY2xvbmVPZmZzZXQpKmU6KGEuY3VycmVudFNsaWRlK2EuY2xvbmVPZmZzZXQpKmU7Y2FzZVwic2V0VG91Y2hcIjpyZXR1cm4gZD9lOmU7Y2FzZVwianVtcEVuZFwiOnJldHVybiBkP2U6YS5jb3VudCplO2Nhc2VcImp1bXBTdGFydFwiOnJldHVybiBkP2EuY291bnQqZTplO2RlZmF1bHQ6cmV0dXJuIGV9fSgpO3JldHVybi0xKmkrXCJweFwifSgpO2EudHJhbnNpdGlvbnMmJihpPWM/XCJ0cmFuc2xhdGUzZCgwLFwiK2krXCIsMClcIjpcInRyYW5zbGF0ZTNkKFwiK2krXCIsMCwwKVwiLG49dm9pZCAwIT09bj9uLzFlMytcInNcIjpcIjBzXCIsYS5jb250YWluZXIuY3NzKFwiLVwiK2EucGZ4K1wiLXRyYW5zaXRpb24tZHVyYXRpb25cIixuKSxhLmNvbnRhaW5lci5jc3MoXCJ0cmFuc2l0aW9uLWR1cmF0aW9uXCIsbikpLGEuYXJnc1thLnByb3BdPWksKGEudHJhbnNpdGlvbnN8fHZvaWQgMD09PW4pJiZhLmNvbnRhaW5lci5jc3MoYS5hcmdzKSxhLmNvbnRhaW5lci5jc3MoXCJ0cmFuc2Zvcm1cIixpKX0sYS5zZXR1cD1mdW5jdGlvbihlKXtpZih2KWEuc2xpZGVzLmNzcyh7d2lkdGg6XCIxMDAlXCIsXCJmbG9hdFwiOlwibGVmdFwiLG1hcmdpblJpZ2h0OlwiLTEwMCVcIixwb3NpdGlvbjpcInJlbGF0aXZlXCJ9KSxcImluaXRcIj09PWUmJihzP2Euc2xpZGVzLmNzcyh7b3BhY2l0eTowLGRpc3BsYXk6XCJibG9ja1wiLHdlYmtpdFRyYW5zaXRpb246XCJvcGFjaXR5IFwiK2EudmFycy5hbmltYXRpb25TcGVlZC8xZTMrXCJzIGVhc2VcIix6SW5kZXg6MX0pLmVxKGEuY3VycmVudFNsaWRlKS5jc3Moe29wYWNpdHk6MSx6SW5kZXg6Mn0pOjA9PWEudmFycy5mYWRlRmlyc3RTbGlkZT9hLnNsaWRlcy5jc3Moe29wYWNpdHk6MCxkaXNwbGF5OlwiYmxvY2tcIix6SW5kZXg6MX0pLmVxKGEuY3VycmVudFNsaWRlKS5jc3Moe3pJbmRleDoyfSkuY3NzKHtvcGFjaXR5OjF9KTphLnNsaWRlcy5jc3Moe29wYWNpdHk6MCxkaXNwbGF5OlwiYmxvY2tcIix6SW5kZXg6MX0pLmVxKGEuY3VycmVudFNsaWRlKS5jc3Moe3pJbmRleDoyfSkuYW5pbWF0ZSh7b3BhY2l0eToxfSxhLnZhcnMuYW5pbWF0aW9uU3BlZWQsYS52YXJzLmVhc2luZykpLGEudmFycy5zbW9vdGhIZWlnaHQmJm0uc21vb3RoSGVpZ2h0KCk7ZWxzZXt2YXIgdCxpO1wiaW5pdFwiPT09ZSYmKGEudmlld3BvcnQ9JCgnPGRpdiBjbGFzcz1cIicrbisndmlld3BvcnRcIj48L2Rpdj4nKS5jc3Moe292ZXJmbG93OlwiaGlkZGVuXCIscG9zaXRpb246XCJyZWxhdGl2ZVwifSkuYXBwZW5kVG8oYSkuYXBwZW5kKGEuY29udGFpbmVyKSxhLmNsb25lQ291bnQ9MCxhLmNsb25lT2Zmc2V0PTAsZCYmKGk9JC5tYWtlQXJyYXkoYS5zbGlkZXMpLnJldmVyc2UoKSxhLnNsaWRlcz0kKGkpLGEuY29udGFpbmVyLmVtcHR5KCkuYXBwZW5kKGEuc2xpZGVzKSkpLGEudmFycy5hbmltYXRpb25Mb29wJiYhdSYmKGEuY2xvbmVDb3VudD0yLGEuY2xvbmVPZmZzZXQ9MSxcImluaXRcIiE9PWUmJmEuY29udGFpbmVyLmZpbmQoXCIuY2xvbmVcIikucmVtb3ZlKCksYS5jb250YWluZXIuYXBwZW5kKG0udW5pcXVlSUQoYS5zbGlkZXMuZmlyc3QoKS5jbG9uZSgpLmFkZENsYXNzKFwiY2xvbmVcIikpLmF0dHIoXCJhcmlhLWhpZGRlblwiLFwidHJ1ZVwiKSkucHJlcGVuZChtLnVuaXF1ZUlEKGEuc2xpZGVzLmxhc3QoKS5jbG9uZSgpLmFkZENsYXNzKFwiY2xvbmVcIikpLmF0dHIoXCJhcmlhLWhpZGRlblwiLFwidHJ1ZVwiKSkpLGEubmV3U2xpZGVzPSQoYS52YXJzLnNlbGVjdG9yLGEpLHQ9ZD9hLmNvdW50LTEtYS5jdXJyZW50U2xpZGUrYS5jbG9uZU9mZnNldDphLmN1cnJlbnRTbGlkZSthLmNsb25lT2Zmc2V0LGMmJiF1PyhhLmNvbnRhaW5lci5oZWlnaHQoMjAwKihhLmNvdW50K2EuY2xvbmVDb3VudCkrXCIlXCIpLmNzcyhcInBvc2l0aW9uXCIsXCJhYnNvbHV0ZVwiKS53aWR0aChcIjEwMCVcIiksc2V0VGltZW91dChmdW5jdGlvbigpe2EubmV3U2xpZGVzLmNzcyh7ZGlzcGxheTpcImJsb2NrXCJ9KSxhLmRvTWF0aCgpLGEudmlld3BvcnQuaGVpZ2h0KGEuaCksYS5zZXRQcm9wcyh0KmEuaCxcImluaXRcIil9LFwiaW5pdFwiPT09ZT8xMDA6MCkpOihhLmNvbnRhaW5lci53aWR0aCgyMDAqKGEuY291bnQrYS5jbG9uZUNvdW50KStcIiVcIiksYS5zZXRQcm9wcyh0KmEuY29tcHV0ZWRXLFwiaW5pdFwiKSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7YS5kb01hdGgoKSxhLm5ld1NsaWRlcy5jc3Moe3dpZHRoOmEuY29tcHV0ZWRXLFwiZmxvYXRcIjpcImxlZnRcIixkaXNwbGF5OlwiYmxvY2tcIn0pLGEudmFycy5zbW9vdGhIZWlnaHQmJm0uc21vb3RoSGVpZ2h0KCl9LFwiaW5pdFwiPT09ZT8xMDA6MCkpfXV8fGEuc2xpZGVzLnJlbW92ZUNsYXNzKG4rXCJhY3RpdmUtc2xpZGVcIikuZXEoYS5jdXJyZW50U2xpZGUpLmFkZENsYXNzKG4rXCJhY3RpdmUtc2xpZGVcIiksYS52YXJzLmluaXQoYSl9LGEuZG9NYXRoPWZ1bmN0aW9uKCl7dmFyIGU9YS5zbGlkZXMuZmlyc3QoKSx0PWEudmFycy5pdGVtTWFyZ2luLG49YS52YXJzLm1pbkl0ZW1zLGk9YS52YXJzLm1heEl0ZW1zO2Eudz12b2lkIDA9PT1hLnZpZXdwb3J0P2Eud2lkdGgoKTphLnZpZXdwb3J0LndpZHRoKCksYS5oPWUuaGVpZ2h0KCksYS5ib3hQYWRkaW5nPWUub3V0ZXJXaWR0aCgpLWUud2lkdGgoKSx1PyhhLml0ZW1UPWEudmFycy5pdGVtV2lkdGgrdCxhLm1pblc9bj9uKmEuaXRlbVQ6YS53LGEubWF4Vz1pP2kqYS5pdGVtVC10OmEudyxhLml0ZW1XPWEubWluVz5hLnc/KGEudy10KihuLTEpKS9uOmEubWF4VzxhLnc/KGEudy10KihpLTEpKS9pOmEudmFycy5pdGVtV2lkdGg+YS53P2EudzphLnZhcnMuaXRlbVdpZHRoLGEudmlzaWJsZT1NYXRoLmZsb29yKGEudy9hLml0ZW1XKSxhLm1vdmU9YS52YXJzLm1vdmU+MCYmYS52YXJzLm1vdmU8YS52aXNpYmxlP2EudmFycy5tb3ZlOmEudmlzaWJsZSxhLnBhZ2luZ0NvdW50PU1hdGguY2VpbCgoYS5jb3VudC1hLnZpc2libGUpL2EubW92ZSsxKSxhLmxhc3Q9YS5wYWdpbmdDb3VudC0xLGEubGltaXQ9MT09PWEucGFnaW5nQ291bnQ/MDphLnZhcnMuaXRlbVdpZHRoPmEudz9hLml0ZW1XKihhLmNvdW50LTEpK3QqKGEuY291bnQtMSk6KGEuaXRlbVcrdCkqYS5jb3VudC1hLnctdCk6KGEuaXRlbVc9YS53LGEucGFnaW5nQ291bnQ9YS5jb3VudCxhLmxhc3Q9YS5jb3VudC0xKSxhLmNvbXB1dGVkVz1hLml0ZW1XLWEuYm94UGFkZGluZ30sYS51cGRhdGU9ZnVuY3Rpb24oZSx0KXthLmRvTWF0aCgpLHV8fChlPGEuY3VycmVudFNsaWRlP2EuY3VycmVudFNsaWRlKz0xOmU8PWEuY3VycmVudFNsaWRlJiYwIT09ZSYmKGEuY3VycmVudFNsaWRlLT0xKSxhLmFuaW1hdGluZ1RvPWEuY3VycmVudFNsaWRlKSxhLnZhcnMuY29udHJvbE5hdiYmIWEubWFudWFsQ29udHJvbHMmJihcImFkZFwiPT09dCYmIXV8fGEucGFnaW5nQ291bnQ+YS5jb250cm9sTmF2Lmxlbmd0aD9tLmNvbnRyb2xOYXYudXBkYXRlKFwiYWRkXCIpOihcInJlbW92ZVwiPT09dCYmIXV8fGEucGFnaW5nQ291bnQ8YS5jb250cm9sTmF2Lmxlbmd0aCkmJih1JiZhLmN1cnJlbnRTbGlkZT5hLmxhc3QmJihhLmN1cnJlbnRTbGlkZS09MSxhLmFuaW1hdGluZ1RvLT0xKSxtLmNvbnRyb2xOYXYudXBkYXRlKFwicmVtb3ZlXCIsYS5sYXN0KSkpLGEudmFycy5kaXJlY3Rpb25OYXYmJm0uZGlyZWN0aW9uTmF2LnVwZGF0ZSgpfSxhLmFkZFNsaWRlPWZ1bmN0aW9uKGUsdCl7dmFyIG49JChlKTthLmNvdW50Kz0xLGEubGFzdD1hLmNvdW50LTEsYyYmZD92b2lkIDAhPT10P2Euc2xpZGVzLmVxKGEuY291bnQtdCkuYWZ0ZXIobik6YS5jb250YWluZXIucHJlcGVuZChuKTp2b2lkIDAhPT10P2Euc2xpZGVzLmVxKHQpLmJlZm9yZShuKTphLmNvbnRhaW5lci5hcHBlbmQobiksYS51cGRhdGUodCxcImFkZFwiKSxhLnNsaWRlcz0kKGEudmFycy5zZWxlY3RvcitcIjpub3QoLmNsb25lKVwiLGEpLGEuc2V0dXAoKSxhLnZhcnMuYWRkZWQoYSl9LGEucmVtb3ZlU2xpZGU9ZnVuY3Rpb24oZSl7dmFyIHQ9aXNOYU4oZSk/YS5zbGlkZXMuaW5kZXgoJChlKSk6ZTthLmNvdW50LT0xLGEubGFzdD1hLmNvdW50LTEsaXNOYU4oZSk/JChlLGEuc2xpZGVzKS5yZW1vdmUoKTpjJiZkP2Euc2xpZGVzLmVxKGEubGFzdCkucmVtb3ZlKCk6YS5zbGlkZXMuZXEoZSkucmVtb3ZlKCksYS5kb01hdGgoKSxhLnVwZGF0ZSh0LFwicmVtb3ZlXCIpLGEuc2xpZGVzPSQoYS52YXJzLnNlbGVjdG9yK1wiOm5vdCguY2xvbmUpXCIsYSksYS5zZXR1cCgpLGEudmFycy5yZW1vdmVkKGEpfSxtLmluaXQoKX0sJCh3aW5kb3cpLmJsdXIoZnVuY3Rpb24oZSl7Zm9jdXNlZD0hMX0pLmZvY3VzKGZ1bmN0aW9uKGUpe2ZvY3VzZWQ9ITB9KSwkLmZsZXhzbGlkZXIuZGVmYXVsdHM9e25hbWVzcGFjZTpcImZsZXgtXCIsc2VsZWN0b3I6XCIuc2xpZGVzID4gbGlcIixhbmltYXRpb246XCJmYWRlXCIsZWFzaW5nOlwic3dpbmdcIixkaXJlY3Rpb246XCJob3Jpem9udGFsXCIscmV2ZXJzZTohMSxhbmltYXRpb25Mb29wOiEwLHNtb290aEhlaWdodDohMSxzdGFydEF0OjAsc2xpZGVzaG93OiEwLHNsaWRlc2hvd1NwZWVkOjdlMyxhbmltYXRpb25TcGVlZDo2MDAsaW5pdERlbGF5OjAscmFuZG9taXplOiExLGZhZGVGaXJzdFNsaWRlOiEwLHRodW1iQ2FwdGlvbnM6ITEscGF1c2VPbkFjdGlvbjohMCxwYXVzZU9uSG92ZXI6ITEscGF1c2VJbnZpc2libGU6ITAsdXNlQ1NTOiEwLHRvdWNoOiEwLHZpZGVvOiExLGNvbnRyb2xOYXY6ITAsZGlyZWN0aW9uTmF2OiEwLHByZXZUZXh0OlwiUHJldmlvdXNcIixuZXh0VGV4dDpcIk5leHRcIixrZXlib2FyZDohMCxtdWx0aXBsZUtleWJvYXJkOiExLG1vdXNld2hlZWw6ITEscGF1c2VQbGF5OiExLHBhdXNlVGV4dDpcIlBhdXNlXCIscGxheVRleHQ6XCJQbGF5XCIsY29udHJvbHNDb250YWluZXI6XCJcIixtYW51YWxDb250cm9sczpcIlwiLGN1c3RvbURpcmVjdGlvbk5hdjpcIlwiLHN5bmM6XCJcIixhc05hdkZvcjpcIlwiLGl0ZW1XaWR0aDowLGl0ZW1NYXJnaW46MCxtaW5JdGVtczoxLG1heEl0ZW1zOjAsbW92ZTowLGFsbG93T25lU2xpZGU6ITAsc3RhcnQ6ZnVuY3Rpb24oKXt9LGJlZm9yZTpmdW5jdGlvbigpe30sYWZ0ZXI6ZnVuY3Rpb24oKXt9LGVuZDpmdW5jdGlvbigpe30sYWRkZWQ6ZnVuY3Rpb24oKXt9LHJlbW92ZWQ6ZnVuY3Rpb24oKXt9LGluaXQ6ZnVuY3Rpb24oKXt9fSwkLmZuLmZsZXhzbGlkZXI9ZnVuY3Rpb24oZSl7aWYodm9pZCAwPT09ZSYmKGU9e30pLFwib2JqZWN0XCI9PXR5cGVvZiBlKXJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgdD0kKHRoaXMpLGE9ZS5zZWxlY3Rvcj9lLnNlbGVjdG9yOlwiLnNsaWRlcyA+IGxpXCIsbj10LmZpbmQoYSk7MT09PW4ubGVuZ3RoJiZlLmFsbG93T25lU2xpZGU9PT0hMHx8MD09PW4ubGVuZ3RoPyhuLmZhZGVJbig0MDApLGUuc3RhcnQmJmUuc3RhcnQodCkpOnZvaWQgMD09PXQuZGF0YShcImZsZXhzbGlkZXJcIikmJm5ldyAkLmZsZXhzbGlkZXIodGhpcyxlKX0pO3ZhciB0PSQodGhpcykuZGF0YShcImZsZXhzbGlkZXJcIik7c3dpdGNoKGUpe2Nhc2VcInBsYXlcIjp0LnBsYXkoKTticmVhaztjYXNlXCJwYXVzZVwiOnQucGF1c2UoKTticmVhaztjYXNlXCJzdG9wXCI6dC5zdG9wKCk7YnJlYWs7Y2FzZVwibmV4dFwiOnQuZmxleEFuaW1hdGUodC5nZXRUYXJnZXQoXCJuZXh0XCIpLCEwKTticmVhaztjYXNlXCJwcmV2XCI6Y2FzZVwicHJldmlvdXNcIjp0LmZsZXhBbmltYXRlKHQuZ2V0VGFyZ2V0KFwicHJldlwiKSwhMCk7YnJlYWs7ZGVmYXVsdDpcIm51bWJlclwiPT10eXBlb2YgZSYmdC5mbGV4QW5pbWF0ZShlLCEwKX19fShqUXVlcnkpOyIsIi8qIVxyXG4gKiBjbGFzc2llIHYxLjAuMVxyXG4gKiBjbGFzcyBoZWxwZXIgZnVuY3Rpb25zXHJcbiAqIGZyb20gYm9uem8gaHR0cHM6Ly9naXRodWIuY29tL2RlZC9ib256b1xyXG4gKiBNSVQgbGljZW5zZVxyXG4gKiBcclxuICogY2xhc3NpZS5oYXMoIGVsZW0sICdteS1jbGFzcycgKSAtPiB0cnVlL2ZhbHNlXHJcbiAqIGNsYXNzaWUuYWRkKCBlbGVtLCAnbXktbmV3LWNsYXNzJyApXHJcbiAqIGNsYXNzaWUucmVtb3ZlKCBlbGVtLCAnbXktdW53YW50ZWQtY2xhc3MnIClcclxuICogY2xhc3NpZS50b2dnbGUoIGVsZW0sICdteS1jbGFzcycgKVxyXG4gKi9cclxuXHJcbi8qanNoaW50IGJyb3dzZXI6IHRydWUsIHN0cmljdDogdHJ1ZSwgdW5kZWY6IHRydWUsIHVudXNlZDogdHJ1ZSAqL1xyXG4vKmdsb2JhbCBkZWZpbmU6IGZhbHNlLCBtb2R1bGU6IGZhbHNlICovXHJcblxyXG4oIGZ1bmN0aW9uKCB3aW5kb3cgKSB7XHJcblxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG4vLyBjbGFzcyBoZWxwZXIgZnVuY3Rpb25zIGZyb20gYm9uem8gaHR0cHM6Ly9naXRodWIuY29tL2RlZC9ib256b1xyXG5cclxuZnVuY3Rpb24gY2xhc3NSZWcoIGNsYXNzTmFtZSApIHtcclxuICByZXR1cm4gbmV3IFJlZ0V4cChcIihefFxcXFxzKylcIiArIGNsYXNzTmFtZSArIFwiKFxcXFxzK3wkKVwiKTtcclxufVxyXG5cclxuLy8gY2xhc3NMaXN0IHN1cHBvcnQgZm9yIGNsYXNzIG1hbmFnZW1lbnRcclxuLy8gYWx0aG8gdG8gYmUgZmFpciwgdGhlIGFwaSBzdWNrcyBiZWNhdXNlIGl0IHdvbid0IGFjY2VwdCBtdWx0aXBsZSBjbGFzc2VzIGF0IG9uY2VcclxudmFyIGhhc0NsYXNzLCBhZGRDbGFzcywgcmVtb3ZlQ2xhc3M7XHJcblxyXG5pZiAoICdjbGFzc0xpc3QnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCApIHtcclxuICBoYXNDbGFzcyA9IGZ1bmN0aW9uKCBlbGVtLCBjICkge1xyXG4gICAgcmV0dXJuIGVsZW0uY2xhc3NMaXN0LmNvbnRhaW5zKCBjICk7XHJcbiAgfTtcclxuICBhZGRDbGFzcyA9IGZ1bmN0aW9uKCBlbGVtLCBjICkge1xyXG4gICAgZWxlbS5jbGFzc0xpc3QuYWRkKCBjICk7XHJcbiAgfTtcclxuICByZW1vdmVDbGFzcyA9IGZ1bmN0aW9uKCBlbGVtLCBjICkge1xyXG4gICAgZWxlbS5jbGFzc0xpc3QucmVtb3ZlKCBjICk7XHJcbiAgfTtcclxufVxyXG5lbHNlIHtcclxuICBoYXNDbGFzcyA9IGZ1bmN0aW9uKCBlbGVtLCBjICkge1xyXG4gICAgcmV0dXJuIGNsYXNzUmVnKCBjICkudGVzdCggZWxlbS5jbGFzc05hbWUgKTtcclxuICB9O1xyXG4gIGFkZENsYXNzID0gZnVuY3Rpb24oIGVsZW0sIGMgKSB7XHJcbiAgICBpZiAoICFoYXNDbGFzcyggZWxlbSwgYyApICkge1xyXG4gICAgICBlbGVtLmNsYXNzTmFtZSA9IGVsZW0uY2xhc3NOYW1lICsgJyAnICsgYztcclxuICAgIH1cclxuICB9O1xyXG4gIHJlbW92ZUNsYXNzID0gZnVuY3Rpb24oIGVsZW0sIGMgKSB7XHJcbiAgICBlbGVtLmNsYXNzTmFtZSA9IGVsZW0uY2xhc3NOYW1lLnJlcGxhY2UoIGNsYXNzUmVnKCBjICksICcgJyApO1xyXG4gIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRvZ2dsZUNsYXNzKCBlbGVtLCBjICkge1xyXG4gIHZhciBmbiA9IGhhc0NsYXNzKCBlbGVtLCBjICkgPyByZW1vdmVDbGFzcyA6IGFkZENsYXNzO1xyXG4gIGZuKCBlbGVtLCBjICk7XHJcbn1cclxuXHJcbnZhciBjbGFzc2llID0ge1xyXG4gIC8vIGZ1bGwgbmFtZXNcclxuICBoYXNDbGFzczogaGFzQ2xhc3MsXHJcbiAgYWRkQ2xhc3M6IGFkZENsYXNzLFxyXG4gIHJlbW92ZUNsYXNzOiByZW1vdmVDbGFzcyxcclxuICB0b2dnbGVDbGFzczogdG9nZ2xlQ2xhc3MsXHJcbiAgLy8gc2hvcnQgbmFtZXNcclxuICBoYXM6IGhhc0NsYXNzLFxyXG4gIGFkZDogYWRkQ2xhc3MsXHJcbiAgcmVtb3ZlOiByZW1vdmVDbGFzcyxcclxuICB0b2dnbGU6IHRvZ2dsZUNsYXNzXHJcbn07XHJcblxyXG4vLyB0cmFuc3BvcnRcclxuaWYgKCB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XHJcbiAgLy8gQU1EXHJcbiAgZGVmaW5lKCBjbGFzc2llICk7XHJcbn0gZWxzZSBpZiAoIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyApIHtcclxuICAvLyBDb21tb25KU1xyXG4gIG1vZHVsZS5leHBvcnRzID0gY2xhc3NpZTtcclxufSBlbHNlIHtcclxuICAvLyBicm93c2VyIGdsb2JhbFxyXG4gIHdpbmRvdy5jbGFzc2llID0gY2xhc3NpZTtcclxufVxyXG5cclxufSkoIHdpbmRvdyApO1xyXG4iLCIvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblx0UE9QVVAuSlNcclxuXHJcblx0U2ltcGxlIFBvcHVwIHBsdWdpbiBmb3IgalF1ZXJ5XHJcblxyXG5cdEBhdXRob3IgVG9kZCBGcmFuY2lzXHJcblx0QHZlcnNpb24gMi4yLjNcclxuXHJcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuOyhmdW5jdGlvbihiLHQpe2IuZm4ucG9wdXA9ZnVuY3Rpb24oaCl7dmFyIHE9dGhpcy5zZWxlY3RvcixtPW5ldyBiLlBvcHVwKGgpO2IoZG9jdW1lbnQpLm9uKFwiY2xpY2sucG9wdXBcIixxLGZ1bmN0aW9uKG4pe3ZhciBrPWgmJmguY29udGVudD9oLmNvbnRlbnQ6Yih0aGlzKS5hdHRyKFwiaHJlZlwiKTtuLnByZXZlbnREZWZhdWx0KCk7bS5vcGVuKGssdm9pZCAwLHRoaXMpfSk7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe2IodGhpcykuZGF0YShcInBvcHVwXCIsbSl9KX07Yi5Qb3B1cD1mdW5jdGlvbihoKXtmdW5jdGlvbiBxKGEpe3ZhciBkO2IuZWFjaChhLGZ1bmN0aW9uKGEsYyl7aWYoYylyZXR1cm4gZD1jLCExfSk7cmV0dXJuIGR9ZnVuY3Rpb24gbShhKXtyZXR1cm5cImZ1bmN0aW9uXCI9PT10eXBlb2YgYT9cImZ1bmN0aW9uXCI6YSBpbnN0YW5jZW9mIGI/XCJqUXVlcnlcIjpcIiNcIj09PWEuc3Vic3RyKDAsMSl8fFwiLlwiPT09YS5zdWJzdHIoMCwxKT9cImlubGluZVwiOi0xIT09Yi5pbkFycmF5KGEuc3Vic3RyKGEubGVuZ3RoLVxyXG4zKSx1KT9cImltYWdlXCI6XCJodHRwXCI9PT1hLnN1YnN0cigwLDQpP1wiZXh0ZXJuYWxcIjpcImFqYXhcIn1mdW5jdGlvbiBuKGMpe3ImJnIuZmFkZU91dChcImZhc3RcIixmdW5jdGlvbigpe2IodGhpcykucmVtb3ZlKCl9KTt2YXIgZD0hMDt2b2lkIDA9PT1mJiYoZD0hMSxmPWIoJzxkaXYgY2xhc3M9XCInK2Euby5jb250YWluZXJDbGFzcysnXCI+JykscD1iKGEuby5tYXJrdXApLmFwcGVuZFRvKGYpLGIoYS5vLmNsb3NlQ29udGVudCkub25lKFwiY2xpY2tcIixmdW5jdGlvbigpe2EuY2xvc2UoKX0pLmFwcGVuZFRvKGYpLGIodCkucmVzaXplKGEuY2VudGVyKSxmLmFwcGVuZFRvKGIoXCJib2R5XCIpKS5jc3MoXCJvcGFjaXR5XCIsMCkpO3ZhciBlPWIoXCIuXCIrYS5vLmNvbnRlbnRDbGFzcyxmKTthLndpZHRoP2UuY3NzKFwid2lkdGhcIixhLndpZHRoLDEwKTplLmNzcyhcIndpZHRoXCIsXCJcIik7YS5oZWlnaHQ/ZS5jc3MoXCJoZWlnaHRcIixhLmhlaWdodCwxMCk6ZS5jc3MoXCJoZWlnaHRcIixcIlwiKTtwLmhhc0NsYXNzKGEuby5jb250ZW50Q2xhc3MpP1xyXG5wLmh0bWwoYyk6cC5maW5kKFwiLlwiK2Euby5jb250ZW50Q2xhc3MpLmh0bWwoYyk7ZD9hLm8ucmVwbGFjZWQuY2FsbChhLGYsZyk6YS5vLnNob3cuY2FsbChhLGYsZyl9ZnVuY3Rpb24gayhhLGQpe3ZhciBiPShuZXcgUmVnRXhwKFwiWz8mXVwiK2ErXCI9KFteJl0qKVwiKSkuZXhlYyhkKTtyZXR1cm4gYiYmZGVjb2RlVVJJQ29tcG9uZW50KGJbMV0ucmVwbGFjZSgvXFwrL2csXCIgXCIpKX12YXIgYT10aGlzLHU9W1wicG5nXCIsXCJqcGdcIixcImdpZlwiXSxsLHMsZyxmLHIscDthLmVsZT12b2lkIDA7YS5vPWIuZXh0ZW5kKCEwLHt9LHtiYWNrQ2xhc3M6XCJwb3B1cF9iYWNrXCIsYmFja09wYWNpdHk6LjcsY29udGFpbmVyQ2xhc3M6XCJwb3B1cF9jb250XCIsY2xvc2VDb250ZW50Oic8ZGl2IGNsYXNzPVwicG9wdXBfY2xvc2VcIj4mdGltZXM7PC9kaXY+JyxtYXJrdXA6JzxkaXYgY2xhc3M9XCJwb3B1cFwiPjxkaXYgY2xhc3M9XCJwb3B1cF9jb250ZW50XCIvPjwvZGl2PicsY29udGVudENsYXNzOlwicG9wdXBfY29udGVudFwiLFxyXG5wcmVsb2FkZXJDb250ZW50Oic8cCBjbGFzcz1cInByZWxvYWRlclwiPkxvYWRpbmc8L3A+JyxhY3RpdmVDbGFzczpcInBvcHVwX2FjdGl2ZVwiLGhpZGVGbGFzaDohMSxzcGVlZDoyMDAscG9wdXBQbGFjZWhvbGRlckNsYXNzOlwicG9wdXBfcGxhY2Vob2xkZXJcIixrZWVwSW5saW5lQ2hhbmdlczohMCxtb2RhbDohMSxjb250ZW50Om51bGwsdHlwZTpcImF1dG9cIix3aWR0aDpudWxsLGhlaWdodDpudWxsLHR5cGVQYXJhbTpcInB0XCIsd2lkdGhQYXJhbTpcInB3XCIsaGVpZ2h0UGFyYW06XCJwaFwiLGJlZm9yZU9wZW46ZnVuY3Rpb24oYSl7fSxhZnRlck9wZW46ZnVuY3Rpb24oKXt9LGJlZm9yZUNsb3NlOmZ1bmN0aW9uKCl7fSxhZnRlckNsb3NlOmZ1bmN0aW9uKCl7fSxlcnJvcjpmdW5jdGlvbigpe30sc2hvdzpmdW5jdGlvbihhLGIpe3ZhciBlPXRoaXM7ZS5jZW50ZXIoKTthLmFuaW1hdGUoe29wYWNpdHk6MX0sZS5vLnNwZWVkLGZ1bmN0aW9uKCl7ZS5vLmFmdGVyT3Blbi5jYWxsKGUpfSl9LHJlcGxhY2VkOmZ1bmN0aW9uKGEsXHJcbmIpe3RoaXMuY2VudGVyKCkuby5hZnRlck9wZW4uY2FsbCh0aGlzKX0saGlkZTpmdW5jdGlvbihhLGIpe3ZvaWQgMCE9PWEmJmEuYW5pbWF0ZSh7b3BhY2l0eTowfSx0aGlzLm8uc3BlZWQpfSx0eXBlczp7aW5saW5lOmZ1bmN0aW9uKGMsZCl7dmFyIGU9YihjKTtlLmFkZENsYXNzKGEuby5wb3B1cFBsYWNlaG9sZGVyQ2xhc3MpO2Euby5rZWVwSW5saW5lQ2hhbmdlc3x8KHM9ZS5odG1sKCkpO2QuY2FsbCh0aGlzLGUuY2hpbGRyZW4oKSl9LGltYWdlOmZ1bmN0aW9uKGMsZCl7dmFyIGU9dGhpcztiKFwiPGltZyAvPlwiKS5vbmUoXCJsb2FkXCIsZnVuY3Rpb24oKXt2YXIgYT10aGlzO3NldFRpbWVvdXQoZnVuY3Rpb24oKXtkLmNhbGwoZSxhKX0sMCl9KS5vbmUoXCJlcnJvclwiLGZ1bmN0aW9uKCl7YS5vLmVycm9yLmNhbGwoYSxjLFwiaW1hZ2VcIil9KS5hdHRyKFwic3JjXCIsYykuZWFjaChmdW5jdGlvbigpe3RoaXMuY29tcGxldGUmJmIodGhpcykudHJpZ2dlcihcImxvYWRcIil9KX0sZXh0ZXJuYWw6ZnVuY3Rpb24oYyxcclxuZCl7dmFyIGU9YihcIjxpZnJhbWUgLz5cIikuYXR0cih7c3JjOmMsZnJhbWVib3JkZXI6MCx3aWR0aDphLndpZHRoLGhlaWdodDphLmhlaWdodH0pO2QuY2FsbCh0aGlzLGUpfSxodG1sOmZ1bmN0aW9uKGEsYil7Yi5jYWxsKHRoaXMsYSl9LGpRdWVyeTpmdW5jdGlvbihhLGIpe2IuY2FsbCh0aGlzLGEuaHRtbCgpKX0sXCJmdW5jdGlvblwiOmZ1bmN0aW9uKGIsZCl7ZC5jYWxsKHRoaXMsYi5jYWxsKGEpKX0sYWpheDpmdW5jdGlvbihjLGQpe2IuYWpheCh7dXJsOmMsc3VjY2VzczpmdW5jdGlvbihhKXtkLmNhbGwodGhpcyxhKX0sZXJyb3I6ZnVuY3Rpb24oYil7YS5vLmVycm9yLmNhbGwoYSxjLFwiYWpheFwiKX19KX19fSxoKTthLm9wZW49ZnVuY3Rpb24oYyxkLGUpe2M9dm9pZCAwPT09Y3x8XCIjXCI9PT1jP2Euby5jb250ZW50OmM7aWYobnVsbD09PWMpcmV0dXJuIGEuby5lcnJvci5jYWxsKGEsYyxsKSwhMTt2b2lkIDAhPT1lJiYoYS5lbGUmJmEuby5hY3RpdmVDbGFzcyYmYihhLmVsZSkucmVtb3ZlQ2xhc3MoYS5vLmFjdGl2ZUNsYXNzKSxcclxuYS5lbGU9ZSxhLmVsZSYmYS5vLmFjdGl2ZUNsYXNzJiZiKGEuZWxlKS5hZGRDbGFzcyhhLm8uYWN0aXZlQ2xhc3MpKTtpZih2b2lkIDA9PT1nKXtnPWIoJzxkaXYgY2xhc3M9XCInK2Euby5iYWNrQ2xhc3MrJ1wiLz4nKS5hcHBlbmRUbyhiKFwiYm9keVwiKSkuY3NzKFwib3BhY2l0eVwiLDApLmFuaW1hdGUoe29wYWNpdHk6YS5vLmJhY2tPcGFjaXR5fSxhLm8uc3BlZWQpO2lmKCFhLm8ubW9kYWwpZy5vbmUoXCJjbGljay5wb3B1cFwiLGZ1bmN0aW9uKCl7YS5jbG9zZSgpfSk7YS5vLmhpZGVGbGFzaCYmYihcIm9iamVjdCwgZW1iZWRcIikuY3NzKFwidmlzaWJpbGl0eVwiLFwiaGlkZGVuXCIpO2Euby5wcmVsb2FkZXJDb250ZW50JiYocj1iKGEuby5wcmVsb2FkZXJDb250ZW50KS5hcHBlbmRUbyhiKFwiYm9keVwiKSkpfWQ9cShbZCxhLm8udHlwZV0pO2w9ZD1cImF1dG9cIj09PWQ/bShjKTpkO2Eud2lkdGg9YS5vLndpZHRoP2Euby53aWR0aDpudWxsO2EuaGVpZ2h0PWEuby5oZWlnaHQ/YS5vLmhlaWdodDpudWxsO1xyXG5pZigtMT09PWIuaW5BcnJheShkLFtcImlubGluZVwiLFwialF1ZXJ5XCIsXCJmdW5jdGlvblwiXSkpe2U9ayhhLm8udHlwZVBhcmFtLGMpO3ZhciBmPWsoYS5vLndpZHRoUGFyYW0sYyksaD1rKGEuby5oZWlnaHRQYXJhbSxjKTtkPW51bGwhPT1lP2U6ZDthLndpZHRoPW51bGwhPT1mP2Y6YS53aWR0aDthLmhlaWdodD1udWxsIT09aD9oOmEuaGVpZ2h0fWEuby5iZWZvcmVPcGVuLmNhbGwoYSxkKTthLm8udHlwZXNbZF0/YS5vLnR5cGVzW2RdLmNhbGwoYSxjLG4pOmEuby50eXBlcy5hamF4LmNhbGwoYSxjLG4pfTthLmNsb3NlPWZ1bmN0aW9uKCl7YS5vLmJlZm9yZUNsb3NlLmNhbGwoYSk7XCJpbmxpbmVcIj09PWwmJmEuby5rZWVwSW5saW5lQ2hhbmdlcyYmKHM9YihcIi5cIithLm8uY29udGVudENsYXNzKS5odG1sKCkpO3ZvaWQgMCE9PWcmJmcuYW5pbWF0ZSh7b3BhY2l0eTowfSxhLm8uc3BlZWQsZnVuY3Rpb24oKXthLmNsZWFuVXAoKX0pO2Euby5oaWRlLmNhbGwoYSxmLGcpO3JldHVybiBhfTthLmNsZWFuVXA9XHJcbmZ1bmN0aW9uKCl7Zy5hZGQoZikucmVtb3ZlKCk7Zj1nPXZvaWQgMDtiKHQpLnVuYmluZChcInJlc2l6ZVwiLGEuY2VudGVyKTthLm8uaGlkZUZsYXNoJiZiKFwib2JqZWN0LCBlbWJlZFwiKS5jc3MoXCJ2aXNpYmlsaXR5XCIsXCJ2aXNpYmxlXCIpO2EuZWxlJiZhLm8uYWN0aXZlQ2xhc3MmJmIoYS5lbGUpLnJlbW92ZUNsYXNzKGEuby5hY3RpdmVDbGFzcyk7dmFyIGM9YihcIi5cIithLm8ucG9wdXBQbGFjZWhvbGRlckNsYXNzKTtcImlubGluZVwiPT1sJiZjLmxlbmd0aCYmYy5odG1sKHMpLnJlbW92ZUNsYXNzKGEuby5wb3B1cFBsYWNlaG9sZGVyQ2xhc3MpO2w9bnVsbDthLm8uYWZ0ZXJDbG9zZS5jYWxsKGEpO3JldHVybiBhfTthLmNlbnRlcj1mdW5jdGlvbigpe2YuY3NzKGEuZ2V0Q2VudGVyKCkpO2cuY3NzKHtoZWlnaHQ6ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodH0pO3JldHVybiBhfTthLmdldENlbnRlcj1mdW5jdGlvbigpe3ZhciBhPWYuY2hpbGRyZW4oKS5vdXRlcldpZHRoKCEwKSxcclxuYj1mLmNoaWxkcmVuKCkub3V0ZXJIZWlnaHQoITApO3JldHVybnt0b3A6LjUqZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodC0uNSpiLGxlZnQ6LjUqZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoLS41KmF9fX19KShqUXVlcnksd2luZG93KTsiLCI7KGZ1bmN0aW9uICggJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkICkge1xyXG5cclxuICAvKipcclxuICAgKiBhbmltbyBpcyBhIHBvd2VyZnVsIGxpdHRsZSB0b29sIHRoYXQgbWFrZXMgbWFuYWdpbmcgQ1NTIGFuaW1hdGlvbnMgZXh0cmVtZWx5IGVhc3kuIFN0YWNrIGFuaW1hdGlvbnMsIHNldCBjYWxsYmFja3MsIG1ha2UgbWFnaWMuXHJcbiAgICogTW9kZXJuIGJyb3dzZXJzIGFuZCBhbG1vc3QgYWxsIG1vYmlsZSBicm93c2VycyBzdXBwb3J0IENTUyBhbmltYXRpb25zIChodHRwOi8vY2FuaXVzZS5jb20vY3NzLWFuaW1hdGlvbikuXHJcbiAgICpcclxuICAgKiBAYXV0aG9yIERhbmllbCBSYWZ0ZXJ5IDogdHdpdHRlci9UaHJpdmluZ0tpbmdzXHJcbiAgICogQHZlcnNpb24gMS4wLjFcclxuICAqL1xyXG4gIGZ1bmN0aW9uIGFuaW1vKCBlbGVtZW50LCBvcHRpb25zLCBjYWxsYmFjaywgb3RoZXJfY2IgKSB7XHJcbiAgICBcclxuICAgIC8vIERlZmF1bHQgY29uZmlndXJhdGlvblxyXG4gICAgdmFyIGRlZmF1bHRzID0ge1xyXG4gICAgXHRkdXJhdGlvbjogMSxcclxuICAgIFx0YW5pbWF0aW9uOiBudWxsLFxyXG4gICAgXHRpdGVyYXRlOiAxLFxyXG4gICAgXHR0aW1pbmc6IFwibGluZWFyXCIsXHJcbiAgICAgIGtlZXA6IGZhbHNlXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEJyb3dzZXIgcHJlZml4ZXMgZm9yIENTU1xyXG4gICAgdGhpcy5wcmVmaXhlcyA9IFtcIlwiLCBcIi1tb3otXCIsIFwiLW8tYW5pbWF0aW9uLVwiLCBcIi13ZWJraXQtXCJdO1xyXG5cclxuICAgIC8vIENhY2hlIHRoZSBlbGVtZW50XHJcbiAgICB0aGlzLmVsZW1lbnQgPSAkKGVsZW1lbnQpO1xyXG5cclxuICAgIHRoaXMuYmFyZSA9IGVsZW1lbnQ7XHJcblxyXG4gICAgLy8gRm9yIHN0YWNraW5nIG9mIGFuaW1hdGlvbnNcclxuICAgIHRoaXMucXVldWUgPSBbXTtcclxuXHJcbiAgICAvLyBIYWNreVxyXG4gICAgdGhpcy5saXN0ZW5pbmcgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBGaWd1cmUgb3V0IHdoZXJlIHRoZSBjYWxsYmFjayBpc1xyXG4gICAgdmFyIGNiID0gKHR5cGVvZiBjYWxsYmFjayA9PSBcImZ1bmN0aW9uXCIgPyBjYWxsYmFjayA6IG90aGVyX2NiKTtcclxuXHJcbiAgICAvLyBPcHRpb25zIGNhbiBzb21ldGltZXMgYmUgYSBjb21tYW5kXHJcbiAgICBzd2l0Y2gob3B0aW9ucykge1xyXG5cclxuICAgICAgY2FzZSBcImJsdXJcIjpcclxuXHJcbiAgICAgIFx0ZGVmYXVsdHMgPSB7XHJcbiAgICAgIFx0XHRhbW91bnQ6IDMsXHJcbiAgICAgIFx0XHRkdXJhdGlvbjogMC41LFxyXG4gICAgICBcdFx0Zm9jdXNBZnRlcjogbnVsbFxyXG4gICAgICBcdH07XHJcblxyXG4gICAgICBcdHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKCBkZWZhdWx0cywgY2FsbGJhY2sgKTtcclxuXHJcbiAgXHQgICAgdGhpcy5fYmx1cihjYik7XHJcblxyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSBcImZvY3VzXCI6XHJcblxyXG4gIFx0ICBcdHRoaXMuX2ZvY3VzKCk7XHJcblxyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSBcInJvdGF0ZVwiOlxyXG5cclxuICAgICAgICBkZWZhdWx0cyA9IHtcclxuICAgICAgICAgIGRlZ3JlZXM6IDE1LFxyXG4gICAgICAgICAgZHVyYXRpb246IDAuNVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKCBkZWZhdWx0cywgY2FsbGJhY2sgKTtcclxuXHJcbiAgICAgICAgdGhpcy5fcm90YXRlKGNiKTtcclxuXHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIFwiY2xlYW5zZVwiOlxyXG5cclxuICAgICAgICB0aGlzLmNsZWFuc2UoKTtcclxuXHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBkZWZhdWx0OlxyXG5cclxuXHQgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoIGRlZmF1bHRzLCBvcHRpb25zICk7XHJcblxyXG5cdCAgICB0aGlzLmluaXQoY2IpO1xyXG4gIFx0XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYW5pbW8ucHJvdG90eXBlID0ge1xyXG5cclxuICAgIC8vIEEgc3RhbmRhcmQgQ1NTIGFuaW1hdGlvblxyXG4gICAgaW5pdDogZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuICAgICAgXHJcbiAgICAgIHZhciAkbWUgPSB0aGlzO1xyXG5cclxuICAgICAgLy8gQXJlIHdlIHN0YWNraW5nIGFuaW1hdGlvbnM/XHJcbiAgICAgIGlmKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCggJG1lLm9wdGlvbnMuYW5pbWF0aW9uICkgPT09ICdbb2JqZWN0IEFycmF5XScpIHtcclxuICAgICAgXHQkLm1lcmdlKCRtZS5xdWV1ZSwgJG1lLm9wdGlvbnMuYW5pbWF0aW9uKTtcclxuICAgICAgfSBlbHNlIHtcclxuXHQgICAgICAkbWUucXVldWUucHVzaCgkbWUub3B0aW9ucy5hbmltYXRpb24pO1xyXG5cdCAgICB9XHJcblxyXG5cdCAgICAkbWUuY2xlYW5zZSgpO1xyXG5cclxuXHQgICAgJG1lLmFuaW1hdGUoY2FsbGJhY2spO1xyXG4gICAgICBcclxuICAgIH0sXHJcblxyXG4gICAgLy8gVGhlIGFjdHVhbCBhZGRpbmcgb2YgdGhlIGNsYXNzIGFuZCBsaXN0ZW5pbmcgZm9yIGNvbXBsZXRpb25cclxuICAgIGFuaW1hdGU6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcblxyXG4gICAgXHR0aGlzLmVsZW1lbnQuYWRkQ2xhc3MoJ2FuaW1hdGVkJyk7XHJcblxyXG4gICAgICB0aGlzLmVsZW1lbnQuYWRkQ2xhc3ModGhpcy5xdWV1ZVswXSk7XHJcblxyXG4gICAgICB0aGlzLmVsZW1lbnQuZGF0YShcImFuaW1vXCIsIHRoaXMucXVldWVbMF0pO1xyXG5cclxuICAgICAgdmFyIGFpID0gdGhpcy5wcmVmaXhlcy5sZW5ndGg7XHJcblxyXG4gICAgICAvLyBBZGQgdGhlIG9wdGlvbnMgZm9yIGVhY2ggcHJlZml4XHJcbiAgICAgIHdoaWxlKGFpLS0pIHtcclxuXHJcbiAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcImFuaW1hdGlvbi1kdXJhdGlvblwiLCB0aGlzLm9wdGlvbnMuZHVyYXRpb24rXCJzXCIpO1xyXG5cclxuICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiYW5pbWF0aW9uLWl0ZXJhdGlvbi1jb3VudFwiLCB0aGlzLm9wdGlvbnMuaXRlcmF0ZSk7XHJcblxyXG4gICAgICBcdHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJhbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uXCIsIHRoaXMub3B0aW9ucy50aW1pbmcpO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyICRtZSA9IHRoaXMsIF9jYiA9IGNhbGxiYWNrO1xyXG5cclxuICAgICAgaWYoJG1lLnF1ZXVlLmxlbmd0aD4xKSB7XHJcbiAgICAgICAgX2NiID0gbnVsbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gTGlzdGVuIGZvciB0aGUgZW5kIG9mIHRoZSBhbmltYXRpb25cclxuICAgICAgdGhpcy5fZW5kKFwiQW5pbWF0aW9uRW5kXCIsIGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAvLyBJZiB0aGVyZSBhcmUgbW9yZSwgY2xlYW4gaXQgdXAgYW5kIG1vdmUgb25cclxuICAgICAgXHRpZigkbWUuZWxlbWVudC5oYXNDbGFzcygkbWUucXVldWVbMF0pKSB7XHJcblxyXG5cdCAgICBcdFx0aWYoISRtZS5vcHRpb25zLmtlZXApIHtcclxuICAgICAgICAgICAgJG1lLmNsZWFuc2UoKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAkbWUucXVldWUuc2hpZnQoKTtcclxuXHJcblx0ICAgIFx0XHRpZigkbWUucXVldWUubGVuZ3RoKSB7XHJcblxyXG5cdFx0ICAgICAgXHQkbWUuYW5pbWF0ZShjYWxsYmFjayk7XHJcblx0XHQgICAgICB9XHJcblx0XHRcdCAgfVxyXG5cdFx0ICB9LCBfY2IpO1xyXG4gICAgfSxcclxuXHJcbiAgICBjbGVhbnNlOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBcdHRoaXMuZWxlbWVudC5yZW1vdmVDbGFzcygnYW5pbWF0ZWQnKTtcclxuXHJcbiAgXHRcdHRoaXMuZWxlbWVudC5yZW1vdmVDbGFzcyh0aGlzLnF1ZXVlWzBdKTtcclxuXHJcbiAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVDbGFzcyh0aGlzLmVsZW1lbnQuZGF0YShcImFuaW1vXCIpKTtcclxuXHJcbiAgXHRcdHZhciBhaSA9IHRoaXMucHJlZml4ZXMubGVuZ3RoO1xyXG5cclxuICBcdFx0d2hpbGUoYWktLSkge1xyXG5cclxuICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiYW5pbWF0aW9uLWR1cmF0aW9uXCIsIFwiXCIpO1xyXG5cclxuICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiYW5pbWF0aW9uLWl0ZXJhdGlvbi1jb3VudFwiLCBcIlwiKTtcclxuXHJcbiAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcImFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb25cIiwgXCJcIik7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJ0cmFuc2l0aW9uXCIsIFwiXCIpO1xyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1widHJhbnNmb3JtXCIsIFwiXCIpO1xyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiZmlsdGVyXCIsIFwiXCIpO1xyXG5cclxuICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfYmx1cjogZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuXHJcbiAgICAgIGlmKHRoaXMuZWxlbWVudC5pcyhcImltZ1wiKSkge1xyXG5cclxuICAgICAgXHR2YXIgc3ZnX2lkID0gXCJzdmdfXCIgKyAoKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwMDApIHwgMCkudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKTtcclxuICAgICAgXHR2YXIgZmlsdGVyX2lkID0gXCJmaWx0ZXJfXCIgKyAoKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwMDApIHwgMCkudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKTtcclxuXHJcbiAgICAgIFx0JCgnYm9keScpLmFwcGVuZCgnPHN2ZyB2ZXJzaW9uPVwiMS4xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIGlkPVwiJytzdmdfaWQrJ1wiIHN0eWxlPVwiaGVpZ2h0OjA7XCI+PGZpbHRlciBpZD1cIicrZmlsdGVyX2lkKydcIj48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPVwiJyt0aGlzLm9wdGlvbnMuYW1vdW50KydcIiAvPjwvZmlsdGVyPjwvc3ZnPicpO1xyXG5cclxuICAgICAgXHR2YXIgYWkgPSB0aGlzLnByZWZpeGVzLmxlbmd0aDtcclxuXHJcbiAgICBcdFx0d2hpbGUoYWktLSkge1xyXG5cclxuICAgICAgICBcdHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJmaWx0ZXJcIiwgXCJibHVyKFwiK3RoaXMub3B0aW9ucy5hbW91bnQrXCJweClcIik7XHJcblxyXG4gICAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcInRyYW5zaXRpb25cIiwgdGhpcy5vcHRpb25zLmR1cmF0aW9uK1wicyBhbGwgbGluZWFyXCIpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3MoXCJmaWx0ZXJcIiwgXCJ1cmwoI1wiK2ZpbHRlcl9pZCtcIilcIik7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5kYXRhKFwic3ZnaWRcIiwgc3ZnX2lkKTtcclxuICAgICAgXHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIHZhciBjb2xvciA9IHRoaXMuZWxlbWVudC5jc3MoJ2NvbG9yJyk7XHJcblxyXG4gICAgICAgIHZhciBhaSA9IHRoaXMucHJlZml4ZXMubGVuZ3RoO1xyXG5cclxuICAgICAgICAvLyBBZGQgdGhlIG9wdGlvbnMgZm9yIGVhY2ggcHJlZml4XHJcbiAgICAgICAgd2hpbGUoYWktLSkge1xyXG5cclxuICAgICAgICAgIHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJ0cmFuc2l0aW9uXCIsIFwiYWxsIFwiK3RoaXMub3B0aW9ucy5kdXJhdGlvbitcInMgbGluZWFyXCIpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3MoXCJ0ZXh0LXNoYWRvd1wiLCBcIjAgMCBcIit0aGlzLm9wdGlvbnMuYW1vdW50K1wicHggXCIrY29sb3IpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3MoXCJjb2xvclwiLCBcInRyYW5zcGFyZW50XCIpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLl9lbmQoXCJUcmFuc2l0aW9uRW5kXCIsIG51bGwsIGNhbGxiYWNrKTtcclxuXHJcbiAgICAgIHZhciAkbWUgPSB0aGlzO1xyXG5cclxuICAgICAgaWYodGhpcy5vcHRpb25zLmZvY3VzQWZ0ZXIpIHtcclxuXHJcbiAgICAgICAgdmFyIGZvY3VzX3dhaXQgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAkbWUuX2ZvY3VzKCk7XHJcblxyXG4gICAgICAgICAgZm9jdXNfd2FpdCA9IHdpbmRvdy5jbGVhclRpbWVvdXQoZm9jdXNfd2FpdCk7XHJcblxyXG4gICAgICAgIH0sICh0aGlzLm9wdGlvbnMuZm9jdXNBZnRlcioxMDAwKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIF9mb2N1czogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgXHR2YXIgYWkgPSB0aGlzLnByZWZpeGVzLmxlbmd0aDtcclxuXHJcbiAgICAgIGlmKHRoaXMuZWxlbWVudC5pcyhcImltZ1wiKSkge1xyXG5cclxuICAgIFx0XHR3aGlsZShhaS0tKSB7XHJcblxyXG4gICAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcImZpbHRlclwiLCBcIlwiKTtcclxuXHJcbiAgICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1widHJhbnNpdGlvblwiLCBcIlwiKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgJHN2ZyA9ICQoJyMnK3RoaXMuZWxlbWVudC5kYXRhKCdzdmdpZCcpKTtcclxuXHJcbiAgICAgICAgJHN2Zy5yZW1vdmUoKTtcclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgd2hpbGUoYWktLSkge1xyXG5cclxuICAgICAgICAgIHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJ0cmFuc2l0aW9uXCIsIFwiXCIpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3MoXCJ0ZXh0LXNoYWRvd1wiLCBcIlwiKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKFwiY29sb3JcIiwgXCJcIik7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX3JvdGF0ZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuXHJcbiAgICAgIHZhciBhaSA9IHRoaXMucHJlZml4ZXMubGVuZ3RoO1xyXG5cclxuICAgICAgLy8gQWRkIHRoZSBvcHRpb25zIGZvciBlYWNoIHByZWZpeFxyXG4gICAgICB3aGlsZShhaS0tKSB7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJ0cmFuc2l0aW9uXCIsIFwiYWxsIFwiK3RoaXMub3B0aW9ucy5kdXJhdGlvbitcInMgbGluZWFyXCIpO1xyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1widHJhbnNmb3JtXCIsIFwicm90YXRlKFwiK3RoaXMub3B0aW9ucy5kZWdyZWVzK1wiZGVnKVwiKTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuX2VuZChcIlRyYW5zaXRpb25FbmRcIiwgbnVsbCwgY2FsbGJhY2spO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgX2VuZDogZnVuY3Rpb24odHlwZSwgdG9kbywgY2FsbGJhY2spIHtcclxuXHJcbiAgICAgIHZhciAkbWUgPSB0aGlzO1xyXG5cclxuICAgICAgdmFyIGJpbmRpbmcgPSB0eXBlLnRvTG93ZXJDYXNlKCkrXCIgd2Via2l0XCIrdHlwZStcIiBvXCIrdHlwZStcIiBNU1wiK3R5cGU7XHJcblxyXG4gICAgICB0aGlzLmVsZW1lbnQuYmluZChiaW5kaW5nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBcclxuICAgICAgICAkbWUuZWxlbWVudC51bmJpbmQoYmluZGluZyk7XHJcblxyXG4gICAgICAgIGlmKHR5cGVvZiB0b2RvID09IFwiZnVuY3Rpb25cIikge1xyXG5cclxuICAgICAgICAgIHRvZG8oKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHR5cGVvZiBjYWxsYmFjayA9PSBcImZ1bmN0aW9uXCIpIHtcclxuXHJcbiAgICAgICAgICBjYWxsYmFjaygkbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIFxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gICQuZm4uYW5pbW8gPSBmdW5jdGlvbiAoIG9wdGlvbnMsIGNhbGxiYWNrLCBvdGhlcl9jYiApIHtcclxuICAgIFxyXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHJcblx0XHRcdG5ldyBhbmltbyggdGhpcywgb3B0aW9ucywgY2FsbGJhY2ssIG90aGVyX2NiICk7XHJcblxyXG5cdFx0fSk7XHJcblxyXG4gIH07XHJcblxyXG59KSggalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50ICk7IiwiLyohXHJcbldheXBvaW50cyAtIDMuMS4xXHJcbkNvcHlyaWdodCDCqSAyMDExLTIwMTUgQ2FsZWIgVHJvdWdodG9uXHJcbkxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cclxuaHR0cHM6Ly9naXRodWIuY29tL2ltYWtld2VidGhpbmdzL3dheXBvaW50cy9ibG9nL21hc3Rlci9saWNlbnNlcy50eHRcclxuKi9cclxuIWZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gdChvKXtpZighbyl0aHJvdyBuZXcgRXJyb3IoXCJObyBvcHRpb25zIHBhc3NlZCB0byBXYXlwb2ludCBjb25zdHJ1Y3RvclwiKTtpZighby5lbGVtZW50KXRocm93IG5ldyBFcnJvcihcIk5vIGVsZW1lbnQgb3B0aW9uIHBhc3NlZCB0byBXYXlwb2ludCBjb25zdHJ1Y3RvclwiKTtpZighby5oYW5kbGVyKXRocm93IG5ldyBFcnJvcihcIk5vIGhhbmRsZXIgb3B0aW9uIHBhc3NlZCB0byBXYXlwb2ludCBjb25zdHJ1Y3RvclwiKTt0aGlzLmtleT1cIndheXBvaW50LVwiK2UsdGhpcy5vcHRpb25zPXQuQWRhcHRlci5leHRlbmQoe30sdC5kZWZhdWx0cyxvKSx0aGlzLmVsZW1lbnQ9dGhpcy5vcHRpb25zLmVsZW1lbnQsdGhpcy5hZGFwdGVyPW5ldyB0LkFkYXB0ZXIodGhpcy5lbGVtZW50KSx0aGlzLmNhbGxiYWNrPW8uaGFuZGxlcix0aGlzLmF4aXM9dGhpcy5vcHRpb25zLmhvcml6b250YWw/XCJob3Jpem9udGFsXCI6XCJ2ZXJ0aWNhbFwiLHRoaXMuZW5hYmxlZD10aGlzLm9wdGlvbnMuZW5hYmxlZCx0aGlzLnRyaWdnZXJQb2ludD1udWxsLHRoaXMuZ3JvdXA9dC5Hcm91cC5maW5kT3JDcmVhdGUoe25hbWU6dGhpcy5vcHRpb25zLmdyb3VwLGF4aXM6dGhpcy5heGlzfSksdGhpcy5jb250ZXh0PXQuQ29udGV4dC5maW5kT3JDcmVhdGVCeUVsZW1lbnQodGhpcy5vcHRpb25zLmNvbnRleHQpLHQub2Zmc2V0QWxpYXNlc1t0aGlzLm9wdGlvbnMub2Zmc2V0XSYmKHRoaXMub3B0aW9ucy5vZmZzZXQ9dC5vZmZzZXRBbGlhc2VzW3RoaXMub3B0aW9ucy5vZmZzZXRdKSx0aGlzLmdyb3VwLmFkZCh0aGlzKSx0aGlzLmNvbnRleHQuYWRkKHRoaXMpLGlbdGhpcy5rZXldPXRoaXMsZSs9MX12YXIgZT0wLGk9e307dC5wcm90b3R5cGUucXVldWVUcmlnZ2VyPWZ1bmN0aW9uKHQpe3RoaXMuZ3JvdXAucXVldWVUcmlnZ2VyKHRoaXMsdCl9LHQucHJvdG90eXBlLnRyaWdnZXI9ZnVuY3Rpb24odCl7dGhpcy5lbmFibGVkJiZ0aGlzLmNhbGxiYWNrJiZ0aGlzLmNhbGxiYWNrLmFwcGx5KHRoaXMsdCl9LHQucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLmNvbnRleHQucmVtb3ZlKHRoaXMpLHRoaXMuZ3JvdXAucmVtb3ZlKHRoaXMpLGRlbGV0ZSBpW3RoaXMua2V5XX0sdC5wcm90b3R5cGUuZGlzYWJsZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLmVuYWJsZWQ9ITEsdGhpc30sdC5wcm90b3R5cGUuZW5hYmxlPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuY29udGV4dC5yZWZyZXNoKCksdGhpcy5lbmFibGVkPSEwLHRoaXN9LHQucHJvdG90eXBlLm5leHQ9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5ncm91cC5uZXh0KHRoaXMpfSx0LnByb3RvdHlwZS5wcmV2aW91cz1mdW5jdGlvbigpe3JldHVybiB0aGlzLmdyb3VwLnByZXZpb3VzKHRoaXMpfSx0Lmludm9rZUFsbD1mdW5jdGlvbih0KXt2YXIgZT1bXTtmb3IodmFyIG8gaW4gaSllLnB1c2goaVtvXSk7Zm9yKHZhciBuPTAscj1lLmxlbmd0aDtyPm47bisrKWVbbl1bdF0oKX0sdC5kZXN0cm95QWxsPWZ1bmN0aW9uKCl7dC5pbnZva2VBbGwoXCJkZXN0cm95XCIpfSx0LmRpc2FibGVBbGw9ZnVuY3Rpb24oKXt0Lmludm9rZUFsbChcImRpc2FibGVcIil9LHQuZW5hYmxlQWxsPWZ1bmN0aW9uKCl7dC5pbnZva2VBbGwoXCJlbmFibGVcIil9LHQucmVmcmVzaEFsbD1mdW5jdGlvbigpe3QuQ29udGV4dC5yZWZyZXNoQWxsKCl9LHQudmlld3BvcnRIZWlnaHQ9ZnVuY3Rpb24oKXtyZXR1cm4gd2luZG93LmlubmVySGVpZ2h0fHxkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0fSx0LnZpZXdwb3J0V2lkdGg9ZnVuY3Rpb24oKXtyZXR1cm4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRofSx0LmFkYXB0ZXJzPVtdLHQuZGVmYXVsdHM9e2NvbnRleHQ6d2luZG93LGNvbnRpbnVvdXM6ITAsZW5hYmxlZDohMCxncm91cDpcImRlZmF1bHRcIixob3Jpem9udGFsOiExLG9mZnNldDowfSx0Lm9mZnNldEFsaWFzZXM9e1wiYm90dG9tLWluLXZpZXdcIjpmdW5jdGlvbigpe3JldHVybiB0aGlzLmNvbnRleHQuaW5uZXJIZWlnaHQoKS10aGlzLmFkYXB0ZXIub3V0ZXJIZWlnaHQoKX0sXCJyaWdodC1pbi12aWV3XCI6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5jb250ZXh0LmlubmVyV2lkdGgoKS10aGlzLmFkYXB0ZXIub3V0ZXJXaWR0aCgpfX0sd2luZG93LldheXBvaW50PXR9KCksZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiB0KHQpe3dpbmRvdy5zZXRUaW1lb3V0KHQsMWUzLzYwKX1mdW5jdGlvbiBlKHQpe3RoaXMuZWxlbWVudD10LHRoaXMuQWRhcHRlcj1uLkFkYXB0ZXIsdGhpcy5hZGFwdGVyPW5ldyB0aGlzLkFkYXB0ZXIodCksdGhpcy5rZXk9XCJ3YXlwb2ludC1jb250ZXh0LVwiK2ksdGhpcy5kaWRTY3JvbGw9ITEsdGhpcy5kaWRSZXNpemU9ITEsdGhpcy5vbGRTY3JvbGw9e3g6dGhpcy5hZGFwdGVyLnNjcm9sbExlZnQoKSx5OnRoaXMuYWRhcHRlci5zY3JvbGxUb3AoKX0sdGhpcy53YXlwb2ludHM9e3ZlcnRpY2FsOnt9LGhvcml6b250YWw6e319LHQud2F5cG9pbnRDb250ZXh0S2V5PXRoaXMua2V5LG9bdC53YXlwb2ludENvbnRleHRLZXldPXRoaXMsaSs9MSx0aGlzLmNyZWF0ZVRocm90dGxlZFNjcm9sbEhhbmRsZXIoKSx0aGlzLmNyZWF0ZVRocm90dGxlZFJlc2l6ZUhhbmRsZXIoKX12YXIgaT0wLG89e30sbj13aW5kb3cuV2F5cG9pbnQscj13aW5kb3cub25sb2FkO2UucHJvdG90eXBlLmFkZD1mdW5jdGlvbih0KXt2YXIgZT10Lm9wdGlvbnMuaG9yaXpvbnRhbD9cImhvcml6b250YWxcIjpcInZlcnRpY2FsXCI7dGhpcy53YXlwb2ludHNbZV1bdC5rZXldPXQsdGhpcy5yZWZyZXNoKCl9LGUucHJvdG90eXBlLmNoZWNrRW1wdHk9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLkFkYXB0ZXIuaXNFbXB0eU9iamVjdCh0aGlzLndheXBvaW50cy5ob3Jpem9udGFsKSxlPXRoaXMuQWRhcHRlci5pc0VtcHR5T2JqZWN0KHRoaXMud2F5cG9pbnRzLnZlcnRpY2FsKTt0JiZlJiYodGhpcy5hZGFwdGVyLm9mZihcIi53YXlwb2ludHNcIiksZGVsZXRlIG9bdGhpcy5rZXldKX0sZS5wcm90b3R5cGUuY3JlYXRlVGhyb3R0bGVkUmVzaXplSGFuZGxlcj1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoKXtlLmhhbmRsZVJlc2l6ZSgpLGUuZGlkUmVzaXplPSExfXZhciBlPXRoaXM7dGhpcy5hZGFwdGVyLm9uKFwicmVzaXplLndheXBvaW50c1wiLGZ1bmN0aW9uKCl7ZS5kaWRSZXNpemV8fChlLmRpZFJlc2l6ZT0hMCxuLnJlcXVlc3RBbmltYXRpb25GcmFtZSh0KSl9KX0sZS5wcm90b3R5cGUuY3JlYXRlVGhyb3R0bGVkU2Nyb2xsSGFuZGxlcj1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoKXtlLmhhbmRsZVNjcm9sbCgpLGUuZGlkU2Nyb2xsPSExfXZhciBlPXRoaXM7dGhpcy5hZGFwdGVyLm9uKFwic2Nyb2xsLndheXBvaW50c1wiLGZ1bmN0aW9uKCl7KCFlLmRpZFNjcm9sbHx8bi5pc1RvdWNoKSYmKGUuZGlkU2Nyb2xsPSEwLG4ucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHQpKX0pfSxlLnByb3RvdHlwZS5oYW5kbGVSZXNpemU9ZnVuY3Rpb24oKXtuLkNvbnRleHQucmVmcmVzaEFsbCgpfSxlLnByb3RvdHlwZS5oYW5kbGVTY3JvbGw9ZnVuY3Rpb24oKXt2YXIgdD17fSxlPXtob3Jpem9udGFsOntuZXdTY3JvbGw6dGhpcy5hZGFwdGVyLnNjcm9sbExlZnQoKSxvbGRTY3JvbGw6dGhpcy5vbGRTY3JvbGwueCxmb3J3YXJkOlwicmlnaHRcIixiYWNrd2FyZDpcImxlZnRcIn0sdmVydGljYWw6e25ld1Njcm9sbDp0aGlzLmFkYXB0ZXIuc2Nyb2xsVG9wKCksb2xkU2Nyb2xsOnRoaXMub2xkU2Nyb2xsLnksZm9yd2FyZDpcImRvd25cIixiYWNrd2FyZDpcInVwXCJ9fTtmb3IodmFyIGkgaW4gZSl7dmFyIG89ZVtpXSxuPW8ubmV3U2Nyb2xsPm8ub2xkU2Nyb2xsLHI9bj9vLmZvcndhcmQ6by5iYWNrd2FyZDtmb3IodmFyIHMgaW4gdGhpcy53YXlwb2ludHNbaV0pe3ZhciBhPXRoaXMud2F5cG9pbnRzW2ldW3NdLGw9by5vbGRTY3JvbGw8YS50cmlnZ2VyUG9pbnQsaD1vLm5ld1Njcm9sbD49YS50cmlnZ2VyUG9pbnQscD1sJiZoLHU9IWwmJiFoOyhwfHx1KSYmKGEucXVldWVUcmlnZ2VyKHIpLHRbYS5ncm91cC5pZF09YS5ncm91cCl9fWZvcih2YXIgYyBpbiB0KXRbY10uZmx1c2hUcmlnZ2VycygpO3RoaXMub2xkU2Nyb2xsPXt4OmUuaG9yaXpvbnRhbC5uZXdTY3JvbGwseTplLnZlcnRpY2FsLm5ld1Njcm9sbH19LGUucHJvdG90eXBlLmlubmVySGVpZ2h0PWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZWxlbWVudD09dGhpcy5lbGVtZW50LndpbmRvdz9uLnZpZXdwb3J0SGVpZ2h0KCk6dGhpcy5hZGFwdGVyLmlubmVySGVpZ2h0KCl9LGUucHJvdG90eXBlLnJlbW92ZT1mdW5jdGlvbih0KXtkZWxldGUgdGhpcy53YXlwb2ludHNbdC5heGlzXVt0LmtleV0sdGhpcy5jaGVja0VtcHR5KCl9LGUucHJvdG90eXBlLmlubmVyV2lkdGg9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5lbGVtZW50PT10aGlzLmVsZW1lbnQud2luZG93P24udmlld3BvcnRXaWR0aCgpOnRoaXMuYWRhcHRlci5pbm5lcldpZHRoKCl9LGUucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt2YXIgdD1bXTtmb3IodmFyIGUgaW4gdGhpcy53YXlwb2ludHMpZm9yKHZhciBpIGluIHRoaXMud2F5cG9pbnRzW2VdKXQucHVzaCh0aGlzLndheXBvaW50c1tlXVtpXSk7Zm9yKHZhciBvPTAsbj10Lmxlbmd0aDtuPm87bysrKXRbb10uZGVzdHJveSgpfSxlLnByb3RvdHlwZS5yZWZyZXNoPWZ1bmN0aW9uKCl7dmFyIHQsZT10aGlzLmVsZW1lbnQ9PXRoaXMuZWxlbWVudC53aW5kb3csaT10aGlzLmFkYXB0ZXIub2Zmc2V0KCksbz17fTt0aGlzLmhhbmRsZVNjcm9sbCgpLHQ9e2hvcml6b250YWw6e2NvbnRleHRPZmZzZXQ6ZT8wOmkubGVmdCxjb250ZXh0U2Nyb2xsOmU/MDp0aGlzLm9sZFNjcm9sbC54LGNvbnRleHREaW1lbnNpb246dGhpcy5pbm5lcldpZHRoKCksb2xkU2Nyb2xsOnRoaXMub2xkU2Nyb2xsLngsZm9yd2FyZDpcInJpZ2h0XCIsYmFja3dhcmQ6XCJsZWZ0XCIsb2Zmc2V0UHJvcDpcImxlZnRcIn0sdmVydGljYWw6e2NvbnRleHRPZmZzZXQ6ZT8wOmkudG9wLGNvbnRleHRTY3JvbGw6ZT8wOnRoaXMub2xkU2Nyb2xsLnksY29udGV4dERpbWVuc2lvbjp0aGlzLmlubmVySGVpZ2h0KCksb2xkU2Nyb2xsOnRoaXMub2xkU2Nyb2xsLnksZm9yd2FyZDpcImRvd25cIixiYWNrd2FyZDpcInVwXCIsb2Zmc2V0UHJvcDpcInRvcFwifX07Zm9yKHZhciBuIGluIHQpe3ZhciByPXRbbl07Zm9yKHZhciBzIGluIHRoaXMud2F5cG9pbnRzW25dKXt2YXIgYSxsLGgscCx1LGM9dGhpcy53YXlwb2ludHNbbl1bc10sZD1jLm9wdGlvbnMub2Zmc2V0LGY9Yy50cmlnZ2VyUG9pbnQsdz0wLHk9bnVsbD09ZjtjLmVsZW1lbnQhPT1jLmVsZW1lbnQud2luZG93JiYodz1jLmFkYXB0ZXIub2Zmc2V0KClbci5vZmZzZXRQcm9wXSksXCJmdW5jdGlvblwiPT10eXBlb2YgZD9kPWQuYXBwbHkoYyk6XCJzdHJpbmdcIj09dHlwZW9mIGQmJihkPXBhcnNlRmxvYXQoZCksYy5vcHRpb25zLm9mZnNldC5pbmRleE9mKFwiJVwiKT4tMSYmKGQ9TWF0aC5jZWlsKHIuY29udGV4dERpbWVuc2lvbipkLzEwMCkpKSxhPXIuY29udGV4dFNjcm9sbC1yLmNvbnRleHRPZmZzZXQsYy50cmlnZ2VyUG9pbnQ9dythLWQsbD1mPHIub2xkU2Nyb2xsLGg9Yy50cmlnZ2VyUG9pbnQ+PXIub2xkU2Nyb2xsLHA9bCYmaCx1PSFsJiYhaCwheSYmcD8oYy5xdWV1ZVRyaWdnZXIoci5iYWNrd2FyZCksb1tjLmdyb3VwLmlkXT1jLmdyb3VwKToheSYmdT8oYy5xdWV1ZVRyaWdnZXIoci5mb3J3YXJkKSxvW2MuZ3JvdXAuaWRdPWMuZ3JvdXApOnkmJnIub2xkU2Nyb2xsPj1jLnRyaWdnZXJQb2ludCYmKGMucXVldWVUcmlnZ2VyKHIuZm9yd2FyZCksb1tjLmdyb3VwLmlkXT1jLmdyb3VwKX19Zm9yKHZhciBnIGluIG8pb1tnXS5mbHVzaFRyaWdnZXJzKCk7cmV0dXJuIHRoaXN9LGUuZmluZE9yQ3JlYXRlQnlFbGVtZW50PWZ1bmN0aW9uKHQpe3JldHVybiBlLmZpbmRCeUVsZW1lbnQodCl8fG5ldyBlKHQpfSxlLnJlZnJlc2hBbGw9ZnVuY3Rpb24oKXtmb3IodmFyIHQgaW4gbylvW3RdLnJlZnJlc2goKX0sZS5maW5kQnlFbGVtZW50PWZ1bmN0aW9uKHQpe3JldHVybiBvW3Qud2F5cG9pbnRDb250ZXh0S2V5XX0sd2luZG93Lm9ubG9hZD1mdW5jdGlvbigpe3ImJnIoKSxlLnJlZnJlc2hBbGwoKX0sbi5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU9ZnVuY3Rpb24oZSl7dmFyIGk9d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZXx8dDtpLmNhbGwod2luZG93LGUpfSxuLkNvbnRleHQ9ZX0oKSxmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHQodCxlKXtyZXR1cm4gdC50cmlnZ2VyUG9pbnQtZS50cmlnZ2VyUG9pbnR9ZnVuY3Rpb24gZSh0LGUpe3JldHVybiBlLnRyaWdnZXJQb2ludC10LnRyaWdnZXJQb2ludH1mdW5jdGlvbiBpKHQpe3RoaXMubmFtZT10Lm5hbWUsdGhpcy5heGlzPXQuYXhpcyx0aGlzLmlkPXRoaXMubmFtZStcIi1cIit0aGlzLmF4aXMsdGhpcy53YXlwb2ludHM9W10sdGhpcy5jbGVhclRyaWdnZXJRdWV1ZXMoKSxvW3RoaXMuYXhpc11bdGhpcy5uYW1lXT10aGlzfXZhciBvPXt2ZXJ0aWNhbDp7fSxob3Jpem9udGFsOnt9fSxuPXdpbmRvdy5XYXlwb2ludDtpLnByb3RvdHlwZS5hZGQ9ZnVuY3Rpb24odCl7dGhpcy53YXlwb2ludHMucHVzaCh0KX0saS5wcm90b3R5cGUuY2xlYXJUcmlnZ2VyUXVldWVzPWZ1bmN0aW9uKCl7dGhpcy50cmlnZ2VyUXVldWVzPXt1cDpbXSxkb3duOltdLGxlZnQ6W10scmlnaHQ6W119fSxpLnByb3RvdHlwZS5mbHVzaFRyaWdnZXJzPWZ1bmN0aW9uKCl7Zm9yKHZhciBpIGluIHRoaXMudHJpZ2dlclF1ZXVlcyl7dmFyIG89dGhpcy50cmlnZ2VyUXVldWVzW2ldLG49XCJ1cFwiPT09aXx8XCJsZWZ0XCI9PT1pO28uc29ydChuP2U6dCk7Zm9yKHZhciByPTAscz1vLmxlbmd0aDtzPnI7cis9MSl7dmFyIGE9b1tyXTsoYS5vcHRpb25zLmNvbnRpbnVvdXN8fHI9PT1vLmxlbmd0aC0xKSYmYS50cmlnZ2VyKFtpXSl9fXRoaXMuY2xlYXJUcmlnZ2VyUXVldWVzKCl9LGkucHJvdG90eXBlLm5leHQ9ZnVuY3Rpb24oZSl7dGhpcy53YXlwb2ludHMuc29ydCh0KTt2YXIgaT1uLkFkYXB0ZXIuaW5BcnJheShlLHRoaXMud2F5cG9pbnRzKSxvPWk9PT10aGlzLndheXBvaW50cy5sZW5ndGgtMTtyZXR1cm4gbz9udWxsOnRoaXMud2F5cG9pbnRzW2krMV19LGkucHJvdG90eXBlLnByZXZpb3VzPWZ1bmN0aW9uKGUpe3RoaXMud2F5cG9pbnRzLnNvcnQodCk7dmFyIGk9bi5BZGFwdGVyLmluQXJyYXkoZSx0aGlzLndheXBvaW50cyk7cmV0dXJuIGk/dGhpcy53YXlwb2ludHNbaS0xXTpudWxsfSxpLnByb3RvdHlwZS5xdWV1ZVRyaWdnZXI9ZnVuY3Rpb24odCxlKXt0aGlzLnRyaWdnZXJRdWV1ZXNbZV0ucHVzaCh0KX0saS5wcm90b3R5cGUucmVtb3ZlPWZ1bmN0aW9uKHQpe3ZhciBlPW4uQWRhcHRlci5pbkFycmF5KHQsdGhpcy53YXlwb2ludHMpO2U+LTEmJnRoaXMud2F5cG9pbnRzLnNwbGljZShlLDEpfSxpLnByb3RvdHlwZS5maXJzdD1mdW5jdGlvbigpe3JldHVybiB0aGlzLndheXBvaW50c1swXX0saS5wcm90b3R5cGUubGFzdD1mdW5jdGlvbigpe3JldHVybiB0aGlzLndheXBvaW50c1t0aGlzLndheXBvaW50cy5sZW5ndGgtMV19LGkuZmluZE9yQ3JlYXRlPWZ1bmN0aW9uKHQpe3JldHVybiBvW3QuYXhpc11bdC5uYW1lXXx8bmV3IGkodCl9LG4uR3JvdXA9aX0oKSxmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHQodCl7dGhpcy4kZWxlbWVudD1lKHQpfXZhciBlPXdpbmRvdy5qUXVlcnksaT13aW5kb3cuV2F5cG9pbnQ7ZS5lYWNoKFtcImlubmVySGVpZ2h0XCIsXCJpbm5lcldpZHRoXCIsXCJvZmZcIixcIm9mZnNldFwiLFwib25cIixcIm91dGVySGVpZ2h0XCIsXCJvdXRlcldpZHRoXCIsXCJzY3JvbGxMZWZ0XCIsXCJzY3JvbGxUb3BcIl0sZnVuY3Rpb24oZSxpKXt0LnByb3RvdHlwZVtpXT1mdW5jdGlvbigpe3ZhciB0PUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7cmV0dXJuIHRoaXMuJGVsZW1lbnRbaV0uYXBwbHkodGhpcy4kZWxlbWVudCx0KX19KSxlLmVhY2goW1wiZXh0ZW5kXCIsXCJpbkFycmF5XCIsXCJpc0VtcHR5T2JqZWN0XCJdLGZ1bmN0aW9uKGksbyl7dFtvXT1lW29dfSksaS5hZGFwdGVycy5wdXNoKHtuYW1lOlwianF1ZXJ5XCIsQWRhcHRlcjp0fSksaS5BZGFwdGVyPXR9KCksZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiB0KHQpe3JldHVybiBmdW5jdGlvbigpe3ZhciBpPVtdLG89YXJndW1lbnRzWzBdO3JldHVybiB0LmlzRnVuY3Rpb24oYXJndW1lbnRzWzBdKSYmKG89dC5leHRlbmQoe30sYXJndW1lbnRzWzFdKSxvLmhhbmRsZXI9YXJndW1lbnRzWzBdKSx0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgbj10LmV4dGVuZCh7fSxvLHtlbGVtZW50OnRoaXN9KTtcInN0cmluZ1wiPT10eXBlb2Ygbi5jb250ZXh0JiYobi5jb250ZXh0PXQodGhpcykuY2xvc2VzdChuLmNvbnRleHQpWzBdKSxpLnB1c2gobmV3IGUobikpfSksaX19dmFyIGU9d2luZG93LldheXBvaW50O3dpbmRvdy5qUXVlcnkmJih3aW5kb3cualF1ZXJ5LmZuLndheXBvaW50PXQod2luZG93LmpRdWVyeSkpLHdpbmRvdy5aZXB0byYmKHdpbmRvdy5aZXB0by5mbi53YXlwb2ludD10KHdpbmRvdy5aZXB0bykpfSgpOyIsIi8qKiBBYnN0cmFjdCBiYXNlIGNsYXNzIGZvciBjb2xsZWN0aW9uIHBsdWdpbnMgdjEuMC4xLlxyXG5cdFdyaXR0ZW4gYnkgS2VpdGggV29vZCAoa2J3b29ke2F0fWlpbmV0LmNvbS5hdSkgRGVjZW1iZXIgMjAxMy5cclxuXHRMaWNlbnNlZCB1bmRlciB0aGUgTUlUIChodHRwOi8va2VpdGgtd29vZC5uYW1lL2xpY2VuY2UuaHRtbCkgbGljZW5zZS4gKi9cclxuKGZ1bmN0aW9uKCl7dmFyIGo9ZmFsc2U7d2luZG93LkpRQ2xhc3M9ZnVuY3Rpb24oKXt9O0pRQ2xhc3MuY2xhc3Nlcz17fTtKUUNsYXNzLmV4dGVuZD1mdW5jdGlvbiBleHRlbmRlcihmKXt2YXIgZz10aGlzLnByb3RvdHlwZTtqPXRydWU7dmFyIGg9bmV3IHRoaXMoKTtqPWZhbHNlO2Zvcih2YXIgaSBpbiBmKXtoW2ldPXR5cGVvZiBmW2ldPT0nZnVuY3Rpb24nJiZ0eXBlb2YgZ1tpXT09J2Z1bmN0aW9uJz8oZnVuY3Rpb24oZCxlKXtyZXR1cm4gZnVuY3Rpb24oKXt2YXIgYj10aGlzLl9zdXBlcjt0aGlzLl9zdXBlcj1mdW5jdGlvbihhKXtyZXR1cm4gZ1tkXS5hcHBseSh0aGlzLGF8fFtdKX07dmFyIGM9ZS5hcHBseSh0aGlzLGFyZ3VtZW50cyk7dGhpcy5fc3VwZXI9YjtyZXR1cm4gY319KShpLGZbaV0pOmZbaV19ZnVuY3Rpb24gSlFDbGFzcygpe2lmKCFqJiZ0aGlzLl9pbml0KXt0aGlzLl9pbml0LmFwcGx5KHRoaXMsYXJndW1lbnRzKX19SlFDbGFzcy5wcm90b3R5cGU9aDtKUUNsYXNzLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1KUUNsYXNzO0pRQ2xhc3MuZXh0ZW5kPWV4dGVuZGVyO3JldHVybiBKUUNsYXNzfX0pKCk7KGZ1bmN0aW9uKCQpe0pRQ2xhc3MuY2xhc3Nlcy5KUVBsdWdpbj1KUUNsYXNzLmV4dGVuZCh7bmFtZToncGx1Z2luJyxkZWZhdWx0T3B0aW9uczp7fSxyZWdpb25hbE9wdGlvbnM6e30sX2dldHRlcnM6W10sX2dldE1hcmtlcjpmdW5jdGlvbigpe3JldHVybidpcy0nK3RoaXMubmFtZX0sX2luaXQ6ZnVuY3Rpb24oKXskLmV4dGVuZCh0aGlzLmRlZmF1bHRPcHRpb25zLCh0aGlzLnJlZ2lvbmFsT3B0aW9ucyYmdGhpcy5yZWdpb25hbE9wdGlvbnNbJyddKXx8e30pO3ZhciBjPWNhbWVsQ2FzZSh0aGlzLm5hbWUpOyRbY109dGhpczskLmZuW2NdPWZ1bmN0aW9uKGEpe3ZhciBiPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywxKTtpZigkW2NdLl9pc05vdENoYWluZWQoYSxiKSl7cmV0dXJuICRbY11bYV0uYXBwbHkoJFtjXSxbdGhpc1swXV0uY29uY2F0KGIpKX1yZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7aWYodHlwZW9mIGE9PT0nc3RyaW5nJyl7aWYoYVswXT09PSdfJ3x8ISRbY11bYV0pe3Rocm93J1Vua25vd24gbWV0aG9kOiAnK2E7fSRbY11bYV0uYXBwbHkoJFtjXSxbdGhpc10uY29uY2F0KGIpKX1lbHNleyRbY10uX2F0dGFjaCh0aGlzLGEpfX0pfX0sc2V0RGVmYXVsdHM6ZnVuY3Rpb24oYSl7JC5leHRlbmQodGhpcy5kZWZhdWx0T3B0aW9ucyxhfHx7fSl9LF9pc05vdENoYWluZWQ6ZnVuY3Rpb24oYSxiKXtpZihhPT09J29wdGlvbicmJihiLmxlbmd0aD09PTB8fChiLmxlbmd0aD09PTEmJnR5cGVvZiBiWzBdPT09J3N0cmluZycpKSl7cmV0dXJuIHRydWV9cmV0dXJuICQuaW5BcnJheShhLHRoaXMuX2dldHRlcnMpPi0xfSxfYXR0YWNoOmZ1bmN0aW9uKGEsYil7YT0kKGEpO2lmKGEuaGFzQ2xhc3ModGhpcy5fZ2V0TWFya2VyKCkpKXtyZXR1cm59YS5hZGRDbGFzcyh0aGlzLl9nZXRNYXJrZXIoKSk7Yj0kLmV4dGVuZCh7fSx0aGlzLmRlZmF1bHRPcHRpb25zLHRoaXMuX2dldE1ldGFkYXRhKGEpLGJ8fHt9KTt2YXIgYz0kLmV4dGVuZCh7bmFtZTp0aGlzLm5hbWUsZWxlbTphLG9wdGlvbnM6Yn0sdGhpcy5faW5zdFNldHRpbmdzKGEsYikpO2EuZGF0YSh0aGlzLm5hbWUsYyk7dGhpcy5fcG9zdEF0dGFjaChhLGMpO3RoaXMub3B0aW9uKGEsYil9LF9pbnN0U2V0dGluZ3M6ZnVuY3Rpb24oYSxiKXtyZXR1cm57fX0sX3Bvc3RBdHRhY2g6ZnVuY3Rpb24oYSxiKXt9LF9nZXRNZXRhZGF0YTpmdW5jdGlvbihkKXt0cnl7dmFyIGY9ZC5kYXRhKHRoaXMubmFtZS50b0xvd2VyQ2FzZSgpKXx8Jyc7Zj1mLnJlcGxhY2UoLycvZywnXCInKTtmPWYucmVwbGFjZSgvKFthLXpBLVowLTldKyk6L2csZnVuY3Rpb24oYSxiLGkpe3ZhciBjPWYuc3Vic3RyaW5nKDAsaSkubWF0Y2goL1wiL2cpO3JldHVybighY3x8Yy5sZW5ndGglMj09PTA/J1wiJytiKydcIjonOmIrJzonKX0pO2Y9JC5wYXJzZUpTT04oJ3snK2YrJ30nKTtmb3IodmFyIGcgaW4gZil7dmFyIGg9ZltnXTtpZih0eXBlb2YgaD09PSdzdHJpbmcnJiZoLm1hdGNoKC9ebmV3IERhdGVcXCgoLiopXFwpJC8pKXtmW2ddPWV2YWwoaCl9fXJldHVybiBmfWNhdGNoKGUpe3JldHVybnt9fX0sX2dldEluc3Q6ZnVuY3Rpb24oYSl7cmV0dXJuICQoYSkuZGF0YSh0aGlzLm5hbWUpfHx7fX0sb3B0aW9uOmZ1bmN0aW9uKGEsYixjKXthPSQoYSk7dmFyIGQ9YS5kYXRhKHRoaXMubmFtZSk7aWYoIWJ8fCh0eXBlb2YgYj09PSdzdHJpbmcnJiZjPT1udWxsKSl7dmFyIGU9KGR8fHt9KS5vcHRpb25zO3JldHVybihlJiZiP2VbYl06ZSl9aWYoIWEuaGFzQ2xhc3ModGhpcy5fZ2V0TWFya2VyKCkpKXtyZXR1cm59dmFyIGU9Ynx8e307aWYodHlwZW9mIGI9PT0nc3RyaW5nJyl7ZT17fTtlW2JdPWN9dGhpcy5fb3B0aW9uc0NoYW5nZWQoYSxkLGUpOyQuZXh0ZW5kKGQub3B0aW9ucyxlKX0sX29wdGlvbnNDaGFuZ2VkOmZ1bmN0aW9uKGEsYixjKXt9LGRlc3Ryb3k6ZnVuY3Rpb24oYSl7YT0kKGEpO2lmKCFhLmhhc0NsYXNzKHRoaXMuX2dldE1hcmtlcigpKSl7cmV0dXJufXRoaXMuX3ByZURlc3Ryb3koYSx0aGlzLl9nZXRJbnN0KGEpKTthLnJlbW92ZURhdGEodGhpcy5uYW1lKS5yZW1vdmVDbGFzcyh0aGlzLl9nZXRNYXJrZXIoKSl9LF9wcmVEZXN0cm95OmZ1bmN0aW9uKGEsYil7fX0pO2Z1bmN0aW9uIGNhbWVsQ2FzZShjKXtyZXR1cm4gYy5yZXBsYWNlKC8tKFthLXpdKS9nLGZ1bmN0aW9uKGEsYil7cmV0dXJuIGIudG9VcHBlckNhc2UoKX0pfSQuSlFQbHVnaW49e2NyZWF0ZVBsdWdpbjpmdW5jdGlvbihhLGIpe2lmKHR5cGVvZiBhPT09J29iamVjdCcpe2I9YTthPSdKUVBsdWdpbid9YT1jYW1lbENhc2UoYSk7dmFyIGM9Y2FtZWxDYXNlKGIubmFtZSk7SlFDbGFzcy5jbGFzc2VzW2NdPUpRQ2xhc3MuY2xhc3Nlc1thXS5leHRlbmQoYik7bmV3IEpRQ2xhc3MuY2xhc3Nlc1tjXSgpfX19KShqUXVlcnkpOyIsIi8qIGh0dHA6Ly9rZWl0aC13b29kLm5hbWUvY291bnRkb3duLmh0bWxcclxuICAgQ291bnRkb3duIGZvciBqUXVlcnkgdjIuMC4yLlxyXG4gICBXcml0dGVuIGJ5IEtlaXRoIFdvb2QgKGtid29vZHthdH1paW5ldC5jb20uYXUpIEphbnVhcnkgMjAwOC5cclxuICAgQXZhaWxhYmxlIHVuZGVyIHRoZSBNSVQgKGh0dHA6Ly9rZWl0aC13b29kLm5hbWUvbGljZW5jZS5odG1sKSBsaWNlbnNlLiBcclxuICAgUGxlYXNlIGF0dHJpYnV0ZSB0aGUgYXV0aG9yIGlmIHlvdSB1c2UgaXQuICovXHJcbihmdW5jdGlvbigkKXt2YXIgdz0nY291bnRkb3duJzt2YXIgWT0wO3ZhciBPPTE7dmFyIFc9Mjt2YXIgRD0zO3ZhciBIPTQ7dmFyIE09NTt2YXIgUz02OyQuSlFQbHVnaW4uY3JlYXRlUGx1Z2luKHtuYW1lOncsZGVmYXVsdE9wdGlvbnM6e3VudGlsOm51bGwsc2luY2U6bnVsbCx0aW1lem9uZTpudWxsLHNlcnZlclN5bmM6bnVsbCxmb3JtYXQ6J2RITVMnLGxheW91dDonJyxjb21wYWN0OmZhbHNlLHBhZFplcm9lczpmYWxzZSxzaWduaWZpY2FudDowLGRlc2NyaXB0aW9uOicnLGV4cGlyeVVybDonJyxleHBpcnlUZXh0OicnLGFsd2F5c0V4cGlyZTpmYWxzZSxvbkV4cGlyeTpudWxsLG9uVGljazpudWxsLHRpY2tJbnRlcnZhbDoxfSxyZWdpb25hbE9wdGlvbnM6eycnOntsYWJlbHM6WydZZWFycycsJ01vbnRocycsJ1dlZWtzJywnRGF5cycsJ0hvdXJzJywnTWludXRlcycsJ1NlY29uZHMnXSxsYWJlbHMxOlsnWWVhcicsJ01vbnRoJywnV2VlaycsJ0RheScsJ0hvdXInLCdNaW51dGUnLCdTZWNvbmQnXSxjb21wYWN0TGFiZWxzOlsneScsJ20nLCd3JywnZCddLHdoaWNoTGFiZWxzOm51bGwsZGlnaXRzOlsnMCcsJzEnLCcyJywnMycsJzQnLCc1JywnNicsJzcnLCc4JywnOSddLHRpbWVTZXBhcmF0b3I6JzonLGlzUlRMOmZhbHNlfX0sX2dldHRlcnM6WydnZXRUaW1lcyddLF9ydGxDbGFzczp3KyctcnRsJyxfc2VjdGlvbkNsYXNzOncrJy1zZWN0aW9uJyxfYW1vdW50Q2xhc3M6dysnLWFtb3VudCcsX3BlcmlvZENsYXNzOncrJy1wZXJpb2QnLF9yb3dDbGFzczp3Kyctcm93JyxfaG9sZGluZ0NsYXNzOncrJy1ob2xkaW5nJyxfc2hvd0NsYXNzOncrJy1zaG93JyxfZGVzY3JDbGFzczp3KyctZGVzY3InLF90aW1lckVsZW1zOltdLF9pbml0OmZ1bmN0aW9uKCl7dmFyIGM9dGhpczt0aGlzLl9zdXBlcigpO3RoaXMuX3NlcnZlclN5bmNzPVtdO3ZhciBkPSh0eXBlb2YgRGF0ZS5ub3c9PSdmdW5jdGlvbic/RGF0ZS5ub3c6ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCl9KTt2YXIgZT0od2luZG93LnBlcmZvcm1hbmNlJiZ0eXBlb2Ygd2luZG93LnBlcmZvcm1hbmNlLm5vdz09J2Z1bmN0aW9uJyk7ZnVuY3Rpb24gdGltZXJDYWxsQmFjayhhKXt2YXIgYj0oYTwxZTEyPyhlPyhwZXJmb3JtYW5jZS5ub3coKStwZXJmb3JtYW5jZS50aW1pbmcubmF2aWdhdGlvblN0YXJ0KTpkKCkpOmF8fGQoKSk7aWYoYi1nPj0xMDAwKXtjLl91cGRhdGVFbGVtcygpO2c9Yn1mKHRpbWVyQ2FsbEJhY2spfXZhciBmPXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHdpbmRvdy5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lfHx3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fG51bGw7dmFyIGc9MDtpZighZnx8JC5ub1JlcXVlc3RBbmltYXRpb25GcmFtZSl7JC5ub1JlcXVlc3RBbmltYXRpb25GcmFtZT1udWxsO3NldEludGVydmFsKGZ1bmN0aW9uKCl7Yy5fdXBkYXRlRWxlbXMoKX0sOTgwKX1lbHNle2c9d2luZG93LmFuaW1hdGlvblN0YXJ0VGltZXx8d2luZG93LndlYmtpdEFuaW1hdGlvblN0YXJ0VGltZXx8d2luZG93Lm1vekFuaW1hdGlvblN0YXJ0VGltZXx8d2luZG93Lm9BbmltYXRpb25TdGFydFRpbWV8fHdpbmRvdy5tc0FuaW1hdGlvblN0YXJ0VGltZXx8ZCgpO2YodGltZXJDYWxsQmFjayl9fSxVVENEYXRlOmZ1bmN0aW9uKGEsYixjLGUsZixnLGgsaSl7aWYodHlwZW9mIGI9PSdvYmplY3QnJiZiLmNvbnN0cnVjdG9yPT1EYXRlKXtpPWIuZ2V0TWlsbGlzZWNvbmRzKCk7aD1iLmdldFNlY29uZHMoKTtnPWIuZ2V0TWludXRlcygpO2Y9Yi5nZXRIb3VycygpO2U9Yi5nZXREYXRlKCk7Yz1iLmdldE1vbnRoKCk7Yj1iLmdldEZ1bGxZZWFyKCl9dmFyIGQ9bmV3IERhdGUoKTtkLnNldFVUQ0Z1bGxZZWFyKGIpO2Quc2V0VVRDRGF0ZSgxKTtkLnNldFVUQ01vbnRoKGN8fDApO2Quc2V0VVRDRGF0ZShlfHwxKTtkLnNldFVUQ0hvdXJzKGZ8fDApO2Quc2V0VVRDTWludXRlcygoZ3x8MCktKE1hdGguYWJzKGEpPDMwP2EqNjA6YSkpO2Quc2V0VVRDU2Vjb25kcyhofHwwKTtkLnNldFVUQ01pbGxpc2Vjb25kcyhpfHwwKTtyZXR1cm4gZH0scGVyaW9kc1RvU2Vjb25kczpmdW5jdGlvbihhKXtyZXR1cm4gYVswXSozMTU1NzYwMCthWzFdKjI2Mjk4MDArYVsyXSo2MDQ4MDArYVszXSo4NjQwMCthWzRdKjM2MDArYVs1XSo2MCthWzZdfSxyZXN5bmM6ZnVuY3Rpb24oKXt2YXIgZD10aGlzOyQoJy4nK3RoaXMuX2dldE1hcmtlcigpKS5lYWNoKGZ1bmN0aW9uKCl7dmFyIGE9JC5kYXRhKHRoaXMsZC5uYW1lKTtpZihhLm9wdGlvbnMuc2VydmVyU3luYyl7dmFyIGI9bnVsbDtmb3IodmFyIGk9MDtpPGQuX3NlcnZlclN5bmNzLmxlbmd0aDtpKyspe2lmKGQuX3NlcnZlclN5bmNzW2ldWzBdPT1hLm9wdGlvbnMuc2VydmVyU3luYyl7Yj1kLl9zZXJ2ZXJTeW5jc1tpXTticmVha319aWYoYlsyXT09bnVsbCl7dmFyIGM9KCQuaXNGdW5jdGlvbihhLm9wdGlvbnMuc2VydmVyU3luYyk/YS5vcHRpb25zLnNlcnZlclN5bmMuYXBwbHkodGhpcyxbXSk6bnVsbCk7YlsyXT0oYz9uZXcgRGF0ZSgpLmdldFRpbWUoKS1jLmdldFRpbWUoKTowKS1iWzFdfWlmKGEuX3NpbmNlKXthLl9zaW5jZS5zZXRNaWxsaXNlY29uZHMoYS5fc2luY2UuZ2V0TWlsbGlzZWNvbmRzKCkrYlsyXSl9YS5fdW50aWwuc2V0TWlsbGlzZWNvbmRzKGEuX3VudGlsLmdldE1pbGxpc2Vjb25kcygpK2JbMl0pfX0pO2Zvcih2YXIgaT0wO2k8ZC5fc2VydmVyU3luY3MubGVuZ3RoO2krKyl7aWYoZC5fc2VydmVyU3luY3NbaV1bMl0hPW51bGwpe2QuX3NlcnZlclN5bmNzW2ldWzFdKz1kLl9zZXJ2ZXJTeW5jc1tpXVsyXTtkZWxldGUgZC5fc2VydmVyU3luY3NbaV1bMl19fX0sX2luc3RTZXR0aW5nczpmdW5jdGlvbihhLGIpe3JldHVybntfcGVyaW9kczpbMCwwLDAsMCwwLDAsMF19fSxfYWRkRWxlbTpmdW5jdGlvbihhKXtpZighdGhpcy5faGFzRWxlbShhKSl7dGhpcy5fdGltZXJFbGVtcy5wdXNoKGEpfX0sX2hhc0VsZW06ZnVuY3Rpb24oYSl7cmV0dXJuKCQuaW5BcnJheShhLHRoaXMuX3RpbWVyRWxlbXMpPi0xKX0sX3JlbW92ZUVsZW06ZnVuY3Rpb24oYil7dGhpcy5fdGltZXJFbGVtcz0kLm1hcCh0aGlzLl90aW1lckVsZW1zLGZ1bmN0aW9uKGEpe3JldHVybihhPT1iP251bGw6YSl9KX0sX3VwZGF0ZUVsZW1zOmZ1bmN0aW9uKCl7Zm9yKHZhciBpPXRoaXMuX3RpbWVyRWxlbXMubGVuZ3RoLTE7aT49MDtpLS0pe3RoaXMuX3VwZGF0ZUNvdW50ZG93bih0aGlzLl90aW1lckVsZW1zW2ldKX19LF9vcHRpb25zQ2hhbmdlZDpmdW5jdGlvbihhLGIsYyl7aWYoYy5sYXlvdXQpe2MubGF5b3V0PWMubGF5b3V0LnJlcGxhY2UoLyZsdDsvZywnPCcpLnJlcGxhY2UoLyZndDsvZywnPicpfXRoaXMuX3Jlc2V0RXh0cmFMYWJlbHMoYi5vcHRpb25zLGMpO3ZhciBkPShiLm9wdGlvbnMudGltZXpvbmUhPWMudGltZXpvbmUpOyQuZXh0ZW5kKGIub3B0aW9ucyxjKTt0aGlzLl9hZGp1c3RTZXR0aW5ncyhhLGIsYy51bnRpbCE9bnVsbHx8Yy5zaW5jZSE9bnVsbHx8ZCk7dmFyIGU9bmV3IERhdGUoKTtpZigoYi5fc2luY2UmJmIuX3NpbmNlPGUpfHwoYi5fdW50aWwmJmIuX3VudGlsPmUpKXt0aGlzLl9hZGRFbGVtKGFbMF0pfXRoaXMuX3VwZGF0ZUNvdW50ZG93bihhLGIpfSxfdXBkYXRlQ291bnRkb3duOmZ1bmN0aW9uKGEsYil7YT1hLmpxdWVyeT9hOiQoYSk7Yj1ifHx0aGlzLl9nZXRJbnN0KGEpO2lmKCFiKXtyZXR1cm59YS5odG1sKHRoaXMuX2dlbmVyYXRlSFRNTChiKSkudG9nZ2xlQ2xhc3ModGhpcy5fcnRsQ2xhc3MsYi5vcHRpb25zLmlzUlRMKTtpZigkLmlzRnVuY3Rpb24oYi5vcHRpb25zLm9uVGljaykpe3ZhciBjPWIuX2hvbGQhPSdsYXAnP2IuX3BlcmlvZHM6dGhpcy5fY2FsY3VsYXRlUGVyaW9kcyhiLGIuX3Nob3csYi5vcHRpb25zLnNpZ25pZmljYW50LG5ldyBEYXRlKCkpO2lmKGIub3B0aW9ucy50aWNrSW50ZXJ2YWw9PTF8fHRoaXMucGVyaW9kc1RvU2Vjb25kcyhjKSViLm9wdGlvbnMudGlja0ludGVydmFsPT0wKXtiLm9wdGlvbnMub25UaWNrLmFwcGx5KGFbMF0sW2NdKX19dmFyIGQ9Yi5faG9sZCE9J3BhdXNlJyYmKGIuX3NpbmNlP2IuX25vdy5nZXRUaW1lKCk8Yi5fc2luY2UuZ2V0VGltZSgpOmIuX25vdy5nZXRUaW1lKCk+PWIuX3VudGlsLmdldFRpbWUoKSk7aWYoZCYmIWIuX2V4cGlyaW5nKXtiLl9leHBpcmluZz10cnVlO2lmKHRoaXMuX2hhc0VsZW0oYVswXSl8fGIub3B0aW9ucy5hbHdheXNFeHBpcmUpe3RoaXMuX3JlbW92ZUVsZW0oYVswXSk7aWYoJC5pc0Z1bmN0aW9uKGIub3B0aW9ucy5vbkV4cGlyeSkpe2Iub3B0aW9ucy5vbkV4cGlyeS5hcHBseShhWzBdLFtdKX1pZihiLm9wdGlvbnMuZXhwaXJ5VGV4dCl7dmFyIGU9Yi5vcHRpb25zLmxheW91dDtiLm9wdGlvbnMubGF5b3V0PWIub3B0aW9ucy5leHBpcnlUZXh0O3RoaXMuX3VwZGF0ZUNvdW50ZG93bihhWzBdLGIpO2Iub3B0aW9ucy5sYXlvdXQ9ZX1pZihiLm9wdGlvbnMuZXhwaXJ5VXJsKXt3aW5kb3cubG9jYXRpb249Yi5vcHRpb25zLmV4cGlyeVVybH19Yi5fZXhwaXJpbmc9ZmFsc2V9ZWxzZSBpZihiLl9ob2xkPT0ncGF1c2UnKXt0aGlzLl9yZW1vdmVFbGVtKGFbMF0pfX0sX3Jlc2V0RXh0cmFMYWJlbHM6ZnVuY3Rpb24oYSxiKXtmb3IodmFyIG4gaW4gYil7aWYobi5tYXRjaCgvW0xsXWFiZWxzWzAyLTldfGNvbXBhY3RMYWJlbHMxLykpe2Fbbl09YltuXX19Zm9yKHZhciBuIGluIGEpe2lmKG4ubWF0Y2goL1tMbF1hYmVsc1swMi05XXxjb21wYWN0TGFiZWxzMS8pJiZ0eXBlb2YgYltuXT09PSd1bmRlZmluZWQnKXthW25dPW51bGx9fX0sX2FkanVzdFNldHRpbmdzOmZ1bmN0aW9uKGEsYixjKXt2YXIgZD1udWxsO2Zvcih2YXIgaT0wO2k8dGhpcy5fc2VydmVyU3luY3MubGVuZ3RoO2krKyl7aWYodGhpcy5fc2VydmVyU3luY3NbaV1bMF09PWIub3B0aW9ucy5zZXJ2ZXJTeW5jKXtkPXRoaXMuX3NlcnZlclN5bmNzW2ldWzFdO2JyZWFrfX1pZihkIT1udWxsKXt2YXIgZT0oYi5vcHRpb25zLnNlcnZlclN5bmM/ZDowKTt2YXIgZj1uZXcgRGF0ZSgpfWVsc2V7dmFyIGc9KCQuaXNGdW5jdGlvbihiLm9wdGlvbnMuc2VydmVyU3luYyk/Yi5vcHRpb25zLnNlcnZlclN5bmMuYXBwbHkoYVswXSxbXSk6bnVsbCk7dmFyIGY9bmV3IERhdGUoKTt2YXIgZT0oZz9mLmdldFRpbWUoKS1nLmdldFRpbWUoKTowKTt0aGlzLl9zZXJ2ZXJTeW5jcy5wdXNoKFtiLm9wdGlvbnMuc2VydmVyU3luYyxlXSl9dmFyIGg9Yi5vcHRpb25zLnRpbWV6b25lO2g9KGg9PW51bGw/LWYuZ2V0VGltZXpvbmVPZmZzZXQoKTpoKTtpZihjfHwoIWMmJmIuX3VudGlsPT1udWxsJiZiLl9zaW5jZT09bnVsbCkpe2IuX3NpbmNlPWIub3B0aW9ucy5zaW5jZTtpZihiLl9zaW5jZSE9bnVsbCl7Yi5fc2luY2U9dGhpcy5VVENEYXRlKGgsdGhpcy5fZGV0ZXJtaW5lVGltZShiLl9zaW5jZSxudWxsKSk7aWYoYi5fc2luY2UmJmUpe2IuX3NpbmNlLnNldE1pbGxpc2Vjb25kcyhiLl9zaW5jZS5nZXRNaWxsaXNlY29uZHMoKStlKX19Yi5fdW50aWw9dGhpcy5VVENEYXRlKGgsdGhpcy5fZGV0ZXJtaW5lVGltZShiLm9wdGlvbnMudW50aWwsZikpO2lmKGUpe2IuX3VudGlsLnNldE1pbGxpc2Vjb25kcyhiLl91bnRpbC5nZXRNaWxsaXNlY29uZHMoKStlKX19Yi5fc2hvdz10aGlzLl9kZXRlcm1pbmVTaG93KGIpfSxfcHJlRGVzdHJveTpmdW5jdGlvbihhLGIpe3RoaXMuX3JlbW92ZUVsZW0oYVswXSk7YS5lbXB0eSgpfSxwYXVzZTpmdW5jdGlvbihhKXt0aGlzLl9ob2xkKGEsJ3BhdXNlJyl9LGxhcDpmdW5jdGlvbihhKXt0aGlzLl9ob2xkKGEsJ2xhcCcpfSxyZXN1bWU6ZnVuY3Rpb24oYSl7dGhpcy5faG9sZChhLG51bGwpfSx0b2dnbGU6ZnVuY3Rpb24oYSl7dmFyIGI9JC5kYXRhKGEsdGhpcy5uYW1lKXx8e307dGhpc1shYi5faG9sZD8ncGF1c2UnOidyZXN1bWUnXShhKX0sdG9nZ2xlTGFwOmZ1bmN0aW9uKGEpe3ZhciBiPSQuZGF0YShhLHRoaXMubmFtZSl8fHt9O3RoaXNbIWIuX2hvbGQ/J2xhcCc6J3Jlc3VtZSddKGEpfSxfaG9sZDpmdW5jdGlvbihhLGIpe3ZhciBjPSQuZGF0YShhLHRoaXMubmFtZSk7aWYoYyl7aWYoYy5faG9sZD09J3BhdXNlJyYmIWIpe2MuX3BlcmlvZHM9Yy5fc2F2ZVBlcmlvZHM7dmFyIGQ9KGMuX3NpbmNlPyctJzonKycpO2NbYy5fc2luY2U/J19zaW5jZSc6J191bnRpbCddPXRoaXMuX2RldGVybWluZVRpbWUoZCtjLl9wZXJpb2RzWzBdKyd5JytkK2MuX3BlcmlvZHNbMV0rJ28nK2QrYy5fcGVyaW9kc1syXSsndycrZCtjLl9wZXJpb2RzWzNdKydkJytkK2MuX3BlcmlvZHNbNF0rJ2gnK2QrYy5fcGVyaW9kc1s1XSsnbScrZCtjLl9wZXJpb2RzWzZdKydzJyk7dGhpcy5fYWRkRWxlbShhKX1jLl9ob2xkPWI7Yy5fc2F2ZVBlcmlvZHM9KGI9PSdwYXVzZSc/Yy5fcGVyaW9kczpudWxsKTskLmRhdGEoYSx0aGlzLm5hbWUsYyk7dGhpcy5fdXBkYXRlQ291bnRkb3duKGEsYyl9fSxnZXRUaW1lczpmdW5jdGlvbihhKXt2YXIgYj0kLmRhdGEoYSx0aGlzLm5hbWUpO3JldHVybighYj9udWxsOihiLl9ob2xkPT0ncGF1c2UnP2IuX3NhdmVQZXJpb2RzOighYi5faG9sZD9iLl9wZXJpb2RzOnRoaXMuX2NhbGN1bGF0ZVBlcmlvZHMoYixiLl9zaG93LGIub3B0aW9ucy5zaWduaWZpY2FudCxuZXcgRGF0ZSgpKSkpKX0sX2RldGVybWluZVRpbWU6ZnVuY3Rpb24oayxsKXt2YXIgbT10aGlzO3ZhciBuPWZ1bmN0aW9uKGEpe3ZhciBiPW5ldyBEYXRlKCk7Yi5zZXRUaW1lKGIuZ2V0VGltZSgpK2EqMTAwMCk7cmV0dXJuIGJ9O3ZhciBvPWZ1bmN0aW9uKGEpe2E9YS50b0xvd2VyQ2FzZSgpO3ZhciBiPW5ldyBEYXRlKCk7dmFyIGM9Yi5nZXRGdWxsWWVhcigpO3ZhciBkPWIuZ2V0TW9udGgoKTt2YXIgZT1iLmdldERhdGUoKTt2YXIgZj1iLmdldEhvdXJzKCk7dmFyIGc9Yi5nZXRNaW51dGVzKCk7dmFyIGg9Yi5nZXRTZWNvbmRzKCk7dmFyIGk9LyhbKy1dP1swLTldKylcXHMqKHN8bXxofGR8d3xvfHkpPy9nO3ZhciBqPWkuZXhlYyhhKTt3aGlsZShqKXtzd2l0Y2goalsyXXx8J3MnKXtjYXNlJ3MnOmgrPXBhcnNlSW50KGpbMV0sMTApO2JyZWFrO2Nhc2UnbSc6Zys9cGFyc2VJbnQoalsxXSwxMCk7YnJlYWs7Y2FzZSdoJzpmKz1wYXJzZUludChqWzFdLDEwKTticmVhaztjYXNlJ2QnOmUrPXBhcnNlSW50KGpbMV0sMTApO2JyZWFrO2Nhc2Undyc6ZSs9cGFyc2VJbnQoalsxXSwxMCkqNzticmVhaztjYXNlJ28nOmQrPXBhcnNlSW50KGpbMV0sMTApO2U9TWF0aC5taW4oZSxtLl9nZXREYXlzSW5Nb250aChjLGQpKTticmVhaztjYXNlJ3knOmMrPXBhcnNlSW50KGpbMV0sMTApO2U9TWF0aC5taW4oZSxtLl9nZXREYXlzSW5Nb250aChjLGQpKTticmVha31qPWkuZXhlYyhhKX1yZXR1cm4gbmV3IERhdGUoYyxkLGUsZixnLGgsMCl9O3ZhciBwPShrPT1udWxsP2w6KHR5cGVvZiBrPT0nc3RyaW5nJz9vKGspOih0eXBlb2Ygaz09J251bWJlcic/bihrKTprKSkpO2lmKHApcC5zZXRNaWxsaXNlY29uZHMoMCk7cmV0dXJuIHB9LF9nZXREYXlzSW5Nb250aDpmdW5jdGlvbihhLGIpe3JldHVybiAzMi1uZXcgRGF0ZShhLGIsMzIpLmdldERhdGUoKX0sX25vcm1hbExhYmVsczpmdW5jdGlvbihhKXtyZXR1cm4gYX0sX2dlbmVyYXRlSFRNTDpmdW5jdGlvbihjKXt2YXIgZD10aGlzO2MuX3BlcmlvZHM9KGMuX2hvbGQ/Yy5fcGVyaW9kczp0aGlzLl9jYWxjdWxhdGVQZXJpb2RzKGMsYy5fc2hvdyxjLm9wdGlvbnMuc2lnbmlmaWNhbnQsbmV3IERhdGUoKSkpO3ZhciBlPWZhbHNlO3ZhciBmPTA7dmFyIGc9Yy5vcHRpb25zLnNpZ25pZmljYW50O3ZhciBoPSQuZXh0ZW5kKHt9LGMuX3Nob3cpO2Zvcih2YXIgaT1ZO2k8PVM7aSsrKXtlfD0oYy5fc2hvd1tpXT09Jz8nJiZjLl9wZXJpb2RzW2ldPjApO2hbaV09KGMuX3Nob3dbaV09PSc/JyYmIWU/bnVsbDpjLl9zaG93W2ldKTtmKz0oaFtpXT8xOjApO2ctPShjLl9wZXJpb2RzW2ldPjA/MTowKX12YXIgaj1bZmFsc2UsZmFsc2UsZmFsc2UsZmFsc2UsZmFsc2UsZmFsc2UsZmFsc2VdO2Zvcih2YXIgaT1TO2k+PVk7aS0tKXtpZihjLl9zaG93W2ldKXtpZihjLl9wZXJpb2RzW2ldKXtqW2ldPXRydWV9ZWxzZXtqW2ldPWc+MDtnLS19fX12YXIgaz0oYy5vcHRpb25zLmNvbXBhY3Q/Yy5vcHRpb25zLmNvbXBhY3RMYWJlbHM6Yy5vcHRpb25zLmxhYmVscyk7dmFyIGw9Yy5vcHRpb25zLndoaWNoTGFiZWxzfHx0aGlzLl9ub3JtYWxMYWJlbHM7dmFyIG09ZnVuY3Rpb24oYSl7dmFyIGI9Yy5vcHRpb25zWydjb21wYWN0TGFiZWxzJytsKGMuX3BlcmlvZHNbYV0pXTtyZXR1cm4oaFthXT9kLl90cmFuc2xhdGVEaWdpdHMoYyxjLl9wZXJpb2RzW2FdKSsoYj9iW2FdOmtbYV0pKycgJzonJyl9O3ZhciBuPShjLm9wdGlvbnMucGFkWmVyb2VzPzI6MSk7dmFyIG89ZnVuY3Rpb24oYSl7dmFyIGI9Yy5vcHRpb25zWydsYWJlbHMnK2woYy5fcGVyaW9kc1thXSldO3JldHVybigoIWMub3B0aW9ucy5zaWduaWZpY2FudCYmaFthXSl8fChjLm9wdGlvbnMuc2lnbmlmaWNhbnQmJmpbYV0pPyc8c3BhbiBjbGFzcz1cIicrZC5fc2VjdGlvbkNsYXNzKydcIj4nKyc8c3BhbiBjbGFzcz1cIicrZC5fYW1vdW50Q2xhc3MrJ1wiPicrZC5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1thXSxuKSsnPC9zcGFuPicrJzxzcGFuIGNsYXNzPVwiJytkLl9wZXJpb2RDbGFzcysnXCI+JysoYj9iW2FdOmtbYV0pKyc8L3NwYW4+PC9zcGFuPic6JycpfTtyZXR1cm4oYy5vcHRpb25zLmxheW91dD90aGlzLl9idWlsZExheW91dChjLGgsYy5vcHRpb25zLmxheW91dCxjLm9wdGlvbnMuY29tcGFjdCxjLm9wdGlvbnMuc2lnbmlmaWNhbnQsaik6KChjLm9wdGlvbnMuY29tcGFjdD8nPHNwYW4gY2xhc3M9XCInK3RoaXMuX3Jvd0NsYXNzKycgJyt0aGlzLl9hbW91bnRDbGFzcysoYy5faG9sZD8nICcrdGhpcy5faG9sZGluZ0NsYXNzOicnKSsnXCI+JyttKFkpK20oTykrbShXKSttKEQpKyhoW0hdP3RoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbSF0sMik6JycpKyhoW01dPyhoW0hdP2Mub3B0aW9ucy50aW1lU2VwYXJhdG9yOicnKSt0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW01dLDIpOicnKSsoaFtTXT8oaFtIXXx8aFtNXT9jLm9wdGlvbnMudGltZVNlcGFyYXRvcjonJykrdGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tTXSwyKTonJyk6JzxzcGFuIGNsYXNzPVwiJyt0aGlzLl9yb3dDbGFzcysnICcrdGhpcy5fc2hvd0NsYXNzKyhjLm9wdGlvbnMuc2lnbmlmaWNhbnR8fGYpKyhjLl9ob2xkPycgJyt0aGlzLl9ob2xkaW5nQ2xhc3M6JycpKydcIj4nK28oWSkrbyhPKStvKFcpK28oRCkrbyhIKStvKE0pK28oUykpKyc8L3NwYW4+JysoYy5vcHRpb25zLmRlc2NyaXB0aW9uPyc8c3BhbiBjbGFzcz1cIicrdGhpcy5fcm93Q2xhc3MrJyAnK3RoaXMuX2Rlc2NyQ2xhc3MrJ1wiPicrYy5vcHRpb25zLmRlc2NyaXB0aW9uKyc8L3NwYW4+JzonJykpKX0sX2J1aWxkTGF5b3V0OmZ1bmN0aW9uKGMsZCxlLGYsZyxoKXt2YXIgaj1jLm9wdGlvbnNbZj8nY29tcGFjdExhYmVscyc6J2xhYmVscyddO3ZhciBrPWMub3B0aW9ucy53aGljaExhYmVsc3x8dGhpcy5fbm9ybWFsTGFiZWxzO3ZhciBsPWZ1bmN0aW9uKGEpe3JldHVybihjLm9wdGlvbnNbKGY/J2NvbXBhY3RMYWJlbHMnOidsYWJlbHMnKStrKGMuX3BlcmlvZHNbYV0pXXx8ailbYV19O3ZhciBtPWZ1bmN0aW9uKGEsYil7cmV0dXJuIGMub3B0aW9ucy5kaWdpdHNbTWF0aC5mbG9vcihhL2IpJTEwXX07dmFyIG89e2Rlc2M6Yy5vcHRpb25zLmRlc2NyaXB0aW9uLHNlcDpjLm9wdGlvbnMudGltZVNlcGFyYXRvcix5bDpsKFkpLHluOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbWV0sMSkseW5uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbWV0sMikseW5ubjp0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW1ldLDMpLHkxOm0oYy5fcGVyaW9kc1tZXSwxKSx5MTA6bShjLl9wZXJpb2RzW1ldLDEwKSx5MTAwOm0oYy5fcGVyaW9kc1tZXSwxMDApLHkxMDAwOm0oYy5fcGVyaW9kc1tZXSwxMDAwKSxvbDpsKE8pLG9uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbT10sMSksb25uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbT10sMiksb25ubjp0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW09dLDMpLG8xOm0oYy5fcGVyaW9kc1tPXSwxKSxvMTA6bShjLl9wZXJpb2RzW09dLDEwKSxvMTAwOm0oYy5fcGVyaW9kc1tPXSwxMDApLG8xMDAwOm0oYy5fcGVyaW9kc1tPXSwxMDAwKSx3bDpsKFcpLHduOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbV10sMSksd25uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbV10sMiksd25ubjp0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW1ddLDMpLHcxOm0oYy5fcGVyaW9kc1tXXSwxKSx3MTA6bShjLl9wZXJpb2RzW1ddLDEwKSx3MTAwOm0oYy5fcGVyaW9kc1tXXSwxMDApLHcxMDAwOm0oYy5fcGVyaW9kc1tXXSwxMDAwKSxkbDpsKEQpLGRuOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbRF0sMSksZG5uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbRF0sMiksZG5ubjp0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW0RdLDMpLGQxOm0oYy5fcGVyaW9kc1tEXSwxKSxkMTA6bShjLl9wZXJpb2RzW0RdLDEwKSxkMTAwOm0oYy5fcGVyaW9kc1tEXSwxMDApLGQxMDAwOm0oYy5fcGVyaW9kc1tEXSwxMDAwKSxobDpsKEgpLGhuOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbSF0sMSksaG5uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbSF0sMiksaG5ubjp0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW0hdLDMpLGgxOm0oYy5fcGVyaW9kc1tIXSwxKSxoMTA6bShjLl9wZXJpb2RzW0hdLDEwKSxoMTAwOm0oYy5fcGVyaW9kc1tIXSwxMDApLGgxMDAwOm0oYy5fcGVyaW9kc1tIXSwxMDAwKSxtbDpsKE0pLG1uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbTV0sMSksbW5uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbTV0sMiksbW5ubjp0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW01dLDMpLG0xOm0oYy5fcGVyaW9kc1tNXSwxKSxtMTA6bShjLl9wZXJpb2RzW01dLDEwKSxtMTAwOm0oYy5fcGVyaW9kc1tNXSwxMDApLG0xMDAwOm0oYy5fcGVyaW9kc1tNXSwxMDAwKSxzbDpsKFMpLHNuOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbU10sMSksc25uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbU10sMiksc25ubjp0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW1NdLDMpLHMxOm0oYy5fcGVyaW9kc1tTXSwxKSxzMTA6bShjLl9wZXJpb2RzW1NdLDEwKSxzMTAwOm0oYy5fcGVyaW9kc1tTXSwxMDApLHMxMDAwOm0oYy5fcGVyaW9kc1tTXSwxMDAwKX07dmFyIHA9ZTtmb3IodmFyIGk9WTtpPD1TO2krKyl7dmFyIHE9J3lvd2RobXMnLmNoYXJBdChpKTt2YXIgcj1uZXcgUmVnRXhwKCdcXFxceycrcSsnPFxcXFx9KFtcXFxcc1xcXFxTXSopXFxcXHsnK3ErJz5cXFxcfScsJ2cnKTtwPXAucmVwbGFjZShyLCgoIWcmJmRbaV0pfHwoZyYmaFtpXSk/JyQxJzonJykpfSQuZWFjaChvLGZ1bmN0aW9uKG4sdil7dmFyIGE9bmV3IFJlZ0V4cCgnXFxcXHsnK24rJ1xcXFx9JywnZycpO3A9cC5yZXBsYWNlKGEsdil9KTtyZXR1cm4gcH0sX21pbkRpZ2l0czpmdW5jdGlvbihhLGIsYyl7Yj0nJytiO2lmKGIubGVuZ3RoPj1jKXtyZXR1cm4gdGhpcy5fdHJhbnNsYXRlRGlnaXRzKGEsYil9Yj0nMDAwMDAwMDAwMCcrYjtyZXR1cm4gdGhpcy5fdHJhbnNsYXRlRGlnaXRzKGEsYi5zdWJzdHIoYi5sZW5ndGgtYykpfSxfdHJhbnNsYXRlRGlnaXRzOmZ1bmN0aW9uKGIsYyl7cmV0dXJuKCcnK2MpLnJlcGxhY2UoL1swLTldL2csZnVuY3Rpb24oYSl7cmV0dXJuIGIub3B0aW9ucy5kaWdpdHNbYV19KX0sX2RldGVybWluZVNob3c6ZnVuY3Rpb24oYSl7dmFyIGI9YS5vcHRpb25zLmZvcm1hdDt2YXIgYz1bXTtjW1ldPShiLm1hdGNoKCd5Jyk/Jz8nOihiLm1hdGNoKCdZJyk/JyEnOm51bGwpKTtjW09dPShiLm1hdGNoKCdvJyk/Jz8nOihiLm1hdGNoKCdPJyk/JyEnOm51bGwpKTtjW1ddPShiLm1hdGNoKCd3Jyk/Jz8nOihiLm1hdGNoKCdXJyk/JyEnOm51bGwpKTtjW0RdPShiLm1hdGNoKCdkJyk/Jz8nOihiLm1hdGNoKCdEJyk/JyEnOm51bGwpKTtjW0hdPShiLm1hdGNoKCdoJyk/Jz8nOihiLm1hdGNoKCdIJyk/JyEnOm51bGwpKTtjW01dPShiLm1hdGNoKCdtJyk/Jz8nOihiLm1hdGNoKCdNJyk/JyEnOm51bGwpKTtjW1NdPShiLm1hdGNoKCdzJyk/Jz8nOihiLm1hdGNoKCdTJyk/JyEnOm51bGwpKTtyZXR1cm4gY30sX2NhbGN1bGF0ZVBlcmlvZHM6ZnVuY3Rpb24oYyxkLGUsZil7Yy5fbm93PWY7Yy5fbm93LnNldE1pbGxpc2Vjb25kcygwKTt2YXIgZz1uZXcgRGF0ZShjLl9ub3cuZ2V0VGltZSgpKTtpZihjLl9zaW5jZSl7aWYoZi5nZXRUaW1lKCk8Yy5fc2luY2UuZ2V0VGltZSgpKXtjLl9ub3c9Zj1nfWVsc2V7Zj1jLl9zaW5jZX19ZWxzZXtnLnNldFRpbWUoYy5fdW50aWwuZ2V0VGltZSgpKTtpZihmLmdldFRpbWUoKT5jLl91bnRpbC5nZXRUaW1lKCkpe2MuX25vdz1mPWd9fXZhciBoPVswLDAsMCwwLDAsMCwwXTtpZihkW1ldfHxkW09dKXt2YXIgaT10aGlzLl9nZXREYXlzSW5Nb250aChmLmdldEZ1bGxZZWFyKCksZi5nZXRNb250aCgpKTt2YXIgaj10aGlzLl9nZXREYXlzSW5Nb250aChnLmdldEZ1bGxZZWFyKCksZy5nZXRNb250aCgpKTt2YXIgaz0oZy5nZXREYXRlKCk9PWYuZ2V0RGF0ZSgpfHwoZy5nZXREYXRlKCk+PU1hdGgubWluKGksaikmJmYuZ2V0RGF0ZSgpPj1NYXRoLm1pbihpLGopKSk7dmFyIGw9ZnVuY3Rpb24oYSl7cmV0dXJuKGEuZ2V0SG91cnMoKSo2MCthLmdldE1pbnV0ZXMoKSkqNjArYS5nZXRTZWNvbmRzKCl9O3ZhciBtPU1hdGgubWF4KDAsKGcuZ2V0RnVsbFllYXIoKS1mLmdldEZ1bGxZZWFyKCkpKjEyK2cuZ2V0TW9udGgoKS1mLmdldE1vbnRoKCkrKChnLmdldERhdGUoKTxmLmdldERhdGUoKSYmIWspfHwoayYmbChnKTxsKGYpKT8tMTowKSk7aFtZXT0oZFtZXT9NYXRoLmZsb29yKG0vMTIpOjApO2hbT109KGRbT10/bS1oW1ldKjEyOjApO2Y9bmV3IERhdGUoZi5nZXRUaW1lKCkpO3ZhciBuPShmLmdldERhdGUoKT09aSk7dmFyIG89dGhpcy5fZ2V0RGF5c0luTW9udGgoZi5nZXRGdWxsWWVhcigpK2hbWV0sZi5nZXRNb250aCgpK2hbT10pO2lmKGYuZ2V0RGF0ZSgpPm8pe2Yuc2V0RGF0ZShvKX1mLnNldEZ1bGxZZWFyKGYuZ2V0RnVsbFllYXIoKStoW1ldKTtmLnNldE1vbnRoKGYuZ2V0TW9udGgoKStoW09dKTtpZihuKXtmLnNldERhdGUobyl9fXZhciBwPU1hdGguZmxvb3IoKGcuZ2V0VGltZSgpLWYuZ2V0VGltZSgpKS8xMDAwKTt2YXIgcT1mdW5jdGlvbihhLGIpe2hbYV09KGRbYV0/TWF0aC5mbG9vcihwL2IpOjApO3AtPWhbYV0qYn07cShXLDYwNDgwMCk7cShELDg2NDAwKTtxKEgsMzYwMCk7cShNLDYwKTtxKFMsMSk7aWYocD4wJiYhYy5fc2luY2Upe3ZhciByPVsxLDEyLDQuMzQ4Miw3LDI0LDYwLDYwXTt2YXIgcz1TO3ZhciB0PTE7Zm9yKHZhciB1PVM7dT49WTt1LS0pe2lmKGRbdV0pe2lmKGhbc10+PXQpe2hbc109MDtwPTF9aWYocD4wKXtoW3VdKys7cD0wO3M9dTt0PTF9fXQqPXJbdV19fWlmKGUpe2Zvcih2YXIgdT1ZO3U8PVM7dSsrKXtpZihlJiZoW3VdKXtlLS19ZWxzZSBpZighZSl7aFt1XT0wfX19cmV0dXJuIGh9fSl9KShqUXVlcnkpOyIsIiFmdW5jdGlvbihhLGIpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW1wianF1ZXJ5XCJdLGIpOlwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP21vZHVsZS5leHBvcnRzPWIocmVxdWlyZShcImpxdWVyeVwiKSk6YihhLmpRdWVyeSl9KHRoaXMsZnVuY3Rpb24oYSl7XCJmdW5jdGlvblwiIT10eXBlb2YgT2JqZWN0LmNyZWF0ZSYmKE9iamVjdC5jcmVhdGU9ZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYigpe31yZXR1cm4gYi5wcm90b3R5cGU9YSxuZXcgYn0pO3ZhciBiPXtpbml0OmZ1bmN0aW9uKGIpe3JldHVybiB0aGlzLm9wdGlvbnM9YS5leHRlbmQoe30sYS5ub3R5LmRlZmF1bHRzLGIpLHRoaXMub3B0aW9ucy5sYXlvdXQ9dGhpcy5vcHRpb25zLmN1c3RvbT9hLm5vdHkubGF5b3V0cy5pbmxpbmU6YS5ub3R5LmxheW91dHNbdGhpcy5vcHRpb25zLmxheW91dF0sYS5ub3R5LnRoZW1lc1t0aGlzLm9wdGlvbnMudGhlbWVdP3RoaXMub3B0aW9ucy50aGVtZT1hLm5vdHkudGhlbWVzW3RoaXMub3B0aW9ucy50aGVtZV06dGhpcy5vcHRpb25zLnRoZW1lQ2xhc3NOYW1lPXRoaXMub3B0aW9ucy50aGVtZSx0aGlzLm9wdGlvbnM9YS5leHRlbmQoe30sdGhpcy5vcHRpb25zLHRoaXMub3B0aW9ucy5sYXlvdXQub3B0aW9ucyksdGhpcy5vcHRpb25zLmlkPVwibm90eV9cIisobmV3IERhdGUpLmdldFRpbWUoKSpNYXRoLmZsb29yKDFlNipNYXRoLnJhbmRvbSgpKSx0aGlzLl9idWlsZCgpLHRoaXN9LF9idWlsZDpmdW5jdGlvbigpe3ZhciBiPWEoJzxkaXYgY2xhc3M9XCJub3R5X2JhciBub3R5X3R5cGVfJyt0aGlzLm9wdGlvbnMudHlwZSsnXCI+PC9kaXY+JykuYXR0cihcImlkXCIsdGhpcy5vcHRpb25zLmlkKTtpZihiLmFwcGVuZCh0aGlzLm9wdGlvbnMudGVtcGxhdGUpLmZpbmQoXCIubm90eV90ZXh0XCIpLmh0bWwodGhpcy5vcHRpb25zLnRleHQpLHRoaXMuJGJhcj1udWxsIT09dGhpcy5vcHRpb25zLmxheW91dC5wYXJlbnQub2JqZWN0P2EodGhpcy5vcHRpb25zLmxheW91dC5wYXJlbnQub2JqZWN0KS5jc3ModGhpcy5vcHRpb25zLmxheW91dC5wYXJlbnQuY3NzKS5hcHBlbmQoYik6Yix0aGlzLm9wdGlvbnMudGhlbWVDbGFzc05hbWUmJnRoaXMuJGJhci5hZGRDbGFzcyh0aGlzLm9wdGlvbnMudGhlbWVDbGFzc05hbWUpLmFkZENsYXNzKFwibm90eV9jb250YWluZXJfdHlwZV9cIit0aGlzLm9wdGlvbnMudHlwZSksdGhpcy5vcHRpb25zLmJ1dHRvbnMpe3RoaXMub3B0aW9ucy5jbG9zZVdpdGg9W10sdGhpcy5vcHRpb25zLnRpbWVvdXQ9ITE7dmFyIGM9YShcIjxkaXYvPlwiKS5hZGRDbGFzcyhcIm5vdHlfYnV0dG9uc1wiKTtudWxsIT09dGhpcy5vcHRpb25zLmxheW91dC5wYXJlbnQub2JqZWN0P3RoaXMuJGJhci5maW5kKFwiLm5vdHlfYmFyXCIpLmFwcGVuZChjKTp0aGlzLiRiYXIuYXBwZW5kKGMpO3ZhciBkPXRoaXM7YS5lYWNoKHRoaXMub3B0aW9ucy5idXR0b25zLGZ1bmN0aW9uKGIsYyl7dmFyIGU9YShcIjxidXR0b24vPlwiKS5hZGRDbGFzcyhjLmFkZENsYXNzP2MuYWRkQ2xhc3M6XCJncmF5XCIpLmh0bWwoYy50ZXh0KS5hdHRyKFwiaWRcIixjLmlkP2MuaWQ6XCJidXR0b24tXCIrYikuYXR0cihcInRpdGxlXCIsYy50aXRsZSkuYXBwZW5kVG8oZC4kYmFyLmZpbmQoXCIubm90eV9idXR0b25zXCIpKS5vbihcImNsaWNrXCIsZnVuY3Rpb24oYil7YS5pc0Z1bmN0aW9uKGMub25DbGljaykmJmMub25DbGljay5jYWxsKGUsZCxiKX0pfSl9dGhpcy4kbWVzc2FnZT10aGlzLiRiYXIuZmluZChcIi5ub3R5X21lc3NhZ2VcIiksdGhpcy4kY2xvc2VCdXR0b249dGhpcy4kYmFyLmZpbmQoXCIubm90eV9jbG9zZVwiKSx0aGlzLiRidXR0b25zPXRoaXMuJGJhci5maW5kKFwiLm5vdHlfYnV0dG9uc1wiKSxhLm5vdHkuc3RvcmVbdGhpcy5vcHRpb25zLmlkXT10aGlzfSxzaG93OmZ1bmN0aW9uKCl7dmFyIGI9dGhpcztyZXR1cm4gYi5vcHRpb25zLmN1c3RvbT9iLm9wdGlvbnMuY3VzdG9tLmZpbmQoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmFwcGVuZChiLiRiYXIpOmEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmFwcGVuZChiLiRiYXIpLGIub3B0aW9ucy50aGVtZSYmYi5vcHRpb25zLnRoZW1lLnN0eWxlJiZiLm9wdGlvbnMudGhlbWUuc3R5bGUuYXBwbHkoYiksXCJmdW5jdGlvblwiPT09YS50eXBlKGIub3B0aW9ucy5sYXlvdXQuY3NzKT90aGlzLm9wdGlvbnMubGF5b3V0LmNzcy5hcHBseShiLiRiYXIpOmIuJGJhci5jc3ModGhpcy5vcHRpb25zLmxheW91dC5jc3N8fHt9KSxiLiRiYXIuYWRkQ2xhc3MoYi5vcHRpb25zLmxheW91dC5hZGRDbGFzcyksYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc3R5bGUuYXBwbHkoYShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvciksW2Iub3B0aW9ucy53aXRoaW5dKSxiLnNob3dpbmc9ITAsYi5vcHRpb25zLnRoZW1lJiZiLm9wdGlvbnMudGhlbWUuc3R5bGUmJmIub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vblNob3cuYXBwbHkodGhpcyksYS5pbkFycmF5KFwiY2xpY2tcIixiLm9wdGlvbnMuY2xvc2VXaXRoKT4tMSYmYi4kYmFyLmNzcyhcImN1cnNvclwiLFwicG9pbnRlclwiKS5vbmUoXCJjbGlja1wiLGZ1bmN0aW9uKGEpe2Iuc3RvcFByb3BhZ2F0aW9uKGEpLGIub3B0aW9ucy5jYWxsYmFjay5vbkNsb3NlQ2xpY2smJmIub3B0aW9ucy5jYWxsYmFjay5vbkNsb3NlQ2xpY2suYXBwbHkoYiksYi5jbG9zZSgpfSksYS5pbkFycmF5KFwiaG92ZXJcIixiLm9wdGlvbnMuY2xvc2VXaXRoKT4tMSYmYi4kYmFyLm9uZShcIm1vdXNlZW50ZXJcIixmdW5jdGlvbigpe2IuY2xvc2UoKX0pLGEuaW5BcnJheShcImJ1dHRvblwiLGIub3B0aW9ucy5jbG9zZVdpdGgpPi0xJiZiLiRjbG9zZUJ1dHRvbi5vbmUoXCJjbGlja1wiLGZ1bmN0aW9uKGEpe2Iuc3RvcFByb3BhZ2F0aW9uKGEpLGIuY2xvc2UoKX0pLC0xPT1hLmluQXJyYXkoXCJidXR0b25cIixiLm9wdGlvbnMuY2xvc2VXaXRoKSYmYi4kY2xvc2VCdXR0b24ucmVtb3ZlKCksYi5vcHRpb25zLmNhbGxiYWNrLm9uU2hvdyYmYi5vcHRpb25zLmNhbGxiYWNrLm9uU2hvdy5hcHBseShiKSxcInN0cmluZ1wiPT10eXBlb2YgYi5vcHRpb25zLmFuaW1hdGlvbi5vcGVuPyhiLiRiYXIuY3NzKFwiaGVpZ2h0XCIsYi4kYmFyLmlubmVySGVpZ2h0KCkpLGIuJGJhci5vbihcImNsaWNrXCIsZnVuY3Rpb24oYSl7Yi53YXNDbGlja2VkPSEwfSksYi4kYmFyLnNob3coKS5hZGRDbGFzcyhiLm9wdGlvbnMuYW5pbWF0aW9uLm9wZW4pLm9uZShcIndlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmRcIixmdW5jdGlvbigpe2Iub3B0aW9ucy5jYWxsYmFjay5hZnRlclNob3cmJmIub3B0aW9ucy5jYWxsYmFjay5hZnRlclNob3cuYXBwbHkoYiksYi5zaG93aW5nPSExLGIuc2hvd249ITAsYi5oYXNPd25Qcm9wZXJ0eShcIndhc0NsaWNrZWRcIikmJihiLiRiYXIub2ZmKFwiY2xpY2tcIixmdW5jdGlvbihhKXtiLndhc0NsaWNrZWQ9ITB9KSxiLmNsb3NlKCkpfSkpOmIuJGJhci5hbmltYXRlKGIub3B0aW9ucy5hbmltYXRpb24ub3BlbixiLm9wdGlvbnMuYW5pbWF0aW9uLnNwZWVkLGIub3B0aW9ucy5hbmltYXRpb24uZWFzaW5nLGZ1bmN0aW9uKCl7Yi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyU2hvdyYmYi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyU2hvdy5hcHBseShiKSxiLnNob3dpbmc9ITEsYi5zaG93bj0hMH0pLGIub3B0aW9ucy50aW1lb3V0JiZiLiRiYXIuZGVsYXkoYi5vcHRpb25zLnRpbWVvdXQpLnByb21pc2UoKS5kb25lKGZ1bmN0aW9uKCl7Yi5jbG9zZSgpfSksdGhpc30sY2xvc2U6ZnVuY3Rpb24oKXtpZighKHRoaXMuY2xvc2VkfHx0aGlzLiRiYXImJnRoaXMuJGJhci5oYXNDbGFzcyhcImktYW0tY2xvc2luZy1ub3dcIikpKXt2YXIgYj10aGlzO2lmKHRoaXMuc2hvd2luZylyZXR1cm4gdm9pZCBiLiRiYXIucXVldWUoZnVuY3Rpb24oKXtiLmNsb3NlLmFwcGx5KGIpfSk7aWYoIXRoaXMuc2hvd24mJiF0aGlzLnNob3dpbmcpe3ZhciBjPVtdO3JldHVybiBhLmVhY2goYS5ub3R5LnF1ZXVlLGZ1bmN0aW9uKGEsZCl7ZC5vcHRpb25zLmlkIT1iLm9wdGlvbnMuaWQmJmMucHVzaChkKX0pLHZvaWQoYS5ub3R5LnF1ZXVlPWMpfWIuJGJhci5hZGRDbGFzcyhcImktYW0tY2xvc2luZy1ub3dcIiksYi5vcHRpb25zLmNhbGxiYWNrLm9uQ2xvc2UmJmIub3B0aW9ucy5jYWxsYmFjay5vbkNsb3NlLmFwcGx5KGIpLFwic3RyaW5nXCI9PXR5cGVvZiBiLm9wdGlvbnMuYW5pbWF0aW9uLmNsb3NlP2IuJGJhci5hZGRDbGFzcyhiLm9wdGlvbnMuYW5pbWF0aW9uLmNsb3NlKS5vbmUoXCJ3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kXCIsZnVuY3Rpb24oKXtiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJDbG9zZSYmYi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyQ2xvc2UuYXBwbHkoYiksYi5jbG9zZUNsZWFuVXAoKX0pOmIuJGJhci5jbGVhclF1ZXVlKCkuc3RvcCgpLmFuaW1hdGUoYi5vcHRpb25zLmFuaW1hdGlvbi5jbG9zZSxiLm9wdGlvbnMuYW5pbWF0aW9uLnNwZWVkLGIub3B0aW9ucy5hbmltYXRpb24uZWFzaW5nLGZ1bmN0aW9uKCl7Yi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyQ2xvc2UmJmIub3B0aW9ucy5jYWxsYmFjay5hZnRlckNsb3NlLmFwcGx5KGIpfSkucHJvbWlzZSgpLmRvbmUoZnVuY3Rpb24oKXtiLmNsb3NlQ2xlYW5VcCgpfSl9fSxjbG9zZUNsZWFuVXA6ZnVuY3Rpb24oKXt2YXIgYj10aGlzO2Iub3B0aW9ucy5tb2RhbCYmKGEubm90eVJlbmRlcmVyLnNldE1vZGFsQ291bnQoLTEpLDA9PWEubm90eVJlbmRlcmVyLmdldE1vZGFsQ291bnQoKSYmYShcIi5ub3R5X21vZGFsXCIpLmZhZGVPdXQoYi5vcHRpb25zLmFuaW1hdGlvbi5mYWRlU3BlZWQsZnVuY3Rpb24oKXthKHRoaXMpLnJlbW92ZSgpfSkpLGEubm90eVJlbmRlcmVyLnNldExheW91dENvdW50Rm9yKGIsLTEpLDA9PWEubm90eVJlbmRlcmVyLmdldExheW91dENvdW50Rm9yKGIpJiZhKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5yZW1vdmUoKSxcInVuZGVmaW5lZFwiIT10eXBlb2YgYi4kYmFyJiZudWxsIT09Yi4kYmFyJiYoXCJzdHJpbmdcIj09dHlwZW9mIGIub3B0aW9ucy5hbmltYXRpb24uY2xvc2U/KGIuJGJhci5jc3MoXCJ0cmFuc2l0aW9uXCIsXCJhbGwgMTAwbXMgZWFzZVwiKS5jc3MoXCJib3JkZXJcIiwwKS5jc3MoXCJtYXJnaW5cIiwwKS5oZWlnaHQoMCksYi4kYmFyLm9uZShcInRyYW5zaXRpb25lbmQgd2Via2l0VHJhbnNpdGlvbkVuZCBvVHJhbnNpdGlvbkVuZCBNU1RyYW5zaXRpb25FbmRcIixmdW5jdGlvbigpe2IuJGJhci5yZW1vdmUoKSxiLiRiYXI9bnVsbCxiLmNsb3NlZD0hMCxiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2smJmIub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vbkNsb3NlJiZiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2sub25DbG9zZS5hcHBseShiKX0pKTooYi4kYmFyLnJlbW92ZSgpLGIuJGJhcj1udWxsLGIuY2xvc2VkPSEwKSksZGVsZXRlIGEubm90eS5zdG9yZVtiLm9wdGlvbnMuaWRdLGIub3B0aW9ucy50aGVtZS5jYWxsYmFjayYmYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrLm9uQ2xvc2UmJmIub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vbkNsb3NlLmFwcGx5KGIpLGIub3B0aW9ucy5kaXNtaXNzUXVldWV8fChhLm5vdHkub250YXA9ITAsYS5ub3R5UmVuZGVyZXIucmVuZGVyKCkpLGIub3B0aW9ucy5tYXhWaXNpYmxlPjAmJmIub3B0aW9ucy5kaXNtaXNzUXVldWUmJmEubm90eVJlbmRlcmVyLnJlbmRlcigpfSxzZXRUZXh0OmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLmNsb3NlZHx8KHRoaXMub3B0aW9ucy50ZXh0PWEsdGhpcy4kYmFyLmZpbmQoXCIubm90eV90ZXh0XCIpLmh0bWwoYSkpLHRoaXN9LHNldFR5cGU6ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuY2xvc2VkfHwodGhpcy5vcHRpb25zLnR5cGU9YSx0aGlzLm9wdGlvbnMudGhlbWUuc3R5bGUuYXBwbHkodGhpcyksdGhpcy5vcHRpb25zLnRoZW1lLmNhbGxiYWNrLm9uU2hvdy5hcHBseSh0aGlzKSksdGhpc30sc2V0VGltZW91dDpmdW5jdGlvbihhKXtpZighdGhpcy5jbG9zZWQpe3ZhciBiPXRoaXM7dGhpcy5vcHRpb25zLnRpbWVvdXQ9YSxiLiRiYXIuZGVsYXkoYi5vcHRpb25zLnRpbWVvdXQpLnByb21pc2UoKS5kb25lKGZ1bmN0aW9uKCl7Yi5jbG9zZSgpfSl9cmV0dXJuIHRoaXN9LHN0b3BQcm9wYWdhdGlvbjpmdW5jdGlvbihhKXthPWF8fHdpbmRvdy5ldmVudCxcInVuZGVmaW5lZFwiIT10eXBlb2YgYS5zdG9wUHJvcGFnYXRpb24/YS5zdG9wUHJvcGFnYXRpb24oKTphLmNhbmNlbEJ1YmJsZT0hMH0sY2xvc2VkOiExLHNob3dpbmc6ITEsc2hvd246ITF9O2Eubm90eVJlbmRlcmVyPXt9LGEubm90eVJlbmRlcmVyLmluaXQ9ZnVuY3Rpb24oYyl7dmFyIGQ9T2JqZWN0LmNyZWF0ZShiKS5pbml0KGMpO3JldHVybiBkLm9wdGlvbnMua2lsbGVyJiZhLm5vdHkuY2xvc2VBbGwoKSxkLm9wdGlvbnMuZm9yY2U/YS5ub3R5LnF1ZXVlLnVuc2hpZnQoZCk6YS5ub3R5LnF1ZXVlLnB1c2goZCksYS5ub3R5UmVuZGVyZXIucmVuZGVyKCksXCJvYmplY3RcIj09YS5ub3R5LnJldHVybnM/ZDpkLm9wdGlvbnMuaWR9LGEubm90eVJlbmRlcmVyLnJlbmRlcj1mdW5jdGlvbigpe3ZhciBiPWEubm90eS5xdWV1ZVswXTtcIm9iamVjdFwiPT09YS50eXBlKGIpP2Iub3B0aW9ucy5kaXNtaXNzUXVldWU/Yi5vcHRpb25zLm1heFZpc2libGU+MD9hKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yK1wiID4gbGlcIikubGVuZ3RoPGIub3B0aW9ucy5tYXhWaXNpYmxlJiZhLm5vdHlSZW5kZXJlci5zaG93KGEubm90eS5xdWV1ZS5zaGlmdCgpKTphLm5vdHlSZW5kZXJlci5zaG93KGEubm90eS5xdWV1ZS5zaGlmdCgpKTphLm5vdHkub250YXAmJihhLm5vdHlSZW5kZXJlci5zaG93KGEubm90eS5xdWV1ZS5zaGlmdCgpKSxhLm5vdHkub250YXA9ITEpOmEubm90eS5vbnRhcD0hMH0sYS5ub3R5UmVuZGVyZXIuc2hvdz1mdW5jdGlvbihiKXtiLm9wdGlvbnMubW9kYWwmJihhLm5vdHlSZW5kZXJlci5jcmVhdGVNb2RhbEZvcihiKSxhLm5vdHlSZW5kZXJlci5zZXRNb2RhbENvdW50KDEpKSxiLm9wdGlvbnMuY3VzdG9tPzA9PWIub3B0aW9ucy5jdXN0b20uZmluZChiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikubGVuZ3RoP2Iub3B0aW9ucy5jdXN0b20uYXBwZW5kKGEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIub2JqZWN0KS5hZGRDbGFzcyhcImktYW0tbmV3XCIpKTpiLm9wdGlvbnMuY3VzdG9tLmZpbmQoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLnJlbW92ZUNsYXNzKFwiaS1hbS1uZXdcIik6MD09YShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikubGVuZ3RoP2EoXCJib2R5XCIpLmFwcGVuZChhKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLm9iamVjdCkuYWRkQ2xhc3MoXCJpLWFtLW5ld1wiKSk6YShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikucmVtb3ZlQ2xhc3MoXCJpLWFtLW5ld1wiKSxhLm5vdHlSZW5kZXJlci5zZXRMYXlvdXRDb3VudEZvcihiLDEpLGIuc2hvdygpfSxhLm5vdHlSZW5kZXJlci5jcmVhdGVNb2RhbEZvcj1mdW5jdGlvbihiKXtpZigwPT1hKFwiLm5vdHlfbW9kYWxcIikubGVuZ3RoKXt2YXIgYz1hKFwiPGRpdi8+XCIpLmFkZENsYXNzKFwibm90eV9tb2RhbFwiKS5hZGRDbGFzcyhiLm9wdGlvbnMudGhlbWUpLmRhdGEoXCJub3R5X21vZGFsX2NvdW50XCIsMCk7Yi5vcHRpb25zLnRoZW1lLm1vZGFsJiZiLm9wdGlvbnMudGhlbWUubW9kYWwuY3NzJiZjLmNzcyhiLm9wdGlvbnMudGhlbWUubW9kYWwuY3NzKSxjLnByZXBlbmRUbyhhKFwiYm9keVwiKSkuZmFkZUluKGIub3B0aW9ucy5hbmltYXRpb24uZmFkZVNwZWVkKSxhLmluQXJyYXkoXCJiYWNrZHJvcFwiLGIub3B0aW9ucy5jbG9zZVdpdGgpPi0xJiZjLm9uKFwiY2xpY2tcIixmdW5jdGlvbihiKXthLm5vdHkuY2xvc2VBbGwoKX0pfX0sYS5ub3R5UmVuZGVyZXIuZ2V0TGF5b3V0Q291bnRGb3I9ZnVuY3Rpb24oYil7cmV0dXJuIGEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmRhdGEoXCJub3R5X2xheW91dF9jb3VudFwiKXx8MH0sYS5ub3R5UmVuZGVyZXIuc2V0TGF5b3V0Q291bnRGb3I9ZnVuY3Rpb24oYixjKXtyZXR1cm4gYShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikuZGF0YShcIm5vdHlfbGF5b3V0X2NvdW50XCIsYS5ub3R5UmVuZGVyZXIuZ2V0TGF5b3V0Q291bnRGb3IoYikrYyl9LGEubm90eVJlbmRlcmVyLmdldE1vZGFsQ291bnQ9ZnVuY3Rpb24oKXtyZXR1cm4gYShcIi5ub3R5X21vZGFsXCIpLmRhdGEoXCJub3R5X21vZGFsX2NvdW50XCIpfHwwfSxhLm5vdHlSZW5kZXJlci5zZXRNb2RhbENvdW50PWZ1bmN0aW9uKGIpe3JldHVybiBhKFwiLm5vdHlfbW9kYWxcIikuZGF0YShcIm5vdHlfbW9kYWxfY291bnRcIixhLm5vdHlSZW5kZXJlci5nZXRNb2RhbENvdW50KCkrYil9LGEuZm4ubm90eT1mdW5jdGlvbihiKXtyZXR1cm4gYi5jdXN0b209YSh0aGlzKSxhLm5vdHlSZW5kZXJlci5pbml0KGIpfSxhLm5vdHk9e30sYS5ub3R5LnF1ZXVlPVtdLGEubm90eS5vbnRhcD0hMCxhLm5vdHkubGF5b3V0cz17fSxhLm5vdHkudGhlbWVzPXt9LGEubm90eS5yZXR1cm5zPVwib2JqZWN0XCIsYS5ub3R5LnN0b3JlPXt9LGEubm90eS5nZXQ9ZnVuY3Rpb24oYil7cmV0dXJuIGEubm90eS5zdG9yZS5oYXNPd25Qcm9wZXJ0eShiKT9hLm5vdHkuc3RvcmVbYl06ITF9LGEubm90eS5jbG9zZT1mdW5jdGlvbihiKXtyZXR1cm4gYS5ub3R5LmdldChiKT9hLm5vdHkuZ2V0KGIpLmNsb3NlKCk6ITF9LGEubm90eS5zZXRUZXh0PWZ1bmN0aW9uKGIsYyl7cmV0dXJuIGEubm90eS5nZXQoYik/YS5ub3R5LmdldChiKS5zZXRUZXh0KGMpOiExfSxhLm5vdHkuc2V0VHlwZT1mdW5jdGlvbihiLGMpe3JldHVybiBhLm5vdHkuZ2V0KGIpP2Eubm90eS5nZXQoYikuc2V0VHlwZShjKTohMX0sYS5ub3R5LmNsZWFyUXVldWU9ZnVuY3Rpb24oKXthLm5vdHkucXVldWU9W119LGEubm90eS5jbG9zZUFsbD1mdW5jdGlvbigpe2Eubm90eS5jbGVhclF1ZXVlKCksYS5lYWNoKGEubm90eS5zdG9yZSxmdW5jdGlvbihhLGIpe2IuY2xvc2UoKX0pfTt2YXIgYz13aW5kb3cuYWxlcnQ7cmV0dXJuIGEubm90eS5jb25zdW1lQWxlcnQ9ZnVuY3Rpb24oYil7d2luZG93LmFsZXJ0PWZ1bmN0aW9uKGMpe2I/Yi50ZXh0PWM6Yj17dGV4dDpjfSxhLm5vdHlSZW5kZXJlci5pbml0KGIpfX0sYS5ub3R5LnN0b3BDb25zdW1lQWxlcnQ9ZnVuY3Rpb24oKXt3aW5kb3cuYWxlcnQ9Y30sYS5ub3R5LmRlZmF1bHRzPXtsYXlvdXQ6XCJ0b3BcIix0aGVtZTpcImRlZmF1bHRUaGVtZVwiLHR5cGU6XCJhbGVydFwiLHRleHQ6XCJcIixkaXNtaXNzUXVldWU6ITAsdGVtcGxhdGU6JzxkaXYgY2xhc3M9XCJub3R5X21lc3NhZ2VcIj48c3BhbiBjbGFzcz1cIm5vdHlfdGV4dFwiPjwvc3Bhbj48ZGl2IGNsYXNzPVwibm90eV9jbG9zZVwiPjwvZGl2PjwvZGl2PicsYW5pbWF0aW9uOntvcGVuOntoZWlnaHQ6XCJ0b2dnbGVcIn0sY2xvc2U6e2hlaWdodDpcInRvZ2dsZVwifSxlYXNpbmc6XCJzd2luZ1wiLHNwZWVkOjUwMCxmYWRlU3BlZWQ6XCJmYXN0XCJ9LHRpbWVvdXQ6ITEsZm9yY2U6ITEsbW9kYWw6ITEsbWF4VmlzaWJsZTo1LGtpbGxlcjohMSxjbG9zZVdpdGg6W1wiY2xpY2tcIl0sY2FsbGJhY2s6e29uU2hvdzpmdW5jdGlvbigpe30sYWZ0ZXJTaG93OmZ1bmN0aW9uKCl7fSxvbkNsb3NlOmZ1bmN0aW9uKCl7fSxhZnRlckNsb3NlOmZ1bmN0aW9uKCl7fSxvbkNsb3NlQ2xpY2s6ZnVuY3Rpb24oKXt9fSxidXR0b25zOiExfSxhKHdpbmRvdykub24oXCJyZXNpemVcIixmdW5jdGlvbigpe2EuZWFjaChhLm5vdHkubGF5b3V0cyxmdW5jdGlvbihiLGMpe2MuY29udGFpbmVyLnN0eWxlLmFwcGx5KGEoYy5jb250YWluZXIuc2VsZWN0b3IpKX0pfSksd2luZG93Lm5vdHk9ZnVuY3Rpb24oYil7cmV0dXJuIGEubm90eVJlbmRlcmVyLmluaXQoYil9LGEubm90eS5sYXlvdXRzLmJvdHRvbT17bmFtZTpcImJvdHRvbVwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfYm90dG9tX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2JvdHRvbV9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7Ym90dG9tOjAsbGVmdDpcIjUlXCIscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiOTAlXCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDo5OTk5OTk5fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuYm90dG9tQ2VudGVyPXtuYW1lOlwiYm90dG9tQ2VudGVyXCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9ib3R0b21DZW50ZXJfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfYm90dG9tQ2VudGVyX2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtib3R0b206MjAsbGVmdDowLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KSxhKHRoaXMpLmNzcyh7bGVmdDooYSh3aW5kb3cpLndpZHRoKCktYSh0aGlzKS5vdXRlcldpZHRoKCExKSkvMitcInB4XCJ9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuYm90dG9tTGVmdD17bmFtZTpcImJvdHRvbUxlZnRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2JvdHRvbUxlZnRfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfYm90dG9tTGVmdF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7Ym90dG9tOjIwLGxlZnQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLHdpbmRvdy5pbm5lcldpZHRoPDYwMCYmYSh0aGlzKS5jc3Moe2xlZnQ6NX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5ib3R0b21SaWdodD17bmFtZTpcImJvdHRvbVJpZ2h0XCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9ib3R0b21SaWdodF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9ib3R0b21SaWdodF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7Ym90dG9tOjIwLHJpZ2h0OjIwLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KSx3aW5kb3cuaW5uZXJXaWR0aDw2MDAmJmEodGhpcykuY3NzKHtyaWdodDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmNlbnRlcj17bmFtZTpcImNlbnRlclwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfY2VudGVyX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2NlbnRlcl9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7cG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pO3ZhciBiPWEodGhpcykuY2xvbmUoKS5jc3Moe3Zpc2liaWxpdHk6XCJoaWRkZW5cIixkaXNwbGF5OlwiYmxvY2tcIixwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOjAsbGVmdDowfSkuYXR0cihcImlkXCIsXCJkdXBlXCIpO2EoXCJib2R5XCIpLmFwcGVuZChiKSxiLmZpbmQoXCIuaS1hbS1jbG9zaW5nLW5vd1wiKS5yZW1vdmUoKSxiLmZpbmQoXCJsaVwiKS5jc3MoXCJkaXNwbGF5XCIsXCJibG9ja1wiKTt2YXIgYz1iLmhlaWdodCgpO2IucmVtb3ZlKCksYSh0aGlzKS5oYXNDbGFzcyhcImktYW0tbmV3XCIpP2EodGhpcykuY3NzKHtsZWZ0OihhKHdpbmRvdykud2lkdGgoKS1hKHRoaXMpLm91dGVyV2lkdGgoITEpKS8yK1wicHhcIix0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0pOmEodGhpcykuYW5pbWF0ZSh7bGVmdDooYSh3aW5kb3cpLndpZHRoKCktYSh0aGlzKS5vdXRlcldpZHRoKCExKSkvMitcInB4XCIsdG9wOihhKHdpbmRvdykuaGVpZ2h0KCktYykvMitcInB4XCJ9LDUwMCl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmNlbnRlckxlZnQ9e25hbWU6XCJjZW50ZXJMZWZ0XCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9jZW50ZXJMZWZ0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2NlbnRlckxlZnRfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe2xlZnQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pO3ZhciBiPWEodGhpcykuY2xvbmUoKS5jc3Moe3Zpc2liaWxpdHk6XCJoaWRkZW5cIixkaXNwbGF5OlwiYmxvY2tcIixwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOjAsbGVmdDowfSkuYXR0cihcImlkXCIsXCJkdXBlXCIpO2EoXCJib2R5XCIpLmFwcGVuZChiKSxiLmZpbmQoXCIuaS1hbS1jbG9zaW5nLW5vd1wiKS5yZW1vdmUoKSxiLmZpbmQoXCJsaVwiKS5jc3MoXCJkaXNwbGF5XCIsXCJibG9ja1wiKTt2YXIgYz1iLmhlaWdodCgpO2IucmVtb3ZlKCksYSh0aGlzKS5oYXNDbGFzcyhcImktYW0tbmV3XCIpP2EodGhpcykuY3NzKHt0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0pOmEodGhpcykuYW5pbWF0ZSh7dG9wOihhKHdpbmRvdykuaGVpZ2h0KCktYykvMitcInB4XCJ9LDUwMCksd2luZG93LmlubmVyV2lkdGg8NjAwJiZhKHRoaXMpLmNzcyh7bGVmdDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmNlbnRlclJpZ2h0PXtuYW1lOlwiY2VudGVyUmlnaHRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2NlbnRlclJpZ2h0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2NlbnRlclJpZ2h0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtyaWdodDoyMCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSk7dmFyIGI9YSh0aGlzKS5jbG9uZSgpLmNzcyh7dmlzaWJpbGl0eTpcImhpZGRlblwiLGRpc3BsYXk6XCJibG9ja1wiLHBvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6MCxsZWZ0OjB9KS5hdHRyKFwiaWRcIixcImR1cGVcIik7YShcImJvZHlcIikuYXBwZW5kKGIpLGIuZmluZChcIi5pLWFtLWNsb3Npbmctbm93XCIpLnJlbW92ZSgpLGIuZmluZChcImxpXCIpLmNzcyhcImRpc3BsYXlcIixcImJsb2NrXCIpO3ZhciBjPWIuaGVpZ2h0KCk7Yi5yZW1vdmUoKSxhKHRoaXMpLmhhc0NsYXNzKFwiaS1hbS1uZXdcIik/YSh0aGlzKS5jc3Moe3RvcDooYSh3aW5kb3cpLmhlaWdodCgpLWMpLzIrXCJweFwifSk6YSh0aGlzKS5hbmltYXRlKHt0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0sNTAwKSx3aW5kb3cuaW5uZXJXaWR0aDw2MDAmJmEodGhpcykuY3NzKHtyaWdodDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmlubGluZT17bmFtZTpcImlubGluZVwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBjbGFzcz1cIm5vdHlfaW5saW5lX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bC5ub3R5X2lubGluZV9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7d2lkdGg6XCIxMDAlXCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDo5OTk5OTk5fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMudG9wPXtuYW1lOlwidG9wXCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV90b3BfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfdG9wX2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHt0b3A6MCxsZWZ0OlwiNSVcIixwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCI5MCVcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4Ojk5OTk5OTl9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy50b3BDZW50ZXI9e25hbWU6XCJ0b3BDZW50ZXJcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X3RvcENlbnRlcl9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV90b3BDZW50ZXJfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3RvcDoyMCxsZWZ0OjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLGEodGhpcykuY3NzKHtsZWZ0OihhKHdpbmRvdykud2lkdGgoKS1hKHRoaXMpLm91dGVyV2lkdGgoITEpKS8yK1wicHhcIn0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy50b3BMZWZ0PXtuYW1lOlwidG9wTGVmdFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfdG9wTGVmdF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV90b3BMZWZ0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHt0b3A6MjAsbGVmdDoyMCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSksd2luZG93LmlubmVyV2lkdGg8NjAwJiZhKHRoaXMpLmNzcyh7bGVmdDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLnRvcFJpZ2h0PXtuYW1lOlwidG9wUmlnaHRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X3RvcFJpZ2h0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X3RvcFJpZ2h0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHt0b3A6MjAscmlnaHQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLHdpbmRvdy5pbm5lcldpZHRoPDYwMCYmYSh0aGlzKS5jc3Moe3JpZ2h0OjV9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LnRoZW1lcy5ib290c3RyYXBUaGVtZT17bmFtZTpcImJvb3RzdHJhcFRoZW1lXCIsbW9kYWw6e2Nzczp7cG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMTAwJVwiLGhlaWdodDpcIjEwMCVcIixiYWNrZ3JvdW5kQ29sb3I6XCIjMDAwXCIsekluZGV4OjFlNCxvcGFjaXR5Oi42LGRpc3BsYXk6XCJub25lXCIsbGVmdDowLHRvcDowfX0sc3R5bGU6ZnVuY3Rpb24oKXt2YXIgYj10aGlzLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3Rvcjtzd2l0Y2goYShiKS5hZGRDbGFzcyhcImxpc3QtZ3JvdXBcIiksdGhpcy4kY2xvc2VCdXR0b24uYXBwZW5kKCc8c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj4mdGltZXM7PC9zcGFuPjxzcGFuIGNsYXNzPVwic3Itb25seVwiPkNsb3NlPC9zcGFuPicpLHRoaXMuJGNsb3NlQnV0dG9uLmFkZENsYXNzKFwiY2xvc2VcIiksdGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtXCIpLmNzcyhcInBhZGRpbmdcIixcIjBweFwiKSx0aGlzLm9wdGlvbnMudHlwZSl7Y2FzZVwiYWxlcnRcIjpjYXNlXCJub3RpZmljYXRpb25cIjp0aGlzLiRiYXIuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwLWl0ZW0taW5mb1wiKTticmVhaztjYXNlXCJ3YXJuaW5nXCI6dGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtLXdhcm5pbmdcIik7YnJlYWs7Y2FzZVwiZXJyb3JcIjp0aGlzLiRiYXIuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwLWl0ZW0tZGFuZ2VyXCIpO2JyZWFrO2Nhc2VcImluZm9ybWF0aW9uXCI6dGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtLWluZm9cIik7YnJlYWs7Y2FzZVwic3VjY2Vzc1wiOnRoaXMuJGJhci5hZGRDbGFzcyhcImxpc3QtZ3JvdXAtaXRlbS1zdWNjZXNzXCIpfXRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjEzcHhcIixsaW5lSGVpZ2h0OlwiMTZweFwiLHRleHRBbGlnbjpcImNlbnRlclwiLHBhZGRpbmc6XCI4cHggMTBweCA5cHhcIix3aWR0aDpcImF1dG9cIixwb3NpdGlvbjpcInJlbGF0aXZlXCJ9KX0sY2FsbGJhY2s6e29uU2hvdzpmdW5jdGlvbigpe30sb25DbG9zZTpmdW5jdGlvbigpe319fSxhLm5vdHkudGhlbWVzLmRlZmF1bHRUaGVtZT17bmFtZTpcImRlZmF1bHRUaGVtZVwiLGhlbHBlcnM6e2JvcmRlckZpeDpmdW5jdGlvbigpe2lmKHRoaXMub3B0aW9ucy5kaXNtaXNzUXVldWUpe3ZhciBiPXRoaXMub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yK1wiIFwiK3RoaXMub3B0aW9ucy5sYXlvdXQucGFyZW50LnNlbGVjdG9yO3N3aXRjaCh0aGlzLm9wdGlvbnMubGF5b3V0Lm5hbWUpe2Nhc2VcInRvcFwiOmEoYikuY3NzKHtib3JkZXJSYWRpdXM6XCIwcHggMHB4IDBweCAwcHhcIn0pLGEoYikubGFzdCgpLmNzcyh7Ym9yZGVyUmFkaXVzOlwiMHB4IDBweCA1cHggNXB4XCJ9KTticmVhaztjYXNlXCJ0b3BDZW50ZXJcIjpjYXNlXCJ0b3BMZWZ0XCI6Y2FzZVwidG9wUmlnaHRcIjpjYXNlXCJib3R0b21DZW50ZXJcIjpjYXNlXCJib3R0b21MZWZ0XCI6Y2FzZVwiYm90dG9tUmlnaHRcIjpjYXNlXCJjZW50ZXJcIjpjYXNlXCJjZW50ZXJMZWZ0XCI6Y2FzZVwiY2VudGVyUmlnaHRcIjpjYXNlXCJpbmxpbmVcIjphKGIpLmNzcyh7Ym9yZGVyUmFkaXVzOlwiMHB4IDBweCAwcHggMHB4XCJ9KSxhKGIpLmZpcnN0KCkuY3NzKHtcImJvcmRlci10b3AtbGVmdC1yYWRpdXNcIjpcIjVweFwiLFwiYm9yZGVyLXRvcC1yaWdodC1yYWRpdXNcIjpcIjVweFwifSksYShiKS5sYXN0KCkuY3NzKHtcImJvcmRlci1ib3R0b20tbGVmdC1yYWRpdXNcIjpcIjVweFwiLFwiYm9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXNcIjpcIjVweFwifSk7YnJlYWs7Y2FzZVwiYm90dG9tXCI6YShiKS5jc3Moe2JvcmRlclJhZGl1czpcIjBweCAwcHggMHB4IDBweFwifSksYShiKS5maXJzdCgpLmNzcyh7Ym9yZGVyUmFkaXVzOlwiNXB4IDVweCAwcHggMHB4XCJ9KX19fX0sbW9kYWw6e2Nzczp7cG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMTAwJVwiLGhlaWdodDpcIjEwMCVcIixiYWNrZ3JvdW5kQ29sb3I6XCIjMDAwXCIsekluZGV4OjFlNCxvcGFjaXR5Oi42LGRpc3BsYXk6XCJub25lXCIsbGVmdDowLHRvcDowfX0sc3R5bGU6ZnVuY3Rpb24oKXtzd2l0Y2godGhpcy4kYmFyLmNzcyh7b3ZlcmZsb3c6XCJoaWRkZW5cIixiYWNrZ3JvdW5kOlwidXJsKCdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUJzQUFBQW9DQVFBQUFDbE0wbmRBQUFBaGtsRVFWUjRBZFhPMFFyQ01CQkUwYnR0a2szOC93OFdSRVJwZHlqelZPYytIeGhJSHFKR01RY0ZGa3BZUlFvdExMU3cwSUo1YUJkb3ZydU1ZREEva1Q4cGxGOVpLTEZRY2dGMThoRGoxU2JRT01sQ0E0a2FvMGlpWG1haDdxQldQZHhwb2hzZ1ZaeWo3ZTVJOUtjSUQrRWhpREk1Z3hCWUtMQlFZS0hBUW9HRkFvRWtzL1lFR0hZS0I3aEZ4ZjBBQUFBQVNVVk9SSzVDWUlJPScpIHJlcGVhdC14IHNjcm9sbCBsZWZ0IHRvcCAjZmZmXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsbGluZUhlaWdodDpcIjE2cHhcIix0ZXh0QWxpZ246XCJjZW50ZXJcIixwYWRkaW5nOlwiOHB4IDEwcHggOXB4XCIsd2lkdGg6XCJhdXRvXCIscG9zaXRpb246XCJyZWxhdGl2ZVwifSksdGhpcy4kY2xvc2VCdXR0b24uY3NzKHtwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOjQscmlnaHQ6NCx3aWR0aDoxMCxoZWlnaHQ6MTAsYmFja2dyb3VuZDpcInVybChkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFvQUFBQUtDQVFBQUFBbk93YzJBQUFBeFVsRVFWUjRBUjNNUFVvRFVSU0EwZSsrdVNra094QzNJQU9XTnRhQ0lEYUNoZmdYQk1FWmJRUkJ5eEN3aytCYXNnUVJaTFNZb0xnRFFiQVJ4cnk4bnl1bVBjVlJLRGZkMEFhOEFzZ0R2MXpwNnBZZDVqV093aHZlYlJUYnpOTkV3NUJTc0lwc2ova3VyUUJubWs3c0lGY0NGNXl5WlBEUkc2dHJRaHVqWFlvc2FGb2MrMmYxTUo4OXVjNzZJTkQ2RjlCdmxYVWRwYjZ4d0QyKzRxM21lM2J5c2lIdnRMWXJVSnRvN1BEL3ZlN0xOSHhTZy93b04ya1N6NHR4YXNCZGh5aXozdWdQR2V0VGptM1hSb2tBQUFBQVNVVk9SSzVDWUlJPSlcIixkaXNwbGF5Olwibm9uZVwiLGN1cnNvcjpcInBvaW50ZXJcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtwYWRkaW5nOjUsdGV4dEFsaWduOlwicmlnaHRcIixib3JkZXJUb3A6XCIxcHggc29saWQgI2NjY1wiLGJhY2tncm91bmRDb2xvcjpcIiNmZmZcIn0pLHRoaXMuJGJ1dHRvbnMuZmluZChcImJ1dHRvblwiKS5jc3Moe21hcmdpbkxlZnQ6NX0pLHRoaXMuJGJ1dHRvbnMuZmluZChcImJ1dHRvbjpmaXJzdFwiKS5jc3Moe21hcmdpbkxlZnQ6MH0pLHRoaXMuJGJhci5vbih7bW91c2VlbnRlcjpmdW5jdGlvbigpe2EodGhpcykuZmluZChcIi5ub3R5X2Nsb3NlXCIpLnN0b3AoKS5mYWRlVG8oXCJub3JtYWxcIiwxKX0sbW91c2VsZWF2ZTpmdW5jdGlvbigpe2EodGhpcykuZmluZChcIi5ub3R5X2Nsb3NlXCIpLnN0b3AoKS5mYWRlVG8oXCJub3JtYWxcIiwwKX19KSx0aGlzLm9wdGlvbnMubGF5b3V0Lm5hbWUpe2Nhc2VcInRvcFwiOnRoaXMuJGJhci5jc3Moe2JvcmRlclJhZGl1czpcIjBweCAwcHggNXB4IDVweFwiLGJvcmRlckJvdHRvbTpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyTGVmdDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyUmlnaHQ6XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pO2JyZWFrO2Nhc2VcInRvcENlbnRlclwiOmNhc2VcImNlbnRlclwiOmNhc2VcImJvdHRvbUNlbnRlclwiOmNhc2VcImlubGluZVwiOnRoaXMuJGJhci5jc3Moe2JvcmRlclJhZGl1czpcIjVweFwiLGJvcmRlcjpcIjFweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTNweFwiLHRleHRBbGlnbjpcImNlbnRlclwifSk7YnJlYWs7Y2FzZVwidG9wTGVmdFwiOmNhc2VcInRvcFJpZ2h0XCI6Y2FzZVwiYm90dG9tTGVmdFwiOmNhc2VcImJvdHRvbVJpZ2h0XCI6Y2FzZVwiY2VudGVyTGVmdFwiOmNhc2VcImNlbnRlclJpZ2h0XCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyUmFkaXVzOlwiNXB4XCIsYm9yZGVyOlwiMXB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsdGV4dEFsaWduOlwibGVmdFwifSk7YnJlYWs7Y2FzZVwiYm90dG9tXCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyUmFkaXVzOlwiNXB4IDVweCAwcHggMHB4XCIsYm9yZGVyVG9wOlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJMZWZ0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJSaWdodDpcIjJweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAtMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pO2JyZWFrO2RlZmF1bHQ6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyOlwiMnB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KX1zd2l0Y2godGhpcy5vcHRpb25zLnR5cGUpe2Nhc2VcImFsZXJ0XCI6Y2FzZVwibm90aWZpY2F0aW9uXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGRlwiLGJvcmRlckNvbG9yOlwiI0NDQ1wiLGNvbG9yOlwiIzQ0NFwifSk7YnJlYWs7Y2FzZVwid2FybmluZ1wiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkVBQThcIixib3JkZXJDb2xvcjpcIiNGRkMyMzdcIixjb2xvcjpcIiM4MjYyMDBcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgI0ZGQzIzN1wifSk7YnJlYWs7Y2FzZVwiZXJyb3JcIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCJyZWRcIixib3JkZXJDb2xvcjpcImRhcmtyZWRcIixjb2xvcjpcIiNGRkZcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250V2VpZ2h0OlwiYm9sZFwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCBkYXJrcmVkXCJ9KTticmVhaztjYXNlXCJpbmZvcm1hdGlvblwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiM1N0I3RTJcIixib3JkZXJDb2xvcjpcIiMwQjkwQzRcIixjb2xvcjpcIiNGRkZcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgIzBCOTBDNFwifSk7YnJlYWs7Y2FzZVwic3VjY2Vzc1wiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcImxpZ2h0Z3JlZW5cIixib3JkZXJDb2xvcjpcIiM1MEMyNEVcIixjb2xvcjpcImRhcmtncmVlblwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjNTBDMjRFXCJ9KTticmVhaztkZWZhdWx0OnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkZcIixib3JkZXJDb2xvcjpcIiNDQ0NcIixjb2xvcjpcIiM0NDRcIn0pfX0sY2FsbGJhY2s6e29uU2hvdzpmdW5jdGlvbigpe2Eubm90eS50aGVtZXMuZGVmYXVsdFRoZW1lLmhlbHBlcnMuYm9yZGVyRml4LmFwcGx5KHRoaXMpfSxvbkNsb3NlOmZ1bmN0aW9uKCl7YS5ub3R5LnRoZW1lcy5kZWZhdWx0VGhlbWUuaGVscGVycy5ib3JkZXJGaXguYXBwbHkodGhpcyl9fX0sYS5ub3R5LnRoZW1lcy5yZWxheD17bmFtZTpcInJlbGF4XCIsaGVscGVyczp7fSxtb2RhbDp7Y3NzOntwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIxMDAlXCIsaGVpZ2h0OlwiMTAwJVwiLGJhY2tncm91bmRDb2xvcjpcIiMwMDBcIix6SW5kZXg6MWU0LG9wYWNpdHk6LjYsZGlzcGxheTpcIm5vbmVcIixsZWZ0OjAsdG9wOjB9fSxzdHlsZTpmdW5jdGlvbigpe3N3aXRjaCh0aGlzLiRiYXIuY3NzKHtvdmVyZmxvdzpcImhpZGRlblwiLG1hcmdpbjpcIjRweCAwXCIsYm9yZGVyUmFkaXVzOlwiMnB4XCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxNHB4XCIsbGluZUhlaWdodDpcIjE2cHhcIix0ZXh0QWxpZ246XCJjZW50ZXJcIixwYWRkaW5nOlwiMTBweFwiLHdpZHRoOlwiYXV0b1wiLHBvc2l0aW9uOlwicmVsYXRpdmVcIn0pLHRoaXMuJGNsb3NlQnV0dG9uLmNzcyh7cG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDo0LHJpZ2h0OjQsd2lkdGg6MTAsaGVpZ2h0OjEwLGJhY2tncm91bmQ6XCJ1cmwoZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBb0FBQUFLQ0FRQUFBQW5Pd2MyQUFBQXhVbEVRVlI0QVIzTVBVb0RVUlNBMGUrK3VTa2tPeEMzSUFPV050YUNJRGFDaGZnWEJNRVpiUVJCeXhDd2srQmFzZ1FSWkxTWW9MZ0RRYkFSeHJ5OG55dW1QY1ZSS0RmZDBBYThBc2dEdjF6cDZwWWQ1aldPd2h2ZWJSVGJ6Tk5FdzVCU3NJcHNqL2t1clFCbm1rN3NJRmNDRjV5eVpQRFJHNnRyUWh1alhZb3NhRm9jKzJmMU1KODl1Yzc2SU5ENkY5QnZsWFVkcGI2eHdEMis0cTNtZTNieXNpSHZ0TFlyVUp0bzdQRC92ZTdMTkh4U2cvd29OMmtTejR0eGFzQmRoeWl6M3VnUEdldFRqbTNYUm9rQUFBQUFTVVZPUks1Q1lJST0pXCIsZGlzcGxheTpcIm5vbmVcIixjdXJzb3I6XCJwb2ludGVyXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7cGFkZGluZzo1LHRleHRBbGlnbjpcInJpZ2h0XCIsYm9yZGVyVG9wOlwiMXB4IHNvbGlkICNjY2NcIixiYWNrZ3JvdW5kQ29sb3I6XCIjZmZmXCJ9KSx0aGlzLiRidXR0b25zLmZpbmQoXCJidXR0b25cIikuY3NzKHttYXJnaW5MZWZ0OjV9KSx0aGlzLiRidXR0b25zLmZpbmQoXCJidXR0b246Zmlyc3RcIikuY3NzKHttYXJnaW5MZWZ0OjB9KSx0aGlzLiRiYXIub24oe21vdXNlZW50ZXI6ZnVuY3Rpb24oKXthKHRoaXMpLmZpbmQoXCIubm90eV9jbG9zZVwiKS5zdG9wKCkuZmFkZVRvKFwibm9ybWFsXCIsMSl9LG1vdXNlbGVhdmU6ZnVuY3Rpb24oKXthKHRoaXMpLmZpbmQoXCIubm90eV9jbG9zZVwiKS5zdG9wKCkuZmFkZVRvKFwibm9ybWFsXCIsMCl9fSksdGhpcy5vcHRpb25zLmxheW91dC5uYW1lKXtjYXNlXCJ0b3BcIjp0aGlzLiRiYXIuY3NzKHtib3JkZXJCb3R0b206XCIycHggc29saWQgI2VlZVwiLGJvcmRlckxlZnQ6XCIycHggc29saWQgI2VlZVwiLGJvcmRlclJpZ2h0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJUb3A6XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pO2JyZWFrO2Nhc2VcInRvcENlbnRlclwiOmNhc2VcImNlbnRlclwiOmNhc2VcImJvdHRvbUNlbnRlclwiOmNhc2VcImlubGluZVwiOnRoaXMuJGJhci5jc3Moe2JvcmRlcjpcIjFweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTNweFwiLHRleHRBbGlnbjpcImNlbnRlclwifSk7YnJlYWs7Y2FzZVwidG9wTGVmdFwiOmNhc2VcInRvcFJpZ2h0XCI6Y2FzZVwiYm90dG9tTGVmdFwiOmNhc2VcImJvdHRvbVJpZ2h0XCI6Y2FzZVwiY2VudGVyTGVmdFwiOmNhc2VcImNlbnRlclJpZ2h0XCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyOlwiMXB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsdGV4dEFsaWduOlwibGVmdFwifSk7YnJlYWs7Y2FzZVwiYm90dG9tXCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyVG9wOlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJMZWZ0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJSaWdodDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyQm90dG9tOlwiMnB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIC0ycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSk7YnJlYWs7ZGVmYXVsdDp0aGlzLiRiYXIuY3NzKHtib3JkZXI6XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pfXN3aXRjaCh0aGlzLm9wdGlvbnMudHlwZSl7Y2FzZVwiYWxlcnRcIjpjYXNlXCJub3RpZmljYXRpb25cIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkZGXCIsYm9yZGVyQ29sb3I6XCIjZGVkZWRlXCIsY29sb3I6XCIjNDQ0XCJ9KTticmVhaztjYXNlXCJ3YXJuaW5nXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGRUFBOFwiLGJvcmRlckNvbG9yOlwiI0ZGQzIzN1wiLGNvbG9yOlwiIzgyNjIwMFwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjRkZDMjM3XCJ9KTticmVhaztjYXNlXCJlcnJvclwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRjgxODFcIixib3JkZXJDb2xvcjpcIiNlMjUzNTNcIixjb2xvcjpcIiNGRkZcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250V2VpZ2h0OlwiYm9sZFwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCBkYXJrcmVkXCJ9KTticmVhaztjYXNlXCJpbmZvcm1hdGlvblwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiM3OEM1RTdcIixib3JkZXJDb2xvcjpcIiMzYmFkZDZcIixjb2xvcjpcIiNGRkZcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgIzBCOTBDNFwifSk7YnJlYWs7Y2FzZVwic3VjY2Vzc1wiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNCQ0Y1QkNcIixib3JkZXJDb2xvcjpcIiM3Y2RkNzdcIixjb2xvcjpcImRhcmtncmVlblwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjNTBDMjRFXCJ9KTticmVhaztkZWZhdWx0OnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkZcIixib3JkZXJDb2xvcjpcIiNDQ0NcIixjb2xvcjpcIiM0NDRcIn0pfX0sY2FsbGJhY2s6e29uU2hvdzpmdW5jdGlvbigpe30sb25DbG9zZTpmdW5jdGlvbigpe319fSx3aW5kb3cubm90eX0pOyIsIi8qIVxyXG4gKiBNb2NrSmF4IC0galF1ZXJ5IFBsdWdpbiB0byBNb2NrIEFqYXggcmVxdWVzdHNcclxuICpcclxuICogVmVyc2lvbjogIDEuNS4zXHJcbiAqIFJlbGVhc2VkOlxyXG4gKiBIb21lOiAgIGh0dHA6Ly9naXRodWIuY29tL2FwcGVuZHRvL2pxdWVyeS1tb2NramF4XHJcbiAqIEF1dGhvcjogICBKb25hdGhhbiBTaGFycCAoaHR0cDovL2pkc2hhcnAuY29tKVxyXG4gKiBMaWNlbnNlOiAgTUlULEdQTFxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEgYXBwZW5kVG8gTExDLlxyXG4gKiBEdWFsIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgb3IgR1BMIGxpY2Vuc2VzLlxyXG4gKiBodHRwOi8vYXBwZW5kdG8uY29tL29wZW4tc291cmNlLWxpY2Vuc2VzXHJcbiAqL1xyXG4oZnVuY3Rpb24oJCkge1xyXG5cdHZhciBfYWpheCA9ICQuYWpheCxcclxuXHRcdG1vY2tIYW5kbGVycyA9IFtdLFxyXG5cdFx0bW9ja2VkQWpheENhbGxzID0gW10sXHJcblx0XHRDQUxMQkFDS19SRUdFWCA9IC89XFw/KCZ8JCkvLFxyXG5cdFx0anNjID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcclxuXHJcblxyXG5cdC8vIFBhcnNlIHRoZSBnaXZlbiBYTUwgc3RyaW5nLlxyXG5cdGZ1bmN0aW9uIHBhcnNlWE1MKHhtbCkge1xyXG5cdFx0aWYgKCB3aW5kb3cuRE9NUGFyc2VyID09IHVuZGVmaW5lZCAmJiB3aW5kb3cuQWN0aXZlWE9iamVjdCApIHtcclxuXHRcdFx0RE9NUGFyc2VyID0gZnVuY3Rpb24oKSB7IH07XHJcblx0XHRcdERPTVBhcnNlci5wcm90b3R5cGUucGFyc2VGcm9tU3RyaW5nID0gZnVuY3Rpb24oIHhtbFN0cmluZyApIHtcclxuXHRcdFx0XHR2YXIgZG9jID0gbmV3IEFjdGl2ZVhPYmplY3QoJ01pY3Jvc29mdC5YTUxET00nKTtcclxuXHRcdFx0XHRkb2MuYXN5bmMgPSAnZmFsc2UnO1xyXG5cdFx0XHRcdGRvYy5sb2FkWE1MKCB4bWxTdHJpbmcgKTtcclxuXHRcdFx0XHRyZXR1cm4gZG9jO1xyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cclxuXHRcdHRyeSB7XHJcblx0XHRcdHZhciB4bWxEb2MgPSAoIG5ldyBET01QYXJzZXIoKSApLnBhcnNlRnJvbVN0cmluZyggeG1sLCAndGV4dC94bWwnICk7XHJcblx0XHRcdGlmICggJC5pc1hNTERvYyggeG1sRG9jICkgKSB7XHJcblx0XHRcdFx0dmFyIGVyciA9ICQoJ3BhcnNlcmVycm9yJywgeG1sRG9jKTtcclxuXHRcdFx0XHRpZiAoIGVyci5sZW5ndGggPT0gMSApIHtcclxuXHRcdFx0XHRcdHRocm93KCdFcnJvcjogJyArICQoeG1sRG9jKS50ZXh0KCkgKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhyb3coJ1VuYWJsZSB0byBwYXJzZSBYTUwnKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4geG1sRG9jO1xyXG5cdFx0fSBjYXRjaCggZSApIHtcclxuXHRcdFx0dmFyIG1zZyA9ICggZS5uYW1lID09IHVuZGVmaW5lZCA/IGUgOiBlLm5hbWUgKyAnOiAnICsgZS5tZXNzYWdlICk7XHJcblx0XHRcdCQoZG9jdW1lbnQpLnRyaWdnZXIoJ3htbFBhcnNlRXJyb3InLCBbIG1zZyBdKTtcclxuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIFRyaWdnZXIgYSBqUXVlcnkgZXZlbnRcclxuXHRmdW5jdGlvbiB0cmlnZ2VyKHMsIHR5cGUsIGFyZ3MpIHtcclxuXHRcdChzLmNvbnRleHQgPyAkKHMuY29udGV4dCkgOiAkLmV2ZW50KS50cmlnZ2VyKHR5cGUsIGFyZ3MpO1xyXG5cdH1cclxuXHJcblx0Ly8gQ2hlY2sgaWYgdGhlIGRhdGEgZmllbGQgb24gdGhlIG1vY2sgaGFuZGxlciBhbmQgdGhlIHJlcXVlc3QgbWF0Y2guIFRoaXNcclxuXHQvLyBjYW4gYmUgdXNlZCB0byByZXN0cmljdCBhIG1vY2sgaGFuZGxlciB0byBiZWluZyB1c2VkIG9ubHkgd2hlbiBhIGNlcnRhaW5cclxuXHQvLyBzZXQgb2YgZGF0YSBpcyBwYXNzZWQgdG8gaXQuXHJcblx0ZnVuY3Rpb24gaXNNb2NrRGF0YUVxdWFsKCBtb2NrLCBsaXZlICkge1xyXG5cdFx0dmFyIGlkZW50aWNhbCA9IHRydWU7XHJcblx0XHQvLyBUZXN0IGZvciBzaXR1YXRpb25zIHdoZXJlIHRoZSBkYXRhIGlzIGEgcXVlcnlzdHJpbmcgKG5vdCBhbiBvYmplY3QpXHJcblx0XHRpZiAodHlwZW9mIGxpdmUgPT09ICdzdHJpbmcnKSB7XHJcblx0XHRcdC8vIFF1ZXJ5c3RyaW5nIG1heSBiZSBhIHJlZ2V4XHJcblx0XHRcdHJldHVybiAkLmlzRnVuY3Rpb24oIG1vY2sudGVzdCApID8gbW9jay50ZXN0KGxpdmUpIDogbW9jayA9PSBsaXZlO1xyXG5cdFx0fVxyXG5cdFx0JC5lYWNoKG1vY2ssIGZ1bmN0aW9uKGspIHtcclxuXHRcdFx0aWYgKCBsaXZlW2tdID09PSB1bmRlZmluZWQgKSB7XHJcblx0XHRcdFx0aWRlbnRpY2FsID0gZmFsc2U7XHJcblx0XHRcdFx0cmV0dXJuIGlkZW50aWNhbDtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRpZiAoIHR5cGVvZiBsaXZlW2tdID09PSAnb2JqZWN0JyAmJiBsaXZlW2tdICE9PSBudWxsICkge1xyXG5cdFx0XHRcdFx0aWYgKCBpZGVudGljYWwgJiYgJC5pc0FycmF5KCBsaXZlW2tdICkgKSB7XHJcblx0XHRcdFx0XHRcdGlkZW50aWNhbCA9ICQuaXNBcnJheSggbW9ja1trXSApICYmIGxpdmVba10ubGVuZ3RoID09PSBtb2NrW2tdLmxlbmd0aDtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGlkZW50aWNhbCA9IGlkZW50aWNhbCAmJiBpc01vY2tEYXRhRXF1YWwobW9ja1trXSwgbGl2ZVtrXSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGlmICggbW9ja1trXSAmJiAkLmlzRnVuY3Rpb24oIG1vY2tba10udGVzdCApICkge1xyXG5cdFx0XHRcdFx0XHRpZGVudGljYWwgPSBpZGVudGljYWwgJiYgbW9ja1trXS50ZXN0KGxpdmVba10pO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0aWRlbnRpY2FsID0gaWRlbnRpY2FsICYmICggbW9ja1trXSA9PSBsaXZlW2tdICk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0XHRyZXR1cm4gaWRlbnRpY2FsO1xyXG5cdH1cclxuXHJcbiAgICAvLyBTZWUgaWYgYSBtb2NrIGhhbmRsZXIgcHJvcGVydHkgbWF0Y2hlcyB0aGUgZGVmYXVsdCBzZXR0aW5nc1xyXG4gICAgZnVuY3Rpb24gaXNEZWZhdWx0U2V0dGluZyhoYW5kbGVyLCBwcm9wZXJ0eSkge1xyXG4gICAgICAgIHJldHVybiBoYW5kbGVyW3Byb3BlcnR5XSA9PT0gJC5tb2NramF4U2V0dGluZ3NbcHJvcGVydHldO1xyXG4gICAgfVxyXG5cclxuXHQvLyBDaGVjayB0aGUgZ2l2ZW4gaGFuZGxlciBzaG91bGQgbW9jayB0aGUgZ2l2ZW4gcmVxdWVzdFxyXG5cdGZ1bmN0aW9uIGdldE1vY2tGb3JSZXF1ZXN0KCBoYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MgKSB7XHJcblx0XHQvLyBJZiB0aGUgbW9jayB3YXMgcmVnaXN0ZXJlZCB3aXRoIGEgZnVuY3Rpb24sIGxldCB0aGUgZnVuY3Rpb24gZGVjaWRlIGlmIHdlXHJcblx0XHQvLyB3YW50IHRvIG1vY2sgdGhpcyByZXF1ZXN0XHJcblx0XHRpZiAoICQuaXNGdW5jdGlvbihoYW5kbGVyKSApIHtcclxuXHRcdFx0cmV0dXJuIGhhbmRsZXIoIHJlcXVlc3RTZXR0aW5ncyApO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEluc3BlY3QgdGhlIFVSTCBvZiB0aGUgcmVxdWVzdCBhbmQgY2hlY2sgaWYgdGhlIG1vY2sgaGFuZGxlcidzIHVybFxyXG5cdFx0Ly8gbWF0Y2hlcyB0aGUgdXJsIGZvciB0aGlzIGFqYXggcmVxdWVzdFxyXG5cdFx0aWYgKCAkLmlzRnVuY3Rpb24oaGFuZGxlci51cmwudGVzdCkgKSB7XHJcblx0XHRcdC8vIFRoZSB1c2VyIHByb3ZpZGVkIGEgcmVnZXggZm9yIHRoZSB1cmwsIHRlc3QgaXRcclxuXHRcdFx0aWYgKCAhaGFuZGxlci51cmwudGVzdCggcmVxdWVzdFNldHRpbmdzLnVybCApICkge1xyXG5cdFx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyBMb29rIGZvciBhIHNpbXBsZSB3aWxkY2FyZCAnKicgb3IgYSBkaXJlY3QgVVJMIG1hdGNoXHJcblx0XHRcdHZhciBzdGFyID0gaGFuZGxlci51cmwuaW5kZXhPZignKicpO1xyXG5cdFx0XHRpZiAoaGFuZGxlci51cmwgIT09IHJlcXVlc3RTZXR0aW5ncy51cmwgJiYgc3RhciA9PT0gLTEgfHxcclxuXHRcdFx0XHRcdCFuZXcgUmVnRXhwKGhhbmRsZXIudXJsLnJlcGxhY2UoL1stW1xcXXt9KCkrPy4sXFxcXF4kfCNcXHNdL2csIFwiXFxcXCQmXCIpLnJlcGxhY2UoL1xcKi9nLCAnLisnKSkudGVzdChyZXF1ZXN0U2V0dGluZ3MudXJsKSkge1xyXG5cdFx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gSW5zcGVjdCB0aGUgZGF0YSBzdWJtaXR0ZWQgaW4gdGhlIHJlcXVlc3QgKGVpdGhlciBQT1NUIGJvZHkgb3IgR0VUIHF1ZXJ5IHN0cmluZylcclxuXHRcdGlmICggaGFuZGxlci5kYXRhICkge1xyXG5cdFx0XHRpZiAoICEgcmVxdWVzdFNldHRpbmdzLmRhdGEgfHwgIWlzTW9ja0RhdGFFcXVhbChoYW5kbGVyLmRhdGEsIHJlcXVlc3RTZXR0aW5ncy5kYXRhKSApIHtcclxuXHRcdFx0XHQvLyBUaGV5J3JlIG5vdCBpZGVudGljYWwsIGRvIG5vdCBtb2NrIHRoaXMgcmVxdWVzdFxyXG5cdFx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvLyBJbnNwZWN0IHRoZSByZXF1ZXN0IHR5cGVcclxuXHRcdGlmICggaGFuZGxlciAmJiBoYW5kbGVyLnR5cGUgJiZcclxuXHRcdFx0XHRoYW5kbGVyLnR5cGUudG9Mb3dlckNhc2UoKSAhPSByZXF1ZXN0U2V0dGluZ3MudHlwZS50b0xvd2VyQ2FzZSgpICkge1xyXG5cdFx0XHQvLyBUaGUgcmVxdWVzdCB0eXBlIGRvZXNuJ3QgbWF0Y2ggKEdFVCB2cy4gUE9TVClcclxuXHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGhhbmRsZXI7XHJcblx0fVxyXG5cclxuXHQvLyBQcm9jZXNzIHRoZSB4aHIgb2JqZWN0cyBzZW5kIG9wZXJhdGlvblxyXG5cdGZ1bmN0aW9uIF94aHJTZW5kKG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncykge1xyXG5cclxuXHRcdC8vIFRoaXMgaXMgYSBzdWJzdGl0dXRlIGZvciA8IDEuNCB3aGljaCBsYWNrcyAkLnByb3h5XHJcblx0XHR2YXIgcHJvY2VzcyA9IChmdW5jdGlvbih0aGF0KSB7XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRyZXR1cm4gKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0dmFyIG9uUmVhZHk7XHJcblxyXG5cdFx0XHRcdFx0Ly8gVGhlIHJlcXVlc3QgaGFzIHJldHVybmVkXHJcblx0XHRcdFx0XHR0aGlzLnN0YXR1cyAgICAgPSBtb2NrSGFuZGxlci5zdGF0dXM7XHJcblx0XHRcdFx0XHR0aGlzLnN0YXR1c1RleHQgPSBtb2NrSGFuZGxlci5zdGF0dXNUZXh0O1xyXG5cdFx0XHRcdFx0dGhpcy5yZWFkeVN0YXRlXHQ9IDQ7XHJcblxyXG5cdFx0XHRcdFx0Ly8gV2UgaGF2ZSBhbiBleGVjdXRhYmxlIGZ1bmN0aW9uLCBjYWxsIGl0IHRvIGdpdmVcclxuXHRcdFx0XHRcdC8vIHRoZSBtb2NrIGhhbmRsZXIgYSBjaGFuY2UgdG8gdXBkYXRlIGl0J3MgZGF0YVxyXG5cdFx0XHRcdFx0aWYgKCAkLmlzRnVuY3Rpb24obW9ja0hhbmRsZXIucmVzcG9uc2UpICkge1xyXG5cdFx0XHRcdFx0XHRtb2NrSGFuZGxlci5yZXNwb25zZShvcmlnU2V0dGluZ3MpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0Ly8gQ29weSBvdmVyIG91ciBtb2NrIHRvIG91ciB4aHIgb2JqZWN0IGJlZm9yZSBwYXNzaW5nIGNvbnRyb2wgYmFjayB0b1xyXG5cdFx0XHRcdFx0Ly8galF1ZXJ5J3Mgb25yZWFkeXN0YXRlY2hhbmdlIGNhbGxiYWNrXHJcblx0XHRcdFx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSA9PSAnanNvbicgJiYgKCB0eXBlb2YgbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ID09ICdvYmplY3QnICkgKSB7XHJcblx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2VUZXh0ID0gSlNPTi5zdHJpbmdpZnkobW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0KTtcclxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoIHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSA9PSAneG1sJyApIHtcclxuXHRcdFx0XHRcdFx0aWYgKCB0eXBlb2YgbW9ja0hhbmRsZXIucmVzcG9uc2VYTUwgPT0gJ3N0cmluZycgKSB7XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5yZXNwb25zZVhNTCA9IHBhcnNlWE1MKG1vY2tIYW5kbGVyLnJlc3BvbnNlWE1MKTtcclxuXHRcdFx0XHRcdFx0XHQvL2luIGpRdWVyeSAxLjkuMSssIHJlc3BvbnNlWE1MIGlzIHByb2Nlc3NlZCBkaWZmZXJlbnRseSBhbmQgcmVsaWVzIG9uIHJlc3BvbnNlVGV4dFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2VUZXh0ID0gbW9ja0hhbmRsZXIucmVzcG9uc2VYTUw7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5yZXNwb25zZVhNTCA9IG1vY2tIYW5kbGVyLnJlc3BvbnNlWE1MO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHR0aGlzLnJlc3BvbnNlVGV4dCA9IG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dDtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGlmKCB0eXBlb2YgbW9ja0hhbmRsZXIuc3RhdHVzID09ICdudW1iZXInIHx8IHR5cGVvZiBtb2NrSGFuZGxlci5zdGF0dXMgPT0gJ3N0cmluZycgKSB7XHJcblx0XHRcdFx0XHRcdHRoaXMuc3RhdHVzID0gbW9ja0hhbmRsZXIuc3RhdHVzO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWYoIHR5cGVvZiBtb2NrSGFuZGxlci5zdGF0dXNUZXh0ID09PSBcInN0cmluZ1wiKSB7XHJcblx0XHRcdFx0XHRcdHRoaXMuc3RhdHVzVGV4dCA9IG1vY2tIYW5kbGVyLnN0YXR1c1RleHQ7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvLyBqUXVlcnkgMi4wIHJlbmFtZWQgb25yZWFkeXN0YXRlY2hhbmdlIHRvIG9ubG9hZFxyXG5cdFx0XHRcdFx0b25SZWFkeSA9IHRoaXMub25yZWFkeXN0YXRlY2hhbmdlIHx8IHRoaXMub25sb2FkO1xyXG5cclxuXHRcdFx0XHRcdC8vIGpRdWVyeSA8IDEuNCBkb2Vzbid0IGhhdmUgb25yZWFkeXN0YXRlIGNoYW5nZSBmb3IgeGhyXHJcblx0XHRcdFx0XHRpZiAoICQuaXNGdW5jdGlvbiggb25SZWFkeSApICkge1xyXG5cdFx0XHRcdFx0XHRpZiggbW9ja0hhbmRsZXIuaXNUaW1lb3V0KSB7XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5zdGF0dXMgPSAtMTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRvblJlYWR5LmNhbGwoIHRoaXMsIG1vY2tIYW5kbGVyLmlzVGltZW91dCA/ICd0aW1lb3V0JyA6IHVuZGVmaW5lZCApO1xyXG5cdFx0XHRcdFx0fSBlbHNlIGlmICggbW9ja0hhbmRsZXIuaXNUaW1lb3V0ICkge1xyXG5cdFx0XHRcdFx0XHQvLyBGaXggZm9yIDEuMy4yIHRpbWVvdXQgdG8ga2VlcCBzdWNjZXNzIGZyb20gZmlyaW5nLlxyXG5cdFx0XHRcdFx0XHR0aGlzLnN0YXR1cyA9IC0xO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pLmFwcGx5KHRoYXQpO1xyXG5cdFx0XHR9O1xyXG5cdFx0fSkodGhpcyk7XHJcblxyXG5cdFx0aWYgKCBtb2NrSGFuZGxlci5wcm94eSApIHtcclxuXHRcdFx0Ly8gV2UncmUgcHJveHlpbmcgdGhpcyByZXF1ZXN0IGFuZCBsb2FkaW5nIGluIGFuIGV4dGVybmFsIGZpbGUgaW5zdGVhZFxyXG5cdFx0XHRfYWpheCh7XHJcblx0XHRcdFx0Z2xvYmFsOiBmYWxzZSxcclxuXHRcdFx0XHR1cmw6IG1vY2tIYW5kbGVyLnByb3h5LFxyXG5cdFx0XHRcdHR5cGU6IG1vY2tIYW5kbGVyLnByb3h5VHlwZSxcclxuXHRcdFx0XHRkYXRhOiBtb2NrSGFuZGxlci5kYXRhLFxyXG5cdFx0XHRcdGRhdGFUeXBlOiByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgPT09IFwic2NyaXB0XCIgPyBcInRleHQvcGxhaW5cIiA6IHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSxcclxuXHRcdFx0XHRjb21wbGV0ZTogZnVuY3Rpb24oeGhyKSB7XHJcblx0XHRcdFx0XHRtb2NrSGFuZGxlci5yZXNwb25zZVhNTCA9IHhoci5yZXNwb25zZVhNTDtcclxuXHRcdFx0XHRcdG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCA9IHhoci5yZXNwb25zZVRleHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRG9uJ3Qgb3ZlcnJpZGUgdGhlIGhhbmRsZXIgc3RhdHVzL3N0YXR1c1RleHQgaWYgaXQncyBzcGVjaWZpZWQgYnkgdGhlIGNvbmZpZ1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0RlZmF1bHRTZXR0aW5nKG1vY2tIYW5kbGVyLCAnc3RhdHVzJykpIHtcclxuXHRcdFx0XHRcdCAgICBtb2NrSGFuZGxlci5zdGF0dXMgPSB4aHIuc3RhdHVzO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNEZWZhdWx0U2V0dGluZyhtb2NrSGFuZGxlciwgJ3N0YXR1c1RleHQnKSkge1xyXG5cdFx0XHRcdFx0ICAgIG1vY2tIYW5kbGVyLnN0YXR1c1RleHQgPSB4aHIuc3RhdHVzVGV4dDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG5cdFx0XHRcdFx0dGhpcy5yZXNwb25zZVRpbWVyID0gc2V0VGltZW91dChwcm9jZXNzLCBtb2NrSGFuZGxlci5yZXNwb25zZVRpbWUgfHwgMCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIHR5cGUgPT0gJ1BPU1QnIHx8ICdHRVQnIHx8ICdERUxFVEUnXHJcblx0XHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmFzeW5jID09PSBmYWxzZSApIHtcclxuXHRcdFx0XHQvLyBUT0RPOiBCbG9ja2luZyBkZWxheVxyXG5cdFx0XHRcdHByb2Nlc3MoKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aGlzLnJlc3BvbnNlVGltZXIgPSBzZXRUaW1lb3V0KHByb2Nlc3MsIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGltZSB8fCA1MCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIENvbnN0cnVjdCBhIG1vY2tlZCBYSFIgT2JqZWN0XHJcblx0ZnVuY3Rpb24geGhyKG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncywgb3JpZ0hhbmRsZXIpIHtcclxuXHRcdC8vIEV4dGVuZCB3aXRoIG91ciBkZWZhdWx0IG1vY2tqYXggc2V0dGluZ3NcclxuXHRcdG1vY2tIYW5kbGVyID0gJC5leHRlbmQodHJ1ZSwge30sICQubW9ja2pheFNldHRpbmdzLCBtb2NrSGFuZGxlcik7XHJcblxyXG5cdFx0aWYgKHR5cGVvZiBtb2NrSGFuZGxlci5oZWFkZXJzID09PSAndW5kZWZpbmVkJykge1xyXG5cdFx0XHRtb2NrSGFuZGxlci5oZWFkZXJzID0ge307XHJcblx0XHR9XHJcblx0XHRpZiAoIG1vY2tIYW5kbGVyLmNvbnRlbnRUeXBlICkge1xyXG5cdFx0XHRtb2NrSGFuZGxlci5oZWFkZXJzWydjb250ZW50LXR5cGUnXSA9IG1vY2tIYW5kbGVyLmNvbnRlbnRUeXBlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHN0YXR1czogbW9ja0hhbmRsZXIuc3RhdHVzLFxyXG5cdFx0XHRzdGF0dXNUZXh0OiBtb2NrSGFuZGxlci5zdGF0dXNUZXh0LFxyXG5cdFx0XHRyZWFkeVN0YXRlOiAxLFxyXG5cdFx0XHRvcGVuOiBmdW5jdGlvbigpIHsgfSxcclxuXHRcdFx0c2VuZDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0b3JpZ0hhbmRsZXIuZmlyZWQgPSB0cnVlO1xyXG5cdFx0XHRcdF94aHJTZW5kLmNhbGwodGhpcywgbW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncywgb3JpZ1NldHRpbmdzKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0YWJvcnQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNsZWFyVGltZW91dCh0aGlzLnJlc3BvbnNlVGltZXIpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRzZXRSZXF1ZXN0SGVhZGVyOiBmdW5jdGlvbihoZWFkZXIsIHZhbHVlKSB7XHJcblx0XHRcdFx0bW9ja0hhbmRsZXIuaGVhZGVyc1toZWFkZXJdID0gdmFsdWU7XHJcblx0XHRcdH0sXHJcblx0XHRcdGdldFJlc3BvbnNlSGVhZGVyOiBmdW5jdGlvbihoZWFkZXIpIHtcclxuXHRcdFx0XHQvLyAnTGFzdC1tb2RpZmllZCcsICdFdGFnJywgJ2NvbnRlbnQtdHlwZScgYXJlIGFsbCBjaGVja2VkIGJ5IGpRdWVyeVxyXG5cdFx0XHRcdGlmICggbW9ja0hhbmRsZXIuaGVhZGVycyAmJiBtb2NrSGFuZGxlci5oZWFkZXJzW2hlYWRlcl0gKSB7XHJcblx0XHRcdFx0XHQvLyBSZXR1cm4gYXJiaXRyYXJ5IGhlYWRlcnNcclxuXHRcdFx0XHRcdHJldHVybiBtb2NrSGFuZGxlci5oZWFkZXJzW2hlYWRlcl07XHJcblx0XHRcdFx0fSBlbHNlIGlmICggaGVhZGVyLnRvTG93ZXJDYXNlKCkgPT0gJ2xhc3QtbW9kaWZpZWQnICkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIG1vY2tIYW5kbGVyLmxhc3RNb2RpZmllZCB8fCAobmV3IERhdGUoKSkudG9TdHJpbmcoKTtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKCBoZWFkZXIudG9Mb3dlckNhc2UoKSA9PSAnZXRhZycgKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gbW9ja0hhbmRsZXIuZXRhZyB8fCAnJztcclxuXHRcdFx0XHR9IGVsc2UgaWYgKCBoZWFkZXIudG9Mb3dlckNhc2UoKSA9PSAnY29udGVudC10eXBlJyApIHtcclxuXHRcdFx0XHRcdHJldHVybiBtb2NrSGFuZGxlci5jb250ZW50VHlwZSB8fCAndGV4dC9wbGFpbic7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRnZXRBbGxSZXNwb25zZUhlYWRlcnM6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHZhciBoZWFkZXJzID0gJyc7XHJcblx0XHRcdFx0JC5lYWNoKG1vY2tIYW5kbGVyLmhlYWRlcnMsIGZ1bmN0aW9uKGssIHYpIHtcclxuXHRcdFx0XHRcdGhlYWRlcnMgKz0gayArICc6ICcgKyB2ICsgXCJcXG5cIjtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRyZXR1cm4gaGVhZGVycztcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cdC8vIFByb2Nlc3MgYSBKU09OUCBtb2NrIHJlcXVlc3QuXHJcblx0ZnVuY3Rpb24gcHJvY2Vzc0pzb25wTW9jayggcmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzICkge1xyXG5cdFx0Ly8gSGFuZGxlIEpTT05QIFBhcmFtZXRlciBDYWxsYmFja3MsIHdlIG5lZWQgdG8gcmVwbGljYXRlIHNvbWUgb2YgdGhlIGpRdWVyeSBjb3JlIGhlcmVcclxuXHRcdC8vIGJlY2F1c2UgdGhlcmUgaXNuJ3QgYW4gZWFzeSBob29rIGZvciB0aGUgY3Jvc3MgZG9tYWluIHNjcmlwdCB0YWcgb2YganNvbnBcclxuXHJcblx0XHRwcm9jZXNzSnNvbnBVcmwoIHJlcXVlc3RTZXR0aW5ncyApO1xyXG5cclxuXHRcdHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSA9IFwianNvblwiO1xyXG5cdFx0aWYocmVxdWVzdFNldHRpbmdzLmRhdGEgJiYgQ0FMTEJBQ0tfUkVHRVgudGVzdChyZXF1ZXN0U2V0dGluZ3MuZGF0YSkgfHwgQ0FMTEJBQ0tfUkVHRVgudGVzdChyZXF1ZXN0U2V0dGluZ3MudXJsKSkge1xyXG5cdFx0XHRjcmVhdGVKc29ucENhbGxiYWNrKHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyk7XHJcblxyXG5cdFx0XHQvLyBXZSBuZWVkIHRvIG1ha2Ugc3VyZVxyXG5cdFx0XHQvLyB0aGF0IGEgSlNPTlAgc3R5bGUgcmVzcG9uc2UgaXMgZXhlY3V0ZWQgcHJvcGVybHlcclxuXHJcblx0XHRcdHZhciBydXJsID0gL14oXFx3KzopP1xcL1xcLyhbXlxcLz8jXSspLyxcclxuXHRcdFx0XHRwYXJ0cyA9IHJ1cmwuZXhlYyggcmVxdWVzdFNldHRpbmdzLnVybCApLFxyXG5cdFx0XHRcdHJlbW90ZSA9IHBhcnRzICYmIChwYXJ0c1sxXSAmJiBwYXJ0c1sxXSAhPT0gbG9jYXRpb24ucHJvdG9jb2wgfHwgcGFydHNbMl0gIT09IGxvY2F0aW9uLmhvc3QpO1xyXG5cclxuXHRcdFx0cmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlID0gXCJzY3JpcHRcIjtcclxuXHRcdFx0aWYocmVxdWVzdFNldHRpbmdzLnR5cGUudG9VcHBlckNhc2UoKSA9PT0gXCJHRVRcIiAmJiByZW1vdGUgKSB7XHJcblx0XHRcdFx0dmFyIG5ld01vY2tSZXR1cm4gPSBwcm9jZXNzSnNvbnBSZXF1ZXN0KCByZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MgKTtcclxuXHJcblx0XHRcdFx0Ly8gQ2hlY2sgaWYgd2UgYXJlIHN1cHBvc2VkIHRvIHJldHVybiBhIERlZmVycmVkIGJhY2sgdG8gdGhlIG1vY2sgY2FsbCwgb3IganVzdFxyXG5cdFx0XHRcdC8vIHNpZ25hbCBzdWNjZXNzXHJcblx0XHRcdFx0aWYobmV3TW9ja1JldHVybikge1xyXG5cdFx0XHRcdFx0cmV0dXJuIG5ld01vY2tSZXR1cm47XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG51bGw7XHJcblx0fVxyXG5cclxuXHQvLyBBcHBlbmQgdGhlIHJlcXVpcmVkIGNhbGxiYWNrIHBhcmFtZXRlciB0byB0aGUgZW5kIG9mIHRoZSByZXF1ZXN0IFVSTCwgZm9yIGEgSlNPTlAgcmVxdWVzdFxyXG5cdGZ1bmN0aW9uIHByb2Nlc3NKc29ucFVybCggcmVxdWVzdFNldHRpbmdzICkge1xyXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MudHlwZS50b1VwcGVyQ2FzZSgpID09PSBcIkdFVFwiICkge1xyXG5cdFx0XHRpZiAoICFDQUxMQkFDS19SRUdFWC50ZXN0KCByZXF1ZXN0U2V0dGluZ3MudXJsICkgKSB7XHJcblx0XHRcdFx0cmVxdWVzdFNldHRpbmdzLnVybCArPSAoL1xcPy8udGVzdCggcmVxdWVzdFNldHRpbmdzLnVybCApID8gXCImXCIgOiBcIj9cIikgK1xyXG5cdFx0XHRcdFx0KHJlcXVlc3RTZXR0aW5ncy5qc29ucCB8fCBcImNhbGxiYWNrXCIpICsgXCI9P1wiO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2UgaWYgKCAhcmVxdWVzdFNldHRpbmdzLmRhdGEgfHwgIUNBTExCQUNLX1JFR0VYLnRlc3QocmVxdWVzdFNldHRpbmdzLmRhdGEpICkge1xyXG5cdFx0XHRyZXF1ZXN0U2V0dGluZ3MuZGF0YSA9IChyZXF1ZXN0U2V0dGluZ3MuZGF0YSA/IHJlcXVlc3RTZXR0aW5ncy5kYXRhICsgXCImXCIgOiBcIlwiKSArIChyZXF1ZXN0U2V0dGluZ3MuanNvbnAgfHwgXCJjYWxsYmFja1wiKSArIFwiPT9cIjtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIFByb2Nlc3MgYSBKU09OUCByZXF1ZXN0IGJ5IGV2YWx1YXRpbmcgdGhlIG1vY2tlZCByZXNwb25zZSB0ZXh0XHJcblx0ZnVuY3Rpb24gcHJvY2Vzc0pzb25wUmVxdWVzdCggcmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzICkge1xyXG5cdFx0Ly8gU3ludGhlc2l6ZSB0aGUgbW9jayByZXF1ZXN0IGZvciBhZGRpbmcgYSBzY3JpcHQgdGFnXHJcblx0XHR2YXIgY2FsbGJhY2tDb250ZXh0ID0gb3JpZ1NldHRpbmdzICYmIG9yaWdTZXR0aW5ncy5jb250ZXh0IHx8IHJlcXVlc3RTZXR0aW5ncyxcclxuXHRcdFx0bmV3TW9jayA9IG51bGw7XHJcblxyXG5cclxuXHRcdC8vIElmIHRoZSByZXNwb25zZSBoYW5kbGVyIG9uIHRoZSBtb29jayBpcyBhIGZ1bmN0aW9uLCBjYWxsIGl0XHJcblx0XHRpZiAoIG1vY2tIYW5kbGVyLnJlc3BvbnNlICYmICQuaXNGdW5jdGlvbihtb2NrSGFuZGxlci5yZXNwb25zZSkgKSB7XHJcblx0XHRcdG1vY2tIYW5kbGVyLnJlc3BvbnNlKG9yaWdTZXR0aW5ncyk7XHJcblx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0Ly8gRXZhbHVhdGUgdGhlIHJlc3BvbnNlVGV4dCBqYXZhc2NyaXB0IGluIGEgZ2xvYmFsIGNvbnRleHRcclxuXHRcdFx0aWYoIHR5cGVvZiBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgPT09ICdvYmplY3QnICkge1xyXG5cdFx0XHRcdCQuZ2xvYmFsRXZhbCggJygnICsgSlNPTi5zdHJpbmdpZnkoIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCApICsgJyknKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQkLmdsb2JhbEV2YWwoICcoJyArIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCArICcpJyk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvLyBTdWNjZXNzZnVsIHJlc3BvbnNlXHJcblx0XHRqc29ucFN1Y2Nlc3MoIHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0LCBtb2NrSGFuZGxlciApO1xyXG5cdFx0anNvbnBDb21wbGV0ZSggcmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyICk7XHJcblxyXG5cdFx0Ly8gSWYgd2UgYXJlIHJ1bm5pbmcgdW5kZXIgalF1ZXJ5IDEuNSssIHJldHVybiBhIGRlZmVycmVkIG9iamVjdFxyXG5cdFx0aWYoJC5EZWZlcnJlZCl7XHJcblx0XHRcdG5ld01vY2sgPSBuZXcgJC5EZWZlcnJlZCgpO1xyXG5cdFx0XHRpZih0eXBlb2YgbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ID09IFwib2JqZWN0XCIpe1xyXG5cdFx0XHRcdG5ld01vY2sucmVzb2x2ZVdpdGgoIGNhbGxiYWNrQ29udGV4dCwgW21vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dF0gKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNle1xyXG5cdFx0XHRcdG5ld01vY2sucmVzb2x2ZVdpdGgoIGNhbGxiYWNrQ29udGV4dCwgWyQucGFyc2VKU09OKCBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgKV0gKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG5ld01vY2s7XHJcblx0fVxyXG5cclxuXHJcblx0Ly8gQ3JlYXRlIHRoZSByZXF1aXJlZCBKU09OUCBjYWxsYmFjayBmdW5jdGlvbiBmb3IgdGhlIHJlcXVlc3RcclxuXHRmdW5jdGlvbiBjcmVhdGVKc29ucENhbGxiYWNrKCByZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MgKSB7XHJcblx0XHR2YXIgY2FsbGJhY2tDb250ZXh0ID0gb3JpZ1NldHRpbmdzICYmIG9yaWdTZXR0aW5ncy5jb250ZXh0IHx8IHJlcXVlc3RTZXR0aW5ncztcclxuXHRcdHZhciBqc29ucCA9IHJlcXVlc3RTZXR0aW5ncy5qc29ucENhbGxiYWNrIHx8IChcImpzb25wXCIgKyBqc2MrKyk7XHJcblxyXG5cdFx0Ly8gUmVwbGFjZSB0aGUgPT8gc2VxdWVuY2UgYm90aCBpbiB0aGUgcXVlcnkgc3RyaW5nIGFuZCB0aGUgZGF0YVxyXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZGF0YSApIHtcclxuXHRcdFx0cmVxdWVzdFNldHRpbmdzLmRhdGEgPSAocmVxdWVzdFNldHRpbmdzLmRhdGEgKyBcIlwiKS5yZXBsYWNlKENBTExCQUNLX1JFR0VYLCBcIj1cIiArIGpzb25wICsgXCIkMVwiKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXF1ZXN0U2V0dGluZ3MudXJsID0gcmVxdWVzdFNldHRpbmdzLnVybC5yZXBsYWNlKENBTExCQUNLX1JFR0VYLCBcIj1cIiArIGpzb25wICsgXCIkMVwiKTtcclxuXHJcblxyXG5cdFx0Ly8gSGFuZGxlIEpTT05QLXN0eWxlIGxvYWRpbmdcclxuXHRcdHdpbmRvd1sganNvbnAgXSA9IHdpbmRvd1sganNvbnAgXSB8fCBmdW5jdGlvbiggdG1wICkge1xyXG5cdFx0XHRkYXRhID0gdG1wO1xyXG5cdFx0XHRqc29ucFN1Y2Nlc3MoIHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0LCBtb2NrSGFuZGxlciApO1xyXG5cdFx0XHRqc29ucENvbXBsZXRlKCByZXF1ZXN0U2V0dGluZ3MsIGNhbGxiYWNrQ29udGV4dCwgbW9ja0hhbmRsZXIgKTtcclxuXHRcdFx0Ly8gR2FyYmFnZSBjb2xsZWN0XHJcblx0XHRcdHdpbmRvd1sganNvbnAgXSA9IHVuZGVmaW5lZDtcclxuXHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0ZGVsZXRlIHdpbmRvd1sganNvbnAgXTtcclxuXHRcdFx0fSBjYXRjaChlKSB7fVxyXG5cclxuXHRcdFx0aWYgKCBoZWFkICkge1xyXG5cdFx0XHRcdGhlYWQucmVtb3ZlQ2hpbGQoIHNjcmlwdCApO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0Ly8gVGhlIEpTT05QIHJlcXVlc3Qgd2FzIHN1Y2Nlc3NmdWxcclxuXHRmdW5jdGlvbiBqc29ucFN1Y2Nlc3MocmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyKSB7XHJcblx0XHQvLyBJZiBhIGxvY2FsIGNhbGxiYWNrIHdhcyBzcGVjaWZpZWQsIGZpcmUgaXQgYW5kIHBhc3MgaXQgdGhlIGRhdGFcclxuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLnN1Y2Nlc3MgKSB7XHJcblx0XHRcdHJlcXVlc3RTZXR0aW5ncy5zdWNjZXNzLmNhbGwoIGNhbGxiYWNrQ29udGV4dCwgbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0IHx8IFwiXCIsIHN0YXR1cywge30gKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBGaXJlIHRoZSBnbG9iYWwgY2FsbGJhY2tcclxuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmdsb2JhbCApIHtcclxuXHRcdFx0dHJpZ2dlcihyZXF1ZXN0U2V0dGluZ3MsIFwiYWpheFN1Y2Nlc3NcIiwgW3t9LCByZXF1ZXN0U2V0dGluZ3NdICk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBUaGUgSlNPTlAgcmVxdWVzdCB3YXMgY29tcGxldGVkXHJcblx0ZnVuY3Rpb24ganNvbnBDb21wbGV0ZShyZXF1ZXN0U2V0dGluZ3MsIGNhbGxiYWNrQ29udGV4dCkge1xyXG5cdFx0Ly8gUHJvY2VzcyByZXN1bHRcclxuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmNvbXBsZXRlICkge1xyXG5cdFx0XHRyZXF1ZXN0U2V0dGluZ3MuY29tcGxldGUuY2FsbCggY2FsbGJhY2tDb250ZXh0LCB7fSAsIHN0YXR1cyApO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFRoZSByZXF1ZXN0IHdhcyBjb21wbGV0ZWRcclxuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmdsb2JhbCApIHtcclxuXHRcdFx0dHJpZ2dlciggXCJhamF4Q29tcGxldGVcIiwgW3t9LCByZXF1ZXN0U2V0dGluZ3NdICk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gSGFuZGxlIHRoZSBnbG9iYWwgQUpBWCBjb3VudGVyXHJcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5nbG9iYWwgJiYgISAtLSQuYWN0aXZlICkge1xyXG5cdFx0XHQkLmV2ZW50LnRyaWdnZXIoIFwiYWpheFN0b3BcIiApO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblxyXG5cdC8vIFRoZSBjb3JlICQuYWpheCByZXBsYWNlbWVudC5cclxuXHRmdW5jdGlvbiBoYW5kbGVBamF4KCB1cmwsIG9yaWdTZXR0aW5ncyApIHtcclxuXHRcdHZhciBtb2NrUmVxdWVzdCwgcmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlcjtcclxuXHJcblx0XHQvLyBJZiB1cmwgaXMgYW4gb2JqZWN0LCBzaW11bGF0ZSBwcmUtMS41IHNpZ25hdHVyZVxyXG5cdFx0aWYgKCB0eXBlb2YgdXJsID09PSBcIm9iamVjdFwiICkge1xyXG5cdFx0XHRvcmlnU2V0dGluZ3MgPSB1cmw7XHJcblx0XHRcdHVybCA9IHVuZGVmaW5lZDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIHdvcmsgYXJvdW5kIHRvIHN1cHBvcnQgMS41IHNpZ25hdHVyZVxyXG5cdFx0XHRvcmlnU2V0dGluZ3MgPSBvcmlnU2V0dGluZ3MgfHwge307XHJcblx0XHRcdG9yaWdTZXR0aW5ncy51cmwgPSB1cmw7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gRXh0ZW5kIHRoZSBvcmlnaW5hbCBzZXR0aW5ncyBmb3IgdGhlIHJlcXVlc3RcclxuXHRcdHJlcXVlc3RTZXR0aW5ncyA9ICQuZXh0ZW5kKHRydWUsIHt9LCAkLmFqYXhTZXR0aW5ncywgb3JpZ1NldHRpbmdzKTtcclxuXHJcblx0XHQvLyBJdGVyYXRlIG92ZXIgb3VyIG1vY2sgaGFuZGxlcnMgKGluIHJlZ2lzdHJhdGlvbiBvcmRlcikgdW50aWwgd2UgZmluZFxyXG5cdFx0Ly8gb25lIHRoYXQgaXMgd2lsbGluZyB0byBpbnRlcmNlcHQgdGhlIHJlcXVlc3RcclxuXHRcdGZvcih2YXIgayA9IDA7IGsgPCBtb2NrSGFuZGxlcnMubGVuZ3RoOyBrKyspIHtcclxuXHRcdFx0aWYgKCAhbW9ja0hhbmRsZXJzW2tdICkge1xyXG5cdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRtb2NrSGFuZGxlciA9IGdldE1vY2tGb3JSZXF1ZXN0KCBtb2NrSGFuZGxlcnNba10sIHJlcXVlc3RTZXR0aW5ncyApO1xyXG5cdFx0XHRpZighbW9ja0hhbmRsZXIpIHtcclxuXHRcdFx0XHQvLyBObyB2YWxpZCBtb2NrIGZvdW5kIGZvciB0aGlzIHJlcXVlc3RcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0bW9ja2VkQWpheENhbGxzLnB1c2gocmVxdWVzdFNldHRpbmdzKTtcclxuXHJcblx0XHRcdC8vIElmIGxvZ2dpbmcgaXMgZW5hYmxlZCwgbG9nIHRoZSBtb2NrIHRvIHRoZSBjb25zb2xlXHJcblx0XHRcdCQubW9ja2pheFNldHRpbmdzLmxvZyggbW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncyApO1xyXG5cclxuXHJcblx0XHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlICYmIHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZS50b1VwcGVyQ2FzZSgpID09PSAnSlNPTlAnICkge1xyXG5cdFx0XHRcdGlmICgobW9ja1JlcXVlc3QgPSBwcm9jZXNzSnNvbnBNb2NrKCByZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MgKSkpIHtcclxuXHRcdFx0XHRcdC8vIFRoaXMgbW9jayB3aWxsIGhhbmRsZSB0aGUgSlNPTlAgcmVxdWVzdFxyXG5cdFx0XHRcdFx0cmV0dXJuIG1vY2tSZXF1ZXN0O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHJcblx0XHRcdC8vIFJlbW92ZWQgdG8gZml4ICM1NCAtIGtlZXAgdGhlIG1vY2tpbmcgZGF0YSBvYmplY3QgaW50YWN0XHJcblx0XHRcdC8vbW9ja0hhbmRsZXIuZGF0YSA9IHJlcXVlc3RTZXR0aW5ncy5kYXRhO1xyXG5cclxuXHRcdFx0bW9ja0hhbmRsZXIuY2FjaGUgPSByZXF1ZXN0U2V0dGluZ3MuY2FjaGU7XHJcblx0XHRcdG1vY2tIYW5kbGVyLnRpbWVvdXQgPSByZXF1ZXN0U2V0dGluZ3MudGltZW91dDtcclxuXHRcdFx0bW9ja0hhbmRsZXIuZ2xvYmFsID0gcmVxdWVzdFNldHRpbmdzLmdsb2JhbDtcclxuXHJcblx0XHRcdGNvcHlVcmxQYXJhbWV0ZXJzKG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MpO1xyXG5cclxuXHRcdFx0KGZ1bmN0aW9uKG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncywgb3JpZ0hhbmRsZXIpIHtcclxuXHRcdFx0XHRtb2NrUmVxdWVzdCA9IF9hamF4LmNhbGwoJCwgJC5leHRlbmQodHJ1ZSwge30sIG9yaWdTZXR0aW5ncywge1xyXG5cdFx0XHRcdFx0Ly8gTW9jayB0aGUgWEhSIG9iamVjdFxyXG5cdFx0XHRcdFx0eGhyOiBmdW5jdGlvbigpIHsgcmV0dXJuIHhociggbW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncywgb3JpZ1NldHRpbmdzLCBvcmlnSGFuZGxlciApOyB9XHJcblx0XHRcdFx0fSkpO1xyXG5cdFx0XHR9KShtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MsIG1vY2tIYW5kbGVyc1trXSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gbW9ja1JlcXVlc3Q7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gV2UgZG9uJ3QgaGF2ZSBhIG1vY2sgcmVxdWVzdFxyXG5cdFx0aWYoJC5tb2NramF4U2V0dGluZ3MudGhyb3dVbm1vY2tlZCA9PT0gdHJ1ZSkge1xyXG5cdFx0XHR0aHJvdygnQUpBWCBub3QgbW9ja2VkOiAnICsgb3JpZ1NldHRpbmdzLnVybCk7XHJcblx0XHR9XHJcblx0XHRlbHNlIHsgLy8gdHJpZ2dlciBhIG5vcm1hbCByZXF1ZXN0XHJcblx0XHRcdHJldHVybiBfYWpheC5hcHBseSgkLCBbb3JpZ1NldHRpbmdzXSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQqIENvcGllcyBVUkwgcGFyYW1ldGVyIHZhbHVlcyBpZiB0aGV5IHdlcmUgY2FwdHVyZWQgYnkgYSByZWd1bGFyIGV4cHJlc3Npb25cclxuXHQqIEBwYXJhbSB7T2JqZWN0fSBtb2NrSGFuZGxlclxyXG5cdCogQHBhcmFtIHtPYmplY3R9IG9yaWdTZXR0aW5nc1xyXG5cdCovXHJcblx0ZnVuY3Rpb24gY29weVVybFBhcmFtZXRlcnMobW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncykge1xyXG5cdFx0Ly9wYXJhbWV0ZXJzIGFyZW4ndCBjYXB0dXJlZCBpZiB0aGUgVVJMIGlzbid0IGEgUmVnRXhwXHJcblx0XHRpZiAoIShtb2NrSGFuZGxlci51cmwgaW5zdGFuY2VvZiBSZWdFeHApKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdC8vaWYgbm8gVVJMIHBhcmFtcyB3ZXJlIGRlZmluZWQgb24gdGhlIGhhbmRsZXIsIGRvbid0IGF0dGVtcHQgYSBjYXB0dXJlXHJcblx0XHRpZiAoIW1vY2tIYW5kbGVyLmhhc093blByb3BlcnR5KCd1cmxQYXJhbXMnKSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHR2YXIgY2FwdHVyZXMgPSBtb2NrSGFuZGxlci51cmwuZXhlYyhvcmlnU2V0dGluZ3MudXJsKTtcclxuXHRcdC8vdGhlIHdob2xlIFJlZ0V4cCBtYXRjaCBpcyBhbHdheXMgdGhlIGZpcnN0IHZhbHVlIGluIHRoZSBjYXB0dXJlIHJlc3VsdHNcclxuXHRcdGlmIChjYXB0dXJlcy5sZW5ndGggPT09IDEpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0Y2FwdHVyZXMuc2hpZnQoKTtcclxuXHRcdC8vdXNlIGhhbmRsZXIgcGFyYW1zIGFzIGtleXMgYW5kIGNhcHR1cmUgcmVzdXRzIGFzIHZhbHVlc1xyXG5cdFx0dmFyIGkgPSAwLFxyXG5cdFx0Y2FwdHVyZXNMZW5ndGggPSBjYXB0dXJlcy5sZW5ndGgsXHJcblx0XHRwYXJhbXNMZW5ndGggPSBtb2NrSGFuZGxlci51cmxQYXJhbXMubGVuZ3RoLFxyXG5cdFx0Ly9pbiBjYXNlIHRoZSBudW1iZXIgb2YgcGFyYW1zIHNwZWNpZmllZCBpcyBsZXNzIHRoYW4gYWN0dWFsIGNhcHR1cmVzXHJcblx0XHRtYXhJdGVyYXRpb25zID0gTWF0aC5taW4oY2FwdHVyZXNMZW5ndGgsIHBhcmFtc0xlbmd0aCksXHJcblx0XHRwYXJhbVZhbHVlcyA9IHt9O1xyXG5cdFx0Zm9yIChpOyBpIDwgbWF4SXRlcmF0aW9uczsgaSsrKSB7XHJcblx0XHRcdHZhciBrZXkgPSBtb2NrSGFuZGxlci51cmxQYXJhbXNbaV07XHJcblx0XHRcdHBhcmFtVmFsdWVzW2tleV0gPSBjYXB0dXJlc1tpXTtcclxuXHRcdH1cclxuXHRcdG9yaWdTZXR0aW5ncy51cmxQYXJhbXMgPSBwYXJhbVZhbHVlcztcclxuXHR9XHJcblxyXG5cclxuXHQvLyBQdWJsaWNcclxuXHJcblx0JC5leHRlbmQoe1xyXG5cdFx0YWpheDogaGFuZGxlQWpheFxyXG5cdH0pO1xyXG5cclxuXHQkLm1vY2tqYXhTZXR0aW5ncyA9IHtcclxuXHRcdC8vdXJsOiAgICAgICAgbnVsbCxcclxuXHRcdC8vdHlwZTogICAgICAgJ0dFVCcsXHJcblx0XHRsb2c6ICAgICAgICAgIGZ1bmN0aW9uKCBtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzICkge1xyXG5cdFx0XHRpZiAoIG1vY2tIYW5kbGVyLmxvZ2dpbmcgPT09IGZhbHNlIHx8XHJcblx0XHRcdFx0ICggdHlwZW9mIG1vY2tIYW5kbGVyLmxvZ2dpbmcgPT09ICd1bmRlZmluZWQnICYmICQubW9ja2pheFNldHRpbmdzLmxvZ2dpbmcgPT09IGZhbHNlICkgKSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmICggd2luZG93LmNvbnNvbGUgJiYgY29uc29sZS5sb2cgKSB7XHJcblx0XHRcdFx0dmFyIG1lc3NhZ2UgPSAnTU9DSyAnICsgcmVxdWVzdFNldHRpbmdzLnR5cGUudG9VcHBlckNhc2UoKSArICc6ICcgKyByZXF1ZXN0U2V0dGluZ3MudXJsO1xyXG5cdFx0XHRcdHZhciByZXF1ZXN0ID0gJC5leHRlbmQoe30sIHJlcXVlc3RTZXR0aW5ncyk7XHJcblxyXG5cdFx0XHRcdGlmICh0eXBlb2YgY29uc29sZS5sb2cgPT09ICdmdW5jdGlvbicpIHtcclxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKG1lc3NhZ2UsIHJlcXVlc3QpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyggbWVzc2FnZSArICcgJyArIEpTT04uc3RyaW5naWZ5KHJlcXVlc3QpICk7XHJcblx0XHRcdFx0XHR9IGNhdGNoIChlKSB7XHJcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHRcdGxvZ2dpbmc6ICAgICAgIHRydWUsXHJcblx0XHRzdGF0dXM6ICAgICAgICAyMDAsXHJcblx0XHRzdGF0dXNUZXh0OiAgICBcIk9LXCIsXHJcblx0XHRyZXNwb25zZVRpbWU6ICA1MDAsXHJcblx0XHRpc1RpbWVvdXQ6ICAgICBmYWxzZSxcclxuXHRcdHRocm93VW5tb2NrZWQ6IGZhbHNlLFxyXG5cdFx0Y29udGVudFR5cGU6ICAgJ3RleHQvcGxhaW4nLFxyXG5cdFx0cmVzcG9uc2U6ICAgICAgJycsXHJcblx0XHRyZXNwb25zZVRleHQ6ICAnJyxcclxuXHRcdHJlc3BvbnNlWE1MOiAgICcnLFxyXG5cdFx0cHJveHk6ICAgICAgICAgJycsXHJcblx0XHRwcm94eVR5cGU6ICAgICAnR0VUJyxcclxuXHJcblx0XHRsYXN0TW9kaWZpZWQ6ICBudWxsLFxyXG5cdFx0ZXRhZzogICAgICAgICAgJycsXHJcblx0XHRoZWFkZXJzOiB7XHJcblx0XHRcdGV0YWc6ICdJSkZASCNAOTIzdWY4MDIzaEZPQEkjSCMnLFxyXG5cdFx0XHQnY29udGVudC10eXBlJyA6ICd0ZXh0L3BsYWluJ1xyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cdCQubW9ja2pheCA9IGZ1bmN0aW9uKHNldHRpbmdzKSB7XHJcblx0XHR2YXIgaSA9IG1vY2tIYW5kbGVycy5sZW5ndGg7XHJcblx0XHRtb2NrSGFuZGxlcnNbaV0gPSBzZXR0aW5ncztcclxuXHRcdHJldHVybiBpO1xyXG5cdH07XHJcblx0JC5tb2NramF4Q2xlYXIgPSBmdW5jdGlvbihpKSB7XHJcblx0XHRpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT0gMSApIHtcclxuXHRcdFx0bW9ja0hhbmRsZXJzW2ldID0gbnVsbDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdG1vY2tIYW5kbGVycyA9IFtdO1xyXG5cdFx0fVxyXG5cdFx0bW9ja2VkQWpheENhbGxzID0gW107XHJcblx0fTtcclxuXHQkLm1vY2tqYXguaGFuZGxlciA9IGZ1bmN0aW9uKGkpIHtcclxuXHRcdGlmICggYXJndW1lbnRzLmxlbmd0aCA9PSAxICkge1xyXG5cdFx0XHRyZXR1cm4gbW9ja0hhbmRsZXJzW2ldO1xyXG5cdFx0fVxyXG5cdH07XHJcblx0JC5tb2NramF4Lm1vY2tlZEFqYXhDYWxscyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIG1vY2tlZEFqYXhDYWxscztcclxuXHR9O1xyXG59KShqUXVlcnkpOyIsIi8qKlxyXG4qICBBamF4IEF1dG9jb21wbGV0ZSBmb3IgalF1ZXJ5LCB2ZXJzaW9uICV2ZXJzaW9uJVxyXG4qICAoYykgMjAxNSBUb21hcyBLaXJkYVxyXG4qXHJcbiogIEFqYXggQXV0b2NvbXBsZXRlIGZvciBqUXVlcnkgaXMgZnJlZWx5IGRpc3RyaWJ1dGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIGFuIE1JVC1zdHlsZSBsaWNlbnNlLlxyXG4qICBGb3IgZGV0YWlscywgc2VlIHRoZSB3ZWIgc2l0ZTogaHR0cHM6Ly9naXRodWIuY29tL2RldmJyaWRnZS9qUXVlcnktQXV0b2NvbXBsZXRlXHJcbiovXHJcblxyXG4vKmpzbGludCAgYnJvd3NlcjogdHJ1ZSwgd2hpdGU6IHRydWUsIHBsdXNwbHVzOiB0cnVlLCB2YXJzOiB0cnVlICovXHJcbi8qZ2xvYmFsIGRlZmluZSwgd2luZG93LCBkb2N1bWVudCwgalF1ZXJ5LCBleHBvcnRzLCByZXF1aXJlICovXHJcblxyXG4vLyBFeHBvc2UgcGx1Z2luIGFzIGFuIEFNRCBtb2R1bGUgaWYgQU1EIGxvYWRlciBpcyBwcmVzZW50OlxyXG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcclxuICAgICAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXHJcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5J10sIGZhY3RvcnkpO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHJlcXVpcmUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAvLyBCcm93c2VyaWZ5XHJcbiAgICAgICAgZmFjdG9yeShyZXF1aXJlKCdqcXVlcnknKSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIEJyb3dzZXIgZ2xvYmFsc1xyXG4gICAgICAgIGZhY3RvcnkoalF1ZXJ5KTtcclxuICAgIH1cclxufShmdW5jdGlvbiAoJCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhclxyXG4gICAgICAgIHV0aWxzID0gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGVzY2FwZVJlZ0V4Q2hhcnM6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC9bXFwtXFxbXFxdXFwvXFx7XFx9XFwoXFwpXFwqXFwrXFw/XFwuXFxcXFxcXlxcJFxcfF0vZywgXCJcXFxcJCZcIik7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgY3JlYXRlTm9kZTogZnVuY3Rpb24gKGNvbnRhaW5lckNsYXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRpdi5jbGFzc05hbWUgPSBjb250YWluZXJDbGFzcztcclxuICAgICAgICAgICAgICAgICAgICBkaXYuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xyXG4gICAgICAgICAgICAgICAgICAgIGRpdi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkaXY7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSgpKSxcclxuXHJcbiAgICAgICAga2V5cyA9IHtcclxuICAgICAgICAgICAgRVNDOiAyNyxcclxuICAgICAgICAgICAgVEFCOiA5LFxyXG4gICAgICAgICAgICBSRVRVUk46IDEzLFxyXG4gICAgICAgICAgICBMRUZUOiAzNyxcclxuICAgICAgICAgICAgVVA6IDM4LFxyXG4gICAgICAgICAgICBSSUdIVDogMzksXHJcbiAgICAgICAgICAgIERPV046IDQwXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBBdXRvY29tcGxldGUoZWwsIG9wdGlvbnMpIHtcclxuICAgICAgICB2YXIgbm9vcCA9IGZ1bmN0aW9uICgpIHsgfSxcclxuICAgICAgICAgICAgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgIGRlZmF1bHRzID0ge1xyXG4gICAgICAgICAgICAgICAgYWpheFNldHRpbmdzOiB7fSxcclxuICAgICAgICAgICAgICAgIGF1dG9TZWxlY3RGaXJzdDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBhcHBlbmRUbzogZG9jdW1lbnQuYm9keSxcclxuICAgICAgICAgICAgICAgIHNlcnZpY2VVcmw6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBsb29rdXA6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBvblNlbGVjdDogbnVsbCxcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAnYXV0bycsXHJcbiAgICAgICAgICAgICAgICBtaW5DaGFyczogMSxcclxuICAgICAgICAgICAgICAgIG1heEhlaWdodDogMzAwLFxyXG4gICAgICAgICAgICAgICAgZGVmZXJSZXF1ZXN0Qnk6IDAsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHt9LFxyXG4gICAgICAgICAgICAgICAgZm9ybWF0UmVzdWx0OiBBdXRvY29tcGxldGUuZm9ybWF0UmVzdWx0LFxyXG4gICAgICAgICAgICAgICAgZGVsaW1pdGVyOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgekluZGV4OiA5OTk5LFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICBub0NhY2hlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIG9uU2VhcmNoU3RhcnQ6IG5vb3AsXHJcbiAgICAgICAgICAgICAgICBvblNlYXJjaENvbXBsZXRlOiBub29wLFxyXG4gICAgICAgICAgICAgICAgb25TZWFyY2hFcnJvcjogbm9vcCxcclxuICAgICAgICAgICAgICAgIHByZXNlcnZlSW5wdXQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyQ2xhc3M6ICdhdXRvY29tcGxldGUtc3VnZ2VzdGlvbnMnLFxyXG4gICAgICAgICAgICAgICAgdGFiRGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRSZXF1ZXN0OiBudWxsLFxyXG4gICAgICAgICAgICAgICAgdHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHByZXZlbnRCYWRRdWVyaWVzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgbG9va3VwRmlsdGVyOiBmdW5jdGlvbiAoc3VnZ2VzdGlvbiwgb3JpZ2luYWxRdWVyeSwgcXVlcnlMb3dlckNhc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbi52YWx1ZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnlMb3dlckNhc2UpICE9PSAtMTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBwYXJhbU5hbWU6ICdxdWVyeScsXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1SZXN1bHQ6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0eXBlb2YgcmVzcG9uc2UgPT09ICdzdHJpbmcnID8gJC5wYXJzZUpTT04ocmVzcG9uc2UpIDogcmVzcG9uc2U7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgc2hvd05vU3VnZ2VzdGlvbk5vdGljZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBub1N1Z2dlc3Rpb25Ob3RpY2U6ICdObyByZXN1bHRzJyxcclxuICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uOiAnYm90dG9tJyxcclxuICAgICAgICAgICAgICAgIGZvcmNlRml4UG9zaXRpb246IGZhbHNlXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIFNoYXJlZCB2YXJpYWJsZXM6XHJcbiAgICAgICAgdGhhdC5lbGVtZW50ID0gZWw7XHJcbiAgICAgICAgdGhhdC5lbCA9ICQoZWwpO1xyXG4gICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSBbXTtcclxuICAgICAgICB0aGF0LmJhZFF1ZXJpZXMgPSBbXTtcclxuICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcclxuICAgICAgICB0aGF0LmN1cnJlbnRWYWx1ZSA9IHRoYXQuZWxlbWVudC52YWx1ZTtcclxuICAgICAgICB0aGF0LmludGVydmFsSWQgPSAwO1xyXG4gICAgICAgIHRoYXQuY2FjaGVkUmVzcG9uc2UgPSB7fTtcclxuICAgICAgICB0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwgPSBudWxsO1xyXG4gICAgICAgIHRoYXQub25DaGFuZ2UgPSBudWxsO1xyXG4gICAgICAgIHRoYXQuaXNMb2NhbCA9IGZhbHNlO1xyXG4gICAgICAgIHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIgPSBudWxsO1xyXG4gICAgICAgIHRoYXQubm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9IG51bGw7XHJcbiAgICAgICAgdGhhdC5vcHRpb25zID0gJC5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHRpb25zKTtcclxuICAgICAgICB0aGF0LmNsYXNzZXMgPSB7XHJcbiAgICAgICAgICAgIHNlbGVjdGVkOiAnYXV0b2NvbXBsZXRlLXNlbGVjdGVkJyxcclxuICAgICAgICAgICAgc3VnZ2VzdGlvbjogJ2F1dG9jb21wbGV0ZS1zdWdnZXN0aW9uJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhhdC5oaW50ID0gbnVsbDtcclxuICAgICAgICB0aGF0LmhpbnRWYWx1ZSA9ICcnO1xyXG4gICAgICAgIHRoYXQuc2VsZWN0aW9uID0gbnVsbDtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBhbmQgc2V0IG9wdGlvbnM6XHJcbiAgICAgICAgdGhhdC5pbml0aWFsaXplKCk7XHJcbiAgICAgICAgdGhhdC5zZXRPcHRpb25zKG9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIEF1dG9jb21wbGV0ZS51dGlscyA9IHV0aWxzO1xyXG5cclxuICAgICQuQXV0b2NvbXBsZXRlID0gQXV0b2NvbXBsZXRlO1xyXG5cclxuICAgIEF1dG9jb21wbGV0ZS5mb3JtYXRSZXN1bHQgPSBmdW5jdGlvbiAoc3VnZ2VzdGlvbiwgY3VycmVudFZhbHVlKSB7XHJcbiAgICAgICAgLy8gRG8gbm90IHJlcGxhY2UgYW55dGhpbmcgaWYgdGhlcmUgY3VycmVudCB2YWx1ZSBpcyBlbXB0eVxyXG4gICAgICAgIGlmICghY3VycmVudFZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdWdnZXN0aW9uLnZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB2YXIgcGF0dGVybiA9ICcoJyArIHV0aWxzLmVzY2FwZVJlZ0V4Q2hhcnMoY3VycmVudFZhbHVlKSArICcpJztcclxuXHJcbiAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb24udmFsdWVcclxuICAgICAgICAgICAgLnJlcGxhY2UobmV3IFJlZ0V4cChwYXR0ZXJuLCAnZ2knKSwgJzxzdHJvbmc+JDE8XFwvc3Ryb25nPicpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcclxuICAgICAgICAgICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC8mbHQ7KFxcLz9zdHJvbmcpJmd0Oy9nLCAnPCQxPicpO1xyXG4gICAgfTtcclxuXHJcbiAgICBBdXRvY29tcGxldGUucHJvdG90eXBlID0ge1xyXG5cclxuICAgICAgICBraWxsZXJGbjogbnVsbCxcclxuXHJcbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9uU2VsZWN0b3IgPSAnLicgKyB0aGF0LmNsYXNzZXMuc3VnZ2VzdGlvbixcclxuICAgICAgICAgICAgICAgIHNlbGVjdGVkID0gdGhhdC5jbGFzc2VzLnNlbGVjdGVkLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lcjtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSBhdXRvY29tcGxldGUgYXR0cmlidXRlIHRvIHByZXZlbnQgbmF0aXZlIHN1Z2dlc3Rpb25zOlxyXG4gICAgICAgICAgICB0aGF0LmVsZW1lbnQuc2V0QXR0cmlidXRlKCdhdXRvY29tcGxldGUnLCAnb2ZmJyk7XHJcblxyXG4gICAgICAgICAgICB0aGF0LmtpbGxlckZuID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgIGlmICgkKGUudGFyZ2V0KS5jbG9zZXN0KCcuJyArIHRoYXQub3B0aW9ucy5jb250YWluZXJDbGFzcykubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5raWxsU3VnZ2VzdGlvbnMoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmRpc2FibGVLaWxsZXJGbigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLy8gaHRtbCgpIGRlYWxzIHdpdGggbWFueSB0eXBlczogaHRtbFN0cmluZyBvciBFbGVtZW50IG9yIEFycmF5IG9yIGpRdWVyeVxyXG4gICAgICAgICAgICB0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIgPSAkKCc8ZGl2IGNsYXNzPVwiYXV0b2NvbXBsZXRlLW5vLXN1Z2dlc3Rpb25cIj48L2Rpdj4nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaHRtbCh0aGlzLm9wdGlvbnMubm9TdWdnZXN0aW9uTm90aWNlKS5nZXQoMCk7XHJcblxyXG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyID0gQXV0b2NvbXBsZXRlLnV0aWxzLmNyZWF0ZU5vZGUob3B0aW9ucy5jb250YWluZXJDbGFzcyk7XHJcblxyXG4gICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZFRvKG9wdGlvbnMuYXBwZW5kVG8pO1xyXG5cclxuICAgICAgICAgICAgLy8gT25seSBzZXQgd2lkdGggaWYgaXQgd2FzIHByb3ZpZGVkOlxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy53aWR0aCAhPT0gJ2F1dG8nKSB7XHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIud2lkdGgob3B0aW9ucy53aWR0aCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIExpc3RlbiBmb3IgbW91c2Ugb3ZlciBldmVudCBvbiBzdWdnZXN0aW9ucyBsaXN0OlxyXG4gICAgICAgICAgICBjb250YWluZXIub24oJ21vdXNlb3Zlci5hdXRvY29tcGxldGUnLCBzdWdnZXN0aW9uU2VsZWN0b3IsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuYWN0aXZhdGUoJCh0aGlzKS5kYXRhKCdpbmRleCcpKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBEZXNlbGVjdCBhY3RpdmUgZWxlbWVudCB3aGVuIG1vdXNlIGxlYXZlcyBzdWdnZXN0aW9ucyBjb250YWluZXI6XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5vbignbW91c2VvdXQuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIuY2hpbGRyZW4oJy4nICsgc2VsZWN0ZWQpLnJlbW92ZUNsYXNzKHNlbGVjdGVkKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBMaXN0ZW4gZm9yIGNsaWNrIGV2ZW50IG9uIHN1Z2dlc3Rpb25zIGxpc3Q6XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5vbignY2xpY2suYXV0b2NvbXBsZXRlJywgc3VnZ2VzdGlvblNlbGVjdG9yLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCgkKHRoaXMpLmRhdGEoJ2luZGV4JykpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb25DYXB0dXJlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoYXQudmlzaWJsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICQod2luZG93KS5vbigncmVzaXplLmF1dG9jb21wbGV0ZScsIHRoYXQuZml4UG9zaXRpb25DYXB0dXJlKTtcclxuXHJcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2tleWRvd24uYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVByZXNzKGUpOyB9KTtcclxuICAgICAgICAgICAgdGhhdC5lbC5vbigna2V5dXAuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVVwKGUpOyB9KTtcclxuICAgICAgICAgICAgdGhhdC5lbC5vbignYmx1ci5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoKSB7IHRoYXQub25CbHVyKCk7IH0pO1xyXG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdmb2N1cy5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoKSB7IHRoYXQub25Gb2N1cygpOyB9KTtcclxuICAgICAgICAgICAgdGhhdC5lbC5vbignY2hhbmdlLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlVcChlKTsgfSk7XHJcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2lucHV0LmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlVcChlKTsgfSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgb25Gb2N1czogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhhdC5lbC52YWwoKS5sZW5ndGggPj0gdGhhdC5vcHRpb25zLm1pbkNoYXJzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0Lm9uVmFsdWVDaGFuZ2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG9uQmx1cjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmVuYWJsZUtpbGxlckZuKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBcclxuICAgICAgICBhYm9ydEFqYXg6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICBpZiAodGhhdC5jdXJyZW50UmVxdWVzdCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5jdXJyZW50UmVxdWVzdC5hYm9ydCgpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5jdXJyZW50UmVxdWVzdCA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzZXRPcHRpb25zOiBmdW5jdGlvbiAoc3VwcGxpZWRPcHRpb25zKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnM7XHJcblxyXG4gICAgICAgICAgICAkLmV4dGVuZChvcHRpb25zLCBzdXBwbGllZE9wdGlvbnMpO1xyXG5cclxuICAgICAgICAgICAgdGhhdC5pc0xvY2FsID0gJC5pc0FycmF5KG9wdGlvbnMubG9va3VwKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LmlzTG9jYWwpIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMubG9va3VwID0gdGhhdC52ZXJpZnlTdWdnZXN0aW9uc0Zvcm1hdChvcHRpb25zLmxvb2t1cCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG9wdGlvbnMub3JpZW50YXRpb24gPSB0aGF0LnZhbGlkYXRlT3JpZW50YXRpb24ob3B0aW9ucy5vcmllbnRhdGlvbiwgJ2JvdHRvbScpO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRqdXN0IGhlaWdodCwgd2lkdGggYW5kIHotaW5kZXg6XHJcbiAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuY3NzKHtcclxuICAgICAgICAgICAgICAgICdtYXgtaGVpZ2h0Jzogb3B0aW9ucy5tYXhIZWlnaHQgKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogb3B0aW9ucy53aWR0aCArICdweCcsXHJcbiAgICAgICAgICAgICAgICAnei1pbmRleCc6IG9wdGlvbnMuekluZGV4XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcblxyXG5cclxuICAgICAgICBjbGVhckNhY2hlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FjaGVkUmVzcG9uc2UgPSB7fTtcclxuICAgICAgICAgICAgdGhpcy5iYWRRdWVyaWVzID0gW107XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgY2xlYXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5jbGVhckNhY2hlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFZhbHVlID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMuc3VnZ2VzdGlvbnMgPSBbXTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgdGhhdC5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcclxuICAgICAgICAgICAgdGhhdC5hYm9ydEFqYXgoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBlbmFibGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGZpeFBvc2l0aW9uOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIFVzZSBvbmx5IHdoZW4gY29udGFpbmVyIGhhcyBhbHJlYWR5IGl0cyBjb250ZW50XHJcblxyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAkY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKSxcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lclBhcmVudCA9ICRjb250YWluZXIucGFyZW50KCkuZ2V0KDApO1xyXG4gICAgICAgICAgICAvLyBGaXggcG9zaXRpb24gYXV0b21hdGljYWxseSB3aGVuIGFwcGVuZGVkIHRvIGJvZHkuXHJcbiAgICAgICAgICAgIC8vIEluIG90aGVyIGNhc2VzIGZvcmNlIHBhcmFtZXRlciBtdXN0IGJlIGdpdmVuLlxyXG4gICAgICAgICAgICBpZiAoY29udGFpbmVyUGFyZW50ICE9PSBkb2N1bWVudC5ib2R5ICYmICF0aGF0Lm9wdGlvbnMuZm9yY2VGaXhQb3NpdGlvbikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBDaG9vc2Ugb3JpZW50YXRpb25cclxuICAgICAgICAgICAgdmFyIG9yaWVudGF0aW9uID0gdGhhdC5vcHRpb25zLm9yaWVudGF0aW9uLFxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVySGVpZ2h0ID0gJGNvbnRhaW5lci5vdXRlckhlaWdodCgpLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gdGhhdC5lbC5vdXRlckhlaWdodCgpLFxyXG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gdGhhdC5lbC5vZmZzZXQoKSxcclxuICAgICAgICAgICAgICAgIHN0eWxlcyA9IHsgJ3RvcCc6IG9mZnNldC50b3AsICdsZWZ0Jzogb2Zmc2V0LmxlZnQgfTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvcmllbnRhdGlvbiA9PT0gJ2F1dG8nKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdmlld1BvcnRIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCksXHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsVG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpLFxyXG4gICAgICAgICAgICAgICAgICAgIHRvcE92ZXJmbG93ID0gLXNjcm9sbFRvcCArIG9mZnNldC50b3AgLSBjb250YWluZXJIZWlnaHQsXHJcbiAgICAgICAgICAgICAgICAgICAgYm90dG9tT3ZlcmZsb3cgPSBzY3JvbGxUb3AgKyB2aWV3UG9ydEhlaWdodCAtIChvZmZzZXQudG9wICsgaGVpZ2h0ICsgY29udGFpbmVySGVpZ2h0KTtcclxuXHJcbiAgICAgICAgICAgICAgICBvcmllbnRhdGlvbiA9IChNYXRoLm1heCh0b3BPdmVyZmxvdywgYm90dG9tT3ZlcmZsb3cpID09PSB0b3BPdmVyZmxvdykgPyAndG9wJyA6ICdib3R0b20nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAob3JpZW50YXRpb24gPT09ICd0b3AnKSB7XHJcbiAgICAgICAgICAgICAgICBzdHlsZXMudG9wICs9IC1jb250YWluZXJIZWlnaHQ7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzdHlsZXMudG9wICs9IGhlaWdodDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gSWYgY29udGFpbmVyIGlzIG5vdCBwb3NpdGlvbmVkIHRvIGJvZHksXHJcbiAgICAgICAgICAgIC8vIGNvcnJlY3QgaXRzIHBvc2l0aW9uIHVzaW5nIG9mZnNldCBwYXJlbnQgb2Zmc2V0XHJcbiAgICAgICAgICAgIGlmKGNvbnRhaW5lclBhcmVudCAhPT0gZG9jdW1lbnQuYm9keSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9wYWNpdHkgPSAkY29udGFpbmVyLmNzcygnb3BhY2l0eScpLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudE9mZnNldERpZmY7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhhdC52aXNpYmxlKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGNvbnRhaW5lci5jc3MoJ29wYWNpdHknLCAwKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHBhcmVudE9mZnNldERpZmYgPSAkY29udGFpbmVyLm9mZnNldFBhcmVudCgpLm9mZnNldCgpO1xyXG4gICAgICAgICAgICAgICAgc3R5bGVzLnRvcCAtPSBwYXJlbnRPZmZzZXREaWZmLnRvcDtcclxuICAgICAgICAgICAgICAgIHN0eWxlcy5sZWZ0IC09IHBhcmVudE9mZnNldERpZmYubGVmdDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoYXQudmlzaWJsZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgJGNvbnRhaW5lci5jc3MoJ29wYWNpdHknLCBvcGFjaXR5KS5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIC0ycHggdG8gYWNjb3VudCBmb3Igc3VnZ2VzdGlvbnMgYm9yZGVyLlxyXG4gICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLndpZHRoID09PSAnYXV0bycpIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlcy53aWR0aCA9ICh0aGF0LmVsLm91dGVyV2lkdGgoKSAtIDIpICsgJ3B4JztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgJGNvbnRhaW5lci5jc3Moc3R5bGVzKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBlbmFibGVLaWxsZXJGbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljay5hdXRvY29tcGxldGUnLCB0aGF0LmtpbGxlckZuKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBkaXNhYmxlS2lsbGVyRm46IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLmF1dG9jb21wbGV0ZScsIHRoYXQua2lsbGVyRm4pO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGtpbGxTdWdnZXN0aW9uczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgIHRoYXQuc3RvcEtpbGxTdWdnZXN0aW9ucygpO1xyXG4gICAgICAgICAgICB0aGF0LmludGVydmFsSWQgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoYXQudmlzaWJsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhhdC5zdG9wS2lsbFN1Z2dlc3Rpb25zKCk7XHJcbiAgICAgICAgICAgIH0sIDUwKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzdG9wS2lsbFN1Z2dlc3Rpb25zOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWxJZCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgaXNDdXJzb3JBdEVuZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICB2YWxMZW5ndGggPSB0aGF0LmVsLnZhbCgpLmxlbmd0aCxcclxuICAgICAgICAgICAgICAgIHNlbGVjdGlvblN0YXJ0ID0gdGhhdC5lbGVtZW50LnNlbGVjdGlvblN0YXJ0LFxyXG4gICAgICAgICAgICAgICAgcmFuZ2U7XHJcblxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHNlbGVjdGlvblN0YXJ0ID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGlvblN0YXJ0ID09PSB2YWxMZW5ndGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRvY3VtZW50LnNlbGVjdGlvbikge1xyXG4gICAgICAgICAgICAgICAgcmFuZ2UgPSBkb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKTtcclxuICAgICAgICAgICAgICAgIHJhbmdlLm1vdmVTdGFydCgnY2hhcmFjdGVyJywgLXZhbExlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsTGVuZ3RoID09PSByYW5nZS50ZXh0Lmxlbmd0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBvbktleVByZXNzOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBzdWdnZXN0aW9ucyBhcmUgaGlkZGVuIGFuZCB1c2VyIHByZXNzZXMgYXJyb3cgZG93biwgZGlzcGxheSBzdWdnZXN0aW9uczpcclxuICAgICAgICAgICAgaWYgKCF0aGF0LmRpc2FibGVkICYmICF0aGF0LnZpc2libGUgJiYgZS53aGljaCA9PT0ga2V5cy5ET1dOICYmIHRoYXQuY3VycmVudFZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuZGlzYWJsZWQgfHwgIXRoYXQudmlzaWJsZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2ggKGUud2hpY2gpIHtcclxuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5FU0M6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlJJR0hUOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LmhpbnQgJiYgdGhhdC5vcHRpb25zLm9uSGludCAmJiB0aGF0LmlzQ3Vyc29yQXRFbmQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdEhpbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5UQUI6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuaGludCAmJiB0aGF0Lm9wdGlvbnMub25IaW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0SGludCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KHRoYXQuc2VsZWN0ZWRJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy50YWJEaXNhYmxlZCA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5SRVRVUk46XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QodGhhdC5zZWxlY3RlZEluZGV4KTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5VUDpcclxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm1vdmVVcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLkRPV046XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5tb3ZlRG93bigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIENhbmNlbCBldmVudCBpZiBmdW5jdGlvbiBkaWQgbm90IHJldHVybjpcclxuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG9uS2V5VXA6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LmRpc2FibGVkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlVQOlxyXG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLkRPV046XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhhdC5jdXJyZW50VmFsdWUgIT09IHRoYXQuZWwudmFsKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuZmluZEJlc3RIaW50KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLmRlZmVyUmVxdWVzdEJ5ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIERlZmVyIGxvb2t1cCBpbiBjYXNlIHdoZW4gdmFsdWUgY2hhbmdlcyB2ZXJ5IHF1aWNrbHk6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5vbkNoYW5nZUludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uVmFsdWVDaGFuZ2UoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCB0aGF0Lm9wdGlvbnMuZGVmZXJSZXF1ZXN0QnkpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uVmFsdWVDaGFuZ2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG9uVmFsdWVDaGFuZ2U6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gdGhhdC5lbC52YWwoKSxcclxuICAgICAgICAgICAgICAgIHF1ZXJ5ID0gdGhhdC5nZXRRdWVyeSh2YWx1ZSk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3Rpb24gJiYgdGhhdC5jdXJyZW50VmFsdWUgIT09IHF1ZXJ5KSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGlvbiA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAob3B0aW9ucy5vbkludmFsaWRhdGVTZWxlY3Rpb24gfHwgJC5ub29wKS5jYWxsKHRoYXQuZWxlbWVudCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcclxuICAgICAgICAgICAgdGhhdC5jdXJyZW50VmFsdWUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XHJcblxyXG4gICAgICAgICAgICAvLyBDaGVjayBleGlzdGluZyBzdWdnZXN0aW9uIGZvciB0aGUgbWF0Y2ggYmVmb3JlIHByb2NlZWRpbmc6XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQgJiYgdGhhdC5pc0V4YWN0TWF0Y2gocXVlcnkpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCgwKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHF1ZXJ5Lmxlbmd0aCA8IG9wdGlvbnMubWluQ2hhcnMpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5nZXRTdWdnZXN0aW9ucyhxdWVyeSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBpc0V4YWN0TWF0Y2g6IGZ1bmN0aW9uIChxdWVyeSkge1xyXG4gICAgICAgICAgICB2YXIgc3VnZ2VzdGlvbnMgPSB0aGlzLnN1Z2dlc3Rpb25zO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIChzdWdnZXN0aW9ucy5sZW5ndGggPT09IDEgJiYgc3VnZ2VzdGlvbnNbMF0udmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gcXVlcnkudG9Mb3dlckNhc2UoKSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZ2V0UXVlcnk6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgICB2YXIgZGVsaW1pdGVyID0gdGhpcy5vcHRpb25zLmRlbGltaXRlcixcclxuICAgICAgICAgICAgICAgIHBhcnRzO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFkZWxpbWl0ZXIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwYXJ0cyA9IHZhbHVlLnNwbGl0KGRlbGltaXRlcik7XHJcbiAgICAgICAgICAgIHJldHVybiAkLnRyaW0ocGFydHNbcGFydHMubGVuZ3RoIC0gMV0pO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGdldFN1Z2dlc3Rpb25zTG9jYWw6IGZ1bmN0aW9uIChxdWVyeSkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgcXVlcnlMb3dlckNhc2UgPSBxdWVyeS50b0xvd2VyQ2FzZSgpLFxyXG4gICAgICAgICAgICAgICAgZmlsdGVyID0gb3B0aW9ucy5sb29rdXBGaWx0ZXIsXHJcbiAgICAgICAgICAgICAgICBsaW1pdCA9IHBhcnNlSW50KG9wdGlvbnMubG9va3VwTGltaXQsIDEwKSxcclxuICAgICAgICAgICAgICAgIGRhdGE7XHJcblxyXG4gICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgc3VnZ2VzdGlvbnM6ICQuZ3JlcChvcHRpb25zLmxvb2t1cCwgZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmlsdGVyKHN1Z2dlc3Rpb24sIHF1ZXJ5LCBxdWVyeUxvd2VyQ2FzZSk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgaWYgKGxpbWl0ICYmIGRhdGEuc3VnZ2VzdGlvbnMubGVuZ3RoID4gbGltaXQpIHtcclxuICAgICAgICAgICAgICAgIGRhdGEuc3VnZ2VzdGlvbnMgPSBkYXRhLnN1Z2dlc3Rpb25zLnNsaWNlKDAsIGxpbWl0KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZ2V0U3VnZ2VzdGlvbnM6IGZ1bmN0aW9uIChxKSB7XHJcbiAgICAgICAgICAgIHZhciByZXNwb25zZSxcclxuICAgICAgICAgICAgICAgIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcclxuICAgICAgICAgICAgICAgIHNlcnZpY2VVcmwgPSBvcHRpb25zLnNlcnZpY2VVcmwsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXMsXHJcbiAgICAgICAgICAgICAgICBjYWNoZUtleSxcclxuICAgICAgICAgICAgICAgIGFqYXhTZXR0aW5ncztcclxuXHJcbiAgICAgICAgICAgIG9wdGlvbnMucGFyYW1zW29wdGlvbnMucGFyYW1OYW1lXSA9IHE7XHJcbiAgICAgICAgICAgIHBhcmFtcyA9IG9wdGlvbnMuaWdub3JlUGFyYW1zID8gbnVsbCA6IG9wdGlvbnMucGFyYW1zO1xyXG5cclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMub25TZWFyY2hTdGFydC5jYWxsKHRoYXQuZWxlbWVudCwgb3B0aW9ucy5wYXJhbXMpID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKG9wdGlvbnMubG9va3VwKSl7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLmxvb2t1cChxLCBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSBkYXRhLnN1Z2dlc3Rpb25zO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgZGF0YS5zdWdnZXN0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuaXNMb2NhbCkge1xyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB0aGF0LmdldFN1Z2dlc3Rpb25zTG9jYWwocSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKHNlcnZpY2VVcmwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZVVybCA9IHNlcnZpY2VVcmwuY2FsbCh0aGF0LmVsZW1lbnQsIHEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2FjaGVLZXkgPSBzZXJ2aWNlVXJsICsgJz8nICsgJC5wYXJhbShwYXJhbXMgfHwge30pO1xyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB0aGF0LmNhY2hlZFJlc3BvbnNlW2NhY2hlS2V5XTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlICYmICQuaXNBcnJheShyZXNwb25zZS5zdWdnZXN0aW9ucykpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSByZXNwb25zZS5zdWdnZXN0aW9ucztcclxuICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaENvbXBsZXRlLmNhbGwodGhhdC5lbGVtZW50LCBxLCByZXNwb25zZS5zdWdnZXN0aW9ucyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoYXQuaXNCYWRRdWVyeShxKSkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5hYm9ydEFqYXgoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBhamF4U2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBzZXJ2aWNlVXJsLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHBhcmFtcyxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBvcHRpb25zLnR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IG9wdGlvbnMuZGF0YVR5cGVcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgJC5leHRlbmQoYWpheFNldHRpbmdzLCBvcHRpb25zLmFqYXhTZXR0aW5ncyk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhhdC5jdXJyZW50UmVxdWVzdCA9ICQuYWpheChhamF4U2V0dGluZ3MpLmRvbmUoZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG9wdGlvbnMudHJhbnNmb3JtUmVzdWx0KGRhdGEsIHEpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQucHJvY2Vzc1Jlc3BvbnNlKHJlc3VsdCwgcSwgY2FjaGVLZXkpO1xyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgcmVzdWx0LnN1Z2dlc3Rpb25zKTtcclxuICAgICAgICAgICAgICAgIH0pLmZhaWwoZnVuY3Rpb24gKGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bikge1xyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hFcnJvci5jYWxsKHRoYXQuZWxlbWVudCwgcSwganFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaENvbXBsZXRlLmNhbGwodGhhdC5lbGVtZW50LCBxLCBbXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBpc0JhZFF1ZXJ5OiBmdW5jdGlvbiAocSkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5wcmV2ZW50QmFkUXVlcmllcyl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBiYWRRdWVyaWVzID0gdGhpcy5iYWRRdWVyaWVzLFxyXG4gICAgICAgICAgICAgICAgaSA9IGJhZFF1ZXJpZXMubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgd2hpbGUgKGktLSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHEuaW5kZXhPZihiYWRRdWVyaWVzW2ldKSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgaGlkZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbih0aGF0Lm9wdGlvbnMub25IaWRlKSAmJiB0aGF0LnZpc2libGUpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQub3B0aW9ucy5vbkhpZGUuY2FsbCh0aGF0LmVsZW1lbnQsIGNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoYXQudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLmhpZGUoKTtcclxuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KG51bGwpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHN1Z2dlc3Q6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc3VnZ2VzdGlvbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNob3dOb1N1Z2dlc3Rpb25Ob3RpY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vU3VnZ2VzdGlvbnMoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgICBncm91cEJ5ID0gb3B0aW9ucy5ncm91cEJ5LFxyXG4gICAgICAgICAgICAgICAgZm9ybWF0UmVzdWx0ID0gb3B0aW9ucy5mb3JtYXRSZXN1bHQsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoYXQuZ2V0UXVlcnkodGhhdC5jdXJyZW50VmFsdWUpLFxyXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gdGhhdC5jbGFzc2VzLnN1Z2dlc3Rpb24sXHJcbiAgICAgICAgICAgICAgICBjbGFzc1NlbGVjdGVkID0gdGhhdC5jbGFzc2VzLnNlbGVjdGVkLFxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKSxcclxuICAgICAgICAgICAgICAgIG5vU3VnZ2VzdGlvbnNDb250YWluZXIgPSAkKHRoYXQubm9TdWdnZXN0aW9uc0NvbnRhaW5lciksXHJcbiAgICAgICAgICAgICAgICBiZWZvcmVSZW5kZXIgPSBvcHRpb25zLmJlZm9yZVJlbmRlcixcclxuICAgICAgICAgICAgICAgIGh0bWwgPSAnJyxcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgZm9ybWF0R3JvdXAgPSBmdW5jdGlvbiAoc3VnZ2VzdGlvbiwgaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRDYXRlZ29yeSA9IHN1Z2dlc3Rpb24uZGF0YVtncm91cEJ5XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYXRlZ29yeSA9PT0gY3VycmVudENhdGVnb3J5KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnkgPSBjdXJyZW50Q2F0ZWdvcnk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJhdXRvY29tcGxldGUtZ3JvdXBcIj48c3Ryb25nPicgKyBjYXRlZ29yeSArICc8L3N0cm9uZz48L2Rpdj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy50cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0ICYmIHRoYXQuaXNFeGFjdE1hdGNoKHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QoMCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEJ1aWxkIHN1Z2dlc3Rpb25zIGlubmVyIEhUTUw6XHJcbiAgICAgICAgICAgICQuZWFjaCh0aGF0LnN1Z2dlc3Rpb25zLCBmdW5jdGlvbiAoaSwgc3VnZ2VzdGlvbikge1xyXG4gICAgICAgICAgICAgICAgaWYgKGdyb3VwQnkpe1xyXG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gZm9ybWF0R3JvdXAoc3VnZ2VzdGlvbiwgdmFsdWUsIGkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCInICsgY2xhc3NOYW1lICsgJ1wiIGRhdGEtaW5kZXg9XCInICsgaSArICdcIj4nICsgZm9ybWF0UmVzdWx0KHN1Z2dlc3Rpb24sIHZhbHVlKSArICc8L2Rpdj4nO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWRqdXN0Q29udGFpbmVyV2lkdGgoKTtcclxuXHJcbiAgICAgICAgICAgIG5vU3VnZ2VzdGlvbnNDb250YWluZXIuZGV0YWNoKCk7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5odG1sKGh0bWwpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihiZWZvcmVSZW5kZXIpKSB7XHJcbiAgICAgICAgICAgICAgICBiZWZvcmVSZW5kZXIuY2FsbCh0aGF0LmVsZW1lbnQsIGNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcclxuICAgICAgICAgICAgY29udGFpbmVyLnNob3coKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNlbGVjdCBmaXJzdCB2YWx1ZSBieSBkZWZhdWx0OlxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5hdXRvU2VsZWN0Rmlyc3QpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IDA7XHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wKDApO1xyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmNoaWxkcmVuKCcuJyArIGNsYXNzTmFtZSkuZmlyc3QoKS5hZGRDbGFzcyhjbGFzc1NlbGVjdGVkKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhhdC52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhhdC5maW5kQmVzdEhpbnQoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBub1N1Z2dlc3Rpb25zOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxyXG4gICAgICAgICAgICAgICAgIG5vU3VnZ2VzdGlvbnNDb250YWluZXIgPSAkKHRoYXQubm9TdWdnZXN0aW9uc0NvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFkanVzdENvbnRhaW5lcldpZHRoKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBTb21lIGV4cGxpY2l0IHN0ZXBzLiBCZSBjYXJlZnVsIGhlcmUgYXMgaXQgZWFzeSB0byBnZXRcclxuICAgICAgICAgICAgLy8gbm9TdWdnZXN0aW9uc0NvbnRhaW5lciByZW1vdmVkIGZyb20gRE9NIGlmIG5vdCBkZXRhY2hlZCBwcm9wZXJseS5cclxuICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lci5kZXRhY2goKTtcclxuICAgICAgICAgICAgY29udGFpbmVyLmVtcHR5KCk7IC8vIGNsZWFuIHN1Z2dlc3Rpb25zIGlmIGFueVxyXG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kKG5vU3VnZ2VzdGlvbnNDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgY29udGFpbmVyLnNob3coKTtcclxuICAgICAgICAgICAgdGhhdC52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBhZGp1c3RDb250YWluZXJXaWR0aDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgICB3aWR0aCxcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiB3aWR0aCBpcyBhdXRvLCBhZGp1c3Qgd2lkdGggYmVmb3JlIGRpc3BsYXlpbmcgc3VnZ2VzdGlvbnMsXHJcbiAgICAgICAgICAgIC8vIGJlY2F1c2UgaWYgaW5zdGFuY2Ugd2FzIGNyZWF0ZWQgYmVmb3JlIGlucHV0IGhhZCB3aWR0aCwgaXQgd2lsbCBiZSB6ZXJvLlxyXG4gICAgICAgICAgICAvLyBBbHNvIGl0IGFkanVzdHMgaWYgaW5wdXQgd2lkdGggaGFzIGNoYW5nZWQuXHJcbiAgICAgICAgICAgIC8vIC0ycHggdG8gYWNjb3VudCBmb3Igc3VnZ2VzdGlvbnMgYm9yZGVyLlxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy53aWR0aCA9PT0gJ2F1dG8nKSB7XHJcbiAgICAgICAgICAgICAgICB3aWR0aCA9IHRoYXQuZWwub3V0ZXJXaWR0aCgpIC0gMjtcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci53aWR0aCh3aWR0aCA+IDAgPyB3aWR0aCA6IDMwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBmaW5kQmVzdEhpbnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGF0LmVsLnZhbCgpLnRvTG93ZXJDYXNlKCksXHJcbiAgICAgICAgICAgICAgICBiZXN0TWF0Y2ggPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAkLmVhY2godGhhdC5zdWdnZXN0aW9ucywgZnVuY3Rpb24gKGksIHN1Z2dlc3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIHZhciBmb3VuZE1hdGNoID0gc3VnZ2VzdGlvbi52YWx1ZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YodmFsdWUpID09PSAwO1xyXG4gICAgICAgICAgICAgICAgaWYgKGZvdW5kTWF0Y2gpIHtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0TWF0Y2ggPSBzdWdnZXN0aW9uO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICFmb3VuZE1hdGNoO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoYXQuc2lnbmFsSGludChiZXN0TWF0Y2gpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNpZ25hbEhpbnQ6IGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XHJcbiAgICAgICAgICAgIHZhciBoaW50VmFsdWUgPSAnJyxcclxuICAgICAgICAgICAgICAgIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICBpZiAoc3VnZ2VzdGlvbikge1xyXG4gICAgICAgICAgICAgICAgaGludFZhbHVlID0gdGhhdC5jdXJyZW50VmFsdWUgKyBzdWdnZXN0aW9uLnZhbHVlLnN1YnN0cih0aGF0LmN1cnJlbnRWYWx1ZS5sZW5ndGgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGF0LmhpbnRWYWx1ZSAhPT0gaGludFZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmhpbnRWYWx1ZSA9IGhpbnRWYWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoYXQuaGludCA9IHN1Z2dlc3Rpb247XHJcbiAgICAgICAgICAgICAgICAodGhpcy5vcHRpb25zLm9uSGludCB8fCAkLm5vb3ApKGhpbnRWYWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICB2ZXJpZnlTdWdnZXN0aW9uc0Zvcm1hdDogZnVuY3Rpb24gKHN1Z2dlc3Rpb25zKSB7XHJcbiAgICAgICAgICAgIC8vIElmIHN1Z2dlc3Rpb25zIGlzIHN0cmluZyBhcnJheSwgY29udmVydCB0aGVtIHRvIHN1cHBvcnRlZCBmb3JtYXQ6XHJcbiAgICAgICAgICAgIGlmIChzdWdnZXN0aW9ucy5sZW5ndGggJiYgdHlwZW9mIHN1Z2dlc3Rpb25zWzBdID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICQubWFwKHN1Z2dlc3Rpb25zLCBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogdmFsdWUsIGRhdGE6IG51bGwgfTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbnM7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgdmFsaWRhdGVPcmllbnRhdGlvbjogZnVuY3Rpb24ob3JpZW50YXRpb24sIGZhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIG9yaWVudGF0aW9uID0gJC50cmltKG9yaWVudGF0aW9uIHx8ICcnKS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgICAgICAgaWYoJC5pbkFycmF5KG9yaWVudGF0aW9uLCBbJ2F1dG8nLCAnYm90dG9tJywgJ3RvcCddKSA9PT0gLTEpe1xyXG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb24gPSBmYWxsYmFjaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG9yaWVudGF0aW9uO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHByb2Nlc3NSZXNwb25zZTogZnVuY3Rpb24gKHJlc3VsdCwgb3JpZ2luYWxRdWVyeSwgY2FjaGVLZXkpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucztcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdC5zdWdnZXN0aW9ucyA9IHRoYXQudmVyaWZ5U3VnZ2VzdGlvbnNGb3JtYXQocmVzdWx0LnN1Z2dlc3Rpb25zKTtcclxuXHJcbiAgICAgICAgICAgIC8vIENhY2hlIHJlc3VsdHMgaWYgY2FjaGUgaXMgbm90IGRpc2FibGVkOlxyXG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMubm9DYWNoZSkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5jYWNoZWRSZXNwb25zZVtjYWNoZUtleV0gPSByZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5wcmV2ZW50QmFkUXVlcmllcyAmJiByZXN1bHQuc3VnZ2VzdGlvbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5iYWRRdWVyaWVzLnB1c2gob3JpZ2luYWxRdWVyeSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFJldHVybiBpZiBvcmlnaW5hbFF1ZXJ5IGlzIG5vdCBtYXRjaGluZyBjdXJyZW50IHF1ZXJ5OlxyXG4gICAgICAgICAgICBpZiAob3JpZ2luYWxRdWVyeSAhPT0gdGhhdC5nZXRRdWVyeSh0aGF0LmN1cnJlbnRWYWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IHJlc3VsdC5zdWdnZXN0aW9ucztcclxuICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgYWN0aXZhdGU6IGZ1bmN0aW9uIChpbmRleCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBhY3RpdmVJdGVtLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSB0aGF0LmNsYXNzZXMuc2VsZWN0ZWQsXHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxyXG4gICAgICAgICAgICAgICAgY2hpbGRyZW4gPSBjb250YWluZXIuZmluZCgnLicgKyB0aGF0LmNsYXNzZXMuc3VnZ2VzdGlvbik7XHJcblxyXG4gICAgICAgICAgICBjb250YWluZXIuZmluZCgnLicgKyBzZWxlY3RlZCkucmVtb3ZlQ2xhc3Moc2VsZWN0ZWQpO1xyXG5cclxuICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gaW5kZXg7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ICE9PSAtMSAmJiBjaGlsZHJlbi5sZW5ndGggPiB0aGF0LnNlbGVjdGVkSW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIGFjdGl2ZUl0ZW0gPSBjaGlsZHJlbi5nZXQodGhhdC5zZWxlY3RlZEluZGV4KTtcclxuICAgICAgICAgICAgICAgICQoYWN0aXZlSXRlbSkuYWRkQ2xhc3Moc2VsZWN0ZWQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjdGl2ZUl0ZW07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNlbGVjdEhpbnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgaSA9ICQuaW5BcnJheSh0aGF0LmhpbnQsIHRoYXQuc3VnZ2VzdGlvbnMpO1xyXG5cclxuICAgICAgICAgICAgdGhhdC5zZWxlY3QoaSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2VsZWN0OiBmdW5jdGlvbiAoaSkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xyXG4gICAgICAgICAgICB0aGF0Lm9uU2VsZWN0KGkpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG1vdmVVcDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLmNoaWxkcmVuKCkuZmlyc3QoKS5yZW1vdmVDbGFzcyh0aGF0LmNsYXNzZXMuc2VsZWN0ZWQpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmN1cnJlbnRWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmZpbmRCZXN0SGludCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGF0LmFkanVzdFNjcm9sbCh0aGF0LnNlbGVjdGVkSW5kZXggLSAxKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBtb3ZlRG93bjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAodGhhdC5zdWdnZXN0aW9ucy5sZW5ndGggLSAxKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGF0LmFkanVzdFNjcm9sbCh0aGF0LnNlbGVjdGVkSW5kZXggKyAxKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBhZGp1c3RTY3JvbGw6IGZ1bmN0aW9uIChpbmRleCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBhY3RpdmVJdGVtID0gdGhhdC5hY3RpdmF0ZShpbmRleCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWFjdGl2ZUl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIG9mZnNldFRvcCxcclxuICAgICAgICAgICAgICAgIHVwcGVyQm91bmQsXHJcbiAgICAgICAgICAgICAgICBsb3dlckJvdW5kLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0RGVsdGEgPSAkKGFjdGl2ZUl0ZW0pLm91dGVySGVpZ2h0KCk7XHJcblxyXG4gICAgICAgICAgICBvZmZzZXRUb3AgPSBhY3RpdmVJdGVtLm9mZnNldFRvcDtcclxuICAgICAgICAgICAgdXBwZXJCb3VuZCA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuc2Nyb2xsVG9wKCk7XHJcbiAgICAgICAgICAgIGxvd2VyQm91bmQgPSB1cHBlckJvdW5kICsgdGhhdC5vcHRpb25zLm1heEhlaWdodCAtIGhlaWdodERlbHRhO1xyXG5cclxuICAgICAgICAgICAgaWYgKG9mZnNldFRvcCA8IHVwcGVyQm91bmQpIHtcclxuICAgICAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuc2Nyb2xsVG9wKG9mZnNldFRvcCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob2Zmc2V0VG9wID4gbG93ZXJCb3VuZCkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5zY3JvbGxUb3Aob2Zmc2V0VG9wIC0gdGhhdC5vcHRpb25zLm1heEhlaWdodCArIGhlaWdodERlbHRhKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCF0aGF0Lm9wdGlvbnMucHJlc2VydmVJbnB1dCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5nZXRWYWx1ZSh0aGF0LnN1Z2dlc3Rpb25zW2luZGV4XS52YWx1ZSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoYXQuc2lnbmFsSGludChudWxsKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBvblNlbGVjdDogZnVuY3Rpb24gKGluZGV4KSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIG9uU2VsZWN0Q2FsbGJhY2sgPSB0aGF0Lm9wdGlvbnMub25TZWxlY3QsXHJcbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9uID0gdGhhdC5zdWdnZXN0aW9uc1tpbmRleF07XHJcblxyXG4gICAgICAgICAgICB0aGF0LmN1cnJlbnRWYWx1ZSA9IHRoYXQuZ2V0VmFsdWUoc3VnZ2VzdGlvbi52YWx1ZSk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhhdC5jdXJyZW50VmFsdWUgIT09IHRoYXQuZWwudmFsKCkgJiYgIXRoYXQub3B0aW9ucy5wcmVzZXJ2ZUlucHV0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmN1cnJlbnRWYWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoYXQuc2lnbmFsSGludChudWxsKTtcclxuICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IFtdO1xyXG4gICAgICAgICAgICB0aGF0LnNlbGVjdGlvbiA9IHN1Z2dlc3Rpb247XHJcblxyXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKG9uU2VsZWN0Q2FsbGJhY2spKSB7XHJcbiAgICAgICAgICAgICAgICBvblNlbGVjdENhbGxiYWNrLmNhbGwodGhhdC5lbGVtZW50LCBzdWdnZXN0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGdldFZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgZGVsaW1pdGVyID0gdGhhdC5vcHRpb25zLmRlbGltaXRlcixcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRWYWx1ZSxcclxuICAgICAgICAgICAgICAgIHBhcnRzO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFkZWxpbWl0ZXIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY3VycmVudFZhbHVlID0gdGhhdC5jdXJyZW50VmFsdWU7XHJcbiAgICAgICAgICAgIHBhcnRzID0gY3VycmVudFZhbHVlLnNwbGl0KGRlbGltaXRlcik7XHJcblxyXG4gICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50VmFsdWUuc3Vic3RyKDAsIGN1cnJlbnRWYWx1ZS5sZW5ndGggLSBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXS5sZW5ndGgpICsgdmFsdWU7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZGlzcG9zZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgIHRoYXQuZWwub2ZmKCcuYXV0b2NvbXBsZXRlJykucmVtb3ZlRGF0YSgnYXV0b2NvbXBsZXRlJyk7XHJcbiAgICAgICAgICAgIHRoYXQuZGlzYWJsZUtpbGxlckZuKCk7XHJcbiAgICAgICAgICAgICQod2luZG93KS5vZmYoJ3Jlc2l6ZS5hdXRvY29tcGxldGUnLCB0aGF0LmZpeFBvc2l0aW9uQ2FwdHVyZSk7XHJcbiAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikucmVtb3ZlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBDcmVhdGUgY2hhaW5hYmxlIGpRdWVyeSBwbHVnaW46XHJcbiAgICAkLmZuLmF1dG9jb21wbGV0ZSA9ICQuZm4uZGV2YnJpZGdlQXV0b2NvbXBsZXRlID0gZnVuY3Rpb24gKG9wdGlvbnMsIGFyZ3MpIHtcclxuICAgICAgICB2YXIgZGF0YUtleSA9ICdhdXRvY29tcGxldGUnO1xyXG4gICAgICAgIC8vIElmIGZ1bmN0aW9uIGludm9rZWQgd2l0aG91dCBhcmd1bWVudCByZXR1cm5cclxuICAgICAgICAvLyBpbnN0YW5jZSBvZiB0aGUgZmlyc3QgbWF0Y2hlZCBlbGVtZW50OlxyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpcnN0KCkuZGF0YShkYXRhS2V5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgaW5wdXRFbGVtZW50ID0gJCh0aGlzKSxcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlID0gaW5wdXRFbGVtZW50LmRhdGEoZGF0YUtleSk7XHJcblxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UgJiYgdHlwZW9mIGluc3RhbmNlW29wdGlvbnNdID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2Vbb3B0aW9uc10oYXJncyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiBpbnN0YW5jZSBhbHJlYWR5IGV4aXN0cywgZGVzdHJveSBpdDpcclxuICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZSAmJiBpbnN0YW5jZS5kaXNwb3NlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UuZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBuZXcgQXV0b2NvbXBsZXRlKHRoaXMsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgaW5wdXRFbGVtZW50LmRhdGEoZGF0YUtleSwgaW5zdGFuY2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG59KSk7XHJcbiIsIiQoZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdXJsUHJlZml4ID0gJyc7XHJcblxyXG4gICAgJC5leHRlbmQoe1xyXG4gICAgICAgIGdldFVybFZhcnM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgdmFycyA9IFtdLCBoYXNoO1xyXG4gICAgICAgICAgICB2YXIgaGFzaGVzID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc2xpY2Uod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignPycpICsgMSkuc3BsaXQoJyYnKTtcclxuICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGhhc2hlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaGFzaCA9IGhhc2hlc1tpXS5zcGxpdCgnPScpO1xyXG4gICAgICAgICAgICAgICAgdmFycy5wdXNoKGhhc2hbMF0pO1xyXG4gICAgICAgICAgICAgICAgdmFyc1toYXNoWzBdXSA9IGhhc2hbMV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHZhcnM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRVcmxWYXI6IGZ1bmN0aW9uKG5hbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICQuZ2V0VXJsVmFycygpW25hbWVdO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBhamF4ID0ge1xyXG4gICAgICAgIGNvbnRyb2w6IHtcclxuICAgICAgICAgICAgc2VuZEZvcm1EYXRhOiBmdW5jdGlvbihmb3JtLCB1cmwsIGxvZ05hbWUsIHN1Y2Nlc3NDYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgJChkb2N1bWVudCkub24oIFwic3VibWl0XCIsIGZvcm0sIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGYgPSAkKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFGb3JtID0gJCh0aGlzKS5zZXJpYWxpemUoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJtaXRCdXR0b24gPSAkKHRoaXMpLmZpbmQoXCJidXR0b25bdHlwZT1zdWJtaXRdXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9sZEJ1dHRvblZhbHVlID0gc3VibWl0QnV0dG9uLmh0bWwoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc3VibWl0QnV0dG9uLmF0dHIoXCJkaXNhYmxlZFwiLCBcImRpc2FibGVkXCIpLmh0bWwoJzxpIGNsYXNzPVwiZmEgZmEtY29nIGZhLXNwaW5cIj48L2k+Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogXCJwb3N0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogdXJsUHJlZml4ICsgdXJsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBkYXRhRm9ybSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXNwb25zZSA9ICQucGFyc2VKU09OKHJlc3BvbnNlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihyZXNwb25zZS5lcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcihrZXkgaW4gcmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVzcG9uc2Vba2V5XVswXSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZm9ybUVycm9yID0gbm90eSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCI8Yj7QntGI0LjQsdC60LAhPC9iPiBcIiArIHJlc3BvbnNlW2tleV1bMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46ICdhbmltYXRlZCBmYWRlSW5MZWZ0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlZWQ6IDMwMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICd0b3BSaWdodCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNzAwMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NDYWxsYmFjayhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihqcXhocikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JzLmNvbnRyb2wubG9nKGxvZ05hbWUsIGpxeGhyKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZm9ybUVycm9yQWpheCA9IG5vdHkoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0KLQtdGF0L3QuNGH0LXRgdC60LjQtSDRgNCw0LHQvtGC0YshPC9iPjxicj7QkiDQtNCw0L3QvdGL0Lkg0LzQvtC80LXQvdGCINCy0YDQtdC80LXQvdC4XCIgKyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiINC/0YDQvtC40LfQstC10LTRkdC90L3QvtC1INC00LXQudGB0YLQstC40LUg0L3QtdCy0L7Qt9C80L7QttC90L4uINCf0L7Qv9GA0L7QsdGD0LnRgtC1INC/0L7Qt9C20LUuXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIg0J/RgNC40L3QvtGB0LjQvCDRgdCy0L7QuCDQuNC30LLQuNC90LXQvdC40Y8g0LfQsCDQvdC10YPQtNC+0LHRgdGC0LLQvi5cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnd2FybmluZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDEwMDAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0QnV0dG9uLnJlbW92ZUF0dHIoXCJkaXNhYmxlZFwiKS5odG1sKG9sZEJ1dHRvblZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGVycm9ycyA9IHtcclxuICAgICAgICBjb250cm9sOiB7XHJcbiAgICAgICAgICAgIGxvZzogZnVuY3Rpb24odHlwZSwganF4aHIpIHtcclxuICAgICAgICAgICAgICAgICQoXCI8ZGl2IGlkPSdlcnJvci1jb250YWluZXInIHN0eWxlPSdkaXNwbGF5Om5vbmU7Jz5cIiArIGpxeGhyLnJlc3BvbnNlVGV4dCArIFwiPC9kaXY+XCIpLmFwcGVuZFRvKFwiYm9keVwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgZXJyb3JDb250YWluZXIgPSAkKFwiI2Vycm9yLWNvbnRhaW5lclwiKSxcclxuICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZSA9IHR5cGUgKyBcIjogXCIgKyBqcXhoci5zdGF0dXMgKyBcIiBcIiArIGpxeGhyLnN0YXR1c1RleHQgKyBcIiBcIjtcclxuXHJcbiAgICAgICAgICAgICAgICBpZihlcnJvckNvbnRhaW5lci5maW5kKFwiaDI6Zmlyc3RcIikudGV4dCgpID09IFwiRGV0YWlsc1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlICs9IFwiLSBcIjtcclxuICAgICAgICAgICAgICAgICAgICBlcnJvckNvbnRhaW5lci5maW5kKFwiZGl2XCIpLmVhY2goZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoaW5kZXggPiA0KSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkZWxpbWl0ZXIgPSBcIiwgXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGluZGV4ID09IDQpIGRlbGltaXRlciA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZSArPSAkKHRoaXMpLnRleHQoKSArIGRlbGltaXRlcjtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogXCJwb3N0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiB1cmxQcmVmaXggKyBcIi9hamF4LWVycm9yXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogXCJtZXNzYWdlPVwiICsgZXJyb3JNZXNzYWdlLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZXJyb3JDb250YWluZXIucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHZhciBoZWFkZXIgPSB7XHJcbiAgICAgICAgY29udHJvbDoge1xyXG4gICAgICAgICAgICBoZWFkZXJTdG9yZXNNZW51OiAkKFwiI3RvcFwiKS5maW5kKFwiLnN0b3Jlc1wiKSwgXHJcbiAgICAgICAgICAgIHN0b3Jlc1N1Ym1lbnU6ICQoXCIjdG9wXCIpLmZpbmQoXCIuc3RvcmVzXCIpLmZpbmQoXCIuc3VibWVudVwiKSxcclxuICAgICAgICAgICAgcG9wdXBTaWduVXA6ICQoXCIjdG9wXCIpLmZpbmQoXCIucG9wdXBfY29udGVudFwiKS5maW5kKFwiLnNpZ24tdXBcIiksXHJcbiAgICAgICAgICAgIHN0b3JlU2hvdzogJycsXHJcbiAgICAgICAgICAgIHN0b3JlSGlkZTogJycsXHJcbiAgICAgICAgICAgIHBhc3N3b3JkUmVjb3Zlcnk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHBhc3N3b3JkUmVjb3ZlcnlIYXNoID0gJC5nZXRVcmxWYXIoXCJwcnZcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYocGFzc3dvcmRSZWNvdmVyeUhhc2ggIT09IHVuZGVmaW5lZCAmJiBwYXNzd29yZFJlY292ZXJ5SGFzaCAhPSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogXCJwb3N0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogdXJsUHJlZml4ICsgXCIvcGFzc3dvcmQtcmVjb3ZlcnkvdXBkYXRlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IFwicHJ2PVwiICsgcGFzc3dvcmRSZWNvdmVyeUhhc2gsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoanF4aHIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9ycy5jb250cm9sLmxvZygnUGFzc3dvcmQgUmVjb3ZlcnkgVXBkYXRlIEFqYXggRXJyb3InLCBqcXhocik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZvcm1FcnJvckFqYXggPSBub3R5KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCi0LXRhdC90LjRh9C10YHQutC40LUg0YDQsNCx0L7RgtGLITwvYj48YnI+0JIg0LTQsNC90L3Ri9C5INC80L7QvNC10L3RgiDQstGA0LXQvNC10L3QuFwiICsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiDQv9GA0L7QuNC30LLQtdC00ZHQvdC90L7QtSDQtNC10LnRgdGC0LLQuNC1INC90LXQstC+0LfQvNC+0LbQvdC+LiDQn9C+0L/RgNC+0LHRg9C50YLQtSDQv9C+0LfQttC1LlwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiINCf0YDQuNC90L7RgdC40Lwg0YHQstC+0Lgg0LjQt9Cy0LjQvdC10L3QuNGPINC30LAg0L3QtdGD0LTQvtCx0YHRgtCy0L4uXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46ICdhbmltYXRlZCBmYWRlSW5MZWZ0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlZWQ6IDMwMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3dhcm5pbmcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiAncmVsYXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiAxMDAwMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSAkLnBhcnNlSlNPTihyZXNwb25zZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVzcG9uc2UuZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3Ioa2V5IGluIHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHJlc3BvbnNlW2tleV1bMF0gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhc3NSZWNvdkVycm9yID0gbm90eSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCI8Yj7QntGI0LjQsdC60LAhPC9iPiBcIiArIHJlc3BvbnNlW2tleV1bMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46ICdhbmltYXRlZCBmYWRlSW5MZWZ0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlZWQ6IDMwMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDcwMDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFzc1JlY292U3VjY2VzcyA9IG5vdHkoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCf0L7Qt9C00YDQsNCy0LvRj9C10LwhPC9iPjxicj4g0J/QsNGA0L7Qu9GMINGD0YHQv9C10YjQvdC+INC40LfQvNC10L3RkdC9LiDQndC+0LLRi9C5INC/0LDRgNC+0LvRjDogPGI+XCIgKyByZXNwb25zZS5wYXNzd29yZCArIFwiPC9iPjxicj48YnI+XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VXaXRoOiBbJ2J1dHRvbiddXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZShudWxsLCBudWxsLCAnLycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBldmVudHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5oZWFkZXJTdG9yZXNNZW51LmhvdmVyKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKCQod2luZG93KS53aWR0aCgpID4gOTkxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChzZWxmLnN0b3JlSGlkZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc3RvcmVTaG93ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc3RvcmVzU3VibWVudS5jbGVhclF1ZXVlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnN0b3Jlc1N1Ym1lbnUuY3NzKFwiZGlzcGxheVwiLCBcImJsb2NrXCIpLmFuaW1hdGUoe1wib3BhY2l0eVwiOiAxfSwgMzUwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMjAwKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZigkKHdpbmRvdykud2lkdGgoKSA+IDk5MSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoc2VsZi5zdG9yZVNob3cpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnN0b3JlSGlkZSA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnN0b3Jlc1N1Ym1lbnUuY2xlYXJRdWV1ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zdG9yZXNTdWJtZW51LmFuaW1hdGUoe1wib3BhY2l0eVwiOiAwfSwgMjAwLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDMwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXNzd29yZFJlY292ZXJ5KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoJCh3aW5kb3cpLndpZHRoKCkgPiA5OTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKFwiLmZvcm0tc2VhcmNoLWRwIGlucHV0XCIpLmF1dG9jb21wbGV0ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZpY2VVcmw6ICcvc2VhcmNoJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9DYWNoZTogJ3RydWUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlclJlcXVlc3RCeTogMzAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gJy9zdG9yZXMvJyArIHN1Z2dlc3Rpb24uZGF0YS5yb3V0ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICQoXCJmb3JtW25hbWU9c2VhcmNoXSAuZmFcIikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KFwiZm9ybVwiKS5zdWJtaXQoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICQoXCIuZG9icm9oZWFkIGksIC5kb2JybyAuY2lyY2xlIC5jIC5mYS1oZWFydFwiKS5hbmltbyh7YW5pbWF0aW9uOiBcInB1bHNlXCIsIGl0ZXJhdGU6IFwiaW5maW5pdGVcIn0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBhY3RpdmVDYXRlZ29yeSA9ICQoXCIuaGVhZGVyLW5hdiBuYXYgdWwucHJpbWFyeS1uYXYgLnN1Ym1lbnUgLnRyZWUgYVtocmVmPSdcIitsb2NhdGlvbi5wYXRobmFtZStcIiddXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKGFjdGl2ZUNhdGVnb3J5Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmVDYXRlZ29yeS5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgY291cG9ucyA9IHtcclxuICAgICAgICBjb250cm9sOiB7XHJcbiAgICAgICAgICAgIGV2ZW50czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkLmNvdW50ZG93bi5yZWdpb25hbE9wdGlvbnNbJ3J1J10gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxzOiBbJ9Cb0LXRgicsICfQnNC10YHRj9GG0LXQsicsICfQndC10LTQtdC70YwnLCAn0JTQvdC10LknLCAn0KfQsNGB0L7QsicsICfQnNC40L3Rg9GCJywgJ9Ch0LXQutGD0L3QtCddLFxyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsczE6IFsn0JPQvtC0JywgJ9Cc0LXRgdGP0YYnLCAn0J3QtdC00LXQu9GPJywgJ9CU0LXQvdGMJywgJ9Cn0LDRgScsICfQnNC40L3Rg9GC0LAnLCAn0KHQtdC60YPQvdC00LAnXSxcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbHMyOiBbJ9CT0L7QtNCwJywgJ9Cc0LXRgdGP0YbQsCcsICfQndC10LTQtdC70LgnLCAn0JTQvdGPJywgJ9Cn0LDRgdCwJywgJ9Cc0LjQvdGD0YLRiycsICfQodC10LrRg9C90LTRiyddLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBhY3RMYWJlbHM6IFsn0LsnLCAn0LwnLCAn0L0nLCAn0LQnXSwgY29tcGFjdExhYmVsczE6IFsn0LMnLCAn0LwnLCAn0L0nLCAn0LQnXSxcclxuICAgICAgICAgICAgICAgICAgICB3aGljaExhYmVsczogZnVuY3Rpb24oYW1vdW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB1bml0cyA9IGFtb3VudCAlIDEwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGVucyA9IE1hdGguZmxvb3IoKGFtb3VudCAlIDEwMCkgLyAxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoYW1vdW50ID09IDEgPyAxIDogKHVuaXRzID49IDIgJiYgdW5pdHMgPD0gNCAmJiB0ZW5zICE9IDEgPyAyIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICh1bml0cyA9PSAxICYmIHRlbnMgIT0gMSA/IDEgOiAwKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZGlnaXRzOiBbJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknXSxcclxuICAgICAgICAgICAgICAgICAgICB0aW1lU2VwYXJhdG9yOiAnOicsIFxyXG4gICAgICAgICAgICAgICAgICAgIGlzUlRMOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAkLmNvdW50ZG93bi5zZXREZWZhdWx0cygkLmNvdW50ZG93bi5yZWdpb25hbE9wdGlvbnNbJ3J1J10pO1xyXG5cclxuICAgICAgICAgICAgICAgICQoXCIjdG9wXCIpLmZpbmQoJy5jb3Vwb25zIC5jdXJyZW50LWNvdXBvbiAudGltZSAuY2xvY2snKS5lYWNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxmID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0ZUVuZCA9IG5ldyBEYXRlKHNlbGYuYXR0cihcImRhdGEtZW5kXCIpLnJlcGxhY2UoLy0vZywgXCIvXCIpKTsgXHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5jb3VudGRvd24oe3VudGlsOiBkYXRlRW5kLCBjb21wYWN0OiB0cnVlfSk7IFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJChcIiN0b3BcIikuZmluZCgnLmNvdXBvbnMgLmN1cnJlbnQtY291cG9uIC5jb3VudGRvd24tYW1vdW50JykuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZiA9ICQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKHNlbGYudGV4dCgpID09IFwiMDA6MDA6MDBcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmNsb3Nlc3QoXCIuY3VycmVudC1jb3Vwb25cIikuZmluZChcIi5leHBpcnlcIikuY3NzKFwiZGlzcGxheVwiLCBcInRhYmxlLWNlbGxcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJChcIiN0b3BcIikuZmluZChcIi5jb3Vwb25zIC5jdXJyZW50LWNvdXBvbiAudGV4dCAuYWRkaXRpb25hbCBhXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykubmV4dChcInNwYW5cIikudG9nZ2xlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS50ZXh0KGZ1bmN0aW9uKGksIHYpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdiA9IHYuc3BsaXQoXCIgXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYodi5pbmRleE9mKCfQn9C+0LrQsNC30LDRgtGMJykgIT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZbMF0gPSAn0KHQutGA0YvRgtGMJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZbMF0gPSAn0J/QvtC60LDQt9Cw0YLRjCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHYgPSB2LmpvaW4oXCIgXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdjtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJChcIiN0b3BcIikuZmluZChcIi5jYXRlZ29yaWVzIC5zZWFyY2gtc3RvcmUtY291cG9ucyBpbnB1dFwiKS5rZXl1cChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgaVZhbHVlID0gJCh0aGlzKS52YWwoKS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZihpVmFsdWUgIT0gXCJcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKFwiLmNhdGVnb3JpZXMgLmNvdXBvbnMtc3RvcmVzIGxpIGFcIikuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdG9yZU5hbWUgPSAkKHRoaXMpLnRleHQoKS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHN0b3JlTmFtZS5pbmRleE9mKGlWYWx1ZSkgIT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudCgpLmNzcyhcImRpc3BsYXlcIiwgXCJibG9ja1wiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5jc3MoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChcIi5jYXRlZ29yaWVzIC5jb3Vwb25zLXN0b3JlcyBsaVwiKS5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIiN0b3AgLmNvdXBvbnMgLmN1cnJlbnQtY291cG9uIC50ZXh0IC5jb3Vwb24tZ290byBhW2hyZWY9I3Nob3dwcm9tb2NvZGVdXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxmID0gJCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5uZXh0KFwiZGl2XCIpLmNzcyhcImRpc3BsYXlcIiwgXCJibG9ja1wiKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLnRleHQoXCLQmNGB0L/QvtC70YzQt9C+0LLQsNGC0Ywg0LrRg9C/0L7QvVwiKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmF0dHIoXCJ0YXJnZXRcIiwgXCJfYmxhbmtcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5hdHRyKFwiaHJlZlwiLCBcIi9nb3RvL2NvdXBvbjpcIiArIHNlbGYuY2xvc2VzdChcIi5jdXJyZW50LWNvdXBvblwiKS5hdHRyKFwiZGF0YS11aWRcIikpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9KTsgICAgICAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHBvcHVwID0ge1xyXG4gICAgICAgIGNvbnRyb2w6IHtcclxuICAgICAgICAgICAgc3Rhck5vbWluYXRpb246IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgIHZhciBzdGFycyA9ICQoXCIjdG9wIC5wb3B1cCAuZmVlZGJhY2sucG9wdXAtY29udGVudCAucmF0aW5nIC5mYS13cmFwcGVyIC5mYVwiKTtcclxuICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgIHN0YXJzLnJlbW92ZUNsYXNzKFwiZmEtc3RhclwiKS5hZGRDbGFzcyhcImZhLXN0YXItb1wiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBpbmRleDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnMuZXEoaSkucmVtb3ZlQ2xhc3MoXCJmYS1zdGFyLW9cIikuYWRkQ2xhc3MoXCJmYS1zdGFyXCIpO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlZ2lzdHJhdGlvbjogZnVuY3Rpb24oc2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICAgICAgICAgIGZvciAoc2VsZWN0b3IgaW4gc2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKHNlbGVjdG9yKS5wb3B1cCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgOiBzZXR0aW5nc1tzZWxlY3Rvcl0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGUgOiAnaHRtbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFmdGVyT3BlbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWN0aXZlRWxlbWVudCA9ICQoXCIjdG9wIGEucG9wdXBfYWN0aXZlXCIpLmF0dHIoXCJocmVmXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKicjbG9naW4nIDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdoMycgOiAn0JLRhdC+0LQg0L3QsCDRgdCw0LnRgicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2J1dHRvbicgOiAn0JLQvtC50YLQuCDQsiDQu9C40YfQvdGL0Lkg0LrQsNCx0LjQvdC10YInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdpbnB1dFt0eXBlPXBhc3N3b3JkXScgOiAn0JLQstC10LTQuNGC0LUg0LLQsNGIINC/0LDRgNC+0LvRjCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2g0JyA6ICfQmNC70Lgg0LLQvtC50LTQuNGC0LUg0Log0L3QsNC8INGBINC/0L7QvNC+0YnRjNGOINGB0L7RhtGB0LXRgtC10Lk6JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLnNpZ24tdXAtdGFnbGluZScgOiAn0KHQvtCy0LXRgNGI0LDRjyDQstGF0L7QtCDQvdCwINGB0LDQudGCLCDQktGLINGB0L7Qs9C70LDRiNCw0LXRgtC10YHRjCDRgSDQvdCw0YjQuNC80LggPGEgaHJlZj1cIi90ZXJtc1wiPtCf0YDQsNCy0LjQu9Cw0LzQuDwvYT4nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcudGVybXMnIDogJzxhIGhyZWY9XCIjcGFzc3dvcmQtcmVjb3ZlcnlcIiBjbGFzcz1cImlnbm9yZS1oYXNoXCI+0JfQsNCx0YvQu9C4INC/0LDRgNC+0LvRjD88L2E+JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaW5wdXRbbmFtZT10eXBlXScgOiAnbG9naW4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyNyZWdpc3RyYXRpb24nIDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdoMycgOiAn0J3QsNGH0L3QuNGC0LUg0Y3QutC+0L3QvtC80LjRgtGMINGD0LbQtSDRgdC10LPQvtC00L3RjyEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdidXR0b24nIDogJ9Cf0YDQuNGB0L7QtdC00LjQvdC40YLRjNGB0Y8g0Lgg0L3QsNGH0LDRgtGMINGN0LrQvtC90L7QvNC40YLRjCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2lucHV0W3R5cGU9cGFzc3dvcmRdJyA6ICfQn9GA0LjQtNGD0LzQsNC50YLQtSDQv9Cw0YDQvtC70YwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdoNCcgOiAn0JjQu9C4INC/0YDQuNGB0L7QtdC00LjQvdGP0LnRgtC10YHRjCDQuiDQvdCw0Lwg0YEg0L/QvtC80L7RidGM0Y4g0YHQvtGG0YHQtdGC0LXQuTonLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcuc2lnbi11cC10YWdsaW5lJyA6ICfQoNC10LPQuNGB0YLRgNCw0YbQuNGPINC/0L7Qu9C90L7RgdGC0YzRjiDQsdC10YHQv9C70LDRgtC90LAg0Lgg0LfQsNC50LzRkdGCINGDINCS0LDRgSDQvdC10YHQutC+0LvRjNC60L4g0YHQtdC60YPQvdC0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLnRlcm1zJyA6ICfQoNC10LPQuNGB0YLRgNC40YDRg9GP0YHRjCwg0Y8g0YHQvtCz0LvQsNGI0LDRjtGB0Ywg0YEgPGEgaHJlZj1cIi90ZXJtc1wiPtCf0YDQsNCy0LjQu9Cw0LzQuDwvYT4nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdpbnB1dFtuYW1lPXR5cGVdJyA6ICdyZWdpc3RyYXRpb24nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKicjZ2l2ZWZlZWRiYWNrJyA6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaDMnIDogJ9Ce0YLQt9GL0LIg0L4g0YHQsNC50YLQtScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2lucHV0W25hbWU9dHlwZV0nIDogJ2ZlZWRiYWNrJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyNyZXZpZXdzdG9yZScgOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2gzJyA6ICfQntGC0LfRi9CyINC+INC80LDQs9Cw0LfQuNC90LUgJyArICQoXCIjc3RvcmUtaW5mb3JtYXRpb25cIikuYXR0cihcImRhdGEtc3RvcmUtbmFtZVwiKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaW5wdXRbbmFtZT10eXBlXScgOiAncmV2aWV3XycgKyAkKFwiI3N0b3JlLWluZm9ybWF0aW9uXCIpLmF0dHIoXCJkYXRhLXN0b3JlLWlkXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyppZigkLmluQXJyYXkoYWN0aXZlRWxlbWVudCwgWycjbG9naW4nLCAnI3JlZ2lzdHJhdGlvbiddKSAhPSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwb3B1cFdpbmRvdyA9ICQoXCIjdG9wXCIpLmZpbmQoXCIucG9wdXBfY29udGVudFwiKS5maW5kKFwiLnNpZ24tdXBcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9wdXBXaW5kb3cuZmluZChcIi5zb2NpYWwtaWNvblwiKS5wcmVwZW5kKFwiXCIgKyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiPGRpdiBpZD1cXFwidUxvZ2luNmRhYjNhMmRcXFwiXCIgKyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS11bG9naW49XFxcImRpc3BsYXk9YnV0dG9ucztmaWVsZHM9Zmlyc3RfbmFtZSxlbWFpbCxsYXN0X25hbWUsbmlja25hbWUsc2V4LGJkYXRlLHBob3RvLFwiICsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBob3RvX2JpZztvcHRpb25hbD1waG9uZSxjaXR5LGNvdW50cnk7bGFuZz1ydTtwcm92aWRlcnM9dmtvbnRha3RlLG9kbm9rbGFzc25pa2ksXCIgKyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZmFjZWJvb2ssdHdpdHRlcjtyZWRpcmVjdF91cmk9aHR0cCUzQSUyRiUyRnNlY3JldGRpc2NvdW50ZXIucnUlMkZhdXRob3JpemF0aW9uc29jaWFsX2xvZ2luXFxcIj5cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjxpbWcgc3JjPVxcXCIvaW1hZ2VzL2FjY291bnQvdmsucG5nXFxcIiBkYXRhLXVsb2dpbmJ1dHRvbj1cXFwidmtvbnRha3RlXFxcIiBhbHQ9XFxcInZrb250YWt0ZS11bG9naW5cXFwiPlwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiPGltZyBzcmM9XFxcIi9pbWFnZXMvYWNjb3VudC9mYi5wbmdcXFwiIGRhdGEtdWxvZ2luYnV0dG9uPVxcXCJmYWNlYm9va1xcXCIgYWx0PVxcXCJmYWNlYm9vay11bG9naW5cXFwiPlwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiPGltZyBzcmM9XFxcIi9pbWFnZXMvYWNjb3VudC90dy5wbmdcXFwiIGRhdGEtdWxvZ2luYnV0dG9uPVxcXCJ0d2l0dGVyXFxcIiBhbHQ9XFxcInR3aXR0ZXItdWxvZ2luXFxcIj5cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjxpbWcgc3JjPVxcXCIvaW1hZ2VzL2FjY291bnQvb2sucG5nXFxcIiBkYXRhLXVsb2dpbmJ1dHRvbj1cXFwib2Rub2tsYXNzbmlraVxcXCIgYWx0PVxcXCJvZG5va2xhc3NuaWtpLXVsb2dpblxcXCI+XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI8L2Rpdj5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9Ki9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKCQuaW5BcnJheShhY3RpdmVFbGVtZW50LCBbJyNnaXZlZmVlZGJhY2snLCAnI3Jldmlld3N0b3JlJ10pICE9IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBvcHVwV2luZG93ID0gJChcIiN0b3BcIikuZmluZChcIi5wb3B1cF9jb250ZW50XCIpLmZpbmQoXCIuZmVlZGJhY2tcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChrZXkgaW4gc2V0dGluZ3NbYWN0aXZlRWxlbWVudF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZigkLmluQXJyYXkoa2V5LCBbJ2gzJywgJ2J1dHRvbicsICdoNCddKSAhPSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3B1cFdpbmRvdy5maW5kKGtleSkudGV4dChzZXR0aW5nc1thY3RpdmVFbGVtZW50XVtrZXldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoJC5pbkFycmF5KGtleSwgWycuc2lnbi11cC10YWdsaW5lJywgJy50ZXJtcyddKSAhPSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3B1cFdpbmRvdy5maW5kKGtleSkuaHRtbChzZXR0aW5nc1thY3RpdmVFbGVtZW50XVtrZXldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoJC5pbkFycmF5KGtleSwgWydpbnB1dFt0eXBlPXBhc3N3b3JkXSddKSAhPSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3B1cFdpbmRvdy5maW5kKGtleSkuYXR0cigncGxhY2Vob2xkZXInLCBzZXR0aW5nc1thY3RpdmVFbGVtZW50XVtrZXldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoJC5pbkFycmF5KGtleSwgWydpbnB1dFtuYW1lPXR5cGVdJ10pICE9IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcHVwV2luZG93LmZpbmQoa2V5KS52YWwoc2V0dGluZ3NbYWN0aXZlRWxlbWVudF1ba2V5XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGFjdGl2ZUVsZW1lbnQgIT0gXCIjY2VydFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9wdXBXaW5kb3cuYW5pbWF0ZSh7J29wYWNpdHknIDogMX0sIDMwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdUxvZ2luLmN1c3RvbUluaXQoJ3VMb2dpbjZkYWIzYTJkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTsgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBldmVudHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgcG9wdXBzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8nYVtocmVmPSNsb2dpbl0nIDogJChcIiN0b3BcIikuZmluZCgnLnBvcHVwLWxvZ2luJykuaHRtbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8nYVtocmVmPSNyZWdpc3RyYXRpb25dJyA6ICQoXCIjdG9wXCIpLmZpbmQoJy5wb3B1cC1sb2dpbicpLmh0bWwoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qJ2FbaHJlZj0jZ2l2ZWZlZWRiYWNrXScgOiAgJChcIiN0b3BcIikuZmluZCgnLnBvcHVwLWdpdmVmZWVkYmFjaycpLmh0bWwoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhW2hyZWY9I3Jldmlld3N0b3JlXScgOiAgJChcIiN0b3BcIikuZmluZCgnLnBvcHVwLWdpdmVmZWVkYmFjaycpLmh0bWwoKSwqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2FbaHJlZj0jY2VydF0nIDogICQoXCIjdG9wXCIpLmZpbmQoJy5wb3B1cC1jZXJ0JykuaHRtbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8nYVtocmVmPSNwYXNzd29yZC1yZWNvdmVyeV0nIDogJChcIiN0b3BcIikuZmluZCgnLnBvcHVwLXJlY292ZXJ5JykuaHRtbCgpXHJcbiAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy90aGlzLnJlZ2lzdHJhdGlvbihwb3B1cHMpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIiN0b3AgYVtocmVmPSNwYXNzd29yZC1yZWNvdmVyeV1cIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIiN0b3AgLnBvcHVwLXNpZ24tdXBcIikuY2xvc2VzdChcIi5wb3B1cFwiKS5uZXh0KFwiLnBvcHVwX2Nsb3NlXCIpLmNsaWNrKCk7XHJcbiAgICAgICAgICAgICAgICB9KTsqL1xyXG5cclxuICAgICAgICAgICAgICAgIC8qJChkb2N1bWVudCkub24oXCJtb3VzZW92ZXJcIiwgXCIjdG9wIC5wb3B1cCAuZmVlZGJhY2sucG9wdXAtY29udGVudCAucmF0aW5nIC5mYS13cmFwcGVyIC5mYVwiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBzZWxmLnN0YXJOb21pbmF0aW9uKCQodGhpcykuaW5kZXgoKSArIDEpO1xyXG4gICAgICAgICAgICAgICAgfSkub24oXCJtb3VzZWxlYXZlXCIsIFwiI3RvcCAucG9wdXAgLmZlZWRiYWNrLnBvcHVwLWNvbnRlbnQgLnJhdGluZyAuZmEtd3JhcHBlclwiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBzZWxmLnN0YXJOb21pbmF0aW9uKCQoXCIjdG9wIC5wb3B1cCAuZmVlZGJhY2sucG9wdXAtY29udGVudCBpbnB1dFtuYW1lPXJhdGluZ11cIikudmFsKCkpOyAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIH0pLm9uKFwiY2xpY2tcIiwgXCIjdG9wIC5wb3B1cCAuZmVlZGJhY2sucG9wdXAtY29udGVudCAucmF0aW5nIC5mYS13cmFwcGVyIC5mYVwiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBzZWxmLnN0YXJOb21pbmF0aW9uKCQodGhpcykuaW5kZXgoKSArIDEpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICQoXCIjdG9wIC5wb3B1cCAuZmVlZGJhY2sucG9wdXAtY29udGVudCBpbnB1dFtuYW1lPXJhdGluZ11cIikudmFsKCQodGhpcykuaW5kZXgoKSArIDEpO1xyXG4gICAgICAgICAgICAgICAgfSk7Ki9cclxuXHJcbiAgICAgICAgICAgICAgICAvKmFqYXguY29udHJvbC5zZW5kRm9ybURhdGEoXCIjdG9wIC5zaWdudXAtZm9ybVwiLCBcIi9hdXRob3JpemF0aW9uXCIsIFwiQXV0aCBBamF4IEVycm9yXCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZihkYXRhLnR5cGUgPT0gJ3JlZ2lzdHJhdGlvbicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9IHVybFByZWZpeCArIFwiL2FjY291bnRcIiArIGRhdGEucGFyYW07XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9IHVybFByZWZpeCArIFwiL2FjY291bnRcIjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTsqL1xyXG5cclxuICAgICAgICAgICAgICAgIC8qYWpheC5jb250cm9sLnNlbmRGb3JtRGF0YShcIiN0b3AgLnJlY292ZXJ5LWZvcm1cIiwgXCIvcGFzc3dvcmQtcmVjb3ZlcnkvaW5zdHJ1Y3Rpb25zXCIsIFwiUGFzc3dvcmQgUmVjb3ZlcnkgSW5zdHJ1Y3Rpb25zIEFqYXggRXJyb3JcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIiN0b3AgLnJlY292ZXJ5XCIpLmNsb3Nlc3QoXCIucG9wdXBcIikubmV4dChcIi5wb3B1cF9jbG9zZVwiKS5jbGljaygpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgcGFzc05vdHlTdWNjZXNzID0gbm90eSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0J/QvtC30LTRgNCw0LLQu9GP0LXQvCE8L2I+PGJyPiDQmNC90YHRgtGA0YPQutGG0LjQuCDQv9C+INCy0L7RgdGB0YLQsNC90L7QstC70LXQvdC40Y4g0L/QsNGA0L7Qu9GPINGD0YHQv9C10YjQvdC+XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiINC+0YLQv9GA0LDQstC70LXQvdGLINC90LAg0YPQutCw0LfQsNC90L3Ri9C5IGVtYWlsINCw0LTRgNC10YEuINCV0YHQu9C4INC/0LjRgdGM0LzQviDQvdC1INC/0YDQuNGI0LvQviDQsiDRgtC10YfQtdC90LjQtSAyINC80LjQvdGD0YIsINC/0L7RgdC80L7RgtGA0LjRgtC1INCyINC/0LDQv9C60LUgwqvQodC/0LDQvMK7LlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46ICdhbmltYXRlZCBmYWRlSW5MZWZ0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiAnYW5pbWF0ZWQgZmxpcE91dFgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlZWQ6IDMwMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiAncmVsYXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICd0b3BSaWdodCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDcwMDBcclxuICAgICAgICAgICAgICAgICAgICB9KTsgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgfSk7Ki9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKnZhciByZXZpZXdzID0ge1xyXG4gICAgICAgIGNvbnRyb2w6IHtcclxuICAgICAgICAgICAgZXZlbnRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vIGFkZCBhIGNvbW1lbnQgdG8gdGhlIHNpdGVcclxuICAgICAgICAgICAgICAgIGFqYXguY29udHJvbC5zZW5kRm9ybURhdGEoXCIjdG9wIC5mZWVkYmFjay1mb3JtXCIsIFwiL3Jldmlld3NcIiwgXCJSZXZpZXdzIEFqYXggRXJyb3JcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIiN0b3AgLmZlZWRiYWNrXCIpLmNsb3Nlc3QoXCIucG9wdXBcIikubmV4dChcIi5wb3B1cF9jbG9zZVwiKS5jbGljaygpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmV2aWV3U3VjY2VzcyA9IG5vdHkoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCh0L/QsNGB0LjQsdC+ITwvYj48YnI+0JLQsNGIINC+0YLQt9GL0LIg0YPRgdC/0LXRiNC90L4g0LTQvtCx0LDQstC70LXQvSDQuCDQsdGD0LTQtdGCXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiINC+0L/Rg9Cx0LvQuNC60L7QstCw0L0g0L3QsCDRgdCw0LnRgtC1INC/0L7RgdC70LUg0LzQvtC00LXRgNCw0YbQuNC4LlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46ICdhbmltYXRlZCBmYWRlSW5MZWZ0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiAnYW5pbWF0ZWQgZmxpcE91dFgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlZWQ6IDMwMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiAncmVsYXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICd0b3BSaWdodCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDcwMDBcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pOyAgICAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9Ki9cclxuXHJcbiAgICB2YXIgY2F0YWxvZyA9IHtcclxuICAgICAgICBjb250cm9sOiB7XHJcbiAgICAgICAgICAgIGV2ZW50czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKFwiI3RvcCAuZHJvcGRvd24tc2VsZWN0IC5kcm9wT3V0IGxpXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSAkKHRoaXMpLmZpbmQoXCJhXCIpLmF0dHIoXCJocmVmXCIpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGZhdm9yaXRlcyA9IHtcclxuICAgICAgICBjb250cm9sOiB7XHJcbiAgICAgICAgICAgIGV2ZW50czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKFwiI3RvcFwiKS5maW5kKFwiLmZhdm9yaXRlLWxpbmsuaWFcIikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGYgPSAkKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0eXBlID0gc2VsZi5hdHRyKFwiZGF0YS1zdGF0ZVwiKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBhZmZpbGlhdGVfaWQgPSBzZWxmLmF0dHIoXCJkYXRhLWFmZmlsaWF0ZS1pZFwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYodHlwZSA9PSBcImFkZFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZmluZChcIi5mYVwiKS5yZW1vdmVDbGFzcyhcIm11dGVkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5maW5kKFwiLmZhXCIpLnJlbW92ZUNsYXNzKFwicHVsc2UyXCIpLmFkZENsYXNzKFwiZmEtc3BpblwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiBcInBvc3RcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiB1cmxQcmVmaXggKyBcIi9hY2NvdW50L2Zhdm9yaXRlc1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBcInR5cGU9XCIgKyB0eXBlICsgXCImYWZmaWxpYXRlX2lkPVwiICsgYWZmaWxpYXRlX2lkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24gKGpxeGhyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcnMuY29udHJvbC5sb2coJ0Zhdm9yaXRlcyBBamF4IEVycm9yJywganF4aHIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmYXZFcnJvckFqYXggPSBub3R5KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCi0LXRhdC90LjRh9C10YHQutC40LUg0YDQsNCx0L7RgtGLITwvYj48YnI+0JIg0LTQsNC90L3Ri9C5INC80L7QvNC10L3RgiDQstGA0LXQvNC10L3QuFwiICsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiDQv9GA0L7QuNC30LLQtdC00ZHQvdC90L7QtSDQtNC10LnRgdGC0LLQuNC1INC90LXQstC+0LfQvNC+0LbQvdC+LiDQn9C+0L/RgNC+0LHRg9C50YLQtSDQv9C+0LfQttC1LlwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiINCf0YDQuNC90L7RgdC40Lwg0YHQstC+0Lgg0LjQt9Cy0LjQvdC10L3QuNGPINC30LAg0L3QtdGD0LTQvtCx0YHRgtCy0L4uXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46ICdhbmltYXRlZCBmYWRlSW5MZWZ0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlZWQ6IDMwMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3dhcm5pbmcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiAncmVsYXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiAxMDAwMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodHlwZSA9PSBcImFkZFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5maW5kKFwiLmZhXCIpLmFkZENsYXNzKFwibXV0ZWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5maW5kKFwiLmZhXCIpLnJlbW92ZUNsYXNzKFwiZmEtc3BpblwiKS5hZGRDbGFzcyhcInB1bHNlMlwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXNwb25zZSA9ICQucGFyc2VKU09OKHJlc3BvbnNlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihyZXNwb25zZS5lcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcihrZXkgaW4gcmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVzcG9uc2Vba2V5XVswXSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmF2b3JpdGVzRXJyb3IgPSBub3R5KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCe0YjQuNCx0LrQsCE8L2I+IFwiICsgcmVzcG9uc2Vba2V5XVswXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiAncmVsYXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA3MDAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodHlwZSA9PSBcImFkZFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZmluZChcIi5mYVwiKS5hZGRDbGFzcyhcIm11dGVkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5maW5kKFwiLmZhXCIpLnJlbW92ZUNsYXNzKFwiZmEtc3BpblwiKS5hZGRDbGFzcyhcInB1bHNlMlwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZhdm9yaXRlc1N1Y2Nlc3MgPSBub3R5KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogcmVzcG9uc2UubXNnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46ICdhbmltYXRlZCBmYWRlSW5MZWZ0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiAnYW5pbWF0ZWQgZmxpcE91dFgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlZWQ6IDMwMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiAncmVsYXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICd0b3BSaWdodCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDcwMDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodHlwZSA9PSBcImFkZFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYXR0cih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRhdGEtc3RhdGVcIjogXCJkZWxldGVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS1vcmlnaW5hbC10aXRsZVwiOiBcItCj0LTQsNC70LjRgtGMINC40Lcg0LjQt9Cx0YDQsNC90L3QvtCz0L5cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZmluZChcIi5mYVwiKS5yZW1vdmVDbGFzcyhcImZhLXNwaW4gZmEtc3Rhci1vXCIpLmFkZENsYXNzKFwicHVsc2UyIGZhLXN0YXJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmKHR5cGUgPT0gXCJkZWxldGVcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmF0dHIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLXN0YXRlXCI6IFwiYWRkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRhdGEtb3JpZ2luYWwtdGl0bGVcIiA6IFwi0JTQvtCx0LDQstC40YLRjCDQsiDQuNC30LHRgNCw0L3QvdC+0LVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTsgICAgICAgICAgICAgICAgICAgXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmZpbmQoXCIuZmFcIikucmVtb3ZlQ2xhc3MoXCJmYS1zcGluIGZhLXN0YXJcIikuYWRkQ2xhc3MoXCJwdWxzZTIgZmEtc3Rhci1vIG11dGVkXCIpOyAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTsgICAgICAgXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTsgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgXHJcbiAgICBwb3B1cC5jb250cm9sLmV2ZW50cygpO1xyXG4gICAgaGVhZGVyLmNvbnRyb2wuZXZlbnRzKCk7XHJcbiAgICBjb3Vwb25zLmNvbnRyb2wuZXZlbnRzKCk7XHJcbiAgICAvL3Jldmlld3MuY29udHJvbC5ldmVudHMoKTtcclxuICAgIGNhdGFsb2cuY29udHJvbC5ldmVudHMoKTtcclxuICAgIGZhdm9yaXRlcy5jb250cm9sLmV2ZW50cygpO1xyXG59KTtcclxuXHJcblxyXG4vLyAkKHdpbmRvdykubG9hZChmdW5jdGlvbigpe1xyXG4vL1xyXG4vLyAgICAgLyogU2Nyb2xsYmFyIEluaXRcclxuLy8gICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcbi8vICAgICAvLyAkKFwiI3RvcFwiKS5maW5kKFwiLnN1Ym1lbnUgLnRyZWVcIikubUN1c3RvbVNjcm9sbGJhcih7XHJcbi8vICAgICAvLyAgICAgYXhpczpcInlcIixcclxuLy8gICAgIC8vICAgICBzZXRIZWlnaHQ6IDMwMFxyXG4vLyAgICAgLy8gfSk7XHJcbi8vICAgICBpZigkKFwiI3RvcFwiKS5maW5kKFwiLmMtd3JhcHBlclwiKS5sZW5ndGggPCAxKXtcclxuLy8gICAgICAgIHJldHVybiB0cnVlO1xyXG4vLyAgICAgfVxyXG4vLyAgICAgJChcIiN0b3BcIikuZmluZChcIi5jLXdyYXBwZXJcIikubUN1c3RvbVNjcm9sbGJhcih7XHJcbi8vICAgICAgICAgYXhpczpcInlcIixcclxuLy8gICAgICAgICBzZXRIZWlnaHQ6IDcwMFxyXG4vLyAgICAgfSk7XHJcbi8vICAgICAkKFwiI3RvcFwiKS5maW5kKFwiLmNtLXdyYXBwZXJcIikubUN1c3RvbVNjcm9sbGJhcih7XHJcbi8vICAgICAgICAgYXhpczpcInlcIixcclxuLy8gICAgICAgICBzZXRIZWlnaHQ6IDY0MFxyXG4vLyAgICAgfSk7XHJcbi8vICAgICAvLyAkKFwiI3RvcFwiKS5maW5kKFwiLnZpZXctc3RvcmUgLmFkZGl0aW9uYWwtaW5mb3JtYXRpb25cIikubUN1c3RvbVNjcm9sbGJhcih7XHJcbi8vICAgICAvLyAgICAgYXhpczpcInlcIixcclxuLy8gICAgIC8vICAgICBzZXRIZWlnaHQ6IDY1XHJcbi8vICAgICAvLyB9KTtcclxuLy8gICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuZnVuZHMgLmZ1bmQgLnRpdGxlXCIpLm1DdXN0b21TY3JvbGxiYXIoe1xyXG4vLyAgICAgICAgIGF4aXM6XCJ5XCIsXHJcbi8vICAgICAgICAgc2V0SGVpZ2h0OiA0NSxcclxuLy8gICAgICAgICB0aGVtZTogXCJkYXJrXCJcclxuLy8gICAgIH0pOyBcclxuLy8gICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb25zXCIpLm1DdXN0b21TY3JvbGxiYXIoe1xyXG4vLyAgICAgICAgIGF4aXM6XCJ5XCIsXHJcbi8vICAgICAgICAgc2V0SGVpZ2h0OiAzMDBcclxuLy8gICAgIH0pOyBcclxuLy8gICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuY29tbWVudHMgLmN1cnJlbnQtY29tbWVudCAudGV4dCAuY29tbWVudFwiKS5tQ3VzdG9tU2Nyb2xsYmFyKHtcclxuLy8gICAgICAgICBheGlzOlwieVwiLFxyXG4vLyAgICAgICAgIHNldEhlaWdodDogMTUwLFxyXG4vLyAgICAgICAgIHRoZW1lOiBcImRhcmtcIlxyXG4vLyAgICAgfSk7IFxyXG4vLyAgICAgJChcIiN0b3BcIikuZmluZChcIi5jYXRlZ29yaWVzIHVsOm5vdCguc3ViY2F0ZWdvcmllcylcIikubUN1c3RvbVNjcm9sbGJhcih7XHJcbi8vICAgICAgICAgYXhpczpcInlcIixcclxuLy8gICAgICAgICBzZXRIZWlnaHQ6IDI1MFxyXG4vLyAgICAgfSk7XHJcbi8vXHJcbi8vICAgICAvKiQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKHtcclxuLy8gICAgICAgICBkZWxheToge1xyXG4vLyAgICAgICAgICAgICBzaG93OiA1MDAsIGhpZGU6IDIwMDBcclxuLy8gICAgICAgICB9XHJcbi8vICAgICB9KTsqL1xyXG4vLyB9KTtcclxuXHJcblxyXG4kKCcuc2hvcnQtZGVzY3JpcHRpb25fX2hhbmRsZS5tb3JlIGEnKS5jbGljayhmdW5jdGlvbihlKXtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBkaXYgPSAkKHRoaXMpLnBhcmVudCgpO1xyXG4gICAgJChkaXYpLnNpYmxpbmdzKCcuc2hvcnQtZGVzY3JpcHRpb25fX2hhbmRsZS5sZXNzJykuc2hvdygpO1xyXG4gICAgJChkaXYpLmhpZGUoKTtcclxuICAgICQoJy5zaG9ydC1kZXNjcmlwdGlvbl9fZGVzY3JpcHRpb24nKS50b2dnbGVDbGFzcygnbGVzcycpO1xyXG59KTtcclxuXHJcbiQoJy5zaG9ydC1kZXNjcmlwdGlvbl9faGFuZGxlLmxlc3MgYScpLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyIGRpdiA9ICQodGhpcykucGFyZW50KCk7XHJcbiAgICAkKGRpdikuc2libGluZ3MoJy5zaG9ydC1kZXNjcmlwdGlvbl9faGFuZGxlLm1vcmUnKS5zaG93KCk7XHJcbiAgICAkKGRpdikuaGlkZSgpO1xyXG4gICAgJCgnLnNob3J0LWRlc2NyaXB0aW9uX19kZXNjcmlwdGlvbicpLnRvZ2dsZUNsYXNzKCdsZXNzJyk7XHJcbn0pO1xyXG5cclxuJCgnLmFkZGl0aW9uYWwtaW5mb3JtYXRpb25fX2hhbmRsZS5tb3JlIGEnKS5jbGljayhmdW5jdGlvbihlKXtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBkaXYgPSAkKHRoaXMpLnBhcmVudCgpO1xyXG4gICAgJChkaXYpLnNpYmxpbmdzKCcuYWRkaXRpb25hbC1pbmZvcm1hdGlvbl9faGFuZGxlLmxlc3MnKS5zaG93KCk7XHJcbiAgICAkKGRpdikuaGlkZSgpO1xyXG4gICAgJCgnLmFkZGl0aW9uYWwtaW5mb3JtYXRpb24nKS50b2dnbGVDbGFzcygnb3BlbicpO1xyXG59KTtcclxuJCgnLmFkZGl0aW9uYWwtaW5mb3JtYXRpb25fX2hhbmRsZS5sZXNzIGEnKS5jbGljayhmdW5jdGlvbihlKXtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBkaXYgPSAkKHRoaXMpLnBhcmVudCgpO1xyXG4gICAgJChkaXYpLnNpYmxpbmdzKCcuYWRkaXRpb25hbC1pbmZvcm1hdGlvbl9faGFuZGxlLm1vcmUnKS5zaG93KCk7XHJcbiAgICAkKGRpdikuaGlkZSgpO1xyXG4gICAgJCgnLmFkZGl0aW9uYWwtaW5mb3JtYXRpb24nKS50b2dnbGVDbGFzcygnb3BlbicpO1xyXG59KTtcclxuJCgnLnN0b3JlLWNvdXBvbnNfX3Nob3ctbGVzcycpLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgJCgnLnN0b3JlLWNvdXBvbnNfX2J1dHRvbnMubW9yZScpLnNob3coKTtcclxuICAgICQoJy5zdG9yZS1jb3Vwb25zX19idXR0b25zLmxlc3MnKS5oaWRlKCk7XHJcbiAgICAkKCcuY291cG9ucy1pdGVtLm1vcmUnKS5oaWRlKCk7XHJcbn0pO1xyXG4kKCcuc3RvcmUtY291cG9uc19fc2hvdy1tb3JlJykuY2xpY2soZnVuY3Rpb24oZSl7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICQoJy5zdG9yZS1jb3Vwb25zX19idXR0b25zLmxlc3MnKS5zaG93KCk7XHJcbiAgICQoJy5zdG9yZS1jb3Vwb25zX19idXR0b25zLm1vcmUnKS5oaWRlKCk7XHJcbiAgICQoJy5jb3Vwb25zLWl0ZW0ubW9yZScpLnNob3coKTtcclxufSk7XHJcblxyXG4kKGZ1bmN0aW9uKCkge1xyXG4gICAgZnVuY3Rpb24gcGFyc2VOdW0oc3RyKXtcclxuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChcclxuICAgICAgICAgIFN0cmluZyhzdHIpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKCcsJywnLicpXHJcbiAgICAgICAgICAgIC5tYXRjaCgvLT9cXGQrKD86XFwuXFxkKyk/L2csICcnKSB8fCAwXHJcbiAgICAgICAgICAsIDEwXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICAkKCcuc2hvcnQtY2FsYy1jYXNoYmFjaycpLmZpbmQoJ3NlbGVjdCxpbnB1dCcpLm9uKCdjaGFuZ2Uga2V5dXAgY2xpY2snLGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkdGhpcz0kKHRoaXMpLmNsb3Nlc3QoJy5zaG9ydC1jYWxjLWNhc2hiYWNrJyk7XHJcbiAgICAgICAgY3Vycz1wYXJzZU51bSgkdGhpcy5maW5kKCdzZWxlY3QnKS52YWwoKSk7XHJcbiAgICAgICAgdmFsPSR0aGlzLmZpbmQoJ2lucHV0JykudmFsKCk7XHJcbiAgICAgICAgaWYocGFyc2VOdW0odmFsKSE9dmFsKXtcclxuICAgICAgICAgICAgdmFsPSR0aGlzLmZpbmQoJ2lucHV0JykudmFsKHBhcnNlTnVtKHZhbCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YWw9cGFyc2VOdW0odmFsKTtcclxuXHJcbiAgICAgICAga29lZj0kdGhpcy5maW5kKCdpbnB1dCcpLmF0dHIoJ2RhdGEtY2FzaGJhY2snKS50cmltKCk7XHJcbiAgICAgICAgcHJvbW89JHRoaXMuZmluZCgnaW5wdXQnKS5hdHRyKCdkYXRhLWNhc2hiYWNrLXByb21vJykudHJpbSgpO1xyXG4gICAgICAgIGN1cnJlbmN5PSR0aGlzLmZpbmQoJ2lucHV0JykuYXR0cignZGF0YS1jYXNoYmFjay1jdXJyZW5jeScpLnRyaW0oKTtcclxuXHJcbiAgICAgICAgaWYoa29lZj09cHJvbW8pe1xyXG4gICAgICAgICAgICBwcm9tbz0wO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoa29lZi5pbmRleE9mKCclJyk+MCl7XHJcbiAgICAgICAgICAgIHJlc3VsdD1wYXJzZU51bShrb2VmKSp2YWwqY3Vycy8xMDA7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGN1cnM9cGFyc2VOdW0oJHRoaXMuZmluZCgnW2NvZGU9JytjdXJyZW5jeSsnXScpLnZhbCgpKTtcclxuICAgICAgICAgICAgcmVzdWx0PXBhcnNlTnVtKGtvZWYpKmN1cnNcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHBhcnNlTnVtKHByb21vKT4wKSB7XHJcbiAgICAgICAgICAgIGlmKHByb21vLmluZGV4T2YoJyUnKT4wKXtcclxuICAgICAgICAgICAgICAgIHByb21vPXBhcnNlTnVtKHByb21vKSp2YWwqY3Vycy8xMDA7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgcHJvbW89cGFyc2VOdW0ocHJvbW8pKmN1cnNcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYocHJvbW8+MCkge1xyXG4gICAgICAgICAgICAgICAgb3V0ID0gXCI8c3BhbiBjbGFzcz1vbGRfcHJpY2U+XCIgKyByZXN1bHQudG9GaXhlZCgyKSArIFwiPC9zcGFuPiBcIiArIHByb21vLnRvRml4ZWQoMilcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICBvdXQ9cmVzdWx0LnRvRml4ZWQoMilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBvdXQ9cmVzdWx0LnRvRml4ZWQoMilcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAkdGhpcy5maW5kKCcuY2FsYy1yZXN1bHRfdmFsdWUnKS5odG1sKG91dClcclxuICAgIH0pLmNsaWNrKClcclxufSk7IiwidmFyIG5vdGlmaWNhdGlvbiA9IChmdW5jdGlvbigpIHtcclxuICB2YXIgbm90aWZpY2F0aW9uX2JveCA9ZmFsc2U7XHJcbiAgdmFyIGlzX2luaXQ9ZmFsc2U7XHJcbiAgdmFyIGNvbmZpcm1fb3B0PXtcclxuICAgIHRpdGxlOlwi0KPQtNCw0LvQtdC90LjQtVwiLFxyXG4gICAgcXVlc3Rpb246XCLQktGLINC00LXQudGB0YLQstC40YLQtdC70YzQvdC+INGF0L7RgtC40YLQtSDRg9C00LDQu9C40YLRjD9cIixcclxuICAgIGJ1dHRvblllczpcItCU0LBcIixcclxuICAgIGJ1dHRvbk5vOlwi0J3QtdGCXCIsXHJcbiAgICBjYWxsYmFja1llczpmYWxzZSxcclxuICAgIGNhbGxiYWNrTm86ZmFsc2UsXHJcbiAgICBvYmo6ZmFsc2UsXHJcbiAgfTtcclxuXHJcbiAgdmFyIGFsZXJ0X29wdD17XHJcbiAgICB0aXRsZTpcIlwiLFxyXG4gICAgcXVlc3Rpb246XCLQodC+0L7QsdGJ0LXQvdC40LVcIixcclxuICAgIGJ1dHRvblllczpcItCU0LBcIixcclxuICAgIGNhbGxiYWNrWWVzOmZhbHNlLFxyXG4gICAgb2JqOmZhbHNlLFxyXG4gIH07XHJcblxyXG5cclxuICBmdW5jdGlvbiBpbml0KCl7XHJcbiAgICBpc19pbml0PXRydWU7XHJcbiAgICBub3RpZmljYXRpb25fYm94PSQoJy5ub3RpZmljYXRpb25fYm94Jyk7XHJcbiAgICBpZihub3RpZmljYXRpb25fYm94Lmxlbmd0aD4wKXJldHVybjtcclxuXHJcbiAgICAkKCdib2R5JykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nbm90aWZpY2F0aW9uX2JveCc+PC9kaXY+XCIpO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveD0kKCcubm90aWZpY2F0aW9uX2JveCcpO1xyXG5cclxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywnLm5vdGlmeV9jb250cm9sJyxjbG9zZU1vZGFsKTtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywnLm5vdGlmeV9jbG9zZScsY2xvc2VNb2RhbCk7XHJcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsY2xvc2VNb2RhbEZvbik7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjbG9zZU1vZGFsKCl7XHJcbiAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XHJcbiAgfVxyXG4gIGZ1bmN0aW9uIGNsb3NlTW9kYWxGb24oZSl7XHJcbiAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xyXG4gICAgaWYodGFyZ2V0LmNsYXNzTmFtZT09XCJub3RpZmljYXRpb25fYm94XCIpe1xyXG4gICAgICBjbG9zZU1vZGFsKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhbGVydChkYXRhKXtcclxuICAgIGlmKCFkYXRhKWRhdGE9e307XHJcbiAgICBkYXRhPW9iamVjdHMoYWxlcnRfb3B0LGRhdGEpO1xyXG5cclxuICAgIGlmKCFpc19pbml0KWluaXQoKTtcclxuXHJcbiAgICBub3R5ZnlfY2xhc3M9J25vdGlmeV9ib3ggJztcclxuICAgIGlmKGRhdGEubm90eWZ5X2NsYXNzKW5vdHlmeV9jbGFzcys9ZGF0YS5ub3R5ZnlfY2xhc3M7XHJcblxyXG4gICAgYm94X2h0bWw9JzxkaXYgY2xhc3M9XCInK25vdHlmeV9jbGFzcysnXCI+JztcclxuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV90aXRsZVwiPic7XHJcbiAgICBib3hfaHRtbCs9ZGF0YS50aXRsZTtcclxuICAgIGJveF9odG1sKz0nPHNwYW4gY2xhc3M9XCJub3RpZnlfY2xvc2VcIj48L3NwYW4+JztcclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuXHJcbiAgICBib3hfaHRtbCs9JzxkaXYgY2xhc3M9XCJub3RpZnlfY29udGVudFwiPic7XHJcbiAgICBib3hfaHRtbCs9ZGF0YS5xdWVzdGlvbjtcclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuXHJcbiAgICBpZihkYXRhLmJ1dHRvblllc3x8ZGF0YS5idXR0b25Obykge1xyXG4gICAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250cm9sXCI+JztcclxuICAgICAgaWYgKGRhdGEuYnV0dG9uWWVzKWJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2J0bl95ZXNcIj4nICsgZGF0YS5idXR0b25ZZXMgKyAnPC9kaXY+JztcclxuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX25vXCI+JyArIGRhdGEuYnV0dG9uTm8gKyAnPC9kaXY+JztcclxuICAgICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcbiAgICB9O1xyXG5cclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XHJcblxyXG5cclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcclxuICAgIH0sMTAwKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29uZmlybShkYXRhKXtcclxuICAgIGlmKCFkYXRhKWRhdGE9e307XHJcbiAgICBkYXRhPW9iamVjdHMoY29uZmlybV9vcHQsZGF0YSk7XHJcblxyXG4gICAgaWYoIWlzX2luaXQpaW5pdCgpO1xyXG5cclxuICAgIGJveF9odG1sPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveFwiPic7XHJcbiAgICBib3hfaHRtbCs9JzxkaXYgY2xhc3M9XCJub3RpZnlfdGl0bGVcIj4nO1xyXG4gICAgYm94X2h0bWwrPWRhdGEudGl0bGU7XHJcbiAgICBib3hfaHRtbCs9JzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XHJcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XHJcblxyXG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRlbnRcIj4nO1xyXG4gICAgYm94X2h0bWwrPWRhdGEucXVlc3Rpb247XHJcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XHJcblxyXG4gICAgaWYoZGF0YS5idXR0b25ZZXN8fGRhdGEuYnV0dG9uTm8pIHtcclxuICAgICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udHJvbFwiPic7XHJcbiAgICAgIGlmIChkYXRhLmJ1dHRvblllcylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5feWVzXCI+JyArIGRhdGEuYnV0dG9uWWVzICsgJzwvZGl2Pic7XHJcbiAgICAgIGlmIChkYXRhLmJ1dHRvbk5vKWJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2J0bl9ub1wiPicgKyBkYXRhLmJ1dHRvbk5vICsgJzwvZGl2Pic7XHJcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG4gICAgfVxyXG5cclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XHJcblxyXG4gICAgaWYoZGF0YS5jYWxsYmFja1llcyE9ZmFsc2Upe1xyXG4gICAgICBub3RpZmljYXRpb25fYm94LmZpbmQoJy5ub3RpZnlfYnRuX3llcycpLm9uKCdjbGljaycsZGF0YS5jYWxsYmFja1llcy5iaW5kKGRhdGEub2JqKSk7XHJcbiAgICB9XHJcbiAgICBpZihkYXRhLmNhbGxiYWNrTm8hPWZhbHNlKXtcclxuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl9ubycpLm9uKCdjbGljaycsZGF0YS5jYWxsYmFja05vLmJpbmQoZGF0YS5vYmopKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XHJcbiAgICB9LDEwMClcclxuXHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgYWxlcnQ6IGFsZXJ0LFxyXG4gICAgY29uZmlybTogY29uZmlybVxyXG4gIH07XHJcblxyXG59KSgpO1xyXG5cclxuXHJcbiQoJ1tyZWY9cG9wdXBdJykub24oJ2NsaWNrJyxmdW5jdGlvbiAoZSl7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICR0aGlzPSQodGhpcylcclxuICBlbD0kKCR0aGlzLmF0dHIoJ2hyZWYnKSk7XHJcbiAgZGF0YT1lbC5kYXRhKCk7XHJcblxyXG4gIGRhdGEucXVlc3Rpb249ZWwuaHRtbCgpO1xyXG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxufSk7XHJcbiIsIiQod2luZG93KS5sb2FkKGZ1bmN0aW9uKCkge1xyXG5cclxuICAkKCcuYWNjb3JkaW9uIC5hY2NvcmRpb24tY29udHJvbCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICAkYWNjb3JkaW9uID0gJHRoaXMuY2xvc2VzdCgnLmFjY29yZGlvbicpO1xyXG5cclxuICAgIGlmICgkYWNjb3JkaW9uLmhhc0NsYXNzKCdvcGVuJykpIHtcclxuICAgICAgJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5oaWRlKDMwMCk7XHJcbiAgICAgICRhY2NvcmRpb24ucmVtb3ZlQ2xhc3MoJ29wZW4nKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5zaG93KDMwMCk7XHJcbiAgICAgICRhY2NvcmRpb24uYWRkQ2xhc3MoJ29wZW4nKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH0pO1xyXG59KVxyXG5cclxub2JqZWN0cyA9IGZ1bmN0aW9uIChhLGIpIHtcclxuICB2YXIgYyA9IGIsXHJcbiAgICBrZXk7XHJcbiAgZm9yIChrZXkgaW4gYSkge1xyXG4gICAgaWYgKGEuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICBjW2tleV0gPSBrZXkgaW4gYiA/IGJba2V5XSA6IGFba2V5XTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGM7XHJcbn07XHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCl7XHJcbiAgICBkYXRhPXRoaXM7XHJcbiAgICBkYXRhLmltZy5hdHRyKCdzcmMnLGRhdGEuc3JjKTtcclxuICB9XHJcblxyXG4gIGltZ3M9JCgnc2VjdGlvbjpub3QoLm5hdmlnYXRpb24pJykuZmluZCgnLmxvZ28gaW1nJyk7XHJcbiAgZm9yICh2YXIgaT0wO2k8aW1ncy5sZW5ndGg7aSsrKXtcclxuICAgIGltZz1pbWdzLmVxKGkpO1xyXG4gICAgc3JjPWltZy5hdHRyKCdzcmMnKTtcclxuICAgIGltZy5hdHRyKCdzcmMnLCcvaW1hZ2VzL3RlbXBsYXRlLWxvZ28uanBnJyk7XHJcbiAgICBkYXRhPXtcclxuICAgICAgc3JjOnNyYyxcclxuICAgICAgaW1nOmltZ1xyXG4gICAgfTtcclxuICAgIGltYWdlPSQoJzxpbWcvPicse1xyXG4gICAgICBzcmM6c3JjXHJcbiAgICB9KS5vbignbG9hZCcsaW1nX2xvYWRfZmluaXNoLmJpbmQoZGF0YSkpXHJcbiAgfVxyXG59KSgpO1xyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gIGVscz0kKCcuYWpheF9sb2FkJyk7XHJcbiAgZm9yKGk9MDtpPGVscy5sZW5ndGg7aSsrKXtcclxuICAgIGVsPWVscy5lcShpKTtcclxuICAgIHVybD1lbC5hdHRyKCdyZXMnKTtcclxuICAgICQuZ2V0KHVybCxmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAkdGhpcz0kKHRoaXMpO1xyXG4gICAgICAkdGhpcy5odG1sKGRhdGEpO1xyXG4gICAgICBhamF4Rm9ybSgkdGhpcyk7XHJcbiAgICB9LmJpbmQoZWwpKVxyXG4gIH1cclxufSkoKTtcclxuXHJcbiQoJ2lucHV0W3R5cGU9ZmlsZV0nKS5vbignY2hhbmdlJyxmdW5jdGlvbihldnQpe1xyXG4gIHZhciBmaWxlID0gZXZ0LnRhcmdldC5maWxlczsgLy8gRmlsZUxpc3Qgb2JqZWN0XHJcbiAgdmFyIGYgPSBmaWxlWzBdO1xyXG4gIC8vIE9ubHkgcHJvY2VzcyBpbWFnZSBmaWxlcy5cclxuICBpZiAoIWYudHlwZS5tYXRjaCgnaW1hZ2UuKicpKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG5cclxuICBkYXRhPSB7XHJcbiAgICAnZWwnOiB0aGlzLFxyXG4gICAgJ2YnOiBmXHJcbiAgfTtcclxuICByZWFkZXIub25sb2FkID0gKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbihlKSB7XHJcbiAgICAgIGltZz0kKCdbZm9yPVwiJytkYXRhLmVsLm5hbWUrJ1wiXScpO1xyXG4gICAgICBpZihpbWcubGVuZ3RoPjApe1xyXG4gICAgICAgIGltZy5hdHRyKCdzcmMnLGUudGFyZ2V0LnJlc3VsdClcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9KShkYXRhKTtcclxuICAvLyBSZWFkIGluIHRoZSBpbWFnZSBmaWxlIGFzIGEgZGF0YSBVUkwuXHJcbiAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZik7XHJcbn0pO1xyXG5cclxuJCgnYm9keScpLm9uKCdjbGljaycsJ2EuYWpheEZvcm1PcGVuJyxmdW5jdGlvbihlKXtcclxuICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgaHJlZj10aGlzLmhyZWYuc3BsaXQoJyMnKTtcclxuICBocmVmPWhyZWZbaHJlZi5sZW5ndGgtMV07XHJcblxyXG4gIGRhdGE9e1xyXG4gICAgYnV0dG9uWWVzOmZhbHNlLFxyXG4gICAgbm90eWZ5X2NsYXNzOlwibm90aWZ5X3doaXRlIGxvYWRpbmdcIixcclxuICAgIHF1ZXN0aW9uOicnXHJcbiAgfTtcclxuICBtb2RhbF9jbGFzcz0kKHRoaXMpLmRhdGEoJ21vZGFsLWNsYXNzJyk7XHJcblxyXG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxuICAkLmdldCgnLycraHJlZixmdW5jdGlvbihkYXRhKXtcclxuICAgICQoJy5ub3RpZnlfYm94JykucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgICQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpLmh0bWwoZGF0YS5odG1sKTtcclxuICAgIGFqYXhGb3JtKCQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpKTtcclxuICAgIGlmKG1vZGFsX2NsYXNzKXtcclxuICAgICAgJCgnLm5vdGlmeV9ib3ggLm5vdGlmeV9jb250ZW50IC5yb3cnKS5hZGRDbGFzcyhtb2RhbF9jbGFzcyk7XHJcbiAgICB9XHJcbiAgfSwnanNvbicpXHJcbn0pOyIsImZ1bmN0aW9uIGFqYXhGb3JtKGVscykge1xyXG4gIHZhciBmaWxlQXBpID0gd2luZG93LkZpbGUgJiYgd2luZG93LkZpbGVSZWFkZXIgJiYgd2luZG93LkZpbGVMaXN0ICYmIHdpbmRvdy5CbG9iID8gdHJ1ZSA6IGZhbHNlO1xyXG4gIHZhciBkZWZhdWx0cyA9IHtcclxuICAgIGVycm9yX2NsYXNzOiAnLmhhcy1lcnJvcicsXHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gb25Qb3N0KHBvc3Qpe1xyXG4gICAgdmFyIGRhdGE9dGhpcztcclxuICAgIGZvcm09ZGF0YS5mb3JtO1xyXG4gICAgd3JhcD1kYXRhLndyYXA7XHJcbiAgICBpZihwb3N0LnJlbmRlcil7XHJcbiAgICAgIHBvc3Qubm90eWZ5X2NsYXNzPVwibm90aWZ5X3doaXRlXCI7XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydChwb3N0KTtcclxuICAgIH1lbHNle1xyXG4gICAgICB3cmFwLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICAgIHdyYXAuaHRtbChwb3N0Lmh0bWwpO1xyXG4gICAgICBhamF4Rm9ybSh3cmFwKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG9uRmFpbCgpe1xyXG4gICAgdmFyIGRhdGE9dGhpcztcclxuICAgIGZvcm09ZGF0YS5mb3JtO1xyXG4gICAgd3JhcD1kYXRhLndyYXA7XHJcbiAgICB3cmFwLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICB3cmFwLmh0bWwoJ9Ce0YjQuNCx0LrQsCDQvtCx0YDQsNCx0L7RgtC60Lgg0YTQvtGA0LzRiyDQv9C+0L/RgNC+0LHRg9C50YLQtSDQv9C+0LfQttC1Jyk7XHJcbiAgICBhamF4Rm9ybSh3cmFwKTtcclxuXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBvblN1Ym1pdChlKXtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBkYXRhPXRoaXM7XHJcbiAgICBmb3JtPWRhdGEuZm9ybTtcclxuICAgIHdyYXA9ZGF0YS53cmFwO1xyXG5cclxuICAgIGlmKGZvcm0ueWlpQWN0aXZlRm9ybSl7XHJcbiAgICAgIGZvcm0ueWlpQWN0aXZlRm9ybSgndmFsaWRhdGUnKTtcclxuICAgIH07XHJcblxyXG4gICAgaXNWYWxpZD0oZm9ybS5maW5kKGRhdGEucGFyYW0uZXJyb3JfY2xhc3MpLmxlbmd0aD09MCk7XHJcblxyXG4gICAgaWYoIWlzVmFsaWQpe1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9ZWxzZXtcclxuICAgICAgcmVxdWlyZWQ9Zm9ybS5maW5kKCdpbnB1dC5yZXF1aXJlZCcpO1xyXG4gICAgICBmb3IoaT0wO2k8cmVxdWlyZWQubGVuZ3RoO2krKyl7XHJcbiAgICAgICAgaWYocmVxdWlyZWQuZXEoaSkudmFsKCkubGVuZ3RoPDEpe1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYoIWZvcm0uc2VyaWFsaXplT2JqZWN0KWFkZFNSTygpO1xyXG5cclxuICAgIHZhciBwb3N0PWZvcm0uc2VyaWFsaXplT2JqZWN0KCk7XHJcbiAgICBmb3JtLmFkZENsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICBmb3JtLmh0bWwoJycpO1xyXG5cclxuICAgICQucG9zdChcclxuICAgICAgZGF0YS51cmwsXHJcbiAgICAgIHBvc3QsXHJcbiAgICAgIG9uUG9zdC5iaW5kKGRhdGEpLFxyXG4gICAgICAnanNvbidcclxuICAgICkuZmFpbChvbkZhaWwuYmluZChkYXRhKSk7XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgZWxzLmZpbmQoJ1tyZXF1aXJlZF0nKVxyXG4gICAgLmFkZENsYXNzKCdyZXF1aXJlZCcpXHJcbiAgICAucmVtb3ZlQXR0cigncmVxdWlyZWQnKTtcclxuXHJcbiAgZm9yKHZhciBpPTA7aTxlbHMubGVuZ3RoO2krKyl7XHJcbiAgICB3cmFwPWVscy5lcShpKTtcclxuICAgIGZvcm09d3JhcC5maW5kKCdmb3JtJyk7XHJcbiAgICBkYXRhPXtcclxuICAgICAgZm9ybTpmb3JtLFxyXG4gICAgICBwYXJhbTpkZWZhdWx0cyxcclxuICAgICAgd3JhcDp3cmFwXHJcbiAgICB9O1xyXG4gICAgZGF0YS51cmw9Zm9ybS5hdHRyKCdhY3Rpb24nKSB8fCBsb2NhdGlvbi5ocmVmO1xyXG4gICAgZGF0YS5tZXRob2Q9IGZvcm0uYXR0cignbWV0aG9kJykgfHwgJ3Bvc3QnO1xyXG4gICAgZm9ybS5vZmYoJ3N1Ym1pdCcpO1xyXG4gICAgZm9ybS5vbignc3VibWl0Jywgb25TdWJtaXQuYmluZChkYXRhKSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBhZGRTUk8oKXtcclxuICAkLmZuLnNlcmlhbGl6ZU9iamVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBvID0ge307XHJcbiAgICB2YXIgYSA9IHRoaXMuc2VyaWFsaXplQXJyYXkoKTtcclxuICAgICQuZWFjaChhLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGlmIChvW3RoaXMubmFtZV0pIHtcclxuICAgICAgICBpZiAoIW9bdGhpcy5uYW1lXS5wdXNoKSB7XHJcbiAgICAgICAgICBvW3RoaXMubmFtZV0gPSBbb1t0aGlzLm5hbWVdXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgb1t0aGlzLm5hbWVdLnB1c2godGhpcy52YWx1ZSB8fCAnJyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgb1t0aGlzLm5hbWVdID0gdGhpcy52YWx1ZSB8fCAnJztcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbztcclxuICB9O1xyXG59O1xyXG5hZGRTUk8oKTsiLCIkKCdib2R5Jykub24oJ2NsaWNrJywnYVtocmVmPSNsb2dpbl0sYVtocmVmPSNyZWdpc3RyYXRpb25dLGFbaHJlZj0jcmVzZXRwYXNzd29yZF0nLGZ1bmN0aW9uKGUpe1xyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxuICAvL9C/0YDQuCDQvtGC0LrRgNGL0YLQuNC4INGE0L7RgNC80Ysg0YDQtdCz0LjRgdGC0YDQsNGG0LjQuCDQt9Cw0LrRgNGL0YLRjCwg0LXRgdC70Lgg0L7RgtGA0YvRgtC+IC0g0L/QvtC/0LDQvyDQuNGB0L/QvtC70YzQt9C+0LLQsNC90LjRjyDQutGD0L/QvtC90LAg0LHQtdC3INGA0LXQs9C40YHRgtGA0LDRhtC40LhcclxuICB2YXIgcG9wdXAgPSAkKFwiYVtocmVmPScjc2hvd3Byb21vY29kZS1ub3JlZ2lzdGVyJ11cIikuZGF0YSgncG9wdXAnKTtcclxuICBpZiAocG9wdXApIHtcclxuICAgIHBvcHVwLmNsb3NlKCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHBvcHVwID0gJCgnZGl2LnBvcHVwX2NvbnQsIGRpdi5wb3B1cF9iYWNrJyk7XHJcbiAgICBpZiAocG9wdXApIHtcclxuICAgICAgcG9wdXAuaGlkZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuICBocmVmPXRoaXMuaHJlZi5zcGxpdCgnIycpO1xyXG4gIGhyZWY9aHJlZltocmVmLmxlbmd0aC0xXTtcclxuXHJcbiAgZGF0YT17XHJcbiAgICBidXR0b25ZZXM6ZmFsc2UsXHJcbiAgICBub3R5ZnlfY2xhc3M6XCJub3RpZnlfd2hpdGUgbG9hZGluZ1wiLFxyXG4gICAgcXVlc3Rpb246JydcclxuICB9O1xyXG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxuICAkLmdldCgnLycraHJlZixmdW5jdGlvbihkYXRhKXtcclxuICAgICQoJy5ub3RpZnlfYm94JykucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgICQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpLmh0bWwoZGF0YS5odG1sKTtcclxuICAgIGFqYXhGb3JtKCQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpKTtcclxuICB9LCdqc29uJylcclxufSk7XHJcblxyXG4kKGZ1bmN0aW9uKCkge1xyXG4gIGZ1bmN0aW9uIHN0YXJOb21pbmF0aW9uKGluZGV4KSB7XHJcbiAgICB2YXIgc3RhcnMgPSAkKFwiLm5vdGlmeV9jb250ZW50IC5yYXRpbmcgLmZhLXdyYXBwZXIgLmZhXCIpO1xyXG4gICAgc3RhcnMucmVtb3ZlQ2xhc3MoXCJmYS1zdGFyXCIpLmFkZENsYXNzKFwiZmEtc3Rhci1vXCIpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmRleDsgaSsrKSB7XHJcbiAgICAgIHN0YXJzLmVxKGkpLnJlbW92ZUNsYXNzKFwiZmEtc3Rhci1vXCIpLmFkZENsYXNzKFwiZmEtc3RhclwiKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gICQoZG9jdW1lbnQpLm9uKFwibW91c2VvdmVyXCIsIFwiLm5vdGlmeV9jb250ZW50IC5yYXRpbmcgLmZhLXdyYXBwZXIgLmZhXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBzdGFyTm9taW5hdGlvbigkKHRoaXMpLmluZGV4KCkgKyAxKTtcclxuICB9KS5vbihcIm1vdXNlbGVhdmVcIiwgXCIubm90aWZ5X2NvbnRlbnQgLnJhdGluZyAuZmEtd3JhcHBlclwiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgc3Rhck5vbWluYXRpb24oJChcIi5ub3RpZnlfY29udGVudCBpbnB1dFtuYW1lPVxcXCJSZXZpZXdzW3JhdGluZ11cXFwiXVwiKS52YWwoKSk7XHJcbiAgfSkub24oXCJjbGlja1wiLCBcIi5ub3RpZnlfY29udGVudCAucmF0aW5nIC5mYS13cmFwcGVyIC5mYVwiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgc3Rhck5vbWluYXRpb24oJCh0aGlzKS5pbmRleCgpICsgMSk7XHJcblxyXG4gICAgJChcIi5ub3RpZnlfY29udGVudCBpbnB1dFtuYW1lPVxcXCJSZXZpZXdzW3JhdGluZ11cXFwiXVwiKS52YWwoJCh0aGlzKS5pbmRleCgpICsgMSk7XHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuYWpheEZvcm0oJCgnLmFqYXhfZm9ybScpKTtcclxuXHJcblxyXG4kKFwiYVtocmVmPScjc2hvd3Byb21vY29kZS1ub3JlZ2lzdGVyJ11cIikucG9wdXAoe1xyXG4gIGNvbnRlbnQgOiAnPGRpdiBjbGFzcz1cImNvdXBvbi1ub3JlZ2lzdGVyXCI+JytcclxuICAnPGRpdiBjbGFzcz1cImNvdXBvbi1ub3JlZ2lzdGVyX19pY29uXCI+PGltZyBzcmM9XCIvaW1hZ2VzL3RlbXBsYXRlcy9zd2EucG5nXCIgYWx0PVwiXCI+PC9kaXY+JytcclxuICAnPGRpdiBjbGFzcz1cImNvdXBvbi1ub3JlZ2lzdGVyX190ZXh0XCI+0JTQu9GPINC/0L7Qu9GD0YfQtdC90LjRjyDQutGN0YjQsdGN0LrQsCDQvdC10L7QsdGF0L7QtNC40LzQvjwvYnI+0LDQstGC0L7RgNC40LfQvtCy0LDRgtGM0YHRjyDQvdCwINGB0LDQudGC0LU8L2Rpdj4nICtcclxuICAnPGRpdiBjbGFzcz1cImNvdXBvbi1ub3JlZ2lzdGVyX19idXR0b25zXCI+JytcclxuICAnPGEgaHJlZj1cImdvdG8vY291cG9uOntpZH1cIiB0YXJnZXQ9XCJfYmxhbmtcIiBjbGFzcz1cImJ0biAgYnRuLXBvcHVwXCI+0JLQvtGB0L/QvtC70YzQt9C+0LLQsNGC0YzRgdGPPC9icj7QutGD0L/QvtC90L7QvDwvYnI+0LHQtdC3INGA0LXQs9C40YHRgtGA0LDRhtC40Lg8L2E+JytcclxuICAnPGEgaHJlZj1cIiNyZWdpc3RyYXRpb25cIiBjbGFzcz1cImJ0biBidG4tcG9wdXBcIj7Ql9Cw0YDQtdCz0LjRgdGC0YDQuNGA0L7QstCw0YLRjNGB0Y88L2JyPtC4INC/0L7Qu9GD0YfQuNGC0Yw8L2JyPtC10YnRkSDQuCDQutGN0YjQsdGN0Lo8L2E+JytcclxuICAnPC9kaXY+JytcclxuICAnPGRpdj4nLFxyXG4gIHR5cGUgOiAnaHRtbCcsXHJcbiAgYmVmb3JlT3BlbjogZnVuY3Rpb24oKSB7XHJcbiAgICAvL9C30LDQvNC10L3QuNGC0Ywg0LIg0LrQvtC90YLQtdC90YLQtSB7aWR9XHJcbiAgICB2YXIgaWQgPSAkKHRoaXMuZWxlKS5kYXRhKCdpZCcpO1xyXG4gICAgdGhpcy5vLmNvbnRlbnQgPSB0aGlzLm8uY29udGVudC5yZXBsYWNlKCd7aWR9JywgaWQpO1xyXG4gICAgLy/QtdGB0LvQuCDQt9Cw0LrRgNGL0LvQuCDQv9GA0LjQvdGD0LTQuNGC0LXQu9GM0L3Qviwg0YLQviDQv9C+0LrQsNC30LDRgtGMXHJcbiAgICBwb3B1cCA9ICQoJ2Rpdi5wb3B1cF9jb250LCBkaXYucG9wdXBfYmFjaycpO1xyXG4gICAgaWYgKHBvcHVwKSB7XHJcbiAgICAgIHBvcHVwLnNob3coKTtcclxuICAgIH1cclxuICB9LFxyXG4gIGFmdGVyT3BlbjogZnVuY3Rpb24oKSB7XHJcbiAgICAkKCcucG9wdXBfY29udGVudCcpWzBdLmlubmVySFRNTCA9IHRoaXMuby5jb250ZW50O1xyXG4gIH1cclxufSk7Il19
