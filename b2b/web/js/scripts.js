var lg = (function() {
  var lang={};
  url='/language/'+document.documentElement.lang+'.json';
  $.get(url,function (data) {
    //console.log(data);
    for(var index in data) {
      data[index]=clearVar(data[index]);
    }
    lang=data;
    var event = new CustomEvent("language_loaded");
    document.dispatchEvent(event);
    //console.log(data, event);
  },'json');

  function clearVar(txt){
    txt=txt.replace(/\s+/g," ");//удаление задвоение пробелов

    //Чистим подставляемые переменные
    str=txt.match(/\{(.*?)\}/g);
    if ( str != null) {
      for ( i = 0; i < str.length; i++ ) {
        str_t=str[i].replace(/ /g,"");
        txt=txt.replace(str[i],str_t);
      }
    }
    return txt;
  }

  return function(tpl, data){
    if(typeof(lang[tpl])=="undefined"){
      console.log("lang not found: "+tpl);
      return tpl;
    }
    tpl=lang[tpl];
    if(typeof(data)=="object"){
      for(var index in data) {
        tpl=tpl.split("{"+index+"}").join(data[index]);
      }
    }
    return tpl;
  }
})();
/*!
* Bootstrap.js by @fat & @mdo
* Copyright 2012 Twitter, Inc.
* http://www.apache.org/licenses/LICENSE-2.0.txt
*/
!function(e){"use strict";e(function(){e.support.transition=function(){var e=function(){var e=document.createElement("bootstrap"),t={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"},n;for(n in t)if(e.style[n]!==undefined)return t[n]}();return e&&{end:e}}()})}(window.jQuery),!function(e){"use strict";var t='[data-dismiss="alert"]',n=function(n){e(n).on("click",t,this.close)};n.prototype.close=function(t){function s(){i.trigger("closed").remove()}var n=e(this),r=n.attr("data-target"),i;r||(r=n.attr("href"),r=r&&r.replace(/.*(?=#[^\s]*$)/,"")),i=e(r),t&&t.preventDefault(),i.length||(i=n.hasClass("alert")?n:n.parent()),i.trigger(t=e.Event("close"));if(t.isDefaultPrevented())return;i.removeClass("in"),e.support.transition&&i.hasClass("fade")?i.on(e.support.transition.end,s):s()};var r=e.fn.alert;e.fn.alert=function(t){return this.each(function(){var r=e(this),i=r.data("alert");i||r.data("alert",i=new n(this)),typeof t=="string"&&i[t].call(r)})},e.fn.alert.Constructor=n,e.fn.alert.noConflict=function(){return e.fn.alert=r,this},e(document).on("click.alert.data-api",t,n.prototype.close)}(window.jQuery),!function(e){"use strict";var t=function(t,n){this.$element=e(t),this.options=e.extend({},e.fn.button.defaults,n)};t.prototype.setState=function(e){var t="disabled",n=this.$element,r=n.data(),i=n.is("input")?"val":"html";e+="Text",r.resetText||n.data("resetText",n[i]()),n[i](r[e]||this.options[e]),setTimeout(function(){e=="loadingText"?n.addClass(t).attr(t,t):n.removeClass(t).removeAttr(t)},0)},t.prototype.toggle=function(){var e=this.$element.closest('[data-toggle="buttons-radio"]');e&&e.find(".active").removeClass("active"),this.$element.toggleClass("active")};var n=e.fn.button;e.fn.button=function(n){return this.each(function(){var r=e(this),i=r.data("button"),s=typeof n=="object"&&n;i||r.data("button",i=new t(this,s)),n=="toggle"?i.toggle():n&&i.setState(n)})},e.fn.button.defaults={loadingText:"loading..."},e.fn.button.Constructor=t,e.fn.button.noConflict=function(){return e.fn.button=n,this},e(document).on("click.button.data-api","[data-toggle^=button]",function(t){var n=e(t.target);n.hasClass("btn")||(n=n.closest(".btn")),n.button("toggle")})}(window.jQuery),!function(e){"use strict";var t=function(t,n){this.$element=e(t),this.$indicators=this.$element.find(".carousel-indicators"),this.options=n,this.options.pause=="hover"&&this.$element.on("mouseenter",e.proxy(this.pause,this)).on("mouseleave",e.proxy(this.cycle,this))};t.prototype={cycle:function(t){return t||(this.paused=!1),this.interval&&clearInterval(this.interval),this.options.interval&&!this.paused&&(this.interval=setInterval(e.proxy(this.next,this),this.options.interval)),this},getActiveIndex:function(){return this.$active=this.$element.find(".item.active"),this.$items=this.$active.parent().children(),this.$items.index(this.$active)},to:function(t){var n=this.getActiveIndex(),r=this;if(t>this.$items.length-1||t<0)return;return this.sliding?this.$element.one("slid",function(){r.to(t)}):n==t?this.pause().cycle():this.slide(t>n?"next":"prev",e(this.$items[t]))},pause:function(t){return t||(this.paused=!0),this.$element.find(".next, .prev").length&&e.support.transition.end&&(this.$element.trigger(e.support.transition.end),this.cycle(!0)),clearInterval(this.interval),this.interval=null,this},next:function(){if(this.sliding)return;return this.slide("next")},prev:function(){if(this.sliding)return;return this.slide("prev")},slide:function(t,n){var r=this.$element.find(".item.active"),i=n||r[t](),s=this.interval,o=t=="next"?"left":"right",u=t=="next"?"first":"last",a=this,f;this.sliding=!0,s&&this.pause(),i=i.length?i:this.$element.find(".item")[u](),f=e.Event("slide",{relatedTarget:i[0],direction:o});if(i.hasClass("active"))return;this.$indicators.length&&(this.$indicators.find(".active").removeClass("active"),this.$element.one("slid",function(){var t=e(a.$indicators.children()[a.getActiveIndex()]);t&&t.addClass("active")}));if(e.support.transition&&this.$element.hasClass("slide")){this.$element.trigger(f);if(f.isDefaultPrevented())return;i.addClass(t),i[0].offsetWidth,r.addClass(o),i.addClass(o),this.$element.one(e.support.transition.end,function(){i.removeClass([t,o].join(" ")).addClass("active"),r.removeClass(["active",o].join(" ")),a.sliding=!1,setTimeout(function(){a.$element.trigger("slid")},0)})}else{this.$element.trigger(f);if(f.isDefaultPrevented())return;r.removeClass("active"),i.addClass("active"),this.sliding=!1,this.$element.trigger("slid")}return s&&this.cycle(),this}};var n=e.fn.carousel;e.fn.carousel=function(n){return this.each(function(){var r=e(this),i=r.data("carousel"),s=e.extend({},e.fn.carousel.defaults,typeof n=="object"&&n),o=typeof n=="string"?n:s.slide;i||r.data("carousel",i=new t(this,s)),typeof n=="number"?i.to(n):o?i[o]():s.interval&&i.pause().cycle()})},e.fn.carousel.defaults={interval:5e3,pause:"hover"},e.fn.carousel.Constructor=t,e.fn.carousel.noConflict=function(){return e.fn.carousel=n,this},e(document).on("click.carousel.data-api","[data-slide], [data-slide-to]",function(t){var n=e(this),r,i=e(n.attr("data-target")||(r=n.attr("href"))&&r.replace(/.*(?=#[^\s]+$)/,"")),s=e.extend({},i.data(),n.data()),o;i.carousel(s),(o=n.attr("data-slide-to"))&&i.data("carousel").pause().to(o).cycle(),t.preventDefault()})}(window.jQuery),!function(e){"use strict";var t=function(t,n){this.$element=e(t),this.options=e.extend({},e.fn.collapse.defaults,n),this.options.parent&&(this.$parent=e(this.options.parent)),this.options.toggle&&this.toggle()};t.prototype={constructor:t,dimension:function(){var e=this.$element.hasClass("width");return e?"width":"height"},show:function(){var t,n,r,i;if(this.transitioning||this.$element.hasClass("in"))return;t=this.dimension(),n=e.camelCase(["scroll",t].join("-")),r=this.$parent&&this.$parent.find("> .accordion-group > .in");if(r&&r.length){i=r.data("collapse");if(i&&i.transitioning)return;r.collapse("hide"),i||r.data("collapse",null)}this.$element[t](0),this.transition("addClass",e.Event("show"),"shown"),e.support.transition&&this.$element[t](this.$element[0][n])},hide:function(){var t;if(this.transitioning||!this.$element.hasClass("in"))return;t=this.dimension(),this.reset(this.$element[t]()),this.transition("removeClass",e.Event("hide"),"hidden"),this.$element[t](0)},reset:function(e){var t=this.dimension();return this.$element.removeClass("collapse")[t](e||"auto")[0].offsetWidth,this.$element[e!==null?"addClass":"removeClass"]("collapse"),this},transition:function(t,n,r){var i=this,s=function(){n.type=="show"&&i.reset(),i.transitioning=0,i.$element.trigger(r)};this.$element.trigger(n);if(n.isDefaultPrevented())return;this.transitioning=1,this.$element[t]("in"),e.support.transition&&this.$element.hasClass("collapse")?this.$element.one(e.support.transition.end,s):s()},toggle:function(){this[this.$element.hasClass("in")?"hide":"show"]()}};var n=e.fn.collapse;e.fn.collapse=function(n){return this.each(function(){var r=e(this),i=r.data("collapse"),s=e.extend({},e.fn.collapse.defaults,r.data(),typeof n=="object"&&n);i||r.data("collapse",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.collapse.defaults={toggle:!0},e.fn.collapse.Constructor=t,e.fn.collapse.noConflict=function(){return e.fn.collapse=n,this},e(document).on("click.collapse.data-api","[data-toggle=collapse]",function(t){var n=e(this),r,i=n.attr("data-target")||t.preventDefault()||(r=n.attr("href"))&&r.replace(/.*(?=#[^\s]+$)/,""),s=e(i).data("collapse")?"toggle":n.data();n[e(i).hasClass("in")?"addClass":"removeClass"]("collapsed"),e(i).collapse(s)})}(window.jQuery),!function(e){"use strict";function r(){e(t).each(function(){i(e(this)).removeClass("open")})}function i(t){var n=t.attr("data-target"),r;n||(n=t.attr("href"),n=n&&/#/.test(n)&&n.replace(/.*(?=#[^\s]*$)/,"")),r=n&&e(n);if(!r||!r.length)r=t.parent();return r}var t="[data-toggle=dropdown]",n=function(t){var n=e(t).on("click.dropdown.data-api",this.toggle);e("html").on("click.dropdown.data-api",function(){n.parent().removeClass("open")})};n.prototype={constructor:n,toggle:function(t){var n=e(this),s,o;if(n.is(".disabled, :disabled"))return;return s=i(n),o=s.hasClass("open"),r(),o||s.toggleClass("open"),n.focus(),!1},keydown:function(n){var r,s,o,u,a,f;if(!/(38|40|27)/.test(n.keyCode))return;r=e(this),n.preventDefault(),n.stopPropagation();if(r.is(".disabled, :disabled"))return;u=i(r),a=u.hasClass("open");if(!a||a&&n.keyCode==27)return n.which==27&&u.find(t).focus(),r.click();s=e("[role=menu] li:not(.divider):visible a",u);if(!s.length)return;f=s.index(s.filter(":focus")),n.keyCode==38&&f>0&&f--,n.keyCode==40&&f<s.length-1&&f++,~f||(f=0),s.eq(f).focus()}};var s=e.fn.dropdown;e.fn.dropdown=function(t){return this.each(function(){var r=e(this),i=r.data("dropdown");i||r.data("dropdown",i=new n(this)),typeof t=="string"&&i[t].call(r)})},e.fn.dropdown.Constructor=n,e.fn.dropdown.noConflict=function(){return e.fn.dropdown=s,this},e(document).on("click.dropdown.data-api",r).on("click.dropdown.data-api",".dropdown form",function(e){e.stopPropagation()}).on("click.dropdown-menu",function(e){e.stopPropagation()}).on("click.dropdown.data-api",t,n.prototype.toggle).on("keydown.dropdown.data-api",t+", [role=menu]",n.prototype.keydown)}(window.jQuery),!function(e){"use strict";var t=function(t,n){this.options=n,this.$element=e(t).delegate('[data-dismiss="modal"]',"click.dismiss.modal",e.proxy(this.hide,this)),this.options.remote&&this.$element.find(".modal-body").load(this.options.remote)};t.prototype={constructor:t,toggle:function(){return this[this.isShown?"hide":"show"]()},show:function(){var t=this,n=e.Event("show");this.$element.trigger(n);if(this.isShown||n.isDefaultPrevented())return;this.isShown=!0,this.escape(),this.backdrop(function(){var n=e.support.transition&&t.$element.hasClass("fade");t.$element.parent().length||t.$element.appendTo(document.body),t.$element.show(),n&&t.$element[0].offsetWidth,t.$element.addClass("in").attr("aria-hidden",!1),t.enforceFocus(),n?t.$element.one(e.support.transition.end,function(){t.$element.focus().trigger("shown")}):t.$element.focus().trigger("shown")})},hide:function(t){t&&t.preventDefault();var n=this;t=e.Event("hide"),this.$element.trigger(t);if(!this.isShown||t.isDefaultPrevented())return;this.isShown=!1,this.escape(),e(document).off("focusin.modal"),this.$element.removeClass("in").attr("aria-hidden",!0),e.support.transition&&this.$element.hasClass("fade")?this.hideWithTransition():this.hideModal()},enforceFocus:function(){var t=this;e(document).on("focusin.modal",function(e){t.$element[0]!==e.target&&!t.$element.has(e.target).length&&t.$element.focus()})},escape:function(){var e=this;this.isShown&&this.options.keyboard?this.$element.on("keyup.dismiss.modal",function(t){t.which==27&&e.hide()}):this.isShown||this.$element.off("keyup.dismiss.modal")},hideWithTransition:function(){var t=this,n=setTimeout(function(){t.$element.off(e.support.transition.end),t.hideModal()},500);this.$element.one(e.support.transition.end,function(){clearTimeout(n),t.hideModal()})},hideModal:function(){var e=this;this.$element.hide(),this.backdrop(function(){e.removeBackdrop(),e.$element.trigger("hidden")})},removeBackdrop:function(){this.$backdrop&&this.$backdrop.remove(),this.$backdrop=null},backdrop:function(t){var n=this,r=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var i=e.support.transition&&r;this.$backdrop=e('<div class="modal-backdrop '+r+'" />').appendTo(document.body),this.$backdrop.click(this.options.backdrop=="static"?e.proxy(this.$element[0].focus,this.$element[0]):e.proxy(this.hide,this)),i&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in");if(!t)return;i?this.$backdrop.one(e.support.transition.end,t):t()}else!this.isShown&&this.$backdrop?(this.$backdrop.removeClass("in"),e.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one(e.support.transition.end,t):t()):t&&t()}};var n=e.fn.modal;e.fn.modal=function(n){return this.each(function(){var r=e(this),i=r.data("modal"),s=e.extend({},e.fn.modal.defaults,r.data(),typeof n=="object"&&n);i||r.data("modal",i=new t(this,s)),typeof n=="string"?i[n]():s.show&&i.show()})},e.fn.modal.defaults={backdrop:!0,keyboard:!0,show:!0},e.fn.modal.Constructor=t,e.fn.modal.noConflict=function(){return e.fn.modal=n,this},e(document).on("click.modal.data-api",'[data-toggle="modal"]',function(t){var n=e(this),r=n.attr("href"),i=e(n.attr("data-target")||r&&r.replace(/.*(?=#[^\s]+$)/,"")),s=i.data("modal")?"toggle":e.extend({remote:!/#/.test(r)&&r},i.data(),n.data());t.preventDefault(),i.modal(s).one("hide",function(){n.focus()})})}(window.jQuery),!function(e){"use strict";var t=function(e,t){this.init("tooltip",e,t)};t.prototype={constructor:t,init:function(t,n,r){var i,s,o,u,a;this.type=t,this.$element=e(n),this.options=this.getOptions(r),this.enabled=!0,o=this.options.trigger.split(" ");for(a=o.length;a--;)u=o[a],u=="click"?this.$element.on("click."+this.type,this.options.selector,e.proxy(this.toggle,this)):u!="manual"&&(i=u=="hover"?"mouseenter":"focus",s=u=="hover"?"mouseleave":"blur",this.$element.on(i+"."+this.type,this.options.selector,e.proxy(this.enter,this)),this.$element.on(s+"."+this.type,this.options.selector,e.proxy(this.leave,this)));this.options.selector?this._options=e.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},getOptions:function(t){return t=e.extend({},e.fn[this.type].defaults,this.$element.data(),t),t.delay&&typeof t.delay=="number"&&(t.delay={show:t.delay,hide:t.delay}),t},enter:function(t){var n=e.fn[this.type].defaults,r={},i;this._options&&e.each(this._options,function(e,t){n[e]!=t&&(r[e]=t)},this),i=e(t.currentTarget)[this.type](r).data(this.type);if(!i.options.delay||!i.options.delay.show)return i.show();clearTimeout(this.timeout),i.hoverState="in",this.timeout=setTimeout(function(){i.hoverState=="in"&&i.show()},i.options.delay.show)},leave:function(t){var n=e(t.currentTarget)[this.type](this._options).data(this.type);this.timeout&&clearTimeout(this.timeout);if(!n.options.delay||!n.options.delay.hide)return n.hide();n.hoverState="out",this.timeout=setTimeout(function(){n.hoverState=="out"&&n.hide()},n.options.delay.hide)},show:function(){var t,n,r,i,s,o,u=e.Event("show");if(this.hasContent()&&this.enabled){this.$element.trigger(u);if(u.isDefaultPrevented())return;t=this.tip(),this.setContent(),this.options.animation&&t.addClass("fade"),s=typeof this.options.placement=="function"?this.options.placement.call(this,t[0],this.$element[0]):this.options.placement,t.detach().css({top:0,left:0,display:"block"}),this.options.container?t.appendTo(this.options.container):t.insertAfter(this.$element),n=this.getPosition(),r=t[0].offsetWidth,i=t[0].offsetHeight;switch(s){case"bottom":o={top:n.top+n.height,left:n.left+n.width/2-r/2};break;case"top":o={top:n.top-i,left:n.left+n.width/2-r/2};break;case"left":o={top:n.top+n.height/2-i/2,left:n.left-r};break;case"right":o={top:n.top+n.height/2-i/2,left:n.left+n.width}}this.applyPlacement(o,s),this.$element.trigger("shown")}},applyPlacement:function(e,t){var n=this.tip(),r=n[0].offsetWidth,i=n[0].offsetHeight,s,o,u,a;n.offset(e).addClass(t).addClass("in"),s=n[0].offsetWidth,o=n[0].offsetHeight,t=="top"&&o!=i&&(e.top=e.top+i-o,a=!0),t=="bottom"||t=="top"?(u=0,e.left<0&&(u=e.left*-2,e.left=0,n.offset(e),s=n[0].offsetWidth,o=n[0].offsetHeight),this.replaceArrow(u-r+s,s,"left")):this.replaceArrow(o-i,o,"top"),a&&n.offset(e)},replaceArrow:function(e,t,n){this.arrow().css(n,e?50*(1-e/t)+"%":"")},setContent:function(){var e=this.tip(),t=this.getTitle();e.find(".tooltip-inner")[this.options.html?"html":"text"](t),e.removeClass("fade in top bottom left right")},hide:function(){function i(){var t=setTimeout(function(){n.off(e.support.transition.end).detach()},500);n.one(e.support.transition.end,function(){clearTimeout(t),n.detach()})}var t=this,n=this.tip(),r=e.Event("hide");this.$element.trigger(r);if(r.isDefaultPrevented())return;return n.removeClass("in"),e.support.transition&&this.$tip.hasClass("fade")?i():n.detach(),this.$element.trigger("hidden"),this},fixTitle:function(){var e=this.$element;(e.attr("title")||typeof e.attr("data-original-title")!="string")&&e.attr("data-original-title",e.attr("title")||"").attr("title","")},hasContent:function(){return this.getTitle()},getPosition:function(){var t=this.$element[0];return e.extend({},typeof t.getBoundingClientRect=="function"?t.getBoundingClientRect():{width:t.offsetWidth,height:t.offsetHeight},this.$element.offset())},getTitle:function(){var e,t=this.$element,n=this.options;return e=t.attr("data-original-title")||(typeof n.title=="function"?n.title.call(t[0]):n.title),e},tip:function(){return this.$tip=this.$tip||e(this.options.template)},arrow:function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},validate:function(){this.$element[0].parentNode||(this.hide(),this.$element=null,this.options=null)},enable:function(){this.enabled=!0},disable:function(){this.enabled=!1},toggleEnabled:function(){this.enabled=!this.enabled},toggle:function(t){var n=t?e(t.currentTarget)[this.type](this._options).data(this.type):this;n.tip().hasClass("in")?n.hide():n.show()},destroy:function(){this.hide().$element.off("."+this.type).removeData(this.type)}};var n=e.fn.tooltip;e.fn.tooltip=function(n){return this.each(function(){var r=e(this),i=r.data("tooltip"),s=typeof n=="object"&&n;i||r.data("tooltip",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.tooltip.Constructor=t,e.fn.tooltip.defaults={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1},e.fn.tooltip.noConflict=function(){return e.fn.tooltip=n,this}}(window.jQuery),!function(e){"use strict";var t=function(e,t){this.init("popover",e,t)};t.prototype=e.extend({},e.fn.tooltip.Constructor.prototype,{constructor:t,setContent:function(){var e=this.tip(),t=this.getTitle(),n=this.getContent();e.find(".popover-title")[this.options.html?"html":"text"](t),e.find(".popover-content")[this.options.html?"html":"text"](n),e.removeClass("fade top bottom left right in")},hasContent:function(){return this.getTitle()||this.getContent()},getContent:function(){var e,t=this.$element,n=this.options;return e=(typeof n.content=="function"?n.content.call(t[0]):n.content)||t.attr("data-content"),e},tip:function(){return this.$tip||(this.$tip=e(this.options.template)),this.$tip},destroy:function(){this.hide().$element.off("."+this.type).removeData(this.type)}});var n=e.fn.popover;e.fn.popover=function(n){return this.each(function(){var r=e(this),i=r.data("popover"),s=typeof n=="object"&&n;i||r.data("popover",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.popover.Constructor=t,e.fn.popover.defaults=e.extend({},e.fn.tooltip.defaults,{placement:"right",trigger:"click",content:"",template:'<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),e.fn.popover.noConflict=function(){return e.fn.popover=n,this}}(window.jQuery),!function(e){"use strict";function t(t,n){var r=e.proxy(this.process,this),i=e(t).is("body")?e(window):e(t),s;this.options=e.extend({},e.fn.scrollspy.defaults,n),this.$scrollElement=i.on("scroll.scroll-spy.data-api",r),this.selector=(this.options.target||(s=e(t).attr("href"))&&s.replace(/.*(?=#[^\s]+$)/,"")||"")+" .nav li > a",this.$body=e("body"),this.refresh(),this.process()}t.prototype={constructor:t,refresh:function(){var t=this,n;this.offsets=e([]),this.targets=e([]),n=this.$body.find(this.selector).map(function(){var n=e(this),r=n.data("target")||n.attr("href"),i=/^#\w/.test(r)&&e(r);return i&&i.length&&[[i.position().top+(!e.isWindow(t.$scrollElement.get(0))&&t.$scrollElement.scrollTop()),r]]||null}).sort(function(e,t){return e[0]-t[0]}).each(function(){t.offsets.push(this[0]),t.targets.push(this[1])})},process:function(){var e=this.$scrollElement.scrollTop()+this.options.offset,t=this.$scrollElement[0].scrollHeight||this.$body[0].scrollHeight,n=t-this.$scrollElement.height(),r=this.offsets,i=this.targets,s=this.activeTarget,o;if(e>=n)return s!=(o=i.last()[0])&&this.activate(o);for(o=r.length;o--;)s!=i[o]&&e>=r[o]&&(!r[o+1]||e<=r[o+1])&&this.activate(i[o])},activate:function(t){var n,r;this.activeTarget=t,e(this.selector).parent(".active").removeClass("active"),r=this.selector+'[data-target="'+t+'"],'+this.selector+'[href="'+t+'"]',n=e(r).parent("li").addClass("active"),n.parent(".dropdown-menu").length&&(n=n.closest("li.dropdown").addClass("active")),n.trigger("activate")}};var n=e.fn.scrollspy;e.fn.scrollspy=function(n){return this.each(function(){var r=e(this),i=r.data("scrollspy"),s=typeof n=="object"&&n;i||r.data("scrollspy",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.scrollspy.Constructor=t,e.fn.scrollspy.defaults={offset:10},e.fn.scrollspy.noConflict=function(){return e.fn.scrollspy=n,this},e(window).on("load",function(){e('[data-spy="scroll"]').each(function(){var t=e(this);t.scrollspy(t.data())})})}(window.jQuery),!function(e){"use strict";var t=function(t){this.element=e(t)};t.prototype={constructor:t,show:function(){var t=this.element,n=t.closest("ul:not(.dropdown-menu)"),r=t.attr("data-target"),i,s,o;r||(r=t.attr("href"),r=r&&r.replace(/.*(?=#[^\s]*$)/,""));if(t.parent("li").hasClass("active"))return;i=n.find(".active:last a")[0],o=e.Event("show",{relatedTarget:i}),t.trigger(o);if(o.isDefaultPrevented())return;s=e(r),this.activate(t.parent("li"),n),this.activate(s,s.parent(),function(){t.trigger({type:"shown",relatedTarget:i})})},activate:function(t,n,r){function o(){i.removeClass("active").find("> .dropdown-menu > .active").removeClass("active"),t.addClass("active"),s?(t[0].offsetWidth,t.addClass("in")):t.removeClass("fade"),t.parent(".dropdown-menu")&&t.closest("li.dropdown").addClass("active"),r&&r()}var i=n.find("> .active"),s=r&&e.support.transition&&i.hasClass("fade");s?i.one(e.support.transition.end,o):o(),i.removeClass("in")}};var n=e.fn.tab;e.fn.tab=function(n){return this.each(function(){var r=e(this),i=r.data("tab");i||r.data("tab",i=new t(this)),typeof n=="string"&&i[n]()})},e.fn.tab.Constructor=t,e.fn.tab.noConflict=function(){return e.fn.tab=n,this},e(document).on("click.tab.data-api",'[data-toggle="tab"], [data-toggle="pill"]',function(t){t.preventDefault(),e(this).tab("show")})}(window.jQuery),!function(e){"use strict";var t=function(t,n){this.$element=e(t),this.options=e.extend({},e.fn.typeahead.defaults,n),this.matcher=this.options.matcher||this.matcher,this.sorter=this.options.sorter||this.sorter,this.highlighter=this.options.highlighter||this.highlighter,this.updater=this.options.updater||this.updater,this.source=this.options.source,this.$menu=e(this.options.menu),this.shown=!1,this.listen()};t.prototype={constructor:t,select:function(){var e=this.$menu.find(".active").attr("data-value");return this.$element.val(this.updater(e)).change(),this.hide()},updater:function(e){return e},show:function(){var t=e.extend({},this.$element.position(),{height:this.$element[0].offsetHeight});return this.$menu.insertAfter(this.$element).css({top:t.top+t.height,left:t.left}).show(),this.shown=!0,this},hide:function(){return this.$menu.hide(),this.shown=!1,this},lookup:function(t){var n;return this.query=this.$element.val(),!this.query||this.query.length<this.options.minLength?this.shown?this.hide():this:(n=e.isFunction(this.source)?this.source(this.query,e.proxy(this.process,this)):this.source,n?this.process(n):this)},process:function(t){var n=this;return t=e.grep(t,function(e){return n.matcher(e)}),t=this.sorter(t),t.length?this.render(t.slice(0,this.options.items)).show():this.shown?this.hide():this},matcher:function(e){return~e.toLowerCase().indexOf(this.query.toLowerCase())},sorter:function(e){var t=[],n=[],r=[],i;while(i=e.shift())i.toLowerCase().indexOf(this.query.toLowerCase())?~i.indexOf(this.query)?n.push(i):r.push(i):t.push(i);return t.concat(n,r)},highlighter:function(e){var t=this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&");return e.replace(new RegExp("("+t+")","ig"),function(e,t){return"<strong>"+t+"</strong>"})},render:function(t){var n=this;return t=e(t).map(function(t,r){return t=e(n.options.item).attr("data-value",r),t.find("a").html(n.highlighter(r)),t[0]}),t.first().addClass("active"),this.$menu.html(t),this},next:function(t){var n=this.$menu.find(".active").removeClass("active"),r=n.next();r.length||(r=e(this.$menu.find("li")[0])),r.addClass("active")},prev:function(e){var t=this.$menu.find(".active").removeClass("active"),n=t.prev();n.length||(n=this.$menu.find("li").last()),n.addClass("active")},listen:function(){this.$element.on("focus",e.proxy(this.focus,this)).on("blur",e.proxy(this.blur,this)).on("keypress",e.proxy(this.keypress,this)).on("keyup",e.proxy(this.keyup,this)),this.eventSupported("keydown")&&this.$element.on("keydown",e.proxy(this.keydown,this)),this.$menu.on("click",e.proxy(this.click,this)).on("mouseenter","li",e.proxy(this.mouseenter,this)).on("mouseleave","li",e.proxy(this.mouseleave,this))},eventSupported:function(e){var t=e in this.$element;return t||(this.$element.setAttribute(e,"return;"),t=typeof this.$element[e]=="function"),t},move:function(e){if(!this.shown)return;switch(e.keyCode){case 9:case 13:case 27:e.preventDefault();break;case 38:e.preventDefault(),this.prev();break;case 40:e.preventDefault(),this.next()}e.stopPropagation()},keydown:function(t){this.suppressKeyPressRepeat=~e.inArray(t.keyCode,[40,38,9,13,27]),this.move(t)},keypress:function(e){if(this.suppressKeyPressRepeat)return;this.move(e)},keyup:function(e){switch(e.keyCode){case 40:case 38:case 16:case 17:case 18:break;case 9:case 13:if(!this.shown)return;this.select();break;case 27:if(!this.shown)return;this.hide();break;default:this.lookup()}e.stopPropagation(),e.preventDefault()},focus:function(e){this.focused=!0},blur:function(e){this.focused=!1,!this.mousedover&&this.shown&&this.hide()},click:function(e){e.stopPropagation(),e.preventDefault(),this.select(),this.$element.focus()},mouseenter:function(t){this.mousedover=!0,this.$menu.find(".active").removeClass("active"),e(t.currentTarget).addClass("active")},mouseleave:function(e){this.mousedover=!1,!this.focused&&this.shown&&this.hide()}};var n=e.fn.typeahead;e.fn.typeahead=function(n){return this.each(function(){var r=e(this),i=r.data("typeahead"),s=typeof n=="object"&&n;i||r.data("typeahead",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.typeahead.defaults={source:[],items:8,menu:'<ul class="typeahead dropdown-menu"></ul>',item:'<li><a href="#"></a></li>',minLength:1},e.fn.typeahead.Constructor=t,e.fn.typeahead.noConflict=function(){return e.fn.typeahead=n,this},e(document).on("focus.typeahead.data-api",'[data-provide="typeahead"]',function(t){var n=e(this);if(n.data("typeahead"))return;n.typeahead(n.data())})}(window.jQuery),!function(e){"use strict";var t=function(t,n){this.options=e.extend({},e.fn.affix.defaults,n),this.$window=e(window).on("scroll.affix.data-api",e.proxy(this.checkPosition,this)).on("click.affix.data-api",e.proxy(function(){setTimeout(e.proxy(this.checkPosition,this),1)},this)),this.$element=e(t),this.checkPosition()};t.prototype.checkPosition=function(){if(!this.$element.is(":visible"))return;var t=e(document).height(),n=this.$window.scrollTop(),r=this.$element.offset(),i=this.options.offset,s=i.bottom,o=i.top,u="affix affix-top affix-bottom",a;typeof i!="object"&&(s=o=i),typeof o=="function"&&(o=i.top()),typeof s=="function"&&(s=i.bottom()),a=this.unpin!=null&&n+this.unpin<=r.top?!1:s!=null&&r.top+this.$element.height()>=t-s?"bottom":o!=null&&n<=o?"top":!1;if(this.affixed===a)return;this.affixed=a,this.unpin=a=="bottom"?r.top-n:null,this.$element.removeClass(u).addClass("affix"+(a?"-"+a:""))};var n=e.fn.affix;e.fn.affix=function(n){return this.each(function(){var r=e(this),i=r.data("affix"),s=typeof n=="object"&&n;i||r.data("affix",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.affix.Constructor=t,e.fn.affix.defaults={offset:0},e.fn.affix.noConflict=function(){return e.fn.affix=n,this},e(window).on("load",function(){e('[data-spy="affix"]').each(function(){var t=e(this),n=t.data();n.offset=n.offset||{},n.offsetBottom&&(n.offset.bottom=n.offsetBottom),n.offsetTop&&(n.offset.top=n.offsetTop),t.affix(n)})})}(window.jQuery);
//$(window).load(function() {
//accordion.js
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


//functions.js
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

//Проверка биты картинок.
// imf.js
$( document ).ready(function() {
  function img_load_finish(){
    data=this;
    if(data.type==0) {
      data.img.attr('src', data.src);
    }else{
      data.img.css('background-image', 'url('+data.src+')');
      data.img.removeClass('no_ava');
    }
  }

  //тест лого магазина
  imgs=$('section:not(.navigation)').find('.logo img');
  for (var i=0;i<imgs.length;i++){
    img=imgs.eq(i);
    src=img.attr('src');
    img.attr('src','/images/template-logo.jpg');
    data={
      src:src,
      img:img,
      type:0 // для img[src]
    };
    image=$('<img/>',{
      src:src
    }).on('load',img_load_finish.bind(data))
  }

  //тест аватарок в коментариях
  imgs=$('.comment-photo');
  for (var i=0;i<imgs.length;i++){
    img=imgs.eq(i);
    if(img.hasClass('no_ava')){
      continue;
    }

    var src=img.css('background-image');
    src=src.replace('url("','');
    src=src.replace('")','');
    img.addClass('no_ava');

    img.css('background-image','url(/images/no_ava.png)');
    data={
      src:src,
      img:img,
      type:1 // для фоновых картинок
    };
    image=$('<img/>',{
      src:src
    }).on('load',img_load_finish.bind(data))
  }
});

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


//forms.js
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

// $('[data-toggle="tooltip"]').tooltip({
//   delay: {
//     show: 500, hide: 2000
//   }
// });

// $('[data-toggle="tooltip"]').on('click',function (e) {
//   $this=$(this);
//   if($this.closest('ul').hasClass('paginate')) {
//     //для пагинации ссылка должна работать
//     return true;
//   }
//   if($this.hasClass('workHref')){
//     //Если ссылка помеченна как рабочая то нужно переходить
//     return true;
//   }
//   e.preventDefault();
//   return false;
// });


$('.ajax-action').click(function(e) {
  e.preventDefault();
  var status = $(this).data('value');
  var href = $(this).attr('href');
  var ids = $('#grid-ajax-action').yiiGridView('getSelectedRows');
  if (ids.length > 0) {
    if (!confirm('Подтвердите изменение записей')) {
      return null;
    }
    $.ajax({
      url: href,
      type: 'post',
      dataType: 'json',
      data: {
        status: status,
        id: ids
      }
    }).done(function(data) {
      $('#grid-ajax-action').yiiGridView("applyFilter");
      if (data.error != false) {
          notification.notifi({message:'Произошла ошибка!',type:'err'})
      } else {
          notification.notifi({message:'Операция выполнена!',type:'success'})
      }

    }).fail(function(data){
      notification.notifi({message:'Произошла ошибка!',type:'err'})
    });
  } else {
    notification.notifi({message:'Необходимо выбрать элементы!',type:'err'})
  }
});

$( document ).ready(function() {
  $('.editible[disabled]').on('click',function () {
    $(this).prop('disabled', false)
  })

  $('.editible[disabled]').on('mousedown',function () {
    $(this).prop('disabled', false)
  })

  btn='<button class=unlock><i class="fa fa-unlock fa-4" aria-hidden="true"></i></button>';
  btn=$(btn);
  btn.on('click',function (e) {
    e.preventDefault();
    $this=$(this);
    inp=$this.prev();
    inp.prop('disabled', false);
    return false;
  });
  $('.editible[disabled]').after(btn)
});

$(function() {
  var menu = {
    control: {
      headerStoresMenu: $("#top").find(".submenu-handl"),
      storesSubmenus: $("#top").find(".submenu-handl").find(".submenu"),
      events: function() {
        var self = this;
        self.headerStoresMenu.hover(function() {
          var submenu = $(this).find('.submenu');
          if($(window).width() > 991) {
            clearTimeout(self.storeHide);
            self.storesSubmenus.css("display", "none");
            self.storeShow = setTimeout(function() {
              submenu.clearQueue();
              submenu.css("display", "block").animate({"opacity": 1}, 350);
              // self.storesSubmenu.clearQueue();
              // self.storesSubmenu.css("display", "block").animate({"opacity": 1}, 350);
            }, 200);
          }
        }, function() {
          var submenu = $(this).find('.submenu');
          if($(window).width() > 991) {
            clearTimeout(self.storeShow);
            self.storeHide = setTimeout(function() {
              submenu.clearQueue();
              submenu.animate({"opacity": 0}, 200, function() {
                $(this).css("display", "none");
              });
              // self.storesSubmenu.clearQueue();
              // self.storesSubmenu.animate({"opacity": 0}, 200, function() {
              //     $(this).css("display", "none");
              // });
            }, 300);
          }
        });
      }
    }
  };
  menu.control.events();
});

//что б ифреймы и картинки не вылазили
//img.js
$( document ).ready(function() {
  /*m_w = $('.text-content').width()
  if (m_w < 50)m_w = screen.width - 40*/
  var mw=screen.width-40;

  function optimase(el){
    var parent = el.parent();
    if(parent.length==0 || parent[0].tagName=="A"){
      return;
    }
    m_w = parent.width()-30;
    var w=el.width();
    el.width('auto');
    if(el[0].tagName=="IMG" && w>el.width())w=el.width();

    if (mw>50 && m_w > mw)m_w = mw;
    if (w>m_w > m_w) {
      if(el[0].tagName=="IFRAME"){
        k = w / m_w;
        el.height(el.height() / k);
      }
      el.width(m_w)
    }else{
      el.width(w);
    }
  }

  function img_load_finish(){
    var el=$(this);
    optimase(el);
  }

  var p = $('.container img,.container iframe');
  $('.container img').height('auto');
  //$('.container img').width('auto');
  for (i = 0; i < p.length; i++) {
    el = p.eq(i);
    if(el[0].tagName=="IFRAME") {
      optimase(el);
    }else{
      var src=el.attr('src');
      image = $('<img/>', {
        src: src
      });
      image.on('load', img_load_finish.bind(el));

    }
  }
});

//если открыто как дочернее
//parents_open_windows.js
(function(){
  if(!window.opener)return;
  if(document.referrer.indexOf('secretdiscounter')<0)return;

  href=window.opener.location.href;
  if(
    href.indexOf('socials')>0 ||
    href.indexOf('login')>0 ||
    href.indexOf('admin')>0 ||
    href.indexOf('account')>0
  ){
    return;
  }
  if(href.indexOf('store')>0 || href.indexOf('coupon')>0 || href.indexOf('settings')>0){
    window.opener.location.reload();
  }else{
    window.opener.location.href=location.href;
  }
  window.close();
})();

//img.js
(function() {

  function img_load_finish(){
    var data=this;
    var img = data.img;
    img.wrap('<div class="download"></div>');
    var wrap=img.parent();
    $('body').append(data.el);
    size=data.el.width()+"x"+data.el.height();
    data.el.remove();
    wrap.append('<span>'+size+'</span> <a href="'+data.src+'" download>Скачать</a>')
  }

  var imgs = $('.downloads_img img');
  for(var i=0;i<imgs.length;i++) {
    var img=imgs.eq(i);
    var src=img.attr('src');
    image = $('<img/>', {
      src: src
    });
    data = {
      src: src,
      img: img,
      el:image
    };
    image.on('load', img_load_finish.bind(data))
  }
})();
var notification = (function () {
  var conteiner;
  var mouseOver = 0;
  var timerClearAll = null;
  var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
  var time = 10000;

  var notification_box = false;
  var is_init = false;
  var confirm_opt = {
    // title: lg('deleting'),
    // question: lg('are_you_sure_to_delete'),
    // buttonYes: lg('yes'),
    // buttonNo: lg('no'),
    callbackYes: false,
    callbackNo: false,
    obj: false,
    buttonTag: 'div',
    buttonYesDop: '',
    buttonNoDop: ''
  };
  var alert_opt = {
    title: "",
    question: 'message',
    // buttonYes: lg('yes'),
    callbackYes: false,
    buttonTag: 'div',
    obj: false
  };

  function testIphone() {
    if (!/(iPhone|iPad|iPod).*(OS 11)/.test(navigator.userAgent)) return;
    notification_box.css('position', 'absolute');
    notification_box.css('top', $(document).scrollTop());
  }

  function init() {
    is_init = true;
    notification_box = $('.notification_box');
    if (notification_box.length > 0)return;

    $('body').append("<div class='notification_box'></div>");
    notification_box = $('.notification_box');

    notification_box.on('click', '.notify_control', closeModal);
    notification_box.on('click', '.notify_close', closeModal);
    notification_box.on('click', closeModalFon);
  }

  function closeModal() {
    $('html').removeClass('show_notifi');
    $('.notification_box .notify_content').html('');
  }

  function closeModalFon(e) {
    var target = e.target || e.srcElement;
    if (target.className == "notification_box") {
      closeModal();
    }
  }

  var _setUpListeners = function () {
    $('body').on('click', '.notification_close', _closePopup);
    $('body').on('mouseenter', '.notification_container', _onEnter);
    $('body').on('mouseleave', '.notification_container', _onLeave);
  };

  var _onEnter = function (event) {
    if (event)event.preventDefault();
    if (timerClearAll != null) {
      clearTimeout(timerClearAll);
      timerClearAll = null;
    }
    conteiner.find('.notification_item').each(function (i) {
      var option = $(this).data('option');
      if (option.timer) {
        clearTimeout(option.timer);
      }
    });
    mouseOver = 1;
  };

  var _onLeave = function () {
    conteiner.find('.notification_item').each(function (i) {
      $this = $(this);
      var option = $this.data('option');
      if (option.time > 0) {
        option.timer = setTimeout(_closePopup.bind(option.close), option.time - 1500 + 100 * i);
        $this.data('option', option)
      }
    });
    mouseOver = 0;
  };

  var _closePopup = function (event) {
    if (event)event.preventDefault();

    var $this = $(this).parent();
    $this.on(animationEnd, function () {
      $(this).remove();
    });
    $this.addClass('notification_hide')
  };

  function alert(data) {
    if (!data)data = {};
    alert_opt = objects(alert_opt, {
        buttonYes: lg('yes')
    });
    data = objects(alert_opt, data);

    if (!is_init)init();
    testIphone();

    notyfy_class = 'notify_box ';
    if (data.notyfy_class)notyfy_class += data.notyfy_class;

    box_html = '<div class="' + notyfy_class + '">';
    box_html += '<div class="notify_title">';
    box_html += data.title;
    box_html += '<span class="notify_close"></span>';
    box_html += '</div>';

    box_html += '<div class="notify_content">';
    box_html += data.question;
    box_html += '</div>';

    if (data.buttonYes || data.buttonNo) {
      box_html += '<div class="notify_control">';
      if (data.buttonYes)box_html += '<' + data.buttonTag + ' class="notify_btn_yes" ' + data.buttonYesDop + '>' + data.buttonYes + '</' + data.buttonTag + '>';
      if (data.buttonNo)box_html += '<' + data.buttonTag + ' class="notify_btn_no" ' + data.buttonNoDop + '>' + data.buttonNo + '</' + data.buttonTag + '>';
      box_html += '</div>';
    }

    box_html += '</div>';
    notification_box.html(box_html);


    setTimeout(function () {
      $('html').addClass('show_notifi');
    }, 100)
  }

  function confirm(data) {
    if (!data)data = {};
    confirm_opt = objects(confirm_opt, {
        title: lg('deleting'),
        question: lg('are_you_sure_to_delete'),
        buttonYes: lg('yes'),
        buttonNo: lg('no')
    });
    data = objects(confirm_opt, data);
    if (typeof(data.callbackYes) == 'string') {
      var code = 'data.callbackYes = function(){'+data.callbackYes+'}';
      eval(code);
    }

    if (!is_init)init();
    testIphone();
    //box_html='<div class="notify_box">';

    notyfy_class = 'notify_box ';
    if (data.notyfy_class)notyfy_class += data.notyfy_class;

    box_html = '<div class="' + notyfy_class + '">';

    box_html += '<div class="notify_title">';
    box_html += data.title;
    box_html += '<span class="notify_close"></span>';
    box_html += '</div>';

    box_html += '<div class="notify_content">';
    box_html += data.question;
    box_html += '</div>';

    if (data.buttonYes || data.buttonNo) {
      box_html += '<div class="notify_control">';
      if (data.buttonYes)box_html += '<div class="notify_btn_yes">' + data.buttonYes + '</div>';
      if (data.buttonNo)box_html += '<div class="notify_btn_no">' + data.buttonNo + '</div>';
      box_html += '</div>';
    }

    box_html += '</div>';
    notification_box.html(box_html);

    if (data.callbackYes != false) {
      notification_box.find('.notify_btn_yes').on('click', data.callbackYes.bind(data.obj));
    }
    if (data.callbackNo != false) {
      notification_box.find('.notify_btn_no').on('click', data.callbackNo.bind(data.obj));
    }

    setTimeout(function () {
      $('html').addClass('show_notifi');
    }, 100)

  }

  function notifi(data) {
    if (!data)data = {};
    var option = {time: (data.time || data.time === 0) ? data.time : time};
    if (!conteiner) {
      conteiner = $('<ul/>', {
        'class': 'notification_container'
      });

      $('body').append(conteiner);
      _setUpListeners();
    }

    var li = $('<li/>', {
      class: 'notification_item'
    });

    if (data.type) {
      li.addClass('notification_item-' + data.type);
    }

    var close = $('<span/>', {
      class: 'notification_close'
    });
    option.close = close;
    li.append(close);

    var content = $('<div/>', {
      class: "notification_content"
    });

    if (data.title && data.title.length > 0) {
      var title = $('<h5/>', {
        class: "notification_title"
      });
      title.html(data.title);
      content.append(title);
    }

    var text = $('<div/>', {
      class: "notification_text"
    });
    text.html(data.message);

    if (data.img && data.img.length > 0) {
      var img = $('<div/>', {
        class: "notification_img"
      });
      img.css('background-image', 'url(' + data.img + ')');
      var wrap = $('<div/>', {
        class: "wrap"
      });

      wrap.append(img);
      wrap.append(text);
      content.append(wrap);
    } else {
      content.append(text);
    }
    li.append(content);

    //
    // if(data.title && data.title.length>0) {
    //   var title = $('<p/>', {
    //     class: "notification_title"
    //   });
    //   title.html(data.title);
    //   li.append(title);
    // }
    //
    // if(data.img && data.img.length>0) {
    //   var img = $('<div/>', {
    //     class: "notification_img"
    //   });
    //   img.css('background-image','url('+data.img+')');
    //   li.append(img);
    // }
    //
    // var content = $('<div/>',{
    //   class:"notification_content"
    // });
    // content.html(data.message);
    //
    // li.append(content);
    //
    conteiner.append(li);

    if (option.time > 0) {
      option.timer = setTimeout(_closePopup.bind(close), option.time);
    }
    li.data('option', option)
  }

  return {
    alert: alert,
    confirm: confirm,
    notifi: notifi
  };

})();


$('[ref=popup]').on('click', function (e) {
  e.preventDefault();
  $this = $(this);
  el = $($this.attr('href'));
  data = el.data();

  data.question = el.html();
  notification.alert(data);
});

$('[ref=confirm]').on('click', function (e) {
  e.preventDefault();
  $this = $(this);
  el = $($this.attr('href'));
  data = el.data();
  data.question = el.html();
  notification.confirm(data);
});


$('.disabled').on('click', function (e) {
  e.preventDefault();
  $this = $(this);
  data = $this.data();
  if (data['button_yes']) {
    data['buttonYes'] = data['button_yes'];
  }
  if (data['button_yes'] === false) {
    data['buttonYes'] = false;
  }

  notification.alert(data);
});
function ajaxForm(els) {
  var fileApi = window.File && window.FileReader && window.FileList && window.Blob ? true : false;
  var defaults = {
    error_class: '.has-error'
  };
  var last_post = false;

  function onPost(post) {
    last_post = +new Date();
    //console.log(post, this);
    var data = this;
    var form = data.form;
    var wrap = data.wrap;
    var wrap_html = data.wrap_html;

    if (post.render) {
      post.notyfy_class = "notify_white";
      notification.alert(post);
    } else {
      wrap.removeClass('loading');
      form.removeClass('loading');
      if (post.html) {
        wrap.html(post.html);
        ajaxForm(wrap);
      } else {
        if (!post.error) {
          form.removeClass('loading');
          wrap.html(wrap_html);
          form.find('input[type=text],textarea').val('');
          ajaxForm(wrap);
        }
      }
    }

    if (typeof post.error === "object") {
      for (var index in post.error) {
        notification.notifi({
          'type': 'err',
          'title': post.title ? post.title : lg('error'),
          'message': post.error[index]
        });
      }
    } else if (Array.isArray(post.error)) {
      for (var i = 0; i < post.error.length; i++) {
        notification.notifi({
          'type': 'err',
          'title': post.title ? post.title : lg('error'),
          'message': post.error[i]
        });
      }
    } else {
      if (post.error || post.message) {
        notification.notifi({
          'type': post.error === false ? 'success' : 'err',
          'title': post.title ? post.title : (post.error === false ? lg('success') : lg('error')),
          'message': post.message ? post.message : post.error
        });
      }
    }
    //
    // notification.notifi({
    //     'type': post.error === false ? 'success' : 'err',
    //     'title': post.error === false ? 'Успешно' : 'Ошибка',
    //     'message': Array.isArray(post.error) ? post.error[0] : (post.message ? post.message : post.error)
    // });
  }

  function onFail() {
    last_post = +new Date();
    var data = this;
    var form = data.form;
    var wrap = data.wrap;
    wrap.removeClass('loading');
    wrap.html(
        '<h3>'+lg('sorry_not_expected_error')+'<h3>' +
        lg('it_happens_sometimes')
    );
    ajaxForm(wrap);

  }

  function onSubmit(e) {
    e.preventDefault();
    //e.stopImmediatePropagation();
    //e.stopPropagation();

    var currentTimeMillis = +new Date();
    if (currentTimeMillis - last_post < 1000 * 2) {
      return false;
    }

    last_post = currentTimeMillis;
    var data = this;
    var form = data.form;
    var wrap = data.wrap;
    data.wrap_html=wrap.html();
    var isValid = true;

    //init(wrap);

    if (form.yiiActiveForm) {
      var d = form.data('yiiActiveForm');
      if (d) {
        d.validated = true;
        form.data('yiiActiveForm', d);
        form.yiiActiveForm('validate');
        isValid = d.validated;
      }
    }

    isValid = isValid && (form.find(data.param.error_class).length == 0);

    if (!isValid) {
      return false;
    } else {

      e.stopImmediatePropagation();
      e.stopPropagation();
      var required = form.find('input.required, textarea.required, input[id="support-recaptcha"]');
      for (var i = 0; i < required.length; i++) {
        var helpBlock = required.eq(i).closest('.form-group').find('.help-block');
        var helpMessage = helpBlock && helpBlock.data('message') ? helpBlock.data('message') : lg('required');

        if (required.eq(i).val().length < 1) {
          helpBlock.html(helpMessage);
          isValid = false;
        } else {
          helpBlock.html('');
        }
      }
      if (!isValid) {
        return false;
      }
    }

    if (!form.serializeObject)addSRO();

    var postData = form.serializeObject();
    form.addClass('loading');
    form.html('');
    wrap.html('<div style="text-align:center;"><p>'+lg('sending_data')+'</p></div>');

    data.url += (data.url.indexOf('?') > 0 ? '&' : '?') + 'rc=' + Math.random();
    //console.log(data.url);

    /*if(!postData.returnUrl){
      postData.returnUrl=location.href;
    }*/

    $.post(
      data.url,
      postData,
      onPost.bind(data),
      'json'
    ).fail(onFail.bind(data));

    return false;
  }

  function init(wrap) {
    form = wrap.find('form');
    data = {
      form: form,
      param: defaults,
      wrap: wrap
    };
    data.url = form.attr('action') || location.href;
    data.method = form.attr('method') || 'post';
    form.unbind('submit');
    //form.off('submit');
    form.on('submit', onSubmit.bind(data));
  }

  els.find('[required]')
    .addClass('required')
    .removeAttr('required');


  for (var i = 0; i < els.length; i++) {
    init(els.eq(i));
  }

  if (typeof placeholder == 'function') {
      placeholder();
  }

}

function addSRO() {
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
$('.action_user_confirm').click(function () {
    if (!confirm()){
        return false;
    }
});

//checkboxes времён работы точек продаж, при кликах функционал
var storesPointCheckboxes = $('.b2b-stores-points-form input[type="checkbox"]');

storesPointCheckboxes.click(function() {
    var name = $(this).attr('name');
    var row = $(this).closest('tr');
    // if (name.match(/B2bStoresPoints\[work_time_details\]\[\d*\]\[holiday\]/)) {
    //     checkDisabled(row, this.checked, 'depends-holiday');
    // }
    if (name.match(/B2bStoresPoints\[work_time_details\]\[\d*\]\[24-hour\]/)) {
        checkDisabled(row, this.checked, 'depends-24-hour');
    }
});

//при загрузке проверяем то же, что при клике
$.each(storesPointCheckboxes, function(index, item){
    var name = $(item).attr('name');
    var row = $(item).closest('tr');
    // if (name.match(/B2bStoresPoints\[work_time_details\]\[\d*\]\[holiday\]/) && item.checked) {
    //     checkDisabled(row, true, 'depends-holiday');
    // }
    if (name.match(/B2bStoresPoints\[work_time_details\]\[\d*\]\[24-hour\]/) && item.checked) {
        checkDisabled(row, true, 'depends-24-hour');
    }
});

function  checkDisabled(row, checked, className) {
    //var inputsCheckbox = $(row).find('input[type="checkbox"].'+className);
    var inputsText = $(row).find('input[type="text"].'+className);
    inputsText.val('');
    //inputsCheckbox.attr('checked', false);
    inputsText.attr('disabled', checked);
    //inputsCheckbox.attr('disabled', checked);
}

$('#payments_select_store').on('change', paymentsSelectStore);

function paymentsSelectStore(){
    var self = document.getElementById('payments_select_store'),
        selectPoints = document.getElementById('payments_select_store_point');
    if (self && selectPoints) {
        var points = $('option:selected', self).attr('data-points'),
            getSelectPoint = $(selectPoints).data('get'),
            options = '';
        if (points) {
            points = JSON.parse(points);
            options = '<option></option>';
            points.forEach(function(item){
                options += '<option value="'+item.id+'" '+(parseInt(getSelectPoint) == parseInt(item.id) ? 'selected' : '')+
                    '>'+item.name+', '+item.country+', '+item.city+', '+item.address+'</options>';
            });
        }
        selectPoints.innerHTML = options;
    }

}
paymentsSelectStore();

// b2b платежи - действия с грид
$(".revert-order").on('click', function(e) {
    e.preventDefault();
    var href = '/payments/revoke';
    var ids = $(this).data('id');
    var data={
        buttonYes:false,
        notyfy_class:"notify_white notify_not_big",
        title: 'При отмене платежей нужно указать причину отмены',
        question:
        '<form action="'+href+'" method="post" class="payments-forms revoke_payents_form">'+
        '<input type="hidden" name="ids" id="payments-id" value="'+ids+'"'+'>'+
        '<div class="form-group">'+
        '<input type="text" class="form-control" id="payments-admin-comment" name="admin-comment" placeholder="Введите причину отмены">'+
        '<p class="help-block help-block-error"></p>'+
        '</div>' +
        '<div class="form-group buttons">'+
        '<input type="submit" class="btn btn-primary" value="Отклонить">'+
        '</div>' +
        '<form>'
    };
    notification.alert(data)


});

$(".payments-grid-view .change-order-price").on('click',function(e){
    e.preventDefault();
    var id = $(this).data('id');
    var order_price = $(this).data('orderprice');
    var data={
        buttonYes:false,
        notyfy_class:"notify_white notify_not_big",
        title: 'Изменить сумму покупки',
        question:
        '<form action="/payments/update" method="post" class="payments-forms change_order_price_form">'+
        '<input type="hidden" name="Payments[uid]" id="payments-id" value="'+id+'"'+'>'+
        '<p class="help-block help-block-error"></p>'+
        '<div class="form-group">'+
        '<label>Новая сумма</label>'+
        '<input type="text" class="form-control" id="payments-order_price" name="Payments[order_price]" placeholder="Введите новую сумму" value="'+order_price+'">'+
            '<p class="help-block help-block-error"></p>'+
        '</div>' +
        '<div class="form-group">'+
        '<label>Комментарий</label>'+
        '<input type="text" class="form-control" id="payments-admin-comment" name="Payments[admin-comment]" placeholder="Введите комментарий">'+
        '<p class="help-block help-block-error"></p>'+
        '</div>' +
        '<div class="form-group buttons">'+
        '<input type="submit" class="btn btn-primary" value="Изменить">'+
        '</div>' +
        '<form>'
    };
    notification.alert(data)
});

$(document).on('submit','form.change_order_price_form', function(e){
    e.preventDefault();
    $(this).find('p.help-block').text('');
    var id = $('#payments-id').val();
    var order_price = $('#payments-order_price').val();
    var admin_comment = $('#payments-admin-comment').val();
    if (parseInt(id)<1) {
        $('#payments-id').siblings('p.help-block').text('ID должен быть целым числом');
        return false;
    }
    if (order_price == '') {
        $('#payments-order_price').siblings('p.help-block').text('Введите сумму');
        return false;
    }
    var reg = /^\d*\.?\d*$/;
    if (!order_price.match(reg)) {
        $('#payments-order_price').siblings('p.help-block').html('Введите правильно сумму.<br>Копейки от рублей должны отделяться точкой');
        return false;
    }
    if (admin_comment.length<5 || admin_comment.length>256) {
        $('#payments-admin-comment').siblings('p.help-block').text('Длина комментария должна быть от 5 до 256 символов');
        return false;
    }
    var data = {
        'id' : parseInt(id),
        'order_price' : order_price,
        'admin-comment' : admin_comment
    };
    $.post($(this).attr('action'), data, function(response){
        $('html').removeClass('show_notifi');
        if (response.error == false) {
            // notification.notifi({message: 'Платёж изменён', type:'success'});
            // var row = $('tr[data-key="'+id+'"]');
            // var td_price = $(row).find('.td-order-price');
            // $(td_price).text(response.recalc.order_price+' '+$(td_price).data('cur'));
            // $(row).find('.td-reward').html(response.recalc.reward+' <span class="fa fa-rub"></span>');
            // $(row).find('.td-cashback').html(response.recalc.cashback+' <span class="fa fa-rub"></span>');
            // $(row).find('.change-order-price').attr('data-orderprice', response.recalc.order_price);
            $('#grid-ajax-action').yiiGridView("applyFilter");
        } else {
            notification.notifi({message: 'Произошла ошибка', type:'err'});
        }
    },'json').fail(function (data) {
        $('html').removeClass('show_notifi');
        notification.notifi({message:'Произошла ошибка!', type:'err'})
    });
});

$(document).on('submit','form.revoke_payents_form', function(e){
    e.preventDefault();
    $(this).find('p.help-block').text('');
    var ids = $('#payments-id').val();
    var status = $('#payments-status').val();
    var admin_comment = $('#payments-admin-comment').val();

    if (admin_comment.length<5 || admin_comment.length>256) {
        $('#payments-admin-comment').siblings('p.help-block').text('Длина комментария должна быть от 5 до 256 символов');
        return false;
    }
    var data = {
        'ids' : ids,
        'status' : status,
        'admin-comment' : admin_comment
    };
    $.post($(this).attr('action'), data, function(response){
        $('html').removeClass('show_notifi');
        if (response.error == false) {
            
            $('#grid-ajax-action').yiiGridView("applyFilter");
        } else {
            notification.notifi({message: 'Произошла ошибка', type:'err'});
        }
    },'json').fail(function (data) {
        $('html').removeClass('show_notifi');
        notification.notifi({message:'Произошла ошибка!', type:'err'})
    });
});





//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxhbmd1YWdlLmpzIiwiYm9vdHN0cmFwLm1pbi5qcyIsImZvcl9hbGwuanMiLCJub3RpZmljYXRpb24uanMiLCJqcXVlcnkuYWpheEZvcm0uanMiLCJiMmIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDalhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGxnID0gKGZ1bmN0aW9uKCkge1xyXG4gIHZhciBsYW5nPXt9O1xyXG4gIHVybD0nL2xhbmd1YWdlLycrZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmxhbmcrJy5qc29uJztcclxuICAkLmdldCh1cmwsZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgIC8vY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICBmb3IodmFyIGluZGV4IGluIGRhdGEpIHtcclxuICAgICAgZGF0YVtpbmRleF09Y2xlYXJWYXIoZGF0YVtpbmRleF0pO1xyXG4gICAgfVxyXG4gICAgbGFuZz1kYXRhO1xyXG4gICAgdmFyIGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KFwibGFuZ3VhZ2VfbG9hZGVkXCIpO1xyXG4gICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAvL2NvbnNvbGUubG9nKGRhdGEsIGV2ZW50KTtcclxuICB9LCdqc29uJyk7XHJcblxyXG4gIGZ1bmN0aW9uIGNsZWFyVmFyKHR4dCl7XHJcbiAgICB0eHQ9dHh0LnJlcGxhY2UoL1xccysvZyxcIiBcIik7Ly/Rg9C00LDQu9C10L3QuNC1INC30LDQtNCy0L7QtdC90LjQtSDQv9GA0L7QsdC10LvQvtCyXHJcblxyXG4gICAgLy/Qp9C40YHRgtC40Lwg0L/QvtC00YHRgtCw0LLQu9GP0LXQvNGL0LUg0L/QtdGA0LXQvNC10L3QvdGL0LVcclxuICAgIHN0cj10eHQubWF0Y2goL1xceyguKj8pXFx9L2cpO1xyXG4gICAgaWYgKCBzdHIgIT0gbnVsbCkge1xyXG4gICAgICBmb3IgKCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBzdHJfdD1zdHJbaV0ucmVwbGFjZSgvIC9nLFwiXCIpO1xyXG4gICAgICAgIHR4dD10eHQucmVwbGFjZShzdHJbaV0sc3RyX3QpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHh0O1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGZ1bmN0aW9uKHRwbCwgZGF0YSl7XHJcbiAgICBpZih0eXBlb2YobGFuZ1t0cGxdKT09XCJ1bmRlZmluZWRcIil7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwibGFuZyBub3QgZm91bmQ6IFwiK3RwbCk7XHJcbiAgICAgIHJldHVybiB0cGw7XHJcbiAgICB9XHJcbiAgICB0cGw9bGFuZ1t0cGxdO1xyXG4gICAgaWYodHlwZW9mKGRhdGEpPT1cIm9iamVjdFwiKXtcclxuICAgICAgZm9yKHZhciBpbmRleCBpbiBkYXRhKSB7XHJcbiAgICAgICAgdHBsPXRwbC5zcGxpdChcIntcIitpbmRleCtcIn1cIikuam9pbihkYXRhW2luZGV4XSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0cGw7XHJcbiAgfVxyXG59KSgpOyIsIi8qIVxyXG4qIEJvb3RzdHJhcC5qcyBieSBAZmF0ICYgQG1kb1xyXG4qIENvcHlyaWdodCAyMDEyIFR3aXR0ZXIsIEluYy5cclxuKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjAudHh0XHJcbiovXHJcbiFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjtlKGZ1bmN0aW9uKCl7ZS5zdXBwb3J0LnRyYW5zaXRpb249ZnVuY3Rpb24oKXt2YXIgZT1mdW5jdGlvbigpe3ZhciBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJib290c3RyYXBcIiksdD17V2Via2l0VHJhbnNpdGlvbjpcIndlYmtpdFRyYW5zaXRpb25FbmRcIixNb3pUcmFuc2l0aW9uOlwidHJhbnNpdGlvbmVuZFwiLE9UcmFuc2l0aW9uOlwib1RyYW5zaXRpb25FbmQgb3RyYW5zaXRpb25lbmRcIix0cmFuc2l0aW9uOlwidHJhbnNpdGlvbmVuZFwifSxuO2ZvcihuIGluIHQpaWYoZS5zdHlsZVtuXSE9PXVuZGVmaW5lZClyZXR1cm4gdFtuXX0oKTtyZXR1cm4gZSYme2VuZDplfX0oKX0pfSh3aW5kb3cualF1ZXJ5KSwhZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7dmFyIHQ9J1tkYXRhLWRpc21pc3M9XCJhbGVydFwiXScsbj1mdW5jdGlvbihuKXtlKG4pLm9uKFwiY2xpY2tcIix0LHRoaXMuY2xvc2UpfTtuLnByb3RvdHlwZS5jbG9zZT1mdW5jdGlvbih0KXtmdW5jdGlvbiBzKCl7aS50cmlnZ2VyKFwiY2xvc2VkXCIpLnJlbW92ZSgpfXZhciBuPWUodGhpcykscj1uLmF0dHIoXCJkYXRhLXRhcmdldFwiKSxpO3J8fChyPW4uYXR0cihcImhyZWZcIikscj1yJiZyLnJlcGxhY2UoLy4qKD89I1teXFxzXSokKS8sXCJcIikpLGk9ZShyKSx0JiZ0LnByZXZlbnREZWZhdWx0KCksaS5sZW5ndGh8fChpPW4uaGFzQ2xhc3MoXCJhbGVydFwiKT9uOm4ucGFyZW50KCkpLGkudHJpZ2dlcih0PWUuRXZlbnQoXCJjbG9zZVwiKSk7aWYodC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSlyZXR1cm47aS5yZW1vdmVDbGFzcyhcImluXCIpLGUuc3VwcG9ydC50cmFuc2l0aW9uJiZpLmhhc0NsYXNzKFwiZmFkZVwiKT9pLm9uKGUuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCxzKTpzKCl9O3ZhciByPWUuZm4uYWxlcnQ7ZS5mbi5hbGVydD1mdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHI9ZSh0aGlzKSxpPXIuZGF0YShcImFsZXJ0XCIpO2l8fHIuZGF0YShcImFsZXJ0XCIsaT1uZXcgbih0aGlzKSksdHlwZW9mIHQ9PVwic3RyaW5nXCImJmlbdF0uY2FsbChyKX0pfSxlLmZuLmFsZXJ0LkNvbnN0cnVjdG9yPW4sZS5mbi5hbGVydC5ub0NvbmZsaWN0PWZ1bmN0aW9uKCl7cmV0dXJuIGUuZm4uYWxlcnQ9cix0aGlzfSxlKGRvY3VtZW50KS5vbihcImNsaWNrLmFsZXJ0LmRhdGEtYXBpXCIsdCxuLnByb3RvdHlwZS5jbG9zZSl9KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjt2YXIgdD1mdW5jdGlvbih0LG4pe3RoaXMuJGVsZW1lbnQ9ZSh0KSx0aGlzLm9wdGlvbnM9ZS5leHRlbmQoe30sZS5mbi5idXR0b24uZGVmYXVsdHMsbil9O3QucHJvdG90eXBlLnNldFN0YXRlPWZ1bmN0aW9uKGUpe3ZhciB0PVwiZGlzYWJsZWRcIixuPXRoaXMuJGVsZW1lbnQscj1uLmRhdGEoKSxpPW4uaXMoXCJpbnB1dFwiKT9cInZhbFwiOlwiaHRtbFwiO2UrPVwiVGV4dFwiLHIucmVzZXRUZXh0fHxuLmRhdGEoXCJyZXNldFRleHRcIixuW2ldKCkpLG5baV0ocltlXXx8dGhpcy5vcHRpb25zW2VdKSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZT09XCJsb2FkaW5nVGV4dFwiP24uYWRkQ2xhc3ModCkuYXR0cih0LHQpOm4ucmVtb3ZlQ2xhc3ModCkucmVtb3ZlQXR0cih0KX0sMCl9LHQucHJvdG90eXBlLnRvZ2dsZT1mdW5jdGlvbigpe3ZhciBlPXRoaXMuJGVsZW1lbnQuY2xvc2VzdCgnW2RhdGEtdG9nZ2xlPVwiYnV0dG9ucy1yYWRpb1wiXScpO2UmJmUuZmluZChcIi5hY3RpdmVcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIiksdGhpcy4kZWxlbWVudC50b2dnbGVDbGFzcyhcImFjdGl2ZVwiKX07dmFyIG49ZS5mbi5idXR0b247ZS5mbi5idXR0b249ZnVuY3Rpb24obil7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciByPWUodGhpcyksaT1yLmRhdGEoXCJidXR0b25cIikscz10eXBlb2Ygbj09XCJvYmplY3RcIiYmbjtpfHxyLmRhdGEoXCJidXR0b25cIixpPW5ldyB0KHRoaXMscykpLG49PVwidG9nZ2xlXCI/aS50b2dnbGUoKTpuJiZpLnNldFN0YXRlKG4pfSl9LGUuZm4uYnV0dG9uLmRlZmF1bHRzPXtsb2FkaW5nVGV4dDpcImxvYWRpbmcuLi5cIn0sZS5mbi5idXR0b24uQ29uc3RydWN0b3I9dCxlLmZuLmJ1dHRvbi5ub0NvbmZsaWN0PWZ1bmN0aW9uKCl7cmV0dXJuIGUuZm4uYnV0dG9uPW4sdGhpc30sZShkb2N1bWVudCkub24oXCJjbGljay5idXR0b24uZGF0YS1hcGlcIixcIltkYXRhLXRvZ2dsZV49YnV0dG9uXVwiLGZ1bmN0aW9uKHQpe3ZhciBuPWUodC50YXJnZXQpO24uaGFzQ2xhc3MoXCJidG5cIil8fChuPW4uY2xvc2VzdChcIi5idG5cIikpLG4uYnV0dG9uKFwidG9nZ2xlXCIpfSl9KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjt2YXIgdD1mdW5jdGlvbih0LG4pe3RoaXMuJGVsZW1lbnQ9ZSh0KSx0aGlzLiRpbmRpY2F0b3JzPXRoaXMuJGVsZW1lbnQuZmluZChcIi5jYXJvdXNlbC1pbmRpY2F0b3JzXCIpLHRoaXMub3B0aW9ucz1uLHRoaXMub3B0aW9ucy5wYXVzZT09XCJob3ZlclwiJiZ0aGlzLiRlbGVtZW50Lm9uKFwibW91c2VlbnRlclwiLGUucHJveHkodGhpcy5wYXVzZSx0aGlzKSkub24oXCJtb3VzZWxlYXZlXCIsZS5wcm94eSh0aGlzLmN5Y2xlLHRoaXMpKX07dC5wcm90b3R5cGU9e2N5Y2xlOmZ1bmN0aW9uKHQpe3JldHVybiB0fHwodGhpcy5wYXVzZWQ9ITEpLHRoaXMuaW50ZXJ2YWwmJmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbCksdGhpcy5vcHRpb25zLmludGVydmFsJiYhdGhpcy5wYXVzZWQmJih0aGlzLmludGVydmFsPXNldEludGVydmFsKGUucHJveHkodGhpcy5uZXh0LHRoaXMpLHRoaXMub3B0aW9ucy5pbnRlcnZhbCkpLHRoaXN9LGdldEFjdGl2ZUluZGV4OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuJGFjdGl2ZT10aGlzLiRlbGVtZW50LmZpbmQoXCIuaXRlbS5hY3RpdmVcIiksdGhpcy4kaXRlbXM9dGhpcy4kYWN0aXZlLnBhcmVudCgpLmNoaWxkcmVuKCksdGhpcy4kaXRlbXMuaW5kZXgodGhpcy4kYWN0aXZlKX0sdG86ZnVuY3Rpb24odCl7dmFyIG49dGhpcy5nZXRBY3RpdmVJbmRleCgpLHI9dGhpcztpZih0PnRoaXMuJGl0ZW1zLmxlbmd0aC0xfHx0PDApcmV0dXJuO3JldHVybiB0aGlzLnNsaWRpbmc/dGhpcy4kZWxlbWVudC5vbmUoXCJzbGlkXCIsZnVuY3Rpb24oKXtyLnRvKHQpfSk6bj09dD90aGlzLnBhdXNlKCkuY3ljbGUoKTp0aGlzLnNsaWRlKHQ+bj9cIm5leHRcIjpcInByZXZcIixlKHRoaXMuJGl0ZW1zW3RdKSl9LHBhdXNlOmZ1bmN0aW9uKHQpe3JldHVybiB0fHwodGhpcy5wYXVzZWQ9ITApLHRoaXMuJGVsZW1lbnQuZmluZChcIi5uZXh0LCAucHJldlwiKS5sZW5ndGgmJmUuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCYmKHRoaXMuJGVsZW1lbnQudHJpZ2dlcihlLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQpLHRoaXMuY3ljbGUoITApKSxjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpLHRoaXMuaW50ZXJ2YWw9bnVsbCx0aGlzfSxuZXh0OmZ1bmN0aW9uKCl7aWYodGhpcy5zbGlkaW5nKXJldHVybjtyZXR1cm4gdGhpcy5zbGlkZShcIm5leHRcIil9LHByZXY6ZnVuY3Rpb24oKXtpZih0aGlzLnNsaWRpbmcpcmV0dXJuO3JldHVybiB0aGlzLnNsaWRlKFwicHJldlwiKX0sc2xpZGU6ZnVuY3Rpb24odCxuKXt2YXIgcj10aGlzLiRlbGVtZW50LmZpbmQoXCIuaXRlbS5hY3RpdmVcIiksaT1ufHxyW3RdKCkscz10aGlzLmludGVydmFsLG89dD09XCJuZXh0XCI/XCJsZWZ0XCI6XCJyaWdodFwiLHU9dD09XCJuZXh0XCI/XCJmaXJzdFwiOlwibGFzdFwiLGE9dGhpcyxmO3RoaXMuc2xpZGluZz0hMCxzJiZ0aGlzLnBhdXNlKCksaT1pLmxlbmd0aD9pOnRoaXMuJGVsZW1lbnQuZmluZChcIi5pdGVtXCIpW3VdKCksZj1lLkV2ZW50KFwic2xpZGVcIix7cmVsYXRlZFRhcmdldDppWzBdLGRpcmVjdGlvbjpvfSk7aWYoaS5oYXNDbGFzcyhcImFjdGl2ZVwiKSlyZXR1cm47dGhpcy4kaW5kaWNhdG9ycy5sZW5ndGgmJih0aGlzLiRpbmRpY2F0b3JzLmZpbmQoXCIuYWN0aXZlXCIpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLHRoaXMuJGVsZW1lbnQub25lKFwic2xpZFwiLGZ1bmN0aW9uKCl7dmFyIHQ9ZShhLiRpbmRpY2F0b3JzLmNoaWxkcmVuKClbYS5nZXRBY3RpdmVJbmRleCgpXSk7dCYmdC5hZGRDbGFzcyhcImFjdGl2ZVwiKX0pKTtpZihlLnN1cHBvcnQudHJhbnNpdGlvbiYmdGhpcy4kZWxlbWVudC5oYXNDbGFzcyhcInNsaWRlXCIpKXt0aGlzLiRlbGVtZW50LnRyaWdnZXIoZik7aWYoZi5pc0RlZmF1bHRQcmV2ZW50ZWQoKSlyZXR1cm47aS5hZGRDbGFzcyh0KSxpWzBdLm9mZnNldFdpZHRoLHIuYWRkQ2xhc3MobyksaS5hZGRDbGFzcyhvKSx0aGlzLiRlbGVtZW50Lm9uZShlLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsZnVuY3Rpb24oKXtpLnJlbW92ZUNsYXNzKFt0LG9dLmpvaW4oXCIgXCIpKS5hZGRDbGFzcyhcImFjdGl2ZVwiKSxyLnJlbW92ZUNsYXNzKFtcImFjdGl2ZVwiLG9dLmpvaW4oXCIgXCIpKSxhLnNsaWRpbmc9ITEsc2V0VGltZW91dChmdW5jdGlvbigpe2EuJGVsZW1lbnQudHJpZ2dlcihcInNsaWRcIil9LDApfSl9ZWxzZXt0aGlzLiRlbGVtZW50LnRyaWdnZXIoZik7aWYoZi5pc0RlZmF1bHRQcmV2ZW50ZWQoKSlyZXR1cm47ci5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKSxpLmFkZENsYXNzKFwiYWN0aXZlXCIpLHRoaXMuc2xpZGluZz0hMSx0aGlzLiRlbGVtZW50LnRyaWdnZXIoXCJzbGlkXCIpfXJldHVybiBzJiZ0aGlzLmN5Y2xlKCksdGhpc319O3ZhciBuPWUuZm4uY2Fyb3VzZWw7ZS5mbi5jYXJvdXNlbD1mdW5jdGlvbihuKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHI9ZSh0aGlzKSxpPXIuZGF0YShcImNhcm91c2VsXCIpLHM9ZS5leHRlbmQoe30sZS5mbi5jYXJvdXNlbC5kZWZhdWx0cyx0eXBlb2Ygbj09XCJvYmplY3RcIiYmbiksbz10eXBlb2Ygbj09XCJzdHJpbmdcIj9uOnMuc2xpZGU7aXx8ci5kYXRhKFwiY2Fyb3VzZWxcIixpPW5ldyB0KHRoaXMscykpLHR5cGVvZiBuPT1cIm51bWJlclwiP2kudG8obik6bz9pW29dKCk6cy5pbnRlcnZhbCYmaS5wYXVzZSgpLmN5Y2xlKCl9KX0sZS5mbi5jYXJvdXNlbC5kZWZhdWx0cz17aW50ZXJ2YWw6NWUzLHBhdXNlOlwiaG92ZXJcIn0sZS5mbi5jYXJvdXNlbC5Db25zdHJ1Y3Rvcj10LGUuZm4uY2Fyb3VzZWwubm9Db25mbGljdD1mdW5jdGlvbigpe3JldHVybiBlLmZuLmNhcm91c2VsPW4sdGhpc30sZShkb2N1bWVudCkub24oXCJjbGljay5jYXJvdXNlbC5kYXRhLWFwaVwiLFwiW2RhdGEtc2xpZGVdLCBbZGF0YS1zbGlkZS10b11cIixmdW5jdGlvbih0KXt2YXIgbj1lKHRoaXMpLHIsaT1lKG4uYXR0cihcImRhdGEtdGFyZ2V0XCIpfHwocj1uLmF0dHIoXCJocmVmXCIpKSYmci5yZXBsYWNlKC8uKig/PSNbXlxcc10rJCkvLFwiXCIpKSxzPWUuZXh0ZW5kKHt9LGkuZGF0YSgpLG4uZGF0YSgpKSxvO2kuY2Fyb3VzZWwocyksKG89bi5hdHRyKFwiZGF0YS1zbGlkZS10b1wiKSkmJmkuZGF0YShcImNhcm91c2VsXCIpLnBhdXNlKCkudG8obykuY3ljbGUoKSx0LnByZXZlbnREZWZhdWx0KCl9KX0od2luZG93LmpRdWVyeSksIWZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO3ZhciB0PWZ1bmN0aW9uKHQsbil7dGhpcy4kZWxlbWVudD1lKHQpLHRoaXMub3B0aW9ucz1lLmV4dGVuZCh7fSxlLmZuLmNvbGxhcHNlLmRlZmF1bHRzLG4pLHRoaXMub3B0aW9ucy5wYXJlbnQmJih0aGlzLiRwYXJlbnQ9ZSh0aGlzLm9wdGlvbnMucGFyZW50KSksdGhpcy5vcHRpb25zLnRvZ2dsZSYmdGhpcy50b2dnbGUoKX07dC5wcm90b3R5cGU9e2NvbnN0cnVjdG9yOnQsZGltZW5zaW9uOmZ1bmN0aW9uKCl7dmFyIGU9dGhpcy4kZWxlbWVudC5oYXNDbGFzcyhcIndpZHRoXCIpO3JldHVybiBlP1wid2lkdGhcIjpcImhlaWdodFwifSxzaG93OmZ1bmN0aW9uKCl7dmFyIHQsbixyLGk7aWYodGhpcy50cmFuc2l0aW9uaW5nfHx0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKFwiaW5cIikpcmV0dXJuO3Q9dGhpcy5kaW1lbnNpb24oKSxuPWUuY2FtZWxDYXNlKFtcInNjcm9sbFwiLHRdLmpvaW4oXCItXCIpKSxyPXRoaXMuJHBhcmVudCYmdGhpcy4kcGFyZW50LmZpbmQoXCI+IC5hY2NvcmRpb24tZ3JvdXAgPiAuaW5cIik7aWYociYmci5sZW5ndGgpe2k9ci5kYXRhKFwiY29sbGFwc2VcIik7aWYoaSYmaS50cmFuc2l0aW9uaW5nKXJldHVybjtyLmNvbGxhcHNlKFwiaGlkZVwiKSxpfHxyLmRhdGEoXCJjb2xsYXBzZVwiLG51bGwpfXRoaXMuJGVsZW1lbnRbdF0oMCksdGhpcy50cmFuc2l0aW9uKFwiYWRkQ2xhc3NcIixlLkV2ZW50KFwic2hvd1wiKSxcInNob3duXCIpLGUuc3VwcG9ydC50cmFuc2l0aW9uJiZ0aGlzLiRlbGVtZW50W3RdKHRoaXMuJGVsZW1lbnRbMF1bbl0pfSxoaWRlOmZ1bmN0aW9uKCl7dmFyIHQ7aWYodGhpcy50cmFuc2l0aW9uaW5nfHwhdGhpcy4kZWxlbWVudC5oYXNDbGFzcyhcImluXCIpKXJldHVybjt0PXRoaXMuZGltZW5zaW9uKCksdGhpcy5yZXNldCh0aGlzLiRlbGVtZW50W3RdKCkpLHRoaXMudHJhbnNpdGlvbihcInJlbW92ZUNsYXNzXCIsZS5FdmVudChcImhpZGVcIiksXCJoaWRkZW5cIiksdGhpcy4kZWxlbWVudFt0XSgwKX0scmVzZXQ6ZnVuY3Rpb24oZSl7dmFyIHQ9dGhpcy5kaW1lbnNpb24oKTtyZXR1cm4gdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyhcImNvbGxhcHNlXCIpW3RdKGV8fFwiYXV0b1wiKVswXS5vZmZzZXRXaWR0aCx0aGlzLiRlbGVtZW50W2UhPT1udWxsP1wiYWRkQ2xhc3NcIjpcInJlbW92ZUNsYXNzXCJdKFwiY29sbGFwc2VcIiksdGhpc30sdHJhbnNpdGlvbjpmdW5jdGlvbih0LG4scil7dmFyIGk9dGhpcyxzPWZ1bmN0aW9uKCl7bi50eXBlPT1cInNob3dcIiYmaS5yZXNldCgpLGkudHJhbnNpdGlvbmluZz0wLGkuJGVsZW1lbnQudHJpZ2dlcihyKX07dGhpcy4kZWxlbWVudC50cmlnZ2VyKG4pO2lmKG4uaXNEZWZhdWx0UHJldmVudGVkKCkpcmV0dXJuO3RoaXMudHJhbnNpdGlvbmluZz0xLHRoaXMuJGVsZW1lbnRbdF0oXCJpblwiKSxlLnN1cHBvcnQudHJhbnNpdGlvbiYmdGhpcy4kZWxlbWVudC5oYXNDbGFzcyhcImNvbGxhcHNlXCIpP3RoaXMuJGVsZW1lbnQub25lKGUuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCxzKTpzKCl9LHRvZ2dsZTpmdW5jdGlvbigpe3RoaXNbdGhpcy4kZWxlbWVudC5oYXNDbGFzcyhcImluXCIpP1wiaGlkZVwiOlwic2hvd1wiXSgpfX07dmFyIG49ZS5mbi5jb2xsYXBzZTtlLmZuLmNvbGxhcHNlPWZ1bmN0aW9uKG4pe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgcj1lKHRoaXMpLGk9ci5kYXRhKFwiY29sbGFwc2VcIikscz1lLmV4dGVuZCh7fSxlLmZuLmNvbGxhcHNlLmRlZmF1bHRzLHIuZGF0YSgpLHR5cGVvZiBuPT1cIm9iamVjdFwiJiZuKTtpfHxyLmRhdGEoXCJjb2xsYXBzZVwiLGk9bmV3IHQodGhpcyxzKSksdHlwZW9mIG49PVwic3RyaW5nXCImJmlbbl0oKX0pfSxlLmZuLmNvbGxhcHNlLmRlZmF1bHRzPXt0b2dnbGU6ITB9LGUuZm4uY29sbGFwc2UuQ29uc3RydWN0b3I9dCxlLmZuLmNvbGxhcHNlLm5vQ29uZmxpY3Q9ZnVuY3Rpb24oKXtyZXR1cm4gZS5mbi5jb2xsYXBzZT1uLHRoaXN9LGUoZG9jdW1lbnQpLm9uKFwiY2xpY2suY29sbGFwc2UuZGF0YS1hcGlcIixcIltkYXRhLXRvZ2dsZT1jb2xsYXBzZV1cIixmdW5jdGlvbih0KXt2YXIgbj1lKHRoaXMpLHIsaT1uLmF0dHIoXCJkYXRhLXRhcmdldFwiKXx8dC5wcmV2ZW50RGVmYXVsdCgpfHwocj1uLmF0dHIoXCJocmVmXCIpKSYmci5yZXBsYWNlKC8uKig/PSNbXlxcc10rJCkvLFwiXCIpLHM9ZShpKS5kYXRhKFwiY29sbGFwc2VcIik/XCJ0b2dnbGVcIjpuLmRhdGEoKTtuW2UoaSkuaGFzQ2xhc3MoXCJpblwiKT9cImFkZENsYXNzXCI6XCJyZW1vdmVDbGFzc1wiXShcImNvbGxhcHNlZFwiKSxlKGkpLmNvbGxhcHNlKHMpfSl9KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKCl7ZSh0KS5lYWNoKGZ1bmN0aW9uKCl7aShlKHRoaXMpKS5yZW1vdmVDbGFzcyhcIm9wZW5cIil9KX1mdW5jdGlvbiBpKHQpe3ZhciBuPXQuYXR0cihcImRhdGEtdGFyZ2V0XCIpLHI7bnx8KG49dC5hdHRyKFwiaHJlZlwiKSxuPW4mJi8jLy50ZXN0KG4pJiZuLnJlcGxhY2UoLy4qKD89I1teXFxzXSokKS8sXCJcIikpLHI9biYmZShuKTtpZighcnx8IXIubGVuZ3RoKXI9dC5wYXJlbnQoKTtyZXR1cm4gcn12YXIgdD1cIltkYXRhLXRvZ2dsZT1kcm9wZG93bl1cIixuPWZ1bmN0aW9uKHQpe3ZhciBuPWUodCkub24oXCJjbGljay5kcm9wZG93bi5kYXRhLWFwaVwiLHRoaXMudG9nZ2xlKTtlKFwiaHRtbFwiKS5vbihcImNsaWNrLmRyb3Bkb3duLmRhdGEtYXBpXCIsZnVuY3Rpb24oKXtuLnBhcmVudCgpLnJlbW92ZUNsYXNzKFwib3BlblwiKX0pfTtuLnByb3RvdHlwZT17Y29uc3RydWN0b3I6bix0b2dnbGU6ZnVuY3Rpb24odCl7dmFyIG49ZSh0aGlzKSxzLG87aWYobi5pcyhcIi5kaXNhYmxlZCwgOmRpc2FibGVkXCIpKXJldHVybjtyZXR1cm4gcz1pKG4pLG89cy5oYXNDbGFzcyhcIm9wZW5cIikscigpLG98fHMudG9nZ2xlQ2xhc3MoXCJvcGVuXCIpLG4uZm9jdXMoKSwhMX0sa2V5ZG93bjpmdW5jdGlvbihuKXt2YXIgcixzLG8sdSxhLGY7aWYoIS8oMzh8NDB8MjcpLy50ZXN0KG4ua2V5Q29kZSkpcmV0dXJuO3I9ZSh0aGlzKSxuLnByZXZlbnREZWZhdWx0KCksbi5zdG9wUHJvcGFnYXRpb24oKTtpZihyLmlzKFwiLmRpc2FibGVkLCA6ZGlzYWJsZWRcIikpcmV0dXJuO3U9aShyKSxhPXUuaGFzQ2xhc3MoXCJvcGVuXCIpO2lmKCFhfHxhJiZuLmtleUNvZGU9PTI3KXJldHVybiBuLndoaWNoPT0yNyYmdS5maW5kKHQpLmZvY3VzKCksci5jbGljaygpO3M9ZShcIltyb2xlPW1lbnVdIGxpOm5vdCguZGl2aWRlcik6dmlzaWJsZSBhXCIsdSk7aWYoIXMubGVuZ3RoKXJldHVybjtmPXMuaW5kZXgocy5maWx0ZXIoXCI6Zm9jdXNcIikpLG4ua2V5Q29kZT09MzgmJmY+MCYmZi0tLG4ua2V5Q29kZT09NDAmJmY8cy5sZW5ndGgtMSYmZisrLH5mfHwoZj0wKSxzLmVxKGYpLmZvY3VzKCl9fTt2YXIgcz1lLmZuLmRyb3Bkb3duO2UuZm4uZHJvcGRvd249ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciByPWUodGhpcyksaT1yLmRhdGEoXCJkcm9wZG93blwiKTtpfHxyLmRhdGEoXCJkcm9wZG93blwiLGk9bmV3IG4odGhpcykpLHR5cGVvZiB0PT1cInN0cmluZ1wiJiZpW3RdLmNhbGwocil9KX0sZS5mbi5kcm9wZG93bi5Db25zdHJ1Y3Rvcj1uLGUuZm4uZHJvcGRvd24ubm9Db25mbGljdD1mdW5jdGlvbigpe3JldHVybiBlLmZuLmRyb3Bkb3duPXMsdGhpc30sZShkb2N1bWVudCkub24oXCJjbGljay5kcm9wZG93bi5kYXRhLWFwaVwiLHIpLm9uKFwiY2xpY2suZHJvcGRvd24uZGF0YS1hcGlcIixcIi5kcm9wZG93biBmb3JtXCIsZnVuY3Rpb24oZSl7ZS5zdG9wUHJvcGFnYXRpb24oKX0pLm9uKFwiY2xpY2suZHJvcGRvd24tbWVudVwiLGZ1bmN0aW9uKGUpe2Uuc3RvcFByb3BhZ2F0aW9uKCl9KS5vbihcImNsaWNrLmRyb3Bkb3duLmRhdGEtYXBpXCIsdCxuLnByb3RvdHlwZS50b2dnbGUpLm9uKFwia2V5ZG93bi5kcm9wZG93bi5kYXRhLWFwaVwiLHQrXCIsIFtyb2xlPW1lbnVdXCIsbi5wcm90b3R5cGUua2V5ZG93bil9KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjt2YXIgdD1mdW5jdGlvbih0LG4pe3RoaXMub3B0aW9ucz1uLHRoaXMuJGVsZW1lbnQ9ZSh0KS5kZWxlZ2F0ZSgnW2RhdGEtZGlzbWlzcz1cIm1vZGFsXCJdJyxcImNsaWNrLmRpc21pc3MubW9kYWxcIixlLnByb3h5KHRoaXMuaGlkZSx0aGlzKSksdGhpcy5vcHRpb25zLnJlbW90ZSYmdGhpcy4kZWxlbWVudC5maW5kKFwiLm1vZGFsLWJvZHlcIikubG9hZCh0aGlzLm9wdGlvbnMucmVtb3RlKX07dC5wcm90b3R5cGU9e2NvbnN0cnVjdG9yOnQsdG9nZ2xlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXNbdGhpcy5pc1Nob3duP1wiaGlkZVwiOlwic2hvd1wiXSgpfSxzaG93OmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcyxuPWUuRXZlbnQoXCJzaG93XCIpO3RoaXMuJGVsZW1lbnQudHJpZ2dlcihuKTtpZih0aGlzLmlzU2hvd258fG4uaXNEZWZhdWx0UHJldmVudGVkKCkpcmV0dXJuO3RoaXMuaXNTaG93bj0hMCx0aGlzLmVzY2FwZSgpLHRoaXMuYmFja2Ryb3AoZnVuY3Rpb24oKXt2YXIgbj1lLnN1cHBvcnQudHJhbnNpdGlvbiYmdC4kZWxlbWVudC5oYXNDbGFzcyhcImZhZGVcIik7dC4kZWxlbWVudC5wYXJlbnQoKS5sZW5ndGh8fHQuJGVsZW1lbnQuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSksdC4kZWxlbWVudC5zaG93KCksbiYmdC4kZWxlbWVudFswXS5vZmZzZXRXaWR0aCx0LiRlbGVtZW50LmFkZENsYXNzKFwiaW5cIikuYXR0cihcImFyaWEtaGlkZGVuXCIsITEpLHQuZW5mb3JjZUZvY3VzKCksbj90LiRlbGVtZW50Lm9uZShlLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsZnVuY3Rpb24oKXt0LiRlbGVtZW50LmZvY3VzKCkudHJpZ2dlcihcInNob3duXCIpfSk6dC4kZWxlbWVudC5mb2N1cygpLnRyaWdnZXIoXCJzaG93blwiKX0pfSxoaWRlOmZ1bmN0aW9uKHQpe3QmJnQucHJldmVudERlZmF1bHQoKTt2YXIgbj10aGlzO3Q9ZS5FdmVudChcImhpZGVcIiksdGhpcy4kZWxlbWVudC50cmlnZ2VyKHQpO2lmKCF0aGlzLmlzU2hvd258fHQuaXNEZWZhdWx0UHJldmVudGVkKCkpcmV0dXJuO3RoaXMuaXNTaG93bj0hMSx0aGlzLmVzY2FwZSgpLGUoZG9jdW1lbnQpLm9mZihcImZvY3VzaW4ubW9kYWxcIiksdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyhcImluXCIpLmF0dHIoXCJhcmlhLWhpZGRlblwiLCEwKSxlLnN1cHBvcnQudHJhbnNpdGlvbiYmdGhpcy4kZWxlbWVudC5oYXNDbGFzcyhcImZhZGVcIik/dGhpcy5oaWRlV2l0aFRyYW5zaXRpb24oKTp0aGlzLmhpZGVNb2RhbCgpfSxlbmZvcmNlRm9jdXM6ZnVuY3Rpb24oKXt2YXIgdD10aGlzO2UoZG9jdW1lbnQpLm9uKFwiZm9jdXNpbi5tb2RhbFwiLGZ1bmN0aW9uKGUpe3QuJGVsZW1lbnRbMF0hPT1lLnRhcmdldCYmIXQuJGVsZW1lbnQuaGFzKGUudGFyZ2V0KS5sZW5ndGgmJnQuJGVsZW1lbnQuZm9jdXMoKX0pfSxlc2NhcGU6ZnVuY3Rpb24oKXt2YXIgZT10aGlzO3RoaXMuaXNTaG93biYmdGhpcy5vcHRpb25zLmtleWJvYXJkP3RoaXMuJGVsZW1lbnQub24oXCJrZXl1cC5kaXNtaXNzLm1vZGFsXCIsZnVuY3Rpb24odCl7dC53aGljaD09MjcmJmUuaGlkZSgpfSk6dGhpcy5pc1Nob3dufHx0aGlzLiRlbGVtZW50Lm9mZihcImtleXVwLmRpc21pc3MubW9kYWxcIil9LGhpZGVXaXRoVHJhbnNpdGlvbjpmdW5jdGlvbigpe3ZhciB0PXRoaXMsbj1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dC4kZWxlbWVudC5vZmYoZS5zdXBwb3J0LnRyYW5zaXRpb24uZW5kKSx0LmhpZGVNb2RhbCgpfSw1MDApO3RoaXMuJGVsZW1lbnQub25lKGUuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCxmdW5jdGlvbigpe2NsZWFyVGltZW91dChuKSx0LmhpZGVNb2RhbCgpfSl9LGhpZGVNb2RhbDpmdW5jdGlvbigpe3ZhciBlPXRoaXM7dGhpcy4kZWxlbWVudC5oaWRlKCksdGhpcy5iYWNrZHJvcChmdW5jdGlvbigpe2UucmVtb3ZlQmFja2Ryb3AoKSxlLiRlbGVtZW50LnRyaWdnZXIoXCJoaWRkZW5cIil9KX0scmVtb3ZlQmFja2Ryb3A6ZnVuY3Rpb24oKXt0aGlzLiRiYWNrZHJvcCYmdGhpcy4kYmFja2Ryb3AucmVtb3ZlKCksdGhpcy4kYmFja2Ryb3A9bnVsbH0sYmFja2Ryb3A6ZnVuY3Rpb24odCl7dmFyIG49dGhpcyxyPXRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoXCJmYWRlXCIpP1wiZmFkZVwiOlwiXCI7aWYodGhpcy5pc1Nob3duJiZ0aGlzLm9wdGlvbnMuYmFja2Ryb3Ape3ZhciBpPWUuc3VwcG9ydC50cmFuc2l0aW9uJiZyO3RoaXMuJGJhY2tkcm9wPWUoJzxkaXYgY2xhc3M9XCJtb2RhbC1iYWNrZHJvcCAnK3IrJ1wiIC8+JykuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSksdGhpcy4kYmFja2Ryb3AuY2xpY2sodGhpcy5vcHRpb25zLmJhY2tkcm9wPT1cInN0YXRpY1wiP2UucHJveHkodGhpcy4kZWxlbWVudFswXS5mb2N1cyx0aGlzLiRlbGVtZW50WzBdKTplLnByb3h5KHRoaXMuaGlkZSx0aGlzKSksaSYmdGhpcy4kYmFja2Ryb3BbMF0ub2Zmc2V0V2lkdGgsdGhpcy4kYmFja2Ryb3AuYWRkQ2xhc3MoXCJpblwiKTtpZighdClyZXR1cm47aT90aGlzLiRiYWNrZHJvcC5vbmUoZS5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLHQpOnQoKX1lbHNlIXRoaXMuaXNTaG93biYmdGhpcy4kYmFja2Ryb3A/KHRoaXMuJGJhY2tkcm9wLnJlbW92ZUNsYXNzKFwiaW5cIiksZS5zdXBwb3J0LnRyYW5zaXRpb24mJnRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoXCJmYWRlXCIpP3RoaXMuJGJhY2tkcm9wLm9uZShlLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsdCk6dCgpKTp0JiZ0KCl9fTt2YXIgbj1lLmZuLm1vZGFsO2UuZm4ubW9kYWw9ZnVuY3Rpb24obil7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciByPWUodGhpcyksaT1yLmRhdGEoXCJtb2RhbFwiKSxzPWUuZXh0ZW5kKHt9LGUuZm4ubW9kYWwuZGVmYXVsdHMsci5kYXRhKCksdHlwZW9mIG49PVwib2JqZWN0XCImJm4pO2l8fHIuZGF0YShcIm1vZGFsXCIsaT1uZXcgdCh0aGlzLHMpKSx0eXBlb2Ygbj09XCJzdHJpbmdcIj9pW25dKCk6cy5zaG93JiZpLnNob3coKX0pfSxlLmZuLm1vZGFsLmRlZmF1bHRzPXtiYWNrZHJvcDohMCxrZXlib2FyZDohMCxzaG93OiEwfSxlLmZuLm1vZGFsLkNvbnN0cnVjdG9yPXQsZS5mbi5tb2RhbC5ub0NvbmZsaWN0PWZ1bmN0aW9uKCl7cmV0dXJuIGUuZm4ubW9kYWw9bix0aGlzfSxlKGRvY3VtZW50KS5vbihcImNsaWNrLm1vZGFsLmRhdGEtYXBpXCIsJ1tkYXRhLXRvZ2dsZT1cIm1vZGFsXCJdJyxmdW5jdGlvbih0KXt2YXIgbj1lKHRoaXMpLHI9bi5hdHRyKFwiaHJlZlwiKSxpPWUobi5hdHRyKFwiZGF0YS10YXJnZXRcIil8fHImJnIucmVwbGFjZSgvLiooPz0jW15cXHNdKyQpLyxcIlwiKSkscz1pLmRhdGEoXCJtb2RhbFwiKT9cInRvZ2dsZVwiOmUuZXh0ZW5kKHtyZW1vdGU6IS8jLy50ZXN0KHIpJiZyfSxpLmRhdGEoKSxuLmRhdGEoKSk7dC5wcmV2ZW50RGVmYXVsdCgpLGkubW9kYWwocykub25lKFwiaGlkZVwiLGZ1bmN0aW9uKCl7bi5mb2N1cygpfSl9KX0od2luZG93LmpRdWVyeSksIWZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO3ZhciB0PWZ1bmN0aW9uKGUsdCl7dGhpcy5pbml0KFwidG9vbHRpcFwiLGUsdCl9O3QucHJvdG90eXBlPXtjb25zdHJ1Y3Rvcjp0LGluaXQ6ZnVuY3Rpb24odCxuLHIpe3ZhciBpLHMsbyx1LGE7dGhpcy50eXBlPXQsdGhpcy4kZWxlbWVudD1lKG4pLHRoaXMub3B0aW9ucz10aGlzLmdldE9wdGlvbnMociksdGhpcy5lbmFibGVkPSEwLG89dGhpcy5vcHRpb25zLnRyaWdnZXIuc3BsaXQoXCIgXCIpO2ZvcihhPW8ubGVuZ3RoO2EtLTspdT1vW2FdLHU9PVwiY2xpY2tcIj90aGlzLiRlbGVtZW50Lm9uKFwiY2xpY2suXCIrdGhpcy50eXBlLHRoaXMub3B0aW9ucy5zZWxlY3RvcixlLnByb3h5KHRoaXMudG9nZ2xlLHRoaXMpKTp1IT1cIm1hbnVhbFwiJiYoaT11PT1cImhvdmVyXCI/XCJtb3VzZWVudGVyXCI6XCJmb2N1c1wiLHM9dT09XCJob3ZlclwiP1wibW91c2VsZWF2ZVwiOlwiYmx1clwiLHRoaXMuJGVsZW1lbnQub24oaStcIi5cIit0aGlzLnR5cGUsdGhpcy5vcHRpb25zLnNlbGVjdG9yLGUucHJveHkodGhpcy5lbnRlcix0aGlzKSksdGhpcy4kZWxlbWVudC5vbihzK1wiLlwiK3RoaXMudHlwZSx0aGlzLm9wdGlvbnMuc2VsZWN0b3IsZS5wcm94eSh0aGlzLmxlYXZlLHRoaXMpKSk7dGhpcy5vcHRpb25zLnNlbGVjdG9yP3RoaXMuX29wdGlvbnM9ZS5leHRlbmQoe30sdGhpcy5vcHRpb25zLHt0cmlnZ2VyOlwibWFudWFsXCIsc2VsZWN0b3I6XCJcIn0pOnRoaXMuZml4VGl0bGUoKX0sZ2V0T3B0aW9uczpmdW5jdGlvbih0KXtyZXR1cm4gdD1lLmV4dGVuZCh7fSxlLmZuW3RoaXMudHlwZV0uZGVmYXVsdHMsdGhpcy4kZWxlbWVudC5kYXRhKCksdCksdC5kZWxheSYmdHlwZW9mIHQuZGVsYXk9PVwibnVtYmVyXCImJih0LmRlbGF5PXtzaG93OnQuZGVsYXksaGlkZTp0LmRlbGF5fSksdH0sZW50ZXI6ZnVuY3Rpb24odCl7dmFyIG49ZS5mblt0aGlzLnR5cGVdLmRlZmF1bHRzLHI9e30saTt0aGlzLl9vcHRpb25zJiZlLmVhY2godGhpcy5fb3B0aW9ucyxmdW5jdGlvbihlLHQpe25bZV0hPXQmJihyW2VdPXQpfSx0aGlzKSxpPWUodC5jdXJyZW50VGFyZ2V0KVt0aGlzLnR5cGVdKHIpLmRhdGEodGhpcy50eXBlKTtpZighaS5vcHRpb25zLmRlbGF5fHwhaS5vcHRpb25zLmRlbGF5LnNob3cpcmV0dXJuIGkuc2hvdygpO2NsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpLGkuaG92ZXJTdGF0ZT1cImluXCIsdGhpcy50aW1lb3V0PXNldFRpbWVvdXQoZnVuY3Rpb24oKXtpLmhvdmVyU3RhdGU9PVwiaW5cIiYmaS5zaG93KCl9LGkub3B0aW9ucy5kZWxheS5zaG93KX0sbGVhdmU6ZnVuY3Rpb24odCl7dmFyIG49ZSh0LmN1cnJlbnRUYXJnZXQpW3RoaXMudHlwZV0odGhpcy5fb3B0aW9ucykuZGF0YSh0aGlzLnR5cGUpO3RoaXMudGltZW91dCYmY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7aWYoIW4ub3B0aW9ucy5kZWxheXx8IW4ub3B0aW9ucy5kZWxheS5oaWRlKXJldHVybiBuLmhpZGUoKTtuLmhvdmVyU3RhdGU9XCJvdXRcIix0aGlzLnRpbWVvdXQ9c2V0VGltZW91dChmdW5jdGlvbigpe24uaG92ZXJTdGF0ZT09XCJvdXRcIiYmbi5oaWRlKCl9LG4ub3B0aW9ucy5kZWxheS5oaWRlKX0sc2hvdzpmdW5jdGlvbigpe3ZhciB0LG4scixpLHMsbyx1PWUuRXZlbnQoXCJzaG93XCIpO2lmKHRoaXMuaGFzQ29udGVudCgpJiZ0aGlzLmVuYWJsZWQpe3RoaXMuJGVsZW1lbnQudHJpZ2dlcih1KTtpZih1LmlzRGVmYXVsdFByZXZlbnRlZCgpKXJldHVybjt0PXRoaXMudGlwKCksdGhpcy5zZXRDb250ZW50KCksdGhpcy5vcHRpb25zLmFuaW1hdGlvbiYmdC5hZGRDbGFzcyhcImZhZGVcIikscz10eXBlb2YgdGhpcy5vcHRpb25zLnBsYWNlbWVudD09XCJmdW5jdGlvblwiP3RoaXMub3B0aW9ucy5wbGFjZW1lbnQuY2FsbCh0aGlzLHRbMF0sdGhpcy4kZWxlbWVudFswXSk6dGhpcy5vcHRpb25zLnBsYWNlbWVudCx0LmRldGFjaCgpLmNzcyh7dG9wOjAsbGVmdDowLGRpc3BsYXk6XCJibG9ja1wifSksdGhpcy5vcHRpb25zLmNvbnRhaW5lcj90LmFwcGVuZFRvKHRoaXMub3B0aW9ucy5jb250YWluZXIpOnQuaW5zZXJ0QWZ0ZXIodGhpcy4kZWxlbWVudCksbj10aGlzLmdldFBvc2l0aW9uKCkscj10WzBdLm9mZnNldFdpZHRoLGk9dFswXS5vZmZzZXRIZWlnaHQ7c3dpdGNoKHMpe2Nhc2VcImJvdHRvbVwiOm89e3RvcDpuLnRvcCtuLmhlaWdodCxsZWZ0Om4ubGVmdCtuLndpZHRoLzItci8yfTticmVhaztjYXNlXCJ0b3BcIjpvPXt0b3A6bi50b3AtaSxsZWZ0Om4ubGVmdCtuLndpZHRoLzItci8yfTticmVhaztjYXNlXCJsZWZ0XCI6bz17dG9wOm4udG9wK24uaGVpZ2h0LzItaS8yLGxlZnQ6bi5sZWZ0LXJ9O2JyZWFrO2Nhc2VcInJpZ2h0XCI6bz17dG9wOm4udG9wK24uaGVpZ2h0LzItaS8yLGxlZnQ6bi5sZWZ0K24ud2lkdGh9fXRoaXMuYXBwbHlQbGFjZW1lbnQobyxzKSx0aGlzLiRlbGVtZW50LnRyaWdnZXIoXCJzaG93blwiKX19LGFwcGx5UGxhY2VtZW50OmZ1bmN0aW9uKGUsdCl7dmFyIG49dGhpcy50aXAoKSxyPW5bMF0ub2Zmc2V0V2lkdGgsaT1uWzBdLm9mZnNldEhlaWdodCxzLG8sdSxhO24ub2Zmc2V0KGUpLmFkZENsYXNzKHQpLmFkZENsYXNzKFwiaW5cIikscz1uWzBdLm9mZnNldFdpZHRoLG89blswXS5vZmZzZXRIZWlnaHQsdD09XCJ0b3BcIiYmbyE9aSYmKGUudG9wPWUudG9wK2ktbyxhPSEwKSx0PT1cImJvdHRvbVwifHx0PT1cInRvcFwiPyh1PTAsZS5sZWZ0PDAmJih1PWUubGVmdCotMixlLmxlZnQ9MCxuLm9mZnNldChlKSxzPW5bMF0ub2Zmc2V0V2lkdGgsbz1uWzBdLm9mZnNldEhlaWdodCksdGhpcy5yZXBsYWNlQXJyb3codS1yK3MscyxcImxlZnRcIikpOnRoaXMucmVwbGFjZUFycm93KG8taSxvLFwidG9wXCIpLGEmJm4ub2Zmc2V0KGUpfSxyZXBsYWNlQXJyb3c6ZnVuY3Rpb24oZSx0LG4pe3RoaXMuYXJyb3coKS5jc3MobixlPzUwKigxLWUvdCkrXCIlXCI6XCJcIil9LHNldENvbnRlbnQ6ZnVuY3Rpb24oKXt2YXIgZT10aGlzLnRpcCgpLHQ9dGhpcy5nZXRUaXRsZSgpO2UuZmluZChcIi50b29sdGlwLWlubmVyXCIpW3RoaXMub3B0aW9ucy5odG1sP1wiaHRtbFwiOlwidGV4dFwiXSh0KSxlLnJlbW92ZUNsYXNzKFwiZmFkZSBpbiB0b3AgYm90dG9tIGxlZnQgcmlnaHRcIil9LGhpZGU6ZnVuY3Rpb24oKXtmdW5jdGlvbiBpKCl7dmFyIHQ9c2V0VGltZW91dChmdW5jdGlvbigpe24ub2ZmKGUuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCkuZGV0YWNoKCl9LDUwMCk7bi5vbmUoZS5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLGZ1bmN0aW9uKCl7Y2xlYXJUaW1lb3V0KHQpLG4uZGV0YWNoKCl9KX12YXIgdD10aGlzLG49dGhpcy50aXAoKSxyPWUuRXZlbnQoXCJoaWRlXCIpO3RoaXMuJGVsZW1lbnQudHJpZ2dlcihyKTtpZihyLmlzRGVmYXVsdFByZXZlbnRlZCgpKXJldHVybjtyZXR1cm4gbi5yZW1vdmVDbGFzcyhcImluXCIpLGUuc3VwcG9ydC50cmFuc2l0aW9uJiZ0aGlzLiR0aXAuaGFzQ2xhc3MoXCJmYWRlXCIpP2koKTpuLmRldGFjaCgpLHRoaXMuJGVsZW1lbnQudHJpZ2dlcihcImhpZGRlblwiKSx0aGlzfSxmaXhUaXRsZTpmdW5jdGlvbigpe3ZhciBlPXRoaXMuJGVsZW1lbnQ7KGUuYXR0cihcInRpdGxlXCIpfHx0eXBlb2YgZS5hdHRyKFwiZGF0YS1vcmlnaW5hbC10aXRsZVwiKSE9XCJzdHJpbmdcIikmJmUuYXR0cihcImRhdGEtb3JpZ2luYWwtdGl0bGVcIixlLmF0dHIoXCJ0aXRsZVwiKXx8XCJcIikuYXR0cihcInRpdGxlXCIsXCJcIil9LGhhc0NvbnRlbnQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5nZXRUaXRsZSgpfSxnZXRQb3NpdGlvbjpmdW5jdGlvbigpe3ZhciB0PXRoaXMuJGVsZW1lbnRbMF07cmV0dXJuIGUuZXh0ZW5kKHt9LHR5cGVvZiB0LmdldEJvdW5kaW5nQ2xpZW50UmVjdD09XCJmdW5jdGlvblwiP3QuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk6e3dpZHRoOnQub2Zmc2V0V2lkdGgsaGVpZ2h0OnQub2Zmc2V0SGVpZ2h0fSx0aGlzLiRlbGVtZW50Lm9mZnNldCgpKX0sZ2V0VGl0bGU6ZnVuY3Rpb24oKXt2YXIgZSx0PXRoaXMuJGVsZW1lbnQsbj10aGlzLm9wdGlvbnM7cmV0dXJuIGU9dC5hdHRyKFwiZGF0YS1vcmlnaW5hbC10aXRsZVwiKXx8KHR5cGVvZiBuLnRpdGxlPT1cImZ1bmN0aW9uXCI/bi50aXRsZS5jYWxsKHRbMF0pOm4udGl0bGUpLGV9LHRpcDpmdW5jdGlvbigpe3JldHVybiB0aGlzLiR0aXA9dGhpcy4kdGlwfHxlKHRoaXMub3B0aW9ucy50ZW1wbGF0ZSl9LGFycm93OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuJGFycm93PXRoaXMuJGFycm93fHx0aGlzLnRpcCgpLmZpbmQoXCIudG9vbHRpcC1hcnJvd1wiKX0sdmFsaWRhdGU6ZnVuY3Rpb24oKXt0aGlzLiRlbGVtZW50WzBdLnBhcmVudE5vZGV8fCh0aGlzLmhpZGUoKSx0aGlzLiRlbGVtZW50PW51bGwsdGhpcy5vcHRpb25zPW51bGwpfSxlbmFibGU6ZnVuY3Rpb24oKXt0aGlzLmVuYWJsZWQ9ITB9LGRpc2FibGU6ZnVuY3Rpb24oKXt0aGlzLmVuYWJsZWQ9ITF9LHRvZ2dsZUVuYWJsZWQ6ZnVuY3Rpb24oKXt0aGlzLmVuYWJsZWQ9IXRoaXMuZW5hYmxlZH0sdG9nZ2xlOmZ1bmN0aW9uKHQpe3ZhciBuPXQ/ZSh0LmN1cnJlbnRUYXJnZXQpW3RoaXMudHlwZV0odGhpcy5fb3B0aW9ucykuZGF0YSh0aGlzLnR5cGUpOnRoaXM7bi50aXAoKS5oYXNDbGFzcyhcImluXCIpP24uaGlkZSgpOm4uc2hvdygpfSxkZXN0cm95OmZ1bmN0aW9uKCl7dGhpcy5oaWRlKCkuJGVsZW1lbnQub2ZmKFwiLlwiK3RoaXMudHlwZSkucmVtb3ZlRGF0YSh0aGlzLnR5cGUpfX07dmFyIG49ZS5mbi50b29sdGlwO2UuZm4udG9vbHRpcD1mdW5jdGlvbihuKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHI9ZSh0aGlzKSxpPXIuZGF0YShcInRvb2x0aXBcIikscz10eXBlb2Ygbj09XCJvYmplY3RcIiYmbjtpfHxyLmRhdGEoXCJ0b29sdGlwXCIsaT1uZXcgdCh0aGlzLHMpKSx0eXBlb2Ygbj09XCJzdHJpbmdcIiYmaVtuXSgpfSl9LGUuZm4udG9vbHRpcC5Db25zdHJ1Y3Rvcj10LGUuZm4udG9vbHRpcC5kZWZhdWx0cz17YW5pbWF0aW9uOiEwLHBsYWNlbWVudDpcInRvcFwiLHNlbGVjdG9yOiExLHRlbXBsYXRlOic8ZGl2IGNsYXNzPVwidG9vbHRpcFwiPjxkaXYgY2xhc3M9XCJ0b29sdGlwLWFycm93XCI+PC9kaXY+PGRpdiBjbGFzcz1cInRvb2x0aXAtaW5uZXJcIj48L2Rpdj48L2Rpdj4nLHRyaWdnZXI6XCJob3ZlciBmb2N1c1wiLHRpdGxlOlwiXCIsZGVsYXk6MCxodG1sOiExLGNvbnRhaW5lcjohMX0sZS5mbi50b29sdGlwLm5vQ29uZmxpY3Q9ZnVuY3Rpb24oKXtyZXR1cm4gZS5mbi50b29sdGlwPW4sdGhpc319KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjt2YXIgdD1mdW5jdGlvbihlLHQpe3RoaXMuaW5pdChcInBvcG92ZXJcIixlLHQpfTt0LnByb3RvdHlwZT1lLmV4dGVuZCh7fSxlLmZuLnRvb2x0aXAuQ29uc3RydWN0b3IucHJvdG90eXBlLHtjb25zdHJ1Y3Rvcjp0LHNldENvbnRlbnQ6ZnVuY3Rpb24oKXt2YXIgZT10aGlzLnRpcCgpLHQ9dGhpcy5nZXRUaXRsZSgpLG49dGhpcy5nZXRDb250ZW50KCk7ZS5maW5kKFwiLnBvcG92ZXItdGl0bGVcIilbdGhpcy5vcHRpb25zLmh0bWw/XCJodG1sXCI6XCJ0ZXh0XCJdKHQpLGUuZmluZChcIi5wb3BvdmVyLWNvbnRlbnRcIilbdGhpcy5vcHRpb25zLmh0bWw/XCJodG1sXCI6XCJ0ZXh0XCJdKG4pLGUucmVtb3ZlQ2xhc3MoXCJmYWRlIHRvcCBib3R0b20gbGVmdCByaWdodCBpblwiKX0saGFzQ29udGVudDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmdldFRpdGxlKCl8fHRoaXMuZ2V0Q29udGVudCgpfSxnZXRDb250ZW50OmZ1bmN0aW9uKCl7dmFyIGUsdD10aGlzLiRlbGVtZW50LG49dGhpcy5vcHRpb25zO3JldHVybiBlPSh0eXBlb2Ygbi5jb250ZW50PT1cImZ1bmN0aW9uXCI/bi5jb250ZW50LmNhbGwodFswXSk6bi5jb250ZW50KXx8dC5hdHRyKFwiZGF0YS1jb250ZW50XCIpLGV9LHRpcDpmdW5jdGlvbigpe3JldHVybiB0aGlzLiR0aXB8fCh0aGlzLiR0aXA9ZSh0aGlzLm9wdGlvbnMudGVtcGxhdGUpKSx0aGlzLiR0aXB9LGRlc3Ryb3k6ZnVuY3Rpb24oKXt0aGlzLmhpZGUoKS4kZWxlbWVudC5vZmYoXCIuXCIrdGhpcy50eXBlKS5yZW1vdmVEYXRhKHRoaXMudHlwZSl9fSk7dmFyIG49ZS5mbi5wb3BvdmVyO2UuZm4ucG9wb3Zlcj1mdW5jdGlvbihuKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHI9ZSh0aGlzKSxpPXIuZGF0YShcInBvcG92ZXJcIikscz10eXBlb2Ygbj09XCJvYmplY3RcIiYmbjtpfHxyLmRhdGEoXCJwb3BvdmVyXCIsaT1uZXcgdCh0aGlzLHMpKSx0eXBlb2Ygbj09XCJzdHJpbmdcIiYmaVtuXSgpfSl9LGUuZm4ucG9wb3Zlci5Db25zdHJ1Y3Rvcj10LGUuZm4ucG9wb3Zlci5kZWZhdWx0cz1lLmV4dGVuZCh7fSxlLmZuLnRvb2x0aXAuZGVmYXVsdHMse3BsYWNlbWVudDpcInJpZ2h0XCIsdHJpZ2dlcjpcImNsaWNrXCIsY29udGVudDpcIlwiLHRlbXBsYXRlOic8ZGl2IGNsYXNzPVwicG9wb3ZlclwiPjxkaXYgY2xhc3M9XCJhcnJvd1wiPjwvZGl2PjxoMyBjbGFzcz1cInBvcG92ZXItdGl0bGVcIj48L2gzPjxkaXYgY2xhc3M9XCJwb3BvdmVyLWNvbnRlbnRcIj48L2Rpdj48L2Rpdj4nfSksZS5mbi5wb3BvdmVyLm5vQ29uZmxpY3Q9ZnVuY3Rpb24oKXtyZXR1cm4gZS5mbi5wb3BvdmVyPW4sdGhpc319KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiB0KHQsbil7dmFyIHI9ZS5wcm94eSh0aGlzLnByb2Nlc3MsdGhpcyksaT1lKHQpLmlzKFwiYm9keVwiKT9lKHdpbmRvdyk6ZSh0KSxzO3RoaXMub3B0aW9ucz1lLmV4dGVuZCh7fSxlLmZuLnNjcm9sbHNweS5kZWZhdWx0cyxuKSx0aGlzLiRzY3JvbGxFbGVtZW50PWkub24oXCJzY3JvbGwuc2Nyb2xsLXNweS5kYXRhLWFwaVwiLHIpLHRoaXMuc2VsZWN0b3I9KHRoaXMub3B0aW9ucy50YXJnZXR8fChzPWUodCkuYXR0cihcImhyZWZcIikpJiZzLnJlcGxhY2UoLy4qKD89I1teXFxzXSskKS8sXCJcIil8fFwiXCIpK1wiIC5uYXYgbGkgPiBhXCIsdGhpcy4kYm9keT1lKFwiYm9keVwiKSx0aGlzLnJlZnJlc2goKSx0aGlzLnByb2Nlc3MoKX10LnByb3RvdHlwZT17Y29uc3RydWN0b3I6dCxyZWZyZXNoOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcyxuO3RoaXMub2Zmc2V0cz1lKFtdKSx0aGlzLnRhcmdldHM9ZShbXSksbj10aGlzLiRib2R5LmZpbmQodGhpcy5zZWxlY3RvcikubWFwKGZ1bmN0aW9uKCl7dmFyIG49ZSh0aGlzKSxyPW4uZGF0YShcInRhcmdldFwiKXx8bi5hdHRyKFwiaHJlZlwiKSxpPS9eI1xcdy8udGVzdChyKSYmZShyKTtyZXR1cm4gaSYmaS5sZW5ndGgmJltbaS5wb3NpdGlvbigpLnRvcCsoIWUuaXNXaW5kb3codC4kc2Nyb2xsRWxlbWVudC5nZXQoMCkpJiZ0LiRzY3JvbGxFbGVtZW50LnNjcm9sbFRvcCgpKSxyXV18fG51bGx9KS5zb3J0KGZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF0tdFswXX0pLmVhY2goZnVuY3Rpb24oKXt0Lm9mZnNldHMucHVzaCh0aGlzWzBdKSx0LnRhcmdldHMucHVzaCh0aGlzWzFdKX0pfSxwcm9jZXNzOmZ1bmN0aW9uKCl7dmFyIGU9dGhpcy4kc2Nyb2xsRWxlbWVudC5zY3JvbGxUb3AoKSt0aGlzLm9wdGlvbnMub2Zmc2V0LHQ9dGhpcy4kc2Nyb2xsRWxlbWVudFswXS5zY3JvbGxIZWlnaHR8fHRoaXMuJGJvZHlbMF0uc2Nyb2xsSGVpZ2h0LG49dC10aGlzLiRzY3JvbGxFbGVtZW50LmhlaWdodCgpLHI9dGhpcy5vZmZzZXRzLGk9dGhpcy50YXJnZXRzLHM9dGhpcy5hY3RpdmVUYXJnZXQsbztpZihlPj1uKXJldHVybiBzIT0obz1pLmxhc3QoKVswXSkmJnRoaXMuYWN0aXZhdGUobyk7Zm9yKG89ci5sZW5ndGg7by0tOylzIT1pW29dJiZlPj1yW29dJiYoIXJbbysxXXx8ZTw9cltvKzFdKSYmdGhpcy5hY3RpdmF0ZShpW29dKX0sYWN0aXZhdGU6ZnVuY3Rpb24odCl7dmFyIG4scjt0aGlzLmFjdGl2ZVRhcmdldD10LGUodGhpcy5zZWxlY3RvcikucGFyZW50KFwiLmFjdGl2ZVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKSxyPXRoaXMuc2VsZWN0b3IrJ1tkYXRhLXRhcmdldD1cIicrdCsnXCJdLCcrdGhpcy5zZWxlY3RvcisnW2hyZWY9XCInK3QrJ1wiXScsbj1lKHIpLnBhcmVudChcImxpXCIpLmFkZENsYXNzKFwiYWN0aXZlXCIpLG4ucGFyZW50KFwiLmRyb3Bkb3duLW1lbnVcIikubGVuZ3RoJiYobj1uLmNsb3Nlc3QoXCJsaS5kcm9wZG93blwiKS5hZGRDbGFzcyhcImFjdGl2ZVwiKSksbi50cmlnZ2VyKFwiYWN0aXZhdGVcIil9fTt2YXIgbj1lLmZuLnNjcm9sbHNweTtlLmZuLnNjcm9sbHNweT1mdW5jdGlvbihuKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHI9ZSh0aGlzKSxpPXIuZGF0YShcInNjcm9sbHNweVwiKSxzPXR5cGVvZiBuPT1cIm9iamVjdFwiJiZuO2l8fHIuZGF0YShcInNjcm9sbHNweVwiLGk9bmV3IHQodGhpcyxzKSksdHlwZW9mIG49PVwic3RyaW5nXCImJmlbbl0oKX0pfSxlLmZuLnNjcm9sbHNweS5Db25zdHJ1Y3Rvcj10LGUuZm4uc2Nyb2xsc3B5LmRlZmF1bHRzPXtvZmZzZXQ6MTB9LGUuZm4uc2Nyb2xsc3B5Lm5vQ29uZmxpY3Q9ZnVuY3Rpb24oKXtyZXR1cm4gZS5mbi5zY3JvbGxzcHk9bix0aGlzfSxlKHdpbmRvdykub24oXCJsb2FkXCIsZnVuY3Rpb24oKXtlKCdbZGF0YS1zcHk9XCJzY3JvbGxcIl0nKS5lYWNoKGZ1bmN0aW9uKCl7dmFyIHQ9ZSh0aGlzKTt0LnNjcm9sbHNweSh0LmRhdGEoKSl9KX0pfSh3aW5kb3cualF1ZXJ5KSwhZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7dmFyIHQ9ZnVuY3Rpb24odCl7dGhpcy5lbGVtZW50PWUodCl9O3QucHJvdG90eXBlPXtjb25zdHJ1Y3Rvcjp0LHNob3c6ZnVuY3Rpb24oKXt2YXIgdD10aGlzLmVsZW1lbnQsbj10LmNsb3Nlc3QoXCJ1bDpub3QoLmRyb3Bkb3duLW1lbnUpXCIpLHI9dC5hdHRyKFwiZGF0YS10YXJnZXRcIiksaSxzLG87cnx8KHI9dC5hdHRyKFwiaHJlZlwiKSxyPXImJnIucmVwbGFjZSgvLiooPz0jW15cXHNdKiQpLyxcIlwiKSk7aWYodC5wYXJlbnQoXCJsaVwiKS5oYXNDbGFzcyhcImFjdGl2ZVwiKSlyZXR1cm47aT1uLmZpbmQoXCIuYWN0aXZlOmxhc3QgYVwiKVswXSxvPWUuRXZlbnQoXCJzaG93XCIse3JlbGF0ZWRUYXJnZXQ6aX0pLHQudHJpZ2dlcihvKTtpZihvLmlzRGVmYXVsdFByZXZlbnRlZCgpKXJldHVybjtzPWUociksdGhpcy5hY3RpdmF0ZSh0LnBhcmVudChcImxpXCIpLG4pLHRoaXMuYWN0aXZhdGUocyxzLnBhcmVudCgpLGZ1bmN0aW9uKCl7dC50cmlnZ2VyKHt0eXBlOlwic2hvd25cIixyZWxhdGVkVGFyZ2V0Oml9KX0pfSxhY3RpdmF0ZTpmdW5jdGlvbih0LG4scil7ZnVuY3Rpb24gbygpe2kucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIikuZmluZChcIj4gLmRyb3Bkb3duLW1lbnUgPiAuYWN0aXZlXCIpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLHQuYWRkQ2xhc3MoXCJhY3RpdmVcIikscz8odFswXS5vZmZzZXRXaWR0aCx0LmFkZENsYXNzKFwiaW5cIikpOnQucmVtb3ZlQ2xhc3MoXCJmYWRlXCIpLHQucGFyZW50KFwiLmRyb3Bkb3duLW1lbnVcIikmJnQuY2xvc2VzdChcImxpLmRyb3Bkb3duXCIpLmFkZENsYXNzKFwiYWN0aXZlXCIpLHImJnIoKX12YXIgaT1uLmZpbmQoXCI+IC5hY3RpdmVcIikscz1yJiZlLnN1cHBvcnQudHJhbnNpdGlvbiYmaS5oYXNDbGFzcyhcImZhZGVcIik7cz9pLm9uZShlLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsbyk6bygpLGkucmVtb3ZlQ2xhc3MoXCJpblwiKX19O3ZhciBuPWUuZm4udGFiO2UuZm4udGFiPWZ1bmN0aW9uKG4pe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgcj1lKHRoaXMpLGk9ci5kYXRhKFwidGFiXCIpO2l8fHIuZGF0YShcInRhYlwiLGk9bmV3IHQodGhpcykpLHR5cGVvZiBuPT1cInN0cmluZ1wiJiZpW25dKCl9KX0sZS5mbi50YWIuQ29uc3RydWN0b3I9dCxlLmZuLnRhYi5ub0NvbmZsaWN0PWZ1bmN0aW9uKCl7cmV0dXJuIGUuZm4udGFiPW4sdGhpc30sZShkb2N1bWVudCkub24oXCJjbGljay50YWIuZGF0YS1hcGlcIiwnW2RhdGEtdG9nZ2xlPVwidGFiXCJdLCBbZGF0YS10b2dnbGU9XCJwaWxsXCJdJyxmdW5jdGlvbih0KXt0LnByZXZlbnREZWZhdWx0KCksZSh0aGlzKS50YWIoXCJzaG93XCIpfSl9KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjt2YXIgdD1mdW5jdGlvbih0LG4pe3RoaXMuJGVsZW1lbnQ9ZSh0KSx0aGlzLm9wdGlvbnM9ZS5leHRlbmQoe30sZS5mbi50eXBlYWhlYWQuZGVmYXVsdHMsbiksdGhpcy5tYXRjaGVyPXRoaXMub3B0aW9ucy5tYXRjaGVyfHx0aGlzLm1hdGNoZXIsdGhpcy5zb3J0ZXI9dGhpcy5vcHRpb25zLnNvcnRlcnx8dGhpcy5zb3J0ZXIsdGhpcy5oaWdobGlnaHRlcj10aGlzLm9wdGlvbnMuaGlnaGxpZ2h0ZXJ8fHRoaXMuaGlnaGxpZ2h0ZXIsdGhpcy51cGRhdGVyPXRoaXMub3B0aW9ucy51cGRhdGVyfHx0aGlzLnVwZGF0ZXIsdGhpcy5zb3VyY2U9dGhpcy5vcHRpb25zLnNvdXJjZSx0aGlzLiRtZW51PWUodGhpcy5vcHRpb25zLm1lbnUpLHRoaXMuc2hvd249ITEsdGhpcy5saXN0ZW4oKX07dC5wcm90b3R5cGU9e2NvbnN0cnVjdG9yOnQsc2VsZWN0OmZ1bmN0aW9uKCl7dmFyIGU9dGhpcy4kbWVudS5maW5kKFwiLmFjdGl2ZVwiKS5hdHRyKFwiZGF0YS12YWx1ZVwiKTtyZXR1cm4gdGhpcy4kZWxlbWVudC52YWwodGhpcy51cGRhdGVyKGUpKS5jaGFuZ2UoKSx0aGlzLmhpZGUoKX0sdXBkYXRlcjpmdW5jdGlvbihlKXtyZXR1cm4gZX0sc2hvdzpmdW5jdGlvbigpe3ZhciB0PWUuZXh0ZW5kKHt9LHRoaXMuJGVsZW1lbnQucG9zaXRpb24oKSx7aGVpZ2h0OnRoaXMuJGVsZW1lbnRbMF0ub2Zmc2V0SGVpZ2h0fSk7cmV0dXJuIHRoaXMuJG1lbnUuaW5zZXJ0QWZ0ZXIodGhpcy4kZWxlbWVudCkuY3NzKHt0b3A6dC50b3ArdC5oZWlnaHQsbGVmdDp0LmxlZnR9KS5zaG93KCksdGhpcy5zaG93bj0hMCx0aGlzfSxoaWRlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuJG1lbnUuaGlkZSgpLHRoaXMuc2hvd249ITEsdGhpc30sbG9va3VwOmZ1bmN0aW9uKHQpe3ZhciBuO3JldHVybiB0aGlzLnF1ZXJ5PXRoaXMuJGVsZW1lbnQudmFsKCksIXRoaXMucXVlcnl8fHRoaXMucXVlcnkubGVuZ3RoPHRoaXMub3B0aW9ucy5taW5MZW5ndGg/dGhpcy5zaG93bj90aGlzLmhpZGUoKTp0aGlzOihuPWUuaXNGdW5jdGlvbih0aGlzLnNvdXJjZSk/dGhpcy5zb3VyY2UodGhpcy5xdWVyeSxlLnByb3h5KHRoaXMucHJvY2Vzcyx0aGlzKSk6dGhpcy5zb3VyY2Usbj90aGlzLnByb2Nlc3Mobik6dGhpcyl9LHByb2Nlc3M6ZnVuY3Rpb24odCl7dmFyIG49dGhpcztyZXR1cm4gdD1lLmdyZXAodCxmdW5jdGlvbihlKXtyZXR1cm4gbi5tYXRjaGVyKGUpfSksdD10aGlzLnNvcnRlcih0KSx0Lmxlbmd0aD90aGlzLnJlbmRlcih0LnNsaWNlKDAsdGhpcy5vcHRpb25zLml0ZW1zKSkuc2hvdygpOnRoaXMuc2hvd24/dGhpcy5oaWRlKCk6dGhpc30sbWF0Y2hlcjpmdW5jdGlvbihlKXtyZXR1cm5+ZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YodGhpcy5xdWVyeS50b0xvd2VyQ2FzZSgpKX0sc29ydGVyOmZ1bmN0aW9uKGUpe3ZhciB0PVtdLG49W10scj1bXSxpO3doaWxlKGk9ZS5zaGlmdCgpKWkudG9Mb3dlckNhc2UoKS5pbmRleE9mKHRoaXMucXVlcnkudG9Mb3dlckNhc2UoKSk/fmkuaW5kZXhPZih0aGlzLnF1ZXJ5KT9uLnB1c2goaSk6ci5wdXNoKGkpOnQucHVzaChpKTtyZXR1cm4gdC5jb25jYXQobixyKX0saGlnaGxpZ2h0ZXI6ZnVuY3Rpb24oZSl7dmFyIHQ9dGhpcy5xdWVyeS5yZXBsYWNlKC9bXFwtXFxbXFxde30oKSorPy4sXFxcXFxcXiR8I1xcc10vZyxcIlxcXFwkJlwiKTtyZXR1cm4gZS5yZXBsYWNlKG5ldyBSZWdFeHAoXCIoXCIrdCtcIilcIixcImlnXCIpLGZ1bmN0aW9uKGUsdCl7cmV0dXJuXCI8c3Ryb25nPlwiK3QrXCI8L3N0cm9uZz5cIn0pfSxyZW5kZXI6ZnVuY3Rpb24odCl7dmFyIG49dGhpcztyZXR1cm4gdD1lKHQpLm1hcChmdW5jdGlvbih0LHIpe3JldHVybiB0PWUobi5vcHRpb25zLml0ZW0pLmF0dHIoXCJkYXRhLXZhbHVlXCIsciksdC5maW5kKFwiYVwiKS5odG1sKG4uaGlnaGxpZ2h0ZXIocikpLHRbMF19KSx0LmZpcnN0KCkuYWRkQ2xhc3MoXCJhY3RpdmVcIiksdGhpcy4kbWVudS5odG1sKHQpLHRoaXN9LG5leHQ6ZnVuY3Rpb24odCl7dmFyIG49dGhpcy4kbWVudS5maW5kKFwiLmFjdGl2ZVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKSxyPW4ubmV4dCgpO3IubGVuZ3RofHwocj1lKHRoaXMuJG1lbnUuZmluZChcImxpXCIpWzBdKSksci5hZGRDbGFzcyhcImFjdGl2ZVwiKX0scHJldjpmdW5jdGlvbihlKXt2YXIgdD10aGlzLiRtZW51LmZpbmQoXCIuYWN0aXZlXCIpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLG49dC5wcmV2KCk7bi5sZW5ndGh8fChuPXRoaXMuJG1lbnUuZmluZChcImxpXCIpLmxhc3QoKSksbi5hZGRDbGFzcyhcImFjdGl2ZVwiKX0sbGlzdGVuOmZ1bmN0aW9uKCl7dGhpcy4kZWxlbWVudC5vbihcImZvY3VzXCIsZS5wcm94eSh0aGlzLmZvY3VzLHRoaXMpKS5vbihcImJsdXJcIixlLnByb3h5KHRoaXMuYmx1cix0aGlzKSkub24oXCJrZXlwcmVzc1wiLGUucHJveHkodGhpcy5rZXlwcmVzcyx0aGlzKSkub24oXCJrZXl1cFwiLGUucHJveHkodGhpcy5rZXl1cCx0aGlzKSksdGhpcy5ldmVudFN1cHBvcnRlZChcImtleWRvd25cIikmJnRoaXMuJGVsZW1lbnQub24oXCJrZXlkb3duXCIsZS5wcm94eSh0aGlzLmtleWRvd24sdGhpcykpLHRoaXMuJG1lbnUub24oXCJjbGlja1wiLGUucHJveHkodGhpcy5jbGljayx0aGlzKSkub24oXCJtb3VzZWVudGVyXCIsXCJsaVwiLGUucHJveHkodGhpcy5tb3VzZWVudGVyLHRoaXMpKS5vbihcIm1vdXNlbGVhdmVcIixcImxpXCIsZS5wcm94eSh0aGlzLm1vdXNlbGVhdmUsdGhpcykpfSxldmVudFN1cHBvcnRlZDpmdW5jdGlvbihlKXt2YXIgdD1lIGluIHRoaXMuJGVsZW1lbnQ7cmV0dXJuIHR8fCh0aGlzLiRlbGVtZW50LnNldEF0dHJpYnV0ZShlLFwicmV0dXJuO1wiKSx0PXR5cGVvZiB0aGlzLiRlbGVtZW50W2VdPT1cImZ1bmN0aW9uXCIpLHR9LG1vdmU6ZnVuY3Rpb24oZSl7aWYoIXRoaXMuc2hvd24pcmV0dXJuO3N3aXRjaChlLmtleUNvZGUpe2Nhc2UgOTpjYXNlIDEzOmNhc2UgMjc6ZS5wcmV2ZW50RGVmYXVsdCgpO2JyZWFrO2Nhc2UgMzg6ZS5wcmV2ZW50RGVmYXVsdCgpLHRoaXMucHJldigpO2JyZWFrO2Nhc2UgNDA6ZS5wcmV2ZW50RGVmYXVsdCgpLHRoaXMubmV4dCgpfWUuc3RvcFByb3BhZ2F0aW9uKCl9LGtleWRvd246ZnVuY3Rpb24odCl7dGhpcy5zdXBwcmVzc0tleVByZXNzUmVwZWF0PX5lLmluQXJyYXkodC5rZXlDb2RlLFs0MCwzOCw5LDEzLDI3XSksdGhpcy5tb3ZlKHQpfSxrZXlwcmVzczpmdW5jdGlvbihlKXtpZih0aGlzLnN1cHByZXNzS2V5UHJlc3NSZXBlYXQpcmV0dXJuO3RoaXMubW92ZShlKX0sa2V5dXA6ZnVuY3Rpb24oZSl7c3dpdGNoKGUua2V5Q29kZSl7Y2FzZSA0MDpjYXNlIDM4OmNhc2UgMTY6Y2FzZSAxNzpjYXNlIDE4OmJyZWFrO2Nhc2UgOTpjYXNlIDEzOmlmKCF0aGlzLnNob3duKXJldHVybjt0aGlzLnNlbGVjdCgpO2JyZWFrO2Nhc2UgMjc6aWYoIXRoaXMuc2hvd24pcmV0dXJuO3RoaXMuaGlkZSgpO2JyZWFrO2RlZmF1bHQ6dGhpcy5sb29rdXAoKX1lLnN0b3BQcm9wYWdhdGlvbigpLGUucHJldmVudERlZmF1bHQoKX0sZm9jdXM6ZnVuY3Rpb24oZSl7dGhpcy5mb2N1c2VkPSEwfSxibHVyOmZ1bmN0aW9uKGUpe3RoaXMuZm9jdXNlZD0hMSwhdGhpcy5tb3VzZWRvdmVyJiZ0aGlzLnNob3duJiZ0aGlzLmhpZGUoKX0sY2xpY2s6ZnVuY3Rpb24oZSl7ZS5zdG9wUHJvcGFnYXRpb24oKSxlLnByZXZlbnREZWZhdWx0KCksdGhpcy5zZWxlY3QoKSx0aGlzLiRlbGVtZW50LmZvY3VzKCl9LG1vdXNlZW50ZXI6ZnVuY3Rpb24odCl7dGhpcy5tb3VzZWRvdmVyPSEwLHRoaXMuJG1lbnUuZmluZChcIi5hY3RpdmVcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIiksZSh0LmN1cnJlbnRUYXJnZXQpLmFkZENsYXNzKFwiYWN0aXZlXCIpfSxtb3VzZWxlYXZlOmZ1bmN0aW9uKGUpe3RoaXMubW91c2Vkb3Zlcj0hMSwhdGhpcy5mb2N1c2VkJiZ0aGlzLnNob3duJiZ0aGlzLmhpZGUoKX19O3ZhciBuPWUuZm4udHlwZWFoZWFkO2UuZm4udHlwZWFoZWFkPWZ1bmN0aW9uKG4pe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgcj1lKHRoaXMpLGk9ci5kYXRhKFwidHlwZWFoZWFkXCIpLHM9dHlwZW9mIG49PVwib2JqZWN0XCImJm47aXx8ci5kYXRhKFwidHlwZWFoZWFkXCIsaT1uZXcgdCh0aGlzLHMpKSx0eXBlb2Ygbj09XCJzdHJpbmdcIiYmaVtuXSgpfSl9LGUuZm4udHlwZWFoZWFkLmRlZmF1bHRzPXtzb3VyY2U6W10saXRlbXM6OCxtZW51Oic8dWwgY2xhc3M9XCJ0eXBlYWhlYWQgZHJvcGRvd24tbWVudVwiPjwvdWw+JyxpdGVtOic8bGk+PGEgaHJlZj1cIiNcIj48L2E+PC9saT4nLG1pbkxlbmd0aDoxfSxlLmZuLnR5cGVhaGVhZC5Db25zdHJ1Y3Rvcj10LGUuZm4udHlwZWFoZWFkLm5vQ29uZmxpY3Q9ZnVuY3Rpb24oKXtyZXR1cm4gZS5mbi50eXBlYWhlYWQ9bix0aGlzfSxlKGRvY3VtZW50KS5vbihcImZvY3VzLnR5cGVhaGVhZC5kYXRhLWFwaVwiLCdbZGF0YS1wcm92aWRlPVwidHlwZWFoZWFkXCJdJyxmdW5jdGlvbih0KXt2YXIgbj1lKHRoaXMpO2lmKG4uZGF0YShcInR5cGVhaGVhZFwiKSlyZXR1cm47bi50eXBlYWhlYWQobi5kYXRhKCkpfSl9KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjt2YXIgdD1mdW5jdGlvbih0LG4pe3RoaXMub3B0aW9ucz1lLmV4dGVuZCh7fSxlLmZuLmFmZml4LmRlZmF1bHRzLG4pLHRoaXMuJHdpbmRvdz1lKHdpbmRvdykub24oXCJzY3JvbGwuYWZmaXguZGF0YS1hcGlcIixlLnByb3h5KHRoaXMuY2hlY2tQb3NpdGlvbix0aGlzKSkub24oXCJjbGljay5hZmZpeC5kYXRhLWFwaVwiLGUucHJveHkoZnVuY3Rpb24oKXtzZXRUaW1lb3V0KGUucHJveHkodGhpcy5jaGVja1Bvc2l0aW9uLHRoaXMpLDEpfSx0aGlzKSksdGhpcy4kZWxlbWVudD1lKHQpLHRoaXMuY2hlY2tQb3NpdGlvbigpfTt0LnByb3RvdHlwZS5jaGVja1Bvc2l0aW9uPWZ1bmN0aW9uKCl7aWYoIXRoaXMuJGVsZW1lbnQuaXMoXCI6dmlzaWJsZVwiKSlyZXR1cm47dmFyIHQ9ZShkb2N1bWVudCkuaGVpZ2h0KCksbj10aGlzLiR3aW5kb3cuc2Nyb2xsVG9wKCkscj10aGlzLiRlbGVtZW50Lm9mZnNldCgpLGk9dGhpcy5vcHRpb25zLm9mZnNldCxzPWkuYm90dG9tLG89aS50b3AsdT1cImFmZml4IGFmZml4LXRvcCBhZmZpeC1ib3R0b21cIixhO3R5cGVvZiBpIT1cIm9iamVjdFwiJiYocz1vPWkpLHR5cGVvZiBvPT1cImZ1bmN0aW9uXCImJihvPWkudG9wKCkpLHR5cGVvZiBzPT1cImZ1bmN0aW9uXCImJihzPWkuYm90dG9tKCkpLGE9dGhpcy51bnBpbiE9bnVsbCYmbit0aGlzLnVucGluPD1yLnRvcD8hMTpzIT1udWxsJiZyLnRvcCt0aGlzLiRlbGVtZW50LmhlaWdodCgpPj10LXM/XCJib3R0b21cIjpvIT1udWxsJiZuPD1vP1widG9wXCI6ITE7aWYodGhpcy5hZmZpeGVkPT09YSlyZXR1cm47dGhpcy5hZmZpeGVkPWEsdGhpcy51bnBpbj1hPT1cImJvdHRvbVwiP3IudG9wLW46bnVsbCx0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKHUpLmFkZENsYXNzKFwiYWZmaXhcIisoYT9cIi1cIithOlwiXCIpKX07dmFyIG49ZS5mbi5hZmZpeDtlLmZuLmFmZml4PWZ1bmN0aW9uKG4pe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgcj1lKHRoaXMpLGk9ci5kYXRhKFwiYWZmaXhcIikscz10eXBlb2Ygbj09XCJvYmplY3RcIiYmbjtpfHxyLmRhdGEoXCJhZmZpeFwiLGk9bmV3IHQodGhpcyxzKSksdHlwZW9mIG49PVwic3RyaW5nXCImJmlbbl0oKX0pfSxlLmZuLmFmZml4LkNvbnN0cnVjdG9yPXQsZS5mbi5hZmZpeC5kZWZhdWx0cz17b2Zmc2V0OjB9LGUuZm4uYWZmaXgubm9Db25mbGljdD1mdW5jdGlvbigpe3JldHVybiBlLmZuLmFmZml4PW4sdGhpc30sZSh3aW5kb3cpLm9uKFwibG9hZFwiLGZ1bmN0aW9uKCl7ZSgnW2RhdGEtc3B5PVwiYWZmaXhcIl0nKS5lYWNoKGZ1bmN0aW9uKCl7dmFyIHQ9ZSh0aGlzKSxuPXQuZGF0YSgpO24ub2Zmc2V0PW4ub2Zmc2V0fHx7fSxuLm9mZnNldEJvdHRvbSYmKG4ub2Zmc2V0LmJvdHRvbT1uLm9mZnNldEJvdHRvbSksbi5vZmZzZXRUb3AmJihuLm9mZnNldC50b3A9bi5vZmZzZXRUb3ApLHQuYWZmaXgobil9KX0pfSh3aW5kb3cualF1ZXJ5KTsiLCIvLyQod2luZG93KS5sb2FkKGZ1bmN0aW9uKCkge1xyXG4vL2FjY29yZGlvbi5qc1xyXG52YXIgYWNjb3JkaW9uQ29udHJvbCA9ICQoJy5hY2NvcmRpb24gLmFjY29yZGlvbi1jb250cm9sJyk7XHJcbmFjY29yZGlvbkNvbnRyb2wub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICR0aGlzID0gJCh0aGlzKTtcclxuICAgICRhY2NvcmRpb24gPSAkdGhpcy5jbG9zZXN0KCcuYWNjb3JkaW9uJyk7XHJcblxyXG4gICAgaWYgKCRhY2NvcmRpb24uaGFzQ2xhc3MoJ29wZW4nKSkge1xyXG4gICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLmhpZGUoMzAwKTtcclxuICAgICAgJGFjY29yZGlvbi5yZW1vdmVDbGFzcygnb3BlbicpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLnNob3coMzAwKTtcclxuICAgICAgJGFjY29yZGlvbi5hZGRDbGFzcygnb3BlbicpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSk7XHJcbmFjY29yZGlvbkNvbnRyb2wuc2hvdygpO1xyXG4vL30pXHJcblxyXG5cclxuLy9mdW5jdGlvbnMuanNcclxub2JqZWN0cyA9IGZ1bmN0aW9uIChhLGIpIHtcclxuICB2YXIgYyA9IGIsXHJcbiAgICBrZXk7XHJcbiAgZm9yIChrZXkgaW4gYSkge1xyXG4gICAgaWYgKGEuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICBjW2tleV0gPSBrZXkgaW4gYiA/IGJba2V5XSA6IGFba2V5XTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGM7XHJcbn07XHJcblxyXG4vL9Cf0YDQvtCy0LXRgNC60LAg0LHQuNGC0Ysg0LrQsNGA0YLQuNC90L7Qui5cclxuLy8gaW1mLmpzXHJcbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCl7XHJcbiAgICBkYXRhPXRoaXM7XHJcbiAgICBpZihkYXRhLnR5cGU9PTApIHtcclxuICAgICAgZGF0YS5pbWcuYXR0cignc3JjJywgZGF0YS5zcmMpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIGRhdGEuaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJytkYXRhLnNyYysnKScpO1xyXG4gICAgICBkYXRhLmltZy5yZW1vdmVDbGFzcygnbm9fYXZhJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvL9GC0LXRgdGCINC70L7Qs9C+INC80LDQs9Cw0LfQuNC90LBcclxuICBpbWdzPSQoJ3NlY3Rpb246bm90KC5uYXZpZ2F0aW9uKScpLmZpbmQoJy5sb2dvIGltZycpO1xyXG4gIGZvciAodmFyIGk9MDtpPGltZ3MubGVuZ3RoO2krKyl7XHJcbiAgICBpbWc9aW1ncy5lcShpKTtcclxuICAgIHNyYz1pbWcuYXR0cignc3JjJyk7XHJcbiAgICBpbWcuYXR0cignc3JjJywnL2ltYWdlcy90ZW1wbGF0ZS1sb2dvLmpwZycpO1xyXG4gICAgZGF0YT17XHJcbiAgICAgIHNyYzpzcmMsXHJcbiAgICAgIGltZzppbWcsXHJcbiAgICAgIHR5cGU6MCAvLyDQtNC70Y8gaW1nW3NyY11cclxuICAgIH07XHJcbiAgICBpbWFnZT0kKCc8aW1nLz4nLHtcclxuICAgICAgc3JjOnNyY1xyXG4gICAgfSkub24oJ2xvYWQnLGltZ19sb2FkX2ZpbmlzaC5iaW5kKGRhdGEpKVxyXG4gIH1cclxuXHJcbiAgLy/RgtC10YHRgiDQsNCy0LDRgtCw0YDQvtC6INCyINC60L7QvNC10L3RgtCw0YDQuNGP0YVcclxuICBpbWdzPSQoJy5jb21tZW50LXBob3RvJyk7XHJcbiAgZm9yICh2YXIgaT0wO2k8aW1ncy5sZW5ndGg7aSsrKXtcclxuICAgIGltZz1pbWdzLmVxKGkpO1xyXG4gICAgaWYoaW1nLmhhc0NsYXNzKCdub19hdmEnKSl7XHJcbiAgICAgIGNvbnRpbnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBzcmM9aW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScpO1xyXG4gICAgc3JjPXNyYy5yZXBsYWNlKCd1cmwoXCInLCcnKTtcclxuICAgIHNyYz1zcmMucmVwbGFjZSgnXCIpJywnJyk7XHJcbiAgICBpbWcuYWRkQ2xhc3MoJ25vX2F2YScpO1xyXG5cclxuICAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoL2ltYWdlcy9ub19hdmEucG5nKScpO1xyXG4gICAgZGF0YT17XHJcbiAgICAgIHNyYzpzcmMsXHJcbiAgICAgIGltZzppbWcsXHJcbiAgICAgIHR5cGU6MSAvLyDQtNC70Y8g0YTQvtC90L7QstGL0YUg0LrQsNGA0YLQuNC90L7QulxyXG4gICAgfTtcclxuICAgIGltYWdlPSQoJzxpbWcvPicse1xyXG4gICAgICBzcmM6c3JjXHJcbiAgICB9KS5vbignbG9hZCcsaW1nX2xvYWRfZmluaXNoLmJpbmQoZGF0YSkpXHJcbiAgfVxyXG59KTtcclxuXHJcbihmdW5jdGlvbigpIHtcclxuICBlbHM9JCgnLmFqYXhfbG9hZCcpO1xyXG4gIGZvcihpPTA7aTxlbHMubGVuZ3RoO2krKyl7XHJcbiAgICBlbD1lbHMuZXEoaSk7XHJcbiAgICB1cmw9ZWwuYXR0cigncmVzJyk7XHJcbiAgICAkLmdldCh1cmwsZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgJHRoaXM9JCh0aGlzKTtcclxuICAgICAgJHRoaXMuaHRtbChkYXRhKTtcclxuICAgICAgYWpheEZvcm0oJHRoaXMpO1xyXG4gICAgfS5iaW5kKGVsKSlcclxuICB9XHJcbn0pKCk7XHJcblxyXG5cclxuLy9mb3Jtcy5qc1xyXG4kKCdpbnB1dFt0eXBlPWZpbGVdJykub24oJ2NoYW5nZScsZnVuY3Rpb24oZXZ0KXtcclxuICB2YXIgZmlsZSA9IGV2dC50YXJnZXQuZmlsZXM7IC8vIEZpbGVMaXN0IG9iamVjdFxyXG4gIHZhciBmID0gZmlsZVswXTtcclxuICAvLyBPbmx5IHByb2Nlc3MgaW1hZ2UgZmlsZXMuXHJcbiAgaWYgKCFmLnR5cGUubWF0Y2goJ2ltYWdlLionKSkge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuXHJcbiAgZGF0YT0ge1xyXG4gICAgJ2VsJzogdGhpcyxcclxuICAgICdmJzogZlxyXG4gIH07XHJcbiAgcmVhZGVyLm9ubG9hZCA9IChmdW5jdGlvbihkYXRhKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xyXG4gICAgICBpbWc9JCgnW2Zvcj1cIicrZGF0YS5lbC5uYW1lKydcIl0nKTtcclxuICAgICAgaWYoaW1nLmxlbmd0aD4wKXtcclxuICAgICAgICBpbWcuYXR0cignc3JjJyxlLnRhcmdldC5yZXN1bHQpXHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfSkoZGF0YSk7XHJcbiAgLy8gUmVhZCBpbiB0aGUgaW1hZ2UgZmlsZSBhcyBhIGRhdGEgVVJMLlxyXG4gIHJlYWRlci5yZWFkQXNEYXRhVVJMKGYpO1xyXG59KTtcclxuXHJcbiQoJ2JvZHknKS5vbignY2xpY2snLCdhLmFqYXhGb3JtT3BlbicsZnVuY3Rpb24oZSl7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIGhyZWY9dGhpcy5ocmVmLnNwbGl0KCcjJyk7XHJcbiAgaHJlZj1ocmVmW2hyZWYubGVuZ3RoLTFdO1xyXG5cclxuICBkYXRhPXtcclxuICAgIGJ1dHRvblllczpmYWxzZSxcclxuICAgIG5vdHlmeV9jbGFzczpcIm5vdGlmeV93aGl0ZSBsb2FkaW5nXCIsXHJcbiAgICBxdWVzdGlvbjonJ1xyXG4gIH07XHJcbiAgbW9kYWxfY2xhc3M9JCh0aGlzKS5kYXRhKCdtb2RhbC1jbGFzcycpO1xyXG5cclxuICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XHJcbiAgJC5nZXQoJy8nK2hyZWYsZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAkKCcubm90aWZ5X2JveCcpLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICAkKCcubm90aWZ5X2JveCAubm90aWZ5X2NvbnRlbnQnKS5odG1sKGRhdGEuaHRtbCk7XHJcbiAgICBhamF4Rm9ybSgkKCcubm90aWZ5X2JveCAubm90aWZ5X2NvbnRlbnQnKSk7XHJcbiAgICBpZihtb2RhbF9jbGFzcyl7XHJcbiAgICAgICQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCAucm93JykuYWRkQ2xhc3MobW9kYWxfY2xhc3MpO1xyXG4gICAgfVxyXG4gIH0sJ2pzb24nKVxyXG59KTtcclxuXHJcbi8vICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKHtcclxuLy8gICBkZWxheToge1xyXG4vLyAgICAgc2hvdzogNTAwLCBoaWRlOiAyMDAwXHJcbi8vICAgfVxyXG4vLyB9KTtcclxuXHJcbi8vICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS5vbignY2xpY2snLGZ1bmN0aW9uIChlKSB7XHJcbi8vICAgJHRoaXM9JCh0aGlzKTtcclxuLy8gICBpZigkdGhpcy5jbG9zZXN0KCd1bCcpLmhhc0NsYXNzKCdwYWdpbmF0ZScpKSB7XHJcbi8vICAgICAvL9C00LvRjyDQv9Cw0LPQuNC90LDRhtC40Lgg0YHRgdGL0LvQutCwINC00L7Qu9C20L3QsCDRgNCw0LHQvtGC0LDRgtGMXHJcbi8vICAgICByZXR1cm4gdHJ1ZTtcclxuLy8gICB9XHJcbi8vICAgaWYoJHRoaXMuaGFzQ2xhc3MoJ3dvcmtIcmVmJykpe1xyXG4vLyAgICAgLy/QldGB0LvQuCDRgdGB0YvQu9C60LAg0L/QvtC80LXRh9C10L3QvdCwINC60LDQuiDRgNCw0LHQvtGH0LDRjyDRgtC+INC90YPQttC90L4g0L/QtdGA0LXRhdC+0LTQuNGC0YxcclxuLy8gICAgIHJldHVybiB0cnVlO1xyXG4vLyAgIH1cclxuLy8gICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbi8vICAgcmV0dXJuIGZhbHNlO1xyXG4vLyB9KTtcclxuXHJcblxyXG4kKCcuYWpheC1hY3Rpb24nKS5jbGljayhmdW5jdGlvbihlKSB7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIHZhciBzdGF0dXMgPSAkKHRoaXMpLmRhdGEoJ3ZhbHVlJyk7XHJcbiAgdmFyIGhyZWYgPSAkKHRoaXMpLmF0dHIoJ2hyZWYnKTtcclxuICB2YXIgaWRzID0gJCgnI2dyaWQtYWpheC1hY3Rpb24nKS55aWlHcmlkVmlldygnZ2V0U2VsZWN0ZWRSb3dzJyk7XHJcbiAgaWYgKGlkcy5sZW5ndGggPiAwKSB7XHJcbiAgICBpZiAoIWNvbmZpcm0oJ9Cf0L7QtNGC0LLQtdGA0LTQuNGC0LUg0LjQt9C80LXQvdC10L3QuNC1INC30LDQv9C40YHQtdC5JykpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICAkLmFqYXgoe1xyXG4gICAgICB1cmw6IGhyZWYsXHJcbiAgICAgIHR5cGU6ICdwb3N0JyxcclxuICAgICAgZGF0YVR5cGU6ICdqc29uJyxcclxuICAgICAgZGF0YToge1xyXG4gICAgICAgIHN0YXR1czogc3RhdHVzLFxyXG4gICAgICAgIGlkOiBpZHNcclxuICAgICAgfVxyXG4gICAgfSkuZG9uZShmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICQoJyNncmlkLWFqYXgtYWN0aW9uJykueWlpR3JpZFZpZXcoXCJhcHBseUZpbHRlclwiKTtcclxuICAgICAgaWYgKGRhdGEuZXJyb3IgIT0gZmFsc2UpIHtcclxuICAgICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Cf0YDQvtC40LfQvtGI0LvQsCDQvtGI0LjQsdC60LAhJyx0eXBlOidlcnInfSlcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Ce0L/QtdGA0LDRhtC40Y8g0LLRi9C/0L7Qu9C90LXQvdCwIScsdHlwZTonc3VjY2Vzcyd9KVxyXG4gICAgICB9XHJcblxyXG4gICAgfSkuZmFpbChmdW5jdGlvbihkYXRhKXtcclxuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0J/RgNC+0LjQt9C+0YjQu9CwINC+0YjQuNCx0LrQsCEnLHR5cGU6J2Vycid9KVxyXG4gICAgfSk7XHJcbiAgfSBlbHNlIHtcclxuICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Cd0LXQvtCx0YXQvtC00LjQvNC+INCy0YvQsdGA0LDRgtGMINGN0LvQtdC80LXQvdGC0YshJyx0eXBlOidlcnInfSlcclxuICB9XHJcbn0pO1xyXG5cclxuJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAkKCcuZWRpdGlibGVbZGlzYWJsZWRdJykub24oJ2NsaWNrJyxmdW5jdGlvbiAoKSB7XHJcbiAgICAkKHRoaXMpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpXHJcbiAgfSlcclxuXHJcbiAgJCgnLmVkaXRpYmxlW2Rpc2FibGVkXScpLm9uKCdtb3VzZWRvd24nLGZ1bmN0aW9uICgpIHtcclxuICAgICQodGhpcykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSlcclxuICB9KVxyXG5cclxuICBidG49JzxidXR0b24gY2xhc3M9dW5sb2NrPjxpIGNsYXNzPVwiZmEgZmEtdW5sb2NrIGZhLTRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+PC9idXR0b24+JztcclxuICBidG49JChidG4pO1xyXG4gIGJ0bi5vbignY2xpY2snLGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAkdGhpcz0kKHRoaXMpO1xyXG4gICAgaW5wPSR0aGlzLnByZXYoKTtcclxuICAgIGlucC5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9KTtcclxuICAkKCcuZWRpdGlibGVbZGlzYWJsZWRdJykuYWZ0ZXIoYnRuKVxyXG59KTtcclxuXHJcbiQoZnVuY3Rpb24oKSB7XHJcbiAgdmFyIG1lbnUgPSB7XHJcbiAgICBjb250cm9sOiB7XHJcbiAgICAgIGhlYWRlclN0b3Jlc01lbnU6ICQoXCIjdG9wXCIpLmZpbmQoXCIuc3VibWVudS1oYW5kbFwiKSxcclxuICAgICAgc3RvcmVzU3VibWVudXM6ICQoXCIjdG9wXCIpLmZpbmQoXCIuc3VibWVudS1oYW5kbFwiKS5maW5kKFwiLnN1Ym1lbnVcIiksXHJcbiAgICAgIGV2ZW50czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHNlbGYuaGVhZGVyU3RvcmVzTWVudS5ob3ZlcihmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHZhciBzdWJtZW51ID0gJCh0aGlzKS5maW5kKCcuc3VibWVudScpO1xyXG4gICAgICAgICAgaWYoJCh3aW5kb3cpLndpZHRoKCkgPiA5OTEpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYuc3RvcmVIaWRlKTtcclxuICAgICAgICAgICAgc2VsZi5zdG9yZXNTdWJtZW51cy5jc3MoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcclxuICAgICAgICAgICAgc2VsZi5zdG9yZVNob3cgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIHN1Ym1lbnUuY2xlYXJRdWV1ZSgpO1xyXG4gICAgICAgICAgICAgIHN1Ym1lbnUuY3NzKFwiZGlzcGxheVwiLCBcImJsb2NrXCIpLmFuaW1hdGUoe1wib3BhY2l0eVwiOiAxfSwgMzUwKTtcclxuICAgICAgICAgICAgICAvLyBzZWxmLnN0b3Jlc1N1Ym1lbnUuY2xlYXJRdWV1ZSgpO1xyXG4gICAgICAgICAgICAgIC8vIHNlbGYuc3RvcmVzU3VibWVudS5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIikuYW5pbWF0ZSh7XCJvcGFjaXR5XCI6IDF9LCAzNTApO1xyXG4gICAgICAgICAgICB9LCAyMDApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgdmFyIHN1Ym1lbnUgPSAkKHRoaXMpLmZpbmQoJy5zdWJtZW51Jyk7XHJcbiAgICAgICAgICBpZigkKHdpbmRvdykud2lkdGgoKSA+IDk5MSkge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoc2VsZi5zdG9yZVNob3cpO1xyXG4gICAgICAgICAgICBzZWxmLnN0b3JlSGlkZSA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgc3VibWVudS5jbGVhclF1ZXVlKCk7XHJcbiAgICAgICAgICAgICAgc3VibWVudS5hbmltYXRlKHtcIm9wYWNpdHlcIjogMH0sIDIwMCwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIC8vIHNlbGYuc3RvcmVzU3VibWVudS5jbGVhclF1ZXVlKCk7XHJcbiAgICAgICAgICAgICAgLy8gc2VsZi5zdG9yZXNTdWJtZW51LmFuaW1hdGUoe1wib3BhY2l0eVwiOiAwfSwgMjAwLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAvLyAgICAgJCh0aGlzKS5jc3MoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcclxuICAgICAgICAgICAgICAvLyB9KTtcclxuICAgICAgICAgICAgfSwgMzAwKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcbiAgbWVudS5jb250cm9sLmV2ZW50cygpO1xyXG59KTtcclxuXHJcbi8v0YfRgtC+INCxINC40YTRgNC10LnQvNGLINC4INC60LDRgNGC0LjQvdC60Lgg0L3QtSDQstGL0LvQsNC30LjQu9C4XHJcbi8vaW1nLmpzXHJcbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgLyptX3cgPSAkKCcudGV4dC1jb250ZW50Jykud2lkdGgoKVxyXG4gIGlmIChtX3cgPCA1MCltX3cgPSBzY3JlZW4ud2lkdGggLSA0MCovXHJcbiAgdmFyIG13PXNjcmVlbi53aWR0aC00MDtcclxuXHJcbiAgZnVuY3Rpb24gb3B0aW1hc2UoZWwpe1xyXG4gICAgdmFyIHBhcmVudCA9IGVsLnBhcmVudCgpO1xyXG4gICAgaWYocGFyZW50Lmxlbmd0aD09MCB8fCBwYXJlbnRbMF0udGFnTmFtZT09XCJBXCIpe1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBtX3cgPSBwYXJlbnQud2lkdGgoKS0zMDtcclxuICAgIHZhciB3PWVsLndpZHRoKCk7XHJcbiAgICBlbC53aWR0aCgnYXV0bycpO1xyXG4gICAgaWYoZWxbMF0udGFnTmFtZT09XCJJTUdcIiAmJiB3PmVsLndpZHRoKCkpdz1lbC53aWR0aCgpO1xyXG5cclxuICAgIGlmIChtdz41MCAmJiBtX3cgPiBtdyltX3cgPSBtdztcclxuICAgIGlmICh3Pm1fdyA+IG1fdykge1xyXG4gICAgICBpZihlbFswXS50YWdOYW1lPT1cIklGUkFNRVwiKXtcclxuICAgICAgICBrID0gdyAvIG1fdztcclxuICAgICAgICBlbC5oZWlnaHQoZWwuaGVpZ2h0KCkgLyBrKTtcclxuICAgICAgfVxyXG4gICAgICBlbC53aWR0aChtX3cpXHJcbiAgICB9ZWxzZXtcclxuICAgICAgZWwud2lkdGgodyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbWdfbG9hZF9maW5pc2goKXtcclxuICAgIHZhciBlbD0kKHRoaXMpO1xyXG4gICAgb3B0aW1hc2UoZWwpO1xyXG4gIH1cclxuXHJcbiAgdmFyIHAgPSAkKCcuY29udGFpbmVyIGltZywuY29udGFpbmVyIGlmcmFtZScpO1xyXG4gICQoJy5jb250YWluZXIgaW1nJykuaGVpZ2h0KCdhdXRvJyk7XHJcbiAgLy8kKCcuY29udGFpbmVyIGltZycpLndpZHRoKCdhdXRvJyk7XHJcbiAgZm9yIChpID0gMDsgaSA8IHAubGVuZ3RoOyBpKyspIHtcclxuICAgIGVsID0gcC5lcShpKTtcclxuICAgIGlmKGVsWzBdLnRhZ05hbWU9PVwiSUZSQU1FXCIpIHtcclxuICAgICAgb3B0aW1hc2UoZWwpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIHZhciBzcmM9ZWwuYXR0cignc3JjJyk7XHJcbiAgICAgIGltYWdlID0gJCgnPGltZy8+Jywge1xyXG4gICAgICAgIHNyYzogc3JjXHJcbiAgICAgIH0pO1xyXG4gICAgICBpbWFnZS5vbignbG9hZCcsIGltZ19sb2FkX2ZpbmlzaC5iaW5kKGVsKSk7XHJcblxyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcblxyXG4vL9C10YHQu9C4INC+0YLQutGA0YvRgtC+INC60LDQuiDQtNC+0YfQtdGA0L3QtdC1XHJcbi8vcGFyZW50c19vcGVuX3dpbmRvd3MuanNcclxuKGZ1bmN0aW9uKCl7XHJcbiAgaWYoIXdpbmRvdy5vcGVuZXIpcmV0dXJuO1xyXG4gIGlmKGRvY3VtZW50LnJlZmVycmVyLmluZGV4T2YoJ3NlY3JldGRpc2NvdW50ZXInKTwwKXJldHVybjtcclxuXHJcbiAgaHJlZj13aW5kb3cub3BlbmVyLmxvY2F0aW9uLmhyZWY7XHJcbiAgaWYoXHJcbiAgICBocmVmLmluZGV4T2YoJ3NvY2lhbHMnKT4wIHx8XHJcbiAgICBocmVmLmluZGV4T2YoJ2xvZ2luJyk+MCB8fFxyXG4gICAgaHJlZi5pbmRleE9mKCdhZG1pbicpPjAgfHxcclxuICAgIGhyZWYuaW5kZXhPZignYWNjb3VudCcpPjBcclxuICApe1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICBpZihocmVmLmluZGV4T2YoJ3N0b3JlJyk+MCB8fCBocmVmLmluZGV4T2YoJ2NvdXBvbicpPjAgfHwgaHJlZi5pbmRleE9mKCdzZXR0aW5ncycpPjApe1xyXG4gICAgd2luZG93Lm9wZW5lci5sb2NhdGlvbi5yZWxvYWQoKTtcclxuICB9ZWxzZXtcclxuICAgIHdpbmRvdy5vcGVuZXIubG9jYXRpb24uaHJlZj1sb2NhdGlvbi5ocmVmO1xyXG4gIH1cclxuICB3aW5kb3cuY2xvc2UoKTtcclxufSkoKTtcclxuXHJcbi8vaW1nLmpzXHJcbihmdW5jdGlvbigpIHtcclxuXHJcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCl7XHJcbiAgICB2YXIgZGF0YT10aGlzO1xyXG4gICAgdmFyIGltZyA9IGRhdGEuaW1nO1xyXG4gICAgaW1nLndyYXAoJzxkaXYgY2xhc3M9XCJkb3dubG9hZFwiPjwvZGl2PicpO1xyXG4gICAgdmFyIHdyYXA9aW1nLnBhcmVudCgpO1xyXG4gICAgJCgnYm9keScpLmFwcGVuZChkYXRhLmVsKTtcclxuICAgIHNpemU9ZGF0YS5lbC53aWR0aCgpK1wieFwiK2RhdGEuZWwuaGVpZ2h0KCk7XHJcbiAgICBkYXRhLmVsLnJlbW92ZSgpO1xyXG4gICAgd3JhcC5hcHBlbmQoJzxzcGFuPicrc2l6ZSsnPC9zcGFuPiA8YSBocmVmPVwiJytkYXRhLnNyYysnXCIgZG93bmxvYWQ+0KHQutCw0YfQsNGC0Yw8L2E+JylcclxuICB9XHJcblxyXG4gIHZhciBpbWdzID0gJCgnLmRvd25sb2Fkc19pbWcgaW1nJyk7XHJcbiAgZm9yKHZhciBpPTA7aTxpbWdzLmxlbmd0aDtpKyspIHtcclxuICAgIHZhciBpbWc9aW1ncy5lcShpKTtcclxuICAgIHZhciBzcmM9aW1nLmF0dHIoJ3NyYycpO1xyXG4gICAgaW1hZ2UgPSAkKCc8aW1nLz4nLCB7XHJcbiAgICAgIHNyYzogc3JjXHJcbiAgICB9KTtcclxuICAgIGRhdGEgPSB7XHJcbiAgICAgIHNyYzogc3JjLFxyXG4gICAgICBpbWc6IGltZyxcclxuICAgICAgZWw6aW1hZ2VcclxuICAgIH07XHJcbiAgICBpbWFnZS5vbignbG9hZCcsIGltZ19sb2FkX2ZpbmlzaC5iaW5kKGRhdGEpKVxyXG4gIH1cclxufSkoKTsiLCJ2YXIgbm90aWZpY2F0aW9uID0gKGZ1bmN0aW9uICgpIHtcclxuICB2YXIgY29udGVpbmVyO1xyXG4gIHZhciBtb3VzZU92ZXIgPSAwO1xyXG4gIHZhciB0aW1lckNsZWFyQWxsID0gbnVsbDtcclxuICB2YXIgYW5pbWF0aW9uRW5kID0gJ3dlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmQnO1xyXG4gIHZhciB0aW1lID0gMTAwMDA7XHJcblxyXG4gIHZhciBub3RpZmljYXRpb25fYm94ID0gZmFsc2U7XHJcbiAgdmFyIGlzX2luaXQgPSBmYWxzZTtcclxuICB2YXIgY29uZmlybV9vcHQgPSB7XHJcbiAgICAvLyB0aXRsZTogbGcoJ2RlbGV0aW5nJyksXHJcbiAgICAvLyBxdWVzdGlvbjogbGcoJ2FyZV95b3Vfc3VyZV90b19kZWxldGUnKSxcclxuICAgIC8vIGJ1dHRvblllczogbGcoJ3llcycpLFxyXG4gICAgLy8gYnV0dG9uTm86IGxnKCdubycpLFxyXG4gICAgY2FsbGJhY2tZZXM6IGZhbHNlLFxyXG4gICAgY2FsbGJhY2tObzogZmFsc2UsXHJcbiAgICBvYmo6IGZhbHNlLFxyXG4gICAgYnV0dG9uVGFnOiAnZGl2JyxcclxuICAgIGJ1dHRvblllc0RvcDogJycsXHJcbiAgICBidXR0b25Ob0RvcDogJydcclxuICB9O1xyXG4gIHZhciBhbGVydF9vcHQgPSB7XHJcbiAgICB0aXRsZTogXCJcIixcclxuICAgIHF1ZXN0aW9uOiAnbWVzc2FnZScsXHJcbiAgICAvLyBidXR0b25ZZXM6IGxnKCd5ZXMnKSxcclxuICAgIGNhbGxiYWNrWWVzOiBmYWxzZSxcclxuICAgIGJ1dHRvblRhZzogJ2RpdicsXHJcbiAgICBvYmo6IGZhbHNlXHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gdGVzdElwaG9uZSgpIHtcclxuICAgIGlmICghLyhpUGhvbmV8aVBhZHxpUG9kKS4qKE9TIDExKS8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSkgcmV0dXJuO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveC5jc3MoJ3Bvc2l0aW9uJywgJ2Fic29sdXRlJyk7XHJcbiAgICBub3RpZmljYXRpb25fYm94LmNzcygndG9wJywgJChkb2N1bWVudCkuc2Nyb2xsVG9wKCkpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW5pdCgpIHtcclxuICAgIGlzX2luaXQgPSB0cnVlO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveCA9ICQoJy5ub3RpZmljYXRpb25fYm94Jyk7XHJcbiAgICBpZiAobm90aWZpY2F0aW9uX2JveC5sZW5ndGggPiAwKXJldHVybjtcclxuXHJcbiAgICAkKCdib2R5JykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nbm90aWZpY2F0aW9uX2JveCc+PC9kaXY+XCIpO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveCA9ICQoJy5ub3RpZmljYXRpb25fYm94Jyk7XHJcblxyXG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCAnLm5vdGlmeV9jb250cm9sJywgY2xvc2VNb2RhbCk7XHJcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsICcubm90aWZ5X2Nsb3NlJywgY2xvc2VNb2RhbCk7XHJcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsIGNsb3NlTW9kYWxGb24pO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY2xvc2VNb2RhbCgpIHtcclxuICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnc2hvd19ub3RpZmknKTtcclxuICAgICQoJy5ub3RpZmljYXRpb25fYm94IC5ub3RpZnlfY29udGVudCcpLmh0bWwoJycpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY2xvc2VNb2RhbEZvbihlKSB7XHJcbiAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xyXG4gICAgaWYgKHRhcmdldC5jbGFzc05hbWUgPT0gXCJub3RpZmljYXRpb25fYm94XCIpIHtcclxuICAgICAgY2xvc2VNb2RhbCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdmFyIF9zZXRVcExpc3RlbmVycyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnLm5vdGlmaWNhdGlvbl9jbG9zZScsIF9jbG9zZVBvcHVwKTtcclxuICAgICQoJ2JvZHknKS5vbignbW91c2VlbnRlcicsICcubm90aWZpY2F0aW9uX2NvbnRhaW5lcicsIF9vbkVudGVyKTtcclxuICAgICQoJ2JvZHknKS5vbignbW91c2VsZWF2ZScsICcubm90aWZpY2F0aW9uX2NvbnRhaW5lcicsIF9vbkxlYXZlKTtcclxuICB9O1xyXG5cclxuICB2YXIgX29uRW50ZXIgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGlmIChldmVudClldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgaWYgKHRpbWVyQ2xlYXJBbGwgIT0gbnVsbCkge1xyXG4gICAgICBjbGVhclRpbWVvdXQodGltZXJDbGVhckFsbCk7XHJcbiAgICAgIHRpbWVyQ2xlYXJBbGwgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgY29udGVpbmVyLmZpbmQoJy5ub3RpZmljYXRpb25faXRlbScpLmVhY2goZnVuY3Rpb24gKGkpIHtcclxuICAgICAgdmFyIG9wdGlvbiA9ICQodGhpcykuZGF0YSgnb3B0aW9uJyk7XHJcbiAgICAgIGlmIChvcHRpb24udGltZXIpIHtcclxuICAgICAgICBjbGVhclRpbWVvdXQob3B0aW9uLnRpbWVyKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBtb3VzZU92ZXIgPSAxO1xyXG4gIH07XHJcblxyXG4gIHZhciBfb25MZWF2ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGNvbnRlaW5lci5maW5kKCcubm90aWZpY2F0aW9uX2l0ZW0nKS5lYWNoKGZ1bmN0aW9uIChpKSB7XHJcbiAgICAgICR0aGlzID0gJCh0aGlzKTtcclxuICAgICAgdmFyIG9wdGlvbiA9ICR0aGlzLmRhdGEoJ29wdGlvbicpO1xyXG4gICAgICBpZiAob3B0aW9uLnRpbWUgPiAwKSB7XHJcbiAgICAgICAgb3B0aW9uLnRpbWVyID0gc2V0VGltZW91dChfY2xvc2VQb3B1cC5iaW5kKG9wdGlvbi5jbG9zZSksIG9wdGlvbi50aW1lIC0gMTUwMCArIDEwMCAqIGkpO1xyXG4gICAgICAgICR0aGlzLmRhdGEoJ29wdGlvbicsIG9wdGlvbilcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBtb3VzZU92ZXIgPSAwO1xyXG4gIH07XHJcblxyXG4gIHZhciBfY2xvc2VQb3B1cCA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgaWYgKGV2ZW50KWV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKS5wYXJlbnQoKTtcclxuICAgICR0aGlzLm9uKGFuaW1hdGlvbkVuZCwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKHRoaXMpLnJlbW92ZSgpO1xyXG4gICAgfSk7XHJcbiAgICAkdGhpcy5hZGRDbGFzcygnbm90aWZpY2F0aW9uX2hpZGUnKVxyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIGFsZXJ0KGRhdGEpIHtcclxuICAgIGlmICghZGF0YSlkYXRhID0ge307XHJcbiAgICBhbGVydF9vcHQgPSBvYmplY3RzKGFsZXJ0X29wdCwge1xyXG4gICAgICAgIGJ1dHRvblllczogbGcoJ3llcycpXHJcbiAgICB9KTtcclxuICAgIGRhdGEgPSBvYmplY3RzKGFsZXJ0X29wdCwgZGF0YSk7XHJcblxyXG4gICAgaWYgKCFpc19pbml0KWluaXQoKTtcclxuICAgIHRlc3RJcGhvbmUoKTtcclxuXHJcbiAgICBub3R5ZnlfY2xhc3MgPSAnbm90aWZ5X2JveCAnO1xyXG4gICAgaWYgKGRhdGEubm90eWZ5X2NsYXNzKW5vdHlmeV9jbGFzcyArPSBkYXRhLm5vdHlmeV9jbGFzcztcclxuXHJcbiAgICBib3hfaHRtbCA9ICc8ZGl2IGNsYXNzPVwiJyArIG5vdHlmeV9jbGFzcyArICdcIj4nO1xyXG4gICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfdGl0bGVcIj4nO1xyXG4gICAgYm94X2h0bWwgKz0gZGF0YS50aXRsZTtcclxuICAgIGJveF9odG1sICs9ICc8c3BhbiBjbGFzcz1cIm5vdGlmeV9jbG9zZVwiPjwvc3Bhbj4nO1xyXG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcblxyXG4gICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udGVudFwiPic7XHJcbiAgICBib3hfaHRtbCArPSBkYXRhLnF1ZXN0aW9uO1xyXG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcblxyXG4gICAgaWYgKGRhdGEuYnV0dG9uWWVzIHx8IGRhdGEuYnV0dG9uTm8pIHtcclxuICAgICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udHJvbFwiPic7XHJcbiAgICAgIGlmIChkYXRhLmJ1dHRvblllcylib3hfaHRtbCArPSAnPCcgKyBkYXRhLmJ1dHRvblRhZyArICcgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiICcgKyBkYXRhLmJ1dHRvblllc0RvcCArICc+JyArIGRhdGEuYnV0dG9uWWVzICsgJzwvJyArIGRhdGEuYnV0dG9uVGFnICsgJz4nO1xyXG4gICAgICBpZiAoZGF0YS5idXR0b25Obylib3hfaHRtbCArPSAnPCcgKyBkYXRhLmJ1dHRvblRhZyArICcgY2xhc3M9XCJub3RpZnlfYnRuX25vXCIgJyArIGRhdGEuYnV0dG9uTm9Eb3AgKyAnPicgKyBkYXRhLmJ1dHRvbk5vICsgJzwvJyArIGRhdGEuYnV0dG9uVGFnICsgJz4nO1xyXG4gICAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcclxuICAgIH1cclxuXHJcbiAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcclxuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XHJcblxyXG5cclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XHJcbiAgICB9LCAxMDApXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjb25maXJtKGRhdGEpIHtcclxuICAgIGlmICghZGF0YSlkYXRhID0ge307XHJcbiAgICBjb25maXJtX29wdCA9IG9iamVjdHMoY29uZmlybV9vcHQsIHtcclxuICAgICAgICB0aXRsZTogbGcoJ2RlbGV0aW5nJyksXHJcbiAgICAgICAgcXVlc3Rpb246IGxnKCdhcmVfeW91X3N1cmVfdG9fZGVsZXRlJyksXHJcbiAgICAgICAgYnV0dG9uWWVzOiBsZygneWVzJyksXHJcbiAgICAgICAgYnV0dG9uTm86IGxnKCdubycpXHJcbiAgICB9KTtcclxuICAgIGRhdGEgPSBvYmplY3RzKGNvbmZpcm1fb3B0LCBkYXRhKTtcclxuICAgIGlmICh0eXBlb2YoZGF0YS5jYWxsYmFja1llcykgPT0gJ3N0cmluZycpIHtcclxuICAgICAgdmFyIGNvZGUgPSAnZGF0YS5jYWxsYmFja1llcyA9IGZ1bmN0aW9uKCl7JytkYXRhLmNhbGxiYWNrWWVzKyd9JztcclxuICAgICAgZXZhbChjb2RlKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWlzX2luaXQpaW5pdCgpO1xyXG4gICAgdGVzdElwaG9uZSgpO1xyXG4gICAgLy9ib3hfaHRtbD0nPGRpdiBjbGFzcz1cIm5vdGlmeV9ib3hcIj4nO1xyXG5cclxuICAgIG5vdHlmeV9jbGFzcyA9ICdub3RpZnlfYm94ICc7XHJcbiAgICBpZiAoZGF0YS5ub3R5ZnlfY2xhc3Mpbm90eWZ5X2NsYXNzICs9IGRhdGEubm90eWZ5X2NsYXNzO1xyXG5cclxuICAgIGJveF9odG1sID0gJzxkaXYgY2xhc3M9XCInICsgbm90eWZ5X2NsYXNzICsgJ1wiPic7XHJcblxyXG4gICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfdGl0bGVcIj4nO1xyXG4gICAgYm94X2h0bWwgKz0gZGF0YS50aXRsZTtcclxuICAgIGJveF9odG1sICs9ICc8c3BhbiBjbGFzcz1cIm5vdGlmeV9jbG9zZVwiPjwvc3Bhbj4nO1xyXG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcblxyXG4gICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udGVudFwiPic7XHJcbiAgICBib3hfaHRtbCArPSBkYXRhLnF1ZXN0aW9uO1xyXG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcblxyXG4gICAgaWYgKGRhdGEuYnV0dG9uWWVzIHx8IGRhdGEuYnV0dG9uTm8pIHtcclxuICAgICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udHJvbFwiPic7XHJcbiAgICAgIGlmIChkYXRhLmJ1dHRvblllcylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5feWVzXCI+JyArIGRhdGEuYnV0dG9uWWVzICsgJzwvZGl2Pic7XHJcbiAgICAgIGlmIChkYXRhLmJ1dHRvbk5vKWJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2J0bl9ub1wiPicgKyBkYXRhLmJ1dHRvbk5vICsgJzwvZGl2Pic7XHJcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG4gICAgfVxyXG5cclxuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveC5odG1sKGJveF9odG1sKTtcclxuXHJcbiAgICBpZiAoZGF0YS5jYWxsYmFja1llcyAhPSBmYWxzZSkge1xyXG4gICAgICBub3RpZmljYXRpb25fYm94LmZpbmQoJy5ub3RpZnlfYnRuX3llcycpLm9uKCdjbGljaycsIGRhdGEuY2FsbGJhY2tZZXMuYmluZChkYXRhLm9iaikpO1xyXG4gICAgfVxyXG4gICAgaWYgKGRhdGEuY2FsbGJhY2tObyAhPSBmYWxzZSkge1xyXG4gICAgICBub3RpZmljYXRpb25fYm94LmZpbmQoJy5ub3RpZnlfYnRuX25vJykub24oJ2NsaWNrJywgZGF0YS5jYWxsYmFja05vLmJpbmQoZGF0YS5vYmopKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdzaG93X25vdGlmaScpO1xyXG4gICAgfSwgMTAwKVxyXG5cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG5vdGlmaShkYXRhKSB7XHJcbiAgICBpZiAoIWRhdGEpZGF0YSA9IHt9O1xyXG4gICAgdmFyIG9wdGlvbiA9IHt0aW1lOiAoZGF0YS50aW1lIHx8IGRhdGEudGltZSA9PT0gMCkgPyBkYXRhLnRpbWUgOiB0aW1lfTtcclxuICAgIGlmICghY29udGVpbmVyKSB7XHJcbiAgICAgIGNvbnRlaW5lciA9ICQoJzx1bC8+Jywge1xyXG4gICAgICAgICdjbGFzcyc6ICdub3RpZmljYXRpb25fY29udGFpbmVyJ1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgICQoJ2JvZHknKS5hcHBlbmQoY29udGVpbmVyKTtcclxuICAgICAgX3NldFVwTGlzdGVuZXJzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGxpID0gJCgnPGxpLz4nLCB7XHJcbiAgICAgIGNsYXNzOiAnbm90aWZpY2F0aW9uX2l0ZW0nXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoZGF0YS50eXBlKSB7XHJcbiAgICAgIGxpLmFkZENsYXNzKCdub3RpZmljYXRpb25faXRlbS0nICsgZGF0YS50eXBlKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgY2xvc2UgPSAkKCc8c3Bhbi8+Jywge1xyXG4gICAgICBjbGFzczogJ25vdGlmaWNhdGlvbl9jbG9zZSdcclxuICAgIH0pO1xyXG4gICAgb3B0aW9uLmNsb3NlID0gY2xvc2U7XHJcbiAgICBsaS5hcHBlbmQoY2xvc2UpO1xyXG5cclxuICAgIHZhciBjb250ZW50ID0gJCgnPGRpdi8+Jywge1xyXG4gICAgICBjbGFzczogXCJub3RpZmljYXRpb25fY29udGVudFwiXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoZGF0YS50aXRsZSAmJiBkYXRhLnRpdGxlLmxlbmd0aCA+IDApIHtcclxuICAgICAgdmFyIHRpdGxlID0gJCgnPGg1Lz4nLCB7XHJcbiAgICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX3RpdGxlXCJcclxuICAgICAgfSk7XHJcbiAgICAgIHRpdGxlLmh0bWwoZGF0YS50aXRsZSk7XHJcbiAgICAgIGNvbnRlbnQuYXBwZW5kKHRpdGxlKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdGV4dCA9ICQoJzxkaXYvPicsIHtcclxuICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX3RleHRcIlxyXG4gICAgfSk7XHJcbiAgICB0ZXh0Lmh0bWwoZGF0YS5tZXNzYWdlKTtcclxuXHJcbiAgICBpZiAoZGF0YS5pbWcgJiYgZGF0YS5pbWcubGVuZ3RoID4gMCkge1xyXG4gICAgICB2YXIgaW1nID0gJCgnPGRpdi8+Jywge1xyXG4gICAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl9pbWdcIlxyXG4gICAgICB9KTtcclxuICAgICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuaW1nICsgJyknKTtcclxuICAgICAgdmFyIHdyYXAgPSAkKCc8ZGl2Lz4nLCB7XHJcbiAgICAgICAgY2xhc3M6IFwid3JhcFwiXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgd3JhcC5hcHBlbmQoaW1nKTtcclxuICAgICAgd3JhcC5hcHBlbmQodGV4dCk7XHJcbiAgICAgIGNvbnRlbnQuYXBwZW5kKHdyYXApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29udGVudC5hcHBlbmQodGV4dCk7XHJcbiAgICB9XHJcbiAgICBsaS5hcHBlbmQoY29udGVudCk7XHJcblxyXG4gICAgLy9cclxuICAgIC8vIGlmKGRhdGEudGl0bGUgJiYgZGF0YS50aXRsZS5sZW5ndGg+MCkge1xyXG4gICAgLy8gICB2YXIgdGl0bGUgPSAkKCc8cC8+Jywge1xyXG4gICAgLy8gICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90aXRsZVwiXHJcbiAgICAvLyAgIH0pO1xyXG4gICAgLy8gICB0aXRsZS5odG1sKGRhdGEudGl0bGUpO1xyXG4gICAgLy8gICBsaS5hcHBlbmQodGl0bGUpO1xyXG4gICAgLy8gfVxyXG4gICAgLy9cclxuICAgIC8vIGlmKGRhdGEuaW1nICYmIGRhdGEuaW1nLmxlbmd0aD4wKSB7XHJcbiAgICAvLyAgIHZhciBpbWcgPSAkKCc8ZGl2Lz4nLCB7XHJcbiAgICAvLyAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX2ltZ1wiXHJcbiAgICAvLyAgIH0pO1xyXG4gICAgLy8gICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5pbWcrJyknKTtcclxuICAgIC8vICAgbGkuYXBwZW5kKGltZyk7XHJcbiAgICAvLyB9XHJcbiAgICAvL1xyXG4gICAgLy8gdmFyIGNvbnRlbnQgPSAkKCc8ZGl2Lz4nLHtcclxuICAgIC8vICAgY2xhc3M6XCJub3RpZmljYXRpb25fY29udGVudFwiXHJcbiAgICAvLyB9KTtcclxuICAgIC8vIGNvbnRlbnQuaHRtbChkYXRhLm1lc3NhZ2UpO1xyXG4gICAgLy9cclxuICAgIC8vIGxpLmFwcGVuZChjb250ZW50KTtcclxuICAgIC8vXHJcbiAgICBjb250ZWluZXIuYXBwZW5kKGxpKTtcclxuXHJcbiAgICBpZiAob3B0aW9uLnRpbWUgPiAwKSB7XHJcbiAgICAgIG9wdGlvbi50aW1lciA9IHNldFRpbWVvdXQoX2Nsb3NlUG9wdXAuYmluZChjbG9zZSksIG9wdGlvbi50aW1lKTtcclxuICAgIH1cclxuICAgIGxpLmRhdGEoJ29wdGlvbicsIG9wdGlvbilcclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBhbGVydDogYWxlcnQsXHJcbiAgICBjb25maXJtOiBjb25maXJtLFxyXG4gICAgbm90aWZpOiBub3RpZmlcclxuICB9O1xyXG5cclxufSkoKTtcclxuXHJcblxyXG4kKCdbcmVmPXBvcHVwXScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICR0aGlzID0gJCh0aGlzKTtcclxuICBlbCA9ICQoJHRoaXMuYXR0cignaHJlZicpKTtcclxuICBkYXRhID0gZWwuZGF0YSgpO1xyXG5cclxuICBkYXRhLnF1ZXN0aW9uID0gZWwuaHRtbCgpO1xyXG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxufSk7XHJcblxyXG4kKCdbcmVmPWNvbmZpcm1dJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgJHRoaXMgPSAkKHRoaXMpO1xyXG4gIGVsID0gJCgkdGhpcy5hdHRyKCdocmVmJykpO1xyXG4gIGRhdGEgPSBlbC5kYXRhKCk7XHJcbiAgZGF0YS5xdWVzdGlvbiA9IGVsLmh0bWwoKTtcclxuICBub3RpZmljYXRpb24uY29uZmlybShkYXRhKTtcclxufSk7XHJcblxyXG5cclxuJCgnLmRpc2FibGVkJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgJHRoaXMgPSAkKHRoaXMpO1xyXG4gIGRhdGEgPSAkdGhpcy5kYXRhKCk7XHJcbiAgaWYgKGRhdGFbJ2J1dHRvbl95ZXMnXSkge1xyXG4gICAgZGF0YVsnYnV0dG9uWWVzJ10gPSBkYXRhWydidXR0b25feWVzJ107XHJcbiAgfVxyXG4gIGlmIChkYXRhWydidXR0b25feWVzJ10gPT09IGZhbHNlKSB7XHJcbiAgICBkYXRhWydidXR0b25ZZXMnXSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xyXG59KTsiLCJmdW5jdGlvbiBhamF4Rm9ybShlbHMpIHtcclxuICB2YXIgZmlsZUFwaSA9IHdpbmRvdy5GaWxlICYmIHdpbmRvdy5GaWxlUmVhZGVyICYmIHdpbmRvdy5GaWxlTGlzdCAmJiB3aW5kb3cuQmxvYiA/IHRydWUgOiBmYWxzZTtcclxuICB2YXIgZGVmYXVsdHMgPSB7XHJcbiAgICBlcnJvcl9jbGFzczogJy5oYXMtZXJyb3InXHJcbiAgfTtcclxuICB2YXIgbGFzdF9wb3N0ID0gZmFsc2U7XHJcblxyXG4gIGZ1bmN0aW9uIG9uUG9zdChwb3N0KSB7XHJcbiAgICBsYXN0X3Bvc3QgPSArbmV3IERhdGUoKTtcclxuICAgIC8vY29uc29sZS5sb2cocG9zdCwgdGhpcyk7XHJcbiAgICB2YXIgZGF0YSA9IHRoaXM7XHJcbiAgICB2YXIgZm9ybSA9IGRhdGEuZm9ybTtcclxuICAgIHZhciB3cmFwID0gZGF0YS53cmFwO1xyXG4gICAgdmFyIHdyYXBfaHRtbCA9IGRhdGEud3JhcF9odG1sO1xyXG5cclxuICAgIGlmIChwb3N0LnJlbmRlcikge1xyXG4gICAgICBwb3N0Lm5vdHlmeV9jbGFzcyA9IFwibm90aWZ5X3doaXRlXCI7XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydChwb3N0KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHdyYXAucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgICAgZm9ybS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xyXG4gICAgICBpZiAocG9zdC5odG1sKSB7XHJcbiAgICAgICAgd3JhcC5odG1sKHBvc3QuaHRtbCk7XHJcbiAgICAgICAgYWpheEZvcm0od3JhcCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKCFwb3N0LmVycm9yKSB7XHJcbiAgICAgICAgICBmb3JtLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICAgICAgICB3cmFwLmh0bWwod3JhcF9odG1sKTtcclxuICAgICAgICAgIGZvcm0uZmluZCgnaW5wdXRbdHlwZT10ZXh0XSx0ZXh0YXJlYScpLnZhbCgnJyk7XHJcbiAgICAgICAgICBhamF4Rm9ybSh3cmFwKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mIHBvc3QuZXJyb3IgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgZm9yICh2YXIgaW5kZXggaW4gcG9zdC5lcnJvcikge1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xyXG4gICAgICAgICAgJ3R5cGUnOiAnZXJyJyxcclxuICAgICAgICAgICd0aXRsZSc6IHBvc3QudGl0bGUgPyBwb3N0LnRpdGxlIDogbGcoJ2Vycm9yJyksXHJcbiAgICAgICAgICAnbWVzc2FnZSc6IHBvc3QuZXJyb3JbaW5kZXhdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShwb3N0LmVycm9yKSkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBvc3QuZXJyb3IubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcclxuICAgICAgICAgICd0eXBlJzogJ2VycicsXHJcbiAgICAgICAgICAndGl0bGUnOiBwb3N0LnRpdGxlID8gcG9zdC50aXRsZSA6IGxnKCdlcnJvcicpLFxyXG4gICAgICAgICAgJ21lc3NhZ2UnOiBwb3N0LmVycm9yW2ldXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmIChwb3N0LmVycm9yIHx8IHBvc3QubWVzc2FnZSkge1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xyXG4gICAgICAgICAgJ3R5cGUnOiBwb3N0LmVycm9yID09PSBmYWxzZSA/ICdzdWNjZXNzJyA6ICdlcnInLFxyXG4gICAgICAgICAgJ3RpdGxlJzogcG9zdC50aXRsZSA/IHBvc3QudGl0bGUgOiAocG9zdC5lcnJvciA9PT0gZmFsc2UgPyBsZygnc3VjY2VzcycpIDogbGcoJ2Vycm9yJykpLFxyXG4gICAgICAgICAgJ21lc3NhZ2UnOiBwb3N0Lm1lc3NhZ2UgPyBwb3N0Lm1lc3NhZ2UgOiBwb3N0LmVycm9yXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8vXHJcbiAgICAvLyBub3RpZmljYXRpb24ubm90aWZpKHtcclxuICAgIC8vICAgICAndHlwZSc6IHBvc3QuZXJyb3IgPT09IGZhbHNlID8gJ3N1Y2Nlc3MnIDogJ2VycicsXHJcbiAgICAvLyAgICAgJ3RpdGxlJzogcG9zdC5lcnJvciA9PT0gZmFsc2UgPyAn0KPRgdC/0LXRiNC90L4nIDogJ9Ce0YjQuNCx0LrQsCcsXHJcbiAgICAvLyAgICAgJ21lc3NhZ2UnOiBBcnJheS5pc0FycmF5KHBvc3QuZXJyb3IpID8gcG9zdC5lcnJvclswXSA6IChwb3N0Lm1lc3NhZ2UgPyBwb3N0Lm1lc3NhZ2UgOiBwb3N0LmVycm9yKVxyXG4gICAgLy8gfSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBvbkZhaWwoKSB7XHJcbiAgICBsYXN0X3Bvc3QgPSArbmV3IERhdGUoKTtcclxuICAgIHZhciBkYXRhID0gdGhpcztcclxuICAgIHZhciBmb3JtID0gZGF0YS5mb3JtO1xyXG4gICAgdmFyIHdyYXAgPSBkYXRhLndyYXA7XHJcbiAgICB3cmFwLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICB3cmFwLmh0bWwoXHJcbiAgICAgICAgJzxoMz4nK2xnKCdzb3JyeV9ub3RfZXhwZWN0ZWRfZXJyb3InKSsnPGgzPicgK1xyXG4gICAgICAgIGxnKCdpdF9oYXBwZW5zX3NvbWV0aW1lcycpXHJcbiAgICApO1xyXG4gICAgYWpheEZvcm0od3JhcCk7XHJcblxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gb25TdWJtaXQoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgLy9lLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgLy9lLnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgIHZhciBjdXJyZW50VGltZU1pbGxpcyA9ICtuZXcgRGF0ZSgpO1xyXG4gICAgaWYgKGN1cnJlbnRUaW1lTWlsbGlzIC0gbGFzdF9wb3N0IDwgMTAwMCAqIDIpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGxhc3RfcG9zdCA9IGN1cnJlbnRUaW1lTWlsbGlzO1xyXG4gICAgdmFyIGRhdGEgPSB0aGlzO1xyXG4gICAgdmFyIGZvcm0gPSBkYXRhLmZvcm07XHJcbiAgICB2YXIgd3JhcCA9IGRhdGEud3JhcDtcclxuICAgIGRhdGEud3JhcF9odG1sPXdyYXAuaHRtbCgpO1xyXG4gICAgdmFyIGlzVmFsaWQgPSB0cnVlO1xyXG5cclxuICAgIC8vaW5pdCh3cmFwKTtcclxuXHJcbiAgICBpZiAoZm9ybS55aWlBY3RpdmVGb3JtKSB7XHJcbiAgICAgIHZhciBkID0gZm9ybS5kYXRhKCd5aWlBY3RpdmVGb3JtJyk7XHJcbiAgICAgIGlmIChkKSB7XHJcbiAgICAgICAgZC52YWxpZGF0ZWQgPSB0cnVlO1xyXG4gICAgICAgIGZvcm0uZGF0YSgneWlpQWN0aXZlRm9ybScsIGQpO1xyXG4gICAgICAgIGZvcm0ueWlpQWN0aXZlRm9ybSgndmFsaWRhdGUnKTtcclxuICAgICAgICBpc1ZhbGlkID0gZC52YWxpZGF0ZWQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpc1ZhbGlkID0gaXNWYWxpZCAmJiAoZm9ybS5maW5kKGRhdGEucGFyYW0uZXJyb3JfY2xhc3MpLmxlbmd0aCA9PSAwKTtcclxuXHJcbiAgICBpZiAoIWlzVmFsaWQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgIHZhciByZXF1aXJlZCA9IGZvcm0uZmluZCgnaW5wdXQucmVxdWlyZWQsIHRleHRhcmVhLnJlcXVpcmVkLCBpbnB1dFtpZD1cInN1cHBvcnQtcmVjYXB0Y2hhXCJdJyk7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVxdWlyZWQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgaGVscEJsb2NrID0gcmVxdWlyZWQuZXEoaSkuY2xvc2VzdCgnLmZvcm0tZ3JvdXAnKS5maW5kKCcuaGVscC1ibG9jaycpO1xyXG4gICAgICAgIHZhciBoZWxwTWVzc2FnZSA9IGhlbHBCbG9jayAmJiBoZWxwQmxvY2suZGF0YSgnbWVzc2FnZScpID8gaGVscEJsb2NrLmRhdGEoJ21lc3NhZ2UnKSA6IGxnKCdyZXF1aXJlZCcpO1xyXG5cclxuICAgICAgICBpZiAocmVxdWlyZWQuZXEoaSkudmFsKCkubGVuZ3RoIDwgMSkge1xyXG4gICAgICAgICAgaGVscEJsb2NrLmh0bWwoaGVscE1lc3NhZ2UpO1xyXG4gICAgICAgICAgaXNWYWxpZCA9IGZhbHNlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBoZWxwQmxvY2suaHRtbCgnJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmICghaXNWYWxpZCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICghZm9ybS5zZXJpYWxpemVPYmplY3QpYWRkU1JPKCk7XHJcblxyXG4gICAgdmFyIHBvc3REYXRhID0gZm9ybS5zZXJpYWxpemVPYmplY3QoKTtcclxuICAgIGZvcm0uYWRkQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgIGZvcm0uaHRtbCgnJyk7XHJcbiAgICB3cmFwLmh0bWwoJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjtcIj48cD4nK2xnKCdzZW5kaW5nX2RhdGEnKSsnPC9wPjwvZGl2PicpO1xyXG5cclxuICAgIGRhdGEudXJsICs9IChkYXRhLnVybC5pbmRleE9mKCc/JykgPiAwID8gJyYnIDogJz8nKSArICdyYz0nICsgTWF0aC5yYW5kb20oKTtcclxuICAgIC8vY29uc29sZS5sb2coZGF0YS51cmwpO1xyXG5cclxuICAgIC8qaWYoIXBvc3REYXRhLnJldHVyblVybCl7XHJcbiAgICAgIHBvc3REYXRhLnJldHVyblVybD1sb2NhdGlvbi5ocmVmO1xyXG4gICAgfSovXHJcblxyXG4gICAgJC5wb3N0KFxyXG4gICAgICBkYXRhLnVybCxcclxuICAgICAgcG9zdERhdGEsXHJcbiAgICAgIG9uUG9zdC5iaW5kKGRhdGEpLFxyXG4gICAgICAnanNvbidcclxuICAgICkuZmFpbChvbkZhaWwuYmluZChkYXRhKSk7XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW5pdCh3cmFwKSB7XHJcbiAgICBmb3JtID0gd3JhcC5maW5kKCdmb3JtJyk7XHJcbiAgICBkYXRhID0ge1xyXG4gICAgICBmb3JtOiBmb3JtLFxyXG4gICAgICBwYXJhbTogZGVmYXVsdHMsXHJcbiAgICAgIHdyYXA6IHdyYXBcclxuICAgIH07XHJcbiAgICBkYXRhLnVybCA9IGZvcm0uYXR0cignYWN0aW9uJykgfHwgbG9jYXRpb24uaHJlZjtcclxuICAgIGRhdGEubWV0aG9kID0gZm9ybS5hdHRyKCdtZXRob2QnKSB8fCAncG9zdCc7XHJcbiAgICBmb3JtLnVuYmluZCgnc3VibWl0Jyk7XHJcbiAgICAvL2Zvcm0ub2ZmKCdzdWJtaXQnKTtcclxuICAgIGZvcm0ub24oJ3N1Ym1pdCcsIG9uU3VibWl0LmJpbmQoZGF0YSkpO1xyXG4gIH1cclxuXHJcbiAgZWxzLmZpbmQoJ1tyZXF1aXJlZF0nKVxyXG4gICAgLmFkZENsYXNzKCdyZXF1aXJlZCcpXHJcbiAgICAucmVtb3ZlQXR0cigncmVxdWlyZWQnKTtcclxuXHJcblxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZWxzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpbml0KGVscy5lcShpKSk7XHJcbiAgfVxyXG5cclxuICBpZiAodHlwZW9mIHBsYWNlaG9sZGVyID09ICdmdW5jdGlvbicpIHtcclxuICAgICAgcGxhY2Vob2xkZXIoKTtcclxuICB9XHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBhZGRTUk8oKSB7XHJcbiAgJC5mbi5zZXJpYWxpemVPYmplY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgbyA9IHt9O1xyXG4gICAgdmFyIGEgPSB0aGlzLnNlcmlhbGl6ZUFycmF5KCk7XHJcbiAgICAkLmVhY2goYSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICBpZiAob1t0aGlzLm5hbWVdKSB7XHJcbiAgICAgICAgaWYgKCFvW3RoaXMubmFtZV0ucHVzaCkge1xyXG4gICAgICAgICAgb1t0aGlzLm5hbWVdID0gW29bdGhpcy5uYW1lXV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9bdGhpcy5uYW1lXS5wdXNoKHRoaXMudmFsdWUgfHwgJycpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG9bdGhpcy5uYW1lXSA9IHRoaXMudmFsdWUgfHwgJyc7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG87XHJcbiAgfTtcclxufTtcclxuYWRkU1JPKCk7IiwiJCgnLmFjdGlvbl91c2VyX2NvbmZpcm0nKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAoIWNvbmZpcm0oKSl7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbi8vY2hlY2tib3hlcyDQstGA0LXQvNGR0L0g0YDQsNCx0L7RgtGLINGC0L7Rh9C10Log0L/RgNC+0LTQsNC2LCDQv9GA0Lgg0LrQu9C40LrQsNGFINGE0YPQvdC60YbQuNC+0L3QsNC7XHJcbnZhciBzdG9yZXNQb2ludENoZWNrYm94ZXMgPSAkKCcuYjJiLXN0b3Jlcy1wb2ludHMtZm9ybSBpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKTtcclxuXHJcbnN0b3Jlc1BvaW50Q2hlY2tib3hlcy5jbGljayhmdW5jdGlvbigpIHtcclxuICAgIHZhciBuYW1lID0gJCh0aGlzKS5hdHRyKCduYW1lJyk7XHJcbiAgICB2YXIgcm93ID0gJCh0aGlzKS5jbG9zZXN0KCd0cicpO1xyXG4gICAgLy8gaWYgKG5hbWUubWF0Y2goL0IyYlN0b3Jlc1BvaW50c1xcW3dvcmtfdGltZV9kZXRhaWxzXFxdXFxbXFxkKlxcXVxcW2hvbGlkYXlcXF0vKSkge1xyXG4gICAgLy8gICAgIGNoZWNrRGlzYWJsZWQocm93LCB0aGlzLmNoZWNrZWQsICdkZXBlbmRzLWhvbGlkYXknKTtcclxuICAgIC8vIH1cclxuICAgIGlmIChuYW1lLm1hdGNoKC9CMmJTdG9yZXNQb2ludHNcXFt3b3JrX3RpbWVfZGV0YWlsc1xcXVxcW1xcZCpcXF1cXFsyNC1ob3VyXFxdLykpIHtcclxuICAgICAgICBjaGVja0Rpc2FibGVkKHJvdywgdGhpcy5jaGVja2VkLCAnZGVwZW5kcy0yNC1ob3VyJyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuLy/Qv9GA0Lgg0LfQsNCz0YDRg9C30LrQtSDQv9GA0L7QstC10YDRj9C10Lwg0YLQviDQttC1LCDRh9GC0L4g0L/RgNC4INC60LvQuNC60LVcclxuJC5lYWNoKHN0b3Jlc1BvaW50Q2hlY2tib3hlcywgZnVuY3Rpb24oaW5kZXgsIGl0ZW0pe1xyXG4gICAgdmFyIG5hbWUgPSAkKGl0ZW0pLmF0dHIoJ25hbWUnKTtcclxuICAgIHZhciByb3cgPSAkKGl0ZW0pLmNsb3Nlc3QoJ3RyJyk7XHJcbiAgICAvLyBpZiAobmFtZS5tYXRjaCgvQjJiU3RvcmVzUG9pbnRzXFxbd29ya190aW1lX2RldGFpbHNcXF1cXFtcXGQqXFxdXFxbaG9saWRheVxcXS8pICYmIGl0ZW0uY2hlY2tlZCkge1xyXG4gICAgLy8gICAgIGNoZWNrRGlzYWJsZWQocm93LCB0cnVlLCAnZGVwZW5kcy1ob2xpZGF5Jyk7XHJcbiAgICAvLyB9XHJcbiAgICBpZiAobmFtZS5tYXRjaCgvQjJiU3RvcmVzUG9pbnRzXFxbd29ya190aW1lX2RldGFpbHNcXF1cXFtcXGQqXFxdXFxbMjQtaG91clxcXS8pICYmIGl0ZW0uY2hlY2tlZCkge1xyXG4gICAgICAgIGNoZWNrRGlzYWJsZWQocm93LCB0cnVlLCAnZGVwZW5kcy0yNC1ob3VyJyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gIGNoZWNrRGlzYWJsZWQocm93LCBjaGVja2VkLCBjbGFzc05hbWUpIHtcclxuICAgIC8vdmFyIGlucHV0c0NoZWNrYm94ID0gJChyb3cpLmZpbmQoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXS4nK2NsYXNzTmFtZSk7XHJcbiAgICB2YXIgaW5wdXRzVGV4dCA9ICQocm93KS5maW5kKCdpbnB1dFt0eXBlPVwidGV4dFwiXS4nK2NsYXNzTmFtZSk7XHJcbiAgICBpbnB1dHNUZXh0LnZhbCgnJyk7XHJcbiAgICAvL2lucHV0c0NoZWNrYm94LmF0dHIoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcbiAgICBpbnB1dHNUZXh0LmF0dHIoJ2Rpc2FibGVkJywgY2hlY2tlZCk7XHJcbiAgICAvL2lucHV0c0NoZWNrYm94LmF0dHIoJ2Rpc2FibGVkJywgY2hlY2tlZCk7XHJcbn1cclxuXHJcbiQoJyNwYXltZW50c19zZWxlY3Rfc3RvcmUnKS5vbignY2hhbmdlJywgcGF5bWVudHNTZWxlY3RTdG9yZSk7XHJcblxyXG5mdW5jdGlvbiBwYXltZW50c1NlbGVjdFN0b3JlKCl7XHJcbiAgICB2YXIgc2VsZiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXltZW50c19zZWxlY3Rfc3RvcmUnKSxcclxuICAgICAgICBzZWxlY3RQb2ludHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGF5bWVudHNfc2VsZWN0X3N0b3JlX3BvaW50Jyk7XHJcbiAgICBpZiAoc2VsZiAmJiBzZWxlY3RQb2ludHMpIHtcclxuICAgICAgICB2YXIgcG9pbnRzID0gJCgnb3B0aW9uOnNlbGVjdGVkJywgc2VsZikuYXR0cignZGF0YS1wb2ludHMnKSxcclxuICAgICAgICAgICAgZ2V0U2VsZWN0UG9pbnQgPSAkKHNlbGVjdFBvaW50cykuZGF0YSgnZ2V0JyksXHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSAnJztcclxuICAgICAgICBpZiAocG9pbnRzKSB7XHJcbiAgICAgICAgICAgIHBvaW50cyA9IEpTT04ucGFyc2UocG9pbnRzKTtcclxuICAgICAgICAgICAgb3B0aW9ucyA9ICc8b3B0aW9uPjwvb3B0aW9uPic7XHJcbiAgICAgICAgICAgIHBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pe1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucyArPSAnPG9wdGlvbiB2YWx1ZT1cIicraXRlbS5pZCsnXCIgJysocGFyc2VJbnQoZ2V0U2VsZWN0UG9pbnQpID09IHBhcnNlSW50KGl0ZW0uaWQpID8gJ3NlbGVjdGVkJyA6ICcnKStcclxuICAgICAgICAgICAgICAgICAgICAnPicraXRlbS5uYW1lKycsICcraXRlbS5jb3VudHJ5KycsICcraXRlbS5jaXR5KycsICcraXRlbS5hZGRyZXNzKyc8L29wdGlvbnM+JztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNlbGVjdFBvaW50cy5pbm5lckhUTUwgPSBvcHRpb25zO1xyXG4gICAgfVxyXG5cclxufVxyXG5wYXltZW50c1NlbGVjdFN0b3JlKCk7XHJcblxyXG4vLyBiMmIg0L/Qu9Cw0YLQtdC20LggLSDQtNC10LnRgdGC0LLQuNGPINGBINCz0YDQuNC0XHJcbiQoXCIucmV2ZXJ0LW9yZGVyXCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBocmVmID0gJy9wYXltZW50cy9yZXZva2UnO1xyXG4gICAgdmFyIGlkcyA9ICQodGhpcykuZGF0YSgnaWQnKTtcclxuICAgIHZhciBkYXRhPXtcclxuICAgICAgICBidXR0b25ZZXM6ZmFsc2UsXHJcbiAgICAgICAgbm90eWZ5X2NsYXNzOlwibm90aWZ5X3doaXRlIG5vdGlmeV9ub3RfYmlnXCIsXHJcbiAgICAgICAgdGl0bGU6ICfQn9GA0Lgg0L7RgtC80LXQvdC1INC/0LvQsNGC0LXQttC10Lkg0L3Rg9C20L3QviDRg9C60LDQt9Cw0YLRjCDQv9GA0LjRh9C40L3RgyDQvtGC0LzQtdC90YsnLFxyXG4gICAgICAgIHF1ZXN0aW9uOlxyXG4gICAgICAgICc8Zm9ybSBhY3Rpb249XCInK2hyZWYrJ1wiIG1ldGhvZD1cInBvc3RcIiBjbGFzcz1cInBheW1lbnRzLWZvcm1zIHJldm9rZV9wYXllbnRzX2Zvcm1cIj4nK1xyXG4gICAgICAgICc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJpZHNcIiBpZD1cInBheW1lbnRzLWlkXCIgdmFsdWU9XCInK2lkcysnXCInKyc+JytcclxuICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj4nK1xyXG4gICAgICAgICc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwicGF5bWVudHMtYWRtaW4tY29tbWVudFwiIG5hbWU9XCJhZG1pbi1jb21tZW50XCIgcGxhY2Vob2xkZXI9XCLQktCy0LXQtNC40YLQtSDQv9GA0LjRh9C40L3RgyDQvtGC0LzQtdC90YtcIj4nK1xyXG4gICAgICAgICc8cCBjbGFzcz1cImhlbHAtYmxvY2sgaGVscC1ibG9jay1lcnJvclwiPjwvcD4nK1xyXG4gICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXAgYnV0dG9uc1wiPicrXHJcbiAgICAgICAgJzxpbnB1dCB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIiB2YWx1ZT1cItCe0YLQutC70L7QvdC40YLRjFwiPicrXHJcbiAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICc8Zm9ybT4nXHJcbiAgICB9O1xyXG4gICAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpXHJcblxyXG5cclxufSk7XHJcblxyXG4kKFwiLnBheW1lbnRzLWdyaWQtdmlldyAuY2hhbmdlLW9yZGVyLXByaWNlXCIpLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XHJcbiAgICB2YXIgb3JkZXJfcHJpY2UgPSAkKHRoaXMpLmRhdGEoJ29yZGVycHJpY2UnKTtcclxuICAgIHZhciBkYXRhPXtcclxuICAgICAgICBidXR0b25ZZXM6ZmFsc2UsXHJcbiAgICAgICAgbm90eWZ5X2NsYXNzOlwibm90aWZ5X3doaXRlIG5vdGlmeV9ub3RfYmlnXCIsXHJcbiAgICAgICAgdGl0bGU6ICfQmNC30LzQtdC90LjRgtGMINGB0YPQvNC80YMg0L/QvtC60YPQv9C60LgnLFxyXG4gICAgICAgIHF1ZXN0aW9uOlxyXG4gICAgICAgICc8Zm9ybSBhY3Rpb249XCIvcGF5bWVudHMvdXBkYXRlXCIgbWV0aG9kPVwicG9zdFwiIGNsYXNzPVwicGF5bWVudHMtZm9ybXMgY2hhbmdlX29yZGVyX3ByaWNlX2Zvcm1cIj4nK1xyXG4gICAgICAgICc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJQYXltZW50c1t1aWRdXCIgaWQ9XCJwYXltZW50cy1pZFwiIHZhbHVlPVwiJytpZCsnXCInKyc+JytcclxuICAgICAgICAnPHAgY2xhc3M9XCJoZWxwLWJsb2NrIGhlbHAtYmxvY2stZXJyb3JcIj48L3A+JytcclxuICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj4nK1xyXG4gICAgICAgICc8bGFiZWw+0J3QvtCy0LDRjyDRgdGD0LzQvNCwPC9sYWJlbD4nK1xyXG4gICAgICAgICc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwicGF5bWVudHMtb3JkZXJfcHJpY2VcIiBuYW1lPVwiUGF5bWVudHNbb3JkZXJfcHJpY2VdXCIgcGxhY2Vob2xkZXI9XCLQktCy0LXQtNC40YLQtSDQvdC+0LLRg9GOINGB0YPQvNC80YNcIiB2YWx1ZT1cIicrb3JkZXJfcHJpY2UrJ1wiPicrXHJcbiAgICAgICAgICAgICc8cCBjbGFzcz1cImhlbHAtYmxvY2sgaGVscC1ibG9jay1lcnJvclwiPjwvcD4nK1xyXG4gICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj4nK1xyXG4gICAgICAgICc8bGFiZWw+0JrQvtC80LzQtdC90YLQsNGA0LjQuTwvbGFiZWw+JytcclxuICAgICAgICAnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBpZD1cInBheW1lbnRzLWFkbWluLWNvbW1lbnRcIiBuYW1lPVwiUGF5bWVudHNbYWRtaW4tY29tbWVudF1cIiBwbGFjZWhvbGRlcj1cItCS0LLQtdC00LjRgtC1INC60L7QvNC80LXQvdGC0LDRgNC40LlcIj4nK1xyXG4gICAgICAgICc8cCBjbGFzcz1cImhlbHAtYmxvY2sgaGVscC1ibG9jay1lcnJvclwiPjwvcD4nK1xyXG4gICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXAgYnV0dG9uc1wiPicrXHJcbiAgICAgICAgJzxpbnB1dCB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIiB2YWx1ZT1cItCY0LfQvNC10L3QuNGC0YxcIj4nK1xyXG4gICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAnPGZvcm0+J1xyXG4gICAgfTtcclxuICAgIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKVxyXG59KTtcclxuXHJcbiQoZG9jdW1lbnQpLm9uKCdzdWJtaXQnLCdmb3JtLmNoYW5nZV9vcmRlcl9wcmljZV9mb3JtJywgZnVuY3Rpb24oZSl7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAkKHRoaXMpLmZpbmQoJ3AuaGVscC1ibG9jaycpLnRleHQoJycpO1xyXG4gICAgdmFyIGlkID0gJCgnI3BheW1lbnRzLWlkJykudmFsKCk7XHJcbiAgICB2YXIgb3JkZXJfcHJpY2UgPSAkKCcjcGF5bWVudHMtb3JkZXJfcHJpY2UnKS52YWwoKTtcclxuICAgIHZhciBhZG1pbl9jb21tZW50ID0gJCgnI3BheW1lbnRzLWFkbWluLWNvbW1lbnQnKS52YWwoKTtcclxuICAgIGlmIChwYXJzZUludChpZCk8MSkge1xyXG4gICAgICAgICQoJyNwYXltZW50cy1pZCcpLnNpYmxpbmdzKCdwLmhlbHAtYmxvY2snKS50ZXh0KCdJRCDQtNC+0LvQttC10L0g0LHRi9GC0Ywg0YbQtdC70YvQvCDRh9C40YHQu9C+0LwnKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBpZiAob3JkZXJfcHJpY2UgPT0gJycpIHtcclxuICAgICAgICAkKCcjcGF5bWVudHMtb3JkZXJfcHJpY2UnKS5zaWJsaW5ncygncC5oZWxwLWJsb2NrJykudGV4dCgn0JLQstC10LTQuNGC0LUg0YHRg9C80LzRgycpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHZhciByZWcgPSAvXlxcZCpcXC4/XFxkKiQvO1xyXG4gICAgaWYgKCFvcmRlcl9wcmljZS5tYXRjaChyZWcpKSB7XHJcbiAgICAgICAgJCgnI3BheW1lbnRzLW9yZGVyX3ByaWNlJykuc2libGluZ3MoJ3AuaGVscC1ibG9jaycpLmh0bWwoJ9CS0LLQtdC00LjRgtC1INC/0YDQsNCy0LjQu9GM0L3QviDRgdGD0LzQvNGDLjxicj7QmtC+0L/QtdC50LrQuCDQvtGCINGA0YPQsdC70LXQuSDQtNC+0LvQttC90Ysg0L7RgtC00LXQu9GP0YLRjNGB0Y8g0YLQvtGH0LrQvtC5Jyk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgaWYgKGFkbWluX2NvbW1lbnQubGVuZ3RoPDUgfHwgYWRtaW5fY29tbWVudC5sZW5ndGg+MjU2KSB7XHJcbiAgICAgICAgJCgnI3BheW1lbnRzLWFkbWluLWNvbW1lbnQnKS5zaWJsaW5ncygncC5oZWxwLWJsb2NrJykudGV4dCgn0JTQu9C40L3QsCDQutC+0LzQvNC10L3RgtCw0YDQuNGPINC00L7Qu9C20L3QsCDQsdGL0YLRjCDQvtGCIDUg0LTQviAyNTYg0YHQuNC80LLQvtC70L7QsicpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgICdpZCcgOiBwYXJzZUludChpZCksXHJcbiAgICAgICAgJ29yZGVyX3ByaWNlJyA6IG9yZGVyX3ByaWNlLFxyXG4gICAgICAgICdhZG1pbi1jb21tZW50JyA6IGFkbWluX2NvbW1lbnRcclxuICAgIH07XHJcbiAgICAkLnBvc3QoJCh0aGlzKS5hdHRyKCdhY3Rpb24nKSwgZGF0YSwgZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnc2hvd19ub3RpZmknKTtcclxuICAgICAgICBpZiAocmVzcG9uc2UuZXJyb3IgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgLy8gbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTogJ9Cf0LvQsNGC0ZHQtiDQuNC30LzQtdC90ZHQvScsIHR5cGU6J3N1Y2Nlc3MnfSk7XHJcbiAgICAgICAgICAgIC8vIHZhciByb3cgPSAkKCd0cltkYXRhLWtleT1cIicraWQrJ1wiXScpO1xyXG4gICAgICAgICAgICAvLyB2YXIgdGRfcHJpY2UgPSAkKHJvdykuZmluZCgnLnRkLW9yZGVyLXByaWNlJyk7XHJcbiAgICAgICAgICAgIC8vICQodGRfcHJpY2UpLnRleHQocmVzcG9uc2UucmVjYWxjLm9yZGVyX3ByaWNlKycgJyskKHRkX3ByaWNlKS5kYXRhKCdjdXInKSk7XHJcbiAgICAgICAgICAgIC8vICQocm93KS5maW5kKCcudGQtcmV3YXJkJykuaHRtbChyZXNwb25zZS5yZWNhbGMucmV3YXJkKycgPHNwYW4gY2xhc3M9XCJmYSBmYS1ydWJcIj48L3NwYW4+Jyk7XHJcbiAgICAgICAgICAgIC8vICQocm93KS5maW5kKCcudGQtY2FzaGJhY2snKS5odG1sKHJlc3BvbnNlLnJlY2FsYy5jYXNoYmFjaysnIDxzcGFuIGNsYXNzPVwiZmEgZmEtcnViXCI+PC9zcGFuPicpO1xyXG4gICAgICAgICAgICAvLyAkKHJvdykuZmluZCgnLmNoYW5nZS1vcmRlci1wcmljZScpLmF0dHIoJ2RhdGEtb3JkZXJwcmljZScsIHJlc3BvbnNlLnJlY2FsYy5vcmRlcl9wcmljZSk7XHJcbiAgICAgICAgICAgICQoJyNncmlkLWFqYXgtYWN0aW9uJykueWlpR3JpZFZpZXcoXCJhcHBseUZpbHRlclwiKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOiAn0J/RgNC+0LjQt9C+0YjQu9CwINC+0YjQuNCx0LrQsCcsIHR5cGU6J2Vycid9KTtcclxuICAgICAgICB9XHJcbiAgICB9LCdqc29uJykuZmFpbChmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnc2hvd19ub3RpZmknKTtcclxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOifQn9GA0L7QuNC30L7RiNC70LAg0L7RiNC40LHQutCwIScsIHR5cGU6J2Vycid9KVxyXG4gICAgfSk7XHJcbn0pO1xyXG5cclxuJChkb2N1bWVudCkub24oJ3N1Ym1pdCcsJ2Zvcm0ucmV2b2tlX3BheWVudHNfZm9ybScsIGZ1bmN0aW9uKGUpe1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgJCh0aGlzKS5maW5kKCdwLmhlbHAtYmxvY2snKS50ZXh0KCcnKTtcclxuICAgIHZhciBpZHMgPSAkKCcjcGF5bWVudHMtaWQnKS52YWwoKTtcclxuICAgIHZhciBzdGF0dXMgPSAkKCcjcGF5bWVudHMtc3RhdHVzJykudmFsKCk7XHJcbiAgICB2YXIgYWRtaW5fY29tbWVudCA9ICQoJyNwYXltZW50cy1hZG1pbi1jb21tZW50JykudmFsKCk7XHJcblxyXG4gICAgaWYgKGFkbWluX2NvbW1lbnQubGVuZ3RoPDUgfHwgYWRtaW5fY29tbWVudC5sZW5ndGg+MjU2KSB7XHJcbiAgICAgICAgJCgnI3BheW1lbnRzLWFkbWluLWNvbW1lbnQnKS5zaWJsaW5ncygncC5oZWxwLWJsb2NrJykudGV4dCgn0JTQu9C40L3QsCDQutC+0LzQvNC10L3RgtCw0YDQuNGPINC00L7Qu9C20L3QsCDQsdGL0YLRjCDQvtGCIDUg0LTQviAyNTYg0YHQuNC80LLQvtC70L7QsicpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgICdpZHMnIDogaWRzLFxyXG4gICAgICAgICdzdGF0dXMnIDogc3RhdHVzLFxyXG4gICAgICAgICdhZG1pbi1jb21tZW50JyA6IGFkbWluX2NvbW1lbnRcclxuICAgIH07XHJcbiAgICAkLnBvc3QoJCh0aGlzKS5hdHRyKCdhY3Rpb24nKSwgZGF0YSwgZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnc2hvd19ub3RpZmknKTtcclxuICAgICAgICBpZiAocmVzcG9uc2UuZXJyb3IgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICQoJyNncmlkLWFqYXgtYWN0aW9uJykueWlpR3JpZFZpZXcoXCJhcHBseUZpbHRlclwiKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOiAn0J/RgNC+0LjQt9C+0YjQu9CwINC+0YjQuNCx0LrQsCcsIHR5cGU6J2Vycid9KTtcclxuICAgICAgICB9XHJcbiAgICB9LCdqc29uJykuZmFpbChmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnc2hvd19ub3RpZmknKTtcclxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOifQn9GA0L7QuNC30L7RiNC70LAg0L7RiNC40LHQutCwIScsIHR5cGU6J2Vycid9KVxyXG4gICAgfSk7XHJcbn0pO1xyXG5cclxuXHJcblxyXG5cclxuIl19
