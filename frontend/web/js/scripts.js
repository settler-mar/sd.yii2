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
/*!
* Bootstrap.js by @fat & @mdo
* Copyright 2012 Twitter, Inc.
* http://www.apache.org/licenses/LICENSE-2.0.txt
*/
!function(e){"use strict";e(function(){e.support.transition=function(){var e=function(){var e=document.createElement("bootstrap"),t={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"},n;for(n in t)if(e.style[n]!==undefined)return t[n]}();return e&&{end:e}}()})}(window.jQuery),!function(e){"use strict";var t='[data-dismiss="alert"]',n=function(n){e(n).on("click",t,this.close)};n.prototype.close=function(t){function s(){i.trigger("closed").remove()}var n=e(this),r=n.attr("data-target"),i;r||(r=n.attr("href"),r=r&&r.replace(/.*(?=#[^\s]*$)/,"")),i=e(r),t&&t.preventDefault(),i.length||(i=n.hasClass("alert")?n:n.parent()),i.trigger(t=e.Event("close"));if(t.isDefaultPrevented())return;i.removeClass("in"),e.support.transition&&i.hasClass("fade")?i.on(e.support.transition.end,s):s()};var r=e.fn.alert;e.fn.alert=function(t){return this.each(function(){var r=e(this),i=r.data("alert");i||r.data("alert",i=new n(this)),typeof t=="string"&&i[t].call(r)})},e.fn.alert.Constructor=n,e.fn.alert.noConflict=function(){return e.fn.alert=r,this},e(document).on("click.alert.data-api",t,n.prototype.close)}(window.jQuery),!function(e){"use strict";var t=function(t,n){this.$element=e(t),this.options=e.extend({},e.fn.button.defaults,n)};t.prototype.setState=function(e){var t="disabled",n=this.$element,r=n.data(),i=n.is("input")?"val":"html";e+="Text",r.resetText||n.data("resetText",n[i]()),n[i](r[e]||this.options[e]),setTimeout(function(){e=="loadingText"?n.addClass(t).attr(t,t):n.removeClass(t).removeAttr(t)},0)},t.prototype.toggle=function(){var e=this.$element.closest('[data-toggle="buttons-radio"]');e&&e.find(".active").removeClass("active"),this.$element.toggleClass("active")};var n=e.fn.button;e.fn.button=function(n){return this.each(function(){var r=e(this),i=r.data("button"),s=typeof n=="object"&&n;i||r.data("button",i=new t(this,s)),n=="toggle"?i.toggle():n&&i.setState(n)})},e.fn.button.defaults={loadingText:"loading..."},e.fn.button.Constructor=t,e.fn.button.noConflict=function(){return e.fn.button=n,this},e(document).on("click.button.data-api","[data-toggle^=button]",function(t){var n=e(t.target);n.hasClass("btn")||(n=n.closest(".btn")),n.button("toggle")})}(window.jQuery),!function(e){"use strict";var t=function(t,n){this.$element=e(t),this.$indicators=this.$element.find(".carousel-indicators"),this.options=n,this.options.pause=="hover"&&this.$element.on("mouseenter",e.proxy(this.pause,this)).on("mouseleave",e.proxy(this.cycle,this))};t.prototype={cycle:function(t){return t||(this.paused=!1),this.interval&&clearInterval(this.interval),this.options.interval&&!this.paused&&(this.interval=setInterval(e.proxy(this.next,this),this.options.interval)),this},getActiveIndex:function(){return this.$active=this.$element.find(".item.active"),this.$items=this.$active.parent().children(),this.$items.index(this.$active)},to:function(t){var n=this.getActiveIndex(),r=this;if(t>this.$items.length-1||t<0)return;return this.sliding?this.$element.one("slid",function(){r.to(t)}):n==t?this.pause().cycle():this.slide(t>n?"next":"prev",e(this.$items[t]))},pause:function(t){return t||(this.paused=!0),this.$element.find(".next, .prev").length&&e.support.transition.end&&(this.$element.trigger(e.support.transition.end),this.cycle(!0)),clearInterval(this.interval),this.interval=null,this},next:function(){if(this.sliding)return;return this.slide("next")},prev:function(){if(this.sliding)return;return this.slide("prev")},slide:function(t,n){var r=this.$element.find(".item.active"),i=n||r[t](),s=this.interval,o=t=="next"?"left":"right",u=t=="next"?"first":"last",a=this,f;this.sliding=!0,s&&this.pause(),i=i.length?i:this.$element.find(".item")[u](),f=e.Event("slide",{relatedTarget:i[0],direction:o});if(i.hasClass("active"))return;this.$indicators.length&&(this.$indicators.find(".active").removeClass("active"),this.$element.one("slid",function(){var t=e(a.$indicators.children()[a.getActiveIndex()]);t&&t.addClass("active")}));if(e.support.transition&&this.$element.hasClass("slide")){this.$element.trigger(f);if(f.isDefaultPrevented())return;i.addClass(t),i[0].offsetWidth,r.addClass(o),i.addClass(o),this.$element.one(e.support.transition.end,function(){i.removeClass([t,o].join(" ")).addClass("active"),r.removeClass(["active",o].join(" ")),a.sliding=!1,setTimeout(function(){a.$element.trigger("slid")},0)})}else{this.$element.trigger(f);if(f.isDefaultPrevented())return;r.removeClass("active"),i.addClass("active"),this.sliding=!1,this.$element.trigger("slid")}return s&&this.cycle(),this}};var n=e.fn.carousel;e.fn.carousel=function(n){return this.each(function(){var r=e(this),i=r.data("carousel"),s=e.extend({},e.fn.carousel.defaults,typeof n=="object"&&n),o=typeof n=="string"?n:s.slide;i||r.data("carousel",i=new t(this,s)),typeof n=="number"?i.to(n):o?i[o]():s.interval&&i.pause().cycle()})},e.fn.carousel.defaults={interval:5e3,pause:"hover"},e.fn.carousel.Constructor=t,e.fn.carousel.noConflict=function(){return e.fn.carousel=n,this},e(document).on("click.carousel.data-api","[data-slide], [data-slide-to]",function(t){var n=e(this),r,i=e(n.attr("data-target")||(r=n.attr("href"))&&r.replace(/.*(?=#[^\s]+$)/,"")),s=e.extend({},i.data(),n.data()),o;i.carousel(s),(o=n.attr("data-slide-to"))&&i.data("carousel").pause().to(o).cycle(),t.preventDefault()})}(window.jQuery),!function(e){"use strict";var t=function(t,n){this.$element=e(t),this.options=e.extend({},e.fn.collapse.defaults,n),this.options.parent&&(this.$parent=e(this.options.parent)),this.options.toggle&&this.toggle()};t.prototype={constructor:t,dimension:function(){var e=this.$element.hasClass("width");return e?"width":"height"},show:function(){var t,n,r,i;if(this.transitioning||this.$element.hasClass("in"))return;t=this.dimension(),n=e.camelCase(["scroll",t].join("-")),r=this.$parent&&this.$parent.find("> .accordion-group > .in");if(r&&r.length){i=r.data("collapse");if(i&&i.transitioning)return;r.collapse("hide"),i||r.data("collapse",null)}this.$element[t](0),this.transition("addClass",e.Event("show"),"shown"),e.support.transition&&this.$element[t](this.$element[0][n])},hide:function(){var t;if(this.transitioning||!this.$element.hasClass("in"))return;t=this.dimension(),this.reset(this.$element[t]()),this.transition("removeClass",e.Event("hide"),"hidden"),this.$element[t](0)},reset:function(e){var t=this.dimension();return this.$element.removeClass("collapse")[t](e||"auto")[0].offsetWidth,this.$element[e!==null?"addClass":"removeClass"]("collapse"),this},transition:function(t,n,r){var i=this,s=function(){n.type=="show"&&i.reset(),i.transitioning=0,i.$element.trigger(r)};this.$element.trigger(n);if(n.isDefaultPrevented())return;this.transitioning=1,this.$element[t]("in"),e.support.transition&&this.$element.hasClass("collapse")?this.$element.one(e.support.transition.end,s):s()},toggle:function(){this[this.$element.hasClass("in")?"hide":"show"]()}};var n=e.fn.collapse;e.fn.collapse=function(n){return this.each(function(){var r=e(this),i=r.data("collapse"),s=e.extend({},e.fn.collapse.defaults,r.data(),typeof n=="object"&&n);i||r.data("collapse",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.collapse.defaults={toggle:!0},e.fn.collapse.Constructor=t,e.fn.collapse.noConflict=function(){return e.fn.collapse=n,this},e(document).on("click.collapse.data-api","[data-toggle=collapse]",function(t){var n=e(this),r,i=n.attr("data-target")||t.preventDefault()||(r=n.attr("href"))&&r.replace(/.*(?=#[^\s]+$)/,""),s=e(i).data("collapse")?"toggle":n.data();n[e(i).hasClass("in")?"addClass":"removeClass"]("collapsed"),e(i).collapse(s)})}(window.jQuery),!function(e){"use strict";function r(){e(t).each(function(){i(e(this)).removeClass("open")})}function i(t){var n=t.attr("data-target"),r;n||(n=t.attr("href"),n=n&&/#/.test(n)&&n.replace(/.*(?=#[^\s]*$)/,"")),r=n&&e(n);if(!r||!r.length)r=t.parent();return r}var t="[data-toggle=dropdown]",n=function(t){var n=e(t).on("click.dropdown.data-api",this.toggle);e("html").on("click.dropdown.data-api",function(){n.parent().removeClass("open")})};n.prototype={constructor:n,toggle:function(t){var n=e(this),s,o;if(n.is(".disabled, :disabled"))return;return s=i(n),o=s.hasClass("open"),r(),o||s.toggleClass("open"),n.focus(),!1},keydown:function(n){var r,s,o,u,a,f;if(!/(38|40|27)/.test(n.keyCode))return;r=e(this),n.preventDefault(),n.stopPropagation();if(r.is(".disabled, :disabled"))return;u=i(r),a=u.hasClass("open");if(!a||a&&n.keyCode==27)return n.which==27&&u.find(t).focus(),r.click();s=e("[role=menu] li:not(.divider):visible a",u);if(!s.length)return;f=s.index(s.filter(":focus")),n.keyCode==38&&f>0&&f--,n.keyCode==40&&f<s.length-1&&f++,~f||(f=0),s.eq(f).focus()}};var s=e.fn.dropdown;e.fn.dropdown=function(t){return this.each(function(){var r=e(this),i=r.data("dropdown");i||r.data("dropdown",i=new n(this)),typeof t=="string"&&i[t].call(r)})},e.fn.dropdown.Constructor=n,e.fn.dropdown.noConflict=function(){return e.fn.dropdown=s,this},e(document).on("click.dropdown.data-api",r).on("click.dropdown.data-api",".dropdown form",function(e){e.stopPropagation()}).on("click.dropdown-menu",function(e){e.stopPropagation()}).on("click.dropdown.data-api",t,n.prototype.toggle).on("keydown.dropdown.data-api",t+", [role=menu]",n.prototype.keydown)}(window.jQuery),!function(e){"use strict";var t=function(t,n){this.options=n,this.$element=e(t).delegate('[data-dismiss="modal"]',"click.dismiss.modal",e.proxy(this.hide,this)),this.options.remote&&this.$element.find(".modal-body").load(this.options.remote)};t.prototype={constructor:t,toggle:function(){return this[this.isShown?"hide":"show"]()},show:function(){var t=this,n=e.Event("show");this.$element.trigger(n);if(this.isShown||n.isDefaultPrevented())return;this.isShown=!0,this.escape(),this.backdrop(function(){var n=e.support.transition&&t.$element.hasClass("fade");t.$element.parent().length||t.$element.appendTo(document.body),t.$element.show(),n&&t.$element[0].offsetWidth,t.$element.addClass("in").attr("aria-hidden",!1),t.enforceFocus(),n?t.$element.one(e.support.transition.end,function(){t.$element.focus().trigger("shown")}):t.$element.focus().trigger("shown")})},hide:function(t){t&&t.preventDefault();var n=this;t=e.Event("hide"),this.$element.trigger(t);if(!this.isShown||t.isDefaultPrevented())return;this.isShown=!1,this.escape(),e(document).off("focusin.modal"),this.$element.removeClass("in").attr("aria-hidden",!0),e.support.transition&&this.$element.hasClass("fade")?this.hideWithTransition():this.hideModal()},enforceFocus:function(){var t=this;e(document).on("focusin.modal",function(e){t.$element[0]!==e.target&&!t.$element.has(e.target).length&&t.$element.focus()})},escape:function(){var e=this;this.isShown&&this.options.keyboard?this.$element.on("keyup.dismiss.modal",function(t){t.which==27&&e.hide()}):this.isShown||this.$element.off("keyup.dismiss.modal")},hideWithTransition:function(){var t=this,n=setTimeout(function(){t.$element.off(e.support.transition.end),t.hideModal()},500);this.$element.one(e.support.transition.end,function(){clearTimeout(n),t.hideModal()})},hideModal:function(){var e=this;this.$element.hide(),this.backdrop(function(){e.removeBackdrop(),e.$element.trigger("hidden")})},removeBackdrop:function(){this.$backdrop&&this.$backdrop.remove(),this.$backdrop=null},backdrop:function(t){var n=this,r=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var i=e.support.transition&&r;this.$backdrop=e('<div class="modal-backdrop '+r+'" />').appendTo(document.body),this.$backdrop.click(this.options.backdrop=="static"?e.proxy(this.$element[0].focus,this.$element[0]):e.proxy(this.hide,this)),i&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in");if(!t)return;i?this.$backdrop.one(e.support.transition.end,t):t()}else!this.isShown&&this.$backdrop?(this.$backdrop.removeClass("in"),e.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one(e.support.transition.end,t):t()):t&&t()}};var n=e.fn.modal;e.fn.modal=function(n){return this.each(function(){var r=e(this),i=r.data("modal"),s=e.extend({},e.fn.modal.defaults,r.data(),typeof n=="object"&&n);i||r.data("modal",i=new t(this,s)),typeof n=="string"?i[n]():s.show&&i.show()})},e.fn.modal.defaults={backdrop:!0,keyboard:!0,show:!0},e.fn.modal.Constructor=t,e.fn.modal.noConflict=function(){return e.fn.modal=n,this},e(document).on("click.modal.data-api",'[data-toggle="modal"]',function(t){var n=e(this),r=n.attr("href"),i=e(n.attr("data-target")||r&&r.replace(/.*(?=#[^\s]+$)/,"")),s=i.data("modal")?"toggle":e.extend({remote:!/#/.test(r)&&r},i.data(),n.data());t.preventDefault(),i.modal(s).one("hide",function(){n.focus()})})}(window.jQuery),!function(e){"use strict";var t=function(e,t){this.init("tooltip",e,t)};t.prototype={constructor:t,init:function(t,n,r){var i,s,o,u,a;this.type=t,this.$element=e(n),this.options=this.getOptions(r),this.enabled=!0,o=this.options.trigger.split(" ");for(a=o.length;a--;)u=o[a],u=="click"?this.$element.on("click."+this.type,this.options.selector,e.proxy(this.toggle,this)):u!="manual"&&(i=u=="hover"?"mouseenter":"focus",s=u=="hover"?"mouseleave":"blur",this.$element.on(i+"."+this.type,this.options.selector,e.proxy(this.enter,this)),this.$element.on(s+"."+this.type,this.options.selector,e.proxy(this.leave,this)));this.options.selector?this._options=e.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},getOptions:function(t){return t=e.extend({},e.fn[this.type].defaults,this.$element.data(),t),t.delay&&typeof t.delay=="number"&&(t.delay={show:t.delay,hide:t.delay}),t},enter:function(t){var n=e.fn[this.type].defaults,r={},i;this._options&&e.each(this._options,function(e,t){n[e]!=t&&(r[e]=t)},this),i=e(t.currentTarget)[this.type](r).data(this.type);if(!i.options.delay||!i.options.delay.show)return i.show();clearTimeout(this.timeout),i.hoverState="in",this.timeout=setTimeout(function(){i.hoverState=="in"&&i.show()},i.options.delay.show)},leave:function(t){var n=e(t.currentTarget)[this.type](this._options).data(this.type);this.timeout&&clearTimeout(this.timeout);if(!n.options.delay||!n.options.delay.hide)return n.hide();n.hoverState="out",this.timeout=setTimeout(function(){n.hoverState=="out"&&n.hide()},n.options.delay.hide)},show:function(){var t,n,r,i,s,o,u=e.Event("show");if(this.hasContent()&&this.enabled){this.$element.trigger(u);if(u.isDefaultPrevented())return;t=this.tip(),this.setContent(),this.options.animation&&t.addClass("fade"),s=typeof this.options.placement=="function"?this.options.placement.call(this,t[0],this.$element[0]):this.options.placement,t.detach().css({top:0,left:0,display:"block"}),this.options.container?t.appendTo(this.options.container):t.insertAfter(this.$element),n=this.getPosition(),r=t[0].offsetWidth,i=t[0].offsetHeight;switch(s){case"bottom":o={top:n.top+n.height,left:n.left+n.width/2-r/2};break;case"top":o={top:n.top-i,left:n.left+n.width/2-r/2};break;case"left":o={top:n.top+n.height/2-i/2,left:n.left-r};break;case"right":o={top:n.top+n.height/2-i/2,left:n.left+n.width}}this.applyPlacement(o,s),this.$element.trigger("shown")}},applyPlacement:function(e,t){var n=this.tip(),r=n[0].offsetWidth,i=n[0].offsetHeight,s,o,u,a;n.offset(e).addClass(t).addClass("in"),s=n[0].offsetWidth,o=n[0].offsetHeight,t=="top"&&o!=i&&(e.top=e.top+i-o,a=!0),t=="bottom"||t=="top"?(u=0,e.left<0&&(u=e.left*-2,e.left=0,n.offset(e),s=n[0].offsetWidth,o=n[0].offsetHeight),this.replaceArrow(u-r+s,s,"left")):this.replaceArrow(o-i,o,"top"),a&&n.offset(e)},replaceArrow:function(e,t,n){this.arrow().css(n,e?50*(1-e/t)+"%":"")},setContent:function(){var e=this.tip(),t=this.getTitle();e.find(".tooltip-inner")[this.options.html?"html":"text"](t),e.removeClass("fade in top bottom left right")},hide:function(){function i(){var t=setTimeout(function(){n.off(e.support.transition.end).detach()},500);n.one(e.support.transition.end,function(){clearTimeout(t),n.detach()})}var t=this,n=this.tip(),r=e.Event("hide");this.$element.trigger(r);if(r.isDefaultPrevented())return;return n.removeClass("in"),e.support.transition&&this.$tip.hasClass("fade")?i():n.detach(),this.$element.trigger("hidden"),this},fixTitle:function(){var e=this.$element;(e.attr("title")||typeof e.attr("data-original-title")!="string")&&e.attr("data-original-title",e.attr("title")||"").attr("title","")},hasContent:function(){return this.getTitle()},getPosition:function(){var t=this.$element[0];return e.extend({},typeof t.getBoundingClientRect=="function"?t.getBoundingClientRect():{width:t.offsetWidth,height:t.offsetHeight},this.$element.offset())},getTitle:function(){var e,t=this.$element,n=this.options;return e=t.attr("data-original-title")||(typeof n.title=="function"?n.title.call(t[0]):n.title),e},tip:function(){return this.$tip=this.$tip||e(this.options.template)},arrow:function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},validate:function(){this.$element[0].parentNode||(this.hide(),this.$element=null,this.options=null)},enable:function(){this.enabled=!0},disable:function(){this.enabled=!1},toggleEnabled:function(){this.enabled=!this.enabled},toggle:function(t){var n=t?e(t.currentTarget)[this.type](this._options).data(this.type):this;n.tip().hasClass("in")?n.hide():n.show()},destroy:function(){this.hide().$element.off("."+this.type).removeData(this.type)}};var n=e.fn.tooltip;e.fn.tooltip=function(n){return this.each(function(){var r=e(this),i=r.data("tooltip"),s=typeof n=="object"&&n;i||r.data("tooltip",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.tooltip.Constructor=t,e.fn.tooltip.defaults={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1},e.fn.tooltip.noConflict=function(){return e.fn.tooltip=n,this}}(window.jQuery),!function(e){"use strict";var t=function(e,t){this.init("popover",e,t)};t.prototype=e.extend({},e.fn.tooltip.Constructor.prototype,{constructor:t,setContent:function(){var e=this.tip(),t=this.getTitle(),n=this.getContent();e.find(".popover-title")[this.options.html?"html":"text"](t),e.find(".popover-content")[this.options.html?"html":"text"](n),e.removeClass("fade top bottom left right in")},hasContent:function(){return this.getTitle()||this.getContent()},getContent:function(){var e,t=this.$element,n=this.options;return e=(typeof n.content=="function"?n.content.call(t[0]):n.content)||t.attr("data-content"),e},tip:function(){return this.$tip||(this.$tip=e(this.options.template)),this.$tip},destroy:function(){this.hide().$element.off("."+this.type).removeData(this.type)}});var n=e.fn.popover;e.fn.popover=function(n){return this.each(function(){var r=e(this),i=r.data("popover"),s=typeof n=="object"&&n;i||r.data("popover",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.popover.Constructor=t,e.fn.popover.defaults=e.extend({},e.fn.tooltip.defaults,{placement:"right",trigger:"click",content:"",template:'<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),e.fn.popover.noConflict=function(){return e.fn.popover=n,this}}(window.jQuery),!function(e){"use strict";function t(t,n){var r=e.proxy(this.process,this),i=e(t).is("body")?e(window):e(t),s;this.options=e.extend({},e.fn.scrollspy.defaults,n),this.$scrollElement=i.on("scroll.scroll-spy.data-api",r),this.selector=(this.options.target||(s=e(t).attr("href"))&&s.replace(/.*(?=#[^\s]+$)/,"")||"")+" .nav li > a",this.$body=e("body"),this.refresh(),this.process()}t.prototype={constructor:t,refresh:function(){var t=this,n;this.offsets=e([]),this.targets=e([]),n=this.$body.find(this.selector).map(function(){var n=e(this),r=n.data("target")||n.attr("href"),i=/^#\w/.test(r)&&e(r);return i&&i.length&&[[i.position().top+(!e.isWindow(t.$scrollElement.get(0))&&t.$scrollElement.scrollTop()),r]]||null}).sort(function(e,t){return e[0]-t[0]}).each(function(){t.offsets.push(this[0]),t.targets.push(this[1])})},process:function(){var e=this.$scrollElement.scrollTop()+this.options.offset,t=this.$scrollElement[0].scrollHeight||this.$body[0].scrollHeight,n=t-this.$scrollElement.height(),r=this.offsets,i=this.targets,s=this.activeTarget,o;if(e>=n)return s!=(o=i.last()[0])&&this.activate(o);for(o=r.length;o--;)s!=i[o]&&e>=r[o]&&(!r[o+1]||e<=r[o+1])&&this.activate(i[o])},activate:function(t){var n,r;this.activeTarget=t,e(this.selector).parent(".active").removeClass("active"),r=this.selector+'[data-target="'+t+'"],'+this.selector+'[href="'+t+'"]',n=e(r).parent("li").addClass("active"),n.parent(".dropdown-menu").length&&(n=n.closest("li.dropdown").addClass("active")),n.trigger("activate")}};var n=e.fn.scrollspy;e.fn.scrollspy=function(n){return this.each(function(){var r=e(this),i=r.data("scrollspy"),s=typeof n=="object"&&n;i||r.data("scrollspy",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.scrollspy.Constructor=t,e.fn.scrollspy.defaults={offset:10},e.fn.scrollspy.noConflict=function(){return e.fn.scrollspy=n,this},e(window).on("load",function(){e('[data-spy="scroll"]').each(function(){var t=e(this);t.scrollspy(t.data())})})}(window.jQuery),!function(e){"use strict";var t=function(t){this.element=e(t)};t.prototype={constructor:t,show:function(){var t=this.element,n=t.closest("ul:not(.dropdown-menu)"),r=t.attr("data-target"),i,s,o;r||(r=t.attr("href"),r=r&&r.replace(/.*(?=#[^\s]*$)/,""));if(t.parent("li").hasClass("active"))return;i=n.find(".active:last a")[0],o=e.Event("show",{relatedTarget:i}),t.trigger(o);if(o.isDefaultPrevented())return;s=e(r),this.activate(t.parent("li"),n),this.activate(s,s.parent(),function(){t.trigger({type:"shown",relatedTarget:i})})},activate:function(t,n,r){function o(){i.removeClass("active").find("> .dropdown-menu > .active").removeClass("active"),t.addClass("active"),s?(t[0].offsetWidth,t.addClass("in")):t.removeClass("fade"),t.parent(".dropdown-menu")&&t.closest("li.dropdown").addClass("active"),r&&r()}var i=n.find("> .active"),s=r&&e.support.transition&&i.hasClass("fade");s?i.one(e.support.transition.end,o):o(),i.removeClass("in")}};var n=e.fn.tab;e.fn.tab=function(n){return this.each(function(){var r=e(this),i=r.data("tab");i||r.data("tab",i=new t(this)),typeof n=="string"&&i[n]()})},e.fn.tab.Constructor=t,e.fn.tab.noConflict=function(){return e.fn.tab=n,this},e(document).on("click.tab.data-api",'[data-toggle="tab"], [data-toggle="pill"]',function(t){t.preventDefault(),e(this).tab("show")})}(window.jQuery),!function(e){"use strict";var t=function(t,n){this.$element=e(t),this.options=e.extend({},e.fn.typeahead.defaults,n),this.matcher=this.options.matcher||this.matcher,this.sorter=this.options.sorter||this.sorter,this.highlighter=this.options.highlighter||this.highlighter,this.updater=this.options.updater||this.updater,this.source=this.options.source,this.$menu=e(this.options.menu),this.shown=!1,this.listen()};t.prototype={constructor:t,select:function(){var e=this.$menu.find(".active").attr("data-value");return this.$element.val(this.updater(e)).change(),this.hide()},updater:function(e){return e},show:function(){var t=e.extend({},this.$element.position(),{height:this.$element[0].offsetHeight});return this.$menu.insertAfter(this.$element).css({top:t.top+t.height,left:t.left}).show(),this.shown=!0,this},hide:function(){return this.$menu.hide(),this.shown=!1,this},lookup:function(t){var n;return this.query=this.$element.val(),!this.query||this.query.length<this.options.minLength?this.shown?this.hide():this:(n=e.isFunction(this.source)?this.source(this.query,e.proxy(this.process,this)):this.source,n?this.process(n):this)},process:function(t){var n=this;return t=e.grep(t,function(e){return n.matcher(e)}),t=this.sorter(t),t.length?this.render(t.slice(0,this.options.items)).show():this.shown?this.hide():this},matcher:function(e){return~e.toLowerCase().indexOf(this.query.toLowerCase())},sorter:function(e){var t=[],n=[],r=[],i;while(i=e.shift())i.toLowerCase().indexOf(this.query.toLowerCase())?~i.indexOf(this.query)?n.push(i):r.push(i):t.push(i);return t.concat(n,r)},highlighter:function(e){var t=this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&");return e.replace(new RegExp("("+t+")","ig"),function(e,t){return"<strong>"+t+"</strong>"})},render:function(t){var n=this;return t=e(t).map(function(t,r){return t=e(n.options.item).attr("data-value",r),t.find("a").html(n.highlighter(r)),t[0]}),t.first().addClass("active"),this.$menu.html(t),this},next:function(t){var n=this.$menu.find(".active").removeClass("active"),r=n.next();r.length||(r=e(this.$menu.find("li")[0])),r.addClass("active")},prev:function(e){var t=this.$menu.find(".active").removeClass("active"),n=t.prev();n.length||(n=this.$menu.find("li").last()),n.addClass("active")},listen:function(){this.$element.on("focus",e.proxy(this.focus,this)).on("blur",e.proxy(this.blur,this)).on("keypress",e.proxy(this.keypress,this)).on("keyup",e.proxy(this.keyup,this)),this.eventSupported("keydown")&&this.$element.on("keydown",e.proxy(this.keydown,this)),this.$menu.on("click",e.proxy(this.click,this)).on("mouseenter","li",e.proxy(this.mouseenter,this)).on("mouseleave","li",e.proxy(this.mouseleave,this))},eventSupported:function(e){var t=e in this.$element;return t||(this.$element.setAttribute(e,"return;"),t=typeof this.$element[e]=="function"),t},move:function(e){if(!this.shown)return;switch(e.keyCode){case 9:case 13:case 27:e.preventDefault();break;case 38:e.preventDefault(),this.prev();break;case 40:e.preventDefault(),this.next()}e.stopPropagation()},keydown:function(t){this.suppressKeyPressRepeat=~e.inArray(t.keyCode,[40,38,9,13,27]),this.move(t)},keypress:function(e){if(this.suppressKeyPressRepeat)return;this.move(e)},keyup:function(e){switch(e.keyCode){case 40:case 38:case 16:case 17:case 18:break;case 9:case 13:if(!this.shown)return;this.select();break;case 27:if(!this.shown)return;this.hide();break;default:this.lookup()}e.stopPropagation(),e.preventDefault()},focus:function(e){this.focused=!0},blur:function(e){this.focused=!1,!this.mousedover&&this.shown&&this.hide()},click:function(e){e.stopPropagation(),e.preventDefault(),this.select(),this.$element.focus()},mouseenter:function(t){this.mousedover=!0,this.$menu.find(".active").removeClass("active"),e(t.currentTarget).addClass("active")},mouseleave:function(e){this.mousedover=!1,!this.focused&&this.shown&&this.hide()}};var n=e.fn.typeahead;e.fn.typeahead=function(n){return this.each(function(){var r=e(this),i=r.data("typeahead"),s=typeof n=="object"&&n;i||r.data("typeahead",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.typeahead.defaults={source:[],items:8,menu:'<ul class="typeahead dropdown-menu"></ul>',item:'<li><a href="#"></a></li>',minLength:1},e.fn.typeahead.Constructor=t,e.fn.typeahead.noConflict=function(){return e.fn.typeahead=n,this},e(document).on("focus.typeahead.data-api",'[data-provide="typeahead"]',function(t){var n=e(this);if(n.data("typeahead"))return;n.typeahead(n.data())})}(window.jQuery),!function(e){"use strict";var t=function(t,n){this.options=e.extend({},e.fn.affix.defaults,n),this.$window=e(window).on("scroll.affix.data-api",e.proxy(this.checkPosition,this)).on("click.affix.data-api",e.proxy(function(){setTimeout(e.proxy(this.checkPosition,this),1)},this)),this.$element=e(t),this.checkPosition()};t.prototype.checkPosition=function(){if(!this.$element.is(":visible"))return;var t=e(document).height(),n=this.$window.scrollTop(),r=this.$element.offset(),i=this.options.offset,s=i.bottom,o=i.top,u="affix affix-top affix-bottom",a;typeof i!="object"&&(s=o=i),typeof o=="function"&&(o=i.top()),typeof s=="function"&&(s=i.bottom()),a=this.unpin!=null&&n+this.unpin<=r.top?!1:s!=null&&r.top+this.$element.height()>=t-s?"bottom":o!=null&&n<=o?"top":!1;if(this.affixed===a)return;this.affixed=a,this.unpin=a=="bottom"?r.top-n:null,this.$element.removeClass(u).addClass("affix"+(a?"-"+a:""))};var n=e.fn.affix;e.fn.affix=function(n){return this.each(function(){var r=e(this),i=r.data("affix"),s=typeof n=="object"&&n;i||r.data("affix",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.affix.Constructor=t,e.fn.affix.defaults={offset:0},e.fn.affix.noConflict=function(){return e.fn.affix=n,this},e(window).on("load",function(){e('[data-spy="affix"]').each(function(){var t=e(this),n=t.data();n.offset=n.offset||{},n.offsetBottom&&(n.offset.bottom=n.offsetBottom),n.offsetTop&&(n.offset.top=n.offsetTop),t.affix(n)})})}(window.jQuery);
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
    $('[data-toggle="tooltip"]').tooltip();

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


$(window).load(function(){

    /* Scrollbar Init
    ------------------------------------*/
    // $("#top").find(".submenu .tree").mCustomScrollbar({
    //     axis:"y",
    //     setHeight: 300
    // });
    // if($("#top").find(".c-wrapper").length < 1){
    //    return true;
    // }
    $("#top").find(".c-wrapper").mCustomScrollbar({
        axis:"y",
        setHeight: 700
    });
    // $("#top").find(".cm-wrapper").mCustomScrollbar({
    //     axis:"y",
    //     setHeight: 640
    // });
    // $("#top").find(".view-store .additional-information").mCustomScrollbar({
    //     axis:"y",
    //     setHeight: 65
    // });
    $("#top").find(".funds .fund .title").mCustomScrollbar({
        axis:"y",
        setHeight: 45,
        theme: "dark"
    }); 
    $("#top").find(".autocomplete-suggestions").mCustomScrollbar({
        axis:"y",
        setHeight: 300
    }); 
    // $("#top").find(".comments .current-comment .text .comment").mCustomScrollbar({
    //     axis:"y",
    //     setHeight: 150,
    //     theme: "dark"
    // }); 
    $("#top").find(".categories ul:not(.subcategories)").mCustomScrollbar({
        axis:"y",
        setHeight: 250
    });

    $('[data-toggle="tooltip"]').tooltip({
        delay: {
            show: 500, hide: 2000
        }
    });
    $('[data-toggle="tooltip"]').on('click',function (e) {
        e.preventDefault()
        return false;
    })
});


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
$('.store-reviews__show-less').click(function(e){
    e.preventDefault();
    $('.store-reviews__buttons.more').show();
    $('.store-reviews__buttons.less').hide();
    $('.store-reviews-item.more').hide();
});
$('.store-reviews__show-more').click(function(e){
    e.preventDefault();
    $('.store-reviews__buttons.less').show();
    $('.store-reviews__buttons.more').hide();
    $('.store-reviews-item.more').show();
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
$("a[href='#comment-popup']").popup({
  content : function() {
    var content = this.ele.parentElement.parentElement.cloneNode(true);
    content.setAttribute('data-comment-id', '9999');
    var div = document.createElement('div');
    div.className = 'comments';
    div.append(content);
    $(div).find('.current-comment__more').remove();
    $(div).find('.comment.list').removeClass('list');
    return div;
  },
  width: 500
});
//пройти по комментам, ограничить длину текста, вставить ссылку "показать полностью"
$('.current-comment').each(function(index, element) {
  var text = $(element).find('.text');
  var comment = $(text).find('.comment');
  if (comment[0].innerHTML.length > 210) {
    var a = document.createElement('a');
    a.className = 'current-comment__more';
    a.setAttribute('href', '#comment-popup');
    a.innerHTML = 'Показать полностью';
    text.append(a);
  }
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJldGluYS5qcyIsImpxdWVyeS5mYW5jeWJveC5wYWNrLmpzIiwiYm9vdHN0cmFwLm1pbi5qcyIsInNjcmlwdHMuanMiLCJqcXVlcnkuZmxleHNsaWRlci1taW4uanMiLCJjbGFzc2llLmpzIiwianF1ZXJ5LnBvcHVwLm1pbi5qcyIsImFuaW1vLmpzIiwianF1ZXJ5LndheXBvaW50cy5taW4uanMiLCJqcXVlcnkucGx1Z2luLm1pbi5qcyIsImpxdWVyeS5jb3VudGRvd24ubWluLmpzIiwianF1ZXJ5Lm5vdHkucGFja2FnZWQubWluLmpzIiwianF1ZXJ5Lm1vY2tqYXguanMiLCJqcXVlcnkuYXV0b2NvbXBsZXRlLmpzIiwibWFpbi5qcyIsIm5vdGlmaWNhdGlvbi5qcyIsImZvcl9hbGwuanMiLCJqcXVlcnkuYWpheEZvcm0uanMiLCJteS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUFDQTtBQUNBO0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTEE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMTlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3eEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiBSZXRpbmEuanMgdjEuMy4wXG4gKlxuICogQ29weXJpZ2h0IDIwMTQgSW11bHVzLCBMTENcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICpcbiAqIFJldGluYS5qcyBpcyBhbiBvcGVuIHNvdXJjZSBzY3JpcHQgdGhhdCBtYWtlcyBpdCBlYXN5IHRvIHNlcnZlXG4gKiBoaWdoLXJlc29sdXRpb24gaW1hZ2VzIHRvIGRldmljZXMgd2l0aCByZXRpbmEgZGlzcGxheXMuXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICAgIHZhciByb290ID0gKHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IGV4cG9ydHMpO1xuICAgIHZhciBjb25maWcgPSB7XG4gICAgICAgIC8vIEFuIG9wdGlvbiB0byBjaG9vc2UgYSBzdWZmaXggZm9yIDJ4IGltYWdlc1xuICAgICAgICByZXRpbmFJbWFnZVN1ZmZpeCA6ICdAMngnLFxuXG4gICAgICAgIC8vIEVuc3VyZSBDb250ZW50LVR5cGUgaXMgYW4gaW1hZ2UgYmVmb3JlIHRyeWluZyB0byBsb2FkIEAyeCBpbWFnZVxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vaW11bHVzL3JldGluYWpzL3B1bGwvNDUpXG4gICAgICAgIGNoZWNrX21pbWVfdHlwZTogdHJ1ZSxcblxuICAgICAgICAvLyBSZXNpemUgaGlnaC1yZXNvbHV0aW9uIGltYWdlcyB0byBvcmlnaW5hbCBpbWFnZSdzIHBpeGVsIGRpbWVuc2lvbnNcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2ltdWx1cy9yZXRpbmFqcy9pc3N1ZXMvOFxuICAgICAgICBmb3JjZV9vcmlnaW5hbF9kaW1lbnNpb25zOiB0cnVlXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIFJldGluYSgpIHt9XG5cbiAgICByb290LlJldGluYSA9IFJldGluYTtcblxuICAgIFJldGluYS5jb25maWd1cmUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIGlmIChvcHRpb25zID09PSBudWxsKSB7XG4gICAgICAgICAgICBvcHRpb25zID0ge307XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBwcm9wIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnW3Byb3BdID0gb3B0aW9uc1twcm9wXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBSZXRpbmEuaW5pdCA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICAgICAgaWYgKGNvbnRleHQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnRleHQgPSByb290O1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGV4aXN0aW5nX29ubG9hZCA9IGNvbnRleHQub25sb2FkIHx8IGZ1bmN0aW9uKCl7fTtcblxuICAgICAgICBjb250ZXh0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGltYWdlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbWcnKSwgcmV0aW5hSW1hZ2VzID0gW10sIGksIGltYWdlO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGltYWdlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIGltYWdlID0gaW1hZ2VzW2ldO1xuICAgICAgICAgICAgICAgIGlmICghISFpbWFnZS5nZXRBdHRyaWJ1dGVOb2RlKCdkYXRhLW5vLXJldGluYScpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldGluYUltYWdlcy5wdXNoKG5ldyBSZXRpbmFJbWFnZShpbWFnZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGV4aXN0aW5nX29ubG9hZCgpO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICBSZXRpbmEuaXNSZXRpbmEgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgbWVkaWFRdWVyeSA9ICcoLXdlYmtpdC1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAxLjUpLCAobWluLS1tb3otZGV2aWNlLXBpeGVsLXJhdGlvOiAxLjUpLCAoLW8tbWluLWRldmljZS1waXhlbC1yYXRpbzogMy8yKSwgKG1pbi1yZXNvbHV0aW9uOiAxLjVkcHB4KSc7XG5cbiAgICAgICAgaWYgKHJvb3QuZGV2aWNlUGl4ZWxSYXRpbyA+IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJvb3QubWF0Y2hNZWRpYSAmJiByb290Lm1hdGNoTWVkaWEobWVkaWFRdWVyeSkubWF0Y2hlcykge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuXG4gICAgdmFyIHJlZ2V4TWF0Y2ggPSAvXFwuXFx3KyQvO1xuICAgIGZ1bmN0aW9uIHN1ZmZpeFJlcGxhY2UgKG1hdGNoKSB7XG4gICAgICAgIHJldHVybiBjb25maWcucmV0aW5hSW1hZ2VTdWZmaXggKyBtYXRjaDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBSZXRpbmFJbWFnZVBhdGgocGF0aCwgYXRfMnhfcGF0aCkge1xuICAgICAgICB0aGlzLnBhdGggPSBwYXRoIHx8ICcnO1xuICAgICAgICBpZiAodHlwZW9mIGF0XzJ4X3BhdGggIT09ICd1bmRlZmluZWQnICYmIGF0XzJ4X3BhdGggIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuYXRfMnhfcGF0aCA9IGF0XzJ4X3BhdGg7XG4gICAgICAgICAgICB0aGlzLnBlcmZvcm1fY2hlY2sgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh1bmRlZmluZWQgIT09IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbG9jYXRpb25PYmplY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICAgICAgbG9jYXRpb25PYmplY3QuaHJlZiA9IHRoaXMucGF0aDtcbiAgICAgICAgICAgICAgICBsb2NhdGlvbk9iamVjdC5wYXRobmFtZSA9IGxvY2F0aW9uT2JqZWN0LnBhdGhuYW1lLnJlcGxhY2UocmVnZXhNYXRjaCwgc3VmZml4UmVwbGFjZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5hdF8yeF9wYXRoID0gbG9jYXRpb25PYmplY3QuaHJlZjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhcnRzID0gdGhpcy5wYXRoLnNwbGl0KCc/Jyk7XG4gICAgICAgICAgICAgICAgcGFydHNbMF0gPSBwYXJ0c1swXS5yZXBsYWNlKHJlZ2V4TWF0Y2gsIHN1ZmZpeFJlcGxhY2UpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXRfMnhfcGF0aCA9IHBhcnRzLmpvaW4oJz8nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucGVyZm9ybV9jaGVjayA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByb290LlJldGluYUltYWdlUGF0aCA9IFJldGluYUltYWdlUGF0aDtcblxuICAgIFJldGluYUltYWdlUGF0aC5jb25maXJtZWRfcGF0aHMgPSBbXTtcblxuICAgIFJldGluYUltYWdlUGF0aC5wcm90b3R5cGUuaXNfZXh0ZXJuYWwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICEhKHRoaXMucGF0aC5tYXRjaCgvXmh0dHBzP1xcOi9pKSAmJiAhdGhpcy5wYXRoLm1hdGNoKCcvLycgKyBkb2N1bWVudC5kb21haW4pICk7XG4gICAgfTtcblxuICAgIFJldGluYUltYWdlUGF0aC5wcm90b3R5cGUuY2hlY2tfMnhfdmFyaWFudCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBodHRwLCB0aGF0ID0gdGhpcztcbiAgICAgICAgaWYgKHRoaXMuaXNfZXh0ZXJuYWwoKSkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5wZXJmb3JtX2NoZWNrICYmIHR5cGVvZiB0aGlzLmF0XzJ4X3BhdGggIT09ICd1bmRlZmluZWQnICYmIHRoaXMuYXRfMnhfcGF0aCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHRydWUpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYXRfMnhfcGF0aCBpbiBSZXRpbmFJbWFnZVBhdGguY29uZmlybWVkX3BhdGhzKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sodHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICBodHRwLm9wZW4oJ0hFQUQnLCB0aGlzLmF0XzJ4X3BhdGgpO1xuICAgICAgICAgICAgaHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAoaHR0cC5yZWFkeVN0YXRlICE9PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGh0dHAuc3RhdHVzID49IDIwMCAmJiBodHRwLnN0YXR1cyA8PSAzOTkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZy5jaGVja19taW1lX3R5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0eXBlID0gaHR0cC5nZXRSZXNwb25zZUhlYWRlcignQ29udGVudC1UeXBlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gbnVsbCB8fCAhdHlwZS5tYXRjaCgvXmltYWdlL2kpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIFJldGluYUltYWdlUGF0aC5jb25maXJtZWRfcGF0aHMucHVzaCh0aGF0LmF0XzJ4X3BhdGgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaHR0cC5zZW5kKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICBmdW5jdGlvbiBSZXRpbmFJbWFnZShlbCkge1xuICAgICAgICB0aGlzLmVsID0gZWw7XG4gICAgICAgIHRoaXMucGF0aCA9IG5ldyBSZXRpbmFJbWFnZVBhdGgodGhpcy5lbC5nZXRBdHRyaWJ1dGUoJ3NyYycpLCB0aGlzLmVsLmdldEF0dHJpYnV0ZSgnZGF0YS1hdDJ4JykpO1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIHRoaXMucGF0aC5jaGVja18yeF92YXJpYW50KGZ1bmN0aW9uKGhhc1ZhcmlhbnQpIHtcbiAgICAgICAgICAgIGlmIChoYXNWYXJpYW50KSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zd2FwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJvb3QuUmV0aW5hSW1hZ2UgPSBSZXRpbmFJbWFnZTtcblxuICAgIFJldGluYUltYWdlLnByb3RvdHlwZS5zd2FwID0gZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICBpZiAodHlwZW9mIHBhdGggPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBwYXRoID0gdGhpcy5wYXRoLmF0XzJ4X3BhdGg7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIGZ1bmN0aW9uIGxvYWQoKSB7XG4gICAgICAgICAgICBpZiAoISB0aGF0LmVsLmNvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChsb2FkLCA1KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbmZpZy5mb3JjZV9vcmlnaW5hbF9kaW1lbnNpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZWwuc2V0QXR0cmlidXRlKCd3aWR0aCcsIHRoYXQuZWwub2Zmc2V0V2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmVsLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgdGhhdC5lbC5vZmZzZXRIZWlnaHQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoYXQuZWwuc2V0QXR0cmlidXRlKCdzcmMnLCBwYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsb2FkKCk7XG4gICAgfTtcblxuXG4gICAgaWYgKFJldGluYS5pc1JldGluYSgpKSB7XG4gICAgICAgIFJldGluYS5pbml0KHJvb3QpO1xuICAgIH1cbn0pKCk7XG4iLCIvKiEgZmFuY3lCb3ggdjIuMS41IGZhbmN5YXBwcy5jb20gfCBmYW5jeWFwcHMuY29tL2ZhbmN5Ym94LyNsaWNlbnNlICovXG4oZnVuY3Rpb24ocixHLGYsdil7dmFyIEo9ZihcImh0bWxcIiksbj1mKHIpLHA9ZihHKSxiPWYuZmFuY3lib3g9ZnVuY3Rpb24oKXtiLm9wZW4uYXBwbHkodGhpcyxhcmd1bWVudHMpfSxJPW5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL21zaWUvaSksQj1udWxsLHM9Ry5jcmVhdGVUb3VjaCE9PXYsdD1mdW5jdGlvbihhKXtyZXR1cm4gYSYmYS5oYXNPd25Qcm9wZXJ0eSYmYSBpbnN0YW5jZW9mIGZ9LHE9ZnVuY3Rpb24oYSl7cmV0dXJuIGEmJlwic3RyaW5nXCI9PT1mLnR5cGUoYSl9LEU9ZnVuY3Rpb24oYSl7cmV0dXJuIHEoYSkmJjA8YS5pbmRleE9mKFwiJVwiKX0sbD1mdW5jdGlvbihhLGQpe3ZhciBlPXBhcnNlSW50KGEsMTApfHwwO2QmJkUoYSkmJihlKj1iLmdldFZpZXdwb3J0KClbZF0vMTAwKTtyZXR1cm4gTWF0aC5jZWlsKGUpfSx3PWZ1bmN0aW9uKGEsYil7cmV0dXJuIGwoYSxiKStcInB4XCJ9O2YuZXh0ZW5kKGIse3ZlcnNpb246XCIyLjEuNVwiLGRlZmF1bHRzOntwYWRkaW5nOjE1LG1hcmdpbjoyMCxcbndpZHRoOjgwMCxoZWlnaHQ6NjAwLG1pbldpZHRoOjEwMCxtaW5IZWlnaHQ6MTAwLG1heFdpZHRoOjk5OTksbWF4SGVpZ2h0Ojk5OTkscGl4ZWxSYXRpbzoxLGF1dG9TaXplOiEwLGF1dG9IZWlnaHQ6ITEsYXV0b1dpZHRoOiExLGF1dG9SZXNpemU6ITAsYXV0b0NlbnRlcjohcyxmaXRUb1ZpZXc6ITAsYXNwZWN0UmF0aW86ITEsdG9wUmF0aW86MC41LGxlZnRSYXRpbzowLjUsc2Nyb2xsaW5nOlwiYXV0b1wiLHdyYXBDU1M6XCJcIixhcnJvd3M6ITAsY2xvc2VCdG46ITAsY2xvc2VDbGljazohMSxuZXh0Q2xpY2s6ITEsbW91c2VXaGVlbDohMCxhdXRvUGxheTohMSxwbGF5U3BlZWQ6M0UzLHByZWxvYWQ6Myxtb2RhbDohMSxsb29wOiEwLGFqYXg6e2RhdGFUeXBlOlwiaHRtbFwiLGhlYWRlcnM6e1wiWC1mYW5jeUJveFwiOiEwfX0saWZyYW1lOntzY3JvbGxpbmc6XCJhdXRvXCIscHJlbG9hZDohMH0sc3dmOnt3bW9kZTpcInRyYW5zcGFyZW50XCIsYWxsb3dmdWxsc2NyZWVuOlwidHJ1ZVwiLGFsbG93c2NyaXB0YWNjZXNzOlwiYWx3YXlzXCJ9LFxua2V5czp7bmV4dDp7MTM6XCJsZWZ0XCIsMzQ6XCJ1cFwiLDM5OlwibGVmdFwiLDQwOlwidXBcIn0scHJldjp7ODpcInJpZ2h0XCIsMzM6XCJkb3duXCIsMzc6XCJyaWdodFwiLDM4OlwiZG93blwifSxjbG9zZTpbMjddLHBsYXk6WzMyXSx0b2dnbGU6WzcwXX0sZGlyZWN0aW9uOntuZXh0OlwibGVmdFwiLHByZXY6XCJyaWdodFwifSxzY3JvbGxPdXRzaWRlOiEwLGluZGV4OjAsdHlwZTpudWxsLGhyZWY6bnVsbCxjb250ZW50Om51bGwsdGl0bGU6bnVsbCx0cGw6e3dyYXA6JzxkaXYgY2xhc3M9XCJmYW5jeWJveC13cmFwXCIgdGFiSW5kZXg9XCItMVwiPjxkaXYgY2xhc3M9XCJmYW5jeWJveC1za2luXCI+PGRpdiBjbGFzcz1cImZhbmN5Ym94LW91dGVyXCI+PGRpdiBjbGFzcz1cImZhbmN5Ym94LWlubmVyXCI+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+JyxpbWFnZTonPGltZyBjbGFzcz1cImZhbmN5Ym94LWltYWdlXCIgc3JjPVwie2hyZWZ9XCIgYWx0PVwiXCIgLz4nLGlmcmFtZTonPGlmcmFtZSBpZD1cImZhbmN5Ym94LWZyYW1le3JuZH1cIiBuYW1lPVwiZmFuY3lib3gtZnJhbWV7cm5kfVwiIGNsYXNzPVwiZmFuY3lib3gtaWZyYW1lXCIgZnJhbWVib3JkZXI9XCIwXCIgdnNwYWNlPVwiMFwiIGhzcGFjZT1cIjBcIiB3ZWJraXRBbGxvd0Z1bGxTY3JlZW4gbW96YWxsb3dmdWxsc2NyZWVuIGFsbG93RnVsbFNjcmVlbicrXG4oST8nIGFsbG93dHJhbnNwYXJlbmN5PVwidHJ1ZVwiJzpcIlwiKStcIj48L2lmcmFtZT5cIixlcnJvcjonPHAgY2xhc3M9XCJmYW5jeWJveC1lcnJvclwiPlRoZSByZXF1ZXN0ZWQgY29udGVudCBjYW5ub3QgYmUgbG9hZGVkLjxici8+UGxlYXNlIHRyeSBhZ2FpbiBsYXRlci48L3A+JyxjbG9zZUJ0bjonPGEgdGl0bGU9XCJDbG9zZVwiIGNsYXNzPVwiZmFuY3lib3gtaXRlbSBmYW5jeWJveC1jbG9zZVwiIGhyZWY9XCJqYXZhc2NyaXB0OjtcIj48L2E+JyxuZXh0Oic8YSB0aXRsZT1cIk5leHRcIiBjbGFzcz1cImZhbmN5Ym94LW5hdiBmYW5jeWJveC1uZXh0XCIgaHJlZj1cImphdmFzY3JpcHQ6O1wiPjxzcGFuPjwvc3Bhbj48L2E+JyxwcmV2Oic8YSB0aXRsZT1cIlByZXZpb3VzXCIgY2xhc3M9XCJmYW5jeWJveC1uYXYgZmFuY3lib3gtcHJldlwiIGhyZWY9XCJqYXZhc2NyaXB0OjtcIj48c3Bhbj48L3NwYW4+PC9hPid9LG9wZW5FZmZlY3Q6XCJmYWRlXCIsb3BlblNwZWVkOjI1MCxvcGVuRWFzaW5nOlwic3dpbmdcIixvcGVuT3BhY2l0eTohMCxcbm9wZW5NZXRob2Q6XCJ6b29tSW5cIixjbG9zZUVmZmVjdDpcImZhZGVcIixjbG9zZVNwZWVkOjI1MCxjbG9zZUVhc2luZzpcInN3aW5nXCIsY2xvc2VPcGFjaXR5OiEwLGNsb3NlTWV0aG9kOlwiem9vbU91dFwiLG5leHRFZmZlY3Q6XCJlbGFzdGljXCIsbmV4dFNwZWVkOjI1MCxuZXh0RWFzaW5nOlwic3dpbmdcIixuZXh0TWV0aG9kOlwiY2hhbmdlSW5cIixwcmV2RWZmZWN0OlwiZWxhc3RpY1wiLHByZXZTcGVlZDoyNTAscHJldkVhc2luZzpcInN3aW5nXCIscHJldk1ldGhvZDpcImNoYW5nZU91dFwiLGhlbHBlcnM6e292ZXJsYXk6ITAsdGl0bGU6ITB9LG9uQ2FuY2VsOmYubm9vcCxiZWZvcmVMb2FkOmYubm9vcCxhZnRlckxvYWQ6Zi5ub29wLGJlZm9yZVNob3c6Zi5ub29wLGFmdGVyU2hvdzpmLm5vb3AsYmVmb3JlQ2hhbmdlOmYubm9vcCxiZWZvcmVDbG9zZTpmLm5vb3AsYWZ0ZXJDbG9zZTpmLm5vb3B9LGdyb3VwOnt9LG9wdHM6e30scHJldmlvdXM6bnVsbCxjb21pbmc6bnVsbCxjdXJyZW50Om51bGwsaXNBY3RpdmU6ITEsXG5pc09wZW46ITEsaXNPcGVuZWQ6ITEsd3JhcDpudWxsLHNraW46bnVsbCxvdXRlcjpudWxsLGlubmVyOm51bGwscGxheWVyOnt0aW1lcjpudWxsLGlzQWN0aXZlOiExfSxhamF4TG9hZDpudWxsLGltZ1ByZWxvYWQ6bnVsbCx0cmFuc2l0aW9uczp7fSxoZWxwZXJzOnt9LG9wZW46ZnVuY3Rpb24oYSxkKXtpZihhJiYoZi5pc1BsYWluT2JqZWN0KGQpfHwoZD17fSksITEhPT1iLmNsb3NlKCEwKSkpcmV0dXJuIGYuaXNBcnJheShhKXx8KGE9dChhKT9mKGEpLmdldCgpOlthXSksZi5lYWNoKGEsZnVuY3Rpb24oZSxjKXt2YXIgaz17fSxnLGgsaixtLGw7XCJvYmplY3RcIj09PWYudHlwZShjKSYmKGMubm9kZVR5cGUmJihjPWYoYykpLHQoYyk/KGs9e2hyZWY6Yy5kYXRhKFwiZmFuY3lib3gtaHJlZlwiKXx8Yy5hdHRyKFwiaHJlZlwiKSx0aXRsZTpjLmRhdGEoXCJmYW5jeWJveC10aXRsZVwiKXx8Yy5hdHRyKFwidGl0bGVcIiksaXNEb206ITAsZWxlbWVudDpjfSxmLm1ldGFkYXRhJiZmLmV4dGVuZCghMCxrLFxuYy5tZXRhZGF0YSgpKSk6az1jKTtnPWQuaHJlZnx8ay5ocmVmfHwocShjKT9jOm51bGwpO2g9ZC50aXRsZSE9PXY/ZC50aXRsZTprLnRpdGxlfHxcIlwiO209KGo9ZC5jb250ZW50fHxrLmNvbnRlbnQpP1wiaHRtbFwiOmQudHlwZXx8ay50eXBlOyFtJiZrLmlzRG9tJiYobT1jLmRhdGEoXCJmYW5jeWJveC10eXBlXCIpLG18fChtPShtPWMucHJvcChcImNsYXNzXCIpLm1hdGNoKC9mYW5jeWJveFxcLihcXHcrKS8pKT9tWzFdOm51bGwpKTtxKGcpJiYobXx8KGIuaXNJbWFnZShnKT9tPVwiaW1hZ2VcIjpiLmlzU1dGKGcpP209XCJzd2ZcIjpcIiNcIj09PWcuY2hhckF0KDApP209XCJpbmxpbmVcIjpxKGMpJiYobT1cImh0bWxcIixqPWMpKSxcImFqYXhcIj09PW0mJihsPWcuc3BsaXQoL1xccysvLDIpLGc9bC5zaGlmdCgpLGw9bC5zaGlmdCgpKSk7anx8KFwiaW5saW5lXCI9PT1tP2c/aj1mKHEoZyk/Zy5yZXBsYWNlKC8uKig/PSNbXlxcc10rJCkvLFwiXCIpOmcpOmsuaXNEb20mJihqPWMpOlwiaHRtbFwiPT09bT9qPWc6IW0mJighZyYmXG5rLmlzRG9tKSYmKG09XCJpbmxpbmVcIixqPWMpKTtmLmV4dGVuZChrLHtocmVmOmcsdHlwZTptLGNvbnRlbnQ6aix0aXRsZTpoLHNlbGVjdG9yOmx9KTthW2VdPWt9KSxiLm9wdHM9Zi5leHRlbmQoITAse30sYi5kZWZhdWx0cyxkKSxkLmtleXMhPT12JiYoYi5vcHRzLmtleXM9ZC5rZXlzP2YuZXh0ZW5kKHt9LGIuZGVmYXVsdHMua2V5cyxkLmtleXMpOiExKSxiLmdyb3VwPWEsYi5fc3RhcnQoYi5vcHRzLmluZGV4KX0sY2FuY2VsOmZ1bmN0aW9uKCl7dmFyIGE9Yi5jb21pbmc7YSYmITEhPT1iLnRyaWdnZXIoXCJvbkNhbmNlbFwiKSYmKGIuaGlkZUxvYWRpbmcoKSxiLmFqYXhMb2FkJiZiLmFqYXhMb2FkLmFib3J0KCksYi5hamF4TG9hZD1udWxsLGIuaW1nUHJlbG9hZCYmKGIuaW1nUHJlbG9hZC5vbmxvYWQ9Yi5pbWdQcmVsb2FkLm9uZXJyb3I9bnVsbCksYS53cmFwJiZhLndyYXAuc3RvcCghMCwhMCkudHJpZ2dlcihcIm9uUmVzZXRcIikucmVtb3ZlKCksYi5jb21pbmc9bnVsbCxiLmN1cnJlbnR8fFxuYi5fYWZ0ZXJab29tT3V0KGEpKX0sY2xvc2U6ZnVuY3Rpb24oYSl7Yi5jYW5jZWwoKTshMSE9PWIudHJpZ2dlcihcImJlZm9yZUNsb3NlXCIpJiYoYi51bmJpbmRFdmVudHMoKSxiLmlzQWN0aXZlJiYoIWIuaXNPcGVufHwhMD09PWE/KGYoXCIuZmFuY3lib3gtd3JhcFwiKS5zdG9wKCEwKS50cmlnZ2VyKFwib25SZXNldFwiKS5yZW1vdmUoKSxiLl9hZnRlclpvb21PdXQoKSk6KGIuaXNPcGVuPWIuaXNPcGVuZWQ9ITEsYi5pc0Nsb3Npbmc9ITAsZihcIi5mYW5jeWJveC1pdGVtLCAuZmFuY3lib3gtbmF2XCIpLnJlbW92ZSgpLGIud3JhcC5zdG9wKCEwLCEwKS5yZW1vdmVDbGFzcyhcImZhbmN5Ym94LW9wZW5lZFwiKSxiLnRyYW5zaXRpb25zW2IuY3VycmVudC5jbG9zZU1ldGhvZF0oKSkpKX0scGxheTpmdW5jdGlvbihhKXt2YXIgZD1mdW5jdGlvbigpe2NsZWFyVGltZW91dChiLnBsYXllci50aW1lcil9LGU9ZnVuY3Rpb24oKXtkKCk7Yi5jdXJyZW50JiZiLnBsYXllci5pc0FjdGl2ZSYmKGIucGxheWVyLnRpbWVyPVxuc2V0VGltZW91dChiLm5leHQsYi5jdXJyZW50LnBsYXlTcGVlZCkpfSxjPWZ1bmN0aW9uKCl7ZCgpO3AudW5iaW5kKFwiLnBsYXllclwiKTtiLnBsYXllci5pc0FjdGl2ZT0hMTtiLnRyaWdnZXIoXCJvblBsYXlFbmRcIil9O2lmKCEwPT09YXx8IWIucGxheWVyLmlzQWN0aXZlJiYhMSE9PWEpe2lmKGIuY3VycmVudCYmKGIuY3VycmVudC5sb29wfHxiLmN1cnJlbnQuaW5kZXg8Yi5ncm91cC5sZW5ndGgtMSkpYi5wbGF5ZXIuaXNBY3RpdmU9ITAscC5iaW5kKHtcIm9uQ2FuY2VsLnBsYXllciBiZWZvcmVDbG9zZS5wbGF5ZXJcIjpjLFwib25VcGRhdGUucGxheWVyXCI6ZSxcImJlZm9yZUxvYWQucGxheWVyXCI6ZH0pLGUoKSxiLnRyaWdnZXIoXCJvblBsYXlTdGFydFwiKX1lbHNlIGMoKX0sbmV4dDpmdW5jdGlvbihhKXt2YXIgZD1iLmN1cnJlbnQ7ZCYmKHEoYSl8fChhPWQuZGlyZWN0aW9uLm5leHQpLGIuanVtcHRvKGQuaW5kZXgrMSxhLFwibmV4dFwiKSl9LHByZXY6ZnVuY3Rpb24oYSl7dmFyIGQ9Yi5jdXJyZW50O1xuZCYmKHEoYSl8fChhPWQuZGlyZWN0aW9uLnByZXYpLGIuanVtcHRvKGQuaW5kZXgtMSxhLFwicHJldlwiKSl9LGp1bXB0bzpmdW5jdGlvbihhLGQsZSl7dmFyIGM9Yi5jdXJyZW50O2MmJihhPWwoYSksYi5kaXJlY3Rpb249ZHx8Yy5kaXJlY3Rpb25bYT49Yy5pbmRleD9cIm5leHRcIjpcInByZXZcIl0sYi5yb3V0ZXI9ZXx8XCJqdW1wdG9cIixjLmxvb3AmJigwPmEmJihhPWMuZ3JvdXAubGVuZ3RoK2ElYy5ncm91cC5sZW5ndGgpLGElPWMuZ3JvdXAubGVuZ3RoKSxjLmdyb3VwW2FdIT09diYmKGIuY2FuY2VsKCksYi5fc3RhcnQoYSkpKX0scmVwb3NpdGlvbjpmdW5jdGlvbihhLGQpe3ZhciBlPWIuY3VycmVudCxjPWU/ZS53cmFwOm51bGwsaztjJiYoaz1iLl9nZXRQb3NpdGlvbihkKSxhJiZcInNjcm9sbFwiPT09YS50eXBlPyhkZWxldGUgay5wb3NpdGlvbixjLnN0b3AoITAsITApLmFuaW1hdGUoaywyMDApKTooYy5jc3MoayksZS5wb3M9Zi5leHRlbmQoe30sZS5kaW0saykpKX0sdXBkYXRlOmZ1bmN0aW9uKGEpe3ZhciBkPVxuYSYmYS50eXBlLGU9IWR8fFwib3JpZW50YXRpb25jaGFuZ2VcIj09PWQ7ZSYmKGNsZWFyVGltZW91dChCKSxCPW51bGwpO2IuaXNPcGVuJiYhQiYmKEI9c2V0VGltZW91dChmdW5jdGlvbigpe3ZhciBjPWIuY3VycmVudDtjJiYhYi5pc0Nsb3NpbmcmJihiLndyYXAucmVtb3ZlQ2xhc3MoXCJmYW5jeWJveC10bXBcIiksKGV8fFwibG9hZFwiPT09ZHx8XCJyZXNpemVcIj09PWQmJmMuYXV0b1Jlc2l6ZSkmJmIuX3NldERpbWVuc2lvbigpLFwic2Nyb2xsXCI9PT1kJiZjLmNhblNocmlua3x8Yi5yZXBvc2l0aW9uKGEpLGIudHJpZ2dlcihcIm9uVXBkYXRlXCIpLEI9bnVsbCl9LGUmJiFzPzA6MzAwKSl9LHRvZ2dsZTpmdW5jdGlvbihhKXtiLmlzT3BlbiYmKGIuY3VycmVudC5maXRUb1ZpZXc9XCJib29sZWFuXCI9PT1mLnR5cGUoYSk/YTohYi5jdXJyZW50LmZpdFRvVmlldyxzJiYoYi53cmFwLnJlbW92ZUF0dHIoXCJzdHlsZVwiKS5hZGRDbGFzcyhcImZhbmN5Ym94LXRtcFwiKSxiLnRyaWdnZXIoXCJvblVwZGF0ZVwiKSksXG5iLnVwZGF0ZSgpKX0saGlkZUxvYWRpbmc6ZnVuY3Rpb24oKXtwLnVuYmluZChcIi5sb2FkaW5nXCIpO2YoXCIjZmFuY3lib3gtbG9hZGluZ1wiKS5yZW1vdmUoKX0sc2hvd0xvYWRpbmc6ZnVuY3Rpb24oKXt2YXIgYSxkO2IuaGlkZUxvYWRpbmcoKTthPWYoJzxkaXYgaWQ9XCJmYW5jeWJveC1sb2FkaW5nXCI+PGRpdj48L2Rpdj48L2Rpdj4nKS5jbGljayhiLmNhbmNlbCkuYXBwZW5kVG8oXCJib2R5XCIpO3AuYmluZChcImtleWRvd24ubG9hZGluZ1wiLGZ1bmN0aW9uKGEpe2lmKDI3PT09KGEud2hpY2h8fGEua2V5Q29kZSkpYS5wcmV2ZW50RGVmYXVsdCgpLGIuY2FuY2VsKCl9KTtiLmRlZmF1bHRzLmZpeGVkfHwoZD1iLmdldFZpZXdwb3J0KCksYS5jc3Moe3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6MC41KmQuaCtkLnksbGVmdDowLjUqZC53K2QueH0pKX0sZ2V0Vmlld3BvcnQ6ZnVuY3Rpb24oKXt2YXIgYT1iLmN1cnJlbnQmJmIuY3VycmVudC5sb2NrZWR8fCExLGQ9e3g6bi5zY3JvbGxMZWZ0KCksXG55Om4uc2Nyb2xsVG9wKCl9O2E/KGQudz1hWzBdLmNsaWVudFdpZHRoLGQuaD1hWzBdLmNsaWVudEhlaWdodCk6KGQudz1zJiZyLmlubmVyV2lkdGg/ci5pbm5lcldpZHRoOm4ud2lkdGgoKSxkLmg9cyYmci5pbm5lckhlaWdodD9yLmlubmVySGVpZ2h0Om4uaGVpZ2h0KCkpO3JldHVybiBkfSx1bmJpbmRFdmVudHM6ZnVuY3Rpb24oKXtiLndyYXAmJnQoYi53cmFwKSYmYi53cmFwLnVuYmluZChcIi5mYlwiKTtwLnVuYmluZChcIi5mYlwiKTtuLnVuYmluZChcIi5mYlwiKX0sYmluZEV2ZW50czpmdW5jdGlvbigpe3ZhciBhPWIuY3VycmVudCxkO2EmJihuLmJpbmQoXCJvcmllbnRhdGlvbmNoYW5nZS5mYlwiKyhzP1wiXCI6XCIgcmVzaXplLmZiXCIpKyhhLmF1dG9DZW50ZXImJiFhLmxvY2tlZD9cIiBzY3JvbGwuZmJcIjpcIlwiKSxiLnVwZGF0ZSksKGQ9YS5rZXlzKSYmcC5iaW5kKFwia2V5ZG93bi5mYlwiLGZ1bmN0aW9uKGUpe3ZhciBjPWUud2hpY2h8fGUua2V5Q29kZSxrPWUudGFyZ2V0fHxlLnNyY0VsZW1lbnQ7XG5pZigyNz09PWMmJmIuY29taW5nKXJldHVybiExOyFlLmN0cmxLZXkmJighZS5hbHRLZXkmJiFlLnNoaWZ0S2V5JiYhZS5tZXRhS2V5JiYoIWt8fCFrLnR5cGUmJiFmKGspLmlzKFwiW2NvbnRlbnRlZGl0YWJsZV1cIikpKSYmZi5lYWNoKGQsZnVuY3Rpb24oZCxrKXtpZigxPGEuZ3JvdXAubGVuZ3RoJiZrW2NdIT09dilyZXR1cm4gYltkXShrW2NdKSxlLnByZXZlbnREZWZhdWx0KCksITE7aWYoLTE8Zi5pbkFycmF5KGMsaykpcmV0dXJuIGJbZF0oKSxlLnByZXZlbnREZWZhdWx0KCksITF9KX0pLGYuZm4ubW91c2V3aGVlbCYmYS5tb3VzZVdoZWVsJiZiLndyYXAuYmluZChcIm1vdXNld2hlZWwuZmJcIixmdW5jdGlvbihkLGMsayxnKXtmb3IodmFyIGg9ZihkLnRhcmdldHx8bnVsbCksaj0hMTtoLmxlbmd0aCYmIWomJiFoLmlzKFwiLmZhbmN5Ym94LXNraW5cIikmJiFoLmlzKFwiLmZhbmN5Ym94LXdyYXBcIik7KWo9aFswXSYmIShoWzBdLnN0eWxlLm92ZXJmbG93JiZcImhpZGRlblwiPT09aFswXS5zdHlsZS5vdmVyZmxvdykmJlxuKGhbMF0uY2xpZW50V2lkdGgmJmhbMF0uc2Nyb2xsV2lkdGg+aFswXS5jbGllbnRXaWR0aHx8aFswXS5jbGllbnRIZWlnaHQmJmhbMF0uc2Nyb2xsSGVpZ2h0PmhbMF0uY2xpZW50SGVpZ2h0KSxoPWYoaCkucGFyZW50KCk7aWYoMCE9PWMmJiFqJiYxPGIuZ3JvdXAubGVuZ3RoJiYhYS5jYW5TaHJpbmspe2lmKDA8Z3x8MDxrKWIucHJldigwPGc/XCJkb3duXCI6XCJsZWZ0XCIpO2Vsc2UgaWYoMD5nfHwwPmspYi5uZXh0KDA+Zz9cInVwXCI6XCJyaWdodFwiKTtkLnByZXZlbnREZWZhdWx0KCl9fSkpfSx0cmlnZ2VyOmZ1bmN0aW9uKGEsZCl7dmFyIGUsYz1kfHxiLmNvbWluZ3x8Yi5jdXJyZW50O2lmKGMpe2YuaXNGdW5jdGlvbihjW2FdKSYmKGU9Y1thXS5hcHBseShjLEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywxKSkpO2lmKCExPT09ZSlyZXR1cm4hMTtjLmhlbHBlcnMmJmYuZWFjaChjLmhlbHBlcnMsZnVuY3Rpb24oZCxlKXtpZihlJiZiLmhlbHBlcnNbZF0mJmYuaXNGdW5jdGlvbihiLmhlbHBlcnNbZF1bYV0pKWIuaGVscGVyc1tkXVthXShmLmV4dGVuZCghMCxcbnt9LGIuaGVscGVyc1tkXS5kZWZhdWx0cyxlKSxjKX0pO3AudHJpZ2dlcihhKX19LGlzSW1hZ2U6ZnVuY3Rpb24oYSl7cmV0dXJuIHEoYSkmJmEubWF0Y2goLyheZGF0YTppbWFnZVxcLy4qLCl8KFxcLihqcChlfGd8ZWcpfGdpZnxwbmd8Ym1wfHdlYnB8c3ZnKSgoXFw/fCMpLiopPyQpL2kpfSxpc1NXRjpmdW5jdGlvbihhKXtyZXR1cm4gcShhKSYmYS5tYXRjaCgvXFwuKHN3ZikoKFxcP3wjKS4qKT8kL2kpfSxfc3RhcnQ6ZnVuY3Rpb24oYSl7dmFyIGQ9e30sZSxjO2E9bChhKTtlPWIuZ3JvdXBbYV18fG51bGw7aWYoIWUpcmV0dXJuITE7ZD1mLmV4dGVuZCghMCx7fSxiLm9wdHMsZSk7ZT1kLm1hcmdpbjtjPWQucGFkZGluZztcIm51bWJlclwiPT09Zi50eXBlKGUpJiYoZC5tYXJnaW49W2UsZSxlLGVdKTtcIm51bWJlclwiPT09Zi50eXBlKGMpJiYoZC5wYWRkaW5nPVtjLGMsYyxjXSk7ZC5tb2RhbCYmZi5leHRlbmQoITAsZCx7Y2xvc2VCdG46ITEsY2xvc2VDbGljazohMSxuZXh0Q2xpY2s6ITEsYXJyb3dzOiExLFxubW91c2VXaGVlbDohMSxrZXlzOm51bGwsaGVscGVyczp7b3ZlcmxheTp7Y2xvc2VDbGljazohMX19fSk7ZC5hdXRvU2l6ZSYmKGQuYXV0b1dpZHRoPWQuYXV0b0hlaWdodD0hMCk7XCJhdXRvXCI9PT1kLndpZHRoJiYoZC5hdXRvV2lkdGg9ITApO1wiYXV0b1wiPT09ZC5oZWlnaHQmJihkLmF1dG9IZWlnaHQ9ITApO2QuZ3JvdXA9Yi5ncm91cDtkLmluZGV4PWE7Yi5jb21pbmc9ZDtpZighMT09PWIudHJpZ2dlcihcImJlZm9yZUxvYWRcIikpYi5jb21pbmc9bnVsbDtlbHNle2M9ZC50eXBlO2U9ZC5ocmVmO2lmKCFjKXJldHVybiBiLmNvbWluZz1udWxsLGIuY3VycmVudCYmYi5yb3V0ZXImJlwianVtcHRvXCIhPT1iLnJvdXRlcj8oYi5jdXJyZW50LmluZGV4PWEsYltiLnJvdXRlcl0oYi5kaXJlY3Rpb24pKTohMTtiLmlzQWN0aXZlPSEwO2lmKFwiaW1hZ2VcIj09PWN8fFwic3dmXCI9PT1jKWQuYXV0b0hlaWdodD1kLmF1dG9XaWR0aD0hMSxkLnNjcm9sbGluZz1cInZpc2libGVcIjtcImltYWdlXCI9PT1jJiYoZC5hc3BlY3RSYXRpbz1cbiEwKTtcImlmcmFtZVwiPT09YyYmcyYmKGQuc2Nyb2xsaW5nPVwic2Nyb2xsXCIpO2Qud3JhcD1mKGQudHBsLndyYXApLmFkZENsYXNzKFwiZmFuY3lib3gtXCIrKHM/XCJtb2JpbGVcIjpcImRlc2t0b3BcIikrXCIgZmFuY3lib3gtdHlwZS1cIitjK1wiIGZhbmN5Ym94LXRtcCBcIitkLndyYXBDU1MpLmFwcGVuZFRvKGQucGFyZW50fHxcImJvZHlcIik7Zi5leHRlbmQoZCx7c2tpbjpmKFwiLmZhbmN5Ym94LXNraW5cIixkLndyYXApLG91dGVyOmYoXCIuZmFuY3lib3gtb3V0ZXJcIixkLndyYXApLGlubmVyOmYoXCIuZmFuY3lib3gtaW5uZXJcIixkLndyYXApfSk7Zi5lYWNoKFtcIlRvcFwiLFwiUmlnaHRcIixcIkJvdHRvbVwiLFwiTGVmdFwiXSxmdW5jdGlvbihhLGIpe2Quc2tpbi5jc3MoXCJwYWRkaW5nXCIrYix3KGQucGFkZGluZ1thXSkpfSk7Yi50cmlnZ2VyKFwib25SZWFkeVwiKTtpZihcImlubGluZVwiPT09Y3x8XCJodG1sXCI9PT1jKXtpZighZC5jb250ZW50fHwhZC5jb250ZW50Lmxlbmd0aClyZXR1cm4gYi5fZXJyb3IoXCJjb250ZW50XCIpfWVsc2UgaWYoIWUpcmV0dXJuIGIuX2Vycm9yKFwiaHJlZlwiKTtcblwiaW1hZ2VcIj09PWM/Yi5fbG9hZEltYWdlKCk6XCJhamF4XCI9PT1jP2IuX2xvYWRBamF4KCk6XCJpZnJhbWVcIj09PWM/Yi5fbG9hZElmcmFtZSgpOmIuX2FmdGVyTG9hZCgpfX0sX2Vycm9yOmZ1bmN0aW9uKGEpe2YuZXh0ZW5kKGIuY29taW5nLHt0eXBlOlwiaHRtbFwiLGF1dG9XaWR0aDohMCxhdXRvSGVpZ2h0OiEwLG1pbldpZHRoOjAsbWluSGVpZ2h0OjAsc2Nyb2xsaW5nOlwibm9cIixoYXNFcnJvcjphLGNvbnRlbnQ6Yi5jb21pbmcudHBsLmVycm9yfSk7Yi5fYWZ0ZXJMb2FkKCl9LF9sb2FkSW1hZ2U6ZnVuY3Rpb24oKXt2YXIgYT1iLmltZ1ByZWxvYWQ9bmV3IEltYWdlO2Eub25sb2FkPWZ1bmN0aW9uKCl7dGhpcy5vbmxvYWQ9dGhpcy5vbmVycm9yPW51bGw7Yi5jb21pbmcud2lkdGg9dGhpcy53aWR0aC9iLm9wdHMucGl4ZWxSYXRpbztiLmNvbWluZy5oZWlnaHQ9dGhpcy5oZWlnaHQvYi5vcHRzLnBpeGVsUmF0aW87Yi5fYWZ0ZXJMb2FkKCl9O2Eub25lcnJvcj1mdW5jdGlvbigpe3RoaXMub25sb2FkPVxudGhpcy5vbmVycm9yPW51bGw7Yi5fZXJyb3IoXCJpbWFnZVwiKX07YS5zcmM9Yi5jb21pbmcuaHJlZjshMCE9PWEuY29tcGxldGUmJmIuc2hvd0xvYWRpbmcoKX0sX2xvYWRBamF4OmZ1bmN0aW9uKCl7dmFyIGE9Yi5jb21pbmc7Yi5zaG93TG9hZGluZygpO2IuYWpheExvYWQ9Zi5hamF4KGYuZXh0ZW5kKHt9LGEuYWpheCx7dXJsOmEuaHJlZixlcnJvcjpmdW5jdGlvbihhLGUpe2IuY29taW5nJiZcImFib3J0XCIhPT1lP2IuX2Vycm9yKFwiYWpheFwiLGEpOmIuaGlkZUxvYWRpbmcoKX0sc3VjY2VzczpmdW5jdGlvbihkLGUpe1wic3VjY2Vzc1wiPT09ZSYmKGEuY29udGVudD1kLGIuX2FmdGVyTG9hZCgpKX19KSl9LF9sb2FkSWZyYW1lOmZ1bmN0aW9uKCl7dmFyIGE9Yi5jb21pbmcsZD1mKGEudHBsLmlmcmFtZS5yZXBsYWNlKC9cXHtybmRcXH0vZywobmV3IERhdGUpLmdldFRpbWUoKSkpLmF0dHIoXCJzY3JvbGxpbmdcIixzP1wiYXV0b1wiOmEuaWZyYW1lLnNjcm9sbGluZykuYXR0cihcInNyY1wiLGEuaHJlZik7XG5mKGEud3JhcCkuYmluZChcIm9uUmVzZXRcIixmdW5jdGlvbigpe3RyeXtmKHRoaXMpLmZpbmQoXCJpZnJhbWVcIikuaGlkZSgpLmF0dHIoXCJzcmNcIixcIi8vYWJvdXQ6YmxhbmtcIikuZW5kKCkuZW1wdHkoKX1jYXRjaChhKXt9fSk7YS5pZnJhbWUucHJlbG9hZCYmKGIuc2hvd0xvYWRpbmcoKSxkLm9uZShcImxvYWRcIixmdW5jdGlvbigpe2YodGhpcykuZGF0YShcInJlYWR5XCIsMSk7c3x8Zih0aGlzKS5iaW5kKFwibG9hZC5mYlwiLGIudXBkYXRlKTtmKHRoaXMpLnBhcmVudHMoXCIuZmFuY3lib3gtd3JhcFwiKS53aWR0aChcIjEwMCVcIikucmVtb3ZlQ2xhc3MoXCJmYW5jeWJveC10bXBcIikuc2hvdygpO2IuX2FmdGVyTG9hZCgpfSkpO2EuY29udGVudD1kLmFwcGVuZFRvKGEuaW5uZXIpO2EuaWZyYW1lLnByZWxvYWR8fGIuX2FmdGVyTG9hZCgpfSxfcHJlbG9hZEltYWdlczpmdW5jdGlvbigpe3ZhciBhPWIuZ3JvdXAsZD1iLmN1cnJlbnQsZT1hLmxlbmd0aCxjPWQucHJlbG9hZD9NYXRoLm1pbihkLnByZWxvYWQsXG5lLTEpOjAsZixnO2ZvcihnPTE7Zzw9YztnKz0xKWY9YVsoZC5pbmRleCtnKSVlXSxcImltYWdlXCI9PT1mLnR5cGUmJmYuaHJlZiYmKChuZXcgSW1hZ2UpLnNyYz1mLmhyZWYpfSxfYWZ0ZXJMb2FkOmZ1bmN0aW9uKCl7dmFyIGE9Yi5jb21pbmcsZD1iLmN1cnJlbnQsZSxjLGssZyxoO2IuaGlkZUxvYWRpbmcoKTtpZihhJiYhMSE9PWIuaXNBY3RpdmUpaWYoITE9PT1iLnRyaWdnZXIoXCJhZnRlckxvYWRcIixhLGQpKWEud3JhcC5zdG9wKCEwKS50cmlnZ2VyKFwib25SZXNldFwiKS5yZW1vdmUoKSxiLmNvbWluZz1udWxsO2Vsc2V7ZCYmKGIudHJpZ2dlcihcImJlZm9yZUNoYW5nZVwiLGQpLGQud3JhcC5zdG9wKCEwKS5yZW1vdmVDbGFzcyhcImZhbmN5Ym94LW9wZW5lZFwiKS5maW5kKFwiLmZhbmN5Ym94LWl0ZW0sIC5mYW5jeWJveC1uYXZcIikucmVtb3ZlKCkpO2IudW5iaW5kRXZlbnRzKCk7ZT1hLmNvbnRlbnQ7Yz1hLnR5cGU7az1hLnNjcm9sbGluZztmLmV4dGVuZChiLHt3cmFwOmEud3JhcCxza2luOmEuc2tpbixcbm91dGVyOmEub3V0ZXIsaW5uZXI6YS5pbm5lcixjdXJyZW50OmEscHJldmlvdXM6ZH0pO2c9YS5ocmVmO3N3aXRjaChjKXtjYXNlIFwiaW5saW5lXCI6Y2FzZSBcImFqYXhcIjpjYXNlIFwiaHRtbFwiOmEuc2VsZWN0b3I/ZT1mKFwiPGRpdj5cIikuaHRtbChlKS5maW5kKGEuc2VsZWN0b3IpOnQoZSkmJihlLmRhdGEoXCJmYW5jeWJveC1wbGFjZWhvbGRlclwiKXx8ZS5kYXRhKFwiZmFuY3lib3gtcGxhY2Vob2xkZXJcIixmKCc8ZGl2IGNsYXNzPVwiZmFuY3lib3gtcGxhY2Vob2xkZXJcIj48L2Rpdj4nKS5pbnNlcnRBZnRlcihlKS5oaWRlKCkpLGU9ZS5zaG93KCkuZGV0YWNoKCksYS53cmFwLmJpbmQoXCJvblJlc2V0XCIsZnVuY3Rpb24oKXtmKHRoaXMpLmZpbmQoZSkubGVuZ3RoJiZlLmhpZGUoKS5yZXBsYWNlQWxsKGUuZGF0YShcImZhbmN5Ym94LXBsYWNlaG9sZGVyXCIpKS5kYXRhKFwiZmFuY3lib3gtcGxhY2Vob2xkZXJcIiwhMSl9KSk7YnJlYWs7Y2FzZSBcImltYWdlXCI6ZT1hLnRwbC5pbWFnZS5yZXBsYWNlKFwie2hyZWZ9XCIsXG5nKTticmVhaztjYXNlIFwic3dmXCI6ZT0nPG9iamVjdCBpZD1cImZhbmN5Ym94LXN3ZlwiIGNsYXNzaWQ9XCJjbHNpZDpEMjdDREI2RS1BRTZELTExY2YtOTZCOC00NDQ1NTM1NDAwMDBcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCI+PHBhcmFtIG5hbWU9XCJtb3ZpZVwiIHZhbHVlPVwiJytnKydcIj48L3BhcmFtPicsaD1cIlwiLGYuZWFjaChhLnN3ZixmdW5jdGlvbihhLGIpe2UrPSc8cGFyYW0gbmFtZT1cIicrYSsnXCIgdmFsdWU9XCInK2IrJ1wiPjwvcGFyYW0+JztoKz1cIiBcIithKyc9XCInK2IrJ1wiJ30pLGUrPSc8ZW1iZWQgc3JjPVwiJytnKydcIiB0eXBlPVwiYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2hcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCInK2grXCI+PC9lbWJlZD48L29iamVjdD5cIn0oIXQoZSl8fCFlLnBhcmVudCgpLmlzKGEuaW5uZXIpKSYmYS5pbm5lci5hcHBlbmQoZSk7Yi50cmlnZ2VyKFwiYmVmb3JlU2hvd1wiKTthLmlubmVyLmNzcyhcIm92ZXJmbG93XCIsXCJ5ZXNcIj09PWs/XCJzY3JvbGxcIjpcblwibm9cIj09PWs/XCJoaWRkZW5cIjprKTtiLl9zZXREaW1lbnNpb24oKTtiLnJlcG9zaXRpb24oKTtiLmlzT3Blbj0hMTtiLmNvbWluZz1udWxsO2IuYmluZEV2ZW50cygpO2lmKGIuaXNPcGVuZWQpe2lmKGQucHJldk1ldGhvZCliLnRyYW5zaXRpb25zW2QucHJldk1ldGhvZF0oKX1lbHNlIGYoXCIuZmFuY3lib3gtd3JhcFwiKS5ub3QoYS53cmFwKS5zdG9wKCEwKS50cmlnZ2VyKFwib25SZXNldFwiKS5yZW1vdmUoKTtiLnRyYW5zaXRpb25zW2IuaXNPcGVuZWQ/YS5uZXh0TWV0aG9kOmEub3Blbk1ldGhvZF0oKTtiLl9wcmVsb2FkSW1hZ2VzKCl9fSxfc2V0RGltZW5zaW9uOmZ1bmN0aW9uKCl7dmFyIGE9Yi5nZXRWaWV3cG9ydCgpLGQ9MCxlPSExLGM9ITEsZT1iLndyYXAsaz1iLnNraW4sZz1iLmlubmVyLGg9Yi5jdXJyZW50LGM9aC53aWR0aCxqPWguaGVpZ2h0LG09aC5taW5XaWR0aCx1PWgubWluSGVpZ2h0LG49aC5tYXhXaWR0aCxwPWgubWF4SGVpZ2h0LHM9aC5zY3JvbGxpbmcscT1oLnNjcm9sbE91dHNpZGU/XG5oLnNjcm9sbGJhcldpZHRoOjAseD1oLm1hcmdpbix5PWwoeFsxXSt4WzNdKSxyPWwoeFswXSt4WzJdKSx2LHosdCxDLEEsRixCLEQsSDtlLmFkZChrKS5hZGQoZykud2lkdGgoXCJhdXRvXCIpLmhlaWdodChcImF1dG9cIikucmVtb3ZlQ2xhc3MoXCJmYW5jeWJveC10bXBcIik7eD1sKGsub3V0ZXJXaWR0aCghMCktay53aWR0aCgpKTt2PWwoay5vdXRlckhlaWdodCghMCktay5oZWlnaHQoKSk7ej15K3g7dD1yK3Y7Qz1FKGMpPyhhLncteikqbChjKS8xMDA6YztBPUUoaik/KGEuaC10KSpsKGopLzEwMDpqO2lmKFwiaWZyYW1lXCI9PT1oLnR5cGUpe2lmKEg9aC5jb250ZW50LGguYXV0b0hlaWdodCYmMT09PUguZGF0YShcInJlYWR5XCIpKXRyeXtIWzBdLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQubG9jYXRpb24mJihnLndpZHRoKEMpLmhlaWdodCg5OTk5KSxGPUguY29udGVudHMoKS5maW5kKFwiYm9keVwiKSxxJiZGLmNzcyhcIm92ZXJmbG93LXhcIixcImhpZGRlblwiKSxBPUYub3V0ZXJIZWlnaHQoITApKX1jYXRjaChHKXt9fWVsc2UgaWYoaC5hdXRvV2lkdGh8fFxuaC5hdXRvSGVpZ2h0KWcuYWRkQ2xhc3MoXCJmYW5jeWJveC10bXBcIiksaC5hdXRvV2lkdGh8fGcud2lkdGgoQyksaC5hdXRvSGVpZ2h0fHxnLmhlaWdodChBKSxoLmF1dG9XaWR0aCYmKEM9Zy53aWR0aCgpKSxoLmF1dG9IZWlnaHQmJihBPWcuaGVpZ2h0KCkpLGcucmVtb3ZlQ2xhc3MoXCJmYW5jeWJveC10bXBcIik7Yz1sKEMpO2o9bChBKTtEPUMvQTttPWwoRShtKT9sKG0sXCJ3XCIpLXo6bSk7bj1sKEUobik/bChuLFwid1wiKS16Om4pO3U9bChFKHUpP2wodSxcImhcIiktdDp1KTtwPWwoRShwKT9sKHAsXCJoXCIpLXQ6cCk7Rj1uO0I9cDtoLmZpdFRvVmlldyYmKG49TWF0aC5taW4oYS53LXosbikscD1NYXRoLm1pbihhLmgtdCxwKSk7ej1hLncteTtyPWEuaC1yO2guYXNwZWN0UmF0aW8/KGM+biYmKGM9bixqPWwoYy9EKSksaj5wJiYoaj1wLGM9bChqKkQpKSxjPG0mJihjPW0saj1sKGMvRCkpLGo8dSYmKGo9dSxjPWwoaipEKSkpOihjPU1hdGgubWF4KG0sTWF0aC5taW4oYyxuKSksaC5hdXRvSGVpZ2h0JiZcblwiaWZyYW1lXCIhPT1oLnR5cGUmJihnLndpZHRoKGMpLGo9Zy5oZWlnaHQoKSksaj1NYXRoLm1heCh1LE1hdGgubWluKGoscCkpKTtpZihoLmZpdFRvVmlldylpZihnLndpZHRoKGMpLmhlaWdodChqKSxlLndpZHRoKGMreCksYT1lLndpZHRoKCkseT1lLmhlaWdodCgpLGguYXNwZWN0UmF0aW8pZm9yKDsoYT56fHx5PnIpJiYoYz5tJiZqPnUpJiYhKDE5PGQrKyk7KWo9TWF0aC5tYXgodSxNYXRoLm1pbihwLGotMTApKSxjPWwoaipEKSxjPG0mJihjPW0saj1sKGMvRCkpLGM+biYmKGM9bixqPWwoYy9EKSksZy53aWR0aChjKS5oZWlnaHQoaiksZS53aWR0aChjK3gpLGE9ZS53aWR0aCgpLHk9ZS5oZWlnaHQoKTtlbHNlIGM9TWF0aC5tYXgobSxNYXRoLm1pbihjLGMtKGEteikpKSxqPU1hdGgubWF4KHUsTWF0aC5taW4oaixqLSh5LXIpKSk7cSYmKFwiYXV0b1wiPT09cyYmajxBJiZjK3grcTx6KSYmKGMrPXEpO2cud2lkdGgoYykuaGVpZ2h0KGopO2Uud2lkdGgoYyt4KTthPWUud2lkdGgoKTtcbnk9ZS5oZWlnaHQoKTtlPShhPnp8fHk+cikmJmM+bSYmaj51O2M9aC5hc3BlY3RSYXRpbz9jPEYmJmo8QiYmYzxDJiZqPEE6KGM8Rnx8ajxCKSYmKGM8Q3x8ajxBKTtmLmV4dGVuZChoLHtkaW06e3dpZHRoOncoYSksaGVpZ2h0OncoeSl9LG9yaWdXaWR0aDpDLG9yaWdIZWlnaHQ6QSxjYW5TaHJpbms6ZSxjYW5FeHBhbmQ6Yyx3UGFkZGluZzp4LGhQYWRkaW5nOnYsd3JhcFNwYWNlOnktay5vdXRlckhlaWdodCghMCksc2tpblNwYWNlOmsuaGVpZ2h0KCktan0pOyFIJiYoaC5hdXRvSGVpZ2h0JiZqPnUmJmo8cCYmIWMpJiZnLmhlaWdodChcImF1dG9cIil9LF9nZXRQb3NpdGlvbjpmdW5jdGlvbihhKXt2YXIgZD1iLmN1cnJlbnQsZT1iLmdldFZpZXdwb3J0KCksYz1kLm1hcmdpbixmPWIud3JhcC53aWR0aCgpK2NbMV0rY1szXSxnPWIud3JhcC5oZWlnaHQoKStjWzBdK2NbMl0sYz17cG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDpjWzBdLGxlZnQ6Y1szXX07ZC5hdXRvQ2VudGVyJiZkLmZpeGVkJiZcbiFhJiZnPD1lLmgmJmY8PWUudz9jLnBvc2l0aW9uPVwiZml4ZWRcIjpkLmxvY2tlZHx8KGMudG9wKz1lLnksYy5sZWZ0Kz1lLngpO2MudG9wPXcoTWF0aC5tYXgoYy50b3AsYy50b3ArKGUuaC1nKSpkLnRvcFJhdGlvKSk7Yy5sZWZ0PXcoTWF0aC5tYXgoYy5sZWZ0LGMubGVmdCsoZS53LWYpKmQubGVmdFJhdGlvKSk7cmV0dXJuIGN9LF9hZnRlclpvb21JbjpmdW5jdGlvbigpe3ZhciBhPWIuY3VycmVudDthJiYoYi5pc09wZW49Yi5pc09wZW5lZD0hMCxiLndyYXAuY3NzKFwib3ZlcmZsb3dcIixcInZpc2libGVcIikuYWRkQ2xhc3MoXCJmYW5jeWJveC1vcGVuZWRcIiksYi51cGRhdGUoKSwoYS5jbG9zZUNsaWNrfHxhLm5leHRDbGljayYmMTxiLmdyb3VwLmxlbmd0aCkmJmIuaW5uZXIuY3NzKFwiY3Vyc29yXCIsXCJwb2ludGVyXCIpLmJpbmQoXCJjbGljay5mYlwiLGZ1bmN0aW9uKGQpeyFmKGQudGFyZ2V0KS5pcyhcImFcIikmJiFmKGQudGFyZ2V0KS5wYXJlbnQoKS5pcyhcImFcIikmJihkLnByZXZlbnREZWZhdWx0KCksXG5iW2EuY2xvc2VDbGljaz9cImNsb3NlXCI6XCJuZXh0XCJdKCkpfSksYS5jbG9zZUJ0biYmZihhLnRwbC5jbG9zZUJ0bikuYXBwZW5kVG8oYi5za2luKS5iaW5kKFwiY2xpY2suZmJcIixmdW5jdGlvbihhKXthLnByZXZlbnREZWZhdWx0KCk7Yi5jbG9zZSgpfSksYS5hcnJvd3MmJjE8Yi5ncm91cC5sZW5ndGgmJigoYS5sb29wfHwwPGEuaW5kZXgpJiZmKGEudHBsLnByZXYpLmFwcGVuZFRvKGIub3V0ZXIpLmJpbmQoXCJjbGljay5mYlwiLGIucHJldiksKGEubG9vcHx8YS5pbmRleDxiLmdyb3VwLmxlbmd0aC0xKSYmZihhLnRwbC5uZXh0KS5hcHBlbmRUbyhiLm91dGVyKS5iaW5kKFwiY2xpY2suZmJcIixiLm5leHQpKSxiLnRyaWdnZXIoXCJhZnRlclNob3dcIiksIWEubG9vcCYmYS5pbmRleD09PWEuZ3JvdXAubGVuZ3RoLTE/Yi5wbGF5KCExKTpiLm9wdHMuYXV0b1BsYXkmJiFiLnBsYXllci5pc0FjdGl2ZSYmKGIub3B0cy5hdXRvUGxheT0hMSxiLnBsYXkoKSkpfSxfYWZ0ZXJab29tT3V0OmZ1bmN0aW9uKGEpe2E9XG5hfHxiLmN1cnJlbnQ7ZihcIi5mYW5jeWJveC13cmFwXCIpLnRyaWdnZXIoXCJvblJlc2V0XCIpLnJlbW92ZSgpO2YuZXh0ZW5kKGIse2dyb3VwOnt9LG9wdHM6e30scm91dGVyOiExLGN1cnJlbnQ6bnVsbCxpc0FjdGl2ZTohMSxpc09wZW5lZDohMSxpc09wZW46ITEsaXNDbG9zaW5nOiExLHdyYXA6bnVsbCxza2luOm51bGwsb3V0ZXI6bnVsbCxpbm5lcjpudWxsfSk7Yi50cmlnZ2VyKFwiYWZ0ZXJDbG9zZVwiLGEpfX0pO2IudHJhbnNpdGlvbnM9e2dldE9yaWdQb3NpdGlvbjpmdW5jdGlvbigpe3ZhciBhPWIuY3VycmVudCxkPWEuZWxlbWVudCxlPWEub3JpZyxjPXt9LGY9NTAsZz01MCxoPWEuaFBhZGRpbmcsaj1hLndQYWRkaW5nLG09Yi5nZXRWaWV3cG9ydCgpOyFlJiYoYS5pc0RvbSYmZC5pcyhcIjp2aXNpYmxlXCIpKSYmKGU9ZC5maW5kKFwiaW1nOmZpcnN0XCIpLGUubGVuZ3RofHwoZT1kKSk7dChlKT8oYz1lLm9mZnNldCgpLGUuaXMoXCJpbWdcIikmJihmPWUub3V0ZXJXaWR0aCgpLGc9ZS5vdXRlckhlaWdodCgpKSk6XG4oYy50b3A9bS55KyhtLmgtZykqYS50b3BSYXRpbyxjLmxlZnQ9bS54KyhtLnctZikqYS5sZWZ0UmF0aW8pO2lmKFwiZml4ZWRcIj09PWIud3JhcC5jc3MoXCJwb3NpdGlvblwiKXx8YS5sb2NrZWQpYy50b3AtPW0ueSxjLmxlZnQtPW0ueDtyZXR1cm4gYz17dG9wOncoYy50b3AtaCphLnRvcFJhdGlvKSxsZWZ0OncoYy5sZWZ0LWoqYS5sZWZ0UmF0aW8pLHdpZHRoOncoZitqKSxoZWlnaHQ6dyhnK2gpfX0sc3RlcDpmdW5jdGlvbihhLGQpe3ZhciBlLGMsZj1kLnByb3A7Yz1iLmN1cnJlbnQ7dmFyIGc9Yy53cmFwU3BhY2UsaD1jLnNraW5TcGFjZTtpZihcIndpZHRoXCI9PT1mfHxcImhlaWdodFwiPT09ZillPWQuZW5kPT09ZC5zdGFydD8xOihhLWQuc3RhcnQpLyhkLmVuZC1kLnN0YXJ0KSxiLmlzQ2xvc2luZyYmKGU9MS1lKSxjPVwid2lkdGhcIj09PWY/Yy53UGFkZGluZzpjLmhQYWRkaW5nLGM9YS1jLGIuc2tpbltmXShsKFwid2lkdGhcIj09PWY/YzpjLWcqZSkpLGIuaW5uZXJbZl0obChcIndpZHRoXCI9PT1cbmY/YzpjLWcqZS1oKmUpKX0sem9vbUluOmZ1bmN0aW9uKCl7dmFyIGE9Yi5jdXJyZW50LGQ9YS5wb3MsZT1hLm9wZW5FZmZlY3QsYz1cImVsYXN0aWNcIj09PWUsaz1mLmV4dGVuZCh7b3BhY2l0eToxfSxkKTtkZWxldGUgay5wb3NpdGlvbjtjPyhkPXRoaXMuZ2V0T3JpZ1Bvc2l0aW9uKCksYS5vcGVuT3BhY2l0eSYmKGQub3BhY2l0eT0wLjEpKTpcImZhZGVcIj09PWUmJihkLm9wYWNpdHk9MC4xKTtiLndyYXAuY3NzKGQpLmFuaW1hdGUoayx7ZHVyYXRpb246XCJub25lXCI9PT1lPzA6YS5vcGVuU3BlZWQsZWFzaW5nOmEub3BlbkVhc2luZyxzdGVwOmM/dGhpcy5zdGVwOm51bGwsY29tcGxldGU6Yi5fYWZ0ZXJab29tSW59KX0sem9vbU91dDpmdW5jdGlvbigpe3ZhciBhPWIuY3VycmVudCxkPWEuY2xvc2VFZmZlY3QsZT1cImVsYXN0aWNcIj09PWQsYz17b3BhY2l0eTowLjF9O2UmJihjPXRoaXMuZ2V0T3JpZ1Bvc2l0aW9uKCksYS5jbG9zZU9wYWNpdHkmJihjLm9wYWNpdHk9MC4xKSk7Yi53cmFwLmFuaW1hdGUoYyxcbntkdXJhdGlvbjpcIm5vbmVcIj09PWQ/MDphLmNsb3NlU3BlZWQsZWFzaW5nOmEuY2xvc2VFYXNpbmcsc3RlcDplP3RoaXMuc3RlcDpudWxsLGNvbXBsZXRlOmIuX2FmdGVyWm9vbU91dH0pfSxjaGFuZ2VJbjpmdW5jdGlvbigpe3ZhciBhPWIuY3VycmVudCxkPWEubmV4dEVmZmVjdCxlPWEucG9zLGM9e29wYWNpdHk6MX0sZj1iLmRpcmVjdGlvbixnO2Uub3BhY2l0eT0wLjE7XCJlbGFzdGljXCI9PT1kJiYoZz1cImRvd25cIj09PWZ8fFwidXBcIj09PWY/XCJ0b3BcIjpcImxlZnRcIixcImRvd25cIj09PWZ8fFwicmlnaHRcIj09PWY/KGVbZ109dyhsKGVbZ10pLTIwMCksY1tnXT1cIis9MjAwcHhcIik6KGVbZ109dyhsKGVbZ10pKzIwMCksY1tnXT1cIi09MjAwcHhcIikpO1wibm9uZVwiPT09ZD9iLl9hZnRlclpvb21JbigpOmIud3JhcC5jc3MoZSkuYW5pbWF0ZShjLHtkdXJhdGlvbjphLm5leHRTcGVlZCxlYXNpbmc6YS5uZXh0RWFzaW5nLGNvbXBsZXRlOmIuX2FmdGVyWm9vbUlufSl9LGNoYW5nZU91dDpmdW5jdGlvbigpe3ZhciBhPVxuYi5wcmV2aW91cyxkPWEucHJldkVmZmVjdCxlPXtvcGFjaXR5OjAuMX0sYz1iLmRpcmVjdGlvbjtcImVsYXN0aWNcIj09PWQmJihlW1wiZG93blwiPT09Y3x8XCJ1cFwiPT09Yz9cInRvcFwiOlwibGVmdFwiXT0oXCJ1cFwiPT09Y3x8XCJsZWZ0XCI9PT1jP1wiLVwiOlwiK1wiKStcIj0yMDBweFwiKTthLndyYXAuYW5pbWF0ZShlLHtkdXJhdGlvbjpcIm5vbmVcIj09PWQ/MDphLnByZXZTcGVlZCxlYXNpbmc6YS5wcmV2RWFzaW5nLGNvbXBsZXRlOmZ1bmN0aW9uKCl7Zih0aGlzKS50cmlnZ2VyKFwib25SZXNldFwiKS5yZW1vdmUoKX19KX19O2IuaGVscGVycy5vdmVybGF5PXtkZWZhdWx0czp7Y2xvc2VDbGljazohMCxzcGVlZE91dDoyMDAsc2hvd0Vhcmx5OiEwLGNzczp7fSxsb2NrZWQ6IXMsZml4ZWQ6ITB9LG92ZXJsYXk6bnVsbCxmaXhlZDohMSxlbDpmKFwiaHRtbFwiKSxjcmVhdGU6ZnVuY3Rpb24oYSl7YT1mLmV4dGVuZCh7fSx0aGlzLmRlZmF1bHRzLGEpO3RoaXMub3ZlcmxheSYmdGhpcy5jbG9zZSgpO3RoaXMub3ZlcmxheT1cbmYoJzxkaXYgY2xhc3M9XCJmYW5jeWJveC1vdmVybGF5XCI+PC9kaXY+JykuYXBwZW5kVG8oYi5jb21pbmc/Yi5jb21pbmcucGFyZW50OmEucGFyZW50KTt0aGlzLmZpeGVkPSExO2EuZml4ZWQmJmIuZGVmYXVsdHMuZml4ZWQmJih0aGlzLm92ZXJsYXkuYWRkQ2xhc3MoXCJmYW5jeWJveC1vdmVybGF5LWZpeGVkXCIpLHRoaXMuZml4ZWQ9ITApfSxvcGVuOmZ1bmN0aW9uKGEpe3ZhciBkPXRoaXM7YT1mLmV4dGVuZCh7fSx0aGlzLmRlZmF1bHRzLGEpO3RoaXMub3ZlcmxheT90aGlzLm92ZXJsYXkudW5iaW5kKFwiLm92ZXJsYXlcIikud2lkdGgoXCJhdXRvXCIpLmhlaWdodChcImF1dG9cIik6dGhpcy5jcmVhdGUoYSk7dGhpcy5maXhlZHx8KG4uYmluZChcInJlc2l6ZS5vdmVybGF5XCIsZi5wcm94eSh0aGlzLnVwZGF0ZSx0aGlzKSksdGhpcy51cGRhdGUoKSk7YS5jbG9zZUNsaWNrJiZ0aGlzLm92ZXJsYXkuYmluZChcImNsaWNrLm92ZXJsYXlcIixmdW5jdGlvbihhKXtpZihmKGEudGFyZ2V0KS5oYXNDbGFzcyhcImZhbmN5Ym94LW92ZXJsYXlcIikpcmV0dXJuIGIuaXNBY3RpdmU/XG5iLmNsb3NlKCk6ZC5jbG9zZSgpLCExfSk7dGhpcy5vdmVybGF5LmNzcyhhLmNzcykuc2hvdygpfSxjbG9zZTpmdW5jdGlvbigpe3ZhciBhLGI7bi51bmJpbmQoXCJyZXNpemUub3ZlcmxheVwiKTt0aGlzLmVsLmhhc0NsYXNzKFwiZmFuY3lib3gtbG9ja1wiKSYmKGYoXCIuZmFuY3lib3gtbWFyZ2luXCIpLnJlbW92ZUNsYXNzKFwiZmFuY3lib3gtbWFyZ2luXCIpLGE9bi5zY3JvbGxUb3AoKSxiPW4uc2Nyb2xsTGVmdCgpLHRoaXMuZWwucmVtb3ZlQ2xhc3MoXCJmYW5jeWJveC1sb2NrXCIpLG4uc2Nyb2xsVG9wKGEpLnNjcm9sbExlZnQoYikpO2YoXCIuZmFuY3lib3gtb3ZlcmxheVwiKS5yZW1vdmUoKS5oaWRlKCk7Zi5leHRlbmQodGhpcyx7b3ZlcmxheTpudWxsLGZpeGVkOiExfSl9LHVwZGF0ZTpmdW5jdGlvbigpe3ZhciBhPVwiMTAwJVwiLGI7dGhpcy5vdmVybGF5LndpZHRoKGEpLmhlaWdodChcIjEwMCVcIik7ST8oYj1NYXRoLm1heChHLmRvY3VtZW50RWxlbWVudC5vZmZzZXRXaWR0aCxHLmJvZHkub2Zmc2V0V2lkdGgpLFxucC53aWR0aCgpPmImJihhPXAud2lkdGgoKSkpOnAud2lkdGgoKT5uLndpZHRoKCkmJihhPXAud2lkdGgoKSk7dGhpcy5vdmVybGF5LndpZHRoKGEpLmhlaWdodChwLmhlaWdodCgpKX0sb25SZWFkeTpmdW5jdGlvbihhLGIpe3ZhciBlPXRoaXMub3ZlcmxheTtmKFwiLmZhbmN5Ym94LW92ZXJsYXlcIikuc3RvcCghMCwhMCk7ZXx8dGhpcy5jcmVhdGUoYSk7YS5sb2NrZWQmJih0aGlzLmZpeGVkJiZiLmZpeGVkKSYmKGV8fCh0aGlzLm1hcmdpbj1wLmhlaWdodCgpPm4uaGVpZ2h0KCk/ZihcImh0bWxcIikuY3NzKFwibWFyZ2luLXJpZ2h0XCIpLnJlcGxhY2UoXCJweFwiLFwiXCIpOiExKSxiLmxvY2tlZD10aGlzLm92ZXJsYXkuYXBwZW5kKGIud3JhcCksYi5maXhlZD0hMSk7ITA9PT1hLnNob3dFYXJseSYmdGhpcy5iZWZvcmVTaG93LmFwcGx5KHRoaXMsYXJndW1lbnRzKX0sYmVmb3JlU2hvdzpmdW5jdGlvbihhLGIpe3ZhciBlLGM7Yi5sb2NrZWQmJighMSE9PXRoaXMubWFyZ2luJiYoZihcIipcIikuZmlsdGVyKGZ1bmN0aW9uKCl7cmV0dXJuXCJmaXhlZFwiPT09XG5mKHRoaXMpLmNzcyhcInBvc2l0aW9uXCIpJiYhZih0aGlzKS5oYXNDbGFzcyhcImZhbmN5Ym94LW92ZXJsYXlcIikmJiFmKHRoaXMpLmhhc0NsYXNzKFwiZmFuY3lib3gtd3JhcFwiKX0pLmFkZENsYXNzKFwiZmFuY3lib3gtbWFyZ2luXCIpLHRoaXMuZWwuYWRkQ2xhc3MoXCJmYW5jeWJveC1tYXJnaW5cIikpLGU9bi5zY3JvbGxUb3AoKSxjPW4uc2Nyb2xsTGVmdCgpLHRoaXMuZWwuYWRkQ2xhc3MoXCJmYW5jeWJveC1sb2NrXCIpLG4uc2Nyb2xsVG9wKGUpLnNjcm9sbExlZnQoYykpO3RoaXMub3BlbihhKX0sb25VcGRhdGU6ZnVuY3Rpb24oKXt0aGlzLmZpeGVkfHx0aGlzLnVwZGF0ZSgpfSxhZnRlckNsb3NlOmZ1bmN0aW9uKGEpe3RoaXMub3ZlcmxheSYmIWIuY29taW5nJiZ0aGlzLm92ZXJsYXkuZmFkZU91dChhLnNwZWVkT3V0LGYucHJveHkodGhpcy5jbG9zZSx0aGlzKSl9fTtiLmhlbHBlcnMudGl0bGU9e2RlZmF1bHRzOnt0eXBlOlwiZmxvYXRcIixwb3NpdGlvbjpcImJvdHRvbVwifSxiZWZvcmVTaG93OmZ1bmN0aW9uKGEpe3ZhciBkPVxuYi5jdXJyZW50LGU9ZC50aXRsZSxjPWEudHlwZTtmLmlzRnVuY3Rpb24oZSkmJihlPWUuY2FsbChkLmVsZW1lbnQsZCkpO2lmKHEoZSkmJlwiXCIhPT1mLnRyaW0oZSkpe2Q9ZignPGRpdiBjbGFzcz1cImZhbmN5Ym94LXRpdGxlIGZhbmN5Ym94LXRpdGxlLScrYysnLXdyYXBcIj4nK2UrXCI8L2Rpdj5cIik7c3dpdGNoKGMpe2Nhc2UgXCJpbnNpZGVcIjpjPWIuc2tpbjticmVhaztjYXNlIFwib3V0c2lkZVwiOmM9Yi53cmFwO2JyZWFrO2Nhc2UgXCJvdmVyXCI6Yz1iLmlubmVyO2JyZWFrO2RlZmF1bHQ6Yz1iLnNraW4sZC5hcHBlbmRUbyhcImJvZHlcIiksSSYmZC53aWR0aChkLndpZHRoKCkpLGQud3JhcElubmVyKCc8c3BhbiBjbGFzcz1cImNoaWxkXCI+PC9zcGFuPicpLGIuY3VycmVudC5tYXJnaW5bMl0rPU1hdGguYWJzKGwoZC5jc3MoXCJtYXJnaW4tYm90dG9tXCIpKSl9ZFtcInRvcFwiPT09YS5wb3NpdGlvbj9cInByZXBlbmRUb1wiOlwiYXBwZW5kVG9cIl0oYyl9fX07Zi5mbi5mYW5jeWJveD1mdW5jdGlvbihhKXt2YXIgZCxcbmU9Zih0aGlzKSxjPXRoaXMuc2VsZWN0b3J8fFwiXCIsaz1mdW5jdGlvbihnKXt2YXIgaD1mKHRoaXMpLmJsdXIoKSxqPWQsayxsOyFnLmN0cmxLZXkmJighZy5hbHRLZXkmJiFnLnNoaWZ0S2V5JiYhZy5tZXRhS2V5KSYmIWguaXMoXCIuZmFuY3lib3gtd3JhcFwiKSYmKGs9YS5ncm91cEF0dHJ8fFwiZGF0YS1mYW5jeWJveC1ncm91cFwiLGw9aC5hdHRyKGspLGx8fChrPVwicmVsXCIsbD1oLmdldCgwKVtrXSksbCYmKFwiXCIhPT1sJiZcIm5vZm9sbG93XCIhPT1sKSYmKGg9Yy5sZW5ndGg/ZihjKTplLGg9aC5maWx0ZXIoXCJbXCIraysnPVwiJytsKydcIl0nKSxqPWguaW5kZXgodGhpcykpLGEuaW5kZXg9aiwhMSE9PWIub3BlbihoLGEpJiZnLnByZXZlbnREZWZhdWx0KCkpfTthPWF8fHt9O2Q9YS5pbmRleHx8MDshY3x8ITE9PT1hLmxpdmU/ZS51bmJpbmQoXCJjbGljay5mYi1zdGFydFwiKS5iaW5kKFwiY2xpY2suZmItc3RhcnRcIixrKTpwLnVuZGVsZWdhdGUoYyxcImNsaWNrLmZiLXN0YXJ0XCIpLmRlbGVnYXRlKGMrXG5cIjpub3QoJy5mYW5jeWJveC1pdGVtLCAuZmFuY3lib3gtbmF2JylcIixcImNsaWNrLmZiLXN0YXJ0XCIsayk7dGhpcy5maWx0ZXIoXCJbZGF0YS1mYW5jeWJveC1zdGFydD0xXVwiKS50cmlnZ2VyKFwiY2xpY2tcIik7cmV0dXJuIHRoaXN9O3AucmVhZHkoZnVuY3Rpb24oKXt2YXIgYSxkO2Yuc2Nyb2xsYmFyV2lkdGg9PT12JiYoZi5zY3JvbGxiYXJXaWR0aD1mdW5jdGlvbigpe3ZhciBhPWYoJzxkaXYgc3R5bGU9XCJ3aWR0aDo1MHB4O2hlaWdodDo1MHB4O292ZXJmbG93OmF1dG9cIj48ZGl2Lz48L2Rpdj4nKS5hcHBlbmRUbyhcImJvZHlcIiksYj1hLmNoaWxkcmVuKCksYj1iLmlubmVyV2lkdGgoKS1iLmhlaWdodCg5OSkuaW5uZXJXaWR0aCgpO2EucmVtb3ZlKCk7cmV0dXJuIGJ9KTtpZihmLnN1cHBvcnQuZml4ZWRQb3NpdGlvbj09PXYpe2E9Zi5zdXBwb3J0O2Q9ZignPGRpdiBzdHlsZT1cInBvc2l0aW9uOmZpeGVkO3RvcDoyMHB4O1wiPjwvZGl2PicpLmFwcGVuZFRvKFwiYm9keVwiKTt2YXIgZT0yMD09PVxuZFswXS5vZmZzZXRUb3B8fDE1PT09ZFswXS5vZmZzZXRUb3A7ZC5yZW1vdmUoKTthLmZpeGVkUG9zaXRpb249ZX1mLmV4dGVuZChiLmRlZmF1bHRzLHtzY3JvbGxiYXJXaWR0aDpmLnNjcm9sbGJhcldpZHRoKCksZml4ZWQ6Zi5zdXBwb3J0LmZpeGVkUG9zaXRpb24scGFyZW50OmYoXCJib2R5XCIpfSk7YT1mKHIpLndpZHRoKCk7Si5hZGRDbGFzcyhcImZhbmN5Ym94LWxvY2stdGVzdFwiKTtkPWYocikud2lkdGgoKTtKLnJlbW92ZUNsYXNzKFwiZmFuY3lib3gtbG9jay10ZXN0XCIpO2YoXCI8c3R5bGUgdHlwZT0ndGV4dC9jc3MnPi5mYW5jeWJveC1tYXJnaW57bWFyZ2luLXJpZ2h0OlwiKyhkLWEpK1wicHg7fTwvc3R5bGU+XCIpLmFwcGVuZFRvKFwiaGVhZFwiKX0pfSkod2luZG93LGRvY3VtZW50LGpRdWVyeSk7IiwiLyohXG4qIEJvb3RzdHJhcC5qcyBieSBAZmF0ICYgQG1kb1xuKiBDb3B5cmlnaHQgMjAxMiBUd2l0dGVyLCBJbmMuXG4qIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMC50eHRcbiovXG4hZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7ZShmdW5jdGlvbigpe2Uuc3VwcG9ydC50cmFuc2l0aW9uPWZ1bmN0aW9uKCl7dmFyIGU9ZnVuY3Rpb24oKXt2YXIgZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYm9vdHN0cmFwXCIpLHQ9e1dlYmtpdFRyYW5zaXRpb246XCJ3ZWJraXRUcmFuc2l0aW9uRW5kXCIsTW96VHJhbnNpdGlvbjpcInRyYW5zaXRpb25lbmRcIixPVHJhbnNpdGlvbjpcIm9UcmFuc2l0aW9uRW5kIG90cmFuc2l0aW9uZW5kXCIsdHJhbnNpdGlvbjpcInRyYW5zaXRpb25lbmRcIn0sbjtmb3IobiBpbiB0KWlmKGUuc3R5bGVbbl0hPT11bmRlZmluZWQpcmV0dXJuIHRbbl19KCk7cmV0dXJuIGUmJntlbmQ6ZX19KCl9KX0od2luZG93LmpRdWVyeSksIWZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO3ZhciB0PSdbZGF0YS1kaXNtaXNzPVwiYWxlcnRcIl0nLG49ZnVuY3Rpb24obil7ZShuKS5vbihcImNsaWNrXCIsdCx0aGlzLmNsb3NlKX07bi5wcm90b3R5cGUuY2xvc2U9ZnVuY3Rpb24odCl7ZnVuY3Rpb24gcygpe2kudHJpZ2dlcihcImNsb3NlZFwiKS5yZW1vdmUoKX12YXIgbj1lKHRoaXMpLHI9bi5hdHRyKFwiZGF0YS10YXJnZXRcIiksaTtyfHwocj1uLmF0dHIoXCJocmVmXCIpLHI9ciYmci5yZXBsYWNlKC8uKig/PSNbXlxcc10qJCkvLFwiXCIpKSxpPWUociksdCYmdC5wcmV2ZW50RGVmYXVsdCgpLGkubGVuZ3RofHwoaT1uLmhhc0NsYXNzKFwiYWxlcnRcIik/bjpuLnBhcmVudCgpKSxpLnRyaWdnZXIodD1lLkV2ZW50KFwiY2xvc2VcIikpO2lmKHQuaXNEZWZhdWx0UHJldmVudGVkKCkpcmV0dXJuO2kucmVtb3ZlQ2xhc3MoXCJpblwiKSxlLnN1cHBvcnQudHJhbnNpdGlvbiYmaS5oYXNDbGFzcyhcImZhZGVcIik/aS5vbihlLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQscyk6cygpfTt2YXIgcj1lLmZuLmFsZXJ0O2UuZm4uYWxlcnQ9ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciByPWUodGhpcyksaT1yLmRhdGEoXCJhbGVydFwiKTtpfHxyLmRhdGEoXCJhbGVydFwiLGk9bmV3IG4odGhpcykpLHR5cGVvZiB0PT1cInN0cmluZ1wiJiZpW3RdLmNhbGwocil9KX0sZS5mbi5hbGVydC5Db25zdHJ1Y3Rvcj1uLGUuZm4uYWxlcnQubm9Db25mbGljdD1mdW5jdGlvbigpe3JldHVybiBlLmZuLmFsZXJ0PXIsdGhpc30sZShkb2N1bWVudCkub24oXCJjbGljay5hbGVydC5kYXRhLWFwaVwiLHQsbi5wcm90b3R5cGUuY2xvc2UpfSh3aW5kb3cualF1ZXJ5KSwhZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7dmFyIHQ9ZnVuY3Rpb24odCxuKXt0aGlzLiRlbGVtZW50PWUodCksdGhpcy5vcHRpb25zPWUuZXh0ZW5kKHt9LGUuZm4uYnV0dG9uLmRlZmF1bHRzLG4pfTt0LnByb3RvdHlwZS5zZXRTdGF0ZT1mdW5jdGlvbihlKXt2YXIgdD1cImRpc2FibGVkXCIsbj10aGlzLiRlbGVtZW50LHI9bi5kYXRhKCksaT1uLmlzKFwiaW5wdXRcIik/XCJ2YWxcIjpcImh0bWxcIjtlKz1cIlRleHRcIixyLnJlc2V0VGV4dHx8bi5kYXRhKFwicmVzZXRUZXh0XCIsbltpXSgpKSxuW2ldKHJbZV18fHRoaXMub3B0aW9uc1tlXSksc2V0VGltZW91dChmdW5jdGlvbigpe2U9PVwibG9hZGluZ1RleHRcIj9uLmFkZENsYXNzKHQpLmF0dHIodCx0KTpuLnJlbW92ZUNsYXNzKHQpLnJlbW92ZUF0dHIodCl9LDApfSx0LnByb3RvdHlwZS50b2dnbGU9ZnVuY3Rpb24oKXt2YXIgZT10aGlzLiRlbGVtZW50LmNsb3Nlc3QoJ1tkYXRhLXRvZ2dsZT1cImJ1dHRvbnMtcmFkaW9cIl0nKTtlJiZlLmZpbmQoXCIuYWN0aXZlXCIpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLHRoaXMuJGVsZW1lbnQudG9nZ2xlQ2xhc3MoXCJhY3RpdmVcIil9O3ZhciBuPWUuZm4uYnV0dG9uO2UuZm4uYnV0dG9uPWZ1bmN0aW9uKG4pe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgcj1lKHRoaXMpLGk9ci5kYXRhKFwiYnV0dG9uXCIpLHM9dHlwZW9mIG49PVwib2JqZWN0XCImJm47aXx8ci5kYXRhKFwiYnV0dG9uXCIsaT1uZXcgdCh0aGlzLHMpKSxuPT1cInRvZ2dsZVwiP2kudG9nZ2xlKCk6biYmaS5zZXRTdGF0ZShuKX0pfSxlLmZuLmJ1dHRvbi5kZWZhdWx0cz17bG9hZGluZ1RleHQ6XCJsb2FkaW5nLi4uXCJ9LGUuZm4uYnV0dG9uLkNvbnN0cnVjdG9yPXQsZS5mbi5idXR0b24ubm9Db25mbGljdD1mdW5jdGlvbigpe3JldHVybiBlLmZuLmJ1dHRvbj1uLHRoaXN9LGUoZG9jdW1lbnQpLm9uKFwiY2xpY2suYnV0dG9uLmRhdGEtYXBpXCIsXCJbZGF0YS10b2dnbGVePWJ1dHRvbl1cIixmdW5jdGlvbih0KXt2YXIgbj1lKHQudGFyZ2V0KTtuLmhhc0NsYXNzKFwiYnRuXCIpfHwobj1uLmNsb3Nlc3QoXCIuYnRuXCIpKSxuLmJ1dHRvbihcInRvZ2dsZVwiKX0pfSh3aW5kb3cualF1ZXJ5KSwhZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7dmFyIHQ9ZnVuY3Rpb24odCxuKXt0aGlzLiRlbGVtZW50PWUodCksdGhpcy4kaW5kaWNhdG9ycz10aGlzLiRlbGVtZW50LmZpbmQoXCIuY2Fyb3VzZWwtaW5kaWNhdG9yc1wiKSx0aGlzLm9wdGlvbnM9bix0aGlzLm9wdGlvbnMucGF1c2U9PVwiaG92ZXJcIiYmdGhpcy4kZWxlbWVudC5vbihcIm1vdXNlZW50ZXJcIixlLnByb3h5KHRoaXMucGF1c2UsdGhpcykpLm9uKFwibW91c2VsZWF2ZVwiLGUucHJveHkodGhpcy5jeWNsZSx0aGlzKSl9O3QucHJvdG90eXBlPXtjeWNsZTpmdW5jdGlvbih0KXtyZXR1cm4gdHx8KHRoaXMucGF1c2VkPSExKSx0aGlzLmludGVydmFsJiZjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpLHRoaXMub3B0aW9ucy5pbnRlcnZhbCYmIXRoaXMucGF1c2VkJiYodGhpcy5pbnRlcnZhbD1zZXRJbnRlcnZhbChlLnByb3h5KHRoaXMubmV4dCx0aGlzKSx0aGlzLm9wdGlvbnMuaW50ZXJ2YWwpKSx0aGlzfSxnZXRBY3RpdmVJbmRleDpmdW5jdGlvbigpe3JldHVybiB0aGlzLiRhY3RpdmU9dGhpcy4kZWxlbWVudC5maW5kKFwiLml0ZW0uYWN0aXZlXCIpLHRoaXMuJGl0ZW1zPXRoaXMuJGFjdGl2ZS5wYXJlbnQoKS5jaGlsZHJlbigpLHRoaXMuJGl0ZW1zLmluZGV4KHRoaXMuJGFjdGl2ZSl9LHRvOmZ1bmN0aW9uKHQpe3ZhciBuPXRoaXMuZ2V0QWN0aXZlSW5kZXgoKSxyPXRoaXM7aWYodD50aGlzLiRpdGVtcy5sZW5ndGgtMXx8dDwwKXJldHVybjtyZXR1cm4gdGhpcy5zbGlkaW5nP3RoaXMuJGVsZW1lbnQub25lKFwic2xpZFwiLGZ1bmN0aW9uKCl7ci50byh0KX0pOm49PXQ/dGhpcy5wYXVzZSgpLmN5Y2xlKCk6dGhpcy5zbGlkZSh0Pm4/XCJuZXh0XCI6XCJwcmV2XCIsZSh0aGlzLiRpdGVtc1t0XSkpfSxwYXVzZTpmdW5jdGlvbih0KXtyZXR1cm4gdHx8KHRoaXMucGF1c2VkPSEwKSx0aGlzLiRlbGVtZW50LmZpbmQoXCIubmV4dCwgLnByZXZcIikubGVuZ3RoJiZlLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQmJih0aGlzLiRlbGVtZW50LnRyaWdnZXIoZS5zdXBwb3J0LnRyYW5zaXRpb24uZW5kKSx0aGlzLmN5Y2xlKCEwKSksY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsKSx0aGlzLmludGVydmFsPW51bGwsdGhpc30sbmV4dDpmdW5jdGlvbigpe2lmKHRoaXMuc2xpZGluZylyZXR1cm47cmV0dXJuIHRoaXMuc2xpZGUoXCJuZXh0XCIpfSxwcmV2OmZ1bmN0aW9uKCl7aWYodGhpcy5zbGlkaW5nKXJldHVybjtyZXR1cm4gdGhpcy5zbGlkZShcInByZXZcIil9LHNsaWRlOmZ1bmN0aW9uKHQsbil7dmFyIHI9dGhpcy4kZWxlbWVudC5maW5kKFwiLml0ZW0uYWN0aXZlXCIpLGk9bnx8clt0XSgpLHM9dGhpcy5pbnRlcnZhbCxvPXQ9PVwibmV4dFwiP1wibGVmdFwiOlwicmlnaHRcIix1PXQ9PVwibmV4dFwiP1wiZmlyc3RcIjpcImxhc3RcIixhPXRoaXMsZjt0aGlzLnNsaWRpbmc9ITAscyYmdGhpcy5wYXVzZSgpLGk9aS5sZW5ndGg/aTp0aGlzLiRlbGVtZW50LmZpbmQoXCIuaXRlbVwiKVt1XSgpLGY9ZS5FdmVudChcInNsaWRlXCIse3JlbGF0ZWRUYXJnZXQ6aVswXSxkaXJlY3Rpb246b30pO2lmKGkuaGFzQ2xhc3MoXCJhY3RpdmVcIikpcmV0dXJuO3RoaXMuJGluZGljYXRvcnMubGVuZ3RoJiYodGhpcy4kaW5kaWNhdG9ycy5maW5kKFwiLmFjdGl2ZVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKSx0aGlzLiRlbGVtZW50Lm9uZShcInNsaWRcIixmdW5jdGlvbigpe3ZhciB0PWUoYS4kaW5kaWNhdG9ycy5jaGlsZHJlbigpW2EuZ2V0QWN0aXZlSW5kZXgoKV0pO3QmJnQuYWRkQ2xhc3MoXCJhY3RpdmVcIil9KSk7aWYoZS5zdXBwb3J0LnRyYW5zaXRpb24mJnRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoXCJzbGlkZVwiKSl7dGhpcy4kZWxlbWVudC50cmlnZ2VyKGYpO2lmKGYuaXNEZWZhdWx0UHJldmVudGVkKCkpcmV0dXJuO2kuYWRkQ2xhc3ModCksaVswXS5vZmZzZXRXaWR0aCxyLmFkZENsYXNzKG8pLGkuYWRkQ2xhc3MobyksdGhpcy4kZWxlbWVudC5vbmUoZS5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLGZ1bmN0aW9uKCl7aS5yZW1vdmVDbGFzcyhbdCxvXS5qb2luKFwiIFwiKSkuYWRkQ2xhc3MoXCJhY3RpdmVcIiksci5yZW1vdmVDbGFzcyhbXCJhY3RpdmVcIixvXS5qb2luKFwiIFwiKSksYS5zbGlkaW5nPSExLHNldFRpbWVvdXQoZnVuY3Rpb24oKXthLiRlbGVtZW50LnRyaWdnZXIoXCJzbGlkXCIpfSwwKX0pfWVsc2V7dGhpcy4kZWxlbWVudC50cmlnZ2VyKGYpO2lmKGYuaXNEZWZhdWx0UHJldmVudGVkKCkpcmV0dXJuO3IucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIiksaS5hZGRDbGFzcyhcImFjdGl2ZVwiKSx0aGlzLnNsaWRpbmc9ITEsdGhpcy4kZWxlbWVudC50cmlnZ2VyKFwic2xpZFwiKX1yZXR1cm4gcyYmdGhpcy5jeWNsZSgpLHRoaXN9fTt2YXIgbj1lLmZuLmNhcm91c2VsO2UuZm4uY2Fyb3VzZWw9ZnVuY3Rpb24obil7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciByPWUodGhpcyksaT1yLmRhdGEoXCJjYXJvdXNlbFwiKSxzPWUuZXh0ZW5kKHt9LGUuZm4uY2Fyb3VzZWwuZGVmYXVsdHMsdHlwZW9mIG49PVwib2JqZWN0XCImJm4pLG89dHlwZW9mIG49PVwic3RyaW5nXCI/bjpzLnNsaWRlO2l8fHIuZGF0YShcImNhcm91c2VsXCIsaT1uZXcgdCh0aGlzLHMpKSx0eXBlb2Ygbj09XCJudW1iZXJcIj9pLnRvKG4pOm8/aVtvXSgpOnMuaW50ZXJ2YWwmJmkucGF1c2UoKS5jeWNsZSgpfSl9LGUuZm4uY2Fyb3VzZWwuZGVmYXVsdHM9e2ludGVydmFsOjVlMyxwYXVzZTpcImhvdmVyXCJ9LGUuZm4uY2Fyb3VzZWwuQ29uc3RydWN0b3I9dCxlLmZuLmNhcm91c2VsLm5vQ29uZmxpY3Q9ZnVuY3Rpb24oKXtyZXR1cm4gZS5mbi5jYXJvdXNlbD1uLHRoaXN9LGUoZG9jdW1lbnQpLm9uKFwiY2xpY2suY2Fyb3VzZWwuZGF0YS1hcGlcIixcIltkYXRhLXNsaWRlXSwgW2RhdGEtc2xpZGUtdG9dXCIsZnVuY3Rpb24odCl7dmFyIG49ZSh0aGlzKSxyLGk9ZShuLmF0dHIoXCJkYXRhLXRhcmdldFwiKXx8KHI9bi5hdHRyKFwiaHJlZlwiKSkmJnIucmVwbGFjZSgvLiooPz0jW15cXHNdKyQpLyxcIlwiKSkscz1lLmV4dGVuZCh7fSxpLmRhdGEoKSxuLmRhdGEoKSksbztpLmNhcm91c2VsKHMpLChvPW4uYXR0cihcImRhdGEtc2xpZGUtdG9cIikpJiZpLmRhdGEoXCJjYXJvdXNlbFwiKS5wYXVzZSgpLnRvKG8pLmN5Y2xlKCksdC5wcmV2ZW50RGVmYXVsdCgpfSl9KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjt2YXIgdD1mdW5jdGlvbih0LG4pe3RoaXMuJGVsZW1lbnQ9ZSh0KSx0aGlzLm9wdGlvbnM9ZS5leHRlbmQoe30sZS5mbi5jb2xsYXBzZS5kZWZhdWx0cyxuKSx0aGlzLm9wdGlvbnMucGFyZW50JiYodGhpcy4kcGFyZW50PWUodGhpcy5vcHRpb25zLnBhcmVudCkpLHRoaXMub3B0aW9ucy50b2dnbGUmJnRoaXMudG9nZ2xlKCl9O3QucHJvdG90eXBlPXtjb25zdHJ1Y3Rvcjp0LGRpbWVuc2lvbjpmdW5jdGlvbigpe3ZhciBlPXRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoXCJ3aWR0aFwiKTtyZXR1cm4gZT9cIndpZHRoXCI6XCJoZWlnaHRcIn0sc2hvdzpmdW5jdGlvbigpe3ZhciB0LG4scixpO2lmKHRoaXMudHJhbnNpdGlvbmluZ3x8dGhpcy4kZWxlbWVudC5oYXNDbGFzcyhcImluXCIpKXJldHVybjt0PXRoaXMuZGltZW5zaW9uKCksbj1lLmNhbWVsQ2FzZShbXCJzY3JvbGxcIix0XS5qb2luKFwiLVwiKSkscj10aGlzLiRwYXJlbnQmJnRoaXMuJHBhcmVudC5maW5kKFwiPiAuYWNjb3JkaW9uLWdyb3VwID4gLmluXCIpO2lmKHImJnIubGVuZ3RoKXtpPXIuZGF0YShcImNvbGxhcHNlXCIpO2lmKGkmJmkudHJhbnNpdGlvbmluZylyZXR1cm47ci5jb2xsYXBzZShcImhpZGVcIiksaXx8ci5kYXRhKFwiY29sbGFwc2VcIixudWxsKX10aGlzLiRlbGVtZW50W3RdKDApLHRoaXMudHJhbnNpdGlvbihcImFkZENsYXNzXCIsZS5FdmVudChcInNob3dcIiksXCJzaG93blwiKSxlLnN1cHBvcnQudHJhbnNpdGlvbiYmdGhpcy4kZWxlbWVudFt0XSh0aGlzLiRlbGVtZW50WzBdW25dKX0saGlkZTpmdW5jdGlvbigpe3ZhciB0O2lmKHRoaXMudHJhbnNpdGlvbmluZ3x8IXRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoXCJpblwiKSlyZXR1cm47dD10aGlzLmRpbWVuc2lvbigpLHRoaXMucmVzZXQodGhpcy4kZWxlbWVudFt0XSgpKSx0aGlzLnRyYW5zaXRpb24oXCJyZW1vdmVDbGFzc1wiLGUuRXZlbnQoXCJoaWRlXCIpLFwiaGlkZGVuXCIpLHRoaXMuJGVsZW1lbnRbdF0oMCl9LHJlc2V0OmZ1bmN0aW9uKGUpe3ZhciB0PXRoaXMuZGltZW5zaW9uKCk7cmV0dXJuIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoXCJjb2xsYXBzZVwiKVt0XShlfHxcImF1dG9cIilbMF0ub2Zmc2V0V2lkdGgsdGhpcy4kZWxlbWVudFtlIT09bnVsbD9cImFkZENsYXNzXCI6XCJyZW1vdmVDbGFzc1wiXShcImNvbGxhcHNlXCIpLHRoaXN9LHRyYW5zaXRpb246ZnVuY3Rpb24odCxuLHIpe3ZhciBpPXRoaXMscz1mdW5jdGlvbigpe24udHlwZT09XCJzaG93XCImJmkucmVzZXQoKSxpLnRyYW5zaXRpb25pbmc9MCxpLiRlbGVtZW50LnRyaWdnZXIocil9O3RoaXMuJGVsZW1lbnQudHJpZ2dlcihuKTtpZihuLmlzRGVmYXVsdFByZXZlbnRlZCgpKXJldHVybjt0aGlzLnRyYW5zaXRpb25pbmc9MSx0aGlzLiRlbGVtZW50W3RdKFwiaW5cIiksZS5zdXBwb3J0LnRyYW5zaXRpb24mJnRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoXCJjb2xsYXBzZVwiKT90aGlzLiRlbGVtZW50Lm9uZShlLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQscyk6cygpfSx0b2dnbGU6ZnVuY3Rpb24oKXt0aGlzW3RoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoXCJpblwiKT9cImhpZGVcIjpcInNob3dcIl0oKX19O3ZhciBuPWUuZm4uY29sbGFwc2U7ZS5mbi5jb2xsYXBzZT1mdW5jdGlvbihuKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHI9ZSh0aGlzKSxpPXIuZGF0YShcImNvbGxhcHNlXCIpLHM9ZS5leHRlbmQoe30sZS5mbi5jb2xsYXBzZS5kZWZhdWx0cyxyLmRhdGEoKSx0eXBlb2Ygbj09XCJvYmplY3RcIiYmbik7aXx8ci5kYXRhKFwiY29sbGFwc2VcIixpPW5ldyB0KHRoaXMscykpLHR5cGVvZiBuPT1cInN0cmluZ1wiJiZpW25dKCl9KX0sZS5mbi5jb2xsYXBzZS5kZWZhdWx0cz17dG9nZ2xlOiEwfSxlLmZuLmNvbGxhcHNlLkNvbnN0cnVjdG9yPXQsZS5mbi5jb2xsYXBzZS5ub0NvbmZsaWN0PWZ1bmN0aW9uKCl7cmV0dXJuIGUuZm4uY29sbGFwc2U9bix0aGlzfSxlKGRvY3VtZW50KS5vbihcImNsaWNrLmNvbGxhcHNlLmRhdGEtYXBpXCIsXCJbZGF0YS10b2dnbGU9Y29sbGFwc2VdXCIsZnVuY3Rpb24odCl7dmFyIG49ZSh0aGlzKSxyLGk9bi5hdHRyKFwiZGF0YS10YXJnZXRcIil8fHQucHJldmVudERlZmF1bHQoKXx8KHI9bi5hdHRyKFwiaHJlZlwiKSkmJnIucmVwbGFjZSgvLiooPz0jW15cXHNdKyQpLyxcIlwiKSxzPWUoaSkuZGF0YShcImNvbGxhcHNlXCIpP1widG9nZ2xlXCI6bi5kYXRhKCk7bltlKGkpLmhhc0NsYXNzKFwiaW5cIik/XCJhZGRDbGFzc1wiOlwicmVtb3ZlQ2xhc3NcIl0oXCJjb2xsYXBzZWRcIiksZShpKS5jb2xsYXBzZShzKX0pfSh3aW5kb3cualF1ZXJ5KSwhZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcigpe2UodCkuZWFjaChmdW5jdGlvbigpe2koZSh0aGlzKSkucmVtb3ZlQ2xhc3MoXCJvcGVuXCIpfSl9ZnVuY3Rpb24gaSh0KXt2YXIgbj10LmF0dHIoXCJkYXRhLXRhcmdldFwiKSxyO258fChuPXQuYXR0cihcImhyZWZcIiksbj1uJiYvIy8udGVzdChuKSYmbi5yZXBsYWNlKC8uKig/PSNbXlxcc10qJCkvLFwiXCIpKSxyPW4mJmUobik7aWYoIXJ8fCFyLmxlbmd0aClyPXQucGFyZW50KCk7cmV0dXJuIHJ9dmFyIHQ9XCJbZGF0YS10b2dnbGU9ZHJvcGRvd25dXCIsbj1mdW5jdGlvbih0KXt2YXIgbj1lKHQpLm9uKFwiY2xpY2suZHJvcGRvd24uZGF0YS1hcGlcIix0aGlzLnRvZ2dsZSk7ZShcImh0bWxcIikub24oXCJjbGljay5kcm9wZG93bi5kYXRhLWFwaVwiLGZ1bmN0aW9uKCl7bi5wYXJlbnQoKS5yZW1vdmVDbGFzcyhcIm9wZW5cIil9KX07bi5wcm90b3R5cGU9e2NvbnN0cnVjdG9yOm4sdG9nZ2xlOmZ1bmN0aW9uKHQpe3ZhciBuPWUodGhpcykscyxvO2lmKG4uaXMoXCIuZGlzYWJsZWQsIDpkaXNhYmxlZFwiKSlyZXR1cm47cmV0dXJuIHM9aShuKSxvPXMuaGFzQ2xhc3MoXCJvcGVuXCIpLHIoKSxvfHxzLnRvZ2dsZUNsYXNzKFwib3BlblwiKSxuLmZvY3VzKCksITF9LGtleWRvd246ZnVuY3Rpb24obil7dmFyIHIscyxvLHUsYSxmO2lmKCEvKDM4fDQwfDI3KS8udGVzdChuLmtleUNvZGUpKXJldHVybjtyPWUodGhpcyksbi5wcmV2ZW50RGVmYXVsdCgpLG4uc3RvcFByb3BhZ2F0aW9uKCk7aWYoci5pcyhcIi5kaXNhYmxlZCwgOmRpc2FibGVkXCIpKXJldHVybjt1PWkociksYT11Lmhhc0NsYXNzKFwib3BlblwiKTtpZighYXx8YSYmbi5rZXlDb2RlPT0yNylyZXR1cm4gbi53aGljaD09MjcmJnUuZmluZCh0KS5mb2N1cygpLHIuY2xpY2soKTtzPWUoXCJbcm9sZT1tZW51XSBsaTpub3QoLmRpdmlkZXIpOnZpc2libGUgYVwiLHUpO2lmKCFzLmxlbmd0aClyZXR1cm47Zj1zLmluZGV4KHMuZmlsdGVyKFwiOmZvY3VzXCIpKSxuLmtleUNvZGU9PTM4JiZmPjAmJmYtLSxuLmtleUNvZGU9PTQwJiZmPHMubGVuZ3RoLTEmJmYrKyx+Znx8KGY9MCkscy5lcShmKS5mb2N1cygpfX07dmFyIHM9ZS5mbi5kcm9wZG93bjtlLmZuLmRyb3Bkb3duPWZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgcj1lKHRoaXMpLGk9ci5kYXRhKFwiZHJvcGRvd25cIik7aXx8ci5kYXRhKFwiZHJvcGRvd25cIixpPW5ldyBuKHRoaXMpKSx0eXBlb2YgdD09XCJzdHJpbmdcIiYmaVt0XS5jYWxsKHIpfSl9LGUuZm4uZHJvcGRvd24uQ29uc3RydWN0b3I9bixlLmZuLmRyb3Bkb3duLm5vQ29uZmxpY3Q9ZnVuY3Rpb24oKXtyZXR1cm4gZS5mbi5kcm9wZG93bj1zLHRoaXN9LGUoZG9jdW1lbnQpLm9uKFwiY2xpY2suZHJvcGRvd24uZGF0YS1hcGlcIixyKS5vbihcImNsaWNrLmRyb3Bkb3duLmRhdGEtYXBpXCIsXCIuZHJvcGRvd24gZm9ybVwiLGZ1bmN0aW9uKGUpe2Uuc3RvcFByb3BhZ2F0aW9uKCl9KS5vbihcImNsaWNrLmRyb3Bkb3duLW1lbnVcIixmdW5jdGlvbihlKXtlLnN0b3BQcm9wYWdhdGlvbigpfSkub24oXCJjbGljay5kcm9wZG93bi5kYXRhLWFwaVwiLHQsbi5wcm90b3R5cGUudG9nZ2xlKS5vbihcImtleWRvd24uZHJvcGRvd24uZGF0YS1hcGlcIix0K1wiLCBbcm9sZT1tZW51XVwiLG4ucHJvdG90eXBlLmtleWRvd24pfSh3aW5kb3cualF1ZXJ5KSwhZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7dmFyIHQ9ZnVuY3Rpb24odCxuKXt0aGlzLm9wdGlvbnM9bix0aGlzLiRlbGVtZW50PWUodCkuZGVsZWdhdGUoJ1tkYXRhLWRpc21pc3M9XCJtb2RhbFwiXScsXCJjbGljay5kaXNtaXNzLm1vZGFsXCIsZS5wcm94eSh0aGlzLmhpZGUsdGhpcykpLHRoaXMub3B0aW9ucy5yZW1vdGUmJnRoaXMuJGVsZW1lbnQuZmluZChcIi5tb2RhbC1ib2R5XCIpLmxvYWQodGhpcy5vcHRpb25zLnJlbW90ZSl9O3QucHJvdG90eXBlPXtjb25zdHJ1Y3Rvcjp0LHRvZ2dsZTpmdW5jdGlvbigpe3JldHVybiB0aGlzW3RoaXMuaXNTaG93bj9cImhpZGVcIjpcInNob3dcIl0oKX0sc2hvdzpmdW5jdGlvbigpe3ZhciB0PXRoaXMsbj1lLkV2ZW50KFwic2hvd1wiKTt0aGlzLiRlbGVtZW50LnRyaWdnZXIobik7aWYodGhpcy5pc1Nob3dufHxuLmlzRGVmYXVsdFByZXZlbnRlZCgpKXJldHVybjt0aGlzLmlzU2hvd249ITAsdGhpcy5lc2NhcGUoKSx0aGlzLmJhY2tkcm9wKGZ1bmN0aW9uKCl7dmFyIG49ZS5zdXBwb3J0LnRyYW5zaXRpb24mJnQuJGVsZW1lbnQuaGFzQ2xhc3MoXCJmYWRlXCIpO3QuJGVsZW1lbnQucGFyZW50KCkubGVuZ3RofHx0LiRlbGVtZW50LmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpLHQuJGVsZW1lbnQuc2hvdygpLG4mJnQuJGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGgsdC4kZWxlbWVudC5hZGRDbGFzcyhcImluXCIpLmF0dHIoXCJhcmlhLWhpZGRlblwiLCExKSx0LmVuZm9yY2VGb2N1cygpLG4/dC4kZWxlbWVudC5vbmUoZS5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLGZ1bmN0aW9uKCl7dC4kZWxlbWVudC5mb2N1cygpLnRyaWdnZXIoXCJzaG93blwiKX0pOnQuJGVsZW1lbnQuZm9jdXMoKS50cmlnZ2VyKFwic2hvd25cIil9KX0saGlkZTpmdW5jdGlvbih0KXt0JiZ0LnByZXZlbnREZWZhdWx0KCk7dmFyIG49dGhpczt0PWUuRXZlbnQoXCJoaWRlXCIpLHRoaXMuJGVsZW1lbnQudHJpZ2dlcih0KTtpZighdGhpcy5pc1Nob3dufHx0LmlzRGVmYXVsdFByZXZlbnRlZCgpKXJldHVybjt0aGlzLmlzU2hvd249ITEsdGhpcy5lc2NhcGUoKSxlKGRvY3VtZW50KS5vZmYoXCJmb2N1c2luLm1vZGFsXCIpLHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoXCJpblwiKS5hdHRyKFwiYXJpYS1oaWRkZW5cIiwhMCksZS5zdXBwb3J0LnRyYW5zaXRpb24mJnRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoXCJmYWRlXCIpP3RoaXMuaGlkZVdpdGhUcmFuc2l0aW9uKCk6dGhpcy5oaWRlTW9kYWwoKX0sZW5mb3JjZUZvY3VzOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcztlKGRvY3VtZW50KS5vbihcImZvY3VzaW4ubW9kYWxcIixmdW5jdGlvbihlKXt0LiRlbGVtZW50WzBdIT09ZS50YXJnZXQmJiF0LiRlbGVtZW50LmhhcyhlLnRhcmdldCkubGVuZ3RoJiZ0LiRlbGVtZW50LmZvY3VzKCl9KX0sZXNjYXBlOmZ1bmN0aW9uKCl7dmFyIGU9dGhpczt0aGlzLmlzU2hvd24mJnRoaXMub3B0aW9ucy5rZXlib2FyZD90aGlzLiRlbGVtZW50Lm9uKFwia2V5dXAuZGlzbWlzcy5tb2RhbFwiLGZ1bmN0aW9uKHQpe3Qud2hpY2g9PTI3JiZlLmhpZGUoKX0pOnRoaXMuaXNTaG93bnx8dGhpcy4kZWxlbWVudC5vZmYoXCJrZXl1cC5kaXNtaXNzLm1vZGFsXCIpfSxoaWRlV2l0aFRyYW5zaXRpb246ZnVuY3Rpb24oKXt2YXIgdD10aGlzLG49c2V0VGltZW91dChmdW5jdGlvbigpe3QuJGVsZW1lbnQub2ZmKGUuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCksdC5oaWRlTW9kYWwoKX0sNTAwKTt0aGlzLiRlbGVtZW50Lm9uZShlLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsZnVuY3Rpb24oKXtjbGVhclRpbWVvdXQobiksdC5oaWRlTW9kYWwoKX0pfSxoaWRlTW9kYWw6ZnVuY3Rpb24oKXt2YXIgZT10aGlzO3RoaXMuJGVsZW1lbnQuaGlkZSgpLHRoaXMuYmFja2Ryb3AoZnVuY3Rpb24oKXtlLnJlbW92ZUJhY2tkcm9wKCksZS4kZWxlbWVudC50cmlnZ2VyKFwiaGlkZGVuXCIpfSl9LHJlbW92ZUJhY2tkcm9wOmZ1bmN0aW9uKCl7dGhpcy4kYmFja2Ryb3AmJnRoaXMuJGJhY2tkcm9wLnJlbW92ZSgpLHRoaXMuJGJhY2tkcm9wPW51bGx9LGJhY2tkcm9wOmZ1bmN0aW9uKHQpe3ZhciBuPXRoaXMscj10aGlzLiRlbGVtZW50Lmhhc0NsYXNzKFwiZmFkZVwiKT9cImZhZGVcIjpcIlwiO2lmKHRoaXMuaXNTaG93biYmdGhpcy5vcHRpb25zLmJhY2tkcm9wKXt2YXIgaT1lLnN1cHBvcnQudHJhbnNpdGlvbiYmcjt0aGlzLiRiYWNrZHJvcD1lKCc8ZGl2IGNsYXNzPVwibW9kYWwtYmFja2Ryb3AgJytyKydcIiAvPicpLmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpLHRoaXMuJGJhY2tkcm9wLmNsaWNrKHRoaXMub3B0aW9ucy5iYWNrZHJvcD09XCJzdGF0aWNcIj9lLnByb3h5KHRoaXMuJGVsZW1lbnRbMF0uZm9jdXMsdGhpcy4kZWxlbWVudFswXSk6ZS5wcm94eSh0aGlzLmhpZGUsdGhpcykpLGkmJnRoaXMuJGJhY2tkcm9wWzBdLm9mZnNldFdpZHRoLHRoaXMuJGJhY2tkcm9wLmFkZENsYXNzKFwiaW5cIik7aWYoIXQpcmV0dXJuO2k/dGhpcy4kYmFja2Ryb3Aub25lKGUuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCx0KTp0KCl9ZWxzZSF0aGlzLmlzU2hvd24mJnRoaXMuJGJhY2tkcm9wPyh0aGlzLiRiYWNrZHJvcC5yZW1vdmVDbGFzcyhcImluXCIpLGUuc3VwcG9ydC50cmFuc2l0aW9uJiZ0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKFwiZmFkZVwiKT90aGlzLiRiYWNrZHJvcC5vbmUoZS5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLHQpOnQoKSk6dCYmdCgpfX07dmFyIG49ZS5mbi5tb2RhbDtlLmZuLm1vZGFsPWZ1bmN0aW9uKG4pe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgcj1lKHRoaXMpLGk9ci5kYXRhKFwibW9kYWxcIikscz1lLmV4dGVuZCh7fSxlLmZuLm1vZGFsLmRlZmF1bHRzLHIuZGF0YSgpLHR5cGVvZiBuPT1cIm9iamVjdFwiJiZuKTtpfHxyLmRhdGEoXCJtb2RhbFwiLGk9bmV3IHQodGhpcyxzKSksdHlwZW9mIG49PVwic3RyaW5nXCI/aVtuXSgpOnMuc2hvdyYmaS5zaG93KCl9KX0sZS5mbi5tb2RhbC5kZWZhdWx0cz17YmFja2Ryb3A6ITAsa2V5Ym9hcmQ6ITAsc2hvdzohMH0sZS5mbi5tb2RhbC5Db25zdHJ1Y3Rvcj10LGUuZm4ubW9kYWwubm9Db25mbGljdD1mdW5jdGlvbigpe3JldHVybiBlLmZuLm1vZGFsPW4sdGhpc30sZShkb2N1bWVudCkub24oXCJjbGljay5tb2RhbC5kYXRhLWFwaVwiLCdbZGF0YS10b2dnbGU9XCJtb2RhbFwiXScsZnVuY3Rpb24odCl7dmFyIG49ZSh0aGlzKSxyPW4uYXR0cihcImhyZWZcIiksaT1lKG4uYXR0cihcImRhdGEtdGFyZ2V0XCIpfHxyJiZyLnJlcGxhY2UoLy4qKD89I1teXFxzXSskKS8sXCJcIikpLHM9aS5kYXRhKFwibW9kYWxcIik/XCJ0b2dnbGVcIjplLmV4dGVuZCh7cmVtb3RlOiEvIy8udGVzdChyKSYmcn0saS5kYXRhKCksbi5kYXRhKCkpO3QucHJldmVudERlZmF1bHQoKSxpLm1vZGFsKHMpLm9uZShcImhpZGVcIixmdW5jdGlvbigpe24uZm9jdXMoKX0pfSl9KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjt2YXIgdD1mdW5jdGlvbihlLHQpe3RoaXMuaW5pdChcInRvb2x0aXBcIixlLHQpfTt0LnByb3RvdHlwZT17Y29uc3RydWN0b3I6dCxpbml0OmZ1bmN0aW9uKHQsbixyKXt2YXIgaSxzLG8sdSxhO3RoaXMudHlwZT10LHRoaXMuJGVsZW1lbnQ9ZShuKSx0aGlzLm9wdGlvbnM9dGhpcy5nZXRPcHRpb25zKHIpLHRoaXMuZW5hYmxlZD0hMCxvPXRoaXMub3B0aW9ucy50cmlnZ2VyLnNwbGl0KFwiIFwiKTtmb3IoYT1vLmxlbmd0aDthLS07KXU9b1thXSx1PT1cImNsaWNrXCI/dGhpcy4kZWxlbWVudC5vbihcImNsaWNrLlwiK3RoaXMudHlwZSx0aGlzLm9wdGlvbnMuc2VsZWN0b3IsZS5wcm94eSh0aGlzLnRvZ2dsZSx0aGlzKSk6dSE9XCJtYW51YWxcIiYmKGk9dT09XCJob3ZlclwiP1wibW91c2VlbnRlclwiOlwiZm9jdXNcIixzPXU9PVwiaG92ZXJcIj9cIm1vdXNlbGVhdmVcIjpcImJsdXJcIix0aGlzLiRlbGVtZW50Lm9uKGkrXCIuXCIrdGhpcy50eXBlLHRoaXMub3B0aW9ucy5zZWxlY3RvcixlLnByb3h5KHRoaXMuZW50ZXIsdGhpcykpLHRoaXMuJGVsZW1lbnQub24ocytcIi5cIit0aGlzLnR5cGUsdGhpcy5vcHRpb25zLnNlbGVjdG9yLGUucHJveHkodGhpcy5sZWF2ZSx0aGlzKSkpO3RoaXMub3B0aW9ucy5zZWxlY3Rvcj90aGlzLl9vcHRpb25zPWUuZXh0ZW5kKHt9LHRoaXMub3B0aW9ucyx7dHJpZ2dlcjpcIm1hbnVhbFwiLHNlbGVjdG9yOlwiXCJ9KTp0aGlzLmZpeFRpdGxlKCl9LGdldE9wdGlvbnM6ZnVuY3Rpb24odCl7cmV0dXJuIHQ9ZS5leHRlbmQoe30sZS5mblt0aGlzLnR5cGVdLmRlZmF1bHRzLHRoaXMuJGVsZW1lbnQuZGF0YSgpLHQpLHQuZGVsYXkmJnR5cGVvZiB0LmRlbGF5PT1cIm51bWJlclwiJiYodC5kZWxheT17c2hvdzp0LmRlbGF5LGhpZGU6dC5kZWxheX0pLHR9LGVudGVyOmZ1bmN0aW9uKHQpe3ZhciBuPWUuZm5bdGhpcy50eXBlXS5kZWZhdWx0cyxyPXt9LGk7dGhpcy5fb3B0aW9ucyYmZS5lYWNoKHRoaXMuX29wdGlvbnMsZnVuY3Rpb24oZSx0KXtuW2VdIT10JiYocltlXT10KX0sdGhpcyksaT1lKHQuY3VycmVudFRhcmdldClbdGhpcy50eXBlXShyKS5kYXRhKHRoaXMudHlwZSk7aWYoIWkub3B0aW9ucy5kZWxheXx8IWkub3B0aW9ucy5kZWxheS5zaG93KXJldHVybiBpLnNob3coKTtjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KSxpLmhvdmVyU3RhdGU9XCJpblwiLHRoaXMudGltZW91dD1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7aS5ob3ZlclN0YXRlPT1cImluXCImJmkuc2hvdygpfSxpLm9wdGlvbnMuZGVsYXkuc2hvdyl9LGxlYXZlOmZ1bmN0aW9uKHQpe3ZhciBuPWUodC5jdXJyZW50VGFyZ2V0KVt0aGlzLnR5cGVdKHRoaXMuX29wdGlvbnMpLmRhdGEodGhpcy50eXBlKTt0aGlzLnRpbWVvdXQmJmNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO2lmKCFuLm9wdGlvbnMuZGVsYXl8fCFuLm9wdGlvbnMuZGVsYXkuaGlkZSlyZXR1cm4gbi5oaWRlKCk7bi5ob3ZlclN0YXRlPVwib3V0XCIsdGhpcy50aW1lb3V0PXNldFRpbWVvdXQoZnVuY3Rpb24oKXtuLmhvdmVyU3RhdGU9PVwib3V0XCImJm4uaGlkZSgpfSxuLm9wdGlvbnMuZGVsYXkuaGlkZSl9LHNob3c6ZnVuY3Rpb24oKXt2YXIgdCxuLHIsaSxzLG8sdT1lLkV2ZW50KFwic2hvd1wiKTtpZih0aGlzLmhhc0NvbnRlbnQoKSYmdGhpcy5lbmFibGVkKXt0aGlzLiRlbGVtZW50LnRyaWdnZXIodSk7aWYodS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSlyZXR1cm47dD10aGlzLnRpcCgpLHRoaXMuc2V0Q29udGVudCgpLHRoaXMub3B0aW9ucy5hbmltYXRpb24mJnQuYWRkQ2xhc3MoXCJmYWRlXCIpLHM9dHlwZW9mIHRoaXMub3B0aW9ucy5wbGFjZW1lbnQ9PVwiZnVuY3Rpb25cIj90aGlzLm9wdGlvbnMucGxhY2VtZW50LmNhbGwodGhpcyx0WzBdLHRoaXMuJGVsZW1lbnRbMF0pOnRoaXMub3B0aW9ucy5wbGFjZW1lbnQsdC5kZXRhY2goKS5jc3Moe3RvcDowLGxlZnQ6MCxkaXNwbGF5OlwiYmxvY2tcIn0pLHRoaXMub3B0aW9ucy5jb250YWluZXI/dC5hcHBlbmRUbyh0aGlzLm9wdGlvbnMuY29udGFpbmVyKTp0Lmluc2VydEFmdGVyKHRoaXMuJGVsZW1lbnQpLG49dGhpcy5nZXRQb3NpdGlvbigpLHI9dFswXS5vZmZzZXRXaWR0aCxpPXRbMF0ub2Zmc2V0SGVpZ2h0O3N3aXRjaChzKXtjYXNlXCJib3R0b21cIjpvPXt0b3A6bi50b3Arbi5oZWlnaHQsbGVmdDpuLmxlZnQrbi53aWR0aC8yLXIvMn07YnJlYWs7Y2FzZVwidG9wXCI6bz17dG9wOm4udG9wLWksbGVmdDpuLmxlZnQrbi53aWR0aC8yLXIvMn07YnJlYWs7Y2FzZVwibGVmdFwiOm89e3RvcDpuLnRvcCtuLmhlaWdodC8yLWkvMixsZWZ0Om4ubGVmdC1yfTticmVhaztjYXNlXCJyaWdodFwiOm89e3RvcDpuLnRvcCtuLmhlaWdodC8yLWkvMixsZWZ0Om4ubGVmdCtuLndpZHRofX10aGlzLmFwcGx5UGxhY2VtZW50KG8scyksdGhpcy4kZWxlbWVudC50cmlnZ2VyKFwic2hvd25cIil9fSxhcHBseVBsYWNlbWVudDpmdW5jdGlvbihlLHQpe3ZhciBuPXRoaXMudGlwKCkscj1uWzBdLm9mZnNldFdpZHRoLGk9blswXS5vZmZzZXRIZWlnaHQscyxvLHUsYTtuLm9mZnNldChlKS5hZGRDbGFzcyh0KS5hZGRDbGFzcyhcImluXCIpLHM9blswXS5vZmZzZXRXaWR0aCxvPW5bMF0ub2Zmc2V0SGVpZ2h0LHQ9PVwidG9wXCImJm8hPWkmJihlLnRvcD1lLnRvcCtpLW8sYT0hMCksdD09XCJib3R0b21cInx8dD09XCJ0b3BcIj8odT0wLGUubGVmdDwwJiYodT1lLmxlZnQqLTIsZS5sZWZ0PTAsbi5vZmZzZXQoZSkscz1uWzBdLm9mZnNldFdpZHRoLG89blswXS5vZmZzZXRIZWlnaHQpLHRoaXMucmVwbGFjZUFycm93KHUtcitzLHMsXCJsZWZ0XCIpKTp0aGlzLnJlcGxhY2VBcnJvdyhvLWksbyxcInRvcFwiKSxhJiZuLm9mZnNldChlKX0scmVwbGFjZUFycm93OmZ1bmN0aW9uKGUsdCxuKXt0aGlzLmFycm93KCkuY3NzKG4sZT81MCooMS1lL3QpK1wiJVwiOlwiXCIpfSxzZXRDb250ZW50OmZ1bmN0aW9uKCl7dmFyIGU9dGhpcy50aXAoKSx0PXRoaXMuZ2V0VGl0bGUoKTtlLmZpbmQoXCIudG9vbHRpcC1pbm5lclwiKVt0aGlzLm9wdGlvbnMuaHRtbD9cImh0bWxcIjpcInRleHRcIl0odCksZS5yZW1vdmVDbGFzcyhcImZhZGUgaW4gdG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpfSxoaWRlOmZ1bmN0aW9uKCl7ZnVuY3Rpb24gaSgpe3ZhciB0PXNldFRpbWVvdXQoZnVuY3Rpb24oKXtuLm9mZihlLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQpLmRldGFjaCgpfSw1MDApO24ub25lKGUuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCxmdW5jdGlvbigpe2NsZWFyVGltZW91dCh0KSxuLmRldGFjaCgpfSl9dmFyIHQ9dGhpcyxuPXRoaXMudGlwKCkscj1lLkV2ZW50KFwiaGlkZVwiKTt0aGlzLiRlbGVtZW50LnRyaWdnZXIocik7aWYoci5pc0RlZmF1bHRQcmV2ZW50ZWQoKSlyZXR1cm47cmV0dXJuIG4ucmVtb3ZlQ2xhc3MoXCJpblwiKSxlLnN1cHBvcnQudHJhbnNpdGlvbiYmdGhpcy4kdGlwLmhhc0NsYXNzKFwiZmFkZVwiKT9pKCk6bi5kZXRhY2goKSx0aGlzLiRlbGVtZW50LnRyaWdnZXIoXCJoaWRkZW5cIiksdGhpc30sZml4VGl0bGU6ZnVuY3Rpb24oKXt2YXIgZT10aGlzLiRlbGVtZW50OyhlLmF0dHIoXCJ0aXRsZVwiKXx8dHlwZW9mIGUuYXR0cihcImRhdGEtb3JpZ2luYWwtdGl0bGVcIikhPVwic3RyaW5nXCIpJiZlLmF0dHIoXCJkYXRhLW9yaWdpbmFsLXRpdGxlXCIsZS5hdHRyKFwidGl0bGVcIil8fFwiXCIpLmF0dHIoXCJ0aXRsZVwiLFwiXCIpfSxoYXNDb250ZW50OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZ2V0VGl0bGUoKX0sZ2V0UG9zaXRpb246ZnVuY3Rpb24oKXt2YXIgdD10aGlzLiRlbGVtZW50WzBdO3JldHVybiBlLmV4dGVuZCh7fSx0eXBlb2YgdC5nZXRCb3VuZGluZ0NsaWVudFJlY3Q9PVwiZnVuY3Rpb25cIj90LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpOnt3aWR0aDp0Lm9mZnNldFdpZHRoLGhlaWdodDp0Lm9mZnNldEhlaWdodH0sdGhpcy4kZWxlbWVudC5vZmZzZXQoKSl9LGdldFRpdGxlOmZ1bmN0aW9uKCl7dmFyIGUsdD10aGlzLiRlbGVtZW50LG49dGhpcy5vcHRpb25zO3JldHVybiBlPXQuYXR0cihcImRhdGEtb3JpZ2luYWwtdGl0bGVcIil8fCh0eXBlb2Ygbi50aXRsZT09XCJmdW5jdGlvblwiP24udGl0bGUuY2FsbCh0WzBdKTpuLnRpdGxlKSxlfSx0aXA6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy4kdGlwPXRoaXMuJHRpcHx8ZSh0aGlzLm9wdGlvbnMudGVtcGxhdGUpfSxhcnJvdzpmdW5jdGlvbigpe3JldHVybiB0aGlzLiRhcnJvdz10aGlzLiRhcnJvd3x8dGhpcy50aXAoKS5maW5kKFwiLnRvb2x0aXAtYXJyb3dcIil9LHZhbGlkYXRlOmZ1bmN0aW9uKCl7dGhpcy4kZWxlbWVudFswXS5wYXJlbnROb2RlfHwodGhpcy5oaWRlKCksdGhpcy4kZWxlbWVudD1udWxsLHRoaXMub3B0aW9ucz1udWxsKX0sZW5hYmxlOmZ1bmN0aW9uKCl7dGhpcy5lbmFibGVkPSEwfSxkaXNhYmxlOmZ1bmN0aW9uKCl7dGhpcy5lbmFibGVkPSExfSx0b2dnbGVFbmFibGVkOmZ1bmN0aW9uKCl7dGhpcy5lbmFibGVkPSF0aGlzLmVuYWJsZWR9LHRvZ2dsZTpmdW5jdGlvbih0KXt2YXIgbj10P2UodC5jdXJyZW50VGFyZ2V0KVt0aGlzLnR5cGVdKHRoaXMuX29wdGlvbnMpLmRhdGEodGhpcy50eXBlKTp0aGlzO24udGlwKCkuaGFzQ2xhc3MoXCJpblwiKT9uLmhpZGUoKTpuLnNob3coKX0sZGVzdHJveTpmdW5jdGlvbigpe3RoaXMuaGlkZSgpLiRlbGVtZW50Lm9mZihcIi5cIit0aGlzLnR5cGUpLnJlbW92ZURhdGEodGhpcy50eXBlKX19O3ZhciBuPWUuZm4udG9vbHRpcDtlLmZuLnRvb2x0aXA9ZnVuY3Rpb24obil7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciByPWUodGhpcyksaT1yLmRhdGEoXCJ0b29sdGlwXCIpLHM9dHlwZW9mIG49PVwib2JqZWN0XCImJm47aXx8ci5kYXRhKFwidG9vbHRpcFwiLGk9bmV3IHQodGhpcyxzKSksdHlwZW9mIG49PVwic3RyaW5nXCImJmlbbl0oKX0pfSxlLmZuLnRvb2x0aXAuQ29uc3RydWN0b3I9dCxlLmZuLnRvb2x0aXAuZGVmYXVsdHM9e2FuaW1hdGlvbjohMCxwbGFjZW1lbnQ6XCJ0b3BcIixzZWxlY3RvcjohMSx0ZW1wbGF0ZTonPGRpdiBjbGFzcz1cInRvb2x0aXBcIj48ZGl2IGNsYXNzPVwidG9vbHRpcC1hcnJvd1wiPjwvZGl2PjxkaXYgY2xhc3M9XCJ0b29sdGlwLWlubmVyXCI+PC9kaXY+PC9kaXY+Jyx0cmlnZ2VyOlwiaG92ZXIgZm9jdXNcIix0aXRsZTpcIlwiLGRlbGF5OjAsaHRtbDohMSxjb250YWluZXI6ITF9LGUuZm4udG9vbHRpcC5ub0NvbmZsaWN0PWZ1bmN0aW9uKCl7cmV0dXJuIGUuZm4udG9vbHRpcD1uLHRoaXN9fSh3aW5kb3cualF1ZXJ5KSwhZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7dmFyIHQ9ZnVuY3Rpb24oZSx0KXt0aGlzLmluaXQoXCJwb3BvdmVyXCIsZSx0KX07dC5wcm90b3R5cGU9ZS5leHRlbmQoe30sZS5mbi50b29sdGlwLkNvbnN0cnVjdG9yLnByb3RvdHlwZSx7Y29uc3RydWN0b3I6dCxzZXRDb250ZW50OmZ1bmN0aW9uKCl7dmFyIGU9dGhpcy50aXAoKSx0PXRoaXMuZ2V0VGl0bGUoKSxuPXRoaXMuZ2V0Q29udGVudCgpO2UuZmluZChcIi5wb3BvdmVyLXRpdGxlXCIpW3RoaXMub3B0aW9ucy5odG1sP1wiaHRtbFwiOlwidGV4dFwiXSh0KSxlLmZpbmQoXCIucG9wb3Zlci1jb250ZW50XCIpW3RoaXMub3B0aW9ucy5odG1sP1wiaHRtbFwiOlwidGV4dFwiXShuKSxlLnJlbW92ZUNsYXNzKFwiZmFkZSB0b3AgYm90dG9tIGxlZnQgcmlnaHQgaW5cIil9LGhhc0NvbnRlbnQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5nZXRUaXRsZSgpfHx0aGlzLmdldENvbnRlbnQoKX0sZ2V0Q29udGVudDpmdW5jdGlvbigpe3ZhciBlLHQ9dGhpcy4kZWxlbWVudCxuPXRoaXMub3B0aW9ucztyZXR1cm4gZT0odHlwZW9mIG4uY29udGVudD09XCJmdW5jdGlvblwiP24uY29udGVudC5jYWxsKHRbMF0pOm4uY29udGVudCl8fHQuYXR0cihcImRhdGEtY29udGVudFwiKSxlfSx0aXA6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy4kdGlwfHwodGhpcy4kdGlwPWUodGhpcy5vcHRpb25zLnRlbXBsYXRlKSksdGhpcy4kdGlwfSxkZXN0cm95OmZ1bmN0aW9uKCl7dGhpcy5oaWRlKCkuJGVsZW1lbnQub2ZmKFwiLlwiK3RoaXMudHlwZSkucmVtb3ZlRGF0YSh0aGlzLnR5cGUpfX0pO3ZhciBuPWUuZm4ucG9wb3ZlcjtlLmZuLnBvcG92ZXI9ZnVuY3Rpb24obil7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciByPWUodGhpcyksaT1yLmRhdGEoXCJwb3BvdmVyXCIpLHM9dHlwZW9mIG49PVwib2JqZWN0XCImJm47aXx8ci5kYXRhKFwicG9wb3ZlclwiLGk9bmV3IHQodGhpcyxzKSksdHlwZW9mIG49PVwic3RyaW5nXCImJmlbbl0oKX0pfSxlLmZuLnBvcG92ZXIuQ29uc3RydWN0b3I9dCxlLmZuLnBvcG92ZXIuZGVmYXVsdHM9ZS5leHRlbmQoe30sZS5mbi50b29sdGlwLmRlZmF1bHRzLHtwbGFjZW1lbnQ6XCJyaWdodFwiLHRyaWdnZXI6XCJjbGlja1wiLGNvbnRlbnQ6XCJcIix0ZW1wbGF0ZTonPGRpdiBjbGFzcz1cInBvcG92ZXJcIj48ZGl2IGNsYXNzPVwiYXJyb3dcIj48L2Rpdj48aDMgY2xhc3M9XCJwb3BvdmVyLXRpdGxlXCI+PC9oMz48ZGl2IGNsYXNzPVwicG9wb3Zlci1jb250ZW50XCI+PC9kaXY+PC9kaXY+J30pLGUuZm4ucG9wb3Zlci5ub0NvbmZsaWN0PWZ1bmN0aW9uKCl7cmV0dXJuIGUuZm4ucG9wb3Zlcj1uLHRoaXN9fSh3aW5kb3cualF1ZXJ5KSwhZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gdCh0LG4pe3ZhciByPWUucHJveHkodGhpcy5wcm9jZXNzLHRoaXMpLGk9ZSh0KS5pcyhcImJvZHlcIik/ZSh3aW5kb3cpOmUodCksczt0aGlzLm9wdGlvbnM9ZS5leHRlbmQoe30sZS5mbi5zY3JvbGxzcHkuZGVmYXVsdHMsbiksdGhpcy4kc2Nyb2xsRWxlbWVudD1pLm9uKFwic2Nyb2xsLnNjcm9sbC1zcHkuZGF0YS1hcGlcIixyKSx0aGlzLnNlbGVjdG9yPSh0aGlzLm9wdGlvbnMudGFyZ2V0fHwocz1lKHQpLmF0dHIoXCJocmVmXCIpKSYmcy5yZXBsYWNlKC8uKig/PSNbXlxcc10rJCkvLFwiXCIpfHxcIlwiKStcIiAubmF2IGxpID4gYVwiLHRoaXMuJGJvZHk9ZShcImJvZHlcIiksdGhpcy5yZWZyZXNoKCksdGhpcy5wcm9jZXNzKCl9dC5wcm90b3R5cGU9e2NvbnN0cnVjdG9yOnQscmVmcmVzaDpmdW5jdGlvbigpe3ZhciB0PXRoaXMsbjt0aGlzLm9mZnNldHM9ZShbXSksdGhpcy50YXJnZXRzPWUoW10pLG49dGhpcy4kYm9keS5maW5kKHRoaXMuc2VsZWN0b3IpLm1hcChmdW5jdGlvbigpe3ZhciBuPWUodGhpcykscj1uLmRhdGEoXCJ0YXJnZXRcIil8fG4uYXR0cihcImhyZWZcIiksaT0vXiNcXHcvLnRlc3QocikmJmUocik7cmV0dXJuIGkmJmkubGVuZ3RoJiZbW2kucG9zaXRpb24oKS50b3ArKCFlLmlzV2luZG93KHQuJHNjcm9sbEVsZW1lbnQuZ2V0KDApKSYmdC4kc2Nyb2xsRWxlbWVudC5zY3JvbGxUb3AoKSkscl1dfHxudWxsfSkuc29ydChmdW5jdGlvbihlLHQpe3JldHVybiBlWzBdLXRbMF19KS5lYWNoKGZ1bmN0aW9uKCl7dC5vZmZzZXRzLnB1c2godGhpc1swXSksdC50YXJnZXRzLnB1c2godGhpc1sxXSl9KX0scHJvY2VzczpmdW5jdGlvbigpe3ZhciBlPXRoaXMuJHNjcm9sbEVsZW1lbnQuc2Nyb2xsVG9wKCkrdGhpcy5vcHRpb25zLm9mZnNldCx0PXRoaXMuJHNjcm9sbEVsZW1lbnRbMF0uc2Nyb2xsSGVpZ2h0fHx0aGlzLiRib2R5WzBdLnNjcm9sbEhlaWdodCxuPXQtdGhpcy4kc2Nyb2xsRWxlbWVudC5oZWlnaHQoKSxyPXRoaXMub2Zmc2V0cyxpPXRoaXMudGFyZ2V0cyxzPXRoaXMuYWN0aXZlVGFyZ2V0LG87aWYoZT49bilyZXR1cm4gcyE9KG89aS5sYXN0KClbMF0pJiZ0aGlzLmFjdGl2YXRlKG8pO2ZvcihvPXIubGVuZ3RoO28tLTspcyE9aVtvXSYmZT49cltvXSYmKCFyW28rMV18fGU8PXJbbysxXSkmJnRoaXMuYWN0aXZhdGUoaVtvXSl9LGFjdGl2YXRlOmZ1bmN0aW9uKHQpe3ZhciBuLHI7dGhpcy5hY3RpdmVUYXJnZXQ9dCxlKHRoaXMuc2VsZWN0b3IpLnBhcmVudChcIi5hY3RpdmVcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIikscj10aGlzLnNlbGVjdG9yKydbZGF0YS10YXJnZXQ9XCInK3QrJ1wiXSwnK3RoaXMuc2VsZWN0b3IrJ1tocmVmPVwiJyt0KydcIl0nLG49ZShyKS5wYXJlbnQoXCJsaVwiKS5hZGRDbGFzcyhcImFjdGl2ZVwiKSxuLnBhcmVudChcIi5kcm9wZG93bi1tZW51XCIpLmxlbmd0aCYmKG49bi5jbG9zZXN0KFwibGkuZHJvcGRvd25cIikuYWRkQ2xhc3MoXCJhY3RpdmVcIikpLG4udHJpZ2dlcihcImFjdGl2YXRlXCIpfX07dmFyIG49ZS5mbi5zY3JvbGxzcHk7ZS5mbi5zY3JvbGxzcHk9ZnVuY3Rpb24obil7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciByPWUodGhpcyksaT1yLmRhdGEoXCJzY3JvbGxzcHlcIikscz10eXBlb2Ygbj09XCJvYmplY3RcIiYmbjtpfHxyLmRhdGEoXCJzY3JvbGxzcHlcIixpPW5ldyB0KHRoaXMscykpLHR5cGVvZiBuPT1cInN0cmluZ1wiJiZpW25dKCl9KX0sZS5mbi5zY3JvbGxzcHkuQ29uc3RydWN0b3I9dCxlLmZuLnNjcm9sbHNweS5kZWZhdWx0cz17b2Zmc2V0OjEwfSxlLmZuLnNjcm9sbHNweS5ub0NvbmZsaWN0PWZ1bmN0aW9uKCl7cmV0dXJuIGUuZm4uc2Nyb2xsc3B5PW4sdGhpc30sZSh3aW5kb3cpLm9uKFwibG9hZFwiLGZ1bmN0aW9uKCl7ZSgnW2RhdGEtc3B5PVwic2Nyb2xsXCJdJykuZWFjaChmdW5jdGlvbigpe3ZhciB0PWUodGhpcyk7dC5zY3JvbGxzcHkodC5kYXRhKCkpfSl9KX0od2luZG93LmpRdWVyeSksIWZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO3ZhciB0PWZ1bmN0aW9uKHQpe3RoaXMuZWxlbWVudD1lKHQpfTt0LnByb3RvdHlwZT17Y29uc3RydWN0b3I6dCxzaG93OmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5lbGVtZW50LG49dC5jbG9zZXN0KFwidWw6bm90KC5kcm9wZG93bi1tZW51KVwiKSxyPXQuYXR0cihcImRhdGEtdGFyZ2V0XCIpLGkscyxvO3J8fChyPXQuYXR0cihcImhyZWZcIikscj1yJiZyLnJlcGxhY2UoLy4qKD89I1teXFxzXSokKS8sXCJcIikpO2lmKHQucGFyZW50KFwibGlcIikuaGFzQ2xhc3MoXCJhY3RpdmVcIikpcmV0dXJuO2k9bi5maW5kKFwiLmFjdGl2ZTpsYXN0IGFcIilbMF0sbz1lLkV2ZW50KFwic2hvd1wiLHtyZWxhdGVkVGFyZ2V0Oml9KSx0LnRyaWdnZXIobyk7aWYoby5pc0RlZmF1bHRQcmV2ZW50ZWQoKSlyZXR1cm47cz1lKHIpLHRoaXMuYWN0aXZhdGUodC5wYXJlbnQoXCJsaVwiKSxuKSx0aGlzLmFjdGl2YXRlKHMscy5wYXJlbnQoKSxmdW5jdGlvbigpe3QudHJpZ2dlcih7dHlwZTpcInNob3duXCIscmVsYXRlZFRhcmdldDppfSl9KX0sYWN0aXZhdGU6ZnVuY3Rpb24odCxuLHIpe2Z1bmN0aW9uIG8oKXtpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLmZpbmQoXCI+IC5kcm9wZG93bi1tZW51ID4gLmFjdGl2ZVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKSx0LmFkZENsYXNzKFwiYWN0aXZlXCIpLHM/KHRbMF0ub2Zmc2V0V2lkdGgsdC5hZGRDbGFzcyhcImluXCIpKTp0LnJlbW92ZUNsYXNzKFwiZmFkZVwiKSx0LnBhcmVudChcIi5kcm9wZG93bi1tZW51XCIpJiZ0LmNsb3Nlc3QoXCJsaS5kcm9wZG93blwiKS5hZGRDbGFzcyhcImFjdGl2ZVwiKSxyJiZyKCl9dmFyIGk9bi5maW5kKFwiPiAuYWN0aXZlXCIpLHM9ciYmZS5zdXBwb3J0LnRyYW5zaXRpb24mJmkuaGFzQ2xhc3MoXCJmYWRlXCIpO3M/aS5vbmUoZS5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLG8pOm8oKSxpLnJlbW92ZUNsYXNzKFwiaW5cIil9fTt2YXIgbj1lLmZuLnRhYjtlLmZuLnRhYj1mdW5jdGlvbihuKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHI9ZSh0aGlzKSxpPXIuZGF0YShcInRhYlwiKTtpfHxyLmRhdGEoXCJ0YWJcIixpPW5ldyB0KHRoaXMpKSx0eXBlb2Ygbj09XCJzdHJpbmdcIiYmaVtuXSgpfSl9LGUuZm4udGFiLkNvbnN0cnVjdG9yPXQsZS5mbi50YWIubm9Db25mbGljdD1mdW5jdGlvbigpe3JldHVybiBlLmZuLnRhYj1uLHRoaXN9LGUoZG9jdW1lbnQpLm9uKFwiY2xpY2sudGFiLmRhdGEtYXBpXCIsJ1tkYXRhLXRvZ2dsZT1cInRhYlwiXSwgW2RhdGEtdG9nZ2xlPVwicGlsbFwiXScsZnVuY3Rpb24odCl7dC5wcmV2ZW50RGVmYXVsdCgpLGUodGhpcykudGFiKFwic2hvd1wiKX0pfSh3aW5kb3cualF1ZXJ5KSwhZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7dmFyIHQ9ZnVuY3Rpb24odCxuKXt0aGlzLiRlbGVtZW50PWUodCksdGhpcy5vcHRpb25zPWUuZXh0ZW5kKHt9LGUuZm4udHlwZWFoZWFkLmRlZmF1bHRzLG4pLHRoaXMubWF0Y2hlcj10aGlzLm9wdGlvbnMubWF0Y2hlcnx8dGhpcy5tYXRjaGVyLHRoaXMuc29ydGVyPXRoaXMub3B0aW9ucy5zb3J0ZXJ8fHRoaXMuc29ydGVyLHRoaXMuaGlnaGxpZ2h0ZXI9dGhpcy5vcHRpb25zLmhpZ2hsaWdodGVyfHx0aGlzLmhpZ2hsaWdodGVyLHRoaXMudXBkYXRlcj10aGlzLm9wdGlvbnMudXBkYXRlcnx8dGhpcy51cGRhdGVyLHRoaXMuc291cmNlPXRoaXMub3B0aW9ucy5zb3VyY2UsdGhpcy4kbWVudT1lKHRoaXMub3B0aW9ucy5tZW51KSx0aGlzLnNob3duPSExLHRoaXMubGlzdGVuKCl9O3QucHJvdG90eXBlPXtjb25zdHJ1Y3Rvcjp0LHNlbGVjdDpmdW5jdGlvbigpe3ZhciBlPXRoaXMuJG1lbnUuZmluZChcIi5hY3RpdmVcIikuYXR0cihcImRhdGEtdmFsdWVcIik7cmV0dXJuIHRoaXMuJGVsZW1lbnQudmFsKHRoaXMudXBkYXRlcihlKSkuY2hhbmdlKCksdGhpcy5oaWRlKCl9LHVwZGF0ZXI6ZnVuY3Rpb24oZSl7cmV0dXJuIGV9LHNob3c6ZnVuY3Rpb24oKXt2YXIgdD1lLmV4dGVuZCh7fSx0aGlzLiRlbGVtZW50LnBvc2l0aW9uKCkse2hlaWdodDp0aGlzLiRlbGVtZW50WzBdLm9mZnNldEhlaWdodH0pO3JldHVybiB0aGlzLiRtZW51Lmluc2VydEFmdGVyKHRoaXMuJGVsZW1lbnQpLmNzcyh7dG9wOnQudG9wK3QuaGVpZ2h0LGxlZnQ6dC5sZWZ0fSkuc2hvdygpLHRoaXMuc2hvd249ITAsdGhpc30saGlkZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLiRtZW51LmhpZGUoKSx0aGlzLnNob3duPSExLHRoaXN9LGxvb2t1cDpmdW5jdGlvbih0KXt2YXIgbjtyZXR1cm4gdGhpcy5xdWVyeT10aGlzLiRlbGVtZW50LnZhbCgpLCF0aGlzLnF1ZXJ5fHx0aGlzLnF1ZXJ5Lmxlbmd0aDx0aGlzLm9wdGlvbnMubWluTGVuZ3RoP3RoaXMuc2hvd24/dGhpcy5oaWRlKCk6dGhpczoobj1lLmlzRnVuY3Rpb24odGhpcy5zb3VyY2UpP3RoaXMuc291cmNlKHRoaXMucXVlcnksZS5wcm94eSh0aGlzLnByb2Nlc3MsdGhpcykpOnRoaXMuc291cmNlLG4/dGhpcy5wcm9jZXNzKG4pOnRoaXMpfSxwcm9jZXNzOmZ1bmN0aW9uKHQpe3ZhciBuPXRoaXM7cmV0dXJuIHQ9ZS5ncmVwKHQsZnVuY3Rpb24oZSl7cmV0dXJuIG4ubWF0Y2hlcihlKX0pLHQ9dGhpcy5zb3J0ZXIodCksdC5sZW5ndGg/dGhpcy5yZW5kZXIodC5zbGljZSgwLHRoaXMub3B0aW9ucy5pdGVtcykpLnNob3coKTp0aGlzLnNob3duP3RoaXMuaGlkZSgpOnRoaXN9LG1hdGNoZXI6ZnVuY3Rpb24oZSl7cmV0dXJufmUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHRoaXMucXVlcnkudG9Mb3dlckNhc2UoKSl9LHNvcnRlcjpmdW5jdGlvbihlKXt2YXIgdD1bXSxuPVtdLHI9W10saTt3aGlsZShpPWUuc2hpZnQoKSlpLnRvTG93ZXJDYXNlKCkuaW5kZXhPZih0aGlzLnF1ZXJ5LnRvTG93ZXJDYXNlKCkpP35pLmluZGV4T2YodGhpcy5xdWVyeSk/bi5wdXNoKGkpOnIucHVzaChpKTp0LnB1c2goaSk7cmV0dXJuIHQuY29uY2F0KG4scil9LGhpZ2hsaWdodGVyOmZ1bmN0aW9uKGUpe3ZhciB0PXRoaXMucXVlcnkucmVwbGFjZSgvW1xcLVxcW1xcXXt9KCkqKz8uLFxcXFxcXF4kfCNcXHNdL2csXCJcXFxcJCZcIik7cmV0dXJuIGUucmVwbGFjZShuZXcgUmVnRXhwKFwiKFwiK3QrXCIpXCIsXCJpZ1wiKSxmdW5jdGlvbihlLHQpe3JldHVyblwiPHN0cm9uZz5cIit0K1wiPC9zdHJvbmc+XCJ9KX0scmVuZGVyOmZ1bmN0aW9uKHQpe3ZhciBuPXRoaXM7cmV0dXJuIHQ9ZSh0KS5tYXAoZnVuY3Rpb24odCxyKXtyZXR1cm4gdD1lKG4ub3B0aW9ucy5pdGVtKS5hdHRyKFwiZGF0YS12YWx1ZVwiLHIpLHQuZmluZChcImFcIikuaHRtbChuLmhpZ2hsaWdodGVyKHIpKSx0WzBdfSksdC5maXJzdCgpLmFkZENsYXNzKFwiYWN0aXZlXCIpLHRoaXMuJG1lbnUuaHRtbCh0KSx0aGlzfSxuZXh0OmZ1bmN0aW9uKHQpe3ZhciBuPXRoaXMuJG1lbnUuZmluZChcIi5hY3RpdmVcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIikscj1uLm5leHQoKTtyLmxlbmd0aHx8KHI9ZSh0aGlzLiRtZW51LmZpbmQoXCJsaVwiKVswXSkpLHIuYWRkQ2xhc3MoXCJhY3RpdmVcIil9LHByZXY6ZnVuY3Rpb24oZSl7dmFyIHQ9dGhpcy4kbWVudS5maW5kKFwiLmFjdGl2ZVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKSxuPXQucHJldigpO24ubGVuZ3RofHwobj10aGlzLiRtZW51LmZpbmQoXCJsaVwiKS5sYXN0KCkpLG4uYWRkQ2xhc3MoXCJhY3RpdmVcIil9LGxpc3RlbjpmdW5jdGlvbigpe3RoaXMuJGVsZW1lbnQub24oXCJmb2N1c1wiLGUucHJveHkodGhpcy5mb2N1cyx0aGlzKSkub24oXCJibHVyXCIsZS5wcm94eSh0aGlzLmJsdXIsdGhpcykpLm9uKFwia2V5cHJlc3NcIixlLnByb3h5KHRoaXMua2V5cHJlc3MsdGhpcykpLm9uKFwia2V5dXBcIixlLnByb3h5KHRoaXMua2V5dXAsdGhpcykpLHRoaXMuZXZlbnRTdXBwb3J0ZWQoXCJrZXlkb3duXCIpJiZ0aGlzLiRlbGVtZW50Lm9uKFwia2V5ZG93blwiLGUucHJveHkodGhpcy5rZXlkb3duLHRoaXMpKSx0aGlzLiRtZW51Lm9uKFwiY2xpY2tcIixlLnByb3h5KHRoaXMuY2xpY2ssdGhpcykpLm9uKFwibW91c2VlbnRlclwiLFwibGlcIixlLnByb3h5KHRoaXMubW91c2VlbnRlcix0aGlzKSkub24oXCJtb3VzZWxlYXZlXCIsXCJsaVwiLGUucHJveHkodGhpcy5tb3VzZWxlYXZlLHRoaXMpKX0sZXZlbnRTdXBwb3J0ZWQ6ZnVuY3Rpb24oZSl7dmFyIHQ9ZSBpbiB0aGlzLiRlbGVtZW50O3JldHVybiB0fHwodGhpcy4kZWxlbWVudC5zZXRBdHRyaWJ1dGUoZSxcInJldHVybjtcIiksdD10eXBlb2YgdGhpcy4kZWxlbWVudFtlXT09XCJmdW5jdGlvblwiKSx0fSxtb3ZlOmZ1bmN0aW9uKGUpe2lmKCF0aGlzLnNob3duKXJldHVybjtzd2l0Y2goZS5rZXlDb2RlKXtjYXNlIDk6Y2FzZSAxMzpjYXNlIDI3OmUucHJldmVudERlZmF1bHQoKTticmVhaztjYXNlIDM4OmUucHJldmVudERlZmF1bHQoKSx0aGlzLnByZXYoKTticmVhaztjYXNlIDQwOmUucHJldmVudERlZmF1bHQoKSx0aGlzLm5leHQoKX1lLnN0b3BQcm9wYWdhdGlvbigpfSxrZXlkb3duOmZ1bmN0aW9uKHQpe3RoaXMuc3VwcHJlc3NLZXlQcmVzc1JlcGVhdD1+ZS5pbkFycmF5KHQua2V5Q29kZSxbNDAsMzgsOSwxMywyN10pLHRoaXMubW92ZSh0KX0sa2V5cHJlc3M6ZnVuY3Rpb24oZSl7aWYodGhpcy5zdXBwcmVzc0tleVByZXNzUmVwZWF0KXJldHVybjt0aGlzLm1vdmUoZSl9LGtleXVwOmZ1bmN0aW9uKGUpe3N3aXRjaChlLmtleUNvZGUpe2Nhc2UgNDA6Y2FzZSAzODpjYXNlIDE2OmNhc2UgMTc6Y2FzZSAxODpicmVhaztjYXNlIDk6Y2FzZSAxMzppZighdGhpcy5zaG93bilyZXR1cm47dGhpcy5zZWxlY3QoKTticmVhaztjYXNlIDI3OmlmKCF0aGlzLnNob3duKXJldHVybjt0aGlzLmhpZGUoKTticmVhaztkZWZhdWx0OnRoaXMubG9va3VwKCl9ZS5zdG9wUHJvcGFnYXRpb24oKSxlLnByZXZlbnREZWZhdWx0KCl9LGZvY3VzOmZ1bmN0aW9uKGUpe3RoaXMuZm9jdXNlZD0hMH0sYmx1cjpmdW5jdGlvbihlKXt0aGlzLmZvY3VzZWQ9ITEsIXRoaXMubW91c2Vkb3ZlciYmdGhpcy5zaG93biYmdGhpcy5oaWRlKCl9LGNsaWNrOmZ1bmN0aW9uKGUpe2Uuc3RvcFByb3BhZ2F0aW9uKCksZS5wcmV2ZW50RGVmYXVsdCgpLHRoaXMuc2VsZWN0KCksdGhpcy4kZWxlbWVudC5mb2N1cygpfSxtb3VzZWVudGVyOmZ1bmN0aW9uKHQpe3RoaXMubW91c2Vkb3Zlcj0hMCx0aGlzLiRtZW51LmZpbmQoXCIuYWN0aXZlXCIpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLGUodC5jdXJyZW50VGFyZ2V0KS5hZGRDbGFzcyhcImFjdGl2ZVwiKX0sbW91c2VsZWF2ZTpmdW5jdGlvbihlKXt0aGlzLm1vdXNlZG92ZXI9ITEsIXRoaXMuZm9jdXNlZCYmdGhpcy5zaG93biYmdGhpcy5oaWRlKCl9fTt2YXIgbj1lLmZuLnR5cGVhaGVhZDtlLmZuLnR5cGVhaGVhZD1mdW5jdGlvbihuKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHI9ZSh0aGlzKSxpPXIuZGF0YShcInR5cGVhaGVhZFwiKSxzPXR5cGVvZiBuPT1cIm9iamVjdFwiJiZuO2l8fHIuZGF0YShcInR5cGVhaGVhZFwiLGk9bmV3IHQodGhpcyxzKSksdHlwZW9mIG49PVwic3RyaW5nXCImJmlbbl0oKX0pfSxlLmZuLnR5cGVhaGVhZC5kZWZhdWx0cz17c291cmNlOltdLGl0ZW1zOjgsbWVudTonPHVsIGNsYXNzPVwidHlwZWFoZWFkIGRyb3Bkb3duLW1lbnVcIj48L3VsPicsaXRlbTonPGxpPjxhIGhyZWY9XCIjXCI+PC9hPjwvbGk+JyxtaW5MZW5ndGg6MX0sZS5mbi50eXBlYWhlYWQuQ29uc3RydWN0b3I9dCxlLmZuLnR5cGVhaGVhZC5ub0NvbmZsaWN0PWZ1bmN0aW9uKCl7cmV0dXJuIGUuZm4udHlwZWFoZWFkPW4sdGhpc30sZShkb2N1bWVudCkub24oXCJmb2N1cy50eXBlYWhlYWQuZGF0YS1hcGlcIiwnW2RhdGEtcHJvdmlkZT1cInR5cGVhaGVhZFwiXScsZnVuY3Rpb24odCl7dmFyIG49ZSh0aGlzKTtpZihuLmRhdGEoXCJ0eXBlYWhlYWRcIikpcmV0dXJuO24udHlwZWFoZWFkKG4uZGF0YSgpKX0pfSh3aW5kb3cualF1ZXJ5KSwhZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7dmFyIHQ9ZnVuY3Rpb24odCxuKXt0aGlzLm9wdGlvbnM9ZS5leHRlbmQoe30sZS5mbi5hZmZpeC5kZWZhdWx0cyxuKSx0aGlzLiR3aW5kb3c9ZSh3aW5kb3cpLm9uKFwic2Nyb2xsLmFmZml4LmRhdGEtYXBpXCIsZS5wcm94eSh0aGlzLmNoZWNrUG9zaXRpb24sdGhpcykpLm9uKFwiY2xpY2suYWZmaXguZGF0YS1hcGlcIixlLnByb3h5KGZ1bmN0aW9uKCl7c2V0VGltZW91dChlLnByb3h5KHRoaXMuY2hlY2tQb3NpdGlvbix0aGlzKSwxKX0sdGhpcykpLHRoaXMuJGVsZW1lbnQ9ZSh0KSx0aGlzLmNoZWNrUG9zaXRpb24oKX07dC5wcm90b3R5cGUuY2hlY2tQb3NpdGlvbj1mdW5jdGlvbigpe2lmKCF0aGlzLiRlbGVtZW50LmlzKFwiOnZpc2libGVcIikpcmV0dXJuO3ZhciB0PWUoZG9jdW1lbnQpLmhlaWdodCgpLG49dGhpcy4kd2luZG93LnNjcm9sbFRvcCgpLHI9dGhpcy4kZWxlbWVudC5vZmZzZXQoKSxpPXRoaXMub3B0aW9ucy5vZmZzZXQscz1pLmJvdHRvbSxvPWkudG9wLHU9XCJhZmZpeCBhZmZpeC10b3AgYWZmaXgtYm90dG9tXCIsYTt0eXBlb2YgaSE9XCJvYmplY3RcIiYmKHM9bz1pKSx0eXBlb2Ygbz09XCJmdW5jdGlvblwiJiYobz1pLnRvcCgpKSx0eXBlb2Ygcz09XCJmdW5jdGlvblwiJiYocz1pLmJvdHRvbSgpKSxhPXRoaXMudW5waW4hPW51bGwmJm4rdGhpcy51bnBpbjw9ci50b3A/ITE6cyE9bnVsbCYmci50b3ArdGhpcy4kZWxlbWVudC5oZWlnaHQoKT49dC1zP1wiYm90dG9tXCI6byE9bnVsbCYmbjw9bz9cInRvcFwiOiExO2lmKHRoaXMuYWZmaXhlZD09PWEpcmV0dXJuO3RoaXMuYWZmaXhlZD1hLHRoaXMudW5waW49YT09XCJib3R0b21cIj9yLnRvcC1uOm51bGwsdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyh1KS5hZGRDbGFzcyhcImFmZml4XCIrKGE/XCItXCIrYTpcIlwiKSl9O3ZhciBuPWUuZm4uYWZmaXg7ZS5mbi5hZmZpeD1mdW5jdGlvbihuKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHI9ZSh0aGlzKSxpPXIuZGF0YShcImFmZml4XCIpLHM9dHlwZW9mIG49PVwib2JqZWN0XCImJm47aXx8ci5kYXRhKFwiYWZmaXhcIixpPW5ldyB0KHRoaXMscykpLHR5cGVvZiBuPT1cInN0cmluZ1wiJiZpW25dKCl9KX0sZS5mbi5hZmZpeC5Db25zdHJ1Y3Rvcj10LGUuZm4uYWZmaXguZGVmYXVsdHM9e29mZnNldDowfSxlLmZuLmFmZml4Lm5vQ29uZmxpY3Q9ZnVuY3Rpb24oKXtyZXR1cm4gZS5mbi5hZmZpeD1uLHRoaXN9LGUod2luZG93KS5vbihcImxvYWRcIixmdW5jdGlvbigpe2UoJ1tkYXRhLXNweT1cImFmZml4XCJdJykuZWFjaChmdW5jdGlvbigpe3ZhciB0PWUodGhpcyksbj10LmRhdGEoKTtuLm9mZnNldD1uLm9mZnNldHx8e30sbi5vZmZzZXRCb3R0b20mJihuLm9mZnNldC5ib3R0b209bi5vZmZzZXRCb3R0b20pLG4ub2Zmc2V0VG9wJiYobi5vZmZzZXQudG9wPW4ub2Zmc2V0VG9wKSx0LmFmZml4KG4pfSl9KX0od2luZG93LmpRdWVyeSk7IiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgJChcImlmcmFtZVtzcmMqPWluc2lnaXRdXCIpLmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xuXG4gICAgLyoqKioqKioqKioqKioqKioqIFdheXBvaW50cyAqKioqKioqKioqKioqKioqKiovXG4gICAgJCgnLndwMScpLndheXBvaW50KGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcud3AxJykuYWRkQ2xhc3MoJ2FuaW1hdGVkIGZhZGVJblVwJyk7XG4gICAgfSwge1xuICAgICAgICBvZmZzZXQ6ICc3NSUnXG4gICAgfSk7XG4gICAgJCgnLndwMicpLndheXBvaW50KGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcud3AyJykuYWRkQ2xhc3MoJ2FuaW1hdGVkIGZhZGVJblVwJyk7XG4gICAgfSwge1xuICAgICAgICBvZmZzZXQ6ICc3NSUnXG4gICAgfSk7XG4gICAgJCgnLndwMycpLndheXBvaW50KGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcud3AzJykuYWRkQ2xhc3MoJ2FuaW1hdGVkIGZhZGVJblJpZ2h0Jyk7XG4gICAgfSwge1xuICAgICAgICBvZmZzZXQ6ICc3NSUnXG4gICAgfSk7XG4gICAgJCgnLndwNCcpLndheXBvaW50KGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcud3A0JykuYWRkQ2xhc3MoJ2FuaW1hdGVkIGZhZGVJblVwJyk7XG4gICAgfSwge1xuICAgICAgICBvZmZzZXQ6ICc5NSUnXG4gICAgfSk7XG4gICAgJCgnLndwNScpLndheXBvaW50KGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcud3A1JykuYWRkQ2xhc3MoJ2FuaW1hdGVkIGZhZGVJblVwJyk7XG4gICAgfSwge1xuICAgICAgICBvZmZzZXQ6ICc5MyUnXG4gICAgfSk7XG4gICAgJCgnLndwNicpLndheXBvaW50KGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcud3A2JykuYWRkQ2xhc3MoJ2FuaW1hdGVkIGZhZGVJblVwJyk7XG4gICAgfSwge1xuICAgICAgICBvZmZzZXQ6ICc5MCUnXG4gICAgfSk7XG5cbiAgICAvKioqKioqKioqKioqKioqKiogSW5pdGlhdGUgRmxleHNsaWRlciAqKioqKioqKioqKioqKioqKiovXG4gICAgJCgnLmZsZXhzbGlkZXInKS5mbGV4c2xpZGVyKHtcbiAgICAgICAgYW5pbWF0aW9uOiBcInNsaWRlXCIsXG4gICAgICAgIHNsaWRlc2hvd1NwZWVkOiAxMDAwMCxcbiAgICAgICAgYW5pbWF0aW9uRHVyYXRpb246IDQwMCxcbiAgICAgICAgcGF1c2VPbkhvdmVyOiB0cnVlXG4gICAgfSk7XG5cbiAgICAvKioqKioqKioqKioqKioqKiogSW5pdGlhdGUgRmFuY3lib3ggKioqKioqKioqKioqKioqKioqL1xuICAgICQoJy5zaW5nbGVfaW1hZ2UnKS5mYW5jeWJveCh7XG4gICAgICAgIHBhZGRpbmc6IDQsXG4gICAgfSk7XG5cbiAgICAvKioqKioqKioqKioqKioqKiogVG9vbHRpcHMgKioqKioqKioqKioqKioqKioqL1xuICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XG5cbiAgICAvKioqKioqKioqKioqKioqKiogTmF2IFRyYW5zZm9ybWljb24gKioqKioqKioqKioqKioqKioqL1xuICAgIC8qIFdoZW4gdXNlciBjbGlja3MgdGhlIEljb24gKi9cbiAgICAkKCcubmF2LXRvZ2dsZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgJCgnLmhlYWRlci1uYXYnKS50b2dnbGVDbGFzcygnb3BlbicpO1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0pO1xuICAgIC8qIFdoZW4gdXNlciBjbGlja3MgYSBsaW5rICovXG4gICAgJCgnLmhlYWRlci1uYXYgbGkgYScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcubmF2LXRvZ2dsZScpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgJCgnLmhlYWRlci1uYXYnKS50b2dnbGVDbGFzcygnb3BlbicpO1xuICAgIH0pO1xuXG4gICAgLyoqKioqKioqKioqKioqKioqIEhlYWRlciBCRyBTY3JvbGwgKioqKioqKioqKioqKioqKioqL1xuICAgICQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzY3JvbGwgPSB7XG4gICAgICAgICAgICBjb250cm9sOiB7XG4gICAgICAgICAgICAgICAgZml4ZWRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJCgnc2VjdGlvbi5uYXZpZ2F0aW9uJykuYWRkQ2xhc3MoJ2ZpeGVkJyk7XG4gICAgICAgICAgICAgICAgICAgICQoJ3NlY3Rpb24ubmF2aWdhdGlvbicpLnJlbW92ZUNsYXNzKCdub3QtZml4ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgJCgnaGVhZGVyJykuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYm9yZGVyLWJvdHRvbVwiOiBcInNvbGlkIDFweCByZ2JhKDI1NSwgMjU1LCAyNTUsIDApXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInBhZGRpbmdcIjogXCIxMHB4IDBcIlxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgJCgnaGVhZGVyIC5tZW1iZXItYWN0aW9ucycpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBcInRvcFwiOiBcIjE3cHhcIixcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICQoJ2hlYWRlciAubmF2aWNvbicpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBcInRvcFwiOiBcIjIzcHhcIixcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBub3RmaXhlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICQoJ3NlY3Rpb24ubmF2aWdhdGlvbicpLnJlbW92ZUNsYXNzKCdmaXhlZCcpO1xuICAgICAgICAgICAgICAgICAgICAkKCdzZWN0aW9uLm5hdmlnYXRpb24nKS5hZGRDbGFzcygnbm90LWZpeGVkJyk7XG4gICAgICAgICAgICAgICAgICAgICQoJ2hlYWRlcicpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBcImJvcmRlci1ib3R0b21cIjogXCJzb2xpZCAxcHggcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjIpXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInBhZGRpbmdcIjogXCIxMHB4IDBcIlxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgJCgnaGVhZGVyIC5tZW1iZXItYWN0aW9ucycpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBcInRvcFwiOiBcIjE3cHhcIixcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICQoJ2hlYWRlciAubmF2aWNvbicpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBcInRvcFwiOiBcIjIzcHhcIixcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNjcm9sbCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoc2Nyb2xsID49IDIwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZpeGVkcygpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub3RmaXhlZCgpO1xuICAgICAgICAgICAgICAgICAgICB9ICAgXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBldmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW5pdCgpO1xuXG4gICAgICAgICAgICAgICAgICAgICQod2luZG93KS5zY3JvbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmluaXQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc2Nyb2xsLmNvbnRyb2wuZXZlbnRzKCk7XG4gICAgfSk7XG5cbiAgICAvKioqKioqKioqKioqKioqKiogU21vb3RoIFNjcm9sbGluZyAqKioqKioqKioqKioqKioqKiovXG4gICAgJChmdW5jdGlvbigpIHtcbiAgICAgICAgJCgnYVtocmVmKj0jXTpub3QoW2hyZWY9I10pJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgaHJlZiA9ICQodGhpcykuYXR0cignaHJlZicpLnJlcGxhY2UoLyMuKiQvLCAnJyk7XG4gICAgICAgICAgICBpZiAoaHJlZiA9PT0gJycpIHtcbi8vICAgICAgICAgICAgaWYgKGxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoL15cXC8vLCAnJykgPT09IHRoaXMucGF0aG5hbWUucmVwbGFjZSgvXlxcLy8sICcnKSAmJiBsb2NhdGlvbi5ob3N0bmFtZSA9PT0gdGhpcy5ob3N0bmFtZSkge1xuICAgICAgICAgICAgICAgIHZhciB0YXJnZXQgPSAkKHRoaXMuaGFzaCk7XG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0Lmxlbmd0aCA/IHRhcmdldCA6ICQoJ1tuYW1lPScgKyB0aGlzLmhhc2guc2xpY2UoMSkgKyAnXScpO1xuICAgICAgICAgICAgICAgIGlmICh0YXJnZXQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICQoJ2h0bWwsYm9keScpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsVG9wOiB0YXJnZXQub2Zmc2V0KCkudG9wIC0gJCgnLm5hdmlnYXRpb24nKS5oZWlnaHQoKVxuICAgICAgICAgICAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTsiLCIvKlxuICogalF1ZXJ5IEZsZXhTbGlkZXIgdjIuNS4wXG4gKiBDb3B5cmlnaHQgMjAxMiBXb29UaGVtZXNcbiAqIENvbnRyaWJ1dGluZyBBdXRob3I6IFR5bGVyIFNtaXRoXG4gKi8hZnVuY3Rpb24oJCl7JC5mbGV4c2xpZGVyPWZ1bmN0aW9uKGUsdCl7dmFyIGE9JChlKTthLnZhcnM9JC5leHRlbmQoe30sJC5mbGV4c2xpZGVyLmRlZmF1bHRzLHQpO3ZhciBuPWEudmFycy5uYW1lc3BhY2UsaT13aW5kb3cubmF2aWdhdG9yJiZ3aW5kb3cubmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQmJndpbmRvdy5NU0dlc3R1cmUscz0oXCJvbnRvdWNoc3RhcnRcImluIHdpbmRvd3x8aXx8d2luZG93LkRvY3VtZW50VG91Y2gmJmRvY3VtZW50IGluc3RhbmNlb2YgRG9jdW1lbnRUb3VjaCkmJmEudmFycy50b3VjaCxyPVwiY2xpY2sgdG91Y2hlbmQgTVNQb2ludGVyVXAga2V5dXBcIixvPVwiXCIsbCxjPVwidmVydGljYWxcIj09PWEudmFycy5kaXJlY3Rpb24sZD1hLnZhcnMucmV2ZXJzZSx1PWEudmFycy5pdGVtV2lkdGg+MCx2PVwiZmFkZVwiPT09YS52YXJzLmFuaW1hdGlvbixwPVwiXCIhPT1hLnZhcnMuYXNOYXZGb3IsbT17fSxmPSEwOyQuZGF0YShlLFwiZmxleHNsaWRlclwiLGEpLG09e2luaXQ6ZnVuY3Rpb24oKXthLmFuaW1hdGluZz0hMSxhLmN1cnJlbnRTbGlkZT1wYXJzZUludChhLnZhcnMuc3RhcnRBdD9hLnZhcnMuc3RhcnRBdDowLDEwKSxpc05hTihhLmN1cnJlbnRTbGlkZSkmJihhLmN1cnJlbnRTbGlkZT0wKSxhLmFuaW1hdGluZ1RvPWEuY3VycmVudFNsaWRlLGEuYXRFbmQ9MD09PWEuY3VycmVudFNsaWRlfHxhLmN1cnJlbnRTbGlkZT09PWEubGFzdCxhLmNvbnRhaW5lclNlbGVjdG9yPWEudmFycy5zZWxlY3Rvci5zdWJzdHIoMCxhLnZhcnMuc2VsZWN0b3Iuc2VhcmNoKFwiIFwiKSksYS5zbGlkZXM9JChhLnZhcnMuc2VsZWN0b3IsYSksYS5jb250YWluZXI9JChhLmNvbnRhaW5lclNlbGVjdG9yLGEpLGEuY291bnQ9YS5zbGlkZXMubGVuZ3RoLGEuc3luY0V4aXN0cz0kKGEudmFycy5zeW5jKS5sZW5ndGg+MCxcInNsaWRlXCI9PT1hLnZhcnMuYW5pbWF0aW9uJiYoYS52YXJzLmFuaW1hdGlvbj1cInN3aW5nXCIpLGEucHJvcD1jP1widG9wXCI6XCJtYXJnaW5MZWZ0XCIsYS5hcmdzPXt9LGEubWFudWFsUGF1c2U9ITEsYS5zdG9wcGVkPSExLGEuc3RhcnRlZD0hMSxhLnN0YXJ0VGltZW91dD1udWxsLGEudHJhbnNpdGlvbnM9IWEudmFycy52aWRlbyYmIXYmJmEudmFycy51c2VDU1MmJmZ1bmN0aW9uKCl7dmFyIGU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSx0PVtcInBlcnNwZWN0aXZlUHJvcGVydHlcIixcIldlYmtpdFBlcnNwZWN0aXZlXCIsXCJNb3pQZXJzcGVjdGl2ZVwiLFwiT1BlcnNwZWN0aXZlXCIsXCJtc1BlcnNwZWN0aXZlXCJdO2Zvcih2YXIgbiBpbiB0KWlmKHZvaWQgMCE9PWUuc3R5bGVbdFtuXV0pcmV0dXJuIGEucGZ4PXRbbl0ucmVwbGFjZShcIlBlcnNwZWN0aXZlXCIsXCJcIikudG9Mb3dlckNhc2UoKSxhLnByb3A9XCItXCIrYS5wZngrXCItdHJhbnNmb3JtXCIsITA7cmV0dXJuITF9KCksYS5lbnN1cmVBbmltYXRpb25FbmQ9XCJcIixcIlwiIT09YS52YXJzLmNvbnRyb2xzQ29udGFpbmVyJiYoYS5jb250cm9sc0NvbnRhaW5lcj0kKGEudmFycy5jb250cm9sc0NvbnRhaW5lcikubGVuZ3RoPjAmJiQoYS52YXJzLmNvbnRyb2xzQ29udGFpbmVyKSksXCJcIiE9PWEudmFycy5tYW51YWxDb250cm9scyYmKGEubWFudWFsQ29udHJvbHM9JChhLnZhcnMubWFudWFsQ29udHJvbHMpLmxlbmd0aD4wJiYkKGEudmFycy5tYW51YWxDb250cm9scykpLFwiXCIhPT1hLnZhcnMuY3VzdG9tRGlyZWN0aW9uTmF2JiYoYS5jdXN0b21EaXJlY3Rpb25OYXY9Mj09PSQoYS52YXJzLmN1c3RvbURpcmVjdGlvbk5hdikubGVuZ3RoJiYkKGEudmFycy5jdXN0b21EaXJlY3Rpb25OYXYpKSxhLnZhcnMucmFuZG9taXplJiYoYS5zbGlkZXMuc29ydChmdW5jdGlvbigpe3JldHVybiBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkpLS41fSksYS5jb250YWluZXIuZW1wdHkoKS5hcHBlbmQoYS5zbGlkZXMpKSxhLmRvTWF0aCgpLGEuc2V0dXAoXCJpbml0XCIpLGEudmFycy5jb250cm9sTmF2JiZtLmNvbnRyb2xOYXYuc2V0dXAoKSxhLnZhcnMuZGlyZWN0aW9uTmF2JiZtLmRpcmVjdGlvbk5hdi5zZXR1cCgpLGEudmFycy5rZXlib2FyZCYmKDE9PT0kKGEuY29udGFpbmVyU2VsZWN0b3IpLmxlbmd0aHx8YS52YXJzLm11bHRpcGxlS2V5Ym9hcmQpJiYkKGRvY3VtZW50KS5iaW5kKFwia2V5dXBcIixmdW5jdGlvbihlKXt2YXIgdD1lLmtleUNvZGU7aWYoIWEuYW5pbWF0aW5nJiYoMzk9PT10fHwzNz09PXQpKXt2YXIgbj0zOT09PXQ/YS5nZXRUYXJnZXQoXCJuZXh0XCIpOjM3PT09dD9hLmdldFRhcmdldChcInByZXZcIik6ITE7YS5mbGV4QW5pbWF0ZShuLGEudmFycy5wYXVzZU9uQWN0aW9uKX19KSxhLnZhcnMubW91c2V3aGVlbCYmYS5iaW5kKFwibW91c2V3aGVlbFwiLGZ1bmN0aW9uKGUsdCxuLGkpe2UucHJldmVudERlZmF1bHQoKTt2YXIgcz1hLmdldFRhcmdldCgwPnQ/XCJuZXh0XCI6XCJwcmV2XCIpO2EuZmxleEFuaW1hdGUocyxhLnZhcnMucGF1c2VPbkFjdGlvbil9KSxhLnZhcnMucGF1c2VQbGF5JiZtLnBhdXNlUGxheS5zZXR1cCgpLGEudmFycy5zbGlkZXNob3cmJmEudmFycy5wYXVzZUludmlzaWJsZSYmbS5wYXVzZUludmlzaWJsZS5pbml0KCksYS52YXJzLnNsaWRlc2hvdyYmKGEudmFycy5wYXVzZU9uSG92ZXImJmEuaG92ZXIoZnVuY3Rpb24oKXthLm1hbnVhbFBsYXl8fGEubWFudWFsUGF1c2V8fGEucGF1c2UoKX0sZnVuY3Rpb24oKXthLm1hbnVhbFBhdXNlfHxhLm1hbnVhbFBsYXl8fGEuc3RvcHBlZHx8YS5wbGF5KCl9KSxhLnZhcnMucGF1c2VJbnZpc2libGUmJm0ucGF1c2VJbnZpc2libGUuaXNIaWRkZW4oKXx8KGEudmFycy5pbml0RGVsYXk+MD9hLnN0YXJ0VGltZW91dD1zZXRUaW1lb3V0KGEucGxheSxhLnZhcnMuaW5pdERlbGF5KTphLnBsYXkoKSkpLHAmJm0uYXNOYXYuc2V0dXAoKSxzJiZhLnZhcnMudG91Y2gmJm0udG91Y2goKSwoIXZ8fHYmJmEudmFycy5zbW9vdGhIZWlnaHQpJiYkKHdpbmRvdykuYmluZChcInJlc2l6ZSBvcmllbnRhdGlvbmNoYW5nZSBmb2N1c1wiLG0ucmVzaXplKSxhLmZpbmQoXCJpbWdcIikuYXR0cihcImRyYWdnYWJsZVwiLFwiZmFsc2VcIiksc2V0VGltZW91dChmdW5jdGlvbigpe2EudmFycy5zdGFydChhKX0sMjAwKX0sYXNOYXY6e3NldHVwOmZ1bmN0aW9uKCl7YS5hc05hdj0hMCxhLmFuaW1hdGluZ1RvPU1hdGguZmxvb3IoYS5jdXJyZW50U2xpZGUvYS5tb3ZlKSxhLmN1cnJlbnRJdGVtPWEuY3VycmVudFNsaWRlLGEuc2xpZGVzLnJlbW92ZUNsYXNzKG4rXCJhY3RpdmUtc2xpZGVcIikuZXEoYS5jdXJyZW50SXRlbSkuYWRkQ2xhc3MobitcImFjdGl2ZS1zbGlkZVwiKSxpPyhlLl9zbGlkZXI9YSxhLnNsaWRlcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIGU9dGhpcztlLl9nZXN0dXJlPW5ldyBNU0dlc3R1cmUsZS5fZ2VzdHVyZS50YXJnZXQ9ZSxlLmFkZEV2ZW50TGlzdGVuZXIoXCJNU1BvaW50ZXJEb3duXCIsZnVuY3Rpb24oZSl7ZS5wcmV2ZW50RGVmYXVsdCgpLGUuY3VycmVudFRhcmdldC5fZ2VzdHVyZSYmZS5jdXJyZW50VGFyZ2V0Ll9nZXN0dXJlLmFkZFBvaW50ZXIoZS5wb2ludGVySWQpfSwhMSksZS5hZGRFdmVudExpc3RlbmVyKFwiTVNHZXN0dXJlVGFwXCIsZnVuY3Rpb24oZSl7ZS5wcmV2ZW50RGVmYXVsdCgpO3ZhciB0PSQodGhpcyksbj10LmluZGV4KCk7JChhLnZhcnMuYXNOYXZGb3IpLmRhdGEoXCJmbGV4c2xpZGVyXCIpLmFuaW1hdGluZ3x8dC5oYXNDbGFzcyhcImFjdGl2ZVwiKXx8KGEuZGlyZWN0aW9uPWEuY3VycmVudEl0ZW08bj9cIm5leHRcIjpcInByZXZcIixhLmZsZXhBbmltYXRlKG4sYS52YXJzLnBhdXNlT25BY3Rpb24sITEsITAsITApKX0pfSkpOmEuc2xpZGVzLm9uKHIsZnVuY3Rpb24oZSl7ZS5wcmV2ZW50RGVmYXVsdCgpO3ZhciB0PSQodGhpcyksaT10LmluZGV4KCkscz10Lm9mZnNldCgpLmxlZnQtJChhKS5zY3JvbGxMZWZ0KCk7MD49cyYmdC5oYXNDbGFzcyhuK1wiYWN0aXZlLXNsaWRlXCIpP2EuZmxleEFuaW1hdGUoYS5nZXRUYXJnZXQoXCJwcmV2XCIpLCEwKTokKGEudmFycy5hc05hdkZvcikuZGF0YShcImZsZXhzbGlkZXJcIikuYW5pbWF0aW5nfHx0Lmhhc0NsYXNzKG4rXCJhY3RpdmUtc2xpZGVcIil8fChhLmRpcmVjdGlvbj1hLmN1cnJlbnRJdGVtPGk/XCJuZXh0XCI6XCJwcmV2XCIsYS5mbGV4QW5pbWF0ZShpLGEudmFycy5wYXVzZU9uQWN0aW9uLCExLCEwLCEwKSl9KX19LGNvbnRyb2xOYXY6e3NldHVwOmZ1bmN0aW9uKCl7YS5tYW51YWxDb250cm9scz9tLmNvbnRyb2xOYXYuc2V0dXBNYW51YWwoKTptLmNvbnRyb2xOYXYuc2V0dXBQYWdpbmcoKX0sc2V0dXBQYWdpbmc6ZnVuY3Rpb24oKXt2YXIgZT1cInRodW1ibmFpbHNcIj09PWEudmFycy5jb250cm9sTmF2P1wiY29udHJvbC10aHVtYnNcIjpcImNvbnRyb2wtcGFnaW5nXCIsdD0xLGkscztpZihhLmNvbnRyb2xOYXZTY2FmZm9sZD0kKCc8b2wgY2xhc3M9XCInK24rXCJjb250cm9sLW5hdiBcIituK2UrJ1wiPjwvb2w+JyksYS5wYWdpbmdDb3VudD4xKWZvcih2YXIgbD0wO2w8YS5wYWdpbmdDb3VudDtsKyspe2lmKHM9YS5zbGlkZXMuZXEobCksaT1cInRodW1ibmFpbHNcIj09PWEudmFycy5jb250cm9sTmF2Pyc8aW1nIHNyYz1cIicrcy5hdHRyKFwiZGF0YS10aHVtYlwiKSsnXCIvPic6XCI8YT5cIit0K1wiPC9hPlwiLFwidGh1bWJuYWlsc1wiPT09YS52YXJzLmNvbnRyb2xOYXYmJiEwPT09YS52YXJzLnRodW1iQ2FwdGlvbnMpe3ZhciBjPXMuYXR0cihcImRhdGEtdGh1bWJjYXB0aW9uXCIpO1wiXCIhPT1jJiZ2b2lkIDAhPT1jJiYoaSs9JzxzcGFuIGNsYXNzPVwiJytuKydjYXB0aW9uXCI+JytjK1wiPC9zcGFuPlwiKX1hLmNvbnRyb2xOYXZTY2FmZm9sZC5hcHBlbmQoXCI8bGk+XCIraStcIjwvbGk+XCIpLHQrK31hLmNvbnRyb2xzQ29udGFpbmVyPyQoYS5jb250cm9sc0NvbnRhaW5lcikuYXBwZW5kKGEuY29udHJvbE5hdlNjYWZmb2xkKTphLmFwcGVuZChhLmNvbnRyb2xOYXZTY2FmZm9sZCksbS5jb250cm9sTmF2LnNldCgpLG0uY29udHJvbE5hdi5hY3RpdmUoKSxhLmNvbnRyb2xOYXZTY2FmZm9sZC5kZWxlZ2F0ZShcImEsIGltZ1wiLHIsZnVuY3Rpb24oZSl7aWYoZS5wcmV2ZW50RGVmYXVsdCgpLFwiXCI9PT1vfHxvPT09ZS50eXBlKXt2YXIgdD0kKHRoaXMpLGk9YS5jb250cm9sTmF2LmluZGV4KHQpO3QuaGFzQ2xhc3MobitcImFjdGl2ZVwiKXx8KGEuZGlyZWN0aW9uPWk+YS5jdXJyZW50U2xpZGU/XCJuZXh0XCI6XCJwcmV2XCIsYS5mbGV4QW5pbWF0ZShpLGEudmFycy5wYXVzZU9uQWN0aW9uKSl9XCJcIj09PW8mJihvPWUudHlwZSksbS5zZXRUb0NsZWFyV2F0Y2hlZEV2ZW50KCl9KX0sc2V0dXBNYW51YWw6ZnVuY3Rpb24oKXthLmNvbnRyb2xOYXY9YS5tYW51YWxDb250cm9scyxtLmNvbnRyb2xOYXYuYWN0aXZlKCksYS5jb250cm9sTmF2LmJpbmQocixmdW5jdGlvbihlKXtpZihlLnByZXZlbnREZWZhdWx0KCksXCJcIj09PW98fG89PT1lLnR5cGUpe3ZhciB0PSQodGhpcyksaT1hLmNvbnRyb2xOYXYuaW5kZXgodCk7dC5oYXNDbGFzcyhuK1wiYWN0aXZlXCIpfHwoYS5kaXJlY3Rpb249aT5hLmN1cnJlbnRTbGlkZT9cIm5leHRcIjpcInByZXZcIixhLmZsZXhBbmltYXRlKGksYS52YXJzLnBhdXNlT25BY3Rpb24pKX1cIlwiPT09byYmKG89ZS50eXBlKSxtLnNldFRvQ2xlYXJXYXRjaGVkRXZlbnQoKX0pfSxzZXQ6ZnVuY3Rpb24oKXt2YXIgZT1cInRodW1ibmFpbHNcIj09PWEudmFycy5jb250cm9sTmF2P1wiaW1nXCI6XCJhXCI7YS5jb250cm9sTmF2PSQoXCIuXCIrbitcImNvbnRyb2wtbmF2IGxpIFwiK2UsYS5jb250cm9sc0NvbnRhaW5lcj9hLmNvbnRyb2xzQ29udGFpbmVyOmEpfSxhY3RpdmU6ZnVuY3Rpb24oKXthLmNvbnRyb2xOYXYucmVtb3ZlQ2xhc3MobitcImFjdGl2ZVwiKS5lcShhLmFuaW1hdGluZ1RvKS5hZGRDbGFzcyhuK1wiYWN0aXZlXCIpfSx1cGRhdGU6ZnVuY3Rpb24oZSx0KXthLnBhZ2luZ0NvdW50PjEmJlwiYWRkXCI9PT1lP2EuY29udHJvbE5hdlNjYWZmb2xkLmFwcGVuZCgkKFwiPGxpPjxhPlwiK2EuY291bnQrXCI8L2E+PC9saT5cIikpOjE9PT1hLnBhZ2luZ0NvdW50P2EuY29udHJvbE5hdlNjYWZmb2xkLmZpbmQoXCJsaVwiKS5yZW1vdmUoKTphLmNvbnRyb2xOYXYuZXEodCkuY2xvc2VzdChcImxpXCIpLnJlbW92ZSgpLG0uY29udHJvbE5hdi5zZXQoKSxhLnBhZ2luZ0NvdW50PjEmJmEucGFnaW5nQ291bnQhPT1hLmNvbnRyb2xOYXYubGVuZ3RoP2EudXBkYXRlKHQsZSk6bS5jb250cm9sTmF2LmFjdGl2ZSgpfX0sZGlyZWN0aW9uTmF2OntzZXR1cDpmdW5jdGlvbigpe3ZhciBlPSQoJzx1bCBjbGFzcz1cIicrbisnZGlyZWN0aW9uLW5hdlwiPjxsaSBjbGFzcz1cIicrbisnbmF2LXByZXZcIj48YSBjbGFzcz1cIicrbisncHJldlwiIGhyZWY9XCIjXCI+JythLnZhcnMucHJldlRleHQrJzwvYT48L2xpPjxsaSBjbGFzcz1cIicrbisnbmF2LW5leHRcIj48YSBjbGFzcz1cIicrbisnbmV4dFwiIGhyZWY9XCIjXCI+JythLnZhcnMubmV4dFRleHQrXCI8L2E+PC9saT48L3VsPlwiKTthLmN1c3RvbURpcmVjdGlvbk5hdj9hLmRpcmVjdGlvbk5hdj1hLmN1c3RvbURpcmVjdGlvbk5hdjphLmNvbnRyb2xzQ29udGFpbmVyPygkKGEuY29udHJvbHNDb250YWluZXIpLmFwcGVuZChlKSxhLmRpcmVjdGlvbk5hdj0kKFwiLlwiK24rXCJkaXJlY3Rpb24tbmF2IGxpIGFcIixhLmNvbnRyb2xzQ29udGFpbmVyKSk6KGEuYXBwZW5kKGUpLGEuZGlyZWN0aW9uTmF2PSQoXCIuXCIrbitcImRpcmVjdGlvbi1uYXYgbGkgYVwiLGEpKSxtLmRpcmVjdGlvbk5hdi51cGRhdGUoKSxhLmRpcmVjdGlvbk5hdi5iaW5kKHIsZnVuY3Rpb24oZSl7ZS5wcmV2ZW50RGVmYXVsdCgpO3ZhciB0OyhcIlwiPT09b3x8bz09PWUudHlwZSkmJih0PWEuZ2V0VGFyZ2V0KCQodGhpcykuaGFzQ2xhc3MobitcIm5leHRcIik/XCJuZXh0XCI6XCJwcmV2XCIpLGEuZmxleEFuaW1hdGUodCxhLnZhcnMucGF1c2VPbkFjdGlvbikpLFwiXCI9PT1vJiYobz1lLnR5cGUpLG0uc2V0VG9DbGVhcldhdGNoZWRFdmVudCgpfSl9LHVwZGF0ZTpmdW5jdGlvbigpe3ZhciBlPW4rXCJkaXNhYmxlZFwiOzE9PT1hLnBhZ2luZ0NvdW50P2EuZGlyZWN0aW9uTmF2LmFkZENsYXNzKGUpLmF0dHIoXCJ0YWJpbmRleFwiLFwiLTFcIik6YS52YXJzLmFuaW1hdGlvbkxvb3A/YS5kaXJlY3Rpb25OYXYucmVtb3ZlQ2xhc3MoZSkucmVtb3ZlQXR0cihcInRhYmluZGV4XCIpOjA9PT1hLmFuaW1hdGluZ1RvP2EuZGlyZWN0aW9uTmF2LnJlbW92ZUNsYXNzKGUpLmZpbHRlcihcIi5cIituK1wicHJldlwiKS5hZGRDbGFzcyhlKS5hdHRyKFwidGFiaW5kZXhcIixcIi0xXCIpOmEuYW5pbWF0aW5nVG89PT1hLmxhc3Q/YS5kaXJlY3Rpb25OYXYucmVtb3ZlQ2xhc3MoZSkuZmlsdGVyKFwiLlwiK24rXCJuZXh0XCIpLmFkZENsYXNzKGUpLmF0dHIoXCJ0YWJpbmRleFwiLFwiLTFcIik6YS5kaXJlY3Rpb25OYXYucmVtb3ZlQ2xhc3MoZSkucmVtb3ZlQXR0cihcInRhYmluZGV4XCIpfX0scGF1c2VQbGF5OntzZXR1cDpmdW5jdGlvbigpe3ZhciBlPSQoJzxkaXYgY2xhc3M9XCInK24rJ3BhdXNlcGxheVwiPjxhPjwvYT48L2Rpdj4nKTthLmNvbnRyb2xzQ29udGFpbmVyPyhhLmNvbnRyb2xzQ29udGFpbmVyLmFwcGVuZChlKSxhLnBhdXNlUGxheT0kKFwiLlwiK24rXCJwYXVzZXBsYXkgYVwiLGEuY29udHJvbHNDb250YWluZXIpKTooYS5hcHBlbmQoZSksYS5wYXVzZVBsYXk9JChcIi5cIituK1wicGF1c2VwbGF5IGFcIixhKSksbS5wYXVzZVBsYXkudXBkYXRlKGEudmFycy5zbGlkZXNob3c/bitcInBhdXNlXCI6bitcInBsYXlcIiksYS5wYXVzZVBsYXkuYmluZChyLGZ1bmN0aW9uKGUpe2UucHJldmVudERlZmF1bHQoKSwoXCJcIj09PW98fG89PT1lLnR5cGUpJiYoJCh0aGlzKS5oYXNDbGFzcyhuK1wicGF1c2VcIik/KGEubWFudWFsUGF1c2U9ITAsYS5tYW51YWxQbGF5PSExLGEucGF1c2UoKSk6KGEubWFudWFsUGF1c2U9ITEsYS5tYW51YWxQbGF5PSEwLGEucGxheSgpKSksXCJcIj09PW8mJihvPWUudHlwZSksbS5zZXRUb0NsZWFyV2F0Y2hlZEV2ZW50KCl9KX0sdXBkYXRlOmZ1bmN0aW9uKGUpe1wicGxheVwiPT09ZT9hLnBhdXNlUGxheS5yZW1vdmVDbGFzcyhuK1wicGF1c2VcIikuYWRkQ2xhc3MobitcInBsYXlcIikuaHRtbChhLnZhcnMucGxheVRleHQpOmEucGF1c2VQbGF5LnJlbW92ZUNsYXNzKG4rXCJwbGF5XCIpLmFkZENsYXNzKG4rXCJwYXVzZVwiKS5odG1sKGEudmFycy5wYXVzZVRleHQpfX0sdG91Y2g6ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KHQpe3Quc3RvcFByb3BhZ2F0aW9uKCksYS5hbmltYXRpbmc/dC5wcmV2ZW50RGVmYXVsdCgpOihhLnBhdXNlKCksZS5fZ2VzdHVyZS5hZGRQb2ludGVyKHQucG9pbnRlcklkKSx3PTAscD1jP2EuaDphLncsZj1OdW1iZXIobmV3IERhdGUpLGw9dSYmZCYmYS5hbmltYXRpbmdUbz09PWEubGFzdD8wOnUmJmQ/YS5saW1pdC0oYS5pdGVtVythLnZhcnMuaXRlbU1hcmdpbikqYS5tb3ZlKmEuYW5pbWF0aW5nVG86dSYmYS5jdXJyZW50U2xpZGU9PT1hLmxhc3Q/YS5saW1pdDp1PyhhLml0ZW1XK2EudmFycy5pdGVtTWFyZ2luKSphLm1vdmUqYS5jdXJyZW50U2xpZGU6ZD8oYS5sYXN0LWEuY3VycmVudFNsaWRlK2EuY2xvbmVPZmZzZXQpKnA6KGEuY3VycmVudFNsaWRlK2EuY2xvbmVPZmZzZXQpKnApfWZ1bmN0aW9uIG4odCl7dC5zdG9wUHJvcGFnYXRpb24oKTt2YXIgYT10LnRhcmdldC5fc2xpZGVyO2lmKGEpe3ZhciBuPS10LnRyYW5zbGF0aW9uWCxpPS10LnRyYW5zbGF0aW9uWTtyZXR1cm4gdys9Yz9pOm4sbT13LHk9Yz9NYXRoLmFicyh3KTxNYXRoLmFicygtbik6TWF0aC5hYnModyk8TWF0aC5hYnMoLWkpLHQuZGV0YWlsPT09dC5NU0dFU1RVUkVfRkxBR19JTkVSVElBP3ZvaWQgc2V0SW1tZWRpYXRlKGZ1bmN0aW9uKCl7ZS5fZ2VzdHVyZS5zdG9wKCl9KTp2b2lkKCgheXx8TnVtYmVyKG5ldyBEYXRlKS1mPjUwMCkmJih0LnByZXZlbnREZWZhdWx0KCksIXYmJmEudHJhbnNpdGlvbnMmJihhLnZhcnMuYW5pbWF0aW9uTG9vcHx8KG09dy8oMD09PWEuY3VycmVudFNsaWRlJiYwPnd8fGEuY3VycmVudFNsaWRlPT09YS5sYXN0JiZ3PjA/TWF0aC5hYnModykvcCsyOjEpKSxhLnNldFByb3BzKGwrbSxcInNldFRvdWNoXCIpKSkpfX1mdW5jdGlvbiBzKGUpe2Uuc3RvcFByb3BhZ2F0aW9uKCk7dmFyIHQ9ZS50YXJnZXQuX3NsaWRlcjtpZih0KXtpZih0LmFuaW1hdGluZ1RvPT09dC5jdXJyZW50U2xpZGUmJiF5JiZudWxsIT09bSl7dmFyIGE9ZD8tbTptLG49dC5nZXRUYXJnZXQoYT4wP1wibmV4dFwiOlwicHJldlwiKTt0LmNhbkFkdmFuY2UobikmJihOdW1iZXIobmV3IERhdGUpLWY8NTUwJiZNYXRoLmFicyhhKT41MHx8TWF0aC5hYnMoYSk+cC8yKT90LmZsZXhBbmltYXRlKG4sdC52YXJzLnBhdXNlT25BY3Rpb24pOnZ8fHQuZmxleEFuaW1hdGUodC5jdXJyZW50U2xpZGUsdC52YXJzLnBhdXNlT25BY3Rpb24sITApfXI9bnVsbCxvPW51bGwsbT1udWxsLGw9bnVsbCx3PTB9fXZhciByLG8sbCxwLG0sZixnLGgsUyx5PSExLHg9MCxiPTAsdz0wO2k/KGUuc3R5bGUubXNUb3VjaEFjdGlvbj1cIm5vbmVcIixlLl9nZXN0dXJlPW5ldyBNU0dlc3R1cmUsZS5fZ2VzdHVyZS50YXJnZXQ9ZSxlLmFkZEV2ZW50TGlzdGVuZXIoXCJNU1BvaW50ZXJEb3duXCIsdCwhMSksZS5fc2xpZGVyPWEsZS5hZGRFdmVudExpc3RlbmVyKFwiTVNHZXN0dXJlQ2hhbmdlXCIsbiwhMSksZS5hZGRFdmVudExpc3RlbmVyKFwiTVNHZXN0dXJlRW5kXCIscywhMSkpOihnPWZ1bmN0aW9uKHQpe2EuYW5pbWF0aW5nP3QucHJldmVudERlZmF1bHQoKTood2luZG93Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkfHwxPT09dC50b3VjaGVzLmxlbmd0aCkmJihhLnBhdXNlKCkscD1jP2EuaDphLncsZj1OdW1iZXIobmV3IERhdGUpLHg9dC50b3VjaGVzWzBdLnBhZ2VYLGI9dC50b3VjaGVzWzBdLnBhZ2VZLGw9dSYmZCYmYS5hbmltYXRpbmdUbz09PWEubGFzdD8wOnUmJmQ/YS5saW1pdC0oYS5pdGVtVythLnZhcnMuaXRlbU1hcmdpbikqYS5tb3ZlKmEuYW5pbWF0aW5nVG86dSYmYS5jdXJyZW50U2xpZGU9PT1hLmxhc3Q/YS5saW1pdDp1PyhhLml0ZW1XK2EudmFycy5pdGVtTWFyZ2luKSphLm1vdmUqYS5jdXJyZW50U2xpZGU6ZD8oYS5sYXN0LWEuY3VycmVudFNsaWRlK2EuY2xvbmVPZmZzZXQpKnA6KGEuY3VycmVudFNsaWRlK2EuY2xvbmVPZmZzZXQpKnAscj1jP2I6eCxvPWM/eDpiLGUuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNobW92ZVwiLGgsITEpLGUuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNoZW5kXCIsUywhMSkpfSxoPWZ1bmN0aW9uKGUpe3g9ZS50b3VjaGVzWzBdLnBhZ2VYLGI9ZS50b3VjaGVzWzBdLnBhZ2VZLG09Yz9yLWI6ci14LHk9Yz9NYXRoLmFicyhtKTxNYXRoLmFicyh4LW8pOk1hdGguYWJzKG0pPE1hdGguYWJzKGItbyk7dmFyIHQ9NTAwOygheXx8TnVtYmVyKG5ldyBEYXRlKS1mPnQpJiYoZS5wcmV2ZW50RGVmYXVsdCgpLCF2JiZhLnRyYW5zaXRpb25zJiYoYS52YXJzLmFuaW1hdGlvbkxvb3B8fChtLz0wPT09YS5jdXJyZW50U2xpZGUmJjA+bXx8YS5jdXJyZW50U2xpZGU9PT1hLmxhc3QmJm0+MD9NYXRoLmFicyhtKS9wKzI6MSksYS5zZXRQcm9wcyhsK20sXCJzZXRUb3VjaFwiKSkpfSxTPWZ1bmN0aW9uKHQpe2lmKGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRvdWNobW92ZVwiLGgsITEpLGEuYW5pbWF0aW5nVG89PT1hLmN1cnJlbnRTbGlkZSYmIXkmJm51bGwhPT1tKXt2YXIgbj1kPy1tOm0saT1hLmdldFRhcmdldChuPjA/XCJuZXh0XCI6XCJwcmV2XCIpO2EuY2FuQWR2YW5jZShpKSYmKE51bWJlcihuZXcgRGF0ZSktZjw1NTAmJk1hdGguYWJzKG4pPjUwfHxNYXRoLmFicyhuKT5wLzIpP2EuZmxleEFuaW1hdGUoaSxhLnZhcnMucGF1c2VPbkFjdGlvbik6dnx8YS5mbGV4QW5pbWF0ZShhLmN1cnJlbnRTbGlkZSxhLnZhcnMucGF1c2VPbkFjdGlvbiwhMCl9ZS5yZW1vdmVFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIixTLCExKSxyPW51bGwsbz1udWxsLG09bnVsbCxsPW51bGx9LGUuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNoc3RhcnRcIixnLCExKSl9LHJlc2l6ZTpmdW5jdGlvbigpeyFhLmFuaW1hdGluZyYmYS5pcyhcIjp2aXNpYmxlXCIpJiYodXx8YS5kb01hdGgoKSx2P20uc21vb3RoSGVpZ2h0KCk6dT8oYS5zbGlkZXMud2lkdGgoYS5jb21wdXRlZFcpLGEudXBkYXRlKGEucGFnaW5nQ291bnQpLGEuc2V0UHJvcHMoKSk6Yz8oYS52aWV3cG9ydC5oZWlnaHQoYS5oKSxhLnNldFByb3BzKGEuaCxcInNldFRvdGFsXCIpKTooYS52YXJzLnNtb290aEhlaWdodCYmbS5zbW9vdGhIZWlnaHQoKSxhLm5ld1NsaWRlcy53aWR0aChhLmNvbXB1dGVkVyksYS5zZXRQcm9wcyhhLmNvbXB1dGVkVyxcInNldFRvdGFsXCIpKSl9LHNtb290aEhlaWdodDpmdW5jdGlvbihlKXtpZighY3x8dil7dmFyIHQ9dj9hOmEudmlld3BvcnQ7ZT90LmFuaW1hdGUoe2hlaWdodDphLnNsaWRlcy5lcShhLmFuaW1hdGluZ1RvKS5oZWlnaHQoKX0sZSk6dC5oZWlnaHQoYS5zbGlkZXMuZXEoYS5hbmltYXRpbmdUbykuaGVpZ2h0KCkpfX0sc3luYzpmdW5jdGlvbihlKXt2YXIgdD0kKGEudmFycy5zeW5jKS5kYXRhKFwiZmxleHNsaWRlclwiKSxuPWEuYW5pbWF0aW5nVG87c3dpdGNoKGUpe2Nhc2VcImFuaW1hdGVcIjp0LmZsZXhBbmltYXRlKG4sYS52YXJzLnBhdXNlT25BY3Rpb24sITEsITApO2JyZWFrO2Nhc2VcInBsYXlcIjp0LnBsYXlpbmd8fHQuYXNOYXZ8fHQucGxheSgpO2JyZWFrO2Nhc2VcInBhdXNlXCI6dC5wYXVzZSgpfX0sdW5pcXVlSUQ6ZnVuY3Rpb24oZSl7cmV0dXJuIGUuZmlsdGVyKFwiW2lkXVwiKS5hZGQoZS5maW5kKFwiW2lkXVwiKSkuZWFjaChmdW5jdGlvbigpe3ZhciBlPSQodGhpcyk7ZS5hdHRyKFwiaWRcIixlLmF0dHIoXCJpZFwiKStcIl9jbG9uZVwiKX0pLGV9LHBhdXNlSW52aXNpYmxlOnt2aXNQcm9wOm51bGwsaW5pdDpmdW5jdGlvbigpe3ZhciBlPW0ucGF1c2VJbnZpc2libGUuZ2V0SGlkZGVuUHJvcCgpO2lmKGUpe3ZhciB0PWUucmVwbGFjZSgvW0h8aF1pZGRlbi8sXCJcIikrXCJ2aXNpYmlsaXR5Y2hhbmdlXCI7ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0LGZ1bmN0aW9uKCl7bS5wYXVzZUludmlzaWJsZS5pc0hpZGRlbigpP2Euc3RhcnRUaW1lb3V0P2NsZWFyVGltZW91dChhLnN0YXJ0VGltZW91dCk6YS5wYXVzZSgpOmEuc3RhcnRlZD9hLnBsYXkoKTphLnZhcnMuaW5pdERlbGF5PjA/c2V0VGltZW91dChhLnBsYXksYS52YXJzLmluaXREZWxheSk6YS5wbGF5KCl9KX19LGlzSGlkZGVuOmZ1bmN0aW9uKCl7dmFyIGU9bS5wYXVzZUludmlzaWJsZS5nZXRIaWRkZW5Qcm9wKCk7cmV0dXJuIGU/ZG9jdW1lbnRbZV06ITF9LGdldEhpZGRlblByb3A6ZnVuY3Rpb24oKXt2YXIgZT1bXCJ3ZWJraXRcIixcIm1velwiLFwibXNcIixcIm9cIl07aWYoXCJoaWRkZW5cImluIGRvY3VtZW50KXJldHVyblwiaGlkZGVuXCI7Zm9yKHZhciB0PTA7dDxlLmxlbmd0aDt0KyspaWYoZVt0XStcIkhpZGRlblwiaW4gZG9jdW1lbnQpcmV0dXJuIGVbdF0rXCJIaWRkZW5cIjtyZXR1cm4gbnVsbH19LHNldFRvQ2xlYXJXYXRjaGVkRXZlbnQ6ZnVuY3Rpb24oKXtjbGVhclRpbWVvdXQobCksbD1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7bz1cIlwifSwzZTMpfX0sYS5mbGV4QW5pbWF0ZT1mdW5jdGlvbihlLHQsaSxyLG8pe2lmKGEudmFycy5hbmltYXRpb25Mb29wfHxlPT09YS5jdXJyZW50U2xpZGV8fChhLmRpcmVjdGlvbj1lPmEuY3VycmVudFNsaWRlP1wibmV4dFwiOlwicHJldlwiKSxwJiYxPT09YS5wYWdpbmdDb3VudCYmKGEuZGlyZWN0aW9uPWEuY3VycmVudEl0ZW08ZT9cIm5leHRcIjpcInByZXZcIiksIWEuYW5pbWF0aW5nJiYoYS5jYW5BZHZhbmNlKGUsbyl8fGkpJiZhLmlzKFwiOnZpc2libGVcIikpe2lmKHAmJnIpe3ZhciBsPSQoYS52YXJzLmFzTmF2Rm9yKS5kYXRhKFwiZmxleHNsaWRlclwiKTtpZihhLmF0RW5kPTA9PT1lfHxlPT09YS5jb3VudC0xLGwuZmxleEFuaW1hdGUoZSwhMCwhMSwhMCxvKSxhLmRpcmVjdGlvbj1hLmN1cnJlbnRJdGVtPGU/XCJuZXh0XCI6XCJwcmV2XCIsbC5kaXJlY3Rpb249YS5kaXJlY3Rpb24sTWF0aC5jZWlsKChlKzEpL2EudmlzaWJsZSktMT09PWEuY3VycmVudFNsaWRlfHwwPT09ZSlyZXR1cm4gYS5jdXJyZW50SXRlbT1lLGEuc2xpZGVzLnJlbW92ZUNsYXNzKG4rXCJhY3RpdmUtc2xpZGVcIikuZXEoZSkuYWRkQ2xhc3MobitcImFjdGl2ZS1zbGlkZVwiKSwhMTthLmN1cnJlbnRJdGVtPWUsYS5zbGlkZXMucmVtb3ZlQ2xhc3MobitcImFjdGl2ZS1zbGlkZVwiKS5lcShlKS5hZGRDbGFzcyhuK1wiYWN0aXZlLXNsaWRlXCIpLGU9TWF0aC5mbG9vcihlL2EudmlzaWJsZSl9aWYoYS5hbmltYXRpbmc9ITAsYS5hbmltYXRpbmdUbz1lLHQmJmEucGF1c2UoKSxhLnZhcnMuYmVmb3JlKGEpLGEuc3luY0V4aXN0cyYmIW8mJm0uc3luYyhcImFuaW1hdGVcIiksYS52YXJzLmNvbnRyb2xOYXYmJm0uY29udHJvbE5hdi5hY3RpdmUoKSx1fHxhLnNsaWRlcy5yZW1vdmVDbGFzcyhuK1wiYWN0aXZlLXNsaWRlXCIpLmVxKGUpLmFkZENsYXNzKG4rXCJhY3RpdmUtc2xpZGVcIiksYS5hdEVuZD0wPT09ZXx8ZT09PWEubGFzdCxhLnZhcnMuZGlyZWN0aW9uTmF2JiZtLmRpcmVjdGlvbk5hdi51cGRhdGUoKSxlPT09YS5sYXN0JiYoYS52YXJzLmVuZChhKSxhLnZhcnMuYW5pbWF0aW9uTG9vcHx8YS5wYXVzZSgpKSx2KXM/KGEuc2xpZGVzLmVxKGEuY3VycmVudFNsaWRlKS5jc3Moe29wYWNpdHk6MCx6SW5kZXg6MX0pLGEuc2xpZGVzLmVxKGUpLmNzcyh7b3BhY2l0eToxLHpJbmRleDoyfSksYS53cmFwdXAoZikpOihhLnNsaWRlcy5lcShhLmN1cnJlbnRTbGlkZSkuY3NzKHt6SW5kZXg6MX0pLmFuaW1hdGUoe29wYWNpdHk6MH0sYS52YXJzLmFuaW1hdGlvblNwZWVkLGEudmFycy5lYXNpbmcpLGEuc2xpZGVzLmVxKGUpLmNzcyh7ekluZGV4OjJ9KS5hbmltYXRlKHtvcGFjaXR5OjF9LGEudmFycy5hbmltYXRpb25TcGVlZCxhLnZhcnMuZWFzaW5nLGEud3JhcHVwKSk7ZWxzZXt2YXIgZj1jP2Euc2xpZGVzLmZpbHRlcihcIjpmaXJzdFwiKS5oZWlnaHQoKTphLmNvbXB1dGVkVyxnLGgsUzt1PyhnPWEudmFycy5pdGVtTWFyZ2luLFM9KGEuaXRlbVcrZykqYS5tb3ZlKmEuYW5pbWF0aW5nVG8saD1TPmEubGltaXQmJjEhPT1hLnZpc2libGU/YS5saW1pdDpTKTpoPTA9PT1hLmN1cnJlbnRTbGlkZSYmZT09PWEuY291bnQtMSYmYS52YXJzLmFuaW1hdGlvbkxvb3AmJlwibmV4dFwiIT09YS5kaXJlY3Rpb24/ZD8oYS5jb3VudCthLmNsb25lT2Zmc2V0KSpmOjA6YS5jdXJyZW50U2xpZGU9PT1hLmxhc3QmJjA9PT1lJiZhLnZhcnMuYW5pbWF0aW9uTG9vcCYmXCJwcmV2XCIhPT1hLmRpcmVjdGlvbj9kPzA6KGEuY291bnQrMSkqZjpkPyhhLmNvdW50LTEtZSthLmNsb25lT2Zmc2V0KSpmOihlK2EuY2xvbmVPZmZzZXQpKmYsYS5zZXRQcm9wcyhoLFwiXCIsYS52YXJzLmFuaW1hdGlvblNwZWVkKSxhLnRyYW5zaXRpb25zPyhhLnZhcnMuYW5pbWF0aW9uTG9vcCYmYS5hdEVuZHx8KGEuYW5pbWF0aW5nPSExLGEuY3VycmVudFNsaWRlPWEuYW5pbWF0aW5nVG8pLGEuY29udGFpbmVyLnVuYmluZChcIndlYmtpdFRyYW5zaXRpb25FbmQgdHJhbnNpdGlvbmVuZFwiKSxhLmNvbnRhaW5lci5iaW5kKFwid2Via2l0VHJhbnNpdGlvbkVuZCB0cmFuc2l0aW9uZW5kXCIsZnVuY3Rpb24oKXtjbGVhclRpbWVvdXQoYS5lbnN1cmVBbmltYXRpb25FbmQpLGEud3JhcHVwKGYpfSksY2xlYXJUaW1lb3V0KGEuZW5zdXJlQW5pbWF0aW9uRW5kKSxhLmVuc3VyZUFuaW1hdGlvbkVuZD1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7YS53cmFwdXAoZil9LGEudmFycy5hbmltYXRpb25TcGVlZCsxMDApKTphLmNvbnRhaW5lci5hbmltYXRlKGEuYXJncyxhLnZhcnMuYW5pbWF0aW9uU3BlZWQsYS52YXJzLmVhc2luZyxmdW5jdGlvbigpe2Eud3JhcHVwKGYpfSl9YS52YXJzLnNtb290aEhlaWdodCYmbS5zbW9vdGhIZWlnaHQoYS52YXJzLmFuaW1hdGlvblNwZWVkKX19LGEud3JhcHVwPWZ1bmN0aW9uKGUpe3Z8fHV8fCgwPT09YS5jdXJyZW50U2xpZGUmJmEuYW5pbWF0aW5nVG89PT1hLmxhc3QmJmEudmFycy5hbmltYXRpb25Mb29wP2Euc2V0UHJvcHMoZSxcImp1bXBFbmRcIik6YS5jdXJyZW50U2xpZGU9PT1hLmxhc3QmJjA9PT1hLmFuaW1hdGluZ1RvJiZhLnZhcnMuYW5pbWF0aW9uTG9vcCYmYS5zZXRQcm9wcyhlLFwianVtcFN0YXJ0XCIpKSxhLmFuaW1hdGluZz0hMSxhLmN1cnJlbnRTbGlkZT1hLmFuaW1hdGluZ1RvLGEudmFycy5hZnRlcihhKX0sYS5hbmltYXRlU2xpZGVzPWZ1bmN0aW9uKCl7IWEuYW5pbWF0aW5nJiZmJiZhLmZsZXhBbmltYXRlKGEuZ2V0VGFyZ2V0KFwibmV4dFwiKSl9LGEucGF1c2U9ZnVuY3Rpb24oKXtjbGVhckludGVydmFsKGEuYW5pbWF0ZWRTbGlkZXMpLGEuYW5pbWF0ZWRTbGlkZXM9bnVsbCxhLnBsYXlpbmc9ITEsYS52YXJzLnBhdXNlUGxheSYmbS5wYXVzZVBsYXkudXBkYXRlKFwicGxheVwiKSxhLnN5bmNFeGlzdHMmJm0uc3luYyhcInBhdXNlXCIpfSxhLnBsYXk9ZnVuY3Rpb24oKXthLnBsYXlpbmcmJmNsZWFySW50ZXJ2YWwoYS5hbmltYXRlZFNsaWRlcyksYS5hbmltYXRlZFNsaWRlcz1hLmFuaW1hdGVkU2xpZGVzfHxzZXRJbnRlcnZhbChhLmFuaW1hdGVTbGlkZXMsYS52YXJzLnNsaWRlc2hvd1NwZWVkKSxhLnN0YXJ0ZWQ9YS5wbGF5aW5nPSEwLGEudmFycy5wYXVzZVBsYXkmJm0ucGF1c2VQbGF5LnVwZGF0ZShcInBhdXNlXCIpLGEuc3luY0V4aXN0cyYmbS5zeW5jKFwicGxheVwiKX0sYS5zdG9wPWZ1bmN0aW9uKCl7YS5wYXVzZSgpLGEuc3RvcHBlZD0hMH0sYS5jYW5BZHZhbmNlPWZ1bmN0aW9uKGUsdCl7dmFyIG49cD9hLnBhZ2luZ0NvdW50LTE6YS5sYXN0O3JldHVybiB0PyEwOnAmJmEuY3VycmVudEl0ZW09PT1hLmNvdW50LTEmJjA9PT1lJiZcInByZXZcIj09PWEuZGlyZWN0aW9uPyEwOnAmJjA9PT1hLmN1cnJlbnRJdGVtJiZlPT09YS5wYWdpbmdDb3VudC0xJiZcIm5leHRcIiE9PWEuZGlyZWN0aW9uPyExOmUhPT1hLmN1cnJlbnRTbGlkZXx8cD9hLnZhcnMuYW5pbWF0aW9uTG9vcD8hMDphLmF0RW5kJiYwPT09YS5jdXJyZW50U2xpZGUmJmU9PT1uJiZcIm5leHRcIiE9PWEuZGlyZWN0aW9uPyExOmEuYXRFbmQmJmEuY3VycmVudFNsaWRlPT09biYmMD09PWUmJlwibmV4dFwiPT09YS5kaXJlY3Rpb24/ITE6ITA6ITF9LGEuZ2V0VGFyZ2V0PWZ1bmN0aW9uKGUpe3JldHVybiBhLmRpcmVjdGlvbj1lLFwibmV4dFwiPT09ZT9hLmN1cnJlbnRTbGlkZT09PWEubGFzdD8wOmEuY3VycmVudFNsaWRlKzE6MD09PWEuY3VycmVudFNsaWRlP2EubGFzdDphLmN1cnJlbnRTbGlkZS0xfSxhLnNldFByb3BzPWZ1bmN0aW9uKGUsdCxuKXt2YXIgaT1mdW5jdGlvbigpe3ZhciBuPWU/ZTooYS5pdGVtVythLnZhcnMuaXRlbU1hcmdpbikqYS5tb3ZlKmEuYW5pbWF0aW5nVG8saT1mdW5jdGlvbigpe2lmKHUpcmV0dXJuXCJzZXRUb3VjaFwiPT09dD9lOmQmJmEuYW5pbWF0aW5nVG89PT1hLmxhc3Q/MDpkP2EubGltaXQtKGEuaXRlbVcrYS52YXJzLml0ZW1NYXJnaW4pKmEubW92ZSphLmFuaW1hdGluZ1RvOmEuYW5pbWF0aW5nVG89PT1hLmxhc3Q/YS5saW1pdDpuO3N3aXRjaCh0KXtjYXNlXCJzZXRUb3RhbFwiOnJldHVybiBkPyhhLmNvdW50LTEtYS5jdXJyZW50U2xpZGUrYS5jbG9uZU9mZnNldCkqZTooYS5jdXJyZW50U2xpZGUrYS5jbG9uZU9mZnNldCkqZTtjYXNlXCJzZXRUb3VjaFwiOnJldHVybiBkP2U6ZTtjYXNlXCJqdW1wRW5kXCI6cmV0dXJuIGQ/ZTphLmNvdW50KmU7Y2FzZVwianVtcFN0YXJ0XCI6cmV0dXJuIGQ/YS5jb3VudCplOmU7ZGVmYXVsdDpyZXR1cm4gZX19KCk7cmV0dXJuLTEqaStcInB4XCJ9KCk7YS50cmFuc2l0aW9ucyYmKGk9Yz9cInRyYW5zbGF0ZTNkKDAsXCIraStcIiwwKVwiOlwidHJhbnNsYXRlM2QoXCIraStcIiwwLDApXCIsbj12b2lkIDAhPT1uP24vMWUzK1wic1wiOlwiMHNcIixhLmNvbnRhaW5lci5jc3MoXCItXCIrYS5wZngrXCItdHJhbnNpdGlvbi1kdXJhdGlvblwiLG4pLGEuY29udGFpbmVyLmNzcyhcInRyYW5zaXRpb24tZHVyYXRpb25cIixuKSksYS5hcmdzW2EucHJvcF09aSwoYS50cmFuc2l0aW9uc3x8dm9pZCAwPT09bikmJmEuY29udGFpbmVyLmNzcyhhLmFyZ3MpLGEuY29udGFpbmVyLmNzcyhcInRyYW5zZm9ybVwiLGkpfSxhLnNldHVwPWZ1bmN0aW9uKGUpe2lmKHYpYS5zbGlkZXMuY3NzKHt3aWR0aDpcIjEwMCVcIixcImZsb2F0XCI6XCJsZWZ0XCIsbWFyZ2luUmlnaHQ6XCItMTAwJVwiLHBvc2l0aW9uOlwicmVsYXRpdmVcIn0pLFwiaW5pdFwiPT09ZSYmKHM/YS5zbGlkZXMuY3NzKHtvcGFjaXR5OjAsZGlzcGxheTpcImJsb2NrXCIsd2Via2l0VHJhbnNpdGlvbjpcIm9wYWNpdHkgXCIrYS52YXJzLmFuaW1hdGlvblNwZWVkLzFlMytcInMgZWFzZVwiLHpJbmRleDoxfSkuZXEoYS5jdXJyZW50U2xpZGUpLmNzcyh7b3BhY2l0eToxLHpJbmRleDoyfSk6MD09YS52YXJzLmZhZGVGaXJzdFNsaWRlP2Euc2xpZGVzLmNzcyh7b3BhY2l0eTowLGRpc3BsYXk6XCJibG9ja1wiLHpJbmRleDoxfSkuZXEoYS5jdXJyZW50U2xpZGUpLmNzcyh7ekluZGV4OjJ9KS5jc3Moe29wYWNpdHk6MX0pOmEuc2xpZGVzLmNzcyh7b3BhY2l0eTowLGRpc3BsYXk6XCJibG9ja1wiLHpJbmRleDoxfSkuZXEoYS5jdXJyZW50U2xpZGUpLmNzcyh7ekluZGV4OjJ9KS5hbmltYXRlKHtvcGFjaXR5OjF9LGEudmFycy5hbmltYXRpb25TcGVlZCxhLnZhcnMuZWFzaW5nKSksYS52YXJzLnNtb290aEhlaWdodCYmbS5zbW9vdGhIZWlnaHQoKTtlbHNle3ZhciB0LGk7XCJpbml0XCI9PT1lJiYoYS52aWV3cG9ydD0kKCc8ZGl2IGNsYXNzPVwiJytuKyd2aWV3cG9ydFwiPjwvZGl2PicpLmNzcyh7b3ZlcmZsb3c6XCJoaWRkZW5cIixwb3NpdGlvbjpcInJlbGF0aXZlXCJ9KS5hcHBlbmRUbyhhKS5hcHBlbmQoYS5jb250YWluZXIpLGEuY2xvbmVDb3VudD0wLGEuY2xvbmVPZmZzZXQ9MCxkJiYoaT0kLm1ha2VBcnJheShhLnNsaWRlcykucmV2ZXJzZSgpLGEuc2xpZGVzPSQoaSksYS5jb250YWluZXIuZW1wdHkoKS5hcHBlbmQoYS5zbGlkZXMpKSksYS52YXJzLmFuaW1hdGlvbkxvb3AmJiF1JiYoYS5jbG9uZUNvdW50PTIsYS5jbG9uZU9mZnNldD0xLFwiaW5pdFwiIT09ZSYmYS5jb250YWluZXIuZmluZChcIi5jbG9uZVwiKS5yZW1vdmUoKSxhLmNvbnRhaW5lci5hcHBlbmQobS51bmlxdWVJRChhLnNsaWRlcy5maXJzdCgpLmNsb25lKCkuYWRkQ2xhc3MoXCJjbG9uZVwiKSkuYXR0cihcImFyaWEtaGlkZGVuXCIsXCJ0cnVlXCIpKS5wcmVwZW5kKG0udW5pcXVlSUQoYS5zbGlkZXMubGFzdCgpLmNsb25lKCkuYWRkQ2xhc3MoXCJjbG9uZVwiKSkuYXR0cihcImFyaWEtaGlkZGVuXCIsXCJ0cnVlXCIpKSksYS5uZXdTbGlkZXM9JChhLnZhcnMuc2VsZWN0b3IsYSksdD1kP2EuY291bnQtMS1hLmN1cnJlbnRTbGlkZSthLmNsb25lT2Zmc2V0OmEuY3VycmVudFNsaWRlK2EuY2xvbmVPZmZzZXQsYyYmIXU/KGEuY29udGFpbmVyLmhlaWdodCgyMDAqKGEuY291bnQrYS5jbG9uZUNvdW50KStcIiVcIikuY3NzKFwicG9zaXRpb25cIixcImFic29sdXRlXCIpLndpZHRoKFwiMTAwJVwiKSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7YS5uZXdTbGlkZXMuY3NzKHtkaXNwbGF5OlwiYmxvY2tcIn0pLGEuZG9NYXRoKCksYS52aWV3cG9ydC5oZWlnaHQoYS5oKSxhLnNldFByb3BzKHQqYS5oLFwiaW5pdFwiKX0sXCJpbml0XCI9PT1lPzEwMDowKSk6KGEuY29udGFpbmVyLndpZHRoKDIwMCooYS5jb3VudCthLmNsb25lQ291bnQpK1wiJVwiKSxhLnNldFByb3BzKHQqYS5jb21wdXRlZFcsXCJpbml0XCIpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXthLmRvTWF0aCgpLGEubmV3U2xpZGVzLmNzcyh7d2lkdGg6YS5jb21wdXRlZFcsXCJmbG9hdFwiOlwibGVmdFwiLGRpc3BsYXk6XCJibG9ja1wifSksYS52YXJzLnNtb290aEhlaWdodCYmbS5zbW9vdGhIZWlnaHQoKX0sXCJpbml0XCI9PT1lPzEwMDowKSl9dXx8YS5zbGlkZXMucmVtb3ZlQ2xhc3MobitcImFjdGl2ZS1zbGlkZVwiKS5lcShhLmN1cnJlbnRTbGlkZSkuYWRkQ2xhc3MobitcImFjdGl2ZS1zbGlkZVwiKSxhLnZhcnMuaW5pdChhKX0sYS5kb01hdGg9ZnVuY3Rpb24oKXt2YXIgZT1hLnNsaWRlcy5maXJzdCgpLHQ9YS52YXJzLml0ZW1NYXJnaW4sbj1hLnZhcnMubWluSXRlbXMsaT1hLnZhcnMubWF4SXRlbXM7YS53PXZvaWQgMD09PWEudmlld3BvcnQ/YS53aWR0aCgpOmEudmlld3BvcnQud2lkdGgoKSxhLmg9ZS5oZWlnaHQoKSxhLmJveFBhZGRpbmc9ZS5vdXRlcldpZHRoKCktZS53aWR0aCgpLHU/KGEuaXRlbVQ9YS52YXJzLml0ZW1XaWR0aCt0LGEubWluVz1uP24qYS5pdGVtVDphLncsYS5tYXhXPWk/aSphLml0ZW1ULXQ6YS53LGEuaXRlbVc9YS5taW5XPmEudz8oYS53LXQqKG4tMSkpL246YS5tYXhXPGEudz8oYS53LXQqKGktMSkpL2k6YS52YXJzLml0ZW1XaWR0aD5hLnc/YS53OmEudmFycy5pdGVtV2lkdGgsYS52aXNpYmxlPU1hdGguZmxvb3IoYS53L2EuaXRlbVcpLGEubW92ZT1hLnZhcnMubW92ZT4wJiZhLnZhcnMubW92ZTxhLnZpc2libGU/YS52YXJzLm1vdmU6YS52aXNpYmxlLGEucGFnaW5nQ291bnQ9TWF0aC5jZWlsKChhLmNvdW50LWEudmlzaWJsZSkvYS5tb3ZlKzEpLGEubGFzdD1hLnBhZ2luZ0NvdW50LTEsYS5saW1pdD0xPT09YS5wYWdpbmdDb3VudD8wOmEudmFycy5pdGVtV2lkdGg+YS53P2EuaXRlbVcqKGEuY291bnQtMSkrdCooYS5jb3VudC0xKTooYS5pdGVtVyt0KSphLmNvdW50LWEudy10KTooYS5pdGVtVz1hLncsYS5wYWdpbmdDb3VudD1hLmNvdW50LGEubGFzdD1hLmNvdW50LTEpLGEuY29tcHV0ZWRXPWEuaXRlbVctYS5ib3hQYWRkaW5nfSxhLnVwZGF0ZT1mdW5jdGlvbihlLHQpe2EuZG9NYXRoKCksdXx8KGU8YS5jdXJyZW50U2xpZGU/YS5jdXJyZW50U2xpZGUrPTE6ZTw9YS5jdXJyZW50U2xpZGUmJjAhPT1lJiYoYS5jdXJyZW50U2xpZGUtPTEpLGEuYW5pbWF0aW5nVG89YS5jdXJyZW50U2xpZGUpLGEudmFycy5jb250cm9sTmF2JiYhYS5tYW51YWxDb250cm9scyYmKFwiYWRkXCI9PT10JiYhdXx8YS5wYWdpbmdDb3VudD5hLmNvbnRyb2xOYXYubGVuZ3RoP20uY29udHJvbE5hdi51cGRhdGUoXCJhZGRcIik6KFwicmVtb3ZlXCI9PT10JiYhdXx8YS5wYWdpbmdDb3VudDxhLmNvbnRyb2xOYXYubGVuZ3RoKSYmKHUmJmEuY3VycmVudFNsaWRlPmEubGFzdCYmKGEuY3VycmVudFNsaWRlLT0xLGEuYW5pbWF0aW5nVG8tPTEpLG0uY29udHJvbE5hdi51cGRhdGUoXCJyZW1vdmVcIixhLmxhc3QpKSksYS52YXJzLmRpcmVjdGlvbk5hdiYmbS5kaXJlY3Rpb25OYXYudXBkYXRlKCl9LGEuYWRkU2xpZGU9ZnVuY3Rpb24oZSx0KXt2YXIgbj0kKGUpO2EuY291bnQrPTEsYS5sYXN0PWEuY291bnQtMSxjJiZkP3ZvaWQgMCE9PXQ/YS5zbGlkZXMuZXEoYS5jb3VudC10KS5hZnRlcihuKTphLmNvbnRhaW5lci5wcmVwZW5kKG4pOnZvaWQgMCE9PXQ/YS5zbGlkZXMuZXEodCkuYmVmb3JlKG4pOmEuY29udGFpbmVyLmFwcGVuZChuKSxhLnVwZGF0ZSh0LFwiYWRkXCIpLGEuc2xpZGVzPSQoYS52YXJzLnNlbGVjdG9yK1wiOm5vdCguY2xvbmUpXCIsYSksYS5zZXR1cCgpLGEudmFycy5hZGRlZChhKX0sYS5yZW1vdmVTbGlkZT1mdW5jdGlvbihlKXt2YXIgdD1pc05hTihlKT9hLnNsaWRlcy5pbmRleCgkKGUpKTplO2EuY291bnQtPTEsYS5sYXN0PWEuY291bnQtMSxpc05hTihlKT8kKGUsYS5zbGlkZXMpLnJlbW92ZSgpOmMmJmQ/YS5zbGlkZXMuZXEoYS5sYXN0KS5yZW1vdmUoKTphLnNsaWRlcy5lcShlKS5yZW1vdmUoKSxhLmRvTWF0aCgpLGEudXBkYXRlKHQsXCJyZW1vdmVcIiksYS5zbGlkZXM9JChhLnZhcnMuc2VsZWN0b3IrXCI6bm90KC5jbG9uZSlcIixhKSxhLnNldHVwKCksYS52YXJzLnJlbW92ZWQoYSl9LG0uaW5pdCgpfSwkKHdpbmRvdykuYmx1cihmdW5jdGlvbihlKXtmb2N1c2VkPSExfSkuZm9jdXMoZnVuY3Rpb24oZSl7Zm9jdXNlZD0hMH0pLCQuZmxleHNsaWRlci5kZWZhdWx0cz17bmFtZXNwYWNlOlwiZmxleC1cIixzZWxlY3RvcjpcIi5zbGlkZXMgPiBsaVwiLGFuaW1hdGlvbjpcImZhZGVcIixlYXNpbmc6XCJzd2luZ1wiLGRpcmVjdGlvbjpcImhvcml6b250YWxcIixyZXZlcnNlOiExLGFuaW1hdGlvbkxvb3A6ITAsc21vb3RoSGVpZ2h0OiExLHN0YXJ0QXQ6MCxzbGlkZXNob3c6ITAsc2xpZGVzaG93U3BlZWQ6N2UzLGFuaW1hdGlvblNwZWVkOjYwMCxpbml0RGVsYXk6MCxyYW5kb21pemU6ITEsZmFkZUZpcnN0U2xpZGU6ITAsdGh1bWJDYXB0aW9uczohMSxwYXVzZU9uQWN0aW9uOiEwLHBhdXNlT25Ib3ZlcjohMSxwYXVzZUludmlzaWJsZTohMCx1c2VDU1M6ITAsdG91Y2g6ITAsdmlkZW86ITEsY29udHJvbE5hdjohMCxkaXJlY3Rpb25OYXY6ITAscHJldlRleHQ6XCJQcmV2aW91c1wiLG5leHRUZXh0OlwiTmV4dFwiLGtleWJvYXJkOiEwLG11bHRpcGxlS2V5Ym9hcmQ6ITEsbW91c2V3aGVlbDohMSxwYXVzZVBsYXk6ITEscGF1c2VUZXh0OlwiUGF1c2VcIixwbGF5VGV4dDpcIlBsYXlcIixjb250cm9sc0NvbnRhaW5lcjpcIlwiLG1hbnVhbENvbnRyb2xzOlwiXCIsY3VzdG9tRGlyZWN0aW9uTmF2OlwiXCIsc3luYzpcIlwiLGFzTmF2Rm9yOlwiXCIsaXRlbVdpZHRoOjAsaXRlbU1hcmdpbjowLG1pbkl0ZW1zOjEsbWF4SXRlbXM6MCxtb3ZlOjAsYWxsb3dPbmVTbGlkZTohMCxzdGFydDpmdW5jdGlvbigpe30sYmVmb3JlOmZ1bmN0aW9uKCl7fSxhZnRlcjpmdW5jdGlvbigpe30sZW5kOmZ1bmN0aW9uKCl7fSxhZGRlZDpmdW5jdGlvbigpe30scmVtb3ZlZDpmdW5jdGlvbigpe30saW5pdDpmdW5jdGlvbigpe319LCQuZm4uZmxleHNsaWRlcj1mdW5jdGlvbihlKXtpZih2b2lkIDA9PT1lJiYoZT17fSksXCJvYmplY3RcIj09dHlwZW9mIGUpcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciB0PSQodGhpcyksYT1lLnNlbGVjdG9yP2Uuc2VsZWN0b3I6XCIuc2xpZGVzID4gbGlcIixuPXQuZmluZChhKTsxPT09bi5sZW5ndGgmJmUuYWxsb3dPbmVTbGlkZT09PSEwfHwwPT09bi5sZW5ndGg/KG4uZmFkZUluKDQwMCksZS5zdGFydCYmZS5zdGFydCh0KSk6dm9pZCAwPT09dC5kYXRhKFwiZmxleHNsaWRlclwiKSYmbmV3ICQuZmxleHNsaWRlcih0aGlzLGUpfSk7dmFyIHQ9JCh0aGlzKS5kYXRhKFwiZmxleHNsaWRlclwiKTtzd2l0Y2goZSl7Y2FzZVwicGxheVwiOnQucGxheSgpO2JyZWFrO2Nhc2VcInBhdXNlXCI6dC5wYXVzZSgpO2JyZWFrO2Nhc2VcInN0b3BcIjp0LnN0b3AoKTticmVhaztjYXNlXCJuZXh0XCI6dC5mbGV4QW5pbWF0ZSh0LmdldFRhcmdldChcIm5leHRcIiksITApO2JyZWFrO2Nhc2VcInByZXZcIjpjYXNlXCJwcmV2aW91c1wiOnQuZmxleEFuaW1hdGUodC5nZXRUYXJnZXQoXCJwcmV2XCIpLCEwKTticmVhaztkZWZhdWx0OlwibnVtYmVyXCI9PXR5cGVvZiBlJiZ0LmZsZXhBbmltYXRlKGUsITApfX19KGpRdWVyeSk7IiwiLyohXG4gKiBjbGFzc2llIHYxLjAuMVxuICogY2xhc3MgaGVscGVyIGZ1bmN0aW9uc1xuICogZnJvbSBib256byBodHRwczovL2dpdGh1Yi5jb20vZGVkL2JvbnpvXG4gKiBNSVQgbGljZW5zZVxuICogXG4gKiBjbGFzc2llLmhhcyggZWxlbSwgJ215LWNsYXNzJyApIC0+IHRydWUvZmFsc2VcbiAqIGNsYXNzaWUuYWRkKCBlbGVtLCAnbXktbmV3LWNsYXNzJyApXG4gKiBjbGFzc2llLnJlbW92ZSggZWxlbSwgJ215LXVud2FudGVkLWNsYXNzJyApXG4gKiBjbGFzc2llLnRvZ2dsZSggZWxlbSwgJ215LWNsYXNzJyApXG4gKi9cblxuLypqc2hpbnQgYnJvd3NlcjogdHJ1ZSwgc3RyaWN0OiB0cnVlLCB1bmRlZjogdHJ1ZSwgdW51c2VkOiB0cnVlICovXG4vKmdsb2JhbCBkZWZpbmU6IGZhbHNlLCBtb2R1bGU6IGZhbHNlICovXG5cbiggZnVuY3Rpb24oIHdpbmRvdyApIHtcblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBjbGFzcyBoZWxwZXIgZnVuY3Rpb25zIGZyb20gYm9uem8gaHR0cHM6Ly9naXRodWIuY29tL2RlZC9ib256b1xuXG5mdW5jdGlvbiBjbGFzc1JlZyggY2xhc3NOYW1lICkge1xuICByZXR1cm4gbmV3IFJlZ0V4cChcIihefFxcXFxzKylcIiArIGNsYXNzTmFtZSArIFwiKFxcXFxzK3wkKVwiKTtcbn1cblxuLy8gY2xhc3NMaXN0IHN1cHBvcnQgZm9yIGNsYXNzIG1hbmFnZW1lbnRcbi8vIGFsdGhvIHRvIGJlIGZhaXIsIHRoZSBhcGkgc3Vja3MgYmVjYXVzZSBpdCB3b24ndCBhY2NlcHQgbXVsdGlwbGUgY2xhc3NlcyBhdCBvbmNlXG52YXIgaGFzQ2xhc3MsIGFkZENsYXNzLCByZW1vdmVDbGFzcztcblxuaWYgKCAnY2xhc3NMaXN0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgKSB7XG4gIGhhc0NsYXNzID0gZnVuY3Rpb24oIGVsZW0sIGMgKSB7XG4gICAgcmV0dXJuIGVsZW0uY2xhc3NMaXN0LmNvbnRhaW5zKCBjICk7XG4gIH07XG4gIGFkZENsYXNzID0gZnVuY3Rpb24oIGVsZW0sIGMgKSB7XG4gICAgZWxlbS5jbGFzc0xpc3QuYWRkKCBjICk7XG4gIH07XG4gIHJlbW92ZUNsYXNzID0gZnVuY3Rpb24oIGVsZW0sIGMgKSB7XG4gICAgZWxlbS5jbGFzc0xpc3QucmVtb3ZlKCBjICk7XG4gIH07XG59XG5lbHNlIHtcbiAgaGFzQ2xhc3MgPSBmdW5jdGlvbiggZWxlbSwgYyApIHtcbiAgICByZXR1cm4gY2xhc3NSZWcoIGMgKS50ZXN0KCBlbGVtLmNsYXNzTmFtZSApO1xuICB9O1xuICBhZGRDbGFzcyA9IGZ1bmN0aW9uKCBlbGVtLCBjICkge1xuICAgIGlmICggIWhhc0NsYXNzKCBlbGVtLCBjICkgKSB7XG4gICAgICBlbGVtLmNsYXNzTmFtZSA9IGVsZW0uY2xhc3NOYW1lICsgJyAnICsgYztcbiAgICB9XG4gIH07XG4gIHJlbW92ZUNsYXNzID0gZnVuY3Rpb24oIGVsZW0sIGMgKSB7XG4gICAgZWxlbS5jbGFzc05hbWUgPSBlbGVtLmNsYXNzTmFtZS5yZXBsYWNlKCBjbGFzc1JlZyggYyApLCAnICcgKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdG9nZ2xlQ2xhc3MoIGVsZW0sIGMgKSB7XG4gIHZhciBmbiA9IGhhc0NsYXNzKCBlbGVtLCBjICkgPyByZW1vdmVDbGFzcyA6IGFkZENsYXNzO1xuICBmbiggZWxlbSwgYyApO1xufVxuXG52YXIgY2xhc3NpZSA9IHtcbiAgLy8gZnVsbCBuYW1lc1xuICBoYXNDbGFzczogaGFzQ2xhc3MsXG4gIGFkZENsYXNzOiBhZGRDbGFzcyxcbiAgcmVtb3ZlQ2xhc3M6IHJlbW92ZUNsYXNzLFxuICB0b2dnbGVDbGFzczogdG9nZ2xlQ2xhc3MsXG4gIC8vIHNob3J0IG5hbWVzXG4gIGhhczogaGFzQ2xhc3MsXG4gIGFkZDogYWRkQ2xhc3MsXG4gIHJlbW92ZTogcmVtb3ZlQ2xhc3MsXG4gIHRvZ2dsZTogdG9nZ2xlQ2xhc3Ncbn07XG5cbi8vIHRyYW5zcG9ydFxuaWYgKCB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gIC8vIEFNRFxuICBkZWZpbmUoIGNsYXNzaWUgKTtcbn0gZWxzZSBpZiAoIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyApIHtcbiAgLy8gQ29tbW9uSlNcbiAgbW9kdWxlLmV4cG9ydHMgPSBjbGFzc2llO1xufSBlbHNlIHtcbiAgLy8gYnJvd3NlciBnbG9iYWxcbiAgd2luZG93LmNsYXNzaWUgPSBjbGFzc2llO1xufVxuXG59KSggd2luZG93ICk7XG4iLCIvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXHRQT1BVUC5KU1xuXG5cdFNpbXBsZSBQb3B1cCBwbHVnaW4gZm9yIGpRdWVyeVxuXG5cdEBhdXRob3IgVG9kZCBGcmFuY2lzXG5cdEB2ZXJzaW9uIDIuMi4zXG5cbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG47KGZ1bmN0aW9uKGIsdCl7Yi5mbi5wb3B1cD1mdW5jdGlvbihoKXt2YXIgcT10aGlzLnNlbGVjdG9yLG09bmV3IGIuUG9wdXAoaCk7Yihkb2N1bWVudCkub24oXCJjbGljay5wb3B1cFwiLHEsZnVuY3Rpb24obil7dmFyIGs9aCYmaC5jb250ZW50P2guY29udGVudDpiKHRoaXMpLmF0dHIoXCJocmVmXCIpO24ucHJldmVudERlZmF1bHQoKTttLm9wZW4oayx2b2lkIDAsdGhpcyl9KTtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7Yih0aGlzKS5kYXRhKFwicG9wdXBcIixtKX0pfTtiLlBvcHVwPWZ1bmN0aW9uKGgpe2Z1bmN0aW9uIHEoYSl7dmFyIGQ7Yi5lYWNoKGEsZnVuY3Rpb24oYSxjKXtpZihjKXJldHVybiBkPWMsITF9KTtyZXR1cm4gZH1mdW5jdGlvbiBtKGEpe3JldHVyblwiZnVuY3Rpb25cIj09PXR5cGVvZiBhP1wiZnVuY3Rpb25cIjphIGluc3RhbmNlb2YgYj9cImpRdWVyeVwiOlwiI1wiPT09YS5zdWJzdHIoMCwxKXx8XCIuXCI9PT1hLnN1YnN0cigwLDEpP1wiaW5saW5lXCI6LTEhPT1iLmluQXJyYXkoYS5zdWJzdHIoYS5sZW5ndGgtXG4zKSx1KT9cImltYWdlXCI6XCJodHRwXCI9PT1hLnN1YnN0cigwLDQpP1wiZXh0ZXJuYWxcIjpcImFqYXhcIn1mdW5jdGlvbiBuKGMpe3ImJnIuZmFkZU91dChcImZhc3RcIixmdW5jdGlvbigpe2IodGhpcykucmVtb3ZlKCl9KTt2YXIgZD0hMDt2b2lkIDA9PT1mJiYoZD0hMSxmPWIoJzxkaXYgY2xhc3M9XCInK2Euby5jb250YWluZXJDbGFzcysnXCI+JykscD1iKGEuby5tYXJrdXApLmFwcGVuZFRvKGYpLGIoYS5vLmNsb3NlQ29udGVudCkub25lKFwiY2xpY2tcIixmdW5jdGlvbigpe2EuY2xvc2UoKX0pLmFwcGVuZFRvKGYpLGIodCkucmVzaXplKGEuY2VudGVyKSxmLmFwcGVuZFRvKGIoXCJib2R5XCIpKS5jc3MoXCJvcGFjaXR5XCIsMCkpO3ZhciBlPWIoXCIuXCIrYS5vLmNvbnRlbnRDbGFzcyxmKTthLndpZHRoP2UuY3NzKFwid2lkdGhcIixhLndpZHRoLDEwKTplLmNzcyhcIndpZHRoXCIsXCJcIik7YS5oZWlnaHQ/ZS5jc3MoXCJoZWlnaHRcIixhLmhlaWdodCwxMCk6ZS5jc3MoXCJoZWlnaHRcIixcIlwiKTtwLmhhc0NsYXNzKGEuby5jb250ZW50Q2xhc3MpP1xucC5odG1sKGMpOnAuZmluZChcIi5cIithLm8uY29udGVudENsYXNzKS5odG1sKGMpO2Q/YS5vLnJlcGxhY2VkLmNhbGwoYSxmLGcpOmEuby5zaG93LmNhbGwoYSxmLGcpfWZ1bmN0aW9uIGsoYSxkKXt2YXIgYj0obmV3IFJlZ0V4cChcIls/Jl1cIithK1wiPShbXiZdKilcIikpLmV4ZWMoZCk7cmV0dXJuIGImJmRlY29kZVVSSUNvbXBvbmVudChiWzFdLnJlcGxhY2UoL1xcKy9nLFwiIFwiKSl9dmFyIGE9dGhpcyx1PVtcInBuZ1wiLFwianBnXCIsXCJnaWZcIl0sbCxzLGcsZixyLHA7YS5lbGU9dm9pZCAwO2Eubz1iLmV4dGVuZCghMCx7fSx7YmFja0NsYXNzOlwicG9wdXBfYmFja1wiLGJhY2tPcGFjaXR5Oi43LGNvbnRhaW5lckNsYXNzOlwicG9wdXBfY29udFwiLGNsb3NlQ29udGVudDonPGRpdiBjbGFzcz1cInBvcHVwX2Nsb3NlXCI+JnRpbWVzOzwvZGl2PicsbWFya3VwOic8ZGl2IGNsYXNzPVwicG9wdXBcIj48ZGl2IGNsYXNzPVwicG9wdXBfY29udGVudFwiLz48L2Rpdj4nLGNvbnRlbnRDbGFzczpcInBvcHVwX2NvbnRlbnRcIixcbnByZWxvYWRlckNvbnRlbnQ6JzxwIGNsYXNzPVwicHJlbG9hZGVyXCI+TG9hZGluZzwvcD4nLGFjdGl2ZUNsYXNzOlwicG9wdXBfYWN0aXZlXCIsaGlkZUZsYXNoOiExLHNwZWVkOjIwMCxwb3B1cFBsYWNlaG9sZGVyQ2xhc3M6XCJwb3B1cF9wbGFjZWhvbGRlclwiLGtlZXBJbmxpbmVDaGFuZ2VzOiEwLG1vZGFsOiExLGNvbnRlbnQ6bnVsbCx0eXBlOlwiYXV0b1wiLHdpZHRoOm51bGwsaGVpZ2h0Om51bGwsdHlwZVBhcmFtOlwicHRcIix3aWR0aFBhcmFtOlwicHdcIixoZWlnaHRQYXJhbTpcInBoXCIsYmVmb3JlT3BlbjpmdW5jdGlvbihhKXt9LGFmdGVyT3BlbjpmdW5jdGlvbigpe30sYmVmb3JlQ2xvc2U6ZnVuY3Rpb24oKXt9LGFmdGVyQ2xvc2U6ZnVuY3Rpb24oKXt9LGVycm9yOmZ1bmN0aW9uKCl7fSxzaG93OmZ1bmN0aW9uKGEsYil7dmFyIGU9dGhpcztlLmNlbnRlcigpO2EuYW5pbWF0ZSh7b3BhY2l0eToxfSxlLm8uc3BlZWQsZnVuY3Rpb24oKXtlLm8uYWZ0ZXJPcGVuLmNhbGwoZSl9KX0scmVwbGFjZWQ6ZnVuY3Rpb24oYSxcbmIpe3RoaXMuY2VudGVyKCkuby5hZnRlck9wZW4uY2FsbCh0aGlzKX0saGlkZTpmdW5jdGlvbihhLGIpe3ZvaWQgMCE9PWEmJmEuYW5pbWF0ZSh7b3BhY2l0eTowfSx0aGlzLm8uc3BlZWQpfSx0eXBlczp7aW5saW5lOmZ1bmN0aW9uKGMsZCl7dmFyIGU9YihjKTtlLmFkZENsYXNzKGEuby5wb3B1cFBsYWNlaG9sZGVyQ2xhc3MpO2Euby5rZWVwSW5saW5lQ2hhbmdlc3x8KHM9ZS5odG1sKCkpO2QuY2FsbCh0aGlzLGUuY2hpbGRyZW4oKSl9LGltYWdlOmZ1bmN0aW9uKGMsZCl7dmFyIGU9dGhpcztiKFwiPGltZyAvPlwiKS5vbmUoXCJsb2FkXCIsZnVuY3Rpb24oKXt2YXIgYT10aGlzO3NldFRpbWVvdXQoZnVuY3Rpb24oKXtkLmNhbGwoZSxhKX0sMCl9KS5vbmUoXCJlcnJvclwiLGZ1bmN0aW9uKCl7YS5vLmVycm9yLmNhbGwoYSxjLFwiaW1hZ2VcIil9KS5hdHRyKFwic3JjXCIsYykuZWFjaChmdW5jdGlvbigpe3RoaXMuY29tcGxldGUmJmIodGhpcykudHJpZ2dlcihcImxvYWRcIil9KX0sZXh0ZXJuYWw6ZnVuY3Rpb24oYyxcbmQpe3ZhciBlPWIoXCI8aWZyYW1lIC8+XCIpLmF0dHIoe3NyYzpjLGZyYW1lYm9yZGVyOjAsd2lkdGg6YS53aWR0aCxoZWlnaHQ6YS5oZWlnaHR9KTtkLmNhbGwodGhpcyxlKX0saHRtbDpmdW5jdGlvbihhLGIpe2IuY2FsbCh0aGlzLGEpfSxqUXVlcnk6ZnVuY3Rpb24oYSxiKXtiLmNhbGwodGhpcyxhLmh0bWwoKSl9LFwiZnVuY3Rpb25cIjpmdW5jdGlvbihiLGQpe2QuY2FsbCh0aGlzLGIuY2FsbChhKSl9LGFqYXg6ZnVuY3Rpb24oYyxkKXtiLmFqYXgoe3VybDpjLHN1Y2Nlc3M6ZnVuY3Rpb24oYSl7ZC5jYWxsKHRoaXMsYSl9LGVycm9yOmZ1bmN0aW9uKGIpe2Euby5lcnJvci5jYWxsKGEsYyxcImFqYXhcIil9fSl9fX0saCk7YS5vcGVuPWZ1bmN0aW9uKGMsZCxlKXtjPXZvaWQgMD09PWN8fFwiI1wiPT09Yz9hLm8uY29udGVudDpjO2lmKG51bGw9PT1jKXJldHVybiBhLm8uZXJyb3IuY2FsbChhLGMsbCksITE7dm9pZCAwIT09ZSYmKGEuZWxlJiZhLm8uYWN0aXZlQ2xhc3MmJmIoYS5lbGUpLnJlbW92ZUNsYXNzKGEuby5hY3RpdmVDbGFzcyksXG5hLmVsZT1lLGEuZWxlJiZhLm8uYWN0aXZlQ2xhc3MmJmIoYS5lbGUpLmFkZENsYXNzKGEuby5hY3RpdmVDbGFzcykpO2lmKHZvaWQgMD09PWcpe2c9YignPGRpdiBjbGFzcz1cIicrYS5vLmJhY2tDbGFzcysnXCIvPicpLmFwcGVuZFRvKGIoXCJib2R5XCIpKS5jc3MoXCJvcGFjaXR5XCIsMCkuYW5pbWF0ZSh7b3BhY2l0eTphLm8uYmFja09wYWNpdHl9LGEuby5zcGVlZCk7aWYoIWEuby5tb2RhbClnLm9uZShcImNsaWNrLnBvcHVwXCIsZnVuY3Rpb24oKXthLmNsb3NlKCl9KTthLm8uaGlkZUZsYXNoJiZiKFwib2JqZWN0LCBlbWJlZFwiKS5jc3MoXCJ2aXNpYmlsaXR5XCIsXCJoaWRkZW5cIik7YS5vLnByZWxvYWRlckNvbnRlbnQmJihyPWIoYS5vLnByZWxvYWRlckNvbnRlbnQpLmFwcGVuZFRvKGIoXCJib2R5XCIpKSl9ZD1xKFtkLGEuby50eXBlXSk7bD1kPVwiYXV0b1wiPT09ZD9tKGMpOmQ7YS53aWR0aD1hLm8ud2lkdGg/YS5vLndpZHRoOm51bGw7YS5oZWlnaHQ9YS5vLmhlaWdodD9hLm8uaGVpZ2h0Om51bGw7XG5pZigtMT09PWIuaW5BcnJheShkLFtcImlubGluZVwiLFwialF1ZXJ5XCIsXCJmdW5jdGlvblwiXSkpe2U9ayhhLm8udHlwZVBhcmFtLGMpO3ZhciBmPWsoYS5vLndpZHRoUGFyYW0sYyksaD1rKGEuby5oZWlnaHRQYXJhbSxjKTtkPW51bGwhPT1lP2U6ZDthLndpZHRoPW51bGwhPT1mP2Y6YS53aWR0aDthLmhlaWdodD1udWxsIT09aD9oOmEuaGVpZ2h0fWEuby5iZWZvcmVPcGVuLmNhbGwoYSxkKTthLm8udHlwZXNbZF0/YS5vLnR5cGVzW2RdLmNhbGwoYSxjLG4pOmEuby50eXBlcy5hamF4LmNhbGwoYSxjLG4pfTthLmNsb3NlPWZ1bmN0aW9uKCl7YS5vLmJlZm9yZUNsb3NlLmNhbGwoYSk7XCJpbmxpbmVcIj09PWwmJmEuby5rZWVwSW5saW5lQ2hhbmdlcyYmKHM9YihcIi5cIithLm8uY29udGVudENsYXNzKS5odG1sKCkpO3ZvaWQgMCE9PWcmJmcuYW5pbWF0ZSh7b3BhY2l0eTowfSxhLm8uc3BlZWQsZnVuY3Rpb24oKXthLmNsZWFuVXAoKX0pO2Euby5oaWRlLmNhbGwoYSxmLGcpO3JldHVybiBhfTthLmNsZWFuVXA9XG5mdW5jdGlvbigpe2cuYWRkKGYpLnJlbW92ZSgpO2Y9Zz12b2lkIDA7Yih0KS51bmJpbmQoXCJyZXNpemVcIixhLmNlbnRlcik7YS5vLmhpZGVGbGFzaCYmYihcIm9iamVjdCwgZW1iZWRcIikuY3NzKFwidmlzaWJpbGl0eVwiLFwidmlzaWJsZVwiKTthLmVsZSYmYS5vLmFjdGl2ZUNsYXNzJiZiKGEuZWxlKS5yZW1vdmVDbGFzcyhhLm8uYWN0aXZlQ2xhc3MpO3ZhciBjPWIoXCIuXCIrYS5vLnBvcHVwUGxhY2Vob2xkZXJDbGFzcyk7XCJpbmxpbmVcIj09bCYmYy5sZW5ndGgmJmMuaHRtbChzKS5yZW1vdmVDbGFzcyhhLm8ucG9wdXBQbGFjZWhvbGRlckNsYXNzKTtsPW51bGw7YS5vLmFmdGVyQ2xvc2UuY2FsbChhKTtyZXR1cm4gYX07YS5jZW50ZXI9ZnVuY3Rpb24oKXtmLmNzcyhhLmdldENlbnRlcigpKTtnLmNzcyh7aGVpZ2h0OmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHR9KTtyZXR1cm4gYX07YS5nZXRDZW50ZXI9ZnVuY3Rpb24oKXt2YXIgYT1mLmNoaWxkcmVuKCkub3V0ZXJXaWR0aCghMCksXG5iPWYuY2hpbGRyZW4oKS5vdXRlckhlaWdodCghMCk7cmV0dXJue3RvcDouNSpkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0LS41KmIsbGVmdDouNSpkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgtLjUqYX19fX0pKGpRdWVyeSx3aW5kb3cpOyIsIjsoZnVuY3Rpb24gKCAkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQgKSB7XG5cbiAgLyoqXG4gICAqIGFuaW1vIGlzIGEgcG93ZXJmdWwgbGl0dGxlIHRvb2wgdGhhdCBtYWtlcyBtYW5hZ2luZyBDU1MgYW5pbWF0aW9ucyBleHRyZW1lbHkgZWFzeS4gU3RhY2sgYW5pbWF0aW9ucywgc2V0IGNhbGxiYWNrcywgbWFrZSBtYWdpYy5cbiAgICogTW9kZXJuIGJyb3dzZXJzIGFuZCBhbG1vc3QgYWxsIG1vYmlsZSBicm93c2VycyBzdXBwb3J0IENTUyBhbmltYXRpb25zIChodHRwOi8vY2FuaXVzZS5jb20vY3NzLWFuaW1hdGlvbikuXG4gICAqXG4gICAqIEBhdXRob3IgRGFuaWVsIFJhZnRlcnkgOiB0d2l0dGVyL1Rocml2aW5nS2luZ3NcbiAgICogQHZlcnNpb24gMS4wLjFcbiAgKi9cbiAgZnVuY3Rpb24gYW5pbW8oIGVsZW1lbnQsIG9wdGlvbnMsIGNhbGxiYWNrLCBvdGhlcl9jYiApIHtcbiAgICBcbiAgICAvLyBEZWZhdWx0IGNvbmZpZ3VyYXRpb25cbiAgICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgXHRkdXJhdGlvbjogMSxcbiAgICBcdGFuaW1hdGlvbjogbnVsbCxcbiAgICBcdGl0ZXJhdGU6IDEsXG4gICAgXHR0aW1pbmc6IFwibGluZWFyXCIsXG4gICAgICBrZWVwOiBmYWxzZVxuICAgIH07XG5cbiAgICAvLyBCcm93c2VyIHByZWZpeGVzIGZvciBDU1NcbiAgICB0aGlzLnByZWZpeGVzID0gW1wiXCIsIFwiLW1vei1cIiwgXCItby1hbmltYXRpb24tXCIsIFwiLXdlYmtpdC1cIl07XG5cbiAgICAvLyBDYWNoZSB0aGUgZWxlbWVudFxuICAgIHRoaXMuZWxlbWVudCA9ICQoZWxlbWVudCk7XG5cbiAgICB0aGlzLmJhcmUgPSBlbGVtZW50O1xuXG4gICAgLy8gRm9yIHN0YWNraW5nIG9mIGFuaW1hdGlvbnNcbiAgICB0aGlzLnF1ZXVlID0gW107XG5cbiAgICAvLyBIYWNreVxuICAgIHRoaXMubGlzdGVuaW5nID0gZmFsc2U7XG5cbiAgICAvLyBGaWd1cmUgb3V0IHdoZXJlIHRoZSBjYWxsYmFjayBpc1xuICAgIHZhciBjYiA9ICh0eXBlb2YgY2FsbGJhY2sgPT0gXCJmdW5jdGlvblwiID8gY2FsbGJhY2sgOiBvdGhlcl9jYik7XG5cbiAgICAvLyBPcHRpb25zIGNhbiBzb21ldGltZXMgYmUgYSBjb21tYW5kXG4gICAgc3dpdGNoKG9wdGlvbnMpIHtcblxuICAgICAgY2FzZSBcImJsdXJcIjpcblxuICAgICAgXHRkZWZhdWx0cyA9IHtcbiAgICAgIFx0XHRhbW91bnQ6IDMsXG4gICAgICBcdFx0ZHVyYXRpb246IDAuNSxcbiAgICAgIFx0XHRmb2N1c0FmdGVyOiBudWxsXG4gICAgICBcdH07XG5cbiAgICAgIFx0dGhpcy5vcHRpb25zID0gJC5leHRlbmQoIGRlZmF1bHRzLCBjYWxsYmFjayApO1xuXG4gIFx0ICAgIHRoaXMuX2JsdXIoY2IpO1xuXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwiZm9jdXNcIjpcblxuICBcdCAgXHR0aGlzLl9mb2N1cygpO1xuXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwicm90YXRlXCI6XG5cbiAgICAgICAgZGVmYXVsdHMgPSB7XG4gICAgICAgICAgZGVncmVlczogMTUsXG4gICAgICAgICAgZHVyYXRpb246IDAuNVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKCBkZWZhdWx0cywgY2FsbGJhY2sgKTtcblxuICAgICAgICB0aGlzLl9yb3RhdGUoY2IpO1xuXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwiY2xlYW5zZVwiOlxuXG4gICAgICAgIHRoaXMuY2xlYW5zZSgpO1xuXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuXG5cdCAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCggZGVmYXVsdHMsIG9wdGlvbnMgKTtcblxuXHQgICAgdGhpcy5pbml0KGNiKTtcbiAgXHRcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGFuaW1vLnByb3RvdHlwZSA9IHtcblxuICAgIC8vIEEgc3RhbmRhcmQgQ1NTIGFuaW1hdGlvblxuICAgIGluaXQ6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICBcbiAgICAgIHZhciAkbWUgPSB0aGlzO1xuXG4gICAgICAvLyBBcmUgd2Ugc3RhY2tpbmcgYW5pbWF0aW9ucz9cbiAgICAgIGlmKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCggJG1lLm9wdGlvbnMuYW5pbWF0aW9uICkgPT09ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICAgIFx0JC5tZXJnZSgkbWUucXVldWUsICRtZS5vcHRpb25zLmFuaW1hdGlvbik7XG4gICAgICB9IGVsc2Uge1xuXHQgICAgICAkbWUucXVldWUucHVzaCgkbWUub3B0aW9ucy5hbmltYXRpb24pO1xuXHQgICAgfVxuXG5cdCAgICAkbWUuY2xlYW5zZSgpO1xuXG5cdCAgICAkbWUuYW5pbWF0ZShjYWxsYmFjayk7XG4gICAgICBcbiAgICB9LFxuXG4gICAgLy8gVGhlIGFjdHVhbCBhZGRpbmcgb2YgdGhlIGNsYXNzIGFuZCBsaXN0ZW5pbmcgZm9yIGNvbXBsZXRpb25cbiAgICBhbmltYXRlOiBmdW5jdGlvbihjYWxsYmFjaykge1xuXG4gICAgXHR0aGlzLmVsZW1lbnQuYWRkQ2xhc3MoJ2FuaW1hdGVkJyk7XG5cbiAgICAgIHRoaXMuZWxlbWVudC5hZGRDbGFzcyh0aGlzLnF1ZXVlWzBdKTtcblxuICAgICAgdGhpcy5lbGVtZW50LmRhdGEoXCJhbmltb1wiLCB0aGlzLnF1ZXVlWzBdKTtcblxuICAgICAgdmFyIGFpID0gdGhpcy5wcmVmaXhlcy5sZW5ndGg7XG5cbiAgICAgIC8vIEFkZCB0aGUgb3B0aW9ucyBmb3IgZWFjaCBwcmVmaXhcbiAgICAgIHdoaWxlKGFpLS0pIHtcblxuICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiYW5pbWF0aW9uLWR1cmF0aW9uXCIsIHRoaXMub3B0aW9ucy5kdXJhdGlvbitcInNcIik7XG5cbiAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcImFuaW1hdGlvbi1pdGVyYXRpb24tY291bnRcIiwgdGhpcy5vcHRpb25zLml0ZXJhdGUpO1xuXG4gICAgICBcdHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJhbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uXCIsIHRoaXMub3B0aW9ucy50aW1pbmcpO1xuXG4gICAgICB9XG5cbiAgICAgIHZhciAkbWUgPSB0aGlzLCBfY2IgPSBjYWxsYmFjaztcblxuICAgICAgaWYoJG1lLnF1ZXVlLmxlbmd0aD4xKSB7XG4gICAgICAgIF9jYiA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8vIExpc3RlbiBmb3IgdGhlIGVuZCBvZiB0aGUgYW5pbWF0aW9uXG4gICAgICB0aGlzLl9lbmQoXCJBbmltYXRpb25FbmRcIiwgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG1vcmUsIGNsZWFuIGl0IHVwIGFuZCBtb3ZlIG9uXG4gICAgICBcdGlmKCRtZS5lbGVtZW50Lmhhc0NsYXNzKCRtZS5xdWV1ZVswXSkpIHtcblxuXHQgICAgXHRcdGlmKCEkbWUub3B0aW9ucy5rZWVwKSB7XG4gICAgICAgICAgICAkbWUuY2xlYW5zZSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgICRtZS5xdWV1ZS5zaGlmdCgpO1xuXG5cdCAgICBcdFx0aWYoJG1lLnF1ZXVlLmxlbmd0aCkge1xuXG5cdFx0ICAgICAgXHQkbWUuYW5pbWF0ZShjYWxsYmFjayk7XG5cdFx0ICAgICAgfVxuXHRcdFx0ICB9XG5cdFx0ICB9LCBfY2IpO1xuICAgIH0sXG5cbiAgICBjbGVhbnNlOiBmdW5jdGlvbigpIHtcblxuICAgIFx0dGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKCdhbmltYXRlZCcpO1xuXG4gIFx0XHR0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3ModGhpcy5xdWV1ZVswXSk7XG5cbiAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVDbGFzcyh0aGlzLmVsZW1lbnQuZGF0YShcImFuaW1vXCIpKTtcblxuICBcdFx0dmFyIGFpID0gdGhpcy5wcmVmaXhlcy5sZW5ndGg7XG5cbiAgXHRcdHdoaWxlKGFpLS0pIHtcblxuICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiYW5pbWF0aW9uLWR1cmF0aW9uXCIsIFwiXCIpO1xuXG4gICAgICBcdHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJhbmltYXRpb24taXRlcmF0aW9uLWNvdW50XCIsIFwiXCIpO1xuXG4gICAgICBcdHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJhbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uXCIsIFwiXCIpO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJ0cmFuc2l0aW9uXCIsIFwiXCIpO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJ0cmFuc2Zvcm1cIiwgXCJcIik7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcImZpbHRlclwiLCBcIlwiKTtcblxuICAgICAgfVxuICAgIH0sXG5cbiAgICBfYmx1cjogZnVuY3Rpb24oY2FsbGJhY2spIHtcblxuICAgICAgaWYodGhpcy5lbGVtZW50LmlzKFwiaW1nXCIpKSB7XG5cbiAgICAgIFx0dmFyIHN2Z19pZCA9IFwic3ZnX1wiICsgKCgoMSArIE1hdGgucmFuZG9tKCkpICogMHgxMDAwMDAwKSB8IDApLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSk7XG4gICAgICBcdHZhciBmaWx0ZXJfaWQgPSBcImZpbHRlcl9cIiArICgoKDEgKyBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDAwMCkgfCAwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpO1xuXG4gICAgICBcdCQoJ2JvZHknKS5hcHBlbmQoJzxzdmcgdmVyc2lvbj1cIjEuMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiBpZD1cIicrc3ZnX2lkKydcIiBzdHlsZT1cImhlaWdodDowO1wiPjxmaWx0ZXIgaWQ9XCInK2ZpbHRlcl9pZCsnXCI+PGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj1cIicrdGhpcy5vcHRpb25zLmFtb3VudCsnXCIgLz48L2ZpbHRlcj48L3N2Zz4nKTtcblxuICAgICAgXHR2YXIgYWkgPSB0aGlzLnByZWZpeGVzLmxlbmd0aDtcblxuICAgIFx0XHR3aGlsZShhaS0tKSB7XG5cbiAgICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiZmlsdGVyXCIsIFwiYmx1cihcIit0aGlzLm9wdGlvbnMuYW1vdW50K1wicHgpXCIpO1xuXG4gICAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcInRyYW5zaXRpb25cIiwgdGhpcy5vcHRpb25zLmR1cmF0aW9uK1wicyBhbGwgbGluZWFyXCIpO1xuXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKFwiZmlsdGVyXCIsIFwidXJsKCNcIitmaWx0ZXJfaWQrXCIpXCIpO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudC5kYXRhKFwic3ZnaWRcIiwgc3ZnX2lkKTtcbiAgICAgIFxuICAgICAgfSBlbHNlIHtcblxuICAgICAgICB2YXIgY29sb3IgPSB0aGlzLmVsZW1lbnQuY3NzKCdjb2xvcicpO1xuXG4gICAgICAgIHZhciBhaSA9IHRoaXMucHJlZml4ZXMubGVuZ3RoO1xuXG4gICAgICAgIC8vIEFkZCB0aGUgb3B0aW9ucyBmb3IgZWFjaCBwcmVmaXhcbiAgICAgICAgd2hpbGUoYWktLSkge1xuXG4gICAgICAgICAgdGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcInRyYW5zaXRpb25cIiwgXCJhbGwgXCIrdGhpcy5vcHRpb25zLmR1cmF0aW9uK1wicyBsaW5lYXJcIik7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3MoXCJ0ZXh0LXNoYWRvd1wiLCBcIjAgMCBcIit0aGlzLm9wdGlvbnMuYW1vdW50K1wicHggXCIrY29sb3IpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKFwiY29sb3JcIiwgXCJ0cmFuc3BhcmVudFwiKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fZW5kKFwiVHJhbnNpdGlvbkVuZFwiLCBudWxsLCBjYWxsYmFjayk7XG5cbiAgICAgIHZhciAkbWUgPSB0aGlzO1xuXG4gICAgICBpZih0aGlzLm9wdGlvbnMuZm9jdXNBZnRlcikge1xuXG4gICAgICAgIHZhciBmb2N1c193YWl0ID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAkbWUuX2ZvY3VzKCk7XG5cbiAgICAgICAgICBmb2N1c193YWl0ID0gd2luZG93LmNsZWFyVGltZW91dChmb2N1c193YWl0KTtcblxuICAgICAgICB9LCAodGhpcy5vcHRpb25zLmZvY3VzQWZ0ZXIqMTAwMCkpO1xuICAgICAgfVxuXG4gICAgfSxcblxuICAgIF9mb2N1czogZnVuY3Rpb24oKSB7XG5cbiAgICBcdHZhciBhaSA9IHRoaXMucHJlZml4ZXMubGVuZ3RoO1xuXG4gICAgICBpZih0aGlzLmVsZW1lbnQuaXMoXCJpbWdcIikpIHtcblxuICAgIFx0XHR3aGlsZShhaS0tKSB7XG5cbiAgICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiZmlsdGVyXCIsIFwiXCIpO1xuXG4gICAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcInRyYW5zaXRpb25cIiwgXCJcIik7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciAkc3ZnID0gJCgnIycrdGhpcy5lbGVtZW50LmRhdGEoJ3N2Z2lkJykpO1xuXG4gICAgICAgICRzdmcucmVtb3ZlKCk7XG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIHdoaWxlKGFpLS0pIHtcblxuICAgICAgICAgIHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJ0cmFuc2l0aW9uXCIsIFwiXCIpO1xuXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKFwidGV4dC1zaGFkb3dcIiwgXCJcIik7XG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3MoXCJjb2xvclwiLCBcIlwiKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX3JvdGF0ZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcblxuICAgICAgdmFyIGFpID0gdGhpcy5wcmVmaXhlcy5sZW5ndGg7XG5cbiAgICAgIC8vIEFkZCB0aGUgb3B0aW9ucyBmb3IgZWFjaCBwcmVmaXhcbiAgICAgIHdoaWxlKGFpLS0pIHtcblxuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1widHJhbnNpdGlvblwiLCBcImFsbCBcIit0aGlzLm9wdGlvbnMuZHVyYXRpb24rXCJzIGxpbmVhclwiKTtcblxuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1widHJhbnNmb3JtXCIsIFwicm90YXRlKFwiK3RoaXMub3B0aW9ucy5kZWdyZWVzK1wiZGVnKVwiKTtcblxuICAgICAgfVxuXG4gICAgICB0aGlzLl9lbmQoXCJUcmFuc2l0aW9uRW5kXCIsIG51bGwsIGNhbGxiYWNrKTtcblxuICAgIH0sXG5cbiAgICBfZW5kOiBmdW5jdGlvbih0eXBlLCB0b2RvLCBjYWxsYmFjaykge1xuXG4gICAgICB2YXIgJG1lID0gdGhpcztcblxuICAgICAgdmFyIGJpbmRpbmcgPSB0eXBlLnRvTG93ZXJDYXNlKCkrXCIgd2Via2l0XCIrdHlwZStcIiBvXCIrdHlwZStcIiBNU1wiK3R5cGU7XG5cbiAgICAgIHRoaXMuZWxlbWVudC5iaW5kKGJpbmRpbmcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBcbiAgICAgICAgJG1lLmVsZW1lbnQudW5iaW5kKGJpbmRpbmcpO1xuXG4gICAgICAgIGlmKHR5cGVvZiB0b2RvID09IFwiZnVuY3Rpb25cIikge1xuXG4gICAgICAgICAgdG9kbygpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodHlwZW9mIGNhbGxiYWNrID09IFwiZnVuY3Rpb25cIikge1xuXG4gICAgICAgICAgY2FsbGJhY2soJG1lKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBcbiAgICB9XG4gIH07XG5cbiAgJC5mbi5hbmltbyA9IGZ1bmN0aW9uICggb3B0aW9ucywgY2FsbGJhY2ssIG90aGVyX2NiICkge1xuICAgIFxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHRcblx0XHRcdG5ldyBhbmltbyggdGhpcywgb3B0aW9ucywgY2FsbGJhY2ssIG90aGVyX2NiICk7XG5cblx0XHR9KTtcblxuICB9O1xuXG59KSggalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50ICk7IiwiLyohXG5XYXlwb2ludHMgLSAzLjEuMVxuQ29weXJpZ2h0IMKpIDIwMTEtMjAxNSBDYWxlYiBUcm91Z2h0b25cbkxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbmh0dHBzOi8vZ2l0aHViLmNvbS9pbWFrZXdlYnRoaW5ncy93YXlwb2ludHMvYmxvZy9tYXN0ZXIvbGljZW5zZXMudHh0XG4qL1xuIWZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gdChvKXtpZighbyl0aHJvdyBuZXcgRXJyb3IoXCJObyBvcHRpb25zIHBhc3NlZCB0byBXYXlwb2ludCBjb25zdHJ1Y3RvclwiKTtpZighby5lbGVtZW50KXRocm93IG5ldyBFcnJvcihcIk5vIGVsZW1lbnQgb3B0aW9uIHBhc3NlZCB0byBXYXlwb2ludCBjb25zdHJ1Y3RvclwiKTtpZighby5oYW5kbGVyKXRocm93IG5ldyBFcnJvcihcIk5vIGhhbmRsZXIgb3B0aW9uIHBhc3NlZCB0byBXYXlwb2ludCBjb25zdHJ1Y3RvclwiKTt0aGlzLmtleT1cIndheXBvaW50LVwiK2UsdGhpcy5vcHRpb25zPXQuQWRhcHRlci5leHRlbmQoe30sdC5kZWZhdWx0cyxvKSx0aGlzLmVsZW1lbnQ9dGhpcy5vcHRpb25zLmVsZW1lbnQsdGhpcy5hZGFwdGVyPW5ldyB0LkFkYXB0ZXIodGhpcy5lbGVtZW50KSx0aGlzLmNhbGxiYWNrPW8uaGFuZGxlcix0aGlzLmF4aXM9dGhpcy5vcHRpb25zLmhvcml6b250YWw/XCJob3Jpem9udGFsXCI6XCJ2ZXJ0aWNhbFwiLHRoaXMuZW5hYmxlZD10aGlzLm9wdGlvbnMuZW5hYmxlZCx0aGlzLnRyaWdnZXJQb2ludD1udWxsLHRoaXMuZ3JvdXA9dC5Hcm91cC5maW5kT3JDcmVhdGUoe25hbWU6dGhpcy5vcHRpb25zLmdyb3VwLGF4aXM6dGhpcy5heGlzfSksdGhpcy5jb250ZXh0PXQuQ29udGV4dC5maW5kT3JDcmVhdGVCeUVsZW1lbnQodGhpcy5vcHRpb25zLmNvbnRleHQpLHQub2Zmc2V0QWxpYXNlc1t0aGlzLm9wdGlvbnMub2Zmc2V0XSYmKHRoaXMub3B0aW9ucy5vZmZzZXQ9dC5vZmZzZXRBbGlhc2VzW3RoaXMub3B0aW9ucy5vZmZzZXRdKSx0aGlzLmdyb3VwLmFkZCh0aGlzKSx0aGlzLmNvbnRleHQuYWRkKHRoaXMpLGlbdGhpcy5rZXldPXRoaXMsZSs9MX12YXIgZT0wLGk9e307dC5wcm90b3R5cGUucXVldWVUcmlnZ2VyPWZ1bmN0aW9uKHQpe3RoaXMuZ3JvdXAucXVldWVUcmlnZ2VyKHRoaXMsdCl9LHQucHJvdG90eXBlLnRyaWdnZXI9ZnVuY3Rpb24odCl7dGhpcy5lbmFibGVkJiZ0aGlzLmNhbGxiYWNrJiZ0aGlzLmNhbGxiYWNrLmFwcGx5KHRoaXMsdCl9LHQucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLmNvbnRleHQucmVtb3ZlKHRoaXMpLHRoaXMuZ3JvdXAucmVtb3ZlKHRoaXMpLGRlbGV0ZSBpW3RoaXMua2V5XX0sdC5wcm90b3R5cGUuZGlzYWJsZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLmVuYWJsZWQ9ITEsdGhpc30sdC5wcm90b3R5cGUuZW5hYmxlPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuY29udGV4dC5yZWZyZXNoKCksdGhpcy5lbmFibGVkPSEwLHRoaXN9LHQucHJvdG90eXBlLm5leHQ9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5ncm91cC5uZXh0KHRoaXMpfSx0LnByb3RvdHlwZS5wcmV2aW91cz1mdW5jdGlvbigpe3JldHVybiB0aGlzLmdyb3VwLnByZXZpb3VzKHRoaXMpfSx0Lmludm9rZUFsbD1mdW5jdGlvbih0KXt2YXIgZT1bXTtmb3IodmFyIG8gaW4gaSllLnB1c2goaVtvXSk7Zm9yKHZhciBuPTAscj1lLmxlbmd0aDtyPm47bisrKWVbbl1bdF0oKX0sdC5kZXN0cm95QWxsPWZ1bmN0aW9uKCl7dC5pbnZva2VBbGwoXCJkZXN0cm95XCIpfSx0LmRpc2FibGVBbGw9ZnVuY3Rpb24oKXt0Lmludm9rZUFsbChcImRpc2FibGVcIil9LHQuZW5hYmxlQWxsPWZ1bmN0aW9uKCl7dC5pbnZva2VBbGwoXCJlbmFibGVcIil9LHQucmVmcmVzaEFsbD1mdW5jdGlvbigpe3QuQ29udGV4dC5yZWZyZXNoQWxsKCl9LHQudmlld3BvcnRIZWlnaHQ9ZnVuY3Rpb24oKXtyZXR1cm4gd2luZG93LmlubmVySGVpZ2h0fHxkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0fSx0LnZpZXdwb3J0V2lkdGg9ZnVuY3Rpb24oKXtyZXR1cm4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRofSx0LmFkYXB0ZXJzPVtdLHQuZGVmYXVsdHM9e2NvbnRleHQ6d2luZG93LGNvbnRpbnVvdXM6ITAsZW5hYmxlZDohMCxncm91cDpcImRlZmF1bHRcIixob3Jpem9udGFsOiExLG9mZnNldDowfSx0Lm9mZnNldEFsaWFzZXM9e1wiYm90dG9tLWluLXZpZXdcIjpmdW5jdGlvbigpe3JldHVybiB0aGlzLmNvbnRleHQuaW5uZXJIZWlnaHQoKS10aGlzLmFkYXB0ZXIub3V0ZXJIZWlnaHQoKX0sXCJyaWdodC1pbi12aWV3XCI6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5jb250ZXh0LmlubmVyV2lkdGgoKS10aGlzLmFkYXB0ZXIub3V0ZXJXaWR0aCgpfX0sd2luZG93LldheXBvaW50PXR9KCksZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiB0KHQpe3dpbmRvdy5zZXRUaW1lb3V0KHQsMWUzLzYwKX1mdW5jdGlvbiBlKHQpe3RoaXMuZWxlbWVudD10LHRoaXMuQWRhcHRlcj1uLkFkYXB0ZXIsdGhpcy5hZGFwdGVyPW5ldyB0aGlzLkFkYXB0ZXIodCksdGhpcy5rZXk9XCJ3YXlwb2ludC1jb250ZXh0LVwiK2ksdGhpcy5kaWRTY3JvbGw9ITEsdGhpcy5kaWRSZXNpemU9ITEsdGhpcy5vbGRTY3JvbGw9e3g6dGhpcy5hZGFwdGVyLnNjcm9sbExlZnQoKSx5OnRoaXMuYWRhcHRlci5zY3JvbGxUb3AoKX0sdGhpcy53YXlwb2ludHM9e3ZlcnRpY2FsOnt9LGhvcml6b250YWw6e319LHQud2F5cG9pbnRDb250ZXh0S2V5PXRoaXMua2V5LG9bdC53YXlwb2ludENvbnRleHRLZXldPXRoaXMsaSs9MSx0aGlzLmNyZWF0ZVRocm90dGxlZFNjcm9sbEhhbmRsZXIoKSx0aGlzLmNyZWF0ZVRocm90dGxlZFJlc2l6ZUhhbmRsZXIoKX12YXIgaT0wLG89e30sbj13aW5kb3cuV2F5cG9pbnQscj13aW5kb3cub25sb2FkO2UucHJvdG90eXBlLmFkZD1mdW5jdGlvbih0KXt2YXIgZT10Lm9wdGlvbnMuaG9yaXpvbnRhbD9cImhvcml6b250YWxcIjpcInZlcnRpY2FsXCI7dGhpcy53YXlwb2ludHNbZV1bdC5rZXldPXQsdGhpcy5yZWZyZXNoKCl9LGUucHJvdG90eXBlLmNoZWNrRW1wdHk9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLkFkYXB0ZXIuaXNFbXB0eU9iamVjdCh0aGlzLndheXBvaW50cy5ob3Jpem9udGFsKSxlPXRoaXMuQWRhcHRlci5pc0VtcHR5T2JqZWN0KHRoaXMud2F5cG9pbnRzLnZlcnRpY2FsKTt0JiZlJiYodGhpcy5hZGFwdGVyLm9mZihcIi53YXlwb2ludHNcIiksZGVsZXRlIG9bdGhpcy5rZXldKX0sZS5wcm90b3R5cGUuY3JlYXRlVGhyb3R0bGVkUmVzaXplSGFuZGxlcj1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoKXtlLmhhbmRsZVJlc2l6ZSgpLGUuZGlkUmVzaXplPSExfXZhciBlPXRoaXM7dGhpcy5hZGFwdGVyLm9uKFwicmVzaXplLndheXBvaW50c1wiLGZ1bmN0aW9uKCl7ZS5kaWRSZXNpemV8fChlLmRpZFJlc2l6ZT0hMCxuLnJlcXVlc3RBbmltYXRpb25GcmFtZSh0KSl9KX0sZS5wcm90b3R5cGUuY3JlYXRlVGhyb3R0bGVkU2Nyb2xsSGFuZGxlcj1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoKXtlLmhhbmRsZVNjcm9sbCgpLGUuZGlkU2Nyb2xsPSExfXZhciBlPXRoaXM7dGhpcy5hZGFwdGVyLm9uKFwic2Nyb2xsLndheXBvaW50c1wiLGZ1bmN0aW9uKCl7KCFlLmRpZFNjcm9sbHx8bi5pc1RvdWNoKSYmKGUuZGlkU2Nyb2xsPSEwLG4ucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHQpKX0pfSxlLnByb3RvdHlwZS5oYW5kbGVSZXNpemU9ZnVuY3Rpb24oKXtuLkNvbnRleHQucmVmcmVzaEFsbCgpfSxlLnByb3RvdHlwZS5oYW5kbGVTY3JvbGw9ZnVuY3Rpb24oKXt2YXIgdD17fSxlPXtob3Jpem9udGFsOntuZXdTY3JvbGw6dGhpcy5hZGFwdGVyLnNjcm9sbExlZnQoKSxvbGRTY3JvbGw6dGhpcy5vbGRTY3JvbGwueCxmb3J3YXJkOlwicmlnaHRcIixiYWNrd2FyZDpcImxlZnRcIn0sdmVydGljYWw6e25ld1Njcm9sbDp0aGlzLmFkYXB0ZXIuc2Nyb2xsVG9wKCksb2xkU2Nyb2xsOnRoaXMub2xkU2Nyb2xsLnksZm9yd2FyZDpcImRvd25cIixiYWNrd2FyZDpcInVwXCJ9fTtmb3IodmFyIGkgaW4gZSl7dmFyIG89ZVtpXSxuPW8ubmV3U2Nyb2xsPm8ub2xkU2Nyb2xsLHI9bj9vLmZvcndhcmQ6by5iYWNrd2FyZDtmb3IodmFyIHMgaW4gdGhpcy53YXlwb2ludHNbaV0pe3ZhciBhPXRoaXMud2F5cG9pbnRzW2ldW3NdLGw9by5vbGRTY3JvbGw8YS50cmlnZ2VyUG9pbnQsaD1vLm5ld1Njcm9sbD49YS50cmlnZ2VyUG9pbnQscD1sJiZoLHU9IWwmJiFoOyhwfHx1KSYmKGEucXVldWVUcmlnZ2VyKHIpLHRbYS5ncm91cC5pZF09YS5ncm91cCl9fWZvcih2YXIgYyBpbiB0KXRbY10uZmx1c2hUcmlnZ2VycygpO3RoaXMub2xkU2Nyb2xsPXt4OmUuaG9yaXpvbnRhbC5uZXdTY3JvbGwseTplLnZlcnRpY2FsLm5ld1Njcm9sbH19LGUucHJvdG90eXBlLmlubmVySGVpZ2h0PWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZWxlbWVudD09dGhpcy5lbGVtZW50LndpbmRvdz9uLnZpZXdwb3J0SGVpZ2h0KCk6dGhpcy5hZGFwdGVyLmlubmVySGVpZ2h0KCl9LGUucHJvdG90eXBlLnJlbW92ZT1mdW5jdGlvbih0KXtkZWxldGUgdGhpcy53YXlwb2ludHNbdC5heGlzXVt0LmtleV0sdGhpcy5jaGVja0VtcHR5KCl9LGUucHJvdG90eXBlLmlubmVyV2lkdGg9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5lbGVtZW50PT10aGlzLmVsZW1lbnQud2luZG93P24udmlld3BvcnRXaWR0aCgpOnRoaXMuYWRhcHRlci5pbm5lcldpZHRoKCl9LGUucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt2YXIgdD1bXTtmb3IodmFyIGUgaW4gdGhpcy53YXlwb2ludHMpZm9yKHZhciBpIGluIHRoaXMud2F5cG9pbnRzW2VdKXQucHVzaCh0aGlzLndheXBvaW50c1tlXVtpXSk7Zm9yKHZhciBvPTAsbj10Lmxlbmd0aDtuPm87bysrKXRbb10uZGVzdHJveSgpfSxlLnByb3RvdHlwZS5yZWZyZXNoPWZ1bmN0aW9uKCl7dmFyIHQsZT10aGlzLmVsZW1lbnQ9PXRoaXMuZWxlbWVudC53aW5kb3csaT10aGlzLmFkYXB0ZXIub2Zmc2V0KCksbz17fTt0aGlzLmhhbmRsZVNjcm9sbCgpLHQ9e2hvcml6b250YWw6e2NvbnRleHRPZmZzZXQ6ZT8wOmkubGVmdCxjb250ZXh0U2Nyb2xsOmU/MDp0aGlzLm9sZFNjcm9sbC54LGNvbnRleHREaW1lbnNpb246dGhpcy5pbm5lcldpZHRoKCksb2xkU2Nyb2xsOnRoaXMub2xkU2Nyb2xsLngsZm9yd2FyZDpcInJpZ2h0XCIsYmFja3dhcmQ6XCJsZWZ0XCIsb2Zmc2V0UHJvcDpcImxlZnRcIn0sdmVydGljYWw6e2NvbnRleHRPZmZzZXQ6ZT8wOmkudG9wLGNvbnRleHRTY3JvbGw6ZT8wOnRoaXMub2xkU2Nyb2xsLnksY29udGV4dERpbWVuc2lvbjp0aGlzLmlubmVySGVpZ2h0KCksb2xkU2Nyb2xsOnRoaXMub2xkU2Nyb2xsLnksZm9yd2FyZDpcImRvd25cIixiYWNrd2FyZDpcInVwXCIsb2Zmc2V0UHJvcDpcInRvcFwifX07Zm9yKHZhciBuIGluIHQpe3ZhciByPXRbbl07Zm9yKHZhciBzIGluIHRoaXMud2F5cG9pbnRzW25dKXt2YXIgYSxsLGgscCx1LGM9dGhpcy53YXlwb2ludHNbbl1bc10sZD1jLm9wdGlvbnMub2Zmc2V0LGY9Yy50cmlnZ2VyUG9pbnQsdz0wLHk9bnVsbD09ZjtjLmVsZW1lbnQhPT1jLmVsZW1lbnQud2luZG93JiYodz1jLmFkYXB0ZXIub2Zmc2V0KClbci5vZmZzZXRQcm9wXSksXCJmdW5jdGlvblwiPT10eXBlb2YgZD9kPWQuYXBwbHkoYyk6XCJzdHJpbmdcIj09dHlwZW9mIGQmJihkPXBhcnNlRmxvYXQoZCksYy5vcHRpb25zLm9mZnNldC5pbmRleE9mKFwiJVwiKT4tMSYmKGQ9TWF0aC5jZWlsKHIuY29udGV4dERpbWVuc2lvbipkLzEwMCkpKSxhPXIuY29udGV4dFNjcm9sbC1yLmNvbnRleHRPZmZzZXQsYy50cmlnZ2VyUG9pbnQ9dythLWQsbD1mPHIub2xkU2Nyb2xsLGg9Yy50cmlnZ2VyUG9pbnQ+PXIub2xkU2Nyb2xsLHA9bCYmaCx1PSFsJiYhaCwheSYmcD8oYy5xdWV1ZVRyaWdnZXIoci5iYWNrd2FyZCksb1tjLmdyb3VwLmlkXT1jLmdyb3VwKToheSYmdT8oYy5xdWV1ZVRyaWdnZXIoci5mb3J3YXJkKSxvW2MuZ3JvdXAuaWRdPWMuZ3JvdXApOnkmJnIub2xkU2Nyb2xsPj1jLnRyaWdnZXJQb2ludCYmKGMucXVldWVUcmlnZ2VyKHIuZm9yd2FyZCksb1tjLmdyb3VwLmlkXT1jLmdyb3VwKX19Zm9yKHZhciBnIGluIG8pb1tnXS5mbHVzaFRyaWdnZXJzKCk7cmV0dXJuIHRoaXN9LGUuZmluZE9yQ3JlYXRlQnlFbGVtZW50PWZ1bmN0aW9uKHQpe3JldHVybiBlLmZpbmRCeUVsZW1lbnQodCl8fG5ldyBlKHQpfSxlLnJlZnJlc2hBbGw9ZnVuY3Rpb24oKXtmb3IodmFyIHQgaW4gbylvW3RdLnJlZnJlc2goKX0sZS5maW5kQnlFbGVtZW50PWZ1bmN0aW9uKHQpe3JldHVybiBvW3Qud2F5cG9pbnRDb250ZXh0S2V5XX0sd2luZG93Lm9ubG9hZD1mdW5jdGlvbigpe3ImJnIoKSxlLnJlZnJlc2hBbGwoKX0sbi5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU9ZnVuY3Rpb24oZSl7dmFyIGk9d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZXx8dDtpLmNhbGwod2luZG93LGUpfSxuLkNvbnRleHQ9ZX0oKSxmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHQodCxlKXtyZXR1cm4gdC50cmlnZ2VyUG9pbnQtZS50cmlnZ2VyUG9pbnR9ZnVuY3Rpb24gZSh0LGUpe3JldHVybiBlLnRyaWdnZXJQb2ludC10LnRyaWdnZXJQb2ludH1mdW5jdGlvbiBpKHQpe3RoaXMubmFtZT10Lm5hbWUsdGhpcy5heGlzPXQuYXhpcyx0aGlzLmlkPXRoaXMubmFtZStcIi1cIit0aGlzLmF4aXMsdGhpcy53YXlwb2ludHM9W10sdGhpcy5jbGVhclRyaWdnZXJRdWV1ZXMoKSxvW3RoaXMuYXhpc11bdGhpcy5uYW1lXT10aGlzfXZhciBvPXt2ZXJ0aWNhbDp7fSxob3Jpem9udGFsOnt9fSxuPXdpbmRvdy5XYXlwb2ludDtpLnByb3RvdHlwZS5hZGQ9ZnVuY3Rpb24odCl7dGhpcy53YXlwb2ludHMucHVzaCh0KX0saS5wcm90b3R5cGUuY2xlYXJUcmlnZ2VyUXVldWVzPWZ1bmN0aW9uKCl7dGhpcy50cmlnZ2VyUXVldWVzPXt1cDpbXSxkb3duOltdLGxlZnQ6W10scmlnaHQ6W119fSxpLnByb3RvdHlwZS5mbHVzaFRyaWdnZXJzPWZ1bmN0aW9uKCl7Zm9yKHZhciBpIGluIHRoaXMudHJpZ2dlclF1ZXVlcyl7dmFyIG89dGhpcy50cmlnZ2VyUXVldWVzW2ldLG49XCJ1cFwiPT09aXx8XCJsZWZ0XCI9PT1pO28uc29ydChuP2U6dCk7Zm9yKHZhciByPTAscz1vLmxlbmd0aDtzPnI7cis9MSl7dmFyIGE9b1tyXTsoYS5vcHRpb25zLmNvbnRpbnVvdXN8fHI9PT1vLmxlbmd0aC0xKSYmYS50cmlnZ2VyKFtpXSl9fXRoaXMuY2xlYXJUcmlnZ2VyUXVldWVzKCl9LGkucHJvdG90eXBlLm5leHQ9ZnVuY3Rpb24oZSl7dGhpcy53YXlwb2ludHMuc29ydCh0KTt2YXIgaT1uLkFkYXB0ZXIuaW5BcnJheShlLHRoaXMud2F5cG9pbnRzKSxvPWk9PT10aGlzLndheXBvaW50cy5sZW5ndGgtMTtyZXR1cm4gbz9udWxsOnRoaXMud2F5cG9pbnRzW2krMV19LGkucHJvdG90eXBlLnByZXZpb3VzPWZ1bmN0aW9uKGUpe3RoaXMud2F5cG9pbnRzLnNvcnQodCk7dmFyIGk9bi5BZGFwdGVyLmluQXJyYXkoZSx0aGlzLndheXBvaW50cyk7cmV0dXJuIGk/dGhpcy53YXlwb2ludHNbaS0xXTpudWxsfSxpLnByb3RvdHlwZS5xdWV1ZVRyaWdnZXI9ZnVuY3Rpb24odCxlKXt0aGlzLnRyaWdnZXJRdWV1ZXNbZV0ucHVzaCh0KX0saS5wcm90b3R5cGUucmVtb3ZlPWZ1bmN0aW9uKHQpe3ZhciBlPW4uQWRhcHRlci5pbkFycmF5KHQsdGhpcy53YXlwb2ludHMpO2U+LTEmJnRoaXMud2F5cG9pbnRzLnNwbGljZShlLDEpfSxpLnByb3RvdHlwZS5maXJzdD1mdW5jdGlvbigpe3JldHVybiB0aGlzLndheXBvaW50c1swXX0saS5wcm90b3R5cGUubGFzdD1mdW5jdGlvbigpe3JldHVybiB0aGlzLndheXBvaW50c1t0aGlzLndheXBvaW50cy5sZW5ndGgtMV19LGkuZmluZE9yQ3JlYXRlPWZ1bmN0aW9uKHQpe3JldHVybiBvW3QuYXhpc11bdC5uYW1lXXx8bmV3IGkodCl9LG4uR3JvdXA9aX0oKSxmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHQodCl7dGhpcy4kZWxlbWVudD1lKHQpfXZhciBlPXdpbmRvdy5qUXVlcnksaT13aW5kb3cuV2F5cG9pbnQ7ZS5lYWNoKFtcImlubmVySGVpZ2h0XCIsXCJpbm5lcldpZHRoXCIsXCJvZmZcIixcIm9mZnNldFwiLFwib25cIixcIm91dGVySGVpZ2h0XCIsXCJvdXRlcldpZHRoXCIsXCJzY3JvbGxMZWZ0XCIsXCJzY3JvbGxUb3BcIl0sZnVuY3Rpb24oZSxpKXt0LnByb3RvdHlwZVtpXT1mdW5jdGlvbigpe3ZhciB0PUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7cmV0dXJuIHRoaXMuJGVsZW1lbnRbaV0uYXBwbHkodGhpcy4kZWxlbWVudCx0KX19KSxlLmVhY2goW1wiZXh0ZW5kXCIsXCJpbkFycmF5XCIsXCJpc0VtcHR5T2JqZWN0XCJdLGZ1bmN0aW9uKGksbyl7dFtvXT1lW29dfSksaS5hZGFwdGVycy5wdXNoKHtuYW1lOlwianF1ZXJ5XCIsQWRhcHRlcjp0fSksaS5BZGFwdGVyPXR9KCksZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiB0KHQpe3JldHVybiBmdW5jdGlvbigpe3ZhciBpPVtdLG89YXJndW1lbnRzWzBdO3JldHVybiB0LmlzRnVuY3Rpb24oYXJndW1lbnRzWzBdKSYmKG89dC5leHRlbmQoe30sYXJndW1lbnRzWzFdKSxvLmhhbmRsZXI9YXJndW1lbnRzWzBdKSx0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgbj10LmV4dGVuZCh7fSxvLHtlbGVtZW50OnRoaXN9KTtcInN0cmluZ1wiPT10eXBlb2Ygbi5jb250ZXh0JiYobi5jb250ZXh0PXQodGhpcykuY2xvc2VzdChuLmNvbnRleHQpWzBdKSxpLnB1c2gobmV3IGUobikpfSksaX19dmFyIGU9d2luZG93LldheXBvaW50O3dpbmRvdy5qUXVlcnkmJih3aW5kb3cualF1ZXJ5LmZuLndheXBvaW50PXQod2luZG93LmpRdWVyeSkpLHdpbmRvdy5aZXB0byYmKHdpbmRvdy5aZXB0by5mbi53YXlwb2ludD10KHdpbmRvdy5aZXB0bykpfSgpOyIsIi8qKiBBYnN0cmFjdCBiYXNlIGNsYXNzIGZvciBjb2xsZWN0aW9uIHBsdWdpbnMgdjEuMC4xLlxuXHRXcml0dGVuIGJ5IEtlaXRoIFdvb2QgKGtid29vZHthdH1paW5ldC5jb20uYXUpIERlY2VtYmVyIDIwMTMuXG5cdExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgKGh0dHA6Ly9rZWl0aC13b29kLm5hbWUvbGljZW5jZS5odG1sKSBsaWNlbnNlLiAqL1xuKGZ1bmN0aW9uKCl7dmFyIGo9ZmFsc2U7d2luZG93LkpRQ2xhc3M9ZnVuY3Rpb24oKXt9O0pRQ2xhc3MuY2xhc3Nlcz17fTtKUUNsYXNzLmV4dGVuZD1mdW5jdGlvbiBleHRlbmRlcihmKXt2YXIgZz10aGlzLnByb3RvdHlwZTtqPXRydWU7dmFyIGg9bmV3IHRoaXMoKTtqPWZhbHNlO2Zvcih2YXIgaSBpbiBmKXtoW2ldPXR5cGVvZiBmW2ldPT0nZnVuY3Rpb24nJiZ0eXBlb2YgZ1tpXT09J2Z1bmN0aW9uJz8oZnVuY3Rpb24oZCxlKXtyZXR1cm4gZnVuY3Rpb24oKXt2YXIgYj10aGlzLl9zdXBlcjt0aGlzLl9zdXBlcj1mdW5jdGlvbihhKXtyZXR1cm4gZ1tkXS5hcHBseSh0aGlzLGF8fFtdKX07dmFyIGM9ZS5hcHBseSh0aGlzLGFyZ3VtZW50cyk7dGhpcy5fc3VwZXI9YjtyZXR1cm4gY319KShpLGZbaV0pOmZbaV19ZnVuY3Rpb24gSlFDbGFzcygpe2lmKCFqJiZ0aGlzLl9pbml0KXt0aGlzLl9pbml0LmFwcGx5KHRoaXMsYXJndW1lbnRzKX19SlFDbGFzcy5wcm90b3R5cGU9aDtKUUNsYXNzLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1KUUNsYXNzO0pRQ2xhc3MuZXh0ZW5kPWV4dGVuZGVyO3JldHVybiBKUUNsYXNzfX0pKCk7KGZ1bmN0aW9uKCQpe0pRQ2xhc3MuY2xhc3Nlcy5KUVBsdWdpbj1KUUNsYXNzLmV4dGVuZCh7bmFtZToncGx1Z2luJyxkZWZhdWx0T3B0aW9uczp7fSxyZWdpb25hbE9wdGlvbnM6e30sX2dldHRlcnM6W10sX2dldE1hcmtlcjpmdW5jdGlvbigpe3JldHVybidpcy0nK3RoaXMubmFtZX0sX2luaXQ6ZnVuY3Rpb24oKXskLmV4dGVuZCh0aGlzLmRlZmF1bHRPcHRpb25zLCh0aGlzLnJlZ2lvbmFsT3B0aW9ucyYmdGhpcy5yZWdpb25hbE9wdGlvbnNbJyddKXx8e30pO3ZhciBjPWNhbWVsQ2FzZSh0aGlzLm5hbWUpOyRbY109dGhpczskLmZuW2NdPWZ1bmN0aW9uKGEpe3ZhciBiPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywxKTtpZigkW2NdLl9pc05vdENoYWluZWQoYSxiKSl7cmV0dXJuICRbY11bYV0uYXBwbHkoJFtjXSxbdGhpc1swXV0uY29uY2F0KGIpKX1yZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7aWYodHlwZW9mIGE9PT0nc3RyaW5nJyl7aWYoYVswXT09PSdfJ3x8ISRbY11bYV0pe3Rocm93J1Vua25vd24gbWV0aG9kOiAnK2E7fSRbY11bYV0uYXBwbHkoJFtjXSxbdGhpc10uY29uY2F0KGIpKX1lbHNleyRbY10uX2F0dGFjaCh0aGlzLGEpfX0pfX0sc2V0RGVmYXVsdHM6ZnVuY3Rpb24oYSl7JC5leHRlbmQodGhpcy5kZWZhdWx0T3B0aW9ucyxhfHx7fSl9LF9pc05vdENoYWluZWQ6ZnVuY3Rpb24oYSxiKXtpZihhPT09J29wdGlvbicmJihiLmxlbmd0aD09PTB8fChiLmxlbmd0aD09PTEmJnR5cGVvZiBiWzBdPT09J3N0cmluZycpKSl7cmV0dXJuIHRydWV9cmV0dXJuICQuaW5BcnJheShhLHRoaXMuX2dldHRlcnMpPi0xfSxfYXR0YWNoOmZ1bmN0aW9uKGEsYil7YT0kKGEpO2lmKGEuaGFzQ2xhc3ModGhpcy5fZ2V0TWFya2VyKCkpKXtyZXR1cm59YS5hZGRDbGFzcyh0aGlzLl9nZXRNYXJrZXIoKSk7Yj0kLmV4dGVuZCh7fSx0aGlzLmRlZmF1bHRPcHRpb25zLHRoaXMuX2dldE1ldGFkYXRhKGEpLGJ8fHt9KTt2YXIgYz0kLmV4dGVuZCh7bmFtZTp0aGlzLm5hbWUsZWxlbTphLG9wdGlvbnM6Yn0sdGhpcy5faW5zdFNldHRpbmdzKGEsYikpO2EuZGF0YSh0aGlzLm5hbWUsYyk7dGhpcy5fcG9zdEF0dGFjaChhLGMpO3RoaXMub3B0aW9uKGEsYil9LF9pbnN0U2V0dGluZ3M6ZnVuY3Rpb24oYSxiKXtyZXR1cm57fX0sX3Bvc3RBdHRhY2g6ZnVuY3Rpb24oYSxiKXt9LF9nZXRNZXRhZGF0YTpmdW5jdGlvbihkKXt0cnl7dmFyIGY9ZC5kYXRhKHRoaXMubmFtZS50b0xvd2VyQ2FzZSgpKXx8Jyc7Zj1mLnJlcGxhY2UoLycvZywnXCInKTtmPWYucmVwbGFjZSgvKFthLXpBLVowLTldKyk6L2csZnVuY3Rpb24oYSxiLGkpe3ZhciBjPWYuc3Vic3RyaW5nKDAsaSkubWF0Y2goL1wiL2cpO3JldHVybighY3x8Yy5sZW5ndGglMj09PTA/J1wiJytiKydcIjonOmIrJzonKX0pO2Y9JC5wYXJzZUpTT04oJ3snK2YrJ30nKTtmb3IodmFyIGcgaW4gZil7dmFyIGg9ZltnXTtpZih0eXBlb2YgaD09PSdzdHJpbmcnJiZoLm1hdGNoKC9ebmV3IERhdGVcXCgoLiopXFwpJC8pKXtmW2ddPWV2YWwoaCl9fXJldHVybiBmfWNhdGNoKGUpe3JldHVybnt9fX0sX2dldEluc3Q6ZnVuY3Rpb24oYSl7cmV0dXJuICQoYSkuZGF0YSh0aGlzLm5hbWUpfHx7fX0sb3B0aW9uOmZ1bmN0aW9uKGEsYixjKXthPSQoYSk7dmFyIGQ9YS5kYXRhKHRoaXMubmFtZSk7aWYoIWJ8fCh0eXBlb2YgYj09PSdzdHJpbmcnJiZjPT1udWxsKSl7dmFyIGU9KGR8fHt9KS5vcHRpb25zO3JldHVybihlJiZiP2VbYl06ZSl9aWYoIWEuaGFzQ2xhc3ModGhpcy5fZ2V0TWFya2VyKCkpKXtyZXR1cm59dmFyIGU9Ynx8e307aWYodHlwZW9mIGI9PT0nc3RyaW5nJyl7ZT17fTtlW2JdPWN9dGhpcy5fb3B0aW9uc0NoYW5nZWQoYSxkLGUpOyQuZXh0ZW5kKGQub3B0aW9ucyxlKX0sX29wdGlvbnNDaGFuZ2VkOmZ1bmN0aW9uKGEsYixjKXt9LGRlc3Ryb3k6ZnVuY3Rpb24oYSl7YT0kKGEpO2lmKCFhLmhhc0NsYXNzKHRoaXMuX2dldE1hcmtlcigpKSl7cmV0dXJufXRoaXMuX3ByZURlc3Ryb3koYSx0aGlzLl9nZXRJbnN0KGEpKTthLnJlbW92ZURhdGEodGhpcy5uYW1lKS5yZW1vdmVDbGFzcyh0aGlzLl9nZXRNYXJrZXIoKSl9LF9wcmVEZXN0cm95OmZ1bmN0aW9uKGEsYil7fX0pO2Z1bmN0aW9uIGNhbWVsQ2FzZShjKXtyZXR1cm4gYy5yZXBsYWNlKC8tKFthLXpdKS9nLGZ1bmN0aW9uKGEsYil7cmV0dXJuIGIudG9VcHBlckNhc2UoKX0pfSQuSlFQbHVnaW49e2NyZWF0ZVBsdWdpbjpmdW5jdGlvbihhLGIpe2lmKHR5cGVvZiBhPT09J29iamVjdCcpe2I9YTthPSdKUVBsdWdpbid9YT1jYW1lbENhc2UoYSk7dmFyIGM9Y2FtZWxDYXNlKGIubmFtZSk7SlFDbGFzcy5jbGFzc2VzW2NdPUpRQ2xhc3MuY2xhc3Nlc1thXS5leHRlbmQoYik7bmV3IEpRQ2xhc3MuY2xhc3Nlc1tjXSgpfX19KShqUXVlcnkpOyIsIi8qIGh0dHA6Ly9rZWl0aC13b29kLm5hbWUvY291bnRkb3duLmh0bWxcbiAgIENvdW50ZG93biBmb3IgalF1ZXJ5IHYyLjAuMi5cbiAgIFdyaXR0ZW4gYnkgS2VpdGggV29vZCAoa2J3b29ke2F0fWlpbmV0LmNvbS5hdSkgSmFudWFyeSAyMDA4LlxuICAgQXZhaWxhYmxlIHVuZGVyIHRoZSBNSVQgKGh0dHA6Ly9rZWl0aC13b29kLm5hbWUvbGljZW5jZS5odG1sKSBsaWNlbnNlLiBcbiAgIFBsZWFzZSBhdHRyaWJ1dGUgdGhlIGF1dGhvciBpZiB5b3UgdXNlIGl0LiAqL1xuKGZ1bmN0aW9uKCQpe3ZhciB3PSdjb3VudGRvd24nO3ZhciBZPTA7dmFyIE89MTt2YXIgVz0yO3ZhciBEPTM7dmFyIEg9NDt2YXIgTT01O3ZhciBTPTY7JC5KUVBsdWdpbi5jcmVhdGVQbHVnaW4oe25hbWU6dyxkZWZhdWx0T3B0aW9uczp7dW50aWw6bnVsbCxzaW5jZTpudWxsLHRpbWV6b25lOm51bGwsc2VydmVyU3luYzpudWxsLGZvcm1hdDonZEhNUycsbGF5b3V0OicnLGNvbXBhY3Q6ZmFsc2UscGFkWmVyb2VzOmZhbHNlLHNpZ25pZmljYW50OjAsZGVzY3JpcHRpb246JycsZXhwaXJ5VXJsOicnLGV4cGlyeVRleHQ6JycsYWx3YXlzRXhwaXJlOmZhbHNlLG9uRXhwaXJ5Om51bGwsb25UaWNrOm51bGwsdGlja0ludGVydmFsOjF9LHJlZ2lvbmFsT3B0aW9uczp7Jyc6e2xhYmVsczpbJ1llYXJzJywnTW9udGhzJywnV2Vla3MnLCdEYXlzJywnSG91cnMnLCdNaW51dGVzJywnU2Vjb25kcyddLGxhYmVsczE6WydZZWFyJywnTW9udGgnLCdXZWVrJywnRGF5JywnSG91cicsJ01pbnV0ZScsJ1NlY29uZCddLGNvbXBhY3RMYWJlbHM6Wyd5JywnbScsJ3cnLCdkJ10sd2hpY2hMYWJlbHM6bnVsbCxkaWdpdHM6WycwJywnMScsJzInLCczJywnNCcsJzUnLCc2JywnNycsJzgnLCc5J10sdGltZVNlcGFyYXRvcjonOicsaXNSVEw6ZmFsc2V9fSxfZ2V0dGVyczpbJ2dldFRpbWVzJ10sX3J0bENsYXNzOncrJy1ydGwnLF9zZWN0aW9uQ2xhc3M6dysnLXNlY3Rpb24nLF9hbW91bnRDbGFzczp3KyctYW1vdW50JyxfcGVyaW9kQ2xhc3M6dysnLXBlcmlvZCcsX3Jvd0NsYXNzOncrJy1yb3cnLF9ob2xkaW5nQ2xhc3M6dysnLWhvbGRpbmcnLF9zaG93Q2xhc3M6dysnLXNob3cnLF9kZXNjckNsYXNzOncrJy1kZXNjcicsX3RpbWVyRWxlbXM6W10sX2luaXQ6ZnVuY3Rpb24oKXt2YXIgYz10aGlzO3RoaXMuX3N1cGVyKCk7dGhpcy5fc2VydmVyU3luY3M9W107dmFyIGQ9KHR5cGVvZiBEYXRlLm5vdz09J2Z1bmN0aW9uJz9EYXRlLm5vdzpmdW5jdGlvbigpe3JldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKX0pO3ZhciBlPSh3aW5kb3cucGVyZm9ybWFuY2UmJnR5cGVvZiB3aW5kb3cucGVyZm9ybWFuY2Uubm93PT0nZnVuY3Rpb24nKTtmdW5jdGlvbiB0aW1lckNhbGxCYWNrKGEpe3ZhciBiPShhPDFlMTI/KGU/KHBlcmZvcm1hbmNlLm5vdygpK3BlcmZvcm1hbmNlLnRpbWluZy5uYXZpZ2F0aW9uU3RhcnQpOmQoKSk6YXx8ZCgpKTtpZihiLWc+PTEwMDApe2MuX3VwZGF0ZUVsZW1zKCk7Zz1ifWYodGltZXJDYWxsQmFjayl9dmFyIGY9d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93Lm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZXx8bnVsbDt2YXIgZz0wO2lmKCFmfHwkLm5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lKXskLm5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lPW51bGw7c2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtjLl91cGRhdGVFbGVtcygpfSw5ODApfWVsc2V7Zz13aW5kb3cuYW5pbWF0aW9uU3RhcnRUaW1lfHx3aW5kb3cud2Via2l0QW5pbWF0aW9uU3RhcnRUaW1lfHx3aW5kb3cubW96QW5pbWF0aW9uU3RhcnRUaW1lfHx3aW5kb3cub0FuaW1hdGlvblN0YXJ0VGltZXx8d2luZG93Lm1zQW5pbWF0aW9uU3RhcnRUaW1lfHxkKCk7Zih0aW1lckNhbGxCYWNrKX19LFVUQ0RhdGU6ZnVuY3Rpb24oYSxiLGMsZSxmLGcsaCxpKXtpZih0eXBlb2YgYj09J29iamVjdCcmJmIuY29uc3RydWN0b3I9PURhdGUpe2k9Yi5nZXRNaWxsaXNlY29uZHMoKTtoPWIuZ2V0U2Vjb25kcygpO2c9Yi5nZXRNaW51dGVzKCk7Zj1iLmdldEhvdXJzKCk7ZT1iLmdldERhdGUoKTtjPWIuZ2V0TW9udGgoKTtiPWIuZ2V0RnVsbFllYXIoKX12YXIgZD1uZXcgRGF0ZSgpO2Quc2V0VVRDRnVsbFllYXIoYik7ZC5zZXRVVENEYXRlKDEpO2Quc2V0VVRDTW9udGgoY3x8MCk7ZC5zZXRVVENEYXRlKGV8fDEpO2Quc2V0VVRDSG91cnMoZnx8MCk7ZC5zZXRVVENNaW51dGVzKChnfHwwKS0oTWF0aC5hYnMoYSk8MzA/YSo2MDphKSk7ZC5zZXRVVENTZWNvbmRzKGh8fDApO2Quc2V0VVRDTWlsbGlzZWNvbmRzKGl8fDApO3JldHVybiBkfSxwZXJpb2RzVG9TZWNvbmRzOmZ1bmN0aW9uKGEpe3JldHVybiBhWzBdKjMxNTU3NjAwK2FbMV0qMjYyOTgwMCthWzJdKjYwNDgwMCthWzNdKjg2NDAwK2FbNF0qMzYwMCthWzVdKjYwK2FbNl19LHJlc3luYzpmdW5jdGlvbigpe3ZhciBkPXRoaXM7JCgnLicrdGhpcy5fZ2V0TWFya2VyKCkpLmVhY2goZnVuY3Rpb24oKXt2YXIgYT0kLmRhdGEodGhpcyxkLm5hbWUpO2lmKGEub3B0aW9ucy5zZXJ2ZXJTeW5jKXt2YXIgYj1udWxsO2Zvcih2YXIgaT0wO2k8ZC5fc2VydmVyU3luY3MubGVuZ3RoO2krKyl7aWYoZC5fc2VydmVyU3luY3NbaV1bMF09PWEub3B0aW9ucy5zZXJ2ZXJTeW5jKXtiPWQuX3NlcnZlclN5bmNzW2ldO2JyZWFrfX1pZihiWzJdPT1udWxsKXt2YXIgYz0oJC5pc0Z1bmN0aW9uKGEub3B0aW9ucy5zZXJ2ZXJTeW5jKT9hLm9wdGlvbnMuc2VydmVyU3luYy5hcHBseSh0aGlzLFtdKTpudWxsKTtiWzJdPShjP25ldyBEYXRlKCkuZ2V0VGltZSgpLWMuZ2V0VGltZSgpOjApLWJbMV19aWYoYS5fc2luY2Upe2EuX3NpbmNlLnNldE1pbGxpc2Vjb25kcyhhLl9zaW5jZS5nZXRNaWxsaXNlY29uZHMoKStiWzJdKX1hLl91bnRpbC5zZXRNaWxsaXNlY29uZHMoYS5fdW50aWwuZ2V0TWlsbGlzZWNvbmRzKCkrYlsyXSl9fSk7Zm9yKHZhciBpPTA7aTxkLl9zZXJ2ZXJTeW5jcy5sZW5ndGg7aSsrKXtpZihkLl9zZXJ2ZXJTeW5jc1tpXVsyXSE9bnVsbCl7ZC5fc2VydmVyU3luY3NbaV1bMV0rPWQuX3NlcnZlclN5bmNzW2ldWzJdO2RlbGV0ZSBkLl9zZXJ2ZXJTeW5jc1tpXVsyXX19fSxfaW5zdFNldHRpbmdzOmZ1bmN0aW9uKGEsYil7cmV0dXJue19wZXJpb2RzOlswLDAsMCwwLDAsMCwwXX19LF9hZGRFbGVtOmZ1bmN0aW9uKGEpe2lmKCF0aGlzLl9oYXNFbGVtKGEpKXt0aGlzLl90aW1lckVsZW1zLnB1c2goYSl9fSxfaGFzRWxlbTpmdW5jdGlvbihhKXtyZXR1cm4oJC5pbkFycmF5KGEsdGhpcy5fdGltZXJFbGVtcyk+LTEpfSxfcmVtb3ZlRWxlbTpmdW5jdGlvbihiKXt0aGlzLl90aW1lckVsZW1zPSQubWFwKHRoaXMuX3RpbWVyRWxlbXMsZnVuY3Rpb24oYSl7cmV0dXJuKGE9PWI/bnVsbDphKX0pfSxfdXBkYXRlRWxlbXM6ZnVuY3Rpb24oKXtmb3IodmFyIGk9dGhpcy5fdGltZXJFbGVtcy5sZW5ndGgtMTtpPj0wO2ktLSl7dGhpcy5fdXBkYXRlQ291bnRkb3duKHRoaXMuX3RpbWVyRWxlbXNbaV0pfX0sX29wdGlvbnNDaGFuZ2VkOmZ1bmN0aW9uKGEsYixjKXtpZihjLmxheW91dCl7Yy5sYXlvdXQ9Yy5sYXlvdXQucmVwbGFjZSgvJmx0Oy9nLCc8JykucmVwbGFjZSgvJmd0Oy9nLCc+Jyl9dGhpcy5fcmVzZXRFeHRyYUxhYmVscyhiLm9wdGlvbnMsYyk7dmFyIGQ9KGIub3B0aW9ucy50aW1lem9uZSE9Yy50aW1lem9uZSk7JC5leHRlbmQoYi5vcHRpb25zLGMpO3RoaXMuX2FkanVzdFNldHRpbmdzKGEsYixjLnVudGlsIT1udWxsfHxjLnNpbmNlIT1udWxsfHxkKTt2YXIgZT1uZXcgRGF0ZSgpO2lmKChiLl9zaW5jZSYmYi5fc2luY2U8ZSl8fChiLl91bnRpbCYmYi5fdW50aWw+ZSkpe3RoaXMuX2FkZEVsZW0oYVswXSl9dGhpcy5fdXBkYXRlQ291bnRkb3duKGEsYil9LF91cGRhdGVDb3VudGRvd246ZnVuY3Rpb24oYSxiKXthPWEuanF1ZXJ5P2E6JChhKTtiPWJ8fHRoaXMuX2dldEluc3QoYSk7aWYoIWIpe3JldHVybn1hLmh0bWwodGhpcy5fZ2VuZXJhdGVIVE1MKGIpKS50b2dnbGVDbGFzcyh0aGlzLl9ydGxDbGFzcyxiLm9wdGlvbnMuaXNSVEwpO2lmKCQuaXNGdW5jdGlvbihiLm9wdGlvbnMub25UaWNrKSl7dmFyIGM9Yi5faG9sZCE9J2xhcCc/Yi5fcGVyaW9kczp0aGlzLl9jYWxjdWxhdGVQZXJpb2RzKGIsYi5fc2hvdyxiLm9wdGlvbnMuc2lnbmlmaWNhbnQsbmV3IERhdGUoKSk7aWYoYi5vcHRpb25zLnRpY2tJbnRlcnZhbD09MXx8dGhpcy5wZXJpb2RzVG9TZWNvbmRzKGMpJWIub3B0aW9ucy50aWNrSW50ZXJ2YWw9PTApe2Iub3B0aW9ucy5vblRpY2suYXBwbHkoYVswXSxbY10pfX12YXIgZD1iLl9ob2xkIT0ncGF1c2UnJiYoYi5fc2luY2U/Yi5fbm93LmdldFRpbWUoKTxiLl9zaW5jZS5nZXRUaW1lKCk6Yi5fbm93LmdldFRpbWUoKT49Yi5fdW50aWwuZ2V0VGltZSgpKTtpZihkJiYhYi5fZXhwaXJpbmcpe2IuX2V4cGlyaW5nPXRydWU7aWYodGhpcy5faGFzRWxlbShhWzBdKXx8Yi5vcHRpb25zLmFsd2F5c0V4cGlyZSl7dGhpcy5fcmVtb3ZlRWxlbShhWzBdKTtpZigkLmlzRnVuY3Rpb24oYi5vcHRpb25zLm9uRXhwaXJ5KSl7Yi5vcHRpb25zLm9uRXhwaXJ5LmFwcGx5KGFbMF0sW10pfWlmKGIub3B0aW9ucy5leHBpcnlUZXh0KXt2YXIgZT1iLm9wdGlvbnMubGF5b3V0O2Iub3B0aW9ucy5sYXlvdXQ9Yi5vcHRpb25zLmV4cGlyeVRleHQ7dGhpcy5fdXBkYXRlQ291bnRkb3duKGFbMF0sYik7Yi5vcHRpb25zLmxheW91dD1lfWlmKGIub3B0aW9ucy5leHBpcnlVcmwpe3dpbmRvdy5sb2NhdGlvbj1iLm9wdGlvbnMuZXhwaXJ5VXJsfX1iLl9leHBpcmluZz1mYWxzZX1lbHNlIGlmKGIuX2hvbGQ9PSdwYXVzZScpe3RoaXMuX3JlbW92ZUVsZW0oYVswXSl9fSxfcmVzZXRFeHRyYUxhYmVsczpmdW5jdGlvbihhLGIpe2Zvcih2YXIgbiBpbiBiKXtpZihuLm1hdGNoKC9bTGxdYWJlbHNbMDItOV18Y29tcGFjdExhYmVsczEvKSl7YVtuXT1iW25dfX1mb3IodmFyIG4gaW4gYSl7aWYobi5tYXRjaCgvW0xsXWFiZWxzWzAyLTldfGNvbXBhY3RMYWJlbHMxLykmJnR5cGVvZiBiW25dPT09J3VuZGVmaW5lZCcpe2Fbbl09bnVsbH19fSxfYWRqdXN0U2V0dGluZ3M6ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPW51bGw7Zm9yKHZhciBpPTA7aTx0aGlzLl9zZXJ2ZXJTeW5jcy5sZW5ndGg7aSsrKXtpZih0aGlzLl9zZXJ2ZXJTeW5jc1tpXVswXT09Yi5vcHRpb25zLnNlcnZlclN5bmMpe2Q9dGhpcy5fc2VydmVyU3luY3NbaV1bMV07YnJlYWt9fWlmKGQhPW51bGwpe3ZhciBlPShiLm9wdGlvbnMuc2VydmVyU3luYz9kOjApO3ZhciBmPW5ldyBEYXRlKCl9ZWxzZXt2YXIgZz0oJC5pc0Z1bmN0aW9uKGIub3B0aW9ucy5zZXJ2ZXJTeW5jKT9iLm9wdGlvbnMuc2VydmVyU3luYy5hcHBseShhWzBdLFtdKTpudWxsKTt2YXIgZj1uZXcgRGF0ZSgpO3ZhciBlPShnP2YuZ2V0VGltZSgpLWcuZ2V0VGltZSgpOjApO3RoaXMuX3NlcnZlclN5bmNzLnB1c2goW2Iub3B0aW9ucy5zZXJ2ZXJTeW5jLGVdKX12YXIgaD1iLm9wdGlvbnMudGltZXpvbmU7aD0oaD09bnVsbD8tZi5nZXRUaW1lem9uZU9mZnNldCgpOmgpO2lmKGN8fCghYyYmYi5fdW50aWw9PW51bGwmJmIuX3NpbmNlPT1udWxsKSl7Yi5fc2luY2U9Yi5vcHRpb25zLnNpbmNlO2lmKGIuX3NpbmNlIT1udWxsKXtiLl9zaW5jZT10aGlzLlVUQ0RhdGUoaCx0aGlzLl9kZXRlcm1pbmVUaW1lKGIuX3NpbmNlLG51bGwpKTtpZihiLl9zaW5jZSYmZSl7Yi5fc2luY2Uuc2V0TWlsbGlzZWNvbmRzKGIuX3NpbmNlLmdldE1pbGxpc2Vjb25kcygpK2UpfX1iLl91bnRpbD10aGlzLlVUQ0RhdGUoaCx0aGlzLl9kZXRlcm1pbmVUaW1lKGIub3B0aW9ucy51bnRpbCxmKSk7aWYoZSl7Yi5fdW50aWwuc2V0TWlsbGlzZWNvbmRzKGIuX3VudGlsLmdldE1pbGxpc2Vjb25kcygpK2UpfX1iLl9zaG93PXRoaXMuX2RldGVybWluZVNob3coYil9LF9wcmVEZXN0cm95OmZ1bmN0aW9uKGEsYil7dGhpcy5fcmVtb3ZlRWxlbShhWzBdKTthLmVtcHR5KCl9LHBhdXNlOmZ1bmN0aW9uKGEpe3RoaXMuX2hvbGQoYSwncGF1c2UnKX0sbGFwOmZ1bmN0aW9uKGEpe3RoaXMuX2hvbGQoYSwnbGFwJyl9LHJlc3VtZTpmdW5jdGlvbihhKXt0aGlzLl9ob2xkKGEsbnVsbCl9LHRvZ2dsZTpmdW5jdGlvbihhKXt2YXIgYj0kLmRhdGEoYSx0aGlzLm5hbWUpfHx7fTt0aGlzWyFiLl9ob2xkPydwYXVzZSc6J3Jlc3VtZSddKGEpfSx0b2dnbGVMYXA6ZnVuY3Rpb24oYSl7dmFyIGI9JC5kYXRhKGEsdGhpcy5uYW1lKXx8e307dGhpc1shYi5faG9sZD8nbGFwJzoncmVzdW1lJ10oYSl9LF9ob2xkOmZ1bmN0aW9uKGEsYil7dmFyIGM9JC5kYXRhKGEsdGhpcy5uYW1lKTtpZihjKXtpZihjLl9ob2xkPT0ncGF1c2UnJiYhYil7Yy5fcGVyaW9kcz1jLl9zYXZlUGVyaW9kczt2YXIgZD0oYy5fc2luY2U/Jy0nOicrJyk7Y1tjLl9zaW5jZT8nX3NpbmNlJzonX3VudGlsJ109dGhpcy5fZGV0ZXJtaW5lVGltZShkK2MuX3BlcmlvZHNbMF0rJ3knK2QrYy5fcGVyaW9kc1sxXSsnbycrZCtjLl9wZXJpb2RzWzJdKyd3JytkK2MuX3BlcmlvZHNbM10rJ2QnK2QrYy5fcGVyaW9kc1s0XSsnaCcrZCtjLl9wZXJpb2RzWzVdKydtJytkK2MuX3BlcmlvZHNbNl0rJ3MnKTt0aGlzLl9hZGRFbGVtKGEpfWMuX2hvbGQ9YjtjLl9zYXZlUGVyaW9kcz0oYj09J3BhdXNlJz9jLl9wZXJpb2RzOm51bGwpOyQuZGF0YShhLHRoaXMubmFtZSxjKTt0aGlzLl91cGRhdGVDb3VudGRvd24oYSxjKX19LGdldFRpbWVzOmZ1bmN0aW9uKGEpe3ZhciBiPSQuZGF0YShhLHRoaXMubmFtZSk7cmV0dXJuKCFiP251bGw6KGIuX2hvbGQ9PSdwYXVzZSc/Yi5fc2F2ZVBlcmlvZHM6KCFiLl9ob2xkP2IuX3BlcmlvZHM6dGhpcy5fY2FsY3VsYXRlUGVyaW9kcyhiLGIuX3Nob3csYi5vcHRpb25zLnNpZ25pZmljYW50LG5ldyBEYXRlKCkpKSkpfSxfZGV0ZXJtaW5lVGltZTpmdW5jdGlvbihrLGwpe3ZhciBtPXRoaXM7dmFyIG49ZnVuY3Rpb24oYSl7dmFyIGI9bmV3IERhdGUoKTtiLnNldFRpbWUoYi5nZXRUaW1lKCkrYSoxMDAwKTtyZXR1cm4gYn07dmFyIG89ZnVuY3Rpb24oYSl7YT1hLnRvTG93ZXJDYXNlKCk7dmFyIGI9bmV3IERhdGUoKTt2YXIgYz1iLmdldEZ1bGxZZWFyKCk7dmFyIGQ9Yi5nZXRNb250aCgpO3ZhciBlPWIuZ2V0RGF0ZSgpO3ZhciBmPWIuZ2V0SG91cnMoKTt2YXIgZz1iLmdldE1pbnV0ZXMoKTt2YXIgaD1iLmdldFNlY29uZHMoKTt2YXIgaT0vKFsrLV0/WzAtOV0rKVxccyooc3xtfGh8ZHx3fG98eSk/L2c7dmFyIGo9aS5leGVjKGEpO3doaWxlKGope3N3aXRjaChqWzJdfHwncycpe2Nhc2Uncyc6aCs9cGFyc2VJbnQoalsxXSwxMCk7YnJlYWs7Y2FzZSdtJzpnKz1wYXJzZUludChqWzFdLDEwKTticmVhaztjYXNlJ2gnOmYrPXBhcnNlSW50KGpbMV0sMTApO2JyZWFrO2Nhc2UnZCc6ZSs9cGFyc2VJbnQoalsxXSwxMCk7YnJlYWs7Y2FzZSd3JzplKz1wYXJzZUludChqWzFdLDEwKSo3O2JyZWFrO2Nhc2Unbyc6ZCs9cGFyc2VJbnQoalsxXSwxMCk7ZT1NYXRoLm1pbihlLG0uX2dldERheXNJbk1vbnRoKGMsZCkpO2JyZWFrO2Nhc2UneSc6Yys9cGFyc2VJbnQoalsxXSwxMCk7ZT1NYXRoLm1pbihlLG0uX2dldERheXNJbk1vbnRoKGMsZCkpO2JyZWFrfWo9aS5leGVjKGEpfXJldHVybiBuZXcgRGF0ZShjLGQsZSxmLGcsaCwwKX07dmFyIHA9KGs9PW51bGw/bDoodHlwZW9mIGs9PSdzdHJpbmcnP28oayk6KHR5cGVvZiBrPT0nbnVtYmVyJz9uKGspOmspKSk7aWYocClwLnNldE1pbGxpc2Vjb25kcygwKTtyZXR1cm4gcH0sX2dldERheXNJbk1vbnRoOmZ1bmN0aW9uKGEsYil7cmV0dXJuIDMyLW5ldyBEYXRlKGEsYiwzMikuZ2V0RGF0ZSgpfSxfbm9ybWFsTGFiZWxzOmZ1bmN0aW9uKGEpe3JldHVybiBhfSxfZ2VuZXJhdGVIVE1MOmZ1bmN0aW9uKGMpe3ZhciBkPXRoaXM7Yy5fcGVyaW9kcz0oYy5faG9sZD9jLl9wZXJpb2RzOnRoaXMuX2NhbGN1bGF0ZVBlcmlvZHMoYyxjLl9zaG93LGMub3B0aW9ucy5zaWduaWZpY2FudCxuZXcgRGF0ZSgpKSk7dmFyIGU9ZmFsc2U7dmFyIGY9MDt2YXIgZz1jLm9wdGlvbnMuc2lnbmlmaWNhbnQ7dmFyIGg9JC5leHRlbmQoe30sYy5fc2hvdyk7Zm9yKHZhciBpPVk7aTw9UztpKyspe2V8PShjLl9zaG93W2ldPT0nPycmJmMuX3BlcmlvZHNbaV0+MCk7aFtpXT0oYy5fc2hvd1tpXT09Jz8nJiYhZT9udWxsOmMuX3Nob3dbaV0pO2YrPShoW2ldPzE6MCk7Zy09KGMuX3BlcmlvZHNbaV0+MD8xOjApfXZhciBqPVtmYWxzZSxmYWxzZSxmYWxzZSxmYWxzZSxmYWxzZSxmYWxzZSxmYWxzZV07Zm9yKHZhciBpPVM7aT49WTtpLS0pe2lmKGMuX3Nob3dbaV0pe2lmKGMuX3BlcmlvZHNbaV0pe2pbaV09dHJ1ZX1lbHNle2pbaV09Zz4wO2ctLX19fXZhciBrPShjLm9wdGlvbnMuY29tcGFjdD9jLm9wdGlvbnMuY29tcGFjdExhYmVsczpjLm9wdGlvbnMubGFiZWxzKTt2YXIgbD1jLm9wdGlvbnMud2hpY2hMYWJlbHN8fHRoaXMuX25vcm1hbExhYmVsczt2YXIgbT1mdW5jdGlvbihhKXt2YXIgYj1jLm9wdGlvbnNbJ2NvbXBhY3RMYWJlbHMnK2woYy5fcGVyaW9kc1thXSldO3JldHVybihoW2FdP2QuX3RyYW5zbGF0ZURpZ2l0cyhjLGMuX3BlcmlvZHNbYV0pKyhiP2JbYV06a1thXSkrJyAnOicnKX07dmFyIG49KGMub3B0aW9ucy5wYWRaZXJvZXM/MjoxKTt2YXIgbz1mdW5jdGlvbihhKXt2YXIgYj1jLm9wdGlvbnNbJ2xhYmVscycrbChjLl9wZXJpb2RzW2FdKV07cmV0dXJuKCghYy5vcHRpb25zLnNpZ25pZmljYW50JiZoW2FdKXx8KGMub3B0aW9ucy5zaWduaWZpY2FudCYmalthXSk/JzxzcGFuIGNsYXNzPVwiJytkLl9zZWN0aW9uQ2xhc3MrJ1wiPicrJzxzcGFuIGNsYXNzPVwiJytkLl9hbW91bnRDbGFzcysnXCI+JytkLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW2FdLG4pKyc8L3NwYW4+JysnPHNwYW4gY2xhc3M9XCInK2QuX3BlcmlvZENsYXNzKydcIj4nKyhiP2JbYV06a1thXSkrJzwvc3Bhbj48L3NwYW4+JzonJyl9O3JldHVybihjLm9wdGlvbnMubGF5b3V0P3RoaXMuX2J1aWxkTGF5b3V0KGMsaCxjLm9wdGlvbnMubGF5b3V0LGMub3B0aW9ucy5jb21wYWN0LGMub3B0aW9ucy5zaWduaWZpY2FudCxqKTooKGMub3B0aW9ucy5jb21wYWN0Pyc8c3BhbiBjbGFzcz1cIicrdGhpcy5fcm93Q2xhc3MrJyAnK3RoaXMuX2Ftb3VudENsYXNzKyhjLl9ob2xkPycgJyt0aGlzLl9ob2xkaW5nQ2xhc3M6JycpKydcIj4nK20oWSkrbShPKSttKFcpK20oRCkrKGhbSF0/dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tIXSwyKTonJykrKGhbTV0/KGhbSF0/Yy5vcHRpb25zLnRpbWVTZXBhcmF0b3I6JycpK3RoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbTV0sMik6JycpKyhoW1NdPyhoW0hdfHxoW01dP2Mub3B0aW9ucy50aW1lU2VwYXJhdG9yOicnKSt0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW1NdLDIpOicnKTonPHNwYW4gY2xhc3M9XCInK3RoaXMuX3Jvd0NsYXNzKycgJyt0aGlzLl9zaG93Q2xhc3MrKGMub3B0aW9ucy5zaWduaWZpY2FudHx8ZikrKGMuX2hvbGQ/JyAnK3RoaXMuX2hvbGRpbmdDbGFzczonJykrJ1wiPicrbyhZKStvKE8pK28oVykrbyhEKStvKEgpK28oTSkrbyhTKSkrJzwvc3Bhbj4nKyhjLm9wdGlvbnMuZGVzY3JpcHRpb24/JzxzcGFuIGNsYXNzPVwiJyt0aGlzLl9yb3dDbGFzcysnICcrdGhpcy5fZGVzY3JDbGFzcysnXCI+JytjLm9wdGlvbnMuZGVzY3JpcHRpb24rJzwvc3Bhbj4nOicnKSkpfSxfYnVpbGRMYXlvdXQ6ZnVuY3Rpb24oYyxkLGUsZixnLGgpe3ZhciBqPWMub3B0aW9uc1tmPydjb21wYWN0TGFiZWxzJzonbGFiZWxzJ107dmFyIGs9Yy5vcHRpb25zLndoaWNoTGFiZWxzfHx0aGlzLl9ub3JtYWxMYWJlbHM7dmFyIGw9ZnVuY3Rpb24oYSl7cmV0dXJuKGMub3B0aW9uc1soZj8nY29tcGFjdExhYmVscyc6J2xhYmVscycpK2soYy5fcGVyaW9kc1thXSldfHxqKVthXX07dmFyIG09ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYy5vcHRpb25zLmRpZ2l0c1tNYXRoLmZsb29yKGEvYiklMTBdfTt2YXIgbz17ZGVzYzpjLm9wdGlvbnMuZGVzY3JpcHRpb24sc2VwOmMub3B0aW9ucy50aW1lU2VwYXJhdG9yLHlsOmwoWSkseW46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tZXSwxKSx5bm46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tZXSwyKSx5bm5uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbWV0sMykseTE6bShjLl9wZXJpb2RzW1ldLDEpLHkxMDptKGMuX3BlcmlvZHNbWV0sMTApLHkxMDA6bShjLl9wZXJpb2RzW1ldLDEwMCkseTEwMDA6bShjLl9wZXJpb2RzW1ldLDEwMDApLG9sOmwoTyksb246dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tPXSwxKSxvbm46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tPXSwyKSxvbm5uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbT10sMyksbzE6bShjLl9wZXJpb2RzW09dLDEpLG8xMDptKGMuX3BlcmlvZHNbT10sMTApLG8xMDA6bShjLl9wZXJpb2RzW09dLDEwMCksbzEwMDA6bShjLl9wZXJpb2RzW09dLDEwMDApLHdsOmwoVyksd246dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tXXSwxKSx3bm46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tXXSwyKSx3bm5uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbV10sMyksdzE6bShjLl9wZXJpb2RzW1ddLDEpLHcxMDptKGMuX3BlcmlvZHNbV10sMTApLHcxMDA6bShjLl9wZXJpb2RzW1ddLDEwMCksdzEwMDA6bShjLl9wZXJpb2RzW1ddLDEwMDApLGRsOmwoRCksZG46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tEXSwxKSxkbm46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tEXSwyKSxkbm5uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbRF0sMyksZDE6bShjLl9wZXJpb2RzW0RdLDEpLGQxMDptKGMuX3BlcmlvZHNbRF0sMTApLGQxMDA6bShjLl9wZXJpb2RzW0RdLDEwMCksZDEwMDA6bShjLl9wZXJpb2RzW0RdLDEwMDApLGhsOmwoSCksaG46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tIXSwxKSxobm46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tIXSwyKSxobm5uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbSF0sMyksaDE6bShjLl9wZXJpb2RzW0hdLDEpLGgxMDptKGMuX3BlcmlvZHNbSF0sMTApLGgxMDA6bShjLl9wZXJpb2RzW0hdLDEwMCksaDEwMDA6bShjLl9wZXJpb2RzW0hdLDEwMDApLG1sOmwoTSksbW46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tNXSwxKSxtbm46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tNXSwyKSxtbm5uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbTV0sMyksbTE6bShjLl9wZXJpb2RzW01dLDEpLG0xMDptKGMuX3BlcmlvZHNbTV0sMTApLG0xMDA6bShjLl9wZXJpb2RzW01dLDEwMCksbTEwMDA6bShjLl9wZXJpb2RzW01dLDEwMDApLHNsOmwoUyksc246dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tTXSwxKSxzbm46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tTXSwyKSxzbm5uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbU10sMyksczE6bShjLl9wZXJpb2RzW1NdLDEpLHMxMDptKGMuX3BlcmlvZHNbU10sMTApLHMxMDA6bShjLl9wZXJpb2RzW1NdLDEwMCksczEwMDA6bShjLl9wZXJpb2RzW1NdLDEwMDApfTt2YXIgcD1lO2Zvcih2YXIgaT1ZO2k8PVM7aSsrKXt2YXIgcT0neW93ZGhtcycuY2hhckF0KGkpO3ZhciByPW5ldyBSZWdFeHAoJ1xcXFx7JytxKyc8XFxcXH0oW1xcXFxzXFxcXFNdKilcXFxceycrcSsnPlxcXFx9JywnZycpO3A9cC5yZXBsYWNlKHIsKCghZyYmZFtpXSl8fChnJiZoW2ldKT8nJDEnOicnKSl9JC5lYWNoKG8sZnVuY3Rpb24obix2KXt2YXIgYT1uZXcgUmVnRXhwKCdcXFxceycrbisnXFxcXH0nLCdnJyk7cD1wLnJlcGxhY2UoYSx2KX0pO3JldHVybiBwfSxfbWluRGlnaXRzOmZ1bmN0aW9uKGEsYixjKXtiPScnK2I7aWYoYi5sZW5ndGg+PWMpe3JldHVybiB0aGlzLl90cmFuc2xhdGVEaWdpdHMoYSxiKX1iPScwMDAwMDAwMDAwJytiO3JldHVybiB0aGlzLl90cmFuc2xhdGVEaWdpdHMoYSxiLnN1YnN0cihiLmxlbmd0aC1jKSl9LF90cmFuc2xhdGVEaWdpdHM6ZnVuY3Rpb24oYixjKXtyZXR1cm4oJycrYykucmVwbGFjZSgvWzAtOV0vZyxmdW5jdGlvbihhKXtyZXR1cm4gYi5vcHRpb25zLmRpZ2l0c1thXX0pfSxfZGV0ZXJtaW5lU2hvdzpmdW5jdGlvbihhKXt2YXIgYj1hLm9wdGlvbnMuZm9ybWF0O3ZhciBjPVtdO2NbWV09KGIubWF0Y2goJ3knKT8nPyc6KGIubWF0Y2goJ1knKT8nISc6bnVsbCkpO2NbT109KGIubWF0Y2goJ28nKT8nPyc6KGIubWF0Y2goJ08nKT8nISc6bnVsbCkpO2NbV109KGIubWF0Y2goJ3cnKT8nPyc6KGIubWF0Y2goJ1cnKT8nISc6bnVsbCkpO2NbRF09KGIubWF0Y2goJ2QnKT8nPyc6KGIubWF0Y2goJ0QnKT8nISc6bnVsbCkpO2NbSF09KGIubWF0Y2goJ2gnKT8nPyc6KGIubWF0Y2goJ0gnKT8nISc6bnVsbCkpO2NbTV09KGIubWF0Y2goJ20nKT8nPyc6KGIubWF0Y2goJ00nKT8nISc6bnVsbCkpO2NbU109KGIubWF0Y2goJ3MnKT8nPyc6KGIubWF0Y2goJ1MnKT8nISc6bnVsbCkpO3JldHVybiBjfSxfY2FsY3VsYXRlUGVyaW9kczpmdW5jdGlvbihjLGQsZSxmKXtjLl9ub3c9ZjtjLl9ub3cuc2V0TWlsbGlzZWNvbmRzKDApO3ZhciBnPW5ldyBEYXRlKGMuX25vdy5nZXRUaW1lKCkpO2lmKGMuX3NpbmNlKXtpZihmLmdldFRpbWUoKTxjLl9zaW5jZS5nZXRUaW1lKCkpe2MuX25vdz1mPWd9ZWxzZXtmPWMuX3NpbmNlfX1lbHNle2cuc2V0VGltZShjLl91bnRpbC5nZXRUaW1lKCkpO2lmKGYuZ2V0VGltZSgpPmMuX3VudGlsLmdldFRpbWUoKSl7Yy5fbm93PWY9Z319dmFyIGg9WzAsMCwwLDAsMCwwLDBdO2lmKGRbWV18fGRbT10pe3ZhciBpPXRoaXMuX2dldERheXNJbk1vbnRoKGYuZ2V0RnVsbFllYXIoKSxmLmdldE1vbnRoKCkpO3ZhciBqPXRoaXMuX2dldERheXNJbk1vbnRoKGcuZ2V0RnVsbFllYXIoKSxnLmdldE1vbnRoKCkpO3ZhciBrPShnLmdldERhdGUoKT09Zi5nZXREYXRlKCl8fChnLmdldERhdGUoKT49TWF0aC5taW4oaSxqKSYmZi5nZXREYXRlKCk+PU1hdGgubWluKGksaikpKTt2YXIgbD1mdW5jdGlvbihhKXtyZXR1cm4oYS5nZXRIb3VycygpKjYwK2EuZ2V0TWludXRlcygpKSo2MCthLmdldFNlY29uZHMoKX07dmFyIG09TWF0aC5tYXgoMCwoZy5nZXRGdWxsWWVhcigpLWYuZ2V0RnVsbFllYXIoKSkqMTIrZy5nZXRNb250aCgpLWYuZ2V0TW9udGgoKSsoKGcuZ2V0RGF0ZSgpPGYuZ2V0RGF0ZSgpJiYhayl8fChrJiZsKGcpPGwoZikpPy0xOjApKTtoW1ldPShkW1ldP01hdGguZmxvb3IobS8xMik6MCk7aFtPXT0oZFtPXT9tLWhbWV0qMTI6MCk7Zj1uZXcgRGF0ZShmLmdldFRpbWUoKSk7dmFyIG49KGYuZ2V0RGF0ZSgpPT1pKTt2YXIgbz10aGlzLl9nZXREYXlzSW5Nb250aChmLmdldEZ1bGxZZWFyKCkraFtZXSxmLmdldE1vbnRoKCkraFtPXSk7aWYoZi5nZXREYXRlKCk+byl7Zi5zZXREYXRlKG8pfWYuc2V0RnVsbFllYXIoZi5nZXRGdWxsWWVhcigpK2hbWV0pO2Yuc2V0TW9udGgoZi5nZXRNb250aCgpK2hbT10pO2lmKG4pe2Yuc2V0RGF0ZShvKX19dmFyIHA9TWF0aC5mbG9vcigoZy5nZXRUaW1lKCktZi5nZXRUaW1lKCkpLzEwMDApO3ZhciBxPWZ1bmN0aW9uKGEsYil7aFthXT0oZFthXT9NYXRoLmZsb29yKHAvYik6MCk7cC09aFthXSpifTtxKFcsNjA0ODAwKTtxKEQsODY0MDApO3EoSCwzNjAwKTtxKE0sNjApO3EoUywxKTtpZihwPjAmJiFjLl9zaW5jZSl7dmFyIHI9WzEsMTIsNC4zNDgyLDcsMjQsNjAsNjBdO3ZhciBzPVM7dmFyIHQ9MTtmb3IodmFyIHU9Uzt1Pj1ZO3UtLSl7aWYoZFt1XSl7aWYoaFtzXT49dCl7aFtzXT0wO3A9MX1pZihwPjApe2hbdV0rKztwPTA7cz11O3Q9MX19dCo9clt1XX19aWYoZSl7Zm9yKHZhciB1PVk7dTw9Uzt1Kyspe2lmKGUmJmhbdV0pe2UtLX1lbHNlIGlmKCFlKXtoW3VdPTB9fX1yZXR1cm4gaH19KX0pKGpRdWVyeSk7IiwiIWZ1bmN0aW9uKGEsYil7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXCJqcXVlcnlcIl0sYik6XCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9YihyZXF1aXJlKFwianF1ZXJ5XCIpKTpiKGEualF1ZXJ5KX0odGhpcyxmdW5jdGlvbihhKXtcImZ1bmN0aW9uXCIhPXR5cGVvZiBPYmplY3QuY3JlYXRlJiYoT2JqZWN0LmNyZWF0ZT1mdW5jdGlvbihhKXtmdW5jdGlvbiBiKCl7fXJldHVybiBiLnByb3RvdHlwZT1hLG5ldyBifSk7dmFyIGI9e2luaXQ6ZnVuY3Rpb24oYil7cmV0dXJuIHRoaXMub3B0aW9ucz1hLmV4dGVuZCh7fSxhLm5vdHkuZGVmYXVsdHMsYiksdGhpcy5vcHRpb25zLmxheW91dD10aGlzLm9wdGlvbnMuY3VzdG9tP2Eubm90eS5sYXlvdXRzLmlubGluZTphLm5vdHkubGF5b3V0c1t0aGlzLm9wdGlvbnMubGF5b3V0XSxhLm5vdHkudGhlbWVzW3RoaXMub3B0aW9ucy50aGVtZV0/dGhpcy5vcHRpb25zLnRoZW1lPWEubm90eS50aGVtZXNbdGhpcy5vcHRpb25zLnRoZW1lXTp0aGlzLm9wdGlvbnMudGhlbWVDbGFzc05hbWU9dGhpcy5vcHRpb25zLnRoZW1lLHRoaXMub3B0aW9ucz1hLmV4dGVuZCh7fSx0aGlzLm9wdGlvbnMsdGhpcy5vcHRpb25zLmxheW91dC5vcHRpb25zKSx0aGlzLm9wdGlvbnMuaWQ9XCJub3R5X1wiKyhuZXcgRGF0ZSkuZ2V0VGltZSgpKk1hdGguZmxvb3IoMWU2Kk1hdGgucmFuZG9tKCkpLHRoaXMuX2J1aWxkKCksdGhpc30sX2J1aWxkOmZ1bmN0aW9uKCl7dmFyIGI9YSgnPGRpdiBjbGFzcz1cIm5vdHlfYmFyIG5vdHlfdHlwZV8nK3RoaXMub3B0aW9ucy50eXBlKydcIj48L2Rpdj4nKS5hdHRyKFwiaWRcIix0aGlzLm9wdGlvbnMuaWQpO2lmKGIuYXBwZW5kKHRoaXMub3B0aW9ucy50ZW1wbGF0ZSkuZmluZChcIi5ub3R5X3RleHRcIikuaHRtbCh0aGlzLm9wdGlvbnMudGV4dCksdGhpcy4kYmFyPW51bGwhPT10aGlzLm9wdGlvbnMubGF5b3V0LnBhcmVudC5vYmplY3Q/YSh0aGlzLm9wdGlvbnMubGF5b3V0LnBhcmVudC5vYmplY3QpLmNzcyh0aGlzLm9wdGlvbnMubGF5b3V0LnBhcmVudC5jc3MpLmFwcGVuZChiKTpiLHRoaXMub3B0aW9ucy50aGVtZUNsYXNzTmFtZSYmdGhpcy4kYmFyLmFkZENsYXNzKHRoaXMub3B0aW9ucy50aGVtZUNsYXNzTmFtZSkuYWRkQ2xhc3MoXCJub3R5X2NvbnRhaW5lcl90eXBlX1wiK3RoaXMub3B0aW9ucy50eXBlKSx0aGlzLm9wdGlvbnMuYnV0dG9ucyl7dGhpcy5vcHRpb25zLmNsb3NlV2l0aD1bXSx0aGlzLm9wdGlvbnMudGltZW91dD0hMTt2YXIgYz1hKFwiPGRpdi8+XCIpLmFkZENsYXNzKFwibm90eV9idXR0b25zXCIpO251bGwhPT10aGlzLm9wdGlvbnMubGF5b3V0LnBhcmVudC5vYmplY3Q/dGhpcy4kYmFyLmZpbmQoXCIubm90eV9iYXJcIikuYXBwZW5kKGMpOnRoaXMuJGJhci5hcHBlbmQoYyk7dmFyIGQ9dGhpczthLmVhY2godGhpcy5vcHRpb25zLmJ1dHRvbnMsZnVuY3Rpb24oYixjKXt2YXIgZT1hKFwiPGJ1dHRvbi8+XCIpLmFkZENsYXNzKGMuYWRkQ2xhc3M/Yy5hZGRDbGFzczpcImdyYXlcIikuaHRtbChjLnRleHQpLmF0dHIoXCJpZFwiLGMuaWQ/Yy5pZDpcImJ1dHRvbi1cIitiKS5hdHRyKFwidGl0bGVcIixjLnRpdGxlKS5hcHBlbmRUbyhkLiRiYXIuZmluZChcIi5ub3R5X2J1dHRvbnNcIikpLm9uKFwiY2xpY2tcIixmdW5jdGlvbihiKXthLmlzRnVuY3Rpb24oYy5vbkNsaWNrKSYmYy5vbkNsaWNrLmNhbGwoZSxkLGIpfSl9KX10aGlzLiRtZXNzYWdlPXRoaXMuJGJhci5maW5kKFwiLm5vdHlfbWVzc2FnZVwiKSx0aGlzLiRjbG9zZUJ1dHRvbj10aGlzLiRiYXIuZmluZChcIi5ub3R5X2Nsb3NlXCIpLHRoaXMuJGJ1dHRvbnM9dGhpcy4kYmFyLmZpbmQoXCIubm90eV9idXR0b25zXCIpLGEubm90eS5zdG9yZVt0aGlzLm9wdGlvbnMuaWRdPXRoaXN9LHNob3c6ZnVuY3Rpb24oKXt2YXIgYj10aGlzO3JldHVybiBiLm9wdGlvbnMuY3VzdG9tP2Iub3B0aW9ucy5jdXN0b20uZmluZChiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikuYXBwZW5kKGIuJGJhcik6YShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikuYXBwZW5kKGIuJGJhciksYi5vcHRpb25zLnRoZW1lJiZiLm9wdGlvbnMudGhlbWUuc3R5bGUmJmIub3B0aW9ucy50aGVtZS5zdHlsZS5hcHBseShiKSxcImZ1bmN0aW9uXCI9PT1hLnR5cGUoYi5vcHRpb25zLmxheW91dC5jc3MpP3RoaXMub3B0aW9ucy5sYXlvdXQuY3NzLmFwcGx5KGIuJGJhcik6Yi4kYmFyLmNzcyh0aGlzLm9wdGlvbnMubGF5b3V0LmNzc3x8e30pLGIuJGJhci5hZGRDbGFzcyhiLm9wdGlvbnMubGF5b3V0LmFkZENsYXNzKSxiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zdHlsZS5hcHBseShhKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKSxbYi5vcHRpb25zLndpdGhpbl0pLGIuc2hvd2luZz0hMCxiLm9wdGlvbnMudGhlbWUmJmIub3B0aW9ucy50aGVtZS5zdHlsZSYmYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrLm9uU2hvdy5hcHBseSh0aGlzKSxhLmluQXJyYXkoXCJjbGlja1wiLGIub3B0aW9ucy5jbG9zZVdpdGgpPi0xJiZiLiRiYXIuY3NzKFwiY3Vyc29yXCIsXCJwb2ludGVyXCIpLm9uZShcImNsaWNrXCIsZnVuY3Rpb24oYSl7Yi5zdG9wUHJvcGFnYXRpb24oYSksYi5vcHRpb25zLmNhbGxiYWNrLm9uQ2xvc2VDbGljayYmYi5vcHRpb25zLmNhbGxiYWNrLm9uQ2xvc2VDbGljay5hcHBseShiKSxiLmNsb3NlKCl9KSxhLmluQXJyYXkoXCJob3ZlclwiLGIub3B0aW9ucy5jbG9zZVdpdGgpPi0xJiZiLiRiYXIub25lKFwibW91c2VlbnRlclwiLGZ1bmN0aW9uKCl7Yi5jbG9zZSgpfSksYS5pbkFycmF5KFwiYnV0dG9uXCIsYi5vcHRpb25zLmNsb3NlV2l0aCk+LTEmJmIuJGNsb3NlQnV0dG9uLm9uZShcImNsaWNrXCIsZnVuY3Rpb24oYSl7Yi5zdG9wUHJvcGFnYXRpb24oYSksYi5jbG9zZSgpfSksLTE9PWEuaW5BcnJheShcImJ1dHRvblwiLGIub3B0aW9ucy5jbG9zZVdpdGgpJiZiLiRjbG9zZUJ1dHRvbi5yZW1vdmUoKSxiLm9wdGlvbnMuY2FsbGJhY2sub25TaG93JiZiLm9wdGlvbnMuY2FsbGJhY2sub25TaG93LmFwcGx5KGIpLFwic3RyaW5nXCI9PXR5cGVvZiBiLm9wdGlvbnMuYW5pbWF0aW9uLm9wZW4/KGIuJGJhci5jc3MoXCJoZWlnaHRcIixiLiRiYXIuaW5uZXJIZWlnaHQoKSksYi4kYmFyLm9uKFwiY2xpY2tcIixmdW5jdGlvbihhKXtiLndhc0NsaWNrZWQ9ITB9KSxiLiRiYXIuc2hvdygpLmFkZENsYXNzKGIub3B0aW9ucy5hbmltYXRpb24ub3Blbikub25lKFwid2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZFwiLGZ1bmN0aW9uKCl7Yi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyU2hvdyYmYi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyU2hvdy5hcHBseShiKSxiLnNob3dpbmc9ITEsYi5zaG93bj0hMCxiLmhhc093blByb3BlcnR5KFwid2FzQ2xpY2tlZFwiKSYmKGIuJGJhci5vZmYoXCJjbGlja1wiLGZ1bmN0aW9uKGEpe2Iud2FzQ2xpY2tlZD0hMH0pLGIuY2xvc2UoKSl9KSk6Yi4kYmFyLmFuaW1hdGUoYi5vcHRpb25zLmFuaW1hdGlvbi5vcGVuLGIub3B0aW9ucy5hbmltYXRpb24uc3BlZWQsYi5vcHRpb25zLmFuaW1hdGlvbi5lYXNpbmcsZnVuY3Rpb24oKXtiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJTaG93JiZiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJTaG93LmFwcGx5KGIpLGIuc2hvd2luZz0hMSxiLnNob3duPSEwfSksYi5vcHRpb25zLnRpbWVvdXQmJmIuJGJhci5kZWxheShiLm9wdGlvbnMudGltZW91dCkucHJvbWlzZSgpLmRvbmUoZnVuY3Rpb24oKXtiLmNsb3NlKCl9KSx0aGlzfSxjbG9zZTpmdW5jdGlvbigpe2lmKCEodGhpcy5jbG9zZWR8fHRoaXMuJGJhciYmdGhpcy4kYmFyLmhhc0NsYXNzKFwiaS1hbS1jbG9zaW5nLW5vd1wiKSkpe3ZhciBiPXRoaXM7aWYodGhpcy5zaG93aW5nKXJldHVybiB2b2lkIGIuJGJhci5xdWV1ZShmdW5jdGlvbigpe2IuY2xvc2UuYXBwbHkoYil9KTtpZighdGhpcy5zaG93biYmIXRoaXMuc2hvd2luZyl7dmFyIGM9W107cmV0dXJuIGEuZWFjaChhLm5vdHkucXVldWUsZnVuY3Rpb24oYSxkKXtkLm9wdGlvbnMuaWQhPWIub3B0aW9ucy5pZCYmYy5wdXNoKGQpfSksdm9pZChhLm5vdHkucXVldWU9Yyl9Yi4kYmFyLmFkZENsYXNzKFwiaS1hbS1jbG9zaW5nLW5vd1wiKSxiLm9wdGlvbnMuY2FsbGJhY2sub25DbG9zZSYmYi5vcHRpb25zLmNhbGxiYWNrLm9uQ2xvc2UuYXBwbHkoYiksXCJzdHJpbmdcIj09dHlwZW9mIGIub3B0aW9ucy5hbmltYXRpb24uY2xvc2U/Yi4kYmFyLmFkZENsYXNzKGIub3B0aW9ucy5hbmltYXRpb24uY2xvc2UpLm9uZShcIndlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmRcIixmdW5jdGlvbigpe2Iub3B0aW9ucy5jYWxsYmFjay5hZnRlckNsb3NlJiZiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJDbG9zZS5hcHBseShiKSxiLmNsb3NlQ2xlYW5VcCgpfSk6Yi4kYmFyLmNsZWFyUXVldWUoKS5zdG9wKCkuYW5pbWF0ZShiLm9wdGlvbnMuYW5pbWF0aW9uLmNsb3NlLGIub3B0aW9ucy5hbmltYXRpb24uc3BlZWQsYi5vcHRpb25zLmFuaW1hdGlvbi5lYXNpbmcsZnVuY3Rpb24oKXtiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJDbG9zZSYmYi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyQ2xvc2UuYXBwbHkoYil9KS5wcm9taXNlKCkuZG9uZShmdW5jdGlvbigpe2IuY2xvc2VDbGVhblVwKCl9KX19LGNsb3NlQ2xlYW5VcDpmdW5jdGlvbigpe3ZhciBiPXRoaXM7Yi5vcHRpb25zLm1vZGFsJiYoYS5ub3R5UmVuZGVyZXIuc2V0TW9kYWxDb3VudCgtMSksMD09YS5ub3R5UmVuZGVyZXIuZ2V0TW9kYWxDb3VudCgpJiZhKFwiLm5vdHlfbW9kYWxcIikuZmFkZU91dChiLm9wdGlvbnMuYW5pbWF0aW9uLmZhZGVTcGVlZCxmdW5jdGlvbigpe2EodGhpcykucmVtb3ZlKCl9KSksYS5ub3R5UmVuZGVyZXIuc2V0TGF5b3V0Q291bnRGb3IoYiwtMSksMD09YS5ub3R5UmVuZGVyZXIuZ2V0TGF5b3V0Q291bnRGb3IoYikmJmEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLnJlbW92ZSgpLFwidW5kZWZpbmVkXCIhPXR5cGVvZiBiLiRiYXImJm51bGwhPT1iLiRiYXImJihcInN0cmluZ1wiPT10eXBlb2YgYi5vcHRpb25zLmFuaW1hdGlvbi5jbG9zZT8oYi4kYmFyLmNzcyhcInRyYW5zaXRpb25cIixcImFsbCAxMDBtcyBlYXNlXCIpLmNzcyhcImJvcmRlclwiLDApLmNzcyhcIm1hcmdpblwiLDApLmhlaWdodCgwKSxiLiRiYXIub25lKFwidHJhbnNpdGlvbmVuZCB3ZWJraXRUcmFuc2l0aW9uRW5kIG9UcmFuc2l0aW9uRW5kIE1TVHJhbnNpdGlvbkVuZFwiLGZ1bmN0aW9uKCl7Yi4kYmFyLnJlbW92ZSgpLGIuJGJhcj1udWxsLGIuY2xvc2VkPSEwLGIub3B0aW9ucy50aGVtZS5jYWxsYmFjayYmYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrLm9uQ2xvc2UmJmIub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vbkNsb3NlLmFwcGx5KGIpfSkpOihiLiRiYXIucmVtb3ZlKCksYi4kYmFyPW51bGwsYi5jbG9zZWQ9ITApKSxkZWxldGUgYS5ub3R5LnN0b3JlW2Iub3B0aW9ucy5pZF0sYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrJiZiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2sub25DbG9zZSYmYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrLm9uQ2xvc2UuYXBwbHkoYiksYi5vcHRpb25zLmRpc21pc3NRdWV1ZXx8KGEubm90eS5vbnRhcD0hMCxhLm5vdHlSZW5kZXJlci5yZW5kZXIoKSksYi5vcHRpb25zLm1heFZpc2libGU+MCYmYi5vcHRpb25zLmRpc21pc3NRdWV1ZSYmYS5ub3R5UmVuZGVyZXIucmVuZGVyKCl9LHNldFRleHQ6ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuY2xvc2VkfHwodGhpcy5vcHRpb25zLnRleHQ9YSx0aGlzLiRiYXIuZmluZChcIi5ub3R5X3RleHRcIikuaHRtbChhKSksdGhpc30sc2V0VHlwZTpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5jbG9zZWR8fCh0aGlzLm9wdGlvbnMudHlwZT1hLHRoaXMub3B0aW9ucy50aGVtZS5zdHlsZS5hcHBseSh0aGlzKSx0aGlzLm9wdGlvbnMudGhlbWUuY2FsbGJhY2sub25TaG93LmFwcGx5KHRoaXMpKSx0aGlzfSxzZXRUaW1lb3V0OmZ1bmN0aW9uKGEpe2lmKCF0aGlzLmNsb3NlZCl7dmFyIGI9dGhpczt0aGlzLm9wdGlvbnMudGltZW91dD1hLGIuJGJhci5kZWxheShiLm9wdGlvbnMudGltZW91dCkucHJvbWlzZSgpLmRvbmUoZnVuY3Rpb24oKXtiLmNsb3NlKCl9KX1yZXR1cm4gdGhpc30sc3RvcFByb3BhZ2F0aW9uOmZ1bmN0aW9uKGEpe2E9YXx8d2luZG93LmV2ZW50LFwidW5kZWZpbmVkXCIhPXR5cGVvZiBhLnN0b3BQcm9wYWdhdGlvbj9hLnN0b3BQcm9wYWdhdGlvbigpOmEuY2FuY2VsQnViYmxlPSEwfSxjbG9zZWQ6ITEsc2hvd2luZzohMSxzaG93bjohMX07YS5ub3R5UmVuZGVyZXI9e30sYS5ub3R5UmVuZGVyZXIuaW5pdD1mdW5jdGlvbihjKXt2YXIgZD1PYmplY3QuY3JlYXRlKGIpLmluaXQoYyk7cmV0dXJuIGQub3B0aW9ucy5raWxsZXImJmEubm90eS5jbG9zZUFsbCgpLGQub3B0aW9ucy5mb3JjZT9hLm5vdHkucXVldWUudW5zaGlmdChkKTphLm5vdHkucXVldWUucHVzaChkKSxhLm5vdHlSZW5kZXJlci5yZW5kZXIoKSxcIm9iamVjdFwiPT1hLm5vdHkucmV0dXJucz9kOmQub3B0aW9ucy5pZH0sYS5ub3R5UmVuZGVyZXIucmVuZGVyPWZ1bmN0aW9uKCl7dmFyIGI9YS5ub3R5LnF1ZXVlWzBdO1wib2JqZWN0XCI9PT1hLnR5cGUoYik/Yi5vcHRpb25zLmRpc21pc3NRdWV1ZT9iLm9wdGlvbnMubWF4VmlzaWJsZT4wP2EoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IrXCIgPiBsaVwiKS5sZW5ndGg8Yi5vcHRpb25zLm1heFZpc2libGUmJmEubm90eVJlbmRlcmVyLnNob3coYS5ub3R5LnF1ZXVlLnNoaWZ0KCkpOmEubm90eVJlbmRlcmVyLnNob3coYS5ub3R5LnF1ZXVlLnNoaWZ0KCkpOmEubm90eS5vbnRhcCYmKGEubm90eVJlbmRlcmVyLnNob3coYS5ub3R5LnF1ZXVlLnNoaWZ0KCkpLGEubm90eS5vbnRhcD0hMSk6YS5ub3R5Lm9udGFwPSEwfSxhLm5vdHlSZW5kZXJlci5zaG93PWZ1bmN0aW9uKGIpe2Iub3B0aW9ucy5tb2RhbCYmKGEubm90eVJlbmRlcmVyLmNyZWF0ZU1vZGFsRm9yKGIpLGEubm90eVJlbmRlcmVyLnNldE1vZGFsQ291bnQoMSkpLGIub3B0aW9ucy5jdXN0b20/MD09Yi5vcHRpb25zLmN1c3RvbS5maW5kKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5sZW5ndGg/Yi5vcHRpb25zLmN1c3RvbS5hcHBlbmQoYShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5vYmplY3QpLmFkZENsYXNzKFwiaS1hbS1uZXdcIikpOmIub3B0aW9ucy5jdXN0b20uZmluZChiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikucmVtb3ZlQ2xhc3MoXCJpLWFtLW5ld1wiKTowPT1hKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5sZW5ndGg/YShcImJvZHlcIikuYXBwZW5kKGEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIub2JqZWN0KS5hZGRDbGFzcyhcImktYW0tbmV3XCIpKTphKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5yZW1vdmVDbGFzcyhcImktYW0tbmV3XCIpLGEubm90eVJlbmRlcmVyLnNldExheW91dENvdW50Rm9yKGIsMSksYi5zaG93KCl9LGEubm90eVJlbmRlcmVyLmNyZWF0ZU1vZGFsRm9yPWZ1bmN0aW9uKGIpe2lmKDA9PWEoXCIubm90eV9tb2RhbFwiKS5sZW5ndGgpe3ZhciBjPWEoXCI8ZGl2Lz5cIikuYWRkQ2xhc3MoXCJub3R5X21vZGFsXCIpLmFkZENsYXNzKGIub3B0aW9ucy50aGVtZSkuZGF0YShcIm5vdHlfbW9kYWxfY291bnRcIiwwKTtiLm9wdGlvbnMudGhlbWUubW9kYWwmJmIub3B0aW9ucy50aGVtZS5tb2RhbC5jc3MmJmMuY3NzKGIub3B0aW9ucy50aGVtZS5tb2RhbC5jc3MpLGMucHJlcGVuZFRvKGEoXCJib2R5XCIpKS5mYWRlSW4oYi5vcHRpb25zLmFuaW1hdGlvbi5mYWRlU3BlZWQpLGEuaW5BcnJheShcImJhY2tkcm9wXCIsYi5vcHRpb25zLmNsb3NlV2l0aCk+LTEmJmMub24oXCJjbGlja1wiLGZ1bmN0aW9uKGIpe2Eubm90eS5jbG9zZUFsbCgpfSl9fSxhLm5vdHlSZW5kZXJlci5nZXRMYXlvdXRDb3VudEZvcj1mdW5jdGlvbihiKXtyZXR1cm4gYShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikuZGF0YShcIm5vdHlfbGF5b3V0X2NvdW50XCIpfHwwfSxhLm5vdHlSZW5kZXJlci5zZXRMYXlvdXRDb3VudEZvcj1mdW5jdGlvbihiLGMpe3JldHVybiBhKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5kYXRhKFwibm90eV9sYXlvdXRfY291bnRcIixhLm5vdHlSZW5kZXJlci5nZXRMYXlvdXRDb3VudEZvcihiKStjKX0sYS5ub3R5UmVuZGVyZXIuZ2V0TW9kYWxDb3VudD1mdW5jdGlvbigpe3JldHVybiBhKFwiLm5vdHlfbW9kYWxcIikuZGF0YShcIm5vdHlfbW9kYWxfY291bnRcIil8fDB9LGEubm90eVJlbmRlcmVyLnNldE1vZGFsQ291bnQ9ZnVuY3Rpb24oYil7cmV0dXJuIGEoXCIubm90eV9tb2RhbFwiKS5kYXRhKFwibm90eV9tb2RhbF9jb3VudFwiLGEubm90eVJlbmRlcmVyLmdldE1vZGFsQ291bnQoKStiKX0sYS5mbi5ub3R5PWZ1bmN0aW9uKGIpe3JldHVybiBiLmN1c3RvbT1hKHRoaXMpLGEubm90eVJlbmRlcmVyLmluaXQoYil9LGEubm90eT17fSxhLm5vdHkucXVldWU9W10sYS5ub3R5Lm9udGFwPSEwLGEubm90eS5sYXlvdXRzPXt9LGEubm90eS50aGVtZXM9e30sYS5ub3R5LnJldHVybnM9XCJvYmplY3RcIixhLm5vdHkuc3RvcmU9e30sYS5ub3R5LmdldD1mdW5jdGlvbihiKXtyZXR1cm4gYS5ub3R5LnN0b3JlLmhhc093blByb3BlcnR5KGIpP2Eubm90eS5zdG9yZVtiXTohMX0sYS5ub3R5LmNsb3NlPWZ1bmN0aW9uKGIpe3JldHVybiBhLm5vdHkuZ2V0KGIpP2Eubm90eS5nZXQoYikuY2xvc2UoKTohMX0sYS5ub3R5LnNldFRleHQ9ZnVuY3Rpb24oYixjKXtyZXR1cm4gYS5ub3R5LmdldChiKT9hLm5vdHkuZ2V0KGIpLnNldFRleHQoYyk6ITF9LGEubm90eS5zZXRUeXBlPWZ1bmN0aW9uKGIsYyl7cmV0dXJuIGEubm90eS5nZXQoYik/YS5ub3R5LmdldChiKS5zZXRUeXBlKGMpOiExfSxhLm5vdHkuY2xlYXJRdWV1ZT1mdW5jdGlvbigpe2Eubm90eS5xdWV1ZT1bXX0sYS5ub3R5LmNsb3NlQWxsPWZ1bmN0aW9uKCl7YS5ub3R5LmNsZWFyUXVldWUoKSxhLmVhY2goYS5ub3R5LnN0b3JlLGZ1bmN0aW9uKGEsYil7Yi5jbG9zZSgpfSl9O3ZhciBjPXdpbmRvdy5hbGVydDtyZXR1cm4gYS5ub3R5LmNvbnN1bWVBbGVydD1mdW5jdGlvbihiKXt3aW5kb3cuYWxlcnQ9ZnVuY3Rpb24oYyl7Yj9iLnRleHQ9YzpiPXt0ZXh0OmN9LGEubm90eVJlbmRlcmVyLmluaXQoYil9fSxhLm5vdHkuc3RvcENvbnN1bWVBbGVydD1mdW5jdGlvbigpe3dpbmRvdy5hbGVydD1jfSxhLm5vdHkuZGVmYXVsdHM9e2xheW91dDpcInRvcFwiLHRoZW1lOlwiZGVmYXVsdFRoZW1lXCIsdHlwZTpcImFsZXJ0XCIsdGV4dDpcIlwiLGRpc21pc3NRdWV1ZTohMCx0ZW1wbGF0ZTonPGRpdiBjbGFzcz1cIm5vdHlfbWVzc2FnZVwiPjxzcGFuIGNsYXNzPVwibm90eV90ZXh0XCI+PC9zcGFuPjxkaXYgY2xhc3M9XCJub3R5X2Nsb3NlXCI+PC9kaXY+PC9kaXY+JyxhbmltYXRpb246e29wZW46e2hlaWdodDpcInRvZ2dsZVwifSxjbG9zZTp7aGVpZ2h0OlwidG9nZ2xlXCJ9LGVhc2luZzpcInN3aW5nXCIsc3BlZWQ6NTAwLGZhZGVTcGVlZDpcImZhc3RcIn0sdGltZW91dDohMSxmb3JjZTohMSxtb2RhbDohMSxtYXhWaXNpYmxlOjUsa2lsbGVyOiExLGNsb3NlV2l0aDpbXCJjbGlja1wiXSxjYWxsYmFjazp7b25TaG93OmZ1bmN0aW9uKCl7fSxhZnRlclNob3c6ZnVuY3Rpb24oKXt9LG9uQ2xvc2U6ZnVuY3Rpb24oKXt9LGFmdGVyQ2xvc2U6ZnVuY3Rpb24oKXt9LG9uQ2xvc2VDbGljazpmdW5jdGlvbigpe319LGJ1dHRvbnM6ITF9LGEod2luZG93KS5vbihcInJlc2l6ZVwiLGZ1bmN0aW9uKCl7YS5lYWNoKGEubm90eS5sYXlvdXRzLGZ1bmN0aW9uKGIsYyl7Yy5jb250YWluZXIuc3R5bGUuYXBwbHkoYShjLmNvbnRhaW5lci5zZWxlY3RvcikpfSl9KSx3aW5kb3cubm90eT1mdW5jdGlvbihiKXtyZXR1cm4gYS5ub3R5UmVuZGVyZXIuaW5pdChiKX0sYS5ub3R5LmxheW91dHMuYm90dG9tPXtuYW1lOlwiYm90dG9tXCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9ib3R0b21fbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfYm90dG9tX2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtib3R0b206MCxsZWZ0OlwiNSVcIixwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCI5MCVcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4Ojk5OTk5OTl9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5ib3R0b21DZW50ZXI9e25hbWU6XCJib3R0b21DZW50ZXJcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2JvdHRvbUNlbnRlcl9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9ib3R0b21DZW50ZXJfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe2JvdHRvbToyMCxsZWZ0OjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLGEodGhpcykuY3NzKHtsZWZ0OihhKHdpbmRvdykud2lkdGgoKS1hKHRoaXMpLm91dGVyV2lkdGgoITEpKS8yK1wicHhcIn0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5ib3R0b21MZWZ0PXtuYW1lOlwiYm90dG9tTGVmdFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfYm90dG9tTGVmdF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9ib3R0b21MZWZ0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtib3R0b206MjAsbGVmdDoyMCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSksd2luZG93LmlubmVyV2lkdGg8NjAwJiZhKHRoaXMpLmNzcyh7bGVmdDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmJvdHRvbVJpZ2h0PXtuYW1lOlwiYm90dG9tUmlnaHRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2JvdHRvbVJpZ2h0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2JvdHRvbVJpZ2h0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtib3R0b206MjAscmlnaHQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLHdpbmRvdy5pbm5lcldpZHRoPDYwMCYmYSh0aGlzKS5jc3Moe3JpZ2h0OjV9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuY2VudGVyPXtuYW1lOlwiY2VudGVyXCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9jZW50ZXJfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfY2VudGVyX2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSk7dmFyIGI9YSh0aGlzKS5jbG9uZSgpLmNzcyh7dmlzaWJpbGl0eTpcImhpZGRlblwiLGRpc3BsYXk6XCJibG9ja1wiLHBvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6MCxsZWZ0OjB9KS5hdHRyKFwiaWRcIixcImR1cGVcIik7YShcImJvZHlcIikuYXBwZW5kKGIpLGIuZmluZChcIi5pLWFtLWNsb3Npbmctbm93XCIpLnJlbW92ZSgpLGIuZmluZChcImxpXCIpLmNzcyhcImRpc3BsYXlcIixcImJsb2NrXCIpO3ZhciBjPWIuaGVpZ2h0KCk7Yi5yZW1vdmUoKSxhKHRoaXMpLmhhc0NsYXNzKFwiaS1hbS1uZXdcIik/YSh0aGlzKS5jc3Moe2xlZnQ6KGEod2luZG93KS53aWR0aCgpLWEodGhpcykub3V0ZXJXaWR0aCghMSkpLzIrXCJweFwiLHRvcDooYSh3aW5kb3cpLmhlaWdodCgpLWMpLzIrXCJweFwifSk6YSh0aGlzKS5hbmltYXRlKHtsZWZ0OihhKHdpbmRvdykud2lkdGgoKS1hKHRoaXMpLm91dGVyV2lkdGgoITEpKS8yK1wicHhcIix0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0sNTAwKX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuY2VudGVyTGVmdD17bmFtZTpcImNlbnRlckxlZnRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2NlbnRlckxlZnRfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfY2VudGVyTGVmdF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7bGVmdDoyMCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSk7dmFyIGI9YSh0aGlzKS5jbG9uZSgpLmNzcyh7dmlzaWJpbGl0eTpcImhpZGRlblwiLGRpc3BsYXk6XCJibG9ja1wiLHBvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6MCxsZWZ0OjB9KS5hdHRyKFwiaWRcIixcImR1cGVcIik7YShcImJvZHlcIikuYXBwZW5kKGIpLGIuZmluZChcIi5pLWFtLWNsb3Npbmctbm93XCIpLnJlbW92ZSgpLGIuZmluZChcImxpXCIpLmNzcyhcImRpc3BsYXlcIixcImJsb2NrXCIpO3ZhciBjPWIuaGVpZ2h0KCk7Yi5yZW1vdmUoKSxhKHRoaXMpLmhhc0NsYXNzKFwiaS1hbS1uZXdcIik/YSh0aGlzKS5jc3Moe3RvcDooYSh3aW5kb3cpLmhlaWdodCgpLWMpLzIrXCJweFwifSk6YSh0aGlzKS5hbmltYXRlKHt0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0sNTAwKSx3aW5kb3cuaW5uZXJXaWR0aDw2MDAmJmEodGhpcykuY3NzKHtsZWZ0OjV9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuY2VudGVyUmlnaHQ9e25hbWU6XCJjZW50ZXJSaWdodFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfY2VudGVyUmlnaHRfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfY2VudGVyUmlnaHRfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3JpZ2h0OjIwLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KTt2YXIgYj1hKHRoaXMpLmNsb25lKCkuY3NzKHt2aXNpYmlsaXR5OlwiaGlkZGVuXCIsZGlzcGxheTpcImJsb2NrXCIscG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDowLGxlZnQ6MH0pLmF0dHIoXCJpZFwiLFwiZHVwZVwiKTthKFwiYm9keVwiKS5hcHBlbmQoYiksYi5maW5kKFwiLmktYW0tY2xvc2luZy1ub3dcIikucmVtb3ZlKCksYi5maW5kKFwibGlcIikuY3NzKFwiZGlzcGxheVwiLFwiYmxvY2tcIik7dmFyIGM9Yi5oZWlnaHQoKTtiLnJlbW92ZSgpLGEodGhpcykuaGFzQ2xhc3MoXCJpLWFtLW5ld1wiKT9hKHRoaXMpLmNzcyh7dG9wOihhKHdpbmRvdykuaGVpZ2h0KCktYykvMitcInB4XCJ9KTphKHRoaXMpLmFuaW1hdGUoe3RvcDooYSh3aW5kb3cpLmhlaWdodCgpLWMpLzIrXCJweFwifSw1MDApLHdpbmRvdy5pbm5lcldpZHRoPDYwMCYmYSh0aGlzKS5jc3Moe3JpZ2h0OjV9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuaW5saW5lPXtuYW1lOlwiaW5saW5lXCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGNsYXNzPVwibm90eV9pbmxpbmVfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsLm5vdHlfaW5saW5lX2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHt3aWR0aDpcIjEwMCVcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4Ojk5OTk5OTl9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy50b3A9e25hbWU6XCJ0b3BcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X3RvcF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV90b3BfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3RvcDowLGxlZnQ6XCI1JVwiLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjkwJVwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6OTk5OTk5OX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLnRvcENlbnRlcj17bmFtZTpcInRvcENlbnRlclwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfdG9wQ2VudGVyX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X3RvcENlbnRlcl9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7dG9wOjIwLGxlZnQ6MCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSksYSh0aGlzKS5jc3Moe2xlZnQ6KGEod2luZG93KS53aWR0aCgpLWEodGhpcykub3V0ZXJXaWR0aCghMSkpLzIrXCJweFwifSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLnRvcExlZnQ9e25hbWU6XCJ0b3BMZWZ0XCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV90b3BMZWZ0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X3RvcExlZnRfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3RvcDoyMCxsZWZ0OjIwLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KSx3aW5kb3cuaW5uZXJXaWR0aDw2MDAmJmEodGhpcykuY3NzKHtsZWZ0OjV9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMudG9wUmlnaHQ9e25hbWU6XCJ0b3BSaWdodFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfdG9wUmlnaHRfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfdG9wUmlnaHRfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3RvcDoyMCxyaWdodDoyMCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSksd2luZG93LmlubmVyV2lkdGg8NjAwJiZhKHRoaXMpLmNzcyh7cmlnaHQ6NX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkudGhlbWVzLmJvb3RzdHJhcFRoZW1lPXtuYW1lOlwiYm9vdHN0cmFwVGhlbWVcIixtb2RhbDp7Y3NzOntwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIxMDAlXCIsaGVpZ2h0OlwiMTAwJVwiLGJhY2tncm91bmRDb2xvcjpcIiMwMDBcIix6SW5kZXg6MWU0LG9wYWNpdHk6LjYsZGlzcGxheTpcIm5vbmVcIixsZWZ0OjAsdG9wOjB9fSxzdHlsZTpmdW5jdGlvbigpe3ZhciBiPXRoaXMub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yO3N3aXRjaChhKGIpLmFkZENsYXNzKFwibGlzdC1ncm91cFwiKSx0aGlzLiRjbG9zZUJ1dHRvbi5hcHBlbmQoJzxzcGFuIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPiZ0aW1lczs8L3NwYW4+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+Q2xvc2U8L3NwYW4+JyksdGhpcy4kY2xvc2VCdXR0b24uYWRkQ2xhc3MoXCJjbG9zZVwiKSx0aGlzLiRiYXIuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwLWl0ZW1cIikuY3NzKFwicGFkZGluZ1wiLFwiMHB4XCIpLHRoaXMub3B0aW9ucy50eXBlKXtjYXNlXCJhbGVydFwiOmNhc2VcIm5vdGlmaWNhdGlvblwiOnRoaXMuJGJhci5hZGRDbGFzcyhcImxpc3QtZ3JvdXAtaXRlbS1pbmZvXCIpO2JyZWFrO2Nhc2VcIndhcm5pbmdcIjp0aGlzLiRiYXIuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwLWl0ZW0td2FybmluZ1wiKTticmVhaztjYXNlXCJlcnJvclwiOnRoaXMuJGJhci5hZGRDbGFzcyhcImxpc3QtZ3JvdXAtaXRlbS1kYW5nZXJcIik7YnJlYWs7Y2FzZVwiaW5mb3JtYXRpb25cIjp0aGlzLiRiYXIuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwLWl0ZW0taW5mb1wiKTticmVhaztjYXNlXCJzdWNjZXNzXCI6dGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtLXN1Y2Nlc3NcIil9dGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTNweFwiLGxpbmVIZWlnaHQ6XCIxNnB4XCIsdGV4dEFsaWduOlwiY2VudGVyXCIscGFkZGluZzpcIjhweCAxMHB4IDlweFwiLHdpZHRoOlwiYXV0b1wiLHBvc2l0aW9uOlwicmVsYXRpdmVcIn0pfSxjYWxsYmFjazp7b25TaG93OmZ1bmN0aW9uKCl7fSxvbkNsb3NlOmZ1bmN0aW9uKCl7fX19LGEubm90eS50aGVtZXMuZGVmYXVsdFRoZW1lPXtuYW1lOlwiZGVmYXVsdFRoZW1lXCIsaGVscGVyczp7Ym9yZGVyRml4OmZ1bmN0aW9uKCl7aWYodGhpcy5vcHRpb25zLmRpc21pc3NRdWV1ZSl7dmFyIGI9dGhpcy5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IrXCIgXCIrdGhpcy5vcHRpb25zLmxheW91dC5wYXJlbnQuc2VsZWN0b3I7c3dpdGNoKHRoaXMub3B0aW9ucy5sYXlvdXQubmFtZSl7Y2FzZVwidG9wXCI6YShiKS5jc3Moe2JvcmRlclJhZGl1czpcIjBweCAwcHggMHB4IDBweFwifSksYShiKS5sYXN0KCkuY3NzKHtib3JkZXJSYWRpdXM6XCIwcHggMHB4IDVweCA1cHhcIn0pO2JyZWFrO2Nhc2VcInRvcENlbnRlclwiOmNhc2VcInRvcExlZnRcIjpjYXNlXCJ0b3BSaWdodFwiOmNhc2VcImJvdHRvbUNlbnRlclwiOmNhc2VcImJvdHRvbUxlZnRcIjpjYXNlXCJib3R0b21SaWdodFwiOmNhc2VcImNlbnRlclwiOmNhc2VcImNlbnRlckxlZnRcIjpjYXNlXCJjZW50ZXJSaWdodFwiOmNhc2VcImlubGluZVwiOmEoYikuY3NzKHtib3JkZXJSYWRpdXM6XCIwcHggMHB4IDBweCAwcHhcIn0pLGEoYikuZmlyc3QoKS5jc3Moe1wiYm9yZGVyLXRvcC1sZWZ0LXJhZGl1c1wiOlwiNXB4XCIsXCJib3JkZXItdG9wLXJpZ2h0LXJhZGl1c1wiOlwiNXB4XCJ9KSxhKGIpLmxhc3QoKS5jc3Moe1wiYm9yZGVyLWJvdHRvbS1sZWZ0LXJhZGl1c1wiOlwiNXB4XCIsXCJib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1c1wiOlwiNXB4XCJ9KTticmVhaztjYXNlXCJib3R0b21cIjphKGIpLmNzcyh7Ym9yZGVyUmFkaXVzOlwiMHB4IDBweCAwcHggMHB4XCJ9KSxhKGIpLmZpcnN0KCkuY3NzKHtib3JkZXJSYWRpdXM6XCI1cHggNXB4IDBweCAwcHhcIn0pfX19fSxtb2RhbDp7Y3NzOntwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIxMDAlXCIsaGVpZ2h0OlwiMTAwJVwiLGJhY2tncm91bmRDb2xvcjpcIiMwMDBcIix6SW5kZXg6MWU0LG9wYWNpdHk6LjYsZGlzcGxheTpcIm5vbmVcIixsZWZ0OjAsdG9wOjB9fSxzdHlsZTpmdW5jdGlvbigpe3N3aXRjaCh0aGlzLiRiYXIuY3NzKHtvdmVyZmxvdzpcImhpZGRlblwiLGJhY2tncm91bmQ6XCJ1cmwoJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQnNBQUFBb0NBUUFBQUNsTTBuZEFBQUFoa2xFUVZSNEFkWE8wUXJDTUJCRTBidHRrazM4L3c4V1JFUnBkeWp6Vk9jK0h4aElIcUpHTVFjRkZrcFlSUW90TExTdzBJSjVhQmRvdnJ1TVlEQS9rVDhwbEY5WktMRlFjZ0YxOGhEajFTYlFPTWxDQTRrYW8waWlYbWFoN3FCV1BkeHBvaHNnVlp5ajdlNUk5S2NJRCtFaGlESTVneEJZS0xCUVlLSEFRb0dGQW9Fa3MvWUVHSFlLQjdoRnhmMEFBQUFBU1VWT1JLNUNZSUk9JykgcmVwZWF0LXggc2Nyb2xsIGxlZnQgdG9wICNmZmZcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjEzcHhcIixsaW5lSGVpZ2h0OlwiMTZweFwiLHRleHRBbGlnbjpcImNlbnRlclwiLHBhZGRpbmc6XCI4cHggMTBweCA5cHhcIix3aWR0aDpcImF1dG9cIixwb3NpdGlvbjpcInJlbGF0aXZlXCJ9KSx0aGlzLiRjbG9zZUJ1dHRvbi5jc3Moe3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6NCxyaWdodDo0LHdpZHRoOjEwLGhlaWdodDoxMCxiYWNrZ3JvdW5kOlwidXJsKGRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQW9BQUFBS0NBUUFBQUFuT3djMkFBQUF4VWxFUVZSNEFSM01QVW9EVVJTQTBlKyt1U2trT3hDM0lBT1dOdGFDSURhQ2hmZ1hCTUVaYlFSQnl4Q3drK0Jhc2dRUlpMU1lvTGdEUWJBUnhyeThueXVtUGNWUktEZmQwQWE4QXNnRHYxenA2cFlkNWpXT3dodmViUlRiek5ORXc1QlNzSXBzai9rdXJRQm5tazdzSUZjQ0Y1eXlaUERSRzZ0clFodWpYWW9zYUZvYysyZjFNSjg5dWM3NklORDZGOUJ2bFhVZHBiNnh3RDIrNHEzbWUzYnlzaUh2dExZclVKdG83UEQvdmU3TE5IeFNnL3dvTjJrU3o0dHhhc0JkaHlpejN1Z1BHZXRUam0zWFJva0FBQUFBU1VWT1JLNUNZSUk9KVwiLGRpc3BsYXk6XCJub25lXCIsY3Vyc29yOlwicG9pbnRlclwifSksdGhpcy4kYnV0dG9ucy5jc3Moe3BhZGRpbmc6NSx0ZXh0QWxpZ246XCJyaWdodFwiLGJvcmRlclRvcDpcIjFweCBzb2xpZCAjY2NjXCIsYmFja2dyb3VuZENvbG9yOlwiI2ZmZlwifSksdGhpcy4kYnV0dG9ucy5maW5kKFwiYnV0dG9uXCIpLmNzcyh7bWFyZ2luTGVmdDo1fSksdGhpcy4kYnV0dG9ucy5maW5kKFwiYnV0dG9uOmZpcnN0XCIpLmNzcyh7bWFyZ2luTGVmdDowfSksdGhpcy4kYmFyLm9uKHttb3VzZWVudGVyOmZ1bmN0aW9uKCl7YSh0aGlzKS5maW5kKFwiLm5vdHlfY2xvc2VcIikuc3RvcCgpLmZhZGVUbyhcIm5vcm1hbFwiLDEpfSxtb3VzZWxlYXZlOmZ1bmN0aW9uKCl7YSh0aGlzKS5maW5kKFwiLm5vdHlfY2xvc2VcIikuc3RvcCgpLmZhZGVUbyhcIm5vcm1hbFwiLDApfX0pLHRoaXMub3B0aW9ucy5sYXlvdXQubmFtZSl7Y2FzZVwidG9wXCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyUmFkaXVzOlwiMHB4IDBweCA1cHggNXB4XCIsYm9yZGVyQm90dG9tOlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJMZWZ0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJSaWdodDpcIjJweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSk7YnJlYWs7Y2FzZVwidG9wQ2VudGVyXCI6Y2FzZVwiY2VudGVyXCI6Y2FzZVwiYm90dG9tQ2VudGVyXCI6Y2FzZVwiaW5saW5lXCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyUmFkaXVzOlwiNXB4XCIsYm9yZGVyOlwiMXB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsdGV4dEFsaWduOlwiY2VudGVyXCJ9KTticmVhaztjYXNlXCJ0b3BMZWZ0XCI6Y2FzZVwidG9wUmlnaHRcIjpjYXNlXCJib3R0b21MZWZ0XCI6Y2FzZVwiYm90dG9tUmlnaHRcIjpjYXNlXCJjZW50ZXJMZWZ0XCI6Y2FzZVwiY2VudGVyUmlnaHRcIjp0aGlzLiRiYXIuY3NzKHtib3JkZXJSYWRpdXM6XCI1cHhcIixib3JkZXI6XCIxcHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjEzcHhcIix0ZXh0QWxpZ246XCJsZWZ0XCJ9KTticmVhaztjYXNlXCJib3R0b21cIjp0aGlzLiRiYXIuY3NzKHtib3JkZXJSYWRpdXM6XCI1cHggNXB4IDBweCAwcHhcIixib3JkZXJUb3A6XCIycHggc29saWQgI2VlZVwiLGJvcmRlckxlZnQ6XCIycHggc29saWQgI2VlZVwiLGJvcmRlclJpZ2h0OlwiMnB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIC0ycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSk7YnJlYWs7ZGVmYXVsdDp0aGlzLiRiYXIuY3NzKHtib3JkZXI6XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pfXN3aXRjaCh0aGlzLm9wdGlvbnMudHlwZSl7Y2FzZVwiYWxlcnRcIjpjYXNlXCJub3RpZmljYXRpb25cIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkZGXCIsYm9yZGVyQ29sb3I6XCIjQ0NDXCIsY29sb3I6XCIjNDQ0XCJ9KTticmVhaztjYXNlXCJ3YXJuaW5nXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGRUFBOFwiLGJvcmRlckNvbG9yOlwiI0ZGQzIzN1wiLGNvbG9yOlwiIzgyNjIwMFwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjRkZDMjM3XCJ9KTticmVhaztjYXNlXCJlcnJvclwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcInJlZFwiLGJvcmRlckNvbG9yOlwiZGFya3JlZFwiLGNvbG9yOlwiI0ZGRlwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRXZWlnaHQ6XCJib2xkXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkIGRhcmtyZWRcIn0pO2JyZWFrO2Nhc2VcImluZm9ybWF0aW9uXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiIzU3QjdFMlwiLGJvcmRlckNvbG9yOlwiIzBCOTBDNFwiLGNvbG9yOlwiI0ZGRlwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjMEI5MEM0XCJ9KTticmVhaztjYXNlXCJzdWNjZXNzXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwibGlnaHRncmVlblwiLGJvcmRlckNvbG9yOlwiIzUwQzI0RVwiLGNvbG9yOlwiZGFya2dyZWVuXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkICM1MEMyNEVcIn0pO2JyZWFrO2RlZmF1bHQ6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGRlwiLGJvcmRlckNvbG9yOlwiI0NDQ1wiLGNvbG9yOlwiIzQ0NFwifSl9fSxjYWxsYmFjazp7b25TaG93OmZ1bmN0aW9uKCl7YS5ub3R5LnRoZW1lcy5kZWZhdWx0VGhlbWUuaGVscGVycy5ib3JkZXJGaXguYXBwbHkodGhpcyl9LG9uQ2xvc2U6ZnVuY3Rpb24oKXthLm5vdHkudGhlbWVzLmRlZmF1bHRUaGVtZS5oZWxwZXJzLmJvcmRlckZpeC5hcHBseSh0aGlzKX19fSxhLm5vdHkudGhlbWVzLnJlbGF4PXtuYW1lOlwicmVsYXhcIixoZWxwZXJzOnt9LG1vZGFsOntjc3M6e3Bvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjEwMCVcIixoZWlnaHQ6XCIxMDAlXCIsYmFja2dyb3VuZENvbG9yOlwiIzAwMFwiLHpJbmRleDoxZTQsb3BhY2l0eTouNixkaXNwbGF5Olwibm9uZVwiLGxlZnQ6MCx0b3A6MH19LHN0eWxlOmZ1bmN0aW9uKCl7c3dpdGNoKHRoaXMuJGJhci5jc3Moe292ZXJmbG93OlwiaGlkZGVuXCIsbWFyZ2luOlwiNHB4IDBcIixib3JkZXJSYWRpdXM6XCIycHhcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjE0cHhcIixsaW5lSGVpZ2h0OlwiMTZweFwiLHRleHRBbGlnbjpcImNlbnRlclwiLHBhZGRpbmc6XCIxMHB4XCIsd2lkdGg6XCJhdXRvXCIscG9zaXRpb246XCJyZWxhdGl2ZVwifSksdGhpcy4kY2xvc2VCdXR0b24uY3NzKHtwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOjQscmlnaHQ6NCx3aWR0aDoxMCxoZWlnaHQ6MTAsYmFja2dyb3VuZDpcInVybChkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFvQUFBQUtDQVFBQUFBbk93YzJBQUFBeFVsRVFWUjRBUjNNUFVvRFVSU0EwZSsrdVNra094QzNJQU9XTnRhQ0lEYUNoZmdYQk1FWmJRUkJ5eEN3aytCYXNnUVJaTFNZb0xnRFFiQVJ4cnk4bnl1bVBjVlJLRGZkMEFhOEFzZ0R2MXpwNnBZZDVqV093aHZlYlJUYnpOTkV3NUJTc0lwc2ova3VyUUJubWs3c0lGY0NGNXl5WlBEUkc2dHJRaHVqWFlvc2FGb2MrMmYxTUo4OXVjNzZJTkQ2RjlCdmxYVWRwYjZ4d0QyKzRxM21lM2J5c2lIdnRMWXJVSnRvN1BEL3ZlN0xOSHhTZy93b04ya1N6NHR4YXNCZGh5aXozdWdQR2V0VGptM1hSb2tBQUFBQVNVVk9SSzVDWUlJPSlcIixkaXNwbGF5Olwibm9uZVwiLGN1cnNvcjpcInBvaW50ZXJcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtwYWRkaW5nOjUsdGV4dEFsaWduOlwicmlnaHRcIixib3JkZXJUb3A6XCIxcHggc29saWQgI2NjY1wiLGJhY2tncm91bmRDb2xvcjpcIiNmZmZcIn0pLHRoaXMuJGJ1dHRvbnMuZmluZChcImJ1dHRvblwiKS5jc3Moe21hcmdpbkxlZnQ6NX0pLHRoaXMuJGJ1dHRvbnMuZmluZChcImJ1dHRvbjpmaXJzdFwiKS5jc3Moe21hcmdpbkxlZnQ6MH0pLHRoaXMuJGJhci5vbih7bW91c2VlbnRlcjpmdW5jdGlvbigpe2EodGhpcykuZmluZChcIi5ub3R5X2Nsb3NlXCIpLnN0b3AoKS5mYWRlVG8oXCJub3JtYWxcIiwxKX0sbW91c2VsZWF2ZTpmdW5jdGlvbigpe2EodGhpcykuZmluZChcIi5ub3R5X2Nsb3NlXCIpLnN0b3AoKS5mYWRlVG8oXCJub3JtYWxcIiwwKX19KSx0aGlzLm9wdGlvbnMubGF5b3V0Lm5hbWUpe2Nhc2VcInRvcFwiOnRoaXMuJGJhci5jc3Moe2JvcmRlckJvdHRvbTpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyTGVmdDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyUmlnaHQ6XCIycHggc29saWQgI2VlZVwiLGJvcmRlclRvcDpcIjJweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSk7YnJlYWs7Y2FzZVwidG9wQ2VudGVyXCI6Y2FzZVwiY2VudGVyXCI6Y2FzZVwiYm90dG9tQ2VudGVyXCI6Y2FzZVwiaW5saW5lXCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyOlwiMXB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsdGV4dEFsaWduOlwiY2VudGVyXCJ9KTticmVhaztjYXNlXCJ0b3BMZWZ0XCI6Y2FzZVwidG9wUmlnaHRcIjpjYXNlXCJib3R0b21MZWZ0XCI6Y2FzZVwiYm90dG9tUmlnaHRcIjpjYXNlXCJjZW50ZXJMZWZ0XCI6Y2FzZVwiY2VudGVyUmlnaHRcIjp0aGlzLiRiYXIuY3NzKHtib3JkZXI6XCIxcHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjEzcHhcIix0ZXh0QWxpZ246XCJsZWZ0XCJ9KTticmVhaztjYXNlXCJib3R0b21cIjp0aGlzLiRiYXIuY3NzKHtib3JkZXJUb3A6XCIycHggc29saWQgI2VlZVwiLGJvcmRlckxlZnQ6XCIycHggc29saWQgI2VlZVwiLGJvcmRlclJpZ2h0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJCb3R0b206XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgLTJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KTticmVhaztkZWZhdWx0OnRoaXMuJGJhci5jc3Moe2JvcmRlcjpcIjJweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSl9c3dpdGNoKHRoaXMub3B0aW9ucy50eXBlKXtjYXNlXCJhbGVydFwiOmNhc2VcIm5vdGlmaWNhdGlvblwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkZcIixib3JkZXJDb2xvcjpcIiNkZWRlZGVcIixjb2xvcjpcIiM0NDRcIn0pO2JyZWFrO2Nhc2VcIndhcm5pbmdcIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkZFQUE4XCIsYm9yZGVyQ29sb3I6XCIjRkZDMjM3XCIsY29sb3I6XCIjODI2MjAwXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkICNGRkMyMzdcIn0pO2JyZWFrO2Nhc2VcImVycm9yXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGODE4MVwiLGJvcmRlckNvbG9yOlwiI2UyNTM1M1wiLGNvbG9yOlwiI0ZGRlwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRXZWlnaHQ6XCJib2xkXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkIGRhcmtyZWRcIn0pO2JyZWFrO2Nhc2VcImluZm9ybWF0aW9uXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiIzc4QzVFN1wiLGJvcmRlckNvbG9yOlwiIzNiYWRkNlwiLGNvbG9yOlwiI0ZGRlwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjMEI5MEM0XCJ9KTticmVhaztjYXNlXCJzdWNjZXNzXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0JDRjVCQ1wiLGJvcmRlckNvbG9yOlwiIzdjZGQ3N1wiLGNvbG9yOlwiZGFya2dyZWVuXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkICM1MEMyNEVcIn0pO2JyZWFrO2RlZmF1bHQ6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGRlwiLGJvcmRlckNvbG9yOlwiI0NDQ1wiLGNvbG9yOlwiIzQ0NFwifSl9fSxjYWxsYmFjazp7b25TaG93OmZ1bmN0aW9uKCl7fSxvbkNsb3NlOmZ1bmN0aW9uKCl7fX19LHdpbmRvdy5ub3R5fSk7IiwiLyohXG4gKiBNb2NrSmF4IC0galF1ZXJ5IFBsdWdpbiB0byBNb2NrIEFqYXggcmVxdWVzdHNcbiAqXG4gKiBWZXJzaW9uOiAgMS41LjNcbiAqIFJlbGVhc2VkOlxuICogSG9tZTogICBodHRwOi8vZ2l0aHViLmNvbS9hcHBlbmR0by9qcXVlcnktbW9ja2pheFxuICogQXV0aG9yOiAgIEpvbmF0aGFuIFNoYXJwIChodHRwOi8vamRzaGFycC5jb20pXG4gKiBMaWNlbnNlOiAgTUlULEdQTFxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMSBhcHBlbmRUbyBMTEMuXG4gKiBEdWFsIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgb3IgR1BMIGxpY2Vuc2VzLlxuICogaHR0cDovL2FwcGVuZHRvLmNvbS9vcGVuLXNvdXJjZS1saWNlbnNlc1xuICovXG4oZnVuY3Rpb24oJCkge1xuXHR2YXIgX2FqYXggPSAkLmFqYXgsXG5cdFx0bW9ja0hhbmRsZXJzID0gW10sXG5cdFx0bW9ja2VkQWpheENhbGxzID0gW10sXG5cdFx0Q0FMTEJBQ0tfUkVHRVggPSAvPVxcPygmfCQpLyxcblx0XHRqc2MgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpO1xuXG5cblx0Ly8gUGFyc2UgdGhlIGdpdmVuIFhNTCBzdHJpbmcuXG5cdGZ1bmN0aW9uIHBhcnNlWE1MKHhtbCkge1xuXHRcdGlmICggd2luZG93LkRPTVBhcnNlciA9PSB1bmRlZmluZWQgJiYgd2luZG93LkFjdGl2ZVhPYmplY3QgKSB7XG5cdFx0XHRET01QYXJzZXIgPSBmdW5jdGlvbigpIHsgfTtcblx0XHRcdERPTVBhcnNlci5wcm90b3R5cGUucGFyc2VGcm9tU3RyaW5nID0gZnVuY3Rpb24oIHhtbFN0cmluZyApIHtcblx0XHRcdFx0dmFyIGRvYyA9IG5ldyBBY3RpdmVYT2JqZWN0KCdNaWNyb3NvZnQuWE1MRE9NJyk7XG5cdFx0XHRcdGRvYy5hc3luYyA9ICdmYWxzZSc7XG5cdFx0XHRcdGRvYy5sb2FkWE1MKCB4bWxTdHJpbmcgKTtcblx0XHRcdFx0cmV0dXJuIGRvYztcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0dHJ5IHtcblx0XHRcdHZhciB4bWxEb2MgPSAoIG5ldyBET01QYXJzZXIoKSApLnBhcnNlRnJvbVN0cmluZyggeG1sLCAndGV4dC94bWwnICk7XG5cdFx0XHRpZiAoICQuaXNYTUxEb2MoIHhtbERvYyApICkge1xuXHRcdFx0XHR2YXIgZXJyID0gJCgncGFyc2VyZXJyb3InLCB4bWxEb2MpO1xuXHRcdFx0XHRpZiAoIGVyci5sZW5ndGggPT0gMSApIHtcblx0XHRcdFx0XHR0aHJvdygnRXJyb3I6ICcgKyAkKHhtbERvYykudGV4dCgpICk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93KCdVbmFibGUgdG8gcGFyc2UgWE1MJyk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4geG1sRG9jO1xuXHRcdH0gY2F0Y2goIGUgKSB7XG5cdFx0XHR2YXIgbXNnID0gKCBlLm5hbWUgPT0gdW5kZWZpbmVkID8gZSA6IGUubmFtZSArICc6ICcgKyBlLm1lc3NhZ2UgKTtcblx0XHRcdCQoZG9jdW1lbnQpLnRyaWdnZXIoJ3htbFBhcnNlRXJyb3InLCBbIG1zZyBdKTtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG5cblx0Ly8gVHJpZ2dlciBhIGpRdWVyeSBldmVudFxuXHRmdW5jdGlvbiB0cmlnZ2VyKHMsIHR5cGUsIGFyZ3MpIHtcblx0XHQocy5jb250ZXh0ID8gJChzLmNvbnRleHQpIDogJC5ldmVudCkudHJpZ2dlcih0eXBlLCBhcmdzKTtcblx0fVxuXG5cdC8vIENoZWNrIGlmIHRoZSBkYXRhIGZpZWxkIG9uIHRoZSBtb2NrIGhhbmRsZXIgYW5kIHRoZSByZXF1ZXN0IG1hdGNoLiBUaGlzXG5cdC8vIGNhbiBiZSB1c2VkIHRvIHJlc3RyaWN0IGEgbW9jayBoYW5kbGVyIHRvIGJlaW5nIHVzZWQgb25seSB3aGVuIGEgY2VydGFpblxuXHQvLyBzZXQgb2YgZGF0YSBpcyBwYXNzZWQgdG8gaXQuXG5cdGZ1bmN0aW9uIGlzTW9ja0RhdGFFcXVhbCggbW9jaywgbGl2ZSApIHtcblx0XHR2YXIgaWRlbnRpY2FsID0gdHJ1ZTtcblx0XHQvLyBUZXN0IGZvciBzaXR1YXRpb25zIHdoZXJlIHRoZSBkYXRhIGlzIGEgcXVlcnlzdHJpbmcgKG5vdCBhbiBvYmplY3QpXG5cdFx0aWYgKHR5cGVvZiBsaXZlID09PSAnc3RyaW5nJykge1xuXHRcdFx0Ly8gUXVlcnlzdHJpbmcgbWF5IGJlIGEgcmVnZXhcblx0XHRcdHJldHVybiAkLmlzRnVuY3Rpb24oIG1vY2sudGVzdCApID8gbW9jay50ZXN0KGxpdmUpIDogbW9jayA9PSBsaXZlO1xuXHRcdH1cblx0XHQkLmVhY2gobW9jaywgZnVuY3Rpb24oaykge1xuXHRcdFx0aWYgKCBsaXZlW2tdID09PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdGlkZW50aWNhbCA9IGZhbHNlO1xuXHRcdFx0XHRyZXR1cm4gaWRlbnRpY2FsO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aWYgKCB0eXBlb2YgbGl2ZVtrXSA9PT0gJ29iamVjdCcgJiYgbGl2ZVtrXSAhPT0gbnVsbCApIHtcblx0XHRcdFx0XHRpZiAoIGlkZW50aWNhbCAmJiAkLmlzQXJyYXkoIGxpdmVba10gKSApIHtcblx0XHRcdFx0XHRcdGlkZW50aWNhbCA9ICQuaXNBcnJheSggbW9ja1trXSApICYmIGxpdmVba10ubGVuZ3RoID09PSBtb2NrW2tdLmxlbmd0aDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWRlbnRpY2FsID0gaWRlbnRpY2FsICYmIGlzTW9ja0RhdGFFcXVhbChtb2NrW2tdLCBsaXZlW2tdKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRpZiAoIG1vY2tba10gJiYgJC5pc0Z1bmN0aW9uKCBtb2NrW2tdLnRlc3QgKSApIHtcblx0XHRcdFx0XHRcdGlkZW50aWNhbCA9IGlkZW50aWNhbCAmJiBtb2NrW2tdLnRlc3QobGl2ZVtrXSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGlkZW50aWNhbCA9IGlkZW50aWNhbCAmJiAoIG1vY2tba10gPT0gbGl2ZVtrXSApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIGlkZW50aWNhbDtcblx0fVxuXG4gICAgLy8gU2VlIGlmIGEgbW9jayBoYW5kbGVyIHByb3BlcnR5IG1hdGNoZXMgdGhlIGRlZmF1bHQgc2V0dGluZ3NcbiAgICBmdW5jdGlvbiBpc0RlZmF1bHRTZXR0aW5nKGhhbmRsZXIsIHByb3BlcnR5KSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVyW3Byb3BlcnR5XSA9PT0gJC5tb2NramF4U2V0dGluZ3NbcHJvcGVydHldO1xuICAgIH1cblxuXHQvLyBDaGVjayB0aGUgZ2l2ZW4gaGFuZGxlciBzaG91bGQgbW9jayB0aGUgZ2l2ZW4gcmVxdWVzdFxuXHRmdW5jdGlvbiBnZXRNb2NrRm9yUmVxdWVzdCggaGFuZGxlciwgcmVxdWVzdFNldHRpbmdzICkge1xuXHRcdC8vIElmIHRoZSBtb2NrIHdhcyByZWdpc3RlcmVkIHdpdGggYSBmdW5jdGlvbiwgbGV0IHRoZSBmdW5jdGlvbiBkZWNpZGUgaWYgd2Vcblx0XHQvLyB3YW50IHRvIG1vY2sgdGhpcyByZXF1ZXN0XG5cdFx0aWYgKCAkLmlzRnVuY3Rpb24oaGFuZGxlcikgKSB7XG5cdFx0XHRyZXR1cm4gaGFuZGxlciggcmVxdWVzdFNldHRpbmdzICk7XG5cdFx0fVxuXG5cdFx0Ly8gSW5zcGVjdCB0aGUgVVJMIG9mIHRoZSByZXF1ZXN0IGFuZCBjaGVjayBpZiB0aGUgbW9jayBoYW5kbGVyJ3MgdXJsXG5cdFx0Ly8gbWF0Y2hlcyB0aGUgdXJsIGZvciB0aGlzIGFqYXggcmVxdWVzdFxuXHRcdGlmICggJC5pc0Z1bmN0aW9uKGhhbmRsZXIudXJsLnRlc3QpICkge1xuXHRcdFx0Ly8gVGhlIHVzZXIgcHJvdmlkZWQgYSByZWdleCBmb3IgdGhlIHVybCwgdGVzdCBpdFxuXHRcdFx0aWYgKCAhaGFuZGxlci51cmwudGVzdCggcmVxdWVzdFNldHRpbmdzLnVybCApICkge1xuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gTG9vayBmb3IgYSBzaW1wbGUgd2lsZGNhcmQgJyonIG9yIGEgZGlyZWN0IFVSTCBtYXRjaFxuXHRcdFx0dmFyIHN0YXIgPSBoYW5kbGVyLnVybC5pbmRleE9mKCcqJyk7XG5cdFx0XHRpZiAoaGFuZGxlci51cmwgIT09IHJlcXVlc3RTZXR0aW5ncy51cmwgJiYgc3RhciA9PT0gLTEgfHxcblx0XHRcdFx0XHQhbmV3IFJlZ0V4cChoYW5kbGVyLnVybC5yZXBsYWNlKC9bLVtcXF17fSgpKz8uLFxcXFxeJHwjXFxzXS9nLCBcIlxcXFwkJlwiKS5yZXBsYWNlKC9cXCovZywgJy4rJykpLnRlc3QocmVxdWVzdFNldHRpbmdzLnVybCkpIHtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gSW5zcGVjdCB0aGUgZGF0YSBzdWJtaXR0ZWQgaW4gdGhlIHJlcXVlc3QgKGVpdGhlciBQT1NUIGJvZHkgb3IgR0VUIHF1ZXJ5IHN0cmluZylcblx0XHRpZiAoIGhhbmRsZXIuZGF0YSApIHtcblx0XHRcdGlmICggISByZXF1ZXN0U2V0dGluZ3MuZGF0YSB8fCAhaXNNb2NrRGF0YUVxdWFsKGhhbmRsZXIuZGF0YSwgcmVxdWVzdFNldHRpbmdzLmRhdGEpICkge1xuXHRcdFx0XHQvLyBUaGV5J3JlIG5vdCBpZGVudGljYWwsIGRvIG5vdCBtb2NrIHRoaXMgcmVxdWVzdFxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gSW5zcGVjdCB0aGUgcmVxdWVzdCB0eXBlXG5cdFx0aWYgKCBoYW5kbGVyICYmIGhhbmRsZXIudHlwZSAmJlxuXHRcdFx0XHRoYW5kbGVyLnR5cGUudG9Mb3dlckNhc2UoKSAhPSByZXF1ZXN0U2V0dGluZ3MudHlwZS50b0xvd2VyQ2FzZSgpICkge1xuXHRcdFx0Ly8gVGhlIHJlcXVlc3QgdHlwZSBkb2Vzbid0IG1hdGNoIChHRVQgdnMuIFBPU1QpXG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRyZXR1cm4gaGFuZGxlcjtcblx0fVxuXG5cdC8vIFByb2Nlc3MgdGhlIHhociBvYmplY3RzIHNlbmQgb3BlcmF0aW9uXG5cdGZ1bmN0aW9uIF94aHJTZW5kKG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncykge1xuXG5cdFx0Ly8gVGhpcyBpcyBhIHN1YnN0aXR1dGUgZm9yIDwgMS40IHdoaWNoIGxhY2tzICQucHJveHlcblx0XHR2YXIgcHJvY2VzcyA9IChmdW5jdGlvbih0aGF0KSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiAoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dmFyIG9uUmVhZHk7XG5cblx0XHRcdFx0XHQvLyBUaGUgcmVxdWVzdCBoYXMgcmV0dXJuZWRcblx0XHRcdFx0XHR0aGlzLnN0YXR1cyAgICAgPSBtb2NrSGFuZGxlci5zdGF0dXM7XG5cdFx0XHRcdFx0dGhpcy5zdGF0dXNUZXh0ID0gbW9ja0hhbmRsZXIuc3RhdHVzVGV4dDtcblx0XHRcdFx0XHR0aGlzLnJlYWR5U3RhdGVcdD0gNDtcblxuXHRcdFx0XHRcdC8vIFdlIGhhdmUgYW4gZXhlY3V0YWJsZSBmdW5jdGlvbiwgY2FsbCBpdCB0byBnaXZlXG5cdFx0XHRcdFx0Ly8gdGhlIG1vY2sgaGFuZGxlciBhIGNoYW5jZSB0byB1cGRhdGUgaXQncyBkYXRhXG5cdFx0XHRcdFx0aWYgKCAkLmlzRnVuY3Rpb24obW9ja0hhbmRsZXIucmVzcG9uc2UpICkge1xuXHRcdFx0XHRcdFx0bW9ja0hhbmRsZXIucmVzcG9uc2Uob3JpZ1NldHRpbmdzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gQ29weSBvdmVyIG91ciBtb2NrIHRvIG91ciB4aHIgb2JqZWN0IGJlZm9yZSBwYXNzaW5nIGNvbnRyb2wgYmFjayB0b1xuXHRcdFx0XHRcdC8vIGpRdWVyeSdzIG9ucmVhZHlzdGF0ZWNoYW5nZSBjYWxsYmFja1xuXHRcdFx0XHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlID09ICdqc29uJyAmJiAoIHR5cGVvZiBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgPT0gJ29iamVjdCcgKSApIHtcblx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2VUZXh0ID0gSlNPTi5zdHJpbmdpZnkobW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0KTtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKCByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgPT0gJ3htbCcgKSB7XG5cdFx0XHRcdFx0XHRpZiAoIHR5cGVvZiBtb2NrSGFuZGxlci5yZXNwb25zZVhNTCA9PSAnc3RyaW5nJyApIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5yZXNwb25zZVhNTCA9IHBhcnNlWE1MKG1vY2tIYW5kbGVyLnJlc3BvbnNlWE1MKTtcblx0XHRcdFx0XHRcdFx0Ly9pbiBqUXVlcnkgMS45LjErLCByZXNwb25zZVhNTCBpcyBwcm9jZXNzZWQgZGlmZmVyZW50bHkgYW5kIHJlbGllcyBvbiByZXNwb25zZVRleHRcblx0XHRcdFx0XHRcdFx0dGhpcy5yZXNwb25zZVRleHQgPSBtb2NrSGFuZGxlci5yZXNwb25zZVhNTDtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2VYTUwgPSBtb2NrSGFuZGxlci5yZXNwb25zZVhNTDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhpcy5yZXNwb25zZVRleHQgPSBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmKCB0eXBlb2YgbW9ja0hhbmRsZXIuc3RhdHVzID09ICdudW1iZXInIHx8IHR5cGVvZiBtb2NrSGFuZGxlci5zdGF0dXMgPT0gJ3N0cmluZycgKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnN0YXR1cyA9IG1vY2tIYW5kbGVyLnN0YXR1cztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYoIHR5cGVvZiBtb2NrSGFuZGxlci5zdGF0dXNUZXh0ID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnN0YXR1c1RleHQgPSBtb2NrSGFuZGxlci5zdGF0dXNUZXh0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBqUXVlcnkgMi4wIHJlbmFtZWQgb25yZWFkeXN0YXRlY2hhbmdlIHRvIG9ubG9hZFxuXHRcdFx0XHRcdG9uUmVhZHkgPSB0aGlzLm9ucmVhZHlzdGF0ZWNoYW5nZSB8fCB0aGlzLm9ubG9hZDtcblxuXHRcdFx0XHRcdC8vIGpRdWVyeSA8IDEuNCBkb2Vzbid0IGhhdmUgb25yZWFkeXN0YXRlIGNoYW5nZSBmb3IgeGhyXG5cdFx0XHRcdFx0aWYgKCAkLmlzRnVuY3Rpb24oIG9uUmVhZHkgKSApIHtcblx0XHRcdFx0XHRcdGlmKCBtb2NrSGFuZGxlci5pc1RpbWVvdXQpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5zdGF0dXMgPSAtMTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG9uUmVhZHkuY2FsbCggdGhpcywgbW9ja0hhbmRsZXIuaXNUaW1lb3V0ID8gJ3RpbWVvdXQnIDogdW5kZWZpbmVkICk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmICggbW9ja0hhbmRsZXIuaXNUaW1lb3V0ICkge1xuXHRcdFx0XHRcdFx0Ly8gRml4IGZvciAxLjMuMiB0aW1lb3V0IHRvIGtlZXAgc3VjY2VzcyBmcm9tIGZpcmluZy5cblx0XHRcdFx0XHRcdHRoaXMuc3RhdHVzID0gLTE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KS5hcHBseSh0aGF0KTtcblx0XHRcdH07XG5cdFx0fSkodGhpcyk7XG5cblx0XHRpZiAoIG1vY2tIYW5kbGVyLnByb3h5ICkge1xuXHRcdFx0Ly8gV2UncmUgcHJveHlpbmcgdGhpcyByZXF1ZXN0IGFuZCBsb2FkaW5nIGluIGFuIGV4dGVybmFsIGZpbGUgaW5zdGVhZFxuXHRcdFx0X2FqYXgoe1xuXHRcdFx0XHRnbG9iYWw6IGZhbHNlLFxuXHRcdFx0XHR1cmw6IG1vY2tIYW5kbGVyLnByb3h5LFxuXHRcdFx0XHR0eXBlOiBtb2NrSGFuZGxlci5wcm94eVR5cGUsXG5cdFx0XHRcdGRhdGE6IG1vY2tIYW5kbGVyLmRhdGEsXG5cdFx0XHRcdGRhdGFUeXBlOiByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgPT09IFwic2NyaXB0XCIgPyBcInRleHQvcGxhaW5cIiA6IHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSxcblx0XHRcdFx0Y29tcGxldGU6IGZ1bmN0aW9uKHhocikge1xuXHRcdFx0XHRcdG1vY2tIYW5kbGVyLnJlc3BvbnNlWE1MID0geGhyLnJlc3BvbnNlWE1MO1xuXHRcdFx0XHRcdG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCA9IHhoci5yZXNwb25zZVRleHQ7XG4gICAgICAgICAgICAgICAgICAgIC8vIERvbid0IG92ZXJyaWRlIHRoZSBoYW5kbGVyIHN0YXR1cy9zdGF0dXNUZXh0IGlmIGl0J3Mgc3BlY2lmaWVkIGJ5IHRoZSBjb25maWdcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzRGVmYXVsdFNldHRpbmcobW9ja0hhbmRsZXIsICdzdGF0dXMnKSkge1xuXHRcdFx0XHRcdCAgICBtb2NrSGFuZGxlci5zdGF0dXMgPSB4aHIuc3RhdHVzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0RlZmF1bHRTZXR0aW5nKG1vY2tIYW5kbGVyLCAnc3RhdHVzVGV4dCcpKSB7XG5cdFx0XHRcdFx0ICAgIG1vY2tIYW5kbGVyLnN0YXR1c1RleHQgPSB4aHIuc3RhdHVzVGV4dDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG5cdFx0XHRcdFx0dGhpcy5yZXNwb25zZVRpbWVyID0gc2V0VGltZW91dChwcm9jZXNzLCBtb2NrSGFuZGxlci5yZXNwb25zZVRpbWUgfHwgMCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyB0eXBlID09ICdQT1NUJyB8fCAnR0VUJyB8fCAnREVMRVRFJ1xuXHRcdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuYXN5bmMgPT09IGZhbHNlICkge1xuXHRcdFx0XHQvLyBUT0RPOiBCbG9ja2luZyBkZWxheVxuXHRcdFx0XHRwcm9jZXNzKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnJlc3BvbnNlVGltZXIgPSBzZXRUaW1lb3V0KHByb2Nlc3MsIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGltZSB8fCA1MCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gQ29uc3RydWN0IGEgbW9ja2VkIFhIUiBPYmplY3Rcblx0ZnVuY3Rpb24geGhyKG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncywgb3JpZ0hhbmRsZXIpIHtcblx0XHQvLyBFeHRlbmQgd2l0aCBvdXIgZGVmYXVsdCBtb2NramF4IHNldHRpbmdzXG5cdFx0bW9ja0hhbmRsZXIgPSAkLmV4dGVuZCh0cnVlLCB7fSwgJC5tb2NramF4U2V0dGluZ3MsIG1vY2tIYW5kbGVyKTtcblxuXHRcdGlmICh0eXBlb2YgbW9ja0hhbmRsZXIuaGVhZGVycyA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdG1vY2tIYW5kbGVyLmhlYWRlcnMgPSB7fTtcblx0XHR9XG5cdFx0aWYgKCBtb2NrSGFuZGxlci5jb250ZW50VHlwZSApIHtcblx0XHRcdG1vY2tIYW5kbGVyLmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddID0gbW9ja0hhbmRsZXIuY29udGVudFR5cGU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHN0YXR1czogbW9ja0hhbmRsZXIuc3RhdHVzLFxuXHRcdFx0c3RhdHVzVGV4dDogbW9ja0hhbmRsZXIuc3RhdHVzVGV4dCxcblx0XHRcdHJlYWR5U3RhdGU6IDEsXG5cdFx0XHRvcGVuOiBmdW5jdGlvbigpIHsgfSxcblx0XHRcdHNlbmQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRvcmlnSGFuZGxlci5maXJlZCA9IHRydWU7XG5cdFx0XHRcdF94aHJTZW5kLmNhbGwodGhpcywgbW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncywgb3JpZ1NldHRpbmdzKTtcblx0XHRcdH0sXG5cdFx0XHRhYm9ydDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGNsZWFyVGltZW91dCh0aGlzLnJlc3BvbnNlVGltZXIpO1xuXHRcdFx0fSxcblx0XHRcdHNldFJlcXVlc3RIZWFkZXI6IGZ1bmN0aW9uKGhlYWRlciwgdmFsdWUpIHtcblx0XHRcdFx0bW9ja0hhbmRsZXIuaGVhZGVyc1toZWFkZXJdID0gdmFsdWU7XG5cdFx0XHR9LFxuXHRcdFx0Z2V0UmVzcG9uc2VIZWFkZXI6IGZ1bmN0aW9uKGhlYWRlcikge1xuXHRcdFx0XHQvLyAnTGFzdC1tb2RpZmllZCcsICdFdGFnJywgJ2NvbnRlbnQtdHlwZScgYXJlIGFsbCBjaGVja2VkIGJ5IGpRdWVyeVxuXHRcdFx0XHRpZiAoIG1vY2tIYW5kbGVyLmhlYWRlcnMgJiYgbW9ja0hhbmRsZXIuaGVhZGVyc1toZWFkZXJdICkge1xuXHRcdFx0XHRcdC8vIFJldHVybiBhcmJpdHJhcnkgaGVhZGVyc1xuXHRcdFx0XHRcdHJldHVybiBtb2NrSGFuZGxlci5oZWFkZXJzW2hlYWRlcl07XG5cdFx0XHRcdH0gZWxzZSBpZiAoIGhlYWRlci50b0xvd2VyQ2FzZSgpID09ICdsYXN0LW1vZGlmaWVkJyApIHtcblx0XHRcdFx0XHRyZXR1cm4gbW9ja0hhbmRsZXIubGFzdE1vZGlmaWVkIHx8IChuZXcgRGF0ZSgpKS50b1N0cmluZygpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCBoZWFkZXIudG9Mb3dlckNhc2UoKSA9PSAnZXRhZycgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG1vY2tIYW5kbGVyLmV0YWcgfHwgJyc7XG5cdFx0XHRcdH0gZWxzZSBpZiAoIGhlYWRlci50b0xvd2VyQ2FzZSgpID09ICdjb250ZW50LXR5cGUnICkge1xuXHRcdFx0XHRcdHJldHVybiBtb2NrSGFuZGxlci5jb250ZW50VHlwZSB8fCAndGV4dC9wbGFpbic7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRnZXRBbGxSZXNwb25zZUhlYWRlcnM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgaGVhZGVycyA9ICcnO1xuXHRcdFx0XHQkLmVhY2gobW9ja0hhbmRsZXIuaGVhZGVycywgZnVuY3Rpb24oaywgdikge1xuXHRcdFx0XHRcdGhlYWRlcnMgKz0gayArICc6ICcgKyB2ICsgXCJcXG5cIjtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHJldHVybiBoZWFkZXJzO1xuXHRcdFx0fVxuXHRcdH07XG5cdH1cblxuXHQvLyBQcm9jZXNzIGEgSlNPTlAgbW9jayByZXF1ZXN0LlxuXHRmdW5jdGlvbiBwcm9jZXNzSnNvbnBNb2NrKCByZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MgKSB7XG5cdFx0Ly8gSGFuZGxlIEpTT05QIFBhcmFtZXRlciBDYWxsYmFja3MsIHdlIG5lZWQgdG8gcmVwbGljYXRlIHNvbWUgb2YgdGhlIGpRdWVyeSBjb3JlIGhlcmVcblx0XHQvLyBiZWNhdXNlIHRoZXJlIGlzbid0IGFuIGVhc3kgaG9vayBmb3IgdGhlIGNyb3NzIGRvbWFpbiBzY3JpcHQgdGFnIG9mIGpzb25wXG5cblx0XHRwcm9jZXNzSnNvbnBVcmwoIHJlcXVlc3RTZXR0aW5ncyApO1xuXG5cdFx0cmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlID0gXCJqc29uXCI7XG5cdFx0aWYocmVxdWVzdFNldHRpbmdzLmRhdGEgJiYgQ0FMTEJBQ0tfUkVHRVgudGVzdChyZXF1ZXN0U2V0dGluZ3MuZGF0YSkgfHwgQ0FMTEJBQ0tfUkVHRVgudGVzdChyZXF1ZXN0U2V0dGluZ3MudXJsKSkge1xuXHRcdFx0Y3JlYXRlSnNvbnBDYWxsYmFjayhyZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MpO1xuXG5cdFx0XHQvLyBXZSBuZWVkIHRvIG1ha2Ugc3VyZVxuXHRcdFx0Ly8gdGhhdCBhIEpTT05QIHN0eWxlIHJlc3BvbnNlIGlzIGV4ZWN1dGVkIHByb3Blcmx5XG5cblx0XHRcdHZhciBydXJsID0gL14oXFx3KzopP1xcL1xcLyhbXlxcLz8jXSspLyxcblx0XHRcdFx0cGFydHMgPSBydXJsLmV4ZWMoIHJlcXVlc3RTZXR0aW5ncy51cmwgKSxcblx0XHRcdFx0cmVtb3RlID0gcGFydHMgJiYgKHBhcnRzWzFdICYmIHBhcnRzWzFdICE9PSBsb2NhdGlvbi5wcm90b2NvbCB8fCBwYXJ0c1syXSAhPT0gbG9jYXRpb24uaG9zdCk7XG5cblx0XHRcdHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSA9IFwic2NyaXB0XCI7XG5cdFx0XHRpZihyZXF1ZXN0U2V0dGluZ3MudHlwZS50b1VwcGVyQ2FzZSgpID09PSBcIkdFVFwiICYmIHJlbW90ZSApIHtcblx0XHRcdFx0dmFyIG5ld01vY2tSZXR1cm4gPSBwcm9jZXNzSnNvbnBSZXF1ZXN0KCByZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MgKTtcblxuXHRcdFx0XHQvLyBDaGVjayBpZiB3ZSBhcmUgc3VwcG9zZWQgdG8gcmV0dXJuIGEgRGVmZXJyZWQgYmFjayB0byB0aGUgbW9jayBjYWxsLCBvciBqdXN0XG5cdFx0XHRcdC8vIHNpZ25hbCBzdWNjZXNzXG5cdFx0XHRcdGlmKG5ld01vY2tSZXR1cm4pIHtcblx0XHRcdFx0XHRyZXR1cm4gbmV3TW9ja1JldHVybjtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdC8vIEFwcGVuZCB0aGUgcmVxdWlyZWQgY2FsbGJhY2sgcGFyYW1ldGVyIHRvIHRoZSBlbmQgb2YgdGhlIHJlcXVlc3QgVVJMLCBmb3IgYSBKU09OUCByZXF1ZXN0XG5cdGZ1bmN0aW9uIHByb2Nlc3NKc29ucFVybCggcmVxdWVzdFNldHRpbmdzICkge1xuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLnR5cGUudG9VcHBlckNhc2UoKSA9PT0gXCJHRVRcIiApIHtcblx0XHRcdGlmICggIUNBTExCQUNLX1JFR0VYLnRlc3QoIHJlcXVlc3RTZXR0aW5ncy51cmwgKSApIHtcblx0XHRcdFx0cmVxdWVzdFNldHRpbmdzLnVybCArPSAoL1xcPy8udGVzdCggcmVxdWVzdFNldHRpbmdzLnVybCApID8gXCImXCIgOiBcIj9cIikgK1xuXHRcdFx0XHRcdChyZXF1ZXN0U2V0dGluZ3MuanNvbnAgfHwgXCJjYWxsYmFja1wiKSArIFwiPT9cIjtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKCAhcmVxdWVzdFNldHRpbmdzLmRhdGEgfHwgIUNBTExCQUNLX1JFR0VYLnRlc3QocmVxdWVzdFNldHRpbmdzLmRhdGEpICkge1xuXHRcdFx0cmVxdWVzdFNldHRpbmdzLmRhdGEgPSAocmVxdWVzdFNldHRpbmdzLmRhdGEgPyByZXF1ZXN0U2V0dGluZ3MuZGF0YSArIFwiJlwiIDogXCJcIikgKyAocmVxdWVzdFNldHRpbmdzLmpzb25wIHx8IFwiY2FsbGJhY2tcIikgKyBcIj0/XCI7XG5cdFx0fVxuXHR9XG5cblx0Ly8gUHJvY2VzcyBhIEpTT05QIHJlcXVlc3QgYnkgZXZhbHVhdGluZyB0aGUgbW9ja2VkIHJlc3BvbnNlIHRleHRcblx0ZnVuY3Rpb24gcHJvY2Vzc0pzb25wUmVxdWVzdCggcmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzICkge1xuXHRcdC8vIFN5bnRoZXNpemUgdGhlIG1vY2sgcmVxdWVzdCBmb3IgYWRkaW5nIGEgc2NyaXB0IHRhZ1xuXHRcdHZhciBjYWxsYmFja0NvbnRleHQgPSBvcmlnU2V0dGluZ3MgJiYgb3JpZ1NldHRpbmdzLmNvbnRleHQgfHwgcmVxdWVzdFNldHRpbmdzLFxuXHRcdFx0bmV3TW9jayA9IG51bGw7XG5cblxuXHRcdC8vIElmIHRoZSByZXNwb25zZSBoYW5kbGVyIG9uIHRoZSBtb29jayBpcyBhIGZ1bmN0aW9uLCBjYWxsIGl0XG5cdFx0aWYgKCBtb2NrSGFuZGxlci5yZXNwb25zZSAmJiAkLmlzRnVuY3Rpb24obW9ja0hhbmRsZXIucmVzcG9uc2UpICkge1xuXHRcdFx0bW9ja0hhbmRsZXIucmVzcG9uc2Uob3JpZ1NldHRpbmdzKTtcblx0XHR9IGVsc2Uge1xuXG5cdFx0XHQvLyBFdmFsdWF0ZSB0aGUgcmVzcG9uc2VUZXh0IGphdmFzY3JpcHQgaW4gYSBnbG9iYWwgY29udGV4dFxuXHRcdFx0aWYoIHR5cGVvZiBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgPT09ICdvYmplY3QnICkge1xuXHRcdFx0XHQkLmdsb2JhbEV2YWwoICcoJyArIEpTT04uc3RyaW5naWZ5KCBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgKSArICcpJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkLmdsb2JhbEV2YWwoICcoJyArIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCArICcpJyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gU3VjY2Vzc2Z1bCByZXNwb25zZVxuXHRcdGpzb25wU3VjY2VzcyggcmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyICk7XG5cdFx0anNvbnBDb21wbGV0ZSggcmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyICk7XG5cblx0XHQvLyBJZiB3ZSBhcmUgcnVubmluZyB1bmRlciBqUXVlcnkgMS41KywgcmV0dXJuIGEgZGVmZXJyZWQgb2JqZWN0XG5cdFx0aWYoJC5EZWZlcnJlZCl7XG5cdFx0XHRuZXdNb2NrID0gbmV3ICQuRGVmZXJyZWQoKTtcblx0XHRcdGlmKHR5cGVvZiBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgPT0gXCJvYmplY3RcIil7XG5cdFx0XHRcdG5ld01vY2sucmVzb2x2ZVdpdGgoIGNhbGxiYWNrQ29udGV4dCwgW21vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dF0gKTtcblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdG5ld01vY2sucmVzb2x2ZVdpdGgoIGNhbGxiYWNrQ29udGV4dCwgWyQucGFyc2VKU09OKCBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgKV0gKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG5ld01vY2s7XG5cdH1cblxuXG5cdC8vIENyZWF0ZSB0aGUgcmVxdWlyZWQgSlNPTlAgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIHRoZSByZXF1ZXN0XG5cdGZ1bmN0aW9uIGNyZWF0ZUpzb25wQ2FsbGJhY2soIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyApIHtcblx0XHR2YXIgY2FsbGJhY2tDb250ZXh0ID0gb3JpZ1NldHRpbmdzICYmIG9yaWdTZXR0aW5ncy5jb250ZXh0IHx8IHJlcXVlc3RTZXR0aW5ncztcblx0XHR2YXIganNvbnAgPSByZXF1ZXN0U2V0dGluZ3MuanNvbnBDYWxsYmFjayB8fCAoXCJqc29ucFwiICsganNjKyspO1xuXG5cdFx0Ly8gUmVwbGFjZSB0aGUgPT8gc2VxdWVuY2UgYm90aCBpbiB0aGUgcXVlcnkgc3RyaW5nIGFuZCB0aGUgZGF0YVxuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmRhdGEgKSB7XG5cdFx0XHRyZXF1ZXN0U2V0dGluZ3MuZGF0YSA9IChyZXF1ZXN0U2V0dGluZ3MuZGF0YSArIFwiXCIpLnJlcGxhY2UoQ0FMTEJBQ0tfUkVHRVgsIFwiPVwiICsganNvbnAgKyBcIiQxXCIpO1xuXHRcdH1cblxuXHRcdHJlcXVlc3RTZXR0aW5ncy51cmwgPSByZXF1ZXN0U2V0dGluZ3MudXJsLnJlcGxhY2UoQ0FMTEJBQ0tfUkVHRVgsIFwiPVwiICsganNvbnAgKyBcIiQxXCIpO1xuXG5cblx0XHQvLyBIYW5kbGUgSlNPTlAtc3R5bGUgbG9hZGluZ1xuXHRcdHdpbmRvd1sganNvbnAgXSA9IHdpbmRvd1sganNvbnAgXSB8fCBmdW5jdGlvbiggdG1wICkge1xuXHRcdFx0ZGF0YSA9IHRtcDtcblx0XHRcdGpzb25wU3VjY2VzcyggcmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyICk7XG5cdFx0XHRqc29ucENvbXBsZXRlKCByZXF1ZXN0U2V0dGluZ3MsIGNhbGxiYWNrQ29udGV4dCwgbW9ja0hhbmRsZXIgKTtcblx0XHRcdC8vIEdhcmJhZ2UgY29sbGVjdFxuXHRcdFx0d2luZG93WyBqc29ucCBdID0gdW5kZWZpbmVkO1xuXG5cdFx0XHR0cnkge1xuXHRcdFx0XHRkZWxldGUgd2luZG93WyBqc29ucCBdO1xuXHRcdFx0fSBjYXRjaChlKSB7fVxuXG5cdFx0XHRpZiAoIGhlYWQgKSB7XG5cdFx0XHRcdGhlYWQucmVtb3ZlQ2hpbGQoIHNjcmlwdCApO1xuXHRcdFx0fVxuXHRcdH07XG5cdH1cblxuXHQvLyBUaGUgSlNPTlAgcmVxdWVzdCB3YXMgc3VjY2Vzc2Z1bFxuXHRmdW5jdGlvbiBqc29ucFN1Y2Nlc3MocmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyKSB7XG5cdFx0Ly8gSWYgYSBsb2NhbCBjYWxsYmFjayB3YXMgc3BlY2lmaWVkLCBmaXJlIGl0IGFuZCBwYXNzIGl0IHRoZSBkYXRhXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3Muc3VjY2VzcyApIHtcblx0XHRcdHJlcXVlc3RTZXR0aW5ncy5zdWNjZXNzLmNhbGwoIGNhbGxiYWNrQ29udGV4dCwgbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0IHx8IFwiXCIsIHN0YXR1cywge30gKTtcblx0XHR9XG5cblx0XHQvLyBGaXJlIHRoZSBnbG9iYWwgY2FsbGJhY2tcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5nbG9iYWwgKSB7XG5cdFx0XHR0cmlnZ2VyKHJlcXVlc3RTZXR0aW5ncywgXCJhamF4U3VjY2Vzc1wiLCBbe30sIHJlcXVlc3RTZXR0aW5nc10gKTtcblx0XHR9XG5cdH1cblxuXHQvLyBUaGUgSlNPTlAgcmVxdWVzdCB3YXMgY29tcGxldGVkXG5cdGZ1bmN0aW9uIGpzb25wQ29tcGxldGUocmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQpIHtcblx0XHQvLyBQcm9jZXNzIHJlc3VsdFxuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmNvbXBsZXRlICkge1xuXHRcdFx0cmVxdWVzdFNldHRpbmdzLmNvbXBsZXRlLmNhbGwoIGNhbGxiYWNrQ29udGV4dCwge30gLCBzdGF0dXMgKTtcblx0XHR9XG5cblx0XHQvLyBUaGUgcmVxdWVzdCB3YXMgY29tcGxldGVkXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZ2xvYmFsICkge1xuXHRcdFx0dHJpZ2dlciggXCJhamF4Q29tcGxldGVcIiwgW3t9LCByZXF1ZXN0U2V0dGluZ3NdICk7XG5cdFx0fVxuXG5cdFx0Ly8gSGFuZGxlIHRoZSBnbG9iYWwgQUpBWCBjb3VudGVyXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZ2xvYmFsICYmICEgLS0kLmFjdGl2ZSApIHtcblx0XHRcdCQuZXZlbnQudHJpZ2dlciggXCJhamF4U3RvcFwiICk7XG5cdFx0fVxuXHR9XG5cblxuXHQvLyBUaGUgY29yZSAkLmFqYXggcmVwbGFjZW1lbnQuXG5cdGZ1bmN0aW9uIGhhbmRsZUFqYXgoIHVybCwgb3JpZ1NldHRpbmdzICkge1xuXHRcdHZhciBtb2NrUmVxdWVzdCwgcmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlcjtcblxuXHRcdC8vIElmIHVybCBpcyBhbiBvYmplY3QsIHNpbXVsYXRlIHByZS0xLjUgc2lnbmF0dXJlXG5cdFx0aWYgKCB0eXBlb2YgdXJsID09PSBcIm9iamVjdFwiICkge1xuXHRcdFx0b3JpZ1NldHRpbmdzID0gdXJsO1xuXHRcdFx0dXJsID0gdW5kZWZpbmVkO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyB3b3JrIGFyb3VuZCB0byBzdXBwb3J0IDEuNSBzaWduYXR1cmVcblx0XHRcdG9yaWdTZXR0aW5ncyA9IG9yaWdTZXR0aW5ncyB8fCB7fTtcblx0XHRcdG9yaWdTZXR0aW5ncy51cmwgPSB1cmw7XG5cdFx0fVxuXG5cdFx0Ly8gRXh0ZW5kIHRoZSBvcmlnaW5hbCBzZXR0aW5ncyBmb3IgdGhlIHJlcXVlc3Rcblx0XHRyZXF1ZXN0U2V0dGluZ3MgPSAkLmV4dGVuZCh0cnVlLCB7fSwgJC5hamF4U2V0dGluZ3MsIG9yaWdTZXR0aW5ncyk7XG5cblx0XHQvLyBJdGVyYXRlIG92ZXIgb3VyIG1vY2sgaGFuZGxlcnMgKGluIHJlZ2lzdHJhdGlvbiBvcmRlcikgdW50aWwgd2UgZmluZFxuXHRcdC8vIG9uZSB0aGF0IGlzIHdpbGxpbmcgdG8gaW50ZXJjZXB0IHRoZSByZXF1ZXN0XG5cdFx0Zm9yKHZhciBrID0gMDsgayA8IG1vY2tIYW5kbGVycy5sZW5ndGg7IGsrKykge1xuXHRcdFx0aWYgKCAhbW9ja0hhbmRsZXJzW2tdICkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0bW9ja0hhbmRsZXIgPSBnZXRNb2NrRm9yUmVxdWVzdCggbW9ja0hhbmRsZXJzW2tdLCByZXF1ZXN0U2V0dGluZ3MgKTtcblx0XHRcdGlmKCFtb2NrSGFuZGxlcikge1xuXHRcdFx0XHQvLyBObyB2YWxpZCBtb2NrIGZvdW5kIGZvciB0aGlzIHJlcXVlc3Rcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdG1vY2tlZEFqYXhDYWxscy5wdXNoKHJlcXVlc3RTZXR0aW5ncyk7XG5cblx0XHRcdC8vIElmIGxvZ2dpbmcgaXMgZW5hYmxlZCwgbG9nIHRoZSBtb2NrIHRvIHRoZSBjb25zb2xlXG5cdFx0XHQkLm1vY2tqYXhTZXR0aW5ncy5sb2coIG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MgKTtcblxuXG5cdFx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSAmJiByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUudG9VcHBlckNhc2UoKSA9PT0gJ0pTT05QJyApIHtcblx0XHRcdFx0aWYgKChtb2NrUmVxdWVzdCA9IHByb2Nlc3NKc29ucE1vY2soIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyApKSkge1xuXHRcdFx0XHRcdC8vIFRoaXMgbW9jayB3aWxsIGhhbmRsZSB0aGUgSlNPTlAgcmVxdWVzdFxuXHRcdFx0XHRcdHJldHVybiBtb2NrUmVxdWVzdDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cblx0XHRcdC8vIFJlbW92ZWQgdG8gZml4ICM1NCAtIGtlZXAgdGhlIG1vY2tpbmcgZGF0YSBvYmplY3QgaW50YWN0XG5cdFx0XHQvL21vY2tIYW5kbGVyLmRhdGEgPSByZXF1ZXN0U2V0dGluZ3MuZGF0YTtcblxuXHRcdFx0bW9ja0hhbmRsZXIuY2FjaGUgPSByZXF1ZXN0U2V0dGluZ3MuY2FjaGU7XG5cdFx0XHRtb2NrSGFuZGxlci50aW1lb3V0ID0gcmVxdWVzdFNldHRpbmdzLnRpbWVvdXQ7XG5cdFx0XHRtb2NrSGFuZGxlci5nbG9iYWwgPSByZXF1ZXN0U2V0dGluZ3MuZ2xvYmFsO1xuXG5cdFx0XHRjb3B5VXJsUGFyYW1ldGVycyhtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzKTtcblxuXHRcdFx0KGZ1bmN0aW9uKG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncywgb3JpZ0hhbmRsZXIpIHtcblx0XHRcdFx0bW9ja1JlcXVlc3QgPSBfYWpheC5jYWxsKCQsICQuZXh0ZW5kKHRydWUsIHt9LCBvcmlnU2V0dGluZ3MsIHtcblx0XHRcdFx0XHQvLyBNb2NrIHRoZSBYSFIgb2JqZWN0XG5cdFx0XHRcdFx0eGhyOiBmdW5jdGlvbigpIHsgcmV0dXJuIHhociggbW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncywgb3JpZ1NldHRpbmdzLCBvcmlnSGFuZGxlciApOyB9XG5cdFx0XHRcdH0pKTtcblx0XHRcdH0pKG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncywgbW9ja0hhbmRsZXJzW2tdKTtcblxuXHRcdFx0cmV0dXJuIG1vY2tSZXF1ZXN0O1xuXHRcdH1cblxuXHRcdC8vIFdlIGRvbid0IGhhdmUgYSBtb2NrIHJlcXVlc3Rcblx0XHRpZigkLm1vY2tqYXhTZXR0aW5ncy50aHJvd1VubW9ja2VkID09PSB0cnVlKSB7XG5cdFx0XHR0aHJvdygnQUpBWCBub3QgbW9ja2VkOiAnICsgb3JpZ1NldHRpbmdzLnVybCk7XG5cdFx0fVxuXHRcdGVsc2UgeyAvLyB0cmlnZ2VyIGEgbm9ybWFsIHJlcXVlc3Rcblx0XHRcdHJldHVybiBfYWpheC5hcHBseSgkLCBbb3JpZ1NldHRpbmdzXSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCogQ29waWVzIFVSTCBwYXJhbWV0ZXIgdmFsdWVzIGlmIHRoZXkgd2VyZSBjYXB0dXJlZCBieSBhIHJlZ3VsYXIgZXhwcmVzc2lvblxuXHQqIEBwYXJhbSB7T2JqZWN0fSBtb2NrSGFuZGxlclxuXHQqIEBwYXJhbSB7T2JqZWN0fSBvcmlnU2V0dGluZ3Ncblx0Ki9cblx0ZnVuY3Rpb24gY29weVVybFBhcmFtZXRlcnMobW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncykge1xuXHRcdC8vcGFyYW1ldGVycyBhcmVuJ3QgY2FwdHVyZWQgaWYgdGhlIFVSTCBpc24ndCBhIFJlZ0V4cFxuXHRcdGlmICghKG1vY2tIYW5kbGVyLnVybCBpbnN0YW5jZW9mIFJlZ0V4cCkpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Ly9pZiBubyBVUkwgcGFyYW1zIHdlcmUgZGVmaW5lZCBvbiB0aGUgaGFuZGxlciwgZG9uJ3QgYXR0ZW1wdCBhIGNhcHR1cmVcblx0XHRpZiAoIW1vY2tIYW5kbGVyLmhhc093blByb3BlcnR5KCd1cmxQYXJhbXMnKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR2YXIgY2FwdHVyZXMgPSBtb2NrSGFuZGxlci51cmwuZXhlYyhvcmlnU2V0dGluZ3MudXJsKTtcblx0XHQvL3RoZSB3aG9sZSBSZWdFeHAgbWF0Y2ggaXMgYWx3YXlzIHRoZSBmaXJzdCB2YWx1ZSBpbiB0aGUgY2FwdHVyZSByZXN1bHRzXG5cdFx0aWYgKGNhcHR1cmVzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjYXB0dXJlcy5zaGlmdCgpO1xuXHRcdC8vdXNlIGhhbmRsZXIgcGFyYW1zIGFzIGtleXMgYW5kIGNhcHR1cmUgcmVzdXRzIGFzIHZhbHVlc1xuXHRcdHZhciBpID0gMCxcblx0XHRjYXB0dXJlc0xlbmd0aCA9IGNhcHR1cmVzLmxlbmd0aCxcblx0XHRwYXJhbXNMZW5ndGggPSBtb2NrSGFuZGxlci51cmxQYXJhbXMubGVuZ3RoLFxuXHRcdC8vaW4gY2FzZSB0aGUgbnVtYmVyIG9mIHBhcmFtcyBzcGVjaWZpZWQgaXMgbGVzcyB0aGFuIGFjdHVhbCBjYXB0dXJlc1xuXHRcdG1heEl0ZXJhdGlvbnMgPSBNYXRoLm1pbihjYXB0dXJlc0xlbmd0aCwgcGFyYW1zTGVuZ3RoKSxcblx0XHRwYXJhbVZhbHVlcyA9IHt9O1xuXHRcdGZvciAoaTsgaSA8IG1heEl0ZXJhdGlvbnM7IGkrKykge1xuXHRcdFx0dmFyIGtleSA9IG1vY2tIYW5kbGVyLnVybFBhcmFtc1tpXTtcblx0XHRcdHBhcmFtVmFsdWVzW2tleV0gPSBjYXB0dXJlc1tpXTtcblx0XHR9XG5cdFx0b3JpZ1NldHRpbmdzLnVybFBhcmFtcyA9IHBhcmFtVmFsdWVzO1xuXHR9XG5cblxuXHQvLyBQdWJsaWNcblxuXHQkLmV4dGVuZCh7XG5cdFx0YWpheDogaGFuZGxlQWpheFxuXHR9KTtcblxuXHQkLm1vY2tqYXhTZXR0aW5ncyA9IHtcblx0XHQvL3VybDogICAgICAgIG51bGwsXG5cdFx0Ly90eXBlOiAgICAgICAnR0VUJyxcblx0XHRsb2c6ICAgICAgICAgIGZ1bmN0aW9uKCBtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzICkge1xuXHRcdFx0aWYgKCBtb2NrSGFuZGxlci5sb2dnaW5nID09PSBmYWxzZSB8fFxuXHRcdFx0XHQgKCB0eXBlb2YgbW9ja0hhbmRsZXIubG9nZ2luZyA9PT0gJ3VuZGVmaW5lZCcgJiYgJC5tb2NramF4U2V0dGluZ3MubG9nZ2luZyA9PT0gZmFsc2UgKSApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCB3aW5kb3cuY29uc29sZSAmJiBjb25zb2xlLmxvZyApIHtcblx0XHRcdFx0dmFyIG1lc3NhZ2UgPSAnTU9DSyAnICsgcmVxdWVzdFNldHRpbmdzLnR5cGUudG9VcHBlckNhc2UoKSArICc6ICcgKyByZXF1ZXN0U2V0dGluZ3MudXJsO1xuXHRcdFx0XHR2YXIgcmVxdWVzdCA9ICQuZXh0ZW5kKHt9LCByZXF1ZXN0U2V0dGluZ3MpO1xuXG5cdFx0XHRcdGlmICh0eXBlb2YgY29uc29sZS5sb2cgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhtZXNzYWdlLCByZXF1ZXN0KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coIG1lc3NhZ2UgKyAnICcgKyBKU09OLnN0cmluZ2lmeShyZXF1ZXN0KSApO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0bG9nZ2luZzogICAgICAgdHJ1ZSxcblx0XHRzdGF0dXM6ICAgICAgICAyMDAsXG5cdFx0c3RhdHVzVGV4dDogICAgXCJPS1wiLFxuXHRcdHJlc3BvbnNlVGltZTogIDUwMCxcblx0XHRpc1RpbWVvdXQ6ICAgICBmYWxzZSxcblx0XHR0aHJvd1VubW9ja2VkOiBmYWxzZSxcblx0XHRjb250ZW50VHlwZTogICAndGV4dC9wbGFpbicsXG5cdFx0cmVzcG9uc2U6ICAgICAgJycsXG5cdFx0cmVzcG9uc2VUZXh0OiAgJycsXG5cdFx0cmVzcG9uc2VYTUw6ICAgJycsXG5cdFx0cHJveHk6ICAgICAgICAgJycsXG5cdFx0cHJveHlUeXBlOiAgICAgJ0dFVCcsXG5cblx0XHRsYXN0TW9kaWZpZWQ6ICBudWxsLFxuXHRcdGV0YWc6ICAgICAgICAgICcnLFxuXHRcdGhlYWRlcnM6IHtcblx0XHRcdGV0YWc6ICdJSkZASCNAOTIzdWY4MDIzaEZPQEkjSCMnLFxuXHRcdFx0J2NvbnRlbnQtdHlwZScgOiAndGV4dC9wbGFpbidcblx0XHR9XG5cdH07XG5cblx0JC5tb2NramF4ID0gZnVuY3Rpb24oc2V0dGluZ3MpIHtcblx0XHR2YXIgaSA9IG1vY2tIYW5kbGVycy5sZW5ndGg7XG5cdFx0bW9ja0hhbmRsZXJzW2ldID0gc2V0dGluZ3M7XG5cdFx0cmV0dXJuIGk7XG5cdH07XG5cdCQubW9ja2pheENsZWFyID0gZnVuY3Rpb24oaSkge1xuXHRcdGlmICggYXJndW1lbnRzLmxlbmd0aCA9PSAxICkge1xuXHRcdFx0bW9ja0hhbmRsZXJzW2ldID0gbnVsbDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bW9ja0hhbmRsZXJzID0gW107XG5cdFx0fVxuXHRcdG1vY2tlZEFqYXhDYWxscyA9IFtdO1xuXHR9O1xuXHQkLm1vY2tqYXguaGFuZGxlciA9IGZ1bmN0aW9uKGkpIHtcblx0XHRpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT0gMSApIHtcblx0XHRcdHJldHVybiBtb2NrSGFuZGxlcnNbaV07XG5cdFx0fVxuXHR9O1xuXHQkLm1vY2tqYXgubW9ja2VkQWpheENhbGxzID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIG1vY2tlZEFqYXhDYWxscztcblx0fTtcbn0pKGpRdWVyeSk7IiwiLyoqXG4qICBBamF4IEF1dG9jb21wbGV0ZSBmb3IgalF1ZXJ5LCB2ZXJzaW9uICV2ZXJzaW9uJVxuKiAgKGMpIDIwMTUgVG9tYXMgS2lyZGFcbipcbiogIEFqYXggQXV0b2NvbXBsZXRlIGZvciBqUXVlcnkgaXMgZnJlZWx5IGRpc3RyaWJ1dGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIGFuIE1JVC1zdHlsZSBsaWNlbnNlLlxuKiAgRm9yIGRldGFpbHMsIHNlZSB0aGUgd2ViIHNpdGU6IGh0dHBzOi8vZ2l0aHViLmNvbS9kZXZicmlkZ2UvalF1ZXJ5LUF1dG9jb21wbGV0ZVxuKi9cblxuLypqc2xpbnQgIGJyb3dzZXI6IHRydWUsIHdoaXRlOiB0cnVlLCBwbHVzcGx1czogdHJ1ZSwgdmFyczogdHJ1ZSAqL1xuLypnbG9iYWwgZGVmaW5lLCB3aW5kb3csIGRvY3VtZW50LCBqUXVlcnksIGV4cG9ydHMsIHJlcXVpcmUgKi9cblxuLy8gRXhwb3NlIHBsdWdpbiBhcyBhbiBBTUQgbW9kdWxlIGlmIEFNRCBsb2FkZXIgaXMgcHJlc2VudDpcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5J10sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiByZXF1aXJlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIEJyb3dzZXJpZnlcbiAgICAgICAgZmFjdG9yeShyZXF1aXJlKCdqcXVlcnknKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgICAgIGZhY3RvcnkoalF1ZXJ5KTtcbiAgICB9XG59KGZ1bmN0aW9uICgkKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyXG4gICAgICAgIHV0aWxzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXNjYXBlUmVnRXhDaGFyczogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC9bXFwtXFxbXFxdXFwvXFx7XFx9XFwoXFwpXFwqXFwrXFw/XFwuXFxcXFxcXlxcJFxcfF0vZywgXCJcXFxcJCZcIik7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjcmVhdGVOb2RlOiBmdW5jdGlvbiAoY29udGFpbmVyQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgICAgICBkaXYuY2xhc3NOYW1lID0gY29udGFpbmVyQ2xhc3M7XG4gICAgICAgICAgICAgICAgICAgIGRpdi5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgICAgICAgICAgICAgIGRpdi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGl2O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0oKSksXG5cbiAgICAgICAga2V5cyA9IHtcbiAgICAgICAgICAgIEVTQzogMjcsXG4gICAgICAgICAgICBUQUI6IDksXG4gICAgICAgICAgICBSRVRVUk46IDEzLFxuICAgICAgICAgICAgTEVGVDogMzcsXG4gICAgICAgICAgICBVUDogMzgsXG4gICAgICAgICAgICBSSUdIVDogMzksXG4gICAgICAgICAgICBET1dOOiA0MFxuICAgICAgICB9O1xuXG4gICAgZnVuY3Rpb24gQXV0b2NvbXBsZXRlKGVsLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBub29wID0gZnVuY3Rpb24gKCkgeyB9LFxuICAgICAgICAgICAgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICBkZWZhdWx0cyA9IHtcbiAgICAgICAgICAgICAgICBhamF4U2V0dGluZ3M6IHt9LFxuICAgICAgICAgICAgICAgIGF1dG9TZWxlY3RGaXJzdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgYXBwZW5kVG86IGRvY3VtZW50LmJvZHksXG4gICAgICAgICAgICAgICAgc2VydmljZVVybDogbnVsbCxcbiAgICAgICAgICAgICAgICBsb29rdXA6IG51bGwsXG4gICAgICAgICAgICAgICAgb25TZWxlY3Q6IG51bGwsXG4gICAgICAgICAgICAgICAgd2lkdGg6ICdhdXRvJyxcbiAgICAgICAgICAgICAgICBtaW5DaGFyczogMSxcbiAgICAgICAgICAgICAgICBtYXhIZWlnaHQ6IDMwMCxcbiAgICAgICAgICAgICAgICBkZWZlclJlcXVlc3RCeTogMCxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHt9LFxuICAgICAgICAgICAgICAgIGZvcm1hdFJlc3VsdDogQXV0b2NvbXBsZXRlLmZvcm1hdFJlc3VsdCxcbiAgICAgICAgICAgICAgICBkZWxpbWl0ZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgekluZGV4OiA5OTk5LFxuICAgICAgICAgICAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgICAgICAgICAgIG5vQ2FjaGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG9uU2VhcmNoU3RhcnQ6IG5vb3AsXG4gICAgICAgICAgICAgICAgb25TZWFyY2hDb21wbGV0ZTogbm9vcCxcbiAgICAgICAgICAgICAgICBvblNlYXJjaEVycm9yOiBub29wLFxuICAgICAgICAgICAgICAgIHByZXNlcnZlSW5wdXQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lckNsYXNzOiAnYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb25zJyxcbiAgICAgICAgICAgICAgICB0YWJEaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgICAgICBjdXJyZW50UmVxdWVzdDogbnVsbCxcbiAgICAgICAgICAgICAgICB0cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0OiB0cnVlLFxuICAgICAgICAgICAgICAgIHByZXZlbnRCYWRRdWVyaWVzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGxvb2t1cEZpbHRlcjogZnVuY3Rpb24gKHN1Z2dlc3Rpb24sIG9yaWdpbmFsUXVlcnksIHF1ZXJ5TG93ZXJDYXNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdWdnZXN0aW9uLnZhbHVlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxdWVyeUxvd2VyQ2FzZSkgIT09IC0xO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcGFyYW1OYW1lOiAncXVlcnknLFxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybVJlc3VsdDogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0eXBlb2YgcmVzcG9uc2UgPT09ICdzdHJpbmcnID8gJC5wYXJzZUpTT04ocmVzcG9uc2UpIDogcmVzcG9uc2U7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzaG93Tm9TdWdnZXN0aW9uTm90aWNlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBub1N1Z2dlc3Rpb25Ob3RpY2U6ICdObyByZXN1bHRzJyxcbiAgICAgICAgICAgICAgICBvcmllbnRhdGlvbjogJ2JvdHRvbScsXG4gICAgICAgICAgICAgICAgZm9yY2VGaXhQb3NpdGlvbjogZmFsc2VcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgLy8gU2hhcmVkIHZhcmlhYmxlczpcbiAgICAgICAgdGhhdC5lbGVtZW50ID0gZWw7XG4gICAgICAgIHRoYXQuZWwgPSAkKGVsKTtcbiAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IFtdO1xuICAgICAgICB0aGF0LmJhZFF1ZXJpZXMgPSBbXTtcbiAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XG4gICAgICAgIHRoYXQuY3VycmVudFZhbHVlID0gdGhhdC5lbGVtZW50LnZhbHVlO1xuICAgICAgICB0aGF0LmludGVydmFsSWQgPSAwO1xuICAgICAgICB0aGF0LmNhY2hlZFJlc3BvbnNlID0ge307XG4gICAgICAgIHRoYXQub25DaGFuZ2VJbnRlcnZhbCA9IG51bGw7XG4gICAgICAgIHRoYXQub25DaGFuZ2UgPSBudWxsO1xuICAgICAgICB0aGF0LmlzTG9jYWwgPSBmYWxzZTtcbiAgICAgICAgdGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciA9IG51bGw7XG4gICAgICAgIHRoYXQubm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9IG51bGw7XG4gICAgICAgIHRoYXQub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBkZWZhdWx0cywgb3B0aW9ucyk7XG4gICAgICAgIHRoYXQuY2xhc3NlcyA9IHtcbiAgICAgICAgICAgIHNlbGVjdGVkOiAnYXV0b2NvbXBsZXRlLXNlbGVjdGVkJyxcbiAgICAgICAgICAgIHN1Z2dlc3Rpb246ICdhdXRvY29tcGxldGUtc3VnZ2VzdGlvbidcbiAgICAgICAgfTtcbiAgICAgICAgdGhhdC5oaW50ID0gbnVsbDtcbiAgICAgICAgdGhhdC5oaW50VmFsdWUgPSAnJztcbiAgICAgICAgdGhhdC5zZWxlY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIC8vIEluaXRpYWxpemUgYW5kIHNldCBvcHRpb25zOlxuICAgICAgICB0aGF0LmluaXRpYWxpemUoKTtcbiAgICAgICAgdGhhdC5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIEF1dG9jb21wbGV0ZS51dGlscyA9IHV0aWxzO1xuXG4gICAgJC5BdXRvY29tcGxldGUgPSBBdXRvY29tcGxldGU7XG5cbiAgICBBdXRvY29tcGxldGUuZm9ybWF0UmVzdWx0ID0gZnVuY3Rpb24gKHN1Z2dlc3Rpb24sIGN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAvLyBEbyBub3QgcmVwbGFjZSBhbnl0aGluZyBpZiB0aGVyZSBjdXJyZW50IHZhbHVlIGlzIGVtcHR5XG4gICAgICAgIGlmICghY3VycmVudFZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbi52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIHBhdHRlcm4gPSAnKCcgKyB1dGlscy5lc2NhcGVSZWdFeENoYXJzKGN1cnJlbnRWYWx1ZSkgKyAnKSc7XG5cbiAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb24udmFsdWVcbiAgICAgICAgICAgIC5yZXBsYWNlKG5ldyBSZWdFeHAocGF0dGVybiwgJ2dpJyksICc8c3Ryb25nPiQxPFxcL3N0cm9uZz4nKVxuICAgICAgICAgICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8mbHQ7KFxcLz9zdHJvbmcpJmd0Oy9nLCAnPCQxPicpO1xuICAgIH07XG5cbiAgICBBdXRvY29tcGxldGUucHJvdG90eXBlID0ge1xuXG4gICAgICAgIGtpbGxlckZuOiBudWxsLFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9uU2VsZWN0b3IgPSAnLicgKyB0aGF0LmNsYXNzZXMuc3VnZ2VzdGlvbixcbiAgICAgICAgICAgICAgICBzZWxlY3RlZCA9IHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lcjtcblxuICAgICAgICAgICAgLy8gUmVtb3ZlIGF1dG9jb21wbGV0ZSBhdHRyaWJ1dGUgdG8gcHJldmVudCBuYXRpdmUgc3VnZ2VzdGlvbnM6XG4gICAgICAgICAgICB0aGF0LmVsZW1lbnQuc2V0QXR0cmlidXRlKCdhdXRvY29tcGxldGUnLCAnb2ZmJyk7XG5cbiAgICAgICAgICAgIHRoYXQua2lsbGVyRm4gPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGlmICgkKGUudGFyZ2V0KS5jbG9zZXN0KCcuJyArIHRoYXQub3B0aW9ucy5jb250YWluZXJDbGFzcykubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQua2lsbFN1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZGlzYWJsZUtpbGxlckZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gaHRtbCgpIGRlYWxzIHdpdGggbWFueSB0eXBlczogaHRtbFN0cmluZyBvciBFbGVtZW50IG9yIEFycmF5IG9yIGpRdWVyeVxuICAgICAgICAgICAgdGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gJCgnPGRpdiBjbGFzcz1cImF1dG9jb21wbGV0ZS1uby1zdWdnZXN0aW9uXCI+PC9kaXY+JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5odG1sKHRoaXMub3B0aW9ucy5ub1N1Z2dlc3Rpb25Ob3RpY2UpLmdldCgwKTtcblxuICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciA9IEF1dG9jb21wbGV0ZS51dGlscy5jcmVhdGVOb2RlKG9wdGlvbnMuY29udGFpbmVyQ2xhc3MpO1xuXG4gICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpO1xuXG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kVG8ob3B0aW9ucy5hcHBlbmRUbyk7XG5cbiAgICAgICAgICAgIC8vIE9ubHkgc2V0IHdpZHRoIGlmIGl0IHdhcyBwcm92aWRlZDpcbiAgICAgICAgICAgIGlmIChvcHRpb25zLndpZHRoICE9PSAnYXV0bycpIHtcbiAgICAgICAgICAgICAgICBjb250YWluZXIud2lkdGgob3B0aW9ucy53aWR0aCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIExpc3RlbiBmb3IgbW91c2Ugb3ZlciBldmVudCBvbiBzdWdnZXN0aW9ucyBsaXN0OlxuICAgICAgICAgICAgY29udGFpbmVyLm9uKCdtb3VzZW92ZXIuYXV0b2NvbXBsZXRlJywgc3VnZ2VzdGlvblNlbGVjdG9yLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5hY3RpdmF0ZSgkKHRoaXMpLmRhdGEoJ2luZGV4JykpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIERlc2VsZWN0IGFjdGl2ZSBlbGVtZW50IHdoZW4gbW91c2UgbGVhdmVzIHN1Z2dlc3Rpb25zIGNvbnRhaW5lcjpcbiAgICAgICAgICAgIGNvbnRhaW5lci5vbignbW91c2VvdXQuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jaGlsZHJlbignLicgKyBzZWxlY3RlZCkucmVtb3ZlQ2xhc3Moc2VsZWN0ZWQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIExpc3RlbiBmb3IgY2xpY2sgZXZlbnQgb24gc3VnZ2VzdGlvbnMgbGlzdDpcbiAgICAgICAgICAgIGNvbnRhaW5lci5vbignY2xpY2suYXV0b2NvbXBsZXRlJywgc3VnZ2VzdGlvblNlbGVjdG9yLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QoJCh0aGlzKS5kYXRhKCdpbmRleCcpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uQ2FwdHVyZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhhdC52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS5hdXRvY29tcGxldGUnLCB0aGF0LmZpeFBvc2l0aW9uQ2FwdHVyZSk7XG5cbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2tleWRvd24uYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVByZXNzKGUpOyB9KTtcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2tleXVwLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlVcChlKTsgfSk7XG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdibHVyLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uICgpIHsgdGhhdC5vbkJsdXIoKTsgfSk7XG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdmb2N1cy5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoKSB7IHRoYXQub25Gb2N1cygpOyB9KTtcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2NoYW5nZS5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5VXAoZSk7IH0pO1xuICAgICAgICAgICAgdGhhdC5lbC5vbignaW5wdXQuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVVwKGUpOyB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkZvY3VzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuZWwudmFsKCkubGVuZ3RoID49IHRoYXQub3B0aW9ucy5taW5DaGFycykge1xuICAgICAgICAgICAgICAgIHRoYXQub25WYWx1ZUNoYW5nZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uQmx1cjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5lbmFibGVLaWxsZXJGbigpO1xuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgYWJvcnRBamF4OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICBpZiAodGhhdC5jdXJyZW50UmVxdWVzdCkge1xuICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0ID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXRPcHRpb25zOiBmdW5jdGlvbiAoc3VwcGxpZWRPcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucztcblxuICAgICAgICAgICAgJC5leHRlbmQob3B0aW9ucywgc3VwcGxpZWRPcHRpb25zKTtcblxuICAgICAgICAgICAgdGhhdC5pc0xvY2FsID0gJC5pc0FycmF5KG9wdGlvbnMubG9va3VwKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuaXNMb2NhbCkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMubG9va3VwID0gdGhhdC52ZXJpZnlTdWdnZXN0aW9uc0Zvcm1hdChvcHRpb25zLmxvb2t1cCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9wdGlvbnMub3JpZW50YXRpb24gPSB0aGF0LnZhbGlkYXRlT3JpZW50YXRpb24ob3B0aW9ucy5vcmllbnRhdGlvbiwgJ2JvdHRvbScpO1xuXG4gICAgICAgICAgICAvLyBBZGp1c3QgaGVpZ2h0LCB3aWR0aCBhbmQgei1pbmRleDpcbiAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuY3NzKHtcbiAgICAgICAgICAgICAgICAnbWF4LWhlaWdodCc6IG9wdGlvbnMubWF4SGVpZ2h0ICsgJ3B4JyxcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiBvcHRpb25zLndpZHRoICsgJ3B4JyxcbiAgICAgICAgICAgICAgICAnei1pbmRleCc6IG9wdGlvbnMuekluZGV4XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuXG4gICAgICAgIGNsZWFyQ2FjaGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuY2FjaGVkUmVzcG9uc2UgPSB7fTtcbiAgICAgICAgICAgIHRoaXMuYmFkUXVlcmllcyA9IFtdO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFyQ2FjaGUoKTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFZhbHVlID0gJyc7XG4gICAgICAgICAgICB0aGlzLnN1Z2dlc3Rpb25zID0gW107XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzYWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdGhhdC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XG4gICAgICAgICAgICB0aGF0LmFib3J0QWpheCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVuYWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZpeFBvc2l0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBVc2Ugb25seSB3aGVuIGNvbnRhaW5lciBoYXMgYWxyZWFkeSBpdHMgY29udGVudFxuXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgJGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXG4gICAgICAgICAgICAgICAgY29udGFpbmVyUGFyZW50ID0gJGNvbnRhaW5lci5wYXJlbnQoKS5nZXQoMCk7XG4gICAgICAgICAgICAvLyBGaXggcG9zaXRpb24gYXV0b21hdGljYWxseSB3aGVuIGFwcGVuZGVkIHRvIGJvZHkuXG4gICAgICAgICAgICAvLyBJbiBvdGhlciBjYXNlcyBmb3JjZSBwYXJhbWV0ZXIgbXVzdCBiZSBnaXZlbi5cbiAgICAgICAgICAgIGlmIChjb250YWluZXJQYXJlbnQgIT09IGRvY3VtZW50LmJvZHkgJiYgIXRoYXQub3B0aW9ucy5mb3JjZUZpeFBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDaG9vc2Ugb3JpZW50YXRpb25cbiAgICAgICAgICAgIHZhciBvcmllbnRhdGlvbiA9IHRoYXQub3B0aW9ucy5vcmllbnRhdGlvbixcbiAgICAgICAgICAgICAgICBjb250YWluZXJIZWlnaHQgPSAkY29udGFpbmVyLm91dGVySGVpZ2h0KCksXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gdGhhdC5lbC5vdXRlckhlaWdodCgpLFxuICAgICAgICAgICAgICAgIG9mZnNldCA9IHRoYXQuZWwub2Zmc2V0KCksXG4gICAgICAgICAgICAgICAgc3R5bGVzID0geyAndG9wJzogb2Zmc2V0LnRvcCwgJ2xlZnQnOiBvZmZzZXQubGVmdCB9O1xuXG4gICAgICAgICAgICBpZiAob3JpZW50YXRpb24gPT09ICdhdXRvJykge1xuICAgICAgICAgICAgICAgIHZhciB2aWV3UG9ydEhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKSxcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsVG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpLFxuICAgICAgICAgICAgICAgICAgICB0b3BPdmVyZmxvdyA9IC1zY3JvbGxUb3AgKyBvZmZzZXQudG9wIC0gY29udGFpbmVySGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICBib3R0b21PdmVyZmxvdyA9IHNjcm9sbFRvcCArIHZpZXdQb3J0SGVpZ2h0IC0gKG9mZnNldC50b3AgKyBoZWlnaHQgKyBjb250YWluZXJIZWlnaHQpO1xuXG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb24gPSAoTWF0aC5tYXgodG9wT3ZlcmZsb3csIGJvdHRvbU92ZXJmbG93KSA9PT0gdG9wT3ZlcmZsb3cpID8gJ3RvcCcgOiAnYm90dG9tJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG9yaWVudGF0aW9uID09PSAndG9wJykge1xuICAgICAgICAgICAgICAgIHN0eWxlcy50b3AgKz0gLWNvbnRhaW5lckhlaWdodDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3R5bGVzLnRvcCArPSBoZWlnaHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIElmIGNvbnRhaW5lciBpcyBub3QgcG9zaXRpb25lZCB0byBib2R5LFxuICAgICAgICAgICAgLy8gY29ycmVjdCBpdHMgcG9zaXRpb24gdXNpbmcgb2Zmc2V0IHBhcmVudCBvZmZzZXRcbiAgICAgICAgICAgIGlmKGNvbnRhaW5lclBhcmVudCAhPT0gZG9jdW1lbnQuYm9keSkge1xuICAgICAgICAgICAgICAgIHZhciBvcGFjaXR5ID0gJGNvbnRhaW5lci5jc3MoJ29wYWNpdHknKSxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50T2Zmc2V0RGlmZjtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoYXQudmlzaWJsZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmNzcygnb3BhY2l0eScsIDApLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcGFyZW50T2Zmc2V0RGlmZiA9ICRjb250YWluZXIub2Zmc2V0UGFyZW50KCkub2Zmc2V0KCk7XG4gICAgICAgICAgICAgICAgc3R5bGVzLnRvcCAtPSBwYXJlbnRPZmZzZXREaWZmLnRvcDtcbiAgICAgICAgICAgICAgICBzdHlsZXMubGVmdCAtPSBwYXJlbnRPZmZzZXREaWZmLmxlZnQ7XG5cbiAgICAgICAgICAgICAgICBpZiAoIXRoYXQudmlzaWJsZSl7XG4gICAgICAgICAgICAgICAgICAgICRjb250YWluZXIuY3NzKCdvcGFjaXR5Jywgb3BhY2l0eSkuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gLTJweCB0byBhY2NvdW50IGZvciBzdWdnZXN0aW9ucyBib3JkZXIuXG4gICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLndpZHRoID09PSAnYXV0bycpIHtcbiAgICAgICAgICAgICAgICBzdHlsZXMud2lkdGggPSAodGhhdC5lbC5vdXRlcldpZHRoKCkgLSAyKSArICdweCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICRjb250YWluZXIuY3NzKHN0eWxlcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5hYmxlS2lsbGVyRm46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljay5hdXRvY29tcGxldGUnLCB0aGF0LmtpbGxlckZuKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlS2lsbGVyRm46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suYXV0b2NvbXBsZXRlJywgdGhhdC5raWxsZXJGbik7XG4gICAgICAgIH0sXG5cbiAgICAgICAga2lsbFN1Z2dlc3Rpb25zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICB0aGF0LnN0b3BLaWxsU3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgICAgIHRoYXQuaW50ZXJ2YWxJZCA9IHdpbmRvdy5zZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoYXQudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGF0LnN0b3BLaWxsU3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgICAgIH0sIDUwKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzdG9wS2lsbFN1Z2dlc3Rpb25zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsSWQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzQ3Vyc29yQXRFbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICB2YWxMZW5ndGggPSB0aGF0LmVsLnZhbCgpLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25TdGFydCA9IHRoYXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydCxcbiAgICAgICAgICAgICAgICByYW5nZTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzZWxlY3Rpb25TdGFydCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZWN0aW9uU3RhcnQgPT09IHZhbExlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5zZWxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICByYW5nZSA9IGRvY3VtZW50LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSgpO1xuICAgICAgICAgICAgICAgIHJhbmdlLm1vdmVTdGFydCgnY2hhcmFjdGVyJywgLXZhbExlbmd0aCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbExlbmd0aCA9PT0gcmFuZ2UudGV4dC5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbktleVByZXNzOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICAvLyBJZiBzdWdnZXN0aW9ucyBhcmUgaGlkZGVuIGFuZCB1c2VyIHByZXNzZXMgYXJyb3cgZG93biwgZGlzcGxheSBzdWdnZXN0aW9uczpcbiAgICAgICAgICAgIGlmICghdGhhdC5kaXNhYmxlZCAmJiAhdGhhdC52aXNpYmxlICYmIGUud2hpY2ggPT09IGtleXMuRE9XTiAmJiB0aGF0LmN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoYXQuZGlzYWJsZWQgfHwgIXRoYXQudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3dpdGNoIChlLndoaWNoKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLkVTQzpcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlJJR0hUOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5oaW50ICYmIHRoYXQub3B0aW9ucy5vbkhpbnQgJiYgdGhhdC5pc0N1cnNvckF0RW5kKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0SGludCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5UQUI6XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LmhpbnQgJiYgdGhhdC5vcHRpb25zLm9uSGludCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RIaW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KHRoYXQuc2VsZWN0ZWRJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMudGFiRGlzYWJsZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlJFVFVSTjpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KHRoYXQuc2VsZWN0ZWRJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5VUDpcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5tb3ZlVXAoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLkRPV046XG4gICAgICAgICAgICAgICAgICAgIHRoYXQubW92ZURvd24oKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDYW5jZWwgZXZlbnQgaWYgZnVuY3Rpb24gZGlkIG5vdCByZXR1cm46XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uS2V5VXA6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmRpc2FibGVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzd2l0Y2ggKGUud2hpY2gpIHtcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuVVA6XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLkRPV046XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5jdXJyZW50VmFsdWUgIT09IHRoYXQuZWwudmFsKCkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmZpbmRCZXN0SGludCgpO1xuICAgICAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMuZGVmZXJSZXF1ZXN0QnkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIERlZmVyIGxvb2t1cCBpbiBjYXNlIHdoZW4gdmFsdWUgY2hhbmdlcyB2ZXJ5IHF1aWNrbHk6XG4gICAgICAgICAgICAgICAgICAgIHRoYXQub25DaGFuZ2VJbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQub25WYWx1ZUNoYW5nZSgpO1xuICAgICAgICAgICAgICAgICAgICB9LCB0aGF0Lm9wdGlvbnMuZGVmZXJSZXF1ZXN0QnkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQub25WYWx1ZUNoYW5nZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvblZhbHVlQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoYXQuZWwudmFsKCksXG4gICAgICAgICAgICAgICAgcXVlcnkgPSB0aGF0LmdldFF1ZXJ5KHZhbHVlKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0aW9uICYmIHRoYXQuY3VycmVudFZhbHVlICE9PSBxdWVyeSkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uID0gbnVsbDtcbiAgICAgICAgICAgICAgICAob3B0aW9ucy5vbkludmFsaWRhdGVTZWxlY3Rpb24gfHwgJC5ub29wKS5jYWxsKHRoYXQuZWxlbWVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcbiAgICAgICAgICAgIHRoYXQuY3VycmVudFZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgZXhpc3Rpbmcgc3VnZ2VzdGlvbiBmb3IgdGhlIG1hdGNoIGJlZm9yZSBwcm9jZWVkaW5nOlxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dCAmJiB0aGF0LmlzRXhhY3RNYXRjaChxdWVyeSkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCgwKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChxdWVyeS5sZW5ndGggPCBvcHRpb25zLm1pbkNoYXJzKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoYXQuZ2V0U3VnZ2VzdGlvbnMocXVlcnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGlzRXhhY3RNYXRjaDogZnVuY3Rpb24gKHF1ZXJ5KSB7XG4gICAgICAgICAgICB2YXIgc3VnZ2VzdGlvbnMgPSB0aGlzLnN1Z2dlc3Rpb25zO1xuXG4gICAgICAgICAgICByZXR1cm4gKHN1Z2dlc3Rpb25zLmxlbmd0aCA9PT0gMSAmJiBzdWdnZXN0aW9uc1swXS52YWx1ZS50b0xvd2VyQ2FzZSgpID09PSBxdWVyeS50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRRdWVyeTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgZGVsaW1pdGVyID0gdGhpcy5vcHRpb25zLmRlbGltaXRlcixcbiAgICAgICAgICAgICAgICBwYXJ0cztcblxuICAgICAgICAgICAgaWYgKCFkZWxpbWl0ZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJ0cyA9IHZhbHVlLnNwbGl0KGRlbGltaXRlcik7XG4gICAgICAgICAgICByZXR1cm4gJC50cmltKHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTdWdnZXN0aW9uc0xvY2FsOiBmdW5jdGlvbiAocXVlcnkpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIHF1ZXJ5TG93ZXJDYXNlID0gcXVlcnkudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgICAgICAgICBmaWx0ZXIgPSBvcHRpb25zLmxvb2t1cEZpbHRlcixcbiAgICAgICAgICAgICAgICBsaW1pdCA9IHBhcnNlSW50KG9wdGlvbnMubG9va3VwTGltaXQsIDEwKSxcbiAgICAgICAgICAgICAgICBkYXRhO1xuXG4gICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb25zOiAkLmdyZXAob3B0aW9ucy5sb29rdXAsIGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWx0ZXIoc3VnZ2VzdGlvbiwgcXVlcnksIHF1ZXJ5TG93ZXJDYXNlKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKGxpbWl0ICYmIGRhdGEuc3VnZ2VzdGlvbnMubGVuZ3RoID4gbGltaXQpIHtcbiAgICAgICAgICAgICAgICBkYXRhLnN1Z2dlc3Rpb25zID0gZGF0YS5zdWdnZXN0aW9ucy5zbGljZSgwLCBsaW1pdCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFN1Z2dlc3Rpb25zOiBmdW5jdGlvbiAocSkge1xuICAgICAgICAgICAgdmFyIHJlc3BvbnNlLFxuICAgICAgICAgICAgICAgIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgc2VydmljZVVybCA9IG9wdGlvbnMuc2VydmljZVVybCxcbiAgICAgICAgICAgICAgICBwYXJhbXMsXG4gICAgICAgICAgICAgICAgY2FjaGVLZXksXG4gICAgICAgICAgICAgICAgYWpheFNldHRpbmdzO1xuXG4gICAgICAgICAgICBvcHRpb25zLnBhcmFtc1tvcHRpb25zLnBhcmFtTmFtZV0gPSBxO1xuICAgICAgICAgICAgcGFyYW1zID0gb3B0aW9ucy5pZ25vcmVQYXJhbXMgPyBudWxsIDogb3B0aW9ucy5wYXJhbXM7XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLm9uU2VhcmNoU3RhcnQuY2FsbCh0aGF0LmVsZW1lbnQsIG9wdGlvbnMucGFyYW1zKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24ob3B0aW9ucy5sb29rdXApKXtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmxvb2t1cChxLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gZGF0YS5zdWdnZXN0aW9ucztcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgZGF0YS5zdWdnZXN0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhhdC5pc0xvY2FsKSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB0aGF0LmdldFN1Z2dlc3Rpb25zTG9jYWwocSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24oc2VydmljZVVybCkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZVVybCA9IHNlcnZpY2VVcmwuY2FsbCh0aGF0LmVsZW1lbnQsIHEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYWNoZUtleSA9IHNlcnZpY2VVcmwgKyAnPycgKyAkLnBhcmFtKHBhcmFtcyB8fCB7fSk7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB0aGF0LmNhY2hlZFJlc3BvbnNlW2NhY2hlS2V5XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlICYmICQuaXNBcnJheShyZXNwb25zZS5zdWdnZXN0aW9ucykpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gcmVzcG9uc2Uuc3VnZ2VzdGlvbnM7XG4gICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaENvbXBsZXRlLmNhbGwodGhhdC5lbGVtZW50LCBxLCByZXNwb25zZS5zdWdnZXN0aW9ucyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF0aGF0LmlzQmFkUXVlcnkocSkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmFib3J0QWpheCgpO1xuXG4gICAgICAgICAgICAgICAgYWpheFNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICB1cmw6IHNlcnZpY2VVcmwsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHBhcmFtcyxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogb3B0aW9ucy50eXBlLFxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogb3B0aW9ucy5kYXRhVHlwZVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAkLmV4dGVuZChhamF4U2V0dGluZ3MsIG9wdGlvbnMuYWpheFNldHRpbmdzKTtcblxuICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QgPSAkLmFqYXgoYWpheFNldHRpbmdzKS5kb25lKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBvcHRpb25zLnRyYW5zZm9ybVJlc3VsdChkYXRhLCBxKTtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5wcm9jZXNzUmVzcG9uc2UocmVzdWx0LCBxLCBjYWNoZUtleSk7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgcmVzdWx0LnN1Z2dlc3Rpb25zKTtcbiAgICAgICAgICAgICAgICB9KS5mYWlsKGZ1bmN0aW9uIChqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pIHtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaEVycm9yLmNhbGwodGhhdC5lbGVtZW50LCBxLCBqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBpc0JhZFF1ZXJ5OiBmdW5jdGlvbiAocSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMucHJldmVudEJhZFF1ZXJpZXMpe1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGJhZFF1ZXJpZXMgPSB0aGlzLmJhZFF1ZXJpZXMsXG4gICAgICAgICAgICAgICAgaSA9IGJhZFF1ZXJpZXMubGVuZ3RoO1xuXG4gICAgICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgICAgICAgaWYgKHEuaW5kZXhPZihiYWRRdWVyaWVzW2ldKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBoaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbih0aGF0Lm9wdGlvbnMub25IaWRlKSAmJiB0aGF0LnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICB0aGF0Lm9wdGlvbnMub25IaWRlLmNhbGwodGhhdC5lbGVtZW50LCBjb250YWluZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xuICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5oaWRlKCk7XG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQobnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3VnZ2VzdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3VnZ2VzdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zaG93Tm9TdWdnZXN0aW9uTm90aWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm9TdWdnZXN0aW9ucygpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIGdyb3VwQnkgPSBvcHRpb25zLmdyb3VwQnksXG4gICAgICAgICAgICAgICAgZm9ybWF0UmVzdWx0ID0gb3B0aW9ucy5mb3JtYXRSZXN1bHQsXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGF0LmdldFF1ZXJ5KHRoYXQuY3VycmVudFZhbHVlKSxcbiAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSB0aGF0LmNsYXNzZXMuc3VnZ2VzdGlvbixcbiAgICAgICAgICAgICAgICBjbGFzc1NlbGVjdGVkID0gdGhhdC5jbGFzc2VzLnNlbGVjdGVkLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXG4gICAgICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQodGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyKSxcbiAgICAgICAgICAgICAgICBiZWZvcmVSZW5kZXIgPSBvcHRpb25zLmJlZm9yZVJlbmRlcixcbiAgICAgICAgICAgICAgICBodG1sID0gJycsXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgZm9ybWF0R3JvdXAgPSBmdW5jdGlvbiAoc3VnZ2VzdGlvbiwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50Q2F0ZWdvcnkgPSBzdWdnZXN0aW9uLmRhdGFbZ3JvdXBCeV07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYXRlZ29yeSA9PT0gY3VycmVudENhdGVnb3J5KXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5ID0gY3VycmVudENhdGVnb3J5O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJhdXRvY29tcGxldGUtZ3JvdXBcIj48c3Ryb25nPicgKyBjYXRlZ29yeSArICc8L3N0cm9uZz48L2Rpdj4nO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy50cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0ICYmIHRoYXQuaXNFeGFjdE1hdGNoKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KDApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQnVpbGQgc3VnZ2VzdGlvbnMgaW5uZXIgSFRNTDpcbiAgICAgICAgICAgICQuZWFjaCh0aGF0LnN1Z2dlc3Rpb25zLCBmdW5jdGlvbiAoaSwgc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgICAgIGlmIChncm91cEJ5KXtcbiAgICAgICAgICAgICAgICAgICAgaHRtbCArPSBmb3JtYXRHcm91cChzdWdnZXN0aW9uLCB2YWx1ZSwgaSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cIicgKyBjbGFzc05hbWUgKyAnXCIgZGF0YS1pbmRleD1cIicgKyBpICsgJ1wiPicgKyBmb3JtYXRSZXN1bHQoc3VnZ2VzdGlvbiwgdmFsdWUpICsgJzwvZGl2Pic7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5hZGp1c3RDb250YWluZXJXaWR0aCgpO1xuXG4gICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyLmRldGFjaCgpO1xuICAgICAgICAgICAgY29udGFpbmVyLmh0bWwoaHRtbCk7XG5cbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24oYmVmb3JlUmVuZGVyKSkge1xuICAgICAgICAgICAgICAgIGJlZm9yZVJlbmRlci5jYWxsKHRoYXQuZWxlbWVudCwgY29udGFpbmVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xuICAgICAgICAgICAgY29udGFpbmVyLnNob3coKTtcblxuICAgICAgICAgICAgLy8gU2VsZWN0IGZpcnN0IHZhbHVlIGJ5IGRlZmF1bHQ6XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5hdXRvU2VsZWN0Rmlyc3QpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAwO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5zY3JvbGxUb3AoMCk7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmNoaWxkcmVuKCcuJyArIGNsYXNzTmFtZSkuZmlyc3QoKS5hZGRDbGFzcyhjbGFzc1NlbGVjdGVkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoYXQuZmluZEJlc3RIaW50KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbm9TdWdnZXN0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxuICAgICAgICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gJCh0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIpO1xuXG4gICAgICAgICAgICB0aGlzLmFkanVzdENvbnRhaW5lcldpZHRoKCk7XG5cbiAgICAgICAgICAgIC8vIFNvbWUgZXhwbGljaXQgc3RlcHMuIEJlIGNhcmVmdWwgaGVyZSBhcyBpdCBlYXN5IHRvIGdldFxuICAgICAgICAgICAgLy8gbm9TdWdnZXN0aW9uc0NvbnRhaW5lciByZW1vdmVkIGZyb20gRE9NIGlmIG5vdCBkZXRhY2hlZCBwcm9wZXJseS5cbiAgICAgICAgICAgIG5vU3VnZ2VzdGlvbnNDb250YWluZXIuZGV0YWNoKCk7XG4gICAgICAgICAgICBjb250YWluZXIuZW1wdHkoKTsgLy8gY2xlYW4gc3VnZ2VzdGlvbnMgaWYgYW55XG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kKG5vU3VnZ2VzdGlvbnNDb250YWluZXIpO1xuXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XG5cbiAgICAgICAgICAgIGNvbnRhaW5lci5zaG93KCk7XG4gICAgICAgICAgICB0aGF0LnZpc2libGUgPSB0cnVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFkanVzdENvbnRhaW5lcldpZHRoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcik7XG5cbiAgICAgICAgICAgIC8vIElmIHdpZHRoIGlzIGF1dG8sIGFkanVzdCB3aWR0aCBiZWZvcmUgZGlzcGxheWluZyBzdWdnZXN0aW9ucyxcbiAgICAgICAgICAgIC8vIGJlY2F1c2UgaWYgaW5zdGFuY2Ugd2FzIGNyZWF0ZWQgYmVmb3JlIGlucHV0IGhhZCB3aWR0aCwgaXQgd2lsbCBiZSB6ZXJvLlxuICAgICAgICAgICAgLy8gQWxzbyBpdCBhZGp1c3RzIGlmIGlucHV0IHdpZHRoIGhhcyBjaGFuZ2VkLlxuICAgICAgICAgICAgLy8gLTJweCB0byBhY2NvdW50IGZvciBzdWdnZXN0aW9ucyBib3JkZXIuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy53aWR0aCA9PT0gJ2F1dG8nKSB7XG4gICAgICAgICAgICAgICAgd2lkdGggPSB0aGF0LmVsLm91dGVyV2lkdGgoKSAtIDI7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLndpZHRoKHdpZHRoID4gMCA/IHdpZHRoIDogMzAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBmaW5kQmVzdEhpbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoYXQuZWwudmFsKCkudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgICAgICAgICBiZXN0TWF0Y2ggPSBudWxsO1xuXG4gICAgICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkLmVhY2godGhhdC5zdWdnZXN0aW9ucywgZnVuY3Rpb24gKGksIHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgZm91bmRNYXRjaCA9IHN1Z2dlc3Rpb24udmFsdWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHZhbHVlKSA9PT0gMDtcbiAgICAgICAgICAgICAgICBpZiAoZm91bmRNYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICBiZXN0TWF0Y2ggPSBzdWdnZXN0aW9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gIWZvdW5kTWF0Y2g7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KGJlc3RNYXRjaCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2lnbmFsSGludDogZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBoaW50VmFsdWUgPSAnJyxcbiAgICAgICAgICAgICAgICB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIGlmIChzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgaGludFZhbHVlID0gdGhhdC5jdXJyZW50VmFsdWUgKyBzdWdnZXN0aW9uLnZhbHVlLnN1YnN0cih0aGF0LmN1cnJlbnRWYWx1ZS5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoYXQuaGludFZhbHVlICE9PSBoaW50VmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmhpbnRWYWx1ZSA9IGhpbnRWYWx1ZTtcbiAgICAgICAgICAgICAgICB0aGF0LmhpbnQgPSBzdWdnZXN0aW9uO1xuICAgICAgICAgICAgICAgICh0aGlzLm9wdGlvbnMub25IaW50IHx8ICQubm9vcCkoaGludFZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB2ZXJpZnlTdWdnZXN0aW9uc0Zvcm1hdDogZnVuY3Rpb24gKHN1Z2dlc3Rpb25zKSB7XG4gICAgICAgICAgICAvLyBJZiBzdWdnZXN0aW9ucyBpcyBzdHJpbmcgYXJyYXksIGNvbnZlcnQgdGhlbSB0byBzdXBwb3J0ZWQgZm9ybWF0OlxuICAgICAgICAgICAgaWYgKHN1Z2dlc3Rpb25zLmxlbmd0aCAmJiB0eXBlb2Ygc3VnZ2VzdGlvbnNbMF0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICQubWFwKHN1Z2dlc3Rpb25zLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IHZhbHVlLCBkYXRhOiBudWxsIH07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzdWdnZXN0aW9ucztcbiAgICAgICAgfSxcblxuICAgICAgICB2YWxpZGF0ZU9yaWVudGF0aW9uOiBmdW5jdGlvbihvcmllbnRhdGlvbiwgZmFsbGJhY2spIHtcbiAgICAgICAgICAgIG9yaWVudGF0aW9uID0gJC50cmltKG9yaWVudGF0aW9uIHx8ICcnKS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgICAgICBpZigkLmluQXJyYXkob3JpZW50YXRpb24sIFsnYXV0bycsICdib3R0b20nLCAndG9wJ10pID09PSAtMSl7XG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb24gPSBmYWxsYmFjaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG9yaWVudGF0aW9uO1xuICAgICAgICB9LFxuXG4gICAgICAgIHByb2Nlc3NSZXNwb25zZTogZnVuY3Rpb24gKHJlc3VsdCwgb3JpZ2luYWxRdWVyeSwgY2FjaGVLZXkpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zO1xuXG4gICAgICAgICAgICByZXN1bHQuc3VnZ2VzdGlvbnMgPSB0aGF0LnZlcmlmeVN1Z2dlc3Rpb25zRm9ybWF0KHJlc3VsdC5zdWdnZXN0aW9ucyk7XG5cbiAgICAgICAgICAgIC8vIENhY2hlIHJlc3VsdHMgaWYgY2FjaGUgaXMgbm90IGRpc2FibGVkOlxuICAgICAgICAgICAgaWYgKCFvcHRpb25zLm5vQ2FjaGUpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmNhY2hlZFJlc3BvbnNlW2NhY2hlS2V5XSA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5wcmV2ZW50QmFkUXVlcmllcyAmJiByZXN1bHQuc3VnZ2VzdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuYmFkUXVlcmllcy5wdXNoKG9yaWdpbmFsUXVlcnkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUmV0dXJuIGlmIG9yaWdpbmFsUXVlcnkgaXMgbm90IG1hdGNoaW5nIGN1cnJlbnQgcXVlcnk6XG4gICAgICAgICAgICBpZiAob3JpZ2luYWxRdWVyeSAhPT0gdGhhdC5nZXRRdWVyeSh0aGF0LmN1cnJlbnRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSByZXN1bHQuc3VnZ2VzdGlvbnM7XG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhY3RpdmF0ZTogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgYWN0aXZlSXRlbSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZCA9IHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCxcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuID0gY29udGFpbmVyLmZpbmQoJy4nICsgdGhhdC5jbGFzc2VzLnN1Z2dlc3Rpb24pO1xuXG4gICAgICAgICAgICBjb250YWluZXIuZmluZCgnLicgKyBzZWxlY3RlZCkucmVtb3ZlQ2xhc3Moc2VsZWN0ZWQpO1xuXG4gICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSBpbmRleDtcblxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCAhPT0gLTEgJiYgY2hpbGRyZW4ubGVuZ3RoID4gdGhhdC5zZWxlY3RlZEluZGV4KSB7XG4gICAgICAgICAgICAgICAgYWN0aXZlSXRlbSA9IGNoaWxkcmVuLmdldCh0aGF0LnNlbGVjdGVkSW5kZXgpO1xuICAgICAgICAgICAgICAgICQoYWN0aXZlSXRlbSkuYWRkQ2xhc3Moc2VsZWN0ZWQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBhY3RpdmVJdGVtO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWxlY3RIaW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgaSA9ICQuaW5BcnJheSh0aGF0LmhpbnQsIHRoYXQuc3VnZ2VzdGlvbnMpO1xuXG4gICAgICAgICAgICB0aGF0LnNlbGVjdChpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWxlY3Q6IGZ1bmN0aW9uIChpKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgIHRoYXQub25TZWxlY3QoaSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbW92ZVVwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5jaGlsZHJlbigpLmZpcnN0KCkucmVtb3ZlQ2xhc3ModGhhdC5jbGFzc2VzLnNlbGVjdGVkKTtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcbiAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgdGhhdC5maW5kQmVzdEhpbnQoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQuYWRqdXN0U2Nyb2xsKHRoYXQuc2VsZWN0ZWRJbmRleCAtIDEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1vdmVEb3duOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09ICh0aGF0LnN1Z2dlc3Rpb25zLmxlbmd0aCAtIDEpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LmFkanVzdFNjcm9sbCh0aGF0LnNlbGVjdGVkSW5kZXggKyAxKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGp1c3RTY3JvbGw6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGFjdGl2ZUl0ZW0gPSB0aGF0LmFjdGl2YXRlKGluZGV4KTtcblxuICAgICAgICAgICAgaWYgKCFhY3RpdmVJdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgb2Zmc2V0VG9wLFxuICAgICAgICAgICAgICAgIHVwcGVyQm91bmQsXG4gICAgICAgICAgICAgICAgbG93ZXJCb3VuZCxcbiAgICAgICAgICAgICAgICBoZWlnaHREZWx0YSA9ICQoYWN0aXZlSXRlbSkub3V0ZXJIZWlnaHQoKTtcblxuICAgICAgICAgICAgb2Zmc2V0VG9wID0gYWN0aXZlSXRlbS5vZmZzZXRUb3A7XG4gICAgICAgICAgICB1cHBlckJvdW5kID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5zY3JvbGxUb3AoKTtcbiAgICAgICAgICAgIGxvd2VyQm91bmQgPSB1cHBlckJvdW5kICsgdGhhdC5vcHRpb25zLm1heEhlaWdodCAtIGhlaWdodERlbHRhO1xuXG4gICAgICAgICAgICBpZiAob2Zmc2V0VG9wIDwgdXBwZXJCb3VuZCkge1xuICAgICAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuc2Nyb2xsVG9wKG9mZnNldFRvcCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9mZnNldFRvcCA+IGxvd2VyQm91bmQpIHtcbiAgICAgICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnNjcm9sbFRvcChvZmZzZXRUb3AgLSB0aGF0Lm9wdGlvbnMubWF4SGVpZ2h0ICsgaGVpZ2h0RGVsdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXRoYXQub3B0aW9ucy5wcmVzZXJ2ZUlucHV0KSB7XG4gICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5nZXRWYWx1ZSh0aGF0LnN1Z2dlc3Rpb25zW2luZGV4XS52YWx1ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uU2VsZWN0OiBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvblNlbGVjdENhbGxiYWNrID0gdGhhdC5vcHRpb25zLm9uU2VsZWN0LFxuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb24gPSB0aGF0LnN1Z2dlc3Rpb25zW2luZGV4XTtcblxuICAgICAgICAgICAgdGhhdC5jdXJyZW50VmFsdWUgPSB0aGF0LmdldFZhbHVlKHN1Z2dlc3Rpb24udmFsdWUpO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5jdXJyZW50VmFsdWUgIT09IHRoYXQuZWwudmFsKCkgJiYgIXRoYXQub3B0aW9ucy5wcmVzZXJ2ZUlucHV0KSB7XG4gICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQobnVsbCk7XG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gW107XG4gICAgICAgICAgICB0aGF0LnNlbGVjdGlvbiA9IHN1Z2dlc3Rpb247XG5cbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24ob25TZWxlY3RDYWxsYmFjaykpIHtcbiAgICAgICAgICAgICAgICBvblNlbGVjdENhbGxiYWNrLmNhbGwodGhhdC5lbGVtZW50LCBzdWdnZXN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXRWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgZGVsaW1pdGVyID0gdGhhdC5vcHRpb25zLmRlbGltaXRlcixcbiAgICAgICAgICAgICAgICBjdXJyZW50VmFsdWUsXG4gICAgICAgICAgICAgICAgcGFydHM7XG5cbiAgICAgICAgICAgIGlmICghZGVsaW1pdGVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjdXJyZW50VmFsdWUgPSB0aGF0LmN1cnJlbnRWYWx1ZTtcbiAgICAgICAgICAgIHBhcnRzID0gY3VycmVudFZhbHVlLnNwbGl0KGRlbGltaXRlcik7XG5cbiAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50VmFsdWUuc3Vic3RyKDAsIGN1cnJlbnRWYWx1ZS5sZW5ndGggLSBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXS5sZW5ndGgpICsgdmFsdWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzcG9zZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdGhhdC5lbC5vZmYoJy5hdXRvY29tcGxldGUnKS5yZW1vdmVEYXRhKCdhdXRvY29tcGxldGUnKTtcbiAgICAgICAgICAgIHRoYXQuZGlzYWJsZUtpbGxlckZuKCk7XG4gICAgICAgICAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUuYXV0b2NvbXBsZXRlJywgdGhhdC5maXhQb3NpdGlvbkNhcHR1cmUpO1xuICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBDcmVhdGUgY2hhaW5hYmxlIGpRdWVyeSBwbHVnaW46XG4gICAgJC5mbi5hdXRvY29tcGxldGUgPSAkLmZuLmRldmJyaWRnZUF1dG9jb21wbGV0ZSA9IGZ1bmN0aW9uIChvcHRpb25zLCBhcmdzKSB7XG4gICAgICAgIHZhciBkYXRhS2V5ID0gJ2F1dG9jb21wbGV0ZSc7XG4gICAgICAgIC8vIElmIGZ1bmN0aW9uIGludm9rZWQgd2l0aG91dCBhcmd1bWVudCByZXR1cm5cbiAgICAgICAgLy8gaW5zdGFuY2Ugb2YgdGhlIGZpcnN0IG1hdGNoZWQgZWxlbWVudDpcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpcnN0KCkuZGF0YShkYXRhS2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGlucHV0RWxlbWVudCA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBpbnB1dEVsZW1lbnQuZGF0YShkYXRhS2V5KTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZSAmJiB0eXBlb2YgaW5zdGFuY2Vbb3B0aW9uc10gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2Vbb3B0aW9uc10oYXJncyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBJZiBpbnN0YW5jZSBhbHJlYWR5IGV4aXN0cywgZGVzdHJveSBpdDpcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UgJiYgaW5zdGFuY2UuZGlzcG9zZSkge1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGluc3RhbmNlID0gbmV3IEF1dG9jb21wbGV0ZSh0aGlzLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICBpbnB1dEVsZW1lbnQuZGF0YShkYXRhS2V5LCBpbnN0YW5jZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG59KSk7XG4iLCIkKGZ1bmN0aW9uKCkge1xuICAgIHZhciB1cmxQcmVmaXggPSAnJztcblxuICAgICQuZXh0ZW5kKHtcbiAgICAgICAgZ2V0VXJsVmFyczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdmFycyA9IFtdLCBoYXNoO1xuICAgICAgICAgICAgdmFyIGhhc2hlcyA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNsaWNlKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJz8nKSArIDEpLnNwbGl0KCcmJyk7XG4gICAgICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgaGFzaGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaGFzaCA9IGhhc2hlc1tpXS5zcGxpdCgnPScpO1xuICAgICAgICAgICAgICAgIHZhcnMucHVzaChoYXNoWzBdKTtcbiAgICAgICAgICAgICAgICB2YXJzW2hhc2hbMF1dID0gaGFzaFsxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2YXJzO1xuICAgICAgICB9LFxuICAgICAgICBnZXRVcmxWYXI6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiAkLmdldFVybFZhcnMoKVtuYW1lXTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIGFqYXggPSB7XG4gICAgICAgIGNvbnRyb2w6IHtcbiAgICAgICAgICAgIHNlbmRGb3JtRGF0YTogZnVuY3Rpb24oZm9ybSwgdXJsLCBsb2dOYW1lLCBzdWNjZXNzQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vbiggXCJzdWJtaXRcIiwgZm9ybSwgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZiA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFGb3JtID0gJCh0aGlzKS5zZXJpYWxpemUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0QnV0dG9uID0gJCh0aGlzKS5maW5kKFwiYnV0dG9uW3R5cGU9c3VibWl0XVwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkQnV0dG9uVmFsdWUgPSBzdWJtaXRCdXR0b24uaHRtbCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHN1Ym1pdEJ1dHRvbi5hdHRyKFwiZGlzYWJsZWRcIiwgXCJkaXNhYmxlZFwiKS5odG1sKCc8aSBjbGFzcz1cImZhIGZhLWNvZyBmYS1zcGluXCI+PC9pPicpO1xuXG4gICAgICAgICAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IFwicG9zdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiB1cmxQcmVmaXggKyB1cmwsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBkYXRhRm9ybSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gJC5wYXJzZUpTT04ocmVzcG9uc2UpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVzcG9uc2UuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGtleSBpbiByZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVzcG9uc2Vba2V5XVswXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZvcm1FcnJvciA9IG5vdHkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCe0YjQuNCx0LrQsCE8L2I+IFwiICsgcmVzcG9uc2Vba2V5XVswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNzAwMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc0NhbGxiYWNrKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGpxeGhyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JzLmNvbnRyb2wubG9nKGxvZ05hbWUsIGpxeGhyKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmb3JtRXJyb3JBamF4ID0gbm90eSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0KLQtdGF0L3QuNGH0LXRgdC60LjQtSDRgNCw0LHQvtGC0YshPC9iPjxicj7QkiDQtNCw0L3QvdGL0Lkg0LzQvtC80LXQvdGCINCy0YDQtdC80LXQvdC4XCIgKyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiDQv9GA0L7QuNC30LLQtdC00ZHQvdC90L7QtSDQtNC10LnRgdGC0LLQuNC1INC90LXQstC+0LfQvNC+0LbQvdC+LiDQn9C+0L/RgNC+0LHRg9C50YLQtSDQv9C+0LfQttC1LlwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiDQn9GA0LjQvdC+0YHQuNC8INGB0LLQvtC4INC40LfQstC40L3QtdC90LjRjyDQt9CwINC90LXRg9C00L7QsdGB0YLQstC+LlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46ICdhbmltYXRlZCBmYWRlSW5MZWZ0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiAnYW5pbWF0ZWQgZmxpcE91dFgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlZWQ6IDMwMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnd2FybmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiAncmVsYXgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICd0b3BSaWdodCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDEwMDAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Ym1pdEJ1dHRvbi5yZW1vdmVBdHRyKFwiZGlzYWJsZWRcIikuaHRtbChvbGRCdXR0b25WYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGVycm9ycyA9IHtcbiAgICAgICAgY29udHJvbDoge1xuICAgICAgICAgICAgbG9nOiBmdW5jdGlvbih0eXBlLCBqcXhocikge1xuICAgICAgICAgICAgICAgICQoXCI8ZGl2IGlkPSdlcnJvci1jb250YWluZXInIHN0eWxlPSdkaXNwbGF5Om5vbmU7Jz5cIiArIGpxeGhyLnJlc3BvbnNlVGV4dCArIFwiPC9kaXY+XCIpLmFwcGVuZFRvKFwiYm9keVwiKTtcblxuICAgICAgICAgICAgICAgIHZhciBlcnJvckNvbnRhaW5lciA9ICQoXCIjZXJyb3ItY29udGFpbmVyXCIpLFxuICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZSA9IHR5cGUgKyBcIjogXCIgKyBqcXhoci5zdGF0dXMgKyBcIiBcIiArIGpxeGhyLnN0YXR1c1RleHQgKyBcIiBcIjtcblxuICAgICAgICAgICAgICAgIGlmKGVycm9yQ29udGFpbmVyLmZpbmQoXCJoMjpmaXJzdFwiKS50ZXh0KCkgPT0gXCJEZXRhaWxzXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlICs9IFwiLSBcIjtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JDb250YWluZXIuZmluZChcImRpdlwiKS5lYWNoKGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihpbmRleCA+IDQpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkZWxpbWl0ZXIgPSBcIiwgXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihpbmRleCA9PSA0KSBkZWxpbWl0ZXIgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlICs9ICQodGhpcykudGV4dCgpICsgZGVsaW1pdGVyO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IFwicG9zdFwiLFxuICAgICAgICAgICAgICAgICAgICB1cmw6IHVybFByZWZpeCArIFwiL2FqYXgtZXJyb3JcIixcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogXCJtZXNzYWdlPVwiICsgZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgZXJyb3JDb250YWluZXIucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgdmFyIGhlYWRlciA9IHtcbiAgICAgICAgY29udHJvbDoge1xuICAgICAgICAgICAgaGVhZGVyU3RvcmVzTWVudTogJChcIiN0b3BcIikuZmluZChcIi5zdG9yZXNcIiksIFxuICAgICAgICAgICAgc3RvcmVzU3VibWVudTogJChcIiN0b3BcIikuZmluZChcIi5zdG9yZXNcIikuZmluZChcIi5zdWJtZW51XCIpLFxuICAgICAgICAgICAgcG9wdXBTaWduVXA6ICQoXCIjdG9wXCIpLmZpbmQoXCIucG9wdXBfY29udGVudFwiKS5maW5kKFwiLnNpZ24tdXBcIiksXG4gICAgICAgICAgICBzdG9yZVNob3c6ICcnLFxuICAgICAgICAgICAgc3RvcmVIaWRlOiAnJyxcbiAgICAgICAgICAgIHBhc3N3b3JkUmVjb3Zlcnk6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBwYXNzd29yZFJlY292ZXJ5SGFzaCA9ICQuZ2V0VXJsVmFyKFwicHJ2XCIpO1xuXG4gICAgICAgICAgICAgICAgaWYocGFzc3dvcmRSZWNvdmVyeUhhc2ggIT09IHVuZGVmaW5lZCAmJiBwYXNzd29yZFJlY292ZXJ5SGFzaCAhPSAnJykge1xuICAgICAgICAgICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiBcInBvc3RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogdXJsUHJlZml4ICsgXCIvcGFzc3dvcmQtcmVjb3ZlcnkvdXBkYXRlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBcInBydj1cIiArIHBhc3N3b3JkUmVjb3ZlcnlIYXNoLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChqcXhocikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9ycy5jb250cm9sLmxvZygnUGFzc3dvcmQgUmVjb3ZlcnkgVXBkYXRlIEFqYXggRXJyb3InLCBqcXhocik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZm9ybUVycm9yQWpheCA9IG5vdHkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCi0LXRhdC90LjRh9C10YHQutC40LUg0YDQsNCx0L7RgtGLITwvYj48YnI+0JIg0LTQsNC90L3Ri9C5INC80L7QvNC10L3RgiDQstGA0LXQvNC10L3QuFwiICsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIg0L/RgNC+0LjQt9Cy0LXQtNGR0L3QvdC+0LUg0LTQtdC50YHRgtCy0LjQtSDQvdC10LLQvtC30LzQvtC20L3Qvi4g0J/QvtC/0YDQvtCx0YPQudGC0LUg0L/QvtC30LbQtS5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIg0J/RgNC40L3QvtGB0LjQvCDRgdCy0L7QuCDQuNC30LLQuNC90LXQvdC40Y8g0LfQsCDQvdC10YPQtNC+0LHRgdGC0LLQvi5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3dhcm5pbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiAxMDAwMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gJC5wYXJzZUpTT04ocmVzcG9uc2UpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVzcG9uc2UuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGtleSBpbiByZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVzcG9uc2Vba2V5XVswXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhc3NSZWNvdkVycm9yID0gbm90eSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0J7RiNC40LHQutCwITwvYj4gXCIgKyByZXNwb25zZVtrZXldWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46ICdhbmltYXRlZCBmYWRlSW5MZWZ0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiAnYW5pbWF0ZWQgZmxpcE91dFgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlZWQ6IDMwMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWw6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDcwMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXNzUmVjb3ZTdWNjZXNzID0gbm90eSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCf0L7Qt9C00YDQsNCy0LvRj9C10LwhPC9iPjxicj4g0J/QsNGA0L7Qu9GMINGD0YHQv9C10YjQvdC+INC40LfQvNC10L3RkdC9LiDQndC+0LLRi9C5INC/0LDRgNC+0LvRjDogPGI+XCIgKyByZXNwb25zZS5wYXNzd29yZCArIFwiPC9iPjxicj48YnI+XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VXaXRoOiBbJ2J1dHRvbiddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKG51bGwsIG51bGwsICcvJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICAgICAgc2VsZi5oZWFkZXJTdG9yZXNNZW51LmhvdmVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpZigkKHdpbmRvdykud2lkdGgoKSA+IDk5MSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYuc3RvcmVIaWRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc3RvcmVTaG93ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnN0b3Jlc1N1Ym1lbnUuY2xlYXJRdWV1ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc3RvcmVzU3VibWVudS5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIikuYW5pbWF0ZSh7XCJvcGFjaXR5XCI6IDF9LCAzNTApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMjAwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpZigkKHdpbmRvdykud2lkdGgoKSA+IDk5MSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYuc3RvcmVTaG93KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc3RvcmVIaWRlID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnN0b3Jlc1N1Ym1lbnUuY2xlYXJRdWV1ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc3RvcmVzU3VibWVudS5hbmltYXRlKHtcIm9wYWNpdHlcIjogMH0sIDIwMCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuY3NzKFwiZGlzcGxheVwiLCBcIm5vbmVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAzMDApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnBhc3N3b3JkUmVjb3ZlcnkoKTtcblxuICAgICAgICAgICAgICAgIGlmKCQod2luZG93KS53aWR0aCgpID4gOTkxKSB7XG4gICAgICAgICAgICAgICAgICAgICQoXCIuZm9ybS1zZWFyY2gtZHAgaW5wdXRcIikuYXV0b2NvbXBsZXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZpY2VVcmw6ICcvc2VhcmNoJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vQ2FjaGU6ICd0cnVlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVyUmVxdWVzdEJ5OiAzMDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU2VsZWN0OiBmdW5jdGlvbiAoc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSAnL3N0b3Jlcy8nICsgc3VnZ2VzdGlvbi5kYXRhLnJvdXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAkKFwiZm9ybVtuYW1lPXNlYXJjaF0gLmZhXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmNsb3Nlc3QoXCJmb3JtXCIpLnN1Ym1pdCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgJChcIi5kb2Jyb2hlYWQgaSwgLmRvYnJvIC5jaXJjbGUgLmMgLmZhLWhlYXJ0XCIpLmFuaW1vKHthbmltYXRpb246IFwicHVsc2VcIiwgaXRlcmF0ZTogXCJpbmZpbml0ZVwifSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgYWN0aXZlQ2F0ZWdvcnkgPSAkKFwiLmhlYWRlci1uYXYgbmF2IHVsLnByaW1hcnktbmF2IC5zdWJtZW51IC50cmVlIGFbaHJlZj0nXCIrbG9jYXRpb24ucGF0aG5hbWUrXCInXVwiKTtcblxuICAgICAgICAgICAgICAgIGlmKGFjdGl2ZUNhdGVnb3J5Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlQ2F0ZWdvcnkuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGNvdXBvbnMgPSB7XG4gICAgICAgIGNvbnRyb2w6IHtcbiAgICAgICAgICAgIGV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJC5jb3VudGRvd24ucmVnaW9uYWxPcHRpb25zWydydSddID0ge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbHM6IFsn0JvQtdGCJywgJ9Cc0LXRgdGP0YbQtdCyJywgJ9Cd0LXQtNC10LvRjCcsICfQlNC90LXQuScsICfQp9Cw0YHQvtCyJywgJ9Cc0LjQvdGD0YInLCAn0KHQtdC60YPQvdC0J10sXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsczE6IFsn0JPQvtC0JywgJ9Cc0LXRgdGP0YYnLCAn0J3QtdC00LXQu9GPJywgJ9CU0LXQvdGMJywgJ9Cn0LDRgScsICfQnNC40L3Rg9GC0LAnLCAn0KHQtdC60YPQvdC00LAnXSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxzMjogWyfQk9C+0LTQsCcsICfQnNC10YHRj9GG0LAnLCAn0J3QtdC00LXQu9C4JywgJ9CU0L3RjycsICfQp9Cw0YHQsCcsICfQnNC40L3Rg9GC0YsnLCAn0KHQtdC60YPQvdC00YsnXSxcbiAgICAgICAgICAgICAgICAgICAgY29tcGFjdExhYmVsczogWyfQuycsICfQvCcsICfQvScsICfQtCddLCBjb21wYWN0TGFiZWxzMTogWyfQsycsICfQvCcsICfQvScsICfQtCddLFxuICAgICAgICAgICAgICAgICAgICB3aGljaExhYmVsczogZnVuY3Rpb24oYW1vdW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdW5pdHMgPSBhbW91bnQgJSAxMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0ZW5zID0gTWF0aC5mbG9vcigoYW1vdW50ICUgMTAwKSAvIDEwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoYW1vdW50ID09IDEgPyAxIDogKHVuaXRzID49IDIgJiYgdW5pdHMgPD0gNCAmJiB0ZW5zICE9IDEgPyAyIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAodW5pdHMgPT0gMSAmJiB0ZW5zICE9IDEgPyAxIDogMCkpKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZGlnaXRzOiBbJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknXSxcbiAgICAgICAgICAgICAgICAgICAgdGltZVNlcGFyYXRvcjogJzonLCBcbiAgICAgICAgICAgICAgICAgICAgaXNSVEw6IGZhbHNlXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICQuY291bnRkb3duLnNldERlZmF1bHRzKCQuY291bnRkb3duLnJlZ2lvbmFsT3B0aW9uc1sncnUnXSk7XG5cbiAgICAgICAgICAgICAgICAkKFwiI3RvcFwiKS5maW5kKCcuY291cG9ucyAuY3VycmVudC1jb3Vwb24gLnRpbWUgLmNsb2NrJykuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGYgPSAkKHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0ZUVuZCA9IG5ldyBEYXRlKHNlbGYuYXR0cihcImRhdGEtZW5kXCIpLnJlcGxhY2UoLy0vZywgXCIvXCIpKTsgXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuY291bnRkb3duKHt1bnRpbDogZGF0ZUVuZCwgY29tcGFjdDogdHJ1ZX0pOyBcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICQoXCIjdG9wXCIpLmZpbmQoJy5jb3Vwb25zIC5jdXJyZW50LWNvdXBvbiAuY291bnRkb3duLWFtb3VudCcpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxmID0gJCh0aGlzKTtcblxuICAgICAgICAgICAgICAgICAgICBpZihzZWxmLnRleHQoKSA9PSBcIjAwOjAwOjAwXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY2xvc2VzdChcIi5jdXJyZW50LWNvdXBvblwiKS5maW5kKFwiLmV4cGlyeVwiKS5jc3MoXCJkaXNwbGF5XCIsIFwidGFibGUtY2VsbFwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgJChcIiN0b3BcIikuZmluZChcIi5jb3Vwb25zIC5jdXJyZW50LWNvdXBvbiAudGV4dCAuYWRkaXRpb25hbCBhXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLm5leHQoXCJzcGFuXCIpLnRvZ2dsZSgpO1xuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnRleHQoZnVuY3Rpb24oaSwgdikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdiA9IHYuc3BsaXQoXCIgXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZih2LmluZGV4T2YoJ9Cf0L7QutCw0LfQsNGC0YwnKSAhPSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZbMF0gPSAn0KHQutGA0YvRgtGMJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdlswXSA9ICfQn9C+0LrQsNC30LDRgtGMJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgdiA9IHYuam9pbihcIiBcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdjtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgJChcIiN0b3BcIikuZmluZChcIi5jYXRlZ29yaWVzIC5zZWFyY2gtc3RvcmUtY291cG9ucyBpbnB1dFwiKS5rZXl1cChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlWYWx1ZSA9ICQodGhpcykudmFsKCkudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAgICAgICAgICAgICBpZihpVmFsdWUgIT0gXCJcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgJChcIi5jYXRlZ29yaWVzIC5jb3Vwb25zLXN0b3JlcyBsaSBhXCIpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0b3JlTmFtZSA9ICQodGhpcykudGV4dCgpLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihzdG9yZU5hbWUuaW5kZXhPZihpVmFsdWUpICE9IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucGFyZW50KCkuY3NzKFwiZGlzcGxheVwiLCBcImJsb2NrXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucGFyZW50KCkuY3NzKFwiZGlzcGxheVwiLCBcIm5vbmVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKFwiLmNhdGVnb3JpZXMgLmNvdXBvbnMtc3RvcmVzIGxpXCIpLmNzcyhcImRpc3BsYXlcIiwgXCJibG9ja1wiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIiN0b3AgLmNvdXBvbnMgLmN1cnJlbnQtY291cG9uIC50ZXh0IC5jb3Vwb24tZ290byBhW2hyZWY9I3Nob3dwcm9tb2NvZGVdXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZiA9ICQodGhpcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5uZXh0KFwiZGl2XCIpLmNzcyhcImRpc3BsYXlcIiwgXCJibG9ja1wiKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi50ZXh0KFwi0JjRgdC/0L7Qu9GM0LfQvtCy0LDRgtGMINC60YPQv9C+0L1cIik7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYXR0cihcInRhcmdldFwiLCBcIl9ibGFua1wiKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5hdHRyKFwiaHJlZlwiLCBcIi9nb3RvL2NvdXBvbjpcIiArIHNlbGYuY2xvc2VzdChcIi5jdXJyZW50LWNvdXBvblwiKS5hdHRyKFwiZGF0YS11aWRcIikpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9KTsgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcG9wdXAgPSB7XG4gICAgICAgIGNvbnRyb2w6IHtcbiAgICAgICAgICAgIHN0YXJOb21pbmF0aW9uOiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgICAgICAgdmFyIHN0YXJzID0gJChcIiN0b3AgLnBvcHVwIC5mZWVkYmFjay5wb3B1cC1jb250ZW50IC5yYXRpbmcgLmZhLXdyYXBwZXIgLmZhXCIpO1xuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICBzdGFycy5yZW1vdmVDbGFzcyhcImZhLXN0YXJcIikuYWRkQ2xhc3MoXCJmYS1zdGFyLW9cIik7XG5cbiAgICAgICAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBpbmRleDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJzLmVxKGkpLnJlbW92ZUNsYXNzKFwiZmEtc3Rhci1vXCIpLmFkZENsYXNzKFwiZmEtc3RhclwiKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZWdpc3RyYXRpb246IGZ1bmN0aW9uKHNldHRpbmdzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgICAgIGZvciAoc2VsZWN0b3IgaW4gc2V0dGluZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgJChzZWxlY3RvcikucG9wdXAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudCA6IHNldHRpbmdzW3NlbGVjdG9yXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGUgOiAnaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBhZnRlck9wZW46IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhY3RpdmVFbGVtZW50ID0gJChcIiN0b3AgYS5wb3B1cF9hY3RpdmVcIikuYXR0cihcImhyZWZcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyonI2xvZ2luJyA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2gzJyA6ICfQktGF0L7QtCDQvdCwINGB0LDQudGCJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2J1dHRvbicgOiAn0JLQvtC50YLQuCDQsiDQu9C40YfQvdGL0Lkg0LrQsNCx0LjQvdC10YInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaW5wdXRbdHlwZT1wYXNzd29yZF0nIDogJ9CS0LLQtdC00LjRgtC1INCy0LDRiCDQv9Cw0YDQvtC70YwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaDQnIDogJ9CY0LvQuCDQstC+0LnQtNC40YLQtSDQuiDQvdCw0Lwg0YEg0L/QvtC80L7RidGM0Y4g0YHQvtGG0YHQtdGC0LXQuTonLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLnNpZ24tdXAtdGFnbGluZScgOiAn0KHQvtCy0LXRgNGI0LDRjyDQstGF0L7QtCDQvdCwINGB0LDQudGCLCDQktGLINGB0L7Qs9C70LDRiNCw0LXRgtC10YHRjCDRgSDQvdCw0YjQuNC80LggPGEgaHJlZj1cIi90ZXJtc1wiPtCf0YDQsNCy0LjQu9Cw0LzQuDwvYT4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLnRlcm1zJyA6ICc8YSBocmVmPVwiI3Bhc3N3b3JkLXJlY292ZXJ5XCIgY2xhc3M9XCJpZ25vcmUtaGFzaFwiPtCX0LDQsdGL0LvQuCDQv9Cw0YDQvtC70Yw/PC9hPicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdpbnB1dFtuYW1lPXR5cGVdJyA6ICdsb2dpbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcjcmVnaXN0cmF0aW9uJyA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2gzJyA6ICfQndCw0YfQvdC40YLQtSDRjdC60L7QvdC+0LzQuNGC0Ywg0YPQttC1INGB0LXQs9C+0LTQvdGPIScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdidXR0b24nIDogJ9Cf0YDQuNGB0L7QtdC00LjQvdC40YLRjNGB0Y8g0Lgg0L3QsNGH0LDRgtGMINGN0LrQvtC90L7QvNC40YLRjCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdpbnB1dFt0eXBlPXBhc3N3b3JkXScgOiAn0J/RgNC40LTRg9C80LDQudGC0LUg0L/QsNGA0L7Qu9GMJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2g0JyA6ICfQmNC70Lgg0L/RgNC40YHQvtC10LTQuNC90Y/QudGC0LXRgdGMINC6INC90LDQvCDRgSDQv9C+0LzQvtGJ0YzRjiDRgdC+0YbRgdC10YLQtdC5OicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcuc2lnbi11cC10YWdsaW5lJyA6ICfQoNC10LPQuNGB0YLRgNCw0YbQuNGPINC/0L7Qu9C90L7RgdGC0YzRjiDQsdC10YHQv9C70LDRgtC90LAg0Lgg0LfQsNC50LzRkdGCINGDINCS0LDRgSDQvdC10YHQutC+0LvRjNC60L4g0YHQtdC60YPQvdC0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJy50ZXJtcycgOiAn0KDQtdCz0LjRgdGC0YDQuNGA0YPRj9GB0YwsINGPINGB0L7Qs9C70LDRiNCw0Y7RgdGMINGBIDxhIGhyZWY9XCIvdGVybXNcIj7Qn9GA0LDQstC40LvQsNC80Lg8L2E+JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2lucHV0W25hbWU9dHlwZV0nIDogJ3JlZ2lzdHJhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyonI2dpdmVmZWVkYmFjaycgOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdoMycgOiAn0J7RgtC30YvQsiDQviDRgdCw0LnRgtC1JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2lucHV0W25hbWU9dHlwZV0nIDogJ2ZlZWRiYWNrJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI3Jldmlld3N0b3JlJyA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2gzJyA6ICfQntGC0LfRi9CyINC+INC80LDQs9Cw0LfQuNC90LUgJyArICQoXCIjc3RvcmUtaW5mb3JtYXRpb25cIikuYXR0cihcImRhdGEtc3RvcmUtbmFtZVwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2lucHV0W25hbWU9dHlwZV0nIDogJ3Jldmlld18nICsgJChcIiNzdG9yZS1pbmZvcm1hdGlvblwiKS5hdHRyKFwiZGF0YS1zdG9yZS1pZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKmlmKCQuaW5BcnJheShhY3RpdmVFbGVtZW50LCBbJyNsb2dpbicsICcjcmVnaXN0cmF0aW9uJ10pICE9IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwb3B1cFdpbmRvdyA9ICQoXCIjdG9wXCIpLmZpbmQoXCIucG9wdXBfY29udGVudFwiKS5maW5kKFwiLnNpZ24tdXBcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcHVwV2luZG93LmZpbmQoXCIuc29jaWFsLWljb25cIikucHJlcGVuZChcIlwiICsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI8ZGl2IGlkPVxcXCJ1TG9naW42ZGFiM2EyZFxcXCJcIiArIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS11bG9naW49XFxcImRpc3BsYXk9YnV0dG9ucztmaWVsZHM9Zmlyc3RfbmFtZSxlbWFpbCxsYXN0X25hbWUsbmlja25hbWUsc2V4LGJkYXRlLHBob3RvLFwiICsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwaG90b19iaWc7b3B0aW9uYWw9cGhvbmUsY2l0eSxjb3VudHJ5O2xhbmc9cnU7cHJvdmlkZXJzPXZrb250YWt0ZSxvZG5va2xhc3NuaWtpLFwiICsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJmYWNlYm9vayx0d2l0dGVyO3JlZGlyZWN0X3VyaT1odHRwJTNBJTJGJTJGc2VjcmV0ZGlzY291bnRlci5ydSUyRmF1dGhvcml6YXRpb25zb2NpYWxfbG9naW5cXFwiPlwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjxpbWcgc3JjPVxcXCIvaW1hZ2VzL2FjY291bnQvdmsucG5nXFxcIiBkYXRhLXVsb2dpbmJ1dHRvbj1cXFwidmtvbnRha3RlXFxcIiBhbHQ9XFxcInZrb250YWt0ZS11bG9naW5cXFwiPlwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjxpbWcgc3JjPVxcXCIvaW1hZ2VzL2FjY291bnQvZmIucG5nXFxcIiBkYXRhLXVsb2dpbmJ1dHRvbj1cXFwiZmFjZWJvb2tcXFwiIGFsdD1cXFwiZmFjZWJvb2stdWxvZ2luXFxcIj5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI8aW1nIHNyYz1cXFwiL2ltYWdlcy9hY2NvdW50L3R3LnBuZ1xcXCIgZGF0YS11bG9naW5idXR0b249XFxcInR3aXR0ZXJcXFwiIGFsdD1cXFwidHdpdHRlci11bG9naW5cXFwiPlwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjxpbWcgc3JjPVxcXCIvaW1hZ2VzL2FjY291bnQvb2sucG5nXFxcIiBkYXRhLXVsb2dpbmJ1dHRvbj1cXFwib2Rub2tsYXNzbmlraVxcXCIgYWx0PVxcXCJvZG5va2xhc3NuaWtpLXVsb2dpblxcXCI+XCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiPC9kaXY+XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0qL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKCQuaW5BcnJheShhY3RpdmVFbGVtZW50LCBbJyNnaXZlZmVlZGJhY2snLCAnI3Jldmlld3N0b3JlJ10pICE9IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwb3B1cFdpbmRvdyA9ICQoXCIjdG9wXCIpLmZpbmQoXCIucG9wdXBfY29udGVudFwiKS5maW5kKFwiLmZlZWRiYWNrXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoa2V5IGluIHNldHRpbmdzW2FjdGl2ZUVsZW1lbnRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKCQuaW5BcnJheShrZXksIFsnaDMnLCAnYnV0dG9uJywgJ2g0J10pICE9IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3B1cFdpbmRvdy5maW5kKGtleSkudGV4dChzZXR0aW5nc1thY3RpdmVFbGVtZW50XVtrZXldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZigkLmluQXJyYXkoa2V5LCBbJy5zaWduLXVwLXRhZ2xpbmUnLCAnLnRlcm1zJ10pICE9IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3B1cFdpbmRvdy5maW5kKGtleSkuaHRtbChzZXR0aW5nc1thY3RpdmVFbGVtZW50XVtrZXldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZigkLmluQXJyYXkoa2V5LCBbJ2lucHV0W3R5cGU9cGFzc3dvcmRdJ10pICE9IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3B1cFdpbmRvdy5maW5kKGtleSkuYXR0cigncGxhY2Vob2xkZXInLCBzZXR0aW5nc1thY3RpdmVFbGVtZW50XVtrZXldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZigkLmluQXJyYXkoa2V5LCBbJ2lucHV0W25hbWU9dHlwZV0nXSkgIT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcHVwV2luZG93LmZpbmQoa2V5KS52YWwoc2V0dGluZ3NbYWN0aXZlRWxlbWVudF1ba2V5XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihhY3RpdmVFbGVtZW50ICE9IFwiI2NlcnRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3B1cFdpbmRvdy5hbmltYXRlKHsnb3BhY2l0eScgOiAxfSwgMzAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdUxvZ2luLmN1c3RvbUluaXQoJ3VMb2dpbjZkYWIzYTJkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBldmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgICBwb3B1cHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8nYVtocmVmPSNsb2dpbl0nIDogJChcIiN0b3BcIikuZmluZCgnLnBvcHVwLWxvZ2luJykuaHRtbCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vJ2FbaHJlZj0jcmVnaXN0cmF0aW9uXScgOiAkKFwiI3RvcFwiKS5maW5kKCcucG9wdXAtbG9naW4nKS5odG1sKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyonYVtocmVmPSNnaXZlZmVlZGJhY2tdJyA6ICAkKFwiI3RvcFwiKS5maW5kKCcucG9wdXAtZ2l2ZWZlZWRiYWNrJykuaHRtbCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhW2hyZWY9I3Jldmlld3N0b3JlXScgOiAgJChcIiN0b3BcIikuZmluZCgnLnBvcHVwLWdpdmVmZWVkYmFjaycpLmh0bWwoKSwqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhW2hyZWY9I2NlcnRdJyA6ICAkKFwiI3RvcFwiKS5maW5kKCcucG9wdXAtY2VydCcpLmh0bWwoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLydhW2hyZWY9I3Bhc3N3b3JkLXJlY292ZXJ5XScgOiAkKFwiI3RvcFwiKS5maW5kKCcucG9wdXAtcmVjb3ZlcnknKS5odG1sKClcbiAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvL3RoaXMucmVnaXN0cmF0aW9uKHBvcHVwcyk7XG5cbiAgICAgICAgICAgICAgICAvKiQoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIiwgXCIjdG9wIGFbaHJlZj0jcGFzc3dvcmQtcmVjb3ZlcnldXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAkKFwiI3RvcCAucG9wdXAtc2lnbi11cFwiKS5jbG9zZXN0KFwiLnBvcHVwXCIpLm5leHQoXCIucG9wdXBfY2xvc2VcIikuY2xpY2soKTtcbiAgICAgICAgICAgICAgICB9KTsqL1xuXG4gICAgICAgICAgICAgICAgLyokKGRvY3VtZW50KS5vbihcIm1vdXNlb3ZlclwiLCBcIiN0b3AgLnBvcHVwIC5mZWVkYmFjay5wb3B1cC1jb250ZW50IC5yYXRpbmcgLmZhLXdyYXBwZXIgLmZhXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICBzZWxmLnN0YXJOb21pbmF0aW9uKCQodGhpcykuaW5kZXgoKSArIDEpO1xuICAgICAgICAgICAgICAgIH0pLm9uKFwibW91c2VsZWF2ZVwiLCBcIiN0b3AgLnBvcHVwIC5mZWVkYmFjay5wb3B1cC1jb250ZW50IC5yYXRpbmcgLmZhLXdyYXBwZXJcIiwgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc3Rhck5vbWluYXRpb24oJChcIiN0b3AgLnBvcHVwIC5mZWVkYmFjay5wb3B1cC1jb250ZW50IGlucHV0W25hbWU9cmF0aW5nXVwiKS52YWwoKSk7ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0pLm9uKFwiY2xpY2tcIiwgXCIjdG9wIC5wb3B1cCAuZmVlZGJhY2sucG9wdXAtY29udGVudCAucmF0aW5nIC5mYS13cmFwcGVyIC5mYVwiLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgc2VsZi5zdGFyTm9taW5hdGlvbigkKHRoaXMpLmluZGV4KCkgKyAxKTtcblxuICAgICAgICAgICAgICAgICAgICAgICQoXCIjdG9wIC5wb3B1cCAuZmVlZGJhY2sucG9wdXAtY29udGVudCBpbnB1dFtuYW1lPXJhdGluZ11cIikudmFsKCQodGhpcykuaW5kZXgoKSArIDEpO1xuICAgICAgICAgICAgICAgIH0pOyovXG5cbiAgICAgICAgICAgICAgICAvKmFqYXguY29udHJvbC5zZW5kRm9ybURhdGEoXCIjdG9wIC5zaWdudXAtZm9ybVwiLCBcIi9hdXRob3JpemF0aW9uXCIsIFwiQXV0aCBBamF4IEVycm9yXCIsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoZGF0YS50eXBlID09ICdyZWdpc3RyYXRpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gdXJsUHJlZml4ICsgXCIvYWNjb3VudFwiICsgZGF0YS5wYXJhbTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSB1cmxQcmVmaXggKyBcIi9hY2NvdW50XCI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTsqL1xuXG4gICAgICAgICAgICAgICAgLyphamF4LmNvbnRyb2wuc2VuZEZvcm1EYXRhKFwiI3RvcCAucmVjb3ZlcnktZm9ybVwiLCBcIi9wYXNzd29yZC1yZWNvdmVyeS9pbnN0cnVjdGlvbnNcIiwgXCJQYXNzd29yZCBSZWNvdmVyeSBJbnN0cnVjdGlvbnMgQWpheCBFcnJvclwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJChcIiN0b3AgLnJlY292ZXJ5XCIpLmNsb3Nlc3QoXCIucG9wdXBcIikubmV4dChcIi5wb3B1cF9jbG9zZVwiKS5jbGljaygpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXNzTm90eVN1Y2Nlc3MgPSBub3R5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0J/QvtC30LTRgNCw0LLQu9GP0LXQvCE8L2I+PGJyPiDQmNC90YHRgtGA0YPQutGG0LjQuCDQv9C+INCy0L7RgdGB0YLQsNC90L7QstC70LXQvdC40Y4g0L/QsNGA0L7Qu9GPINGD0YHQv9C10YjQvdC+XCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiDQvtGC0L/RgNCw0LLQu9C10L3RiyDQvdCwINGD0LrQsNC30LDQvdC90YvQuSBlbWFpbCDQsNC00YDQtdGBLiDQldGB0LvQuCDQv9C40YHRjNC80L4g0L3QtSDQv9GA0LjRiNC70L4g0LIg0YLQtdGH0LXQvdC40LUgMiDQvNC40L3Rg9GCLCDQv9C+0YHQvNC+0YLRgNC40YLQtSDQsiDQv9Cw0L/QutC1IMKr0KHQv9Cw0LzCuy5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46ICdhbmltYXRlZCBmYWRlSW5MZWZ0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlZWQ6IDMwMFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiAncmVsYXgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNzAwMFxuICAgICAgICAgICAgICAgICAgICB9KTsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0pOyovXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKnZhciByZXZpZXdzID0ge1xuICAgICAgICBjb250cm9sOiB7XG4gICAgICAgICAgICBldmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIC8vIGFkZCBhIGNvbW1lbnQgdG8gdGhlIHNpdGVcbiAgICAgICAgICAgICAgICBhamF4LmNvbnRyb2wuc2VuZEZvcm1EYXRhKFwiI3RvcCAuZmVlZGJhY2stZm9ybVwiLCBcIi9yZXZpZXdzXCIsIFwiUmV2aWV3cyBBamF4IEVycm9yXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAkKFwiI3RvcCAuZmVlZGJhY2tcIikuY2xvc2VzdChcIi5wb3B1cFwiKS5uZXh0KFwiLnBvcHVwX2Nsb3NlXCIpLmNsaWNrKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHJldmlld1N1Y2Nlc3MgPSBub3R5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0KHQv9Cw0YHQuNCx0L4hPC9iPjxicj7QktCw0Ygg0L7RgtC30YvQsiDRg9GB0L/QtdGI0L3QviDQtNC+0LHQsNCy0LvQtdC9INC4INCx0YPQtNC10YJcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiINC+0L/Rg9Cx0LvQuNC60L7QstCw0L0g0L3QsCDRgdCw0LnRgtC1INC/0L7RgdC70LUg0LzQvtC00LXRgNCw0YbQuNC4LlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiAnYW5pbWF0ZWQgZmxpcE91dFgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICd0b3BSaWdodCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA3MDAwXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pOyAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9Ki9cblxuICAgIHZhciBjYXRhbG9nID0ge1xuICAgICAgICBjb250cm9sOiB7XG4gICAgICAgICAgICBldmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICQoXCIjdG9wIC5kcm9wZG93bi1zZWxlY3QgLmRyb3BPdXQgbGlcIikuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSAkKHRoaXMpLmZpbmQoXCJhXCIpLmF0dHIoXCJocmVmXCIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGZhdm9yaXRlcyA9IHtcbiAgICAgICAgY29udHJvbDoge1xuICAgICAgICAgICAgZXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkKFwiI3RvcFwiKS5maW5kKFwiLmZhdm9yaXRlLWxpbmsuaWFcIikuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxmID0gJCh0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHR5cGUgPSBzZWxmLmF0dHIoXCJkYXRhLXN0YXRlXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBhZmZpbGlhdGVfaWQgPSBzZWxmLmF0dHIoXCJkYXRhLWFmZmlsaWF0ZS1pZFwiKTtcblxuICAgICAgICAgICAgICAgICAgICBpZih0eXBlID09IFwiYWRkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZmluZChcIi5mYVwiKS5yZW1vdmVDbGFzcyhcIm11dGVkXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5maW5kKFwiLmZhXCIpLnJlbW92ZUNsYXNzKFwicHVsc2UyXCIpLmFkZENsYXNzKFwiZmEtc3BpblwiKTtcblxuICAgICAgICAgICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiBcInBvc3RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogdXJsUHJlZml4ICsgXCIvYWNjb3VudC9mYXZvcml0ZXNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IFwidHlwZT1cIiArIHR5cGUgKyBcIiZhZmZpbGlhdGVfaWQ9XCIgKyBhZmZpbGlhdGVfaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24gKGpxeGhyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JzLmNvbnRyb2wubG9nKCdGYXZvcml0ZXMgQWpheCBFcnJvcicsIGpxeGhyKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmYXZFcnJvckFqYXggPSBub3R5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCI8Yj7QotC10YXQvdC40YfQtdGB0LrQuNC1INGA0LDQsdC+0YLRiyE8L2I+PGJyPtCSINC00LDQvdC90YvQuSDQvNC+0LzQtdC90YIg0LLRgNC10LzQtdC90LhcIiArIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiINC/0YDQvtC40LfQstC10LTRkdC90L3QvtC1INC00LXQudGB0YLQstC40LUg0L3QtdCy0L7Qt9C80L7QttC90L4uINCf0L7Qv9GA0L7QsdGD0LnRgtC1INC/0L7Qt9C20LUuXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiINCf0YDQuNC90L7RgdC40Lwg0YHQstC+0Lgg0LjQt9Cy0LjQvdC10L3QuNGPINC30LAg0L3QtdGD0LTQvtCx0YHRgtCy0L4uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd3YXJuaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogMTAwMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHR5cGUgPT0gXCJhZGRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmZpbmQoXCIuZmFcIikuYWRkQ2xhc3MoXCJtdXRlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmZpbmQoXCIuZmFcIikucmVtb3ZlQ2xhc3MoXCJmYS1zcGluXCIpLmFkZENsYXNzKFwicHVsc2UyXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gJC5wYXJzZUpTT04ocmVzcG9uc2UpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVzcG9uc2UuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGtleSBpbiByZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVzcG9uc2Vba2V5XVswXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZhdm9yaXRlc0Vycm9yID0gbm90eSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0J7RiNC40LHQutCwITwvYj4gXCIgKyByZXNwb25zZVtrZXldWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46ICdhbmltYXRlZCBmYWRlSW5MZWZ0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiAnYW5pbWF0ZWQgZmxpcE91dFgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlZWQ6IDMwMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA3MDAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih0eXBlID09IFwiYWRkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZmluZChcIi5mYVwiKS5hZGRDbGFzcyhcIm11dGVkXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5maW5kKFwiLmZhXCIpLnJlbW92ZUNsYXNzKFwiZmEtc3BpblwiKS5hZGRDbGFzcyhcInB1bHNlMlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmF2b3JpdGVzU3VjY2VzcyA9IG5vdHkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogcmVzcG9uc2UubXNnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiAnYW5pbWF0ZWQgZmxpcE91dFgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICd0b3BSaWdodCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA3MDAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHR5cGUgPT0gXCJhZGRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hdHRyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRhdGEtc3RhdGVcIjogXCJkZWxldGVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRhdGEtb3JpZ2luYWwtdGl0bGVcIjogXCLQo9C00LDQu9C40YLRjCDQuNC3INC40LfQsdGA0LDQvdC90L7Qs9C+XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmZpbmQoXCIuZmFcIikucmVtb3ZlQ2xhc3MoXCJmYS1zcGluIGZhLXN0YXItb1wiKS5hZGRDbGFzcyhcInB1bHNlMiBmYS1zdGFyXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYodHlwZSA9PSBcImRlbGV0ZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmF0dHIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS1zdGF0ZVwiOiBcImFkZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS1vcmlnaW5hbC10aXRsZVwiIDogXCLQlNC+0LHQsNCy0LjRgtGMINCyINC40LfQsdGA0LDQvdC90L7QtVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTsgICAgICAgICAgICAgICAgICAgXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZmluZChcIi5mYVwiKS5yZW1vdmVDbGFzcyhcImZhLXNwaW4gZmEtc3RhclwiKS5hZGRDbGFzcyhcInB1bHNlMiBmYS1zdGFyLW8gbXV0ZWRcIik7ICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTsgICAgICAgXG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgXG4gICAgcG9wdXAuY29udHJvbC5ldmVudHMoKTtcbiAgICBoZWFkZXIuY29udHJvbC5ldmVudHMoKTtcbiAgICBjb3Vwb25zLmNvbnRyb2wuZXZlbnRzKCk7XG4gICAgLy9yZXZpZXdzLmNvbnRyb2wuZXZlbnRzKCk7XG4gICAgY2F0YWxvZy5jb250cm9sLmV2ZW50cygpO1xuICAgIGZhdm9yaXRlcy5jb250cm9sLmV2ZW50cygpO1xufSk7XG5cblxuJCh3aW5kb3cpLmxvYWQoZnVuY3Rpb24oKXtcblxuICAgIC8qIFNjcm9sbGJhciBJbml0XG4gICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgICAvLyAkKFwiI3RvcFwiKS5maW5kKFwiLnN1Ym1lbnUgLnRyZWVcIikubUN1c3RvbVNjcm9sbGJhcih7XG4gICAgLy8gICAgIGF4aXM6XCJ5XCIsXG4gICAgLy8gICAgIHNldEhlaWdodDogMzAwXG4gICAgLy8gfSk7XG4gICAgLy8gaWYoJChcIiN0b3BcIikuZmluZChcIi5jLXdyYXBwZXJcIikubGVuZ3RoIDwgMSl7XG4gICAgLy8gICAgcmV0dXJuIHRydWU7XG4gICAgLy8gfVxuICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuYy13cmFwcGVyXCIpLm1DdXN0b21TY3JvbGxiYXIoe1xuICAgICAgICBheGlzOlwieVwiLFxuICAgICAgICBzZXRIZWlnaHQ6IDcwMFxuICAgIH0pO1xuICAgIC8vICQoXCIjdG9wXCIpLmZpbmQoXCIuY20td3JhcHBlclwiKS5tQ3VzdG9tU2Nyb2xsYmFyKHtcbiAgICAvLyAgICAgYXhpczpcInlcIixcbiAgICAvLyAgICAgc2V0SGVpZ2h0OiA2NDBcbiAgICAvLyB9KTtcbiAgICAvLyAkKFwiI3RvcFwiKS5maW5kKFwiLnZpZXctc3RvcmUgLmFkZGl0aW9uYWwtaW5mb3JtYXRpb25cIikubUN1c3RvbVNjcm9sbGJhcih7XG4gICAgLy8gICAgIGF4aXM6XCJ5XCIsXG4gICAgLy8gICAgIHNldEhlaWdodDogNjVcbiAgICAvLyB9KTtcbiAgICAkKFwiI3RvcFwiKS5maW5kKFwiLmZ1bmRzIC5mdW5kIC50aXRsZVwiKS5tQ3VzdG9tU2Nyb2xsYmFyKHtcbiAgICAgICAgYXhpczpcInlcIixcbiAgICAgICAgc2V0SGVpZ2h0OiA0NSxcbiAgICAgICAgdGhlbWU6IFwiZGFya1wiXG4gICAgfSk7IFxuICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb25zXCIpLm1DdXN0b21TY3JvbGxiYXIoe1xuICAgICAgICBheGlzOlwieVwiLFxuICAgICAgICBzZXRIZWlnaHQ6IDMwMFxuICAgIH0pOyBcbiAgICAvLyAkKFwiI3RvcFwiKS5maW5kKFwiLmNvbW1lbnRzIC5jdXJyZW50LWNvbW1lbnQgLnRleHQgLmNvbW1lbnRcIikubUN1c3RvbVNjcm9sbGJhcih7XG4gICAgLy8gICAgIGF4aXM6XCJ5XCIsXG4gICAgLy8gICAgIHNldEhlaWdodDogMTUwLFxuICAgIC8vICAgICB0aGVtZTogXCJkYXJrXCJcbiAgICAvLyB9KTsgXG4gICAgJChcIiN0b3BcIikuZmluZChcIi5jYXRlZ29yaWVzIHVsOm5vdCguc3ViY2F0ZWdvcmllcylcIikubUN1c3RvbVNjcm9sbGJhcih7XG4gICAgICAgIGF4aXM6XCJ5XCIsXG4gICAgICAgIHNldEhlaWdodDogMjUwXG4gICAgfSk7XG5cbiAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCh7XG4gICAgICAgIGRlbGF5OiB7XG4gICAgICAgICAgICBzaG93OiA1MDAsIGhpZGU6IDIwMDBcbiAgICAgICAgfVxuICAgIH0pO1xuICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS5vbignY2xpY2snLGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSlcbn0pO1xuXG5cbiQoJy5zaG9ydC1kZXNjcmlwdGlvbl9faGFuZGxlLm1vcmUgYScpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgZGl2ID0gJCh0aGlzKS5wYXJlbnQoKTtcbiAgICAkKGRpdikuc2libGluZ3MoJy5zaG9ydC1kZXNjcmlwdGlvbl9faGFuZGxlLmxlc3MnKS5zaG93KCk7XG4gICAgJChkaXYpLmhpZGUoKTtcbiAgICAkKCcuc2hvcnQtZGVzY3JpcHRpb25fX2Rlc2NyaXB0aW9uJykudG9nZ2xlQ2xhc3MoJ2xlc3MnKTtcbn0pO1xuXG4kKCcuc2hvcnQtZGVzY3JpcHRpb25fX2hhbmRsZS5sZXNzIGEnKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIGRpdiA9ICQodGhpcykucGFyZW50KCk7XG4gICAgJChkaXYpLnNpYmxpbmdzKCcuc2hvcnQtZGVzY3JpcHRpb25fX2hhbmRsZS5tb3JlJykuc2hvdygpO1xuICAgICQoZGl2KS5oaWRlKCk7XG4gICAgJCgnLnNob3J0LWRlc2NyaXB0aW9uX19kZXNjcmlwdGlvbicpLnRvZ2dsZUNsYXNzKCdsZXNzJyk7XG59KTtcblxuJCgnLmFkZGl0aW9uYWwtaW5mb3JtYXRpb25fX2hhbmRsZS5tb3JlIGEnKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIGRpdiA9ICQodGhpcykucGFyZW50KCk7XG4gICAgJChkaXYpLnNpYmxpbmdzKCcuYWRkaXRpb25hbC1pbmZvcm1hdGlvbl9faGFuZGxlLmxlc3MnKS5zaG93KCk7XG4gICAgJChkaXYpLmhpZGUoKTtcbiAgICAkKCcuYWRkaXRpb25hbC1pbmZvcm1hdGlvbicpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XG59KTtcbiQoJy5hZGRpdGlvbmFsLWluZm9ybWF0aW9uX19oYW5kbGUubGVzcyBhJykuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBkaXYgPSAkKHRoaXMpLnBhcmVudCgpO1xuICAgICQoZGl2KS5zaWJsaW5ncygnLmFkZGl0aW9uYWwtaW5mb3JtYXRpb25fX2hhbmRsZS5tb3JlJykuc2hvdygpO1xuICAgICQoZGl2KS5oaWRlKCk7XG4gICAgJCgnLmFkZGl0aW9uYWwtaW5mb3JtYXRpb24nKS50b2dnbGVDbGFzcygnb3BlbicpO1xufSk7XG4kKCcuc3RvcmUtY291cG9uc19fc2hvdy1sZXNzJykuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICQoJy5zdG9yZS1jb3Vwb25zX19idXR0b25zLm1vcmUnKS5zaG93KCk7XG4gICAgJCgnLnN0b3JlLWNvdXBvbnNfX2J1dHRvbnMubGVzcycpLmhpZGUoKTtcbiAgICAkKCcuY291cG9ucy1pdGVtLm1vcmUnKS5oaWRlKCk7XG59KTtcbiQoJy5zdG9yZS1jb3Vwb25zX19zaG93LW1vcmUnKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAkKCcuc3RvcmUtY291cG9uc19fYnV0dG9ucy5sZXNzJykuc2hvdygpO1xuICAgJCgnLnN0b3JlLWNvdXBvbnNfX2J1dHRvbnMubW9yZScpLmhpZGUoKTtcbiAgICQoJy5jb3Vwb25zLWl0ZW0ubW9yZScpLnNob3coKTtcbn0pO1xuJCgnLnN0b3JlLXJldmlld3NfX3Nob3ctbGVzcycpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkKCcuc3RvcmUtcmV2aWV3c19fYnV0dG9ucy5tb3JlJykuc2hvdygpO1xuICAgICQoJy5zdG9yZS1yZXZpZXdzX19idXR0b25zLmxlc3MnKS5oaWRlKCk7XG4gICAgJCgnLnN0b3JlLXJldmlld3MtaXRlbS5tb3JlJykuaGlkZSgpO1xufSk7XG4kKCcuc3RvcmUtcmV2aWV3c19fc2hvdy1tb3JlJykuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICQoJy5zdG9yZS1yZXZpZXdzX19idXR0b25zLmxlc3MnKS5zaG93KCk7XG4gICAgJCgnLnN0b3JlLXJldmlld3NfX2J1dHRvbnMubW9yZScpLmhpZGUoKTtcbiAgICAkKCcuc3RvcmUtcmV2aWV3cy1pdGVtLm1vcmUnKS5zaG93KCk7XG59KTtcbiQoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gcGFyc2VOdW0oc3RyKXtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoXG4gICAgICAgICAgU3RyaW5nKHN0cilcbiAgICAgICAgICAgIC5yZXBsYWNlKCcsJywnLicpXG4gICAgICAgICAgICAubWF0Y2goLy0/XFxkKyg/OlxcLlxcZCspPy9nLCAnJykgfHwgMFxuICAgICAgICAgICwgMTBcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAkKCcuc2hvcnQtY2FsYy1jYXNoYmFjaycpLmZpbmQoJ3NlbGVjdCxpbnB1dCcpLm9uKCdjaGFuZ2Uga2V5dXAgY2xpY2snLGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHRoaXM9JCh0aGlzKS5jbG9zZXN0KCcuc2hvcnQtY2FsYy1jYXNoYmFjaycpO1xuICAgICAgICBjdXJzPXBhcnNlTnVtKCR0aGlzLmZpbmQoJ3NlbGVjdCcpLnZhbCgpKTtcbiAgICAgICAgdmFsPSR0aGlzLmZpbmQoJ2lucHV0JykudmFsKCk7XG4gICAgICAgIGlmKHBhcnNlTnVtKHZhbCkhPXZhbCl7XG4gICAgICAgICAgICB2YWw9JHRoaXMuZmluZCgnaW5wdXQnKS52YWwocGFyc2VOdW0odmFsKSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsPXBhcnNlTnVtKHZhbCk7XG5cbiAgICAgICAga29lZj0kdGhpcy5maW5kKCdpbnB1dCcpLmF0dHIoJ2RhdGEtY2FzaGJhY2snKS50cmltKCk7XG4gICAgICAgIHByb21vPSR0aGlzLmZpbmQoJ2lucHV0JykuYXR0cignZGF0YS1jYXNoYmFjay1wcm9tbycpLnRyaW0oKTtcbiAgICAgICAgY3VycmVuY3k9JHRoaXMuZmluZCgnaW5wdXQnKS5hdHRyKCdkYXRhLWNhc2hiYWNrLWN1cnJlbmN5JykudHJpbSgpO1xuXG4gICAgICAgIGlmKGtvZWY9PXByb21vKXtcbiAgICAgICAgICAgIHByb21vPTA7XG4gICAgICAgIH1cblxuICAgICAgICBpZihrb2VmLmluZGV4T2YoJyUnKT4wKXtcbiAgICAgICAgICAgIHJlc3VsdD1wYXJzZU51bShrb2VmKSp2YWwqY3Vycy8xMDA7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgY3Vycz1wYXJzZU51bSgkdGhpcy5maW5kKCdbY29kZT0nK2N1cnJlbmN5KyddJykudmFsKCkpO1xuICAgICAgICAgICAgcmVzdWx0PXBhcnNlTnVtKGtvZWYpKmN1cnNcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHBhcnNlTnVtKHByb21vKT4wKSB7XG4gICAgICAgICAgICBpZihwcm9tby5pbmRleE9mKCclJyk+MCl7XG4gICAgICAgICAgICAgICAgcHJvbW89cGFyc2VOdW0ocHJvbW8pKnZhbCpjdXJzLzEwMDtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIHByb21vPXBhcnNlTnVtKHByb21vKSpjdXJzXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHByb21vPjApIHtcbiAgICAgICAgICAgICAgICBvdXQgPSBcIjxzcGFuIGNsYXNzPW9sZF9wcmljZT5cIiArIHJlc3VsdC50b0ZpeGVkKDIpICsgXCI8L3NwYW4+IFwiICsgcHJvbW8udG9GaXhlZCgyKVxuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgb3V0PXJlc3VsdC50b0ZpeGVkKDIpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgb3V0PXJlc3VsdC50b0ZpeGVkKDIpXG4gICAgICAgIH1cblxuXG4gICAgICAgICR0aGlzLmZpbmQoJy5jYWxjLXJlc3VsdF92YWx1ZScpLmh0bWwob3V0KVxuICAgIH0pLmNsaWNrKClcbn0pOyIsInZhciBub3RpZmljYXRpb24gPSAoZnVuY3Rpb24oKSB7XG4gIHZhciBub3RpZmljYXRpb25fYm94ID1mYWxzZTtcbiAgdmFyIGlzX2luaXQ9ZmFsc2U7XG4gIHZhciBjb25maXJtX29wdD17XG4gICAgdGl0bGU6XCLQo9C00LDQu9C10L3QuNC1XCIsXG4gICAgcXVlc3Rpb246XCLQktGLINC00LXQudGB0YLQstC40YLQtdC70YzQvdC+INGF0L7RgtC40YLQtSDRg9C00LDQu9C40YLRjD9cIixcbiAgICBidXR0b25ZZXM6XCLQlNCwXCIsXG4gICAgYnV0dG9uTm86XCLQndC10YJcIixcbiAgICBjYWxsYmFja1llczpmYWxzZSxcbiAgICBjYWxsYmFja05vOmZhbHNlLFxuICAgIG9iajpmYWxzZSxcbiAgfTtcblxuICB2YXIgYWxlcnRfb3B0PXtcbiAgICB0aXRsZTpcIlwiLFxuICAgIHF1ZXN0aW9uOlwi0KHQvtC+0LHRidC10L3QuNC1XCIsXG4gICAgYnV0dG9uWWVzOlwi0JTQsFwiLFxuICAgIGNhbGxiYWNrWWVzOmZhbHNlLFxuICAgIG9iajpmYWxzZSxcbiAgfTtcblxuXG4gIGZ1bmN0aW9uIGluaXQoKXtcbiAgICBpc19pbml0PXRydWU7XG4gICAgbm90aWZpY2F0aW9uX2JveD0kKCcubm90aWZpY2F0aW9uX2JveCcpO1xuICAgIGlmKG5vdGlmaWNhdGlvbl9ib3gubGVuZ3RoPjApcmV0dXJuO1xuXG4gICAgJCgnYm9keScpLmFwcGVuZChcIjxkaXYgY2xhc3M9J25vdGlmaWNhdGlvbl9ib3gnPjwvZGl2PlwiKTtcbiAgICBub3RpZmljYXRpb25fYm94PSQoJy5ub3RpZmljYXRpb25fYm94Jyk7XG5cbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsJy5ub3RpZnlfY29udHJvbCcsY2xvc2VNb2RhbCk7XG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCcubm90aWZ5X2Nsb3NlJyxjbG9zZU1vZGFsKTtcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsY2xvc2VNb2RhbEZvbik7XG4gIH1cblxuICBmdW5jdGlvbiBjbG9zZU1vZGFsKCl7XG4gICAgJCgnaHRtbCcpLnJlbW92ZUNsYXNzKCdzaG93X25vdGlmaScpO1xuICB9XG4gIGZ1bmN0aW9uIGNsb3NlTW9kYWxGb24oZSl7XG4gICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcbiAgICBpZih0YXJnZXQuY2xhc3NOYW1lPT1cIm5vdGlmaWNhdGlvbl9ib3hcIil7XG4gICAgICBjbG9zZU1vZGFsKCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYWxlcnQoZGF0YSl7XG4gICAgaWYoIWRhdGEpZGF0YT17fTtcbiAgICBkYXRhPW9iamVjdHMoYWxlcnRfb3B0LGRhdGEpO1xuXG4gICAgaWYoIWlzX2luaXQpaW5pdCgpO1xuXG4gICAgbm90eWZ5X2NsYXNzPSdub3RpZnlfYm94ICc7XG4gICAgaWYoZGF0YS5ub3R5ZnlfY2xhc3Mpbm90eWZ5X2NsYXNzKz1kYXRhLm5vdHlmeV9jbGFzcztcblxuICAgIGJveF9odG1sPSc8ZGl2IGNsYXNzPVwiJytub3R5ZnlfY2xhc3MrJ1wiPic7XG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X3RpdGxlXCI+JztcbiAgICBib3hfaHRtbCs9ZGF0YS50aXRsZTtcbiAgICBib3hfaHRtbCs9JzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xuXG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRlbnRcIj4nO1xuICAgIGJveF9odG1sKz1kYXRhLnF1ZXN0aW9uO1xuICAgIGJveF9odG1sKz0nPC9kaXY+JztcblxuICAgIGlmKGRhdGEuYnV0dG9uWWVzfHxkYXRhLmJ1dHRvbk5vKSB7XG4gICAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250cm9sXCI+JztcbiAgICAgIGlmIChkYXRhLmJ1dHRvblllcylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5feWVzXCI+JyArIGRhdGEuYnV0dG9uWWVzICsgJzwvZGl2Pic7XG4gICAgICBpZiAoZGF0YS5idXR0b25Obylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5fbm9cIj4nICsgZGF0YS5idXR0b25ObyArICc8L2Rpdj4nO1xuICAgICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG4gICAgfTtcblxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xuXG5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdzaG93X25vdGlmaScpO1xuICAgIH0sMTAwKVxuICB9XG5cbiAgZnVuY3Rpb24gY29uZmlybShkYXRhKXtcbiAgICBpZighZGF0YSlkYXRhPXt9O1xuICAgIGRhdGE9b2JqZWN0cyhjb25maXJtX29wdCxkYXRhKTtcblxuICAgIGlmKCFpc19pbml0KWluaXQoKTtcblxuICAgIGJveF9odG1sPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveFwiPic7XG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X3RpdGxlXCI+JztcbiAgICBib3hfaHRtbCs9ZGF0YS50aXRsZTtcbiAgICBib3hfaHRtbCs9JzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xuXG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRlbnRcIj4nO1xuICAgIGJveF9odG1sKz1kYXRhLnF1ZXN0aW9uO1xuICAgIGJveF9odG1sKz0nPC9kaXY+JztcblxuICAgIGlmKGRhdGEuYnV0dG9uWWVzfHxkYXRhLmJ1dHRvbk5vKSB7XG4gICAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250cm9sXCI+JztcbiAgICAgIGlmIChkYXRhLmJ1dHRvblllcylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5feWVzXCI+JyArIGRhdGEuYnV0dG9uWWVzICsgJzwvZGl2Pic7XG4gICAgICBpZiAoZGF0YS5idXR0b25Obylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5fbm9cIj4nICsgZGF0YS5idXR0b25ObyArICc8L2Rpdj4nO1xuICAgICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG4gICAgfVxuXG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XG5cbiAgICBpZihkYXRhLmNhbGxiYWNrWWVzIT1mYWxzZSl7XG4gICAgICBub3RpZmljYXRpb25fYm94LmZpbmQoJy5ub3RpZnlfYnRuX3llcycpLm9uKCdjbGljaycsZGF0YS5jYWxsYmFja1llcy5iaW5kKGRhdGEub2JqKSk7XG4gICAgfVxuICAgIGlmKGRhdGEuY2FsbGJhY2tObyE9ZmFsc2Upe1xuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl9ubycpLm9uKCdjbGljaycsZGF0YS5jYWxsYmFja05vLmJpbmQoZGF0YS5vYmopKTtcbiAgICB9XG5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdzaG93X25vdGlmaScpO1xuICAgIH0sMTAwKVxuXG4gIH1cblxuICByZXR1cm4ge1xuICAgIGFsZXJ0OiBhbGVydCxcbiAgICBjb25maXJtOiBjb25maXJtXG4gIH07XG5cbn0pKCk7XG5cblxuJCgnW3JlZj1wb3B1cF0nKS5vbignY2xpY2snLGZ1bmN0aW9uIChlKXtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAkdGhpcz0kKHRoaXMpXG4gIGVsPSQoJHRoaXMuYXR0cignaHJlZicpKTtcbiAgZGF0YT1lbC5kYXRhKCk7XG5cbiAgZGF0YS5xdWVzdGlvbj1lbC5odG1sKCk7XG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcbn0pO1xuIiwiJCh3aW5kb3cpLmxvYWQoZnVuY3Rpb24oKSB7XG5cbiAgJCgnLmFjY29yZGlvbiAuYWNjb3JkaW9uLWNvbnRyb2wnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkdGhpcyA9ICQodGhpcyk7XG4gICAgJGFjY29yZGlvbiA9ICR0aGlzLmNsb3Nlc3QoJy5hY2NvcmRpb24nKTtcblxuICAgIGlmICgkYWNjb3JkaW9uLmhhc0NsYXNzKCdvcGVuJykpIHtcbiAgICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50JykuaGlkZSgzMDApO1xuICAgICAgJGFjY29yZGlvbi5yZW1vdmVDbGFzcygnb3BlbicpXG4gICAgfSBlbHNlIHtcbiAgICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50Jykuc2hvdygzMDApO1xuICAgICAgJGFjY29yZGlvbi5hZGRDbGFzcygnb3BlbicpXG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSk7XG59KVxuXG5vYmplY3RzID0gZnVuY3Rpb24gKGEsYikge1xuICB2YXIgYyA9IGIsXG4gICAga2V5O1xuICBmb3IgKGtleSBpbiBhKSB7XG4gICAgaWYgKGEuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgY1trZXldID0ga2V5IGluIGIgPyBiW2tleV0gOiBhW2tleV07XG4gICAgfVxuICB9XG4gIHJldHVybiBjO1xufTtcblxuKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBpbWdfbG9hZF9maW5pc2goKXtcbiAgICBkYXRhPXRoaXM7XG4gICAgZGF0YS5pbWcuYXR0cignc3JjJyxkYXRhLnNyYyk7XG4gIH1cblxuICBpbWdzPSQoJ3NlY3Rpb246bm90KC5uYXZpZ2F0aW9uKScpLmZpbmQoJy5sb2dvIGltZycpO1xuICBmb3IgKHZhciBpPTA7aTxpbWdzLmxlbmd0aDtpKyspe1xuICAgIGltZz1pbWdzLmVxKGkpO1xuICAgIHNyYz1pbWcuYXR0cignc3JjJyk7XG4gICAgaW1nLmF0dHIoJ3NyYycsJy9pbWFnZXMvdGVtcGxhdGUtbG9nby5qcGcnKTtcbiAgICBkYXRhPXtcbiAgICAgIHNyYzpzcmMsXG4gICAgICBpbWc6aW1nXG4gICAgfTtcbiAgICBpbWFnZT0kKCc8aW1nLz4nLHtcbiAgICAgIHNyYzpzcmNcbiAgICB9KS5vbignbG9hZCcsaW1nX2xvYWRfZmluaXNoLmJpbmQoZGF0YSkpXG4gIH1cbn0pKCk7XG5cbihmdW5jdGlvbigpIHtcbiAgZWxzPSQoJy5hamF4X2xvYWQnKTtcbiAgZm9yKGk9MDtpPGVscy5sZW5ndGg7aSsrKXtcbiAgICBlbD1lbHMuZXEoaSk7XG4gICAgdXJsPWVsLmF0dHIoJ3JlcycpO1xuICAgICQuZ2V0KHVybCxmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgJHRoaXM9JCh0aGlzKTtcbiAgICAgICR0aGlzLmh0bWwoZGF0YSk7XG4gICAgICBhamF4Rm9ybSgkdGhpcyk7XG4gICAgfS5iaW5kKGVsKSlcbiAgfVxufSkoKTtcblxuJCgnaW5wdXRbdHlwZT1maWxlXScpLm9uKCdjaGFuZ2UnLGZ1bmN0aW9uKGV2dCl7XG4gIHZhciBmaWxlID0gZXZ0LnRhcmdldC5maWxlczsgLy8gRmlsZUxpc3Qgb2JqZWN0XG4gIHZhciBmID0gZmlsZVswXTtcbiAgLy8gT25seSBwcm9jZXNzIGltYWdlIGZpbGVzLlxuICBpZiAoIWYudHlwZS5tYXRjaCgnaW1hZ2UuKicpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXG4gIGRhdGE9IHtcbiAgICAnZWwnOiB0aGlzLFxuICAgICdmJzogZlxuICB9O1xuICByZWFkZXIub25sb2FkID0gKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgaW1nPSQoJ1tmb3I9XCInK2RhdGEuZWwubmFtZSsnXCJdJyk7XG4gICAgICBpZihpbWcubGVuZ3RoPjApe1xuICAgICAgICBpbWcuYXR0cignc3JjJyxlLnRhcmdldC5yZXN1bHQpXG4gICAgICB9XG4gICAgfTtcbiAgfSkoZGF0YSk7XG4gIC8vIFJlYWQgaW4gdGhlIGltYWdlIGZpbGUgYXMgYSBkYXRhIFVSTC5cbiAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZik7XG59KTtcblxuJCgnYm9keScpLm9uKCdjbGljaycsJ2EuYWpheEZvcm1PcGVuJyxmdW5jdGlvbihlKXtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICBocmVmPXRoaXMuaHJlZi5zcGxpdCgnIycpO1xuICBocmVmPWhyZWZbaHJlZi5sZW5ndGgtMV07XG5cbiAgZGF0YT17XG4gICAgYnV0dG9uWWVzOmZhbHNlLFxuICAgIG5vdHlmeV9jbGFzczpcIm5vdGlmeV93aGl0ZSBsb2FkaW5nXCIsXG4gICAgcXVlc3Rpb246JydcbiAgfTtcbiAgbW9kYWxfY2xhc3M9JCh0aGlzKS5kYXRhKCdtb2RhbC1jbGFzcycpO1xuXG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcbiAgJC5nZXQoJy8nK2hyZWYsZnVuY3Rpb24oZGF0YSl7XG4gICAgJCgnLm5vdGlmeV9ib3gnKS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpLmh0bWwoZGF0YS5odG1sKTtcbiAgICBhamF4Rm9ybSgkKCcubm90aWZ5X2JveCAubm90aWZ5X2NvbnRlbnQnKSk7XG4gICAgaWYobW9kYWxfY2xhc3Mpe1xuICAgICAgJCgnLm5vdGlmeV9ib3ggLm5vdGlmeV9jb250ZW50IC5yb3cnKS5hZGRDbGFzcyhtb2RhbF9jbGFzcyk7XG4gICAgfVxuICB9LCdqc29uJylcbn0pOyIsImZ1bmN0aW9uIGFqYXhGb3JtKGVscykge1xuICB2YXIgZmlsZUFwaSA9IHdpbmRvdy5GaWxlICYmIHdpbmRvdy5GaWxlUmVhZGVyICYmIHdpbmRvdy5GaWxlTGlzdCAmJiB3aW5kb3cuQmxvYiA/IHRydWUgOiBmYWxzZTtcbiAgdmFyIGRlZmF1bHRzID0ge1xuICAgIGVycm9yX2NsYXNzOiAnLmhhcy1lcnJvcicsXG4gIH07XG5cbiAgZnVuY3Rpb24gb25Qb3N0KHBvc3Qpe1xuICAgIHZhciBkYXRhPXRoaXM7XG4gICAgZm9ybT1kYXRhLmZvcm07XG4gICAgd3JhcD1kYXRhLndyYXA7XG4gICAgaWYocG9zdC5yZW5kZXIpe1xuICAgICAgcG9zdC5ub3R5ZnlfY2xhc3M9XCJub3RpZnlfd2hpdGVcIjtcbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydChwb3N0KTtcbiAgICB9ZWxzZXtcbiAgICAgIHdyYXAucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgIHdyYXAuaHRtbChwb3N0Lmh0bWwpO1xuICAgICAgYWpheEZvcm0od3JhcCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb25GYWlsKCl7XG4gICAgdmFyIGRhdGE9dGhpcztcbiAgICBmb3JtPWRhdGEuZm9ybTtcbiAgICB3cmFwPWRhdGEud3JhcDtcbiAgICB3cmFwLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgd3JhcC5odG1sKCfQntGI0LjQsdC60LAg0L7QsdGA0LDQsdC+0YLQutC4INGE0L7RgNC80Ysg0L/QvtC/0YDQvtCx0YPQudGC0LUg0L/QvtC30LbQtScpO1xuICAgIGFqYXhGb3JtKHdyYXApO1xuXG4gIH1cblxuICBmdW5jdGlvbiBvblN1Ym1pdChlKXtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIGRhdGE9dGhpcztcbiAgICBmb3JtPWRhdGEuZm9ybTtcbiAgICB3cmFwPWRhdGEud3JhcDtcblxuICAgIGlmKGZvcm0ueWlpQWN0aXZlRm9ybSl7XG4gICAgICBmb3JtLnlpaUFjdGl2ZUZvcm0oJ3ZhbGlkYXRlJyk7XG4gICAgfTtcblxuICAgIGlzVmFsaWQ9KGZvcm0uZmluZChkYXRhLnBhcmFtLmVycm9yX2NsYXNzKS5sZW5ndGg9PTApO1xuXG4gICAgaWYoIWlzVmFsaWQpe1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1lbHNle1xuICAgICAgcmVxdWlyZWQ9Zm9ybS5maW5kKCdpbnB1dC5yZXF1aXJlZCcpO1xuICAgICAgZm9yKGk9MDtpPHJlcXVpcmVkLmxlbmd0aDtpKyspe1xuICAgICAgICBpZihyZXF1aXJlZC5lcShpKS52YWwoKS5sZW5ndGg8MSl7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZighZm9ybS5zZXJpYWxpemVPYmplY3QpYWRkU1JPKCk7XG5cbiAgICB2YXIgcG9zdD1mb3JtLnNlcmlhbGl6ZU9iamVjdCgpO1xuICAgIGZvcm0uYWRkQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICBmb3JtLmh0bWwoJycpO1xuXG4gICAgJC5wb3N0KFxuICAgICAgZGF0YS51cmwsXG4gICAgICBwb3N0LFxuICAgICAgb25Qb3N0LmJpbmQoZGF0YSksXG4gICAgICAnanNvbidcbiAgICApLmZhaWwob25GYWlsLmJpbmQoZGF0YSkpO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZWxzLmZpbmQoJ1tyZXF1aXJlZF0nKVxuICAgIC5hZGRDbGFzcygncmVxdWlyZWQnKVxuICAgIC5yZW1vdmVBdHRyKCdyZXF1aXJlZCcpO1xuXG4gIGZvcih2YXIgaT0wO2k8ZWxzLmxlbmd0aDtpKyspe1xuICAgIHdyYXA9ZWxzLmVxKGkpO1xuICAgIGZvcm09d3JhcC5maW5kKCdmb3JtJyk7XG4gICAgZGF0YT17XG4gICAgICBmb3JtOmZvcm0sXG4gICAgICBwYXJhbTpkZWZhdWx0cyxcbiAgICAgIHdyYXA6d3JhcFxuICAgIH07XG4gICAgZGF0YS51cmw9Zm9ybS5hdHRyKCdhY3Rpb24nKSB8fCBsb2NhdGlvbi5ocmVmO1xuICAgIGRhdGEubWV0aG9kPSBmb3JtLmF0dHIoJ21ldGhvZCcpIHx8ICdwb3N0JztcbiAgICBmb3JtLm9mZignc3VibWl0Jyk7XG4gICAgZm9ybS5vbignc3VibWl0Jywgb25TdWJtaXQuYmluZChkYXRhKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYWRkU1JPKCl7XG4gICQuZm4uc2VyaWFsaXplT2JqZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBvID0ge307XG4gICAgdmFyIGEgPSB0aGlzLnNlcmlhbGl6ZUFycmF5KCk7XG4gICAgJC5lYWNoKGEsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChvW3RoaXMubmFtZV0pIHtcbiAgICAgICAgaWYgKCFvW3RoaXMubmFtZV0ucHVzaCkge1xuICAgICAgICAgIG9bdGhpcy5uYW1lXSA9IFtvW3RoaXMubmFtZV1dO1xuICAgICAgICB9XG4gICAgICAgIG9bdGhpcy5uYW1lXS5wdXNoKHRoaXMudmFsdWUgfHwgJycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb1t0aGlzLm5hbWVdID0gdGhpcy52YWx1ZSB8fCAnJztcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbztcbiAgfTtcbn07XG5hZGRTUk8oKTsiLCIkKCdib2R5Jykub24oJ2NsaWNrJywnYVtocmVmPSNsb2dpbl0sYVtocmVmPSNyZWdpc3RyYXRpb25dLGFbaHJlZj0jcmVzZXRwYXNzd29yZF0nLGZ1bmN0aW9uKGUpe1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIC8v0L/RgNC4INC+0YLQutGA0YvRgtC40Lgg0YTQvtGA0LzRiyDRgNC10LPQuNGB0YLRgNCw0YbQuNC4INC30LDQutGA0YvRgtGMLCDQtdGB0LvQuCDQvtGC0YDRi9GC0L4gLSDQv9C+0L/QsNC/INC40YHQv9C+0LvRjNC30L7QstCw0L3QuNGPINC60YPQv9C+0L3QsCDQsdC10Lcg0YDQtdCz0LjRgdGC0YDQsNGG0LjQuFxuICB2YXIgcG9wdXAgPSAkKFwiYVtocmVmPScjc2hvd3Byb21vY29kZS1ub3JlZ2lzdGVyJ11cIikuZGF0YSgncG9wdXAnKTtcbiAgaWYgKHBvcHVwKSB7XG4gICAgcG9wdXAuY2xvc2UoKTtcbiAgfSBlbHNlIHtcbiAgICBwb3B1cCA9ICQoJ2Rpdi5wb3B1cF9jb250LCBkaXYucG9wdXBfYmFjaycpO1xuICAgIGlmIChwb3B1cCkge1xuICAgICAgcG9wdXAuaGlkZSgpO1xuICAgIH1cbiAgfVxuICBocmVmPXRoaXMuaHJlZi5zcGxpdCgnIycpO1xuICBocmVmPWhyZWZbaHJlZi5sZW5ndGgtMV07XG5cbiAgZGF0YT17XG4gICAgYnV0dG9uWWVzOmZhbHNlLFxuICAgIG5vdHlmeV9jbGFzczpcIm5vdGlmeV93aGl0ZSBsb2FkaW5nXCIsXG4gICAgcXVlc3Rpb246JydcbiAgfTtcbiAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xuICAkLmdldCgnLycraHJlZixmdW5jdGlvbihkYXRhKXtcbiAgICAkKCcubm90aWZ5X2JveCcpLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgJCgnLm5vdGlmeV9ib3ggLm5vdGlmeV9jb250ZW50JykuaHRtbChkYXRhLmh0bWwpO1xuICAgIGFqYXhGb3JtKCQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpKTtcbiAgfSwnanNvbicpXG59KTtcblxuJChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gc3Rhck5vbWluYXRpb24oaW5kZXgpIHtcbiAgICB2YXIgc3RhcnMgPSAkKFwiLm5vdGlmeV9jb250ZW50IC5yYXRpbmcgLmZhLXdyYXBwZXIgLmZhXCIpO1xuICAgIHN0YXJzLnJlbW92ZUNsYXNzKFwiZmEtc3RhclwiKS5hZGRDbGFzcyhcImZhLXN0YXItb1wiKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluZGV4OyBpKyspIHtcbiAgICAgIHN0YXJzLmVxKGkpLnJlbW92ZUNsYXNzKFwiZmEtc3Rhci1vXCIpLmFkZENsYXNzKFwiZmEtc3RhclwiKTtcbiAgICB9XG4gIH1cblxuICAkKGRvY3VtZW50KS5vbihcIm1vdXNlb3ZlclwiLCBcIi5ub3RpZnlfY29udGVudCAucmF0aW5nIC5mYS13cmFwcGVyIC5mYVwiLCBmdW5jdGlvbiAoZSkge1xuICAgIHN0YXJOb21pbmF0aW9uKCQodGhpcykuaW5kZXgoKSArIDEpO1xuICB9KS5vbihcIm1vdXNlbGVhdmVcIiwgXCIubm90aWZ5X2NvbnRlbnQgLnJhdGluZyAuZmEtd3JhcHBlclwiLCBmdW5jdGlvbiAoZSkge1xuICAgIHN0YXJOb21pbmF0aW9uKCQoXCIubm90aWZ5X2NvbnRlbnQgaW5wdXRbbmFtZT1cXFwiUmV2aWV3c1tyYXRpbmddXFxcIl1cIikudmFsKCkpO1xuICB9KS5vbihcImNsaWNrXCIsIFwiLm5vdGlmeV9jb250ZW50IC5yYXRpbmcgLmZhLXdyYXBwZXIgLmZhXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgc3Rhck5vbWluYXRpb24oJCh0aGlzKS5pbmRleCgpICsgMSk7XG5cbiAgICAkKFwiLm5vdGlmeV9jb250ZW50IGlucHV0W25hbWU9XFxcIlJldmlld3NbcmF0aW5nXVxcXCJdXCIpLnZhbCgkKHRoaXMpLmluZGV4KCkgKyAxKTtcbiAgfSk7XG59KTtcblxuYWpheEZvcm0oJCgnLmFqYXhfZm9ybScpKTtcblxuXG4kKFwiYVtocmVmPScjc2hvd3Byb21vY29kZS1ub3JlZ2lzdGVyJ11cIikucG9wdXAoe1xuICBjb250ZW50IDogJzxkaXYgY2xhc3M9XCJjb3Vwb24tbm9yZWdpc3RlclwiPicrXG4gICc8ZGl2IGNsYXNzPVwiY291cG9uLW5vcmVnaXN0ZXJfX2ljb25cIj48aW1nIHNyYz1cIi9pbWFnZXMvdGVtcGxhdGVzL3N3YS5wbmdcIiBhbHQ9XCJcIj48L2Rpdj4nK1xuICAnPGRpdiBjbGFzcz1cImNvdXBvbi1ub3JlZ2lzdGVyX190ZXh0XCI+0JTQu9GPINC/0L7Qu9GD0YfQtdC90LjRjyDQutGN0YjQsdGN0LrQsCDQvdC10L7QsdGF0L7QtNC40LzQvjwvYnI+0LDQstGC0L7RgNC40LfQvtCy0LDRgtGM0YHRjyDQvdCwINGB0LDQudGC0LU8L2Rpdj4nICtcbiAgJzxkaXYgY2xhc3M9XCJjb3Vwb24tbm9yZWdpc3Rlcl9fYnV0dG9uc1wiPicrXG4gICc8YSBocmVmPVwiZ290by9jb3Vwb246e2lkfVwiIHRhcmdldD1cIl9ibGFua1wiIGNsYXNzPVwiYnRuICBidG4tcG9wdXBcIj7QktC+0YHQv9C+0LvRjNC30L7QstCw0YLRjNGB0Y88L2JyPtC60YPQv9C+0L3QvtC8PC9icj7QsdC10Lcg0YDQtdCz0LjRgdGC0YDQsNGG0LjQuDwvYT4nK1xuICAnPGEgaHJlZj1cIiNyZWdpc3RyYXRpb25cIiBjbGFzcz1cImJ0biBidG4tcG9wdXBcIj7Ql9Cw0YDQtdCz0LjRgdGC0YDQuNGA0L7QstCw0YLRjNGB0Y88L2JyPtC4INC/0L7Qu9GD0YfQuNGC0Yw8L2JyPtC10YnRkSDQuCDQutGN0YjQsdGN0Lo8L2E+JytcbiAgJzwvZGl2PicrXG4gICc8ZGl2PicsXG4gIHR5cGUgOiAnaHRtbCcsXG4gIGJlZm9yZU9wZW46IGZ1bmN0aW9uKCkge1xuICAgIC8v0LfQsNC80LXQvdC40YLRjCDQsiDQutC+0L3RgtC10L3RgtC1IHtpZH1cbiAgICB2YXIgaWQgPSAkKHRoaXMuZWxlKS5kYXRhKCdpZCcpO1xuICAgIHRoaXMuby5jb250ZW50ID0gdGhpcy5vLmNvbnRlbnQucmVwbGFjZSgne2lkfScsIGlkKTtcbiAgICAvL9C10YHQu9C4INC30LDQutGA0YvQu9C4INC/0YDQuNC90YPQtNC40YLQtdC70YzQvdC+LCDRgtC+INC/0L7QutCw0LfQsNGC0YxcbiAgICBwb3B1cCA9ICQoJ2Rpdi5wb3B1cF9jb250LCBkaXYucG9wdXBfYmFjaycpO1xuICAgIGlmIChwb3B1cCkge1xuICAgICAgcG9wdXAuc2hvdygpO1xuICAgIH1cbiAgfSxcbiAgYWZ0ZXJPcGVuOiBmdW5jdGlvbigpIHtcbiAgICAkKCcucG9wdXBfY29udGVudCcpWzBdLmlubmVySFRNTCA9IHRoaXMuby5jb250ZW50O1xuICB9XG59KTtcbiQoXCJhW2hyZWY9JyNjb21tZW50LXBvcHVwJ11cIikucG9wdXAoe1xuICBjb250ZW50IDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNvbnRlbnQgPSB0aGlzLmVsZS5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgIGNvbnRlbnQuc2V0QXR0cmlidXRlKCdkYXRhLWNvbW1lbnQtaWQnLCAnOTk5OScpO1xuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkaXYuY2xhc3NOYW1lID0gJ2NvbW1lbnRzJztcbiAgICBkaXYuYXBwZW5kKGNvbnRlbnQpO1xuICAgICQoZGl2KS5maW5kKCcuY3VycmVudC1jb21tZW50X19tb3JlJykucmVtb3ZlKCk7XG4gICAgJChkaXYpLmZpbmQoJy5jb21tZW50Lmxpc3QnKS5yZW1vdmVDbGFzcygnbGlzdCcpO1xuICAgIHJldHVybiBkaXY7XG4gIH0sXG4gIHdpZHRoOiA1MDBcbn0pO1xuLy/Qv9GA0L7QudGC0Lgg0L/QviDQutC+0LzQvNC10L3RgtCw0LwsINC+0LPRgNCw0L3QuNGH0LjRgtGMINC00LvQuNC90YMg0YLQtdC60YHRgtCwLCDQstGB0YLQsNCy0LjRgtGMINGB0YHRi9C70LrRgyBcItC/0L7QutCw0LfQsNGC0Ywg0L/QvtC70L3QvtGB0YLRjNGOXCJcbiQoJy5jdXJyZW50LWNvbW1lbnQnKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbGVtZW50KSB7XG4gIHZhciB0ZXh0ID0gJChlbGVtZW50KS5maW5kKCcudGV4dCcpO1xuICB2YXIgY29tbWVudCA9ICQodGV4dCkuZmluZCgnLmNvbW1lbnQnKTtcbiAgaWYgKGNvbW1lbnRbMF0uaW5uZXJIVE1MLmxlbmd0aCA+IDIxMCkge1xuICAgIHZhciBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIGEuY2xhc3NOYW1lID0gJ2N1cnJlbnQtY29tbWVudF9fbW9yZSc7XG4gICAgYS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCAnI2NvbW1lbnQtcG9wdXAnKTtcbiAgICBhLmlubmVySFRNTCA9ICfQn9C+0LrQsNC30LDRgtGMINC/0L7Qu9C90L7RgdGC0YzRjic7XG4gICAgdGV4dC5hcHBlbmQoYSk7XG4gIH1cbn0pOyJdfQ==
