/*!
* Bootstrap.js by @fat & @mdo
* Copyright 2012 Twitter, Inc.
* http://www.apache.org/licenses/LICENSE-2.0.txt
*/
!function(e){"use strict";e(function(){e.support.transition=function(){var e=function(){var e=document.createElement("bootstrap"),t={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"},n;for(n in t)if(e.style[n]!==undefined)return t[n]}();return e&&{end:e}}()})}(window.jQuery),!function(e){"use strict";var t='[data-dismiss="alert"]',n=function(n){e(n).on("click",t,this.close)};n.prototype.close=function(t){function s(){i.trigger("closed").remove()}var n=e(this),r=n.attr("data-target"),i;r||(r=n.attr("href"),r=r&&r.replace(/.*(?=#[^\s]*$)/,"")),i=e(r),t&&t.preventDefault(),i.length||(i=n.hasClass("alert")?n:n.parent()),i.trigger(t=e.Event("close"));if(t.isDefaultPrevented())return;i.removeClass("in"),e.support.transition&&i.hasClass("fade")?i.on(e.support.transition.end,s):s()};var r=e.fn.alert;e.fn.alert=function(t){return this.each(function(){var r=e(this),i=r.data("alert");i||r.data("alert",i=new n(this)),typeof t=="string"&&i[t].call(r)})},e.fn.alert.Constructor=n,e.fn.alert.noConflict=function(){return e.fn.alert=r,this},e(document).on("click.alert.data-api",t,n.prototype.close)}(window.jQuery),!function(e){"use strict";var t=function(t,n){this.$element=e(t),this.options=e.extend({},e.fn.button.defaults,n)};t.prototype.setState=function(e){var t="disabled",n=this.$element,r=n.data(),i=n.is("input")?"val":"html";e+="Text",r.resetText||n.data("resetText",n[i]()),n[i](r[e]||this.options[e]),setTimeout(function(){e=="loadingText"?n.addClass(t).attr(t,t):n.removeClass(t).removeAttr(t)},0)},t.prototype.toggle=function(){var e=this.$element.closest('[data-toggle="buttons-radio"]');e&&e.find(".active").removeClass("active"),this.$element.toggleClass("active")};var n=e.fn.button;e.fn.button=function(n){return this.each(function(){var r=e(this),i=r.data("button"),s=typeof n=="object"&&n;i||r.data("button",i=new t(this,s)),n=="toggle"?i.toggle():n&&i.setState(n)})},e.fn.button.defaults={loadingText:"loading..."},e.fn.button.Constructor=t,e.fn.button.noConflict=function(){return e.fn.button=n,this},e(document).on("click.button.data-api","[data-toggle^=button]",function(t){var n=e(t.target);n.hasClass("btn")||(n=n.closest(".btn")),n.button("toggle")})}(window.jQuery),!function(e){"use strict";var t=function(t,n){this.$element=e(t),this.$indicators=this.$element.find(".carousel-indicators"),this.options=n,this.options.pause=="hover"&&this.$element.on("mouseenter",e.proxy(this.pause,this)).on("mouseleave",e.proxy(this.cycle,this))};t.prototype={cycle:function(t){return t||(this.paused=!1),this.interval&&clearInterval(this.interval),this.options.interval&&!this.paused&&(this.interval=setInterval(e.proxy(this.next,this),this.options.interval)),this},getActiveIndex:function(){return this.$active=this.$element.find(".item.active"),this.$items=this.$active.parent().children(),this.$items.index(this.$active)},to:function(t){var n=this.getActiveIndex(),r=this;if(t>this.$items.length-1||t<0)return;return this.sliding?this.$element.one("slid",function(){r.to(t)}):n==t?this.pause().cycle():this.slide(t>n?"next":"prev",e(this.$items[t]))},pause:function(t){return t||(this.paused=!0),this.$element.find(".next, .prev").length&&e.support.transition.end&&(this.$element.trigger(e.support.transition.end),this.cycle(!0)),clearInterval(this.interval),this.interval=null,this},next:function(){if(this.sliding)return;return this.slide("next")},prev:function(){if(this.sliding)return;return this.slide("prev")},slide:function(t,n){var r=this.$element.find(".item.active"),i=n||r[t](),s=this.interval,o=t=="next"?"left":"right",u=t=="next"?"first":"last",a=this,f;this.sliding=!0,s&&this.pause(),i=i.length?i:this.$element.find(".item")[u](),f=e.Event("slide",{relatedTarget:i[0],direction:o});if(i.hasClass("active"))return;this.$indicators.length&&(this.$indicators.find(".active").removeClass("active"),this.$element.one("slid",function(){var t=e(a.$indicators.children()[a.getActiveIndex()]);t&&t.addClass("active")}));if(e.support.transition&&this.$element.hasClass("slide")){this.$element.trigger(f);if(f.isDefaultPrevented())return;i.addClass(t),i[0].offsetWidth,r.addClass(o),i.addClass(o),this.$element.one(e.support.transition.end,function(){i.removeClass([t,o].join(" ")).addClass("active"),r.removeClass(["active",o].join(" ")),a.sliding=!1,setTimeout(function(){a.$element.trigger("slid")},0)})}else{this.$element.trigger(f);if(f.isDefaultPrevented())return;r.removeClass("active"),i.addClass("active"),this.sliding=!1,this.$element.trigger("slid")}return s&&this.cycle(),this}};var n=e.fn.carousel;e.fn.carousel=function(n){return this.each(function(){var r=e(this),i=r.data("carousel"),s=e.extend({},e.fn.carousel.defaults,typeof n=="object"&&n),o=typeof n=="string"?n:s.slide;i||r.data("carousel",i=new t(this,s)),typeof n=="number"?i.to(n):o?i[o]():s.interval&&i.pause().cycle()})},e.fn.carousel.defaults={interval:5e3,pause:"hover"},e.fn.carousel.Constructor=t,e.fn.carousel.noConflict=function(){return e.fn.carousel=n,this},e(document).on("click.carousel.data-api","[data-slide], [data-slide-to]",function(t){var n=e(this),r,i=e(n.attr("data-target")||(r=n.attr("href"))&&r.replace(/.*(?=#[^\s]+$)/,"")),s=e.extend({},i.data(),n.data()),o;i.carousel(s),(o=n.attr("data-slide-to"))&&i.data("carousel").pause().to(o).cycle(),t.preventDefault()})}(window.jQuery),!function(e){"use strict";var t=function(t,n){this.$element=e(t),this.options=e.extend({},e.fn.collapse.defaults,n),this.options.parent&&(this.$parent=e(this.options.parent)),this.options.toggle&&this.toggle()};t.prototype={constructor:t,dimension:function(){var e=this.$element.hasClass("width");return e?"width":"height"},show:function(){var t,n,r,i;if(this.transitioning||this.$element.hasClass("in"))return;t=this.dimension(),n=e.camelCase(["scroll",t].join("-")),r=this.$parent&&this.$parent.find("> .accordion-group > .in");if(r&&r.length){i=r.data("collapse");if(i&&i.transitioning)return;r.collapse("hide"),i||r.data("collapse",null)}this.$element[t](0),this.transition("addClass",e.Event("show"),"shown"),e.support.transition&&this.$element[t](this.$element[0][n])},hide:function(){var t;if(this.transitioning||!this.$element.hasClass("in"))return;t=this.dimension(),this.reset(this.$element[t]()),this.transition("removeClass",e.Event("hide"),"hidden"),this.$element[t](0)},reset:function(e){var t=this.dimension();return this.$element.removeClass("collapse")[t](e||"auto")[0].offsetWidth,this.$element[e!==null?"addClass":"removeClass"]("collapse"),this},transition:function(t,n,r){var i=this,s=function(){n.type=="show"&&i.reset(),i.transitioning=0,i.$element.trigger(r)};this.$element.trigger(n);if(n.isDefaultPrevented())return;this.transitioning=1,this.$element[t]("in"),e.support.transition&&this.$element.hasClass("collapse")?this.$element.one(e.support.transition.end,s):s()},toggle:function(){this[this.$element.hasClass("in")?"hide":"show"]()}};var n=e.fn.collapse;e.fn.collapse=function(n){return this.each(function(){var r=e(this),i=r.data("collapse"),s=e.extend({},e.fn.collapse.defaults,r.data(),typeof n=="object"&&n);i||r.data("collapse",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.collapse.defaults={toggle:!0},e.fn.collapse.Constructor=t,e.fn.collapse.noConflict=function(){return e.fn.collapse=n,this},e(document).on("click.collapse.data-api","[data-toggle=collapse]",function(t){var n=e(this),r,i=n.attr("data-target")||t.preventDefault()||(r=n.attr("href"))&&r.replace(/.*(?=#[^\s]+$)/,""),s=e(i).data("collapse")?"toggle":n.data();n[e(i).hasClass("in")?"addClass":"removeClass"]("collapsed"),e(i).collapse(s)})}(window.jQuery),!function(e){"use strict";function r(){e(t).each(function(){i(e(this)).removeClass("open")})}function i(t){var n=t.attr("data-target"),r;n||(n=t.attr("href"),n=n&&/#/.test(n)&&n.replace(/.*(?=#[^\s]*$)/,"")),r=n&&e(n);if(!r||!r.length)r=t.parent();return r}var t="[data-toggle=dropdown]",n=function(t){var n=e(t).on("click.dropdown.data-api",this.toggle);e("html").on("click.dropdown.data-api",function(){n.parent().removeClass("open")})};n.prototype={constructor:n,toggle:function(t){var n=e(this),s,o;if(n.is(".disabled, :disabled"))return;return s=i(n),o=s.hasClass("open"),r(),o||s.toggleClass("open"),n.focus(),!1},keydown:function(n){var r,s,o,u,a,f;if(!/(38|40|27)/.test(n.keyCode))return;r=e(this),n.preventDefault(),n.stopPropagation();if(r.is(".disabled, :disabled"))return;u=i(r),a=u.hasClass("open");if(!a||a&&n.keyCode==27)return n.which==27&&u.find(t).focus(),r.click();s=e("[role=menu] li:not(.divider):visible a",u);if(!s.length)return;f=s.index(s.filter(":focus")),n.keyCode==38&&f>0&&f--,n.keyCode==40&&f<s.length-1&&f++,~f||(f=0),s.eq(f).focus()}};var s=e.fn.dropdown;e.fn.dropdown=function(t){return this.each(function(){var r=e(this),i=r.data("dropdown");i||r.data("dropdown",i=new n(this)),typeof t=="string"&&i[t].call(r)})},e.fn.dropdown.Constructor=n,e.fn.dropdown.noConflict=function(){return e.fn.dropdown=s,this},e(document).on("click.dropdown.data-api",r).on("click.dropdown.data-api",".dropdown form",function(e){e.stopPropagation()}).on("click.dropdown-menu",function(e){e.stopPropagation()}).on("click.dropdown.data-api",t,n.prototype.toggle).on("keydown.dropdown.data-api",t+", [role=menu]",n.prototype.keydown)}(window.jQuery),!function(e){"use strict";var t=function(t,n){this.options=n,this.$element=e(t).delegate('[data-dismiss="modal"]',"click.dismiss.modal",e.proxy(this.hide,this)),this.options.remote&&this.$element.find(".modal-body").load(this.options.remote)};t.prototype={constructor:t,toggle:function(){return this[this.isShown?"hide":"show"]()},show:function(){var t=this,n=e.Event("show");this.$element.trigger(n);if(this.isShown||n.isDefaultPrevented())return;this.isShown=!0,this.escape(),this.backdrop(function(){var n=e.support.transition&&t.$element.hasClass("fade");t.$element.parent().length||t.$element.appendTo(document.body),t.$element.show(),n&&t.$element[0].offsetWidth,t.$element.addClass("in").attr("aria-hidden",!1),t.enforceFocus(),n?t.$element.one(e.support.transition.end,function(){t.$element.focus().trigger("shown")}):t.$element.focus().trigger("shown")})},hide:function(t){t&&t.preventDefault();var n=this;t=e.Event("hide"),this.$element.trigger(t);if(!this.isShown||t.isDefaultPrevented())return;this.isShown=!1,this.escape(),e(document).off("focusin.modal"),this.$element.removeClass("in").attr("aria-hidden",!0),e.support.transition&&this.$element.hasClass("fade")?this.hideWithTransition():this.hideModal()},enforceFocus:function(){var t=this;e(document).on("focusin.modal",function(e){t.$element[0]!==e.target&&!t.$element.has(e.target).length&&t.$element.focus()})},escape:function(){var e=this;this.isShown&&this.options.keyboard?this.$element.on("keyup.dismiss.modal",function(t){t.which==27&&e.hide()}):this.isShown||this.$element.off("keyup.dismiss.modal")},hideWithTransition:function(){var t=this,n=setTimeout(function(){t.$element.off(e.support.transition.end),t.hideModal()},500);this.$element.one(e.support.transition.end,function(){clearTimeout(n),t.hideModal()})},hideModal:function(){var e=this;this.$element.hide(),this.backdrop(function(){e.removeBackdrop(),e.$element.trigger("hidden")})},removeBackdrop:function(){this.$backdrop&&this.$backdrop.remove(),this.$backdrop=null},backdrop:function(t){var n=this,r=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var i=e.support.transition&&r;this.$backdrop=e('<div class="modal-backdrop '+r+'" />').appendTo(document.body),this.$backdrop.click(this.options.backdrop=="static"?e.proxy(this.$element[0].focus,this.$element[0]):e.proxy(this.hide,this)),i&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in");if(!t)return;i?this.$backdrop.one(e.support.transition.end,t):t()}else!this.isShown&&this.$backdrop?(this.$backdrop.removeClass("in"),e.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one(e.support.transition.end,t):t()):t&&t()}};var n=e.fn.modal;e.fn.modal=function(n){return this.each(function(){var r=e(this),i=r.data("modal"),s=e.extend({},e.fn.modal.defaults,r.data(),typeof n=="object"&&n);i||r.data("modal",i=new t(this,s)),typeof n=="string"?i[n]():s.show&&i.show()})},e.fn.modal.defaults={backdrop:!0,keyboard:!0,show:!0},e.fn.modal.Constructor=t,e.fn.modal.noConflict=function(){return e.fn.modal=n,this},e(document).on("click.modal.data-api",'[data-toggle="modal"]',function(t){var n=e(this),r=n.attr("href"),i=e(n.attr("data-target")||r&&r.replace(/.*(?=#[^\s]+$)/,"")),s=i.data("modal")?"toggle":e.extend({remote:!/#/.test(r)&&r},i.data(),n.data());t.preventDefault(),i.modal(s).one("hide",function(){n.focus()})})}(window.jQuery),!function(e){"use strict";var t=function(e,t){this.init("tooltip",e,t)};t.prototype={constructor:t,init:function(t,n,r){var i,s,o,u,a;this.type=t,this.$element=e(n),this.options=this.getOptions(r),this.enabled=!0,o=this.options.trigger.split(" ");for(a=o.length;a--;)u=o[a],u=="click"?this.$element.on("click."+this.type,this.options.selector,e.proxy(this.toggle,this)):u!="manual"&&(i=u=="hover"?"mouseenter":"focus",s=u=="hover"?"mouseleave":"blur",this.$element.on(i+"."+this.type,this.options.selector,e.proxy(this.enter,this)),this.$element.on(s+"."+this.type,this.options.selector,e.proxy(this.leave,this)));this.options.selector?this._options=e.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},getOptions:function(t){return t=e.extend({},e.fn[this.type].defaults,this.$element.data(),t),t.delay&&typeof t.delay=="number"&&(t.delay={show:t.delay,hide:t.delay}),t},enter:function(t){var n=e.fn[this.type].defaults,r={},i;this._options&&e.each(this._options,function(e,t){n[e]!=t&&(r[e]=t)},this),i=e(t.currentTarget)[this.type](r).data(this.type);if(!i.options.delay||!i.options.delay.show)return i.show();clearTimeout(this.timeout),i.hoverState="in",this.timeout=setTimeout(function(){i.hoverState=="in"&&i.show()},i.options.delay.show)},leave:function(t){var n=e(t.currentTarget)[this.type](this._options).data(this.type);this.timeout&&clearTimeout(this.timeout);if(!n.options.delay||!n.options.delay.hide)return n.hide();n.hoverState="out",this.timeout=setTimeout(function(){n.hoverState=="out"&&n.hide()},n.options.delay.hide)},show:function(){var t,n,r,i,s,o,u=e.Event("show");if(this.hasContent()&&this.enabled){this.$element.trigger(u);if(u.isDefaultPrevented())return;t=this.tip(),this.setContent(),this.options.animation&&t.addClass("fade"),s=typeof this.options.placement=="function"?this.options.placement.call(this,t[0],this.$element[0]):this.options.placement,t.detach().css({top:0,left:0,display:"block"}),this.options.container?t.appendTo(this.options.container):t.insertAfter(this.$element),n=this.getPosition(),r=t[0].offsetWidth,i=t[0].offsetHeight;switch(s){case"bottom":o={top:n.top+n.height,left:n.left+n.width/2-r/2};break;case"top":o={top:n.top-i,left:n.left+n.width/2-r/2};break;case"left":o={top:n.top+n.height/2-i/2,left:n.left-r};break;case"right":o={top:n.top+n.height/2-i/2,left:n.left+n.width}}this.applyPlacement(o,s),this.$element.trigger("shown")}},applyPlacement:function(e,t){var n=this.tip(),r=n[0].offsetWidth,i=n[0].offsetHeight,s,o,u,a;n.offset(e).addClass(t).addClass("in"),s=n[0].offsetWidth,o=n[0].offsetHeight,t=="top"&&o!=i&&(e.top=e.top+i-o,a=!0),t=="bottom"||t=="top"?(u=0,e.left<0&&(u=e.left*-2,e.left=0,n.offset(e),s=n[0].offsetWidth,o=n[0].offsetHeight),this.replaceArrow(u-r+s,s,"left")):this.replaceArrow(o-i,o,"top"),a&&n.offset(e)},replaceArrow:function(e,t,n){this.arrow().css(n,e?50*(1-e/t)+"%":"")},setContent:function(){var e=this.tip(),t=this.getTitle();e.find(".tooltip-inner")[this.options.html?"html":"text"](t),e.removeClass("fade in top bottom left right")},hide:function(){function i(){var t=setTimeout(function(){n.off(e.support.transition.end).detach()},500);n.one(e.support.transition.end,function(){clearTimeout(t),n.detach()})}var t=this,n=this.tip(),r=e.Event("hide");this.$element.trigger(r);if(r.isDefaultPrevented())return;return n.removeClass("in"),e.support.transition&&this.$tip.hasClass("fade")?i():n.detach(),this.$element.trigger("hidden"),this},fixTitle:function(){var e=this.$element;(e.attr("title")||typeof e.attr("data-original-title")!="string")&&e.attr("data-original-title",e.attr("title")||"").attr("title","")},hasContent:function(){return this.getTitle()},getPosition:function(){var t=this.$element[0];return e.extend({},typeof t.getBoundingClientRect=="function"?t.getBoundingClientRect():{width:t.offsetWidth,height:t.offsetHeight},this.$element.offset())},getTitle:function(){var e,t=this.$element,n=this.options;return e=t.attr("data-original-title")||(typeof n.title=="function"?n.title.call(t[0]):n.title),e},tip:function(){return this.$tip=this.$tip||e(this.options.template)},arrow:function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},validate:function(){this.$element[0].parentNode||(this.hide(),this.$element=null,this.options=null)},enable:function(){this.enabled=!0},disable:function(){this.enabled=!1},toggleEnabled:function(){this.enabled=!this.enabled},toggle:function(t){var n=t?e(t.currentTarget)[this.type](this._options).data(this.type):this;n.tip().hasClass("in")?n.hide():n.show()},destroy:function(){this.hide().$element.off("."+this.type).removeData(this.type)}};var n=e.fn.tooltip;e.fn.tooltip=function(n){return this.each(function(){var r=e(this),i=r.data("tooltip"),s=typeof n=="object"&&n;i||r.data("tooltip",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.tooltip.Constructor=t,e.fn.tooltip.defaults={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1},e.fn.tooltip.noConflict=function(){return e.fn.tooltip=n,this}}(window.jQuery),!function(e){"use strict";var t=function(e,t){this.init("popover",e,t)};t.prototype=e.extend({},e.fn.tooltip.Constructor.prototype,{constructor:t,setContent:function(){var e=this.tip(),t=this.getTitle(),n=this.getContent();e.find(".popover-title")[this.options.html?"html":"text"](t),e.find(".popover-content")[this.options.html?"html":"text"](n),e.removeClass("fade top bottom left right in")},hasContent:function(){return this.getTitle()||this.getContent()},getContent:function(){var e,t=this.$element,n=this.options;return e=(typeof n.content=="function"?n.content.call(t[0]):n.content)||t.attr("data-content"),e},tip:function(){return this.$tip||(this.$tip=e(this.options.template)),this.$tip},destroy:function(){this.hide().$element.off("."+this.type).removeData(this.type)}});var n=e.fn.popover;e.fn.popover=function(n){return this.each(function(){var r=e(this),i=r.data("popover"),s=typeof n=="object"&&n;i||r.data("popover",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.popover.Constructor=t,e.fn.popover.defaults=e.extend({},e.fn.tooltip.defaults,{placement:"right",trigger:"click",content:"",template:'<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),e.fn.popover.noConflict=function(){return e.fn.popover=n,this}}(window.jQuery),!function(e){"use strict";function t(t,n){var r=e.proxy(this.process,this),i=e(t).is("body")?e(window):e(t),s;this.options=e.extend({},e.fn.scrollspy.defaults,n),this.$scrollElement=i.on("scroll.scroll-spy.data-api",r),this.selector=(this.options.target||(s=e(t).attr("href"))&&s.replace(/.*(?=#[^\s]+$)/,"")||"")+" .nav li > a",this.$body=e("body"),this.refresh(),this.process()}t.prototype={constructor:t,refresh:function(){var t=this,n;this.offsets=e([]),this.targets=e([]),n=this.$body.find(this.selector).map(function(){var n=e(this),r=n.data("target")||n.attr("href"),i=/^#\w/.test(r)&&e(r);return i&&i.length&&[[i.position().top+(!e.isWindow(t.$scrollElement.get(0))&&t.$scrollElement.scrollTop()),r]]||null}).sort(function(e,t){return e[0]-t[0]}).each(function(){t.offsets.push(this[0]),t.targets.push(this[1])})},process:function(){var e=this.$scrollElement.scrollTop()+this.options.offset,t=this.$scrollElement[0].scrollHeight||this.$body[0].scrollHeight,n=t-this.$scrollElement.height(),r=this.offsets,i=this.targets,s=this.activeTarget,o;if(e>=n)return s!=(o=i.last()[0])&&this.activate(o);for(o=r.length;o--;)s!=i[o]&&e>=r[o]&&(!r[o+1]||e<=r[o+1])&&this.activate(i[o])},activate:function(t){var n,r;this.activeTarget=t,e(this.selector).parent(".active").removeClass("active"),r=this.selector+'[data-target="'+t+'"],'+this.selector+'[href="'+t+'"]',n=e(r).parent("li").addClass("active"),n.parent(".dropdown-menu").length&&(n=n.closest("li.dropdown").addClass("active")),n.trigger("activate")}};var n=e.fn.scrollspy;e.fn.scrollspy=function(n){return this.each(function(){var r=e(this),i=r.data("scrollspy"),s=typeof n=="object"&&n;i||r.data("scrollspy",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.scrollspy.Constructor=t,e.fn.scrollspy.defaults={offset:10},e.fn.scrollspy.noConflict=function(){return e.fn.scrollspy=n,this},e(window).on("load",function(){e('[data-spy="scroll"]').each(function(){var t=e(this);t.scrollspy(t.data())})})}(window.jQuery),!function(e){"use strict";var t=function(t){this.element=e(t)};t.prototype={constructor:t,show:function(){var t=this.element,n=t.closest("ul:not(.dropdown-menu)"),r=t.attr("data-target"),i,s,o;r||(r=t.attr("href"),r=r&&r.replace(/.*(?=#[^\s]*$)/,""));if(t.parent("li").hasClass("active"))return;i=n.find(".active:last a")[0],o=e.Event("show",{relatedTarget:i}),t.trigger(o);if(o.isDefaultPrevented())return;s=e(r),this.activate(t.parent("li"),n),this.activate(s,s.parent(),function(){t.trigger({type:"shown",relatedTarget:i})})},activate:function(t,n,r){function o(){i.removeClass("active").find("> .dropdown-menu > .active").removeClass("active"),t.addClass("active"),s?(t[0].offsetWidth,t.addClass("in")):t.removeClass("fade"),t.parent(".dropdown-menu")&&t.closest("li.dropdown").addClass("active"),r&&r()}var i=n.find("> .active"),s=r&&e.support.transition&&i.hasClass("fade");s?i.one(e.support.transition.end,o):o(),i.removeClass("in")}};var n=e.fn.tab;e.fn.tab=function(n){return this.each(function(){var r=e(this),i=r.data("tab");i||r.data("tab",i=new t(this)),typeof n=="string"&&i[n]()})},e.fn.tab.Constructor=t,e.fn.tab.noConflict=function(){return e.fn.tab=n,this},e(document).on("click.tab.data-api",'[data-toggle="tab"], [data-toggle="pill"]',function(t){t.preventDefault(),e(this).tab("show")})}(window.jQuery),!function(e){"use strict";var t=function(t,n){this.$element=e(t),this.options=e.extend({},e.fn.typeahead.defaults,n),this.matcher=this.options.matcher||this.matcher,this.sorter=this.options.sorter||this.sorter,this.highlighter=this.options.highlighter||this.highlighter,this.updater=this.options.updater||this.updater,this.source=this.options.source,this.$menu=e(this.options.menu),this.shown=!1,this.listen()};t.prototype={constructor:t,select:function(){var e=this.$menu.find(".active").attr("data-value");return this.$element.val(this.updater(e)).change(),this.hide()},updater:function(e){return e},show:function(){var t=e.extend({},this.$element.position(),{height:this.$element[0].offsetHeight});return this.$menu.insertAfter(this.$element).css({top:t.top+t.height,left:t.left}).show(),this.shown=!0,this},hide:function(){return this.$menu.hide(),this.shown=!1,this},lookup:function(t){var n;return this.query=this.$element.val(),!this.query||this.query.length<this.options.minLength?this.shown?this.hide():this:(n=e.isFunction(this.source)?this.source(this.query,e.proxy(this.process,this)):this.source,n?this.process(n):this)},process:function(t){var n=this;return t=e.grep(t,function(e){return n.matcher(e)}),t=this.sorter(t),t.length?this.render(t.slice(0,this.options.items)).show():this.shown?this.hide():this},matcher:function(e){return~e.toLowerCase().indexOf(this.query.toLowerCase())},sorter:function(e){var t=[],n=[],r=[],i;while(i=e.shift())i.toLowerCase().indexOf(this.query.toLowerCase())?~i.indexOf(this.query)?n.push(i):r.push(i):t.push(i);return t.concat(n,r)},highlighter:function(e){var t=this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&");return e.replace(new RegExp("("+t+")","ig"),function(e,t){return"<strong>"+t+"</strong>"})},render:function(t){var n=this;return t=e(t).map(function(t,r){return t=e(n.options.item).attr("data-value",r),t.find("a").html(n.highlighter(r)),t[0]}),t.first().addClass("active"),this.$menu.html(t),this},next:function(t){var n=this.$menu.find(".active").removeClass("active"),r=n.next();r.length||(r=e(this.$menu.find("li")[0])),r.addClass("active")},prev:function(e){var t=this.$menu.find(".active").removeClass("active"),n=t.prev();n.length||(n=this.$menu.find("li").last()),n.addClass("active")},listen:function(){this.$element.on("focus",e.proxy(this.focus,this)).on("blur",e.proxy(this.blur,this)).on("keypress",e.proxy(this.keypress,this)).on("keyup",e.proxy(this.keyup,this)),this.eventSupported("keydown")&&this.$element.on("keydown",e.proxy(this.keydown,this)),this.$menu.on("click",e.proxy(this.click,this)).on("mouseenter","li",e.proxy(this.mouseenter,this)).on("mouseleave","li",e.proxy(this.mouseleave,this))},eventSupported:function(e){var t=e in this.$element;return t||(this.$element.setAttribute(e,"return;"),t=typeof this.$element[e]=="function"),t},move:function(e){if(!this.shown)return;switch(e.keyCode){case 9:case 13:case 27:e.preventDefault();break;case 38:e.preventDefault(),this.prev();break;case 40:e.preventDefault(),this.next()}e.stopPropagation()},keydown:function(t){this.suppressKeyPressRepeat=~e.inArray(t.keyCode,[40,38,9,13,27]),this.move(t)},keypress:function(e){if(this.suppressKeyPressRepeat)return;this.move(e)},keyup:function(e){switch(e.keyCode){case 40:case 38:case 16:case 17:case 18:break;case 9:case 13:if(!this.shown)return;this.select();break;case 27:if(!this.shown)return;this.hide();break;default:this.lookup()}e.stopPropagation(),e.preventDefault()},focus:function(e){this.focused=!0},blur:function(e){this.focused=!1,!this.mousedover&&this.shown&&this.hide()},click:function(e){e.stopPropagation(),e.preventDefault(),this.select(),this.$element.focus()},mouseenter:function(t){this.mousedover=!0,this.$menu.find(".active").removeClass("active"),e(t.currentTarget).addClass("active")},mouseleave:function(e){this.mousedover=!1,!this.focused&&this.shown&&this.hide()}};var n=e.fn.typeahead;e.fn.typeahead=function(n){return this.each(function(){var r=e(this),i=r.data("typeahead"),s=typeof n=="object"&&n;i||r.data("typeahead",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.typeahead.defaults={source:[],items:8,menu:'<ul class="typeahead dropdown-menu"></ul>',item:'<li><a href="#"></a></li>',minLength:1},e.fn.typeahead.Constructor=t,e.fn.typeahead.noConflict=function(){return e.fn.typeahead=n,this},e(document).on("focus.typeahead.data-api",'[data-provide="typeahead"]',function(t){var n=e(this);if(n.data("typeahead"))return;n.typeahead(n.data())})}(window.jQuery),!function(e){"use strict";var t=function(t,n){this.options=e.extend({},e.fn.affix.defaults,n),this.$window=e(window).on("scroll.affix.data-api",e.proxy(this.checkPosition,this)).on("click.affix.data-api",e.proxy(function(){setTimeout(e.proxy(this.checkPosition,this),1)},this)),this.$element=e(t),this.checkPosition()};t.prototype.checkPosition=function(){if(!this.$element.is(":visible"))return;var t=e(document).height(),n=this.$window.scrollTop(),r=this.$element.offset(),i=this.options.offset,s=i.bottom,o=i.top,u="affix affix-top affix-bottom",a;typeof i!="object"&&(s=o=i),typeof o=="function"&&(o=i.top()),typeof s=="function"&&(s=i.bottom()),a=this.unpin!=null&&n+this.unpin<=r.top?!1:s!=null&&r.top+this.$element.height()>=t-s?"bottom":o!=null&&n<=o?"top":!1;if(this.affixed===a)return;this.affixed=a,this.unpin=a=="bottom"?r.top-n:null,this.$element.removeClass(u).addClass("affix"+(a?"-"+a:""))};var n=e.fn.affix;e.fn.affix=function(n){return this.each(function(){var r=e(this),i=r.data("affix"),s=typeof n=="object"&&n;i||r.data("affix",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.affix.Constructor=t,e.fn.affix.defaults={offset:0},e.fn.affix.noConflict=function(){return e.fn.affix=n,this},e(window).on("load",function(){e('[data-spy="affix"]').each(function(){var t=e(this),n=t.data();n.offset=n.offset||{},n.offsetBottom&&(n.offset.bottom=n.offsetBottom),n.offsetTop&&(n.offset.top=n.offsetTop),t.affix(n)})})}(window.jQuery);
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

    src=img.css('background-image');
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

$('[data-toggle="tooltip"]').tooltip({
  delay: {
    show: 500, hide: 2000
  }
});
$('[data-toggle="tooltip"]').on('click',function (e) {
  $this=$(this);
  if($this.closest('ul').hasClass('paginate')) {
    //для пагинации ссылка должна работать
    return true;
  }
  if($this.hasClass('workHref')){
    //Если ссылка помеченна как рабочая то нужно переходить
    return true;
  }
  e.preventDefault();
  return false;
});


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
    }).success(function(data) {
      $('#grid-ajax-action').yiiGridView("applyFilter");
      if (data.error != false) {
        notification.notifi({message:'Произошла ошибка!',type:'err'})
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
$( document ).ready(function() {
  /*m_w = $('.text-content').width()
  if (m_w < 50)m_w = screen.width - 40*/
  mw=screen.width-40;
  p = $('.container img,.container iframe')
  for (i = 0; i < p.length; i++) {
    el = p.eq(i);
    m_w=el.parent().width();
    if(m_w>mw)m_w=mw;
    if (el.width() > m_w) {
      k = el.width() / m_w;
      el.height(el.height() / k);
      el.width(m_w)
    }
  }
});

//избранное
$( document ).ready(function() {
  $("#top .favorite-link").on('click',function() {
    var self = $(this);
    var type = self.attr("data-state"),
      affiliate_id = self.attr("data-affiliate-id");

    if(type == "add") {
      self.find(".fa").removeClass("muted");
    }

    self.find(".fa").removeClass("pulse2").addClass("fa-spin");

    $.post("/account/favorites",{
      "type" : type ,
      "affiliate_id": affiliate_id
    },function (data) {
      if(data.error){
        notification.notifi({message:data.error,type:'err','title':(data.title?data.title:false)});
        return;
      }

      notification.notifi({
        message:data.msg,
        type:'success',
        'title':(data.title?data.title:false)
      });

      if(type == "add") {
        self.find(".fa").addClass("muted");
      }
      self.find(".fa").removeClass("fa-spin");

      self.attr({
        "data-state": data["data-state"],
        "data-original-title": data['data-original-title']
      });

      if(type == "add") {
        self.find(".fa").removeClass("fa-spin fa-heart-o").addClass("fa-heart");
      } else if(type == "delete") {
        self.find(".fa").removeClass("fa-spin fa-heart").addClass("fa-heart-o muted");
      }

    },'json').fail(function() {
      notification.notifi({message:"<b>Технические работы!</b><br>В данный момент времени" +
      " произведённое действие невозможно. Попробуйте позже." +
      " Приносим свои извинения за неудобство.",type:'err'});

      if(type == "add") {
        self.find(".fa").addClass("muted");
      }
      self.find(".fa").removeClass("fa-spin");
    })
  });
});

//если открыто как дочернее
$(function(){
  if(!window.opener)return;
  if(href.indexOf('socials')>0 || href.indexOf('login')>0){
    return;
  }
  href=window.opener.location.href;
  if(href.indexOf('store')>0 || href.indexOf('coupon')>0 || href.indexOf('settings')>0){
    window.opener.location.reload();
  }else{
    window.opener.location.href=location.href;
  }
  window.close();
});
var notification = (function() {
  var conteiner;
  var mouseOver = 0;
  var timerClearAll = null;
  var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
  var time = 10000;

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
    buttonTag:'div',
    buttonYesDop:'',
    buttonNoDop:'',
  };
  var alert_opt={
    title:"",
    question:"Сообщение",
    buttonYes:"Да",
    callbackYes:false,
    buttonTag:'div',
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

  var _setUpListeners = function() {
    $('body').on('click', '.notification_close', _closePopup);
    $('body').on('mouseenter', '.notification_container', _onEnter);
    $('body').on('mouseleave', '.notification_container', _onLeave);
  };

  var _onEnter = function(event) {
    if(event)event.preventDefault();
    if (timerClearAll!=null) {
      clearTimeout(timerClearAll);
      timerClearAll = null;
    }
    conteiner.find('.notification_item').each(function(i){
      var option=$(this).data('option');
      if(option.timer) {
        clearTimeout(option.timer);
      }
    });
    mouseOver = 1;
  };

  var _onLeave = function() {
    conteiner.find('.notification_item').each(function(i){
      $this=$(this);
      var option=$this.data('option');
      if(option.time>0) {
        option.timer = setTimeout(_closePopup.bind(option.close), option.time - 1500 + 100 * i);
        $this.data('option',option)
      }
    });
    mouseOver = 0;
  };

  var _closePopup = function(event) {
    if(event)event.preventDefault();

    var $this = $(this).parent();
    $this.on(animationEnd, function() {
      $(this).remove();
    });
    $this.addClass('notification_hide')
  };

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
      if (data.buttonYes)box_html += '<'+data.buttonTag+' class="notify_btn_yes" '+data.buttonYesDop+'>' + data.buttonYes + '</'+data.buttonTag+'>';
      if (data.buttonNo)box_html += '<'+data.buttonTag+' class="notify_btn_no" '+data.buttonNoDop+'>' + data.buttonNo + '</'+data.buttonTag+'>';
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

  function notifi(data) {
    if(!data)data={};
    var option = {time : (data.time||data.time===0)?data.time:time};
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

    if (data.type){
      li.addClass('notification_item-' + data.type);
    }

    var close=$('<span/>',{
      class:'notification_close'
    });
    option.close=close;
    li.append(close);

    var content = $('<div/>',{
      class:"notification_content"
    });

    if(data.title && data.title.length>0) {
      var title = $('<h5/>', {
        class: "notification_title"
      });
      title.html(data.title);
      content.append(title);
    }

    var text= $('<div/>',{
      class:"notification_text"
    });
    text.html(data.message);

    if(data.img && data.img.length>0) {
      var img = $('<div/>', {
        class: "notification_img"
      });
      img.css('background-image','url('+data.img+')');
      var wrap = $('<div/>', {
        class: "wrap"
      });

      wrap.append(img);
      wrap.append(text);
      content.append(wrap);
    }else{
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

    if(option.time>0){
      option.timer=setTimeout(_closePopup.bind(close), option.time);
    }
    li.data('option',option)
  }

  return {
    alert: alert,
    confirm: confirm,
    notifi: notifi,
  };

})();


$('[ref=popup]').on('click',function (e){
  e.preventDefault();
  $this=$(this);
  el=$($this.attr('href'));
  data=el.data();

  data.question=el.html();
  notification.alert(data);
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
    wrap.html('<h3>Упс... Возникла непредвиденная ошибка.<h3>' +
      '<p>Часто это происходит в случае, если вы несколько раз подряд неверно ввели свои учетные данные. Но возможны и другие причины. В любом случае не расстраивайтесь и просто обратитесь к нашему оператору службы поддержки.</p><br>' +
      '<p>Спасибо.</p>');
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





//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvb3RzdHJhcC5taW4uanMiLCJmb3JfYWxsLmpzIiwibm90aWZpY2F0aW9uLmpzIiwianF1ZXJ5LmFqYXhGb3JtLmpzIiwiYjJiLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcbiogQm9vdHN0cmFwLmpzIGJ5IEBmYXQgJiBAbWRvXG4qIENvcHlyaWdodCAyMDEyIFR3aXR0ZXIsIEluYy5cbiogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wLnR4dFxuKi9cbiFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjtlKGZ1bmN0aW9uKCl7ZS5zdXBwb3J0LnRyYW5zaXRpb249ZnVuY3Rpb24oKXt2YXIgZT1mdW5jdGlvbigpe3ZhciBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJib290c3RyYXBcIiksdD17V2Via2l0VHJhbnNpdGlvbjpcIndlYmtpdFRyYW5zaXRpb25FbmRcIixNb3pUcmFuc2l0aW9uOlwidHJhbnNpdGlvbmVuZFwiLE9UcmFuc2l0aW9uOlwib1RyYW5zaXRpb25FbmQgb3RyYW5zaXRpb25lbmRcIix0cmFuc2l0aW9uOlwidHJhbnNpdGlvbmVuZFwifSxuO2ZvcihuIGluIHQpaWYoZS5zdHlsZVtuXSE9PXVuZGVmaW5lZClyZXR1cm4gdFtuXX0oKTtyZXR1cm4gZSYme2VuZDplfX0oKX0pfSh3aW5kb3cualF1ZXJ5KSwhZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7dmFyIHQ9J1tkYXRhLWRpc21pc3M9XCJhbGVydFwiXScsbj1mdW5jdGlvbihuKXtlKG4pLm9uKFwiY2xpY2tcIix0LHRoaXMuY2xvc2UpfTtuLnByb3RvdHlwZS5jbG9zZT1mdW5jdGlvbih0KXtmdW5jdGlvbiBzKCl7aS50cmlnZ2VyKFwiY2xvc2VkXCIpLnJlbW92ZSgpfXZhciBuPWUodGhpcykscj1uLmF0dHIoXCJkYXRhLXRhcmdldFwiKSxpO3J8fChyPW4uYXR0cihcImhyZWZcIikscj1yJiZyLnJlcGxhY2UoLy4qKD89I1teXFxzXSokKS8sXCJcIikpLGk9ZShyKSx0JiZ0LnByZXZlbnREZWZhdWx0KCksaS5sZW5ndGh8fChpPW4uaGFzQ2xhc3MoXCJhbGVydFwiKT9uOm4ucGFyZW50KCkpLGkudHJpZ2dlcih0PWUuRXZlbnQoXCJjbG9zZVwiKSk7aWYodC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSlyZXR1cm47aS5yZW1vdmVDbGFzcyhcImluXCIpLGUuc3VwcG9ydC50cmFuc2l0aW9uJiZpLmhhc0NsYXNzKFwiZmFkZVwiKT9pLm9uKGUuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCxzKTpzKCl9O3ZhciByPWUuZm4uYWxlcnQ7ZS5mbi5hbGVydD1mdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHI9ZSh0aGlzKSxpPXIuZGF0YShcImFsZXJ0XCIpO2l8fHIuZGF0YShcImFsZXJ0XCIsaT1uZXcgbih0aGlzKSksdHlwZW9mIHQ9PVwic3RyaW5nXCImJmlbdF0uY2FsbChyKX0pfSxlLmZuLmFsZXJ0LkNvbnN0cnVjdG9yPW4sZS5mbi5hbGVydC5ub0NvbmZsaWN0PWZ1bmN0aW9uKCl7cmV0dXJuIGUuZm4uYWxlcnQ9cix0aGlzfSxlKGRvY3VtZW50KS5vbihcImNsaWNrLmFsZXJ0LmRhdGEtYXBpXCIsdCxuLnByb3RvdHlwZS5jbG9zZSl9KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjt2YXIgdD1mdW5jdGlvbih0LG4pe3RoaXMuJGVsZW1lbnQ9ZSh0KSx0aGlzLm9wdGlvbnM9ZS5leHRlbmQoe30sZS5mbi5idXR0b24uZGVmYXVsdHMsbil9O3QucHJvdG90eXBlLnNldFN0YXRlPWZ1bmN0aW9uKGUpe3ZhciB0PVwiZGlzYWJsZWRcIixuPXRoaXMuJGVsZW1lbnQscj1uLmRhdGEoKSxpPW4uaXMoXCJpbnB1dFwiKT9cInZhbFwiOlwiaHRtbFwiO2UrPVwiVGV4dFwiLHIucmVzZXRUZXh0fHxuLmRhdGEoXCJyZXNldFRleHRcIixuW2ldKCkpLG5baV0ocltlXXx8dGhpcy5vcHRpb25zW2VdKSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZT09XCJsb2FkaW5nVGV4dFwiP24uYWRkQ2xhc3ModCkuYXR0cih0LHQpOm4ucmVtb3ZlQ2xhc3ModCkucmVtb3ZlQXR0cih0KX0sMCl9LHQucHJvdG90eXBlLnRvZ2dsZT1mdW5jdGlvbigpe3ZhciBlPXRoaXMuJGVsZW1lbnQuY2xvc2VzdCgnW2RhdGEtdG9nZ2xlPVwiYnV0dG9ucy1yYWRpb1wiXScpO2UmJmUuZmluZChcIi5hY3RpdmVcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIiksdGhpcy4kZWxlbWVudC50b2dnbGVDbGFzcyhcImFjdGl2ZVwiKX07dmFyIG49ZS5mbi5idXR0b247ZS5mbi5idXR0b249ZnVuY3Rpb24obil7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciByPWUodGhpcyksaT1yLmRhdGEoXCJidXR0b25cIikscz10eXBlb2Ygbj09XCJvYmplY3RcIiYmbjtpfHxyLmRhdGEoXCJidXR0b25cIixpPW5ldyB0KHRoaXMscykpLG49PVwidG9nZ2xlXCI/aS50b2dnbGUoKTpuJiZpLnNldFN0YXRlKG4pfSl9LGUuZm4uYnV0dG9uLmRlZmF1bHRzPXtsb2FkaW5nVGV4dDpcImxvYWRpbmcuLi5cIn0sZS5mbi5idXR0b24uQ29uc3RydWN0b3I9dCxlLmZuLmJ1dHRvbi5ub0NvbmZsaWN0PWZ1bmN0aW9uKCl7cmV0dXJuIGUuZm4uYnV0dG9uPW4sdGhpc30sZShkb2N1bWVudCkub24oXCJjbGljay5idXR0b24uZGF0YS1hcGlcIixcIltkYXRhLXRvZ2dsZV49YnV0dG9uXVwiLGZ1bmN0aW9uKHQpe3ZhciBuPWUodC50YXJnZXQpO24uaGFzQ2xhc3MoXCJidG5cIil8fChuPW4uY2xvc2VzdChcIi5idG5cIikpLG4uYnV0dG9uKFwidG9nZ2xlXCIpfSl9KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjt2YXIgdD1mdW5jdGlvbih0LG4pe3RoaXMuJGVsZW1lbnQ9ZSh0KSx0aGlzLiRpbmRpY2F0b3JzPXRoaXMuJGVsZW1lbnQuZmluZChcIi5jYXJvdXNlbC1pbmRpY2F0b3JzXCIpLHRoaXMub3B0aW9ucz1uLHRoaXMub3B0aW9ucy5wYXVzZT09XCJob3ZlclwiJiZ0aGlzLiRlbGVtZW50Lm9uKFwibW91c2VlbnRlclwiLGUucHJveHkodGhpcy5wYXVzZSx0aGlzKSkub24oXCJtb3VzZWxlYXZlXCIsZS5wcm94eSh0aGlzLmN5Y2xlLHRoaXMpKX07dC5wcm90b3R5cGU9e2N5Y2xlOmZ1bmN0aW9uKHQpe3JldHVybiB0fHwodGhpcy5wYXVzZWQ9ITEpLHRoaXMuaW50ZXJ2YWwmJmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbCksdGhpcy5vcHRpb25zLmludGVydmFsJiYhdGhpcy5wYXVzZWQmJih0aGlzLmludGVydmFsPXNldEludGVydmFsKGUucHJveHkodGhpcy5uZXh0LHRoaXMpLHRoaXMub3B0aW9ucy5pbnRlcnZhbCkpLHRoaXN9LGdldEFjdGl2ZUluZGV4OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuJGFjdGl2ZT10aGlzLiRlbGVtZW50LmZpbmQoXCIuaXRlbS5hY3RpdmVcIiksdGhpcy4kaXRlbXM9dGhpcy4kYWN0aXZlLnBhcmVudCgpLmNoaWxkcmVuKCksdGhpcy4kaXRlbXMuaW5kZXgodGhpcy4kYWN0aXZlKX0sdG86ZnVuY3Rpb24odCl7dmFyIG49dGhpcy5nZXRBY3RpdmVJbmRleCgpLHI9dGhpcztpZih0PnRoaXMuJGl0ZW1zLmxlbmd0aC0xfHx0PDApcmV0dXJuO3JldHVybiB0aGlzLnNsaWRpbmc/dGhpcy4kZWxlbWVudC5vbmUoXCJzbGlkXCIsZnVuY3Rpb24oKXtyLnRvKHQpfSk6bj09dD90aGlzLnBhdXNlKCkuY3ljbGUoKTp0aGlzLnNsaWRlKHQ+bj9cIm5leHRcIjpcInByZXZcIixlKHRoaXMuJGl0ZW1zW3RdKSl9LHBhdXNlOmZ1bmN0aW9uKHQpe3JldHVybiB0fHwodGhpcy5wYXVzZWQ9ITApLHRoaXMuJGVsZW1lbnQuZmluZChcIi5uZXh0LCAucHJldlwiKS5sZW5ndGgmJmUuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCYmKHRoaXMuJGVsZW1lbnQudHJpZ2dlcihlLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQpLHRoaXMuY3ljbGUoITApKSxjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpLHRoaXMuaW50ZXJ2YWw9bnVsbCx0aGlzfSxuZXh0OmZ1bmN0aW9uKCl7aWYodGhpcy5zbGlkaW5nKXJldHVybjtyZXR1cm4gdGhpcy5zbGlkZShcIm5leHRcIil9LHByZXY6ZnVuY3Rpb24oKXtpZih0aGlzLnNsaWRpbmcpcmV0dXJuO3JldHVybiB0aGlzLnNsaWRlKFwicHJldlwiKX0sc2xpZGU6ZnVuY3Rpb24odCxuKXt2YXIgcj10aGlzLiRlbGVtZW50LmZpbmQoXCIuaXRlbS5hY3RpdmVcIiksaT1ufHxyW3RdKCkscz10aGlzLmludGVydmFsLG89dD09XCJuZXh0XCI/XCJsZWZ0XCI6XCJyaWdodFwiLHU9dD09XCJuZXh0XCI/XCJmaXJzdFwiOlwibGFzdFwiLGE9dGhpcyxmO3RoaXMuc2xpZGluZz0hMCxzJiZ0aGlzLnBhdXNlKCksaT1pLmxlbmd0aD9pOnRoaXMuJGVsZW1lbnQuZmluZChcIi5pdGVtXCIpW3VdKCksZj1lLkV2ZW50KFwic2xpZGVcIix7cmVsYXRlZFRhcmdldDppWzBdLGRpcmVjdGlvbjpvfSk7aWYoaS5oYXNDbGFzcyhcImFjdGl2ZVwiKSlyZXR1cm47dGhpcy4kaW5kaWNhdG9ycy5sZW5ndGgmJih0aGlzLiRpbmRpY2F0b3JzLmZpbmQoXCIuYWN0aXZlXCIpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLHRoaXMuJGVsZW1lbnQub25lKFwic2xpZFwiLGZ1bmN0aW9uKCl7dmFyIHQ9ZShhLiRpbmRpY2F0b3JzLmNoaWxkcmVuKClbYS5nZXRBY3RpdmVJbmRleCgpXSk7dCYmdC5hZGRDbGFzcyhcImFjdGl2ZVwiKX0pKTtpZihlLnN1cHBvcnQudHJhbnNpdGlvbiYmdGhpcy4kZWxlbWVudC5oYXNDbGFzcyhcInNsaWRlXCIpKXt0aGlzLiRlbGVtZW50LnRyaWdnZXIoZik7aWYoZi5pc0RlZmF1bHRQcmV2ZW50ZWQoKSlyZXR1cm47aS5hZGRDbGFzcyh0KSxpWzBdLm9mZnNldFdpZHRoLHIuYWRkQ2xhc3MobyksaS5hZGRDbGFzcyhvKSx0aGlzLiRlbGVtZW50Lm9uZShlLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsZnVuY3Rpb24oKXtpLnJlbW92ZUNsYXNzKFt0LG9dLmpvaW4oXCIgXCIpKS5hZGRDbGFzcyhcImFjdGl2ZVwiKSxyLnJlbW92ZUNsYXNzKFtcImFjdGl2ZVwiLG9dLmpvaW4oXCIgXCIpKSxhLnNsaWRpbmc9ITEsc2V0VGltZW91dChmdW5jdGlvbigpe2EuJGVsZW1lbnQudHJpZ2dlcihcInNsaWRcIil9LDApfSl9ZWxzZXt0aGlzLiRlbGVtZW50LnRyaWdnZXIoZik7aWYoZi5pc0RlZmF1bHRQcmV2ZW50ZWQoKSlyZXR1cm47ci5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKSxpLmFkZENsYXNzKFwiYWN0aXZlXCIpLHRoaXMuc2xpZGluZz0hMSx0aGlzLiRlbGVtZW50LnRyaWdnZXIoXCJzbGlkXCIpfXJldHVybiBzJiZ0aGlzLmN5Y2xlKCksdGhpc319O3ZhciBuPWUuZm4uY2Fyb3VzZWw7ZS5mbi5jYXJvdXNlbD1mdW5jdGlvbihuKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHI9ZSh0aGlzKSxpPXIuZGF0YShcImNhcm91c2VsXCIpLHM9ZS5leHRlbmQoe30sZS5mbi5jYXJvdXNlbC5kZWZhdWx0cyx0eXBlb2Ygbj09XCJvYmplY3RcIiYmbiksbz10eXBlb2Ygbj09XCJzdHJpbmdcIj9uOnMuc2xpZGU7aXx8ci5kYXRhKFwiY2Fyb3VzZWxcIixpPW5ldyB0KHRoaXMscykpLHR5cGVvZiBuPT1cIm51bWJlclwiP2kudG8obik6bz9pW29dKCk6cy5pbnRlcnZhbCYmaS5wYXVzZSgpLmN5Y2xlKCl9KX0sZS5mbi5jYXJvdXNlbC5kZWZhdWx0cz17aW50ZXJ2YWw6NWUzLHBhdXNlOlwiaG92ZXJcIn0sZS5mbi5jYXJvdXNlbC5Db25zdHJ1Y3Rvcj10LGUuZm4uY2Fyb3VzZWwubm9Db25mbGljdD1mdW5jdGlvbigpe3JldHVybiBlLmZuLmNhcm91c2VsPW4sdGhpc30sZShkb2N1bWVudCkub24oXCJjbGljay5jYXJvdXNlbC5kYXRhLWFwaVwiLFwiW2RhdGEtc2xpZGVdLCBbZGF0YS1zbGlkZS10b11cIixmdW5jdGlvbih0KXt2YXIgbj1lKHRoaXMpLHIsaT1lKG4uYXR0cihcImRhdGEtdGFyZ2V0XCIpfHwocj1uLmF0dHIoXCJocmVmXCIpKSYmci5yZXBsYWNlKC8uKig/PSNbXlxcc10rJCkvLFwiXCIpKSxzPWUuZXh0ZW5kKHt9LGkuZGF0YSgpLG4uZGF0YSgpKSxvO2kuY2Fyb3VzZWwocyksKG89bi5hdHRyKFwiZGF0YS1zbGlkZS10b1wiKSkmJmkuZGF0YShcImNhcm91c2VsXCIpLnBhdXNlKCkudG8obykuY3ljbGUoKSx0LnByZXZlbnREZWZhdWx0KCl9KX0od2luZG93LmpRdWVyeSksIWZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO3ZhciB0PWZ1bmN0aW9uKHQsbil7dGhpcy4kZWxlbWVudD1lKHQpLHRoaXMub3B0aW9ucz1lLmV4dGVuZCh7fSxlLmZuLmNvbGxhcHNlLmRlZmF1bHRzLG4pLHRoaXMub3B0aW9ucy5wYXJlbnQmJih0aGlzLiRwYXJlbnQ9ZSh0aGlzLm9wdGlvbnMucGFyZW50KSksdGhpcy5vcHRpb25zLnRvZ2dsZSYmdGhpcy50b2dnbGUoKX07dC5wcm90b3R5cGU9e2NvbnN0cnVjdG9yOnQsZGltZW5zaW9uOmZ1bmN0aW9uKCl7dmFyIGU9dGhpcy4kZWxlbWVudC5oYXNDbGFzcyhcIndpZHRoXCIpO3JldHVybiBlP1wid2lkdGhcIjpcImhlaWdodFwifSxzaG93OmZ1bmN0aW9uKCl7dmFyIHQsbixyLGk7aWYodGhpcy50cmFuc2l0aW9uaW5nfHx0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKFwiaW5cIikpcmV0dXJuO3Q9dGhpcy5kaW1lbnNpb24oKSxuPWUuY2FtZWxDYXNlKFtcInNjcm9sbFwiLHRdLmpvaW4oXCItXCIpKSxyPXRoaXMuJHBhcmVudCYmdGhpcy4kcGFyZW50LmZpbmQoXCI+IC5hY2NvcmRpb24tZ3JvdXAgPiAuaW5cIik7aWYociYmci5sZW5ndGgpe2k9ci5kYXRhKFwiY29sbGFwc2VcIik7aWYoaSYmaS50cmFuc2l0aW9uaW5nKXJldHVybjtyLmNvbGxhcHNlKFwiaGlkZVwiKSxpfHxyLmRhdGEoXCJjb2xsYXBzZVwiLG51bGwpfXRoaXMuJGVsZW1lbnRbdF0oMCksdGhpcy50cmFuc2l0aW9uKFwiYWRkQ2xhc3NcIixlLkV2ZW50KFwic2hvd1wiKSxcInNob3duXCIpLGUuc3VwcG9ydC50cmFuc2l0aW9uJiZ0aGlzLiRlbGVtZW50W3RdKHRoaXMuJGVsZW1lbnRbMF1bbl0pfSxoaWRlOmZ1bmN0aW9uKCl7dmFyIHQ7aWYodGhpcy50cmFuc2l0aW9uaW5nfHwhdGhpcy4kZWxlbWVudC5oYXNDbGFzcyhcImluXCIpKXJldHVybjt0PXRoaXMuZGltZW5zaW9uKCksdGhpcy5yZXNldCh0aGlzLiRlbGVtZW50W3RdKCkpLHRoaXMudHJhbnNpdGlvbihcInJlbW92ZUNsYXNzXCIsZS5FdmVudChcImhpZGVcIiksXCJoaWRkZW5cIiksdGhpcy4kZWxlbWVudFt0XSgwKX0scmVzZXQ6ZnVuY3Rpb24oZSl7dmFyIHQ9dGhpcy5kaW1lbnNpb24oKTtyZXR1cm4gdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyhcImNvbGxhcHNlXCIpW3RdKGV8fFwiYXV0b1wiKVswXS5vZmZzZXRXaWR0aCx0aGlzLiRlbGVtZW50W2UhPT1udWxsP1wiYWRkQ2xhc3NcIjpcInJlbW92ZUNsYXNzXCJdKFwiY29sbGFwc2VcIiksdGhpc30sdHJhbnNpdGlvbjpmdW5jdGlvbih0LG4scil7dmFyIGk9dGhpcyxzPWZ1bmN0aW9uKCl7bi50eXBlPT1cInNob3dcIiYmaS5yZXNldCgpLGkudHJhbnNpdGlvbmluZz0wLGkuJGVsZW1lbnQudHJpZ2dlcihyKX07dGhpcy4kZWxlbWVudC50cmlnZ2VyKG4pO2lmKG4uaXNEZWZhdWx0UHJldmVudGVkKCkpcmV0dXJuO3RoaXMudHJhbnNpdGlvbmluZz0xLHRoaXMuJGVsZW1lbnRbdF0oXCJpblwiKSxlLnN1cHBvcnQudHJhbnNpdGlvbiYmdGhpcy4kZWxlbWVudC5oYXNDbGFzcyhcImNvbGxhcHNlXCIpP3RoaXMuJGVsZW1lbnQub25lKGUuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCxzKTpzKCl9LHRvZ2dsZTpmdW5jdGlvbigpe3RoaXNbdGhpcy4kZWxlbWVudC5oYXNDbGFzcyhcImluXCIpP1wiaGlkZVwiOlwic2hvd1wiXSgpfX07dmFyIG49ZS5mbi5jb2xsYXBzZTtlLmZuLmNvbGxhcHNlPWZ1bmN0aW9uKG4pe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgcj1lKHRoaXMpLGk9ci5kYXRhKFwiY29sbGFwc2VcIikscz1lLmV4dGVuZCh7fSxlLmZuLmNvbGxhcHNlLmRlZmF1bHRzLHIuZGF0YSgpLHR5cGVvZiBuPT1cIm9iamVjdFwiJiZuKTtpfHxyLmRhdGEoXCJjb2xsYXBzZVwiLGk9bmV3IHQodGhpcyxzKSksdHlwZW9mIG49PVwic3RyaW5nXCImJmlbbl0oKX0pfSxlLmZuLmNvbGxhcHNlLmRlZmF1bHRzPXt0b2dnbGU6ITB9LGUuZm4uY29sbGFwc2UuQ29uc3RydWN0b3I9dCxlLmZuLmNvbGxhcHNlLm5vQ29uZmxpY3Q9ZnVuY3Rpb24oKXtyZXR1cm4gZS5mbi5jb2xsYXBzZT1uLHRoaXN9LGUoZG9jdW1lbnQpLm9uKFwiY2xpY2suY29sbGFwc2UuZGF0YS1hcGlcIixcIltkYXRhLXRvZ2dsZT1jb2xsYXBzZV1cIixmdW5jdGlvbih0KXt2YXIgbj1lKHRoaXMpLHIsaT1uLmF0dHIoXCJkYXRhLXRhcmdldFwiKXx8dC5wcmV2ZW50RGVmYXVsdCgpfHwocj1uLmF0dHIoXCJocmVmXCIpKSYmci5yZXBsYWNlKC8uKig/PSNbXlxcc10rJCkvLFwiXCIpLHM9ZShpKS5kYXRhKFwiY29sbGFwc2VcIik/XCJ0b2dnbGVcIjpuLmRhdGEoKTtuW2UoaSkuaGFzQ2xhc3MoXCJpblwiKT9cImFkZENsYXNzXCI6XCJyZW1vdmVDbGFzc1wiXShcImNvbGxhcHNlZFwiKSxlKGkpLmNvbGxhcHNlKHMpfSl9KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKCl7ZSh0KS5lYWNoKGZ1bmN0aW9uKCl7aShlKHRoaXMpKS5yZW1vdmVDbGFzcyhcIm9wZW5cIil9KX1mdW5jdGlvbiBpKHQpe3ZhciBuPXQuYXR0cihcImRhdGEtdGFyZ2V0XCIpLHI7bnx8KG49dC5hdHRyKFwiaHJlZlwiKSxuPW4mJi8jLy50ZXN0KG4pJiZuLnJlcGxhY2UoLy4qKD89I1teXFxzXSokKS8sXCJcIikpLHI9biYmZShuKTtpZighcnx8IXIubGVuZ3RoKXI9dC5wYXJlbnQoKTtyZXR1cm4gcn12YXIgdD1cIltkYXRhLXRvZ2dsZT1kcm9wZG93bl1cIixuPWZ1bmN0aW9uKHQpe3ZhciBuPWUodCkub24oXCJjbGljay5kcm9wZG93bi5kYXRhLWFwaVwiLHRoaXMudG9nZ2xlKTtlKFwiaHRtbFwiKS5vbihcImNsaWNrLmRyb3Bkb3duLmRhdGEtYXBpXCIsZnVuY3Rpb24oKXtuLnBhcmVudCgpLnJlbW92ZUNsYXNzKFwib3BlblwiKX0pfTtuLnByb3RvdHlwZT17Y29uc3RydWN0b3I6bix0b2dnbGU6ZnVuY3Rpb24odCl7dmFyIG49ZSh0aGlzKSxzLG87aWYobi5pcyhcIi5kaXNhYmxlZCwgOmRpc2FibGVkXCIpKXJldHVybjtyZXR1cm4gcz1pKG4pLG89cy5oYXNDbGFzcyhcIm9wZW5cIikscigpLG98fHMudG9nZ2xlQ2xhc3MoXCJvcGVuXCIpLG4uZm9jdXMoKSwhMX0sa2V5ZG93bjpmdW5jdGlvbihuKXt2YXIgcixzLG8sdSxhLGY7aWYoIS8oMzh8NDB8MjcpLy50ZXN0KG4ua2V5Q29kZSkpcmV0dXJuO3I9ZSh0aGlzKSxuLnByZXZlbnREZWZhdWx0KCksbi5zdG9wUHJvcGFnYXRpb24oKTtpZihyLmlzKFwiLmRpc2FibGVkLCA6ZGlzYWJsZWRcIikpcmV0dXJuO3U9aShyKSxhPXUuaGFzQ2xhc3MoXCJvcGVuXCIpO2lmKCFhfHxhJiZuLmtleUNvZGU9PTI3KXJldHVybiBuLndoaWNoPT0yNyYmdS5maW5kKHQpLmZvY3VzKCksci5jbGljaygpO3M9ZShcIltyb2xlPW1lbnVdIGxpOm5vdCguZGl2aWRlcik6dmlzaWJsZSBhXCIsdSk7aWYoIXMubGVuZ3RoKXJldHVybjtmPXMuaW5kZXgocy5maWx0ZXIoXCI6Zm9jdXNcIikpLG4ua2V5Q29kZT09MzgmJmY+MCYmZi0tLG4ua2V5Q29kZT09NDAmJmY8cy5sZW5ndGgtMSYmZisrLH5mfHwoZj0wKSxzLmVxKGYpLmZvY3VzKCl9fTt2YXIgcz1lLmZuLmRyb3Bkb3duO2UuZm4uZHJvcGRvd249ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciByPWUodGhpcyksaT1yLmRhdGEoXCJkcm9wZG93blwiKTtpfHxyLmRhdGEoXCJkcm9wZG93blwiLGk9bmV3IG4odGhpcykpLHR5cGVvZiB0PT1cInN0cmluZ1wiJiZpW3RdLmNhbGwocil9KX0sZS5mbi5kcm9wZG93bi5Db25zdHJ1Y3Rvcj1uLGUuZm4uZHJvcGRvd24ubm9Db25mbGljdD1mdW5jdGlvbigpe3JldHVybiBlLmZuLmRyb3Bkb3duPXMsdGhpc30sZShkb2N1bWVudCkub24oXCJjbGljay5kcm9wZG93bi5kYXRhLWFwaVwiLHIpLm9uKFwiY2xpY2suZHJvcGRvd24uZGF0YS1hcGlcIixcIi5kcm9wZG93biBmb3JtXCIsZnVuY3Rpb24oZSl7ZS5zdG9wUHJvcGFnYXRpb24oKX0pLm9uKFwiY2xpY2suZHJvcGRvd24tbWVudVwiLGZ1bmN0aW9uKGUpe2Uuc3RvcFByb3BhZ2F0aW9uKCl9KS5vbihcImNsaWNrLmRyb3Bkb3duLmRhdGEtYXBpXCIsdCxuLnByb3RvdHlwZS50b2dnbGUpLm9uKFwia2V5ZG93bi5kcm9wZG93bi5kYXRhLWFwaVwiLHQrXCIsIFtyb2xlPW1lbnVdXCIsbi5wcm90b3R5cGUua2V5ZG93bil9KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjt2YXIgdD1mdW5jdGlvbih0LG4pe3RoaXMub3B0aW9ucz1uLHRoaXMuJGVsZW1lbnQ9ZSh0KS5kZWxlZ2F0ZSgnW2RhdGEtZGlzbWlzcz1cIm1vZGFsXCJdJyxcImNsaWNrLmRpc21pc3MubW9kYWxcIixlLnByb3h5KHRoaXMuaGlkZSx0aGlzKSksdGhpcy5vcHRpb25zLnJlbW90ZSYmdGhpcy4kZWxlbWVudC5maW5kKFwiLm1vZGFsLWJvZHlcIikubG9hZCh0aGlzLm9wdGlvbnMucmVtb3RlKX07dC5wcm90b3R5cGU9e2NvbnN0cnVjdG9yOnQsdG9nZ2xlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXNbdGhpcy5pc1Nob3duP1wiaGlkZVwiOlwic2hvd1wiXSgpfSxzaG93OmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcyxuPWUuRXZlbnQoXCJzaG93XCIpO3RoaXMuJGVsZW1lbnQudHJpZ2dlcihuKTtpZih0aGlzLmlzU2hvd258fG4uaXNEZWZhdWx0UHJldmVudGVkKCkpcmV0dXJuO3RoaXMuaXNTaG93bj0hMCx0aGlzLmVzY2FwZSgpLHRoaXMuYmFja2Ryb3AoZnVuY3Rpb24oKXt2YXIgbj1lLnN1cHBvcnQudHJhbnNpdGlvbiYmdC4kZWxlbWVudC5oYXNDbGFzcyhcImZhZGVcIik7dC4kZWxlbWVudC5wYXJlbnQoKS5sZW5ndGh8fHQuJGVsZW1lbnQuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSksdC4kZWxlbWVudC5zaG93KCksbiYmdC4kZWxlbWVudFswXS5vZmZzZXRXaWR0aCx0LiRlbGVtZW50LmFkZENsYXNzKFwiaW5cIikuYXR0cihcImFyaWEtaGlkZGVuXCIsITEpLHQuZW5mb3JjZUZvY3VzKCksbj90LiRlbGVtZW50Lm9uZShlLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsZnVuY3Rpb24oKXt0LiRlbGVtZW50LmZvY3VzKCkudHJpZ2dlcihcInNob3duXCIpfSk6dC4kZWxlbWVudC5mb2N1cygpLnRyaWdnZXIoXCJzaG93blwiKX0pfSxoaWRlOmZ1bmN0aW9uKHQpe3QmJnQucHJldmVudERlZmF1bHQoKTt2YXIgbj10aGlzO3Q9ZS5FdmVudChcImhpZGVcIiksdGhpcy4kZWxlbWVudC50cmlnZ2VyKHQpO2lmKCF0aGlzLmlzU2hvd258fHQuaXNEZWZhdWx0UHJldmVudGVkKCkpcmV0dXJuO3RoaXMuaXNTaG93bj0hMSx0aGlzLmVzY2FwZSgpLGUoZG9jdW1lbnQpLm9mZihcImZvY3VzaW4ubW9kYWxcIiksdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyhcImluXCIpLmF0dHIoXCJhcmlhLWhpZGRlblwiLCEwKSxlLnN1cHBvcnQudHJhbnNpdGlvbiYmdGhpcy4kZWxlbWVudC5oYXNDbGFzcyhcImZhZGVcIik/dGhpcy5oaWRlV2l0aFRyYW5zaXRpb24oKTp0aGlzLmhpZGVNb2RhbCgpfSxlbmZvcmNlRm9jdXM6ZnVuY3Rpb24oKXt2YXIgdD10aGlzO2UoZG9jdW1lbnQpLm9uKFwiZm9jdXNpbi5tb2RhbFwiLGZ1bmN0aW9uKGUpe3QuJGVsZW1lbnRbMF0hPT1lLnRhcmdldCYmIXQuJGVsZW1lbnQuaGFzKGUudGFyZ2V0KS5sZW5ndGgmJnQuJGVsZW1lbnQuZm9jdXMoKX0pfSxlc2NhcGU6ZnVuY3Rpb24oKXt2YXIgZT10aGlzO3RoaXMuaXNTaG93biYmdGhpcy5vcHRpb25zLmtleWJvYXJkP3RoaXMuJGVsZW1lbnQub24oXCJrZXl1cC5kaXNtaXNzLm1vZGFsXCIsZnVuY3Rpb24odCl7dC53aGljaD09MjcmJmUuaGlkZSgpfSk6dGhpcy5pc1Nob3dufHx0aGlzLiRlbGVtZW50Lm9mZihcImtleXVwLmRpc21pc3MubW9kYWxcIil9LGhpZGVXaXRoVHJhbnNpdGlvbjpmdW5jdGlvbigpe3ZhciB0PXRoaXMsbj1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dC4kZWxlbWVudC5vZmYoZS5zdXBwb3J0LnRyYW5zaXRpb24uZW5kKSx0LmhpZGVNb2RhbCgpfSw1MDApO3RoaXMuJGVsZW1lbnQub25lKGUuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCxmdW5jdGlvbigpe2NsZWFyVGltZW91dChuKSx0LmhpZGVNb2RhbCgpfSl9LGhpZGVNb2RhbDpmdW5jdGlvbigpe3ZhciBlPXRoaXM7dGhpcy4kZWxlbWVudC5oaWRlKCksdGhpcy5iYWNrZHJvcChmdW5jdGlvbigpe2UucmVtb3ZlQmFja2Ryb3AoKSxlLiRlbGVtZW50LnRyaWdnZXIoXCJoaWRkZW5cIil9KX0scmVtb3ZlQmFja2Ryb3A6ZnVuY3Rpb24oKXt0aGlzLiRiYWNrZHJvcCYmdGhpcy4kYmFja2Ryb3AucmVtb3ZlKCksdGhpcy4kYmFja2Ryb3A9bnVsbH0sYmFja2Ryb3A6ZnVuY3Rpb24odCl7dmFyIG49dGhpcyxyPXRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoXCJmYWRlXCIpP1wiZmFkZVwiOlwiXCI7aWYodGhpcy5pc1Nob3duJiZ0aGlzLm9wdGlvbnMuYmFja2Ryb3Ape3ZhciBpPWUuc3VwcG9ydC50cmFuc2l0aW9uJiZyO3RoaXMuJGJhY2tkcm9wPWUoJzxkaXYgY2xhc3M9XCJtb2RhbC1iYWNrZHJvcCAnK3IrJ1wiIC8+JykuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSksdGhpcy4kYmFja2Ryb3AuY2xpY2sodGhpcy5vcHRpb25zLmJhY2tkcm9wPT1cInN0YXRpY1wiP2UucHJveHkodGhpcy4kZWxlbWVudFswXS5mb2N1cyx0aGlzLiRlbGVtZW50WzBdKTplLnByb3h5KHRoaXMuaGlkZSx0aGlzKSksaSYmdGhpcy4kYmFja2Ryb3BbMF0ub2Zmc2V0V2lkdGgsdGhpcy4kYmFja2Ryb3AuYWRkQ2xhc3MoXCJpblwiKTtpZighdClyZXR1cm47aT90aGlzLiRiYWNrZHJvcC5vbmUoZS5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLHQpOnQoKX1lbHNlIXRoaXMuaXNTaG93biYmdGhpcy4kYmFja2Ryb3A/KHRoaXMuJGJhY2tkcm9wLnJlbW92ZUNsYXNzKFwiaW5cIiksZS5zdXBwb3J0LnRyYW5zaXRpb24mJnRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoXCJmYWRlXCIpP3RoaXMuJGJhY2tkcm9wLm9uZShlLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsdCk6dCgpKTp0JiZ0KCl9fTt2YXIgbj1lLmZuLm1vZGFsO2UuZm4ubW9kYWw9ZnVuY3Rpb24obil7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciByPWUodGhpcyksaT1yLmRhdGEoXCJtb2RhbFwiKSxzPWUuZXh0ZW5kKHt9LGUuZm4ubW9kYWwuZGVmYXVsdHMsci5kYXRhKCksdHlwZW9mIG49PVwib2JqZWN0XCImJm4pO2l8fHIuZGF0YShcIm1vZGFsXCIsaT1uZXcgdCh0aGlzLHMpKSx0eXBlb2Ygbj09XCJzdHJpbmdcIj9pW25dKCk6cy5zaG93JiZpLnNob3coKX0pfSxlLmZuLm1vZGFsLmRlZmF1bHRzPXtiYWNrZHJvcDohMCxrZXlib2FyZDohMCxzaG93OiEwfSxlLmZuLm1vZGFsLkNvbnN0cnVjdG9yPXQsZS5mbi5tb2RhbC5ub0NvbmZsaWN0PWZ1bmN0aW9uKCl7cmV0dXJuIGUuZm4ubW9kYWw9bix0aGlzfSxlKGRvY3VtZW50KS5vbihcImNsaWNrLm1vZGFsLmRhdGEtYXBpXCIsJ1tkYXRhLXRvZ2dsZT1cIm1vZGFsXCJdJyxmdW5jdGlvbih0KXt2YXIgbj1lKHRoaXMpLHI9bi5hdHRyKFwiaHJlZlwiKSxpPWUobi5hdHRyKFwiZGF0YS10YXJnZXRcIil8fHImJnIucmVwbGFjZSgvLiooPz0jW15cXHNdKyQpLyxcIlwiKSkscz1pLmRhdGEoXCJtb2RhbFwiKT9cInRvZ2dsZVwiOmUuZXh0ZW5kKHtyZW1vdGU6IS8jLy50ZXN0KHIpJiZyfSxpLmRhdGEoKSxuLmRhdGEoKSk7dC5wcmV2ZW50RGVmYXVsdCgpLGkubW9kYWwocykub25lKFwiaGlkZVwiLGZ1bmN0aW9uKCl7bi5mb2N1cygpfSl9KX0od2luZG93LmpRdWVyeSksIWZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO3ZhciB0PWZ1bmN0aW9uKGUsdCl7dGhpcy5pbml0KFwidG9vbHRpcFwiLGUsdCl9O3QucHJvdG90eXBlPXtjb25zdHJ1Y3Rvcjp0LGluaXQ6ZnVuY3Rpb24odCxuLHIpe3ZhciBpLHMsbyx1LGE7dGhpcy50eXBlPXQsdGhpcy4kZWxlbWVudD1lKG4pLHRoaXMub3B0aW9ucz10aGlzLmdldE9wdGlvbnMociksdGhpcy5lbmFibGVkPSEwLG89dGhpcy5vcHRpb25zLnRyaWdnZXIuc3BsaXQoXCIgXCIpO2ZvcihhPW8ubGVuZ3RoO2EtLTspdT1vW2FdLHU9PVwiY2xpY2tcIj90aGlzLiRlbGVtZW50Lm9uKFwiY2xpY2suXCIrdGhpcy50eXBlLHRoaXMub3B0aW9ucy5zZWxlY3RvcixlLnByb3h5KHRoaXMudG9nZ2xlLHRoaXMpKTp1IT1cIm1hbnVhbFwiJiYoaT11PT1cImhvdmVyXCI/XCJtb3VzZWVudGVyXCI6XCJmb2N1c1wiLHM9dT09XCJob3ZlclwiP1wibW91c2VsZWF2ZVwiOlwiYmx1clwiLHRoaXMuJGVsZW1lbnQub24oaStcIi5cIit0aGlzLnR5cGUsdGhpcy5vcHRpb25zLnNlbGVjdG9yLGUucHJveHkodGhpcy5lbnRlcix0aGlzKSksdGhpcy4kZWxlbWVudC5vbihzK1wiLlwiK3RoaXMudHlwZSx0aGlzLm9wdGlvbnMuc2VsZWN0b3IsZS5wcm94eSh0aGlzLmxlYXZlLHRoaXMpKSk7dGhpcy5vcHRpb25zLnNlbGVjdG9yP3RoaXMuX29wdGlvbnM9ZS5leHRlbmQoe30sdGhpcy5vcHRpb25zLHt0cmlnZ2VyOlwibWFudWFsXCIsc2VsZWN0b3I6XCJcIn0pOnRoaXMuZml4VGl0bGUoKX0sZ2V0T3B0aW9uczpmdW5jdGlvbih0KXtyZXR1cm4gdD1lLmV4dGVuZCh7fSxlLmZuW3RoaXMudHlwZV0uZGVmYXVsdHMsdGhpcy4kZWxlbWVudC5kYXRhKCksdCksdC5kZWxheSYmdHlwZW9mIHQuZGVsYXk9PVwibnVtYmVyXCImJih0LmRlbGF5PXtzaG93OnQuZGVsYXksaGlkZTp0LmRlbGF5fSksdH0sZW50ZXI6ZnVuY3Rpb24odCl7dmFyIG49ZS5mblt0aGlzLnR5cGVdLmRlZmF1bHRzLHI9e30saTt0aGlzLl9vcHRpb25zJiZlLmVhY2godGhpcy5fb3B0aW9ucyxmdW5jdGlvbihlLHQpe25bZV0hPXQmJihyW2VdPXQpfSx0aGlzKSxpPWUodC5jdXJyZW50VGFyZ2V0KVt0aGlzLnR5cGVdKHIpLmRhdGEodGhpcy50eXBlKTtpZighaS5vcHRpb25zLmRlbGF5fHwhaS5vcHRpb25zLmRlbGF5LnNob3cpcmV0dXJuIGkuc2hvdygpO2NsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpLGkuaG92ZXJTdGF0ZT1cImluXCIsdGhpcy50aW1lb3V0PXNldFRpbWVvdXQoZnVuY3Rpb24oKXtpLmhvdmVyU3RhdGU9PVwiaW5cIiYmaS5zaG93KCl9LGkub3B0aW9ucy5kZWxheS5zaG93KX0sbGVhdmU6ZnVuY3Rpb24odCl7dmFyIG49ZSh0LmN1cnJlbnRUYXJnZXQpW3RoaXMudHlwZV0odGhpcy5fb3B0aW9ucykuZGF0YSh0aGlzLnR5cGUpO3RoaXMudGltZW91dCYmY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7aWYoIW4ub3B0aW9ucy5kZWxheXx8IW4ub3B0aW9ucy5kZWxheS5oaWRlKXJldHVybiBuLmhpZGUoKTtuLmhvdmVyU3RhdGU9XCJvdXRcIix0aGlzLnRpbWVvdXQ9c2V0VGltZW91dChmdW5jdGlvbigpe24uaG92ZXJTdGF0ZT09XCJvdXRcIiYmbi5oaWRlKCl9LG4ub3B0aW9ucy5kZWxheS5oaWRlKX0sc2hvdzpmdW5jdGlvbigpe3ZhciB0LG4scixpLHMsbyx1PWUuRXZlbnQoXCJzaG93XCIpO2lmKHRoaXMuaGFzQ29udGVudCgpJiZ0aGlzLmVuYWJsZWQpe3RoaXMuJGVsZW1lbnQudHJpZ2dlcih1KTtpZih1LmlzRGVmYXVsdFByZXZlbnRlZCgpKXJldHVybjt0PXRoaXMudGlwKCksdGhpcy5zZXRDb250ZW50KCksdGhpcy5vcHRpb25zLmFuaW1hdGlvbiYmdC5hZGRDbGFzcyhcImZhZGVcIikscz10eXBlb2YgdGhpcy5vcHRpb25zLnBsYWNlbWVudD09XCJmdW5jdGlvblwiP3RoaXMub3B0aW9ucy5wbGFjZW1lbnQuY2FsbCh0aGlzLHRbMF0sdGhpcy4kZWxlbWVudFswXSk6dGhpcy5vcHRpb25zLnBsYWNlbWVudCx0LmRldGFjaCgpLmNzcyh7dG9wOjAsbGVmdDowLGRpc3BsYXk6XCJibG9ja1wifSksdGhpcy5vcHRpb25zLmNvbnRhaW5lcj90LmFwcGVuZFRvKHRoaXMub3B0aW9ucy5jb250YWluZXIpOnQuaW5zZXJ0QWZ0ZXIodGhpcy4kZWxlbWVudCksbj10aGlzLmdldFBvc2l0aW9uKCkscj10WzBdLm9mZnNldFdpZHRoLGk9dFswXS5vZmZzZXRIZWlnaHQ7c3dpdGNoKHMpe2Nhc2VcImJvdHRvbVwiOm89e3RvcDpuLnRvcCtuLmhlaWdodCxsZWZ0Om4ubGVmdCtuLndpZHRoLzItci8yfTticmVhaztjYXNlXCJ0b3BcIjpvPXt0b3A6bi50b3AtaSxsZWZ0Om4ubGVmdCtuLndpZHRoLzItci8yfTticmVhaztjYXNlXCJsZWZ0XCI6bz17dG9wOm4udG9wK24uaGVpZ2h0LzItaS8yLGxlZnQ6bi5sZWZ0LXJ9O2JyZWFrO2Nhc2VcInJpZ2h0XCI6bz17dG9wOm4udG9wK24uaGVpZ2h0LzItaS8yLGxlZnQ6bi5sZWZ0K24ud2lkdGh9fXRoaXMuYXBwbHlQbGFjZW1lbnQobyxzKSx0aGlzLiRlbGVtZW50LnRyaWdnZXIoXCJzaG93blwiKX19LGFwcGx5UGxhY2VtZW50OmZ1bmN0aW9uKGUsdCl7dmFyIG49dGhpcy50aXAoKSxyPW5bMF0ub2Zmc2V0V2lkdGgsaT1uWzBdLm9mZnNldEhlaWdodCxzLG8sdSxhO24ub2Zmc2V0KGUpLmFkZENsYXNzKHQpLmFkZENsYXNzKFwiaW5cIikscz1uWzBdLm9mZnNldFdpZHRoLG89blswXS5vZmZzZXRIZWlnaHQsdD09XCJ0b3BcIiYmbyE9aSYmKGUudG9wPWUudG9wK2ktbyxhPSEwKSx0PT1cImJvdHRvbVwifHx0PT1cInRvcFwiPyh1PTAsZS5sZWZ0PDAmJih1PWUubGVmdCotMixlLmxlZnQ9MCxuLm9mZnNldChlKSxzPW5bMF0ub2Zmc2V0V2lkdGgsbz1uWzBdLm9mZnNldEhlaWdodCksdGhpcy5yZXBsYWNlQXJyb3codS1yK3MscyxcImxlZnRcIikpOnRoaXMucmVwbGFjZUFycm93KG8taSxvLFwidG9wXCIpLGEmJm4ub2Zmc2V0KGUpfSxyZXBsYWNlQXJyb3c6ZnVuY3Rpb24oZSx0LG4pe3RoaXMuYXJyb3coKS5jc3MobixlPzUwKigxLWUvdCkrXCIlXCI6XCJcIil9LHNldENvbnRlbnQ6ZnVuY3Rpb24oKXt2YXIgZT10aGlzLnRpcCgpLHQ9dGhpcy5nZXRUaXRsZSgpO2UuZmluZChcIi50b29sdGlwLWlubmVyXCIpW3RoaXMub3B0aW9ucy5odG1sP1wiaHRtbFwiOlwidGV4dFwiXSh0KSxlLnJlbW92ZUNsYXNzKFwiZmFkZSBpbiB0b3AgYm90dG9tIGxlZnQgcmlnaHRcIil9LGhpZGU6ZnVuY3Rpb24oKXtmdW5jdGlvbiBpKCl7dmFyIHQ9c2V0VGltZW91dChmdW5jdGlvbigpe24ub2ZmKGUuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCkuZGV0YWNoKCl9LDUwMCk7bi5vbmUoZS5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLGZ1bmN0aW9uKCl7Y2xlYXJUaW1lb3V0KHQpLG4uZGV0YWNoKCl9KX12YXIgdD10aGlzLG49dGhpcy50aXAoKSxyPWUuRXZlbnQoXCJoaWRlXCIpO3RoaXMuJGVsZW1lbnQudHJpZ2dlcihyKTtpZihyLmlzRGVmYXVsdFByZXZlbnRlZCgpKXJldHVybjtyZXR1cm4gbi5yZW1vdmVDbGFzcyhcImluXCIpLGUuc3VwcG9ydC50cmFuc2l0aW9uJiZ0aGlzLiR0aXAuaGFzQ2xhc3MoXCJmYWRlXCIpP2koKTpuLmRldGFjaCgpLHRoaXMuJGVsZW1lbnQudHJpZ2dlcihcImhpZGRlblwiKSx0aGlzfSxmaXhUaXRsZTpmdW5jdGlvbigpe3ZhciBlPXRoaXMuJGVsZW1lbnQ7KGUuYXR0cihcInRpdGxlXCIpfHx0eXBlb2YgZS5hdHRyKFwiZGF0YS1vcmlnaW5hbC10aXRsZVwiKSE9XCJzdHJpbmdcIikmJmUuYXR0cihcImRhdGEtb3JpZ2luYWwtdGl0bGVcIixlLmF0dHIoXCJ0aXRsZVwiKXx8XCJcIikuYXR0cihcInRpdGxlXCIsXCJcIil9LGhhc0NvbnRlbnQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5nZXRUaXRsZSgpfSxnZXRQb3NpdGlvbjpmdW5jdGlvbigpe3ZhciB0PXRoaXMuJGVsZW1lbnRbMF07cmV0dXJuIGUuZXh0ZW5kKHt9LHR5cGVvZiB0LmdldEJvdW5kaW5nQ2xpZW50UmVjdD09XCJmdW5jdGlvblwiP3QuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk6e3dpZHRoOnQub2Zmc2V0V2lkdGgsaGVpZ2h0OnQub2Zmc2V0SGVpZ2h0fSx0aGlzLiRlbGVtZW50Lm9mZnNldCgpKX0sZ2V0VGl0bGU6ZnVuY3Rpb24oKXt2YXIgZSx0PXRoaXMuJGVsZW1lbnQsbj10aGlzLm9wdGlvbnM7cmV0dXJuIGU9dC5hdHRyKFwiZGF0YS1vcmlnaW5hbC10aXRsZVwiKXx8KHR5cGVvZiBuLnRpdGxlPT1cImZ1bmN0aW9uXCI/bi50aXRsZS5jYWxsKHRbMF0pOm4udGl0bGUpLGV9LHRpcDpmdW5jdGlvbigpe3JldHVybiB0aGlzLiR0aXA9dGhpcy4kdGlwfHxlKHRoaXMub3B0aW9ucy50ZW1wbGF0ZSl9LGFycm93OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuJGFycm93PXRoaXMuJGFycm93fHx0aGlzLnRpcCgpLmZpbmQoXCIudG9vbHRpcC1hcnJvd1wiKX0sdmFsaWRhdGU6ZnVuY3Rpb24oKXt0aGlzLiRlbGVtZW50WzBdLnBhcmVudE5vZGV8fCh0aGlzLmhpZGUoKSx0aGlzLiRlbGVtZW50PW51bGwsdGhpcy5vcHRpb25zPW51bGwpfSxlbmFibGU6ZnVuY3Rpb24oKXt0aGlzLmVuYWJsZWQ9ITB9LGRpc2FibGU6ZnVuY3Rpb24oKXt0aGlzLmVuYWJsZWQ9ITF9LHRvZ2dsZUVuYWJsZWQ6ZnVuY3Rpb24oKXt0aGlzLmVuYWJsZWQ9IXRoaXMuZW5hYmxlZH0sdG9nZ2xlOmZ1bmN0aW9uKHQpe3ZhciBuPXQ/ZSh0LmN1cnJlbnRUYXJnZXQpW3RoaXMudHlwZV0odGhpcy5fb3B0aW9ucykuZGF0YSh0aGlzLnR5cGUpOnRoaXM7bi50aXAoKS5oYXNDbGFzcyhcImluXCIpP24uaGlkZSgpOm4uc2hvdygpfSxkZXN0cm95OmZ1bmN0aW9uKCl7dGhpcy5oaWRlKCkuJGVsZW1lbnQub2ZmKFwiLlwiK3RoaXMudHlwZSkucmVtb3ZlRGF0YSh0aGlzLnR5cGUpfX07dmFyIG49ZS5mbi50b29sdGlwO2UuZm4udG9vbHRpcD1mdW5jdGlvbihuKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHI9ZSh0aGlzKSxpPXIuZGF0YShcInRvb2x0aXBcIikscz10eXBlb2Ygbj09XCJvYmplY3RcIiYmbjtpfHxyLmRhdGEoXCJ0b29sdGlwXCIsaT1uZXcgdCh0aGlzLHMpKSx0eXBlb2Ygbj09XCJzdHJpbmdcIiYmaVtuXSgpfSl9LGUuZm4udG9vbHRpcC5Db25zdHJ1Y3Rvcj10LGUuZm4udG9vbHRpcC5kZWZhdWx0cz17YW5pbWF0aW9uOiEwLHBsYWNlbWVudDpcInRvcFwiLHNlbGVjdG9yOiExLHRlbXBsYXRlOic8ZGl2IGNsYXNzPVwidG9vbHRpcFwiPjxkaXYgY2xhc3M9XCJ0b29sdGlwLWFycm93XCI+PC9kaXY+PGRpdiBjbGFzcz1cInRvb2x0aXAtaW5uZXJcIj48L2Rpdj48L2Rpdj4nLHRyaWdnZXI6XCJob3ZlciBmb2N1c1wiLHRpdGxlOlwiXCIsZGVsYXk6MCxodG1sOiExLGNvbnRhaW5lcjohMX0sZS5mbi50b29sdGlwLm5vQ29uZmxpY3Q9ZnVuY3Rpb24oKXtyZXR1cm4gZS5mbi50b29sdGlwPW4sdGhpc319KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjt2YXIgdD1mdW5jdGlvbihlLHQpe3RoaXMuaW5pdChcInBvcG92ZXJcIixlLHQpfTt0LnByb3RvdHlwZT1lLmV4dGVuZCh7fSxlLmZuLnRvb2x0aXAuQ29uc3RydWN0b3IucHJvdG90eXBlLHtjb25zdHJ1Y3Rvcjp0LHNldENvbnRlbnQ6ZnVuY3Rpb24oKXt2YXIgZT10aGlzLnRpcCgpLHQ9dGhpcy5nZXRUaXRsZSgpLG49dGhpcy5nZXRDb250ZW50KCk7ZS5maW5kKFwiLnBvcG92ZXItdGl0bGVcIilbdGhpcy5vcHRpb25zLmh0bWw/XCJodG1sXCI6XCJ0ZXh0XCJdKHQpLGUuZmluZChcIi5wb3BvdmVyLWNvbnRlbnRcIilbdGhpcy5vcHRpb25zLmh0bWw/XCJodG1sXCI6XCJ0ZXh0XCJdKG4pLGUucmVtb3ZlQ2xhc3MoXCJmYWRlIHRvcCBib3R0b20gbGVmdCByaWdodCBpblwiKX0saGFzQ29udGVudDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmdldFRpdGxlKCl8fHRoaXMuZ2V0Q29udGVudCgpfSxnZXRDb250ZW50OmZ1bmN0aW9uKCl7dmFyIGUsdD10aGlzLiRlbGVtZW50LG49dGhpcy5vcHRpb25zO3JldHVybiBlPSh0eXBlb2Ygbi5jb250ZW50PT1cImZ1bmN0aW9uXCI/bi5jb250ZW50LmNhbGwodFswXSk6bi5jb250ZW50KXx8dC5hdHRyKFwiZGF0YS1jb250ZW50XCIpLGV9LHRpcDpmdW5jdGlvbigpe3JldHVybiB0aGlzLiR0aXB8fCh0aGlzLiR0aXA9ZSh0aGlzLm9wdGlvbnMudGVtcGxhdGUpKSx0aGlzLiR0aXB9LGRlc3Ryb3k6ZnVuY3Rpb24oKXt0aGlzLmhpZGUoKS4kZWxlbWVudC5vZmYoXCIuXCIrdGhpcy50eXBlKS5yZW1vdmVEYXRhKHRoaXMudHlwZSl9fSk7dmFyIG49ZS5mbi5wb3BvdmVyO2UuZm4ucG9wb3Zlcj1mdW5jdGlvbihuKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHI9ZSh0aGlzKSxpPXIuZGF0YShcInBvcG92ZXJcIikscz10eXBlb2Ygbj09XCJvYmplY3RcIiYmbjtpfHxyLmRhdGEoXCJwb3BvdmVyXCIsaT1uZXcgdCh0aGlzLHMpKSx0eXBlb2Ygbj09XCJzdHJpbmdcIiYmaVtuXSgpfSl9LGUuZm4ucG9wb3Zlci5Db25zdHJ1Y3Rvcj10LGUuZm4ucG9wb3Zlci5kZWZhdWx0cz1lLmV4dGVuZCh7fSxlLmZuLnRvb2x0aXAuZGVmYXVsdHMse3BsYWNlbWVudDpcInJpZ2h0XCIsdHJpZ2dlcjpcImNsaWNrXCIsY29udGVudDpcIlwiLHRlbXBsYXRlOic8ZGl2IGNsYXNzPVwicG9wb3ZlclwiPjxkaXYgY2xhc3M9XCJhcnJvd1wiPjwvZGl2PjxoMyBjbGFzcz1cInBvcG92ZXItdGl0bGVcIj48L2gzPjxkaXYgY2xhc3M9XCJwb3BvdmVyLWNvbnRlbnRcIj48L2Rpdj48L2Rpdj4nfSksZS5mbi5wb3BvdmVyLm5vQ29uZmxpY3Q9ZnVuY3Rpb24oKXtyZXR1cm4gZS5mbi5wb3BvdmVyPW4sdGhpc319KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiB0KHQsbil7dmFyIHI9ZS5wcm94eSh0aGlzLnByb2Nlc3MsdGhpcyksaT1lKHQpLmlzKFwiYm9keVwiKT9lKHdpbmRvdyk6ZSh0KSxzO3RoaXMub3B0aW9ucz1lLmV4dGVuZCh7fSxlLmZuLnNjcm9sbHNweS5kZWZhdWx0cyxuKSx0aGlzLiRzY3JvbGxFbGVtZW50PWkub24oXCJzY3JvbGwuc2Nyb2xsLXNweS5kYXRhLWFwaVwiLHIpLHRoaXMuc2VsZWN0b3I9KHRoaXMub3B0aW9ucy50YXJnZXR8fChzPWUodCkuYXR0cihcImhyZWZcIikpJiZzLnJlcGxhY2UoLy4qKD89I1teXFxzXSskKS8sXCJcIil8fFwiXCIpK1wiIC5uYXYgbGkgPiBhXCIsdGhpcy4kYm9keT1lKFwiYm9keVwiKSx0aGlzLnJlZnJlc2goKSx0aGlzLnByb2Nlc3MoKX10LnByb3RvdHlwZT17Y29uc3RydWN0b3I6dCxyZWZyZXNoOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcyxuO3RoaXMub2Zmc2V0cz1lKFtdKSx0aGlzLnRhcmdldHM9ZShbXSksbj10aGlzLiRib2R5LmZpbmQodGhpcy5zZWxlY3RvcikubWFwKGZ1bmN0aW9uKCl7dmFyIG49ZSh0aGlzKSxyPW4uZGF0YShcInRhcmdldFwiKXx8bi5hdHRyKFwiaHJlZlwiKSxpPS9eI1xcdy8udGVzdChyKSYmZShyKTtyZXR1cm4gaSYmaS5sZW5ndGgmJltbaS5wb3NpdGlvbigpLnRvcCsoIWUuaXNXaW5kb3codC4kc2Nyb2xsRWxlbWVudC5nZXQoMCkpJiZ0LiRzY3JvbGxFbGVtZW50LnNjcm9sbFRvcCgpKSxyXV18fG51bGx9KS5zb3J0KGZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF0tdFswXX0pLmVhY2goZnVuY3Rpb24oKXt0Lm9mZnNldHMucHVzaCh0aGlzWzBdKSx0LnRhcmdldHMucHVzaCh0aGlzWzFdKX0pfSxwcm9jZXNzOmZ1bmN0aW9uKCl7dmFyIGU9dGhpcy4kc2Nyb2xsRWxlbWVudC5zY3JvbGxUb3AoKSt0aGlzLm9wdGlvbnMub2Zmc2V0LHQ9dGhpcy4kc2Nyb2xsRWxlbWVudFswXS5zY3JvbGxIZWlnaHR8fHRoaXMuJGJvZHlbMF0uc2Nyb2xsSGVpZ2h0LG49dC10aGlzLiRzY3JvbGxFbGVtZW50LmhlaWdodCgpLHI9dGhpcy5vZmZzZXRzLGk9dGhpcy50YXJnZXRzLHM9dGhpcy5hY3RpdmVUYXJnZXQsbztpZihlPj1uKXJldHVybiBzIT0obz1pLmxhc3QoKVswXSkmJnRoaXMuYWN0aXZhdGUobyk7Zm9yKG89ci5sZW5ndGg7by0tOylzIT1pW29dJiZlPj1yW29dJiYoIXJbbysxXXx8ZTw9cltvKzFdKSYmdGhpcy5hY3RpdmF0ZShpW29dKX0sYWN0aXZhdGU6ZnVuY3Rpb24odCl7dmFyIG4scjt0aGlzLmFjdGl2ZVRhcmdldD10LGUodGhpcy5zZWxlY3RvcikucGFyZW50KFwiLmFjdGl2ZVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKSxyPXRoaXMuc2VsZWN0b3IrJ1tkYXRhLXRhcmdldD1cIicrdCsnXCJdLCcrdGhpcy5zZWxlY3RvcisnW2hyZWY9XCInK3QrJ1wiXScsbj1lKHIpLnBhcmVudChcImxpXCIpLmFkZENsYXNzKFwiYWN0aXZlXCIpLG4ucGFyZW50KFwiLmRyb3Bkb3duLW1lbnVcIikubGVuZ3RoJiYobj1uLmNsb3Nlc3QoXCJsaS5kcm9wZG93blwiKS5hZGRDbGFzcyhcImFjdGl2ZVwiKSksbi50cmlnZ2VyKFwiYWN0aXZhdGVcIil9fTt2YXIgbj1lLmZuLnNjcm9sbHNweTtlLmZuLnNjcm9sbHNweT1mdW5jdGlvbihuKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHI9ZSh0aGlzKSxpPXIuZGF0YShcInNjcm9sbHNweVwiKSxzPXR5cGVvZiBuPT1cIm9iamVjdFwiJiZuO2l8fHIuZGF0YShcInNjcm9sbHNweVwiLGk9bmV3IHQodGhpcyxzKSksdHlwZW9mIG49PVwic3RyaW5nXCImJmlbbl0oKX0pfSxlLmZuLnNjcm9sbHNweS5Db25zdHJ1Y3Rvcj10LGUuZm4uc2Nyb2xsc3B5LmRlZmF1bHRzPXtvZmZzZXQ6MTB9LGUuZm4uc2Nyb2xsc3B5Lm5vQ29uZmxpY3Q9ZnVuY3Rpb24oKXtyZXR1cm4gZS5mbi5zY3JvbGxzcHk9bix0aGlzfSxlKHdpbmRvdykub24oXCJsb2FkXCIsZnVuY3Rpb24oKXtlKCdbZGF0YS1zcHk9XCJzY3JvbGxcIl0nKS5lYWNoKGZ1bmN0aW9uKCl7dmFyIHQ9ZSh0aGlzKTt0LnNjcm9sbHNweSh0LmRhdGEoKSl9KX0pfSh3aW5kb3cualF1ZXJ5KSwhZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7dmFyIHQ9ZnVuY3Rpb24odCl7dGhpcy5lbGVtZW50PWUodCl9O3QucHJvdG90eXBlPXtjb25zdHJ1Y3Rvcjp0LHNob3c6ZnVuY3Rpb24oKXt2YXIgdD10aGlzLmVsZW1lbnQsbj10LmNsb3Nlc3QoXCJ1bDpub3QoLmRyb3Bkb3duLW1lbnUpXCIpLHI9dC5hdHRyKFwiZGF0YS10YXJnZXRcIiksaSxzLG87cnx8KHI9dC5hdHRyKFwiaHJlZlwiKSxyPXImJnIucmVwbGFjZSgvLiooPz0jW15cXHNdKiQpLyxcIlwiKSk7aWYodC5wYXJlbnQoXCJsaVwiKS5oYXNDbGFzcyhcImFjdGl2ZVwiKSlyZXR1cm47aT1uLmZpbmQoXCIuYWN0aXZlOmxhc3QgYVwiKVswXSxvPWUuRXZlbnQoXCJzaG93XCIse3JlbGF0ZWRUYXJnZXQ6aX0pLHQudHJpZ2dlcihvKTtpZihvLmlzRGVmYXVsdFByZXZlbnRlZCgpKXJldHVybjtzPWUociksdGhpcy5hY3RpdmF0ZSh0LnBhcmVudChcImxpXCIpLG4pLHRoaXMuYWN0aXZhdGUocyxzLnBhcmVudCgpLGZ1bmN0aW9uKCl7dC50cmlnZ2VyKHt0eXBlOlwic2hvd25cIixyZWxhdGVkVGFyZ2V0Oml9KX0pfSxhY3RpdmF0ZTpmdW5jdGlvbih0LG4scil7ZnVuY3Rpb24gbygpe2kucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIikuZmluZChcIj4gLmRyb3Bkb3duLW1lbnUgPiAuYWN0aXZlXCIpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLHQuYWRkQ2xhc3MoXCJhY3RpdmVcIikscz8odFswXS5vZmZzZXRXaWR0aCx0LmFkZENsYXNzKFwiaW5cIikpOnQucmVtb3ZlQ2xhc3MoXCJmYWRlXCIpLHQucGFyZW50KFwiLmRyb3Bkb3duLW1lbnVcIikmJnQuY2xvc2VzdChcImxpLmRyb3Bkb3duXCIpLmFkZENsYXNzKFwiYWN0aXZlXCIpLHImJnIoKX12YXIgaT1uLmZpbmQoXCI+IC5hY3RpdmVcIikscz1yJiZlLnN1cHBvcnQudHJhbnNpdGlvbiYmaS5oYXNDbGFzcyhcImZhZGVcIik7cz9pLm9uZShlLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsbyk6bygpLGkucmVtb3ZlQ2xhc3MoXCJpblwiKX19O3ZhciBuPWUuZm4udGFiO2UuZm4udGFiPWZ1bmN0aW9uKG4pe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgcj1lKHRoaXMpLGk9ci5kYXRhKFwidGFiXCIpO2l8fHIuZGF0YShcInRhYlwiLGk9bmV3IHQodGhpcykpLHR5cGVvZiBuPT1cInN0cmluZ1wiJiZpW25dKCl9KX0sZS5mbi50YWIuQ29uc3RydWN0b3I9dCxlLmZuLnRhYi5ub0NvbmZsaWN0PWZ1bmN0aW9uKCl7cmV0dXJuIGUuZm4udGFiPW4sdGhpc30sZShkb2N1bWVudCkub24oXCJjbGljay50YWIuZGF0YS1hcGlcIiwnW2RhdGEtdG9nZ2xlPVwidGFiXCJdLCBbZGF0YS10b2dnbGU9XCJwaWxsXCJdJyxmdW5jdGlvbih0KXt0LnByZXZlbnREZWZhdWx0KCksZSh0aGlzKS50YWIoXCJzaG93XCIpfSl9KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjt2YXIgdD1mdW5jdGlvbih0LG4pe3RoaXMuJGVsZW1lbnQ9ZSh0KSx0aGlzLm9wdGlvbnM9ZS5leHRlbmQoe30sZS5mbi50eXBlYWhlYWQuZGVmYXVsdHMsbiksdGhpcy5tYXRjaGVyPXRoaXMub3B0aW9ucy5tYXRjaGVyfHx0aGlzLm1hdGNoZXIsdGhpcy5zb3J0ZXI9dGhpcy5vcHRpb25zLnNvcnRlcnx8dGhpcy5zb3J0ZXIsdGhpcy5oaWdobGlnaHRlcj10aGlzLm9wdGlvbnMuaGlnaGxpZ2h0ZXJ8fHRoaXMuaGlnaGxpZ2h0ZXIsdGhpcy51cGRhdGVyPXRoaXMub3B0aW9ucy51cGRhdGVyfHx0aGlzLnVwZGF0ZXIsdGhpcy5zb3VyY2U9dGhpcy5vcHRpb25zLnNvdXJjZSx0aGlzLiRtZW51PWUodGhpcy5vcHRpb25zLm1lbnUpLHRoaXMuc2hvd249ITEsdGhpcy5saXN0ZW4oKX07dC5wcm90b3R5cGU9e2NvbnN0cnVjdG9yOnQsc2VsZWN0OmZ1bmN0aW9uKCl7dmFyIGU9dGhpcy4kbWVudS5maW5kKFwiLmFjdGl2ZVwiKS5hdHRyKFwiZGF0YS12YWx1ZVwiKTtyZXR1cm4gdGhpcy4kZWxlbWVudC52YWwodGhpcy51cGRhdGVyKGUpKS5jaGFuZ2UoKSx0aGlzLmhpZGUoKX0sdXBkYXRlcjpmdW5jdGlvbihlKXtyZXR1cm4gZX0sc2hvdzpmdW5jdGlvbigpe3ZhciB0PWUuZXh0ZW5kKHt9LHRoaXMuJGVsZW1lbnQucG9zaXRpb24oKSx7aGVpZ2h0OnRoaXMuJGVsZW1lbnRbMF0ub2Zmc2V0SGVpZ2h0fSk7cmV0dXJuIHRoaXMuJG1lbnUuaW5zZXJ0QWZ0ZXIodGhpcy4kZWxlbWVudCkuY3NzKHt0b3A6dC50b3ArdC5oZWlnaHQsbGVmdDp0LmxlZnR9KS5zaG93KCksdGhpcy5zaG93bj0hMCx0aGlzfSxoaWRlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuJG1lbnUuaGlkZSgpLHRoaXMuc2hvd249ITEsdGhpc30sbG9va3VwOmZ1bmN0aW9uKHQpe3ZhciBuO3JldHVybiB0aGlzLnF1ZXJ5PXRoaXMuJGVsZW1lbnQudmFsKCksIXRoaXMucXVlcnl8fHRoaXMucXVlcnkubGVuZ3RoPHRoaXMub3B0aW9ucy5taW5MZW5ndGg/dGhpcy5zaG93bj90aGlzLmhpZGUoKTp0aGlzOihuPWUuaXNGdW5jdGlvbih0aGlzLnNvdXJjZSk/dGhpcy5zb3VyY2UodGhpcy5xdWVyeSxlLnByb3h5KHRoaXMucHJvY2Vzcyx0aGlzKSk6dGhpcy5zb3VyY2Usbj90aGlzLnByb2Nlc3Mobik6dGhpcyl9LHByb2Nlc3M6ZnVuY3Rpb24odCl7dmFyIG49dGhpcztyZXR1cm4gdD1lLmdyZXAodCxmdW5jdGlvbihlKXtyZXR1cm4gbi5tYXRjaGVyKGUpfSksdD10aGlzLnNvcnRlcih0KSx0Lmxlbmd0aD90aGlzLnJlbmRlcih0LnNsaWNlKDAsdGhpcy5vcHRpb25zLml0ZW1zKSkuc2hvdygpOnRoaXMuc2hvd24/dGhpcy5oaWRlKCk6dGhpc30sbWF0Y2hlcjpmdW5jdGlvbihlKXtyZXR1cm5+ZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YodGhpcy5xdWVyeS50b0xvd2VyQ2FzZSgpKX0sc29ydGVyOmZ1bmN0aW9uKGUpe3ZhciB0PVtdLG49W10scj1bXSxpO3doaWxlKGk9ZS5zaGlmdCgpKWkudG9Mb3dlckNhc2UoKS5pbmRleE9mKHRoaXMucXVlcnkudG9Mb3dlckNhc2UoKSk/fmkuaW5kZXhPZih0aGlzLnF1ZXJ5KT9uLnB1c2goaSk6ci5wdXNoKGkpOnQucHVzaChpKTtyZXR1cm4gdC5jb25jYXQobixyKX0saGlnaGxpZ2h0ZXI6ZnVuY3Rpb24oZSl7dmFyIHQ9dGhpcy5xdWVyeS5yZXBsYWNlKC9bXFwtXFxbXFxde30oKSorPy4sXFxcXFxcXiR8I1xcc10vZyxcIlxcXFwkJlwiKTtyZXR1cm4gZS5yZXBsYWNlKG5ldyBSZWdFeHAoXCIoXCIrdCtcIilcIixcImlnXCIpLGZ1bmN0aW9uKGUsdCl7cmV0dXJuXCI8c3Ryb25nPlwiK3QrXCI8L3N0cm9uZz5cIn0pfSxyZW5kZXI6ZnVuY3Rpb24odCl7dmFyIG49dGhpcztyZXR1cm4gdD1lKHQpLm1hcChmdW5jdGlvbih0LHIpe3JldHVybiB0PWUobi5vcHRpb25zLml0ZW0pLmF0dHIoXCJkYXRhLXZhbHVlXCIsciksdC5maW5kKFwiYVwiKS5odG1sKG4uaGlnaGxpZ2h0ZXIocikpLHRbMF19KSx0LmZpcnN0KCkuYWRkQ2xhc3MoXCJhY3RpdmVcIiksdGhpcy4kbWVudS5odG1sKHQpLHRoaXN9LG5leHQ6ZnVuY3Rpb24odCl7dmFyIG49dGhpcy4kbWVudS5maW5kKFwiLmFjdGl2ZVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKSxyPW4ubmV4dCgpO3IubGVuZ3RofHwocj1lKHRoaXMuJG1lbnUuZmluZChcImxpXCIpWzBdKSksci5hZGRDbGFzcyhcImFjdGl2ZVwiKX0scHJldjpmdW5jdGlvbihlKXt2YXIgdD10aGlzLiRtZW51LmZpbmQoXCIuYWN0aXZlXCIpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLG49dC5wcmV2KCk7bi5sZW5ndGh8fChuPXRoaXMuJG1lbnUuZmluZChcImxpXCIpLmxhc3QoKSksbi5hZGRDbGFzcyhcImFjdGl2ZVwiKX0sbGlzdGVuOmZ1bmN0aW9uKCl7dGhpcy4kZWxlbWVudC5vbihcImZvY3VzXCIsZS5wcm94eSh0aGlzLmZvY3VzLHRoaXMpKS5vbihcImJsdXJcIixlLnByb3h5KHRoaXMuYmx1cix0aGlzKSkub24oXCJrZXlwcmVzc1wiLGUucHJveHkodGhpcy5rZXlwcmVzcyx0aGlzKSkub24oXCJrZXl1cFwiLGUucHJveHkodGhpcy5rZXl1cCx0aGlzKSksdGhpcy5ldmVudFN1cHBvcnRlZChcImtleWRvd25cIikmJnRoaXMuJGVsZW1lbnQub24oXCJrZXlkb3duXCIsZS5wcm94eSh0aGlzLmtleWRvd24sdGhpcykpLHRoaXMuJG1lbnUub24oXCJjbGlja1wiLGUucHJveHkodGhpcy5jbGljayx0aGlzKSkub24oXCJtb3VzZWVudGVyXCIsXCJsaVwiLGUucHJveHkodGhpcy5tb3VzZWVudGVyLHRoaXMpKS5vbihcIm1vdXNlbGVhdmVcIixcImxpXCIsZS5wcm94eSh0aGlzLm1vdXNlbGVhdmUsdGhpcykpfSxldmVudFN1cHBvcnRlZDpmdW5jdGlvbihlKXt2YXIgdD1lIGluIHRoaXMuJGVsZW1lbnQ7cmV0dXJuIHR8fCh0aGlzLiRlbGVtZW50LnNldEF0dHJpYnV0ZShlLFwicmV0dXJuO1wiKSx0PXR5cGVvZiB0aGlzLiRlbGVtZW50W2VdPT1cImZ1bmN0aW9uXCIpLHR9LG1vdmU6ZnVuY3Rpb24oZSl7aWYoIXRoaXMuc2hvd24pcmV0dXJuO3N3aXRjaChlLmtleUNvZGUpe2Nhc2UgOTpjYXNlIDEzOmNhc2UgMjc6ZS5wcmV2ZW50RGVmYXVsdCgpO2JyZWFrO2Nhc2UgMzg6ZS5wcmV2ZW50RGVmYXVsdCgpLHRoaXMucHJldigpO2JyZWFrO2Nhc2UgNDA6ZS5wcmV2ZW50RGVmYXVsdCgpLHRoaXMubmV4dCgpfWUuc3RvcFByb3BhZ2F0aW9uKCl9LGtleWRvd246ZnVuY3Rpb24odCl7dGhpcy5zdXBwcmVzc0tleVByZXNzUmVwZWF0PX5lLmluQXJyYXkodC5rZXlDb2RlLFs0MCwzOCw5LDEzLDI3XSksdGhpcy5tb3ZlKHQpfSxrZXlwcmVzczpmdW5jdGlvbihlKXtpZih0aGlzLnN1cHByZXNzS2V5UHJlc3NSZXBlYXQpcmV0dXJuO3RoaXMubW92ZShlKX0sa2V5dXA6ZnVuY3Rpb24oZSl7c3dpdGNoKGUua2V5Q29kZSl7Y2FzZSA0MDpjYXNlIDM4OmNhc2UgMTY6Y2FzZSAxNzpjYXNlIDE4OmJyZWFrO2Nhc2UgOTpjYXNlIDEzOmlmKCF0aGlzLnNob3duKXJldHVybjt0aGlzLnNlbGVjdCgpO2JyZWFrO2Nhc2UgMjc6aWYoIXRoaXMuc2hvd24pcmV0dXJuO3RoaXMuaGlkZSgpO2JyZWFrO2RlZmF1bHQ6dGhpcy5sb29rdXAoKX1lLnN0b3BQcm9wYWdhdGlvbigpLGUucHJldmVudERlZmF1bHQoKX0sZm9jdXM6ZnVuY3Rpb24oZSl7dGhpcy5mb2N1c2VkPSEwfSxibHVyOmZ1bmN0aW9uKGUpe3RoaXMuZm9jdXNlZD0hMSwhdGhpcy5tb3VzZWRvdmVyJiZ0aGlzLnNob3duJiZ0aGlzLmhpZGUoKX0sY2xpY2s6ZnVuY3Rpb24oZSl7ZS5zdG9wUHJvcGFnYXRpb24oKSxlLnByZXZlbnREZWZhdWx0KCksdGhpcy5zZWxlY3QoKSx0aGlzLiRlbGVtZW50LmZvY3VzKCl9LG1vdXNlZW50ZXI6ZnVuY3Rpb24odCl7dGhpcy5tb3VzZWRvdmVyPSEwLHRoaXMuJG1lbnUuZmluZChcIi5hY3RpdmVcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIiksZSh0LmN1cnJlbnRUYXJnZXQpLmFkZENsYXNzKFwiYWN0aXZlXCIpfSxtb3VzZWxlYXZlOmZ1bmN0aW9uKGUpe3RoaXMubW91c2Vkb3Zlcj0hMSwhdGhpcy5mb2N1c2VkJiZ0aGlzLnNob3duJiZ0aGlzLmhpZGUoKX19O3ZhciBuPWUuZm4udHlwZWFoZWFkO2UuZm4udHlwZWFoZWFkPWZ1bmN0aW9uKG4pe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgcj1lKHRoaXMpLGk9ci5kYXRhKFwidHlwZWFoZWFkXCIpLHM9dHlwZW9mIG49PVwib2JqZWN0XCImJm47aXx8ci5kYXRhKFwidHlwZWFoZWFkXCIsaT1uZXcgdCh0aGlzLHMpKSx0eXBlb2Ygbj09XCJzdHJpbmdcIiYmaVtuXSgpfSl9LGUuZm4udHlwZWFoZWFkLmRlZmF1bHRzPXtzb3VyY2U6W10saXRlbXM6OCxtZW51Oic8dWwgY2xhc3M9XCJ0eXBlYWhlYWQgZHJvcGRvd24tbWVudVwiPjwvdWw+JyxpdGVtOic8bGk+PGEgaHJlZj1cIiNcIj48L2E+PC9saT4nLG1pbkxlbmd0aDoxfSxlLmZuLnR5cGVhaGVhZC5Db25zdHJ1Y3Rvcj10LGUuZm4udHlwZWFoZWFkLm5vQ29uZmxpY3Q9ZnVuY3Rpb24oKXtyZXR1cm4gZS5mbi50eXBlYWhlYWQ9bix0aGlzfSxlKGRvY3VtZW50KS5vbihcImZvY3VzLnR5cGVhaGVhZC5kYXRhLWFwaVwiLCdbZGF0YS1wcm92aWRlPVwidHlwZWFoZWFkXCJdJyxmdW5jdGlvbih0KXt2YXIgbj1lKHRoaXMpO2lmKG4uZGF0YShcInR5cGVhaGVhZFwiKSlyZXR1cm47bi50eXBlYWhlYWQobi5kYXRhKCkpfSl9KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjt2YXIgdD1mdW5jdGlvbih0LG4pe3RoaXMub3B0aW9ucz1lLmV4dGVuZCh7fSxlLmZuLmFmZml4LmRlZmF1bHRzLG4pLHRoaXMuJHdpbmRvdz1lKHdpbmRvdykub24oXCJzY3JvbGwuYWZmaXguZGF0YS1hcGlcIixlLnByb3h5KHRoaXMuY2hlY2tQb3NpdGlvbix0aGlzKSkub24oXCJjbGljay5hZmZpeC5kYXRhLWFwaVwiLGUucHJveHkoZnVuY3Rpb24oKXtzZXRUaW1lb3V0KGUucHJveHkodGhpcy5jaGVja1Bvc2l0aW9uLHRoaXMpLDEpfSx0aGlzKSksdGhpcy4kZWxlbWVudD1lKHQpLHRoaXMuY2hlY2tQb3NpdGlvbigpfTt0LnByb3RvdHlwZS5jaGVja1Bvc2l0aW9uPWZ1bmN0aW9uKCl7aWYoIXRoaXMuJGVsZW1lbnQuaXMoXCI6dmlzaWJsZVwiKSlyZXR1cm47dmFyIHQ9ZShkb2N1bWVudCkuaGVpZ2h0KCksbj10aGlzLiR3aW5kb3cuc2Nyb2xsVG9wKCkscj10aGlzLiRlbGVtZW50Lm9mZnNldCgpLGk9dGhpcy5vcHRpb25zLm9mZnNldCxzPWkuYm90dG9tLG89aS50b3AsdT1cImFmZml4IGFmZml4LXRvcCBhZmZpeC1ib3R0b21cIixhO3R5cGVvZiBpIT1cIm9iamVjdFwiJiYocz1vPWkpLHR5cGVvZiBvPT1cImZ1bmN0aW9uXCImJihvPWkudG9wKCkpLHR5cGVvZiBzPT1cImZ1bmN0aW9uXCImJihzPWkuYm90dG9tKCkpLGE9dGhpcy51bnBpbiE9bnVsbCYmbit0aGlzLnVucGluPD1yLnRvcD8hMTpzIT1udWxsJiZyLnRvcCt0aGlzLiRlbGVtZW50LmhlaWdodCgpPj10LXM/XCJib3R0b21cIjpvIT1udWxsJiZuPD1vP1widG9wXCI6ITE7aWYodGhpcy5hZmZpeGVkPT09YSlyZXR1cm47dGhpcy5hZmZpeGVkPWEsdGhpcy51bnBpbj1hPT1cImJvdHRvbVwiP3IudG9wLW46bnVsbCx0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKHUpLmFkZENsYXNzKFwiYWZmaXhcIisoYT9cIi1cIithOlwiXCIpKX07dmFyIG49ZS5mbi5hZmZpeDtlLmZuLmFmZml4PWZ1bmN0aW9uKG4pe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgcj1lKHRoaXMpLGk9ci5kYXRhKFwiYWZmaXhcIikscz10eXBlb2Ygbj09XCJvYmplY3RcIiYmbjtpfHxyLmRhdGEoXCJhZmZpeFwiLGk9bmV3IHQodGhpcyxzKSksdHlwZW9mIG49PVwic3RyaW5nXCImJmlbbl0oKX0pfSxlLmZuLmFmZml4LkNvbnN0cnVjdG9yPXQsZS5mbi5hZmZpeC5kZWZhdWx0cz17b2Zmc2V0OjB9LGUuZm4uYWZmaXgubm9Db25mbGljdD1mdW5jdGlvbigpe3JldHVybiBlLmZuLmFmZml4PW4sdGhpc30sZSh3aW5kb3cpLm9uKFwibG9hZFwiLGZ1bmN0aW9uKCl7ZSgnW2RhdGEtc3B5PVwiYWZmaXhcIl0nKS5lYWNoKGZ1bmN0aW9uKCl7dmFyIHQ9ZSh0aGlzKSxuPXQuZGF0YSgpO24ub2Zmc2V0PW4ub2Zmc2V0fHx7fSxuLm9mZnNldEJvdHRvbSYmKG4ub2Zmc2V0LmJvdHRvbT1uLm9mZnNldEJvdHRvbSksbi5vZmZzZXRUb3AmJihuLm9mZnNldC50b3A9bi5vZmZzZXRUb3ApLHQuYWZmaXgobil9KX0pfSh3aW5kb3cualF1ZXJ5KTsiLCIvLyQod2luZG93KS5sb2FkKGZ1bmN0aW9uKCkge1xuXG52YXIgYWNjb3JkaW9uQ29udHJvbCA9ICQoJy5hY2NvcmRpb24gLmFjY29yZGlvbi1jb250cm9sJyk7XG5cbmFjY29yZGlvbkNvbnRyb2wub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJHRoaXMgPSAkKHRoaXMpO1xuICAgICRhY2NvcmRpb24gPSAkdGhpcy5jbG9zZXN0KCcuYWNjb3JkaW9uJyk7XG5cbiAgICBpZiAoJGFjY29yZGlvbi5oYXNDbGFzcygnb3BlbicpKSB7XG4gICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLmhpZGUoMzAwKTtcbiAgICAgICRhY2NvcmRpb24ucmVtb3ZlQ2xhc3MoJ29wZW4nKVxuICAgIH0gZWxzZSB7XG4gICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLnNob3coMzAwKTtcbiAgICAgICRhY2NvcmRpb24uYWRkQ2xhc3MoJ29wZW4nKVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xuYWNjb3JkaW9uQ29udHJvbC5zaG93KCk7XG4vL30pXG5cbm9iamVjdHMgPSBmdW5jdGlvbiAoYSxiKSB7XG4gIHZhciBjID0gYixcbiAgICBrZXk7XG4gIGZvciAoa2V5IGluIGEpIHtcbiAgICBpZiAoYS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICBjW2tleV0gPSBrZXkgaW4gYiA/IGJba2V5XSA6IGFba2V5XTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGM7XG59O1xuXG4kKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBpbWdfbG9hZF9maW5pc2goKXtcbiAgICBkYXRhPXRoaXM7XG4gICAgaWYoZGF0YS50eXBlPT0wKSB7XG4gICAgICBkYXRhLmltZy5hdHRyKCdzcmMnLCBkYXRhLnNyYyk7XG4gICAgfWVsc2V7XG4gICAgICBkYXRhLmltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcrZGF0YS5zcmMrJyknKTtcbiAgICAgIGRhdGEuaW1nLnJlbW92ZUNsYXNzKCdub19hdmEnKTtcbiAgICB9XG4gIH1cblxuICAvL9GC0LXRgdGCINC70L7Qs9C+INC80LDQs9Cw0LfQuNC90LBcbiAgaW1ncz0kKCdzZWN0aW9uOm5vdCgubmF2aWdhdGlvbiknKS5maW5kKCcubG9nbyBpbWcnKTtcbiAgZm9yICh2YXIgaT0wO2k8aW1ncy5sZW5ndGg7aSsrKXtcbiAgICBpbWc9aW1ncy5lcShpKTtcbiAgICBzcmM9aW1nLmF0dHIoJ3NyYycpO1xuICAgIGltZy5hdHRyKCdzcmMnLCcvaW1hZ2VzL3RlbXBsYXRlLWxvZ28uanBnJyk7XG4gICAgZGF0YT17XG4gICAgICBzcmM6c3JjLFxuICAgICAgaW1nOmltZyxcbiAgICAgIHR5cGU6MCAvLyDQtNC70Y8gaW1nW3NyY11cbiAgICB9O1xuICAgIGltYWdlPSQoJzxpbWcvPicse1xuICAgICAgc3JjOnNyY1xuICAgIH0pLm9uKCdsb2FkJyxpbWdfbG9hZF9maW5pc2guYmluZChkYXRhKSlcbiAgfVxuXG4gIC8v0YLQtdGB0YIg0LDQstCw0YLQsNGA0L7QuiDQsiDQutC+0LzQtdC90YLQsNGA0LjRj9GFXG4gIGltZ3M9JCgnLmNvbW1lbnQtcGhvdG8nKTtcbiAgZm9yICh2YXIgaT0wO2k8aW1ncy5sZW5ndGg7aSsrKXtcbiAgICBpbWc9aW1ncy5lcShpKTtcbiAgICBpZihpbWcuaGFzQ2xhc3MoJ25vX2F2YScpKXtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHNyYz1pbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJyk7XG4gICAgc3JjPXNyYy5yZXBsYWNlKCd1cmwoXCInLCcnKTtcbiAgICBzcmM9c3JjLnJlcGxhY2UoJ1wiKScsJycpO1xuICAgIGltZy5hZGRDbGFzcygnbm9fYXZhJyk7XG5cbiAgICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKC9pbWFnZXMvbm9fYXZhLnBuZyknKTtcbiAgICBkYXRhPXtcbiAgICAgIHNyYzpzcmMsXG4gICAgICBpbWc6aW1nLFxuICAgICAgdHlwZToxIC8vINC00LvRjyDRhNC+0L3QvtCy0YvRhSDQutCw0YDRgtC40L3QvtC6XG4gICAgfTtcbiAgICBpbWFnZT0kKCc8aW1nLz4nLHtcbiAgICAgIHNyYzpzcmNcbiAgICB9KS5vbignbG9hZCcsaW1nX2xvYWRfZmluaXNoLmJpbmQoZGF0YSkpXG4gIH1cbn0pO1xuXG4oZnVuY3Rpb24oKSB7XG4gIGVscz0kKCcuYWpheF9sb2FkJyk7XG4gIGZvcihpPTA7aTxlbHMubGVuZ3RoO2krKyl7XG4gICAgZWw9ZWxzLmVxKGkpO1xuICAgIHVybD1lbC5hdHRyKCdyZXMnKTtcbiAgICAkLmdldCh1cmwsZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICR0aGlzPSQodGhpcyk7XG4gICAgICAkdGhpcy5odG1sKGRhdGEpO1xuICAgICAgYWpheEZvcm0oJHRoaXMpO1xuICAgIH0uYmluZChlbCkpXG4gIH1cbn0pKCk7XG5cbiQoJ2lucHV0W3R5cGU9ZmlsZV0nKS5vbignY2hhbmdlJyxmdW5jdGlvbihldnQpe1xuICB2YXIgZmlsZSA9IGV2dC50YXJnZXQuZmlsZXM7IC8vIEZpbGVMaXN0IG9iamVjdFxuICB2YXIgZiA9IGZpbGVbMF07XG4gIC8vIE9ubHkgcHJvY2VzcyBpbWFnZSBmaWxlcy5cbiAgaWYgKCFmLnR5cGUubWF0Y2goJ2ltYWdlLionKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblxuICBkYXRhPSB7XG4gICAgJ2VsJzogdGhpcyxcbiAgICAnZic6IGZcbiAgfTtcbiAgcmVhZGVyLm9ubG9hZCA9IChmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGltZz0kKCdbZm9yPVwiJytkYXRhLmVsLm5hbWUrJ1wiXScpO1xuICAgICAgaWYoaW1nLmxlbmd0aD4wKXtcbiAgICAgICAgaW1nLmF0dHIoJ3NyYycsZS50YXJnZXQucmVzdWx0KVxuICAgICAgfVxuICAgIH07XG4gIH0pKGRhdGEpO1xuICAvLyBSZWFkIGluIHRoZSBpbWFnZSBmaWxlIGFzIGEgZGF0YSBVUkwuXG4gIHJlYWRlci5yZWFkQXNEYXRhVVJMKGYpO1xufSk7XG5cbiQoJ2JvZHknKS5vbignY2xpY2snLCdhLmFqYXhGb3JtT3BlbicsZnVuY3Rpb24oZSl7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgaHJlZj10aGlzLmhyZWYuc3BsaXQoJyMnKTtcbiAgaHJlZj1ocmVmW2hyZWYubGVuZ3RoLTFdO1xuXG4gIGRhdGE9e1xuICAgIGJ1dHRvblllczpmYWxzZSxcbiAgICBub3R5ZnlfY2xhc3M6XCJub3RpZnlfd2hpdGUgbG9hZGluZ1wiLFxuICAgIHF1ZXN0aW9uOicnXG4gIH07XG4gIG1vZGFsX2NsYXNzPSQodGhpcykuZGF0YSgnbW9kYWwtY2xhc3MnKTtcblxuICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XG4gICQuZ2V0KCcvJytocmVmLGZ1bmN0aW9uKGRhdGEpe1xuICAgICQoJy5ub3RpZnlfYm94JykucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAkKCcubm90aWZ5X2JveCAubm90aWZ5X2NvbnRlbnQnKS5odG1sKGRhdGEuaHRtbCk7XG4gICAgYWpheEZvcm0oJCgnLm5vdGlmeV9ib3ggLm5vdGlmeV9jb250ZW50JykpO1xuICAgIGlmKG1vZGFsX2NsYXNzKXtcbiAgICAgICQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCAucm93JykuYWRkQ2xhc3MobW9kYWxfY2xhc3MpO1xuICAgIH1cbiAgfSwnanNvbicpXG59KTtcblxuJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoe1xuICBkZWxheToge1xuICAgIHNob3c6IDUwMCwgaGlkZTogMjAwMFxuICB9XG59KTtcbiQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS5vbignY2xpY2snLGZ1bmN0aW9uIChlKSB7XG4gICR0aGlzPSQodGhpcyk7XG4gIGlmKCR0aGlzLmNsb3Nlc3QoJ3VsJykuaGFzQ2xhc3MoJ3BhZ2luYXRlJykpIHtcbiAgICAvL9C00LvRjyDQv9Cw0LPQuNC90LDRhtC40Lgg0YHRgdGL0LvQutCwINC00L7Qu9C20L3QsCDRgNCw0LHQvtGC0LDRgtGMXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYoJHRoaXMuaGFzQ2xhc3MoJ3dvcmtIcmVmJykpe1xuICAgIC8v0JXRgdC70Lgg0YHRgdGL0LvQutCwINC/0L7QvNC10YfQtdC90L3QsCDQutCw0Log0YDQsNCx0L7Rh9Cw0Y8g0YLQviDQvdGD0LbQvdC+INC/0LXRgNC10YXQvtC00LjRgtGMXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICByZXR1cm4gZmFsc2U7XG59KTtcblxuXG4kKCcuYWpheC1hY3Rpb24nKS5jbGljayhmdW5jdGlvbihlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgdmFyIHN0YXR1cyA9ICQodGhpcykuZGF0YSgndmFsdWUnKTtcbiAgdmFyIGhyZWYgPSAkKHRoaXMpLmF0dHIoJ2hyZWYnKTtcbiAgdmFyIGlkcyA9ICQoJyNncmlkLWFqYXgtYWN0aW9uJykueWlpR3JpZFZpZXcoJ2dldFNlbGVjdGVkUm93cycpO1xuICBpZiAoaWRzLmxlbmd0aCA+IDApIHtcbiAgICBpZiAoIWNvbmZpcm0oJ9Cf0L7QtNGC0LLQtdGA0LTQuNGC0LUg0LjQt9C80LXQvdC10L3QuNC1INC30LDQv9C40YHQtdC5JykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiBocmVmLFxuICAgICAgdHlwZTogJ3Bvc3QnLFxuICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgc3RhdHVzOiBzdGF0dXMsXG4gICAgICAgIGlkOiBpZHNcbiAgICAgIH1cbiAgICB9KS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICQoJyNncmlkLWFqYXgtYWN0aW9uJykueWlpR3JpZFZpZXcoXCJhcHBseUZpbHRlclwiKTtcbiAgICAgIGlmIChkYXRhLmVycm9yICE9IGZhbHNlKSB7XG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Cf0YDQvtC40LfQvtGI0LvQsCDQvtGI0LjQsdC60LAhJyx0eXBlOidlcnInfSlcbiAgICAgIH1cbiAgICB9KS5mYWlsKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0J/RgNC+0LjQt9C+0YjQu9CwINC+0YjQuNCx0LrQsCEnLHR5cGU6J2Vycid9KVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Cd0LXQvtCx0YXQvtC00LjQvNC+INCy0YvQsdGA0LDRgtGMINGN0LvQtdC80LXQvdGC0YshJyx0eXBlOidlcnInfSlcbiAgfVxufSk7XG5cbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICQoJy5lZGl0aWJsZVtkaXNhYmxlZF0nKS5vbignY2xpY2snLGZ1bmN0aW9uICgpIHtcbiAgICAkKHRoaXMpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpXG4gIH0pXG5cbiAgJCgnLmVkaXRpYmxlW2Rpc2FibGVkXScpLm9uKCdtb3VzZWRvd24nLGZ1bmN0aW9uICgpIHtcbiAgICAkKHRoaXMpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpXG4gIH0pXG5cbiAgYnRuPSc8YnV0dG9uIGNsYXNzPXVubG9jaz48aSBjbGFzcz1cImZhIGZhLXVubG9jayBmYS00XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPjwvYnV0dG9uPic7XG4gIGJ0bj0kKGJ0bik7XG4gIGJ0bi5vbignY2xpY2snLGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICR0aGlzPSQodGhpcyk7XG4gICAgaW5wPSR0aGlzLnByZXYoKTtcbiAgICBpbnAucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcbiAgJCgnLmVkaXRpYmxlW2Rpc2FibGVkXScpLmFmdGVyKGJ0bilcbn0pO1xuXG4kKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBtZW51ID0ge1xuICAgIGNvbnRyb2w6IHtcbiAgICAgIGhlYWRlclN0b3Jlc01lbnU6ICQoXCIjdG9wXCIpLmZpbmQoXCIuc3VibWVudS1oYW5kbFwiKSxcbiAgICAgIHN0b3Jlc1N1Ym1lbnVzOiAkKFwiI3RvcFwiKS5maW5kKFwiLnN1Ym1lbnUtaGFuZGxcIikuZmluZChcIi5zdWJtZW51XCIpLFxuICAgICAgZXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLmhlYWRlclN0b3Jlc01lbnUuaG92ZXIoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIHN1Ym1lbnUgPSAkKHRoaXMpLmZpbmQoJy5zdWJtZW51Jyk7XG4gICAgICAgICAgaWYoJCh3aW5kb3cpLndpZHRoKCkgPiA5OTEpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChzZWxmLnN0b3JlSGlkZSk7XG4gICAgICAgICAgICBzZWxmLnN0b3Jlc1N1Ym1lbnVzLmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xuICAgICAgICAgICAgc2VsZi5zdG9yZVNob3cgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBzdWJtZW51LmNsZWFyUXVldWUoKTtcbiAgICAgICAgICAgICAgc3VibWVudS5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIikuYW5pbWF0ZSh7XCJvcGFjaXR5XCI6IDF9LCAzNTApO1xuICAgICAgICAgICAgICAvLyBzZWxmLnN0b3Jlc1N1Ym1lbnUuY2xlYXJRdWV1ZSgpO1xuICAgICAgICAgICAgICAvLyBzZWxmLnN0b3Jlc1N1Ym1lbnUuY3NzKFwiZGlzcGxheVwiLCBcImJsb2NrXCIpLmFuaW1hdGUoe1wib3BhY2l0eVwiOiAxfSwgMzUwKTtcbiAgICAgICAgICAgIH0sIDIwMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgc3VibWVudSA9ICQodGhpcykuZmluZCgnLnN1Ym1lbnUnKTtcbiAgICAgICAgICBpZigkKHdpbmRvdykud2lkdGgoKSA+IDk5MSkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYuc3RvcmVTaG93KTtcbiAgICAgICAgICAgIHNlbGYuc3RvcmVIaWRlID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgc3VibWVudS5jbGVhclF1ZXVlKCk7XG4gICAgICAgICAgICAgIHN1Ym1lbnUuYW5pbWF0ZSh7XCJvcGFjaXR5XCI6IDB9LCAyMDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICQodGhpcykuY3NzKFwiZGlzcGxheVwiLCBcIm5vbmVcIik7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAvLyBzZWxmLnN0b3Jlc1N1Ym1lbnUuY2xlYXJRdWV1ZSgpO1xuICAgICAgICAgICAgICAvLyBzZWxmLnN0b3Jlc1N1Ym1lbnUuYW5pbWF0ZSh7XCJvcGFjaXR5XCI6IDB9LCAyMDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAvLyAgICAgJCh0aGlzKS5jc3MoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcbiAgICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgICB9LCAzMDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBtZW51LmNvbnRyb2wuZXZlbnRzKCk7XG59KTtcblxuLy/Rh9GC0L4g0LEg0LjRhNGA0LXQudC80Ysg0Lgg0LrQsNGA0YLQuNC90LrQuCDQvdC1INCy0YvQu9Cw0LfQuNC70LhcbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XG4gIC8qbV93ID0gJCgnLnRleHQtY29udGVudCcpLndpZHRoKClcbiAgaWYgKG1fdyA8IDUwKW1fdyA9IHNjcmVlbi53aWR0aCAtIDQwKi9cbiAgbXc9c2NyZWVuLndpZHRoLTQwO1xuICBwID0gJCgnLmNvbnRhaW5lciBpbWcsLmNvbnRhaW5lciBpZnJhbWUnKVxuICBmb3IgKGkgPSAwOyBpIDwgcC5sZW5ndGg7IGkrKykge1xuICAgIGVsID0gcC5lcShpKTtcbiAgICBtX3c9ZWwucGFyZW50KCkud2lkdGgoKTtcbiAgICBpZihtX3c+bXcpbV93PW13O1xuICAgIGlmIChlbC53aWR0aCgpID4gbV93KSB7XG4gICAgICBrID0gZWwud2lkdGgoKSAvIG1fdztcbiAgICAgIGVsLmhlaWdodChlbC5oZWlnaHQoKSAvIGspO1xuICAgICAgZWwud2lkdGgobV93KVxuICAgIH1cbiAgfVxufSk7XG5cbi8v0LjQt9Cx0YDQsNC90L3QvtC1XG4kKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAkKFwiI3RvcCAuZmF2b3JpdGUtbGlua1wiKS5vbignY2xpY2snLGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gJCh0aGlzKTtcbiAgICB2YXIgdHlwZSA9IHNlbGYuYXR0cihcImRhdGEtc3RhdGVcIiksXG4gICAgICBhZmZpbGlhdGVfaWQgPSBzZWxmLmF0dHIoXCJkYXRhLWFmZmlsaWF0ZS1pZFwiKTtcblxuICAgIGlmKHR5cGUgPT0gXCJhZGRcIikge1xuICAgICAgc2VsZi5maW5kKFwiLmZhXCIpLnJlbW92ZUNsYXNzKFwibXV0ZWRcIik7XG4gICAgfVxuXG4gICAgc2VsZi5maW5kKFwiLmZhXCIpLnJlbW92ZUNsYXNzKFwicHVsc2UyXCIpLmFkZENsYXNzKFwiZmEtc3BpblwiKTtcblxuICAgICQucG9zdChcIi9hY2NvdW50L2Zhdm9yaXRlc1wiLHtcbiAgICAgIFwidHlwZVwiIDogdHlwZSAsXG4gICAgICBcImFmZmlsaWF0ZV9pZFwiOiBhZmZpbGlhdGVfaWRcbiAgICB9LGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICBpZihkYXRhLmVycm9yKXtcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTpkYXRhLmVycm9yLHR5cGU6J2VycicsJ3RpdGxlJzooZGF0YS50aXRsZT9kYXRhLnRpdGxlOmZhbHNlKX0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xuICAgICAgICBtZXNzYWdlOmRhdGEubXNnLFxuICAgICAgICB0eXBlOidzdWNjZXNzJyxcbiAgICAgICAgJ3RpdGxlJzooZGF0YS50aXRsZT9kYXRhLnRpdGxlOmZhbHNlKVxuICAgICAgfSk7XG5cbiAgICAgIGlmKHR5cGUgPT0gXCJhZGRcIikge1xuICAgICAgICBzZWxmLmZpbmQoXCIuZmFcIikuYWRkQ2xhc3MoXCJtdXRlZFwiKTtcbiAgICAgIH1cbiAgICAgIHNlbGYuZmluZChcIi5mYVwiKS5yZW1vdmVDbGFzcyhcImZhLXNwaW5cIik7XG5cbiAgICAgIHNlbGYuYXR0cih7XG4gICAgICAgIFwiZGF0YS1zdGF0ZVwiOiBkYXRhW1wiZGF0YS1zdGF0ZVwiXSxcbiAgICAgICAgXCJkYXRhLW9yaWdpbmFsLXRpdGxlXCI6IGRhdGFbJ2RhdGEtb3JpZ2luYWwtdGl0bGUnXVxuICAgICAgfSk7XG5cbiAgICAgIGlmKHR5cGUgPT0gXCJhZGRcIikge1xuICAgICAgICBzZWxmLmZpbmQoXCIuZmFcIikucmVtb3ZlQ2xhc3MoXCJmYS1zcGluIGZhLWhlYXJ0LW9cIikuYWRkQ2xhc3MoXCJmYS1oZWFydFwiKTtcbiAgICAgIH0gZWxzZSBpZih0eXBlID09IFwiZGVsZXRlXCIpIHtcbiAgICAgICAgc2VsZi5maW5kKFwiLmZhXCIpLnJlbW92ZUNsYXNzKFwiZmEtc3BpbiBmYS1oZWFydFwiKS5hZGRDbGFzcyhcImZhLWhlYXJ0LW8gbXV0ZWRcIik7XG4gICAgICB9XG5cbiAgICB9LCdqc29uJykuZmFpbChmdW5jdGlvbigpIHtcbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6XCI8Yj7QotC10YXQvdC40YfQtdGB0LrQuNC1INGA0LDQsdC+0YLRiyE8L2I+PGJyPtCSINC00LDQvdC90YvQuSDQvNC+0LzQtdC90YIg0LLRgNC10LzQtdC90LhcIiArXG4gICAgICBcIiDQv9GA0L7QuNC30LLQtdC00ZHQvdC90L7QtSDQtNC10LnRgdGC0LLQuNC1INC90LXQstC+0LfQvNC+0LbQvdC+LiDQn9C+0L/RgNC+0LHRg9C50YLQtSDQv9C+0LfQttC1LlwiICtcbiAgICAgIFwiINCf0YDQuNC90L7RgdC40Lwg0YHQstC+0Lgg0LjQt9Cy0LjQvdC10L3QuNGPINC30LAg0L3QtdGD0LTQvtCx0YHRgtCy0L4uXCIsdHlwZTonZXJyJ30pO1xuXG4gICAgICBpZih0eXBlID09IFwiYWRkXCIpIHtcbiAgICAgICAgc2VsZi5maW5kKFwiLmZhXCIpLmFkZENsYXNzKFwibXV0ZWRcIik7XG4gICAgICB9XG4gICAgICBzZWxmLmZpbmQoXCIuZmFcIikucmVtb3ZlQ2xhc3MoXCJmYS1zcGluXCIpO1xuICAgIH0pXG4gIH0pO1xufSk7XG5cbi8v0LXRgdC70Lgg0L7RgtC60YDRi9GC0L4g0LrQsNC6INC00L7Rh9C10YDQvdC10LVcbiQoZnVuY3Rpb24oKXtcbiAgaWYoIXdpbmRvdy5vcGVuZXIpcmV0dXJuO1xuICBpZihocmVmLmluZGV4T2YoJ3NvY2lhbHMnKT4wIHx8IGhyZWYuaW5kZXhPZignbG9naW4nKT4wKXtcbiAgICByZXR1cm47XG4gIH1cbiAgaHJlZj13aW5kb3cub3BlbmVyLmxvY2F0aW9uLmhyZWY7XG4gIGlmKGhyZWYuaW5kZXhPZignc3RvcmUnKT4wIHx8IGhyZWYuaW5kZXhPZignY291cG9uJyk+MCB8fCBocmVmLmluZGV4T2YoJ3NldHRpbmdzJyk+MCl7XG4gICAgd2luZG93Lm9wZW5lci5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgfWVsc2V7XG4gICAgd2luZG93Lm9wZW5lci5sb2NhdGlvbi5ocmVmPWxvY2F0aW9uLmhyZWY7XG4gIH1cbiAgd2luZG93LmNsb3NlKCk7XG59KTsiLCJ2YXIgbm90aWZpY2F0aW9uID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgY29udGVpbmVyO1xuICB2YXIgbW91c2VPdmVyID0gMDtcbiAgdmFyIHRpbWVyQ2xlYXJBbGwgPSBudWxsO1xuICB2YXIgYW5pbWF0aW9uRW5kID0gJ3dlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmQnO1xuICB2YXIgdGltZSA9IDEwMDAwO1xuXG4gIHZhciBub3RpZmljYXRpb25fYm94ID1mYWxzZTtcbiAgdmFyIGlzX2luaXQ9ZmFsc2U7XG4gIHZhciBjb25maXJtX29wdD17XG4gICAgdGl0bGU6XCLQo9C00LDQu9C10L3QuNC1XCIsXG4gICAgcXVlc3Rpb246XCLQktGLINC00LXQudGB0YLQstC40YLQtdC70YzQvdC+INGF0L7RgtC40YLQtSDRg9C00LDQu9C40YLRjD9cIixcbiAgICBidXR0b25ZZXM6XCLQlNCwXCIsXG4gICAgYnV0dG9uTm86XCLQndC10YJcIixcbiAgICBjYWxsYmFja1llczpmYWxzZSxcbiAgICBjYWxsYmFja05vOmZhbHNlLFxuICAgIG9iajpmYWxzZSxcbiAgICBidXR0b25UYWc6J2RpdicsXG4gICAgYnV0dG9uWWVzRG9wOicnLFxuICAgIGJ1dHRvbk5vRG9wOicnLFxuICB9O1xuICB2YXIgYWxlcnRfb3B0PXtcbiAgICB0aXRsZTpcIlwiLFxuICAgIHF1ZXN0aW9uOlwi0KHQvtC+0LHRidC10L3QuNC1XCIsXG4gICAgYnV0dG9uWWVzOlwi0JTQsFwiLFxuICAgIGNhbGxiYWNrWWVzOmZhbHNlLFxuICAgIGJ1dHRvblRhZzonZGl2JyxcbiAgICBvYmo6ZmFsc2UsXG4gIH07XG5cblxuICBmdW5jdGlvbiBpbml0KCl7XG4gICAgaXNfaW5pdD10cnVlO1xuICAgIG5vdGlmaWNhdGlvbl9ib3g9JCgnLm5vdGlmaWNhdGlvbl9ib3gnKTtcbiAgICBpZihub3RpZmljYXRpb25fYm94Lmxlbmd0aD4wKXJldHVybjtcblxuICAgICQoJ2JvZHknKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdub3RpZmljYXRpb25fYm94Jz48L2Rpdj5cIik7XG4gICAgbm90aWZpY2F0aW9uX2JveD0kKCcubm90aWZpY2F0aW9uX2JveCcpO1xuXG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCcubm90aWZ5X2NvbnRyb2wnLGNsb3NlTW9kYWwpO1xuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywnLm5vdGlmeV9jbG9zZScsY2xvc2VNb2RhbCk7XG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLGNsb3NlTW9kYWxGb24pO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2VNb2RhbCgpe1xuICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnc2hvd19ub3RpZmknKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb3NlTW9kYWxGb24oZSl7XG4gICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcbiAgICBpZih0YXJnZXQuY2xhc3NOYW1lPT1cIm5vdGlmaWNhdGlvbl9ib3hcIil7XG4gICAgICBjbG9zZU1vZGFsKCk7XG4gICAgfVxuICB9XG5cbiAgdmFyIF9zZXRVcExpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xuICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnLm5vdGlmaWNhdGlvbl9jbG9zZScsIF9jbG9zZVBvcHVwKTtcbiAgICAkKCdib2R5Jykub24oJ21vdXNlZW50ZXInLCAnLm5vdGlmaWNhdGlvbl9jb250YWluZXInLCBfb25FbnRlcik7XG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWxlYXZlJywgJy5ub3RpZmljYXRpb25fY29udGFpbmVyJywgX29uTGVhdmUpO1xuICB9O1xuXG4gIHZhciBfb25FbnRlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgaWYoZXZlbnQpZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAodGltZXJDbGVhckFsbCE9bnVsbCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyQ2xlYXJBbGwpO1xuICAgICAgdGltZXJDbGVhckFsbCA9IG51bGw7XG4gICAgfVxuICAgIGNvbnRlaW5lci5maW5kKCcubm90aWZpY2F0aW9uX2l0ZW0nKS5lYWNoKGZ1bmN0aW9uKGkpe1xuICAgICAgdmFyIG9wdGlvbj0kKHRoaXMpLmRhdGEoJ29wdGlvbicpO1xuICAgICAgaWYob3B0aW9uLnRpbWVyKSB7XG4gICAgICAgIGNsZWFyVGltZW91dChvcHRpb24udGltZXIpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIG1vdXNlT3ZlciA9IDE7XG4gIH07XG5cbiAgdmFyIF9vbkxlYXZlID0gZnVuY3Rpb24oKSB7XG4gICAgY29udGVpbmVyLmZpbmQoJy5ub3RpZmljYXRpb25faXRlbScpLmVhY2goZnVuY3Rpb24oaSl7XG4gICAgICAkdGhpcz0kKHRoaXMpO1xuICAgICAgdmFyIG9wdGlvbj0kdGhpcy5kYXRhKCdvcHRpb24nKTtcbiAgICAgIGlmKG9wdGlvbi50aW1lPjApIHtcbiAgICAgICAgb3B0aW9uLnRpbWVyID0gc2V0VGltZW91dChfY2xvc2VQb3B1cC5iaW5kKG9wdGlvbi5jbG9zZSksIG9wdGlvbi50aW1lIC0gMTUwMCArIDEwMCAqIGkpO1xuICAgICAgICAkdGhpcy5kYXRhKCdvcHRpb24nLG9wdGlvbilcbiAgICAgIH1cbiAgICB9KTtcbiAgICBtb3VzZU92ZXIgPSAwO1xuICB9O1xuXG4gIHZhciBfY2xvc2VQb3B1cCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgaWYoZXZlbnQpZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciAkdGhpcyA9ICQodGhpcykucGFyZW50KCk7XG4gICAgJHRoaXMub24oYW5pbWF0aW9uRW5kLCBmdW5jdGlvbigpIHtcbiAgICAgICQodGhpcykucmVtb3ZlKCk7XG4gICAgfSk7XG4gICAgJHRoaXMuYWRkQ2xhc3MoJ25vdGlmaWNhdGlvbl9oaWRlJylcbiAgfTtcblxuICBmdW5jdGlvbiBhbGVydChkYXRhKXtcbiAgICBpZighZGF0YSlkYXRhPXt9O1xuICAgIGRhdGE9b2JqZWN0cyhhbGVydF9vcHQsZGF0YSk7XG5cbiAgICBpZighaXNfaW5pdClpbml0KCk7XG5cbiAgICBub3R5ZnlfY2xhc3M9J25vdGlmeV9ib3ggJztcbiAgICBpZihkYXRhLm5vdHlmeV9jbGFzcylub3R5ZnlfY2xhc3MrPWRhdGEubm90eWZ5X2NsYXNzO1xuXG4gICAgYm94X2h0bWw9JzxkaXYgY2xhc3M9XCInK25vdHlmeV9jbGFzcysnXCI+JztcbiAgICBib3hfaHRtbCs9JzxkaXYgY2xhc3M9XCJub3RpZnlfdGl0bGVcIj4nO1xuICAgIGJveF9odG1sKz1kYXRhLnRpdGxlO1xuICAgIGJveF9odG1sKz0nPHNwYW4gY2xhc3M9XCJub3RpZnlfY2xvc2VcIj48L3NwYW4+JztcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XG5cbiAgICBib3hfaHRtbCs9JzxkaXYgY2xhc3M9XCJub3RpZnlfY29udGVudFwiPic7XG4gICAgYm94X2h0bWwrPWRhdGEucXVlc3Rpb247XG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xuXG4gICAgaWYoZGF0YS5idXR0b25ZZXN8fGRhdGEuYnV0dG9uTm8pIHtcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uWWVzKWJveF9odG1sICs9ICc8JytkYXRhLmJ1dHRvblRhZysnIGNsYXNzPVwibm90aWZ5X2J0bl95ZXNcIiAnK2RhdGEuYnV0dG9uWWVzRG9wKyc+JyArIGRhdGEuYnV0dG9uWWVzICsgJzwvJytkYXRhLmJ1dHRvblRhZysnPic7XG4gICAgICBpZiAoZGF0YS5idXR0b25Obylib3hfaHRtbCArPSAnPCcrZGF0YS5idXR0b25UYWcrJyBjbGFzcz1cIm5vdGlmeV9idG5fbm9cIiAnK2RhdGEuYnV0dG9uTm9Eb3ArJz4nICsgZGF0YS5idXR0b25ObyArICc8LycrZGF0YS5idXR0b25UYWcrJz4nO1xuICAgICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG4gICAgfTtcblxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xuXG5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdzaG93X25vdGlmaScpO1xuICAgIH0sMTAwKVxuICB9XG5cbiAgZnVuY3Rpb24gY29uZmlybShkYXRhKXtcbiAgICBpZighZGF0YSlkYXRhPXt9O1xuICAgIGRhdGE9b2JqZWN0cyhjb25maXJtX29wdCxkYXRhKTtcblxuICAgIGlmKCFpc19pbml0KWluaXQoKTtcblxuICAgIGJveF9odG1sPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveFwiPic7XG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X3RpdGxlXCI+JztcbiAgICBib3hfaHRtbCs9ZGF0YS50aXRsZTtcbiAgICBib3hfaHRtbCs9JzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xuXG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRlbnRcIj4nO1xuICAgIGJveF9odG1sKz1kYXRhLnF1ZXN0aW9uO1xuICAgIGJveF9odG1sKz0nPC9kaXY+JztcblxuICAgIGlmKGRhdGEuYnV0dG9uWWVzfHxkYXRhLmJ1dHRvbk5vKSB7XG4gICAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250cm9sXCI+JztcbiAgICAgIGlmIChkYXRhLmJ1dHRvblllcylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5feWVzXCI+JyArIGRhdGEuYnV0dG9uWWVzICsgJzwvZGl2Pic7XG4gICAgICBpZiAoZGF0YS5idXR0b25Obylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5fbm9cIj4nICsgZGF0YS5idXR0b25ObyArICc8L2Rpdj4nO1xuICAgICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG4gICAgfVxuXG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XG5cbiAgICBpZihkYXRhLmNhbGxiYWNrWWVzIT1mYWxzZSl7XG4gICAgICBub3RpZmljYXRpb25fYm94LmZpbmQoJy5ub3RpZnlfYnRuX3llcycpLm9uKCdjbGljaycsZGF0YS5jYWxsYmFja1llcy5iaW5kKGRhdGEub2JqKSk7XG4gICAgfVxuICAgIGlmKGRhdGEuY2FsbGJhY2tObyE9ZmFsc2Upe1xuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl9ubycpLm9uKCdjbGljaycsZGF0YS5jYWxsYmFja05vLmJpbmQoZGF0YS5vYmopKTtcbiAgICB9XG5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdzaG93X25vdGlmaScpO1xuICAgIH0sMTAwKVxuXG4gIH1cblxuICBmdW5jdGlvbiBub3RpZmkoZGF0YSkge1xuICAgIGlmKCFkYXRhKWRhdGE9e307XG4gICAgdmFyIG9wdGlvbiA9IHt0aW1lIDogKGRhdGEudGltZXx8ZGF0YS50aW1lPT09MCk/ZGF0YS50aW1lOnRpbWV9O1xuICAgIGlmICghY29udGVpbmVyKSB7XG4gICAgICBjb250ZWluZXIgPSAkKCc8dWwvPicsIHtcbiAgICAgICAgJ2NsYXNzJzogJ25vdGlmaWNhdGlvbl9jb250YWluZXInXG4gICAgICB9KTtcblxuICAgICAgJCgnYm9keScpLmFwcGVuZChjb250ZWluZXIpO1xuICAgICAgX3NldFVwTGlzdGVuZXJzKCk7XG4gICAgfVxuXG4gICAgdmFyIGxpID0gJCgnPGxpLz4nLCB7XG4gICAgICBjbGFzczogJ25vdGlmaWNhdGlvbl9pdGVtJ1xuICAgIH0pO1xuXG4gICAgaWYgKGRhdGEudHlwZSl7XG4gICAgICBsaS5hZGRDbGFzcygnbm90aWZpY2F0aW9uX2l0ZW0tJyArIGRhdGEudHlwZSk7XG4gICAgfVxuXG4gICAgdmFyIGNsb3NlPSQoJzxzcGFuLz4nLHtcbiAgICAgIGNsYXNzOidub3RpZmljYXRpb25fY2xvc2UnXG4gICAgfSk7XG4gICAgb3B0aW9uLmNsb3NlPWNsb3NlO1xuICAgIGxpLmFwcGVuZChjbG9zZSk7XG5cbiAgICB2YXIgY29udGVudCA9ICQoJzxkaXYvPicse1xuICAgICAgY2xhc3M6XCJub3RpZmljYXRpb25fY29udGVudFwiXG4gICAgfSk7XG5cbiAgICBpZihkYXRhLnRpdGxlICYmIGRhdGEudGl0bGUubGVuZ3RoPjApIHtcbiAgICAgIHZhciB0aXRsZSA9ICQoJzxoNS8+Jywge1xuICAgICAgICBjbGFzczogXCJub3RpZmljYXRpb25fdGl0bGVcIlxuICAgICAgfSk7XG4gICAgICB0aXRsZS5odG1sKGRhdGEudGl0bGUpO1xuICAgICAgY29udGVudC5hcHBlbmQodGl0bGUpO1xuICAgIH1cblxuICAgIHZhciB0ZXh0PSAkKCc8ZGl2Lz4nLHtcbiAgICAgIGNsYXNzOlwibm90aWZpY2F0aW9uX3RleHRcIlxuICAgIH0pO1xuICAgIHRleHQuaHRtbChkYXRhLm1lc3NhZ2UpO1xuXG4gICAgaWYoZGF0YS5pbWcgJiYgZGF0YS5pbWcubGVuZ3RoPjApIHtcbiAgICAgIHZhciBpbWcgPSAkKCc8ZGl2Lz4nLCB7XG4gICAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl9pbWdcIlxuICAgICAgfSk7XG4gICAgICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5pbWcrJyknKTtcbiAgICAgIHZhciB3cmFwID0gJCgnPGRpdi8+Jywge1xuICAgICAgICBjbGFzczogXCJ3cmFwXCJcbiAgICAgIH0pO1xuXG4gICAgICB3cmFwLmFwcGVuZChpbWcpO1xuICAgICAgd3JhcC5hcHBlbmQodGV4dCk7XG4gICAgICBjb250ZW50LmFwcGVuZCh3cmFwKTtcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnRlbnQuYXBwZW5kKHRleHQpO1xuICAgIH1cbiAgICBsaS5hcHBlbmQoY29udGVudCk7XG5cbiAgICAvL1xuICAgIC8vIGlmKGRhdGEudGl0bGUgJiYgZGF0YS50aXRsZS5sZW5ndGg+MCkge1xuICAgIC8vICAgdmFyIHRpdGxlID0gJCgnPHAvPicsIHtcbiAgICAvLyAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX3RpdGxlXCJcbiAgICAvLyAgIH0pO1xuICAgIC8vICAgdGl0bGUuaHRtbChkYXRhLnRpdGxlKTtcbiAgICAvLyAgIGxpLmFwcGVuZCh0aXRsZSk7XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gaWYoZGF0YS5pbWcgJiYgZGF0YS5pbWcubGVuZ3RoPjApIHtcbiAgICAvLyAgIHZhciBpbWcgPSAkKCc8ZGl2Lz4nLCB7XG4gICAgLy8gICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl9pbWdcIlxuICAgIC8vICAgfSk7XG4gICAgLy8gICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5pbWcrJyknKTtcbiAgICAvLyAgIGxpLmFwcGVuZChpbWcpO1xuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIHZhciBjb250ZW50ID0gJCgnPGRpdi8+Jyx7XG4gICAgLy8gICBjbGFzczpcIm5vdGlmaWNhdGlvbl9jb250ZW50XCJcbiAgICAvLyB9KTtcbiAgICAvLyBjb250ZW50Lmh0bWwoZGF0YS5tZXNzYWdlKTtcbiAgICAvL1xuICAgIC8vIGxpLmFwcGVuZChjb250ZW50KTtcbiAgICAvL1xuICAgICBjb250ZWluZXIuYXBwZW5kKGxpKTtcblxuICAgIGlmKG9wdGlvbi50aW1lPjApe1xuICAgICAgb3B0aW9uLnRpbWVyPXNldFRpbWVvdXQoX2Nsb3NlUG9wdXAuYmluZChjbG9zZSksIG9wdGlvbi50aW1lKTtcbiAgICB9XG4gICAgbGkuZGF0YSgnb3B0aW9uJyxvcHRpb24pXG4gIH1cblxuICByZXR1cm4ge1xuICAgIGFsZXJ0OiBhbGVydCxcbiAgICBjb25maXJtOiBjb25maXJtLFxuICAgIG5vdGlmaTogbm90aWZpLFxuICB9O1xuXG59KSgpO1xuXG5cbiQoJ1tyZWY9cG9wdXBdJykub24oJ2NsaWNrJyxmdW5jdGlvbiAoZSl7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgJHRoaXM9JCh0aGlzKTtcbiAgZWw9JCgkdGhpcy5hdHRyKCdocmVmJykpO1xuICBkYXRhPWVsLmRhdGEoKTtcblxuICBkYXRhLnF1ZXN0aW9uPWVsLmh0bWwoKTtcbiAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xufSk7XG4iLCJmdW5jdGlvbiBhamF4Rm9ybShlbHMpIHtcbiAgdmFyIGZpbGVBcGkgPSB3aW5kb3cuRmlsZSAmJiB3aW5kb3cuRmlsZVJlYWRlciAmJiB3aW5kb3cuRmlsZUxpc3QgJiYgd2luZG93LkJsb2IgPyB0cnVlIDogZmFsc2U7XG4gIHZhciBkZWZhdWx0cyA9IHtcbiAgICBlcnJvcl9jbGFzczogJy5oYXMtZXJyb3InLFxuICB9O1xuXG4gIGZ1bmN0aW9uIG9uUG9zdChwb3N0KXtcbiAgICB2YXIgZGF0YT10aGlzO1xuICAgIGZvcm09ZGF0YS5mb3JtO1xuICAgIHdyYXA9ZGF0YS53cmFwO1xuICAgIGlmKHBvc3QucmVuZGVyKXtcbiAgICAgIHBvc3Qubm90eWZ5X2NsYXNzPVwibm90aWZ5X3doaXRlXCI7XG4gICAgICBub3RpZmljYXRpb24uYWxlcnQocG9zdCk7XG4gICAgfWVsc2V7XG4gICAgICB3cmFwLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgICB3cmFwLmh0bWwocG9zdC5odG1sKTtcbiAgICAgIGFqYXhGb3JtKHdyYXApO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uRmFpbCgpe1xuICAgIHZhciBkYXRhPXRoaXM7XG4gICAgZm9ybT1kYXRhLmZvcm07XG4gICAgd3JhcD1kYXRhLndyYXA7XG4gICAgd3JhcC5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgIHdyYXAuaHRtbCgnPGgzPtCj0L/RgS4uLiDQktC+0LfQvdC40LrQu9CwINC90LXQv9GA0LXQtNCy0LjQtNC10L3QvdCw0Y8g0L7RiNC40LHQutCwLjxoMz4nICtcbiAgICAgICc8cD7Qp9Cw0YHRgtC+INGN0YLQviDQv9GA0L7QuNGB0YXQvtC00LjRgiDQsiDRgdC70YPRh9Cw0LUsINC10YHQu9C4INCy0Ysg0L3QtdGB0LrQvtC70YzQutC+INGA0LDQtyDQv9C+0LTRgNGP0LQg0L3QtdCy0LXRgNC90L4g0LLQstC10LvQuCDRgdCy0L7QuCDRg9GH0LXRgtC90YvQtSDQtNCw0L3QvdGL0LUuINCd0L4g0LLQvtC30LzQvtC20L3RiyDQuCDQtNGA0YPQs9C40LUg0L/RgNC40YfQuNC90YsuINCSINC70Y7QsdC+0Lwg0YHQu9GD0YfQsNC1INC90LUg0YDQsNGB0YHRgtGA0LDQuNCy0LDQudGC0LXRgdGMINC4INC/0YDQvtGB0YLQviDQvtCx0YDQsNGC0LjRgtC10YHRjCDQuiDQvdCw0YjQtdC80YMg0L7Qv9C10YDQsNGC0L7RgNGDINGB0LvRg9C20LHRiyDQv9C+0LTQtNC10YDQttC60LguPC9wPjxicj4nICtcbiAgICAgICc8cD7QodC/0LDRgdC40LHQvi48L3A+Jyk7XG4gICAgYWpheEZvcm0od3JhcCk7XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uU3VibWl0KGUpe1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgZGF0YT10aGlzO1xuICAgIGZvcm09ZGF0YS5mb3JtO1xuICAgIHdyYXA9ZGF0YS53cmFwO1xuXG4gICAgaWYoZm9ybS55aWlBY3RpdmVGb3JtKXtcbiAgICAgIGZvcm0ueWlpQWN0aXZlRm9ybSgndmFsaWRhdGUnKTtcbiAgICB9O1xuXG4gICAgaXNWYWxpZD0oZm9ybS5maW5kKGRhdGEucGFyYW0uZXJyb3JfY2xhc3MpLmxlbmd0aD09MCk7XG5cbiAgICBpZighaXNWYWxpZCl7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfWVsc2V7XG4gICAgICByZXF1aXJlZD1mb3JtLmZpbmQoJ2lucHV0LnJlcXVpcmVkJyk7XG4gICAgICBmb3IoaT0wO2k8cmVxdWlyZWQubGVuZ3RoO2krKyl7XG4gICAgICAgIGlmKHJlcXVpcmVkLmVxKGkpLnZhbCgpLmxlbmd0aDwxKXtcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCFmb3JtLnNlcmlhbGl6ZU9iamVjdClhZGRTUk8oKTtcblxuICAgIHZhciBwb3N0PWZvcm0uc2VyaWFsaXplT2JqZWN0KCk7XG4gICAgZm9ybS5hZGRDbGFzcygnbG9hZGluZycpO1xuICAgIGZvcm0uaHRtbCgnJyk7XG5cbiAgICAkLnBvc3QoXG4gICAgICBkYXRhLnVybCxcbiAgICAgIHBvc3QsXG4gICAgICBvblBvc3QuYmluZChkYXRhKSxcbiAgICAgICdqc29uJ1xuICAgICkuZmFpbChvbkZhaWwuYmluZChkYXRhKSk7XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBlbHMuZmluZCgnW3JlcXVpcmVkXScpXG4gICAgLmFkZENsYXNzKCdyZXF1aXJlZCcpXG4gICAgLnJlbW92ZUF0dHIoJ3JlcXVpcmVkJyk7XG5cbiAgZm9yKHZhciBpPTA7aTxlbHMubGVuZ3RoO2krKyl7XG4gICAgd3JhcD1lbHMuZXEoaSk7XG4gICAgZm9ybT13cmFwLmZpbmQoJ2Zvcm0nKTtcbiAgICBkYXRhPXtcbiAgICAgIGZvcm06Zm9ybSxcbiAgICAgIHBhcmFtOmRlZmF1bHRzLFxuICAgICAgd3JhcDp3cmFwXG4gICAgfTtcbiAgICBkYXRhLnVybD1mb3JtLmF0dHIoJ2FjdGlvbicpIHx8IGxvY2F0aW9uLmhyZWY7XG4gICAgZGF0YS5tZXRob2Q9IGZvcm0uYXR0cignbWV0aG9kJykgfHwgJ3Bvc3QnO1xuICAgIGZvcm0ub2ZmKCdzdWJtaXQnKTtcbiAgICBmb3JtLm9uKCdzdWJtaXQnLCBvblN1Ym1pdC5iaW5kKGRhdGEpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhZGRTUk8oKXtcbiAgJC5mbi5zZXJpYWxpemVPYmplY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG8gPSB7fTtcbiAgICB2YXIgYSA9IHRoaXMuc2VyaWFsaXplQXJyYXkoKTtcbiAgICAkLmVhY2goYSwgZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKG9bdGhpcy5uYW1lXSkge1xuICAgICAgICBpZiAoIW9bdGhpcy5uYW1lXS5wdXNoKSB7XG4gICAgICAgICAgb1t0aGlzLm5hbWVdID0gW29bdGhpcy5uYW1lXV07XG4gICAgICAgIH1cbiAgICAgICAgb1t0aGlzLm5hbWVdLnB1c2godGhpcy52YWx1ZSB8fCAnJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvW3RoaXMubmFtZV0gPSB0aGlzLnZhbHVlIHx8ICcnO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBvO1xuICB9O1xufTtcbmFkZFNSTygpOyIsIiQoJy5hY3Rpb25fdXNlcl9jb25maXJtJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgIGlmICghY29uZmlybSgpKXtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn0pO1xuXG4vL2NoZWNrYm94ZXMg0LLRgNC10LzRkdC9INGA0LDQsdC+0YLRiyDRgtC+0YfQtdC6INC/0YDQvtC00LDQtiwg0L/RgNC4INC60LvQuNC60LDRhSDRhNGD0L3QutGG0LjQvtC90LDQu1xudmFyIHN0b3Jlc1BvaW50Q2hlY2tib3hlcyA9ICQoJy5iMmItc3RvcmVzLXBvaW50cy1mb3JtIGlucHV0W3R5cGU9XCJjaGVja2JveFwiXScpO1xuXG5zdG9yZXNQb2ludENoZWNrYm94ZXMuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5hbWUgPSAkKHRoaXMpLmF0dHIoJ25hbWUnKTtcbiAgICB2YXIgcm93ID0gJCh0aGlzKS5jbG9zZXN0KCd0cicpO1xuICAgIC8vIGlmIChuYW1lLm1hdGNoKC9CMmJTdG9yZXNQb2ludHNcXFt3b3JrX3RpbWVfZGV0YWlsc1xcXVxcW1xcZCpcXF1cXFtob2xpZGF5XFxdLykpIHtcbiAgICAvLyAgICAgY2hlY2tEaXNhYmxlZChyb3csIHRoaXMuY2hlY2tlZCwgJ2RlcGVuZHMtaG9saWRheScpO1xuICAgIC8vIH1cbiAgICBpZiAobmFtZS5tYXRjaCgvQjJiU3RvcmVzUG9pbnRzXFxbd29ya190aW1lX2RldGFpbHNcXF1cXFtcXGQqXFxdXFxbMjQtaG91clxcXS8pKSB7XG4gICAgICAgIGNoZWNrRGlzYWJsZWQocm93LCB0aGlzLmNoZWNrZWQsICdkZXBlbmRzLTI0LWhvdXInKTtcbiAgICB9XG59KTtcblxuLy/Qv9GA0Lgg0LfQsNCz0YDRg9C30LrQtSDQv9GA0L7QstC10YDRj9C10Lwg0YLQviDQttC1LCDRh9GC0L4g0L/RgNC4INC60LvQuNC60LVcbiQuZWFjaChzdG9yZXNQb2ludENoZWNrYm94ZXMsIGZ1bmN0aW9uKGluZGV4LCBpdGVtKXtcbiAgICB2YXIgbmFtZSA9ICQoaXRlbSkuYXR0cignbmFtZScpO1xuICAgIHZhciByb3cgPSAkKGl0ZW0pLmNsb3Nlc3QoJ3RyJyk7XG4gICAgLy8gaWYgKG5hbWUubWF0Y2goL0IyYlN0b3Jlc1BvaW50c1xcW3dvcmtfdGltZV9kZXRhaWxzXFxdXFxbXFxkKlxcXVxcW2hvbGlkYXlcXF0vKSAmJiBpdGVtLmNoZWNrZWQpIHtcbiAgICAvLyAgICAgY2hlY2tEaXNhYmxlZChyb3csIHRydWUsICdkZXBlbmRzLWhvbGlkYXknKTtcbiAgICAvLyB9XG4gICAgaWYgKG5hbWUubWF0Y2goL0IyYlN0b3Jlc1BvaW50c1xcW3dvcmtfdGltZV9kZXRhaWxzXFxdXFxbXFxkKlxcXVxcWzI0LWhvdXJcXF0vKSAmJiBpdGVtLmNoZWNrZWQpIHtcbiAgICAgICAgY2hlY2tEaXNhYmxlZChyb3csIHRydWUsICdkZXBlbmRzLTI0LWhvdXInKTtcbiAgICB9XG59KTtcblxuZnVuY3Rpb24gIGNoZWNrRGlzYWJsZWQocm93LCBjaGVja2VkLCBjbGFzc05hbWUpIHtcbiAgICAvL3ZhciBpbnB1dHNDaGVja2JveCA9ICQocm93KS5maW5kKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0uJytjbGFzc05hbWUpO1xuICAgIHZhciBpbnB1dHNUZXh0ID0gJChyb3cpLmZpbmQoJ2lucHV0W3R5cGU9XCJ0ZXh0XCJdLicrY2xhc3NOYW1lKTtcbiAgICBpbnB1dHNUZXh0LnZhbCgnJyk7XG4gICAgLy9pbnB1dHNDaGVja2JveC5hdHRyKCdjaGVja2VkJywgZmFsc2UpO1xuICAgIGlucHV0c1RleHQuYXR0cignZGlzYWJsZWQnLCBjaGVja2VkKTtcbiAgICAvL2lucHV0c0NoZWNrYm94LmF0dHIoJ2Rpc2FibGVkJywgY2hlY2tlZCk7XG59XG5cbiQoJyNwYXltZW50c19zZWxlY3Rfc3RvcmUnKS5vbignY2hhbmdlJywgcGF5bWVudHNTZWxlY3RTdG9yZSk7XG5cbmZ1bmN0aW9uIHBheW1lbnRzU2VsZWN0U3RvcmUoKXtcbiAgICB2YXIgc2VsZiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXltZW50c19zZWxlY3Rfc3RvcmUnKSxcbiAgICAgICAgc2VsZWN0UG9pbnRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BheW1lbnRzX3NlbGVjdF9zdG9yZV9wb2ludCcpO1xuICAgIGlmIChzZWxmICYmIHNlbGVjdFBvaW50cykge1xuICAgICAgICB2YXIgcG9pbnRzID0gJCgnb3B0aW9uOnNlbGVjdGVkJywgc2VsZikuYXR0cignZGF0YS1wb2ludHMnKSxcbiAgICAgICAgICAgIGdldFNlbGVjdFBvaW50ID0gJChzZWxlY3RQb2ludHMpLmRhdGEoJ2dldCcpLFxuICAgICAgICAgICAgb3B0aW9ucyA9ICcnO1xuICAgICAgICBpZiAocG9pbnRzKSB7XG4gICAgICAgICAgICBwb2ludHMgPSBKU09OLnBhcnNlKHBvaW50cyk7XG4gICAgICAgICAgICBvcHRpb25zID0gJzxvcHRpb24+PC9vcHRpb24+JztcbiAgICAgICAgICAgIHBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICAgICAgICAgIG9wdGlvbnMgKz0gJzxvcHRpb24gdmFsdWU9XCInK2l0ZW0uaWQrJ1wiICcrKHBhcnNlSW50KGdldFNlbGVjdFBvaW50KSA9PSBwYXJzZUludChpdGVtLmlkKSA/ICdzZWxlY3RlZCcgOiAnJykrXG4gICAgICAgICAgICAgICAgICAgICc+JytpdGVtLm5hbWUrJywgJytpdGVtLmNvdW50cnkrJywgJytpdGVtLmNpdHkrJywgJytpdGVtLmFkZHJlc3MrJzwvb3B0aW9ucz4nO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZWN0UG9pbnRzLmlubmVySFRNTCA9IG9wdGlvbnM7XG4gICAgfVxuXG59XG5wYXltZW50c1NlbGVjdFN0b3JlKCk7XG5cbi8vIGIyYiDQv9C70LDRgtC10LbQuCAtINC00LXQudGB0YLQstC40Y8g0YEg0LPRgNC40LRcbiQoXCIucmV2ZXJ0LW9yZGVyXCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIGhyZWYgPSAnL3BheW1lbnRzL3Jldm9rZSc7XG4gICAgdmFyIGlkcyA9ICQodGhpcykuZGF0YSgnaWQnKTtcbiAgICB2YXIgZGF0YT17XG4gICAgICAgIGJ1dHRvblllczpmYWxzZSxcbiAgICAgICAgbm90eWZ5X2NsYXNzOlwibm90aWZ5X3doaXRlIG5vdGlmeV9ub3RfYmlnXCIsXG4gICAgICAgIHRpdGxlOiAn0J/RgNC4INC+0YLQvNC10L3QtSDQv9C70LDRgtC10LbQtdC5INC90YPQttC90L4g0YPQutCw0LfQsNGC0Ywg0L/RgNC40YfQuNC90YMg0L7RgtC80LXQvdGLJyxcbiAgICAgICAgcXVlc3Rpb246XG4gICAgICAgICc8Zm9ybSBhY3Rpb249XCInK2hyZWYrJ1wiIG1ldGhvZD1cInBvc3RcIiBjbGFzcz1cInBheW1lbnRzLWZvcm1zIHJldm9rZV9wYXllbnRzX2Zvcm1cIj4nK1xuICAgICAgICAnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwiaWRzXCIgaWQ9XCJwYXltZW50cy1pZFwiIHZhbHVlPVwiJytpZHMrJ1wiJysnPicrXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPicrXG4gICAgICAgICc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwicGF5bWVudHMtYWRtaW4tY29tbWVudFwiIG5hbWU9XCJhZG1pbi1jb21tZW50XCIgcGxhY2Vob2xkZXI9XCLQktCy0LXQtNC40YLQtSDQv9GA0LjRh9C40L3RgyDQvtGC0LzQtdC90YtcIj4nK1xuICAgICAgICAnPHAgY2xhc3M9XCJoZWxwLWJsb2NrIGhlbHAtYmxvY2stZXJyb3JcIj48L3A+JytcbiAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXAgYnV0dG9uc1wiPicrXG4gICAgICAgICc8aW5wdXQgdHlwZT1cInN1Ym1pdFwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCIgdmFsdWU9XCLQntGC0LrQu9C+0L3QuNGC0YxcIj4nK1xuICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICc8Zm9ybT4nXG4gICAgfTtcbiAgICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSlcblxuXG59KTtcblxuJChcIi5wYXltZW50cy1ncmlkLXZpZXcgLmNoYW5nZS1vcmRlci1wcmljZVwiKS5vbignY2xpY2snLGZ1bmN0aW9uKGUpe1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG4gICAgdmFyIG9yZGVyX3ByaWNlID0gJCh0aGlzKS5kYXRhKCdvcmRlcnByaWNlJyk7XG4gICAgdmFyIGRhdGE9e1xuICAgICAgICBidXR0b25ZZXM6ZmFsc2UsXG4gICAgICAgIG5vdHlmeV9jbGFzczpcIm5vdGlmeV93aGl0ZSBub3RpZnlfbm90X2JpZ1wiLFxuICAgICAgICB0aXRsZTogJ9CY0LfQvNC10L3QuNGC0Ywg0YHRg9C80LzRgyDQv9C+0LrRg9C/0LrQuCcsXG4gICAgICAgIHF1ZXN0aW9uOlxuICAgICAgICAnPGZvcm0gYWN0aW9uPVwiL3BheW1lbnRzL3VwZGF0ZVwiIG1ldGhvZD1cInBvc3RcIiBjbGFzcz1cInBheW1lbnRzLWZvcm1zIGNoYW5nZV9vcmRlcl9wcmljZV9mb3JtXCI+JytcbiAgICAgICAgJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cIlBheW1lbnRzW3VpZF1cIiBpZD1cInBheW1lbnRzLWlkXCIgdmFsdWU9XCInK2lkKydcIicrJz4nK1xuICAgICAgICAnPHAgY2xhc3M9XCJoZWxwLWJsb2NrIGhlbHAtYmxvY2stZXJyb3JcIj48L3A+JytcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCI+JytcbiAgICAgICAgJzxsYWJlbD7QndC+0LLQsNGPINGB0YPQvNC80LA8L2xhYmVsPicrXG4gICAgICAgICc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwicGF5bWVudHMtb3JkZXJfcHJpY2VcIiBuYW1lPVwiUGF5bWVudHNbb3JkZXJfcHJpY2VdXCIgcGxhY2Vob2xkZXI9XCLQktCy0LXQtNC40YLQtSDQvdC+0LLRg9GOINGB0YPQvNC80YNcIiB2YWx1ZT1cIicrb3JkZXJfcHJpY2UrJ1wiPicrXG4gICAgICAgICAgICAnPHAgY2xhc3M9XCJoZWxwLWJsb2NrIGhlbHAtYmxvY2stZXJyb3JcIj48L3A+JytcbiAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj4nK1xuICAgICAgICAnPGxhYmVsPtCa0L7QvNC80LXQvdGC0LDRgNC40Lk8L2xhYmVsPicrXG4gICAgICAgICc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwicGF5bWVudHMtYWRtaW4tY29tbWVudFwiIG5hbWU9XCJQYXltZW50c1thZG1pbi1jb21tZW50XVwiIHBsYWNlaG9sZGVyPVwi0JLQstC10LTQuNGC0LUg0LrQvtC80LzQtdC90YLQsNGA0LjQuVwiPicrXG4gICAgICAgICc8cCBjbGFzcz1cImhlbHAtYmxvY2sgaGVscC1ibG9jay1lcnJvclwiPjwvcD4nK1xuICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cCBidXR0b25zXCI+JytcbiAgICAgICAgJzxpbnB1dCB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIiB2YWx1ZT1cItCY0LfQvNC10L3QuNGC0YxcIj4nK1xuICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICc8Zm9ybT4nXG4gICAgfTtcbiAgICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSlcbn0pO1xuXG4kKGRvY3VtZW50KS5vbignc3VibWl0JywnZm9ybS5jaGFuZ2Vfb3JkZXJfcHJpY2VfZm9ybScsIGZ1bmN0aW9uKGUpe1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkKHRoaXMpLmZpbmQoJ3AuaGVscC1ibG9jaycpLnRleHQoJycpO1xuICAgIHZhciBpZCA9ICQoJyNwYXltZW50cy1pZCcpLnZhbCgpO1xuICAgIHZhciBvcmRlcl9wcmljZSA9ICQoJyNwYXltZW50cy1vcmRlcl9wcmljZScpLnZhbCgpO1xuICAgIHZhciBhZG1pbl9jb21tZW50ID0gJCgnI3BheW1lbnRzLWFkbWluLWNvbW1lbnQnKS52YWwoKTtcbiAgICBpZiAocGFyc2VJbnQoaWQpPDEpIHtcbiAgICAgICAgJCgnI3BheW1lbnRzLWlkJykuc2libGluZ3MoJ3AuaGVscC1ibG9jaycpLnRleHQoJ0lEINC00L7Qu9C20LXQvSDQsdGL0YLRjCDRhtC10LvRi9C8INGH0LjRgdC70L7QvCcpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChvcmRlcl9wcmljZSA9PSAnJykge1xuICAgICAgICAkKCcjcGF5bWVudHMtb3JkZXJfcHJpY2UnKS5zaWJsaW5ncygncC5oZWxwLWJsb2NrJykudGV4dCgn0JLQstC10LTQuNGC0LUg0YHRg9C80LzRgycpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciByZWcgPSAvXlxcZCpcXC4/XFxkKiQvO1xuICAgIGlmICghb3JkZXJfcHJpY2UubWF0Y2gocmVnKSkge1xuICAgICAgICAkKCcjcGF5bWVudHMtb3JkZXJfcHJpY2UnKS5zaWJsaW5ncygncC5oZWxwLWJsb2NrJykuaHRtbCgn0JLQstC10LTQuNGC0LUg0L/RgNCw0LLQuNC70YzQvdC+INGB0YPQvNC80YMuPGJyPtCa0L7Qv9C10LnQutC4INC+0YIg0YDRg9Cx0LvQtdC5INC00L7Qu9C20L3RiyDQvtGC0LTQtdC70Y/RgtGM0YHRjyDRgtC+0YfQutC+0LknKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoYWRtaW5fY29tbWVudC5sZW5ndGg8NSB8fCBhZG1pbl9jb21tZW50Lmxlbmd0aD4yNTYpIHtcbiAgICAgICAgJCgnI3BheW1lbnRzLWFkbWluLWNvbW1lbnQnKS5zaWJsaW5ncygncC5oZWxwLWJsb2NrJykudGV4dCgn0JTQu9C40L3QsCDQutC+0LzQvNC10L3RgtCw0YDQuNGPINC00L7Qu9C20L3QsCDQsdGL0YLRjCDQvtGCIDUg0LTQviAyNTYg0YHQuNC80LLQvtC70L7QsicpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciBkYXRhID0ge1xuICAgICAgICAnaWQnIDogcGFyc2VJbnQoaWQpLFxuICAgICAgICAnb3JkZXJfcHJpY2UnIDogb3JkZXJfcHJpY2UsXG4gICAgICAgICdhZG1pbi1jb21tZW50JyA6IGFkbWluX2NvbW1lbnRcbiAgICB9O1xuICAgICQucG9zdCgkKHRoaXMpLmF0dHIoJ2FjdGlvbicpLCBkYXRhLCBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnc2hvd19ub3RpZmknKTtcbiAgICAgICAgaWYgKHJlc3BvbnNlLmVycm9yID09IGZhbHNlKSB7XG4gICAgICAgICAgICAvLyBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOiAn0J/Qu9Cw0YLRkdC2INC40LfQvNC10L3RkdC9JywgdHlwZTonc3VjY2Vzcyd9KTtcbiAgICAgICAgICAgIC8vIHZhciByb3cgPSAkKCd0cltkYXRhLWtleT1cIicraWQrJ1wiXScpO1xuICAgICAgICAgICAgLy8gdmFyIHRkX3ByaWNlID0gJChyb3cpLmZpbmQoJy50ZC1vcmRlci1wcmljZScpO1xuICAgICAgICAgICAgLy8gJCh0ZF9wcmljZSkudGV4dChyZXNwb25zZS5yZWNhbGMub3JkZXJfcHJpY2UrJyAnKyQodGRfcHJpY2UpLmRhdGEoJ2N1cicpKTtcbiAgICAgICAgICAgIC8vICQocm93KS5maW5kKCcudGQtcmV3YXJkJykuaHRtbChyZXNwb25zZS5yZWNhbGMucmV3YXJkKycgPHNwYW4gY2xhc3M9XCJmYSBmYS1ydWJcIj48L3NwYW4+Jyk7XG4gICAgICAgICAgICAvLyAkKHJvdykuZmluZCgnLnRkLWNhc2hiYWNrJykuaHRtbChyZXNwb25zZS5yZWNhbGMuY2FzaGJhY2srJyA8c3BhbiBjbGFzcz1cImZhIGZhLXJ1YlwiPjwvc3Bhbj4nKTtcbiAgICAgICAgICAgIC8vICQocm93KS5maW5kKCcuY2hhbmdlLW9yZGVyLXByaWNlJykuYXR0cignZGF0YS1vcmRlcnByaWNlJywgcmVzcG9uc2UucmVjYWxjLm9yZGVyX3ByaWNlKTtcbiAgICAgICAgICAgICQoJyNncmlkLWFqYXgtYWN0aW9uJykueWlpR3JpZFZpZXcoXCJhcHBseUZpbHRlclwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6ICfQn9GA0L7QuNC30L7RiNC70LAg0L7RiNC40LHQutCwJywgdHlwZTonZXJyJ30pO1xuICAgICAgICB9XG4gICAgfSwnanNvbicpLmZhaWwoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgJCgnaHRtbCcpLnJlbW92ZUNsYXNzKCdzaG93X25vdGlmaScpO1xuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOifQn9GA0L7QuNC30L7RiNC70LAg0L7RiNC40LHQutCwIScsIHR5cGU6J2Vycid9KVxuICAgIH0pO1xufSk7XG5cbiQoZG9jdW1lbnQpLm9uKCdzdWJtaXQnLCdmb3JtLnJldm9rZV9wYXllbnRzX2Zvcm0nLCBmdW5jdGlvbihlKXtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCh0aGlzKS5maW5kKCdwLmhlbHAtYmxvY2snKS50ZXh0KCcnKTtcbiAgICB2YXIgaWRzID0gJCgnI3BheW1lbnRzLWlkJykudmFsKCk7XG4gICAgdmFyIHN0YXR1cyA9ICQoJyNwYXltZW50cy1zdGF0dXMnKS52YWwoKTtcbiAgICB2YXIgYWRtaW5fY29tbWVudCA9ICQoJyNwYXltZW50cy1hZG1pbi1jb21tZW50JykudmFsKCk7XG5cbiAgICBpZiAoYWRtaW5fY29tbWVudC5sZW5ndGg8NSB8fCBhZG1pbl9jb21tZW50Lmxlbmd0aD4yNTYpIHtcbiAgICAgICAgJCgnI3BheW1lbnRzLWFkbWluLWNvbW1lbnQnKS5zaWJsaW5ncygncC5oZWxwLWJsb2NrJykudGV4dCgn0JTQu9C40L3QsCDQutC+0LzQvNC10L3RgtCw0YDQuNGPINC00L7Qu9C20L3QsCDQsdGL0YLRjCDQvtGCIDUg0LTQviAyNTYg0YHQuNC80LLQvtC70L7QsicpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciBkYXRhID0ge1xuICAgICAgICAnaWRzJyA6IGlkcyxcbiAgICAgICAgJ3N0YXR1cycgOiBzdGF0dXMsXG4gICAgICAgICdhZG1pbi1jb21tZW50JyA6IGFkbWluX2NvbW1lbnRcbiAgICB9O1xuICAgICQucG9zdCgkKHRoaXMpLmF0dHIoJ2FjdGlvbicpLCBkYXRhLCBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnc2hvd19ub3RpZmknKTtcbiAgICAgICAgaWYgKHJlc3BvbnNlLmVycm9yID09IGZhbHNlKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQoJyNncmlkLWFqYXgtYWN0aW9uJykueWlpR3JpZFZpZXcoXCJhcHBseUZpbHRlclwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6ICfQn9GA0L7QuNC30L7RiNC70LAg0L7RiNC40LHQutCwJywgdHlwZTonZXJyJ30pO1xuICAgICAgICB9XG4gICAgfSwnanNvbicpLmZhaWwoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgJCgnaHRtbCcpLnJlbW92ZUNsYXNzKCdzaG93X25vdGlmaScpO1xuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOifQn9GA0L7QuNC30L7RiNC70LAg0L7RiNC40LHQutCwIScsIHR5cGU6J2Vycid9KVxuICAgIH0pO1xufSk7XG5cblxuXG5cbiJdfQ==
