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
function ajaxForm(els) {
  var fileApi = window.File && window.FileReader && window.FileList && window.Blob ? true : false;
  var defaults = {
    error_class: '.has-error',
  };

  function onSubmit(e){
    e.preventDefault();
    var data=this;
    form=data.form;

    form.yiiActiveForm('validate');
    isValid=(form.find(data.param.error_class).length==0)

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
    $('.notify_box').addClass('loading');
    $('.notify_box .notify_content').html('');

    $.post(data.url,post,function(data){
      if(data.render){
        data.notyfy_class="notify_white";
        notification.alert(data);
      }else{
        $('.notify_box').removeClass('loading');
        $('.notify_box .notify_content').html(data.html);
        ajaxForm($('.notify_box .ajax_form'));
      }
    },'json');

    return false;
  }

  els.find('[required]')
    .addClass('required')
    .removeAttr('required');

  for(var i=0;i<els.length;i++){
    form=els.eq(i);
    data={
      form:form,
      param:defaults
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
$('body').on('click','a[href=#login],a[href=#registration],#password-recovery',function(e){
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
    ajaxForm($('.notify_box .ajax_form'));
  },'json')
});

ajaxForm($('.ajax_form'));
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJldGluYS5qcyIsImpxdWVyeS5mYW5jeWJveC5wYWNrLmpzIiwic2NyaXB0cy5qcyIsImpxdWVyeS5mbGV4c2xpZGVyLW1pbi5qcyIsImNsYXNzaWUuanMiLCJqcXVlcnkucG9wdXAubWluLmpzIiwiYW5pbW8uanMiLCJqcXVlcnkud2F5cG9pbnRzLm1pbi5qcyIsImpxdWVyeS5wbHVnaW4ubWluLmpzIiwianF1ZXJ5LmNvdW50ZG93bi5taW4uanMiLCJqcXVlcnkubm90eS5wYWNrYWdlZC5taW4uanMiLCJqcXVlcnkubW9ja2pheC5qcyIsImpxdWVyeS5hdXRvY29tcGxldGUuanMiLCJtYWluLmpzIiwibm90aWZpY2F0aW9uLmpzIiwiZm9yX2FsbC5qcyIsImpxdWVyeS5hamF4Rm9ybS5qcyIsIm15LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4bEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzE5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3h2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyohXHJcbiAqIFJldGluYS5qcyB2MS4zLjBcclxuICpcclxuICogQ29weXJpZ2h0IDIwMTQgSW11bHVzLCBMTENcclxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXHJcbiAqXHJcbiAqIFJldGluYS5qcyBpcyBhbiBvcGVuIHNvdXJjZSBzY3JpcHQgdGhhdCBtYWtlcyBpdCBlYXN5IHRvIHNlcnZlXHJcbiAqIGhpZ2gtcmVzb2x1dGlvbiBpbWFnZXMgdG8gZGV2aWNlcyB3aXRoIHJldGluYSBkaXNwbGF5cy5cclxuICovXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcm9vdCA9ICh0eXBlb2YgZXhwb3J0cyA9PT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiBleHBvcnRzKTtcclxuICAgIHZhciBjb25maWcgPSB7XHJcbiAgICAgICAgLy8gQW4gb3B0aW9uIHRvIGNob29zZSBhIHN1ZmZpeCBmb3IgMnggaW1hZ2VzXHJcbiAgICAgICAgcmV0aW5hSW1hZ2VTdWZmaXggOiAnQDJ4JyxcclxuXHJcbiAgICAgICAgLy8gRW5zdXJlIENvbnRlbnQtVHlwZSBpcyBhbiBpbWFnZSBiZWZvcmUgdHJ5aW5nIHRvIGxvYWQgQDJ4IGltYWdlXHJcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2ltdWx1cy9yZXRpbmFqcy9wdWxsLzQ1KVxyXG4gICAgICAgIGNoZWNrX21pbWVfdHlwZTogdHJ1ZSxcclxuXHJcbiAgICAgICAgLy8gUmVzaXplIGhpZ2gtcmVzb2x1dGlvbiBpbWFnZXMgdG8gb3JpZ2luYWwgaW1hZ2UncyBwaXhlbCBkaW1lbnNpb25zXHJcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2ltdWx1cy9yZXRpbmFqcy9pc3N1ZXMvOFxyXG4gICAgICAgIGZvcmNlX29yaWdpbmFsX2RpbWVuc2lvbnM6IHRydWVcclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gUmV0aW5hKCkge31cclxuXHJcbiAgICByb290LlJldGluYSA9IFJldGluYTtcclxuXHJcbiAgICBSZXRpbmEuY29uZmlndXJlID0gZnVuY3Rpb24ob3B0aW9ucykge1xyXG4gICAgICAgIGlmIChvcHRpb25zID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7fTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAodmFyIHByb3AgaW4gb3B0aW9ucykge1xyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xyXG4gICAgICAgICAgICAgICAgY29uZmlnW3Byb3BdID0gb3B0aW9uc1twcm9wXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgUmV0aW5hLmluaXQgPSBmdW5jdGlvbihjb250ZXh0KSB7XHJcbiAgICAgICAgaWYgKGNvbnRleHQgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgY29udGV4dCA9IHJvb3Q7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgZXhpc3Rpbmdfb25sb2FkID0gY29udGV4dC5vbmxvYWQgfHwgZnVuY3Rpb24oKXt9O1xyXG5cclxuICAgICAgICBjb250ZXh0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgaW1hZ2VzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2ltZycpLCByZXRpbmFJbWFnZXMgPSBbXSwgaSwgaW1hZ2U7XHJcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBpbWFnZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgIGltYWdlID0gaW1hZ2VzW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKCEhIWltYWdlLmdldEF0dHJpYnV0ZU5vZGUoJ2RhdGEtbm8tcmV0aW5hJykpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXRpbmFJbWFnZXMucHVzaChuZXcgUmV0aW5hSW1hZ2UoaW1hZ2UpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBleGlzdGluZ19vbmxvYWQoKTtcclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuXHJcbiAgICBSZXRpbmEuaXNSZXRpbmEgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciBtZWRpYVF1ZXJ5ID0gJygtd2Via2l0LW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDEuNSksIChtaW4tLW1vei1kZXZpY2UtcGl4ZWwtcmF0aW86IDEuNSksICgtby1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAzLzIpLCAobWluLXJlc29sdXRpb246IDEuNWRwcHgpJztcclxuXHJcbiAgICAgICAgaWYgKHJvb3QuZGV2aWNlUGl4ZWxSYXRpbyA+IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocm9vdC5tYXRjaE1lZGlhICYmIHJvb3QubWF0Y2hNZWRpYShtZWRpYVF1ZXJ5KS5tYXRjaGVzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgdmFyIHJlZ2V4TWF0Y2ggPSAvXFwuXFx3KyQvO1xyXG4gICAgZnVuY3Rpb24gc3VmZml4UmVwbGFjZSAobWF0Y2gpIHtcclxuICAgICAgICByZXR1cm4gY29uZmlnLnJldGluYUltYWdlU3VmZml4ICsgbWF0Y2g7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gUmV0aW5hSW1hZ2VQYXRoKHBhdGgsIGF0XzJ4X3BhdGgpIHtcclxuICAgICAgICB0aGlzLnBhdGggPSBwYXRoIHx8ICcnO1xyXG4gICAgICAgIGlmICh0eXBlb2YgYXRfMnhfcGF0aCAhPT0gJ3VuZGVmaW5lZCcgJiYgYXRfMnhfcGF0aCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLmF0XzJ4X3BhdGggPSBhdF8yeF9wYXRoO1xyXG4gICAgICAgICAgICB0aGlzLnBlcmZvcm1fY2hlY2sgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodW5kZWZpbmVkICE9PSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbG9jYXRpb25PYmplY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbk9iamVjdC5ocmVmID0gdGhpcy5wYXRoO1xyXG4gICAgICAgICAgICAgICAgbG9jYXRpb25PYmplY3QucGF0aG5hbWUgPSBsb2NhdGlvbk9iamVjdC5wYXRobmFtZS5yZXBsYWNlKHJlZ2V4TWF0Y2gsIHN1ZmZpeFJlcGxhY2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hdF8yeF9wYXRoID0gbG9jYXRpb25PYmplY3QuaHJlZjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHZhciBwYXJ0cyA9IHRoaXMucGF0aC5zcGxpdCgnPycpO1xyXG4gICAgICAgICAgICAgICAgcGFydHNbMF0gPSBwYXJ0c1swXS5yZXBsYWNlKHJlZ2V4TWF0Y2gsIHN1ZmZpeFJlcGxhY2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hdF8yeF9wYXRoID0gcGFydHMuam9pbignPycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucGVyZm9ybV9jaGVjayA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJvb3QuUmV0aW5hSW1hZ2VQYXRoID0gUmV0aW5hSW1hZ2VQYXRoO1xyXG5cclxuICAgIFJldGluYUltYWdlUGF0aC5jb25maXJtZWRfcGF0aHMgPSBbXTtcclxuXHJcbiAgICBSZXRpbmFJbWFnZVBhdGgucHJvdG90eXBlLmlzX2V4dGVybmFsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuICEhKHRoaXMucGF0aC5tYXRjaCgvXmh0dHBzP1xcOi9pKSAmJiAhdGhpcy5wYXRoLm1hdGNoKCcvLycgKyBkb2N1bWVudC5kb21haW4pICk7XHJcbiAgICB9O1xyXG5cclxuICAgIFJldGluYUltYWdlUGF0aC5wcm90b3R5cGUuY2hlY2tfMnhfdmFyaWFudCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIGh0dHAsIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIGlmICh0aGlzLmlzX2V4dGVybmFsKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGZhbHNlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnBlcmZvcm1fY2hlY2sgJiYgdHlwZW9mIHRoaXMuYXRfMnhfcGF0aCAhPT0gJ3VuZGVmaW5lZCcgJiYgdGhpcy5hdF8yeF9wYXRoICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayh0cnVlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYXRfMnhfcGF0aCBpbiBSZXRpbmFJbWFnZVBhdGguY29uZmlybWVkX3BhdGhzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayh0cnVlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgIGh0dHAub3BlbignSEVBRCcsIHRoaXMuYXRfMnhfcGF0aCk7XHJcbiAgICAgICAgICAgIGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaHR0cC5yZWFkeVN0YXRlICE9PSA0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaHR0cC5zdGF0dXMgPj0gMjAwICYmIGh0dHAuc3RhdHVzIDw9IDM5OSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25maWcuY2hlY2tfbWltZV90eXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0eXBlID0gaHR0cC5nZXRSZXNwb25zZUhlYWRlcignQ29udGVudC1UeXBlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSBudWxsIHx8ICF0eXBlLm1hdGNoKC9eaW1hZ2UvaSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIFJldGluYUltYWdlUGF0aC5jb25maXJtZWRfcGF0aHMucHVzaCh0aGF0LmF0XzJ4X3BhdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayh0cnVlKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaHR0cC5zZW5kKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcblxyXG4gICAgZnVuY3Rpb24gUmV0aW5hSW1hZ2UoZWwpIHtcclxuICAgICAgICB0aGlzLmVsID0gZWw7XHJcbiAgICAgICAgdGhpcy5wYXRoID0gbmV3IFJldGluYUltYWdlUGF0aCh0aGlzLmVsLmdldEF0dHJpYnV0ZSgnc3JjJyksIHRoaXMuZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWF0MngnKSk7XHJcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMucGF0aC5jaGVja18yeF92YXJpYW50KGZ1bmN0aW9uKGhhc1ZhcmlhbnQpIHtcclxuICAgICAgICAgICAgaWYgKGhhc1ZhcmlhbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuc3dhcCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcm9vdC5SZXRpbmFJbWFnZSA9IFJldGluYUltYWdlO1xyXG5cclxuICAgIFJldGluYUltYWdlLnByb3RvdHlwZS5zd2FwID0gZnVuY3Rpb24ocGF0aCkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgcGF0aCA9IHRoaXMucGF0aC5hdF8yeF9wYXRoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIGZ1bmN0aW9uIGxvYWQoKSB7XHJcbiAgICAgICAgICAgIGlmICghIHRoYXQuZWwuY29tcGxldGUpIHtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQobG9hZCwgNSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY29uZmlnLmZvcmNlX29yaWdpbmFsX2RpbWVuc2lvbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmVsLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCB0aGF0LmVsLm9mZnNldFdpZHRoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmVsLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgdGhhdC5lbC5vZmZzZXRIZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoYXQuZWwuc2V0QXR0cmlidXRlKCdzcmMnLCBwYXRoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBsb2FkKCk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICBpZiAoUmV0aW5hLmlzUmV0aW5hKCkpIHtcclxuICAgICAgICBSZXRpbmEuaW5pdChyb290KTtcclxuICAgIH1cclxufSkoKTtcclxuIiwiLyohIGZhbmN5Qm94IHYyLjEuNSBmYW5jeWFwcHMuY29tIHwgZmFuY3lhcHBzLmNvbS9mYW5jeWJveC8jbGljZW5zZSAqL1xyXG4oZnVuY3Rpb24ocixHLGYsdil7dmFyIEo9ZihcImh0bWxcIiksbj1mKHIpLHA9ZihHKSxiPWYuZmFuY3lib3g9ZnVuY3Rpb24oKXtiLm9wZW4uYXBwbHkodGhpcyxhcmd1bWVudHMpfSxJPW5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL21zaWUvaSksQj1udWxsLHM9Ry5jcmVhdGVUb3VjaCE9PXYsdD1mdW5jdGlvbihhKXtyZXR1cm4gYSYmYS5oYXNPd25Qcm9wZXJ0eSYmYSBpbnN0YW5jZW9mIGZ9LHE9ZnVuY3Rpb24oYSl7cmV0dXJuIGEmJlwic3RyaW5nXCI9PT1mLnR5cGUoYSl9LEU9ZnVuY3Rpb24oYSl7cmV0dXJuIHEoYSkmJjA8YS5pbmRleE9mKFwiJVwiKX0sbD1mdW5jdGlvbihhLGQpe3ZhciBlPXBhcnNlSW50KGEsMTApfHwwO2QmJkUoYSkmJihlKj1iLmdldFZpZXdwb3J0KClbZF0vMTAwKTtyZXR1cm4gTWF0aC5jZWlsKGUpfSx3PWZ1bmN0aW9uKGEsYil7cmV0dXJuIGwoYSxiKStcInB4XCJ9O2YuZXh0ZW5kKGIse3ZlcnNpb246XCIyLjEuNVwiLGRlZmF1bHRzOntwYWRkaW5nOjE1LG1hcmdpbjoyMCxcclxud2lkdGg6ODAwLGhlaWdodDo2MDAsbWluV2lkdGg6MTAwLG1pbkhlaWdodDoxMDAsbWF4V2lkdGg6OTk5OSxtYXhIZWlnaHQ6OTk5OSxwaXhlbFJhdGlvOjEsYXV0b1NpemU6ITAsYXV0b0hlaWdodDohMSxhdXRvV2lkdGg6ITEsYXV0b1Jlc2l6ZTohMCxhdXRvQ2VudGVyOiFzLGZpdFRvVmlldzohMCxhc3BlY3RSYXRpbzohMSx0b3BSYXRpbzowLjUsbGVmdFJhdGlvOjAuNSxzY3JvbGxpbmc6XCJhdXRvXCIsd3JhcENTUzpcIlwiLGFycm93czohMCxjbG9zZUJ0bjohMCxjbG9zZUNsaWNrOiExLG5leHRDbGljazohMSxtb3VzZVdoZWVsOiEwLGF1dG9QbGF5OiExLHBsYXlTcGVlZDozRTMscHJlbG9hZDozLG1vZGFsOiExLGxvb3A6ITAsYWpheDp7ZGF0YVR5cGU6XCJodG1sXCIsaGVhZGVyczp7XCJYLWZhbmN5Qm94XCI6ITB9fSxpZnJhbWU6e3Njcm9sbGluZzpcImF1dG9cIixwcmVsb2FkOiEwfSxzd2Y6e3dtb2RlOlwidHJhbnNwYXJlbnRcIixhbGxvd2Z1bGxzY3JlZW46XCJ0cnVlXCIsYWxsb3dzY3JpcHRhY2Nlc3M6XCJhbHdheXNcIn0sXHJcbmtleXM6e25leHQ6ezEzOlwibGVmdFwiLDM0OlwidXBcIiwzOTpcImxlZnRcIiw0MDpcInVwXCJ9LHByZXY6ezg6XCJyaWdodFwiLDMzOlwiZG93blwiLDM3OlwicmlnaHRcIiwzODpcImRvd25cIn0sY2xvc2U6WzI3XSxwbGF5OlszMl0sdG9nZ2xlOls3MF19LGRpcmVjdGlvbjp7bmV4dDpcImxlZnRcIixwcmV2OlwicmlnaHRcIn0sc2Nyb2xsT3V0c2lkZTohMCxpbmRleDowLHR5cGU6bnVsbCxocmVmOm51bGwsY29udGVudDpudWxsLHRpdGxlOm51bGwsdHBsOnt3cmFwOic8ZGl2IGNsYXNzPVwiZmFuY3lib3gtd3JhcFwiIHRhYkluZGV4PVwiLTFcIj48ZGl2IGNsYXNzPVwiZmFuY3lib3gtc2tpblwiPjxkaXYgY2xhc3M9XCJmYW5jeWJveC1vdXRlclwiPjxkaXYgY2xhc3M9XCJmYW5jeWJveC1pbm5lclwiPjwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2PicsaW1hZ2U6JzxpbWcgY2xhc3M9XCJmYW5jeWJveC1pbWFnZVwiIHNyYz1cIntocmVmfVwiIGFsdD1cIlwiIC8+JyxpZnJhbWU6JzxpZnJhbWUgaWQ9XCJmYW5jeWJveC1mcmFtZXtybmR9XCIgbmFtZT1cImZhbmN5Ym94LWZyYW1le3JuZH1cIiBjbGFzcz1cImZhbmN5Ym94LWlmcmFtZVwiIGZyYW1lYm9yZGVyPVwiMFwiIHZzcGFjZT1cIjBcIiBoc3BhY2U9XCIwXCIgd2Via2l0QWxsb3dGdWxsU2NyZWVuIG1vemFsbG93ZnVsbHNjcmVlbiBhbGxvd0Z1bGxTY3JlZW4nK1xyXG4oST8nIGFsbG93dHJhbnNwYXJlbmN5PVwidHJ1ZVwiJzpcIlwiKStcIj48L2lmcmFtZT5cIixlcnJvcjonPHAgY2xhc3M9XCJmYW5jeWJveC1lcnJvclwiPlRoZSByZXF1ZXN0ZWQgY29udGVudCBjYW5ub3QgYmUgbG9hZGVkLjxici8+UGxlYXNlIHRyeSBhZ2FpbiBsYXRlci48L3A+JyxjbG9zZUJ0bjonPGEgdGl0bGU9XCJDbG9zZVwiIGNsYXNzPVwiZmFuY3lib3gtaXRlbSBmYW5jeWJveC1jbG9zZVwiIGhyZWY9XCJqYXZhc2NyaXB0OjtcIj48L2E+JyxuZXh0Oic8YSB0aXRsZT1cIk5leHRcIiBjbGFzcz1cImZhbmN5Ym94LW5hdiBmYW5jeWJveC1uZXh0XCIgaHJlZj1cImphdmFzY3JpcHQ6O1wiPjxzcGFuPjwvc3Bhbj48L2E+JyxwcmV2Oic8YSB0aXRsZT1cIlByZXZpb3VzXCIgY2xhc3M9XCJmYW5jeWJveC1uYXYgZmFuY3lib3gtcHJldlwiIGhyZWY9XCJqYXZhc2NyaXB0OjtcIj48c3Bhbj48L3NwYW4+PC9hPid9LG9wZW5FZmZlY3Q6XCJmYWRlXCIsb3BlblNwZWVkOjI1MCxvcGVuRWFzaW5nOlwic3dpbmdcIixvcGVuT3BhY2l0eTohMCxcclxub3Blbk1ldGhvZDpcInpvb21JblwiLGNsb3NlRWZmZWN0OlwiZmFkZVwiLGNsb3NlU3BlZWQ6MjUwLGNsb3NlRWFzaW5nOlwic3dpbmdcIixjbG9zZU9wYWNpdHk6ITAsY2xvc2VNZXRob2Q6XCJ6b29tT3V0XCIsbmV4dEVmZmVjdDpcImVsYXN0aWNcIixuZXh0U3BlZWQ6MjUwLG5leHRFYXNpbmc6XCJzd2luZ1wiLG5leHRNZXRob2Q6XCJjaGFuZ2VJblwiLHByZXZFZmZlY3Q6XCJlbGFzdGljXCIscHJldlNwZWVkOjI1MCxwcmV2RWFzaW5nOlwic3dpbmdcIixwcmV2TWV0aG9kOlwiY2hhbmdlT3V0XCIsaGVscGVyczp7b3ZlcmxheTohMCx0aXRsZTohMH0sb25DYW5jZWw6Zi5ub29wLGJlZm9yZUxvYWQ6Zi5ub29wLGFmdGVyTG9hZDpmLm5vb3AsYmVmb3JlU2hvdzpmLm5vb3AsYWZ0ZXJTaG93OmYubm9vcCxiZWZvcmVDaGFuZ2U6Zi5ub29wLGJlZm9yZUNsb3NlOmYubm9vcCxhZnRlckNsb3NlOmYubm9vcH0sZ3JvdXA6e30sb3B0czp7fSxwcmV2aW91czpudWxsLGNvbWluZzpudWxsLGN1cnJlbnQ6bnVsbCxpc0FjdGl2ZTohMSxcclxuaXNPcGVuOiExLGlzT3BlbmVkOiExLHdyYXA6bnVsbCxza2luOm51bGwsb3V0ZXI6bnVsbCxpbm5lcjpudWxsLHBsYXllcjp7dGltZXI6bnVsbCxpc0FjdGl2ZTohMX0sYWpheExvYWQ6bnVsbCxpbWdQcmVsb2FkOm51bGwsdHJhbnNpdGlvbnM6e30saGVscGVyczp7fSxvcGVuOmZ1bmN0aW9uKGEsZCl7aWYoYSYmKGYuaXNQbGFpbk9iamVjdChkKXx8KGQ9e30pLCExIT09Yi5jbG9zZSghMCkpKXJldHVybiBmLmlzQXJyYXkoYSl8fChhPXQoYSk/ZihhKS5nZXQoKTpbYV0pLGYuZWFjaChhLGZ1bmN0aW9uKGUsYyl7dmFyIGs9e30sZyxoLGosbSxsO1wib2JqZWN0XCI9PT1mLnR5cGUoYykmJihjLm5vZGVUeXBlJiYoYz1mKGMpKSx0KGMpPyhrPXtocmVmOmMuZGF0YShcImZhbmN5Ym94LWhyZWZcIil8fGMuYXR0cihcImhyZWZcIiksdGl0bGU6Yy5kYXRhKFwiZmFuY3lib3gtdGl0bGVcIil8fGMuYXR0cihcInRpdGxlXCIpLGlzRG9tOiEwLGVsZW1lbnQ6Y30sZi5tZXRhZGF0YSYmZi5leHRlbmQoITAsayxcclxuYy5tZXRhZGF0YSgpKSk6az1jKTtnPWQuaHJlZnx8ay5ocmVmfHwocShjKT9jOm51bGwpO2g9ZC50aXRsZSE9PXY/ZC50aXRsZTprLnRpdGxlfHxcIlwiO209KGo9ZC5jb250ZW50fHxrLmNvbnRlbnQpP1wiaHRtbFwiOmQudHlwZXx8ay50eXBlOyFtJiZrLmlzRG9tJiYobT1jLmRhdGEoXCJmYW5jeWJveC10eXBlXCIpLG18fChtPShtPWMucHJvcChcImNsYXNzXCIpLm1hdGNoKC9mYW5jeWJveFxcLihcXHcrKS8pKT9tWzFdOm51bGwpKTtxKGcpJiYobXx8KGIuaXNJbWFnZShnKT9tPVwiaW1hZ2VcIjpiLmlzU1dGKGcpP209XCJzd2ZcIjpcIiNcIj09PWcuY2hhckF0KDApP209XCJpbmxpbmVcIjpxKGMpJiYobT1cImh0bWxcIixqPWMpKSxcImFqYXhcIj09PW0mJihsPWcuc3BsaXQoL1xccysvLDIpLGc9bC5zaGlmdCgpLGw9bC5zaGlmdCgpKSk7anx8KFwiaW5saW5lXCI9PT1tP2c/aj1mKHEoZyk/Zy5yZXBsYWNlKC8uKig/PSNbXlxcc10rJCkvLFwiXCIpOmcpOmsuaXNEb20mJihqPWMpOlwiaHRtbFwiPT09bT9qPWc6IW0mJighZyYmXHJcbmsuaXNEb20pJiYobT1cImlubGluZVwiLGo9YykpO2YuZXh0ZW5kKGsse2hyZWY6Zyx0eXBlOm0sY29udGVudDpqLHRpdGxlOmgsc2VsZWN0b3I6bH0pO2FbZV09a30pLGIub3B0cz1mLmV4dGVuZCghMCx7fSxiLmRlZmF1bHRzLGQpLGQua2V5cyE9PXYmJihiLm9wdHMua2V5cz1kLmtleXM/Zi5leHRlbmQoe30sYi5kZWZhdWx0cy5rZXlzLGQua2V5cyk6ITEpLGIuZ3JvdXA9YSxiLl9zdGFydChiLm9wdHMuaW5kZXgpfSxjYW5jZWw6ZnVuY3Rpb24oKXt2YXIgYT1iLmNvbWluZzthJiYhMSE9PWIudHJpZ2dlcihcIm9uQ2FuY2VsXCIpJiYoYi5oaWRlTG9hZGluZygpLGIuYWpheExvYWQmJmIuYWpheExvYWQuYWJvcnQoKSxiLmFqYXhMb2FkPW51bGwsYi5pbWdQcmVsb2FkJiYoYi5pbWdQcmVsb2FkLm9ubG9hZD1iLmltZ1ByZWxvYWQub25lcnJvcj1udWxsKSxhLndyYXAmJmEud3JhcC5zdG9wKCEwLCEwKS50cmlnZ2VyKFwib25SZXNldFwiKS5yZW1vdmUoKSxiLmNvbWluZz1udWxsLGIuY3VycmVudHx8XHJcbmIuX2FmdGVyWm9vbU91dChhKSl9LGNsb3NlOmZ1bmN0aW9uKGEpe2IuY2FuY2VsKCk7ITEhPT1iLnRyaWdnZXIoXCJiZWZvcmVDbG9zZVwiKSYmKGIudW5iaW5kRXZlbnRzKCksYi5pc0FjdGl2ZSYmKCFiLmlzT3Blbnx8ITA9PT1hPyhmKFwiLmZhbmN5Ym94LXdyYXBcIikuc3RvcCghMCkudHJpZ2dlcihcIm9uUmVzZXRcIikucmVtb3ZlKCksYi5fYWZ0ZXJab29tT3V0KCkpOihiLmlzT3Blbj1iLmlzT3BlbmVkPSExLGIuaXNDbG9zaW5nPSEwLGYoXCIuZmFuY3lib3gtaXRlbSwgLmZhbmN5Ym94LW5hdlwiKS5yZW1vdmUoKSxiLndyYXAuc3RvcCghMCwhMCkucmVtb3ZlQ2xhc3MoXCJmYW5jeWJveC1vcGVuZWRcIiksYi50cmFuc2l0aW9uc1tiLmN1cnJlbnQuY2xvc2VNZXRob2RdKCkpKSl9LHBsYXk6ZnVuY3Rpb24oYSl7dmFyIGQ9ZnVuY3Rpb24oKXtjbGVhclRpbWVvdXQoYi5wbGF5ZXIudGltZXIpfSxlPWZ1bmN0aW9uKCl7ZCgpO2IuY3VycmVudCYmYi5wbGF5ZXIuaXNBY3RpdmUmJihiLnBsYXllci50aW1lcj1cclxuc2V0VGltZW91dChiLm5leHQsYi5jdXJyZW50LnBsYXlTcGVlZCkpfSxjPWZ1bmN0aW9uKCl7ZCgpO3AudW5iaW5kKFwiLnBsYXllclwiKTtiLnBsYXllci5pc0FjdGl2ZT0hMTtiLnRyaWdnZXIoXCJvblBsYXlFbmRcIil9O2lmKCEwPT09YXx8IWIucGxheWVyLmlzQWN0aXZlJiYhMSE9PWEpe2lmKGIuY3VycmVudCYmKGIuY3VycmVudC5sb29wfHxiLmN1cnJlbnQuaW5kZXg8Yi5ncm91cC5sZW5ndGgtMSkpYi5wbGF5ZXIuaXNBY3RpdmU9ITAscC5iaW5kKHtcIm9uQ2FuY2VsLnBsYXllciBiZWZvcmVDbG9zZS5wbGF5ZXJcIjpjLFwib25VcGRhdGUucGxheWVyXCI6ZSxcImJlZm9yZUxvYWQucGxheWVyXCI6ZH0pLGUoKSxiLnRyaWdnZXIoXCJvblBsYXlTdGFydFwiKX1lbHNlIGMoKX0sbmV4dDpmdW5jdGlvbihhKXt2YXIgZD1iLmN1cnJlbnQ7ZCYmKHEoYSl8fChhPWQuZGlyZWN0aW9uLm5leHQpLGIuanVtcHRvKGQuaW5kZXgrMSxhLFwibmV4dFwiKSl9LHByZXY6ZnVuY3Rpb24oYSl7dmFyIGQ9Yi5jdXJyZW50O1xyXG5kJiYocShhKXx8KGE9ZC5kaXJlY3Rpb24ucHJldiksYi5qdW1wdG8oZC5pbmRleC0xLGEsXCJwcmV2XCIpKX0sanVtcHRvOmZ1bmN0aW9uKGEsZCxlKXt2YXIgYz1iLmN1cnJlbnQ7YyYmKGE9bChhKSxiLmRpcmVjdGlvbj1kfHxjLmRpcmVjdGlvblthPj1jLmluZGV4P1wibmV4dFwiOlwicHJldlwiXSxiLnJvdXRlcj1lfHxcImp1bXB0b1wiLGMubG9vcCYmKDA+YSYmKGE9Yy5ncm91cC5sZW5ndGgrYSVjLmdyb3VwLmxlbmd0aCksYSU9Yy5ncm91cC5sZW5ndGgpLGMuZ3JvdXBbYV0hPT12JiYoYi5jYW5jZWwoKSxiLl9zdGFydChhKSkpfSxyZXBvc2l0aW9uOmZ1bmN0aW9uKGEsZCl7dmFyIGU9Yi5jdXJyZW50LGM9ZT9lLndyYXA6bnVsbCxrO2MmJihrPWIuX2dldFBvc2l0aW9uKGQpLGEmJlwic2Nyb2xsXCI9PT1hLnR5cGU/KGRlbGV0ZSBrLnBvc2l0aW9uLGMuc3RvcCghMCwhMCkuYW5pbWF0ZShrLDIwMCkpOihjLmNzcyhrKSxlLnBvcz1mLmV4dGVuZCh7fSxlLmRpbSxrKSkpfSx1cGRhdGU6ZnVuY3Rpb24oYSl7dmFyIGQ9XHJcbmEmJmEudHlwZSxlPSFkfHxcIm9yaWVudGF0aW9uY2hhbmdlXCI9PT1kO2UmJihjbGVhclRpbWVvdXQoQiksQj1udWxsKTtiLmlzT3BlbiYmIUImJihCPXNldFRpbWVvdXQoZnVuY3Rpb24oKXt2YXIgYz1iLmN1cnJlbnQ7YyYmIWIuaXNDbG9zaW5nJiYoYi53cmFwLnJlbW92ZUNsYXNzKFwiZmFuY3lib3gtdG1wXCIpLChlfHxcImxvYWRcIj09PWR8fFwicmVzaXplXCI9PT1kJiZjLmF1dG9SZXNpemUpJiZiLl9zZXREaW1lbnNpb24oKSxcInNjcm9sbFwiPT09ZCYmYy5jYW5TaHJpbmt8fGIucmVwb3NpdGlvbihhKSxiLnRyaWdnZXIoXCJvblVwZGF0ZVwiKSxCPW51bGwpfSxlJiYhcz8wOjMwMCkpfSx0b2dnbGU6ZnVuY3Rpb24oYSl7Yi5pc09wZW4mJihiLmN1cnJlbnQuZml0VG9WaWV3PVwiYm9vbGVhblwiPT09Zi50eXBlKGEpP2E6IWIuY3VycmVudC5maXRUb1ZpZXcscyYmKGIud3JhcC5yZW1vdmVBdHRyKFwic3R5bGVcIikuYWRkQ2xhc3MoXCJmYW5jeWJveC10bXBcIiksYi50cmlnZ2VyKFwib25VcGRhdGVcIikpLFxyXG5iLnVwZGF0ZSgpKX0saGlkZUxvYWRpbmc6ZnVuY3Rpb24oKXtwLnVuYmluZChcIi5sb2FkaW5nXCIpO2YoXCIjZmFuY3lib3gtbG9hZGluZ1wiKS5yZW1vdmUoKX0sc2hvd0xvYWRpbmc6ZnVuY3Rpb24oKXt2YXIgYSxkO2IuaGlkZUxvYWRpbmcoKTthPWYoJzxkaXYgaWQ9XCJmYW5jeWJveC1sb2FkaW5nXCI+PGRpdj48L2Rpdj48L2Rpdj4nKS5jbGljayhiLmNhbmNlbCkuYXBwZW5kVG8oXCJib2R5XCIpO3AuYmluZChcImtleWRvd24ubG9hZGluZ1wiLGZ1bmN0aW9uKGEpe2lmKDI3PT09KGEud2hpY2h8fGEua2V5Q29kZSkpYS5wcmV2ZW50RGVmYXVsdCgpLGIuY2FuY2VsKCl9KTtiLmRlZmF1bHRzLmZpeGVkfHwoZD1iLmdldFZpZXdwb3J0KCksYS5jc3Moe3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6MC41KmQuaCtkLnksbGVmdDowLjUqZC53K2QueH0pKX0sZ2V0Vmlld3BvcnQ6ZnVuY3Rpb24oKXt2YXIgYT1iLmN1cnJlbnQmJmIuY3VycmVudC5sb2NrZWR8fCExLGQ9e3g6bi5zY3JvbGxMZWZ0KCksXHJcbnk6bi5zY3JvbGxUb3AoKX07YT8oZC53PWFbMF0uY2xpZW50V2lkdGgsZC5oPWFbMF0uY2xpZW50SGVpZ2h0KTooZC53PXMmJnIuaW5uZXJXaWR0aD9yLmlubmVyV2lkdGg6bi53aWR0aCgpLGQuaD1zJiZyLmlubmVySGVpZ2h0P3IuaW5uZXJIZWlnaHQ6bi5oZWlnaHQoKSk7cmV0dXJuIGR9LHVuYmluZEV2ZW50czpmdW5jdGlvbigpe2Iud3JhcCYmdChiLndyYXApJiZiLndyYXAudW5iaW5kKFwiLmZiXCIpO3AudW5iaW5kKFwiLmZiXCIpO24udW5iaW5kKFwiLmZiXCIpfSxiaW5kRXZlbnRzOmZ1bmN0aW9uKCl7dmFyIGE9Yi5jdXJyZW50LGQ7YSYmKG4uYmluZChcIm9yaWVudGF0aW9uY2hhbmdlLmZiXCIrKHM/XCJcIjpcIiByZXNpemUuZmJcIikrKGEuYXV0b0NlbnRlciYmIWEubG9ja2VkP1wiIHNjcm9sbC5mYlwiOlwiXCIpLGIudXBkYXRlKSwoZD1hLmtleXMpJiZwLmJpbmQoXCJrZXlkb3duLmZiXCIsZnVuY3Rpb24oZSl7dmFyIGM9ZS53aGljaHx8ZS5rZXlDb2RlLGs9ZS50YXJnZXR8fGUuc3JjRWxlbWVudDtcclxuaWYoMjc9PT1jJiZiLmNvbWluZylyZXR1cm4hMTshZS5jdHJsS2V5JiYoIWUuYWx0S2V5JiYhZS5zaGlmdEtleSYmIWUubWV0YUtleSYmKCFrfHwhay50eXBlJiYhZihrKS5pcyhcIltjb250ZW50ZWRpdGFibGVdXCIpKSkmJmYuZWFjaChkLGZ1bmN0aW9uKGQsayl7aWYoMTxhLmdyb3VwLmxlbmd0aCYma1tjXSE9PXYpcmV0dXJuIGJbZF0oa1tjXSksZS5wcmV2ZW50RGVmYXVsdCgpLCExO2lmKC0xPGYuaW5BcnJheShjLGspKXJldHVybiBiW2RdKCksZS5wcmV2ZW50RGVmYXVsdCgpLCExfSl9KSxmLmZuLm1vdXNld2hlZWwmJmEubW91c2VXaGVlbCYmYi53cmFwLmJpbmQoXCJtb3VzZXdoZWVsLmZiXCIsZnVuY3Rpb24oZCxjLGssZyl7Zm9yKHZhciBoPWYoZC50YXJnZXR8fG51bGwpLGo9ITE7aC5sZW5ndGgmJiFqJiYhaC5pcyhcIi5mYW5jeWJveC1za2luXCIpJiYhaC5pcyhcIi5mYW5jeWJveC13cmFwXCIpOylqPWhbMF0mJiEoaFswXS5zdHlsZS5vdmVyZmxvdyYmXCJoaWRkZW5cIj09PWhbMF0uc3R5bGUub3ZlcmZsb3cpJiZcclxuKGhbMF0uY2xpZW50V2lkdGgmJmhbMF0uc2Nyb2xsV2lkdGg+aFswXS5jbGllbnRXaWR0aHx8aFswXS5jbGllbnRIZWlnaHQmJmhbMF0uc2Nyb2xsSGVpZ2h0PmhbMF0uY2xpZW50SGVpZ2h0KSxoPWYoaCkucGFyZW50KCk7aWYoMCE9PWMmJiFqJiYxPGIuZ3JvdXAubGVuZ3RoJiYhYS5jYW5TaHJpbmspe2lmKDA8Z3x8MDxrKWIucHJldigwPGc/XCJkb3duXCI6XCJsZWZ0XCIpO2Vsc2UgaWYoMD5nfHwwPmspYi5uZXh0KDA+Zz9cInVwXCI6XCJyaWdodFwiKTtkLnByZXZlbnREZWZhdWx0KCl9fSkpfSx0cmlnZ2VyOmZ1bmN0aW9uKGEsZCl7dmFyIGUsYz1kfHxiLmNvbWluZ3x8Yi5jdXJyZW50O2lmKGMpe2YuaXNGdW5jdGlvbihjW2FdKSYmKGU9Y1thXS5hcHBseShjLEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywxKSkpO2lmKCExPT09ZSlyZXR1cm4hMTtjLmhlbHBlcnMmJmYuZWFjaChjLmhlbHBlcnMsZnVuY3Rpb24oZCxlKXtpZihlJiZiLmhlbHBlcnNbZF0mJmYuaXNGdW5jdGlvbihiLmhlbHBlcnNbZF1bYV0pKWIuaGVscGVyc1tkXVthXShmLmV4dGVuZCghMCxcclxue30sYi5oZWxwZXJzW2RdLmRlZmF1bHRzLGUpLGMpfSk7cC50cmlnZ2VyKGEpfX0saXNJbWFnZTpmdW5jdGlvbihhKXtyZXR1cm4gcShhKSYmYS5tYXRjaCgvKF5kYXRhOmltYWdlXFwvLiosKXwoXFwuKGpwKGV8Z3xlZyl8Z2lmfHBuZ3xibXB8d2VicHxzdmcpKChcXD98IykuKik/JCkvaSl9LGlzU1dGOmZ1bmN0aW9uKGEpe3JldHVybiBxKGEpJiZhLm1hdGNoKC9cXC4oc3dmKSgoXFw/fCMpLiopPyQvaSl9LF9zdGFydDpmdW5jdGlvbihhKXt2YXIgZD17fSxlLGM7YT1sKGEpO2U9Yi5ncm91cFthXXx8bnVsbDtpZighZSlyZXR1cm4hMTtkPWYuZXh0ZW5kKCEwLHt9LGIub3B0cyxlKTtlPWQubWFyZ2luO2M9ZC5wYWRkaW5nO1wibnVtYmVyXCI9PT1mLnR5cGUoZSkmJihkLm1hcmdpbj1bZSxlLGUsZV0pO1wibnVtYmVyXCI9PT1mLnR5cGUoYykmJihkLnBhZGRpbmc9W2MsYyxjLGNdKTtkLm1vZGFsJiZmLmV4dGVuZCghMCxkLHtjbG9zZUJ0bjohMSxjbG9zZUNsaWNrOiExLG5leHRDbGljazohMSxhcnJvd3M6ITEsXHJcbm1vdXNlV2hlZWw6ITEsa2V5czpudWxsLGhlbHBlcnM6e292ZXJsYXk6e2Nsb3NlQ2xpY2s6ITF9fX0pO2QuYXV0b1NpemUmJihkLmF1dG9XaWR0aD1kLmF1dG9IZWlnaHQ9ITApO1wiYXV0b1wiPT09ZC53aWR0aCYmKGQuYXV0b1dpZHRoPSEwKTtcImF1dG9cIj09PWQuaGVpZ2h0JiYoZC5hdXRvSGVpZ2h0PSEwKTtkLmdyb3VwPWIuZ3JvdXA7ZC5pbmRleD1hO2IuY29taW5nPWQ7aWYoITE9PT1iLnRyaWdnZXIoXCJiZWZvcmVMb2FkXCIpKWIuY29taW5nPW51bGw7ZWxzZXtjPWQudHlwZTtlPWQuaHJlZjtpZighYylyZXR1cm4gYi5jb21pbmc9bnVsbCxiLmN1cnJlbnQmJmIucm91dGVyJiZcImp1bXB0b1wiIT09Yi5yb3V0ZXI/KGIuY3VycmVudC5pbmRleD1hLGJbYi5yb3V0ZXJdKGIuZGlyZWN0aW9uKSk6ITE7Yi5pc0FjdGl2ZT0hMDtpZihcImltYWdlXCI9PT1jfHxcInN3ZlwiPT09YylkLmF1dG9IZWlnaHQ9ZC5hdXRvV2lkdGg9ITEsZC5zY3JvbGxpbmc9XCJ2aXNpYmxlXCI7XCJpbWFnZVwiPT09YyYmKGQuYXNwZWN0UmF0aW89XHJcbiEwKTtcImlmcmFtZVwiPT09YyYmcyYmKGQuc2Nyb2xsaW5nPVwic2Nyb2xsXCIpO2Qud3JhcD1mKGQudHBsLndyYXApLmFkZENsYXNzKFwiZmFuY3lib3gtXCIrKHM/XCJtb2JpbGVcIjpcImRlc2t0b3BcIikrXCIgZmFuY3lib3gtdHlwZS1cIitjK1wiIGZhbmN5Ym94LXRtcCBcIitkLndyYXBDU1MpLmFwcGVuZFRvKGQucGFyZW50fHxcImJvZHlcIik7Zi5leHRlbmQoZCx7c2tpbjpmKFwiLmZhbmN5Ym94LXNraW5cIixkLndyYXApLG91dGVyOmYoXCIuZmFuY3lib3gtb3V0ZXJcIixkLndyYXApLGlubmVyOmYoXCIuZmFuY3lib3gtaW5uZXJcIixkLndyYXApfSk7Zi5lYWNoKFtcIlRvcFwiLFwiUmlnaHRcIixcIkJvdHRvbVwiLFwiTGVmdFwiXSxmdW5jdGlvbihhLGIpe2Quc2tpbi5jc3MoXCJwYWRkaW5nXCIrYix3KGQucGFkZGluZ1thXSkpfSk7Yi50cmlnZ2VyKFwib25SZWFkeVwiKTtpZihcImlubGluZVwiPT09Y3x8XCJodG1sXCI9PT1jKXtpZighZC5jb250ZW50fHwhZC5jb250ZW50Lmxlbmd0aClyZXR1cm4gYi5fZXJyb3IoXCJjb250ZW50XCIpfWVsc2UgaWYoIWUpcmV0dXJuIGIuX2Vycm9yKFwiaHJlZlwiKTtcclxuXCJpbWFnZVwiPT09Yz9iLl9sb2FkSW1hZ2UoKTpcImFqYXhcIj09PWM/Yi5fbG9hZEFqYXgoKTpcImlmcmFtZVwiPT09Yz9iLl9sb2FkSWZyYW1lKCk6Yi5fYWZ0ZXJMb2FkKCl9fSxfZXJyb3I6ZnVuY3Rpb24oYSl7Zi5leHRlbmQoYi5jb21pbmcse3R5cGU6XCJodG1sXCIsYXV0b1dpZHRoOiEwLGF1dG9IZWlnaHQ6ITAsbWluV2lkdGg6MCxtaW5IZWlnaHQ6MCxzY3JvbGxpbmc6XCJub1wiLGhhc0Vycm9yOmEsY29udGVudDpiLmNvbWluZy50cGwuZXJyb3J9KTtiLl9hZnRlckxvYWQoKX0sX2xvYWRJbWFnZTpmdW5jdGlvbigpe3ZhciBhPWIuaW1nUHJlbG9hZD1uZXcgSW1hZ2U7YS5vbmxvYWQ9ZnVuY3Rpb24oKXt0aGlzLm9ubG9hZD10aGlzLm9uZXJyb3I9bnVsbDtiLmNvbWluZy53aWR0aD10aGlzLndpZHRoL2Iub3B0cy5waXhlbFJhdGlvO2IuY29taW5nLmhlaWdodD10aGlzLmhlaWdodC9iLm9wdHMucGl4ZWxSYXRpbztiLl9hZnRlckxvYWQoKX07YS5vbmVycm9yPWZ1bmN0aW9uKCl7dGhpcy5vbmxvYWQ9XHJcbnRoaXMub25lcnJvcj1udWxsO2IuX2Vycm9yKFwiaW1hZ2VcIil9O2Euc3JjPWIuY29taW5nLmhyZWY7ITAhPT1hLmNvbXBsZXRlJiZiLnNob3dMb2FkaW5nKCl9LF9sb2FkQWpheDpmdW5jdGlvbigpe3ZhciBhPWIuY29taW5nO2Iuc2hvd0xvYWRpbmcoKTtiLmFqYXhMb2FkPWYuYWpheChmLmV4dGVuZCh7fSxhLmFqYXgse3VybDphLmhyZWYsZXJyb3I6ZnVuY3Rpb24oYSxlKXtiLmNvbWluZyYmXCJhYm9ydFwiIT09ZT9iLl9lcnJvcihcImFqYXhcIixhKTpiLmhpZGVMb2FkaW5nKCl9LHN1Y2Nlc3M6ZnVuY3Rpb24oZCxlKXtcInN1Y2Nlc3NcIj09PWUmJihhLmNvbnRlbnQ9ZCxiLl9hZnRlckxvYWQoKSl9fSkpfSxfbG9hZElmcmFtZTpmdW5jdGlvbigpe3ZhciBhPWIuY29taW5nLGQ9ZihhLnRwbC5pZnJhbWUucmVwbGFjZSgvXFx7cm5kXFx9L2csKG5ldyBEYXRlKS5nZXRUaW1lKCkpKS5hdHRyKFwic2Nyb2xsaW5nXCIscz9cImF1dG9cIjphLmlmcmFtZS5zY3JvbGxpbmcpLmF0dHIoXCJzcmNcIixhLmhyZWYpO1xyXG5mKGEud3JhcCkuYmluZChcIm9uUmVzZXRcIixmdW5jdGlvbigpe3RyeXtmKHRoaXMpLmZpbmQoXCJpZnJhbWVcIikuaGlkZSgpLmF0dHIoXCJzcmNcIixcIi8vYWJvdXQ6YmxhbmtcIikuZW5kKCkuZW1wdHkoKX1jYXRjaChhKXt9fSk7YS5pZnJhbWUucHJlbG9hZCYmKGIuc2hvd0xvYWRpbmcoKSxkLm9uZShcImxvYWRcIixmdW5jdGlvbigpe2YodGhpcykuZGF0YShcInJlYWR5XCIsMSk7c3x8Zih0aGlzKS5iaW5kKFwibG9hZC5mYlwiLGIudXBkYXRlKTtmKHRoaXMpLnBhcmVudHMoXCIuZmFuY3lib3gtd3JhcFwiKS53aWR0aChcIjEwMCVcIikucmVtb3ZlQ2xhc3MoXCJmYW5jeWJveC10bXBcIikuc2hvdygpO2IuX2FmdGVyTG9hZCgpfSkpO2EuY29udGVudD1kLmFwcGVuZFRvKGEuaW5uZXIpO2EuaWZyYW1lLnByZWxvYWR8fGIuX2FmdGVyTG9hZCgpfSxfcHJlbG9hZEltYWdlczpmdW5jdGlvbigpe3ZhciBhPWIuZ3JvdXAsZD1iLmN1cnJlbnQsZT1hLmxlbmd0aCxjPWQucHJlbG9hZD9NYXRoLm1pbihkLnByZWxvYWQsXHJcbmUtMSk6MCxmLGc7Zm9yKGc9MTtnPD1jO2crPTEpZj1hWyhkLmluZGV4K2cpJWVdLFwiaW1hZ2VcIj09PWYudHlwZSYmZi5ocmVmJiYoKG5ldyBJbWFnZSkuc3JjPWYuaHJlZil9LF9hZnRlckxvYWQ6ZnVuY3Rpb24oKXt2YXIgYT1iLmNvbWluZyxkPWIuY3VycmVudCxlLGMsayxnLGg7Yi5oaWRlTG9hZGluZygpO2lmKGEmJiExIT09Yi5pc0FjdGl2ZSlpZighMT09PWIudHJpZ2dlcihcImFmdGVyTG9hZFwiLGEsZCkpYS53cmFwLnN0b3AoITApLnRyaWdnZXIoXCJvblJlc2V0XCIpLnJlbW92ZSgpLGIuY29taW5nPW51bGw7ZWxzZXtkJiYoYi50cmlnZ2VyKFwiYmVmb3JlQ2hhbmdlXCIsZCksZC53cmFwLnN0b3AoITApLnJlbW92ZUNsYXNzKFwiZmFuY3lib3gtb3BlbmVkXCIpLmZpbmQoXCIuZmFuY3lib3gtaXRlbSwgLmZhbmN5Ym94LW5hdlwiKS5yZW1vdmUoKSk7Yi51bmJpbmRFdmVudHMoKTtlPWEuY29udGVudDtjPWEudHlwZTtrPWEuc2Nyb2xsaW5nO2YuZXh0ZW5kKGIse3dyYXA6YS53cmFwLHNraW46YS5za2luLFxyXG5vdXRlcjphLm91dGVyLGlubmVyOmEuaW5uZXIsY3VycmVudDphLHByZXZpb3VzOmR9KTtnPWEuaHJlZjtzd2l0Y2goYyl7Y2FzZSBcImlubGluZVwiOmNhc2UgXCJhamF4XCI6Y2FzZSBcImh0bWxcIjphLnNlbGVjdG9yP2U9ZihcIjxkaXY+XCIpLmh0bWwoZSkuZmluZChhLnNlbGVjdG9yKTp0KGUpJiYoZS5kYXRhKFwiZmFuY3lib3gtcGxhY2Vob2xkZXJcIil8fGUuZGF0YShcImZhbmN5Ym94LXBsYWNlaG9sZGVyXCIsZignPGRpdiBjbGFzcz1cImZhbmN5Ym94LXBsYWNlaG9sZGVyXCI+PC9kaXY+JykuaW5zZXJ0QWZ0ZXIoZSkuaGlkZSgpKSxlPWUuc2hvdygpLmRldGFjaCgpLGEud3JhcC5iaW5kKFwib25SZXNldFwiLGZ1bmN0aW9uKCl7Zih0aGlzKS5maW5kKGUpLmxlbmd0aCYmZS5oaWRlKCkucmVwbGFjZUFsbChlLmRhdGEoXCJmYW5jeWJveC1wbGFjZWhvbGRlclwiKSkuZGF0YShcImZhbmN5Ym94LXBsYWNlaG9sZGVyXCIsITEpfSkpO2JyZWFrO2Nhc2UgXCJpbWFnZVwiOmU9YS50cGwuaW1hZ2UucmVwbGFjZShcIntocmVmfVwiLFxyXG5nKTticmVhaztjYXNlIFwic3dmXCI6ZT0nPG9iamVjdCBpZD1cImZhbmN5Ym94LXN3ZlwiIGNsYXNzaWQ9XCJjbHNpZDpEMjdDREI2RS1BRTZELTExY2YtOTZCOC00NDQ1NTM1NDAwMDBcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCI+PHBhcmFtIG5hbWU9XCJtb3ZpZVwiIHZhbHVlPVwiJytnKydcIj48L3BhcmFtPicsaD1cIlwiLGYuZWFjaChhLnN3ZixmdW5jdGlvbihhLGIpe2UrPSc8cGFyYW0gbmFtZT1cIicrYSsnXCIgdmFsdWU9XCInK2IrJ1wiPjwvcGFyYW0+JztoKz1cIiBcIithKyc9XCInK2IrJ1wiJ30pLGUrPSc8ZW1iZWQgc3JjPVwiJytnKydcIiB0eXBlPVwiYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2hcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCInK2grXCI+PC9lbWJlZD48L29iamVjdD5cIn0oIXQoZSl8fCFlLnBhcmVudCgpLmlzKGEuaW5uZXIpKSYmYS5pbm5lci5hcHBlbmQoZSk7Yi50cmlnZ2VyKFwiYmVmb3JlU2hvd1wiKTthLmlubmVyLmNzcyhcIm92ZXJmbG93XCIsXCJ5ZXNcIj09PWs/XCJzY3JvbGxcIjpcclxuXCJub1wiPT09az9cImhpZGRlblwiOmspO2IuX3NldERpbWVuc2lvbigpO2IucmVwb3NpdGlvbigpO2IuaXNPcGVuPSExO2IuY29taW5nPW51bGw7Yi5iaW5kRXZlbnRzKCk7aWYoYi5pc09wZW5lZCl7aWYoZC5wcmV2TWV0aG9kKWIudHJhbnNpdGlvbnNbZC5wcmV2TWV0aG9kXSgpfWVsc2UgZihcIi5mYW5jeWJveC13cmFwXCIpLm5vdChhLndyYXApLnN0b3AoITApLnRyaWdnZXIoXCJvblJlc2V0XCIpLnJlbW92ZSgpO2IudHJhbnNpdGlvbnNbYi5pc09wZW5lZD9hLm5leHRNZXRob2Q6YS5vcGVuTWV0aG9kXSgpO2IuX3ByZWxvYWRJbWFnZXMoKX19LF9zZXREaW1lbnNpb246ZnVuY3Rpb24oKXt2YXIgYT1iLmdldFZpZXdwb3J0KCksZD0wLGU9ITEsYz0hMSxlPWIud3JhcCxrPWIuc2tpbixnPWIuaW5uZXIsaD1iLmN1cnJlbnQsYz1oLndpZHRoLGo9aC5oZWlnaHQsbT1oLm1pbldpZHRoLHU9aC5taW5IZWlnaHQsbj1oLm1heFdpZHRoLHA9aC5tYXhIZWlnaHQscz1oLnNjcm9sbGluZyxxPWguc2Nyb2xsT3V0c2lkZT9cclxuaC5zY3JvbGxiYXJXaWR0aDowLHg9aC5tYXJnaW4seT1sKHhbMV0reFszXSkscj1sKHhbMF0reFsyXSksdix6LHQsQyxBLEYsQixELEg7ZS5hZGQoaykuYWRkKGcpLndpZHRoKFwiYXV0b1wiKS5oZWlnaHQoXCJhdXRvXCIpLnJlbW92ZUNsYXNzKFwiZmFuY3lib3gtdG1wXCIpO3g9bChrLm91dGVyV2lkdGgoITApLWsud2lkdGgoKSk7dj1sKGsub3V0ZXJIZWlnaHQoITApLWsuaGVpZ2h0KCkpO3o9eSt4O3Q9cit2O0M9RShjKT8oYS53LXopKmwoYykvMTAwOmM7QT1FKGopPyhhLmgtdCkqbChqKS8xMDA6ajtpZihcImlmcmFtZVwiPT09aC50eXBlKXtpZihIPWguY29udGVudCxoLmF1dG9IZWlnaHQmJjE9PT1ILmRhdGEoXCJyZWFkeVwiKSl0cnl7SFswXS5jb250ZW50V2luZG93LmRvY3VtZW50LmxvY2F0aW9uJiYoZy53aWR0aChDKS5oZWlnaHQoOTk5OSksRj1ILmNvbnRlbnRzKCkuZmluZChcImJvZHlcIikscSYmRi5jc3MoXCJvdmVyZmxvdy14XCIsXCJoaWRkZW5cIiksQT1GLm91dGVySGVpZ2h0KCEwKSl9Y2F0Y2goRyl7fX1lbHNlIGlmKGguYXV0b1dpZHRofHxcclxuaC5hdXRvSGVpZ2h0KWcuYWRkQ2xhc3MoXCJmYW5jeWJveC10bXBcIiksaC5hdXRvV2lkdGh8fGcud2lkdGgoQyksaC5hdXRvSGVpZ2h0fHxnLmhlaWdodChBKSxoLmF1dG9XaWR0aCYmKEM9Zy53aWR0aCgpKSxoLmF1dG9IZWlnaHQmJihBPWcuaGVpZ2h0KCkpLGcucmVtb3ZlQ2xhc3MoXCJmYW5jeWJveC10bXBcIik7Yz1sKEMpO2o9bChBKTtEPUMvQTttPWwoRShtKT9sKG0sXCJ3XCIpLXo6bSk7bj1sKEUobik/bChuLFwid1wiKS16Om4pO3U9bChFKHUpP2wodSxcImhcIiktdDp1KTtwPWwoRShwKT9sKHAsXCJoXCIpLXQ6cCk7Rj1uO0I9cDtoLmZpdFRvVmlldyYmKG49TWF0aC5taW4oYS53LXosbikscD1NYXRoLm1pbihhLmgtdCxwKSk7ej1hLncteTtyPWEuaC1yO2guYXNwZWN0UmF0aW8/KGM+biYmKGM9bixqPWwoYy9EKSksaj5wJiYoaj1wLGM9bChqKkQpKSxjPG0mJihjPW0saj1sKGMvRCkpLGo8dSYmKGo9dSxjPWwoaipEKSkpOihjPU1hdGgubWF4KG0sTWF0aC5taW4oYyxuKSksaC5hdXRvSGVpZ2h0JiZcclxuXCJpZnJhbWVcIiE9PWgudHlwZSYmKGcud2lkdGgoYyksaj1nLmhlaWdodCgpKSxqPU1hdGgubWF4KHUsTWF0aC5taW4oaixwKSkpO2lmKGguZml0VG9WaWV3KWlmKGcud2lkdGgoYykuaGVpZ2h0KGopLGUud2lkdGgoYyt4KSxhPWUud2lkdGgoKSx5PWUuaGVpZ2h0KCksaC5hc3BlY3RSYXRpbylmb3IoOyhhPnp8fHk+cikmJihjPm0mJmo+dSkmJiEoMTk8ZCsrKTspaj1NYXRoLm1heCh1LE1hdGgubWluKHAsai0xMCkpLGM9bChqKkQpLGM8bSYmKGM9bSxqPWwoYy9EKSksYz5uJiYoYz1uLGo9bChjL0QpKSxnLndpZHRoKGMpLmhlaWdodChqKSxlLndpZHRoKGMreCksYT1lLndpZHRoKCkseT1lLmhlaWdodCgpO2Vsc2UgYz1NYXRoLm1heChtLE1hdGgubWluKGMsYy0oYS16KSkpLGo9TWF0aC5tYXgodSxNYXRoLm1pbihqLGotKHktcikpKTtxJiYoXCJhdXRvXCI9PT1zJiZqPEEmJmMreCtxPHopJiYoYys9cSk7Zy53aWR0aChjKS5oZWlnaHQoaik7ZS53aWR0aChjK3gpO2E9ZS53aWR0aCgpO1xyXG55PWUuaGVpZ2h0KCk7ZT0oYT56fHx5PnIpJiZjPm0mJmo+dTtjPWguYXNwZWN0UmF0aW8/YzxGJiZqPEImJmM8QyYmajxBOihjPEZ8fGo8QikmJihjPEN8fGo8QSk7Zi5leHRlbmQoaCx7ZGltOnt3aWR0aDp3KGEpLGhlaWdodDp3KHkpfSxvcmlnV2lkdGg6QyxvcmlnSGVpZ2h0OkEsY2FuU2hyaW5rOmUsY2FuRXhwYW5kOmMsd1BhZGRpbmc6eCxoUGFkZGluZzp2LHdyYXBTcGFjZTp5LWsub3V0ZXJIZWlnaHQoITApLHNraW5TcGFjZTprLmhlaWdodCgpLWp9KTshSCYmKGguYXV0b0hlaWdodCYmaj51JiZqPHAmJiFjKSYmZy5oZWlnaHQoXCJhdXRvXCIpfSxfZ2V0UG9zaXRpb246ZnVuY3Rpb24oYSl7dmFyIGQ9Yi5jdXJyZW50LGU9Yi5nZXRWaWV3cG9ydCgpLGM9ZC5tYXJnaW4sZj1iLndyYXAud2lkdGgoKStjWzFdK2NbM10sZz1iLndyYXAuaGVpZ2h0KCkrY1swXStjWzJdLGM9e3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6Y1swXSxsZWZ0OmNbM119O2QuYXV0b0NlbnRlciYmZC5maXhlZCYmXHJcbiFhJiZnPD1lLmgmJmY8PWUudz9jLnBvc2l0aW9uPVwiZml4ZWRcIjpkLmxvY2tlZHx8KGMudG9wKz1lLnksYy5sZWZ0Kz1lLngpO2MudG9wPXcoTWF0aC5tYXgoYy50b3AsYy50b3ArKGUuaC1nKSpkLnRvcFJhdGlvKSk7Yy5sZWZ0PXcoTWF0aC5tYXgoYy5sZWZ0LGMubGVmdCsoZS53LWYpKmQubGVmdFJhdGlvKSk7cmV0dXJuIGN9LF9hZnRlclpvb21JbjpmdW5jdGlvbigpe3ZhciBhPWIuY3VycmVudDthJiYoYi5pc09wZW49Yi5pc09wZW5lZD0hMCxiLndyYXAuY3NzKFwib3ZlcmZsb3dcIixcInZpc2libGVcIikuYWRkQ2xhc3MoXCJmYW5jeWJveC1vcGVuZWRcIiksYi51cGRhdGUoKSwoYS5jbG9zZUNsaWNrfHxhLm5leHRDbGljayYmMTxiLmdyb3VwLmxlbmd0aCkmJmIuaW5uZXIuY3NzKFwiY3Vyc29yXCIsXCJwb2ludGVyXCIpLmJpbmQoXCJjbGljay5mYlwiLGZ1bmN0aW9uKGQpeyFmKGQudGFyZ2V0KS5pcyhcImFcIikmJiFmKGQudGFyZ2V0KS5wYXJlbnQoKS5pcyhcImFcIikmJihkLnByZXZlbnREZWZhdWx0KCksXHJcbmJbYS5jbG9zZUNsaWNrP1wiY2xvc2VcIjpcIm5leHRcIl0oKSl9KSxhLmNsb3NlQnRuJiZmKGEudHBsLmNsb3NlQnRuKS5hcHBlbmRUbyhiLnNraW4pLmJpbmQoXCJjbGljay5mYlwiLGZ1bmN0aW9uKGEpe2EucHJldmVudERlZmF1bHQoKTtiLmNsb3NlKCl9KSxhLmFycm93cyYmMTxiLmdyb3VwLmxlbmd0aCYmKChhLmxvb3B8fDA8YS5pbmRleCkmJmYoYS50cGwucHJldikuYXBwZW5kVG8oYi5vdXRlcikuYmluZChcImNsaWNrLmZiXCIsYi5wcmV2KSwoYS5sb29wfHxhLmluZGV4PGIuZ3JvdXAubGVuZ3RoLTEpJiZmKGEudHBsLm5leHQpLmFwcGVuZFRvKGIub3V0ZXIpLmJpbmQoXCJjbGljay5mYlwiLGIubmV4dCkpLGIudHJpZ2dlcihcImFmdGVyU2hvd1wiKSwhYS5sb29wJiZhLmluZGV4PT09YS5ncm91cC5sZW5ndGgtMT9iLnBsYXkoITEpOmIub3B0cy5hdXRvUGxheSYmIWIucGxheWVyLmlzQWN0aXZlJiYoYi5vcHRzLmF1dG9QbGF5PSExLGIucGxheSgpKSl9LF9hZnRlclpvb21PdXQ6ZnVuY3Rpb24oYSl7YT1cclxuYXx8Yi5jdXJyZW50O2YoXCIuZmFuY3lib3gtd3JhcFwiKS50cmlnZ2VyKFwib25SZXNldFwiKS5yZW1vdmUoKTtmLmV4dGVuZChiLHtncm91cDp7fSxvcHRzOnt9LHJvdXRlcjohMSxjdXJyZW50Om51bGwsaXNBY3RpdmU6ITEsaXNPcGVuZWQ6ITEsaXNPcGVuOiExLGlzQ2xvc2luZzohMSx3cmFwOm51bGwsc2tpbjpudWxsLG91dGVyOm51bGwsaW5uZXI6bnVsbH0pO2IudHJpZ2dlcihcImFmdGVyQ2xvc2VcIixhKX19KTtiLnRyYW5zaXRpb25zPXtnZXRPcmlnUG9zaXRpb246ZnVuY3Rpb24oKXt2YXIgYT1iLmN1cnJlbnQsZD1hLmVsZW1lbnQsZT1hLm9yaWcsYz17fSxmPTUwLGc9NTAsaD1hLmhQYWRkaW5nLGo9YS53UGFkZGluZyxtPWIuZ2V0Vmlld3BvcnQoKTshZSYmKGEuaXNEb20mJmQuaXMoXCI6dmlzaWJsZVwiKSkmJihlPWQuZmluZChcImltZzpmaXJzdFwiKSxlLmxlbmd0aHx8KGU9ZCkpO3QoZSk/KGM9ZS5vZmZzZXQoKSxlLmlzKFwiaW1nXCIpJiYoZj1lLm91dGVyV2lkdGgoKSxnPWUub3V0ZXJIZWlnaHQoKSkpOlxyXG4oYy50b3A9bS55KyhtLmgtZykqYS50b3BSYXRpbyxjLmxlZnQ9bS54KyhtLnctZikqYS5sZWZ0UmF0aW8pO2lmKFwiZml4ZWRcIj09PWIud3JhcC5jc3MoXCJwb3NpdGlvblwiKXx8YS5sb2NrZWQpYy50b3AtPW0ueSxjLmxlZnQtPW0ueDtyZXR1cm4gYz17dG9wOncoYy50b3AtaCphLnRvcFJhdGlvKSxsZWZ0OncoYy5sZWZ0LWoqYS5sZWZ0UmF0aW8pLHdpZHRoOncoZitqKSxoZWlnaHQ6dyhnK2gpfX0sc3RlcDpmdW5jdGlvbihhLGQpe3ZhciBlLGMsZj1kLnByb3A7Yz1iLmN1cnJlbnQ7dmFyIGc9Yy53cmFwU3BhY2UsaD1jLnNraW5TcGFjZTtpZihcIndpZHRoXCI9PT1mfHxcImhlaWdodFwiPT09ZillPWQuZW5kPT09ZC5zdGFydD8xOihhLWQuc3RhcnQpLyhkLmVuZC1kLnN0YXJ0KSxiLmlzQ2xvc2luZyYmKGU9MS1lKSxjPVwid2lkdGhcIj09PWY/Yy53UGFkZGluZzpjLmhQYWRkaW5nLGM9YS1jLGIuc2tpbltmXShsKFwid2lkdGhcIj09PWY/YzpjLWcqZSkpLGIuaW5uZXJbZl0obChcIndpZHRoXCI9PT1cclxuZj9jOmMtZyplLWgqZSkpfSx6b29tSW46ZnVuY3Rpb24oKXt2YXIgYT1iLmN1cnJlbnQsZD1hLnBvcyxlPWEub3BlbkVmZmVjdCxjPVwiZWxhc3RpY1wiPT09ZSxrPWYuZXh0ZW5kKHtvcGFjaXR5OjF9LGQpO2RlbGV0ZSBrLnBvc2l0aW9uO2M/KGQ9dGhpcy5nZXRPcmlnUG9zaXRpb24oKSxhLm9wZW5PcGFjaXR5JiYoZC5vcGFjaXR5PTAuMSkpOlwiZmFkZVwiPT09ZSYmKGQub3BhY2l0eT0wLjEpO2Iud3JhcC5jc3MoZCkuYW5pbWF0ZShrLHtkdXJhdGlvbjpcIm5vbmVcIj09PWU/MDphLm9wZW5TcGVlZCxlYXNpbmc6YS5vcGVuRWFzaW5nLHN0ZXA6Yz90aGlzLnN0ZXA6bnVsbCxjb21wbGV0ZTpiLl9hZnRlclpvb21Jbn0pfSx6b29tT3V0OmZ1bmN0aW9uKCl7dmFyIGE9Yi5jdXJyZW50LGQ9YS5jbG9zZUVmZmVjdCxlPVwiZWxhc3RpY1wiPT09ZCxjPXtvcGFjaXR5OjAuMX07ZSYmKGM9dGhpcy5nZXRPcmlnUG9zaXRpb24oKSxhLmNsb3NlT3BhY2l0eSYmKGMub3BhY2l0eT0wLjEpKTtiLndyYXAuYW5pbWF0ZShjLFxyXG57ZHVyYXRpb246XCJub25lXCI9PT1kPzA6YS5jbG9zZVNwZWVkLGVhc2luZzphLmNsb3NlRWFzaW5nLHN0ZXA6ZT90aGlzLnN0ZXA6bnVsbCxjb21wbGV0ZTpiLl9hZnRlclpvb21PdXR9KX0sY2hhbmdlSW46ZnVuY3Rpb24oKXt2YXIgYT1iLmN1cnJlbnQsZD1hLm5leHRFZmZlY3QsZT1hLnBvcyxjPXtvcGFjaXR5OjF9LGY9Yi5kaXJlY3Rpb24sZztlLm9wYWNpdHk9MC4xO1wiZWxhc3RpY1wiPT09ZCYmKGc9XCJkb3duXCI9PT1mfHxcInVwXCI9PT1mP1widG9wXCI6XCJsZWZ0XCIsXCJkb3duXCI9PT1mfHxcInJpZ2h0XCI9PT1mPyhlW2ddPXcobChlW2ddKS0yMDApLGNbZ109XCIrPTIwMHB4XCIpOihlW2ddPXcobChlW2ddKSsyMDApLGNbZ109XCItPTIwMHB4XCIpKTtcIm5vbmVcIj09PWQ/Yi5fYWZ0ZXJab29tSW4oKTpiLndyYXAuY3NzKGUpLmFuaW1hdGUoYyx7ZHVyYXRpb246YS5uZXh0U3BlZWQsZWFzaW5nOmEubmV4dEVhc2luZyxjb21wbGV0ZTpiLl9hZnRlclpvb21Jbn0pfSxjaGFuZ2VPdXQ6ZnVuY3Rpb24oKXt2YXIgYT1cclxuYi5wcmV2aW91cyxkPWEucHJldkVmZmVjdCxlPXtvcGFjaXR5OjAuMX0sYz1iLmRpcmVjdGlvbjtcImVsYXN0aWNcIj09PWQmJihlW1wiZG93blwiPT09Y3x8XCJ1cFwiPT09Yz9cInRvcFwiOlwibGVmdFwiXT0oXCJ1cFwiPT09Y3x8XCJsZWZ0XCI9PT1jP1wiLVwiOlwiK1wiKStcIj0yMDBweFwiKTthLndyYXAuYW5pbWF0ZShlLHtkdXJhdGlvbjpcIm5vbmVcIj09PWQ/MDphLnByZXZTcGVlZCxlYXNpbmc6YS5wcmV2RWFzaW5nLGNvbXBsZXRlOmZ1bmN0aW9uKCl7Zih0aGlzKS50cmlnZ2VyKFwib25SZXNldFwiKS5yZW1vdmUoKX19KX19O2IuaGVscGVycy5vdmVybGF5PXtkZWZhdWx0czp7Y2xvc2VDbGljazohMCxzcGVlZE91dDoyMDAsc2hvd0Vhcmx5OiEwLGNzczp7fSxsb2NrZWQ6IXMsZml4ZWQ6ITB9LG92ZXJsYXk6bnVsbCxmaXhlZDohMSxlbDpmKFwiaHRtbFwiKSxjcmVhdGU6ZnVuY3Rpb24oYSl7YT1mLmV4dGVuZCh7fSx0aGlzLmRlZmF1bHRzLGEpO3RoaXMub3ZlcmxheSYmdGhpcy5jbG9zZSgpO3RoaXMub3ZlcmxheT1cclxuZignPGRpdiBjbGFzcz1cImZhbmN5Ym94LW92ZXJsYXlcIj48L2Rpdj4nKS5hcHBlbmRUbyhiLmNvbWluZz9iLmNvbWluZy5wYXJlbnQ6YS5wYXJlbnQpO3RoaXMuZml4ZWQ9ITE7YS5maXhlZCYmYi5kZWZhdWx0cy5maXhlZCYmKHRoaXMub3ZlcmxheS5hZGRDbGFzcyhcImZhbmN5Ym94LW92ZXJsYXktZml4ZWRcIiksdGhpcy5maXhlZD0hMCl9LG9wZW46ZnVuY3Rpb24oYSl7dmFyIGQ9dGhpczthPWYuZXh0ZW5kKHt9LHRoaXMuZGVmYXVsdHMsYSk7dGhpcy5vdmVybGF5P3RoaXMub3ZlcmxheS51bmJpbmQoXCIub3ZlcmxheVwiKS53aWR0aChcImF1dG9cIikuaGVpZ2h0KFwiYXV0b1wiKTp0aGlzLmNyZWF0ZShhKTt0aGlzLmZpeGVkfHwobi5iaW5kKFwicmVzaXplLm92ZXJsYXlcIixmLnByb3h5KHRoaXMudXBkYXRlLHRoaXMpKSx0aGlzLnVwZGF0ZSgpKTthLmNsb3NlQ2xpY2smJnRoaXMub3ZlcmxheS5iaW5kKFwiY2xpY2sub3ZlcmxheVwiLGZ1bmN0aW9uKGEpe2lmKGYoYS50YXJnZXQpLmhhc0NsYXNzKFwiZmFuY3lib3gtb3ZlcmxheVwiKSlyZXR1cm4gYi5pc0FjdGl2ZT9cclxuYi5jbG9zZSgpOmQuY2xvc2UoKSwhMX0pO3RoaXMub3ZlcmxheS5jc3MoYS5jc3MpLnNob3coKX0sY2xvc2U6ZnVuY3Rpb24oKXt2YXIgYSxiO24udW5iaW5kKFwicmVzaXplLm92ZXJsYXlcIik7dGhpcy5lbC5oYXNDbGFzcyhcImZhbmN5Ym94LWxvY2tcIikmJihmKFwiLmZhbmN5Ym94LW1hcmdpblwiKS5yZW1vdmVDbGFzcyhcImZhbmN5Ym94LW1hcmdpblwiKSxhPW4uc2Nyb2xsVG9wKCksYj1uLnNjcm9sbExlZnQoKSx0aGlzLmVsLnJlbW92ZUNsYXNzKFwiZmFuY3lib3gtbG9ja1wiKSxuLnNjcm9sbFRvcChhKS5zY3JvbGxMZWZ0KGIpKTtmKFwiLmZhbmN5Ym94LW92ZXJsYXlcIikucmVtb3ZlKCkuaGlkZSgpO2YuZXh0ZW5kKHRoaXMse292ZXJsYXk6bnVsbCxmaXhlZDohMX0pfSx1cGRhdGU6ZnVuY3Rpb24oKXt2YXIgYT1cIjEwMCVcIixiO3RoaXMub3ZlcmxheS53aWR0aChhKS5oZWlnaHQoXCIxMDAlXCIpO0k/KGI9TWF0aC5tYXgoRy5kb2N1bWVudEVsZW1lbnQub2Zmc2V0V2lkdGgsRy5ib2R5Lm9mZnNldFdpZHRoKSxcclxucC53aWR0aCgpPmImJihhPXAud2lkdGgoKSkpOnAud2lkdGgoKT5uLndpZHRoKCkmJihhPXAud2lkdGgoKSk7dGhpcy5vdmVybGF5LndpZHRoKGEpLmhlaWdodChwLmhlaWdodCgpKX0sb25SZWFkeTpmdW5jdGlvbihhLGIpe3ZhciBlPXRoaXMub3ZlcmxheTtmKFwiLmZhbmN5Ym94LW92ZXJsYXlcIikuc3RvcCghMCwhMCk7ZXx8dGhpcy5jcmVhdGUoYSk7YS5sb2NrZWQmJih0aGlzLmZpeGVkJiZiLmZpeGVkKSYmKGV8fCh0aGlzLm1hcmdpbj1wLmhlaWdodCgpPm4uaGVpZ2h0KCk/ZihcImh0bWxcIikuY3NzKFwibWFyZ2luLXJpZ2h0XCIpLnJlcGxhY2UoXCJweFwiLFwiXCIpOiExKSxiLmxvY2tlZD10aGlzLm92ZXJsYXkuYXBwZW5kKGIud3JhcCksYi5maXhlZD0hMSk7ITA9PT1hLnNob3dFYXJseSYmdGhpcy5iZWZvcmVTaG93LmFwcGx5KHRoaXMsYXJndW1lbnRzKX0sYmVmb3JlU2hvdzpmdW5jdGlvbihhLGIpe3ZhciBlLGM7Yi5sb2NrZWQmJighMSE9PXRoaXMubWFyZ2luJiYoZihcIipcIikuZmlsdGVyKGZ1bmN0aW9uKCl7cmV0dXJuXCJmaXhlZFwiPT09XHJcbmYodGhpcykuY3NzKFwicG9zaXRpb25cIikmJiFmKHRoaXMpLmhhc0NsYXNzKFwiZmFuY3lib3gtb3ZlcmxheVwiKSYmIWYodGhpcykuaGFzQ2xhc3MoXCJmYW5jeWJveC13cmFwXCIpfSkuYWRkQ2xhc3MoXCJmYW5jeWJveC1tYXJnaW5cIiksdGhpcy5lbC5hZGRDbGFzcyhcImZhbmN5Ym94LW1hcmdpblwiKSksZT1uLnNjcm9sbFRvcCgpLGM9bi5zY3JvbGxMZWZ0KCksdGhpcy5lbC5hZGRDbGFzcyhcImZhbmN5Ym94LWxvY2tcIiksbi5zY3JvbGxUb3AoZSkuc2Nyb2xsTGVmdChjKSk7dGhpcy5vcGVuKGEpfSxvblVwZGF0ZTpmdW5jdGlvbigpe3RoaXMuZml4ZWR8fHRoaXMudXBkYXRlKCl9LGFmdGVyQ2xvc2U6ZnVuY3Rpb24oYSl7dGhpcy5vdmVybGF5JiYhYi5jb21pbmcmJnRoaXMub3ZlcmxheS5mYWRlT3V0KGEuc3BlZWRPdXQsZi5wcm94eSh0aGlzLmNsb3NlLHRoaXMpKX19O2IuaGVscGVycy50aXRsZT17ZGVmYXVsdHM6e3R5cGU6XCJmbG9hdFwiLHBvc2l0aW9uOlwiYm90dG9tXCJ9LGJlZm9yZVNob3c6ZnVuY3Rpb24oYSl7dmFyIGQ9XHJcbmIuY3VycmVudCxlPWQudGl0bGUsYz1hLnR5cGU7Zi5pc0Z1bmN0aW9uKGUpJiYoZT1lLmNhbGwoZC5lbGVtZW50LGQpKTtpZihxKGUpJiZcIlwiIT09Zi50cmltKGUpKXtkPWYoJzxkaXYgY2xhc3M9XCJmYW5jeWJveC10aXRsZSBmYW5jeWJveC10aXRsZS0nK2MrJy13cmFwXCI+JytlK1wiPC9kaXY+XCIpO3N3aXRjaChjKXtjYXNlIFwiaW5zaWRlXCI6Yz1iLnNraW47YnJlYWs7Y2FzZSBcIm91dHNpZGVcIjpjPWIud3JhcDticmVhaztjYXNlIFwib3ZlclwiOmM9Yi5pbm5lcjticmVhaztkZWZhdWx0OmM9Yi5za2luLGQuYXBwZW5kVG8oXCJib2R5XCIpLEkmJmQud2lkdGgoZC53aWR0aCgpKSxkLndyYXBJbm5lcignPHNwYW4gY2xhc3M9XCJjaGlsZFwiPjwvc3Bhbj4nKSxiLmN1cnJlbnQubWFyZ2luWzJdKz1NYXRoLmFicyhsKGQuY3NzKFwibWFyZ2luLWJvdHRvbVwiKSkpfWRbXCJ0b3BcIj09PWEucG9zaXRpb24/XCJwcmVwZW5kVG9cIjpcImFwcGVuZFRvXCJdKGMpfX19O2YuZm4uZmFuY3lib3g9ZnVuY3Rpb24oYSl7dmFyIGQsXHJcbmU9Zih0aGlzKSxjPXRoaXMuc2VsZWN0b3J8fFwiXCIsaz1mdW5jdGlvbihnKXt2YXIgaD1mKHRoaXMpLmJsdXIoKSxqPWQsayxsOyFnLmN0cmxLZXkmJighZy5hbHRLZXkmJiFnLnNoaWZ0S2V5JiYhZy5tZXRhS2V5KSYmIWguaXMoXCIuZmFuY3lib3gtd3JhcFwiKSYmKGs9YS5ncm91cEF0dHJ8fFwiZGF0YS1mYW5jeWJveC1ncm91cFwiLGw9aC5hdHRyKGspLGx8fChrPVwicmVsXCIsbD1oLmdldCgwKVtrXSksbCYmKFwiXCIhPT1sJiZcIm5vZm9sbG93XCIhPT1sKSYmKGg9Yy5sZW5ndGg/ZihjKTplLGg9aC5maWx0ZXIoXCJbXCIraysnPVwiJytsKydcIl0nKSxqPWguaW5kZXgodGhpcykpLGEuaW5kZXg9aiwhMSE9PWIub3BlbihoLGEpJiZnLnByZXZlbnREZWZhdWx0KCkpfTthPWF8fHt9O2Q9YS5pbmRleHx8MDshY3x8ITE9PT1hLmxpdmU/ZS51bmJpbmQoXCJjbGljay5mYi1zdGFydFwiKS5iaW5kKFwiY2xpY2suZmItc3RhcnRcIixrKTpwLnVuZGVsZWdhdGUoYyxcImNsaWNrLmZiLXN0YXJ0XCIpLmRlbGVnYXRlKGMrXHJcblwiOm5vdCgnLmZhbmN5Ym94LWl0ZW0sIC5mYW5jeWJveC1uYXYnKVwiLFwiY2xpY2suZmItc3RhcnRcIixrKTt0aGlzLmZpbHRlcihcIltkYXRhLWZhbmN5Ym94LXN0YXJ0PTFdXCIpLnRyaWdnZXIoXCJjbGlja1wiKTtyZXR1cm4gdGhpc307cC5yZWFkeShmdW5jdGlvbigpe3ZhciBhLGQ7Zi5zY3JvbGxiYXJXaWR0aD09PXYmJihmLnNjcm9sbGJhcldpZHRoPWZ1bmN0aW9uKCl7dmFyIGE9ZignPGRpdiBzdHlsZT1cIndpZHRoOjUwcHg7aGVpZ2h0OjUwcHg7b3ZlcmZsb3c6YXV0b1wiPjxkaXYvPjwvZGl2PicpLmFwcGVuZFRvKFwiYm9keVwiKSxiPWEuY2hpbGRyZW4oKSxiPWIuaW5uZXJXaWR0aCgpLWIuaGVpZ2h0KDk5KS5pbm5lcldpZHRoKCk7YS5yZW1vdmUoKTtyZXR1cm4gYn0pO2lmKGYuc3VwcG9ydC5maXhlZFBvc2l0aW9uPT09dil7YT1mLnN1cHBvcnQ7ZD1mKCc8ZGl2IHN0eWxlPVwicG9zaXRpb246Zml4ZWQ7dG9wOjIwcHg7XCI+PC9kaXY+JykuYXBwZW5kVG8oXCJib2R5XCIpO3ZhciBlPTIwPT09XHJcbmRbMF0ub2Zmc2V0VG9wfHwxNT09PWRbMF0ub2Zmc2V0VG9wO2QucmVtb3ZlKCk7YS5maXhlZFBvc2l0aW9uPWV9Zi5leHRlbmQoYi5kZWZhdWx0cyx7c2Nyb2xsYmFyV2lkdGg6Zi5zY3JvbGxiYXJXaWR0aCgpLGZpeGVkOmYuc3VwcG9ydC5maXhlZFBvc2l0aW9uLHBhcmVudDpmKFwiYm9keVwiKX0pO2E9ZihyKS53aWR0aCgpO0ouYWRkQ2xhc3MoXCJmYW5jeWJveC1sb2NrLXRlc3RcIik7ZD1mKHIpLndpZHRoKCk7Si5yZW1vdmVDbGFzcyhcImZhbmN5Ym94LWxvY2stdGVzdFwiKTtmKFwiPHN0eWxlIHR5cGU9J3RleHQvY3NzJz4uZmFuY3lib3gtbWFyZ2lue21hcmdpbi1yaWdodDpcIisoZC1hKStcInB4O308L3N0eWxlPlwiKS5hcHBlbmRUbyhcImhlYWRcIil9KX0pKHdpbmRvdyxkb2N1bWVudCxqUXVlcnkpOyIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgJChcImlmcmFtZVtzcmMqPWluc2lnaXRdXCIpLmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xyXG5cclxuICAgIC8qKioqKioqKioqKioqKioqKiBXYXlwb2ludHMgKioqKioqKioqKioqKioqKioqL1xyXG4gICAgJCgnLndwMScpLndheXBvaW50KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoJy53cDEnKS5hZGRDbGFzcygnYW5pbWF0ZWQgZmFkZUluVXAnKTtcclxuICAgIH0sIHtcclxuICAgICAgICBvZmZzZXQ6ICc3NSUnXHJcbiAgICB9KTtcclxuICAgICQoJy53cDInKS53YXlwb2ludChmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcud3AyJykuYWRkQ2xhc3MoJ2FuaW1hdGVkIGZhZGVJblVwJyk7XHJcbiAgICB9LCB7XHJcbiAgICAgICAgb2Zmc2V0OiAnNzUlJ1xyXG4gICAgfSk7XHJcbiAgICAkKCcud3AzJykud2F5cG9pbnQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnLndwMycpLmFkZENsYXNzKCdhbmltYXRlZCBmYWRlSW5SaWdodCcpO1xyXG4gICAgfSwge1xyXG4gICAgICAgIG9mZnNldDogJzc1JSdcclxuICAgIH0pO1xyXG4gICAgJCgnLndwNCcpLndheXBvaW50KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoJy53cDQnKS5hZGRDbGFzcygnYW5pbWF0ZWQgZmFkZUluVXAnKTtcclxuICAgIH0sIHtcclxuICAgICAgICBvZmZzZXQ6ICc5NSUnXHJcbiAgICB9KTtcclxuICAgICQoJy53cDUnKS53YXlwb2ludChmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcud3A1JykuYWRkQ2xhc3MoJ2FuaW1hdGVkIGZhZGVJblVwJyk7XHJcbiAgICB9LCB7XHJcbiAgICAgICAgb2Zmc2V0OiAnOTMlJ1xyXG4gICAgfSk7XHJcbiAgICAkKCcud3A2Jykud2F5cG9pbnQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnLndwNicpLmFkZENsYXNzKCdhbmltYXRlZCBmYWRlSW5VcCcpO1xyXG4gICAgfSwge1xyXG4gICAgICAgIG9mZnNldDogJzkwJSdcclxuICAgIH0pO1xyXG5cclxuICAgIC8qKioqKioqKioqKioqKioqKiBJbml0aWF0ZSBGbGV4c2xpZGVyICoqKioqKioqKioqKioqKioqKi9cclxuICAgICQoJy5mbGV4c2xpZGVyJykuZmxleHNsaWRlcih7XHJcbiAgICAgICAgYW5pbWF0aW9uOiBcInNsaWRlXCIsXHJcbiAgICAgICAgc2xpZGVzaG93U3BlZWQ6IDEwMDAwLFxyXG4gICAgICAgIGFuaW1hdGlvbkR1cmF0aW9uOiA0MDAsXHJcbiAgICAgICAgcGF1c2VPbkhvdmVyOiB0cnVlXHJcbiAgICB9KTtcclxuXHJcbiAgICAvKioqKioqKioqKioqKioqKiogSW5pdGlhdGUgRmFuY3lib3ggKioqKioqKioqKioqKioqKioqL1xyXG4gICAgJCgnLnNpbmdsZV9pbWFnZScpLmZhbmN5Ym94KHtcclxuICAgICAgICBwYWRkaW5nOiA0LFxyXG4gICAgfSk7XHJcblxyXG4gICAgLyoqKioqKioqKioqKioqKioqIFRvb2x0aXBzICoqKioqKioqKioqKioqKioqKi9cclxuICAgIC8vJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuXHJcbiAgICAvKioqKioqKioqKioqKioqKiogTmF2IFRyYW5zZm9ybWljb24gKioqKioqKioqKioqKioqKioqL1xyXG4gICAgLyogV2hlbiB1c2VyIGNsaWNrcyB0aGUgSWNvbiAqL1xyXG4gICAgJCgnLm5hdi10b2dnbGUnKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAkKCcuaGVhZGVyLW5hdicpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH0pO1xyXG4gICAgLyogV2hlbiB1c2VyIGNsaWNrcyBhIGxpbmsgKi9cclxuICAgICQoJy5oZWFkZXItbmF2IGxpIGEnKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcubmF2LXRvZ2dsZScpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAkKCcuaGVhZGVyLW5hdicpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvKioqKioqKioqKioqKioqKiogSGVhZGVyIEJHIFNjcm9sbCAqKioqKioqKioqKioqKioqKiovXHJcbiAgICAkKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzY3JvbGwgPSB7XHJcbiAgICAgICAgICAgIGNvbnRyb2w6IHtcclxuICAgICAgICAgICAgICAgIGZpeGVkczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnc2VjdGlvbi5uYXZpZ2F0aW9uJykuYWRkQ2xhc3MoJ2ZpeGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnc2VjdGlvbi5uYXZpZ2F0aW9uJykucmVtb3ZlQ2xhc3MoJ25vdC1maXhlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJ2hlYWRlcicpLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYm9yZGVyLWJvdHRvbVwiOiBcInNvbGlkIDFweCByZ2JhKDI1NSwgMjU1LCAyNTUsIDApXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicGFkZGluZ1wiOiBcIjEwcHggMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnaGVhZGVyIC5tZW1iZXItYWN0aW9ucycpLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidG9wXCI6IFwiMTdweFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJ2hlYWRlciAubmF2aWNvbicpLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidG9wXCI6IFwiMjNweFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG5vdGZpeGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCdzZWN0aW9uLm5hdmlnYXRpb24nKS5yZW1vdmVDbGFzcygnZml4ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAkKCdzZWN0aW9uLm5hdmlnYXRpb24nKS5hZGRDbGFzcygnbm90LWZpeGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnaGVhZGVyJykuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJib3JkZXItYm90dG9tXCI6IFwic29saWQgMXB4IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInBhZGRpbmdcIjogXCIxMHB4IDBcIlxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJ2hlYWRlciAubWVtYmVyLWFjdGlvbnMnKS5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRvcFwiOiBcIjE3cHhcIixcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAkKCdoZWFkZXIgLm5hdmljb24nKS5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRvcFwiOiBcIjIzcHhcIixcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBpbml0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2Nyb2xsID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2Nyb2xsID49IDIwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZml4ZWRzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub3RmaXhlZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gICBcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBldmVudHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmluaXQoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJCh3aW5kb3cpLnNjcm9sbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5pbml0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNjcm9sbC5jb250cm9sLmV2ZW50cygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLyoqKioqKioqKioqKioqKioqIFNtb290aCBTY3JvbGxpbmcgKioqKioqKioqKioqKioqKioqL1xyXG4gICAgJChmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCdhW2hyZWYqPSNdOm5vdChbaHJlZj0jXSknKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKGxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoL15cXC8vLCAnJykgPT09IHRoaXMucGF0aG5hbWUucmVwbGFjZSgvXlxcLy8sICcnKSAmJiBsb2NhdGlvbi5ob3N0bmFtZSA9PT0gdGhpcy5ob3N0bmFtZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRhcmdldCA9ICQodGhpcy5oYXNoKTtcclxuICAgICAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5sZW5ndGggPyB0YXJnZXQgOiAkKCdbbmFtZT0nICsgdGhpcy5oYXNoLnNsaWNlKDEpICsgJ10nKTtcclxuICAgICAgICAgICAgICAgIGlmICh0YXJnZXQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnaHRtbCxib2R5JykuYW5pbWF0ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbFRvcDogdGFyZ2V0Lm9mZnNldCgpLnRvcCAtICQoJy5uYXZpZ2F0aW9uJykuaGVpZ2h0KClcclxuICAgICAgICAgICAgICAgICAgICB9LCAxMDAwKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59KTsiLCIvKlxyXG4gKiBqUXVlcnkgRmxleFNsaWRlciB2Mi41LjBcclxuICogQ29weXJpZ2h0IDIwMTIgV29vVGhlbWVzXHJcbiAqIENvbnRyaWJ1dGluZyBBdXRob3I6IFR5bGVyIFNtaXRoXHJcbiAqLyFmdW5jdGlvbigkKXskLmZsZXhzbGlkZXI9ZnVuY3Rpb24oZSx0KXt2YXIgYT0kKGUpO2EudmFycz0kLmV4dGVuZCh7fSwkLmZsZXhzbGlkZXIuZGVmYXVsdHMsdCk7dmFyIG49YS52YXJzLm5hbWVzcGFjZSxpPXdpbmRvdy5uYXZpZ2F0b3ImJndpbmRvdy5uYXZpZ2F0b3IubXNQb2ludGVyRW5hYmxlZCYmd2luZG93Lk1TR2VzdHVyZSxzPShcIm9udG91Y2hzdGFydFwiaW4gd2luZG93fHxpfHx3aW5kb3cuRG9jdW1lbnRUb3VjaCYmZG9jdW1lbnQgaW5zdGFuY2VvZiBEb2N1bWVudFRvdWNoKSYmYS52YXJzLnRvdWNoLHI9XCJjbGljayB0b3VjaGVuZCBNU1BvaW50ZXJVcCBrZXl1cFwiLG89XCJcIixsLGM9XCJ2ZXJ0aWNhbFwiPT09YS52YXJzLmRpcmVjdGlvbixkPWEudmFycy5yZXZlcnNlLHU9YS52YXJzLml0ZW1XaWR0aD4wLHY9XCJmYWRlXCI9PT1hLnZhcnMuYW5pbWF0aW9uLHA9XCJcIiE9PWEudmFycy5hc05hdkZvcixtPXt9LGY9ITA7JC5kYXRhKGUsXCJmbGV4c2xpZGVyXCIsYSksbT17aW5pdDpmdW5jdGlvbigpe2EuYW5pbWF0aW5nPSExLGEuY3VycmVudFNsaWRlPXBhcnNlSW50KGEudmFycy5zdGFydEF0P2EudmFycy5zdGFydEF0OjAsMTApLGlzTmFOKGEuY3VycmVudFNsaWRlKSYmKGEuY3VycmVudFNsaWRlPTApLGEuYW5pbWF0aW5nVG89YS5jdXJyZW50U2xpZGUsYS5hdEVuZD0wPT09YS5jdXJyZW50U2xpZGV8fGEuY3VycmVudFNsaWRlPT09YS5sYXN0LGEuY29udGFpbmVyU2VsZWN0b3I9YS52YXJzLnNlbGVjdG9yLnN1YnN0cigwLGEudmFycy5zZWxlY3Rvci5zZWFyY2goXCIgXCIpKSxhLnNsaWRlcz0kKGEudmFycy5zZWxlY3RvcixhKSxhLmNvbnRhaW5lcj0kKGEuY29udGFpbmVyU2VsZWN0b3IsYSksYS5jb3VudD1hLnNsaWRlcy5sZW5ndGgsYS5zeW5jRXhpc3RzPSQoYS52YXJzLnN5bmMpLmxlbmd0aD4wLFwic2xpZGVcIj09PWEudmFycy5hbmltYXRpb24mJihhLnZhcnMuYW5pbWF0aW9uPVwic3dpbmdcIiksYS5wcm9wPWM/XCJ0b3BcIjpcIm1hcmdpbkxlZnRcIixhLmFyZ3M9e30sYS5tYW51YWxQYXVzZT0hMSxhLnN0b3BwZWQ9ITEsYS5zdGFydGVkPSExLGEuc3RhcnRUaW1lb3V0PW51bGwsYS50cmFuc2l0aW9ucz0hYS52YXJzLnZpZGVvJiYhdiYmYS52YXJzLnVzZUNTUyYmZnVuY3Rpb24oKXt2YXIgZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLHQ9W1wicGVyc3BlY3RpdmVQcm9wZXJ0eVwiLFwiV2Via2l0UGVyc3BlY3RpdmVcIixcIk1velBlcnNwZWN0aXZlXCIsXCJPUGVyc3BlY3RpdmVcIixcIm1zUGVyc3BlY3RpdmVcIl07Zm9yKHZhciBuIGluIHQpaWYodm9pZCAwIT09ZS5zdHlsZVt0W25dXSlyZXR1cm4gYS5wZng9dFtuXS5yZXBsYWNlKFwiUGVyc3BlY3RpdmVcIixcIlwiKS50b0xvd2VyQ2FzZSgpLGEucHJvcD1cIi1cIithLnBmeCtcIi10cmFuc2Zvcm1cIiwhMDtyZXR1cm4hMX0oKSxhLmVuc3VyZUFuaW1hdGlvbkVuZD1cIlwiLFwiXCIhPT1hLnZhcnMuY29udHJvbHNDb250YWluZXImJihhLmNvbnRyb2xzQ29udGFpbmVyPSQoYS52YXJzLmNvbnRyb2xzQ29udGFpbmVyKS5sZW5ndGg+MCYmJChhLnZhcnMuY29udHJvbHNDb250YWluZXIpKSxcIlwiIT09YS52YXJzLm1hbnVhbENvbnRyb2xzJiYoYS5tYW51YWxDb250cm9scz0kKGEudmFycy5tYW51YWxDb250cm9scykubGVuZ3RoPjAmJiQoYS52YXJzLm1hbnVhbENvbnRyb2xzKSksXCJcIiE9PWEudmFycy5jdXN0b21EaXJlY3Rpb25OYXYmJihhLmN1c3RvbURpcmVjdGlvbk5hdj0yPT09JChhLnZhcnMuY3VzdG9tRGlyZWN0aW9uTmF2KS5sZW5ndGgmJiQoYS52YXJzLmN1c3RvbURpcmVjdGlvbk5hdikpLGEudmFycy5yYW5kb21pemUmJihhLnNsaWRlcy5zb3J0KGZ1bmN0aW9uKCl7cmV0dXJuIE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSktLjV9KSxhLmNvbnRhaW5lci5lbXB0eSgpLmFwcGVuZChhLnNsaWRlcykpLGEuZG9NYXRoKCksYS5zZXR1cChcImluaXRcIiksYS52YXJzLmNvbnRyb2xOYXYmJm0uY29udHJvbE5hdi5zZXR1cCgpLGEudmFycy5kaXJlY3Rpb25OYXYmJm0uZGlyZWN0aW9uTmF2LnNldHVwKCksYS52YXJzLmtleWJvYXJkJiYoMT09PSQoYS5jb250YWluZXJTZWxlY3RvcikubGVuZ3RofHxhLnZhcnMubXVsdGlwbGVLZXlib2FyZCkmJiQoZG9jdW1lbnQpLmJpbmQoXCJrZXl1cFwiLGZ1bmN0aW9uKGUpe3ZhciB0PWUua2V5Q29kZTtpZighYS5hbmltYXRpbmcmJigzOT09PXR8fDM3PT09dCkpe3ZhciBuPTM5PT09dD9hLmdldFRhcmdldChcIm5leHRcIik6Mzc9PT10P2EuZ2V0VGFyZ2V0KFwicHJldlwiKTohMTthLmZsZXhBbmltYXRlKG4sYS52YXJzLnBhdXNlT25BY3Rpb24pfX0pLGEudmFycy5tb3VzZXdoZWVsJiZhLmJpbmQoXCJtb3VzZXdoZWVsXCIsZnVuY3Rpb24oZSx0LG4saSl7ZS5wcmV2ZW50RGVmYXVsdCgpO3ZhciBzPWEuZ2V0VGFyZ2V0KDA+dD9cIm5leHRcIjpcInByZXZcIik7YS5mbGV4QW5pbWF0ZShzLGEudmFycy5wYXVzZU9uQWN0aW9uKX0pLGEudmFycy5wYXVzZVBsYXkmJm0ucGF1c2VQbGF5LnNldHVwKCksYS52YXJzLnNsaWRlc2hvdyYmYS52YXJzLnBhdXNlSW52aXNpYmxlJiZtLnBhdXNlSW52aXNpYmxlLmluaXQoKSxhLnZhcnMuc2xpZGVzaG93JiYoYS52YXJzLnBhdXNlT25Ib3ZlciYmYS5ob3ZlcihmdW5jdGlvbigpe2EubWFudWFsUGxheXx8YS5tYW51YWxQYXVzZXx8YS5wYXVzZSgpfSxmdW5jdGlvbigpe2EubWFudWFsUGF1c2V8fGEubWFudWFsUGxheXx8YS5zdG9wcGVkfHxhLnBsYXkoKX0pLGEudmFycy5wYXVzZUludmlzaWJsZSYmbS5wYXVzZUludmlzaWJsZS5pc0hpZGRlbigpfHwoYS52YXJzLmluaXREZWxheT4wP2Euc3RhcnRUaW1lb3V0PXNldFRpbWVvdXQoYS5wbGF5LGEudmFycy5pbml0RGVsYXkpOmEucGxheSgpKSkscCYmbS5hc05hdi5zZXR1cCgpLHMmJmEudmFycy50b3VjaCYmbS50b3VjaCgpLCghdnx8diYmYS52YXJzLnNtb290aEhlaWdodCkmJiQod2luZG93KS5iaW5kKFwicmVzaXplIG9yaWVudGF0aW9uY2hhbmdlIGZvY3VzXCIsbS5yZXNpemUpLGEuZmluZChcImltZ1wiKS5hdHRyKFwiZHJhZ2dhYmxlXCIsXCJmYWxzZVwiKSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7YS52YXJzLnN0YXJ0KGEpfSwyMDApfSxhc05hdjp7c2V0dXA6ZnVuY3Rpb24oKXthLmFzTmF2PSEwLGEuYW5pbWF0aW5nVG89TWF0aC5mbG9vcihhLmN1cnJlbnRTbGlkZS9hLm1vdmUpLGEuY3VycmVudEl0ZW09YS5jdXJyZW50U2xpZGUsYS5zbGlkZXMucmVtb3ZlQ2xhc3MobitcImFjdGl2ZS1zbGlkZVwiKS5lcShhLmN1cnJlbnRJdGVtKS5hZGRDbGFzcyhuK1wiYWN0aXZlLXNsaWRlXCIpLGk/KGUuX3NsaWRlcj1hLGEuc2xpZGVzLmVhY2goZnVuY3Rpb24oKXt2YXIgZT10aGlzO2UuX2dlc3R1cmU9bmV3IE1TR2VzdHVyZSxlLl9nZXN0dXJlLnRhcmdldD1lLGUuYWRkRXZlbnRMaXN0ZW5lcihcIk1TUG9pbnRlckRvd25cIixmdW5jdGlvbihlKXtlLnByZXZlbnREZWZhdWx0KCksZS5jdXJyZW50VGFyZ2V0Ll9nZXN0dXJlJiZlLmN1cnJlbnRUYXJnZXQuX2dlc3R1cmUuYWRkUG9pbnRlcihlLnBvaW50ZXJJZCl9LCExKSxlLmFkZEV2ZW50TGlzdGVuZXIoXCJNU0dlc3R1cmVUYXBcIixmdW5jdGlvbihlKXtlLnByZXZlbnREZWZhdWx0KCk7dmFyIHQ9JCh0aGlzKSxuPXQuaW5kZXgoKTskKGEudmFycy5hc05hdkZvcikuZGF0YShcImZsZXhzbGlkZXJcIikuYW5pbWF0aW5nfHx0Lmhhc0NsYXNzKFwiYWN0aXZlXCIpfHwoYS5kaXJlY3Rpb249YS5jdXJyZW50SXRlbTxuP1wibmV4dFwiOlwicHJldlwiLGEuZmxleEFuaW1hdGUobixhLnZhcnMucGF1c2VPbkFjdGlvbiwhMSwhMCwhMCkpfSl9KSk6YS5zbGlkZXMub24ocixmdW5jdGlvbihlKXtlLnByZXZlbnREZWZhdWx0KCk7dmFyIHQ9JCh0aGlzKSxpPXQuaW5kZXgoKSxzPXQub2Zmc2V0KCkubGVmdC0kKGEpLnNjcm9sbExlZnQoKTswPj1zJiZ0Lmhhc0NsYXNzKG4rXCJhY3RpdmUtc2xpZGVcIik/YS5mbGV4QW5pbWF0ZShhLmdldFRhcmdldChcInByZXZcIiksITApOiQoYS52YXJzLmFzTmF2Rm9yKS5kYXRhKFwiZmxleHNsaWRlclwiKS5hbmltYXRpbmd8fHQuaGFzQ2xhc3MobitcImFjdGl2ZS1zbGlkZVwiKXx8KGEuZGlyZWN0aW9uPWEuY3VycmVudEl0ZW08aT9cIm5leHRcIjpcInByZXZcIixhLmZsZXhBbmltYXRlKGksYS52YXJzLnBhdXNlT25BY3Rpb24sITEsITAsITApKX0pfX0sY29udHJvbE5hdjp7c2V0dXA6ZnVuY3Rpb24oKXthLm1hbnVhbENvbnRyb2xzP20uY29udHJvbE5hdi5zZXR1cE1hbnVhbCgpOm0uY29udHJvbE5hdi5zZXR1cFBhZ2luZygpfSxzZXR1cFBhZ2luZzpmdW5jdGlvbigpe3ZhciBlPVwidGh1bWJuYWlsc1wiPT09YS52YXJzLmNvbnRyb2xOYXY/XCJjb250cm9sLXRodW1ic1wiOlwiY29udHJvbC1wYWdpbmdcIix0PTEsaSxzO2lmKGEuY29udHJvbE5hdlNjYWZmb2xkPSQoJzxvbCBjbGFzcz1cIicrbitcImNvbnRyb2wtbmF2IFwiK24rZSsnXCI+PC9vbD4nKSxhLnBhZ2luZ0NvdW50PjEpZm9yKHZhciBsPTA7bDxhLnBhZ2luZ0NvdW50O2wrKyl7aWYocz1hLnNsaWRlcy5lcShsKSxpPVwidGh1bWJuYWlsc1wiPT09YS52YXJzLmNvbnRyb2xOYXY/JzxpbWcgc3JjPVwiJytzLmF0dHIoXCJkYXRhLXRodW1iXCIpKydcIi8+JzpcIjxhPlwiK3QrXCI8L2E+XCIsXCJ0aHVtYm5haWxzXCI9PT1hLnZhcnMuY29udHJvbE5hdiYmITA9PT1hLnZhcnMudGh1bWJDYXB0aW9ucyl7dmFyIGM9cy5hdHRyKFwiZGF0YS10aHVtYmNhcHRpb25cIik7XCJcIiE9PWMmJnZvaWQgMCE9PWMmJihpKz0nPHNwYW4gY2xhc3M9XCInK24rJ2NhcHRpb25cIj4nK2MrXCI8L3NwYW4+XCIpfWEuY29udHJvbE5hdlNjYWZmb2xkLmFwcGVuZChcIjxsaT5cIitpK1wiPC9saT5cIiksdCsrfWEuY29udHJvbHNDb250YWluZXI/JChhLmNvbnRyb2xzQ29udGFpbmVyKS5hcHBlbmQoYS5jb250cm9sTmF2U2NhZmZvbGQpOmEuYXBwZW5kKGEuY29udHJvbE5hdlNjYWZmb2xkKSxtLmNvbnRyb2xOYXYuc2V0KCksbS5jb250cm9sTmF2LmFjdGl2ZSgpLGEuY29udHJvbE5hdlNjYWZmb2xkLmRlbGVnYXRlKFwiYSwgaW1nXCIscixmdW5jdGlvbihlKXtpZihlLnByZXZlbnREZWZhdWx0KCksXCJcIj09PW98fG89PT1lLnR5cGUpe3ZhciB0PSQodGhpcyksaT1hLmNvbnRyb2xOYXYuaW5kZXgodCk7dC5oYXNDbGFzcyhuK1wiYWN0aXZlXCIpfHwoYS5kaXJlY3Rpb249aT5hLmN1cnJlbnRTbGlkZT9cIm5leHRcIjpcInByZXZcIixhLmZsZXhBbmltYXRlKGksYS52YXJzLnBhdXNlT25BY3Rpb24pKX1cIlwiPT09byYmKG89ZS50eXBlKSxtLnNldFRvQ2xlYXJXYXRjaGVkRXZlbnQoKX0pfSxzZXR1cE1hbnVhbDpmdW5jdGlvbigpe2EuY29udHJvbE5hdj1hLm1hbnVhbENvbnRyb2xzLG0uY29udHJvbE5hdi5hY3RpdmUoKSxhLmNvbnRyb2xOYXYuYmluZChyLGZ1bmN0aW9uKGUpe2lmKGUucHJldmVudERlZmF1bHQoKSxcIlwiPT09b3x8bz09PWUudHlwZSl7dmFyIHQ9JCh0aGlzKSxpPWEuY29udHJvbE5hdi5pbmRleCh0KTt0Lmhhc0NsYXNzKG4rXCJhY3RpdmVcIil8fChhLmRpcmVjdGlvbj1pPmEuY3VycmVudFNsaWRlP1wibmV4dFwiOlwicHJldlwiLGEuZmxleEFuaW1hdGUoaSxhLnZhcnMucGF1c2VPbkFjdGlvbikpfVwiXCI9PT1vJiYobz1lLnR5cGUpLG0uc2V0VG9DbGVhcldhdGNoZWRFdmVudCgpfSl9LHNldDpmdW5jdGlvbigpe3ZhciBlPVwidGh1bWJuYWlsc1wiPT09YS52YXJzLmNvbnRyb2xOYXY/XCJpbWdcIjpcImFcIjthLmNvbnRyb2xOYXY9JChcIi5cIituK1wiY29udHJvbC1uYXYgbGkgXCIrZSxhLmNvbnRyb2xzQ29udGFpbmVyP2EuY29udHJvbHNDb250YWluZXI6YSl9LGFjdGl2ZTpmdW5jdGlvbigpe2EuY29udHJvbE5hdi5yZW1vdmVDbGFzcyhuK1wiYWN0aXZlXCIpLmVxKGEuYW5pbWF0aW5nVG8pLmFkZENsYXNzKG4rXCJhY3RpdmVcIil9LHVwZGF0ZTpmdW5jdGlvbihlLHQpe2EucGFnaW5nQ291bnQ+MSYmXCJhZGRcIj09PWU/YS5jb250cm9sTmF2U2NhZmZvbGQuYXBwZW5kKCQoXCI8bGk+PGE+XCIrYS5jb3VudCtcIjwvYT48L2xpPlwiKSk6MT09PWEucGFnaW5nQ291bnQ/YS5jb250cm9sTmF2U2NhZmZvbGQuZmluZChcImxpXCIpLnJlbW92ZSgpOmEuY29udHJvbE5hdi5lcSh0KS5jbG9zZXN0KFwibGlcIikucmVtb3ZlKCksbS5jb250cm9sTmF2LnNldCgpLGEucGFnaW5nQ291bnQ+MSYmYS5wYWdpbmdDb3VudCE9PWEuY29udHJvbE5hdi5sZW5ndGg/YS51cGRhdGUodCxlKTptLmNvbnRyb2xOYXYuYWN0aXZlKCl9fSxkaXJlY3Rpb25OYXY6e3NldHVwOmZ1bmN0aW9uKCl7dmFyIGU9JCgnPHVsIGNsYXNzPVwiJytuKydkaXJlY3Rpb24tbmF2XCI+PGxpIGNsYXNzPVwiJytuKyduYXYtcHJldlwiPjxhIGNsYXNzPVwiJytuKydwcmV2XCIgaHJlZj1cIiNcIj4nK2EudmFycy5wcmV2VGV4dCsnPC9hPjwvbGk+PGxpIGNsYXNzPVwiJytuKyduYXYtbmV4dFwiPjxhIGNsYXNzPVwiJytuKyduZXh0XCIgaHJlZj1cIiNcIj4nK2EudmFycy5uZXh0VGV4dCtcIjwvYT48L2xpPjwvdWw+XCIpO2EuY3VzdG9tRGlyZWN0aW9uTmF2P2EuZGlyZWN0aW9uTmF2PWEuY3VzdG9tRGlyZWN0aW9uTmF2OmEuY29udHJvbHNDb250YWluZXI/KCQoYS5jb250cm9sc0NvbnRhaW5lcikuYXBwZW5kKGUpLGEuZGlyZWN0aW9uTmF2PSQoXCIuXCIrbitcImRpcmVjdGlvbi1uYXYgbGkgYVwiLGEuY29udHJvbHNDb250YWluZXIpKTooYS5hcHBlbmQoZSksYS5kaXJlY3Rpb25OYXY9JChcIi5cIituK1wiZGlyZWN0aW9uLW5hdiBsaSBhXCIsYSkpLG0uZGlyZWN0aW9uTmF2LnVwZGF0ZSgpLGEuZGlyZWN0aW9uTmF2LmJpbmQocixmdW5jdGlvbihlKXtlLnByZXZlbnREZWZhdWx0KCk7dmFyIHQ7KFwiXCI9PT1vfHxvPT09ZS50eXBlKSYmKHQ9YS5nZXRUYXJnZXQoJCh0aGlzKS5oYXNDbGFzcyhuK1wibmV4dFwiKT9cIm5leHRcIjpcInByZXZcIiksYS5mbGV4QW5pbWF0ZSh0LGEudmFycy5wYXVzZU9uQWN0aW9uKSksXCJcIj09PW8mJihvPWUudHlwZSksbS5zZXRUb0NsZWFyV2F0Y2hlZEV2ZW50KCl9KX0sdXBkYXRlOmZ1bmN0aW9uKCl7dmFyIGU9bitcImRpc2FibGVkXCI7MT09PWEucGFnaW5nQ291bnQ/YS5kaXJlY3Rpb25OYXYuYWRkQ2xhc3MoZSkuYXR0cihcInRhYmluZGV4XCIsXCItMVwiKTphLnZhcnMuYW5pbWF0aW9uTG9vcD9hLmRpcmVjdGlvbk5hdi5yZW1vdmVDbGFzcyhlKS5yZW1vdmVBdHRyKFwidGFiaW5kZXhcIik6MD09PWEuYW5pbWF0aW5nVG8/YS5kaXJlY3Rpb25OYXYucmVtb3ZlQ2xhc3MoZSkuZmlsdGVyKFwiLlwiK24rXCJwcmV2XCIpLmFkZENsYXNzKGUpLmF0dHIoXCJ0YWJpbmRleFwiLFwiLTFcIik6YS5hbmltYXRpbmdUbz09PWEubGFzdD9hLmRpcmVjdGlvbk5hdi5yZW1vdmVDbGFzcyhlKS5maWx0ZXIoXCIuXCIrbitcIm5leHRcIikuYWRkQ2xhc3MoZSkuYXR0cihcInRhYmluZGV4XCIsXCItMVwiKTphLmRpcmVjdGlvbk5hdi5yZW1vdmVDbGFzcyhlKS5yZW1vdmVBdHRyKFwidGFiaW5kZXhcIil9fSxwYXVzZVBsYXk6e3NldHVwOmZ1bmN0aW9uKCl7dmFyIGU9JCgnPGRpdiBjbGFzcz1cIicrbisncGF1c2VwbGF5XCI+PGE+PC9hPjwvZGl2PicpO2EuY29udHJvbHNDb250YWluZXI/KGEuY29udHJvbHNDb250YWluZXIuYXBwZW5kKGUpLGEucGF1c2VQbGF5PSQoXCIuXCIrbitcInBhdXNlcGxheSBhXCIsYS5jb250cm9sc0NvbnRhaW5lcikpOihhLmFwcGVuZChlKSxhLnBhdXNlUGxheT0kKFwiLlwiK24rXCJwYXVzZXBsYXkgYVwiLGEpKSxtLnBhdXNlUGxheS51cGRhdGUoYS52YXJzLnNsaWRlc2hvdz9uK1wicGF1c2VcIjpuK1wicGxheVwiKSxhLnBhdXNlUGxheS5iaW5kKHIsZnVuY3Rpb24oZSl7ZS5wcmV2ZW50RGVmYXVsdCgpLChcIlwiPT09b3x8bz09PWUudHlwZSkmJigkKHRoaXMpLmhhc0NsYXNzKG4rXCJwYXVzZVwiKT8oYS5tYW51YWxQYXVzZT0hMCxhLm1hbnVhbFBsYXk9ITEsYS5wYXVzZSgpKTooYS5tYW51YWxQYXVzZT0hMSxhLm1hbnVhbFBsYXk9ITAsYS5wbGF5KCkpKSxcIlwiPT09byYmKG89ZS50eXBlKSxtLnNldFRvQ2xlYXJXYXRjaGVkRXZlbnQoKX0pfSx1cGRhdGU6ZnVuY3Rpb24oZSl7XCJwbGF5XCI9PT1lP2EucGF1c2VQbGF5LnJlbW92ZUNsYXNzKG4rXCJwYXVzZVwiKS5hZGRDbGFzcyhuK1wicGxheVwiKS5odG1sKGEudmFycy5wbGF5VGV4dCk6YS5wYXVzZVBsYXkucmVtb3ZlQ2xhc3MobitcInBsYXlcIikuYWRkQ2xhc3MobitcInBhdXNlXCIpLmh0bWwoYS52YXJzLnBhdXNlVGV4dCl9fSx0b3VjaDpmdW5jdGlvbigpe2Z1bmN0aW9uIHQodCl7dC5zdG9wUHJvcGFnYXRpb24oKSxhLmFuaW1hdGluZz90LnByZXZlbnREZWZhdWx0KCk6KGEucGF1c2UoKSxlLl9nZXN0dXJlLmFkZFBvaW50ZXIodC5wb2ludGVySWQpLHc9MCxwPWM/YS5oOmEudyxmPU51bWJlcihuZXcgRGF0ZSksbD11JiZkJiZhLmFuaW1hdGluZ1RvPT09YS5sYXN0PzA6dSYmZD9hLmxpbWl0LShhLml0ZW1XK2EudmFycy5pdGVtTWFyZ2luKSphLm1vdmUqYS5hbmltYXRpbmdUbzp1JiZhLmN1cnJlbnRTbGlkZT09PWEubGFzdD9hLmxpbWl0OnU/KGEuaXRlbVcrYS52YXJzLml0ZW1NYXJnaW4pKmEubW92ZSphLmN1cnJlbnRTbGlkZTpkPyhhLmxhc3QtYS5jdXJyZW50U2xpZGUrYS5jbG9uZU9mZnNldCkqcDooYS5jdXJyZW50U2xpZGUrYS5jbG9uZU9mZnNldCkqcCl9ZnVuY3Rpb24gbih0KXt0LnN0b3BQcm9wYWdhdGlvbigpO3ZhciBhPXQudGFyZ2V0Ll9zbGlkZXI7aWYoYSl7dmFyIG49LXQudHJhbnNsYXRpb25YLGk9LXQudHJhbnNsYXRpb25ZO3JldHVybiB3Kz1jP2k6bixtPXcseT1jP01hdGguYWJzKHcpPE1hdGguYWJzKC1uKTpNYXRoLmFicyh3KTxNYXRoLmFicygtaSksdC5kZXRhaWw9PT10Lk1TR0VTVFVSRV9GTEFHX0lORVJUSUE/dm9pZCBzZXRJbW1lZGlhdGUoZnVuY3Rpb24oKXtlLl9nZXN0dXJlLnN0b3AoKX0pOnZvaWQoKCF5fHxOdW1iZXIobmV3IERhdGUpLWY+NTAwKSYmKHQucHJldmVudERlZmF1bHQoKSwhdiYmYS50cmFuc2l0aW9ucyYmKGEudmFycy5hbmltYXRpb25Mb29wfHwobT13LygwPT09YS5jdXJyZW50U2xpZGUmJjA+d3x8YS5jdXJyZW50U2xpZGU9PT1hLmxhc3QmJnc+MD9NYXRoLmFicyh3KS9wKzI6MSkpLGEuc2V0UHJvcHMobCttLFwic2V0VG91Y2hcIikpKSl9fWZ1bmN0aW9uIHMoZSl7ZS5zdG9wUHJvcGFnYXRpb24oKTt2YXIgdD1lLnRhcmdldC5fc2xpZGVyO2lmKHQpe2lmKHQuYW5pbWF0aW5nVG89PT10LmN1cnJlbnRTbGlkZSYmIXkmJm51bGwhPT1tKXt2YXIgYT1kPy1tOm0sbj10LmdldFRhcmdldChhPjA/XCJuZXh0XCI6XCJwcmV2XCIpO3QuY2FuQWR2YW5jZShuKSYmKE51bWJlcihuZXcgRGF0ZSktZjw1NTAmJk1hdGguYWJzKGEpPjUwfHxNYXRoLmFicyhhKT5wLzIpP3QuZmxleEFuaW1hdGUobix0LnZhcnMucGF1c2VPbkFjdGlvbik6dnx8dC5mbGV4QW5pbWF0ZSh0LmN1cnJlbnRTbGlkZSx0LnZhcnMucGF1c2VPbkFjdGlvbiwhMCl9cj1udWxsLG89bnVsbCxtPW51bGwsbD1udWxsLHc9MH19dmFyIHIsbyxsLHAsbSxmLGcsaCxTLHk9ITEseD0wLGI9MCx3PTA7aT8oZS5zdHlsZS5tc1RvdWNoQWN0aW9uPVwibm9uZVwiLGUuX2dlc3R1cmU9bmV3IE1TR2VzdHVyZSxlLl9nZXN0dXJlLnRhcmdldD1lLGUuYWRkRXZlbnRMaXN0ZW5lcihcIk1TUG9pbnRlckRvd25cIix0LCExKSxlLl9zbGlkZXI9YSxlLmFkZEV2ZW50TGlzdGVuZXIoXCJNU0dlc3R1cmVDaGFuZ2VcIixuLCExKSxlLmFkZEV2ZW50TGlzdGVuZXIoXCJNU0dlc3R1cmVFbmRcIixzLCExKSk6KGc9ZnVuY3Rpb24odCl7YS5hbmltYXRpbmc/dC5wcmV2ZW50RGVmYXVsdCgpOih3aW5kb3cubmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWR8fDE9PT10LnRvdWNoZXMubGVuZ3RoKSYmKGEucGF1c2UoKSxwPWM/YS5oOmEudyxmPU51bWJlcihuZXcgRGF0ZSkseD10LnRvdWNoZXNbMF0ucGFnZVgsYj10LnRvdWNoZXNbMF0ucGFnZVksbD11JiZkJiZhLmFuaW1hdGluZ1RvPT09YS5sYXN0PzA6dSYmZD9hLmxpbWl0LShhLml0ZW1XK2EudmFycy5pdGVtTWFyZ2luKSphLm1vdmUqYS5hbmltYXRpbmdUbzp1JiZhLmN1cnJlbnRTbGlkZT09PWEubGFzdD9hLmxpbWl0OnU/KGEuaXRlbVcrYS52YXJzLml0ZW1NYXJnaW4pKmEubW92ZSphLmN1cnJlbnRTbGlkZTpkPyhhLmxhc3QtYS5jdXJyZW50U2xpZGUrYS5jbG9uZU9mZnNldCkqcDooYS5jdXJyZW50U2xpZGUrYS5jbG9uZU9mZnNldCkqcCxyPWM/Yjp4LG89Yz94OmIsZS5hZGRFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsaCwhMSksZS5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIixTLCExKSl9LGg9ZnVuY3Rpb24oZSl7eD1lLnRvdWNoZXNbMF0ucGFnZVgsYj1lLnRvdWNoZXNbMF0ucGFnZVksbT1jP3ItYjpyLXgseT1jP01hdGguYWJzKG0pPE1hdGguYWJzKHgtbyk6TWF0aC5hYnMobSk8TWF0aC5hYnMoYi1vKTt2YXIgdD01MDA7KCF5fHxOdW1iZXIobmV3IERhdGUpLWY+dCkmJihlLnByZXZlbnREZWZhdWx0KCksIXYmJmEudHJhbnNpdGlvbnMmJihhLnZhcnMuYW5pbWF0aW9uTG9vcHx8KG0vPTA9PT1hLmN1cnJlbnRTbGlkZSYmMD5tfHxhLmN1cnJlbnRTbGlkZT09PWEubGFzdCYmbT4wP01hdGguYWJzKG0pL3ArMjoxKSxhLnNldFByb3BzKGwrbSxcInNldFRvdWNoXCIpKSl9LFM9ZnVuY3Rpb24odCl7aWYoZS5yZW1vdmVFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsaCwhMSksYS5hbmltYXRpbmdUbz09PWEuY3VycmVudFNsaWRlJiYheSYmbnVsbCE9PW0pe3ZhciBuPWQ/LW06bSxpPWEuZ2V0VGFyZ2V0KG4+MD9cIm5leHRcIjpcInByZXZcIik7YS5jYW5BZHZhbmNlKGkpJiYoTnVtYmVyKG5ldyBEYXRlKS1mPDU1MCYmTWF0aC5hYnMobik+NTB8fE1hdGguYWJzKG4pPnAvMik/YS5mbGV4QW5pbWF0ZShpLGEudmFycy5wYXVzZU9uQWN0aW9uKTp2fHxhLmZsZXhBbmltYXRlKGEuY3VycmVudFNsaWRlLGEudmFycy5wYXVzZU9uQWN0aW9uLCEwKX1lLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLFMsITEpLHI9bnVsbCxvPW51bGwsbT1udWxsLGw9bnVsbH0sZS5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hzdGFydFwiLGcsITEpKX0scmVzaXplOmZ1bmN0aW9uKCl7IWEuYW5pbWF0aW5nJiZhLmlzKFwiOnZpc2libGVcIikmJih1fHxhLmRvTWF0aCgpLHY/bS5zbW9vdGhIZWlnaHQoKTp1PyhhLnNsaWRlcy53aWR0aChhLmNvbXB1dGVkVyksYS51cGRhdGUoYS5wYWdpbmdDb3VudCksYS5zZXRQcm9wcygpKTpjPyhhLnZpZXdwb3J0LmhlaWdodChhLmgpLGEuc2V0UHJvcHMoYS5oLFwic2V0VG90YWxcIikpOihhLnZhcnMuc21vb3RoSGVpZ2h0JiZtLnNtb290aEhlaWdodCgpLGEubmV3U2xpZGVzLndpZHRoKGEuY29tcHV0ZWRXKSxhLnNldFByb3BzKGEuY29tcHV0ZWRXLFwic2V0VG90YWxcIikpKX0sc21vb3RoSGVpZ2h0OmZ1bmN0aW9uKGUpe2lmKCFjfHx2KXt2YXIgdD12P2E6YS52aWV3cG9ydDtlP3QuYW5pbWF0ZSh7aGVpZ2h0OmEuc2xpZGVzLmVxKGEuYW5pbWF0aW5nVG8pLmhlaWdodCgpfSxlKTp0LmhlaWdodChhLnNsaWRlcy5lcShhLmFuaW1hdGluZ1RvKS5oZWlnaHQoKSl9fSxzeW5jOmZ1bmN0aW9uKGUpe3ZhciB0PSQoYS52YXJzLnN5bmMpLmRhdGEoXCJmbGV4c2xpZGVyXCIpLG49YS5hbmltYXRpbmdUbztzd2l0Y2goZSl7Y2FzZVwiYW5pbWF0ZVwiOnQuZmxleEFuaW1hdGUobixhLnZhcnMucGF1c2VPbkFjdGlvbiwhMSwhMCk7YnJlYWs7Y2FzZVwicGxheVwiOnQucGxheWluZ3x8dC5hc05hdnx8dC5wbGF5KCk7YnJlYWs7Y2FzZVwicGF1c2VcIjp0LnBhdXNlKCl9fSx1bmlxdWVJRDpmdW5jdGlvbihlKXtyZXR1cm4gZS5maWx0ZXIoXCJbaWRdXCIpLmFkZChlLmZpbmQoXCJbaWRdXCIpKS5lYWNoKGZ1bmN0aW9uKCl7dmFyIGU9JCh0aGlzKTtlLmF0dHIoXCJpZFwiLGUuYXR0cihcImlkXCIpK1wiX2Nsb25lXCIpfSksZX0scGF1c2VJbnZpc2libGU6e3Zpc1Byb3A6bnVsbCxpbml0OmZ1bmN0aW9uKCl7dmFyIGU9bS5wYXVzZUludmlzaWJsZS5nZXRIaWRkZW5Qcm9wKCk7aWYoZSl7dmFyIHQ9ZS5yZXBsYWNlKC9bSHxoXWlkZGVuLyxcIlwiKStcInZpc2liaWxpdHljaGFuZ2VcIjtkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKHQsZnVuY3Rpb24oKXttLnBhdXNlSW52aXNpYmxlLmlzSGlkZGVuKCk/YS5zdGFydFRpbWVvdXQ/Y2xlYXJUaW1lb3V0KGEuc3RhcnRUaW1lb3V0KTphLnBhdXNlKCk6YS5zdGFydGVkP2EucGxheSgpOmEudmFycy5pbml0RGVsYXk+MD9zZXRUaW1lb3V0KGEucGxheSxhLnZhcnMuaW5pdERlbGF5KTphLnBsYXkoKX0pfX0saXNIaWRkZW46ZnVuY3Rpb24oKXt2YXIgZT1tLnBhdXNlSW52aXNpYmxlLmdldEhpZGRlblByb3AoKTtyZXR1cm4gZT9kb2N1bWVudFtlXTohMX0sZ2V0SGlkZGVuUHJvcDpmdW5jdGlvbigpe3ZhciBlPVtcIndlYmtpdFwiLFwibW96XCIsXCJtc1wiLFwib1wiXTtpZihcImhpZGRlblwiaW4gZG9jdW1lbnQpcmV0dXJuXCJoaWRkZW5cIjtmb3IodmFyIHQ9MDt0PGUubGVuZ3RoO3QrKylpZihlW3RdK1wiSGlkZGVuXCJpbiBkb2N1bWVudClyZXR1cm4gZVt0XStcIkhpZGRlblwiO3JldHVybiBudWxsfX0sc2V0VG9DbGVhcldhdGNoZWRFdmVudDpmdW5jdGlvbigpe2NsZWFyVGltZW91dChsKSxsPXNldFRpbWVvdXQoZnVuY3Rpb24oKXtvPVwiXCJ9LDNlMyl9fSxhLmZsZXhBbmltYXRlPWZ1bmN0aW9uKGUsdCxpLHIsbyl7aWYoYS52YXJzLmFuaW1hdGlvbkxvb3B8fGU9PT1hLmN1cnJlbnRTbGlkZXx8KGEuZGlyZWN0aW9uPWU+YS5jdXJyZW50U2xpZGU/XCJuZXh0XCI6XCJwcmV2XCIpLHAmJjE9PT1hLnBhZ2luZ0NvdW50JiYoYS5kaXJlY3Rpb249YS5jdXJyZW50SXRlbTxlP1wibmV4dFwiOlwicHJldlwiKSwhYS5hbmltYXRpbmcmJihhLmNhbkFkdmFuY2UoZSxvKXx8aSkmJmEuaXMoXCI6dmlzaWJsZVwiKSl7aWYocCYmcil7dmFyIGw9JChhLnZhcnMuYXNOYXZGb3IpLmRhdGEoXCJmbGV4c2xpZGVyXCIpO2lmKGEuYXRFbmQ9MD09PWV8fGU9PT1hLmNvdW50LTEsbC5mbGV4QW5pbWF0ZShlLCEwLCExLCEwLG8pLGEuZGlyZWN0aW9uPWEuY3VycmVudEl0ZW08ZT9cIm5leHRcIjpcInByZXZcIixsLmRpcmVjdGlvbj1hLmRpcmVjdGlvbixNYXRoLmNlaWwoKGUrMSkvYS52aXNpYmxlKS0xPT09YS5jdXJyZW50U2xpZGV8fDA9PT1lKXJldHVybiBhLmN1cnJlbnRJdGVtPWUsYS5zbGlkZXMucmVtb3ZlQ2xhc3MobitcImFjdGl2ZS1zbGlkZVwiKS5lcShlKS5hZGRDbGFzcyhuK1wiYWN0aXZlLXNsaWRlXCIpLCExO2EuY3VycmVudEl0ZW09ZSxhLnNsaWRlcy5yZW1vdmVDbGFzcyhuK1wiYWN0aXZlLXNsaWRlXCIpLmVxKGUpLmFkZENsYXNzKG4rXCJhY3RpdmUtc2xpZGVcIiksZT1NYXRoLmZsb29yKGUvYS52aXNpYmxlKX1pZihhLmFuaW1hdGluZz0hMCxhLmFuaW1hdGluZ1RvPWUsdCYmYS5wYXVzZSgpLGEudmFycy5iZWZvcmUoYSksYS5zeW5jRXhpc3RzJiYhbyYmbS5zeW5jKFwiYW5pbWF0ZVwiKSxhLnZhcnMuY29udHJvbE5hdiYmbS5jb250cm9sTmF2LmFjdGl2ZSgpLHV8fGEuc2xpZGVzLnJlbW92ZUNsYXNzKG4rXCJhY3RpdmUtc2xpZGVcIikuZXEoZSkuYWRkQ2xhc3MobitcImFjdGl2ZS1zbGlkZVwiKSxhLmF0RW5kPTA9PT1lfHxlPT09YS5sYXN0LGEudmFycy5kaXJlY3Rpb25OYXYmJm0uZGlyZWN0aW9uTmF2LnVwZGF0ZSgpLGU9PT1hLmxhc3QmJihhLnZhcnMuZW5kKGEpLGEudmFycy5hbmltYXRpb25Mb29wfHxhLnBhdXNlKCkpLHYpcz8oYS5zbGlkZXMuZXEoYS5jdXJyZW50U2xpZGUpLmNzcyh7b3BhY2l0eTowLHpJbmRleDoxfSksYS5zbGlkZXMuZXEoZSkuY3NzKHtvcGFjaXR5OjEsekluZGV4OjJ9KSxhLndyYXB1cChmKSk6KGEuc2xpZGVzLmVxKGEuY3VycmVudFNsaWRlKS5jc3Moe3pJbmRleDoxfSkuYW5pbWF0ZSh7b3BhY2l0eTowfSxhLnZhcnMuYW5pbWF0aW9uU3BlZWQsYS52YXJzLmVhc2luZyksYS5zbGlkZXMuZXEoZSkuY3NzKHt6SW5kZXg6Mn0pLmFuaW1hdGUoe29wYWNpdHk6MX0sYS52YXJzLmFuaW1hdGlvblNwZWVkLGEudmFycy5lYXNpbmcsYS53cmFwdXApKTtlbHNle3ZhciBmPWM/YS5zbGlkZXMuZmlsdGVyKFwiOmZpcnN0XCIpLmhlaWdodCgpOmEuY29tcHV0ZWRXLGcsaCxTO3U/KGc9YS52YXJzLml0ZW1NYXJnaW4sUz0oYS5pdGVtVytnKSphLm1vdmUqYS5hbmltYXRpbmdUbyxoPVM+YS5saW1pdCYmMSE9PWEudmlzaWJsZT9hLmxpbWl0OlMpOmg9MD09PWEuY3VycmVudFNsaWRlJiZlPT09YS5jb3VudC0xJiZhLnZhcnMuYW5pbWF0aW9uTG9vcCYmXCJuZXh0XCIhPT1hLmRpcmVjdGlvbj9kPyhhLmNvdW50K2EuY2xvbmVPZmZzZXQpKmY6MDphLmN1cnJlbnRTbGlkZT09PWEubGFzdCYmMD09PWUmJmEudmFycy5hbmltYXRpb25Mb29wJiZcInByZXZcIiE9PWEuZGlyZWN0aW9uP2Q/MDooYS5jb3VudCsxKSpmOmQ/KGEuY291bnQtMS1lK2EuY2xvbmVPZmZzZXQpKmY6KGUrYS5jbG9uZU9mZnNldCkqZixhLnNldFByb3BzKGgsXCJcIixhLnZhcnMuYW5pbWF0aW9uU3BlZWQpLGEudHJhbnNpdGlvbnM/KGEudmFycy5hbmltYXRpb25Mb29wJiZhLmF0RW5kfHwoYS5hbmltYXRpbmc9ITEsYS5jdXJyZW50U2xpZGU9YS5hbmltYXRpbmdUbyksYS5jb250YWluZXIudW5iaW5kKFwid2Via2l0VHJhbnNpdGlvbkVuZCB0cmFuc2l0aW9uZW5kXCIpLGEuY29udGFpbmVyLmJpbmQoXCJ3ZWJraXRUcmFuc2l0aW9uRW5kIHRyYW5zaXRpb25lbmRcIixmdW5jdGlvbigpe2NsZWFyVGltZW91dChhLmVuc3VyZUFuaW1hdGlvbkVuZCksYS53cmFwdXAoZil9KSxjbGVhclRpbWVvdXQoYS5lbnN1cmVBbmltYXRpb25FbmQpLGEuZW5zdXJlQW5pbWF0aW9uRW5kPXNldFRpbWVvdXQoZnVuY3Rpb24oKXthLndyYXB1cChmKX0sYS52YXJzLmFuaW1hdGlvblNwZWVkKzEwMCkpOmEuY29udGFpbmVyLmFuaW1hdGUoYS5hcmdzLGEudmFycy5hbmltYXRpb25TcGVlZCxhLnZhcnMuZWFzaW5nLGZ1bmN0aW9uKCl7YS53cmFwdXAoZil9KX1hLnZhcnMuc21vb3RoSGVpZ2h0JiZtLnNtb290aEhlaWdodChhLnZhcnMuYW5pbWF0aW9uU3BlZWQpfX0sYS53cmFwdXA9ZnVuY3Rpb24oZSl7dnx8dXx8KDA9PT1hLmN1cnJlbnRTbGlkZSYmYS5hbmltYXRpbmdUbz09PWEubGFzdCYmYS52YXJzLmFuaW1hdGlvbkxvb3A/YS5zZXRQcm9wcyhlLFwianVtcEVuZFwiKTphLmN1cnJlbnRTbGlkZT09PWEubGFzdCYmMD09PWEuYW5pbWF0aW5nVG8mJmEudmFycy5hbmltYXRpb25Mb29wJiZhLnNldFByb3BzKGUsXCJqdW1wU3RhcnRcIikpLGEuYW5pbWF0aW5nPSExLGEuY3VycmVudFNsaWRlPWEuYW5pbWF0aW5nVG8sYS52YXJzLmFmdGVyKGEpfSxhLmFuaW1hdGVTbGlkZXM9ZnVuY3Rpb24oKXshYS5hbmltYXRpbmcmJmYmJmEuZmxleEFuaW1hdGUoYS5nZXRUYXJnZXQoXCJuZXh0XCIpKX0sYS5wYXVzZT1mdW5jdGlvbigpe2NsZWFySW50ZXJ2YWwoYS5hbmltYXRlZFNsaWRlcyksYS5hbmltYXRlZFNsaWRlcz1udWxsLGEucGxheWluZz0hMSxhLnZhcnMucGF1c2VQbGF5JiZtLnBhdXNlUGxheS51cGRhdGUoXCJwbGF5XCIpLGEuc3luY0V4aXN0cyYmbS5zeW5jKFwicGF1c2VcIil9LGEucGxheT1mdW5jdGlvbigpe2EucGxheWluZyYmY2xlYXJJbnRlcnZhbChhLmFuaW1hdGVkU2xpZGVzKSxhLmFuaW1hdGVkU2xpZGVzPWEuYW5pbWF0ZWRTbGlkZXN8fHNldEludGVydmFsKGEuYW5pbWF0ZVNsaWRlcyxhLnZhcnMuc2xpZGVzaG93U3BlZWQpLGEuc3RhcnRlZD1hLnBsYXlpbmc9ITAsYS52YXJzLnBhdXNlUGxheSYmbS5wYXVzZVBsYXkudXBkYXRlKFwicGF1c2VcIiksYS5zeW5jRXhpc3RzJiZtLnN5bmMoXCJwbGF5XCIpfSxhLnN0b3A9ZnVuY3Rpb24oKXthLnBhdXNlKCksYS5zdG9wcGVkPSEwfSxhLmNhbkFkdmFuY2U9ZnVuY3Rpb24oZSx0KXt2YXIgbj1wP2EucGFnaW5nQ291bnQtMTphLmxhc3Q7cmV0dXJuIHQ/ITA6cCYmYS5jdXJyZW50SXRlbT09PWEuY291bnQtMSYmMD09PWUmJlwicHJldlwiPT09YS5kaXJlY3Rpb24/ITA6cCYmMD09PWEuY3VycmVudEl0ZW0mJmU9PT1hLnBhZ2luZ0NvdW50LTEmJlwibmV4dFwiIT09YS5kaXJlY3Rpb24/ITE6ZSE9PWEuY3VycmVudFNsaWRlfHxwP2EudmFycy5hbmltYXRpb25Mb29wPyEwOmEuYXRFbmQmJjA9PT1hLmN1cnJlbnRTbGlkZSYmZT09PW4mJlwibmV4dFwiIT09YS5kaXJlY3Rpb24/ITE6YS5hdEVuZCYmYS5jdXJyZW50U2xpZGU9PT1uJiYwPT09ZSYmXCJuZXh0XCI9PT1hLmRpcmVjdGlvbj8hMTohMDohMX0sYS5nZXRUYXJnZXQ9ZnVuY3Rpb24oZSl7cmV0dXJuIGEuZGlyZWN0aW9uPWUsXCJuZXh0XCI9PT1lP2EuY3VycmVudFNsaWRlPT09YS5sYXN0PzA6YS5jdXJyZW50U2xpZGUrMTowPT09YS5jdXJyZW50U2xpZGU/YS5sYXN0OmEuY3VycmVudFNsaWRlLTF9LGEuc2V0UHJvcHM9ZnVuY3Rpb24oZSx0LG4pe3ZhciBpPWZ1bmN0aW9uKCl7dmFyIG49ZT9lOihhLml0ZW1XK2EudmFycy5pdGVtTWFyZ2luKSphLm1vdmUqYS5hbmltYXRpbmdUbyxpPWZ1bmN0aW9uKCl7aWYodSlyZXR1cm5cInNldFRvdWNoXCI9PT10P2U6ZCYmYS5hbmltYXRpbmdUbz09PWEubGFzdD8wOmQ/YS5saW1pdC0oYS5pdGVtVythLnZhcnMuaXRlbU1hcmdpbikqYS5tb3ZlKmEuYW5pbWF0aW5nVG86YS5hbmltYXRpbmdUbz09PWEubGFzdD9hLmxpbWl0Om47c3dpdGNoKHQpe2Nhc2VcInNldFRvdGFsXCI6cmV0dXJuIGQ/KGEuY291bnQtMS1hLmN1cnJlbnRTbGlkZSthLmNsb25lT2Zmc2V0KSplOihhLmN1cnJlbnRTbGlkZSthLmNsb25lT2Zmc2V0KSplO2Nhc2VcInNldFRvdWNoXCI6cmV0dXJuIGQ/ZTplO2Nhc2VcImp1bXBFbmRcIjpyZXR1cm4gZD9lOmEuY291bnQqZTtjYXNlXCJqdW1wU3RhcnRcIjpyZXR1cm4gZD9hLmNvdW50KmU6ZTtkZWZhdWx0OnJldHVybiBlfX0oKTtyZXR1cm4tMSppK1wicHhcIn0oKTthLnRyYW5zaXRpb25zJiYoaT1jP1widHJhbnNsYXRlM2QoMCxcIitpK1wiLDApXCI6XCJ0cmFuc2xhdGUzZChcIitpK1wiLDAsMClcIixuPXZvaWQgMCE9PW4/bi8xZTMrXCJzXCI6XCIwc1wiLGEuY29udGFpbmVyLmNzcyhcIi1cIithLnBmeCtcIi10cmFuc2l0aW9uLWR1cmF0aW9uXCIsbiksYS5jb250YWluZXIuY3NzKFwidHJhbnNpdGlvbi1kdXJhdGlvblwiLG4pKSxhLmFyZ3NbYS5wcm9wXT1pLChhLnRyYW5zaXRpb25zfHx2b2lkIDA9PT1uKSYmYS5jb250YWluZXIuY3NzKGEuYXJncyksYS5jb250YWluZXIuY3NzKFwidHJhbnNmb3JtXCIsaSl9LGEuc2V0dXA9ZnVuY3Rpb24oZSl7aWYodilhLnNsaWRlcy5jc3Moe3dpZHRoOlwiMTAwJVwiLFwiZmxvYXRcIjpcImxlZnRcIixtYXJnaW5SaWdodDpcIi0xMDAlXCIscG9zaXRpb246XCJyZWxhdGl2ZVwifSksXCJpbml0XCI9PT1lJiYocz9hLnNsaWRlcy5jc3Moe29wYWNpdHk6MCxkaXNwbGF5OlwiYmxvY2tcIix3ZWJraXRUcmFuc2l0aW9uOlwib3BhY2l0eSBcIithLnZhcnMuYW5pbWF0aW9uU3BlZWQvMWUzK1wicyBlYXNlXCIsekluZGV4OjF9KS5lcShhLmN1cnJlbnRTbGlkZSkuY3NzKHtvcGFjaXR5OjEsekluZGV4OjJ9KTowPT1hLnZhcnMuZmFkZUZpcnN0U2xpZGU/YS5zbGlkZXMuY3NzKHtvcGFjaXR5OjAsZGlzcGxheTpcImJsb2NrXCIsekluZGV4OjF9KS5lcShhLmN1cnJlbnRTbGlkZSkuY3NzKHt6SW5kZXg6Mn0pLmNzcyh7b3BhY2l0eToxfSk6YS5zbGlkZXMuY3NzKHtvcGFjaXR5OjAsZGlzcGxheTpcImJsb2NrXCIsekluZGV4OjF9KS5lcShhLmN1cnJlbnRTbGlkZSkuY3NzKHt6SW5kZXg6Mn0pLmFuaW1hdGUoe29wYWNpdHk6MX0sYS52YXJzLmFuaW1hdGlvblNwZWVkLGEudmFycy5lYXNpbmcpKSxhLnZhcnMuc21vb3RoSGVpZ2h0JiZtLnNtb290aEhlaWdodCgpO2Vsc2V7dmFyIHQsaTtcImluaXRcIj09PWUmJihhLnZpZXdwb3J0PSQoJzxkaXYgY2xhc3M9XCInK24rJ3ZpZXdwb3J0XCI+PC9kaXY+JykuY3NzKHtvdmVyZmxvdzpcImhpZGRlblwiLHBvc2l0aW9uOlwicmVsYXRpdmVcIn0pLmFwcGVuZFRvKGEpLmFwcGVuZChhLmNvbnRhaW5lciksYS5jbG9uZUNvdW50PTAsYS5jbG9uZU9mZnNldD0wLGQmJihpPSQubWFrZUFycmF5KGEuc2xpZGVzKS5yZXZlcnNlKCksYS5zbGlkZXM9JChpKSxhLmNvbnRhaW5lci5lbXB0eSgpLmFwcGVuZChhLnNsaWRlcykpKSxhLnZhcnMuYW5pbWF0aW9uTG9vcCYmIXUmJihhLmNsb25lQ291bnQ9MixhLmNsb25lT2Zmc2V0PTEsXCJpbml0XCIhPT1lJiZhLmNvbnRhaW5lci5maW5kKFwiLmNsb25lXCIpLnJlbW92ZSgpLGEuY29udGFpbmVyLmFwcGVuZChtLnVuaXF1ZUlEKGEuc2xpZGVzLmZpcnN0KCkuY2xvbmUoKS5hZGRDbGFzcyhcImNsb25lXCIpKS5hdHRyKFwiYXJpYS1oaWRkZW5cIixcInRydWVcIikpLnByZXBlbmQobS51bmlxdWVJRChhLnNsaWRlcy5sYXN0KCkuY2xvbmUoKS5hZGRDbGFzcyhcImNsb25lXCIpKS5hdHRyKFwiYXJpYS1oaWRkZW5cIixcInRydWVcIikpKSxhLm5ld1NsaWRlcz0kKGEudmFycy5zZWxlY3RvcixhKSx0PWQ/YS5jb3VudC0xLWEuY3VycmVudFNsaWRlK2EuY2xvbmVPZmZzZXQ6YS5jdXJyZW50U2xpZGUrYS5jbG9uZU9mZnNldCxjJiYhdT8oYS5jb250YWluZXIuaGVpZ2h0KDIwMCooYS5jb3VudCthLmNsb25lQ291bnQpK1wiJVwiKS5jc3MoXCJwb3NpdGlvblwiLFwiYWJzb2x1dGVcIikud2lkdGgoXCIxMDAlXCIpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXthLm5ld1NsaWRlcy5jc3Moe2Rpc3BsYXk6XCJibG9ja1wifSksYS5kb01hdGgoKSxhLnZpZXdwb3J0LmhlaWdodChhLmgpLGEuc2V0UHJvcHModCphLmgsXCJpbml0XCIpfSxcImluaXRcIj09PWU/MTAwOjApKTooYS5jb250YWluZXIud2lkdGgoMjAwKihhLmNvdW50K2EuY2xvbmVDb3VudCkrXCIlXCIpLGEuc2V0UHJvcHModCphLmNvbXB1dGVkVyxcImluaXRcIiksc2V0VGltZW91dChmdW5jdGlvbigpe2EuZG9NYXRoKCksYS5uZXdTbGlkZXMuY3NzKHt3aWR0aDphLmNvbXB1dGVkVyxcImZsb2F0XCI6XCJsZWZ0XCIsZGlzcGxheTpcImJsb2NrXCJ9KSxhLnZhcnMuc21vb3RoSGVpZ2h0JiZtLnNtb290aEhlaWdodCgpfSxcImluaXRcIj09PWU/MTAwOjApKX11fHxhLnNsaWRlcy5yZW1vdmVDbGFzcyhuK1wiYWN0aXZlLXNsaWRlXCIpLmVxKGEuY3VycmVudFNsaWRlKS5hZGRDbGFzcyhuK1wiYWN0aXZlLXNsaWRlXCIpLGEudmFycy5pbml0KGEpfSxhLmRvTWF0aD1mdW5jdGlvbigpe3ZhciBlPWEuc2xpZGVzLmZpcnN0KCksdD1hLnZhcnMuaXRlbU1hcmdpbixuPWEudmFycy5taW5JdGVtcyxpPWEudmFycy5tYXhJdGVtczthLnc9dm9pZCAwPT09YS52aWV3cG9ydD9hLndpZHRoKCk6YS52aWV3cG9ydC53aWR0aCgpLGEuaD1lLmhlaWdodCgpLGEuYm94UGFkZGluZz1lLm91dGVyV2lkdGgoKS1lLndpZHRoKCksdT8oYS5pdGVtVD1hLnZhcnMuaXRlbVdpZHRoK3QsYS5taW5XPW4/biphLml0ZW1UOmEudyxhLm1heFc9aT9pKmEuaXRlbVQtdDphLncsYS5pdGVtVz1hLm1pblc+YS53PyhhLnctdCoobi0xKSkvbjphLm1heFc8YS53PyhhLnctdCooaS0xKSkvaTphLnZhcnMuaXRlbVdpZHRoPmEudz9hLnc6YS52YXJzLml0ZW1XaWR0aCxhLnZpc2libGU9TWF0aC5mbG9vcihhLncvYS5pdGVtVyksYS5tb3ZlPWEudmFycy5tb3ZlPjAmJmEudmFycy5tb3ZlPGEudmlzaWJsZT9hLnZhcnMubW92ZTphLnZpc2libGUsYS5wYWdpbmdDb3VudD1NYXRoLmNlaWwoKGEuY291bnQtYS52aXNpYmxlKS9hLm1vdmUrMSksYS5sYXN0PWEucGFnaW5nQ291bnQtMSxhLmxpbWl0PTE9PT1hLnBhZ2luZ0NvdW50PzA6YS52YXJzLml0ZW1XaWR0aD5hLnc/YS5pdGVtVyooYS5jb3VudC0xKSt0KihhLmNvdW50LTEpOihhLml0ZW1XK3QpKmEuY291bnQtYS53LXQpOihhLml0ZW1XPWEudyxhLnBhZ2luZ0NvdW50PWEuY291bnQsYS5sYXN0PWEuY291bnQtMSksYS5jb21wdXRlZFc9YS5pdGVtVy1hLmJveFBhZGRpbmd9LGEudXBkYXRlPWZ1bmN0aW9uKGUsdCl7YS5kb01hdGgoKSx1fHwoZTxhLmN1cnJlbnRTbGlkZT9hLmN1cnJlbnRTbGlkZSs9MTplPD1hLmN1cnJlbnRTbGlkZSYmMCE9PWUmJihhLmN1cnJlbnRTbGlkZS09MSksYS5hbmltYXRpbmdUbz1hLmN1cnJlbnRTbGlkZSksYS52YXJzLmNvbnRyb2xOYXYmJiFhLm1hbnVhbENvbnRyb2xzJiYoXCJhZGRcIj09PXQmJiF1fHxhLnBhZ2luZ0NvdW50PmEuY29udHJvbE5hdi5sZW5ndGg/bS5jb250cm9sTmF2LnVwZGF0ZShcImFkZFwiKTooXCJyZW1vdmVcIj09PXQmJiF1fHxhLnBhZ2luZ0NvdW50PGEuY29udHJvbE5hdi5sZW5ndGgpJiYodSYmYS5jdXJyZW50U2xpZGU+YS5sYXN0JiYoYS5jdXJyZW50U2xpZGUtPTEsYS5hbmltYXRpbmdUby09MSksbS5jb250cm9sTmF2LnVwZGF0ZShcInJlbW92ZVwiLGEubGFzdCkpKSxhLnZhcnMuZGlyZWN0aW9uTmF2JiZtLmRpcmVjdGlvbk5hdi51cGRhdGUoKX0sYS5hZGRTbGlkZT1mdW5jdGlvbihlLHQpe3ZhciBuPSQoZSk7YS5jb3VudCs9MSxhLmxhc3Q9YS5jb3VudC0xLGMmJmQ/dm9pZCAwIT09dD9hLnNsaWRlcy5lcShhLmNvdW50LXQpLmFmdGVyKG4pOmEuY29udGFpbmVyLnByZXBlbmQobik6dm9pZCAwIT09dD9hLnNsaWRlcy5lcSh0KS5iZWZvcmUobik6YS5jb250YWluZXIuYXBwZW5kKG4pLGEudXBkYXRlKHQsXCJhZGRcIiksYS5zbGlkZXM9JChhLnZhcnMuc2VsZWN0b3IrXCI6bm90KC5jbG9uZSlcIixhKSxhLnNldHVwKCksYS52YXJzLmFkZGVkKGEpfSxhLnJlbW92ZVNsaWRlPWZ1bmN0aW9uKGUpe3ZhciB0PWlzTmFOKGUpP2Euc2xpZGVzLmluZGV4KCQoZSkpOmU7YS5jb3VudC09MSxhLmxhc3Q9YS5jb3VudC0xLGlzTmFOKGUpPyQoZSxhLnNsaWRlcykucmVtb3ZlKCk6YyYmZD9hLnNsaWRlcy5lcShhLmxhc3QpLnJlbW92ZSgpOmEuc2xpZGVzLmVxKGUpLnJlbW92ZSgpLGEuZG9NYXRoKCksYS51cGRhdGUodCxcInJlbW92ZVwiKSxhLnNsaWRlcz0kKGEudmFycy5zZWxlY3RvcitcIjpub3QoLmNsb25lKVwiLGEpLGEuc2V0dXAoKSxhLnZhcnMucmVtb3ZlZChhKX0sbS5pbml0KCl9LCQod2luZG93KS5ibHVyKGZ1bmN0aW9uKGUpe2ZvY3VzZWQ9ITF9KS5mb2N1cyhmdW5jdGlvbihlKXtmb2N1c2VkPSEwfSksJC5mbGV4c2xpZGVyLmRlZmF1bHRzPXtuYW1lc3BhY2U6XCJmbGV4LVwiLHNlbGVjdG9yOlwiLnNsaWRlcyA+IGxpXCIsYW5pbWF0aW9uOlwiZmFkZVwiLGVhc2luZzpcInN3aW5nXCIsZGlyZWN0aW9uOlwiaG9yaXpvbnRhbFwiLHJldmVyc2U6ITEsYW5pbWF0aW9uTG9vcDohMCxzbW9vdGhIZWlnaHQ6ITEsc3RhcnRBdDowLHNsaWRlc2hvdzohMCxzbGlkZXNob3dTcGVlZDo3ZTMsYW5pbWF0aW9uU3BlZWQ6NjAwLGluaXREZWxheTowLHJhbmRvbWl6ZTohMSxmYWRlRmlyc3RTbGlkZTohMCx0aHVtYkNhcHRpb25zOiExLHBhdXNlT25BY3Rpb246ITAscGF1c2VPbkhvdmVyOiExLHBhdXNlSW52aXNpYmxlOiEwLHVzZUNTUzohMCx0b3VjaDohMCx2aWRlbzohMSxjb250cm9sTmF2OiEwLGRpcmVjdGlvbk5hdjohMCxwcmV2VGV4dDpcIlByZXZpb3VzXCIsbmV4dFRleHQ6XCJOZXh0XCIsa2V5Ym9hcmQ6ITAsbXVsdGlwbGVLZXlib2FyZDohMSxtb3VzZXdoZWVsOiExLHBhdXNlUGxheTohMSxwYXVzZVRleHQ6XCJQYXVzZVwiLHBsYXlUZXh0OlwiUGxheVwiLGNvbnRyb2xzQ29udGFpbmVyOlwiXCIsbWFudWFsQ29udHJvbHM6XCJcIixjdXN0b21EaXJlY3Rpb25OYXY6XCJcIixzeW5jOlwiXCIsYXNOYXZGb3I6XCJcIixpdGVtV2lkdGg6MCxpdGVtTWFyZ2luOjAsbWluSXRlbXM6MSxtYXhJdGVtczowLG1vdmU6MCxhbGxvd09uZVNsaWRlOiEwLHN0YXJ0OmZ1bmN0aW9uKCl7fSxiZWZvcmU6ZnVuY3Rpb24oKXt9LGFmdGVyOmZ1bmN0aW9uKCl7fSxlbmQ6ZnVuY3Rpb24oKXt9LGFkZGVkOmZ1bmN0aW9uKCl7fSxyZW1vdmVkOmZ1bmN0aW9uKCl7fSxpbml0OmZ1bmN0aW9uKCl7fX0sJC5mbi5mbGV4c2xpZGVyPWZ1bmN0aW9uKGUpe2lmKHZvaWQgMD09PWUmJihlPXt9KSxcIm9iamVjdFwiPT10eXBlb2YgZSlyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHQ9JCh0aGlzKSxhPWUuc2VsZWN0b3I/ZS5zZWxlY3RvcjpcIi5zbGlkZXMgPiBsaVwiLG49dC5maW5kKGEpOzE9PT1uLmxlbmd0aCYmZS5hbGxvd09uZVNsaWRlPT09ITB8fDA9PT1uLmxlbmd0aD8obi5mYWRlSW4oNDAwKSxlLnN0YXJ0JiZlLnN0YXJ0KHQpKTp2b2lkIDA9PT10LmRhdGEoXCJmbGV4c2xpZGVyXCIpJiZuZXcgJC5mbGV4c2xpZGVyKHRoaXMsZSl9KTt2YXIgdD0kKHRoaXMpLmRhdGEoXCJmbGV4c2xpZGVyXCIpO3N3aXRjaChlKXtjYXNlXCJwbGF5XCI6dC5wbGF5KCk7YnJlYWs7Y2FzZVwicGF1c2VcIjp0LnBhdXNlKCk7YnJlYWs7Y2FzZVwic3RvcFwiOnQuc3RvcCgpO2JyZWFrO2Nhc2VcIm5leHRcIjp0LmZsZXhBbmltYXRlKHQuZ2V0VGFyZ2V0KFwibmV4dFwiKSwhMCk7YnJlYWs7Y2FzZVwicHJldlwiOmNhc2VcInByZXZpb3VzXCI6dC5mbGV4QW5pbWF0ZSh0LmdldFRhcmdldChcInByZXZcIiksITApO2JyZWFrO2RlZmF1bHQ6XCJudW1iZXJcIj09dHlwZW9mIGUmJnQuZmxleEFuaW1hdGUoZSwhMCl9fX0oalF1ZXJ5KTsiLCIvKiFcclxuICogY2xhc3NpZSB2MS4wLjFcclxuICogY2xhc3MgaGVscGVyIGZ1bmN0aW9uc1xyXG4gKiBmcm9tIGJvbnpvIGh0dHBzOi8vZ2l0aHViLmNvbS9kZWQvYm9uem9cclxuICogTUlUIGxpY2Vuc2VcclxuICogXHJcbiAqIGNsYXNzaWUuaGFzKCBlbGVtLCAnbXktY2xhc3MnICkgLT4gdHJ1ZS9mYWxzZVxyXG4gKiBjbGFzc2llLmFkZCggZWxlbSwgJ215LW5ldy1jbGFzcycgKVxyXG4gKiBjbGFzc2llLnJlbW92ZSggZWxlbSwgJ215LXVud2FudGVkLWNsYXNzJyApXHJcbiAqIGNsYXNzaWUudG9nZ2xlKCBlbGVtLCAnbXktY2xhc3MnIClcclxuICovXHJcblxyXG4vKmpzaGludCBicm93c2VyOiB0cnVlLCBzdHJpY3Q6IHRydWUsIHVuZGVmOiB0cnVlLCB1bnVzZWQ6IHRydWUgKi9cclxuLypnbG9iYWwgZGVmaW5lOiBmYWxzZSwgbW9kdWxlOiBmYWxzZSAqL1xyXG5cclxuKCBmdW5jdGlvbiggd2luZG93ICkge1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxuLy8gY2xhc3MgaGVscGVyIGZ1bmN0aW9ucyBmcm9tIGJvbnpvIGh0dHBzOi8vZ2l0aHViLmNvbS9kZWQvYm9uem9cclxuXHJcbmZ1bmN0aW9uIGNsYXNzUmVnKCBjbGFzc05hbWUgKSB7XHJcbiAgcmV0dXJuIG5ldyBSZWdFeHAoXCIoXnxcXFxccyspXCIgKyBjbGFzc05hbWUgKyBcIihcXFxccyt8JClcIik7XHJcbn1cclxuXHJcbi8vIGNsYXNzTGlzdCBzdXBwb3J0IGZvciBjbGFzcyBtYW5hZ2VtZW50XHJcbi8vIGFsdGhvIHRvIGJlIGZhaXIsIHRoZSBhcGkgc3Vja3MgYmVjYXVzZSBpdCB3b24ndCBhY2NlcHQgbXVsdGlwbGUgY2xhc3NlcyBhdCBvbmNlXHJcbnZhciBoYXNDbGFzcywgYWRkQ2xhc3MsIHJlbW92ZUNsYXNzO1xyXG5cclxuaWYgKCAnY2xhc3NMaXN0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgKSB7XHJcbiAgaGFzQ2xhc3MgPSBmdW5jdGlvbiggZWxlbSwgYyApIHtcclxuICAgIHJldHVybiBlbGVtLmNsYXNzTGlzdC5jb250YWlucyggYyApO1xyXG4gIH07XHJcbiAgYWRkQ2xhc3MgPSBmdW5jdGlvbiggZWxlbSwgYyApIHtcclxuICAgIGVsZW0uY2xhc3NMaXN0LmFkZCggYyApO1xyXG4gIH07XHJcbiAgcmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbiggZWxlbSwgYyApIHtcclxuICAgIGVsZW0uY2xhc3NMaXN0LnJlbW92ZSggYyApO1xyXG4gIH07XHJcbn1cclxuZWxzZSB7XHJcbiAgaGFzQ2xhc3MgPSBmdW5jdGlvbiggZWxlbSwgYyApIHtcclxuICAgIHJldHVybiBjbGFzc1JlZyggYyApLnRlc3QoIGVsZW0uY2xhc3NOYW1lICk7XHJcbiAgfTtcclxuICBhZGRDbGFzcyA9IGZ1bmN0aW9uKCBlbGVtLCBjICkge1xyXG4gICAgaWYgKCAhaGFzQ2xhc3MoIGVsZW0sIGMgKSApIHtcclxuICAgICAgZWxlbS5jbGFzc05hbWUgPSBlbGVtLmNsYXNzTmFtZSArICcgJyArIGM7XHJcbiAgICB9XHJcbiAgfTtcclxuICByZW1vdmVDbGFzcyA9IGZ1bmN0aW9uKCBlbGVtLCBjICkge1xyXG4gICAgZWxlbS5jbGFzc05hbWUgPSBlbGVtLmNsYXNzTmFtZS5yZXBsYWNlKCBjbGFzc1JlZyggYyApLCAnICcgKTtcclxuICB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiB0b2dnbGVDbGFzcyggZWxlbSwgYyApIHtcclxuICB2YXIgZm4gPSBoYXNDbGFzcyggZWxlbSwgYyApID8gcmVtb3ZlQ2xhc3MgOiBhZGRDbGFzcztcclxuICBmbiggZWxlbSwgYyApO1xyXG59XHJcblxyXG52YXIgY2xhc3NpZSA9IHtcclxuICAvLyBmdWxsIG5hbWVzXHJcbiAgaGFzQ2xhc3M6IGhhc0NsYXNzLFxyXG4gIGFkZENsYXNzOiBhZGRDbGFzcyxcclxuICByZW1vdmVDbGFzczogcmVtb3ZlQ2xhc3MsXHJcbiAgdG9nZ2xlQ2xhc3M6IHRvZ2dsZUNsYXNzLFxyXG4gIC8vIHNob3J0IG5hbWVzXHJcbiAgaGFzOiBoYXNDbGFzcyxcclxuICBhZGQ6IGFkZENsYXNzLFxyXG4gIHJlbW92ZTogcmVtb3ZlQ2xhc3MsXHJcbiAgdG9nZ2xlOiB0b2dnbGVDbGFzc1xyXG59O1xyXG5cclxuLy8gdHJhbnNwb3J0XHJcbmlmICggdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xyXG4gIC8vIEFNRFxyXG4gIGRlZmluZSggY2xhc3NpZSApO1xyXG59IGVsc2UgaWYgKCB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgKSB7XHJcbiAgLy8gQ29tbW9uSlNcclxuICBtb2R1bGUuZXhwb3J0cyA9IGNsYXNzaWU7XHJcbn0gZWxzZSB7XHJcbiAgLy8gYnJvd3NlciBnbG9iYWxcclxuICB3aW5kb3cuY2xhc3NpZSA9IGNsYXNzaWU7XHJcbn1cclxuXHJcbn0pKCB3aW5kb3cgKTtcclxuIiwiLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cdFBPUFVQLkpTXHJcblxyXG5cdFNpbXBsZSBQb3B1cCBwbHVnaW4gZm9yIGpRdWVyeVxyXG5cclxuXHRAYXV0aG9yIFRvZGQgRnJhbmNpc1xyXG5cdEB2ZXJzaW9uIDIuMi4zXHJcblxyXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbjsoZnVuY3Rpb24oYix0KXtiLmZuLnBvcHVwPWZ1bmN0aW9uKGgpe3ZhciBxPXRoaXMuc2VsZWN0b3IsbT1uZXcgYi5Qb3B1cChoKTtiKGRvY3VtZW50KS5vbihcImNsaWNrLnBvcHVwXCIscSxmdW5jdGlvbihuKXt2YXIgaz1oJiZoLmNvbnRlbnQ/aC5jb250ZW50OmIodGhpcykuYXR0cihcImhyZWZcIik7bi5wcmV2ZW50RGVmYXVsdCgpO20ub3BlbihrLHZvaWQgMCx0aGlzKX0pO3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXtiKHRoaXMpLmRhdGEoXCJwb3B1cFwiLG0pfSl9O2IuUG9wdXA9ZnVuY3Rpb24oaCl7ZnVuY3Rpb24gcShhKXt2YXIgZDtiLmVhY2goYSxmdW5jdGlvbihhLGMpe2lmKGMpcmV0dXJuIGQ9YywhMX0pO3JldHVybiBkfWZ1bmN0aW9uIG0oYSl7cmV0dXJuXCJmdW5jdGlvblwiPT09dHlwZW9mIGE/XCJmdW5jdGlvblwiOmEgaW5zdGFuY2VvZiBiP1wialF1ZXJ5XCI6XCIjXCI9PT1hLnN1YnN0cigwLDEpfHxcIi5cIj09PWEuc3Vic3RyKDAsMSk/XCJpbmxpbmVcIjotMSE9PWIuaW5BcnJheShhLnN1YnN0cihhLmxlbmd0aC1cclxuMyksdSk/XCJpbWFnZVwiOlwiaHR0cFwiPT09YS5zdWJzdHIoMCw0KT9cImV4dGVybmFsXCI6XCJhamF4XCJ9ZnVuY3Rpb24gbihjKXtyJiZyLmZhZGVPdXQoXCJmYXN0XCIsZnVuY3Rpb24oKXtiKHRoaXMpLnJlbW92ZSgpfSk7dmFyIGQ9ITA7dm9pZCAwPT09ZiYmKGQ9ITEsZj1iKCc8ZGl2IGNsYXNzPVwiJythLm8uY29udGFpbmVyQ2xhc3MrJ1wiPicpLHA9YihhLm8ubWFya3VwKS5hcHBlbmRUbyhmKSxiKGEuby5jbG9zZUNvbnRlbnQpLm9uZShcImNsaWNrXCIsZnVuY3Rpb24oKXthLmNsb3NlKCl9KS5hcHBlbmRUbyhmKSxiKHQpLnJlc2l6ZShhLmNlbnRlciksZi5hcHBlbmRUbyhiKFwiYm9keVwiKSkuY3NzKFwib3BhY2l0eVwiLDApKTt2YXIgZT1iKFwiLlwiK2Euby5jb250ZW50Q2xhc3MsZik7YS53aWR0aD9lLmNzcyhcIndpZHRoXCIsYS53aWR0aCwxMCk6ZS5jc3MoXCJ3aWR0aFwiLFwiXCIpO2EuaGVpZ2h0P2UuY3NzKFwiaGVpZ2h0XCIsYS5oZWlnaHQsMTApOmUuY3NzKFwiaGVpZ2h0XCIsXCJcIik7cC5oYXNDbGFzcyhhLm8uY29udGVudENsYXNzKT9cclxucC5odG1sKGMpOnAuZmluZChcIi5cIithLm8uY29udGVudENsYXNzKS5odG1sKGMpO2Q/YS5vLnJlcGxhY2VkLmNhbGwoYSxmLGcpOmEuby5zaG93LmNhbGwoYSxmLGcpfWZ1bmN0aW9uIGsoYSxkKXt2YXIgYj0obmV3IFJlZ0V4cChcIls/Jl1cIithK1wiPShbXiZdKilcIikpLmV4ZWMoZCk7cmV0dXJuIGImJmRlY29kZVVSSUNvbXBvbmVudChiWzFdLnJlcGxhY2UoL1xcKy9nLFwiIFwiKSl9dmFyIGE9dGhpcyx1PVtcInBuZ1wiLFwianBnXCIsXCJnaWZcIl0sbCxzLGcsZixyLHA7YS5lbGU9dm9pZCAwO2Eubz1iLmV4dGVuZCghMCx7fSx7YmFja0NsYXNzOlwicG9wdXBfYmFja1wiLGJhY2tPcGFjaXR5Oi43LGNvbnRhaW5lckNsYXNzOlwicG9wdXBfY29udFwiLGNsb3NlQ29udGVudDonPGRpdiBjbGFzcz1cInBvcHVwX2Nsb3NlXCI+JnRpbWVzOzwvZGl2PicsbWFya3VwOic8ZGl2IGNsYXNzPVwicG9wdXBcIj48ZGl2IGNsYXNzPVwicG9wdXBfY29udGVudFwiLz48L2Rpdj4nLGNvbnRlbnRDbGFzczpcInBvcHVwX2NvbnRlbnRcIixcclxucHJlbG9hZGVyQ29udGVudDonPHAgY2xhc3M9XCJwcmVsb2FkZXJcIj5Mb2FkaW5nPC9wPicsYWN0aXZlQ2xhc3M6XCJwb3B1cF9hY3RpdmVcIixoaWRlRmxhc2g6ITEsc3BlZWQ6MjAwLHBvcHVwUGxhY2Vob2xkZXJDbGFzczpcInBvcHVwX3BsYWNlaG9sZGVyXCIsa2VlcElubGluZUNoYW5nZXM6ITAsbW9kYWw6ITEsY29udGVudDpudWxsLHR5cGU6XCJhdXRvXCIsd2lkdGg6bnVsbCxoZWlnaHQ6bnVsbCx0eXBlUGFyYW06XCJwdFwiLHdpZHRoUGFyYW06XCJwd1wiLGhlaWdodFBhcmFtOlwicGhcIixiZWZvcmVPcGVuOmZ1bmN0aW9uKGEpe30sYWZ0ZXJPcGVuOmZ1bmN0aW9uKCl7fSxiZWZvcmVDbG9zZTpmdW5jdGlvbigpe30sYWZ0ZXJDbG9zZTpmdW5jdGlvbigpe30sZXJyb3I6ZnVuY3Rpb24oKXt9LHNob3c6ZnVuY3Rpb24oYSxiKXt2YXIgZT10aGlzO2UuY2VudGVyKCk7YS5hbmltYXRlKHtvcGFjaXR5OjF9LGUuby5zcGVlZCxmdW5jdGlvbigpe2Uuby5hZnRlck9wZW4uY2FsbChlKX0pfSxyZXBsYWNlZDpmdW5jdGlvbihhLFxyXG5iKXt0aGlzLmNlbnRlcigpLm8uYWZ0ZXJPcGVuLmNhbGwodGhpcyl9LGhpZGU6ZnVuY3Rpb24oYSxiKXt2b2lkIDAhPT1hJiZhLmFuaW1hdGUoe29wYWNpdHk6MH0sdGhpcy5vLnNwZWVkKX0sdHlwZXM6e2lubGluZTpmdW5jdGlvbihjLGQpe3ZhciBlPWIoYyk7ZS5hZGRDbGFzcyhhLm8ucG9wdXBQbGFjZWhvbGRlckNsYXNzKTthLm8ua2VlcElubGluZUNoYW5nZXN8fChzPWUuaHRtbCgpKTtkLmNhbGwodGhpcyxlLmNoaWxkcmVuKCkpfSxpbWFnZTpmdW5jdGlvbihjLGQpe3ZhciBlPXRoaXM7YihcIjxpbWcgLz5cIikub25lKFwibG9hZFwiLGZ1bmN0aW9uKCl7dmFyIGE9dGhpcztzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZC5jYWxsKGUsYSl9LDApfSkub25lKFwiZXJyb3JcIixmdW5jdGlvbigpe2Euby5lcnJvci5jYWxsKGEsYyxcImltYWdlXCIpfSkuYXR0cihcInNyY1wiLGMpLmVhY2goZnVuY3Rpb24oKXt0aGlzLmNvbXBsZXRlJiZiKHRoaXMpLnRyaWdnZXIoXCJsb2FkXCIpfSl9LGV4dGVybmFsOmZ1bmN0aW9uKGMsXHJcbmQpe3ZhciBlPWIoXCI8aWZyYW1lIC8+XCIpLmF0dHIoe3NyYzpjLGZyYW1lYm9yZGVyOjAsd2lkdGg6YS53aWR0aCxoZWlnaHQ6YS5oZWlnaHR9KTtkLmNhbGwodGhpcyxlKX0saHRtbDpmdW5jdGlvbihhLGIpe2IuY2FsbCh0aGlzLGEpfSxqUXVlcnk6ZnVuY3Rpb24oYSxiKXtiLmNhbGwodGhpcyxhLmh0bWwoKSl9LFwiZnVuY3Rpb25cIjpmdW5jdGlvbihiLGQpe2QuY2FsbCh0aGlzLGIuY2FsbChhKSl9LGFqYXg6ZnVuY3Rpb24oYyxkKXtiLmFqYXgoe3VybDpjLHN1Y2Nlc3M6ZnVuY3Rpb24oYSl7ZC5jYWxsKHRoaXMsYSl9LGVycm9yOmZ1bmN0aW9uKGIpe2Euby5lcnJvci5jYWxsKGEsYyxcImFqYXhcIil9fSl9fX0saCk7YS5vcGVuPWZ1bmN0aW9uKGMsZCxlKXtjPXZvaWQgMD09PWN8fFwiI1wiPT09Yz9hLm8uY29udGVudDpjO2lmKG51bGw9PT1jKXJldHVybiBhLm8uZXJyb3IuY2FsbChhLGMsbCksITE7dm9pZCAwIT09ZSYmKGEuZWxlJiZhLm8uYWN0aXZlQ2xhc3MmJmIoYS5lbGUpLnJlbW92ZUNsYXNzKGEuby5hY3RpdmVDbGFzcyksXHJcbmEuZWxlPWUsYS5lbGUmJmEuby5hY3RpdmVDbGFzcyYmYihhLmVsZSkuYWRkQ2xhc3MoYS5vLmFjdGl2ZUNsYXNzKSk7aWYodm9pZCAwPT09Zyl7Zz1iKCc8ZGl2IGNsYXNzPVwiJythLm8uYmFja0NsYXNzKydcIi8+JykuYXBwZW5kVG8oYihcImJvZHlcIikpLmNzcyhcIm9wYWNpdHlcIiwwKS5hbmltYXRlKHtvcGFjaXR5OmEuby5iYWNrT3BhY2l0eX0sYS5vLnNwZWVkKTtpZighYS5vLm1vZGFsKWcub25lKFwiY2xpY2sucG9wdXBcIixmdW5jdGlvbigpe2EuY2xvc2UoKX0pO2Euby5oaWRlRmxhc2gmJmIoXCJvYmplY3QsIGVtYmVkXCIpLmNzcyhcInZpc2liaWxpdHlcIixcImhpZGRlblwiKTthLm8ucHJlbG9hZGVyQ29udGVudCYmKHI9YihhLm8ucHJlbG9hZGVyQ29udGVudCkuYXBwZW5kVG8oYihcImJvZHlcIikpKX1kPXEoW2QsYS5vLnR5cGVdKTtsPWQ9XCJhdXRvXCI9PT1kP20oYyk6ZDthLndpZHRoPWEuby53aWR0aD9hLm8ud2lkdGg6bnVsbDthLmhlaWdodD1hLm8uaGVpZ2h0P2Euby5oZWlnaHQ6bnVsbDtcclxuaWYoLTE9PT1iLmluQXJyYXkoZCxbXCJpbmxpbmVcIixcImpRdWVyeVwiLFwiZnVuY3Rpb25cIl0pKXtlPWsoYS5vLnR5cGVQYXJhbSxjKTt2YXIgZj1rKGEuby53aWR0aFBhcmFtLGMpLGg9ayhhLm8uaGVpZ2h0UGFyYW0sYyk7ZD1udWxsIT09ZT9lOmQ7YS53aWR0aD1udWxsIT09Zj9mOmEud2lkdGg7YS5oZWlnaHQ9bnVsbCE9PWg/aDphLmhlaWdodH1hLm8uYmVmb3JlT3Blbi5jYWxsKGEsZCk7YS5vLnR5cGVzW2RdP2Euby50eXBlc1tkXS5jYWxsKGEsYyxuKTphLm8udHlwZXMuYWpheC5jYWxsKGEsYyxuKX07YS5jbG9zZT1mdW5jdGlvbigpe2Euby5iZWZvcmVDbG9zZS5jYWxsKGEpO1wiaW5saW5lXCI9PT1sJiZhLm8ua2VlcElubGluZUNoYW5nZXMmJihzPWIoXCIuXCIrYS5vLmNvbnRlbnRDbGFzcykuaHRtbCgpKTt2b2lkIDAhPT1nJiZnLmFuaW1hdGUoe29wYWNpdHk6MH0sYS5vLnNwZWVkLGZ1bmN0aW9uKCl7YS5jbGVhblVwKCl9KTthLm8uaGlkZS5jYWxsKGEsZixnKTtyZXR1cm4gYX07YS5jbGVhblVwPVxyXG5mdW5jdGlvbigpe2cuYWRkKGYpLnJlbW92ZSgpO2Y9Zz12b2lkIDA7Yih0KS51bmJpbmQoXCJyZXNpemVcIixhLmNlbnRlcik7YS5vLmhpZGVGbGFzaCYmYihcIm9iamVjdCwgZW1iZWRcIikuY3NzKFwidmlzaWJpbGl0eVwiLFwidmlzaWJsZVwiKTthLmVsZSYmYS5vLmFjdGl2ZUNsYXNzJiZiKGEuZWxlKS5yZW1vdmVDbGFzcyhhLm8uYWN0aXZlQ2xhc3MpO3ZhciBjPWIoXCIuXCIrYS5vLnBvcHVwUGxhY2Vob2xkZXJDbGFzcyk7XCJpbmxpbmVcIj09bCYmYy5sZW5ndGgmJmMuaHRtbChzKS5yZW1vdmVDbGFzcyhhLm8ucG9wdXBQbGFjZWhvbGRlckNsYXNzKTtsPW51bGw7YS5vLmFmdGVyQ2xvc2UuY2FsbChhKTtyZXR1cm4gYX07YS5jZW50ZXI9ZnVuY3Rpb24oKXtmLmNzcyhhLmdldENlbnRlcigpKTtnLmNzcyh7aGVpZ2h0OmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHR9KTtyZXR1cm4gYX07YS5nZXRDZW50ZXI9ZnVuY3Rpb24oKXt2YXIgYT1mLmNoaWxkcmVuKCkub3V0ZXJXaWR0aCghMCksXHJcbmI9Zi5jaGlsZHJlbigpLm91dGVySGVpZ2h0KCEwKTtyZXR1cm57dG9wOi41KmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQtLjUqYixsZWZ0Oi41KmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aC0uNSphfX19fSkoalF1ZXJ5LHdpbmRvdyk7IiwiOyhmdW5jdGlvbiAoICQsIHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCApIHtcclxuXHJcbiAgLyoqXHJcbiAgICogYW5pbW8gaXMgYSBwb3dlcmZ1bCBsaXR0bGUgdG9vbCB0aGF0IG1ha2VzIG1hbmFnaW5nIENTUyBhbmltYXRpb25zIGV4dHJlbWVseSBlYXN5LiBTdGFjayBhbmltYXRpb25zLCBzZXQgY2FsbGJhY2tzLCBtYWtlIG1hZ2ljLlxyXG4gICAqIE1vZGVybiBicm93c2VycyBhbmQgYWxtb3N0IGFsbCBtb2JpbGUgYnJvd3NlcnMgc3VwcG9ydCBDU1MgYW5pbWF0aW9ucyAoaHR0cDovL2Nhbml1c2UuY29tL2Nzcy1hbmltYXRpb24pLlxyXG4gICAqXHJcbiAgICogQGF1dGhvciBEYW5pZWwgUmFmdGVyeSA6IHR3aXR0ZXIvVGhyaXZpbmdLaW5nc1xyXG4gICAqIEB2ZXJzaW9uIDEuMC4xXHJcbiAgKi9cclxuICBmdW5jdGlvbiBhbmltbyggZWxlbWVudCwgb3B0aW9ucywgY2FsbGJhY2ssIG90aGVyX2NiICkge1xyXG4gICAgXHJcbiAgICAvLyBEZWZhdWx0IGNvbmZpZ3VyYXRpb25cclxuICAgIHZhciBkZWZhdWx0cyA9IHtcclxuICAgIFx0ZHVyYXRpb246IDEsXHJcbiAgICBcdGFuaW1hdGlvbjogbnVsbCxcclxuICAgIFx0aXRlcmF0ZTogMSxcclxuICAgIFx0dGltaW5nOiBcImxpbmVhclwiLFxyXG4gICAgICBrZWVwOiBmYWxzZVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBCcm93c2VyIHByZWZpeGVzIGZvciBDU1NcclxuICAgIHRoaXMucHJlZml4ZXMgPSBbXCJcIiwgXCItbW96LVwiLCBcIi1vLWFuaW1hdGlvbi1cIiwgXCItd2Via2l0LVwiXTtcclxuXHJcbiAgICAvLyBDYWNoZSB0aGUgZWxlbWVudFxyXG4gICAgdGhpcy5lbGVtZW50ID0gJChlbGVtZW50KTtcclxuXHJcbiAgICB0aGlzLmJhcmUgPSBlbGVtZW50O1xyXG5cclxuICAgIC8vIEZvciBzdGFja2luZyBvZiBhbmltYXRpb25zXHJcbiAgICB0aGlzLnF1ZXVlID0gW107XHJcblxyXG4gICAgLy8gSGFja3lcclxuICAgIHRoaXMubGlzdGVuaW5nID0gZmFsc2U7XHJcblxyXG4gICAgLy8gRmlndXJlIG91dCB3aGVyZSB0aGUgY2FsbGJhY2sgaXNcclxuICAgIHZhciBjYiA9ICh0eXBlb2YgY2FsbGJhY2sgPT0gXCJmdW5jdGlvblwiID8gY2FsbGJhY2sgOiBvdGhlcl9jYik7XHJcblxyXG4gICAgLy8gT3B0aW9ucyBjYW4gc29tZXRpbWVzIGJlIGEgY29tbWFuZFxyXG4gICAgc3dpdGNoKG9wdGlvbnMpIHtcclxuXHJcbiAgICAgIGNhc2UgXCJibHVyXCI6XHJcblxyXG4gICAgICBcdGRlZmF1bHRzID0ge1xyXG4gICAgICBcdFx0YW1vdW50OiAzLFxyXG4gICAgICBcdFx0ZHVyYXRpb246IDAuNSxcclxuICAgICAgXHRcdGZvY3VzQWZ0ZXI6IG51bGxcclxuICAgICAgXHR9O1xyXG5cclxuICAgICAgXHR0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCggZGVmYXVsdHMsIGNhbGxiYWNrICk7XHJcblxyXG4gIFx0ICAgIHRoaXMuX2JsdXIoY2IpO1xyXG5cclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgXCJmb2N1c1wiOlxyXG5cclxuICBcdCAgXHR0aGlzLl9mb2N1cygpO1xyXG5cclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgXCJyb3RhdGVcIjpcclxuXHJcbiAgICAgICAgZGVmYXVsdHMgPSB7XHJcbiAgICAgICAgICBkZWdyZWVzOiAxNSxcclxuICAgICAgICAgIGR1cmF0aW9uOiAwLjVcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCggZGVmYXVsdHMsIGNhbGxiYWNrICk7XHJcblxyXG4gICAgICAgIHRoaXMuX3JvdGF0ZShjYik7XHJcblxyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSBcImNsZWFuc2VcIjpcclxuXHJcbiAgICAgICAgdGhpcy5jbGVhbnNlKCk7XHJcblxyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgZGVmYXVsdDpcclxuXHJcblx0ICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKCBkZWZhdWx0cywgb3B0aW9ucyApO1xyXG5cclxuXHQgICAgdGhpcy5pbml0KGNiKTtcclxuICBcdFxyXG4gICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFuaW1vLnByb3RvdHlwZSA9IHtcclxuXHJcbiAgICAvLyBBIHN0YW5kYXJkIENTUyBhbmltYXRpb25cclxuICAgIGluaXQ6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgICAgIFxyXG4gICAgICB2YXIgJG1lID0gdGhpcztcclxuXHJcbiAgICAgIC8vIEFyZSB3ZSBzdGFja2luZyBhbmltYXRpb25zP1xyXG4gICAgICBpZihPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoICRtZS5vcHRpb25zLmFuaW1hdGlvbiApID09PSAnW29iamVjdCBBcnJheV0nKSB7XHJcbiAgICAgIFx0JC5tZXJnZSgkbWUucXVldWUsICRtZS5vcHRpb25zLmFuaW1hdGlvbik7XHJcbiAgICAgIH0gZWxzZSB7XHJcblx0ICAgICAgJG1lLnF1ZXVlLnB1c2goJG1lLm9wdGlvbnMuYW5pbWF0aW9uKTtcclxuXHQgICAgfVxyXG5cclxuXHQgICAgJG1lLmNsZWFuc2UoKTtcclxuXHJcblx0ICAgICRtZS5hbmltYXRlKGNhbGxiYWNrKTtcclxuICAgICAgXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIFRoZSBhY3R1YWwgYWRkaW5nIG9mIHRoZSBjbGFzcyBhbmQgbGlzdGVuaW5nIGZvciBjb21wbGV0aW9uXHJcbiAgICBhbmltYXRlOiBmdW5jdGlvbihjYWxsYmFjaykge1xyXG5cclxuICAgIFx0dGhpcy5lbGVtZW50LmFkZENsYXNzKCdhbmltYXRlZCcpO1xyXG5cclxuICAgICAgdGhpcy5lbGVtZW50LmFkZENsYXNzKHRoaXMucXVldWVbMF0pO1xyXG5cclxuICAgICAgdGhpcy5lbGVtZW50LmRhdGEoXCJhbmltb1wiLCB0aGlzLnF1ZXVlWzBdKTtcclxuXHJcbiAgICAgIHZhciBhaSA9IHRoaXMucHJlZml4ZXMubGVuZ3RoO1xyXG5cclxuICAgICAgLy8gQWRkIHRoZSBvcHRpb25zIGZvciBlYWNoIHByZWZpeFxyXG4gICAgICB3aGlsZShhaS0tKSB7XHJcblxyXG4gICAgICBcdHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJhbmltYXRpb24tZHVyYXRpb25cIiwgdGhpcy5vcHRpb25zLmR1cmF0aW9uK1wic1wiKTtcclxuXHJcbiAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcImFuaW1hdGlvbi1pdGVyYXRpb24tY291bnRcIiwgdGhpcy5vcHRpb25zLml0ZXJhdGUpO1xyXG5cclxuICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiYW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvblwiLCB0aGlzLm9wdGlvbnMudGltaW5nKTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciAkbWUgPSB0aGlzLCBfY2IgPSBjYWxsYmFjaztcclxuXHJcbiAgICAgIGlmKCRtZS5xdWV1ZS5sZW5ndGg+MSkge1xyXG4gICAgICAgIF9jYiA9IG51bGw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIExpc3RlbiBmb3IgdGhlIGVuZCBvZiB0aGUgYW5pbWF0aW9uXHJcbiAgICAgIHRoaXMuX2VuZChcIkFuaW1hdGlvbkVuZFwiLCBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG1vcmUsIGNsZWFuIGl0IHVwIGFuZCBtb3ZlIG9uXHJcbiAgICAgIFx0aWYoJG1lLmVsZW1lbnQuaGFzQ2xhc3MoJG1lLnF1ZXVlWzBdKSkge1xyXG5cclxuXHQgICAgXHRcdGlmKCEkbWUub3B0aW9ucy5rZWVwKSB7XHJcbiAgICAgICAgICAgICRtZS5jbGVhbnNlKCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgJG1lLnF1ZXVlLnNoaWZ0KCk7XHJcblxyXG5cdCAgICBcdFx0aWYoJG1lLnF1ZXVlLmxlbmd0aCkge1xyXG5cclxuXHRcdCAgICAgIFx0JG1lLmFuaW1hdGUoY2FsbGJhY2spO1xyXG5cdFx0ICAgICAgfVxyXG5cdFx0XHQgIH1cclxuXHRcdCAgfSwgX2NiKTtcclxuICAgIH0sXHJcblxyXG4gICAgY2xlYW5zZTogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgXHR0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2FuaW1hdGVkJyk7XHJcblxyXG4gIFx0XHR0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3ModGhpcy5xdWV1ZVswXSk7XHJcblxyXG4gICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3ModGhpcy5lbGVtZW50LmRhdGEoXCJhbmltb1wiKSk7XHJcblxyXG4gIFx0XHR2YXIgYWkgPSB0aGlzLnByZWZpeGVzLmxlbmd0aDtcclxuXHJcbiAgXHRcdHdoaWxlKGFpLS0pIHtcclxuXHJcbiAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcImFuaW1hdGlvbi1kdXJhdGlvblwiLCBcIlwiKTtcclxuXHJcbiAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcImFuaW1hdGlvbi1pdGVyYXRpb24tY291bnRcIiwgXCJcIik7XHJcblxyXG4gICAgICBcdHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJhbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uXCIsIFwiXCIpO1xyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1widHJhbnNpdGlvblwiLCBcIlwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcInRyYW5zZm9ybVwiLCBcIlwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcImZpbHRlclwiLCBcIlwiKTtcclxuXHJcbiAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX2JsdXI6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcblxyXG4gICAgICBpZih0aGlzLmVsZW1lbnQuaXMoXCJpbWdcIikpIHtcclxuXHJcbiAgICAgIFx0dmFyIHN2Z19pZCA9IFwic3ZnX1wiICsgKCgoMSArIE1hdGgucmFuZG9tKCkpICogMHgxMDAwMDAwKSB8IDApLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSk7XHJcbiAgICAgIFx0dmFyIGZpbHRlcl9pZCA9IFwiZmlsdGVyX1wiICsgKCgoMSArIE1hdGgucmFuZG9tKCkpICogMHgxMDAwMDAwKSB8IDApLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSk7XHJcblxyXG4gICAgICBcdCQoJ2JvZHknKS5hcHBlbmQoJzxzdmcgdmVyc2lvbj1cIjEuMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiBpZD1cIicrc3ZnX2lkKydcIiBzdHlsZT1cImhlaWdodDowO1wiPjxmaWx0ZXIgaWQ9XCInK2ZpbHRlcl9pZCsnXCI+PGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj1cIicrdGhpcy5vcHRpb25zLmFtb3VudCsnXCIgLz48L2ZpbHRlcj48L3N2Zz4nKTtcclxuXHJcbiAgICAgIFx0dmFyIGFpID0gdGhpcy5wcmVmaXhlcy5sZW5ndGg7XHJcblxyXG4gICAgXHRcdHdoaWxlKGFpLS0pIHtcclxuXHJcbiAgICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiZmlsdGVyXCIsIFwiYmx1cihcIit0aGlzLm9wdGlvbnMuYW1vdW50K1wicHgpXCIpO1xyXG5cclxuICAgICAgICBcdHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJ0cmFuc2l0aW9uXCIsIHRoaXMub3B0aW9ucy5kdXJhdGlvbitcInMgYWxsIGxpbmVhclwiKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKFwiZmlsdGVyXCIsIFwidXJsKCNcIitmaWx0ZXJfaWQrXCIpXCIpO1xyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQuZGF0YShcInN2Z2lkXCIsIHN2Z19pZCk7XHJcbiAgICAgIFxyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICB2YXIgY29sb3IgPSB0aGlzLmVsZW1lbnQuY3NzKCdjb2xvcicpO1xyXG5cclxuICAgICAgICB2YXIgYWkgPSB0aGlzLnByZWZpeGVzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgLy8gQWRkIHRoZSBvcHRpb25zIGZvciBlYWNoIHByZWZpeFxyXG4gICAgICAgIHdoaWxlKGFpLS0pIHtcclxuXHJcbiAgICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1widHJhbnNpdGlvblwiLCBcImFsbCBcIit0aGlzLm9wdGlvbnMuZHVyYXRpb24rXCJzIGxpbmVhclwiKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKFwidGV4dC1zaGFkb3dcIiwgXCIwIDAgXCIrdGhpcy5vcHRpb25zLmFtb3VudCtcInB4IFwiK2NvbG9yKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKFwiY29sb3JcIiwgXCJ0cmFuc3BhcmVudFwiKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5fZW5kKFwiVHJhbnNpdGlvbkVuZFwiLCBudWxsLCBjYWxsYmFjayk7XHJcblxyXG4gICAgICB2YXIgJG1lID0gdGhpcztcclxuXHJcbiAgICAgIGlmKHRoaXMub3B0aW9ucy5mb2N1c0FmdGVyKSB7XHJcblxyXG4gICAgICAgIHZhciBmb2N1c193YWl0ID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgJG1lLl9mb2N1cygpO1xyXG5cclxuICAgICAgICAgIGZvY3VzX3dhaXQgPSB3aW5kb3cuY2xlYXJUaW1lb3V0KGZvY3VzX3dhaXQpO1xyXG5cclxuICAgICAgICB9LCAodGhpcy5vcHRpb25zLmZvY3VzQWZ0ZXIqMTAwMCkpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBfZm9jdXM6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIFx0dmFyIGFpID0gdGhpcy5wcmVmaXhlcy5sZW5ndGg7XHJcblxyXG4gICAgICBpZih0aGlzLmVsZW1lbnQuaXMoXCJpbWdcIikpIHtcclxuXHJcbiAgICBcdFx0d2hpbGUoYWktLSkge1xyXG5cclxuICAgICAgICBcdHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJmaWx0ZXJcIiwgXCJcIik7XHJcblxyXG4gICAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcInRyYW5zaXRpb25cIiwgXCJcIik7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyICRzdmcgPSAkKCcjJyt0aGlzLmVsZW1lbnQuZGF0YSgnc3ZnaWQnKSk7XHJcblxyXG4gICAgICAgICRzdmcucmVtb3ZlKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIHdoaWxlKGFpLS0pIHtcclxuXHJcbiAgICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1widHJhbnNpdGlvblwiLCBcIlwiKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKFwidGV4dC1zaGFkb3dcIiwgXCJcIik7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNzcyhcImNvbG9yXCIsIFwiXCIpO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9yb3RhdGU6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcblxyXG4gICAgICB2YXIgYWkgPSB0aGlzLnByZWZpeGVzLmxlbmd0aDtcclxuXHJcbiAgICAgIC8vIEFkZCB0aGUgb3B0aW9ucyBmb3IgZWFjaCBwcmVmaXhcclxuICAgICAgd2hpbGUoYWktLSkge1xyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1widHJhbnNpdGlvblwiLCBcImFsbCBcIit0aGlzLm9wdGlvbnMuZHVyYXRpb24rXCJzIGxpbmVhclwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcInRyYW5zZm9ybVwiLCBcInJvdGF0ZShcIit0aGlzLm9wdGlvbnMuZGVncmVlcytcImRlZylcIik7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLl9lbmQoXCJUcmFuc2l0aW9uRW5kXCIsIG51bGwsIGNhbGxiYWNrKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIF9lbmQ6IGZ1bmN0aW9uKHR5cGUsIHRvZG8sIGNhbGxiYWNrKSB7XHJcblxyXG4gICAgICB2YXIgJG1lID0gdGhpcztcclxuXHJcbiAgICAgIHZhciBiaW5kaW5nID0gdHlwZS50b0xvd2VyQ2FzZSgpK1wiIHdlYmtpdFwiK3R5cGUrXCIgb1wiK3R5cGUrXCIgTVNcIit0eXBlO1xyXG5cclxuICAgICAgdGhpcy5lbGVtZW50LmJpbmQoYmluZGluZywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgJG1lLmVsZW1lbnQudW5iaW5kKGJpbmRpbmcpO1xyXG5cclxuICAgICAgICBpZih0eXBlb2YgdG9kbyA9PSBcImZ1bmN0aW9uXCIpIHtcclxuXHJcbiAgICAgICAgICB0b2RvKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih0eXBlb2YgY2FsbGJhY2sgPT0gXCJmdW5jdGlvblwiKSB7XHJcblxyXG4gICAgICAgICAgY2FsbGJhY2soJG1lKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICBcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAkLmZuLmFuaW1vID0gZnVuY3Rpb24gKCBvcHRpb25zLCBjYWxsYmFjaywgb3RoZXJfY2IgKSB7XHJcbiAgICBcclxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdFxyXG5cdFx0XHRuZXcgYW5pbW8oIHRoaXMsIG9wdGlvbnMsIGNhbGxiYWNrLCBvdGhlcl9jYiApO1xyXG5cclxuXHRcdH0pO1xyXG5cclxuICB9O1xyXG5cclxufSkoIGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCApOyIsIi8qIVxyXG5XYXlwb2ludHMgLSAzLjEuMVxyXG5Db3B5cmlnaHQgwqkgMjAxMS0yMDE1IENhbGViIFRyb3VnaHRvblxyXG5MaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXHJcbmh0dHBzOi8vZ2l0aHViLmNvbS9pbWFrZXdlYnRoaW5ncy93YXlwb2ludHMvYmxvZy9tYXN0ZXIvbGljZW5zZXMudHh0XHJcbiovXHJcbiFmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHQobyl7aWYoIW8pdGhyb3cgbmV3IEVycm9yKFwiTm8gb3B0aW9ucyBwYXNzZWQgdG8gV2F5cG9pbnQgY29uc3RydWN0b3JcIik7aWYoIW8uZWxlbWVudCl0aHJvdyBuZXcgRXJyb3IoXCJObyBlbGVtZW50IG9wdGlvbiBwYXNzZWQgdG8gV2F5cG9pbnQgY29uc3RydWN0b3JcIik7aWYoIW8uaGFuZGxlcil0aHJvdyBuZXcgRXJyb3IoXCJObyBoYW5kbGVyIG9wdGlvbiBwYXNzZWQgdG8gV2F5cG9pbnQgY29uc3RydWN0b3JcIik7dGhpcy5rZXk9XCJ3YXlwb2ludC1cIitlLHRoaXMub3B0aW9ucz10LkFkYXB0ZXIuZXh0ZW5kKHt9LHQuZGVmYXVsdHMsbyksdGhpcy5lbGVtZW50PXRoaXMub3B0aW9ucy5lbGVtZW50LHRoaXMuYWRhcHRlcj1uZXcgdC5BZGFwdGVyKHRoaXMuZWxlbWVudCksdGhpcy5jYWxsYmFjaz1vLmhhbmRsZXIsdGhpcy5heGlzPXRoaXMub3B0aW9ucy5ob3Jpem9udGFsP1wiaG9yaXpvbnRhbFwiOlwidmVydGljYWxcIix0aGlzLmVuYWJsZWQ9dGhpcy5vcHRpb25zLmVuYWJsZWQsdGhpcy50cmlnZ2VyUG9pbnQ9bnVsbCx0aGlzLmdyb3VwPXQuR3JvdXAuZmluZE9yQ3JlYXRlKHtuYW1lOnRoaXMub3B0aW9ucy5ncm91cCxheGlzOnRoaXMuYXhpc30pLHRoaXMuY29udGV4dD10LkNvbnRleHQuZmluZE9yQ3JlYXRlQnlFbGVtZW50KHRoaXMub3B0aW9ucy5jb250ZXh0KSx0Lm9mZnNldEFsaWFzZXNbdGhpcy5vcHRpb25zLm9mZnNldF0mJih0aGlzLm9wdGlvbnMub2Zmc2V0PXQub2Zmc2V0QWxpYXNlc1t0aGlzLm9wdGlvbnMub2Zmc2V0XSksdGhpcy5ncm91cC5hZGQodGhpcyksdGhpcy5jb250ZXh0LmFkZCh0aGlzKSxpW3RoaXMua2V5XT10aGlzLGUrPTF9dmFyIGU9MCxpPXt9O3QucHJvdG90eXBlLnF1ZXVlVHJpZ2dlcj1mdW5jdGlvbih0KXt0aGlzLmdyb3VwLnF1ZXVlVHJpZ2dlcih0aGlzLHQpfSx0LnByb3RvdHlwZS50cmlnZ2VyPWZ1bmN0aW9uKHQpe3RoaXMuZW5hYmxlZCYmdGhpcy5jYWxsYmFjayYmdGhpcy5jYWxsYmFjay5hcHBseSh0aGlzLHQpfSx0LnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5jb250ZXh0LnJlbW92ZSh0aGlzKSx0aGlzLmdyb3VwLnJlbW92ZSh0aGlzKSxkZWxldGUgaVt0aGlzLmtleV19LHQucHJvdG90eXBlLmRpc2FibGU9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5lbmFibGVkPSExLHRoaXN9LHQucHJvdG90eXBlLmVuYWJsZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLmNvbnRleHQucmVmcmVzaCgpLHRoaXMuZW5hYmxlZD0hMCx0aGlzfSx0LnByb3RvdHlwZS5uZXh0PWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZ3JvdXAubmV4dCh0aGlzKX0sdC5wcm90b3R5cGUucHJldmlvdXM9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5ncm91cC5wcmV2aW91cyh0aGlzKX0sdC5pbnZva2VBbGw9ZnVuY3Rpb24odCl7dmFyIGU9W107Zm9yKHZhciBvIGluIGkpZS5wdXNoKGlbb10pO2Zvcih2YXIgbj0wLHI9ZS5sZW5ndGg7cj5uO24rKyllW25dW3RdKCl9LHQuZGVzdHJveUFsbD1mdW5jdGlvbigpe3QuaW52b2tlQWxsKFwiZGVzdHJveVwiKX0sdC5kaXNhYmxlQWxsPWZ1bmN0aW9uKCl7dC5pbnZva2VBbGwoXCJkaXNhYmxlXCIpfSx0LmVuYWJsZUFsbD1mdW5jdGlvbigpe3QuaW52b2tlQWxsKFwiZW5hYmxlXCIpfSx0LnJlZnJlc2hBbGw9ZnVuY3Rpb24oKXt0LkNvbnRleHQucmVmcmVzaEFsbCgpfSx0LnZpZXdwb3J0SGVpZ2h0PWZ1bmN0aW9uKCl7cmV0dXJuIHdpbmRvdy5pbm5lckhlaWdodHx8ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodH0sdC52aWV3cG9ydFdpZHRoPWZ1bmN0aW9uKCl7cmV0dXJuIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aH0sdC5hZGFwdGVycz1bXSx0LmRlZmF1bHRzPXtjb250ZXh0OndpbmRvdyxjb250aW51b3VzOiEwLGVuYWJsZWQ6ITAsZ3JvdXA6XCJkZWZhdWx0XCIsaG9yaXpvbnRhbDohMSxvZmZzZXQ6MH0sdC5vZmZzZXRBbGlhc2VzPXtcImJvdHRvbS1pbi12aWV3XCI6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5jb250ZXh0LmlubmVySGVpZ2h0KCktdGhpcy5hZGFwdGVyLm91dGVySGVpZ2h0KCl9LFwicmlnaHQtaW4tdmlld1wiOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuY29udGV4dC5pbm5lcldpZHRoKCktdGhpcy5hZGFwdGVyLm91dGVyV2lkdGgoKX19LHdpbmRvdy5XYXlwb2ludD10fSgpLGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gdCh0KXt3aW5kb3cuc2V0VGltZW91dCh0LDFlMy82MCl9ZnVuY3Rpb24gZSh0KXt0aGlzLmVsZW1lbnQ9dCx0aGlzLkFkYXB0ZXI9bi5BZGFwdGVyLHRoaXMuYWRhcHRlcj1uZXcgdGhpcy5BZGFwdGVyKHQpLHRoaXMua2V5PVwid2F5cG9pbnQtY29udGV4dC1cIitpLHRoaXMuZGlkU2Nyb2xsPSExLHRoaXMuZGlkUmVzaXplPSExLHRoaXMub2xkU2Nyb2xsPXt4OnRoaXMuYWRhcHRlci5zY3JvbGxMZWZ0KCkseTp0aGlzLmFkYXB0ZXIuc2Nyb2xsVG9wKCl9LHRoaXMud2F5cG9pbnRzPXt2ZXJ0aWNhbDp7fSxob3Jpem9udGFsOnt9fSx0LndheXBvaW50Q29udGV4dEtleT10aGlzLmtleSxvW3Qud2F5cG9pbnRDb250ZXh0S2V5XT10aGlzLGkrPTEsdGhpcy5jcmVhdGVUaHJvdHRsZWRTY3JvbGxIYW5kbGVyKCksdGhpcy5jcmVhdGVUaHJvdHRsZWRSZXNpemVIYW5kbGVyKCl9dmFyIGk9MCxvPXt9LG49d2luZG93LldheXBvaW50LHI9d2luZG93Lm9ubG9hZDtlLnByb3RvdHlwZS5hZGQ9ZnVuY3Rpb24odCl7dmFyIGU9dC5vcHRpb25zLmhvcml6b250YWw/XCJob3Jpem9udGFsXCI6XCJ2ZXJ0aWNhbFwiO3RoaXMud2F5cG9pbnRzW2VdW3Qua2V5XT10LHRoaXMucmVmcmVzaCgpfSxlLnByb3RvdHlwZS5jaGVja0VtcHR5PWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5BZGFwdGVyLmlzRW1wdHlPYmplY3QodGhpcy53YXlwb2ludHMuaG9yaXpvbnRhbCksZT10aGlzLkFkYXB0ZXIuaXNFbXB0eU9iamVjdCh0aGlzLndheXBvaW50cy52ZXJ0aWNhbCk7dCYmZSYmKHRoaXMuYWRhcHRlci5vZmYoXCIud2F5cG9pbnRzXCIpLGRlbGV0ZSBvW3RoaXMua2V5XSl9LGUucHJvdG90eXBlLmNyZWF0ZVRocm90dGxlZFJlc2l6ZUhhbmRsZXI9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KCl7ZS5oYW5kbGVSZXNpemUoKSxlLmRpZFJlc2l6ZT0hMX12YXIgZT10aGlzO3RoaXMuYWRhcHRlci5vbihcInJlc2l6ZS53YXlwb2ludHNcIixmdW5jdGlvbigpe2UuZGlkUmVzaXplfHwoZS5kaWRSZXNpemU9ITAsbi5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodCkpfSl9LGUucHJvdG90eXBlLmNyZWF0ZVRocm90dGxlZFNjcm9sbEhhbmRsZXI9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KCl7ZS5oYW5kbGVTY3JvbGwoKSxlLmRpZFNjcm9sbD0hMX12YXIgZT10aGlzO3RoaXMuYWRhcHRlci5vbihcInNjcm9sbC53YXlwb2ludHNcIixmdW5jdGlvbigpeyghZS5kaWRTY3JvbGx8fG4uaXNUb3VjaCkmJihlLmRpZFNjcm9sbD0hMCxuLnJlcXVlc3RBbmltYXRpb25GcmFtZSh0KSl9KX0sZS5wcm90b3R5cGUuaGFuZGxlUmVzaXplPWZ1bmN0aW9uKCl7bi5Db250ZXh0LnJlZnJlc2hBbGwoKX0sZS5wcm90b3R5cGUuaGFuZGxlU2Nyb2xsPWZ1bmN0aW9uKCl7dmFyIHQ9e30sZT17aG9yaXpvbnRhbDp7bmV3U2Nyb2xsOnRoaXMuYWRhcHRlci5zY3JvbGxMZWZ0KCksb2xkU2Nyb2xsOnRoaXMub2xkU2Nyb2xsLngsZm9yd2FyZDpcInJpZ2h0XCIsYmFja3dhcmQ6XCJsZWZ0XCJ9LHZlcnRpY2FsOntuZXdTY3JvbGw6dGhpcy5hZGFwdGVyLnNjcm9sbFRvcCgpLG9sZFNjcm9sbDp0aGlzLm9sZFNjcm9sbC55LGZvcndhcmQ6XCJkb3duXCIsYmFja3dhcmQ6XCJ1cFwifX07Zm9yKHZhciBpIGluIGUpe3ZhciBvPWVbaV0sbj1vLm5ld1Njcm9sbD5vLm9sZFNjcm9sbCxyPW4/by5mb3J3YXJkOm8uYmFja3dhcmQ7Zm9yKHZhciBzIGluIHRoaXMud2F5cG9pbnRzW2ldKXt2YXIgYT10aGlzLndheXBvaW50c1tpXVtzXSxsPW8ub2xkU2Nyb2xsPGEudHJpZ2dlclBvaW50LGg9by5uZXdTY3JvbGw+PWEudHJpZ2dlclBvaW50LHA9bCYmaCx1PSFsJiYhaDsocHx8dSkmJihhLnF1ZXVlVHJpZ2dlcihyKSx0W2EuZ3JvdXAuaWRdPWEuZ3JvdXApfX1mb3IodmFyIGMgaW4gdCl0W2NdLmZsdXNoVHJpZ2dlcnMoKTt0aGlzLm9sZFNjcm9sbD17eDplLmhvcml6b250YWwubmV3U2Nyb2xsLHk6ZS52ZXJ0aWNhbC5uZXdTY3JvbGx9fSxlLnByb3RvdHlwZS5pbm5lckhlaWdodD1mdW5jdGlvbigpe3JldHVybiB0aGlzLmVsZW1lbnQ9PXRoaXMuZWxlbWVudC53aW5kb3c/bi52aWV3cG9ydEhlaWdodCgpOnRoaXMuYWRhcHRlci5pbm5lckhlaWdodCgpfSxlLnByb3RvdHlwZS5yZW1vdmU9ZnVuY3Rpb24odCl7ZGVsZXRlIHRoaXMud2F5cG9pbnRzW3QuYXhpc11bdC5rZXldLHRoaXMuY2hlY2tFbXB0eSgpfSxlLnByb3RvdHlwZS5pbm5lcldpZHRoPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZWxlbWVudD09dGhpcy5lbGVtZW50LndpbmRvdz9uLnZpZXdwb3J0V2lkdGgoKTp0aGlzLmFkYXB0ZXIuaW5uZXJXaWR0aCgpfSxlLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dmFyIHQ9W107Zm9yKHZhciBlIGluIHRoaXMud2F5cG9pbnRzKWZvcih2YXIgaSBpbiB0aGlzLndheXBvaW50c1tlXSl0LnB1c2godGhpcy53YXlwb2ludHNbZV1baV0pO2Zvcih2YXIgbz0wLG49dC5sZW5ndGg7bj5vO28rKyl0W29dLmRlc3Ryb3koKX0sZS5wcm90b3R5cGUucmVmcmVzaD1mdW5jdGlvbigpe3ZhciB0LGU9dGhpcy5lbGVtZW50PT10aGlzLmVsZW1lbnQud2luZG93LGk9dGhpcy5hZGFwdGVyLm9mZnNldCgpLG89e307dGhpcy5oYW5kbGVTY3JvbGwoKSx0PXtob3Jpem9udGFsOntjb250ZXh0T2Zmc2V0OmU/MDppLmxlZnQsY29udGV4dFNjcm9sbDplPzA6dGhpcy5vbGRTY3JvbGwueCxjb250ZXh0RGltZW5zaW9uOnRoaXMuaW5uZXJXaWR0aCgpLG9sZFNjcm9sbDp0aGlzLm9sZFNjcm9sbC54LGZvcndhcmQ6XCJyaWdodFwiLGJhY2t3YXJkOlwibGVmdFwiLG9mZnNldFByb3A6XCJsZWZ0XCJ9LHZlcnRpY2FsOntjb250ZXh0T2Zmc2V0OmU/MDppLnRvcCxjb250ZXh0U2Nyb2xsOmU/MDp0aGlzLm9sZFNjcm9sbC55LGNvbnRleHREaW1lbnNpb246dGhpcy5pbm5lckhlaWdodCgpLG9sZFNjcm9sbDp0aGlzLm9sZFNjcm9sbC55LGZvcndhcmQ6XCJkb3duXCIsYmFja3dhcmQ6XCJ1cFwiLG9mZnNldFByb3A6XCJ0b3BcIn19O2Zvcih2YXIgbiBpbiB0KXt2YXIgcj10W25dO2Zvcih2YXIgcyBpbiB0aGlzLndheXBvaW50c1tuXSl7dmFyIGEsbCxoLHAsdSxjPXRoaXMud2F5cG9pbnRzW25dW3NdLGQ9Yy5vcHRpb25zLm9mZnNldCxmPWMudHJpZ2dlclBvaW50LHc9MCx5PW51bGw9PWY7Yy5lbGVtZW50IT09Yy5lbGVtZW50LndpbmRvdyYmKHc9Yy5hZGFwdGVyLm9mZnNldCgpW3Iub2Zmc2V0UHJvcF0pLFwiZnVuY3Rpb25cIj09dHlwZW9mIGQ/ZD1kLmFwcGx5KGMpOlwic3RyaW5nXCI9PXR5cGVvZiBkJiYoZD1wYXJzZUZsb2F0KGQpLGMub3B0aW9ucy5vZmZzZXQuaW5kZXhPZihcIiVcIik+LTEmJihkPU1hdGguY2VpbChyLmNvbnRleHREaW1lbnNpb24qZC8xMDApKSksYT1yLmNvbnRleHRTY3JvbGwtci5jb250ZXh0T2Zmc2V0LGMudHJpZ2dlclBvaW50PXcrYS1kLGw9ZjxyLm9sZFNjcm9sbCxoPWMudHJpZ2dlclBvaW50Pj1yLm9sZFNjcm9sbCxwPWwmJmgsdT0hbCYmIWgsIXkmJnA/KGMucXVldWVUcmlnZ2VyKHIuYmFja3dhcmQpLG9bYy5ncm91cC5pZF09Yy5ncm91cCk6IXkmJnU/KGMucXVldWVUcmlnZ2VyKHIuZm9yd2FyZCksb1tjLmdyb3VwLmlkXT1jLmdyb3VwKTp5JiZyLm9sZFNjcm9sbD49Yy50cmlnZ2VyUG9pbnQmJihjLnF1ZXVlVHJpZ2dlcihyLmZvcndhcmQpLG9bYy5ncm91cC5pZF09Yy5ncm91cCl9fWZvcih2YXIgZyBpbiBvKW9bZ10uZmx1c2hUcmlnZ2VycygpO3JldHVybiB0aGlzfSxlLmZpbmRPckNyZWF0ZUJ5RWxlbWVudD1mdW5jdGlvbih0KXtyZXR1cm4gZS5maW5kQnlFbGVtZW50KHQpfHxuZXcgZSh0KX0sZS5yZWZyZXNoQWxsPWZ1bmN0aW9uKCl7Zm9yKHZhciB0IGluIG8pb1t0XS5yZWZyZXNoKCl9LGUuZmluZEJ5RWxlbWVudD1mdW5jdGlvbih0KXtyZXR1cm4gb1t0LndheXBvaW50Q29udGV4dEtleV19LHdpbmRvdy5vbmxvYWQ9ZnVuY3Rpb24oKXtyJiZyKCksZS5yZWZyZXNoQWxsKCl9LG4ucmVxdWVzdEFuaW1hdGlvbkZyYW1lPWZ1bmN0aW9uKGUpe3ZhciBpPXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHQ7aS5jYWxsKHdpbmRvdyxlKX0sbi5Db250ZXh0PWV9KCksZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiB0KHQsZSl7cmV0dXJuIHQudHJpZ2dlclBvaW50LWUudHJpZ2dlclBvaW50fWZ1bmN0aW9uIGUodCxlKXtyZXR1cm4gZS50cmlnZ2VyUG9pbnQtdC50cmlnZ2VyUG9pbnR9ZnVuY3Rpb24gaSh0KXt0aGlzLm5hbWU9dC5uYW1lLHRoaXMuYXhpcz10LmF4aXMsdGhpcy5pZD10aGlzLm5hbWUrXCItXCIrdGhpcy5heGlzLHRoaXMud2F5cG9pbnRzPVtdLHRoaXMuY2xlYXJUcmlnZ2VyUXVldWVzKCksb1t0aGlzLmF4aXNdW3RoaXMubmFtZV09dGhpc312YXIgbz17dmVydGljYWw6e30saG9yaXpvbnRhbDp7fX0sbj13aW5kb3cuV2F5cG9pbnQ7aS5wcm90b3R5cGUuYWRkPWZ1bmN0aW9uKHQpe3RoaXMud2F5cG9pbnRzLnB1c2godCl9LGkucHJvdG90eXBlLmNsZWFyVHJpZ2dlclF1ZXVlcz1mdW5jdGlvbigpe3RoaXMudHJpZ2dlclF1ZXVlcz17dXA6W10sZG93bjpbXSxsZWZ0OltdLHJpZ2h0OltdfX0saS5wcm90b3R5cGUuZmx1c2hUcmlnZ2Vycz1mdW5jdGlvbigpe2Zvcih2YXIgaSBpbiB0aGlzLnRyaWdnZXJRdWV1ZXMpe3ZhciBvPXRoaXMudHJpZ2dlclF1ZXVlc1tpXSxuPVwidXBcIj09PWl8fFwibGVmdFwiPT09aTtvLnNvcnQobj9lOnQpO2Zvcih2YXIgcj0wLHM9by5sZW5ndGg7cz5yO3IrPTEpe3ZhciBhPW9bcl07KGEub3B0aW9ucy5jb250aW51b3VzfHxyPT09by5sZW5ndGgtMSkmJmEudHJpZ2dlcihbaV0pfX10aGlzLmNsZWFyVHJpZ2dlclF1ZXVlcygpfSxpLnByb3RvdHlwZS5uZXh0PWZ1bmN0aW9uKGUpe3RoaXMud2F5cG9pbnRzLnNvcnQodCk7dmFyIGk9bi5BZGFwdGVyLmluQXJyYXkoZSx0aGlzLndheXBvaW50cyksbz1pPT09dGhpcy53YXlwb2ludHMubGVuZ3RoLTE7cmV0dXJuIG8/bnVsbDp0aGlzLndheXBvaW50c1tpKzFdfSxpLnByb3RvdHlwZS5wcmV2aW91cz1mdW5jdGlvbihlKXt0aGlzLndheXBvaW50cy5zb3J0KHQpO3ZhciBpPW4uQWRhcHRlci5pbkFycmF5KGUsdGhpcy53YXlwb2ludHMpO3JldHVybiBpP3RoaXMud2F5cG9pbnRzW2ktMV06bnVsbH0saS5wcm90b3R5cGUucXVldWVUcmlnZ2VyPWZ1bmN0aW9uKHQsZSl7dGhpcy50cmlnZ2VyUXVldWVzW2VdLnB1c2godCl9LGkucHJvdG90eXBlLnJlbW92ZT1mdW5jdGlvbih0KXt2YXIgZT1uLkFkYXB0ZXIuaW5BcnJheSh0LHRoaXMud2F5cG9pbnRzKTtlPi0xJiZ0aGlzLndheXBvaW50cy5zcGxpY2UoZSwxKX0saS5wcm90b3R5cGUuZmlyc3Q9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy53YXlwb2ludHNbMF19LGkucHJvdG90eXBlLmxhc3Q9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy53YXlwb2ludHNbdGhpcy53YXlwb2ludHMubGVuZ3RoLTFdfSxpLmZpbmRPckNyZWF0ZT1mdW5jdGlvbih0KXtyZXR1cm4gb1t0LmF4aXNdW3QubmFtZV18fG5ldyBpKHQpfSxuLkdyb3VwPWl9KCksZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiB0KHQpe3RoaXMuJGVsZW1lbnQ9ZSh0KX12YXIgZT13aW5kb3cualF1ZXJ5LGk9d2luZG93LldheXBvaW50O2UuZWFjaChbXCJpbm5lckhlaWdodFwiLFwiaW5uZXJXaWR0aFwiLFwib2ZmXCIsXCJvZmZzZXRcIixcIm9uXCIsXCJvdXRlckhlaWdodFwiLFwib3V0ZXJXaWR0aFwiLFwic2Nyb2xsTGVmdFwiLFwic2Nyb2xsVG9wXCJdLGZ1bmN0aW9uKGUsaSl7dC5wcm90b3R5cGVbaV09ZnVuY3Rpb24oKXt2YXIgdD1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO3JldHVybiB0aGlzLiRlbGVtZW50W2ldLmFwcGx5KHRoaXMuJGVsZW1lbnQsdCl9fSksZS5lYWNoKFtcImV4dGVuZFwiLFwiaW5BcnJheVwiLFwiaXNFbXB0eU9iamVjdFwiXSxmdW5jdGlvbihpLG8pe3Rbb109ZVtvXX0pLGkuYWRhcHRlcnMucHVzaCh7bmFtZTpcImpxdWVyeVwiLEFkYXB0ZXI6dH0pLGkuQWRhcHRlcj10fSgpLGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gdCh0KXtyZXR1cm4gZnVuY3Rpb24oKXt2YXIgaT1bXSxvPWFyZ3VtZW50c1swXTtyZXR1cm4gdC5pc0Z1bmN0aW9uKGFyZ3VtZW50c1swXSkmJihvPXQuZXh0ZW5kKHt9LGFyZ3VtZW50c1sxXSksby5oYW5kbGVyPWFyZ3VtZW50c1swXSksdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIG49dC5leHRlbmQoe30sbyx7ZWxlbWVudDp0aGlzfSk7XCJzdHJpbmdcIj09dHlwZW9mIG4uY29udGV4dCYmKG4uY29udGV4dD10KHRoaXMpLmNsb3Nlc3Qobi5jb250ZXh0KVswXSksaS5wdXNoKG5ldyBlKG4pKX0pLGl9fXZhciBlPXdpbmRvdy5XYXlwb2ludDt3aW5kb3cualF1ZXJ5JiYod2luZG93LmpRdWVyeS5mbi53YXlwb2ludD10KHdpbmRvdy5qUXVlcnkpKSx3aW5kb3cuWmVwdG8mJih3aW5kb3cuWmVwdG8uZm4ud2F5cG9pbnQ9dCh3aW5kb3cuWmVwdG8pKX0oKTsiLCIvKiogQWJzdHJhY3QgYmFzZSBjbGFzcyBmb3IgY29sbGVjdGlvbiBwbHVnaW5zIHYxLjAuMS5cclxuXHRXcml0dGVuIGJ5IEtlaXRoIFdvb2QgKGtid29vZHthdH1paW5ldC5jb20uYXUpIERlY2VtYmVyIDIwMTMuXHJcblx0TGljZW5zZWQgdW5kZXIgdGhlIE1JVCAoaHR0cDovL2tlaXRoLXdvb2QubmFtZS9saWNlbmNlLmh0bWwpIGxpY2Vuc2UuICovXHJcbihmdW5jdGlvbigpe3ZhciBqPWZhbHNlO3dpbmRvdy5KUUNsYXNzPWZ1bmN0aW9uKCl7fTtKUUNsYXNzLmNsYXNzZXM9e307SlFDbGFzcy5leHRlbmQ9ZnVuY3Rpb24gZXh0ZW5kZXIoZil7dmFyIGc9dGhpcy5wcm90b3R5cGU7aj10cnVlO3ZhciBoPW5ldyB0aGlzKCk7aj1mYWxzZTtmb3IodmFyIGkgaW4gZil7aFtpXT10eXBlb2YgZltpXT09J2Z1bmN0aW9uJyYmdHlwZW9mIGdbaV09PSdmdW5jdGlvbic/KGZ1bmN0aW9uKGQsZSl7cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIGI9dGhpcy5fc3VwZXI7dGhpcy5fc3VwZXI9ZnVuY3Rpb24oYSl7cmV0dXJuIGdbZF0uYXBwbHkodGhpcyxhfHxbXSl9O3ZhciBjPWUuYXBwbHkodGhpcyxhcmd1bWVudHMpO3RoaXMuX3N1cGVyPWI7cmV0dXJuIGN9fSkoaSxmW2ldKTpmW2ldfWZ1bmN0aW9uIEpRQ2xhc3MoKXtpZighaiYmdGhpcy5faW5pdCl7dGhpcy5faW5pdC5hcHBseSh0aGlzLGFyZ3VtZW50cyl9fUpRQ2xhc3MucHJvdG90eXBlPWg7SlFDbGFzcy5wcm90b3R5cGUuY29uc3RydWN0b3I9SlFDbGFzcztKUUNsYXNzLmV4dGVuZD1leHRlbmRlcjtyZXR1cm4gSlFDbGFzc319KSgpOyhmdW5jdGlvbigkKXtKUUNsYXNzLmNsYXNzZXMuSlFQbHVnaW49SlFDbGFzcy5leHRlbmQoe25hbWU6J3BsdWdpbicsZGVmYXVsdE9wdGlvbnM6e30scmVnaW9uYWxPcHRpb25zOnt9LF9nZXR0ZXJzOltdLF9nZXRNYXJrZXI6ZnVuY3Rpb24oKXtyZXR1cm4naXMtJyt0aGlzLm5hbWV9LF9pbml0OmZ1bmN0aW9uKCl7JC5leHRlbmQodGhpcy5kZWZhdWx0T3B0aW9ucywodGhpcy5yZWdpb25hbE9wdGlvbnMmJnRoaXMucmVnaW9uYWxPcHRpb25zWycnXSl8fHt9KTt2YXIgYz1jYW1lbENhc2UodGhpcy5uYW1lKTskW2NdPXRoaXM7JC5mbltjXT1mdW5jdGlvbihhKXt2YXIgYj1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsMSk7aWYoJFtjXS5faXNOb3RDaGFpbmVkKGEsYikpe3JldHVybiAkW2NdW2FdLmFwcGx5KCRbY10sW3RoaXNbMF1dLmNvbmNhdChiKSl9cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe2lmKHR5cGVvZiBhPT09J3N0cmluZycpe2lmKGFbMF09PT0nXyd8fCEkW2NdW2FdKXt0aHJvdydVbmtub3duIG1ldGhvZDogJythO30kW2NdW2FdLmFwcGx5KCRbY10sW3RoaXNdLmNvbmNhdChiKSl9ZWxzZXskW2NdLl9hdHRhY2godGhpcyxhKX19KX19LHNldERlZmF1bHRzOmZ1bmN0aW9uKGEpeyQuZXh0ZW5kKHRoaXMuZGVmYXVsdE9wdGlvbnMsYXx8e30pfSxfaXNOb3RDaGFpbmVkOmZ1bmN0aW9uKGEsYil7aWYoYT09PSdvcHRpb24nJiYoYi5sZW5ndGg9PT0wfHwoYi5sZW5ndGg9PT0xJiZ0eXBlb2YgYlswXT09PSdzdHJpbmcnKSkpe3JldHVybiB0cnVlfXJldHVybiAkLmluQXJyYXkoYSx0aGlzLl9nZXR0ZXJzKT4tMX0sX2F0dGFjaDpmdW5jdGlvbihhLGIpe2E9JChhKTtpZihhLmhhc0NsYXNzKHRoaXMuX2dldE1hcmtlcigpKSl7cmV0dXJufWEuYWRkQ2xhc3ModGhpcy5fZ2V0TWFya2VyKCkpO2I9JC5leHRlbmQoe30sdGhpcy5kZWZhdWx0T3B0aW9ucyx0aGlzLl9nZXRNZXRhZGF0YShhKSxifHx7fSk7dmFyIGM9JC5leHRlbmQoe25hbWU6dGhpcy5uYW1lLGVsZW06YSxvcHRpb25zOmJ9LHRoaXMuX2luc3RTZXR0aW5ncyhhLGIpKTthLmRhdGEodGhpcy5uYW1lLGMpO3RoaXMuX3Bvc3RBdHRhY2goYSxjKTt0aGlzLm9wdGlvbihhLGIpfSxfaW5zdFNldHRpbmdzOmZ1bmN0aW9uKGEsYil7cmV0dXJue319LF9wb3N0QXR0YWNoOmZ1bmN0aW9uKGEsYil7fSxfZ2V0TWV0YWRhdGE6ZnVuY3Rpb24oZCl7dHJ5e3ZhciBmPWQuZGF0YSh0aGlzLm5hbWUudG9Mb3dlckNhc2UoKSl8fCcnO2Y9Zi5yZXBsYWNlKC8nL2csJ1wiJyk7Zj1mLnJlcGxhY2UoLyhbYS16QS1aMC05XSspOi9nLGZ1bmN0aW9uKGEsYixpKXt2YXIgYz1mLnN1YnN0cmluZygwLGkpLm1hdGNoKC9cIi9nKTtyZXR1cm4oIWN8fGMubGVuZ3RoJTI9PT0wPydcIicrYisnXCI6JzpiKyc6Jyl9KTtmPSQucGFyc2VKU09OKCd7JytmKyd9Jyk7Zm9yKHZhciBnIGluIGYpe3ZhciBoPWZbZ107aWYodHlwZW9mIGg9PT0nc3RyaW5nJyYmaC5tYXRjaCgvXm5ldyBEYXRlXFwoKC4qKVxcKSQvKSl7ZltnXT1ldmFsKGgpfX1yZXR1cm4gZn1jYXRjaChlKXtyZXR1cm57fX19LF9nZXRJbnN0OmZ1bmN0aW9uKGEpe3JldHVybiAkKGEpLmRhdGEodGhpcy5uYW1lKXx8e319LG9wdGlvbjpmdW5jdGlvbihhLGIsYyl7YT0kKGEpO3ZhciBkPWEuZGF0YSh0aGlzLm5hbWUpO2lmKCFifHwodHlwZW9mIGI9PT0nc3RyaW5nJyYmYz09bnVsbCkpe3ZhciBlPShkfHx7fSkub3B0aW9ucztyZXR1cm4oZSYmYj9lW2JdOmUpfWlmKCFhLmhhc0NsYXNzKHRoaXMuX2dldE1hcmtlcigpKSl7cmV0dXJufXZhciBlPWJ8fHt9O2lmKHR5cGVvZiBiPT09J3N0cmluZycpe2U9e307ZVtiXT1jfXRoaXMuX29wdGlvbnNDaGFuZ2VkKGEsZCxlKTskLmV4dGVuZChkLm9wdGlvbnMsZSl9LF9vcHRpb25zQ2hhbmdlZDpmdW5jdGlvbihhLGIsYyl7fSxkZXN0cm95OmZ1bmN0aW9uKGEpe2E9JChhKTtpZighYS5oYXNDbGFzcyh0aGlzLl9nZXRNYXJrZXIoKSkpe3JldHVybn10aGlzLl9wcmVEZXN0cm95KGEsdGhpcy5fZ2V0SW5zdChhKSk7YS5yZW1vdmVEYXRhKHRoaXMubmFtZSkucmVtb3ZlQ2xhc3ModGhpcy5fZ2V0TWFya2VyKCkpfSxfcHJlRGVzdHJveTpmdW5jdGlvbihhLGIpe319KTtmdW5jdGlvbiBjYW1lbENhc2UoYyl7cmV0dXJuIGMucmVwbGFjZSgvLShbYS16XSkvZyxmdW5jdGlvbihhLGIpe3JldHVybiBiLnRvVXBwZXJDYXNlKCl9KX0kLkpRUGx1Z2luPXtjcmVhdGVQbHVnaW46ZnVuY3Rpb24oYSxiKXtpZih0eXBlb2YgYT09PSdvYmplY3QnKXtiPWE7YT0nSlFQbHVnaW4nfWE9Y2FtZWxDYXNlKGEpO3ZhciBjPWNhbWVsQ2FzZShiLm5hbWUpO0pRQ2xhc3MuY2xhc3Nlc1tjXT1KUUNsYXNzLmNsYXNzZXNbYV0uZXh0ZW5kKGIpO25ldyBKUUNsYXNzLmNsYXNzZXNbY10oKX19fSkoalF1ZXJ5KTsiLCIvKiBodHRwOi8va2VpdGgtd29vZC5uYW1lL2NvdW50ZG93bi5odG1sXHJcbiAgIENvdW50ZG93biBmb3IgalF1ZXJ5IHYyLjAuMi5cclxuICAgV3JpdHRlbiBieSBLZWl0aCBXb29kIChrYndvb2R7YXR9aWluZXQuY29tLmF1KSBKYW51YXJ5IDIwMDguXHJcbiAgIEF2YWlsYWJsZSB1bmRlciB0aGUgTUlUIChodHRwOi8va2VpdGgtd29vZC5uYW1lL2xpY2VuY2UuaHRtbCkgbGljZW5zZS4gXHJcbiAgIFBsZWFzZSBhdHRyaWJ1dGUgdGhlIGF1dGhvciBpZiB5b3UgdXNlIGl0LiAqL1xyXG4oZnVuY3Rpb24oJCl7dmFyIHc9J2NvdW50ZG93bic7dmFyIFk9MDt2YXIgTz0xO3ZhciBXPTI7dmFyIEQ9Mzt2YXIgSD00O3ZhciBNPTU7dmFyIFM9NjskLkpRUGx1Z2luLmNyZWF0ZVBsdWdpbih7bmFtZTp3LGRlZmF1bHRPcHRpb25zOnt1bnRpbDpudWxsLHNpbmNlOm51bGwsdGltZXpvbmU6bnVsbCxzZXJ2ZXJTeW5jOm51bGwsZm9ybWF0OidkSE1TJyxsYXlvdXQ6JycsY29tcGFjdDpmYWxzZSxwYWRaZXJvZXM6ZmFsc2Usc2lnbmlmaWNhbnQ6MCxkZXNjcmlwdGlvbjonJyxleHBpcnlVcmw6JycsZXhwaXJ5VGV4dDonJyxhbHdheXNFeHBpcmU6ZmFsc2Usb25FeHBpcnk6bnVsbCxvblRpY2s6bnVsbCx0aWNrSW50ZXJ2YWw6MX0scmVnaW9uYWxPcHRpb25zOnsnJzp7bGFiZWxzOlsnWWVhcnMnLCdNb250aHMnLCdXZWVrcycsJ0RheXMnLCdIb3VycycsJ01pbnV0ZXMnLCdTZWNvbmRzJ10sbGFiZWxzMTpbJ1llYXInLCdNb250aCcsJ1dlZWsnLCdEYXknLCdIb3VyJywnTWludXRlJywnU2Vjb25kJ10sY29tcGFjdExhYmVsczpbJ3knLCdtJywndycsJ2QnXSx3aGljaExhYmVsczpudWxsLGRpZ2l0czpbJzAnLCcxJywnMicsJzMnLCc0JywnNScsJzYnLCc3JywnOCcsJzknXSx0aW1lU2VwYXJhdG9yOic6Jyxpc1JUTDpmYWxzZX19LF9nZXR0ZXJzOlsnZ2V0VGltZXMnXSxfcnRsQ2xhc3M6dysnLXJ0bCcsX3NlY3Rpb25DbGFzczp3Kyctc2VjdGlvbicsX2Ftb3VudENsYXNzOncrJy1hbW91bnQnLF9wZXJpb2RDbGFzczp3KyctcGVyaW9kJyxfcm93Q2xhc3M6dysnLXJvdycsX2hvbGRpbmdDbGFzczp3KyctaG9sZGluZycsX3Nob3dDbGFzczp3Kyctc2hvdycsX2Rlc2NyQ2xhc3M6dysnLWRlc2NyJyxfdGltZXJFbGVtczpbXSxfaW5pdDpmdW5jdGlvbigpe3ZhciBjPXRoaXM7dGhpcy5fc3VwZXIoKTt0aGlzLl9zZXJ2ZXJTeW5jcz1bXTt2YXIgZD0odHlwZW9mIERhdGUubm93PT0nZnVuY3Rpb24nP0RhdGUubm93OmZ1bmN0aW9uKCl7cmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpfSk7dmFyIGU9KHdpbmRvdy5wZXJmb3JtYW5jZSYmdHlwZW9mIHdpbmRvdy5wZXJmb3JtYW5jZS5ub3c9PSdmdW5jdGlvbicpO2Z1bmN0aW9uIHRpbWVyQ2FsbEJhY2soYSl7dmFyIGI9KGE8MWUxMj8oZT8ocGVyZm9ybWFuY2Uubm93KCkrcGVyZm9ybWFuY2UudGltaW5nLm5hdmlnYXRpb25TdGFydCk6ZCgpKTphfHxkKCkpO2lmKGItZz49MTAwMCl7Yy5fdXBkYXRlRWxlbXMoKTtnPWJ9Zih0aW1lckNhbGxCYWNrKX12YXIgZj13aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lfHx3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lfHx3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lfHx3aW5kb3cub1JlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lfHxudWxsO3ZhciBnPTA7aWYoIWZ8fCQubm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWUpeyQubm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWU9bnVsbDtzZXRJbnRlcnZhbChmdW5jdGlvbigpe2MuX3VwZGF0ZUVsZW1zKCl9LDk4MCl9ZWxzZXtnPXdpbmRvdy5hbmltYXRpb25TdGFydFRpbWV8fHdpbmRvdy53ZWJraXRBbmltYXRpb25TdGFydFRpbWV8fHdpbmRvdy5tb3pBbmltYXRpb25TdGFydFRpbWV8fHdpbmRvdy5vQW5pbWF0aW9uU3RhcnRUaW1lfHx3aW5kb3cubXNBbmltYXRpb25TdGFydFRpbWV8fGQoKTtmKHRpbWVyQ2FsbEJhY2spfX0sVVRDRGF0ZTpmdW5jdGlvbihhLGIsYyxlLGYsZyxoLGkpe2lmKHR5cGVvZiBiPT0nb2JqZWN0JyYmYi5jb25zdHJ1Y3Rvcj09RGF0ZSl7aT1iLmdldE1pbGxpc2Vjb25kcygpO2g9Yi5nZXRTZWNvbmRzKCk7Zz1iLmdldE1pbnV0ZXMoKTtmPWIuZ2V0SG91cnMoKTtlPWIuZ2V0RGF0ZSgpO2M9Yi5nZXRNb250aCgpO2I9Yi5nZXRGdWxsWWVhcigpfXZhciBkPW5ldyBEYXRlKCk7ZC5zZXRVVENGdWxsWWVhcihiKTtkLnNldFVUQ0RhdGUoMSk7ZC5zZXRVVENNb250aChjfHwwKTtkLnNldFVUQ0RhdGUoZXx8MSk7ZC5zZXRVVENIb3VycyhmfHwwKTtkLnNldFVUQ01pbnV0ZXMoKGd8fDApLShNYXRoLmFicyhhKTwzMD9hKjYwOmEpKTtkLnNldFVUQ1NlY29uZHMoaHx8MCk7ZC5zZXRVVENNaWxsaXNlY29uZHMoaXx8MCk7cmV0dXJuIGR9LHBlcmlvZHNUb1NlY29uZHM6ZnVuY3Rpb24oYSl7cmV0dXJuIGFbMF0qMzE1NTc2MDArYVsxXSoyNjI5ODAwK2FbMl0qNjA0ODAwK2FbM10qODY0MDArYVs0XSozNjAwK2FbNV0qNjArYVs2XX0scmVzeW5jOmZ1bmN0aW9uKCl7dmFyIGQ9dGhpczskKCcuJyt0aGlzLl9nZXRNYXJrZXIoKSkuZWFjaChmdW5jdGlvbigpe3ZhciBhPSQuZGF0YSh0aGlzLGQubmFtZSk7aWYoYS5vcHRpb25zLnNlcnZlclN5bmMpe3ZhciBiPW51bGw7Zm9yKHZhciBpPTA7aTxkLl9zZXJ2ZXJTeW5jcy5sZW5ndGg7aSsrKXtpZihkLl9zZXJ2ZXJTeW5jc1tpXVswXT09YS5vcHRpb25zLnNlcnZlclN5bmMpe2I9ZC5fc2VydmVyU3luY3NbaV07YnJlYWt9fWlmKGJbMl09PW51bGwpe3ZhciBjPSgkLmlzRnVuY3Rpb24oYS5vcHRpb25zLnNlcnZlclN5bmMpP2Eub3B0aW9ucy5zZXJ2ZXJTeW5jLmFwcGx5KHRoaXMsW10pOm51bGwpO2JbMl09KGM/bmV3IERhdGUoKS5nZXRUaW1lKCktYy5nZXRUaW1lKCk6MCktYlsxXX1pZihhLl9zaW5jZSl7YS5fc2luY2Uuc2V0TWlsbGlzZWNvbmRzKGEuX3NpbmNlLmdldE1pbGxpc2Vjb25kcygpK2JbMl0pfWEuX3VudGlsLnNldE1pbGxpc2Vjb25kcyhhLl91bnRpbC5nZXRNaWxsaXNlY29uZHMoKStiWzJdKX19KTtmb3IodmFyIGk9MDtpPGQuX3NlcnZlclN5bmNzLmxlbmd0aDtpKyspe2lmKGQuX3NlcnZlclN5bmNzW2ldWzJdIT1udWxsKXtkLl9zZXJ2ZXJTeW5jc1tpXVsxXSs9ZC5fc2VydmVyU3luY3NbaV1bMl07ZGVsZXRlIGQuX3NlcnZlclN5bmNzW2ldWzJdfX19LF9pbnN0U2V0dGluZ3M6ZnVuY3Rpb24oYSxiKXtyZXR1cm57X3BlcmlvZHM6WzAsMCwwLDAsMCwwLDBdfX0sX2FkZEVsZW06ZnVuY3Rpb24oYSl7aWYoIXRoaXMuX2hhc0VsZW0oYSkpe3RoaXMuX3RpbWVyRWxlbXMucHVzaChhKX19LF9oYXNFbGVtOmZ1bmN0aW9uKGEpe3JldHVybigkLmluQXJyYXkoYSx0aGlzLl90aW1lckVsZW1zKT4tMSl9LF9yZW1vdmVFbGVtOmZ1bmN0aW9uKGIpe3RoaXMuX3RpbWVyRWxlbXM9JC5tYXAodGhpcy5fdGltZXJFbGVtcyxmdW5jdGlvbihhKXtyZXR1cm4oYT09Yj9udWxsOmEpfSl9LF91cGRhdGVFbGVtczpmdW5jdGlvbigpe2Zvcih2YXIgaT10aGlzLl90aW1lckVsZW1zLmxlbmd0aC0xO2k+PTA7aS0tKXt0aGlzLl91cGRhdGVDb3VudGRvd24odGhpcy5fdGltZXJFbGVtc1tpXSl9fSxfb3B0aW9uc0NoYW5nZWQ6ZnVuY3Rpb24oYSxiLGMpe2lmKGMubGF5b3V0KXtjLmxheW91dD1jLmxheW91dC5yZXBsYWNlKC8mbHQ7L2csJzwnKS5yZXBsYWNlKC8mZ3Q7L2csJz4nKX10aGlzLl9yZXNldEV4dHJhTGFiZWxzKGIub3B0aW9ucyxjKTt2YXIgZD0oYi5vcHRpb25zLnRpbWV6b25lIT1jLnRpbWV6b25lKTskLmV4dGVuZChiLm9wdGlvbnMsYyk7dGhpcy5fYWRqdXN0U2V0dGluZ3MoYSxiLGMudW50aWwhPW51bGx8fGMuc2luY2UhPW51bGx8fGQpO3ZhciBlPW5ldyBEYXRlKCk7aWYoKGIuX3NpbmNlJiZiLl9zaW5jZTxlKXx8KGIuX3VudGlsJiZiLl91bnRpbD5lKSl7dGhpcy5fYWRkRWxlbShhWzBdKX10aGlzLl91cGRhdGVDb3VudGRvd24oYSxiKX0sX3VwZGF0ZUNvdW50ZG93bjpmdW5jdGlvbihhLGIpe2E9YS5qcXVlcnk/YTokKGEpO2I9Ynx8dGhpcy5fZ2V0SW5zdChhKTtpZighYil7cmV0dXJufWEuaHRtbCh0aGlzLl9nZW5lcmF0ZUhUTUwoYikpLnRvZ2dsZUNsYXNzKHRoaXMuX3J0bENsYXNzLGIub3B0aW9ucy5pc1JUTCk7aWYoJC5pc0Z1bmN0aW9uKGIub3B0aW9ucy5vblRpY2spKXt2YXIgYz1iLl9ob2xkIT0nbGFwJz9iLl9wZXJpb2RzOnRoaXMuX2NhbGN1bGF0ZVBlcmlvZHMoYixiLl9zaG93LGIub3B0aW9ucy5zaWduaWZpY2FudCxuZXcgRGF0ZSgpKTtpZihiLm9wdGlvbnMudGlja0ludGVydmFsPT0xfHx0aGlzLnBlcmlvZHNUb1NlY29uZHMoYyklYi5vcHRpb25zLnRpY2tJbnRlcnZhbD09MCl7Yi5vcHRpb25zLm9uVGljay5hcHBseShhWzBdLFtjXSl9fXZhciBkPWIuX2hvbGQhPSdwYXVzZScmJihiLl9zaW5jZT9iLl9ub3cuZ2V0VGltZSgpPGIuX3NpbmNlLmdldFRpbWUoKTpiLl9ub3cuZ2V0VGltZSgpPj1iLl91bnRpbC5nZXRUaW1lKCkpO2lmKGQmJiFiLl9leHBpcmluZyl7Yi5fZXhwaXJpbmc9dHJ1ZTtpZih0aGlzLl9oYXNFbGVtKGFbMF0pfHxiLm9wdGlvbnMuYWx3YXlzRXhwaXJlKXt0aGlzLl9yZW1vdmVFbGVtKGFbMF0pO2lmKCQuaXNGdW5jdGlvbihiLm9wdGlvbnMub25FeHBpcnkpKXtiLm9wdGlvbnMub25FeHBpcnkuYXBwbHkoYVswXSxbXSl9aWYoYi5vcHRpb25zLmV4cGlyeVRleHQpe3ZhciBlPWIub3B0aW9ucy5sYXlvdXQ7Yi5vcHRpb25zLmxheW91dD1iLm9wdGlvbnMuZXhwaXJ5VGV4dDt0aGlzLl91cGRhdGVDb3VudGRvd24oYVswXSxiKTtiLm9wdGlvbnMubGF5b3V0PWV9aWYoYi5vcHRpb25zLmV4cGlyeVVybCl7d2luZG93LmxvY2F0aW9uPWIub3B0aW9ucy5leHBpcnlVcmx9fWIuX2V4cGlyaW5nPWZhbHNlfWVsc2UgaWYoYi5faG9sZD09J3BhdXNlJyl7dGhpcy5fcmVtb3ZlRWxlbShhWzBdKX19LF9yZXNldEV4dHJhTGFiZWxzOmZ1bmN0aW9uKGEsYil7Zm9yKHZhciBuIGluIGIpe2lmKG4ubWF0Y2goL1tMbF1hYmVsc1swMi05XXxjb21wYWN0TGFiZWxzMS8pKXthW25dPWJbbl19fWZvcih2YXIgbiBpbiBhKXtpZihuLm1hdGNoKC9bTGxdYWJlbHNbMDItOV18Y29tcGFjdExhYmVsczEvKSYmdHlwZW9mIGJbbl09PT0ndW5kZWZpbmVkJyl7YVtuXT1udWxsfX19LF9hZGp1c3RTZXR0aW5nczpmdW5jdGlvbihhLGIsYyl7dmFyIGQ9bnVsbDtmb3IodmFyIGk9MDtpPHRoaXMuX3NlcnZlclN5bmNzLmxlbmd0aDtpKyspe2lmKHRoaXMuX3NlcnZlclN5bmNzW2ldWzBdPT1iLm9wdGlvbnMuc2VydmVyU3luYyl7ZD10aGlzLl9zZXJ2ZXJTeW5jc1tpXVsxXTticmVha319aWYoZCE9bnVsbCl7dmFyIGU9KGIub3B0aW9ucy5zZXJ2ZXJTeW5jP2Q6MCk7dmFyIGY9bmV3IERhdGUoKX1lbHNle3ZhciBnPSgkLmlzRnVuY3Rpb24oYi5vcHRpb25zLnNlcnZlclN5bmMpP2Iub3B0aW9ucy5zZXJ2ZXJTeW5jLmFwcGx5KGFbMF0sW10pOm51bGwpO3ZhciBmPW5ldyBEYXRlKCk7dmFyIGU9KGc/Zi5nZXRUaW1lKCktZy5nZXRUaW1lKCk6MCk7dGhpcy5fc2VydmVyU3luY3MucHVzaChbYi5vcHRpb25zLnNlcnZlclN5bmMsZV0pfXZhciBoPWIub3B0aW9ucy50aW1lem9uZTtoPShoPT1udWxsPy1mLmdldFRpbWV6b25lT2Zmc2V0KCk6aCk7aWYoY3x8KCFjJiZiLl91bnRpbD09bnVsbCYmYi5fc2luY2U9PW51bGwpKXtiLl9zaW5jZT1iLm9wdGlvbnMuc2luY2U7aWYoYi5fc2luY2UhPW51bGwpe2IuX3NpbmNlPXRoaXMuVVRDRGF0ZShoLHRoaXMuX2RldGVybWluZVRpbWUoYi5fc2luY2UsbnVsbCkpO2lmKGIuX3NpbmNlJiZlKXtiLl9zaW5jZS5zZXRNaWxsaXNlY29uZHMoYi5fc2luY2UuZ2V0TWlsbGlzZWNvbmRzKCkrZSl9fWIuX3VudGlsPXRoaXMuVVRDRGF0ZShoLHRoaXMuX2RldGVybWluZVRpbWUoYi5vcHRpb25zLnVudGlsLGYpKTtpZihlKXtiLl91bnRpbC5zZXRNaWxsaXNlY29uZHMoYi5fdW50aWwuZ2V0TWlsbGlzZWNvbmRzKCkrZSl9fWIuX3Nob3c9dGhpcy5fZGV0ZXJtaW5lU2hvdyhiKX0sX3ByZURlc3Ryb3k6ZnVuY3Rpb24oYSxiKXt0aGlzLl9yZW1vdmVFbGVtKGFbMF0pO2EuZW1wdHkoKX0scGF1c2U6ZnVuY3Rpb24oYSl7dGhpcy5faG9sZChhLCdwYXVzZScpfSxsYXA6ZnVuY3Rpb24oYSl7dGhpcy5faG9sZChhLCdsYXAnKX0scmVzdW1lOmZ1bmN0aW9uKGEpe3RoaXMuX2hvbGQoYSxudWxsKX0sdG9nZ2xlOmZ1bmN0aW9uKGEpe3ZhciBiPSQuZGF0YShhLHRoaXMubmFtZSl8fHt9O3RoaXNbIWIuX2hvbGQ/J3BhdXNlJzoncmVzdW1lJ10oYSl9LHRvZ2dsZUxhcDpmdW5jdGlvbihhKXt2YXIgYj0kLmRhdGEoYSx0aGlzLm5hbWUpfHx7fTt0aGlzWyFiLl9ob2xkPydsYXAnOidyZXN1bWUnXShhKX0sX2hvbGQ6ZnVuY3Rpb24oYSxiKXt2YXIgYz0kLmRhdGEoYSx0aGlzLm5hbWUpO2lmKGMpe2lmKGMuX2hvbGQ9PSdwYXVzZScmJiFiKXtjLl9wZXJpb2RzPWMuX3NhdmVQZXJpb2RzO3ZhciBkPShjLl9zaW5jZT8nLSc6JysnKTtjW2MuX3NpbmNlPydfc2luY2UnOidfdW50aWwnXT10aGlzLl9kZXRlcm1pbmVUaW1lKGQrYy5fcGVyaW9kc1swXSsneScrZCtjLl9wZXJpb2RzWzFdKydvJytkK2MuX3BlcmlvZHNbMl0rJ3cnK2QrYy5fcGVyaW9kc1szXSsnZCcrZCtjLl9wZXJpb2RzWzRdKydoJytkK2MuX3BlcmlvZHNbNV0rJ20nK2QrYy5fcGVyaW9kc1s2XSsncycpO3RoaXMuX2FkZEVsZW0oYSl9Yy5faG9sZD1iO2MuX3NhdmVQZXJpb2RzPShiPT0ncGF1c2UnP2MuX3BlcmlvZHM6bnVsbCk7JC5kYXRhKGEsdGhpcy5uYW1lLGMpO3RoaXMuX3VwZGF0ZUNvdW50ZG93bihhLGMpfX0sZ2V0VGltZXM6ZnVuY3Rpb24oYSl7dmFyIGI9JC5kYXRhKGEsdGhpcy5uYW1lKTtyZXR1cm4oIWI/bnVsbDooYi5faG9sZD09J3BhdXNlJz9iLl9zYXZlUGVyaW9kczooIWIuX2hvbGQ/Yi5fcGVyaW9kczp0aGlzLl9jYWxjdWxhdGVQZXJpb2RzKGIsYi5fc2hvdyxiLm9wdGlvbnMuc2lnbmlmaWNhbnQsbmV3IERhdGUoKSkpKSl9LF9kZXRlcm1pbmVUaW1lOmZ1bmN0aW9uKGssbCl7dmFyIG09dGhpczt2YXIgbj1mdW5jdGlvbihhKXt2YXIgYj1uZXcgRGF0ZSgpO2Iuc2V0VGltZShiLmdldFRpbWUoKSthKjEwMDApO3JldHVybiBifTt2YXIgbz1mdW5jdGlvbihhKXthPWEudG9Mb3dlckNhc2UoKTt2YXIgYj1uZXcgRGF0ZSgpO3ZhciBjPWIuZ2V0RnVsbFllYXIoKTt2YXIgZD1iLmdldE1vbnRoKCk7dmFyIGU9Yi5nZXREYXRlKCk7dmFyIGY9Yi5nZXRIb3VycygpO3ZhciBnPWIuZ2V0TWludXRlcygpO3ZhciBoPWIuZ2V0U2Vjb25kcygpO3ZhciBpPS8oWystXT9bMC05XSspXFxzKihzfG18aHxkfHd8b3x5KT8vZzt2YXIgaj1pLmV4ZWMoYSk7d2hpbGUoail7c3dpdGNoKGpbMl18fCdzJyl7Y2FzZSdzJzpoKz1wYXJzZUludChqWzFdLDEwKTticmVhaztjYXNlJ20nOmcrPXBhcnNlSW50KGpbMV0sMTApO2JyZWFrO2Nhc2UnaCc6Zis9cGFyc2VJbnQoalsxXSwxMCk7YnJlYWs7Y2FzZSdkJzplKz1wYXJzZUludChqWzFdLDEwKTticmVhaztjYXNlJ3cnOmUrPXBhcnNlSW50KGpbMV0sMTApKjc7YnJlYWs7Y2FzZSdvJzpkKz1wYXJzZUludChqWzFdLDEwKTtlPU1hdGgubWluKGUsbS5fZ2V0RGF5c0luTW9udGgoYyxkKSk7YnJlYWs7Y2FzZSd5JzpjKz1wYXJzZUludChqWzFdLDEwKTtlPU1hdGgubWluKGUsbS5fZ2V0RGF5c0luTW9udGgoYyxkKSk7YnJlYWt9aj1pLmV4ZWMoYSl9cmV0dXJuIG5ldyBEYXRlKGMsZCxlLGYsZyxoLDApfTt2YXIgcD0oaz09bnVsbD9sOih0eXBlb2Ygaz09J3N0cmluZyc/byhrKToodHlwZW9mIGs9PSdudW1iZXInP24oayk6aykpKTtpZihwKXAuc2V0TWlsbGlzZWNvbmRzKDApO3JldHVybiBwfSxfZ2V0RGF5c0luTW9udGg6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gMzItbmV3IERhdGUoYSxiLDMyKS5nZXREYXRlKCl9LF9ub3JtYWxMYWJlbHM6ZnVuY3Rpb24oYSl7cmV0dXJuIGF9LF9nZW5lcmF0ZUhUTUw6ZnVuY3Rpb24oYyl7dmFyIGQ9dGhpcztjLl9wZXJpb2RzPShjLl9ob2xkP2MuX3BlcmlvZHM6dGhpcy5fY2FsY3VsYXRlUGVyaW9kcyhjLGMuX3Nob3csYy5vcHRpb25zLnNpZ25pZmljYW50LG5ldyBEYXRlKCkpKTt2YXIgZT1mYWxzZTt2YXIgZj0wO3ZhciBnPWMub3B0aW9ucy5zaWduaWZpY2FudDt2YXIgaD0kLmV4dGVuZCh7fSxjLl9zaG93KTtmb3IodmFyIGk9WTtpPD1TO2krKyl7ZXw9KGMuX3Nob3dbaV09PSc/JyYmYy5fcGVyaW9kc1tpXT4wKTtoW2ldPShjLl9zaG93W2ldPT0nPycmJiFlP251bGw6Yy5fc2hvd1tpXSk7Zis9KGhbaV0/MTowKTtnLT0oYy5fcGVyaW9kc1tpXT4wPzE6MCl9dmFyIGo9W2ZhbHNlLGZhbHNlLGZhbHNlLGZhbHNlLGZhbHNlLGZhbHNlLGZhbHNlXTtmb3IodmFyIGk9UztpPj1ZO2ktLSl7aWYoYy5fc2hvd1tpXSl7aWYoYy5fcGVyaW9kc1tpXSl7altpXT10cnVlfWVsc2V7altpXT1nPjA7Zy0tfX19dmFyIGs9KGMub3B0aW9ucy5jb21wYWN0P2Mub3B0aW9ucy5jb21wYWN0TGFiZWxzOmMub3B0aW9ucy5sYWJlbHMpO3ZhciBsPWMub3B0aW9ucy53aGljaExhYmVsc3x8dGhpcy5fbm9ybWFsTGFiZWxzO3ZhciBtPWZ1bmN0aW9uKGEpe3ZhciBiPWMub3B0aW9uc1snY29tcGFjdExhYmVscycrbChjLl9wZXJpb2RzW2FdKV07cmV0dXJuKGhbYV0/ZC5fdHJhbnNsYXRlRGlnaXRzKGMsYy5fcGVyaW9kc1thXSkrKGI/YlthXTprW2FdKSsnICc6JycpfTt2YXIgbj0oYy5vcHRpb25zLnBhZFplcm9lcz8yOjEpO3ZhciBvPWZ1bmN0aW9uKGEpe3ZhciBiPWMub3B0aW9uc1snbGFiZWxzJytsKGMuX3BlcmlvZHNbYV0pXTtyZXR1cm4oKCFjLm9wdGlvbnMuc2lnbmlmaWNhbnQmJmhbYV0pfHwoYy5vcHRpb25zLnNpZ25pZmljYW50JiZqW2FdKT8nPHNwYW4gY2xhc3M9XCInK2QuX3NlY3Rpb25DbGFzcysnXCI+JysnPHNwYW4gY2xhc3M9XCInK2QuX2Ftb3VudENsYXNzKydcIj4nK2QuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbYV0sbikrJzwvc3Bhbj4nKyc8c3BhbiBjbGFzcz1cIicrZC5fcGVyaW9kQ2xhc3MrJ1wiPicrKGI/YlthXTprW2FdKSsnPC9zcGFuPjwvc3Bhbj4nOicnKX07cmV0dXJuKGMub3B0aW9ucy5sYXlvdXQ/dGhpcy5fYnVpbGRMYXlvdXQoYyxoLGMub3B0aW9ucy5sYXlvdXQsYy5vcHRpb25zLmNvbXBhY3QsYy5vcHRpb25zLnNpZ25pZmljYW50LGopOigoYy5vcHRpb25zLmNvbXBhY3Q/JzxzcGFuIGNsYXNzPVwiJyt0aGlzLl9yb3dDbGFzcysnICcrdGhpcy5fYW1vdW50Q2xhc3MrKGMuX2hvbGQ/JyAnK3RoaXMuX2hvbGRpbmdDbGFzczonJykrJ1wiPicrbShZKSttKE8pK20oVykrbShEKSsoaFtIXT90aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW0hdLDIpOicnKSsoaFtNXT8oaFtIXT9jLm9wdGlvbnMudGltZVNlcGFyYXRvcjonJykrdGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tNXSwyKTonJykrKGhbU10/KGhbSF18fGhbTV0/Yy5vcHRpb25zLnRpbWVTZXBhcmF0b3I6JycpK3RoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbU10sMik6JycpOic8c3BhbiBjbGFzcz1cIicrdGhpcy5fcm93Q2xhc3MrJyAnK3RoaXMuX3Nob3dDbGFzcysoYy5vcHRpb25zLnNpZ25pZmljYW50fHxmKSsoYy5faG9sZD8nICcrdGhpcy5faG9sZGluZ0NsYXNzOicnKSsnXCI+JytvKFkpK28oTykrbyhXKStvKEQpK28oSCkrbyhNKStvKFMpKSsnPC9zcGFuPicrKGMub3B0aW9ucy5kZXNjcmlwdGlvbj8nPHNwYW4gY2xhc3M9XCInK3RoaXMuX3Jvd0NsYXNzKycgJyt0aGlzLl9kZXNjckNsYXNzKydcIj4nK2Mub3B0aW9ucy5kZXNjcmlwdGlvbisnPC9zcGFuPic6JycpKSl9LF9idWlsZExheW91dDpmdW5jdGlvbihjLGQsZSxmLGcsaCl7dmFyIGo9Yy5vcHRpb25zW2Y/J2NvbXBhY3RMYWJlbHMnOidsYWJlbHMnXTt2YXIgaz1jLm9wdGlvbnMud2hpY2hMYWJlbHN8fHRoaXMuX25vcm1hbExhYmVsczt2YXIgbD1mdW5jdGlvbihhKXtyZXR1cm4oYy5vcHRpb25zWyhmPydjb21wYWN0TGFiZWxzJzonbGFiZWxzJykrayhjLl9wZXJpb2RzW2FdKV18fGopW2FdfTt2YXIgbT1mdW5jdGlvbihhLGIpe3JldHVybiBjLm9wdGlvbnMuZGlnaXRzW01hdGguZmxvb3IoYS9iKSUxMF19O3ZhciBvPXtkZXNjOmMub3B0aW9ucy5kZXNjcmlwdGlvbixzZXA6Yy5vcHRpb25zLnRpbWVTZXBhcmF0b3IseWw6bChZKSx5bjp0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW1ldLDEpLHlubjp0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW1ldLDIpLHlubm46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tZXSwzKSx5MTptKGMuX3BlcmlvZHNbWV0sMSkseTEwOm0oYy5fcGVyaW9kc1tZXSwxMCkseTEwMDptKGMuX3BlcmlvZHNbWV0sMTAwKSx5MTAwMDptKGMuX3BlcmlvZHNbWV0sMTAwMCksb2w6bChPKSxvbjp0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW09dLDEpLG9ubjp0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW09dLDIpLG9ubm46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tPXSwzKSxvMTptKGMuX3BlcmlvZHNbT10sMSksbzEwOm0oYy5fcGVyaW9kc1tPXSwxMCksbzEwMDptKGMuX3BlcmlvZHNbT10sMTAwKSxvMTAwMDptKGMuX3BlcmlvZHNbT10sMTAwMCksd2w6bChXKSx3bjp0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW1ddLDEpLHdubjp0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW1ddLDIpLHdubm46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tXXSwzKSx3MTptKGMuX3BlcmlvZHNbV10sMSksdzEwOm0oYy5fcGVyaW9kc1tXXSwxMCksdzEwMDptKGMuX3BlcmlvZHNbV10sMTAwKSx3MTAwMDptKGMuX3BlcmlvZHNbV10sMTAwMCksZGw6bChEKSxkbjp0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW0RdLDEpLGRubjp0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW0RdLDIpLGRubm46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tEXSwzKSxkMTptKGMuX3BlcmlvZHNbRF0sMSksZDEwOm0oYy5fcGVyaW9kc1tEXSwxMCksZDEwMDptKGMuX3BlcmlvZHNbRF0sMTAwKSxkMTAwMDptKGMuX3BlcmlvZHNbRF0sMTAwMCksaGw6bChIKSxobjp0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW0hdLDEpLGhubjp0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW0hdLDIpLGhubm46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tIXSwzKSxoMTptKGMuX3BlcmlvZHNbSF0sMSksaDEwOm0oYy5fcGVyaW9kc1tIXSwxMCksaDEwMDptKGMuX3BlcmlvZHNbSF0sMTAwKSxoMTAwMDptKGMuX3BlcmlvZHNbSF0sMTAwMCksbWw6bChNKSxtbjp0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW01dLDEpLG1ubjp0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW01dLDIpLG1ubm46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tNXSwzKSxtMTptKGMuX3BlcmlvZHNbTV0sMSksbTEwOm0oYy5fcGVyaW9kc1tNXSwxMCksbTEwMDptKGMuX3BlcmlvZHNbTV0sMTAwKSxtMTAwMDptKGMuX3BlcmlvZHNbTV0sMTAwMCksc2w6bChTKSxzbjp0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW1NdLDEpLHNubjp0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW1NdLDIpLHNubm46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tTXSwzKSxzMTptKGMuX3BlcmlvZHNbU10sMSksczEwOm0oYy5fcGVyaW9kc1tTXSwxMCksczEwMDptKGMuX3BlcmlvZHNbU10sMTAwKSxzMTAwMDptKGMuX3BlcmlvZHNbU10sMTAwMCl9O3ZhciBwPWU7Zm9yKHZhciBpPVk7aTw9UztpKyspe3ZhciBxPSd5b3dkaG1zJy5jaGFyQXQoaSk7dmFyIHI9bmV3IFJlZ0V4cCgnXFxcXHsnK3ErJzxcXFxcfShbXFxcXHNcXFxcU10qKVxcXFx7JytxKyc+XFxcXH0nLCdnJyk7cD1wLnJlcGxhY2UociwoKCFnJiZkW2ldKXx8KGcmJmhbaV0pPyckMSc6JycpKX0kLmVhY2gobyxmdW5jdGlvbihuLHYpe3ZhciBhPW5ldyBSZWdFeHAoJ1xcXFx7JytuKydcXFxcfScsJ2cnKTtwPXAucmVwbGFjZShhLHYpfSk7cmV0dXJuIHB9LF9taW5EaWdpdHM6ZnVuY3Rpb24oYSxiLGMpe2I9JycrYjtpZihiLmxlbmd0aD49Yyl7cmV0dXJuIHRoaXMuX3RyYW5zbGF0ZURpZ2l0cyhhLGIpfWI9JzAwMDAwMDAwMDAnK2I7cmV0dXJuIHRoaXMuX3RyYW5zbGF0ZURpZ2l0cyhhLGIuc3Vic3RyKGIubGVuZ3RoLWMpKX0sX3RyYW5zbGF0ZURpZ2l0czpmdW5jdGlvbihiLGMpe3JldHVybignJytjKS5yZXBsYWNlKC9bMC05XS9nLGZ1bmN0aW9uKGEpe3JldHVybiBiLm9wdGlvbnMuZGlnaXRzW2FdfSl9LF9kZXRlcm1pbmVTaG93OmZ1bmN0aW9uKGEpe3ZhciBiPWEub3B0aW9ucy5mb3JtYXQ7dmFyIGM9W107Y1tZXT0oYi5tYXRjaCgneScpPyc/JzooYi5tYXRjaCgnWScpPychJzpudWxsKSk7Y1tPXT0oYi5tYXRjaCgnbycpPyc/JzooYi5tYXRjaCgnTycpPychJzpudWxsKSk7Y1tXXT0oYi5tYXRjaCgndycpPyc/JzooYi5tYXRjaCgnVycpPychJzpudWxsKSk7Y1tEXT0oYi5tYXRjaCgnZCcpPyc/JzooYi5tYXRjaCgnRCcpPychJzpudWxsKSk7Y1tIXT0oYi5tYXRjaCgnaCcpPyc/JzooYi5tYXRjaCgnSCcpPychJzpudWxsKSk7Y1tNXT0oYi5tYXRjaCgnbScpPyc/JzooYi5tYXRjaCgnTScpPychJzpudWxsKSk7Y1tTXT0oYi5tYXRjaCgncycpPyc/JzooYi5tYXRjaCgnUycpPychJzpudWxsKSk7cmV0dXJuIGN9LF9jYWxjdWxhdGVQZXJpb2RzOmZ1bmN0aW9uKGMsZCxlLGYpe2MuX25vdz1mO2MuX25vdy5zZXRNaWxsaXNlY29uZHMoMCk7dmFyIGc9bmV3IERhdGUoYy5fbm93LmdldFRpbWUoKSk7aWYoYy5fc2luY2Upe2lmKGYuZ2V0VGltZSgpPGMuX3NpbmNlLmdldFRpbWUoKSl7Yy5fbm93PWY9Z31lbHNle2Y9Yy5fc2luY2V9fWVsc2V7Zy5zZXRUaW1lKGMuX3VudGlsLmdldFRpbWUoKSk7aWYoZi5nZXRUaW1lKCk+Yy5fdW50aWwuZ2V0VGltZSgpKXtjLl9ub3c9Zj1nfX12YXIgaD1bMCwwLDAsMCwwLDAsMF07aWYoZFtZXXx8ZFtPXSl7dmFyIGk9dGhpcy5fZ2V0RGF5c0luTW9udGgoZi5nZXRGdWxsWWVhcigpLGYuZ2V0TW9udGgoKSk7dmFyIGo9dGhpcy5fZ2V0RGF5c0luTW9udGgoZy5nZXRGdWxsWWVhcigpLGcuZ2V0TW9udGgoKSk7dmFyIGs9KGcuZ2V0RGF0ZSgpPT1mLmdldERhdGUoKXx8KGcuZ2V0RGF0ZSgpPj1NYXRoLm1pbihpLGopJiZmLmdldERhdGUoKT49TWF0aC5taW4oaSxqKSkpO3ZhciBsPWZ1bmN0aW9uKGEpe3JldHVybihhLmdldEhvdXJzKCkqNjArYS5nZXRNaW51dGVzKCkpKjYwK2EuZ2V0U2Vjb25kcygpfTt2YXIgbT1NYXRoLm1heCgwLChnLmdldEZ1bGxZZWFyKCktZi5nZXRGdWxsWWVhcigpKSoxMitnLmdldE1vbnRoKCktZi5nZXRNb250aCgpKygoZy5nZXREYXRlKCk8Zi5nZXREYXRlKCkmJiFrKXx8KGsmJmwoZyk8bChmKSk/LTE6MCkpO2hbWV09KGRbWV0/TWF0aC5mbG9vcihtLzEyKTowKTtoW09dPShkW09dP20taFtZXSoxMjowKTtmPW5ldyBEYXRlKGYuZ2V0VGltZSgpKTt2YXIgbj0oZi5nZXREYXRlKCk9PWkpO3ZhciBvPXRoaXMuX2dldERheXNJbk1vbnRoKGYuZ2V0RnVsbFllYXIoKStoW1ldLGYuZ2V0TW9udGgoKStoW09dKTtpZihmLmdldERhdGUoKT5vKXtmLnNldERhdGUobyl9Zi5zZXRGdWxsWWVhcihmLmdldEZ1bGxZZWFyKCkraFtZXSk7Zi5zZXRNb250aChmLmdldE1vbnRoKCkraFtPXSk7aWYobil7Zi5zZXREYXRlKG8pfX12YXIgcD1NYXRoLmZsb29yKChnLmdldFRpbWUoKS1mLmdldFRpbWUoKSkvMTAwMCk7dmFyIHE9ZnVuY3Rpb24oYSxiKXtoW2FdPShkW2FdP01hdGguZmxvb3IocC9iKTowKTtwLT1oW2FdKmJ9O3EoVyw2MDQ4MDApO3EoRCw4NjQwMCk7cShILDM2MDApO3EoTSw2MCk7cShTLDEpO2lmKHA+MCYmIWMuX3NpbmNlKXt2YXIgcj1bMSwxMiw0LjM0ODIsNywyNCw2MCw2MF07dmFyIHM9Uzt2YXIgdD0xO2Zvcih2YXIgdT1TO3U+PVk7dS0tKXtpZihkW3VdKXtpZihoW3NdPj10KXtoW3NdPTA7cD0xfWlmKHA+MCl7aFt1XSsrO3A9MDtzPXU7dD0xfX10Kj1yW3VdfX1pZihlKXtmb3IodmFyIHU9WTt1PD1TO3UrKyl7aWYoZSYmaFt1XSl7ZS0tfWVsc2UgaWYoIWUpe2hbdV09MH19fXJldHVybiBofX0pfSkoalF1ZXJ5KTsiLCIhZnVuY3Rpb24oYSxiKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtcImpxdWVyeVwiXSxiKTpcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1iKHJlcXVpcmUoXCJqcXVlcnlcIikpOmIoYS5qUXVlcnkpfSh0aGlzLGZ1bmN0aW9uKGEpe1wiZnVuY3Rpb25cIiE9dHlwZW9mIE9iamVjdC5jcmVhdGUmJihPYmplY3QuY3JlYXRlPWZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoKXt9cmV0dXJuIGIucHJvdG90eXBlPWEsbmV3IGJ9KTt2YXIgYj17aW5pdDpmdW5jdGlvbihiKXtyZXR1cm4gdGhpcy5vcHRpb25zPWEuZXh0ZW5kKHt9LGEubm90eS5kZWZhdWx0cyxiKSx0aGlzLm9wdGlvbnMubGF5b3V0PXRoaXMub3B0aW9ucy5jdXN0b20/YS5ub3R5LmxheW91dHMuaW5saW5lOmEubm90eS5sYXlvdXRzW3RoaXMub3B0aW9ucy5sYXlvdXRdLGEubm90eS50aGVtZXNbdGhpcy5vcHRpb25zLnRoZW1lXT90aGlzLm9wdGlvbnMudGhlbWU9YS5ub3R5LnRoZW1lc1t0aGlzLm9wdGlvbnMudGhlbWVdOnRoaXMub3B0aW9ucy50aGVtZUNsYXNzTmFtZT10aGlzLm9wdGlvbnMudGhlbWUsdGhpcy5vcHRpb25zPWEuZXh0ZW5kKHt9LHRoaXMub3B0aW9ucyx0aGlzLm9wdGlvbnMubGF5b3V0Lm9wdGlvbnMpLHRoaXMub3B0aW9ucy5pZD1cIm5vdHlfXCIrKG5ldyBEYXRlKS5nZXRUaW1lKCkqTWF0aC5mbG9vcigxZTYqTWF0aC5yYW5kb20oKSksdGhpcy5fYnVpbGQoKSx0aGlzfSxfYnVpbGQ6ZnVuY3Rpb24oKXt2YXIgYj1hKCc8ZGl2IGNsYXNzPVwibm90eV9iYXIgbm90eV90eXBlXycrdGhpcy5vcHRpb25zLnR5cGUrJ1wiPjwvZGl2PicpLmF0dHIoXCJpZFwiLHRoaXMub3B0aW9ucy5pZCk7aWYoYi5hcHBlbmQodGhpcy5vcHRpb25zLnRlbXBsYXRlKS5maW5kKFwiLm5vdHlfdGV4dFwiKS5odG1sKHRoaXMub3B0aW9ucy50ZXh0KSx0aGlzLiRiYXI9bnVsbCE9PXRoaXMub3B0aW9ucy5sYXlvdXQucGFyZW50Lm9iamVjdD9hKHRoaXMub3B0aW9ucy5sYXlvdXQucGFyZW50Lm9iamVjdCkuY3NzKHRoaXMub3B0aW9ucy5sYXlvdXQucGFyZW50LmNzcykuYXBwZW5kKGIpOmIsdGhpcy5vcHRpb25zLnRoZW1lQ2xhc3NOYW1lJiZ0aGlzLiRiYXIuYWRkQ2xhc3ModGhpcy5vcHRpb25zLnRoZW1lQ2xhc3NOYW1lKS5hZGRDbGFzcyhcIm5vdHlfY29udGFpbmVyX3R5cGVfXCIrdGhpcy5vcHRpb25zLnR5cGUpLHRoaXMub3B0aW9ucy5idXR0b25zKXt0aGlzLm9wdGlvbnMuY2xvc2VXaXRoPVtdLHRoaXMub3B0aW9ucy50aW1lb3V0PSExO3ZhciBjPWEoXCI8ZGl2Lz5cIikuYWRkQ2xhc3MoXCJub3R5X2J1dHRvbnNcIik7bnVsbCE9PXRoaXMub3B0aW9ucy5sYXlvdXQucGFyZW50Lm9iamVjdD90aGlzLiRiYXIuZmluZChcIi5ub3R5X2JhclwiKS5hcHBlbmQoYyk6dGhpcy4kYmFyLmFwcGVuZChjKTt2YXIgZD10aGlzO2EuZWFjaCh0aGlzLm9wdGlvbnMuYnV0dG9ucyxmdW5jdGlvbihiLGMpe3ZhciBlPWEoXCI8YnV0dG9uLz5cIikuYWRkQ2xhc3MoYy5hZGRDbGFzcz9jLmFkZENsYXNzOlwiZ3JheVwiKS5odG1sKGMudGV4dCkuYXR0cihcImlkXCIsYy5pZD9jLmlkOlwiYnV0dG9uLVwiK2IpLmF0dHIoXCJ0aXRsZVwiLGMudGl0bGUpLmFwcGVuZFRvKGQuJGJhci5maW5kKFwiLm5vdHlfYnV0dG9uc1wiKSkub24oXCJjbGlja1wiLGZ1bmN0aW9uKGIpe2EuaXNGdW5jdGlvbihjLm9uQ2xpY2spJiZjLm9uQ2xpY2suY2FsbChlLGQsYil9KX0pfXRoaXMuJG1lc3NhZ2U9dGhpcy4kYmFyLmZpbmQoXCIubm90eV9tZXNzYWdlXCIpLHRoaXMuJGNsb3NlQnV0dG9uPXRoaXMuJGJhci5maW5kKFwiLm5vdHlfY2xvc2VcIiksdGhpcy4kYnV0dG9ucz10aGlzLiRiYXIuZmluZChcIi5ub3R5X2J1dHRvbnNcIiksYS5ub3R5LnN0b3JlW3RoaXMub3B0aW9ucy5pZF09dGhpc30sc2hvdzpmdW5jdGlvbigpe3ZhciBiPXRoaXM7cmV0dXJuIGIub3B0aW9ucy5jdXN0b20/Yi5vcHRpb25zLmN1c3RvbS5maW5kKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5hcHBlbmQoYi4kYmFyKTphKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5hcHBlbmQoYi4kYmFyKSxiLm9wdGlvbnMudGhlbWUmJmIub3B0aW9ucy50aGVtZS5zdHlsZSYmYi5vcHRpb25zLnRoZW1lLnN0eWxlLmFwcGx5KGIpLFwiZnVuY3Rpb25cIj09PWEudHlwZShiLm9wdGlvbnMubGF5b3V0LmNzcyk/dGhpcy5vcHRpb25zLmxheW91dC5jc3MuYXBwbHkoYi4kYmFyKTpiLiRiYXIuY3NzKHRoaXMub3B0aW9ucy5sYXlvdXQuY3NzfHx7fSksYi4kYmFyLmFkZENsYXNzKGIub3B0aW9ucy5sYXlvdXQuYWRkQ2xhc3MpLGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnN0eWxlLmFwcGx5KGEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLFtiLm9wdGlvbnMud2l0aGluXSksYi5zaG93aW5nPSEwLGIub3B0aW9ucy50aGVtZSYmYi5vcHRpb25zLnRoZW1lLnN0eWxlJiZiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2sub25TaG93LmFwcGx5KHRoaXMpLGEuaW5BcnJheShcImNsaWNrXCIsYi5vcHRpb25zLmNsb3NlV2l0aCk+LTEmJmIuJGJhci5jc3MoXCJjdXJzb3JcIixcInBvaW50ZXJcIikub25lKFwiY2xpY2tcIixmdW5jdGlvbihhKXtiLnN0b3BQcm9wYWdhdGlvbihhKSxiLm9wdGlvbnMuY2FsbGJhY2sub25DbG9zZUNsaWNrJiZiLm9wdGlvbnMuY2FsbGJhY2sub25DbG9zZUNsaWNrLmFwcGx5KGIpLGIuY2xvc2UoKX0pLGEuaW5BcnJheShcImhvdmVyXCIsYi5vcHRpb25zLmNsb3NlV2l0aCk+LTEmJmIuJGJhci5vbmUoXCJtb3VzZWVudGVyXCIsZnVuY3Rpb24oKXtiLmNsb3NlKCl9KSxhLmluQXJyYXkoXCJidXR0b25cIixiLm9wdGlvbnMuY2xvc2VXaXRoKT4tMSYmYi4kY2xvc2VCdXR0b24ub25lKFwiY2xpY2tcIixmdW5jdGlvbihhKXtiLnN0b3BQcm9wYWdhdGlvbihhKSxiLmNsb3NlKCl9KSwtMT09YS5pbkFycmF5KFwiYnV0dG9uXCIsYi5vcHRpb25zLmNsb3NlV2l0aCkmJmIuJGNsb3NlQnV0dG9uLnJlbW92ZSgpLGIub3B0aW9ucy5jYWxsYmFjay5vblNob3cmJmIub3B0aW9ucy5jYWxsYmFjay5vblNob3cuYXBwbHkoYiksXCJzdHJpbmdcIj09dHlwZW9mIGIub3B0aW9ucy5hbmltYXRpb24ub3Blbj8oYi4kYmFyLmNzcyhcImhlaWdodFwiLGIuJGJhci5pbm5lckhlaWdodCgpKSxiLiRiYXIub24oXCJjbGlja1wiLGZ1bmN0aW9uKGEpe2Iud2FzQ2xpY2tlZD0hMH0pLGIuJGJhci5zaG93KCkuYWRkQ2xhc3MoYi5vcHRpb25zLmFuaW1hdGlvbi5vcGVuKS5vbmUoXCJ3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kXCIsZnVuY3Rpb24oKXtiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJTaG93JiZiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJTaG93LmFwcGx5KGIpLGIuc2hvd2luZz0hMSxiLnNob3duPSEwLGIuaGFzT3duUHJvcGVydHkoXCJ3YXNDbGlja2VkXCIpJiYoYi4kYmFyLm9mZihcImNsaWNrXCIsZnVuY3Rpb24oYSl7Yi53YXNDbGlja2VkPSEwfSksYi5jbG9zZSgpKX0pKTpiLiRiYXIuYW5pbWF0ZShiLm9wdGlvbnMuYW5pbWF0aW9uLm9wZW4sYi5vcHRpb25zLmFuaW1hdGlvbi5zcGVlZCxiLm9wdGlvbnMuYW5pbWF0aW9uLmVhc2luZyxmdW5jdGlvbigpe2Iub3B0aW9ucy5jYWxsYmFjay5hZnRlclNob3cmJmIub3B0aW9ucy5jYWxsYmFjay5hZnRlclNob3cuYXBwbHkoYiksYi5zaG93aW5nPSExLGIuc2hvd249ITB9KSxiLm9wdGlvbnMudGltZW91dCYmYi4kYmFyLmRlbGF5KGIub3B0aW9ucy50aW1lb3V0KS5wcm9taXNlKCkuZG9uZShmdW5jdGlvbigpe2IuY2xvc2UoKX0pLHRoaXN9LGNsb3NlOmZ1bmN0aW9uKCl7aWYoISh0aGlzLmNsb3NlZHx8dGhpcy4kYmFyJiZ0aGlzLiRiYXIuaGFzQ2xhc3MoXCJpLWFtLWNsb3Npbmctbm93XCIpKSl7dmFyIGI9dGhpcztpZih0aGlzLnNob3dpbmcpcmV0dXJuIHZvaWQgYi4kYmFyLnF1ZXVlKGZ1bmN0aW9uKCl7Yi5jbG9zZS5hcHBseShiKX0pO2lmKCF0aGlzLnNob3duJiYhdGhpcy5zaG93aW5nKXt2YXIgYz1bXTtyZXR1cm4gYS5lYWNoKGEubm90eS5xdWV1ZSxmdW5jdGlvbihhLGQpe2Qub3B0aW9ucy5pZCE9Yi5vcHRpb25zLmlkJiZjLnB1c2goZCl9KSx2b2lkKGEubm90eS5xdWV1ZT1jKX1iLiRiYXIuYWRkQ2xhc3MoXCJpLWFtLWNsb3Npbmctbm93XCIpLGIub3B0aW9ucy5jYWxsYmFjay5vbkNsb3NlJiZiLm9wdGlvbnMuY2FsbGJhY2sub25DbG9zZS5hcHBseShiKSxcInN0cmluZ1wiPT10eXBlb2YgYi5vcHRpb25zLmFuaW1hdGlvbi5jbG9zZT9iLiRiYXIuYWRkQ2xhc3MoYi5vcHRpb25zLmFuaW1hdGlvbi5jbG9zZSkub25lKFwid2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZFwiLGZ1bmN0aW9uKCl7Yi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyQ2xvc2UmJmIub3B0aW9ucy5jYWxsYmFjay5hZnRlckNsb3NlLmFwcGx5KGIpLGIuY2xvc2VDbGVhblVwKCl9KTpiLiRiYXIuY2xlYXJRdWV1ZSgpLnN0b3AoKS5hbmltYXRlKGIub3B0aW9ucy5hbmltYXRpb24uY2xvc2UsYi5vcHRpb25zLmFuaW1hdGlvbi5zcGVlZCxiLm9wdGlvbnMuYW5pbWF0aW9uLmVhc2luZyxmdW5jdGlvbigpe2Iub3B0aW9ucy5jYWxsYmFjay5hZnRlckNsb3NlJiZiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJDbG9zZS5hcHBseShiKX0pLnByb21pc2UoKS5kb25lKGZ1bmN0aW9uKCl7Yi5jbG9zZUNsZWFuVXAoKX0pfX0sY2xvc2VDbGVhblVwOmZ1bmN0aW9uKCl7dmFyIGI9dGhpcztiLm9wdGlvbnMubW9kYWwmJihhLm5vdHlSZW5kZXJlci5zZXRNb2RhbENvdW50KC0xKSwwPT1hLm5vdHlSZW5kZXJlci5nZXRNb2RhbENvdW50KCkmJmEoXCIubm90eV9tb2RhbFwiKS5mYWRlT3V0KGIub3B0aW9ucy5hbmltYXRpb24uZmFkZVNwZWVkLGZ1bmN0aW9uKCl7YSh0aGlzKS5yZW1vdmUoKX0pKSxhLm5vdHlSZW5kZXJlci5zZXRMYXlvdXRDb3VudEZvcihiLC0xKSwwPT1hLm5vdHlSZW5kZXJlci5nZXRMYXlvdXRDb3VudEZvcihiKSYmYShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikucmVtb3ZlKCksXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGIuJGJhciYmbnVsbCE9PWIuJGJhciYmKFwic3RyaW5nXCI9PXR5cGVvZiBiLm9wdGlvbnMuYW5pbWF0aW9uLmNsb3NlPyhiLiRiYXIuY3NzKFwidHJhbnNpdGlvblwiLFwiYWxsIDEwMG1zIGVhc2VcIikuY3NzKFwiYm9yZGVyXCIsMCkuY3NzKFwibWFyZ2luXCIsMCkuaGVpZ2h0KDApLGIuJGJhci5vbmUoXCJ0cmFuc2l0aW9uZW5kIHdlYmtpdFRyYW5zaXRpb25FbmQgb1RyYW5zaXRpb25FbmQgTVNUcmFuc2l0aW9uRW5kXCIsZnVuY3Rpb24oKXtiLiRiYXIucmVtb3ZlKCksYi4kYmFyPW51bGwsYi5jbG9zZWQ9ITAsYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrJiZiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2sub25DbG9zZSYmYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrLm9uQ2xvc2UuYXBwbHkoYil9KSk6KGIuJGJhci5yZW1vdmUoKSxiLiRiYXI9bnVsbCxiLmNsb3NlZD0hMCkpLGRlbGV0ZSBhLm5vdHkuc3RvcmVbYi5vcHRpb25zLmlkXSxiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2smJmIub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vbkNsb3NlJiZiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2sub25DbG9zZS5hcHBseShiKSxiLm9wdGlvbnMuZGlzbWlzc1F1ZXVlfHwoYS5ub3R5Lm9udGFwPSEwLGEubm90eVJlbmRlcmVyLnJlbmRlcigpKSxiLm9wdGlvbnMubWF4VmlzaWJsZT4wJiZiLm9wdGlvbnMuZGlzbWlzc1F1ZXVlJiZhLm5vdHlSZW5kZXJlci5yZW5kZXIoKX0sc2V0VGV4dDpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5jbG9zZWR8fCh0aGlzLm9wdGlvbnMudGV4dD1hLHRoaXMuJGJhci5maW5kKFwiLm5vdHlfdGV4dFwiKS5odG1sKGEpKSx0aGlzfSxzZXRUeXBlOmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLmNsb3NlZHx8KHRoaXMub3B0aW9ucy50eXBlPWEsdGhpcy5vcHRpb25zLnRoZW1lLnN0eWxlLmFwcGx5KHRoaXMpLHRoaXMub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vblNob3cuYXBwbHkodGhpcykpLHRoaXN9LHNldFRpbWVvdXQ6ZnVuY3Rpb24oYSl7aWYoIXRoaXMuY2xvc2VkKXt2YXIgYj10aGlzO3RoaXMub3B0aW9ucy50aW1lb3V0PWEsYi4kYmFyLmRlbGF5KGIub3B0aW9ucy50aW1lb3V0KS5wcm9taXNlKCkuZG9uZShmdW5jdGlvbigpe2IuY2xvc2UoKX0pfXJldHVybiB0aGlzfSxzdG9wUHJvcGFnYXRpb246ZnVuY3Rpb24oYSl7YT1hfHx3aW5kb3cuZXZlbnQsXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGEuc3RvcFByb3BhZ2F0aW9uP2Euc3RvcFByb3BhZ2F0aW9uKCk6YS5jYW5jZWxCdWJibGU9ITB9LGNsb3NlZDohMSxzaG93aW5nOiExLHNob3duOiExfTthLm5vdHlSZW5kZXJlcj17fSxhLm5vdHlSZW5kZXJlci5pbml0PWZ1bmN0aW9uKGMpe3ZhciBkPU9iamVjdC5jcmVhdGUoYikuaW5pdChjKTtyZXR1cm4gZC5vcHRpb25zLmtpbGxlciYmYS5ub3R5LmNsb3NlQWxsKCksZC5vcHRpb25zLmZvcmNlP2Eubm90eS5xdWV1ZS51bnNoaWZ0KGQpOmEubm90eS5xdWV1ZS5wdXNoKGQpLGEubm90eVJlbmRlcmVyLnJlbmRlcigpLFwib2JqZWN0XCI9PWEubm90eS5yZXR1cm5zP2Q6ZC5vcHRpb25zLmlkfSxhLm5vdHlSZW5kZXJlci5yZW5kZXI9ZnVuY3Rpb24oKXt2YXIgYj1hLm5vdHkucXVldWVbMF07XCJvYmplY3RcIj09PWEudHlwZShiKT9iLm9wdGlvbnMuZGlzbWlzc1F1ZXVlP2Iub3B0aW9ucy5tYXhWaXNpYmxlPjA/YShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcitcIiA+IGxpXCIpLmxlbmd0aDxiLm9wdGlvbnMubWF4VmlzaWJsZSYmYS5ub3R5UmVuZGVyZXIuc2hvdyhhLm5vdHkucXVldWUuc2hpZnQoKSk6YS5ub3R5UmVuZGVyZXIuc2hvdyhhLm5vdHkucXVldWUuc2hpZnQoKSk6YS5ub3R5Lm9udGFwJiYoYS5ub3R5UmVuZGVyZXIuc2hvdyhhLm5vdHkucXVldWUuc2hpZnQoKSksYS5ub3R5Lm9udGFwPSExKTphLm5vdHkub250YXA9ITB9LGEubm90eVJlbmRlcmVyLnNob3c9ZnVuY3Rpb24oYil7Yi5vcHRpb25zLm1vZGFsJiYoYS5ub3R5UmVuZGVyZXIuY3JlYXRlTW9kYWxGb3IoYiksYS5ub3R5UmVuZGVyZXIuc2V0TW9kYWxDb3VudCgxKSksYi5vcHRpb25zLmN1c3RvbT8wPT1iLm9wdGlvbnMuY3VzdG9tLmZpbmQoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmxlbmd0aD9iLm9wdGlvbnMuY3VzdG9tLmFwcGVuZChhKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLm9iamVjdCkuYWRkQ2xhc3MoXCJpLWFtLW5ld1wiKSk6Yi5vcHRpb25zLmN1c3RvbS5maW5kKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5yZW1vdmVDbGFzcyhcImktYW0tbmV3XCIpOjA9PWEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmxlbmd0aD9hKFwiYm9keVwiKS5hcHBlbmQoYShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5vYmplY3QpLmFkZENsYXNzKFwiaS1hbS1uZXdcIikpOmEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLnJlbW92ZUNsYXNzKFwiaS1hbS1uZXdcIiksYS5ub3R5UmVuZGVyZXIuc2V0TGF5b3V0Q291bnRGb3IoYiwxKSxiLnNob3coKX0sYS5ub3R5UmVuZGVyZXIuY3JlYXRlTW9kYWxGb3I9ZnVuY3Rpb24oYil7aWYoMD09YShcIi5ub3R5X21vZGFsXCIpLmxlbmd0aCl7dmFyIGM9YShcIjxkaXYvPlwiKS5hZGRDbGFzcyhcIm5vdHlfbW9kYWxcIikuYWRkQ2xhc3MoYi5vcHRpb25zLnRoZW1lKS5kYXRhKFwibm90eV9tb2RhbF9jb3VudFwiLDApO2Iub3B0aW9ucy50aGVtZS5tb2RhbCYmYi5vcHRpb25zLnRoZW1lLm1vZGFsLmNzcyYmYy5jc3MoYi5vcHRpb25zLnRoZW1lLm1vZGFsLmNzcyksYy5wcmVwZW5kVG8oYShcImJvZHlcIikpLmZhZGVJbihiLm9wdGlvbnMuYW5pbWF0aW9uLmZhZGVTcGVlZCksYS5pbkFycmF5KFwiYmFja2Ryb3BcIixiLm9wdGlvbnMuY2xvc2VXaXRoKT4tMSYmYy5vbihcImNsaWNrXCIsZnVuY3Rpb24oYil7YS5ub3R5LmNsb3NlQWxsKCl9KX19LGEubm90eVJlbmRlcmVyLmdldExheW91dENvdW50Rm9yPWZ1bmN0aW9uKGIpe3JldHVybiBhKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5kYXRhKFwibm90eV9sYXlvdXRfY291bnRcIil8fDB9LGEubm90eVJlbmRlcmVyLnNldExheW91dENvdW50Rm9yPWZ1bmN0aW9uKGIsYyl7cmV0dXJuIGEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmRhdGEoXCJub3R5X2xheW91dF9jb3VudFwiLGEubm90eVJlbmRlcmVyLmdldExheW91dENvdW50Rm9yKGIpK2MpfSxhLm5vdHlSZW5kZXJlci5nZXRNb2RhbENvdW50PWZ1bmN0aW9uKCl7cmV0dXJuIGEoXCIubm90eV9tb2RhbFwiKS5kYXRhKFwibm90eV9tb2RhbF9jb3VudFwiKXx8MH0sYS5ub3R5UmVuZGVyZXIuc2V0TW9kYWxDb3VudD1mdW5jdGlvbihiKXtyZXR1cm4gYShcIi5ub3R5X21vZGFsXCIpLmRhdGEoXCJub3R5X21vZGFsX2NvdW50XCIsYS5ub3R5UmVuZGVyZXIuZ2V0TW9kYWxDb3VudCgpK2IpfSxhLmZuLm5vdHk9ZnVuY3Rpb24oYil7cmV0dXJuIGIuY3VzdG9tPWEodGhpcyksYS5ub3R5UmVuZGVyZXIuaW5pdChiKX0sYS5ub3R5PXt9LGEubm90eS5xdWV1ZT1bXSxhLm5vdHkub250YXA9ITAsYS5ub3R5LmxheW91dHM9e30sYS5ub3R5LnRoZW1lcz17fSxhLm5vdHkucmV0dXJucz1cIm9iamVjdFwiLGEubm90eS5zdG9yZT17fSxhLm5vdHkuZ2V0PWZ1bmN0aW9uKGIpe3JldHVybiBhLm5vdHkuc3RvcmUuaGFzT3duUHJvcGVydHkoYik/YS5ub3R5LnN0b3JlW2JdOiExfSxhLm5vdHkuY2xvc2U9ZnVuY3Rpb24oYil7cmV0dXJuIGEubm90eS5nZXQoYik/YS5ub3R5LmdldChiKS5jbG9zZSgpOiExfSxhLm5vdHkuc2V0VGV4dD1mdW5jdGlvbihiLGMpe3JldHVybiBhLm5vdHkuZ2V0KGIpP2Eubm90eS5nZXQoYikuc2V0VGV4dChjKTohMX0sYS5ub3R5LnNldFR5cGU9ZnVuY3Rpb24oYixjKXtyZXR1cm4gYS5ub3R5LmdldChiKT9hLm5vdHkuZ2V0KGIpLnNldFR5cGUoYyk6ITF9LGEubm90eS5jbGVhclF1ZXVlPWZ1bmN0aW9uKCl7YS5ub3R5LnF1ZXVlPVtdfSxhLm5vdHkuY2xvc2VBbGw9ZnVuY3Rpb24oKXthLm5vdHkuY2xlYXJRdWV1ZSgpLGEuZWFjaChhLm5vdHkuc3RvcmUsZnVuY3Rpb24oYSxiKXtiLmNsb3NlKCl9KX07dmFyIGM9d2luZG93LmFsZXJ0O3JldHVybiBhLm5vdHkuY29uc3VtZUFsZXJ0PWZ1bmN0aW9uKGIpe3dpbmRvdy5hbGVydD1mdW5jdGlvbihjKXtiP2IudGV4dD1jOmI9e3RleHQ6Y30sYS5ub3R5UmVuZGVyZXIuaW5pdChiKX19LGEubm90eS5zdG9wQ29uc3VtZUFsZXJ0PWZ1bmN0aW9uKCl7d2luZG93LmFsZXJ0PWN9LGEubm90eS5kZWZhdWx0cz17bGF5b3V0OlwidG9wXCIsdGhlbWU6XCJkZWZhdWx0VGhlbWVcIix0eXBlOlwiYWxlcnRcIix0ZXh0OlwiXCIsZGlzbWlzc1F1ZXVlOiEwLHRlbXBsYXRlOic8ZGl2IGNsYXNzPVwibm90eV9tZXNzYWdlXCI+PHNwYW4gY2xhc3M9XCJub3R5X3RleHRcIj48L3NwYW4+PGRpdiBjbGFzcz1cIm5vdHlfY2xvc2VcIj48L2Rpdj48L2Rpdj4nLGFuaW1hdGlvbjp7b3Blbjp7aGVpZ2h0OlwidG9nZ2xlXCJ9LGNsb3NlOntoZWlnaHQ6XCJ0b2dnbGVcIn0sZWFzaW5nOlwic3dpbmdcIixzcGVlZDo1MDAsZmFkZVNwZWVkOlwiZmFzdFwifSx0aW1lb3V0OiExLGZvcmNlOiExLG1vZGFsOiExLG1heFZpc2libGU6NSxraWxsZXI6ITEsY2xvc2VXaXRoOltcImNsaWNrXCJdLGNhbGxiYWNrOntvblNob3c6ZnVuY3Rpb24oKXt9LGFmdGVyU2hvdzpmdW5jdGlvbigpe30sb25DbG9zZTpmdW5jdGlvbigpe30sYWZ0ZXJDbG9zZTpmdW5jdGlvbigpe30sb25DbG9zZUNsaWNrOmZ1bmN0aW9uKCl7fX0sYnV0dG9uczohMX0sYSh3aW5kb3cpLm9uKFwicmVzaXplXCIsZnVuY3Rpb24oKXthLmVhY2goYS5ub3R5LmxheW91dHMsZnVuY3Rpb24oYixjKXtjLmNvbnRhaW5lci5zdHlsZS5hcHBseShhKGMuY29udGFpbmVyLnNlbGVjdG9yKSl9KX0pLHdpbmRvdy5ub3R5PWZ1bmN0aW9uKGIpe3JldHVybiBhLm5vdHlSZW5kZXJlci5pbml0KGIpfSxhLm5vdHkubGF5b3V0cy5ib3R0b209e25hbWU6XCJib3R0b21cIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2JvdHRvbV9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9ib3R0b21fbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe2JvdHRvbTowLGxlZnQ6XCI1JVwiLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjkwJVwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6OTk5OTk5OX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmJvdHRvbUNlbnRlcj17bmFtZTpcImJvdHRvbUNlbnRlclwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfYm90dG9tQ2VudGVyX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2JvdHRvbUNlbnRlcl9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7Ym90dG9tOjIwLGxlZnQ6MCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSksYSh0aGlzKS5jc3Moe2xlZnQ6KGEod2luZG93KS53aWR0aCgpLWEodGhpcykub3V0ZXJXaWR0aCghMSkpLzIrXCJweFwifSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmJvdHRvbUxlZnQ9e25hbWU6XCJib3R0b21MZWZ0XCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9ib3R0b21MZWZ0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2JvdHRvbUxlZnRfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe2JvdHRvbToyMCxsZWZ0OjIwLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KSx3aW5kb3cuaW5uZXJXaWR0aDw2MDAmJmEodGhpcykuY3NzKHtsZWZ0OjV9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuYm90dG9tUmlnaHQ9e25hbWU6XCJib3R0b21SaWdodFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfYm90dG9tUmlnaHRfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfYm90dG9tUmlnaHRfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe2JvdHRvbToyMCxyaWdodDoyMCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSksd2luZG93LmlubmVyV2lkdGg8NjAwJiZhKHRoaXMpLmNzcyh7cmlnaHQ6NX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5jZW50ZXI9e25hbWU6XCJjZW50ZXJcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2NlbnRlcl9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9jZW50ZXJfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3Bvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KTt2YXIgYj1hKHRoaXMpLmNsb25lKCkuY3NzKHt2aXNpYmlsaXR5OlwiaGlkZGVuXCIsZGlzcGxheTpcImJsb2NrXCIscG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDowLGxlZnQ6MH0pLmF0dHIoXCJpZFwiLFwiZHVwZVwiKTthKFwiYm9keVwiKS5hcHBlbmQoYiksYi5maW5kKFwiLmktYW0tY2xvc2luZy1ub3dcIikucmVtb3ZlKCksYi5maW5kKFwibGlcIikuY3NzKFwiZGlzcGxheVwiLFwiYmxvY2tcIik7dmFyIGM9Yi5oZWlnaHQoKTtiLnJlbW92ZSgpLGEodGhpcykuaGFzQ2xhc3MoXCJpLWFtLW5ld1wiKT9hKHRoaXMpLmNzcyh7bGVmdDooYSh3aW5kb3cpLndpZHRoKCktYSh0aGlzKS5vdXRlcldpZHRoKCExKSkvMitcInB4XCIsdG9wOihhKHdpbmRvdykuaGVpZ2h0KCktYykvMitcInB4XCJ9KTphKHRoaXMpLmFuaW1hdGUoe2xlZnQ6KGEod2luZG93KS53aWR0aCgpLWEodGhpcykub3V0ZXJXaWR0aCghMSkpLzIrXCJweFwiLHRvcDooYSh3aW5kb3cpLmhlaWdodCgpLWMpLzIrXCJweFwifSw1MDApfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5jZW50ZXJMZWZ0PXtuYW1lOlwiY2VudGVyTGVmdFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfY2VudGVyTGVmdF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9jZW50ZXJMZWZ0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtsZWZ0OjIwLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KTt2YXIgYj1hKHRoaXMpLmNsb25lKCkuY3NzKHt2aXNpYmlsaXR5OlwiaGlkZGVuXCIsZGlzcGxheTpcImJsb2NrXCIscG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDowLGxlZnQ6MH0pLmF0dHIoXCJpZFwiLFwiZHVwZVwiKTthKFwiYm9keVwiKS5hcHBlbmQoYiksYi5maW5kKFwiLmktYW0tY2xvc2luZy1ub3dcIikucmVtb3ZlKCksYi5maW5kKFwibGlcIikuY3NzKFwiZGlzcGxheVwiLFwiYmxvY2tcIik7dmFyIGM9Yi5oZWlnaHQoKTtiLnJlbW92ZSgpLGEodGhpcykuaGFzQ2xhc3MoXCJpLWFtLW5ld1wiKT9hKHRoaXMpLmNzcyh7dG9wOihhKHdpbmRvdykuaGVpZ2h0KCktYykvMitcInB4XCJ9KTphKHRoaXMpLmFuaW1hdGUoe3RvcDooYSh3aW5kb3cpLmhlaWdodCgpLWMpLzIrXCJweFwifSw1MDApLHdpbmRvdy5pbm5lcldpZHRoPDYwMCYmYSh0aGlzKS5jc3Moe2xlZnQ6NX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5jZW50ZXJSaWdodD17bmFtZTpcImNlbnRlclJpZ2h0XCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9jZW50ZXJSaWdodF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9jZW50ZXJSaWdodF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7cmlnaHQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pO3ZhciBiPWEodGhpcykuY2xvbmUoKS5jc3Moe3Zpc2liaWxpdHk6XCJoaWRkZW5cIixkaXNwbGF5OlwiYmxvY2tcIixwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOjAsbGVmdDowfSkuYXR0cihcImlkXCIsXCJkdXBlXCIpO2EoXCJib2R5XCIpLmFwcGVuZChiKSxiLmZpbmQoXCIuaS1hbS1jbG9zaW5nLW5vd1wiKS5yZW1vdmUoKSxiLmZpbmQoXCJsaVwiKS5jc3MoXCJkaXNwbGF5XCIsXCJibG9ja1wiKTt2YXIgYz1iLmhlaWdodCgpO2IucmVtb3ZlKCksYSh0aGlzKS5oYXNDbGFzcyhcImktYW0tbmV3XCIpP2EodGhpcykuY3NzKHt0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0pOmEodGhpcykuYW5pbWF0ZSh7dG9wOihhKHdpbmRvdykuaGVpZ2h0KCktYykvMitcInB4XCJ9LDUwMCksd2luZG93LmlubmVyV2lkdGg8NjAwJiZhKHRoaXMpLmNzcyh7cmlnaHQ6NX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5pbmxpbmU9e25hbWU6XCJpbmxpbmVcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgY2xhc3M9XCJub3R5X2lubGluZV9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwubm90eV9pbmxpbmVfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3dpZHRoOlwiMTAwJVwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6OTk5OTk5OX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLnRvcD17bmFtZTpcInRvcFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfdG9wX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X3RvcF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7dG9wOjAsbGVmdDpcIjUlXCIscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiOTAlXCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDo5OTk5OTk5fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMudG9wQ2VudGVyPXtuYW1lOlwidG9wQ2VudGVyXCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV90b3BDZW50ZXJfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfdG9wQ2VudGVyX2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHt0b3A6MjAsbGVmdDowLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KSxhKHRoaXMpLmNzcyh7bGVmdDooYSh3aW5kb3cpLndpZHRoKCktYSh0aGlzKS5vdXRlcldpZHRoKCExKSkvMitcInB4XCJ9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMudG9wTGVmdD17bmFtZTpcInRvcExlZnRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X3RvcExlZnRfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfdG9wTGVmdF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7dG9wOjIwLGxlZnQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLHdpbmRvdy5pbm5lcldpZHRoPDYwMCYmYSh0aGlzKS5jc3Moe2xlZnQ6NX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy50b3BSaWdodD17bmFtZTpcInRvcFJpZ2h0XCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV90b3BSaWdodF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV90b3BSaWdodF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7dG9wOjIwLHJpZ2h0OjIwLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KSx3aW5kb3cuaW5uZXJXaWR0aDw2MDAmJmEodGhpcykuY3NzKHtyaWdodDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS50aGVtZXMuYm9vdHN0cmFwVGhlbWU9e25hbWU6XCJib290c3RyYXBUaGVtZVwiLG1vZGFsOntjc3M6e3Bvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjEwMCVcIixoZWlnaHQ6XCIxMDAlXCIsYmFja2dyb3VuZENvbG9yOlwiIzAwMFwiLHpJbmRleDoxZTQsb3BhY2l0eTouNixkaXNwbGF5Olwibm9uZVwiLGxlZnQ6MCx0b3A6MH19LHN0eWxlOmZ1bmN0aW9uKCl7dmFyIGI9dGhpcy5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3I7c3dpdGNoKGEoYikuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwXCIpLHRoaXMuJGNsb3NlQnV0dG9uLmFwcGVuZCgnPHNwYW4gYXJpYS1oaWRkZW49XCJ0cnVlXCI+JnRpbWVzOzwvc3Bhbj48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5DbG9zZTwvc3Bhbj4nKSx0aGlzLiRjbG9zZUJ1dHRvbi5hZGRDbGFzcyhcImNsb3NlXCIpLHRoaXMuJGJhci5hZGRDbGFzcyhcImxpc3QtZ3JvdXAtaXRlbVwiKS5jc3MoXCJwYWRkaW5nXCIsXCIwcHhcIiksdGhpcy5vcHRpb25zLnR5cGUpe2Nhc2VcImFsZXJ0XCI6Y2FzZVwibm90aWZpY2F0aW9uXCI6dGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtLWluZm9cIik7YnJlYWs7Y2FzZVwid2FybmluZ1wiOnRoaXMuJGJhci5hZGRDbGFzcyhcImxpc3QtZ3JvdXAtaXRlbS13YXJuaW5nXCIpO2JyZWFrO2Nhc2VcImVycm9yXCI6dGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtLWRhbmdlclwiKTticmVhaztjYXNlXCJpbmZvcm1hdGlvblwiOnRoaXMuJGJhci5hZGRDbGFzcyhcImxpc3QtZ3JvdXAtaXRlbS1pbmZvXCIpO2JyZWFrO2Nhc2VcInN1Y2Nlc3NcIjp0aGlzLiRiYXIuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwLWl0ZW0tc3VjY2Vzc1wiKX10aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsbGluZUhlaWdodDpcIjE2cHhcIix0ZXh0QWxpZ246XCJjZW50ZXJcIixwYWRkaW5nOlwiOHB4IDEwcHggOXB4XCIsd2lkdGg6XCJhdXRvXCIscG9zaXRpb246XCJyZWxhdGl2ZVwifSl9LGNhbGxiYWNrOntvblNob3c6ZnVuY3Rpb24oKXt9LG9uQ2xvc2U6ZnVuY3Rpb24oKXt9fX0sYS5ub3R5LnRoZW1lcy5kZWZhdWx0VGhlbWU9e25hbWU6XCJkZWZhdWx0VGhlbWVcIixoZWxwZXJzOntib3JkZXJGaXg6ZnVuY3Rpb24oKXtpZih0aGlzLm9wdGlvbnMuZGlzbWlzc1F1ZXVlKXt2YXIgYj10aGlzLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcitcIiBcIit0aGlzLm9wdGlvbnMubGF5b3V0LnBhcmVudC5zZWxlY3Rvcjtzd2l0Y2godGhpcy5vcHRpb25zLmxheW91dC5uYW1lKXtjYXNlXCJ0b3BcIjphKGIpLmNzcyh7Ym9yZGVyUmFkaXVzOlwiMHB4IDBweCAwcHggMHB4XCJ9KSxhKGIpLmxhc3QoKS5jc3Moe2JvcmRlclJhZGl1czpcIjBweCAwcHggNXB4IDVweFwifSk7YnJlYWs7Y2FzZVwidG9wQ2VudGVyXCI6Y2FzZVwidG9wTGVmdFwiOmNhc2VcInRvcFJpZ2h0XCI6Y2FzZVwiYm90dG9tQ2VudGVyXCI6Y2FzZVwiYm90dG9tTGVmdFwiOmNhc2VcImJvdHRvbVJpZ2h0XCI6Y2FzZVwiY2VudGVyXCI6Y2FzZVwiY2VudGVyTGVmdFwiOmNhc2VcImNlbnRlclJpZ2h0XCI6Y2FzZVwiaW5saW5lXCI6YShiKS5jc3Moe2JvcmRlclJhZGl1czpcIjBweCAwcHggMHB4IDBweFwifSksYShiKS5maXJzdCgpLmNzcyh7XCJib3JkZXItdG9wLWxlZnQtcmFkaXVzXCI6XCI1cHhcIixcImJvcmRlci10b3AtcmlnaHQtcmFkaXVzXCI6XCI1cHhcIn0pLGEoYikubGFzdCgpLmNzcyh7XCJib3JkZXItYm90dG9tLWxlZnQtcmFkaXVzXCI6XCI1cHhcIixcImJvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzXCI6XCI1cHhcIn0pO2JyZWFrO2Nhc2VcImJvdHRvbVwiOmEoYikuY3NzKHtib3JkZXJSYWRpdXM6XCIwcHggMHB4IDBweCAwcHhcIn0pLGEoYikuZmlyc3QoKS5jc3Moe2JvcmRlclJhZGl1czpcIjVweCA1cHggMHB4IDBweFwifSl9fX19LG1vZGFsOntjc3M6e3Bvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjEwMCVcIixoZWlnaHQ6XCIxMDAlXCIsYmFja2dyb3VuZENvbG9yOlwiIzAwMFwiLHpJbmRleDoxZTQsb3BhY2l0eTouNixkaXNwbGF5Olwibm9uZVwiLGxlZnQ6MCx0b3A6MH19LHN0eWxlOmZ1bmN0aW9uKCl7c3dpdGNoKHRoaXMuJGJhci5jc3Moe292ZXJmbG93OlwiaGlkZGVuXCIsYmFja2dyb3VuZDpcInVybCgnZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFCc0FBQUFvQ0FRQUFBQ2xNMG5kQUFBQWhrbEVRVlI0QWRYTzBRckNNQkJFMGJ0dGtrMzgvdzhXUkVScGR5anpWT2MrSHhoSUhxSkdNUWNGRmtwWVJRb3RMTFN3MElKNWFCZG92cnVNWURBL2tUOHBsRjlaS0xGUWNnRjE4aERqMVNiUU9NbENBNGthbzBpaVhtYWg3cUJXUGR4cG9oc2dWWnlqN2U1STlLY0lEK0VoaURJNWd4QllLTEJRWUtIQVFvR0ZBb0Vrcy9ZRUdIWUtCN2hGeGYwQUFBQUFTVVZPUks1Q1lJST0nKSByZXBlYXQteCBzY3JvbGwgbGVmdCB0b3AgI2ZmZlwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTNweFwiLGxpbmVIZWlnaHQ6XCIxNnB4XCIsdGV4dEFsaWduOlwiY2VudGVyXCIscGFkZGluZzpcIjhweCAxMHB4IDlweFwiLHdpZHRoOlwiYXV0b1wiLHBvc2l0aW9uOlwicmVsYXRpdmVcIn0pLHRoaXMuJGNsb3NlQnV0dG9uLmNzcyh7cG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDo0LHJpZ2h0OjQsd2lkdGg6MTAsaGVpZ2h0OjEwLGJhY2tncm91bmQ6XCJ1cmwoZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBb0FBQUFLQ0FRQUFBQW5Pd2MyQUFBQXhVbEVRVlI0QVIzTVBVb0RVUlNBMGUrK3VTa2tPeEMzSUFPV050YUNJRGFDaGZnWEJNRVpiUVJCeXhDd2srQmFzZ1FSWkxTWW9MZ0RRYkFSeHJ5OG55dW1QY1ZSS0RmZDBBYThBc2dEdjF6cDZwWWQ1aldPd2h2ZWJSVGJ6Tk5FdzVCU3NJcHNqL2t1clFCbm1rN3NJRmNDRjV5eVpQRFJHNnRyUWh1alhZb3NhRm9jKzJmMU1KODl1Yzc2SU5ENkY5QnZsWFVkcGI2eHdEMis0cTNtZTNieXNpSHZ0TFlyVUp0bzdQRC92ZTdMTkh4U2cvd29OMmtTejR0eGFzQmRoeWl6M3VnUEdldFRqbTNYUm9rQUFBQUFTVVZPUks1Q1lJST0pXCIsZGlzcGxheTpcIm5vbmVcIixjdXJzb3I6XCJwb2ludGVyXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7cGFkZGluZzo1LHRleHRBbGlnbjpcInJpZ2h0XCIsYm9yZGVyVG9wOlwiMXB4IHNvbGlkICNjY2NcIixiYWNrZ3JvdW5kQ29sb3I6XCIjZmZmXCJ9KSx0aGlzLiRidXR0b25zLmZpbmQoXCJidXR0b25cIikuY3NzKHttYXJnaW5MZWZ0OjV9KSx0aGlzLiRidXR0b25zLmZpbmQoXCJidXR0b246Zmlyc3RcIikuY3NzKHttYXJnaW5MZWZ0OjB9KSx0aGlzLiRiYXIub24oe21vdXNlZW50ZXI6ZnVuY3Rpb24oKXthKHRoaXMpLmZpbmQoXCIubm90eV9jbG9zZVwiKS5zdG9wKCkuZmFkZVRvKFwibm9ybWFsXCIsMSl9LG1vdXNlbGVhdmU6ZnVuY3Rpb24oKXthKHRoaXMpLmZpbmQoXCIubm90eV9jbG9zZVwiKS5zdG9wKCkuZmFkZVRvKFwibm9ybWFsXCIsMCl9fSksdGhpcy5vcHRpb25zLmxheW91dC5uYW1lKXtjYXNlXCJ0b3BcIjp0aGlzLiRiYXIuY3NzKHtib3JkZXJSYWRpdXM6XCIwcHggMHB4IDVweCA1cHhcIixib3JkZXJCb3R0b206XCIycHggc29saWQgI2VlZVwiLGJvcmRlckxlZnQ6XCIycHggc29saWQgI2VlZVwiLGJvcmRlclJpZ2h0OlwiMnB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KTticmVhaztjYXNlXCJ0b3BDZW50ZXJcIjpjYXNlXCJjZW50ZXJcIjpjYXNlXCJib3R0b21DZW50ZXJcIjpjYXNlXCJpbmxpbmVcIjp0aGlzLiRiYXIuY3NzKHtib3JkZXJSYWRpdXM6XCI1cHhcIixib3JkZXI6XCIxcHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjEzcHhcIix0ZXh0QWxpZ246XCJjZW50ZXJcIn0pO2JyZWFrO2Nhc2VcInRvcExlZnRcIjpjYXNlXCJ0b3BSaWdodFwiOmNhc2VcImJvdHRvbUxlZnRcIjpjYXNlXCJib3R0b21SaWdodFwiOmNhc2VcImNlbnRlckxlZnRcIjpjYXNlXCJjZW50ZXJSaWdodFwiOnRoaXMuJGJhci5jc3Moe2JvcmRlclJhZGl1czpcIjVweFwiLGJvcmRlcjpcIjFweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTNweFwiLHRleHRBbGlnbjpcImxlZnRcIn0pO2JyZWFrO2Nhc2VcImJvdHRvbVwiOnRoaXMuJGJhci5jc3Moe2JvcmRlclJhZGl1czpcIjVweCA1cHggMHB4IDBweFwiLGJvcmRlclRvcDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyTGVmdDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyUmlnaHQ6XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgLTJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KTticmVhaztkZWZhdWx0OnRoaXMuJGJhci5jc3Moe2JvcmRlcjpcIjJweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSl9c3dpdGNoKHRoaXMub3B0aW9ucy50eXBlKXtjYXNlXCJhbGVydFwiOmNhc2VcIm5vdGlmaWNhdGlvblwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkZcIixib3JkZXJDb2xvcjpcIiNDQ0NcIixjb2xvcjpcIiM0NDRcIn0pO2JyZWFrO2Nhc2VcIndhcm5pbmdcIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkZFQUE4XCIsYm9yZGVyQ29sb3I6XCIjRkZDMjM3XCIsY29sb3I6XCIjODI2MjAwXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkICNGRkMyMzdcIn0pO2JyZWFrO2Nhc2VcImVycm9yXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwicmVkXCIsYm9yZGVyQ29sb3I6XCJkYXJrcmVkXCIsY29sb3I6XCIjRkZGXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFdlaWdodDpcImJvbGRcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgZGFya3JlZFwifSk7YnJlYWs7Y2FzZVwiaW5mb3JtYXRpb25cIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjNTdCN0UyXCIsYm9yZGVyQ29sb3I6XCIjMEI5MEM0XCIsY29sb3I6XCIjRkZGXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkICMwQjkwQzRcIn0pO2JyZWFrO2Nhc2VcInN1Y2Nlc3NcIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCJsaWdodGdyZWVuXCIsYm9yZGVyQ29sb3I6XCIjNTBDMjRFXCIsY29sb3I6XCJkYXJrZ3JlZW5cIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgIzUwQzI0RVwifSk7YnJlYWs7ZGVmYXVsdDp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkZGXCIsYm9yZGVyQ29sb3I6XCIjQ0NDXCIsY29sb3I6XCIjNDQ0XCJ9KX19LGNhbGxiYWNrOntvblNob3c6ZnVuY3Rpb24oKXthLm5vdHkudGhlbWVzLmRlZmF1bHRUaGVtZS5oZWxwZXJzLmJvcmRlckZpeC5hcHBseSh0aGlzKX0sb25DbG9zZTpmdW5jdGlvbigpe2Eubm90eS50aGVtZXMuZGVmYXVsdFRoZW1lLmhlbHBlcnMuYm9yZGVyRml4LmFwcGx5KHRoaXMpfX19LGEubm90eS50aGVtZXMucmVsYXg9e25hbWU6XCJyZWxheFwiLGhlbHBlcnM6e30sbW9kYWw6e2Nzczp7cG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMTAwJVwiLGhlaWdodDpcIjEwMCVcIixiYWNrZ3JvdW5kQ29sb3I6XCIjMDAwXCIsekluZGV4OjFlNCxvcGFjaXR5Oi42LGRpc3BsYXk6XCJub25lXCIsbGVmdDowLHRvcDowfX0sc3R5bGU6ZnVuY3Rpb24oKXtzd2l0Y2godGhpcy4kYmFyLmNzcyh7b3ZlcmZsb3c6XCJoaWRkZW5cIixtYXJnaW46XCI0cHggMFwiLGJvcmRlclJhZGl1czpcIjJweFwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTRweFwiLGxpbmVIZWlnaHQ6XCIxNnB4XCIsdGV4dEFsaWduOlwiY2VudGVyXCIscGFkZGluZzpcIjEwcHhcIix3aWR0aDpcImF1dG9cIixwb3NpdGlvbjpcInJlbGF0aXZlXCJ9KSx0aGlzLiRjbG9zZUJ1dHRvbi5jc3Moe3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6NCxyaWdodDo0LHdpZHRoOjEwLGhlaWdodDoxMCxiYWNrZ3JvdW5kOlwidXJsKGRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQW9BQUFBS0NBUUFBQUFuT3djMkFBQUF4VWxFUVZSNEFSM01QVW9EVVJTQTBlKyt1U2trT3hDM0lBT1dOdGFDSURhQ2hmZ1hCTUVaYlFSQnl4Q3drK0Jhc2dRUlpMU1lvTGdEUWJBUnhyeThueXVtUGNWUktEZmQwQWE4QXNnRHYxenA2cFlkNWpXT3dodmViUlRiek5ORXc1QlNzSXBzai9rdXJRQm5tazdzSUZjQ0Y1eXlaUERSRzZ0clFodWpYWW9zYUZvYysyZjFNSjg5dWM3NklORDZGOUJ2bFhVZHBiNnh3RDIrNHEzbWUzYnlzaUh2dExZclVKdG83UEQvdmU3TE5IeFNnL3dvTjJrU3o0dHhhc0JkaHlpejN1Z1BHZXRUam0zWFJva0FBQUFBU1VWT1JLNUNZSUk9KVwiLGRpc3BsYXk6XCJub25lXCIsY3Vyc29yOlwicG9pbnRlclwifSksdGhpcy4kYnV0dG9ucy5jc3Moe3BhZGRpbmc6NSx0ZXh0QWxpZ246XCJyaWdodFwiLGJvcmRlclRvcDpcIjFweCBzb2xpZCAjY2NjXCIsYmFja2dyb3VuZENvbG9yOlwiI2ZmZlwifSksdGhpcy4kYnV0dG9ucy5maW5kKFwiYnV0dG9uXCIpLmNzcyh7bWFyZ2luTGVmdDo1fSksdGhpcy4kYnV0dG9ucy5maW5kKFwiYnV0dG9uOmZpcnN0XCIpLmNzcyh7bWFyZ2luTGVmdDowfSksdGhpcy4kYmFyLm9uKHttb3VzZWVudGVyOmZ1bmN0aW9uKCl7YSh0aGlzKS5maW5kKFwiLm5vdHlfY2xvc2VcIikuc3RvcCgpLmZhZGVUbyhcIm5vcm1hbFwiLDEpfSxtb3VzZWxlYXZlOmZ1bmN0aW9uKCl7YSh0aGlzKS5maW5kKFwiLm5vdHlfY2xvc2VcIikuc3RvcCgpLmZhZGVUbyhcIm5vcm1hbFwiLDApfX0pLHRoaXMub3B0aW9ucy5sYXlvdXQubmFtZSl7Y2FzZVwidG9wXCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyQm90dG9tOlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJMZWZ0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJSaWdodDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyVG9wOlwiMnB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KTticmVhaztjYXNlXCJ0b3BDZW50ZXJcIjpjYXNlXCJjZW50ZXJcIjpjYXNlXCJib3R0b21DZW50ZXJcIjpjYXNlXCJpbmxpbmVcIjp0aGlzLiRiYXIuY3NzKHtib3JkZXI6XCIxcHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjEzcHhcIix0ZXh0QWxpZ246XCJjZW50ZXJcIn0pO2JyZWFrO2Nhc2VcInRvcExlZnRcIjpjYXNlXCJ0b3BSaWdodFwiOmNhc2VcImJvdHRvbUxlZnRcIjpjYXNlXCJib3R0b21SaWdodFwiOmNhc2VcImNlbnRlckxlZnRcIjpjYXNlXCJjZW50ZXJSaWdodFwiOnRoaXMuJGJhci5jc3Moe2JvcmRlcjpcIjFweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTNweFwiLHRleHRBbGlnbjpcImxlZnRcIn0pO2JyZWFrO2Nhc2VcImJvdHRvbVwiOnRoaXMuJGJhci5jc3Moe2JvcmRlclRvcDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyTGVmdDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyUmlnaHQ6XCIycHggc29saWQgI2VlZVwiLGJvcmRlckJvdHRvbTpcIjJweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAtMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pO2JyZWFrO2RlZmF1bHQ6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyOlwiMnB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KX1zd2l0Y2godGhpcy5vcHRpb25zLnR5cGUpe2Nhc2VcImFsZXJ0XCI6Y2FzZVwibm90aWZpY2F0aW9uXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGRlwiLGJvcmRlckNvbG9yOlwiI2RlZGVkZVwiLGNvbG9yOlwiIzQ0NFwifSk7YnJlYWs7Y2FzZVwid2FybmluZ1wiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkVBQThcIixib3JkZXJDb2xvcjpcIiNGRkMyMzdcIixjb2xvcjpcIiM4MjYyMDBcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgI0ZGQzIzN1wifSk7YnJlYWs7Y2FzZVwiZXJyb3JcIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkY4MTgxXCIsYm9yZGVyQ29sb3I6XCIjZTI1MzUzXCIsY29sb3I6XCIjRkZGXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFdlaWdodDpcImJvbGRcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgZGFya3JlZFwifSk7YnJlYWs7Y2FzZVwiaW5mb3JtYXRpb25cIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjNzhDNUU3XCIsYm9yZGVyQ29sb3I6XCIjM2JhZGQ2XCIsY29sb3I6XCIjRkZGXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkICMwQjkwQzRcIn0pO2JyZWFrO2Nhc2VcInN1Y2Nlc3NcIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjQkNGNUJDXCIsYm9yZGVyQ29sb3I6XCIjN2NkZDc3XCIsY29sb3I6XCJkYXJrZ3JlZW5cIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgIzUwQzI0RVwifSk7YnJlYWs7ZGVmYXVsdDp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkZGXCIsYm9yZGVyQ29sb3I6XCIjQ0NDXCIsY29sb3I6XCIjNDQ0XCJ9KX19LGNhbGxiYWNrOntvblNob3c6ZnVuY3Rpb24oKXt9LG9uQ2xvc2U6ZnVuY3Rpb24oKXt9fX0sd2luZG93Lm5vdHl9KTsiLCIvKiFcclxuICogTW9ja0pheCAtIGpRdWVyeSBQbHVnaW4gdG8gTW9jayBBamF4IHJlcXVlc3RzXHJcbiAqXHJcbiAqIFZlcnNpb246ICAxLjUuM1xyXG4gKiBSZWxlYXNlZDpcclxuICogSG9tZTogICBodHRwOi8vZ2l0aHViLmNvbS9hcHBlbmR0by9qcXVlcnktbW9ja2pheFxyXG4gKiBBdXRob3I6ICAgSm9uYXRoYW4gU2hhcnAgKGh0dHA6Ly9qZHNoYXJwLmNvbSlcclxuICogTGljZW5zZTogIE1JVCxHUExcclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDExIGFwcGVuZFRvIExMQy5cclxuICogRHVhbCBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIG9yIEdQTCBsaWNlbnNlcy5cclxuICogaHR0cDovL2FwcGVuZHRvLmNvbS9vcGVuLXNvdXJjZS1saWNlbnNlc1xyXG4gKi9cclxuKGZ1bmN0aW9uKCQpIHtcclxuXHR2YXIgX2FqYXggPSAkLmFqYXgsXHJcblx0XHRtb2NrSGFuZGxlcnMgPSBbXSxcclxuXHRcdG1vY2tlZEFqYXhDYWxscyA9IFtdLFxyXG5cdFx0Q0FMTEJBQ0tfUkVHRVggPSAvPVxcPygmfCQpLyxcclxuXHRcdGpzYyA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XHJcblxyXG5cclxuXHQvLyBQYXJzZSB0aGUgZ2l2ZW4gWE1MIHN0cmluZy5cclxuXHRmdW5jdGlvbiBwYXJzZVhNTCh4bWwpIHtcclxuXHRcdGlmICggd2luZG93LkRPTVBhcnNlciA9PSB1bmRlZmluZWQgJiYgd2luZG93LkFjdGl2ZVhPYmplY3QgKSB7XHJcblx0XHRcdERPTVBhcnNlciA9IGZ1bmN0aW9uKCkgeyB9O1xyXG5cdFx0XHRET01QYXJzZXIucHJvdG90eXBlLnBhcnNlRnJvbVN0cmluZyA9IGZ1bmN0aW9uKCB4bWxTdHJpbmcgKSB7XHJcblx0XHRcdFx0dmFyIGRvYyA9IG5ldyBBY3RpdmVYT2JqZWN0KCdNaWNyb3NvZnQuWE1MRE9NJyk7XHJcblx0XHRcdFx0ZG9jLmFzeW5jID0gJ2ZhbHNlJztcclxuXHRcdFx0XHRkb2MubG9hZFhNTCggeG1sU3RyaW5nICk7XHJcblx0XHRcdFx0cmV0dXJuIGRvYztcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHJcblx0XHR0cnkge1xyXG5cdFx0XHR2YXIgeG1sRG9jID0gKCBuZXcgRE9NUGFyc2VyKCkgKS5wYXJzZUZyb21TdHJpbmcoIHhtbCwgJ3RleHQveG1sJyApO1xyXG5cdFx0XHRpZiAoICQuaXNYTUxEb2MoIHhtbERvYyApICkge1xyXG5cdFx0XHRcdHZhciBlcnIgPSAkKCdwYXJzZXJlcnJvcicsIHhtbERvYyk7XHJcblx0XHRcdFx0aWYgKCBlcnIubGVuZ3RoID09IDEgKSB7XHJcblx0XHRcdFx0XHR0aHJvdygnRXJyb3I6ICcgKyAkKHhtbERvYykudGV4dCgpICk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRocm93KCdVbmFibGUgdG8gcGFyc2UgWE1MJyk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHhtbERvYztcclxuXHRcdH0gY2F0Y2goIGUgKSB7XHJcblx0XHRcdHZhciBtc2cgPSAoIGUubmFtZSA9PSB1bmRlZmluZWQgPyBlIDogZS5uYW1lICsgJzogJyArIGUubWVzc2FnZSApO1xyXG5cdFx0XHQkKGRvY3VtZW50KS50cmlnZ2VyKCd4bWxQYXJzZUVycm9yJywgWyBtc2cgXSk7XHJcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBUcmlnZ2VyIGEgalF1ZXJ5IGV2ZW50XHJcblx0ZnVuY3Rpb24gdHJpZ2dlcihzLCB0eXBlLCBhcmdzKSB7XHJcblx0XHQocy5jb250ZXh0ID8gJChzLmNvbnRleHQpIDogJC5ldmVudCkudHJpZ2dlcih0eXBlLCBhcmdzKTtcclxuXHR9XHJcblxyXG5cdC8vIENoZWNrIGlmIHRoZSBkYXRhIGZpZWxkIG9uIHRoZSBtb2NrIGhhbmRsZXIgYW5kIHRoZSByZXF1ZXN0IG1hdGNoLiBUaGlzXHJcblx0Ly8gY2FuIGJlIHVzZWQgdG8gcmVzdHJpY3QgYSBtb2NrIGhhbmRsZXIgdG8gYmVpbmcgdXNlZCBvbmx5IHdoZW4gYSBjZXJ0YWluXHJcblx0Ly8gc2V0IG9mIGRhdGEgaXMgcGFzc2VkIHRvIGl0LlxyXG5cdGZ1bmN0aW9uIGlzTW9ja0RhdGFFcXVhbCggbW9jaywgbGl2ZSApIHtcclxuXHRcdHZhciBpZGVudGljYWwgPSB0cnVlO1xyXG5cdFx0Ly8gVGVzdCBmb3Igc2l0dWF0aW9ucyB3aGVyZSB0aGUgZGF0YSBpcyBhIHF1ZXJ5c3RyaW5nIChub3QgYW4gb2JqZWN0KVxyXG5cdFx0aWYgKHR5cGVvZiBsaXZlID09PSAnc3RyaW5nJykge1xyXG5cdFx0XHQvLyBRdWVyeXN0cmluZyBtYXkgYmUgYSByZWdleFxyXG5cdFx0XHRyZXR1cm4gJC5pc0Z1bmN0aW9uKCBtb2NrLnRlc3QgKSA/IG1vY2sudGVzdChsaXZlKSA6IG1vY2sgPT0gbGl2ZTtcclxuXHRcdH1cclxuXHRcdCQuZWFjaChtb2NrLCBmdW5jdGlvbihrKSB7XHJcblx0XHRcdGlmICggbGl2ZVtrXSA9PT0gdW5kZWZpbmVkICkge1xyXG5cdFx0XHRcdGlkZW50aWNhbCA9IGZhbHNlO1xyXG5cdFx0XHRcdHJldHVybiBpZGVudGljYWw7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aWYgKCB0eXBlb2YgbGl2ZVtrXSA9PT0gJ29iamVjdCcgJiYgbGl2ZVtrXSAhPT0gbnVsbCApIHtcclxuXHRcdFx0XHRcdGlmICggaWRlbnRpY2FsICYmICQuaXNBcnJheSggbGl2ZVtrXSApICkge1xyXG5cdFx0XHRcdFx0XHRpZGVudGljYWwgPSAkLmlzQXJyYXkoIG1vY2tba10gKSAmJiBsaXZlW2tdLmxlbmd0aCA9PT0gbW9ja1trXS5sZW5ndGg7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZGVudGljYWwgPSBpZGVudGljYWwgJiYgaXNNb2NrRGF0YUVxdWFsKG1vY2tba10sIGxpdmVba10pO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRpZiAoIG1vY2tba10gJiYgJC5pc0Z1bmN0aW9uKCBtb2NrW2tdLnRlc3QgKSApIHtcclxuXHRcdFx0XHRcdFx0aWRlbnRpY2FsID0gaWRlbnRpY2FsICYmIG1vY2tba10udGVzdChsaXZlW2tdKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdGlkZW50aWNhbCA9IGlkZW50aWNhbCAmJiAoIG1vY2tba10gPT0gbGl2ZVtrXSApO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0cmV0dXJuIGlkZW50aWNhbDtcclxuXHR9XHJcblxyXG4gICAgLy8gU2VlIGlmIGEgbW9jayBoYW5kbGVyIHByb3BlcnR5IG1hdGNoZXMgdGhlIGRlZmF1bHQgc2V0dGluZ3NcclxuICAgIGZ1bmN0aW9uIGlzRGVmYXVsdFNldHRpbmcoaGFuZGxlciwgcHJvcGVydHkpIHtcclxuICAgICAgICByZXR1cm4gaGFuZGxlcltwcm9wZXJ0eV0gPT09ICQubW9ja2pheFNldHRpbmdzW3Byb3BlcnR5XTtcclxuICAgIH1cclxuXHJcblx0Ly8gQ2hlY2sgdGhlIGdpdmVuIGhhbmRsZXIgc2hvdWxkIG1vY2sgdGhlIGdpdmVuIHJlcXVlc3RcclxuXHRmdW5jdGlvbiBnZXRNb2NrRm9yUmVxdWVzdCggaGFuZGxlciwgcmVxdWVzdFNldHRpbmdzICkge1xyXG5cdFx0Ly8gSWYgdGhlIG1vY2sgd2FzIHJlZ2lzdGVyZWQgd2l0aCBhIGZ1bmN0aW9uLCBsZXQgdGhlIGZ1bmN0aW9uIGRlY2lkZSBpZiB3ZVxyXG5cdFx0Ly8gd2FudCB0byBtb2NrIHRoaXMgcmVxdWVzdFxyXG5cdFx0aWYgKCAkLmlzRnVuY3Rpb24oaGFuZGxlcikgKSB7XHJcblx0XHRcdHJldHVybiBoYW5kbGVyKCByZXF1ZXN0U2V0dGluZ3MgKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBJbnNwZWN0IHRoZSBVUkwgb2YgdGhlIHJlcXVlc3QgYW5kIGNoZWNrIGlmIHRoZSBtb2NrIGhhbmRsZXIncyB1cmxcclxuXHRcdC8vIG1hdGNoZXMgdGhlIHVybCBmb3IgdGhpcyBhamF4IHJlcXVlc3RcclxuXHRcdGlmICggJC5pc0Z1bmN0aW9uKGhhbmRsZXIudXJsLnRlc3QpICkge1xyXG5cdFx0XHQvLyBUaGUgdXNlciBwcm92aWRlZCBhIHJlZ2V4IGZvciB0aGUgdXJsLCB0ZXN0IGl0XHJcblx0XHRcdGlmICggIWhhbmRsZXIudXJsLnRlc3QoIHJlcXVlc3RTZXR0aW5ncy51cmwgKSApIHtcclxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gTG9vayBmb3IgYSBzaW1wbGUgd2lsZGNhcmQgJyonIG9yIGEgZGlyZWN0IFVSTCBtYXRjaFxyXG5cdFx0XHR2YXIgc3RhciA9IGhhbmRsZXIudXJsLmluZGV4T2YoJyonKTtcclxuXHRcdFx0aWYgKGhhbmRsZXIudXJsICE9PSByZXF1ZXN0U2V0dGluZ3MudXJsICYmIHN0YXIgPT09IC0xIHx8XHJcblx0XHRcdFx0XHQhbmV3IFJlZ0V4cChoYW5kbGVyLnVybC5yZXBsYWNlKC9bLVtcXF17fSgpKz8uLFxcXFxeJHwjXFxzXS9nLCBcIlxcXFwkJlwiKS5yZXBsYWNlKC9cXCovZywgJy4rJykpLnRlc3QocmVxdWVzdFNldHRpbmdzLnVybCkpIHtcclxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEluc3BlY3QgdGhlIGRhdGEgc3VibWl0dGVkIGluIHRoZSByZXF1ZXN0IChlaXRoZXIgUE9TVCBib2R5IG9yIEdFVCBxdWVyeSBzdHJpbmcpXHJcblx0XHRpZiAoIGhhbmRsZXIuZGF0YSApIHtcclxuXHRcdFx0aWYgKCAhIHJlcXVlc3RTZXR0aW5ncy5kYXRhIHx8ICFpc01vY2tEYXRhRXF1YWwoaGFuZGxlci5kYXRhLCByZXF1ZXN0U2V0dGluZ3MuZGF0YSkgKSB7XHJcblx0XHRcdFx0Ly8gVGhleSdyZSBub3QgaWRlbnRpY2FsLCBkbyBub3QgbW9jayB0aGlzIHJlcXVlc3RcclxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly8gSW5zcGVjdCB0aGUgcmVxdWVzdCB0eXBlXHJcblx0XHRpZiAoIGhhbmRsZXIgJiYgaGFuZGxlci50eXBlICYmXHJcblx0XHRcdFx0aGFuZGxlci50eXBlLnRvTG93ZXJDYXNlKCkgIT0gcmVxdWVzdFNldHRpbmdzLnR5cGUudG9Mb3dlckNhc2UoKSApIHtcclxuXHRcdFx0Ly8gVGhlIHJlcXVlc3QgdHlwZSBkb2Vzbid0IG1hdGNoIChHRVQgdnMuIFBPU1QpXHJcblx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBoYW5kbGVyO1xyXG5cdH1cclxuXHJcblx0Ly8gUHJvY2VzcyB0aGUgeGhyIG9iamVjdHMgc2VuZCBvcGVyYXRpb25cclxuXHRmdW5jdGlvbiBfeGhyU2VuZChtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MpIHtcclxuXHJcblx0XHQvLyBUaGlzIGlzIGEgc3Vic3RpdHV0ZSBmb3IgPCAxLjQgd2hpY2ggbGFja3MgJC5wcm94eVxyXG5cdFx0dmFyIHByb2Nlc3MgPSAoZnVuY3Rpb24odGhhdCkge1xyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0cmV0dXJuIChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdHZhciBvblJlYWR5O1xyXG5cclxuXHRcdFx0XHRcdC8vIFRoZSByZXF1ZXN0IGhhcyByZXR1cm5lZFxyXG5cdFx0XHRcdFx0dGhpcy5zdGF0dXMgICAgID0gbW9ja0hhbmRsZXIuc3RhdHVzO1xyXG5cdFx0XHRcdFx0dGhpcy5zdGF0dXNUZXh0ID0gbW9ja0hhbmRsZXIuc3RhdHVzVGV4dDtcclxuXHRcdFx0XHRcdHRoaXMucmVhZHlTdGF0ZVx0PSA0O1xyXG5cclxuXHRcdFx0XHRcdC8vIFdlIGhhdmUgYW4gZXhlY3V0YWJsZSBmdW5jdGlvbiwgY2FsbCBpdCB0byBnaXZlXHJcblx0XHRcdFx0XHQvLyB0aGUgbW9jayBoYW5kbGVyIGEgY2hhbmNlIHRvIHVwZGF0ZSBpdCdzIGRhdGFcclxuXHRcdFx0XHRcdGlmICggJC5pc0Z1bmN0aW9uKG1vY2tIYW5kbGVyLnJlc3BvbnNlKSApIHtcclxuXHRcdFx0XHRcdFx0bW9ja0hhbmRsZXIucmVzcG9uc2Uob3JpZ1NldHRpbmdzKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8vIENvcHkgb3ZlciBvdXIgbW9jayB0byBvdXIgeGhyIG9iamVjdCBiZWZvcmUgcGFzc2luZyBjb250cm9sIGJhY2sgdG9cclxuXHRcdFx0XHRcdC8vIGpRdWVyeSdzIG9ucmVhZHlzdGF0ZWNoYW5nZSBjYWxsYmFja1xyXG5cdFx0XHRcdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgPT0gJ2pzb24nICYmICggdHlwZW9mIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCA9PSAnb2JqZWN0JyApICkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLnJlc3BvbnNlVGV4dCA9IEpTT04uc3RyaW5naWZ5KG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCk7XHJcblx0XHRcdFx0XHR9IGVsc2UgaWYgKCByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgPT0gJ3htbCcgKSB7XHJcblx0XHRcdFx0XHRcdGlmICggdHlwZW9mIG1vY2tIYW5kbGVyLnJlc3BvbnNlWE1MID09ICdzdHJpbmcnICkge1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2VYTUwgPSBwYXJzZVhNTChtb2NrSGFuZGxlci5yZXNwb25zZVhNTCk7XHJcblx0XHRcdFx0XHRcdFx0Ly9pbiBqUXVlcnkgMS45LjErLCByZXNwb25zZVhNTCBpcyBwcm9jZXNzZWQgZGlmZmVyZW50bHkgYW5kIHJlbGllcyBvbiByZXNwb25zZVRleHRcclxuXHRcdFx0XHRcdFx0XHR0aGlzLnJlc3BvbnNlVGV4dCA9IG1vY2tIYW5kbGVyLnJlc3BvbnNlWE1MO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2VYTUwgPSBtb2NrSGFuZGxlci5yZXNwb25zZVhNTDtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5yZXNwb25zZVRleHQgPSBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQ7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZiggdHlwZW9mIG1vY2tIYW5kbGVyLnN0YXR1cyA9PSAnbnVtYmVyJyB8fCB0eXBlb2YgbW9ja0hhbmRsZXIuc3RhdHVzID09ICdzdHJpbmcnICkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLnN0YXR1cyA9IG1vY2tIYW5kbGVyLnN0YXR1cztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGlmKCB0eXBlb2YgbW9ja0hhbmRsZXIuc3RhdHVzVGV4dCA9PT0gXCJzdHJpbmdcIikge1xyXG5cdFx0XHRcdFx0XHR0aGlzLnN0YXR1c1RleHQgPSBtb2NrSGFuZGxlci5zdGF0dXNUZXh0O1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0Ly8galF1ZXJ5IDIuMCByZW5hbWVkIG9ucmVhZHlzdGF0ZWNoYW5nZSB0byBvbmxvYWRcclxuXHRcdFx0XHRcdG9uUmVhZHkgPSB0aGlzLm9ucmVhZHlzdGF0ZWNoYW5nZSB8fCB0aGlzLm9ubG9hZDtcclxuXHJcblx0XHRcdFx0XHQvLyBqUXVlcnkgPCAxLjQgZG9lc24ndCBoYXZlIG9ucmVhZHlzdGF0ZSBjaGFuZ2UgZm9yIHhoclxyXG5cdFx0XHRcdFx0aWYgKCAkLmlzRnVuY3Rpb24oIG9uUmVhZHkgKSApIHtcclxuXHRcdFx0XHRcdFx0aWYoIG1vY2tIYW5kbGVyLmlzVGltZW91dCkge1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMuc3RhdHVzID0gLTE7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0b25SZWFkeS5jYWxsKCB0aGlzLCBtb2NrSGFuZGxlci5pc1RpbWVvdXQgPyAndGltZW91dCcgOiB1bmRlZmluZWQgKTtcclxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoIG1vY2tIYW5kbGVyLmlzVGltZW91dCApIHtcclxuXHRcdFx0XHRcdFx0Ly8gRml4IGZvciAxLjMuMiB0aW1lb3V0IHRvIGtlZXAgc3VjY2VzcyBmcm9tIGZpcmluZy5cclxuXHRcdFx0XHRcdFx0dGhpcy5zdGF0dXMgPSAtMTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KS5hcHBseSh0aGF0KTtcclxuXHRcdFx0fTtcclxuXHRcdH0pKHRoaXMpO1xyXG5cclxuXHRcdGlmICggbW9ja0hhbmRsZXIucHJveHkgKSB7XHJcblx0XHRcdC8vIFdlJ3JlIHByb3h5aW5nIHRoaXMgcmVxdWVzdCBhbmQgbG9hZGluZyBpbiBhbiBleHRlcm5hbCBmaWxlIGluc3RlYWRcclxuXHRcdFx0X2FqYXgoe1xyXG5cdFx0XHRcdGdsb2JhbDogZmFsc2UsXHJcblx0XHRcdFx0dXJsOiBtb2NrSGFuZGxlci5wcm94eSxcclxuXHRcdFx0XHR0eXBlOiBtb2NrSGFuZGxlci5wcm94eVR5cGUsXHJcblx0XHRcdFx0ZGF0YTogbW9ja0hhbmRsZXIuZGF0YSxcclxuXHRcdFx0XHRkYXRhVHlwZTogcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlID09PSBcInNjcmlwdFwiID8gXCJ0ZXh0L3BsYWluXCIgOiByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUsXHJcblx0XHRcdFx0Y29tcGxldGU6IGZ1bmN0aW9uKHhocikge1xyXG5cdFx0XHRcdFx0bW9ja0hhbmRsZXIucmVzcG9uc2VYTUwgPSB4aHIucmVzcG9uc2VYTUw7XHJcblx0XHRcdFx0XHRtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgPSB4aHIucmVzcG9uc2VUZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIERvbid0IG92ZXJyaWRlIHRoZSBoYW5kbGVyIHN0YXR1cy9zdGF0dXNUZXh0IGlmIGl0J3Mgc3BlY2lmaWVkIGJ5IHRoZSBjb25maWdcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNEZWZhdWx0U2V0dGluZyhtb2NrSGFuZGxlciwgJ3N0YXR1cycpKSB7XHJcblx0XHRcdFx0XHQgICAgbW9ja0hhbmRsZXIuc3RhdHVzID0geGhyLnN0YXR1cztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzRGVmYXVsdFNldHRpbmcobW9ja0hhbmRsZXIsICdzdGF0dXNUZXh0JykpIHtcclxuXHRcdFx0XHRcdCAgICBtb2NrSGFuZGxlci5zdGF0dXNUZXh0ID0geGhyLnN0YXR1c1RleHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuXHRcdFx0XHRcdHRoaXMucmVzcG9uc2VUaW1lciA9IHNldFRpbWVvdXQocHJvY2VzcywgbW9ja0hhbmRsZXIucmVzcG9uc2VUaW1lIHx8IDApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyB0eXBlID09ICdQT1NUJyB8fCAnR0VUJyB8fCAnREVMRVRFJ1xyXG5cdFx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5hc3luYyA9PT0gZmFsc2UgKSB7XHJcblx0XHRcdFx0Ly8gVE9ETzogQmxvY2tpbmcgZGVsYXlcclxuXHRcdFx0XHRwcm9jZXNzKCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy5yZXNwb25zZVRpbWVyID0gc2V0VGltZW91dChwcm9jZXNzLCBtb2NrSGFuZGxlci5yZXNwb25zZVRpbWUgfHwgNTApO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBDb25zdHJ1Y3QgYSBtb2NrZWQgWEhSIE9iamVjdFxyXG5cdGZ1bmN0aW9uIHhocihtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MsIG9yaWdIYW5kbGVyKSB7XHJcblx0XHQvLyBFeHRlbmQgd2l0aCBvdXIgZGVmYXVsdCBtb2NramF4IHNldHRpbmdzXHJcblx0XHRtb2NrSGFuZGxlciA9ICQuZXh0ZW5kKHRydWUsIHt9LCAkLm1vY2tqYXhTZXR0aW5ncywgbW9ja0hhbmRsZXIpO1xyXG5cclxuXHRcdGlmICh0eXBlb2YgbW9ja0hhbmRsZXIuaGVhZGVycyA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuXHRcdFx0bW9ja0hhbmRsZXIuaGVhZGVycyA9IHt9O1xyXG5cdFx0fVxyXG5cdFx0aWYgKCBtb2NrSGFuZGxlci5jb250ZW50VHlwZSApIHtcclxuXHRcdFx0bW9ja0hhbmRsZXIuaGVhZGVyc1snY29udGVudC10eXBlJ10gPSBtb2NrSGFuZGxlci5jb250ZW50VHlwZTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRzdGF0dXM6IG1vY2tIYW5kbGVyLnN0YXR1cyxcclxuXHRcdFx0c3RhdHVzVGV4dDogbW9ja0hhbmRsZXIuc3RhdHVzVGV4dCxcclxuXHRcdFx0cmVhZHlTdGF0ZTogMSxcclxuXHRcdFx0b3BlbjogZnVuY3Rpb24oKSB7IH0sXHJcblx0XHRcdHNlbmQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdG9yaWdIYW5kbGVyLmZpcmVkID0gdHJ1ZTtcclxuXHRcdFx0XHRfeGhyU2VuZC5jYWxsKHRoaXMsIG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncyk7XHJcblx0XHRcdH0sXHJcblx0XHRcdGFib3J0OiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjbGVhclRpbWVvdXQodGhpcy5yZXNwb25zZVRpbWVyKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0c2V0UmVxdWVzdEhlYWRlcjogZnVuY3Rpb24oaGVhZGVyLCB2YWx1ZSkge1xyXG5cdFx0XHRcdG1vY2tIYW5kbGVyLmhlYWRlcnNbaGVhZGVyXSA9IHZhbHVlO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRnZXRSZXNwb25zZUhlYWRlcjogZnVuY3Rpb24oaGVhZGVyKSB7XHJcblx0XHRcdFx0Ly8gJ0xhc3QtbW9kaWZpZWQnLCAnRXRhZycsICdjb250ZW50LXR5cGUnIGFyZSBhbGwgY2hlY2tlZCBieSBqUXVlcnlcclxuXHRcdFx0XHRpZiAoIG1vY2tIYW5kbGVyLmhlYWRlcnMgJiYgbW9ja0hhbmRsZXIuaGVhZGVyc1toZWFkZXJdICkge1xyXG5cdFx0XHRcdFx0Ly8gUmV0dXJuIGFyYml0cmFyeSBoZWFkZXJzXHJcblx0XHRcdFx0XHRyZXR1cm4gbW9ja0hhbmRsZXIuaGVhZGVyc1toZWFkZXJdO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAoIGhlYWRlci50b0xvd2VyQ2FzZSgpID09ICdsYXN0LW1vZGlmaWVkJyApIHtcclxuXHRcdFx0XHRcdHJldHVybiBtb2NrSGFuZGxlci5sYXN0TW9kaWZpZWQgfHwgKG5ldyBEYXRlKCkpLnRvU3RyaW5nKCk7XHJcblx0XHRcdFx0fSBlbHNlIGlmICggaGVhZGVyLnRvTG93ZXJDYXNlKCkgPT0gJ2V0YWcnICkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIG1vY2tIYW5kbGVyLmV0YWcgfHwgJyc7XHJcblx0XHRcdFx0fSBlbHNlIGlmICggaGVhZGVyLnRvTG93ZXJDYXNlKCkgPT0gJ2NvbnRlbnQtdHlwZScgKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gbW9ja0hhbmRsZXIuY29udGVudFR5cGUgfHwgJ3RleHQvcGxhaW4nO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHRcdFx0Z2V0QWxsUmVzcG9uc2VIZWFkZXJzOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR2YXIgaGVhZGVycyA9ICcnO1xyXG5cdFx0XHRcdCQuZWFjaChtb2NrSGFuZGxlci5oZWFkZXJzLCBmdW5jdGlvbihrLCB2KSB7XHJcblx0XHRcdFx0XHRoZWFkZXJzICs9IGsgKyAnOiAnICsgdiArIFwiXFxuXCI7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0cmV0dXJuIGhlYWRlcnM7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHQvLyBQcm9jZXNzIGEgSlNPTlAgbW9jayByZXF1ZXN0LlxyXG5cdGZ1bmN0aW9uIHByb2Nlc3NKc29ucE1vY2soIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyApIHtcclxuXHRcdC8vIEhhbmRsZSBKU09OUCBQYXJhbWV0ZXIgQ2FsbGJhY2tzLCB3ZSBuZWVkIHRvIHJlcGxpY2F0ZSBzb21lIG9mIHRoZSBqUXVlcnkgY29yZSBoZXJlXHJcblx0XHQvLyBiZWNhdXNlIHRoZXJlIGlzbid0IGFuIGVhc3kgaG9vayBmb3IgdGhlIGNyb3NzIGRvbWFpbiBzY3JpcHQgdGFnIG9mIGpzb25wXHJcblxyXG5cdFx0cHJvY2Vzc0pzb25wVXJsKCByZXF1ZXN0U2V0dGluZ3MgKTtcclxuXHJcblx0XHRyZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgPSBcImpzb25cIjtcclxuXHRcdGlmKHJlcXVlc3RTZXR0aW5ncy5kYXRhICYmIENBTExCQUNLX1JFR0VYLnRlc3QocmVxdWVzdFNldHRpbmdzLmRhdGEpIHx8IENBTExCQUNLX1JFR0VYLnRlc3QocmVxdWVzdFNldHRpbmdzLnVybCkpIHtcclxuXHRcdFx0Y3JlYXRlSnNvbnBDYWxsYmFjayhyZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MpO1xyXG5cclxuXHRcdFx0Ly8gV2UgbmVlZCB0byBtYWtlIHN1cmVcclxuXHRcdFx0Ly8gdGhhdCBhIEpTT05QIHN0eWxlIHJlc3BvbnNlIGlzIGV4ZWN1dGVkIHByb3Blcmx5XHJcblxyXG5cdFx0XHR2YXIgcnVybCA9IC9eKFxcdys6KT9cXC9cXC8oW15cXC8/I10rKS8sXHJcblx0XHRcdFx0cGFydHMgPSBydXJsLmV4ZWMoIHJlcXVlc3RTZXR0aW5ncy51cmwgKSxcclxuXHRcdFx0XHRyZW1vdGUgPSBwYXJ0cyAmJiAocGFydHNbMV0gJiYgcGFydHNbMV0gIT09IGxvY2F0aW9uLnByb3RvY29sIHx8IHBhcnRzWzJdICE9PSBsb2NhdGlvbi5ob3N0KTtcclxuXHJcblx0XHRcdHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSA9IFwic2NyaXB0XCI7XHJcblx0XHRcdGlmKHJlcXVlc3RTZXR0aW5ncy50eXBlLnRvVXBwZXJDYXNlKCkgPT09IFwiR0VUXCIgJiYgcmVtb3RlICkge1xyXG5cdFx0XHRcdHZhciBuZXdNb2NrUmV0dXJuID0gcHJvY2Vzc0pzb25wUmVxdWVzdCggcmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzICk7XHJcblxyXG5cdFx0XHRcdC8vIENoZWNrIGlmIHdlIGFyZSBzdXBwb3NlZCB0byByZXR1cm4gYSBEZWZlcnJlZCBiYWNrIHRvIHRoZSBtb2NrIGNhbGwsIG9yIGp1c3RcclxuXHRcdFx0XHQvLyBzaWduYWwgc3VjY2Vzc1xyXG5cdFx0XHRcdGlmKG5ld01vY2tSZXR1cm4pIHtcclxuXHRcdFx0XHRcdHJldHVybiBuZXdNb2NrUmV0dXJuO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBudWxsO1xyXG5cdH1cclxuXHJcblx0Ly8gQXBwZW5kIHRoZSByZXF1aXJlZCBjYWxsYmFjayBwYXJhbWV0ZXIgdG8gdGhlIGVuZCBvZiB0aGUgcmVxdWVzdCBVUkwsIGZvciBhIEpTT05QIHJlcXVlc3RcclxuXHRmdW5jdGlvbiBwcm9jZXNzSnNvbnBVcmwoIHJlcXVlc3RTZXR0aW5ncyApIHtcclxuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLnR5cGUudG9VcHBlckNhc2UoKSA9PT0gXCJHRVRcIiApIHtcclxuXHRcdFx0aWYgKCAhQ0FMTEJBQ0tfUkVHRVgudGVzdCggcmVxdWVzdFNldHRpbmdzLnVybCApICkge1xyXG5cdFx0XHRcdHJlcXVlc3RTZXR0aW5ncy51cmwgKz0gKC9cXD8vLnRlc3QoIHJlcXVlc3RTZXR0aW5ncy51cmwgKSA/IFwiJlwiIDogXCI/XCIpICtcclxuXHRcdFx0XHRcdChyZXF1ZXN0U2V0dGluZ3MuanNvbnAgfHwgXCJjYWxsYmFja1wiKSArIFwiPT9cIjtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIGlmICggIXJlcXVlc3RTZXR0aW5ncy5kYXRhIHx8ICFDQUxMQkFDS19SRUdFWC50ZXN0KHJlcXVlc3RTZXR0aW5ncy5kYXRhKSApIHtcclxuXHRcdFx0cmVxdWVzdFNldHRpbmdzLmRhdGEgPSAocmVxdWVzdFNldHRpbmdzLmRhdGEgPyByZXF1ZXN0U2V0dGluZ3MuZGF0YSArIFwiJlwiIDogXCJcIikgKyAocmVxdWVzdFNldHRpbmdzLmpzb25wIHx8IFwiY2FsbGJhY2tcIikgKyBcIj0/XCI7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBQcm9jZXNzIGEgSlNPTlAgcmVxdWVzdCBieSBldmFsdWF0aW5nIHRoZSBtb2NrZWQgcmVzcG9uc2UgdGV4dFxyXG5cdGZ1bmN0aW9uIHByb2Nlc3NKc29ucFJlcXVlc3QoIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyApIHtcclxuXHRcdC8vIFN5bnRoZXNpemUgdGhlIG1vY2sgcmVxdWVzdCBmb3IgYWRkaW5nIGEgc2NyaXB0IHRhZ1xyXG5cdFx0dmFyIGNhbGxiYWNrQ29udGV4dCA9IG9yaWdTZXR0aW5ncyAmJiBvcmlnU2V0dGluZ3MuY29udGV4dCB8fCByZXF1ZXN0U2V0dGluZ3MsXHJcblx0XHRcdG5ld01vY2sgPSBudWxsO1xyXG5cclxuXHJcblx0XHQvLyBJZiB0aGUgcmVzcG9uc2UgaGFuZGxlciBvbiB0aGUgbW9vY2sgaXMgYSBmdW5jdGlvbiwgY2FsbCBpdFxyXG5cdFx0aWYgKCBtb2NrSGFuZGxlci5yZXNwb25zZSAmJiAkLmlzRnVuY3Rpb24obW9ja0hhbmRsZXIucmVzcG9uc2UpICkge1xyXG5cdFx0XHRtb2NrSGFuZGxlci5yZXNwb25zZShvcmlnU2V0dGluZ3MpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdC8vIEV2YWx1YXRlIHRoZSByZXNwb25zZVRleHQgamF2YXNjcmlwdCBpbiBhIGdsb2JhbCBjb250ZXh0XHJcblx0XHRcdGlmKCB0eXBlb2YgbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ID09PSAnb2JqZWN0JyApIHtcclxuXHRcdFx0XHQkLmdsb2JhbEV2YWwoICcoJyArIEpTT04uc3RyaW5naWZ5KCBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgKSArICcpJyk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0JC5nbG9iYWxFdmFsKCAnKCcgKyBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgKyAnKScpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gU3VjY2Vzc2Z1bCByZXNwb25zZVxyXG5cdFx0anNvbnBTdWNjZXNzKCByZXF1ZXN0U2V0dGluZ3MsIGNhbGxiYWNrQ29udGV4dCwgbW9ja0hhbmRsZXIgKTtcclxuXHRcdGpzb25wQ29tcGxldGUoIHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0LCBtb2NrSGFuZGxlciApO1xyXG5cclxuXHRcdC8vIElmIHdlIGFyZSBydW5uaW5nIHVuZGVyIGpRdWVyeSAxLjUrLCByZXR1cm4gYSBkZWZlcnJlZCBvYmplY3RcclxuXHRcdGlmKCQuRGVmZXJyZWQpe1xyXG5cdFx0XHRuZXdNb2NrID0gbmV3ICQuRGVmZXJyZWQoKTtcclxuXHRcdFx0aWYodHlwZW9mIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCA9PSBcIm9iamVjdFwiKXtcclxuXHRcdFx0XHRuZXdNb2NrLnJlc29sdmVXaXRoKCBjYWxsYmFja0NvbnRleHQsIFttb2NrSGFuZGxlci5yZXNwb25zZVRleHRdICk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRuZXdNb2NrLnJlc29sdmVXaXRoKCBjYWxsYmFja0NvbnRleHQsIFskLnBhcnNlSlNPTiggbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ICldICk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBuZXdNb2NrO1xyXG5cdH1cclxuXHJcblxyXG5cdC8vIENyZWF0ZSB0aGUgcmVxdWlyZWQgSlNPTlAgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIHRoZSByZXF1ZXN0XHJcblx0ZnVuY3Rpb24gY3JlYXRlSnNvbnBDYWxsYmFjayggcmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzICkge1xyXG5cdFx0dmFyIGNhbGxiYWNrQ29udGV4dCA9IG9yaWdTZXR0aW5ncyAmJiBvcmlnU2V0dGluZ3MuY29udGV4dCB8fCByZXF1ZXN0U2V0dGluZ3M7XHJcblx0XHR2YXIganNvbnAgPSByZXF1ZXN0U2V0dGluZ3MuanNvbnBDYWxsYmFjayB8fCAoXCJqc29ucFwiICsganNjKyspO1xyXG5cclxuXHRcdC8vIFJlcGxhY2UgdGhlID0/IHNlcXVlbmNlIGJvdGggaW4gdGhlIHF1ZXJ5IHN0cmluZyBhbmQgdGhlIGRhdGFcclxuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmRhdGEgKSB7XHJcblx0XHRcdHJlcXVlc3RTZXR0aW5ncy5kYXRhID0gKHJlcXVlc3RTZXR0aW5ncy5kYXRhICsgXCJcIikucmVwbGFjZShDQUxMQkFDS19SRUdFWCwgXCI9XCIgKyBqc29ucCArIFwiJDFcIik7XHJcblx0XHR9XHJcblxyXG5cdFx0cmVxdWVzdFNldHRpbmdzLnVybCA9IHJlcXVlc3RTZXR0aW5ncy51cmwucmVwbGFjZShDQUxMQkFDS19SRUdFWCwgXCI9XCIgKyBqc29ucCArIFwiJDFcIik7XHJcblxyXG5cclxuXHRcdC8vIEhhbmRsZSBKU09OUC1zdHlsZSBsb2FkaW5nXHJcblx0XHR3aW5kb3dbIGpzb25wIF0gPSB3aW5kb3dbIGpzb25wIF0gfHwgZnVuY3Rpb24oIHRtcCApIHtcclxuXHRcdFx0ZGF0YSA9IHRtcDtcclxuXHRcdFx0anNvbnBTdWNjZXNzKCByZXF1ZXN0U2V0dGluZ3MsIGNhbGxiYWNrQ29udGV4dCwgbW9ja0hhbmRsZXIgKTtcclxuXHRcdFx0anNvbnBDb21wbGV0ZSggcmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyICk7XHJcblx0XHRcdC8vIEdhcmJhZ2UgY29sbGVjdFxyXG5cdFx0XHR3aW5kb3dbIGpzb25wIF0gPSB1bmRlZmluZWQ7XHJcblxyXG5cdFx0XHR0cnkge1xyXG5cdFx0XHRcdGRlbGV0ZSB3aW5kb3dbIGpzb25wIF07XHJcblx0XHRcdH0gY2F0Y2goZSkge31cclxuXHJcblx0XHRcdGlmICggaGVhZCApIHtcclxuXHRcdFx0XHRoZWFkLnJlbW92ZUNoaWxkKCBzY3JpcHQgKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cdC8vIFRoZSBKU09OUCByZXF1ZXN0IHdhcyBzdWNjZXNzZnVsXHJcblx0ZnVuY3Rpb24ganNvbnBTdWNjZXNzKHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0LCBtb2NrSGFuZGxlcikge1xyXG5cdFx0Ly8gSWYgYSBsb2NhbCBjYWxsYmFjayB3YXMgc3BlY2lmaWVkLCBmaXJlIGl0IGFuZCBwYXNzIGl0IHRoZSBkYXRhXHJcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5zdWNjZXNzICkge1xyXG5cdFx0XHRyZXF1ZXN0U2V0dGluZ3Muc3VjY2Vzcy5jYWxsKCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCB8fCBcIlwiLCBzdGF0dXMsIHt9ICk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gRmlyZSB0aGUgZ2xvYmFsIGNhbGxiYWNrXHJcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5nbG9iYWwgKSB7XHJcblx0XHRcdHRyaWdnZXIocmVxdWVzdFNldHRpbmdzLCBcImFqYXhTdWNjZXNzXCIsIFt7fSwgcmVxdWVzdFNldHRpbmdzXSApO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gVGhlIEpTT05QIHJlcXVlc3Qgd2FzIGNvbXBsZXRlZFxyXG5cdGZ1bmN0aW9uIGpzb25wQ29tcGxldGUocmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQpIHtcclxuXHRcdC8vIFByb2Nlc3MgcmVzdWx0XHJcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5jb21wbGV0ZSApIHtcclxuXHRcdFx0cmVxdWVzdFNldHRpbmdzLmNvbXBsZXRlLmNhbGwoIGNhbGxiYWNrQ29udGV4dCwge30gLCBzdGF0dXMgKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBUaGUgcmVxdWVzdCB3YXMgY29tcGxldGVkXHJcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5nbG9iYWwgKSB7XHJcblx0XHRcdHRyaWdnZXIoIFwiYWpheENvbXBsZXRlXCIsIFt7fSwgcmVxdWVzdFNldHRpbmdzXSApO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEhhbmRsZSB0aGUgZ2xvYmFsIEFKQVggY291bnRlclxyXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZ2xvYmFsICYmICEgLS0kLmFjdGl2ZSApIHtcclxuXHRcdFx0JC5ldmVudC50cmlnZ2VyKCBcImFqYXhTdG9wXCIgKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cclxuXHQvLyBUaGUgY29yZSAkLmFqYXggcmVwbGFjZW1lbnQuXHJcblx0ZnVuY3Rpb24gaGFuZGxlQWpheCggdXJsLCBvcmlnU2V0dGluZ3MgKSB7XHJcblx0XHR2YXIgbW9ja1JlcXVlc3QsIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXI7XHJcblxyXG5cdFx0Ly8gSWYgdXJsIGlzIGFuIG9iamVjdCwgc2ltdWxhdGUgcHJlLTEuNSBzaWduYXR1cmVcclxuXHRcdGlmICggdHlwZW9mIHVybCA9PT0gXCJvYmplY3RcIiApIHtcclxuXHRcdFx0b3JpZ1NldHRpbmdzID0gdXJsO1xyXG5cdFx0XHR1cmwgPSB1bmRlZmluZWQ7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyB3b3JrIGFyb3VuZCB0byBzdXBwb3J0IDEuNSBzaWduYXR1cmVcclxuXHRcdFx0b3JpZ1NldHRpbmdzID0gb3JpZ1NldHRpbmdzIHx8IHt9O1xyXG5cdFx0XHRvcmlnU2V0dGluZ3MudXJsID0gdXJsO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEV4dGVuZCB0aGUgb3JpZ2luYWwgc2V0dGluZ3MgZm9yIHRoZSByZXF1ZXN0XHJcblx0XHRyZXF1ZXN0U2V0dGluZ3MgPSAkLmV4dGVuZCh0cnVlLCB7fSwgJC5hamF4U2V0dGluZ3MsIG9yaWdTZXR0aW5ncyk7XHJcblxyXG5cdFx0Ly8gSXRlcmF0ZSBvdmVyIG91ciBtb2NrIGhhbmRsZXJzIChpbiByZWdpc3RyYXRpb24gb3JkZXIpIHVudGlsIHdlIGZpbmRcclxuXHRcdC8vIG9uZSB0aGF0IGlzIHdpbGxpbmcgdG8gaW50ZXJjZXB0IHRoZSByZXF1ZXN0XHJcblx0XHRmb3IodmFyIGsgPSAwOyBrIDwgbW9ja0hhbmRsZXJzLmxlbmd0aDsgaysrKSB7XHJcblx0XHRcdGlmICggIW1vY2tIYW5kbGVyc1trXSApIHtcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0bW9ja0hhbmRsZXIgPSBnZXRNb2NrRm9yUmVxdWVzdCggbW9ja0hhbmRsZXJzW2tdLCByZXF1ZXN0U2V0dGluZ3MgKTtcclxuXHRcdFx0aWYoIW1vY2tIYW5kbGVyKSB7XHJcblx0XHRcdFx0Ly8gTm8gdmFsaWQgbW9jayBmb3VuZCBmb3IgdGhpcyByZXF1ZXN0XHJcblx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdG1vY2tlZEFqYXhDYWxscy5wdXNoKHJlcXVlc3RTZXR0aW5ncyk7XHJcblxyXG5cdFx0XHQvLyBJZiBsb2dnaW5nIGlzIGVuYWJsZWQsIGxvZyB0aGUgbW9jayB0byB0aGUgY29uc29sZVxyXG5cdFx0XHQkLm1vY2tqYXhTZXR0aW5ncy5sb2coIG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MgKTtcclxuXHJcblxyXG5cdFx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSAmJiByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUudG9VcHBlckNhc2UoKSA9PT0gJ0pTT05QJyApIHtcclxuXHRcdFx0XHRpZiAoKG1vY2tSZXF1ZXN0ID0gcHJvY2Vzc0pzb25wTW9jayggcmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzICkpKSB7XHJcblx0XHRcdFx0XHQvLyBUaGlzIG1vY2sgd2lsbCBoYW5kbGUgdGhlIEpTT05QIHJlcXVlc3RcclxuXHRcdFx0XHRcdHJldHVybiBtb2NrUmVxdWVzdDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblxyXG5cdFx0XHQvLyBSZW1vdmVkIHRvIGZpeCAjNTQgLSBrZWVwIHRoZSBtb2NraW5nIGRhdGEgb2JqZWN0IGludGFjdFxyXG5cdFx0XHQvL21vY2tIYW5kbGVyLmRhdGEgPSByZXF1ZXN0U2V0dGluZ3MuZGF0YTtcclxuXHJcblx0XHRcdG1vY2tIYW5kbGVyLmNhY2hlID0gcmVxdWVzdFNldHRpbmdzLmNhY2hlO1xyXG5cdFx0XHRtb2NrSGFuZGxlci50aW1lb3V0ID0gcmVxdWVzdFNldHRpbmdzLnRpbWVvdXQ7XHJcblx0XHRcdG1vY2tIYW5kbGVyLmdsb2JhbCA9IHJlcXVlc3RTZXR0aW5ncy5nbG9iYWw7XHJcblxyXG5cdFx0XHRjb3B5VXJsUGFyYW1ldGVycyhtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzKTtcclxuXHJcblx0XHRcdChmdW5jdGlvbihtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MsIG9yaWdIYW5kbGVyKSB7XHJcblx0XHRcdFx0bW9ja1JlcXVlc3QgPSBfYWpheC5jYWxsKCQsICQuZXh0ZW5kKHRydWUsIHt9LCBvcmlnU2V0dGluZ3MsIHtcclxuXHRcdFx0XHRcdC8vIE1vY2sgdGhlIFhIUiBvYmplY3RcclxuXHRcdFx0XHRcdHhocjogZnVuY3Rpb24oKSB7IHJldHVybiB4aHIoIG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncywgb3JpZ0hhbmRsZXIgKTsgfVxyXG5cdFx0XHRcdH0pKTtcclxuXHRcdFx0fSkobW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncywgb3JpZ1NldHRpbmdzLCBtb2NrSGFuZGxlcnNba10pO1xyXG5cclxuXHRcdFx0cmV0dXJuIG1vY2tSZXF1ZXN0O1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFdlIGRvbid0IGhhdmUgYSBtb2NrIHJlcXVlc3RcclxuXHRcdGlmKCQubW9ja2pheFNldHRpbmdzLnRocm93VW5tb2NrZWQgPT09IHRydWUpIHtcclxuXHRcdFx0dGhyb3coJ0FKQVggbm90IG1vY2tlZDogJyArIG9yaWdTZXR0aW5ncy51cmwpO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7IC8vIHRyaWdnZXIgYSBub3JtYWwgcmVxdWVzdFxyXG5cdFx0XHRyZXR1cm4gX2FqYXguYXBwbHkoJCwgW29yaWdTZXR0aW5nc10pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0KiBDb3BpZXMgVVJMIHBhcmFtZXRlciB2YWx1ZXMgaWYgdGhleSB3ZXJlIGNhcHR1cmVkIGJ5IGEgcmVndWxhciBleHByZXNzaW9uXHJcblx0KiBAcGFyYW0ge09iamVjdH0gbW9ja0hhbmRsZXJcclxuXHQqIEBwYXJhbSB7T2JqZWN0fSBvcmlnU2V0dGluZ3NcclxuXHQqL1xyXG5cdGZ1bmN0aW9uIGNvcHlVcmxQYXJhbWV0ZXJzKG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MpIHtcclxuXHRcdC8vcGFyYW1ldGVycyBhcmVuJ3QgY2FwdHVyZWQgaWYgdGhlIFVSTCBpc24ndCBhIFJlZ0V4cFxyXG5cdFx0aWYgKCEobW9ja0hhbmRsZXIudXJsIGluc3RhbmNlb2YgUmVnRXhwKSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHQvL2lmIG5vIFVSTCBwYXJhbXMgd2VyZSBkZWZpbmVkIG9uIHRoZSBoYW5kbGVyLCBkb24ndCBhdHRlbXB0IGEgY2FwdHVyZVxyXG5cdFx0aWYgKCFtb2NrSGFuZGxlci5oYXNPd25Qcm9wZXJ0eSgndXJsUGFyYW1zJykpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0dmFyIGNhcHR1cmVzID0gbW9ja0hhbmRsZXIudXJsLmV4ZWMob3JpZ1NldHRpbmdzLnVybCk7XHJcblx0XHQvL3RoZSB3aG9sZSBSZWdFeHAgbWF0Y2ggaXMgYWx3YXlzIHRoZSBmaXJzdCB2YWx1ZSBpbiB0aGUgY2FwdHVyZSByZXN1bHRzXHJcblx0XHRpZiAoY2FwdHVyZXMubGVuZ3RoID09PSAxKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdGNhcHR1cmVzLnNoaWZ0KCk7XHJcblx0XHQvL3VzZSBoYW5kbGVyIHBhcmFtcyBhcyBrZXlzIGFuZCBjYXB0dXJlIHJlc3V0cyBhcyB2YWx1ZXNcclxuXHRcdHZhciBpID0gMCxcclxuXHRcdGNhcHR1cmVzTGVuZ3RoID0gY2FwdHVyZXMubGVuZ3RoLFxyXG5cdFx0cGFyYW1zTGVuZ3RoID0gbW9ja0hhbmRsZXIudXJsUGFyYW1zLmxlbmd0aCxcclxuXHRcdC8vaW4gY2FzZSB0aGUgbnVtYmVyIG9mIHBhcmFtcyBzcGVjaWZpZWQgaXMgbGVzcyB0aGFuIGFjdHVhbCBjYXB0dXJlc1xyXG5cdFx0bWF4SXRlcmF0aW9ucyA9IE1hdGgubWluKGNhcHR1cmVzTGVuZ3RoLCBwYXJhbXNMZW5ndGgpLFxyXG5cdFx0cGFyYW1WYWx1ZXMgPSB7fTtcclxuXHRcdGZvciAoaTsgaSA8IG1heEl0ZXJhdGlvbnM7IGkrKykge1xyXG5cdFx0XHR2YXIga2V5ID0gbW9ja0hhbmRsZXIudXJsUGFyYW1zW2ldO1xyXG5cdFx0XHRwYXJhbVZhbHVlc1trZXldID0gY2FwdHVyZXNbaV07XHJcblx0XHR9XHJcblx0XHRvcmlnU2V0dGluZ3MudXJsUGFyYW1zID0gcGFyYW1WYWx1ZXM7XHJcblx0fVxyXG5cclxuXHJcblx0Ly8gUHVibGljXHJcblxyXG5cdCQuZXh0ZW5kKHtcclxuXHRcdGFqYXg6IGhhbmRsZUFqYXhcclxuXHR9KTtcclxuXHJcblx0JC5tb2NramF4U2V0dGluZ3MgPSB7XHJcblx0XHQvL3VybDogICAgICAgIG51bGwsXHJcblx0XHQvL3R5cGU6ICAgICAgICdHRVQnLFxyXG5cdFx0bG9nOiAgICAgICAgICBmdW5jdGlvbiggbW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncyApIHtcclxuXHRcdFx0aWYgKCBtb2NrSGFuZGxlci5sb2dnaW5nID09PSBmYWxzZSB8fFxyXG5cdFx0XHRcdCAoIHR5cGVvZiBtb2NrSGFuZGxlci5sb2dnaW5nID09PSAndW5kZWZpbmVkJyAmJiAkLm1vY2tqYXhTZXR0aW5ncy5sb2dnaW5nID09PSBmYWxzZSApICkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoIHdpbmRvdy5jb25zb2xlICYmIGNvbnNvbGUubG9nICkge1xyXG5cdFx0XHRcdHZhciBtZXNzYWdlID0gJ01PQ0sgJyArIHJlcXVlc3RTZXR0aW5ncy50eXBlLnRvVXBwZXJDYXNlKCkgKyAnOiAnICsgcmVxdWVzdFNldHRpbmdzLnVybDtcclxuXHRcdFx0XHR2YXIgcmVxdWVzdCA9ICQuZXh0ZW5kKHt9LCByZXF1ZXN0U2V0dGluZ3MpO1xyXG5cclxuXHRcdFx0XHRpZiAodHlwZW9mIGNvbnNvbGUubG9nID09PSAnZnVuY3Rpb24nKSB7XHJcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhtZXNzYWdlLCByZXF1ZXN0KTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coIG1lc3NhZ2UgKyAnICcgKyBKU09OLnN0cmluZ2lmeShyZXF1ZXN0KSApO1xyXG5cdFx0XHRcdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhtZXNzYWdlKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0XHRsb2dnaW5nOiAgICAgICB0cnVlLFxyXG5cdFx0c3RhdHVzOiAgICAgICAgMjAwLFxyXG5cdFx0c3RhdHVzVGV4dDogICAgXCJPS1wiLFxyXG5cdFx0cmVzcG9uc2VUaW1lOiAgNTAwLFxyXG5cdFx0aXNUaW1lb3V0OiAgICAgZmFsc2UsXHJcblx0XHR0aHJvd1VubW9ja2VkOiBmYWxzZSxcclxuXHRcdGNvbnRlbnRUeXBlOiAgICd0ZXh0L3BsYWluJyxcclxuXHRcdHJlc3BvbnNlOiAgICAgICcnLFxyXG5cdFx0cmVzcG9uc2VUZXh0OiAgJycsXHJcblx0XHRyZXNwb25zZVhNTDogICAnJyxcclxuXHRcdHByb3h5OiAgICAgICAgICcnLFxyXG5cdFx0cHJveHlUeXBlOiAgICAgJ0dFVCcsXHJcblxyXG5cdFx0bGFzdE1vZGlmaWVkOiAgbnVsbCxcclxuXHRcdGV0YWc6ICAgICAgICAgICcnLFxyXG5cdFx0aGVhZGVyczoge1xyXG5cdFx0XHRldGFnOiAnSUpGQEgjQDkyM3VmODAyM2hGT0BJI0gjJyxcclxuXHRcdFx0J2NvbnRlbnQtdHlwZScgOiAndGV4dC9wbGFpbidcclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHQkLm1vY2tqYXggPSBmdW5jdGlvbihzZXR0aW5ncykge1xyXG5cdFx0dmFyIGkgPSBtb2NrSGFuZGxlcnMubGVuZ3RoO1xyXG5cdFx0bW9ja0hhbmRsZXJzW2ldID0gc2V0dGluZ3M7XHJcblx0XHRyZXR1cm4gaTtcclxuXHR9O1xyXG5cdCQubW9ja2pheENsZWFyID0gZnVuY3Rpb24oaSkge1xyXG5cdFx0aWYgKCBhcmd1bWVudHMubGVuZ3RoID09IDEgKSB7XHJcblx0XHRcdG1vY2tIYW5kbGVyc1tpXSA9IG51bGw7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRtb2NrSGFuZGxlcnMgPSBbXTtcclxuXHRcdH1cclxuXHRcdG1vY2tlZEFqYXhDYWxscyA9IFtdO1xyXG5cdH07XHJcblx0JC5tb2NramF4LmhhbmRsZXIgPSBmdW5jdGlvbihpKSB7XHJcblx0XHRpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT0gMSApIHtcclxuXHRcdFx0cmV0dXJuIG1vY2tIYW5kbGVyc1tpXTtcclxuXHRcdH1cclxuXHR9O1xyXG5cdCQubW9ja2pheC5tb2NrZWRBamF4Q2FsbHMgPSBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiBtb2NrZWRBamF4Q2FsbHM7XHJcblx0fTtcclxufSkoalF1ZXJ5KTsiLCIvKipcclxuKiAgQWpheCBBdXRvY29tcGxldGUgZm9yIGpRdWVyeSwgdmVyc2lvbiAldmVyc2lvbiVcclxuKiAgKGMpIDIwMTUgVG9tYXMgS2lyZGFcclxuKlxyXG4qICBBamF4IEF1dG9jb21wbGV0ZSBmb3IgalF1ZXJ5IGlzIGZyZWVseSBkaXN0cmlidXRhYmxlIHVuZGVyIHRoZSB0ZXJtcyBvZiBhbiBNSVQtc3R5bGUgbGljZW5zZS5cclxuKiAgRm9yIGRldGFpbHMsIHNlZSB0aGUgd2ViIHNpdGU6IGh0dHBzOi8vZ2l0aHViLmNvbS9kZXZicmlkZ2UvalF1ZXJ5LUF1dG9jb21wbGV0ZVxyXG4qL1xyXG5cclxuLypqc2xpbnQgIGJyb3dzZXI6IHRydWUsIHdoaXRlOiB0cnVlLCBwbHVzcGx1czogdHJ1ZSwgdmFyczogdHJ1ZSAqL1xyXG4vKmdsb2JhbCBkZWZpbmUsIHdpbmRvdywgZG9jdW1lbnQsIGpRdWVyeSwgZXhwb3J0cywgcmVxdWlyZSAqL1xyXG5cclxuLy8gRXhwb3NlIHBsdWdpbiBhcyBhbiBBTUQgbW9kdWxlIGlmIEFNRCBsb2FkZXIgaXMgcHJlc2VudDpcclxuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcbiAgICAgICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxyXG4gICAgICAgIGRlZmluZShbJ2pxdWVyeSddLCBmYWN0b3J5KTtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiByZXF1aXJlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgLy8gQnJvd3NlcmlmeVxyXG4gICAgICAgIGZhY3RvcnkocmVxdWlyZSgnanF1ZXJ5JykpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBCcm93c2VyIGdsb2JhbHNcclxuICAgICAgICBmYWN0b3J5KGpRdWVyeSk7XHJcbiAgICB9XHJcbn0oZnVuY3Rpb24gKCQpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXJcclxuICAgICAgICB1dGlscyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBlc2NhcGVSZWdFeENoYXJzOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvW1xcLVxcW1xcXVxcL1xce1xcfVxcKFxcKVxcKlxcK1xcP1xcLlxcXFxcXF5cXCRcXHxdL2csIFwiXFxcXCQmXCIpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGNyZWF0ZU5vZGU6IGZ1bmN0aW9uIChjb250YWluZXJDbGFzcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgICAgICAgICAgICBkaXYuY2xhc3NOYW1lID0gY29udGFpbmVyQ2xhc3M7XHJcbiAgICAgICAgICAgICAgICAgICAgZGl2LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcclxuICAgICAgICAgICAgICAgICAgICBkaXYuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGl2O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0oKSksXHJcblxyXG4gICAgICAgIGtleXMgPSB7XHJcbiAgICAgICAgICAgIEVTQzogMjcsXHJcbiAgICAgICAgICAgIFRBQjogOSxcclxuICAgICAgICAgICAgUkVUVVJOOiAxMyxcclxuICAgICAgICAgICAgTEVGVDogMzcsXHJcbiAgICAgICAgICAgIFVQOiAzOCxcclxuICAgICAgICAgICAgUklHSFQ6IDM5LFxyXG4gICAgICAgICAgICBET1dOOiA0MFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gQXV0b2NvbXBsZXRlKGVsLCBvcHRpb25zKSB7XHJcbiAgICAgICAgdmFyIG5vb3AgPSBmdW5jdGlvbiAoKSB7IH0sXHJcbiAgICAgICAgICAgIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICBkZWZhdWx0cyA9IHtcclxuICAgICAgICAgICAgICAgIGFqYXhTZXR0aW5nczoge30sXHJcbiAgICAgICAgICAgICAgICBhdXRvU2VsZWN0Rmlyc3Q6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYXBwZW5kVG86IGRvY3VtZW50LmJvZHksXHJcbiAgICAgICAgICAgICAgICBzZXJ2aWNlVXJsOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgbG9va3VwOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgb25TZWxlY3Q6IG51bGwsXHJcbiAgICAgICAgICAgICAgICB3aWR0aDogJ2F1dG8nLFxyXG4gICAgICAgICAgICAgICAgbWluQ2hhcnM6IDEsXHJcbiAgICAgICAgICAgICAgICBtYXhIZWlnaHQ6IDMwMCxcclxuICAgICAgICAgICAgICAgIGRlZmVyUmVxdWVzdEJ5OiAwLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7fSxcclxuICAgICAgICAgICAgICAgIGZvcm1hdFJlc3VsdDogQXV0b2NvbXBsZXRlLmZvcm1hdFJlc3VsdCxcclxuICAgICAgICAgICAgICAgIGRlbGltaXRlcjogbnVsbCxcclxuICAgICAgICAgICAgICAgIHpJbmRleDogOTk5OSxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgbm9DYWNoZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBvblNlYXJjaFN0YXJ0OiBub29wLFxyXG4gICAgICAgICAgICAgICAgb25TZWFyY2hDb21wbGV0ZTogbm9vcCxcclxuICAgICAgICAgICAgICAgIG9uU2VhcmNoRXJyb3I6IG5vb3AsXHJcbiAgICAgICAgICAgICAgICBwcmVzZXJ2ZUlucHV0OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lckNsYXNzOiAnYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb25zJyxcclxuICAgICAgICAgICAgICAgIHRhYkRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50UmVxdWVzdDogbnVsbCxcclxuICAgICAgICAgICAgICAgIHRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBwcmV2ZW50QmFkUXVlcmllczogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGxvb2t1cEZpbHRlcjogZnVuY3Rpb24gKHN1Z2dlc3Rpb24sIG9yaWdpbmFsUXVlcnksIHF1ZXJ5TG93ZXJDYXNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb24udmFsdWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHF1ZXJ5TG93ZXJDYXNlKSAhPT0gLTE7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcGFyYW1OYW1lOiAncXVlcnknLFxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtUmVzdWx0OiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIHJlc3BvbnNlID09PSAnc3RyaW5nJyA/ICQucGFyc2VKU09OKHJlc3BvbnNlKSA6IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHNob3dOb1N1Z2dlc3Rpb25Ob3RpY2U6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgbm9TdWdnZXN0aW9uTm90aWNlOiAnTm8gcmVzdWx0cycsXHJcbiAgICAgICAgICAgICAgICBvcmllbnRhdGlvbjogJ2JvdHRvbScsXHJcbiAgICAgICAgICAgICAgICBmb3JjZUZpeFBvc2l0aW9uOiBmYWxzZVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBTaGFyZWQgdmFyaWFibGVzOlxyXG4gICAgICAgIHRoYXQuZWxlbWVudCA9IGVsO1xyXG4gICAgICAgIHRoYXQuZWwgPSAkKGVsKTtcclxuICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gW107XHJcbiAgICAgICAgdGhhdC5iYWRRdWVyaWVzID0gW107XHJcbiAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XHJcbiAgICAgICAgdGhhdC5jdXJyZW50VmFsdWUgPSB0aGF0LmVsZW1lbnQudmFsdWU7XHJcbiAgICAgICAgdGhhdC5pbnRlcnZhbElkID0gMDtcclxuICAgICAgICB0aGF0LmNhY2hlZFJlc3BvbnNlID0ge307XHJcbiAgICAgICAgdGhhdC5vbkNoYW5nZUludGVydmFsID0gbnVsbDtcclxuICAgICAgICB0aGF0Lm9uQ2hhbmdlID0gbnVsbDtcclxuICAgICAgICB0aGF0LmlzTG9jYWwgPSBmYWxzZTtcclxuICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyID0gbnVsbDtcclxuICAgICAgICB0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIgPSBudWxsO1xyXG4gICAgICAgIHRoYXQub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBkZWZhdWx0cywgb3B0aW9ucyk7XHJcbiAgICAgICAgdGhhdC5jbGFzc2VzID0ge1xyXG4gICAgICAgICAgICBzZWxlY3RlZDogJ2F1dG9jb21wbGV0ZS1zZWxlY3RlZCcsXHJcbiAgICAgICAgICAgIHN1Z2dlc3Rpb246ICdhdXRvY29tcGxldGUtc3VnZ2VzdGlvbidcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoYXQuaGludCA9IG51bGw7XHJcbiAgICAgICAgdGhhdC5oaW50VmFsdWUgPSAnJztcclxuICAgICAgICB0aGF0LnNlbGVjdGlvbiA9IG51bGw7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgYW5kIHNldCBvcHRpb25zOlxyXG4gICAgICAgIHRoYXQuaW5pdGlhbGl6ZSgpO1xyXG4gICAgICAgIHRoYXQuc2V0T3B0aW9ucyhvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBBdXRvY29tcGxldGUudXRpbHMgPSB1dGlscztcclxuXHJcbiAgICAkLkF1dG9jb21wbGV0ZSA9IEF1dG9jb21wbGV0ZTtcclxuXHJcbiAgICBBdXRvY29tcGxldGUuZm9ybWF0UmVzdWx0ID0gZnVuY3Rpb24gKHN1Z2dlc3Rpb24sIGN1cnJlbnRWYWx1ZSkge1xyXG4gICAgICAgIC8vIERvIG5vdCByZXBsYWNlIGFueXRoaW5nIGlmIHRoZXJlIGN1cnJlbnQgdmFsdWUgaXMgZW1wdHlcclxuICAgICAgICBpZiAoIWN1cnJlbnRWYWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbi52YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIHBhdHRlcm4gPSAnKCcgKyB1dGlscy5lc2NhcGVSZWdFeENoYXJzKGN1cnJlbnRWYWx1ZSkgKyAnKSc7XHJcblxyXG4gICAgICAgIHJldHVybiBzdWdnZXN0aW9uLnZhbHVlXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKG5ldyBSZWdFeHAocGF0dGVybiwgJ2dpJyksICc8c3Ryb25nPiQxPFxcL3N0cm9uZz4nKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcclxuICAgICAgICAgICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvJmx0OyhcXC8/c3Ryb25nKSZndDsvZywgJzwkMT4nKTtcclxuICAgIH07XHJcblxyXG4gICAgQXV0b2NvbXBsZXRlLnByb3RvdHlwZSA9IHtcclxuXHJcbiAgICAgICAga2lsbGVyRm46IG51bGwsXHJcblxyXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgc3VnZ2VzdGlvblNlbGVjdG9yID0gJy4nICsgdGhhdC5jbGFzc2VzLnN1Z2dlc3Rpb24sXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZCA9IHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgICBjb250YWluZXI7XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgYXV0b2NvbXBsZXRlIGF0dHJpYnV0ZSB0byBwcmV2ZW50IG5hdGl2ZSBzdWdnZXN0aW9uczpcclxuICAgICAgICAgICAgdGhhdC5lbGVtZW50LnNldEF0dHJpYnV0ZSgnYXV0b2NvbXBsZXRlJywgJ29mZicpO1xyXG5cclxuICAgICAgICAgICAgdGhhdC5raWxsZXJGbiA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJChlLnRhcmdldCkuY2xvc2VzdCgnLicgKyB0aGF0Lm9wdGlvbnMuY29udGFpbmVyQ2xhc3MpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQua2lsbFN1Z2dlc3Rpb25zKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5kaXNhYmxlS2lsbGVyRm4oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vIGh0bWwoKSBkZWFscyB3aXRoIG1hbnkgdHlwZXM6IGh0bWxTdHJpbmcgb3IgRWxlbWVudCBvciBBcnJheSBvciBqUXVlcnlcclxuICAgICAgICAgICAgdGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gJCgnPGRpdiBjbGFzcz1cImF1dG9jb21wbGV0ZS1uby1zdWdnZXN0aW9uXCI+PC9kaXY+JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmh0bWwodGhpcy5vcHRpb25zLm5vU3VnZ2VzdGlvbk5vdGljZSkuZ2V0KDApO1xyXG5cclxuICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciA9IEF1dG9jb21wbGV0ZS51dGlscy5jcmVhdGVOb2RlKG9wdGlvbnMuY29udGFpbmVyQ2xhc3MpO1xyXG5cclxuICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRUbyhvcHRpb25zLmFwcGVuZFRvKTtcclxuXHJcbiAgICAgICAgICAgIC8vIE9ubHkgc2V0IHdpZHRoIGlmIGl0IHdhcyBwcm92aWRlZDpcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMud2lkdGggIT09ICdhdXRvJykge1xyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyLndpZHRoKG9wdGlvbnMud2lkdGgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBMaXN0ZW4gZm9yIG1vdXNlIG92ZXIgZXZlbnQgb24gc3VnZ2VzdGlvbnMgbGlzdDpcclxuICAgICAgICAgICAgY29udGFpbmVyLm9uKCdtb3VzZW92ZXIuYXV0b2NvbXBsZXRlJywgc3VnZ2VzdGlvblNlbGVjdG9yLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmFjdGl2YXRlKCQodGhpcykuZGF0YSgnaW5kZXgnKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gRGVzZWxlY3QgYWN0aXZlIGVsZW1lbnQgd2hlbiBtb3VzZSBsZWF2ZXMgc3VnZ2VzdGlvbnMgY29udGFpbmVyOlxyXG4gICAgICAgICAgICBjb250YWluZXIub24oJ21vdXNlb3V0LmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmNoaWxkcmVuKCcuJyArIHNlbGVjdGVkKS5yZW1vdmVDbGFzcyhzZWxlY3RlZCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gTGlzdGVuIGZvciBjbGljayBldmVudCBvbiBzdWdnZXN0aW9ucyBsaXN0OlxyXG4gICAgICAgICAgICBjb250YWluZXIub24oJ2NsaWNrLmF1dG9jb21wbGV0ZScsIHN1Z2dlc3Rpb25TZWxlY3RvciwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QoJCh0aGlzKS5kYXRhKCdpbmRleCcpKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uQ2FwdHVyZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGF0LnZpc2libGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS5hdXRvY29tcGxldGUnLCB0aGF0LmZpeFBvc2l0aW9uQ2FwdHVyZSk7XHJcblxyXG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdrZXlkb3duLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlQcmVzcyhlKTsgfSk7XHJcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2tleXVwLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlVcChlKTsgfSk7XHJcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2JsdXIuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKCkgeyB0aGF0Lm9uQmx1cigpOyB9KTtcclxuICAgICAgICAgICAgdGhhdC5lbC5vbignZm9jdXMuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKCkgeyB0aGF0Lm9uRm9jdXMoKTsgfSk7XHJcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2NoYW5nZS5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5VXAoZSk7IH0pO1xyXG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdpbnB1dC5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5VXAoZSk7IH0pO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG9uRm9jdXM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuZWwudmFsKCkubGVuZ3RoID49IHRoYXQub3B0aW9ucy5taW5DaGFycykge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5vblZhbHVlQ2hhbmdlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBvbkJsdXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5lbmFibGVLaWxsZXJGbigpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXHJcbiAgICAgICAgYWJvcnRBamF4OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgaWYgKHRoYXQuY3VycmVudFJlcXVlc3QpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QuYWJvcnQoKTtcclxuICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2V0T3B0aW9uczogZnVuY3Rpb24gKHN1cHBsaWVkT3B0aW9ucykge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zO1xyXG5cclxuICAgICAgICAgICAgJC5leHRlbmQob3B0aW9ucywgc3VwcGxpZWRPcHRpb25zKTtcclxuXHJcbiAgICAgICAgICAgIHRoYXQuaXNMb2NhbCA9ICQuaXNBcnJheShvcHRpb25zLmxvb2t1cCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhhdC5pc0xvY2FsKSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLmxvb2t1cCA9IHRoYXQudmVyaWZ5U3VnZ2VzdGlvbnNGb3JtYXQob3B0aW9ucy5sb29rdXApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBvcHRpb25zLm9yaWVudGF0aW9uID0gdGhhdC52YWxpZGF0ZU9yaWVudGF0aW9uKG9wdGlvbnMub3JpZW50YXRpb24sICdib3R0b20nKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkanVzdCBoZWlnaHQsIHdpZHRoIGFuZCB6LWluZGV4OlxyXG4gICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAnbWF4LWhlaWdodCc6IG9wdGlvbnMubWF4SGVpZ2h0ICsgJ3B4JyxcclxuICAgICAgICAgICAgICAgICd3aWR0aCc6IG9wdGlvbnMud2lkdGggKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgJ3otaW5kZXgnOiBvcHRpb25zLnpJbmRleFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG5cclxuXHJcbiAgICAgICAgY2xlYXJDYWNoZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNhY2hlZFJlc3BvbnNlID0ge307XHJcbiAgICAgICAgICAgIHRoaXMuYmFkUXVlcmllcyA9IFtdO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xlYXJDYWNoZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRWYWx1ZSA9ICcnO1xyXG4gICAgICAgICAgICB0aGlzLnN1Z2dlc3Rpb25zID0gW107XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZGlzYWJsZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgIHRoYXQuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XHJcbiAgICAgICAgICAgIHRoYXQuYWJvcnRBamF4KCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZW5hYmxlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBmaXhQb3NpdGlvbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBVc2Ugb25seSB3aGVuIGNvbnRhaW5lciBoYXMgYWxyZWFkeSBpdHMgY29udGVudFxyXG5cclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgJGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXHJcbiAgICAgICAgICAgICAgICBjb250YWluZXJQYXJlbnQgPSAkY29udGFpbmVyLnBhcmVudCgpLmdldCgwKTtcclxuICAgICAgICAgICAgLy8gRml4IHBvc2l0aW9uIGF1dG9tYXRpY2FsbHkgd2hlbiBhcHBlbmRlZCB0byBib2R5LlxyXG4gICAgICAgICAgICAvLyBJbiBvdGhlciBjYXNlcyBmb3JjZSBwYXJhbWV0ZXIgbXVzdCBiZSBnaXZlbi5cclxuICAgICAgICAgICAgaWYgKGNvbnRhaW5lclBhcmVudCAhPT0gZG9jdW1lbnQuYm9keSAmJiAhdGhhdC5vcHRpb25zLmZvcmNlRml4UG9zaXRpb24pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQ2hvb3NlIG9yaWVudGF0aW9uXHJcbiAgICAgICAgICAgIHZhciBvcmllbnRhdGlvbiA9IHRoYXQub3B0aW9ucy5vcmllbnRhdGlvbixcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lckhlaWdodCA9ICRjb250YWluZXIub3V0ZXJIZWlnaHQoKSxcclxuICAgICAgICAgICAgICAgIGhlaWdodCA9IHRoYXQuZWwub3V0ZXJIZWlnaHQoKSxcclxuICAgICAgICAgICAgICAgIG9mZnNldCA9IHRoYXQuZWwub2Zmc2V0KCksXHJcbiAgICAgICAgICAgICAgICBzdHlsZXMgPSB7ICd0b3AnOiBvZmZzZXQudG9wLCAnbGVmdCc6IG9mZnNldC5sZWZ0IH07XHJcblxyXG4gICAgICAgICAgICBpZiAob3JpZW50YXRpb24gPT09ICdhdXRvJykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHZpZXdQb3J0SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpLFxyXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKSxcclxuICAgICAgICAgICAgICAgICAgICB0b3BPdmVyZmxvdyA9IC1zY3JvbGxUb3AgKyBvZmZzZXQudG9wIC0gY29udGFpbmVySGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgICAgIGJvdHRvbU92ZXJmbG93ID0gc2Nyb2xsVG9wICsgdmlld1BvcnRIZWlnaHQgLSAob2Zmc2V0LnRvcCArIGhlaWdodCArIGNvbnRhaW5lckhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb24gPSAoTWF0aC5tYXgodG9wT3ZlcmZsb3csIGJvdHRvbU92ZXJmbG93KSA9PT0gdG9wT3ZlcmZsb3cpID8gJ3RvcCcgOiAnYm90dG9tJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKG9yaWVudGF0aW9uID09PSAndG9wJykge1xyXG4gICAgICAgICAgICAgICAgc3R5bGVzLnRvcCArPSAtY29udGFpbmVySGVpZ2h0O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc3R5bGVzLnRvcCArPSBoZWlnaHQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIElmIGNvbnRhaW5lciBpcyBub3QgcG9zaXRpb25lZCB0byBib2R5LFxyXG4gICAgICAgICAgICAvLyBjb3JyZWN0IGl0cyBwb3NpdGlvbiB1c2luZyBvZmZzZXQgcGFyZW50IG9mZnNldFxyXG4gICAgICAgICAgICBpZihjb250YWluZXJQYXJlbnQgIT09IGRvY3VtZW50LmJvZHkpIHtcclxuICAgICAgICAgICAgICAgIHZhciBvcGFjaXR5ID0gJGNvbnRhaW5lci5jc3MoJ29wYWNpdHknKSxcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnRPZmZzZXREaWZmO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoYXQudmlzaWJsZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRjb250YWluZXIuY3NzKCdvcGFjaXR5JywgMCkuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBwYXJlbnRPZmZzZXREaWZmID0gJGNvbnRhaW5lci5vZmZzZXRQYXJlbnQoKS5vZmZzZXQoKTtcclxuICAgICAgICAgICAgICAgIHN0eWxlcy50b3AgLT0gcGFyZW50T2Zmc2V0RGlmZi50b3A7XHJcbiAgICAgICAgICAgICAgICBzdHlsZXMubGVmdCAtPSBwYXJlbnRPZmZzZXREaWZmLmxlZnQ7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGF0LnZpc2libGUpe1xyXG4gICAgICAgICAgICAgICAgICAgICRjb250YWluZXIuY3NzKCdvcGFjaXR5Jywgb3BhY2l0eSkuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAtMnB4IHRvIGFjY291bnQgZm9yIHN1Z2dlc3Rpb25zIGJvcmRlci5cclxuICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy53aWR0aCA9PT0gJ2F1dG8nKSB7XHJcbiAgICAgICAgICAgICAgICBzdHlsZXMud2lkdGggPSAodGhhdC5lbC5vdXRlcldpZHRoKCkgLSAyKSArICdweCc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICRjb250YWluZXIuY3NzKHN0eWxlcyk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZW5hYmxlS2lsbGVyRm46IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vbignY2xpY2suYXV0b2NvbXBsZXRlJywgdGhhdC5raWxsZXJGbik7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZGlzYWJsZUtpbGxlckZuOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5hdXRvY29tcGxldGUnLCB0aGF0LmtpbGxlckZuKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBraWxsU3VnZ2VzdGlvbnM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICB0aGF0LnN0b3BLaWxsU3VnZ2VzdGlvbnMoKTtcclxuICAgICAgICAgICAgdGhhdC5pbnRlcnZhbElkID0gd2luZG93LnNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGF0LnZpc2libGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmN1cnJlbnRWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoYXQuc3RvcEtpbGxTdWdnZXN0aW9ucygpO1xyXG4gICAgICAgICAgICB9LCA1MCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc3RvcEtpbGxTdWdnZXN0aW9uczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsSWQpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGlzQ3Vyc29yQXRFbmQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgdmFsTGVuZ3RoID0gdGhhdC5lbC52YWwoKS5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25TdGFydCA9IHRoYXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydCxcclxuICAgICAgICAgICAgICAgIHJhbmdlO1xyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzZWxlY3Rpb25TdGFydCA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxlY3Rpb25TdGFydCA9PT0gdmFsTGVuZ3RoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5zZWxlY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIHJhbmdlID0gZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCk7XHJcbiAgICAgICAgICAgICAgICByYW5nZS5tb3ZlU3RhcnQoJ2NoYXJhY3RlcicsIC12YWxMZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbExlbmd0aCA9PT0gcmFuZ2UudGV4dC5sZW5ndGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgb25LZXlQcmVzczogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgc3VnZ2VzdGlvbnMgYXJlIGhpZGRlbiBhbmQgdXNlciBwcmVzc2VzIGFycm93IGRvd24sIGRpc3BsYXkgc3VnZ2VzdGlvbnM6XHJcbiAgICAgICAgICAgIGlmICghdGhhdC5kaXNhYmxlZCAmJiAhdGhhdC52aXNpYmxlICYmIGUud2hpY2ggPT09IGtleXMuRE9XTiAmJiB0aGF0LmN1cnJlbnRWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LmRpc2FibGVkIHx8ICF0aGF0LnZpc2libGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc3dpdGNoIChlLndoaWNoKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuRVNDOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5SSUdIVDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5oaW50ICYmIHRoYXQub3B0aW9ucy5vbkhpbnQgJiYgdGhhdC5pc0N1cnNvckF0RW5kKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RIaW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuVEFCOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LmhpbnQgJiYgdGhhdC5vcHRpb25zLm9uSGludCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdEhpbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCh0aGF0LnNlbGVjdGVkSW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMudGFiRGlzYWJsZWQgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuUkVUVVJOOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KHRoYXQuc2VsZWN0ZWRJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuVVA6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5tb3ZlVXAoKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5ET1dOOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQubW92ZURvd24oKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBDYW5jZWwgZXZlbnQgaWYgZnVuY3Rpb24gZGlkIG5vdCByZXR1cm46XHJcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBvbktleVVwOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhhdC5kaXNhYmxlZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2ggKGUud2hpY2gpIHtcclxuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5VUDpcclxuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5ET1dOOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuY3VycmVudFZhbHVlICE9PSB0aGF0LmVsLnZhbCgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmZpbmRCZXN0SGludCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy5kZWZlclJlcXVlc3RCeSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBEZWZlciBsb29rdXAgaW4gY2FzZSB3aGVuIHZhbHVlIGNoYW5nZXMgdmVyeSBxdWlja2x5OlxyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQub25DaGFuZ2VJbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5vblZhbHVlQ2hhbmdlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhhdC5vcHRpb25zLmRlZmVyUmVxdWVzdEJ5KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5vblZhbHVlQ2hhbmdlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBvblZhbHVlQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoYXQuZWwudmFsKCksXHJcbiAgICAgICAgICAgICAgICBxdWVyeSA9IHRoYXQuZ2V0UXVlcnkodmFsdWUpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0aW9uICYmIHRoYXQuY3VycmVudFZhbHVlICE9PSBxdWVyeSkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb24gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgKG9wdGlvbnMub25JbnZhbGlkYXRlU2VsZWN0aW9uIHx8ICQubm9vcCkuY2FsbCh0aGF0LmVsZW1lbnQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XHJcbiAgICAgICAgICAgIHRoYXQuY3VycmVudFZhbHVlID0gdmFsdWU7XHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xyXG5cclxuICAgICAgICAgICAgLy8gQ2hlY2sgZXhpc3Rpbmcgc3VnZ2VzdGlvbiBmb3IgdGhlIG1hdGNoIGJlZm9yZSBwcm9jZWVkaW5nOlxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy50cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0ICYmIHRoYXQuaXNFeGFjdE1hdGNoKHF1ZXJ5KSkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QoMCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChxdWVyeS5sZW5ndGggPCBvcHRpb25zLm1pbkNoYXJzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuZ2V0U3VnZ2VzdGlvbnMocXVlcnkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgaXNFeGFjdE1hdGNoOiBmdW5jdGlvbiAocXVlcnkpIHtcclxuICAgICAgICAgICAgdmFyIHN1Z2dlc3Rpb25zID0gdGhpcy5zdWdnZXN0aW9ucztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAoc3VnZ2VzdGlvbnMubGVuZ3RoID09PSAxICYmIHN1Z2dlc3Rpb25zWzBdLnZhbHVlLnRvTG93ZXJDYXNlKCkgPT09IHF1ZXJ5LnRvTG93ZXJDYXNlKCkpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGdldFF1ZXJ5OiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICAgICAgdmFyIGRlbGltaXRlciA9IHRoaXMub3B0aW9ucy5kZWxpbWl0ZXIsXHJcbiAgICAgICAgICAgICAgICBwYXJ0cztcclxuXHJcbiAgICAgICAgICAgIGlmICghZGVsaW1pdGVyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGFydHMgPSB2YWx1ZS5zcGxpdChkZWxpbWl0ZXIpO1xyXG4gICAgICAgICAgICByZXR1cm4gJC50cmltKHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBnZXRTdWdnZXN0aW9uc0xvY2FsOiBmdW5jdGlvbiAocXVlcnkpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcclxuICAgICAgICAgICAgICAgIHF1ZXJ5TG93ZXJDYXNlID0gcXVlcnkudG9Mb3dlckNhc2UoKSxcclxuICAgICAgICAgICAgICAgIGZpbHRlciA9IG9wdGlvbnMubG9va3VwRmlsdGVyLFxyXG4gICAgICAgICAgICAgICAgbGltaXQgPSBwYXJzZUludChvcHRpb25zLmxvb2t1cExpbWl0LCAxMCksXHJcbiAgICAgICAgICAgICAgICBkYXRhO1xyXG5cclxuICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb25zOiAkLmdyZXAob3B0aW9ucy5sb29rdXAsIGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpbHRlcihzdWdnZXN0aW9uLCBxdWVyeSwgcXVlcnlMb3dlckNhc2UpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGlmIChsaW1pdCAmJiBkYXRhLnN1Z2dlc3Rpb25zLmxlbmd0aCA+IGxpbWl0KSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhLnN1Z2dlc3Rpb25zID0gZGF0YS5zdWdnZXN0aW9ucy5zbGljZSgwLCBsaW1pdCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGdldFN1Z2dlc3Rpb25zOiBmdW5jdGlvbiAocSkge1xyXG4gICAgICAgICAgICB2YXIgcmVzcG9uc2UsXHJcbiAgICAgICAgICAgICAgICB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgICBzZXJ2aWNlVXJsID0gb3B0aW9ucy5zZXJ2aWNlVXJsLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zLFxyXG4gICAgICAgICAgICAgICAgY2FjaGVLZXksXHJcbiAgICAgICAgICAgICAgICBhamF4U2V0dGluZ3M7XHJcblxyXG4gICAgICAgICAgICBvcHRpb25zLnBhcmFtc1tvcHRpb25zLnBhcmFtTmFtZV0gPSBxO1xyXG4gICAgICAgICAgICBwYXJhbXMgPSBvcHRpb25zLmlnbm9yZVBhcmFtcyA/IG51bGwgOiBvcHRpb25zLnBhcmFtcztcclxuXHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLm9uU2VhcmNoU3RhcnQuY2FsbCh0aGF0LmVsZW1lbnQsIG9wdGlvbnMucGFyYW1zKSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihvcHRpb25zLmxvb2t1cCkpe1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5sb29rdXAocSwgZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gZGF0YS5zdWdnZXN0aW9ucztcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIGRhdGEuc3VnZ2VzdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LmlzTG9jYWwpIHtcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gdGhhdC5nZXRTdWdnZXN0aW9uc0xvY2FsKHEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihzZXJ2aWNlVXJsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VVcmwgPSBzZXJ2aWNlVXJsLmNhbGwodGhhdC5lbGVtZW50LCBxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhY2hlS2V5ID0gc2VydmljZVVybCArICc/JyArICQucGFyYW0ocGFyYW1zIHx8IHt9KTtcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gdGhhdC5jYWNoZWRSZXNwb25zZVtjYWNoZUtleV07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChyZXNwb25zZSAmJiAkLmlzQXJyYXkocmVzcG9uc2Uuc3VnZ2VzdGlvbnMpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gcmVzcG9uc2Uuc3VnZ2VzdGlvbnM7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgcmVzcG9uc2Uuc3VnZ2VzdGlvbnMpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF0aGF0LmlzQmFkUXVlcnkocSkpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuYWJvcnRBamF4KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgYWpheFNldHRpbmdzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDogc2VydmljZVVybCxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBwYXJhbXMsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogb3B0aW9ucy50eXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBvcHRpb25zLmRhdGFUeXBlXHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICQuZXh0ZW5kKGFqYXhTZXR0aW5ncywgb3B0aW9ucy5hamF4U2V0dGluZ3MpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QgPSAkLmFqYXgoYWpheFNldHRpbmdzKS5kb25lKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdDtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBvcHRpb25zLnRyYW5zZm9ybVJlc3VsdChkYXRhLCBxKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LnByb2Nlc3NSZXNwb25zZShyZXN1bHQsIHEsIGNhY2hlS2V5KTtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIHJlc3VsdC5zdWdnZXN0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICB9KS5mYWlsKGZ1bmN0aW9uIChqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pIHtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoRXJyb3IuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgW10pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgaXNCYWRRdWVyeTogZnVuY3Rpb24gKHEpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMucHJldmVudEJhZFF1ZXJpZXMpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgYmFkUXVlcmllcyA9IHRoaXMuYmFkUXVlcmllcyxcclxuICAgICAgICAgICAgICAgIGkgPSBiYWRRdWVyaWVzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIHdoaWxlIChpLS0pIHtcclxuICAgICAgICAgICAgICAgIGlmIChxLmluZGV4T2YoYmFkUXVlcmllc1tpXSkgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGhpZGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24odGhhdC5vcHRpb25zLm9uSGlkZSkgJiYgdGhhdC52aXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0Lm9wdGlvbnMub25IaWRlLmNhbGwodGhhdC5lbGVtZW50LCBjb250YWluZXIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGF0LnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcclxuICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIHRoYXQuc2lnbmFsSGludChudWxsKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzdWdnZXN0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnN1Z2dlc3Rpb25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zaG93Tm9TdWdnZXN0aW9uTm90aWNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub1N1Z2dlc3Rpb25zKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgZ3JvdXBCeSA9IG9wdGlvbnMuZ3JvdXBCeSxcclxuICAgICAgICAgICAgICAgIGZvcm1hdFJlc3VsdCA9IG9wdGlvbnMuZm9ybWF0UmVzdWx0LFxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGF0LmdldFF1ZXJ5KHRoYXQuY3VycmVudFZhbHVlKSxcclxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IHRoYXQuY2xhc3Nlcy5zdWdnZXN0aW9uLFxyXG4gICAgICAgICAgICAgICAgY2xhc3NTZWxlY3RlZCA9IHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCxcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXHJcbiAgICAgICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gJCh0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIpLFxyXG4gICAgICAgICAgICAgICAgYmVmb3JlUmVuZGVyID0gb3B0aW9ucy5iZWZvcmVSZW5kZXIsXHJcbiAgICAgICAgICAgICAgICBodG1sID0gJycsXHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIGZvcm1hdEdyb3VwID0gZnVuY3Rpb24gKHN1Z2dlc3Rpb24sIGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50Q2F0ZWdvcnkgPSBzdWdnZXN0aW9uLmRhdGFbZ3JvdXBCeV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2F0ZWdvcnkgPT09IGN1cnJlbnRDYXRlZ29yeSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5ID0gY3VycmVudENhdGVnb3J5O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiYXV0b2NvbXBsZXRlLWdyb3VwXCI+PHN0cm9uZz4nICsgY2F0ZWdvcnkgKyAnPC9zdHJvbmc+PC9kaXY+JztcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dCAmJiB0aGF0LmlzRXhhY3RNYXRjaCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KDApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBCdWlsZCBzdWdnZXN0aW9ucyBpbm5lciBIVE1MOlxyXG4gICAgICAgICAgICAkLmVhY2godGhhdC5zdWdnZXN0aW9ucywgZnVuY3Rpb24gKGksIHN1Z2dlc3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIGlmIChncm91cEJ5KXtcclxuICAgICAgICAgICAgICAgICAgICBodG1sICs9IGZvcm1hdEdyb3VwKHN1Z2dlc3Rpb24sIHZhbHVlLCBpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwiJyArIGNsYXNzTmFtZSArICdcIiBkYXRhLWluZGV4PVwiJyArIGkgKyAnXCI+JyArIGZvcm1hdFJlc3VsdChzdWdnZXN0aW9uLCB2YWx1ZSkgKyAnPC9kaXY+JztcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFkanVzdENvbnRhaW5lcldpZHRoKCk7XHJcblxyXG4gICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyLmRldGFjaCgpO1xyXG4gICAgICAgICAgICBjb250YWluZXIuaHRtbChodG1sKTtcclxuXHJcbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24oYmVmb3JlUmVuZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgYmVmb3JlUmVuZGVyLmNhbGwodGhhdC5lbGVtZW50LCBjb250YWluZXIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5zaG93KCk7XHJcblxyXG4gICAgICAgICAgICAvLyBTZWxlY3QgZmlyc3QgdmFsdWUgYnkgZGVmYXVsdDpcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuYXV0b1NlbGVjdEZpcnN0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAwO1xyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyLnNjcm9sbFRvcCgwKTtcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jaGlsZHJlbignLicgKyBjbGFzc05hbWUpLmZpcnN0KCkuYWRkQ2xhc3MoY2xhc3NTZWxlY3RlZCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoYXQudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoYXQuZmluZEJlc3RIaW50KCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgbm9TdWdnZXN0aW9uczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKSxcclxuICAgICAgICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gJCh0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hZGp1c3RDb250YWluZXJXaWR0aCgpO1xyXG5cclxuICAgICAgICAgICAgLy8gU29tZSBleHBsaWNpdCBzdGVwcy4gQmUgY2FyZWZ1bCBoZXJlIGFzIGl0IGVhc3kgdG8gZ2V0XHJcbiAgICAgICAgICAgIC8vIG5vU3VnZ2VzdGlvbnNDb250YWluZXIgcmVtb3ZlZCBmcm9tIERPTSBpZiBub3QgZGV0YWNoZWQgcHJvcGVybHkuXHJcbiAgICAgICAgICAgIG5vU3VnZ2VzdGlvbnNDb250YWluZXIuZGV0YWNoKCk7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5lbXB0eSgpOyAvLyBjbGVhbiBzdWdnZXN0aW9ucyBpZiBhbnlcclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZChub1N1Z2dlc3Rpb25zQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoYXQudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgYWRqdXN0Q29udGFpbmVyV2lkdGg6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgd2lkdGgsXHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgd2lkdGggaXMgYXV0bywgYWRqdXN0IHdpZHRoIGJlZm9yZSBkaXNwbGF5aW5nIHN1Z2dlc3Rpb25zLFxyXG4gICAgICAgICAgICAvLyBiZWNhdXNlIGlmIGluc3RhbmNlIHdhcyBjcmVhdGVkIGJlZm9yZSBpbnB1dCBoYWQgd2lkdGgsIGl0IHdpbGwgYmUgemVyby5cclxuICAgICAgICAgICAgLy8gQWxzbyBpdCBhZGp1c3RzIGlmIGlucHV0IHdpZHRoIGhhcyBjaGFuZ2VkLlxyXG4gICAgICAgICAgICAvLyAtMnB4IHRvIGFjY291bnQgZm9yIHN1Z2dlc3Rpb25zIGJvcmRlci5cclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMud2lkdGggPT09ICdhdXRvJykge1xyXG4gICAgICAgICAgICAgICAgd2lkdGggPSB0aGF0LmVsLm91dGVyV2lkdGgoKSAtIDI7XHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIud2lkdGgod2lkdGggPiAwID8gd2lkdGggOiAzMDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZmluZEJlc3RIaW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gdGhhdC5lbC52YWwoKS50b0xvd2VyQ2FzZSgpLFxyXG4gICAgICAgICAgICAgICAgYmVzdE1hdGNoID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIGlmICghdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgJC5lYWNoKHRoYXQuc3VnZ2VzdGlvbnMsIGZ1bmN0aW9uIChpLCBzdWdnZXN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZm91bmRNYXRjaCA9IHN1Z2dlc3Rpb24udmFsdWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHZhbHVlKSA9PT0gMDtcclxuICAgICAgICAgICAgICAgIGlmIChmb3VuZE1hdGNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoID0gc3VnZ2VzdGlvbjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiAhZm91bmRNYXRjaDtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQoYmVzdE1hdGNoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzaWduYWxIaW50OiBmdW5jdGlvbiAoc3VnZ2VzdGlvbikge1xyXG4gICAgICAgICAgICB2YXIgaGludFZhbHVlID0gJycsXHJcbiAgICAgICAgICAgICAgICB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgaWYgKHN1Z2dlc3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIGhpbnRWYWx1ZSA9IHRoYXQuY3VycmVudFZhbHVlICsgc3VnZ2VzdGlvbi52YWx1ZS5zdWJzdHIodGhhdC5jdXJyZW50VmFsdWUubGVuZ3RoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhhdC5oaW50VmFsdWUgIT09IGhpbnRWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5oaW50VmFsdWUgPSBoaW50VmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmhpbnQgPSBzdWdnZXN0aW9uO1xyXG4gICAgICAgICAgICAgICAgKHRoaXMub3B0aW9ucy5vbkhpbnQgfHwgJC5ub29wKShoaW50VmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgdmVyaWZ5U3VnZ2VzdGlvbnNGb3JtYXQ6IGZ1bmN0aW9uIChzdWdnZXN0aW9ucykge1xyXG4gICAgICAgICAgICAvLyBJZiBzdWdnZXN0aW9ucyBpcyBzdHJpbmcgYXJyYXksIGNvbnZlcnQgdGhlbSB0byBzdXBwb3J0ZWQgZm9ybWF0OlxyXG4gICAgICAgICAgICBpZiAoc3VnZ2VzdGlvbnMubGVuZ3RoICYmIHR5cGVvZiBzdWdnZXN0aW9uc1swXSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkLm1hcChzdWdnZXN0aW9ucywgZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IHZhbHVlLCBkYXRhOiBudWxsIH07XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb25zO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHZhbGlkYXRlT3JpZW50YXRpb246IGZ1bmN0aW9uKG9yaWVudGF0aW9uLCBmYWxsYmFjaykge1xyXG4gICAgICAgICAgICBvcmllbnRhdGlvbiA9ICQudHJpbShvcmllbnRhdGlvbiB8fCAnJykudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgICAgIGlmKCQuaW5BcnJheShvcmllbnRhdGlvbiwgWydhdXRvJywgJ2JvdHRvbScsICd0b3AnXSkgPT09IC0xKXtcclxuICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uID0gZmFsbGJhY2s7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBvcmllbnRhdGlvbjtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBwcm9jZXNzUmVzcG9uc2U6IGZ1bmN0aW9uIChyZXN1bHQsIG9yaWdpbmFsUXVlcnksIGNhY2hlS2V5KSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnM7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQuc3VnZ2VzdGlvbnMgPSB0aGF0LnZlcmlmeVN1Z2dlc3Rpb25zRm9ybWF0KHJlc3VsdC5zdWdnZXN0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICAvLyBDYWNoZSByZXN1bHRzIGlmIGNhY2hlIGlzIG5vdCBkaXNhYmxlZDpcclxuICAgICAgICAgICAgaWYgKCFvcHRpb25zLm5vQ2FjaGUpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuY2FjaGVkUmVzcG9uc2VbY2FjaGVLZXldID0gcmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMucHJldmVudEJhZFF1ZXJpZXMgJiYgcmVzdWx0LnN1Z2dlc3Rpb25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuYmFkUXVlcmllcy5wdXNoKG9yaWdpbmFsUXVlcnkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBSZXR1cm4gaWYgb3JpZ2luYWxRdWVyeSBpcyBub3QgbWF0Y2hpbmcgY3VycmVudCBxdWVyeTpcclxuICAgICAgICAgICAgaWYgKG9yaWdpbmFsUXVlcnkgIT09IHRoYXQuZ2V0UXVlcnkodGhhdC5jdXJyZW50VmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSByZXN1bHQuc3VnZ2VzdGlvbnM7XHJcbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGFjdGl2YXRlOiBmdW5jdGlvbiAoaW5kZXgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgYWN0aXZlSXRlbSxcclxuICAgICAgICAgICAgICAgIHNlbGVjdGVkID0gdGhhdC5jbGFzc2VzLnNlbGVjdGVkLFxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKSxcclxuICAgICAgICAgICAgICAgIGNoaWxkcmVuID0gY29udGFpbmVyLmZpbmQoJy4nICsgdGhhdC5jbGFzc2VzLnN1Z2dlc3Rpb24pO1xyXG5cclxuICAgICAgICAgICAgY29udGFpbmVyLmZpbmQoJy4nICsgc2VsZWN0ZWQpLnJlbW92ZUNsYXNzKHNlbGVjdGVkKTtcclxuXHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IGluZGV4O1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCAhPT0gLTEgJiYgY2hpbGRyZW4ubGVuZ3RoID4gdGhhdC5zZWxlY3RlZEluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICBhY3RpdmVJdGVtID0gY2hpbGRyZW4uZ2V0KHRoYXQuc2VsZWN0ZWRJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAkKGFjdGl2ZUl0ZW0pLmFkZENsYXNzKHNlbGVjdGVkKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBhY3RpdmVJdGVtO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzZWxlY3RIaW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIGkgPSAkLmluQXJyYXkodGhhdC5oaW50LCB0aGF0LnN1Z2dlc3Rpb25zKTtcclxuXHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0KGkpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNlbGVjdDogZnVuY3Rpb24gKGkpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICB0aGF0LmhpZGUoKTtcclxuICAgICAgICAgICAgdGhhdC5vblNlbGVjdChpKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBtb3ZlVXA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5jaGlsZHJlbigpLmZpcnN0KCkucmVtb3ZlQ2xhc3ModGhhdC5jbGFzc2VzLnNlbGVjdGVkKTtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5maW5kQmVzdEhpbnQoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhhdC5hZGp1c3RTY3JvbGwodGhhdC5zZWxlY3RlZEluZGV4IC0gMSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgbW92ZURvd246IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gKHRoYXQuc3VnZ2VzdGlvbnMubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhhdC5hZGp1c3RTY3JvbGwodGhhdC5zZWxlY3RlZEluZGV4ICsgMSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgYWRqdXN0U2Nyb2xsOiBmdW5jdGlvbiAoaW5kZXgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgYWN0aXZlSXRlbSA9IHRoYXQuYWN0aXZhdGUoaW5kZXgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFhY3RpdmVJdGVtKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBvZmZzZXRUb3AsXHJcbiAgICAgICAgICAgICAgICB1cHBlckJvdW5kLFxyXG4gICAgICAgICAgICAgICAgbG93ZXJCb3VuZCxcclxuICAgICAgICAgICAgICAgIGhlaWdodERlbHRhID0gJChhY3RpdmVJdGVtKS5vdXRlckhlaWdodCgpO1xyXG5cclxuICAgICAgICAgICAgb2Zmc2V0VG9wID0gYWN0aXZlSXRlbS5vZmZzZXRUb3A7XHJcbiAgICAgICAgICAgIHVwcGVyQm91bmQgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnNjcm9sbFRvcCgpO1xyXG4gICAgICAgICAgICBsb3dlckJvdW5kID0gdXBwZXJCb3VuZCArIHRoYXQub3B0aW9ucy5tYXhIZWlnaHQgLSBoZWlnaHREZWx0YTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvZmZzZXRUb3AgPCB1cHBlckJvdW5kKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnNjcm9sbFRvcChvZmZzZXRUb3ApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9mZnNldFRvcCA+IGxvd2VyQm91bmQpIHtcclxuICAgICAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuc2Nyb2xsVG9wKG9mZnNldFRvcCAtIHRoYXQub3B0aW9ucy5tYXhIZWlnaHQgKyBoZWlnaHREZWx0YSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghdGhhdC5vcHRpb25zLnByZXNlcnZlSW5wdXQpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuZ2V0VmFsdWUodGhhdC5zdWdnZXN0aW9uc1tpbmRleF0udmFsdWUpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQobnVsbCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChpbmRleCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvblNlbGVjdENhbGxiYWNrID0gdGhhdC5vcHRpb25zLm9uU2VsZWN0LFxyXG4gICAgICAgICAgICAgICAgc3VnZ2VzdGlvbiA9IHRoYXQuc3VnZ2VzdGlvbnNbaW5kZXhdO1xyXG5cclxuICAgICAgICAgICAgdGhhdC5jdXJyZW50VmFsdWUgPSB0aGF0LmdldFZhbHVlKHN1Z2dlc3Rpb24udmFsdWUpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuY3VycmVudFZhbHVlICE9PSB0aGF0LmVsLnZhbCgpICYmICF0aGF0Lm9wdGlvbnMucHJlc2VydmVJbnB1dCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQobnVsbCk7XHJcbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSBbXTtcclxuICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb24gPSBzdWdnZXN0aW9uO1xyXG5cclxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihvblNlbGVjdENhbGxiYWNrKSkge1xyXG4gICAgICAgICAgICAgICAgb25TZWxlY3RDYWxsYmFjay5jYWxsKHRoYXQuZWxlbWVudCwgc3VnZ2VzdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBnZXRWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIGRlbGltaXRlciA9IHRoYXQub3B0aW9ucy5kZWxpbWl0ZXIsXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50VmFsdWUsXHJcbiAgICAgICAgICAgICAgICBwYXJ0cztcclxuXHJcbiAgICAgICAgICAgIGlmICghZGVsaW1pdGVyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGN1cnJlbnRWYWx1ZSA9IHRoYXQuY3VycmVudFZhbHVlO1xyXG4gICAgICAgICAgICBwYXJ0cyA9IGN1cnJlbnRWYWx1ZS5zcGxpdChkZWxpbWl0ZXIpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gY3VycmVudFZhbHVlLnN1YnN0cigwLCBjdXJyZW50VmFsdWUubGVuZ3RoIC0gcGFydHNbcGFydHMubGVuZ3RoIC0gMV0ubGVuZ3RoKSArIHZhbHVlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGRpc3Bvc2U6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICB0aGF0LmVsLm9mZignLmF1dG9jb21wbGV0ZScpLnJlbW92ZURhdGEoJ2F1dG9jb21wbGV0ZScpO1xyXG4gICAgICAgICAgICB0aGF0LmRpc2FibGVLaWxsZXJGbigpO1xyXG4gICAgICAgICAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUuYXV0b2NvbXBsZXRlJywgdGhhdC5maXhQb3NpdGlvbkNhcHR1cmUpO1xyXG4gICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gQ3JlYXRlIGNoYWluYWJsZSBqUXVlcnkgcGx1Z2luOlxyXG4gICAgJC5mbi5hdXRvY29tcGxldGUgPSAkLmZuLmRldmJyaWRnZUF1dG9jb21wbGV0ZSA9IGZ1bmN0aW9uIChvcHRpb25zLCBhcmdzKSB7XHJcbiAgICAgICAgdmFyIGRhdGFLZXkgPSAnYXV0b2NvbXBsZXRlJztcclxuICAgICAgICAvLyBJZiBmdW5jdGlvbiBpbnZva2VkIHdpdGhvdXQgYXJndW1lbnQgcmV0dXJuXHJcbiAgICAgICAgLy8gaW5zdGFuY2Ugb2YgdGhlIGZpcnN0IG1hdGNoZWQgZWxlbWVudDpcclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maXJzdCgpLmRhdGEoZGF0YUtleSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGlucHV0RWxlbWVudCA9ICQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IGlucHV0RWxlbWVudC5kYXRhKGRhdGFLZXkpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlICYmIHR5cGVvZiBpbnN0YW5jZVtvcHRpb25zXSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlW29wdGlvbnNdKGFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgaW5zdGFuY2UgYWxyZWFkeSBleGlzdHMsIGRlc3Ryb3kgaXQ6XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UgJiYgaW5zdGFuY2UuZGlzcG9zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLmRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGluc3RhbmNlID0gbmV3IEF1dG9jb21wbGV0ZSh0aGlzLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIGlucHV0RWxlbWVudC5kYXRhKGRhdGFLZXksIGluc3RhbmNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxufSkpO1xyXG4iLCIkKGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHVybFByZWZpeCA9ICcnO1xyXG5cclxuICAgICQuZXh0ZW5kKHtcclxuICAgICAgICBnZXRVcmxWYXJzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIHZhcnMgPSBbXSwgaGFzaDtcclxuICAgICAgICAgICAgdmFyIGhhc2hlcyA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNsaWNlKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJz8nKSArIDEpLnNwbGl0KCcmJyk7XHJcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBoYXNoZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGhhc2ggPSBoYXNoZXNbaV0uc3BsaXQoJz0nKTtcclxuICAgICAgICAgICAgICAgIHZhcnMucHVzaChoYXNoWzBdKTtcclxuICAgICAgICAgICAgICAgIHZhcnNbaGFzaFswXV0gPSBoYXNoWzFdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB2YXJzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0VXJsVmFyOiBmdW5jdGlvbihuYW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkLmdldFVybFZhcnMoKVtuYW1lXTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgYWpheCA9IHtcclxuICAgICAgICBjb250cm9sOiB7XHJcbiAgICAgICAgICAgIHNlbmRGb3JtRGF0YTogZnVuY3Rpb24oZm9ybSwgdXJsLCBsb2dOYW1lLCBzdWNjZXNzQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKCBcInN1Ym1pdFwiLCBmb3JtLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxmID0gJCh0aGlzKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhRm9ybSA9ICQodGhpcykuc2VyaWFsaXplKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0QnV0dG9uID0gJCh0aGlzKS5maW5kKFwiYnV0dG9uW3R5cGU9c3VibWl0XVwiKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRCdXR0b25WYWx1ZSA9IHN1Ym1pdEJ1dHRvbi5odG1sKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHN1Ym1pdEJ1dHRvbi5hdHRyKFwiZGlzYWJsZWRcIiwgXCJkaXNhYmxlZFwiKS5odG1sKCc8aSBjbGFzcz1cImZhIGZhLWNvZyBmYS1zcGluXCI+PC9pPicpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IFwicG9zdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IHVybFByZWZpeCArIHVybCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YUZvcm0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSAkLnBhcnNlSlNPTihyZXNwb25zZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVzcG9uc2UuZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3Ioa2V5IGluIHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHJlc3BvbnNlW2tleV1bMF0gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZvcm1FcnJvciA9IG5vdHkoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0J7RiNC40LHQutCwITwvYj4gXCIgKyByZXNwb25zZVtrZXldWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiAnYW5pbWF0ZWQgZmxpcE91dFgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDcwMDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzQ2FsbGJhY2socmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oanF4aHIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9ycy5jb250cm9sLmxvZyhsb2dOYW1lLCBqcXhocik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZvcm1FcnJvckFqYXggPSBub3R5KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCi0LXRhdC90LjRh9C10YHQutC40LUg0YDQsNCx0L7RgtGLITwvYj48YnI+0JIg0LTQsNC90L3Ri9C5INC80L7QvNC10L3RgiDQstGA0LXQvNC10L3QuFwiICsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiDQv9GA0L7QuNC30LLQtdC00ZHQvdC90L7QtSDQtNC10LnRgdGC0LLQuNC1INC90LXQstC+0LfQvNC+0LbQvdC+LiDQn9C+0L/RgNC+0LHRg9C50YLQtSDQv9C+0LfQttC1LlwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiINCf0YDQuNC90L7RgdC40Lwg0YHQstC+0Lgg0LjQt9Cy0LjQvdC10L3QuNGPINC30LAg0L3QtdGD0LTQvtCx0YHRgtCy0L4uXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46ICdhbmltYXRlZCBmYWRlSW5MZWZ0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlZWQ6IDMwMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3dhcm5pbmcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiAncmVsYXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiAxMDAwMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Ym1pdEJ1dHRvbi5yZW1vdmVBdHRyKFwiZGlzYWJsZWRcIikuaHRtbChvbGRCdXR0b25WYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBlcnJvcnMgPSB7XHJcbiAgICAgICAgY29udHJvbDoge1xyXG4gICAgICAgICAgICBsb2c6IGZ1bmN0aW9uKHR5cGUsIGpxeGhyKSB7XHJcbiAgICAgICAgICAgICAgICAkKFwiPGRpdiBpZD0nZXJyb3ItY29udGFpbmVyJyBzdHlsZT0nZGlzcGxheTpub25lOyc+XCIgKyBqcXhoci5yZXNwb25zZVRleHQgKyBcIjwvZGl2PlwiKS5hcHBlbmRUbyhcImJvZHlcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGVycm9yQ29udGFpbmVyID0gJChcIiNlcnJvci1jb250YWluZXJcIiksXHJcbiAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2UgPSB0eXBlICsgXCI6IFwiICsganF4aHIuc3RhdHVzICsgXCIgXCIgKyBqcXhoci5zdGF0dXNUZXh0ICsgXCIgXCI7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoZXJyb3JDb250YWluZXIuZmluZChcImgyOmZpcnN0XCIpLnRleHQoKSA9PSBcIkRldGFpbHNcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZSArPSBcIi0gXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JDb250YWluZXIuZmluZChcImRpdlwiKS5lYWNoKGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGluZGV4ID4gNCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGVsaW1pdGVyID0gXCIsIFwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihpbmRleCA9PSA0KSBkZWxpbWl0ZXIgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2UgKz0gJCh0aGlzKS50ZXh0KCkgKyBkZWxpbWl0ZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IFwicG9zdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHVybDogdXJsUHJlZml4ICsgXCIvYWpheC1lcnJvclwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IFwibWVzc2FnZT1cIiArIGVycm9yTWVzc2FnZSxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGVycm9yQ29udGFpbmVyLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICB2YXIgaGVhZGVyID0ge1xyXG4gICAgICAgIGNvbnRyb2w6IHtcclxuICAgICAgICAgICAgaGVhZGVyU3RvcmVzTWVudTogJChcIiN0b3BcIikuZmluZChcIi5zdG9yZXNcIiksIFxyXG4gICAgICAgICAgICBzdG9yZXNTdWJtZW51OiAkKFwiI3RvcFwiKS5maW5kKFwiLnN0b3Jlc1wiKS5maW5kKFwiLnN1Ym1lbnVcIiksXHJcbiAgICAgICAgICAgIHBvcHVwU2lnblVwOiAkKFwiI3RvcFwiKS5maW5kKFwiLnBvcHVwX2NvbnRlbnRcIikuZmluZChcIi5zaWduLXVwXCIpLFxyXG4gICAgICAgICAgICBzdG9yZVNob3c6ICcnLFxyXG4gICAgICAgICAgICBzdG9yZUhpZGU6ICcnLFxyXG4gICAgICAgICAgICBwYXNzd29yZFJlY292ZXJ5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciBwYXNzd29yZFJlY292ZXJ5SGFzaCA9ICQuZ2V0VXJsVmFyKFwicHJ2XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKHBhc3N3b3JkUmVjb3ZlcnlIYXNoICE9PSB1bmRlZmluZWQgJiYgcGFzc3dvcmRSZWNvdmVyeUhhc2ggIT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IFwicG9zdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IHVybFByZWZpeCArIFwiL3Bhc3N3b3JkLXJlY292ZXJ5L3VwZGF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBcInBydj1cIiArIHBhc3N3b3JkUmVjb3ZlcnlIYXNoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24gKGpxeGhyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcnMuY29udHJvbC5sb2coJ1Bhc3N3b3JkIFJlY292ZXJ5IFVwZGF0ZSBBamF4IEVycm9yJywganF4aHIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmb3JtRXJyb3JBamF4ID0gbm90eSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCI8Yj7QotC10YXQvdC40YfQtdGB0LrQuNC1INGA0LDQsdC+0YLRiyE8L2I+PGJyPtCSINC00LDQvdC90YvQuSDQvNC+0LzQtdC90YIg0LLRgNC10LzQtdC90LhcIiArIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIg0L/RgNC+0LjQt9Cy0LXQtNGR0L3QvdC+0LUg0LTQtdC50YHRgtCy0LjQtSDQvdC10LLQvtC30LzQvtC20L3Qvi4g0J/QvtC/0YDQvtCx0YPQudGC0LUg0L/QvtC30LbQtS5cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiDQn9GA0LjQvdC+0YHQuNC8INGB0LLQvtC4INC40LfQstC40L3QtdC90LjRjyDQt9CwINC90LXRg9C00L7QsdGB0YLQstC+LlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiAnYW5pbWF0ZWQgZmxpcE91dFgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd3YXJuaW5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICd0b3BSaWdodCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogMTAwMDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gJC5wYXJzZUpTT04ocmVzcG9uc2UpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHJlc3BvbnNlLmVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGtleSBpbiByZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihyZXNwb25zZVtrZXldWzBdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXNzUmVjb3ZFcnJvciA9IG5vdHkoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0J7RiNC40LHQutCwITwvYj4gXCIgKyByZXNwb25zZVtrZXldWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiAnYW5pbWF0ZWQgZmxpcE91dFgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWw6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA3MDAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhc3NSZWNvdlN1Y2Nlc3MgPSBub3R5KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCI8Yj7Qn9C+0LfQtNGA0LDQstC70Y/QtdC8ITwvYj48YnI+INCf0LDRgNC+0LvRjCDRg9GB0L/QtdGI0L3QviDQuNC30LzQtdC90ZHQvS4g0J3QvtCy0YvQuSDQv9Cw0YDQvtC70Yw6IDxiPlwiICsgcmVzcG9uc2UucGFzc3dvcmQgKyBcIjwvYj48YnI+PGJyPlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46ICdhbmltYXRlZCBmYWRlSW5MZWZ0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiAnYW5pbWF0ZWQgZmxpcE91dFgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlZWQ6IDMwMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiAncmVsYXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWw6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlV2l0aDogWydidXR0b24nXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUobnVsbCwgbnVsbCwgJy8nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXZlbnRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICAgICAgICAgIHNlbGYuaGVhZGVyU3RvcmVzTWVudS5ob3ZlcihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZigkKHdpbmRvdykud2lkdGgoKSA+IDk5MSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoc2VsZi5zdG9yZUhpZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnN0b3JlU2hvdyA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnN0b3Jlc1N1Ym1lbnUuY2xlYXJRdWV1ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zdG9yZXNTdWJtZW51LmNzcyhcImRpc3BsYXlcIiwgXCJibG9ja1wiKS5hbmltYXRlKHtcIm9wYWNpdHlcIjogMX0sIDM1MCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDIwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoJCh3aW5kb3cpLndpZHRoKCkgPiA5OTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYuc3RvcmVTaG93KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zdG9yZUhpZGUgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zdG9yZXNTdWJtZW51LmNsZWFyUXVldWUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc3RvcmVzU3VibWVudS5hbmltYXRlKHtcIm9wYWNpdHlcIjogMH0sIDIwMCwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5jc3MoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAzMDApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucGFzc3dvcmRSZWNvdmVyeSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKCQod2luZG93KS53aWR0aCgpID4gOTkxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIi5mb3JtLXNlYXJjaC1kcCBpbnB1dFwiKS5hdXRvY29tcGxldGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlVXJsOiAnL3NlYXJjaCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vQ2FjaGU6ICd0cnVlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJSZXF1ZXN0Qnk6IDMwMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU2VsZWN0OiBmdW5jdGlvbiAoc3VnZ2VzdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9ICcvc3RvcmVzLycgKyBzdWdnZXN0aW9uLmRhdGEucm91dGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAkKFwiZm9ybVtuYW1lPXNlYXJjaF0gLmZhXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykuY2xvc2VzdChcImZvcm1cIikuc3VibWl0KCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAkKFwiLmRvYnJvaGVhZCBpLCAuZG9icm8gLmNpcmNsZSAuYyAuZmEtaGVhcnRcIikuYW5pbW8oe2FuaW1hdGlvbjogXCJwdWxzZVwiLCBpdGVyYXRlOiBcImluZmluaXRlXCJ9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgYWN0aXZlQ2F0ZWdvcnkgPSAkKFwiLmhlYWRlci1uYXYgbmF2IHVsLnByaW1hcnktbmF2IC5zdWJtZW51IC50cmVlIGFbaHJlZj0nXCIrbG9jYXRpb24ucGF0aG5hbWUrXCInXVwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZihhY3RpdmVDYXRlZ29yeS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlQ2F0ZWdvcnkuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNvdXBvbnMgPSB7XHJcbiAgICAgICAgY29udHJvbDoge1xyXG4gICAgICAgICAgICBldmVudHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJC5jb3VudGRvd24ucmVnaW9uYWxPcHRpb25zWydydSddID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsczogWyfQm9C10YInLCAn0JzQtdGB0Y/RhtC10LInLCAn0J3QtdC00LXQu9GMJywgJ9CU0L3QtdC5JywgJ9Cn0LDRgdC+0LInLCAn0JzQuNC90YPRgicsICfQodC10LrRg9C90LQnXSxcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbHMxOiBbJ9CT0L7QtCcsICfQnNC10YHRj9GGJywgJ9Cd0LXQtNC10LvRjycsICfQlNC10L3RjCcsICfQp9Cw0YEnLCAn0JzQuNC90YPRgtCwJywgJ9Ch0LXQutGD0L3QtNCwJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxzMjogWyfQk9C+0LTQsCcsICfQnNC10YHRj9GG0LAnLCAn0J3QtdC00LXQu9C4JywgJ9CU0L3RjycsICfQp9Cw0YHQsCcsICfQnNC40L3Rg9GC0YsnLCAn0KHQtdC60YPQvdC00YsnXSxcclxuICAgICAgICAgICAgICAgICAgICBjb21wYWN0TGFiZWxzOiBbJ9C7JywgJ9C8JywgJ9C9JywgJ9C0J10sIGNvbXBhY3RMYWJlbHMxOiBbJ9CzJywgJ9C8JywgJ9C9JywgJ9C0J10sXHJcbiAgICAgICAgICAgICAgICAgICAgd2hpY2hMYWJlbHM6IGZ1bmN0aW9uKGFtb3VudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdW5pdHMgPSBhbW91bnQgJSAxMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRlbnMgPSBNYXRoLmZsb29yKChhbW91bnQgJSAxMDApIC8gMTApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGFtb3VudCA9PSAxID8gMSA6ICh1bml0cyA+PSAyICYmIHVuaXRzIDw9IDQgJiYgdGVucyAhPSAxID8gMiA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAodW5pdHMgPT0gMSAmJiB0ZW5zICE9IDEgPyAxIDogMCkpKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGRpZ2l0czogWycwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5J10sXHJcbiAgICAgICAgICAgICAgICAgICAgdGltZVNlcGFyYXRvcjogJzonLCBcclxuICAgICAgICAgICAgICAgICAgICBpc1JUTDogZmFsc2VcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgJC5jb3VudGRvd24uc2V0RGVmYXVsdHMoJC5jb3VudGRvd24ucmVnaW9uYWxPcHRpb25zWydydSddKTtcclxuXHJcbiAgICAgICAgICAgICAgICAkKFwiI3RvcFwiKS5maW5kKCcuY291cG9ucyAuY3VycmVudC1jb3Vwb24gLnRpbWUgLmNsb2NrJykuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZiA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGVFbmQgPSBuZXcgRGF0ZShzZWxmLmF0dHIoXCJkYXRhLWVuZFwiKS5yZXBsYWNlKC8tL2csIFwiL1wiKSk7IFxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuY291bnRkb3duKHt1bnRpbDogZGF0ZUVuZCwgY29tcGFjdDogdHJ1ZX0pOyBcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICQoXCIjdG9wXCIpLmZpbmQoJy5jb3Vwb25zIC5jdXJyZW50LWNvdXBvbiAuY291bnRkb3duLWFtb3VudCcpLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGYgPSAkKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZihzZWxmLnRleHQoKSA9PSBcIjAwOjAwOjAwXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5jbG9zZXN0KFwiLmN1cnJlbnQtY291cG9uXCIpLmZpbmQoXCIuZXhwaXJ5XCIpLmNzcyhcImRpc3BsYXlcIiwgXCJ0YWJsZS1jZWxsXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuY291cG9ucyAuY3VycmVudC1jb3Vwb24gLnRleHQgLmFkZGl0aW9uYWwgYVwiKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLm5leHQoXCJzcGFuXCIpLnRvZ2dsZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykudGV4dChmdW5jdGlvbihpLCB2KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHYgPSB2LnNwbGl0KFwiIFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHYuaW5kZXhPZign0J/QvtC60LDQt9Cw0YLRjCcpICE9IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2WzBdID0gJ9Ch0LrRgNGL0YLRjCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2WzBdID0gJ9Cf0L7QutCw0LfQsNGC0YwnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2ID0gdi5qb2luKFwiIFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHY7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuY2F0ZWdvcmllcyAuc2VhcmNoLXN0b3JlLWNvdXBvbnMgaW5wdXRcIikua2V5dXAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlWYWx1ZSA9ICQodGhpcykudmFsKCkudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoaVZhbHVlICE9IFwiXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChcIi5jYXRlZ29yaWVzIC5jb3Vwb25zLXN0b3JlcyBsaSBhXCIpLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3RvcmVOYW1lID0gJCh0aGlzKS50ZXh0KCkudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihzdG9yZU5hbWUuaW5kZXhPZihpVmFsdWUpICE9IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucGFyZW50KCkuY3NzKFwiZGlzcGxheVwiLCBcIm5vbmVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoXCIuY2F0ZWdvcmllcyAuY291cG9ucy1zdG9yZXMgbGlcIikuY3NzKFwiZGlzcGxheVwiLCBcImJsb2NrXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIiwgXCIjdG9wIC5jb3Vwb25zIC5jdXJyZW50LWNvdXBvbiAudGV4dCAuY291cG9uLWdvdG8gYVtocmVmPSNzaG93cHJvbW9jb2RlXVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZiA9ICQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYubmV4dChcImRpdlwiKS5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi50ZXh0KFwi0JjRgdC/0L7Qu9GM0LfQvtCy0LDRgtGMINC60YPQv9C+0L1cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5hdHRyKFwidGFyZ2V0XCIsIFwiX2JsYW5rXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYXR0cihcImhyZWZcIiwgXCIvZ290by9jb3Vwb246XCIgKyBzZWxmLmNsb3Nlc3QoXCIuY3VycmVudC1jb3Vwb25cIikuYXR0cihcImRhdGEtdWlkXCIpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSk7ICAgICAgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBwb3B1cCA9IHtcclxuICAgICAgICBjb250cm9sOiB7XHJcbiAgICAgICAgICAgIHN0YXJOb21pbmF0aW9uOiBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICB2YXIgc3RhcnMgPSAkKFwiI3RvcCAucG9wdXAgLmZlZWRiYWNrLnBvcHVwLWNvbnRlbnQgLnJhdGluZyAuZmEtd3JhcHBlciAuZmFcIik7XHJcbiAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICBzdGFycy5yZW1vdmVDbGFzcyhcImZhLXN0YXJcIikuYWRkQ2xhc3MoXCJmYS1zdGFyLW9cIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgaW5kZXg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJzLmVxKGkpLnJlbW92ZUNsYXNzKFwiZmEtc3Rhci1vXCIpLmFkZENsYXNzKFwiZmEtc3RhclwiKTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZWdpc3RyYXRpb246IGZ1bmN0aW9uKHNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHNlbGVjdG9yIGluIHNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChzZWxlY3RvcikucG9wdXAoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50IDogc2V0dGluZ3Nbc2VsZWN0b3JdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlIDogJ2h0bWwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhZnRlck9wZW46IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFjdGl2ZUVsZW1lbnQgPSAkKFwiI3RvcCBhLnBvcHVwX2FjdGl2ZVwiKS5hdHRyKFwiaHJlZlwiKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyonI2xvZ2luJyA6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaDMnIDogJ9CS0YXQvtC0INC90LAg0YHQsNC50YInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdidXR0b24nIDogJ9CS0L7QudGC0Lgg0LIg0LvQuNGH0L3Ri9C5INC60LDQsdC40L3QtdGCJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaW5wdXRbdHlwZT1wYXNzd29yZF0nIDogJ9CS0LLQtdC00LjRgtC1INCy0LDRiCDQv9Cw0YDQvtC70YwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdoNCcgOiAn0JjQu9C4INCy0L7QudC00LjRgtC1INC6INC90LDQvCDRgSDQv9C+0LzQvtGJ0YzRjiDRgdC+0YbRgdC10YLQtdC5OicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJy5zaWduLXVwLXRhZ2xpbmUnIDogJ9Ch0L7QstC10YDRiNCw0Y8g0LLRhdC+0LQg0L3QsCDRgdCw0LnRgiwg0JLRiyDRgdC+0LPQu9Cw0YjQsNC10YLQtdGB0Ywg0YEg0L3QsNGI0LjQvNC4IDxhIGhyZWY9XCIvdGVybXNcIj7Qn9GA0LDQstC40LvQsNC80Lg8L2E+JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLnRlcm1zJyA6ICc8YSBocmVmPVwiI3Bhc3N3b3JkLXJlY292ZXJ5XCIgY2xhc3M9XCJpZ25vcmUtaGFzaFwiPtCX0LDQsdGL0LvQuCDQv9Cw0YDQvtC70Yw/PC9hPicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2lucHV0W25hbWU9dHlwZV0nIDogJ2xvZ2luJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcjcmVnaXN0cmF0aW9uJyA6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaDMnIDogJ9Cd0LDRh9C90LjRgtC1INGN0LrQvtC90L7QvNC40YLRjCDRg9C20LUg0YHQtdCz0L7QtNC90Y8hJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYnV0dG9uJyA6ICfQn9GA0LjRgdC+0LXQtNC40L3QuNGC0YzRgdGPINC4INC90LDRh9Cw0YLRjCDRjdC60L7QvdC+0LzQuNGC0YwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdpbnB1dFt0eXBlPXBhc3N3b3JkXScgOiAn0J/RgNC40LTRg9C80LDQudGC0LUg0L/QsNGA0L7Qu9GMJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaDQnIDogJ9CY0LvQuCDQv9GA0LjRgdC+0LXQtNC40L3Rj9C50YLQtdGB0Ywg0Log0L3QsNC8INGBINC/0L7QvNC+0YnRjNGOINGB0L7RhtGB0LXRgtC10Lk6JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLnNpZ24tdXAtdGFnbGluZScgOiAn0KDQtdCz0LjRgdGC0YDQsNGG0LjRjyDQv9C+0LvQvdC+0YHRgtGM0Y4g0LHQtdGB0L/Qu9Cw0YLQvdCwINC4INC30LDQudC80ZHRgiDRgyDQktCw0YEg0L3QtdGB0LrQvtC70YzQutC+INGB0LXQutGD0L3QtCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJy50ZXJtcycgOiAn0KDQtdCz0LjRgdGC0YDQuNGA0YPRj9GB0YwsINGPINGB0L7Qs9C70LDRiNCw0Y7RgdGMINGBIDxhIGhyZWY9XCIvdGVybXNcIj7Qn9GA0LDQstC40LvQsNC80Lg8L2E+JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaW5wdXRbbmFtZT10eXBlXScgOiAncmVnaXN0cmF0aW9uJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyNnaXZlZmVlZGJhY2snIDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdoMycgOiAn0J7RgtC30YvQsiDQviDRgdCw0LnRgtC1JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaW5wdXRbbmFtZT10eXBlXScgOiAnZmVlZGJhY2snXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyNyZXZpZXdzdG9yZScgOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2gzJyA6ICfQntGC0LfRi9CyINC+INC80LDQs9Cw0LfQuNC90LUgJyArICQoXCIjc3RvcmUtaW5mb3JtYXRpb25cIikuYXR0cihcImRhdGEtc3RvcmUtbmFtZVwiKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaW5wdXRbbmFtZT10eXBlXScgOiAncmV2aWV3XycgKyAkKFwiI3N0b3JlLWluZm9ybWF0aW9uXCIpLmF0dHIoXCJkYXRhLXN0b3JlLWlkXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoJC5pbkFycmF5KGFjdGl2ZUVsZW1lbnQsIFsnI2xvZ2luJywgJyNyZWdpc3RyYXRpb24nXSkgIT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcG9wdXBXaW5kb3cgPSAkKFwiI3RvcFwiKS5maW5kKFwiLnBvcHVwX2NvbnRlbnRcIikuZmluZChcIi5zaWduLXVwXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcHVwV2luZG93LmZpbmQoXCIuc29jaWFsLWljb25cIikucHJlcGVuZChcIlwiICsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjxkaXYgaWQ9XFxcInVMb2dpbjZkYWIzYTJkXFxcIlwiICsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRhdGEtdWxvZ2luPVxcXCJkaXNwbGF5PWJ1dHRvbnM7ZmllbGRzPWZpcnN0X25hbWUsZW1haWwsbGFzdF9uYW1lLG5pY2tuYW1lLHNleCxiZGF0ZSxwaG90byxcIiArIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwaG90b19iaWc7b3B0aW9uYWw9cGhvbmUsY2l0eSxjb3VudHJ5O2xhbmc9cnU7cHJvdmlkZXJzPXZrb250YWt0ZSxvZG5va2xhc3NuaWtpLFwiICsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImZhY2Vib29rLHR3aXR0ZXI7cmVkaXJlY3RfdXJpPWh0dHAlM0ElMkYlMkZzZWNyZXRkaXNjb3VudGVyLnJ1JTJGYXV0aG9yaXphdGlvbnNvY2lhbF9sb2dpblxcXCI+XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI8aW1nIHNyYz1cXFwiL2ltYWdlcy9hY2NvdW50L3ZrLnBuZ1xcXCIgZGF0YS11bG9naW5idXR0b249XFxcInZrb250YWt0ZVxcXCIgYWx0PVxcXCJ2a29udGFrdGUtdWxvZ2luXFxcIj5cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjxpbWcgc3JjPVxcXCIvaW1hZ2VzL2FjY291bnQvZmIucG5nXFxcIiBkYXRhLXVsb2dpbmJ1dHRvbj1cXFwiZmFjZWJvb2tcXFwiIGFsdD1cXFwiZmFjZWJvb2stdWxvZ2luXFxcIj5cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjxpbWcgc3JjPVxcXCIvaW1hZ2VzL2FjY291bnQvdHcucG5nXFxcIiBkYXRhLXVsb2dpbmJ1dHRvbj1cXFwidHdpdHRlclxcXCIgYWx0PVxcXCJ0d2l0dGVyLXVsb2dpblxcXCI+XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI8aW1nIHNyYz1cXFwiL2ltYWdlcy9hY2NvdW50L29rLnBuZ1xcXCIgZGF0YS11bG9naW5idXR0b249XFxcIm9kbm9rbGFzc25pa2lcXFwiIGFsdD1cXFwib2Rub2tsYXNzbmlraS11bG9naW5cXFwiPlwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiPC9kaXY+XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoJC5pbkFycmF5KGFjdGl2ZUVsZW1lbnQsIFsnI2dpdmVmZWVkYmFjaycsICcjcmV2aWV3c3RvcmUnXSkgIT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcG9wdXBXaW5kb3cgPSAkKFwiI3RvcFwiKS5maW5kKFwiLnBvcHVwX2NvbnRlbnRcIikuZmluZChcIi5mZWVkYmFja1wiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGtleSBpbiBzZXR0aW5nc1thY3RpdmVFbGVtZW50XSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKCQuaW5BcnJheShrZXksIFsnaDMnLCAnYnV0dG9uJywgJ2g0J10pICE9IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcHVwV2luZG93LmZpbmQoa2V5KS50ZXh0KHNldHRpbmdzW2FjdGl2ZUVsZW1lbnRdW2tleV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZigkLmluQXJyYXkoa2V5LCBbJy5zaWduLXVwLXRhZ2xpbmUnLCAnLnRlcm1zJ10pICE9IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcHVwV2luZG93LmZpbmQoa2V5KS5odG1sKHNldHRpbmdzW2FjdGl2ZUVsZW1lbnRdW2tleV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZigkLmluQXJyYXkoa2V5LCBbJ2lucHV0W3R5cGU9cGFzc3dvcmRdJ10pICE9IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcHVwV2luZG93LmZpbmQoa2V5KS5hdHRyKCdwbGFjZWhvbGRlcicsIHNldHRpbmdzW2FjdGl2ZUVsZW1lbnRdW2tleV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZigkLmluQXJyYXkoa2V5LCBbJ2lucHV0W25hbWU9dHlwZV0nXSkgIT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9wdXBXaW5kb3cuZmluZChrZXkpLnZhbChzZXR0aW5nc1thY3RpdmVFbGVtZW50XVtrZXldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoYWN0aXZlRWxlbWVudCAhPSBcIiNjZXJ0XCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3B1cFdpbmRvdy5hbmltYXRlKHsnb3BhY2l0eScgOiAxfSwgMzAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1TG9naW4uY3VzdG9tSW5pdCgndUxvZ2luNmRhYjNhMmQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pOyAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGV2ZW50czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICBwb3B1cHMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLydhW2hyZWY9I2xvZ2luXScgOiAkKFwiI3RvcFwiKS5maW5kKCcucG9wdXAtbG9naW4nKS5odG1sKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLydhW2hyZWY9I3JlZ2lzdHJhdGlvbl0nIDogJChcIiN0b3BcIikuZmluZCgnLnBvcHVwLWxvZ2luJykuaHRtbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2FbaHJlZj0jZ2l2ZWZlZWRiYWNrXScgOiAgJChcIiN0b3BcIikuZmluZCgnLnBvcHVwLWdpdmVmZWVkYmFjaycpLmh0bWwoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhW2hyZWY9I3Jldmlld3N0b3JlXScgOiAgJChcIiN0b3BcIikuZmluZCgnLnBvcHVwLWdpdmVmZWVkYmFjaycpLmh0bWwoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhW2hyZWY9I2NlcnRdJyA6ICAkKFwiI3RvcFwiKS5maW5kKCcucG9wdXAtY2VydCcpLmh0bWwoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vJ2FbaHJlZj0jcGFzc3dvcmQtcmVjb3ZlcnldJyA6ICQoXCIjdG9wXCIpLmZpbmQoJy5wb3B1cC1yZWNvdmVyeScpLmh0bWwoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vdGhpcy5yZWdpc3RyYXRpb24ocG9wdXBzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKiQoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIiwgXCIjdG9wIGFbaHJlZj0jcGFzc3dvcmQtcmVjb3ZlcnldXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoXCIjdG9wIC5wb3B1cC1zaWduLXVwXCIpLmNsb3Nlc3QoXCIucG9wdXBcIikubmV4dChcIi5wb3B1cF9jbG9zZVwiKS5jbGljaygpO1xyXG4gICAgICAgICAgICAgICAgfSk7Ki9cclxuXHJcbiAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vbihcIm1vdXNlb3ZlclwiLCBcIiN0b3AgLnBvcHVwIC5mZWVkYmFjay5wb3B1cC1jb250ZW50IC5yYXRpbmcgLmZhLXdyYXBwZXIgLmZhXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc3Rhck5vbWluYXRpb24oJCh0aGlzKS5pbmRleCgpICsgMSk7XHJcbiAgICAgICAgICAgICAgICB9KS5vbihcIm1vdXNlbGVhdmVcIiwgXCIjdG9wIC5wb3B1cCAuZmVlZGJhY2sucG9wdXAtY29udGVudCAucmF0aW5nIC5mYS13cmFwcGVyXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc3Rhck5vbWluYXRpb24oJChcIiN0b3AgLnBvcHVwIC5mZWVkYmFjay5wb3B1cC1jb250ZW50IGlucHV0W25hbWU9cmF0aW5nXVwiKS52YWwoKSk7ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgfSkub24oXCJjbGlja1wiLCBcIiN0b3AgLnBvcHVwIC5mZWVkYmFjay5wb3B1cC1jb250ZW50IC5yYXRpbmcgLmZhLXdyYXBwZXIgLmZhXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc3Rhck5vbWluYXRpb24oJCh0aGlzKS5pbmRleCgpICsgMSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgJChcIiN0b3AgLnBvcHVwIC5mZWVkYmFjay5wb3B1cC1jb250ZW50IGlucHV0W25hbWU9cmF0aW5nXVwiKS52YWwoJCh0aGlzKS5pbmRleCgpICsgMSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKmFqYXguY29udHJvbC5zZW5kRm9ybURhdGEoXCIjdG9wIC5zaWdudXAtZm9ybVwiLCBcIi9hdXRob3JpemF0aW9uXCIsIFwiQXV0aCBBamF4IEVycm9yXCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZihkYXRhLnR5cGUgPT0gJ3JlZ2lzdHJhdGlvbicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9IHVybFByZWZpeCArIFwiL2FjY291bnRcIiArIGRhdGEucGFyYW07XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9IHVybFByZWZpeCArIFwiL2FjY291bnRcIjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTsqL1xyXG5cclxuICAgICAgICAgICAgICAgIC8qYWpheC5jb250cm9sLnNlbmRGb3JtRGF0YShcIiN0b3AgLnJlY292ZXJ5LWZvcm1cIiwgXCIvcGFzc3dvcmQtcmVjb3ZlcnkvaW5zdHJ1Y3Rpb25zXCIsIFwiUGFzc3dvcmQgUmVjb3ZlcnkgSW5zdHJ1Y3Rpb25zIEFqYXggRXJyb3JcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIiN0b3AgLnJlY292ZXJ5XCIpLmNsb3Nlc3QoXCIucG9wdXBcIikubmV4dChcIi5wb3B1cF9jbG9zZVwiKS5jbGljaygpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgcGFzc05vdHlTdWNjZXNzID0gbm90eSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0J/QvtC30LTRgNCw0LLQu9GP0LXQvCE8L2I+PGJyPiDQmNC90YHRgtGA0YPQutGG0LjQuCDQv9C+INCy0L7RgdGB0YLQsNC90L7QstC70LXQvdC40Y4g0L/QsNGA0L7Qu9GPINGD0YHQv9C10YjQvdC+XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiINC+0YLQv9GA0LDQstC70LXQvdGLINC90LAg0YPQutCw0LfQsNC90L3Ri9C5IGVtYWlsINCw0LTRgNC10YEuINCV0YHQu9C4INC/0LjRgdGM0LzQviDQvdC1INC/0YDQuNGI0LvQviDQsiDRgtC10YfQtdC90LjQtSAyINC80LjQvdGD0YIsINC/0L7RgdC80L7RgtGA0LjRgtC1INCyINC/0LDQv9C60LUgwqvQodC/0LDQvMK7LlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46ICdhbmltYXRlZCBmYWRlSW5MZWZ0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiAnYW5pbWF0ZWQgZmxpcE91dFgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlZWQ6IDMwMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiAncmVsYXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICd0b3BSaWdodCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDcwMDBcclxuICAgICAgICAgICAgICAgICAgICB9KTsgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgfSk7Ki9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgcmV2aWV3cyA9IHtcclxuICAgICAgICBjb250cm9sOiB7XHJcbiAgICAgICAgICAgIGV2ZW50czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBhZGQgYSBjb21tZW50IHRvIHRoZSBzaXRlXHJcbiAgICAgICAgICAgICAgICBhamF4LmNvbnRyb2wuc2VuZEZvcm1EYXRhKFwiI3RvcCAuZmVlZGJhY2stZm9ybVwiLCBcIi9yZXZpZXdzXCIsIFwiUmV2aWV3cyBBamF4IEVycm9yXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoXCIjdG9wIC5mZWVkYmFja1wiKS5jbG9zZXN0KFwiLnBvcHVwXCIpLm5leHQoXCIucG9wdXBfY2xvc2VcIikuY2xpY2soKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJldmlld1N1Y2Nlc3MgPSBub3R5KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCI8Yj7QodC/0LDRgdC40LHQviE8L2I+PGJyPtCS0LDRiCDQvtGC0LfRi9CyINGD0YHQv9C10YjQvdC+INC00L7QsdCw0LLQu9C10L0g0Lgg0LHRg9C00LXRglwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiDQvtC/0YPQsdC70LjQutC+0LLQsNC9INC90LAg0YHQsNC50YLQtSDQv9C+0YHQu9C1INC80L7QtNC10YDQsNGG0LjQuC5cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA3MDAwXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTsgICAgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBjYXRhbG9nID0ge1xyXG4gICAgICAgIGNvbnRyb2w6IHtcclxuICAgICAgICAgICAgZXZlbnRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoXCIjdG9wIC5kcm9wZG93bi1zZWxlY3QgLmRyb3BPdXQgbGlcIikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9ICQodGhpcykuZmluZChcImFcIikuYXR0cihcImhyZWZcIik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgZmF2b3JpdGVzID0ge1xyXG4gICAgICAgIGNvbnRyb2w6IHtcclxuICAgICAgICAgICAgZXZlbnRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuZmF2b3JpdGUtbGluay5pYVwiKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZiA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHR5cGUgPSBzZWxmLmF0dHIoXCJkYXRhLXN0YXRlXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFmZmlsaWF0ZV9pZCA9IHNlbGYuYXR0cihcImRhdGEtYWZmaWxpYXRlLWlkXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZih0eXBlID09IFwiYWRkXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5maW5kKFwiLmZhXCIpLnJlbW92ZUNsYXNzKFwibXV0ZWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmZpbmQoXCIuZmFcIikucmVtb3ZlQ2xhc3MoXCJwdWxzZTJcIikuYWRkQ2xhc3MoXCJmYS1zcGluXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IFwicG9zdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IHVybFByZWZpeCArIFwiL2FjY291bnQvZmF2b3JpdGVzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IFwidHlwZT1cIiArIHR5cGUgKyBcIiZhZmZpbGlhdGVfaWQ9XCIgKyBhZmZpbGlhdGVfaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoanF4aHIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9ycy5jb250cm9sLmxvZygnRmF2b3JpdGVzIEFqYXggRXJyb3InLCBqcXhocik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZhdkVycm9yQWpheCA9IG5vdHkoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0KLQtdGF0L3QuNGH0LXRgdC60LjQtSDRgNCw0LHQvtGC0YshPC9iPjxicj7QkiDQtNCw0L3QvdGL0Lkg0LzQvtC80LXQvdGCINCy0YDQtdC80LXQvdC4XCIgKyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiINC/0YDQvtC40LfQstC10LTRkdC90L3QvtC1INC00LXQudGB0YLQstC40LUg0L3QtdCy0L7Qt9C80L7QttC90L4uINCf0L7Qv9GA0L7QsdGD0LnRgtC1INC/0L7Qt9C20LUuXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIg0J/RgNC40L3QvtGB0LjQvCDRgdCy0L7QuCDQuNC30LLQuNC90LXQvdC40Y8g0LfQsCDQvdC10YPQtNC+0LHRgdGC0LLQvi5cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnd2FybmluZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDEwMDAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih0eXBlID09IFwiYWRkXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmZpbmQoXCIuZmFcIikuYWRkQ2xhc3MoXCJtdXRlZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmZpbmQoXCIuZmFcIikucmVtb3ZlQ2xhc3MoXCJmYS1zcGluXCIpLmFkZENsYXNzKFwicHVsc2UyXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gJC5wYXJzZUpTT04ocmVzcG9uc2UpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHJlc3BvbnNlLmVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGtleSBpbiByZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihyZXNwb25zZVtrZXldWzBdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmYXZvcml0ZXNFcnJvciA9IG5vdHkoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0J7RiNC40LHQutCwITwvYj4gXCIgKyByZXNwb25zZVtrZXldWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiAnYW5pbWF0ZWQgZmxpcE91dFgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDcwMDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih0eXBlID09IFwiYWRkXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5maW5kKFwiLmZhXCIpLmFkZENsYXNzKFwibXV0ZWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmZpbmQoXCIuZmFcIikucmVtb3ZlQ2xhc3MoXCJmYS1zcGluXCIpLmFkZENsYXNzKFwicHVsc2UyXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmF2b3JpdGVzU3VjY2VzcyA9IG5vdHkoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiByZXNwb25zZS5tc2csXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNzAwMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih0eXBlID09IFwiYWRkXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hdHRyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS1zdGF0ZVwiOiBcImRlbGV0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLW9yaWdpbmFsLXRpdGxlXCI6IFwi0KPQtNCw0LvQuNGC0Ywg0LjQtyDQuNC30LHRgNCw0L3QvdC+0LPQvlwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5maW5kKFwiLmZhXCIpLnJlbW92ZUNsYXNzKFwiZmEtc3BpbiBmYS1zdGFyLW9cIikuYWRkQ2xhc3MoXCJwdWxzZTIgZmEtc3RhclwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYodHlwZSA9PSBcImRlbGV0ZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYXR0cih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRhdGEtc3RhdGVcIjogXCJhZGRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS1vcmlnaW5hbC10aXRsZVwiIDogXCLQlNC+0LHQsNCy0LjRgtGMINCyINC40LfQsdGA0LDQvdC90L7QtVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pOyAgICAgICAgICAgICAgICAgICBcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZmluZChcIi5mYVwiKS5yZW1vdmVDbGFzcyhcImZhLXNwaW4gZmEtc3RhclwiKS5hZGRDbGFzcyhcInB1bHNlMiBmYS1zdGFyLW8gbXV0ZWRcIik7ICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pOyAgICAgICBcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBcclxuICAgIHBvcHVwLmNvbnRyb2wuZXZlbnRzKCk7XHJcbiAgICBoZWFkZXIuY29udHJvbC5ldmVudHMoKTtcclxuICAgIGNvdXBvbnMuY29udHJvbC5ldmVudHMoKTtcclxuICAgIHJldmlld3MuY29udHJvbC5ldmVudHMoKTtcclxuICAgIGNhdGFsb2cuY29udHJvbC5ldmVudHMoKTtcclxuICAgIGZhdm9yaXRlcy5jb250cm9sLmV2ZW50cygpO1xyXG59KTtcclxuXHJcblxyXG4kKHdpbmRvdykubG9hZChmdW5jdGlvbigpe1xyXG5cclxuICAgIC8qIFNjcm9sbGJhciBJbml0XHJcbiAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG4gICAgLy8gJChcIiN0b3BcIikuZmluZChcIi5zdWJtZW51IC50cmVlXCIpLm1DdXN0b21TY3JvbGxiYXIoe1xyXG4gICAgLy8gICAgIGF4aXM6XCJ5XCIsXHJcbiAgICAvLyAgICAgc2V0SGVpZ2h0OiAzMDBcclxuICAgIC8vIH0pOyBcclxuICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuYy13cmFwcGVyXCIpLm1DdXN0b21TY3JvbGxiYXIoe1xyXG4gICAgICAgIGF4aXM6XCJ5XCIsXHJcbiAgICAgICAgc2V0SGVpZ2h0OiA3MDBcclxuICAgIH0pO1xyXG4gICAgJChcIiN0b3BcIikuZmluZChcIi5jbS13cmFwcGVyXCIpLm1DdXN0b21TY3JvbGxiYXIoe1xyXG4gICAgICAgIGF4aXM6XCJ5XCIsXHJcbiAgICAgICAgc2V0SGVpZ2h0OiA2NDBcclxuICAgIH0pO1xyXG4gICAgLy8gJChcIiN0b3BcIikuZmluZChcIi52aWV3LXN0b3JlIC5hZGRpdGlvbmFsLWluZm9ybWF0aW9uXCIpLm1DdXN0b21TY3JvbGxiYXIoe1xyXG4gICAgLy8gICAgIGF4aXM6XCJ5XCIsXHJcbiAgICAvLyAgICAgc2V0SGVpZ2h0OiA2NVxyXG4gICAgLy8gfSk7XHJcbiAgICAkKFwiI3RvcFwiKS5maW5kKFwiLmZ1bmRzIC5mdW5kIC50aXRsZVwiKS5tQ3VzdG9tU2Nyb2xsYmFyKHtcclxuICAgICAgICBheGlzOlwieVwiLFxyXG4gICAgICAgIHNldEhlaWdodDogNDUsXHJcbiAgICAgICAgdGhlbWU6IFwiZGFya1wiXHJcbiAgICB9KTsgXHJcbiAgICAkKFwiI3RvcFwiKS5maW5kKFwiLmF1dG9jb21wbGV0ZS1zdWdnZXN0aW9uc1wiKS5tQ3VzdG9tU2Nyb2xsYmFyKHtcclxuICAgICAgICBheGlzOlwieVwiLFxyXG4gICAgICAgIHNldEhlaWdodDogMzAwXHJcbiAgICB9KTsgXHJcbiAgICAkKFwiI3RvcFwiKS5maW5kKFwiLmNvbW1lbnRzIC5jdXJyZW50LWNvbW1lbnQgLnRleHQgLmNvbW1lbnRcIikubUN1c3RvbVNjcm9sbGJhcih7XHJcbiAgICAgICAgYXhpczpcInlcIixcclxuICAgICAgICBzZXRIZWlnaHQ6IDE1MCxcclxuICAgICAgICB0aGVtZTogXCJkYXJrXCJcclxuICAgIH0pOyBcclxuICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuY2F0ZWdvcmllcyB1bDpub3QoLnN1YmNhdGVnb3JpZXMpXCIpLm1DdXN0b21TY3JvbGxiYXIoe1xyXG4gICAgICAgIGF4aXM6XCJ5XCIsXHJcbiAgICAgICAgc2V0SGVpZ2h0OiAyNTBcclxuICAgIH0pO1xyXG5cclxuICAgIC8qJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoe1xyXG4gICAgICAgIGRlbGF5OiB7XHJcbiAgICAgICAgICAgIHNob3c6IDUwMCwgaGlkZTogMjAwMFxyXG4gICAgICAgIH1cclxuICAgIH0pOyovXHJcbn0pO1xyXG5cclxuXHJcbiQoJy5zaG9ydC1kZXNjcmlwdGlvbl9faGFuZGxlLm1vcmUgYScpLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyIGRpdiA9ICQodGhpcykucGFyZW50KCk7XHJcbiAgICAkKGRpdikuc2libGluZ3MoJy5zaG9ydC1kZXNjcmlwdGlvbl9faGFuZGxlLmxlc3MnKS5zaG93KCk7XHJcbiAgICAkKGRpdikuaGlkZSgpO1xyXG4gICAgJCgnLnNob3J0LWRlc2NyaXB0aW9uX19kZXNjcmlwdGlvbicpLnRvZ2dsZUNsYXNzKCdsZXNzJyk7XHJcbn0pO1xyXG5cclxuJCgnLnNob3J0LWRlc2NyaXB0aW9uX19oYW5kbGUubGVzcyBhJykuY2xpY2soZnVuY3Rpb24oZSl7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgZGl2ID0gJCh0aGlzKS5wYXJlbnQoKTtcclxuICAgICQoZGl2KS5zaWJsaW5ncygnLnNob3J0LWRlc2NyaXB0aW9uX19oYW5kbGUubW9yZScpLnNob3coKTtcclxuICAgICQoZGl2KS5oaWRlKCk7XHJcbiAgICAkKCcuc2hvcnQtZGVzY3JpcHRpb25fX2Rlc2NyaXB0aW9uJykudG9nZ2xlQ2xhc3MoJ2xlc3MnKTtcclxufSk7XHJcblxyXG4kKCcuYWRkaXRpb25hbC1pbmZvcm1hdGlvbl9faGFuZGxlLm1vcmUgYScpLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyIGRpdiA9ICQodGhpcykucGFyZW50KCk7XHJcbiAgICAkKGRpdikuc2libGluZ3MoJy5hZGRpdGlvbmFsLWluZm9ybWF0aW9uX19oYW5kbGUubGVzcycpLnNob3coKTtcclxuICAgICQoZGl2KS5oaWRlKCk7XHJcbiAgICAkKCcuYWRkaXRpb25hbC1pbmZvcm1hdGlvbicpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XHJcbn0pO1xyXG4kKCcuYWRkaXRpb25hbC1pbmZvcm1hdGlvbl9faGFuZGxlLmxlc3MgYScpLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyIGRpdiA9ICQodGhpcykucGFyZW50KCk7XHJcbiAgICAkKGRpdikuc2libGluZ3MoJy5hZGRpdGlvbmFsLWluZm9ybWF0aW9uX19oYW5kbGUubW9yZScpLnNob3coKTtcclxuICAgICQoZGl2KS5oaWRlKCk7XHJcbiAgICAkKCcuYWRkaXRpb25hbC1pbmZvcm1hdGlvbicpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XHJcbn0pO1xyXG5cclxuJChmdW5jdGlvbigpIHtcclxuICAgIGZ1bmN0aW9uIHBhcnNlTnVtKHN0cil7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoXHJcbiAgICAgICAgICBTdHJpbmcoc3RyKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgnLCcsJy4nKVxyXG4gICAgICAgICAgICAubWF0Y2goLy0/XFxkKyg/OlxcLlxcZCspPy9nLCAnJykgfHwgMFxyXG4gICAgICAgICAgLCAxMFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgJCgnLnNob3J0LWNhbGMtY2FzaGJhY2snKS5maW5kKCdzZWxlY3QsaW5wdXQnKS5vbignY2hhbmdlIGtleXVwIGNsaWNrJyxmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJHRoaXM9JCh0aGlzKS5jbG9zZXN0KCcuc2hvcnQtY2FsYy1jYXNoYmFjaycpO1xyXG4gICAgICAgIGN1cnM9cGFyc2VOdW0oJHRoaXMuZmluZCgnc2VsZWN0JykudmFsKCkpO1xyXG4gICAgICAgIHZhbD0kdGhpcy5maW5kKCdpbnB1dCcpLnZhbCgpO1xyXG4gICAgICAgIGlmKHBhcnNlTnVtKHZhbCkhPXZhbCl7XHJcbiAgICAgICAgICAgIHZhbD0kdGhpcy5maW5kKCdpbnB1dCcpLnZhbChwYXJzZU51bSh2YWwpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFsPXBhcnNlTnVtKHZhbCk7XHJcblxyXG4gICAgICAgIGtvZWY9JHRoaXMuZmluZCgnaW5wdXQnKS5hdHRyKCdkYXRhLWNhc2hiYWNrJyk7XHJcbiAgICAgICAgcHJvbW89JHRoaXMuZmluZCgnaW5wdXQnKS5hdHRyKCdkYXRhLWNhc2hiYWNrLXByb21vJyk7XHJcblxyXG4gICAgICAgIGlmKGtvZWYuaW5kZXhPZignJScpPjApe1xyXG4gICAgICAgICAgICByZXN1bHQ9cGFyc2VOdW0oa29lZikqdmFsKmN1cnMvMTAwO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICByZXN1bHQ9cGFyc2VOdW0oa29lZilcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHBhcnNlTnVtKHByb21vKT4wKSB7XHJcbiAgICAgICAgICAgIGlmKHByb21vLmluZGV4T2YoJyUnKT4wKXtcclxuICAgICAgICAgICAgICAgIHByb21vPXBhcnNlTnVtKHByb21vKSp2YWwqY3Vycy8xMDA7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgcHJvbW89cGFyc2VOdW0ocHJvbW8pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYocHJvbW8+MCkge1xyXG4gICAgICAgICAgICAgICAgb3V0ID0gXCI8c3BhbiBjbGFzcz1vbGRfcHJpY2U+XCIgKyByZXN1bHQudG9GaXhlZCgyKSArIFwiPC9zcGFuPiBcIiArIHByb21vLnRvRml4ZWQoMilcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICBvdXQ9cmVzdWx0LnRvRml4ZWQoMilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBvdXQ9cmVzdWx0LnRvRml4ZWQoMilcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAkdGhpcy5maW5kKCcuY2FsYy1yZXN1bHRfdmFsdWUnKS5odG1sKG91dClcclxuICAgIH0pLmNsaWNrKClcclxufSk7IiwidmFyIG5vdGlmaWNhdGlvbiA9IChmdW5jdGlvbigpIHtcclxuICB2YXIgbm90aWZpY2F0aW9uX2JveCA9ZmFsc2U7XHJcbiAgdmFyIGlzX2luaXQ9ZmFsc2U7XHJcbiAgdmFyIGNvbmZpcm1fb3B0PXtcclxuICAgIHRpdGxlOlwi0KPQtNCw0LvQtdC90LjQtVwiLFxyXG4gICAgcXVlc3Rpb246XCLQktGLINC00LXQudGB0YLQstC40YLQtdC70YzQvdC+INGF0L7RgtC40YLQtSDRg9C00LDQu9C40YLRjD9cIixcclxuICAgIGJ1dHRvblllczpcItCU0LBcIixcclxuICAgIGJ1dHRvbk5vOlwi0J3QtdGCXCIsXHJcbiAgICBjYWxsYmFja1llczpmYWxzZSxcclxuICAgIGNhbGxiYWNrTm86ZmFsc2UsXHJcbiAgICBvYmo6ZmFsc2UsXHJcbiAgfTtcclxuXHJcbiAgdmFyIGFsZXJ0X29wdD17XHJcbiAgICB0aXRsZTpcIlwiLFxyXG4gICAgcXVlc3Rpb246XCLQodC+0L7QsdGJ0LXQvdC40LVcIixcclxuICAgIGJ1dHRvblllczpcItCU0LBcIixcclxuICAgIGNhbGxiYWNrWWVzOmZhbHNlLFxyXG4gICAgb2JqOmZhbHNlLFxyXG4gIH07XHJcblxyXG5cclxuICBmdW5jdGlvbiBpbml0KCl7XHJcbiAgICBpc19pbml0PXRydWU7XHJcbiAgICBub3RpZmljYXRpb25fYm94PSQoJy5ub3RpZmljYXRpb25fYm94Jyk7XHJcbiAgICBpZihub3RpZmljYXRpb25fYm94Lmxlbmd0aD4wKXJldHVybjtcclxuXHJcbiAgICAkKCdib2R5JykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nbm90aWZpY2F0aW9uX2JveCc+PC9kaXY+XCIpO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveD0kKCcubm90aWZpY2F0aW9uX2JveCcpO1xyXG5cclxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywnLm5vdGlmeV9jb250cm9sJyxjbG9zZU1vZGFsKTtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywnLm5vdGlmeV9jbG9zZScsY2xvc2VNb2RhbCk7XHJcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsY2xvc2VNb2RhbEZvbik7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjbG9zZU1vZGFsKCl7XHJcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XHJcbiAgfVxyXG4gIGZ1bmN0aW9uIGNsb3NlTW9kYWxGb24oZSl7XHJcbiAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xyXG4gICAgaWYodGFyZ2V0LmNsYXNzTmFtZT09XCJub3RpZmljYXRpb25fYm94XCIpe1xyXG4gICAgICBjbG9zZU1vZGFsKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhbGVydChkYXRhKXtcclxuICAgIGlmKCFkYXRhKWRhdGE9e307XHJcbiAgICBkYXRhPW9iamVjdHMoYWxlcnRfb3B0LGRhdGEpO1xyXG5cclxuICAgIGlmKCFpc19pbml0KWluaXQoKTtcclxuXHJcbiAgICBub3R5ZnlfY2xhc3M9J25vdGlmeV9ib3ggJztcclxuICAgIGlmKGRhdGEubm90eWZ5X2NsYXNzKW5vdHlmeV9jbGFzcys9ZGF0YS5ub3R5ZnlfY2xhc3M7XHJcblxyXG4gICAgYm94X2h0bWw9JzxkaXYgY2xhc3M9XCInK25vdHlmeV9jbGFzcysnXCI+JztcclxuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV90aXRsZVwiPic7XHJcbiAgICBib3hfaHRtbCs9ZGF0YS50aXRsZTtcclxuICAgIGJveF9odG1sKz0nPHNwYW4gY2xhc3M9XCJub3RpZnlfY2xvc2VcIj48L3NwYW4+JztcclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuXHJcbiAgICBib3hfaHRtbCs9JzxkaXYgY2xhc3M9XCJub3RpZnlfY29udGVudFwiPic7XHJcbiAgICBib3hfaHRtbCs9ZGF0YS5xdWVzdGlvbjtcclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuXHJcbiAgICBpZihkYXRhLmJ1dHRvblllc3x8ZGF0YS5idXR0b25Obykge1xyXG4gICAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250cm9sXCI+JztcclxuICAgICAgaWYgKGRhdGEuYnV0dG9uWWVzKWJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2J0bl95ZXNcIj4nICsgZGF0YS5idXR0b25ZZXMgKyAnPC9kaXY+JztcclxuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX25vXCI+JyArIGRhdGEuYnV0dG9uTm8gKyAnPC9kaXY+JztcclxuICAgICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcbiAgICB9O1xyXG5cclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XHJcblxyXG5cclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICQoJ2JvZHknKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcclxuICAgIH0sMTAwKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29uZmlybShkYXRhKXtcclxuICAgIGlmKCFkYXRhKWRhdGE9e307XHJcbiAgICBkYXRhPW9iamVjdHMoY29uZmlybV9vcHQsZGF0YSk7XHJcblxyXG4gICAgaWYoIWlzX2luaXQpaW5pdCgpO1xyXG5cclxuICAgIGJveF9odG1sPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveFwiPic7XHJcbiAgICBib3hfaHRtbCs9JzxkaXYgY2xhc3M9XCJub3RpZnlfdGl0bGVcIj4nO1xyXG4gICAgYm94X2h0bWwrPWRhdGEudGl0bGU7XHJcbiAgICBib3hfaHRtbCs9JzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XHJcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XHJcblxyXG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRlbnRcIj4nO1xyXG4gICAgYm94X2h0bWwrPWRhdGEucXVlc3Rpb247XHJcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XHJcblxyXG4gICAgaWYoZGF0YS5idXR0b25ZZXN8fGRhdGEuYnV0dG9uTm8pIHtcclxuICAgICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udHJvbFwiPic7XHJcbiAgICAgIGlmIChkYXRhLmJ1dHRvblllcylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5feWVzXCI+JyArIGRhdGEuYnV0dG9uWWVzICsgJzwvZGl2Pic7XHJcbiAgICAgIGlmIChkYXRhLmJ1dHRvbk5vKWJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2J0bl9ub1wiPicgKyBkYXRhLmJ1dHRvbk5vICsgJzwvZGl2Pic7XHJcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG4gICAgfVxyXG5cclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XHJcblxyXG4gICAgaWYoZGF0YS5jYWxsYmFja1llcyE9ZmFsc2Upe1xyXG4gICAgICBub3RpZmljYXRpb25fYm94LmZpbmQoJy5ub3RpZnlfYnRuX3llcycpLm9uKCdjbGljaycsZGF0YS5jYWxsYmFja1llcy5iaW5kKGRhdGEub2JqKSk7XHJcbiAgICB9XHJcbiAgICBpZihkYXRhLmNhbGxiYWNrTm8hPWZhbHNlKXtcclxuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl9ubycpLm9uKCdjbGljaycsZGF0YS5jYWxsYmFja05vLmJpbmQoZGF0YS5vYmopKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XHJcbiAgICB9LDEwMClcclxuXHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgYWxlcnQ6IGFsZXJ0LFxyXG4gICAgY29uZmlybTogY29uZmlybVxyXG4gIH07XHJcblxyXG59KSgpO1xyXG5cclxuXHJcbiQoJ1tyZWY9cG9wdXBdJykub24oJ2NsaWNrJyxmdW5jdGlvbiAoZSl7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICR0aGlzPSQodGhpcylcclxuICBlbD0kKCR0aGlzLmF0dHIoJ2hyZWYnKSk7XHJcbiAgZGF0YT1lbC5kYXRhKCk7XHJcblxyXG4gIGRhdGEucXVlc3Rpb249ZWwuaHRtbCgpO1xyXG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxufSk7XHJcbiIsIiQod2luZG93KS5sb2FkKGZ1bmN0aW9uKCkge1xyXG5cclxuICAkKCcuYWNjb3JkaW9uIC5hY2NvcmRpb24tY29udHJvbCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICAkYWNjb3JkaW9uID0gJHRoaXMuY2xvc2VzdCgnLmFjY29yZGlvbicpO1xyXG5cclxuICAgIGlmICgkYWNjb3JkaW9uLmhhc0NsYXNzKCdvcGVuJykpIHtcclxuICAgICAgJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5oaWRlKDMwMCk7XHJcbiAgICAgICRhY2NvcmRpb24ucmVtb3ZlQ2xhc3MoJ29wZW4nKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5zaG93KDMwMCk7XHJcbiAgICAgICRhY2NvcmRpb24uYWRkQ2xhc3MoJ29wZW4nKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH0pO1xyXG59KVxyXG5cclxub2JqZWN0cyA9IGZ1bmN0aW9uIChhLGIpIHtcclxuICB2YXIgYyA9IGIsXHJcbiAgICBrZXk7XHJcbiAgZm9yIChrZXkgaW4gYSkge1xyXG4gICAgaWYgKGEuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICBjW2tleV0gPSBrZXkgaW4gYiA/IGJba2V5XSA6IGFba2V5XTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGM7XHJcbn07XHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCl7XHJcbiAgICBkYXRhPXRoaXM7XHJcbiAgICBkYXRhLmltZy5hdHRyKCdzcmMnLGRhdGEuc3JjKTtcclxuICB9XHJcblxyXG4gIGltZ3M9JCgnc2VjdGlvbjpub3QoLm5hdmlnYXRpb24pJykuZmluZCgnLmxvZ28gaW1nJyk7XHJcbiAgZm9yICh2YXIgaT0wO2k8aW1ncy5sZW5ndGg7aSsrKXtcclxuICAgIGltZz1pbWdzLmVxKGkpO1xyXG4gICAgc3JjPWltZy5hdHRyKCdzcmMnKTtcclxuICAgIGltZy5hdHRyKCdzcmMnLCcvaW1hZ2VzL3RlbXBsYXRlLWxvZ28uanBnJyk7XHJcbiAgICBkYXRhPXtcclxuICAgICAgc3JjOnNyYyxcclxuICAgICAgaW1nOmltZ1xyXG4gICAgfTtcclxuICAgIGltYWdlPSQoJzxpbWcvPicse1xyXG4gICAgICBzcmM6c3JjXHJcbiAgICB9KS5vbignbG9hZCcsaW1nX2xvYWRfZmluaXNoLmJpbmQoZGF0YSkpXHJcbiAgfVxyXG59KSgpOyIsImZ1bmN0aW9uIGFqYXhGb3JtKGVscykge1xyXG4gIHZhciBmaWxlQXBpID0gd2luZG93LkZpbGUgJiYgd2luZG93LkZpbGVSZWFkZXIgJiYgd2luZG93LkZpbGVMaXN0ICYmIHdpbmRvdy5CbG9iID8gdHJ1ZSA6IGZhbHNlO1xyXG4gIHZhciBkZWZhdWx0cyA9IHtcclxuICAgIGVycm9yX2NsYXNzOiAnLmhhcy1lcnJvcicsXHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gb25TdWJtaXQoZSl7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgZGF0YT10aGlzO1xyXG4gICAgZm9ybT1kYXRhLmZvcm07XHJcblxyXG4gICAgZm9ybS55aWlBY3RpdmVGb3JtKCd2YWxpZGF0ZScpO1xyXG4gICAgaXNWYWxpZD0oZm9ybS5maW5kKGRhdGEucGFyYW0uZXJyb3JfY2xhc3MpLmxlbmd0aD09MClcclxuXHJcbiAgICBpZighaXNWYWxpZCl7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1lbHNle1xyXG4gICAgICByZXF1aXJlZD1mb3JtLmZpbmQoJ2lucHV0LnJlcXVpcmVkJyk7XHJcbiAgICAgIGZvcihpPTA7aTxyZXF1aXJlZC5sZW5ndGg7aSsrKXtcclxuICAgICAgICBpZihyZXF1aXJlZC5lcShpKS52YWwoKS5sZW5ndGg8MSl7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZighZm9ybS5zZXJpYWxpemVPYmplY3QpYWRkU1JPKCk7XHJcblxyXG4gICAgcG9zdD1mb3JtLnNlcmlhbGl6ZU9iamVjdCgpO1xyXG4gICAgJCgnLm5vdGlmeV9ib3gnKS5hZGRDbGFzcygnbG9hZGluZycpO1xyXG4gICAgJCgnLm5vdGlmeV9ib3ggLm5vdGlmeV9jb250ZW50JykuaHRtbCgnJyk7XHJcblxyXG4gICAgJC5wb3N0KGRhdGEudXJsLHBvc3QsZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgIGlmKGRhdGEucmVuZGVyKXtcclxuICAgICAgICBkYXRhLm5vdHlmeV9jbGFzcz1cIm5vdGlmeV93aGl0ZVwiO1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxuICAgICAgfWVsc2V7XHJcbiAgICAgICAgJCgnLm5vdGlmeV9ib3gnKS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xyXG4gICAgICAgICQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpLmh0bWwoZGF0YS5odG1sKTtcclxuICAgICAgICBhamF4Rm9ybSgkKCcubm90aWZ5X2JveCAuYWpheF9mb3JtJykpO1xyXG4gICAgICB9XHJcbiAgICB9LCdqc29uJyk7XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgZWxzLmZpbmQoJ1tyZXF1aXJlZF0nKVxyXG4gICAgLmFkZENsYXNzKCdyZXF1aXJlZCcpXHJcbiAgICAucmVtb3ZlQXR0cigncmVxdWlyZWQnKTtcclxuXHJcbiAgZm9yKHZhciBpPTA7aTxlbHMubGVuZ3RoO2krKyl7XHJcbiAgICBmb3JtPWVscy5lcShpKTtcclxuICAgIGRhdGE9e1xyXG4gICAgICBmb3JtOmZvcm0sXHJcbiAgICAgIHBhcmFtOmRlZmF1bHRzXHJcbiAgICB9O1xyXG4gICAgZGF0YS51cmw9Zm9ybS5hdHRyKCdhY3Rpb24nKSB8fCBsb2NhdGlvbi5ocmVmO1xyXG4gICAgZGF0YS5tZXRob2Q9IGZvcm0uYXR0cignbWV0aG9kJykgfHwgJ3Bvc3QnO1xyXG4gICAgZm9ybS5vbignc3VibWl0Jywgb25TdWJtaXQuYmluZChkYXRhKSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBhZGRTUk8oKXtcclxuICAkLmZuLnNlcmlhbGl6ZU9iamVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBvID0ge307XHJcbiAgICB2YXIgYSA9IHRoaXMuc2VyaWFsaXplQXJyYXkoKTtcclxuICAgICQuZWFjaChhLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGlmIChvW3RoaXMubmFtZV0pIHtcclxuICAgICAgICBpZiAoIW9bdGhpcy5uYW1lXS5wdXNoKSB7XHJcbiAgICAgICAgICBvW3RoaXMubmFtZV0gPSBbb1t0aGlzLm5hbWVdXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgb1t0aGlzLm5hbWVdLnB1c2godGhpcy52YWx1ZSB8fCAnJyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgb1t0aGlzLm5hbWVdID0gdGhpcy52YWx1ZSB8fCAnJztcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbztcclxuICB9O1xyXG59O1xyXG5hZGRTUk8oKTsiLCIkKCdib2R5Jykub24oJ2NsaWNrJywnYVtocmVmPSNsb2dpbl0sYVtocmVmPSNyZWdpc3RyYXRpb25dLCNwYXNzd29yZC1yZWNvdmVyeScsZnVuY3Rpb24oZSl7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIGhyZWY9dGhpcy5ocmVmLnNwbGl0KCcjJyk7XHJcbiAgaHJlZj1ocmVmW2hyZWYubGVuZ3RoLTFdO1xyXG5cclxuICBkYXRhPXtcclxuICAgIGJ1dHRvblllczpmYWxzZSxcclxuICAgIG5vdHlmeV9jbGFzczpcIm5vdGlmeV93aGl0ZSBsb2FkaW5nXCIsXHJcbiAgICBxdWVzdGlvbjonJ1xyXG4gIH07XHJcbiAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xyXG4gICQuZ2V0KCcvJytocmVmLGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgJCgnLm5vdGlmeV9ib3gnKS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xyXG4gICAgJCgnLm5vdGlmeV9ib3ggLm5vdGlmeV9jb250ZW50JykuaHRtbChkYXRhLmh0bWwpO1xyXG4gICAgYWpheEZvcm0oJCgnLm5vdGlmeV9ib3ggLmFqYXhfZm9ybScpKTtcclxuICB9LCdqc29uJylcclxufSk7XHJcblxyXG5hamF4Rm9ybSgkKCcuYWpheF9mb3JtJykpOyJdfQ==
