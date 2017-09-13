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

//$(window).load(function() {

var accordionControl = $('.accordion .accordion-control');

accordionControl.on('click', function (e) {
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
accordionControl.show();
//})

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
    var content = this.ele.parentElement.parentElement.parentElement.cloneNode(true);
    content.className += ' modal-popup';
    var div = document.createElement('div');
    div.className = 'comments';
    div.append(content);
    $(div).find('.current-comment__more').remove();
    $(div).find('.comment.list').removeClass('list');
    return div;
  }
  ,
  width: function () {
    var comments = $('.current-comment');
    if (comments.length>1) {
      return comments[0].offsetWidth * 0.9;
    }
    return 500;
  }
});
//пройти по комментам, ограничить длину текста, вставить ссылку "показать полностью"
$('.current-comment').each(function(index, element) {
  var text = $(element).find('.text');
  var comment = $(text).find('.comment');
  if (comment[0].innerHTML.length > 210) {
    var a = document.createElement('a'),
        p = document.createElement('p');
    a.className = 'current-comment__more';
    a.setAttribute('href', '#comment-popup');
    a.innerHTML = 'Показать полностью';
    p.append(a);
    text.append(p);
  }
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJldGluYS5qcyIsImpxdWVyeS5mYW5jeWJveC5wYWNrLmpzIiwiYm9vdHN0cmFwLm1pbi5qcyIsInNjcmlwdHMuanMiLCJqcXVlcnkuZmxleHNsaWRlci1taW4uanMiLCJjbGFzc2llLmpzIiwianF1ZXJ5LnBvcHVwLm1pbi5qcyIsImFuaW1vLmpzIiwianF1ZXJ5LndheXBvaW50cy5taW4uanMiLCJqcXVlcnkucGx1Z2luLm1pbi5qcyIsImpxdWVyeS5jb3VudGRvd24ubWluLmpzIiwianF1ZXJ5Lm5vdHkucGFja2FnZWQubWluLmpzIiwianF1ZXJ5Lm1vY2tqYXguanMiLCJqcXVlcnkuYXV0b2NvbXBsZXRlLmpzIiwibWFpbi5qcyIsIm5vdGlmaWNhdGlvbi5qcyIsImZvcl9hbGwuanMiLCJqcXVlcnkuYWpheEZvcm0uanMiLCJteS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUFDQTtBQUNBO0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTEE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMTlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3eEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyohXHJcbiAqIFJldGluYS5qcyB2MS4zLjBcclxuICpcclxuICogQ29weXJpZ2h0IDIwMTQgSW11bHVzLCBMTENcclxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXHJcbiAqXHJcbiAqIFJldGluYS5qcyBpcyBhbiBvcGVuIHNvdXJjZSBzY3JpcHQgdGhhdCBtYWtlcyBpdCBlYXN5IHRvIHNlcnZlXHJcbiAqIGhpZ2gtcmVzb2x1dGlvbiBpbWFnZXMgdG8gZGV2aWNlcyB3aXRoIHJldGluYSBkaXNwbGF5cy5cclxuICovXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcm9vdCA9ICh0eXBlb2YgZXhwb3J0cyA9PT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiBleHBvcnRzKTtcclxuICAgIHZhciBjb25maWcgPSB7XHJcbiAgICAgICAgLy8gQW4gb3B0aW9uIHRvIGNob29zZSBhIHN1ZmZpeCBmb3IgMnggaW1hZ2VzXHJcbiAgICAgICAgcmV0aW5hSW1hZ2VTdWZmaXggOiAnQDJ4JyxcclxuXHJcbiAgICAgICAgLy8gRW5zdXJlIENvbnRlbnQtVHlwZSBpcyBhbiBpbWFnZSBiZWZvcmUgdHJ5aW5nIHRvIGxvYWQgQDJ4IGltYWdlXHJcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2ltdWx1cy9yZXRpbmFqcy9wdWxsLzQ1KVxyXG4gICAgICAgIGNoZWNrX21pbWVfdHlwZTogdHJ1ZSxcclxuXHJcbiAgICAgICAgLy8gUmVzaXplIGhpZ2gtcmVzb2x1dGlvbiBpbWFnZXMgdG8gb3JpZ2luYWwgaW1hZ2UncyBwaXhlbCBkaW1lbnNpb25zXHJcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2ltdWx1cy9yZXRpbmFqcy9pc3N1ZXMvOFxyXG4gICAgICAgIGZvcmNlX29yaWdpbmFsX2RpbWVuc2lvbnM6IHRydWVcclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gUmV0aW5hKCkge31cclxuXHJcbiAgICByb290LlJldGluYSA9IFJldGluYTtcclxuXHJcbiAgICBSZXRpbmEuY29uZmlndXJlID0gZnVuY3Rpb24ob3B0aW9ucykge1xyXG4gICAgICAgIGlmIChvcHRpb25zID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7fTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAodmFyIHByb3AgaW4gb3B0aW9ucykge1xyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xyXG4gICAgICAgICAgICAgICAgY29uZmlnW3Byb3BdID0gb3B0aW9uc1twcm9wXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgUmV0aW5hLmluaXQgPSBmdW5jdGlvbihjb250ZXh0KSB7XHJcbiAgICAgICAgaWYgKGNvbnRleHQgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgY29udGV4dCA9IHJvb3Q7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgZXhpc3Rpbmdfb25sb2FkID0gY29udGV4dC5vbmxvYWQgfHwgZnVuY3Rpb24oKXt9O1xyXG5cclxuICAgICAgICBjb250ZXh0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgaW1hZ2VzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2ltZycpLCByZXRpbmFJbWFnZXMgPSBbXSwgaSwgaW1hZ2U7XHJcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBpbWFnZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgIGltYWdlID0gaW1hZ2VzW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKCEhIWltYWdlLmdldEF0dHJpYnV0ZU5vZGUoJ2RhdGEtbm8tcmV0aW5hJykpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXRpbmFJbWFnZXMucHVzaChuZXcgUmV0aW5hSW1hZ2UoaW1hZ2UpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBleGlzdGluZ19vbmxvYWQoKTtcclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuXHJcbiAgICBSZXRpbmEuaXNSZXRpbmEgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciBtZWRpYVF1ZXJ5ID0gJygtd2Via2l0LW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDEuNSksIChtaW4tLW1vei1kZXZpY2UtcGl4ZWwtcmF0aW86IDEuNSksICgtby1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAzLzIpLCAobWluLXJlc29sdXRpb246IDEuNWRwcHgpJztcclxuXHJcbiAgICAgICAgaWYgKHJvb3QuZGV2aWNlUGl4ZWxSYXRpbyA+IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocm9vdC5tYXRjaE1lZGlhICYmIHJvb3QubWF0Y2hNZWRpYShtZWRpYVF1ZXJ5KS5tYXRjaGVzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgdmFyIHJlZ2V4TWF0Y2ggPSAvXFwuXFx3KyQvO1xyXG4gICAgZnVuY3Rpb24gc3VmZml4UmVwbGFjZSAobWF0Y2gpIHtcclxuICAgICAgICByZXR1cm4gY29uZmlnLnJldGluYUltYWdlU3VmZml4ICsgbWF0Y2g7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gUmV0aW5hSW1hZ2VQYXRoKHBhdGgsIGF0XzJ4X3BhdGgpIHtcclxuICAgICAgICB0aGlzLnBhdGggPSBwYXRoIHx8ICcnO1xyXG4gICAgICAgIGlmICh0eXBlb2YgYXRfMnhfcGF0aCAhPT0gJ3VuZGVmaW5lZCcgJiYgYXRfMnhfcGF0aCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLmF0XzJ4X3BhdGggPSBhdF8yeF9wYXRoO1xyXG4gICAgICAgICAgICB0aGlzLnBlcmZvcm1fY2hlY2sgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodW5kZWZpbmVkICE9PSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbG9jYXRpb25PYmplY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbk9iamVjdC5ocmVmID0gdGhpcy5wYXRoO1xyXG4gICAgICAgICAgICAgICAgbG9jYXRpb25PYmplY3QucGF0aG5hbWUgPSBsb2NhdGlvbk9iamVjdC5wYXRobmFtZS5yZXBsYWNlKHJlZ2V4TWF0Y2gsIHN1ZmZpeFJlcGxhY2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hdF8yeF9wYXRoID0gbG9jYXRpb25PYmplY3QuaHJlZjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHZhciBwYXJ0cyA9IHRoaXMucGF0aC5zcGxpdCgnPycpO1xyXG4gICAgICAgICAgICAgICAgcGFydHNbMF0gPSBwYXJ0c1swXS5yZXBsYWNlKHJlZ2V4TWF0Y2gsIHN1ZmZpeFJlcGxhY2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hdF8yeF9wYXRoID0gcGFydHMuam9pbignPycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucGVyZm9ybV9jaGVjayA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJvb3QuUmV0aW5hSW1hZ2VQYXRoID0gUmV0aW5hSW1hZ2VQYXRoO1xyXG5cclxuICAgIFJldGluYUltYWdlUGF0aC5jb25maXJtZWRfcGF0aHMgPSBbXTtcclxuXHJcbiAgICBSZXRpbmFJbWFnZVBhdGgucHJvdG90eXBlLmlzX2V4dGVybmFsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuICEhKHRoaXMucGF0aC5tYXRjaCgvXmh0dHBzP1xcOi9pKSAmJiAhdGhpcy5wYXRoLm1hdGNoKCcvLycgKyBkb2N1bWVudC5kb21haW4pICk7XHJcbiAgICB9O1xyXG5cclxuICAgIFJldGluYUltYWdlUGF0aC5wcm90b3R5cGUuY2hlY2tfMnhfdmFyaWFudCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIGh0dHAsIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIGlmICh0aGlzLmlzX2V4dGVybmFsKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGZhbHNlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnBlcmZvcm1fY2hlY2sgJiYgdHlwZW9mIHRoaXMuYXRfMnhfcGF0aCAhPT0gJ3VuZGVmaW5lZCcgJiYgdGhpcy5hdF8yeF9wYXRoICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayh0cnVlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYXRfMnhfcGF0aCBpbiBSZXRpbmFJbWFnZVBhdGguY29uZmlybWVkX3BhdGhzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayh0cnVlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgIGh0dHAub3BlbignSEVBRCcsIHRoaXMuYXRfMnhfcGF0aCk7XHJcbiAgICAgICAgICAgIGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaHR0cC5yZWFkeVN0YXRlICE9PSA0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaHR0cC5zdGF0dXMgPj0gMjAwICYmIGh0dHAuc3RhdHVzIDw9IDM5OSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25maWcuY2hlY2tfbWltZV90eXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0eXBlID0gaHR0cC5nZXRSZXNwb25zZUhlYWRlcignQ29udGVudC1UeXBlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSBudWxsIHx8ICF0eXBlLm1hdGNoKC9eaW1hZ2UvaSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIFJldGluYUltYWdlUGF0aC5jb25maXJtZWRfcGF0aHMucHVzaCh0aGF0LmF0XzJ4X3BhdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayh0cnVlKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaHR0cC5zZW5kKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcblxyXG4gICAgZnVuY3Rpb24gUmV0aW5hSW1hZ2UoZWwpIHtcclxuICAgICAgICB0aGlzLmVsID0gZWw7XHJcbiAgICAgICAgdGhpcy5wYXRoID0gbmV3IFJldGluYUltYWdlUGF0aCh0aGlzLmVsLmdldEF0dHJpYnV0ZSgnc3JjJyksIHRoaXMuZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWF0MngnKSk7XHJcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMucGF0aC5jaGVja18yeF92YXJpYW50KGZ1bmN0aW9uKGhhc1ZhcmlhbnQpIHtcclxuICAgICAgICAgICAgaWYgKGhhc1ZhcmlhbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuc3dhcCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcm9vdC5SZXRpbmFJbWFnZSA9IFJldGluYUltYWdlO1xyXG5cclxuICAgIFJldGluYUltYWdlLnByb3RvdHlwZS5zd2FwID0gZnVuY3Rpb24ocGF0aCkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgcGF0aCA9IHRoaXMucGF0aC5hdF8yeF9wYXRoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIGZ1bmN0aW9uIGxvYWQoKSB7XHJcbiAgICAgICAgICAgIGlmICghIHRoYXQuZWwuY29tcGxldGUpIHtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQobG9hZCwgNSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY29uZmlnLmZvcmNlX29yaWdpbmFsX2RpbWVuc2lvbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmVsLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCB0aGF0LmVsLm9mZnNldFdpZHRoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmVsLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgdGhhdC5lbC5vZmZzZXRIZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoYXQuZWwuc2V0QXR0cmlidXRlKCdzcmMnLCBwYXRoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBsb2FkKCk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICBpZiAoUmV0aW5hLmlzUmV0aW5hKCkpIHtcclxuICAgICAgICBSZXRpbmEuaW5pdChyb290KTtcclxuICAgIH1cclxufSkoKTtcclxuIiwiLyohIGZhbmN5Qm94IHYyLjEuNSBmYW5jeWFwcHMuY29tIHwgZmFuY3lhcHBzLmNvbS9mYW5jeWJveC8jbGljZW5zZSAqL1xyXG4oZnVuY3Rpb24ocixHLGYsdil7dmFyIEo9ZihcImh0bWxcIiksbj1mKHIpLHA9ZihHKSxiPWYuZmFuY3lib3g9ZnVuY3Rpb24oKXtiLm9wZW4uYXBwbHkodGhpcyxhcmd1bWVudHMpfSxJPW5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL21zaWUvaSksQj1udWxsLHM9Ry5jcmVhdGVUb3VjaCE9PXYsdD1mdW5jdGlvbihhKXtyZXR1cm4gYSYmYS5oYXNPd25Qcm9wZXJ0eSYmYSBpbnN0YW5jZW9mIGZ9LHE9ZnVuY3Rpb24oYSl7cmV0dXJuIGEmJlwic3RyaW5nXCI9PT1mLnR5cGUoYSl9LEU9ZnVuY3Rpb24oYSl7cmV0dXJuIHEoYSkmJjA8YS5pbmRleE9mKFwiJVwiKX0sbD1mdW5jdGlvbihhLGQpe3ZhciBlPXBhcnNlSW50KGEsMTApfHwwO2QmJkUoYSkmJihlKj1iLmdldFZpZXdwb3J0KClbZF0vMTAwKTtyZXR1cm4gTWF0aC5jZWlsKGUpfSx3PWZ1bmN0aW9uKGEsYil7cmV0dXJuIGwoYSxiKStcInB4XCJ9O2YuZXh0ZW5kKGIse3ZlcnNpb246XCIyLjEuNVwiLGRlZmF1bHRzOntwYWRkaW5nOjE1LG1hcmdpbjoyMCxcclxud2lkdGg6ODAwLGhlaWdodDo2MDAsbWluV2lkdGg6MTAwLG1pbkhlaWdodDoxMDAsbWF4V2lkdGg6OTk5OSxtYXhIZWlnaHQ6OTk5OSxwaXhlbFJhdGlvOjEsYXV0b1NpemU6ITAsYXV0b0hlaWdodDohMSxhdXRvV2lkdGg6ITEsYXV0b1Jlc2l6ZTohMCxhdXRvQ2VudGVyOiFzLGZpdFRvVmlldzohMCxhc3BlY3RSYXRpbzohMSx0b3BSYXRpbzowLjUsbGVmdFJhdGlvOjAuNSxzY3JvbGxpbmc6XCJhdXRvXCIsd3JhcENTUzpcIlwiLGFycm93czohMCxjbG9zZUJ0bjohMCxjbG9zZUNsaWNrOiExLG5leHRDbGljazohMSxtb3VzZVdoZWVsOiEwLGF1dG9QbGF5OiExLHBsYXlTcGVlZDozRTMscHJlbG9hZDozLG1vZGFsOiExLGxvb3A6ITAsYWpheDp7ZGF0YVR5cGU6XCJodG1sXCIsaGVhZGVyczp7XCJYLWZhbmN5Qm94XCI6ITB9fSxpZnJhbWU6e3Njcm9sbGluZzpcImF1dG9cIixwcmVsb2FkOiEwfSxzd2Y6e3dtb2RlOlwidHJhbnNwYXJlbnRcIixhbGxvd2Z1bGxzY3JlZW46XCJ0cnVlXCIsYWxsb3dzY3JpcHRhY2Nlc3M6XCJhbHdheXNcIn0sXHJcbmtleXM6e25leHQ6ezEzOlwibGVmdFwiLDM0OlwidXBcIiwzOTpcImxlZnRcIiw0MDpcInVwXCJ9LHByZXY6ezg6XCJyaWdodFwiLDMzOlwiZG93blwiLDM3OlwicmlnaHRcIiwzODpcImRvd25cIn0sY2xvc2U6WzI3XSxwbGF5OlszMl0sdG9nZ2xlOls3MF19LGRpcmVjdGlvbjp7bmV4dDpcImxlZnRcIixwcmV2OlwicmlnaHRcIn0sc2Nyb2xsT3V0c2lkZTohMCxpbmRleDowLHR5cGU6bnVsbCxocmVmOm51bGwsY29udGVudDpudWxsLHRpdGxlOm51bGwsdHBsOnt3cmFwOic8ZGl2IGNsYXNzPVwiZmFuY3lib3gtd3JhcFwiIHRhYkluZGV4PVwiLTFcIj48ZGl2IGNsYXNzPVwiZmFuY3lib3gtc2tpblwiPjxkaXYgY2xhc3M9XCJmYW5jeWJveC1vdXRlclwiPjxkaXYgY2xhc3M9XCJmYW5jeWJveC1pbm5lclwiPjwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2PicsaW1hZ2U6JzxpbWcgY2xhc3M9XCJmYW5jeWJveC1pbWFnZVwiIHNyYz1cIntocmVmfVwiIGFsdD1cIlwiIC8+JyxpZnJhbWU6JzxpZnJhbWUgaWQ9XCJmYW5jeWJveC1mcmFtZXtybmR9XCIgbmFtZT1cImZhbmN5Ym94LWZyYW1le3JuZH1cIiBjbGFzcz1cImZhbmN5Ym94LWlmcmFtZVwiIGZyYW1lYm9yZGVyPVwiMFwiIHZzcGFjZT1cIjBcIiBoc3BhY2U9XCIwXCIgd2Via2l0QWxsb3dGdWxsU2NyZWVuIG1vemFsbG93ZnVsbHNjcmVlbiBhbGxvd0Z1bGxTY3JlZW4nK1xyXG4oST8nIGFsbG93dHJhbnNwYXJlbmN5PVwidHJ1ZVwiJzpcIlwiKStcIj48L2lmcmFtZT5cIixlcnJvcjonPHAgY2xhc3M9XCJmYW5jeWJveC1lcnJvclwiPlRoZSByZXF1ZXN0ZWQgY29udGVudCBjYW5ub3QgYmUgbG9hZGVkLjxici8+UGxlYXNlIHRyeSBhZ2FpbiBsYXRlci48L3A+JyxjbG9zZUJ0bjonPGEgdGl0bGU9XCJDbG9zZVwiIGNsYXNzPVwiZmFuY3lib3gtaXRlbSBmYW5jeWJveC1jbG9zZVwiIGhyZWY9XCJqYXZhc2NyaXB0OjtcIj48L2E+JyxuZXh0Oic8YSB0aXRsZT1cIk5leHRcIiBjbGFzcz1cImZhbmN5Ym94LW5hdiBmYW5jeWJveC1uZXh0XCIgaHJlZj1cImphdmFzY3JpcHQ6O1wiPjxzcGFuPjwvc3Bhbj48L2E+JyxwcmV2Oic8YSB0aXRsZT1cIlByZXZpb3VzXCIgY2xhc3M9XCJmYW5jeWJveC1uYXYgZmFuY3lib3gtcHJldlwiIGhyZWY9XCJqYXZhc2NyaXB0OjtcIj48c3Bhbj48L3NwYW4+PC9hPid9LG9wZW5FZmZlY3Q6XCJmYWRlXCIsb3BlblNwZWVkOjI1MCxvcGVuRWFzaW5nOlwic3dpbmdcIixvcGVuT3BhY2l0eTohMCxcclxub3Blbk1ldGhvZDpcInpvb21JblwiLGNsb3NlRWZmZWN0OlwiZmFkZVwiLGNsb3NlU3BlZWQ6MjUwLGNsb3NlRWFzaW5nOlwic3dpbmdcIixjbG9zZU9wYWNpdHk6ITAsY2xvc2VNZXRob2Q6XCJ6b29tT3V0XCIsbmV4dEVmZmVjdDpcImVsYXN0aWNcIixuZXh0U3BlZWQ6MjUwLG5leHRFYXNpbmc6XCJzd2luZ1wiLG5leHRNZXRob2Q6XCJjaGFuZ2VJblwiLHByZXZFZmZlY3Q6XCJlbGFzdGljXCIscHJldlNwZWVkOjI1MCxwcmV2RWFzaW5nOlwic3dpbmdcIixwcmV2TWV0aG9kOlwiY2hhbmdlT3V0XCIsaGVscGVyczp7b3ZlcmxheTohMCx0aXRsZTohMH0sb25DYW5jZWw6Zi5ub29wLGJlZm9yZUxvYWQ6Zi5ub29wLGFmdGVyTG9hZDpmLm5vb3AsYmVmb3JlU2hvdzpmLm5vb3AsYWZ0ZXJTaG93OmYubm9vcCxiZWZvcmVDaGFuZ2U6Zi5ub29wLGJlZm9yZUNsb3NlOmYubm9vcCxhZnRlckNsb3NlOmYubm9vcH0sZ3JvdXA6e30sb3B0czp7fSxwcmV2aW91czpudWxsLGNvbWluZzpudWxsLGN1cnJlbnQ6bnVsbCxpc0FjdGl2ZTohMSxcclxuaXNPcGVuOiExLGlzT3BlbmVkOiExLHdyYXA6bnVsbCxza2luOm51bGwsb3V0ZXI6bnVsbCxpbm5lcjpudWxsLHBsYXllcjp7dGltZXI6bnVsbCxpc0FjdGl2ZTohMX0sYWpheExvYWQ6bnVsbCxpbWdQcmVsb2FkOm51bGwsdHJhbnNpdGlvbnM6e30saGVscGVyczp7fSxvcGVuOmZ1bmN0aW9uKGEsZCl7aWYoYSYmKGYuaXNQbGFpbk9iamVjdChkKXx8KGQ9e30pLCExIT09Yi5jbG9zZSghMCkpKXJldHVybiBmLmlzQXJyYXkoYSl8fChhPXQoYSk/ZihhKS5nZXQoKTpbYV0pLGYuZWFjaChhLGZ1bmN0aW9uKGUsYyl7dmFyIGs9e30sZyxoLGosbSxsO1wib2JqZWN0XCI9PT1mLnR5cGUoYykmJihjLm5vZGVUeXBlJiYoYz1mKGMpKSx0KGMpPyhrPXtocmVmOmMuZGF0YShcImZhbmN5Ym94LWhyZWZcIil8fGMuYXR0cihcImhyZWZcIiksdGl0bGU6Yy5kYXRhKFwiZmFuY3lib3gtdGl0bGVcIil8fGMuYXR0cihcInRpdGxlXCIpLGlzRG9tOiEwLGVsZW1lbnQ6Y30sZi5tZXRhZGF0YSYmZi5leHRlbmQoITAsayxcclxuYy5tZXRhZGF0YSgpKSk6az1jKTtnPWQuaHJlZnx8ay5ocmVmfHwocShjKT9jOm51bGwpO2g9ZC50aXRsZSE9PXY/ZC50aXRsZTprLnRpdGxlfHxcIlwiO209KGo9ZC5jb250ZW50fHxrLmNvbnRlbnQpP1wiaHRtbFwiOmQudHlwZXx8ay50eXBlOyFtJiZrLmlzRG9tJiYobT1jLmRhdGEoXCJmYW5jeWJveC10eXBlXCIpLG18fChtPShtPWMucHJvcChcImNsYXNzXCIpLm1hdGNoKC9mYW5jeWJveFxcLihcXHcrKS8pKT9tWzFdOm51bGwpKTtxKGcpJiYobXx8KGIuaXNJbWFnZShnKT9tPVwiaW1hZ2VcIjpiLmlzU1dGKGcpP209XCJzd2ZcIjpcIiNcIj09PWcuY2hhckF0KDApP209XCJpbmxpbmVcIjpxKGMpJiYobT1cImh0bWxcIixqPWMpKSxcImFqYXhcIj09PW0mJihsPWcuc3BsaXQoL1xccysvLDIpLGc9bC5zaGlmdCgpLGw9bC5zaGlmdCgpKSk7anx8KFwiaW5saW5lXCI9PT1tP2c/aj1mKHEoZyk/Zy5yZXBsYWNlKC8uKig/PSNbXlxcc10rJCkvLFwiXCIpOmcpOmsuaXNEb20mJihqPWMpOlwiaHRtbFwiPT09bT9qPWc6IW0mJighZyYmXHJcbmsuaXNEb20pJiYobT1cImlubGluZVwiLGo9YykpO2YuZXh0ZW5kKGsse2hyZWY6Zyx0eXBlOm0sY29udGVudDpqLHRpdGxlOmgsc2VsZWN0b3I6bH0pO2FbZV09a30pLGIub3B0cz1mLmV4dGVuZCghMCx7fSxiLmRlZmF1bHRzLGQpLGQua2V5cyE9PXYmJihiLm9wdHMua2V5cz1kLmtleXM/Zi5leHRlbmQoe30sYi5kZWZhdWx0cy5rZXlzLGQua2V5cyk6ITEpLGIuZ3JvdXA9YSxiLl9zdGFydChiLm9wdHMuaW5kZXgpfSxjYW5jZWw6ZnVuY3Rpb24oKXt2YXIgYT1iLmNvbWluZzthJiYhMSE9PWIudHJpZ2dlcihcIm9uQ2FuY2VsXCIpJiYoYi5oaWRlTG9hZGluZygpLGIuYWpheExvYWQmJmIuYWpheExvYWQuYWJvcnQoKSxiLmFqYXhMb2FkPW51bGwsYi5pbWdQcmVsb2FkJiYoYi5pbWdQcmVsb2FkLm9ubG9hZD1iLmltZ1ByZWxvYWQub25lcnJvcj1udWxsKSxhLndyYXAmJmEud3JhcC5zdG9wKCEwLCEwKS50cmlnZ2VyKFwib25SZXNldFwiKS5yZW1vdmUoKSxiLmNvbWluZz1udWxsLGIuY3VycmVudHx8XHJcbmIuX2FmdGVyWm9vbU91dChhKSl9LGNsb3NlOmZ1bmN0aW9uKGEpe2IuY2FuY2VsKCk7ITEhPT1iLnRyaWdnZXIoXCJiZWZvcmVDbG9zZVwiKSYmKGIudW5iaW5kRXZlbnRzKCksYi5pc0FjdGl2ZSYmKCFiLmlzT3Blbnx8ITA9PT1hPyhmKFwiLmZhbmN5Ym94LXdyYXBcIikuc3RvcCghMCkudHJpZ2dlcihcIm9uUmVzZXRcIikucmVtb3ZlKCksYi5fYWZ0ZXJab29tT3V0KCkpOihiLmlzT3Blbj1iLmlzT3BlbmVkPSExLGIuaXNDbG9zaW5nPSEwLGYoXCIuZmFuY3lib3gtaXRlbSwgLmZhbmN5Ym94LW5hdlwiKS5yZW1vdmUoKSxiLndyYXAuc3RvcCghMCwhMCkucmVtb3ZlQ2xhc3MoXCJmYW5jeWJveC1vcGVuZWRcIiksYi50cmFuc2l0aW9uc1tiLmN1cnJlbnQuY2xvc2VNZXRob2RdKCkpKSl9LHBsYXk6ZnVuY3Rpb24oYSl7dmFyIGQ9ZnVuY3Rpb24oKXtjbGVhclRpbWVvdXQoYi5wbGF5ZXIudGltZXIpfSxlPWZ1bmN0aW9uKCl7ZCgpO2IuY3VycmVudCYmYi5wbGF5ZXIuaXNBY3RpdmUmJihiLnBsYXllci50aW1lcj1cclxuc2V0VGltZW91dChiLm5leHQsYi5jdXJyZW50LnBsYXlTcGVlZCkpfSxjPWZ1bmN0aW9uKCl7ZCgpO3AudW5iaW5kKFwiLnBsYXllclwiKTtiLnBsYXllci5pc0FjdGl2ZT0hMTtiLnRyaWdnZXIoXCJvblBsYXlFbmRcIil9O2lmKCEwPT09YXx8IWIucGxheWVyLmlzQWN0aXZlJiYhMSE9PWEpe2lmKGIuY3VycmVudCYmKGIuY3VycmVudC5sb29wfHxiLmN1cnJlbnQuaW5kZXg8Yi5ncm91cC5sZW5ndGgtMSkpYi5wbGF5ZXIuaXNBY3RpdmU9ITAscC5iaW5kKHtcIm9uQ2FuY2VsLnBsYXllciBiZWZvcmVDbG9zZS5wbGF5ZXJcIjpjLFwib25VcGRhdGUucGxheWVyXCI6ZSxcImJlZm9yZUxvYWQucGxheWVyXCI6ZH0pLGUoKSxiLnRyaWdnZXIoXCJvblBsYXlTdGFydFwiKX1lbHNlIGMoKX0sbmV4dDpmdW5jdGlvbihhKXt2YXIgZD1iLmN1cnJlbnQ7ZCYmKHEoYSl8fChhPWQuZGlyZWN0aW9uLm5leHQpLGIuanVtcHRvKGQuaW5kZXgrMSxhLFwibmV4dFwiKSl9LHByZXY6ZnVuY3Rpb24oYSl7dmFyIGQ9Yi5jdXJyZW50O1xyXG5kJiYocShhKXx8KGE9ZC5kaXJlY3Rpb24ucHJldiksYi5qdW1wdG8oZC5pbmRleC0xLGEsXCJwcmV2XCIpKX0sanVtcHRvOmZ1bmN0aW9uKGEsZCxlKXt2YXIgYz1iLmN1cnJlbnQ7YyYmKGE9bChhKSxiLmRpcmVjdGlvbj1kfHxjLmRpcmVjdGlvblthPj1jLmluZGV4P1wibmV4dFwiOlwicHJldlwiXSxiLnJvdXRlcj1lfHxcImp1bXB0b1wiLGMubG9vcCYmKDA+YSYmKGE9Yy5ncm91cC5sZW5ndGgrYSVjLmdyb3VwLmxlbmd0aCksYSU9Yy5ncm91cC5sZW5ndGgpLGMuZ3JvdXBbYV0hPT12JiYoYi5jYW5jZWwoKSxiLl9zdGFydChhKSkpfSxyZXBvc2l0aW9uOmZ1bmN0aW9uKGEsZCl7dmFyIGU9Yi5jdXJyZW50LGM9ZT9lLndyYXA6bnVsbCxrO2MmJihrPWIuX2dldFBvc2l0aW9uKGQpLGEmJlwic2Nyb2xsXCI9PT1hLnR5cGU/KGRlbGV0ZSBrLnBvc2l0aW9uLGMuc3RvcCghMCwhMCkuYW5pbWF0ZShrLDIwMCkpOihjLmNzcyhrKSxlLnBvcz1mLmV4dGVuZCh7fSxlLmRpbSxrKSkpfSx1cGRhdGU6ZnVuY3Rpb24oYSl7dmFyIGQ9XHJcbmEmJmEudHlwZSxlPSFkfHxcIm9yaWVudGF0aW9uY2hhbmdlXCI9PT1kO2UmJihjbGVhclRpbWVvdXQoQiksQj1udWxsKTtiLmlzT3BlbiYmIUImJihCPXNldFRpbWVvdXQoZnVuY3Rpb24oKXt2YXIgYz1iLmN1cnJlbnQ7YyYmIWIuaXNDbG9zaW5nJiYoYi53cmFwLnJlbW92ZUNsYXNzKFwiZmFuY3lib3gtdG1wXCIpLChlfHxcImxvYWRcIj09PWR8fFwicmVzaXplXCI9PT1kJiZjLmF1dG9SZXNpemUpJiZiLl9zZXREaW1lbnNpb24oKSxcInNjcm9sbFwiPT09ZCYmYy5jYW5TaHJpbmt8fGIucmVwb3NpdGlvbihhKSxiLnRyaWdnZXIoXCJvblVwZGF0ZVwiKSxCPW51bGwpfSxlJiYhcz8wOjMwMCkpfSx0b2dnbGU6ZnVuY3Rpb24oYSl7Yi5pc09wZW4mJihiLmN1cnJlbnQuZml0VG9WaWV3PVwiYm9vbGVhblwiPT09Zi50eXBlKGEpP2E6IWIuY3VycmVudC5maXRUb1ZpZXcscyYmKGIud3JhcC5yZW1vdmVBdHRyKFwic3R5bGVcIikuYWRkQ2xhc3MoXCJmYW5jeWJveC10bXBcIiksYi50cmlnZ2VyKFwib25VcGRhdGVcIikpLFxyXG5iLnVwZGF0ZSgpKX0saGlkZUxvYWRpbmc6ZnVuY3Rpb24oKXtwLnVuYmluZChcIi5sb2FkaW5nXCIpO2YoXCIjZmFuY3lib3gtbG9hZGluZ1wiKS5yZW1vdmUoKX0sc2hvd0xvYWRpbmc6ZnVuY3Rpb24oKXt2YXIgYSxkO2IuaGlkZUxvYWRpbmcoKTthPWYoJzxkaXYgaWQ9XCJmYW5jeWJveC1sb2FkaW5nXCI+PGRpdj48L2Rpdj48L2Rpdj4nKS5jbGljayhiLmNhbmNlbCkuYXBwZW5kVG8oXCJib2R5XCIpO3AuYmluZChcImtleWRvd24ubG9hZGluZ1wiLGZ1bmN0aW9uKGEpe2lmKDI3PT09KGEud2hpY2h8fGEua2V5Q29kZSkpYS5wcmV2ZW50RGVmYXVsdCgpLGIuY2FuY2VsKCl9KTtiLmRlZmF1bHRzLmZpeGVkfHwoZD1iLmdldFZpZXdwb3J0KCksYS5jc3Moe3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6MC41KmQuaCtkLnksbGVmdDowLjUqZC53K2QueH0pKX0sZ2V0Vmlld3BvcnQ6ZnVuY3Rpb24oKXt2YXIgYT1iLmN1cnJlbnQmJmIuY3VycmVudC5sb2NrZWR8fCExLGQ9e3g6bi5zY3JvbGxMZWZ0KCksXHJcbnk6bi5zY3JvbGxUb3AoKX07YT8oZC53PWFbMF0uY2xpZW50V2lkdGgsZC5oPWFbMF0uY2xpZW50SGVpZ2h0KTooZC53PXMmJnIuaW5uZXJXaWR0aD9yLmlubmVyV2lkdGg6bi53aWR0aCgpLGQuaD1zJiZyLmlubmVySGVpZ2h0P3IuaW5uZXJIZWlnaHQ6bi5oZWlnaHQoKSk7cmV0dXJuIGR9LHVuYmluZEV2ZW50czpmdW5jdGlvbigpe2Iud3JhcCYmdChiLndyYXApJiZiLndyYXAudW5iaW5kKFwiLmZiXCIpO3AudW5iaW5kKFwiLmZiXCIpO24udW5iaW5kKFwiLmZiXCIpfSxiaW5kRXZlbnRzOmZ1bmN0aW9uKCl7dmFyIGE9Yi5jdXJyZW50LGQ7YSYmKG4uYmluZChcIm9yaWVudGF0aW9uY2hhbmdlLmZiXCIrKHM/XCJcIjpcIiByZXNpemUuZmJcIikrKGEuYXV0b0NlbnRlciYmIWEubG9ja2VkP1wiIHNjcm9sbC5mYlwiOlwiXCIpLGIudXBkYXRlKSwoZD1hLmtleXMpJiZwLmJpbmQoXCJrZXlkb3duLmZiXCIsZnVuY3Rpb24oZSl7dmFyIGM9ZS53aGljaHx8ZS5rZXlDb2RlLGs9ZS50YXJnZXR8fGUuc3JjRWxlbWVudDtcclxuaWYoMjc9PT1jJiZiLmNvbWluZylyZXR1cm4hMTshZS5jdHJsS2V5JiYoIWUuYWx0S2V5JiYhZS5zaGlmdEtleSYmIWUubWV0YUtleSYmKCFrfHwhay50eXBlJiYhZihrKS5pcyhcIltjb250ZW50ZWRpdGFibGVdXCIpKSkmJmYuZWFjaChkLGZ1bmN0aW9uKGQsayl7aWYoMTxhLmdyb3VwLmxlbmd0aCYma1tjXSE9PXYpcmV0dXJuIGJbZF0oa1tjXSksZS5wcmV2ZW50RGVmYXVsdCgpLCExO2lmKC0xPGYuaW5BcnJheShjLGspKXJldHVybiBiW2RdKCksZS5wcmV2ZW50RGVmYXVsdCgpLCExfSl9KSxmLmZuLm1vdXNld2hlZWwmJmEubW91c2VXaGVlbCYmYi53cmFwLmJpbmQoXCJtb3VzZXdoZWVsLmZiXCIsZnVuY3Rpb24oZCxjLGssZyl7Zm9yKHZhciBoPWYoZC50YXJnZXR8fG51bGwpLGo9ITE7aC5sZW5ndGgmJiFqJiYhaC5pcyhcIi5mYW5jeWJveC1za2luXCIpJiYhaC5pcyhcIi5mYW5jeWJveC13cmFwXCIpOylqPWhbMF0mJiEoaFswXS5zdHlsZS5vdmVyZmxvdyYmXCJoaWRkZW5cIj09PWhbMF0uc3R5bGUub3ZlcmZsb3cpJiZcclxuKGhbMF0uY2xpZW50V2lkdGgmJmhbMF0uc2Nyb2xsV2lkdGg+aFswXS5jbGllbnRXaWR0aHx8aFswXS5jbGllbnRIZWlnaHQmJmhbMF0uc2Nyb2xsSGVpZ2h0PmhbMF0uY2xpZW50SGVpZ2h0KSxoPWYoaCkucGFyZW50KCk7aWYoMCE9PWMmJiFqJiYxPGIuZ3JvdXAubGVuZ3RoJiYhYS5jYW5TaHJpbmspe2lmKDA8Z3x8MDxrKWIucHJldigwPGc/XCJkb3duXCI6XCJsZWZ0XCIpO2Vsc2UgaWYoMD5nfHwwPmspYi5uZXh0KDA+Zz9cInVwXCI6XCJyaWdodFwiKTtkLnByZXZlbnREZWZhdWx0KCl9fSkpfSx0cmlnZ2VyOmZ1bmN0aW9uKGEsZCl7dmFyIGUsYz1kfHxiLmNvbWluZ3x8Yi5jdXJyZW50O2lmKGMpe2YuaXNGdW5jdGlvbihjW2FdKSYmKGU9Y1thXS5hcHBseShjLEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywxKSkpO2lmKCExPT09ZSlyZXR1cm4hMTtjLmhlbHBlcnMmJmYuZWFjaChjLmhlbHBlcnMsZnVuY3Rpb24oZCxlKXtpZihlJiZiLmhlbHBlcnNbZF0mJmYuaXNGdW5jdGlvbihiLmhlbHBlcnNbZF1bYV0pKWIuaGVscGVyc1tkXVthXShmLmV4dGVuZCghMCxcclxue30sYi5oZWxwZXJzW2RdLmRlZmF1bHRzLGUpLGMpfSk7cC50cmlnZ2VyKGEpfX0saXNJbWFnZTpmdW5jdGlvbihhKXtyZXR1cm4gcShhKSYmYS5tYXRjaCgvKF5kYXRhOmltYWdlXFwvLiosKXwoXFwuKGpwKGV8Z3xlZyl8Z2lmfHBuZ3xibXB8d2VicHxzdmcpKChcXD98IykuKik/JCkvaSl9LGlzU1dGOmZ1bmN0aW9uKGEpe3JldHVybiBxKGEpJiZhLm1hdGNoKC9cXC4oc3dmKSgoXFw/fCMpLiopPyQvaSl9LF9zdGFydDpmdW5jdGlvbihhKXt2YXIgZD17fSxlLGM7YT1sKGEpO2U9Yi5ncm91cFthXXx8bnVsbDtpZighZSlyZXR1cm4hMTtkPWYuZXh0ZW5kKCEwLHt9LGIub3B0cyxlKTtlPWQubWFyZ2luO2M9ZC5wYWRkaW5nO1wibnVtYmVyXCI9PT1mLnR5cGUoZSkmJihkLm1hcmdpbj1bZSxlLGUsZV0pO1wibnVtYmVyXCI9PT1mLnR5cGUoYykmJihkLnBhZGRpbmc9W2MsYyxjLGNdKTtkLm1vZGFsJiZmLmV4dGVuZCghMCxkLHtjbG9zZUJ0bjohMSxjbG9zZUNsaWNrOiExLG5leHRDbGljazohMSxhcnJvd3M6ITEsXHJcbm1vdXNlV2hlZWw6ITEsa2V5czpudWxsLGhlbHBlcnM6e292ZXJsYXk6e2Nsb3NlQ2xpY2s6ITF9fX0pO2QuYXV0b1NpemUmJihkLmF1dG9XaWR0aD1kLmF1dG9IZWlnaHQ9ITApO1wiYXV0b1wiPT09ZC53aWR0aCYmKGQuYXV0b1dpZHRoPSEwKTtcImF1dG9cIj09PWQuaGVpZ2h0JiYoZC5hdXRvSGVpZ2h0PSEwKTtkLmdyb3VwPWIuZ3JvdXA7ZC5pbmRleD1hO2IuY29taW5nPWQ7aWYoITE9PT1iLnRyaWdnZXIoXCJiZWZvcmVMb2FkXCIpKWIuY29taW5nPW51bGw7ZWxzZXtjPWQudHlwZTtlPWQuaHJlZjtpZighYylyZXR1cm4gYi5jb21pbmc9bnVsbCxiLmN1cnJlbnQmJmIucm91dGVyJiZcImp1bXB0b1wiIT09Yi5yb3V0ZXI/KGIuY3VycmVudC5pbmRleD1hLGJbYi5yb3V0ZXJdKGIuZGlyZWN0aW9uKSk6ITE7Yi5pc0FjdGl2ZT0hMDtpZihcImltYWdlXCI9PT1jfHxcInN3ZlwiPT09YylkLmF1dG9IZWlnaHQ9ZC5hdXRvV2lkdGg9ITEsZC5zY3JvbGxpbmc9XCJ2aXNpYmxlXCI7XCJpbWFnZVwiPT09YyYmKGQuYXNwZWN0UmF0aW89XHJcbiEwKTtcImlmcmFtZVwiPT09YyYmcyYmKGQuc2Nyb2xsaW5nPVwic2Nyb2xsXCIpO2Qud3JhcD1mKGQudHBsLndyYXApLmFkZENsYXNzKFwiZmFuY3lib3gtXCIrKHM/XCJtb2JpbGVcIjpcImRlc2t0b3BcIikrXCIgZmFuY3lib3gtdHlwZS1cIitjK1wiIGZhbmN5Ym94LXRtcCBcIitkLndyYXBDU1MpLmFwcGVuZFRvKGQucGFyZW50fHxcImJvZHlcIik7Zi5leHRlbmQoZCx7c2tpbjpmKFwiLmZhbmN5Ym94LXNraW5cIixkLndyYXApLG91dGVyOmYoXCIuZmFuY3lib3gtb3V0ZXJcIixkLndyYXApLGlubmVyOmYoXCIuZmFuY3lib3gtaW5uZXJcIixkLndyYXApfSk7Zi5lYWNoKFtcIlRvcFwiLFwiUmlnaHRcIixcIkJvdHRvbVwiLFwiTGVmdFwiXSxmdW5jdGlvbihhLGIpe2Quc2tpbi5jc3MoXCJwYWRkaW5nXCIrYix3KGQucGFkZGluZ1thXSkpfSk7Yi50cmlnZ2VyKFwib25SZWFkeVwiKTtpZihcImlubGluZVwiPT09Y3x8XCJodG1sXCI9PT1jKXtpZighZC5jb250ZW50fHwhZC5jb250ZW50Lmxlbmd0aClyZXR1cm4gYi5fZXJyb3IoXCJjb250ZW50XCIpfWVsc2UgaWYoIWUpcmV0dXJuIGIuX2Vycm9yKFwiaHJlZlwiKTtcclxuXCJpbWFnZVwiPT09Yz9iLl9sb2FkSW1hZ2UoKTpcImFqYXhcIj09PWM/Yi5fbG9hZEFqYXgoKTpcImlmcmFtZVwiPT09Yz9iLl9sb2FkSWZyYW1lKCk6Yi5fYWZ0ZXJMb2FkKCl9fSxfZXJyb3I6ZnVuY3Rpb24oYSl7Zi5leHRlbmQoYi5jb21pbmcse3R5cGU6XCJodG1sXCIsYXV0b1dpZHRoOiEwLGF1dG9IZWlnaHQ6ITAsbWluV2lkdGg6MCxtaW5IZWlnaHQ6MCxzY3JvbGxpbmc6XCJub1wiLGhhc0Vycm9yOmEsY29udGVudDpiLmNvbWluZy50cGwuZXJyb3J9KTtiLl9hZnRlckxvYWQoKX0sX2xvYWRJbWFnZTpmdW5jdGlvbigpe3ZhciBhPWIuaW1nUHJlbG9hZD1uZXcgSW1hZ2U7YS5vbmxvYWQ9ZnVuY3Rpb24oKXt0aGlzLm9ubG9hZD10aGlzLm9uZXJyb3I9bnVsbDtiLmNvbWluZy53aWR0aD10aGlzLndpZHRoL2Iub3B0cy5waXhlbFJhdGlvO2IuY29taW5nLmhlaWdodD10aGlzLmhlaWdodC9iLm9wdHMucGl4ZWxSYXRpbztiLl9hZnRlckxvYWQoKX07YS5vbmVycm9yPWZ1bmN0aW9uKCl7dGhpcy5vbmxvYWQ9XHJcbnRoaXMub25lcnJvcj1udWxsO2IuX2Vycm9yKFwiaW1hZ2VcIil9O2Euc3JjPWIuY29taW5nLmhyZWY7ITAhPT1hLmNvbXBsZXRlJiZiLnNob3dMb2FkaW5nKCl9LF9sb2FkQWpheDpmdW5jdGlvbigpe3ZhciBhPWIuY29taW5nO2Iuc2hvd0xvYWRpbmcoKTtiLmFqYXhMb2FkPWYuYWpheChmLmV4dGVuZCh7fSxhLmFqYXgse3VybDphLmhyZWYsZXJyb3I6ZnVuY3Rpb24oYSxlKXtiLmNvbWluZyYmXCJhYm9ydFwiIT09ZT9iLl9lcnJvcihcImFqYXhcIixhKTpiLmhpZGVMb2FkaW5nKCl9LHN1Y2Nlc3M6ZnVuY3Rpb24oZCxlKXtcInN1Y2Nlc3NcIj09PWUmJihhLmNvbnRlbnQ9ZCxiLl9hZnRlckxvYWQoKSl9fSkpfSxfbG9hZElmcmFtZTpmdW5jdGlvbigpe3ZhciBhPWIuY29taW5nLGQ9ZihhLnRwbC5pZnJhbWUucmVwbGFjZSgvXFx7cm5kXFx9L2csKG5ldyBEYXRlKS5nZXRUaW1lKCkpKS5hdHRyKFwic2Nyb2xsaW5nXCIscz9cImF1dG9cIjphLmlmcmFtZS5zY3JvbGxpbmcpLmF0dHIoXCJzcmNcIixhLmhyZWYpO1xyXG5mKGEud3JhcCkuYmluZChcIm9uUmVzZXRcIixmdW5jdGlvbigpe3RyeXtmKHRoaXMpLmZpbmQoXCJpZnJhbWVcIikuaGlkZSgpLmF0dHIoXCJzcmNcIixcIi8vYWJvdXQ6YmxhbmtcIikuZW5kKCkuZW1wdHkoKX1jYXRjaChhKXt9fSk7YS5pZnJhbWUucHJlbG9hZCYmKGIuc2hvd0xvYWRpbmcoKSxkLm9uZShcImxvYWRcIixmdW5jdGlvbigpe2YodGhpcykuZGF0YShcInJlYWR5XCIsMSk7c3x8Zih0aGlzKS5iaW5kKFwibG9hZC5mYlwiLGIudXBkYXRlKTtmKHRoaXMpLnBhcmVudHMoXCIuZmFuY3lib3gtd3JhcFwiKS53aWR0aChcIjEwMCVcIikucmVtb3ZlQ2xhc3MoXCJmYW5jeWJveC10bXBcIikuc2hvdygpO2IuX2FmdGVyTG9hZCgpfSkpO2EuY29udGVudD1kLmFwcGVuZFRvKGEuaW5uZXIpO2EuaWZyYW1lLnByZWxvYWR8fGIuX2FmdGVyTG9hZCgpfSxfcHJlbG9hZEltYWdlczpmdW5jdGlvbigpe3ZhciBhPWIuZ3JvdXAsZD1iLmN1cnJlbnQsZT1hLmxlbmd0aCxjPWQucHJlbG9hZD9NYXRoLm1pbihkLnByZWxvYWQsXHJcbmUtMSk6MCxmLGc7Zm9yKGc9MTtnPD1jO2crPTEpZj1hWyhkLmluZGV4K2cpJWVdLFwiaW1hZ2VcIj09PWYudHlwZSYmZi5ocmVmJiYoKG5ldyBJbWFnZSkuc3JjPWYuaHJlZil9LF9hZnRlckxvYWQ6ZnVuY3Rpb24oKXt2YXIgYT1iLmNvbWluZyxkPWIuY3VycmVudCxlLGMsayxnLGg7Yi5oaWRlTG9hZGluZygpO2lmKGEmJiExIT09Yi5pc0FjdGl2ZSlpZighMT09PWIudHJpZ2dlcihcImFmdGVyTG9hZFwiLGEsZCkpYS53cmFwLnN0b3AoITApLnRyaWdnZXIoXCJvblJlc2V0XCIpLnJlbW92ZSgpLGIuY29taW5nPW51bGw7ZWxzZXtkJiYoYi50cmlnZ2VyKFwiYmVmb3JlQ2hhbmdlXCIsZCksZC53cmFwLnN0b3AoITApLnJlbW92ZUNsYXNzKFwiZmFuY3lib3gtb3BlbmVkXCIpLmZpbmQoXCIuZmFuY3lib3gtaXRlbSwgLmZhbmN5Ym94LW5hdlwiKS5yZW1vdmUoKSk7Yi51bmJpbmRFdmVudHMoKTtlPWEuY29udGVudDtjPWEudHlwZTtrPWEuc2Nyb2xsaW5nO2YuZXh0ZW5kKGIse3dyYXA6YS53cmFwLHNraW46YS5za2luLFxyXG5vdXRlcjphLm91dGVyLGlubmVyOmEuaW5uZXIsY3VycmVudDphLHByZXZpb3VzOmR9KTtnPWEuaHJlZjtzd2l0Y2goYyl7Y2FzZSBcImlubGluZVwiOmNhc2UgXCJhamF4XCI6Y2FzZSBcImh0bWxcIjphLnNlbGVjdG9yP2U9ZihcIjxkaXY+XCIpLmh0bWwoZSkuZmluZChhLnNlbGVjdG9yKTp0KGUpJiYoZS5kYXRhKFwiZmFuY3lib3gtcGxhY2Vob2xkZXJcIil8fGUuZGF0YShcImZhbmN5Ym94LXBsYWNlaG9sZGVyXCIsZignPGRpdiBjbGFzcz1cImZhbmN5Ym94LXBsYWNlaG9sZGVyXCI+PC9kaXY+JykuaW5zZXJ0QWZ0ZXIoZSkuaGlkZSgpKSxlPWUuc2hvdygpLmRldGFjaCgpLGEud3JhcC5iaW5kKFwib25SZXNldFwiLGZ1bmN0aW9uKCl7Zih0aGlzKS5maW5kKGUpLmxlbmd0aCYmZS5oaWRlKCkucmVwbGFjZUFsbChlLmRhdGEoXCJmYW5jeWJveC1wbGFjZWhvbGRlclwiKSkuZGF0YShcImZhbmN5Ym94LXBsYWNlaG9sZGVyXCIsITEpfSkpO2JyZWFrO2Nhc2UgXCJpbWFnZVwiOmU9YS50cGwuaW1hZ2UucmVwbGFjZShcIntocmVmfVwiLFxyXG5nKTticmVhaztjYXNlIFwic3dmXCI6ZT0nPG9iamVjdCBpZD1cImZhbmN5Ym94LXN3ZlwiIGNsYXNzaWQ9XCJjbHNpZDpEMjdDREI2RS1BRTZELTExY2YtOTZCOC00NDQ1NTM1NDAwMDBcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCI+PHBhcmFtIG5hbWU9XCJtb3ZpZVwiIHZhbHVlPVwiJytnKydcIj48L3BhcmFtPicsaD1cIlwiLGYuZWFjaChhLnN3ZixmdW5jdGlvbihhLGIpe2UrPSc8cGFyYW0gbmFtZT1cIicrYSsnXCIgdmFsdWU9XCInK2IrJ1wiPjwvcGFyYW0+JztoKz1cIiBcIithKyc9XCInK2IrJ1wiJ30pLGUrPSc8ZW1iZWQgc3JjPVwiJytnKydcIiB0eXBlPVwiYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2hcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCInK2grXCI+PC9lbWJlZD48L29iamVjdD5cIn0oIXQoZSl8fCFlLnBhcmVudCgpLmlzKGEuaW5uZXIpKSYmYS5pbm5lci5hcHBlbmQoZSk7Yi50cmlnZ2VyKFwiYmVmb3JlU2hvd1wiKTthLmlubmVyLmNzcyhcIm92ZXJmbG93XCIsXCJ5ZXNcIj09PWs/XCJzY3JvbGxcIjpcclxuXCJub1wiPT09az9cImhpZGRlblwiOmspO2IuX3NldERpbWVuc2lvbigpO2IucmVwb3NpdGlvbigpO2IuaXNPcGVuPSExO2IuY29taW5nPW51bGw7Yi5iaW5kRXZlbnRzKCk7aWYoYi5pc09wZW5lZCl7aWYoZC5wcmV2TWV0aG9kKWIudHJhbnNpdGlvbnNbZC5wcmV2TWV0aG9kXSgpfWVsc2UgZihcIi5mYW5jeWJveC13cmFwXCIpLm5vdChhLndyYXApLnN0b3AoITApLnRyaWdnZXIoXCJvblJlc2V0XCIpLnJlbW92ZSgpO2IudHJhbnNpdGlvbnNbYi5pc09wZW5lZD9hLm5leHRNZXRob2Q6YS5vcGVuTWV0aG9kXSgpO2IuX3ByZWxvYWRJbWFnZXMoKX19LF9zZXREaW1lbnNpb246ZnVuY3Rpb24oKXt2YXIgYT1iLmdldFZpZXdwb3J0KCksZD0wLGU9ITEsYz0hMSxlPWIud3JhcCxrPWIuc2tpbixnPWIuaW5uZXIsaD1iLmN1cnJlbnQsYz1oLndpZHRoLGo9aC5oZWlnaHQsbT1oLm1pbldpZHRoLHU9aC5taW5IZWlnaHQsbj1oLm1heFdpZHRoLHA9aC5tYXhIZWlnaHQscz1oLnNjcm9sbGluZyxxPWguc2Nyb2xsT3V0c2lkZT9cclxuaC5zY3JvbGxiYXJXaWR0aDowLHg9aC5tYXJnaW4seT1sKHhbMV0reFszXSkscj1sKHhbMF0reFsyXSksdix6LHQsQyxBLEYsQixELEg7ZS5hZGQoaykuYWRkKGcpLndpZHRoKFwiYXV0b1wiKS5oZWlnaHQoXCJhdXRvXCIpLnJlbW92ZUNsYXNzKFwiZmFuY3lib3gtdG1wXCIpO3g9bChrLm91dGVyV2lkdGgoITApLWsud2lkdGgoKSk7dj1sKGsub3V0ZXJIZWlnaHQoITApLWsuaGVpZ2h0KCkpO3o9eSt4O3Q9cit2O0M9RShjKT8oYS53LXopKmwoYykvMTAwOmM7QT1FKGopPyhhLmgtdCkqbChqKS8xMDA6ajtpZihcImlmcmFtZVwiPT09aC50eXBlKXtpZihIPWguY29udGVudCxoLmF1dG9IZWlnaHQmJjE9PT1ILmRhdGEoXCJyZWFkeVwiKSl0cnl7SFswXS5jb250ZW50V2luZG93LmRvY3VtZW50LmxvY2F0aW9uJiYoZy53aWR0aChDKS5oZWlnaHQoOTk5OSksRj1ILmNvbnRlbnRzKCkuZmluZChcImJvZHlcIikscSYmRi5jc3MoXCJvdmVyZmxvdy14XCIsXCJoaWRkZW5cIiksQT1GLm91dGVySGVpZ2h0KCEwKSl9Y2F0Y2goRyl7fX1lbHNlIGlmKGguYXV0b1dpZHRofHxcclxuaC5hdXRvSGVpZ2h0KWcuYWRkQ2xhc3MoXCJmYW5jeWJveC10bXBcIiksaC5hdXRvV2lkdGh8fGcud2lkdGgoQyksaC5hdXRvSGVpZ2h0fHxnLmhlaWdodChBKSxoLmF1dG9XaWR0aCYmKEM9Zy53aWR0aCgpKSxoLmF1dG9IZWlnaHQmJihBPWcuaGVpZ2h0KCkpLGcucmVtb3ZlQ2xhc3MoXCJmYW5jeWJveC10bXBcIik7Yz1sKEMpO2o9bChBKTtEPUMvQTttPWwoRShtKT9sKG0sXCJ3XCIpLXo6bSk7bj1sKEUobik/bChuLFwid1wiKS16Om4pO3U9bChFKHUpP2wodSxcImhcIiktdDp1KTtwPWwoRShwKT9sKHAsXCJoXCIpLXQ6cCk7Rj1uO0I9cDtoLmZpdFRvVmlldyYmKG49TWF0aC5taW4oYS53LXosbikscD1NYXRoLm1pbihhLmgtdCxwKSk7ej1hLncteTtyPWEuaC1yO2guYXNwZWN0UmF0aW8/KGM+biYmKGM9bixqPWwoYy9EKSksaj5wJiYoaj1wLGM9bChqKkQpKSxjPG0mJihjPW0saj1sKGMvRCkpLGo8dSYmKGo9dSxjPWwoaipEKSkpOihjPU1hdGgubWF4KG0sTWF0aC5taW4oYyxuKSksaC5hdXRvSGVpZ2h0JiZcclxuXCJpZnJhbWVcIiE9PWgudHlwZSYmKGcud2lkdGgoYyksaj1nLmhlaWdodCgpKSxqPU1hdGgubWF4KHUsTWF0aC5taW4oaixwKSkpO2lmKGguZml0VG9WaWV3KWlmKGcud2lkdGgoYykuaGVpZ2h0KGopLGUud2lkdGgoYyt4KSxhPWUud2lkdGgoKSx5PWUuaGVpZ2h0KCksaC5hc3BlY3RSYXRpbylmb3IoOyhhPnp8fHk+cikmJihjPm0mJmo+dSkmJiEoMTk8ZCsrKTspaj1NYXRoLm1heCh1LE1hdGgubWluKHAsai0xMCkpLGM9bChqKkQpLGM8bSYmKGM9bSxqPWwoYy9EKSksYz5uJiYoYz1uLGo9bChjL0QpKSxnLndpZHRoKGMpLmhlaWdodChqKSxlLndpZHRoKGMreCksYT1lLndpZHRoKCkseT1lLmhlaWdodCgpO2Vsc2UgYz1NYXRoLm1heChtLE1hdGgubWluKGMsYy0oYS16KSkpLGo9TWF0aC5tYXgodSxNYXRoLm1pbihqLGotKHktcikpKTtxJiYoXCJhdXRvXCI9PT1zJiZqPEEmJmMreCtxPHopJiYoYys9cSk7Zy53aWR0aChjKS5oZWlnaHQoaik7ZS53aWR0aChjK3gpO2E9ZS53aWR0aCgpO1xyXG55PWUuaGVpZ2h0KCk7ZT0oYT56fHx5PnIpJiZjPm0mJmo+dTtjPWguYXNwZWN0UmF0aW8/YzxGJiZqPEImJmM8QyYmajxBOihjPEZ8fGo8QikmJihjPEN8fGo8QSk7Zi5leHRlbmQoaCx7ZGltOnt3aWR0aDp3KGEpLGhlaWdodDp3KHkpfSxvcmlnV2lkdGg6QyxvcmlnSGVpZ2h0OkEsY2FuU2hyaW5rOmUsY2FuRXhwYW5kOmMsd1BhZGRpbmc6eCxoUGFkZGluZzp2LHdyYXBTcGFjZTp5LWsub3V0ZXJIZWlnaHQoITApLHNraW5TcGFjZTprLmhlaWdodCgpLWp9KTshSCYmKGguYXV0b0hlaWdodCYmaj51JiZqPHAmJiFjKSYmZy5oZWlnaHQoXCJhdXRvXCIpfSxfZ2V0UG9zaXRpb246ZnVuY3Rpb24oYSl7dmFyIGQ9Yi5jdXJyZW50LGU9Yi5nZXRWaWV3cG9ydCgpLGM9ZC5tYXJnaW4sZj1iLndyYXAud2lkdGgoKStjWzFdK2NbM10sZz1iLndyYXAuaGVpZ2h0KCkrY1swXStjWzJdLGM9e3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6Y1swXSxsZWZ0OmNbM119O2QuYXV0b0NlbnRlciYmZC5maXhlZCYmXHJcbiFhJiZnPD1lLmgmJmY8PWUudz9jLnBvc2l0aW9uPVwiZml4ZWRcIjpkLmxvY2tlZHx8KGMudG9wKz1lLnksYy5sZWZ0Kz1lLngpO2MudG9wPXcoTWF0aC5tYXgoYy50b3AsYy50b3ArKGUuaC1nKSpkLnRvcFJhdGlvKSk7Yy5sZWZ0PXcoTWF0aC5tYXgoYy5sZWZ0LGMubGVmdCsoZS53LWYpKmQubGVmdFJhdGlvKSk7cmV0dXJuIGN9LF9hZnRlclpvb21JbjpmdW5jdGlvbigpe3ZhciBhPWIuY3VycmVudDthJiYoYi5pc09wZW49Yi5pc09wZW5lZD0hMCxiLndyYXAuY3NzKFwib3ZlcmZsb3dcIixcInZpc2libGVcIikuYWRkQ2xhc3MoXCJmYW5jeWJveC1vcGVuZWRcIiksYi51cGRhdGUoKSwoYS5jbG9zZUNsaWNrfHxhLm5leHRDbGljayYmMTxiLmdyb3VwLmxlbmd0aCkmJmIuaW5uZXIuY3NzKFwiY3Vyc29yXCIsXCJwb2ludGVyXCIpLmJpbmQoXCJjbGljay5mYlwiLGZ1bmN0aW9uKGQpeyFmKGQudGFyZ2V0KS5pcyhcImFcIikmJiFmKGQudGFyZ2V0KS5wYXJlbnQoKS5pcyhcImFcIikmJihkLnByZXZlbnREZWZhdWx0KCksXHJcbmJbYS5jbG9zZUNsaWNrP1wiY2xvc2VcIjpcIm5leHRcIl0oKSl9KSxhLmNsb3NlQnRuJiZmKGEudHBsLmNsb3NlQnRuKS5hcHBlbmRUbyhiLnNraW4pLmJpbmQoXCJjbGljay5mYlwiLGZ1bmN0aW9uKGEpe2EucHJldmVudERlZmF1bHQoKTtiLmNsb3NlKCl9KSxhLmFycm93cyYmMTxiLmdyb3VwLmxlbmd0aCYmKChhLmxvb3B8fDA8YS5pbmRleCkmJmYoYS50cGwucHJldikuYXBwZW5kVG8oYi5vdXRlcikuYmluZChcImNsaWNrLmZiXCIsYi5wcmV2KSwoYS5sb29wfHxhLmluZGV4PGIuZ3JvdXAubGVuZ3RoLTEpJiZmKGEudHBsLm5leHQpLmFwcGVuZFRvKGIub3V0ZXIpLmJpbmQoXCJjbGljay5mYlwiLGIubmV4dCkpLGIudHJpZ2dlcihcImFmdGVyU2hvd1wiKSwhYS5sb29wJiZhLmluZGV4PT09YS5ncm91cC5sZW5ndGgtMT9iLnBsYXkoITEpOmIub3B0cy5hdXRvUGxheSYmIWIucGxheWVyLmlzQWN0aXZlJiYoYi5vcHRzLmF1dG9QbGF5PSExLGIucGxheSgpKSl9LF9hZnRlclpvb21PdXQ6ZnVuY3Rpb24oYSl7YT1cclxuYXx8Yi5jdXJyZW50O2YoXCIuZmFuY3lib3gtd3JhcFwiKS50cmlnZ2VyKFwib25SZXNldFwiKS5yZW1vdmUoKTtmLmV4dGVuZChiLHtncm91cDp7fSxvcHRzOnt9LHJvdXRlcjohMSxjdXJyZW50Om51bGwsaXNBY3RpdmU6ITEsaXNPcGVuZWQ6ITEsaXNPcGVuOiExLGlzQ2xvc2luZzohMSx3cmFwOm51bGwsc2tpbjpudWxsLG91dGVyOm51bGwsaW5uZXI6bnVsbH0pO2IudHJpZ2dlcihcImFmdGVyQ2xvc2VcIixhKX19KTtiLnRyYW5zaXRpb25zPXtnZXRPcmlnUG9zaXRpb246ZnVuY3Rpb24oKXt2YXIgYT1iLmN1cnJlbnQsZD1hLmVsZW1lbnQsZT1hLm9yaWcsYz17fSxmPTUwLGc9NTAsaD1hLmhQYWRkaW5nLGo9YS53UGFkZGluZyxtPWIuZ2V0Vmlld3BvcnQoKTshZSYmKGEuaXNEb20mJmQuaXMoXCI6dmlzaWJsZVwiKSkmJihlPWQuZmluZChcImltZzpmaXJzdFwiKSxlLmxlbmd0aHx8KGU9ZCkpO3QoZSk/KGM9ZS5vZmZzZXQoKSxlLmlzKFwiaW1nXCIpJiYoZj1lLm91dGVyV2lkdGgoKSxnPWUub3V0ZXJIZWlnaHQoKSkpOlxyXG4oYy50b3A9bS55KyhtLmgtZykqYS50b3BSYXRpbyxjLmxlZnQ9bS54KyhtLnctZikqYS5sZWZ0UmF0aW8pO2lmKFwiZml4ZWRcIj09PWIud3JhcC5jc3MoXCJwb3NpdGlvblwiKXx8YS5sb2NrZWQpYy50b3AtPW0ueSxjLmxlZnQtPW0ueDtyZXR1cm4gYz17dG9wOncoYy50b3AtaCphLnRvcFJhdGlvKSxsZWZ0OncoYy5sZWZ0LWoqYS5sZWZ0UmF0aW8pLHdpZHRoOncoZitqKSxoZWlnaHQ6dyhnK2gpfX0sc3RlcDpmdW5jdGlvbihhLGQpe3ZhciBlLGMsZj1kLnByb3A7Yz1iLmN1cnJlbnQ7dmFyIGc9Yy53cmFwU3BhY2UsaD1jLnNraW5TcGFjZTtpZihcIndpZHRoXCI9PT1mfHxcImhlaWdodFwiPT09ZillPWQuZW5kPT09ZC5zdGFydD8xOihhLWQuc3RhcnQpLyhkLmVuZC1kLnN0YXJ0KSxiLmlzQ2xvc2luZyYmKGU9MS1lKSxjPVwid2lkdGhcIj09PWY/Yy53UGFkZGluZzpjLmhQYWRkaW5nLGM9YS1jLGIuc2tpbltmXShsKFwid2lkdGhcIj09PWY/YzpjLWcqZSkpLGIuaW5uZXJbZl0obChcIndpZHRoXCI9PT1cclxuZj9jOmMtZyplLWgqZSkpfSx6b29tSW46ZnVuY3Rpb24oKXt2YXIgYT1iLmN1cnJlbnQsZD1hLnBvcyxlPWEub3BlbkVmZmVjdCxjPVwiZWxhc3RpY1wiPT09ZSxrPWYuZXh0ZW5kKHtvcGFjaXR5OjF9LGQpO2RlbGV0ZSBrLnBvc2l0aW9uO2M/KGQ9dGhpcy5nZXRPcmlnUG9zaXRpb24oKSxhLm9wZW5PcGFjaXR5JiYoZC5vcGFjaXR5PTAuMSkpOlwiZmFkZVwiPT09ZSYmKGQub3BhY2l0eT0wLjEpO2Iud3JhcC5jc3MoZCkuYW5pbWF0ZShrLHtkdXJhdGlvbjpcIm5vbmVcIj09PWU/MDphLm9wZW5TcGVlZCxlYXNpbmc6YS5vcGVuRWFzaW5nLHN0ZXA6Yz90aGlzLnN0ZXA6bnVsbCxjb21wbGV0ZTpiLl9hZnRlclpvb21Jbn0pfSx6b29tT3V0OmZ1bmN0aW9uKCl7dmFyIGE9Yi5jdXJyZW50LGQ9YS5jbG9zZUVmZmVjdCxlPVwiZWxhc3RpY1wiPT09ZCxjPXtvcGFjaXR5OjAuMX07ZSYmKGM9dGhpcy5nZXRPcmlnUG9zaXRpb24oKSxhLmNsb3NlT3BhY2l0eSYmKGMub3BhY2l0eT0wLjEpKTtiLndyYXAuYW5pbWF0ZShjLFxyXG57ZHVyYXRpb246XCJub25lXCI9PT1kPzA6YS5jbG9zZVNwZWVkLGVhc2luZzphLmNsb3NlRWFzaW5nLHN0ZXA6ZT90aGlzLnN0ZXA6bnVsbCxjb21wbGV0ZTpiLl9hZnRlclpvb21PdXR9KX0sY2hhbmdlSW46ZnVuY3Rpb24oKXt2YXIgYT1iLmN1cnJlbnQsZD1hLm5leHRFZmZlY3QsZT1hLnBvcyxjPXtvcGFjaXR5OjF9LGY9Yi5kaXJlY3Rpb24sZztlLm9wYWNpdHk9MC4xO1wiZWxhc3RpY1wiPT09ZCYmKGc9XCJkb3duXCI9PT1mfHxcInVwXCI9PT1mP1widG9wXCI6XCJsZWZ0XCIsXCJkb3duXCI9PT1mfHxcInJpZ2h0XCI9PT1mPyhlW2ddPXcobChlW2ddKS0yMDApLGNbZ109XCIrPTIwMHB4XCIpOihlW2ddPXcobChlW2ddKSsyMDApLGNbZ109XCItPTIwMHB4XCIpKTtcIm5vbmVcIj09PWQ/Yi5fYWZ0ZXJab29tSW4oKTpiLndyYXAuY3NzKGUpLmFuaW1hdGUoYyx7ZHVyYXRpb246YS5uZXh0U3BlZWQsZWFzaW5nOmEubmV4dEVhc2luZyxjb21wbGV0ZTpiLl9hZnRlclpvb21Jbn0pfSxjaGFuZ2VPdXQ6ZnVuY3Rpb24oKXt2YXIgYT1cclxuYi5wcmV2aW91cyxkPWEucHJldkVmZmVjdCxlPXtvcGFjaXR5OjAuMX0sYz1iLmRpcmVjdGlvbjtcImVsYXN0aWNcIj09PWQmJihlW1wiZG93blwiPT09Y3x8XCJ1cFwiPT09Yz9cInRvcFwiOlwibGVmdFwiXT0oXCJ1cFwiPT09Y3x8XCJsZWZ0XCI9PT1jP1wiLVwiOlwiK1wiKStcIj0yMDBweFwiKTthLndyYXAuYW5pbWF0ZShlLHtkdXJhdGlvbjpcIm5vbmVcIj09PWQ/MDphLnByZXZTcGVlZCxlYXNpbmc6YS5wcmV2RWFzaW5nLGNvbXBsZXRlOmZ1bmN0aW9uKCl7Zih0aGlzKS50cmlnZ2VyKFwib25SZXNldFwiKS5yZW1vdmUoKX19KX19O2IuaGVscGVycy5vdmVybGF5PXtkZWZhdWx0czp7Y2xvc2VDbGljazohMCxzcGVlZE91dDoyMDAsc2hvd0Vhcmx5OiEwLGNzczp7fSxsb2NrZWQ6IXMsZml4ZWQ6ITB9LG92ZXJsYXk6bnVsbCxmaXhlZDohMSxlbDpmKFwiaHRtbFwiKSxjcmVhdGU6ZnVuY3Rpb24oYSl7YT1mLmV4dGVuZCh7fSx0aGlzLmRlZmF1bHRzLGEpO3RoaXMub3ZlcmxheSYmdGhpcy5jbG9zZSgpO3RoaXMub3ZlcmxheT1cclxuZignPGRpdiBjbGFzcz1cImZhbmN5Ym94LW92ZXJsYXlcIj48L2Rpdj4nKS5hcHBlbmRUbyhiLmNvbWluZz9iLmNvbWluZy5wYXJlbnQ6YS5wYXJlbnQpO3RoaXMuZml4ZWQ9ITE7YS5maXhlZCYmYi5kZWZhdWx0cy5maXhlZCYmKHRoaXMub3ZlcmxheS5hZGRDbGFzcyhcImZhbmN5Ym94LW92ZXJsYXktZml4ZWRcIiksdGhpcy5maXhlZD0hMCl9LG9wZW46ZnVuY3Rpb24oYSl7dmFyIGQ9dGhpczthPWYuZXh0ZW5kKHt9LHRoaXMuZGVmYXVsdHMsYSk7dGhpcy5vdmVybGF5P3RoaXMub3ZlcmxheS51bmJpbmQoXCIub3ZlcmxheVwiKS53aWR0aChcImF1dG9cIikuaGVpZ2h0KFwiYXV0b1wiKTp0aGlzLmNyZWF0ZShhKTt0aGlzLmZpeGVkfHwobi5iaW5kKFwicmVzaXplLm92ZXJsYXlcIixmLnByb3h5KHRoaXMudXBkYXRlLHRoaXMpKSx0aGlzLnVwZGF0ZSgpKTthLmNsb3NlQ2xpY2smJnRoaXMub3ZlcmxheS5iaW5kKFwiY2xpY2sub3ZlcmxheVwiLGZ1bmN0aW9uKGEpe2lmKGYoYS50YXJnZXQpLmhhc0NsYXNzKFwiZmFuY3lib3gtb3ZlcmxheVwiKSlyZXR1cm4gYi5pc0FjdGl2ZT9cclxuYi5jbG9zZSgpOmQuY2xvc2UoKSwhMX0pO3RoaXMub3ZlcmxheS5jc3MoYS5jc3MpLnNob3coKX0sY2xvc2U6ZnVuY3Rpb24oKXt2YXIgYSxiO24udW5iaW5kKFwicmVzaXplLm92ZXJsYXlcIik7dGhpcy5lbC5oYXNDbGFzcyhcImZhbmN5Ym94LWxvY2tcIikmJihmKFwiLmZhbmN5Ym94LW1hcmdpblwiKS5yZW1vdmVDbGFzcyhcImZhbmN5Ym94LW1hcmdpblwiKSxhPW4uc2Nyb2xsVG9wKCksYj1uLnNjcm9sbExlZnQoKSx0aGlzLmVsLnJlbW92ZUNsYXNzKFwiZmFuY3lib3gtbG9ja1wiKSxuLnNjcm9sbFRvcChhKS5zY3JvbGxMZWZ0KGIpKTtmKFwiLmZhbmN5Ym94LW92ZXJsYXlcIikucmVtb3ZlKCkuaGlkZSgpO2YuZXh0ZW5kKHRoaXMse292ZXJsYXk6bnVsbCxmaXhlZDohMX0pfSx1cGRhdGU6ZnVuY3Rpb24oKXt2YXIgYT1cIjEwMCVcIixiO3RoaXMub3ZlcmxheS53aWR0aChhKS5oZWlnaHQoXCIxMDAlXCIpO0k/KGI9TWF0aC5tYXgoRy5kb2N1bWVudEVsZW1lbnQub2Zmc2V0V2lkdGgsRy5ib2R5Lm9mZnNldFdpZHRoKSxcclxucC53aWR0aCgpPmImJihhPXAud2lkdGgoKSkpOnAud2lkdGgoKT5uLndpZHRoKCkmJihhPXAud2lkdGgoKSk7dGhpcy5vdmVybGF5LndpZHRoKGEpLmhlaWdodChwLmhlaWdodCgpKX0sb25SZWFkeTpmdW5jdGlvbihhLGIpe3ZhciBlPXRoaXMub3ZlcmxheTtmKFwiLmZhbmN5Ym94LW92ZXJsYXlcIikuc3RvcCghMCwhMCk7ZXx8dGhpcy5jcmVhdGUoYSk7YS5sb2NrZWQmJih0aGlzLmZpeGVkJiZiLmZpeGVkKSYmKGV8fCh0aGlzLm1hcmdpbj1wLmhlaWdodCgpPm4uaGVpZ2h0KCk/ZihcImh0bWxcIikuY3NzKFwibWFyZ2luLXJpZ2h0XCIpLnJlcGxhY2UoXCJweFwiLFwiXCIpOiExKSxiLmxvY2tlZD10aGlzLm92ZXJsYXkuYXBwZW5kKGIud3JhcCksYi5maXhlZD0hMSk7ITA9PT1hLnNob3dFYXJseSYmdGhpcy5iZWZvcmVTaG93LmFwcGx5KHRoaXMsYXJndW1lbnRzKX0sYmVmb3JlU2hvdzpmdW5jdGlvbihhLGIpe3ZhciBlLGM7Yi5sb2NrZWQmJighMSE9PXRoaXMubWFyZ2luJiYoZihcIipcIikuZmlsdGVyKGZ1bmN0aW9uKCl7cmV0dXJuXCJmaXhlZFwiPT09XHJcbmYodGhpcykuY3NzKFwicG9zaXRpb25cIikmJiFmKHRoaXMpLmhhc0NsYXNzKFwiZmFuY3lib3gtb3ZlcmxheVwiKSYmIWYodGhpcykuaGFzQ2xhc3MoXCJmYW5jeWJveC13cmFwXCIpfSkuYWRkQ2xhc3MoXCJmYW5jeWJveC1tYXJnaW5cIiksdGhpcy5lbC5hZGRDbGFzcyhcImZhbmN5Ym94LW1hcmdpblwiKSksZT1uLnNjcm9sbFRvcCgpLGM9bi5zY3JvbGxMZWZ0KCksdGhpcy5lbC5hZGRDbGFzcyhcImZhbmN5Ym94LWxvY2tcIiksbi5zY3JvbGxUb3AoZSkuc2Nyb2xsTGVmdChjKSk7dGhpcy5vcGVuKGEpfSxvblVwZGF0ZTpmdW5jdGlvbigpe3RoaXMuZml4ZWR8fHRoaXMudXBkYXRlKCl9LGFmdGVyQ2xvc2U6ZnVuY3Rpb24oYSl7dGhpcy5vdmVybGF5JiYhYi5jb21pbmcmJnRoaXMub3ZlcmxheS5mYWRlT3V0KGEuc3BlZWRPdXQsZi5wcm94eSh0aGlzLmNsb3NlLHRoaXMpKX19O2IuaGVscGVycy50aXRsZT17ZGVmYXVsdHM6e3R5cGU6XCJmbG9hdFwiLHBvc2l0aW9uOlwiYm90dG9tXCJ9LGJlZm9yZVNob3c6ZnVuY3Rpb24oYSl7dmFyIGQ9XHJcbmIuY3VycmVudCxlPWQudGl0bGUsYz1hLnR5cGU7Zi5pc0Z1bmN0aW9uKGUpJiYoZT1lLmNhbGwoZC5lbGVtZW50LGQpKTtpZihxKGUpJiZcIlwiIT09Zi50cmltKGUpKXtkPWYoJzxkaXYgY2xhc3M9XCJmYW5jeWJveC10aXRsZSBmYW5jeWJveC10aXRsZS0nK2MrJy13cmFwXCI+JytlK1wiPC9kaXY+XCIpO3N3aXRjaChjKXtjYXNlIFwiaW5zaWRlXCI6Yz1iLnNraW47YnJlYWs7Y2FzZSBcIm91dHNpZGVcIjpjPWIud3JhcDticmVhaztjYXNlIFwib3ZlclwiOmM9Yi5pbm5lcjticmVhaztkZWZhdWx0OmM9Yi5za2luLGQuYXBwZW5kVG8oXCJib2R5XCIpLEkmJmQud2lkdGgoZC53aWR0aCgpKSxkLndyYXBJbm5lcignPHNwYW4gY2xhc3M9XCJjaGlsZFwiPjwvc3Bhbj4nKSxiLmN1cnJlbnQubWFyZ2luWzJdKz1NYXRoLmFicyhsKGQuY3NzKFwibWFyZ2luLWJvdHRvbVwiKSkpfWRbXCJ0b3BcIj09PWEucG9zaXRpb24/XCJwcmVwZW5kVG9cIjpcImFwcGVuZFRvXCJdKGMpfX19O2YuZm4uZmFuY3lib3g9ZnVuY3Rpb24oYSl7dmFyIGQsXHJcbmU9Zih0aGlzKSxjPXRoaXMuc2VsZWN0b3J8fFwiXCIsaz1mdW5jdGlvbihnKXt2YXIgaD1mKHRoaXMpLmJsdXIoKSxqPWQsayxsOyFnLmN0cmxLZXkmJighZy5hbHRLZXkmJiFnLnNoaWZ0S2V5JiYhZy5tZXRhS2V5KSYmIWguaXMoXCIuZmFuY3lib3gtd3JhcFwiKSYmKGs9YS5ncm91cEF0dHJ8fFwiZGF0YS1mYW5jeWJveC1ncm91cFwiLGw9aC5hdHRyKGspLGx8fChrPVwicmVsXCIsbD1oLmdldCgwKVtrXSksbCYmKFwiXCIhPT1sJiZcIm5vZm9sbG93XCIhPT1sKSYmKGg9Yy5sZW5ndGg/ZihjKTplLGg9aC5maWx0ZXIoXCJbXCIraysnPVwiJytsKydcIl0nKSxqPWguaW5kZXgodGhpcykpLGEuaW5kZXg9aiwhMSE9PWIub3BlbihoLGEpJiZnLnByZXZlbnREZWZhdWx0KCkpfTthPWF8fHt9O2Q9YS5pbmRleHx8MDshY3x8ITE9PT1hLmxpdmU/ZS51bmJpbmQoXCJjbGljay5mYi1zdGFydFwiKS5iaW5kKFwiY2xpY2suZmItc3RhcnRcIixrKTpwLnVuZGVsZWdhdGUoYyxcImNsaWNrLmZiLXN0YXJ0XCIpLmRlbGVnYXRlKGMrXHJcblwiOm5vdCgnLmZhbmN5Ym94LWl0ZW0sIC5mYW5jeWJveC1uYXYnKVwiLFwiY2xpY2suZmItc3RhcnRcIixrKTt0aGlzLmZpbHRlcihcIltkYXRhLWZhbmN5Ym94LXN0YXJ0PTFdXCIpLnRyaWdnZXIoXCJjbGlja1wiKTtyZXR1cm4gdGhpc307cC5yZWFkeShmdW5jdGlvbigpe3ZhciBhLGQ7Zi5zY3JvbGxiYXJXaWR0aD09PXYmJihmLnNjcm9sbGJhcldpZHRoPWZ1bmN0aW9uKCl7dmFyIGE9ZignPGRpdiBzdHlsZT1cIndpZHRoOjUwcHg7aGVpZ2h0OjUwcHg7b3ZlcmZsb3c6YXV0b1wiPjxkaXYvPjwvZGl2PicpLmFwcGVuZFRvKFwiYm9keVwiKSxiPWEuY2hpbGRyZW4oKSxiPWIuaW5uZXJXaWR0aCgpLWIuaGVpZ2h0KDk5KS5pbm5lcldpZHRoKCk7YS5yZW1vdmUoKTtyZXR1cm4gYn0pO2lmKGYuc3VwcG9ydC5maXhlZFBvc2l0aW9uPT09dil7YT1mLnN1cHBvcnQ7ZD1mKCc8ZGl2IHN0eWxlPVwicG9zaXRpb246Zml4ZWQ7dG9wOjIwcHg7XCI+PC9kaXY+JykuYXBwZW5kVG8oXCJib2R5XCIpO3ZhciBlPTIwPT09XHJcbmRbMF0ub2Zmc2V0VG9wfHwxNT09PWRbMF0ub2Zmc2V0VG9wO2QucmVtb3ZlKCk7YS5maXhlZFBvc2l0aW9uPWV9Zi5leHRlbmQoYi5kZWZhdWx0cyx7c2Nyb2xsYmFyV2lkdGg6Zi5zY3JvbGxiYXJXaWR0aCgpLGZpeGVkOmYuc3VwcG9ydC5maXhlZFBvc2l0aW9uLHBhcmVudDpmKFwiYm9keVwiKX0pO2E9ZihyKS53aWR0aCgpO0ouYWRkQ2xhc3MoXCJmYW5jeWJveC1sb2NrLXRlc3RcIik7ZD1mKHIpLndpZHRoKCk7Si5yZW1vdmVDbGFzcyhcImZhbmN5Ym94LWxvY2stdGVzdFwiKTtmKFwiPHN0eWxlIHR5cGU9J3RleHQvY3NzJz4uZmFuY3lib3gtbWFyZ2lue21hcmdpbi1yaWdodDpcIisoZC1hKStcInB4O308L3N0eWxlPlwiKS5hcHBlbmRUbyhcImhlYWRcIil9KX0pKHdpbmRvdyxkb2N1bWVudCxqUXVlcnkpOyIsIi8qIVxyXG4qIEJvb3RzdHJhcC5qcyBieSBAZmF0ICYgQG1kb1xyXG4qIENvcHlyaWdodCAyMDEyIFR3aXR0ZXIsIEluYy5cclxuKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjAudHh0XHJcbiovXHJcbiFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjtlKGZ1bmN0aW9uKCl7ZS5zdXBwb3J0LnRyYW5zaXRpb249ZnVuY3Rpb24oKXt2YXIgZT1mdW5jdGlvbigpe3ZhciBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJib290c3RyYXBcIiksdD17V2Via2l0VHJhbnNpdGlvbjpcIndlYmtpdFRyYW5zaXRpb25FbmRcIixNb3pUcmFuc2l0aW9uOlwidHJhbnNpdGlvbmVuZFwiLE9UcmFuc2l0aW9uOlwib1RyYW5zaXRpb25FbmQgb3RyYW5zaXRpb25lbmRcIix0cmFuc2l0aW9uOlwidHJhbnNpdGlvbmVuZFwifSxuO2ZvcihuIGluIHQpaWYoZS5zdHlsZVtuXSE9PXVuZGVmaW5lZClyZXR1cm4gdFtuXX0oKTtyZXR1cm4gZSYme2VuZDplfX0oKX0pfSh3aW5kb3cualF1ZXJ5KSwhZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7dmFyIHQ9J1tkYXRhLWRpc21pc3M9XCJhbGVydFwiXScsbj1mdW5jdGlvbihuKXtlKG4pLm9uKFwiY2xpY2tcIix0LHRoaXMuY2xvc2UpfTtuLnByb3RvdHlwZS5jbG9zZT1mdW5jdGlvbih0KXtmdW5jdGlvbiBzKCl7aS50cmlnZ2VyKFwiY2xvc2VkXCIpLnJlbW92ZSgpfXZhciBuPWUodGhpcykscj1uLmF0dHIoXCJkYXRhLXRhcmdldFwiKSxpO3J8fChyPW4uYXR0cihcImhyZWZcIikscj1yJiZyLnJlcGxhY2UoLy4qKD89I1teXFxzXSokKS8sXCJcIikpLGk9ZShyKSx0JiZ0LnByZXZlbnREZWZhdWx0KCksaS5sZW5ndGh8fChpPW4uaGFzQ2xhc3MoXCJhbGVydFwiKT9uOm4ucGFyZW50KCkpLGkudHJpZ2dlcih0PWUuRXZlbnQoXCJjbG9zZVwiKSk7aWYodC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSlyZXR1cm47aS5yZW1vdmVDbGFzcyhcImluXCIpLGUuc3VwcG9ydC50cmFuc2l0aW9uJiZpLmhhc0NsYXNzKFwiZmFkZVwiKT9pLm9uKGUuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCxzKTpzKCl9O3ZhciByPWUuZm4uYWxlcnQ7ZS5mbi5hbGVydD1mdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHI9ZSh0aGlzKSxpPXIuZGF0YShcImFsZXJ0XCIpO2l8fHIuZGF0YShcImFsZXJ0XCIsaT1uZXcgbih0aGlzKSksdHlwZW9mIHQ9PVwic3RyaW5nXCImJmlbdF0uY2FsbChyKX0pfSxlLmZuLmFsZXJ0LkNvbnN0cnVjdG9yPW4sZS5mbi5hbGVydC5ub0NvbmZsaWN0PWZ1bmN0aW9uKCl7cmV0dXJuIGUuZm4uYWxlcnQ9cix0aGlzfSxlKGRvY3VtZW50KS5vbihcImNsaWNrLmFsZXJ0LmRhdGEtYXBpXCIsdCxuLnByb3RvdHlwZS5jbG9zZSl9KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjt2YXIgdD1mdW5jdGlvbih0LG4pe3RoaXMuJGVsZW1lbnQ9ZSh0KSx0aGlzLm9wdGlvbnM9ZS5leHRlbmQoe30sZS5mbi5idXR0b24uZGVmYXVsdHMsbil9O3QucHJvdG90eXBlLnNldFN0YXRlPWZ1bmN0aW9uKGUpe3ZhciB0PVwiZGlzYWJsZWRcIixuPXRoaXMuJGVsZW1lbnQscj1uLmRhdGEoKSxpPW4uaXMoXCJpbnB1dFwiKT9cInZhbFwiOlwiaHRtbFwiO2UrPVwiVGV4dFwiLHIucmVzZXRUZXh0fHxuLmRhdGEoXCJyZXNldFRleHRcIixuW2ldKCkpLG5baV0ocltlXXx8dGhpcy5vcHRpb25zW2VdKSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZT09XCJsb2FkaW5nVGV4dFwiP24uYWRkQ2xhc3ModCkuYXR0cih0LHQpOm4ucmVtb3ZlQ2xhc3ModCkucmVtb3ZlQXR0cih0KX0sMCl9LHQucHJvdG90eXBlLnRvZ2dsZT1mdW5jdGlvbigpe3ZhciBlPXRoaXMuJGVsZW1lbnQuY2xvc2VzdCgnW2RhdGEtdG9nZ2xlPVwiYnV0dG9ucy1yYWRpb1wiXScpO2UmJmUuZmluZChcIi5hY3RpdmVcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIiksdGhpcy4kZWxlbWVudC50b2dnbGVDbGFzcyhcImFjdGl2ZVwiKX07dmFyIG49ZS5mbi5idXR0b247ZS5mbi5idXR0b249ZnVuY3Rpb24obil7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciByPWUodGhpcyksaT1yLmRhdGEoXCJidXR0b25cIikscz10eXBlb2Ygbj09XCJvYmplY3RcIiYmbjtpfHxyLmRhdGEoXCJidXR0b25cIixpPW5ldyB0KHRoaXMscykpLG49PVwidG9nZ2xlXCI/aS50b2dnbGUoKTpuJiZpLnNldFN0YXRlKG4pfSl9LGUuZm4uYnV0dG9uLmRlZmF1bHRzPXtsb2FkaW5nVGV4dDpcImxvYWRpbmcuLi5cIn0sZS5mbi5idXR0b24uQ29uc3RydWN0b3I9dCxlLmZuLmJ1dHRvbi5ub0NvbmZsaWN0PWZ1bmN0aW9uKCl7cmV0dXJuIGUuZm4uYnV0dG9uPW4sdGhpc30sZShkb2N1bWVudCkub24oXCJjbGljay5idXR0b24uZGF0YS1hcGlcIixcIltkYXRhLXRvZ2dsZV49YnV0dG9uXVwiLGZ1bmN0aW9uKHQpe3ZhciBuPWUodC50YXJnZXQpO24uaGFzQ2xhc3MoXCJidG5cIil8fChuPW4uY2xvc2VzdChcIi5idG5cIikpLG4uYnV0dG9uKFwidG9nZ2xlXCIpfSl9KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjt2YXIgdD1mdW5jdGlvbih0LG4pe3RoaXMuJGVsZW1lbnQ9ZSh0KSx0aGlzLiRpbmRpY2F0b3JzPXRoaXMuJGVsZW1lbnQuZmluZChcIi5jYXJvdXNlbC1pbmRpY2F0b3JzXCIpLHRoaXMub3B0aW9ucz1uLHRoaXMub3B0aW9ucy5wYXVzZT09XCJob3ZlclwiJiZ0aGlzLiRlbGVtZW50Lm9uKFwibW91c2VlbnRlclwiLGUucHJveHkodGhpcy5wYXVzZSx0aGlzKSkub24oXCJtb3VzZWxlYXZlXCIsZS5wcm94eSh0aGlzLmN5Y2xlLHRoaXMpKX07dC5wcm90b3R5cGU9e2N5Y2xlOmZ1bmN0aW9uKHQpe3JldHVybiB0fHwodGhpcy5wYXVzZWQ9ITEpLHRoaXMuaW50ZXJ2YWwmJmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbCksdGhpcy5vcHRpb25zLmludGVydmFsJiYhdGhpcy5wYXVzZWQmJih0aGlzLmludGVydmFsPXNldEludGVydmFsKGUucHJveHkodGhpcy5uZXh0LHRoaXMpLHRoaXMub3B0aW9ucy5pbnRlcnZhbCkpLHRoaXN9LGdldEFjdGl2ZUluZGV4OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuJGFjdGl2ZT10aGlzLiRlbGVtZW50LmZpbmQoXCIuaXRlbS5hY3RpdmVcIiksdGhpcy4kaXRlbXM9dGhpcy4kYWN0aXZlLnBhcmVudCgpLmNoaWxkcmVuKCksdGhpcy4kaXRlbXMuaW5kZXgodGhpcy4kYWN0aXZlKX0sdG86ZnVuY3Rpb24odCl7dmFyIG49dGhpcy5nZXRBY3RpdmVJbmRleCgpLHI9dGhpcztpZih0PnRoaXMuJGl0ZW1zLmxlbmd0aC0xfHx0PDApcmV0dXJuO3JldHVybiB0aGlzLnNsaWRpbmc/dGhpcy4kZWxlbWVudC5vbmUoXCJzbGlkXCIsZnVuY3Rpb24oKXtyLnRvKHQpfSk6bj09dD90aGlzLnBhdXNlKCkuY3ljbGUoKTp0aGlzLnNsaWRlKHQ+bj9cIm5leHRcIjpcInByZXZcIixlKHRoaXMuJGl0ZW1zW3RdKSl9LHBhdXNlOmZ1bmN0aW9uKHQpe3JldHVybiB0fHwodGhpcy5wYXVzZWQ9ITApLHRoaXMuJGVsZW1lbnQuZmluZChcIi5uZXh0LCAucHJldlwiKS5sZW5ndGgmJmUuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCYmKHRoaXMuJGVsZW1lbnQudHJpZ2dlcihlLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQpLHRoaXMuY3ljbGUoITApKSxjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpLHRoaXMuaW50ZXJ2YWw9bnVsbCx0aGlzfSxuZXh0OmZ1bmN0aW9uKCl7aWYodGhpcy5zbGlkaW5nKXJldHVybjtyZXR1cm4gdGhpcy5zbGlkZShcIm5leHRcIil9LHByZXY6ZnVuY3Rpb24oKXtpZih0aGlzLnNsaWRpbmcpcmV0dXJuO3JldHVybiB0aGlzLnNsaWRlKFwicHJldlwiKX0sc2xpZGU6ZnVuY3Rpb24odCxuKXt2YXIgcj10aGlzLiRlbGVtZW50LmZpbmQoXCIuaXRlbS5hY3RpdmVcIiksaT1ufHxyW3RdKCkscz10aGlzLmludGVydmFsLG89dD09XCJuZXh0XCI/XCJsZWZ0XCI6XCJyaWdodFwiLHU9dD09XCJuZXh0XCI/XCJmaXJzdFwiOlwibGFzdFwiLGE9dGhpcyxmO3RoaXMuc2xpZGluZz0hMCxzJiZ0aGlzLnBhdXNlKCksaT1pLmxlbmd0aD9pOnRoaXMuJGVsZW1lbnQuZmluZChcIi5pdGVtXCIpW3VdKCksZj1lLkV2ZW50KFwic2xpZGVcIix7cmVsYXRlZFRhcmdldDppWzBdLGRpcmVjdGlvbjpvfSk7aWYoaS5oYXNDbGFzcyhcImFjdGl2ZVwiKSlyZXR1cm47dGhpcy4kaW5kaWNhdG9ycy5sZW5ndGgmJih0aGlzLiRpbmRpY2F0b3JzLmZpbmQoXCIuYWN0aXZlXCIpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLHRoaXMuJGVsZW1lbnQub25lKFwic2xpZFwiLGZ1bmN0aW9uKCl7dmFyIHQ9ZShhLiRpbmRpY2F0b3JzLmNoaWxkcmVuKClbYS5nZXRBY3RpdmVJbmRleCgpXSk7dCYmdC5hZGRDbGFzcyhcImFjdGl2ZVwiKX0pKTtpZihlLnN1cHBvcnQudHJhbnNpdGlvbiYmdGhpcy4kZWxlbWVudC5oYXNDbGFzcyhcInNsaWRlXCIpKXt0aGlzLiRlbGVtZW50LnRyaWdnZXIoZik7aWYoZi5pc0RlZmF1bHRQcmV2ZW50ZWQoKSlyZXR1cm47aS5hZGRDbGFzcyh0KSxpWzBdLm9mZnNldFdpZHRoLHIuYWRkQ2xhc3MobyksaS5hZGRDbGFzcyhvKSx0aGlzLiRlbGVtZW50Lm9uZShlLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsZnVuY3Rpb24oKXtpLnJlbW92ZUNsYXNzKFt0LG9dLmpvaW4oXCIgXCIpKS5hZGRDbGFzcyhcImFjdGl2ZVwiKSxyLnJlbW92ZUNsYXNzKFtcImFjdGl2ZVwiLG9dLmpvaW4oXCIgXCIpKSxhLnNsaWRpbmc9ITEsc2V0VGltZW91dChmdW5jdGlvbigpe2EuJGVsZW1lbnQudHJpZ2dlcihcInNsaWRcIil9LDApfSl9ZWxzZXt0aGlzLiRlbGVtZW50LnRyaWdnZXIoZik7aWYoZi5pc0RlZmF1bHRQcmV2ZW50ZWQoKSlyZXR1cm47ci5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKSxpLmFkZENsYXNzKFwiYWN0aXZlXCIpLHRoaXMuc2xpZGluZz0hMSx0aGlzLiRlbGVtZW50LnRyaWdnZXIoXCJzbGlkXCIpfXJldHVybiBzJiZ0aGlzLmN5Y2xlKCksdGhpc319O3ZhciBuPWUuZm4uY2Fyb3VzZWw7ZS5mbi5jYXJvdXNlbD1mdW5jdGlvbihuKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHI9ZSh0aGlzKSxpPXIuZGF0YShcImNhcm91c2VsXCIpLHM9ZS5leHRlbmQoe30sZS5mbi5jYXJvdXNlbC5kZWZhdWx0cyx0eXBlb2Ygbj09XCJvYmplY3RcIiYmbiksbz10eXBlb2Ygbj09XCJzdHJpbmdcIj9uOnMuc2xpZGU7aXx8ci5kYXRhKFwiY2Fyb3VzZWxcIixpPW5ldyB0KHRoaXMscykpLHR5cGVvZiBuPT1cIm51bWJlclwiP2kudG8obik6bz9pW29dKCk6cy5pbnRlcnZhbCYmaS5wYXVzZSgpLmN5Y2xlKCl9KX0sZS5mbi5jYXJvdXNlbC5kZWZhdWx0cz17aW50ZXJ2YWw6NWUzLHBhdXNlOlwiaG92ZXJcIn0sZS5mbi5jYXJvdXNlbC5Db25zdHJ1Y3Rvcj10LGUuZm4uY2Fyb3VzZWwubm9Db25mbGljdD1mdW5jdGlvbigpe3JldHVybiBlLmZuLmNhcm91c2VsPW4sdGhpc30sZShkb2N1bWVudCkub24oXCJjbGljay5jYXJvdXNlbC5kYXRhLWFwaVwiLFwiW2RhdGEtc2xpZGVdLCBbZGF0YS1zbGlkZS10b11cIixmdW5jdGlvbih0KXt2YXIgbj1lKHRoaXMpLHIsaT1lKG4uYXR0cihcImRhdGEtdGFyZ2V0XCIpfHwocj1uLmF0dHIoXCJocmVmXCIpKSYmci5yZXBsYWNlKC8uKig/PSNbXlxcc10rJCkvLFwiXCIpKSxzPWUuZXh0ZW5kKHt9LGkuZGF0YSgpLG4uZGF0YSgpKSxvO2kuY2Fyb3VzZWwocyksKG89bi5hdHRyKFwiZGF0YS1zbGlkZS10b1wiKSkmJmkuZGF0YShcImNhcm91c2VsXCIpLnBhdXNlKCkudG8obykuY3ljbGUoKSx0LnByZXZlbnREZWZhdWx0KCl9KX0od2luZG93LmpRdWVyeSksIWZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO3ZhciB0PWZ1bmN0aW9uKHQsbil7dGhpcy4kZWxlbWVudD1lKHQpLHRoaXMub3B0aW9ucz1lLmV4dGVuZCh7fSxlLmZuLmNvbGxhcHNlLmRlZmF1bHRzLG4pLHRoaXMub3B0aW9ucy5wYXJlbnQmJih0aGlzLiRwYXJlbnQ9ZSh0aGlzLm9wdGlvbnMucGFyZW50KSksdGhpcy5vcHRpb25zLnRvZ2dsZSYmdGhpcy50b2dnbGUoKX07dC5wcm90b3R5cGU9e2NvbnN0cnVjdG9yOnQsZGltZW5zaW9uOmZ1bmN0aW9uKCl7dmFyIGU9dGhpcy4kZWxlbWVudC5oYXNDbGFzcyhcIndpZHRoXCIpO3JldHVybiBlP1wid2lkdGhcIjpcImhlaWdodFwifSxzaG93OmZ1bmN0aW9uKCl7dmFyIHQsbixyLGk7aWYodGhpcy50cmFuc2l0aW9uaW5nfHx0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKFwiaW5cIikpcmV0dXJuO3Q9dGhpcy5kaW1lbnNpb24oKSxuPWUuY2FtZWxDYXNlKFtcInNjcm9sbFwiLHRdLmpvaW4oXCItXCIpKSxyPXRoaXMuJHBhcmVudCYmdGhpcy4kcGFyZW50LmZpbmQoXCI+IC5hY2NvcmRpb24tZ3JvdXAgPiAuaW5cIik7aWYociYmci5sZW5ndGgpe2k9ci5kYXRhKFwiY29sbGFwc2VcIik7aWYoaSYmaS50cmFuc2l0aW9uaW5nKXJldHVybjtyLmNvbGxhcHNlKFwiaGlkZVwiKSxpfHxyLmRhdGEoXCJjb2xsYXBzZVwiLG51bGwpfXRoaXMuJGVsZW1lbnRbdF0oMCksdGhpcy50cmFuc2l0aW9uKFwiYWRkQ2xhc3NcIixlLkV2ZW50KFwic2hvd1wiKSxcInNob3duXCIpLGUuc3VwcG9ydC50cmFuc2l0aW9uJiZ0aGlzLiRlbGVtZW50W3RdKHRoaXMuJGVsZW1lbnRbMF1bbl0pfSxoaWRlOmZ1bmN0aW9uKCl7dmFyIHQ7aWYodGhpcy50cmFuc2l0aW9uaW5nfHwhdGhpcy4kZWxlbWVudC5oYXNDbGFzcyhcImluXCIpKXJldHVybjt0PXRoaXMuZGltZW5zaW9uKCksdGhpcy5yZXNldCh0aGlzLiRlbGVtZW50W3RdKCkpLHRoaXMudHJhbnNpdGlvbihcInJlbW92ZUNsYXNzXCIsZS5FdmVudChcImhpZGVcIiksXCJoaWRkZW5cIiksdGhpcy4kZWxlbWVudFt0XSgwKX0scmVzZXQ6ZnVuY3Rpb24oZSl7dmFyIHQ9dGhpcy5kaW1lbnNpb24oKTtyZXR1cm4gdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyhcImNvbGxhcHNlXCIpW3RdKGV8fFwiYXV0b1wiKVswXS5vZmZzZXRXaWR0aCx0aGlzLiRlbGVtZW50W2UhPT1udWxsP1wiYWRkQ2xhc3NcIjpcInJlbW92ZUNsYXNzXCJdKFwiY29sbGFwc2VcIiksdGhpc30sdHJhbnNpdGlvbjpmdW5jdGlvbih0LG4scil7dmFyIGk9dGhpcyxzPWZ1bmN0aW9uKCl7bi50eXBlPT1cInNob3dcIiYmaS5yZXNldCgpLGkudHJhbnNpdGlvbmluZz0wLGkuJGVsZW1lbnQudHJpZ2dlcihyKX07dGhpcy4kZWxlbWVudC50cmlnZ2VyKG4pO2lmKG4uaXNEZWZhdWx0UHJldmVudGVkKCkpcmV0dXJuO3RoaXMudHJhbnNpdGlvbmluZz0xLHRoaXMuJGVsZW1lbnRbdF0oXCJpblwiKSxlLnN1cHBvcnQudHJhbnNpdGlvbiYmdGhpcy4kZWxlbWVudC5oYXNDbGFzcyhcImNvbGxhcHNlXCIpP3RoaXMuJGVsZW1lbnQub25lKGUuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCxzKTpzKCl9LHRvZ2dsZTpmdW5jdGlvbigpe3RoaXNbdGhpcy4kZWxlbWVudC5oYXNDbGFzcyhcImluXCIpP1wiaGlkZVwiOlwic2hvd1wiXSgpfX07dmFyIG49ZS5mbi5jb2xsYXBzZTtlLmZuLmNvbGxhcHNlPWZ1bmN0aW9uKG4pe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgcj1lKHRoaXMpLGk9ci5kYXRhKFwiY29sbGFwc2VcIikscz1lLmV4dGVuZCh7fSxlLmZuLmNvbGxhcHNlLmRlZmF1bHRzLHIuZGF0YSgpLHR5cGVvZiBuPT1cIm9iamVjdFwiJiZuKTtpfHxyLmRhdGEoXCJjb2xsYXBzZVwiLGk9bmV3IHQodGhpcyxzKSksdHlwZW9mIG49PVwic3RyaW5nXCImJmlbbl0oKX0pfSxlLmZuLmNvbGxhcHNlLmRlZmF1bHRzPXt0b2dnbGU6ITB9LGUuZm4uY29sbGFwc2UuQ29uc3RydWN0b3I9dCxlLmZuLmNvbGxhcHNlLm5vQ29uZmxpY3Q9ZnVuY3Rpb24oKXtyZXR1cm4gZS5mbi5jb2xsYXBzZT1uLHRoaXN9LGUoZG9jdW1lbnQpLm9uKFwiY2xpY2suY29sbGFwc2UuZGF0YS1hcGlcIixcIltkYXRhLXRvZ2dsZT1jb2xsYXBzZV1cIixmdW5jdGlvbih0KXt2YXIgbj1lKHRoaXMpLHIsaT1uLmF0dHIoXCJkYXRhLXRhcmdldFwiKXx8dC5wcmV2ZW50RGVmYXVsdCgpfHwocj1uLmF0dHIoXCJocmVmXCIpKSYmci5yZXBsYWNlKC8uKig/PSNbXlxcc10rJCkvLFwiXCIpLHM9ZShpKS5kYXRhKFwiY29sbGFwc2VcIik/XCJ0b2dnbGVcIjpuLmRhdGEoKTtuW2UoaSkuaGFzQ2xhc3MoXCJpblwiKT9cImFkZENsYXNzXCI6XCJyZW1vdmVDbGFzc1wiXShcImNvbGxhcHNlZFwiKSxlKGkpLmNvbGxhcHNlKHMpfSl9KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKCl7ZSh0KS5lYWNoKGZ1bmN0aW9uKCl7aShlKHRoaXMpKS5yZW1vdmVDbGFzcyhcIm9wZW5cIil9KX1mdW5jdGlvbiBpKHQpe3ZhciBuPXQuYXR0cihcImRhdGEtdGFyZ2V0XCIpLHI7bnx8KG49dC5hdHRyKFwiaHJlZlwiKSxuPW4mJi8jLy50ZXN0KG4pJiZuLnJlcGxhY2UoLy4qKD89I1teXFxzXSokKS8sXCJcIikpLHI9biYmZShuKTtpZighcnx8IXIubGVuZ3RoKXI9dC5wYXJlbnQoKTtyZXR1cm4gcn12YXIgdD1cIltkYXRhLXRvZ2dsZT1kcm9wZG93bl1cIixuPWZ1bmN0aW9uKHQpe3ZhciBuPWUodCkub24oXCJjbGljay5kcm9wZG93bi5kYXRhLWFwaVwiLHRoaXMudG9nZ2xlKTtlKFwiaHRtbFwiKS5vbihcImNsaWNrLmRyb3Bkb3duLmRhdGEtYXBpXCIsZnVuY3Rpb24oKXtuLnBhcmVudCgpLnJlbW92ZUNsYXNzKFwib3BlblwiKX0pfTtuLnByb3RvdHlwZT17Y29uc3RydWN0b3I6bix0b2dnbGU6ZnVuY3Rpb24odCl7dmFyIG49ZSh0aGlzKSxzLG87aWYobi5pcyhcIi5kaXNhYmxlZCwgOmRpc2FibGVkXCIpKXJldHVybjtyZXR1cm4gcz1pKG4pLG89cy5oYXNDbGFzcyhcIm9wZW5cIikscigpLG98fHMudG9nZ2xlQ2xhc3MoXCJvcGVuXCIpLG4uZm9jdXMoKSwhMX0sa2V5ZG93bjpmdW5jdGlvbihuKXt2YXIgcixzLG8sdSxhLGY7aWYoIS8oMzh8NDB8MjcpLy50ZXN0KG4ua2V5Q29kZSkpcmV0dXJuO3I9ZSh0aGlzKSxuLnByZXZlbnREZWZhdWx0KCksbi5zdG9wUHJvcGFnYXRpb24oKTtpZihyLmlzKFwiLmRpc2FibGVkLCA6ZGlzYWJsZWRcIikpcmV0dXJuO3U9aShyKSxhPXUuaGFzQ2xhc3MoXCJvcGVuXCIpO2lmKCFhfHxhJiZuLmtleUNvZGU9PTI3KXJldHVybiBuLndoaWNoPT0yNyYmdS5maW5kKHQpLmZvY3VzKCksci5jbGljaygpO3M9ZShcIltyb2xlPW1lbnVdIGxpOm5vdCguZGl2aWRlcik6dmlzaWJsZSBhXCIsdSk7aWYoIXMubGVuZ3RoKXJldHVybjtmPXMuaW5kZXgocy5maWx0ZXIoXCI6Zm9jdXNcIikpLG4ua2V5Q29kZT09MzgmJmY+MCYmZi0tLG4ua2V5Q29kZT09NDAmJmY8cy5sZW5ndGgtMSYmZisrLH5mfHwoZj0wKSxzLmVxKGYpLmZvY3VzKCl9fTt2YXIgcz1lLmZuLmRyb3Bkb3duO2UuZm4uZHJvcGRvd249ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciByPWUodGhpcyksaT1yLmRhdGEoXCJkcm9wZG93blwiKTtpfHxyLmRhdGEoXCJkcm9wZG93blwiLGk9bmV3IG4odGhpcykpLHR5cGVvZiB0PT1cInN0cmluZ1wiJiZpW3RdLmNhbGwocil9KX0sZS5mbi5kcm9wZG93bi5Db25zdHJ1Y3Rvcj1uLGUuZm4uZHJvcGRvd24ubm9Db25mbGljdD1mdW5jdGlvbigpe3JldHVybiBlLmZuLmRyb3Bkb3duPXMsdGhpc30sZShkb2N1bWVudCkub24oXCJjbGljay5kcm9wZG93bi5kYXRhLWFwaVwiLHIpLm9uKFwiY2xpY2suZHJvcGRvd24uZGF0YS1hcGlcIixcIi5kcm9wZG93biBmb3JtXCIsZnVuY3Rpb24oZSl7ZS5zdG9wUHJvcGFnYXRpb24oKX0pLm9uKFwiY2xpY2suZHJvcGRvd24tbWVudVwiLGZ1bmN0aW9uKGUpe2Uuc3RvcFByb3BhZ2F0aW9uKCl9KS5vbihcImNsaWNrLmRyb3Bkb3duLmRhdGEtYXBpXCIsdCxuLnByb3RvdHlwZS50b2dnbGUpLm9uKFwia2V5ZG93bi5kcm9wZG93bi5kYXRhLWFwaVwiLHQrXCIsIFtyb2xlPW1lbnVdXCIsbi5wcm90b3R5cGUua2V5ZG93bil9KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjt2YXIgdD1mdW5jdGlvbih0LG4pe3RoaXMub3B0aW9ucz1uLHRoaXMuJGVsZW1lbnQ9ZSh0KS5kZWxlZ2F0ZSgnW2RhdGEtZGlzbWlzcz1cIm1vZGFsXCJdJyxcImNsaWNrLmRpc21pc3MubW9kYWxcIixlLnByb3h5KHRoaXMuaGlkZSx0aGlzKSksdGhpcy5vcHRpb25zLnJlbW90ZSYmdGhpcy4kZWxlbWVudC5maW5kKFwiLm1vZGFsLWJvZHlcIikubG9hZCh0aGlzLm9wdGlvbnMucmVtb3RlKX07dC5wcm90b3R5cGU9e2NvbnN0cnVjdG9yOnQsdG9nZ2xlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXNbdGhpcy5pc1Nob3duP1wiaGlkZVwiOlwic2hvd1wiXSgpfSxzaG93OmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcyxuPWUuRXZlbnQoXCJzaG93XCIpO3RoaXMuJGVsZW1lbnQudHJpZ2dlcihuKTtpZih0aGlzLmlzU2hvd258fG4uaXNEZWZhdWx0UHJldmVudGVkKCkpcmV0dXJuO3RoaXMuaXNTaG93bj0hMCx0aGlzLmVzY2FwZSgpLHRoaXMuYmFja2Ryb3AoZnVuY3Rpb24oKXt2YXIgbj1lLnN1cHBvcnQudHJhbnNpdGlvbiYmdC4kZWxlbWVudC5oYXNDbGFzcyhcImZhZGVcIik7dC4kZWxlbWVudC5wYXJlbnQoKS5sZW5ndGh8fHQuJGVsZW1lbnQuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSksdC4kZWxlbWVudC5zaG93KCksbiYmdC4kZWxlbWVudFswXS5vZmZzZXRXaWR0aCx0LiRlbGVtZW50LmFkZENsYXNzKFwiaW5cIikuYXR0cihcImFyaWEtaGlkZGVuXCIsITEpLHQuZW5mb3JjZUZvY3VzKCksbj90LiRlbGVtZW50Lm9uZShlLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsZnVuY3Rpb24oKXt0LiRlbGVtZW50LmZvY3VzKCkudHJpZ2dlcihcInNob3duXCIpfSk6dC4kZWxlbWVudC5mb2N1cygpLnRyaWdnZXIoXCJzaG93blwiKX0pfSxoaWRlOmZ1bmN0aW9uKHQpe3QmJnQucHJldmVudERlZmF1bHQoKTt2YXIgbj10aGlzO3Q9ZS5FdmVudChcImhpZGVcIiksdGhpcy4kZWxlbWVudC50cmlnZ2VyKHQpO2lmKCF0aGlzLmlzU2hvd258fHQuaXNEZWZhdWx0UHJldmVudGVkKCkpcmV0dXJuO3RoaXMuaXNTaG93bj0hMSx0aGlzLmVzY2FwZSgpLGUoZG9jdW1lbnQpLm9mZihcImZvY3VzaW4ubW9kYWxcIiksdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyhcImluXCIpLmF0dHIoXCJhcmlhLWhpZGRlblwiLCEwKSxlLnN1cHBvcnQudHJhbnNpdGlvbiYmdGhpcy4kZWxlbWVudC5oYXNDbGFzcyhcImZhZGVcIik/dGhpcy5oaWRlV2l0aFRyYW5zaXRpb24oKTp0aGlzLmhpZGVNb2RhbCgpfSxlbmZvcmNlRm9jdXM6ZnVuY3Rpb24oKXt2YXIgdD10aGlzO2UoZG9jdW1lbnQpLm9uKFwiZm9jdXNpbi5tb2RhbFwiLGZ1bmN0aW9uKGUpe3QuJGVsZW1lbnRbMF0hPT1lLnRhcmdldCYmIXQuJGVsZW1lbnQuaGFzKGUudGFyZ2V0KS5sZW5ndGgmJnQuJGVsZW1lbnQuZm9jdXMoKX0pfSxlc2NhcGU6ZnVuY3Rpb24oKXt2YXIgZT10aGlzO3RoaXMuaXNTaG93biYmdGhpcy5vcHRpb25zLmtleWJvYXJkP3RoaXMuJGVsZW1lbnQub24oXCJrZXl1cC5kaXNtaXNzLm1vZGFsXCIsZnVuY3Rpb24odCl7dC53aGljaD09MjcmJmUuaGlkZSgpfSk6dGhpcy5pc1Nob3dufHx0aGlzLiRlbGVtZW50Lm9mZihcImtleXVwLmRpc21pc3MubW9kYWxcIil9LGhpZGVXaXRoVHJhbnNpdGlvbjpmdW5jdGlvbigpe3ZhciB0PXRoaXMsbj1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dC4kZWxlbWVudC5vZmYoZS5zdXBwb3J0LnRyYW5zaXRpb24uZW5kKSx0LmhpZGVNb2RhbCgpfSw1MDApO3RoaXMuJGVsZW1lbnQub25lKGUuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCxmdW5jdGlvbigpe2NsZWFyVGltZW91dChuKSx0LmhpZGVNb2RhbCgpfSl9LGhpZGVNb2RhbDpmdW5jdGlvbigpe3ZhciBlPXRoaXM7dGhpcy4kZWxlbWVudC5oaWRlKCksdGhpcy5iYWNrZHJvcChmdW5jdGlvbigpe2UucmVtb3ZlQmFja2Ryb3AoKSxlLiRlbGVtZW50LnRyaWdnZXIoXCJoaWRkZW5cIil9KX0scmVtb3ZlQmFja2Ryb3A6ZnVuY3Rpb24oKXt0aGlzLiRiYWNrZHJvcCYmdGhpcy4kYmFja2Ryb3AucmVtb3ZlKCksdGhpcy4kYmFja2Ryb3A9bnVsbH0sYmFja2Ryb3A6ZnVuY3Rpb24odCl7dmFyIG49dGhpcyxyPXRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoXCJmYWRlXCIpP1wiZmFkZVwiOlwiXCI7aWYodGhpcy5pc1Nob3duJiZ0aGlzLm9wdGlvbnMuYmFja2Ryb3Ape3ZhciBpPWUuc3VwcG9ydC50cmFuc2l0aW9uJiZyO3RoaXMuJGJhY2tkcm9wPWUoJzxkaXYgY2xhc3M9XCJtb2RhbC1iYWNrZHJvcCAnK3IrJ1wiIC8+JykuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSksdGhpcy4kYmFja2Ryb3AuY2xpY2sodGhpcy5vcHRpb25zLmJhY2tkcm9wPT1cInN0YXRpY1wiP2UucHJveHkodGhpcy4kZWxlbWVudFswXS5mb2N1cyx0aGlzLiRlbGVtZW50WzBdKTplLnByb3h5KHRoaXMuaGlkZSx0aGlzKSksaSYmdGhpcy4kYmFja2Ryb3BbMF0ub2Zmc2V0V2lkdGgsdGhpcy4kYmFja2Ryb3AuYWRkQ2xhc3MoXCJpblwiKTtpZighdClyZXR1cm47aT90aGlzLiRiYWNrZHJvcC5vbmUoZS5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLHQpOnQoKX1lbHNlIXRoaXMuaXNTaG93biYmdGhpcy4kYmFja2Ryb3A/KHRoaXMuJGJhY2tkcm9wLnJlbW92ZUNsYXNzKFwiaW5cIiksZS5zdXBwb3J0LnRyYW5zaXRpb24mJnRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoXCJmYWRlXCIpP3RoaXMuJGJhY2tkcm9wLm9uZShlLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsdCk6dCgpKTp0JiZ0KCl9fTt2YXIgbj1lLmZuLm1vZGFsO2UuZm4ubW9kYWw9ZnVuY3Rpb24obil7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciByPWUodGhpcyksaT1yLmRhdGEoXCJtb2RhbFwiKSxzPWUuZXh0ZW5kKHt9LGUuZm4ubW9kYWwuZGVmYXVsdHMsci5kYXRhKCksdHlwZW9mIG49PVwib2JqZWN0XCImJm4pO2l8fHIuZGF0YShcIm1vZGFsXCIsaT1uZXcgdCh0aGlzLHMpKSx0eXBlb2Ygbj09XCJzdHJpbmdcIj9pW25dKCk6cy5zaG93JiZpLnNob3coKX0pfSxlLmZuLm1vZGFsLmRlZmF1bHRzPXtiYWNrZHJvcDohMCxrZXlib2FyZDohMCxzaG93OiEwfSxlLmZuLm1vZGFsLkNvbnN0cnVjdG9yPXQsZS5mbi5tb2RhbC5ub0NvbmZsaWN0PWZ1bmN0aW9uKCl7cmV0dXJuIGUuZm4ubW9kYWw9bix0aGlzfSxlKGRvY3VtZW50KS5vbihcImNsaWNrLm1vZGFsLmRhdGEtYXBpXCIsJ1tkYXRhLXRvZ2dsZT1cIm1vZGFsXCJdJyxmdW5jdGlvbih0KXt2YXIgbj1lKHRoaXMpLHI9bi5hdHRyKFwiaHJlZlwiKSxpPWUobi5hdHRyKFwiZGF0YS10YXJnZXRcIil8fHImJnIucmVwbGFjZSgvLiooPz0jW15cXHNdKyQpLyxcIlwiKSkscz1pLmRhdGEoXCJtb2RhbFwiKT9cInRvZ2dsZVwiOmUuZXh0ZW5kKHtyZW1vdGU6IS8jLy50ZXN0KHIpJiZyfSxpLmRhdGEoKSxuLmRhdGEoKSk7dC5wcmV2ZW50RGVmYXVsdCgpLGkubW9kYWwocykub25lKFwiaGlkZVwiLGZ1bmN0aW9uKCl7bi5mb2N1cygpfSl9KX0od2luZG93LmpRdWVyeSksIWZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO3ZhciB0PWZ1bmN0aW9uKGUsdCl7dGhpcy5pbml0KFwidG9vbHRpcFwiLGUsdCl9O3QucHJvdG90eXBlPXtjb25zdHJ1Y3Rvcjp0LGluaXQ6ZnVuY3Rpb24odCxuLHIpe3ZhciBpLHMsbyx1LGE7dGhpcy50eXBlPXQsdGhpcy4kZWxlbWVudD1lKG4pLHRoaXMub3B0aW9ucz10aGlzLmdldE9wdGlvbnMociksdGhpcy5lbmFibGVkPSEwLG89dGhpcy5vcHRpb25zLnRyaWdnZXIuc3BsaXQoXCIgXCIpO2ZvcihhPW8ubGVuZ3RoO2EtLTspdT1vW2FdLHU9PVwiY2xpY2tcIj90aGlzLiRlbGVtZW50Lm9uKFwiY2xpY2suXCIrdGhpcy50eXBlLHRoaXMub3B0aW9ucy5zZWxlY3RvcixlLnByb3h5KHRoaXMudG9nZ2xlLHRoaXMpKTp1IT1cIm1hbnVhbFwiJiYoaT11PT1cImhvdmVyXCI/XCJtb3VzZWVudGVyXCI6XCJmb2N1c1wiLHM9dT09XCJob3ZlclwiP1wibW91c2VsZWF2ZVwiOlwiYmx1clwiLHRoaXMuJGVsZW1lbnQub24oaStcIi5cIit0aGlzLnR5cGUsdGhpcy5vcHRpb25zLnNlbGVjdG9yLGUucHJveHkodGhpcy5lbnRlcix0aGlzKSksdGhpcy4kZWxlbWVudC5vbihzK1wiLlwiK3RoaXMudHlwZSx0aGlzLm9wdGlvbnMuc2VsZWN0b3IsZS5wcm94eSh0aGlzLmxlYXZlLHRoaXMpKSk7dGhpcy5vcHRpb25zLnNlbGVjdG9yP3RoaXMuX29wdGlvbnM9ZS5leHRlbmQoe30sdGhpcy5vcHRpb25zLHt0cmlnZ2VyOlwibWFudWFsXCIsc2VsZWN0b3I6XCJcIn0pOnRoaXMuZml4VGl0bGUoKX0sZ2V0T3B0aW9uczpmdW5jdGlvbih0KXtyZXR1cm4gdD1lLmV4dGVuZCh7fSxlLmZuW3RoaXMudHlwZV0uZGVmYXVsdHMsdGhpcy4kZWxlbWVudC5kYXRhKCksdCksdC5kZWxheSYmdHlwZW9mIHQuZGVsYXk9PVwibnVtYmVyXCImJih0LmRlbGF5PXtzaG93OnQuZGVsYXksaGlkZTp0LmRlbGF5fSksdH0sZW50ZXI6ZnVuY3Rpb24odCl7dmFyIG49ZS5mblt0aGlzLnR5cGVdLmRlZmF1bHRzLHI9e30saTt0aGlzLl9vcHRpb25zJiZlLmVhY2godGhpcy5fb3B0aW9ucyxmdW5jdGlvbihlLHQpe25bZV0hPXQmJihyW2VdPXQpfSx0aGlzKSxpPWUodC5jdXJyZW50VGFyZ2V0KVt0aGlzLnR5cGVdKHIpLmRhdGEodGhpcy50eXBlKTtpZighaS5vcHRpb25zLmRlbGF5fHwhaS5vcHRpb25zLmRlbGF5LnNob3cpcmV0dXJuIGkuc2hvdygpO2NsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpLGkuaG92ZXJTdGF0ZT1cImluXCIsdGhpcy50aW1lb3V0PXNldFRpbWVvdXQoZnVuY3Rpb24oKXtpLmhvdmVyU3RhdGU9PVwiaW5cIiYmaS5zaG93KCl9LGkub3B0aW9ucy5kZWxheS5zaG93KX0sbGVhdmU6ZnVuY3Rpb24odCl7dmFyIG49ZSh0LmN1cnJlbnRUYXJnZXQpW3RoaXMudHlwZV0odGhpcy5fb3B0aW9ucykuZGF0YSh0aGlzLnR5cGUpO3RoaXMudGltZW91dCYmY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7aWYoIW4ub3B0aW9ucy5kZWxheXx8IW4ub3B0aW9ucy5kZWxheS5oaWRlKXJldHVybiBuLmhpZGUoKTtuLmhvdmVyU3RhdGU9XCJvdXRcIix0aGlzLnRpbWVvdXQ9c2V0VGltZW91dChmdW5jdGlvbigpe24uaG92ZXJTdGF0ZT09XCJvdXRcIiYmbi5oaWRlKCl9LG4ub3B0aW9ucy5kZWxheS5oaWRlKX0sc2hvdzpmdW5jdGlvbigpe3ZhciB0LG4scixpLHMsbyx1PWUuRXZlbnQoXCJzaG93XCIpO2lmKHRoaXMuaGFzQ29udGVudCgpJiZ0aGlzLmVuYWJsZWQpe3RoaXMuJGVsZW1lbnQudHJpZ2dlcih1KTtpZih1LmlzRGVmYXVsdFByZXZlbnRlZCgpKXJldHVybjt0PXRoaXMudGlwKCksdGhpcy5zZXRDb250ZW50KCksdGhpcy5vcHRpb25zLmFuaW1hdGlvbiYmdC5hZGRDbGFzcyhcImZhZGVcIikscz10eXBlb2YgdGhpcy5vcHRpb25zLnBsYWNlbWVudD09XCJmdW5jdGlvblwiP3RoaXMub3B0aW9ucy5wbGFjZW1lbnQuY2FsbCh0aGlzLHRbMF0sdGhpcy4kZWxlbWVudFswXSk6dGhpcy5vcHRpb25zLnBsYWNlbWVudCx0LmRldGFjaCgpLmNzcyh7dG9wOjAsbGVmdDowLGRpc3BsYXk6XCJibG9ja1wifSksdGhpcy5vcHRpb25zLmNvbnRhaW5lcj90LmFwcGVuZFRvKHRoaXMub3B0aW9ucy5jb250YWluZXIpOnQuaW5zZXJ0QWZ0ZXIodGhpcy4kZWxlbWVudCksbj10aGlzLmdldFBvc2l0aW9uKCkscj10WzBdLm9mZnNldFdpZHRoLGk9dFswXS5vZmZzZXRIZWlnaHQ7c3dpdGNoKHMpe2Nhc2VcImJvdHRvbVwiOm89e3RvcDpuLnRvcCtuLmhlaWdodCxsZWZ0Om4ubGVmdCtuLndpZHRoLzItci8yfTticmVhaztjYXNlXCJ0b3BcIjpvPXt0b3A6bi50b3AtaSxsZWZ0Om4ubGVmdCtuLndpZHRoLzItci8yfTticmVhaztjYXNlXCJsZWZ0XCI6bz17dG9wOm4udG9wK24uaGVpZ2h0LzItaS8yLGxlZnQ6bi5sZWZ0LXJ9O2JyZWFrO2Nhc2VcInJpZ2h0XCI6bz17dG9wOm4udG9wK24uaGVpZ2h0LzItaS8yLGxlZnQ6bi5sZWZ0K24ud2lkdGh9fXRoaXMuYXBwbHlQbGFjZW1lbnQobyxzKSx0aGlzLiRlbGVtZW50LnRyaWdnZXIoXCJzaG93blwiKX19LGFwcGx5UGxhY2VtZW50OmZ1bmN0aW9uKGUsdCl7dmFyIG49dGhpcy50aXAoKSxyPW5bMF0ub2Zmc2V0V2lkdGgsaT1uWzBdLm9mZnNldEhlaWdodCxzLG8sdSxhO24ub2Zmc2V0KGUpLmFkZENsYXNzKHQpLmFkZENsYXNzKFwiaW5cIikscz1uWzBdLm9mZnNldFdpZHRoLG89blswXS5vZmZzZXRIZWlnaHQsdD09XCJ0b3BcIiYmbyE9aSYmKGUudG9wPWUudG9wK2ktbyxhPSEwKSx0PT1cImJvdHRvbVwifHx0PT1cInRvcFwiPyh1PTAsZS5sZWZ0PDAmJih1PWUubGVmdCotMixlLmxlZnQ9MCxuLm9mZnNldChlKSxzPW5bMF0ub2Zmc2V0V2lkdGgsbz1uWzBdLm9mZnNldEhlaWdodCksdGhpcy5yZXBsYWNlQXJyb3codS1yK3MscyxcImxlZnRcIikpOnRoaXMucmVwbGFjZUFycm93KG8taSxvLFwidG9wXCIpLGEmJm4ub2Zmc2V0KGUpfSxyZXBsYWNlQXJyb3c6ZnVuY3Rpb24oZSx0LG4pe3RoaXMuYXJyb3coKS5jc3MobixlPzUwKigxLWUvdCkrXCIlXCI6XCJcIil9LHNldENvbnRlbnQ6ZnVuY3Rpb24oKXt2YXIgZT10aGlzLnRpcCgpLHQ9dGhpcy5nZXRUaXRsZSgpO2UuZmluZChcIi50b29sdGlwLWlubmVyXCIpW3RoaXMub3B0aW9ucy5odG1sP1wiaHRtbFwiOlwidGV4dFwiXSh0KSxlLnJlbW92ZUNsYXNzKFwiZmFkZSBpbiB0b3AgYm90dG9tIGxlZnQgcmlnaHRcIil9LGhpZGU6ZnVuY3Rpb24oKXtmdW5jdGlvbiBpKCl7dmFyIHQ9c2V0VGltZW91dChmdW5jdGlvbigpe24ub2ZmKGUuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCkuZGV0YWNoKCl9LDUwMCk7bi5vbmUoZS5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLGZ1bmN0aW9uKCl7Y2xlYXJUaW1lb3V0KHQpLG4uZGV0YWNoKCl9KX12YXIgdD10aGlzLG49dGhpcy50aXAoKSxyPWUuRXZlbnQoXCJoaWRlXCIpO3RoaXMuJGVsZW1lbnQudHJpZ2dlcihyKTtpZihyLmlzRGVmYXVsdFByZXZlbnRlZCgpKXJldHVybjtyZXR1cm4gbi5yZW1vdmVDbGFzcyhcImluXCIpLGUuc3VwcG9ydC50cmFuc2l0aW9uJiZ0aGlzLiR0aXAuaGFzQ2xhc3MoXCJmYWRlXCIpP2koKTpuLmRldGFjaCgpLHRoaXMuJGVsZW1lbnQudHJpZ2dlcihcImhpZGRlblwiKSx0aGlzfSxmaXhUaXRsZTpmdW5jdGlvbigpe3ZhciBlPXRoaXMuJGVsZW1lbnQ7KGUuYXR0cihcInRpdGxlXCIpfHx0eXBlb2YgZS5hdHRyKFwiZGF0YS1vcmlnaW5hbC10aXRsZVwiKSE9XCJzdHJpbmdcIikmJmUuYXR0cihcImRhdGEtb3JpZ2luYWwtdGl0bGVcIixlLmF0dHIoXCJ0aXRsZVwiKXx8XCJcIikuYXR0cihcInRpdGxlXCIsXCJcIil9LGhhc0NvbnRlbnQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5nZXRUaXRsZSgpfSxnZXRQb3NpdGlvbjpmdW5jdGlvbigpe3ZhciB0PXRoaXMuJGVsZW1lbnRbMF07cmV0dXJuIGUuZXh0ZW5kKHt9LHR5cGVvZiB0LmdldEJvdW5kaW5nQ2xpZW50UmVjdD09XCJmdW5jdGlvblwiP3QuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk6e3dpZHRoOnQub2Zmc2V0V2lkdGgsaGVpZ2h0OnQub2Zmc2V0SGVpZ2h0fSx0aGlzLiRlbGVtZW50Lm9mZnNldCgpKX0sZ2V0VGl0bGU6ZnVuY3Rpb24oKXt2YXIgZSx0PXRoaXMuJGVsZW1lbnQsbj10aGlzLm9wdGlvbnM7cmV0dXJuIGU9dC5hdHRyKFwiZGF0YS1vcmlnaW5hbC10aXRsZVwiKXx8KHR5cGVvZiBuLnRpdGxlPT1cImZ1bmN0aW9uXCI/bi50aXRsZS5jYWxsKHRbMF0pOm4udGl0bGUpLGV9LHRpcDpmdW5jdGlvbigpe3JldHVybiB0aGlzLiR0aXA9dGhpcy4kdGlwfHxlKHRoaXMub3B0aW9ucy50ZW1wbGF0ZSl9LGFycm93OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuJGFycm93PXRoaXMuJGFycm93fHx0aGlzLnRpcCgpLmZpbmQoXCIudG9vbHRpcC1hcnJvd1wiKX0sdmFsaWRhdGU6ZnVuY3Rpb24oKXt0aGlzLiRlbGVtZW50WzBdLnBhcmVudE5vZGV8fCh0aGlzLmhpZGUoKSx0aGlzLiRlbGVtZW50PW51bGwsdGhpcy5vcHRpb25zPW51bGwpfSxlbmFibGU6ZnVuY3Rpb24oKXt0aGlzLmVuYWJsZWQ9ITB9LGRpc2FibGU6ZnVuY3Rpb24oKXt0aGlzLmVuYWJsZWQ9ITF9LHRvZ2dsZUVuYWJsZWQ6ZnVuY3Rpb24oKXt0aGlzLmVuYWJsZWQ9IXRoaXMuZW5hYmxlZH0sdG9nZ2xlOmZ1bmN0aW9uKHQpe3ZhciBuPXQ/ZSh0LmN1cnJlbnRUYXJnZXQpW3RoaXMudHlwZV0odGhpcy5fb3B0aW9ucykuZGF0YSh0aGlzLnR5cGUpOnRoaXM7bi50aXAoKS5oYXNDbGFzcyhcImluXCIpP24uaGlkZSgpOm4uc2hvdygpfSxkZXN0cm95OmZ1bmN0aW9uKCl7dGhpcy5oaWRlKCkuJGVsZW1lbnQub2ZmKFwiLlwiK3RoaXMudHlwZSkucmVtb3ZlRGF0YSh0aGlzLnR5cGUpfX07dmFyIG49ZS5mbi50b29sdGlwO2UuZm4udG9vbHRpcD1mdW5jdGlvbihuKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHI9ZSh0aGlzKSxpPXIuZGF0YShcInRvb2x0aXBcIikscz10eXBlb2Ygbj09XCJvYmplY3RcIiYmbjtpfHxyLmRhdGEoXCJ0b29sdGlwXCIsaT1uZXcgdCh0aGlzLHMpKSx0eXBlb2Ygbj09XCJzdHJpbmdcIiYmaVtuXSgpfSl9LGUuZm4udG9vbHRpcC5Db25zdHJ1Y3Rvcj10LGUuZm4udG9vbHRpcC5kZWZhdWx0cz17YW5pbWF0aW9uOiEwLHBsYWNlbWVudDpcInRvcFwiLHNlbGVjdG9yOiExLHRlbXBsYXRlOic8ZGl2IGNsYXNzPVwidG9vbHRpcFwiPjxkaXYgY2xhc3M9XCJ0b29sdGlwLWFycm93XCI+PC9kaXY+PGRpdiBjbGFzcz1cInRvb2x0aXAtaW5uZXJcIj48L2Rpdj48L2Rpdj4nLHRyaWdnZXI6XCJob3ZlciBmb2N1c1wiLHRpdGxlOlwiXCIsZGVsYXk6MCxodG1sOiExLGNvbnRhaW5lcjohMX0sZS5mbi50b29sdGlwLm5vQ29uZmxpY3Q9ZnVuY3Rpb24oKXtyZXR1cm4gZS5mbi50b29sdGlwPW4sdGhpc319KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjt2YXIgdD1mdW5jdGlvbihlLHQpe3RoaXMuaW5pdChcInBvcG92ZXJcIixlLHQpfTt0LnByb3RvdHlwZT1lLmV4dGVuZCh7fSxlLmZuLnRvb2x0aXAuQ29uc3RydWN0b3IucHJvdG90eXBlLHtjb25zdHJ1Y3Rvcjp0LHNldENvbnRlbnQ6ZnVuY3Rpb24oKXt2YXIgZT10aGlzLnRpcCgpLHQ9dGhpcy5nZXRUaXRsZSgpLG49dGhpcy5nZXRDb250ZW50KCk7ZS5maW5kKFwiLnBvcG92ZXItdGl0bGVcIilbdGhpcy5vcHRpb25zLmh0bWw/XCJodG1sXCI6XCJ0ZXh0XCJdKHQpLGUuZmluZChcIi5wb3BvdmVyLWNvbnRlbnRcIilbdGhpcy5vcHRpb25zLmh0bWw/XCJodG1sXCI6XCJ0ZXh0XCJdKG4pLGUucmVtb3ZlQ2xhc3MoXCJmYWRlIHRvcCBib3R0b20gbGVmdCByaWdodCBpblwiKX0saGFzQ29udGVudDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmdldFRpdGxlKCl8fHRoaXMuZ2V0Q29udGVudCgpfSxnZXRDb250ZW50OmZ1bmN0aW9uKCl7dmFyIGUsdD10aGlzLiRlbGVtZW50LG49dGhpcy5vcHRpb25zO3JldHVybiBlPSh0eXBlb2Ygbi5jb250ZW50PT1cImZ1bmN0aW9uXCI/bi5jb250ZW50LmNhbGwodFswXSk6bi5jb250ZW50KXx8dC5hdHRyKFwiZGF0YS1jb250ZW50XCIpLGV9LHRpcDpmdW5jdGlvbigpe3JldHVybiB0aGlzLiR0aXB8fCh0aGlzLiR0aXA9ZSh0aGlzLm9wdGlvbnMudGVtcGxhdGUpKSx0aGlzLiR0aXB9LGRlc3Ryb3k6ZnVuY3Rpb24oKXt0aGlzLmhpZGUoKS4kZWxlbWVudC5vZmYoXCIuXCIrdGhpcy50eXBlKS5yZW1vdmVEYXRhKHRoaXMudHlwZSl9fSk7dmFyIG49ZS5mbi5wb3BvdmVyO2UuZm4ucG9wb3Zlcj1mdW5jdGlvbihuKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHI9ZSh0aGlzKSxpPXIuZGF0YShcInBvcG92ZXJcIikscz10eXBlb2Ygbj09XCJvYmplY3RcIiYmbjtpfHxyLmRhdGEoXCJwb3BvdmVyXCIsaT1uZXcgdCh0aGlzLHMpKSx0eXBlb2Ygbj09XCJzdHJpbmdcIiYmaVtuXSgpfSl9LGUuZm4ucG9wb3Zlci5Db25zdHJ1Y3Rvcj10LGUuZm4ucG9wb3Zlci5kZWZhdWx0cz1lLmV4dGVuZCh7fSxlLmZuLnRvb2x0aXAuZGVmYXVsdHMse3BsYWNlbWVudDpcInJpZ2h0XCIsdHJpZ2dlcjpcImNsaWNrXCIsY29udGVudDpcIlwiLHRlbXBsYXRlOic8ZGl2IGNsYXNzPVwicG9wb3ZlclwiPjxkaXYgY2xhc3M9XCJhcnJvd1wiPjwvZGl2PjxoMyBjbGFzcz1cInBvcG92ZXItdGl0bGVcIj48L2gzPjxkaXYgY2xhc3M9XCJwb3BvdmVyLWNvbnRlbnRcIj48L2Rpdj48L2Rpdj4nfSksZS5mbi5wb3BvdmVyLm5vQ29uZmxpY3Q9ZnVuY3Rpb24oKXtyZXR1cm4gZS5mbi5wb3BvdmVyPW4sdGhpc319KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiB0KHQsbil7dmFyIHI9ZS5wcm94eSh0aGlzLnByb2Nlc3MsdGhpcyksaT1lKHQpLmlzKFwiYm9keVwiKT9lKHdpbmRvdyk6ZSh0KSxzO3RoaXMub3B0aW9ucz1lLmV4dGVuZCh7fSxlLmZuLnNjcm9sbHNweS5kZWZhdWx0cyxuKSx0aGlzLiRzY3JvbGxFbGVtZW50PWkub24oXCJzY3JvbGwuc2Nyb2xsLXNweS5kYXRhLWFwaVwiLHIpLHRoaXMuc2VsZWN0b3I9KHRoaXMub3B0aW9ucy50YXJnZXR8fChzPWUodCkuYXR0cihcImhyZWZcIikpJiZzLnJlcGxhY2UoLy4qKD89I1teXFxzXSskKS8sXCJcIil8fFwiXCIpK1wiIC5uYXYgbGkgPiBhXCIsdGhpcy4kYm9keT1lKFwiYm9keVwiKSx0aGlzLnJlZnJlc2goKSx0aGlzLnByb2Nlc3MoKX10LnByb3RvdHlwZT17Y29uc3RydWN0b3I6dCxyZWZyZXNoOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcyxuO3RoaXMub2Zmc2V0cz1lKFtdKSx0aGlzLnRhcmdldHM9ZShbXSksbj10aGlzLiRib2R5LmZpbmQodGhpcy5zZWxlY3RvcikubWFwKGZ1bmN0aW9uKCl7dmFyIG49ZSh0aGlzKSxyPW4uZGF0YShcInRhcmdldFwiKXx8bi5hdHRyKFwiaHJlZlwiKSxpPS9eI1xcdy8udGVzdChyKSYmZShyKTtyZXR1cm4gaSYmaS5sZW5ndGgmJltbaS5wb3NpdGlvbigpLnRvcCsoIWUuaXNXaW5kb3codC4kc2Nyb2xsRWxlbWVudC5nZXQoMCkpJiZ0LiRzY3JvbGxFbGVtZW50LnNjcm9sbFRvcCgpKSxyXV18fG51bGx9KS5zb3J0KGZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF0tdFswXX0pLmVhY2goZnVuY3Rpb24oKXt0Lm9mZnNldHMucHVzaCh0aGlzWzBdKSx0LnRhcmdldHMucHVzaCh0aGlzWzFdKX0pfSxwcm9jZXNzOmZ1bmN0aW9uKCl7dmFyIGU9dGhpcy4kc2Nyb2xsRWxlbWVudC5zY3JvbGxUb3AoKSt0aGlzLm9wdGlvbnMub2Zmc2V0LHQ9dGhpcy4kc2Nyb2xsRWxlbWVudFswXS5zY3JvbGxIZWlnaHR8fHRoaXMuJGJvZHlbMF0uc2Nyb2xsSGVpZ2h0LG49dC10aGlzLiRzY3JvbGxFbGVtZW50LmhlaWdodCgpLHI9dGhpcy5vZmZzZXRzLGk9dGhpcy50YXJnZXRzLHM9dGhpcy5hY3RpdmVUYXJnZXQsbztpZihlPj1uKXJldHVybiBzIT0obz1pLmxhc3QoKVswXSkmJnRoaXMuYWN0aXZhdGUobyk7Zm9yKG89ci5sZW5ndGg7by0tOylzIT1pW29dJiZlPj1yW29dJiYoIXJbbysxXXx8ZTw9cltvKzFdKSYmdGhpcy5hY3RpdmF0ZShpW29dKX0sYWN0aXZhdGU6ZnVuY3Rpb24odCl7dmFyIG4scjt0aGlzLmFjdGl2ZVRhcmdldD10LGUodGhpcy5zZWxlY3RvcikucGFyZW50KFwiLmFjdGl2ZVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKSxyPXRoaXMuc2VsZWN0b3IrJ1tkYXRhLXRhcmdldD1cIicrdCsnXCJdLCcrdGhpcy5zZWxlY3RvcisnW2hyZWY9XCInK3QrJ1wiXScsbj1lKHIpLnBhcmVudChcImxpXCIpLmFkZENsYXNzKFwiYWN0aXZlXCIpLG4ucGFyZW50KFwiLmRyb3Bkb3duLW1lbnVcIikubGVuZ3RoJiYobj1uLmNsb3Nlc3QoXCJsaS5kcm9wZG93blwiKS5hZGRDbGFzcyhcImFjdGl2ZVwiKSksbi50cmlnZ2VyKFwiYWN0aXZhdGVcIil9fTt2YXIgbj1lLmZuLnNjcm9sbHNweTtlLmZuLnNjcm9sbHNweT1mdW5jdGlvbihuKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHI9ZSh0aGlzKSxpPXIuZGF0YShcInNjcm9sbHNweVwiKSxzPXR5cGVvZiBuPT1cIm9iamVjdFwiJiZuO2l8fHIuZGF0YShcInNjcm9sbHNweVwiLGk9bmV3IHQodGhpcyxzKSksdHlwZW9mIG49PVwic3RyaW5nXCImJmlbbl0oKX0pfSxlLmZuLnNjcm9sbHNweS5Db25zdHJ1Y3Rvcj10LGUuZm4uc2Nyb2xsc3B5LmRlZmF1bHRzPXtvZmZzZXQ6MTB9LGUuZm4uc2Nyb2xsc3B5Lm5vQ29uZmxpY3Q9ZnVuY3Rpb24oKXtyZXR1cm4gZS5mbi5zY3JvbGxzcHk9bix0aGlzfSxlKHdpbmRvdykub24oXCJsb2FkXCIsZnVuY3Rpb24oKXtlKCdbZGF0YS1zcHk9XCJzY3JvbGxcIl0nKS5lYWNoKGZ1bmN0aW9uKCl7dmFyIHQ9ZSh0aGlzKTt0LnNjcm9sbHNweSh0LmRhdGEoKSl9KX0pfSh3aW5kb3cualF1ZXJ5KSwhZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7dmFyIHQ9ZnVuY3Rpb24odCl7dGhpcy5lbGVtZW50PWUodCl9O3QucHJvdG90eXBlPXtjb25zdHJ1Y3Rvcjp0LHNob3c6ZnVuY3Rpb24oKXt2YXIgdD10aGlzLmVsZW1lbnQsbj10LmNsb3Nlc3QoXCJ1bDpub3QoLmRyb3Bkb3duLW1lbnUpXCIpLHI9dC5hdHRyKFwiZGF0YS10YXJnZXRcIiksaSxzLG87cnx8KHI9dC5hdHRyKFwiaHJlZlwiKSxyPXImJnIucmVwbGFjZSgvLiooPz0jW15cXHNdKiQpLyxcIlwiKSk7aWYodC5wYXJlbnQoXCJsaVwiKS5oYXNDbGFzcyhcImFjdGl2ZVwiKSlyZXR1cm47aT1uLmZpbmQoXCIuYWN0aXZlOmxhc3QgYVwiKVswXSxvPWUuRXZlbnQoXCJzaG93XCIse3JlbGF0ZWRUYXJnZXQ6aX0pLHQudHJpZ2dlcihvKTtpZihvLmlzRGVmYXVsdFByZXZlbnRlZCgpKXJldHVybjtzPWUociksdGhpcy5hY3RpdmF0ZSh0LnBhcmVudChcImxpXCIpLG4pLHRoaXMuYWN0aXZhdGUocyxzLnBhcmVudCgpLGZ1bmN0aW9uKCl7dC50cmlnZ2VyKHt0eXBlOlwic2hvd25cIixyZWxhdGVkVGFyZ2V0Oml9KX0pfSxhY3RpdmF0ZTpmdW5jdGlvbih0LG4scil7ZnVuY3Rpb24gbygpe2kucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIikuZmluZChcIj4gLmRyb3Bkb3duLW1lbnUgPiAuYWN0aXZlXCIpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLHQuYWRkQ2xhc3MoXCJhY3RpdmVcIikscz8odFswXS5vZmZzZXRXaWR0aCx0LmFkZENsYXNzKFwiaW5cIikpOnQucmVtb3ZlQ2xhc3MoXCJmYWRlXCIpLHQucGFyZW50KFwiLmRyb3Bkb3duLW1lbnVcIikmJnQuY2xvc2VzdChcImxpLmRyb3Bkb3duXCIpLmFkZENsYXNzKFwiYWN0aXZlXCIpLHImJnIoKX12YXIgaT1uLmZpbmQoXCI+IC5hY3RpdmVcIikscz1yJiZlLnN1cHBvcnQudHJhbnNpdGlvbiYmaS5oYXNDbGFzcyhcImZhZGVcIik7cz9pLm9uZShlLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsbyk6bygpLGkucmVtb3ZlQ2xhc3MoXCJpblwiKX19O3ZhciBuPWUuZm4udGFiO2UuZm4udGFiPWZ1bmN0aW9uKG4pe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgcj1lKHRoaXMpLGk9ci5kYXRhKFwidGFiXCIpO2l8fHIuZGF0YShcInRhYlwiLGk9bmV3IHQodGhpcykpLHR5cGVvZiBuPT1cInN0cmluZ1wiJiZpW25dKCl9KX0sZS5mbi50YWIuQ29uc3RydWN0b3I9dCxlLmZuLnRhYi5ub0NvbmZsaWN0PWZ1bmN0aW9uKCl7cmV0dXJuIGUuZm4udGFiPW4sdGhpc30sZShkb2N1bWVudCkub24oXCJjbGljay50YWIuZGF0YS1hcGlcIiwnW2RhdGEtdG9nZ2xlPVwidGFiXCJdLCBbZGF0YS10b2dnbGU9XCJwaWxsXCJdJyxmdW5jdGlvbih0KXt0LnByZXZlbnREZWZhdWx0KCksZSh0aGlzKS50YWIoXCJzaG93XCIpfSl9KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjt2YXIgdD1mdW5jdGlvbih0LG4pe3RoaXMuJGVsZW1lbnQ9ZSh0KSx0aGlzLm9wdGlvbnM9ZS5leHRlbmQoe30sZS5mbi50eXBlYWhlYWQuZGVmYXVsdHMsbiksdGhpcy5tYXRjaGVyPXRoaXMub3B0aW9ucy5tYXRjaGVyfHx0aGlzLm1hdGNoZXIsdGhpcy5zb3J0ZXI9dGhpcy5vcHRpb25zLnNvcnRlcnx8dGhpcy5zb3J0ZXIsdGhpcy5oaWdobGlnaHRlcj10aGlzLm9wdGlvbnMuaGlnaGxpZ2h0ZXJ8fHRoaXMuaGlnaGxpZ2h0ZXIsdGhpcy51cGRhdGVyPXRoaXMub3B0aW9ucy51cGRhdGVyfHx0aGlzLnVwZGF0ZXIsdGhpcy5zb3VyY2U9dGhpcy5vcHRpb25zLnNvdXJjZSx0aGlzLiRtZW51PWUodGhpcy5vcHRpb25zLm1lbnUpLHRoaXMuc2hvd249ITEsdGhpcy5saXN0ZW4oKX07dC5wcm90b3R5cGU9e2NvbnN0cnVjdG9yOnQsc2VsZWN0OmZ1bmN0aW9uKCl7dmFyIGU9dGhpcy4kbWVudS5maW5kKFwiLmFjdGl2ZVwiKS5hdHRyKFwiZGF0YS12YWx1ZVwiKTtyZXR1cm4gdGhpcy4kZWxlbWVudC52YWwodGhpcy51cGRhdGVyKGUpKS5jaGFuZ2UoKSx0aGlzLmhpZGUoKX0sdXBkYXRlcjpmdW5jdGlvbihlKXtyZXR1cm4gZX0sc2hvdzpmdW5jdGlvbigpe3ZhciB0PWUuZXh0ZW5kKHt9LHRoaXMuJGVsZW1lbnQucG9zaXRpb24oKSx7aGVpZ2h0OnRoaXMuJGVsZW1lbnRbMF0ub2Zmc2V0SGVpZ2h0fSk7cmV0dXJuIHRoaXMuJG1lbnUuaW5zZXJ0QWZ0ZXIodGhpcy4kZWxlbWVudCkuY3NzKHt0b3A6dC50b3ArdC5oZWlnaHQsbGVmdDp0LmxlZnR9KS5zaG93KCksdGhpcy5zaG93bj0hMCx0aGlzfSxoaWRlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuJG1lbnUuaGlkZSgpLHRoaXMuc2hvd249ITEsdGhpc30sbG9va3VwOmZ1bmN0aW9uKHQpe3ZhciBuO3JldHVybiB0aGlzLnF1ZXJ5PXRoaXMuJGVsZW1lbnQudmFsKCksIXRoaXMucXVlcnl8fHRoaXMucXVlcnkubGVuZ3RoPHRoaXMub3B0aW9ucy5taW5MZW5ndGg/dGhpcy5zaG93bj90aGlzLmhpZGUoKTp0aGlzOihuPWUuaXNGdW5jdGlvbih0aGlzLnNvdXJjZSk/dGhpcy5zb3VyY2UodGhpcy5xdWVyeSxlLnByb3h5KHRoaXMucHJvY2Vzcyx0aGlzKSk6dGhpcy5zb3VyY2Usbj90aGlzLnByb2Nlc3Mobik6dGhpcyl9LHByb2Nlc3M6ZnVuY3Rpb24odCl7dmFyIG49dGhpcztyZXR1cm4gdD1lLmdyZXAodCxmdW5jdGlvbihlKXtyZXR1cm4gbi5tYXRjaGVyKGUpfSksdD10aGlzLnNvcnRlcih0KSx0Lmxlbmd0aD90aGlzLnJlbmRlcih0LnNsaWNlKDAsdGhpcy5vcHRpb25zLml0ZW1zKSkuc2hvdygpOnRoaXMuc2hvd24/dGhpcy5oaWRlKCk6dGhpc30sbWF0Y2hlcjpmdW5jdGlvbihlKXtyZXR1cm5+ZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YodGhpcy5xdWVyeS50b0xvd2VyQ2FzZSgpKX0sc29ydGVyOmZ1bmN0aW9uKGUpe3ZhciB0PVtdLG49W10scj1bXSxpO3doaWxlKGk9ZS5zaGlmdCgpKWkudG9Mb3dlckNhc2UoKS5pbmRleE9mKHRoaXMucXVlcnkudG9Mb3dlckNhc2UoKSk/fmkuaW5kZXhPZih0aGlzLnF1ZXJ5KT9uLnB1c2goaSk6ci5wdXNoKGkpOnQucHVzaChpKTtyZXR1cm4gdC5jb25jYXQobixyKX0saGlnaGxpZ2h0ZXI6ZnVuY3Rpb24oZSl7dmFyIHQ9dGhpcy5xdWVyeS5yZXBsYWNlKC9bXFwtXFxbXFxde30oKSorPy4sXFxcXFxcXiR8I1xcc10vZyxcIlxcXFwkJlwiKTtyZXR1cm4gZS5yZXBsYWNlKG5ldyBSZWdFeHAoXCIoXCIrdCtcIilcIixcImlnXCIpLGZ1bmN0aW9uKGUsdCl7cmV0dXJuXCI8c3Ryb25nPlwiK3QrXCI8L3N0cm9uZz5cIn0pfSxyZW5kZXI6ZnVuY3Rpb24odCl7dmFyIG49dGhpcztyZXR1cm4gdD1lKHQpLm1hcChmdW5jdGlvbih0LHIpe3JldHVybiB0PWUobi5vcHRpb25zLml0ZW0pLmF0dHIoXCJkYXRhLXZhbHVlXCIsciksdC5maW5kKFwiYVwiKS5odG1sKG4uaGlnaGxpZ2h0ZXIocikpLHRbMF19KSx0LmZpcnN0KCkuYWRkQ2xhc3MoXCJhY3RpdmVcIiksdGhpcy4kbWVudS5odG1sKHQpLHRoaXN9LG5leHQ6ZnVuY3Rpb24odCl7dmFyIG49dGhpcy4kbWVudS5maW5kKFwiLmFjdGl2ZVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKSxyPW4ubmV4dCgpO3IubGVuZ3RofHwocj1lKHRoaXMuJG1lbnUuZmluZChcImxpXCIpWzBdKSksci5hZGRDbGFzcyhcImFjdGl2ZVwiKX0scHJldjpmdW5jdGlvbihlKXt2YXIgdD10aGlzLiRtZW51LmZpbmQoXCIuYWN0aXZlXCIpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLG49dC5wcmV2KCk7bi5sZW5ndGh8fChuPXRoaXMuJG1lbnUuZmluZChcImxpXCIpLmxhc3QoKSksbi5hZGRDbGFzcyhcImFjdGl2ZVwiKX0sbGlzdGVuOmZ1bmN0aW9uKCl7dGhpcy4kZWxlbWVudC5vbihcImZvY3VzXCIsZS5wcm94eSh0aGlzLmZvY3VzLHRoaXMpKS5vbihcImJsdXJcIixlLnByb3h5KHRoaXMuYmx1cix0aGlzKSkub24oXCJrZXlwcmVzc1wiLGUucHJveHkodGhpcy5rZXlwcmVzcyx0aGlzKSkub24oXCJrZXl1cFwiLGUucHJveHkodGhpcy5rZXl1cCx0aGlzKSksdGhpcy5ldmVudFN1cHBvcnRlZChcImtleWRvd25cIikmJnRoaXMuJGVsZW1lbnQub24oXCJrZXlkb3duXCIsZS5wcm94eSh0aGlzLmtleWRvd24sdGhpcykpLHRoaXMuJG1lbnUub24oXCJjbGlja1wiLGUucHJveHkodGhpcy5jbGljayx0aGlzKSkub24oXCJtb3VzZWVudGVyXCIsXCJsaVwiLGUucHJveHkodGhpcy5tb3VzZWVudGVyLHRoaXMpKS5vbihcIm1vdXNlbGVhdmVcIixcImxpXCIsZS5wcm94eSh0aGlzLm1vdXNlbGVhdmUsdGhpcykpfSxldmVudFN1cHBvcnRlZDpmdW5jdGlvbihlKXt2YXIgdD1lIGluIHRoaXMuJGVsZW1lbnQ7cmV0dXJuIHR8fCh0aGlzLiRlbGVtZW50LnNldEF0dHJpYnV0ZShlLFwicmV0dXJuO1wiKSx0PXR5cGVvZiB0aGlzLiRlbGVtZW50W2VdPT1cImZ1bmN0aW9uXCIpLHR9LG1vdmU6ZnVuY3Rpb24oZSl7aWYoIXRoaXMuc2hvd24pcmV0dXJuO3N3aXRjaChlLmtleUNvZGUpe2Nhc2UgOTpjYXNlIDEzOmNhc2UgMjc6ZS5wcmV2ZW50RGVmYXVsdCgpO2JyZWFrO2Nhc2UgMzg6ZS5wcmV2ZW50RGVmYXVsdCgpLHRoaXMucHJldigpO2JyZWFrO2Nhc2UgNDA6ZS5wcmV2ZW50RGVmYXVsdCgpLHRoaXMubmV4dCgpfWUuc3RvcFByb3BhZ2F0aW9uKCl9LGtleWRvd246ZnVuY3Rpb24odCl7dGhpcy5zdXBwcmVzc0tleVByZXNzUmVwZWF0PX5lLmluQXJyYXkodC5rZXlDb2RlLFs0MCwzOCw5LDEzLDI3XSksdGhpcy5tb3ZlKHQpfSxrZXlwcmVzczpmdW5jdGlvbihlKXtpZih0aGlzLnN1cHByZXNzS2V5UHJlc3NSZXBlYXQpcmV0dXJuO3RoaXMubW92ZShlKX0sa2V5dXA6ZnVuY3Rpb24oZSl7c3dpdGNoKGUua2V5Q29kZSl7Y2FzZSA0MDpjYXNlIDM4OmNhc2UgMTY6Y2FzZSAxNzpjYXNlIDE4OmJyZWFrO2Nhc2UgOTpjYXNlIDEzOmlmKCF0aGlzLnNob3duKXJldHVybjt0aGlzLnNlbGVjdCgpO2JyZWFrO2Nhc2UgMjc6aWYoIXRoaXMuc2hvd24pcmV0dXJuO3RoaXMuaGlkZSgpO2JyZWFrO2RlZmF1bHQ6dGhpcy5sb29rdXAoKX1lLnN0b3BQcm9wYWdhdGlvbigpLGUucHJldmVudERlZmF1bHQoKX0sZm9jdXM6ZnVuY3Rpb24oZSl7dGhpcy5mb2N1c2VkPSEwfSxibHVyOmZ1bmN0aW9uKGUpe3RoaXMuZm9jdXNlZD0hMSwhdGhpcy5tb3VzZWRvdmVyJiZ0aGlzLnNob3duJiZ0aGlzLmhpZGUoKX0sY2xpY2s6ZnVuY3Rpb24oZSl7ZS5zdG9wUHJvcGFnYXRpb24oKSxlLnByZXZlbnREZWZhdWx0KCksdGhpcy5zZWxlY3QoKSx0aGlzLiRlbGVtZW50LmZvY3VzKCl9LG1vdXNlZW50ZXI6ZnVuY3Rpb24odCl7dGhpcy5tb3VzZWRvdmVyPSEwLHRoaXMuJG1lbnUuZmluZChcIi5hY3RpdmVcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIiksZSh0LmN1cnJlbnRUYXJnZXQpLmFkZENsYXNzKFwiYWN0aXZlXCIpfSxtb3VzZWxlYXZlOmZ1bmN0aW9uKGUpe3RoaXMubW91c2Vkb3Zlcj0hMSwhdGhpcy5mb2N1c2VkJiZ0aGlzLnNob3duJiZ0aGlzLmhpZGUoKX19O3ZhciBuPWUuZm4udHlwZWFoZWFkO2UuZm4udHlwZWFoZWFkPWZ1bmN0aW9uKG4pe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgcj1lKHRoaXMpLGk9ci5kYXRhKFwidHlwZWFoZWFkXCIpLHM9dHlwZW9mIG49PVwib2JqZWN0XCImJm47aXx8ci5kYXRhKFwidHlwZWFoZWFkXCIsaT1uZXcgdCh0aGlzLHMpKSx0eXBlb2Ygbj09XCJzdHJpbmdcIiYmaVtuXSgpfSl9LGUuZm4udHlwZWFoZWFkLmRlZmF1bHRzPXtzb3VyY2U6W10saXRlbXM6OCxtZW51Oic8dWwgY2xhc3M9XCJ0eXBlYWhlYWQgZHJvcGRvd24tbWVudVwiPjwvdWw+JyxpdGVtOic8bGk+PGEgaHJlZj1cIiNcIj48L2E+PC9saT4nLG1pbkxlbmd0aDoxfSxlLmZuLnR5cGVhaGVhZC5Db25zdHJ1Y3Rvcj10LGUuZm4udHlwZWFoZWFkLm5vQ29uZmxpY3Q9ZnVuY3Rpb24oKXtyZXR1cm4gZS5mbi50eXBlYWhlYWQ9bix0aGlzfSxlKGRvY3VtZW50KS5vbihcImZvY3VzLnR5cGVhaGVhZC5kYXRhLWFwaVwiLCdbZGF0YS1wcm92aWRlPVwidHlwZWFoZWFkXCJdJyxmdW5jdGlvbih0KXt2YXIgbj1lKHRoaXMpO2lmKG4uZGF0YShcInR5cGVhaGVhZFwiKSlyZXR1cm47bi50eXBlYWhlYWQobi5kYXRhKCkpfSl9KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjt2YXIgdD1mdW5jdGlvbih0LG4pe3RoaXMub3B0aW9ucz1lLmV4dGVuZCh7fSxlLmZuLmFmZml4LmRlZmF1bHRzLG4pLHRoaXMuJHdpbmRvdz1lKHdpbmRvdykub24oXCJzY3JvbGwuYWZmaXguZGF0YS1hcGlcIixlLnByb3h5KHRoaXMuY2hlY2tQb3NpdGlvbix0aGlzKSkub24oXCJjbGljay5hZmZpeC5kYXRhLWFwaVwiLGUucHJveHkoZnVuY3Rpb24oKXtzZXRUaW1lb3V0KGUucHJveHkodGhpcy5jaGVja1Bvc2l0aW9uLHRoaXMpLDEpfSx0aGlzKSksdGhpcy4kZWxlbWVudD1lKHQpLHRoaXMuY2hlY2tQb3NpdGlvbigpfTt0LnByb3RvdHlwZS5jaGVja1Bvc2l0aW9uPWZ1bmN0aW9uKCl7aWYoIXRoaXMuJGVsZW1lbnQuaXMoXCI6dmlzaWJsZVwiKSlyZXR1cm47dmFyIHQ9ZShkb2N1bWVudCkuaGVpZ2h0KCksbj10aGlzLiR3aW5kb3cuc2Nyb2xsVG9wKCkscj10aGlzLiRlbGVtZW50Lm9mZnNldCgpLGk9dGhpcy5vcHRpb25zLm9mZnNldCxzPWkuYm90dG9tLG89aS50b3AsdT1cImFmZml4IGFmZml4LXRvcCBhZmZpeC1ib3R0b21cIixhO3R5cGVvZiBpIT1cIm9iamVjdFwiJiYocz1vPWkpLHR5cGVvZiBvPT1cImZ1bmN0aW9uXCImJihvPWkudG9wKCkpLHR5cGVvZiBzPT1cImZ1bmN0aW9uXCImJihzPWkuYm90dG9tKCkpLGE9dGhpcy51bnBpbiE9bnVsbCYmbit0aGlzLnVucGluPD1yLnRvcD8hMTpzIT1udWxsJiZyLnRvcCt0aGlzLiRlbGVtZW50LmhlaWdodCgpPj10LXM/XCJib3R0b21cIjpvIT1udWxsJiZuPD1vP1widG9wXCI6ITE7aWYodGhpcy5hZmZpeGVkPT09YSlyZXR1cm47dGhpcy5hZmZpeGVkPWEsdGhpcy51bnBpbj1hPT1cImJvdHRvbVwiP3IudG9wLW46bnVsbCx0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKHUpLmFkZENsYXNzKFwiYWZmaXhcIisoYT9cIi1cIithOlwiXCIpKX07dmFyIG49ZS5mbi5hZmZpeDtlLmZuLmFmZml4PWZ1bmN0aW9uKG4pe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgcj1lKHRoaXMpLGk9ci5kYXRhKFwiYWZmaXhcIikscz10eXBlb2Ygbj09XCJvYmplY3RcIiYmbjtpfHxyLmRhdGEoXCJhZmZpeFwiLGk9bmV3IHQodGhpcyxzKSksdHlwZW9mIG49PVwic3RyaW5nXCImJmlbbl0oKX0pfSxlLmZuLmFmZml4LkNvbnN0cnVjdG9yPXQsZS5mbi5hZmZpeC5kZWZhdWx0cz17b2Zmc2V0OjB9LGUuZm4uYWZmaXgubm9Db25mbGljdD1mdW5jdGlvbigpe3JldHVybiBlLmZuLmFmZml4PW4sdGhpc30sZSh3aW5kb3cpLm9uKFwibG9hZFwiLGZ1bmN0aW9uKCl7ZSgnW2RhdGEtc3B5PVwiYWZmaXhcIl0nKS5lYWNoKGZ1bmN0aW9uKCl7dmFyIHQ9ZSh0aGlzKSxuPXQuZGF0YSgpO24ub2Zmc2V0PW4ub2Zmc2V0fHx7fSxuLm9mZnNldEJvdHRvbSYmKG4ub2Zmc2V0LmJvdHRvbT1uLm9mZnNldEJvdHRvbSksbi5vZmZzZXRUb3AmJihuLm9mZnNldC50b3A9bi5vZmZzZXRUb3ApLHQuYWZmaXgobil9KX0pfSh3aW5kb3cualF1ZXJ5KTsiLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgICQoXCJpZnJhbWVbc3JjKj1pbnNpZ2l0XVwiKS5jc3MoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcclxuXHJcbiAgICAvKioqKioqKioqKioqKioqKiogV2F5cG9pbnRzICoqKioqKioqKioqKioqKioqKi9cclxuICAgICQoJy53cDEnKS53YXlwb2ludChmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcud3AxJykuYWRkQ2xhc3MoJ2FuaW1hdGVkIGZhZGVJblVwJyk7XHJcbiAgICB9LCB7XHJcbiAgICAgICAgb2Zmc2V0OiAnNzUlJ1xyXG4gICAgfSk7XHJcbiAgICAkKCcud3AyJykud2F5cG9pbnQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnLndwMicpLmFkZENsYXNzKCdhbmltYXRlZCBmYWRlSW5VcCcpO1xyXG4gICAgfSwge1xyXG4gICAgICAgIG9mZnNldDogJzc1JSdcclxuICAgIH0pO1xyXG4gICAgJCgnLndwMycpLndheXBvaW50KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoJy53cDMnKS5hZGRDbGFzcygnYW5pbWF0ZWQgZmFkZUluUmlnaHQnKTtcclxuICAgIH0sIHtcclxuICAgICAgICBvZmZzZXQ6ICc3NSUnXHJcbiAgICB9KTtcclxuICAgICQoJy53cDQnKS53YXlwb2ludChmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcud3A0JykuYWRkQ2xhc3MoJ2FuaW1hdGVkIGZhZGVJblVwJyk7XHJcbiAgICB9LCB7XHJcbiAgICAgICAgb2Zmc2V0OiAnOTUlJ1xyXG4gICAgfSk7XHJcbiAgICAkKCcud3A1Jykud2F5cG9pbnQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnLndwNScpLmFkZENsYXNzKCdhbmltYXRlZCBmYWRlSW5VcCcpO1xyXG4gICAgfSwge1xyXG4gICAgICAgIG9mZnNldDogJzkzJSdcclxuICAgIH0pO1xyXG4gICAgJCgnLndwNicpLndheXBvaW50KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoJy53cDYnKS5hZGRDbGFzcygnYW5pbWF0ZWQgZmFkZUluVXAnKTtcclxuICAgIH0sIHtcclxuICAgICAgICBvZmZzZXQ6ICc5MCUnXHJcbiAgICB9KTtcclxuXHJcbiAgICAvKioqKioqKioqKioqKioqKiogSW5pdGlhdGUgRmxleHNsaWRlciAqKioqKioqKioqKioqKioqKiovXHJcbiAgICAkKCcuZmxleHNsaWRlcicpLmZsZXhzbGlkZXIoe1xyXG4gICAgICAgIGFuaW1hdGlvbjogXCJzbGlkZVwiLFxyXG4gICAgICAgIHNsaWRlc2hvd1NwZWVkOiAxMDAwMCxcclxuICAgICAgICBhbmltYXRpb25EdXJhdGlvbjogNDAwLFxyXG4gICAgICAgIHBhdXNlT25Ib3ZlcjogdHJ1ZVxyXG4gICAgfSk7XHJcblxyXG4gICAgLyoqKioqKioqKioqKioqKioqIEluaXRpYXRlIEZhbmN5Ym94ICoqKioqKioqKioqKioqKioqKi9cclxuICAgICQoJy5zaW5nbGVfaW1hZ2UnKS5mYW5jeWJveCh7XHJcbiAgICAgICAgcGFkZGluZzogNCxcclxuICAgIH0pO1xyXG5cclxuICAgIC8qKioqKioqKioqKioqKioqKiBUb29sdGlwcyAqKioqKioqKioqKioqKioqKiovXHJcbiAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xyXG5cclxuICAgIC8qKioqKioqKioqKioqKioqKiBOYXYgVHJhbnNmb3JtaWNvbiAqKioqKioqKioqKioqKioqKiovXHJcbiAgICAvKiBXaGVuIHVzZXIgY2xpY2tzIHRoZSBJY29uICovXHJcbiAgICAkKCcubmF2LXRvZ2dsZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQodGhpcykudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICQoJy5oZWFkZXItbmF2JykudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfSk7XHJcbiAgICAvKiBXaGVuIHVzZXIgY2xpY2tzIGEgbGluayAqL1xyXG4gICAgJCgnLmhlYWRlci1uYXYgbGkgYScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoJy5uYXYtdG9nZ2xlJykudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICQoJy5oZWFkZXItbmF2JykudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8qKioqKioqKioqKioqKioqKiBIZWFkZXIgQkcgU2Nyb2xsICoqKioqKioqKioqKioqKioqKi9cclxuICAgICQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHNjcm9sbCA9IHtcclxuICAgICAgICAgICAgY29udHJvbDoge1xyXG4gICAgICAgICAgICAgICAgZml4ZWRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCdzZWN0aW9uLm5hdmlnYXRpb24nKS5hZGRDbGFzcygnZml4ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAkKCdzZWN0aW9uLm5hdmlnYXRpb24nKS5yZW1vdmVDbGFzcygnbm90LWZpeGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnaGVhZGVyJykuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJib3JkZXItYm90dG9tXCI6IFwic29saWQgMXB4IHJnYmEoMjU1LCAyNTUsIDI1NSwgMClcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJwYWRkaW5nXCI6IFwiMTBweCAwXCJcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAkKCdoZWFkZXIgLm1lbWJlci1hY3Rpb25zJykuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0b3BcIjogXCIxN3B4XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnaGVhZGVyIC5uYXZpY29uJykuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0b3BcIjogXCIyM3B4XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbm90Zml4ZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJ3NlY3Rpb24ubmF2aWdhdGlvbicpLnJlbW92ZUNsYXNzKCdmaXhlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJ3NlY3Rpb24ubmF2aWdhdGlvbicpLmFkZENsYXNzKCdub3QtZml4ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAkKCdoZWFkZXInKS5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImJvcmRlci1ib3R0b21cIjogXCJzb2xpZCAxcHggcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjIpXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicGFkZGluZ1wiOiBcIjEwcHggMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnaGVhZGVyIC5tZW1iZXItYWN0aW9ucycpLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidG9wXCI6IFwiMTdweFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJ2hlYWRlciAubmF2aWNvbicpLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidG9wXCI6IFwiMjNweFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzY3JvbGwgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzY3JvbGwgPj0gMjApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5maXhlZHMoKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5vdGZpeGVkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSAgIFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGV2ZW50czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW5pdCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykuc2Nyb2xsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmluaXQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2Nyb2xsLmNvbnRyb2wuZXZlbnRzKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvKioqKioqKioqKioqKioqKiogU21vb3RoIFNjcm9sbGluZyAqKioqKioqKioqKioqKioqKiovXHJcbiAgICAkKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoJ2FbaHJlZio9I106bm90KFtocmVmPSNdKScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgaHJlZiA9ICQodGhpcykuYXR0cignaHJlZicpLnJlcGxhY2UoLyMuKiQvLCAnJyk7XHJcbiAgICAgICAgICAgIGlmIChocmVmID09PSAnJykge1xyXG4vLyAgICAgICAgICAgIGlmIChsb2NhdGlvbi5wYXRobmFtZS5yZXBsYWNlKC9eXFwvLywgJycpID09PSB0aGlzLnBhdGhuYW1lLnJlcGxhY2UoL15cXC8vLCAnJykgJiYgbG9jYXRpb24uaG9zdG5hbWUgPT09IHRoaXMuaG9zdG5hbWUpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0YXJnZXQgPSAkKHRoaXMuaGFzaCk7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQubGVuZ3RoID8gdGFyZ2V0IDogJCgnW25hbWU9JyArIHRoaXMuaGFzaC5zbGljZSgxKSArICddJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJ2h0bWwsYm9keScpLmFuaW1hdGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxUb3A6IHRhcmdldC5vZmZzZXQoKS50b3AgLSAkKCcubmF2aWdhdGlvbicpLmhlaWdodCgpXHJcbiAgICAgICAgICAgICAgICAgICAgfSwgMTAwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufSk7IiwiLypcclxuICogalF1ZXJ5IEZsZXhTbGlkZXIgdjIuNS4wXHJcbiAqIENvcHlyaWdodCAyMDEyIFdvb1RoZW1lc1xyXG4gKiBDb250cmlidXRpbmcgQXV0aG9yOiBUeWxlciBTbWl0aFxyXG4gKi8hZnVuY3Rpb24oJCl7JC5mbGV4c2xpZGVyPWZ1bmN0aW9uKGUsdCl7dmFyIGE9JChlKTthLnZhcnM9JC5leHRlbmQoe30sJC5mbGV4c2xpZGVyLmRlZmF1bHRzLHQpO3ZhciBuPWEudmFycy5uYW1lc3BhY2UsaT13aW5kb3cubmF2aWdhdG9yJiZ3aW5kb3cubmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQmJndpbmRvdy5NU0dlc3R1cmUscz0oXCJvbnRvdWNoc3RhcnRcImluIHdpbmRvd3x8aXx8d2luZG93LkRvY3VtZW50VG91Y2gmJmRvY3VtZW50IGluc3RhbmNlb2YgRG9jdW1lbnRUb3VjaCkmJmEudmFycy50b3VjaCxyPVwiY2xpY2sgdG91Y2hlbmQgTVNQb2ludGVyVXAga2V5dXBcIixvPVwiXCIsbCxjPVwidmVydGljYWxcIj09PWEudmFycy5kaXJlY3Rpb24sZD1hLnZhcnMucmV2ZXJzZSx1PWEudmFycy5pdGVtV2lkdGg+MCx2PVwiZmFkZVwiPT09YS52YXJzLmFuaW1hdGlvbixwPVwiXCIhPT1hLnZhcnMuYXNOYXZGb3IsbT17fSxmPSEwOyQuZGF0YShlLFwiZmxleHNsaWRlclwiLGEpLG09e2luaXQ6ZnVuY3Rpb24oKXthLmFuaW1hdGluZz0hMSxhLmN1cnJlbnRTbGlkZT1wYXJzZUludChhLnZhcnMuc3RhcnRBdD9hLnZhcnMuc3RhcnRBdDowLDEwKSxpc05hTihhLmN1cnJlbnRTbGlkZSkmJihhLmN1cnJlbnRTbGlkZT0wKSxhLmFuaW1hdGluZ1RvPWEuY3VycmVudFNsaWRlLGEuYXRFbmQ9MD09PWEuY3VycmVudFNsaWRlfHxhLmN1cnJlbnRTbGlkZT09PWEubGFzdCxhLmNvbnRhaW5lclNlbGVjdG9yPWEudmFycy5zZWxlY3Rvci5zdWJzdHIoMCxhLnZhcnMuc2VsZWN0b3Iuc2VhcmNoKFwiIFwiKSksYS5zbGlkZXM9JChhLnZhcnMuc2VsZWN0b3IsYSksYS5jb250YWluZXI9JChhLmNvbnRhaW5lclNlbGVjdG9yLGEpLGEuY291bnQ9YS5zbGlkZXMubGVuZ3RoLGEuc3luY0V4aXN0cz0kKGEudmFycy5zeW5jKS5sZW5ndGg+MCxcInNsaWRlXCI9PT1hLnZhcnMuYW5pbWF0aW9uJiYoYS52YXJzLmFuaW1hdGlvbj1cInN3aW5nXCIpLGEucHJvcD1jP1widG9wXCI6XCJtYXJnaW5MZWZ0XCIsYS5hcmdzPXt9LGEubWFudWFsUGF1c2U9ITEsYS5zdG9wcGVkPSExLGEuc3RhcnRlZD0hMSxhLnN0YXJ0VGltZW91dD1udWxsLGEudHJhbnNpdGlvbnM9IWEudmFycy52aWRlbyYmIXYmJmEudmFycy51c2VDU1MmJmZ1bmN0aW9uKCl7dmFyIGU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSx0PVtcInBlcnNwZWN0aXZlUHJvcGVydHlcIixcIldlYmtpdFBlcnNwZWN0aXZlXCIsXCJNb3pQZXJzcGVjdGl2ZVwiLFwiT1BlcnNwZWN0aXZlXCIsXCJtc1BlcnNwZWN0aXZlXCJdO2Zvcih2YXIgbiBpbiB0KWlmKHZvaWQgMCE9PWUuc3R5bGVbdFtuXV0pcmV0dXJuIGEucGZ4PXRbbl0ucmVwbGFjZShcIlBlcnNwZWN0aXZlXCIsXCJcIikudG9Mb3dlckNhc2UoKSxhLnByb3A9XCItXCIrYS5wZngrXCItdHJhbnNmb3JtXCIsITA7cmV0dXJuITF9KCksYS5lbnN1cmVBbmltYXRpb25FbmQ9XCJcIixcIlwiIT09YS52YXJzLmNvbnRyb2xzQ29udGFpbmVyJiYoYS5jb250cm9sc0NvbnRhaW5lcj0kKGEudmFycy5jb250cm9sc0NvbnRhaW5lcikubGVuZ3RoPjAmJiQoYS52YXJzLmNvbnRyb2xzQ29udGFpbmVyKSksXCJcIiE9PWEudmFycy5tYW51YWxDb250cm9scyYmKGEubWFudWFsQ29udHJvbHM9JChhLnZhcnMubWFudWFsQ29udHJvbHMpLmxlbmd0aD4wJiYkKGEudmFycy5tYW51YWxDb250cm9scykpLFwiXCIhPT1hLnZhcnMuY3VzdG9tRGlyZWN0aW9uTmF2JiYoYS5jdXN0b21EaXJlY3Rpb25OYXY9Mj09PSQoYS52YXJzLmN1c3RvbURpcmVjdGlvbk5hdikubGVuZ3RoJiYkKGEudmFycy5jdXN0b21EaXJlY3Rpb25OYXYpKSxhLnZhcnMucmFuZG9taXplJiYoYS5zbGlkZXMuc29ydChmdW5jdGlvbigpe3JldHVybiBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkpLS41fSksYS5jb250YWluZXIuZW1wdHkoKS5hcHBlbmQoYS5zbGlkZXMpKSxhLmRvTWF0aCgpLGEuc2V0dXAoXCJpbml0XCIpLGEudmFycy5jb250cm9sTmF2JiZtLmNvbnRyb2xOYXYuc2V0dXAoKSxhLnZhcnMuZGlyZWN0aW9uTmF2JiZtLmRpcmVjdGlvbk5hdi5zZXR1cCgpLGEudmFycy5rZXlib2FyZCYmKDE9PT0kKGEuY29udGFpbmVyU2VsZWN0b3IpLmxlbmd0aHx8YS52YXJzLm11bHRpcGxlS2V5Ym9hcmQpJiYkKGRvY3VtZW50KS5iaW5kKFwia2V5dXBcIixmdW5jdGlvbihlKXt2YXIgdD1lLmtleUNvZGU7aWYoIWEuYW5pbWF0aW5nJiYoMzk9PT10fHwzNz09PXQpKXt2YXIgbj0zOT09PXQ/YS5nZXRUYXJnZXQoXCJuZXh0XCIpOjM3PT09dD9hLmdldFRhcmdldChcInByZXZcIik6ITE7YS5mbGV4QW5pbWF0ZShuLGEudmFycy5wYXVzZU9uQWN0aW9uKX19KSxhLnZhcnMubW91c2V3aGVlbCYmYS5iaW5kKFwibW91c2V3aGVlbFwiLGZ1bmN0aW9uKGUsdCxuLGkpe2UucHJldmVudERlZmF1bHQoKTt2YXIgcz1hLmdldFRhcmdldCgwPnQ/XCJuZXh0XCI6XCJwcmV2XCIpO2EuZmxleEFuaW1hdGUocyxhLnZhcnMucGF1c2VPbkFjdGlvbil9KSxhLnZhcnMucGF1c2VQbGF5JiZtLnBhdXNlUGxheS5zZXR1cCgpLGEudmFycy5zbGlkZXNob3cmJmEudmFycy5wYXVzZUludmlzaWJsZSYmbS5wYXVzZUludmlzaWJsZS5pbml0KCksYS52YXJzLnNsaWRlc2hvdyYmKGEudmFycy5wYXVzZU9uSG92ZXImJmEuaG92ZXIoZnVuY3Rpb24oKXthLm1hbnVhbFBsYXl8fGEubWFudWFsUGF1c2V8fGEucGF1c2UoKX0sZnVuY3Rpb24oKXthLm1hbnVhbFBhdXNlfHxhLm1hbnVhbFBsYXl8fGEuc3RvcHBlZHx8YS5wbGF5KCl9KSxhLnZhcnMucGF1c2VJbnZpc2libGUmJm0ucGF1c2VJbnZpc2libGUuaXNIaWRkZW4oKXx8KGEudmFycy5pbml0RGVsYXk+MD9hLnN0YXJ0VGltZW91dD1zZXRUaW1lb3V0KGEucGxheSxhLnZhcnMuaW5pdERlbGF5KTphLnBsYXkoKSkpLHAmJm0uYXNOYXYuc2V0dXAoKSxzJiZhLnZhcnMudG91Y2gmJm0udG91Y2goKSwoIXZ8fHYmJmEudmFycy5zbW9vdGhIZWlnaHQpJiYkKHdpbmRvdykuYmluZChcInJlc2l6ZSBvcmllbnRhdGlvbmNoYW5nZSBmb2N1c1wiLG0ucmVzaXplKSxhLmZpbmQoXCJpbWdcIikuYXR0cihcImRyYWdnYWJsZVwiLFwiZmFsc2VcIiksc2V0VGltZW91dChmdW5jdGlvbigpe2EudmFycy5zdGFydChhKX0sMjAwKX0sYXNOYXY6e3NldHVwOmZ1bmN0aW9uKCl7YS5hc05hdj0hMCxhLmFuaW1hdGluZ1RvPU1hdGguZmxvb3IoYS5jdXJyZW50U2xpZGUvYS5tb3ZlKSxhLmN1cnJlbnRJdGVtPWEuY3VycmVudFNsaWRlLGEuc2xpZGVzLnJlbW92ZUNsYXNzKG4rXCJhY3RpdmUtc2xpZGVcIikuZXEoYS5jdXJyZW50SXRlbSkuYWRkQ2xhc3MobitcImFjdGl2ZS1zbGlkZVwiKSxpPyhlLl9zbGlkZXI9YSxhLnNsaWRlcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIGU9dGhpcztlLl9nZXN0dXJlPW5ldyBNU0dlc3R1cmUsZS5fZ2VzdHVyZS50YXJnZXQ9ZSxlLmFkZEV2ZW50TGlzdGVuZXIoXCJNU1BvaW50ZXJEb3duXCIsZnVuY3Rpb24oZSl7ZS5wcmV2ZW50RGVmYXVsdCgpLGUuY3VycmVudFRhcmdldC5fZ2VzdHVyZSYmZS5jdXJyZW50VGFyZ2V0Ll9nZXN0dXJlLmFkZFBvaW50ZXIoZS5wb2ludGVySWQpfSwhMSksZS5hZGRFdmVudExpc3RlbmVyKFwiTVNHZXN0dXJlVGFwXCIsZnVuY3Rpb24oZSl7ZS5wcmV2ZW50RGVmYXVsdCgpO3ZhciB0PSQodGhpcyksbj10LmluZGV4KCk7JChhLnZhcnMuYXNOYXZGb3IpLmRhdGEoXCJmbGV4c2xpZGVyXCIpLmFuaW1hdGluZ3x8dC5oYXNDbGFzcyhcImFjdGl2ZVwiKXx8KGEuZGlyZWN0aW9uPWEuY3VycmVudEl0ZW08bj9cIm5leHRcIjpcInByZXZcIixhLmZsZXhBbmltYXRlKG4sYS52YXJzLnBhdXNlT25BY3Rpb24sITEsITAsITApKX0pfSkpOmEuc2xpZGVzLm9uKHIsZnVuY3Rpb24oZSl7ZS5wcmV2ZW50RGVmYXVsdCgpO3ZhciB0PSQodGhpcyksaT10LmluZGV4KCkscz10Lm9mZnNldCgpLmxlZnQtJChhKS5zY3JvbGxMZWZ0KCk7MD49cyYmdC5oYXNDbGFzcyhuK1wiYWN0aXZlLXNsaWRlXCIpP2EuZmxleEFuaW1hdGUoYS5nZXRUYXJnZXQoXCJwcmV2XCIpLCEwKTokKGEudmFycy5hc05hdkZvcikuZGF0YShcImZsZXhzbGlkZXJcIikuYW5pbWF0aW5nfHx0Lmhhc0NsYXNzKG4rXCJhY3RpdmUtc2xpZGVcIil8fChhLmRpcmVjdGlvbj1hLmN1cnJlbnRJdGVtPGk/XCJuZXh0XCI6XCJwcmV2XCIsYS5mbGV4QW5pbWF0ZShpLGEudmFycy5wYXVzZU9uQWN0aW9uLCExLCEwLCEwKSl9KX19LGNvbnRyb2xOYXY6e3NldHVwOmZ1bmN0aW9uKCl7YS5tYW51YWxDb250cm9scz9tLmNvbnRyb2xOYXYuc2V0dXBNYW51YWwoKTptLmNvbnRyb2xOYXYuc2V0dXBQYWdpbmcoKX0sc2V0dXBQYWdpbmc6ZnVuY3Rpb24oKXt2YXIgZT1cInRodW1ibmFpbHNcIj09PWEudmFycy5jb250cm9sTmF2P1wiY29udHJvbC10aHVtYnNcIjpcImNvbnRyb2wtcGFnaW5nXCIsdD0xLGkscztpZihhLmNvbnRyb2xOYXZTY2FmZm9sZD0kKCc8b2wgY2xhc3M9XCInK24rXCJjb250cm9sLW5hdiBcIituK2UrJ1wiPjwvb2w+JyksYS5wYWdpbmdDb3VudD4xKWZvcih2YXIgbD0wO2w8YS5wYWdpbmdDb3VudDtsKyspe2lmKHM9YS5zbGlkZXMuZXEobCksaT1cInRodW1ibmFpbHNcIj09PWEudmFycy5jb250cm9sTmF2Pyc8aW1nIHNyYz1cIicrcy5hdHRyKFwiZGF0YS10aHVtYlwiKSsnXCIvPic6XCI8YT5cIit0K1wiPC9hPlwiLFwidGh1bWJuYWlsc1wiPT09YS52YXJzLmNvbnRyb2xOYXYmJiEwPT09YS52YXJzLnRodW1iQ2FwdGlvbnMpe3ZhciBjPXMuYXR0cihcImRhdGEtdGh1bWJjYXB0aW9uXCIpO1wiXCIhPT1jJiZ2b2lkIDAhPT1jJiYoaSs9JzxzcGFuIGNsYXNzPVwiJytuKydjYXB0aW9uXCI+JytjK1wiPC9zcGFuPlwiKX1hLmNvbnRyb2xOYXZTY2FmZm9sZC5hcHBlbmQoXCI8bGk+XCIraStcIjwvbGk+XCIpLHQrK31hLmNvbnRyb2xzQ29udGFpbmVyPyQoYS5jb250cm9sc0NvbnRhaW5lcikuYXBwZW5kKGEuY29udHJvbE5hdlNjYWZmb2xkKTphLmFwcGVuZChhLmNvbnRyb2xOYXZTY2FmZm9sZCksbS5jb250cm9sTmF2LnNldCgpLG0uY29udHJvbE5hdi5hY3RpdmUoKSxhLmNvbnRyb2xOYXZTY2FmZm9sZC5kZWxlZ2F0ZShcImEsIGltZ1wiLHIsZnVuY3Rpb24oZSl7aWYoZS5wcmV2ZW50RGVmYXVsdCgpLFwiXCI9PT1vfHxvPT09ZS50eXBlKXt2YXIgdD0kKHRoaXMpLGk9YS5jb250cm9sTmF2LmluZGV4KHQpO3QuaGFzQ2xhc3MobitcImFjdGl2ZVwiKXx8KGEuZGlyZWN0aW9uPWk+YS5jdXJyZW50U2xpZGU/XCJuZXh0XCI6XCJwcmV2XCIsYS5mbGV4QW5pbWF0ZShpLGEudmFycy5wYXVzZU9uQWN0aW9uKSl9XCJcIj09PW8mJihvPWUudHlwZSksbS5zZXRUb0NsZWFyV2F0Y2hlZEV2ZW50KCl9KX0sc2V0dXBNYW51YWw6ZnVuY3Rpb24oKXthLmNvbnRyb2xOYXY9YS5tYW51YWxDb250cm9scyxtLmNvbnRyb2xOYXYuYWN0aXZlKCksYS5jb250cm9sTmF2LmJpbmQocixmdW5jdGlvbihlKXtpZihlLnByZXZlbnREZWZhdWx0KCksXCJcIj09PW98fG89PT1lLnR5cGUpe3ZhciB0PSQodGhpcyksaT1hLmNvbnRyb2xOYXYuaW5kZXgodCk7dC5oYXNDbGFzcyhuK1wiYWN0aXZlXCIpfHwoYS5kaXJlY3Rpb249aT5hLmN1cnJlbnRTbGlkZT9cIm5leHRcIjpcInByZXZcIixhLmZsZXhBbmltYXRlKGksYS52YXJzLnBhdXNlT25BY3Rpb24pKX1cIlwiPT09byYmKG89ZS50eXBlKSxtLnNldFRvQ2xlYXJXYXRjaGVkRXZlbnQoKX0pfSxzZXQ6ZnVuY3Rpb24oKXt2YXIgZT1cInRodW1ibmFpbHNcIj09PWEudmFycy5jb250cm9sTmF2P1wiaW1nXCI6XCJhXCI7YS5jb250cm9sTmF2PSQoXCIuXCIrbitcImNvbnRyb2wtbmF2IGxpIFwiK2UsYS5jb250cm9sc0NvbnRhaW5lcj9hLmNvbnRyb2xzQ29udGFpbmVyOmEpfSxhY3RpdmU6ZnVuY3Rpb24oKXthLmNvbnRyb2xOYXYucmVtb3ZlQ2xhc3MobitcImFjdGl2ZVwiKS5lcShhLmFuaW1hdGluZ1RvKS5hZGRDbGFzcyhuK1wiYWN0aXZlXCIpfSx1cGRhdGU6ZnVuY3Rpb24oZSx0KXthLnBhZ2luZ0NvdW50PjEmJlwiYWRkXCI9PT1lP2EuY29udHJvbE5hdlNjYWZmb2xkLmFwcGVuZCgkKFwiPGxpPjxhPlwiK2EuY291bnQrXCI8L2E+PC9saT5cIikpOjE9PT1hLnBhZ2luZ0NvdW50P2EuY29udHJvbE5hdlNjYWZmb2xkLmZpbmQoXCJsaVwiKS5yZW1vdmUoKTphLmNvbnRyb2xOYXYuZXEodCkuY2xvc2VzdChcImxpXCIpLnJlbW92ZSgpLG0uY29udHJvbE5hdi5zZXQoKSxhLnBhZ2luZ0NvdW50PjEmJmEucGFnaW5nQ291bnQhPT1hLmNvbnRyb2xOYXYubGVuZ3RoP2EudXBkYXRlKHQsZSk6bS5jb250cm9sTmF2LmFjdGl2ZSgpfX0sZGlyZWN0aW9uTmF2OntzZXR1cDpmdW5jdGlvbigpe3ZhciBlPSQoJzx1bCBjbGFzcz1cIicrbisnZGlyZWN0aW9uLW5hdlwiPjxsaSBjbGFzcz1cIicrbisnbmF2LXByZXZcIj48YSBjbGFzcz1cIicrbisncHJldlwiIGhyZWY9XCIjXCI+JythLnZhcnMucHJldlRleHQrJzwvYT48L2xpPjxsaSBjbGFzcz1cIicrbisnbmF2LW5leHRcIj48YSBjbGFzcz1cIicrbisnbmV4dFwiIGhyZWY9XCIjXCI+JythLnZhcnMubmV4dFRleHQrXCI8L2E+PC9saT48L3VsPlwiKTthLmN1c3RvbURpcmVjdGlvbk5hdj9hLmRpcmVjdGlvbk5hdj1hLmN1c3RvbURpcmVjdGlvbk5hdjphLmNvbnRyb2xzQ29udGFpbmVyPygkKGEuY29udHJvbHNDb250YWluZXIpLmFwcGVuZChlKSxhLmRpcmVjdGlvbk5hdj0kKFwiLlwiK24rXCJkaXJlY3Rpb24tbmF2IGxpIGFcIixhLmNvbnRyb2xzQ29udGFpbmVyKSk6KGEuYXBwZW5kKGUpLGEuZGlyZWN0aW9uTmF2PSQoXCIuXCIrbitcImRpcmVjdGlvbi1uYXYgbGkgYVwiLGEpKSxtLmRpcmVjdGlvbk5hdi51cGRhdGUoKSxhLmRpcmVjdGlvbk5hdi5iaW5kKHIsZnVuY3Rpb24oZSl7ZS5wcmV2ZW50RGVmYXVsdCgpO3ZhciB0OyhcIlwiPT09b3x8bz09PWUudHlwZSkmJih0PWEuZ2V0VGFyZ2V0KCQodGhpcykuaGFzQ2xhc3MobitcIm5leHRcIik/XCJuZXh0XCI6XCJwcmV2XCIpLGEuZmxleEFuaW1hdGUodCxhLnZhcnMucGF1c2VPbkFjdGlvbikpLFwiXCI9PT1vJiYobz1lLnR5cGUpLG0uc2V0VG9DbGVhcldhdGNoZWRFdmVudCgpfSl9LHVwZGF0ZTpmdW5jdGlvbigpe3ZhciBlPW4rXCJkaXNhYmxlZFwiOzE9PT1hLnBhZ2luZ0NvdW50P2EuZGlyZWN0aW9uTmF2LmFkZENsYXNzKGUpLmF0dHIoXCJ0YWJpbmRleFwiLFwiLTFcIik6YS52YXJzLmFuaW1hdGlvbkxvb3A/YS5kaXJlY3Rpb25OYXYucmVtb3ZlQ2xhc3MoZSkucmVtb3ZlQXR0cihcInRhYmluZGV4XCIpOjA9PT1hLmFuaW1hdGluZ1RvP2EuZGlyZWN0aW9uTmF2LnJlbW92ZUNsYXNzKGUpLmZpbHRlcihcIi5cIituK1wicHJldlwiKS5hZGRDbGFzcyhlKS5hdHRyKFwidGFiaW5kZXhcIixcIi0xXCIpOmEuYW5pbWF0aW5nVG89PT1hLmxhc3Q/YS5kaXJlY3Rpb25OYXYucmVtb3ZlQ2xhc3MoZSkuZmlsdGVyKFwiLlwiK24rXCJuZXh0XCIpLmFkZENsYXNzKGUpLmF0dHIoXCJ0YWJpbmRleFwiLFwiLTFcIik6YS5kaXJlY3Rpb25OYXYucmVtb3ZlQ2xhc3MoZSkucmVtb3ZlQXR0cihcInRhYmluZGV4XCIpfX0scGF1c2VQbGF5OntzZXR1cDpmdW5jdGlvbigpe3ZhciBlPSQoJzxkaXYgY2xhc3M9XCInK24rJ3BhdXNlcGxheVwiPjxhPjwvYT48L2Rpdj4nKTthLmNvbnRyb2xzQ29udGFpbmVyPyhhLmNvbnRyb2xzQ29udGFpbmVyLmFwcGVuZChlKSxhLnBhdXNlUGxheT0kKFwiLlwiK24rXCJwYXVzZXBsYXkgYVwiLGEuY29udHJvbHNDb250YWluZXIpKTooYS5hcHBlbmQoZSksYS5wYXVzZVBsYXk9JChcIi5cIituK1wicGF1c2VwbGF5IGFcIixhKSksbS5wYXVzZVBsYXkudXBkYXRlKGEudmFycy5zbGlkZXNob3c/bitcInBhdXNlXCI6bitcInBsYXlcIiksYS5wYXVzZVBsYXkuYmluZChyLGZ1bmN0aW9uKGUpe2UucHJldmVudERlZmF1bHQoKSwoXCJcIj09PW98fG89PT1lLnR5cGUpJiYoJCh0aGlzKS5oYXNDbGFzcyhuK1wicGF1c2VcIik/KGEubWFudWFsUGF1c2U9ITAsYS5tYW51YWxQbGF5PSExLGEucGF1c2UoKSk6KGEubWFudWFsUGF1c2U9ITEsYS5tYW51YWxQbGF5PSEwLGEucGxheSgpKSksXCJcIj09PW8mJihvPWUudHlwZSksbS5zZXRUb0NsZWFyV2F0Y2hlZEV2ZW50KCl9KX0sdXBkYXRlOmZ1bmN0aW9uKGUpe1wicGxheVwiPT09ZT9hLnBhdXNlUGxheS5yZW1vdmVDbGFzcyhuK1wicGF1c2VcIikuYWRkQ2xhc3MobitcInBsYXlcIikuaHRtbChhLnZhcnMucGxheVRleHQpOmEucGF1c2VQbGF5LnJlbW92ZUNsYXNzKG4rXCJwbGF5XCIpLmFkZENsYXNzKG4rXCJwYXVzZVwiKS5odG1sKGEudmFycy5wYXVzZVRleHQpfX0sdG91Y2g6ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KHQpe3Quc3RvcFByb3BhZ2F0aW9uKCksYS5hbmltYXRpbmc/dC5wcmV2ZW50RGVmYXVsdCgpOihhLnBhdXNlKCksZS5fZ2VzdHVyZS5hZGRQb2ludGVyKHQucG9pbnRlcklkKSx3PTAscD1jP2EuaDphLncsZj1OdW1iZXIobmV3IERhdGUpLGw9dSYmZCYmYS5hbmltYXRpbmdUbz09PWEubGFzdD8wOnUmJmQ/YS5saW1pdC0oYS5pdGVtVythLnZhcnMuaXRlbU1hcmdpbikqYS5tb3ZlKmEuYW5pbWF0aW5nVG86dSYmYS5jdXJyZW50U2xpZGU9PT1hLmxhc3Q/YS5saW1pdDp1PyhhLml0ZW1XK2EudmFycy5pdGVtTWFyZ2luKSphLm1vdmUqYS5jdXJyZW50U2xpZGU6ZD8oYS5sYXN0LWEuY3VycmVudFNsaWRlK2EuY2xvbmVPZmZzZXQpKnA6KGEuY3VycmVudFNsaWRlK2EuY2xvbmVPZmZzZXQpKnApfWZ1bmN0aW9uIG4odCl7dC5zdG9wUHJvcGFnYXRpb24oKTt2YXIgYT10LnRhcmdldC5fc2xpZGVyO2lmKGEpe3ZhciBuPS10LnRyYW5zbGF0aW9uWCxpPS10LnRyYW5zbGF0aW9uWTtyZXR1cm4gdys9Yz9pOm4sbT13LHk9Yz9NYXRoLmFicyh3KTxNYXRoLmFicygtbik6TWF0aC5hYnModyk8TWF0aC5hYnMoLWkpLHQuZGV0YWlsPT09dC5NU0dFU1RVUkVfRkxBR19JTkVSVElBP3ZvaWQgc2V0SW1tZWRpYXRlKGZ1bmN0aW9uKCl7ZS5fZ2VzdHVyZS5zdG9wKCl9KTp2b2lkKCgheXx8TnVtYmVyKG5ldyBEYXRlKS1mPjUwMCkmJih0LnByZXZlbnREZWZhdWx0KCksIXYmJmEudHJhbnNpdGlvbnMmJihhLnZhcnMuYW5pbWF0aW9uTG9vcHx8KG09dy8oMD09PWEuY3VycmVudFNsaWRlJiYwPnd8fGEuY3VycmVudFNsaWRlPT09YS5sYXN0JiZ3PjA/TWF0aC5hYnModykvcCsyOjEpKSxhLnNldFByb3BzKGwrbSxcInNldFRvdWNoXCIpKSkpfX1mdW5jdGlvbiBzKGUpe2Uuc3RvcFByb3BhZ2F0aW9uKCk7dmFyIHQ9ZS50YXJnZXQuX3NsaWRlcjtpZih0KXtpZih0LmFuaW1hdGluZ1RvPT09dC5jdXJyZW50U2xpZGUmJiF5JiZudWxsIT09bSl7dmFyIGE9ZD8tbTptLG49dC5nZXRUYXJnZXQoYT4wP1wibmV4dFwiOlwicHJldlwiKTt0LmNhbkFkdmFuY2UobikmJihOdW1iZXIobmV3IERhdGUpLWY8NTUwJiZNYXRoLmFicyhhKT41MHx8TWF0aC5hYnMoYSk+cC8yKT90LmZsZXhBbmltYXRlKG4sdC52YXJzLnBhdXNlT25BY3Rpb24pOnZ8fHQuZmxleEFuaW1hdGUodC5jdXJyZW50U2xpZGUsdC52YXJzLnBhdXNlT25BY3Rpb24sITApfXI9bnVsbCxvPW51bGwsbT1udWxsLGw9bnVsbCx3PTB9fXZhciByLG8sbCxwLG0sZixnLGgsUyx5PSExLHg9MCxiPTAsdz0wO2k/KGUuc3R5bGUubXNUb3VjaEFjdGlvbj1cIm5vbmVcIixlLl9nZXN0dXJlPW5ldyBNU0dlc3R1cmUsZS5fZ2VzdHVyZS50YXJnZXQ9ZSxlLmFkZEV2ZW50TGlzdGVuZXIoXCJNU1BvaW50ZXJEb3duXCIsdCwhMSksZS5fc2xpZGVyPWEsZS5hZGRFdmVudExpc3RlbmVyKFwiTVNHZXN0dXJlQ2hhbmdlXCIsbiwhMSksZS5hZGRFdmVudExpc3RlbmVyKFwiTVNHZXN0dXJlRW5kXCIscywhMSkpOihnPWZ1bmN0aW9uKHQpe2EuYW5pbWF0aW5nP3QucHJldmVudERlZmF1bHQoKTood2luZG93Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkfHwxPT09dC50b3VjaGVzLmxlbmd0aCkmJihhLnBhdXNlKCkscD1jP2EuaDphLncsZj1OdW1iZXIobmV3IERhdGUpLHg9dC50b3VjaGVzWzBdLnBhZ2VYLGI9dC50b3VjaGVzWzBdLnBhZ2VZLGw9dSYmZCYmYS5hbmltYXRpbmdUbz09PWEubGFzdD8wOnUmJmQ/YS5saW1pdC0oYS5pdGVtVythLnZhcnMuaXRlbU1hcmdpbikqYS5tb3ZlKmEuYW5pbWF0aW5nVG86dSYmYS5jdXJyZW50U2xpZGU9PT1hLmxhc3Q/YS5saW1pdDp1PyhhLml0ZW1XK2EudmFycy5pdGVtTWFyZ2luKSphLm1vdmUqYS5jdXJyZW50U2xpZGU6ZD8oYS5sYXN0LWEuY3VycmVudFNsaWRlK2EuY2xvbmVPZmZzZXQpKnA6KGEuY3VycmVudFNsaWRlK2EuY2xvbmVPZmZzZXQpKnAscj1jP2I6eCxvPWM/eDpiLGUuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNobW92ZVwiLGgsITEpLGUuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNoZW5kXCIsUywhMSkpfSxoPWZ1bmN0aW9uKGUpe3g9ZS50b3VjaGVzWzBdLnBhZ2VYLGI9ZS50b3VjaGVzWzBdLnBhZ2VZLG09Yz9yLWI6ci14LHk9Yz9NYXRoLmFicyhtKTxNYXRoLmFicyh4LW8pOk1hdGguYWJzKG0pPE1hdGguYWJzKGItbyk7dmFyIHQ9NTAwOygheXx8TnVtYmVyKG5ldyBEYXRlKS1mPnQpJiYoZS5wcmV2ZW50RGVmYXVsdCgpLCF2JiZhLnRyYW5zaXRpb25zJiYoYS52YXJzLmFuaW1hdGlvbkxvb3B8fChtLz0wPT09YS5jdXJyZW50U2xpZGUmJjA+bXx8YS5jdXJyZW50U2xpZGU9PT1hLmxhc3QmJm0+MD9NYXRoLmFicyhtKS9wKzI6MSksYS5zZXRQcm9wcyhsK20sXCJzZXRUb3VjaFwiKSkpfSxTPWZ1bmN0aW9uKHQpe2lmKGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRvdWNobW92ZVwiLGgsITEpLGEuYW5pbWF0aW5nVG89PT1hLmN1cnJlbnRTbGlkZSYmIXkmJm51bGwhPT1tKXt2YXIgbj1kPy1tOm0saT1hLmdldFRhcmdldChuPjA/XCJuZXh0XCI6XCJwcmV2XCIpO2EuY2FuQWR2YW5jZShpKSYmKE51bWJlcihuZXcgRGF0ZSktZjw1NTAmJk1hdGguYWJzKG4pPjUwfHxNYXRoLmFicyhuKT5wLzIpP2EuZmxleEFuaW1hdGUoaSxhLnZhcnMucGF1c2VPbkFjdGlvbik6dnx8YS5mbGV4QW5pbWF0ZShhLmN1cnJlbnRTbGlkZSxhLnZhcnMucGF1c2VPbkFjdGlvbiwhMCl9ZS5yZW1vdmVFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIixTLCExKSxyPW51bGwsbz1udWxsLG09bnVsbCxsPW51bGx9LGUuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNoc3RhcnRcIixnLCExKSl9LHJlc2l6ZTpmdW5jdGlvbigpeyFhLmFuaW1hdGluZyYmYS5pcyhcIjp2aXNpYmxlXCIpJiYodXx8YS5kb01hdGgoKSx2P20uc21vb3RoSGVpZ2h0KCk6dT8oYS5zbGlkZXMud2lkdGgoYS5jb21wdXRlZFcpLGEudXBkYXRlKGEucGFnaW5nQ291bnQpLGEuc2V0UHJvcHMoKSk6Yz8oYS52aWV3cG9ydC5oZWlnaHQoYS5oKSxhLnNldFByb3BzKGEuaCxcInNldFRvdGFsXCIpKTooYS52YXJzLnNtb290aEhlaWdodCYmbS5zbW9vdGhIZWlnaHQoKSxhLm5ld1NsaWRlcy53aWR0aChhLmNvbXB1dGVkVyksYS5zZXRQcm9wcyhhLmNvbXB1dGVkVyxcInNldFRvdGFsXCIpKSl9LHNtb290aEhlaWdodDpmdW5jdGlvbihlKXtpZighY3x8dil7dmFyIHQ9dj9hOmEudmlld3BvcnQ7ZT90LmFuaW1hdGUoe2hlaWdodDphLnNsaWRlcy5lcShhLmFuaW1hdGluZ1RvKS5oZWlnaHQoKX0sZSk6dC5oZWlnaHQoYS5zbGlkZXMuZXEoYS5hbmltYXRpbmdUbykuaGVpZ2h0KCkpfX0sc3luYzpmdW5jdGlvbihlKXt2YXIgdD0kKGEudmFycy5zeW5jKS5kYXRhKFwiZmxleHNsaWRlclwiKSxuPWEuYW5pbWF0aW5nVG87c3dpdGNoKGUpe2Nhc2VcImFuaW1hdGVcIjp0LmZsZXhBbmltYXRlKG4sYS52YXJzLnBhdXNlT25BY3Rpb24sITEsITApO2JyZWFrO2Nhc2VcInBsYXlcIjp0LnBsYXlpbmd8fHQuYXNOYXZ8fHQucGxheSgpO2JyZWFrO2Nhc2VcInBhdXNlXCI6dC5wYXVzZSgpfX0sdW5pcXVlSUQ6ZnVuY3Rpb24oZSl7cmV0dXJuIGUuZmlsdGVyKFwiW2lkXVwiKS5hZGQoZS5maW5kKFwiW2lkXVwiKSkuZWFjaChmdW5jdGlvbigpe3ZhciBlPSQodGhpcyk7ZS5hdHRyKFwiaWRcIixlLmF0dHIoXCJpZFwiKStcIl9jbG9uZVwiKX0pLGV9LHBhdXNlSW52aXNpYmxlOnt2aXNQcm9wOm51bGwsaW5pdDpmdW5jdGlvbigpe3ZhciBlPW0ucGF1c2VJbnZpc2libGUuZ2V0SGlkZGVuUHJvcCgpO2lmKGUpe3ZhciB0PWUucmVwbGFjZSgvW0h8aF1pZGRlbi8sXCJcIikrXCJ2aXNpYmlsaXR5Y2hhbmdlXCI7ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0LGZ1bmN0aW9uKCl7bS5wYXVzZUludmlzaWJsZS5pc0hpZGRlbigpP2Euc3RhcnRUaW1lb3V0P2NsZWFyVGltZW91dChhLnN0YXJ0VGltZW91dCk6YS5wYXVzZSgpOmEuc3RhcnRlZD9hLnBsYXkoKTphLnZhcnMuaW5pdERlbGF5PjA/c2V0VGltZW91dChhLnBsYXksYS52YXJzLmluaXREZWxheSk6YS5wbGF5KCl9KX19LGlzSGlkZGVuOmZ1bmN0aW9uKCl7dmFyIGU9bS5wYXVzZUludmlzaWJsZS5nZXRIaWRkZW5Qcm9wKCk7cmV0dXJuIGU/ZG9jdW1lbnRbZV06ITF9LGdldEhpZGRlblByb3A6ZnVuY3Rpb24oKXt2YXIgZT1bXCJ3ZWJraXRcIixcIm1velwiLFwibXNcIixcIm9cIl07aWYoXCJoaWRkZW5cImluIGRvY3VtZW50KXJldHVyblwiaGlkZGVuXCI7Zm9yKHZhciB0PTA7dDxlLmxlbmd0aDt0KyspaWYoZVt0XStcIkhpZGRlblwiaW4gZG9jdW1lbnQpcmV0dXJuIGVbdF0rXCJIaWRkZW5cIjtyZXR1cm4gbnVsbH19LHNldFRvQ2xlYXJXYXRjaGVkRXZlbnQ6ZnVuY3Rpb24oKXtjbGVhclRpbWVvdXQobCksbD1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7bz1cIlwifSwzZTMpfX0sYS5mbGV4QW5pbWF0ZT1mdW5jdGlvbihlLHQsaSxyLG8pe2lmKGEudmFycy5hbmltYXRpb25Mb29wfHxlPT09YS5jdXJyZW50U2xpZGV8fChhLmRpcmVjdGlvbj1lPmEuY3VycmVudFNsaWRlP1wibmV4dFwiOlwicHJldlwiKSxwJiYxPT09YS5wYWdpbmdDb3VudCYmKGEuZGlyZWN0aW9uPWEuY3VycmVudEl0ZW08ZT9cIm5leHRcIjpcInByZXZcIiksIWEuYW5pbWF0aW5nJiYoYS5jYW5BZHZhbmNlKGUsbyl8fGkpJiZhLmlzKFwiOnZpc2libGVcIikpe2lmKHAmJnIpe3ZhciBsPSQoYS52YXJzLmFzTmF2Rm9yKS5kYXRhKFwiZmxleHNsaWRlclwiKTtpZihhLmF0RW5kPTA9PT1lfHxlPT09YS5jb3VudC0xLGwuZmxleEFuaW1hdGUoZSwhMCwhMSwhMCxvKSxhLmRpcmVjdGlvbj1hLmN1cnJlbnRJdGVtPGU/XCJuZXh0XCI6XCJwcmV2XCIsbC5kaXJlY3Rpb249YS5kaXJlY3Rpb24sTWF0aC5jZWlsKChlKzEpL2EudmlzaWJsZSktMT09PWEuY3VycmVudFNsaWRlfHwwPT09ZSlyZXR1cm4gYS5jdXJyZW50SXRlbT1lLGEuc2xpZGVzLnJlbW92ZUNsYXNzKG4rXCJhY3RpdmUtc2xpZGVcIikuZXEoZSkuYWRkQ2xhc3MobitcImFjdGl2ZS1zbGlkZVwiKSwhMTthLmN1cnJlbnRJdGVtPWUsYS5zbGlkZXMucmVtb3ZlQ2xhc3MobitcImFjdGl2ZS1zbGlkZVwiKS5lcShlKS5hZGRDbGFzcyhuK1wiYWN0aXZlLXNsaWRlXCIpLGU9TWF0aC5mbG9vcihlL2EudmlzaWJsZSl9aWYoYS5hbmltYXRpbmc9ITAsYS5hbmltYXRpbmdUbz1lLHQmJmEucGF1c2UoKSxhLnZhcnMuYmVmb3JlKGEpLGEuc3luY0V4aXN0cyYmIW8mJm0uc3luYyhcImFuaW1hdGVcIiksYS52YXJzLmNvbnRyb2xOYXYmJm0uY29udHJvbE5hdi5hY3RpdmUoKSx1fHxhLnNsaWRlcy5yZW1vdmVDbGFzcyhuK1wiYWN0aXZlLXNsaWRlXCIpLmVxKGUpLmFkZENsYXNzKG4rXCJhY3RpdmUtc2xpZGVcIiksYS5hdEVuZD0wPT09ZXx8ZT09PWEubGFzdCxhLnZhcnMuZGlyZWN0aW9uTmF2JiZtLmRpcmVjdGlvbk5hdi51cGRhdGUoKSxlPT09YS5sYXN0JiYoYS52YXJzLmVuZChhKSxhLnZhcnMuYW5pbWF0aW9uTG9vcHx8YS5wYXVzZSgpKSx2KXM/KGEuc2xpZGVzLmVxKGEuY3VycmVudFNsaWRlKS5jc3Moe29wYWNpdHk6MCx6SW5kZXg6MX0pLGEuc2xpZGVzLmVxKGUpLmNzcyh7b3BhY2l0eToxLHpJbmRleDoyfSksYS53cmFwdXAoZikpOihhLnNsaWRlcy5lcShhLmN1cnJlbnRTbGlkZSkuY3NzKHt6SW5kZXg6MX0pLmFuaW1hdGUoe29wYWNpdHk6MH0sYS52YXJzLmFuaW1hdGlvblNwZWVkLGEudmFycy5lYXNpbmcpLGEuc2xpZGVzLmVxKGUpLmNzcyh7ekluZGV4OjJ9KS5hbmltYXRlKHtvcGFjaXR5OjF9LGEudmFycy5hbmltYXRpb25TcGVlZCxhLnZhcnMuZWFzaW5nLGEud3JhcHVwKSk7ZWxzZXt2YXIgZj1jP2Euc2xpZGVzLmZpbHRlcihcIjpmaXJzdFwiKS5oZWlnaHQoKTphLmNvbXB1dGVkVyxnLGgsUzt1PyhnPWEudmFycy5pdGVtTWFyZ2luLFM9KGEuaXRlbVcrZykqYS5tb3ZlKmEuYW5pbWF0aW5nVG8saD1TPmEubGltaXQmJjEhPT1hLnZpc2libGU/YS5saW1pdDpTKTpoPTA9PT1hLmN1cnJlbnRTbGlkZSYmZT09PWEuY291bnQtMSYmYS52YXJzLmFuaW1hdGlvbkxvb3AmJlwibmV4dFwiIT09YS5kaXJlY3Rpb24/ZD8oYS5jb3VudCthLmNsb25lT2Zmc2V0KSpmOjA6YS5jdXJyZW50U2xpZGU9PT1hLmxhc3QmJjA9PT1lJiZhLnZhcnMuYW5pbWF0aW9uTG9vcCYmXCJwcmV2XCIhPT1hLmRpcmVjdGlvbj9kPzA6KGEuY291bnQrMSkqZjpkPyhhLmNvdW50LTEtZSthLmNsb25lT2Zmc2V0KSpmOihlK2EuY2xvbmVPZmZzZXQpKmYsYS5zZXRQcm9wcyhoLFwiXCIsYS52YXJzLmFuaW1hdGlvblNwZWVkKSxhLnRyYW5zaXRpb25zPyhhLnZhcnMuYW5pbWF0aW9uTG9vcCYmYS5hdEVuZHx8KGEuYW5pbWF0aW5nPSExLGEuY3VycmVudFNsaWRlPWEuYW5pbWF0aW5nVG8pLGEuY29udGFpbmVyLnVuYmluZChcIndlYmtpdFRyYW5zaXRpb25FbmQgdHJhbnNpdGlvbmVuZFwiKSxhLmNvbnRhaW5lci5iaW5kKFwid2Via2l0VHJhbnNpdGlvbkVuZCB0cmFuc2l0aW9uZW5kXCIsZnVuY3Rpb24oKXtjbGVhclRpbWVvdXQoYS5lbnN1cmVBbmltYXRpb25FbmQpLGEud3JhcHVwKGYpfSksY2xlYXJUaW1lb3V0KGEuZW5zdXJlQW5pbWF0aW9uRW5kKSxhLmVuc3VyZUFuaW1hdGlvbkVuZD1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7YS53cmFwdXAoZil9LGEudmFycy5hbmltYXRpb25TcGVlZCsxMDApKTphLmNvbnRhaW5lci5hbmltYXRlKGEuYXJncyxhLnZhcnMuYW5pbWF0aW9uU3BlZWQsYS52YXJzLmVhc2luZyxmdW5jdGlvbigpe2Eud3JhcHVwKGYpfSl9YS52YXJzLnNtb290aEhlaWdodCYmbS5zbW9vdGhIZWlnaHQoYS52YXJzLmFuaW1hdGlvblNwZWVkKX19LGEud3JhcHVwPWZ1bmN0aW9uKGUpe3Z8fHV8fCgwPT09YS5jdXJyZW50U2xpZGUmJmEuYW5pbWF0aW5nVG89PT1hLmxhc3QmJmEudmFycy5hbmltYXRpb25Mb29wP2Euc2V0UHJvcHMoZSxcImp1bXBFbmRcIik6YS5jdXJyZW50U2xpZGU9PT1hLmxhc3QmJjA9PT1hLmFuaW1hdGluZ1RvJiZhLnZhcnMuYW5pbWF0aW9uTG9vcCYmYS5zZXRQcm9wcyhlLFwianVtcFN0YXJ0XCIpKSxhLmFuaW1hdGluZz0hMSxhLmN1cnJlbnRTbGlkZT1hLmFuaW1hdGluZ1RvLGEudmFycy5hZnRlcihhKX0sYS5hbmltYXRlU2xpZGVzPWZ1bmN0aW9uKCl7IWEuYW5pbWF0aW5nJiZmJiZhLmZsZXhBbmltYXRlKGEuZ2V0VGFyZ2V0KFwibmV4dFwiKSl9LGEucGF1c2U9ZnVuY3Rpb24oKXtjbGVhckludGVydmFsKGEuYW5pbWF0ZWRTbGlkZXMpLGEuYW5pbWF0ZWRTbGlkZXM9bnVsbCxhLnBsYXlpbmc9ITEsYS52YXJzLnBhdXNlUGxheSYmbS5wYXVzZVBsYXkudXBkYXRlKFwicGxheVwiKSxhLnN5bmNFeGlzdHMmJm0uc3luYyhcInBhdXNlXCIpfSxhLnBsYXk9ZnVuY3Rpb24oKXthLnBsYXlpbmcmJmNsZWFySW50ZXJ2YWwoYS5hbmltYXRlZFNsaWRlcyksYS5hbmltYXRlZFNsaWRlcz1hLmFuaW1hdGVkU2xpZGVzfHxzZXRJbnRlcnZhbChhLmFuaW1hdGVTbGlkZXMsYS52YXJzLnNsaWRlc2hvd1NwZWVkKSxhLnN0YXJ0ZWQ9YS5wbGF5aW5nPSEwLGEudmFycy5wYXVzZVBsYXkmJm0ucGF1c2VQbGF5LnVwZGF0ZShcInBhdXNlXCIpLGEuc3luY0V4aXN0cyYmbS5zeW5jKFwicGxheVwiKX0sYS5zdG9wPWZ1bmN0aW9uKCl7YS5wYXVzZSgpLGEuc3RvcHBlZD0hMH0sYS5jYW5BZHZhbmNlPWZ1bmN0aW9uKGUsdCl7dmFyIG49cD9hLnBhZ2luZ0NvdW50LTE6YS5sYXN0O3JldHVybiB0PyEwOnAmJmEuY3VycmVudEl0ZW09PT1hLmNvdW50LTEmJjA9PT1lJiZcInByZXZcIj09PWEuZGlyZWN0aW9uPyEwOnAmJjA9PT1hLmN1cnJlbnRJdGVtJiZlPT09YS5wYWdpbmdDb3VudC0xJiZcIm5leHRcIiE9PWEuZGlyZWN0aW9uPyExOmUhPT1hLmN1cnJlbnRTbGlkZXx8cD9hLnZhcnMuYW5pbWF0aW9uTG9vcD8hMDphLmF0RW5kJiYwPT09YS5jdXJyZW50U2xpZGUmJmU9PT1uJiZcIm5leHRcIiE9PWEuZGlyZWN0aW9uPyExOmEuYXRFbmQmJmEuY3VycmVudFNsaWRlPT09biYmMD09PWUmJlwibmV4dFwiPT09YS5kaXJlY3Rpb24/ITE6ITA6ITF9LGEuZ2V0VGFyZ2V0PWZ1bmN0aW9uKGUpe3JldHVybiBhLmRpcmVjdGlvbj1lLFwibmV4dFwiPT09ZT9hLmN1cnJlbnRTbGlkZT09PWEubGFzdD8wOmEuY3VycmVudFNsaWRlKzE6MD09PWEuY3VycmVudFNsaWRlP2EubGFzdDphLmN1cnJlbnRTbGlkZS0xfSxhLnNldFByb3BzPWZ1bmN0aW9uKGUsdCxuKXt2YXIgaT1mdW5jdGlvbigpe3ZhciBuPWU/ZTooYS5pdGVtVythLnZhcnMuaXRlbU1hcmdpbikqYS5tb3ZlKmEuYW5pbWF0aW5nVG8saT1mdW5jdGlvbigpe2lmKHUpcmV0dXJuXCJzZXRUb3VjaFwiPT09dD9lOmQmJmEuYW5pbWF0aW5nVG89PT1hLmxhc3Q/MDpkP2EubGltaXQtKGEuaXRlbVcrYS52YXJzLml0ZW1NYXJnaW4pKmEubW92ZSphLmFuaW1hdGluZ1RvOmEuYW5pbWF0aW5nVG89PT1hLmxhc3Q/YS5saW1pdDpuO3N3aXRjaCh0KXtjYXNlXCJzZXRUb3RhbFwiOnJldHVybiBkPyhhLmNvdW50LTEtYS5jdXJyZW50U2xpZGUrYS5jbG9uZU9mZnNldCkqZTooYS5jdXJyZW50U2xpZGUrYS5jbG9uZU9mZnNldCkqZTtjYXNlXCJzZXRUb3VjaFwiOnJldHVybiBkP2U6ZTtjYXNlXCJqdW1wRW5kXCI6cmV0dXJuIGQ/ZTphLmNvdW50KmU7Y2FzZVwianVtcFN0YXJ0XCI6cmV0dXJuIGQ/YS5jb3VudCplOmU7ZGVmYXVsdDpyZXR1cm4gZX19KCk7cmV0dXJuLTEqaStcInB4XCJ9KCk7YS50cmFuc2l0aW9ucyYmKGk9Yz9cInRyYW5zbGF0ZTNkKDAsXCIraStcIiwwKVwiOlwidHJhbnNsYXRlM2QoXCIraStcIiwwLDApXCIsbj12b2lkIDAhPT1uP24vMWUzK1wic1wiOlwiMHNcIixhLmNvbnRhaW5lci5jc3MoXCItXCIrYS5wZngrXCItdHJhbnNpdGlvbi1kdXJhdGlvblwiLG4pLGEuY29udGFpbmVyLmNzcyhcInRyYW5zaXRpb24tZHVyYXRpb25cIixuKSksYS5hcmdzW2EucHJvcF09aSwoYS50cmFuc2l0aW9uc3x8dm9pZCAwPT09bikmJmEuY29udGFpbmVyLmNzcyhhLmFyZ3MpLGEuY29udGFpbmVyLmNzcyhcInRyYW5zZm9ybVwiLGkpfSxhLnNldHVwPWZ1bmN0aW9uKGUpe2lmKHYpYS5zbGlkZXMuY3NzKHt3aWR0aDpcIjEwMCVcIixcImZsb2F0XCI6XCJsZWZ0XCIsbWFyZ2luUmlnaHQ6XCItMTAwJVwiLHBvc2l0aW9uOlwicmVsYXRpdmVcIn0pLFwiaW5pdFwiPT09ZSYmKHM/YS5zbGlkZXMuY3NzKHtvcGFjaXR5OjAsZGlzcGxheTpcImJsb2NrXCIsd2Via2l0VHJhbnNpdGlvbjpcIm9wYWNpdHkgXCIrYS52YXJzLmFuaW1hdGlvblNwZWVkLzFlMytcInMgZWFzZVwiLHpJbmRleDoxfSkuZXEoYS5jdXJyZW50U2xpZGUpLmNzcyh7b3BhY2l0eToxLHpJbmRleDoyfSk6MD09YS52YXJzLmZhZGVGaXJzdFNsaWRlP2Euc2xpZGVzLmNzcyh7b3BhY2l0eTowLGRpc3BsYXk6XCJibG9ja1wiLHpJbmRleDoxfSkuZXEoYS5jdXJyZW50U2xpZGUpLmNzcyh7ekluZGV4OjJ9KS5jc3Moe29wYWNpdHk6MX0pOmEuc2xpZGVzLmNzcyh7b3BhY2l0eTowLGRpc3BsYXk6XCJibG9ja1wiLHpJbmRleDoxfSkuZXEoYS5jdXJyZW50U2xpZGUpLmNzcyh7ekluZGV4OjJ9KS5hbmltYXRlKHtvcGFjaXR5OjF9LGEudmFycy5hbmltYXRpb25TcGVlZCxhLnZhcnMuZWFzaW5nKSksYS52YXJzLnNtb290aEhlaWdodCYmbS5zbW9vdGhIZWlnaHQoKTtlbHNle3ZhciB0LGk7XCJpbml0XCI9PT1lJiYoYS52aWV3cG9ydD0kKCc8ZGl2IGNsYXNzPVwiJytuKyd2aWV3cG9ydFwiPjwvZGl2PicpLmNzcyh7b3ZlcmZsb3c6XCJoaWRkZW5cIixwb3NpdGlvbjpcInJlbGF0aXZlXCJ9KS5hcHBlbmRUbyhhKS5hcHBlbmQoYS5jb250YWluZXIpLGEuY2xvbmVDb3VudD0wLGEuY2xvbmVPZmZzZXQ9MCxkJiYoaT0kLm1ha2VBcnJheShhLnNsaWRlcykucmV2ZXJzZSgpLGEuc2xpZGVzPSQoaSksYS5jb250YWluZXIuZW1wdHkoKS5hcHBlbmQoYS5zbGlkZXMpKSksYS52YXJzLmFuaW1hdGlvbkxvb3AmJiF1JiYoYS5jbG9uZUNvdW50PTIsYS5jbG9uZU9mZnNldD0xLFwiaW5pdFwiIT09ZSYmYS5jb250YWluZXIuZmluZChcIi5jbG9uZVwiKS5yZW1vdmUoKSxhLmNvbnRhaW5lci5hcHBlbmQobS51bmlxdWVJRChhLnNsaWRlcy5maXJzdCgpLmNsb25lKCkuYWRkQ2xhc3MoXCJjbG9uZVwiKSkuYXR0cihcImFyaWEtaGlkZGVuXCIsXCJ0cnVlXCIpKS5wcmVwZW5kKG0udW5pcXVlSUQoYS5zbGlkZXMubGFzdCgpLmNsb25lKCkuYWRkQ2xhc3MoXCJjbG9uZVwiKSkuYXR0cihcImFyaWEtaGlkZGVuXCIsXCJ0cnVlXCIpKSksYS5uZXdTbGlkZXM9JChhLnZhcnMuc2VsZWN0b3IsYSksdD1kP2EuY291bnQtMS1hLmN1cnJlbnRTbGlkZSthLmNsb25lT2Zmc2V0OmEuY3VycmVudFNsaWRlK2EuY2xvbmVPZmZzZXQsYyYmIXU/KGEuY29udGFpbmVyLmhlaWdodCgyMDAqKGEuY291bnQrYS5jbG9uZUNvdW50KStcIiVcIikuY3NzKFwicG9zaXRpb25cIixcImFic29sdXRlXCIpLndpZHRoKFwiMTAwJVwiKSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7YS5uZXdTbGlkZXMuY3NzKHtkaXNwbGF5OlwiYmxvY2tcIn0pLGEuZG9NYXRoKCksYS52aWV3cG9ydC5oZWlnaHQoYS5oKSxhLnNldFByb3BzKHQqYS5oLFwiaW5pdFwiKX0sXCJpbml0XCI9PT1lPzEwMDowKSk6KGEuY29udGFpbmVyLndpZHRoKDIwMCooYS5jb3VudCthLmNsb25lQ291bnQpK1wiJVwiKSxhLnNldFByb3BzKHQqYS5jb21wdXRlZFcsXCJpbml0XCIpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXthLmRvTWF0aCgpLGEubmV3U2xpZGVzLmNzcyh7d2lkdGg6YS5jb21wdXRlZFcsXCJmbG9hdFwiOlwibGVmdFwiLGRpc3BsYXk6XCJibG9ja1wifSksYS52YXJzLnNtb290aEhlaWdodCYmbS5zbW9vdGhIZWlnaHQoKX0sXCJpbml0XCI9PT1lPzEwMDowKSl9dXx8YS5zbGlkZXMucmVtb3ZlQ2xhc3MobitcImFjdGl2ZS1zbGlkZVwiKS5lcShhLmN1cnJlbnRTbGlkZSkuYWRkQ2xhc3MobitcImFjdGl2ZS1zbGlkZVwiKSxhLnZhcnMuaW5pdChhKX0sYS5kb01hdGg9ZnVuY3Rpb24oKXt2YXIgZT1hLnNsaWRlcy5maXJzdCgpLHQ9YS52YXJzLml0ZW1NYXJnaW4sbj1hLnZhcnMubWluSXRlbXMsaT1hLnZhcnMubWF4SXRlbXM7YS53PXZvaWQgMD09PWEudmlld3BvcnQ/YS53aWR0aCgpOmEudmlld3BvcnQud2lkdGgoKSxhLmg9ZS5oZWlnaHQoKSxhLmJveFBhZGRpbmc9ZS5vdXRlcldpZHRoKCktZS53aWR0aCgpLHU/KGEuaXRlbVQ9YS52YXJzLml0ZW1XaWR0aCt0LGEubWluVz1uP24qYS5pdGVtVDphLncsYS5tYXhXPWk/aSphLml0ZW1ULXQ6YS53LGEuaXRlbVc9YS5taW5XPmEudz8oYS53LXQqKG4tMSkpL246YS5tYXhXPGEudz8oYS53LXQqKGktMSkpL2k6YS52YXJzLml0ZW1XaWR0aD5hLnc/YS53OmEudmFycy5pdGVtV2lkdGgsYS52aXNpYmxlPU1hdGguZmxvb3IoYS53L2EuaXRlbVcpLGEubW92ZT1hLnZhcnMubW92ZT4wJiZhLnZhcnMubW92ZTxhLnZpc2libGU/YS52YXJzLm1vdmU6YS52aXNpYmxlLGEucGFnaW5nQ291bnQ9TWF0aC5jZWlsKChhLmNvdW50LWEudmlzaWJsZSkvYS5tb3ZlKzEpLGEubGFzdD1hLnBhZ2luZ0NvdW50LTEsYS5saW1pdD0xPT09YS5wYWdpbmdDb3VudD8wOmEudmFycy5pdGVtV2lkdGg+YS53P2EuaXRlbVcqKGEuY291bnQtMSkrdCooYS5jb3VudC0xKTooYS5pdGVtVyt0KSphLmNvdW50LWEudy10KTooYS5pdGVtVz1hLncsYS5wYWdpbmdDb3VudD1hLmNvdW50LGEubGFzdD1hLmNvdW50LTEpLGEuY29tcHV0ZWRXPWEuaXRlbVctYS5ib3hQYWRkaW5nfSxhLnVwZGF0ZT1mdW5jdGlvbihlLHQpe2EuZG9NYXRoKCksdXx8KGU8YS5jdXJyZW50U2xpZGU/YS5jdXJyZW50U2xpZGUrPTE6ZTw9YS5jdXJyZW50U2xpZGUmJjAhPT1lJiYoYS5jdXJyZW50U2xpZGUtPTEpLGEuYW5pbWF0aW5nVG89YS5jdXJyZW50U2xpZGUpLGEudmFycy5jb250cm9sTmF2JiYhYS5tYW51YWxDb250cm9scyYmKFwiYWRkXCI9PT10JiYhdXx8YS5wYWdpbmdDb3VudD5hLmNvbnRyb2xOYXYubGVuZ3RoP20uY29udHJvbE5hdi51cGRhdGUoXCJhZGRcIik6KFwicmVtb3ZlXCI9PT10JiYhdXx8YS5wYWdpbmdDb3VudDxhLmNvbnRyb2xOYXYubGVuZ3RoKSYmKHUmJmEuY3VycmVudFNsaWRlPmEubGFzdCYmKGEuY3VycmVudFNsaWRlLT0xLGEuYW5pbWF0aW5nVG8tPTEpLG0uY29udHJvbE5hdi51cGRhdGUoXCJyZW1vdmVcIixhLmxhc3QpKSksYS52YXJzLmRpcmVjdGlvbk5hdiYmbS5kaXJlY3Rpb25OYXYudXBkYXRlKCl9LGEuYWRkU2xpZGU9ZnVuY3Rpb24oZSx0KXt2YXIgbj0kKGUpO2EuY291bnQrPTEsYS5sYXN0PWEuY291bnQtMSxjJiZkP3ZvaWQgMCE9PXQ/YS5zbGlkZXMuZXEoYS5jb3VudC10KS5hZnRlcihuKTphLmNvbnRhaW5lci5wcmVwZW5kKG4pOnZvaWQgMCE9PXQ/YS5zbGlkZXMuZXEodCkuYmVmb3JlKG4pOmEuY29udGFpbmVyLmFwcGVuZChuKSxhLnVwZGF0ZSh0LFwiYWRkXCIpLGEuc2xpZGVzPSQoYS52YXJzLnNlbGVjdG9yK1wiOm5vdCguY2xvbmUpXCIsYSksYS5zZXR1cCgpLGEudmFycy5hZGRlZChhKX0sYS5yZW1vdmVTbGlkZT1mdW5jdGlvbihlKXt2YXIgdD1pc05hTihlKT9hLnNsaWRlcy5pbmRleCgkKGUpKTplO2EuY291bnQtPTEsYS5sYXN0PWEuY291bnQtMSxpc05hTihlKT8kKGUsYS5zbGlkZXMpLnJlbW92ZSgpOmMmJmQ/YS5zbGlkZXMuZXEoYS5sYXN0KS5yZW1vdmUoKTphLnNsaWRlcy5lcShlKS5yZW1vdmUoKSxhLmRvTWF0aCgpLGEudXBkYXRlKHQsXCJyZW1vdmVcIiksYS5zbGlkZXM9JChhLnZhcnMuc2VsZWN0b3IrXCI6bm90KC5jbG9uZSlcIixhKSxhLnNldHVwKCksYS52YXJzLnJlbW92ZWQoYSl9LG0uaW5pdCgpfSwkKHdpbmRvdykuYmx1cihmdW5jdGlvbihlKXtmb2N1c2VkPSExfSkuZm9jdXMoZnVuY3Rpb24oZSl7Zm9jdXNlZD0hMH0pLCQuZmxleHNsaWRlci5kZWZhdWx0cz17bmFtZXNwYWNlOlwiZmxleC1cIixzZWxlY3RvcjpcIi5zbGlkZXMgPiBsaVwiLGFuaW1hdGlvbjpcImZhZGVcIixlYXNpbmc6XCJzd2luZ1wiLGRpcmVjdGlvbjpcImhvcml6b250YWxcIixyZXZlcnNlOiExLGFuaW1hdGlvbkxvb3A6ITAsc21vb3RoSGVpZ2h0OiExLHN0YXJ0QXQ6MCxzbGlkZXNob3c6ITAsc2xpZGVzaG93U3BlZWQ6N2UzLGFuaW1hdGlvblNwZWVkOjYwMCxpbml0RGVsYXk6MCxyYW5kb21pemU6ITEsZmFkZUZpcnN0U2xpZGU6ITAsdGh1bWJDYXB0aW9uczohMSxwYXVzZU9uQWN0aW9uOiEwLHBhdXNlT25Ib3ZlcjohMSxwYXVzZUludmlzaWJsZTohMCx1c2VDU1M6ITAsdG91Y2g6ITAsdmlkZW86ITEsY29udHJvbE5hdjohMCxkaXJlY3Rpb25OYXY6ITAscHJldlRleHQ6XCJQcmV2aW91c1wiLG5leHRUZXh0OlwiTmV4dFwiLGtleWJvYXJkOiEwLG11bHRpcGxlS2V5Ym9hcmQ6ITEsbW91c2V3aGVlbDohMSxwYXVzZVBsYXk6ITEscGF1c2VUZXh0OlwiUGF1c2VcIixwbGF5VGV4dDpcIlBsYXlcIixjb250cm9sc0NvbnRhaW5lcjpcIlwiLG1hbnVhbENvbnRyb2xzOlwiXCIsY3VzdG9tRGlyZWN0aW9uTmF2OlwiXCIsc3luYzpcIlwiLGFzTmF2Rm9yOlwiXCIsaXRlbVdpZHRoOjAsaXRlbU1hcmdpbjowLG1pbkl0ZW1zOjEsbWF4SXRlbXM6MCxtb3ZlOjAsYWxsb3dPbmVTbGlkZTohMCxzdGFydDpmdW5jdGlvbigpe30sYmVmb3JlOmZ1bmN0aW9uKCl7fSxhZnRlcjpmdW5jdGlvbigpe30sZW5kOmZ1bmN0aW9uKCl7fSxhZGRlZDpmdW5jdGlvbigpe30scmVtb3ZlZDpmdW5jdGlvbigpe30saW5pdDpmdW5jdGlvbigpe319LCQuZm4uZmxleHNsaWRlcj1mdW5jdGlvbihlKXtpZih2b2lkIDA9PT1lJiYoZT17fSksXCJvYmplY3RcIj09dHlwZW9mIGUpcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciB0PSQodGhpcyksYT1lLnNlbGVjdG9yP2Uuc2VsZWN0b3I6XCIuc2xpZGVzID4gbGlcIixuPXQuZmluZChhKTsxPT09bi5sZW5ndGgmJmUuYWxsb3dPbmVTbGlkZT09PSEwfHwwPT09bi5sZW5ndGg/KG4uZmFkZUluKDQwMCksZS5zdGFydCYmZS5zdGFydCh0KSk6dm9pZCAwPT09dC5kYXRhKFwiZmxleHNsaWRlclwiKSYmbmV3ICQuZmxleHNsaWRlcih0aGlzLGUpfSk7dmFyIHQ9JCh0aGlzKS5kYXRhKFwiZmxleHNsaWRlclwiKTtzd2l0Y2goZSl7Y2FzZVwicGxheVwiOnQucGxheSgpO2JyZWFrO2Nhc2VcInBhdXNlXCI6dC5wYXVzZSgpO2JyZWFrO2Nhc2VcInN0b3BcIjp0LnN0b3AoKTticmVhaztjYXNlXCJuZXh0XCI6dC5mbGV4QW5pbWF0ZSh0LmdldFRhcmdldChcIm5leHRcIiksITApO2JyZWFrO2Nhc2VcInByZXZcIjpjYXNlXCJwcmV2aW91c1wiOnQuZmxleEFuaW1hdGUodC5nZXRUYXJnZXQoXCJwcmV2XCIpLCEwKTticmVhaztkZWZhdWx0OlwibnVtYmVyXCI9PXR5cGVvZiBlJiZ0LmZsZXhBbmltYXRlKGUsITApfX19KGpRdWVyeSk7IiwiLyohXHJcbiAqIGNsYXNzaWUgdjEuMC4xXHJcbiAqIGNsYXNzIGhlbHBlciBmdW5jdGlvbnNcclxuICogZnJvbSBib256byBodHRwczovL2dpdGh1Yi5jb20vZGVkL2JvbnpvXHJcbiAqIE1JVCBsaWNlbnNlXHJcbiAqIFxyXG4gKiBjbGFzc2llLmhhcyggZWxlbSwgJ215LWNsYXNzJyApIC0+IHRydWUvZmFsc2VcclxuICogY2xhc3NpZS5hZGQoIGVsZW0sICdteS1uZXctY2xhc3MnIClcclxuICogY2xhc3NpZS5yZW1vdmUoIGVsZW0sICdteS11bndhbnRlZC1jbGFzcycgKVxyXG4gKiBjbGFzc2llLnRvZ2dsZSggZWxlbSwgJ215LWNsYXNzJyApXHJcbiAqL1xyXG5cclxuLypqc2hpbnQgYnJvd3NlcjogdHJ1ZSwgc3RyaWN0OiB0cnVlLCB1bmRlZjogdHJ1ZSwgdW51c2VkOiB0cnVlICovXHJcbi8qZ2xvYmFsIGRlZmluZTogZmFsc2UsIG1vZHVsZTogZmFsc2UgKi9cclxuXHJcbiggZnVuY3Rpb24oIHdpbmRvdyApIHtcclxuXHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbi8vIGNsYXNzIGhlbHBlciBmdW5jdGlvbnMgZnJvbSBib256byBodHRwczovL2dpdGh1Yi5jb20vZGVkL2JvbnpvXHJcblxyXG5mdW5jdGlvbiBjbGFzc1JlZyggY2xhc3NOYW1lICkge1xyXG4gIHJldHVybiBuZXcgUmVnRXhwKFwiKF58XFxcXHMrKVwiICsgY2xhc3NOYW1lICsgXCIoXFxcXHMrfCQpXCIpO1xyXG59XHJcblxyXG4vLyBjbGFzc0xpc3Qgc3VwcG9ydCBmb3IgY2xhc3MgbWFuYWdlbWVudFxyXG4vLyBhbHRobyB0byBiZSBmYWlyLCB0aGUgYXBpIHN1Y2tzIGJlY2F1c2UgaXQgd29uJ3QgYWNjZXB0IG11bHRpcGxlIGNsYXNzZXMgYXQgb25jZVxyXG52YXIgaGFzQ2xhc3MsIGFkZENsYXNzLCByZW1vdmVDbGFzcztcclxuXHJcbmlmICggJ2NsYXNzTGlzdCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICkge1xyXG4gIGhhc0NsYXNzID0gZnVuY3Rpb24oIGVsZW0sIGMgKSB7XHJcbiAgICByZXR1cm4gZWxlbS5jbGFzc0xpc3QuY29udGFpbnMoIGMgKTtcclxuICB9O1xyXG4gIGFkZENsYXNzID0gZnVuY3Rpb24oIGVsZW0sIGMgKSB7XHJcbiAgICBlbGVtLmNsYXNzTGlzdC5hZGQoIGMgKTtcclxuICB9O1xyXG4gIHJlbW92ZUNsYXNzID0gZnVuY3Rpb24oIGVsZW0sIGMgKSB7XHJcbiAgICBlbGVtLmNsYXNzTGlzdC5yZW1vdmUoIGMgKTtcclxuICB9O1xyXG59XHJcbmVsc2Uge1xyXG4gIGhhc0NsYXNzID0gZnVuY3Rpb24oIGVsZW0sIGMgKSB7XHJcbiAgICByZXR1cm4gY2xhc3NSZWcoIGMgKS50ZXN0KCBlbGVtLmNsYXNzTmFtZSApO1xyXG4gIH07XHJcbiAgYWRkQ2xhc3MgPSBmdW5jdGlvbiggZWxlbSwgYyApIHtcclxuICAgIGlmICggIWhhc0NsYXNzKCBlbGVtLCBjICkgKSB7XHJcbiAgICAgIGVsZW0uY2xhc3NOYW1lID0gZWxlbS5jbGFzc05hbWUgKyAnICcgKyBjO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgcmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbiggZWxlbSwgYyApIHtcclxuICAgIGVsZW0uY2xhc3NOYW1lID0gZWxlbS5jbGFzc05hbWUucmVwbGFjZSggY2xhc3NSZWcoIGMgKSwgJyAnICk7XHJcbiAgfTtcclxufVxyXG5cclxuZnVuY3Rpb24gdG9nZ2xlQ2xhc3MoIGVsZW0sIGMgKSB7XHJcbiAgdmFyIGZuID0gaGFzQ2xhc3MoIGVsZW0sIGMgKSA/IHJlbW92ZUNsYXNzIDogYWRkQ2xhc3M7XHJcbiAgZm4oIGVsZW0sIGMgKTtcclxufVxyXG5cclxudmFyIGNsYXNzaWUgPSB7XHJcbiAgLy8gZnVsbCBuYW1lc1xyXG4gIGhhc0NsYXNzOiBoYXNDbGFzcyxcclxuICBhZGRDbGFzczogYWRkQ2xhc3MsXHJcbiAgcmVtb3ZlQ2xhc3M6IHJlbW92ZUNsYXNzLFxyXG4gIHRvZ2dsZUNsYXNzOiB0b2dnbGVDbGFzcyxcclxuICAvLyBzaG9ydCBuYW1lc1xyXG4gIGhhczogaGFzQ2xhc3MsXHJcbiAgYWRkOiBhZGRDbGFzcyxcclxuICByZW1vdmU6IHJlbW92ZUNsYXNzLFxyXG4gIHRvZ2dsZTogdG9nZ2xlQ2xhc3NcclxufTtcclxuXHJcbi8vIHRyYW5zcG9ydFxyXG5pZiAoIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcclxuICAvLyBBTURcclxuICBkZWZpbmUoIGNsYXNzaWUgKTtcclxufSBlbHNlIGlmICggdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICkge1xyXG4gIC8vIENvbW1vbkpTXHJcbiAgbW9kdWxlLmV4cG9ydHMgPSBjbGFzc2llO1xyXG59IGVsc2Uge1xyXG4gIC8vIGJyb3dzZXIgZ2xvYmFsXHJcbiAgd2luZG93LmNsYXNzaWUgPSBjbGFzc2llO1xyXG59XHJcblxyXG59KSggd2luZG93ICk7XHJcbiIsIi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHRQT1BVUC5KU1xyXG5cclxuXHRTaW1wbGUgUG9wdXAgcGx1Z2luIGZvciBqUXVlcnlcclxuXHJcblx0QGF1dGhvciBUb2RkIEZyYW5jaXNcclxuXHRAdmVyc2lvbiAyLjIuM1xyXG5cclxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG47KGZ1bmN0aW9uKGIsdCl7Yi5mbi5wb3B1cD1mdW5jdGlvbihoKXt2YXIgcT10aGlzLnNlbGVjdG9yLG09bmV3IGIuUG9wdXAoaCk7Yihkb2N1bWVudCkub24oXCJjbGljay5wb3B1cFwiLHEsZnVuY3Rpb24obil7dmFyIGs9aCYmaC5jb250ZW50P2guY29udGVudDpiKHRoaXMpLmF0dHIoXCJocmVmXCIpO24ucHJldmVudERlZmF1bHQoKTttLm9wZW4oayx2b2lkIDAsdGhpcyl9KTtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7Yih0aGlzKS5kYXRhKFwicG9wdXBcIixtKX0pfTtiLlBvcHVwPWZ1bmN0aW9uKGgpe2Z1bmN0aW9uIHEoYSl7dmFyIGQ7Yi5lYWNoKGEsZnVuY3Rpb24oYSxjKXtpZihjKXJldHVybiBkPWMsITF9KTtyZXR1cm4gZH1mdW5jdGlvbiBtKGEpe3JldHVyblwiZnVuY3Rpb25cIj09PXR5cGVvZiBhP1wiZnVuY3Rpb25cIjphIGluc3RhbmNlb2YgYj9cImpRdWVyeVwiOlwiI1wiPT09YS5zdWJzdHIoMCwxKXx8XCIuXCI9PT1hLnN1YnN0cigwLDEpP1wiaW5saW5lXCI6LTEhPT1iLmluQXJyYXkoYS5zdWJzdHIoYS5sZW5ndGgtXHJcbjMpLHUpP1wiaW1hZ2VcIjpcImh0dHBcIj09PWEuc3Vic3RyKDAsNCk/XCJleHRlcm5hbFwiOlwiYWpheFwifWZ1bmN0aW9uIG4oYyl7ciYmci5mYWRlT3V0KFwiZmFzdFwiLGZ1bmN0aW9uKCl7Yih0aGlzKS5yZW1vdmUoKX0pO3ZhciBkPSEwO3ZvaWQgMD09PWYmJihkPSExLGY9YignPGRpdiBjbGFzcz1cIicrYS5vLmNvbnRhaW5lckNsYXNzKydcIj4nKSxwPWIoYS5vLm1hcmt1cCkuYXBwZW5kVG8oZiksYihhLm8uY2xvc2VDb250ZW50KS5vbmUoXCJjbGlja1wiLGZ1bmN0aW9uKCl7YS5jbG9zZSgpfSkuYXBwZW5kVG8oZiksYih0KS5yZXNpemUoYS5jZW50ZXIpLGYuYXBwZW5kVG8oYihcImJvZHlcIikpLmNzcyhcIm9wYWNpdHlcIiwwKSk7dmFyIGU9YihcIi5cIithLm8uY29udGVudENsYXNzLGYpO2Eud2lkdGg/ZS5jc3MoXCJ3aWR0aFwiLGEud2lkdGgsMTApOmUuY3NzKFwid2lkdGhcIixcIlwiKTthLmhlaWdodD9lLmNzcyhcImhlaWdodFwiLGEuaGVpZ2h0LDEwKTplLmNzcyhcImhlaWdodFwiLFwiXCIpO3AuaGFzQ2xhc3MoYS5vLmNvbnRlbnRDbGFzcyk/XHJcbnAuaHRtbChjKTpwLmZpbmQoXCIuXCIrYS5vLmNvbnRlbnRDbGFzcykuaHRtbChjKTtkP2Euby5yZXBsYWNlZC5jYWxsKGEsZixnKTphLm8uc2hvdy5jYWxsKGEsZixnKX1mdW5jdGlvbiBrKGEsZCl7dmFyIGI9KG5ldyBSZWdFeHAoXCJbPyZdXCIrYStcIj0oW14mXSopXCIpKS5leGVjKGQpO3JldHVybiBiJiZkZWNvZGVVUklDb21wb25lbnQoYlsxXS5yZXBsYWNlKC9cXCsvZyxcIiBcIikpfXZhciBhPXRoaXMsdT1bXCJwbmdcIixcImpwZ1wiLFwiZ2lmXCJdLGwscyxnLGYscixwO2EuZWxlPXZvaWQgMDthLm89Yi5leHRlbmQoITAse30se2JhY2tDbGFzczpcInBvcHVwX2JhY2tcIixiYWNrT3BhY2l0eTouNyxjb250YWluZXJDbGFzczpcInBvcHVwX2NvbnRcIixjbG9zZUNvbnRlbnQ6JzxkaXYgY2xhc3M9XCJwb3B1cF9jbG9zZVwiPiZ0aW1lczs8L2Rpdj4nLG1hcmt1cDonPGRpdiBjbGFzcz1cInBvcHVwXCI+PGRpdiBjbGFzcz1cInBvcHVwX2NvbnRlbnRcIi8+PC9kaXY+Jyxjb250ZW50Q2xhc3M6XCJwb3B1cF9jb250ZW50XCIsXHJcbnByZWxvYWRlckNvbnRlbnQ6JzxwIGNsYXNzPVwicHJlbG9hZGVyXCI+TG9hZGluZzwvcD4nLGFjdGl2ZUNsYXNzOlwicG9wdXBfYWN0aXZlXCIsaGlkZUZsYXNoOiExLHNwZWVkOjIwMCxwb3B1cFBsYWNlaG9sZGVyQ2xhc3M6XCJwb3B1cF9wbGFjZWhvbGRlclwiLGtlZXBJbmxpbmVDaGFuZ2VzOiEwLG1vZGFsOiExLGNvbnRlbnQ6bnVsbCx0eXBlOlwiYXV0b1wiLHdpZHRoOm51bGwsaGVpZ2h0Om51bGwsdHlwZVBhcmFtOlwicHRcIix3aWR0aFBhcmFtOlwicHdcIixoZWlnaHRQYXJhbTpcInBoXCIsYmVmb3JlT3BlbjpmdW5jdGlvbihhKXt9LGFmdGVyT3BlbjpmdW5jdGlvbigpe30sYmVmb3JlQ2xvc2U6ZnVuY3Rpb24oKXt9LGFmdGVyQ2xvc2U6ZnVuY3Rpb24oKXt9LGVycm9yOmZ1bmN0aW9uKCl7fSxzaG93OmZ1bmN0aW9uKGEsYil7dmFyIGU9dGhpcztlLmNlbnRlcigpO2EuYW5pbWF0ZSh7b3BhY2l0eToxfSxlLm8uc3BlZWQsZnVuY3Rpb24oKXtlLm8uYWZ0ZXJPcGVuLmNhbGwoZSl9KX0scmVwbGFjZWQ6ZnVuY3Rpb24oYSxcclxuYil7dGhpcy5jZW50ZXIoKS5vLmFmdGVyT3Blbi5jYWxsKHRoaXMpfSxoaWRlOmZ1bmN0aW9uKGEsYil7dm9pZCAwIT09YSYmYS5hbmltYXRlKHtvcGFjaXR5OjB9LHRoaXMuby5zcGVlZCl9LHR5cGVzOntpbmxpbmU6ZnVuY3Rpb24oYyxkKXt2YXIgZT1iKGMpO2UuYWRkQ2xhc3MoYS5vLnBvcHVwUGxhY2Vob2xkZXJDbGFzcyk7YS5vLmtlZXBJbmxpbmVDaGFuZ2VzfHwocz1lLmh0bWwoKSk7ZC5jYWxsKHRoaXMsZS5jaGlsZHJlbigpKX0saW1hZ2U6ZnVuY3Rpb24oYyxkKXt2YXIgZT10aGlzO2IoXCI8aW1nIC8+XCIpLm9uZShcImxvYWRcIixmdW5jdGlvbigpe3ZhciBhPXRoaXM7c2V0VGltZW91dChmdW5jdGlvbigpe2QuY2FsbChlLGEpfSwwKX0pLm9uZShcImVycm9yXCIsZnVuY3Rpb24oKXthLm8uZXJyb3IuY2FsbChhLGMsXCJpbWFnZVwiKX0pLmF0dHIoXCJzcmNcIixjKS5lYWNoKGZ1bmN0aW9uKCl7dGhpcy5jb21wbGV0ZSYmYih0aGlzKS50cmlnZ2VyKFwibG9hZFwiKX0pfSxleHRlcm5hbDpmdW5jdGlvbihjLFxyXG5kKXt2YXIgZT1iKFwiPGlmcmFtZSAvPlwiKS5hdHRyKHtzcmM6YyxmcmFtZWJvcmRlcjowLHdpZHRoOmEud2lkdGgsaGVpZ2h0OmEuaGVpZ2h0fSk7ZC5jYWxsKHRoaXMsZSl9LGh0bWw6ZnVuY3Rpb24oYSxiKXtiLmNhbGwodGhpcyxhKX0salF1ZXJ5OmZ1bmN0aW9uKGEsYil7Yi5jYWxsKHRoaXMsYS5odG1sKCkpfSxcImZ1bmN0aW9uXCI6ZnVuY3Rpb24oYixkKXtkLmNhbGwodGhpcyxiLmNhbGwoYSkpfSxhamF4OmZ1bmN0aW9uKGMsZCl7Yi5hamF4KHt1cmw6YyxzdWNjZXNzOmZ1bmN0aW9uKGEpe2QuY2FsbCh0aGlzLGEpfSxlcnJvcjpmdW5jdGlvbihiKXthLm8uZXJyb3IuY2FsbChhLGMsXCJhamF4XCIpfX0pfX19LGgpO2Eub3Blbj1mdW5jdGlvbihjLGQsZSl7Yz12b2lkIDA9PT1jfHxcIiNcIj09PWM/YS5vLmNvbnRlbnQ6YztpZihudWxsPT09YylyZXR1cm4gYS5vLmVycm9yLmNhbGwoYSxjLGwpLCExO3ZvaWQgMCE9PWUmJihhLmVsZSYmYS5vLmFjdGl2ZUNsYXNzJiZiKGEuZWxlKS5yZW1vdmVDbGFzcyhhLm8uYWN0aXZlQ2xhc3MpLFxyXG5hLmVsZT1lLGEuZWxlJiZhLm8uYWN0aXZlQ2xhc3MmJmIoYS5lbGUpLmFkZENsYXNzKGEuby5hY3RpdmVDbGFzcykpO2lmKHZvaWQgMD09PWcpe2c9YignPGRpdiBjbGFzcz1cIicrYS5vLmJhY2tDbGFzcysnXCIvPicpLmFwcGVuZFRvKGIoXCJib2R5XCIpKS5jc3MoXCJvcGFjaXR5XCIsMCkuYW5pbWF0ZSh7b3BhY2l0eTphLm8uYmFja09wYWNpdHl9LGEuby5zcGVlZCk7aWYoIWEuby5tb2RhbClnLm9uZShcImNsaWNrLnBvcHVwXCIsZnVuY3Rpb24oKXthLmNsb3NlKCl9KTthLm8uaGlkZUZsYXNoJiZiKFwib2JqZWN0LCBlbWJlZFwiKS5jc3MoXCJ2aXNpYmlsaXR5XCIsXCJoaWRkZW5cIik7YS5vLnByZWxvYWRlckNvbnRlbnQmJihyPWIoYS5vLnByZWxvYWRlckNvbnRlbnQpLmFwcGVuZFRvKGIoXCJib2R5XCIpKSl9ZD1xKFtkLGEuby50eXBlXSk7bD1kPVwiYXV0b1wiPT09ZD9tKGMpOmQ7YS53aWR0aD1hLm8ud2lkdGg/YS5vLndpZHRoOm51bGw7YS5oZWlnaHQ9YS5vLmhlaWdodD9hLm8uaGVpZ2h0Om51bGw7XHJcbmlmKC0xPT09Yi5pbkFycmF5KGQsW1wiaW5saW5lXCIsXCJqUXVlcnlcIixcImZ1bmN0aW9uXCJdKSl7ZT1rKGEuby50eXBlUGFyYW0sYyk7dmFyIGY9ayhhLm8ud2lkdGhQYXJhbSxjKSxoPWsoYS5vLmhlaWdodFBhcmFtLGMpO2Q9bnVsbCE9PWU/ZTpkO2Eud2lkdGg9bnVsbCE9PWY/ZjphLndpZHRoO2EuaGVpZ2h0PW51bGwhPT1oP2g6YS5oZWlnaHR9YS5vLmJlZm9yZU9wZW4uY2FsbChhLGQpO2Euby50eXBlc1tkXT9hLm8udHlwZXNbZF0uY2FsbChhLGMsbik6YS5vLnR5cGVzLmFqYXguY2FsbChhLGMsbil9O2EuY2xvc2U9ZnVuY3Rpb24oKXthLm8uYmVmb3JlQ2xvc2UuY2FsbChhKTtcImlubGluZVwiPT09bCYmYS5vLmtlZXBJbmxpbmVDaGFuZ2VzJiYocz1iKFwiLlwiK2Euby5jb250ZW50Q2xhc3MpLmh0bWwoKSk7dm9pZCAwIT09ZyYmZy5hbmltYXRlKHtvcGFjaXR5OjB9LGEuby5zcGVlZCxmdW5jdGlvbigpe2EuY2xlYW5VcCgpfSk7YS5vLmhpZGUuY2FsbChhLGYsZyk7cmV0dXJuIGF9O2EuY2xlYW5VcD1cclxuZnVuY3Rpb24oKXtnLmFkZChmKS5yZW1vdmUoKTtmPWc9dm9pZCAwO2IodCkudW5iaW5kKFwicmVzaXplXCIsYS5jZW50ZXIpO2Euby5oaWRlRmxhc2gmJmIoXCJvYmplY3QsIGVtYmVkXCIpLmNzcyhcInZpc2liaWxpdHlcIixcInZpc2libGVcIik7YS5lbGUmJmEuby5hY3RpdmVDbGFzcyYmYihhLmVsZSkucmVtb3ZlQ2xhc3MoYS5vLmFjdGl2ZUNsYXNzKTt2YXIgYz1iKFwiLlwiK2Euby5wb3B1cFBsYWNlaG9sZGVyQ2xhc3MpO1wiaW5saW5lXCI9PWwmJmMubGVuZ3RoJiZjLmh0bWwocykucmVtb3ZlQ2xhc3MoYS5vLnBvcHVwUGxhY2Vob2xkZXJDbGFzcyk7bD1udWxsO2Euby5hZnRlckNsb3NlLmNhbGwoYSk7cmV0dXJuIGF9O2EuY2VudGVyPWZ1bmN0aW9uKCl7Zi5jc3MoYS5nZXRDZW50ZXIoKSk7Zy5jc3Moe2hlaWdodDpkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0fSk7cmV0dXJuIGF9O2EuZ2V0Q2VudGVyPWZ1bmN0aW9uKCl7dmFyIGE9Zi5jaGlsZHJlbigpLm91dGVyV2lkdGgoITApLFxyXG5iPWYuY2hpbGRyZW4oKS5vdXRlckhlaWdodCghMCk7cmV0dXJue3RvcDouNSpkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0LS41KmIsbGVmdDouNSpkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgtLjUqYX19fX0pKGpRdWVyeSx3aW5kb3cpOyIsIjsoZnVuY3Rpb24gKCAkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQgKSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIGFuaW1vIGlzIGEgcG93ZXJmdWwgbGl0dGxlIHRvb2wgdGhhdCBtYWtlcyBtYW5hZ2luZyBDU1MgYW5pbWF0aW9ucyBleHRyZW1lbHkgZWFzeS4gU3RhY2sgYW5pbWF0aW9ucywgc2V0IGNhbGxiYWNrcywgbWFrZSBtYWdpYy5cclxuICAgKiBNb2Rlcm4gYnJvd3NlcnMgYW5kIGFsbW9zdCBhbGwgbW9iaWxlIGJyb3dzZXJzIHN1cHBvcnQgQ1NTIGFuaW1hdGlvbnMgKGh0dHA6Ly9jYW5pdXNlLmNvbS9jc3MtYW5pbWF0aW9uKS5cclxuICAgKlxyXG4gICAqIEBhdXRob3IgRGFuaWVsIFJhZnRlcnkgOiB0d2l0dGVyL1Rocml2aW5nS2luZ3NcclxuICAgKiBAdmVyc2lvbiAxLjAuMVxyXG4gICovXHJcbiAgZnVuY3Rpb24gYW5pbW8oIGVsZW1lbnQsIG9wdGlvbnMsIGNhbGxiYWNrLCBvdGhlcl9jYiApIHtcclxuICAgIFxyXG4gICAgLy8gRGVmYXVsdCBjb25maWd1cmF0aW9uXHJcbiAgICB2YXIgZGVmYXVsdHMgPSB7XHJcbiAgICBcdGR1cmF0aW9uOiAxLFxyXG4gICAgXHRhbmltYXRpb246IG51bGwsXHJcbiAgICBcdGl0ZXJhdGU6IDEsXHJcbiAgICBcdHRpbWluZzogXCJsaW5lYXJcIixcclxuICAgICAga2VlcDogZmFsc2VcclxuICAgIH07XHJcblxyXG4gICAgLy8gQnJvd3NlciBwcmVmaXhlcyBmb3IgQ1NTXHJcbiAgICB0aGlzLnByZWZpeGVzID0gW1wiXCIsIFwiLW1vei1cIiwgXCItby1hbmltYXRpb24tXCIsIFwiLXdlYmtpdC1cIl07XHJcblxyXG4gICAgLy8gQ2FjaGUgdGhlIGVsZW1lbnRcclxuICAgIHRoaXMuZWxlbWVudCA9ICQoZWxlbWVudCk7XHJcblxyXG4gICAgdGhpcy5iYXJlID0gZWxlbWVudDtcclxuXHJcbiAgICAvLyBGb3Igc3RhY2tpbmcgb2YgYW5pbWF0aW9uc1xyXG4gICAgdGhpcy5xdWV1ZSA9IFtdO1xyXG5cclxuICAgIC8vIEhhY2t5XHJcbiAgICB0aGlzLmxpc3RlbmluZyA9IGZhbHNlO1xyXG5cclxuICAgIC8vIEZpZ3VyZSBvdXQgd2hlcmUgdGhlIGNhbGxiYWNrIGlzXHJcbiAgICB2YXIgY2IgPSAodHlwZW9mIGNhbGxiYWNrID09IFwiZnVuY3Rpb25cIiA/IGNhbGxiYWNrIDogb3RoZXJfY2IpO1xyXG5cclxuICAgIC8vIE9wdGlvbnMgY2FuIHNvbWV0aW1lcyBiZSBhIGNvbW1hbmRcclxuICAgIHN3aXRjaChvcHRpb25zKSB7XHJcblxyXG4gICAgICBjYXNlIFwiYmx1clwiOlxyXG5cclxuICAgICAgXHRkZWZhdWx0cyA9IHtcclxuICAgICAgXHRcdGFtb3VudDogMyxcclxuICAgICAgXHRcdGR1cmF0aW9uOiAwLjUsXHJcbiAgICAgIFx0XHRmb2N1c0FmdGVyOiBudWxsXHJcbiAgICAgIFx0fTtcclxuXHJcbiAgICAgIFx0dGhpcy5vcHRpb25zID0gJC5leHRlbmQoIGRlZmF1bHRzLCBjYWxsYmFjayApO1xyXG5cclxuICBcdCAgICB0aGlzLl9ibHVyKGNiKTtcclxuXHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIFwiZm9jdXNcIjpcclxuXHJcbiAgXHQgIFx0dGhpcy5fZm9jdXMoKTtcclxuXHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIFwicm90YXRlXCI6XHJcblxyXG4gICAgICAgIGRlZmF1bHRzID0ge1xyXG4gICAgICAgICAgZGVncmVlczogMTUsXHJcbiAgICAgICAgICBkdXJhdGlvbjogMC41XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoIGRlZmF1bHRzLCBjYWxsYmFjayApO1xyXG5cclxuICAgICAgICB0aGlzLl9yb3RhdGUoY2IpO1xyXG5cclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgXCJjbGVhbnNlXCI6XHJcblxyXG4gICAgICAgIHRoaXMuY2xlYW5zZSgpO1xyXG5cclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGRlZmF1bHQ6XHJcblxyXG5cdCAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCggZGVmYXVsdHMsIG9wdGlvbnMgKTtcclxuXHJcblx0ICAgIHRoaXMuaW5pdChjYik7XHJcbiAgXHRcclxuICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhbmltby5wcm90b3R5cGUgPSB7XHJcblxyXG4gICAgLy8gQSBzdGFuZGFyZCBDU1MgYW5pbWF0aW9uXHJcbiAgICBpbml0OiBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gICAgICBcclxuICAgICAgdmFyICRtZSA9IHRoaXM7XHJcblxyXG4gICAgICAvLyBBcmUgd2Ugc3RhY2tpbmcgYW5pbWF0aW9ucz9cclxuICAgICAgaWYoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKCAkbWUub3B0aW9ucy5hbmltYXRpb24gKSA9PT0gJ1tvYmplY3QgQXJyYXldJykge1xyXG4gICAgICBcdCQubWVyZ2UoJG1lLnF1ZXVlLCAkbWUub3B0aW9ucy5hbmltYXRpb24pO1xyXG4gICAgICB9IGVsc2Uge1xyXG5cdCAgICAgICRtZS5xdWV1ZS5wdXNoKCRtZS5vcHRpb25zLmFuaW1hdGlvbik7XHJcblx0ICAgIH1cclxuXHJcblx0ICAgICRtZS5jbGVhbnNlKCk7XHJcblxyXG5cdCAgICAkbWUuYW5pbWF0ZShjYWxsYmFjayk7XHJcbiAgICAgIFxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBUaGUgYWN0dWFsIGFkZGluZyBvZiB0aGUgY2xhc3MgYW5kIGxpc3RlbmluZyBmb3IgY29tcGxldGlvblxyXG4gICAgYW5pbWF0ZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuXHJcbiAgICBcdHRoaXMuZWxlbWVudC5hZGRDbGFzcygnYW5pbWF0ZWQnKTtcclxuXHJcbiAgICAgIHRoaXMuZWxlbWVudC5hZGRDbGFzcyh0aGlzLnF1ZXVlWzBdKTtcclxuXHJcbiAgICAgIHRoaXMuZWxlbWVudC5kYXRhKFwiYW5pbW9cIiwgdGhpcy5xdWV1ZVswXSk7XHJcblxyXG4gICAgICB2YXIgYWkgPSB0aGlzLnByZWZpeGVzLmxlbmd0aDtcclxuXHJcbiAgICAgIC8vIEFkZCB0aGUgb3B0aW9ucyBmb3IgZWFjaCBwcmVmaXhcclxuICAgICAgd2hpbGUoYWktLSkge1xyXG5cclxuICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiYW5pbWF0aW9uLWR1cmF0aW9uXCIsIHRoaXMub3B0aW9ucy5kdXJhdGlvbitcInNcIik7XHJcblxyXG4gICAgICBcdHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJhbmltYXRpb24taXRlcmF0aW9uLWNvdW50XCIsIHRoaXMub3B0aW9ucy5pdGVyYXRlKTtcclxuXHJcbiAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcImFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb25cIiwgdGhpcy5vcHRpb25zLnRpbWluZyk7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgJG1lID0gdGhpcywgX2NiID0gY2FsbGJhY2s7XHJcblxyXG4gICAgICBpZigkbWUucXVldWUubGVuZ3RoPjEpIHtcclxuICAgICAgICBfY2IgPSBudWxsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBMaXN0ZW4gZm9yIHRoZSBlbmQgb2YgdGhlIGFuaW1hdGlvblxyXG4gICAgICB0aGlzLl9lbmQoXCJBbmltYXRpb25FbmRcIiwgZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIC8vIElmIHRoZXJlIGFyZSBtb3JlLCBjbGVhbiBpdCB1cCBhbmQgbW92ZSBvblxyXG4gICAgICBcdGlmKCRtZS5lbGVtZW50Lmhhc0NsYXNzKCRtZS5xdWV1ZVswXSkpIHtcclxuXHJcblx0ICAgIFx0XHRpZighJG1lLm9wdGlvbnMua2VlcCkge1xyXG4gICAgICAgICAgICAkbWUuY2xlYW5zZSgpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICRtZS5xdWV1ZS5zaGlmdCgpO1xyXG5cclxuXHQgICAgXHRcdGlmKCRtZS5xdWV1ZS5sZW5ndGgpIHtcclxuXHJcblx0XHQgICAgICBcdCRtZS5hbmltYXRlKGNhbGxiYWNrKTtcclxuXHRcdCAgICAgIH1cclxuXHRcdFx0ICB9XHJcblx0XHQgIH0sIF9jYik7XHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFuc2U6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIFx0dGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKCdhbmltYXRlZCcpO1xyXG5cclxuICBcdFx0dGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKHRoaXMucXVldWVbMF0pO1xyXG5cclxuICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKHRoaXMuZWxlbWVudC5kYXRhKFwiYW5pbW9cIikpO1xyXG5cclxuICBcdFx0dmFyIGFpID0gdGhpcy5wcmVmaXhlcy5sZW5ndGg7XHJcblxyXG4gIFx0XHR3aGlsZShhaS0tKSB7XHJcblxyXG4gICAgICBcdHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJhbmltYXRpb24tZHVyYXRpb25cIiwgXCJcIik7XHJcblxyXG4gICAgICBcdHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJhbmltYXRpb24taXRlcmF0aW9uLWNvdW50XCIsIFwiXCIpO1xyXG5cclxuICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiYW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvblwiLCBcIlwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcInRyYW5zaXRpb25cIiwgXCJcIik7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJ0cmFuc2Zvcm1cIiwgXCJcIik7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJmaWx0ZXJcIiwgXCJcIik7XHJcblxyXG4gICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9ibHVyOiBmdW5jdGlvbihjYWxsYmFjaykge1xyXG5cclxuICAgICAgaWYodGhpcy5lbGVtZW50LmlzKFwiaW1nXCIpKSB7XHJcblxyXG4gICAgICBcdHZhciBzdmdfaWQgPSBcInN2Z19cIiArICgoKDEgKyBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDAwMCkgfCAwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpO1xyXG4gICAgICBcdHZhciBmaWx0ZXJfaWQgPSBcImZpbHRlcl9cIiArICgoKDEgKyBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDAwMCkgfCAwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpO1xyXG5cclxuICAgICAgXHQkKCdib2R5JykuYXBwZW5kKCc8c3ZnIHZlcnNpb249XCIxLjFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgaWQ9XCInK3N2Z19pZCsnXCIgc3R5bGU9XCJoZWlnaHQ6MDtcIj48ZmlsdGVyIGlkPVwiJytmaWx0ZXJfaWQrJ1wiPjxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249XCInK3RoaXMub3B0aW9ucy5hbW91bnQrJ1wiIC8+PC9maWx0ZXI+PC9zdmc+Jyk7XHJcblxyXG4gICAgICBcdHZhciBhaSA9IHRoaXMucHJlZml4ZXMubGVuZ3RoO1xyXG5cclxuICAgIFx0XHR3aGlsZShhaS0tKSB7XHJcblxyXG4gICAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcImZpbHRlclwiLCBcImJsdXIoXCIrdGhpcy5vcHRpb25zLmFtb3VudCtcInB4KVwiKTtcclxuXHJcbiAgICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1widHJhbnNpdGlvblwiLCB0aGlzLm9wdGlvbnMuZHVyYXRpb24rXCJzIGFsbCBsaW5lYXJcIik7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNzcyhcImZpbHRlclwiLCBcInVybCgjXCIrZmlsdGVyX2lkK1wiKVwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmRhdGEoXCJzdmdpZFwiLCBzdmdfaWQpO1xyXG4gICAgICBcclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgdmFyIGNvbG9yID0gdGhpcy5lbGVtZW50LmNzcygnY29sb3InKTtcclxuXHJcbiAgICAgICAgdmFyIGFpID0gdGhpcy5wcmVmaXhlcy5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8vIEFkZCB0aGUgb3B0aW9ucyBmb3IgZWFjaCBwcmVmaXhcclxuICAgICAgICB3aGlsZShhaS0tKSB7XHJcblxyXG4gICAgICAgICAgdGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcInRyYW5zaXRpb25cIiwgXCJhbGwgXCIrdGhpcy5vcHRpb25zLmR1cmF0aW9uK1wicyBsaW5lYXJcIik7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNzcyhcInRleHQtc2hhZG93XCIsIFwiMCAwIFwiK3RoaXMub3B0aW9ucy5hbW91bnQrXCJweCBcIitjb2xvcik7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNzcyhcImNvbG9yXCIsIFwidHJhbnNwYXJlbnRcIik7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuX2VuZChcIlRyYW5zaXRpb25FbmRcIiwgbnVsbCwgY2FsbGJhY2spO1xyXG5cclxuICAgICAgdmFyICRtZSA9IHRoaXM7XHJcblxyXG4gICAgICBpZih0aGlzLm9wdGlvbnMuZm9jdXNBZnRlcikge1xyXG5cclxuICAgICAgICB2YXIgZm9jdXNfd2FpdCA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICRtZS5fZm9jdXMoKTtcclxuXHJcbiAgICAgICAgICBmb2N1c193YWl0ID0gd2luZG93LmNsZWFyVGltZW91dChmb2N1c193YWl0KTtcclxuXHJcbiAgICAgICAgfSwgKHRoaXMub3B0aW9ucy5mb2N1c0FmdGVyKjEwMDApKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgX2ZvY3VzOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBcdHZhciBhaSA9IHRoaXMucHJlZml4ZXMubGVuZ3RoO1xyXG5cclxuICAgICAgaWYodGhpcy5lbGVtZW50LmlzKFwiaW1nXCIpKSB7XHJcblxyXG4gICAgXHRcdHdoaWxlKGFpLS0pIHtcclxuXHJcbiAgICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiZmlsdGVyXCIsIFwiXCIpO1xyXG5cclxuICAgICAgICBcdHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJ0cmFuc2l0aW9uXCIsIFwiXCIpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciAkc3ZnID0gJCgnIycrdGhpcy5lbGVtZW50LmRhdGEoJ3N2Z2lkJykpO1xyXG5cclxuICAgICAgICAkc3ZnLnJlbW92ZSgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICB3aGlsZShhaS0tKSB7XHJcblxyXG4gICAgICAgICAgdGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcInRyYW5zaXRpb25cIiwgXCJcIik7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNzcyhcInRleHQtc2hhZG93XCIsIFwiXCIpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3MoXCJjb2xvclwiLCBcIlwiKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfcm90YXRlOiBmdW5jdGlvbihjYWxsYmFjaykge1xyXG5cclxuICAgICAgdmFyIGFpID0gdGhpcy5wcmVmaXhlcy5sZW5ndGg7XHJcblxyXG4gICAgICAvLyBBZGQgdGhlIG9wdGlvbnMgZm9yIGVhY2ggcHJlZml4XHJcbiAgICAgIHdoaWxlKGFpLS0pIHtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcInRyYW5zaXRpb25cIiwgXCJhbGwgXCIrdGhpcy5vcHRpb25zLmR1cmF0aW9uK1wicyBsaW5lYXJcIik7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJ0cmFuc2Zvcm1cIiwgXCJyb3RhdGUoXCIrdGhpcy5vcHRpb25zLmRlZ3JlZXMrXCJkZWcpXCIpO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5fZW5kKFwiVHJhbnNpdGlvbkVuZFwiLCBudWxsLCBjYWxsYmFjayk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBfZW5kOiBmdW5jdGlvbih0eXBlLCB0b2RvLCBjYWxsYmFjaykge1xyXG5cclxuICAgICAgdmFyICRtZSA9IHRoaXM7XHJcblxyXG4gICAgICB2YXIgYmluZGluZyA9IHR5cGUudG9Mb3dlckNhc2UoKStcIiB3ZWJraXRcIit0eXBlK1wiIG9cIit0eXBlK1wiIE1TXCIrdHlwZTtcclxuXHJcbiAgICAgIHRoaXMuZWxlbWVudC5iaW5kKGJpbmRpbmcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIFxyXG4gICAgICAgICRtZS5lbGVtZW50LnVuYmluZChiaW5kaW5nKTtcclxuXHJcbiAgICAgICAgaWYodHlwZW9mIHRvZG8gPT0gXCJmdW5jdGlvblwiKSB7XHJcblxyXG4gICAgICAgICAgdG9kbygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYodHlwZW9mIGNhbGxiYWNrID09IFwiZnVuY3Rpb25cIikge1xyXG5cclxuICAgICAgICAgIGNhbGxiYWNrKCRtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgXHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJC5mbi5hbmltbyA9IGZ1bmN0aW9uICggb3B0aW9ucywgY2FsbGJhY2ssIG90aGVyX2NiICkge1xyXG4gICAgXHJcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcclxuXHRcdFx0bmV3IGFuaW1vKCB0aGlzLCBvcHRpb25zLCBjYWxsYmFjaywgb3RoZXJfY2IgKTtcclxuXHJcblx0XHR9KTtcclxuXHJcbiAgfTtcclxuXHJcbn0pKCBqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQgKTsiLCIvKiFcclxuV2F5cG9pbnRzIC0gMy4xLjFcclxuQ29weXJpZ2h0IMKpIDIwMTEtMjAxNSBDYWxlYiBUcm91Z2h0b25cclxuTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxyXG5odHRwczovL2dpdGh1Yi5jb20vaW1ha2V3ZWJ0aGluZ3Mvd2F5cG9pbnRzL2Jsb2cvbWFzdGVyL2xpY2Vuc2VzLnR4dFxyXG4qL1xyXG4hZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiB0KG8pe2lmKCFvKXRocm93IG5ldyBFcnJvcihcIk5vIG9wdGlvbnMgcGFzc2VkIHRvIFdheXBvaW50IGNvbnN0cnVjdG9yXCIpO2lmKCFvLmVsZW1lbnQpdGhyb3cgbmV3IEVycm9yKFwiTm8gZWxlbWVudCBvcHRpb24gcGFzc2VkIHRvIFdheXBvaW50IGNvbnN0cnVjdG9yXCIpO2lmKCFvLmhhbmRsZXIpdGhyb3cgbmV3IEVycm9yKFwiTm8gaGFuZGxlciBvcHRpb24gcGFzc2VkIHRvIFdheXBvaW50IGNvbnN0cnVjdG9yXCIpO3RoaXMua2V5PVwid2F5cG9pbnQtXCIrZSx0aGlzLm9wdGlvbnM9dC5BZGFwdGVyLmV4dGVuZCh7fSx0LmRlZmF1bHRzLG8pLHRoaXMuZWxlbWVudD10aGlzLm9wdGlvbnMuZWxlbWVudCx0aGlzLmFkYXB0ZXI9bmV3IHQuQWRhcHRlcih0aGlzLmVsZW1lbnQpLHRoaXMuY2FsbGJhY2s9by5oYW5kbGVyLHRoaXMuYXhpcz10aGlzLm9wdGlvbnMuaG9yaXpvbnRhbD9cImhvcml6b250YWxcIjpcInZlcnRpY2FsXCIsdGhpcy5lbmFibGVkPXRoaXMub3B0aW9ucy5lbmFibGVkLHRoaXMudHJpZ2dlclBvaW50PW51bGwsdGhpcy5ncm91cD10Lkdyb3VwLmZpbmRPckNyZWF0ZSh7bmFtZTp0aGlzLm9wdGlvbnMuZ3JvdXAsYXhpczp0aGlzLmF4aXN9KSx0aGlzLmNvbnRleHQ9dC5Db250ZXh0LmZpbmRPckNyZWF0ZUJ5RWxlbWVudCh0aGlzLm9wdGlvbnMuY29udGV4dCksdC5vZmZzZXRBbGlhc2VzW3RoaXMub3B0aW9ucy5vZmZzZXRdJiYodGhpcy5vcHRpb25zLm9mZnNldD10Lm9mZnNldEFsaWFzZXNbdGhpcy5vcHRpb25zLm9mZnNldF0pLHRoaXMuZ3JvdXAuYWRkKHRoaXMpLHRoaXMuY29udGV4dC5hZGQodGhpcyksaVt0aGlzLmtleV09dGhpcyxlKz0xfXZhciBlPTAsaT17fTt0LnByb3RvdHlwZS5xdWV1ZVRyaWdnZXI9ZnVuY3Rpb24odCl7dGhpcy5ncm91cC5xdWV1ZVRyaWdnZXIodGhpcyx0KX0sdC5wcm90b3R5cGUudHJpZ2dlcj1mdW5jdGlvbih0KXt0aGlzLmVuYWJsZWQmJnRoaXMuY2FsbGJhY2smJnRoaXMuY2FsbGJhY2suYXBwbHkodGhpcyx0KX0sdC5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe3RoaXMuY29udGV4dC5yZW1vdmUodGhpcyksdGhpcy5ncm91cC5yZW1vdmUodGhpcyksZGVsZXRlIGlbdGhpcy5rZXldfSx0LnByb3RvdHlwZS5kaXNhYmxlPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZW5hYmxlZD0hMSx0aGlzfSx0LnByb3RvdHlwZS5lbmFibGU9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5jb250ZXh0LnJlZnJlc2goKSx0aGlzLmVuYWJsZWQ9ITAsdGhpc30sdC5wcm90b3R5cGUubmV4dD1mdW5jdGlvbigpe3JldHVybiB0aGlzLmdyb3VwLm5leHQodGhpcyl9LHQucHJvdG90eXBlLnByZXZpb3VzPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZ3JvdXAucHJldmlvdXModGhpcyl9LHQuaW52b2tlQWxsPWZ1bmN0aW9uKHQpe3ZhciBlPVtdO2Zvcih2YXIgbyBpbiBpKWUucHVzaChpW29dKTtmb3IodmFyIG49MCxyPWUubGVuZ3RoO3I+bjtuKyspZVtuXVt0XSgpfSx0LmRlc3Ryb3lBbGw9ZnVuY3Rpb24oKXt0Lmludm9rZUFsbChcImRlc3Ryb3lcIil9LHQuZGlzYWJsZUFsbD1mdW5jdGlvbigpe3QuaW52b2tlQWxsKFwiZGlzYWJsZVwiKX0sdC5lbmFibGVBbGw9ZnVuY3Rpb24oKXt0Lmludm9rZUFsbChcImVuYWJsZVwiKX0sdC5yZWZyZXNoQWxsPWZ1bmN0aW9uKCl7dC5Db250ZXh0LnJlZnJlc2hBbGwoKX0sdC52aWV3cG9ydEhlaWdodD1mdW5jdGlvbigpe3JldHVybiB3aW5kb3cuaW5uZXJIZWlnaHR8fGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHR9LHQudmlld3BvcnRXaWR0aD1mdW5jdGlvbigpe3JldHVybiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGh9LHQuYWRhcHRlcnM9W10sdC5kZWZhdWx0cz17Y29udGV4dDp3aW5kb3csY29udGludW91czohMCxlbmFibGVkOiEwLGdyb3VwOlwiZGVmYXVsdFwiLGhvcml6b250YWw6ITEsb2Zmc2V0OjB9LHQub2Zmc2V0QWxpYXNlcz17XCJib3R0b20taW4tdmlld1wiOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuY29udGV4dC5pbm5lckhlaWdodCgpLXRoaXMuYWRhcHRlci5vdXRlckhlaWdodCgpfSxcInJpZ2h0LWluLXZpZXdcIjpmdW5jdGlvbigpe3JldHVybiB0aGlzLmNvbnRleHQuaW5uZXJXaWR0aCgpLXRoaXMuYWRhcHRlci5vdXRlcldpZHRoKCl9fSx3aW5kb3cuV2F5cG9pbnQ9dH0oKSxmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHQodCl7d2luZG93LnNldFRpbWVvdXQodCwxZTMvNjApfWZ1bmN0aW9uIGUodCl7dGhpcy5lbGVtZW50PXQsdGhpcy5BZGFwdGVyPW4uQWRhcHRlcix0aGlzLmFkYXB0ZXI9bmV3IHRoaXMuQWRhcHRlcih0KSx0aGlzLmtleT1cIndheXBvaW50LWNvbnRleHQtXCIraSx0aGlzLmRpZFNjcm9sbD0hMSx0aGlzLmRpZFJlc2l6ZT0hMSx0aGlzLm9sZFNjcm9sbD17eDp0aGlzLmFkYXB0ZXIuc2Nyb2xsTGVmdCgpLHk6dGhpcy5hZGFwdGVyLnNjcm9sbFRvcCgpfSx0aGlzLndheXBvaW50cz17dmVydGljYWw6e30saG9yaXpvbnRhbDp7fX0sdC53YXlwb2ludENvbnRleHRLZXk9dGhpcy5rZXksb1t0LndheXBvaW50Q29udGV4dEtleV09dGhpcyxpKz0xLHRoaXMuY3JlYXRlVGhyb3R0bGVkU2Nyb2xsSGFuZGxlcigpLHRoaXMuY3JlYXRlVGhyb3R0bGVkUmVzaXplSGFuZGxlcigpfXZhciBpPTAsbz17fSxuPXdpbmRvdy5XYXlwb2ludCxyPXdpbmRvdy5vbmxvYWQ7ZS5wcm90b3R5cGUuYWRkPWZ1bmN0aW9uKHQpe3ZhciBlPXQub3B0aW9ucy5ob3Jpem9udGFsP1wiaG9yaXpvbnRhbFwiOlwidmVydGljYWxcIjt0aGlzLndheXBvaW50c1tlXVt0LmtleV09dCx0aGlzLnJlZnJlc2goKX0sZS5wcm90b3R5cGUuY2hlY2tFbXB0eT1mdW5jdGlvbigpe3ZhciB0PXRoaXMuQWRhcHRlci5pc0VtcHR5T2JqZWN0KHRoaXMud2F5cG9pbnRzLmhvcml6b250YWwpLGU9dGhpcy5BZGFwdGVyLmlzRW1wdHlPYmplY3QodGhpcy53YXlwb2ludHMudmVydGljYWwpO3QmJmUmJih0aGlzLmFkYXB0ZXIub2ZmKFwiLndheXBvaW50c1wiKSxkZWxldGUgb1t0aGlzLmtleV0pfSxlLnByb3RvdHlwZS5jcmVhdGVUaHJvdHRsZWRSZXNpemVIYW5kbGVyPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCgpe2UuaGFuZGxlUmVzaXplKCksZS5kaWRSZXNpemU9ITF9dmFyIGU9dGhpczt0aGlzLmFkYXB0ZXIub24oXCJyZXNpemUud2F5cG9pbnRzXCIsZnVuY3Rpb24oKXtlLmRpZFJlc2l6ZXx8KGUuZGlkUmVzaXplPSEwLG4ucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHQpKX0pfSxlLnByb3RvdHlwZS5jcmVhdGVUaHJvdHRsZWRTY3JvbGxIYW5kbGVyPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCgpe2UuaGFuZGxlU2Nyb2xsKCksZS5kaWRTY3JvbGw9ITF9dmFyIGU9dGhpczt0aGlzLmFkYXB0ZXIub24oXCJzY3JvbGwud2F5cG9pbnRzXCIsZnVuY3Rpb24oKXsoIWUuZGlkU2Nyb2xsfHxuLmlzVG91Y2gpJiYoZS5kaWRTY3JvbGw9ITAsbi5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodCkpfSl9LGUucHJvdG90eXBlLmhhbmRsZVJlc2l6ZT1mdW5jdGlvbigpe24uQ29udGV4dC5yZWZyZXNoQWxsKCl9LGUucHJvdG90eXBlLmhhbmRsZVNjcm9sbD1mdW5jdGlvbigpe3ZhciB0PXt9LGU9e2hvcml6b250YWw6e25ld1Njcm9sbDp0aGlzLmFkYXB0ZXIuc2Nyb2xsTGVmdCgpLG9sZFNjcm9sbDp0aGlzLm9sZFNjcm9sbC54LGZvcndhcmQ6XCJyaWdodFwiLGJhY2t3YXJkOlwibGVmdFwifSx2ZXJ0aWNhbDp7bmV3U2Nyb2xsOnRoaXMuYWRhcHRlci5zY3JvbGxUb3AoKSxvbGRTY3JvbGw6dGhpcy5vbGRTY3JvbGwueSxmb3J3YXJkOlwiZG93blwiLGJhY2t3YXJkOlwidXBcIn19O2Zvcih2YXIgaSBpbiBlKXt2YXIgbz1lW2ldLG49by5uZXdTY3JvbGw+by5vbGRTY3JvbGwscj1uP28uZm9yd2FyZDpvLmJhY2t3YXJkO2Zvcih2YXIgcyBpbiB0aGlzLndheXBvaW50c1tpXSl7dmFyIGE9dGhpcy53YXlwb2ludHNbaV1bc10sbD1vLm9sZFNjcm9sbDxhLnRyaWdnZXJQb2ludCxoPW8ubmV3U2Nyb2xsPj1hLnRyaWdnZXJQb2ludCxwPWwmJmgsdT0hbCYmIWg7KHB8fHUpJiYoYS5xdWV1ZVRyaWdnZXIociksdFthLmdyb3VwLmlkXT1hLmdyb3VwKX19Zm9yKHZhciBjIGluIHQpdFtjXS5mbHVzaFRyaWdnZXJzKCk7dGhpcy5vbGRTY3JvbGw9e3g6ZS5ob3Jpem9udGFsLm5ld1Njcm9sbCx5OmUudmVydGljYWwubmV3U2Nyb2xsfX0sZS5wcm90b3R5cGUuaW5uZXJIZWlnaHQ9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5lbGVtZW50PT10aGlzLmVsZW1lbnQud2luZG93P24udmlld3BvcnRIZWlnaHQoKTp0aGlzLmFkYXB0ZXIuaW5uZXJIZWlnaHQoKX0sZS5wcm90b3R5cGUucmVtb3ZlPWZ1bmN0aW9uKHQpe2RlbGV0ZSB0aGlzLndheXBvaW50c1t0LmF4aXNdW3Qua2V5XSx0aGlzLmNoZWNrRW1wdHkoKX0sZS5wcm90b3R5cGUuaW5uZXJXaWR0aD1mdW5jdGlvbigpe3JldHVybiB0aGlzLmVsZW1lbnQ9PXRoaXMuZWxlbWVudC53aW5kb3c/bi52aWV3cG9ydFdpZHRoKCk6dGhpcy5hZGFwdGVyLmlubmVyV2lkdGgoKX0sZS5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe3ZhciB0PVtdO2Zvcih2YXIgZSBpbiB0aGlzLndheXBvaW50cylmb3IodmFyIGkgaW4gdGhpcy53YXlwb2ludHNbZV0pdC5wdXNoKHRoaXMud2F5cG9pbnRzW2VdW2ldKTtmb3IodmFyIG89MCxuPXQubGVuZ3RoO24+bztvKyspdFtvXS5kZXN0cm95KCl9LGUucHJvdG90eXBlLnJlZnJlc2g9ZnVuY3Rpb24oKXt2YXIgdCxlPXRoaXMuZWxlbWVudD09dGhpcy5lbGVtZW50LndpbmRvdyxpPXRoaXMuYWRhcHRlci5vZmZzZXQoKSxvPXt9O3RoaXMuaGFuZGxlU2Nyb2xsKCksdD17aG9yaXpvbnRhbDp7Y29udGV4dE9mZnNldDplPzA6aS5sZWZ0LGNvbnRleHRTY3JvbGw6ZT8wOnRoaXMub2xkU2Nyb2xsLngsY29udGV4dERpbWVuc2lvbjp0aGlzLmlubmVyV2lkdGgoKSxvbGRTY3JvbGw6dGhpcy5vbGRTY3JvbGwueCxmb3J3YXJkOlwicmlnaHRcIixiYWNrd2FyZDpcImxlZnRcIixvZmZzZXRQcm9wOlwibGVmdFwifSx2ZXJ0aWNhbDp7Y29udGV4dE9mZnNldDplPzA6aS50b3AsY29udGV4dFNjcm9sbDplPzA6dGhpcy5vbGRTY3JvbGwueSxjb250ZXh0RGltZW5zaW9uOnRoaXMuaW5uZXJIZWlnaHQoKSxvbGRTY3JvbGw6dGhpcy5vbGRTY3JvbGwueSxmb3J3YXJkOlwiZG93blwiLGJhY2t3YXJkOlwidXBcIixvZmZzZXRQcm9wOlwidG9wXCJ9fTtmb3IodmFyIG4gaW4gdCl7dmFyIHI9dFtuXTtmb3IodmFyIHMgaW4gdGhpcy53YXlwb2ludHNbbl0pe3ZhciBhLGwsaCxwLHUsYz10aGlzLndheXBvaW50c1tuXVtzXSxkPWMub3B0aW9ucy5vZmZzZXQsZj1jLnRyaWdnZXJQb2ludCx3PTAseT1udWxsPT1mO2MuZWxlbWVudCE9PWMuZWxlbWVudC53aW5kb3cmJih3PWMuYWRhcHRlci5vZmZzZXQoKVtyLm9mZnNldFByb3BdKSxcImZ1bmN0aW9uXCI9PXR5cGVvZiBkP2Q9ZC5hcHBseShjKTpcInN0cmluZ1wiPT10eXBlb2YgZCYmKGQ9cGFyc2VGbG9hdChkKSxjLm9wdGlvbnMub2Zmc2V0LmluZGV4T2YoXCIlXCIpPi0xJiYoZD1NYXRoLmNlaWwoci5jb250ZXh0RGltZW5zaW9uKmQvMTAwKSkpLGE9ci5jb250ZXh0U2Nyb2xsLXIuY29udGV4dE9mZnNldCxjLnRyaWdnZXJQb2ludD13K2EtZCxsPWY8ci5vbGRTY3JvbGwsaD1jLnRyaWdnZXJQb2ludD49ci5vbGRTY3JvbGwscD1sJiZoLHU9IWwmJiFoLCF5JiZwPyhjLnF1ZXVlVHJpZ2dlcihyLmJhY2t3YXJkKSxvW2MuZ3JvdXAuaWRdPWMuZ3JvdXApOiF5JiZ1PyhjLnF1ZXVlVHJpZ2dlcihyLmZvcndhcmQpLG9bYy5ncm91cC5pZF09Yy5ncm91cCk6eSYmci5vbGRTY3JvbGw+PWMudHJpZ2dlclBvaW50JiYoYy5xdWV1ZVRyaWdnZXIoci5mb3J3YXJkKSxvW2MuZ3JvdXAuaWRdPWMuZ3JvdXApfX1mb3IodmFyIGcgaW4gbylvW2ddLmZsdXNoVHJpZ2dlcnMoKTtyZXR1cm4gdGhpc30sZS5maW5kT3JDcmVhdGVCeUVsZW1lbnQ9ZnVuY3Rpb24odCl7cmV0dXJuIGUuZmluZEJ5RWxlbWVudCh0KXx8bmV3IGUodCl9LGUucmVmcmVzaEFsbD1mdW5jdGlvbigpe2Zvcih2YXIgdCBpbiBvKW9bdF0ucmVmcmVzaCgpfSxlLmZpbmRCeUVsZW1lbnQ9ZnVuY3Rpb24odCl7cmV0dXJuIG9bdC53YXlwb2ludENvbnRleHRLZXldfSx3aW5kb3cub25sb2FkPWZ1bmN0aW9uKCl7ciYmcigpLGUucmVmcmVzaEFsbCgpfSxuLnJlcXVlc3RBbmltYXRpb25GcmFtZT1mdW5jdGlvbihlKXt2YXIgaT13aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lfHx3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lfHx3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lfHx0O2kuY2FsbCh3aW5kb3csZSl9LG4uQ29udGV4dD1lfSgpLGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gdCh0LGUpe3JldHVybiB0LnRyaWdnZXJQb2ludC1lLnRyaWdnZXJQb2ludH1mdW5jdGlvbiBlKHQsZSl7cmV0dXJuIGUudHJpZ2dlclBvaW50LXQudHJpZ2dlclBvaW50fWZ1bmN0aW9uIGkodCl7dGhpcy5uYW1lPXQubmFtZSx0aGlzLmF4aXM9dC5heGlzLHRoaXMuaWQ9dGhpcy5uYW1lK1wiLVwiK3RoaXMuYXhpcyx0aGlzLndheXBvaW50cz1bXSx0aGlzLmNsZWFyVHJpZ2dlclF1ZXVlcygpLG9bdGhpcy5heGlzXVt0aGlzLm5hbWVdPXRoaXN9dmFyIG89e3ZlcnRpY2FsOnt9LGhvcml6b250YWw6e319LG49d2luZG93LldheXBvaW50O2kucHJvdG90eXBlLmFkZD1mdW5jdGlvbih0KXt0aGlzLndheXBvaW50cy5wdXNoKHQpfSxpLnByb3RvdHlwZS5jbGVhclRyaWdnZXJRdWV1ZXM9ZnVuY3Rpb24oKXt0aGlzLnRyaWdnZXJRdWV1ZXM9e3VwOltdLGRvd246W10sbGVmdDpbXSxyaWdodDpbXX19LGkucHJvdG90eXBlLmZsdXNoVHJpZ2dlcnM9ZnVuY3Rpb24oKXtmb3IodmFyIGkgaW4gdGhpcy50cmlnZ2VyUXVldWVzKXt2YXIgbz10aGlzLnRyaWdnZXJRdWV1ZXNbaV0sbj1cInVwXCI9PT1pfHxcImxlZnRcIj09PWk7by5zb3J0KG4/ZTp0KTtmb3IodmFyIHI9MCxzPW8ubGVuZ3RoO3M+cjtyKz0xKXt2YXIgYT1vW3JdOyhhLm9wdGlvbnMuY29udGludW91c3x8cj09PW8ubGVuZ3RoLTEpJiZhLnRyaWdnZXIoW2ldKX19dGhpcy5jbGVhclRyaWdnZXJRdWV1ZXMoKX0saS5wcm90b3R5cGUubmV4dD1mdW5jdGlvbihlKXt0aGlzLndheXBvaW50cy5zb3J0KHQpO3ZhciBpPW4uQWRhcHRlci5pbkFycmF5KGUsdGhpcy53YXlwb2ludHMpLG89aT09PXRoaXMud2F5cG9pbnRzLmxlbmd0aC0xO3JldHVybiBvP251bGw6dGhpcy53YXlwb2ludHNbaSsxXX0saS5wcm90b3R5cGUucHJldmlvdXM9ZnVuY3Rpb24oZSl7dGhpcy53YXlwb2ludHMuc29ydCh0KTt2YXIgaT1uLkFkYXB0ZXIuaW5BcnJheShlLHRoaXMud2F5cG9pbnRzKTtyZXR1cm4gaT90aGlzLndheXBvaW50c1tpLTFdOm51bGx9LGkucHJvdG90eXBlLnF1ZXVlVHJpZ2dlcj1mdW5jdGlvbih0LGUpe3RoaXMudHJpZ2dlclF1ZXVlc1tlXS5wdXNoKHQpfSxpLnByb3RvdHlwZS5yZW1vdmU9ZnVuY3Rpb24odCl7dmFyIGU9bi5BZGFwdGVyLmluQXJyYXkodCx0aGlzLndheXBvaW50cyk7ZT4tMSYmdGhpcy53YXlwb2ludHMuc3BsaWNlKGUsMSl9LGkucHJvdG90eXBlLmZpcnN0PWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMud2F5cG9pbnRzWzBdfSxpLnByb3RvdHlwZS5sYXN0PWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMud2F5cG9pbnRzW3RoaXMud2F5cG9pbnRzLmxlbmd0aC0xXX0saS5maW5kT3JDcmVhdGU9ZnVuY3Rpb24odCl7cmV0dXJuIG9bdC5heGlzXVt0Lm5hbWVdfHxuZXcgaSh0KX0sbi5Hcm91cD1pfSgpLGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gdCh0KXt0aGlzLiRlbGVtZW50PWUodCl9dmFyIGU9d2luZG93LmpRdWVyeSxpPXdpbmRvdy5XYXlwb2ludDtlLmVhY2goW1wiaW5uZXJIZWlnaHRcIixcImlubmVyV2lkdGhcIixcIm9mZlwiLFwib2Zmc2V0XCIsXCJvblwiLFwib3V0ZXJIZWlnaHRcIixcIm91dGVyV2lkdGhcIixcInNjcm9sbExlZnRcIixcInNjcm9sbFRvcFwiXSxmdW5jdGlvbihlLGkpe3QucHJvdG90eXBlW2ldPWZ1bmN0aW9uKCl7dmFyIHQ9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtyZXR1cm4gdGhpcy4kZWxlbWVudFtpXS5hcHBseSh0aGlzLiRlbGVtZW50LHQpfX0pLGUuZWFjaChbXCJleHRlbmRcIixcImluQXJyYXlcIixcImlzRW1wdHlPYmplY3RcIl0sZnVuY3Rpb24oaSxvKXt0W29dPWVbb119KSxpLmFkYXB0ZXJzLnB1c2goe25hbWU6XCJqcXVlcnlcIixBZGFwdGVyOnR9KSxpLkFkYXB0ZXI9dH0oKSxmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHQodCl7cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIGk9W10sbz1hcmd1bWVudHNbMF07cmV0dXJuIHQuaXNGdW5jdGlvbihhcmd1bWVudHNbMF0pJiYobz10LmV4dGVuZCh7fSxhcmd1bWVudHNbMV0pLG8uaGFuZGxlcj1hcmd1bWVudHNbMF0pLHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciBuPXQuZXh0ZW5kKHt9LG8se2VsZW1lbnQ6dGhpc30pO1wic3RyaW5nXCI9PXR5cGVvZiBuLmNvbnRleHQmJihuLmNvbnRleHQ9dCh0aGlzKS5jbG9zZXN0KG4uY29udGV4dClbMF0pLGkucHVzaChuZXcgZShuKSl9KSxpfX12YXIgZT13aW5kb3cuV2F5cG9pbnQ7d2luZG93LmpRdWVyeSYmKHdpbmRvdy5qUXVlcnkuZm4ud2F5cG9pbnQ9dCh3aW5kb3cualF1ZXJ5KSksd2luZG93LlplcHRvJiYod2luZG93LlplcHRvLmZuLndheXBvaW50PXQod2luZG93LlplcHRvKSl9KCk7IiwiLyoqIEFic3RyYWN0IGJhc2UgY2xhc3MgZm9yIGNvbGxlY3Rpb24gcGx1Z2lucyB2MS4wLjEuXHJcblx0V3JpdHRlbiBieSBLZWl0aCBXb29kIChrYndvb2R7YXR9aWluZXQuY29tLmF1KSBEZWNlbWJlciAyMDEzLlxyXG5cdExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgKGh0dHA6Ly9rZWl0aC13b29kLm5hbWUvbGljZW5jZS5odG1sKSBsaWNlbnNlLiAqL1xyXG4oZnVuY3Rpb24oKXt2YXIgaj1mYWxzZTt3aW5kb3cuSlFDbGFzcz1mdW5jdGlvbigpe307SlFDbGFzcy5jbGFzc2VzPXt9O0pRQ2xhc3MuZXh0ZW5kPWZ1bmN0aW9uIGV4dGVuZGVyKGYpe3ZhciBnPXRoaXMucHJvdG90eXBlO2o9dHJ1ZTt2YXIgaD1uZXcgdGhpcygpO2o9ZmFsc2U7Zm9yKHZhciBpIGluIGYpe2hbaV09dHlwZW9mIGZbaV09PSdmdW5jdGlvbicmJnR5cGVvZiBnW2ldPT0nZnVuY3Rpb24nPyhmdW5jdGlvbihkLGUpe3JldHVybiBmdW5jdGlvbigpe3ZhciBiPXRoaXMuX3N1cGVyO3RoaXMuX3N1cGVyPWZ1bmN0aW9uKGEpe3JldHVybiBnW2RdLmFwcGx5KHRoaXMsYXx8W10pfTt2YXIgYz1lLmFwcGx5KHRoaXMsYXJndW1lbnRzKTt0aGlzLl9zdXBlcj1iO3JldHVybiBjfX0pKGksZltpXSk6ZltpXX1mdW5jdGlvbiBKUUNsYXNzKCl7aWYoIWomJnRoaXMuX2luaXQpe3RoaXMuX2luaXQuYXBwbHkodGhpcyxhcmd1bWVudHMpfX1KUUNsYXNzLnByb3RvdHlwZT1oO0pRQ2xhc3MucHJvdG90eXBlLmNvbnN0cnVjdG9yPUpRQ2xhc3M7SlFDbGFzcy5leHRlbmQ9ZXh0ZW5kZXI7cmV0dXJuIEpRQ2xhc3N9fSkoKTsoZnVuY3Rpb24oJCl7SlFDbGFzcy5jbGFzc2VzLkpRUGx1Z2luPUpRQ2xhc3MuZXh0ZW5kKHtuYW1lOidwbHVnaW4nLGRlZmF1bHRPcHRpb25zOnt9LHJlZ2lvbmFsT3B0aW9uczp7fSxfZ2V0dGVyczpbXSxfZ2V0TWFya2VyOmZ1bmN0aW9uKCl7cmV0dXJuJ2lzLScrdGhpcy5uYW1lfSxfaW5pdDpmdW5jdGlvbigpeyQuZXh0ZW5kKHRoaXMuZGVmYXVsdE9wdGlvbnMsKHRoaXMucmVnaW9uYWxPcHRpb25zJiZ0aGlzLnJlZ2lvbmFsT3B0aW9uc1snJ10pfHx7fSk7dmFyIGM9Y2FtZWxDYXNlKHRoaXMubmFtZSk7JFtjXT10aGlzOyQuZm5bY109ZnVuY3Rpb24oYSl7dmFyIGI9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLDEpO2lmKCRbY10uX2lzTm90Q2hhaW5lZChhLGIpKXtyZXR1cm4gJFtjXVthXS5hcHBseSgkW2NdLFt0aGlzWzBdXS5jb25jYXQoYikpfXJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXtpZih0eXBlb2YgYT09PSdzdHJpbmcnKXtpZihhWzBdPT09J18nfHwhJFtjXVthXSl7dGhyb3cnVW5rbm93biBtZXRob2Q6ICcrYTt9JFtjXVthXS5hcHBseSgkW2NdLFt0aGlzXS5jb25jYXQoYikpfWVsc2V7JFtjXS5fYXR0YWNoKHRoaXMsYSl9fSl9fSxzZXREZWZhdWx0czpmdW5jdGlvbihhKXskLmV4dGVuZCh0aGlzLmRlZmF1bHRPcHRpb25zLGF8fHt9KX0sX2lzTm90Q2hhaW5lZDpmdW5jdGlvbihhLGIpe2lmKGE9PT0nb3B0aW9uJyYmKGIubGVuZ3RoPT09MHx8KGIubGVuZ3RoPT09MSYmdHlwZW9mIGJbMF09PT0nc3RyaW5nJykpKXtyZXR1cm4gdHJ1ZX1yZXR1cm4gJC5pbkFycmF5KGEsdGhpcy5fZ2V0dGVycyk+LTF9LF9hdHRhY2g6ZnVuY3Rpb24oYSxiKXthPSQoYSk7aWYoYS5oYXNDbGFzcyh0aGlzLl9nZXRNYXJrZXIoKSkpe3JldHVybn1hLmFkZENsYXNzKHRoaXMuX2dldE1hcmtlcigpKTtiPSQuZXh0ZW5kKHt9LHRoaXMuZGVmYXVsdE9wdGlvbnMsdGhpcy5fZ2V0TWV0YWRhdGEoYSksYnx8e30pO3ZhciBjPSQuZXh0ZW5kKHtuYW1lOnRoaXMubmFtZSxlbGVtOmEsb3B0aW9uczpifSx0aGlzLl9pbnN0U2V0dGluZ3MoYSxiKSk7YS5kYXRhKHRoaXMubmFtZSxjKTt0aGlzLl9wb3N0QXR0YWNoKGEsYyk7dGhpcy5vcHRpb24oYSxiKX0sX2luc3RTZXR0aW5nczpmdW5jdGlvbihhLGIpe3JldHVybnt9fSxfcG9zdEF0dGFjaDpmdW5jdGlvbihhLGIpe30sX2dldE1ldGFkYXRhOmZ1bmN0aW9uKGQpe3RyeXt2YXIgZj1kLmRhdGEodGhpcy5uYW1lLnRvTG93ZXJDYXNlKCkpfHwnJztmPWYucmVwbGFjZSgvJy9nLCdcIicpO2Y9Zi5yZXBsYWNlKC8oW2EtekEtWjAtOV0rKTovZyxmdW5jdGlvbihhLGIsaSl7dmFyIGM9Zi5zdWJzdHJpbmcoMCxpKS5tYXRjaCgvXCIvZyk7cmV0dXJuKCFjfHxjLmxlbmd0aCUyPT09MD8nXCInK2IrJ1wiOic6YisnOicpfSk7Zj0kLnBhcnNlSlNPTigneycrZisnfScpO2Zvcih2YXIgZyBpbiBmKXt2YXIgaD1mW2ddO2lmKHR5cGVvZiBoPT09J3N0cmluZycmJmgubWF0Y2goL15uZXcgRGF0ZVxcKCguKilcXCkkLykpe2ZbZ109ZXZhbChoKX19cmV0dXJuIGZ9Y2F0Y2goZSl7cmV0dXJue319fSxfZ2V0SW5zdDpmdW5jdGlvbihhKXtyZXR1cm4gJChhKS5kYXRhKHRoaXMubmFtZSl8fHt9fSxvcHRpb246ZnVuY3Rpb24oYSxiLGMpe2E9JChhKTt2YXIgZD1hLmRhdGEodGhpcy5uYW1lKTtpZighYnx8KHR5cGVvZiBiPT09J3N0cmluZycmJmM9PW51bGwpKXt2YXIgZT0oZHx8e30pLm9wdGlvbnM7cmV0dXJuKGUmJmI/ZVtiXTplKX1pZighYS5oYXNDbGFzcyh0aGlzLl9nZXRNYXJrZXIoKSkpe3JldHVybn12YXIgZT1ifHx7fTtpZih0eXBlb2YgYj09PSdzdHJpbmcnKXtlPXt9O2VbYl09Y310aGlzLl9vcHRpb25zQ2hhbmdlZChhLGQsZSk7JC5leHRlbmQoZC5vcHRpb25zLGUpfSxfb3B0aW9uc0NoYW5nZWQ6ZnVuY3Rpb24oYSxiLGMpe30sZGVzdHJveTpmdW5jdGlvbihhKXthPSQoYSk7aWYoIWEuaGFzQ2xhc3ModGhpcy5fZ2V0TWFya2VyKCkpKXtyZXR1cm59dGhpcy5fcHJlRGVzdHJveShhLHRoaXMuX2dldEluc3QoYSkpO2EucmVtb3ZlRGF0YSh0aGlzLm5hbWUpLnJlbW92ZUNsYXNzKHRoaXMuX2dldE1hcmtlcigpKX0sX3ByZURlc3Ryb3k6ZnVuY3Rpb24oYSxiKXt9fSk7ZnVuY3Rpb24gY2FtZWxDYXNlKGMpe3JldHVybiBjLnJlcGxhY2UoLy0oW2Etel0pL2csZnVuY3Rpb24oYSxiKXtyZXR1cm4gYi50b1VwcGVyQ2FzZSgpfSl9JC5KUVBsdWdpbj17Y3JlYXRlUGx1Z2luOmZ1bmN0aW9uKGEsYil7aWYodHlwZW9mIGE9PT0nb2JqZWN0Jyl7Yj1hO2E9J0pRUGx1Z2luJ31hPWNhbWVsQ2FzZShhKTt2YXIgYz1jYW1lbENhc2UoYi5uYW1lKTtKUUNsYXNzLmNsYXNzZXNbY109SlFDbGFzcy5jbGFzc2VzW2FdLmV4dGVuZChiKTtuZXcgSlFDbGFzcy5jbGFzc2VzW2NdKCl9fX0pKGpRdWVyeSk7IiwiLyogaHR0cDovL2tlaXRoLXdvb2QubmFtZS9jb3VudGRvd24uaHRtbFxyXG4gICBDb3VudGRvd24gZm9yIGpRdWVyeSB2Mi4wLjIuXHJcbiAgIFdyaXR0ZW4gYnkgS2VpdGggV29vZCAoa2J3b29ke2F0fWlpbmV0LmNvbS5hdSkgSmFudWFyeSAyMDA4LlxyXG4gICBBdmFpbGFibGUgdW5kZXIgdGhlIE1JVCAoaHR0cDovL2tlaXRoLXdvb2QubmFtZS9saWNlbmNlLmh0bWwpIGxpY2Vuc2UuIFxyXG4gICBQbGVhc2UgYXR0cmlidXRlIHRoZSBhdXRob3IgaWYgeW91IHVzZSBpdC4gKi9cclxuKGZ1bmN0aW9uKCQpe3ZhciB3PSdjb3VudGRvd24nO3ZhciBZPTA7dmFyIE89MTt2YXIgVz0yO3ZhciBEPTM7dmFyIEg9NDt2YXIgTT01O3ZhciBTPTY7JC5KUVBsdWdpbi5jcmVhdGVQbHVnaW4oe25hbWU6dyxkZWZhdWx0T3B0aW9uczp7dW50aWw6bnVsbCxzaW5jZTpudWxsLHRpbWV6b25lOm51bGwsc2VydmVyU3luYzpudWxsLGZvcm1hdDonZEhNUycsbGF5b3V0OicnLGNvbXBhY3Q6ZmFsc2UscGFkWmVyb2VzOmZhbHNlLHNpZ25pZmljYW50OjAsZGVzY3JpcHRpb246JycsZXhwaXJ5VXJsOicnLGV4cGlyeVRleHQ6JycsYWx3YXlzRXhwaXJlOmZhbHNlLG9uRXhwaXJ5Om51bGwsb25UaWNrOm51bGwsdGlja0ludGVydmFsOjF9LHJlZ2lvbmFsT3B0aW9uczp7Jyc6e2xhYmVsczpbJ1llYXJzJywnTW9udGhzJywnV2Vla3MnLCdEYXlzJywnSG91cnMnLCdNaW51dGVzJywnU2Vjb25kcyddLGxhYmVsczE6WydZZWFyJywnTW9udGgnLCdXZWVrJywnRGF5JywnSG91cicsJ01pbnV0ZScsJ1NlY29uZCddLGNvbXBhY3RMYWJlbHM6Wyd5JywnbScsJ3cnLCdkJ10sd2hpY2hMYWJlbHM6bnVsbCxkaWdpdHM6WycwJywnMScsJzInLCczJywnNCcsJzUnLCc2JywnNycsJzgnLCc5J10sdGltZVNlcGFyYXRvcjonOicsaXNSVEw6ZmFsc2V9fSxfZ2V0dGVyczpbJ2dldFRpbWVzJ10sX3J0bENsYXNzOncrJy1ydGwnLF9zZWN0aW9uQ2xhc3M6dysnLXNlY3Rpb24nLF9hbW91bnRDbGFzczp3KyctYW1vdW50JyxfcGVyaW9kQ2xhc3M6dysnLXBlcmlvZCcsX3Jvd0NsYXNzOncrJy1yb3cnLF9ob2xkaW5nQ2xhc3M6dysnLWhvbGRpbmcnLF9zaG93Q2xhc3M6dysnLXNob3cnLF9kZXNjckNsYXNzOncrJy1kZXNjcicsX3RpbWVyRWxlbXM6W10sX2luaXQ6ZnVuY3Rpb24oKXt2YXIgYz10aGlzO3RoaXMuX3N1cGVyKCk7dGhpcy5fc2VydmVyU3luY3M9W107dmFyIGQ9KHR5cGVvZiBEYXRlLm5vdz09J2Z1bmN0aW9uJz9EYXRlLm5vdzpmdW5jdGlvbigpe3JldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKX0pO3ZhciBlPSh3aW5kb3cucGVyZm9ybWFuY2UmJnR5cGVvZiB3aW5kb3cucGVyZm9ybWFuY2Uubm93PT0nZnVuY3Rpb24nKTtmdW5jdGlvbiB0aW1lckNhbGxCYWNrKGEpe3ZhciBiPShhPDFlMTI/KGU/KHBlcmZvcm1hbmNlLm5vdygpK3BlcmZvcm1hbmNlLnRpbWluZy5uYXZpZ2F0aW9uU3RhcnQpOmQoKSk6YXx8ZCgpKTtpZihiLWc+PTEwMDApe2MuX3VwZGF0ZUVsZW1zKCk7Zz1ifWYodGltZXJDYWxsQmFjayl9dmFyIGY9d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93Lm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZXx8bnVsbDt2YXIgZz0wO2lmKCFmfHwkLm5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lKXskLm5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lPW51bGw7c2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtjLl91cGRhdGVFbGVtcygpfSw5ODApfWVsc2V7Zz13aW5kb3cuYW5pbWF0aW9uU3RhcnRUaW1lfHx3aW5kb3cud2Via2l0QW5pbWF0aW9uU3RhcnRUaW1lfHx3aW5kb3cubW96QW5pbWF0aW9uU3RhcnRUaW1lfHx3aW5kb3cub0FuaW1hdGlvblN0YXJ0VGltZXx8d2luZG93Lm1zQW5pbWF0aW9uU3RhcnRUaW1lfHxkKCk7Zih0aW1lckNhbGxCYWNrKX19LFVUQ0RhdGU6ZnVuY3Rpb24oYSxiLGMsZSxmLGcsaCxpKXtpZih0eXBlb2YgYj09J29iamVjdCcmJmIuY29uc3RydWN0b3I9PURhdGUpe2k9Yi5nZXRNaWxsaXNlY29uZHMoKTtoPWIuZ2V0U2Vjb25kcygpO2c9Yi5nZXRNaW51dGVzKCk7Zj1iLmdldEhvdXJzKCk7ZT1iLmdldERhdGUoKTtjPWIuZ2V0TW9udGgoKTtiPWIuZ2V0RnVsbFllYXIoKX12YXIgZD1uZXcgRGF0ZSgpO2Quc2V0VVRDRnVsbFllYXIoYik7ZC5zZXRVVENEYXRlKDEpO2Quc2V0VVRDTW9udGgoY3x8MCk7ZC5zZXRVVENEYXRlKGV8fDEpO2Quc2V0VVRDSG91cnMoZnx8MCk7ZC5zZXRVVENNaW51dGVzKChnfHwwKS0oTWF0aC5hYnMoYSk8MzA/YSo2MDphKSk7ZC5zZXRVVENTZWNvbmRzKGh8fDApO2Quc2V0VVRDTWlsbGlzZWNvbmRzKGl8fDApO3JldHVybiBkfSxwZXJpb2RzVG9TZWNvbmRzOmZ1bmN0aW9uKGEpe3JldHVybiBhWzBdKjMxNTU3NjAwK2FbMV0qMjYyOTgwMCthWzJdKjYwNDgwMCthWzNdKjg2NDAwK2FbNF0qMzYwMCthWzVdKjYwK2FbNl19LHJlc3luYzpmdW5jdGlvbigpe3ZhciBkPXRoaXM7JCgnLicrdGhpcy5fZ2V0TWFya2VyKCkpLmVhY2goZnVuY3Rpb24oKXt2YXIgYT0kLmRhdGEodGhpcyxkLm5hbWUpO2lmKGEub3B0aW9ucy5zZXJ2ZXJTeW5jKXt2YXIgYj1udWxsO2Zvcih2YXIgaT0wO2k8ZC5fc2VydmVyU3luY3MubGVuZ3RoO2krKyl7aWYoZC5fc2VydmVyU3luY3NbaV1bMF09PWEub3B0aW9ucy5zZXJ2ZXJTeW5jKXtiPWQuX3NlcnZlclN5bmNzW2ldO2JyZWFrfX1pZihiWzJdPT1udWxsKXt2YXIgYz0oJC5pc0Z1bmN0aW9uKGEub3B0aW9ucy5zZXJ2ZXJTeW5jKT9hLm9wdGlvbnMuc2VydmVyU3luYy5hcHBseSh0aGlzLFtdKTpudWxsKTtiWzJdPShjP25ldyBEYXRlKCkuZ2V0VGltZSgpLWMuZ2V0VGltZSgpOjApLWJbMV19aWYoYS5fc2luY2Upe2EuX3NpbmNlLnNldE1pbGxpc2Vjb25kcyhhLl9zaW5jZS5nZXRNaWxsaXNlY29uZHMoKStiWzJdKX1hLl91bnRpbC5zZXRNaWxsaXNlY29uZHMoYS5fdW50aWwuZ2V0TWlsbGlzZWNvbmRzKCkrYlsyXSl9fSk7Zm9yKHZhciBpPTA7aTxkLl9zZXJ2ZXJTeW5jcy5sZW5ndGg7aSsrKXtpZihkLl9zZXJ2ZXJTeW5jc1tpXVsyXSE9bnVsbCl7ZC5fc2VydmVyU3luY3NbaV1bMV0rPWQuX3NlcnZlclN5bmNzW2ldWzJdO2RlbGV0ZSBkLl9zZXJ2ZXJTeW5jc1tpXVsyXX19fSxfaW5zdFNldHRpbmdzOmZ1bmN0aW9uKGEsYil7cmV0dXJue19wZXJpb2RzOlswLDAsMCwwLDAsMCwwXX19LF9hZGRFbGVtOmZ1bmN0aW9uKGEpe2lmKCF0aGlzLl9oYXNFbGVtKGEpKXt0aGlzLl90aW1lckVsZW1zLnB1c2goYSl9fSxfaGFzRWxlbTpmdW5jdGlvbihhKXtyZXR1cm4oJC5pbkFycmF5KGEsdGhpcy5fdGltZXJFbGVtcyk+LTEpfSxfcmVtb3ZlRWxlbTpmdW5jdGlvbihiKXt0aGlzLl90aW1lckVsZW1zPSQubWFwKHRoaXMuX3RpbWVyRWxlbXMsZnVuY3Rpb24oYSl7cmV0dXJuKGE9PWI/bnVsbDphKX0pfSxfdXBkYXRlRWxlbXM6ZnVuY3Rpb24oKXtmb3IodmFyIGk9dGhpcy5fdGltZXJFbGVtcy5sZW5ndGgtMTtpPj0wO2ktLSl7dGhpcy5fdXBkYXRlQ291bnRkb3duKHRoaXMuX3RpbWVyRWxlbXNbaV0pfX0sX29wdGlvbnNDaGFuZ2VkOmZ1bmN0aW9uKGEsYixjKXtpZihjLmxheW91dCl7Yy5sYXlvdXQ9Yy5sYXlvdXQucmVwbGFjZSgvJmx0Oy9nLCc8JykucmVwbGFjZSgvJmd0Oy9nLCc+Jyl9dGhpcy5fcmVzZXRFeHRyYUxhYmVscyhiLm9wdGlvbnMsYyk7dmFyIGQ9KGIub3B0aW9ucy50aW1lem9uZSE9Yy50aW1lem9uZSk7JC5leHRlbmQoYi5vcHRpb25zLGMpO3RoaXMuX2FkanVzdFNldHRpbmdzKGEsYixjLnVudGlsIT1udWxsfHxjLnNpbmNlIT1udWxsfHxkKTt2YXIgZT1uZXcgRGF0ZSgpO2lmKChiLl9zaW5jZSYmYi5fc2luY2U8ZSl8fChiLl91bnRpbCYmYi5fdW50aWw+ZSkpe3RoaXMuX2FkZEVsZW0oYVswXSl9dGhpcy5fdXBkYXRlQ291bnRkb3duKGEsYil9LF91cGRhdGVDb3VudGRvd246ZnVuY3Rpb24oYSxiKXthPWEuanF1ZXJ5P2E6JChhKTtiPWJ8fHRoaXMuX2dldEluc3QoYSk7aWYoIWIpe3JldHVybn1hLmh0bWwodGhpcy5fZ2VuZXJhdGVIVE1MKGIpKS50b2dnbGVDbGFzcyh0aGlzLl9ydGxDbGFzcyxiLm9wdGlvbnMuaXNSVEwpO2lmKCQuaXNGdW5jdGlvbihiLm9wdGlvbnMub25UaWNrKSl7dmFyIGM9Yi5faG9sZCE9J2xhcCc/Yi5fcGVyaW9kczp0aGlzLl9jYWxjdWxhdGVQZXJpb2RzKGIsYi5fc2hvdyxiLm9wdGlvbnMuc2lnbmlmaWNhbnQsbmV3IERhdGUoKSk7aWYoYi5vcHRpb25zLnRpY2tJbnRlcnZhbD09MXx8dGhpcy5wZXJpb2RzVG9TZWNvbmRzKGMpJWIub3B0aW9ucy50aWNrSW50ZXJ2YWw9PTApe2Iub3B0aW9ucy5vblRpY2suYXBwbHkoYVswXSxbY10pfX12YXIgZD1iLl9ob2xkIT0ncGF1c2UnJiYoYi5fc2luY2U/Yi5fbm93LmdldFRpbWUoKTxiLl9zaW5jZS5nZXRUaW1lKCk6Yi5fbm93LmdldFRpbWUoKT49Yi5fdW50aWwuZ2V0VGltZSgpKTtpZihkJiYhYi5fZXhwaXJpbmcpe2IuX2V4cGlyaW5nPXRydWU7aWYodGhpcy5faGFzRWxlbShhWzBdKXx8Yi5vcHRpb25zLmFsd2F5c0V4cGlyZSl7dGhpcy5fcmVtb3ZlRWxlbShhWzBdKTtpZigkLmlzRnVuY3Rpb24oYi5vcHRpb25zLm9uRXhwaXJ5KSl7Yi5vcHRpb25zLm9uRXhwaXJ5LmFwcGx5KGFbMF0sW10pfWlmKGIub3B0aW9ucy5leHBpcnlUZXh0KXt2YXIgZT1iLm9wdGlvbnMubGF5b3V0O2Iub3B0aW9ucy5sYXlvdXQ9Yi5vcHRpb25zLmV4cGlyeVRleHQ7dGhpcy5fdXBkYXRlQ291bnRkb3duKGFbMF0sYik7Yi5vcHRpb25zLmxheW91dD1lfWlmKGIub3B0aW9ucy5leHBpcnlVcmwpe3dpbmRvdy5sb2NhdGlvbj1iLm9wdGlvbnMuZXhwaXJ5VXJsfX1iLl9leHBpcmluZz1mYWxzZX1lbHNlIGlmKGIuX2hvbGQ9PSdwYXVzZScpe3RoaXMuX3JlbW92ZUVsZW0oYVswXSl9fSxfcmVzZXRFeHRyYUxhYmVsczpmdW5jdGlvbihhLGIpe2Zvcih2YXIgbiBpbiBiKXtpZihuLm1hdGNoKC9bTGxdYWJlbHNbMDItOV18Y29tcGFjdExhYmVsczEvKSl7YVtuXT1iW25dfX1mb3IodmFyIG4gaW4gYSl7aWYobi5tYXRjaCgvW0xsXWFiZWxzWzAyLTldfGNvbXBhY3RMYWJlbHMxLykmJnR5cGVvZiBiW25dPT09J3VuZGVmaW5lZCcpe2Fbbl09bnVsbH19fSxfYWRqdXN0U2V0dGluZ3M6ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPW51bGw7Zm9yKHZhciBpPTA7aTx0aGlzLl9zZXJ2ZXJTeW5jcy5sZW5ndGg7aSsrKXtpZih0aGlzLl9zZXJ2ZXJTeW5jc1tpXVswXT09Yi5vcHRpb25zLnNlcnZlclN5bmMpe2Q9dGhpcy5fc2VydmVyU3luY3NbaV1bMV07YnJlYWt9fWlmKGQhPW51bGwpe3ZhciBlPShiLm9wdGlvbnMuc2VydmVyU3luYz9kOjApO3ZhciBmPW5ldyBEYXRlKCl9ZWxzZXt2YXIgZz0oJC5pc0Z1bmN0aW9uKGIub3B0aW9ucy5zZXJ2ZXJTeW5jKT9iLm9wdGlvbnMuc2VydmVyU3luYy5hcHBseShhWzBdLFtdKTpudWxsKTt2YXIgZj1uZXcgRGF0ZSgpO3ZhciBlPShnP2YuZ2V0VGltZSgpLWcuZ2V0VGltZSgpOjApO3RoaXMuX3NlcnZlclN5bmNzLnB1c2goW2Iub3B0aW9ucy5zZXJ2ZXJTeW5jLGVdKX12YXIgaD1iLm9wdGlvbnMudGltZXpvbmU7aD0oaD09bnVsbD8tZi5nZXRUaW1lem9uZU9mZnNldCgpOmgpO2lmKGN8fCghYyYmYi5fdW50aWw9PW51bGwmJmIuX3NpbmNlPT1udWxsKSl7Yi5fc2luY2U9Yi5vcHRpb25zLnNpbmNlO2lmKGIuX3NpbmNlIT1udWxsKXtiLl9zaW5jZT10aGlzLlVUQ0RhdGUoaCx0aGlzLl9kZXRlcm1pbmVUaW1lKGIuX3NpbmNlLG51bGwpKTtpZihiLl9zaW5jZSYmZSl7Yi5fc2luY2Uuc2V0TWlsbGlzZWNvbmRzKGIuX3NpbmNlLmdldE1pbGxpc2Vjb25kcygpK2UpfX1iLl91bnRpbD10aGlzLlVUQ0RhdGUoaCx0aGlzLl9kZXRlcm1pbmVUaW1lKGIub3B0aW9ucy51bnRpbCxmKSk7aWYoZSl7Yi5fdW50aWwuc2V0TWlsbGlzZWNvbmRzKGIuX3VudGlsLmdldE1pbGxpc2Vjb25kcygpK2UpfX1iLl9zaG93PXRoaXMuX2RldGVybWluZVNob3coYil9LF9wcmVEZXN0cm95OmZ1bmN0aW9uKGEsYil7dGhpcy5fcmVtb3ZlRWxlbShhWzBdKTthLmVtcHR5KCl9LHBhdXNlOmZ1bmN0aW9uKGEpe3RoaXMuX2hvbGQoYSwncGF1c2UnKX0sbGFwOmZ1bmN0aW9uKGEpe3RoaXMuX2hvbGQoYSwnbGFwJyl9LHJlc3VtZTpmdW5jdGlvbihhKXt0aGlzLl9ob2xkKGEsbnVsbCl9LHRvZ2dsZTpmdW5jdGlvbihhKXt2YXIgYj0kLmRhdGEoYSx0aGlzLm5hbWUpfHx7fTt0aGlzWyFiLl9ob2xkPydwYXVzZSc6J3Jlc3VtZSddKGEpfSx0b2dnbGVMYXA6ZnVuY3Rpb24oYSl7dmFyIGI9JC5kYXRhKGEsdGhpcy5uYW1lKXx8e307dGhpc1shYi5faG9sZD8nbGFwJzoncmVzdW1lJ10oYSl9LF9ob2xkOmZ1bmN0aW9uKGEsYil7dmFyIGM9JC5kYXRhKGEsdGhpcy5uYW1lKTtpZihjKXtpZihjLl9ob2xkPT0ncGF1c2UnJiYhYil7Yy5fcGVyaW9kcz1jLl9zYXZlUGVyaW9kczt2YXIgZD0oYy5fc2luY2U/Jy0nOicrJyk7Y1tjLl9zaW5jZT8nX3NpbmNlJzonX3VudGlsJ109dGhpcy5fZGV0ZXJtaW5lVGltZShkK2MuX3BlcmlvZHNbMF0rJ3knK2QrYy5fcGVyaW9kc1sxXSsnbycrZCtjLl9wZXJpb2RzWzJdKyd3JytkK2MuX3BlcmlvZHNbM10rJ2QnK2QrYy5fcGVyaW9kc1s0XSsnaCcrZCtjLl9wZXJpb2RzWzVdKydtJytkK2MuX3BlcmlvZHNbNl0rJ3MnKTt0aGlzLl9hZGRFbGVtKGEpfWMuX2hvbGQ9YjtjLl9zYXZlUGVyaW9kcz0oYj09J3BhdXNlJz9jLl9wZXJpb2RzOm51bGwpOyQuZGF0YShhLHRoaXMubmFtZSxjKTt0aGlzLl91cGRhdGVDb3VudGRvd24oYSxjKX19LGdldFRpbWVzOmZ1bmN0aW9uKGEpe3ZhciBiPSQuZGF0YShhLHRoaXMubmFtZSk7cmV0dXJuKCFiP251bGw6KGIuX2hvbGQ9PSdwYXVzZSc/Yi5fc2F2ZVBlcmlvZHM6KCFiLl9ob2xkP2IuX3BlcmlvZHM6dGhpcy5fY2FsY3VsYXRlUGVyaW9kcyhiLGIuX3Nob3csYi5vcHRpb25zLnNpZ25pZmljYW50LG5ldyBEYXRlKCkpKSkpfSxfZGV0ZXJtaW5lVGltZTpmdW5jdGlvbihrLGwpe3ZhciBtPXRoaXM7dmFyIG49ZnVuY3Rpb24oYSl7dmFyIGI9bmV3IERhdGUoKTtiLnNldFRpbWUoYi5nZXRUaW1lKCkrYSoxMDAwKTtyZXR1cm4gYn07dmFyIG89ZnVuY3Rpb24oYSl7YT1hLnRvTG93ZXJDYXNlKCk7dmFyIGI9bmV3IERhdGUoKTt2YXIgYz1iLmdldEZ1bGxZZWFyKCk7dmFyIGQ9Yi5nZXRNb250aCgpO3ZhciBlPWIuZ2V0RGF0ZSgpO3ZhciBmPWIuZ2V0SG91cnMoKTt2YXIgZz1iLmdldE1pbnV0ZXMoKTt2YXIgaD1iLmdldFNlY29uZHMoKTt2YXIgaT0vKFsrLV0/WzAtOV0rKVxccyooc3xtfGh8ZHx3fG98eSk/L2c7dmFyIGo9aS5leGVjKGEpO3doaWxlKGope3N3aXRjaChqWzJdfHwncycpe2Nhc2Uncyc6aCs9cGFyc2VJbnQoalsxXSwxMCk7YnJlYWs7Y2FzZSdtJzpnKz1wYXJzZUludChqWzFdLDEwKTticmVhaztjYXNlJ2gnOmYrPXBhcnNlSW50KGpbMV0sMTApO2JyZWFrO2Nhc2UnZCc6ZSs9cGFyc2VJbnQoalsxXSwxMCk7YnJlYWs7Y2FzZSd3JzplKz1wYXJzZUludChqWzFdLDEwKSo3O2JyZWFrO2Nhc2Unbyc6ZCs9cGFyc2VJbnQoalsxXSwxMCk7ZT1NYXRoLm1pbihlLG0uX2dldERheXNJbk1vbnRoKGMsZCkpO2JyZWFrO2Nhc2UneSc6Yys9cGFyc2VJbnQoalsxXSwxMCk7ZT1NYXRoLm1pbihlLG0uX2dldERheXNJbk1vbnRoKGMsZCkpO2JyZWFrfWo9aS5leGVjKGEpfXJldHVybiBuZXcgRGF0ZShjLGQsZSxmLGcsaCwwKX07dmFyIHA9KGs9PW51bGw/bDoodHlwZW9mIGs9PSdzdHJpbmcnP28oayk6KHR5cGVvZiBrPT0nbnVtYmVyJz9uKGspOmspKSk7aWYocClwLnNldE1pbGxpc2Vjb25kcygwKTtyZXR1cm4gcH0sX2dldERheXNJbk1vbnRoOmZ1bmN0aW9uKGEsYil7cmV0dXJuIDMyLW5ldyBEYXRlKGEsYiwzMikuZ2V0RGF0ZSgpfSxfbm9ybWFsTGFiZWxzOmZ1bmN0aW9uKGEpe3JldHVybiBhfSxfZ2VuZXJhdGVIVE1MOmZ1bmN0aW9uKGMpe3ZhciBkPXRoaXM7Yy5fcGVyaW9kcz0oYy5faG9sZD9jLl9wZXJpb2RzOnRoaXMuX2NhbGN1bGF0ZVBlcmlvZHMoYyxjLl9zaG93LGMub3B0aW9ucy5zaWduaWZpY2FudCxuZXcgRGF0ZSgpKSk7dmFyIGU9ZmFsc2U7dmFyIGY9MDt2YXIgZz1jLm9wdGlvbnMuc2lnbmlmaWNhbnQ7dmFyIGg9JC5leHRlbmQoe30sYy5fc2hvdyk7Zm9yKHZhciBpPVk7aTw9UztpKyspe2V8PShjLl9zaG93W2ldPT0nPycmJmMuX3BlcmlvZHNbaV0+MCk7aFtpXT0oYy5fc2hvd1tpXT09Jz8nJiYhZT9udWxsOmMuX3Nob3dbaV0pO2YrPShoW2ldPzE6MCk7Zy09KGMuX3BlcmlvZHNbaV0+MD8xOjApfXZhciBqPVtmYWxzZSxmYWxzZSxmYWxzZSxmYWxzZSxmYWxzZSxmYWxzZSxmYWxzZV07Zm9yKHZhciBpPVM7aT49WTtpLS0pe2lmKGMuX3Nob3dbaV0pe2lmKGMuX3BlcmlvZHNbaV0pe2pbaV09dHJ1ZX1lbHNle2pbaV09Zz4wO2ctLX19fXZhciBrPShjLm9wdGlvbnMuY29tcGFjdD9jLm9wdGlvbnMuY29tcGFjdExhYmVsczpjLm9wdGlvbnMubGFiZWxzKTt2YXIgbD1jLm9wdGlvbnMud2hpY2hMYWJlbHN8fHRoaXMuX25vcm1hbExhYmVsczt2YXIgbT1mdW5jdGlvbihhKXt2YXIgYj1jLm9wdGlvbnNbJ2NvbXBhY3RMYWJlbHMnK2woYy5fcGVyaW9kc1thXSldO3JldHVybihoW2FdP2QuX3RyYW5zbGF0ZURpZ2l0cyhjLGMuX3BlcmlvZHNbYV0pKyhiP2JbYV06a1thXSkrJyAnOicnKX07dmFyIG49KGMub3B0aW9ucy5wYWRaZXJvZXM/MjoxKTt2YXIgbz1mdW5jdGlvbihhKXt2YXIgYj1jLm9wdGlvbnNbJ2xhYmVscycrbChjLl9wZXJpb2RzW2FdKV07cmV0dXJuKCghYy5vcHRpb25zLnNpZ25pZmljYW50JiZoW2FdKXx8KGMub3B0aW9ucy5zaWduaWZpY2FudCYmalthXSk/JzxzcGFuIGNsYXNzPVwiJytkLl9zZWN0aW9uQ2xhc3MrJ1wiPicrJzxzcGFuIGNsYXNzPVwiJytkLl9hbW91bnRDbGFzcysnXCI+JytkLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW2FdLG4pKyc8L3NwYW4+JysnPHNwYW4gY2xhc3M9XCInK2QuX3BlcmlvZENsYXNzKydcIj4nKyhiP2JbYV06a1thXSkrJzwvc3Bhbj48L3NwYW4+JzonJyl9O3JldHVybihjLm9wdGlvbnMubGF5b3V0P3RoaXMuX2J1aWxkTGF5b3V0KGMsaCxjLm9wdGlvbnMubGF5b3V0LGMub3B0aW9ucy5jb21wYWN0LGMub3B0aW9ucy5zaWduaWZpY2FudCxqKTooKGMub3B0aW9ucy5jb21wYWN0Pyc8c3BhbiBjbGFzcz1cIicrdGhpcy5fcm93Q2xhc3MrJyAnK3RoaXMuX2Ftb3VudENsYXNzKyhjLl9ob2xkPycgJyt0aGlzLl9ob2xkaW5nQ2xhc3M6JycpKydcIj4nK20oWSkrbShPKSttKFcpK20oRCkrKGhbSF0/dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tIXSwyKTonJykrKGhbTV0/KGhbSF0/Yy5vcHRpb25zLnRpbWVTZXBhcmF0b3I6JycpK3RoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbTV0sMik6JycpKyhoW1NdPyhoW0hdfHxoW01dP2Mub3B0aW9ucy50aW1lU2VwYXJhdG9yOicnKSt0aGlzLl9taW5EaWdpdHMoYyxjLl9wZXJpb2RzW1NdLDIpOicnKTonPHNwYW4gY2xhc3M9XCInK3RoaXMuX3Jvd0NsYXNzKycgJyt0aGlzLl9zaG93Q2xhc3MrKGMub3B0aW9ucy5zaWduaWZpY2FudHx8ZikrKGMuX2hvbGQ/JyAnK3RoaXMuX2hvbGRpbmdDbGFzczonJykrJ1wiPicrbyhZKStvKE8pK28oVykrbyhEKStvKEgpK28oTSkrbyhTKSkrJzwvc3Bhbj4nKyhjLm9wdGlvbnMuZGVzY3JpcHRpb24/JzxzcGFuIGNsYXNzPVwiJyt0aGlzLl9yb3dDbGFzcysnICcrdGhpcy5fZGVzY3JDbGFzcysnXCI+JytjLm9wdGlvbnMuZGVzY3JpcHRpb24rJzwvc3Bhbj4nOicnKSkpfSxfYnVpbGRMYXlvdXQ6ZnVuY3Rpb24oYyxkLGUsZixnLGgpe3ZhciBqPWMub3B0aW9uc1tmPydjb21wYWN0TGFiZWxzJzonbGFiZWxzJ107dmFyIGs9Yy5vcHRpb25zLndoaWNoTGFiZWxzfHx0aGlzLl9ub3JtYWxMYWJlbHM7dmFyIGw9ZnVuY3Rpb24oYSl7cmV0dXJuKGMub3B0aW9uc1soZj8nY29tcGFjdExhYmVscyc6J2xhYmVscycpK2soYy5fcGVyaW9kc1thXSldfHxqKVthXX07dmFyIG09ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYy5vcHRpb25zLmRpZ2l0c1tNYXRoLmZsb29yKGEvYiklMTBdfTt2YXIgbz17ZGVzYzpjLm9wdGlvbnMuZGVzY3JpcHRpb24sc2VwOmMub3B0aW9ucy50aW1lU2VwYXJhdG9yLHlsOmwoWSkseW46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tZXSwxKSx5bm46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tZXSwyKSx5bm5uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbWV0sMykseTE6bShjLl9wZXJpb2RzW1ldLDEpLHkxMDptKGMuX3BlcmlvZHNbWV0sMTApLHkxMDA6bShjLl9wZXJpb2RzW1ldLDEwMCkseTEwMDA6bShjLl9wZXJpb2RzW1ldLDEwMDApLG9sOmwoTyksb246dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tPXSwxKSxvbm46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tPXSwyKSxvbm5uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbT10sMyksbzE6bShjLl9wZXJpb2RzW09dLDEpLG8xMDptKGMuX3BlcmlvZHNbT10sMTApLG8xMDA6bShjLl9wZXJpb2RzW09dLDEwMCksbzEwMDA6bShjLl9wZXJpb2RzW09dLDEwMDApLHdsOmwoVyksd246dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tXXSwxKSx3bm46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tXXSwyKSx3bm5uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbV10sMyksdzE6bShjLl9wZXJpb2RzW1ddLDEpLHcxMDptKGMuX3BlcmlvZHNbV10sMTApLHcxMDA6bShjLl9wZXJpb2RzW1ddLDEwMCksdzEwMDA6bShjLl9wZXJpb2RzW1ddLDEwMDApLGRsOmwoRCksZG46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tEXSwxKSxkbm46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tEXSwyKSxkbm5uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbRF0sMyksZDE6bShjLl9wZXJpb2RzW0RdLDEpLGQxMDptKGMuX3BlcmlvZHNbRF0sMTApLGQxMDA6bShjLl9wZXJpb2RzW0RdLDEwMCksZDEwMDA6bShjLl9wZXJpb2RzW0RdLDEwMDApLGhsOmwoSCksaG46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tIXSwxKSxobm46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tIXSwyKSxobm5uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbSF0sMyksaDE6bShjLl9wZXJpb2RzW0hdLDEpLGgxMDptKGMuX3BlcmlvZHNbSF0sMTApLGgxMDA6bShjLl9wZXJpb2RzW0hdLDEwMCksaDEwMDA6bShjLl9wZXJpb2RzW0hdLDEwMDApLG1sOmwoTSksbW46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tNXSwxKSxtbm46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tNXSwyKSxtbm5uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbTV0sMyksbTE6bShjLl9wZXJpb2RzW01dLDEpLG0xMDptKGMuX3BlcmlvZHNbTV0sMTApLG0xMDA6bShjLl9wZXJpb2RzW01dLDEwMCksbTEwMDA6bShjLl9wZXJpb2RzW01dLDEwMDApLHNsOmwoUyksc246dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tTXSwxKSxzbm46dGhpcy5fbWluRGlnaXRzKGMsYy5fcGVyaW9kc1tTXSwyKSxzbm5uOnRoaXMuX21pbkRpZ2l0cyhjLGMuX3BlcmlvZHNbU10sMyksczE6bShjLl9wZXJpb2RzW1NdLDEpLHMxMDptKGMuX3BlcmlvZHNbU10sMTApLHMxMDA6bShjLl9wZXJpb2RzW1NdLDEwMCksczEwMDA6bShjLl9wZXJpb2RzW1NdLDEwMDApfTt2YXIgcD1lO2Zvcih2YXIgaT1ZO2k8PVM7aSsrKXt2YXIgcT0neW93ZGhtcycuY2hhckF0KGkpO3ZhciByPW5ldyBSZWdFeHAoJ1xcXFx7JytxKyc8XFxcXH0oW1xcXFxzXFxcXFNdKilcXFxceycrcSsnPlxcXFx9JywnZycpO3A9cC5yZXBsYWNlKHIsKCghZyYmZFtpXSl8fChnJiZoW2ldKT8nJDEnOicnKSl9JC5lYWNoKG8sZnVuY3Rpb24obix2KXt2YXIgYT1uZXcgUmVnRXhwKCdcXFxceycrbisnXFxcXH0nLCdnJyk7cD1wLnJlcGxhY2UoYSx2KX0pO3JldHVybiBwfSxfbWluRGlnaXRzOmZ1bmN0aW9uKGEsYixjKXtiPScnK2I7aWYoYi5sZW5ndGg+PWMpe3JldHVybiB0aGlzLl90cmFuc2xhdGVEaWdpdHMoYSxiKX1iPScwMDAwMDAwMDAwJytiO3JldHVybiB0aGlzLl90cmFuc2xhdGVEaWdpdHMoYSxiLnN1YnN0cihiLmxlbmd0aC1jKSl9LF90cmFuc2xhdGVEaWdpdHM6ZnVuY3Rpb24oYixjKXtyZXR1cm4oJycrYykucmVwbGFjZSgvWzAtOV0vZyxmdW5jdGlvbihhKXtyZXR1cm4gYi5vcHRpb25zLmRpZ2l0c1thXX0pfSxfZGV0ZXJtaW5lU2hvdzpmdW5jdGlvbihhKXt2YXIgYj1hLm9wdGlvbnMuZm9ybWF0O3ZhciBjPVtdO2NbWV09KGIubWF0Y2goJ3knKT8nPyc6KGIubWF0Y2goJ1knKT8nISc6bnVsbCkpO2NbT109KGIubWF0Y2goJ28nKT8nPyc6KGIubWF0Y2goJ08nKT8nISc6bnVsbCkpO2NbV109KGIubWF0Y2goJ3cnKT8nPyc6KGIubWF0Y2goJ1cnKT8nISc6bnVsbCkpO2NbRF09KGIubWF0Y2goJ2QnKT8nPyc6KGIubWF0Y2goJ0QnKT8nISc6bnVsbCkpO2NbSF09KGIubWF0Y2goJ2gnKT8nPyc6KGIubWF0Y2goJ0gnKT8nISc6bnVsbCkpO2NbTV09KGIubWF0Y2goJ20nKT8nPyc6KGIubWF0Y2goJ00nKT8nISc6bnVsbCkpO2NbU109KGIubWF0Y2goJ3MnKT8nPyc6KGIubWF0Y2goJ1MnKT8nISc6bnVsbCkpO3JldHVybiBjfSxfY2FsY3VsYXRlUGVyaW9kczpmdW5jdGlvbihjLGQsZSxmKXtjLl9ub3c9ZjtjLl9ub3cuc2V0TWlsbGlzZWNvbmRzKDApO3ZhciBnPW5ldyBEYXRlKGMuX25vdy5nZXRUaW1lKCkpO2lmKGMuX3NpbmNlKXtpZihmLmdldFRpbWUoKTxjLl9zaW5jZS5nZXRUaW1lKCkpe2MuX25vdz1mPWd9ZWxzZXtmPWMuX3NpbmNlfX1lbHNle2cuc2V0VGltZShjLl91bnRpbC5nZXRUaW1lKCkpO2lmKGYuZ2V0VGltZSgpPmMuX3VudGlsLmdldFRpbWUoKSl7Yy5fbm93PWY9Z319dmFyIGg9WzAsMCwwLDAsMCwwLDBdO2lmKGRbWV18fGRbT10pe3ZhciBpPXRoaXMuX2dldERheXNJbk1vbnRoKGYuZ2V0RnVsbFllYXIoKSxmLmdldE1vbnRoKCkpO3ZhciBqPXRoaXMuX2dldERheXNJbk1vbnRoKGcuZ2V0RnVsbFllYXIoKSxnLmdldE1vbnRoKCkpO3ZhciBrPShnLmdldERhdGUoKT09Zi5nZXREYXRlKCl8fChnLmdldERhdGUoKT49TWF0aC5taW4oaSxqKSYmZi5nZXREYXRlKCk+PU1hdGgubWluKGksaikpKTt2YXIgbD1mdW5jdGlvbihhKXtyZXR1cm4oYS5nZXRIb3VycygpKjYwK2EuZ2V0TWludXRlcygpKSo2MCthLmdldFNlY29uZHMoKX07dmFyIG09TWF0aC5tYXgoMCwoZy5nZXRGdWxsWWVhcigpLWYuZ2V0RnVsbFllYXIoKSkqMTIrZy5nZXRNb250aCgpLWYuZ2V0TW9udGgoKSsoKGcuZ2V0RGF0ZSgpPGYuZ2V0RGF0ZSgpJiYhayl8fChrJiZsKGcpPGwoZikpPy0xOjApKTtoW1ldPShkW1ldP01hdGguZmxvb3IobS8xMik6MCk7aFtPXT0oZFtPXT9tLWhbWV0qMTI6MCk7Zj1uZXcgRGF0ZShmLmdldFRpbWUoKSk7dmFyIG49KGYuZ2V0RGF0ZSgpPT1pKTt2YXIgbz10aGlzLl9nZXREYXlzSW5Nb250aChmLmdldEZ1bGxZZWFyKCkraFtZXSxmLmdldE1vbnRoKCkraFtPXSk7aWYoZi5nZXREYXRlKCk+byl7Zi5zZXREYXRlKG8pfWYuc2V0RnVsbFllYXIoZi5nZXRGdWxsWWVhcigpK2hbWV0pO2Yuc2V0TW9udGgoZi5nZXRNb250aCgpK2hbT10pO2lmKG4pe2Yuc2V0RGF0ZShvKX19dmFyIHA9TWF0aC5mbG9vcigoZy5nZXRUaW1lKCktZi5nZXRUaW1lKCkpLzEwMDApO3ZhciBxPWZ1bmN0aW9uKGEsYil7aFthXT0oZFthXT9NYXRoLmZsb29yKHAvYik6MCk7cC09aFthXSpifTtxKFcsNjA0ODAwKTtxKEQsODY0MDApO3EoSCwzNjAwKTtxKE0sNjApO3EoUywxKTtpZihwPjAmJiFjLl9zaW5jZSl7dmFyIHI9WzEsMTIsNC4zNDgyLDcsMjQsNjAsNjBdO3ZhciBzPVM7dmFyIHQ9MTtmb3IodmFyIHU9Uzt1Pj1ZO3UtLSl7aWYoZFt1XSl7aWYoaFtzXT49dCl7aFtzXT0wO3A9MX1pZihwPjApe2hbdV0rKztwPTA7cz11O3Q9MX19dCo9clt1XX19aWYoZSl7Zm9yKHZhciB1PVk7dTw9Uzt1Kyspe2lmKGUmJmhbdV0pe2UtLX1lbHNlIGlmKCFlKXtoW3VdPTB9fX1yZXR1cm4gaH19KX0pKGpRdWVyeSk7IiwiIWZ1bmN0aW9uKGEsYil7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXCJqcXVlcnlcIl0sYik6XCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9YihyZXF1aXJlKFwianF1ZXJ5XCIpKTpiKGEualF1ZXJ5KX0odGhpcyxmdW5jdGlvbihhKXtcImZ1bmN0aW9uXCIhPXR5cGVvZiBPYmplY3QuY3JlYXRlJiYoT2JqZWN0LmNyZWF0ZT1mdW5jdGlvbihhKXtmdW5jdGlvbiBiKCl7fXJldHVybiBiLnByb3RvdHlwZT1hLG5ldyBifSk7dmFyIGI9e2luaXQ6ZnVuY3Rpb24oYil7cmV0dXJuIHRoaXMub3B0aW9ucz1hLmV4dGVuZCh7fSxhLm5vdHkuZGVmYXVsdHMsYiksdGhpcy5vcHRpb25zLmxheW91dD10aGlzLm9wdGlvbnMuY3VzdG9tP2Eubm90eS5sYXlvdXRzLmlubGluZTphLm5vdHkubGF5b3V0c1t0aGlzLm9wdGlvbnMubGF5b3V0XSxhLm5vdHkudGhlbWVzW3RoaXMub3B0aW9ucy50aGVtZV0/dGhpcy5vcHRpb25zLnRoZW1lPWEubm90eS50aGVtZXNbdGhpcy5vcHRpb25zLnRoZW1lXTp0aGlzLm9wdGlvbnMudGhlbWVDbGFzc05hbWU9dGhpcy5vcHRpb25zLnRoZW1lLHRoaXMub3B0aW9ucz1hLmV4dGVuZCh7fSx0aGlzLm9wdGlvbnMsdGhpcy5vcHRpb25zLmxheW91dC5vcHRpb25zKSx0aGlzLm9wdGlvbnMuaWQ9XCJub3R5X1wiKyhuZXcgRGF0ZSkuZ2V0VGltZSgpKk1hdGguZmxvb3IoMWU2Kk1hdGgucmFuZG9tKCkpLHRoaXMuX2J1aWxkKCksdGhpc30sX2J1aWxkOmZ1bmN0aW9uKCl7dmFyIGI9YSgnPGRpdiBjbGFzcz1cIm5vdHlfYmFyIG5vdHlfdHlwZV8nK3RoaXMub3B0aW9ucy50eXBlKydcIj48L2Rpdj4nKS5hdHRyKFwiaWRcIix0aGlzLm9wdGlvbnMuaWQpO2lmKGIuYXBwZW5kKHRoaXMub3B0aW9ucy50ZW1wbGF0ZSkuZmluZChcIi5ub3R5X3RleHRcIikuaHRtbCh0aGlzLm9wdGlvbnMudGV4dCksdGhpcy4kYmFyPW51bGwhPT10aGlzLm9wdGlvbnMubGF5b3V0LnBhcmVudC5vYmplY3Q/YSh0aGlzLm9wdGlvbnMubGF5b3V0LnBhcmVudC5vYmplY3QpLmNzcyh0aGlzLm9wdGlvbnMubGF5b3V0LnBhcmVudC5jc3MpLmFwcGVuZChiKTpiLHRoaXMub3B0aW9ucy50aGVtZUNsYXNzTmFtZSYmdGhpcy4kYmFyLmFkZENsYXNzKHRoaXMub3B0aW9ucy50aGVtZUNsYXNzTmFtZSkuYWRkQ2xhc3MoXCJub3R5X2NvbnRhaW5lcl90eXBlX1wiK3RoaXMub3B0aW9ucy50eXBlKSx0aGlzLm9wdGlvbnMuYnV0dG9ucyl7dGhpcy5vcHRpb25zLmNsb3NlV2l0aD1bXSx0aGlzLm9wdGlvbnMudGltZW91dD0hMTt2YXIgYz1hKFwiPGRpdi8+XCIpLmFkZENsYXNzKFwibm90eV9idXR0b25zXCIpO251bGwhPT10aGlzLm9wdGlvbnMubGF5b3V0LnBhcmVudC5vYmplY3Q/dGhpcy4kYmFyLmZpbmQoXCIubm90eV9iYXJcIikuYXBwZW5kKGMpOnRoaXMuJGJhci5hcHBlbmQoYyk7dmFyIGQ9dGhpczthLmVhY2godGhpcy5vcHRpb25zLmJ1dHRvbnMsZnVuY3Rpb24oYixjKXt2YXIgZT1hKFwiPGJ1dHRvbi8+XCIpLmFkZENsYXNzKGMuYWRkQ2xhc3M/Yy5hZGRDbGFzczpcImdyYXlcIikuaHRtbChjLnRleHQpLmF0dHIoXCJpZFwiLGMuaWQ/Yy5pZDpcImJ1dHRvbi1cIitiKS5hdHRyKFwidGl0bGVcIixjLnRpdGxlKS5hcHBlbmRUbyhkLiRiYXIuZmluZChcIi5ub3R5X2J1dHRvbnNcIikpLm9uKFwiY2xpY2tcIixmdW5jdGlvbihiKXthLmlzRnVuY3Rpb24oYy5vbkNsaWNrKSYmYy5vbkNsaWNrLmNhbGwoZSxkLGIpfSl9KX10aGlzLiRtZXNzYWdlPXRoaXMuJGJhci5maW5kKFwiLm5vdHlfbWVzc2FnZVwiKSx0aGlzLiRjbG9zZUJ1dHRvbj10aGlzLiRiYXIuZmluZChcIi5ub3R5X2Nsb3NlXCIpLHRoaXMuJGJ1dHRvbnM9dGhpcy4kYmFyLmZpbmQoXCIubm90eV9idXR0b25zXCIpLGEubm90eS5zdG9yZVt0aGlzLm9wdGlvbnMuaWRdPXRoaXN9LHNob3c6ZnVuY3Rpb24oKXt2YXIgYj10aGlzO3JldHVybiBiLm9wdGlvbnMuY3VzdG9tP2Iub3B0aW9ucy5jdXN0b20uZmluZChiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikuYXBwZW5kKGIuJGJhcik6YShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikuYXBwZW5kKGIuJGJhciksYi5vcHRpb25zLnRoZW1lJiZiLm9wdGlvbnMudGhlbWUuc3R5bGUmJmIub3B0aW9ucy50aGVtZS5zdHlsZS5hcHBseShiKSxcImZ1bmN0aW9uXCI9PT1hLnR5cGUoYi5vcHRpb25zLmxheW91dC5jc3MpP3RoaXMub3B0aW9ucy5sYXlvdXQuY3NzLmFwcGx5KGIuJGJhcik6Yi4kYmFyLmNzcyh0aGlzLm9wdGlvbnMubGF5b3V0LmNzc3x8e30pLGIuJGJhci5hZGRDbGFzcyhiLm9wdGlvbnMubGF5b3V0LmFkZENsYXNzKSxiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zdHlsZS5hcHBseShhKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKSxbYi5vcHRpb25zLndpdGhpbl0pLGIuc2hvd2luZz0hMCxiLm9wdGlvbnMudGhlbWUmJmIub3B0aW9ucy50aGVtZS5zdHlsZSYmYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrLm9uU2hvdy5hcHBseSh0aGlzKSxhLmluQXJyYXkoXCJjbGlja1wiLGIub3B0aW9ucy5jbG9zZVdpdGgpPi0xJiZiLiRiYXIuY3NzKFwiY3Vyc29yXCIsXCJwb2ludGVyXCIpLm9uZShcImNsaWNrXCIsZnVuY3Rpb24oYSl7Yi5zdG9wUHJvcGFnYXRpb24oYSksYi5vcHRpb25zLmNhbGxiYWNrLm9uQ2xvc2VDbGljayYmYi5vcHRpb25zLmNhbGxiYWNrLm9uQ2xvc2VDbGljay5hcHBseShiKSxiLmNsb3NlKCl9KSxhLmluQXJyYXkoXCJob3ZlclwiLGIub3B0aW9ucy5jbG9zZVdpdGgpPi0xJiZiLiRiYXIub25lKFwibW91c2VlbnRlclwiLGZ1bmN0aW9uKCl7Yi5jbG9zZSgpfSksYS5pbkFycmF5KFwiYnV0dG9uXCIsYi5vcHRpb25zLmNsb3NlV2l0aCk+LTEmJmIuJGNsb3NlQnV0dG9uLm9uZShcImNsaWNrXCIsZnVuY3Rpb24oYSl7Yi5zdG9wUHJvcGFnYXRpb24oYSksYi5jbG9zZSgpfSksLTE9PWEuaW5BcnJheShcImJ1dHRvblwiLGIub3B0aW9ucy5jbG9zZVdpdGgpJiZiLiRjbG9zZUJ1dHRvbi5yZW1vdmUoKSxiLm9wdGlvbnMuY2FsbGJhY2sub25TaG93JiZiLm9wdGlvbnMuY2FsbGJhY2sub25TaG93LmFwcGx5KGIpLFwic3RyaW5nXCI9PXR5cGVvZiBiLm9wdGlvbnMuYW5pbWF0aW9uLm9wZW4/KGIuJGJhci5jc3MoXCJoZWlnaHRcIixiLiRiYXIuaW5uZXJIZWlnaHQoKSksYi4kYmFyLm9uKFwiY2xpY2tcIixmdW5jdGlvbihhKXtiLndhc0NsaWNrZWQ9ITB9KSxiLiRiYXIuc2hvdygpLmFkZENsYXNzKGIub3B0aW9ucy5hbmltYXRpb24ub3Blbikub25lKFwid2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZFwiLGZ1bmN0aW9uKCl7Yi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyU2hvdyYmYi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyU2hvdy5hcHBseShiKSxiLnNob3dpbmc9ITEsYi5zaG93bj0hMCxiLmhhc093blByb3BlcnR5KFwid2FzQ2xpY2tlZFwiKSYmKGIuJGJhci5vZmYoXCJjbGlja1wiLGZ1bmN0aW9uKGEpe2Iud2FzQ2xpY2tlZD0hMH0pLGIuY2xvc2UoKSl9KSk6Yi4kYmFyLmFuaW1hdGUoYi5vcHRpb25zLmFuaW1hdGlvbi5vcGVuLGIub3B0aW9ucy5hbmltYXRpb24uc3BlZWQsYi5vcHRpb25zLmFuaW1hdGlvbi5lYXNpbmcsZnVuY3Rpb24oKXtiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJTaG93JiZiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJTaG93LmFwcGx5KGIpLGIuc2hvd2luZz0hMSxiLnNob3duPSEwfSksYi5vcHRpb25zLnRpbWVvdXQmJmIuJGJhci5kZWxheShiLm9wdGlvbnMudGltZW91dCkucHJvbWlzZSgpLmRvbmUoZnVuY3Rpb24oKXtiLmNsb3NlKCl9KSx0aGlzfSxjbG9zZTpmdW5jdGlvbigpe2lmKCEodGhpcy5jbG9zZWR8fHRoaXMuJGJhciYmdGhpcy4kYmFyLmhhc0NsYXNzKFwiaS1hbS1jbG9zaW5nLW5vd1wiKSkpe3ZhciBiPXRoaXM7aWYodGhpcy5zaG93aW5nKXJldHVybiB2b2lkIGIuJGJhci5xdWV1ZShmdW5jdGlvbigpe2IuY2xvc2UuYXBwbHkoYil9KTtpZighdGhpcy5zaG93biYmIXRoaXMuc2hvd2luZyl7dmFyIGM9W107cmV0dXJuIGEuZWFjaChhLm5vdHkucXVldWUsZnVuY3Rpb24oYSxkKXtkLm9wdGlvbnMuaWQhPWIub3B0aW9ucy5pZCYmYy5wdXNoKGQpfSksdm9pZChhLm5vdHkucXVldWU9Yyl9Yi4kYmFyLmFkZENsYXNzKFwiaS1hbS1jbG9zaW5nLW5vd1wiKSxiLm9wdGlvbnMuY2FsbGJhY2sub25DbG9zZSYmYi5vcHRpb25zLmNhbGxiYWNrLm9uQ2xvc2UuYXBwbHkoYiksXCJzdHJpbmdcIj09dHlwZW9mIGIub3B0aW9ucy5hbmltYXRpb24uY2xvc2U/Yi4kYmFyLmFkZENsYXNzKGIub3B0aW9ucy5hbmltYXRpb24uY2xvc2UpLm9uZShcIndlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmRcIixmdW5jdGlvbigpe2Iub3B0aW9ucy5jYWxsYmFjay5hZnRlckNsb3NlJiZiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJDbG9zZS5hcHBseShiKSxiLmNsb3NlQ2xlYW5VcCgpfSk6Yi4kYmFyLmNsZWFyUXVldWUoKS5zdG9wKCkuYW5pbWF0ZShiLm9wdGlvbnMuYW5pbWF0aW9uLmNsb3NlLGIub3B0aW9ucy5hbmltYXRpb24uc3BlZWQsYi5vcHRpb25zLmFuaW1hdGlvbi5lYXNpbmcsZnVuY3Rpb24oKXtiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJDbG9zZSYmYi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyQ2xvc2UuYXBwbHkoYil9KS5wcm9taXNlKCkuZG9uZShmdW5jdGlvbigpe2IuY2xvc2VDbGVhblVwKCl9KX19LGNsb3NlQ2xlYW5VcDpmdW5jdGlvbigpe3ZhciBiPXRoaXM7Yi5vcHRpb25zLm1vZGFsJiYoYS5ub3R5UmVuZGVyZXIuc2V0TW9kYWxDb3VudCgtMSksMD09YS5ub3R5UmVuZGVyZXIuZ2V0TW9kYWxDb3VudCgpJiZhKFwiLm5vdHlfbW9kYWxcIikuZmFkZU91dChiLm9wdGlvbnMuYW5pbWF0aW9uLmZhZGVTcGVlZCxmdW5jdGlvbigpe2EodGhpcykucmVtb3ZlKCl9KSksYS5ub3R5UmVuZGVyZXIuc2V0TGF5b3V0Q291bnRGb3IoYiwtMSksMD09YS5ub3R5UmVuZGVyZXIuZ2V0TGF5b3V0Q291bnRGb3IoYikmJmEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLnJlbW92ZSgpLFwidW5kZWZpbmVkXCIhPXR5cGVvZiBiLiRiYXImJm51bGwhPT1iLiRiYXImJihcInN0cmluZ1wiPT10eXBlb2YgYi5vcHRpb25zLmFuaW1hdGlvbi5jbG9zZT8oYi4kYmFyLmNzcyhcInRyYW5zaXRpb25cIixcImFsbCAxMDBtcyBlYXNlXCIpLmNzcyhcImJvcmRlclwiLDApLmNzcyhcIm1hcmdpblwiLDApLmhlaWdodCgwKSxiLiRiYXIub25lKFwidHJhbnNpdGlvbmVuZCB3ZWJraXRUcmFuc2l0aW9uRW5kIG9UcmFuc2l0aW9uRW5kIE1TVHJhbnNpdGlvbkVuZFwiLGZ1bmN0aW9uKCl7Yi4kYmFyLnJlbW92ZSgpLGIuJGJhcj1udWxsLGIuY2xvc2VkPSEwLGIub3B0aW9ucy50aGVtZS5jYWxsYmFjayYmYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrLm9uQ2xvc2UmJmIub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vbkNsb3NlLmFwcGx5KGIpfSkpOihiLiRiYXIucmVtb3ZlKCksYi4kYmFyPW51bGwsYi5jbG9zZWQ9ITApKSxkZWxldGUgYS5ub3R5LnN0b3JlW2Iub3B0aW9ucy5pZF0sYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrJiZiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2sub25DbG9zZSYmYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrLm9uQ2xvc2UuYXBwbHkoYiksYi5vcHRpb25zLmRpc21pc3NRdWV1ZXx8KGEubm90eS5vbnRhcD0hMCxhLm5vdHlSZW5kZXJlci5yZW5kZXIoKSksYi5vcHRpb25zLm1heFZpc2libGU+MCYmYi5vcHRpb25zLmRpc21pc3NRdWV1ZSYmYS5ub3R5UmVuZGVyZXIucmVuZGVyKCl9LHNldFRleHQ6ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuY2xvc2VkfHwodGhpcy5vcHRpb25zLnRleHQ9YSx0aGlzLiRiYXIuZmluZChcIi5ub3R5X3RleHRcIikuaHRtbChhKSksdGhpc30sc2V0VHlwZTpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5jbG9zZWR8fCh0aGlzLm9wdGlvbnMudHlwZT1hLHRoaXMub3B0aW9ucy50aGVtZS5zdHlsZS5hcHBseSh0aGlzKSx0aGlzLm9wdGlvbnMudGhlbWUuY2FsbGJhY2sub25TaG93LmFwcGx5KHRoaXMpKSx0aGlzfSxzZXRUaW1lb3V0OmZ1bmN0aW9uKGEpe2lmKCF0aGlzLmNsb3NlZCl7dmFyIGI9dGhpczt0aGlzLm9wdGlvbnMudGltZW91dD1hLGIuJGJhci5kZWxheShiLm9wdGlvbnMudGltZW91dCkucHJvbWlzZSgpLmRvbmUoZnVuY3Rpb24oKXtiLmNsb3NlKCl9KX1yZXR1cm4gdGhpc30sc3RvcFByb3BhZ2F0aW9uOmZ1bmN0aW9uKGEpe2E9YXx8d2luZG93LmV2ZW50LFwidW5kZWZpbmVkXCIhPXR5cGVvZiBhLnN0b3BQcm9wYWdhdGlvbj9hLnN0b3BQcm9wYWdhdGlvbigpOmEuY2FuY2VsQnViYmxlPSEwfSxjbG9zZWQ6ITEsc2hvd2luZzohMSxzaG93bjohMX07YS5ub3R5UmVuZGVyZXI9e30sYS5ub3R5UmVuZGVyZXIuaW5pdD1mdW5jdGlvbihjKXt2YXIgZD1PYmplY3QuY3JlYXRlKGIpLmluaXQoYyk7cmV0dXJuIGQub3B0aW9ucy5raWxsZXImJmEubm90eS5jbG9zZUFsbCgpLGQub3B0aW9ucy5mb3JjZT9hLm5vdHkucXVldWUudW5zaGlmdChkKTphLm5vdHkucXVldWUucHVzaChkKSxhLm5vdHlSZW5kZXJlci5yZW5kZXIoKSxcIm9iamVjdFwiPT1hLm5vdHkucmV0dXJucz9kOmQub3B0aW9ucy5pZH0sYS5ub3R5UmVuZGVyZXIucmVuZGVyPWZ1bmN0aW9uKCl7dmFyIGI9YS5ub3R5LnF1ZXVlWzBdO1wib2JqZWN0XCI9PT1hLnR5cGUoYik/Yi5vcHRpb25zLmRpc21pc3NRdWV1ZT9iLm9wdGlvbnMubWF4VmlzaWJsZT4wP2EoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IrXCIgPiBsaVwiKS5sZW5ndGg8Yi5vcHRpb25zLm1heFZpc2libGUmJmEubm90eVJlbmRlcmVyLnNob3coYS5ub3R5LnF1ZXVlLnNoaWZ0KCkpOmEubm90eVJlbmRlcmVyLnNob3coYS5ub3R5LnF1ZXVlLnNoaWZ0KCkpOmEubm90eS5vbnRhcCYmKGEubm90eVJlbmRlcmVyLnNob3coYS5ub3R5LnF1ZXVlLnNoaWZ0KCkpLGEubm90eS5vbnRhcD0hMSk6YS5ub3R5Lm9udGFwPSEwfSxhLm5vdHlSZW5kZXJlci5zaG93PWZ1bmN0aW9uKGIpe2Iub3B0aW9ucy5tb2RhbCYmKGEubm90eVJlbmRlcmVyLmNyZWF0ZU1vZGFsRm9yKGIpLGEubm90eVJlbmRlcmVyLnNldE1vZGFsQ291bnQoMSkpLGIub3B0aW9ucy5jdXN0b20/MD09Yi5vcHRpb25zLmN1c3RvbS5maW5kKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5sZW5ndGg/Yi5vcHRpb25zLmN1c3RvbS5hcHBlbmQoYShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5vYmplY3QpLmFkZENsYXNzKFwiaS1hbS1uZXdcIikpOmIub3B0aW9ucy5jdXN0b20uZmluZChiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikucmVtb3ZlQ2xhc3MoXCJpLWFtLW5ld1wiKTowPT1hKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5sZW5ndGg/YShcImJvZHlcIikuYXBwZW5kKGEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIub2JqZWN0KS5hZGRDbGFzcyhcImktYW0tbmV3XCIpKTphKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5yZW1vdmVDbGFzcyhcImktYW0tbmV3XCIpLGEubm90eVJlbmRlcmVyLnNldExheW91dENvdW50Rm9yKGIsMSksYi5zaG93KCl9LGEubm90eVJlbmRlcmVyLmNyZWF0ZU1vZGFsRm9yPWZ1bmN0aW9uKGIpe2lmKDA9PWEoXCIubm90eV9tb2RhbFwiKS5sZW5ndGgpe3ZhciBjPWEoXCI8ZGl2Lz5cIikuYWRkQ2xhc3MoXCJub3R5X21vZGFsXCIpLmFkZENsYXNzKGIub3B0aW9ucy50aGVtZSkuZGF0YShcIm5vdHlfbW9kYWxfY291bnRcIiwwKTtiLm9wdGlvbnMudGhlbWUubW9kYWwmJmIub3B0aW9ucy50aGVtZS5tb2RhbC5jc3MmJmMuY3NzKGIub3B0aW9ucy50aGVtZS5tb2RhbC5jc3MpLGMucHJlcGVuZFRvKGEoXCJib2R5XCIpKS5mYWRlSW4oYi5vcHRpb25zLmFuaW1hdGlvbi5mYWRlU3BlZWQpLGEuaW5BcnJheShcImJhY2tkcm9wXCIsYi5vcHRpb25zLmNsb3NlV2l0aCk+LTEmJmMub24oXCJjbGlja1wiLGZ1bmN0aW9uKGIpe2Eubm90eS5jbG9zZUFsbCgpfSl9fSxhLm5vdHlSZW5kZXJlci5nZXRMYXlvdXRDb3VudEZvcj1mdW5jdGlvbihiKXtyZXR1cm4gYShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikuZGF0YShcIm5vdHlfbGF5b3V0X2NvdW50XCIpfHwwfSxhLm5vdHlSZW5kZXJlci5zZXRMYXlvdXRDb3VudEZvcj1mdW5jdGlvbihiLGMpe3JldHVybiBhKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5kYXRhKFwibm90eV9sYXlvdXRfY291bnRcIixhLm5vdHlSZW5kZXJlci5nZXRMYXlvdXRDb3VudEZvcihiKStjKX0sYS5ub3R5UmVuZGVyZXIuZ2V0TW9kYWxDb3VudD1mdW5jdGlvbigpe3JldHVybiBhKFwiLm5vdHlfbW9kYWxcIikuZGF0YShcIm5vdHlfbW9kYWxfY291bnRcIil8fDB9LGEubm90eVJlbmRlcmVyLnNldE1vZGFsQ291bnQ9ZnVuY3Rpb24oYil7cmV0dXJuIGEoXCIubm90eV9tb2RhbFwiKS5kYXRhKFwibm90eV9tb2RhbF9jb3VudFwiLGEubm90eVJlbmRlcmVyLmdldE1vZGFsQ291bnQoKStiKX0sYS5mbi5ub3R5PWZ1bmN0aW9uKGIpe3JldHVybiBiLmN1c3RvbT1hKHRoaXMpLGEubm90eVJlbmRlcmVyLmluaXQoYil9LGEubm90eT17fSxhLm5vdHkucXVldWU9W10sYS5ub3R5Lm9udGFwPSEwLGEubm90eS5sYXlvdXRzPXt9LGEubm90eS50aGVtZXM9e30sYS5ub3R5LnJldHVybnM9XCJvYmplY3RcIixhLm5vdHkuc3RvcmU9e30sYS5ub3R5LmdldD1mdW5jdGlvbihiKXtyZXR1cm4gYS5ub3R5LnN0b3JlLmhhc093blByb3BlcnR5KGIpP2Eubm90eS5zdG9yZVtiXTohMX0sYS5ub3R5LmNsb3NlPWZ1bmN0aW9uKGIpe3JldHVybiBhLm5vdHkuZ2V0KGIpP2Eubm90eS5nZXQoYikuY2xvc2UoKTohMX0sYS5ub3R5LnNldFRleHQ9ZnVuY3Rpb24oYixjKXtyZXR1cm4gYS5ub3R5LmdldChiKT9hLm5vdHkuZ2V0KGIpLnNldFRleHQoYyk6ITF9LGEubm90eS5zZXRUeXBlPWZ1bmN0aW9uKGIsYyl7cmV0dXJuIGEubm90eS5nZXQoYik/YS5ub3R5LmdldChiKS5zZXRUeXBlKGMpOiExfSxhLm5vdHkuY2xlYXJRdWV1ZT1mdW5jdGlvbigpe2Eubm90eS5xdWV1ZT1bXX0sYS5ub3R5LmNsb3NlQWxsPWZ1bmN0aW9uKCl7YS5ub3R5LmNsZWFyUXVldWUoKSxhLmVhY2goYS5ub3R5LnN0b3JlLGZ1bmN0aW9uKGEsYil7Yi5jbG9zZSgpfSl9O3ZhciBjPXdpbmRvdy5hbGVydDtyZXR1cm4gYS5ub3R5LmNvbnN1bWVBbGVydD1mdW5jdGlvbihiKXt3aW5kb3cuYWxlcnQ9ZnVuY3Rpb24oYyl7Yj9iLnRleHQ9YzpiPXt0ZXh0OmN9LGEubm90eVJlbmRlcmVyLmluaXQoYil9fSxhLm5vdHkuc3RvcENvbnN1bWVBbGVydD1mdW5jdGlvbigpe3dpbmRvdy5hbGVydD1jfSxhLm5vdHkuZGVmYXVsdHM9e2xheW91dDpcInRvcFwiLHRoZW1lOlwiZGVmYXVsdFRoZW1lXCIsdHlwZTpcImFsZXJ0XCIsdGV4dDpcIlwiLGRpc21pc3NRdWV1ZTohMCx0ZW1wbGF0ZTonPGRpdiBjbGFzcz1cIm5vdHlfbWVzc2FnZVwiPjxzcGFuIGNsYXNzPVwibm90eV90ZXh0XCI+PC9zcGFuPjxkaXYgY2xhc3M9XCJub3R5X2Nsb3NlXCI+PC9kaXY+PC9kaXY+JyxhbmltYXRpb246e29wZW46e2hlaWdodDpcInRvZ2dsZVwifSxjbG9zZTp7aGVpZ2h0OlwidG9nZ2xlXCJ9LGVhc2luZzpcInN3aW5nXCIsc3BlZWQ6NTAwLGZhZGVTcGVlZDpcImZhc3RcIn0sdGltZW91dDohMSxmb3JjZTohMSxtb2RhbDohMSxtYXhWaXNpYmxlOjUsa2lsbGVyOiExLGNsb3NlV2l0aDpbXCJjbGlja1wiXSxjYWxsYmFjazp7b25TaG93OmZ1bmN0aW9uKCl7fSxhZnRlclNob3c6ZnVuY3Rpb24oKXt9LG9uQ2xvc2U6ZnVuY3Rpb24oKXt9LGFmdGVyQ2xvc2U6ZnVuY3Rpb24oKXt9LG9uQ2xvc2VDbGljazpmdW5jdGlvbigpe319LGJ1dHRvbnM6ITF9LGEod2luZG93KS5vbihcInJlc2l6ZVwiLGZ1bmN0aW9uKCl7YS5lYWNoKGEubm90eS5sYXlvdXRzLGZ1bmN0aW9uKGIsYyl7Yy5jb250YWluZXIuc3R5bGUuYXBwbHkoYShjLmNvbnRhaW5lci5zZWxlY3RvcikpfSl9KSx3aW5kb3cubm90eT1mdW5jdGlvbihiKXtyZXR1cm4gYS5ub3R5UmVuZGVyZXIuaW5pdChiKX0sYS5ub3R5LmxheW91dHMuYm90dG9tPXtuYW1lOlwiYm90dG9tXCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9ib3R0b21fbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfYm90dG9tX2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtib3R0b206MCxsZWZ0OlwiNSVcIixwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCI5MCVcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4Ojk5OTk5OTl9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5ib3R0b21DZW50ZXI9e25hbWU6XCJib3R0b21DZW50ZXJcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2JvdHRvbUNlbnRlcl9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9ib3R0b21DZW50ZXJfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe2JvdHRvbToyMCxsZWZ0OjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLGEodGhpcykuY3NzKHtsZWZ0OihhKHdpbmRvdykud2lkdGgoKS1hKHRoaXMpLm91dGVyV2lkdGgoITEpKS8yK1wicHhcIn0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5ib3R0b21MZWZ0PXtuYW1lOlwiYm90dG9tTGVmdFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfYm90dG9tTGVmdF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9ib3R0b21MZWZ0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtib3R0b206MjAsbGVmdDoyMCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSksd2luZG93LmlubmVyV2lkdGg8NjAwJiZhKHRoaXMpLmNzcyh7bGVmdDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmJvdHRvbVJpZ2h0PXtuYW1lOlwiYm90dG9tUmlnaHRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2JvdHRvbVJpZ2h0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2JvdHRvbVJpZ2h0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtib3R0b206MjAscmlnaHQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLHdpbmRvdy5pbm5lcldpZHRoPDYwMCYmYSh0aGlzKS5jc3Moe3JpZ2h0OjV9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuY2VudGVyPXtuYW1lOlwiY2VudGVyXCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9jZW50ZXJfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfY2VudGVyX2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSk7dmFyIGI9YSh0aGlzKS5jbG9uZSgpLmNzcyh7dmlzaWJpbGl0eTpcImhpZGRlblwiLGRpc3BsYXk6XCJibG9ja1wiLHBvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6MCxsZWZ0OjB9KS5hdHRyKFwiaWRcIixcImR1cGVcIik7YShcImJvZHlcIikuYXBwZW5kKGIpLGIuZmluZChcIi5pLWFtLWNsb3Npbmctbm93XCIpLnJlbW92ZSgpLGIuZmluZChcImxpXCIpLmNzcyhcImRpc3BsYXlcIixcImJsb2NrXCIpO3ZhciBjPWIuaGVpZ2h0KCk7Yi5yZW1vdmUoKSxhKHRoaXMpLmhhc0NsYXNzKFwiaS1hbS1uZXdcIik/YSh0aGlzKS5jc3Moe2xlZnQ6KGEod2luZG93KS53aWR0aCgpLWEodGhpcykub3V0ZXJXaWR0aCghMSkpLzIrXCJweFwiLHRvcDooYSh3aW5kb3cpLmhlaWdodCgpLWMpLzIrXCJweFwifSk6YSh0aGlzKS5hbmltYXRlKHtsZWZ0OihhKHdpbmRvdykud2lkdGgoKS1hKHRoaXMpLm91dGVyV2lkdGgoITEpKS8yK1wicHhcIix0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0sNTAwKX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuY2VudGVyTGVmdD17bmFtZTpcImNlbnRlckxlZnRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2NlbnRlckxlZnRfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfY2VudGVyTGVmdF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7bGVmdDoyMCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSk7dmFyIGI9YSh0aGlzKS5jbG9uZSgpLmNzcyh7dmlzaWJpbGl0eTpcImhpZGRlblwiLGRpc3BsYXk6XCJibG9ja1wiLHBvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6MCxsZWZ0OjB9KS5hdHRyKFwiaWRcIixcImR1cGVcIik7YShcImJvZHlcIikuYXBwZW5kKGIpLGIuZmluZChcIi5pLWFtLWNsb3Npbmctbm93XCIpLnJlbW92ZSgpLGIuZmluZChcImxpXCIpLmNzcyhcImRpc3BsYXlcIixcImJsb2NrXCIpO3ZhciBjPWIuaGVpZ2h0KCk7Yi5yZW1vdmUoKSxhKHRoaXMpLmhhc0NsYXNzKFwiaS1hbS1uZXdcIik/YSh0aGlzKS5jc3Moe3RvcDooYSh3aW5kb3cpLmhlaWdodCgpLWMpLzIrXCJweFwifSk6YSh0aGlzKS5hbmltYXRlKHt0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0sNTAwKSx3aW5kb3cuaW5uZXJXaWR0aDw2MDAmJmEodGhpcykuY3NzKHtsZWZ0OjV9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuY2VudGVyUmlnaHQ9e25hbWU6XCJjZW50ZXJSaWdodFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfY2VudGVyUmlnaHRfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfY2VudGVyUmlnaHRfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3JpZ2h0OjIwLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KTt2YXIgYj1hKHRoaXMpLmNsb25lKCkuY3NzKHt2aXNpYmlsaXR5OlwiaGlkZGVuXCIsZGlzcGxheTpcImJsb2NrXCIscG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDowLGxlZnQ6MH0pLmF0dHIoXCJpZFwiLFwiZHVwZVwiKTthKFwiYm9keVwiKS5hcHBlbmQoYiksYi5maW5kKFwiLmktYW0tY2xvc2luZy1ub3dcIikucmVtb3ZlKCksYi5maW5kKFwibGlcIikuY3NzKFwiZGlzcGxheVwiLFwiYmxvY2tcIik7dmFyIGM9Yi5oZWlnaHQoKTtiLnJlbW92ZSgpLGEodGhpcykuaGFzQ2xhc3MoXCJpLWFtLW5ld1wiKT9hKHRoaXMpLmNzcyh7dG9wOihhKHdpbmRvdykuaGVpZ2h0KCktYykvMitcInB4XCJ9KTphKHRoaXMpLmFuaW1hdGUoe3RvcDooYSh3aW5kb3cpLmhlaWdodCgpLWMpLzIrXCJweFwifSw1MDApLHdpbmRvdy5pbm5lcldpZHRoPDYwMCYmYSh0aGlzKS5jc3Moe3JpZ2h0OjV9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuaW5saW5lPXtuYW1lOlwiaW5saW5lXCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGNsYXNzPVwibm90eV9pbmxpbmVfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsLm5vdHlfaW5saW5lX2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHt3aWR0aDpcIjEwMCVcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4Ojk5OTk5OTl9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy50b3A9e25hbWU6XCJ0b3BcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X3RvcF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV90b3BfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3RvcDowLGxlZnQ6XCI1JVwiLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjkwJVwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6OTk5OTk5OX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLnRvcENlbnRlcj17bmFtZTpcInRvcENlbnRlclwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfdG9wQ2VudGVyX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X3RvcENlbnRlcl9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7dG9wOjIwLGxlZnQ6MCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSksYSh0aGlzKS5jc3Moe2xlZnQ6KGEod2luZG93KS53aWR0aCgpLWEodGhpcykub3V0ZXJXaWR0aCghMSkpLzIrXCJweFwifSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLnRvcExlZnQ9e25hbWU6XCJ0b3BMZWZ0XCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV90b3BMZWZ0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X3RvcExlZnRfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3RvcDoyMCxsZWZ0OjIwLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KSx3aW5kb3cuaW5uZXJXaWR0aDw2MDAmJmEodGhpcykuY3NzKHtsZWZ0OjV9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMudG9wUmlnaHQ9e25hbWU6XCJ0b3BSaWdodFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfdG9wUmlnaHRfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfdG9wUmlnaHRfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3RvcDoyMCxyaWdodDoyMCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSksd2luZG93LmlubmVyV2lkdGg8NjAwJiZhKHRoaXMpLmNzcyh7cmlnaHQ6NX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkudGhlbWVzLmJvb3RzdHJhcFRoZW1lPXtuYW1lOlwiYm9vdHN0cmFwVGhlbWVcIixtb2RhbDp7Y3NzOntwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIxMDAlXCIsaGVpZ2h0OlwiMTAwJVwiLGJhY2tncm91bmRDb2xvcjpcIiMwMDBcIix6SW5kZXg6MWU0LG9wYWNpdHk6LjYsZGlzcGxheTpcIm5vbmVcIixsZWZ0OjAsdG9wOjB9fSxzdHlsZTpmdW5jdGlvbigpe3ZhciBiPXRoaXMub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yO3N3aXRjaChhKGIpLmFkZENsYXNzKFwibGlzdC1ncm91cFwiKSx0aGlzLiRjbG9zZUJ1dHRvbi5hcHBlbmQoJzxzcGFuIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPiZ0aW1lczs8L3NwYW4+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+Q2xvc2U8L3NwYW4+JyksdGhpcy4kY2xvc2VCdXR0b24uYWRkQ2xhc3MoXCJjbG9zZVwiKSx0aGlzLiRiYXIuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwLWl0ZW1cIikuY3NzKFwicGFkZGluZ1wiLFwiMHB4XCIpLHRoaXMub3B0aW9ucy50eXBlKXtjYXNlXCJhbGVydFwiOmNhc2VcIm5vdGlmaWNhdGlvblwiOnRoaXMuJGJhci5hZGRDbGFzcyhcImxpc3QtZ3JvdXAtaXRlbS1pbmZvXCIpO2JyZWFrO2Nhc2VcIndhcm5pbmdcIjp0aGlzLiRiYXIuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwLWl0ZW0td2FybmluZ1wiKTticmVhaztjYXNlXCJlcnJvclwiOnRoaXMuJGJhci5hZGRDbGFzcyhcImxpc3QtZ3JvdXAtaXRlbS1kYW5nZXJcIik7YnJlYWs7Y2FzZVwiaW5mb3JtYXRpb25cIjp0aGlzLiRiYXIuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwLWl0ZW0taW5mb1wiKTticmVhaztjYXNlXCJzdWNjZXNzXCI6dGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtLXN1Y2Nlc3NcIil9dGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTNweFwiLGxpbmVIZWlnaHQ6XCIxNnB4XCIsdGV4dEFsaWduOlwiY2VudGVyXCIscGFkZGluZzpcIjhweCAxMHB4IDlweFwiLHdpZHRoOlwiYXV0b1wiLHBvc2l0aW9uOlwicmVsYXRpdmVcIn0pfSxjYWxsYmFjazp7b25TaG93OmZ1bmN0aW9uKCl7fSxvbkNsb3NlOmZ1bmN0aW9uKCl7fX19LGEubm90eS50aGVtZXMuZGVmYXVsdFRoZW1lPXtuYW1lOlwiZGVmYXVsdFRoZW1lXCIsaGVscGVyczp7Ym9yZGVyRml4OmZ1bmN0aW9uKCl7aWYodGhpcy5vcHRpb25zLmRpc21pc3NRdWV1ZSl7dmFyIGI9dGhpcy5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IrXCIgXCIrdGhpcy5vcHRpb25zLmxheW91dC5wYXJlbnQuc2VsZWN0b3I7c3dpdGNoKHRoaXMub3B0aW9ucy5sYXlvdXQubmFtZSl7Y2FzZVwidG9wXCI6YShiKS5jc3Moe2JvcmRlclJhZGl1czpcIjBweCAwcHggMHB4IDBweFwifSksYShiKS5sYXN0KCkuY3NzKHtib3JkZXJSYWRpdXM6XCIwcHggMHB4IDVweCA1cHhcIn0pO2JyZWFrO2Nhc2VcInRvcENlbnRlclwiOmNhc2VcInRvcExlZnRcIjpjYXNlXCJ0b3BSaWdodFwiOmNhc2VcImJvdHRvbUNlbnRlclwiOmNhc2VcImJvdHRvbUxlZnRcIjpjYXNlXCJib3R0b21SaWdodFwiOmNhc2VcImNlbnRlclwiOmNhc2VcImNlbnRlckxlZnRcIjpjYXNlXCJjZW50ZXJSaWdodFwiOmNhc2VcImlubGluZVwiOmEoYikuY3NzKHtib3JkZXJSYWRpdXM6XCIwcHggMHB4IDBweCAwcHhcIn0pLGEoYikuZmlyc3QoKS5jc3Moe1wiYm9yZGVyLXRvcC1sZWZ0LXJhZGl1c1wiOlwiNXB4XCIsXCJib3JkZXItdG9wLXJpZ2h0LXJhZGl1c1wiOlwiNXB4XCJ9KSxhKGIpLmxhc3QoKS5jc3Moe1wiYm9yZGVyLWJvdHRvbS1sZWZ0LXJhZGl1c1wiOlwiNXB4XCIsXCJib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1c1wiOlwiNXB4XCJ9KTticmVhaztjYXNlXCJib3R0b21cIjphKGIpLmNzcyh7Ym9yZGVyUmFkaXVzOlwiMHB4IDBweCAwcHggMHB4XCJ9KSxhKGIpLmZpcnN0KCkuY3NzKHtib3JkZXJSYWRpdXM6XCI1cHggNXB4IDBweCAwcHhcIn0pfX19fSxtb2RhbDp7Y3NzOntwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIxMDAlXCIsaGVpZ2h0OlwiMTAwJVwiLGJhY2tncm91bmRDb2xvcjpcIiMwMDBcIix6SW5kZXg6MWU0LG9wYWNpdHk6LjYsZGlzcGxheTpcIm5vbmVcIixsZWZ0OjAsdG9wOjB9fSxzdHlsZTpmdW5jdGlvbigpe3N3aXRjaCh0aGlzLiRiYXIuY3NzKHtvdmVyZmxvdzpcImhpZGRlblwiLGJhY2tncm91bmQ6XCJ1cmwoJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQnNBQUFBb0NBUUFBQUNsTTBuZEFBQUFoa2xFUVZSNEFkWE8wUXJDTUJCRTBidHRrazM4L3c4V1JFUnBkeWp6Vk9jK0h4aElIcUpHTVFjRkZrcFlSUW90TExTdzBJSjVhQmRvdnJ1TVlEQS9rVDhwbEY5WktMRlFjZ0YxOGhEajFTYlFPTWxDQTRrYW8waWlYbWFoN3FCV1BkeHBvaHNnVlp5ajdlNUk5S2NJRCtFaGlESTVneEJZS0xCUVlLSEFRb0dGQW9Fa3MvWUVHSFlLQjdoRnhmMEFBQUFBU1VWT1JLNUNZSUk9JykgcmVwZWF0LXggc2Nyb2xsIGxlZnQgdG9wICNmZmZcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjEzcHhcIixsaW5lSGVpZ2h0OlwiMTZweFwiLHRleHRBbGlnbjpcImNlbnRlclwiLHBhZGRpbmc6XCI4cHggMTBweCA5cHhcIix3aWR0aDpcImF1dG9cIixwb3NpdGlvbjpcInJlbGF0aXZlXCJ9KSx0aGlzLiRjbG9zZUJ1dHRvbi5jc3Moe3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6NCxyaWdodDo0LHdpZHRoOjEwLGhlaWdodDoxMCxiYWNrZ3JvdW5kOlwidXJsKGRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQW9BQUFBS0NBUUFBQUFuT3djMkFBQUF4VWxFUVZSNEFSM01QVW9EVVJTQTBlKyt1U2trT3hDM0lBT1dOdGFDSURhQ2hmZ1hCTUVaYlFSQnl4Q3drK0Jhc2dRUlpMU1lvTGdEUWJBUnhyeThueXVtUGNWUktEZmQwQWE4QXNnRHYxenA2cFlkNWpXT3dodmViUlRiek5ORXc1QlNzSXBzai9rdXJRQm5tazdzSUZjQ0Y1eXlaUERSRzZ0clFodWpYWW9zYUZvYysyZjFNSjg5dWM3NklORDZGOUJ2bFhVZHBiNnh3RDIrNHEzbWUzYnlzaUh2dExZclVKdG83UEQvdmU3TE5IeFNnL3dvTjJrU3o0dHhhc0JkaHlpejN1Z1BHZXRUam0zWFJva0FBQUFBU1VWT1JLNUNZSUk9KVwiLGRpc3BsYXk6XCJub25lXCIsY3Vyc29yOlwicG9pbnRlclwifSksdGhpcy4kYnV0dG9ucy5jc3Moe3BhZGRpbmc6NSx0ZXh0QWxpZ246XCJyaWdodFwiLGJvcmRlclRvcDpcIjFweCBzb2xpZCAjY2NjXCIsYmFja2dyb3VuZENvbG9yOlwiI2ZmZlwifSksdGhpcy4kYnV0dG9ucy5maW5kKFwiYnV0dG9uXCIpLmNzcyh7bWFyZ2luTGVmdDo1fSksdGhpcy4kYnV0dG9ucy5maW5kKFwiYnV0dG9uOmZpcnN0XCIpLmNzcyh7bWFyZ2luTGVmdDowfSksdGhpcy4kYmFyLm9uKHttb3VzZWVudGVyOmZ1bmN0aW9uKCl7YSh0aGlzKS5maW5kKFwiLm5vdHlfY2xvc2VcIikuc3RvcCgpLmZhZGVUbyhcIm5vcm1hbFwiLDEpfSxtb3VzZWxlYXZlOmZ1bmN0aW9uKCl7YSh0aGlzKS5maW5kKFwiLm5vdHlfY2xvc2VcIikuc3RvcCgpLmZhZGVUbyhcIm5vcm1hbFwiLDApfX0pLHRoaXMub3B0aW9ucy5sYXlvdXQubmFtZSl7Y2FzZVwidG9wXCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyUmFkaXVzOlwiMHB4IDBweCA1cHggNXB4XCIsYm9yZGVyQm90dG9tOlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJMZWZ0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJSaWdodDpcIjJweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSk7YnJlYWs7Y2FzZVwidG9wQ2VudGVyXCI6Y2FzZVwiY2VudGVyXCI6Y2FzZVwiYm90dG9tQ2VudGVyXCI6Y2FzZVwiaW5saW5lXCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyUmFkaXVzOlwiNXB4XCIsYm9yZGVyOlwiMXB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsdGV4dEFsaWduOlwiY2VudGVyXCJ9KTticmVhaztjYXNlXCJ0b3BMZWZ0XCI6Y2FzZVwidG9wUmlnaHRcIjpjYXNlXCJib3R0b21MZWZ0XCI6Y2FzZVwiYm90dG9tUmlnaHRcIjpjYXNlXCJjZW50ZXJMZWZ0XCI6Y2FzZVwiY2VudGVyUmlnaHRcIjp0aGlzLiRiYXIuY3NzKHtib3JkZXJSYWRpdXM6XCI1cHhcIixib3JkZXI6XCIxcHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjEzcHhcIix0ZXh0QWxpZ246XCJsZWZ0XCJ9KTticmVhaztjYXNlXCJib3R0b21cIjp0aGlzLiRiYXIuY3NzKHtib3JkZXJSYWRpdXM6XCI1cHggNXB4IDBweCAwcHhcIixib3JkZXJUb3A6XCIycHggc29saWQgI2VlZVwiLGJvcmRlckxlZnQ6XCIycHggc29saWQgI2VlZVwiLGJvcmRlclJpZ2h0OlwiMnB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIC0ycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSk7YnJlYWs7ZGVmYXVsdDp0aGlzLiRiYXIuY3NzKHtib3JkZXI6XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pfXN3aXRjaCh0aGlzLm9wdGlvbnMudHlwZSl7Y2FzZVwiYWxlcnRcIjpjYXNlXCJub3RpZmljYXRpb25cIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkZGXCIsYm9yZGVyQ29sb3I6XCIjQ0NDXCIsY29sb3I6XCIjNDQ0XCJ9KTticmVhaztjYXNlXCJ3YXJuaW5nXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGRUFBOFwiLGJvcmRlckNvbG9yOlwiI0ZGQzIzN1wiLGNvbG9yOlwiIzgyNjIwMFwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjRkZDMjM3XCJ9KTticmVhaztjYXNlXCJlcnJvclwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcInJlZFwiLGJvcmRlckNvbG9yOlwiZGFya3JlZFwiLGNvbG9yOlwiI0ZGRlwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRXZWlnaHQ6XCJib2xkXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkIGRhcmtyZWRcIn0pO2JyZWFrO2Nhc2VcImluZm9ybWF0aW9uXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiIzU3QjdFMlwiLGJvcmRlckNvbG9yOlwiIzBCOTBDNFwiLGNvbG9yOlwiI0ZGRlwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjMEI5MEM0XCJ9KTticmVhaztjYXNlXCJzdWNjZXNzXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwibGlnaHRncmVlblwiLGJvcmRlckNvbG9yOlwiIzUwQzI0RVwiLGNvbG9yOlwiZGFya2dyZWVuXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkICM1MEMyNEVcIn0pO2JyZWFrO2RlZmF1bHQ6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGRlwiLGJvcmRlckNvbG9yOlwiI0NDQ1wiLGNvbG9yOlwiIzQ0NFwifSl9fSxjYWxsYmFjazp7b25TaG93OmZ1bmN0aW9uKCl7YS5ub3R5LnRoZW1lcy5kZWZhdWx0VGhlbWUuaGVscGVycy5ib3JkZXJGaXguYXBwbHkodGhpcyl9LG9uQ2xvc2U6ZnVuY3Rpb24oKXthLm5vdHkudGhlbWVzLmRlZmF1bHRUaGVtZS5oZWxwZXJzLmJvcmRlckZpeC5hcHBseSh0aGlzKX19fSxhLm5vdHkudGhlbWVzLnJlbGF4PXtuYW1lOlwicmVsYXhcIixoZWxwZXJzOnt9LG1vZGFsOntjc3M6e3Bvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjEwMCVcIixoZWlnaHQ6XCIxMDAlXCIsYmFja2dyb3VuZENvbG9yOlwiIzAwMFwiLHpJbmRleDoxZTQsb3BhY2l0eTouNixkaXNwbGF5Olwibm9uZVwiLGxlZnQ6MCx0b3A6MH19LHN0eWxlOmZ1bmN0aW9uKCl7c3dpdGNoKHRoaXMuJGJhci5jc3Moe292ZXJmbG93OlwiaGlkZGVuXCIsbWFyZ2luOlwiNHB4IDBcIixib3JkZXJSYWRpdXM6XCIycHhcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjE0cHhcIixsaW5lSGVpZ2h0OlwiMTZweFwiLHRleHRBbGlnbjpcImNlbnRlclwiLHBhZGRpbmc6XCIxMHB4XCIsd2lkdGg6XCJhdXRvXCIscG9zaXRpb246XCJyZWxhdGl2ZVwifSksdGhpcy4kY2xvc2VCdXR0b24uY3NzKHtwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOjQscmlnaHQ6NCx3aWR0aDoxMCxoZWlnaHQ6MTAsYmFja2dyb3VuZDpcInVybChkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFvQUFBQUtDQVFBQUFBbk93YzJBQUFBeFVsRVFWUjRBUjNNUFVvRFVSU0EwZSsrdVNra094QzNJQU9XTnRhQ0lEYUNoZmdYQk1FWmJRUkJ5eEN3aytCYXNnUVJaTFNZb0xnRFFiQVJ4cnk4bnl1bVBjVlJLRGZkMEFhOEFzZ0R2MXpwNnBZZDVqV093aHZlYlJUYnpOTkV3NUJTc0lwc2ova3VyUUJubWs3c0lGY0NGNXl5WlBEUkc2dHJRaHVqWFlvc2FGb2MrMmYxTUo4OXVjNzZJTkQ2RjlCdmxYVWRwYjZ4d0QyKzRxM21lM2J5c2lIdnRMWXJVSnRvN1BEL3ZlN0xOSHhTZy93b04ya1N6NHR4YXNCZGh5aXozdWdQR2V0VGptM1hSb2tBQUFBQVNVVk9SSzVDWUlJPSlcIixkaXNwbGF5Olwibm9uZVwiLGN1cnNvcjpcInBvaW50ZXJcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtwYWRkaW5nOjUsdGV4dEFsaWduOlwicmlnaHRcIixib3JkZXJUb3A6XCIxcHggc29saWQgI2NjY1wiLGJhY2tncm91bmRDb2xvcjpcIiNmZmZcIn0pLHRoaXMuJGJ1dHRvbnMuZmluZChcImJ1dHRvblwiKS5jc3Moe21hcmdpbkxlZnQ6NX0pLHRoaXMuJGJ1dHRvbnMuZmluZChcImJ1dHRvbjpmaXJzdFwiKS5jc3Moe21hcmdpbkxlZnQ6MH0pLHRoaXMuJGJhci5vbih7bW91c2VlbnRlcjpmdW5jdGlvbigpe2EodGhpcykuZmluZChcIi5ub3R5X2Nsb3NlXCIpLnN0b3AoKS5mYWRlVG8oXCJub3JtYWxcIiwxKX0sbW91c2VsZWF2ZTpmdW5jdGlvbigpe2EodGhpcykuZmluZChcIi5ub3R5X2Nsb3NlXCIpLnN0b3AoKS5mYWRlVG8oXCJub3JtYWxcIiwwKX19KSx0aGlzLm9wdGlvbnMubGF5b3V0Lm5hbWUpe2Nhc2VcInRvcFwiOnRoaXMuJGJhci5jc3Moe2JvcmRlckJvdHRvbTpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyTGVmdDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyUmlnaHQ6XCIycHggc29saWQgI2VlZVwiLGJvcmRlclRvcDpcIjJweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSk7YnJlYWs7Y2FzZVwidG9wQ2VudGVyXCI6Y2FzZVwiY2VudGVyXCI6Y2FzZVwiYm90dG9tQ2VudGVyXCI6Y2FzZVwiaW5saW5lXCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyOlwiMXB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsdGV4dEFsaWduOlwiY2VudGVyXCJ9KTticmVhaztjYXNlXCJ0b3BMZWZ0XCI6Y2FzZVwidG9wUmlnaHRcIjpjYXNlXCJib3R0b21MZWZ0XCI6Y2FzZVwiYm90dG9tUmlnaHRcIjpjYXNlXCJjZW50ZXJMZWZ0XCI6Y2FzZVwiY2VudGVyUmlnaHRcIjp0aGlzLiRiYXIuY3NzKHtib3JkZXI6XCIxcHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjEzcHhcIix0ZXh0QWxpZ246XCJsZWZ0XCJ9KTticmVhaztjYXNlXCJib3R0b21cIjp0aGlzLiRiYXIuY3NzKHtib3JkZXJUb3A6XCIycHggc29saWQgI2VlZVwiLGJvcmRlckxlZnQ6XCIycHggc29saWQgI2VlZVwiLGJvcmRlclJpZ2h0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJCb3R0b206XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgLTJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KTticmVhaztkZWZhdWx0OnRoaXMuJGJhci5jc3Moe2JvcmRlcjpcIjJweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSl9c3dpdGNoKHRoaXMub3B0aW9ucy50eXBlKXtjYXNlXCJhbGVydFwiOmNhc2VcIm5vdGlmaWNhdGlvblwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkZcIixib3JkZXJDb2xvcjpcIiNkZWRlZGVcIixjb2xvcjpcIiM0NDRcIn0pO2JyZWFrO2Nhc2VcIndhcm5pbmdcIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkZFQUE4XCIsYm9yZGVyQ29sb3I6XCIjRkZDMjM3XCIsY29sb3I6XCIjODI2MjAwXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkICNGRkMyMzdcIn0pO2JyZWFrO2Nhc2VcImVycm9yXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGODE4MVwiLGJvcmRlckNvbG9yOlwiI2UyNTM1M1wiLGNvbG9yOlwiI0ZGRlwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRXZWlnaHQ6XCJib2xkXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkIGRhcmtyZWRcIn0pO2JyZWFrO2Nhc2VcImluZm9ybWF0aW9uXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiIzc4QzVFN1wiLGJvcmRlckNvbG9yOlwiIzNiYWRkNlwiLGNvbG9yOlwiI0ZGRlwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjMEI5MEM0XCJ9KTticmVhaztjYXNlXCJzdWNjZXNzXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0JDRjVCQ1wiLGJvcmRlckNvbG9yOlwiIzdjZGQ3N1wiLGNvbG9yOlwiZGFya2dyZWVuXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkICM1MEMyNEVcIn0pO2JyZWFrO2RlZmF1bHQ6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGRlwiLGJvcmRlckNvbG9yOlwiI0NDQ1wiLGNvbG9yOlwiIzQ0NFwifSl9fSxjYWxsYmFjazp7b25TaG93OmZ1bmN0aW9uKCl7fSxvbkNsb3NlOmZ1bmN0aW9uKCl7fX19LHdpbmRvdy5ub3R5fSk7IiwiLyohXHJcbiAqIE1vY2tKYXggLSBqUXVlcnkgUGx1Z2luIHRvIE1vY2sgQWpheCByZXF1ZXN0c1xyXG4gKlxyXG4gKiBWZXJzaW9uOiAgMS41LjNcclxuICogUmVsZWFzZWQ6XHJcbiAqIEhvbWU6ICAgaHR0cDovL2dpdGh1Yi5jb20vYXBwZW5kdG8vanF1ZXJ5LW1vY2tqYXhcclxuICogQXV0aG9yOiAgIEpvbmF0aGFuIFNoYXJwIChodHRwOi8vamRzaGFycC5jb20pXHJcbiAqIExpY2Vuc2U6ICBNSVQsR1BMXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAxMSBhcHBlbmRUbyBMTEMuXHJcbiAqIER1YWwgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBvciBHUEwgbGljZW5zZXMuXHJcbiAqIGh0dHA6Ly9hcHBlbmR0by5jb20vb3Blbi1zb3VyY2UtbGljZW5zZXNcclxuICovXHJcbihmdW5jdGlvbigkKSB7XHJcblx0dmFyIF9hamF4ID0gJC5hamF4LFxyXG5cdFx0bW9ja0hhbmRsZXJzID0gW10sXHJcblx0XHRtb2NrZWRBamF4Q2FsbHMgPSBbXSxcclxuXHRcdENBTExCQUNLX1JFR0VYID0gLz1cXD8oJnwkKS8sXHJcblx0XHRqc2MgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpO1xyXG5cclxuXHJcblx0Ly8gUGFyc2UgdGhlIGdpdmVuIFhNTCBzdHJpbmcuXHJcblx0ZnVuY3Rpb24gcGFyc2VYTUwoeG1sKSB7XHJcblx0XHRpZiAoIHdpbmRvdy5ET01QYXJzZXIgPT0gdW5kZWZpbmVkICYmIHdpbmRvdy5BY3RpdmVYT2JqZWN0ICkge1xyXG5cdFx0XHRET01QYXJzZXIgPSBmdW5jdGlvbigpIHsgfTtcclxuXHRcdFx0RE9NUGFyc2VyLnByb3RvdHlwZS5wYXJzZUZyb21TdHJpbmcgPSBmdW5jdGlvbiggeG1sU3RyaW5nICkge1xyXG5cdFx0XHRcdHZhciBkb2MgPSBuZXcgQWN0aXZlWE9iamVjdCgnTWljcm9zb2Z0LlhNTERPTScpO1xyXG5cdFx0XHRcdGRvYy5hc3luYyA9ICdmYWxzZSc7XHJcblx0XHRcdFx0ZG9jLmxvYWRYTUwoIHhtbFN0cmluZyApO1xyXG5cdFx0XHRcdHJldHVybiBkb2M7XHJcblx0XHRcdH07XHJcblx0XHR9XHJcblxyXG5cdFx0dHJ5IHtcclxuXHRcdFx0dmFyIHhtbERvYyA9ICggbmV3IERPTVBhcnNlcigpICkucGFyc2VGcm9tU3RyaW5nKCB4bWwsICd0ZXh0L3htbCcgKTtcclxuXHRcdFx0aWYgKCAkLmlzWE1MRG9jKCB4bWxEb2MgKSApIHtcclxuXHRcdFx0XHR2YXIgZXJyID0gJCgncGFyc2VyZXJyb3InLCB4bWxEb2MpO1xyXG5cdFx0XHRcdGlmICggZXJyLmxlbmd0aCA9PSAxICkge1xyXG5cdFx0XHRcdFx0dGhyb3coJ0Vycm9yOiAnICsgJCh4bWxEb2MpLnRleHQoKSApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aHJvdygnVW5hYmxlIHRvIHBhcnNlIFhNTCcpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB4bWxEb2M7XHJcblx0XHR9IGNhdGNoKCBlICkge1xyXG5cdFx0XHR2YXIgbXNnID0gKCBlLm5hbWUgPT0gdW5kZWZpbmVkID8gZSA6IGUubmFtZSArICc6ICcgKyBlLm1lc3NhZ2UgKTtcclxuXHRcdFx0JChkb2N1bWVudCkudHJpZ2dlcigneG1sUGFyc2VFcnJvcicsIFsgbXNnIF0pO1xyXG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gVHJpZ2dlciBhIGpRdWVyeSBldmVudFxyXG5cdGZ1bmN0aW9uIHRyaWdnZXIocywgdHlwZSwgYXJncykge1xyXG5cdFx0KHMuY29udGV4dCA/ICQocy5jb250ZXh0KSA6ICQuZXZlbnQpLnRyaWdnZXIodHlwZSwgYXJncyk7XHJcblx0fVxyXG5cclxuXHQvLyBDaGVjayBpZiB0aGUgZGF0YSBmaWVsZCBvbiB0aGUgbW9jayBoYW5kbGVyIGFuZCB0aGUgcmVxdWVzdCBtYXRjaC4gVGhpc1xyXG5cdC8vIGNhbiBiZSB1c2VkIHRvIHJlc3RyaWN0IGEgbW9jayBoYW5kbGVyIHRvIGJlaW5nIHVzZWQgb25seSB3aGVuIGEgY2VydGFpblxyXG5cdC8vIHNldCBvZiBkYXRhIGlzIHBhc3NlZCB0byBpdC5cclxuXHRmdW5jdGlvbiBpc01vY2tEYXRhRXF1YWwoIG1vY2ssIGxpdmUgKSB7XHJcblx0XHR2YXIgaWRlbnRpY2FsID0gdHJ1ZTtcclxuXHRcdC8vIFRlc3QgZm9yIHNpdHVhdGlvbnMgd2hlcmUgdGhlIGRhdGEgaXMgYSBxdWVyeXN0cmluZyAobm90IGFuIG9iamVjdClcclxuXHRcdGlmICh0eXBlb2YgbGl2ZSA9PT0gJ3N0cmluZycpIHtcclxuXHRcdFx0Ly8gUXVlcnlzdHJpbmcgbWF5IGJlIGEgcmVnZXhcclxuXHRcdFx0cmV0dXJuICQuaXNGdW5jdGlvbiggbW9jay50ZXN0ICkgPyBtb2NrLnRlc3QobGl2ZSkgOiBtb2NrID09IGxpdmU7XHJcblx0XHR9XHJcblx0XHQkLmVhY2gobW9jaywgZnVuY3Rpb24oaykge1xyXG5cdFx0XHRpZiAoIGxpdmVba10gPT09IHVuZGVmaW5lZCApIHtcclxuXHRcdFx0XHRpZGVudGljYWwgPSBmYWxzZTtcclxuXHRcdFx0XHRyZXR1cm4gaWRlbnRpY2FsO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmICggdHlwZW9mIGxpdmVba10gPT09ICdvYmplY3QnICYmIGxpdmVba10gIT09IG51bGwgKSB7XHJcblx0XHRcdFx0XHRpZiAoIGlkZW50aWNhbCAmJiAkLmlzQXJyYXkoIGxpdmVba10gKSApIHtcclxuXHRcdFx0XHRcdFx0aWRlbnRpY2FsID0gJC5pc0FycmF5KCBtb2NrW2tdICkgJiYgbGl2ZVtrXS5sZW5ndGggPT09IG1vY2tba10ubGVuZ3RoO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWRlbnRpY2FsID0gaWRlbnRpY2FsICYmIGlzTW9ja0RhdGFFcXVhbChtb2NrW2tdLCBsaXZlW2tdKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0aWYgKCBtb2NrW2tdICYmICQuaXNGdW5jdGlvbiggbW9ja1trXS50ZXN0ICkgKSB7XHJcblx0XHRcdFx0XHRcdGlkZW50aWNhbCA9IGlkZW50aWNhbCAmJiBtb2NrW2tdLnRlc3QobGl2ZVtrXSk7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRpZGVudGljYWwgPSBpZGVudGljYWwgJiYgKCBtb2NrW2tdID09IGxpdmVba10gKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdHJldHVybiBpZGVudGljYWw7XHJcblx0fVxyXG5cclxuICAgIC8vIFNlZSBpZiBhIG1vY2sgaGFuZGxlciBwcm9wZXJ0eSBtYXRjaGVzIHRoZSBkZWZhdWx0IHNldHRpbmdzXHJcbiAgICBmdW5jdGlvbiBpc0RlZmF1bHRTZXR0aW5nKGhhbmRsZXIsIHByb3BlcnR5KSB7XHJcbiAgICAgICAgcmV0dXJuIGhhbmRsZXJbcHJvcGVydHldID09PSAkLm1vY2tqYXhTZXR0aW5nc1twcm9wZXJ0eV07XHJcbiAgICB9XHJcblxyXG5cdC8vIENoZWNrIHRoZSBnaXZlbiBoYW5kbGVyIHNob3VsZCBtb2NrIHRoZSBnaXZlbiByZXF1ZXN0XHJcblx0ZnVuY3Rpb24gZ2V0TW9ja0ZvclJlcXVlc3QoIGhhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncyApIHtcclxuXHRcdC8vIElmIHRoZSBtb2NrIHdhcyByZWdpc3RlcmVkIHdpdGggYSBmdW5jdGlvbiwgbGV0IHRoZSBmdW5jdGlvbiBkZWNpZGUgaWYgd2VcclxuXHRcdC8vIHdhbnQgdG8gbW9jayB0aGlzIHJlcXVlc3RcclxuXHRcdGlmICggJC5pc0Z1bmN0aW9uKGhhbmRsZXIpICkge1xyXG5cdFx0XHRyZXR1cm4gaGFuZGxlciggcmVxdWVzdFNldHRpbmdzICk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gSW5zcGVjdCB0aGUgVVJMIG9mIHRoZSByZXF1ZXN0IGFuZCBjaGVjayBpZiB0aGUgbW9jayBoYW5kbGVyJ3MgdXJsXHJcblx0XHQvLyBtYXRjaGVzIHRoZSB1cmwgZm9yIHRoaXMgYWpheCByZXF1ZXN0XHJcblx0XHRpZiAoICQuaXNGdW5jdGlvbihoYW5kbGVyLnVybC50ZXN0KSApIHtcclxuXHRcdFx0Ly8gVGhlIHVzZXIgcHJvdmlkZWQgYSByZWdleCBmb3IgdGhlIHVybCwgdGVzdCBpdFxyXG5cdFx0XHRpZiAoICFoYW5kbGVyLnVybC50ZXN0KCByZXF1ZXN0U2V0dGluZ3MudXJsICkgKSB7XHJcblx0XHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIExvb2sgZm9yIGEgc2ltcGxlIHdpbGRjYXJkICcqJyBvciBhIGRpcmVjdCBVUkwgbWF0Y2hcclxuXHRcdFx0dmFyIHN0YXIgPSBoYW5kbGVyLnVybC5pbmRleE9mKCcqJyk7XHJcblx0XHRcdGlmIChoYW5kbGVyLnVybCAhPT0gcmVxdWVzdFNldHRpbmdzLnVybCAmJiBzdGFyID09PSAtMSB8fFxyXG5cdFx0XHRcdFx0IW5ldyBSZWdFeHAoaGFuZGxlci51cmwucmVwbGFjZSgvWy1bXFxde30oKSs/LixcXFxcXiR8I1xcc10vZywgXCJcXFxcJCZcIikucmVwbGFjZSgvXFwqL2csICcuKycpKS50ZXN0KHJlcXVlc3RTZXR0aW5ncy51cmwpKSB7XHJcblx0XHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvLyBJbnNwZWN0IHRoZSBkYXRhIHN1Ym1pdHRlZCBpbiB0aGUgcmVxdWVzdCAoZWl0aGVyIFBPU1QgYm9keSBvciBHRVQgcXVlcnkgc3RyaW5nKVxyXG5cdFx0aWYgKCBoYW5kbGVyLmRhdGEgKSB7XHJcblx0XHRcdGlmICggISByZXF1ZXN0U2V0dGluZ3MuZGF0YSB8fCAhaXNNb2NrRGF0YUVxdWFsKGhhbmRsZXIuZGF0YSwgcmVxdWVzdFNldHRpbmdzLmRhdGEpICkge1xyXG5cdFx0XHRcdC8vIFRoZXkncmUgbm90IGlkZW50aWNhbCwgZG8gbm90IG1vY2sgdGhpcyByZXF1ZXN0XHJcblx0XHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8vIEluc3BlY3QgdGhlIHJlcXVlc3QgdHlwZVxyXG5cdFx0aWYgKCBoYW5kbGVyICYmIGhhbmRsZXIudHlwZSAmJlxyXG5cdFx0XHRcdGhhbmRsZXIudHlwZS50b0xvd2VyQ2FzZSgpICE9IHJlcXVlc3RTZXR0aW5ncy50eXBlLnRvTG93ZXJDYXNlKCkgKSB7XHJcblx0XHRcdC8vIFRoZSByZXF1ZXN0IHR5cGUgZG9lc24ndCBtYXRjaCAoR0VUIHZzLiBQT1NUKVxyXG5cdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gaGFuZGxlcjtcclxuXHR9XHJcblxyXG5cdC8vIFByb2Nlc3MgdGhlIHhociBvYmplY3RzIHNlbmQgb3BlcmF0aW9uXHJcblx0ZnVuY3Rpb24gX3hoclNlbmQobW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncywgb3JpZ1NldHRpbmdzKSB7XHJcblxyXG5cdFx0Ly8gVGhpcyBpcyBhIHN1YnN0aXR1dGUgZm9yIDwgMS40IHdoaWNoIGxhY2tzICQucHJveHlcclxuXHRcdHZhciBwcm9jZXNzID0gKGZ1bmN0aW9uKHRoYXQpIHtcclxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHJldHVybiAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHR2YXIgb25SZWFkeTtcclxuXHJcblx0XHRcdFx0XHQvLyBUaGUgcmVxdWVzdCBoYXMgcmV0dXJuZWRcclxuXHRcdFx0XHRcdHRoaXMuc3RhdHVzICAgICA9IG1vY2tIYW5kbGVyLnN0YXR1cztcclxuXHRcdFx0XHRcdHRoaXMuc3RhdHVzVGV4dCA9IG1vY2tIYW5kbGVyLnN0YXR1c1RleHQ7XHJcblx0XHRcdFx0XHR0aGlzLnJlYWR5U3RhdGVcdD0gNDtcclxuXHJcblx0XHRcdFx0XHQvLyBXZSBoYXZlIGFuIGV4ZWN1dGFibGUgZnVuY3Rpb24sIGNhbGwgaXQgdG8gZ2l2ZVxyXG5cdFx0XHRcdFx0Ly8gdGhlIG1vY2sgaGFuZGxlciBhIGNoYW5jZSB0byB1cGRhdGUgaXQncyBkYXRhXHJcblx0XHRcdFx0XHRpZiAoICQuaXNGdW5jdGlvbihtb2NrSGFuZGxlci5yZXNwb25zZSkgKSB7XHJcblx0XHRcdFx0XHRcdG1vY2tIYW5kbGVyLnJlc3BvbnNlKG9yaWdTZXR0aW5ncyk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvLyBDb3B5IG92ZXIgb3VyIG1vY2sgdG8gb3VyIHhociBvYmplY3QgYmVmb3JlIHBhc3NpbmcgY29udHJvbCBiYWNrIHRvXHJcblx0XHRcdFx0XHQvLyBqUXVlcnkncyBvbnJlYWR5c3RhdGVjaGFuZ2UgY2FsbGJhY2tcclxuXHRcdFx0XHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlID09ICdqc29uJyAmJiAoIHR5cGVvZiBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgPT0gJ29iamVjdCcgKSApIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5yZXNwb25zZVRleHQgPSBKU09OLnN0cmluZ2lmeShtb2NrSGFuZGxlci5yZXNwb25zZVRleHQpO1xyXG5cdFx0XHRcdFx0fSBlbHNlIGlmICggcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlID09ICd4bWwnICkge1xyXG5cdFx0XHRcdFx0XHRpZiAoIHR5cGVvZiBtb2NrSGFuZGxlci5yZXNwb25zZVhNTCA9PSAnc3RyaW5nJyApIHtcclxuXHRcdFx0XHRcdFx0XHR0aGlzLnJlc3BvbnNlWE1MID0gcGFyc2VYTUwobW9ja0hhbmRsZXIucmVzcG9uc2VYTUwpO1xyXG5cdFx0XHRcdFx0XHRcdC8vaW4galF1ZXJ5IDEuOS4xKywgcmVzcG9uc2VYTUwgaXMgcHJvY2Vzc2VkIGRpZmZlcmVudGx5IGFuZCByZWxpZXMgb24gcmVzcG9uc2VUZXh0XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5yZXNwb25zZVRleHQgPSBtb2NrSGFuZGxlci5yZXNwb25zZVhNTDtcclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHR0aGlzLnJlc3BvbnNlWE1MID0gbW9ja0hhbmRsZXIucmVzcG9uc2VYTUw7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2VUZXh0ID0gbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0O1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWYoIHR5cGVvZiBtb2NrSGFuZGxlci5zdGF0dXMgPT0gJ251bWJlcicgfHwgdHlwZW9mIG1vY2tIYW5kbGVyLnN0YXR1cyA9PSAnc3RyaW5nJyApIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5zdGF0dXMgPSBtb2NrSGFuZGxlci5zdGF0dXM7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZiggdHlwZW9mIG1vY2tIYW5kbGVyLnN0YXR1c1RleHQgPT09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5zdGF0dXNUZXh0ID0gbW9ja0hhbmRsZXIuc3RhdHVzVGV4dDtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8vIGpRdWVyeSAyLjAgcmVuYW1lZCBvbnJlYWR5c3RhdGVjaGFuZ2UgdG8gb25sb2FkXHJcblx0XHRcdFx0XHRvblJlYWR5ID0gdGhpcy5vbnJlYWR5c3RhdGVjaGFuZ2UgfHwgdGhpcy5vbmxvYWQ7XHJcblxyXG5cdFx0XHRcdFx0Ly8galF1ZXJ5IDwgMS40IGRvZXNuJ3QgaGF2ZSBvbnJlYWR5c3RhdGUgY2hhbmdlIGZvciB4aHJcclxuXHRcdFx0XHRcdGlmICggJC5pc0Z1bmN0aW9uKCBvblJlYWR5ICkgKSB7XHJcblx0XHRcdFx0XHRcdGlmKCBtb2NrSGFuZGxlci5pc1RpbWVvdXQpIHtcclxuXHRcdFx0XHRcdFx0XHR0aGlzLnN0YXR1cyA9IC0xO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdG9uUmVhZHkuY2FsbCggdGhpcywgbW9ja0hhbmRsZXIuaXNUaW1lb3V0ID8gJ3RpbWVvdXQnIDogdW5kZWZpbmVkICk7XHJcblx0XHRcdFx0XHR9IGVsc2UgaWYgKCBtb2NrSGFuZGxlci5pc1RpbWVvdXQgKSB7XHJcblx0XHRcdFx0XHRcdC8vIEZpeCBmb3IgMS4zLjIgdGltZW91dCB0byBrZWVwIHN1Y2Nlc3MgZnJvbSBmaXJpbmcuXHJcblx0XHRcdFx0XHRcdHRoaXMuc3RhdHVzID0gLTE7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSkuYXBwbHkodGhhdCk7XHJcblx0XHRcdH07XHJcblx0XHR9KSh0aGlzKTtcclxuXHJcblx0XHRpZiAoIG1vY2tIYW5kbGVyLnByb3h5ICkge1xyXG5cdFx0XHQvLyBXZSdyZSBwcm94eWluZyB0aGlzIHJlcXVlc3QgYW5kIGxvYWRpbmcgaW4gYW4gZXh0ZXJuYWwgZmlsZSBpbnN0ZWFkXHJcblx0XHRcdF9hamF4KHtcclxuXHRcdFx0XHRnbG9iYWw6IGZhbHNlLFxyXG5cdFx0XHRcdHVybDogbW9ja0hhbmRsZXIucHJveHksXHJcblx0XHRcdFx0dHlwZTogbW9ja0hhbmRsZXIucHJveHlUeXBlLFxyXG5cdFx0XHRcdGRhdGE6IG1vY2tIYW5kbGVyLmRhdGEsXHJcblx0XHRcdFx0ZGF0YVR5cGU6IHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSA9PT0gXCJzY3JpcHRcIiA/IFwidGV4dC9wbGFpblwiIDogcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlLFxyXG5cdFx0XHRcdGNvbXBsZXRlOiBmdW5jdGlvbih4aHIpIHtcclxuXHRcdFx0XHRcdG1vY2tIYW5kbGVyLnJlc3BvbnNlWE1MID0geGhyLnJlc3BvbnNlWE1MO1xyXG5cdFx0XHRcdFx0bW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ID0geGhyLnJlc3BvbnNlVGV4dDtcclxuICAgICAgICAgICAgICAgICAgICAvLyBEb24ndCBvdmVycmlkZSB0aGUgaGFuZGxlciBzdGF0dXMvc3RhdHVzVGV4dCBpZiBpdCdzIHNwZWNpZmllZCBieSB0aGUgY29uZmlnXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzRGVmYXVsdFNldHRpbmcobW9ja0hhbmRsZXIsICdzdGF0dXMnKSkge1xyXG5cdFx0XHRcdFx0ICAgIG1vY2tIYW5kbGVyLnN0YXR1cyA9IHhoci5zdGF0dXM7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0RlZmF1bHRTZXR0aW5nKG1vY2tIYW5kbGVyLCAnc3RhdHVzVGV4dCcpKSB7XHJcblx0XHRcdFx0XHQgICAgbW9ja0hhbmRsZXIuc3RhdHVzVGV4dCA9IHhoci5zdGF0dXNUZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcblx0XHRcdFx0XHR0aGlzLnJlc3BvbnNlVGltZXIgPSBzZXRUaW1lb3V0KHByb2Nlc3MsIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGltZSB8fCAwKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gdHlwZSA9PSAnUE9TVCcgfHwgJ0dFVCcgfHwgJ0RFTEVURSdcclxuXHRcdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuYXN5bmMgPT09IGZhbHNlICkge1xyXG5cdFx0XHRcdC8vIFRPRE86IEJsb2NraW5nIGRlbGF5XHJcblx0XHRcdFx0cHJvY2VzcygpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMucmVzcG9uc2VUaW1lciA9IHNldFRpbWVvdXQocHJvY2VzcywgbW9ja0hhbmRsZXIucmVzcG9uc2VUaW1lIHx8IDUwKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gQ29uc3RydWN0IGEgbW9ja2VkIFhIUiBPYmplY3RcclxuXHRmdW5jdGlvbiB4aHIobW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncywgb3JpZ1NldHRpbmdzLCBvcmlnSGFuZGxlcikge1xyXG5cdFx0Ly8gRXh0ZW5kIHdpdGggb3VyIGRlZmF1bHQgbW9ja2pheCBzZXR0aW5nc1xyXG5cdFx0bW9ja0hhbmRsZXIgPSAkLmV4dGVuZCh0cnVlLCB7fSwgJC5tb2NramF4U2V0dGluZ3MsIG1vY2tIYW5kbGVyKTtcclxuXHJcblx0XHRpZiAodHlwZW9mIG1vY2tIYW5kbGVyLmhlYWRlcnMgPT09ICd1bmRlZmluZWQnKSB7XHJcblx0XHRcdG1vY2tIYW5kbGVyLmhlYWRlcnMgPSB7fTtcclxuXHRcdH1cclxuXHRcdGlmICggbW9ja0hhbmRsZXIuY29udGVudFR5cGUgKSB7XHJcblx0XHRcdG1vY2tIYW5kbGVyLmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddID0gbW9ja0hhbmRsZXIuY29udGVudFR5cGU7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0c3RhdHVzOiBtb2NrSGFuZGxlci5zdGF0dXMsXHJcblx0XHRcdHN0YXR1c1RleHQ6IG1vY2tIYW5kbGVyLnN0YXR1c1RleHQsXHJcblx0XHRcdHJlYWR5U3RhdGU6IDEsXHJcblx0XHRcdG9wZW46IGZ1bmN0aW9uKCkgeyB9LFxyXG5cdFx0XHRzZW5kOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRvcmlnSGFuZGxlci5maXJlZCA9IHRydWU7XHJcblx0XHRcdFx0X3hoclNlbmQuY2FsbCh0aGlzLCBtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRhYm9ydDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHRoaXMucmVzcG9uc2VUaW1lcik7XHJcblx0XHRcdH0sXHJcblx0XHRcdHNldFJlcXVlc3RIZWFkZXI6IGZ1bmN0aW9uKGhlYWRlciwgdmFsdWUpIHtcclxuXHRcdFx0XHRtb2NrSGFuZGxlci5oZWFkZXJzW2hlYWRlcl0gPSB2YWx1ZTtcclxuXHRcdFx0fSxcclxuXHRcdFx0Z2V0UmVzcG9uc2VIZWFkZXI6IGZ1bmN0aW9uKGhlYWRlcikge1xyXG5cdFx0XHRcdC8vICdMYXN0LW1vZGlmaWVkJywgJ0V0YWcnLCAnY29udGVudC10eXBlJyBhcmUgYWxsIGNoZWNrZWQgYnkgalF1ZXJ5XHJcblx0XHRcdFx0aWYgKCBtb2NrSGFuZGxlci5oZWFkZXJzICYmIG1vY2tIYW5kbGVyLmhlYWRlcnNbaGVhZGVyXSApIHtcclxuXHRcdFx0XHRcdC8vIFJldHVybiBhcmJpdHJhcnkgaGVhZGVyc1xyXG5cdFx0XHRcdFx0cmV0dXJuIG1vY2tIYW5kbGVyLmhlYWRlcnNbaGVhZGVyXTtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKCBoZWFkZXIudG9Mb3dlckNhc2UoKSA9PSAnbGFzdC1tb2RpZmllZCcgKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gbW9ja0hhbmRsZXIubGFzdE1vZGlmaWVkIHx8IChuZXcgRGF0ZSgpKS50b1N0cmluZygpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAoIGhlYWRlci50b0xvd2VyQ2FzZSgpID09ICdldGFnJyApIHtcclxuXHRcdFx0XHRcdHJldHVybiBtb2NrSGFuZGxlci5ldGFnIHx8ICcnO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAoIGhlYWRlci50b0xvd2VyQ2FzZSgpID09ICdjb250ZW50LXR5cGUnICkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIG1vY2tIYW5kbGVyLmNvbnRlbnRUeXBlIHx8ICd0ZXh0L3BsYWluJztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sXHJcblx0XHRcdGdldEFsbFJlc3BvbnNlSGVhZGVyczogZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0dmFyIGhlYWRlcnMgPSAnJztcclxuXHRcdFx0XHQkLmVhY2gobW9ja0hhbmRsZXIuaGVhZGVycywgZnVuY3Rpb24oaywgdikge1xyXG5cdFx0XHRcdFx0aGVhZGVycyArPSBrICsgJzogJyArIHYgKyBcIlxcblwiO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdHJldHVybiBoZWFkZXJzO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0Ly8gUHJvY2VzcyBhIEpTT05QIG1vY2sgcmVxdWVzdC5cclxuXHRmdW5jdGlvbiBwcm9jZXNzSnNvbnBNb2NrKCByZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MgKSB7XHJcblx0XHQvLyBIYW5kbGUgSlNPTlAgUGFyYW1ldGVyIENhbGxiYWNrcywgd2UgbmVlZCB0byByZXBsaWNhdGUgc29tZSBvZiB0aGUgalF1ZXJ5IGNvcmUgaGVyZVxyXG5cdFx0Ly8gYmVjYXVzZSB0aGVyZSBpc24ndCBhbiBlYXN5IGhvb2sgZm9yIHRoZSBjcm9zcyBkb21haW4gc2NyaXB0IHRhZyBvZiBqc29ucFxyXG5cclxuXHRcdHByb2Nlc3NKc29ucFVybCggcmVxdWVzdFNldHRpbmdzICk7XHJcblxyXG5cdFx0cmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlID0gXCJqc29uXCI7XHJcblx0XHRpZihyZXF1ZXN0U2V0dGluZ3MuZGF0YSAmJiBDQUxMQkFDS19SRUdFWC50ZXN0KHJlcXVlc3RTZXR0aW5ncy5kYXRhKSB8fCBDQUxMQkFDS19SRUdFWC50ZXN0KHJlcXVlc3RTZXR0aW5ncy51cmwpKSB7XHJcblx0XHRcdGNyZWF0ZUpzb25wQ2FsbGJhY2socmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzKTtcclxuXHJcblx0XHRcdC8vIFdlIG5lZWQgdG8gbWFrZSBzdXJlXHJcblx0XHRcdC8vIHRoYXQgYSBKU09OUCBzdHlsZSByZXNwb25zZSBpcyBleGVjdXRlZCBwcm9wZXJseVxyXG5cclxuXHRcdFx0dmFyIHJ1cmwgPSAvXihcXHcrOik/XFwvXFwvKFteXFwvPyNdKykvLFxyXG5cdFx0XHRcdHBhcnRzID0gcnVybC5leGVjKCByZXF1ZXN0U2V0dGluZ3MudXJsICksXHJcblx0XHRcdFx0cmVtb3RlID0gcGFydHMgJiYgKHBhcnRzWzFdICYmIHBhcnRzWzFdICE9PSBsb2NhdGlvbi5wcm90b2NvbCB8fCBwYXJ0c1syXSAhPT0gbG9jYXRpb24uaG9zdCk7XHJcblxyXG5cdFx0XHRyZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgPSBcInNjcmlwdFwiO1xyXG5cdFx0XHRpZihyZXF1ZXN0U2V0dGluZ3MudHlwZS50b1VwcGVyQ2FzZSgpID09PSBcIkdFVFwiICYmIHJlbW90ZSApIHtcclxuXHRcdFx0XHR2YXIgbmV3TW9ja1JldHVybiA9IHByb2Nlc3NKc29ucFJlcXVlc3QoIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyApO1xyXG5cclxuXHRcdFx0XHQvLyBDaGVjayBpZiB3ZSBhcmUgc3VwcG9zZWQgdG8gcmV0dXJuIGEgRGVmZXJyZWQgYmFjayB0byB0aGUgbW9jayBjYWxsLCBvciBqdXN0XHJcblx0XHRcdFx0Ly8gc2lnbmFsIHN1Y2Nlc3NcclxuXHRcdFx0XHRpZihuZXdNb2NrUmV0dXJuKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gbmV3TW9ja1JldHVybjtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gbnVsbDtcclxuXHR9XHJcblxyXG5cdC8vIEFwcGVuZCB0aGUgcmVxdWlyZWQgY2FsbGJhY2sgcGFyYW1ldGVyIHRvIHRoZSBlbmQgb2YgdGhlIHJlcXVlc3QgVVJMLCBmb3IgYSBKU09OUCByZXF1ZXN0XHJcblx0ZnVuY3Rpb24gcHJvY2Vzc0pzb25wVXJsKCByZXF1ZXN0U2V0dGluZ3MgKSB7XHJcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy50eXBlLnRvVXBwZXJDYXNlKCkgPT09IFwiR0VUXCIgKSB7XHJcblx0XHRcdGlmICggIUNBTExCQUNLX1JFR0VYLnRlc3QoIHJlcXVlc3RTZXR0aW5ncy51cmwgKSApIHtcclxuXHRcdFx0XHRyZXF1ZXN0U2V0dGluZ3MudXJsICs9ICgvXFw/Ly50ZXN0KCByZXF1ZXN0U2V0dGluZ3MudXJsICkgPyBcIiZcIiA6IFwiP1wiKSArXHJcblx0XHRcdFx0XHQocmVxdWVzdFNldHRpbmdzLmpzb25wIHx8IFwiY2FsbGJhY2tcIikgKyBcIj0/XCI7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSBpZiAoICFyZXF1ZXN0U2V0dGluZ3MuZGF0YSB8fCAhQ0FMTEJBQ0tfUkVHRVgudGVzdChyZXF1ZXN0U2V0dGluZ3MuZGF0YSkgKSB7XHJcblx0XHRcdHJlcXVlc3RTZXR0aW5ncy5kYXRhID0gKHJlcXVlc3RTZXR0aW5ncy5kYXRhID8gcmVxdWVzdFNldHRpbmdzLmRhdGEgKyBcIiZcIiA6IFwiXCIpICsgKHJlcXVlc3RTZXR0aW5ncy5qc29ucCB8fCBcImNhbGxiYWNrXCIpICsgXCI9P1wiO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gUHJvY2VzcyBhIEpTT05QIHJlcXVlc3QgYnkgZXZhbHVhdGluZyB0aGUgbW9ja2VkIHJlc3BvbnNlIHRleHRcclxuXHRmdW5jdGlvbiBwcm9jZXNzSnNvbnBSZXF1ZXN0KCByZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MgKSB7XHJcblx0XHQvLyBTeW50aGVzaXplIHRoZSBtb2NrIHJlcXVlc3QgZm9yIGFkZGluZyBhIHNjcmlwdCB0YWdcclxuXHRcdHZhciBjYWxsYmFja0NvbnRleHQgPSBvcmlnU2V0dGluZ3MgJiYgb3JpZ1NldHRpbmdzLmNvbnRleHQgfHwgcmVxdWVzdFNldHRpbmdzLFxyXG5cdFx0XHRuZXdNb2NrID0gbnVsbDtcclxuXHJcblxyXG5cdFx0Ly8gSWYgdGhlIHJlc3BvbnNlIGhhbmRsZXIgb24gdGhlIG1vb2NrIGlzIGEgZnVuY3Rpb24sIGNhbGwgaXRcclxuXHRcdGlmICggbW9ja0hhbmRsZXIucmVzcG9uc2UgJiYgJC5pc0Z1bmN0aW9uKG1vY2tIYW5kbGVyLnJlc3BvbnNlKSApIHtcclxuXHRcdFx0bW9ja0hhbmRsZXIucmVzcG9uc2Uob3JpZ1NldHRpbmdzKTtcclxuXHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHQvLyBFdmFsdWF0ZSB0aGUgcmVzcG9uc2VUZXh0IGphdmFzY3JpcHQgaW4gYSBnbG9iYWwgY29udGV4dFxyXG5cdFx0XHRpZiggdHlwZW9mIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCA9PT0gJ29iamVjdCcgKSB7XHJcblx0XHRcdFx0JC5nbG9iYWxFdmFsKCAnKCcgKyBKU09OLnN0cmluZ2lmeSggbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ICkgKyAnKScpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCQuZ2xvYmFsRXZhbCggJygnICsgbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ICsgJyknKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFN1Y2Nlc3NmdWwgcmVzcG9uc2VcclxuXHRcdGpzb25wU3VjY2VzcyggcmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyICk7XHJcblx0XHRqc29ucENvbXBsZXRlKCByZXF1ZXN0U2V0dGluZ3MsIGNhbGxiYWNrQ29udGV4dCwgbW9ja0hhbmRsZXIgKTtcclxuXHJcblx0XHQvLyBJZiB3ZSBhcmUgcnVubmluZyB1bmRlciBqUXVlcnkgMS41KywgcmV0dXJuIGEgZGVmZXJyZWQgb2JqZWN0XHJcblx0XHRpZigkLkRlZmVycmVkKXtcclxuXHRcdFx0bmV3TW9jayA9IG5ldyAkLkRlZmVycmVkKCk7XHJcblx0XHRcdGlmKHR5cGVvZiBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgPT0gXCJvYmplY3RcIil7XHJcblx0XHRcdFx0bmV3TW9jay5yZXNvbHZlV2l0aCggY2FsbGJhY2tDb250ZXh0LCBbbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0XSApO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0bmV3TW9jay5yZXNvbHZlV2l0aCggY2FsbGJhY2tDb250ZXh0LCBbJC5wYXJzZUpTT04oIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCApXSApO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gbmV3TW9jaztcclxuXHR9XHJcblxyXG5cclxuXHQvLyBDcmVhdGUgdGhlIHJlcXVpcmVkIEpTT05QIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciB0aGUgcmVxdWVzdFxyXG5cdGZ1bmN0aW9uIGNyZWF0ZUpzb25wQ2FsbGJhY2soIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyApIHtcclxuXHRcdHZhciBjYWxsYmFja0NvbnRleHQgPSBvcmlnU2V0dGluZ3MgJiYgb3JpZ1NldHRpbmdzLmNvbnRleHQgfHwgcmVxdWVzdFNldHRpbmdzO1xyXG5cdFx0dmFyIGpzb25wID0gcmVxdWVzdFNldHRpbmdzLmpzb25wQ2FsbGJhY2sgfHwgKFwianNvbnBcIiArIGpzYysrKTtcclxuXHJcblx0XHQvLyBSZXBsYWNlIHRoZSA9PyBzZXF1ZW5jZSBib3RoIGluIHRoZSBxdWVyeSBzdHJpbmcgYW5kIHRoZSBkYXRhXHJcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5kYXRhICkge1xyXG5cdFx0XHRyZXF1ZXN0U2V0dGluZ3MuZGF0YSA9IChyZXF1ZXN0U2V0dGluZ3MuZGF0YSArIFwiXCIpLnJlcGxhY2UoQ0FMTEJBQ0tfUkVHRVgsIFwiPVwiICsganNvbnAgKyBcIiQxXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJlcXVlc3RTZXR0aW5ncy51cmwgPSByZXF1ZXN0U2V0dGluZ3MudXJsLnJlcGxhY2UoQ0FMTEJBQ0tfUkVHRVgsIFwiPVwiICsganNvbnAgKyBcIiQxXCIpO1xyXG5cclxuXHJcblx0XHQvLyBIYW5kbGUgSlNPTlAtc3R5bGUgbG9hZGluZ1xyXG5cdFx0d2luZG93WyBqc29ucCBdID0gd2luZG93WyBqc29ucCBdIHx8IGZ1bmN0aW9uKCB0bXAgKSB7XHJcblx0XHRcdGRhdGEgPSB0bXA7XHJcblx0XHRcdGpzb25wU3VjY2VzcyggcmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyICk7XHJcblx0XHRcdGpzb25wQ29tcGxldGUoIHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0LCBtb2NrSGFuZGxlciApO1xyXG5cdFx0XHQvLyBHYXJiYWdlIGNvbGxlY3RcclxuXHRcdFx0d2luZG93WyBqc29ucCBdID0gdW5kZWZpbmVkO1xyXG5cclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRkZWxldGUgd2luZG93WyBqc29ucCBdO1xyXG5cdFx0XHR9IGNhdGNoKGUpIHt9XHJcblxyXG5cdFx0XHRpZiAoIGhlYWQgKSB7XHJcblx0XHRcdFx0aGVhZC5yZW1vdmVDaGlsZCggc2NyaXB0ICk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHQvLyBUaGUgSlNPTlAgcmVxdWVzdCB3YXMgc3VjY2Vzc2Z1bFxyXG5cdGZ1bmN0aW9uIGpzb25wU3VjY2VzcyhyZXF1ZXN0U2V0dGluZ3MsIGNhbGxiYWNrQ29udGV4dCwgbW9ja0hhbmRsZXIpIHtcclxuXHRcdC8vIElmIGEgbG9jYWwgY2FsbGJhY2sgd2FzIHNwZWNpZmllZCwgZmlyZSBpdCBhbmQgcGFzcyBpdCB0aGUgZGF0YVxyXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3Muc3VjY2VzcyApIHtcclxuXHRcdFx0cmVxdWVzdFNldHRpbmdzLnN1Y2Nlc3MuY2FsbCggY2FsbGJhY2tDb250ZXh0LCBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgfHwgXCJcIiwgc3RhdHVzLCB7fSApO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEZpcmUgdGhlIGdsb2JhbCBjYWxsYmFja1xyXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZ2xvYmFsICkge1xyXG5cdFx0XHR0cmlnZ2VyKHJlcXVlc3RTZXR0aW5ncywgXCJhamF4U3VjY2Vzc1wiLCBbe30sIHJlcXVlc3RTZXR0aW5nc10gKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIFRoZSBKU09OUCByZXF1ZXN0IHdhcyBjb21wbGV0ZWRcclxuXHRmdW5jdGlvbiBqc29ucENvbXBsZXRlKHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0KSB7XHJcblx0XHQvLyBQcm9jZXNzIHJlc3VsdFxyXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuY29tcGxldGUgKSB7XHJcblx0XHRcdHJlcXVlc3RTZXR0aW5ncy5jb21wbGV0ZS5jYWxsKCBjYWxsYmFja0NvbnRleHQsIHt9ICwgc3RhdHVzICk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gVGhlIHJlcXVlc3Qgd2FzIGNvbXBsZXRlZFxyXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZ2xvYmFsICkge1xyXG5cdFx0XHR0cmlnZ2VyKCBcImFqYXhDb21wbGV0ZVwiLCBbe30sIHJlcXVlc3RTZXR0aW5nc10gKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBIYW5kbGUgdGhlIGdsb2JhbCBBSkFYIGNvdW50ZXJcclxuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmdsb2JhbCAmJiAhIC0tJC5hY3RpdmUgKSB7XHJcblx0XHRcdCQuZXZlbnQudHJpZ2dlciggXCJhamF4U3RvcFwiICk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHJcblx0Ly8gVGhlIGNvcmUgJC5hamF4IHJlcGxhY2VtZW50LlxyXG5cdGZ1bmN0aW9uIGhhbmRsZUFqYXgoIHVybCwgb3JpZ1NldHRpbmdzICkge1xyXG5cdFx0dmFyIG1vY2tSZXF1ZXN0LCByZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyO1xyXG5cclxuXHRcdC8vIElmIHVybCBpcyBhbiBvYmplY3QsIHNpbXVsYXRlIHByZS0xLjUgc2lnbmF0dXJlXHJcblx0XHRpZiAoIHR5cGVvZiB1cmwgPT09IFwib2JqZWN0XCIgKSB7XHJcblx0XHRcdG9yaWdTZXR0aW5ncyA9IHVybDtcclxuXHRcdFx0dXJsID0gdW5kZWZpbmVkO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gd29yayBhcm91bmQgdG8gc3VwcG9ydCAxLjUgc2lnbmF0dXJlXHJcblx0XHRcdG9yaWdTZXR0aW5ncyA9IG9yaWdTZXR0aW5ncyB8fCB7fTtcclxuXHRcdFx0b3JpZ1NldHRpbmdzLnVybCA9IHVybDtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBFeHRlbmQgdGhlIG9yaWdpbmFsIHNldHRpbmdzIGZvciB0aGUgcmVxdWVzdFxyXG5cdFx0cmVxdWVzdFNldHRpbmdzID0gJC5leHRlbmQodHJ1ZSwge30sICQuYWpheFNldHRpbmdzLCBvcmlnU2V0dGluZ3MpO1xyXG5cclxuXHRcdC8vIEl0ZXJhdGUgb3ZlciBvdXIgbW9jayBoYW5kbGVycyAoaW4gcmVnaXN0cmF0aW9uIG9yZGVyKSB1bnRpbCB3ZSBmaW5kXHJcblx0XHQvLyBvbmUgdGhhdCBpcyB3aWxsaW5nIHRvIGludGVyY2VwdCB0aGUgcmVxdWVzdFxyXG5cdFx0Zm9yKHZhciBrID0gMDsgayA8IG1vY2tIYW5kbGVycy5sZW5ndGg7IGsrKykge1xyXG5cdFx0XHRpZiAoICFtb2NrSGFuZGxlcnNba10gKSB7XHJcblx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdG1vY2tIYW5kbGVyID0gZ2V0TW9ja0ZvclJlcXVlc3QoIG1vY2tIYW5kbGVyc1trXSwgcmVxdWVzdFNldHRpbmdzICk7XHJcblx0XHRcdGlmKCFtb2NrSGFuZGxlcikge1xyXG5cdFx0XHRcdC8vIE5vIHZhbGlkIG1vY2sgZm91bmQgZm9yIHRoaXMgcmVxdWVzdFxyXG5cdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRtb2NrZWRBamF4Q2FsbHMucHVzaChyZXF1ZXN0U2V0dGluZ3MpO1xyXG5cclxuXHRcdFx0Ly8gSWYgbG9nZ2luZyBpcyBlbmFibGVkLCBsb2cgdGhlIG1vY2sgdG8gdGhlIGNvbnNvbGVcclxuXHRcdFx0JC5tb2NramF4U2V0dGluZ3MubG9nKCBtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzICk7XHJcblxyXG5cclxuXHRcdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgJiYgcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlLnRvVXBwZXJDYXNlKCkgPT09ICdKU09OUCcgKSB7XHJcblx0XHRcdFx0aWYgKChtb2NrUmVxdWVzdCA9IHByb2Nlc3NKc29ucE1vY2soIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyApKSkge1xyXG5cdFx0XHRcdFx0Ly8gVGhpcyBtb2NrIHdpbGwgaGFuZGxlIHRoZSBKU09OUCByZXF1ZXN0XHJcblx0XHRcdFx0XHRyZXR1cm4gbW9ja1JlcXVlc3Q7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cclxuXHRcdFx0Ly8gUmVtb3ZlZCB0byBmaXggIzU0IC0ga2VlcCB0aGUgbW9ja2luZyBkYXRhIG9iamVjdCBpbnRhY3RcclxuXHRcdFx0Ly9tb2NrSGFuZGxlci5kYXRhID0gcmVxdWVzdFNldHRpbmdzLmRhdGE7XHJcblxyXG5cdFx0XHRtb2NrSGFuZGxlci5jYWNoZSA9IHJlcXVlc3RTZXR0aW5ncy5jYWNoZTtcclxuXHRcdFx0bW9ja0hhbmRsZXIudGltZW91dCA9IHJlcXVlc3RTZXR0aW5ncy50aW1lb3V0O1xyXG5cdFx0XHRtb2NrSGFuZGxlci5nbG9iYWwgPSByZXF1ZXN0U2V0dGluZ3MuZ2xvYmFsO1xyXG5cclxuXHRcdFx0Y29weVVybFBhcmFtZXRlcnMobW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyk7XHJcblxyXG5cdFx0XHQoZnVuY3Rpb24obW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncywgb3JpZ1NldHRpbmdzLCBvcmlnSGFuZGxlcikge1xyXG5cdFx0XHRcdG1vY2tSZXF1ZXN0ID0gX2FqYXguY2FsbCgkLCAkLmV4dGVuZCh0cnVlLCB7fSwgb3JpZ1NldHRpbmdzLCB7XHJcblx0XHRcdFx0XHQvLyBNb2NrIHRoZSBYSFIgb2JqZWN0XHJcblx0XHRcdFx0XHR4aHI6IGZ1bmN0aW9uKCkgeyByZXR1cm4geGhyKCBtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MsIG9yaWdIYW5kbGVyICk7IH1cclxuXHRcdFx0XHR9KSk7XHJcblx0XHRcdH0pKG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncywgbW9ja0hhbmRsZXJzW2tdKTtcclxuXHJcblx0XHRcdHJldHVybiBtb2NrUmVxdWVzdDtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBXZSBkb24ndCBoYXZlIGEgbW9jayByZXF1ZXN0XHJcblx0XHRpZigkLm1vY2tqYXhTZXR0aW5ncy50aHJvd1VubW9ja2VkID09PSB0cnVlKSB7XHJcblx0XHRcdHRocm93KCdBSkFYIG5vdCBtb2NrZWQ6ICcgKyBvcmlnU2V0dGluZ3MudXJsKTtcclxuXHRcdH1cclxuXHRcdGVsc2UgeyAvLyB0cmlnZ2VyIGEgbm9ybWFsIHJlcXVlc3RcclxuXHRcdFx0cmV0dXJuIF9hamF4LmFwcGx5KCQsIFtvcmlnU2V0dGluZ3NdKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCogQ29waWVzIFVSTCBwYXJhbWV0ZXIgdmFsdWVzIGlmIHRoZXkgd2VyZSBjYXB0dXJlZCBieSBhIHJlZ3VsYXIgZXhwcmVzc2lvblxyXG5cdCogQHBhcmFtIHtPYmplY3R9IG1vY2tIYW5kbGVyXHJcblx0KiBAcGFyYW0ge09iamVjdH0gb3JpZ1NldHRpbmdzXHJcblx0Ki9cclxuXHRmdW5jdGlvbiBjb3B5VXJsUGFyYW1ldGVycyhtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzKSB7XHJcblx0XHQvL3BhcmFtZXRlcnMgYXJlbid0IGNhcHR1cmVkIGlmIHRoZSBVUkwgaXNuJ3QgYSBSZWdFeHBcclxuXHRcdGlmICghKG1vY2tIYW5kbGVyLnVybCBpbnN0YW5jZW9mIFJlZ0V4cCkpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0Ly9pZiBubyBVUkwgcGFyYW1zIHdlcmUgZGVmaW5lZCBvbiB0aGUgaGFuZGxlciwgZG9uJ3QgYXR0ZW1wdCBhIGNhcHR1cmVcclxuXHRcdGlmICghbW9ja0hhbmRsZXIuaGFzT3duUHJvcGVydHkoJ3VybFBhcmFtcycpKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdHZhciBjYXB0dXJlcyA9IG1vY2tIYW5kbGVyLnVybC5leGVjKG9yaWdTZXR0aW5ncy51cmwpO1xyXG5cdFx0Ly90aGUgd2hvbGUgUmVnRXhwIG1hdGNoIGlzIGFsd2F5cyB0aGUgZmlyc3QgdmFsdWUgaW4gdGhlIGNhcHR1cmUgcmVzdWx0c1xyXG5cdFx0aWYgKGNhcHR1cmVzLmxlbmd0aCA9PT0gMSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRjYXB0dXJlcy5zaGlmdCgpO1xyXG5cdFx0Ly91c2UgaGFuZGxlciBwYXJhbXMgYXMga2V5cyBhbmQgY2FwdHVyZSByZXN1dHMgYXMgdmFsdWVzXHJcblx0XHR2YXIgaSA9IDAsXHJcblx0XHRjYXB0dXJlc0xlbmd0aCA9IGNhcHR1cmVzLmxlbmd0aCxcclxuXHRcdHBhcmFtc0xlbmd0aCA9IG1vY2tIYW5kbGVyLnVybFBhcmFtcy5sZW5ndGgsXHJcblx0XHQvL2luIGNhc2UgdGhlIG51bWJlciBvZiBwYXJhbXMgc3BlY2lmaWVkIGlzIGxlc3MgdGhhbiBhY3R1YWwgY2FwdHVyZXNcclxuXHRcdG1heEl0ZXJhdGlvbnMgPSBNYXRoLm1pbihjYXB0dXJlc0xlbmd0aCwgcGFyYW1zTGVuZ3RoKSxcclxuXHRcdHBhcmFtVmFsdWVzID0ge307XHJcblx0XHRmb3IgKGk7IGkgPCBtYXhJdGVyYXRpb25zOyBpKyspIHtcclxuXHRcdFx0dmFyIGtleSA9IG1vY2tIYW5kbGVyLnVybFBhcmFtc1tpXTtcclxuXHRcdFx0cGFyYW1WYWx1ZXNba2V5XSA9IGNhcHR1cmVzW2ldO1xyXG5cdFx0fVxyXG5cdFx0b3JpZ1NldHRpbmdzLnVybFBhcmFtcyA9IHBhcmFtVmFsdWVzO1xyXG5cdH1cclxuXHJcblxyXG5cdC8vIFB1YmxpY1xyXG5cclxuXHQkLmV4dGVuZCh7XHJcblx0XHRhamF4OiBoYW5kbGVBamF4XHJcblx0fSk7XHJcblxyXG5cdCQubW9ja2pheFNldHRpbmdzID0ge1xyXG5cdFx0Ly91cmw6ICAgICAgICBudWxsLFxyXG5cdFx0Ly90eXBlOiAgICAgICAnR0VUJyxcclxuXHRcdGxvZzogICAgICAgICAgZnVuY3Rpb24oIG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MgKSB7XHJcblx0XHRcdGlmICggbW9ja0hhbmRsZXIubG9nZ2luZyA9PT0gZmFsc2UgfHxcclxuXHRcdFx0XHQgKCB0eXBlb2YgbW9ja0hhbmRsZXIubG9nZ2luZyA9PT0gJ3VuZGVmaW5lZCcgJiYgJC5tb2NramF4U2V0dGluZ3MubG9nZ2luZyA9PT0gZmFsc2UgKSApIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKCB3aW5kb3cuY29uc29sZSAmJiBjb25zb2xlLmxvZyApIHtcclxuXHRcdFx0XHR2YXIgbWVzc2FnZSA9ICdNT0NLICcgKyByZXF1ZXN0U2V0dGluZ3MudHlwZS50b1VwcGVyQ2FzZSgpICsgJzogJyArIHJlcXVlc3RTZXR0aW5ncy51cmw7XHJcblx0XHRcdFx0dmFyIHJlcXVlc3QgPSAkLmV4dGVuZCh7fSwgcmVxdWVzdFNldHRpbmdzKTtcclxuXHJcblx0XHRcdFx0aWYgKHR5cGVvZiBjb25zb2xlLmxvZyA9PT0gJ2Z1bmN0aW9uJykge1xyXG5cdFx0XHRcdFx0Y29uc29sZS5sb2cobWVzc2FnZSwgcmVxdWVzdCk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHRyeSB7XHJcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCBtZXNzYWdlICsgJyAnICsgSlNPTi5zdHJpbmdpZnkocmVxdWVzdCkgKTtcclxuXHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2cobWVzc2FnZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cdFx0bG9nZ2luZzogICAgICAgdHJ1ZSxcclxuXHRcdHN0YXR1czogICAgICAgIDIwMCxcclxuXHRcdHN0YXR1c1RleHQ6ICAgIFwiT0tcIixcclxuXHRcdHJlc3BvbnNlVGltZTogIDUwMCxcclxuXHRcdGlzVGltZW91dDogICAgIGZhbHNlLFxyXG5cdFx0dGhyb3dVbm1vY2tlZDogZmFsc2UsXHJcblx0XHRjb250ZW50VHlwZTogICAndGV4dC9wbGFpbicsXHJcblx0XHRyZXNwb25zZTogICAgICAnJyxcclxuXHRcdHJlc3BvbnNlVGV4dDogICcnLFxyXG5cdFx0cmVzcG9uc2VYTUw6ICAgJycsXHJcblx0XHRwcm94eTogICAgICAgICAnJyxcclxuXHRcdHByb3h5VHlwZTogICAgICdHRVQnLFxyXG5cclxuXHRcdGxhc3RNb2RpZmllZDogIG51bGwsXHJcblx0XHRldGFnOiAgICAgICAgICAnJyxcclxuXHRcdGhlYWRlcnM6IHtcclxuXHRcdFx0ZXRhZzogJ0lKRkBII0A5MjN1ZjgwMjNoRk9ASSNIIycsXHJcblx0XHRcdCdjb250ZW50LXR5cGUnIDogJ3RleHQvcGxhaW4nXHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0JC5tb2NramF4ID0gZnVuY3Rpb24oc2V0dGluZ3MpIHtcclxuXHRcdHZhciBpID0gbW9ja0hhbmRsZXJzLmxlbmd0aDtcclxuXHRcdG1vY2tIYW5kbGVyc1tpXSA9IHNldHRpbmdzO1xyXG5cdFx0cmV0dXJuIGk7XHJcblx0fTtcclxuXHQkLm1vY2tqYXhDbGVhciA9IGZ1bmN0aW9uKGkpIHtcclxuXHRcdGlmICggYXJndW1lbnRzLmxlbmd0aCA9PSAxICkge1xyXG5cdFx0XHRtb2NrSGFuZGxlcnNbaV0gPSBudWxsO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0bW9ja0hhbmRsZXJzID0gW107XHJcblx0XHR9XHJcblx0XHRtb2NrZWRBamF4Q2FsbHMgPSBbXTtcclxuXHR9O1xyXG5cdCQubW9ja2pheC5oYW5kbGVyID0gZnVuY3Rpb24oaSkge1xyXG5cdFx0aWYgKCBhcmd1bWVudHMubGVuZ3RoID09IDEgKSB7XHJcblx0XHRcdHJldHVybiBtb2NrSGFuZGxlcnNbaV07XHJcblx0XHR9XHJcblx0fTtcclxuXHQkLm1vY2tqYXgubW9ja2VkQWpheENhbGxzID0gZnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4gbW9ja2VkQWpheENhbGxzO1xyXG5cdH07XHJcbn0pKGpRdWVyeSk7IiwiLyoqXHJcbiogIEFqYXggQXV0b2NvbXBsZXRlIGZvciBqUXVlcnksIHZlcnNpb24gJXZlcnNpb24lXHJcbiogIChjKSAyMDE1IFRvbWFzIEtpcmRhXHJcbipcclxuKiAgQWpheCBBdXRvY29tcGxldGUgZm9yIGpRdWVyeSBpcyBmcmVlbHkgZGlzdHJpYnV0YWJsZSB1bmRlciB0aGUgdGVybXMgb2YgYW4gTUlULXN0eWxlIGxpY2Vuc2UuXHJcbiogIEZvciBkZXRhaWxzLCBzZWUgdGhlIHdlYiBzaXRlOiBodHRwczovL2dpdGh1Yi5jb20vZGV2YnJpZGdlL2pRdWVyeS1BdXRvY29tcGxldGVcclxuKi9cclxuXHJcbi8qanNsaW50ICBicm93c2VyOiB0cnVlLCB3aGl0ZTogdHJ1ZSwgcGx1c3BsdXM6IHRydWUsIHZhcnM6IHRydWUgKi9cclxuLypnbG9iYWwgZGVmaW5lLCB3aW5kb3csIGRvY3VtZW50LCBqUXVlcnksIGV4cG9ydHMsIHJlcXVpcmUgKi9cclxuXHJcbi8vIEV4cG9zZSBwbHVnaW4gYXMgYW4gQU1EIG1vZHVsZSBpZiBBTUQgbG9hZGVyIGlzIHByZXNlbnQ6XHJcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG4gICAgICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cclxuICAgICAgICBkZWZpbmUoWydqcXVlcnknXSwgZmFjdG9yeSk7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgcmVxdWlyZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIC8vIEJyb3dzZXJpZnlcclxuICAgICAgICBmYWN0b3J5KHJlcXVpcmUoJ2pxdWVyeScpKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gQnJvd3NlciBnbG9iYWxzXHJcbiAgICAgICAgZmFjdG9yeShqUXVlcnkpO1xyXG4gICAgfVxyXG59KGZ1bmN0aW9uICgkKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyXHJcbiAgICAgICAgdXRpbHMgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgZXNjYXBlUmVnRXhDaGFyczogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoL1tcXC1cXFtcXF1cXC9cXHtcXH1cXChcXClcXCpcXCtcXD9cXC5cXFxcXFxeXFwkXFx8XS9nLCBcIlxcXFwkJlwiKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBjcmVhdGVOb2RlOiBmdW5jdGlvbiAoY29udGFpbmVyQ2xhc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGl2LmNsYXNzTmFtZSA9IGNvbnRhaW5lckNsYXNzO1xyXG4gICAgICAgICAgICAgICAgICAgIGRpdi5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgZGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRpdjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KCkpLFxyXG5cclxuICAgICAgICBrZXlzID0ge1xyXG4gICAgICAgICAgICBFU0M6IDI3LFxyXG4gICAgICAgICAgICBUQUI6IDksXHJcbiAgICAgICAgICAgIFJFVFVSTjogMTMsXHJcbiAgICAgICAgICAgIExFRlQ6IDM3LFxyXG4gICAgICAgICAgICBVUDogMzgsXHJcbiAgICAgICAgICAgIFJJR0hUOiAzOSxcclxuICAgICAgICAgICAgRE9XTjogNDBcclxuICAgICAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIEF1dG9jb21wbGV0ZShlbCwgb3B0aW9ucykge1xyXG4gICAgICAgIHZhciBub29wID0gZnVuY3Rpb24gKCkgeyB9LFxyXG4gICAgICAgICAgICB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgZGVmYXVsdHMgPSB7XHJcbiAgICAgICAgICAgICAgICBhamF4U2V0dGluZ3M6IHt9LFxyXG4gICAgICAgICAgICAgICAgYXV0b1NlbGVjdEZpcnN0OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGFwcGVuZFRvOiBkb2N1bWVudC5ib2R5LFxyXG4gICAgICAgICAgICAgICAgc2VydmljZVVybDogbnVsbCxcclxuICAgICAgICAgICAgICAgIGxvb2t1cDogbnVsbCxcclxuICAgICAgICAgICAgICAgIG9uU2VsZWN0OiBudWxsLFxyXG4gICAgICAgICAgICAgICAgd2lkdGg6ICdhdXRvJyxcclxuICAgICAgICAgICAgICAgIG1pbkNoYXJzOiAxLFxyXG4gICAgICAgICAgICAgICAgbWF4SGVpZ2h0OiAzMDAsXHJcbiAgICAgICAgICAgICAgICBkZWZlclJlcXVlc3RCeTogMCxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge30sXHJcbiAgICAgICAgICAgICAgICBmb3JtYXRSZXN1bHQ6IEF1dG9jb21wbGV0ZS5mb3JtYXRSZXN1bHQsXHJcbiAgICAgICAgICAgICAgICBkZWxpbWl0ZXI6IG51bGwsXHJcbiAgICAgICAgICAgICAgICB6SW5kZXg6IDk5OTksXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnR0VUJyxcclxuICAgICAgICAgICAgICAgIG5vQ2FjaGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgb25TZWFyY2hTdGFydDogbm9vcCxcclxuICAgICAgICAgICAgICAgIG9uU2VhcmNoQ29tcGxldGU6IG5vb3AsXHJcbiAgICAgICAgICAgICAgICBvblNlYXJjaEVycm9yOiBub29wLFxyXG4gICAgICAgICAgICAgICAgcHJlc2VydmVJbnB1dDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBjb250YWluZXJDbGFzczogJ2F1dG9jb21wbGV0ZS1zdWdnZXN0aW9ucycsXHJcbiAgICAgICAgICAgICAgICB0YWJEaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ3RleHQnLFxyXG4gICAgICAgICAgICAgICAgY3VycmVudFJlcXVlc3Q6IG51bGwsXHJcbiAgICAgICAgICAgICAgICB0cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgcHJldmVudEJhZFF1ZXJpZXM6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBsb29rdXBGaWx0ZXI6IGZ1bmN0aW9uIChzdWdnZXN0aW9uLCBvcmlnaW5hbFF1ZXJ5LCBxdWVyeUxvd2VyQ2FzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdWdnZXN0aW9uLnZhbHVlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxdWVyeUxvd2VyQ2FzZSkgIT09IC0xO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHBhcmFtTmFtZTogJ3F1ZXJ5JyxcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybVJlc3VsdDogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiByZXNwb25zZSA9PT0gJ3N0cmluZycgPyAkLnBhcnNlSlNPTihyZXNwb25zZSkgOiByZXNwb25zZTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBzaG93Tm9TdWdnZXN0aW9uTm90aWNlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIG5vU3VnZ2VzdGlvbk5vdGljZTogJ05vIHJlc3VsdHMnLFxyXG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb246ICdib3R0b20nLFxyXG4gICAgICAgICAgICAgICAgZm9yY2VGaXhQb3NpdGlvbjogZmFsc2VcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gU2hhcmVkIHZhcmlhYmxlczpcclxuICAgICAgICB0aGF0LmVsZW1lbnQgPSBlbDtcclxuICAgICAgICB0aGF0LmVsID0gJChlbCk7XHJcbiAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IFtdO1xyXG4gICAgICAgIHRoYXQuYmFkUXVlcmllcyA9IFtdO1xyXG4gICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xyXG4gICAgICAgIHRoYXQuY3VycmVudFZhbHVlID0gdGhhdC5lbGVtZW50LnZhbHVlO1xyXG4gICAgICAgIHRoYXQuaW50ZXJ2YWxJZCA9IDA7XHJcbiAgICAgICAgdGhhdC5jYWNoZWRSZXNwb25zZSA9IHt9O1xyXG4gICAgICAgIHRoYXQub25DaGFuZ2VJbnRlcnZhbCA9IG51bGw7XHJcbiAgICAgICAgdGhhdC5vbkNoYW5nZSA9IG51bGw7XHJcbiAgICAgICAgdGhhdC5pc0xvY2FsID0gZmFsc2U7XHJcbiAgICAgICAgdGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciA9IG51bGw7XHJcbiAgICAgICAgdGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gbnVsbDtcclxuICAgICAgICB0aGF0Lm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG4gICAgICAgIHRoYXQuY2xhc3NlcyA9IHtcclxuICAgICAgICAgICAgc2VsZWN0ZWQ6ICdhdXRvY29tcGxldGUtc2VsZWN0ZWQnLFxyXG4gICAgICAgICAgICBzdWdnZXN0aW9uOiAnYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb24nXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGF0LmhpbnQgPSBudWxsO1xyXG4gICAgICAgIHRoYXQuaGludFZhbHVlID0gJyc7XHJcbiAgICAgICAgdGhhdC5zZWxlY3Rpb24gPSBudWxsO1xyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXplIGFuZCBzZXQgb3B0aW9uczpcclxuICAgICAgICB0aGF0LmluaXRpYWxpemUoKTtcclxuICAgICAgICB0aGF0LnNldE9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgQXV0b2NvbXBsZXRlLnV0aWxzID0gdXRpbHM7XHJcblxyXG4gICAgJC5BdXRvY29tcGxldGUgPSBBdXRvY29tcGxldGU7XHJcblxyXG4gICAgQXV0b2NvbXBsZXRlLmZvcm1hdFJlc3VsdCA9IGZ1bmN0aW9uIChzdWdnZXN0aW9uLCBjdXJyZW50VmFsdWUpIHtcclxuICAgICAgICAvLyBEbyBub3QgcmVwbGFjZSBhbnl0aGluZyBpZiB0aGVyZSBjdXJyZW50IHZhbHVlIGlzIGVtcHR5XHJcbiAgICAgICAgaWYgKCFjdXJyZW50VmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb24udmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBwYXR0ZXJuID0gJygnICsgdXRpbHMuZXNjYXBlUmVnRXhDaGFycyhjdXJyZW50VmFsdWUpICsgJyknO1xyXG5cclxuICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbi52YWx1ZVxyXG4gICAgICAgICAgICAucmVwbGFjZShuZXcgUmVnRXhwKHBhdHRlcm4sICdnaScpLCAnPHN0cm9uZz4kMTxcXC9zdHJvbmc+JylcclxuICAgICAgICAgICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcclxuICAgICAgICAgICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcclxuICAgICAgICAgICAgLnJlcGxhY2UoLyZsdDsoXFwvP3N0cm9uZykmZ3Q7L2csICc8JDE+Jyk7XHJcbiAgICB9O1xyXG5cclxuICAgIEF1dG9jb21wbGV0ZS5wcm90b3R5cGUgPSB7XHJcblxyXG4gICAgICAgIGtpbGxlckZuOiBudWxsLFxyXG5cclxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb25TZWxlY3RvciA9ICcuJyArIHRoYXQuY2xhc3Nlcy5zdWdnZXN0aW9uLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSB0aGF0LmNsYXNzZXMuc2VsZWN0ZWQsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlIGF1dG9jb21wbGV0ZSBhdHRyaWJ1dGUgdG8gcHJldmVudCBuYXRpdmUgc3VnZ2VzdGlvbnM6XHJcbiAgICAgICAgICAgIHRoYXQuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2F1dG9jb21wbGV0ZScsICdvZmYnKTtcclxuXHJcbiAgICAgICAgICAgIHRoYXQua2lsbGVyRm4gPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCQoZS50YXJnZXQpLmNsb3Nlc3QoJy4nICsgdGhhdC5vcHRpb25zLmNvbnRhaW5lckNsYXNzKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmtpbGxTdWdnZXN0aW9ucygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZGlzYWJsZUtpbGxlckZuKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvLyBodG1sKCkgZGVhbHMgd2l0aCBtYW55IHR5cGVzOiBodG1sU3RyaW5nIG9yIEVsZW1lbnQgb3IgQXJyYXkgb3IgalF1ZXJ5XHJcbiAgICAgICAgICAgIHRoYXQubm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQoJzxkaXYgY2xhc3M9XCJhdXRvY29tcGxldGUtbm8tc3VnZ2VzdGlvblwiPjwvZGl2PicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5odG1sKHRoaXMub3B0aW9ucy5ub1N1Z2dlc3Rpb25Ob3RpY2UpLmdldCgwKTtcclxuXHJcbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIgPSBBdXRvY29tcGxldGUudXRpbHMuY3JlYXRlTm9kZShvcHRpb25zLmNvbnRhaW5lckNsYXNzKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kVG8ob3B0aW9ucy5hcHBlbmRUbyk7XHJcblxyXG4gICAgICAgICAgICAvLyBPbmx5IHNldCB3aWR0aCBpZiBpdCB3YXMgcHJvdmlkZWQ6XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLndpZHRoICE9PSAnYXV0bycpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci53aWR0aChvcHRpb25zLndpZHRoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gTGlzdGVuIGZvciBtb3VzZSBvdmVyIGV2ZW50IG9uIHN1Z2dlc3Rpb25zIGxpc3Q6XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5vbignbW91c2VvdmVyLmF1dG9jb21wbGV0ZScsIHN1Z2dlc3Rpb25TZWxlY3RvciwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5hY3RpdmF0ZSgkKHRoaXMpLmRhdGEoJ2luZGV4JykpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIERlc2VsZWN0IGFjdGl2ZSBlbGVtZW50IHdoZW4gbW91c2UgbGVhdmVzIHN1Z2dlc3Rpb25zIGNvbnRhaW5lcjpcclxuICAgICAgICAgICAgY29udGFpbmVyLm9uKCdtb3VzZW91dC5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jaGlsZHJlbignLicgKyBzZWxlY3RlZCkucmVtb3ZlQ2xhc3Moc2VsZWN0ZWQpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIExpc3RlbiBmb3IgY2xpY2sgZXZlbnQgb24gc3VnZ2VzdGlvbnMgbGlzdDpcclxuICAgICAgICAgICAgY29udGFpbmVyLm9uKCdjbGljay5hdXRvY29tcGxldGUnLCBzdWdnZXN0aW9uU2VsZWN0b3IsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KCQodGhpcykuZGF0YSgnaW5kZXgnKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbkNhcHR1cmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhhdC52aXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuYXV0b2NvbXBsZXRlJywgdGhhdC5maXhQb3NpdGlvbkNhcHR1cmUpO1xyXG5cclxuICAgICAgICAgICAgdGhhdC5lbC5vbigna2V5ZG93bi5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5UHJlc3MoZSk7IH0pO1xyXG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdrZXl1cC5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5VXAoZSk7IH0pO1xyXG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdibHVyLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uICgpIHsgdGhhdC5vbkJsdXIoKTsgfSk7XHJcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2ZvY3VzLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uICgpIHsgdGhhdC5vbkZvY3VzKCk7IH0pO1xyXG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdjaGFuZ2UuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVVwKGUpOyB9KTtcclxuICAgICAgICAgICAgdGhhdC5lbC5vbignaW5wdXQuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVVwKGUpOyB9KTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBvbkZvY3VzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LmVsLnZhbCgpLmxlbmd0aCA+PSB0aGF0Lm9wdGlvbnMubWluQ2hhcnMpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQub25WYWx1ZUNoYW5nZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgb25CbHVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZW5hYmxlS2lsbGVyRm4oKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIFxyXG4gICAgICAgIGFib3J0QWpheDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgIGlmICh0aGF0LmN1cnJlbnRSZXF1ZXN0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0LmFib3J0KCk7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0ID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNldE9wdGlvbnM6IGZ1bmN0aW9uIChzdXBwbGllZE9wdGlvbnMpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucztcclxuXHJcbiAgICAgICAgICAgICQuZXh0ZW5kKG9wdGlvbnMsIHN1cHBsaWVkT3B0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICB0aGF0LmlzTG9jYWwgPSAkLmlzQXJyYXkob3B0aW9ucy5sb29rdXApO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuaXNMb2NhbCkge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5sb29rdXAgPSB0aGF0LnZlcmlmeVN1Z2dlc3Rpb25zRm9ybWF0KG9wdGlvbnMubG9va3VwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgb3B0aW9ucy5vcmllbnRhdGlvbiA9IHRoYXQudmFsaWRhdGVPcmllbnRhdGlvbihvcHRpb25zLm9yaWVudGF0aW9uLCAnYm90dG9tJyk7XHJcblxyXG4gICAgICAgICAgICAvLyBBZGp1c3QgaGVpZ2h0LCB3aWR0aCBhbmQgei1pbmRleDpcclxuICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5jc3Moe1xyXG4gICAgICAgICAgICAgICAgJ21heC1oZWlnaHQnOiBvcHRpb25zLm1heEhlaWdodCArICdweCcsXHJcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiBvcHRpb25zLndpZHRoICsgJ3B4JyxcclxuICAgICAgICAgICAgICAgICd6LWluZGV4Jzogb3B0aW9ucy56SW5kZXhcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuXHJcblxyXG4gICAgICAgIGNsZWFyQ2FjaGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5jYWNoZWRSZXNwb25zZSA9IHt9O1xyXG4gICAgICAgICAgICB0aGlzLmJhZFF1ZXJpZXMgPSBbXTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBjbGVhcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNsZWFyQ2FjaGUoKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50VmFsdWUgPSAnJztcclxuICAgICAgICAgICAgdGhpcy5zdWdnZXN0aW9ucyA9IFtdO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGRpc2FibGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICB0aGF0LmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICB0aGF0LmFib3J0QWpheCgpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGVuYWJsZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZml4UG9zaXRpb246IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gVXNlIG9ubHkgd2hlbiBjb250YWluZXIgaGFzIGFscmVhZHkgaXRzIGNvbnRlbnRcclxuXHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgICRjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyUGFyZW50ID0gJGNvbnRhaW5lci5wYXJlbnQoKS5nZXQoMCk7XHJcbiAgICAgICAgICAgIC8vIEZpeCBwb3NpdGlvbiBhdXRvbWF0aWNhbGx5IHdoZW4gYXBwZW5kZWQgdG8gYm9keS5cclxuICAgICAgICAgICAgLy8gSW4gb3RoZXIgY2FzZXMgZm9yY2UgcGFyYW1ldGVyIG11c3QgYmUgZ2l2ZW4uXHJcbiAgICAgICAgICAgIGlmIChjb250YWluZXJQYXJlbnQgIT09IGRvY3VtZW50LmJvZHkgJiYgIXRoYXQub3B0aW9ucy5mb3JjZUZpeFBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIENob29zZSBvcmllbnRhdGlvblxyXG4gICAgICAgICAgICB2YXIgb3JpZW50YXRpb24gPSB0aGF0Lm9wdGlvbnMub3JpZW50YXRpb24sXHJcbiAgICAgICAgICAgICAgICBjb250YWluZXJIZWlnaHQgPSAkY29udGFpbmVyLm91dGVySGVpZ2h0KCksXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSB0aGF0LmVsLm91dGVySGVpZ2h0KCksXHJcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSB0aGF0LmVsLm9mZnNldCgpLFxyXG4gICAgICAgICAgICAgICAgc3R5bGVzID0geyAndG9wJzogb2Zmc2V0LnRvcCwgJ2xlZnQnOiBvZmZzZXQubGVmdCB9O1xyXG5cclxuICAgICAgICAgICAgaWYgKG9yaWVudGF0aW9uID09PSAnYXV0bycpIHtcclxuICAgICAgICAgICAgICAgIHZhciB2aWV3UG9ydEhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKSxcclxuICAgICAgICAgICAgICAgICAgICBzY3JvbGxUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCksXHJcbiAgICAgICAgICAgICAgICAgICAgdG9wT3ZlcmZsb3cgPSAtc2Nyb2xsVG9wICsgb2Zmc2V0LnRvcCAtIGNvbnRhaW5lckhlaWdodCxcclxuICAgICAgICAgICAgICAgICAgICBib3R0b21PdmVyZmxvdyA9IHNjcm9sbFRvcCArIHZpZXdQb3J0SGVpZ2h0IC0gKG9mZnNldC50b3AgKyBoZWlnaHQgKyBjb250YWluZXJIZWlnaHQpO1xyXG5cclxuICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uID0gKE1hdGgubWF4KHRvcE92ZXJmbG93LCBib3R0b21PdmVyZmxvdykgPT09IHRvcE92ZXJmbG93KSA/ICd0b3AnIDogJ2JvdHRvbSc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChvcmllbnRhdGlvbiA9PT0gJ3RvcCcpIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlcy50b3AgKz0gLWNvbnRhaW5lckhlaWdodDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlcy50b3AgKz0gaGVpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBjb250YWluZXIgaXMgbm90IHBvc2l0aW9uZWQgdG8gYm9keSxcclxuICAgICAgICAgICAgLy8gY29ycmVjdCBpdHMgcG9zaXRpb24gdXNpbmcgb2Zmc2V0IHBhcmVudCBvZmZzZXRcclxuICAgICAgICAgICAgaWYoY29udGFpbmVyUGFyZW50ICE9PSBkb2N1bWVudC5ib2R5KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgb3BhY2l0eSA9ICRjb250YWluZXIuY3NzKCdvcGFjaXR5JyksXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50T2Zmc2V0RGlmZjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGF0LnZpc2libGUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmNzcygnb3BhY2l0eScsIDApLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcGFyZW50T2Zmc2V0RGlmZiA9ICRjb250YWluZXIub2Zmc2V0UGFyZW50KCkub2Zmc2V0KCk7XHJcbiAgICAgICAgICAgICAgICBzdHlsZXMudG9wIC09IHBhcmVudE9mZnNldERpZmYudG9wO1xyXG4gICAgICAgICAgICAgICAgc3R5bGVzLmxlZnQgLT0gcGFyZW50T2Zmc2V0RGlmZi5sZWZ0O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghdGhhdC52aXNpYmxlKXtcclxuICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmNzcygnb3BhY2l0eScsIG9wYWNpdHkpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gLTJweCB0byBhY2NvdW50IGZvciBzdWdnZXN0aW9ucyBib3JkZXIuXHJcbiAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMud2lkdGggPT09ICdhdXRvJykge1xyXG4gICAgICAgICAgICAgICAgc3R5bGVzLndpZHRoID0gKHRoYXQuZWwub3V0ZXJXaWR0aCgpIC0gMikgKyAncHgnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAkY29udGFpbmVyLmNzcyhzdHlsZXMpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGVuYWJsZUtpbGxlckZuOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrLmF1dG9jb21wbGV0ZScsIHRoYXQua2lsbGVyRm4pO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGRpc2FibGVLaWxsZXJGbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suYXV0b2NvbXBsZXRlJywgdGhhdC5raWxsZXJGbik7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAga2lsbFN1Z2dlc3Rpb25zOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgdGhhdC5zdG9wS2lsbFN1Z2dlc3Rpb25zKCk7XHJcbiAgICAgICAgICAgIHRoYXQuaW50ZXJ2YWxJZCA9IHdpbmRvdy5zZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhhdC52aXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGF0LnN0b3BLaWxsU3VnZ2VzdGlvbnMoKTtcclxuICAgICAgICAgICAgfSwgNTApO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHN0b3BLaWxsU3VnZ2VzdGlvbnM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbElkKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBpc0N1cnNvckF0RW5kOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIHZhbExlbmd0aCA9IHRoYXQuZWwudmFsKCkubGVuZ3RoLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uU3RhcnQgPSB0aGF0LmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQsXHJcbiAgICAgICAgICAgICAgICByYW5nZTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2VsZWN0aW9uU3RhcnQgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZWN0aW9uU3RhcnQgPT09IHZhbExlbmd0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICByYW5nZSA9IGRvY3VtZW50LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSgpO1xyXG4gICAgICAgICAgICAgICAgcmFuZ2UubW92ZVN0YXJ0KCdjaGFyYWN0ZXInLCAtdmFsTGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWxMZW5ndGggPT09IHJhbmdlLnRleHQubGVuZ3RoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG9uS2V5UHJlc3M6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIC8vIElmIHN1Z2dlc3Rpb25zIGFyZSBoaWRkZW4gYW5kIHVzZXIgcHJlc3NlcyBhcnJvdyBkb3duLCBkaXNwbGF5IHN1Z2dlc3Rpb25zOlxyXG4gICAgICAgICAgICBpZiAoIXRoYXQuZGlzYWJsZWQgJiYgIXRoYXQudmlzaWJsZSAmJiBlLndoaWNoID09PSBrZXlzLkRPV04gJiYgdGhhdC5jdXJyZW50VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhhdC5kaXNhYmxlZCB8fCAhdGhhdC52aXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLkVTQzpcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmN1cnJlbnRWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuUklHSFQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuaGludCAmJiB0aGF0Lm9wdGlvbnMub25IaW50ICYmIHRoYXQuaXNDdXJzb3JBdEVuZCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0SGludCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlRBQjpcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5oaW50ICYmIHRoYXQub3B0aW9ucy5vbkhpbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RIaW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QodGhhdC5zZWxlY3RlZEluZGV4KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLnRhYkRpc2FibGVkID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlJFVFVSTjpcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCh0aGF0LnNlbGVjdGVkSW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlVQOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQubW92ZVVwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuRE9XTjpcclxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm1vdmVEb3duKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQ2FuY2VsIGV2ZW50IGlmIGZ1bmN0aW9uIGRpZCBub3QgcmV0dXJuOlxyXG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgb25LZXlVcDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuZGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc3dpdGNoIChlLndoaWNoKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuVVA6XHJcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuRE9XTjpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LmN1cnJlbnRWYWx1ZSAhPT0gdGhhdC5lbC52YWwoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5maW5kQmVzdEhpbnQoKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMuZGVmZXJSZXF1ZXN0QnkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRGVmZXIgbG9va3VwIGluIGNhc2Ugd2hlbiB2YWx1ZSBjaGFuZ2VzIHZlcnkgcXVpY2tseTpcclxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQub25WYWx1ZUNoYW5nZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIHRoYXQub3B0aW9ucy5kZWZlclJlcXVlc3RCeSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQub25WYWx1ZUNoYW5nZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgb25WYWx1ZUNoYW5nZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGF0LmVsLnZhbCgpLFxyXG4gICAgICAgICAgICAgICAgcXVlcnkgPSB0aGF0LmdldFF1ZXJ5KHZhbHVlKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGlvbiAmJiB0aGF0LmN1cnJlbnRWYWx1ZSAhPT0gcXVlcnkpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIChvcHRpb25zLm9uSW52YWxpZGF0ZVNlbGVjdGlvbiB8fCAkLm5vb3ApLmNhbGwodGhhdC5lbGVtZW50KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICB0aGF0LmN1cnJlbnRWYWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcclxuXHJcbiAgICAgICAgICAgIC8vIENoZWNrIGV4aXN0aW5nIHN1Z2dlc3Rpb24gZm9yIHRoZSBtYXRjaCBiZWZvcmUgcHJvY2VlZGluZzpcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dCAmJiB0aGF0LmlzRXhhY3RNYXRjaChxdWVyeSkpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KDApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAocXVlcnkubGVuZ3RoIDwgb3B0aW9ucy5taW5DaGFycykge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmdldFN1Z2dlc3Rpb25zKHF1ZXJ5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGlzRXhhY3RNYXRjaDogZnVuY3Rpb24gKHF1ZXJ5KSB7XHJcbiAgICAgICAgICAgIHZhciBzdWdnZXN0aW9ucyA9IHRoaXMuc3VnZ2VzdGlvbnM7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gKHN1Z2dlc3Rpb25zLmxlbmd0aCA9PT0gMSAmJiBzdWdnZXN0aW9uc1swXS52YWx1ZS50b0xvd2VyQ2FzZSgpID09PSBxdWVyeS50b0xvd2VyQ2FzZSgpKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBnZXRRdWVyeTogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWxpbWl0ZXIgPSB0aGlzLm9wdGlvbnMuZGVsaW1pdGVyLFxyXG4gICAgICAgICAgICAgICAgcGFydHM7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWRlbGltaXRlcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBhcnRzID0gdmFsdWUuc3BsaXQoZGVsaW1pdGVyKTtcclxuICAgICAgICAgICAgcmV0dXJuICQudHJpbShwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZ2V0U3VnZ2VzdGlvbnNMb2NhbDogZnVuY3Rpb24gKHF1ZXJ5KSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgICBxdWVyeUxvd2VyQ2FzZSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCksXHJcbiAgICAgICAgICAgICAgICBmaWx0ZXIgPSBvcHRpb25zLmxvb2t1cEZpbHRlcixcclxuICAgICAgICAgICAgICAgIGxpbWl0ID0gcGFyc2VJbnQob3B0aW9ucy5sb29rdXBMaW1pdCwgMTApLFxyXG4gICAgICAgICAgICAgICAgZGF0YTtcclxuXHJcbiAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9uczogJC5ncmVwKG9wdGlvbnMubG9va3VwLCBmdW5jdGlvbiAoc3VnZ2VzdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWx0ZXIoc3VnZ2VzdGlvbiwgcXVlcnksIHF1ZXJ5TG93ZXJDYXNlKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBpZiAobGltaXQgJiYgZGF0YS5zdWdnZXN0aW9ucy5sZW5ndGggPiBsaW1pdCkge1xyXG4gICAgICAgICAgICAgICAgZGF0YS5zdWdnZXN0aW9ucyA9IGRhdGEuc3VnZ2VzdGlvbnMuc2xpY2UoMCwgbGltaXQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBnZXRTdWdnZXN0aW9uczogZnVuY3Rpb24gKHEpIHtcclxuICAgICAgICAgICAgdmFyIHJlc3BvbnNlLFxyXG4gICAgICAgICAgICAgICAgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgc2VydmljZVVybCA9IG9wdGlvbnMuc2VydmljZVVybCxcclxuICAgICAgICAgICAgICAgIHBhcmFtcyxcclxuICAgICAgICAgICAgICAgIGNhY2hlS2V5LFxyXG4gICAgICAgICAgICAgICAgYWpheFNldHRpbmdzO1xyXG5cclxuICAgICAgICAgICAgb3B0aW9ucy5wYXJhbXNbb3B0aW9ucy5wYXJhbU5hbWVdID0gcTtcclxuICAgICAgICAgICAgcGFyYW1zID0gb3B0aW9ucy5pZ25vcmVQYXJhbXMgPyBudWxsIDogb3B0aW9ucy5wYXJhbXM7XHJcblxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5vblNlYXJjaFN0YXJ0LmNhbGwodGhhdC5lbGVtZW50LCBvcHRpb25zLnBhcmFtcykgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24ob3B0aW9ucy5sb29rdXApKXtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMubG9va3VwKHEsIGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IGRhdGEuc3VnZ2VzdGlvbnM7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaENvbXBsZXRlLmNhbGwodGhhdC5lbGVtZW50LCBxLCBkYXRhLnN1Z2dlc3Rpb25zKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhhdC5pc0xvY2FsKSB7XHJcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IHRoYXQuZ2V0U3VnZ2VzdGlvbnNMb2NhbChxKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24oc2VydmljZVVybCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlVXJsID0gc2VydmljZVVybC5jYWxsKHRoYXQuZWxlbWVudCwgcSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYWNoZUtleSA9IHNlcnZpY2VVcmwgKyAnPycgKyAkLnBhcmFtKHBhcmFtcyB8fCB7fSk7XHJcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IHRoYXQuY2FjaGVkUmVzcG9uc2VbY2FjaGVLZXldO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAocmVzcG9uc2UgJiYgJC5pc0FycmF5KHJlc3BvbnNlLnN1Z2dlc3Rpb25zKSkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IHJlc3BvbnNlLnN1Z2dlc3Rpb25zO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIHJlc3BvbnNlLnN1Z2dlc3Rpb25zKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghdGhhdC5pc0JhZFF1ZXJ5KHEpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmFib3J0QWpheCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGFqYXhTZXR0aW5ncyA9IHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IHNlcnZpY2VVcmwsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogcGFyYW1zLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IG9wdGlvbnMudHlwZSxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogb3B0aW9ucy5kYXRhVHlwZVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAkLmV4dGVuZChhamF4U2V0dGluZ3MsIG9wdGlvbnMuYWpheFNldHRpbmdzKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0ID0gJC5hamF4KGFqYXhTZXR0aW5ncykuZG9uZShmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5jdXJyZW50UmVxdWVzdCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gb3B0aW9ucy50cmFuc2Zvcm1SZXN1bHQoZGF0YSwgcSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5wcm9jZXNzUmVzcG9uc2UocmVzdWx0LCBxLCBjYWNoZUtleSk7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaENvbXBsZXRlLmNhbGwodGhhdC5lbGVtZW50LCBxLCByZXN1bHQuc3VnZ2VzdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgfSkuZmFpbChmdW5jdGlvbiAoanFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaEVycm9yLmNhbGwodGhhdC5lbGVtZW50LCBxLCBqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIFtdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGlzQmFkUXVlcnk6IGZ1bmN0aW9uIChxKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5vcHRpb25zLnByZXZlbnRCYWRRdWVyaWVzKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIGJhZFF1ZXJpZXMgPSB0aGlzLmJhZFF1ZXJpZXMsXHJcbiAgICAgICAgICAgICAgICBpID0gYmFkUXVlcmllcy5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAoaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocS5pbmRleE9mKGJhZFF1ZXJpZXNbaV0pID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBoaWRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKHRoYXQub3B0aW9ucy5vbkhpZGUpICYmIHRoYXQudmlzaWJsZSkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5vcHRpb25zLm9uSGlkZS5jYWxsKHRoYXQuZWxlbWVudCwgY29udGFpbmVyKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhhdC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xyXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuaGlkZSgpO1xyXG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQobnVsbCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc3VnZ2VzdDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zdWdnZXN0aW9ucy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2hvd05vU3VnZ2VzdGlvbk5vdGljZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm9TdWdnZXN0aW9ucygpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcclxuICAgICAgICAgICAgICAgIGdyb3VwQnkgPSBvcHRpb25zLmdyb3VwQnksXHJcbiAgICAgICAgICAgICAgICBmb3JtYXRSZXN1bHQgPSBvcHRpb25zLmZvcm1hdFJlc3VsdCxcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gdGhhdC5nZXRRdWVyeSh0aGF0LmN1cnJlbnRWYWx1ZSksXHJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSB0aGF0LmNsYXNzZXMuc3VnZ2VzdGlvbixcclxuICAgICAgICAgICAgICAgIGNsYXNzU2VsZWN0ZWQgPSB0aGF0LmNsYXNzZXMuc2VsZWN0ZWQsXHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxyXG4gICAgICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQodGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyKSxcclxuICAgICAgICAgICAgICAgIGJlZm9yZVJlbmRlciA9IG9wdGlvbnMuYmVmb3JlUmVuZGVyLFxyXG4gICAgICAgICAgICAgICAgaHRtbCA9ICcnLFxyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBmb3JtYXRHcm91cCA9IGZ1bmN0aW9uIChzdWdnZXN0aW9uLCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudENhdGVnb3J5ID0gc3VnZ2VzdGlvbi5kYXRhW2dyb3VwQnldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhdGVnb3J5ID09PSBjdXJyZW50Q2F0ZWdvcnkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeSA9IGN1cnJlbnRDYXRlZ29yeTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImF1dG9jb21wbGV0ZS1ncm91cFwiPjxzdHJvbmc+JyArIGNhdGVnb3J5ICsgJzwvc3Ryb25nPjwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQgJiYgdGhhdC5pc0V4YWN0TWF0Y2godmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCgwKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQnVpbGQgc3VnZ2VzdGlvbnMgaW5uZXIgSFRNTDpcclxuICAgICAgICAgICAgJC5lYWNoKHRoYXQuc3VnZ2VzdGlvbnMsIGZ1bmN0aW9uIChpLCBzdWdnZXN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZ3JvdXBCeSl7XHJcbiAgICAgICAgICAgICAgICAgICAgaHRtbCArPSBmb3JtYXRHcm91cChzdWdnZXN0aW9uLCB2YWx1ZSwgaSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cIicgKyBjbGFzc05hbWUgKyAnXCIgZGF0YS1pbmRleD1cIicgKyBpICsgJ1wiPicgKyBmb3JtYXRSZXN1bHQoc3VnZ2VzdGlvbiwgdmFsdWUpICsgJzwvZGl2Pic7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hZGp1c3RDb250YWluZXJXaWR0aCgpO1xyXG5cclxuICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lci5kZXRhY2goKTtcclxuICAgICAgICAgICAgY29udGFpbmVyLmh0bWwoaHRtbCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKGJlZm9yZVJlbmRlcikpIHtcclxuICAgICAgICAgICAgICAgIGJlZm9yZVJlbmRlci5jYWxsKHRoYXQuZWxlbWVudCwgY29udGFpbmVyKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xyXG4gICAgICAgICAgICBjb250YWluZXIuc2hvdygpO1xyXG5cclxuICAgICAgICAgICAgLy8gU2VsZWN0IGZpcnN0IHZhbHVlIGJ5IGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmF1dG9TZWxlY3RGaXJzdCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gMDtcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5zY3JvbGxUb3AoMCk7XHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIuY2hpbGRyZW4oJy4nICsgY2xhc3NOYW1lKS5maXJzdCgpLmFkZENsYXNzKGNsYXNzU2VsZWN0ZWQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGF0LnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGF0LmZpbmRCZXN0SGludCgpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG5vU3VnZ2VzdGlvbnM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXHJcbiAgICAgICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQodGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWRqdXN0Q29udGFpbmVyV2lkdGgoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNvbWUgZXhwbGljaXQgc3RlcHMuIEJlIGNhcmVmdWwgaGVyZSBhcyBpdCBlYXN5IHRvIGdldFxyXG4gICAgICAgICAgICAvLyBub1N1Z2dlc3Rpb25zQ29udGFpbmVyIHJlbW92ZWQgZnJvbSBET00gaWYgbm90IGRldGFjaGVkIHByb3Blcmx5LlxyXG4gICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyLmRldGFjaCgpO1xyXG4gICAgICAgICAgICBjb250YWluZXIuZW1wdHkoKTsgLy8gY2xlYW4gc3VnZ2VzdGlvbnMgaWYgYW55XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmQobm9TdWdnZXN0aW9uc0NvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICBjb250YWluZXIuc2hvdygpO1xyXG4gICAgICAgICAgICB0aGF0LnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGFkanVzdENvbnRhaW5lcldpZHRoOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcclxuICAgICAgICAgICAgICAgIHdpZHRoLFxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIHdpZHRoIGlzIGF1dG8sIGFkanVzdCB3aWR0aCBiZWZvcmUgZGlzcGxheWluZyBzdWdnZXN0aW9ucyxcclxuICAgICAgICAgICAgLy8gYmVjYXVzZSBpZiBpbnN0YW5jZSB3YXMgY3JlYXRlZCBiZWZvcmUgaW5wdXQgaGFkIHdpZHRoLCBpdCB3aWxsIGJlIHplcm8uXHJcbiAgICAgICAgICAgIC8vIEFsc28gaXQgYWRqdXN0cyBpZiBpbnB1dCB3aWR0aCBoYXMgY2hhbmdlZC5cclxuICAgICAgICAgICAgLy8gLTJweCB0byBhY2NvdW50IGZvciBzdWdnZXN0aW9ucyBib3JkZXIuXHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLndpZHRoID09PSAnYXV0bycpIHtcclxuICAgICAgICAgICAgICAgIHdpZHRoID0gdGhhdC5lbC5vdXRlcldpZHRoKCkgLSAyO1xyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyLndpZHRoKHdpZHRoID4gMCA/IHdpZHRoIDogMzAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGZpbmRCZXN0SGludDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoYXQuZWwudmFsKCkudG9Mb3dlckNhc2UoKSxcclxuICAgICAgICAgICAgICAgIGJlc3RNYXRjaCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICQuZWFjaCh0aGF0LnN1Z2dlc3Rpb25zLCBmdW5jdGlvbiAoaSwgc3VnZ2VzdGlvbikge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZvdW5kTWF0Y2ggPSBzdWdnZXN0aW9uLnZhbHVlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZih2YWx1ZSkgPT09IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAoZm91bmRNYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaCA9IHN1Z2dlc3Rpb247XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gIWZvdW5kTWF0Y2g7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KGJlc3RNYXRjaCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2lnbmFsSGludDogZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcclxuICAgICAgICAgICAgdmFyIGhpbnRWYWx1ZSA9ICcnLFxyXG4gICAgICAgICAgICAgICAgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgIGlmIChzdWdnZXN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBoaW50VmFsdWUgPSB0aGF0LmN1cnJlbnRWYWx1ZSArIHN1Z2dlc3Rpb24udmFsdWUuc3Vic3RyKHRoYXQuY3VycmVudFZhbHVlLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoYXQuaGludFZhbHVlICE9PSBoaW50VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuaGludFZhbHVlID0gaGludFZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5oaW50ID0gc3VnZ2VzdGlvbjtcclxuICAgICAgICAgICAgICAgICh0aGlzLm9wdGlvbnMub25IaW50IHx8ICQubm9vcCkoaGludFZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHZlcmlmeVN1Z2dlc3Rpb25zRm9ybWF0OiBmdW5jdGlvbiAoc3VnZ2VzdGlvbnMpIHtcclxuICAgICAgICAgICAgLy8gSWYgc3VnZ2VzdGlvbnMgaXMgc3RyaW5nIGFycmF5LCBjb252ZXJ0IHRoZW0gdG8gc3VwcG9ydGVkIGZvcm1hdDpcclxuICAgICAgICAgICAgaWYgKHN1Z2dlc3Rpb25zLmxlbmd0aCAmJiB0eXBlb2Ygc3VnZ2VzdGlvbnNbMF0gPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJC5tYXAoc3VnZ2VzdGlvbnMsIGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiB2YWx1ZSwgZGF0YTogbnVsbCB9O1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdWdnZXN0aW9ucztcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICB2YWxpZGF0ZU9yaWVudGF0aW9uOiBmdW5jdGlvbihvcmllbnRhdGlvbiwgZmFsbGJhY2spIHtcclxuICAgICAgICAgICAgb3JpZW50YXRpb24gPSAkLnRyaW0ob3JpZW50YXRpb24gfHwgJycpLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gICAgICAgICAgICBpZigkLmluQXJyYXkob3JpZW50YXRpb24sIFsnYXV0bycsICdib3R0b20nLCAndG9wJ10pID09PSAtMSl7XHJcbiAgICAgICAgICAgICAgICBvcmllbnRhdGlvbiA9IGZhbGxiYWNrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gb3JpZW50YXRpb247XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgcHJvY2Vzc1Jlc3BvbnNlOiBmdW5jdGlvbiAocmVzdWx0LCBvcmlnaW5hbFF1ZXJ5LCBjYWNoZUtleSkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zO1xyXG5cclxuICAgICAgICAgICAgcmVzdWx0LnN1Z2dlc3Rpb25zID0gdGhhdC52ZXJpZnlTdWdnZXN0aW9uc0Zvcm1hdChyZXN1bHQuc3VnZ2VzdGlvbnMpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ2FjaGUgcmVzdWx0cyBpZiBjYWNoZSBpcyBub3QgZGlzYWJsZWQ6XHJcbiAgICAgICAgICAgIGlmICghb3B0aW9ucy5ub0NhY2hlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmNhY2hlZFJlc3BvbnNlW2NhY2hlS2V5XSA9IHJlc3VsdDtcclxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnByZXZlbnRCYWRRdWVyaWVzICYmIHJlc3VsdC5zdWdnZXN0aW9ucy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmJhZFF1ZXJpZXMucHVzaChvcmlnaW5hbFF1ZXJ5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gUmV0dXJuIGlmIG9yaWdpbmFsUXVlcnkgaXMgbm90IG1hdGNoaW5nIGN1cnJlbnQgcXVlcnk6XHJcbiAgICAgICAgICAgIGlmIChvcmlnaW5hbFF1ZXJ5ICE9PSB0aGF0LmdldFF1ZXJ5KHRoYXQuY3VycmVudFZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gcmVzdWx0LnN1Z2dlc3Rpb25zO1xyXG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBhY3RpdmF0ZTogZnVuY3Rpb24gKGluZGV4KSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIGFjdGl2ZUl0ZW0sXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZCA9IHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCxcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlbiA9IGNvbnRhaW5lci5maW5kKCcuJyArIHRoYXQuY2xhc3Nlcy5zdWdnZXN0aW9uKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5maW5kKCcuJyArIHNlbGVjdGVkKS5yZW1vdmVDbGFzcyhzZWxlY3RlZCk7XHJcblxyXG4gICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSBpbmRleDtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggIT09IC0xICYmIGNoaWxkcmVuLmxlbmd0aCA+IHRoYXQuc2VsZWN0ZWRJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgYWN0aXZlSXRlbSA9IGNoaWxkcmVuLmdldCh0aGF0LnNlbGVjdGVkSW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgJChhY3RpdmVJdGVtKS5hZGRDbGFzcyhzZWxlY3RlZCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYWN0aXZlSXRlbTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2VsZWN0SGludDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBpID0gJC5pbkFycmF5KHRoYXQuaGludCwgdGhhdC5zdWdnZXN0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICB0aGF0LnNlbGVjdChpKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzZWxlY3Q6IGZ1bmN0aW9uIChpKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgdGhhdC5oaWRlKCk7XHJcbiAgICAgICAgICAgIHRoYXQub25TZWxlY3QoaSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgbW92ZVVwOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuY2hpbGRyZW4oKS5maXJzdCgpLnJlbW92ZUNsYXNzKHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCk7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcclxuICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHRoYXQuZmluZEJlc3RIaW50KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoYXQuYWRqdXN0U2Nyb2xsKHRoYXQuc2VsZWN0ZWRJbmRleCAtIDEpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG1vdmVEb3duOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09ICh0aGF0LnN1Z2dlc3Rpb25zLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoYXQuYWRqdXN0U2Nyb2xsKHRoYXQuc2VsZWN0ZWRJbmRleCArIDEpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGFkanVzdFNjcm9sbDogZnVuY3Rpb24gKGluZGV4KSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIGFjdGl2ZUl0ZW0gPSB0aGF0LmFjdGl2YXRlKGluZGV4KTtcclxuXHJcbiAgICAgICAgICAgIGlmICghYWN0aXZlSXRlbSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0VG9wLFxyXG4gICAgICAgICAgICAgICAgdXBwZXJCb3VuZCxcclxuICAgICAgICAgICAgICAgIGxvd2VyQm91bmQsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHREZWx0YSA9ICQoYWN0aXZlSXRlbSkub3V0ZXJIZWlnaHQoKTtcclxuXHJcbiAgICAgICAgICAgIG9mZnNldFRvcCA9IGFjdGl2ZUl0ZW0ub2Zmc2V0VG9wO1xyXG4gICAgICAgICAgICB1cHBlckJvdW5kID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5zY3JvbGxUb3AoKTtcclxuICAgICAgICAgICAgbG93ZXJCb3VuZCA9IHVwcGVyQm91bmQgKyB0aGF0Lm9wdGlvbnMubWF4SGVpZ2h0IC0gaGVpZ2h0RGVsdGE7XHJcblxyXG4gICAgICAgICAgICBpZiAob2Zmc2V0VG9wIDwgdXBwZXJCb3VuZCkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5zY3JvbGxUb3Aob2Zmc2V0VG9wKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChvZmZzZXRUb3AgPiBsb3dlckJvdW5kKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnNjcm9sbFRvcChvZmZzZXRUb3AgLSB0aGF0Lm9wdGlvbnMubWF4SGVpZ2h0ICsgaGVpZ2h0RGVsdGEpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRoYXQub3B0aW9ucy5wcmVzZXJ2ZUlucHV0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmdldFZhbHVlKHRoYXQuc3VnZ2VzdGlvbnNbaW5kZXhdLnZhbHVlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KG51bGwpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG9uU2VsZWN0OiBmdW5jdGlvbiAoaW5kZXgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgb25TZWxlY3RDYWxsYmFjayA9IHRoYXQub3B0aW9ucy5vblNlbGVjdCxcclxuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb24gPSB0aGF0LnN1Z2dlc3Rpb25zW2luZGV4XTtcclxuXHJcbiAgICAgICAgICAgIHRoYXQuY3VycmVudFZhbHVlID0gdGhhdC5nZXRWYWx1ZShzdWdnZXN0aW9uLnZhbHVlKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LmN1cnJlbnRWYWx1ZSAhPT0gdGhhdC5lbC52YWwoKSAmJiAhdGhhdC5vcHRpb25zLnByZXNlcnZlSW5wdXQpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KG51bGwpO1xyXG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gW107XHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uID0gc3VnZ2VzdGlvbjtcclxuXHJcbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24ob25TZWxlY3RDYWxsYmFjaykpIHtcclxuICAgICAgICAgICAgICAgIG9uU2VsZWN0Q2FsbGJhY2suY2FsbCh0aGF0LmVsZW1lbnQsIHN1Z2dlc3Rpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZ2V0VmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBkZWxpbWl0ZXIgPSB0aGF0Lm9wdGlvbnMuZGVsaW1pdGVyLFxyXG4gICAgICAgICAgICAgICAgY3VycmVudFZhbHVlLFxyXG4gICAgICAgICAgICAgICAgcGFydHM7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWRlbGltaXRlcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjdXJyZW50VmFsdWUgPSB0aGF0LmN1cnJlbnRWYWx1ZTtcclxuICAgICAgICAgICAgcGFydHMgPSBjdXJyZW50VmFsdWUuc3BsaXQoZGVsaW1pdGVyKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRWYWx1ZS5zdWJzdHIoMCwgY3VycmVudFZhbHVlLmxlbmd0aCAtIHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdLmxlbmd0aCkgKyB2YWx1ZTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBkaXNwb3NlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgdGhhdC5lbC5vZmYoJy5hdXRvY29tcGxldGUnKS5yZW1vdmVEYXRhKCdhdXRvY29tcGxldGUnKTtcclxuICAgICAgICAgICAgdGhhdC5kaXNhYmxlS2lsbGVyRm4oKTtcclxuICAgICAgICAgICAgJCh3aW5kb3cpLm9mZigncmVzaXplLmF1dG9jb21wbGV0ZScsIHRoYXQuZml4UG9zaXRpb25DYXB0dXJlKTtcclxuICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5yZW1vdmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIENyZWF0ZSBjaGFpbmFibGUgalF1ZXJ5IHBsdWdpbjpcclxuICAgICQuZm4uYXV0b2NvbXBsZXRlID0gJC5mbi5kZXZicmlkZ2VBdXRvY29tcGxldGUgPSBmdW5jdGlvbiAob3B0aW9ucywgYXJncykge1xyXG4gICAgICAgIHZhciBkYXRhS2V5ID0gJ2F1dG9jb21wbGV0ZSc7XHJcbiAgICAgICAgLy8gSWYgZnVuY3Rpb24gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50IHJldHVyblxyXG4gICAgICAgIC8vIGluc3RhbmNlIG9mIHRoZSBmaXJzdCBtYXRjaGVkIGVsZW1lbnQ6XHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlyc3QoKS5kYXRhKGRhdGFLZXkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBpbnB1dEVsZW1lbnQgPSAkKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBpbnB1dEVsZW1lbnQuZGF0YShkYXRhS2V5KTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZSAmJiB0eXBlb2YgaW5zdGFuY2Vbb3B0aW9uc10gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZVtvcHRpb25zXShhcmdzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIGluc3RhbmNlIGFscmVhZHkgZXhpc3RzLCBkZXN0cm95IGl0OlxyXG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlICYmIGluc3RhbmNlLmRpc3Bvc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IG5ldyBBdXRvY29tcGxldGUodGhpcywgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICBpbnB1dEVsZW1lbnQuZGF0YShkYXRhS2V5LCBpbnN0YW5jZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbn0pKTtcclxuIiwiJChmdW5jdGlvbigpIHtcclxuICAgIHZhciB1cmxQcmVmaXggPSAnJztcclxuXHJcbiAgICAkLmV4dGVuZCh7XHJcbiAgICAgICAgZ2V0VXJsVmFyczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciB2YXJzID0gW10sIGhhc2g7XHJcbiAgICAgICAgICAgIHZhciBoYXNoZXMgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zbGljZSh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCc/JykgKyAxKS5zcGxpdCgnJicpO1xyXG4gICAgICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgaGFzaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBoYXNoID0gaGFzaGVzW2ldLnNwbGl0KCc9Jyk7XHJcbiAgICAgICAgICAgICAgICB2YXJzLnB1c2goaGFzaFswXSk7XHJcbiAgICAgICAgICAgICAgICB2YXJzW2hhc2hbMF1dID0gaGFzaFsxXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdmFycztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFVybFZhcjogZnVuY3Rpb24obmFtZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJC5nZXRVcmxWYXJzKClbbmFtZV07XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIGFqYXggPSB7XHJcbiAgICAgICAgY29udHJvbDoge1xyXG4gICAgICAgICAgICBzZW5kRm9ybURhdGE6IGZ1bmN0aW9uKGZvcm0sIHVybCwgbG9nTmFtZSwgc3VjY2Vzc0NhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vbiggXCJzdWJtaXRcIiwgZm9ybSwgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZiA9ICQodGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YUZvcm0gPSAkKHRoaXMpLnNlcmlhbGl6ZSgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN1Ym1pdEJ1dHRvbiA9ICQodGhpcykuZmluZChcImJ1dHRvblt0eXBlPXN1Ym1pdF1cIiksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkQnV0dG9uVmFsdWUgPSBzdWJtaXRCdXR0b24uaHRtbCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBzdWJtaXRCdXR0b24uYXR0cihcImRpc2FibGVkXCIsIFwiZGlzYWJsZWRcIikuaHRtbCgnPGkgY2xhc3M9XCJmYSBmYS1jb2cgZmEtc3BpblwiPjwvaT4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiBcInBvc3RcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiB1cmxQcmVmaXggKyB1cmwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGFGb3JtLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gJC5wYXJzZUpTT04ocmVzcG9uc2UpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHJlc3BvbnNlLmVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGtleSBpbiByZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihyZXNwb25zZVtrZXldWzBdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmb3JtRXJyb3IgPSBub3R5KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCe0YjQuNCx0LrQsCE8L2I+IFwiICsgcmVzcG9uc2Vba2V5XVswXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiAncmVsYXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA3MDAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc0NhbGxiYWNrKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGpxeGhyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcnMuY29udHJvbC5sb2cobG9nTmFtZSwganF4aHIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmb3JtRXJyb3JBamF4ID0gbm90eSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCI8Yj7QotC10YXQvdC40YfQtdGB0LrQuNC1INGA0LDQsdC+0YLRiyE8L2I+PGJyPtCSINC00LDQvdC90YvQuSDQvNC+0LzQtdC90YIg0LLRgNC10LzQtdC90LhcIiArIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIg0L/RgNC+0LjQt9Cy0LXQtNGR0L3QvdC+0LUg0LTQtdC50YHRgtCy0LjQtSDQvdC10LLQvtC30LzQvtC20L3Qvi4g0J/QvtC/0YDQvtCx0YPQudGC0LUg0L/QvtC30LbQtS5cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiDQn9GA0LjQvdC+0YHQuNC8INGB0LLQvtC4INC40LfQstC40L3QtdC90LjRjyDQt9CwINC90LXRg9C00L7QsdGB0YLQstC+LlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiAnYW5pbWF0ZWQgZmxpcE91dFgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd3YXJuaW5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICd0b3BSaWdodCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogMTAwMDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJtaXRCdXR0b24ucmVtb3ZlQXR0cihcImRpc2FibGVkXCIpLmh0bWwob2xkQnV0dG9uVmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgZXJyb3JzID0ge1xyXG4gICAgICAgIGNvbnRyb2w6IHtcclxuICAgICAgICAgICAgbG9nOiBmdW5jdGlvbih0eXBlLCBqcXhocikge1xyXG4gICAgICAgICAgICAgICAgJChcIjxkaXYgaWQ9J2Vycm9yLWNvbnRhaW5lcicgc3R5bGU9J2Rpc3BsYXk6bm9uZTsnPlwiICsganF4aHIucmVzcG9uc2VUZXh0ICsgXCI8L2Rpdj5cIikuYXBwZW5kVG8oXCJib2R5XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBlcnJvckNvbnRhaW5lciA9ICQoXCIjZXJyb3ItY29udGFpbmVyXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlID0gdHlwZSArIFwiOiBcIiArIGpxeGhyLnN0YXR1cyArIFwiIFwiICsganF4aHIuc3RhdHVzVGV4dCArIFwiIFwiO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKGVycm9yQ29udGFpbmVyLmZpbmQoXCJoMjpmaXJzdFwiKS50ZXh0KCkgPT0gXCJEZXRhaWxzXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2UgKz0gXCItIFwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGVycm9yQ29udGFpbmVyLmZpbmQoXCJkaXZcIikuZWFjaChmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihpbmRleCA+IDQpIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRlbGltaXRlciA9IFwiLCBcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoaW5kZXggPT0gNCkgZGVsaW1pdGVyID0gXCJcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlICs9ICQodGhpcykudGV4dCgpICsgZGVsaW1pdGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiBcInBvc3RcIixcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IHVybFByZWZpeCArIFwiL2FqYXgtZXJyb3JcIixcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBcIm1lc3NhZ2U9XCIgKyBlcnJvck1lc3NhZ2UsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBlcnJvckNvbnRhaW5lci5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgdmFyIGhlYWRlciA9IHtcclxuICAgICAgICBjb250cm9sOiB7XHJcbiAgICAgICAgICAgIGhlYWRlclN0b3Jlc01lbnU6ICQoXCIjdG9wXCIpLmZpbmQoXCIuc3RvcmVzXCIpLCBcclxuICAgICAgICAgICAgc3RvcmVzU3VibWVudTogJChcIiN0b3BcIikuZmluZChcIi5zdG9yZXNcIikuZmluZChcIi5zdWJtZW51XCIpLFxyXG4gICAgICAgICAgICBwb3B1cFNpZ25VcDogJChcIiN0b3BcIikuZmluZChcIi5wb3B1cF9jb250ZW50XCIpLmZpbmQoXCIuc2lnbi11cFwiKSxcclxuICAgICAgICAgICAgc3RvcmVTaG93OiAnJyxcclxuICAgICAgICAgICAgc3RvcmVIaWRlOiAnJyxcclxuICAgICAgICAgICAgcGFzc3dvcmRSZWNvdmVyeTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGFzc3dvcmRSZWNvdmVyeUhhc2ggPSAkLmdldFVybFZhcihcInBydlwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZihwYXNzd29yZFJlY292ZXJ5SGFzaCAhPT0gdW5kZWZpbmVkICYmIHBhc3N3b3JkUmVjb3ZlcnlIYXNoICE9ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiBcInBvc3RcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiB1cmxQcmVmaXggKyBcIi9wYXNzd29yZC1yZWNvdmVyeS91cGRhdGVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogXCJwcnY9XCIgKyBwYXNzd29yZFJlY292ZXJ5SGFzaCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChqcXhocikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JzLmNvbnRyb2wubG9nKCdQYXNzd29yZCBSZWNvdmVyeSBVcGRhdGUgQWpheCBFcnJvcicsIGpxeGhyKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZm9ybUVycm9yQWpheCA9IG5vdHkoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0KLQtdGF0L3QuNGH0LXRgdC60LjQtSDRgNCw0LHQvtGC0YshPC9iPjxicj7QkiDQtNCw0L3QvdGL0Lkg0LzQvtC80LXQvdGCINCy0YDQtdC80LXQvdC4XCIgKyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiINC/0YDQvtC40LfQstC10LTRkdC90L3QvtC1INC00LXQudGB0YLQstC40LUg0L3QtdCy0L7Qt9C80L7QttC90L4uINCf0L7Qv9GA0L7QsdGD0LnRgtC1INC/0L7Qt9C20LUuXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIg0J/RgNC40L3QvtGB0LjQvCDRgdCy0L7QuCDQuNC30LLQuNC90LXQvdC40Y8g0LfQsCDQvdC10YPQtNC+0LHRgdGC0LLQvi5cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnd2FybmluZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDEwMDAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXNwb25zZSA9ICQucGFyc2VKU09OKHJlc3BvbnNlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihyZXNwb25zZS5lcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcihrZXkgaW4gcmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVzcG9uc2Vba2V5XVswXSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFzc1JlY292RXJyb3IgPSBub3R5KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCe0YjQuNCx0LrQsCE8L2I+IFwiICsgcmVzcG9uc2Vba2V5XVswXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiAncmVsYXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNzAwMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXNzUmVjb3ZTdWNjZXNzID0gbm90eSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0J/QvtC30LTRgNCw0LLQu9GP0LXQvCE8L2I+PGJyPiDQn9Cw0YDQvtC70Ywg0YPRgdC/0LXRiNC90L4g0LjQt9C80LXQvdGR0L0uINCd0L7QstGL0Lkg0L/QsNGA0L7Qu9GMOiA8Yj5cIiArIHJlc3BvbnNlLnBhc3N3b3JkICsgXCI8L2I+PGJyPjxicj5cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZVdpdGg6IFsnYnV0dG9uJ11cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKG51bGwsIG51bGwsICcvJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGV2ZW50czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmhlYWRlclN0b3Jlc01lbnUuaG92ZXIoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoJCh3aW5kb3cpLndpZHRoKCkgPiA5OTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYuc3RvcmVIaWRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zdG9yZVNob3cgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zdG9yZXNTdWJtZW51LmNsZWFyUXVldWUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc3RvcmVzU3VibWVudS5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIikuYW5pbWF0ZSh7XCJvcGFjaXR5XCI6IDF9LCAzNTApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAyMDApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKCQod2luZG93KS53aWR0aCgpID4gOTkxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChzZWxmLnN0b3JlU2hvdyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc3RvcmVIaWRlID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc3RvcmVzU3VibWVudS5jbGVhclF1ZXVlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnN0b3Jlc1N1Ym1lbnUuYW5pbWF0ZSh7XCJvcGFjaXR5XCI6IDB9LCAyMDAsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuY3NzKFwiZGlzcGxheVwiLCBcIm5vbmVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMzAwKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhc3N3b3JkUmVjb3ZlcnkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZigkKHdpbmRvdykud2lkdGgoKSA+IDk5MSkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoXCIuZm9ybS1zZWFyY2gtZHAgaW5wdXRcIikuYXV0b2NvbXBsZXRlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VydmljZVVybDogJy9zZWFyY2gnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBub0NhY2hlOiAndHJ1ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVyUmVxdWVzdEJ5OiAzMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvblNlbGVjdDogZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSAnL3N0b3Jlcy8nICsgc3VnZ2VzdGlvbi5kYXRhLnJvdXRlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgJChcImZvcm1bbmFtZT1zZWFyY2hdIC5mYVwiKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmNsb3Nlc3QoXCJmb3JtXCIpLnN1Ym1pdCgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJChcIi5kb2Jyb2hlYWQgaSwgLmRvYnJvIC5jaXJjbGUgLmMgLmZhLWhlYXJ0XCIpLmFuaW1vKHthbmltYXRpb246IFwicHVsc2VcIiwgaXRlcmF0ZTogXCJpbmZpbml0ZVwifSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGFjdGl2ZUNhdGVnb3J5ID0gJChcIi5oZWFkZXItbmF2IG5hdiB1bC5wcmltYXJ5LW5hdiAuc3VibWVudSAudHJlZSBhW2hyZWY9J1wiK2xvY2F0aW9uLnBhdGhuYW1lK1wiJ11cIik7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoYWN0aXZlQ2F0ZWdvcnkubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZUNhdGVnb3J5LmFkZENsYXNzKFwiYWN0aXZlXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBjb3Vwb25zID0ge1xyXG4gICAgICAgIGNvbnRyb2w6IHtcclxuICAgICAgICAgICAgZXZlbnRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQuY291bnRkb3duLnJlZ2lvbmFsT3B0aW9uc1sncnUnXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbHM6IFsn0JvQtdGCJywgJ9Cc0LXRgdGP0YbQtdCyJywgJ9Cd0LXQtNC10LvRjCcsICfQlNC90LXQuScsICfQp9Cw0YHQvtCyJywgJ9Cc0LjQvdGD0YInLCAn0KHQtdC60YPQvdC0J10sXHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxzMTogWyfQk9C+0LQnLCAn0JzQtdGB0Y/RhicsICfQndC10LTQtdC70Y8nLCAn0JTQtdC90YwnLCAn0KfQsNGBJywgJ9Cc0LjQvdGD0YLQsCcsICfQodC10LrRg9C90LTQsCddLFxyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsczI6IFsn0JPQvtC00LAnLCAn0JzQtdGB0Y/RhtCwJywgJ9Cd0LXQtNC10LvQuCcsICfQlNC90Y8nLCAn0KfQsNGB0LAnLCAn0JzQuNC90YPRgtGLJywgJ9Ch0LXQutGD0L3QtNGLJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgY29tcGFjdExhYmVsczogWyfQuycsICfQvCcsICfQvScsICfQtCddLCBjb21wYWN0TGFiZWxzMTogWyfQsycsICfQvCcsICfQvScsICfQtCddLFxyXG4gICAgICAgICAgICAgICAgICAgIHdoaWNoTGFiZWxzOiBmdW5jdGlvbihhbW91bnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHVuaXRzID0gYW1vdW50ICUgMTA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0ZW5zID0gTWF0aC5mbG9vcigoYW1vdW50ICUgMTAwKSAvIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChhbW91bnQgPT0gMSA/IDEgOiAodW5pdHMgPj0gMiAmJiB1bml0cyA8PSA0ICYmIHRlbnMgIT0gMSA/IDIgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKHVuaXRzID09IDEgJiYgdGVucyAhPSAxID8gMSA6IDApKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBkaWdpdHM6IFsnMCcsICcxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOSddLFxyXG4gICAgICAgICAgICAgICAgICAgIHRpbWVTZXBhcmF0b3I6ICc6JywgXHJcbiAgICAgICAgICAgICAgICAgICAgaXNSVEw6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICQuY291bnRkb3duLnNldERlZmF1bHRzKCQuY291bnRkb3duLnJlZ2lvbmFsT3B0aW9uc1sncnUnXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJChcIiN0b3BcIikuZmluZCgnLmNvdXBvbnMgLmN1cnJlbnQtY291cG9uIC50aW1lIC5jbG9jaycpLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGYgPSAkKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRlRW5kID0gbmV3IERhdGUoc2VsZi5hdHRyKFwiZGF0YS1lbmRcIikucmVwbGFjZSgvLS9nLCBcIi9cIikpOyBcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmNvdW50ZG93bih7dW50aWw6IGRhdGVFbmQsIGNvbXBhY3Q6IHRydWV9KTsgXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAkKFwiI3RvcFwiKS5maW5kKCcuY291cG9ucyAuY3VycmVudC1jb3Vwb24gLmNvdW50ZG93bi1hbW91bnQnKS5lYWNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxmID0gJCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoc2VsZi50ZXh0KCkgPT0gXCIwMDowMDowMFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY2xvc2VzdChcIi5jdXJyZW50LWNvdXBvblwiKS5maW5kKFwiLmV4cGlyeVwiKS5jc3MoXCJkaXNwbGF5XCIsIFwidGFibGUtY2VsbFwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAkKFwiI3RvcFwiKS5maW5kKFwiLmNvdXBvbnMgLmN1cnJlbnQtY291cG9uIC50ZXh0IC5hZGRpdGlvbmFsIGFcIikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5uZXh0KFwic3BhblwiKS50b2dnbGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnRleHQoZnVuY3Rpb24oaSwgdikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2ID0gdi5zcGxpdChcIiBcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZih2LmluZGV4T2YoJ9Cf0L7QutCw0LfQsNGC0YwnKSAhPSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdlswXSA9ICfQodC60YDRi9GC0YwnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdlswXSA9ICfQn9C+0LrQsNC30LDRgtGMJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdiA9IHYuam9pbihcIiBcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2O1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAkKFwiI3RvcFwiKS5maW5kKFwiLmNhdGVnb3JpZXMgLnNlYXJjaC1zdG9yZS1jb3Vwb25zIGlucHV0XCIpLmtleXVwKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBpVmFsdWUgPSAkKHRoaXMpLnZhbCgpLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKGlWYWx1ZSAhPSBcIlwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoXCIuY2F0ZWdvcmllcyAuY291cG9ucy1zdG9yZXMgbGkgYVwiKS5lYWNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0b3JlTmFtZSA9ICQodGhpcykudGV4dCgpLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoc3RvcmVOYW1lLmluZGV4T2YoaVZhbHVlKSAhPSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucGFyZW50KCkuY3NzKFwiZGlzcGxheVwiLCBcImJsb2NrXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudCgpLmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKFwiLmNhdGVnb3JpZXMgLmNvdXBvbnMtc3RvcmVzIGxpXCIpLmNzcyhcImRpc3BsYXlcIiwgXCJibG9ja1wiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiI3RvcCAuY291cG9ucyAuY3VycmVudC1jb3Vwb24gLnRleHQgLmNvdXBvbi1nb3RvIGFbaHJlZj0jc2hvd3Byb21vY29kZV1cIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGYgPSAkKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBzZWxmLm5leHQoXCJkaXZcIikuY3NzKFwiZGlzcGxheVwiLCBcImJsb2NrXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYudGV4dChcItCY0YHQv9C+0LvRjNC30L7QstCw0YLRjCDQutGD0L/QvtC9XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYXR0cihcInRhcmdldFwiLCBcIl9ibGFua1wiKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmF0dHIoXCJocmVmXCIsIFwiL2dvdG8vY291cG9uOlwiICsgc2VsZi5jbG9zZXN0KFwiLmN1cnJlbnQtY291cG9uXCIpLmF0dHIoXCJkYXRhLXVpZFwiKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH0pOyAgICAgICBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgcG9wdXAgPSB7XHJcbiAgICAgICAgY29udHJvbDoge1xyXG4gICAgICAgICAgICBzdGFyTm9taW5hdGlvbjogZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgdmFyIHN0YXJzID0gJChcIiN0b3AgLnBvcHVwIC5mZWVkYmFjay5wb3B1cC1jb250ZW50IC5yYXRpbmcgLmZhLXdyYXBwZXIgLmZhXCIpO1xyXG4gICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgc3RhcnMucmVtb3ZlQ2xhc3MoXCJmYS1zdGFyXCIpLmFkZENsYXNzKFwiZmEtc3Rhci1vXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGluZGV4OyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGFycy5lcShpKS5yZW1vdmVDbGFzcyhcImZhLXN0YXItb1wiKS5hZGRDbGFzcyhcImZhLXN0YXJcIik7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVnaXN0cmF0aW9uOiBmdW5jdGlvbihzZXR0aW5ncykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgZm9yIChzZWxlY3RvciBpbiBzZXR0aW5ncykge1xyXG4gICAgICAgICAgICAgICAgICAgICQoc2VsZWN0b3IpLnBvcHVwKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudCA6IHNldHRpbmdzW3NlbGVjdG9yXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZSA6ICdodG1sJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWZ0ZXJPcGVuOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhY3RpdmVFbGVtZW50ID0gJChcIiN0b3AgYS5wb3B1cF9hY3RpdmVcIikuYXR0cihcImhyZWZcIiksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qJyNsb2dpbicgOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2gzJyA6ICfQktGF0L7QtCDQvdCwINGB0LDQudGCJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYnV0dG9uJyA6ICfQktC+0LnRgtC4INCyINC70LjRh9C90YvQuSDQutCw0LHQuNC90LXRgicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2lucHV0W3R5cGU9cGFzc3dvcmRdJyA6ICfQktCy0LXQtNC40YLQtSDQstCw0Ygg0L/QsNGA0L7Qu9GMJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaDQnIDogJ9CY0LvQuCDQstC+0LnQtNC40YLQtSDQuiDQvdCw0Lwg0YEg0L/QvtC80L7RidGM0Y4g0YHQvtGG0YHQtdGC0LXQuTonLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcuc2lnbi11cC10YWdsaW5lJyA6ICfQodC+0LLQtdGA0YjQsNGPINCy0YXQvtC0INC90LAg0YHQsNC50YIsINCS0Ysg0YHQvtCz0LvQsNGI0LDQtdGC0LXRgdGMINGBINC90LDRiNC40LzQuCA8YSBocmVmPVwiL3Rlcm1zXCI+0J/RgNCw0LLQuNC70LDQvNC4PC9hPicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJy50ZXJtcycgOiAnPGEgaHJlZj1cIiNwYXNzd29yZC1yZWNvdmVyeVwiIGNsYXNzPVwiaWdub3JlLWhhc2hcIj7Ql9Cw0LHRi9C70Lgg0L/QsNGA0L7Qu9GMPzwvYT4nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdpbnB1dFtuYW1lPXR5cGVdJyA6ICdsb2dpbidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI3JlZ2lzdHJhdGlvbicgOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2gzJyA6ICfQndCw0YfQvdC40YLQtSDRjdC60L7QvdC+0LzQuNGC0Ywg0YPQttC1INGB0LXQs9C+0LTQvdGPIScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2J1dHRvbicgOiAn0J/RgNC40YHQvtC10LTQuNC90LjRgtGM0YHRjyDQuCDQvdCw0YfQsNGC0Ywg0Y3QutC+0L3QvtC80LjRgtGMJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaW5wdXRbdHlwZT1wYXNzd29yZF0nIDogJ9Cf0YDQuNC00YPQvNCw0LnRgtC1INC/0LDRgNC+0LvRjCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2g0JyA6ICfQmNC70Lgg0L/RgNC40YHQvtC10LTQuNC90Y/QudGC0LXRgdGMINC6INC90LDQvCDRgSDQv9C+0LzQvtGJ0YzRjiDRgdC+0YbRgdC10YLQtdC5OicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJy5zaWduLXVwLXRhZ2xpbmUnIDogJ9Cg0LXQs9C40YHRgtGA0LDRhtC40Y8g0L/QvtC70L3QvtGB0YLRjNGOINCx0LXRgdC/0LvQsNGC0L3QsCDQuCDQt9Cw0LnQvNGR0YIg0YMg0JLQsNGBINC90LXRgdC60L7Qu9GM0LrQviDRgdC10LrRg9C90LQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcudGVybXMnIDogJ9Cg0LXQs9C40YHRgtGA0LjRgNGD0Y/RgdGMLCDRjyDRgdC+0LPQu9Cw0YjQsNGO0YHRjCDRgSA8YSBocmVmPVwiL3Rlcm1zXCI+0J/RgNCw0LLQuNC70LDQvNC4PC9hPicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2lucHV0W25hbWU9dHlwZV0nIDogJ3JlZ2lzdHJhdGlvbidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sKi9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qJyNnaXZlZmVlZGJhY2snIDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdoMycgOiAn0J7RgtC30YvQsiDQviDRgdCw0LnRgtC1JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaW5wdXRbbmFtZT10eXBlXScgOiAnZmVlZGJhY2snXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI3Jldmlld3N0b3JlJyA6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaDMnIDogJ9Ce0YLQt9GL0LIg0L4g0LzQsNCz0LDQt9C40L3QtSAnICsgJChcIiNzdG9yZS1pbmZvcm1hdGlvblwiKS5hdHRyKFwiZGF0YS1zdG9yZS1uYW1lXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdpbnB1dFtuYW1lPXR5cGVdJyA6ICdyZXZpZXdfJyArICQoXCIjc3RvcmUtaW5mb3JtYXRpb25cIikuYXR0cihcImRhdGEtc3RvcmUtaWRcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKmlmKCQuaW5BcnJheShhY3RpdmVFbGVtZW50LCBbJyNsb2dpbicsICcjcmVnaXN0cmF0aW9uJ10pICE9IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBvcHVwV2luZG93ID0gJChcIiN0b3BcIikuZmluZChcIi5wb3B1cF9jb250ZW50XCIpLmZpbmQoXCIuc2lnbi11cFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3B1cFdpbmRvdy5maW5kKFwiLnNvY2lhbC1pY29uXCIpLnByZXBlbmQoXCJcIiArIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI8ZGl2IGlkPVxcXCJ1TG9naW42ZGFiM2EyZFxcXCJcIiArIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLXVsb2dpbj1cXFwiZGlzcGxheT1idXR0b25zO2ZpZWxkcz1maXJzdF9uYW1lLGVtYWlsLGxhc3RfbmFtZSxuaWNrbmFtZSxzZXgsYmRhdGUscGhvdG8sXCIgKyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGhvdG9fYmlnO29wdGlvbmFsPXBob25lLGNpdHksY291bnRyeTtsYW5nPXJ1O3Byb3ZpZGVycz12a29udGFrdGUsb2Rub2tsYXNzbmlraSxcIiArIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJmYWNlYm9vayx0d2l0dGVyO3JlZGlyZWN0X3VyaT1odHRwJTNBJTJGJTJGc2VjcmV0ZGlzY291bnRlci5ydSUyRmF1dGhvcml6YXRpb25zb2NpYWxfbG9naW5cXFwiPlwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiPGltZyBzcmM9XFxcIi9pbWFnZXMvYWNjb3VudC92ay5wbmdcXFwiIGRhdGEtdWxvZ2luYnV0dG9uPVxcXCJ2a29udGFrdGVcXFwiIGFsdD1cXFwidmtvbnRha3RlLXVsb2dpblxcXCI+XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI8aW1nIHNyYz1cXFwiL2ltYWdlcy9hY2NvdW50L2ZiLnBuZ1xcXCIgZGF0YS11bG9naW5idXR0b249XFxcImZhY2Vib29rXFxcIiBhbHQ9XFxcImZhY2Vib29rLXVsb2dpblxcXCI+XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI8aW1nIHNyYz1cXFwiL2ltYWdlcy9hY2NvdW50L3R3LnBuZ1xcXCIgZGF0YS11bG9naW5idXR0b249XFxcInR3aXR0ZXJcXFwiIGFsdD1cXFwidHdpdHRlci11bG9naW5cXFwiPlwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiPGltZyBzcmM9XFxcIi9pbWFnZXMvYWNjb3VudC9vay5wbmdcXFwiIGRhdGEtdWxvZ2luYnV0dG9uPVxcXCJvZG5va2xhc3NuaWtpXFxcIiBhbHQ9XFxcIm9kbm9rbGFzc25pa2ktdWxvZ2luXFxcIj5cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjwvZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0qL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoJC5pbkFycmF5KGFjdGl2ZUVsZW1lbnQsIFsnI2dpdmVmZWVkYmFjaycsICcjcmV2aWV3c3RvcmUnXSkgIT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcG9wdXBXaW5kb3cgPSAkKFwiI3RvcFwiKS5maW5kKFwiLnBvcHVwX2NvbnRlbnRcIikuZmluZChcIi5mZWVkYmFja1wiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGtleSBpbiBzZXR0aW5nc1thY3RpdmVFbGVtZW50XSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKCQuaW5BcnJheShrZXksIFsnaDMnLCAnYnV0dG9uJywgJ2g0J10pICE9IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcHVwV2luZG93LmZpbmQoa2V5KS50ZXh0KHNldHRpbmdzW2FjdGl2ZUVsZW1lbnRdW2tleV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZigkLmluQXJyYXkoa2V5LCBbJy5zaWduLXVwLXRhZ2xpbmUnLCAnLnRlcm1zJ10pICE9IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcHVwV2luZG93LmZpbmQoa2V5KS5odG1sKHNldHRpbmdzW2FjdGl2ZUVsZW1lbnRdW2tleV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZigkLmluQXJyYXkoa2V5LCBbJ2lucHV0W3R5cGU9cGFzc3dvcmRdJ10pICE9IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcHVwV2luZG93LmZpbmQoa2V5KS5hdHRyKCdwbGFjZWhvbGRlcicsIHNldHRpbmdzW2FjdGl2ZUVsZW1lbnRdW2tleV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZigkLmluQXJyYXkoa2V5LCBbJ2lucHV0W25hbWU9dHlwZV0nXSkgIT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9wdXBXaW5kb3cuZmluZChrZXkpLnZhbChzZXR0aW5nc1thY3RpdmVFbGVtZW50XVtrZXldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoYWN0aXZlRWxlbWVudCAhPSBcIiNjZXJ0XCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3B1cFdpbmRvdy5hbmltYXRlKHsnb3BhY2l0eScgOiAxfSwgMzAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1TG9naW4uY3VzdG9tSW5pdCgndUxvZ2luNmRhYjNhMmQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pOyAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGV2ZW50czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICBwb3B1cHMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLydhW2hyZWY9I2xvZ2luXScgOiAkKFwiI3RvcFwiKS5maW5kKCcucG9wdXAtbG9naW4nKS5odG1sKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLydhW2hyZWY9I3JlZ2lzdHJhdGlvbl0nIDogJChcIiN0b3BcIikuZmluZCgnLnBvcHVwLWxvZ2luJykuaHRtbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyonYVtocmVmPSNnaXZlZmVlZGJhY2tdJyA6ICAkKFwiI3RvcFwiKS5maW5kKCcucG9wdXAtZ2l2ZWZlZWRiYWNrJykuaHRtbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2FbaHJlZj0jcmV2aWV3c3RvcmVdJyA6ICAkKFwiI3RvcFwiKS5maW5kKCcucG9wdXAtZ2l2ZWZlZWRiYWNrJykuaHRtbCgpLCovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYVtocmVmPSNjZXJ0XScgOiAgJChcIiN0b3BcIikuZmluZCgnLnBvcHVwLWNlcnQnKS5odG1sKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLydhW2hyZWY9I3Bhc3N3b3JkLXJlY292ZXJ5XScgOiAkKFwiI3RvcFwiKS5maW5kKCcucG9wdXAtcmVjb3ZlcnknKS5odG1sKClcclxuICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL3RoaXMucmVnaXN0cmF0aW9uKHBvcHVwcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgLyokKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiI3RvcCBhW2hyZWY9I3Bhc3N3b3JkLXJlY292ZXJ5XVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKFwiI3RvcCAucG9wdXAtc2lnbi11cFwiKS5jbG9zZXN0KFwiLnBvcHVwXCIpLm5leHQoXCIucG9wdXBfY2xvc2VcIikuY2xpY2soKTtcclxuICAgICAgICAgICAgICAgIH0pOyovXHJcblxyXG4gICAgICAgICAgICAgICAgLyokKGRvY3VtZW50KS5vbihcIm1vdXNlb3ZlclwiLCBcIiN0b3AgLnBvcHVwIC5mZWVkYmFjay5wb3B1cC1jb250ZW50IC5yYXRpbmcgLmZhLXdyYXBwZXIgLmZhXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc3Rhck5vbWluYXRpb24oJCh0aGlzKS5pbmRleCgpICsgMSk7XHJcbiAgICAgICAgICAgICAgICB9KS5vbihcIm1vdXNlbGVhdmVcIiwgXCIjdG9wIC5wb3B1cCAuZmVlZGJhY2sucG9wdXAtY29udGVudCAucmF0aW5nIC5mYS13cmFwcGVyXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc3Rhck5vbWluYXRpb24oJChcIiN0b3AgLnBvcHVwIC5mZWVkYmFjay5wb3B1cC1jb250ZW50IGlucHV0W25hbWU9cmF0aW5nXVwiKS52YWwoKSk7ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgfSkub24oXCJjbGlja1wiLCBcIiN0b3AgLnBvcHVwIC5mZWVkYmFjay5wb3B1cC1jb250ZW50IC5yYXRpbmcgLmZhLXdyYXBwZXIgLmZhXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc3Rhck5vbWluYXRpb24oJCh0aGlzKS5pbmRleCgpICsgMSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgJChcIiN0b3AgLnBvcHVwIC5mZWVkYmFjay5wb3B1cC1jb250ZW50IGlucHV0W25hbWU9cmF0aW5nXVwiKS52YWwoJCh0aGlzKS5pbmRleCgpICsgMSk7XHJcbiAgICAgICAgICAgICAgICB9KTsqL1xyXG5cclxuICAgICAgICAgICAgICAgIC8qYWpheC5jb250cm9sLnNlbmRGb3JtRGF0YShcIiN0b3AgLnNpZ251cC1mb3JtXCIsIFwiL2F1dGhvcml6YXRpb25cIiwgXCJBdXRoIEFqYXggRXJyb3JcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGRhdGEudHlwZSA9PSAncmVnaXN0cmF0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gdXJsUHJlZml4ICsgXCIvYWNjb3VudFwiICsgZGF0YS5wYXJhbTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gdXJsUHJlZml4ICsgXCIvYWNjb3VudFwiO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pOyovXHJcblxyXG4gICAgICAgICAgICAgICAgLyphamF4LmNvbnRyb2wuc2VuZEZvcm1EYXRhKFwiI3RvcCAucmVjb3ZlcnktZm9ybVwiLCBcIi9wYXNzd29yZC1yZWNvdmVyeS9pbnN0cnVjdGlvbnNcIiwgXCJQYXNzd29yZCBSZWNvdmVyeSBJbnN0cnVjdGlvbnMgQWpheCBFcnJvclwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKFwiI3RvcCAucmVjb3ZlcnlcIikuY2xvc2VzdChcIi5wb3B1cFwiKS5uZXh0KFwiLnBvcHVwX2Nsb3NlXCIpLmNsaWNrKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXNzTm90eVN1Y2Nlc3MgPSBub3R5KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCI8Yj7Qn9C+0LfQtNGA0LDQstC70Y/QtdC8ITwvYj48YnI+INCY0L3RgdGC0YDRg9C60YbQuNC4INC/0L4g0LLQvtGB0YHRgtCw0L3QvtCy0LvQtdC90LjRjiDQv9Cw0YDQvtC70Y8g0YPRgdC/0LXRiNC90L5cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIg0L7RgtC/0YDQsNCy0LvQtdC90Ysg0L3QsCDRg9C60LDQt9Cw0L3QvdGL0LkgZW1haWwg0LDQtNGA0LXRgS4g0JXRgdC70Lgg0L/QuNGB0YzQvNC+INC90LUg0L/RgNC40YjQu9C+INCyINGC0LXRh9C10L3QuNC1IDIg0LzQuNC90YPRgiwg0L/QvtGB0LzQvtGC0YDQuNGC0LUg0LIg0L/QsNC/0LrQtSDCq9Ch0L/QsNC8wrsuXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNzAwMFxyXG4gICAgICAgICAgICAgICAgICAgIH0pOyAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB9KTsqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qdmFyIHJldmlld3MgPSB7XHJcbiAgICAgICAgY29udHJvbDoge1xyXG4gICAgICAgICAgICBldmVudHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gYWRkIGEgY29tbWVudCB0byB0aGUgc2l0ZVxyXG4gICAgICAgICAgICAgICAgYWpheC5jb250cm9sLnNlbmRGb3JtRGF0YShcIiN0b3AgLmZlZWRiYWNrLWZvcm1cIiwgXCIvcmV2aWV3c1wiLCBcIlJldmlld3MgQWpheCBFcnJvclwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKFwiI3RvcCAuZmVlZGJhY2tcIikuY2xvc2VzdChcIi5wb3B1cFwiKS5uZXh0KFwiLnBvcHVwX2Nsb3NlXCIpLmNsaWNrKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZXZpZXdTdWNjZXNzID0gbm90eSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0KHQv9Cw0YHQuNCx0L4hPC9iPjxicj7QktCw0Ygg0L7RgtC30YvQsiDRg9GB0L/QtdGI0L3QviDQtNC+0LHQsNCy0LvQtdC9INC4INCx0YPQtNC10YJcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIg0L7Qv9GD0LHQu9C40LrQvtCy0LDQvSDQvdCwINGB0LDQudGC0LUg0L/QvtGB0LvQtSDQvNC+0LTQtdGA0LDRhtC40LguXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNzAwMFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7ICAgICBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0qL1xyXG5cclxuICAgIHZhciBjYXRhbG9nID0ge1xyXG4gICAgICAgIGNvbnRyb2w6IHtcclxuICAgICAgICAgICAgZXZlbnRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoXCIjdG9wIC5kcm9wZG93bi1zZWxlY3QgLmRyb3BPdXQgbGlcIikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9ICQodGhpcykuZmluZChcImFcIikuYXR0cihcImhyZWZcIik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgZmF2b3JpdGVzID0ge1xyXG4gICAgICAgIGNvbnRyb2w6IHtcclxuICAgICAgICAgICAgZXZlbnRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuZmF2b3JpdGUtbGluay5pYVwiKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZiA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHR5cGUgPSBzZWxmLmF0dHIoXCJkYXRhLXN0YXRlXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFmZmlsaWF0ZV9pZCA9IHNlbGYuYXR0cihcImRhdGEtYWZmaWxpYXRlLWlkXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZih0eXBlID09IFwiYWRkXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5maW5kKFwiLmZhXCIpLnJlbW92ZUNsYXNzKFwibXV0ZWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmZpbmQoXCIuZmFcIikucmVtb3ZlQ2xhc3MoXCJwdWxzZTJcIikuYWRkQ2xhc3MoXCJmYS1zcGluXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IFwicG9zdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IHVybFByZWZpeCArIFwiL2FjY291bnQvZmF2b3JpdGVzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IFwidHlwZT1cIiArIHR5cGUgKyBcIiZhZmZpbGlhdGVfaWQ9XCIgKyBhZmZpbGlhdGVfaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoanF4aHIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9ycy5jb250cm9sLmxvZygnRmF2b3JpdGVzIEFqYXggRXJyb3InLCBqcXhocik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZhdkVycm9yQWpheCA9IG5vdHkoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0KLQtdGF0L3QuNGH0LXRgdC60LjQtSDRgNCw0LHQvtGC0YshPC9iPjxicj7QkiDQtNCw0L3QvdGL0Lkg0LzQvtC80LXQvdGCINCy0YDQtdC80LXQvdC4XCIgKyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiINC/0YDQvtC40LfQstC10LTRkdC90L3QvtC1INC00LXQudGB0YLQstC40LUg0L3QtdCy0L7Qt9C80L7QttC90L4uINCf0L7Qv9GA0L7QsdGD0LnRgtC1INC/0L7Qt9C20LUuXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIg0J/RgNC40L3QvtGB0LjQvCDRgdCy0L7QuCDQuNC30LLQuNC90LXQvdC40Y8g0LfQsCDQvdC10YPQtNC+0LHRgdGC0LLQvi5cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnd2FybmluZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDEwMDAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih0eXBlID09IFwiYWRkXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmZpbmQoXCIuZmFcIikuYWRkQ2xhc3MoXCJtdXRlZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmZpbmQoXCIuZmFcIikucmVtb3ZlQ2xhc3MoXCJmYS1zcGluXCIpLmFkZENsYXNzKFwicHVsc2UyXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gJC5wYXJzZUpTT04ocmVzcG9uc2UpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHJlc3BvbnNlLmVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGtleSBpbiByZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihyZXNwb25zZVtrZXldWzBdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmYXZvcml0ZXNFcnJvciA9IG5vdHkoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0J7RiNC40LHQutCwITwvYj4gXCIgKyByZXNwb25zZVtrZXldWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiAnYW5pbWF0ZWQgZmxpcE91dFgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDcwMDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih0eXBlID09IFwiYWRkXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5maW5kKFwiLmZhXCIpLmFkZENsYXNzKFwibXV0ZWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmZpbmQoXCIuZmFcIikucmVtb3ZlQ2xhc3MoXCJmYS1zcGluXCIpLmFkZENsYXNzKFwicHVsc2UyXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmF2b3JpdGVzU3VjY2VzcyA9IG5vdHkoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiByZXNwb25zZS5tc2csXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNzAwMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih0eXBlID09IFwiYWRkXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hdHRyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS1zdGF0ZVwiOiBcImRlbGV0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLW9yaWdpbmFsLXRpdGxlXCI6IFwi0KPQtNCw0LvQuNGC0Ywg0LjQtyDQuNC30LHRgNCw0L3QvdC+0LPQvlwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5maW5kKFwiLmZhXCIpLnJlbW92ZUNsYXNzKFwiZmEtc3BpbiBmYS1zdGFyLW9cIikuYWRkQ2xhc3MoXCJwdWxzZTIgZmEtc3RhclwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYodHlwZSA9PSBcImRlbGV0ZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYXR0cih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRhdGEtc3RhdGVcIjogXCJhZGRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS1vcmlnaW5hbC10aXRsZVwiIDogXCLQlNC+0LHQsNCy0LjRgtGMINCyINC40LfQsdGA0LDQvdC90L7QtVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pOyAgICAgICAgICAgICAgICAgICBcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZmluZChcIi5mYVwiKS5yZW1vdmVDbGFzcyhcImZhLXNwaW4gZmEtc3RhclwiKS5hZGRDbGFzcyhcInB1bHNlMiBmYS1zdGFyLW8gbXV0ZWRcIik7ICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pOyAgICAgICBcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBcclxuICAgIHBvcHVwLmNvbnRyb2wuZXZlbnRzKCk7XHJcbiAgICBoZWFkZXIuY29udHJvbC5ldmVudHMoKTtcclxuICAgIGNvdXBvbnMuY29udHJvbC5ldmVudHMoKTtcclxuICAgIC8vcmV2aWV3cy5jb250cm9sLmV2ZW50cygpO1xyXG4gICAgY2F0YWxvZy5jb250cm9sLmV2ZW50cygpO1xyXG4gICAgZmF2b3JpdGVzLmNvbnRyb2wuZXZlbnRzKCk7XHJcbn0pO1xyXG5cclxuXHJcbiQod2luZG93KS5sb2FkKGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgLyogU2Nyb2xsYmFyIEluaXRcclxuICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcbiAgICAvLyAkKFwiI3RvcFwiKS5maW5kKFwiLnN1Ym1lbnUgLnRyZWVcIikubUN1c3RvbVNjcm9sbGJhcih7XHJcbiAgICAvLyAgICAgYXhpczpcInlcIixcclxuICAgIC8vICAgICBzZXRIZWlnaHQ6IDMwMFxyXG4gICAgLy8gfSk7XHJcbiAgICAvLyBpZigkKFwiI3RvcFwiKS5maW5kKFwiLmMtd3JhcHBlclwiKS5sZW5ndGggPCAxKXtcclxuICAgIC8vICAgIHJldHVybiB0cnVlO1xyXG4gICAgLy8gfVxyXG4gICAgJChcIiN0b3BcIikuZmluZChcIi5jLXdyYXBwZXJcIikubUN1c3RvbVNjcm9sbGJhcih7XHJcbiAgICAgICAgYXhpczpcInlcIixcclxuICAgICAgICBzZXRIZWlnaHQ6IDcwMFxyXG4gICAgfSk7XHJcbiAgICAvLyAkKFwiI3RvcFwiKS5maW5kKFwiLmNtLXdyYXBwZXJcIikubUN1c3RvbVNjcm9sbGJhcih7XHJcbiAgICAvLyAgICAgYXhpczpcInlcIixcclxuICAgIC8vICAgICBzZXRIZWlnaHQ6IDY0MFxyXG4gICAgLy8gfSk7XHJcbiAgICAvLyAkKFwiI3RvcFwiKS5maW5kKFwiLnZpZXctc3RvcmUgLmFkZGl0aW9uYWwtaW5mb3JtYXRpb25cIikubUN1c3RvbVNjcm9sbGJhcih7XHJcbiAgICAvLyAgICAgYXhpczpcInlcIixcclxuICAgIC8vICAgICBzZXRIZWlnaHQ6IDY1XHJcbiAgICAvLyB9KTtcclxuICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuZnVuZHMgLmZ1bmQgLnRpdGxlXCIpLm1DdXN0b21TY3JvbGxiYXIoe1xyXG4gICAgICAgIGF4aXM6XCJ5XCIsXHJcbiAgICAgICAgc2V0SGVpZ2h0OiA0NSxcclxuICAgICAgICB0aGVtZTogXCJkYXJrXCJcclxuICAgIH0pOyBcclxuICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb25zXCIpLm1DdXN0b21TY3JvbGxiYXIoe1xyXG4gICAgICAgIGF4aXM6XCJ5XCIsXHJcbiAgICAgICAgc2V0SGVpZ2h0OiAzMDBcclxuICAgIH0pOyBcclxuICAgIC8vICQoXCIjdG9wXCIpLmZpbmQoXCIuY29tbWVudHMgLmN1cnJlbnQtY29tbWVudCAudGV4dCAuY29tbWVudFwiKS5tQ3VzdG9tU2Nyb2xsYmFyKHtcclxuICAgIC8vICAgICBheGlzOlwieVwiLFxyXG4gICAgLy8gICAgIHNldEhlaWdodDogMTUwLFxyXG4gICAgLy8gICAgIHRoZW1lOiBcImRhcmtcIlxyXG4gICAgLy8gfSk7IFxyXG4gICAgJChcIiN0b3BcIikuZmluZChcIi5jYXRlZ29yaWVzIHVsOm5vdCguc3ViY2F0ZWdvcmllcylcIikubUN1c3RvbVNjcm9sbGJhcih7XHJcbiAgICAgICAgYXhpczpcInlcIixcclxuICAgICAgICBzZXRIZWlnaHQ6IDI1MFxyXG4gICAgfSk7XHJcblxyXG4gICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoe1xyXG4gICAgICAgIGRlbGF5OiB7XHJcbiAgICAgICAgICAgIHNob3c6IDUwMCwgaGlkZTogMjAwMFxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLm9uKCdjbGljaycsZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9KVxyXG59KTtcclxuXHJcblxyXG4kKCcuc2hvcnQtZGVzY3JpcHRpb25fX2hhbmRsZS5tb3JlIGEnKS5jbGljayhmdW5jdGlvbihlKXtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBkaXYgPSAkKHRoaXMpLnBhcmVudCgpO1xyXG4gICAgJChkaXYpLnNpYmxpbmdzKCcuc2hvcnQtZGVzY3JpcHRpb25fX2hhbmRsZS5sZXNzJykuc2hvdygpO1xyXG4gICAgJChkaXYpLmhpZGUoKTtcclxuICAgICQoJy5zaG9ydC1kZXNjcmlwdGlvbl9fZGVzY3JpcHRpb24nKS50b2dnbGVDbGFzcygnbGVzcycpO1xyXG59KTtcclxuXHJcbiQoJy5zaG9ydC1kZXNjcmlwdGlvbl9faGFuZGxlLmxlc3MgYScpLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyIGRpdiA9ICQodGhpcykucGFyZW50KCk7XHJcbiAgICAkKGRpdikuc2libGluZ3MoJy5zaG9ydC1kZXNjcmlwdGlvbl9faGFuZGxlLm1vcmUnKS5zaG93KCk7XHJcbiAgICAkKGRpdikuaGlkZSgpO1xyXG4gICAgJCgnLnNob3J0LWRlc2NyaXB0aW9uX19kZXNjcmlwdGlvbicpLnRvZ2dsZUNsYXNzKCdsZXNzJyk7XHJcbn0pO1xyXG5cclxuJCgnLmFkZGl0aW9uYWwtaW5mb3JtYXRpb25fX2hhbmRsZS5tb3JlIGEnKS5jbGljayhmdW5jdGlvbihlKXtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBkaXYgPSAkKHRoaXMpLnBhcmVudCgpO1xyXG4gICAgJChkaXYpLnNpYmxpbmdzKCcuYWRkaXRpb25hbC1pbmZvcm1hdGlvbl9faGFuZGxlLmxlc3MnKS5zaG93KCk7XHJcbiAgICAkKGRpdikuaGlkZSgpO1xyXG4gICAgJCgnLmFkZGl0aW9uYWwtaW5mb3JtYXRpb24nKS50b2dnbGVDbGFzcygnb3BlbicpO1xyXG59KTtcclxuJCgnLmFkZGl0aW9uYWwtaW5mb3JtYXRpb25fX2hhbmRsZS5sZXNzIGEnKS5jbGljayhmdW5jdGlvbihlKXtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBkaXYgPSAkKHRoaXMpLnBhcmVudCgpO1xyXG4gICAgJChkaXYpLnNpYmxpbmdzKCcuYWRkaXRpb25hbC1pbmZvcm1hdGlvbl9faGFuZGxlLm1vcmUnKS5zaG93KCk7XHJcbiAgICAkKGRpdikuaGlkZSgpO1xyXG4gICAgJCgnLmFkZGl0aW9uYWwtaW5mb3JtYXRpb24nKS50b2dnbGVDbGFzcygnb3BlbicpO1xyXG59KTtcclxuJCgnLnN0b3JlLWNvdXBvbnNfX3Nob3ctbGVzcycpLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgJCgnLnN0b3JlLWNvdXBvbnNfX2J1dHRvbnMubW9yZScpLnNob3coKTtcclxuICAgICQoJy5zdG9yZS1jb3Vwb25zX19idXR0b25zLmxlc3MnKS5oaWRlKCk7XHJcbiAgICAkKCcuY291cG9ucy1pdGVtLm1vcmUnKS5oaWRlKCk7XHJcbn0pO1xyXG4kKCcuc3RvcmUtY291cG9uc19fc2hvdy1tb3JlJykuY2xpY2soZnVuY3Rpb24oZSl7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICQoJy5zdG9yZS1jb3Vwb25zX19idXR0b25zLmxlc3MnKS5zaG93KCk7XHJcbiAgICQoJy5zdG9yZS1jb3Vwb25zX19idXR0b25zLm1vcmUnKS5oaWRlKCk7XHJcbiAgICQoJy5jb3Vwb25zLWl0ZW0ubW9yZScpLnNob3coKTtcclxufSk7XHJcbiQoJy5zdG9yZS1yZXZpZXdzX19zaG93LWxlc3MnKS5jbGljayhmdW5jdGlvbihlKXtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICQoJy5zdG9yZS1yZXZpZXdzX19idXR0b25zLm1vcmUnKS5zaG93KCk7XHJcbiAgICAkKCcuc3RvcmUtcmV2aWV3c19fYnV0dG9ucy5sZXNzJykuaGlkZSgpO1xyXG4gICAgJCgnLnN0b3JlLXJldmlld3MtaXRlbS5tb3JlJykuaGlkZSgpO1xyXG59KTtcclxuJCgnLnN0b3JlLXJldmlld3NfX3Nob3ctbW9yZScpLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgJCgnLnN0b3JlLXJldmlld3NfX2J1dHRvbnMubGVzcycpLnNob3coKTtcclxuICAgICQoJy5zdG9yZS1yZXZpZXdzX19idXR0b25zLm1vcmUnKS5oaWRlKCk7XHJcbiAgICAkKCcuc3RvcmUtcmV2aWV3cy1pdGVtLm1vcmUnKS5zaG93KCk7XHJcbn0pO1xyXG4kKGZ1bmN0aW9uKCkge1xyXG4gICAgZnVuY3Rpb24gcGFyc2VOdW0oc3RyKXtcclxuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChcclxuICAgICAgICAgIFN0cmluZyhzdHIpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKCcsJywnLicpXHJcbiAgICAgICAgICAgIC5tYXRjaCgvLT9cXGQrKD86XFwuXFxkKyk/L2csICcnKSB8fCAwXHJcbiAgICAgICAgICAsIDEwXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICAkKCcuc2hvcnQtY2FsYy1jYXNoYmFjaycpLmZpbmQoJ3NlbGVjdCxpbnB1dCcpLm9uKCdjaGFuZ2Uga2V5dXAgY2xpY2snLGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkdGhpcz0kKHRoaXMpLmNsb3Nlc3QoJy5zaG9ydC1jYWxjLWNhc2hiYWNrJyk7XHJcbiAgICAgICAgY3Vycz1wYXJzZU51bSgkdGhpcy5maW5kKCdzZWxlY3QnKS52YWwoKSk7XHJcbiAgICAgICAgdmFsPSR0aGlzLmZpbmQoJ2lucHV0JykudmFsKCk7XHJcbiAgICAgICAgaWYocGFyc2VOdW0odmFsKSE9dmFsKXtcclxuICAgICAgICAgICAgdmFsPSR0aGlzLmZpbmQoJ2lucHV0JykudmFsKHBhcnNlTnVtKHZhbCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YWw9cGFyc2VOdW0odmFsKTtcclxuXHJcbiAgICAgICAga29lZj0kdGhpcy5maW5kKCdpbnB1dCcpLmF0dHIoJ2RhdGEtY2FzaGJhY2snKS50cmltKCk7XHJcbiAgICAgICAgcHJvbW89JHRoaXMuZmluZCgnaW5wdXQnKS5hdHRyKCdkYXRhLWNhc2hiYWNrLXByb21vJykudHJpbSgpO1xyXG4gICAgICAgIGN1cnJlbmN5PSR0aGlzLmZpbmQoJ2lucHV0JykuYXR0cignZGF0YS1jYXNoYmFjay1jdXJyZW5jeScpLnRyaW0oKTtcclxuXHJcbiAgICAgICAgaWYoa29lZj09cHJvbW8pe1xyXG4gICAgICAgICAgICBwcm9tbz0wO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoa29lZi5pbmRleE9mKCclJyk+MCl7XHJcbiAgICAgICAgICAgIHJlc3VsdD1wYXJzZU51bShrb2VmKSp2YWwqY3Vycy8xMDA7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGN1cnM9cGFyc2VOdW0oJHRoaXMuZmluZCgnW2NvZGU9JytjdXJyZW5jeSsnXScpLnZhbCgpKTtcclxuICAgICAgICAgICAgcmVzdWx0PXBhcnNlTnVtKGtvZWYpKmN1cnNcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHBhcnNlTnVtKHByb21vKT4wKSB7XHJcbiAgICAgICAgICAgIGlmKHByb21vLmluZGV4T2YoJyUnKT4wKXtcclxuICAgICAgICAgICAgICAgIHByb21vPXBhcnNlTnVtKHByb21vKSp2YWwqY3Vycy8xMDA7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgcHJvbW89cGFyc2VOdW0ocHJvbW8pKmN1cnNcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYocHJvbW8+MCkge1xyXG4gICAgICAgICAgICAgICAgb3V0ID0gXCI8c3BhbiBjbGFzcz1vbGRfcHJpY2U+XCIgKyByZXN1bHQudG9GaXhlZCgyKSArIFwiPC9zcGFuPiBcIiArIHByb21vLnRvRml4ZWQoMilcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICBvdXQ9cmVzdWx0LnRvRml4ZWQoMilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBvdXQ9cmVzdWx0LnRvRml4ZWQoMilcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAkdGhpcy5maW5kKCcuY2FsYy1yZXN1bHRfdmFsdWUnKS5odG1sKG91dClcclxuICAgIH0pLmNsaWNrKClcclxufSk7IiwidmFyIG5vdGlmaWNhdGlvbiA9IChmdW5jdGlvbigpIHtcclxuICB2YXIgbm90aWZpY2F0aW9uX2JveCA9ZmFsc2U7XHJcbiAgdmFyIGlzX2luaXQ9ZmFsc2U7XHJcbiAgdmFyIGNvbmZpcm1fb3B0PXtcclxuICAgIHRpdGxlOlwi0KPQtNCw0LvQtdC90LjQtVwiLFxyXG4gICAgcXVlc3Rpb246XCLQktGLINC00LXQudGB0YLQstC40YLQtdC70YzQvdC+INGF0L7RgtC40YLQtSDRg9C00LDQu9C40YLRjD9cIixcclxuICAgIGJ1dHRvblllczpcItCU0LBcIixcclxuICAgIGJ1dHRvbk5vOlwi0J3QtdGCXCIsXHJcbiAgICBjYWxsYmFja1llczpmYWxzZSxcclxuICAgIGNhbGxiYWNrTm86ZmFsc2UsXHJcbiAgICBvYmo6ZmFsc2UsXHJcbiAgfTtcclxuXHJcbiAgdmFyIGFsZXJ0X29wdD17XHJcbiAgICB0aXRsZTpcIlwiLFxyXG4gICAgcXVlc3Rpb246XCLQodC+0L7QsdGJ0LXQvdC40LVcIixcclxuICAgIGJ1dHRvblllczpcItCU0LBcIixcclxuICAgIGNhbGxiYWNrWWVzOmZhbHNlLFxyXG4gICAgb2JqOmZhbHNlLFxyXG4gIH07XHJcblxyXG5cclxuICBmdW5jdGlvbiBpbml0KCl7XHJcbiAgICBpc19pbml0PXRydWU7XHJcbiAgICBub3RpZmljYXRpb25fYm94PSQoJy5ub3RpZmljYXRpb25fYm94Jyk7XHJcbiAgICBpZihub3RpZmljYXRpb25fYm94Lmxlbmd0aD4wKXJldHVybjtcclxuXHJcbiAgICAkKCdib2R5JykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nbm90aWZpY2F0aW9uX2JveCc+PC9kaXY+XCIpO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveD0kKCcubm90aWZpY2F0aW9uX2JveCcpO1xyXG5cclxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywnLm5vdGlmeV9jb250cm9sJyxjbG9zZU1vZGFsKTtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywnLm5vdGlmeV9jbG9zZScsY2xvc2VNb2RhbCk7XHJcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsY2xvc2VNb2RhbEZvbik7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjbG9zZU1vZGFsKCl7XHJcbiAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XHJcbiAgfVxyXG4gIGZ1bmN0aW9uIGNsb3NlTW9kYWxGb24oZSl7XHJcbiAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xyXG4gICAgaWYodGFyZ2V0LmNsYXNzTmFtZT09XCJub3RpZmljYXRpb25fYm94XCIpe1xyXG4gICAgICBjbG9zZU1vZGFsKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhbGVydChkYXRhKXtcclxuICAgIGlmKCFkYXRhKWRhdGE9e307XHJcbiAgICBkYXRhPW9iamVjdHMoYWxlcnRfb3B0LGRhdGEpO1xyXG5cclxuICAgIGlmKCFpc19pbml0KWluaXQoKTtcclxuXHJcbiAgICBub3R5ZnlfY2xhc3M9J25vdGlmeV9ib3ggJztcclxuICAgIGlmKGRhdGEubm90eWZ5X2NsYXNzKW5vdHlmeV9jbGFzcys9ZGF0YS5ub3R5ZnlfY2xhc3M7XHJcblxyXG4gICAgYm94X2h0bWw9JzxkaXYgY2xhc3M9XCInK25vdHlmeV9jbGFzcysnXCI+JztcclxuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV90aXRsZVwiPic7XHJcbiAgICBib3hfaHRtbCs9ZGF0YS50aXRsZTtcclxuICAgIGJveF9odG1sKz0nPHNwYW4gY2xhc3M9XCJub3RpZnlfY2xvc2VcIj48L3NwYW4+JztcclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuXHJcbiAgICBib3hfaHRtbCs9JzxkaXYgY2xhc3M9XCJub3RpZnlfY29udGVudFwiPic7XHJcbiAgICBib3hfaHRtbCs9ZGF0YS5xdWVzdGlvbjtcclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuXHJcbiAgICBpZihkYXRhLmJ1dHRvblllc3x8ZGF0YS5idXR0b25Obykge1xyXG4gICAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250cm9sXCI+JztcclxuICAgICAgaWYgKGRhdGEuYnV0dG9uWWVzKWJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2J0bl95ZXNcIj4nICsgZGF0YS5idXR0b25ZZXMgKyAnPC9kaXY+JztcclxuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX25vXCI+JyArIGRhdGEuYnV0dG9uTm8gKyAnPC9kaXY+JztcclxuICAgICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcbiAgICB9O1xyXG5cclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XHJcblxyXG5cclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcclxuICAgIH0sMTAwKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29uZmlybShkYXRhKXtcclxuICAgIGlmKCFkYXRhKWRhdGE9e307XHJcbiAgICBkYXRhPW9iamVjdHMoY29uZmlybV9vcHQsZGF0YSk7XHJcblxyXG4gICAgaWYoIWlzX2luaXQpaW5pdCgpO1xyXG5cclxuICAgIGJveF9odG1sPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveFwiPic7XHJcbiAgICBib3hfaHRtbCs9JzxkaXYgY2xhc3M9XCJub3RpZnlfdGl0bGVcIj4nO1xyXG4gICAgYm94X2h0bWwrPWRhdGEudGl0bGU7XHJcbiAgICBib3hfaHRtbCs9JzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XHJcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XHJcblxyXG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRlbnRcIj4nO1xyXG4gICAgYm94X2h0bWwrPWRhdGEucXVlc3Rpb247XHJcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XHJcblxyXG4gICAgaWYoZGF0YS5idXR0b25ZZXN8fGRhdGEuYnV0dG9uTm8pIHtcclxuICAgICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udHJvbFwiPic7XHJcbiAgICAgIGlmIChkYXRhLmJ1dHRvblllcylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5feWVzXCI+JyArIGRhdGEuYnV0dG9uWWVzICsgJzwvZGl2Pic7XHJcbiAgICAgIGlmIChkYXRhLmJ1dHRvbk5vKWJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2J0bl9ub1wiPicgKyBkYXRhLmJ1dHRvbk5vICsgJzwvZGl2Pic7XHJcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG4gICAgfVxyXG5cclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XHJcblxyXG4gICAgaWYoZGF0YS5jYWxsYmFja1llcyE9ZmFsc2Upe1xyXG4gICAgICBub3RpZmljYXRpb25fYm94LmZpbmQoJy5ub3RpZnlfYnRuX3llcycpLm9uKCdjbGljaycsZGF0YS5jYWxsYmFja1llcy5iaW5kKGRhdGEub2JqKSk7XHJcbiAgICB9XHJcbiAgICBpZihkYXRhLmNhbGxiYWNrTm8hPWZhbHNlKXtcclxuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl9ubycpLm9uKCdjbGljaycsZGF0YS5jYWxsYmFja05vLmJpbmQoZGF0YS5vYmopKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XHJcbiAgICB9LDEwMClcclxuXHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgYWxlcnQ6IGFsZXJ0LFxyXG4gICAgY29uZmlybTogY29uZmlybVxyXG4gIH07XHJcblxyXG59KSgpO1xyXG5cclxuXHJcbiQoJ1tyZWY9cG9wdXBdJykub24oJ2NsaWNrJyxmdW5jdGlvbiAoZSl7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICR0aGlzPSQodGhpcylcclxuICBlbD0kKCR0aGlzLmF0dHIoJ2hyZWYnKSk7XHJcbiAgZGF0YT1lbC5kYXRhKCk7XHJcblxyXG4gIGRhdGEucXVlc3Rpb249ZWwuaHRtbCgpO1xyXG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxufSk7XHJcbiIsIi8vJCh3aW5kb3cpLmxvYWQoZnVuY3Rpb24oKSB7XHJcblxyXG52YXIgYWNjb3JkaW9uQ29udHJvbCA9ICQoJy5hY2NvcmRpb24gLmFjY29yZGlvbi1jb250cm9sJyk7XHJcblxyXG5hY2NvcmRpb25Db250cm9sLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICAkYWNjb3JkaW9uID0gJHRoaXMuY2xvc2VzdCgnLmFjY29yZGlvbicpO1xyXG5cclxuICAgIGlmICgkYWNjb3JkaW9uLmhhc0NsYXNzKCdvcGVuJykpIHtcclxuICAgICAgJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5oaWRlKDMwMCk7XHJcbiAgICAgICRhY2NvcmRpb24ucmVtb3ZlQ2xhc3MoJ29wZW4nKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5zaG93KDMwMCk7XHJcbiAgICAgICRhY2NvcmRpb24uYWRkQ2xhc3MoJ29wZW4nKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH0pO1xyXG5hY2NvcmRpb25Db250cm9sLnNob3coKTtcclxuLy99KVxyXG5cclxub2JqZWN0cyA9IGZ1bmN0aW9uIChhLGIpIHtcclxuICB2YXIgYyA9IGIsXHJcbiAgICBrZXk7XHJcbiAgZm9yIChrZXkgaW4gYSkge1xyXG4gICAgaWYgKGEuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICBjW2tleV0gPSBrZXkgaW4gYiA/IGJba2V5XSA6IGFba2V5XTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGM7XHJcbn07XHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCl7XHJcbiAgICBkYXRhPXRoaXM7XHJcbiAgICBkYXRhLmltZy5hdHRyKCdzcmMnLGRhdGEuc3JjKTtcclxuICB9XHJcblxyXG4gIGltZ3M9JCgnc2VjdGlvbjpub3QoLm5hdmlnYXRpb24pJykuZmluZCgnLmxvZ28gaW1nJyk7XHJcbiAgZm9yICh2YXIgaT0wO2k8aW1ncy5sZW5ndGg7aSsrKXtcclxuICAgIGltZz1pbWdzLmVxKGkpO1xyXG4gICAgc3JjPWltZy5hdHRyKCdzcmMnKTtcclxuICAgIGltZy5hdHRyKCdzcmMnLCcvaW1hZ2VzL3RlbXBsYXRlLWxvZ28uanBnJyk7XHJcbiAgICBkYXRhPXtcclxuICAgICAgc3JjOnNyYyxcclxuICAgICAgaW1nOmltZ1xyXG4gICAgfTtcclxuICAgIGltYWdlPSQoJzxpbWcvPicse1xyXG4gICAgICBzcmM6c3JjXHJcbiAgICB9KS5vbignbG9hZCcsaW1nX2xvYWRfZmluaXNoLmJpbmQoZGF0YSkpXHJcbiAgfVxyXG59KSgpO1xyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gIGVscz0kKCcuYWpheF9sb2FkJyk7XHJcbiAgZm9yKGk9MDtpPGVscy5sZW5ndGg7aSsrKXtcclxuICAgIGVsPWVscy5lcShpKTtcclxuICAgIHVybD1lbC5hdHRyKCdyZXMnKTtcclxuICAgICQuZ2V0KHVybCxmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAkdGhpcz0kKHRoaXMpO1xyXG4gICAgICAkdGhpcy5odG1sKGRhdGEpO1xyXG4gICAgICBhamF4Rm9ybSgkdGhpcyk7XHJcbiAgICB9LmJpbmQoZWwpKVxyXG4gIH1cclxufSkoKTtcclxuXHJcbiQoJ2lucHV0W3R5cGU9ZmlsZV0nKS5vbignY2hhbmdlJyxmdW5jdGlvbihldnQpe1xyXG4gIHZhciBmaWxlID0gZXZ0LnRhcmdldC5maWxlczsgLy8gRmlsZUxpc3Qgb2JqZWN0XHJcbiAgdmFyIGYgPSBmaWxlWzBdO1xyXG4gIC8vIE9ubHkgcHJvY2VzcyBpbWFnZSBmaWxlcy5cclxuICBpZiAoIWYudHlwZS5tYXRjaCgnaW1hZ2UuKicpKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG5cclxuICBkYXRhPSB7XHJcbiAgICAnZWwnOiB0aGlzLFxyXG4gICAgJ2YnOiBmXHJcbiAgfTtcclxuICByZWFkZXIub25sb2FkID0gKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbihlKSB7XHJcbiAgICAgIGltZz0kKCdbZm9yPVwiJytkYXRhLmVsLm5hbWUrJ1wiXScpO1xyXG4gICAgICBpZihpbWcubGVuZ3RoPjApe1xyXG4gICAgICAgIGltZy5hdHRyKCdzcmMnLGUudGFyZ2V0LnJlc3VsdClcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9KShkYXRhKTtcclxuICAvLyBSZWFkIGluIHRoZSBpbWFnZSBmaWxlIGFzIGEgZGF0YSBVUkwuXHJcbiAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZik7XHJcbn0pO1xyXG5cclxuJCgnYm9keScpLm9uKCdjbGljaycsJ2EuYWpheEZvcm1PcGVuJyxmdW5jdGlvbihlKXtcclxuICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgaHJlZj10aGlzLmhyZWYuc3BsaXQoJyMnKTtcclxuICBocmVmPWhyZWZbaHJlZi5sZW5ndGgtMV07XHJcblxyXG4gIGRhdGE9e1xyXG4gICAgYnV0dG9uWWVzOmZhbHNlLFxyXG4gICAgbm90eWZ5X2NsYXNzOlwibm90aWZ5X3doaXRlIGxvYWRpbmdcIixcclxuICAgIHF1ZXN0aW9uOicnXHJcbiAgfTtcclxuICBtb2RhbF9jbGFzcz0kKHRoaXMpLmRhdGEoJ21vZGFsLWNsYXNzJyk7XHJcblxyXG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxuICAkLmdldCgnLycraHJlZixmdW5jdGlvbihkYXRhKXtcclxuICAgICQoJy5ub3RpZnlfYm94JykucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgICQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpLmh0bWwoZGF0YS5odG1sKTtcclxuICAgIGFqYXhGb3JtKCQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpKTtcclxuICAgIGlmKG1vZGFsX2NsYXNzKXtcclxuICAgICAgJCgnLm5vdGlmeV9ib3ggLm5vdGlmeV9jb250ZW50IC5yb3cnKS5hZGRDbGFzcyhtb2RhbF9jbGFzcyk7XHJcbiAgICB9XHJcbiAgfSwnanNvbicpXHJcbn0pOyIsImZ1bmN0aW9uIGFqYXhGb3JtKGVscykge1xyXG4gIHZhciBmaWxlQXBpID0gd2luZG93LkZpbGUgJiYgd2luZG93LkZpbGVSZWFkZXIgJiYgd2luZG93LkZpbGVMaXN0ICYmIHdpbmRvdy5CbG9iID8gdHJ1ZSA6IGZhbHNlO1xyXG4gIHZhciBkZWZhdWx0cyA9IHtcclxuICAgIGVycm9yX2NsYXNzOiAnLmhhcy1lcnJvcicsXHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gb25Qb3N0KHBvc3Qpe1xyXG4gICAgdmFyIGRhdGE9dGhpcztcclxuICAgIGZvcm09ZGF0YS5mb3JtO1xyXG4gICAgd3JhcD1kYXRhLndyYXA7XHJcbiAgICBpZihwb3N0LnJlbmRlcil7XHJcbiAgICAgIHBvc3Qubm90eWZ5X2NsYXNzPVwibm90aWZ5X3doaXRlXCI7XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydChwb3N0KTtcclxuICAgIH1lbHNle1xyXG4gICAgICB3cmFwLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICAgIHdyYXAuaHRtbChwb3N0Lmh0bWwpO1xyXG4gICAgICBhamF4Rm9ybSh3cmFwKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG9uRmFpbCgpe1xyXG4gICAgdmFyIGRhdGE9dGhpcztcclxuICAgIGZvcm09ZGF0YS5mb3JtO1xyXG4gICAgd3JhcD1kYXRhLndyYXA7XHJcbiAgICB3cmFwLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICB3cmFwLmh0bWwoJ9Ce0YjQuNCx0LrQsCDQvtCx0YDQsNCx0L7RgtC60Lgg0YTQvtGA0LzRiyDQv9C+0L/RgNC+0LHRg9C50YLQtSDQv9C+0LfQttC1Jyk7XHJcbiAgICBhamF4Rm9ybSh3cmFwKTtcclxuXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBvblN1Ym1pdChlKXtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBkYXRhPXRoaXM7XHJcbiAgICBmb3JtPWRhdGEuZm9ybTtcclxuICAgIHdyYXA9ZGF0YS53cmFwO1xyXG5cclxuICAgIGlmKGZvcm0ueWlpQWN0aXZlRm9ybSl7XHJcbiAgICAgIGZvcm0ueWlpQWN0aXZlRm9ybSgndmFsaWRhdGUnKTtcclxuICAgIH07XHJcblxyXG4gICAgaXNWYWxpZD0oZm9ybS5maW5kKGRhdGEucGFyYW0uZXJyb3JfY2xhc3MpLmxlbmd0aD09MCk7XHJcblxyXG4gICAgaWYoIWlzVmFsaWQpe1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9ZWxzZXtcclxuICAgICAgcmVxdWlyZWQ9Zm9ybS5maW5kKCdpbnB1dC5yZXF1aXJlZCcpO1xyXG4gICAgICBmb3IoaT0wO2k8cmVxdWlyZWQubGVuZ3RoO2krKyl7XHJcbiAgICAgICAgaWYocmVxdWlyZWQuZXEoaSkudmFsKCkubGVuZ3RoPDEpe1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYoIWZvcm0uc2VyaWFsaXplT2JqZWN0KWFkZFNSTygpO1xyXG5cclxuICAgIHZhciBwb3N0PWZvcm0uc2VyaWFsaXplT2JqZWN0KCk7XHJcbiAgICBmb3JtLmFkZENsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICBmb3JtLmh0bWwoJycpO1xyXG5cclxuICAgICQucG9zdChcclxuICAgICAgZGF0YS51cmwsXHJcbiAgICAgIHBvc3QsXHJcbiAgICAgIG9uUG9zdC5iaW5kKGRhdGEpLFxyXG4gICAgICAnanNvbidcclxuICAgICkuZmFpbChvbkZhaWwuYmluZChkYXRhKSk7XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgZWxzLmZpbmQoJ1tyZXF1aXJlZF0nKVxyXG4gICAgLmFkZENsYXNzKCdyZXF1aXJlZCcpXHJcbiAgICAucmVtb3ZlQXR0cigncmVxdWlyZWQnKTtcclxuXHJcbiAgZm9yKHZhciBpPTA7aTxlbHMubGVuZ3RoO2krKyl7XHJcbiAgICB3cmFwPWVscy5lcShpKTtcclxuICAgIGZvcm09d3JhcC5maW5kKCdmb3JtJyk7XHJcbiAgICBkYXRhPXtcclxuICAgICAgZm9ybTpmb3JtLFxyXG4gICAgICBwYXJhbTpkZWZhdWx0cyxcclxuICAgICAgd3JhcDp3cmFwXHJcbiAgICB9O1xyXG4gICAgZGF0YS51cmw9Zm9ybS5hdHRyKCdhY3Rpb24nKSB8fCBsb2NhdGlvbi5ocmVmO1xyXG4gICAgZGF0YS5tZXRob2Q9IGZvcm0uYXR0cignbWV0aG9kJykgfHwgJ3Bvc3QnO1xyXG4gICAgZm9ybS5vZmYoJ3N1Ym1pdCcpO1xyXG4gICAgZm9ybS5vbignc3VibWl0Jywgb25TdWJtaXQuYmluZChkYXRhKSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBhZGRTUk8oKXtcclxuICAkLmZuLnNlcmlhbGl6ZU9iamVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBvID0ge307XHJcbiAgICB2YXIgYSA9IHRoaXMuc2VyaWFsaXplQXJyYXkoKTtcclxuICAgICQuZWFjaChhLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGlmIChvW3RoaXMubmFtZV0pIHtcclxuICAgICAgICBpZiAoIW9bdGhpcy5uYW1lXS5wdXNoKSB7XHJcbiAgICAgICAgICBvW3RoaXMubmFtZV0gPSBbb1t0aGlzLm5hbWVdXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgb1t0aGlzLm5hbWVdLnB1c2godGhpcy52YWx1ZSB8fCAnJyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgb1t0aGlzLm5hbWVdID0gdGhpcy52YWx1ZSB8fCAnJztcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbztcclxuICB9O1xyXG59O1xyXG5hZGRTUk8oKTsiLCIkKCdib2R5Jykub24oJ2NsaWNrJywnYVtocmVmPSNsb2dpbl0sYVtocmVmPSNyZWdpc3RyYXRpb25dLGFbaHJlZj0jcmVzZXRwYXNzd29yZF0nLGZ1bmN0aW9uKGUpe1xyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxuICAvL9C/0YDQuCDQvtGC0LrRgNGL0YLQuNC4INGE0L7RgNC80Ysg0YDQtdCz0LjRgdGC0YDQsNGG0LjQuCDQt9Cw0LrRgNGL0YLRjCwg0LXRgdC70Lgg0L7RgtGA0YvRgtC+IC0g0L/QvtC/0LDQvyDQuNGB0L/QvtC70YzQt9C+0LLQsNC90LjRjyDQutGD0L/QvtC90LAg0LHQtdC3INGA0LXQs9C40YHRgtGA0LDRhtC40LhcclxuICB2YXIgcG9wdXAgPSAkKFwiYVtocmVmPScjc2hvd3Byb21vY29kZS1ub3JlZ2lzdGVyJ11cIikuZGF0YSgncG9wdXAnKTtcclxuICBpZiAocG9wdXApIHtcclxuICAgIHBvcHVwLmNsb3NlKCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHBvcHVwID0gJCgnZGl2LnBvcHVwX2NvbnQsIGRpdi5wb3B1cF9iYWNrJyk7XHJcbiAgICBpZiAocG9wdXApIHtcclxuICAgICAgcG9wdXAuaGlkZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuICBocmVmPXRoaXMuaHJlZi5zcGxpdCgnIycpO1xyXG4gIGhyZWY9aHJlZltocmVmLmxlbmd0aC0xXTtcclxuXHJcbiAgZGF0YT17XHJcbiAgICBidXR0b25ZZXM6ZmFsc2UsXHJcbiAgICBub3R5ZnlfY2xhc3M6XCJub3RpZnlfd2hpdGUgbG9hZGluZ1wiLFxyXG4gICAgcXVlc3Rpb246JydcclxuICB9O1xyXG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxuICAkLmdldCgnLycraHJlZixmdW5jdGlvbihkYXRhKXtcclxuICAgICQoJy5ub3RpZnlfYm94JykucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgICQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpLmh0bWwoZGF0YS5odG1sKTtcclxuICAgIGFqYXhGb3JtKCQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpKTtcclxuICB9LCdqc29uJylcclxufSk7XHJcblxyXG4kKGZ1bmN0aW9uKCkge1xyXG4gIGZ1bmN0aW9uIHN0YXJOb21pbmF0aW9uKGluZGV4KSB7XHJcbiAgICB2YXIgc3RhcnMgPSAkKFwiLm5vdGlmeV9jb250ZW50IC5yYXRpbmcgLmZhLXdyYXBwZXIgLmZhXCIpO1xyXG4gICAgc3RhcnMucmVtb3ZlQ2xhc3MoXCJmYS1zdGFyXCIpLmFkZENsYXNzKFwiZmEtc3Rhci1vXCIpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmRleDsgaSsrKSB7XHJcbiAgICAgIHN0YXJzLmVxKGkpLnJlbW92ZUNsYXNzKFwiZmEtc3Rhci1vXCIpLmFkZENsYXNzKFwiZmEtc3RhclwiKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gICQoZG9jdW1lbnQpLm9uKFwibW91c2VvdmVyXCIsIFwiLm5vdGlmeV9jb250ZW50IC5yYXRpbmcgLmZhLXdyYXBwZXIgLmZhXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBzdGFyTm9taW5hdGlvbigkKHRoaXMpLmluZGV4KCkgKyAxKTtcclxuICB9KS5vbihcIm1vdXNlbGVhdmVcIiwgXCIubm90aWZ5X2NvbnRlbnQgLnJhdGluZyAuZmEtd3JhcHBlclwiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgc3Rhck5vbWluYXRpb24oJChcIi5ub3RpZnlfY29udGVudCBpbnB1dFtuYW1lPVxcXCJSZXZpZXdzW3JhdGluZ11cXFwiXVwiKS52YWwoKSk7XHJcbiAgfSkub24oXCJjbGlja1wiLCBcIi5ub3RpZnlfY29udGVudCAucmF0aW5nIC5mYS13cmFwcGVyIC5mYVwiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgc3Rhck5vbWluYXRpb24oJCh0aGlzKS5pbmRleCgpICsgMSk7XHJcblxyXG4gICAgJChcIi5ub3RpZnlfY29udGVudCBpbnB1dFtuYW1lPVxcXCJSZXZpZXdzW3JhdGluZ11cXFwiXVwiKS52YWwoJCh0aGlzKS5pbmRleCgpICsgMSk7XHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuYWpheEZvcm0oJCgnLmFqYXhfZm9ybScpKTtcclxuXHJcblxyXG4kKFwiYVtocmVmPScjc2hvd3Byb21vY29kZS1ub3JlZ2lzdGVyJ11cIikucG9wdXAoe1xyXG4gIGNvbnRlbnQgOiAnPGRpdiBjbGFzcz1cImNvdXBvbi1ub3JlZ2lzdGVyXCI+JytcclxuICAnPGRpdiBjbGFzcz1cImNvdXBvbi1ub3JlZ2lzdGVyX19pY29uXCI+PGltZyBzcmM9XCIvaW1hZ2VzL3RlbXBsYXRlcy9zd2EucG5nXCIgYWx0PVwiXCI+PC9kaXY+JytcclxuICAnPGRpdiBjbGFzcz1cImNvdXBvbi1ub3JlZ2lzdGVyX190ZXh0XCI+0JTQu9GPINC/0L7Qu9GD0YfQtdC90LjRjyDQutGN0YjQsdGN0LrQsCDQvdC10L7QsdGF0L7QtNC40LzQvjwvYnI+0LDQstGC0L7RgNC40LfQvtCy0LDRgtGM0YHRjyDQvdCwINGB0LDQudGC0LU8L2Rpdj4nICtcclxuICAnPGRpdiBjbGFzcz1cImNvdXBvbi1ub3JlZ2lzdGVyX19idXR0b25zXCI+JytcclxuICAnPGEgaHJlZj1cImdvdG8vY291cG9uOntpZH1cIiB0YXJnZXQ9XCJfYmxhbmtcIiBjbGFzcz1cImJ0biAgYnRuLXBvcHVwXCI+0JLQvtGB0L/QvtC70YzQt9C+0LLQsNGC0YzRgdGPPC9icj7QutGD0L/QvtC90L7QvDwvYnI+0LHQtdC3INGA0LXQs9C40YHRgtGA0LDRhtC40Lg8L2E+JytcclxuICAnPGEgaHJlZj1cIiNyZWdpc3RyYXRpb25cIiBjbGFzcz1cImJ0biBidG4tcG9wdXBcIj7Ql9Cw0YDQtdCz0LjRgdGC0YDQuNGA0L7QstCw0YLRjNGB0Y88L2JyPtC4INC/0L7Qu9GD0YfQuNGC0Yw8L2JyPtC10YnRkSDQuCDQutGN0YjQsdGN0Lo8L2E+JytcclxuICAnPC9kaXY+JytcclxuICAnPGRpdj4nLFxyXG4gIHR5cGUgOiAnaHRtbCcsXHJcbiAgYmVmb3JlT3BlbjogZnVuY3Rpb24oKSB7XHJcbiAgICAvL9C30LDQvNC10L3QuNGC0Ywg0LIg0LrQvtC90YLQtdC90YLQtSB7aWR9XHJcbiAgICB2YXIgaWQgPSAkKHRoaXMuZWxlKS5kYXRhKCdpZCcpO1xyXG4gICAgdGhpcy5vLmNvbnRlbnQgPSB0aGlzLm8uY29udGVudC5yZXBsYWNlKCd7aWR9JywgaWQpO1xyXG4gICAgLy/QtdGB0LvQuCDQt9Cw0LrRgNGL0LvQuCDQv9GA0LjQvdGD0LTQuNGC0LXQu9GM0L3Qviwg0YLQviDQv9C+0LrQsNC30LDRgtGMXHJcbiAgICBwb3B1cCA9ICQoJ2Rpdi5wb3B1cF9jb250LCBkaXYucG9wdXBfYmFjaycpO1xyXG4gICAgaWYgKHBvcHVwKSB7XHJcbiAgICAgIHBvcHVwLnNob3coKTtcclxuICAgIH1cclxuICB9LFxyXG4gIGFmdGVyT3BlbjogZnVuY3Rpb24oKSB7XHJcbiAgICAkKCcucG9wdXBfY29udGVudCcpWzBdLmlubmVySFRNTCA9IHRoaXMuby5jb250ZW50O1xyXG4gIH1cclxufSk7XHJcbiQoXCJhW2hyZWY9JyNjb21tZW50LXBvcHVwJ11cIikucG9wdXAoe1xyXG4gIGNvbnRlbnQgOiBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjb250ZW50ID0gdGhpcy5lbGUucGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgY29udGVudC5jbGFzc05hbWUgKz0gJyBtb2RhbC1wb3B1cCc7XHJcbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBkaXYuY2xhc3NOYW1lID0gJ2NvbW1lbnRzJztcclxuICAgIGRpdi5hcHBlbmQoY29udGVudCk7XHJcbiAgICAkKGRpdikuZmluZCgnLmN1cnJlbnQtY29tbWVudF9fbW9yZScpLnJlbW92ZSgpO1xyXG4gICAgJChkaXYpLmZpbmQoJy5jb21tZW50Lmxpc3QnKS5yZW1vdmVDbGFzcygnbGlzdCcpO1xyXG4gICAgcmV0dXJuIGRpdjtcclxuICB9XHJcbiAgLFxyXG4gIHdpZHRoOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgY29tbWVudHMgPSAkKCcuY3VycmVudC1jb21tZW50Jyk7XHJcbiAgICBpZiAoY29tbWVudHMubGVuZ3RoPjEpIHtcclxuICAgICAgcmV0dXJuIGNvbW1lbnRzWzBdLm9mZnNldFdpZHRoICogMC45O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIDUwMDtcclxuICB9XHJcbn0pO1xyXG4vL9C/0YDQvtC50YLQuCDQv9C+INC60L7QvNC80LXQvdGC0LDQvCwg0L7Qs9GA0LDQvdC40YfQuNGC0Ywg0LTQu9C40L3RgyDRgtC10LrRgdGC0LAsINCy0YHRgtCw0LLQuNGC0Ywg0YHRgdGL0LvQutGDIFwi0L/QvtC60LDQt9Cw0YLRjCDQv9C+0LvQvdC+0YHRgtGM0Y5cIlxyXG4kKCcuY3VycmVudC1jb21tZW50JykuZWFjaChmdW5jdGlvbihpbmRleCwgZWxlbWVudCkge1xyXG4gIHZhciB0ZXh0ID0gJChlbGVtZW50KS5maW5kKCcudGV4dCcpO1xyXG4gIHZhciBjb21tZW50ID0gJCh0ZXh0KS5maW5kKCcuY29tbWVudCcpO1xyXG4gIGlmIChjb21tZW50WzBdLmlubmVySFRNTC5sZW5ndGggPiAyMTApIHtcclxuICAgIHZhciBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpLFxyXG4gICAgICAgIHAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcbiAgICBhLmNsYXNzTmFtZSA9ICdjdXJyZW50LWNvbW1lbnRfX21vcmUnO1xyXG4gICAgYS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCAnI2NvbW1lbnQtcG9wdXAnKTtcclxuICAgIGEuaW5uZXJIVE1MID0gJ9Cf0L7QutCw0LfQsNGC0Ywg0L/QvtC70L3QvtGB0YLRjNGOJztcclxuICAgIHAuYXBwZW5kKGEpO1xyXG4gICAgdGV4dC5hcHBlbmQocCk7XHJcbiAgfVxyXG59KTsiXX0=
