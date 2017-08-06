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
            if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
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
                                        '#givefeedback' : {
                                            'h3' : 'Отзыв о сайте',
                                            'input[name=type]' : 'feedback'
                                        },
                                        '#reviewstore' : {
                                            'h3' : 'Отзыв о магазине ' + $("#store-information").attr("data-store-name"),
                                            'input[name=type]' : 'review_' + $("#store-information").attr("data-store-id")
                                        }
                                    };

                            if($.inArray(activeElement, ['#login', '#registration']) != -1) {
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
                            }
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
                            'a[href=#givefeedback]' :  $("#top").find('.popup-givefeedback').html(),
                            'a[href=#reviewstore]' :  $("#top").find('.popup-givefeedback').html(),
                            'a[href=#cert]' :  $("#top").find('.popup-cert').html(),
                            //'a[href=#password-recovery]' : $("#top").find('.popup-recovery').html()
                      }

                //this.registration(popups);

                /*$(document).on("click", "#top a[href=#password-recovery]", function() {
                    $("#top .popup-sign-up").closest(".popup").next(".popup_close").click();
                });*/

                $(document).on("mouseover", "#top .popup .feedback.popup-content .rating .fa-wrapper .fa", function(e) {
                      self.starNomination($(this).index() + 1);
                }).on("mouseleave", "#top .popup .feedback.popup-content .rating .fa-wrapper", function(e) {
                      self.starNomination($("#top .popup .feedback.popup-content input[name=rating]").val());                
                }).on("click", "#top .popup .feedback.popup-content .rating .fa-wrapper .fa", function(e) {
                      self.starNomination($(this).index() + 1);

                      $("#top .popup .feedback.popup-content input[name=rating]").val($(this).index() + 1);
                });

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

    var reviews = {
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
    }

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
    reviews.control.events();
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
    $("#top").find(".c-wrapper").mCustomScrollbar({
        axis:"y",
        setHeight: 700
    });
    $("#top").find(".cm-wrapper").mCustomScrollbar({
        axis:"y",
        setHeight: 640
    });
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
    $("#top").find(".comments .current-comment .text .comment").mCustomScrollbar({
        axis:"y",
        setHeight: 150,
        theme: "dark"
    }); 
    $("#top").find(".categories ul:not(.subcategories)").mCustomScrollbar({
        axis:"y",
        setHeight: 250
    });

    /*$('[data-toggle="tooltip"]').tooltip({
        delay: {
            show: 500, hide: 2000
        }
    });*/
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

        koef=$this.find('input').attr('data-cashback');
        promo=$this.find('input').attr('data-cashback-promo');

        if(koef.indexOf('%')>0){
            result=parseNum(koef)*val*curs/100;
        }else{
            result=parseNum(koef)
        }

        if(parseNum(promo)>0) {
            if(promo.indexOf('%')>0){
                promo=parseNum(promo)*val*curs/100;
            }else{
                promo=parseNum(promo)
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
    $('body').removeClass('show_notifi');
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
      $('body').addClass('show_notifi');
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
      $('body').addClass('show_notifi');
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

    post=form.serializeObject();
    form.addClass('loading');
    form.html('');

    $.post(data.url,post,onPost.bind(data),'json');

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

ajaxForm($('.ajax_form'));
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJldGluYS5qcyIsImpxdWVyeS5mYW5jeWJveC5wYWNrLmpzIiwic2NyaXB0cy5qcyIsImpxdWVyeS5mbGV4c2xpZGVyLW1pbi5qcyIsImNsYXNzaWUuanMiLCJqcXVlcnkucG9wdXAubWluLmpzIiwiYW5pbW8uanMiLCJqcXVlcnkud2F5cG9pbnRzLm1pbi5qcyIsImpxdWVyeS5wbHVnaW4ubWluLmpzIiwianF1ZXJ5LmNvdW50ZG93bi5taW4uanMiLCJqcXVlcnkubm90eS5wYWNrYWdlZC5taW4uanMiLCJqcXVlcnkubW9ja2pheC5qcyIsImpxdWVyeS5hdXRvY29tcGxldGUuanMiLCJtYWluLmpzIiwibm90aWZpY2F0aW9uLmpzIiwiZm9yX2FsbC5qcyIsImpxdWVyeS5hamF4Rm9ybS5qcyIsIm15LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4bEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzE5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3h2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiBSZXRpbmEuanMgdjEuMy4wXG4gKlxuICogQ29weXJpZ2h0IDIwMTQgSW11bHVzLCBMTENcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICpcbiAqIFJldGluYS5qcyBpcyBhbiBvcGVuIHNvdXJjZSBzY3JpcHQgdGhhdCBtYWtlcyBpdCBlYXN5IHRvIHNlcnZlXG4gKiBoaWdoLXJlc29sdXRpb24gaW1hZ2VzIHRvIGRldmljZXMgd2l0aCByZXRpbmEgZGlzcGxheXMuXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICAgIHZhciByb290ID0gKHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IGV4cG9ydHMpO1xuICAgIHZhciBjb25maWcgPSB7XG4gICAgICAgIC8vIEFuIG9wdGlvbiB0byBjaG9vc2UgYSBzdWZmaXggZm9yIDJ4IGltYWdlc1xuICAgICAgICByZXRpbmFJbWFnZVN1ZmZpeCA6ICdAMngnLFxuXG4gICAgICAgIC8vIEVuc3VyZSBDb250ZW50LVR5cGUgaXMgYW4gaW1hZ2UgYmVmb3JlIHRyeWluZyB0byBsb2FkIEAyeCBpbWFnZVxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vaW11bHVzL3JldGluYWpzL3B1bGwvNDUpXG4gICAgICAgIGNoZWNrX21pbWVfdHlwZTogdHJ1ZSxcblxuICAgICAgICAvLyBSZXNpemUgaGlnaC1yZXNvbHV0aW9uIGltYWdlcyB0byBvcmlnaW5hbCBpbWFnZSdzIHBpeGVsIGRpbWVuc2lvbnNcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2ltdWx1cy9yZXRpbmFqcy9pc3N1ZXMvOFxuICAgICAgICBmb3JjZV9vcmlnaW5hbF9kaW1lbnNpb25zOiB0cnVlXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIFJldGluYSgpIHt9XG5cbiAgICByb290LlJldGluYSA9IFJldGluYTtcblxuICAgIFJldGluYS5jb25maWd1cmUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIGlmIChvcHRpb25zID09PSBudWxsKSB7XG4gICAgICAgICAgICBvcHRpb25zID0ge307XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBwcm9wIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnW3Byb3BdID0gb3B0aW9uc1twcm9wXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBSZXRpbmEuaW5pdCA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICAgICAgaWYgKGNvbnRleHQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnRleHQgPSByb290O1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGV4aXN0aW5nX29ubG9hZCA9IGNvbnRleHQub25sb2FkIHx8IGZ1bmN0aW9uKCl7fTtcblxuICAgICAgICBjb250ZXh0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGltYWdlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbWcnKSwgcmV0aW5hSW1hZ2VzID0gW10sIGksIGltYWdlO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGltYWdlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIGltYWdlID0gaW1hZ2VzW2ldO1xuICAgICAgICAgICAgICAgIGlmICghISFpbWFnZS5nZXRBdHRyaWJ1dGVOb2RlKCdkYXRhLW5vLXJldGluYScpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldGluYUltYWdlcy5wdXNoKG5ldyBSZXRpbmFJbWFnZShpbWFnZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGV4aXN0aW5nX29ubG9hZCgpO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICBSZXRpbmEuaXNSZXRpbmEgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgbWVkaWFRdWVyeSA9ICcoLXdlYmtpdC1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAxLjUpLCAobWluLS1tb3otZGV2aWNlLXBpeGVsLXJhdGlvOiAxLjUpLCAoLW8tbWluLWRldmljZS1waXhlbC1yYXRpbzogMy8yKSwgKG1pbi1yZXNvbHV0aW9uOiAxLjVkcHB4KSc7XG5cbiAgICAgICAgaWYgKHJvb3QuZGV2aWNlUGl4ZWxSYXRpbyA+IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJvb3QubWF0Y2hNZWRpYSAmJiByb290Lm1hdGNoTWVkaWEobWVkaWFRdWVyeSkubWF0Y2hlcykge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuXG4gICAgdmFyIHJlZ2V4TWF0Y2ggPSAvXFwuXFx3KyQvO1xuICAgIGZ1bmN0aW9uIHN1ZmZpeFJlcGxhY2UgKG1hdGNoKSB7XG4gICAgICAgIHJldHVybiBjb25maWcucmV0aW5hSW1hZ2VTdWZmaXggKyBtYXRjaDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBSZXRpbmFJbWFnZVBhdGgocGF0aCwgYXRfMnhfcGF0aCkge1xuICAgICAgICB0aGlzLnBhdGggPSBwYXRoIHx8ICcnO1xuICAgICAgICBpZiAodHlwZW9mIGF0XzJ4X3BhdGggIT09ICd1bmRlZmluZWQnICYmIGF0XzJ4X3BhdGggIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuYXRfMnhfcGF0aCA9IGF0XzJ4X3BhdGg7XG4gICAgICAgICAgICB0aGlzLnBlcmZvcm1fY2hlY2sgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh1bmRlZmluZWQgIT09IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbG9jYXRpb25PYmplY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICAgICAgbG9jYXRpb25PYmplY3QuaHJlZiA9IHRoaXMucGF0aDtcbiAgICAgICAgICAgICAgICBsb2NhdGlvbk9iamVjdC5wYXRobmFtZSA9IGxvY2F0aW9uT2JqZWN0LnBhdGhuYW1lLnJlcGxhY2UocmVnZXhNYXRjaCwgc3VmZml4UmVwbGFjZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5hdF8yeF9wYXRoID0gbG9jYXRpb25PYmplY3QuaHJlZjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhcnRzID0gdGhpcy5wYXRoLnNwbGl0KCc/Jyk7XG4gICAgICAgICAgICAgICAgcGFydHNbMF0gPSBwYXJ0c1swXS5yZXBsYWNlKHJlZ2V4TWF0Y2gsIHN1ZmZpeFJlcGxhY2UpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXRfMnhfcGF0aCA9IHBhcnRzLmpvaW4oJz8nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucGVyZm9ybV9jaGVjayA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByb290LlJldGluYUltYWdlUGF0aCA9IFJldGluYUltYWdlUGF0aDtcblxuICAgIFJldGluYUltYWdlUGF0aC5jb25maXJtZWRfcGF0aHMgPSBbXTtcblxuICAgIFJldGluYUltYWdlUGF0aC5wcm90b3R5cGUuaXNfZXh0ZXJuYWwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICEhKHRoaXMucGF0aC5tYXRjaCgvXmh0dHBzP1xcOi9pKSAmJiAhdGhpcy5wYXRoLm1hdGNoKCcvLycgKyBkb2N1bWVudC5kb21haW4pICk7XG4gICAgfTtcblxuICAgIFJldGluYUltYWdlUGF0aC5wcm90b3R5cGUuY2hlY2tfMnhfdmFyaWFudCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBodHRwLCB0aGF0ID0gdGhpcztcbiAgICAgICAgaWYgKHRoaXMuaXNfZXh0ZXJuYWwoKSkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5wZXJmb3JtX2NoZWNrICYmIHR5cGVvZiB0aGlzLmF0XzJ4X3BhdGggIT09ICd1bmRlZmluZWQnICYmIHRoaXMuYXRfMnhfcGF0aCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHRydWUpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYXRfMnhfcGF0aCBpbiBSZXRpbmFJbWFnZVBhdGguY29uZmlybWVkX3BhdGhzKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sodHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICBodHRwLm9wZW4oJ0hFQUQnLCB0aGlzLmF0XzJ4X3BhdGgpO1xuICAgICAgICAgICAgaHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAoaHR0cC5yZWFkeVN0YXRlICE9PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGh0dHAuc3RhdHVzID49IDIwMCAmJiBodHRwLnN0YXR1cyA8PSAzOTkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZy5jaGVja19taW1lX3R5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0eXBlID0gaHR0cC5nZXRSZXNwb25zZUhlYWRlcignQ29udGVudC1UeXBlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gbnVsbCB8fCAhdHlwZS5tYXRjaCgvXmltYWdlL2kpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIFJldGluYUltYWdlUGF0aC5jb25maXJtZWRfcGF0aHMucHVzaCh0aGF0LmF0XzJ4X3BhdGgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaHR0cC5zZW5kKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICBmdW5jdGlvbiBSZXRpbmFJbWFnZShlbCkge1xuICAgICAgICB0aGlzLmVsID0gZWw7XG4gICAgICAgIHRoaXMucGF0aCA9IG5ldyBSZXRpbmFJbWFnZVBhdGgodGhpcy5lbC5nZXRBdHRyaWJ1dGUoJ3NyYycpLCB0aGlzLmVsLmdldEF0dHJpYnV0ZSgnZGF0YS1hdDJ4JykpO1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIHRoaXMucGF0aC5jaGVja18yeF92YXJpYW50KGZ1bmN0aW9uKGhhc1ZhcmlhbnQpIHtcbiAgICAgICAgICAgIGlmIChoYXNWYXJpYW50KSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zd2FwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJvb3QuUmV0aW5hSW1hZ2UgPSBSZXRpbmFJbWFnZTtcblxuICAgIFJldGluYUltYWdlLnByb3RvdHlwZS5zd2FwID0gZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICBpZiAodHlwZW9mIHBhdGggPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBwYXRoID0gdGhpcy5wYXRoLmF0XzJ4X3BhdGg7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIGZ1bmN0aW9uIGxvYWQoKSB7XG4gICAgICAgICAgICBpZiAoISB0aGF0LmVsLmNvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChsb2FkLCA1KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbmZpZy5mb3JjZV9vcmlnaW5hbF9kaW1lbnNpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZWwuc2V0QXR0cmlidXRlKCd3aWR0aCcsIHRoYXQuZWwub2Zmc2V0V2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmVsLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgdGhhdC5lbC5vZmZzZXRIZWlnaHQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoYXQuZWwuc2V0QXR0cmlidXRlKCdzcmMnLCBwYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsb2FkKCk7XG4gICAgfTtcblxuXG4gICAgaWYgKFJldGluYS5pc1JldGluYSgpKSB7XG4gICAgICAgIFJldGluYS5pbml0KHJvb3QpO1xuICAgIH1cbn0pKCk7XG4iLCIvKiEgZmFuY3lCb3ggdjIuMS41IGZhbmN5YXBwcy5jb20gfCBmYW5jeWFwcHMuY29tL2ZhbmN5Ym94LyNsaWNlbnNlICovXG4oZnVuY3Rpb24ocixHLGYsdil7dmFyIEo9ZihcImh0bWxcIiksbj1mKHIpLHA9ZihHKSxiPWYuZmFuY3lib3g9ZnVuY3Rpb24oKXtiLm9wZW4uYXBwbHkodGhpcyxhcmd1bWVudHMpfSxJPW5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL21zaWUvaSksQj1udWxsLHM9Ry5jcmVhdGVUb3VjaCE9PXYsdD1mdW5jdGlvbihhKXtyZXR1cm4gYSYmYS5oYXNPd25Qcm9wZXJ0eSYmYSBpbnN0YW5jZW9mIGZ9LHE9ZnVuY3Rpb24oYSl7cmV0dXJuIGEmJlwic3RyaW5nXCI9PT1mLnR5cGUoYSl9LEU9ZnVuY3Rpb24oYSl7cmV0dXJuIHEoYSkmJjA8YS5pbmRleE9mKFwiJVwiKX0sbD1mdW5jdGlvbihhLGQpe3ZhciBlPXBhcnNlSW50KGEsMTApfHwwO2QmJkUoYSkmJihlKj1iLmdldFZpZXdwb3J0KClbZF0vMTAwKTtyZXR1cm4gTWF0aC5jZWlsKGUpfSx3PWZ1bmN0aW9uKGEsYil7cmV0dXJuIGwoYSxiKStcInB4XCJ9O2YuZXh0ZW5kKGIse3ZlcnNpb246XCIyLjEuNVwiLGRlZmF1bHRzOntwYWRkaW5nOjE1LG1hcmdpbjoyMCxcbndpZHRoOjgwMCxoZWlnaHQ6NjAwLG1pbldpZHRoOjEwMCxtaW5IZWlnaHQ6MTAwLG1heFdpZHRoOjk5OTksbWF4SGVpZ2h0Ojk5OTkscGl4ZWxSYXRpbzoxLGF1dG9TaXplOiEwLGF1dG9IZWlnaHQ6ITEsYXV0b1dpZHRoOiExLGF1dG9SZXNpemU6ITAsYXV0b0NlbnRlcjohcyxmaXRUb1ZpZXc6ITAsYXNwZWN0UmF0aW86ITEsdG9wUmF0aW86MC41LGxlZnRSYXRpbzowLjUsc2Nyb2xsaW5nOlwiYXV0b1wiLHdyYXBDU1M6XCJcIixhcnJvd3M6ITAsY2xvc2VCdG46ITAsY2xvc2VDbGljazohMSxuZXh0Q2xpY2s6ITEsbW91c2VXaGVlbDohMCxhdXRvUGxheTohMSxwbGF5U3BlZWQ6M0UzLHByZWxvYWQ6Myxtb2RhbDohMSxsb29wOiEwLGFqYXg6e2RhdGFUeXBlOlwiaHRtbFwiLGhlYWRlcnM6e1wiWC1mYW5jeUJveFwiOiEwfX0saWZyYW1lOntzY3JvbGxpbmc6XCJhdXRvXCIscHJlbG9hZDohMH0sc3dmOnt3bW9kZTpcInRyYW5zcGFyZW50XCIsYWxsb3dmdWxsc2NyZWVuOlwidHJ1ZVwiLGFsbG93c2NyaXB0YWNjZXNzOlwiYWx3YXlzXCJ9LFxua2V5czp7bmV4dDp7MTM6XCJsZWZ0XCIsMzQ6XCJ1cFwiLDM5OlwibGVmdFwiLDQwOlwidXBcIn0scHJldjp7ODpcInJpZ2h0XCIsMzM6XCJkb3duXCIsMzc6XCJyaWdodFwiLDM4OlwiZG93blwifSxjbG9zZTpbMjddLHBsYXk6WzMyXSx0b2dnbGU6WzcwXX0sZGlyZWN0aW9uOntuZXh0OlwibGVmdFwiLHByZXY6XCJyaWdodFwifSxzY3JvbGxPdXRzaWRlOiEwLGluZGV4OjAsdHlwZTpudWxsLGhyZWY6bnVsbCxjb250ZW50Om51bGwsdGl0bGU6bnVsbCx0cGw6e3dyYXA6JzxkaXYgY2xhc3M9XCJmYW5jeWJveC13cmFwXCIgdGFiSW5kZXg9XCItMVwiPjxkaXYgY2xhc3M9XCJmYW5jeWJveC1za2luXCI+PGRpdiBjbGFzcz1cImZhbmN5Ym94LW91dGVyXCI+PGRpdiBjbGFzcz1cImZhbmN5Ym94LWlubmVyXCI+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+JyxpbWFnZTonPGltZyBjbGFzcz1cImZhbmN5Ym94LWltYWdlXCIgc3JjPVwie2hyZWZ9XCIgYWx0PVwiXCIgLz4nLGlmcmFtZTonPGlmcmFtZSBpZD1cImZhbmN5Ym94LWZyYW1le3JuZH1cIiBuYW1lPVwiZmFuY3lib3gtZnJhbWV7cm5kfVwiIGNsYXNzPVwiZmFuY3lib3gtaWZyYW1lXCIgZnJhbWVib3JkZXI9XCIwXCIgdnNwYWNlPVwiMFwiIGhzcGFjZT1cIjBcIiB3ZWJraXRBbGxvd0Z1bGxTY3JlZW4gbW96YWxsb3dmdWxsc2NyZWVuIGFsbG93RnVsbFNjcmVlbicrXG4oST8nIGFsbG93dHJhbnNwYXJlbmN5PVwidHJ1ZVwiJzpcIlwiKStcIj48L2lmcmFtZT5cIixlcnJvcjonPHAgY2xhc3M9XCJmYW5jeWJveC1lcnJvclwiPlRoZSByZXF1ZXN0ZWQgY29udGVudCBjYW5ub3QgYmUgbG9hZGVkLjxici8+UGxlYXNlIHRyeSBhZ2FpbiBsYXRlci48L3A+JyxjbG9zZUJ0bjonPGEgdGl0bGU9XCJDbG9zZVwiIGNsYXNzPVwiZmFuY3lib3gtaXRlbSBmYW5jeWJveC1jbG9zZVwiIGhyZWY9XCJqYXZhc2NyaXB0OjtcIj48L2E+JyxuZXh0Oic8YSB0aXRsZT1cIk5leHRcIiBjbGFzcz1cImZhbmN5Ym94LW5hdiBmYW5jeWJveC1uZXh0XCIgaHJlZj1cImphdmFzY3JpcHQ6O1wiPjxzcGFuPjwvc3Bhbj48L2E+JyxwcmV2Oic8YSB0aXRsZT1cIlByZXZpb3VzXCIgY2xhc3M9XCJmYW5jeWJveC1uYXYgZmFuY3lib3gtcHJldlwiIGhyZWY9XCJqYXZhc2NyaXB0OjtcIj48c3Bhbj48L3NwYW4+PC9hPid9LG9wZW5FZmZlY3Q6XCJmYWRlXCIsb3BlblNwZWVkOjI1MCxvcGVuRWFzaW5nOlwic3dpbmdcIixvcGVuT3BhY2l0eTohMCxcbm9wZW5NZXRob2Q6XCJ6b29tSW5cIixjbG9zZUVmZmVjdDpcImZhZGVcIixjbG9zZVNwZWVkOjI1MCxjbG9zZUVhc2luZzpcInN3aW5nXCIsY2xvc2VPcGFjaXR5OiEwLGNsb3NlTWV0aG9kOlwiem9vbU91dFwiLG5leHRFZmZlY3Q6XCJlbGFzdGljXCIsbmV4dFNwZWVkOjI1MCxuZXh0RWFzaW5nOlwic3dpbmdcIixuZXh0TWV0aG9kOlwiY2hhbmdlSW5cIixwcmV2RWZmZWN0OlwiZWxhc3RpY1wiLHByZXZTcGVlZDoyNTAscHJldkVhc2luZzpcInN3aW5nXCIscHJldk1ldGhvZDpcImNoYW5nZU91dFwiLGhlbHBlcnM6e292ZXJsYXk6ITAsdGl0bGU6ITB9LG9uQ2FuY2VsOmYubm9vcCxiZWZvcmVMb2FkOmYubm9vcCxhZnRlckxvYWQ6Zi5ub29wLGJlZm9yZVNob3c6Zi5ub29wLGFmdGVyU2hvdzpmLm5vb3AsYmVmb3JlQ2hhbmdlOmYubm9vcCxiZWZvcmVDbG9zZTpmLm5vb3AsYWZ0ZXJDbG9zZTpmLm5vb3B9LGdyb3VwOnt9LG9wdHM6e30scHJldmlvdXM6bnVsbCxjb21pbmc6bnVsbCxjdXJyZW50Om51bGwsaXNBY3RpdmU6ITEsXG5pc09wZW46ITEsaXNPcGVuZWQ6ITEsd3JhcDpudWxsLHNraW46bnVsbCxvdXRlcjpudWxsLGlubmVyOm51bGwscGxheWVyOnt0aW1lcjpudWxsLGlzQWN0aXZlOiExfSxhamF4TG9hZDpudWxsLGltZ1ByZWxvYWQ6bnVsbCx0cmFuc2l0aW9uczp7fSxoZWxwZXJzOnt9LG9wZW46ZnVuY3Rpb24oYSxkKXtpZihhJiYoZi5pc1BsYWluT2JqZWN0KGQpfHwoZD17fSksITEhPT1iLmNsb3NlKCEwKSkpcmV0dXJuIGYuaXNBcnJheShhKXx8KGE9dChhKT9mKGEpLmdldCgpOlthXSksZi5lYWNoKGEsZnVuY3Rpb24oZSxjKXt2YXIgaz17fSxnLGgsaixtLGw7XCJvYmplY3RcIj09PWYudHlwZShjKSYmKGMubm9kZVR5cGUmJihjPWYoYykpLHQoYyk/KGs9e2hyZWY6Yy5kYXRhKFwiZmFuY3lib3gtaHJlZlwiKXx8Yy5hdHRyKFwiaHJlZlwiKSx0aXRsZTpjLmRhdGEoXCJmYW5jeWJveC10aXRsZVwiKXx8Yy5hdHRyKFwidGl0bGVcIiksaXNEb206ITAsZWxlbWVudDpjfSxmLm1ldGFkYXRhJiZmLmV4dGVuZCghMCxrLFxuYy5tZXRhZGF0YSgpKSk6az1jKTtnPWQuaHJlZnx8ay5ocmVmfHwocShjKT9jOm51bGwpO2g9ZC50aXRsZSE9PXY/ZC50aXRsZTprLnRpdGxlfHxcIlwiO209KGo9ZC5jb250ZW50fHxrLmNvbnRlbnQpP1wiaHRtbFwiOmQudHlwZXx8ay50eXBlOyFtJiZrLmlzRG9tJiYobT1jLmRhdGEoXCJmYW5jeWJveC10eXBlXCIpLG18fChtPShtPWMucHJvcChcImNsYXNzXCIpLm1hdGNoKC9mYW5jeWJveFxcLihcXHcrKS8pKT9tWzFdOm51bGwpKTtxKGcpJiYobXx8KGIuaXNJbWFnZShnKT9tPVwiaW1hZ2VcIjpiLmlzU1dGKGcpP209XCJzd2ZcIjpcIiNcIj09PWcuY2hhckF0KDApP209XCJpbmxpbmVcIjpxKGMpJiYobT1cImh0bWxcIixqPWMpKSxcImFqYXhcIj09PW0mJihsPWcuc3BsaXQoL1xccysvLDIpLGc9bC5zaGlmdCgpLGw9bC5zaGlmdCgpKSk7anx8KFwiaW5saW5lXCI9PT1tP2c/aj1mKHEoZyk/Zy5yZXBsYWNlKC8uKig/PSNbXlxcc10rJCkvLFwiXCIpOmcpOmsuaXNEb20mJihqPWMpOlwiaHRtbFwiPT09bT9qPWc6IW0mJighZyYmXG5rLmlzRG9tKSYmKG09XCJpbmxpbmVcIixqPWMpKTtmLmV4dGVuZChrLHtocmVmOmcsdHlwZTptLGNvbnRlbnQ6aix0aXRsZTpoLHNlbGVjdG9yOmx9KTthW2VdPWt9KSxiLm9wdHM9Zi5leHRlbmQoITAse30sYi5kZWZhdWx0cyxkKSxkLmtleXMhPT12JiYoYi5vcHRzLmtleXM9ZC5rZXlzP2YuZXh0ZW5kKHt9LGIuZGVmYXVsdHMua2V5cyxkLmtleXMpOiExKSxiLmdyb3VwPWEsYi5fc3RhcnQoYi5vcHRzLmluZGV4KX0sY2FuY2VsOmZ1bmN0aW9uKCl7dmFyIGE9Yi5jb21pbmc7YSYmITEhPT1iLnRyaWdnZXIoXCJvbkNhbmNlbFwiKSYmKGIuaGlkZUxvYWRpbmcoKSxiLmFqYXhMb2FkJiZiLmFqYXhMb2FkLmFib3J0KCksYi5hamF4TG9hZD1udWxsLGIuaW1nUHJlbG9hZCYmKGIuaW1nUHJlbG9hZC5vbmxvYWQ9Yi5pbWdQcmVsb2FkLm9uZXJyb3I9bnVsbCksYS53cmFwJiZhLndyYXAuc3RvcCghMCwhMCkudHJpZ2dlcihcIm9uUmVzZXRcIikucmVtb3ZlKCksYi5jb21pbmc9bnVsbCxiLmN1cnJlbnR8fFxuYi5fYWZ0ZXJab29tT3V0KGEpKX0sY2xvc2U6ZnVuY3Rpb24oYSl7Yi5jYW5jZWwoKTshMSE9PWIudHJpZ2dlcihcImJlZm9yZUNsb3NlXCIpJiYoYi51bmJpbmRFdmVudHMoKSxiLmlzQWN0aXZlJiYoIWIuaXNPcGVufHwhMD09PWE/KGYoXCIuZmFuY3lib3gtd3JhcFwiKS5zdG9wKCEwKS50cmlnZ2VyKFwib25SZXNldFwiKS5yZW1vdmUoKSxiLl9hZnRlclpvb21PdXQoKSk6KGIuaXNPcGVuPWIuaXNPcGVuZWQ9ITEsYi5pc0Nsb3Npbmc9ITAsZihcIi5mYW5jeWJveC1pdGVtLCAuZmFuY3lib3gtbmF2XCIpLnJlbW92ZSgpLGIud3JhcC5zdG9wKCEwLCEwKS5yZW1vdmVDbGFzcyhcImZhbmN5Ym94LW9wZW5lZFwiKSxiLnRyYW5zaXRpb25zW2IuY3VycmVudC5jbG9zZU1ldGhvZF0oKSkpKX0scGxheTpmdW5jdGlvbihhKXt2YXIgZD1mdW5jdGlvbigpe2NsZWFyVGltZW91dChiLnBsYXllci50aW1lcil9LGU9ZnVuY3Rpb24oKXtkKCk7Yi5jdXJyZW50JiZiLnBsYXllci5pc0FjdGl2ZSYmKGIucGxheWVyLnRpbWVyPVxuc2V0VGltZW91dChiLm5leHQsYi5jdXJyZW50LnBsYXlTcGVlZCkpfSxjPWZ1bmN0aW9uKCl7ZCgpO3AudW5iaW5kKFwiLnBsYXllclwiKTtiLnBsYXllci5pc0FjdGl2ZT0hMTtiLnRyaWdnZXIoXCJvblBsYXlFbmRcIil9O2lmKCEwPT09YXx8IWIucGxheWVyLmlzQWN0aXZlJiYhMSE9PWEpe2lmKGIuY3VycmVudCYmKGIuY3VycmVudC5sb29wfHxiLmN1cnJlbnQuaW5kZXg8Yi5ncm91cC5sZW5ndGgtMSkpYi5wbGF5ZXIuaXNBY3RpdmU9ITAscC5iaW5kKHtcIm9uQ2FuY2VsLnBsYXllciBiZWZvcmVDbG9zZS5wbGF5ZXJcIjpjLFwib25VcGRhdGUucGxheWVyXCI6ZSxcImJlZm9yZUxvYWQucGxheWVyXCI6ZH0pLGUoKSxiLnRyaWdnZXIoXCJvblBsYXlTdGFydFwiKX1lbHNlIGMoKX0sbmV4dDpmdW5jdGlvbihhKXt2YXIgZD1iLmN1cnJlbnQ7ZCYmKHEoYSl8fChhPWQuZGlyZWN0aW9uLm5leHQpLGIuanVtcHRvKGQuaW5kZXgrMSxhLFwibmV4dFwiKSl9LHByZXY6ZnVuY3Rpb24oYSl7dmFyIGQ9Yi5jdXJyZW50O1xuZCYmKHEoYSl8fChhPWQuZGlyZWN0aW9uLnByZXYpLGIuanVtcHRvKGQuaW5kZXgtMSxhLFwicHJldlwiKSl9LGp1bXB0bzpmdW5jdGlvbihhLGQsZSl7dmFyIGM9Yi5jdXJyZW50O2MmJihhPWwoYSksYi5kaXJlY3Rpb249ZHx8Yy5kaXJlY3Rpb25bYT49Yy5pbmRleD9cIm5leHRcIjpcInByZXZcIl0sYi5yb3V0ZXI9ZXx8XCJqdW1wdG9cIixjLmxvb3AmJigwPmEmJihhPWMuZ3JvdXAubGVuZ3RoK2ElYy5ncm91cC5sZW5ndGgpLGElPWMuZ3JvdXAubGVuZ3RoKSxjLmdyb3VwW2FdIT09diYmKGIuY2FuY2VsKCksYi5fc3RhcnQoYSkpKX0scmVwb3NpdGlvbjpmdW5jdGlvbihhLGQpe3ZhciBlPWIuY3VycmVudCxjPWU/ZS53cmFwOm51bGwsaztjJiYoaz1iLl9nZXRQb3NpdGlvbihkKSxhJiZcInNjcm9sbFwiPT09YS50eXBlPyhkZWxldGUgay5wb3NpdGlvbixjLnN0b3AoITAsITApLmFuaW1hdGUoaywyMDApKTooYy5jc3MoayksZS5wb3M9Zi5leHRlbmQoe30sZS5kaW0saykpKX0sdXBkYXRlOmZ1bmN0aW9uKGEpe3ZhciBkPVxuYSYmYS50eXBlLGU9IWR8fFwib3JpZW50YXRpb25jaGFuZ2VcIj09PWQ7ZSYmKGNsZWFyVGltZW91dChCKSxCPW51bGwpO2IuaXNPcGVuJiYhQiYmKEI9c2V0VGltZW91dChmdW5jdGlvbigpe3ZhciBjPWIuY3VycmVudDtjJiYhYi5pc0Nsb3NpbmcmJihiLndyYXAucmVtb3ZlQ2xhc3MoXCJmYW5jeWJveC10bXBcIiksKGV8fFwibG9hZFwiPT09ZHx8XCJyZXNpemVcIj09PWQmJmMuYXV0b1Jlc2l6ZSkmJmIuX3NldERpbWVuc2lvbigpLFwic2Nyb2xsXCI9PT1kJiZjLmNhblNocmlua3x8Yi5yZXBvc2l0aW9uKGEpLGIudHJpZ2dlcihcIm9uVXBkYXRlXCIpLEI9bnVsbCl9LGUmJiFzPzA6MzAwKSl9LHRvZ2dsZTpmdW5jdGlvbihhKXtiLmlzT3BlbiYmKGIuY3VycmVudC5maXRUb1ZpZXc9XCJib29sZWFuXCI9PT1mLnR5cGUoYSk/YTohYi5jdXJyZW50LmZpdFRvVmlldyxzJiYoYi53cmFwLnJlbW92ZUF0dHIoXCJzdHlsZVwiKS5hZGRDbGFzcyhcImZhbmN5Ym94LXRtcFwiKSxiLnRyaWdnZXIoXCJvblVwZGF0ZVwiKSksXG5iLnVwZGF0ZSgpKX0saGlkZUxvYWRpbmc6ZnVuY3Rpb24oKXtwLnVuYmluZChcIi5sb2FkaW5nXCIpO2YoXCIjZmFuY3lib3gtbG9hZGluZ1wiKS5yZW1vdmUoKX0sc2hvd0xvYWRpbmc6ZnVuY3Rpb24oKXt2YXIgYSxkO2IuaGlkZUxvYWRpbmcoKTthPWYoJzxkaXYgaWQ9XCJmYW5jeWJveC1sb2FkaW5nXCI+PGRpdj48L2Rpdj48L2Rpdj4nKS5jbGljayhiLmNhbmNlbCkuYXBwZW5kVG8oXCJib2R5XCIpO3AuYmluZChcImtleWRvd24ubG9hZGluZ1wiLGZ1bmN0aW9uKGEpe2lmKDI3PT09KGEud2hpY2h8fGEua2V5Q29kZSkpYS5wcmV2ZW50RGVmYXVsdCgpLGIuY2FuY2VsKCl9KTtiLmRlZmF1bHRzLmZpeGVkfHwoZD1iLmdldFZpZXdwb3J0KCksYS5jc3Moe3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6MC41KmQuaCtkLnksbGVmdDowLjUqZC53K2QueH0pKX0sZ2V0Vmlld3BvcnQ6ZnVuY3Rpb24oKXt2YXIgYT1iLmN1cnJlbnQmJmIuY3VycmVudC5sb2NrZWR8fCExLGQ9e3g6bi5zY3JvbGxMZWZ0KCksXG55Om4uc2Nyb2xsVG9wKCl9O2E/KGQudz1hWzBdLmNsaWVudFdpZHRoLGQuaD1hWzBdLmNsaWVudEhlaWdodCk6KGQudz1zJiZyLmlubmVyV2lkdGg/ci5pbm5lcldpZHRoOm4ud2lkdGgoKSxkLmg9cyYmci5pbm5lckhlaWdodD9yLmlubmVySGVpZ2h0Om4uaGVpZ2h0KCkpO3JldHVybiBkfSx1bmJpbmRFdmVudHM6ZnVuY3Rpb24oKXtiLndyYXAmJnQoYi53cmFwKSYmYi53cmFwLnVuYmluZChcIi5mYlwiKTtwLnVuYmluZChcIi5mYlwiKTtuLnVuYmluZChcIi5mYlwiKX0sYmluZEV2ZW50czpmdW5jdGlvbigpe3ZhciBhPWIuY3VycmVudCxkO2EmJihuLmJpbmQoXCJvcmllbnRhdGlvbmNoYW5nZS5mYlwiKyhzP1wiXCI6XCIgcmVzaXplLmZiXCIpKyhhLmF1dG9DZW50ZXImJiFhLmxvY2tlZD9cIiBzY3JvbGwuZmJcIjpcIlwiKSxiLnVwZGF0ZSksKGQ9YS5rZXlzKSYmcC5iaW5kKFwia2V5ZG93bi5mYlwiLGZ1bmN0aW9uKGUpe3ZhciBjPWUud2hpY2h8fGUua2V5Q29kZSxrPWUudGFyZ2V0fHxlLnNyY0VsZW1lbnQ7XG5pZigyNz09PWMmJmIuY29taW5nKXJldHVybiExOyFlLmN0cmxLZXkmJighZS5hbHRLZXkmJiFlLnNoaWZ0S2V5JiYhZS5tZXRhS2V5JiYoIWt8fCFrLnR5cGUmJiFmKGspLmlzKFwiW2NvbnRlbnRlZGl0YWJsZV1cIikpKSYmZi5lYWNoKGQsZnVuY3Rpb24oZCxrKXtpZigxPGEuZ3JvdXAubGVuZ3RoJiZrW2NdIT09dilyZXR1cm4gYltkXShrW2NdKSxlLnByZXZlbnREZWZhdWx0KCksITE7aWYoLTE8Zi5pbkFycmF5KGMsaykpcmV0dXJuIGJbZF0oKSxlLnByZXZlbnREZWZhdWx0KCksITF9KX0pLGYuZm4ubW91c2V3aGVlbCYmYS5tb3VzZVdoZWVsJiZiLndyYXAuYmluZChcIm1vdXNld2hlZWwuZmJcIixmdW5jdGlvbihkLGMsayxnKXtmb3IodmFyIGg9ZihkLnRhcmdldHx8bnVsbCksaj0hMTtoLmxlbmd0aCYmIWomJiFoLmlzKFwiLmZhbmN5Ym94LXNraW5cIikmJiFoLmlzKFwiLmZhbmN5Ym94LXdyYXBcIik7KWo9aFswXSYmIShoWzBdLnN0eWxlLm92ZXJmbG93JiZcImhpZGRlblwiPT09aFswXS5zdHlsZS5vdmVyZmxvdykmJlxuKGhbMF0uY2xpZW50V2lkdGgmJmhbMF0uc2Nyb2xsV2lkdGg+aFswXS5jbGllbnRXaWR0aHx8aFswXS5jbGllbnRIZWlnaHQmJmhbMF0uc2Nyb2xsSGVpZ2h0PmhbMF0uY2xpZW50SGVpZ2h0KSxoPWYoaCkucGFyZW50KCk7aWYoMCE9PWMmJiFqJiYxPGIuZ3JvdXAubGVuZ3RoJiYhYS5jYW5TaHJpbmspe2lmKDA8Z3x8MDxrKWIucHJldigwPGc/XCJkb3duXCI6XCJsZWZ0XCIpO2Vsc2UgaWYoMD5nfHwwPmspYi5uZXh0KDA+Zz9cInVwXCI6XCJyaWdodFwiKTtkLnByZXZlbnREZWZhdWx0KCl9fSkpfSx0cmlnZ2VyOmZ1bmN0aW9uKGEsZCl7dmFyIGUsYz1kfHxiLmNvbWluZ3x8Yi5jdXJyZW50O2lmKGMpe2YuaXNGdW5jdGlvbihjW2FdKSYmKGU9Y1thXS5hcHBseShjLEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywxKSkpO2lmKCExPT09ZSlyZXR1cm4hMTtjLmhlbHBlcnMmJmYuZWFjaChjLmhlbHBlcnMsZnVuY3Rpb24oZCxlKXtpZihlJiZiLmhlbHBlcnNbZF0mJmYuaXNGdW5jdGlvbihiLmhlbHBlcnNbZF1bYV0pKWIuaGVscGVyc1tkXVthXShmLmV4dGVuZCghMCxcbnt9LGIuaGVscGVyc1tkXS5kZWZhdWx0cyxlKSxjKX0pO3AudHJpZ2dlcihhKX19LGlzSW1hZ2U6ZnVuY3Rpb24oYSl7cmV0dXJuIHEoYSkmJmEubWF0Y2goLyheZGF0YTppbWFnZVxcLy4qLCl8KFxcLihqcChlfGd8ZWcpfGdpZnxwbmd8Ym1wfHdlYnB8c3ZnKSgoXFw/fCMpLiopPyQpL2kpfSxpc1NXRjpmdW5jdGlvbihhKXtyZXR1cm4gcShhKSYmYS5tYXRjaCgvXFwuKHN3ZikoKFxcP3wjKS4qKT8kL2kpfSxfc3RhcnQ6ZnVuY3Rpb24oYSl7dmFyIGQ9e30sZSxjO2E9bChhKTtlPWIuZ3JvdXBbYV18fG51bGw7aWYoIWUpcmV0dXJuITE7ZD1mLmV4dGVuZCghMCx7fSxiLm9wdHMsZSk7ZT1kLm1hcmdpbjtjPWQucGFkZGluZztcIm51bWJlclwiPT09Zi50eXBlKGUpJiYoZC5tYXJnaW49W2UsZSxlLGVdKTtcIm51bWJlclwiPT09Zi50eXBlKGMpJiYoZC5wYWRkaW5nPVtjLGMsYyxjXSk7ZC5tb2RhbCYmZi5leHRlbmQoITAsZCx7Y2xvc2VCdG46ITEsY2xvc2VDbGljazohMSxuZXh0Q2xpY2s6ITEsYXJyb3dzOiExLFxubW91c2VXaGVlbDohMSxrZXlzOm51bGwsaGVscGVyczp7b3ZlcmxheTp7Y2xvc2VDbGljazohMX19fSk7ZC5hdXRvU2l6ZSYmKGQuYXV0b1dpZHRoPWQuYXV0b0hlaWdodD0hMCk7XCJhdXRvXCI9PT1kLndpZHRoJiYoZC5hdXRvV2lkdGg9ITApO1wiYXV0b1wiPT09ZC5oZWlnaHQmJihkLmF1dG9IZWlnaHQ9ITApO2QuZ3JvdXA9Yi5ncm91cDtkLmluZGV4PWE7Yi5jb21pbmc9ZDtpZighMT09PWIudHJpZ2dlcihcImJlZm9yZUxvYWRcIikpYi5jb21pbmc9bnVsbDtlbHNle2M9ZC50eXBlO2U9ZC5ocmVmO2lmKCFjKXJldHVybiBiLmNvbWluZz1udWxsLGIuY3VycmVudCYmYi5yb3V0ZXImJlwianVtcHRvXCIhPT1iLnJvdXRlcj8oYi5jdXJyZW50LmluZGV4PWEsYltiLnJvdXRlcl0oYi5kaXJlY3Rpb24pKTohMTtiLmlzQWN0aXZlPSEwO2lmKFwiaW1hZ2VcIj09PWN8fFwic3dmXCI9PT1jKWQuYXV0b0hlaWdodD1kLmF1dG9XaWR0aD0hMSxkLnNjcm9sbGluZz1cInZpc2libGVcIjtcImltYWdlXCI9PT1jJiYoZC5hc3BlY3RSYXRpbz1cbiEwKTtcImlmcmFtZVwiPT09YyYmcyYmKGQuc2Nyb2xsaW5nPVwic2Nyb2xsXCIpO2Qud3JhcD1mKGQudHBsLndyYXApLmFkZENsYXNzKFwiZmFuY3lib3gtXCIrKHM/XCJtb2JpbGVcIjpcImRlc2t0b3BcIikrXCIgZmFuY3lib3gtdHlwZS1cIitjK1wiIGZhbmN5Ym94LXRtcCBcIitkLndyYXBDU1MpLmFwcGVuZFRvKGQucGFyZW50fHxcImJvZHlcIik7Zi5leHRlbmQoZCx7c2tpbjpmKFwiLmZhbmN5Ym94LXNraW5cIixkLndyYXApLG91dGVyOmYoXCIuZmFuY3lib3gtb3V0ZXJcIixkLndyYXApLGlubmVyOmYoXCIuZmFuY3lib3gtaW5uZXJcIixkLndyYXApfSk7Zi5lYWNoKFtcIlRvcFwiLFwiUmlnaHRcIixcIkJvdHRvbVwiLFwiTGVmdFwiXSxmdW5jdGlvbihhLGIpe2Quc2tpbi5jc3MoXCJwYWRkaW5nXCIrYix3KGQucGFkZGluZ1thXSkpfSk7Yi50cmlnZ2VyKFwib25SZWFkeVwiKTtpZihcImlubGluZVwiPT09Y3x8XCJodG1sXCI9PT1jKXtpZighZC5jb250ZW50fHwhZC5jb250ZW50Lmxlbmd0aClyZXR1cm4gYi5fZXJyb3IoXCJjb250ZW50XCIpfWVsc2UgaWYoIWUpcmV0dXJuIGIuX2Vycm9yKFwiaHJlZlwiKTtcblwiaW1hZ2VcIj09PWM/Yi5fbG9hZEltYWdlKCk6XCJhamF4XCI9PT1jP2IuX2xvYWRBamF4KCk6XCJpZnJhbWVcIj09PWM/Yi5fbG9hZElmcmFtZSgpOmIuX2FmdGVyTG9hZCgpfX0sX2Vycm9yOmZ1bmN0aW9uKGEpe2YuZXh0ZW5kKGIuY29taW5nLHt0eXBlOlwiaHRtbFwiLGF1dG9XaWR0aDohMCxhdXRvSGVpZ2h0OiEwLG1pbldpZHRoOjAsbWluSGVpZ2h0OjAsc2Nyb2xsaW5nOlwibm9cIixoYXNFcnJvcjphLGNvbnRlbnQ6Yi5jb21pbmcudHBsLmVycm9yfSk7Yi5fYWZ0ZXJMb2FkKCl9LF9sb2FkSW1hZ2U6ZnVuY3Rpb24oKXt2YXIgYT1iLmltZ1ByZWxvYWQ9bmV3IEltYWdlO2Eub25sb2FkPWZ1bmN0aW9uKCl7dGhpcy5vbmxvYWQ9dGhpcy5vbmVycm9yPW51bGw7Yi5jb21pbmcud2lkdGg9dGhpcy53aWR0aC9iLm9wdHMucGl4ZWxSYXRpbztiLmNvbWluZy5oZWlnaHQ9dGhpcy5oZWlnaHQvYi5vcHRzLnBpeGVsUmF0aW87Yi5fYWZ0ZXJMb2FkKCl9O2Eub25lcnJvcj1mdW5jdGlvbigpe3RoaXMub25sb2FkPVxudGhpcy5vbmVycm9yPW51bGw7Yi5fZXJyb3IoXCJpbWFnZVwiKX07YS5zcmM9Yi5jb21pbmcuaHJlZjshMCE9PWEuY29tcGxldGUmJmIuc2hvd0xvYWRpbmcoKX0sX2xvYWRBamF4OmZ1bmN0aW9uKCl7dmFyIGE9Yi5jb21pbmc7Yi5zaG93TG9hZGluZygpO2IuYWpheExvYWQ9Zi5hamF4KGYuZXh0ZW5kKHt9LGEuYWpheCx7dXJsOmEuaHJlZixlcnJvcjpmdW5jdGlvbihhLGUpe2IuY29taW5nJiZcImFib3J0XCIhPT1lP2IuX2Vycm9yKFwiYWpheFwiLGEpOmIuaGlkZUxvYWRpbmcoKX0sc3VjY2VzczpmdW5jdGlvbihkLGUpe1wic3VjY2Vzc1wiPT09ZSYmKGEuY29udGVudD1kLGIuX2FmdGVyTG9hZCgpKX19KSl9LF9sb2FkSWZyYW1lOmZ1bmN0aW9uKCl7dmFyIGE9Yi5jb21pbmcsZD1mKGEudHBsLmlmcmFtZS5yZXBsYWNlKC9cXHtybmRcXH0vZywobmV3IERhdGUpLmdldFRpbWUoKSkpLmF0dHIoXCJzY3JvbGxpbmdcIixzP1wiYXV0b1wiOmEuaWZyYW1lLnNjcm9sbGluZykuYXR0cihcInNyY1wiLGEuaHJlZik7XG5mKGEud3JhcCkuYmluZChcIm9uUmVzZXRcIixmdW5jdGlvbigpe3RyeXtmKHRoaXMpLmZpbmQoXCJpZnJhbWVcIikuaGlkZSgpLmF0dHIoXCJzcmNcIixcIi8vYWJvdXQ6YmxhbmtcIikuZW5kKCkuZW1wdHkoKX1jYXRjaChhKXt9fSk7YS5pZnJhbWUucHJlbG9hZCYmKGIuc2hvd0xvYWRpbmcoKSxkLm9uZShcImxvYWRcIixmdW5jdGlvbigpe2YodGhpcykuZGF0YShcInJlYWR5XCIsMSk7c3x8Zih0aGlzKS5iaW5kKFwibG9hZC5mYlwiLGIudXBkYXRlKTtmKHRoaXMpLnBhcmVudHMoXCIuZmFuY3lib3gtd3JhcFwiKS53aWR0aChcIjEwMCVcIikucmVtb3ZlQ2xhc3MoXCJmYW5jeWJveC10bXBcIikuc2hvdygpO2IuX2FmdGVyTG9hZCgpfSkpO2EuY29udGVudD1kLmFwcGVuZFRvKGEuaW5uZXIpO2EuaWZyYW1lLnByZWxvYWR8fGIuX2FmdGVyTG9hZCgpfSxfcHJlbG9hZEltYWdlczpmdW5jdGlvbigpe3ZhciBhPWIuZ3JvdXAsZD1iLmN1cnJlbnQsZT1hLmxlbmd0aCxjPWQucHJlbG9hZD9NYXRoLm1pbihkLnByZWxvYWQsXG5lLTEpOjAsZixnO2ZvcihnPTE7Zzw9YztnKz0xKWY9YVsoZC5pbmRleCtnKSVlXSxcImltYWdlXCI9PT1mLnR5cGUmJmYuaHJlZiYmKChuZXcgSW1hZ2UpLnNyYz1mLmhyZWYpfSxfYWZ0ZXJMb2FkOmZ1bmN0aW9uKCl7dmFyIGE9Yi5jb21pbmcsZD1iLmN1cnJlbnQsZSxjLGssZyxoO2IuaGlkZUxvYWRpbmcoKTtpZihhJiYhMSE9PWIuaXNBY3RpdmUpaWYoITE9PT1iLnRyaWdnZXIoXCJhZnRlckxvYWRcIixhLGQpKWEud3JhcC5zdG9wKCEwKS50cmlnZ2VyKFwib25SZXNldFwiKS5yZW1vdmUoKSxiLmNvbWluZz1udWxsO2Vsc2V7ZCYmKGIudHJpZ2dlcihcImJlZm9yZUNoYW5nZVwiLGQpLGQud3JhcC5zdG9wKCEwKS5yZW1vdmVDbGFzcyhcImZhbmN5Ym94LW9wZW5lZFwiKS5maW5kKFwiLmZhbmN5Ym94LWl0ZW0sIC5mYW5jeWJveC1uYXZcIikucmVtb3ZlKCkpO2IudW5iaW5kRXZlbnRzKCk7ZT1hLmNvbnRlbnQ7Yz1hLnR5cGU7az1hLnNjcm9sbGluZztmLmV4dGVuZChiLHt3cmFwOmEud3JhcCxza2luOmEuc2tpbixcbm91dGVyOmEub3V0ZXIsaW5uZXI6YS5pbm5lcixjdXJyZW50OmEscHJldmlvdXM6ZH0pO2c9YS5ocmVmO3N3aXRjaChjKXtjYXNlIFwiaW5saW5lXCI6Y2FzZSBcImFqYXhcIjpjYXNlIFwiaHRtbFwiOmEuc2VsZWN0b3I/ZT1mKFwiPGRpdj5cIikuaHRtbChlKS5maW5kKGEuc2VsZWN0b3IpOnQoZSkmJihlLmRhdGEoXCJmYW5jeWJveC1wbGFjZWhvbGRlclwiKXx8ZS5kYXRhKFwiZmFuY3lib3gtcGxhY2Vob2xkZXJcIixmKCc8ZGl2IGNsYXNzPVwiZmFuY3lib3gtcGxhY2Vob2xkZXJcIj48L2Rpdj4nKS5pbnNlcnRBZnRlcihlKS5oaWRlKCkpLGU9ZS5zaG93KCkuZGV0YWNoKCksYS53cmFwLmJpbmQoXCJvblJlc2V0XCIsZnVuY3Rpb24oKXtmKHRoaXMpLmZpbmQoZSkubGVuZ3RoJiZlLmhpZGUoKS5yZXBsYWNlQWxsKGUuZGF0YShcImZhbmN5Ym94LXBsYWNlaG9sZGVyXCIpKS5kYXRhKFwiZmFuY3lib3gtcGxhY2Vob2xkZXJcIiwhMSl9KSk7YnJlYWs7Y2FzZSBcImltYWdlXCI6ZT1hLnRwbC5pbWFnZS5yZXBsYWNlKFwie2hyZWZ9XCIsXG5nKTticmVhaztjYXNlIFwic3dmXCI6ZT0nPG9iamVjdCBpZD1cImZhbmN5Ym94LXN3ZlwiIGNsYXNzaWQ9XCJjbHNpZDpEMjdDREI2RS1BRTZELTExY2YtOTZCOC00NDQ1NTM1NDAwMDBcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCI+PHBhcmFtIG5hbWU9XCJtb3ZpZVwiIHZhbHVlPVwiJytnKydcIj48L3BhcmFtPicsaD1cIlwiLGYuZWFjaChhLnN3ZixmdW5jdGlvbihhLGIpe2UrPSc8cGFyYW0gbmFtZT1cIicrYSsnXCIgdmFsdWU9XCInK2IrJ1wiPjwvcGFyYW0+JztoKz1cIiBcIithKyc9XCInK2IrJ1wiJ30pLGUrPSc8ZW1iZWQgc3JjPVwiJytnKydcIiB0eXBlPVwiYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2hcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCInK2grXCI+PC9lbWJlZD48L29iamVjdD5cIn0oIXQoZSl8fCFlLnBhcmVudCgpLmlzKGEuaW5uZXIpKSYmYS5pbm5lci5hcHBlbmQoZSk7Yi50cmlnZ2VyKFwiYmVmb3JlU2hvd1wiKTthLmlubmVyLmNzcyhcIm92ZXJmbG93XCIsXCJ5ZXNcIj09PWs/XCJzY3JvbGxcIjpcblwibm9cIj09PWs/XCJoaWRkZW5cIjprKTtiLl9zZXREaW1lbnNpb24oKTtiLnJlcG9zaXRpb24oKTtiLmlzT3Blbj0hMTtiLmNvbWluZz1udWxsO2IuYmluZEV2ZW50cygpO2lmKGIuaXNPcGVuZWQpe2lmKGQucHJldk1ldGhvZCliLnRyYW5zaXRpb25zW2QucHJldk1ldGhvZF0oKX1lbHNlIGYoXCIuZmFuY3lib3gtd3JhcFwiKS5ub3QoYS53cmFwKS5zdG9wKCEwKS50cmlnZ2VyKFwib25SZXNldFwiKS5yZW1vdmUoKTtiLnRyYW5zaXRpb25zW2IuaXNPcGVuZWQ/YS5uZXh0TWV0aG9kOmEub3Blbk1ldGhvZF0oKTtiLl9wcmVsb2FkSW1hZ2VzKCl9fSxfc2V0RGltZW5zaW9uOmZ1bmN0aW9uKCl7dmFyIGE9Yi5nZXRWaWV3cG9ydCgpLGQ9MCxlPSExLGM9ITEsZT1iLndyYXAsaz1iLnNraW4sZz1iLmlubmVyLGg9Yi5jdXJyZW50LGM9aC53aWR0aCxqPWguaGVpZ2h0LG09aC5taW5XaWR0aCx1PWgubWluSGVpZ2h0LG49aC5tYXhXaWR0aCxwPWgubWF4SGVpZ2h0LHM9aC5zY3JvbGxpbmcscT1oLnNjcm9sbE91dHNpZGU/XG5oLnNjcm9sbGJhcldpZHRoOjAseD1oLm1hcmdpbix5PWwoeFsxXSt4WzNdKSxyPWwoeFswXSt4WzJdKSx2LHosdCxDLEEsRixCLEQsSDtlLmFkZChrKS5hZGQoZykud2lkdGgoXCJhdXRvXCIpLmhlaWdodChcImF1dG9cIikucmVtb3ZlQ2xhc3MoXCJmYW5jeWJveC10bXBcIik7eD1sKGsub3V0ZXJXaWR0aCghMCktay53aWR0aCgpKTt2PWwoay5vdXRlckhlaWdodCghMCktay5oZWlnaHQoKSk7ej15K3g7dD1yK3Y7Qz1FKGMpPyhhLncteikqbChjKS8xMDA6YztBPUUoaik/KGEuaC10KSpsKGopLzEwMDpqO2lmKFwiaWZyYW1lXCI9PT1oLnR5cGUpe2lmKEg9aC5jb250ZW50LGguYXV0b0hlaWdodCYmMT09PUguZGF0YShcInJlYWR5XCIpKXRyeXtIWzBdLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQubG9jYXRpb24mJihnLndpZHRoKEMpLmhlaWdodCg5OTk5KSxGPUguY29udGVudHMoKS5maW5kKFwiYm9keVwiKSxxJiZGLmNzcyhcIm92ZXJmbG93LXhcIixcImhpZGRlblwiKSxBPUYub3V0ZXJIZWlnaHQoITApKX1jYXRjaChHKXt9fWVsc2UgaWYoaC5hdXRvV2lkdGh8fFxuaC5hdXRvSGVpZ2h0KWcuYWRkQ2xhc3MoXCJmYW5jeWJveC10bXBcIiksaC5hdXRvV2lkdGh8fGcud2lkdGgoQyksaC5hdXRvSGVpZ2h0fHxnLmhlaWdodChBKSxoLmF1dG9XaWR0aCYmKEM9Zy53aWR0aCgpKSxoLmF1dG9IZWlnaHQmJihBPWcuaGVpZ2h0KCkpLGcucmVtb3ZlQ2xhc3MoXCJmYW5jeWJveC10bXBcIik7Yz1sKEMpO2o9bChBKTtEPUMvQTttPWwoRShtKT9sKG0sXCJ3XCIpLXo6bSk7bj1sKEUobik/bChuLFwid1wiKS16Om4pO3U9bChFKHUpP2wodSxcImhcIiktdDp1KTtwPWwoRShwKT9sKHAsXCJoXCIpLXQ6cCk7Rj1uO0I9cDtoLmZpdFRvVmlldyYmKG49TWF0aC5taW4oYS53LXosbikscD1NYXRoLm1pbihhLmgtdCxwKSk7ej1hLncteTtyPWEuaC1yO2guYXNwZWN0UmF0aW8/KGM+biYmKGM9bixqPWwoYy9EKSksaj5wJiYoaj1wLGM9bChqKkQpKSxjPG0mJihjPW0saj1sKGMvRCkpLGo8dSYmKGo9dSxjPWwoaipEKSkpOihjPU1hdGgubWF4KG0sTWF0aC5taW4oYyxuKSksaC5hdXRvSGVpZ2h0JiZcblwiaWZyYW1lXCIhPT1oLnR5cGUmJihnLndpZHRoKGMpLGo9Zy5oZWlnaHQoKSksaj1NYXRoLm1heCh1LE1hdGgubWluKGoscCkpKTtpZihoLmZpdFRvVmlldylpZihnLndpZHRoKGMpLmhlaWdodChqKSxlLndpZHRoKGMreCksYT1lLndpZHRoKCkseT1lLmhlaWdodCgpLGguYXNwZWN0UmF0aW8pZm9yKDsoYT56fHx5PnIpJiYoYz5tJiZqPnUpJiYhKDE5PGQrKyk7KWo9TWF0aC5tYXgodSxNYXRoLm1pbihwLGotMTApKSxjPWwoaipEKSxjPG0mJihjPW0saj1sKGMvRCkpLGM+biYmKGM9bixqPWwoYy9EKSksZy53aWR0aChjKS5oZWlnaHQoaiksZS53aWR0aChjK3gpLGE9ZS53aWR0aCgpLHk9ZS5oZWlnaHQoKTtlbHNlIGM9TWF0aC5tYXgobSxNYXRoLm1pbihjLGMtKGEteikpKSxqPU1hdGgubWF4KHUsTWF0aC5taW4oaixqLSh5LXIpKSk7cSYmKFwiYXV0b1wiPT09cyYmajxBJiZjK3grcTx6KSYmKGMrPXEpO2cud2lkdGgoYykuaGVpZ2h0KGopO2Uud2lkdGgoYyt4KTthPWUud2lkdGgoKTtcbnk9ZS5oZWlnaHQoKTtlPShhPnp8fHk+cikmJmM+bSYmaj51O2M9aC5hc3BlY3RSYXRpbz9jPEYmJmo8QiYmYzxDJiZqPEE6KGM8Rnx8ajxCKSYmKGM8Q3x8ajxBKTtmLmV4dGVuZChoLHtkaW06e3dpZHRoOncoYSksaGVpZ2h0OncoeSl9LG9yaWdXaWR0aDpDLG9yaWdIZWlnaHQ6QSxjYW5TaHJpbms6ZSxjYW5FeHBhbmQ6Yyx3UGFkZGluZzp4LGhQYWRkaW5nOnYsd3JhcFNwYWNlOnktay5vdXRlckhlaWdodCghMCksc2tpblNwYWNlOmsuaGVpZ2h0KCktan0pOyFIJiYoaC5hdXRvSGVpZ2h0JiZqPnUmJmo8cCYmIWMpJiZnLmhlaWdodChcImF1dG9cIil9LF9nZXRQb3NpdGlvbjpmdW5jdGlvbihhKXt2YXIgZD1iLmN1cnJlbnQsZT1iLmdldFZpZXdwb3J0KCksYz1kLm1hcmdpbixmPWIud3JhcC53aWR0aCgpK2NbMV0rY1szXSxnPWIud3JhcC5oZWlnaHQoKStjWzBdK2NbMl0sYz17cG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDpjWzBdLGxlZnQ6Y1szXX07ZC5hdXRvQ2VudGVyJiZkLmZpeGVkJiZcbiFhJiZnPD1lLmgmJmY8PWUudz9jLnBvc2l0aW9uPVwiZml4ZWRcIjpkLmxvY2tlZHx8KGMudG9wKz1lLnksYy5sZWZ0Kz1lLngpO2MudG9wPXcoTWF0aC5tYXgoYy50b3AsYy50b3ArKGUuaC1nKSpkLnRvcFJhdGlvKSk7Yy5sZWZ0PXcoTWF0aC5tYXgoYy5sZWZ0LGMubGVmdCsoZS53LWYpKmQubGVmdFJhdGlvKSk7cmV0dXJuIGN9LF9hZnRlclpvb21JbjpmdW5jdGlvbigpe3ZhciBhPWIuY3VycmVudDthJiYoYi5pc09wZW49Yi5pc09wZW5lZD0hMCxiLndyYXAuY3NzKFwib3ZlcmZsb3dcIixcInZpc2libGVcIikuYWRkQ2xhc3MoXCJmYW5jeWJveC1vcGVuZWRcIiksYi51cGRhdGUoKSwoYS5jbG9zZUNsaWNrfHxhLm5leHRDbGljayYmMTxiLmdyb3VwLmxlbmd0aCkmJmIuaW5uZXIuY3NzKFwiY3Vyc29yXCIsXCJwb2ludGVyXCIpLmJpbmQoXCJjbGljay5mYlwiLGZ1bmN0aW9uKGQpeyFmKGQudGFyZ2V0KS5pcyhcImFcIikmJiFmKGQudGFyZ2V0KS5wYXJlbnQoKS5pcyhcImFcIikmJihkLnByZXZlbnREZWZhdWx0KCksXG5iW2EuY2xvc2VDbGljaz9cImNsb3NlXCI6XCJuZXh0XCJdKCkpfSksYS5jbG9zZUJ0biYmZihhLnRwbC5jbG9zZUJ0bikuYXBwZW5kVG8oYi5za2luKS5iaW5kKFwiY2xpY2suZmJcIixmdW5jdGlvbihhKXthLnByZXZlbnREZWZhdWx0KCk7Yi5jbG9zZSgpfSksYS5hcnJvd3MmJjE8Yi5ncm91cC5sZW5ndGgmJigoYS5sb29wfHwwPGEuaW5kZXgpJiZmKGEudHBsLnByZXYpLmFwcGVuZFRvKGIub3V0ZXIpLmJpbmQoXCJjbGljay5mYlwiLGIucHJldiksKGEubG9vcHx8YS5pbmRleDxiLmdyb3VwLmxlbmd0aC0xKSYmZihhLnRwbC5uZXh0KS5hcHBlbmRUbyhiLm91dGVyKS5iaW5kKFwiY2xpY2suZmJcIixiLm5leHQpKSxiLnRyaWdnZXIoXCJhZnRlclNob3dcIiksIWEubG9vcCYmYS5pbmRleD09PWEuZ3JvdXAubGVuZ3RoLTE/Yi5wbGF5KCExKTpiLm9wdHMuYXV0b1BsYXkmJiFiLnBsYXllci5pc0FjdGl2ZSYmKGIub3B0cy5hdXRvUGxheT0hMSxiLnBsYXkoKSkpfSxfYWZ0ZXJab29tT3V0OmZ1bmN0aW9uKGEpe2E9XG5hfHxiLmN1cnJlbnQ7ZihcIi5mYW5jeWJveC13cmFwXCIpLnRyaWdnZXIoXCJvblJlc2V0XCIpLnJlbW92ZSgpO2YuZXh0ZW5kKGIse2dyb3VwOnt9LG9wdHM6e30scm91dGVyOiExLGN1cnJlbnQ6bnVsbCxpc0FjdGl2ZTohMSxpc09wZW5lZDohMSxpc09wZW46ITEsaXNDbG9zaW5nOiExLHdyYXA6bnVsbCxza2luOm51bGwsb3V0ZXI6bnVsbCxpbm5lcjpudWxsfSk7Yi50cmlnZ2VyKFwiYWZ0ZXJDbG9zZVwiLGEpfX0pO2IudHJhbnNpdGlvbnM9e2dldE9yaWdQb3NpdGlvbjpmdW5jdGlvbigpe3ZhciBhPWIuY3VycmVudCxkPWEuZWxlbWVudCxlPWEub3JpZyxjPXt9LGY9NTAsZz01MCxoPWEuaFBhZGRpbmcsaj1hLndQYWRkaW5nLG09Yi5nZXRWaWV3cG9ydCgpOyFlJiYoYS5pc0RvbSYmZC5pcyhcIjp2aXNpYmxlXCIpKSYmKGU9ZC5maW5kKFwiaW1nOmZpcnN0XCIpLGUubGVuZ3RofHwoZT1kKSk7dChlKT8oYz1lLm9mZnNldCgpLGUuaXMoXCJpbWdcIikmJihmPWUub3V0ZXJXaWR0aCgpLGc9ZS5vdXRlckhlaWdodCgpKSk6XG4oYy50b3A9bS55KyhtLmgtZykqYS50b3BSYXRpbyxjLmxlZnQ9bS54KyhtLnctZikqYS5sZWZ0UmF0aW8pO2lmKFwiZml4ZWRcIj09PWIud3JhcC5jc3MoXCJwb3NpdGlvblwiKXx8YS5sb2NrZWQpYy50b3AtPW0ueSxjLmxlZnQtPW0ueDtyZXR1cm4gYz17dG9wOncoYy50b3AtaCphLnRvcFJhdGlvKSxsZWZ0OncoYy5sZWZ0LWoqYS5sZWZ0UmF0aW8pLHdpZHRoOncoZitqKSxoZWlnaHQ6dyhnK2gpfX0sc3RlcDpmdW5jdGlvbihhLGQpe3ZhciBlLGMsZj1kLnByb3A7Yz1iLmN1cnJlbnQ7dmFyIGc9Yy53cmFwU3BhY2UsaD1jLnNraW5TcGFjZTtpZihcIndpZHRoXCI9PT1mfHxcImhlaWdodFwiPT09ZillPWQuZW5kPT09ZC5zdGFydD8xOihhLWQuc3RhcnQpLyhkLmVuZC1kLnN0YXJ0KSxiLmlzQ2xvc2luZyYmKGU9MS1lKSxjPVwid2lkdGhcIj09PWY/Yy53UGFkZGluZzpjLmhQYWRkaW5nLGM9YS1jLGIuc2tpbltmXShsKFwid2lkdGhcIj09PWY/YzpjLWcqZSkpLGIuaW5uZXJbZl0obChcIndpZHRoXCI9PT1cbmY/YzpjLWcqZS1oKmUpKX0sem9vbUluOmZ1bmN0aW9uKCl7dmFyIGE9Yi5jdXJyZW50LGQ9YS5wb3MsZT1hLm9wZW5FZmZlY3QsYz1cImVsYXN0aWNcIj09PWUsaz1mLmV4dGVuZCh7b3BhY2l0eToxfSxkKTtkZWxldGUgay5wb3NpdGlvbjtjPyhkPXRoaXMuZ2V0T3JpZ1Bvc2l0aW9uKCksYS5vcGVuT3BhY2l0eSYmKGQub3BhY2l0eT0wLjEpKTpcImZhZGVcIj09PWUmJihkLm9wYWNpdHk9MC4xKTtiLndyYXAuY3NzKGQpLmFuaW1hdGUoayx7ZHVyYXRpb246XCJub25lXCI9PT1lPzA6YS5vcGVuU3BlZWQsZWFzaW5nOmEub3BlbkVhc2luZyxzdGVwOmM/dGhpcy5zdGVwOm51bGwsY29tcGxldGU6Yi5fYWZ0ZXJab29tSW59KX0sem9vbU91dDpmdW5jdGlvbigpe3ZhciBhPWIuY3VycmVudCxkPWEuY2xvc2VFZmZlY3QsZT1cImVsYXN0aWNcIj09PWQsYz17b3BhY2l0eTowLjF9O2UmJihjPXRoaXMuZ2V0T3JpZ1Bvc2l0aW9uKCksYS5jbG9zZU9wYWNpdHkmJihjLm9wYWNpdHk9MC4xKSk7Yi53cmFwLmFuaW1hdGUoYyxcbntkdXJhdGlvbjpcIm5vbmVcIj09PWQ/MDphLmNsb3NlU3BlZWQsZWFzaW5nOmEuY2xvc2VFYXNpbmcsc3RlcDplP3RoaXMuc3RlcDpudWxsLGNvbXBsZXRlOmIuX2FmdGVyWm9vbU91dH0pfSxjaGFuZ2VJbjpmdW5jdGlvbigpe3ZhciBhPWIuY3VycmVudCxkPWEubmV4dEVmZmVjdCxlPWEucG9zLGM9e29wYWNpdHk6MX0sZj1iLmRpcmVjdGlvbixnO2Uub3BhY2l0eT0wLjE7XCJlbGFzdGljXCI9PT1kJiYoZz1cImRvd25cIj09PWZ8fFwidXBcIj09PWY/XCJ0b3BcIjpcImxlZnRcIixcImRvd25cIj09PWZ8fFwicmlnaHRcIj09PWY/KGVbZ109dyhsKGVbZ10pLTIwMCksY1tnXT1cIis9MjAwcHhcIik6KGVbZ109dyhsKGVbZ10pKzIwMCksY1tnXT1cIi09MjAwcHhcIikpO1wibm9uZVwiPT09ZD9iLl9hZnRlclpvb21JbigpOmIud3JhcC5jc3MoZSkuYW5pbWF0ZShjLHtkdXJhdGlvbjphLm5leHRTcGVlZCxlYXNpbmc6YS5uZXh0RWFzaW5nLGNvbXBsZXRlOmIuX2FmdGVyWm9vbUlufSl9LGNoYW5nZU91dDpmdW5jdGlvbigpe3ZhciBhPVxuYi5wcmV2aW91cyxkPWEucHJldkVmZmVjdCxlPXtvcGFjaXR5OjAuMX0sYz1iLmRpcmVjdGlvbjtcImVsYXN0aWNcIj09PWQmJihlW1wiZG93blwiPT09Y3x8XCJ1cFwiPT09Yz9cInRvcFwiOlwibGVmdFwiXT0oXCJ1cFwiPT09Y3x8XCJsZWZ0XCI9PT1jP1wiLVwiOlwiK1wiKStcIj0yMDBweFwiKTthLndyYXAuYW5pbWF0ZShlLHtkdXJhdGlvbjpcIm5vbmVcIj09PWQ/MDphLnByZXZTcGVlZCxlYXNpbmc6YS5wcmV2RWFzaW5nLGNvbXBsZXRlOmZ1bmN0aW9uKCl7Zih0aGlzKS50cmlnZ2VyKFwib25SZXNldFwiKS5yZW1vdmUoKX19KX19O2IuaGVscGVycy5vdmVybGF5PXtkZWZhdWx0czp7Y2xvc2VDbGljazohMCxzcGVlZE91dDoyMDAsc2hvd0Vhcmx5OiEwLGNzczp7fSxsb2NrZWQ6IXMsZml4ZWQ6ITB9LG92ZXJsYXk6bnVsbCxmaXhlZDohMSxlbDpmKFwiaHRtbFwiKSxjcmVhdGU6ZnVuY3Rpb24oYSl7YT1mLmV4dGVuZCh7fSx0aGlzLmRlZmF1bHRzLGEpO3RoaXMub3ZlcmxheSYmdGhpcy5jbG9zZSgpO3RoaXMub3ZlcmxheT1cbmYoJzxkaXYgY2xhc3M9XCJmYW5jeWJveC1vdmVybGF5XCI+PC9kaXY+JykuYXBwZW5kVG8oYi5jb21pbmc/Yi5jb21pbmcucGFyZW50OmEucGFyZW50KTt0aGlzLmZpeGVkPSExO2EuZml4ZWQmJmIuZGVmYXVsdHMuZml4ZWQmJih0aGlzLm92ZXJsYXkuYWRkQ2xhc3MoXCJmYW5jeWJveC1vdmVybGF5LWZpeGVkXCIpLHRoaXMuZml4ZWQ9ITApfSxvcGVuOmZ1bmN0aW9uKGEpe3ZhciBkPXRoaXM7YT1mLmV4dGVuZCh7fSx0aGlzLmRlZmF1bHRzLGEpO3RoaXMub3ZlcmxheT90aGlzLm92ZXJsYXkudW5iaW5kKFwiLm92ZXJsYXlcIikud2lkdGgoXCJhdXRvXCIpLmhlaWdodChcImF1dG9cIik6dGhpcy5jcmVhdGUoYSk7dGhpcy5maXhlZHx8KG4uYmluZChcInJlc2l6ZS5vdmVybGF5XCIsZi5wcm94eSh0aGlzLnVwZGF0ZSx0aGlzKSksdGhpcy51cGRhdGUoKSk7YS5jbG9zZUNsaWNrJiZ0aGlzLm92ZXJsYXkuYmluZChcImNsaWNrLm92ZXJsYXlcIixmdW5jdGlvbihhKXtpZihmKGEudGFyZ2V0KS5oYXNDbGFzcyhcImZhbmN5Ym94LW92ZXJsYXlcIikpcmV0dXJuIGIuaXNBY3RpdmU/XG5iLmNsb3NlKCk6ZC5jbG9zZSgpLCExfSk7dGhpcy5vdmVybGF5LmNzcyhhLmNzcykuc2hvdygpfSxjbG9zZTpmdW5jdGlvbigpe3ZhciBhLGI7bi51bmJpbmQoXCJyZXNpemUub3ZlcmxheVwiKTt0aGlzLmVsLmhhc0NsYXNzKFwiZmFuY3lib3gtbG9ja1wiKSYmKGYoXCIuZmFuY3lib3gtbWFyZ2luXCIpLnJlbW92ZUNsYXNzKFwiZmFuY3lib3gtbWFyZ2luXCIpLGE9bi5zY3JvbGxUb3AoKSxiPW4uc2Nyb2xsTGVmdCgpLHRoaXMuZWwucmVtb3ZlQ2xhc3MoXCJmYW5jeWJveC1sb2NrXCIpLG4uc2Nyb2xsVG9wKGEpLnNjcm9sbExlZnQoYikpO2YoXCIuZmFuY3lib3gtb3ZlcmxheVwiKS5yZW1vdmUoKS5oaWRlKCk7Zi5leHRlbmQodGhpcyx7b3ZlcmxheTpudWxsLGZpeGVkOiExfSl9LHVwZGF0ZTpmdW5jdGlvbigpe3ZhciBhPVwiMTAwJVwiLGI7dGhpcy5vdmVybGF5LndpZHRoKGEpLmhlaWdodChcIjEwMCVcIik7ST8oYj1NYXRoLm1heChHLmRvY3VtZW50RWxlbWVudC5vZmZzZXRXaWR0aCxHLmJvZHkub2Zmc2V0V2lkdGgpLFxucC53aWR0aCgpPmImJihhPXAud2lkdGgoKSkpOnAud2lkdGgoKT5uLndpZHRoKCkmJihhPXAud2lkdGgoKSk7dGhpcy5vdmVybGF5LndpZHRoKGEpLmhlaWdodChwLmhlaWdodCgpKX0sb25SZWFkeTpmdW5jdGlvbihhLGIpe3ZhciBlPXRoaXMub3ZlcmxheTtmKFwiLmZhbmN5Ym94LW92ZXJsYXlcIikuc3RvcCghMCwhMCk7ZXx8dGhpcy5jcmVhdGUoYSk7YS5sb2NrZWQmJih0aGlzLmZpeGVkJiZiLmZpeGVkKSYmKGV8fCh0aGlzLm1hcmdpbj1wLmhlaWdodCgpPm4uaGVpZ2h0KCk/ZihcImh0bWxcIikuY3NzKFwibWFyZ2luLXJpZ2h0XCIpLnJlcGxhY2UoXCJweFwiLFwiXCIpOiExKSxiLmxvY2tlZD10aGlzLm92ZXJsYXkuYXBwZW5kKGIud3JhcCksYi5maXhlZD0hMSk7ITA9PT1hLnNob3dFYXJseSYmdGhpcy5iZWZvcmVTaG93LmFwcGx5KHRoaXMsYXJndW1lbnRzKX0sYmVmb3JlU2hvdzpmdW5jdGlvbihhLGIpe3ZhciBlLGM7Yi5sb2NrZWQmJighMSE9PXRoaXMubWFyZ2luJiYoZihcIipcIikuZmlsdGVyKGZ1bmN0aW9uKCl7cmV0dXJuXCJmaXhlZFwiPT09XG5mKHRoaXMpLmNzcyhcInBvc2l0aW9uXCIpJiYhZih0aGlzKS5oYXNDbGFzcyhcImZhbmN5Ym94LW92ZXJsYXlcIikmJiFmKHRoaXMpLmhhc0NsYXNzKFwiZmFuY3lib3gtd3JhcFwiKX0pLmFkZENsYXNzKFwiZmFuY3lib3gtbWFyZ2luXCIpLHRoaXMuZWwuYWRkQ2xhc3MoXCJmYW5jeWJveC1tYXJnaW5cIikpLGU9bi5zY3JvbGxUb3AoKSxjPW4uc2Nyb2xsTGVmdCgpLHRoaXMuZWwuYWRkQ2xhc3MoXCJmYW5jeWJveC1sb2NrXCIpLG4uc2Nyb2xsVG9wKGUpLnNjcm9sbExlZnQoYykpO3RoaXMub3BlbihhKX0sb25VcGRhdGU6ZnVuY3Rpb24oKXt0aGlzLmZpeGVkfHx0aGlzLnVwZGF0ZSgpfSxhZnRlckNsb3NlOmZ1bmN0aW9uKGEpe3RoaXMub3ZlcmxheSYmIWIuY29taW5nJiZ0aGlzLm92ZXJsYXkuZmFkZU91dChhLnNwZWVkT3V0LGYucHJveHkodGhpcy5jbG9zZSx0aGlzKSl9fTtiLmhlbHBlcnMudGl0bGU9e2RlZmF1bHRzOnt0eXBlOlwiZmxvYXRcIixwb3NpdGlvbjpcImJvdHRvbVwifSxiZWZvcmVTaG93OmZ1bmN0aW9uKGEpe3ZhciBkPVxuYi5jdXJyZW50LGU9ZC50aXRsZSxjPWEudHlwZTtmLmlzRnVuY3Rpb24oZSkmJihlPWUuY2FsbChkLmVsZW1lbnQsZCkpO2lmKHEoZSkmJlwiXCIhPT1mLnRyaW0oZSkpe2Q9ZignPGRpdiBjbGFzcz1cImZhbmN5Ym94LXRpdGxlIGZhbmN5Ym94LXRpdGxlLScrYysnLXdyYXBcIj4nK2UrXCI8L2Rpdj5cIik7c3dpdGNoKGMpe2Nhc2UgXCJpbnNpZGVcIjpjPWIuc2tpbjticmVhaztjYXNlIFwib3V0c2lkZVwiOmM9Yi53cmFwO2JyZWFrO2Nhc2UgXCJvdmVyXCI6Yz1iLmlubmVyO2JyZWFrO2RlZmF1bHQ6Yz1iLnNraW4sZC5hcHBlbmRUbyhcImJvZHlcIiksSSYmZC53aWR0aChkLndpZHRoKCkpLGQud3JhcElubmVyKCc8c3BhbiBjbGFzcz1cImNoaWxkXCI+PC9zcGFuPicpLGIuY3VycmVudC5tYXJnaW5bMl0rPU1hdGguYWJzKGwoZC5jc3MoXCJtYXJnaW4tYm90dG9tXCIpKSl9ZFtcInRvcFwiPT09YS5wb3NpdGlvbj9cInByZXBlbmRUb1wiOlwiYXBwZW5kVG9cIl0oYyl9fX07Zi5mbi5mYW5jeWJveD1mdW5jdGlvbihhKXt2YXIgZCxcbmU9Zih0aGlzKSxjPXRoaXMuc2VsZWN0b3J8fFwiXCIsaz1mdW5jdGlvbihnKXt2YXIgaD1mKHRoaXMpLmJsdXIoKSxqPWQsayxsOyFnLmN0cmxLZXkmJighZy5hbHRLZXkmJiFnLnNoaWZ0S2V5JiYhZy5tZXRhS2V5KSYmIWguaXMoXCIuZmFuY3lib3gtd3JhcFwiKSYmKGs9YS5ncm91cEF0dHJ8fFwiZGF0YS1mYW5jeWJveC1ncm91cFwiLGw9aC5hdHRyKGspLGx8fChrPVwicmVsXCIsbD1oLmdldCgwKVtrXSksbCYmKFwiXCIhPT1sJiZcIm5vZm9sbG93XCIhPT1sKSYmKGg9Yy5sZW5ndGg/ZihjKTplLGg9aC5maWx0ZXIoXCJbXCIraysnPVwiJytsKydcIl0nKSxqPWguaW5kZXgodGhpcykpLGEuaW5kZXg9aiwhMSE9PWIub3BlbihoLGEpJiZnLnByZXZlbnREZWZhdWx0KCkpfTthPWF8fHt9O2Q9YS5pbmRleHx8MDshY3x8ITE9PT1hLmxpdmU/ZS51bmJpbmQoXCJjbGljay5mYi1zdGFydFwiKS5iaW5kKFwiY2xpY2suZmItc3RhcnRcIixrKTpwLnVuZGVsZWdhdGUoYyxcImNsaWNrLmZiLXN0YXJ0XCIpLmRlbGVnYXRlKGMrXG5cIjpub3QoJy5mYW5jeWJveC1pdGVtLCAuZmFuY3lib3gtbmF2JylcIixcImNsaWNrLmZiLXN0YXJ0XCIsayk7dGhpcy5maWx0ZXIoXCJbZGF0YS1mYW5jeWJveC1zdGFydD0xXVwiKS50cmlnZ2VyKFwiY2xpY2tcIik7cmV0dXJuIHRoaXN9O3AucmVhZHkoZnVuY3Rpb24oKXt2YXIgYSxkO2Yuc2Nyb2xsYmFyV2lkdGg9PT12JiYoZi5zY3JvbGxiYXJXaWR0aD1mdW5jdGlvbigpe3ZhciBhPWYoJzxkaXYgc3R5bGU9XCJ3aWR0aDo1MHB4O2hlaWdodDo1MHB4O292ZXJmbG93OmF1dG9cIj48ZGl2Lz48L2Rpdj4nKS5hcHBlbmRUbyhcImJvZHlcIiksYj1hLmNoaWxkcmVuKCksYj1iLmlubmVyV2lkdGgoKS1iLmhlaWdodCg5OSkuaW5uZXJXaWR0aCgpO2EucmVtb3ZlKCk7cmV0dXJuIGJ9KTtpZihmLnN1cHBvcnQuZml4ZWRQb3NpdGlvbj09PXYpe2E9Zi5zdXBwb3J0O2Q9ZignPGRpdiBzdHlsZT1cInBvc2l0aW9uOmZpeGVkO3RvcDoyMHB4O1wiPjwvZGl2PicpLmFwcGVuZFRvKFwiYm9keVwiKTt2YXIgZT0yMD09PVxuZFswXS5vZmZzZXRUb3B8fDE1PT09ZFswXS5vZmZzZXRUb3A7ZC5yZW1vdmUoKTthLmZpeGVkUG9zaXRpb249ZX1mLmV4dGVuZChiLmRlZmF1bHRzLHtzY3JvbGxiYXJXaWR0aDpmLnNjcm9sbGJhcldpZHRoKCksZml4ZWQ6Zi5zdXBwb3J0LmZpeGVkUG9zaXRpb24scGFyZW50OmYoXCJib2R5XCIpfSk7YT1mKHIpLndpZHRoKCk7Si5hZGRDbGFzcyhcImZhbmN5Ym94LWxvY2stdGVzdFwiKTtkPWYocikud2lkdGgoKTtKLnJlbW92ZUNsYXNzKFwiZmFuY3lib3gtbG9jay10ZXN0XCIpO2YoXCI8c3R5bGUgdHlwZT0ndGV4dC9jc3MnPi5mYW5jeWJveC1tYXJnaW57bWFyZ2luLXJpZ2h0OlwiKyhkLWEpK1wicHg7fTwvc3R5bGU+XCIpLmFwcGVuZFRvKFwiaGVhZFwiKX0pfSkod2luZG93LGRvY3VtZW50LGpRdWVyeSk7IiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgJChcImlmcmFtZVtzcmMqPWluc2lnaXRdXCIpLmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xuXG4gICAgLyoqKioqKioqKioqKioqKioqIFdheXBvaW50cyAqKioqKioqKioqKioqKioqKiovXG4gICAgJCgnLndwMScpLndheXBvaW50KGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcud3AxJykuYWRkQ2xhc3MoJ2FuaW1hdGVkIGZhZGVJblVwJyk7XG4gICAgfSwge1xuICAgICAgICBvZmZzZXQ6ICc3NSUnXG4gICAgfSk7XG4gICAgJCgnLndwMicpLndheXBvaW50KGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcud3AyJykuYWRkQ2xhc3MoJ2FuaW1hdGVkIGZhZGVJblVwJyk7XG4gICAgfSwge1xuICAgICAgICBvZmZzZXQ6ICc3NSUnXG4gICAgfSk7XG4gICAgJCgnLndwMycpLndheXBvaW50KGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcud3AzJykuYWRkQ2xhc3MoJ2FuaW1hdGVkIGZhZGVJblJpZ2h0Jyk7XG4gICAgfSwge1xuICAgICAgICBvZmZzZXQ6ICc3NSUnXG4gICAgfSk7XG4gICAgJCgnLndwNCcpLndheXBvaW50KGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcud3A0JykuYWRkQ2xhc3MoJ2FuaW1hdGVkIGZhZGVJblVwJyk7XG4gICAgfSwge1xuICAgICAgICBvZmZzZXQ6ICc5NSUnXG4gICAgfSk7XG4gICAgJCgnLndwNScpLndheXBvaW50KGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcud3A1JykuYWRkQ2xhc3MoJ2FuaW1hdGVkIGZhZGVJblVwJyk7XG4gICAgfSwge1xuICAgICAgICBvZmZzZXQ6ICc5MyUnXG4gICAgfSk7XG4gICAgJCgnLndwNicpLndheXBvaW50KGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcud3A2JykuYWRkQ2xhc3MoJ2FuaW1hdGVkIGZhZGVJblVwJyk7XG4gICAgfSwge1xuICAgICAgICBvZmZzZXQ6ICc5MCUnXG4gICAgfSk7XG5cbiAgICAvKioqKioqKioqKioqKioqKiogSW5pdGlhdGUgRmxleHNsaWRlciAqKioqKioqKioqKioqKioqKiovXG4gICAgJCgnLmZsZXhzbGlkZXInKS5mbGV4c2xpZGVyKHtcbiAgICAgICAgYW5pbWF0aW9uOiBcInNsaWRlXCIsXG4gICAgICAgIHNsaWRlc2hvd1NwZWVkOiAxMDAwMCxcbiAgICAgICAgYW5pbWF0aW9uRHVyYXRpb246IDQwMCxcbiAgICAgICAgcGF1c2VPbkhvdmVyOiB0cnVlXG4gICAgfSk7XG5cbiAgICAvKioqKioqKioqKioqKioqKiogSW5pdGlhdGUgRmFuY3lib3ggKioqKioqKioqKioqKioqKioqL1xuICAgICQoJy5zaW5nbGVfaW1hZ2UnKS5mYW5jeWJveCh7XG4gICAgICAgIHBhZGRpbmc6IDQsXG4gICAgfSk7XG5cbiAgICAvKioqKioqKioqKioqKioqKiogVG9vbHRpcHMgKioqKioqKioqKioqKioqKioqL1xuICAgIC8vJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcblxuICAgIC8qKioqKioqKioqKioqKioqKiBOYXYgVHJhbnNmb3JtaWNvbiAqKioqKioqKioqKioqKioqKiovXG4gICAgLyogV2hlbiB1c2VyIGNsaWNrcyB0aGUgSWNvbiAqL1xuICAgICQoJy5uYXYtdG9nZ2xlJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgICQodGhpcykudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAkKCcuaGVhZGVyLW5hdicpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSk7XG4gICAgLyogV2hlbiB1c2VyIGNsaWNrcyBhIGxpbmsgKi9cbiAgICAkKCcuaGVhZGVyLW5hdiBsaSBhJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgICQoJy5uYXYtdG9nZ2xlJykudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAkKCcuaGVhZGVyLW5hdicpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XG4gICAgfSk7XG5cbiAgICAvKioqKioqKioqKioqKioqKiogSGVhZGVyIEJHIFNjcm9sbCAqKioqKioqKioqKioqKioqKiovXG4gICAgJChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNjcm9sbCA9IHtcbiAgICAgICAgICAgIGNvbnRyb2w6IHtcbiAgICAgICAgICAgICAgICBmaXhlZHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAkKCdzZWN0aW9uLm5hdmlnYXRpb24nKS5hZGRDbGFzcygnZml4ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgJCgnc2VjdGlvbi5uYXZpZ2F0aW9uJykucmVtb3ZlQ2xhc3MoJ25vdC1maXhlZCcpO1xuICAgICAgICAgICAgICAgICAgICAkKCdoZWFkZXInKS5jc3Moe1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJib3JkZXItYm90dG9tXCI6IFwic29saWQgMXB4IHJnYmEoMjU1LCAyNTUsIDI1NSwgMClcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicGFkZGluZ1wiOiBcIjEwcHggMFwiXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAkKCdoZWFkZXIgLm1lbWJlci1hY3Rpb25zJykuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidG9wXCI6IFwiMTdweFwiLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgJCgnaGVhZGVyIC5uYXZpY29uJykuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidG9wXCI6IFwiMjNweFwiLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG5vdGZpeGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJCgnc2VjdGlvbi5uYXZpZ2F0aW9uJykucmVtb3ZlQ2xhc3MoJ2ZpeGVkJyk7XG4gICAgICAgICAgICAgICAgICAgICQoJ3NlY3Rpb24ubmF2aWdhdGlvbicpLmFkZENsYXNzKCdub3QtZml4ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgJCgnaGVhZGVyJykuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYm9yZGVyLWJvdHRvbVwiOiBcInNvbGlkIDFweCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMilcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicGFkZGluZ1wiOiBcIjEwcHggMFwiXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAkKCdoZWFkZXIgLm1lbWJlci1hY3Rpb25zJykuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidG9wXCI6IFwiMTdweFwiLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgJCgnaGVhZGVyIC5uYXZpY29uJykuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidG9wXCI6IFwiMjNweFwiLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2Nyb2xsID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChzY3JvbGwgPj0gMjApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZml4ZWRzKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5vdGZpeGVkKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gICBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pbml0KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgJCh3aW5kb3cpLnNjcm9sbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuaW5pdCgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzY3JvbGwuY29udHJvbC5ldmVudHMoKTtcbiAgICB9KTtcblxuICAgIC8qKioqKioqKioqKioqKioqKiBTbW9vdGggU2Nyb2xsaW5nICoqKioqKioqKioqKioqKioqKi9cbiAgICAkKGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCdhW2hyZWYqPSNdOm5vdChbaHJlZj0jXSknKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChsb2NhdGlvbi5wYXRobmFtZS5yZXBsYWNlKC9eXFwvLywgJycpID09PSB0aGlzLnBhdGhuYW1lLnJlcGxhY2UoL15cXC8vLCAnJykgJiYgbG9jYXRpb24uaG9zdG5hbWUgPT09IHRoaXMuaG9zdG5hbWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0gJCh0aGlzLmhhc2gpO1xuICAgICAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5sZW5ndGggPyB0YXJnZXQgOiAkKCdbbmFtZT0nICsgdGhpcy5oYXNoLnNsaWNlKDEpICsgJ10nKTtcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAkKCdodG1sLGJvZHknKS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbFRvcDogdGFyZ2V0Lm9mZnNldCgpLnRvcCAtICQoJy5uYXZpZ2F0aW9uJykuaGVpZ2h0KClcbiAgICAgICAgICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7IiwiLypcbiAqIGpRdWVyeSBGbGV4U2xpZGVyIHYyLjUuMFxuICogQ29weXJpZ2h0IDIwMTIgV29vVGhlbWVzXG4gKiBDb250cmlidXRpbmcgQXV0aG9yOiBUeWxlciBTbWl0aFxuICovIWZ1bmN0aW9uKCQpeyQuZmxleHNsaWRlcj1mdW5jdGlvbihlLHQpe3ZhciBhPSQoZSk7YS52YXJzPSQuZXh0ZW5kKHt9LCQuZmxleHNsaWRlci5kZWZhdWx0cyx0KTt2YXIgbj1hLnZhcnMubmFtZXNwYWNlLGk9d2luZG93Lm5hdmlnYXRvciYmd2luZG93Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkJiZ3aW5kb3cuTVNHZXN0dXJlLHM9KFwib250b3VjaHN0YXJ0XCJpbiB3aW5kb3d8fGl8fHdpbmRvdy5Eb2N1bWVudFRvdWNoJiZkb2N1bWVudCBpbnN0YW5jZW9mIERvY3VtZW50VG91Y2gpJiZhLnZhcnMudG91Y2gscj1cImNsaWNrIHRvdWNoZW5kIE1TUG9pbnRlclVwIGtleXVwXCIsbz1cIlwiLGwsYz1cInZlcnRpY2FsXCI9PT1hLnZhcnMuZGlyZWN0aW9uLGQ9YS52YXJzLnJldmVyc2UsdT1hLnZhcnMuaXRlbVdpZHRoPjAsdj1cImZhZGVcIj09PWEudmFycy5hbmltYXRpb24scD1cIlwiIT09YS52YXJzLmFzTmF2Rm9yLG09e30sZj0hMDskLmRhdGEoZSxcImZsZXhzbGlkZXJcIixhKSxtPXtpbml0OmZ1bmN0aW9uKCl7YS5hbmltYXRpbmc9ITEsYS5jdXJyZW50U2xpZGU9cGFyc2VJbnQoYS52YXJzLnN0YXJ0QXQ/YS52YXJzLnN0YXJ0QXQ6MCwxMCksaXNOYU4oYS5jdXJyZW50U2xpZGUpJiYoYS5jdXJyZW50U2xpZGU9MCksYS5hbmltYXRpbmdUbz1hLmN1cnJlbnRTbGlkZSxhLmF0RW5kPTA9PT1hLmN1cnJlbnRTbGlkZXx8YS5jdXJyZW50U2xpZGU9PT1hLmxhc3QsYS5jb250YWluZXJTZWxlY3Rvcj1hLnZhcnMuc2VsZWN0b3Iuc3Vic3RyKDAsYS52YXJzLnNlbGVjdG9yLnNlYXJjaChcIiBcIikpLGEuc2xpZGVzPSQoYS52YXJzLnNlbGVjdG9yLGEpLGEuY29udGFpbmVyPSQoYS5jb250YWluZXJTZWxlY3RvcixhKSxhLmNvdW50PWEuc2xpZGVzLmxlbmd0aCxhLnN5bmNFeGlzdHM9JChhLnZhcnMuc3luYykubGVuZ3RoPjAsXCJzbGlkZVwiPT09YS52YXJzLmFuaW1hdGlvbiYmKGEudmFycy5hbmltYXRpb249XCJzd2luZ1wiKSxhLnByb3A9Yz9cInRvcFwiOlwibWFyZ2luTGVmdFwiLGEuYXJncz17fSxhLm1hbnVhbFBhdXNlPSExLGEuc3RvcHBlZD0hMSxhLnN0YXJ0ZWQ9ITEsYS5zdGFydFRpbWVvdXQ9bnVsbCxhLnRyYW5zaXRpb25zPSFhLnZhcnMudmlkZW8mJiF2JiZhLnZhcnMudXNlQ1NTJiZmdW5jdGlvbigpe3ZhciBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksdD1bXCJwZXJzcGVjdGl2ZVByb3BlcnR5XCIsXCJXZWJraXRQZXJzcGVjdGl2ZVwiLFwiTW96UGVyc3BlY3RpdmVcIixcIk9QZXJzcGVjdGl2ZVwiLFwibXNQZXJzcGVjdGl2ZVwiXTtmb3IodmFyIG4gaW4gdClpZih2b2lkIDAhPT1lLnN0eWxlW3Rbbl1dKXJldHVybiBhLnBmeD10W25dLnJlcGxhY2UoXCJQZXJzcGVjdGl2ZVwiLFwiXCIpLnRvTG93ZXJDYXNlKCksYS5wcm9wPVwiLVwiK2EucGZ4K1wiLXRyYW5zZm9ybVwiLCEwO3JldHVybiExfSgpLGEuZW5zdXJlQW5pbWF0aW9uRW5kPVwiXCIsXCJcIiE9PWEudmFycy5jb250cm9sc0NvbnRhaW5lciYmKGEuY29udHJvbHNDb250YWluZXI9JChhLnZhcnMuY29udHJvbHNDb250YWluZXIpLmxlbmd0aD4wJiYkKGEudmFycy5jb250cm9sc0NvbnRhaW5lcikpLFwiXCIhPT1hLnZhcnMubWFudWFsQ29udHJvbHMmJihhLm1hbnVhbENvbnRyb2xzPSQoYS52YXJzLm1hbnVhbENvbnRyb2xzKS5sZW5ndGg+MCYmJChhLnZhcnMubWFudWFsQ29udHJvbHMpKSxcIlwiIT09YS52YXJzLmN1c3RvbURpcmVjdGlvbk5hdiYmKGEuY3VzdG9tRGlyZWN0aW9uTmF2PTI9PT0kKGEudmFycy5jdXN0b21EaXJlY3Rpb25OYXYpLmxlbmd0aCYmJChhLnZhcnMuY3VzdG9tRGlyZWN0aW9uTmF2KSksYS52YXJzLnJhbmRvbWl6ZSYmKGEuc2xpZGVzLnNvcnQoZnVuY3Rpb24oKXtyZXR1cm4gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpKS0uNX0pLGEuY29udGFpbmVyLmVtcHR5KCkuYXBwZW5kKGEuc2xpZGVzKSksYS5kb01hdGgoKSxhLnNldHVwKFwiaW5pdFwiKSxhLnZhcnMuY29udHJvbE5hdiYmbS5jb250cm9sTmF2LnNldHVwKCksYS52YXJzLmRpcmVjdGlvbk5hdiYmbS5kaXJlY3Rpb25OYXYuc2V0dXAoKSxhLnZhcnMua2V5Ym9hcmQmJigxPT09JChhLmNvbnRhaW5lclNlbGVjdG9yKS5sZW5ndGh8fGEudmFycy5tdWx0aXBsZUtleWJvYXJkKSYmJChkb2N1bWVudCkuYmluZChcImtleXVwXCIsZnVuY3Rpb24oZSl7dmFyIHQ9ZS5rZXlDb2RlO2lmKCFhLmFuaW1hdGluZyYmKDM5PT09dHx8Mzc9PT10KSl7dmFyIG49Mzk9PT10P2EuZ2V0VGFyZ2V0KFwibmV4dFwiKTozNz09PXQ/YS5nZXRUYXJnZXQoXCJwcmV2XCIpOiExO2EuZmxleEFuaW1hdGUobixhLnZhcnMucGF1c2VPbkFjdGlvbil9fSksYS52YXJzLm1vdXNld2hlZWwmJmEuYmluZChcIm1vdXNld2hlZWxcIixmdW5jdGlvbihlLHQsbixpKXtlLnByZXZlbnREZWZhdWx0KCk7dmFyIHM9YS5nZXRUYXJnZXQoMD50P1wibmV4dFwiOlwicHJldlwiKTthLmZsZXhBbmltYXRlKHMsYS52YXJzLnBhdXNlT25BY3Rpb24pfSksYS52YXJzLnBhdXNlUGxheSYmbS5wYXVzZVBsYXkuc2V0dXAoKSxhLnZhcnMuc2xpZGVzaG93JiZhLnZhcnMucGF1c2VJbnZpc2libGUmJm0ucGF1c2VJbnZpc2libGUuaW5pdCgpLGEudmFycy5zbGlkZXNob3cmJihhLnZhcnMucGF1c2VPbkhvdmVyJiZhLmhvdmVyKGZ1bmN0aW9uKCl7YS5tYW51YWxQbGF5fHxhLm1hbnVhbFBhdXNlfHxhLnBhdXNlKCl9LGZ1bmN0aW9uKCl7YS5tYW51YWxQYXVzZXx8YS5tYW51YWxQbGF5fHxhLnN0b3BwZWR8fGEucGxheSgpfSksYS52YXJzLnBhdXNlSW52aXNpYmxlJiZtLnBhdXNlSW52aXNpYmxlLmlzSGlkZGVuKCl8fChhLnZhcnMuaW5pdERlbGF5PjA/YS5zdGFydFRpbWVvdXQ9c2V0VGltZW91dChhLnBsYXksYS52YXJzLmluaXREZWxheSk6YS5wbGF5KCkpKSxwJiZtLmFzTmF2LnNldHVwKCkscyYmYS52YXJzLnRvdWNoJiZtLnRvdWNoKCksKCF2fHx2JiZhLnZhcnMuc21vb3RoSGVpZ2h0KSYmJCh3aW5kb3cpLmJpbmQoXCJyZXNpemUgb3JpZW50YXRpb25jaGFuZ2UgZm9jdXNcIixtLnJlc2l6ZSksYS5maW5kKFwiaW1nXCIpLmF0dHIoXCJkcmFnZ2FibGVcIixcImZhbHNlXCIpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXthLnZhcnMuc3RhcnQoYSl9LDIwMCl9LGFzTmF2OntzZXR1cDpmdW5jdGlvbigpe2EuYXNOYXY9ITAsYS5hbmltYXRpbmdUbz1NYXRoLmZsb29yKGEuY3VycmVudFNsaWRlL2EubW92ZSksYS5jdXJyZW50SXRlbT1hLmN1cnJlbnRTbGlkZSxhLnNsaWRlcy5yZW1vdmVDbGFzcyhuK1wiYWN0aXZlLXNsaWRlXCIpLmVxKGEuY3VycmVudEl0ZW0pLmFkZENsYXNzKG4rXCJhY3RpdmUtc2xpZGVcIiksaT8oZS5fc2xpZGVyPWEsYS5zbGlkZXMuZWFjaChmdW5jdGlvbigpe3ZhciBlPXRoaXM7ZS5fZ2VzdHVyZT1uZXcgTVNHZXN0dXJlLGUuX2dlc3R1cmUudGFyZ2V0PWUsZS5hZGRFdmVudExpc3RlbmVyKFwiTVNQb2ludGVyRG93blwiLGZ1bmN0aW9uKGUpe2UucHJldmVudERlZmF1bHQoKSxlLmN1cnJlbnRUYXJnZXQuX2dlc3R1cmUmJmUuY3VycmVudFRhcmdldC5fZ2VzdHVyZS5hZGRQb2ludGVyKGUucG9pbnRlcklkKX0sITEpLGUuYWRkRXZlbnRMaXN0ZW5lcihcIk1TR2VzdHVyZVRhcFwiLGZ1bmN0aW9uKGUpe2UucHJldmVudERlZmF1bHQoKTt2YXIgdD0kKHRoaXMpLG49dC5pbmRleCgpOyQoYS52YXJzLmFzTmF2Rm9yKS5kYXRhKFwiZmxleHNsaWRlclwiKS5hbmltYXRpbmd8fHQuaGFzQ2xhc3MoXCJhY3RpdmVcIil8fChhLmRpcmVjdGlvbj1hLmN1cnJlbnRJdGVtPG4/XCJuZXh0XCI6XCJwcmV2XCIsYS5mbGV4QW5pbWF0ZShuLGEudmFycy5wYXVzZU9uQWN0aW9uLCExLCEwLCEwKSl9KX0pKTphLnNsaWRlcy5vbihyLGZ1bmN0aW9uKGUpe2UucHJldmVudERlZmF1bHQoKTt2YXIgdD0kKHRoaXMpLGk9dC5pbmRleCgpLHM9dC5vZmZzZXQoKS5sZWZ0LSQoYSkuc2Nyb2xsTGVmdCgpOzA+PXMmJnQuaGFzQ2xhc3MobitcImFjdGl2ZS1zbGlkZVwiKT9hLmZsZXhBbmltYXRlKGEuZ2V0VGFyZ2V0KFwicHJldlwiKSwhMCk6JChhLnZhcnMuYXNOYXZGb3IpLmRhdGEoXCJmbGV4c2xpZGVyXCIpLmFuaW1hdGluZ3x8dC5oYXNDbGFzcyhuK1wiYWN0aXZlLXNsaWRlXCIpfHwoYS5kaXJlY3Rpb249YS5jdXJyZW50SXRlbTxpP1wibmV4dFwiOlwicHJldlwiLGEuZmxleEFuaW1hdGUoaSxhLnZhcnMucGF1c2VPbkFjdGlvbiwhMSwhMCwhMCkpfSl9fSxjb250cm9sTmF2OntzZXR1cDpmdW5jdGlvbigpe2EubWFudWFsQ29udHJvbHM/bS5jb250cm9sTmF2LnNldHVwTWFudWFsKCk6bS5jb250cm9sTmF2LnNldHVwUGFnaW5nKCl9LHNldHVwUGFnaW5nOmZ1bmN0aW9uKCl7dmFyIGU9XCJ0aHVtYm5haWxzXCI9PT1hLnZhcnMuY29udHJvbE5hdj9cImNvbnRyb2wtdGh1bWJzXCI6XCJjb250cm9sLXBhZ2luZ1wiLHQ9MSxpLHM7aWYoYS5jb250cm9sTmF2U2NhZmZvbGQ9JCgnPG9sIGNsYXNzPVwiJytuK1wiY29udHJvbC1uYXYgXCIrbitlKydcIj48L29sPicpLGEucGFnaW5nQ291bnQ+MSlmb3IodmFyIGw9MDtsPGEucGFnaW5nQ291bnQ7bCsrKXtpZihzPWEuc2xpZGVzLmVxKGwpLGk9XCJ0aHVtYm5haWxzXCI9PT1hLnZhcnMuY29udHJvbE5hdj8nPGltZyBzcmM9XCInK3MuYXR0cihcImRhdGEtdGh1bWJcIikrJ1wiLz4nOlwiPGE+XCIrdCtcIjwvYT5cIixcInRodW1ibmFpbHNcIj09PWEudmFycy5jb250cm9sTmF2JiYhMD09PWEudmFycy50aHVtYkNhcHRpb25zKXt2YXIgYz1zLmF0dHIoXCJkYXRhLXRodW1iY2FwdGlvblwiKTtcIlwiIT09YyYmdm9pZCAwIT09YyYmKGkrPSc8c3BhbiBjbGFzcz1cIicrbisnY2FwdGlvblwiPicrYytcIjwvc3Bhbj5cIil9YS5jb250cm9sTmF2U2NhZmZvbGQuYXBwZW5kKFwiPGxpPlwiK2krXCI8L2xpPlwiKSx0Kyt9YS5jb250cm9sc0NvbnRhaW5lcj8kKGEuY29udHJvbHNDb250YWluZXIpLmFwcGVuZChhLmNvbnRyb2xOYXZTY2FmZm9sZCk6YS5hcHBlbmQoYS5jb250cm9sTmF2U2NhZmZvbGQpLG0uY29udHJvbE5hdi5zZXQoKSxtLmNvbnRyb2xOYXYuYWN0aXZlKCksYS5jb250cm9sTmF2U2NhZmZvbGQuZGVsZWdhdGUoXCJhLCBpbWdcIixyLGZ1bmN0aW9uKGUpe2lmKGUucHJldmVudERlZmF1bHQoKSxcIlwiPT09b3x8bz09PWUudHlwZSl7dmFyIHQ9JCh0aGlzKSxpPWEuY29udHJvbE5hdi5pbmRleCh0KTt0Lmhhc0NsYXNzKG4rXCJhY3RpdmVcIil8fChhLmRpcmVjdGlvbj1pPmEuY3VycmVudFNsaWRlP1wibmV4dFwiOlwicHJldlwiLGEuZmxleEFuaW1hdGUoaSxhLnZhcnMucGF1c2VPbkFjdGlvbikpfVwiXCI9PT1vJiYobz1lLnR5cGUpLG0uc2V0VG9DbGVhcldhdGNoZWRFdmVudCgpfSl9LHNldHVwTWFudWFsOmZ1bmN0aW9uKCl7YS5jb250cm9sTmF2PWEubWFudWFsQ29udHJvbHMsbS5jb250cm9sTmF2LmFjdGl2ZSgpLGEuY29udHJvbE5hdi5iaW5kKHIsZnVuY3Rpb24oZSl7aWYoZS5wcmV2ZW50RGVmYXVsdCgpLFwiXCI9PT1vfHxvPT09ZS50eXBlKXt2YXIgdD0kKHRoaXMpLGk9YS5jb250cm9sTmF2LmluZGV4KHQpO3QuaGFzQ2xhc3MobitcImFjdGl2ZVwiKXx8KGEuZGlyZWN0aW9uPWk+YS5jdXJyZW50U2xpZGU/XCJuZXh0XCI6XCJwcmV2XCIsYS5mbGV4QW5pbWF0ZShpLGEudmFycy5wYXVzZU9uQWN0aW9uKSl9XCJcIj09PW8mJihvPWUudHlwZSksbS5zZXRUb0NsZWFyV2F0Y2hlZEV2ZW50KCl9KX0sc2V0OmZ1bmN0aW9uKCl7dmFyIGU9XCJ0aHVtYm5haWxzXCI9PT1hLnZhcnMuY29udHJvbE5hdj9cImltZ1wiOlwiYVwiO2EuY29udHJvbE5hdj0kKFwiLlwiK24rXCJjb250cm9sLW5hdiBsaSBcIitlLGEuY29udHJvbHNDb250YWluZXI/YS5jb250cm9sc0NvbnRhaW5lcjphKX0sYWN0aXZlOmZ1bmN0aW9uKCl7YS5jb250cm9sTmF2LnJlbW92ZUNsYXNzKG4rXCJhY3RpdmVcIikuZXEoYS5hbmltYXRpbmdUbykuYWRkQ2xhc3MobitcImFjdGl2ZVwiKX0sdXBkYXRlOmZ1bmN0aW9uKGUsdCl7YS5wYWdpbmdDb3VudD4xJiZcImFkZFwiPT09ZT9hLmNvbnRyb2xOYXZTY2FmZm9sZC5hcHBlbmQoJChcIjxsaT48YT5cIithLmNvdW50K1wiPC9hPjwvbGk+XCIpKToxPT09YS5wYWdpbmdDb3VudD9hLmNvbnRyb2xOYXZTY2FmZm9sZC5maW5kKFwibGlcIikucmVtb3ZlKCk6YS5jb250cm9sTmF2LmVxKHQpLmNsb3Nlc3QoXCJsaVwiKS5yZW1vdmUoKSxtLmNvbnRyb2xOYXYuc2V0KCksYS5wYWdpbmdDb3VudD4xJiZhLnBhZ2luZ0NvdW50IT09YS5jb250cm9sTmF2Lmxlbmd0aD9hLnVwZGF0ZSh0LGUpOm0uY29udHJvbE5hdi5hY3RpdmUoKX19LGRpcmVjdGlvbk5hdjp7c2V0dXA6ZnVuY3Rpb24oKXt2YXIgZT0kKCc8dWwgY2xhc3M9XCInK24rJ2RpcmVjdGlvbi1uYXZcIj48bGkgY2xhc3M9XCInK24rJ25hdi1wcmV2XCI+PGEgY2xhc3M9XCInK24rJ3ByZXZcIiBocmVmPVwiI1wiPicrYS52YXJzLnByZXZUZXh0Kyc8L2E+PC9saT48bGkgY2xhc3M9XCInK24rJ25hdi1uZXh0XCI+PGEgY2xhc3M9XCInK24rJ25leHRcIiBocmVmPVwiI1wiPicrYS52YXJzLm5leHRUZXh0K1wiPC9hPjwvbGk+PC91bD5cIik7YS5jdXN0b21EaXJlY3Rpb25OYXY/YS5kaXJlY3Rpb25OYXY9YS5jdXN0b21EaXJlY3Rpb25OYXY6YS5jb250cm9sc0NvbnRhaW5lcj8oJChhLmNvbnRyb2xzQ29udGFpbmVyKS5hcHBlbmQoZSksYS5kaXJlY3Rpb25OYXY9JChcIi5cIituK1wiZGlyZWN0aW9uLW5hdiBsaSBhXCIsYS5jb250cm9sc0NvbnRhaW5lcikpOihhLmFwcGVuZChlKSxhLmRpcmVjdGlvbk5hdj0kKFwiLlwiK24rXCJkaXJlY3Rpb24tbmF2IGxpIGFcIixhKSksbS5kaXJlY3Rpb25OYXYudXBkYXRlKCksYS5kaXJlY3Rpb25OYXYuYmluZChyLGZ1bmN0aW9uKGUpe2UucHJldmVudERlZmF1bHQoKTt2YXIgdDsoXCJcIj09PW98fG89PT1lLnR5cGUpJiYodD1hLmdldFRhcmdldCgkKHRoaXMpLmhhc0NsYXNzKG4rXCJuZXh0XCIpP1wibmV4dFwiOlwicHJldlwiKSxhLmZsZXhBbmltYXRlKHQsYS52YXJzLnBhdXNlT25BY3Rpb24pKSxcIlwiPT09byYmKG89ZS50eXBlKSxtLnNldFRvQ2xlYXJXYXRjaGVkRXZlbnQoKX0pfSx1cGRhdGU6ZnVuY3Rpb24oKXt2YXIgZT1uK1wiZGlzYWJsZWRcIjsxPT09YS5wYWdpbmdDb3VudD9hLmRpcmVjdGlvbk5hdi5hZGRDbGFzcyhlKS5hdHRyKFwidGFiaW5kZXhcIixcIi0xXCIpOmEudmFycy5hbmltYXRpb25Mb29wP2EuZGlyZWN0aW9uTmF2LnJlbW92ZUNsYXNzKGUpLnJlbW92ZUF0dHIoXCJ0YWJpbmRleFwiKTowPT09YS5hbmltYXRpbmdUbz9hLmRpcmVjdGlvbk5hdi5yZW1vdmVDbGFzcyhlKS5maWx0ZXIoXCIuXCIrbitcInByZXZcIikuYWRkQ2xhc3MoZSkuYXR0cihcInRhYmluZGV4XCIsXCItMVwiKTphLmFuaW1hdGluZ1RvPT09YS5sYXN0P2EuZGlyZWN0aW9uTmF2LnJlbW92ZUNsYXNzKGUpLmZpbHRlcihcIi5cIituK1wibmV4dFwiKS5hZGRDbGFzcyhlKS5hdHRyKFwidGFiaW5kZXhcIixcIi0xXCIpOmEuZGlyZWN0aW9uTmF2LnJlbW92ZUNsYXNzKGUpLnJlbW92ZUF0dHIoXCJ0YWJpbmRleFwiKX19LHBhdXNlUGxheTp7c2V0dXA6ZnVuY3Rpb24oKXt2YXIgZT0kKCc8ZGl2IGNsYXNzPVwiJytuKydwYXVzZXBsYXlcIj48YT48L2E+PC9kaXY+Jyk7YS5jb250cm9sc0NvbnRhaW5lcj8oYS5jb250cm9sc0NvbnRhaW5lci5hcHBlbmQoZSksYS5wYXVzZVBsYXk9JChcIi5cIituK1wicGF1c2VwbGF5IGFcIixhLmNvbnRyb2xzQ29udGFpbmVyKSk6KGEuYXBwZW5kKGUpLGEucGF1c2VQbGF5PSQoXCIuXCIrbitcInBhdXNlcGxheSBhXCIsYSkpLG0ucGF1c2VQbGF5LnVwZGF0ZShhLnZhcnMuc2xpZGVzaG93P24rXCJwYXVzZVwiOm4rXCJwbGF5XCIpLGEucGF1c2VQbGF5LmJpbmQocixmdW5jdGlvbihlKXtlLnByZXZlbnREZWZhdWx0KCksKFwiXCI9PT1vfHxvPT09ZS50eXBlKSYmKCQodGhpcykuaGFzQ2xhc3MobitcInBhdXNlXCIpPyhhLm1hbnVhbFBhdXNlPSEwLGEubWFudWFsUGxheT0hMSxhLnBhdXNlKCkpOihhLm1hbnVhbFBhdXNlPSExLGEubWFudWFsUGxheT0hMCxhLnBsYXkoKSkpLFwiXCI9PT1vJiYobz1lLnR5cGUpLG0uc2V0VG9DbGVhcldhdGNoZWRFdmVudCgpfSl9LHVwZGF0ZTpmdW5jdGlvbihlKXtcInBsYXlcIj09PWU/YS5wYXVzZVBsYXkucmVtb3ZlQ2xhc3MobitcInBhdXNlXCIpLmFkZENsYXNzKG4rXCJwbGF5XCIpLmh0bWwoYS52YXJzLnBsYXlUZXh0KTphLnBhdXNlUGxheS5yZW1vdmVDbGFzcyhuK1wicGxheVwiKS5hZGRDbGFzcyhuK1wicGF1c2VcIikuaHRtbChhLnZhcnMucGF1c2VUZXh0KX19LHRvdWNoOmZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCh0KXt0LnN0b3BQcm9wYWdhdGlvbigpLGEuYW5pbWF0aW5nP3QucHJldmVudERlZmF1bHQoKTooYS5wYXVzZSgpLGUuX2dlc3R1cmUuYWRkUG9pbnRlcih0LnBvaW50ZXJJZCksdz0wLHA9Yz9hLmg6YS53LGY9TnVtYmVyKG5ldyBEYXRlKSxsPXUmJmQmJmEuYW5pbWF0aW5nVG89PT1hLmxhc3Q/MDp1JiZkP2EubGltaXQtKGEuaXRlbVcrYS52YXJzLml0ZW1NYXJnaW4pKmEubW92ZSphLmFuaW1hdGluZ1RvOnUmJmEuY3VycmVudFNsaWRlPT09YS5sYXN0P2EubGltaXQ6dT8oYS5pdGVtVythLnZhcnMuaXRlbU1hcmdpbikqYS5tb3ZlKmEuY3VycmVudFNsaWRlOmQ/KGEubGFzdC1hLmN1cnJlbnRTbGlkZSthLmNsb25lT2Zmc2V0KSpwOihhLmN1cnJlbnRTbGlkZSthLmNsb25lT2Zmc2V0KSpwKX1mdW5jdGlvbiBuKHQpe3Quc3RvcFByb3BhZ2F0aW9uKCk7dmFyIGE9dC50YXJnZXQuX3NsaWRlcjtpZihhKXt2YXIgbj0tdC50cmFuc2xhdGlvblgsaT0tdC50cmFuc2xhdGlvblk7cmV0dXJuIHcrPWM/aTpuLG09dyx5PWM/TWF0aC5hYnModyk8TWF0aC5hYnMoLW4pOk1hdGguYWJzKHcpPE1hdGguYWJzKC1pKSx0LmRldGFpbD09PXQuTVNHRVNUVVJFX0ZMQUdfSU5FUlRJQT92b2lkIHNldEltbWVkaWF0ZShmdW5jdGlvbigpe2UuX2dlc3R1cmUuc3RvcCgpfSk6dm9pZCgoIXl8fE51bWJlcihuZXcgRGF0ZSktZj41MDApJiYodC5wcmV2ZW50RGVmYXVsdCgpLCF2JiZhLnRyYW5zaXRpb25zJiYoYS52YXJzLmFuaW1hdGlvbkxvb3B8fChtPXcvKDA9PT1hLmN1cnJlbnRTbGlkZSYmMD53fHxhLmN1cnJlbnRTbGlkZT09PWEubGFzdCYmdz4wP01hdGguYWJzKHcpL3ArMjoxKSksYS5zZXRQcm9wcyhsK20sXCJzZXRUb3VjaFwiKSkpKX19ZnVuY3Rpb24gcyhlKXtlLnN0b3BQcm9wYWdhdGlvbigpO3ZhciB0PWUudGFyZ2V0Ll9zbGlkZXI7aWYodCl7aWYodC5hbmltYXRpbmdUbz09PXQuY3VycmVudFNsaWRlJiYheSYmbnVsbCE9PW0pe3ZhciBhPWQ/LW06bSxuPXQuZ2V0VGFyZ2V0KGE+MD9cIm5leHRcIjpcInByZXZcIik7dC5jYW5BZHZhbmNlKG4pJiYoTnVtYmVyKG5ldyBEYXRlKS1mPDU1MCYmTWF0aC5hYnMoYSk+NTB8fE1hdGguYWJzKGEpPnAvMik/dC5mbGV4QW5pbWF0ZShuLHQudmFycy5wYXVzZU9uQWN0aW9uKTp2fHx0LmZsZXhBbmltYXRlKHQuY3VycmVudFNsaWRlLHQudmFycy5wYXVzZU9uQWN0aW9uLCEwKX1yPW51bGwsbz1udWxsLG09bnVsbCxsPW51bGwsdz0wfX12YXIgcixvLGwscCxtLGYsZyxoLFMseT0hMSx4PTAsYj0wLHc9MDtpPyhlLnN0eWxlLm1zVG91Y2hBY3Rpb249XCJub25lXCIsZS5fZ2VzdHVyZT1uZXcgTVNHZXN0dXJlLGUuX2dlc3R1cmUudGFyZ2V0PWUsZS5hZGRFdmVudExpc3RlbmVyKFwiTVNQb2ludGVyRG93blwiLHQsITEpLGUuX3NsaWRlcj1hLGUuYWRkRXZlbnRMaXN0ZW5lcihcIk1TR2VzdHVyZUNoYW5nZVwiLG4sITEpLGUuYWRkRXZlbnRMaXN0ZW5lcihcIk1TR2VzdHVyZUVuZFwiLHMsITEpKTooZz1mdW5jdGlvbih0KXthLmFuaW1hdGluZz90LnByZXZlbnREZWZhdWx0KCk6KHdpbmRvdy5uYXZpZ2F0b3IubXNQb2ludGVyRW5hYmxlZHx8MT09PXQudG91Y2hlcy5sZW5ndGgpJiYoYS5wYXVzZSgpLHA9Yz9hLmg6YS53LGY9TnVtYmVyKG5ldyBEYXRlKSx4PXQudG91Y2hlc1swXS5wYWdlWCxiPXQudG91Y2hlc1swXS5wYWdlWSxsPXUmJmQmJmEuYW5pbWF0aW5nVG89PT1hLmxhc3Q/MDp1JiZkP2EubGltaXQtKGEuaXRlbVcrYS52YXJzLml0ZW1NYXJnaW4pKmEubW92ZSphLmFuaW1hdGluZ1RvOnUmJmEuY3VycmVudFNsaWRlPT09YS5sYXN0P2EubGltaXQ6dT8oYS5pdGVtVythLnZhcnMuaXRlbU1hcmdpbikqYS5tb3ZlKmEuY3VycmVudFNsaWRlOmQ/KGEubGFzdC1hLmN1cnJlbnRTbGlkZSthLmNsb25lT2Zmc2V0KSpwOihhLmN1cnJlbnRTbGlkZSthLmNsb25lT2Zmc2V0KSpwLHI9Yz9iOngsbz1jP3g6YixlLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIixoLCExKSxlLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLFMsITEpKX0saD1mdW5jdGlvbihlKXt4PWUudG91Y2hlc1swXS5wYWdlWCxiPWUudG91Y2hlc1swXS5wYWdlWSxtPWM/ci1iOnIteCx5PWM/TWF0aC5hYnMobSk8TWF0aC5hYnMoeC1vKTpNYXRoLmFicyhtKTxNYXRoLmFicyhiLW8pO3ZhciB0PTUwMDsoIXl8fE51bWJlcihuZXcgRGF0ZSktZj50KSYmKGUucHJldmVudERlZmF1bHQoKSwhdiYmYS50cmFuc2l0aW9ucyYmKGEudmFycy5hbmltYXRpb25Mb29wfHwobS89MD09PWEuY3VycmVudFNsaWRlJiYwPm18fGEuY3VycmVudFNsaWRlPT09YS5sYXN0JiZtPjA/TWF0aC5hYnMobSkvcCsyOjEpLGEuc2V0UHJvcHMobCttLFwic2V0VG91Y2hcIikpKX0sUz1mdW5jdGlvbih0KXtpZihlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIixoLCExKSxhLmFuaW1hdGluZ1RvPT09YS5jdXJyZW50U2xpZGUmJiF5JiZudWxsIT09bSl7dmFyIG49ZD8tbTptLGk9YS5nZXRUYXJnZXQobj4wP1wibmV4dFwiOlwicHJldlwiKTthLmNhbkFkdmFuY2UoaSkmJihOdW1iZXIobmV3IERhdGUpLWY8NTUwJiZNYXRoLmFicyhuKT41MHx8TWF0aC5hYnMobik+cC8yKT9hLmZsZXhBbmltYXRlKGksYS52YXJzLnBhdXNlT25BY3Rpb24pOnZ8fGEuZmxleEFuaW1hdGUoYS5jdXJyZW50U2xpZGUsYS52YXJzLnBhdXNlT25BY3Rpb24sITApfWUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRvdWNoZW5kXCIsUywhMSkscj1udWxsLG89bnVsbCxtPW51bGwsbD1udWxsfSxlLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsZywhMSkpfSxyZXNpemU6ZnVuY3Rpb24oKXshYS5hbmltYXRpbmcmJmEuaXMoXCI6dmlzaWJsZVwiKSYmKHV8fGEuZG9NYXRoKCksdj9tLnNtb290aEhlaWdodCgpOnU/KGEuc2xpZGVzLndpZHRoKGEuY29tcHV0ZWRXKSxhLnVwZGF0ZShhLnBhZ2luZ0NvdW50KSxhLnNldFByb3BzKCkpOmM/KGEudmlld3BvcnQuaGVpZ2h0KGEuaCksYS5zZXRQcm9wcyhhLmgsXCJzZXRUb3RhbFwiKSk6KGEudmFycy5zbW9vdGhIZWlnaHQmJm0uc21vb3RoSGVpZ2h0KCksYS5uZXdTbGlkZXMud2lkdGgoYS5jb21wdXRlZFcpLGEuc2V0UHJvcHMoYS5jb21wdXRlZFcsXCJzZXRUb3RhbFwiKSkpfSxzbW9vdGhIZWlnaHQ6ZnVuY3Rpb24oZSl7aWYoIWN8fHYpe3ZhciB0PXY/YTphLnZpZXdwb3J0O2U/dC5hbmltYXRlKHtoZWlnaHQ6YS5zbGlkZXMuZXEoYS5hbmltYXRpbmdUbykuaGVpZ2h0KCl9LGUpOnQuaGVpZ2h0KGEuc2xpZGVzLmVxKGEuYW5pbWF0aW5nVG8pLmhlaWdodCgpKX19LHN5bmM6ZnVuY3Rpb24oZSl7dmFyIHQ9JChhLnZhcnMuc3luYykuZGF0YShcImZsZXhzbGlkZXJcIiksbj1hLmFuaW1hdGluZ1RvO3N3aXRjaChlKXtjYXNlXCJhbmltYXRlXCI6dC5mbGV4QW5pbWF0ZShuLGEudmFycy5wYXVzZU9uQWN0aW9uLCExLCEwKTticmVhaztjYXNlXCJwbGF5XCI6dC5wbGF5aW5nfHx0LmFzTmF2fHx0LnBsYXkoKTticmVhaztjYXNlXCJwYXVzZVwiOnQucGF1c2UoKX19LHVuaXF1ZUlEOmZ1bmN0aW9uKGUpe3JldHVybiBlLmZpbHRlcihcIltpZF1cIikuYWRkKGUuZmluZChcIltpZF1cIikpLmVhY2goZnVuY3Rpb24oKXt2YXIgZT0kKHRoaXMpO2UuYXR0cihcImlkXCIsZS5hdHRyKFwiaWRcIikrXCJfY2xvbmVcIil9KSxlfSxwYXVzZUludmlzaWJsZTp7dmlzUHJvcDpudWxsLGluaXQ6ZnVuY3Rpb24oKXt2YXIgZT1tLnBhdXNlSW52aXNpYmxlLmdldEhpZGRlblByb3AoKTtpZihlKXt2YXIgdD1lLnJlcGxhY2UoL1tIfGhdaWRkZW4vLFwiXCIpK1widmlzaWJpbGl0eWNoYW5nZVwiO2RvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIodCxmdW5jdGlvbigpe20ucGF1c2VJbnZpc2libGUuaXNIaWRkZW4oKT9hLnN0YXJ0VGltZW91dD9jbGVhclRpbWVvdXQoYS5zdGFydFRpbWVvdXQpOmEucGF1c2UoKTphLnN0YXJ0ZWQ/YS5wbGF5KCk6YS52YXJzLmluaXREZWxheT4wP3NldFRpbWVvdXQoYS5wbGF5LGEudmFycy5pbml0RGVsYXkpOmEucGxheSgpfSl9fSxpc0hpZGRlbjpmdW5jdGlvbigpe3ZhciBlPW0ucGF1c2VJbnZpc2libGUuZ2V0SGlkZGVuUHJvcCgpO3JldHVybiBlP2RvY3VtZW50W2VdOiExfSxnZXRIaWRkZW5Qcm9wOmZ1bmN0aW9uKCl7dmFyIGU9W1wid2Via2l0XCIsXCJtb3pcIixcIm1zXCIsXCJvXCJdO2lmKFwiaGlkZGVuXCJpbiBkb2N1bWVudClyZXR1cm5cImhpZGRlblwiO2Zvcih2YXIgdD0wO3Q8ZS5sZW5ndGg7dCsrKWlmKGVbdF0rXCJIaWRkZW5cImluIGRvY3VtZW50KXJldHVybiBlW3RdK1wiSGlkZGVuXCI7cmV0dXJuIG51bGx9fSxzZXRUb0NsZWFyV2F0Y2hlZEV2ZW50OmZ1bmN0aW9uKCl7Y2xlYXJUaW1lb3V0KGwpLGw9c2V0VGltZW91dChmdW5jdGlvbigpe289XCJcIn0sM2UzKX19LGEuZmxleEFuaW1hdGU9ZnVuY3Rpb24oZSx0LGkscixvKXtpZihhLnZhcnMuYW5pbWF0aW9uTG9vcHx8ZT09PWEuY3VycmVudFNsaWRlfHwoYS5kaXJlY3Rpb249ZT5hLmN1cnJlbnRTbGlkZT9cIm5leHRcIjpcInByZXZcIikscCYmMT09PWEucGFnaW5nQ291bnQmJihhLmRpcmVjdGlvbj1hLmN1cnJlbnRJdGVtPGU/XCJuZXh0XCI6XCJwcmV2XCIpLCFhLmFuaW1hdGluZyYmKGEuY2FuQWR2YW5jZShlLG8pfHxpKSYmYS5pcyhcIjp2aXNpYmxlXCIpKXtpZihwJiZyKXt2YXIgbD0kKGEudmFycy5hc05hdkZvcikuZGF0YShcImZsZXhzbGlkZXJcIik7aWYoYS5hdEVuZD0wPT09ZXx8ZT09PWEuY291bnQtMSxsLmZsZXhBbmltYXRlKGUsITAsITEsITAsbyksYS5kaXJlY3Rpb249YS5jdXJyZW50SXRlbTxlP1wibmV4dFwiOlwicHJldlwiLGwuZGlyZWN0aW9uPWEuZGlyZWN0aW9uLE1hdGguY2VpbCgoZSsxKS9hLnZpc2libGUpLTE9PT1hLmN1cnJlbnRTbGlkZXx8MD09PWUpcmV0dXJuIGEuY3VycmVudEl0ZW09ZSxhLnNsaWRlcy5yZW1vdmVDbGFzcyhuK1wiYWN0aXZlLXNsaWRlXCIpLmVxKGUpLmFkZENsYXNzKG4rXCJhY3RpdmUtc2xpZGVcIiksITE7YS5jdXJyZW50SXRlbT1lLGEuc2xpZGVzLnJlbW92ZUNsYXNzKG4rXCJhY3RpdmUtc2xpZGVcIikuZXEoZSkuYWRkQ2xhc3MobitcImFjdGl2ZS1zbGlkZVwiKSxlPU1hdGguZmxvb3IoZS9hLnZpc2libGUpfWlmKGEuYW5pbWF0aW5nPSEwLGEuYW5pbWF0aW5nVG89ZSx0JiZhLnBhdXNlKCksYS52YXJzLmJlZm9yZShhKSxhLnN5bmNFeGlzdHMmJiFvJiZtLnN5bmMoXCJhbmltYXRlXCIpLGEudmFycy5jb250cm9sTmF2JiZtLmNvbnRyb2xOYXYuYWN0aXZlKCksdXx8YS5zbGlkZXMucmVtb3ZlQ2xhc3MobitcImFjdGl2ZS1zbGlkZVwiKS5lcShlKS5hZGRDbGFzcyhuK1wiYWN0aXZlLXNsaWRlXCIpLGEuYXRFbmQ9MD09PWV8fGU9PT1hLmxhc3QsYS52YXJzLmRpcmVjdGlvbk5hdiYmbS5kaXJlY3Rpb25OYXYudXBkYXRlKCksZT09PWEubGFzdCYmKGEudmFycy5lbmQoYSksYS52YXJzLmFuaW1hdGlvbkxvb3B8fGEucGF1c2UoKSksdilzPyhhLnNsaWRlcy5lcShhLmN1cnJlbnRTbGlkZSkuY3NzKHtvcGFjaXR5OjAsekluZGV4OjF9KSxhLnNsaWRlcy5lcShlKS5jc3Moe29wYWNpdHk6MSx6SW5kZXg6Mn0pLGEud3JhcHVwKGYpKTooYS5zbGlkZXMuZXEoYS5jdXJyZW50U2xpZGUpLmNzcyh7ekluZGV4OjF9KS5hbmltYXRlKHtvcGFjaXR5OjB9LGEudmFycy5hbmltYXRpb25TcGVlZCxhLnZhcnMuZWFzaW5nKSxhLnNsaWRlcy5lcShlKS5jc3Moe3pJbmRleDoyfSkuYW5pbWF0ZSh7b3BhY2l0eToxfSxhLnZhcnMuYW5pbWF0aW9uU3BlZWQsYS52YXJzLmVhc2luZyxhLndyYXB1cCkpO2Vsc2V7dmFyIGY9Yz9hLnNsaWRlcy5maWx0ZXIoXCI6Zmlyc3RcIikuaGVpZ2h0KCk6YS5jb21wdXRlZFcsZyxoLFM7dT8oZz1hLnZhcnMuaXRlbU1hcmdpbixTPShhLml0ZW1XK2cpKmEubW92ZSphLmFuaW1hdGluZ1RvLGg9Uz5hLmxpbWl0JiYxIT09YS52aXNpYmxlP2EubGltaXQ6Uyk6aD0wPT09YS5jdXJyZW50U2xpZGUmJmU9PT1hLmNvdW50LTEmJmEudmFycy5hbmltYXRpb25Mb29wJiZcIm5leHRcIiE9PWEuZGlyZWN0aW9uP2Q/KGEuY291bnQrYS5jbG9uZU9mZnNldCkqZjowOmEuY3VycmVudFNsaWRlPT09YS5sYXN0JiYwPT09ZSYmYS52YXJzLmFuaW1hdGlvbkxvb3AmJlwicHJldlwiIT09YS5kaXJlY3Rpb24/ZD8wOihhLmNvdW50KzEpKmY6ZD8oYS5jb3VudC0xLWUrYS5jbG9uZU9mZnNldCkqZjooZSthLmNsb25lT2Zmc2V0KSpmLGEuc2V0UHJvcHMoaCxcIlwiLGEudmFycy5hbmltYXRpb25TcGVlZCksYS50cmFuc2l0aW9ucz8oYS52YXJzLmFuaW1hdGlvbkxvb3AmJmEuYXRFbmR8fChhLmFuaW1hdGluZz0hMSxhLmN1cnJlbnRTbGlkZT1hLmFuaW1hdGluZ1RvKSxhLmNvbnRhaW5lci51bmJpbmQoXCJ3ZWJraXRUcmFuc2l0aW9uRW5kIHRyYW5zaXRpb25lbmRcIiksYS5jb250YWluZXIuYmluZChcIndlYmtpdFRyYW5zaXRpb25FbmQgdHJhbnNpdGlvbmVuZFwiLGZ1bmN0aW9uKCl7Y2xlYXJUaW1lb3V0KGEuZW5zdXJlQW5pbWF0aW9uRW5kKSxhLndyYXB1cChmKX0pLGNsZWFyVGltZW91dChhLmVuc3VyZUFuaW1hdGlvbkVuZCksYS5lbnN1cmVBbmltYXRpb25FbmQ9c2V0VGltZW91dChmdW5jdGlvbigpe2Eud3JhcHVwKGYpfSxhLnZhcnMuYW5pbWF0aW9uU3BlZWQrMTAwKSk6YS5jb250YWluZXIuYW5pbWF0ZShhLmFyZ3MsYS52YXJzLmFuaW1hdGlvblNwZWVkLGEudmFycy5lYXNpbmcsZnVuY3Rpb24oKXthLndyYXB1cChmKX0pfWEudmFycy5zbW9vdGhIZWlnaHQmJm0uc21vb3RoSGVpZ2h0KGEudmFycy5hbmltYXRpb25TcGVlZCl9fSxhLndyYXB1cD1mdW5jdGlvbihlKXt2fHx1fHwoMD09PWEuY3VycmVudFNsaWRlJiZhLmFuaW1hdGluZ1RvPT09YS5sYXN0JiZhLnZhcnMuYW5pbWF0aW9uTG9vcD9hLnNldFByb3BzKGUsXCJqdW1wRW5kXCIpOmEuY3VycmVudFNsaWRlPT09YS5sYXN0JiYwPT09YS5hbmltYXRpbmdUbyYmYS52YXJzLmFuaW1hdGlvbkxvb3AmJmEuc2V0UHJvcHMoZSxcImp1bXBTdGFydFwiKSksYS5hbmltYXRpbmc9ITEsYS5jdXJyZW50U2xpZGU9YS5hbmltYXRpbmdUbyxhLnZhcnMuYWZ0ZXIoYSl9LGEuYW5pbWF0ZVNsaWRlcz1mdW5jdGlvbigpeyFhLmFuaW1hdGluZyYmZiYmYS5mbGV4QW5pbWF0ZShhLmdldFRhcmdldChcIm5leHRcIikpfSxhLnBhdXNlPWZ1bmN0aW9uKCl7Y2xlYXJJbnRlcnZhbChhLmFuaW1hdGVkU2xpZGVzKSxhLmFuaW1hdGVkU2xpZGVzPW51bGwsYS5wbGF5aW5nPSExLGEudmFycy5wYXVzZVBsYXkmJm0ucGF1c2VQbGF5LnVwZGF0ZShcInBsYXlcIiksYS5zeW5jRXhpc3RzJiZtLnN5bmMoXCJwYXVzZVwiKX0sYS5wbGF5PWZ1bmN0aW9uKCl7YS5wbGF5aW5nJiZjbGVhckludGVydmFsKGEuYW5pbWF0ZWRTbGlkZXMpLGEuYW5pbWF0ZWRTbGlkZXM9YS5hbmltYXRlZFNsaWRlc3x8c2V0SW50ZXJ2YWwoYS5hbmltYXRlU2xpZGVzLGEudmFycy5zbGlkZXNob3dTcGVlZCksYS5zdGFydGVkPWEucGxheWluZz0hMCxhLnZhcnMucGF1c2VQbGF5JiZtLnBhdXNlUGxheS51cGRhdGUoXCJwYXVzZVwiKSxhLnN5bmNFeGlzdHMmJm0uc3luYyhcInBsYXlcIil9LGEuc3RvcD1mdW5jdGlvbigpe2EucGF1c2UoKSxhLnN0b3BwZWQ9ITB9LGEuY2FuQWR2YW5jZT1mdW5jdGlvbihlLHQpe3ZhciBuPXA/YS5wYWdpbmdDb3VudC0xOmEubGFzdDtyZXR1cm4gdD8hMDpwJiZhLmN1cnJlbnRJdGVtPT09YS5jb3VudC0xJiYwPT09ZSYmXCJwcmV2XCI9PT1hLmRpcmVjdGlvbj8hMDpwJiYwPT09YS5jdXJyZW50SXRlbSYmZT09PWEucGFnaW5nQ291bnQtMSYmXCJuZXh0XCIhPT1hLmRpcmVjdGlvbj8hMTplIT09YS5jdXJyZW50U2xpZGV8fHA/YS52YXJzLmFuaW1hdGlvbkxvb3A/ITA6YS5hdEVuZCYmMD09PWEuY3VycmVudFNsaWRlJiZlPT09biYmXCJuZXh0XCIhPT1hLmRpcmVjdGlvbj8hMTphLmF0RW5kJiZhLmN1cnJlbnRTbGlkZT09PW4mJjA9PT1lJiZcIm5leHRcIj09PWEuZGlyZWN0aW9uPyExOiEwOiExfSxhLmdldFRhcmdldD1mdW5jdGlvbihlKXtyZXR1cm4gYS5kaXJlY3Rpb249ZSxcIm5leHRcIj09PWU/YS5jdXJyZW50U2xpZGU9PT1hLmxhc3Q/MDphLmN1cnJlbnRTbGlkZSsxOjA9PT1hLmN1cnJlbnRTbGlkZT9hLmxhc3Q6YS5jdXJyZW50U2xpZGUtMX0sYS5zZXRQcm9wcz1mdW5jdGlvbihlLHQsbil7dmFyIGk9ZnVuY3Rpb24oKXt2YXIgbj1lP2U6KGEuaXRlbVcrYS52YXJzLml0ZW1NYXJnaW4pKmEubW92ZSphLmFuaW1hdGluZ1RvLGk9ZnVuY3Rpb24oKXtpZih1KXJldHVyblwic2V0VG91Y2hcIj09PXQ/ZTpkJiZhLmFuaW1hdGluZ1RvPT09YS5sYXN0PzA6ZD9hLmxpbWl0LShhLml0ZW1XK2EudmFycy5pdGVtTWFyZ2luKSphLm1vdmUqYS5hbmltYXRpbmdUbzphLmFuaW1hdGluZ1RvPT09YS5sYXN0P2EubGltaXQ6bjtzd2l0Y2godCl7Y2FzZVwic2V0VG90YWxcIjpyZXR1cm4gZD8oYS5jb3VudC0xLWEuY3VycmVudFNsaWRlK2EuY2xvbmVPZmZzZXQpKmU6KGEuY3VycmVudFNsaWRlK2EuY2xvbmVPZmZzZXQpKmU7Y2FzZVwic2V0VG91Y2hcIjpyZXR1cm4gZD9lOmU7Y2FzZVwianVtcEVuZFwiOnJldHVybiBkP2U6YS5jb3VudCplO2Nhc2VcImp1bXBTdGFydFwiOnJldHVybiBkP2EuY291bnQqZTplO2RlZmF1bHQ6cmV0dXJuIGV9fSgpO3JldHVybi0xKmkrXCJweFwifSgpO2EudHJhbnNpdGlvbnMmJihpPWM/XCJ0cmFuc2xhdGUzZCgwLFwiK2krXCIsMClcIjpcInRyYW5zbGF0ZTNkKFwiK2krXCIsMCwwKVwiLG49dm9pZCAwIT09bj9uLzFlMytcInNcIjpcIjBzXCIsYS5jb250YWluZXIuY3NzKFwiLVwiK2EucGZ4K1wiLXRyYW5zaXRpb24tZHVyYXRpb25cIixuKSxhLmNvbnRhaW5lci5jc3MoXCJ0cmFuc2l0aW9uLWR1cmF0aW9uXCIsbikpLGEuYXJnc1thLnByb3BdPWksKGEudHJhbnNpdGlvbnN8fHZvaWQgMD09PW4pJiZhLmNvbnRhaW5lci5jc3MoYS5hcmdzKSxhLmNvbnRhaW5lci5jc3MoXCJ0cmFuc2Zvcm1cIixpKX0sYS5zZXR1cD1mdW5jdGlvbihlKXtpZih2KWEuc2xpZGVzLmNzcyh7d2lkdGg6XCIxMDAlXCIsXCJmbG9hdFwiOlwibGVmdFwiLG1hcmdpblJpZ2h0OlwiLTEwMCVcIixwb3NpdGlvbjpcInJlbGF0aXZlXCJ9KSxcImluaXRcIj09PWUmJihzP2Euc2xpZGVzLmNzcyh7b3BhY2l0eTowLGRpc3BsYXk6XCJibG9ja1wiLHdlYmtpdFRyYW5zaXRpb246XCJvcGFjaXR5IFwiK2EudmFycy5hbmltYXRpb25TcGVlZC8xZTMrXCJzIGVhc2VcIix6SW5kZXg6MX0pLmVxKGEuY3VycmVudFNsaWRlKS5jc3Moe29wYWNpdHk6MSx6SW5kZXg6Mn0pOjA9PWEudmFycy5mYWRlRmlyc3RTbGlkZT9hLnNsaWRlcy5jc3Moe29wYWNpdHk6MCxkaXNwbGF5OlwiYmxvY2tcIix6SW5kZXg6MX0pLmVxKGEuY3VycmVudFNsaWRlKS5jc3Moe3pJbmRleDoyfSkuY3NzKHtvcGFjaXR5OjF9KTphLnNsaWRlcy5jc3Moe29wYWNpdHk6MCxkaXNwbGF5OlwiYmxvY2tcIix6SW5kZXg6MX0pLmVxKGEuY3VycmVudFNsaWRlKS5jc3Moe3pJbmRleDoyfSkuYW5pbWF0ZSh7b3BhY2l0eToxfSxhLnZhcnMuYW5pbWF0aW9uU3BlZWQsYS52YXJzLmVhc2luZykpLGEudmFycy5zbW9vdGhIZWlnaHQmJm0uc21vb3RoSGVpZ2h0KCk7ZWxzZXt2YXIgdCxpO1wiaW5pdFwiPT09ZSYmKGEudmlld3BvcnQ9JCgnPGRpdiBjbGFzcz1cIicrbisndmlld3BvcnRcIj48L2Rpdj4nKS5jc3Moe292ZXJmbG93OlwiaGlkZGVuXCIscG9zaXRpb246XCJyZWxhdGl2ZVwifSkuYXBwZW5kVG8oYSkuYXBwZW5kKGEuY29udGFpbmVyKSxhLmNsb25lQ291bnQ9MCxhLmNsb25lT2Zmc2V0PTAsZCYmKGk9JC5tYWtlQXJyYXkoYS5zbGlkZXMpLnJldmVyc2UoKSxhLnNsaWRlcz0kKGkpLGEuY29udGFpbmVyLmVtcHR5KCkuYXBwZW5kKGEuc2xpZGVzKSkpLGEudmFycy5hbmltYXRpb25Mb29wJiYhdSYmKGEuY2xvbmVDb3VudD0yLGEuY2xvbmVPZmZzZXQ9MSxcImluaXRcIiE9PWUmJmEuY29udGFpbmVyLmZpbmQoXCIuY2xvbmVcIikucmVtb3ZlKCksYS5jb250YWluZXIuYXBwZW5kKG0udW5pcXVlSUQoYS5zbGlkZXMuZmlyc3QoKS5jbG9uZSgpLmFkZENsYXNzKFwiY2xvbmVcIikpLmF0dHIoXCJhcmlhLWhpZGRlblwiLFwidHJ1ZVwiKSkucHJlcGVuZChtLnVuaXF1ZUlEKGEuc2xpZGVzLmxhc3QoKS5jbG9uZSgpLmFkZENsYXNzKFwiY2xvbmVcIikpLmF0dHIoXCJhcmlhLWhpZGRlblwiLFwidHJ1ZVwiKSkpLGEubmV3U2xpZGVzPSQoYS52YXJzLnNlbGVjdG9yLGEpLHQ9ZD9hLmNvdW50LTEtYS5jdXJyZW50U2xpZGUrYS5jbG9uZU9mZnNldDphLmN1cnJlbnRTbGlkZSthLmNsb25lT2Zmc2V0LGMmJiF1PyhhLmNvbnRhaW5lci5oZWlnaHQoMjAwKihhLmNvdW50K2EuY2xvbmVDb3VudCkrXCIlXCIpLmNzcyhcInBvc2l0aW9uXCIsXCJhYnNvbHV0ZVwiKS53aWR0aChcIjEwMCVcIiksc2V0VGltZW91dChmdW5jdGlvbigpe2EubmV3U2xpZGVzLmNzcyh7ZGlzcGxheTpcImJsb2NrXCJ9KSxhLmRvTWF0aCgpLGEudmlld3BvcnQuaGVpZ2h0KGEuaCksYS5zZXRQcm9wcyh0KmEuaCxcImluaXRcIil9LFwiaW5pdFwiPT09ZT8xMDA6MCkpOihhLmNvbnRhaW5lci53aWR0aCgyMDAqKGEuY291bnQrYS5jbG9uZUNvdW50KStcIiVcIiksYS5zZXRQcm9wcyh0KmEuY29tcHV0ZWRXLFwiaW5pdFwiKSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7YS5kb01hdGgoKSxhLm5ld1NsaWRlcy5jc3Moe3dpZHRoOmEuY29tcHV0ZWRXLFwiZmxvYXRcIjpcImxlZnRcIixkaXNwbGF5OlwiYmxvY2tcIn0pLGEudmFycy5zbW9vdGhIZWlnaHQmJm0uc21vb3RoSGVpZ2h0KCl9LFwiaW5pdFwiPT09ZT8xMDA6MCkpfXV8fGEuc2xpZGVzLnJlbW92ZUNsYXNzKG4rXCJhY3RpdmUtc2xpZGVcIikuZXEoYS5jdXJyZW50U2xpZGUpLmFkZENsYXNzKG4rXCJhY3RpdmUtc2xpZGVcIiksYS52YXJzLmluaXQoYSl9LGEuZG9NYXRoPWZ1bmN0aW9uKCl7dmFyIGU9YS5zbGlkZXMuZmlyc3QoKSx0PWEudmFycy5pdGVtTWFyZ2luLG49YS52YXJzLm1pbkl0ZW1zLGk9YS52YXJzLm1heEl0ZW1zO2Eudz12b2lkIDA9PT1hLnZpZXdwb3J0P2Eud2lkdGgoKTphLnZpZXdwb3J0LndpZHRoKCksYS5oPWUuaGVpZ2h0KCksYS5ib3hQYWRkaW5nPWUub3V0ZXJXaWR0aCgpLWUud2lkdGgoKSx1PyhhLml0ZW1UPWEudmFycy5pdGVtV2lkdGgrdCxhLm1pblc9bj9uKmEuaXRlbVQ6YS53LGEubWF4Vz1pP2kqYS5pdGVtVC10OmEudyxhLml0ZW1XPWEubWluVz5hLnc/KGEudy10KihuLTEpKS9uOmEubWF4VzxhLnc/KGEudy10KihpLTEpKS9pOmEudmFycy5pdGVtV2lkdGg+YS53P2EudzphLnZhcnMuaXRlbVdpZHRoLGEudmlzaWJsZT1NYXRoLmZsb29yKGEudy9hLml0ZW1XKSxhLm1vdmU9YS52YXJzLm1vdmU+MCYmYS52YXJzLm1vdmU8YS52aXNpYmxlP2EudmFycy5tb3ZlOmEudmlzaWJsZSxhLnBhZ2luZ0NvdW50PU1hdGguY2VpbCgoYS5jb3VudC1hLnZpc2libGUpL2EubW92ZSsxKSxhLmxhc3Q9YS5wYWdpbmdDb3VudC0xLGEubGltaXQ9MT09PWEucGFnaW5nQ291bnQ/MDphLnZhcnMuaXRlbVdpZHRoPmEudz9hLml0ZW1XKihhLmNvdW50LTEpK3QqKGEuY291bnQtMSk6KGEuaXRlbVcrdCkqYS5jb3VudC1hLnctdCk6KGEuaXRlbVc9YS53LGEucGFnaW5nQ291bnQ9YS5jb3VudCxhLmxhc3Q9YS5jb3VudC0xKSxhLmNvbXB1dGVkVz1hLml0ZW1XLWEuYm94UGFkZGluZ30sYS51cGRhdGU9ZnVuY3Rpb24oZSx0KXthLmRvTWF0aCgpLHV8fChlPGEuY3VycmVudFNsaWRlP2EuY3VycmVudFNsaWRlKz0xOmU8PWEuY3VycmVudFNsaWRlJiYwIT09ZSYmKGEuY3VycmVudFNsaWRlLT0xKSxhLmFuaW1hdGluZ1RvPWEuY3VycmVudFNsaWRlKSxhLnZhcnMuY29udHJvbE5hdiYmIWEubWFudWFsQ29udHJvbHMmJihcImFkZFwiPT09dCYmIXV8fGEucGFnaW5nQ291bnQ+YS5jb250cm9sTmF2Lmxlbmd0aD9tLmNvbnRyb2xOYXYudXBkYXRlKFwiYWRkXCIpOihcInJlbW92ZVwiPT09dCYmIXV8fGEucGFnaW5nQ291bnQ8YS5jb250cm9sTmF2Lmxlbmd0aCkmJih1JiZhLmN1cnJlbnRTbGlkZT5hLmxhc3QmJihhLmN1cnJlbnRTbGlkZS09MSxhLmFuaW1hdGluZ1RvLT0xKSxtLmNvbnRyb2xOYXYudXBkYXRlKFwicmVtb3ZlXCIsYS5sYXN0KSkpLGEudmFycy5kaXJlY3Rpb25OYXYmJm0uZGlyZWN0aW9uTmF2LnVwZGF0ZSgpfSxhLmFkZFNsaWRlPWZ1bmN0aW9uKGUsdCl7dmFyIG49JChlKTthLmNvdW50Kz0xLGEubGFzdD1hLmNvdW50LTEsYyYmZD92b2lkIDAhPT10P2Euc2xpZGVzLmVxKGEuY291bnQtdCkuYWZ0ZXIobik6YS5jb250YWluZXIucHJlcGVuZChuKTp2b2lkIDAhPT10P2Euc2xpZGVzLmVxKHQpLmJlZm9yZShuKTphLmNvbnRhaW5lci5hcHBlbmQobiksYS51cGRhdGUodCxcImFkZFwiKSxhLnNsaWRlcz0kKGEudmFycy5zZWxlY3RvcitcIjpub3QoLmNsb25lKVwiLGEpLGEuc2V0dXAoKSxhLnZhcnMuYWRkZWQoYSl9LGEucmVtb3ZlU2xpZGU9ZnVuY3Rpb24oZSl7dmFyIHQ9aXNOYU4oZSk/YS5zbGlkZXMuaW5kZXgoJChlKSk6ZTthLmNvdW50LT0xLGEubGFzdD1hLmNvdW50LTEsaXNOYU4oZSk/JChlLGEuc2xpZGVzKS5yZW1vdmUoKTpjJiZkP2Euc2xpZGVzLmVxKGEubGFzdCkucmVtb3ZlKCk6YS5zbGlkZXMuZXEoZSkucmVtb3ZlKCksYS5kb01hdGgoKSxhLnVwZGF0ZSh0LFwicmVtb3ZlXCIpLGEuc2xpZGVzPSQoYS52YXJzLnNlbGVjdG9yK1wiOm5vdCguY2xvbmUpXCIsYSksYS5zZXR1cCgpLGEudmFycy5yZW1vdmVkKGEpfSxtLmluaXQoKX0sJCh3aW5kb3cpLmJsdXIoZnVuY3Rpb24oZSl7Zm9jdXNlZD0hMX0pLmZvY3VzKGZ1bmN0aW9uKGUpe2ZvY3VzZWQ9ITB9KSwkLmZsZXhzbGlkZXIuZGVmYXVsdHM9e25hbWVzcGFjZTpcImZsZXgtXCIsc2VsZWN0b3I6XCIuc2xpZGVzID4gbGlcIixhbmltYXRpb246XCJmYWRlXCIsZWFzaW5nOlwic3dpbmdcIixkaXJlY3Rpb246XCJob3Jpem9udGFsXCIscmV2ZXJzZTohMSxhbmltYXRpb25Mb29wOiEwLHNtb290aEhlaWdodDohMSxzdGFydEF0OjAsc2xpZGVzaG93OiEwLHNsaWRlc2hvd1NwZWVkOjdlMyxhbmltYXRpb25TcGVlZDo2MDAsaW5pdERlbGF5OjAscmFuZG9taXplOiExLGZhZGVGaXJzdFNsaWRlOiEwLHRodW1iQ2FwdGlvbnM6ITEscGF1c2VPbkFjdGlvbjohMCxwYXVzZU9uSG92ZXI6ITEscGF1c2VJbnZpc2libGU6ITAsdXNlQ1NTOiEwLHRvdWNoOiEwLHZpZGVvOiExLGNvbnRyb2xOYXY6ITAsZGlyZWN0aW9uTmF2OiEwLHByZXZUZXh0OlwiUHJldmlvdXNcIixuZXh0VGV4dDpcIk5leHRcIixrZXlib2FyZDohMCxtdWx0aXBsZUtleWJvYXJkOiExLG1vdXNld2hlZWw6ITEscGF1c2VQbGF5OiExLHBhdXNlVGV4dDpcIlBhdXNlXCIscGxheVRleHQ6XCJQbGF5XCIsY29udHJvbHNDb250YWluZXI6XCJcIixtYW51YWxDb250cm9sczpcIlwiLGN1c3RvbURpcmVjdGlvbk5hdjpcIlwiLHN5bmM6XCJcIixhc05hdkZvcjpcIlwiLGl0ZW1XaWR0aDowLGl0ZW1NYXJnaW46MCxtaW5JdGVtczoxLG1heEl0ZW1zOjAsbW92ZTowLGFsbG93T25lU2xpZGU6ITAsc3RhcnQ6ZnVuY3Rpb24oKXt9LGJlZm9yZTpmdW5jdGlvbigpe30sYWZ0ZXI6ZnVuY3Rpb24oKXt9LGVuZDpmdW5jdGlvbigpe30sYWRkZWQ6ZnVuY3Rpb24oKXt9LHJlbW92ZWQ6ZnVuY3Rpb24oKXt9LGluaXQ6ZnVuY3Rpb24oKXt9fSwkLmZuLmZsZXhzbGlkZXI9ZnVuY3Rpb24oZSl7aWYodm9pZCAwPT09ZSYmKGU9e30pLFwib2JqZWN0XCI9PXR5cGVvZiBlKXJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgdD0kKHRoaXMpLGE9ZS5zZWxlY3Rvcj9lLnNlbGVjdG9yOlwiLnNsaWRlcyA+IGxpXCIsbj10LmZpbmQoYSk7MT09PW4ubGVuZ3RoJiZlLmFsbG93T25lU2xpZGU9PT0hMHx8MD09PW4ubGVuZ3RoPyhuLmZhZGVJbig0MDApLGUuc3RhcnQmJmUuc3RhcnQodCkpOnZvaWQgMD09PXQuZGF0YShcImZsZXhzbGlkZXJcIikmJm5ldyAkLmZsZXhzbGlkZXIodGhpcyxlKX0pO3ZhciB0PSQodGhpcykuZGF0YShcImZsZXhzbGlkZXJcIik7c3dpdGNoKGUpe2Nhc2VcInBsYXlcIjp0LnBsYXkoKTticmVhaztjYXNlXCJwYXVzZVwiOnQucGF1c2UoKTticmVhaztjYXNlXCJzdG9wXCI6dC5zdG9wKCk7YnJlYWs7Y2FzZVwibmV4dFwiOnQuZmxleEFuaW1hdGUodC5nZXRUYXJnZXQoXCJuZXh0XCIpLCEwKTticmVhaztjYXNlXCJwcmV2XCI6Y2FzZVwicHJldmlvdXNcIjp0LmZsZXhBbmltYXRlKHQuZ2V0VGFyZ2V0KFwicHJldlwiKSwhMCk7YnJlYWs7ZGVmYXVsdDpcIm51bWJlclwiPT10eXBlb2YgZSYmdC5mbGV4QW5pbWF0ZShlLCEwKX19fShqUXVlcnkpOyIsIi8qIVxuICogY2xhc3NpZSB2MS4wLjFcbiAqIGNsYXNzIGhlbHBlciBmdW5jdGlvbnNcbiAqIGZyb20gYm9uem8gaHR0cHM6Ly9naXRodWIuY29tL2RlZC9ib256b1xuICogTUlUIGxpY2Vuc2VcbiAqIFxuICogY2xhc3NpZS5oYXMoIGVsZW0sICdteS1jbGFzcycgKSAtPiB0cnVlL2ZhbHNlXG4gKiBjbGFzc2llLmFkZCggZWxlbSwgJ215LW5ldy1jbGFzcycgKVxuICogY2xhc3NpZS5yZW1vdmUoIGVsZW0sICdteS11bndhbnRlZC1jbGFzcycgKVxuICogY2xhc3NpZS50b2dnbGUoIGVsZW0sICdteS1jbGFzcycgKVxuICovXG5cbi8qanNoaW50IGJyb3dzZXI6IHRydWUsIHN0cmljdDogdHJ1ZSwgdW5kZWY6IHRydWUsIHVudXNlZDogdHJ1ZSAqL1xuLypnbG9iYWwgZGVmaW5lOiBmYWxzZSwgbW9kdWxlOiBmYWxzZSAqL1xuXG4oIGZ1bmN0aW9uKCB3aW5kb3cgKSB7XG5cbid1c2Ugc3RyaWN0JztcblxuLy8gY2xhc3MgaGVscGVyIGZ1bmN0aW9ucyBmcm9tIGJvbnpvIGh0dHBzOi8vZ2l0aHViLmNvbS9kZWQvYm9uem9cblxuZnVuY3Rpb24gY2xhc3NSZWcoIGNsYXNzTmFtZSApIHtcbiAgcmV0dXJuIG5ldyBSZWdFeHAoXCIoXnxcXFxccyspXCIgKyBjbGFzc05hbWUgKyBcIihcXFxccyt8JClcIik7XG59XG5cbi8vIGNsYXNzTGlzdCBzdXBwb3J0IGZvciBjbGFzcyBtYW5hZ2VtZW50XG4vLyBhbHRobyB0byBiZSBmYWlyLCB0aGUgYXBpIHN1Y2tzIGJlY2F1c2UgaXQgd29uJ3QgYWNjZXB0IG11bHRpcGxlIGNsYXNzZXMgYXQgb25jZVxudmFyIGhhc0NsYXNzLCBhZGRDbGFzcywgcmVtb3ZlQ2xhc3M7XG5cbmlmICggJ2NsYXNzTGlzdCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICkge1xuICBoYXNDbGFzcyA9IGZ1bmN0aW9uKCBlbGVtLCBjICkge1xuICAgIHJldHVybiBlbGVtLmNsYXNzTGlzdC5jb250YWlucyggYyApO1xuICB9O1xuICBhZGRDbGFzcyA9IGZ1bmN0aW9uKCBlbGVtLCBjICkge1xuICAgIGVsZW0uY2xhc3NMaXN0LmFkZCggYyApO1xuICB9O1xuICByZW1vdmVDbGFzcyA9IGZ1bmN0aW9uKCBlbGVtLCBjICkge1xuICAgIGVsZW0uY2xhc3NMaXN0LnJlbW92ZSggYyApO1xuICB9O1xufVxuZWxzZSB7XG4gIGhhc0NsYXNzID0gZnVuY3Rpb24oIGVsZW0sIGMgKSB7XG4gICAgcmV0dXJuIGNsYXNzUmVnKCBjICkudGVzdCggZWxlbS5jbGFzc05hbWUgKTtcbiAgfTtcbiAgYWRkQ2xhc3MgPSBmdW5jdGlvbiggZWxlbSwgYyApIHtcbiAgICBpZiAoICFoYXNDbGFzcyggZWxlbSwgYyApICkge1xuICAgICAgZWxlbS5jbGFzc05hbWUgPSBlbGVtLmNsYXNzTmFtZSArICcgJyArIGM7XG4gICAgfVxuICB9O1xuICByZW1vdmVDbGFzcyA9IGZ1bmN0aW9uKCBlbGVtLCBjICkge1xuICAgIGVsZW0uY2xhc3NOYW1lID0gZWxlbS5jbGFzc05hbWUucmVwbGFjZSggY2xhc3NSZWcoIGMgKSwgJyAnICk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHRvZ2dsZUNsYXNzKCBlbGVtLCBjICkge1xuICB2YXIgZm4gPSBoYXNDbGFzcyggZWxlbSwgYyApID8gcmVtb3ZlQ2xhc3MgOiBhZGRDbGFzcztcbiAgZm4oIGVsZW0sIGMgKTtcbn1cblxudmFyIGNsYXNzaWUgPSB7XG4gIC8vIGZ1bGwgbmFtZXNcbiAgaGFzQ2xhc3M6IGhhc0NsYXNzLFxuICBhZGRDbGFzczogYWRkQ2xhc3MsXG4gIHJlbW92ZUNsYXNzOiByZW1vdmVDbGFzcyxcbiAgdG9nZ2xlQ2xhc3M6IHRvZ2dsZUNsYXNzLFxuICAvLyBzaG9ydCBuYW1lc1xuICBoYXM6IGhhc0NsYXNzLFxuICBhZGQ6IGFkZENsYXNzLFxuICByZW1vdmU6IHJlbW92ZUNsYXNzLFxuICB0b2dnbGU6IHRvZ2dsZUNsYXNzXG59O1xuXG4vLyB0cmFuc3BvcnRcbmlmICggdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAvLyBBTURcbiAgZGVmaW5lKCBjbGFzc2llICk7XG59IGVsc2UgaWYgKCB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgKSB7XG4gIC8vIENvbW1vbkpTXG4gIG1vZHVsZS5leHBvcnRzID0gY2xhc3NpZTtcbn0gZWxzZSB7XG4gIC8vIGJyb3dzZXIgZ2xvYmFsXG4gIHdpbmRvdy5jbGFzc2llID0gY2xhc3NpZTtcbn1cblxufSkoIHdpbmRvdyApO1xuIiwiLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblx0UE9QVVAuSlNcblxuXHRTaW1wbGUgUG9wdXAgcGx1Z2luIGZvciBqUXVlcnlcblxuXHRAYXV0aG9yIFRvZGQgRnJhbmNpc1xuXHRAdmVyc2lvbiAyLjIuM1xuXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuOyhmdW5jdGlvbihiLHQpe2IuZm4ucG9wdXA9ZnVuY3Rpb24oaCl7dmFyIHE9dGhpcy5zZWxlY3RvcixtPW5ldyBiLlBvcHVwKGgpO2IoZG9jdW1lbnQpLm9uKFwiY2xpY2sucG9wdXBcIixxLGZ1bmN0aW9uKG4pe3ZhciBrPWgmJmguY29udGVudD9oLmNvbnRlbnQ6Yih0aGlzKS5hdHRyKFwiaHJlZlwiKTtuLnByZXZlbnREZWZhdWx0KCk7bS5vcGVuKGssdm9pZCAwLHRoaXMpfSk7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe2IodGhpcykuZGF0YShcInBvcHVwXCIsbSl9KX07Yi5Qb3B1cD1mdW5jdGlvbihoKXtmdW5jdGlvbiBxKGEpe3ZhciBkO2IuZWFjaChhLGZ1bmN0aW9uKGEsYyl7aWYoYylyZXR1cm4gZD1jLCExfSk7cmV0dXJuIGR9ZnVuY3Rpb24gbShhKXtyZXR1cm5cImZ1bmN0aW9uXCI9PT10eXBlb2YgYT9cImZ1bmN0aW9uXCI6YSBpbnN0YW5jZW9mIGI/XCJqUXVlcnlcIjpcIiNcIj09PWEuc3Vic3RyKDAsMSl8fFwiLlwiPT09YS5zdWJzdHIoMCwxKT9cImlubGluZVwiOi0xIT09Yi5pbkFycmF5KGEuc3Vic3RyKGEubGVuZ3RoLVxuMyksdSk/XCJpbWFnZVwiOlwiaHR0cFwiPT09YS5zdWJzdHIoMCw0KT9cImV4dGVybmFsXCI6XCJhamF4XCJ9ZnVuY3Rpb24gbihjKXtyJiZyLmZhZGVPdXQoXCJmYXN0XCIsZnVuY3Rpb24oKXtiKHRoaXMpLnJlbW92ZSgpfSk7dmFyIGQ9ITA7dm9pZCAwPT09ZiYmKGQ9ITEsZj1iKCc8ZGl2IGNsYXNzPVwiJythLm8uY29udGFpbmVyQ2xhc3MrJ1wiPicpLHA9YihhLm8ubWFya3VwKS5hcHBlbmRUbyhmKSxiKGEuby5jbG9zZUNvbnRlbnQpLm9uZShcImNsaWNrXCIsZnVuY3Rpb24oKXthLmNsb3NlKCl9KS5hcHBlbmRUbyhmKSxiKHQpLnJlc2l6ZShhLmNlbnRlciksZi5hcHBlbmRUbyhiKFwiYm9keVwiKSkuY3NzKFwib3BhY2l0eVwiLDApKTt2YXIgZT1iKFwiLlwiK2Euby5jb250ZW50Q2xhc3MsZik7YS53aWR0aD9lLmNzcyhcIndpZHRoXCIsYS53aWR0aCwxMCk6ZS5jc3MoXCJ3aWR0aFwiLFwiXCIpO2EuaGVpZ2h0P2UuY3NzKFwiaGVpZ2h0XCIsYS5oZWlnaHQsMTApOmUuY3NzKFwiaGVpZ2h0XCIsXCJcIik7cC5oYXNDbGFzcyhhLm8uY29udGVudENsYXNzKT9cbnAuaHRtbChjKTpwLmZpbmQoXCIuXCIrYS5vLmNvbnRlbnRDbGFzcykuaHRtbChjKTtkP2Euby5yZXBsYWNlZC5jYWxsKGEsZixnKTphLm8uc2hvdy5jYWxsKGEsZixnKX1mdW5jdGlvbiBrKGEsZCl7dmFyIGI9KG5ldyBSZWdFeHAoXCJbPyZdXCIrYStcIj0oW14mXSopXCIpKS5leGVjKGQpO3JldHVybiBiJiZkZWNvZGVVUklDb21wb25lbnQoYlsxXS5yZXBsYWNlKC9cXCsvZyxcIiBcIikpfXZhciBhPXRoaXMsdT1bXCJwbmdcIixcImpwZ1wiLFwiZ2lmXCJdLGwscyxnLGYscixwO2EuZWxlPXZvaWQgMDthLm89Yi5leHRlbmQoITAse30se2JhY2tDbGFzczpcInBvcHVwX2JhY2tcIixiYWNrT3BhY2l0eTouNyxjb250YWluZXJDbGFzczpcInBvcHVwX2NvbnRcIixjbG9zZUNvbnRlbnQ6JzxkaXYgY2xhc3M9XCJwb3B1cF9jbG9zZVwiPiZ0aW1lczs8L2Rpdj4nLG1hcmt1cDonPGRpdiBjbGFzcz1cInBvcHVwXCI+PGRpdiBjbGFzcz1cInBvcHVwX2NvbnRlbnRcIi8+PC9kaXY+Jyxjb250ZW50Q2xhc3M6XCJwb3B1cF9jb250ZW50XCIsXG5wcmVsb2FkZXJDb250ZW50Oic8cCBjbGFzcz1cInByZWxvYWRlclwiPkxvYWRpbmc8L3A+JyxhY3RpdmVDbGFzczpcInBvcHVwX2FjdGl2ZVwiLGhpZGVGbGFzaDohMSxzcGVlZDoyMDAscG9wdXBQbGFjZWhvbGRlckNsYXNzOlwicG9wdXBfcGxhY2Vob2xkZXJcIixrZWVwSW5saW5lQ2hhbmdlczohMCxtb2RhbDohMSxjb250ZW50Om51bGwsdHlwZTpcImF1dG9cIix3aWR0aDpudWxsLGhlaWdodDpudWxsLHR5cGVQYXJhbTpcInB0XCIsd2lkdGhQYXJhbTpcInB3XCIsaGVpZ2h0UGFyYW06XCJwaFwiLGJlZm9yZU9wZW46ZnVuY3Rpb24oYSl7fSxhZnRlck9wZW46ZnVuY3Rpb24oKXt9LGJlZm9yZUNsb3NlOmZ1bmN0aW9uKCl7fSxhZnRlckNsb3NlOmZ1bmN0aW9uKCl7fSxlcnJvcjpmdW5jdGlvbigpe30sc2hvdzpmdW5jdGlvbihhLGIpe3ZhciBlPXRoaXM7ZS5jZW50ZXIoKTthLmFuaW1hdGUoe29wYWNpdHk6MX0sZS5vLnNwZWVkLGZ1bmN0aW9uKCl7ZS5vLmFmdGVyT3Blbi5jYWxsKGUpfSl9LHJlcGxhY2VkOmZ1bmN0aW9uKGEsXG5iKXt0aGlzLmNlbnRlcigpLm8uYWZ0ZXJPcGVuLmNhbGwodGhpcyl9LGhpZGU6ZnVuY3Rpb24oYSxiKXt2b2lkIDAhPT1hJiZhLmFuaW1hdGUoe29wYWNpdHk6MH0sdGhpcy5vLnNwZWVkKX0sdHlwZXM6e2lubGluZTpmdW5jdGlvbihjLGQpe3ZhciBlPWIoYyk7ZS5hZGRDbGFzcyhhLm8ucG9wdXBQbGFjZWhvbGRlckNsYXNzKTthLm8ua2VlcElubGluZUNoYW5nZXN8fChzPWUuaHRtbCgpKTtkLmNhbGwodGhpcyxlLmNoaWxkcmVuKCkpfSxpbWFnZTpmdW5jdGlvbihjLGQpe3ZhciBlPXRoaXM7YihcIjxpbWcgLz5cIikub25lKFwibG9hZFwiLGZ1bmN0aW9uKCl7dmFyIGE9dGhpcztzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZC5jYWxsKGUsYSl9LDApfSkub25lKFwiZXJyb3JcIixmdW5jdGlvbigpe2Euby5lcnJvci5jYWxsKGEsYyxcImltYWdlXCIpfSkuYXR0cihcInNyY1wiLGMpLmVhY2goZnVuY3Rpb24oKXt0aGlzLmNvbXBsZXRlJiZiKHRoaXMpLnRyaWdnZXIoXCJsb2FkXCIpfSl9LGV4dGVybmFsOmZ1bmN0aW9uKGMsXG5kKXt2YXIgZT1iKFwiPGlmcmFtZSAvPlwiKS5hdHRyKHtzcmM6YyxmcmFtZWJvcmRlcjowLHdpZHRoOmEud2lkdGgsaGVpZ2h0OmEuaGVpZ2h0fSk7ZC5jYWxsKHRoaXMsZSl9LGh0bWw6ZnVuY3Rpb24oYSxiKXtiLmNhbGwodGhpcyxhKX0salF1ZXJ5OmZ1bmN0aW9uKGEsYil7Yi5jYWxsKHRoaXMsYS5odG1sKCkpfSxcImZ1bmN0aW9uXCI6ZnVuY3Rpb24oYixkKXtkLmNhbGwodGhpcyxiLmNhbGwoYSkpfSxhamF4OmZ1bmN0aW9uKGMsZCl7Yi5hamF4KHt1cmw6YyxzdWNjZXNzOmZ1bmN0aW9uKGEpe2QuY2FsbCh0aGlzLGEpfSxlcnJvcjpmdW5jdGlvbihiKXthLm8uZXJyb3IuY2FsbChhLGMsXCJhamF4XCIpfX0pfX19LGgpO2Eub3Blbj1mdW5jdGlvbihjLGQsZSl7Yz12b2lkIDA9PT1jfHxcIiNcIj09PWM/YS5vLmNvbnRlbnQ6YztpZihudWxsPT09YylyZXR1cm4gYS5vLmVycm9yLmNhbGwoYSxjLGwpLCExO3ZvaWQgMCE9PWUmJihhLmVsZSYmYS5vLmFjdGl2ZUNsYXNzJiZiKGEuZWxlKS5yZW1vdmVDbGFzcyhhLm8uYWN0aXZlQ2xhc3MpLFxuYS5lbGU9ZSxhLmVsZSYmYS5vLmFjdGl2ZUNsYXNzJiZiKGEuZWxlKS5hZGRDbGFzcyhhLm8uYWN0aXZlQ2xhc3MpKTtpZih2b2lkIDA9PT1nKXtnPWIoJzxkaXYgY2xhc3M9XCInK2Euby5iYWNrQ2xhc3MrJ1wiLz4nKS5hcHBlbmRUbyhiKFwiYm9keVwiKSkuY3NzKFwib3BhY2l0eVwiLDApLmFuaW1hdGUoe29wYWNpdHk6YS5vLmJhY2tPcGFjaXR5fSxhLm8uc3BlZWQpO2lmKCFhLm8ubW9kYWwpZy5vbmUoXCJjbGljay5wb3B1cFwiLGZ1bmN0aW9uKCl7YS5jbG9zZSgpfSk7YS5vLmhpZGVGbGFzaCYmYihcIm9iamVjdCwgZW1iZWRcIikuY3NzKFwidmlzaWJpbGl0eVwiLFwiaGlkZGVuXCIpO2Euby5wcmVsb2FkZXJDb250ZW50JiYocj1iKGEuby5wcmVsb2FkZXJDb250ZW50KS5hcHBlbmRUbyhiKFwiYm9keVwiKSkpfWQ9cShbZCxhLm8udHlwZV0pO2w9ZD1cImF1dG9cIj09PWQ/bShjKTpkO2Eud2lkdGg9YS5vLndpZHRoP2Euby53aWR0aDpudWxsO2EuaGVpZ2h0PWEuby5oZWlnaHQ/YS5vLmhlaWdodDpudWxsO1xuaWYoLTE9PT1iLmluQXJyYXkoZCxbXCJpbmxpbmVcIixcImpRdWVyeVwiLFwiZnVuY3Rpb25cIl0pKXtlPWsoYS5vLnR5cGVQYXJhbSxjKTt2YXIgZj1rKGEuby53aWR0aFBhcmFtLGMpLGg9ayhhLm8uaGVpZ2h0UGFyYW0sYyk7ZD1udWxsIT09ZT9lOmQ7YS53aWR0aD1udWxsIT09Zj9mOmEud2lkdGg7YS5oZWlnaHQ9bnVsbCE9PWg/aDphLmhlaWdodH1hLm8uYmVmb3JlT3Blbi5jYWxsKGEsZCk7YS5vLnR5cGVzW2RdP2Euby50eXBlc1tkXS5jYWxsKGEsYyxuKTphLm8udHlwZXMuYWpheC5jYWxsKGEsYyxuKX07YS5jbG9zZT1mdW5jdGlvbigpe2Euby5iZWZvcmVDbG9zZS5jYWxsKGEpO1wiaW5saW5lXCI9PT1sJiZhLm8ua2VlcElubGluZUNoYW5nZXMmJihzPWIoXCIuXCIrYS5vLmNvbnRlbnRDbGFzcykuaHRtbCgpKTt2b2lkIDAhPT1nJiZnLmFuaW1hdGUoe29wYWNpdHk6MH0sYS5vLnNwZWVkLGZ1bmN0aW9uKCl7YS5jbGVhblVwKCl9KTthLm8uaGlkZS5jYWxsKGEsZixnKTtyZXR1cm4gYX07YS5jbGVhblVwPVxuZnVuY3Rpb24oKXtnLmFkZChmKS5yZW1vdmUoKTtmPWc9dm9pZCAwO2IodCkudW5iaW5kKFwicmVzaXplXCIsYS5jZW50ZXIpO2Euby5oaWRlRmxhc2gmJmIoXCJvYmplY3QsIGVtYmVkXCIpLmNzcyhcInZpc2liaWxpdHlcIixcInZpc2libGVcIik7YS5lbGUmJmEuby5hY3RpdmVDbGFzcyYmYihhLmVsZSkucmVtb3ZlQ2xhc3MoYS5vLmFjdGl2ZUNsYXNzKTt2YXIgYz1iKFwiLlwiK2Euby5wb3B1cFBsYWNlaG9sZGVyQ2xhc3MpO1wiaW5saW5lXCI9PWwmJmMubGVuZ3RoJiZjLmh0bWwocykucmVtb3ZlQ2xhc3MoYS5vLnBvcHVwUGxhY2Vob2xkZXJDbGFzcyk7bD1udWxsO2Euby5hZnRlckNsb3NlLmNhbGwoYSk7cmV0dXJuIGF9O2EuY2VudGVyPWZ1bmN0aW9uKCl7Zi5jc3MoYS5nZXRDZW50ZXIoKSk7Zy5jc3Moe2hlaWdodDpkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0fSk7cmV0dXJuIGF9O2EuZ2V0Q2VudGVyPWZ1bmN0aW9uKCl7dmFyIGE9Zi5jaGlsZHJlbigpLm91dGVyV2lkdGgoITApLFxuYj1mLmNoaWxkcmVuKCkub3V0ZXJIZWlnaHQoITApO3JldHVybnt0b3A6LjUqZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodC0uNSpiLGxlZnQ6LjUqZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoLS41KmF9fX19KShqUXVlcnksd2luZG93KTsiLCI7KGZ1bmN0aW9uICggJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkICkge1xuXG4gIC8qKlxuICAgKiBhbmltbyBpcyBhIHBvd2VyZnVsIGxpdHRsZSB0b29sIHRoYXQgbWFrZXMgbWFuYWdpbmcgQ1NTIGFuaW1hdGlvbnMgZXh0cmVtZWx5IGVhc3kuIFN0YWNrIGFuaW1hdGlvbnMsIHNldCBjYWxsYmFja3MsIG1ha2UgbWFnaWMuXG4gICAqIE1vZGVybiBicm93c2VycyBhbmQgYWxtb3N0IGFsbCBtb2JpbGUgYnJvd3NlcnMgc3VwcG9ydCBDU1MgYW5pbWF0aW9ucyAoaHR0cDovL2Nhbml1c2UuY29tL2Nzcy1hbmltYXRpb24pLlxuICAgKlxuICAgKiBAYXV0aG9yIERhbmllbCBSYWZ0ZXJ5IDogdHdpdHRlci9UaHJpdmluZ0tpbmdzXG4gICAqIEB2ZXJzaW9uIDEuMC4xXG4gICovXG4gIGZ1bmN0aW9uIGFuaW1vKCBlbGVtZW50LCBvcHRpb25zLCBjYWxsYmFjaywgb3RoZXJfY2IgKSB7XG4gICAgXG4gICAgLy8gRGVmYXVsdCBjb25maWd1cmF0aW9uXG4gICAgdmFyIGRlZmF1bHRzID0ge1xuICAgIFx0ZHVyYXRpb246IDEsXG4gICAgXHRhbmltYXRpb246IG51bGwsXG4gICAgXHRpdGVyYXRlOiAxLFxuICAgIFx0dGltaW5nOiBcImxpbmVhclwiLFxuICAgICAga2VlcDogZmFsc2VcbiAgICB9O1xuXG4gICAgLy8gQnJvd3NlciBwcmVmaXhlcyBmb3IgQ1NTXG4gICAgdGhpcy5wcmVmaXhlcyA9IFtcIlwiLCBcIi1tb3otXCIsIFwiLW8tYW5pbWF0aW9uLVwiLCBcIi13ZWJraXQtXCJdO1xuXG4gICAgLy8gQ2FjaGUgdGhlIGVsZW1lbnRcbiAgICB0aGlzLmVsZW1lbnQgPSAkKGVsZW1lbnQpO1xuXG4gICAgdGhpcy5iYXJlID0gZWxlbWVudDtcblxuICAgIC8vIEZvciBzdGFja2luZyBvZiBhbmltYXRpb25zXG4gICAgdGhpcy5xdWV1ZSA9IFtdO1xuXG4gICAgLy8gSGFja3lcbiAgICB0aGlzLmxpc3RlbmluZyA9IGZhbHNlO1xuXG4gICAgLy8gRmlndXJlIG91dCB3aGVyZSB0aGUgY2FsbGJhY2sgaXNcbiAgICB2YXIgY2IgPSAodHlwZW9mIGNhbGxiYWNrID09IFwiZnVuY3Rpb25cIiA/IGNhbGxiYWNrIDogb3RoZXJfY2IpO1xuXG4gICAgLy8gT3B0aW9ucyBjYW4gc29tZXRpbWVzIGJlIGEgY29tbWFuZFxuICAgIHN3aXRjaChvcHRpb25zKSB7XG5cbiAgICAgIGNhc2UgXCJibHVyXCI6XG5cbiAgICAgIFx0ZGVmYXVsdHMgPSB7XG4gICAgICBcdFx0YW1vdW50OiAzLFxuICAgICAgXHRcdGR1cmF0aW9uOiAwLjUsXG4gICAgICBcdFx0Zm9jdXNBZnRlcjogbnVsbFxuICAgICAgXHR9O1xuXG4gICAgICBcdHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKCBkZWZhdWx0cywgY2FsbGJhY2sgKTtcblxuICBcdCAgICB0aGlzLl9ibHVyKGNiKTtcblxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcImZvY3VzXCI6XG5cbiAgXHQgIFx0dGhpcy5fZm9jdXMoKTtcblxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcInJvdGF0ZVwiOlxuXG4gICAgICAgIGRlZmF1bHRzID0ge1xuICAgICAgICAgIGRlZ3JlZXM6IDE1LFxuICAgICAgICAgIGR1cmF0aW9uOiAwLjVcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCggZGVmYXVsdHMsIGNhbGxiYWNrICk7XG5cbiAgICAgICAgdGhpcy5fcm90YXRlKGNiKTtcblxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcImNsZWFuc2VcIjpcblxuICAgICAgICB0aGlzLmNsZWFuc2UoKTtcblxuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcblxuXHQgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoIGRlZmF1bHRzLCBvcHRpb25zICk7XG5cblx0ICAgIHRoaXMuaW5pdChjYik7XG4gIFx0XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBhbmltby5wcm90b3R5cGUgPSB7XG5cbiAgICAvLyBBIHN0YW5kYXJkIENTUyBhbmltYXRpb25cbiAgICBpbml0OiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgXG4gICAgICB2YXIgJG1lID0gdGhpcztcblxuICAgICAgLy8gQXJlIHdlIHN0YWNraW5nIGFuaW1hdGlvbnM/XG4gICAgICBpZihPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoICRtZS5vcHRpb25zLmFuaW1hdGlvbiApID09PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICBcdCQubWVyZ2UoJG1lLnF1ZXVlLCAkbWUub3B0aW9ucy5hbmltYXRpb24pO1xuICAgICAgfSBlbHNlIHtcblx0ICAgICAgJG1lLnF1ZXVlLnB1c2goJG1lLm9wdGlvbnMuYW5pbWF0aW9uKTtcblx0ICAgIH1cblxuXHQgICAgJG1lLmNsZWFuc2UoKTtcblxuXHQgICAgJG1lLmFuaW1hdGUoY2FsbGJhY2spO1xuICAgICAgXG4gICAgfSxcblxuICAgIC8vIFRoZSBhY3R1YWwgYWRkaW5nIG9mIHRoZSBjbGFzcyBhbmQgbGlzdGVuaW5nIGZvciBjb21wbGV0aW9uXG4gICAgYW5pbWF0ZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcblxuICAgIFx0dGhpcy5lbGVtZW50LmFkZENsYXNzKCdhbmltYXRlZCcpO1xuXG4gICAgICB0aGlzLmVsZW1lbnQuYWRkQ2xhc3ModGhpcy5xdWV1ZVswXSk7XG5cbiAgICAgIHRoaXMuZWxlbWVudC5kYXRhKFwiYW5pbW9cIiwgdGhpcy5xdWV1ZVswXSk7XG5cbiAgICAgIHZhciBhaSA9IHRoaXMucHJlZml4ZXMubGVuZ3RoO1xuXG4gICAgICAvLyBBZGQgdGhlIG9wdGlvbnMgZm9yIGVhY2ggcHJlZml4XG4gICAgICB3aGlsZShhaS0tKSB7XG5cbiAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcImFuaW1hdGlvbi1kdXJhdGlvblwiLCB0aGlzLm9wdGlvbnMuZHVyYXRpb24rXCJzXCIpO1xuXG4gICAgICBcdHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJhbmltYXRpb24taXRlcmF0aW9uLWNvdW50XCIsIHRoaXMub3B0aW9ucy5pdGVyYXRlKTtcblxuICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiYW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvblwiLCB0aGlzLm9wdGlvbnMudGltaW5nKTtcblxuICAgICAgfVxuXG4gICAgICB2YXIgJG1lID0gdGhpcywgX2NiID0gY2FsbGJhY2s7XG5cbiAgICAgIGlmKCRtZS5xdWV1ZS5sZW5ndGg+MSkge1xuICAgICAgICBfY2IgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICAvLyBMaXN0ZW4gZm9yIHRoZSBlbmQgb2YgdGhlIGFuaW1hdGlvblxuICAgICAgdGhpcy5fZW5kKFwiQW5pbWF0aW9uRW5kXCIsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIC8vIElmIHRoZXJlIGFyZSBtb3JlLCBjbGVhbiBpdCB1cCBhbmQgbW92ZSBvblxuICAgICAgXHRpZigkbWUuZWxlbWVudC5oYXNDbGFzcygkbWUucXVldWVbMF0pKSB7XG5cblx0ICAgIFx0XHRpZighJG1lLm9wdGlvbnMua2VlcCkge1xuICAgICAgICAgICAgJG1lLmNsZWFuc2UoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAkbWUucXVldWUuc2hpZnQoKTtcblxuXHQgICAgXHRcdGlmKCRtZS5xdWV1ZS5sZW5ndGgpIHtcblxuXHRcdCAgICAgIFx0JG1lLmFuaW1hdGUoY2FsbGJhY2spO1xuXHRcdCAgICAgIH1cblx0XHRcdCAgfVxuXHRcdCAgfSwgX2NiKTtcbiAgICB9LFxuXG4gICAgY2xlYW5zZTogZnVuY3Rpb24oKSB7XG5cbiAgICBcdHRoaXMuZWxlbWVudC5yZW1vdmVDbGFzcygnYW5pbWF0ZWQnKTtcblxuICBcdFx0dGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKHRoaXMucXVldWVbMF0pO1xuXG4gICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3ModGhpcy5lbGVtZW50LmRhdGEoXCJhbmltb1wiKSk7XG5cbiAgXHRcdHZhciBhaSA9IHRoaXMucHJlZml4ZXMubGVuZ3RoO1xuXG4gIFx0XHR3aGlsZShhaS0tKSB7XG5cbiAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcImFuaW1hdGlvbi1kdXJhdGlvblwiLCBcIlwiKTtcblxuICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiYW5pbWF0aW9uLWl0ZXJhdGlvbi1jb3VudFwiLCBcIlwiKTtcblxuICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiYW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvblwiLCBcIlwiKTtcblxuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1widHJhbnNpdGlvblwiLCBcIlwiKTtcblxuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1widHJhbnNmb3JtXCIsIFwiXCIpO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJmaWx0ZXJcIiwgXCJcIik7XG5cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX2JsdXI6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cbiAgICAgIGlmKHRoaXMuZWxlbWVudC5pcyhcImltZ1wiKSkge1xuXG4gICAgICBcdHZhciBzdmdfaWQgPSBcInN2Z19cIiArICgoKDEgKyBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDAwMCkgfCAwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpO1xuICAgICAgXHR2YXIgZmlsdGVyX2lkID0gXCJmaWx0ZXJfXCIgKyAoKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwMDApIHwgMCkudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKTtcblxuICAgICAgXHQkKCdib2R5JykuYXBwZW5kKCc8c3ZnIHZlcnNpb249XCIxLjFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgaWQ9XCInK3N2Z19pZCsnXCIgc3R5bGU9XCJoZWlnaHQ6MDtcIj48ZmlsdGVyIGlkPVwiJytmaWx0ZXJfaWQrJ1wiPjxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249XCInK3RoaXMub3B0aW9ucy5hbW91bnQrJ1wiIC8+PC9maWx0ZXI+PC9zdmc+Jyk7XG5cbiAgICAgIFx0dmFyIGFpID0gdGhpcy5wcmVmaXhlcy5sZW5ndGg7XG5cbiAgICBcdFx0d2hpbGUoYWktLSkge1xuXG4gICAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcImZpbHRlclwiLCBcImJsdXIoXCIrdGhpcy5vcHRpb25zLmFtb3VudCtcInB4KVwiKTtcblxuICAgICAgICBcdHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJ0cmFuc2l0aW9uXCIsIHRoaXMub3B0aW9ucy5kdXJhdGlvbitcInMgYWxsIGxpbmVhclwiKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LmNzcyhcImZpbHRlclwiLCBcInVybCgjXCIrZmlsdGVyX2lkK1wiKVwiKTtcblxuICAgICAgICB0aGlzLmVsZW1lbnQuZGF0YShcInN2Z2lkXCIsIHN2Z19pZCk7XG4gICAgICBcbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgdmFyIGNvbG9yID0gdGhpcy5lbGVtZW50LmNzcygnY29sb3InKTtcblxuICAgICAgICB2YXIgYWkgPSB0aGlzLnByZWZpeGVzLmxlbmd0aDtcblxuICAgICAgICAvLyBBZGQgdGhlIG9wdGlvbnMgZm9yIGVhY2ggcHJlZml4XG4gICAgICAgIHdoaWxlKGFpLS0pIHtcblxuICAgICAgICAgIHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJ0cmFuc2l0aW9uXCIsIFwiYWxsIFwiK3RoaXMub3B0aW9ucy5kdXJhdGlvbitcInMgbGluZWFyXCIpO1xuXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKFwidGV4dC1zaGFkb3dcIiwgXCIwIDAgXCIrdGhpcy5vcHRpb25zLmFtb3VudCtcInB4IFwiK2NvbG9yKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LmNzcyhcImNvbG9yXCIsIFwidHJhbnNwYXJlbnRcIik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2VuZChcIlRyYW5zaXRpb25FbmRcIiwgbnVsbCwgY2FsbGJhY2spO1xuXG4gICAgICB2YXIgJG1lID0gdGhpcztcblxuICAgICAgaWYodGhpcy5vcHRpb25zLmZvY3VzQWZ0ZXIpIHtcblxuICAgICAgICB2YXIgZm9jdXNfd2FpdCA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgJG1lLl9mb2N1cygpO1xuXG4gICAgICAgICAgZm9jdXNfd2FpdCA9IHdpbmRvdy5jbGVhclRpbWVvdXQoZm9jdXNfd2FpdCk7XG5cbiAgICAgICAgfSwgKHRoaXMub3B0aW9ucy5mb2N1c0FmdGVyKjEwMDApKTtcbiAgICAgIH1cblxuICAgIH0sXG5cbiAgICBfZm9jdXM6IGZ1bmN0aW9uKCkge1xuXG4gICAgXHR2YXIgYWkgPSB0aGlzLnByZWZpeGVzLmxlbmd0aDtcblxuICAgICAgaWYodGhpcy5lbGVtZW50LmlzKFwiaW1nXCIpKSB7XG5cbiAgICBcdFx0d2hpbGUoYWktLSkge1xuXG4gICAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcImZpbHRlclwiLCBcIlwiKTtcblxuICAgICAgICBcdHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJ0cmFuc2l0aW9uXCIsIFwiXCIpO1xuXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgJHN2ZyA9ICQoJyMnK3RoaXMuZWxlbWVudC5kYXRhKCdzdmdpZCcpKTtcblxuICAgICAgICAkc3ZnLnJlbW92ZSgpO1xuICAgICAgfSBlbHNlIHtcblxuICAgICAgICB3aGlsZShhaS0tKSB7XG5cbiAgICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1widHJhbnNpdGlvblwiLCBcIlwiKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LmNzcyhcInRleHQtc2hhZG93XCIsIFwiXCIpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKFwiY29sb3JcIiwgXCJcIik7XG4gICAgICB9XG4gICAgfSxcblxuICAgIF9yb3RhdGU6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cbiAgICAgIHZhciBhaSA9IHRoaXMucHJlZml4ZXMubGVuZ3RoO1xuXG4gICAgICAvLyBBZGQgdGhlIG9wdGlvbnMgZm9yIGVhY2ggcHJlZml4XG4gICAgICB3aGlsZShhaS0tKSB7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcInRyYW5zaXRpb25cIiwgXCJhbGwgXCIrdGhpcy5vcHRpb25zLmR1cmF0aW9uK1wicyBsaW5lYXJcIik7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcInRyYW5zZm9ybVwiLCBcInJvdGF0ZShcIit0aGlzLm9wdGlvbnMuZGVncmVlcytcImRlZylcIik7XG5cbiAgICAgIH1cblxuICAgICAgdGhpcy5fZW5kKFwiVHJhbnNpdGlvbkVuZFwiLCBudWxsLCBjYWxsYmFjayk7XG5cbiAgICB9LFxuXG4gICAgX2VuZDogZnVuY3Rpb24odHlwZSwgdG9kbywgY2FsbGJhY2spIHtcblxuICAgICAgdmFyICRtZSA9IHRoaXM7XG5cbiAgICAgIHZhciBiaW5kaW5nID0gdHlwZS50b0xvd2VyQ2FzZSgpK1wiIHdlYmtpdFwiK3R5cGUrXCIgb1wiK3R5cGUrXCIgTVNcIit0eXBlO1xuXG4gICAgICB0aGlzLmVsZW1lbnQuYmluZChiaW5kaW5nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgXG4gICAgICAgICRtZS5lbGVtZW50LnVuYmluZChiaW5kaW5nKTtcblxuICAgICAgICBpZih0eXBlb2YgdG9kbyA9PSBcImZ1bmN0aW9uXCIpIHtcblxuICAgICAgICAgIHRvZG8oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHR5cGVvZiBjYWxsYmFjayA9PSBcImZ1bmN0aW9uXCIpIHtcblxuICAgICAgICAgIGNhbGxiYWNrKCRtZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgXG4gICAgfVxuICB9O1xuXG4gICQuZm4uYW5pbW8gPSBmdW5jdGlvbiAoIG9wdGlvbnMsIGNhbGxiYWNrLCBvdGhlcl9jYiApIHtcbiAgICBcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0XG5cdFx0XHRuZXcgYW5pbW8oIHRoaXMsIG9wdGlvbnMsIGNhbGxiYWNrLCBvdGhlcl9jYiApO1xuXG5cdFx0fSk7XG5cbiAgfTtcblxufSkoIGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCApOyIsIi8qIVxuV2F5cG9pbnRzIC0gMy4xLjFcbkNvcHlyaWdodCDCqSAyMDExLTIwMTUgQ2FsZWIgVHJvdWdodG9uXG5MaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG5odHRwczovL2dpdGh1Yi5jb20vaW1ha2V3ZWJ0aGluZ3Mvd2F5cG9pbnRzL2Jsb2cvbWFzdGVyL2xpY2Vuc2VzLnR4dFxuKi9cbiFmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHQobyl7aWYoIW8pdGhyb3cgbmV3IEVycm9yKFwiTm8gb3B0aW9ucyBwYXNzZWQgdG8gV2F5cG9pbnQgY29uc3RydWN0b3JcIik7aWYoIW8uZWxlbWVudCl0aHJvdyBuZXcgRXJyb3IoXCJObyBlbGVtZW50IG9wdGlvbiBwYXNzZWQgdG8gV2F5cG9pbnQgY29uc3RydWN0b3JcIik7aWYoIW8uaGFuZGxlcil0aHJvdyBuZXcgRXJyb3IoXCJObyBoYW5kbGVyIG9wdGlvbiBwYXNzZWQgdG8gV2F5cG9pbnQgY29uc3RydWN0b3JcIik7dGhpcy5rZXk9XCJ3YXlwb2ludC1cIitlLHRoaXMub3B0aW9ucz10LkFkYXB0ZXIuZXh0ZW5kKHt9LHQuZGVmYXVsdHMsbyksdGhpcy5lbGVtZW50PXRoaXMub3B0aW9ucy5lbGVtZW50LHRoaXMuYWRhcHRlcj1uZXcgdC5BZGFwdGVyKHRoaXMuZWxlbWVudCksdGhpcy5jYWxsYmFjaz1vLmhhbmRsZXIsdGhpcy5heGlzPXRoaXMub3B0aW9ucy5ob3Jpem9udGFsP1wiaG9yaXpvbnRhbFwiOlwidmVydGljYWxcIix0aGlzLmVuYWJsZWQ9dGhpcy5vcHRpb25zLmVuYWJsZWQsdGhpcy50cmlnZ2VyUG9pbnQ9bnVsbCx0aGlzLmdyb3VwPXQuR3JvdXAuZmluZE9yQ3JlYXRlKHtuYW1lOnRoaXMub3B0aW9ucy5ncm91cCxheGlzOnRoaXMuYXhpc30pLHRoaXMuY29udGV4dD10LkNvbnRleHQuZmluZE9yQ3JlYXRlQnlFbGVtZW50KHRoaXMub3B0aW9ucy5jb250ZXh0KSx0Lm9mZnNldEFsaWFzZXNbdGhpcy5vcHRpb25zLm9mZnNldF0mJih0aGlzLm9wdGlvbnMub2Zmc2V0PXQub2Zmc2V0QWxpYXNlc1t0aGlzLm9wdGlvbnMub2Zmc2V0XSksdGhpcy5ncm91cC5hZGQodGhpcyksdGhpcy5jb250ZXh0LmFkZCh0aGlzKSxpW3RoaXMua2V5XT10aGlzLGUrPTF9dmFyIGU9MCxpPXt9O3QucHJvdG90eXBlLnF1ZXVlVHJpZ2dlcj1mdW5jdGlvbih0KXt0aGlzLmdyb3VwLnF1ZXVlVHJpZ2dlcih0aGlzLHQpfSx0LnByb3RvdHlwZS50cmlnZ2VyPWZ1bmN0aW9uKHQpe3RoaXMuZW5hYmxlZCYmdGhpcy5jYWxsYmFjayYmdGhpcy5jYWxsYmFjay5hcHBseSh0aGlzLHQpfSx0LnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5jb250ZXh0LnJlbW92ZSh0aGlzKSx0aGlzLmdyb3VwLnJlbW92ZSh0aGlzKSxkZWxldGUgaVt0aGlzLmtleV19LHQucHJvdG90eXBlLmRpc2FibGU9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5lbmFibGVkPSExLHRoaXN9LHQucHJvdG90eXBlLmVuYWJsZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLmNvbnRleHQucmVmcmVzaCgpLHRoaXMuZW5hYmxlZD0hMCx0aGlzfSx0LnByb3RvdHlwZS5uZXh0PWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZ3JvdXAubmV4dCh0aGlzKX0sdC5wcm90b3R5cGUucHJldmlvdXM9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5ncm91cC5wcmV2aW91cyh0aGlzKX0sdC5pbnZva2VBbGw9ZnVuY3Rpb24odCl7dmFyIGU9W107Zm9yKHZhciBvIGluIGkpZS5wdXNoKGlbb10pO2Zvcih2YXIgbj0wLHI9ZS5sZW5ndGg7cj5uO24rKyllW25dW3RdKCl9LHQuZGVzdHJveUFsbD1mdW5jdGlvbigpe3QuaW52b2tlQWxsKFwiZGVzdHJveVwiKX0sdC5kaXNhYmxlQWxsPWZ1bmN0aW9uKCl7dC5pbnZva2VBbGwoXCJkaXNhYmxlXCIpfSx0LmVuYWJsZUFsbD1mdW5jdGlvbigpe3QuaW52b2tlQWxsKFwiZW5hYmxlXCIpfSx0LnJlZnJlc2hBbGw9ZnVuY3Rpb24oKXt0LkNvbnRleHQucmVmcmVzaEFsbCgpfSx0LnZpZXdwb3J0SGVpZ2h0PWZ1bmN0aW9uKCl7cmV0dXJuIHdpbmRvdy5pbm5lckhlaWdodHx8ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodH0sdC52aWV3cG9ydFdpZHRoPWZ1bmN0aW9uKCl7cmV0dXJuIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aH0sdC5hZGFwdGVycz1bXSx0LmRlZmF1bHRzPXtjb250ZXh0OndpbmRvdyxjb250aW51b3VzOiEwLGVuYWJsZWQ6ITAsZ3JvdXA6XCJkZWZhdWx0XCIsaG9yaXpvbnRhbDohMSxvZmZzZXQ6MH0sdC5vZmZzZXRBbGlhc2VzPXtcImJvdHRvbS1pbi12aWV3XCI6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5jb250ZXh0LmlubmVySGVpZ2h0KCktdGhpcy5hZGFwdGVyLm91dGVySGVpZ2h0KCl9LFwicmlnaHQtaW4tdmlld1wiOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuY29udGV4dC5pbm5lcldpZHRoKCktdGhpcy5hZGFwdGVyLm91dGVyV2lkdGgoKX19LHdpbmRvdy5XYXlwb2ludD10fSgpLGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gdCh0KXt3aW5kb3cuc2V0VGltZW91dCh0LDFlMy82MCl9ZnVuY3Rpb24gZSh0KXt0aGlzLmVsZW1lbnQ9dCx0aGlzLkFkYXB0ZXI9bi5BZGFwdGVyLHRoaXMuYWRhcHRlcj1uZXcgdGhpcy5BZGFwdGVyKHQpLHRoaXMua2V5PVwid2F5cG9pbnQtY29udGV4dC1cIitpLHRoaXMuZGlkU2Nyb2xsPSExLHRoaXMuZGlkUmVzaXplPSExLHRoaXMub2xkU2Nyb2xsPXt4OnRoaXMuYWRhcHRlci5zY3JvbGxMZWZ0KCkseTp0aGlzLmFkYXB0ZXIuc2Nyb2xsVG9wKCl9LHRoaXMud2F5cG9pbnRzPXt2ZXJ0aWNhbDp7fSxob3Jpem9udGFsOnt9fSx0LndheXBvaW50Q29udGV4dEtleT10aGlzLmtleSxvW3Qud2F5cG9pbnRDb250ZXh0S2V5XT10aGlzLGkrPTEsdGhpcy5jcmVhdGVUaHJvdHRsZWRTY3JvbGxIYW5kbGVyKCksdGhpcy5jcmVhdGVUaHJvdHRsZWRSZXNpemVIYW5kbGVyKCl9dmFyIGk9MCxvPXt9LG49d2luZG93LldheXBvaW50LHI9d2luZG93Lm9ubG9hZDtlLnByb3RvdHlwZS5hZGQ9ZnVuY3Rpb24odCl7dmFyIGU9dC5vcHRpb25zLmhvcml6b250YWw/XCJob3Jpem9udGFsXCI6XCJ2ZXJ0aWNhbFwiO3RoaXMud2F5cG9pbnRzW2VdW3Qua2V5XT10LHRoaXMucmVmcmVzaCgpfSxlLnByb3RvdHlwZS5jaGVja0VtcHR5PWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5BZGFwdGVyLmlzRW1wdHlPYmplY3QodGhpcy53YXlwb2ludHMuaG9yaXpvbnRhbCksZT10aGlzLkFkYXB0ZXIuaXNFbXB0eU9iamVjdCh0aGlzLndheXBvaW50cy52ZXJ0aWNhbCk7dCYmZSYmKHRoaXMuYWRhcHRlci5vZmYoXCIud2F5cG9pbnRzXCIpLGRlbGV0ZSBvW3RoaXMua2V5XSl9LGUucHJvdG90eXBlLmNyZWF0ZVRocm90dGxlZFJlc2l6ZUhhbmRsZXI9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KCl7ZS5oYW5kbGVSZXNpemUoKSxlLmRpZFJlc2l6ZT0hMX12YXIgZT10aGlzO3RoaXMuYWRhcHRlci5vbihcInJlc2l6ZS53YXlwb2ludHNcIixmdW5jdGlvbigpe2UuZGlkUmVzaXplfHwoZS5kaWRSZXNpemU9ITAsbi5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodCkpfSl9LGUucHJvdG90eXBlLmNyZWF0ZVRocm90dGxlZFNjcm9sbEhhbmRsZXI9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KCl7ZS5oYW5kbGVTY3JvbGwoKSxlLmRpZFNjcm9sbD0hMX12YXIgZT10aGlzO3RoaXMuYWRhcHRlci5vbihcInNjcm9sbC53YXlwb2ludHNcIixmdW5jdGlvbigpeyghZS5kaWRTY3JvbGx8fG4uaXNUb3VjaCkmJihlLmRpZFNjcm9sbD0hMCxuLnJlcXVlc3RBbmltYXRpb25GcmFtZSh0KSl9KX0sZS5wcm90b3R5cGUuaGFuZGxlUmVzaXplPWZ1bmN0aW9uKCl7bi5Db250ZXh0LnJlZnJlc2hBbGwoKX0sZS5wcm90b3R5cGUuaGFuZGxlU2Nyb2xsPWZ1bmN0aW9uKCl7dmFyIHQ9e30sZT17aG9yaXpvbnRhbDp7bmV3U2Nyb2xsOnRoaXMuYWRhcHRlci5zY3JvbGxMZWZ0KCksb2xkU2Nyb2xsOnRoaXMub2xkU2Nyb2xsLngsZm9yd2FyZDpcInJpZ2h0XCIsYmFja3dhcmQ6XCJsZWZ0XCJ9LHZlcnRpY2FsOntuZXdTY3JvbGw6dGhpcy5hZGFwdGVyLnNjcm9sbFRvcCgpLG9sZFNjcm9sbDp0aGlzLm9sZFNjcm9sbC55LGZvcndhcmQ6XCJkb3duXCIsYmFja3dhcmQ6XCJ1cFwifX07Zm9yKHZhciBpIGluIGUpe3ZhciBvPWVbaV0sbj1vLm5ld1Njcm9sbD5vLm9sZFNjcm9sbCxyPW4/by5mb3J3YXJkOm8uYmFja3dhcmQ7Zm9yKHZhciBzIGluIHRoaXMud2F5cG9pbnRzW2ldKXt2YXIgYT10aGlzLndheXBvaW50c1tpXVtzXSxsPW8ub2xkU2Nyb2xsPGEudHJpZ2dlclBvaW50LGg9by5uZXdTY3JvbGw+PWEudHJpZ2dlclBvaW50LHA9bCYmaCx1PSFsJiYhaDsocHx8dSkmJihhLnF1ZXVlVHJpZ2dlcihyKSx0W2EuZ3JvdXAuaWRdPWEuZ3JvdXApfX1mb3IodmFyIGMgaW4gdCl0W2NdLmZsdXNoVHJpZ2dlcnMoKTt0aGlzLm9sZFNjcm9sbD17eDplLmhvcml6b250YWwubmV3U2Nyb2xsLHk6ZS52ZXJ0aWNhbC5uZXdTY3JvbGx9fSxlLnByb3RvdHlwZS5pbm5lckhlaWdodD1mdW5jdGlvbigpe3JldHVybiB0aGlzLmVsZW1lbnQ9PXRoaXMuZWxlbWVudC53aW5kb3c/bi52aWV3cG9ydEhlaWdodCgpOnRoaXMuYWRhcHRlci5pbm5lckhlaWdodCgpfSxlLnByb3RvdHlwZS5yZW1vdmU9ZnVuY3Rpb24odCl7ZGVsZXRlIHRoaXMud2F5cG9pbnRzW3QuYXhpc11bdC5rZXldLHRoaXMuY2hlY2tFbXB0eSgpfSxlLnByb3RvdHlwZS5pbm5lcldpZHRoPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZWxlbWVudD09dGhpcy5lbGVtZW50LndpbmRvdz9uLnZpZXdwb3J0V2lkdGgoKTp0aGlzLmFkYXB0ZXIuaW5uZXJXaWR0aCgpfSxlLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dmFyIHQ9W107Zm9yKHZhciBlIGluIHRoaXMud2F5cG9pbnRzKWZvcih2YXIgaSBpbiB0aGlzLndheXBvaW50c1tlXSl0LnB1c2godGhpcy53YXlwb2ludHNbZV1baV0pO2Zvcih2YXIgbz0wLG49dC5sZW5ndGg7bj5vO28rKyl0W29dLmRlc3Ryb3koKX0sZS5wcm90b3R5cGUucmVmcmVzaD1mdW5jdGlvbigpe3ZhciB0LGU9dGhpcy5lbGVtZW50PT10aGlzLmVsZW1lbnQud2luZG93LGk9dGhpcy5hZGFwdGVyLm9mZnNldCgpLG89e307dGhpcy5oYW5kbGVTY3JvbGwoKSx0PXtob3Jpem9udGFsOntjb250ZXh0T2Zmc2V0OmU/MDppLmxlZnQsY29udGV4dFNjcm9sbDplPzA6dGhpcy5vbGRTY3JvbGwueCxjb250ZXh0RGltZW5zaW9uOnRoaXMuaW5uZXJXaWR0aCgpLG9sZFNjcm9sbDp0aGlzLm9sZFNjcm9sbC54LGZvcndhcmQ6XCJyaWdodFwiLGJhY2t3YXJkOlwibGVmdFwiLG9mZnNldFByb3A6XCJsZWZ0XCJ9LHZlcnRpY2FsOntjb250ZXh0T2Zmc2V0OmU/MDppLnRvcCxjb250ZXh0U2Nyb2xsOmU/MDp0aGlzLm9sZFNjcm9sbC55LGNvbnRleHREaW1lbnNpb246dGhpcy5pbm5lckhlaWdodCgpLG9sZFNjcm9sbDp0aGlzLm9sZFNjcm9sbC55LGZvcndhcmQ6XCJkb3duXCIsYmFja3dhcmQ6XCJ1cFwiLG9mZnNldFByb3A6XCJ0b3BcIn19O2Zvcih2YXIgbiBpbiB0KXt2YXIgcj10W25dO2Zvcih2YXIgcyBpbiB0aGlzLndheXBvaW50c1tuXSl7dmFyIGEsbCxoLHAsdSxjPXRoaXMud2F5cG9pbnRzW25dW3NdLGQ9Yy5vcHRpb25zLm9mZnNldCxmPWMudHJpZ2dlclBvaW50LHc9MCx5PW51bGw9PWY7Yy5lbGVtZW50IT09Yy5lbGVtZW50LndpbmRvdyYmKHc9Yy5hZGFwdGVyLm9mZnNldCgpW3Iub2Zmc2V0UHJvcF0pLFwiZnVuY3Rpb25cIj09dHlwZW9mIGQ/ZD1kLmFwcGx5KGMpOlwic3RyaW5nXCI9PXR5cGVvZiBkJiYoZD1wYXJzZUZsb2F0KGQpLGMub3B0aW9ucy5vZmZzZXQuaW5kZXhPZihcIiVcIik+LTEmJihkPU1hdGguY2VpbChyLmNvbnRleHREaW1lbnNpb24qZC8xMDApKSksYT1yLmNvbnRleHRTY3JvbGwtci5jb250ZXh0T2Zmc2V0LGMudHJpZ2dlclBvaW50PXcrYS1kLGw9ZjxyLm9sZFNjcm9sbCxoPWMudHJpZ2dlclBvaW50Pj1yLm9sZFNjcm9sbCxwPWwmJmgsdT0hbCYmIWgsIXkmJnA/KGMucXVldWVUcmlnZ2VyKHIuYmFja3dhcmQpLG9bYy5ncm91cC5pZF09Yy5ncm91cCk6IXkmJnU/KGMucXVldWVUcmlnZ2VyKHIuZm9yd2FyZCksb1tjLmdyb3VwLmlkXT1jLmdyb3VwKTp5JiZyLm9sZFNjcm9sbD49Yy50cmlnZ2VyUG9pbnQmJihjLnF1ZXVlVHJpZ2dlcihyLmZvcndhcmQpLG9bYy5ncm91cC5pZF09Yy5ncm91cCl9fWZvcih2YXIgZyBpbiBvKW9bZ10uZmx1c2hUcmlnZ2VycygpO3JldHVybiB0aGlzfSxlLmZpbmRPckNyZWF0ZUJ5RWxlbWVudD1mdW5jdGlvbih0KXtyZXR1cm4gZS5maW5kQnlFbGVtZW50KHQpfHxuZXcgZSh0KX0sZS5yZWZyZXNoQWxsPWZ1bmN0aW9uKCl7Zm9yKHZhciB0IGluIG8pb1t0XS5yZWZyZXNoKCl9LGUuZmluZEJ5RWxlbWVudD1mdW5jdGlvbih0KXtyZXR1cm4gb1t0LndheXBvaW50Q29udGV4dEtleV19LHdpbmRvdy5vbmxvYWQ9ZnVuY3Rpb24oKXtyJiZyKCksZS5yZWZyZXNoQWxsKCl9LG4ucmVxdWVzdEFuaW1hdGlvbkZyYW1lPWZ1bmN0aW9uKGUpe3ZhciBpPXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHQ7aS5jYWxsKHdpbmRvdyxlKX0sbi5Db250ZXh0PWV9KCksZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiB0KHQsZSl7cmV0dXJuIHQudHJpZ2dlclBvaW50LWUudHJpZ2dlclBvaW50fWZ1bmN0aW9uIGUodCxlKXtyZXR1cm4gZS50cmlnZ2VyUG9pbnQtdC50cmlnZ2VyUG9pbnR9ZnVuY3Rpb24gaSh0KXt0aGlzLm5hbWU9dC5uYW1lLHRoaXMuYXhpcz10LmF4aXMsdGhpcy5pZD10aGlzLm5hbWUrXCItXCIrdGhpcy5heGlzLHRoaXMud2F5cG9pbnRzPVtdLHRoaXMuY2xlYXJUcmlnZ2VyUXVldWVzKCksb1t0aGlzLmF4aXNdW3RoaXMubmFtZV09dGhpc312YXIgbz17dmVydGljYWw6e30saG9yaXpvbnRhbDp7fX0sbj13aW5kb3cuV2F5cG9pbnQ7aS5wcm90b3R5cGUuYWRkPWZ1bmN0aW9uKHQpe3RoaXMud2F5cG9pbnRzLnB1c2godCl9LGkucHJvdG90eXBlLmNsZWFyVHJpZ2dlclF1ZXVlcz1mdW5jdGlvbigpe3RoaXMudHJpZ2dlclF1ZXVlcz17dXA6W10sZG93bjpbXSxsZWZ0OltdLHJpZ2h0OltdfX0saS5wcm90b3R5cGUuZmx1c2hUcmlnZ2Vycz1mdW5jdGlvbigpe2Zvcih2YXIgaSBpbiB0aGlzLnRyaWdnZXJRdWV1ZXMpe3ZhciBvPXRoaXMudHJpZ2dlclF1ZXVlc1tpXSxuPVwidXBcIj09PWl8fFwibGVmdFwiPT09aTtvLnNvcnQobj9lOnQpO2Zvcih2YXIgcj0wLHM9by5sZW5ndGg7cz5yO3IrPTEpe3ZhciBhPW9bcl07KGEub3B0aW9ucy5jb250aW51b3VzfHxyPT09by5sZW5ndGgtMSkmJmEudHJpZ2dlcihbaV0pfX10aGlzLmNsZWFyVHJpZ2dlclF1ZXVlcygpfSxpLnByb3RvdHlwZS5uZXh0PWZ1bmN0aW9uKGUpe3RoaXMud2F5cG9pbnRzLnNvcnQodCk7dmFyIGk9bi5BZGFwdGVyLmluQXJyYXkoZSx0aGlzLndheXBvaW50cyksbz1pPT09dGhpcy53YXlwb2ludHMubGVuZ3RoLTE7cmV0dXJuIG8/bnVsbDp0aGlzLndheXBvaW50c1tpKzFdfSxpLnByb3RvdHlwZS5wcmV2aW91cz1mdW5jdGlvbihlKXt0aGlzLndheXBvaW50cy5zb3J0KHQpO3ZhciBpPW4uQWRhcHRlci5pbkFycmF5KGUsdGhpcy53YXlwb2ludHMpO3JldHVybiBpP3RoaXMud2F5cG9pbnRzW2ktMV06bnVsbH0saS5wcm90b3R5cGUucXVldWVUcmlnZ2VyPWZ1bmN0aW9uKHQsZSl7dGhpcy50cmlnZ2VyUXVldWVzW2VdLnB1c2godCl9LGkucHJvdG90eXBlLnJlbW92ZT1mdW5jdGlvbih0KXt2YXIgZT1uLkFkYXB0ZXIuaW5BcnJheSh0LHRoaXMud2F5cG9pbnRzKTtlPi0xJiZ0aGlzLndheXBvaW50cy5zcGxpY2UoZSwxKX0saS5wcm90b3R5cGUuZmlyc3Q9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy53YXlwb2ludHNbMF19LGkucHJvdG90eXBlLmxhc3Q9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy53YXlwb2ludHNbdGhpcy53YXlwb2ludHMubGVuZ3RoLTFdfSxpLmZpbmRPckNyZWF0ZT1mdW5jdGlvbih0KXtyZXR1cm4gb1t0LmF4aXNdW3QubmFtZV18fG5ldyBpKHQpfSxuLkdyb3VwPWl9KCksZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiB0KHQpe3RoaXMuJGVsZW1lbnQ9ZSh0KX12YXIgZT13aW5kb3cualF1ZXJ5LGk9d2luZG93LldheXBvaW50O2UuZWFjaChbXCJpbm5lckhlaWdodFwiLFwiaW5uZXJXaWR0aFwiLFwib2ZmXCIsXCJvZmZzZXRcIixcIm9uXCIsXCJvdXRlckhlaWdodFwiLFwib3V0ZXJXaWR0aFwiLFwic2Nyb2xsTGVmdFwiLFwic2Nyb2xsVG9wXCJdLGZ1bmN0aW9uKGUsaSl7dC5wcm90b3R5cGVbaV09ZnVuY3Rpb24oKXt2YXIgdD1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO3JldHVybiB0aGlzLiRlbGVtZW50W2ldLmFwcGx5KHRoaXMuJGVsZW1lbnQsdCl9fSksZS5lYWNoKFtcImV4dGVuZFwiLFwiaW5BcnJheVwiLFwiaXNFbXB0eU9iamVjdFwiXSxmdW5jdGlvbihpLG8pe3Rbb109ZVtvXX0pLGkuYWRhcHRlcnMucHVzaCh7bmFtZTpcImpxdWVyeVwiLEFkYXB0ZXI6dH0pLGkuQWRhcHRlcj10fSgpLGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gdCh0KXtyZXR1cm4gZnVuY3Rpb24oKXt2YXIgaT1bXSxvPWFyZ3VtZW50c1swXTtyZXR1cm4gdC5pc0Z1bmN0aW9uKGFyZ3VtZW50c1swXSkmJihvPXQuZXh0ZW5kKHt9LGFyZ3VtZW50c1sxXSksby5oYW5kbGVyPWFyZ3VtZW50c1swXSksdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIG49dC5leHRlbmQoe30sbyx7ZWxlbWVudDp0aGlzfSk7XCJzdHJpbmdcIj09dHlwZW9mIG4uY29udGV4dCYmKG4uY29udGV4dD10KHRoaXMpLmNsb3Nlc3Qobi5jb250ZXh0KVswXSksaS5wdXNoKG5ldyBlKG4pKX0pLGl9fXZhciBlPXdpbmRvdy5XYXlwb2ludDt3aW5kb3cualF1ZXJ5JiYod2luZG93LmpRdWVyeS5mbi53YXlwb2ludD10KHdpbmRvdy5qUXVlcnkpKSx3aW5kb3cuWmVwdG8mJih3aW5kb3cuWmVwdG8uZm4ud2F5cG9pbnQ9dCh3aW5kb3cuWmVwdG8pKX0oKTsiLCIvKiogQWJzdHJhY3QgYmFzZSBjbGFzcyBmb3IgY29sbGVjdGlvbiBwbHVnaW5zIHYxLjAuMS5cblx0V3JpdHRlbiBieSBLZWl0aCBXb29kIChrYndvb2R7YXR9aWluZXQuY29tLmF1KSBEZWNlbWJlciAyMDEzLlxuXHRMaWNlbnNlZCB1bmRlciB0aGUgTUlUIChodHRwOi8va2VpdGgtd29vZC5uYW1lL2xpY2VuY2UuaHRtbCkgbGljZW5zZS4gKi9cbihmdW5jdGlvbigpe3ZhciBqPWZhbHNlO3dpbmRvdy5KUUNsYXNzPWZ1bmN0aW9uKCl7fTtKUUNsYXNzLmNsYXNzZXM9e307SlFDbGFzcy5leHRlbmQ9ZnVuY3Rpb24gZXh0ZW5kZXIoZil7dmFyIGc9dGhpcy5wcm90b3R5cGU7aj10cnVlO3ZhciBoPW5ldyB0aGlzKCk7aj1mYWxzZTtmb3IodmFyIGkgaW4gZil7aFtpXT10eXBlb2YgZltpXT09J2Z1bmN0aW9uJyYmdHlwZW9mIGdbaV09PSdmdW5jdGlvbic/KGZ1bmN0aW9uKGQsZSl7cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIGI9dGhpcy5fc3VwZXI7dGhpcy5fc3VwZXI9ZnVuY3Rpb24oYSl7cmV0dXJuIGdbZF0uYXBwbHkodGhpcyxhfHxbXSl9O3ZhciBjPWUuYXBwbHkodGhpcyxhcmd1bWVudHMpO3RoaXMuX3N1cGVyPWI7cmV0dXJuIGN9fSkoaSxmW2ldKTpmW2ldfWZ1bmN0aW9uIEpRQ2xhc3MoKXtpZighaiYmdGhpcy5faW5pdCl7dGhpcy5faW5pdC5hcHBseSh0aGlzLGFyZ3VtZW50cyl9fUpRQ2xhc3MucHJvdG90eXBlPWg7SlFDbGFzcy5wcm90b3R5cGUuY29uc3RydWN0b3I9SlFDbGFzcztKUUNsYXNzLmV4dGVuZD1leHRlbmRlcjtyZXR1cm4gSlFDbGFzc319KSgpOyhmdW5jdGlvbigkKXtKUUNsYXNzLmNsYXNzZXMuSlFQbHVnaW49SlFDbGFzcy5leHRlbmQoe25hbWU6J3BsdWdpbicsZGVmYXVsdE9wdGlvbnM6e30scmVnaW9uYWxPcHRpb25zOnt9LF9nZXR0ZXJzOltdLF9nZXRNYXJrZXI6ZnVuY3Rpb24oKXtyZXR1cm4naXMtJyt0aGlzLm5hbWV9LF9pbml0OmZ1bmN0aW9uKCl7JC5leHRlbmQodGhpcy5kZWZhdWx0T3B0aW9ucywodGhpcy5yZWdpb25hbE9wdGlvbnMmJnRoaXMucmVnaW9uYWxPcHRpb25zWycnXSl8fHt9KTt2YXIgYz1jYW1lbENhc2UodGhpcy5uYW1lKTskW2NdPXRoaXM7JC5mbltjXT1mdW5jdGlvbihhKXt2YXIgYj1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsMSk7aWYoJFtjXS5faXNOb3RDaGFpbmVkKGEsYikpe3JldHVybiAkW2NdW2FdLmFwcGx5KCRbY10sW3RoaXNbMF1dLmNvbmNhdChiKSl9cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe2lmKHR5cGVvZiBhPT09J3N0cmluZycpe2lmKGFbMF09PT0nXyd8fCEkW2NdW2FdKXt0aHJvdydVbmtub3duIG1ldGhvZDogJythO30kW2NdW2FdLmFwcGx5KCRbY10sW3RoaXNdLmNvbmNhdChiKSl9ZWxzZXskW2NdLl9hdHRhY2godGhpcyxhKX19KX19LHNldERlZmF1bHRzOmZ1bmN0aW9uKGEpeyQuZXh0ZW5kKHRoaXMuZGVmYXVsdE9wdGlvbnMsYXx8e30pfSxfaXNOb3RDaGFpbmVkOmZ1bmN0aW9uKGEsYil7aWYoYT09PSdvcHRpb24nJiYoYi5sZW5ndGg9PT0wfHwoYi5sZW5ndGg9PT0xJiZ0eXBlb2YgYlswXT09PSdzdHJpbmcnKSkpe3JldHVybiB0cnVlfXJldHVybiAkLmluQXJyYXkoYSx0aGlzLl9nZXR0ZXJzKT4tMX0sX2F0dGFjaDpmdW5jdGlvbihhLGIpe2E9JChhKTtpZihhLmhhc0NsYXNzKHRoaXMuX2dldE1hcmtlcigpKSl7cmV0dXJufWEuYWRkQ2xhc3ModGhpcy5fZ2V0TWFya2VyKCkpO2I9JC5leHRlbmQoe30sdGhpcy5kZWZhdWx0T3B0aW9ucyx0aGlzLl9nZXRNZXRhZGF0YShhKSxifHx7fSk7dmFyIGM9JC5leHRlbmQoe25hbWU6dGhpcy5uYW1lLGVsZW06YSxvcHRpb25zOmJ9LHRoaXMuX2luc3RTZXR0aW5ncyhhLGIpKTthLmRhdGEodGhpcy5uYW1lLGMpO3RoaXMuX3Bvc3RBdHRhY2goYSxjKTt0aGlzLm9wdGlvbihhLGIpfSxfaW5zdFNldHRpbmdzOmZ1bmN0aW9uKGEsYil7cmV0dXJue319LF9wb3N0QXR0YWNoOmZ1bmN0aW9uKGEsYil7fSxfZ2V0TWV0YWRhdGE6ZnVuY3Rpb24oZCl7dHJ5e3ZhciBmPWQuZGF0YSh0aGlzLm5hbWUudG9Mb3dlckNhc2UoKSl8fCcnO2Y9Zi5yZXBsYWNlKC8nL2csJ1wiJyk7Zj1mLnJlcGxhY2UoLyhbYS16QS1aMC05XSspOi9nLGZ1bmN0aW9uKGEsYixpKXt2YXIgYz1mLnN1YnN0cmluZygwLGkpLm1hdGNoKC9cIi9nKTtyZXR1cm4oIWN8fGMubGVuZ3RoJTI9PT0wPydcIicrYisnXCI6JzpiKyc6Jyl9KTtmPSQucGFyc2VKU09OKCd7JytmKyd9Jyk7Zm9yKHZhciBnIGluIGYpe3ZhciBoPWZbZ107aWYodHlwZW9mIGg9PT0nc3RyaW5nJyYmaC5tYXRjaCgvXm5ldyBEYXRlXFwoKC4qKVxcKSQvKSl7ZltnXT1ldmFsKGgpfX1yZXR1cm4gZn1jYXRjaChlKXtyZXR1cm57fX19LF9nZXRJbnN0OmZ1bmN0aW9uKGEpe3JldHVybiAkKGEpLmRhdGEodGhpcy5uYW1lKXx8e319LG9wdGlvbjpmdW5jdGlvbihhLGIsYyl7YT0kKGEpO3ZhciBkPWEuZGF0YSh0aGlzLm5hbWUpO2lmKCFifHwodHlwZW9mIGI9PT0nc3RyaW5nJyYmYz09bnVsbCkpe3ZhciBlPShkfHx7fSkub3B0aW9ucztyZXR1cm4oZSYmYj9lW2JdOmUpfWlmKCFhLmhhc0NsYXNzKHRoaXMuX2dldE1hcmtlcigpKSl7cmV0dXJufXZhciBlPWJ8fHt9O2lmKHR5cGVvZiBiPT09J3N0cmluZycpe2U9e307ZVtiXT1jfXRoaXMuX29wdGlvbnNDaGFuZ2VkKGEsZCxlKTskLmV4dGVuZChkLm9wdGlvbnMsZSl9LF9vcHRpb25zQ2hhbmdlZDpmdW5jdGlvbihhLGIsYyl7fSxkZXN0cm95OmZ1bmN0aW9uKGEpe2E9JChhKTtpZighYS5oYXNDbGFzcyh0aGlzLl9nZXRNYXJrZXIoKSkpe3JldHVybn10aGlzLl9wcmVEZXN0cm95KGEsdGhpcy5fZ2V0SW5zdChhKSk7YS5yZW1vdmVEYXRhKHRoaXMubmFtZSkucmVtb3ZlQ2xhc3ModGhpcy5fZ2V0TWFya2VyKCkpfSxfcHJlRGVzdHJveTpmdW5jdGlvbihhLGIpe319KTtmdW5jdGlvbiBjYW1lbENhc2UoYyl7cmV0dXJuIGMucmVwbGFjZSgvLShbYS16XSkvZyxmdW5jdGlvbihhLGIpe3JldHVybiBiLnRvVXBwZXJDYXNlKCl9KX0kLkpRUGx1Z2luPXtjcmVhdGVQbHVnaW46ZnVuY3Rpb24oYSxiKXtpZih0eXBlb2YgYT09PSdvYmplY3QnKXtiPWE7YT0nSlFQbHVnaW4nfWE9Y2FtZWxDYXNlKGEpO3ZhciBjPWNhbWVsQ2FzZShiLm5hbWUpO0pRQ2xhc3MuY2xhc3Nlc1tjXT1KUUNsYXNzLmNsYXNzZXNbYV0uZXh0ZW5kKGIpO25ldyBKUUNsYXNzLmNsYXNzZXNbY10oKX19fSkoalF1ZXJ5KTsiLCIvKiBodHRwOi8va2VpdGgtd29vZC5uYW1lL2NvdW50ZG93bi5odG1sXG4gICBDb3VudGRvd24gZm9yIGpRdWVyeSB2Mi4wLjIuXG4gICBXcml0dGVuIGJ5IEtlaXRoIFdvb2QgKGtid29vZHthdH1paW5ldC5jb20uYXUpIEphbnVhcnkgMjAwOC5cbiAgIEF2YWlsYWJsZSB1bmRlciB0aGUgTUlUIChodHRwOi8va2VpdGgtd29vZC5uYW1lL2xpY2VuY2UuaHRtbCkgbGljZW5zZS4gXG4gICBQbGVhc2UgYXR0cmlidXRlIHRoZSBhdXRob3IgaWYgeW91IHVzZSBpdC4gKi9cbihmdW5jdGlvbigkKXt2YXIgdz0nY291bnRkb3duJzt2YXIgWT0wO3ZhciBPPTE7dmFyIFc9Mjt2YXIgRD0zO3ZhciBIPTQ7dmFyIE09NTt2YXIgUz02OyQuSlFQbHVnaW4uY3JlYXRlUGx1Z2luKHtuYW1lOncsZGVmYXVsdE9wdGlvbnM6e3VudGlsOm51bGwsc2luY2U6bnVsbCx0aW1lem9uZTpudWxsLHNlcnZlclN5bmM6bnVsbCxmb3JtYXQ6J2RITVMnLGxheW91dDonJyxjb21wYWN0OmZhbHNlLHBhZFplcm9lczpmYWxzZSxzaWduaWZpY2FudDowLGRlc2NyaXB0aW9uOicnLGV4cGlyeVVybDonJyxleHBpcnlUZXh0OicnLGFsd2F5c0V4cGlyZTpmYWxzZSxvbkV4cGlyeTpudWxsLG9uVGljazpudWxsLHRpY2tJbnRlcnZhbDoxfSxyZWdpb25hbE9wdGlvbnM6eycnOntsYWJlbHM6WydZZWFycycsJ01vbnRocycsJ1dlZWtzJywnRGF5cycsJ0hvdXJzJywnTWludXRlcycsJ1NlY29uZHMnXSxsYWJlbHMxOlsnWWVhcicsJ01vbnRoJywnV2VlaycsJ0RheScsJ0hvdXInLCdNaW51dGUnLCdTZWNvbmQnXSxjb21wYWN0TGFiZWxzOlsneScsJ20nLCd3JywnZCddLHdoaWNoTGFiZWxzOm51bGwsZGlnaXRzOlsnMCcsJzEnLCcyJywnMycsJzQnLCc1JywnNicsJzcnLCc4JywnOSddLHRpbWVTZXBhcmF0b3I6JzonLGlzUlRMOmZhbHNlfX0sX2dldHRlcnM6WydnZXRUaW1lcyddLF9ydGxDbGFzczp3KyctcnRsJyxfc2VjdGlvbkNsYXNzOncrJy1zZWN0aW9uJyxfYW1vdW50Q2xhc3M6dysnLWFtb3VudCcsX3BlcmlvZENsYXNzOncrJy1wZXJpb2QnLF9yb3dDbGFzczp3Kyctcm93JyxfaG9sZGluZ0NsYXNzOncrJy1ob2xkaW5nJyxfc2hvd0NsYXNzOncrJy1zaG93JyxfZGVzY3JDbGFzczp3KyctZGVzY3InLF90aW1lckVsZW1zOltdLF9pbml0OmZ1bmN0aW9uKCl7dmFyIGM9dGhpczt0aGlzLl9zdXBlcigpO3RoaXMuX3NlcnZlclN5bmNzPVtdO3ZhciBkPSh0eXBlb2YgRGF0ZS5ub3c9PSdmdW5jdGlvbic/RGF0ZS5ub3c6ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCl9KTt2YXIgZT0od2luZG93LnBlcmZvcm1hbmNlJiZ0eXBlb2Ygd2luZG93LnBlcmZvcm1hbmNlLm5vdz09J2Z1bmN0aW9uJyk7ZnVuY3Rpb24gdGltZXJDYWxsQmFjayhhKXt2YXIgYj0oYTwxZTEyPyhlPyhwZXJmb3JtYW5jZS5ub3coKStwZXJmb3JtYW5jZS50aW1pbmcubmF2aWdhdGlvblN0YXJ0KTpkKCkpOmF8fGQoKSk7aWYoYi1nPj0xMDAwKXtjLl91cGRhdGVFbGVtcygpO2c9Yn1mKHRpbWVyQ2FsbEJhY2spfXZhciBmPXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHdpbmRvdy5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lfHx3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fG51bGw7dmFyIGc9MDtpZighZnx8JC5ub1JlcXVlc3RBbmltYXRpb25GcmFtZSl7JC5ub1JlcXVlc3RBbmltYXRpb25GcmFtZT1udWxsO3NldEludGVydmFsKGZ1bmN0aW9uKCl7Yy5fdXBkYXRlRWxlbXMoKX0sOTgwKX1lbHNle2c9d2luZG93LmFuaW1hdGlvblN0YXJ0VGltZXx8d2luZG93LndlYmtpdEFuaW1hdGlvblN0YXJ0VGltZXx8d2luZG93Lm1vekFuaW1hdGlvblN0YXJ0VGltZXx8d2luZG93Lm9BbmltYXRpb25TdGFydFRpbWV8fHdpbmRvdy5tc0FuaW1hdGlvblN0YXJ0VGltZXx8ZCgpO2YodGltZXJDYWxsQmFjayl9fSxVVENEYXRlOmZ1bmN0aW9uKGEsYixjLGUsZixnLGgsaSl7aWYodHlwZW9mIGI9PSdvYmplY3QnJiZiLmNvbnN0cnVjdG9yPT1EYXRlKXtpPWIuZ2V0TWlsbGlzZWNvbmRzKCk7aD1iLmdldFNlY29uZHMoKTtnPWIuZ2V0TWludXRlcygpO2Y9Yi5nZXRIb3VycygpO2U9Yi5nZXREYXRlKCk7Yz1iLmdldE1vbnRoKCk7Yj1iLmdldEZ1bGxZZWFyKCl9dmFyIGQ9bmV3IERhdGUoKTtkLnNldFVUQ0Z1bGxZZWFyKGIpO2Quc2V0VVRDRGF0ZSgxKTtkLnNldFVUQ01vbnRoKGN8fDApO2Quc2V0VVRDRGF0ZShlfHwxKTtkLnNldFVUQ0hvdXJzKGZ8fDApO2Quc2V0VVRDTWludXRlcygoZ3x8MCktKE1hdGguYWJzKGEpPDMwP2EqNjA6YSkpO2Quc2V0VVRDU2Vjb25kcyhofHwwKTtkLnNldFVUQ01pbGxpc2Vjb25kcyhpfHwwKTtyZXR1cm4gZH0scGVyaW9kc1RvU2Vjb25kczpmdW5jdGlvbihhKXtyZXR1cm4gYVswXSozMTU1NzYwMCthWzFdKjI2Mjk4MDArYVsyXSo2MDQ4MDArYVszXSo4NjQwMCthWzRdKjM2MDArYVs1XSo2MCthWzZdfSxyZXN5bmM6ZnVuY3Rpb24oKXt2YXIgZD10aGlzOyQoJy4nK3RoaXMuX2dldE1hcmtlcigpKS5lYWNoKGZ1bmN0aW9uKCl7dmFyIGE9JC5kYXRhKHRoaXMsZC5uYW1lKTtpZihhLm9wdGlvbnMuc2VydmVyU3luYyl7dmFyIGI9bnVsbDtmb3IodmFyIGk9MDtpPGQuX3NlcnZlclN5bmNzLmxlbmd0aDtpKyspe2lmKGQuX3NlcnZlclN5bmNzW2ldWzBdPT1hLm9wdGlvbnMuc2VydmVyU3luYyl7Yj1kLl9zZXJ2ZXJTeW5jc1tpXTticmVha319aWYoYlsyXT09bnVsbCl7dmFyIGM9KCQuaXNGdW5jdGlvbihhLm9wdGlvbnMuc2VydmVyU3luYyk/YS5vcHRpb25zLnNlcnZlclN5bmMuYXBwbHkodGhpcyxbXSk6bnVsbCk7YlsyXT0oYz9uZXcgRGF0ZSgpLmdldFRpbWUoKS1jLmdldFRpbWUoKTowKS1iWzFdfWlmKGEuX3NpbmNlKXthLl9zaW5jZS5zZXRNaWxsaXNlY29uZHMoYS5fc2luY2UuZ2V0TWlsbGlzZWNvbmRzKCkrYlsyXSl9YS5fdW50aWwuc2V0TWlsbGlzZWNvbmRzKGEuX3VudGlsLmdldE1pbGxpc2Vjb25kcygpK2JbMl0pfX0pO2Zvcih2YXIgaT0wO2k8ZC5fc2VydmVyU3luY3MubGVuZ3RoO2krKyl7aWYoZC5fc2VydmVyU3luY3NbaV1bMl0hPW51bGwpe2QuX3NlcnZlclN5bmNzW2ldWzFdKz1kLl9zZXJ2ZXJTeW5jc1tpXVsyXTtkZWxldGUgZC5fc2VydmVyU3luY3NbaV1bMl19fX0sX2luc3RTZXR0aW5nczpmdW5jdGlvbihhLGIpe3JldHVybntfcGVyaW9kczpbMCwwLDAsMCwwLDAsMF19fSxfYWRkRWxlbTpmdW5jdGlvbihhKXtpZighdGhpcy5faGFzRWxlbShhKSl7dGhpcy5fdGltZXJFbGVtcy5wdXNoKGEpfX0sX2hhc0VsZW06ZnVuY3Rpb24oYSl7cmV0dXJuKCQuaW5BcnJheShhLHRoaXMuX3RpbWVyRWxlbXMpPi0xKX0sX3JlbW92ZUVsZW06ZnVuY3Rpb24oYil7dGhpcy5fdGltZXJFbGVtcz0kLm1hcCh0aGlzLl90aW1lckVsZW1zLGZ1bmN0aW9uKGEpe3JldHVybihhPT1iP251bGw6YSl9KX0sX3VwZGF0ZUVsZW1zOmZ1bmN0aW9uKCl7Zm9yKHZhciBpPXRoaXMuX3RpbWVyRWxlbXMubGVuZ3RoLTE7aT49MDtpLS0pe3RoaXMuX3VwZGF0ZUNvdW50ZG93bih0aGlzLl90aW1lckVsZW1zW2ldKX19LF9vcHRpb25zQ2hhbmdlZDpmdW5jdGlvbihhLGIsYyl7aWYoYy5sYXlvdXQpe2MubGF5b3V0PWMubGF5b3V0LnJlcGxhY2UoLyZsdDsvZywnPCcpLnJlcGxhY2UoLyZndDsvZywnPicpfXRoaXMuX3Jlc2V0RXh0cmFMYWJlbHMoYi5vcHRpb25zLGMpO3ZhciBkPShiLm9wdGlvbnMudGltZXpvbmUhPWMudGltZXpvbmUpOyQuZXh0ZW5kKGIub3B0aW9ucyxjKTt0aGlzLl9hZGp1c3RTZXR0aW5ncyhhLGIsYy51bnRpbCE9bnVsbHx8Yy5zaW5jZSE9bnVsbHx8ZCk7dmFyIGU9bmV3IERhdGUoKTtpZigoYi5fc2luY2UmJmIuX3NpbmNlPGUpfHwoYi5fdW50aWwmJmIuX3VudGlsPmUpKXt0aGlzLl9hZGRFbGVtKGFbMF0pfXRoaXMuX3VwZGF0ZUNvdW50ZG93bihhLGIpfSxfdXBkYXRlQ291bnRkb3duOmZ1bmN0aW9uKGEsYil7YT1hLmpxdWVyeT9hOiQoYSk7Yj1ifHx0aGlzLl9nZXRJbnN0KGEpO2lmKCFiKXtyZXR1cm59YS5odG1sKHRoaXMuX2dlbmVyYXRlSFRNTChiKSkudG9nZ2xlQ2xhc3ModGhpcy5fcnRsQ2xhc3MsYi5vcHRpb25zLmlzUlRMKTtpZigkLmlzRnVuY3Rpb24oYi5vcHRpb25zLm9uVGljaykpe3ZhciBjPWIuX2hvbGQhPSdsYXAnP2IuX3BlcmlvZHM6dGhpcy5fY2FsY3VsYXRlUGVyaW9kcyhiLGIuX3Nob3csYi5vcHRpb25zLnNpZ25pZmljYW50LG5ldyBEYXRlKCkpO2lmKGIub3B0aW9ucy50aWNrSW50ZXJ2YWw9PTF8fHRoaXMucGVyaW9kc1RvU2Vjb25kcyhjKSViLm9wdGlvbnMudGlja0ludGVydmFsPT0wKXtiLm9wdGlvbnMub25UaWNrLmFwcGx5KGFbMF0sW2NdKX19dmFyIGQ9Yi5faG9sZCE9J3BhdXNlJyYmKGIuX3NpbmNlP2IuX25vdy5nZXRUaW1lKCk8Yi5fc2luY2UuZ2V0VGltZSgpOmIuX25vdy5nZXRUaW1lKCk+PWIuX3VudGlsLmdldFRpbWUoKSk7aWYoZCYmIWIuX2V4cGlyaW5nKXtiLl9leHBpcmluZz10cnVlO2lmKHRoaXMuX2hhc0VsZW0oYVswXSl8fGIub3B0aW9ucy5hbHdheXNFeHBpcmUpe3RoaXMuX3JlbW92ZUVsZW0oYVswXSk7aWYoJC5pc0Z1bmN0aW9uKGIub3B0aW9ucy5vbkV4cGlyeSkpe2Iub3B0aW9ucy5vbkV4cGlyeS5hcHBseShhWzBdLFtdKX1pZihiLm9wdGlvbnMuZXhwaXJ5VGV4dCl7dmFyIGU9Yi5vcHRpb25zLmxheW91dDtiLm9wdGlvbnMubGF5b3V0PWIub3B0aW9ucy5leHBpcnlUZXh0O3RoaXMuX3VwZGF0ZUNvdW50ZG93bihhWzBdLGIpO2Iub3B0aW9ucy5sYXlvdXQ9ZX1pZihiLm9wdGlvbnMuZXhwaXJ5VXJsKXt3aW5kb3cubG9jYXRpb249Yi5vcHRpb25zLmV4cGlyeVVybH19Yi5fZXhwaXJpbmc9ZmFsc2V9ZWxzZSBpZihiLl9ob2xkPT0ncGF1c2UnKXt0aGlzLl9yZW1vdmVFbGVtKGFbMF0pfX0sX3Jlc2V0RXh0cmFMYWJlbHM6ZnVuY3Rpb24oYSxiKXtmb3IodmFyIG4gaW4gYil7aWYobi5tYXRjaCgvW0xsXWFiZWxzWzAyLTldfGNvbXBhY3RMYWJlbHMxLykpe2Fbbl09YltuXX19Zm9yKHZhciBuIGluIGEpe2lmKG4ubWF0Y2goL1tMbF1hYmVsc1swMi05XXxjb21wYWN0TGFiZWxzMS8pJiZ0eXBlb2YgYltuXT09PSd1bmRlZmluZWQnKXthW25dPW51bGx9fX0sX2FkanVzdFNldHRpbmdzOmZ1bmN0aW9uKGEsYixjKXt2YXIgZD1udWxsO2Zvcih2YXIgaT0wO2k8dGhpcy5fc2VydmVyU3luY3MubGVuZ3RoO2krKyl7aWYodGhpcy5fc2VydmVyU3luY3NbaV1bMF09PWIub3B0aW9ucy5zZXJ2ZXJTeW5jKXtkPXRoaXMuX3NlcnZlclN5bmNzW2ldWzFdO2JyZWFrfX1pZihkIT1udWxsKXt2YXIgZT0oYi5vcHRpb25zLnNlcnZlclN5bmM/ZDowKTt2YXIgZj1uZXcgRGF0ZSgpfWVsc2V7dmFyIGc9KCQuaXNGdW5jdGlvbihiLm9wdGlvbnMuc2VydmVyU3luYyk/Yi5vcHRpb25zLnNlcnZlclN5bmMuYXBwbHkoYVswXSxbXSk6bnVsbCk7dmFyIGY9bmV3IERhdGUoKTt2YXIgZT0oZz9mLmdldFRpbWUoKS1nLmdldFRpbWUoKTowKTt0aGlzLl9zZXJ2ZXJTeW5jcy5wdXNoKFtiLm9wdGlvbnMuc2VydmVyU3luYyxlXSl9dmFyIGg9Yi5vcHRpb25zLnRpbWV6b25lO2g9KGg9PW51bGw/LWYuZ2V0VGltZXpvbmVPZmZzZXQoKTpoKTtpZihjfHwoIWMmJmIuX3VudGlsPT1udWxsJiZiLl9zaW5jZT09bnVsbCkpe2IuX3NpbmNlPWIub3B0aW9ucy5zaW5jZTtpZihiLl9zaW5jZSE9bnVsbCl7Yi5fc2luY2U9dGhpcy5VVENEYXRlKGgsdGhpcy5fZGV0ZXJtaW5lVGltZShiLl9zaW5jZSxudWxsKSk7aWYoYi5fc2luY2UmJmUpe2IuX3NpbmNlLnNldE1pbGxpc2Vjb25kcyhiLl9zaW5jZS5nZXRNaWxsaXNlY29uZHMoKStlKX19Yi5fdW50aWw9dGhpcy5VVENEYXRlKGgsdGhpcy5fZGV0ZXJtaW5lVGltZShiLm9wdGlvbnMudW50aWwsZikpO2lmKGUpe2IuX3VudGlsLnNldE1pbGxpc2Vjb25kcyhiLl91bnRpbC5nZXRNaWxsaXNlY29uZHMoKStlKX19Yi5fc2hvdz10aGlzLl9kZXRlcm1pbmVTaG93KGIpfSxfcHJlRGVzdHJveTpmdW5jdGlvbihhLGIpe3RoaXMuX3JlbW92ZUVsZW0oYVswXSk7YS5lbXB0eSgpfSxwYXVzZTpmdW5jdGlvbihhKXt0aGlzLl9ob2xkKGEsJ3BhdXNlJyl9LGxhcDpmdW5jdGlvbihhKXt0aGlzLl9ob2xkKGEsJ2xhcCcpfSxyZXN1bWU6ZnVuY3Rpb24oYSl7dGhpcy5faG9sZChhLG51bGwpfSx0b2dnbGU6ZnVuY3Rpb24oYSl7dmFyIGI9JC5kYXRhKGEsdGhpcy5uYW1lKXx8e307dGhpc1shYi5faG9sZD8ncGF1c2UnOidyZXN1bWUnXShhKX0sdG9nZ2xlTGFwOmZ1bmN0aW9uKGEpe3ZhciBiPSQuZGF0YShhLHRoaXMubmFtZSl8fHt9O3RoaXNbIWIuX2hvbGQ/J2xhcCc6J3Jlc3VtZSddKGEpfSxfaG9sZDpmdW5jdGlvbihhLGIpe3ZhciBjPSQuZGF0YShhLHRoaXMubmFtZSk7aWYoYyl7aWYoYy5faG9sZD09J3BhdXNlJyYmIWIpe2MuX3BlcmlvZHM9Yy5fc2F2ZVBlcmlvZHM7dmFyIGQ9KGMuX3NpbmNlPyctJzonKycpO2NbYy5fc2luY2U/J19zaW5jZSc6J191bnRpbCddPXRoaXMuX2RldGVybWluZVRpbWUoZCtjLl9wZXJpb2RzWzBdKyd5JytkK2MuX3BlcmlvZHNbMV0rJ28nK2QrYy5fcGVyaW9kc1syXSsndycrZCtjLl9wZXJpb2RzWzNdKydkJytkK2MuX3BlcmlvZHNbNF0rJ2gnK2QrYy5fcGVyaW9kc1s1XSsnbScrZCtjLl9wZXJpb2RzWzZdKydzJyk7dGhpcy5fYWRkRWxlbShhKX1jLl9ob2xkPWI7Yy5fc2F2ZVBlcmlvZHM9KGI9PSdwYXVzZSc/Yy5fcGVyaW9kczpudWxsKTskLmRhdGEoYSx0aGlzLm5hbWUsYyk7dGhpcy5fdXBkYXRlQ291bnRkb3duKGEsYyl9fSxnZXRUaW1lczpmdW5jdGlvbihhKXt2YXIgYj0kLmRhdGEoYSx0aGlzLm5hbWUpO3JldHVybighYj9udWxsOihiLl9ob2xkPT0ncGF1c2UnP2IuX3NhdmVQZXJpb2RzOighYi5faG9sZD9iLl9wZXJpb2RzOnRoaXMuX2NhbGN1bGF0ZVBlcmlvZHMoYixiLl9zaG93LGIub3B0aW9ucy5zaWduaWZpY2FudCxuZXcgRGF0ZSgpKSkpKX0sX2RldGVybWluZVRpbWU6ZnVuY3Rpb24oayxsKXt2YXIgbT10aGlzO3ZhciBuPWZ1bmN0aW9uKGEpe3ZhciBiPW5ldyBEYXRlKCk7Yi5zZXRUaW1lKGIuZ2V0VGltZSgpK2EqMTAwMCk7cmV0dXJuIGJ9O3ZhciBvPWZ1bmN0aW9uKGEpe2E9YS50b0xvd2VyQ2FzZSgpO3ZhciBiPW5ldyBEYXRlKCk7dmFyIGM9Yi5nZXRGdWxsWWVhcigpO3ZhciBkPWIuZ2V0TW9udGgoKTt2YXIgZT1iLmdldERhdGUoKTt2YXIgZj1iLmdldEhvdXJzKCk7dmFyIGc9Yi5nZXRNaW51dGVzKCk7dmFyIGg9Yi5nZXRTZWNvbmRzKCk7dmFyIGk9LyhbKy1dP1swLTldKylcXHMqKHN8bXxofGR8d3xvfHkpPy9nO3ZhciBqPWkuZXhlYyhhKTt3aGlsZShqKXtzd2l0Y2goalsyXXx8J3MnKXtjYXNlJ3MnOmgrPXBhcnNlSW50KGpbMV0sMTApO2JyZWFrO2Nhc2UnbSc6Zys9cGFyc2VJbnQoalsxXSwxMCk7YnJlYWs7Y2FzZSdoJzpmKz1wYXJzZUludChqWzFdLDEwKTticmVhaztjYXNlJ2QnOmUrPXBhcnNlSW50KGpbMV0sMTApO2JyZWFrO2Nhc2Undyc6ZSs9cGFyc2VJbnQoalsxXSwxMCkqNzticmVhaztjYXNlJ28nOmQrPXBhcnNlSW50KGpbMV0sMTApO2U9TWF0aC5taW4oZSxtLl9nZXREYXlzSW5Nb250aChjLGQpKTticmVhaztjYXNlJ3knOmMrPXBhcnNlSW50KGpbMV0sMTApO2U9TWF0aC5taW4oZSxtLl9nZXREYXlzSW5Nb250aChjLGQpKTticmVha31qPWkuZXhlYyhhKX1yZXR1cm4gbmV3IERhdGUoYyxkLGUsZixnLGgsMCl9O3ZhciBwPShrPT1udWxsP2w6KHR5cGVvZiBrPT0nc3RyaW5nJz9vKGspOih0eXBlb2Ygaz09J251bWJlcic/bihrKTprKSkpO2lmKHApcC5zZXRNaWxsaXNlY29uZHMoMCk7cmV0dXJuIHB9LF9nZXREYXlzSW5Nb250aDpmdW5jdGlvbihhLGIpe3JldHVybiAzMi1uZXcgRGF0ZShhLGIsMzIpLmdldERhdGUoKX0sX25vcm1hbExhYmVsczpmdW5jdGlvbihhKXtyZXR1cm4gYX0sX2dlbmVyYXRlSFRNTDpmdW5jdGlvbihjKXt2YXIgZD10aGlzO2MuX3BlcmlvZHM9KGMuX2hvbGQ/Yy5fcGVyaW9kczp0aGlzLl9jYWxjdWxhdGVQZXJpb2RzKGMsYy5fc2hvdyxjLm9wdGlvbnMuc2lnbmlmaWNhbnQsbmV3IERhdGUoKSkpO3ZhciBlPWZhbHNlO3ZhciBmPTA7dmFyIGc9Yy5vcHRpb25zLnNpZ25pZmljYW50O3ZhciBoPSQuZXh0ZW5kKHt9LGMuX3Nob3cpO2Zvcih2YXIgaT1ZO2k8PVM7aSsrKXtlfD0oYy5fc2hvd1tpXT09Jz8nJiZjLl9wZXJpb2RzW2ldPjApO2hbaV09KGMuX3Nob3dbaV09PSc/JyYmIWU/bnVsbDpjLl9zaG93W2ldKTtmKz0oaFtpXT8xOjApO2ctPShjLl9wZXJpb2RzW2ldPjA/MTowKX12YXIgaj1bZmFsc2UsZmFsc2UsZmFsc2UsZmFsc2UsZmFsc2UsZmFsc2UsZmFsc2VdO2Zvcih2YXIgaT1TO2k+PVk7aS0tKXtpZihjLl9zaG93W2ldKXtpZihjLl9wZXJpb2RzW2ldKXtqW2ldPXRydWV9ZWxzZXtqW2ldPWc+MDtnLS19fX12YXIgaz0oYy5vcHRpb25zLmNvbXBhY3Q/Yy5vcHRpb25zLmNvbXBhY3RMYWJlbHM6Yy5vcHRpb25zLmxhYmVscyk7dmFyIGw9Yy5vcHRpb25zLndoaWNoTGFiZWxzfHx0aGlzLl9ub3JtYWxMYWJlbHM7dmFyIG09ZnVuY3Rpb24oYSl7dmFyIGI9Yy5vcHRpb25zWydjb21wYWN0TGFiZWxzJytsKGMuX3BlcmlvZHNbYV0pXTtyZXR1cm4oaFthXT9kLl90cmFuc2xhdGVEaWdpdHMoYyxjLl9wZXJpb2RzW2FdKSsoYj9iW2FdOmtbYV0pKycgJzonJyl9O3ZhciBuPShjLm9wdGlvbnMucGFkWmVyb2VzPzI6MSk7dmFyIG89ZnVuY3Rpb24oYSl7dmFyIGI9Yy5vcHRpb25zWydsYWJlbHMnK2woYy5fcGVyaW9kc1thXSldO3JldHVybigoIWMub3B0aW9ucy5zaWduaWZpY2FudCYmaFthXSl8fChjLm9wdGlvbnMuc2lnbmlmaWNhbnQmJmpbYV0pPyc8c3BhbiBjbGFzcz1cIicrZC5fc2VjdGlvbkNsYXNzKydcIj4nKyc8c3BhbiBjbGFzcz1cIicrZC5fYW1vdW50Q2xhc3MrJ1wiPicrZC5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1thXSxuKSsnPC9zcGFuPicrJzxzcGFuIGNsYXNzPVwiJytkLl9wZXJpb2RDbGFzcysnXCI+JysoYj9iW2FdOmtbYV0pKyc8L3NwYW4+PC9zcGFuPic6JycpfTtyZXR1cm4oYy5vcHRpb25zLmxheW91dD90aGlzLl9idWlsZExheW91dChjLGgsYy5vcHRpb25zLmxheW91dCxjLm9wdGlvbnMuY29tcGFjdCxjLm9wdGlvbnMuc2lnbmlmaWNhbnQsaik6KChjLm9wdGlvbnMuY29tcGFjdD8nPHNwYW4gY2xhc3M9XCInK3RoaXMuX3Jvd0NsYXNzKycgJyt0aGlzLl9hbW91bnRDbGFzcysoYy5faG9sZD8nICcrdGhpcy5faG9sZGluZ0NsYXNzOicnKSsnXCI+JyttKFkpK20oTykrbShXKSttKEQpKyhoW0hdP3RoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbSF0sMik6JycpKyhoW01dPyhoW0hdP2Mub3B0aW9ucy50aW1lU2VwYXJhdG9yOicnKSt0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW01dLDIpOicnKSsoaFtTXT8oaFtIXXx8aFtNXT9jLm9wdGlvbnMudGltZVNlcGFyYXRvcjonJykrdGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tTXSwyKTonJyk6JzxzcGFuIGNsYXNzPVwiJyt0aGlzLl9yb3dDbGFzcysnICcrdGhpcy5fc2hvd0NsYXNzKyhjLm9wdGlvbnMuc2lnbmlmaWNhbnR8fGYpKyhjLl9ob2xkPycgJyt0aGlzLl9ob2xkaW5nQ2xhc3M6JycpKydcIj4nK28oWSkrbyhPKStvKFcpK28oRCkrbyhIKStvKE0pK28oUykpKyc8L3NwYW4+JysoYy5vcHRpb25zLmRlc2NyaXB0aW9uPyc8c3BhbiBjbGFzcz1cIicrdGhpcy5fcm93Q2xhc3MrJyAnK3RoaXMuX2Rlc2NyQ2xhc3MrJ1wiPicrYy5vcHRpb25zLmRlc2NyaXB0aW9uKyc8L3NwYW4+JzonJykpKX0sX2J1aWxkTGF5b3V0OmZ1bmN0aW9uKGMsZCxlLGYsZyxoKXt2YXIgaj1jLm9wdGlvbnNbZj8nY29tcGFjdExhYmVscyc6J2xhYmVscyddO3ZhciBrPWMub3B0aW9ucy53aGljaExhYmVsc3x8dGhpcy5fbm9ybWFsTGFiZWxzO3ZhciBsPWZ1bmN0aW9uKGEpe3JldHVybihjLm9wdGlvbnNbKGY/J2NvbXBhY3RMYWJlbHMnOidsYWJlbHMnKStrKGMuX3BlcmlvZHNbYV0pXXx8ailbYV19O3ZhciBtPWZ1bmN0aW9uKGEsYil7cmV0dXJuIGMub3B0aW9ucy5kaWdpdHNbTWF0aC5mbG9vcihhL2IpJTEwXX07dmFyIG89e2Rlc2M6Yy5vcHRpb25zLmRlc2NyaXB0aW9uLHNlcDpjLm9wdGlvbnMudGltZVNlcGFyYXRvcix5bDpsKFkpLHluOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbWV0sMSkseW5uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbWV0sMikseW5ubjp0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW1ldLDMpLHkxOm0oYy5fcGVyaW9kc1tZXSwxKSx5MTA6bShjLl9wZXJpb2RzW1ldLDEwKSx5MTAwOm0oYy5fcGVyaW9kc1tZXSwxMDApLHkxMDAwOm0oYy5fcGVyaW9kc1tZXSwxMDAwKSxvbDpsKE8pLG9uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbT10sMSksb25uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbT10sMiksb25ubjp0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW09dLDMpLG8xOm0oYy5fcGVyaW9kc1tPXSwxKSxvMTA6bShjLl9wZXJpb2RzW09dLDEwKSxvMTAwOm0oYy5fcGVyaW9kc1tPXSwxMDApLG8xMDAwOm0oYy5fcGVyaW9kc1tPXSwxMDAwKSx3bDpsKFcpLHduOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbV10sMSksd25uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbV10sMiksd25ubjp0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW1ddLDMpLHcxOm0oYy5fcGVyaW9kc1tXXSwxKSx3MTA6bShjLl9wZXJpb2RzW1ddLDEwKSx3MTAwOm0oYy5fcGVyaW9kc1tXXSwxMDApLHcxMDAwOm0oYy5fcGVyaW9kc1tXXSwxMDAwKSxkbDpsKEQpLGRuOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbRF0sMSksZG5uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbRF0sMiksZG5ubjp0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW0RdLDMpLGQxOm0oYy5fcGVyaW9kc1tEXSwxKSxkMTA6bShjLl9wZXJpb2RzW0RdLDEwKSxkMTAwOm0oYy5fcGVyaW9kc1tEXSwxMDApLGQxMDAwOm0oYy5fcGVyaW9kc1tEXSwxMDAwKSxobDpsKEgpLGhuOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbSF0sMSksaG5uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbSF0sMiksaG5ubjp0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW0hdLDMpLGgxOm0oYy5fcGVyaW9kc1tIXSwxKSxoMTA6bShjLl9wZXJpb2RzW0hdLDEwKSxoMTAwOm0oYy5fcGVyaW9kc1tIXSwxMDApLGgxMDAwOm0oYy5fcGVyaW9kc1tIXSwxMDAwKSxtbDpsKE0pLG1uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbTV0sMSksbW5uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbTV0sMiksbW5ubjp0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW01dLDMpLG0xOm0oYy5fcGVyaW9kc1tNXSwxKSxtMTA6bShjLl9wZXJpb2RzW01dLDEwKSxtMTAwOm0oYy5fcGVyaW9kc1tNXSwxMDApLG0xMDAwOm0oYy5fcGVyaW9kc1tNXSwxMDAwKSxzbDpsKFMpLHNuOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbU10sMSksc25uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbU10sMiksc25ubjp0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW1NdLDMpLHMxOm0oYy5fcGVyaW9kc1tTXSwxKSxzMTA6bShjLl9wZXJpb2RzW1NdLDEwKSxzMTAwOm0oYy5fcGVyaW9kc1tTXSwxMDApLHMxMDAwOm0oYy5fcGVyaW9kc1tTXSwxMDAwKX07dmFyIHA9ZTtmb3IodmFyIGk9WTtpPD1TO2krKyl7dmFyIHE9J3lvd2RobXMnLmNoYXJBdChpKTt2YXIgcj1uZXcgUmVnRXhwKCdcXFxceycrcSsnPFxcXFx9KFtcXFxcc1xcXFxTXSopXFxcXHsnK3ErJz5cXFxcfScsJ2cnKTtwPXAucmVwbGFjZShyLCgoIWcmJmRbaV0pfHwoZyYmaFtpXSk/JyQxJzonJykpfSQuZWFjaChvLGZ1bmN0aW9uKG4sdil7dmFyIGE9bmV3IFJlZ0V4cCgnXFxcXHsnK24rJ1xcXFx9JywnZycpO3A9cC5yZXBsYWNlKGEsdil9KTtyZXR1cm4gcH0sX21pbkRpZ2l0czpmdW5jdGlvbihhLGIsYyl7Yj0nJytiO2lmKGIubGVuZ3RoPj1jKXtyZXR1cm4gdGhpcy5fdHJhbnNsYXRlRGlnaXRzKGEsYil9Yj0nMDAwMDAwMDAwMCcrYjtyZXR1cm4gdGhpcy5fdHJhbnNsYXRlRGlnaXRzKGEsYi5zdWJzdHIoYi5sZW5ndGgtYykpfSxfdHJhbnNsYXRlRGlnaXRzOmZ1bmN0aW9uKGIsYyl7cmV0dXJuKCcnK2MpLnJlcGxhY2UoL1swLTldL2csZnVuY3Rpb24oYSl7cmV0dXJuIGIub3B0aW9ucy5kaWdpdHNbYV19KX0sX2RldGVybWluZVNob3c6ZnVuY3Rpb24oYSl7dmFyIGI9YS5vcHRpb25zLmZvcm1hdDt2YXIgYz1bXTtjW1ldPShiLm1hdGNoKCd5Jyk/Jz8nOihiLm1hdGNoKCdZJyk/JyEnOm51bGwpKTtjW09dPShiLm1hdGNoKCdvJyk/Jz8nOihiLm1hdGNoKCdPJyk/JyEnOm51bGwpKTtjW1ddPShiLm1hdGNoKCd3Jyk/Jz8nOihiLm1hdGNoKCdXJyk/JyEnOm51bGwpKTtjW0RdPShiLm1hdGNoKCdkJyk/Jz8nOihiLm1hdGNoKCdEJyk/JyEnOm51bGwpKTtjW0hdPShiLm1hdGNoKCdoJyk/Jz8nOihiLm1hdGNoKCdIJyk/JyEnOm51bGwpKTtjW01dPShiLm1hdGNoKCdtJyk/Jz8nOihiLm1hdGNoKCdNJyk/JyEnOm51bGwpKTtjW1NdPShiLm1hdGNoKCdzJyk/Jz8nOihiLm1hdGNoKCdTJyk/JyEnOm51bGwpKTtyZXR1cm4gY30sX2NhbGN1bGF0ZVBlcmlvZHM6ZnVuY3Rpb24oYyxkLGUsZil7Yy5fbm93PWY7Yy5fbm93LnNldE1pbGxpc2Vjb25kcygwKTt2YXIgZz1uZXcgRGF0ZShjLl9ub3cuZ2V0VGltZSgpKTtpZihjLl9zaW5jZSl7aWYoZi5nZXRUaW1lKCk8Yy5fc2luY2UuZ2V0VGltZSgpKXtjLl9ub3c9Zj1nfWVsc2V7Zj1jLl9zaW5jZX19ZWxzZXtnLnNldFRpbWUoYy5fdW50aWwuZ2V0VGltZSgpKTtpZihmLmdldFRpbWUoKT5jLl91bnRpbC5nZXRUaW1lKCkpe2MuX25vdz1mPWd9fXZhciBoPVswLDAsMCwwLDAsMCwwXTtpZihkW1ldfHxkW09dKXt2YXIgaT10aGlzLl9nZXREYXlzSW5Nb250aChmLmdldEZ1bGxZZWFyKCksZi5nZXRNb250aCgpKTt2YXIgaj10aGlzLl9nZXREYXlzSW5Nb250aChnLmdldEZ1bGxZZWFyKCksZy5nZXRNb250aCgpKTt2YXIgaz0oZy5nZXREYXRlKCk9PWYuZ2V0RGF0ZSgpfHwoZy5nZXREYXRlKCk+PU1hdGgubWluKGksaikmJmYuZ2V0RGF0ZSgpPj1NYXRoLm1pbihpLGopKSk7dmFyIGw9ZnVuY3Rpb24oYSl7cmV0dXJuKGEuZ2V0SG91cnMoKSo2MCthLmdldE1pbnV0ZXMoKSkqNjArYS5nZXRTZWNvbmRzKCl9O3ZhciBtPU1hdGgubWF4KDAsKGcuZ2V0RnVsbFllYXIoKS1mLmdldEZ1bGxZZWFyKCkpKjEyK2cuZ2V0TW9udGgoKS1mLmdldE1vbnRoKCkrKChnLmdldERhdGUoKTxmLmdldERhdGUoKSYmIWspfHwoayYmbChnKTxsKGYpKT8tMTowKSk7aFtZXT0oZFtZXT9NYXRoLmZsb29yKG0vMTIpOjApO2hbT109KGRbT10/bS1oW1ldKjEyOjApO2Y9bmV3IERhdGUoZi5nZXRUaW1lKCkpO3ZhciBuPShmLmdldERhdGUoKT09aSk7dmFyIG89dGhpcy5fZ2V0RGF5c0luTW9udGgoZi5nZXRGdWxsWWVhcigpK2hbWV0sZi5nZXRNb250aCgpK2hbT10pO2lmKGYuZ2V0RGF0ZSgpPm8pe2Yuc2V0RGF0ZShvKX1mLnNldEZ1bGxZZWFyKGYuZ2V0RnVsbFllYXIoKStoW1ldKTtmLnNldE1vbnRoKGYuZ2V0TW9udGgoKStoW09dKTtpZihuKXtmLnNldERhdGUobyl9fXZhciBwPU1hdGguZmxvb3IoKGcuZ2V0VGltZSgpLWYuZ2V0VGltZSgpKS8xMDAwKTt2YXIgcT1mdW5jdGlvbihhLGIpe2hbYV09KGRbYV0/TWF0aC5mbG9vcihwL2IpOjApO3AtPWhbYV0qYn07cShXLDYwNDgwMCk7cShELDg2NDAwKTtxKEgsMzYwMCk7cShNLDYwKTtxKFMsMSk7aWYocD4wJiYhYy5fc2luY2Upe3ZhciByPVsxLDEyLDQuMzQ4Miw3LDI0LDYwLDYwXTt2YXIgcz1TO3ZhciB0PTE7Zm9yKHZhciB1PVM7dT49WTt1LS0pe2lmKGRbdV0pe2lmKGhbc10+PXQpe2hbc109MDtwPTF9aWYocD4wKXtoW3VdKys7cD0wO3M9dTt0PTF9fXQqPXJbdV19fWlmKGUpe2Zvcih2YXIgdT1ZO3U8PVM7dSsrKXtpZihlJiZoW3VdKXtlLS19ZWxzZSBpZighZSl7aFt1XT0wfX19cmV0dXJuIGh9fSl9KShqUXVlcnkpOyIsIiFmdW5jdGlvbihhLGIpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW1wianF1ZXJ5XCJdLGIpOlwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP21vZHVsZS5leHBvcnRzPWIocmVxdWlyZShcImpxdWVyeVwiKSk6YihhLmpRdWVyeSl9KHRoaXMsZnVuY3Rpb24oYSl7XCJmdW5jdGlvblwiIT10eXBlb2YgT2JqZWN0LmNyZWF0ZSYmKE9iamVjdC5jcmVhdGU9ZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYigpe31yZXR1cm4gYi5wcm90b3R5cGU9YSxuZXcgYn0pO3ZhciBiPXtpbml0OmZ1bmN0aW9uKGIpe3JldHVybiB0aGlzLm9wdGlvbnM9YS5leHRlbmQoe30sYS5ub3R5LmRlZmF1bHRzLGIpLHRoaXMub3B0aW9ucy5sYXlvdXQ9dGhpcy5vcHRpb25zLmN1c3RvbT9hLm5vdHkubGF5b3V0cy5pbmxpbmU6YS5ub3R5LmxheW91dHNbdGhpcy5vcHRpb25zLmxheW91dF0sYS5ub3R5LnRoZW1lc1t0aGlzLm9wdGlvbnMudGhlbWVdP3RoaXMub3B0aW9ucy50aGVtZT1hLm5vdHkudGhlbWVzW3RoaXMub3B0aW9ucy50aGVtZV06dGhpcy5vcHRpb25zLnRoZW1lQ2xhc3NOYW1lPXRoaXMub3B0aW9ucy50aGVtZSx0aGlzLm9wdGlvbnM9YS5leHRlbmQoe30sdGhpcy5vcHRpb25zLHRoaXMub3B0aW9ucy5sYXlvdXQub3B0aW9ucyksdGhpcy5vcHRpb25zLmlkPVwibm90eV9cIisobmV3IERhdGUpLmdldFRpbWUoKSpNYXRoLmZsb29yKDFlNipNYXRoLnJhbmRvbSgpKSx0aGlzLl9idWlsZCgpLHRoaXN9LF9idWlsZDpmdW5jdGlvbigpe3ZhciBiPWEoJzxkaXYgY2xhc3M9XCJub3R5X2JhciBub3R5X3R5cGVfJyt0aGlzLm9wdGlvbnMudHlwZSsnXCI+PC9kaXY+JykuYXR0cihcImlkXCIsdGhpcy5vcHRpb25zLmlkKTtpZihiLmFwcGVuZCh0aGlzLm9wdGlvbnMudGVtcGxhdGUpLmZpbmQoXCIubm90eV90ZXh0XCIpLmh0bWwodGhpcy5vcHRpb25zLnRleHQpLHRoaXMuJGJhcj1udWxsIT09dGhpcy5vcHRpb25zLmxheW91dC5wYXJlbnQub2JqZWN0P2EodGhpcy5vcHRpb25zLmxheW91dC5wYXJlbnQub2JqZWN0KS5jc3ModGhpcy5vcHRpb25zLmxheW91dC5wYXJlbnQuY3NzKS5hcHBlbmQoYik6Yix0aGlzLm9wdGlvbnMudGhlbWVDbGFzc05hbWUmJnRoaXMuJGJhci5hZGRDbGFzcyh0aGlzLm9wdGlvbnMudGhlbWVDbGFzc05hbWUpLmFkZENsYXNzKFwibm90eV9jb250YWluZXJfdHlwZV9cIit0aGlzLm9wdGlvbnMudHlwZSksdGhpcy5vcHRpb25zLmJ1dHRvbnMpe3RoaXMub3B0aW9ucy5jbG9zZVdpdGg9W10sdGhpcy5vcHRpb25zLnRpbWVvdXQ9ITE7dmFyIGM9YShcIjxkaXYvPlwiKS5hZGRDbGFzcyhcIm5vdHlfYnV0dG9uc1wiKTtudWxsIT09dGhpcy5vcHRpb25zLmxheW91dC5wYXJlbnQub2JqZWN0P3RoaXMuJGJhci5maW5kKFwiLm5vdHlfYmFyXCIpLmFwcGVuZChjKTp0aGlzLiRiYXIuYXBwZW5kKGMpO3ZhciBkPXRoaXM7YS5lYWNoKHRoaXMub3B0aW9ucy5idXR0b25zLGZ1bmN0aW9uKGIsYyl7dmFyIGU9YShcIjxidXR0b24vPlwiKS5hZGRDbGFzcyhjLmFkZENsYXNzP2MuYWRkQ2xhc3M6XCJncmF5XCIpLmh0bWwoYy50ZXh0KS5hdHRyKFwiaWRcIixjLmlkP2MuaWQ6XCJidXR0b24tXCIrYikuYXR0cihcInRpdGxlXCIsYy50aXRsZSkuYXBwZW5kVG8oZC4kYmFyLmZpbmQoXCIubm90eV9idXR0b25zXCIpKS5vbihcImNsaWNrXCIsZnVuY3Rpb24oYil7YS5pc0Z1bmN0aW9uKGMub25DbGljaykmJmMub25DbGljay5jYWxsKGUsZCxiKX0pfSl9dGhpcy4kbWVzc2FnZT10aGlzLiRiYXIuZmluZChcIi5ub3R5X21lc3NhZ2VcIiksdGhpcy4kY2xvc2VCdXR0b249dGhpcy4kYmFyLmZpbmQoXCIubm90eV9jbG9zZVwiKSx0aGlzLiRidXR0b25zPXRoaXMuJGJhci5maW5kKFwiLm5vdHlfYnV0dG9uc1wiKSxhLm5vdHkuc3RvcmVbdGhpcy5vcHRpb25zLmlkXT10aGlzfSxzaG93OmZ1bmN0aW9uKCl7dmFyIGI9dGhpcztyZXR1cm4gYi5vcHRpb25zLmN1c3RvbT9iLm9wdGlvbnMuY3VzdG9tLmZpbmQoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmFwcGVuZChiLiRiYXIpOmEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmFwcGVuZChiLiRiYXIpLGIub3B0aW9ucy50aGVtZSYmYi5vcHRpb25zLnRoZW1lLnN0eWxlJiZiLm9wdGlvbnMudGhlbWUuc3R5bGUuYXBwbHkoYiksXCJmdW5jdGlvblwiPT09YS50eXBlKGIub3B0aW9ucy5sYXlvdXQuY3NzKT90aGlzLm9wdGlvbnMubGF5b3V0LmNzcy5hcHBseShiLiRiYXIpOmIuJGJhci5jc3ModGhpcy5vcHRpb25zLmxheW91dC5jc3N8fHt9KSxiLiRiYXIuYWRkQ2xhc3MoYi5vcHRpb25zLmxheW91dC5hZGRDbGFzcyksYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc3R5bGUuYXBwbHkoYShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvciksW2Iub3B0aW9ucy53aXRoaW5dKSxiLnNob3dpbmc9ITAsYi5vcHRpb25zLnRoZW1lJiZiLm9wdGlvbnMudGhlbWUuc3R5bGUmJmIub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vblNob3cuYXBwbHkodGhpcyksYS5pbkFycmF5KFwiY2xpY2tcIixiLm9wdGlvbnMuY2xvc2VXaXRoKT4tMSYmYi4kYmFyLmNzcyhcImN1cnNvclwiLFwicG9pbnRlclwiKS5vbmUoXCJjbGlja1wiLGZ1bmN0aW9uKGEpe2Iuc3RvcFByb3BhZ2F0aW9uKGEpLGIub3B0aW9ucy5jYWxsYmFjay5vbkNsb3NlQ2xpY2smJmIub3B0aW9ucy5jYWxsYmFjay5vbkNsb3NlQ2xpY2suYXBwbHkoYiksYi5jbG9zZSgpfSksYS5pbkFycmF5KFwiaG92ZXJcIixiLm9wdGlvbnMuY2xvc2VXaXRoKT4tMSYmYi4kYmFyLm9uZShcIm1vdXNlZW50ZXJcIixmdW5jdGlvbigpe2IuY2xvc2UoKX0pLGEuaW5BcnJheShcImJ1dHRvblwiLGIub3B0aW9ucy5jbG9zZVdpdGgpPi0xJiZiLiRjbG9zZUJ1dHRvbi5vbmUoXCJjbGlja1wiLGZ1bmN0aW9uKGEpe2Iuc3RvcFByb3BhZ2F0aW9uKGEpLGIuY2xvc2UoKX0pLC0xPT1hLmluQXJyYXkoXCJidXR0b25cIixiLm9wdGlvbnMuY2xvc2VXaXRoKSYmYi4kY2xvc2VCdXR0b24ucmVtb3ZlKCksYi5vcHRpb25zLmNhbGxiYWNrLm9uU2hvdyYmYi5vcHRpb25zLmNhbGxiYWNrLm9uU2hvdy5hcHBseShiKSxcInN0cmluZ1wiPT10eXBlb2YgYi5vcHRpb25zLmFuaW1hdGlvbi5vcGVuPyhiLiRiYXIuY3NzKFwiaGVpZ2h0XCIsYi4kYmFyLmlubmVySGVpZ2h0KCkpLGIuJGJhci5vbihcImNsaWNrXCIsZnVuY3Rpb24oYSl7Yi53YXNDbGlja2VkPSEwfSksYi4kYmFyLnNob3coKS5hZGRDbGFzcyhiLm9wdGlvbnMuYW5pbWF0aW9uLm9wZW4pLm9uZShcIndlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmRcIixmdW5jdGlvbigpe2Iub3B0aW9ucy5jYWxsYmFjay5hZnRlclNob3cmJmIub3B0aW9ucy5jYWxsYmFjay5hZnRlclNob3cuYXBwbHkoYiksYi5zaG93aW5nPSExLGIuc2hvd249ITAsYi5oYXNPd25Qcm9wZXJ0eShcIndhc0NsaWNrZWRcIikmJihiLiRiYXIub2ZmKFwiY2xpY2tcIixmdW5jdGlvbihhKXtiLndhc0NsaWNrZWQ9ITB9KSxiLmNsb3NlKCkpfSkpOmIuJGJhci5hbmltYXRlKGIub3B0aW9ucy5hbmltYXRpb24ub3BlbixiLm9wdGlvbnMuYW5pbWF0aW9uLnNwZWVkLGIub3B0aW9ucy5hbmltYXRpb24uZWFzaW5nLGZ1bmN0aW9uKCl7Yi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyU2hvdyYmYi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyU2hvdy5hcHBseShiKSxiLnNob3dpbmc9ITEsYi5zaG93bj0hMH0pLGIub3B0aW9ucy50aW1lb3V0JiZiLiRiYXIuZGVsYXkoYi5vcHRpb25zLnRpbWVvdXQpLnByb21pc2UoKS5kb25lKGZ1bmN0aW9uKCl7Yi5jbG9zZSgpfSksdGhpc30sY2xvc2U6ZnVuY3Rpb24oKXtpZighKHRoaXMuY2xvc2VkfHx0aGlzLiRiYXImJnRoaXMuJGJhci5oYXNDbGFzcyhcImktYW0tY2xvc2luZy1ub3dcIikpKXt2YXIgYj10aGlzO2lmKHRoaXMuc2hvd2luZylyZXR1cm4gdm9pZCBiLiRiYXIucXVldWUoZnVuY3Rpb24oKXtiLmNsb3NlLmFwcGx5KGIpfSk7aWYoIXRoaXMuc2hvd24mJiF0aGlzLnNob3dpbmcpe3ZhciBjPVtdO3JldHVybiBhLmVhY2goYS5ub3R5LnF1ZXVlLGZ1bmN0aW9uKGEsZCl7ZC5vcHRpb25zLmlkIT1iLm9wdGlvbnMuaWQmJmMucHVzaChkKX0pLHZvaWQoYS5ub3R5LnF1ZXVlPWMpfWIuJGJhci5hZGRDbGFzcyhcImktYW0tY2xvc2luZy1ub3dcIiksYi5vcHRpb25zLmNhbGxiYWNrLm9uQ2xvc2UmJmIub3B0aW9ucy5jYWxsYmFjay5vbkNsb3NlLmFwcGx5KGIpLFwic3RyaW5nXCI9PXR5cGVvZiBiLm9wdGlvbnMuYW5pbWF0aW9uLmNsb3NlP2IuJGJhci5hZGRDbGFzcyhiLm9wdGlvbnMuYW5pbWF0aW9uLmNsb3NlKS5vbmUoXCJ3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kXCIsZnVuY3Rpb24oKXtiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJDbG9zZSYmYi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyQ2xvc2UuYXBwbHkoYiksYi5jbG9zZUNsZWFuVXAoKX0pOmIuJGJhci5jbGVhclF1ZXVlKCkuc3RvcCgpLmFuaW1hdGUoYi5vcHRpb25zLmFuaW1hdGlvbi5jbG9zZSxiLm9wdGlvbnMuYW5pbWF0aW9uLnNwZWVkLGIub3B0aW9ucy5hbmltYXRpb24uZWFzaW5nLGZ1bmN0aW9uKCl7Yi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyQ2xvc2UmJmIub3B0aW9ucy5jYWxsYmFjay5hZnRlckNsb3NlLmFwcGx5KGIpfSkucHJvbWlzZSgpLmRvbmUoZnVuY3Rpb24oKXtiLmNsb3NlQ2xlYW5VcCgpfSl9fSxjbG9zZUNsZWFuVXA6ZnVuY3Rpb24oKXt2YXIgYj10aGlzO2Iub3B0aW9ucy5tb2RhbCYmKGEubm90eVJlbmRlcmVyLnNldE1vZGFsQ291bnQoLTEpLDA9PWEubm90eVJlbmRlcmVyLmdldE1vZGFsQ291bnQoKSYmYShcIi5ub3R5X21vZGFsXCIpLmZhZGVPdXQoYi5vcHRpb25zLmFuaW1hdGlvbi5mYWRlU3BlZWQsZnVuY3Rpb24oKXthKHRoaXMpLnJlbW92ZSgpfSkpLGEubm90eVJlbmRlcmVyLnNldExheW91dENvdW50Rm9yKGIsLTEpLDA9PWEubm90eVJlbmRlcmVyLmdldExheW91dENvdW50Rm9yKGIpJiZhKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5yZW1vdmUoKSxcInVuZGVmaW5lZFwiIT10eXBlb2YgYi4kYmFyJiZudWxsIT09Yi4kYmFyJiYoXCJzdHJpbmdcIj09dHlwZW9mIGIub3B0aW9ucy5hbmltYXRpb24uY2xvc2U/KGIuJGJhci5jc3MoXCJ0cmFuc2l0aW9uXCIsXCJhbGwgMTAwbXMgZWFzZVwiKS5jc3MoXCJib3JkZXJcIiwwKS5jc3MoXCJtYXJnaW5cIiwwKS5oZWlnaHQoMCksYi4kYmFyLm9uZShcInRyYW5zaXRpb25lbmQgd2Via2l0VHJhbnNpdGlvbkVuZCBvVHJhbnNpdGlvbkVuZCBNU1RyYW5zaXRpb25FbmRcIixmdW5jdGlvbigpe2IuJGJhci5yZW1vdmUoKSxiLiRiYXI9bnVsbCxiLmNsb3NlZD0hMCxiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2smJmIub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vbkNsb3NlJiZiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2sub25DbG9zZS5hcHBseShiKX0pKTooYi4kYmFyLnJlbW92ZSgpLGIuJGJhcj1udWxsLGIuY2xvc2VkPSEwKSksZGVsZXRlIGEubm90eS5zdG9yZVtiLm9wdGlvbnMuaWRdLGIub3B0aW9ucy50aGVtZS5jYWxsYmFjayYmYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrLm9uQ2xvc2UmJmIub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vbkNsb3NlLmFwcGx5KGIpLGIub3B0aW9ucy5kaXNtaXNzUXVldWV8fChhLm5vdHkub250YXA9ITAsYS5ub3R5UmVuZGVyZXIucmVuZGVyKCkpLGIub3B0aW9ucy5tYXhWaXNpYmxlPjAmJmIub3B0aW9ucy5kaXNtaXNzUXVldWUmJmEubm90eVJlbmRlcmVyLnJlbmRlcigpfSxzZXRUZXh0OmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLmNsb3NlZHx8KHRoaXMub3B0aW9ucy50ZXh0PWEsdGhpcy4kYmFyLmZpbmQoXCIubm90eV90ZXh0XCIpLmh0bWwoYSkpLHRoaXN9LHNldFR5cGU6ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuY2xvc2VkfHwodGhpcy5vcHRpb25zLnR5cGU9YSx0aGlzLm9wdGlvbnMudGhlbWUuc3R5bGUuYXBwbHkodGhpcyksdGhpcy5vcHRpb25zLnRoZW1lLmNhbGxiYWNrLm9uU2hvdy5hcHBseSh0aGlzKSksdGhpc30sc2V0VGltZW91dDpmdW5jdGlvbihhKXtpZighdGhpcy5jbG9zZWQpe3ZhciBiPXRoaXM7dGhpcy5vcHRpb25zLnRpbWVvdXQ9YSxiLiRiYXIuZGVsYXkoYi5vcHRpb25zLnRpbWVvdXQpLnByb21pc2UoKS5kb25lKGZ1bmN0aW9uKCl7Yi5jbG9zZSgpfSl9cmV0dXJuIHRoaXN9LHN0b3BQcm9wYWdhdGlvbjpmdW5jdGlvbihhKXthPWF8fHdpbmRvdy5ldmVudCxcInVuZGVmaW5lZFwiIT10eXBlb2YgYS5zdG9wUHJvcGFnYXRpb24/YS5zdG9wUHJvcGFnYXRpb24oKTphLmNhbmNlbEJ1YmJsZT0hMH0sY2xvc2VkOiExLHNob3dpbmc6ITEsc2hvd246ITF9O2Eubm90eVJlbmRlcmVyPXt9LGEubm90eVJlbmRlcmVyLmluaXQ9ZnVuY3Rpb24oYyl7dmFyIGQ9T2JqZWN0LmNyZWF0ZShiKS5pbml0KGMpO3JldHVybiBkLm9wdGlvbnMua2lsbGVyJiZhLm5vdHkuY2xvc2VBbGwoKSxkLm9wdGlvbnMuZm9yY2U/YS5ub3R5LnF1ZXVlLnVuc2hpZnQoZCk6YS5ub3R5LnF1ZXVlLnB1c2goZCksYS5ub3R5UmVuZGVyZXIucmVuZGVyKCksXCJvYmplY3RcIj09YS5ub3R5LnJldHVybnM/ZDpkLm9wdGlvbnMuaWR9LGEubm90eVJlbmRlcmVyLnJlbmRlcj1mdW5jdGlvbigpe3ZhciBiPWEubm90eS5xdWV1ZVswXTtcIm9iamVjdFwiPT09YS50eXBlKGIpP2Iub3B0aW9ucy5kaXNtaXNzUXVldWU/Yi5vcHRpb25zLm1heFZpc2libGU+MD9hKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yK1wiID4gbGlcIikubGVuZ3RoPGIub3B0aW9ucy5tYXhWaXNpYmxlJiZhLm5vdHlSZW5kZXJlci5zaG93KGEubm90eS5xdWV1ZS5zaGlmdCgpKTphLm5vdHlSZW5kZXJlci5zaG93KGEubm90eS5xdWV1ZS5zaGlmdCgpKTphLm5vdHkub250YXAmJihhLm5vdHlSZW5kZXJlci5zaG93KGEubm90eS5xdWV1ZS5zaGlmdCgpKSxhLm5vdHkub250YXA9ITEpOmEubm90eS5vbnRhcD0hMH0sYS5ub3R5UmVuZGVyZXIuc2hvdz1mdW5jdGlvbihiKXtiLm9wdGlvbnMubW9kYWwmJihhLm5vdHlSZW5kZXJlci5jcmVhdGVNb2RhbEZvcihiKSxhLm5vdHlSZW5kZXJlci5zZXRNb2RhbENvdW50KDEpKSxiLm9wdGlvbnMuY3VzdG9tPzA9PWIub3B0aW9ucy5jdXN0b20uZmluZChiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikubGVuZ3RoP2Iub3B0aW9ucy5jdXN0b20uYXBwZW5kKGEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIub2JqZWN0KS5hZGRDbGFzcyhcImktYW0tbmV3XCIpKTpiLm9wdGlvbnMuY3VzdG9tLmZpbmQoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLnJlbW92ZUNsYXNzKFwiaS1hbS1uZXdcIik6MD09YShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikubGVuZ3RoP2EoXCJib2R5XCIpLmFwcGVuZChhKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLm9iamVjdCkuYWRkQ2xhc3MoXCJpLWFtLW5ld1wiKSk6YShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikucmVtb3ZlQ2xhc3MoXCJpLWFtLW5ld1wiKSxhLm5vdHlSZW5kZXJlci5zZXRMYXlvdXRDb3VudEZvcihiLDEpLGIuc2hvdygpfSxhLm5vdHlSZW5kZXJlci5jcmVhdGVNb2RhbEZvcj1mdW5jdGlvbihiKXtpZigwPT1hKFwiLm5vdHlfbW9kYWxcIikubGVuZ3RoKXt2YXIgYz1hKFwiPGRpdi8+XCIpLmFkZENsYXNzKFwibm90eV9tb2RhbFwiKS5hZGRDbGFzcyhiLm9wdGlvbnMudGhlbWUpLmRhdGEoXCJub3R5X21vZGFsX2NvdW50XCIsMCk7Yi5vcHRpb25zLnRoZW1lLm1vZGFsJiZiLm9wdGlvbnMudGhlbWUubW9kYWwuY3NzJiZjLmNzcyhiLm9wdGlvbnMudGhlbWUubW9kYWwuY3NzKSxjLnByZXBlbmRUbyhhKFwiYm9keVwiKSkuZmFkZUluKGIub3B0aW9ucy5hbmltYXRpb24uZmFkZVNwZWVkKSxhLmluQXJyYXkoXCJiYWNrZHJvcFwiLGIub3B0aW9ucy5jbG9zZVdpdGgpPi0xJiZjLm9uKFwiY2xpY2tcIixmdW5jdGlvbihiKXthLm5vdHkuY2xvc2VBbGwoKX0pfX0sYS5ub3R5UmVuZGVyZXIuZ2V0TGF5b3V0Q291bnRGb3I9ZnVuY3Rpb24oYil7cmV0dXJuIGEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmRhdGEoXCJub3R5X2xheW91dF9jb3VudFwiKXx8MH0sYS5ub3R5UmVuZGVyZXIuc2V0TGF5b3V0Q291bnRGb3I9ZnVuY3Rpb24oYixjKXtyZXR1cm4gYShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikuZGF0YShcIm5vdHlfbGF5b3V0X2NvdW50XCIsYS5ub3R5UmVuZGVyZXIuZ2V0TGF5b3V0Q291bnRGb3IoYikrYyl9LGEubm90eVJlbmRlcmVyLmdldE1vZGFsQ291bnQ9ZnVuY3Rpb24oKXtyZXR1cm4gYShcIi5ub3R5X21vZGFsXCIpLmRhdGEoXCJub3R5X21vZGFsX2NvdW50XCIpfHwwfSxhLm5vdHlSZW5kZXJlci5zZXRNb2RhbENvdW50PWZ1bmN0aW9uKGIpe3JldHVybiBhKFwiLm5vdHlfbW9kYWxcIikuZGF0YShcIm5vdHlfbW9kYWxfY291bnRcIixhLm5vdHlSZW5kZXJlci5nZXRNb2RhbENvdW50KCkrYil9LGEuZm4ubm90eT1mdW5jdGlvbihiKXtyZXR1cm4gYi5jdXN0b209YSh0aGlzKSxhLm5vdHlSZW5kZXJlci5pbml0KGIpfSxhLm5vdHk9e30sYS5ub3R5LnF1ZXVlPVtdLGEubm90eS5vbnRhcD0hMCxhLm5vdHkubGF5b3V0cz17fSxhLm5vdHkudGhlbWVzPXt9LGEubm90eS5yZXR1cm5zPVwib2JqZWN0XCIsYS5ub3R5LnN0b3JlPXt9LGEubm90eS5nZXQ9ZnVuY3Rpb24oYil7cmV0dXJuIGEubm90eS5zdG9yZS5oYXNPd25Qcm9wZXJ0eShiKT9hLm5vdHkuc3RvcmVbYl06ITF9LGEubm90eS5jbG9zZT1mdW5jdGlvbihiKXtyZXR1cm4gYS5ub3R5LmdldChiKT9hLm5vdHkuZ2V0KGIpLmNsb3NlKCk6ITF9LGEubm90eS5zZXRUZXh0PWZ1bmN0aW9uKGIsYyl7cmV0dXJuIGEubm90eS5nZXQoYik/YS5ub3R5LmdldChiKS5zZXRUZXh0KGMpOiExfSxhLm5vdHkuc2V0VHlwZT1mdW5jdGlvbihiLGMpe3JldHVybiBhLm5vdHkuZ2V0KGIpP2Eubm90eS5nZXQoYikuc2V0VHlwZShjKTohMX0sYS5ub3R5LmNsZWFyUXVldWU9ZnVuY3Rpb24oKXthLm5vdHkucXVldWU9W119LGEubm90eS5jbG9zZUFsbD1mdW5jdGlvbigpe2Eubm90eS5jbGVhclF1ZXVlKCksYS5lYWNoKGEubm90eS5zdG9yZSxmdW5jdGlvbihhLGIpe2IuY2xvc2UoKX0pfTt2YXIgYz13aW5kb3cuYWxlcnQ7cmV0dXJuIGEubm90eS5jb25zdW1lQWxlcnQ9ZnVuY3Rpb24oYil7d2luZG93LmFsZXJ0PWZ1bmN0aW9uKGMpe2I/Yi50ZXh0PWM6Yj17dGV4dDpjfSxhLm5vdHlSZW5kZXJlci5pbml0KGIpfX0sYS5ub3R5LnN0b3BDb25zdW1lQWxlcnQ9ZnVuY3Rpb24oKXt3aW5kb3cuYWxlcnQ9Y30sYS5ub3R5LmRlZmF1bHRzPXtsYXlvdXQ6XCJ0b3BcIix0aGVtZTpcImRlZmF1bHRUaGVtZVwiLHR5cGU6XCJhbGVydFwiLHRleHQ6XCJcIixkaXNtaXNzUXVldWU6ITAsdGVtcGxhdGU6JzxkaXYgY2xhc3M9XCJub3R5X21lc3NhZ2VcIj48c3BhbiBjbGFzcz1cIm5vdHlfdGV4dFwiPjwvc3Bhbj48ZGl2IGNsYXNzPVwibm90eV9jbG9zZVwiPjwvZGl2PjwvZGl2PicsYW5pbWF0aW9uOntvcGVuOntoZWlnaHQ6XCJ0b2dnbGVcIn0sY2xvc2U6e2hlaWdodDpcInRvZ2dsZVwifSxlYXNpbmc6XCJzd2luZ1wiLHNwZWVkOjUwMCxmYWRlU3BlZWQ6XCJmYXN0XCJ9LHRpbWVvdXQ6ITEsZm9yY2U6ITEsbW9kYWw6ITEsbWF4VmlzaWJsZTo1LGtpbGxlcjohMSxjbG9zZVdpdGg6W1wiY2xpY2tcIl0sY2FsbGJhY2s6e29uU2hvdzpmdW5jdGlvbigpe30sYWZ0ZXJTaG93OmZ1bmN0aW9uKCl7fSxvbkNsb3NlOmZ1bmN0aW9uKCl7fSxhZnRlckNsb3NlOmZ1bmN0aW9uKCl7fSxvbkNsb3NlQ2xpY2s6ZnVuY3Rpb24oKXt9fSxidXR0b25zOiExfSxhKHdpbmRvdykub24oXCJyZXNpemVcIixmdW5jdGlvbigpe2EuZWFjaChhLm5vdHkubGF5b3V0cyxmdW5jdGlvbihiLGMpe2MuY29udGFpbmVyLnN0eWxlLmFwcGx5KGEoYy5jb250YWluZXIuc2VsZWN0b3IpKX0pfSksd2luZG93Lm5vdHk9ZnVuY3Rpb24oYil7cmV0dXJuIGEubm90eVJlbmRlcmVyLmluaXQoYil9LGEubm90eS5sYXlvdXRzLmJvdHRvbT17bmFtZTpcImJvdHRvbVwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfYm90dG9tX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2JvdHRvbV9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7Ym90dG9tOjAsbGVmdDpcIjUlXCIscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiOTAlXCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDo5OTk5OTk5fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuYm90dG9tQ2VudGVyPXtuYW1lOlwiYm90dG9tQ2VudGVyXCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9ib3R0b21DZW50ZXJfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfYm90dG9tQ2VudGVyX2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtib3R0b206MjAsbGVmdDowLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KSxhKHRoaXMpLmNzcyh7bGVmdDooYSh3aW5kb3cpLndpZHRoKCktYSh0aGlzKS5vdXRlcldpZHRoKCExKSkvMitcInB4XCJ9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuYm90dG9tTGVmdD17bmFtZTpcImJvdHRvbUxlZnRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2JvdHRvbUxlZnRfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfYm90dG9tTGVmdF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7Ym90dG9tOjIwLGxlZnQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLHdpbmRvdy5pbm5lcldpZHRoPDYwMCYmYSh0aGlzKS5jc3Moe2xlZnQ6NX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5ib3R0b21SaWdodD17bmFtZTpcImJvdHRvbVJpZ2h0XCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9ib3R0b21SaWdodF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9ib3R0b21SaWdodF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7Ym90dG9tOjIwLHJpZ2h0OjIwLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KSx3aW5kb3cuaW5uZXJXaWR0aDw2MDAmJmEodGhpcykuY3NzKHtyaWdodDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmNlbnRlcj17bmFtZTpcImNlbnRlclwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfY2VudGVyX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2NlbnRlcl9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7cG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pO3ZhciBiPWEodGhpcykuY2xvbmUoKS5jc3Moe3Zpc2liaWxpdHk6XCJoaWRkZW5cIixkaXNwbGF5OlwiYmxvY2tcIixwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOjAsbGVmdDowfSkuYXR0cihcImlkXCIsXCJkdXBlXCIpO2EoXCJib2R5XCIpLmFwcGVuZChiKSxiLmZpbmQoXCIuaS1hbS1jbG9zaW5nLW5vd1wiKS5yZW1vdmUoKSxiLmZpbmQoXCJsaVwiKS5jc3MoXCJkaXNwbGF5XCIsXCJibG9ja1wiKTt2YXIgYz1iLmhlaWdodCgpO2IucmVtb3ZlKCksYSh0aGlzKS5oYXNDbGFzcyhcImktYW0tbmV3XCIpP2EodGhpcykuY3NzKHtsZWZ0OihhKHdpbmRvdykud2lkdGgoKS1hKHRoaXMpLm91dGVyV2lkdGgoITEpKS8yK1wicHhcIix0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0pOmEodGhpcykuYW5pbWF0ZSh7bGVmdDooYSh3aW5kb3cpLndpZHRoKCktYSh0aGlzKS5vdXRlcldpZHRoKCExKSkvMitcInB4XCIsdG9wOihhKHdpbmRvdykuaGVpZ2h0KCktYykvMitcInB4XCJ9LDUwMCl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmNlbnRlckxlZnQ9e25hbWU6XCJjZW50ZXJMZWZ0XCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9jZW50ZXJMZWZ0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2NlbnRlckxlZnRfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe2xlZnQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pO3ZhciBiPWEodGhpcykuY2xvbmUoKS5jc3Moe3Zpc2liaWxpdHk6XCJoaWRkZW5cIixkaXNwbGF5OlwiYmxvY2tcIixwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOjAsbGVmdDowfSkuYXR0cihcImlkXCIsXCJkdXBlXCIpO2EoXCJib2R5XCIpLmFwcGVuZChiKSxiLmZpbmQoXCIuaS1hbS1jbG9zaW5nLW5vd1wiKS5yZW1vdmUoKSxiLmZpbmQoXCJsaVwiKS5jc3MoXCJkaXNwbGF5XCIsXCJibG9ja1wiKTt2YXIgYz1iLmhlaWdodCgpO2IucmVtb3ZlKCksYSh0aGlzKS5oYXNDbGFzcyhcImktYW0tbmV3XCIpP2EodGhpcykuY3NzKHt0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0pOmEodGhpcykuYW5pbWF0ZSh7dG9wOihhKHdpbmRvdykuaGVpZ2h0KCktYykvMitcInB4XCJ9LDUwMCksd2luZG93LmlubmVyV2lkdGg8NjAwJiZhKHRoaXMpLmNzcyh7bGVmdDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmNlbnRlclJpZ2h0PXtuYW1lOlwiY2VudGVyUmlnaHRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2NlbnRlclJpZ2h0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2NlbnRlclJpZ2h0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtyaWdodDoyMCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSk7dmFyIGI9YSh0aGlzKS5jbG9uZSgpLmNzcyh7dmlzaWJpbGl0eTpcImhpZGRlblwiLGRpc3BsYXk6XCJibG9ja1wiLHBvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6MCxsZWZ0OjB9KS5hdHRyKFwiaWRcIixcImR1cGVcIik7YShcImJvZHlcIikuYXBwZW5kKGIpLGIuZmluZChcIi5pLWFtLWNsb3Npbmctbm93XCIpLnJlbW92ZSgpLGIuZmluZChcImxpXCIpLmNzcyhcImRpc3BsYXlcIixcImJsb2NrXCIpO3ZhciBjPWIuaGVpZ2h0KCk7Yi5yZW1vdmUoKSxhKHRoaXMpLmhhc0NsYXNzKFwiaS1hbS1uZXdcIik/YSh0aGlzKS5jc3Moe3RvcDooYSh3aW5kb3cpLmhlaWdodCgpLWMpLzIrXCJweFwifSk6YSh0aGlzKS5hbmltYXRlKHt0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0sNTAwKSx3aW5kb3cuaW5uZXJXaWR0aDw2MDAmJmEodGhpcykuY3NzKHtyaWdodDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmlubGluZT17bmFtZTpcImlubGluZVwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBjbGFzcz1cIm5vdHlfaW5saW5lX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bC5ub3R5X2lubGluZV9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7d2lkdGg6XCIxMDAlXCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDo5OTk5OTk5fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMudG9wPXtuYW1lOlwidG9wXCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV90b3BfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfdG9wX2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHt0b3A6MCxsZWZ0OlwiNSVcIixwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCI5MCVcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4Ojk5OTk5OTl9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy50b3BDZW50ZXI9e25hbWU6XCJ0b3BDZW50ZXJcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X3RvcENlbnRlcl9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV90b3BDZW50ZXJfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3RvcDoyMCxsZWZ0OjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLGEodGhpcykuY3NzKHtsZWZ0OihhKHdpbmRvdykud2lkdGgoKS1hKHRoaXMpLm91dGVyV2lkdGgoITEpKS8yK1wicHhcIn0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy50b3BMZWZ0PXtuYW1lOlwidG9wTGVmdFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfdG9wTGVmdF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV90b3BMZWZ0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHt0b3A6MjAsbGVmdDoyMCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSksd2luZG93LmlubmVyV2lkdGg8NjAwJiZhKHRoaXMpLmNzcyh7bGVmdDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLnRvcFJpZ2h0PXtuYW1lOlwidG9wUmlnaHRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X3RvcFJpZ2h0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X3RvcFJpZ2h0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHt0b3A6MjAscmlnaHQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLHdpbmRvdy5pbm5lcldpZHRoPDYwMCYmYSh0aGlzKS5jc3Moe3JpZ2h0OjV9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LnRoZW1lcy5ib290c3RyYXBUaGVtZT17bmFtZTpcImJvb3RzdHJhcFRoZW1lXCIsbW9kYWw6e2Nzczp7cG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMTAwJVwiLGhlaWdodDpcIjEwMCVcIixiYWNrZ3JvdW5kQ29sb3I6XCIjMDAwXCIsekluZGV4OjFlNCxvcGFjaXR5Oi42LGRpc3BsYXk6XCJub25lXCIsbGVmdDowLHRvcDowfX0sc3R5bGU6ZnVuY3Rpb24oKXt2YXIgYj10aGlzLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3Rvcjtzd2l0Y2goYShiKS5hZGRDbGFzcyhcImxpc3QtZ3JvdXBcIiksdGhpcy4kY2xvc2VCdXR0b24uYXBwZW5kKCc8c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj4mdGltZXM7PC9zcGFuPjxzcGFuIGNsYXNzPVwic3Itb25seVwiPkNsb3NlPC9zcGFuPicpLHRoaXMuJGNsb3NlQnV0dG9uLmFkZENsYXNzKFwiY2xvc2VcIiksdGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtXCIpLmNzcyhcInBhZGRpbmdcIixcIjBweFwiKSx0aGlzLm9wdGlvbnMudHlwZSl7Y2FzZVwiYWxlcnRcIjpjYXNlXCJub3RpZmljYXRpb25cIjp0aGlzLiRiYXIuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwLWl0ZW0taW5mb1wiKTticmVhaztjYXNlXCJ3YXJuaW5nXCI6dGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtLXdhcm5pbmdcIik7YnJlYWs7Y2FzZVwiZXJyb3JcIjp0aGlzLiRiYXIuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwLWl0ZW0tZGFuZ2VyXCIpO2JyZWFrO2Nhc2VcImluZm9ybWF0aW9uXCI6dGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtLWluZm9cIik7YnJlYWs7Y2FzZVwic3VjY2Vzc1wiOnRoaXMuJGJhci5hZGRDbGFzcyhcImxpc3QtZ3JvdXAtaXRlbS1zdWNjZXNzXCIpfXRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjEzcHhcIixsaW5lSGVpZ2h0OlwiMTZweFwiLHRleHRBbGlnbjpcImNlbnRlclwiLHBhZGRpbmc6XCI4cHggMTBweCA5cHhcIix3aWR0aDpcImF1dG9cIixwb3NpdGlvbjpcInJlbGF0aXZlXCJ9KX0sY2FsbGJhY2s6e29uU2hvdzpmdW5jdGlvbigpe30sb25DbG9zZTpmdW5jdGlvbigpe319fSxhLm5vdHkudGhlbWVzLmRlZmF1bHRUaGVtZT17bmFtZTpcImRlZmF1bHRUaGVtZVwiLGhlbHBlcnM6e2JvcmRlckZpeDpmdW5jdGlvbigpe2lmKHRoaXMub3B0aW9ucy5kaXNtaXNzUXVldWUpe3ZhciBiPXRoaXMub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yK1wiIFwiK3RoaXMub3B0aW9ucy5sYXlvdXQucGFyZW50LnNlbGVjdG9yO3N3aXRjaCh0aGlzLm9wdGlvbnMubGF5b3V0Lm5hbWUpe2Nhc2VcInRvcFwiOmEoYikuY3NzKHtib3JkZXJSYWRpdXM6XCIwcHggMHB4IDBweCAwcHhcIn0pLGEoYikubGFzdCgpLmNzcyh7Ym9yZGVyUmFkaXVzOlwiMHB4IDBweCA1cHggNXB4XCJ9KTticmVhaztjYXNlXCJ0b3BDZW50ZXJcIjpjYXNlXCJ0b3BMZWZ0XCI6Y2FzZVwidG9wUmlnaHRcIjpjYXNlXCJib3R0b21DZW50ZXJcIjpjYXNlXCJib3R0b21MZWZ0XCI6Y2FzZVwiYm90dG9tUmlnaHRcIjpjYXNlXCJjZW50ZXJcIjpjYXNlXCJjZW50ZXJMZWZ0XCI6Y2FzZVwiY2VudGVyUmlnaHRcIjpjYXNlXCJpbmxpbmVcIjphKGIpLmNzcyh7Ym9yZGVyUmFkaXVzOlwiMHB4IDBweCAwcHggMHB4XCJ9KSxhKGIpLmZpcnN0KCkuY3NzKHtcImJvcmRlci10b3AtbGVmdC1yYWRpdXNcIjpcIjVweFwiLFwiYm9yZGVyLXRvcC1yaWdodC1yYWRpdXNcIjpcIjVweFwifSksYShiKS5sYXN0KCkuY3NzKHtcImJvcmRlci1ib3R0b20tbGVmdC1yYWRpdXNcIjpcIjVweFwiLFwiYm9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXNcIjpcIjVweFwifSk7YnJlYWs7Y2FzZVwiYm90dG9tXCI6YShiKS5jc3Moe2JvcmRlclJhZGl1czpcIjBweCAwcHggMHB4IDBweFwifSksYShiKS5maXJzdCgpLmNzcyh7Ym9yZGVyUmFkaXVzOlwiNXB4IDVweCAwcHggMHB4XCJ9KX19fX0sbW9kYWw6e2Nzczp7cG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMTAwJVwiLGhlaWdodDpcIjEwMCVcIixiYWNrZ3JvdW5kQ29sb3I6XCIjMDAwXCIsekluZGV4OjFlNCxvcGFjaXR5Oi42LGRpc3BsYXk6XCJub25lXCIsbGVmdDowLHRvcDowfX0sc3R5bGU6ZnVuY3Rpb24oKXtzd2l0Y2godGhpcy4kYmFyLmNzcyh7b3ZlcmZsb3c6XCJoaWRkZW5cIixiYWNrZ3JvdW5kOlwidXJsKCdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUJzQUFBQW9DQVFBQUFDbE0wbmRBQUFBaGtsRVFWUjRBZFhPMFFyQ01CQkUwYnR0a2szOC93OFdSRVJwZHlqelZPYytIeGhJSHFKR01RY0ZGa3BZUlFvdExMU3cwSUo1YUJkb3ZydU1ZREEva1Q4cGxGOVpLTEZRY2dGMThoRGoxU2JRT01sQ0E0a2FvMGlpWG1haDdxQldQZHhwb2hzZ1ZaeWo3ZTVJOUtjSUQrRWhpREk1Z3hCWUtMQlFZS0hBUW9HRkFvRWtzL1lFR0hZS0I3aEZ4ZjBBQUFBQVNVVk9SSzVDWUlJPScpIHJlcGVhdC14IHNjcm9sbCBsZWZ0IHRvcCAjZmZmXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsbGluZUhlaWdodDpcIjE2cHhcIix0ZXh0QWxpZ246XCJjZW50ZXJcIixwYWRkaW5nOlwiOHB4IDEwcHggOXB4XCIsd2lkdGg6XCJhdXRvXCIscG9zaXRpb246XCJyZWxhdGl2ZVwifSksdGhpcy4kY2xvc2VCdXR0b24uY3NzKHtwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOjQscmlnaHQ6NCx3aWR0aDoxMCxoZWlnaHQ6MTAsYmFja2dyb3VuZDpcInVybChkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFvQUFBQUtDQVFBQUFBbk93YzJBQUFBeFVsRVFWUjRBUjNNUFVvRFVSU0EwZSsrdVNra094QzNJQU9XTnRhQ0lEYUNoZmdYQk1FWmJRUkJ5eEN3aytCYXNnUVJaTFNZb0xnRFFiQVJ4cnk4bnl1bVBjVlJLRGZkMEFhOEFzZ0R2MXpwNnBZZDVqV093aHZlYlJUYnpOTkV3NUJTc0lwc2ova3VyUUJubWs3c0lGY0NGNXl5WlBEUkc2dHJRaHVqWFlvc2FGb2MrMmYxTUo4OXVjNzZJTkQ2RjlCdmxYVWRwYjZ4d0QyKzRxM21lM2J5c2lIdnRMWXJVSnRvN1BEL3ZlN0xOSHhTZy93b04ya1N6NHR4YXNCZGh5aXozdWdQR2V0VGptM1hSb2tBQUFBQVNVVk9SSzVDWUlJPSlcIixkaXNwbGF5Olwibm9uZVwiLGN1cnNvcjpcInBvaW50ZXJcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtwYWRkaW5nOjUsdGV4dEFsaWduOlwicmlnaHRcIixib3JkZXJUb3A6XCIxcHggc29saWQgI2NjY1wiLGJhY2tncm91bmRDb2xvcjpcIiNmZmZcIn0pLHRoaXMuJGJ1dHRvbnMuZmluZChcImJ1dHRvblwiKS5jc3Moe21hcmdpbkxlZnQ6NX0pLHRoaXMuJGJ1dHRvbnMuZmluZChcImJ1dHRvbjpmaXJzdFwiKS5jc3Moe21hcmdpbkxlZnQ6MH0pLHRoaXMuJGJhci5vbih7bW91c2VlbnRlcjpmdW5jdGlvbigpe2EodGhpcykuZmluZChcIi5ub3R5X2Nsb3NlXCIpLnN0b3AoKS5mYWRlVG8oXCJub3JtYWxcIiwxKX0sbW91c2VsZWF2ZTpmdW5jdGlvbigpe2EodGhpcykuZmluZChcIi5ub3R5X2Nsb3NlXCIpLnN0b3AoKS5mYWRlVG8oXCJub3JtYWxcIiwwKX19KSx0aGlzLm9wdGlvbnMubGF5b3V0Lm5hbWUpe2Nhc2VcInRvcFwiOnRoaXMuJGJhci5jc3Moe2JvcmRlclJhZGl1czpcIjBweCAwcHggNXB4IDVweFwiLGJvcmRlckJvdHRvbTpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyTGVmdDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyUmlnaHQ6XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pO2JyZWFrO2Nhc2VcInRvcENlbnRlclwiOmNhc2VcImNlbnRlclwiOmNhc2VcImJvdHRvbUNlbnRlclwiOmNhc2VcImlubGluZVwiOnRoaXMuJGJhci5jc3Moe2JvcmRlclJhZGl1czpcIjVweFwiLGJvcmRlcjpcIjFweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTNweFwiLHRleHRBbGlnbjpcImNlbnRlclwifSk7YnJlYWs7Y2FzZVwidG9wTGVmdFwiOmNhc2VcInRvcFJpZ2h0XCI6Y2FzZVwiYm90dG9tTGVmdFwiOmNhc2VcImJvdHRvbVJpZ2h0XCI6Y2FzZVwiY2VudGVyTGVmdFwiOmNhc2VcImNlbnRlclJpZ2h0XCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyUmFkaXVzOlwiNXB4XCIsYm9yZGVyOlwiMXB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsdGV4dEFsaWduOlwibGVmdFwifSk7YnJlYWs7Y2FzZVwiYm90dG9tXCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyUmFkaXVzOlwiNXB4IDVweCAwcHggMHB4XCIsYm9yZGVyVG9wOlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJMZWZ0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJSaWdodDpcIjJweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAtMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pO2JyZWFrO2RlZmF1bHQ6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyOlwiMnB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KX1zd2l0Y2godGhpcy5vcHRpb25zLnR5cGUpe2Nhc2VcImFsZXJ0XCI6Y2FzZVwibm90aWZpY2F0aW9uXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGRlwiLGJvcmRlckNvbG9yOlwiI0NDQ1wiLGNvbG9yOlwiIzQ0NFwifSk7YnJlYWs7Y2FzZVwid2FybmluZ1wiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkVBQThcIixib3JkZXJDb2xvcjpcIiNGRkMyMzdcIixjb2xvcjpcIiM4MjYyMDBcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgI0ZGQzIzN1wifSk7YnJlYWs7Y2FzZVwiZXJyb3JcIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCJyZWRcIixib3JkZXJDb2xvcjpcImRhcmtyZWRcIixjb2xvcjpcIiNGRkZcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250V2VpZ2h0OlwiYm9sZFwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCBkYXJrcmVkXCJ9KTticmVhaztjYXNlXCJpbmZvcm1hdGlvblwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiM1N0I3RTJcIixib3JkZXJDb2xvcjpcIiMwQjkwQzRcIixjb2xvcjpcIiNGRkZcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgIzBCOTBDNFwifSk7YnJlYWs7Y2FzZVwic3VjY2Vzc1wiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcImxpZ2h0Z3JlZW5cIixib3JkZXJDb2xvcjpcIiM1MEMyNEVcIixjb2xvcjpcImRhcmtncmVlblwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjNTBDMjRFXCJ9KTticmVhaztkZWZhdWx0OnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkZcIixib3JkZXJDb2xvcjpcIiNDQ0NcIixjb2xvcjpcIiM0NDRcIn0pfX0sY2FsbGJhY2s6e29uU2hvdzpmdW5jdGlvbigpe2Eubm90eS50aGVtZXMuZGVmYXVsdFRoZW1lLmhlbHBlcnMuYm9yZGVyRml4LmFwcGx5KHRoaXMpfSxvbkNsb3NlOmZ1bmN0aW9uKCl7YS5ub3R5LnRoZW1lcy5kZWZhdWx0VGhlbWUuaGVscGVycy5ib3JkZXJGaXguYXBwbHkodGhpcyl9fX0sYS5ub3R5LnRoZW1lcy5yZWxheD17bmFtZTpcInJlbGF4XCIsaGVscGVyczp7fSxtb2RhbDp7Y3NzOntwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIxMDAlXCIsaGVpZ2h0OlwiMTAwJVwiLGJhY2tncm91bmRDb2xvcjpcIiMwMDBcIix6SW5kZXg6MWU0LG9wYWNpdHk6LjYsZGlzcGxheTpcIm5vbmVcIixsZWZ0OjAsdG9wOjB9fSxzdHlsZTpmdW5jdGlvbigpe3N3aXRjaCh0aGlzLiRiYXIuY3NzKHtvdmVyZmxvdzpcImhpZGRlblwiLG1hcmdpbjpcIjRweCAwXCIsYm9yZGVyUmFkaXVzOlwiMnB4XCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxNHB4XCIsbGluZUhlaWdodDpcIjE2cHhcIix0ZXh0QWxpZ246XCJjZW50ZXJcIixwYWRkaW5nOlwiMTBweFwiLHdpZHRoOlwiYXV0b1wiLHBvc2l0aW9uOlwicmVsYXRpdmVcIn0pLHRoaXMuJGNsb3NlQnV0dG9uLmNzcyh7cG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDo0LHJpZ2h0OjQsd2lkdGg6MTAsaGVpZ2h0OjEwLGJhY2tncm91bmQ6XCJ1cmwoZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBb0FBQUFLQ0FRQUFBQW5Pd2MyQUFBQXhVbEVRVlI0QVIzTVBVb0RVUlNBMGUrK3VTa2tPeEMzSUFPV050YUNJRGFDaGZnWEJNRVpiUVJCeXhDd2srQmFzZ1FSWkxTWW9MZ0RRYkFSeHJ5OG55dW1QY1ZSS0RmZDBBYThBc2dEdjF6cDZwWWQ1aldPd2h2ZWJSVGJ6Tk5FdzVCU3NJcHNqL2t1clFCbm1rN3NJRmNDRjV5eVpQRFJHNnRyUWh1alhZb3NhRm9jKzJmMU1KODl1Yzc2SU5ENkY5QnZsWFVkcGI2eHdEMis0cTNtZTNieXNpSHZ0TFlyVUp0bzdQRC92ZTdMTkh4U2cvd29OMmtTejR0eGFzQmRoeWl6M3VnUEdldFRqbTNYUm9rQUFBQUFTVVZPUks1Q1lJST0pXCIsZGlzcGxheTpcIm5vbmVcIixjdXJzb3I6XCJwb2ludGVyXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7cGFkZGluZzo1LHRleHRBbGlnbjpcInJpZ2h0XCIsYm9yZGVyVG9wOlwiMXB4IHNvbGlkICNjY2NcIixiYWNrZ3JvdW5kQ29sb3I6XCIjZmZmXCJ9KSx0aGlzLiRidXR0b25zLmZpbmQoXCJidXR0b25cIikuY3NzKHttYXJnaW5MZWZ0OjV9KSx0aGlzLiRidXR0b25zLmZpbmQoXCJidXR0b246Zmlyc3RcIikuY3NzKHttYXJnaW5MZWZ0OjB9KSx0aGlzLiRiYXIub24oe21vdXNlZW50ZXI6ZnVuY3Rpb24oKXthKHRoaXMpLmZpbmQoXCIubm90eV9jbG9zZVwiKS5zdG9wKCkuZmFkZVRvKFwibm9ybWFsXCIsMSl9LG1vdXNlbGVhdmU6ZnVuY3Rpb24oKXthKHRoaXMpLmZpbmQoXCIubm90eV9jbG9zZVwiKS5zdG9wKCkuZmFkZVRvKFwibm9ybWFsXCIsMCl9fSksdGhpcy5vcHRpb25zLmxheW91dC5uYW1lKXtjYXNlXCJ0b3BcIjp0aGlzLiRiYXIuY3NzKHtib3JkZXJCb3R0b206XCIycHggc29saWQgI2VlZVwiLGJvcmRlckxlZnQ6XCIycHggc29saWQgI2VlZVwiLGJvcmRlclJpZ2h0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJUb3A6XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pO2JyZWFrO2Nhc2VcInRvcENlbnRlclwiOmNhc2VcImNlbnRlclwiOmNhc2VcImJvdHRvbUNlbnRlclwiOmNhc2VcImlubGluZVwiOnRoaXMuJGJhci5jc3Moe2JvcmRlcjpcIjFweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTNweFwiLHRleHRBbGlnbjpcImNlbnRlclwifSk7YnJlYWs7Y2FzZVwidG9wTGVmdFwiOmNhc2VcInRvcFJpZ2h0XCI6Y2FzZVwiYm90dG9tTGVmdFwiOmNhc2VcImJvdHRvbVJpZ2h0XCI6Y2FzZVwiY2VudGVyTGVmdFwiOmNhc2VcImNlbnRlclJpZ2h0XCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyOlwiMXB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsdGV4dEFsaWduOlwibGVmdFwifSk7YnJlYWs7Y2FzZVwiYm90dG9tXCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyVG9wOlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJMZWZ0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJSaWdodDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyQm90dG9tOlwiMnB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIC0ycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSk7YnJlYWs7ZGVmYXVsdDp0aGlzLiRiYXIuY3NzKHtib3JkZXI6XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pfXN3aXRjaCh0aGlzLm9wdGlvbnMudHlwZSl7Y2FzZVwiYWxlcnRcIjpjYXNlXCJub3RpZmljYXRpb25cIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkZGXCIsYm9yZGVyQ29sb3I6XCIjZGVkZWRlXCIsY29sb3I6XCIjNDQ0XCJ9KTticmVhaztjYXNlXCJ3YXJuaW5nXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGRUFBOFwiLGJvcmRlckNvbG9yOlwiI0ZGQzIzN1wiLGNvbG9yOlwiIzgyNjIwMFwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjRkZDMjM3XCJ9KTticmVhaztjYXNlXCJlcnJvclwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRjgxODFcIixib3JkZXJDb2xvcjpcIiNlMjUzNTNcIixjb2xvcjpcIiNGRkZcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250V2VpZ2h0OlwiYm9sZFwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCBkYXJrcmVkXCJ9KTticmVhaztjYXNlXCJpbmZvcm1hdGlvblwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiM3OEM1RTdcIixib3JkZXJDb2xvcjpcIiMzYmFkZDZcIixjb2xvcjpcIiNGRkZcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgIzBCOTBDNFwifSk7YnJlYWs7Y2FzZVwic3VjY2Vzc1wiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNCQ0Y1QkNcIixib3JkZXJDb2xvcjpcIiM3Y2RkNzdcIixjb2xvcjpcImRhcmtncmVlblwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjNTBDMjRFXCJ9KTticmVhaztkZWZhdWx0OnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkZcIixib3JkZXJDb2xvcjpcIiNDQ0NcIixjb2xvcjpcIiM0NDRcIn0pfX0sY2FsbGJhY2s6e29uU2hvdzpmdW5jdGlvbigpe30sb25DbG9zZTpmdW5jdGlvbigpe319fSx3aW5kb3cubm90eX0pOyIsIi8qIVxuICogTW9ja0pheCAtIGpRdWVyeSBQbHVnaW4gdG8gTW9jayBBamF4IHJlcXVlc3RzXG4gKlxuICogVmVyc2lvbjogIDEuNS4zXG4gKiBSZWxlYXNlZDpcbiAqIEhvbWU6ICAgaHR0cDovL2dpdGh1Yi5jb20vYXBwZW5kdG8vanF1ZXJ5LW1vY2tqYXhcbiAqIEF1dGhvcjogICBKb25hdGhhbiBTaGFycCAoaHR0cDovL2pkc2hhcnAuY29tKVxuICogTGljZW5zZTogIE1JVCxHUExcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEgYXBwZW5kVG8gTExDLlxuICogRHVhbCBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIG9yIEdQTCBsaWNlbnNlcy5cbiAqIGh0dHA6Ly9hcHBlbmR0by5jb20vb3Blbi1zb3VyY2UtbGljZW5zZXNcbiAqL1xuKGZ1bmN0aW9uKCQpIHtcblx0dmFyIF9hamF4ID0gJC5hamF4LFxuXHRcdG1vY2tIYW5kbGVycyA9IFtdLFxuXHRcdG1vY2tlZEFqYXhDYWxscyA9IFtdLFxuXHRcdENBTExCQUNLX1JFR0VYID0gLz1cXD8oJnwkKS8sXG5cdFx0anNjID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcblxuXG5cdC8vIFBhcnNlIHRoZSBnaXZlbiBYTUwgc3RyaW5nLlxuXHRmdW5jdGlvbiBwYXJzZVhNTCh4bWwpIHtcblx0XHRpZiAoIHdpbmRvdy5ET01QYXJzZXIgPT0gdW5kZWZpbmVkICYmIHdpbmRvdy5BY3RpdmVYT2JqZWN0ICkge1xuXHRcdFx0RE9NUGFyc2VyID0gZnVuY3Rpb24oKSB7IH07XG5cdFx0XHRET01QYXJzZXIucHJvdG90eXBlLnBhcnNlRnJvbVN0cmluZyA9IGZ1bmN0aW9uKCB4bWxTdHJpbmcgKSB7XG5cdFx0XHRcdHZhciBkb2MgPSBuZXcgQWN0aXZlWE9iamVjdCgnTWljcm9zb2Z0LlhNTERPTScpO1xuXHRcdFx0XHRkb2MuYXN5bmMgPSAnZmFsc2UnO1xuXHRcdFx0XHRkb2MubG9hZFhNTCggeG1sU3RyaW5nICk7XG5cdFx0XHRcdHJldHVybiBkb2M7XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdHRyeSB7XG5cdFx0XHR2YXIgeG1sRG9jID0gKCBuZXcgRE9NUGFyc2VyKCkgKS5wYXJzZUZyb21TdHJpbmcoIHhtbCwgJ3RleHQveG1sJyApO1xuXHRcdFx0aWYgKCAkLmlzWE1MRG9jKCB4bWxEb2MgKSApIHtcblx0XHRcdFx0dmFyIGVyciA9ICQoJ3BhcnNlcmVycm9yJywgeG1sRG9jKTtcblx0XHRcdFx0aWYgKCBlcnIubGVuZ3RoID09IDEgKSB7XG5cdFx0XHRcdFx0dGhyb3coJ0Vycm9yOiAnICsgJCh4bWxEb2MpLnRleHQoKSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdygnVW5hYmxlIHRvIHBhcnNlIFhNTCcpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHhtbERvYztcblx0XHR9IGNhdGNoKCBlICkge1xuXHRcdFx0dmFyIG1zZyA9ICggZS5uYW1lID09IHVuZGVmaW5lZCA/IGUgOiBlLm5hbWUgKyAnOiAnICsgZS5tZXNzYWdlICk7XG5cdFx0XHQkKGRvY3VtZW50KS50cmlnZ2VyKCd4bWxQYXJzZUVycm9yJywgWyBtc2cgXSk7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0fVxuXG5cdC8vIFRyaWdnZXIgYSBqUXVlcnkgZXZlbnRcblx0ZnVuY3Rpb24gdHJpZ2dlcihzLCB0eXBlLCBhcmdzKSB7XG5cdFx0KHMuY29udGV4dCA/ICQocy5jb250ZXh0KSA6ICQuZXZlbnQpLnRyaWdnZXIodHlwZSwgYXJncyk7XG5cdH1cblxuXHQvLyBDaGVjayBpZiB0aGUgZGF0YSBmaWVsZCBvbiB0aGUgbW9jayBoYW5kbGVyIGFuZCB0aGUgcmVxdWVzdCBtYXRjaC4gVGhpc1xuXHQvLyBjYW4gYmUgdXNlZCB0byByZXN0cmljdCBhIG1vY2sgaGFuZGxlciB0byBiZWluZyB1c2VkIG9ubHkgd2hlbiBhIGNlcnRhaW5cblx0Ly8gc2V0IG9mIGRhdGEgaXMgcGFzc2VkIHRvIGl0LlxuXHRmdW5jdGlvbiBpc01vY2tEYXRhRXF1YWwoIG1vY2ssIGxpdmUgKSB7XG5cdFx0dmFyIGlkZW50aWNhbCA9IHRydWU7XG5cdFx0Ly8gVGVzdCBmb3Igc2l0dWF0aW9ucyB3aGVyZSB0aGUgZGF0YSBpcyBhIHF1ZXJ5c3RyaW5nIChub3QgYW4gb2JqZWN0KVxuXHRcdGlmICh0eXBlb2YgbGl2ZSA9PT0gJ3N0cmluZycpIHtcblx0XHRcdC8vIFF1ZXJ5c3RyaW5nIG1heSBiZSBhIHJlZ2V4XG5cdFx0XHRyZXR1cm4gJC5pc0Z1bmN0aW9uKCBtb2NrLnRlc3QgKSA/IG1vY2sudGVzdChsaXZlKSA6IG1vY2sgPT0gbGl2ZTtcblx0XHR9XG5cdFx0JC5lYWNoKG1vY2ssIGZ1bmN0aW9uKGspIHtcblx0XHRcdGlmICggbGl2ZVtrXSA9PT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHRpZGVudGljYWwgPSBmYWxzZTtcblx0XHRcdFx0cmV0dXJuIGlkZW50aWNhbDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmICggdHlwZW9mIGxpdmVba10gPT09ICdvYmplY3QnICYmIGxpdmVba10gIT09IG51bGwgKSB7XG5cdFx0XHRcdFx0aWYgKCBpZGVudGljYWwgJiYgJC5pc0FycmF5KCBsaXZlW2tdICkgKSB7XG5cdFx0XHRcdFx0XHRpZGVudGljYWwgPSAkLmlzQXJyYXkoIG1vY2tba10gKSAmJiBsaXZlW2tdLmxlbmd0aCA9PT0gbW9ja1trXS5sZW5ndGg7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlkZW50aWNhbCA9IGlkZW50aWNhbCAmJiBpc01vY2tEYXRhRXF1YWwobW9ja1trXSwgbGl2ZVtrXSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aWYgKCBtb2NrW2tdICYmICQuaXNGdW5jdGlvbiggbW9ja1trXS50ZXN0ICkgKSB7XG5cdFx0XHRcdFx0XHRpZGVudGljYWwgPSBpZGVudGljYWwgJiYgbW9ja1trXS50ZXN0KGxpdmVba10pO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRpZGVudGljYWwgPSBpZGVudGljYWwgJiYgKCBtb2NrW2tdID09IGxpdmVba10gKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiBpZGVudGljYWw7XG5cdH1cblxuICAgIC8vIFNlZSBpZiBhIG1vY2sgaGFuZGxlciBwcm9wZXJ0eSBtYXRjaGVzIHRoZSBkZWZhdWx0IHNldHRpbmdzXG4gICAgZnVuY3Rpb24gaXNEZWZhdWx0U2V0dGluZyhoYW5kbGVyLCBwcm9wZXJ0eSkge1xuICAgICAgICByZXR1cm4gaGFuZGxlcltwcm9wZXJ0eV0gPT09ICQubW9ja2pheFNldHRpbmdzW3Byb3BlcnR5XTtcbiAgICB9XG5cblx0Ly8gQ2hlY2sgdGhlIGdpdmVuIGhhbmRsZXIgc2hvdWxkIG1vY2sgdGhlIGdpdmVuIHJlcXVlc3Rcblx0ZnVuY3Rpb24gZ2V0TW9ja0ZvclJlcXVlc3QoIGhhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncyApIHtcblx0XHQvLyBJZiB0aGUgbW9jayB3YXMgcmVnaXN0ZXJlZCB3aXRoIGEgZnVuY3Rpb24sIGxldCB0aGUgZnVuY3Rpb24gZGVjaWRlIGlmIHdlXG5cdFx0Ly8gd2FudCB0byBtb2NrIHRoaXMgcmVxdWVzdFxuXHRcdGlmICggJC5pc0Z1bmN0aW9uKGhhbmRsZXIpICkge1xuXHRcdFx0cmV0dXJuIGhhbmRsZXIoIHJlcXVlc3RTZXR0aW5ncyApO1xuXHRcdH1cblxuXHRcdC8vIEluc3BlY3QgdGhlIFVSTCBvZiB0aGUgcmVxdWVzdCBhbmQgY2hlY2sgaWYgdGhlIG1vY2sgaGFuZGxlcidzIHVybFxuXHRcdC8vIG1hdGNoZXMgdGhlIHVybCBmb3IgdGhpcyBhamF4IHJlcXVlc3Rcblx0XHRpZiAoICQuaXNGdW5jdGlvbihoYW5kbGVyLnVybC50ZXN0KSApIHtcblx0XHRcdC8vIFRoZSB1c2VyIHByb3ZpZGVkIGEgcmVnZXggZm9yIHRoZSB1cmwsIHRlc3QgaXRcblx0XHRcdGlmICggIWhhbmRsZXIudXJsLnRlc3QoIHJlcXVlc3RTZXR0aW5ncy51cmwgKSApIHtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIExvb2sgZm9yIGEgc2ltcGxlIHdpbGRjYXJkICcqJyBvciBhIGRpcmVjdCBVUkwgbWF0Y2hcblx0XHRcdHZhciBzdGFyID0gaGFuZGxlci51cmwuaW5kZXhPZignKicpO1xuXHRcdFx0aWYgKGhhbmRsZXIudXJsICE9PSByZXF1ZXN0U2V0dGluZ3MudXJsICYmIHN0YXIgPT09IC0xIHx8XG5cdFx0XHRcdFx0IW5ldyBSZWdFeHAoaGFuZGxlci51cmwucmVwbGFjZSgvWy1bXFxde30oKSs/LixcXFxcXiR8I1xcc10vZywgXCJcXFxcJCZcIikucmVwbGFjZSgvXFwqL2csICcuKycpKS50ZXN0KHJlcXVlc3RTZXR0aW5ncy51cmwpKSB7XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIEluc3BlY3QgdGhlIGRhdGEgc3VibWl0dGVkIGluIHRoZSByZXF1ZXN0IChlaXRoZXIgUE9TVCBib2R5IG9yIEdFVCBxdWVyeSBzdHJpbmcpXG5cdFx0aWYgKCBoYW5kbGVyLmRhdGEgKSB7XG5cdFx0XHRpZiAoICEgcmVxdWVzdFNldHRpbmdzLmRhdGEgfHwgIWlzTW9ja0RhdGFFcXVhbChoYW5kbGVyLmRhdGEsIHJlcXVlc3RTZXR0aW5ncy5kYXRhKSApIHtcblx0XHRcdFx0Ly8gVGhleSdyZSBub3QgaWRlbnRpY2FsLCBkbyBub3QgbW9jayB0aGlzIHJlcXVlc3Rcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIEluc3BlY3QgdGhlIHJlcXVlc3QgdHlwZVxuXHRcdGlmICggaGFuZGxlciAmJiBoYW5kbGVyLnR5cGUgJiZcblx0XHRcdFx0aGFuZGxlci50eXBlLnRvTG93ZXJDYXNlKCkgIT0gcmVxdWVzdFNldHRpbmdzLnR5cGUudG9Mb3dlckNhc2UoKSApIHtcblx0XHRcdC8vIFRoZSByZXF1ZXN0IHR5cGUgZG9lc24ndCBtYXRjaCAoR0VUIHZzLiBQT1NUKVxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGhhbmRsZXI7XG5cdH1cblxuXHQvLyBQcm9jZXNzIHRoZSB4aHIgb2JqZWN0cyBzZW5kIG9wZXJhdGlvblxuXHRmdW5jdGlvbiBfeGhyU2VuZChtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MpIHtcblxuXHRcdC8vIFRoaXMgaXMgYSBzdWJzdGl0dXRlIGZvciA8IDEuNCB3aGljaCBsYWNrcyAkLnByb3h5XG5cdFx0dmFyIHByb2Nlc3MgPSAoZnVuY3Rpb24odGhhdCkge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHZhciBvblJlYWR5O1xuXG5cdFx0XHRcdFx0Ly8gVGhlIHJlcXVlc3QgaGFzIHJldHVybmVkXG5cdFx0XHRcdFx0dGhpcy5zdGF0dXMgICAgID0gbW9ja0hhbmRsZXIuc3RhdHVzO1xuXHRcdFx0XHRcdHRoaXMuc3RhdHVzVGV4dCA9IG1vY2tIYW5kbGVyLnN0YXR1c1RleHQ7XG5cdFx0XHRcdFx0dGhpcy5yZWFkeVN0YXRlXHQ9IDQ7XG5cblx0XHRcdFx0XHQvLyBXZSBoYXZlIGFuIGV4ZWN1dGFibGUgZnVuY3Rpb24sIGNhbGwgaXQgdG8gZ2l2ZVxuXHRcdFx0XHRcdC8vIHRoZSBtb2NrIGhhbmRsZXIgYSBjaGFuY2UgdG8gdXBkYXRlIGl0J3MgZGF0YVxuXHRcdFx0XHRcdGlmICggJC5pc0Z1bmN0aW9uKG1vY2tIYW5kbGVyLnJlc3BvbnNlKSApIHtcblx0XHRcdFx0XHRcdG1vY2tIYW5kbGVyLnJlc3BvbnNlKG9yaWdTZXR0aW5ncyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIENvcHkgb3ZlciBvdXIgbW9jayB0byBvdXIgeGhyIG9iamVjdCBiZWZvcmUgcGFzc2luZyBjb250cm9sIGJhY2sgdG9cblx0XHRcdFx0XHQvLyBqUXVlcnkncyBvbnJlYWR5c3RhdGVjaGFuZ2UgY2FsbGJhY2tcblx0XHRcdFx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSA9PSAnanNvbicgJiYgKCB0eXBlb2YgbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ID09ICdvYmplY3QnICkgKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnJlc3BvbnNlVGV4dCA9IEpTT04uc3RyaW5naWZ5KG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmICggcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlID09ICd4bWwnICkge1xuXHRcdFx0XHRcdFx0aWYgKCB0eXBlb2YgbW9ja0hhbmRsZXIucmVzcG9uc2VYTUwgPT0gJ3N0cmluZycgKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2VYTUwgPSBwYXJzZVhNTChtb2NrSGFuZGxlci5yZXNwb25zZVhNTCk7XG5cdFx0XHRcdFx0XHRcdC8vaW4galF1ZXJ5IDEuOS4xKywgcmVzcG9uc2VYTUwgaXMgcHJvY2Vzc2VkIGRpZmZlcmVudGx5IGFuZCByZWxpZXMgb24gcmVzcG9uc2VUZXh0XG5cdFx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2VUZXh0ID0gbW9ja0hhbmRsZXIucmVzcG9uc2VYTUw7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHR0aGlzLnJlc3BvbnNlWE1MID0gbW9ja0hhbmRsZXIucmVzcG9uc2VYTUw7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2VUZXh0ID0gbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiggdHlwZW9mIG1vY2tIYW5kbGVyLnN0YXR1cyA9PSAnbnVtYmVyJyB8fCB0eXBlb2YgbW9ja0hhbmRsZXIuc3RhdHVzID09ICdzdHJpbmcnICkge1xuXHRcdFx0XHRcdFx0dGhpcy5zdGF0dXMgPSBtb2NrSGFuZGxlci5zdGF0dXM7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmKCB0eXBlb2YgbW9ja0hhbmRsZXIuc3RhdHVzVGV4dCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRcdFx0dGhpcy5zdGF0dXNUZXh0ID0gbW9ja0hhbmRsZXIuc3RhdHVzVGV4dDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8galF1ZXJ5IDIuMCByZW5hbWVkIG9ucmVhZHlzdGF0ZWNoYW5nZSB0byBvbmxvYWRcblx0XHRcdFx0XHRvblJlYWR5ID0gdGhpcy5vbnJlYWR5c3RhdGVjaGFuZ2UgfHwgdGhpcy5vbmxvYWQ7XG5cblx0XHRcdFx0XHQvLyBqUXVlcnkgPCAxLjQgZG9lc24ndCBoYXZlIG9ucmVhZHlzdGF0ZSBjaGFuZ2UgZm9yIHhoclxuXHRcdFx0XHRcdGlmICggJC5pc0Z1bmN0aW9uKCBvblJlYWR5ICkgKSB7XG5cdFx0XHRcdFx0XHRpZiggbW9ja0hhbmRsZXIuaXNUaW1lb3V0KSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMuc3RhdHVzID0gLTE7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRvblJlYWR5LmNhbGwoIHRoaXMsIG1vY2tIYW5kbGVyLmlzVGltZW91dCA/ICd0aW1lb3V0JyA6IHVuZGVmaW5lZCApO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoIG1vY2tIYW5kbGVyLmlzVGltZW91dCApIHtcblx0XHRcdFx0XHRcdC8vIEZpeCBmb3IgMS4zLjIgdGltZW91dCB0byBrZWVwIHN1Y2Nlc3MgZnJvbSBmaXJpbmcuXG5cdFx0XHRcdFx0XHR0aGlzLnN0YXR1cyA9IC0xO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSkuYXBwbHkodGhhdCk7XG5cdFx0XHR9O1xuXHRcdH0pKHRoaXMpO1xuXG5cdFx0aWYgKCBtb2NrSGFuZGxlci5wcm94eSApIHtcblx0XHRcdC8vIFdlJ3JlIHByb3h5aW5nIHRoaXMgcmVxdWVzdCBhbmQgbG9hZGluZyBpbiBhbiBleHRlcm5hbCBmaWxlIGluc3RlYWRcblx0XHRcdF9hamF4KHtcblx0XHRcdFx0Z2xvYmFsOiBmYWxzZSxcblx0XHRcdFx0dXJsOiBtb2NrSGFuZGxlci5wcm94eSxcblx0XHRcdFx0dHlwZTogbW9ja0hhbmRsZXIucHJveHlUeXBlLFxuXHRcdFx0XHRkYXRhOiBtb2NrSGFuZGxlci5kYXRhLFxuXHRcdFx0XHRkYXRhVHlwZTogcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlID09PSBcInNjcmlwdFwiID8gXCJ0ZXh0L3BsYWluXCIgOiByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUsXG5cdFx0XHRcdGNvbXBsZXRlOiBmdW5jdGlvbih4aHIpIHtcblx0XHRcdFx0XHRtb2NrSGFuZGxlci5yZXNwb25zZVhNTCA9IHhoci5yZXNwb25zZVhNTDtcblx0XHRcdFx0XHRtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgPSB4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgICAgICAgICAgICAgICAvLyBEb24ndCBvdmVycmlkZSB0aGUgaGFuZGxlciBzdGF0dXMvc3RhdHVzVGV4dCBpZiBpdCdzIHNwZWNpZmllZCBieSB0aGUgY29uZmlnXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0RlZmF1bHRTZXR0aW5nKG1vY2tIYW5kbGVyLCAnc3RhdHVzJykpIHtcblx0XHRcdFx0XHQgICAgbW9ja0hhbmRsZXIuc3RhdHVzID0geGhyLnN0YXR1cztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNEZWZhdWx0U2V0dGluZyhtb2NrSGFuZGxlciwgJ3N0YXR1c1RleHQnKSkge1xuXHRcdFx0XHRcdCAgICBtb2NrSGFuZGxlci5zdGF0dXNUZXh0ID0geGhyLnN0YXR1c1RleHQ7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuXHRcdFx0XHRcdHRoaXMucmVzcG9uc2VUaW1lciA9IHNldFRpbWVvdXQocHJvY2VzcywgbW9ja0hhbmRsZXIucmVzcG9uc2VUaW1lIHx8IDApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gdHlwZSA9PSAnUE9TVCcgfHwgJ0dFVCcgfHwgJ0RFTEVURSdcblx0XHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmFzeW5jID09PSBmYWxzZSApIHtcblx0XHRcdFx0Ly8gVE9ETzogQmxvY2tpbmcgZGVsYXlcblx0XHRcdFx0cHJvY2VzcygpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5yZXNwb25zZVRpbWVyID0gc2V0VGltZW91dChwcm9jZXNzLCBtb2NrSGFuZGxlci5yZXNwb25zZVRpbWUgfHwgNTApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIENvbnN0cnVjdCBhIG1vY2tlZCBYSFIgT2JqZWN0XG5cdGZ1bmN0aW9uIHhocihtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MsIG9yaWdIYW5kbGVyKSB7XG5cdFx0Ly8gRXh0ZW5kIHdpdGggb3VyIGRlZmF1bHQgbW9ja2pheCBzZXR0aW5nc1xuXHRcdG1vY2tIYW5kbGVyID0gJC5leHRlbmQodHJ1ZSwge30sICQubW9ja2pheFNldHRpbmdzLCBtb2NrSGFuZGxlcik7XG5cblx0XHRpZiAodHlwZW9mIG1vY2tIYW5kbGVyLmhlYWRlcnMgPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRtb2NrSGFuZGxlci5oZWFkZXJzID0ge307XG5cdFx0fVxuXHRcdGlmICggbW9ja0hhbmRsZXIuY29udGVudFR5cGUgKSB7XG5cdFx0XHRtb2NrSGFuZGxlci5oZWFkZXJzWydjb250ZW50LXR5cGUnXSA9IG1vY2tIYW5kbGVyLmNvbnRlbnRUeXBlO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRzdGF0dXM6IG1vY2tIYW5kbGVyLnN0YXR1cyxcblx0XHRcdHN0YXR1c1RleHQ6IG1vY2tIYW5kbGVyLnN0YXR1c1RleHQsXG5cdFx0XHRyZWFkeVN0YXRlOiAxLFxuXHRcdFx0b3BlbjogZnVuY3Rpb24oKSB7IH0sXG5cdFx0XHRzZW5kOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0b3JpZ0hhbmRsZXIuZmlyZWQgPSB0cnVlO1xuXHRcdFx0XHRfeGhyU2VuZC5jYWxsKHRoaXMsIG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncyk7XG5cdFx0XHR9LFxuXHRcdFx0YWJvcnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjbGVhclRpbWVvdXQodGhpcy5yZXNwb25zZVRpbWVyKTtcblx0XHRcdH0sXG5cdFx0XHRzZXRSZXF1ZXN0SGVhZGVyOiBmdW5jdGlvbihoZWFkZXIsIHZhbHVlKSB7XG5cdFx0XHRcdG1vY2tIYW5kbGVyLmhlYWRlcnNbaGVhZGVyXSA9IHZhbHVlO1xuXHRcdFx0fSxcblx0XHRcdGdldFJlc3BvbnNlSGVhZGVyOiBmdW5jdGlvbihoZWFkZXIpIHtcblx0XHRcdFx0Ly8gJ0xhc3QtbW9kaWZpZWQnLCAnRXRhZycsICdjb250ZW50LXR5cGUnIGFyZSBhbGwgY2hlY2tlZCBieSBqUXVlcnlcblx0XHRcdFx0aWYgKCBtb2NrSGFuZGxlci5oZWFkZXJzICYmIG1vY2tIYW5kbGVyLmhlYWRlcnNbaGVhZGVyXSApIHtcblx0XHRcdFx0XHQvLyBSZXR1cm4gYXJiaXRyYXJ5IGhlYWRlcnNcblx0XHRcdFx0XHRyZXR1cm4gbW9ja0hhbmRsZXIuaGVhZGVyc1toZWFkZXJdO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCBoZWFkZXIudG9Mb3dlckNhc2UoKSA9PSAnbGFzdC1tb2RpZmllZCcgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG1vY2tIYW5kbGVyLmxhc3RNb2RpZmllZCB8fCAobmV3IERhdGUoKSkudG9TdHJpbmcoKTtcblx0XHRcdFx0fSBlbHNlIGlmICggaGVhZGVyLnRvTG93ZXJDYXNlKCkgPT0gJ2V0YWcnICkge1xuXHRcdFx0XHRcdHJldHVybiBtb2NrSGFuZGxlci5ldGFnIHx8ICcnO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCBoZWFkZXIudG9Mb3dlckNhc2UoKSA9PSAnY29udGVudC10eXBlJyApIHtcblx0XHRcdFx0XHRyZXR1cm4gbW9ja0hhbmRsZXIuY29udGVudFR5cGUgfHwgJ3RleHQvcGxhaW4nO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0Z2V0QWxsUmVzcG9uc2VIZWFkZXJzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGhlYWRlcnMgPSAnJztcblx0XHRcdFx0JC5lYWNoKG1vY2tIYW5kbGVyLmhlYWRlcnMsIGZ1bmN0aW9uKGssIHYpIHtcblx0XHRcdFx0XHRoZWFkZXJzICs9IGsgKyAnOiAnICsgdiArIFwiXFxuXCI7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXR1cm4gaGVhZGVycztcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cblx0Ly8gUHJvY2VzcyBhIEpTT05QIG1vY2sgcmVxdWVzdC5cblx0ZnVuY3Rpb24gcHJvY2Vzc0pzb25wTW9jayggcmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzICkge1xuXHRcdC8vIEhhbmRsZSBKU09OUCBQYXJhbWV0ZXIgQ2FsbGJhY2tzLCB3ZSBuZWVkIHRvIHJlcGxpY2F0ZSBzb21lIG9mIHRoZSBqUXVlcnkgY29yZSBoZXJlXG5cdFx0Ly8gYmVjYXVzZSB0aGVyZSBpc24ndCBhbiBlYXN5IGhvb2sgZm9yIHRoZSBjcm9zcyBkb21haW4gc2NyaXB0IHRhZyBvZiBqc29ucFxuXG5cdFx0cHJvY2Vzc0pzb25wVXJsKCByZXF1ZXN0U2V0dGluZ3MgKTtcblxuXHRcdHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSA9IFwianNvblwiO1xuXHRcdGlmKHJlcXVlc3RTZXR0aW5ncy5kYXRhICYmIENBTExCQUNLX1JFR0VYLnRlc3QocmVxdWVzdFNldHRpbmdzLmRhdGEpIHx8IENBTExCQUNLX1JFR0VYLnRlc3QocmVxdWVzdFNldHRpbmdzLnVybCkpIHtcblx0XHRcdGNyZWF0ZUpzb25wQ2FsbGJhY2socmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzKTtcblxuXHRcdFx0Ly8gV2UgbmVlZCB0byBtYWtlIHN1cmVcblx0XHRcdC8vIHRoYXQgYSBKU09OUCBzdHlsZSByZXNwb25zZSBpcyBleGVjdXRlZCBwcm9wZXJseVxuXG5cdFx0XHR2YXIgcnVybCA9IC9eKFxcdys6KT9cXC9cXC8oW15cXC8/I10rKS8sXG5cdFx0XHRcdHBhcnRzID0gcnVybC5leGVjKCByZXF1ZXN0U2V0dGluZ3MudXJsICksXG5cdFx0XHRcdHJlbW90ZSA9IHBhcnRzICYmIChwYXJ0c1sxXSAmJiBwYXJ0c1sxXSAhPT0gbG9jYXRpb24ucHJvdG9jb2wgfHwgcGFydHNbMl0gIT09IGxvY2F0aW9uLmhvc3QpO1xuXG5cdFx0XHRyZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgPSBcInNjcmlwdFwiO1xuXHRcdFx0aWYocmVxdWVzdFNldHRpbmdzLnR5cGUudG9VcHBlckNhc2UoKSA9PT0gXCJHRVRcIiAmJiByZW1vdGUgKSB7XG5cdFx0XHRcdHZhciBuZXdNb2NrUmV0dXJuID0gcHJvY2Vzc0pzb25wUmVxdWVzdCggcmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzICk7XG5cblx0XHRcdFx0Ly8gQ2hlY2sgaWYgd2UgYXJlIHN1cHBvc2VkIHRvIHJldHVybiBhIERlZmVycmVkIGJhY2sgdG8gdGhlIG1vY2sgY2FsbCwgb3IganVzdFxuXHRcdFx0XHQvLyBzaWduYWwgc3VjY2Vzc1xuXHRcdFx0XHRpZihuZXdNb2NrUmV0dXJuKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG5ld01vY2tSZXR1cm47XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHQvLyBBcHBlbmQgdGhlIHJlcXVpcmVkIGNhbGxiYWNrIHBhcmFtZXRlciB0byB0aGUgZW5kIG9mIHRoZSByZXF1ZXN0IFVSTCwgZm9yIGEgSlNPTlAgcmVxdWVzdFxuXHRmdW5jdGlvbiBwcm9jZXNzSnNvbnBVcmwoIHJlcXVlc3RTZXR0aW5ncyApIHtcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy50eXBlLnRvVXBwZXJDYXNlKCkgPT09IFwiR0VUXCIgKSB7XG5cdFx0XHRpZiAoICFDQUxMQkFDS19SRUdFWC50ZXN0KCByZXF1ZXN0U2V0dGluZ3MudXJsICkgKSB7XG5cdFx0XHRcdHJlcXVlc3RTZXR0aW5ncy51cmwgKz0gKC9cXD8vLnRlc3QoIHJlcXVlc3RTZXR0aW5ncy51cmwgKSA/IFwiJlwiIDogXCI/XCIpICtcblx0XHRcdFx0XHQocmVxdWVzdFNldHRpbmdzLmpzb25wIHx8IFwiY2FsbGJhY2tcIikgKyBcIj0/XCI7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICggIXJlcXVlc3RTZXR0aW5ncy5kYXRhIHx8ICFDQUxMQkFDS19SRUdFWC50ZXN0KHJlcXVlc3RTZXR0aW5ncy5kYXRhKSApIHtcblx0XHRcdHJlcXVlc3RTZXR0aW5ncy5kYXRhID0gKHJlcXVlc3RTZXR0aW5ncy5kYXRhID8gcmVxdWVzdFNldHRpbmdzLmRhdGEgKyBcIiZcIiA6IFwiXCIpICsgKHJlcXVlc3RTZXR0aW5ncy5qc29ucCB8fCBcImNhbGxiYWNrXCIpICsgXCI9P1wiO1xuXHRcdH1cblx0fVxuXG5cdC8vIFByb2Nlc3MgYSBKU09OUCByZXF1ZXN0IGJ5IGV2YWx1YXRpbmcgdGhlIG1vY2tlZCByZXNwb25zZSB0ZXh0XG5cdGZ1bmN0aW9uIHByb2Nlc3NKc29ucFJlcXVlc3QoIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyApIHtcblx0XHQvLyBTeW50aGVzaXplIHRoZSBtb2NrIHJlcXVlc3QgZm9yIGFkZGluZyBhIHNjcmlwdCB0YWdcblx0XHR2YXIgY2FsbGJhY2tDb250ZXh0ID0gb3JpZ1NldHRpbmdzICYmIG9yaWdTZXR0aW5ncy5jb250ZXh0IHx8IHJlcXVlc3RTZXR0aW5ncyxcblx0XHRcdG5ld01vY2sgPSBudWxsO1xuXG5cblx0XHQvLyBJZiB0aGUgcmVzcG9uc2UgaGFuZGxlciBvbiB0aGUgbW9vY2sgaXMgYSBmdW5jdGlvbiwgY2FsbCBpdFxuXHRcdGlmICggbW9ja0hhbmRsZXIucmVzcG9uc2UgJiYgJC5pc0Z1bmN0aW9uKG1vY2tIYW5kbGVyLnJlc3BvbnNlKSApIHtcblx0XHRcdG1vY2tIYW5kbGVyLnJlc3BvbnNlKG9yaWdTZXR0aW5ncyk7XG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0Ly8gRXZhbHVhdGUgdGhlIHJlc3BvbnNlVGV4dCBqYXZhc2NyaXB0IGluIGEgZ2xvYmFsIGNvbnRleHRcblx0XHRcdGlmKCB0eXBlb2YgbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ID09PSAnb2JqZWN0JyApIHtcblx0XHRcdFx0JC5nbG9iYWxFdmFsKCAnKCcgKyBKU09OLnN0cmluZ2lmeSggbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ICkgKyAnKScpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JC5nbG9iYWxFdmFsKCAnKCcgKyBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgKyAnKScpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIFN1Y2Nlc3NmdWwgcmVzcG9uc2Vcblx0XHRqc29ucFN1Y2Nlc3MoIHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0LCBtb2NrSGFuZGxlciApO1xuXHRcdGpzb25wQ29tcGxldGUoIHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0LCBtb2NrSGFuZGxlciApO1xuXG5cdFx0Ly8gSWYgd2UgYXJlIHJ1bm5pbmcgdW5kZXIgalF1ZXJ5IDEuNSssIHJldHVybiBhIGRlZmVycmVkIG9iamVjdFxuXHRcdGlmKCQuRGVmZXJyZWQpe1xuXHRcdFx0bmV3TW9jayA9IG5ldyAkLkRlZmVycmVkKCk7XG5cdFx0XHRpZih0eXBlb2YgbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ID09IFwib2JqZWN0XCIpe1xuXHRcdFx0XHRuZXdNb2NrLnJlc29sdmVXaXRoKCBjYWxsYmFja0NvbnRleHQsIFttb2NrSGFuZGxlci5yZXNwb25zZVRleHRdICk7XG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHRuZXdNb2NrLnJlc29sdmVXaXRoKCBjYWxsYmFja0NvbnRleHQsIFskLnBhcnNlSlNPTiggbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ICldICk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBuZXdNb2NrO1xuXHR9XG5cblxuXHQvLyBDcmVhdGUgdGhlIHJlcXVpcmVkIEpTT05QIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciB0aGUgcmVxdWVzdFxuXHRmdW5jdGlvbiBjcmVhdGVKc29ucENhbGxiYWNrKCByZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MgKSB7XG5cdFx0dmFyIGNhbGxiYWNrQ29udGV4dCA9IG9yaWdTZXR0aW5ncyAmJiBvcmlnU2V0dGluZ3MuY29udGV4dCB8fCByZXF1ZXN0U2V0dGluZ3M7XG5cdFx0dmFyIGpzb25wID0gcmVxdWVzdFNldHRpbmdzLmpzb25wQ2FsbGJhY2sgfHwgKFwianNvbnBcIiArIGpzYysrKTtcblxuXHRcdC8vIFJlcGxhY2UgdGhlID0/IHNlcXVlbmNlIGJvdGggaW4gdGhlIHF1ZXJ5IHN0cmluZyBhbmQgdGhlIGRhdGFcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5kYXRhICkge1xuXHRcdFx0cmVxdWVzdFNldHRpbmdzLmRhdGEgPSAocmVxdWVzdFNldHRpbmdzLmRhdGEgKyBcIlwiKS5yZXBsYWNlKENBTExCQUNLX1JFR0VYLCBcIj1cIiArIGpzb25wICsgXCIkMVwiKTtcblx0XHR9XG5cblx0XHRyZXF1ZXN0U2V0dGluZ3MudXJsID0gcmVxdWVzdFNldHRpbmdzLnVybC5yZXBsYWNlKENBTExCQUNLX1JFR0VYLCBcIj1cIiArIGpzb25wICsgXCIkMVwiKTtcblxuXG5cdFx0Ly8gSGFuZGxlIEpTT05QLXN0eWxlIGxvYWRpbmdcblx0XHR3aW5kb3dbIGpzb25wIF0gPSB3aW5kb3dbIGpzb25wIF0gfHwgZnVuY3Rpb24oIHRtcCApIHtcblx0XHRcdGRhdGEgPSB0bXA7XG5cdFx0XHRqc29ucFN1Y2Nlc3MoIHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0LCBtb2NrSGFuZGxlciApO1xuXHRcdFx0anNvbnBDb21wbGV0ZSggcmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyICk7XG5cdFx0XHQvLyBHYXJiYWdlIGNvbGxlY3Rcblx0XHRcdHdpbmRvd1sganNvbnAgXSA9IHVuZGVmaW5lZDtcblxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0ZGVsZXRlIHdpbmRvd1sganNvbnAgXTtcblx0XHRcdH0gY2F0Y2goZSkge31cblxuXHRcdFx0aWYgKCBoZWFkICkge1xuXHRcdFx0XHRoZWFkLnJlbW92ZUNoaWxkKCBzY3JpcHQgKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cblx0Ly8gVGhlIEpTT05QIHJlcXVlc3Qgd2FzIHN1Y2Nlc3NmdWxcblx0ZnVuY3Rpb24ganNvbnBTdWNjZXNzKHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0LCBtb2NrSGFuZGxlcikge1xuXHRcdC8vIElmIGEgbG9jYWwgY2FsbGJhY2sgd2FzIHNwZWNpZmllZCwgZmlyZSBpdCBhbmQgcGFzcyBpdCB0aGUgZGF0YVxuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLnN1Y2Nlc3MgKSB7XG5cdFx0XHRyZXF1ZXN0U2V0dGluZ3Muc3VjY2Vzcy5jYWxsKCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCB8fCBcIlwiLCBzdGF0dXMsIHt9ICk7XG5cdFx0fVxuXG5cdFx0Ly8gRmlyZSB0aGUgZ2xvYmFsIGNhbGxiYWNrXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZ2xvYmFsICkge1xuXHRcdFx0dHJpZ2dlcihyZXF1ZXN0U2V0dGluZ3MsIFwiYWpheFN1Y2Nlc3NcIiwgW3t9LCByZXF1ZXN0U2V0dGluZ3NdICk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gVGhlIEpTT05QIHJlcXVlc3Qgd2FzIGNvbXBsZXRlZFxuXHRmdW5jdGlvbiBqc29ucENvbXBsZXRlKHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0KSB7XG5cdFx0Ly8gUHJvY2VzcyByZXN1bHRcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5jb21wbGV0ZSApIHtcblx0XHRcdHJlcXVlc3RTZXR0aW5ncy5jb21wbGV0ZS5jYWxsKCBjYWxsYmFja0NvbnRleHQsIHt9ICwgc3RhdHVzICk7XG5cdFx0fVxuXG5cdFx0Ly8gVGhlIHJlcXVlc3Qgd2FzIGNvbXBsZXRlZFxuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmdsb2JhbCApIHtcblx0XHRcdHRyaWdnZXIoIFwiYWpheENvbXBsZXRlXCIsIFt7fSwgcmVxdWVzdFNldHRpbmdzXSApO1xuXHRcdH1cblxuXHRcdC8vIEhhbmRsZSB0aGUgZ2xvYmFsIEFKQVggY291bnRlclxuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmdsb2JhbCAmJiAhIC0tJC5hY3RpdmUgKSB7XG5cdFx0XHQkLmV2ZW50LnRyaWdnZXIoIFwiYWpheFN0b3BcIiApO1xuXHRcdH1cblx0fVxuXG5cblx0Ly8gVGhlIGNvcmUgJC5hamF4IHJlcGxhY2VtZW50LlxuXHRmdW5jdGlvbiBoYW5kbGVBamF4KCB1cmwsIG9yaWdTZXR0aW5ncyApIHtcblx0XHR2YXIgbW9ja1JlcXVlc3QsIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXI7XG5cblx0XHQvLyBJZiB1cmwgaXMgYW4gb2JqZWN0LCBzaW11bGF0ZSBwcmUtMS41IHNpZ25hdHVyZVxuXHRcdGlmICggdHlwZW9mIHVybCA9PT0gXCJvYmplY3RcIiApIHtcblx0XHRcdG9yaWdTZXR0aW5ncyA9IHVybDtcblx0XHRcdHVybCA9IHVuZGVmaW5lZDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gd29yayBhcm91bmQgdG8gc3VwcG9ydCAxLjUgc2lnbmF0dXJlXG5cdFx0XHRvcmlnU2V0dGluZ3MgPSBvcmlnU2V0dGluZ3MgfHwge307XG5cdFx0XHRvcmlnU2V0dGluZ3MudXJsID0gdXJsO1xuXHRcdH1cblxuXHRcdC8vIEV4dGVuZCB0aGUgb3JpZ2luYWwgc2V0dGluZ3MgZm9yIHRoZSByZXF1ZXN0XG5cdFx0cmVxdWVzdFNldHRpbmdzID0gJC5leHRlbmQodHJ1ZSwge30sICQuYWpheFNldHRpbmdzLCBvcmlnU2V0dGluZ3MpO1xuXG5cdFx0Ly8gSXRlcmF0ZSBvdmVyIG91ciBtb2NrIGhhbmRsZXJzIChpbiByZWdpc3RyYXRpb24gb3JkZXIpIHVudGlsIHdlIGZpbmRcblx0XHQvLyBvbmUgdGhhdCBpcyB3aWxsaW5nIHRvIGludGVyY2VwdCB0aGUgcmVxdWVzdFxuXHRcdGZvcih2YXIgayA9IDA7IGsgPCBtb2NrSGFuZGxlcnMubGVuZ3RoOyBrKyspIHtcblx0XHRcdGlmICggIW1vY2tIYW5kbGVyc1trXSApIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdG1vY2tIYW5kbGVyID0gZ2V0TW9ja0ZvclJlcXVlc3QoIG1vY2tIYW5kbGVyc1trXSwgcmVxdWVzdFNldHRpbmdzICk7XG5cdFx0XHRpZighbW9ja0hhbmRsZXIpIHtcblx0XHRcdFx0Ly8gTm8gdmFsaWQgbW9jayBmb3VuZCBmb3IgdGhpcyByZXF1ZXN0XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRtb2NrZWRBamF4Q2FsbHMucHVzaChyZXF1ZXN0U2V0dGluZ3MpO1xuXG5cdFx0XHQvLyBJZiBsb2dnaW5nIGlzIGVuYWJsZWQsIGxvZyB0aGUgbW9jayB0byB0aGUgY29uc29sZVxuXHRcdFx0JC5tb2NramF4U2V0dGluZ3MubG9nKCBtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzICk7XG5cblxuXHRcdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgJiYgcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlLnRvVXBwZXJDYXNlKCkgPT09ICdKU09OUCcgKSB7XG5cdFx0XHRcdGlmICgobW9ja1JlcXVlc3QgPSBwcm9jZXNzSnNvbnBNb2NrKCByZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MgKSkpIHtcblx0XHRcdFx0XHQvLyBUaGlzIG1vY2sgd2lsbCBoYW5kbGUgdGhlIEpTT05QIHJlcXVlc3Rcblx0XHRcdFx0XHRyZXR1cm4gbW9ja1JlcXVlc3Q7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXG5cdFx0XHQvLyBSZW1vdmVkIHRvIGZpeCAjNTQgLSBrZWVwIHRoZSBtb2NraW5nIGRhdGEgb2JqZWN0IGludGFjdFxuXHRcdFx0Ly9tb2NrSGFuZGxlci5kYXRhID0gcmVxdWVzdFNldHRpbmdzLmRhdGE7XG5cblx0XHRcdG1vY2tIYW5kbGVyLmNhY2hlID0gcmVxdWVzdFNldHRpbmdzLmNhY2hlO1xuXHRcdFx0bW9ja0hhbmRsZXIudGltZW91dCA9IHJlcXVlc3RTZXR0aW5ncy50aW1lb3V0O1xuXHRcdFx0bW9ja0hhbmRsZXIuZ2xvYmFsID0gcmVxdWVzdFNldHRpbmdzLmdsb2JhbDtcblxuXHRcdFx0Y29weVVybFBhcmFtZXRlcnMobW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyk7XG5cblx0XHRcdChmdW5jdGlvbihtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MsIG9yaWdIYW5kbGVyKSB7XG5cdFx0XHRcdG1vY2tSZXF1ZXN0ID0gX2FqYXguY2FsbCgkLCAkLmV4dGVuZCh0cnVlLCB7fSwgb3JpZ1NldHRpbmdzLCB7XG5cdFx0XHRcdFx0Ly8gTW9jayB0aGUgWEhSIG9iamVjdFxuXHRcdFx0XHRcdHhocjogZnVuY3Rpb24oKSB7IHJldHVybiB4aHIoIG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncywgb3JpZ0hhbmRsZXIgKTsgfVxuXHRcdFx0XHR9KSk7XG5cdFx0XHR9KShtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MsIG1vY2tIYW5kbGVyc1trXSk7XG5cblx0XHRcdHJldHVybiBtb2NrUmVxdWVzdDtcblx0XHR9XG5cblx0XHQvLyBXZSBkb24ndCBoYXZlIGEgbW9jayByZXF1ZXN0XG5cdFx0aWYoJC5tb2NramF4U2V0dGluZ3MudGhyb3dVbm1vY2tlZCA9PT0gdHJ1ZSkge1xuXHRcdFx0dGhyb3coJ0FKQVggbm90IG1vY2tlZDogJyArIG9yaWdTZXR0aW5ncy51cmwpO1xuXHRcdH1cblx0XHRlbHNlIHsgLy8gdHJpZ2dlciBhIG5vcm1hbCByZXF1ZXN0XG5cdFx0XHRyZXR1cm4gX2FqYXguYXBwbHkoJCwgW29yaWdTZXR0aW5nc10pO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQqIENvcGllcyBVUkwgcGFyYW1ldGVyIHZhbHVlcyBpZiB0aGV5IHdlcmUgY2FwdHVyZWQgYnkgYSByZWd1bGFyIGV4cHJlc3Npb25cblx0KiBAcGFyYW0ge09iamVjdH0gbW9ja0hhbmRsZXJcblx0KiBAcGFyYW0ge09iamVjdH0gb3JpZ1NldHRpbmdzXG5cdCovXG5cdGZ1bmN0aW9uIGNvcHlVcmxQYXJhbWV0ZXJzKG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MpIHtcblx0XHQvL3BhcmFtZXRlcnMgYXJlbid0IGNhcHR1cmVkIGlmIHRoZSBVUkwgaXNuJ3QgYSBSZWdFeHBcblx0XHRpZiAoIShtb2NrSGFuZGxlci51cmwgaW5zdGFuY2VvZiBSZWdFeHApKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdC8vaWYgbm8gVVJMIHBhcmFtcyB3ZXJlIGRlZmluZWQgb24gdGhlIGhhbmRsZXIsIGRvbid0IGF0dGVtcHQgYSBjYXB0dXJlXG5cdFx0aWYgKCFtb2NrSGFuZGxlci5oYXNPd25Qcm9wZXJ0eSgndXJsUGFyYW1zJykpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dmFyIGNhcHR1cmVzID0gbW9ja0hhbmRsZXIudXJsLmV4ZWMob3JpZ1NldHRpbmdzLnVybCk7XG5cdFx0Ly90aGUgd2hvbGUgUmVnRXhwIG1hdGNoIGlzIGFsd2F5cyB0aGUgZmlyc3QgdmFsdWUgaW4gdGhlIGNhcHR1cmUgcmVzdWx0c1xuXHRcdGlmIChjYXB0dXJlcy5sZW5ndGggPT09IDEpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y2FwdHVyZXMuc2hpZnQoKTtcblx0XHQvL3VzZSBoYW5kbGVyIHBhcmFtcyBhcyBrZXlzIGFuZCBjYXB0dXJlIHJlc3V0cyBhcyB2YWx1ZXNcblx0XHR2YXIgaSA9IDAsXG5cdFx0Y2FwdHVyZXNMZW5ndGggPSBjYXB0dXJlcy5sZW5ndGgsXG5cdFx0cGFyYW1zTGVuZ3RoID0gbW9ja0hhbmRsZXIudXJsUGFyYW1zLmxlbmd0aCxcblx0XHQvL2luIGNhc2UgdGhlIG51bWJlciBvZiBwYXJhbXMgc3BlY2lmaWVkIGlzIGxlc3MgdGhhbiBhY3R1YWwgY2FwdHVyZXNcblx0XHRtYXhJdGVyYXRpb25zID0gTWF0aC5taW4oY2FwdHVyZXNMZW5ndGgsIHBhcmFtc0xlbmd0aCksXG5cdFx0cGFyYW1WYWx1ZXMgPSB7fTtcblx0XHRmb3IgKGk7IGkgPCBtYXhJdGVyYXRpb25zOyBpKyspIHtcblx0XHRcdHZhciBrZXkgPSBtb2NrSGFuZGxlci51cmxQYXJhbXNbaV07XG5cdFx0XHRwYXJhbVZhbHVlc1trZXldID0gY2FwdHVyZXNbaV07XG5cdFx0fVxuXHRcdG9yaWdTZXR0aW5ncy51cmxQYXJhbXMgPSBwYXJhbVZhbHVlcztcblx0fVxuXG5cblx0Ly8gUHVibGljXG5cblx0JC5leHRlbmQoe1xuXHRcdGFqYXg6IGhhbmRsZUFqYXhcblx0fSk7XG5cblx0JC5tb2NramF4U2V0dGluZ3MgPSB7XG5cdFx0Ly91cmw6ICAgICAgICBudWxsLFxuXHRcdC8vdHlwZTogICAgICAgJ0dFVCcsXG5cdFx0bG9nOiAgICAgICAgICBmdW5jdGlvbiggbW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncyApIHtcblx0XHRcdGlmICggbW9ja0hhbmRsZXIubG9nZ2luZyA9PT0gZmFsc2UgfHxcblx0XHRcdFx0ICggdHlwZW9mIG1vY2tIYW5kbGVyLmxvZ2dpbmcgPT09ICd1bmRlZmluZWQnICYmICQubW9ja2pheFNldHRpbmdzLmxvZ2dpbmcgPT09IGZhbHNlICkgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGlmICggd2luZG93LmNvbnNvbGUgJiYgY29uc29sZS5sb2cgKSB7XG5cdFx0XHRcdHZhciBtZXNzYWdlID0gJ01PQ0sgJyArIHJlcXVlc3RTZXR0aW5ncy50eXBlLnRvVXBwZXJDYXNlKCkgKyAnOiAnICsgcmVxdWVzdFNldHRpbmdzLnVybDtcblx0XHRcdFx0dmFyIHJlcXVlc3QgPSAkLmV4dGVuZCh7fSwgcmVxdWVzdFNldHRpbmdzKTtcblxuXHRcdFx0XHRpZiAodHlwZW9mIGNvbnNvbGUubG9nID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2cobWVzc2FnZSwgcmVxdWVzdCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCBtZXNzYWdlICsgJyAnICsgSlNPTi5zdHJpbmdpZnkocmVxdWVzdCkgKTtcblx0XHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhtZXNzYWdlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXHRcdGxvZ2dpbmc6ICAgICAgIHRydWUsXG5cdFx0c3RhdHVzOiAgICAgICAgMjAwLFxuXHRcdHN0YXR1c1RleHQ6ICAgIFwiT0tcIixcblx0XHRyZXNwb25zZVRpbWU6ICA1MDAsXG5cdFx0aXNUaW1lb3V0OiAgICAgZmFsc2UsXG5cdFx0dGhyb3dVbm1vY2tlZDogZmFsc2UsXG5cdFx0Y29udGVudFR5cGU6ICAgJ3RleHQvcGxhaW4nLFxuXHRcdHJlc3BvbnNlOiAgICAgICcnLFxuXHRcdHJlc3BvbnNlVGV4dDogICcnLFxuXHRcdHJlc3BvbnNlWE1MOiAgICcnLFxuXHRcdHByb3h5OiAgICAgICAgICcnLFxuXHRcdHByb3h5VHlwZTogICAgICdHRVQnLFxuXG5cdFx0bGFzdE1vZGlmaWVkOiAgbnVsbCxcblx0XHRldGFnOiAgICAgICAgICAnJyxcblx0XHRoZWFkZXJzOiB7XG5cdFx0XHRldGFnOiAnSUpGQEgjQDkyM3VmODAyM2hGT0BJI0gjJyxcblx0XHRcdCdjb250ZW50LXR5cGUnIDogJ3RleHQvcGxhaW4nXG5cdFx0fVxuXHR9O1xuXG5cdCQubW9ja2pheCA9IGZ1bmN0aW9uKHNldHRpbmdzKSB7XG5cdFx0dmFyIGkgPSBtb2NrSGFuZGxlcnMubGVuZ3RoO1xuXHRcdG1vY2tIYW5kbGVyc1tpXSA9IHNldHRpbmdzO1xuXHRcdHJldHVybiBpO1xuXHR9O1xuXHQkLm1vY2tqYXhDbGVhciA9IGZ1bmN0aW9uKGkpIHtcblx0XHRpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT0gMSApIHtcblx0XHRcdG1vY2tIYW5kbGVyc1tpXSA9IG51bGw7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG1vY2tIYW5kbGVycyA9IFtdO1xuXHRcdH1cblx0XHRtb2NrZWRBamF4Q2FsbHMgPSBbXTtcblx0fTtcblx0JC5tb2NramF4LmhhbmRsZXIgPSBmdW5jdGlvbihpKSB7XG5cdFx0aWYgKCBhcmd1bWVudHMubGVuZ3RoID09IDEgKSB7XG5cdFx0XHRyZXR1cm4gbW9ja0hhbmRsZXJzW2ldO1xuXHRcdH1cblx0fTtcblx0JC5tb2NramF4Lm1vY2tlZEFqYXhDYWxscyA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBtb2NrZWRBamF4Q2FsbHM7XG5cdH07XG59KShqUXVlcnkpOyIsIi8qKlxuKiAgQWpheCBBdXRvY29tcGxldGUgZm9yIGpRdWVyeSwgdmVyc2lvbiAldmVyc2lvbiVcbiogIChjKSAyMDE1IFRvbWFzIEtpcmRhXG4qXG4qICBBamF4IEF1dG9jb21wbGV0ZSBmb3IgalF1ZXJ5IGlzIGZyZWVseSBkaXN0cmlidXRhYmxlIHVuZGVyIHRoZSB0ZXJtcyBvZiBhbiBNSVQtc3R5bGUgbGljZW5zZS5cbiogIEZvciBkZXRhaWxzLCBzZWUgdGhlIHdlYiBzaXRlOiBodHRwczovL2dpdGh1Yi5jb20vZGV2YnJpZGdlL2pRdWVyeS1BdXRvY29tcGxldGVcbiovXG5cbi8qanNsaW50ICBicm93c2VyOiB0cnVlLCB3aGl0ZTogdHJ1ZSwgcGx1c3BsdXM6IHRydWUsIHZhcnM6IHRydWUgKi9cbi8qZ2xvYmFsIGRlZmluZSwgd2luZG93LCBkb2N1bWVudCwgalF1ZXJ5LCBleHBvcnRzLCByZXF1aXJlICovXG5cbi8vIEV4cG9zZSBwbHVnaW4gYXMgYW4gQU1EIG1vZHVsZSBpZiBBTUQgbG9hZGVyIGlzIHByZXNlbnQ6XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgICAgIGRlZmluZShbJ2pxdWVyeSddLCBmYWN0b3J5KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgcmVxdWlyZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBCcm93c2VyaWZ5XG4gICAgICAgIGZhY3RvcnkocmVxdWlyZSgnanF1ZXJ5JykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEJyb3dzZXIgZ2xvYmFsc1xuICAgICAgICBmYWN0b3J5KGpRdWVyeSk7XG4gICAgfVxufShmdW5jdGlvbiAoJCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhclxuICAgICAgICB1dGlscyA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVzY2FwZVJlZ0V4Q2hhcnM6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvW1xcLVxcW1xcXVxcL1xce1xcfVxcKFxcKVxcKlxcK1xcP1xcLlxcXFxcXF5cXCRcXHxdL2csIFwiXFxcXCQmXCIpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY3JlYXRlTm9kZTogZnVuY3Rpb24gKGNvbnRhaW5lckNsYXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICAgICAgZGl2LmNsYXNzTmFtZSA9IGNvbnRhaW5lckNsYXNzO1xuICAgICAgICAgICAgICAgICAgICBkaXYuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICAgICAgICAgICAgICBkaXYuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRpdjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KCkpLFxuXG4gICAgICAgIGtleXMgPSB7XG4gICAgICAgICAgICBFU0M6IDI3LFxuICAgICAgICAgICAgVEFCOiA5LFxuICAgICAgICAgICAgUkVUVVJOOiAxMyxcbiAgICAgICAgICAgIExFRlQ6IDM3LFxuICAgICAgICAgICAgVVA6IDM4LFxuICAgICAgICAgICAgUklHSFQ6IDM5LFxuICAgICAgICAgICAgRE9XTjogNDBcbiAgICAgICAgfTtcblxuICAgIGZ1bmN0aW9uIEF1dG9jb21wbGV0ZShlbCwgb3B0aW9ucykge1xuICAgICAgICB2YXIgbm9vcCA9IGZ1bmN0aW9uICgpIHsgfSxcbiAgICAgICAgICAgIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgZGVmYXVsdHMgPSB7XG4gICAgICAgICAgICAgICAgYWpheFNldHRpbmdzOiB7fSxcbiAgICAgICAgICAgICAgICBhdXRvU2VsZWN0Rmlyc3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGFwcGVuZFRvOiBkb2N1bWVudC5ib2R5LFxuICAgICAgICAgICAgICAgIHNlcnZpY2VVcmw6IG51bGwsXG4gICAgICAgICAgICAgICAgbG9va3VwOiBudWxsLFxuICAgICAgICAgICAgICAgIG9uU2VsZWN0OiBudWxsLFxuICAgICAgICAgICAgICAgIHdpZHRoOiAnYXV0bycsXG4gICAgICAgICAgICAgICAgbWluQ2hhcnM6IDEsXG4gICAgICAgICAgICAgICAgbWF4SGVpZ2h0OiAzMDAsXG4gICAgICAgICAgICAgICAgZGVmZXJSZXF1ZXN0Qnk6IDAsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7fSxcbiAgICAgICAgICAgICAgICBmb3JtYXRSZXN1bHQ6IEF1dG9jb21wbGV0ZS5mb3JtYXRSZXN1bHQsXG4gICAgICAgICAgICAgICAgZGVsaW1pdGVyOiBudWxsLFxuICAgICAgICAgICAgICAgIHpJbmRleDogOTk5OSxcbiAgICAgICAgICAgICAgICB0eXBlOiAnR0VUJyxcbiAgICAgICAgICAgICAgICBub0NhY2hlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBvblNlYXJjaFN0YXJ0OiBub29wLFxuICAgICAgICAgICAgICAgIG9uU2VhcmNoQ29tcGxldGU6IG5vb3AsXG4gICAgICAgICAgICAgICAgb25TZWFyY2hFcnJvcjogbm9vcCxcbiAgICAgICAgICAgICAgICBwcmVzZXJ2ZUlucHV0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb250YWluZXJDbGFzczogJ2F1dG9jb21wbGV0ZS1zdWdnZXN0aW9ucycsXG4gICAgICAgICAgICAgICAgdGFiRGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAndGV4dCcsXG4gICAgICAgICAgICAgICAgY3VycmVudFJlcXVlc3Q6IG51bGwsXG4gICAgICAgICAgICAgICAgdHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwcmV2ZW50QmFkUXVlcmllczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBsb29rdXBGaWx0ZXI6IGZ1bmN0aW9uIChzdWdnZXN0aW9uLCBvcmlnaW5hbFF1ZXJ5LCBxdWVyeUxvd2VyQ2FzZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbi52YWx1ZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnlMb3dlckNhc2UpICE9PSAtMTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBhcmFtTmFtZTogJ3F1ZXJ5JyxcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1SZXN1bHQ6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIHJlc3BvbnNlID09PSAnc3RyaW5nJyA/ICQucGFyc2VKU09OKHJlc3BvbnNlKSA6IHJlc3BvbnNlO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2hvd05vU3VnZ2VzdGlvbk5vdGljZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgbm9TdWdnZXN0aW9uTm90aWNlOiAnTm8gcmVzdWx0cycsXG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb246ICdib3R0b20nLFxuICAgICAgICAgICAgICAgIGZvcmNlRml4UG9zaXRpb246IGZhbHNlXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIC8vIFNoYXJlZCB2YXJpYWJsZXM6XG4gICAgICAgIHRoYXQuZWxlbWVudCA9IGVsO1xuICAgICAgICB0aGF0LmVsID0gJChlbCk7XG4gICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSBbXTtcbiAgICAgICAgdGhhdC5iYWRRdWVyaWVzID0gW107XG4gICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgICAgICB0aGF0LmN1cnJlbnRWYWx1ZSA9IHRoYXQuZWxlbWVudC52YWx1ZTtcbiAgICAgICAgdGhhdC5pbnRlcnZhbElkID0gMDtcbiAgICAgICAgdGhhdC5jYWNoZWRSZXNwb25zZSA9IHt9O1xuICAgICAgICB0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwgPSBudWxsO1xuICAgICAgICB0aGF0Lm9uQ2hhbmdlID0gbnVsbDtcbiAgICAgICAgdGhhdC5pc0xvY2FsID0gZmFsc2U7XG4gICAgICAgIHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIgPSBudWxsO1xuICAgICAgICB0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIgPSBudWxsO1xuICAgICAgICB0aGF0Lm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgICAgICB0aGF0LmNsYXNzZXMgPSB7XG4gICAgICAgICAgICBzZWxlY3RlZDogJ2F1dG9jb21wbGV0ZS1zZWxlY3RlZCcsXG4gICAgICAgICAgICBzdWdnZXN0aW9uOiAnYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb24nXG4gICAgICAgIH07XG4gICAgICAgIHRoYXQuaGludCA9IG51bGw7XG4gICAgICAgIHRoYXQuaGludFZhbHVlID0gJyc7XG4gICAgICAgIHRoYXQuc2VsZWN0aW9uID0gbnVsbDtcblxuICAgICAgICAvLyBJbml0aWFsaXplIGFuZCBzZXQgb3B0aW9uczpcbiAgICAgICAgdGhhdC5pbml0aWFsaXplKCk7XG4gICAgICAgIHRoYXQuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICB9XG5cbiAgICBBdXRvY29tcGxldGUudXRpbHMgPSB1dGlscztcblxuICAgICQuQXV0b2NvbXBsZXRlID0gQXV0b2NvbXBsZXRlO1xuXG4gICAgQXV0b2NvbXBsZXRlLmZvcm1hdFJlc3VsdCA9IGZ1bmN0aW9uIChzdWdnZXN0aW9uLCBjdXJyZW50VmFsdWUpIHtcbiAgICAgICAgLy8gRG8gbm90IHJlcGxhY2UgYW55dGhpbmcgaWYgdGhlcmUgY3VycmVudCB2YWx1ZSBpcyBlbXB0eVxuICAgICAgICBpZiAoIWN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb24udmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciBwYXR0ZXJuID0gJygnICsgdXRpbHMuZXNjYXBlUmVnRXhDaGFycyhjdXJyZW50VmFsdWUpICsgJyknO1xuXG4gICAgICAgIHJldHVybiBzdWdnZXN0aW9uLnZhbHVlXG4gICAgICAgICAgICAucmVwbGFjZShuZXcgUmVnRXhwKHBhdHRlcm4sICdnaScpLCAnPHN0cm9uZz4kMTxcXC9zdHJvbmc+JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgICAgICAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvJmx0OyhcXC8/c3Ryb25nKSZndDsvZywgJzwkMT4nKTtcbiAgICB9O1xuXG4gICAgQXV0b2NvbXBsZXRlLnByb3RvdHlwZSA9IHtcblxuICAgICAgICBraWxsZXJGbjogbnVsbCxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgc3VnZ2VzdGlvblNlbGVjdG9yID0gJy4nICsgdGhhdC5jbGFzc2VzLnN1Z2dlc3Rpb24sXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSB0aGF0LmNsYXNzZXMuc2VsZWN0ZWQsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBjb250YWluZXI7XG5cbiAgICAgICAgICAgIC8vIFJlbW92ZSBhdXRvY29tcGxldGUgYXR0cmlidXRlIHRvIHByZXZlbnQgbmF0aXZlIHN1Z2dlc3Rpb25zOlxuICAgICAgICAgICAgdGhhdC5lbGVtZW50LnNldEF0dHJpYnV0ZSgnYXV0b2NvbXBsZXRlJywgJ29mZicpO1xuXG4gICAgICAgICAgICB0aGF0LmtpbGxlckZuID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoJChlLnRhcmdldCkuY2xvc2VzdCgnLicgKyB0aGF0Lm9wdGlvbnMuY29udGFpbmVyQ2xhc3MpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmtpbGxTdWdnZXN0aW9ucygpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmRpc2FibGVLaWxsZXJGbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIGh0bWwoKSBkZWFscyB3aXRoIG1hbnkgdHlwZXM6IGh0bWxTdHJpbmcgb3IgRWxlbWVudCBvciBBcnJheSBvciBqUXVlcnlcbiAgICAgICAgICAgIHRoYXQubm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQoJzxkaXYgY2xhc3M9XCJhdXRvY29tcGxldGUtbm8tc3VnZ2VzdGlvblwiPjwvZGl2PicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaHRtbCh0aGlzLm9wdGlvbnMubm9TdWdnZXN0aW9uTm90aWNlKS5nZXQoMCk7XG5cbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIgPSBBdXRvY29tcGxldGUudXRpbHMuY3JlYXRlTm9kZShvcHRpb25zLmNvbnRhaW5lckNsYXNzKTtcblxuICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZFRvKG9wdGlvbnMuYXBwZW5kVG8pO1xuXG4gICAgICAgICAgICAvLyBPbmx5IHNldCB3aWR0aCBpZiBpdCB3YXMgcHJvdmlkZWQ6XG4gICAgICAgICAgICBpZiAob3B0aW9ucy53aWR0aCAhPT0gJ2F1dG8nKSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLndpZHRoKG9wdGlvbnMud2lkdGgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBMaXN0ZW4gZm9yIG1vdXNlIG92ZXIgZXZlbnQgb24gc3VnZ2VzdGlvbnMgbGlzdDpcbiAgICAgICAgICAgIGNvbnRhaW5lci5vbignbW91c2VvdmVyLmF1dG9jb21wbGV0ZScsIHN1Z2dlc3Rpb25TZWxlY3RvciwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoYXQuYWN0aXZhdGUoJCh0aGlzKS5kYXRhKCdpbmRleCcpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBEZXNlbGVjdCBhY3RpdmUgZWxlbWVudCB3aGVuIG1vdXNlIGxlYXZlcyBzdWdnZXN0aW9ucyBjb250YWluZXI6XG4gICAgICAgICAgICBjb250YWluZXIub24oJ21vdXNlb3V0LmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuY2hpbGRyZW4oJy4nICsgc2VsZWN0ZWQpLnJlbW92ZUNsYXNzKHNlbGVjdGVkKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBMaXN0ZW4gZm9yIGNsaWNrIGV2ZW50IG9uIHN1Z2dlc3Rpb25zIGxpc3Q6XG4gICAgICAgICAgICBjb250YWluZXIub24oJ2NsaWNrLmF1dG9jb21wbGV0ZScsIHN1Z2dlc3Rpb25TZWxlY3RvciwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KCQodGhpcykuZGF0YSgnaW5kZXgnKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbkNhcHR1cmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoYXQudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuYXV0b2NvbXBsZXRlJywgdGhhdC5maXhQb3NpdGlvbkNhcHR1cmUpO1xuXG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdrZXlkb3duLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlQcmVzcyhlKTsgfSk7XG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdrZXl1cC5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5VXAoZSk7IH0pO1xuICAgICAgICAgICAgdGhhdC5lbC5vbignYmx1ci5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoKSB7IHRoYXQub25CbHVyKCk7IH0pO1xuICAgICAgICAgICAgdGhhdC5lbC5vbignZm9jdXMuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKCkgeyB0aGF0Lm9uRm9jdXMoKTsgfSk7XG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdjaGFuZ2UuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVVwKGUpOyB9KTtcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2lucHV0LmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlVcChlKTsgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Gb2N1czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmVsLnZhbCgpLmxlbmd0aCA+PSB0aGF0Lm9wdGlvbnMubWluQ2hhcnMpIHtcbiAgICAgICAgICAgICAgICB0aGF0Lm9uVmFsdWVDaGFuZ2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbkJsdXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuZW5hYmxlS2lsbGVyRm4oKTtcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIGFib3J0QWpheDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKHRoYXQuY3VycmVudFJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgICAgICAgICAgdGhhdC5jdXJyZW50UmVxdWVzdCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0T3B0aW9uczogZnVuY3Rpb24gKHN1cHBsaWVkT3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnM7XG5cbiAgICAgICAgICAgICQuZXh0ZW5kKG9wdGlvbnMsIHN1cHBsaWVkT3B0aW9ucyk7XG5cbiAgICAgICAgICAgIHRoYXQuaXNMb2NhbCA9ICQuaXNBcnJheShvcHRpb25zLmxvb2t1cCk7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmlzTG9jYWwpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmxvb2t1cCA9IHRoYXQudmVyaWZ5U3VnZ2VzdGlvbnNGb3JtYXQob3B0aW9ucy5sb29rdXApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvcHRpb25zLm9yaWVudGF0aW9uID0gdGhhdC52YWxpZGF0ZU9yaWVudGF0aW9uKG9wdGlvbnMub3JpZW50YXRpb24sICdib3R0b20nKTtcblxuICAgICAgICAgICAgLy8gQWRqdXN0IGhlaWdodCwgd2lkdGggYW5kIHotaW5kZXg6XG4gICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLmNzcyh7XG4gICAgICAgICAgICAgICAgJ21heC1oZWlnaHQnOiBvcHRpb25zLm1heEhlaWdodCArICdweCcsXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogb3B0aW9ucy53aWR0aCArICdweCcsXG4gICAgICAgICAgICAgICAgJ3otaW5kZXgnOiBvcHRpb25zLnpJbmRleFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cblxuICAgICAgICBjbGVhckNhY2hlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmNhY2hlZFJlc3BvbnNlID0ge307XG4gICAgICAgICAgICB0aGlzLmJhZFF1ZXJpZXMgPSBbXTtcbiAgICAgICAgfSxcblxuICAgICAgICBjbGVhcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5jbGVhckNhY2hlKCk7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRWYWx1ZSA9ICcnO1xuICAgICAgICAgICAgdGhpcy5zdWdnZXN0aW9ucyA9IFtdO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHRoYXQuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xuICAgICAgICAgICAgdGhhdC5hYm9ydEFqYXgoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbmFibGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBmaXhQb3NpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gVXNlIG9ubHkgd2hlbiBjb250YWluZXIgaGFzIGFscmVhZHkgaXRzIGNvbnRlbnRcblxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgICRjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lclBhcmVudCA9ICRjb250YWluZXIucGFyZW50KCkuZ2V0KDApO1xuICAgICAgICAgICAgLy8gRml4IHBvc2l0aW9uIGF1dG9tYXRpY2FsbHkgd2hlbiBhcHBlbmRlZCB0byBib2R5LlxuICAgICAgICAgICAgLy8gSW4gb3RoZXIgY2FzZXMgZm9yY2UgcGFyYW1ldGVyIG11c3QgYmUgZ2l2ZW4uXG4gICAgICAgICAgICBpZiAoY29udGFpbmVyUGFyZW50ICE9PSBkb2N1bWVudC5ib2R5ICYmICF0aGF0Lm9wdGlvbnMuZm9yY2VGaXhQb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2hvb3NlIG9yaWVudGF0aW9uXG4gICAgICAgICAgICB2YXIgb3JpZW50YXRpb24gPSB0aGF0Lm9wdGlvbnMub3JpZW50YXRpb24sXG4gICAgICAgICAgICAgICAgY29udGFpbmVySGVpZ2h0ID0gJGNvbnRhaW5lci5vdXRlckhlaWdodCgpLFxuICAgICAgICAgICAgICAgIGhlaWdodCA9IHRoYXQuZWwub3V0ZXJIZWlnaHQoKSxcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSB0aGF0LmVsLm9mZnNldCgpLFxuICAgICAgICAgICAgICAgIHN0eWxlcyA9IHsgJ3RvcCc6IG9mZnNldC50b3AsICdsZWZ0Jzogb2Zmc2V0LmxlZnQgfTtcblxuICAgICAgICAgICAgaWYgKG9yaWVudGF0aW9uID09PSAnYXV0bycpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmlld1BvcnRIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCksXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKSxcbiAgICAgICAgICAgICAgICAgICAgdG9wT3ZlcmZsb3cgPSAtc2Nyb2xsVG9wICsgb2Zmc2V0LnRvcCAtIGNvbnRhaW5lckhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgYm90dG9tT3ZlcmZsb3cgPSBzY3JvbGxUb3AgKyB2aWV3UG9ydEhlaWdodCAtIChvZmZzZXQudG9wICsgaGVpZ2h0ICsgY29udGFpbmVySGVpZ2h0KTtcblxuICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uID0gKE1hdGgubWF4KHRvcE92ZXJmbG93LCBib3R0b21PdmVyZmxvdykgPT09IHRvcE92ZXJmbG93KSA/ICd0b3AnIDogJ2JvdHRvbSc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcmllbnRhdGlvbiA9PT0gJ3RvcCcpIHtcbiAgICAgICAgICAgICAgICBzdHlsZXMudG9wICs9IC1jb250YWluZXJIZWlnaHQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN0eWxlcy50b3AgKz0gaGVpZ2h0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJZiBjb250YWluZXIgaXMgbm90IHBvc2l0aW9uZWQgdG8gYm9keSxcbiAgICAgICAgICAgIC8vIGNvcnJlY3QgaXRzIHBvc2l0aW9uIHVzaW5nIG9mZnNldCBwYXJlbnQgb2Zmc2V0XG4gICAgICAgICAgICBpZihjb250YWluZXJQYXJlbnQgIT09IGRvY3VtZW50LmJvZHkpIHtcbiAgICAgICAgICAgICAgICB2YXIgb3BhY2l0eSA9ICRjb250YWluZXIuY3NzKCdvcGFjaXR5JyksXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudE9mZnNldERpZmY7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGF0LnZpc2libGUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgJGNvbnRhaW5lci5jc3MoJ29wYWNpdHknLCAwKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHBhcmVudE9mZnNldERpZmYgPSAkY29udGFpbmVyLm9mZnNldFBhcmVudCgpLm9mZnNldCgpO1xuICAgICAgICAgICAgICAgIHN0eWxlcy50b3AgLT0gcGFyZW50T2Zmc2V0RGlmZi50b3A7XG4gICAgICAgICAgICAgICAgc3R5bGVzLmxlZnQgLT0gcGFyZW50T2Zmc2V0RGlmZi5sZWZ0O1xuXG4gICAgICAgICAgICAgICAgaWYgKCF0aGF0LnZpc2libGUpe1xuICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmNzcygnb3BhY2l0eScsIG9wYWNpdHkpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIC0ycHggdG8gYWNjb3VudCBmb3Igc3VnZ2VzdGlvbnMgYm9yZGVyLlxuICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy53aWR0aCA9PT0gJ2F1dG8nKSB7XG4gICAgICAgICAgICAgICAgc3R5bGVzLndpZHRoID0gKHRoYXQuZWwub3V0ZXJXaWR0aCgpIC0gMikgKyAncHgnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkY29udGFpbmVyLmNzcyhzdHlsZXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVuYWJsZUtpbGxlckZuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vbignY2xpY2suYXV0b2NvbXBsZXRlJywgdGhhdC5raWxsZXJGbik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzYWJsZUtpbGxlckZuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLmF1dG9jb21wbGV0ZScsIHRoYXQua2lsbGVyRm4pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGtpbGxTdWdnZXN0aW9uczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdGhhdC5zdG9wS2lsbFN1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgICB0aGF0LmludGVydmFsSWQgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGF0LnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhhdC5zdG9wS2lsbFN1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgICB9LCA1MCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3RvcEtpbGxTdWdnZXN0aW9uczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbElkKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc0N1cnNvckF0RW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgdmFsTGVuZ3RoID0gdGhhdC5lbC52YWwoKS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uU3RhcnQgPSB0aGF0LmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQsXG4gICAgICAgICAgICAgICAgcmFuZ2U7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2VsZWN0aW9uU3RhcnQgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGlvblN0YXJ0ID09PSB2YWxMZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmFuZ2UgPSBkb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgICAgICAgICByYW5nZS5tb3ZlU3RhcnQoJ2NoYXJhY3RlcicsIC12YWxMZW5ndGgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWxMZW5ndGggPT09IHJhbmdlLnRleHQubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25LZXlQcmVzczogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAgICAgLy8gSWYgc3VnZ2VzdGlvbnMgYXJlIGhpZGRlbiBhbmQgdXNlciBwcmVzc2VzIGFycm93IGRvd24sIGRpc3BsYXkgc3VnZ2VzdGlvbnM6XG4gICAgICAgICAgICBpZiAoIXRoYXQuZGlzYWJsZWQgJiYgIXRoYXQudmlzaWJsZSAmJiBlLndoaWNoID09PSBrZXlzLkRPV04gJiYgdGhhdC5jdXJyZW50VmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmRpc2FibGVkIHx8ICF0aGF0LnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5FU0M6XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5SSUdIVDpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuaGludCAmJiB0aGF0Lm9wdGlvbnMub25IaW50ICYmIHRoYXQuaXNDdXJzb3JBdEVuZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdEhpbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuVEFCOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5oaW50ICYmIHRoYXQub3B0aW9ucy5vbkhpbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0SGludCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCh0aGF0LnNlbGVjdGVkSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLnRhYkRpc2FibGVkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5SRVRVUk46XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCh0aGF0LnNlbGVjdGVkSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuVVA6XG4gICAgICAgICAgICAgICAgICAgIHRoYXQubW92ZVVwKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5ET1dOOlxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm1vdmVEb3duKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2FuY2VsIGV2ZW50IGlmIGZ1bmN0aW9uIGRpZCBub3QgcmV0dXJuOlxuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbktleVVwOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5kaXNhYmxlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3dpdGNoIChlLndoaWNoKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlVQOlxuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5ET1dOOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuY3VycmVudFZhbHVlICE9PSB0aGF0LmVsLnZhbCgpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5maW5kQmVzdEhpbnQoKTtcbiAgICAgICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLmRlZmVyUmVxdWVzdEJ5ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBEZWZlciBsb29rdXAgaW4gY2FzZSB3aGVuIHZhbHVlIGNoYW5nZXMgdmVyeSBxdWlja2x5OlxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uVmFsdWVDaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhhdC5vcHRpb25zLmRlZmVyUmVxdWVzdEJ5KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uVmFsdWVDaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25WYWx1ZUNoYW5nZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGF0LmVsLnZhbCgpLFxuICAgICAgICAgICAgICAgIHF1ZXJ5ID0gdGhhdC5nZXRRdWVyeSh2YWx1ZSk7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGlvbiAmJiB0aGF0LmN1cnJlbnRWYWx1ZSAhPT0gcXVlcnkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGlvbiA9IG51bGw7XG4gICAgICAgICAgICAgICAgKG9wdGlvbnMub25JbnZhbGlkYXRlU2VsZWN0aW9uIHx8ICQubm9vcCkuY2FsbCh0aGF0LmVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XG4gICAgICAgICAgICB0aGF0LmN1cnJlbnRWYWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGV4aXN0aW5nIHN1Z2dlc3Rpb24gZm9yIHRoZSBtYXRjaCBiZWZvcmUgcHJvY2VlZGluZzpcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQgJiYgdGhhdC5pc0V4YWN0TWF0Y2gocXVlcnkpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QoMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocXVlcnkubGVuZ3RoIDwgb3B0aW9ucy5taW5DaGFycykge1xuICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGF0LmdldFN1Z2dlc3Rpb25zKHF1ZXJ5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBpc0V4YWN0TWF0Y2g6IGZ1bmN0aW9uIChxdWVyeSkge1xuICAgICAgICAgICAgdmFyIHN1Z2dlc3Rpb25zID0gdGhpcy5zdWdnZXN0aW9ucztcblxuICAgICAgICAgICAgcmV0dXJuIChzdWdnZXN0aW9ucy5sZW5ndGggPT09IDEgJiYgc3VnZ2VzdGlvbnNbMF0udmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gcXVlcnkudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0UXVlcnk6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGRlbGltaXRlciA9IHRoaXMub3B0aW9ucy5kZWxpbWl0ZXIsXG4gICAgICAgICAgICAgICAgcGFydHM7XG5cbiAgICAgICAgICAgIGlmICghZGVsaW1pdGVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFydHMgPSB2YWx1ZS5zcGxpdChkZWxpbWl0ZXIpO1xuICAgICAgICAgICAgcmV0dXJuICQudHJpbShwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0U3VnZ2VzdGlvbnNMb2NhbDogZnVuY3Rpb24gKHF1ZXJ5KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBxdWVyeUxvd2VyQ2FzZSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCksXG4gICAgICAgICAgICAgICAgZmlsdGVyID0gb3B0aW9ucy5sb29rdXBGaWx0ZXIsXG4gICAgICAgICAgICAgICAgbGltaXQgPSBwYXJzZUludChvcHRpb25zLmxvb2t1cExpbWl0LCAxMCksXG4gICAgICAgICAgICAgICAgZGF0YTtcblxuICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9uczogJC5ncmVwKG9wdGlvbnMubG9va3VwLCBmdW5jdGlvbiAoc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmlsdGVyKHN1Z2dlc3Rpb24sIHF1ZXJ5LCBxdWVyeUxvd2VyQ2FzZSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChsaW1pdCAmJiBkYXRhLnN1Z2dlc3Rpb25zLmxlbmd0aCA+IGxpbWl0KSB7XG4gICAgICAgICAgICAgICAgZGF0YS5zdWdnZXN0aW9ucyA9IGRhdGEuc3VnZ2VzdGlvbnMuc2xpY2UoMCwgbGltaXQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTdWdnZXN0aW9uczogZnVuY3Rpb24gKHEpIHtcbiAgICAgICAgICAgIHZhciByZXNwb25zZSxcbiAgICAgICAgICAgICAgICB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIHNlcnZpY2VVcmwgPSBvcHRpb25zLnNlcnZpY2VVcmwsXG4gICAgICAgICAgICAgICAgcGFyYW1zLFxuICAgICAgICAgICAgICAgIGNhY2hlS2V5LFxuICAgICAgICAgICAgICAgIGFqYXhTZXR0aW5ncztcblxuICAgICAgICAgICAgb3B0aW9ucy5wYXJhbXNbb3B0aW9ucy5wYXJhbU5hbWVdID0gcTtcbiAgICAgICAgICAgIHBhcmFtcyA9IG9wdGlvbnMuaWdub3JlUGFyYW1zID8gbnVsbCA6IG9wdGlvbnMucGFyYW1zO1xuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5vblNlYXJjaFN0YXJ0LmNhbGwodGhhdC5lbGVtZW50LCBvcHRpb25zLnBhcmFtcykgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKG9wdGlvbnMubG9va3VwKSl7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5sb29rdXAocSwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IGRhdGEuc3VnZ2VzdGlvbnM7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIGRhdGEuc3VnZ2VzdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoYXQuaXNMb2NhbCkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gdGhhdC5nZXRTdWdnZXN0aW9uc0xvY2FsKHEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKHNlcnZpY2VVcmwpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VVcmwgPSBzZXJ2aWNlVXJsLmNhbGwodGhhdC5lbGVtZW50LCBxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FjaGVLZXkgPSBzZXJ2aWNlVXJsICsgJz8nICsgJC5wYXJhbShwYXJhbXMgfHwge30pO1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gdGhhdC5jYWNoZWRSZXNwb25zZVtjYWNoZUtleV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChyZXNwb25zZSAmJiAkLmlzQXJyYXkocmVzcG9uc2Uuc3VnZ2VzdGlvbnMpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IHJlc3BvbnNlLnN1Z2dlc3Rpb25zO1xuICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xuICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgcmVzcG9uc2Uuc3VnZ2VzdGlvbnMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghdGhhdC5pc0JhZFF1ZXJ5KHEpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5hYm9ydEFqYXgoKTtcblxuICAgICAgICAgICAgICAgIGFqYXhTZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBzZXJ2aWNlVXJsLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBwYXJhbXMsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IG9wdGlvbnMudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IG9wdGlvbnMuZGF0YVR5cGVcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgJC5leHRlbmQoYWpheFNldHRpbmdzLCBvcHRpb25zLmFqYXhTZXR0aW5ncyk7XG5cbiAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0ID0gJC5hamF4KGFqYXhTZXR0aW5ncykuZG9uZShmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gb3B0aW9ucy50cmFuc2Zvcm1SZXN1bHQoZGF0YSwgcSk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQucHJvY2Vzc1Jlc3BvbnNlKHJlc3VsdCwgcSwgY2FjaGVLZXkpO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIHJlc3VsdC5zdWdnZXN0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSkuZmFpbChmdW5jdGlvbiAoanFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hFcnJvci5jYWxsKHRoYXQuZWxlbWVudCwgcSwganFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaENvbXBsZXRlLmNhbGwodGhhdC5lbGVtZW50LCBxLCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNCYWRRdWVyeTogZnVuY3Rpb24gKHEpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5vcHRpb25zLnByZXZlbnRCYWRRdWVyaWVzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBiYWRRdWVyaWVzID0gdGhpcy5iYWRRdWVyaWVzLFxuICAgICAgICAgICAgICAgIGkgPSBiYWRRdWVyaWVzLmxlbmd0aDtcblxuICAgICAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgICAgICAgIGlmIChxLmluZGV4T2YoYmFkUXVlcmllc1tpXSkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGlkZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcik7XG5cbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24odGhhdC5vcHRpb25zLm9uSGlkZSkgJiYgdGhhdC52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5vcHRpb25zLm9uSGlkZS5jYWxsKHRoYXQuZWxlbWVudCwgY29udGFpbmVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcbiAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuaGlkZSgpO1xuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHN1Z2dlc3Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnN1Z2dlc3Rpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2hvd05vU3VnZ2VzdGlvbk5vdGljZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vU3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBncm91cEJ5ID0gb3B0aW9ucy5ncm91cEJ5LFxuICAgICAgICAgICAgICAgIGZvcm1hdFJlc3VsdCA9IG9wdGlvbnMuZm9ybWF0UmVzdWx0LFxuICAgICAgICAgICAgICAgIHZhbHVlID0gdGhhdC5nZXRRdWVyeSh0aGF0LmN1cnJlbnRWYWx1ZSksXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gdGhhdC5jbGFzc2VzLnN1Z2dlc3Rpb24sXG4gICAgICAgICAgICAgICAgY2xhc3NTZWxlY3RlZCA9IHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCxcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxuICAgICAgICAgICAgICAgIG5vU3VnZ2VzdGlvbnNDb250YWluZXIgPSAkKHRoYXQubm9TdWdnZXN0aW9uc0NvbnRhaW5lciksXG4gICAgICAgICAgICAgICAgYmVmb3JlUmVuZGVyID0gb3B0aW9ucy5iZWZvcmVSZW5kZXIsXG4gICAgICAgICAgICAgICAgaHRtbCA9ICcnLFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5LFxuICAgICAgICAgICAgICAgIGZvcm1hdEdyb3VwID0gZnVuY3Rpb24gKHN1Z2dlc3Rpb24sIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudENhdGVnb3J5ID0gc3VnZ2VzdGlvbi5kYXRhW2dyb3VwQnldO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2F0ZWdvcnkgPT09IGN1cnJlbnRDYXRlZ29yeSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeSA9IGN1cnJlbnRDYXRlZ29yeTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiYXV0b2NvbXBsZXRlLWdyb3VwXCI+PHN0cm9uZz4nICsgY2F0ZWdvcnkgKyAnPC9zdHJvbmc+PC9kaXY+JztcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dCAmJiB0aGF0LmlzRXhhY3RNYXRjaCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCgwKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEJ1aWxkIHN1Z2dlc3Rpb25zIGlubmVyIEhUTUw6XG4gICAgICAgICAgICAkLmVhY2godGhhdC5zdWdnZXN0aW9ucywgZnVuY3Rpb24gKGksIHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoZ3JvdXBCeSl7XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gZm9ybWF0R3JvdXAoc3VnZ2VzdGlvbiwgdmFsdWUsIGkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCInICsgY2xhc3NOYW1lICsgJ1wiIGRhdGEtaW5kZXg9XCInICsgaSArICdcIj4nICsgZm9ybWF0UmVzdWx0KHN1Z2dlc3Rpb24sIHZhbHVlKSArICc8L2Rpdj4nO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuYWRqdXN0Q29udGFpbmVyV2lkdGgoKTtcblxuICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lci5kZXRhY2goKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5odG1sKGh0bWwpO1xuXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKGJlZm9yZVJlbmRlcikpIHtcbiAgICAgICAgICAgICAgICBiZWZvcmVSZW5kZXIuY2FsbCh0aGF0LmVsZW1lbnQsIGNvbnRhaW5lcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5zaG93KCk7XG5cbiAgICAgICAgICAgIC8vIFNlbGVjdCBmaXJzdCB2YWx1ZSBieSBkZWZhdWx0OlxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuYXV0b1NlbGVjdEZpcnN0KSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wKDApO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jaGlsZHJlbignLicgKyBjbGFzc05hbWUpLmZpcnN0KCkuYWRkQ2xhc3MoY2xhc3NTZWxlY3RlZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQudmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICB0aGF0LmZpbmRCZXN0SGludCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG5vU3VnZ2VzdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKSxcbiAgICAgICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQodGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgdGhpcy5hZGp1c3RDb250YWluZXJXaWR0aCgpO1xuXG4gICAgICAgICAgICAvLyBTb21lIGV4cGxpY2l0IHN0ZXBzLiBCZSBjYXJlZnVsIGhlcmUgYXMgaXQgZWFzeSB0byBnZXRcbiAgICAgICAgICAgIC8vIG5vU3VnZ2VzdGlvbnNDb250YWluZXIgcmVtb3ZlZCBmcm9tIERPTSBpZiBub3QgZGV0YWNoZWQgcHJvcGVybHkuXG4gICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyLmRldGFjaCgpO1xuICAgICAgICAgICAgY29udGFpbmVyLmVtcHR5KCk7IC8vIGNsZWFuIHN1Z2dlc3Rpb25zIGlmIGFueVxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZChub1N1Z2dlc3Rpb25zQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xuXG4gICAgICAgICAgICBjb250YWluZXIuc2hvdygpO1xuICAgICAgICAgICAgdGhhdC52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGp1c3RDb250YWluZXJXaWR0aDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICB3aWR0aCxcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpO1xuXG4gICAgICAgICAgICAvLyBJZiB3aWR0aCBpcyBhdXRvLCBhZGp1c3Qgd2lkdGggYmVmb3JlIGRpc3BsYXlpbmcgc3VnZ2VzdGlvbnMsXG4gICAgICAgICAgICAvLyBiZWNhdXNlIGlmIGluc3RhbmNlIHdhcyBjcmVhdGVkIGJlZm9yZSBpbnB1dCBoYWQgd2lkdGgsIGl0IHdpbGwgYmUgemVyby5cbiAgICAgICAgICAgIC8vIEFsc28gaXQgYWRqdXN0cyBpZiBpbnB1dCB3aWR0aCBoYXMgY2hhbmdlZC5cbiAgICAgICAgICAgIC8vIC0ycHggdG8gYWNjb3VudCBmb3Igc3VnZ2VzdGlvbnMgYm9yZGVyLlxuICAgICAgICAgICAgaWYgKG9wdGlvbnMud2lkdGggPT09ICdhdXRvJykge1xuICAgICAgICAgICAgICAgIHdpZHRoID0gdGhhdC5lbC5vdXRlcldpZHRoKCkgLSAyO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci53aWR0aCh3aWR0aCA+IDAgPyB3aWR0aCA6IDMwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZmluZEJlc3RIaW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGF0LmVsLnZhbCgpLnRvTG93ZXJDYXNlKCksXG4gICAgICAgICAgICAgICAgYmVzdE1hdGNoID0gbnVsbDtcblxuICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJC5lYWNoKHRoYXQuc3VnZ2VzdGlvbnMsIGZ1bmN0aW9uIChpLCBzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZvdW5kTWF0Y2ggPSBzdWdnZXN0aW9uLnZhbHVlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZih2YWx1ZSkgPT09IDA7XG4gICAgICAgICAgICAgICAgaWYgKGZvdW5kTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoID0gc3VnZ2VzdGlvbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuICFmb3VuZE1hdGNoO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoYXQuc2lnbmFsSGludChiZXN0TWF0Y2gpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNpZ25hbEhpbnQ6IGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgaGludFZhbHVlID0gJycsXG4gICAgICAgICAgICAgICAgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICBpZiAoc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgICAgIGhpbnRWYWx1ZSA9IHRoYXQuY3VycmVudFZhbHVlICsgc3VnZ2VzdGlvbi52YWx1ZS5zdWJzdHIodGhhdC5jdXJyZW50VmFsdWUubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGF0LmhpbnRWYWx1ZSAhPT0gaGludFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5oaW50VmFsdWUgPSBoaW50VmFsdWU7XG4gICAgICAgICAgICAgICAgdGhhdC5oaW50ID0gc3VnZ2VzdGlvbjtcbiAgICAgICAgICAgICAgICAodGhpcy5vcHRpb25zLm9uSGludCB8fCAkLm5vb3ApKGhpbnRWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmVyaWZ5U3VnZ2VzdGlvbnNGb3JtYXQ6IGZ1bmN0aW9uIChzdWdnZXN0aW9ucykge1xuICAgICAgICAgICAgLy8gSWYgc3VnZ2VzdGlvbnMgaXMgc3RyaW5nIGFycmF5LCBjb252ZXJ0IHRoZW0gdG8gc3VwcG9ydGVkIGZvcm1hdDpcbiAgICAgICAgICAgIGlmIChzdWdnZXN0aW9ucy5sZW5ndGggJiYgdHlwZW9mIHN1Z2dlc3Rpb25zWzBdID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHJldHVybiAkLm1hcChzdWdnZXN0aW9ucywgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiB2YWx1ZSwgZGF0YTogbnVsbCB9O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbnM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmFsaWRhdGVPcmllbnRhdGlvbjogZnVuY3Rpb24ob3JpZW50YXRpb24sIGZhbGxiYWNrKSB7XG4gICAgICAgICAgICBvcmllbnRhdGlvbiA9ICQudHJpbShvcmllbnRhdGlvbiB8fCAnJykudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAgICAgaWYoJC5pbkFycmF5KG9yaWVudGF0aW9uLCBbJ2F1dG8nLCAnYm90dG9tJywgJ3RvcCddKSA9PT0gLTEpe1xuICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uID0gZmFsbGJhY2s7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBvcmllbnRhdGlvbjtcbiAgICAgICAgfSxcblxuICAgICAgICBwcm9jZXNzUmVzcG9uc2U6IGZ1bmN0aW9uIChyZXN1bHQsIG9yaWdpbmFsUXVlcnksIGNhY2hlS2V5KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucztcblxuICAgICAgICAgICAgcmVzdWx0LnN1Z2dlc3Rpb25zID0gdGhhdC52ZXJpZnlTdWdnZXN0aW9uc0Zvcm1hdChyZXN1bHQuc3VnZ2VzdGlvbnMpO1xuXG4gICAgICAgICAgICAvLyBDYWNoZSByZXN1bHRzIGlmIGNhY2hlIGlzIG5vdCBkaXNhYmxlZDpcbiAgICAgICAgICAgIGlmICghb3B0aW9ucy5ub0NhY2hlKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5jYWNoZWRSZXNwb25zZVtjYWNoZUtleV0gPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMucHJldmVudEJhZFF1ZXJpZXMgJiYgcmVzdWx0LnN1Z2dlc3Rpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmJhZFF1ZXJpZXMucHVzaChvcmlnaW5hbFF1ZXJ5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFJldHVybiBpZiBvcmlnaW5hbFF1ZXJ5IGlzIG5vdCBtYXRjaGluZyBjdXJyZW50IHF1ZXJ5OlxuICAgICAgICAgICAgaWYgKG9yaWdpbmFsUXVlcnkgIT09IHRoYXQuZ2V0UXVlcnkodGhhdC5jdXJyZW50VmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gcmVzdWx0LnN1Z2dlc3Rpb25zO1xuICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWN0aXZhdGU6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGFjdGl2ZUl0ZW0sXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSB0aGF0LmNsYXNzZXMuc2VsZWN0ZWQsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKSxcbiAgICAgICAgICAgICAgICBjaGlsZHJlbiA9IGNvbnRhaW5lci5maW5kKCcuJyArIHRoYXQuY2xhc3Nlcy5zdWdnZXN0aW9uKTtcblxuICAgICAgICAgICAgY29udGFpbmVyLmZpbmQoJy4nICsgc2VsZWN0ZWQpLnJlbW92ZUNsYXNzKHNlbGVjdGVkKTtcblxuICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gaW5kZXg7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggIT09IC0xICYmIGNoaWxkcmVuLmxlbmd0aCA+IHRoYXQuc2VsZWN0ZWRJbmRleCkge1xuICAgICAgICAgICAgICAgIGFjdGl2ZUl0ZW0gPSBjaGlsZHJlbi5nZXQodGhhdC5zZWxlY3RlZEluZGV4KTtcbiAgICAgICAgICAgICAgICAkKGFjdGl2ZUl0ZW0pLmFkZENsYXNzKHNlbGVjdGVkKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYWN0aXZlSXRlbTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VsZWN0SGludDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGkgPSAkLmluQXJyYXkodGhhdC5oaW50LCB0aGF0LnN1Z2dlc3Rpb25zKTtcblxuICAgICAgICAgICAgdGhhdC5zZWxlY3QoaSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VsZWN0OiBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICB0aGF0Lm9uU2VsZWN0KGkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1vdmVVcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuY2hpbGRyZW4oKS5maXJzdCgpLnJlbW92ZUNsYXNzKHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCk7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XG4gICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xuICAgICAgICAgICAgICAgIHRoYXQuZmluZEJlc3RIaW50KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LmFkanVzdFNjcm9sbCh0aGF0LnNlbGVjdGVkSW5kZXggLSAxKTtcbiAgICAgICAgfSxcblxuICAgICAgICBtb3ZlRG93bjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAodGhhdC5zdWdnZXN0aW9ucy5sZW5ndGggLSAxKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5hZGp1c3RTY3JvbGwodGhhdC5zZWxlY3RlZEluZGV4ICsgMSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRqdXN0U2Nyb2xsOiBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBhY3RpdmVJdGVtID0gdGhhdC5hY3RpdmF0ZShpbmRleCk7XG5cbiAgICAgICAgICAgIGlmICghYWN0aXZlSXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG9mZnNldFRvcCxcbiAgICAgICAgICAgICAgICB1cHBlckJvdW5kLFxuICAgICAgICAgICAgICAgIGxvd2VyQm91bmQsXG4gICAgICAgICAgICAgICAgaGVpZ2h0RGVsdGEgPSAkKGFjdGl2ZUl0ZW0pLm91dGVySGVpZ2h0KCk7XG5cbiAgICAgICAgICAgIG9mZnNldFRvcCA9IGFjdGl2ZUl0ZW0ub2Zmc2V0VG9wO1xuICAgICAgICAgICAgdXBwZXJCb3VuZCA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuc2Nyb2xsVG9wKCk7XG4gICAgICAgICAgICBsb3dlckJvdW5kID0gdXBwZXJCb3VuZCArIHRoYXQub3B0aW9ucy5tYXhIZWlnaHQgLSBoZWlnaHREZWx0YTtcblxuICAgICAgICAgICAgaWYgKG9mZnNldFRvcCA8IHVwcGVyQm91bmQpIHtcbiAgICAgICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnNjcm9sbFRvcChvZmZzZXRUb3ApO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvZmZzZXRUb3AgPiBsb3dlckJvdW5kKSB7XG4gICAgICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5zY3JvbGxUb3Aob2Zmc2V0VG9wIC0gdGhhdC5vcHRpb25zLm1heEhlaWdodCArIGhlaWdodERlbHRhKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF0aGF0Lm9wdGlvbnMucHJlc2VydmVJbnB1dCkge1xuICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuZ2V0VmFsdWUodGhhdC5zdWdnZXN0aW9uc1tpbmRleF0udmFsdWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoYXQuc2lnbmFsSGludChudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblNlbGVjdDogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb25TZWxlY3RDYWxsYmFjayA9IHRoYXQub3B0aW9ucy5vblNlbGVjdCxcbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9uID0gdGhhdC5zdWdnZXN0aW9uc1tpbmRleF07XG5cbiAgICAgICAgICAgIHRoYXQuY3VycmVudFZhbHVlID0gdGhhdC5nZXRWYWx1ZShzdWdnZXN0aW9uLnZhbHVlKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuY3VycmVudFZhbHVlICE9PSB0aGF0LmVsLnZhbCgpICYmICF0aGF0Lm9wdGlvbnMucHJlc2VydmVJbnB1dCkge1xuICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KG51bGwpO1xuICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IFtdO1xuICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb24gPSBzdWdnZXN0aW9uO1xuXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKG9uU2VsZWN0Q2FsbGJhY2spKSB7XG4gICAgICAgICAgICAgICAgb25TZWxlY3RDYWxsYmFjay5jYWxsKHRoYXQuZWxlbWVudCwgc3VnZ2VzdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0VmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGRlbGltaXRlciA9IHRoYXQub3B0aW9ucy5kZWxpbWl0ZXIsXG4gICAgICAgICAgICAgICAgY3VycmVudFZhbHVlLFxuICAgICAgICAgICAgICAgIHBhcnRzO1xuXG4gICAgICAgICAgICBpZiAoIWRlbGltaXRlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3VycmVudFZhbHVlID0gdGhhdC5jdXJyZW50VmFsdWU7XG4gICAgICAgICAgICBwYXJ0cyA9IGN1cnJlbnRWYWx1ZS5zcGxpdChkZWxpbWl0ZXIpO1xuXG4gICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gY3VycmVudFZhbHVlLnN1YnN0cigwLCBjdXJyZW50VmFsdWUubGVuZ3RoIC0gcGFydHNbcGFydHMubGVuZ3RoIC0gMV0ubGVuZ3RoKSArIHZhbHVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc3Bvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHRoYXQuZWwub2ZmKCcuYXV0b2NvbXBsZXRlJykucmVtb3ZlRGF0YSgnYXV0b2NvbXBsZXRlJyk7XG4gICAgICAgICAgICB0aGF0LmRpc2FibGVLaWxsZXJGbigpO1xuICAgICAgICAgICAgJCh3aW5kb3cpLm9mZigncmVzaXplLmF1dG9jb21wbGV0ZScsIHRoYXQuZml4UG9zaXRpb25DYXB0dXJlKTtcbiAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQ3JlYXRlIGNoYWluYWJsZSBqUXVlcnkgcGx1Z2luOlxuICAgICQuZm4uYXV0b2NvbXBsZXRlID0gJC5mbi5kZXZicmlkZ2VBdXRvY29tcGxldGUgPSBmdW5jdGlvbiAob3B0aW9ucywgYXJncykge1xuICAgICAgICB2YXIgZGF0YUtleSA9ICdhdXRvY29tcGxldGUnO1xuICAgICAgICAvLyBJZiBmdW5jdGlvbiBpbnZva2VkIHdpdGhvdXQgYXJndW1lbnQgcmV0dXJuXG4gICAgICAgIC8vIGluc3RhbmNlIG9mIHRoZSBmaXJzdCBtYXRjaGVkIGVsZW1lbnQ6XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maXJzdCgpLmRhdGEoZGF0YUtleSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBpbnB1dEVsZW1lbnQgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgIGluc3RhbmNlID0gaW5wdXRFbGVtZW50LmRhdGEoZGF0YUtleSk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UgJiYgdHlwZW9mIGluc3RhbmNlW29wdGlvbnNdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlW29wdGlvbnNdKGFyZ3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgaW5zdGFuY2UgYWxyZWFkeSBleGlzdHMsIGRlc3Ryb3kgaXQ6XG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlICYmIGluc3RhbmNlLmRpc3Bvc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UuZGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IG5ldyBBdXRvY29tcGxldGUodGhpcywgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgaW5wdXRFbGVtZW50LmRhdGEoZGF0YUtleSwgaW5zdGFuY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xufSkpO1xuIiwiJChmdW5jdGlvbigpIHtcbiAgICB2YXIgdXJsUHJlZml4ID0gJyc7XG5cbiAgICAkLmV4dGVuZCh7XG4gICAgICAgIGdldFVybFZhcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHZhcnMgPSBbXSwgaGFzaDtcbiAgICAgICAgICAgIHZhciBoYXNoZXMgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zbGljZSh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCc/JykgKyAxKS5zcGxpdCgnJicpO1xuICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGhhc2hlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGhhc2ggPSBoYXNoZXNbaV0uc3BsaXQoJz0nKTtcbiAgICAgICAgICAgICAgICB2YXJzLnB1c2goaGFzaFswXSk7XG4gICAgICAgICAgICAgICAgdmFyc1toYXNoWzBdXSA9IGhhc2hbMV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdmFycztcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0VXJsVmFyOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gJC5nZXRVcmxWYXJzKClbbmFtZV07XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBhamF4ID0ge1xuICAgICAgICBjb250cm9sOiB7XG4gICAgICAgICAgICBzZW5kRm9ybURhdGE6IGZ1bmN0aW9uKGZvcm0sIHVybCwgbG9nTmFtZSwgc3VjY2Vzc0NhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgJChkb2N1bWVudCkub24oIFwic3VibWl0XCIsIGZvcm0sIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGYgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhRm9ybSA9ICQodGhpcykuc2VyaWFsaXplKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN1Ym1pdEJ1dHRvbiA9ICQodGhpcykuZmluZChcImJ1dHRvblt0eXBlPXN1Ym1pdF1cIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9sZEJ1dHRvblZhbHVlID0gc3VibWl0QnV0dG9uLmh0bWwoKTtcblxuICAgICAgICAgICAgICAgICAgICBzdWJtaXRCdXR0b24uYXR0cihcImRpc2FibGVkXCIsIFwiZGlzYWJsZWRcIikuaHRtbCgnPGkgY2xhc3M9XCJmYSBmYS1jb2cgZmEtc3BpblwiPjwvaT4nKTtcblxuICAgICAgICAgICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiBcInBvc3RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogdXJsUHJlZml4ICsgdXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YUZvcm0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXNwb25zZSA9ICQucGFyc2VKU09OKHJlc3BvbnNlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHJlc3BvbnNlLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcihrZXkgaW4gcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHJlc3BvbnNlW2tleV1bMF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmb3JtRXJyb3IgPSBub3R5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCI8Yj7QntGI0LjQsdC60LAhPC9iPiBcIiArIHJlc3BvbnNlW2tleV1bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiAncmVsYXgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICd0b3BSaWdodCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDcwMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NDYWxsYmFjayhyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihqcXhocikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9ycy5jb250cm9sLmxvZyhsb2dOYW1lLCBqcXhocik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZm9ybUVycm9yQWpheCA9IG5vdHkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCi0LXRhdC90LjRh9C10YHQutC40LUg0YDQsNCx0L7RgtGLITwvYj48YnI+0JIg0LTQsNC90L3Ri9C5INC80L7QvNC10L3RgiDQstGA0LXQvNC10L3QuFwiICsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIg0L/RgNC+0LjQt9Cy0LXQtNGR0L3QvdC+0LUg0LTQtdC50YHRgtCy0LjQtSDQvdC10LLQvtC30LzQvtC20L3Qvi4g0J/QvtC/0YDQvtCx0YPQudGC0LUg0L/QvtC30LbQtS5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIg0J/RgNC40L3QvtGB0LjQvCDRgdCy0L7QuCDQuNC30LLQuNC90LXQvdC40Y8g0LfQsCDQvdC10YPQtNC+0LHRgdGC0LLQvi5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3dhcm5pbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiAxMDAwMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJtaXRCdXR0b24ucmVtb3ZlQXR0cihcImRpc2FibGVkXCIpLmh0bWwob2xkQnV0dG9uVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBlcnJvcnMgPSB7XG4gICAgICAgIGNvbnRyb2w6IHtcbiAgICAgICAgICAgIGxvZzogZnVuY3Rpb24odHlwZSwganF4aHIpIHtcbiAgICAgICAgICAgICAgICAkKFwiPGRpdiBpZD0nZXJyb3ItY29udGFpbmVyJyBzdHlsZT0nZGlzcGxheTpub25lOyc+XCIgKyBqcXhoci5yZXNwb25zZVRleHQgKyBcIjwvZGl2PlwiKS5hcHBlbmRUbyhcImJvZHlcIik7XG5cbiAgICAgICAgICAgICAgICB2YXIgZXJyb3JDb250YWluZXIgPSAkKFwiI2Vycm9yLWNvbnRhaW5lclwiKSxcbiAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2UgPSB0eXBlICsgXCI6IFwiICsganF4aHIuc3RhdHVzICsgXCIgXCIgKyBqcXhoci5zdGF0dXNUZXh0ICsgXCIgXCI7XG5cbiAgICAgICAgICAgICAgICBpZihlcnJvckNvbnRhaW5lci5maW5kKFwiaDI6Zmlyc3RcIikudGV4dCgpID09IFwiRGV0YWlsc1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZSArPSBcIi0gXCI7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yQ29udGFpbmVyLmZpbmQoXCJkaXZcIikuZWFjaChmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoaW5kZXggPiA0KSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGVsaW1pdGVyID0gXCIsIFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoaW5kZXggPT0gNCkgZGVsaW1pdGVyID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZSArPSAkKHRoaXMpLnRleHQoKSArIGRlbGltaXRlcjtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiBcInBvc3RcIixcbiAgICAgICAgICAgICAgICAgICAgdXJsOiB1cmxQcmVmaXggKyBcIi9hamF4LWVycm9yXCIsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IFwibWVzc2FnZT1cIiArIGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGVycm9yQ29udGFpbmVyLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHZhciBoZWFkZXIgPSB7XG4gICAgICAgIGNvbnRyb2w6IHtcbiAgICAgICAgICAgIGhlYWRlclN0b3Jlc01lbnU6ICQoXCIjdG9wXCIpLmZpbmQoXCIuc3RvcmVzXCIpLCBcbiAgICAgICAgICAgIHN0b3Jlc1N1Ym1lbnU6ICQoXCIjdG9wXCIpLmZpbmQoXCIuc3RvcmVzXCIpLmZpbmQoXCIuc3VibWVudVwiKSxcbiAgICAgICAgICAgIHBvcHVwU2lnblVwOiAkKFwiI3RvcFwiKS5maW5kKFwiLnBvcHVwX2NvbnRlbnRcIikuZmluZChcIi5zaWduLXVwXCIpLFxuICAgICAgICAgICAgc3RvcmVTaG93OiAnJyxcbiAgICAgICAgICAgIHN0b3JlSGlkZTogJycsXG4gICAgICAgICAgICBwYXNzd29yZFJlY292ZXJ5OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFzc3dvcmRSZWNvdmVyeUhhc2ggPSAkLmdldFVybFZhcihcInBydlwiKTtcblxuICAgICAgICAgICAgICAgIGlmKHBhc3N3b3JkUmVjb3ZlcnlIYXNoICE9PSB1bmRlZmluZWQgJiYgcGFzc3dvcmRSZWNvdmVyeUhhc2ggIT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogXCJwb3N0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IHVybFByZWZpeCArIFwiL3Bhc3N3b3JkLXJlY292ZXJ5L3VwZGF0ZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogXCJwcnY9XCIgKyBwYXNzd29yZFJlY292ZXJ5SGFzaCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoanF4aHIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcnMuY29udHJvbC5sb2coJ1Bhc3N3b3JkIFJlY292ZXJ5IFVwZGF0ZSBBamF4IEVycm9yJywganF4aHIpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZvcm1FcnJvckFqYXggPSBub3R5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCI8Yj7QotC10YXQvdC40YfQtdGB0LrQuNC1INGA0LDQsdC+0YLRiyE8L2I+PGJyPtCSINC00LDQvdC90YvQuSDQvNC+0LzQtdC90YIg0LLRgNC10LzQtdC90LhcIiArIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiINC/0YDQvtC40LfQstC10LTRkdC90L3QvtC1INC00LXQudGB0YLQstC40LUg0L3QtdCy0L7Qt9C80L7QttC90L4uINCf0L7Qv9GA0L7QsdGD0LnRgtC1INC/0L7Qt9C20LUuXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiINCf0YDQuNC90L7RgdC40Lwg0YHQstC+0Lgg0LjQt9Cy0LjQvdC10L3QuNGPINC30LAg0L3QtdGD0LTQvtCx0YHRgtCy0L4uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd3YXJuaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogMTAwMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXNwb25zZSA9ICQucGFyc2VKU09OKHJlc3BvbnNlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHJlc3BvbnNlLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcihrZXkgaW4gcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHJlc3BvbnNlW2tleV1bMF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXNzUmVjb3ZFcnJvciA9IG5vdHkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCe0YjQuNCx0LrQsCE8L2I+IFwiICsgcmVzcG9uc2Vba2V5XVswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA3MDAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFzc1JlY292U3VjY2VzcyA9IG5vdHkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCI8Yj7Qn9C+0LfQtNGA0LDQstC70Y/QtdC8ITwvYj48YnI+INCf0LDRgNC+0LvRjCDRg9GB0L/QtdGI0L3QviDQuNC30LzQtdC90ZHQvS4g0J3QvtCy0YvQuSDQv9Cw0YDQvtC70Yw6IDxiPlwiICsgcmVzcG9uc2UucGFzc3dvcmQgKyBcIjwvYj48YnI+PGJyPlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiAnYW5pbWF0ZWQgZmxpcE91dFgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlV2l0aDogWydidXR0b24nXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZShudWxsLCBudWxsLCAnLycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHNlbGYuaGVhZGVyU3RvcmVzTWVudS5ob3ZlcihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoJCh3aW5kb3cpLndpZHRoKCkgPiA5OTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChzZWxmLnN0b3JlSGlkZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnN0b3JlU2hvdyA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zdG9yZXNTdWJtZW51LmNsZWFyUXVldWUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnN0b3Jlc1N1Ym1lbnUuY3NzKFwiZGlzcGxheVwiLCBcImJsb2NrXCIpLmFuaW1hdGUoe1wib3BhY2l0eVwiOiAxfSwgMzUwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDIwMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoJCh3aW5kb3cpLndpZHRoKCkgPiA5OTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChzZWxmLnN0b3JlU2hvdyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnN0b3JlSGlkZSA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zdG9yZXNTdWJtZW51LmNsZWFyUXVldWUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnN0b3Jlc1N1Ym1lbnUuYW5pbWF0ZSh7XCJvcGFjaXR5XCI6IDB9LCAyMDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMzAwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5wYXNzd29yZFJlY292ZXJ5KCk7XG5cbiAgICAgICAgICAgICAgICBpZigkKHdpbmRvdykud2lkdGgoKSA+IDk5MSkge1xuICAgICAgICAgICAgICAgICAgICAkKFwiLmZvcm0tc2VhcmNoLWRwIGlucHV0XCIpLmF1dG9jb21wbGV0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlVXJsOiAnL3NlYXJjaCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBub0NhY2hlOiAndHJ1ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlclJlcXVlc3RCeTogMzAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBvblNlbGVjdDogZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gJy9zdG9yZXMvJyArIHN1Z2dlc3Rpb24uZGF0YS5yb3V0ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgJChcImZvcm1bbmFtZT1zZWFyY2hdIC5mYVwiKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KFwiZm9ybVwiKS5zdWJtaXQoKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICQoXCIuZG9icm9oZWFkIGksIC5kb2JybyAuY2lyY2xlIC5jIC5mYS1oZWFydFwiKS5hbmltbyh7YW5pbWF0aW9uOiBcInB1bHNlXCIsIGl0ZXJhdGU6IFwiaW5maW5pdGVcIn0pO1xuXG4gICAgICAgICAgICAgICAgdmFyIGFjdGl2ZUNhdGVnb3J5ID0gJChcIi5oZWFkZXItbmF2IG5hdiB1bC5wcmltYXJ5LW5hdiAuc3VibWVudSAudHJlZSBhW2hyZWY9J1wiK2xvY2F0aW9uLnBhdGhuYW1lK1wiJ11cIik7XG5cbiAgICAgICAgICAgICAgICBpZihhY3RpdmVDYXRlZ29yeS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZUNhdGVnb3J5LmFkZENsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBjb3Vwb25zID0ge1xuICAgICAgICBjb250cm9sOiB7XG4gICAgICAgICAgICBldmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICQuY291bnRkb3duLnJlZ2lvbmFsT3B0aW9uc1sncnUnXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxzOiBbJ9Cb0LXRgicsICfQnNC10YHRj9GG0LXQsicsICfQndC10LTQtdC70YwnLCAn0JTQvdC10LknLCAn0KfQsNGB0L7QsicsICfQnNC40L3Rg9GCJywgJ9Ch0LXQutGD0L3QtCddLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbHMxOiBbJ9CT0L7QtCcsICfQnNC10YHRj9GGJywgJ9Cd0LXQtNC10LvRjycsICfQlNC10L3RjCcsICfQp9Cw0YEnLCAn0JzQuNC90YPRgtCwJywgJ9Ch0LXQutGD0L3QtNCwJ10sXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsczI6IFsn0JPQvtC00LAnLCAn0JzQtdGB0Y/RhtCwJywgJ9Cd0LXQtNC10LvQuCcsICfQlNC90Y8nLCAn0KfQsNGB0LAnLCAn0JzQuNC90YPRgtGLJywgJ9Ch0LXQutGD0L3QtNGLJ10sXG4gICAgICAgICAgICAgICAgICAgIGNvbXBhY3RMYWJlbHM6IFsn0LsnLCAn0LwnLCAn0L0nLCAn0LQnXSwgY29tcGFjdExhYmVsczE6IFsn0LMnLCAn0LwnLCAn0L0nLCAn0LQnXSxcbiAgICAgICAgICAgICAgICAgICAgd2hpY2hMYWJlbHM6IGZ1bmN0aW9uKGFtb3VudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHVuaXRzID0gYW1vdW50ICUgMTA7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGVucyA9IE1hdGguZmxvb3IoKGFtb3VudCAlIDEwMCkgLyAxMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGFtb3VudCA9PSAxID8gMSA6ICh1bml0cyA+PSAyICYmIHVuaXRzIDw9IDQgJiYgdGVucyAhPSAxID8gMiA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKHVuaXRzID09IDEgJiYgdGVucyAhPSAxID8gMSA6IDApKSk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGRpZ2l0czogWycwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5J10sXG4gICAgICAgICAgICAgICAgICAgIHRpbWVTZXBhcmF0b3I6ICc6JywgXG4gICAgICAgICAgICAgICAgICAgIGlzUlRMOiBmYWxzZVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAkLmNvdW50ZG93bi5zZXREZWZhdWx0cygkLmNvdW50ZG93bi5yZWdpb25hbE9wdGlvbnNbJ3J1J10pO1xuXG4gICAgICAgICAgICAgICAgJChcIiN0b3BcIikuZmluZCgnLmNvdXBvbnMgLmN1cnJlbnQtY291cG9uIC50aW1lIC5jbG9jaycpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxmID0gJCh0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGVFbmQgPSBuZXcgRGF0ZShzZWxmLmF0dHIoXCJkYXRhLWVuZFwiKS5yZXBsYWNlKC8tL2csIFwiL1wiKSk7IFxuICAgICAgICAgICAgICAgICAgICBzZWxmLmNvdW50ZG93bih7dW50aWw6IGRhdGVFbmQsIGNvbXBhY3Q6IHRydWV9KTsgXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAkKFwiI3RvcFwiKS5maW5kKCcuY291cG9ucyAuY3VycmVudC1jb3Vwb24gLmNvdW50ZG93bi1hbW91bnQnKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZiA9ICQodGhpcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoc2VsZi50ZXh0KCkgPT0gXCIwMDowMDowMFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmNsb3Nlc3QoXCIuY3VycmVudC1jb3Vwb25cIikuZmluZChcIi5leHBpcnlcIikuY3NzKFwiZGlzcGxheVwiLCBcInRhYmxlLWNlbGxcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuY291cG9ucyAuY3VycmVudC1jb3Vwb24gLnRleHQgLmFkZGl0aW9uYWwgYVwiKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5uZXh0KFwic3BhblwiKS50b2dnbGUoKTtcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS50ZXh0KGZ1bmN0aW9uKGksIHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHYgPSB2LnNwbGl0KFwiIFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYodi5pbmRleE9mKCfQn9C+0LrQsNC30LDRgtGMJykgIT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2WzBdID0gJ9Ch0LrRgNGL0YLRjCc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZbMF0gPSAn0J/QvtC60LDQt9Cw0YLRjCc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHYgPSB2LmpvaW4oXCIgXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuY2F0ZWdvcmllcyAuc2VhcmNoLXN0b3JlLWNvdXBvbnMgaW5wdXRcIikua2V5dXAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpVmFsdWUgPSAkKHRoaXMpLnZhbCgpLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoaVZhbHVlICE9IFwiXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoXCIuY2F0ZWdvcmllcyAuY291cG9ucy1zdG9yZXMgbGkgYVwiKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdG9yZU5hbWUgPSAkKHRoaXMpLnRleHQoKS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoc3RvcmVOYW1lLmluZGV4T2YoaVZhbHVlKSAhPSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudCgpLmNzcyhcImRpc3BsYXlcIiwgXCJibG9ja1wiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudCgpLmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgJChcIi5jYXRlZ29yaWVzIC5jb3Vwb25zLXN0b3JlcyBsaVwiKS5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIiwgXCIjdG9wIC5jb3Vwb25zIC5jdXJyZW50LWNvdXBvbiAudGV4dCAuY291cG9uLWdvdG8gYVtocmVmPSNzaG93cHJvbW9jb2RlXVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGYgPSAkKHRoaXMpO1xuXG4gICAgICAgICAgICAgICAgICAgIHNlbGYubmV4dChcImRpdlwiKS5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIik7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYudGV4dChcItCY0YHQv9C+0LvRjNC30L7QstCw0YLRjCDQutGD0L/QvtC9XCIpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmF0dHIoXCJ0YXJnZXRcIiwgXCJfYmxhbmtcIik7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYXR0cihcImhyZWZcIiwgXCIvZ290by9jb3Vwb246XCIgKyBzZWxmLmNsb3Nlc3QoXCIuY3VycmVudC1jb3Vwb25cIikuYXR0cihcImRhdGEtdWlkXCIpKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSk7ICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHBvcHVwID0ge1xuICAgICAgICBjb250cm9sOiB7XG4gICAgICAgICAgICBzdGFyTm9taW5hdGlvbjogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgIHZhciBzdGFycyA9ICQoXCIjdG9wIC5wb3B1cCAuZmVlZGJhY2sucG9wdXAtY29udGVudCAucmF0aW5nIC5mYS13cmFwcGVyIC5mYVwiKTtcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgc3RhcnMucmVtb3ZlQ2xhc3MoXCJmYS1zdGFyXCIpLmFkZENsYXNzKFwiZmEtc3Rhci1vXCIpO1xuXG4gICAgICAgICAgICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgaW5kZXg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBzdGFycy5lcShpKS5yZW1vdmVDbGFzcyhcImZhLXN0YXItb1wiKS5hZGRDbGFzcyhcImZhLXN0YXJcIik7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVnaXN0cmF0aW9uOiBmdW5jdGlvbihzZXR0aW5ncykge1xuICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgICAgICBmb3IgKHNlbGVjdG9yIGluIHNldHRpbmdzKSB7XG4gICAgICAgICAgICAgICAgICAgICQoc2VsZWN0b3IpLnBvcHVwKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgOiBzZXR0aW5nc1tzZWxlY3Rvcl0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlIDogJ2h0bWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWZ0ZXJPcGVuOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWN0aXZlRWxlbWVudCA9ICQoXCIjdG9wIGEucG9wdXBfYWN0aXZlXCIpLmF0dHIoXCJocmVmXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qJyNsb2dpbicgOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdoMycgOiAn0JLRhdC+0LQg0L3QsCDRgdCw0LnRgicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdidXR0b24nIDogJ9CS0L7QudGC0Lgg0LIg0LvQuNGH0L3Ri9C5INC60LDQsdC40L3QtdGCJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2lucHV0W3R5cGU9cGFzc3dvcmRdJyA6ICfQktCy0LXQtNC40YLQtSDQstCw0Ygg0L/QsNGA0L7Qu9GMJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2g0JyA6ICfQmNC70Lgg0LLQvtC50LTQuNGC0LUg0Log0L3QsNC8INGBINC/0L7QvNC+0YnRjNGOINGB0L7RhtGB0LXRgtC10Lk6JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJy5zaWduLXVwLXRhZ2xpbmUnIDogJ9Ch0L7QstC10YDRiNCw0Y8g0LLRhdC+0LQg0L3QsCDRgdCw0LnRgiwg0JLRiyDRgdC+0LPQu9Cw0YjQsNC10YLQtdGB0Ywg0YEg0L3QsNGI0LjQvNC4IDxhIGhyZWY9XCIvdGVybXNcIj7Qn9GA0LDQstC40LvQsNC80Lg8L2E+JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJy50ZXJtcycgOiAnPGEgaHJlZj1cIiNwYXNzd29yZC1yZWNvdmVyeVwiIGNsYXNzPVwiaWdub3JlLWhhc2hcIj7Ql9Cw0LHRi9C70Lgg0L/QsNGA0L7Qu9GMPzwvYT4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaW5wdXRbbmFtZT10eXBlXScgOiAnbG9naW4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI3JlZ2lzdHJhdGlvbicgOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdoMycgOiAn0J3QsNGH0L3QuNGC0LUg0Y3QutC+0L3QvtC80LjRgtGMINGD0LbQtSDRgdC10LPQvtC00L3RjyEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYnV0dG9uJyA6ICfQn9GA0LjRgdC+0LXQtNC40L3QuNGC0YzRgdGPINC4INC90LDRh9Cw0YLRjCDRjdC60L7QvdC+0LzQuNGC0YwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaW5wdXRbdHlwZT1wYXNzd29yZF0nIDogJ9Cf0YDQuNC00YPQvNCw0LnRgtC1INC/0LDRgNC+0LvRjCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdoNCcgOiAn0JjQu9C4INC/0YDQuNGB0L7QtdC00LjQvdGP0LnRgtC10YHRjCDQuiDQvdCw0Lwg0YEg0L/QvtC80L7RidGM0Y4g0YHQvtGG0YHQtdGC0LXQuTonLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLnNpZ24tdXAtdGFnbGluZScgOiAn0KDQtdCz0LjRgdGC0YDQsNGG0LjRjyDQv9C+0LvQvdC+0YHRgtGM0Y4g0LHQtdGB0L/Qu9Cw0YLQvdCwINC4INC30LDQudC80ZHRgiDRgyDQktCw0YEg0L3QtdGB0LrQvtC70YzQutC+INGB0LXQutGD0L3QtCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcudGVybXMnIDogJ9Cg0LXQs9C40YHRgtGA0LjRgNGD0Y/RgdGMLCDRjyDRgdC+0LPQu9Cw0YjQsNGO0YHRjCDRgSA8YSBocmVmPVwiL3Rlcm1zXCI+0J/RgNCw0LLQuNC70LDQvNC4PC9hPicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdpbnB1dFtuYW1lPXR5cGVdJyA6ICdyZWdpc3RyYXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcjZ2l2ZWZlZWRiYWNrJyA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2gzJyA6ICfQntGC0LfRi9CyINC+INGB0LDQudGC0LUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaW5wdXRbbmFtZT10eXBlXScgOiAnZmVlZGJhY2snXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI3Jldmlld3N0b3JlJyA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2gzJyA6ICfQntGC0LfRi9CyINC+INC80LDQs9Cw0LfQuNC90LUgJyArICQoXCIjc3RvcmUtaW5mb3JtYXRpb25cIikuYXR0cihcImRhdGEtc3RvcmUtbmFtZVwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2lucHV0W25hbWU9dHlwZV0nIDogJ3Jldmlld18nICsgJChcIiNzdG9yZS1pbmZvcm1hdGlvblwiKS5hdHRyKFwiZGF0YS1zdG9yZS1pZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZigkLmluQXJyYXkoYWN0aXZlRWxlbWVudCwgWycjbG9naW4nLCAnI3JlZ2lzdHJhdGlvbiddKSAhPSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcG9wdXBXaW5kb3cgPSAkKFwiI3RvcFwiKS5maW5kKFwiLnBvcHVwX2NvbnRlbnRcIikuZmluZChcIi5zaWduLXVwXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3B1cFdpbmRvdy5maW5kKFwiLnNvY2lhbC1pY29uXCIpLnByZXBlbmQoXCJcIiArIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiPGRpdiBpZD1cXFwidUxvZ2luNmRhYjNhMmRcXFwiXCIgKyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRhdGEtdWxvZ2luPVxcXCJkaXNwbGF5PWJ1dHRvbnM7ZmllbGRzPWZpcnN0X25hbWUsZW1haWwsbGFzdF9uYW1lLG5pY2tuYW1lLHNleCxiZGF0ZSxwaG90byxcIiArIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGhvdG9fYmlnO29wdGlvbmFsPXBob25lLGNpdHksY291bnRyeTtsYW5nPXJ1O3Byb3ZpZGVycz12a29udGFrdGUsb2Rub2tsYXNzbmlraSxcIiArIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZmFjZWJvb2ssdHdpdHRlcjtyZWRpcmVjdF91cmk9aHR0cCUzQSUyRiUyRnNlY3JldGRpc2NvdW50ZXIucnUlMkZhdXRob3JpemF0aW9uc29jaWFsX2xvZ2luXFxcIj5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI8aW1nIHNyYz1cXFwiL2ltYWdlcy9hY2NvdW50L3ZrLnBuZ1xcXCIgZGF0YS11bG9naW5idXR0b249XFxcInZrb250YWt0ZVxcXCIgYWx0PVxcXCJ2a29udGFrdGUtdWxvZ2luXFxcIj5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI8aW1nIHNyYz1cXFwiL2ltYWdlcy9hY2NvdW50L2ZiLnBuZ1xcXCIgZGF0YS11bG9naW5idXR0b249XFxcImZhY2Vib29rXFxcIiBhbHQ9XFxcImZhY2Vib29rLXVsb2dpblxcXCI+XCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiPGltZyBzcmM9XFxcIi9pbWFnZXMvYWNjb3VudC90dy5wbmdcXFwiIGRhdGEtdWxvZ2luYnV0dG9uPVxcXCJ0d2l0dGVyXFxcIiBhbHQ9XFxcInR3aXR0ZXItdWxvZ2luXFxcIj5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI8aW1nIHNyYz1cXFwiL2ltYWdlcy9hY2NvdW50L29rLnBuZ1xcXCIgZGF0YS11bG9naW5idXR0b249XFxcIm9kbm9rbGFzc25pa2lcXFwiIGFsdD1cXFwib2Rub2tsYXNzbmlraS11bG9naW5cXFwiPlwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjwvZGl2PlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoJC5pbkFycmF5KGFjdGl2ZUVsZW1lbnQsIFsnI2dpdmVmZWVkYmFjaycsICcjcmV2aWV3c3RvcmUnXSkgIT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBvcHVwV2luZG93ID0gJChcIiN0b3BcIikuZmluZChcIi5wb3B1cF9jb250ZW50XCIpLmZpbmQoXCIuZmVlZGJhY2tcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChrZXkgaW4gc2V0dGluZ3NbYWN0aXZlRWxlbWVudF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoJC5pbkFycmF5KGtleSwgWydoMycsICdidXR0b24nLCAnaDQnXSkgIT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcHVwV2luZG93LmZpbmQoa2V5KS50ZXh0KHNldHRpbmdzW2FjdGl2ZUVsZW1lbnRdW2tleV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKCQuaW5BcnJheShrZXksIFsnLnNpZ24tdXAtdGFnbGluZScsICcudGVybXMnXSkgIT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcHVwV2luZG93LmZpbmQoa2V5KS5odG1sKHNldHRpbmdzW2FjdGl2ZUVsZW1lbnRdW2tleV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKCQuaW5BcnJheShrZXksIFsnaW5wdXRbdHlwZT1wYXNzd29yZF0nXSkgIT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcHVwV2luZG93LmZpbmQoa2V5KS5hdHRyKCdwbGFjZWhvbGRlcicsIHNldHRpbmdzW2FjdGl2ZUVsZW1lbnRdW2tleV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKCQuaW5BcnJheShrZXksIFsnaW5wdXRbbmFtZT10eXBlXSddKSAhPSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9wdXBXaW5kb3cuZmluZChrZXkpLnZhbChzZXR0aW5nc1thY3RpdmVFbGVtZW50XVtrZXldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGFjdGl2ZUVsZW1lbnQgIT0gXCIjY2VydFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcHVwV2luZG93LmFuaW1hdGUoeydvcGFjaXR5JyA6IDF9LCAzMDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1TG9naW4uY3VzdG9tSW5pdCgndUxvZ2luNmRhYjNhMmQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pOyAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgIHBvcHVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLydhW2hyZWY9I2xvZ2luXScgOiAkKFwiI3RvcFwiKS5maW5kKCcucG9wdXAtbG9naW4nKS5odG1sKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8nYVtocmVmPSNyZWdpc3RyYXRpb25dJyA6ICQoXCIjdG9wXCIpLmZpbmQoJy5wb3B1cC1sb2dpbicpLmh0bWwoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYVtocmVmPSNnaXZlZmVlZGJhY2tdJyA6ICAkKFwiI3RvcFwiKS5maW5kKCcucG9wdXAtZ2l2ZWZlZWRiYWNrJykuaHRtbCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhW2hyZWY9I3Jldmlld3N0b3JlXScgOiAgJChcIiN0b3BcIikuZmluZCgnLnBvcHVwLWdpdmVmZWVkYmFjaycpLmh0bWwoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYVtocmVmPSNjZXJ0XScgOiAgJChcIiN0b3BcIikuZmluZCgnLnBvcHVwLWNlcnQnKS5odG1sKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8nYVtocmVmPSNwYXNzd29yZC1yZWNvdmVyeV0nIDogJChcIiN0b3BcIikuZmluZCgnLnBvcHVwLXJlY292ZXJ5JykuaHRtbCgpXG4gICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy90aGlzLnJlZ2lzdHJhdGlvbihwb3B1cHMpO1xuXG4gICAgICAgICAgICAgICAgLyokKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiI3RvcCBhW2hyZWY9I3Bhc3N3b3JkLXJlY292ZXJ5XVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJChcIiN0b3AgLnBvcHVwLXNpZ24tdXBcIikuY2xvc2VzdChcIi5wb3B1cFwiKS5uZXh0KFwiLnBvcHVwX2Nsb3NlXCIpLmNsaWNrKCk7XG4gICAgICAgICAgICAgICAgfSk7Ki9cblxuICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKFwibW91c2VvdmVyXCIsIFwiI3RvcCAucG9wdXAgLmZlZWRiYWNrLnBvcHVwLWNvbnRlbnQgLnJhdGluZyAuZmEtd3JhcHBlciAuZmFcIiwgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc3Rhck5vbWluYXRpb24oJCh0aGlzKS5pbmRleCgpICsgMSk7XG4gICAgICAgICAgICAgICAgfSkub24oXCJtb3VzZWxlYXZlXCIsIFwiI3RvcCAucG9wdXAgLmZlZWRiYWNrLnBvcHVwLWNvbnRlbnQgLnJhdGluZyAuZmEtd3JhcHBlclwiLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgc2VsZi5zdGFyTm9taW5hdGlvbigkKFwiI3RvcCAucG9wdXAgLmZlZWRiYWNrLnBvcHVwLWNvbnRlbnQgaW5wdXRbbmFtZT1yYXRpbmddXCIpLnZhbCgpKTsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSkub24oXCJjbGlja1wiLCBcIiN0b3AgLnBvcHVwIC5mZWVkYmFjay5wb3B1cC1jb250ZW50IC5yYXRpbmcgLmZhLXdyYXBwZXIgLmZhXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICBzZWxmLnN0YXJOb21pbmF0aW9uKCQodGhpcykuaW5kZXgoKSArIDEpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgJChcIiN0b3AgLnBvcHVwIC5mZWVkYmFjay5wb3B1cC1jb250ZW50IGlucHV0W25hbWU9cmF0aW5nXVwiKS52YWwoJCh0aGlzKS5pbmRleCgpICsgMSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvKmFqYXguY29udHJvbC5zZW5kRm9ybURhdGEoXCIjdG9wIC5zaWdudXAtZm9ybVwiLCBcIi9hdXRob3JpemF0aW9uXCIsIFwiQXV0aCBBamF4IEVycm9yXCIsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoZGF0YS50eXBlID09ICdyZWdpc3RyYXRpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gdXJsUHJlZml4ICsgXCIvYWNjb3VudFwiICsgZGF0YS5wYXJhbTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSB1cmxQcmVmaXggKyBcIi9hY2NvdW50XCI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTsqL1xuXG4gICAgICAgICAgICAgICAgLyphamF4LmNvbnRyb2wuc2VuZEZvcm1EYXRhKFwiI3RvcCAucmVjb3ZlcnktZm9ybVwiLCBcIi9wYXNzd29yZC1yZWNvdmVyeS9pbnN0cnVjdGlvbnNcIiwgXCJQYXNzd29yZCBSZWNvdmVyeSBJbnN0cnVjdGlvbnMgQWpheCBFcnJvclwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJChcIiN0b3AgLnJlY292ZXJ5XCIpLmNsb3Nlc3QoXCIucG9wdXBcIikubmV4dChcIi5wb3B1cF9jbG9zZVwiKS5jbGljaygpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXNzTm90eVN1Y2Nlc3MgPSBub3R5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0J/QvtC30LTRgNCw0LLQu9GP0LXQvCE8L2I+PGJyPiDQmNC90YHRgtGA0YPQutGG0LjQuCDQv9C+INCy0L7RgdGB0YLQsNC90L7QstC70LXQvdC40Y4g0L/QsNGA0L7Qu9GPINGD0YHQv9C10YjQvdC+XCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiDQvtGC0L/RgNCw0LLQu9C10L3RiyDQvdCwINGD0LrQsNC30LDQvdC90YvQuSBlbWFpbCDQsNC00YDQtdGBLiDQldGB0LvQuCDQv9C40YHRjNC80L4g0L3QtSDQv9GA0LjRiNC70L4g0LIg0YLQtdGH0LXQvdC40LUgMiDQvNC40L3Rg9GCLCDQv9C+0YHQvNC+0YLRgNC40YLQtSDQsiDQv9Cw0L/QutC1IMKr0KHQv9Cw0LzCuy5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46ICdhbmltYXRlZCBmYWRlSW5MZWZ0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlZWQ6IDMwMFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiAncmVsYXgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNzAwMFxuICAgICAgICAgICAgICAgICAgICB9KTsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0pOyovXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcmV2aWV3cyA9IHtcbiAgICAgICAgY29udHJvbDoge1xuICAgICAgICAgICAgZXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAvLyBhZGQgYSBjb21tZW50IHRvIHRoZSBzaXRlXG4gICAgICAgICAgICAgICAgYWpheC5jb250cm9sLnNlbmRGb3JtRGF0YShcIiN0b3AgLmZlZWRiYWNrLWZvcm1cIiwgXCIvcmV2aWV3c1wiLCBcIlJldmlld3MgQWpheCBFcnJvclwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJChcIiN0b3AgLmZlZWRiYWNrXCIpLmNsb3Nlc3QoXCIucG9wdXBcIikubmV4dChcIi5wb3B1cF9jbG9zZVwiKS5jbGljaygpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciByZXZpZXdTdWNjZXNzID0gbm90eSh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCh0L/QsNGB0LjQsdC+ITwvYj48YnI+0JLQsNGIINC+0YLQt9GL0LIg0YPRgdC/0LXRiNC90L4g0LTQvtCx0LDQstC70LXQvSDQuCDQsdGD0LTQtdGCXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiDQvtC/0YPQsdC70LjQutC+0LLQsNC9INC90LAg0YHQsNC50YLQtSDQv9C+0YHQu9C1INC80L7QtNC10YDQsNGG0LjQuC5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46ICdhbmltYXRlZCBmYWRlSW5MZWZ0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlZWQ6IDMwMFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiAncmVsYXgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNzAwMFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTsgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGNhdGFsb2cgPSB7XG4gICAgICAgIGNvbnRyb2w6IHtcbiAgICAgICAgICAgIGV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJChcIiN0b3AgLmRyb3Bkb3duLXNlbGVjdCAuZHJvcE91dCBsaVwiKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9ICQodGhpcykuZmluZChcImFcIikuYXR0cihcImhyZWZcIik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgZmF2b3JpdGVzID0ge1xuICAgICAgICBjb250cm9sOiB7XG4gICAgICAgICAgICBldmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuZmF2b3JpdGUtbGluay5pYVwiKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGYgPSAkKHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdHlwZSA9IHNlbGYuYXR0cihcImRhdGEtc3RhdGVcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFmZmlsaWF0ZV9pZCA9IHNlbGYuYXR0cihcImRhdGEtYWZmaWxpYXRlLWlkXCIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKHR5cGUgPT0gXCJhZGRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5maW5kKFwiLmZhXCIpLnJlbW92ZUNsYXNzKFwibXV0ZWRcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzZWxmLmZpbmQoXCIuZmFcIikucmVtb3ZlQ2xhc3MoXCJwdWxzZTJcIikuYWRkQ2xhc3MoXCJmYS1zcGluXCIpO1xuXG4gICAgICAgICAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IFwicG9zdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiB1cmxQcmVmaXggKyBcIi9hY2NvdW50L2Zhdm9yaXRlc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogXCJ0eXBlPVwiICsgdHlwZSArIFwiJmFmZmlsaWF0ZV9pZD1cIiArIGFmZmlsaWF0ZV9pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoanF4aHIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcnMuY29udHJvbC5sb2coJ0Zhdm9yaXRlcyBBamF4IEVycm9yJywganF4aHIpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZhdkVycm9yQWpheCA9IG5vdHkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCi0LXRhdC90LjRh9C10YHQutC40LUg0YDQsNCx0L7RgtGLITwvYj48YnI+0JIg0LTQsNC90L3Ri9C5INC80L7QvNC10L3RgiDQstGA0LXQvNC10L3QuFwiICsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIg0L/RgNC+0LjQt9Cy0LXQtNGR0L3QvdC+0LUg0LTQtdC50YHRgtCy0LjQtSDQvdC10LLQvtC30LzQvtC20L3Qvi4g0J/QvtC/0YDQvtCx0YPQudGC0LUg0L/QvtC30LbQtS5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIg0J/RgNC40L3QvtGB0LjQvCDRgdCy0L7QuCDQuNC30LLQuNC90LXQvdC40Y8g0LfQsCDQvdC10YPQtNC+0LHRgdGC0LLQvi5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3dhcm5pbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiAxMDAwMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodHlwZSA9PSBcImFkZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZmluZChcIi5mYVwiKS5hZGRDbGFzcyhcIm11dGVkXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZmluZChcIi5mYVwiKS5yZW1vdmVDbGFzcyhcImZhLXNwaW5cIikuYWRkQ2xhc3MoXCJwdWxzZTJcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSAkLnBhcnNlSlNPTihyZXNwb25zZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihyZXNwb25zZS5lcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3Ioa2V5IGluIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihyZXNwb25zZVtrZXldWzBdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmF2b3JpdGVzRXJyb3IgPSBub3R5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCI8Yj7QntGI0LjQsdC60LAhPC9iPiBcIiArIHJlc3BvbnNlW2tleV1bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiAncmVsYXgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICd0b3BSaWdodCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDcwMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHR5cGUgPT0gXCJhZGRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5maW5kKFwiLmZhXCIpLmFkZENsYXNzKFwibXV0ZWRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmZpbmQoXCIuZmFcIikucmVtb3ZlQ2xhc3MoXCJmYS1zcGluXCIpLmFkZENsYXNzKFwicHVsc2UyXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmYXZvcml0ZXNTdWNjZXNzID0gbm90eSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiByZXNwb25zZS5tc2csXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDcwMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodHlwZSA9PSBcImFkZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmF0dHIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS1zdGF0ZVwiOiBcImRlbGV0ZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS1vcmlnaW5hbC10aXRsZVwiOiBcItCj0LTQsNC70LjRgtGMINC40Lcg0LjQt9Cx0YDQsNC90L3QvtCz0L5cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZmluZChcIi5mYVwiKS5yZW1vdmVDbGFzcyhcImZhLXNwaW4gZmEtc3Rhci1vXCIpLmFkZENsYXNzKFwicHVsc2UyIGZhLXN0YXJcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZih0eXBlID09IFwiZGVsZXRlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYXR0cih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLXN0YXRlXCI6IFwiYWRkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLW9yaWdpbmFsLXRpdGxlXCIgOiBcItCU0L7QsdCw0LLQuNGC0Ywg0LIg0LjQt9Cx0YDQsNC90L3QvtC1XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pOyAgICAgICAgICAgICAgICAgICBcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5maW5kKFwiLmZhXCIpLnJlbW92ZUNsYXNzKFwiZmEtc3BpbiBmYS1zdGFyXCIpLmFkZENsYXNzKFwicHVsc2UyIGZhLXN0YXItbyBtdXRlZFwiKTsgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pOyAgICAgICBcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICBcbiAgICBwb3B1cC5jb250cm9sLmV2ZW50cygpO1xuICAgIGhlYWRlci5jb250cm9sLmV2ZW50cygpO1xuICAgIGNvdXBvbnMuY29udHJvbC5ldmVudHMoKTtcbiAgICByZXZpZXdzLmNvbnRyb2wuZXZlbnRzKCk7XG4gICAgY2F0YWxvZy5jb250cm9sLmV2ZW50cygpO1xuICAgIGZhdm9yaXRlcy5jb250cm9sLmV2ZW50cygpO1xufSk7XG5cblxuJCh3aW5kb3cpLmxvYWQoZnVuY3Rpb24oKXtcblxuICAgIC8qIFNjcm9sbGJhciBJbml0XG4gICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgICAvLyAkKFwiI3RvcFwiKS5maW5kKFwiLnN1Ym1lbnUgLnRyZWVcIikubUN1c3RvbVNjcm9sbGJhcih7XG4gICAgLy8gICAgIGF4aXM6XCJ5XCIsXG4gICAgLy8gICAgIHNldEhlaWdodDogMzAwXG4gICAgLy8gfSk7IFxuICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuYy13cmFwcGVyXCIpLm1DdXN0b21TY3JvbGxiYXIoe1xuICAgICAgICBheGlzOlwieVwiLFxuICAgICAgICBzZXRIZWlnaHQ6IDcwMFxuICAgIH0pO1xuICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuY20td3JhcHBlclwiKS5tQ3VzdG9tU2Nyb2xsYmFyKHtcbiAgICAgICAgYXhpczpcInlcIixcbiAgICAgICAgc2V0SGVpZ2h0OiA2NDBcbiAgICB9KTtcbiAgICAvLyAkKFwiI3RvcFwiKS5maW5kKFwiLnZpZXctc3RvcmUgLmFkZGl0aW9uYWwtaW5mb3JtYXRpb25cIikubUN1c3RvbVNjcm9sbGJhcih7XG4gICAgLy8gICAgIGF4aXM6XCJ5XCIsXG4gICAgLy8gICAgIHNldEhlaWdodDogNjVcbiAgICAvLyB9KTtcbiAgICAkKFwiI3RvcFwiKS5maW5kKFwiLmZ1bmRzIC5mdW5kIC50aXRsZVwiKS5tQ3VzdG9tU2Nyb2xsYmFyKHtcbiAgICAgICAgYXhpczpcInlcIixcbiAgICAgICAgc2V0SGVpZ2h0OiA0NSxcbiAgICAgICAgdGhlbWU6IFwiZGFya1wiXG4gICAgfSk7IFxuICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb25zXCIpLm1DdXN0b21TY3JvbGxiYXIoe1xuICAgICAgICBheGlzOlwieVwiLFxuICAgICAgICBzZXRIZWlnaHQ6IDMwMFxuICAgIH0pOyBcbiAgICAkKFwiI3RvcFwiKS5maW5kKFwiLmNvbW1lbnRzIC5jdXJyZW50LWNvbW1lbnQgLnRleHQgLmNvbW1lbnRcIikubUN1c3RvbVNjcm9sbGJhcih7XG4gICAgICAgIGF4aXM6XCJ5XCIsXG4gICAgICAgIHNldEhlaWdodDogMTUwLFxuICAgICAgICB0aGVtZTogXCJkYXJrXCJcbiAgICB9KTsgXG4gICAgJChcIiN0b3BcIikuZmluZChcIi5jYXRlZ29yaWVzIHVsOm5vdCguc3ViY2F0ZWdvcmllcylcIikubUN1c3RvbVNjcm9sbGJhcih7XG4gICAgICAgIGF4aXM6XCJ5XCIsXG4gICAgICAgIHNldEhlaWdodDogMjUwXG4gICAgfSk7XG5cbiAgICAvKiQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKHtcbiAgICAgICAgZGVsYXk6IHtcbiAgICAgICAgICAgIHNob3c6IDUwMCwgaGlkZTogMjAwMFxuICAgICAgICB9XG4gICAgfSk7Ki9cbn0pO1xuXG5cbiQoJy5zaG9ydC1kZXNjcmlwdGlvbl9faGFuZGxlLm1vcmUgYScpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgZGl2ID0gJCh0aGlzKS5wYXJlbnQoKTtcbiAgICAkKGRpdikuc2libGluZ3MoJy5zaG9ydC1kZXNjcmlwdGlvbl9faGFuZGxlLmxlc3MnKS5zaG93KCk7XG4gICAgJChkaXYpLmhpZGUoKTtcbiAgICAkKCcuc2hvcnQtZGVzY3JpcHRpb25fX2Rlc2NyaXB0aW9uJykudG9nZ2xlQ2xhc3MoJ2xlc3MnKTtcbn0pO1xuXG4kKCcuc2hvcnQtZGVzY3JpcHRpb25fX2hhbmRsZS5sZXNzIGEnKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIGRpdiA9ICQodGhpcykucGFyZW50KCk7XG4gICAgJChkaXYpLnNpYmxpbmdzKCcuc2hvcnQtZGVzY3JpcHRpb25fX2hhbmRsZS5tb3JlJykuc2hvdygpO1xuICAgICQoZGl2KS5oaWRlKCk7XG4gICAgJCgnLnNob3J0LWRlc2NyaXB0aW9uX19kZXNjcmlwdGlvbicpLnRvZ2dsZUNsYXNzKCdsZXNzJyk7XG59KTtcblxuJCgnLmFkZGl0aW9uYWwtaW5mb3JtYXRpb25fX2hhbmRsZS5tb3JlIGEnKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIGRpdiA9ICQodGhpcykucGFyZW50KCk7XG4gICAgJChkaXYpLnNpYmxpbmdzKCcuYWRkaXRpb25hbC1pbmZvcm1hdGlvbl9faGFuZGxlLmxlc3MnKS5zaG93KCk7XG4gICAgJChkaXYpLmhpZGUoKTtcbiAgICAkKCcuYWRkaXRpb25hbC1pbmZvcm1hdGlvbicpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XG59KTtcbiQoJy5hZGRpdGlvbmFsLWluZm9ybWF0aW9uX19oYW5kbGUubGVzcyBhJykuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBkaXYgPSAkKHRoaXMpLnBhcmVudCgpO1xuICAgICQoZGl2KS5zaWJsaW5ncygnLmFkZGl0aW9uYWwtaW5mb3JtYXRpb25fX2hhbmRsZS5tb3JlJykuc2hvdygpO1xuICAgICQoZGl2KS5oaWRlKCk7XG4gICAgJCgnLmFkZGl0aW9uYWwtaW5mb3JtYXRpb24nKS50b2dnbGVDbGFzcygnb3BlbicpO1xufSk7XG5cbiQoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gcGFyc2VOdW0oc3RyKXtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoXG4gICAgICAgICAgU3RyaW5nKHN0cilcbiAgICAgICAgICAgIC5yZXBsYWNlKCcsJywnLicpXG4gICAgICAgICAgICAubWF0Y2goLy0/XFxkKyg/OlxcLlxcZCspPy9nLCAnJykgfHwgMFxuICAgICAgICAgICwgMTBcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAkKCcuc2hvcnQtY2FsYy1jYXNoYmFjaycpLmZpbmQoJ3NlbGVjdCxpbnB1dCcpLm9uKCdjaGFuZ2Uga2V5dXAgY2xpY2snLGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHRoaXM9JCh0aGlzKS5jbG9zZXN0KCcuc2hvcnQtY2FsYy1jYXNoYmFjaycpO1xuICAgICAgICBjdXJzPXBhcnNlTnVtKCR0aGlzLmZpbmQoJ3NlbGVjdCcpLnZhbCgpKTtcbiAgICAgICAgdmFsPSR0aGlzLmZpbmQoJ2lucHV0JykudmFsKCk7XG4gICAgICAgIGlmKHBhcnNlTnVtKHZhbCkhPXZhbCl7XG4gICAgICAgICAgICB2YWw9JHRoaXMuZmluZCgnaW5wdXQnKS52YWwocGFyc2VOdW0odmFsKSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsPXBhcnNlTnVtKHZhbCk7XG5cbiAgICAgICAga29lZj0kdGhpcy5maW5kKCdpbnB1dCcpLmF0dHIoJ2RhdGEtY2FzaGJhY2snKTtcbiAgICAgICAgcHJvbW89JHRoaXMuZmluZCgnaW5wdXQnKS5hdHRyKCdkYXRhLWNhc2hiYWNrLXByb21vJyk7XG5cbiAgICAgICAgaWYoa29lZi5pbmRleE9mKCclJyk+MCl7XG4gICAgICAgICAgICByZXN1bHQ9cGFyc2VOdW0oa29lZikqdmFsKmN1cnMvMTAwO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJlc3VsdD1wYXJzZU51bShrb2VmKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYocGFyc2VOdW0ocHJvbW8pPjApIHtcbiAgICAgICAgICAgIGlmKHByb21vLmluZGV4T2YoJyUnKT4wKXtcbiAgICAgICAgICAgICAgICBwcm9tbz1wYXJzZU51bShwcm9tbykqdmFsKmN1cnMvMTAwO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgcHJvbW89cGFyc2VOdW0ocHJvbW8pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihwcm9tbz4wKSB7XG4gICAgICAgICAgICAgICAgb3V0ID0gXCI8c3BhbiBjbGFzcz1vbGRfcHJpY2U+XCIgKyByZXN1bHQudG9GaXhlZCgyKSArIFwiPC9zcGFuPiBcIiArIHByb21vLnRvRml4ZWQoMilcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIG91dD1yZXN1bHQudG9GaXhlZCgyKVxuICAgICAgICAgICAgfVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIG91dD1yZXN1bHQudG9GaXhlZCgyKVxuICAgICAgICB9XG5cblxuICAgICAgICAkdGhpcy5maW5kKCcuY2FsYy1yZXN1bHRfdmFsdWUnKS5odG1sKG91dClcbiAgICB9KS5jbGljaygpXG59KTsiLCJ2YXIgbm90aWZpY2F0aW9uID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgbm90aWZpY2F0aW9uX2JveCA9ZmFsc2U7XG4gIHZhciBpc19pbml0PWZhbHNlO1xuICB2YXIgY29uZmlybV9vcHQ9e1xuICAgIHRpdGxlOlwi0KPQtNCw0LvQtdC90LjQtVwiLFxuICAgIHF1ZXN0aW9uOlwi0JLRiyDQtNC10LnRgdGC0LLQuNGC0LXQu9GM0L3QviDRhdC+0YLQuNGC0LUg0YPQtNCw0LvQuNGC0Yw/XCIsXG4gICAgYnV0dG9uWWVzOlwi0JTQsFwiLFxuICAgIGJ1dHRvbk5vOlwi0J3QtdGCXCIsXG4gICAgY2FsbGJhY2tZZXM6ZmFsc2UsXG4gICAgY2FsbGJhY2tObzpmYWxzZSxcbiAgICBvYmo6ZmFsc2UsXG4gIH07XG5cbiAgdmFyIGFsZXJ0X29wdD17XG4gICAgdGl0bGU6XCJcIixcbiAgICBxdWVzdGlvbjpcItCh0L7QvtCx0YnQtdC90LjQtVwiLFxuICAgIGJ1dHRvblllczpcItCU0LBcIixcbiAgICBjYWxsYmFja1llczpmYWxzZSxcbiAgICBvYmo6ZmFsc2UsXG4gIH07XG5cblxuICBmdW5jdGlvbiBpbml0KCl7XG4gICAgaXNfaW5pdD10cnVlO1xuICAgIG5vdGlmaWNhdGlvbl9ib3g9JCgnLm5vdGlmaWNhdGlvbl9ib3gnKTtcbiAgICBpZihub3RpZmljYXRpb25fYm94Lmxlbmd0aD4wKXJldHVybjtcblxuICAgICQoJ2JvZHknKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdub3RpZmljYXRpb25fYm94Jz48L2Rpdj5cIik7XG4gICAgbm90aWZpY2F0aW9uX2JveD0kKCcubm90aWZpY2F0aW9uX2JveCcpO1xuXG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCcubm90aWZ5X2NvbnRyb2wnLGNsb3NlTW9kYWwpO1xuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywnLm5vdGlmeV9jbG9zZScsY2xvc2VNb2RhbCk7XG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLGNsb3NlTW9kYWxGb24pO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2VNb2RhbCgpe1xuICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnc2hvd19ub3RpZmknKTtcbiAgfVxuICBmdW5jdGlvbiBjbG9zZU1vZGFsRm9uKGUpe1xuICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG4gICAgaWYodGFyZ2V0LmNsYXNzTmFtZT09XCJub3RpZmljYXRpb25fYm94XCIpe1xuICAgICAgY2xvc2VNb2RhbCgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFsZXJ0KGRhdGEpe1xuICAgIGlmKCFkYXRhKWRhdGE9e307XG4gICAgZGF0YT1vYmplY3RzKGFsZXJ0X29wdCxkYXRhKTtcblxuICAgIGlmKCFpc19pbml0KWluaXQoKTtcblxuICAgIG5vdHlmeV9jbGFzcz0nbm90aWZ5X2JveCAnO1xuICAgIGlmKGRhdGEubm90eWZ5X2NsYXNzKW5vdHlmeV9jbGFzcys9ZGF0YS5ub3R5ZnlfY2xhc3M7XG5cbiAgICBib3hfaHRtbD0nPGRpdiBjbGFzcz1cIicrbm90eWZ5X2NsYXNzKydcIj4nO1xuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV90aXRsZVwiPic7XG4gICAgYm94X2h0bWwrPWRhdGEudGl0bGU7XG4gICAgYm94X2h0bWwrPSc8c3BhbiBjbGFzcz1cIm5vdGlmeV9jbG9zZVwiPjwvc3Bhbj4nO1xuICAgIGJveF9odG1sKz0nPC9kaXY+JztcblxuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcbiAgICBib3hfaHRtbCs9ZGF0YS5xdWVzdGlvbjtcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XG5cbiAgICBpZihkYXRhLmJ1dHRvblllc3x8ZGF0YS5idXR0b25Obykge1xuICAgICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udHJvbFwiPic7XG4gICAgICBpZiAoZGF0YS5idXR0b25ZZXMpYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiPicgKyBkYXRhLmJ1dHRvblllcyArICc8L2Rpdj4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX25vXCI+JyArIGRhdGEuYnV0dG9uTm8gKyAnPC9kaXY+JztcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuICAgIH07XG5cbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XG4gICAgbm90aWZpY2F0aW9uX2JveC5odG1sKGJveF9odG1sKTtcblxuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICQoJ2JvZHknKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcbiAgICB9LDEwMClcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbmZpcm0oZGF0YSl7XG4gICAgaWYoIWRhdGEpZGF0YT17fTtcbiAgICBkYXRhPW9iamVjdHMoY29uZmlybV9vcHQsZGF0YSk7XG5cbiAgICBpZighaXNfaW5pdClpbml0KCk7XG5cbiAgICBib3hfaHRtbD0nPGRpdiBjbGFzcz1cIm5vdGlmeV9ib3hcIj4nO1xuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV90aXRsZVwiPic7XG4gICAgYm94X2h0bWwrPWRhdGEudGl0bGU7XG4gICAgYm94X2h0bWwrPSc8c3BhbiBjbGFzcz1cIm5vdGlmeV9jbG9zZVwiPjwvc3Bhbj4nO1xuICAgIGJveF9odG1sKz0nPC9kaXY+JztcblxuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcbiAgICBib3hfaHRtbCs9ZGF0YS5xdWVzdGlvbjtcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XG5cbiAgICBpZihkYXRhLmJ1dHRvblllc3x8ZGF0YS5idXR0b25Obykge1xuICAgICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udHJvbFwiPic7XG4gICAgICBpZiAoZGF0YS5idXR0b25ZZXMpYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiPicgKyBkYXRhLmJ1dHRvblllcyArICc8L2Rpdj4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX25vXCI+JyArIGRhdGEuYnV0dG9uTm8gKyAnPC9kaXY+JztcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuICAgIH1cblxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xuXG4gICAgaWYoZGF0YS5jYWxsYmFja1llcyE9ZmFsc2Upe1xuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl95ZXMnKS5vbignY2xpY2snLGRhdGEuY2FsbGJhY2tZZXMuYmluZChkYXRhLm9iaikpO1xuICAgIH1cbiAgICBpZihkYXRhLmNhbGxiYWNrTm8hPWZhbHNlKXtcbiAgICAgIG5vdGlmaWNhdGlvbl9ib3guZmluZCgnLm5vdGlmeV9idG5fbm8nKS5vbignY2xpY2snLGRhdGEuY2FsbGJhY2tOby5iaW5kKGRhdGEub2JqKSk7XG4gICAgfVxuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICQoJ2JvZHknKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcbiAgICB9LDEwMClcblxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBhbGVydDogYWxlcnQsXG4gICAgY29uZmlybTogY29uZmlybVxuICB9O1xuXG59KSgpO1xuXG5cbiQoJ1tyZWY9cG9wdXBdJykub24oJ2NsaWNrJyxmdW5jdGlvbiAoZSl7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgJHRoaXM9JCh0aGlzKVxuICBlbD0kKCR0aGlzLmF0dHIoJ2hyZWYnKSk7XG4gIGRhdGE9ZWwuZGF0YSgpO1xuXG4gIGRhdGEucXVlc3Rpb249ZWwuaHRtbCgpO1xuICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XG59KTtcbiIsIiQod2luZG93KS5sb2FkKGZ1bmN0aW9uKCkge1xuXG4gICQoJy5hY2NvcmRpb24gLmFjY29yZGlvbi1jb250cm9sJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJHRoaXMgPSAkKHRoaXMpO1xuICAgICRhY2NvcmRpb24gPSAkdGhpcy5jbG9zZXN0KCcuYWNjb3JkaW9uJyk7XG5cbiAgICBpZiAoJGFjY29yZGlvbi5oYXNDbGFzcygnb3BlbicpKSB7XG4gICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLmhpZGUoMzAwKTtcbiAgICAgICRhY2NvcmRpb24ucmVtb3ZlQ2xhc3MoJ29wZW4nKVxuICAgIH0gZWxzZSB7XG4gICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLnNob3coMzAwKTtcbiAgICAgICRhY2NvcmRpb24uYWRkQ2xhc3MoJ29wZW4nKVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xufSlcblxub2JqZWN0cyA9IGZ1bmN0aW9uIChhLGIpIHtcbiAgdmFyIGMgPSBiLFxuICAgIGtleTtcbiAgZm9yIChrZXkgaW4gYSkge1xuICAgIGlmIChhLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIGNba2V5XSA9IGtleSBpbiBiID8gYltrZXldIDogYVtrZXldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYztcbn07XG5cbihmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCl7XG4gICAgZGF0YT10aGlzO1xuICAgIGRhdGEuaW1nLmF0dHIoJ3NyYycsZGF0YS5zcmMpO1xuICB9XG5cbiAgaW1ncz0kKCdzZWN0aW9uOm5vdCgubmF2aWdhdGlvbiknKS5maW5kKCcubG9nbyBpbWcnKTtcbiAgZm9yICh2YXIgaT0wO2k8aW1ncy5sZW5ndGg7aSsrKXtcbiAgICBpbWc9aW1ncy5lcShpKTtcbiAgICBzcmM9aW1nLmF0dHIoJ3NyYycpO1xuICAgIGltZy5hdHRyKCdzcmMnLCcvaW1hZ2VzL3RlbXBsYXRlLWxvZ28uanBnJyk7XG4gICAgZGF0YT17XG4gICAgICBzcmM6c3JjLFxuICAgICAgaW1nOmltZ1xuICAgIH07XG4gICAgaW1hZ2U9JCgnPGltZy8+Jyx7XG4gICAgICBzcmM6c3JjXG4gICAgfSkub24oJ2xvYWQnLGltZ19sb2FkX2ZpbmlzaC5iaW5kKGRhdGEpKVxuICB9XG59KSgpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIGVscz0kKCcuYWpheF9sb2FkJyk7XG4gIGZvcihpPTA7aTxlbHMubGVuZ3RoO2krKyl7XG4gICAgZWw9ZWxzLmVxKGkpO1xuICAgIHVybD1lbC5hdHRyKCdyZXMnKTtcbiAgICAkLmdldCh1cmwsZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICR0aGlzPSQodGhpcyk7XG4gICAgICAkdGhpcy5odG1sKGRhdGEpO1xuICAgICAgYWpheEZvcm0oJHRoaXMpO1xuICAgIH0uYmluZChlbCkpXG4gIH1cbn0pKCk7IiwiZnVuY3Rpb24gYWpheEZvcm0oZWxzKSB7XG4gIHZhciBmaWxlQXBpID0gd2luZG93LkZpbGUgJiYgd2luZG93LkZpbGVSZWFkZXIgJiYgd2luZG93LkZpbGVMaXN0ICYmIHdpbmRvdy5CbG9iID8gdHJ1ZSA6IGZhbHNlO1xuICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgZXJyb3JfY2xhc3M6ICcuaGFzLWVycm9yJyxcbiAgfTtcblxuICBmdW5jdGlvbiBvblBvc3QocG9zdCl7XG4gICAgdmFyIGRhdGE9dGhpcztcbiAgICBmb3JtPWRhdGEuZm9ybTtcbiAgICB3cmFwPWRhdGEud3JhcDtcbiAgICBpZihwb3N0LnJlbmRlcil7XG4gICAgICBwb3N0Lm5vdHlmeV9jbGFzcz1cIm5vdGlmeV93aGl0ZVwiO1xuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHBvc3QpO1xuICAgIH1lbHNle1xuICAgICAgd3JhcC5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgd3JhcC5odG1sKHBvc3QuaHRtbCk7XG4gICAgICBhamF4Rm9ybSh3cmFwKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBvblN1Ym1pdChlKXtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIGRhdGE9dGhpcztcbiAgICBmb3JtPWRhdGEuZm9ybTtcbiAgICB3cmFwPWRhdGEud3JhcDtcblxuICAgIGlmKGZvcm0ueWlpQWN0aXZlRm9ybSl7XG4gICAgICBmb3JtLnlpaUFjdGl2ZUZvcm0oJ3ZhbGlkYXRlJyk7XG4gICAgfTtcblxuICAgIGlzVmFsaWQ9KGZvcm0uZmluZChkYXRhLnBhcmFtLmVycm9yX2NsYXNzKS5sZW5ndGg9PTApO1xuXG4gICAgaWYoIWlzVmFsaWQpe1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1lbHNle1xuICAgICAgcmVxdWlyZWQ9Zm9ybS5maW5kKCdpbnB1dC5yZXF1aXJlZCcpO1xuICAgICAgZm9yKGk9MDtpPHJlcXVpcmVkLmxlbmd0aDtpKyspe1xuICAgICAgICBpZihyZXF1aXJlZC5lcShpKS52YWwoKS5sZW5ndGg8MSl7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZighZm9ybS5zZXJpYWxpemVPYmplY3QpYWRkU1JPKCk7XG5cbiAgICBwb3N0PWZvcm0uc2VyaWFsaXplT2JqZWN0KCk7XG4gICAgZm9ybS5hZGRDbGFzcygnbG9hZGluZycpO1xuICAgIGZvcm0uaHRtbCgnJyk7XG5cbiAgICAkLnBvc3QoZGF0YS51cmwscG9zdCxvblBvc3QuYmluZChkYXRhKSwnanNvbicpO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZWxzLmZpbmQoJ1tyZXF1aXJlZF0nKVxuICAgIC5hZGRDbGFzcygncmVxdWlyZWQnKVxuICAgIC5yZW1vdmVBdHRyKCdyZXF1aXJlZCcpO1xuXG4gIGZvcih2YXIgaT0wO2k8ZWxzLmxlbmd0aDtpKyspe1xuICAgIHdyYXA9ZWxzLmVxKGkpO1xuICAgIGZvcm09d3JhcC5maW5kKCdmb3JtJyk7XG4gICAgZGF0YT17XG4gICAgICBmb3JtOmZvcm0sXG4gICAgICBwYXJhbTpkZWZhdWx0cyxcbiAgICAgIHdyYXA6d3JhcFxuICAgIH07XG4gICAgZGF0YS51cmw9Zm9ybS5hdHRyKCdhY3Rpb24nKSB8fCBsb2NhdGlvbi5ocmVmO1xuICAgIGRhdGEubWV0aG9kPSBmb3JtLmF0dHIoJ21ldGhvZCcpIHx8ICdwb3N0JztcbiAgICBmb3JtLm9uKCdzdWJtaXQnLCBvblN1Ym1pdC5iaW5kKGRhdGEpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhZGRTUk8oKXtcbiAgJC5mbi5zZXJpYWxpemVPYmplY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG8gPSB7fTtcbiAgICB2YXIgYSA9IHRoaXMuc2VyaWFsaXplQXJyYXkoKTtcbiAgICAkLmVhY2goYSwgZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKG9bdGhpcy5uYW1lXSkge1xuICAgICAgICBpZiAoIW9bdGhpcy5uYW1lXS5wdXNoKSB7XG4gICAgICAgICAgb1t0aGlzLm5hbWVdID0gW29bdGhpcy5uYW1lXV07XG4gICAgICAgIH1cbiAgICAgICAgb1t0aGlzLm5hbWVdLnB1c2godGhpcy52YWx1ZSB8fCAnJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvW3RoaXMubmFtZV0gPSB0aGlzLnZhbHVlIHx8ICcnO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBvO1xuICB9O1xufTtcbmFkZFNSTygpOyIsIiQoJ2JvZHknKS5vbignY2xpY2snLCdhW2hyZWY9I2xvZ2luXSxhW2hyZWY9I3JlZ2lzdHJhdGlvbl0sYVtocmVmPSNyZXNldHBhc3N3b3JkXScsZnVuY3Rpb24oZSl7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgaHJlZj10aGlzLmhyZWYuc3BsaXQoJyMnKTtcbiAgaHJlZj1ocmVmW2hyZWYubGVuZ3RoLTFdO1xuXG4gIGRhdGE9e1xuICAgIGJ1dHRvblllczpmYWxzZSxcbiAgICBub3R5ZnlfY2xhc3M6XCJub3RpZnlfd2hpdGUgbG9hZGluZ1wiLFxuICAgIHF1ZXN0aW9uOicnXG4gIH07XG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcbiAgJC5nZXQoJy8nK2hyZWYsZnVuY3Rpb24oZGF0YSl7XG4gICAgJCgnLm5vdGlmeV9ib3gnKS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpLmh0bWwoZGF0YS5odG1sKTtcbiAgICBhamF4Rm9ybSgkKCcubm90aWZ5X2JveCAubm90aWZ5X2NvbnRlbnQnKSk7XG4gIH0sJ2pzb24nKVxufSk7XG5cbmFqYXhGb3JtKCQoJy5hamF4X2Zvcm0nKSk7Il19
