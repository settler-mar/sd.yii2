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

    if(data.title && data.title.length>0) {
      var title = $('<p/>', {
        class: "notification_title"
      });
      title.html(data.title);
      li.append(title);
    }

    if(data.img && data.img.length>0) {
      var img = $('<div/>', {
        class: "notification_img"
      });
      img.css('background-image','url('+data.img+')');
      li.append(img);
    }

    var content = $('<div/>',{
      class:"notification_content"
    });
    content.html(data.message);

    li.append(content);

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





//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvb3RzdHJhcC5taW4uanMiLCJmb3JfYWxsLmpzIiwibm90aWZpY2F0aW9uLmpzIiwianF1ZXJ5LmFqYXhGb3JtLmpzIiwiYjJiLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdlBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyohXG4qIEJvb3RzdHJhcC5qcyBieSBAZmF0ICYgQG1kb1xuKiBDb3B5cmlnaHQgMjAxMiBUd2l0dGVyLCBJbmMuXG4qIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMC50eHRcbiovXG4hZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7ZShmdW5jdGlvbigpe2Uuc3VwcG9ydC50cmFuc2l0aW9uPWZ1bmN0aW9uKCl7dmFyIGU9ZnVuY3Rpb24oKXt2YXIgZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYm9vdHN0cmFwXCIpLHQ9e1dlYmtpdFRyYW5zaXRpb246XCJ3ZWJraXRUcmFuc2l0aW9uRW5kXCIsTW96VHJhbnNpdGlvbjpcInRyYW5zaXRpb25lbmRcIixPVHJhbnNpdGlvbjpcIm9UcmFuc2l0aW9uRW5kIG90cmFuc2l0aW9uZW5kXCIsdHJhbnNpdGlvbjpcInRyYW5zaXRpb25lbmRcIn0sbjtmb3IobiBpbiB0KWlmKGUuc3R5bGVbbl0hPT11bmRlZmluZWQpcmV0dXJuIHRbbl19KCk7cmV0dXJuIGUmJntlbmQ6ZX19KCl9KX0od2luZG93LmpRdWVyeSksIWZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO3ZhciB0PSdbZGF0YS1kaXNtaXNzPVwiYWxlcnRcIl0nLG49ZnVuY3Rpb24obil7ZShuKS5vbihcImNsaWNrXCIsdCx0aGlzLmNsb3NlKX07bi5wcm90b3R5cGUuY2xvc2U9ZnVuY3Rpb24odCl7ZnVuY3Rpb24gcygpe2kudHJpZ2dlcihcImNsb3NlZFwiKS5yZW1vdmUoKX12YXIgbj1lKHRoaXMpLHI9bi5hdHRyKFwiZGF0YS10YXJnZXRcIiksaTtyfHwocj1uLmF0dHIoXCJocmVmXCIpLHI9ciYmci5yZXBsYWNlKC8uKig/PSNbXlxcc10qJCkvLFwiXCIpKSxpPWUociksdCYmdC5wcmV2ZW50RGVmYXVsdCgpLGkubGVuZ3RofHwoaT1uLmhhc0NsYXNzKFwiYWxlcnRcIik/bjpuLnBhcmVudCgpKSxpLnRyaWdnZXIodD1lLkV2ZW50KFwiY2xvc2VcIikpO2lmKHQuaXNEZWZhdWx0UHJldmVudGVkKCkpcmV0dXJuO2kucmVtb3ZlQ2xhc3MoXCJpblwiKSxlLnN1cHBvcnQudHJhbnNpdGlvbiYmaS5oYXNDbGFzcyhcImZhZGVcIik/aS5vbihlLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQscyk6cygpfTt2YXIgcj1lLmZuLmFsZXJ0O2UuZm4uYWxlcnQ9ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciByPWUodGhpcyksaT1yLmRhdGEoXCJhbGVydFwiKTtpfHxyLmRhdGEoXCJhbGVydFwiLGk9bmV3IG4odGhpcykpLHR5cGVvZiB0PT1cInN0cmluZ1wiJiZpW3RdLmNhbGwocil9KX0sZS5mbi5hbGVydC5Db25zdHJ1Y3Rvcj1uLGUuZm4uYWxlcnQubm9Db25mbGljdD1mdW5jdGlvbigpe3JldHVybiBlLmZuLmFsZXJ0PXIsdGhpc30sZShkb2N1bWVudCkub24oXCJjbGljay5hbGVydC5kYXRhLWFwaVwiLHQsbi5wcm90b3R5cGUuY2xvc2UpfSh3aW5kb3cualF1ZXJ5KSwhZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7dmFyIHQ9ZnVuY3Rpb24odCxuKXt0aGlzLiRlbGVtZW50PWUodCksdGhpcy5vcHRpb25zPWUuZXh0ZW5kKHt9LGUuZm4uYnV0dG9uLmRlZmF1bHRzLG4pfTt0LnByb3RvdHlwZS5zZXRTdGF0ZT1mdW5jdGlvbihlKXt2YXIgdD1cImRpc2FibGVkXCIsbj10aGlzLiRlbGVtZW50LHI9bi5kYXRhKCksaT1uLmlzKFwiaW5wdXRcIik/XCJ2YWxcIjpcImh0bWxcIjtlKz1cIlRleHRcIixyLnJlc2V0VGV4dHx8bi5kYXRhKFwicmVzZXRUZXh0XCIsbltpXSgpKSxuW2ldKHJbZV18fHRoaXMub3B0aW9uc1tlXSksc2V0VGltZW91dChmdW5jdGlvbigpe2U9PVwibG9hZGluZ1RleHRcIj9uLmFkZENsYXNzKHQpLmF0dHIodCx0KTpuLnJlbW92ZUNsYXNzKHQpLnJlbW92ZUF0dHIodCl9LDApfSx0LnByb3RvdHlwZS50b2dnbGU9ZnVuY3Rpb24oKXt2YXIgZT10aGlzLiRlbGVtZW50LmNsb3Nlc3QoJ1tkYXRhLXRvZ2dsZT1cImJ1dHRvbnMtcmFkaW9cIl0nKTtlJiZlLmZpbmQoXCIuYWN0aXZlXCIpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLHRoaXMuJGVsZW1lbnQudG9nZ2xlQ2xhc3MoXCJhY3RpdmVcIil9O3ZhciBuPWUuZm4uYnV0dG9uO2UuZm4uYnV0dG9uPWZ1bmN0aW9uKG4pe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgcj1lKHRoaXMpLGk9ci5kYXRhKFwiYnV0dG9uXCIpLHM9dHlwZW9mIG49PVwib2JqZWN0XCImJm47aXx8ci5kYXRhKFwiYnV0dG9uXCIsaT1uZXcgdCh0aGlzLHMpKSxuPT1cInRvZ2dsZVwiP2kudG9nZ2xlKCk6biYmaS5zZXRTdGF0ZShuKX0pfSxlLmZuLmJ1dHRvbi5kZWZhdWx0cz17bG9hZGluZ1RleHQ6XCJsb2FkaW5nLi4uXCJ9LGUuZm4uYnV0dG9uLkNvbnN0cnVjdG9yPXQsZS5mbi5idXR0b24ubm9Db25mbGljdD1mdW5jdGlvbigpe3JldHVybiBlLmZuLmJ1dHRvbj1uLHRoaXN9LGUoZG9jdW1lbnQpLm9uKFwiY2xpY2suYnV0dG9uLmRhdGEtYXBpXCIsXCJbZGF0YS10b2dnbGVePWJ1dHRvbl1cIixmdW5jdGlvbih0KXt2YXIgbj1lKHQudGFyZ2V0KTtuLmhhc0NsYXNzKFwiYnRuXCIpfHwobj1uLmNsb3Nlc3QoXCIuYnRuXCIpKSxuLmJ1dHRvbihcInRvZ2dsZVwiKX0pfSh3aW5kb3cualF1ZXJ5KSwhZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7dmFyIHQ9ZnVuY3Rpb24odCxuKXt0aGlzLiRlbGVtZW50PWUodCksdGhpcy4kaW5kaWNhdG9ycz10aGlzLiRlbGVtZW50LmZpbmQoXCIuY2Fyb3VzZWwtaW5kaWNhdG9yc1wiKSx0aGlzLm9wdGlvbnM9bix0aGlzLm9wdGlvbnMucGF1c2U9PVwiaG92ZXJcIiYmdGhpcy4kZWxlbWVudC5vbihcIm1vdXNlZW50ZXJcIixlLnByb3h5KHRoaXMucGF1c2UsdGhpcykpLm9uKFwibW91c2VsZWF2ZVwiLGUucHJveHkodGhpcy5jeWNsZSx0aGlzKSl9O3QucHJvdG90eXBlPXtjeWNsZTpmdW5jdGlvbih0KXtyZXR1cm4gdHx8KHRoaXMucGF1c2VkPSExKSx0aGlzLmludGVydmFsJiZjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpLHRoaXMub3B0aW9ucy5pbnRlcnZhbCYmIXRoaXMucGF1c2VkJiYodGhpcy5pbnRlcnZhbD1zZXRJbnRlcnZhbChlLnByb3h5KHRoaXMubmV4dCx0aGlzKSx0aGlzLm9wdGlvbnMuaW50ZXJ2YWwpKSx0aGlzfSxnZXRBY3RpdmVJbmRleDpmdW5jdGlvbigpe3JldHVybiB0aGlzLiRhY3RpdmU9dGhpcy4kZWxlbWVudC5maW5kKFwiLml0ZW0uYWN0aXZlXCIpLHRoaXMuJGl0ZW1zPXRoaXMuJGFjdGl2ZS5wYXJlbnQoKS5jaGlsZHJlbigpLHRoaXMuJGl0ZW1zLmluZGV4KHRoaXMuJGFjdGl2ZSl9LHRvOmZ1bmN0aW9uKHQpe3ZhciBuPXRoaXMuZ2V0QWN0aXZlSW5kZXgoKSxyPXRoaXM7aWYodD50aGlzLiRpdGVtcy5sZW5ndGgtMXx8dDwwKXJldHVybjtyZXR1cm4gdGhpcy5zbGlkaW5nP3RoaXMuJGVsZW1lbnQub25lKFwic2xpZFwiLGZ1bmN0aW9uKCl7ci50byh0KX0pOm49PXQ/dGhpcy5wYXVzZSgpLmN5Y2xlKCk6dGhpcy5zbGlkZSh0Pm4/XCJuZXh0XCI6XCJwcmV2XCIsZSh0aGlzLiRpdGVtc1t0XSkpfSxwYXVzZTpmdW5jdGlvbih0KXtyZXR1cm4gdHx8KHRoaXMucGF1c2VkPSEwKSx0aGlzLiRlbGVtZW50LmZpbmQoXCIubmV4dCwgLnByZXZcIikubGVuZ3RoJiZlLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQmJih0aGlzLiRlbGVtZW50LnRyaWdnZXIoZS5zdXBwb3J0LnRyYW5zaXRpb24uZW5kKSx0aGlzLmN5Y2xlKCEwKSksY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsKSx0aGlzLmludGVydmFsPW51bGwsdGhpc30sbmV4dDpmdW5jdGlvbigpe2lmKHRoaXMuc2xpZGluZylyZXR1cm47cmV0dXJuIHRoaXMuc2xpZGUoXCJuZXh0XCIpfSxwcmV2OmZ1bmN0aW9uKCl7aWYodGhpcy5zbGlkaW5nKXJldHVybjtyZXR1cm4gdGhpcy5zbGlkZShcInByZXZcIil9LHNsaWRlOmZ1bmN0aW9uKHQsbil7dmFyIHI9dGhpcy4kZWxlbWVudC5maW5kKFwiLml0ZW0uYWN0aXZlXCIpLGk9bnx8clt0XSgpLHM9dGhpcy5pbnRlcnZhbCxvPXQ9PVwibmV4dFwiP1wibGVmdFwiOlwicmlnaHRcIix1PXQ9PVwibmV4dFwiP1wiZmlyc3RcIjpcImxhc3RcIixhPXRoaXMsZjt0aGlzLnNsaWRpbmc9ITAscyYmdGhpcy5wYXVzZSgpLGk9aS5sZW5ndGg/aTp0aGlzLiRlbGVtZW50LmZpbmQoXCIuaXRlbVwiKVt1XSgpLGY9ZS5FdmVudChcInNsaWRlXCIse3JlbGF0ZWRUYXJnZXQ6aVswXSxkaXJlY3Rpb246b30pO2lmKGkuaGFzQ2xhc3MoXCJhY3RpdmVcIikpcmV0dXJuO3RoaXMuJGluZGljYXRvcnMubGVuZ3RoJiYodGhpcy4kaW5kaWNhdG9ycy5maW5kKFwiLmFjdGl2ZVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKSx0aGlzLiRlbGVtZW50Lm9uZShcInNsaWRcIixmdW5jdGlvbigpe3ZhciB0PWUoYS4kaW5kaWNhdG9ycy5jaGlsZHJlbigpW2EuZ2V0QWN0aXZlSW5kZXgoKV0pO3QmJnQuYWRkQ2xhc3MoXCJhY3RpdmVcIil9KSk7aWYoZS5zdXBwb3J0LnRyYW5zaXRpb24mJnRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoXCJzbGlkZVwiKSl7dGhpcy4kZWxlbWVudC50cmlnZ2VyKGYpO2lmKGYuaXNEZWZhdWx0UHJldmVudGVkKCkpcmV0dXJuO2kuYWRkQ2xhc3ModCksaVswXS5vZmZzZXRXaWR0aCxyLmFkZENsYXNzKG8pLGkuYWRkQ2xhc3MobyksdGhpcy4kZWxlbWVudC5vbmUoZS5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLGZ1bmN0aW9uKCl7aS5yZW1vdmVDbGFzcyhbdCxvXS5qb2luKFwiIFwiKSkuYWRkQ2xhc3MoXCJhY3RpdmVcIiksci5yZW1vdmVDbGFzcyhbXCJhY3RpdmVcIixvXS5qb2luKFwiIFwiKSksYS5zbGlkaW5nPSExLHNldFRpbWVvdXQoZnVuY3Rpb24oKXthLiRlbGVtZW50LnRyaWdnZXIoXCJzbGlkXCIpfSwwKX0pfWVsc2V7dGhpcy4kZWxlbWVudC50cmlnZ2VyKGYpO2lmKGYuaXNEZWZhdWx0UHJldmVudGVkKCkpcmV0dXJuO3IucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIiksaS5hZGRDbGFzcyhcImFjdGl2ZVwiKSx0aGlzLnNsaWRpbmc9ITEsdGhpcy4kZWxlbWVudC50cmlnZ2VyKFwic2xpZFwiKX1yZXR1cm4gcyYmdGhpcy5jeWNsZSgpLHRoaXN9fTt2YXIgbj1lLmZuLmNhcm91c2VsO2UuZm4uY2Fyb3VzZWw9ZnVuY3Rpb24obil7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciByPWUodGhpcyksaT1yLmRhdGEoXCJjYXJvdXNlbFwiKSxzPWUuZXh0ZW5kKHt9LGUuZm4uY2Fyb3VzZWwuZGVmYXVsdHMsdHlwZW9mIG49PVwib2JqZWN0XCImJm4pLG89dHlwZW9mIG49PVwic3RyaW5nXCI/bjpzLnNsaWRlO2l8fHIuZGF0YShcImNhcm91c2VsXCIsaT1uZXcgdCh0aGlzLHMpKSx0eXBlb2Ygbj09XCJudW1iZXJcIj9pLnRvKG4pOm8/aVtvXSgpOnMuaW50ZXJ2YWwmJmkucGF1c2UoKS5jeWNsZSgpfSl9LGUuZm4uY2Fyb3VzZWwuZGVmYXVsdHM9e2ludGVydmFsOjVlMyxwYXVzZTpcImhvdmVyXCJ9LGUuZm4uY2Fyb3VzZWwuQ29uc3RydWN0b3I9dCxlLmZuLmNhcm91c2VsLm5vQ29uZmxpY3Q9ZnVuY3Rpb24oKXtyZXR1cm4gZS5mbi5jYXJvdXNlbD1uLHRoaXN9LGUoZG9jdW1lbnQpLm9uKFwiY2xpY2suY2Fyb3VzZWwuZGF0YS1hcGlcIixcIltkYXRhLXNsaWRlXSwgW2RhdGEtc2xpZGUtdG9dXCIsZnVuY3Rpb24odCl7dmFyIG49ZSh0aGlzKSxyLGk9ZShuLmF0dHIoXCJkYXRhLXRhcmdldFwiKXx8KHI9bi5hdHRyKFwiaHJlZlwiKSkmJnIucmVwbGFjZSgvLiooPz0jW15cXHNdKyQpLyxcIlwiKSkscz1lLmV4dGVuZCh7fSxpLmRhdGEoKSxuLmRhdGEoKSksbztpLmNhcm91c2VsKHMpLChvPW4uYXR0cihcImRhdGEtc2xpZGUtdG9cIikpJiZpLmRhdGEoXCJjYXJvdXNlbFwiKS5wYXVzZSgpLnRvKG8pLmN5Y2xlKCksdC5wcmV2ZW50RGVmYXVsdCgpfSl9KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjt2YXIgdD1mdW5jdGlvbih0LG4pe3RoaXMuJGVsZW1lbnQ9ZSh0KSx0aGlzLm9wdGlvbnM9ZS5leHRlbmQoe30sZS5mbi5jb2xsYXBzZS5kZWZhdWx0cyxuKSx0aGlzLm9wdGlvbnMucGFyZW50JiYodGhpcy4kcGFyZW50PWUodGhpcy5vcHRpb25zLnBhcmVudCkpLHRoaXMub3B0aW9ucy50b2dnbGUmJnRoaXMudG9nZ2xlKCl9O3QucHJvdG90eXBlPXtjb25zdHJ1Y3Rvcjp0LGRpbWVuc2lvbjpmdW5jdGlvbigpe3ZhciBlPXRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoXCJ3aWR0aFwiKTtyZXR1cm4gZT9cIndpZHRoXCI6XCJoZWlnaHRcIn0sc2hvdzpmdW5jdGlvbigpe3ZhciB0LG4scixpO2lmKHRoaXMudHJhbnNpdGlvbmluZ3x8dGhpcy4kZWxlbWVudC5oYXNDbGFzcyhcImluXCIpKXJldHVybjt0PXRoaXMuZGltZW5zaW9uKCksbj1lLmNhbWVsQ2FzZShbXCJzY3JvbGxcIix0XS5qb2luKFwiLVwiKSkscj10aGlzLiRwYXJlbnQmJnRoaXMuJHBhcmVudC5maW5kKFwiPiAuYWNjb3JkaW9uLWdyb3VwID4gLmluXCIpO2lmKHImJnIubGVuZ3RoKXtpPXIuZGF0YShcImNvbGxhcHNlXCIpO2lmKGkmJmkudHJhbnNpdGlvbmluZylyZXR1cm47ci5jb2xsYXBzZShcImhpZGVcIiksaXx8ci5kYXRhKFwiY29sbGFwc2VcIixudWxsKX10aGlzLiRlbGVtZW50W3RdKDApLHRoaXMudHJhbnNpdGlvbihcImFkZENsYXNzXCIsZS5FdmVudChcInNob3dcIiksXCJzaG93blwiKSxlLnN1cHBvcnQudHJhbnNpdGlvbiYmdGhpcy4kZWxlbWVudFt0XSh0aGlzLiRlbGVtZW50WzBdW25dKX0saGlkZTpmdW5jdGlvbigpe3ZhciB0O2lmKHRoaXMudHJhbnNpdGlvbmluZ3x8IXRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoXCJpblwiKSlyZXR1cm47dD10aGlzLmRpbWVuc2lvbigpLHRoaXMucmVzZXQodGhpcy4kZWxlbWVudFt0XSgpKSx0aGlzLnRyYW5zaXRpb24oXCJyZW1vdmVDbGFzc1wiLGUuRXZlbnQoXCJoaWRlXCIpLFwiaGlkZGVuXCIpLHRoaXMuJGVsZW1lbnRbdF0oMCl9LHJlc2V0OmZ1bmN0aW9uKGUpe3ZhciB0PXRoaXMuZGltZW5zaW9uKCk7cmV0dXJuIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoXCJjb2xsYXBzZVwiKVt0XShlfHxcImF1dG9cIilbMF0ub2Zmc2V0V2lkdGgsdGhpcy4kZWxlbWVudFtlIT09bnVsbD9cImFkZENsYXNzXCI6XCJyZW1vdmVDbGFzc1wiXShcImNvbGxhcHNlXCIpLHRoaXN9LHRyYW5zaXRpb246ZnVuY3Rpb24odCxuLHIpe3ZhciBpPXRoaXMscz1mdW5jdGlvbigpe24udHlwZT09XCJzaG93XCImJmkucmVzZXQoKSxpLnRyYW5zaXRpb25pbmc9MCxpLiRlbGVtZW50LnRyaWdnZXIocil9O3RoaXMuJGVsZW1lbnQudHJpZ2dlcihuKTtpZihuLmlzRGVmYXVsdFByZXZlbnRlZCgpKXJldHVybjt0aGlzLnRyYW5zaXRpb25pbmc9MSx0aGlzLiRlbGVtZW50W3RdKFwiaW5cIiksZS5zdXBwb3J0LnRyYW5zaXRpb24mJnRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoXCJjb2xsYXBzZVwiKT90aGlzLiRlbGVtZW50Lm9uZShlLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQscyk6cygpfSx0b2dnbGU6ZnVuY3Rpb24oKXt0aGlzW3RoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoXCJpblwiKT9cImhpZGVcIjpcInNob3dcIl0oKX19O3ZhciBuPWUuZm4uY29sbGFwc2U7ZS5mbi5jb2xsYXBzZT1mdW5jdGlvbihuKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHI9ZSh0aGlzKSxpPXIuZGF0YShcImNvbGxhcHNlXCIpLHM9ZS5leHRlbmQoe30sZS5mbi5jb2xsYXBzZS5kZWZhdWx0cyxyLmRhdGEoKSx0eXBlb2Ygbj09XCJvYmplY3RcIiYmbik7aXx8ci5kYXRhKFwiY29sbGFwc2VcIixpPW5ldyB0KHRoaXMscykpLHR5cGVvZiBuPT1cInN0cmluZ1wiJiZpW25dKCl9KX0sZS5mbi5jb2xsYXBzZS5kZWZhdWx0cz17dG9nZ2xlOiEwfSxlLmZuLmNvbGxhcHNlLkNvbnN0cnVjdG9yPXQsZS5mbi5jb2xsYXBzZS5ub0NvbmZsaWN0PWZ1bmN0aW9uKCl7cmV0dXJuIGUuZm4uY29sbGFwc2U9bix0aGlzfSxlKGRvY3VtZW50KS5vbihcImNsaWNrLmNvbGxhcHNlLmRhdGEtYXBpXCIsXCJbZGF0YS10b2dnbGU9Y29sbGFwc2VdXCIsZnVuY3Rpb24odCl7dmFyIG49ZSh0aGlzKSxyLGk9bi5hdHRyKFwiZGF0YS10YXJnZXRcIil8fHQucHJldmVudERlZmF1bHQoKXx8KHI9bi5hdHRyKFwiaHJlZlwiKSkmJnIucmVwbGFjZSgvLiooPz0jW15cXHNdKyQpLyxcIlwiKSxzPWUoaSkuZGF0YShcImNvbGxhcHNlXCIpP1widG9nZ2xlXCI6bi5kYXRhKCk7bltlKGkpLmhhc0NsYXNzKFwiaW5cIik/XCJhZGRDbGFzc1wiOlwicmVtb3ZlQ2xhc3NcIl0oXCJjb2xsYXBzZWRcIiksZShpKS5jb2xsYXBzZShzKX0pfSh3aW5kb3cualF1ZXJ5KSwhZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcigpe2UodCkuZWFjaChmdW5jdGlvbigpe2koZSh0aGlzKSkucmVtb3ZlQ2xhc3MoXCJvcGVuXCIpfSl9ZnVuY3Rpb24gaSh0KXt2YXIgbj10LmF0dHIoXCJkYXRhLXRhcmdldFwiKSxyO258fChuPXQuYXR0cihcImhyZWZcIiksbj1uJiYvIy8udGVzdChuKSYmbi5yZXBsYWNlKC8uKig/PSNbXlxcc10qJCkvLFwiXCIpKSxyPW4mJmUobik7aWYoIXJ8fCFyLmxlbmd0aClyPXQucGFyZW50KCk7cmV0dXJuIHJ9dmFyIHQ9XCJbZGF0YS10b2dnbGU9ZHJvcGRvd25dXCIsbj1mdW5jdGlvbih0KXt2YXIgbj1lKHQpLm9uKFwiY2xpY2suZHJvcGRvd24uZGF0YS1hcGlcIix0aGlzLnRvZ2dsZSk7ZShcImh0bWxcIikub24oXCJjbGljay5kcm9wZG93bi5kYXRhLWFwaVwiLGZ1bmN0aW9uKCl7bi5wYXJlbnQoKS5yZW1vdmVDbGFzcyhcIm9wZW5cIil9KX07bi5wcm90b3R5cGU9e2NvbnN0cnVjdG9yOm4sdG9nZ2xlOmZ1bmN0aW9uKHQpe3ZhciBuPWUodGhpcykscyxvO2lmKG4uaXMoXCIuZGlzYWJsZWQsIDpkaXNhYmxlZFwiKSlyZXR1cm47cmV0dXJuIHM9aShuKSxvPXMuaGFzQ2xhc3MoXCJvcGVuXCIpLHIoKSxvfHxzLnRvZ2dsZUNsYXNzKFwib3BlblwiKSxuLmZvY3VzKCksITF9LGtleWRvd246ZnVuY3Rpb24obil7dmFyIHIscyxvLHUsYSxmO2lmKCEvKDM4fDQwfDI3KS8udGVzdChuLmtleUNvZGUpKXJldHVybjtyPWUodGhpcyksbi5wcmV2ZW50RGVmYXVsdCgpLG4uc3RvcFByb3BhZ2F0aW9uKCk7aWYoci5pcyhcIi5kaXNhYmxlZCwgOmRpc2FibGVkXCIpKXJldHVybjt1PWkociksYT11Lmhhc0NsYXNzKFwib3BlblwiKTtpZighYXx8YSYmbi5rZXlDb2RlPT0yNylyZXR1cm4gbi53aGljaD09MjcmJnUuZmluZCh0KS5mb2N1cygpLHIuY2xpY2soKTtzPWUoXCJbcm9sZT1tZW51XSBsaTpub3QoLmRpdmlkZXIpOnZpc2libGUgYVwiLHUpO2lmKCFzLmxlbmd0aClyZXR1cm47Zj1zLmluZGV4KHMuZmlsdGVyKFwiOmZvY3VzXCIpKSxuLmtleUNvZGU9PTM4JiZmPjAmJmYtLSxuLmtleUNvZGU9PTQwJiZmPHMubGVuZ3RoLTEmJmYrKyx+Znx8KGY9MCkscy5lcShmKS5mb2N1cygpfX07dmFyIHM9ZS5mbi5kcm9wZG93bjtlLmZuLmRyb3Bkb3duPWZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgcj1lKHRoaXMpLGk9ci5kYXRhKFwiZHJvcGRvd25cIik7aXx8ci5kYXRhKFwiZHJvcGRvd25cIixpPW5ldyBuKHRoaXMpKSx0eXBlb2YgdD09XCJzdHJpbmdcIiYmaVt0XS5jYWxsKHIpfSl9LGUuZm4uZHJvcGRvd24uQ29uc3RydWN0b3I9bixlLmZuLmRyb3Bkb3duLm5vQ29uZmxpY3Q9ZnVuY3Rpb24oKXtyZXR1cm4gZS5mbi5kcm9wZG93bj1zLHRoaXN9LGUoZG9jdW1lbnQpLm9uKFwiY2xpY2suZHJvcGRvd24uZGF0YS1hcGlcIixyKS5vbihcImNsaWNrLmRyb3Bkb3duLmRhdGEtYXBpXCIsXCIuZHJvcGRvd24gZm9ybVwiLGZ1bmN0aW9uKGUpe2Uuc3RvcFByb3BhZ2F0aW9uKCl9KS5vbihcImNsaWNrLmRyb3Bkb3duLW1lbnVcIixmdW5jdGlvbihlKXtlLnN0b3BQcm9wYWdhdGlvbigpfSkub24oXCJjbGljay5kcm9wZG93bi5kYXRhLWFwaVwiLHQsbi5wcm90b3R5cGUudG9nZ2xlKS5vbihcImtleWRvd24uZHJvcGRvd24uZGF0YS1hcGlcIix0K1wiLCBbcm9sZT1tZW51XVwiLG4ucHJvdG90eXBlLmtleWRvd24pfSh3aW5kb3cualF1ZXJ5KSwhZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7dmFyIHQ9ZnVuY3Rpb24odCxuKXt0aGlzLm9wdGlvbnM9bix0aGlzLiRlbGVtZW50PWUodCkuZGVsZWdhdGUoJ1tkYXRhLWRpc21pc3M9XCJtb2RhbFwiXScsXCJjbGljay5kaXNtaXNzLm1vZGFsXCIsZS5wcm94eSh0aGlzLmhpZGUsdGhpcykpLHRoaXMub3B0aW9ucy5yZW1vdGUmJnRoaXMuJGVsZW1lbnQuZmluZChcIi5tb2RhbC1ib2R5XCIpLmxvYWQodGhpcy5vcHRpb25zLnJlbW90ZSl9O3QucHJvdG90eXBlPXtjb25zdHJ1Y3Rvcjp0LHRvZ2dsZTpmdW5jdGlvbigpe3JldHVybiB0aGlzW3RoaXMuaXNTaG93bj9cImhpZGVcIjpcInNob3dcIl0oKX0sc2hvdzpmdW5jdGlvbigpe3ZhciB0PXRoaXMsbj1lLkV2ZW50KFwic2hvd1wiKTt0aGlzLiRlbGVtZW50LnRyaWdnZXIobik7aWYodGhpcy5pc1Nob3dufHxuLmlzRGVmYXVsdFByZXZlbnRlZCgpKXJldHVybjt0aGlzLmlzU2hvd249ITAsdGhpcy5lc2NhcGUoKSx0aGlzLmJhY2tkcm9wKGZ1bmN0aW9uKCl7dmFyIG49ZS5zdXBwb3J0LnRyYW5zaXRpb24mJnQuJGVsZW1lbnQuaGFzQ2xhc3MoXCJmYWRlXCIpO3QuJGVsZW1lbnQucGFyZW50KCkubGVuZ3RofHx0LiRlbGVtZW50LmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpLHQuJGVsZW1lbnQuc2hvdygpLG4mJnQuJGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGgsdC4kZWxlbWVudC5hZGRDbGFzcyhcImluXCIpLmF0dHIoXCJhcmlhLWhpZGRlblwiLCExKSx0LmVuZm9yY2VGb2N1cygpLG4/dC4kZWxlbWVudC5vbmUoZS5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLGZ1bmN0aW9uKCl7dC4kZWxlbWVudC5mb2N1cygpLnRyaWdnZXIoXCJzaG93blwiKX0pOnQuJGVsZW1lbnQuZm9jdXMoKS50cmlnZ2VyKFwic2hvd25cIil9KX0saGlkZTpmdW5jdGlvbih0KXt0JiZ0LnByZXZlbnREZWZhdWx0KCk7dmFyIG49dGhpczt0PWUuRXZlbnQoXCJoaWRlXCIpLHRoaXMuJGVsZW1lbnQudHJpZ2dlcih0KTtpZighdGhpcy5pc1Nob3dufHx0LmlzRGVmYXVsdFByZXZlbnRlZCgpKXJldHVybjt0aGlzLmlzU2hvd249ITEsdGhpcy5lc2NhcGUoKSxlKGRvY3VtZW50KS5vZmYoXCJmb2N1c2luLm1vZGFsXCIpLHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoXCJpblwiKS5hdHRyKFwiYXJpYS1oaWRkZW5cIiwhMCksZS5zdXBwb3J0LnRyYW5zaXRpb24mJnRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoXCJmYWRlXCIpP3RoaXMuaGlkZVdpdGhUcmFuc2l0aW9uKCk6dGhpcy5oaWRlTW9kYWwoKX0sZW5mb3JjZUZvY3VzOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcztlKGRvY3VtZW50KS5vbihcImZvY3VzaW4ubW9kYWxcIixmdW5jdGlvbihlKXt0LiRlbGVtZW50WzBdIT09ZS50YXJnZXQmJiF0LiRlbGVtZW50LmhhcyhlLnRhcmdldCkubGVuZ3RoJiZ0LiRlbGVtZW50LmZvY3VzKCl9KX0sZXNjYXBlOmZ1bmN0aW9uKCl7dmFyIGU9dGhpczt0aGlzLmlzU2hvd24mJnRoaXMub3B0aW9ucy5rZXlib2FyZD90aGlzLiRlbGVtZW50Lm9uKFwia2V5dXAuZGlzbWlzcy5tb2RhbFwiLGZ1bmN0aW9uKHQpe3Qud2hpY2g9PTI3JiZlLmhpZGUoKX0pOnRoaXMuaXNTaG93bnx8dGhpcy4kZWxlbWVudC5vZmYoXCJrZXl1cC5kaXNtaXNzLm1vZGFsXCIpfSxoaWRlV2l0aFRyYW5zaXRpb246ZnVuY3Rpb24oKXt2YXIgdD10aGlzLG49c2V0VGltZW91dChmdW5jdGlvbigpe3QuJGVsZW1lbnQub2ZmKGUuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCksdC5oaWRlTW9kYWwoKX0sNTAwKTt0aGlzLiRlbGVtZW50Lm9uZShlLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsZnVuY3Rpb24oKXtjbGVhclRpbWVvdXQobiksdC5oaWRlTW9kYWwoKX0pfSxoaWRlTW9kYWw6ZnVuY3Rpb24oKXt2YXIgZT10aGlzO3RoaXMuJGVsZW1lbnQuaGlkZSgpLHRoaXMuYmFja2Ryb3AoZnVuY3Rpb24oKXtlLnJlbW92ZUJhY2tkcm9wKCksZS4kZWxlbWVudC50cmlnZ2VyKFwiaGlkZGVuXCIpfSl9LHJlbW92ZUJhY2tkcm9wOmZ1bmN0aW9uKCl7dGhpcy4kYmFja2Ryb3AmJnRoaXMuJGJhY2tkcm9wLnJlbW92ZSgpLHRoaXMuJGJhY2tkcm9wPW51bGx9LGJhY2tkcm9wOmZ1bmN0aW9uKHQpe3ZhciBuPXRoaXMscj10aGlzLiRlbGVtZW50Lmhhc0NsYXNzKFwiZmFkZVwiKT9cImZhZGVcIjpcIlwiO2lmKHRoaXMuaXNTaG93biYmdGhpcy5vcHRpb25zLmJhY2tkcm9wKXt2YXIgaT1lLnN1cHBvcnQudHJhbnNpdGlvbiYmcjt0aGlzLiRiYWNrZHJvcD1lKCc8ZGl2IGNsYXNzPVwibW9kYWwtYmFja2Ryb3AgJytyKydcIiAvPicpLmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpLHRoaXMuJGJhY2tkcm9wLmNsaWNrKHRoaXMub3B0aW9ucy5iYWNrZHJvcD09XCJzdGF0aWNcIj9lLnByb3h5KHRoaXMuJGVsZW1lbnRbMF0uZm9jdXMsdGhpcy4kZWxlbWVudFswXSk6ZS5wcm94eSh0aGlzLmhpZGUsdGhpcykpLGkmJnRoaXMuJGJhY2tkcm9wWzBdLm9mZnNldFdpZHRoLHRoaXMuJGJhY2tkcm9wLmFkZENsYXNzKFwiaW5cIik7aWYoIXQpcmV0dXJuO2k/dGhpcy4kYmFja2Ryb3Aub25lKGUuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCx0KTp0KCl9ZWxzZSF0aGlzLmlzU2hvd24mJnRoaXMuJGJhY2tkcm9wPyh0aGlzLiRiYWNrZHJvcC5yZW1vdmVDbGFzcyhcImluXCIpLGUuc3VwcG9ydC50cmFuc2l0aW9uJiZ0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKFwiZmFkZVwiKT90aGlzLiRiYWNrZHJvcC5vbmUoZS5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLHQpOnQoKSk6dCYmdCgpfX07dmFyIG49ZS5mbi5tb2RhbDtlLmZuLm1vZGFsPWZ1bmN0aW9uKG4pe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgcj1lKHRoaXMpLGk9ci5kYXRhKFwibW9kYWxcIikscz1lLmV4dGVuZCh7fSxlLmZuLm1vZGFsLmRlZmF1bHRzLHIuZGF0YSgpLHR5cGVvZiBuPT1cIm9iamVjdFwiJiZuKTtpfHxyLmRhdGEoXCJtb2RhbFwiLGk9bmV3IHQodGhpcyxzKSksdHlwZW9mIG49PVwic3RyaW5nXCI/aVtuXSgpOnMuc2hvdyYmaS5zaG93KCl9KX0sZS5mbi5tb2RhbC5kZWZhdWx0cz17YmFja2Ryb3A6ITAsa2V5Ym9hcmQ6ITAsc2hvdzohMH0sZS5mbi5tb2RhbC5Db25zdHJ1Y3Rvcj10LGUuZm4ubW9kYWwubm9Db25mbGljdD1mdW5jdGlvbigpe3JldHVybiBlLmZuLm1vZGFsPW4sdGhpc30sZShkb2N1bWVudCkub24oXCJjbGljay5tb2RhbC5kYXRhLWFwaVwiLCdbZGF0YS10b2dnbGU9XCJtb2RhbFwiXScsZnVuY3Rpb24odCl7dmFyIG49ZSh0aGlzKSxyPW4uYXR0cihcImhyZWZcIiksaT1lKG4uYXR0cihcImRhdGEtdGFyZ2V0XCIpfHxyJiZyLnJlcGxhY2UoLy4qKD89I1teXFxzXSskKS8sXCJcIikpLHM9aS5kYXRhKFwibW9kYWxcIik/XCJ0b2dnbGVcIjplLmV4dGVuZCh7cmVtb3RlOiEvIy8udGVzdChyKSYmcn0saS5kYXRhKCksbi5kYXRhKCkpO3QucHJldmVudERlZmF1bHQoKSxpLm1vZGFsKHMpLm9uZShcImhpZGVcIixmdW5jdGlvbigpe24uZm9jdXMoKX0pfSl9KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjt2YXIgdD1mdW5jdGlvbihlLHQpe3RoaXMuaW5pdChcInRvb2x0aXBcIixlLHQpfTt0LnByb3RvdHlwZT17Y29uc3RydWN0b3I6dCxpbml0OmZ1bmN0aW9uKHQsbixyKXt2YXIgaSxzLG8sdSxhO3RoaXMudHlwZT10LHRoaXMuJGVsZW1lbnQ9ZShuKSx0aGlzLm9wdGlvbnM9dGhpcy5nZXRPcHRpb25zKHIpLHRoaXMuZW5hYmxlZD0hMCxvPXRoaXMub3B0aW9ucy50cmlnZ2VyLnNwbGl0KFwiIFwiKTtmb3IoYT1vLmxlbmd0aDthLS07KXU9b1thXSx1PT1cImNsaWNrXCI/dGhpcy4kZWxlbWVudC5vbihcImNsaWNrLlwiK3RoaXMudHlwZSx0aGlzLm9wdGlvbnMuc2VsZWN0b3IsZS5wcm94eSh0aGlzLnRvZ2dsZSx0aGlzKSk6dSE9XCJtYW51YWxcIiYmKGk9dT09XCJob3ZlclwiP1wibW91c2VlbnRlclwiOlwiZm9jdXNcIixzPXU9PVwiaG92ZXJcIj9cIm1vdXNlbGVhdmVcIjpcImJsdXJcIix0aGlzLiRlbGVtZW50Lm9uKGkrXCIuXCIrdGhpcy50eXBlLHRoaXMub3B0aW9ucy5zZWxlY3RvcixlLnByb3h5KHRoaXMuZW50ZXIsdGhpcykpLHRoaXMuJGVsZW1lbnQub24ocytcIi5cIit0aGlzLnR5cGUsdGhpcy5vcHRpb25zLnNlbGVjdG9yLGUucHJveHkodGhpcy5sZWF2ZSx0aGlzKSkpO3RoaXMub3B0aW9ucy5zZWxlY3Rvcj90aGlzLl9vcHRpb25zPWUuZXh0ZW5kKHt9LHRoaXMub3B0aW9ucyx7dHJpZ2dlcjpcIm1hbnVhbFwiLHNlbGVjdG9yOlwiXCJ9KTp0aGlzLmZpeFRpdGxlKCl9LGdldE9wdGlvbnM6ZnVuY3Rpb24odCl7cmV0dXJuIHQ9ZS5leHRlbmQoe30sZS5mblt0aGlzLnR5cGVdLmRlZmF1bHRzLHRoaXMuJGVsZW1lbnQuZGF0YSgpLHQpLHQuZGVsYXkmJnR5cGVvZiB0LmRlbGF5PT1cIm51bWJlclwiJiYodC5kZWxheT17c2hvdzp0LmRlbGF5LGhpZGU6dC5kZWxheX0pLHR9LGVudGVyOmZ1bmN0aW9uKHQpe3ZhciBuPWUuZm5bdGhpcy50eXBlXS5kZWZhdWx0cyxyPXt9LGk7dGhpcy5fb3B0aW9ucyYmZS5lYWNoKHRoaXMuX29wdGlvbnMsZnVuY3Rpb24oZSx0KXtuW2VdIT10JiYocltlXT10KX0sdGhpcyksaT1lKHQuY3VycmVudFRhcmdldClbdGhpcy50eXBlXShyKS5kYXRhKHRoaXMudHlwZSk7aWYoIWkub3B0aW9ucy5kZWxheXx8IWkub3B0aW9ucy5kZWxheS5zaG93KXJldHVybiBpLnNob3coKTtjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KSxpLmhvdmVyU3RhdGU9XCJpblwiLHRoaXMudGltZW91dD1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7aS5ob3ZlclN0YXRlPT1cImluXCImJmkuc2hvdygpfSxpLm9wdGlvbnMuZGVsYXkuc2hvdyl9LGxlYXZlOmZ1bmN0aW9uKHQpe3ZhciBuPWUodC5jdXJyZW50VGFyZ2V0KVt0aGlzLnR5cGVdKHRoaXMuX29wdGlvbnMpLmRhdGEodGhpcy50eXBlKTt0aGlzLnRpbWVvdXQmJmNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO2lmKCFuLm9wdGlvbnMuZGVsYXl8fCFuLm9wdGlvbnMuZGVsYXkuaGlkZSlyZXR1cm4gbi5oaWRlKCk7bi5ob3ZlclN0YXRlPVwib3V0XCIsdGhpcy50aW1lb3V0PXNldFRpbWVvdXQoZnVuY3Rpb24oKXtuLmhvdmVyU3RhdGU9PVwib3V0XCImJm4uaGlkZSgpfSxuLm9wdGlvbnMuZGVsYXkuaGlkZSl9LHNob3c6ZnVuY3Rpb24oKXt2YXIgdCxuLHIsaSxzLG8sdT1lLkV2ZW50KFwic2hvd1wiKTtpZih0aGlzLmhhc0NvbnRlbnQoKSYmdGhpcy5lbmFibGVkKXt0aGlzLiRlbGVtZW50LnRyaWdnZXIodSk7aWYodS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSlyZXR1cm47dD10aGlzLnRpcCgpLHRoaXMuc2V0Q29udGVudCgpLHRoaXMub3B0aW9ucy5hbmltYXRpb24mJnQuYWRkQ2xhc3MoXCJmYWRlXCIpLHM9dHlwZW9mIHRoaXMub3B0aW9ucy5wbGFjZW1lbnQ9PVwiZnVuY3Rpb25cIj90aGlzLm9wdGlvbnMucGxhY2VtZW50LmNhbGwodGhpcyx0WzBdLHRoaXMuJGVsZW1lbnRbMF0pOnRoaXMub3B0aW9ucy5wbGFjZW1lbnQsdC5kZXRhY2goKS5jc3Moe3RvcDowLGxlZnQ6MCxkaXNwbGF5OlwiYmxvY2tcIn0pLHRoaXMub3B0aW9ucy5jb250YWluZXI/dC5hcHBlbmRUbyh0aGlzLm9wdGlvbnMuY29udGFpbmVyKTp0Lmluc2VydEFmdGVyKHRoaXMuJGVsZW1lbnQpLG49dGhpcy5nZXRQb3NpdGlvbigpLHI9dFswXS5vZmZzZXRXaWR0aCxpPXRbMF0ub2Zmc2V0SGVpZ2h0O3N3aXRjaChzKXtjYXNlXCJib3R0b21cIjpvPXt0b3A6bi50b3Arbi5oZWlnaHQsbGVmdDpuLmxlZnQrbi53aWR0aC8yLXIvMn07YnJlYWs7Y2FzZVwidG9wXCI6bz17dG9wOm4udG9wLWksbGVmdDpuLmxlZnQrbi53aWR0aC8yLXIvMn07YnJlYWs7Y2FzZVwibGVmdFwiOm89e3RvcDpuLnRvcCtuLmhlaWdodC8yLWkvMixsZWZ0Om4ubGVmdC1yfTticmVhaztjYXNlXCJyaWdodFwiOm89e3RvcDpuLnRvcCtuLmhlaWdodC8yLWkvMixsZWZ0Om4ubGVmdCtuLndpZHRofX10aGlzLmFwcGx5UGxhY2VtZW50KG8scyksdGhpcy4kZWxlbWVudC50cmlnZ2VyKFwic2hvd25cIil9fSxhcHBseVBsYWNlbWVudDpmdW5jdGlvbihlLHQpe3ZhciBuPXRoaXMudGlwKCkscj1uWzBdLm9mZnNldFdpZHRoLGk9blswXS5vZmZzZXRIZWlnaHQscyxvLHUsYTtuLm9mZnNldChlKS5hZGRDbGFzcyh0KS5hZGRDbGFzcyhcImluXCIpLHM9blswXS5vZmZzZXRXaWR0aCxvPW5bMF0ub2Zmc2V0SGVpZ2h0LHQ9PVwidG9wXCImJm8hPWkmJihlLnRvcD1lLnRvcCtpLW8sYT0hMCksdD09XCJib3R0b21cInx8dD09XCJ0b3BcIj8odT0wLGUubGVmdDwwJiYodT1lLmxlZnQqLTIsZS5sZWZ0PTAsbi5vZmZzZXQoZSkscz1uWzBdLm9mZnNldFdpZHRoLG89blswXS5vZmZzZXRIZWlnaHQpLHRoaXMucmVwbGFjZUFycm93KHUtcitzLHMsXCJsZWZ0XCIpKTp0aGlzLnJlcGxhY2VBcnJvdyhvLWksbyxcInRvcFwiKSxhJiZuLm9mZnNldChlKX0scmVwbGFjZUFycm93OmZ1bmN0aW9uKGUsdCxuKXt0aGlzLmFycm93KCkuY3NzKG4sZT81MCooMS1lL3QpK1wiJVwiOlwiXCIpfSxzZXRDb250ZW50OmZ1bmN0aW9uKCl7dmFyIGU9dGhpcy50aXAoKSx0PXRoaXMuZ2V0VGl0bGUoKTtlLmZpbmQoXCIudG9vbHRpcC1pbm5lclwiKVt0aGlzLm9wdGlvbnMuaHRtbD9cImh0bWxcIjpcInRleHRcIl0odCksZS5yZW1vdmVDbGFzcyhcImZhZGUgaW4gdG9wIGJvdHRvbSBsZWZ0IHJpZ2h0XCIpfSxoaWRlOmZ1bmN0aW9uKCl7ZnVuY3Rpb24gaSgpe3ZhciB0PXNldFRpbWVvdXQoZnVuY3Rpb24oKXtuLm9mZihlLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQpLmRldGFjaCgpfSw1MDApO24ub25lKGUuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCxmdW5jdGlvbigpe2NsZWFyVGltZW91dCh0KSxuLmRldGFjaCgpfSl9dmFyIHQ9dGhpcyxuPXRoaXMudGlwKCkscj1lLkV2ZW50KFwiaGlkZVwiKTt0aGlzLiRlbGVtZW50LnRyaWdnZXIocik7aWYoci5pc0RlZmF1bHRQcmV2ZW50ZWQoKSlyZXR1cm47cmV0dXJuIG4ucmVtb3ZlQ2xhc3MoXCJpblwiKSxlLnN1cHBvcnQudHJhbnNpdGlvbiYmdGhpcy4kdGlwLmhhc0NsYXNzKFwiZmFkZVwiKT9pKCk6bi5kZXRhY2goKSx0aGlzLiRlbGVtZW50LnRyaWdnZXIoXCJoaWRkZW5cIiksdGhpc30sZml4VGl0bGU6ZnVuY3Rpb24oKXt2YXIgZT10aGlzLiRlbGVtZW50OyhlLmF0dHIoXCJ0aXRsZVwiKXx8dHlwZW9mIGUuYXR0cihcImRhdGEtb3JpZ2luYWwtdGl0bGVcIikhPVwic3RyaW5nXCIpJiZlLmF0dHIoXCJkYXRhLW9yaWdpbmFsLXRpdGxlXCIsZS5hdHRyKFwidGl0bGVcIil8fFwiXCIpLmF0dHIoXCJ0aXRsZVwiLFwiXCIpfSxoYXNDb250ZW50OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZ2V0VGl0bGUoKX0sZ2V0UG9zaXRpb246ZnVuY3Rpb24oKXt2YXIgdD10aGlzLiRlbGVtZW50WzBdO3JldHVybiBlLmV4dGVuZCh7fSx0eXBlb2YgdC5nZXRCb3VuZGluZ0NsaWVudFJlY3Q9PVwiZnVuY3Rpb25cIj90LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpOnt3aWR0aDp0Lm9mZnNldFdpZHRoLGhlaWdodDp0Lm9mZnNldEhlaWdodH0sdGhpcy4kZWxlbWVudC5vZmZzZXQoKSl9LGdldFRpdGxlOmZ1bmN0aW9uKCl7dmFyIGUsdD10aGlzLiRlbGVtZW50LG49dGhpcy5vcHRpb25zO3JldHVybiBlPXQuYXR0cihcImRhdGEtb3JpZ2luYWwtdGl0bGVcIil8fCh0eXBlb2Ygbi50aXRsZT09XCJmdW5jdGlvblwiP24udGl0bGUuY2FsbCh0WzBdKTpuLnRpdGxlKSxlfSx0aXA6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy4kdGlwPXRoaXMuJHRpcHx8ZSh0aGlzLm9wdGlvbnMudGVtcGxhdGUpfSxhcnJvdzpmdW5jdGlvbigpe3JldHVybiB0aGlzLiRhcnJvdz10aGlzLiRhcnJvd3x8dGhpcy50aXAoKS5maW5kKFwiLnRvb2x0aXAtYXJyb3dcIil9LHZhbGlkYXRlOmZ1bmN0aW9uKCl7dGhpcy4kZWxlbWVudFswXS5wYXJlbnROb2RlfHwodGhpcy5oaWRlKCksdGhpcy4kZWxlbWVudD1udWxsLHRoaXMub3B0aW9ucz1udWxsKX0sZW5hYmxlOmZ1bmN0aW9uKCl7dGhpcy5lbmFibGVkPSEwfSxkaXNhYmxlOmZ1bmN0aW9uKCl7dGhpcy5lbmFibGVkPSExfSx0b2dnbGVFbmFibGVkOmZ1bmN0aW9uKCl7dGhpcy5lbmFibGVkPSF0aGlzLmVuYWJsZWR9LHRvZ2dsZTpmdW5jdGlvbih0KXt2YXIgbj10P2UodC5jdXJyZW50VGFyZ2V0KVt0aGlzLnR5cGVdKHRoaXMuX29wdGlvbnMpLmRhdGEodGhpcy50eXBlKTp0aGlzO24udGlwKCkuaGFzQ2xhc3MoXCJpblwiKT9uLmhpZGUoKTpuLnNob3coKX0sZGVzdHJveTpmdW5jdGlvbigpe3RoaXMuaGlkZSgpLiRlbGVtZW50Lm9mZihcIi5cIit0aGlzLnR5cGUpLnJlbW92ZURhdGEodGhpcy50eXBlKX19O3ZhciBuPWUuZm4udG9vbHRpcDtlLmZuLnRvb2x0aXA9ZnVuY3Rpb24obil7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciByPWUodGhpcyksaT1yLmRhdGEoXCJ0b29sdGlwXCIpLHM9dHlwZW9mIG49PVwib2JqZWN0XCImJm47aXx8ci5kYXRhKFwidG9vbHRpcFwiLGk9bmV3IHQodGhpcyxzKSksdHlwZW9mIG49PVwic3RyaW5nXCImJmlbbl0oKX0pfSxlLmZuLnRvb2x0aXAuQ29uc3RydWN0b3I9dCxlLmZuLnRvb2x0aXAuZGVmYXVsdHM9e2FuaW1hdGlvbjohMCxwbGFjZW1lbnQ6XCJ0b3BcIixzZWxlY3RvcjohMSx0ZW1wbGF0ZTonPGRpdiBjbGFzcz1cInRvb2x0aXBcIj48ZGl2IGNsYXNzPVwidG9vbHRpcC1hcnJvd1wiPjwvZGl2PjxkaXYgY2xhc3M9XCJ0b29sdGlwLWlubmVyXCI+PC9kaXY+PC9kaXY+Jyx0cmlnZ2VyOlwiaG92ZXIgZm9jdXNcIix0aXRsZTpcIlwiLGRlbGF5OjAsaHRtbDohMSxjb250YWluZXI6ITF9LGUuZm4udG9vbHRpcC5ub0NvbmZsaWN0PWZ1bmN0aW9uKCl7cmV0dXJuIGUuZm4udG9vbHRpcD1uLHRoaXN9fSh3aW5kb3cualF1ZXJ5KSwhZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7dmFyIHQ9ZnVuY3Rpb24oZSx0KXt0aGlzLmluaXQoXCJwb3BvdmVyXCIsZSx0KX07dC5wcm90b3R5cGU9ZS5leHRlbmQoe30sZS5mbi50b29sdGlwLkNvbnN0cnVjdG9yLnByb3RvdHlwZSx7Y29uc3RydWN0b3I6dCxzZXRDb250ZW50OmZ1bmN0aW9uKCl7dmFyIGU9dGhpcy50aXAoKSx0PXRoaXMuZ2V0VGl0bGUoKSxuPXRoaXMuZ2V0Q29udGVudCgpO2UuZmluZChcIi5wb3BvdmVyLXRpdGxlXCIpW3RoaXMub3B0aW9ucy5odG1sP1wiaHRtbFwiOlwidGV4dFwiXSh0KSxlLmZpbmQoXCIucG9wb3Zlci1jb250ZW50XCIpW3RoaXMub3B0aW9ucy5odG1sP1wiaHRtbFwiOlwidGV4dFwiXShuKSxlLnJlbW92ZUNsYXNzKFwiZmFkZSB0b3AgYm90dG9tIGxlZnQgcmlnaHQgaW5cIil9LGhhc0NvbnRlbnQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5nZXRUaXRsZSgpfHx0aGlzLmdldENvbnRlbnQoKX0sZ2V0Q29udGVudDpmdW5jdGlvbigpe3ZhciBlLHQ9dGhpcy4kZWxlbWVudCxuPXRoaXMub3B0aW9ucztyZXR1cm4gZT0odHlwZW9mIG4uY29udGVudD09XCJmdW5jdGlvblwiP24uY29udGVudC5jYWxsKHRbMF0pOm4uY29udGVudCl8fHQuYXR0cihcImRhdGEtY29udGVudFwiKSxlfSx0aXA6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy4kdGlwfHwodGhpcy4kdGlwPWUodGhpcy5vcHRpb25zLnRlbXBsYXRlKSksdGhpcy4kdGlwfSxkZXN0cm95OmZ1bmN0aW9uKCl7dGhpcy5oaWRlKCkuJGVsZW1lbnQub2ZmKFwiLlwiK3RoaXMudHlwZSkucmVtb3ZlRGF0YSh0aGlzLnR5cGUpfX0pO3ZhciBuPWUuZm4ucG9wb3ZlcjtlLmZuLnBvcG92ZXI9ZnVuY3Rpb24obil7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciByPWUodGhpcyksaT1yLmRhdGEoXCJwb3BvdmVyXCIpLHM9dHlwZW9mIG49PVwib2JqZWN0XCImJm47aXx8ci5kYXRhKFwicG9wb3ZlclwiLGk9bmV3IHQodGhpcyxzKSksdHlwZW9mIG49PVwic3RyaW5nXCImJmlbbl0oKX0pfSxlLmZuLnBvcG92ZXIuQ29uc3RydWN0b3I9dCxlLmZuLnBvcG92ZXIuZGVmYXVsdHM9ZS5leHRlbmQoe30sZS5mbi50b29sdGlwLmRlZmF1bHRzLHtwbGFjZW1lbnQ6XCJyaWdodFwiLHRyaWdnZXI6XCJjbGlja1wiLGNvbnRlbnQ6XCJcIix0ZW1wbGF0ZTonPGRpdiBjbGFzcz1cInBvcG92ZXJcIj48ZGl2IGNsYXNzPVwiYXJyb3dcIj48L2Rpdj48aDMgY2xhc3M9XCJwb3BvdmVyLXRpdGxlXCI+PC9oMz48ZGl2IGNsYXNzPVwicG9wb3Zlci1jb250ZW50XCI+PC9kaXY+PC9kaXY+J30pLGUuZm4ucG9wb3Zlci5ub0NvbmZsaWN0PWZ1bmN0aW9uKCl7cmV0dXJuIGUuZm4ucG9wb3Zlcj1uLHRoaXN9fSh3aW5kb3cualF1ZXJ5KSwhZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gdCh0LG4pe3ZhciByPWUucHJveHkodGhpcy5wcm9jZXNzLHRoaXMpLGk9ZSh0KS5pcyhcImJvZHlcIik/ZSh3aW5kb3cpOmUodCksczt0aGlzLm9wdGlvbnM9ZS5leHRlbmQoe30sZS5mbi5zY3JvbGxzcHkuZGVmYXVsdHMsbiksdGhpcy4kc2Nyb2xsRWxlbWVudD1pLm9uKFwic2Nyb2xsLnNjcm9sbC1zcHkuZGF0YS1hcGlcIixyKSx0aGlzLnNlbGVjdG9yPSh0aGlzLm9wdGlvbnMudGFyZ2V0fHwocz1lKHQpLmF0dHIoXCJocmVmXCIpKSYmcy5yZXBsYWNlKC8uKig/PSNbXlxcc10rJCkvLFwiXCIpfHxcIlwiKStcIiAubmF2IGxpID4gYVwiLHRoaXMuJGJvZHk9ZShcImJvZHlcIiksdGhpcy5yZWZyZXNoKCksdGhpcy5wcm9jZXNzKCl9dC5wcm90b3R5cGU9e2NvbnN0cnVjdG9yOnQscmVmcmVzaDpmdW5jdGlvbigpe3ZhciB0PXRoaXMsbjt0aGlzLm9mZnNldHM9ZShbXSksdGhpcy50YXJnZXRzPWUoW10pLG49dGhpcy4kYm9keS5maW5kKHRoaXMuc2VsZWN0b3IpLm1hcChmdW5jdGlvbigpe3ZhciBuPWUodGhpcykscj1uLmRhdGEoXCJ0YXJnZXRcIil8fG4uYXR0cihcImhyZWZcIiksaT0vXiNcXHcvLnRlc3QocikmJmUocik7cmV0dXJuIGkmJmkubGVuZ3RoJiZbW2kucG9zaXRpb24oKS50b3ArKCFlLmlzV2luZG93KHQuJHNjcm9sbEVsZW1lbnQuZ2V0KDApKSYmdC4kc2Nyb2xsRWxlbWVudC5zY3JvbGxUb3AoKSkscl1dfHxudWxsfSkuc29ydChmdW5jdGlvbihlLHQpe3JldHVybiBlWzBdLXRbMF19KS5lYWNoKGZ1bmN0aW9uKCl7dC5vZmZzZXRzLnB1c2godGhpc1swXSksdC50YXJnZXRzLnB1c2godGhpc1sxXSl9KX0scHJvY2VzczpmdW5jdGlvbigpe3ZhciBlPXRoaXMuJHNjcm9sbEVsZW1lbnQuc2Nyb2xsVG9wKCkrdGhpcy5vcHRpb25zLm9mZnNldCx0PXRoaXMuJHNjcm9sbEVsZW1lbnRbMF0uc2Nyb2xsSGVpZ2h0fHx0aGlzLiRib2R5WzBdLnNjcm9sbEhlaWdodCxuPXQtdGhpcy4kc2Nyb2xsRWxlbWVudC5oZWlnaHQoKSxyPXRoaXMub2Zmc2V0cyxpPXRoaXMudGFyZ2V0cyxzPXRoaXMuYWN0aXZlVGFyZ2V0LG87aWYoZT49bilyZXR1cm4gcyE9KG89aS5sYXN0KClbMF0pJiZ0aGlzLmFjdGl2YXRlKG8pO2ZvcihvPXIubGVuZ3RoO28tLTspcyE9aVtvXSYmZT49cltvXSYmKCFyW28rMV18fGU8PXJbbysxXSkmJnRoaXMuYWN0aXZhdGUoaVtvXSl9LGFjdGl2YXRlOmZ1bmN0aW9uKHQpe3ZhciBuLHI7dGhpcy5hY3RpdmVUYXJnZXQ9dCxlKHRoaXMuc2VsZWN0b3IpLnBhcmVudChcIi5hY3RpdmVcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIikscj10aGlzLnNlbGVjdG9yKydbZGF0YS10YXJnZXQ9XCInK3QrJ1wiXSwnK3RoaXMuc2VsZWN0b3IrJ1tocmVmPVwiJyt0KydcIl0nLG49ZShyKS5wYXJlbnQoXCJsaVwiKS5hZGRDbGFzcyhcImFjdGl2ZVwiKSxuLnBhcmVudChcIi5kcm9wZG93bi1tZW51XCIpLmxlbmd0aCYmKG49bi5jbG9zZXN0KFwibGkuZHJvcGRvd25cIikuYWRkQ2xhc3MoXCJhY3RpdmVcIikpLG4udHJpZ2dlcihcImFjdGl2YXRlXCIpfX07dmFyIG49ZS5mbi5zY3JvbGxzcHk7ZS5mbi5zY3JvbGxzcHk9ZnVuY3Rpb24obil7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciByPWUodGhpcyksaT1yLmRhdGEoXCJzY3JvbGxzcHlcIikscz10eXBlb2Ygbj09XCJvYmplY3RcIiYmbjtpfHxyLmRhdGEoXCJzY3JvbGxzcHlcIixpPW5ldyB0KHRoaXMscykpLHR5cGVvZiBuPT1cInN0cmluZ1wiJiZpW25dKCl9KX0sZS5mbi5zY3JvbGxzcHkuQ29uc3RydWN0b3I9dCxlLmZuLnNjcm9sbHNweS5kZWZhdWx0cz17b2Zmc2V0OjEwfSxlLmZuLnNjcm9sbHNweS5ub0NvbmZsaWN0PWZ1bmN0aW9uKCl7cmV0dXJuIGUuZm4uc2Nyb2xsc3B5PW4sdGhpc30sZSh3aW5kb3cpLm9uKFwibG9hZFwiLGZ1bmN0aW9uKCl7ZSgnW2RhdGEtc3B5PVwic2Nyb2xsXCJdJykuZWFjaChmdW5jdGlvbigpe3ZhciB0PWUodGhpcyk7dC5zY3JvbGxzcHkodC5kYXRhKCkpfSl9KX0od2luZG93LmpRdWVyeSksIWZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO3ZhciB0PWZ1bmN0aW9uKHQpe3RoaXMuZWxlbWVudD1lKHQpfTt0LnByb3RvdHlwZT17Y29uc3RydWN0b3I6dCxzaG93OmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5lbGVtZW50LG49dC5jbG9zZXN0KFwidWw6bm90KC5kcm9wZG93bi1tZW51KVwiKSxyPXQuYXR0cihcImRhdGEtdGFyZ2V0XCIpLGkscyxvO3J8fChyPXQuYXR0cihcImhyZWZcIikscj1yJiZyLnJlcGxhY2UoLy4qKD89I1teXFxzXSokKS8sXCJcIikpO2lmKHQucGFyZW50KFwibGlcIikuaGFzQ2xhc3MoXCJhY3RpdmVcIikpcmV0dXJuO2k9bi5maW5kKFwiLmFjdGl2ZTpsYXN0IGFcIilbMF0sbz1lLkV2ZW50KFwic2hvd1wiLHtyZWxhdGVkVGFyZ2V0Oml9KSx0LnRyaWdnZXIobyk7aWYoby5pc0RlZmF1bHRQcmV2ZW50ZWQoKSlyZXR1cm47cz1lKHIpLHRoaXMuYWN0aXZhdGUodC5wYXJlbnQoXCJsaVwiKSxuKSx0aGlzLmFjdGl2YXRlKHMscy5wYXJlbnQoKSxmdW5jdGlvbigpe3QudHJpZ2dlcih7dHlwZTpcInNob3duXCIscmVsYXRlZFRhcmdldDppfSl9KX0sYWN0aXZhdGU6ZnVuY3Rpb24odCxuLHIpe2Z1bmN0aW9uIG8oKXtpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLmZpbmQoXCI+IC5kcm9wZG93bi1tZW51ID4gLmFjdGl2ZVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKSx0LmFkZENsYXNzKFwiYWN0aXZlXCIpLHM/KHRbMF0ub2Zmc2V0V2lkdGgsdC5hZGRDbGFzcyhcImluXCIpKTp0LnJlbW92ZUNsYXNzKFwiZmFkZVwiKSx0LnBhcmVudChcIi5kcm9wZG93bi1tZW51XCIpJiZ0LmNsb3Nlc3QoXCJsaS5kcm9wZG93blwiKS5hZGRDbGFzcyhcImFjdGl2ZVwiKSxyJiZyKCl9dmFyIGk9bi5maW5kKFwiPiAuYWN0aXZlXCIpLHM9ciYmZS5zdXBwb3J0LnRyYW5zaXRpb24mJmkuaGFzQ2xhc3MoXCJmYWRlXCIpO3M/aS5vbmUoZS5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLG8pOm8oKSxpLnJlbW92ZUNsYXNzKFwiaW5cIil9fTt2YXIgbj1lLmZuLnRhYjtlLmZuLnRhYj1mdW5jdGlvbihuKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHI9ZSh0aGlzKSxpPXIuZGF0YShcInRhYlwiKTtpfHxyLmRhdGEoXCJ0YWJcIixpPW5ldyB0KHRoaXMpKSx0eXBlb2Ygbj09XCJzdHJpbmdcIiYmaVtuXSgpfSl9LGUuZm4udGFiLkNvbnN0cnVjdG9yPXQsZS5mbi50YWIubm9Db25mbGljdD1mdW5jdGlvbigpe3JldHVybiBlLmZuLnRhYj1uLHRoaXN9LGUoZG9jdW1lbnQpLm9uKFwiY2xpY2sudGFiLmRhdGEtYXBpXCIsJ1tkYXRhLXRvZ2dsZT1cInRhYlwiXSwgW2RhdGEtdG9nZ2xlPVwicGlsbFwiXScsZnVuY3Rpb24odCl7dC5wcmV2ZW50RGVmYXVsdCgpLGUodGhpcykudGFiKFwic2hvd1wiKX0pfSh3aW5kb3cualF1ZXJ5KSwhZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7dmFyIHQ9ZnVuY3Rpb24odCxuKXt0aGlzLiRlbGVtZW50PWUodCksdGhpcy5vcHRpb25zPWUuZXh0ZW5kKHt9LGUuZm4udHlwZWFoZWFkLmRlZmF1bHRzLG4pLHRoaXMubWF0Y2hlcj10aGlzLm9wdGlvbnMubWF0Y2hlcnx8dGhpcy5tYXRjaGVyLHRoaXMuc29ydGVyPXRoaXMub3B0aW9ucy5zb3J0ZXJ8fHRoaXMuc29ydGVyLHRoaXMuaGlnaGxpZ2h0ZXI9dGhpcy5vcHRpb25zLmhpZ2hsaWdodGVyfHx0aGlzLmhpZ2hsaWdodGVyLHRoaXMudXBkYXRlcj10aGlzLm9wdGlvbnMudXBkYXRlcnx8dGhpcy51cGRhdGVyLHRoaXMuc291cmNlPXRoaXMub3B0aW9ucy5zb3VyY2UsdGhpcy4kbWVudT1lKHRoaXMub3B0aW9ucy5tZW51KSx0aGlzLnNob3duPSExLHRoaXMubGlzdGVuKCl9O3QucHJvdG90eXBlPXtjb25zdHJ1Y3Rvcjp0LHNlbGVjdDpmdW5jdGlvbigpe3ZhciBlPXRoaXMuJG1lbnUuZmluZChcIi5hY3RpdmVcIikuYXR0cihcImRhdGEtdmFsdWVcIik7cmV0dXJuIHRoaXMuJGVsZW1lbnQudmFsKHRoaXMudXBkYXRlcihlKSkuY2hhbmdlKCksdGhpcy5oaWRlKCl9LHVwZGF0ZXI6ZnVuY3Rpb24oZSl7cmV0dXJuIGV9LHNob3c6ZnVuY3Rpb24oKXt2YXIgdD1lLmV4dGVuZCh7fSx0aGlzLiRlbGVtZW50LnBvc2l0aW9uKCkse2hlaWdodDp0aGlzLiRlbGVtZW50WzBdLm9mZnNldEhlaWdodH0pO3JldHVybiB0aGlzLiRtZW51Lmluc2VydEFmdGVyKHRoaXMuJGVsZW1lbnQpLmNzcyh7dG9wOnQudG9wK3QuaGVpZ2h0LGxlZnQ6dC5sZWZ0fSkuc2hvdygpLHRoaXMuc2hvd249ITAsdGhpc30saGlkZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLiRtZW51LmhpZGUoKSx0aGlzLnNob3duPSExLHRoaXN9LGxvb2t1cDpmdW5jdGlvbih0KXt2YXIgbjtyZXR1cm4gdGhpcy5xdWVyeT10aGlzLiRlbGVtZW50LnZhbCgpLCF0aGlzLnF1ZXJ5fHx0aGlzLnF1ZXJ5Lmxlbmd0aDx0aGlzLm9wdGlvbnMubWluTGVuZ3RoP3RoaXMuc2hvd24/dGhpcy5oaWRlKCk6dGhpczoobj1lLmlzRnVuY3Rpb24odGhpcy5zb3VyY2UpP3RoaXMuc291cmNlKHRoaXMucXVlcnksZS5wcm94eSh0aGlzLnByb2Nlc3MsdGhpcykpOnRoaXMuc291cmNlLG4/dGhpcy5wcm9jZXNzKG4pOnRoaXMpfSxwcm9jZXNzOmZ1bmN0aW9uKHQpe3ZhciBuPXRoaXM7cmV0dXJuIHQ9ZS5ncmVwKHQsZnVuY3Rpb24oZSl7cmV0dXJuIG4ubWF0Y2hlcihlKX0pLHQ9dGhpcy5zb3J0ZXIodCksdC5sZW5ndGg/dGhpcy5yZW5kZXIodC5zbGljZSgwLHRoaXMub3B0aW9ucy5pdGVtcykpLnNob3coKTp0aGlzLnNob3duP3RoaXMuaGlkZSgpOnRoaXN9LG1hdGNoZXI6ZnVuY3Rpb24oZSl7cmV0dXJufmUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHRoaXMucXVlcnkudG9Mb3dlckNhc2UoKSl9LHNvcnRlcjpmdW5jdGlvbihlKXt2YXIgdD1bXSxuPVtdLHI9W10saTt3aGlsZShpPWUuc2hpZnQoKSlpLnRvTG93ZXJDYXNlKCkuaW5kZXhPZih0aGlzLnF1ZXJ5LnRvTG93ZXJDYXNlKCkpP35pLmluZGV4T2YodGhpcy5xdWVyeSk/bi5wdXNoKGkpOnIucHVzaChpKTp0LnB1c2goaSk7cmV0dXJuIHQuY29uY2F0KG4scil9LGhpZ2hsaWdodGVyOmZ1bmN0aW9uKGUpe3ZhciB0PXRoaXMucXVlcnkucmVwbGFjZSgvW1xcLVxcW1xcXXt9KCkqKz8uLFxcXFxcXF4kfCNcXHNdL2csXCJcXFxcJCZcIik7cmV0dXJuIGUucmVwbGFjZShuZXcgUmVnRXhwKFwiKFwiK3QrXCIpXCIsXCJpZ1wiKSxmdW5jdGlvbihlLHQpe3JldHVyblwiPHN0cm9uZz5cIit0K1wiPC9zdHJvbmc+XCJ9KX0scmVuZGVyOmZ1bmN0aW9uKHQpe3ZhciBuPXRoaXM7cmV0dXJuIHQ9ZSh0KS5tYXAoZnVuY3Rpb24odCxyKXtyZXR1cm4gdD1lKG4ub3B0aW9ucy5pdGVtKS5hdHRyKFwiZGF0YS12YWx1ZVwiLHIpLHQuZmluZChcImFcIikuaHRtbChuLmhpZ2hsaWdodGVyKHIpKSx0WzBdfSksdC5maXJzdCgpLmFkZENsYXNzKFwiYWN0aXZlXCIpLHRoaXMuJG1lbnUuaHRtbCh0KSx0aGlzfSxuZXh0OmZ1bmN0aW9uKHQpe3ZhciBuPXRoaXMuJG1lbnUuZmluZChcIi5hY3RpdmVcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIikscj1uLm5leHQoKTtyLmxlbmd0aHx8KHI9ZSh0aGlzLiRtZW51LmZpbmQoXCJsaVwiKVswXSkpLHIuYWRkQ2xhc3MoXCJhY3RpdmVcIil9LHByZXY6ZnVuY3Rpb24oZSl7dmFyIHQ9dGhpcy4kbWVudS5maW5kKFwiLmFjdGl2ZVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKSxuPXQucHJldigpO24ubGVuZ3RofHwobj10aGlzLiRtZW51LmZpbmQoXCJsaVwiKS5sYXN0KCkpLG4uYWRkQ2xhc3MoXCJhY3RpdmVcIil9LGxpc3RlbjpmdW5jdGlvbigpe3RoaXMuJGVsZW1lbnQub24oXCJmb2N1c1wiLGUucHJveHkodGhpcy5mb2N1cyx0aGlzKSkub24oXCJibHVyXCIsZS5wcm94eSh0aGlzLmJsdXIsdGhpcykpLm9uKFwia2V5cHJlc3NcIixlLnByb3h5KHRoaXMua2V5cHJlc3MsdGhpcykpLm9uKFwia2V5dXBcIixlLnByb3h5KHRoaXMua2V5dXAsdGhpcykpLHRoaXMuZXZlbnRTdXBwb3J0ZWQoXCJrZXlkb3duXCIpJiZ0aGlzLiRlbGVtZW50Lm9uKFwia2V5ZG93blwiLGUucHJveHkodGhpcy5rZXlkb3duLHRoaXMpKSx0aGlzLiRtZW51Lm9uKFwiY2xpY2tcIixlLnByb3h5KHRoaXMuY2xpY2ssdGhpcykpLm9uKFwibW91c2VlbnRlclwiLFwibGlcIixlLnByb3h5KHRoaXMubW91c2VlbnRlcix0aGlzKSkub24oXCJtb3VzZWxlYXZlXCIsXCJsaVwiLGUucHJveHkodGhpcy5tb3VzZWxlYXZlLHRoaXMpKX0sZXZlbnRTdXBwb3J0ZWQ6ZnVuY3Rpb24oZSl7dmFyIHQ9ZSBpbiB0aGlzLiRlbGVtZW50O3JldHVybiB0fHwodGhpcy4kZWxlbWVudC5zZXRBdHRyaWJ1dGUoZSxcInJldHVybjtcIiksdD10eXBlb2YgdGhpcy4kZWxlbWVudFtlXT09XCJmdW5jdGlvblwiKSx0fSxtb3ZlOmZ1bmN0aW9uKGUpe2lmKCF0aGlzLnNob3duKXJldHVybjtzd2l0Y2goZS5rZXlDb2RlKXtjYXNlIDk6Y2FzZSAxMzpjYXNlIDI3OmUucHJldmVudERlZmF1bHQoKTticmVhaztjYXNlIDM4OmUucHJldmVudERlZmF1bHQoKSx0aGlzLnByZXYoKTticmVhaztjYXNlIDQwOmUucHJldmVudERlZmF1bHQoKSx0aGlzLm5leHQoKX1lLnN0b3BQcm9wYWdhdGlvbigpfSxrZXlkb3duOmZ1bmN0aW9uKHQpe3RoaXMuc3VwcHJlc3NLZXlQcmVzc1JlcGVhdD1+ZS5pbkFycmF5KHQua2V5Q29kZSxbNDAsMzgsOSwxMywyN10pLHRoaXMubW92ZSh0KX0sa2V5cHJlc3M6ZnVuY3Rpb24oZSl7aWYodGhpcy5zdXBwcmVzc0tleVByZXNzUmVwZWF0KXJldHVybjt0aGlzLm1vdmUoZSl9LGtleXVwOmZ1bmN0aW9uKGUpe3N3aXRjaChlLmtleUNvZGUpe2Nhc2UgNDA6Y2FzZSAzODpjYXNlIDE2OmNhc2UgMTc6Y2FzZSAxODpicmVhaztjYXNlIDk6Y2FzZSAxMzppZighdGhpcy5zaG93bilyZXR1cm47dGhpcy5zZWxlY3QoKTticmVhaztjYXNlIDI3OmlmKCF0aGlzLnNob3duKXJldHVybjt0aGlzLmhpZGUoKTticmVhaztkZWZhdWx0OnRoaXMubG9va3VwKCl9ZS5zdG9wUHJvcGFnYXRpb24oKSxlLnByZXZlbnREZWZhdWx0KCl9LGZvY3VzOmZ1bmN0aW9uKGUpe3RoaXMuZm9jdXNlZD0hMH0sYmx1cjpmdW5jdGlvbihlKXt0aGlzLmZvY3VzZWQ9ITEsIXRoaXMubW91c2Vkb3ZlciYmdGhpcy5zaG93biYmdGhpcy5oaWRlKCl9LGNsaWNrOmZ1bmN0aW9uKGUpe2Uuc3RvcFByb3BhZ2F0aW9uKCksZS5wcmV2ZW50RGVmYXVsdCgpLHRoaXMuc2VsZWN0KCksdGhpcy4kZWxlbWVudC5mb2N1cygpfSxtb3VzZWVudGVyOmZ1bmN0aW9uKHQpe3RoaXMubW91c2Vkb3Zlcj0hMCx0aGlzLiRtZW51LmZpbmQoXCIuYWN0aXZlXCIpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLGUodC5jdXJyZW50VGFyZ2V0KS5hZGRDbGFzcyhcImFjdGl2ZVwiKX0sbW91c2VsZWF2ZTpmdW5jdGlvbihlKXt0aGlzLm1vdXNlZG92ZXI9ITEsIXRoaXMuZm9jdXNlZCYmdGhpcy5zaG93biYmdGhpcy5oaWRlKCl9fTt2YXIgbj1lLmZuLnR5cGVhaGVhZDtlLmZuLnR5cGVhaGVhZD1mdW5jdGlvbihuKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHI9ZSh0aGlzKSxpPXIuZGF0YShcInR5cGVhaGVhZFwiKSxzPXR5cGVvZiBuPT1cIm9iamVjdFwiJiZuO2l8fHIuZGF0YShcInR5cGVhaGVhZFwiLGk9bmV3IHQodGhpcyxzKSksdHlwZW9mIG49PVwic3RyaW5nXCImJmlbbl0oKX0pfSxlLmZuLnR5cGVhaGVhZC5kZWZhdWx0cz17c291cmNlOltdLGl0ZW1zOjgsbWVudTonPHVsIGNsYXNzPVwidHlwZWFoZWFkIGRyb3Bkb3duLW1lbnVcIj48L3VsPicsaXRlbTonPGxpPjxhIGhyZWY9XCIjXCI+PC9hPjwvbGk+JyxtaW5MZW5ndGg6MX0sZS5mbi50eXBlYWhlYWQuQ29uc3RydWN0b3I9dCxlLmZuLnR5cGVhaGVhZC5ub0NvbmZsaWN0PWZ1bmN0aW9uKCl7cmV0dXJuIGUuZm4udHlwZWFoZWFkPW4sdGhpc30sZShkb2N1bWVudCkub24oXCJmb2N1cy50eXBlYWhlYWQuZGF0YS1hcGlcIiwnW2RhdGEtcHJvdmlkZT1cInR5cGVhaGVhZFwiXScsZnVuY3Rpb24odCl7dmFyIG49ZSh0aGlzKTtpZihuLmRhdGEoXCJ0eXBlYWhlYWRcIikpcmV0dXJuO24udHlwZWFoZWFkKG4uZGF0YSgpKX0pfSh3aW5kb3cualF1ZXJ5KSwhZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7dmFyIHQ9ZnVuY3Rpb24odCxuKXt0aGlzLm9wdGlvbnM9ZS5leHRlbmQoe30sZS5mbi5hZmZpeC5kZWZhdWx0cyxuKSx0aGlzLiR3aW5kb3c9ZSh3aW5kb3cpLm9uKFwic2Nyb2xsLmFmZml4LmRhdGEtYXBpXCIsZS5wcm94eSh0aGlzLmNoZWNrUG9zaXRpb24sdGhpcykpLm9uKFwiY2xpY2suYWZmaXguZGF0YS1hcGlcIixlLnByb3h5KGZ1bmN0aW9uKCl7c2V0VGltZW91dChlLnByb3h5KHRoaXMuY2hlY2tQb3NpdGlvbix0aGlzKSwxKX0sdGhpcykpLHRoaXMuJGVsZW1lbnQ9ZSh0KSx0aGlzLmNoZWNrUG9zaXRpb24oKX07dC5wcm90b3R5cGUuY2hlY2tQb3NpdGlvbj1mdW5jdGlvbigpe2lmKCF0aGlzLiRlbGVtZW50LmlzKFwiOnZpc2libGVcIikpcmV0dXJuO3ZhciB0PWUoZG9jdW1lbnQpLmhlaWdodCgpLG49dGhpcy4kd2luZG93LnNjcm9sbFRvcCgpLHI9dGhpcy4kZWxlbWVudC5vZmZzZXQoKSxpPXRoaXMub3B0aW9ucy5vZmZzZXQscz1pLmJvdHRvbSxvPWkudG9wLHU9XCJhZmZpeCBhZmZpeC10b3AgYWZmaXgtYm90dG9tXCIsYTt0eXBlb2YgaSE9XCJvYmplY3RcIiYmKHM9bz1pKSx0eXBlb2Ygbz09XCJmdW5jdGlvblwiJiYobz1pLnRvcCgpKSx0eXBlb2Ygcz09XCJmdW5jdGlvblwiJiYocz1pLmJvdHRvbSgpKSxhPXRoaXMudW5waW4hPW51bGwmJm4rdGhpcy51bnBpbjw9ci50b3A/ITE6cyE9bnVsbCYmci50b3ArdGhpcy4kZWxlbWVudC5oZWlnaHQoKT49dC1zP1wiYm90dG9tXCI6byE9bnVsbCYmbjw9bz9cInRvcFwiOiExO2lmKHRoaXMuYWZmaXhlZD09PWEpcmV0dXJuO3RoaXMuYWZmaXhlZD1hLHRoaXMudW5waW49YT09XCJib3R0b21cIj9yLnRvcC1uOm51bGwsdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyh1KS5hZGRDbGFzcyhcImFmZml4XCIrKGE/XCItXCIrYTpcIlwiKSl9O3ZhciBuPWUuZm4uYWZmaXg7ZS5mbi5hZmZpeD1mdW5jdGlvbihuKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHI9ZSh0aGlzKSxpPXIuZGF0YShcImFmZml4XCIpLHM9dHlwZW9mIG49PVwib2JqZWN0XCImJm47aXx8ci5kYXRhKFwiYWZmaXhcIixpPW5ldyB0KHRoaXMscykpLHR5cGVvZiBuPT1cInN0cmluZ1wiJiZpW25dKCl9KX0sZS5mbi5hZmZpeC5Db25zdHJ1Y3Rvcj10LGUuZm4uYWZmaXguZGVmYXVsdHM9e29mZnNldDowfSxlLmZuLmFmZml4Lm5vQ29uZmxpY3Q9ZnVuY3Rpb24oKXtyZXR1cm4gZS5mbi5hZmZpeD1uLHRoaXN9LGUod2luZG93KS5vbihcImxvYWRcIixmdW5jdGlvbigpe2UoJ1tkYXRhLXNweT1cImFmZml4XCJdJykuZWFjaChmdW5jdGlvbigpe3ZhciB0PWUodGhpcyksbj10LmRhdGEoKTtuLm9mZnNldD1uLm9mZnNldHx8e30sbi5vZmZzZXRCb3R0b20mJihuLm9mZnNldC5ib3R0b209bi5vZmZzZXRCb3R0b20pLG4ub2Zmc2V0VG9wJiYobi5vZmZzZXQudG9wPW4ub2Zmc2V0VG9wKSx0LmFmZml4KG4pfSl9KX0od2luZG93LmpRdWVyeSk7IiwiLy8kKHdpbmRvdykubG9hZChmdW5jdGlvbigpIHtcblxudmFyIGFjY29yZGlvbkNvbnRyb2wgPSAkKCcuYWNjb3JkaW9uIC5hY2NvcmRpb24tY29udHJvbCcpO1xuXG5hY2NvcmRpb25Db250cm9sLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICR0aGlzID0gJCh0aGlzKTtcbiAgICAkYWNjb3JkaW9uID0gJHRoaXMuY2xvc2VzdCgnLmFjY29yZGlvbicpO1xuXG4gICAgaWYgKCRhY2NvcmRpb24uaGFzQ2xhc3MoJ29wZW4nKSkge1xuICAgICAgJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5oaWRlKDMwMCk7XG4gICAgICAkYWNjb3JkaW9uLnJlbW92ZUNsYXNzKCdvcGVuJylcbiAgICB9IGVsc2Uge1xuICAgICAgJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5zaG93KDMwMCk7XG4gICAgICAkYWNjb3JkaW9uLmFkZENsYXNzKCdvcGVuJylcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcbmFjY29yZGlvbkNvbnRyb2wuc2hvdygpO1xuLy99KVxuXG5vYmplY3RzID0gZnVuY3Rpb24gKGEsYikge1xuICB2YXIgYyA9IGIsXG4gICAga2V5O1xuICBmb3IgKGtleSBpbiBhKSB7XG4gICAgaWYgKGEuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgY1trZXldID0ga2V5IGluIGIgPyBiW2tleV0gOiBhW2tleV07XG4gICAgfVxuICB9XG4gIHJldHVybiBjO1xufTtcblxuJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCl7XG4gICAgZGF0YT10aGlzO1xuICAgIGlmKGRhdGEudHlwZT09MCkge1xuICAgICAgZGF0YS5pbWcuYXR0cignc3JjJywgZGF0YS5zcmMpO1xuICAgIH1lbHNle1xuICAgICAgZGF0YS5pbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnK2RhdGEuc3JjKycpJyk7XG4gICAgICBkYXRhLmltZy5yZW1vdmVDbGFzcygnbm9fYXZhJyk7XG4gICAgfVxuICB9XG5cbiAgLy/RgtC10YHRgiDQu9C+0LPQviDQvNCw0LPQsNC30LjQvdCwXG4gIGltZ3M9JCgnc2VjdGlvbjpub3QoLm5hdmlnYXRpb24pJykuZmluZCgnLmxvZ28gaW1nJyk7XG4gIGZvciAodmFyIGk9MDtpPGltZ3MubGVuZ3RoO2krKyl7XG4gICAgaW1nPWltZ3MuZXEoaSk7XG4gICAgc3JjPWltZy5hdHRyKCdzcmMnKTtcbiAgICBpbWcuYXR0cignc3JjJywnL2ltYWdlcy90ZW1wbGF0ZS1sb2dvLmpwZycpO1xuICAgIGRhdGE9e1xuICAgICAgc3JjOnNyYyxcbiAgICAgIGltZzppbWcsXG4gICAgICB0eXBlOjAgLy8g0LTQu9GPIGltZ1tzcmNdXG4gICAgfTtcbiAgICBpbWFnZT0kKCc8aW1nLz4nLHtcbiAgICAgIHNyYzpzcmNcbiAgICB9KS5vbignbG9hZCcsaW1nX2xvYWRfZmluaXNoLmJpbmQoZGF0YSkpXG4gIH1cblxuICAvL9GC0LXRgdGCINCw0LLQsNGC0LDRgNC+0Log0LIg0LrQvtC80LXQvdGC0LDRgNC40Y/RhVxuICBpbWdzPSQoJy5jb21tZW50LXBob3RvJyk7XG4gIGZvciAodmFyIGk9MDtpPGltZ3MubGVuZ3RoO2krKyl7XG4gICAgaW1nPWltZ3MuZXEoaSk7XG4gICAgaWYoaW1nLmhhc0NsYXNzKCdub19hdmEnKSl7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBzcmM9aW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScpO1xuICAgIHNyYz1zcmMucmVwbGFjZSgndXJsKFwiJywnJyk7XG4gICAgc3JjPXNyYy5yZXBsYWNlKCdcIiknLCcnKTtcbiAgICBpbWcuYWRkQ2xhc3MoJ25vX2F2YScpO1xuXG4gICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgvaW1hZ2VzL25vX2F2YS5wbmcpJyk7XG4gICAgZGF0YT17XG4gICAgICBzcmM6c3JjLFxuICAgICAgaW1nOmltZyxcbiAgICAgIHR5cGU6MSAvLyDQtNC70Y8g0YTQvtC90L7QstGL0YUg0LrQsNGA0YLQuNC90L7QulxuICAgIH07XG4gICAgaW1hZ2U9JCgnPGltZy8+Jyx7XG4gICAgICBzcmM6c3JjXG4gICAgfSkub24oJ2xvYWQnLGltZ19sb2FkX2ZpbmlzaC5iaW5kKGRhdGEpKVxuICB9XG59KTtcblxuKGZ1bmN0aW9uKCkge1xuICBlbHM9JCgnLmFqYXhfbG9hZCcpO1xuICBmb3IoaT0wO2k8ZWxzLmxlbmd0aDtpKyspe1xuICAgIGVsPWVscy5lcShpKTtcbiAgICB1cmw9ZWwuYXR0cigncmVzJyk7XG4gICAgJC5nZXQodXJsLGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAkdGhpcz0kKHRoaXMpO1xuICAgICAgJHRoaXMuaHRtbChkYXRhKTtcbiAgICAgIGFqYXhGb3JtKCR0aGlzKTtcbiAgICB9LmJpbmQoZWwpKVxuICB9XG59KSgpO1xuXG4kKCdpbnB1dFt0eXBlPWZpbGVdJykub24oJ2NoYW5nZScsZnVuY3Rpb24oZXZ0KXtcbiAgdmFyIGZpbGUgPSBldnQudGFyZ2V0LmZpbGVzOyAvLyBGaWxlTGlzdCBvYmplY3RcbiAgdmFyIGYgPSBmaWxlWzBdO1xuICAvLyBPbmx5IHByb2Nlc3MgaW1hZ2UgZmlsZXMuXG4gIGlmICghZi50eXBlLm1hdGNoKCdpbWFnZS4qJykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cbiAgZGF0YT0ge1xuICAgICdlbCc6IHRoaXMsXG4gICAgJ2YnOiBmXG4gIH07XG4gIHJlYWRlci5vbmxvYWQgPSAoZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICBpbWc9JCgnW2Zvcj1cIicrZGF0YS5lbC5uYW1lKydcIl0nKTtcbiAgICAgIGlmKGltZy5sZW5ndGg+MCl7XG4gICAgICAgIGltZy5hdHRyKCdzcmMnLGUudGFyZ2V0LnJlc3VsdClcbiAgICAgIH1cbiAgICB9O1xuICB9KShkYXRhKTtcbiAgLy8gUmVhZCBpbiB0aGUgaW1hZ2UgZmlsZSBhcyBhIGRhdGEgVVJMLlxuICByZWFkZXIucmVhZEFzRGF0YVVSTChmKTtcbn0pO1xuXG4kKCdib2R5Jykub24oJ2NsaWNrJywnYS5hamF4Rm9ybU9wZW4nLGZ1bmN0aW9uKGUpe1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIGhyZWY9dGhpcy5ocmVmLnNwbGl0KCcjJyk7XG4gIGhyZWY9aHJlZltocmVmLmxlbmd0aC0xXTtcblxuICBkYXRhPXtcbiAgICBidXR0b25ZZXM6ZmFsc2UsXG4gICAgbm90eWZ5X2NsYXNzOlwibm90aWZ5X3doaXRlIGxvYWRpbmdcIixcbiAgICBxdWVzdGlvbjonJ1xuICB9O1xuICBtb2RhbF9jbGFzcz0kKHRoaXMpLmRhdGEoJ21vZGFsLWNsYXNzJyk7XG5cbiAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xuICAkLmdldCgnLycraHJlZixmdW5jdGlvbihkYXRhKXtcbiAgICAkKCcubm90aWZ5X2JveCcpLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgJCgnLm5vdGlmeV9ib3ggLm5vdGlmeV9jb250ZW50JykuaHRtbChkYXRhLmh0bWwpO1xuICAgIGFqYXhGb3JtKCQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpKTtcbiAgICBpZihtb2RhbF9jbGFzcyl7XG4gICAgICAkKCcubm90aWZ5X2JveCAubm90aWZ5X2NvbnRlbnQgLnJvdycpLmFkZENsYXNzKG1vZGFsX2NsYXNzKTtcbiAgICB9XG4gIH0sJ2pzb24nKVxufSk7XG5cbiQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKHtcbiAgZGVsYXk6IHtcbiAgICBzaG93OiA1MDAsIGhpZGU6IDIwMDBcbiAgfVxufSk7XG4kKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykub24oJ2NsaWNrJyxmdW5jdGlvbiAoZSkge1xuICAkdGhpcz0kKHRoaXMpO1xuICBpZigkdGhpcy5jbG9zZXN0KCd1bCcpLmhhc0NsYXNzKCdwYWdpbmF0ZScpKSB7XG4gICAgLy/QtNC70Y8g0L/QsNCz0LjQvdCw0YbQuNC4INGB0YHRi9C70LrQsCDQtNC+0LvQttC90LAg0YDQsNCx0L7RgtCw0YLRjFxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmKCR0aGlzLmhhc0NsYXNzKCd3b3JrSHJlZicpKXtcbiAgICAvL9CV0YHQu9C4INGB0YHRi9C70LrQsCDQv9C+0LzQtdGH0LXQvdC90LAg0LrQsNC6INGA0LDQsdC+0YfQsNGPINGC0L4g0L3Rg9C20L3QviDQv9C10YDQtdGF0L7QtNC40YLRjFxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgcmV0dXJuIGZhbHNlO1xufSk7XG5cblxuJCgnLmFqYXgtYWN0aW9uJykuY2xpY2soZnVuY3Rpb24oZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIHZhciBzdGF0dXMgPSAkKHRoaXMpLmRhdGEoJ3ZhbHVlJyk7XG4gIHZhciBocmVmID0gJCh0aGlzKS5hdHRyKCdocmVmJyk7XG4gIHZhciBpZHMgPSAkKCcjZ3JpZC1hamF4LWFjdGlvbicpLnlpaUdyaWRWaWV3KCdnZXRTZWxlY3RlZFJvd3MnKTtcbiAgaWYgKGlkcy5sZW5ndGggPiAwKSB7XG4gICAgaWYgKCFjb25maXJtKCfQn9C+0LTRgtCy0LXRgNC00LjRgtC1INC40LfQvNC10L3QtdC90LjQtSDQt9Cw0L/QuNGB0LXQuScpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgJC5hamF4KHtcbiAgICAgIHVybDogaHJlZixcbiAgICAgIHR5cGU6ICdwb3N0JyxcbiAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIHN0YXR1czogc3RhdHVzLFxuICAgICAgICBpZDogaWRzXG4gICAgICB9XG4gICAgfSkuc3VjY2VzcyhmdW5jdGlvbihkYXRhKSB7XG4gICAgICAkKCcjZ3JpZC1hamF4LWFjdGlvbicpLnlpaUdyaWRWaWV3KFwiYXBwbHlGaWx0ZXJcIik7XG4gICAgICBpZiAoZGF0YS5lcnJvciAhPSBmYWxzZSkge1xuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOifQn9GA0L7QuNC30L7RiNC70LAg0L7RiNC40LHQutCwIScsdHlwZTonZXJyJ30pXG4gICAgICB9XG4gICAgfSkuZmFpbChmdW5jdGlvbihkYXRhKXtcbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Cf0YDQvtC40LfQvtGI0LvQsCDQvtGI0LjQsdC60LAhJyx0eXBlOidlcnInfSlcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOifQndC10L7QsdGF0L7QtNC40LzQviDQstGL0LHRgNCw0YLRjCDRjdC70LXQvNC10L3RgtGLIScsdHlwZTonZXJyJ30pXG4gIH1cbn0pO1xuXG4kKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAkKCcuZWRpdGlibGVbZGlzYWJsZWRdJykub24oJ2NsaWNrJyxmdW5jdGlvbiAoKSB7XG4gICAgJCh0aGlzKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKVxuICB9KVxuXG4gICQoJy5lZGl0aWJsZVtkaXNhYmxlZF0nKS5vbignbW91c2Vkb3duJyxmdW5jdGlvbiAoKSB7XG4gICAgJCh0aGlzKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKVxuICB9KVxufSk7IiwidmFyIG5vdGlmaWNhdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgdmFyIGNvbnRlaW5lcjtcbiAgdmFyIG1vdXNlT3ZlciA9IDA7XG4gIHZhciB0aW1lckNsZWFyQWxsID0gbnVsbDtcbiAgdmFyIGFuaW1hdGlvbkVuZCA9ICd3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kJztcbiAgdmFyIHRpbWUgPSAxMDAwMDtcblxuICB2YXIgbm90aWZpY2F0aW9uX2JveCA9ZmFsc2U7XG4gIHZhciBpc19pbml0PWZhbHNlO1xuICB2YXIgY29uZmlybV9vcHQ9e1xuICAgIHRpdGxlOlwi0KPQtNCw0LvQtdC90LjQtVwiLFxuICAgIHF1ZXN0aW9uOlwi0JLRiyDQtNC10LnRgdGC0LLQuNGC0LXQu9GM0L3QviDRhdC+0YLQuNGC0LUg0YPQtNCw0LvQuNGC0Yw/XCIsXG4gICAgYnV0dG9uWWVzOlwi0JTQsFwiLFxuICAgIGJ1dHRvbk5vOlwi0J3QtdGCXCIsXG4gICAgY2FsbGJhY2tZZXM6ZmFsc2UsXG4gICAgY2FsbGJhY2tObzpmYWxzZSxcbiAgICBvYmo6ZmFsc2UsXG4gICAgYnV0dG9uVGFnOidkaXYnLFxuICAgIGJ1dHRvblllc0RvcDonJyxcbiAgICBidXR0b25Ob0RvcDonJyxcbiAgfTtcbiAgdmFyIGFsZXJ0X29wdD17XG4gICAgdGl0bGU6XCJcIixcbiAgICBxdWVzdGlvbjpcItCh0L7QvtCx0YnQtdC90LjQtVwiLFxuICAgIGJ1dHRvblllczpcItCU0LBcIixcbiAgICBjYWxsYmFja1llczpmYWxzZSxcbiAgICBidXR0b25UYWc6J2RpdicsXG4gICAgb2JqOmZhbHNlLFxuICB9O1xuXG5cbiAgZnVuY3Rpb24gaW5pdCgpe1xuICAgIGlzX2luaXQ9dHJ1ZTtcbiAgICBub3RpZmljYXRpb25fYm94PSQoJy5ub3RpZmljYXRpb25fYm94Jyk7XG4gICAgaWYobm90aWZpY2F0aW9uX2JveC5sZW5ndGg+MClyZXR1cm47XG5cbiAgICAkKCdib2R5JykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nbm90aWZpY2F0aW9uX2JveCc+PC9kaXY+XCIpO1xuICAgIG5vdGlmaWNhdGlvbl9ib3g9JCgnLm5vdGlmaWNhdGlvbl9ib3gnKTtcblxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywnLm5vdGlmeV9jb250cm9sJyxjbG9zZU1vZGFsKTtcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsJy5ub3RpZnlfY2xvc2UnLGNsb3NlTW9kYWwpO1xuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJyxjbG9zZU1vZGFsRm9uKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb3NlTW9kYWwoKXtcbiAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XG4gIH1cblxuICBmdW5jdGlvbiBjbG9zZU1vZGFsRm9uKGUpe1xuICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG4gICAgaWYodGFyZ2V0LmNsYXNzTmFtZT09XCJub3RpZmljYXRpb25fYm94XCIpe1xuICAgICAgY2xvc2VNb2RhbCgpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBfc2V0VXBMaXN0ZW5lcnMgPSBmdW5jdGlvbigpIHtcbiAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5ub3RpZmljYXRpb25fY2xvc2UnLCBfY2xvc2VQb3B1cCk7XG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWVudGVyJywgJy5ub3RpZmljYXRpb25fY29udGFpbmVyJywgX29uRW50ZXIpO1xuICAgICQoJ2JvZHknKS5vbignbW91c2VsZWF2ZScsICcubm90aWZpY2F0aW9uX2NvbnRhaW5lcicsIF9vbkxlYXZlKTtcbiAgfTtcblxuICB2YXIgX29uRW50ZXIgPSBmdW5jdGlvbihldmVudCkge1xuICAgIGlmKGV2ZW50KWV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYgKHRpbWVyQ2xlYXJBbGwhPW51bGwpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lckNsZWFyQWxsKTtcbiAgICAgIHRpbWVyQ2xlYXJBbGwgPSBudWxsO1xuICAgIH1cbiAgICBjb250ZWluZXIuZmluZCgnLm5vdGlmaWNhdGlvbl9pdGVtJykuZWFjaChmdW5jdGlvbihpKXtcbiAgICAgIHZhciBvcHRpb249JCh0aGlzKS5kYXRhKCdvcHRpb24nKTtcbiAgICAgIGlmKG9wdGlvbi50aW1lcikge1xuICAgICAgICBjbGVhclRpbWVvdXQob3B0aW9uLnRpbWVyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBtb3VzZU92ZXIgPSAxO1xuICB9O1xuXG4gIHZhciBfb25MZWF2ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnRlaW5lci5maW5kKCcubm90aWZpY2F0aW9uX2l0ZW0nKS5lYWNoKGZ1bmN0aW9uKGkpe1xuICAgICAgJHRoaXM9JCh0aGlzKTtcbiAgICAgIHZhciBvcHRpb249JHRoaXMuZGF0YSgnb3B0aW9uJyk7XG4gICAgICBpZihvcHRpb24udGltZT4wKSB7XG4gICAgICAgIG9wdGlvbi50aW1lciA9IHNldFRpbWVvdXQoX2Nsb3NlUG9wdXAuYmluZChvcHRpb24uY2xvc2UpLCBvcHRpb24udGltZSAtIDE1MDAgKyAxMDAgKiBpKTtcbiAgICAgICAgJHRoaXMuZGF0YSgnb3B0aW9uJyxvcHRpb24pXG4gICAgICB9XG4gICAgfSk7XG4gICAgbW91c2VPdmVyID0gMDtcbiAgfTtcblxuICB2YXIgX2Nsb3NlUG9wdXAgPSBmdW5jdGlvbihldmVudCkge1xuICAgIGlmKGV2ZW50KWV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLnBhcmVudCgpO1xuICAgICR0aGlzLm9uKGFuaW1hdGlvbkVuZCwgZnVuY3Rpb24oKSB7XG4gICAgICAkKHRoaXMpLnJlbW92ZSgpO1xuICAgIH0pO1xuICAgICR0aGlzLmFkZENsYXNzKCdub3RpZmljYXRpb25faGlkZScpXG4gIH07XG5cbiAgZnVuY3Rpb24gYWxlcnQoZGF0YSl7XG4gICAgaWYoIWRhdGEpZGF0YT17fTtcbiAgICBkYXRhPW9iamVjdHMoYWxlcnRfb3B0LGRhdGEpO1xuXG4gICAgaWYoIWlzX2luaXQpaW5pdCgpO1xuXG4gICAgbm90eWZ5X2NsYXNzPSdub3RpZnlfYm94ICc7XG4gICAgaWYoZGF0YS5ub3R5ZnlfY2xhc3Mpbm90eWZ5X2NsYXNzKz1kYXRhLm5vdHlmeV9jbGFzcztcblxuICAgIGJveF9odG1sPSc8ZGl2IGNsYXNzPVwiJytub3R5ZnlfY2xhc3MrJ1wiPic7XG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X3RpdGxlXCI+JztcbiAgICBib3hfaHRtbCs9ZGF0YS50aXRsZTtcbiAgICBib3hfaHRtbCs9JzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xuXG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRlbnRcIj4nO1xuICAgIGJveF9odG1sKz1kYXRhLnF1ZXN0aW9uO1xuICAgIGJveF9odG1sKz0nPC9kaXY+JztcblxuICAgIGlmKGRhdGEuYnV0dG9uWWVzfHxkYXRhLmJ1dHRvbk5vKSB7XG4gICAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250cm9sXCI+JztcbiAgICAgIGlmIChkYXRhLmJ1dHRvblllcylib3hfaHRtbCArPSAnPCcrZGF0YS5idXR0b25UYWcrJyBjbGFzcz1cIm5vdGlmeV9idG5feWVzXCIgJytkYXRhLmJ1dHRvblllc0RvcCsnPicgKyBkYXRhLmJ1dHRvblllcyArICc8LycrZGF0YS5idXR0b25UYWcrJz4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzwnK2RhdGEuYnV0dG9uVGFnKycgY2xhc3M9XCJub3RpZnlfYnRuX25vXCIgJytkYXRhLmJ1dHRvbk5vRG9wKyc+JyArIGRhdGEuYnV0dG9uTm8gKyAnPC8nK2RhdGEuYnV0dG9uVGFnKyc+JztcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuICAgIH07XG5cbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XG4gICAgbm90aWZpY2F0aW9uX2JveC5odG1sKGJveF9odG1sKTtcblxuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcbiAgICB9LDEwMClcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbmZpcm0oZGF0YSl7XG4gICAgaWYoIWRhdGEpZGF0YT17fTtcbiAgICBkYXRhPW9iamVjdHMoY29uZmlybV9vcHQsZGF0YSk7XG5cbiAgICBpZighaXNfaW5pdClpbml0KCk7XG5cbiAgICBib3hfaHRtbD0nPGRpdiBjbGFzcz1cIm5vdGlmeV9ib3hcIj4nO1xuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV90aXRsZVwiPic7XG4gICAgYm94X2h0bWwrPWRhdGEudGl0bGU7XG4gICAgYm94X2h0bWwrPSc8c3BhbiBjbGFzcz1cIm5vdGlmeV9jbG9zZVwiPjwvc3Bhbj4nO1xuICAgIGJveF9odG1sKz0nPC9kaXY+JztcblxuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcbiAgICBib3hfaHRtbCs9ZGF0YS5xdWVzdGlvbjtcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XG5cbiAgICBpZihkYXRhLmJ1dHRvblllc3x8ZGF0YS5idXR0b25Obykge1xuICAgICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udHJvbFwiPic7XG4gICAgICBpZiAoZGF0YS5idXR0b25ZZXMpYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiPicgKyBkYXRhLmJ1dHRvblllcyArICc8L2Rpdj4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX25vXCI+JyArIGRhdGEuYnV0dG9uTm8gKyAnPC9kaXY+JztcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuICAgIH1cblxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xuXG4gICAgaWYoZGF0YS5jYWxsYmFja1llcyE9ZmFsc2Upe1xuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl95ZXMnKS5vbignY2xpY2snLGRhdGEuY2FsbGJhY2tZZXMuYmluZChkYXRhLm9iaikpO1xuICAgIH1cbiAgICBpZihkYXRhLmNhbGxiYWNrTm8hPWZhbHNlKXtcbiAgICAgIG5vdGlmaWNhdGlvbl9ib3guZmluZCgnLm5vdGlmeV9idG5fbm8nKS5vbignY2xpY2snLGRhdGEuY2FsbGJhY2tOby5iaW5kKGRhdGEub2JqKSk7XG4gICAgfVxuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcbiAgICB9LDEwMClcblxuICB9XG5cbiAgZnVuY3Rpb24gbm90aWZpKGRhdGEpIHtcbiAgICBpZighZGF0YSlkYXRhPXt9O1xuICAgIHZhciBvcHRpb24gPSB7dGltZSA6IChkYXRhLnRpbWV8fGRhdGEudGltZT09PTApP2RhdGEudGltZTp0aW1lfTtcbiAgICBpZiAoIWNvbnRlaW5lcikge1xuICAgICAgY29udGVpbmVyID0gJCgnPHVsLz4nLCB7XG4gICAgICAgICdjbGFzcyc6ICdub3RpZmljYXRpb25fY29udGFpbmVyJ1xuICAgICAgfSk7XG5cbiAgICAgICQoJ2JvZHknKS5hcHBlbmQoY29udGVpbmVyKTtcbiAgICAgIF9zZXRVcExpc3RlbmVycygpO1xuICAgIH1cblxuICAgIHZhciBsaSA9ICQoJzxsaS8+Jywge1xuICAgICAgY2xhc3M6ICdub3RpZmljYXRpb25faXRlbSdcbiAgICB9KTtcblxuICAgIGlmIChkYXRhLnR5cGUpe1xuICAgICAgbGkuYWRkQ2xhc3MoJ25vdGlmaWNhdGlvbl9pdGVtLScgKyBkYXRhLnR5cGUpO1xuICAgIH1cblxuICAgIHZhciBjbG9zZT0kKCc8c3Bhbi8+Jyx7XG4gICAgICBjbGFzczonbm90aWZpY2F0aW9uX2Nsb3NlJ1xuICAgIH0pO1xuICAgIG9wdGlvbi5jbG9zZT1jbG9zZTtcbiAgICBsaS5hcHBlbmQoY2xvc2UpO1xuXG4gICAgaWYoZGF0YS50aXRsZSAmJiBkYXRhLnRpdGxlLmxlbmd0aD4wKSB7XG4gICAgICB2YXIgdGl0bGUgPSAkKCc8cC8+Jywge1xuICAgICAgICBjbGFzczogXCJub3RpZmljYXRpb25fdGl0bGVcIlxuICAgICAgfSk7XG4gICAgICB0aXRsZS5odG1sKGRhdGEudGl0bGUpO1xuICAgICAgbGkuYXBwZW5kKHRpdGxlKTtcbiAgICB9XG5cbiAgICBpZihkYXRhLmltZyAmJiBkYXRhLmltZy5sZW5ndGg+MCkge1xuICAgICAgdmFyIGltZyA9ICQoJzxkaXYvPicsIHtcbiAgICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX2ltZ1wiXG4gICAgICB9KTtcbiAgICAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytkYXRhLmltZysnKScpO1xuICAgICAgbGkuYXBwZW5kKGltZyk7XG4gICAgfVxuXG4gICAgdmFyIGNvbnRlbnQgPSAkKCc8ZGl2Lz4nLHtcbiAgICAgIGNsYXNzOlwibm90aWZpY2F0aW9uX2NvbnRlbnRcIlxuICAgIH0pO1xuICAgIGNvbnRlbnQuaHRtbChkYXRhLm1lc3NhZ2UpO1xuXG4gICAgbGkuYXBwZW5kKGNvbnRlbnQpO1xuXG4gICAgY29udGVpbmVyLmFwcGVuZChsaSk7XG5cbiAgICBpZihvcHRpb24udGltZT4wKXtcbiAgICAgIG9wdGlvbi50aW1lcj1zZXRUaW1lb3V0KF9jbG9zZVBvcHVwLmJpbmQoY2xvc2UpLCBvcHRpb24udGltZSk7XG4gICAgfVxuICAgIGxpLmRhdGEoJ29wdGlvbicsb3B0aW9uKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBhbGVydDogYWxlcnQsXG4gICAgY29uZmlybTogY29uZmlybSxcbiAgICBub3RpZmk6IG5vdGlmaSxcbiAgfTtcblxufSkoKTtcblxuXG4kKCdbcmVmPXBvcHVwXScpLm9uKCdjbGljaycsZnVuY3Rpb24gKGUpe1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICR0aGlzPSQodGhpcyk7XG4gIGVsPSQoJHRoaXMuYXR0cignaHJlZicpKTtcbiAgZGF0YT1lbC5kYXRhKCk7XG5cbiAgZGF0YS5xdWVzdGlvbj1lbC5odG1sKCk7XG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcbn0pO1xuIiwiZnVuY3Rpb24gYWpheEZvcm0oZWxzKSB7XG4gIHZhciBmaWxlQXBpID0gd2luZG93LkZpbGUgJiYgd2luZG93LkZpbGVSZWFkZXIgJiYgd2luZG93LkZpbGVMaXN0ICYmIHdpbmRvdy5CbG9iID8gdHJ1ZSA6IGZhbHNlO1xuICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgZXJyb3JfY2xhc3M6ICcuaGFzLWVycm9yJyxcbiAgfTtcblxuICBmdW5jdGlvbiBvblBvc3QocG9zdCl7XG4gICAgdmFyIGRhdGE9dGhpcztcbiAgICBmb3JtPWRhdGEuZm9ybTtcbiAgICB3cmFwPWRhdGEud3JhcDtcbiAgICBpZihwb3N0LnJlbmRlcil7XG4gICAgICBwb3N0Lm5vdHlmeV9jbGFzcz1cIm5vdGlmeV93aGl0ZVwiO1xuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHBvc3QpO1xuICAgIH1lbHNle1xuICAgICAgd3JhcC5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgd3JhcC5odG1sKHBvc3QuaHRtbCk7XG4gICAgICBhamF4Rm9ybSh3cmFwKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBvbkZhaWwoKXtcbiAgICB2YXIgZGF0YT10aGlzO1xuICAgIGZvcm09ZGF0YS5mb3JtO1xuICAgIHdyYXA9ZGF0YS53cmFwO1xuICAgIHdyYXAucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICB3cmFwLmh0bWwoJzxoMz7Qo9C/0YEuLi4g0JLQvtC30L3QuNC60LvQsCDQvdC10L/RgNC10LTQstC40LTQtdC90L3QsNGPINC+0YjQuNCx0LrQsC48aDM+JyArXG4gICAgICAnPHA+0KfQsNGB0YLQviDRjdGC0L4g0L/RgNC+0LjRgdGF0L7QtNC40YIg0LIg0YHQu9GD0YfQsNC1LCDQtdGB0LvQuCDQstGLINC90LXRgdC60L7Qu9GM0LrQviDRgNCw0Lcg0L/QvtC00YDRj9C0INC90LXQstC10YDQvdC+INCy0LLQtdC70Lgg0YHQstC+0Lgg0YPRh9C10YLQvdGL0LUg0LTQsNC90L3Ri9C1LiDQndC+INCy0L7Qt9C80L7QttC90Ysg0Lgg0LTRgNGD0LPQuNC1INC/0YDQuNGH0LjQvdGLLiDQkiDQu9GO0LHQvtC8INGB0LvRg9GH0LDQtSDQvdC1INGA0LDRgdGB0YLRgNCw0LjQstCw0LnRgtC10YHRjCDQuCDQv9GA0L7RgdGC0L4g0L7QsdGA0LDRgtC40YLQtdGB0Ywg0Log0L3QsNGI0LXQvNGDINC+0L/QtdGA0LDRgtC+0YDRgyDRgdC70YPQttCx0Ysg0L/QvtC00LTQtdGA0LbQutC4LjwvcD48YnI+JyArXG4gICAgICAnPHA+0KHQv9Cw0YHQuNCx0L4uPC9wPicpO1xuICAgIGFqYXhGb3JtKHdyYXApO1xuXG4gIH1cblxuICBmdW5jdGlvbiBvblN1Ym1pdChlKXtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIGRhdGE9dGhpcztcbiAgICBmb3JtPWRhdGEuZm9ybTtcbiAgICB3cmFwPWRhdGEud3JhcDtcblxuICAgIGlmKGZvcm0ueWlpQWN0aXZlRm9ybSl7XG4gICAgICBmb3JtLnlpaUFjdGl2ZUZvcm0oJ3ZhbGlkYXRlJyk7XG4gICAgfTtcblxuICAgIGlzVmFsaWQ9KGZvcm0uZmluZChkYXRhLnBhcmFtLmVycm9yX2NsYXNzKS5sZW5ndGg9PTApO1xuXG4gICAgaWYoIWlzVmFsaWQpe1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1lbHNle1xuICAgICAgcmVxdWlyZWQ9Zm9ybS5maW5kKCdpbnB1dC5yZXF1aXJlZCcpO1xuICAgICAgZm9yKGk9MDtpPHJlcXVpcmVkLmxlbmd0aDtpKyspe1xuICAgICAgICBpZihyZXF1aXJlZC5lcShpKS52YWwoKS5sZW5ndGg8MSl7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZighZm9ybS5zZXJpYWxpemVPYmplY3QpYWRkU1JPKCk7XG5cbiAgICB2YXIgcG9zdD1mb3JtLnNlcmlhbGl6ZU9iamVjdCgpO1xuICAgIGZvcm0uYWRkQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICBmb3JtLmh0bWwoJycpO1xuXG4gICAgJC5wb3N0KFxuICAgICAgZGF0YS51cmwsXG4gICAgICBwb3N0LFxuICAgICAgb25Qb3N0LmJpbmQoZGF0YSksXG4gICAgICAnanNvbidcbiAgICApLmZhaWwob25GYWlsLmJpbmQoZGF0YSkpO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZWxzLmZpbmQoJ1tyZXF1aXJlZF0nKVxuICAgIC5hZGRDbGFzcygncmVxdWlyZWQnKVxuICAgIC5yZW1vdmVBdHRyKCdyZXF1aXJlZCcpO1xuXG4gIGZvcih2YXIgaT0wO2k8ZWxzLmxlbmd0aDtpKyspe1xuICAgIHdyYXA9ZWxzLmVxKGkpO1xuICAgIGZvcm09d3JhcC5maW5kKCdmb3JtJyk7XG4gICAgZGF0YT17XG4gICAgICBmb3JtOmZvcm0sXG4gICAgICBwYXJhbTpkZWZhdWx0cyxcbiAgICAgIHdyYXA6d3JhcFxuICAgIH07XG4gICAgZGF0YS51cmw9Zm9ybS5hdHRyKCdhY3Rpb24nKSB8fCBsb2NhdGlvbi5ocmVmO1xuICAgIGRhdGEubWV0aG9kPSBmb3JtLmF0dHIoJ21ldGhvZCcpIHx8ICdwb3N0JztcbiAgICBmb3JtLm9mZignc3VibWl0Jyk7XG4gICAgZm9ybS5vbignc3VibWl0Jywgb25TdWJtaXQuYmluZChkYXRhKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYWRkU1JPKCl7XG4gICQuZm4uc2VyaWFsaXplT2JqZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBvID0ge307XG4gICAgdmFyIGEgPSB0aGlzLnNlcmlhbGl6ZUFycmF5KCk7XG4gICAgJC5lYWNoKGEsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChvW3RoaXMubmFtZV0pIHtcbiAgICAgICAgaWYgKCFvW3RoaXMubmFtZV0ucHVzaCkge1xuICAgICAgICAgIG9bdGhpcy5uYW1lXSA9IFtvW3RoaXMubmFtZV1dO1xuICAgICAgICB9XG4gICAgICAgIG9bdGhpcy5uYW1lXS5wdXNoKHRoaXMudmFsdWUgfHwgJycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb1t0aGlzLm5hbWVdID0gdGhpcy52YWx1ZSB8fCAnJztcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbztcbiAgfTtcbn07XG5hZGRTUk8oKTsiLCIkKCcuYWN0aW9uX3VzZXJfY29uZmlybScpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIWNvbmZpcm0oKSl7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59KTtcblxuLy9jaGVja2JveGVzINCy0YDQtdC80ZHQvSDRgNCw0LHQvtGC0Ysg0YLQvtGH0LXQuiDQv9GA0L7QtNCw0LYsINC/0YDQuCDQutC70LjQutCw0YUg0YTRg9C90LrRhtC40L7QvdCw0LtcbnZhciBzdG9yZXNQb2ludENoZWNrYm94ZXMgPSAkKCcuYjJiLXN0b3Jlcy1wb2ludHMtZm9ybSBpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKTtcblxuc3RvcmVzUG9pbnRDaGVja2JveGVzLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgIHZhciBuYW1lID0gJCh0aGlzKS5hdHRyKCduYW1lJyk7XG4gICAgdmFyIHJvdyA9ICQodGhpcykuY2xvc2VzdCgndHInKTtcbiAgICAvLyBpZiAobmFtZS5tYXRjaCgvQjJiU3RvcmVzUG9pbnRzXFxbd29ya190aW1lX2RldGFpbHNcXF1cXFtcXGQqXFxdXFxbaG9saWRheVxcXS8pKSB7XG4gICAgLy8gICAgIGNoZWNrRGlzYWJsZWQocm93LCB0aGlzLmNoZWNrZWQsICdkZXBlbmRzLWhvbGlkYXknKTtcbiAgICAvLyB9XG4gICAgaWYgKG5hbWUubWF0Y2goL0IyYlN0b3Jlc1BvaW50c1xcW3dvcmtfdGltZV9kZXRhaWxzXFxdXFxbXFxkKlxcXVxcWzI0LWhvdXJcXF0vKSkge1xuICAgICAgICBjaGVja0Rpc2FibGVkKHJvdywgdGhpcy5jaGVja2VkLCAnZGVwZW5kcy0yNC1ob3VyJyk7XG4gICAgfVxufSk7XG5cbi8v0L/RgNC4INC30LDQs9GA0YPQt9C60LUg0L/RgNC+0LLQtdGA0Y/QtdC8INGC0L4g0LbQtSwg0YfRgtC+INC/0YDQuCDQutC70LjQutC1XG4kLmVhY2goc3RvcmVzUG9pbnRDaGVja2JveGVzLCBmdW5jdGlvbihpbmRleCwgaXRlbSl7XG4gICAgdmFyIG5hbWUgPSAkKGl0ZW0pLmF0dHIoJ25hbWUnKTtcbiAgICB2YXIgcm93ID0gJChpdGVtKS5jbG9zZXN0KCd0cicpO1xuICAgIC8vIGlmIChuYW1lLm1hdGNoKC9CMmJTdG9yZXNQb2ludHNcXFt3b3JrX3RpbWVfZGV0YWlsc1xcXVxcW1xcZCpcXF1cXFtob2xpZGF5XFxdLykgJiYgaXRlbS5jaGVja2VkKSB7XG4gICAgLy8gICAgIGNoZWNrRGlzYWJsZWQocm93LCB0cnVlLCAnZGVwZW5kcy1ob2xpZGF5Jyk7XG4gICAgLy8gfVxuICAgIGlmIChuYW1lLm1hdGNoKC9CMmJTdG9yZXNQb2ludHNcXFt3b3JrX3RpbWVfZGV0YWlsc1xcXVxcW1xcZCpcXF1cXFsyNC1ob3VyXFxdLykgJiYgaXRlbS5jaGVja2VkKSB7XG4gICAgICAgIGNoZWNrRGlzYWJsZWQocm93LCB0cnVlLCAnZGVwZW5kcy0yNC1ob3VyJyk7XG4gICAgfVxufSk7XG5cbmZ1bmN0aW9uICBjaGVja0Rpc2FibGVkKHJvdywgY2hlY2tlZCwgY2xhc3NOYW1lKSB7XG4gICAgLy92YXIgaW5wdXRzQ2hlY2tib3ggPSAkKHJvdykuZmluZCgnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdLicrY2xhc3NOYW1lKTtcbiAgICB2YXIgaW5wdXRzVGV4dCA9ICQocm93KS5maW5kKCdpbnB1dFt0eXBlPVwidGV4dFwiXS4nK2NsYXNzTmFtZSk7XG4gICAgaW5wdXRzVGV4dC52YWwoJycpO1xuICAgIC8vaW5wdXRzQ2hlY2tib3guYXR0cignY2hlY2tlZCcsIGZhbHNlKTtcbiAgICBpbnB1dHNUZXh0LmF0dHIoJ2Rpc2FibGVkJywgY2hlY2tlZCk7XG4gICAgLy9pbnB1dHNDaGVja2JveC5hdHRyKCdkaXNhYmxlZCcsIGNoZWNrZWQpO1xufVxuXG4kKCcjcGF5bWVudHNfc2VsZWN0X3N0b3JlJykub24oJ2NoYW5nZScsIHBheW1lbnRzU2VsZWN0U3RvcmUpO1xuXG5mdW5jdGlvbiBwYXltZW50c1NlbGVjdFN0b3JlKCl7XG4gICAgdmFyIHNlbGYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGF5bWVudHNfc2VsZWN0X3N0b3JlJyksXG4gICAgICAgIHNlbGVjdFBvaW50cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXltZW50c19zZWxlY3Rfc3RvcmVfcG9pbnQnKTtcbiAgICBpZiAoc2VsZiAmJiBzZWxlY3RQb2ludHMpIHtcbiAgICAgICAgdmFyIHBvaW50cyA9ICQoJ29wdGlvbjpzZWxlY3RlZCcsIHNlbGYpLmF0dHIoJ2RhdGEtcG9pbnRzJyksXG4gICAgICAgICAgICBnZXRTZWxlY3RQb2ludCA9ICQoc2VsZWN0UG9pbnRzKS5kYXRhKCdnZXQnKSxcbiAgICAgICAgICAgIG9wdGlvbnMgPSAnJztcbiAgICAgICAgaWYgKHBvaW50cykge1xuICAgICAgICAgICAgcG9pbnRzID0gSlNPTi5wYXJzZShwb2ludHMpO1xuICAgICAgICAgICAgb3B0aW9ucyA9ICc8b3B0aW9uPjwvb3B0aW9uPic7XG4gICAgICAgICAgICBwb2ludHMuZm9yRWFjaChmdW5jdGlvbihpdGVtKXtcbiAgICAgICAgICAgICAgICBvcHRpb25zICs9ICc8b3B0aW9uIHZhbHVlPVwiJytpdGVtLmlkKydcIiAnKyhwYXJzZUludChnZXRTZWxlY3RQb2ludCkgPT0gcGFyc2VJbnQoaXRlbS5pZCkgPyAnc2VsZWN0ZWQnIDogJycpK1xuICAgICAgICAgICAgICAgICAgICAnPicraXRlbS5uYW1lKycsICcraXRlbS5jb3VudHJ5KycsICcraXRlbS5jaXR5KycsICcraXRlbS5hZGRyZXNzKyc8L29wdGlvbnM+JztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHNlbGVjdFBvaW50cy5pbm5lckhUTUwgPSBvcHRpb25zO1xuICAgIH1cblxufVxucGF5bWVudHNTZWxlY3RTdG9yZSgpO1xuXG4vLyBiMmIg0L/Qu9Cw0YLQtdC20LggLSDQtNC10LnRgdGC0LLQuNGPINGBINCz0YDQuNC0XG4kKFwiLnJldmVydC1vcmRlclwiKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBocmVmID0gJy9wYXltZW50cy9yZXZva2UnO1xuICAgIHZhciBpZHMgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG4gICAgdmFyIGRhdGE9e1xuICAgICAgICBidXR0b25ZZXM6ZmFsc2UsXG4gICAgICAgIG5vdHlmeV9jbGFzczpcIm5vdGlmeV93aGl0ZSBub3RpZnlfbm90X2JpZ1wiLFxuICAgICAgICB0aXRsZTogJ9Cf0YDQuCDQvtGC0LzQtdC90LUg0L/Qu9Cw0YLQtdC20LXQuSDQvdGD0LbQvdC+INGD0LrQsNC30LDRgtGMINC/0YDQuNGH0LjQvdGDINC+0YLQvNC10L3RiycsXG4gICAgICAgIHF1ZXN0aW9uOlxuICAgICAgICAnPGZvcm0gYWN0aW9uPVwiJytocmVmKydcIiBtZXRob2Q9XCJwb3N0XCIgY2xhc3M9XCJwYXltZW50cy1mb3JtcyByZXZva2VfcGF5ZW50c19mb3JtXCI+JytcbiAgICAgICAgJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cImlkc1wiIGlkPVwicGF5bWVudHMtaWRcIiB2YWx1ZT1cIicraWRzKydcIicrJz4nK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj4nK1xuICAgICAgICAnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBpZD1cInBheW1lbnRzLWFkbWluLWNvbW1lbnRcIiBuYW1lPVwiYWRtaW4tY29tbWVudFwiIHBsYWNlaG9sZGVyPVwi0JLQstC10LTQuNGC0LUg0L/RgNC40YfQuNC90YMg0L7RgtC80LXQvdGLXCI+JytcbiAgICAgICAgJzxwIGNsYXNzPVwiaGVscC1ibG9jayBoZWxwLWJsb2NrLWVycm9yXCI+PC9wPicrXG4gICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwIGJ1dHRvbnNcIj4nK1xuICAgICAgICAnPGlucHV0IHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiIHZhbHVlPVwi0J7RgtC60LvQvtC90LjRgtGMXCI+JytcbiAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAnPGZvcm0+J1xuICAgIH07XG4gICAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpXG5cblxufSk7XG5cbiQoXCIucGF5bWVudHMtZ3JpZC12aWV3IC5jaGFuZ2Utb3JkZXItcHJpY2VcIikub24oJ2NsaWNrJyxmdW5jdGlvbihlKXtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuICAgIHZhciBvcmRlcl9wcmljZSA9ICQodGhpcykuZGF0YSgnb3JkZXJwcmljZScpO1xuICAgIHZhciBkYXRhPXtcbiAgICAgICAgYnV0dG9uWWVzOmZhbHNlLFxuICAgICAgICBub3R5ZnlfY2xhc3M6XCJub3RpZnlfd2hpdGUgbm90aWZ5X25vdF9iaWdcIixcbiAgICAgICAgdGl0bGU6ICfQmNC30LzQtdC90LjRgtGMINGB0YPQvNC80YMg0L/QvtC60YPQv9C60LgnLFxuICAgICAgICBxdWVzdGlvbjpcbiAgICAgICAgJzxmb3JtIGFjdGlvbj1cIi9wYXltZW50cy91cGRhdGVcIiBtZXRob2Q9XCJwb3N0XCIgY2xhc3M9XCJwYXltZW50cy1mb3JtcyBjaGFuZ2Vfb3JkZXJfcHJpY2VfZm9ybVwiPicrXG4gICAgICAgICc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJQYXltZW50c1t1aWRdXCIgaWQ9XCJwYXltZW50cy1pZFwiIHZhbHVlPVwiJytpZCsnXCInKyc+JytcbiAgICAgICAgJzxwIGNsYXNzPVwiaGVscC1ibG9jayBoZWxwLWJsb2NrLWVycm9yXCI+PC9wPicrXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPicrXG4gICAgICAgICc8bGFiZWw+0J3QvtCy0LDRjyDRgdGD0LzQvNCwPC9sYWJlbD4nK1xuICAgICAgICAnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBpZD1cInBheW1lbnRzLW9yZGVyX3ByaWNlXCIgbmFtZT1cIlBheW1lbnRzW29yZGVyX3ByaWNlXVwiIHBsYWNlaG9sZGVyPVwi0JLQstC10LTQuNGC0LUg0L3QvtCy0YPRjiDRgdGD0LzQvNGDXCIgdmFsdWU9XCInK29yZGVyX3ByaWNlKydcIj4nK1xuICAgICAgICAgICAgJzxwIGNsYXNzPVwiaGVscC1ibG9jayBoZWxwLWJsb2NrLWVycm9yXCI+PC9wPicrXG4gICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCI+JytcbiAgICAgICAgJzxsYWJlbD7QmtC+0LzQvNC10L3RgtCw0YDQuNC5PC9sYWJlbD4nK1xuICAgICAgICAnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBpZD1cInBheW1lbnRzLWFkbWluLWNvbW1lbnRcIiBuYW1lPVwiUGF5bWVudHNbYWRtaW4tY29tbWVudF1cIiBwbGFjZWhvbGRlcj1cItCS0LLQtdC00LjRgtC1INC60L7QvNC80LXQvdGC0LDRgNC40LlcIj4nK1xuICAgICAgICAnPHAgY2xhc3M9XCJoZWxwLWJsb2NrIGhlbHAtYmxvY2stZXJyb3JcIj48L3A+JytcbiAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXAgYnV0dG9uc1wiPicrXG4gICAgICAgICc8aW5wdXQgdHlwZT1cInN1Ym1pdFwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCIgdmFsdWU9XCLQmNC30LzQtdC90LjRgtGMXCI+JytcbiAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAnPGZvcm0+J1xuICAgIH07XG4gICAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpXG59KTtcblxuJChkb2N1bWVudCkub24oJ3N1Ym1pdCcsJ2Zvcm0uY2hhbmdlX29yZGVyX3ByaWNlX2Zvcm0nLCBmdW5jdGlvbihlKXtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCh0aGlzKS5maW5kKCdwLmhlbHAtYmxvY2snKS50ZXh0KCcnKTtcbiAgICB2YXIgaWQgPSAkKCcjcGF5bWVudHMtaWQnKS52YWwoKTtcbiAgICB2YXIgb3JkZXJfcHJpY2UgPSAkKCcjcGF5bWVudHMtb3JkZXJfcHJpY2UnKS52YWwoKTtcbiAgICB2YXIgYWRtaW5fY29tbWVudCA9ICQoJyNwYXltZW50cy1hZG1pbi1jb21tZW50JykudmFsKCk7XG4gICAgaWYgKHBhcnNlSW50KGlkKTwxKSB7XG4gICAgICAgICQoJyNwYXltZW50cy1pZCcpLnNpYmxpbmdzKCdwLmhlbHAtYmxvY2snKS50ZXh0KCdJRCDQtNC+0LvQttC10L0g0LHRi9GC0Ywg0YbQtdC70YvQvCDRh9C40YHQu9C+0LwnKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAob3JkZXJfcHJpY2UgPT0gJycpIHtcbiAgICAgICAgJCgnI3BheW1lbnRzLW9yZGVyX3ByaWNlJykuc2libGluZ3MoJ3AuaGVscC1ibG9jaycpLnRleHQoJ9CS0LLQtdC00LjRgtC1INGB0YPQvNC80YMnKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB2YXIgcmVnID0gL15cXGQqXFwuP1xcZCokLztcbiAgICBpZiAoIW9yZGVyX3ByaWNlLm1hdGNoKHJlZykpIHtcbiAgICAgICAgJCgnI3BheW1lbnRzLW9yZGVyX3ByaWNlJykuc2libGluZ3MoJ3AuaGVscC1ibG9jaycpLmh0bWwoJ9CS0LLQtdC00LjRgtC1INC/0YDQsNCy0LjQu9GM0L3QviDRgdGD0LzQvNGDLjxicj7QmtC+0L/QtdC50LrQuCDQvtGCINGA0YPQsdC70LXQuSDQtNC+0LvQttC90Ysg0L7RgtC00LXQu9GP0YLRjNGB0Y8g0YLQvtGH0LrQvtC5Jyk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGFkbWluX2NvbW1lbnQubGVuZ3RoPDUgfHwgYWRtaW5fY29tbWVudC5sZW5ndGg+MjU2KSB7XG4gICAgICAgICQoJyNwYXltZW50cy1hZG1pbi1jb21tZW50Jykuc2libGluZ3MoJ3AuaGVscC1ibG9jaycpLnRleHQoJ9CU0LvQuNC90LAg0LrQvtC80LzQtdC90YLQsNGA0LjRjyDQtNC+0LvQttC90LAg0LHRi9GC0Ywg0L7RgiA1INC00L4gMjU2INGB0LjQvNCy0L7Qu9C+0LInKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgJ2lkJyA6IHBhcnNlSW50KGlkKSxcbiAgICAgICAgJ29yZGVyX3ByaWNlJyA6IG9yZGVyX3ByaWNlLFxuICAgICAgICAnYWRtaW4tY29tbWVudCcgOiBhZG1pbl9jb21tZW50XG4gICAgfTtcbiAgICAkLnBvc3QoJCh0aGlzKS5hdHRyKCdhY3Rpb24nKSwgZGF0YSwgZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XG4gICAgICAgIGlmIChyZXNwb25zZS5lcnJvciA9PSBmYWxzZSkge1xuICAgICAgICAgICAgLy8gbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTogJ9Cf0LvQsNGC0ZHQtiDQuNC30LzQtdC90ZHQvScsIHR5cGU6J3N1Y2Nlc3MnfSk7XG4gICAgICAgICAgICAvLyB2YXIgcm93ID0gJCgndHJbZGF0YS1rZXk9XCInK2lkKydcIl0nKTtcbiAgICAgICAgICAgIC8vIHZhciB0ZF9wcmljZSA9ICQocm93KS5maW5kKCcudGQtb3JkZXItcHJpY2UnKTtcbiAgICAgICAgICAgIC8vICQodGRfcHJpY2UpLnRleHQocmVzcG9uc2UucmVjYWxjLm9yZGVyX3ByaWNlKycgJyskKHRkX3ByaWNlKS5kYXRhKCdjdXInKSk7XG4gICAgICAgICAgICAvLyAkKHJvdykuZmluZCgnLnRkLXJld2FyZCcpLmh0bWwocmVzcG9uc2UucmVjYWxjLnJld2FyZCsnIDxzcGFuIGNsYXNzPVwiZmEgZmEtcnViXCI+PC9zcGFuPicpO1xuICAgICAgICAgICAgLy8gJChyb3cpLmZpbmQoJy50ZC1jYXNoYmFjaycpLmh0bWwocmVzcG9uc2UucmVjYWxjLmNhc2hiYWNrKycgPHNwYW4gY2xhc3M9XCJmYSBmYS1ydWJcIj48L3NwYW4+Jyk7XG4gICAgICAgICAgICAvLyAkKHJvdykuZmluZCgnLmNoYW5nZS1vcmRlci1wcmljZScpLmF0dHIoJ2RhdGEtb3JkZXJwcmljZScsIHJlc3BvbnNlLnJlY2FsYy5vcmRlcl9wcmljZSk7XG4gICAgICAgICAgICAkKCcjZ3JpZC1hamF4LWFjdGlvbicpLnlpaUdyaWRWaWV3KFwiYXBwbHlGaWx0ZXJcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOiAn0J/RgNC+0LjQt9C+0YjQu9CwINC+0YjQuNCx0LrQsCcsIHR5cGU6J2Vycid9KTtcbiAgICAgICAgfVxuICAgIH0sJ2pzb24nKS5mYWlsKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnc2hvd19ub3RpZmknKTtcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0J/RgNC+0LjQt9C+0YjQu9CwINC+0YjQuNCx0LrQsCEnLCB0eXBlOidlcnInfSlcbiAgICB9KTtcbn0pO1xuXG4kKGRvY3VtZW50KS5vbignc3VibWl0JywnZm9ybS5yZXZva2VfcGF5ZW50c19mb3JtJywgZnVuY3Rpb24oZSl7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICQodGhpcykuZmluZCgncC5oZWxwLWJsb2NrJykudGV4dCgnJyk7XG4gICAgdmFyIGlkcyA9ICQoJyNwYXltZW50cy1pZCcpLnZhbCgpO1xuICAgIHZhciBzdGF0dXMgPSAkKCcjcGF5bWVudHMtc3RhdHVzJykudmFsKCk7XG4gICAgdmFyIGFkbWluX2NvbW1lbnQgPSAkKCcjcGF5bWVudHMtYWRtaW4tY29tbWVudCcpLnZhbCgpO1xuXG4gICAgaWYgKGFkbWluX2NvbW1lbnQubGVuZ3RoPDUgfHwgYWRtaW5fY29tbWVudC5sZW5ndGg+MjU2KSB7XG4gICAgICAgICQoJyNwYXltZW50cy1hZG1pbi1jb21tZW50Jykuc2libGluZ3MoJ3AuaGVscC1ibG9jaycpLnRleHQoJ9CU0LvQuNC90LAg0LrQvtC80LzQtdC90YLQsNGA0LjRjyDQtNC+0LvQttC90LAg0LHRi9GC0Ywg0L7RgiA1INC00L4gMjU2INGB0LjQvNCy0L7Qu9C+0LInKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgJ2lkcycgOiBpZHMsXG4gICAgICAgICdzdGF0dXMnIDogc3RhdHVzLFxuICAgICAgICAnYWRtaW4tY29tbWVudCcgOiBhZG1pbl9jb21tZW50XG4gICAgfTtcbiAgICAkLnBvc3QoJCh0aGlzKS5hdHRyKCdhY3Rpb24nKSwgZGF0YSwgZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XG4gICAgICAgIGlmIChyZXNwb25zZS5lcnJvciA9PSBmYWxzZSkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkKCcjZ3JpZC1hamF4LWFjdGlvbicpLnlpaUdyaWRWaWV3KFwiYXBwbHlGaWx0ZXJcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOiAn0J/RgNC+0LjQt9C+0YjQu9CwINC+0YjQuNCx0LrQsCcsIHR5cGU6J2Vycid9KTtcbiAgICAgICAgfVxuICAgIH0sJ2pzb24nKS5mYWlsKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnc2hvd19ub3RpZmknKTtcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0J/RgNC+0LjQt9C+0YjQu9CwINC+0YjQuNCx0LrQsCEnLCB0eXBlOidlcnInfSlcbiAgICB9KTtcbn0pO1xuXG5cblxuXG4iXX0=
