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
    $('.notification_box .notify_content').html('')
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


$('.disabled').on('click',function (e){
  e.preventDefault();
  $this=$(this);
  data=$this.data();
  if(data['button_yes'])data['buttonYes']=data['button_yes']

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
          form.find('input[type=text],textarea').val('')
        }
      }
    }
    if (typeof post.error === "object") {
      for (var index in post.error) {
        notification.notifi({
          'type': 'err',
          'title': 'Ошибка',
          'message': post.error[index]
        });
      }
    } else if (Array.isArray(post.error)) {
      for (var i = 0; i < post.error.length; i++) {
        notification.notifi({
          'type': 'err',
          'title': 'Ошибка',
          'message': post.error[i]
        });
      }
    } else {
      if (post.error || post.message) {
        notification.notifi({
          'type': post.error === false ? 'success' : 'err',
          'title': post.error === false ? 'Успешно' : 'Ошибка',
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
    wrap.html('<h3>Упс... Возникла непредвиденная ошибка<h3>' +
      '<p>Часто это происходит в случае, если вы несколько раз подряд неверно ввели свои учетные данные. Но возможны и другие причины. В любом случае не расстраивайтесь и просто обратитесь к нашему оператору службы поддержки.</p><br>' +
      '<p>Спасибо.</p>');
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

      var required = form.find('input.required');

      for (i = 0; i < required.length; i++) {
        var helpBlock = required.eq(i).attr('type') == 'hidden' ? required.eq(i).next('.help-block') :
          required.eq(i).closest('.form-input-group').next('.help-block');
        var helpMessage = helpBlock && helpBlock.data('message') ? helpBlock.data('message') : 'Необходимо заполнить';

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
    //form.html('');
    //wrap.html('<div style="text-align:center;"><p>Отправка данных</p></div>');

    data.url += (data.url.indexOf('?') > 0 ? '&' : '?') + 'rc=' + Math.random();
    console.log(data.url);

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





//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvb3RzdHJhcC5taW4uanMiLCJmb3JfYWxsLmpzIiwibm90aWZpY2F0aW9uLmpzIiwianF1ZXJ5LmFqYXhGb3JtLmpzIiwiYjJiLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOVdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyohXHJcbiogQm9vdHN0cmFwLmpzIGJ5IEBmYXQgJiBAbWRvXHJcbiogQ29weXJpZ2h0IDIwMTIgVHdpdHRlciwgSW5jLlxyXG4qIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMC50eHRcclxuKi9cclxuIWZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO2UoZnVuY3Rpb24oKXtlLnN1cHBvcnQudHJhbnNpdGlvbj1mdW5jdGlvbigpe3ZhciBlPWZ1bmN0aW9uKCl7dmFyIGU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJvb3RzdHJhcFwiKSx0PXtXZWJraXRUcmFuc2l0aW9uOlwid2Via2l0VHJhbnNpdGlvbkVuZFwiLE1velRyYW5zaXRpb246XCJ0cmFuc2l0aW9uZW5kXCIsT1RyYW5zaXRpb246XCJvVHJhbnNpdGlvbkVuZCBvdHJhbnNpdGlvbmVuZFwiLHRyYW5zaXRpb246XCJ0cmFuc2l0aW9uZW5kXCJ9LG47Zm9yKG4gaW4gdClpZihlLnN0eWxlW25dIT09dW5kZWZpbmVkKXJldHVybiB0W25dfSgpO3JldHVybiBlJiZ7ZW5kOmV9fSgpfSl9KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjt2YXIgdD0nW2RhdGEtZGlzbWlzcz1cImFsZXJ0XCJdJyxuPWZ1bmN0aW9uKG4pe2Uobikub24oXCJjbGlja1wiLHQsdGhpcy5jbG9zZSl9O24ucHJvdG90eXBlLmNsb3NlPWZ1bmN0aW9uKHQpe2Z1bmN0aW9uIHMoKXtpLnRyaWdnZXIoXCJjbG9zZWRcIikucmVtb3ZlKCl9dmFyIG49ZSh0aGlzKSxyPW4uYXR0cihcImRhdGEtdGFyZ2V0XCIpLGk7cnx8KHI9bi5hdHRyKFwiaHJlZlwiKSxyPXImJnIucmVwbGFjZSgvLiooPz0jW15cXHNdKiQpLyxcIlwiKSksaT1lKHIpLHQmJnQucHJldmVudERlZmF1bHQoKSxpLmxlbmd0aHx8KGk9bi5oYXNDbGFzcyhcImFsZXJ0XCIpP246bi5wYXJlbnQoKSksaS50cmlnZ2VyKHQ9ZS5FdmVudChcImNsb3NlXCIpKTtpZih0LmlzRGVmYXVsdFByZXZlbnRlZCgpKXJldHVybjtpLnJlbW92ZUNsYXNzKFwiaW5cIiksZS5zdXBwb3J0LnRyYW5zaXRpb24mJmkuaGFzQ2xhc3MoXCJmYWRlXCIpP2kub24oZS5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLHMpOnMoKX07dmFyIHI9ZS5mbi5hbGVydDtlLmZuLmFsZXJ0PWZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgcj1lKHRoaXMpLGk9ci5kYXRhKFwiYWxlcnRcIik7aXx8ci5kYXRhKFwiYWxlcnRcIixpPW5ldyBuKHRoaXMpKSx0eXBlb2YgdD09XCJzdHJpbmdcIiYmaVt0XS5jYWxsKHIpfSl9LGUuZm4uYWxlcnQuQ29uc3RydWN0b3I9bixlLmZuLmFsZXJ0Lm5vQ29uZmxpY3Q9ZnVuY3Rpb24oKXtyZXR1cm4gZS5mbi5hbGVydD1yLHRoaXN9LGUoZG9jdW1lbnQpLm9uKFwiY2xpY2suYWxlcnQuZGF0YS1hcGlcIix0LG4ucHJvdG90eXBlLmNsb3NlKX0od2luZG93LmpRdWVyeSksIWZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO3ZhciB0PWZ1bmN0aW9uKHQsbil7dGhpcy4kZWxlbWVudD1lKHQpLHRoaXMub3B0aW9ucz1lLmV4dGVuZCh7fSxlLmZuLmJ1dHRvbi5kZWZhdWx0cyxuKX07dC5wcm90b3R5cGUuc2V0U3RhdGU9ZnVuY3Rpb24oZSl7dmFyIHQ9XCJkaXNhYmxlZFwiLG49dGhpcy4kZWxlbWVudCxyPW4uZGF0YSgpLGk9bi5pcyhcImlucHV0XCIpP1widmFsXCI6XCJodG1sXCI7ZSs9XCJUZXh0XCIsci5yZXNldFRleHR8fG4uZGF0YShcInJlc2V0VGV4dFwiLG5baV0oKSksbltpXShyW2VdfHx0aGlzLm9wdGlvbnNbZV0pLHNldFRpbWVvdXQoZnVuY3Rpb24oKXtlPT1cImxvYWRpbmdUZXh0XCI/bi5hZGRDbGFzcyh0KS5hdHRyKHQsdCk6bi5yZW1vdmVDbGFzcyh0KS5yZW1vdmVBdHRyKHQpfSwwKX0sdC5wcm90b3R5cGUudG9nZ2xlPWZ1bmN0aW9uKCl7dmFyIGU9dGhpcy4kZWxlbWVudC5jbG9zZXN0KCdbZGF0YS10b2dnbGU9XCJidXR0b25zLXJhZGlvXCJdJyk7ZSYmZS5maW5kKFwiLmFjdGl2ZVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKSx0aGlzLiRlbGVtZW50LnRvZ2dsZUNsYXNzKFwiYWN0aXZlXCIpfTt2YXIgbj1lLmZuLmJ1dHRvbjtlLmZuLmJ1dHRvbj1mdW5jdGlvbihuKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHI9ZSh0aGlzKSxpPXIuZGF0YShcImJ1dHRvblwiKSxzPXR5cGVvZiBuPT1cIm9iamVjdFwiJiZuO2l8fHIuZGF0YShcImJ1dHRvblwiLGk9bmV3IHQodGhpcyxzKSksbj09XCJ0b2dnbGVcIj9pLnRvZ2dsZSgpOm4mJmkuc2V0U3RhdGUobil9KX0sZS5mbi5idXR0b24uZGVmYXVsdHM9e2xvYWRpbmdUZXh0OlwibG9hZGluZy4uLlwifSxlLmZuLmJ1dHRvbi5Db25zdHJ1Y3Rvcj10LGUuZm4uYnV0dG9uLm5vQ29uZmxpY3Q9ZnVuY3Rpb24oKXtyZXR1cm4gZS5mbi5idXR0b249bix0aGlzfSxlKGRvY3VtZW50KS5vbihcImNsaWNrLmJ1dHRvbi5kYXRhLWFwaVwiLFwiW2RhdGEtdG9nZ2xlXj1idXR0b25dXCIsZnVuY3Rpb24odCl7dmFyIG49ZSh0LnRhcmdldCk7bi5oYXNDbGFzcyhcImJ0blwiKXx8KG49bi5jbG9zZXN0KFwiLmJ0blwiKSksbi5idXR0b24oXCJ0b2dnbGVcIil9KX0od2luZG93LmpRdWVyeSksIWZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO3ZhciB0PWZ1bmN0aW9uKHQsbil7dGhpcy4kZWxlbWVudD1lKHQpLHRoaXMuJGluZGljYXRvcnM9dGhpcy4kZWxlbWVudC5maW5kKFwiLmNhcm91c2VsLWluZGljYXRvcnNcIiksdGhpcy5vcHRpb25zPW4sdGhpcy5vcHRpb25zLnBhdXNlPT1cImhvdmVyXCImJnRoaXMuJGVsZW1lbnQub24oXCJtb3VzZWVudGVyXCIsZS5wcm94eSh0aGlzLnBhdXNlLHRoaXMpKS5vbihcIm1vdXNlbGVhdmVcIixlLnByb3h5KHRoaXMuY3ljbGUsdGhpcykpfTt0LnByb3RvdHlwZT17Y3ljbGU6ZnVuY3Rpb24odCl7cmV0dXJuIHR8fCh0aGlzLnBhdXNlZD0hMSksdGhpcy5pbnRlcnZhbCYmY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsKSx0aGlzLm9wdGlvbnMuaW50ZXJ2YWwmJiF0aGlzLnBhdXNlZCYmKHRoaXMuaW50ZXJ2YWw9c2V0SW50ZXJ2YWwoZS5wcm94eSh0aGlzLm5leHQsdGhpcyksdGhpcy5vcHRpb25zLmludGVydmFsKSksdGhpc30sZ2V0QWN0aXZlSW5kZXg6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy4kYWN0aXZlPXRoaXMuJGVsZW1lbnQuZmluZChcIi5pdGVtLmFjdGl2ZVwiKSx0aGlzLiRpdGVtcz10aGlzLiRhY3RpdmUucGFyZW50KCkuY2hpbGRyZW4oKSx0aGlzLiRpdGVtcy5pbmRleCh0aGlzLiRhY3RpdmUpfSx0bzpmdW5jdGlvbih0KXt2YXIgbj10aGlzLmdldEFjdGl2ZUluZGV4KCkscj10aGlzO2lmKHQ+dGhpcy4kaXRlbXMubGVuZ3RoLTF8fHQ8MClyZXR1cm47cmV0dXJuIHRoaXMuc2xpZGluZz90aGlzLiRlbGVtZW50Lm9uZShcInNsaWRcIixmdW5jdGlvbigpe3IudG8odCl9KTpuPT10P3RoaXMucGF1c2UoKS5jeWNsZSgpOnRoaXMuc2xpZGUodD5uP1wibmV4dFwiOlwicHJldlwiLGUodGhpcy4kaXRlbXNbdF0pKX0scGF1c2U6ZnVuY3Rpb24odCl7cmV0dXJuIHR8fCh0aGlzLnBhdXNlZD0hMCksdGhpcy4kZWxlbWVudC5maW5kKFwiLm5leHQsIC5wcmV2XCIpLmxlbmd0aCYmZS5zdXBwb3J0LnRyYW5zaXRpb24uZW5kJiYodGhpcy4kZWxlbWVudC50cmlnZ2VyKGUuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCksdGhpcy5jeWNsZSghMCkpLGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbCksdGhpcy5pbnRlcnZhbD1udWxsLHRoaXN9LG5leHQ6ZnVuY3Rpb24oKXtpZih0aGlzLnNsaWRpbmcpcmV0dXJuO3JldHVybiB0aGlzLnNsaWRlKFwibmV4dFwiKX0scHJldjpmdW5jdGlvbigpe2lmKHRoaXMuc2xpZGluZylyZXR1cm47cmV0dXJuIHRoaXMuc2xpZGUoXCJwcmV2XCIpfSxzbGlkZTpmdW5jdGlvbih0LG4pe3ZhciByPXRoaXMuJGVsZW1lbnQuZmluZChcIi5pdGVtLmFjdGl2ZVwiKSxpPW58fHJbdF0oKSxzPXRoaXMuaW50ZXJ2YWwsbz10PT1cIm5leHRcIj9cImxlZnRcIjpcInJpZ2h0XCIsdT10PT1cIm5leHRcIj9cImZpcnN0XCI6XCJsYXN0XCIsYT10aGlzLGY7dGhpcy5zbGlkaW5nPSEwLHMmJnRoaXMucGF1c2UoKSxpPWkubGVuZ3RoP2k6dGhpcy4kZWxlbWVudC5maW5kKFwiLml0ZW1cIilbdV0oKSxmPWUuRXZlbnQoXCJzbGlkZVwiLHtyZWxhdGVkVGFyZ2V0OmlbMF0sZGlyZWN0aW9uOm99KTtpZihpLmhhc0NsYXNzKFwiYWN0aXZlXCIpKXJldHVybjt0aGlzLiRpbmRpY2F0b3JzLmxlbmd0aCYmKHRoaXMuJGluZGljYXRvcnMuZmluZChcIi5hY3RpdmVcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIiksdGhpcy4kZWxlbWVudC5vbmUoXCJzbGlkXCIsZnVuY3Rpb24oKXt2YXIgdD1lKGEuJGluZGljYXRvcnMuY2hpbGRyZW4oKVthLmdldEFjdGl2ZUluZGV4KCldKTt0JiZ0LmFkZENsYXNzKFwiYWN0aXZlXCIpfSkpO2lmKGUuc3VwcG9ydC50cmFuc2l0aW9uJiZ0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKFwic2xpZGVcIikpe3RoaXMuJGVsZW1lbnQudHJpZ2dlcihmKTtpZihmLmlzRGVmYXVsdFByZXZlbnRlZCgpKXJldHVybjtpLmFkZENsYXNzKHQpLGlbMF0ub2Zmc2V0V2lkdGgsci5hZGRDbGFzcyhvKSxpLmFkZENsYXNzKG8pLHRoaXMuJGVsZW1lbnQub25lKGUuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCxmdW5jdGlvbigpe2kucmVtb3ZlQ2xhc3MoW3Qsb10uam9pbihcIiBcIikpLmFkZENsYXNzKFwiYWN0aXZlXCIpLHIucmVtb3ZlQ2xhc3MoW1wiYWN0aXZlXCIsb10uam9pbihcIiBcIikpLGEuc2xpZGluZz0hMSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7YS4kZWxlbWVudC50cmlnZ2VyKFwic2xpZFwiKX0sMCl9KX1lbHNle3RoaXMuJGVsZW1lbnQudHJpZ2dlcihmKTtpZihmLmlzRGVmYXVsdFByZXZlbnRlZCgpKXJldHVybjtyLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLGkuYWRkQ2xhc3MoXCJhY3RpdmVcIiksdGhpcy5zbGlkaW5nPSExLHRoaXMuJGVsZW1lbnQudHJpZ2dlcihcInNsaWRcIil9cmV0dXJuIHMmJnRoaXMuY3ljbGUoKSx0aGlzfX07dmFyIG49ZS5mbi5jYXJvdXNlbDtlLmZuLmNhcm91c2VsPWZ1bmN0aW9uKG4pe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgcj1lKHRoaXMpLGk9ci5kYXRhKFwiY2Fyb3VzZWxcIikscz1lLmV4dGVuZCh7fSxlLmZuLmNhcm91c2VsLmRlZmF1bHRzLHR5cGVvZiBuPT1cIm9iamVjdFwiJiZuKSxvPXR5cGVvZiBuPT1cInN0cmluZ1wiP246cy5zbGlkZTtpfHxyLmRhdGEoXCJjYXJvdXNlbFwiLGk9bmV3IHQodGhpcyxzKSksdHlwZW9mIG49PVwibnVtYmVyXCI/aS50byhuKTpvP2lbb10oKTpzLmludGVydmFsJiZpLnBhdXNlKCkuY3ljbGUoKX0pfSxlLmZuLmNhcm91c2VsLmRlZmF1bHRzPXtpbnRlcnZhbDo1ZTMscGF1c2U6XCJob3ZlclwifSxlLmZuLmNhcm91c2VsLkNvbnN0cnVjdG9yPXQsZS5mbi5jYXJvdXNlbC5ub0NvbmZsaWN0PWZ1bmN0aW9uKCl7cmV0dXJuIGUuZm4uY2Fyb3VzZWw9bix0aGlzfSxlKGRvY3VtZW50KS5vbihcImNsaWNrLmNhcm91c2VsLmRhdGEtYXBpXCIsXCJbZGF0YS1zbGlkZV0sIFtkYXRhLXNsaWRlLXRvXVwiLGZ1bmN0aW9uKHQpe3ZhciBuPWUodGhpcykscixpPWUobi5hdHRyKFwiZGF0YS10YXJnZXRcIil8fChyPW4uYXR0cihcImhyZWZcIikpJiZyLnJlcGxhY2UoLy4qKD89I1teXFxzXSskKS8sXCJcIikpLHM9ZS5leHRlbmQoe30saS5kYXRhKCksbi5kYXRhKCkpLG87aS5jYXJvdXNlbChzKSwobz1uLmF0dHIoXCJkYXRhLXNsaWRlLXRvXCIpKSYmaS5kYXRhKFwiY2Fyb3VzZWxcIikucGF1c2UoKS50byhvKS5jeWNsZSgpLHQucHJldmVudERlZmF1bHQoKX0pfSh3aW5kb3cualF1ZXJ5KSwhZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7dmFyIHQ9ZnVuY3Rpb24odCxuKXt0aGlzLiRlbGVtZW50PWUodCksdGhpcy5vcHRpb25zPWUuZXh0ZW5kKHt9LGUuZm4uY29sbGFwc2UuZGVmYXVsdHMsbiksdGhpcy5vcHRpb25zLnBhcmVudCYmKHRoaXMuJHBhcmVudD1lKHRoaXMub3B0aW9ucy5wYXJlbnQpKSx0aGlzLm9wdGlvbnMudG9nZ2xlJiZ0aGlzLnRvZ2dsZSgpfTt0LnByb3RvdHlwZT17Y29uc3RydWN0b3I6dCxkaW1lbnNpb246ZnVuY3Rpb24oKXt2YXIgZT10aGlzLiRlbGVtZW50Lmhhc0NsYXNzKFwid2lkdGhcIik7cmV0dXJuIGU/XCJ3aWR0aFwiOlwiaGVpZ2h0XCJ9LHNob3c6ZnVuY3Rpb24oKXt2YXIgdCxuLHIsaTtpZih0aGlzLnRyYW5zaXRpb25pbmd8fHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoXCJpblwiKSlyZXR1cm47dD10aGlzLmRpbWVuc2lvbigpLG49ZS5jYW1lbENhc2UoW1wic2Nyb2xsXCIsdF0uam9pbihcIi1cIikpLHI9dGhpcy4kcGFyZW50JiZ0aGlzLiRwYXJlbnQuZmluZChcIj4gLmFjY29yZGlvbi1ncm91cCA+IC5pblwiKTtpZihyJiZyLmxlbmd0aCl7aT1yLmRhdGEoXCJjb2xsYXBzZVwiKTtpZihpJiZpLnRyYW5zaXRpb25pbmcpcmV0dXJuO3IuY29sbGFwc2UoXCJoaWRlXCIpLGl8fHIuZGF0YShcImNvbGxhcHNlXCIsbnVsbCl9dGhpcy4kZWxlbWVudFt0XSgwKSx0aGlzLnRyYW5zaXRpb24oXCJhZGRDbGFzc1wiLGUuRXZlbnQoXCJzaG93XCIpLFwic2hvd25cIiksZS5zdXBwb3J0LnRyYW5zaXRpb24mJnRoaXMuJGVsZW1lbnRbdF0odGhpcy4kZWxlbWVudFswXVtuXSl9LGhpZGU6ZnVuY3Rpb24oKXt2YXIgdDtpZih0aGlzLnRyYW5zaXRpb25pbmd8fCF0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKFwiaW5cIikpcmV0dXJuO3Q9dGhpcy5kaW1lbnNpb24oKSx0aGlzLnJlc2V0KHRoaXMuJGVsZW1lbnRbdF0oKSksdGhpcy50cmFuc2l0aW9uKFwicmVtb3ZlQ2xhc3NcIixlLkV2ZW50KFwiaGlkZVwiKSxcImhpZGRlblwiKSx0aGlzLiRlbGVtZW50W3RdKDApfSxyZXNldDpmdW5jdGlvbihlKXt2YXIgdD10aGlzLmRpbWVuc2lvbigpO3JldHVybiB0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKFwiY29sbGFwc2VcIilbdF0oZXx8XCJhdXRvXCIpWzBdLm9mZnNldFdpZHRoLHRoaXMuJGVsZW1lbnRbZSE9PW51bGw/XCJhZGRDbGFzc1wiOlwicmVtb3ZlQ2xhc3NcIl0oXCJjb2xsYXBzZVwiKSx0aGlzfSx0cmFuc2l0aW9uOmZ1bmN0aW9uKHQsbixyKXt2YXIgaT10aGlzLHM9ZnVuY3Rpb24oKXtuLnR5cGU9PVwic2hvd1wiJiZpLnJlc2V0KCksaS50cmFuc2l0aW9uaW5nPTAsaS4kZWxlbWVudC50cmlnZ2VyKHIpfTt0aGlzLiRlbGVtZW50LnRyaWdnZXIobik7aWYobi5pc0RlZmF1bHRQcmV2ZW50ZWQoKSlyZXR1cm47dGhpcy50cmFuc2l0aW9uaW5nPTEsdGhpcy4kZWxlbWVudFt0XShcImluXCIpLGUuc3VwcG9ydC50cmFuc2l0aW9uJiZ0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKFwiY29sbGFwc2VcIik/dGhpcy4kZWxlbWVudC5vbmUoZS5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLHMpOnMoKX0sdG9nZ2xlOmZ1bmN0aW9uKCl7dGhpc1t0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKFwiaW5cIik/XCJoaWRlXCI6XCJzaG93XCJdKCl9fTt2YXIgbj1lLmZuLmNvbGxhcHNlO2UuZm4uY29sbGFwc2U9ZnVuY3Rpb24obil7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciByPWUodGhpcyksaT1yLmRhdGEoXCJjb2xsYXBzZVwiKSxzPWUuZXh0ZW5kKHt9LGUuZm4uY29sbGFwc2UuZGVmYXVsdHMsci5kYXRhKCksdHlwZW9mIG49PVwib2JqZWN0XCImJm4pO2l8fHIuZGF0YShcImNvbGxhcHNlXCIsaT1uZXcgdCh0aGlzLHMpKSx0eXBlb2Ygbj09XCJzdHJpbmdcIiYmaVtuXSgpfSl9LGUuZm4uY29sbGFwc2UuZGVmYXVsdHM9e3RvZ2dsZTohMH0sZS5mbi5jb2xsYXBzZS5Db25zdHJ1Y3Rvcj10LGUuZm4uY29sbGFwc2Uubm9Db25mbGljdD1mdW5jdGlvbigpe3JldHVybiBlLmZuLmNvbGxhcHNlPW4sdGhpc30sZShkb2N1bWVudCkub24oXCJjbGljay5jb2xsYXBzZS5kYXRhLWFwaVwiLFwiW2RhdGEtdG9nZ2xlPWNvbGxhcHNlXVwiLGZ1bmN0aW9uKHQpe3ZhciBuPWUodGhpcykscixpPW4uYXR0cihcImRhdGEtdGFyZ2V0XCIpfHx0LnByZXZlbnREZWZhdWx0KCl8fChyPW4uYXR0cihcImhyZWZcIikpJiZyLnJlcGxhY2UoLy4qKD89I1teXFxzXSskKS8sXCJcIikscz1lKGkpLmRhdGEoXCJjb2xsYXBzZVwiKT9cInRvZ2dsZVwiOm4uZGF0YSgpO25bZShpKS5oYXNDbGFzcyhcImluXCIpP1wiYWRkQ2xhc3NcIjpcInJlbW92ZUNsYXNzXCJdKFwiY29sbGFwc2VkXCIpLGUoaSkuY29sbGFwc2Uocyl9KX0od2luZG93LmpRdWVyeSksIWZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoKXtlKHQpLmVhY2goZnVuY3Rpb24oKXtpKGUodGhpcykpLnJlbW92ZUNsYXNzKFwib3BlblwiKX0pfWZ1bmN0aW9uIGkodCl7dmFyIG49dC5hdHRyKFwiZGF0YS10YXJnZXRcIikscjtufHwobj10LmF0dHIoXCJocmVmXCIpLG49biYmLyMvLnRlc3QobikmJm4ucmVwbGFjZSgvLiooPz0jW15cXHNdKiQpLyxcIlwiKSkscj1uJiZlKG4pO2lmKCFyfHwhci5sZW5ndGgpcj10LnBhcmVudCgpO3JldHVybiByfXZhciB0PVwiW2RhdGEtdG9nZ2xlPWRyb3Bkb3duXVwiLG49ZnVuY3Rpb24odCl7dmFyIG49ZSh0KS5vbihcImNsaWNrLmRyb3Bkb3duLmRhdGEtYXBpXCIsdGhpcy50b2dnbGUpO2UoXCJodG1sXCIpLm9uKFwiY2xpY2suZHJvcGRvd24uZGF0YS1hcGlcIixmdW5jdGlvbigpe24ucGFyZW50KCkucmVtb3ZlQ2xhc3MoXCJvcGVuXCIpfSl9O24ucHJvdG90eXBlPXtjb25zdHJ1Y3RvcjpuLHRvZ2dsZTpmdW5jdGlvbih0KXt2YXIgbj1lKHRoaXMpLHMsbztpZihuLmlzKFwiLmRpc2FibGVkLCA6ZGlzYWJsZWRcIikpcmV0dXJuO3JldHVybiBzPWkobiksbz1zLmhhc0NsYXNzKFwib3BlblwiKSxyKCksb3x8cy50b2dnbGVDbGFzcyhcIm9wZW5cIiksbi5mb2N1cygpLCExfSxrZXlkb3duOmZ1bmN0aW9uKG4pe3ZhciByLHMsbyx1LGEsZjtpZighLygzOHw0MHwyNykvLnRlc3Qobi5rZXlDb2RlKSlyZXR1cm47cj1lKHRoaXMpLG4ucHJldmVudERlZmF1bHQoKSxuLnN0b3BQcm9wYWdhdGlvbigpO2lmKHIuaXMoXCIuZGlzYWJsZWQsIDpkaXNhYmxlZFwiKSlyZXR1cm47dT1pKHIpLGE9dS5oYXNDbGFzcyhcIm9wZW5cIik7aWYoIWF8fGEmJm4ua2V5Q29kZT09MjcpcmV0dXJuIG4ud2hpY2g9PTI3JiZ1LmZpbmQodCkuZm9jdXMoKSxyLmNsaWNrKCk7cz1lKFwiW3JvbGU9bWVudV0gbGk6bm90KC5kaXZpZGVyKTp2aXNpYmxlIGFcIix1KTtpZighcy5sZW5ndGgpcmV0dXJuO2Y9cy5pbmRleChzLmZpbHRlcihcIjpmb2N1c1wiKSksbi5rZXlDb2RlPT0zOCYmZj4wJiZmLS0sbi5rZXlDb2RlPT00MCYmZjxzLmxlbmd0aC0xJiZmKyssfmZ8fChmPTApLHMuZXEoZikuZm9jdXMoKX19O3ZhciBzPWUuZm4uZHJvcGRvd247ZS5mbi5kcm9wZG93bj1mdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHI9ZSh0aGlzKSxpPXIuZGF0YShcImRyb3Bkb3duXCIpO2l8fHIuZGF0YShcImRyb3Bkb3duXCIsaT1uZXcgbih0aGlzKSksdHlwZW9mIHQ9PVwic3RyaW5nXCImJmlbdF0uY2FsbChyKX0pfSxlLmZuLmRyb3Bkb3duLkNvbnN0cnVjdG9yPW4sZS5mbi5kcm9wZG93bi5ub0NvbmZsaWN0PWZ1bmN0aW9uKCl7cmV0dXJuIGUuZm4uZHJvcGRvd249cyx0aGlzfSxlKGRvY3VtZW50KS5vbihcImNsaWNrLmRyb3Bkb3duLmRhdGEtYXBpXCIscikub24oXCJjbGljay5kcm9wZG93bi5kYXRhLWFwaVwiLFwiLmRyb3Bkb3duIGZvcm1cIixmdW5jdGlvbihlKXtlLnN0b3BQcm9wYWdhdGlvbigpfSkub24oXCJjbGljay5kcm9wZG93bi1tZW51XCIsZnVuY3Rpb24oZSl7ZS5zdG9wUHJvcGFnYXRpb24oKX0pLm9uKFwiY2xpY2suZHJvcGRvd24uZGF0YS1hcGlcIix0LG4ucHJvdG90eXBlLnRvZ2dsZSkub24oXCJrZXlkb3duLmRyb3Bkb3duLmRhdGEtYXBpXCIsdCtcIiwgW3JvbGU9bWVudV1cIixuLnByb3RvdHlwZS5rZXlkb3duKX0od2luZG93LmpRdWVyeSksIWZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO3ZhciB0PWZ1bmN0aW9uKHQsbil7dGhpcy5vcHRpb25zPW4sdGhpcy4kZWxlbWVudD1lKHQpLmRlbGVnYXRlKCdbZGF0YS1kaXNtaXNzPVwibW9kYWxcIl0nLFwiY2xpY2suZGlzbWlzcy5tb2RhbFwiLGUucHJveHkodGhpcy5oaWRlLHRoaXMpKSx0aGlzLm9wdGlvbnMucmVtb3RlJiZ0aGlzLiRlbGVtZW50LmZpbmQoXCIubW9kYWwtYm9keVwiKS5sb2FkKHRoaXMub3B0aW9ucy5yZW1vdGUpfTt0LnByb3RvdHlwZT17Y29uc3RydWN0b3I6dCx0b2dnbGU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpc1t0aGlzLmlzU2hvd24/XCJoaWRlXCI6XCJzaG93XCJdKCl9LHNob3c6ZnVuY3Rpb24oKXt2YXIgdD10aGlzLG49ZS5FdmVudChcInNob3dcIik7dGhpcy4kZWxlbWVudC50cmlnZ2VyKG4pO2lmKHRoaXMuaXNTaG93bnx8bi5pc0RlZmF1bHRQcmV2ZW50ZWQoKSlyZXR1cm47dGhpcy5pc1Nob3duPSEwLHRoaXMuZXNjYXBlKCksdGhpcy5iYWNrZHJvcChmdW5jdGlvbigpe3ZhciBuPWUuc3VwcG9ydC50cmFuc2l0aW9uJiZ0LiRlbGVtZW50Lmhhc0NsYXNzKFwiZmFkZVwiKTt0LiRlbGVtZW50LnBhcmVudCgpLmxlbmd0aHx8dC4kZWxlbWVudC5hcHBlbmRUbyhkb2N1bWVudC5ib2R5KSx0LiRlbGVtZW50LnNob3coKSxuJiZ0LiRlbGVtZW50WzBdLm9mZnNldFdpZHRoLHQuJGVsZW1lbnQuYWRkQ2xhc3MoXCJpblwiKS5hdHRyKFwiYXJpYS1oaWRkZW5cIiwhMSksdC5lbmZvcmNlRm9jdXMoKSxuP3QuJGVsZW1lbnQub25lKGUuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCxmdW5jdGlvbigpe3QuJGVsZW1lbnQuZm9jdXMoKS50cmlnZ2VyKFwic2hvd25cIil9KTp0LiRlbGVtZW50LmZvY3VzKCkudHJpZ2dlcihcInNob3duXCIpfSl9LGhpZGU6ZnVuY3Rpb24odCl7dCYmdC5wcmV2ZW50RGVmYXVsdCgpO3ZhciBuPXRoaXM7dD1lLkV2ZW50KFwiaGlkZVwiKSx0aGlzLiRlbGVtZW50LnRyaWdnZXIodCk7aWYoIXRoaXMuaXNTaG93bnx8dC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSlyZXR1cm47dGhpcy5pc1Nob3duPSExLHRoaXMuZXNjYXBlKCksZShkb2N1bWVudCkub2ZmKFwiZm9jdXNpbi5tb2RhbFwiKSx0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKFwiaW5cIikuYXR0cihcImFyaWEtaGlkZGVuXCIsITApLGUuc3VwcG9ydC50cmFuc2l0aW9uJiZ0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKFwiZmFkZVwiKT90aGlzLmhpZGVXaXRoVHJhbnNpdGlvbigpOnRoaXMuaGlkZU1vZGFsKCl9LGVuZm9yY2VGb2N1czpmdW5jdGlvbigpe3ZhciB0PXRoaXM7ZShkb2N1bWVudCkub24oXCJmb2N1c2luLm1vZGFsXCIsZnVuY3Rpb24oZSl7dC4kZWxlbWVudFswXSE9PWUudGFyZ2V0JiYhdC4kZWxlbWVudC5oYXMoZS50YXJnZXQpLmxlbmd0aCYmdC4kZWxlbWVudC5mb2N1cygpfSl9LGVzY2FwZTpmdW5jdGlvbigpe3ZhciBlPXRoaXM7dGhpcy5pc1Nob3duJiZ0aGlzLm9wdGlvbnMua2V5Ym9hcmQ/dGhpcy4kZWxlbWVudC5vbihcImtleXVwLmRpc21pc3MubW9kYWxcIixmdW5jdGlvbih0KXt0LndoaWNoPT0yNyYmZS5oaWRlKCl9KTp0aGlzLmlzU2hvd258fHRoaXMuJGVsZW1lbnQub2ZmKFwia2V5dXAuZGlzbWlzcy5tb2RhbFwiKX0saGlkZVdpdGhUcmFuc2l0aW9uOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcyxuPXNldFRpbWVvdXQoZnVuY3Rpb24oKXt0LiRlbGVtZW50Lm9mZihlLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQpLHQuaGlkZU1vZGFsKCl9LDUwMCk7dGhpcy4kZWxlbWVudC5vbmUoZS5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLGZ1bmN0aW9uKCl7Y2xlYXJUaW1lb3V0KG4pLHQuaGlkZU1vZGFsKCl9KX0saGlkZU1vZGFsOmZ1bmN0aW9uKCl7dmFyIGU9dGhpczt0aGlzLiRlbGVtZW50LmhpZGUoKSx0aGlzLmJhY2tkcm9wKGZ1bmN0aW9uKCl7ZS5yZW1vdmVCYWNrZHJvcCgpLGUuJGVsZW1lbnQudHJpZ2dlcihcImhpZGRlblwiKX0pfSxyZW1vdmVCYWNrZHJvcDpmdW5jdGlvbigpe3RoaXMuJGJhY2tkcm9wJiZ0aGlzLiRiYWNrZHJvcC5yZW1vdmUoKSx0aGlzLiRiYWNrZHJvcD1udWxsfSxiYWNrZHJvcDpmdW5jdGlvbih0KXt2YXIgbj10aGlzLHI9dGhpcy4kZWxlbWVudC5oYXNDbGFzcyhcImZhZGVcIik/XCJmYWRlXCI6XCJcIjtpZih0aGlzLmlzU2hvd24mJnRoaXMub3B0aW9ucy5iYWNrZHJvcCl7dmFyIGk9ZS5zdXBwb3J0LnRyYW5zaXRpb24mJnI7dGhpcy4kYmFja2Ryb3A9ZSgnPGRpdiBjbGFzcz1cIm1vZGFsLWJhY2tkcm9wICcrcisnXCIgLz4nKS5hcHBlbmRUbyhkb2N1bWVudC5ib2R5KSx0aGlzLiRiYWNrZHJvcC5jbGljayh0aGlzLm9wdGlvbnMuYmFja2Ryb3A9PVwic3RhdGljXCI/ZS5wcm94eSh0aGlzLiRlbGVtZW50WzBdLmZvY3VzLHRoaXMuJGVsZW1lbnRbMF0pOmUucHJveHkodGhpcy5oaWRlLHRoaXMpKSxpJiZ0aGlzLiRiYWNrZHJvcFswXS5vZmZzZXRXaWR0aCx0aGlzLiRiYWNrZHJvcC5hZGRDbGFzcyhcImluXCIpO2lmKCF0KXJldHVybjtpP3RoaXMuJGJhY2tkcm9wLm9uZShlLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsdCk6dCgpfWVsc2UhdGhpcy5pc1Nob3duJiZ0aGlzLiRiYWNrZHJvcD8odGhpcy4kYmFja2Ryb3AucmVtb3ZlQ2xhc3MoXCJpblwiKSxlLnN1cHBvcnQudHJhbnNpdGlvbiYmdGhpcy4kZWxlbWVudC5oYXNDbGFzcyhcImZhZGVcIik/dGhpcy4kYmFja2Ryb3Aub25lKGUuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCx0KTp0KCkpOnQmJnQoKX19O3ZhciBuPWUuZm4ubW9kYWw7ZS5mbi5tb2RhbD1mdW5jdGlvbihuKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHI9ZSh0aGlzKSxpPXIuZGF0YShcIm1vZGFsXCIpLHM9ZS5leHRlbmQoe30sZS5mbi5tb2RhbC5kZWZhdWx0cyxyLmRhdGEoKSx0eXBlb2Ygbj09XCJvYmplY3RcIiYmbik7aXx8ci5kYXRhKFwibW9kYWxcIixpPW5ldyB0KHRoaXMscykpLHR5cGVvZiBuPT1cInN0cmluZ1wiP2lbbl0oKTpzLnNob3cmJmkuc2hvdygpfSl9LGUuZm4ubW9kYWwuZGVmYXVsdHM9e2JhY2tkcm9wOiEwLGtleWJvYXJkOiEwLHNob3c6ITB9LGUuZm4ubW9kYWwuQ29uc3RydWN0b3I9dCxlLmZuLm1vZGFsLm5vQ29uZmxpY3Q9ZnVuY3Rpb24oKXtyZXR1cm4gZS5mbi5tb2RhbD1uLHRoaXN9LGUoZG9jdW1lbnQpLm9uKFwiY2xpY2subW9kYWwuZGF0YS1hcGlcIiwnW2RhdGEtdG9nZ2xlPVwibW9kYWxcIl0nLGZ1bmN0aW9uKHQpe3ZhciBuPWUodGhpcykscj1uLmF0dHIoXCJocmVmXCIpLGk9ZShuLmF0dHIoXCJkYXRhLXRhcmdldFwiKXx8ciYmci5yZXBsYWNlKC8uKig/PSNbXlxcc10rJCkvLFwiXCIpKSxzPWkuZGF0YShcIm1vZGFsXCIpP1widG9nZ2xlXCI6ZS5leHRlbmQoe3JlbW90ZTohLyMvLnRlc3QocikmJnJ9LGkuZGF0YSgpLG4uZGF0YSgpKTt0LnByZXZlbnREZWZhdWx0KCksaS5tb2RhbChzKS5vbmUoXCJoaWRlXCIsZnVuY3Rpb24oKXtuLmZvY3VzKCl9KX0pfSh3aW5kb3cualF1ZXJ5KSwhZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7dmFyIHQ9ZnVuY3Rpb24oZSx0KXt0aGlzLmluaXQoXCJ0b29sdGlwXCIsZSx0KX07dC5wcm90b3R5cGU9e2NvbnN0cnVjdG9yOnQsaW5pdDpmdW5jdGlvbih0LG4scil7dmFyIGkscyxvLHUsYTt0aGlzLnR5cGU9dCx0aGlzLiRlbGVtZW50PWUobiksdGhpcy5vcHRpb25zPXRoaXMuZ2V0T3B0aW9ucyhyKSx0aGlzLmVuYWJsZWQ9ITAsbz10aGlzLm9wdGlvbnMudHJpZ2dlci5zcGxpdChcIiBcIik7Zm9yKGE9by5sZW5ndGg7YS0tOyl1PW9bYV0sdT09XCJjbGlja1wiP3RoaXMuJGVsZW1lbnQub24oXCJjbGljay5cIit0aGlzLnR5cGUsdGhpcy5vcHRpb25zLnNlbGVjdG9yLGUucHJveHkodGhpcy50b2dnbGUsdGhpcykpOnUhPVwibWFudWFsXCImJihpPXU9PVwiaG92ZXJcIj9cIm1vdXNlZW50ZXJcIjpcImZvY3VzXCIscz11PT1cImhvdmVyXCI/XCJtb3VzZWxlYXZlXCI6XCJibHVyXCIsdGhpcy4kZWxlbWVudC5vbihpK1wiLlwiK3RoaXMudHlwZSx0aGlzLm9wdGlvbnMuc2VsZWN0b3IsZS5wcm94eSh0aGlzLmVudGVyLHRoaXMpKSx0aGlzLiRlbGVtZW50Lm9uKHMrXCIuXCIrdGhpcy50eXBlLHRoaXMub3B0aW9ucy5zZWxlY3RvcixlLnByb3h5KHRoaXMubGVhdmUsdGhpcykpKTt0aGlzLm9wdGlvbnMuc2VsZWN0b3I/dGhpcy5fb3B0aW9ucz1lLmV4dGVuZCh7fSx0aGlzLm9wdGlvbnMse3RyaWdnZXI6XCJtYW51YWxcIixzZWxlY3RvcjpcIlwifSk6dGhpcy5maXhUaXRsZSgpfSxnZXRPcHRpb25zOmZ1bmN0aW9uKHQpe3JldHVybiB0PWUuZXh0ZW5kKHt9LGUuZm5bdGhpcy50eXBlXS5kZWZhdWx0cyx0aGlzLiRlbGVtZW50LmRhdGEoKSx0KSx0LmRlbGF5JiZ0eXBlb2YgdC5kZWxheT09XCJudW1iZXJcIiYmKHQuZGVsYXk9e3Nob3c6dC5kZWxheSxoaWRlOnQuZGVsYXl9KSx0fSxlbnRlcjpmdW5jdGlvbih0KXt2YXIgbj1lLmZuW3RoaXMudHlwZV0uZGVmYXVsdHMscj17fSxpO3RoaXMuX29wdGlvbnMmJmUuZWFjaCh0aGlzLl9vcHRpb25zLGZ1bmN0aW9uKGUsdCl7bltlXSE9dCYmKHJbZV09dCl9LHRoaXMpLGk9ZSh0LmN1cnJlbnRUYXJnZXQpW3RoaXMudHlwZV0ocikuZGF0YSh0aGlzLnR5cGUpO2lmKCFpLm9wdGlvbnMuZGVsYXl8fCFpLm9wdGlvbnMuZGVsYXkuc2hvdylyZXR1cm4gaS5zaG93KCk7Y2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCksaS5ob3ZlclN0YXRlPVwiaW5cIix0aGlzLnRpbWVvdXQ9c2V0VGltZW91dChmdW5jdGlvbigpe2kuaG92ZXJTdGF0ZT09XCJpblwiJiZpLnNob3coKX0saS5vcHRpb25zLmRlbGF5LnNob3cpfSxsZWF2ZTpmdW5jdGlvbih0KXt2YXIgbj1lKHQuY3VycmVudFRhcmdldClbdGhpcy50eXBlXSh0aGlzLl9vcHRpb25zKS5kYXRhKHRoaXMudHlwZSk7dGhpcy50aW1lb3V0JiZjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtpZighbi5vcHRpb25zLmRlbGF5fHwhbi5vcHRpb25zLmRlbGF5LmhpZGUpcmV0dXJuIG4uaGlkZSgpO24uaG92ZXJTdGF0ZT1cIm91dFwiLHRoaXMudGltZW91dD1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7bi5ob3ZlclN0YXRlPT1cIm91dFwiJiZuLmhpZGUoKX0sbi5vcHRpb25zLmRlbGF5LmhpZGUpfSxzaG93OmZ1bmN0aW9uKCl7dmFyIHQsbixyLGkscyxvLHU9ZS5FdmVudChcInNob3dcIik7aWYodGhpcy5oYXNDb250ZW50KCkmJnRoaXMuZW5hYmxlZCl7dGhpcy4kZWxlbWVudC50cmlnZ2VyKHUpO2lmKHUuaXNEZWZhdWx0UHJldmVudGVkKCkpcmV0dXJuO3Q9dGhpcy50aXAoKSx0aGlzLnNldENvbnRlbnQoKSx0aGlzLm9wdGlvbnMuYW5pbWF0aW9uJiZ0LmFkZENsYXNzKFwiZmFkZVwiKSxzPXR5cGVvZiB0aGlzLm9wdGlvbnMucGxhY2VtZW50PT1cImZ1bmN0aW9uXCI/dGhpcy5vcHRpb25zLnBsYWNlbWVudC5jYWxsKHRoaXMsdFswXSx0aGlzLiRlbGVtZW50WzBdKTp0aGlzLm9wdGlvbnMucGxhY2VtZW50LHQuZGV0YWNoKCkuY3NzKHt0b3A6MCxsZWZ0OjAsZGlzcGxheTpcImJsb2NrXCJ9KSx0aGlzLm9wdGlvbnMuY29udGFpbmVyP3QuYXBwZW5kVG8odGhpcy5vcHRpb25zLmNvbnRhaW5lcik6dC5pbnNlcnRBZnRlcih0aGlzLiRlbGVtZW50KSxuPXRoaXMuZ2V0UG9zaXRpb24oKSxyPXRbMF0ub2Zmc2V0V2lkdGgsaT10WzBdLm9mZnNldEhlaWdodDtzd2l0Y2gocyl7Y2FzZVwiYm90dG9tXCI6bz17dG9wOm4udG9wK24uaGVpZ2h0LGxlZnQ6bi5sZWZ0K24ud2lkdGgvMi1yLzJ9O2JyZWFrO2Nhc2VcInRvcFwiOm89e3RvcDpuLnRvcC1pLGxlZnQ6bi5sZWZ0K24ud2lkdGgvMi1yLzJ9O2JyZWFrO2Nhc2VcImxlZnRcIjpvPXt0b3A6bi50b3Arbi5oZWlnaHQvMi1pLzIsbGVmdDpuLmxlZnQtcn07YnJlYWs7Y2FzZVwicmlnaHRcIjpvPXt0b3A6bi50b3Arbi5oZWlnaHQvMi1pLzIsbGVmdDpuLmxlZnQrbi53aWR0aH19dGhpcy5hcHBseVBsYWNlbWVudChvLHMpLHRoaXMuJGVsZW1lbnQudHJpZ2dlcihcInNob3duXCIpfX0sYXBwbHlQbGFjZW1lbnQ6ZnVuY3Rpb24oZSx0KXt2YXIgbj10aGlzLnRpcCgpLHI9blswXS5vZmZzZXRXaWR0aCxpPW5bMF0ub2Zmc2V0SGVpZ2h0LHMsbyx1LGE7bi5vZmZzZXQoZSkuYWRkQ2xhc3ModCkuYWRkQ2xhc3MoXCJpblwiKSxzPW5bMF0ub2Zmc2V0V2lkdGgsbz1uWzBdLm9mZnNldEhlaWdodCx0PT1cInRvcFwiJiZvIT1pJiYoZS50b3A9ZS50b3AraS1vLGE9ITApLHQ9PVwiYm90dG9tXCJ8fHQ9PVwidG9wXCI/KHU9MCxlLmxlZnQ8MCYmKHU9ZS5sZWZ0Ki0yLGUubGVmdD0wLG4ub2Zmc2V0KGUpLHM9blswXS5vZmZzZXRXaWR0aCxvPW5bMF0ub2Zmc2V0SGVpZ2h0KSx0aGlzLnJlcGxhY2VBcnJvdyh1LXIrcyxzLFwibGVmdFwiKSk6dGhpcy5yZXBsYWNlQXJyb3coby1pLG8sXCJ0b3BcIiksYSYmbi5vZmZzZXQoZSl9LHJlcGxhY2VBcnJvdzpmdW5jdGlvbihlLHQsbil7dGhpcy5hcnJvdygpLmNzcyhuLGU/NTAqKDEtZS90KStcIiVcIjpcIlwiKX0sc2V0Q29udGVudDpmdW5jdGlvbigpe3ZhciBlPXRoaXMudGlwKCksdD10aGlzLmdldFRpdGxlKCk7ZS5maW5kKFwiLnRvb2x0aXAtaW5uZXJcIilbdGhpcy5vcHRpb25zLmh0bWw/XCJodG1sXCI6XCJ0ZXh0XCJdKHQpLGUucmVtb3ZlQ2xhc3MoXCJmYWRlIGluIHRvcCBib3R0b20gbGVmdCByaWdodFwiKX0saGlkZTpmdW5jdGlvbigpe2Z1bmN0aW9uIGkoKXt2YXIgdD1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7bi5vZmYoZS5zdXBwb3J0LnRyYW5zaXRpb24uZW5kKS5kZXRhY2goKX0sNTAwKTtuLm9uZShlLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsZnVuY3Rpb24oKXtjbGVhclRpbWVvdXQodCksbi5kZXRhY2goKX0pfXZhciB0PXRoaXMsbj10aGlzLnRpcCgpLHI9ZS5FdmVudChcImhpZGVcIik7dGhpcy4kZWxlbWVudC50cmlnZ2VyKHIpO2lmKHIuaXNEZWZhdWx0UHJldmVudGVkKCkpcmV0dXJuO3JldHVybiBuLnJlbW92ZUNsYXNzKFwiaW5cIiksZS5zdXBwb3J0LnRyYW5zaXRpb24mJnRoaXMuJHRpcC5oYXNDbGFzcyhcImZhZGVcIik/aSgpOm4uZGV0YWNoKCksdGhpcy4kZWxlbWVudC50cmlnZ2VyKFwiaGlkZGVuXCIpLHRoaXN9LGZpeFRpdGxlOmZ1bmN0aW9uKCl7dmFyIGU9dGhpcy4kZWxlbWVudDsoZS5hdHRyKFwidGl0bGVcIil8fHR5cGVvZiBlLmF0dHIoXCJkYXRhLW9yaWdpbmFsLXRpdGxlXCIpIT1cInN0cmluZ1wiKSYmZS5hdHRyKFwiZGF0YS1vcmlnaW5hbC10aXRsZVwiLGUuYXR0cihcInRpdGxlXCIpfHxcIlwiKS5hdHRyKFwidGl0bGVcIixcIlwiKX0saGFzQ29udGVudDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmdldFRpdGxlKCl9LGdldFBvc2l0aW9uOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy4kZWxlbWVudFswXTtyZXR1cm4gZS5leHRlbmQoe30sdHlwZW9mIHQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0PT1cImZ1bmN0aW9uXCI/dC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTp7d2lkdGg6dC5vZmZzZXRXaWR0aCxoZWlnaHQ6dC5vZmZzZXRIZWlnaHR9LHRoaXMuJGVsZW1lbnQub2Zmc2V0KCkpfSxnZXRUaXRsZTpmdW5jdGlvbigpe3ZhciBlLHQ9dGhpcy4kZWxlbWVudCxuPXRoaXMub3B0aW9ucztyZXR1cm4gZT10LmF0dHIoXCJkYXRhLW9yaWdpbmFsLXRpdGxlXCIpfHwodHlwZW9mIG4udGl0bGU9PVwiZnVuY3Rpb25cIj9uLnRpdGxlLmNhbGwodFswXSk6bi50aXRsZSksZX0sdGlwOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuJHRpcD10aGlzLiR0aXB8fGUodGhpcy5vcHRpb25zLnRlbXBsYXRlKX0sYXJyb3c6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy4kYXJyb3c9dGhpcy4kYXJyb3d8fHRoaXMudGlwKCkuZmluZChcIi50b29sdGlwLWFycm93XCIpfSx2YWxpZGF0ZTpmdW5jdGlvbigpe3RoaXMuJGVsZW1lbnRbMF0ucGFyZW50Tm9kZXx8KHRoaXMuaGlkZSgpLHRoaXMuJGVsZW1lbnQ9bnVsbCx0aGlzLm9wdGlvbnM9bnVsbCl9LGVuYWJsZTpmdW5jdGlvbigpe3RoaXMuZW5hYmxlZD0hMH0sZGlzYWJsZTpmdW5jdGlvbigpe3RoaXMuZW5hYmxlZD0hMX0sdG9nZ2xlRW5hYmxlZDpmdW5jdGlvbigpe3RoaXMuZW5hYmxlZD0hdGhpcy5lbmFibGVkfSx0b2dnbGU6ZnVuY3Rpb24odCl7dmFyIG49dD9lKHQuY3VycmVudFRhcmdldClbdGhpcy50eXBlXSh0aGlzLl9vcHRpb25zKS5kYXRhKHRoaXMudHlwZSk6dGhpcztuLnRpcCgpLmhhc0NsYXNzKFwiaW5cIik/bi5oaWRlKCk6bi5zaG93KCl9LGRlc3Ryb3k6ZnVuY3Rpb24oKXt0aGlzLmhpZGUoKS4kZWxlbWVudC5vZmYoXCIuXCIrdGhpcy50eXBlKS5yZW1vdmVEYXRhKHRoaXMudHlwZSl9fTt2YXIgbj1lLmZuLnRvb2x0aXA7ZS5mbi50b29sdGlwPWZ1bmN0aW9uKG4pe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgcj1lKHRoaXMpLGk9ci5kYXRhKFwidG9vbHRpcFwiKSxzPXR5cGVvZiBuPT1cIm9iamVjdFwiJiZuO2l8fHIuZGF0YShcInRvb2x0aXBcIixpPW5ldyB0KHRoaXMscykpLHR5cGVvZiBuPT1cInN0cmluZ1wiJiZpW25dKCl9KX0sZS5mbi50b29sdGlwLkNvbnN0cnVjdG9yPXQsZS5mbi50b29sdGlwLmRlZmF1bHRzPXthbmltYXRpb246ITAscGxhY2VtZW50OlwidG9wXCIsc2VsZWN0b3I6ITEsdGVtcGxhdGU6JzxkaXYgY2xhc3M9XCJ0b29sdGlwXCI+PGRpdiBjbGFzcz1cInRvb2x0aXAtYXJyb3dcIj48L2Rpdj48ZGl2IGNsYXNzPVwidG9vbHRpcC1pbm5lclwiPjwvZGl2PjwvZGl2PicsdHJpZ2dlcjpcImhvdmVyIGZvY3VzXCIsdGl0bGU6XCJcIixkZWxheTowLGh0bWw6ITEsY29udGFpbmVyOiExfSxlLmZuLnRvb2x0aXAubm9Db25mbGljdD1mdW5jdGlvbigpe3JldHVybiBlLmZuLnRvb2x0aXA9bix0aGlzfX0od2luZG93LmpRdWVyeSksIWZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO3ZhciB0PWZ1bmN0aW9uKGUsdCl7dGhpcy5pbml0KFwicG9wb3ZlclwiLGUsdCl9O3QucHJvdG90eXBlPWUuZXh0ZW5kKHt9LGUuZm4udG9vbHRpcC5Db25zdHJ1Y3Rvci5wcm90b3R5cGUse2NvbnN0cnVjdG9yOnQsc2V0Q29udGVudDpmdW5jdGlvbigpe3ZhciBlPXRoaXMudGlwKCksdD10aGlzLmdldFRpdGxlKCksbj10aGlzLmdldENvbnRlbnQoKTtlLmZpbmQoXCIucG9wb3Zlci10aXRsZVwiKVt0aGlzLm9wdGlvbnMuaHRtbD9cImh0bWxcIjpcInRleHRcIl0odCksZS5maW5kKFwiLnBvcG92ZXItY29udGVudFwiKVt0aGlzLm9wdGlvbnMuaHRtbD9cImh0bWxcIjpcInRleHRcIl0obiksZS5yZW1vdmVDbGFzcyhcImZhZGUgdG9wIGJvdHRvbSBsZWZ0IHJpZ2h0IGluXCIpfSxoYXNDb250ZW50OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZ2V0VGl0bGUoKXx8dGhpcy5nZXRDb250ZW50KCl9LGdldENvbnRlbnQ6ZnVuY3Rpb24oKXt2YXIgZSx0PXRoaXMuJGVsZW1lbnQsbj10aGlzLm9wdGlvbnM7cmV0dXJuIGU9KHR5cGVvZiBuLmNvbnRlbnQ9PVwiZnVuY3Rpb25cIj9uLmNvbnRlbnQuY2FsbCh0WzBdKTpuLmNvbnRlbnQpfHx0LmF0dHIoXCJkYXRhLWNvbnRlbnRcIiksZX0sdGlwOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuJHRpcHx8KHRoaXMuJHRpcD1lKHRoaXMub3B0aW9ucy50ZW1wbGF0ZSkpLHRoaXMuJHRpcH0sZGVzdHJveTpmdW5jdGlvbigpe3RoaXMuaGlkZSgpLiRlbGVtZW50Lm9mZihcIi5cIit0aGlzLnR5cGUpLnJlbW92ZURhdGEodGhpcy50eXBlKX19KTt2YXIgbj1lLmZuLnBvcG92ZXI7ZS5mbi5wb3BvdmVyPWZ1bmN0aW9uKG4pe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgcj1lKHRoaXMpLGk9ci5kYXRhKFwicG9wb3ZlclwiKSxzPXR5cGVvZiBuPT1cIm9iamVjdFwiJiZuO2l8fHIuZGF0YShcInBvcG92ZXJcIixpPW5ldyB0KHRoaXMscykpLHR5cGVvZiBuPT1cInN0cmluZ1wiJiZpW25dKCl9KX0sZS5mbi5wb3BvdmVyLkNvbnN0cnVjdG9yPXQsZS5mbi5wb3BvdmVyLmRlZmF1bHRzPWUuZXh0ZW5kKHt9LGUuZm4udG9vbHRpcC5kZWZhdWx0cyx7cGxhY2VtZW50OlwicmlnaHRcIix0cmlnZ2VyOlwiY2xpY2tcIixjb250ZW50OlwiXCIsdGVtcGxhdGU6JzxkaXYgY2xhc3M9XCJwb3BvdmVyXCI+PGRpdiBjbGFzcz1cImFycm93XCI+PC9kaXY+PGgzIGNsYXNzPVwicG9wb3Zlci10aXRsZVwiPjwvaDM+PGRpdiBjbGFzcz1cInBvcG92ZXItY29udGVudFwiPjwvZGl2PjwvZGl2Pid9KSxlLmZuLnBvcG92ZXIubm9Db25mbGljdD1mdW5jdGlvbigpe3JldHVybiBlLmZuLnBvcG92ZXI9bix0aGlzfX0od2luZG93LmpRdWVyeSksIWZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHQodCxuKXt2YXIgcj1lLnByb3h5KHRoaXMucHJvY2Vzcyx0aGlzKSxpPWUodCkuaXMoXCJib2R5XCIpP2Uod2luZG93KTplKHQpLHM7dGhpcy5vcHRpb25zPWUuZXh0ZW5kKHt9LGUuZm4uc2Nyb2xsc3B5LmRlZmF1bHRzLG4pLHRoaXMuJHNjcm9sbEVsZW1lbnQ9aS5vbihcInNjcm9sbC5zY3JvbGwtc3B5LmRhdGEtYXBpXCIsciksdGhpcy5zZWxlY3Rvcj0odGhpcy5vcHRpb25zLnRhcmdldHx8KHM9ZSh0KS5hdHRyKFwiaHJlZlwiKSkmJnMucmVwbGFjZSgvLiooPz0jW15cXHNdKyQpLyxcIlwiKXx8XCJcIikrXCIgLm5hdiBsaSA+IGFcIix0aGlzLiRib2R5PWUoXCJib2R5XCIpLHRoaXMucmVmcmVzaCgpLHRoaXMucHJvY2VzcygpfXQucHJvdG90eXBlPXtjb25zdHJ1Y3Rvcjp0LHJlZnJlc2g6ZnVuY3Rpb24oKXt2YXIgdD10aGlzLG47dGhpcy5vZmZzZXRzPWUoW10pLHRoaXMudGFyZ2V0cz1lKFtdKSxuPXRoaXMuJGJvZHkuZmluZCh0aGlzLnNlbGVjdG9yKS5tYXAoZnVuY3Rpb24oKXt2YXIgbj1lKHRoaXMpLHI9bi5kYXRhKFwidGFyZ2V0XCIpfHxuLmF0dHIoXCJocmVmXCIpLGk9L14jXFx3Ly50ZXN0KHIpJiZlKHIpO3JldHVybiBpJiZpLmxlbmd0aCYmW1tpLnBvc2l0aW9uKCkudG9wKyghZS5pc1dpbmRvdyh0LiRzY3JvbGxFbGVtZW50LmdldCgwKSkmJnQuJHNjcm9sbEVsZW1lbnQuc2Nyb2xsVG9wKCkpLHJdXXx8bnVsbH0pLnNvcnQoZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXS10WzBdfSkuZWFjaChmdW5jdGlvbigpe3Qub2Zmc2V0cy5wdXNoKHRoaXNbMF0pLHQudGFyZ2V0cy5wdXNoKHRoaXNbMV0pfSl9LHByb2Nlc3M6ZnVuY3Rpb24oKXt2YXIgZT10aGlzLiRzY3JvbGxFbGVtZW50LnNjcm9sbFRvcCgpK3RoaXMub3B0aW9ucy5vZmZzZXQsdD10aGlzLiRzY3JvbGxFbGVtZW50WzBdLnNjcm9sbEhlaWdodHx8dGhpcy4kYm9keVswXS5zY3JvbGxIZWlnaHQsbj10LXRoaXMuJHNjcm9sbEVsZW1lbnQuaGVpZ2h0KCkscj10aGlzLm9mZnNldHMsaT10aGlzLnRhcmdldHMscz10aGlzLmFjdGl2ZVRhcmdldCxvO2lmKGU+PW4pcmV0dXJuIHMhPShvPWkubGFzdCgpWzBdKSYmdGhpcy5hY3RpdmF0ZShvKTtmb3Iobz1yLmxlbmd0aDtvLS07KXMhPWlbb10mJmU+PXJbb10mJighcltvKzFdfHxlPD1yW28rMV0pJiZ0aGlzLmFjdGl2YXRlKGlbb10pfSxhY3RpdmF0ZTpmdW5jdGlvbih0KXt2YXIgbixyO3RoaXMuYWN0aXZlVGFyZ2V0PXQsZSh0aGlzLnNlbGVjdG9yKS5wYXJlbnQoXCIuYWN0aXZlXCIpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLHI9dGhpcy5zZWxlY3RvcisnW2RhdGEtdGFyZ2V0PVwiJyt0KydcIl0sJyt0aGlzLnNlbGVjdG9yKydbaHJlZj1cIicrdCsnXCJdJyxuPWUocikucGFyZW50KFwibGlcIikuYWRkQ2xhc3MoXCJhY3RpdmVcIiksbi5wYXJlbnQoXCIuZHJvcGRvd24tbWVudVwiKS5sZW5ndGgmJihuPW4uY2xvc2VzdChcImxpLmRyb3Bkb3duXCIpLmFkZENsYXNzKFwiYWN0aXZlXCIpKSxuLnRyaWdnZXIoXCJhY3RpdmF0ZVwiKX19O3ZhciBuPWUuZm4uc2Nyb2xsc3B5O2UuZm4uc2Nyb2xsc3B5PWZ1bmN0aW9uKG4pe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgcj1lKHRoaXMpLGk9ci5kYXRhKFwic2Nyb2xsc3B5XCIpLHM9dHlwZW9mIG49PVwib2JqZWN0XCImJm47aXx8ci5kYXRhKFwic2Nyb2xsc3B5XCIsaT1uZXcgdCh0aGlzLHMpKSx0eXBlb2Ygbj09XCJzdHJpbmdcIiYmaVtuXSgpfSl9LGUuZm4uc2Nyb2xsc3B5LkNvbnN0cnVjdG9yPXQsZS5mbi5zY3JvbGxzcHkuZGVmYXVsdHM9e29mZnNldDoxMH0sZS5mbi5zY3JvbGxzcHkubm9Db25mbGljdD1mdW5jdGlvbigpe3JldHVybiBlLmZuLnNjcm9sbHNweT1uLHRoaXN9LGUod2luZG93KS5vbihcImxvYWRcIixmdW5jdGlvbigpe2UoJ1tkYXRhLXNweT1cInNjcm9sbFwiXScpLmVhY2goZnVuY3Rpb24oKXt2YXIgdD1lKHRoaXMpO3Quc2Nyb2xsc3B5KHQuZGF0YSgpKX0pfSl9KHdpbmRvdy5qUXVlcnkpLCFmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjt2YXIgdD1mdW5jdGlvbih0KXt0aGlzLmVsZW1lbnQ9ZSh0KX07dC5wcm90b3R5cGU9e2NvbnN0cnVjdG9yOnQsc2hvdzpmdW5jdGlvbigpe3ZhciB0PXRoaXMuZWxlbWVudCxuPXQuY2xvc2VzdChcInVsOm5vdCguZHJvcGRvd24tbWVudSlcIikscj10LmF0dHIoXCJkYXRhLXRhcmdldFwiKSxpLHMsbztyfHwocj10LmF0dHIoXCJocmVmXCIpLHI9ciYmci5yZXBsYWNlKC8uKig/PSNbXlxcc10qJCkvLFwiXCIpKTtpZih0LnBhcmVudChcImxpXCIpLmhhc0NsYXNzKFwiYWN0aXZlXCIpKXJldHVybjtpPW4uZmluZChcIi5hY3RpdmU6bGFzdCBhXCIpWzBdLG89ZS5FdmVudChcInNob3dcIix7cmVsYXRlZFRhcmdldDppfSksdC50cmlnZ2VyKG8pO2lmKG8uaXNEZWZhdWx0UHJldmVudGVkKCkpcmV0dXJuO3M9ZShyKSx0aGlzLmFjdGl2YXRlKHQucGFyZW50KFwibGlcIiksbiksdGhpcy5hY3RpdmF0ZShzLHMucGFyZW50KCksZnVuY3Rpb24oKXt0LnRyaWdnZXIoe3R5cGU6XCJzaG93blwiLHJlbGF0ZWRUYXJnZXQ6aX0pfSl9LGFjdGl2YXRlOmZ1bmN0aW9uKHQsbixyKXtmdW5jdGlvbiBvKCl7aS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKS5maW5kKFwiPiAuZHJvcGRvd24tbWVudSA+IC5hY3RpdmVcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIiksdC5hZGRDbGFzcyhcImFjdGl2ZVwiKSxzPyh0WzBdLm9mZnNldFdpZHRoLHQuYWRkQ2xhc3MoXCJpblwiKSk6dC5yZW1vdmVDbGFzcyhcImZhZGVcIiksdC5wYXJlbnQoXCIuZHJvcGRvd24tbWVudVwiKSYmdC5jbG9zZXN0KFwibGkuZHJvcGRvd25cIikuYWRkQ2xhc3MoXCJhY3RpdmVcIiksciYmcigpfXZhciBpPW4uZmluZChcIj4gLmFjdGl2ZVwiKSxzPXImJmUuc3VwcG9ydC50cmFuc2l0aW9uJiZpLmhhc0NsYXNzKFwiZmFkZVwiKTtzP2kub25lKGUuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCxvKTpvKCksaS5yZW1vdmVDbGFzcyhcImluXCIpfX07dmFyIG49ZS5mbi50YWI7ZS5mbi50YWI9ZnVuY3Rpb24obil7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciByPWUodGhpcyksaT1yLmRhdGEoXCJ0YWJcIik7aXx8ci5kYXRhKFwidGFiXCIsaT1uZXcgdCh0aGlzKSksdHlwZW9mIG49PVwic3RyaW5nXCImJmlbbl0oKX0pfSxlLmZuLnRhYi5Db25zdHJ1Y3Rvcj10LGUuZm4udGFiLm5vQ29uZmxpY3Q9ZnVuY3Rpb24oKXtyZXR1cm4gZS5mbi50YWI9bix0aGlzfSxlKGRvY3VtZW50KS5vbihcImNsaWNrLnRhYi5kYXRhLWFwaVwiLCdbZGF0YS10b2dnbGU9XCJ0YWJcIl0sIFtkYXRhLXRvZ2dsZT1cInBpbGxcIl0nLGZ1bmN0aW9uKHQpe3QucHJldmVudERlZmF1bHQoKSxlKHRoaXMpLnRhYihcInNob3dcIil9KX0od2luZG93LmpRdWVyeSksIWZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO3ZhciB0PWZ1bmN0aW9uKHQsbil7dGhpcy4kZWxlbWVudD1lKHQpLHRoaXMub3B0aW9ucz1lLmV4dGVuZCh7fSxlLmZuLnR5cGVhaGVhZC5kZWZhdWx0cyxuKSx0aGlzLm1hdGNoZXI9dGhpcy5vcHRpb25zLm1hdGNoZXJ8fHRoaXMubWF0Y2hlcix0aGlzLnNvcnRlcj10aGlzLm9wdGlvbnMuc29ydGVyfHx0aGlzLnNvcnRlcix0aGlzLmhpZ2hsaWdodGVyPXRoaXMub3B0aW9ucy5oaWdobGlnaHRlcnx8dGhpcy5oaWdobGlnaHRlcix0aGlzLnVwZGF0ZXI9dGhpcy5vcHRpb25zLnVwZGF0ZXJ8fHRoaXMudXBkYXRlcix0aGlzLnNvdXJjZT10aGlzLm9wdGlvbnMuc291cmNlLHRoaXMuJG1lbnU9ZSh0aGlzLm9wdGlvbnMubWVudSksdGhpcy5zaG93bj0hMSx0aGlzLmxpc3RlbigpfTt0LnByb3RvdHlwZT17Y29uc3RydWN0b3I6dCxzZWxlY3Q6ZnVuY3Rpb24oKXt2YXIgZT10aGlzLiRtZW51LmZpbmQoXCIuYWN0aXZlXCIpLmF0dHIoXCJkYXRhLXZhbHVlXCIpO3JldHVybiB0aGlzLiRlbGVtZW50LnZhbCh0aGlzLnVwZGF0ZXIoZSkpLmNoYW5nZSgpLHRoaXMuaGlkZSgpfSx1cGRhdGVyOmZ1bmN0aW9uKGUpe3JldHVybiBlfSxzaG93OmZ1bmN0aW9uKCl7dmFyIHQ9ZS5leHRlbmQoe30sdGhpcy4kZWxlbWVudC5wb3NpdGlvbigpLHtoZWlnaHQ6dGhpcy4kZWxlbWVudFswXS5vZmZzZXRIZWlnaHR9KTtyZXR1cm4gdGhpcy4kbWVudS5pbnNlcnRBZnRlcih0aGlzLiRlbGVtZW50KS5jc3Moe3RvcDp0LnRvcCt0LmhlaWdodCxsZWZ0OnQubGVmdH0pLnNob3coKSx0aGlzLnNob3duPSEwLHRoaXN9LGhpZGU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy4kbWVudS5oaWRlKCksdGhpcy5zaG93bj0hMSx0aGlzfSxsb29rdXA6ZnVuY3Rpb24odCl7dmFyIG47cmV0dXJuIHRoaXMucXVlcnk9dGhpcy4kZWxlbWVudC52YWwoKSwhdGhpcy5xdWVyeXx8dGhpcy5xdWVyeS5sZW5ndGg8dGhpcy5vcHRpb25zLm1pbkxlbmd0aD90aGlzLnNob3duP3RoaXMuaGlkZSgpOnRoaXM6KG49ZS5pc0Z1bmN0aW9uKHRoaXMuc291cmNlKT90aGlzLnNvdXJjZSh0aGlzLnF1ZXJ5LGUucHJveHkodGhpcy5wcm9jZXNzLHRoaXMpKTp0aGlzLnNvdXJjZSxuP3RoaXMucHJvY2VzcyhuKTp0aGlzKX0scHJvY2VzczpmdW5jdGlvbih0KXt2YXIgbj10aGlzO3JldHVybiB0PWUuZ3JlcCh0LGZ1bmN0aW9uKGUpe3JldHVybiBuLm1hdGNoZXIoZSl9KSx0PXRoaXMuc29ydGVyKHQpLHQubGVuZ3RoP3RoaXMucmVuZGVyKHQuc2xpY2UoMCx0aGlzLm9wdGlvbnMuaXRlbXMpKS5zaG93KCk6dGhpcy5zaG93bj90aGlzLmhpZGUoKTp0aGlzfSxtYXRjaGVyOmZ1bmN0aW9uKGUpe3JldHVybn5lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZih0aGlzLnF1ZXJ5LnRvTG93ZXJDYXNlKCkpfSxzb3J0ZXI6ZnVuY3Rpb24oZSl7dmFyIHQ9W10sbj1bXSxyPVtdLGk7d2hpbGUoaT1lLnNoaWZ0KCkpaS50b0xvd2VyQ2FzZSgpLmluZGV4T2YodGhpcy5xdWVyeS50b0xvd2VyQ2FzZSgpKT9+aS5pbmRleE9mKHRoaXMucXVlcnkpP24ucHVzaChpKTpyLnB1c2goaSk6dC5wdXNoKGkpO3JldHVybiB0LmNvbmNhdChuLHIpfSxoaWdobGlnaHRlcjpmdW5jdGlvbihlKXt2YXIgdD10aGlzLnF1ZXJ5LnJlcGxhY2UoL1tcXC1cXFtcXF17fSgpKis/LixcXFxcXFxeJHwjXFxzXS9nLFwiXFxcXCQmXCIpO3JldHVybiBlLnJlcGxhY2UobmV3IFJlZ0V4cChcIihcIit0K1wiKVwiLFwiaWdcIiksZnVuY3Rpb24oZSx0KXtyZXR1cm5cIjxzdHJvbmc+XCIrdCtcIjwvc3Ryb25nPlwifSl9LHJlbmRlcjpmdW5jdGlvbih0KXt2YXIgbj10aGlzO3JldHVybiB0PWUodCkubWFwKGZ1bmN0aW9uKHQscil7cmV0dXJuIHQ9ZShuLm9wdGlvbnMuaXRlbSkuYXR0cihcImRhdGEtdmFsdWVcIixyKSx0LmZpbmQoXCJhXCIpLmh0bWwobi5oaWdobGlnaHRlcihyKSksdFswXX0pLHQuZmlyc3QoKS5hZGRDbGFzcyhcImFjdGl2ZVwiKSx0aGlzLiRtZW51Lmh0bWwodCksdGhpc30sbmV4dDpmdW5jdGlvbih0KXt2YXIgbj10aGlzLiRtZW51LmZpbmQoXCIuYWN0aXZlXCIpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLHI9bi5uZXh0KCk7ci5sZW5ndGh8fChyPWUodGhpcy4kbWVudS5maW5kKFwibGlcIilbMF0pKSxyLmFkZENsYXNzKFwiYWN0aXZlXCIpfSxwcmV2OmZ1bmN0aW9uKGUpe3ZhciB0PXRoaXMuJG1lbnUuZmluZChcIi5hY3RpdmVcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIiksbj10LnByZXYoKTtuLmxlbmd0aHx8KG49dGhpcy4kbWVudS5maW5kKFwibGlcIikubGFzdCgpKSxuLmFkZENsYXNzKFwiYWN0aXZlXCIpfSxsaXN0ZW46ZnVuY3Rpb24oKXt0aGlzLiRlbGVtZW50Lm9uKFwiZm9jdXNcIixlLnByb3h5KHRoaXMuZm9jdXMsdGhpcykpLm9uKFwiYmx1clwiLGUucHJveHkodGhpcy5ibHVyLHRoaXMpKS5vbihcImtleXByZXNzXCIsZS5wcm94eSh0aGlzLmtleXByZXNzLHRoaXMpKS5vbihcImtleXVwXCIsZS5wcm94eSh0aGlzLmtleXVwLHRoaXMpKSx0aGlzLmV2ZW50U3VwcG9ydGVkKFwia2V5ZG93blwiKSYmdGhpcy4kZWxlbWVudC5vbihcImtleWRvd25cIixlLnByb3h5KHRoaXMua2V5ZG93bix0aGlzKSksdGhpcy4kbWVudS5vbihcImNsaWNrXCIsZS5wcm94eSh0aGlzLmNsaWNrLHRoaXMpKS5vbihcIm1vdXNlZW50ZXJcIixcImxpXCIsZS5wcm94eSh0aGlzLm1vdXNlZW50ZXIsdGhpcykpLm9uKFwibW91c2VsZWF2ZVwiLFwibGlcIixlLnByb3h5KHRoaXMubW91c2VsZWF2ZSx0aGlzKSl9LGV2ZW50U3VwcG9ydGVkOmZ1bmN0aW9uKGUpe3ZhciB0PWUgaW4gdGhpcy4kZWxlbWVudDtyZXR1cm4gdHx8KHRoaXMuJGVsZW1lbnQuc2V0QXR0cmlidXRlKGUsXCJyZXR1cm47XCIpLHQ9dHlwZW9mIHRoaXMuJGVsZW1lbnRbZV09PVwiZnVuY3Rpb25cIiksdH0sbW92ZTpmdW5jdGlvbihlKXtpZighdGhpcy5zaG93bilyZXR1cm47c3dpdGNoKGUua2V5Q29kZSl7Y2FzZSA5OmNhc2UgMTM6Y2FzZSAyNzplLnByZXZlbnREZWZhdWx0KCk7YnJlYWs7Y2FzZSAzODplLnByZXZlbnREZWZhdWx0KCksdGhpcy5wcmV2KCk7YnJlYWs7Y2FzZSA0MDplLnByZXZlbnREZWZhdWx0KCksdGhpcy5uZXh0KCl9ZS5zdG9wUHJvcGFnYXRpb24oKX0sa2V5ZG93bjpmdW5jdGlvbih0KXt0aGlzLnN1cHByZXNzS2V5UHJlc3NSZXBlYXQ9fmUuaW5BcnJheSh0LmtleUNvZGUsWzQwLDM4LDksMTMsMjddKSx0aGlzLm1vdmUodCl9LGtleXByZXNzOmZ1bmN0aW9uKGUpe2lmKHRoaXMuc3VwcHJlc3NLZXlQcmVzc1JlcGVhdClyZXR1cm47dGhpcy5tb3ZlKGUpfSxrZXl1cDpmdW5jdGlvbihlKXtzd2l0Y2goZS5rZXlDb2RlKXtjYXNlIDQwOmNhc2UgMzg6Y2FzZSAxNjpjYXNlIDE3OmNhc2UgMTg6YnJlYWs7Y2FzZSA5OmNhc2UgMTM6aWYoIXRoaXMuc2hvd24pcmV0dXJuO3RoaXMuc2VsZWN0KCk7YnJlYWs7Y2FzZSAyNzppZighdGhpcy5zaG93bilyZXR1cm47dGhpcy5oaWRlKCk7YnJlYWs7ZGVmYXVsdDp0aGlzLmxvb2t1cCgpfWUuc3RvcFByb3BhZ2F0aW9uKCksZS5wcmV2ZW50RGVmYXVsdCgpfSxmb2N1czpmdW5jdGlvbihlKXt0aGlzLmZvY3VzZWQ9ITB9LGJsdXI6ZnVuY3Rpb24oZSl7dGhpcy5mb2N1c2VkPSExLCF0aGlzLm1vdXNlZG92ZXImJnRoaXMuc2hvd24mJnRoaXMuaGlkZSgpfSxjbGljazpmdW5jdGlvbihlKXtlLnN0b3BQcm9wYWdhdGlvbigpLGUucHJldmVudERlZmF1bHQoKSx0aGlzLnNlbGVjdCgpLHRoaXMuJGVsZW1lbnQuZm9jdXMoKX0sbW91c2VlbnRlcjpmdW5jdGlvbih0KXt0aGlzLm1vdXNlZG92ZXI9ITAsdGhpcy4kbWVudS5maW5kKFwiLmFjdGl2ZVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKSxlKHQuY3VycmVudFRhcmdldCkuYWRkQ2xhc3MoXCJhY3RpdmVcIil9LG1vdXNlbGVhdmU6ZnVuY3Rpb24oZSl7dGhpcy5tb3VzZWRvdmVyPSExLCF0aGlzLmZvY3VzZWQmJnRoaXMuc2hvd24mJnRoaXMuaGlkZSgpfX07dmFyIG49ZS5mbi50eXBlYWhlYWQ7ZS5mbi50eXBlYWhlYWQ9ZnVuY3Rpb24obil7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciByPWUodGhpcyksaT1yLmRhdGEoXCJ0eXBlYWhlYWRcIikscz10eXBlb2Ygbj09XCJvYmplY3RcIiYmbjtpfHxyLmRhdGEoXCJ0eXBlYWhlYWRcIixpPW5ldyB0KHRoaXMscykpLHR5cGVvZiBuPT1cInN0cmluZ1wiJiZpW25dKCl9KX0sZS5mbi50eXBlYWhlYWQuZGVmYXVsdHM9e3NvdXJjZTpbXSxpdGVtczo4LG1lbnU6Jzx1bCBjbGFzcz1cInR5cGVhaGVhZCBkcm9wZG93bi1tZW51XCI+PC91bD4nLGl0ZW06JzxsaT48YSBocmVmPVwiI1wiPjwvYT48L2xpPicsbWluTGVuZ3RoOjF9LGUuZm4udHlwZWFoZWFkLkNvbnN0cnVjdG9yPXQsZS5mbi50eXBlYWhlYWQubm9Db25mbGljdD1mdW5jdGlvbigpe3JldHVybiBlLmZuLnR5cGVhaGVhZD1uLHRoaXN9LGUoZG9jdW1lbnQpLm9uKFwiZm9jdXMudHlwZWFoZWFkLmRhdGEtYXBpXCIsJ1tkYXRhLXByb3ZpZGU9XCJ0eXBlYWhlYWRcIl0nLGZ1bmN0aW9uKHQpe3ZhciBuPWUodGhpcyk7aWYobi5kYXRhKFwidHlwZWFoZWFkXCIpKXJldHVybjtuLnR5cGVhaGVhZChuLmRhdGEoKSl9KX0od2luZG93LmpRdWVyeSksIWZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO3ZhciB0PWZ1bmN0aW9uKHQsbil7dGhpcy5vcHRpb25zPWUuZXh0ZW5kKHt9LGUuZm4uYWZmaXguZGVmYXVsdHMsbiksdGhpcy4kd2luZG93PWUod2luZG93KS5vbihcInNjcm9sbC5hZmZpeC5kYXRhLWFwaVwiLGUucHJveHkodGhpcy5jaGVja1Bvc2l0aW9uLHRoaXMpKS5vbihcImNsaWNrLmFmZml4LmRhdGEtYXBpXCIsZS5wcm94eShmdW5jdGlvbigpe3NldFRpbWVvdXQoZS5wcm94eSh0aGlzLmNoZWNrUG9zaXRpb24sdGhpcyksMSl9LHRoaXMpKSx0aGlzLiRlbGVtZW50PWUodCksdGhpcy5jaGVja1Bvc2l0aW9uKCl9O3QucHJvdG90eXBlLmNoZWNrUG9zaXRpb249ZnVuY3Rpb24oKXtpZighdGhpcy4kZWxlbWVudC5pcyhcIjp2aXNpYmxlXCIpKXJldHVybjt2YXIgdD1lKGRvY3VtZW50KS5oZWlnaHQoKSxuPXRoaXMuJHdpbmRvdy5zY3JvbGxUb3AoKSxyPXRoaXMuJGVsZW1lbnQub2Zmc2V0KCksaT10aGlzLm9wdGlvbnMub2Zmc2V0LHM9aS5ib3R0b20sbz1pLnRvcCx1PVwiYWZmaXggYWZmaXgtdG9wIGFmZml4LWJvdHRvbVwiLGE7dHlwZW9mIGkhPVwib2JqZWN0XCImJihzPW89aSksdHlwZW9mIG89PVwiZnVuY3Rpb25cIiYmKG89aS50b3AoKSksdHlwZW9mIHM9PVwiZnVuY3Rpb25cIiYmKHM9aS5ib3R0b20oKSksYT10aGlzLnVucGluIT1udWxsJiZuK3RoaXMudW5waW48PXIudG9wPyExOnMhPW51bGwmJnIudG9wK3RoaXMuJGVsZW1lbnQuaGVpZ2h0KCk+PXQtcz9cImJvdHRvbVwiOm8hPW51bGwmJm48PW8/XCJ0b3BcIjohMTtpZih0aGlzLmFmZml4ZWQ9PT1hKXJldHVybjt0aGlzLmFmZml4ZWQ9YSx0aGlzLnVucGluPWE9PVwiYm90dG9tXCI/ci50b3AtbjpudWxsLHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3ModSkuYWRkQ2xhc3MoXCJhZmZpeFwiKyhhP1wiLVwiK2E6XCJcIikpfTt2YXIgbj1lLmZuLmFmZml4O2UuZm4uYWZmaXg9ZnVuY3Rpb24obil7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciByPWUodGhpcyksaT1yLmRhdGEoXCJhZmZpeFwiKSxzPXR5cGVvZiBuPT1cIm9iamVjdFwiJiZuO2l8fHIuZGF0YShcImFmZml4XCIsaT1uZXcgdCh0aGlzLHMpKSx0eXBlb2Ygbj09XCJzdHJpbmdcIiYmaVtuXSgpfSl9LGUuZm4uYWZmaXguQ29uc3RydWN0b3I9dCxlLmZuLmFmZml4LmRlZmF1bHRzPXtvZmZzZXQ6MH0sZS5mbi5hZmZpeC5ub0NvbmZsaWN0PWZ1bmN0aW9uKCl7cmV0dXJuIGUuZm4uYWZmaXg9bix0aGlzfSxlKHdpbmRvdykub24oXCJsb2FkXCIsZnVuY3Rpb24oKXtlKCdbZGF0YS1zcHk9XCJhZmZpeFwiXScpLmVhY2goZnVuY3Rpb24oKXt2YXIgdD1lKHRoaXMpLG49dC5kYXRhKCk7bi5vZmZzZXQ9bi5vZmZzZXR8fHt9LG4ub2Zmc2V0Qm90dG9tJiYobi5vZmZzZXQuYm90dG9tPW4ub2Zmc2V0Qm90dG9tKSxuLm9mZnNldFRvcCYmKG4ub2Zmc2V0LnRvcD1uLm9mZnNldFRvcCksdC5hZmZpeChuKX0pfSl9KHdpbmRvdy5qUXVlcnkpOyIsIi8vJCh3aW5kb3cpLmxvYWQoZnVuY3Rpb24oKSB7XHJcbi8vYWNjb3JkaW9uLmpzXHJcbnZhciBhY2NvcmRpb25Db250cm9sID0gJCgnLmFjY29yZGlvbiAuYWNjb3JkaW9uLWNvbnRyb2wnKTtcclxuYWNjb3JkaW9uQ29udHJvbC5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgJGFjY29yZGlvbiA9ICR0aGlzLmNsb3Nlc3QoJy5hY2NvcmRpb24nKTtcclxuXHJcbiAgICBpZiAoJGFjY29yZGlvbi5oYXNDbGFzcygnb3BlbicpKSB7XHJcbiAgICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50JykuaGlkZSgzMDApO1xyXG4gICAgICAkYWNjb3JkaW9uLnJlbW92ZUNsYXNzKCdvcGVuJylcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50Jykuc2hvdygzMDApO1xyXG4gICAgICAkYWNjb3JkaW9uLmFkZENsYXNzKCdvcGVuJylcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9KTtcclxuYWNjb3JkaW9uQ29udHJvbC5zaG93KCk7XHJcbi8vfSlcclxuXHJcblxyXG4vL2Z1bmN0aW9ucy5qc1xyXG5vYmplY3RzID0gZnVuY3Rpb24gKGEsYikge1xyXG4gIHZhciBjID0gYixcclxuICAgIGtleTtcclxuICBmb3IgKGtleSBpbiBhKSB7XHJcbiAgICBpZiAoYS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgIGNba2V5XSA9IGtleSBpbiBiID8gYltrZXldIDogYVtrZXldO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gYztcclxufTtcclxuXHJcbi8v0J/RgNC+0LLQtdGA0LrQsCDQsdC40YLRiyDQutCw0YDRgtC40L3QvtC6LlxyXG4vLyBpbWYuanNcclxuJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcclxuICBmdW5jdGlvbiBpbWdfbG9hZF9maW5pc2goKXtcclxuICAgIGRhdGE9dGhpcztcclxuICAgIGlmKGRhdGEudHlwZT09MCkge1xyXG4gICAgICBkYXRhLmltZy5hdHRyKCdzcmMnLCBkYXRhLnNyYyk7XHJcbiAgICB9ZWxzZXtcclxuICAgICAgZGF0YS5pbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnK2RhdGEuc3JjKycpJyk7XHJcbiAgICAgIGRhdGEuaW1nLnJlbW92ZUNsYXNzKCdub19hdmEnKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8v0YLQtdGB0YIg0LvQvtCz0L4g0LzQsNCz0LDQt9C40L3QsFxyXG4gIGltZ3M9JCgnc2VjdGlvbjpub3QoLm5hdmlnYXRpb24pJykuZmluZCgnLmxvZ28gaW1nJyk7XHJcbiAgZm9yICh2YXIgaT0wO2k8aW1ncy5sZW5ndGg7aSsrKXtcclxuICAgIGltZz1pbWdzLmVxKGkpO1xyXG4gICAgc3JjPWltZy5hdHRyKCdzcmMnKTtcclxuICAgIGltZy5hdHRyKCdzcmMnLCcvaW1hZ2VzL3RlbXBsYXRlLWxvZ28uanBnJyk7XHJcbiAgICBkYXRhPXtcclxuICAgICAgc3JjOnNyYyxcclxuICAgICAgaW1nOmltZyxcclxuICAgICAgdHlwZTowIC8vINC00LvRjyBpbWdbc3JjXVxyXG4gICAgfTtcclxuICAgIGltYWdlPSQoJzxpbWcvPicse1xyXG4gICAgICBzcmM6c3JjXHJcbiAgICB9KS5vbignbG9hZCcsaW1nX2xvYWRfZmluaXNoLmJpbmQoZGF0YSkpXHJcbiAgfVxyXG5cclxuICAvL9GC0LXRgdGCINCw0LLQsNGC0LDRgNC+0Log0LIg0LrQvtC80LXQvdGC0LDRgNC40Y/RhVxyXG4gIGltZ3M9JCgnLmNvbW1lbnQtcGhvdG8nKTtcclxuICBmb3IgKHZhciBpPTA7aTxpbWdzLmxlbmd0aDtpKyspe1xyXG4gICAgaW1nPWltZ3MuZXEoaSk7XHJcbiAgICBpZihpbWcuaGFzQ2xhc3MoJ25vX2F2YScpKXtcclxuICAgICAgY29udGludWU7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNyYz1pbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJyk7XHJcbiAgICBzcmM9c3JjLnJlcGxhY2UoJ3VybChcIicsJycpO1xyXG4gICAgc3JjPXNyYy5yZXBsYWNlKCdcIiknLCcnKTtcclxuICAgIGltZy5hZGRDbGFzcygnbm9fYXZhJyk7XHJcblxyXG4gICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgvaW1hZ2VzL25vX2F2YS5wbmcpJyk7XHJcbiAgICBkYXRhPXtcclxuICAgICAgc3JjOnNyYyxcclxuICAgICAgaW1nOmltZyxcclxuICAgICAgdHlwZToxIC8vINC00LvRjyDRhNC+0L3QvtCy0YvRhSDQutCw0YDRgtC40L3QvtC6XHJcbiAgICB9O1xyXG4gICAgaW1hZ2U9JCgnPGltZy8+Jyx7XHJcbiAgICAgIHNyYzpzcmNcclxuICAgIH0pLm9uKCdsb2FkJyxpbWdfbG9hZF9maW5pc2guYmluZChkYXRhKSlcclxuICB9XHJcbn0pO1xyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gIGVscz0kKCcuYWpheF9sb2FkJyk7XHJcbiAgZm9yKGk9MDtpPGVscy5sZW5ndGg7aSsrKXtcclxuICAgIGVsPWVscy5lcShpKTtcclxuICAgIHVybD1lbC5hdHRyKCdyZXMnKTtcclxuICAgICQuZ2V0KHVybCxmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAkdGhpcz0kKHRoaXMpO1xyXG4gICAgICAkdGhpcy5odG1sKGRhdGEpO1xyXG4gICAgICBhamF4Rm9ybSgkdGhpcyk7XHJcbiAgICB9LmJpbmQoZWwpKVxyXG4gIH1cclxufSkoKTtcclxuXHJcblxyXG4vL2Zvcm1zLmpzXHJcbiQoJ2lucHV0W3R5cGU9ZmlsZV0nKS5vbignY2hhbmdlJyxmdW5jdGlvbihldnQpe1xyXG4gIHZhciBmaWxlID0gZXZ0LnRhcmdldC5maWxlczsgLy8gRmlsZUxpc3Qgb2JqZWN0XHJcbiAgdmFyIGYgPSBmaWxlWzBdO1xyXG4gIC8vIE9ubHkgcHJvY2VzcyBpbWFnZSBmaWxlcy5cclxuICBpZiAoIWYudHlwZS5tYXRjaCgnaW1hZ2UuKicpKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG5cclxuICBkYXRhPSB7XHJcbiAgICAnZWwnOiB0aGlzLFxyXG4gICAgJ2YnOiBmXHJcbiAgfTtcclxuICByZWFkZXIub25sb2FkID0gKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbihlKSB7XHJcbiAgICAgIGltZz0kKCdbZm9yPVwiJytkYXRhLmVsLm5hbWUrJ1wiXScpO1xyXG4gICAgICBpZihpbWcubGVuZ3RoPjApe1xyXG4gICAgICAgIGltZy5hdHRyKCdzcmMnLGUudGFyZ2V0LnJlc3VsdClcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9KShkYXRhKTtcclxuICAvLyBSZWFkIGluIHRoZSBpbWFnZSBmaWxlIGFzIGEgZGF0YSBVUkwuXHJcbiAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZik7XHJcbn0pO1xyXG5cclxuJCgnYm9keScpLm9uKCdjbGljaycsJ2EuYWpheEZvcm1PcGVuJyxmdW5jdGlvbihlKXtcclxuICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgaHJlZj10aGlzLmhyZWYuc3BsaXQoJyMnKTtcclxuICBocmVmPWhyZWZbaHJlZi5sZW5ndGgtMV07XHJcblxyXG4gIGRhdGE9e1xyXG4gICAgYnV0dG9uWWVzOmZhbHNlLFxyXG4gICAgbm90eWZ5X2NsYXNzOlwibm90aWZ5X3doaXRlIGxvYWRpbmdcIixcclxuICAgIHF1ZXN0aW9uOicnXHJcbiAgfTtcclxuICBtb2RhbF9jbGFzcz0kKHRoaXMpLmRhdGEoJ21vZGFsLWNsYXNzJyk7XHJcblxyXG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxuICAkLmdldCgnLycraHJlZixmdW5jdGlvbihkYXRhKXtcclxuICAgICQoJy5ub3RpZnlfYm94JykucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgICQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpLmh0bWwoZGF0YS5odG1sKTtcclxuICAgIGFqYXhGb3JtKCQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpKTtcclxuICAgIGlmKG1vZGFsX2NsYXNzKXtcclxuICAgICAgJCgnLm5vdGlmeV9ib3ggLm5vdGlmeV9jb250ZW50IC5yb3cnKS5hZGRDbGFzcyhtb2RhbF9jbGFzcyk7XHJcbiAgICB9XHJcbiAgfSwnanNvbicpXHJcbn0pO1xyXG5cclxuLy8gJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoe1xyXG4vLyAgIGRlbGF5OiB7XHJcbi8vICAgICBzaG93OiA1MDAsIGhpZGU6IDIwMDBcclxuLy8gICB9XHJcbi8vIH0pO1xyXG5cclxuLy8gJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLm9uKCdjbGljaycsZnVuY3Rpb24gKGUpIHtcclxuLy8gICAkdGhpcz0kKHRoaXMpO1xyXG4vLyAgIGlmKCR0aGlzLmNsb3Nlc3QoJ3VsJykuaGFzQ2xhc3MoJ3BhZ2luYXRlJykpIHtcclxuLy8gICAgIC8v0LTQu9GPINC/0LDQs9C40L3QsNGG0LjQuCDRgdGB0YvQu9C60LAg0LTQvtC70LbQvdCwINGA0LDQsdC+0YLQsNGC0YxcclxuLy8gICAgIHJldHVybiB0cnVlO1xyXG4vLyAgIH1cclxuLy8gICBpZigkdGhpcy5oYXNDbGFzcygnd29ya0hyZWYnKSl7XHJcbi8vICAgICAvL9CV0YHQu9C4INGB0YHRi9C70LrQsCDQv9C+0LzQtdGH0LXQvdC90LAg0LrQsNC6INGA0LDQsdC+0YfQsNGPINGC0L4g0L3Rg9C20L3QviDQv9C10YDQtdGF0L7QtNC40YLRjFxyXG4vLyAgICAgcmV0dXJuIHRydWU7XHJcbi8vICAgfVxyXG4vLyAgIGUucHJldmVudERlZmF1bHQoKTtcclxuLy8gICByZXR1cm4gZmFsc2U7XHJcbi8vIH0pO1xyXG5cclxuXHJcbiQoJy5hamF4LWFjdGlvbicpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcclxuICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgdmFyIHN0YXR1cyA9ICQodGhpcykuZGF0YSgndmFsdWUnKTtcclxuICB2YXIgaHJlZiA9ICQodGhpcykuYXR0cignaHJlZicpO1xyXG4gIHZhciBpZHMgPSAkKCcjZ3JpZC1hamF4LWFjdGlvbicpLnlpaUdyaWRWaWV3KCdnZXRTZWxlY3RlZFJvd3MnKTtcclxuICBpZiAoaWRzLmxlbmd0aCA+IDApIHtcclxuICAgIGlmICghY29uZmlybSgn0J/QvtC00YLQstC10YDQtNC40YLQtSDQuNC30LzQtdC90LXQvdC40LUg0LfQsNC/0LjRgdC10LknKSkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgICQuYWpheCh7XHJcbiAgICAgIHVybDogaHJlZixcclxuICAgICAgdHlwZTogJ3Bvc3QnLFxyXG4gICAgICBkYXRhVHlwZTogJ2pzb24nLFxyXG4gICAgICBkYXRhOiB7XHJcbiAgICAgICAgc3RhdHVzOiBzdGF0dXMsXHJcbiAgICAgICAgaWQ6IGlkc1xyXG4gICAgICB9XHJcbiAgICB9KS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgJCgnI2dyaWQtYWpheC1hY3Rpb24nKS55aWlHcmlkVmlldyhcImFwcGx5RmlsdGVyXCIpO1xyXG4gICAgICBpZiAoZGF0YS5lcnJvciAhPSBmYWxzZSkge1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Cf0YDQvtC40LfQvtGI0LvQsCDQvtGI0LjQsdC60LAhJyx0eXBlOidlcnInfSlcclxuICAgICAgfVxyXG4gICAgfSkuZmFpbChmdW5jdGlvbihkYXRhKXtcclxuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0J/RgNC+0LjQt9C+0YjQu9CwINC+0YjQuNCx0LrQsCEnLHR5cGU6J2Vycid9KVxyXG4gICAgfSk7XHJcbiAgfSBlbHNlIHtcclxuICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Cd0LXQvtCx0YXQvtC00LjQvNC+INCy0YvQsdGA0LDRgtGMINGN0LvQtdC80LXQvdGC0YshJyx0eXBlOidlcnInfSlcclxuICB9XHJcbn0pO1xyXG5cclxuJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAkKCcuZWRpdGlibGVbZGlzYWJsZWRdJykub24oJ2NsaWNrJyxmdW5jdGlvbiAoKSB7XHJcbiAgICAkKHRoaXMpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpXHJcbiAgfSlcclxuXHJcbiAgJCgnLmVkaXRpYmxlW2Rpc2FibGVkXScpLm9uKCdtb3VzZWRvd24nLGZ1bmN0aW9uICgpIHtcclxuICAgICQodGhpcykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSlcclxuICB9KVxyXG5cclxuICBidG49JzxidXR0b24gY2xhc3M9dW5sb2NrPjxpIGNsYXNzPVwiZmEgZmEtdW5sb2NrIGZhLTRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+PC9idXR0b24+JztcclxuICBidG49JChidG4pO1xyXG4gIGJ0bi5vbignY2xpY2snLGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAkdGhpcz0kKHRoaXMpO1xyXG4gICAgaW5wPSR0aGlzLnByZXYoKTtcclxuICAgIGlucC5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9KTtcclxuICAkKCcuZWRpdGlibGVbZGlzYWJsZWRdJykuYWZ0ZXIoYnRuKVxyXG59KTtcclxuXHJcbiQoZnVuY3Rpb24oKSB7XHJcbiAgdmFyIG1lbnUgPSB7XHJcbiAgICBjb250cm9sOiB7XHJcbiAgICAgIGhlYWRlclN0b3Jlc01lbnU6ICQoXCIjdG9wXCIpLmZpbmQoXCIuc3VibWVudS1oYW5kbFwiKSxcclxuICAgICAgc3RvcmVzU3VibWVudXM6ICQoXCIjdG9wXCIpLmZpbmQoXCIuc3VibWVudS1oYW5kbFwiKS5maW5kKFwiLnN1Ym1lbnVcIiksXHJcbiAgICAgIGV2ZW50czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHNlbGYuaGVhZGVyU3RvcmVzTWVudS5ob3ZlcihmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHZhciBzdWJtZW51ID0gJCh0aGlzKS5maW5kKCcuc3VibWVudScpO1xyXG4gICAgICAgICAgaWYoJCh3aW5kb3cpLndpZHRoKCkgPiA5OTEpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYuc3RvcmVIaWRlKTtcclxuICAgICAgICAgICAgc2VsZi5zdG9yZXNTdWJtZW51cy5jc3MoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcclxuICAgICAgICAgICAgc2VsZi5zdG9yZVNob3cgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIHN1Ym1lbnUuY2xlYXJRdWV1ZSgpO1xyXG4gICAgICAgICAgICAgIHN1Ym1lbnUuY3NzKFwiZGlzcGxheVwiLCBcImJsb2NrXCIpLmFuaW1hdGUoe1wib3BhY2l0eVwiOiAxfSwgMzUwKTtcclxuICAgICAgICAgICAgICAvLyBzZWxmLnN0b3Jlc1N1Ym1lbnUuY2xlYXJRdWV1ZSgpO1xyXG4gICAgICAgICAgICAgIC8vIHNlbGYuc3RvcmVzU3VibWVudS5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIikuYW5pbWF0ZSh7XCJvcGFjaXR5XCI6IDF9LCAzNTApO1xyXG4gICAgICAgICAgICB9LCAyMDApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgdmFyIHN1Ym1lbnUgPSAkKHRoaXMpLmZpbmQoJy5zdWJtZW51Jyk7XHJcbiAgICAgICAgICBpZigkKHdpbmRvdykud2lkdGgoKSA+IDk5MSkge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoc2VsZi5zdG9yZVNob3cpO1xyXG4gICAgICAgICAgICBzZWxmLnN0b3JlSGlkZSA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgc3VibWVudS5jbGVhclF1ZXVlKCk7XHJcbiAgICAgICAgICAgICAgc3VibWVudS5hbmltYXRlKHtcIm9wYWNpdHlcIjogMH0sIDIwMCwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIC8vIHNlbGYuc3RvcmVzU3VibWVudS5jbGVhclF1ZXVlKCk7XHJcbiAgICAgICAgICAgICAgLy8gc2VsZi5zdG9yZXNTdWJtZW51LmFuaW1hdGUoe1wib3BhY2l0eVwiOiAwfSwgMjAwLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAvLyAgICAgJCh0aGlzKS5jc3MoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcclxuICAgICAgICAgICAgICAvLyB9KTtcclxuICAgICAgICAgICAgfSwgMzAwKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcbiAgbWVudS5jb250cm9sLmV2ZW50cygpO1xyXG59KTtcclxuXHJcbi8v0YfRgtC+INCxINC40YTRgNC10LnQvNGLINC4INC60LDRgNGC0LjQvdC60Lgg0L3QtSDQstGL0LvQsNC30LjQu9C4XHJcbi8vaW1nLmpzXHJcbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgLyptX3cgPSAkKCcudGV4dC1jb250ZW50Jykud2lkdGgoKVxyXG4gIGlmIChtX3cgPCA1MCltX3cgPSBzY3JlZW4ud2lkdGggLSA0MCovXHJcbiAgdmFyIG13PXNjcmVlbi53aWR0aC00MDtcclxuXHJcbiAgZnVuY3Rpb24gb3B0aW1hc2UoZWwpe1xyXG4gICAgdmFyIHBhcmVudCA9IGVsLnBhcmVudCgpO1xyXG4gICAgaWYocGFyZW50Lmxlbmd0aD09MCB8fCBwYXJlbnRbMF0udGFnTmFtZT09XCJBXCIpe1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBtX3cgPSBwYXJlbnQud2lkdGgoKS0zMDtcclxuICAgIHZhciB3PWVsLndpZHRoKCk7XHJcbiAgICBlbC53aWR0aCgnYXV0bycpO1xyXG4gICAgaWYoZWxbMF0udGFnTmFtZT09XCJJTUdcIiAmJiB3PmVsLndpZHRoKCkpdz1lbC53aWR0aCgpO1xyXG5cclxuICAgIGlmIChtdz41MCAmJiBtX3cgPiBtdyltX3cgPSBtdztcclxuICAgIGlmICh3Pm1fdyA+IG1fdykge1xyXG4gICAgICBpZihlbFswXS50YWdOYW1lPT1cIklGUkFNRVwiKXtcclxuICAgICAgICBrID0gdyAvIG1fdztcclxuICAgICAgICBlbC5oZWlnaHQoZWwuaGVpZ2h0KCkgLyBrKTtcclxuICAgICAgfVxyXG4gICAgICBlbC53aWR0aChtX3cpXHJcbiAgICB9ZWxzZXtcclxuICAgICAgZWwud2lkdGgodyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbWdfbG9hZF9maW5pc2goKXtcclxuICAgIHZhciBlbD0kKHRoaXMpO1xyXG4gICAgb3B0aW1hc2UoZWwpO1xyXG4gIH1cclxuXHJcbiAgdmFyIHAgPSAkKCcuY29udGFpbmVyIGltZywuY29udGFpbmVyIGlmcmFtZScpO1xyXG4gICQoJy5jb250YWluZXIgaW1nJykuaGVpZ2h0KCdhdXRvJyk7XHJcbiAgLy8kKCcuY29udGFpbmVyIGltZycpLndpZHRoKCdhdXRvJyk7XHJcbiAgZm9yIChpID0gMDsgaSA8IHAubGVuZ3RoOyBpKyspIHtcclxuICAgIGVsID0gcC5lcShpKTtcclxuICAgIGlmKGVsWzBdLnRhZ05hbWU9PVwiSUZSQU1FXCIpIHtcclxuICAgICAgb3B0aW1hc2UoZWwpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIHZhciBzcmM9ZWwuYXR0cignc3JjJyk7XHJcbiAgICAgIGltYWdlID0gJCgnPGltZy8+Jywge1xyXG4gICAgICAgIHNyYzogc3JjXHJcbiAgICAgIH0pO1xyXG4gICAgICBpbWFnZS5vbignbG9hZCcsIGltZ19sb2FkX2ZpbmlzaC5iaW5kKGVsKSk7XHJcblxyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcblxyXG4vL9C10YHQu9C4INC+0YLQutGA0YvRgtC+INC60LDQuiDQtNC+0YfQtdGA0L3QtdC1XHJcbi8vcGFyZW50c19vcGVuX3dpbmRvd3MuanNcclxuKGZ1bmN0aW9uKCl7XHJcbiAgaWYoIXdpbmRvdy5vcGVuZXIpcmV0dXJuO1xyXG4gIGlmKGRvY3VtZW50LnJlZmVycmVyLmluZGV4T2YoJ3NlY3JldGRpc2NvdW50ZXInKTwwKXJldHVybjtcclxuXHJcbiAgaHJlZj13aW5kb3cub3BlbmVyLmxvY2F0aW9uLmhyZWY7XHJcbiAgaWYoXHJcbiAgICBocmVmLmluZGV4T2YoJ3NvY2lhbHMnKT4wIHx8XHJcbiAgICBocmVmLmluZGV4T2YoJ2xvZ2luJyk+MCB8fFxyXG4gICAgaHJlZi5pbmRleE9mKCdhZG1pbicpPjAgfHxcclxuICAgIGhyZWYuaW5kZXhPZignYWNjb3VudCcpPjBcclxuICApe1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICBpZihocmVmLmluZGV4T2YoJ3N0b3JlJyk+MCB8fCBocmVmLmluZGV4T2YoJ2NvdXBvbicpPjAgfHwgaHJlZi5pbmRleE9mKCdzZXR0aW5ncycpPjApe1xyXG4gICAgd2luZG93Lm9wZW5lci5sb2NhdGlvbi5yZWxvYWQoKTtcclxuICB9ZWxzZXtcclxuICAgIHdpbmRvdy5vcGVuZXIubG9jYXRpb24uaHJlZj1sb2NhdGlvbi5ocmVmO1xyXG4gIH1cclxuICB3aW5kb3cuY2xvc2UoKTtcclxufSkoKTtcclxuXHJcbi8vaW1nLmpzXHJcbihmdW5jdGlvbigpIHtcclxuXHJcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCl7XHJcbiAgICB2YXIgZGF0YT10aGlzO1xyXG4gICAgdmFyIGltZyA9IGRhdGEuaW1nO1xyXG4gICAgaW1nLndyYXAoJzxkaXYgY2xhc3M9XCJkb3dubG9hZFwiPjwvZGl2PicpO1xyXG4gICAgdmFyIHdyYXA9aW1nLnBhcmVudCgpO1xyXG4gICAgJCgnYm9keScpLmFwcGVuZChkYXRhLmVsKTtcclxuICAgIHNpemU9ZGF0YS5lbC53aWR0aCgpK1wieFwiK2RhdGEuZWwuaGVpZ2h0KCk7XHJcbiAgICBkYXRhLmVsLnJlbW92ZSgpO1xyXG4gICAgd3JhcC5hcHBlbmQoJzxzcGFuPicrc2l6ZSsnPC9zcGFuPiA8YSBocmVmPVwiJytkYXRhLnNyYysnXCIgZG93bmxvYWQ+0KHQutCw0YfQsNGC0Yw8L2E+JylcclxuICB9XHJcblxyXG4gIHZhciBpbWdzID0gJCgnLmRvd25sb2Fkc19pbWcgaW1nJyk7XHJcbiAgZm9yKHZhciBpPTA7aTxpbWdzLmxlbmd0aDtpKyspIHtcclxuICAgIHZhciBpbWc9aW1ncy5lcShpKTtcclxuICAgIHZhciBzcmM9aW1nLmF0dHIoJ3NyYycpO1xyXG4gICAgaW1hZ2UgPSAkKCc8aW1nLz4nLCB7XHJcbiAgICAgIHNyYzogc3JjXHJcbiAgICB9KTtcclxuICAgIGRhdGEgPSB7XHJcbiAgICAgIHNyYzogc3JjLFxyXG4gICAgICBpbWc6IGltZyxcclxuICAgICAgZWw6aW1hZ2VcclxuICAgIH07XHJcbiAgICBpbWFnZS5vbignbG9hZCcsIGltZ19sb2FkX2ZpbmlzaC5iaW5kKGRhdGEpKVxyXG4gIH1cclxufSkoKTsiLCJ2YXIgbm90aWZpY2F0aW9uID0gKGZ1bmN0aW9uKCkge1xyXG4gIHZhciBjb250ZWluZXI7XHJcbiAgdmFyIG1vdXNlT3ZlciA9IDA7XHJcbiAgdmFyIHRpbWVyQ2xlYXJBbGwgPSBudWxsO1xyXG4gIHZhciBhbmltYXRpb25FbmQgPSAnd2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZCc7XHJcbiAgdmFyIHRpbWUgPSAxMDAwMDtcclxuXHJcbiAgdmFyIG5vdGlmaWNhdGlvbl9ib3ggPWZhbHNlO1xyXG4gIHZhciBpc19pbml0PWZhbHNlO1xyXG4gIHZhciBjb25maXJtX29wdD17XHJcbiAgICB0aXRsZTpcItCj0LTQsNC70LXQvdC40LVcIixcclxuICAgIHF1ZXN0aW9uOlwi0JLRiyDQtNC10LnRgdGC0LLQuNGC0LXQu9GM0L3QviDRhdC+0YLQuNGC0LUg0YPQtNCw0LvQuNGC0Yw/XCIsXHJcbiAgICBidXR0b25ZZXM6XCLQlNCwXCIsXHJcbiAgICBidXR0b25ObzpcItCd0LXRglwiLFxyXG4gICAgY2FsbGJhY2tZZXM6ZmFsc2UsXHJcbiAgICBjYWxsYmFja05vOmZhbHNlLFxyXG4gICAgb2JqOmZhbHNlLFxyXG4gICAgYnV0dG9uVGFnOidkaXYnLFxyXG4gICAgYnV0dG9uWWVzRG9wOicnLFxyXG4gICAgYnV0dG9uTm9Eb3A6JycsXHJcbiAgfTtcclxuICB2YXIgYWxlcnRfb3B0PXtcclxuICAgIHRpdGxlOlwiXCIsXHJcbiAgICBxdWVzdGlvbjpcItCh0L7QvtCx0YnQtdC90LjQtVwiLFxyXG4gICAgYnV0dG9uWWVzOlwi0JTQsFwiLFxyXG4gICAgY2FsbGJhY2tZZXM6ZmFsc2UsXHJcbiAgICBidXR0b25UYWc6J2RpdicsXHJcbiAgICBvYmo6ZmFsc2UsXHJcbiAgfTtcclxuXHJcblxyXG4gIGZ1bmN0aW9uIGluaXQoKXtcclxuICAgIGlzX2luaXQ9dHJ1ZTtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3g9JCgnLm5vdGlmaWNhdGlvbl9ib3gnKTtcclxuICAgIGlmKG5vdGlmaWNhdGlvbl9ib3gubGVuZ3RoPjApcmV0dXJuO1xyXG5cclxuICAgICQoJ2JvZHknKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdub3RpZmljYXRpb25fYm94Jz48L2Rpdj5cIik7XHJcbiAgICBub3RpZmljYXRpb25fYm94PSQoJy5ub3RpZmljYXRpb25fYm94Jyk7XHJcblxyXG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCcubm90aWZ5X2NvbnRyb2wnLGNsb3NlTW9kYWwpO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCcubm90aWZ5X2Nsb3NlJyxjbG9zZU1vZGFsKTtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJyxjbG9zZU1vZGFsRm9uKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNsb3NlTW9kYWwoKXtcclxuICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnc2hvd19ub3RpZmknKTtcclxuICAgICQoJy5ub3RpZmljYXRpb25fYm94IC5ub3RpZnlfY29udGVudCcpLmh0bWwoJycpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjbG9zZU1vZGFsRm9uKGUpe1xyXG4gICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcclxuICAgIGlmKHRhcmdldC5jbGFzc05hbWU9PVwibm90aWZpY2F0aW9uX2JveFwiKXtcclxuICAgICAgY2xvc2VNb2RhbCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdmFyIF9zZXRVcExpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJCgnYm9keScpLm9uKCdjbGljaycsICcubm90aWZpY2F0aW9uX2Nsb3NlJywgX2Nsb3NlUG9wdXApO1xyXG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWVudGVyJywgJy5ub3RpZmljYXRpb25fY29udGFpbmVyJywgX29uRW50ZXIpO1xyXG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWxlYXZlJywgJy5ub3RpZmljYXRpb25fY29udGFpbmVyJywgX29uTGVhdmUpO1xyXG4gIH07XHJcblxyXG4gIHZhciBfb25FbnRlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBpZihldmVudClldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgaWYgKHRpbWVyQ2xlYXJBbGwhPW51bGwpIHtcclxuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyQ2xlYXJBbGwpO1xyXG4gICAgICB0aW1lckNsZWFyQWxsID0gbnVsbDtcclxuICAgIH1cclxuICAgIGNvbnRlaW5lci5maW5kKCcubm90aWZpY2F0aW9uX2l0ZW0nKS5lYWNoKGZ1bmN0aW9uKGkpe1xyXG4gICAgICB2YXIgb3B0aW9uPSQodGhpcykuZGF0YSgnb3B0aW9uJyk7XHJcbiAgICAgIGlmKG9wdGlvbi50aW1lcikge1xyXG4gICAgICAgIGNsZWFyVGltZW91dChvcHRpb24udGltZXIpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIG1vdXNlT3ZlciA9IDE7XHJcbiAgfTtcclxuXHJcbiAgdmFyIF9vbkxlYXZlID0gZnVuY3Rpb24oKSB7XHJcbiAgICBjb250ZWluZXIuZmluZCgnLm5vdGlmaWNhdGlvbl9pdGVtJykuZWFjaChmdW5jdGlvbihpKXtcclxuICAgICAgJHRoaXM9JCh0aGlzKTtcclxuICAgICAgdmFyIG9wdGlvbj0kdGhpcy5kYXRhKCdvcHRpb24nKTtcclxuICAgICAgaWYob3B0aW9uLnRpbWU+MCkge1xyXG4gICAgICAgIG9wdGlvbi50aW1lciA9IHNldFRpbWVvdXQoX2Nsb3NlUG9wdXAuYmluZChvcHRpb24uY2xvc2UpLCBvcHRpb24udGltZSAtIDE1MDAgKyAxMDAgKiBpKTtcclxuICAgICAgICAkdGhpcy5kYXRhKCdvcHRpb24nLG9wdGlvbilcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBtb3VzZU92ZXIgPSAwO1xyXG4gIH07XHJcblxyXG4gIHZhciBfY2xvc2VQb3B1cCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBpZihldmVudClldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgIHZhciAkdGhpcyA9ICQodGhpcykucGFyZW50KCk7XHJcbiAgICAkdGhpcy5vbihhbmltYXRpb25FbmQsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAkKHRoaXMpLnJlbW92ZSgpO1xyXG4gICAgfSk7XHJcbiAgICAkdGhpcy5hZGRDbGFzcygnbm90aWZpY2F0aW9uX2hpZGUnKVxyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIGFsZXJ0KGRhdGEpe1xyXG4gICAgaWYoIWRhdGEpZGF0YT17fTtcclxuICAgIGRhdGE9b2JqZWN0cyhhbGVydF9vcHQsZGF0YSk7XHJcblxyXG4gICAgaWYoIWlzX2luaXQpaW5pdCgpO1xyXG5cclxuICAgIG5vdHlmeV9jbGFzcz0nbm90aWZ5X2JveCAnO1xyXG4gICAgaWYoZGF0YS5ub3R5ZnlfY2xhc3Mpbm90eWZ5X2NsYXNzKz1kYXRhLm5vdHlmeV9jbGFzcztcclxuXHJcbiAgICBib3hfaHRtbD0nPGRpdiBjbGFzcz1cIicrbm90eWZ5X2NsYXNzKydcIj4nO1xyXG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X3RpdGxlXCI+JztcclxuICAgIGJveF9odG1sKz1kYXRhLnRpdGxlO1xyXG4gICAgYm94X2h0bWwrPSc8c3BhbiBjbGFzcz1cIm5vdGlmeV9jbG9zZVwiPjwvc3Bhbj4nO1xyXG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xyXG5cclxuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcclxuICAgIGJveF9odG1sKz1kYXRhLnF1ZXN0aW9uO1xyXG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xyXG5cclxuICAgIGlmKGRhdGEuYnV0dG9uWWVzfHxkYXRhLmJ1dHRvbk5vKSB7XHJcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xyXG4gICAgICBpZiAoZGF0YS5idXR0b25ZZXMpYm94X2h0bWwgKz0gJzwnK2RhdGEuYnV0dG9uVGFnKycgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiICcrZGF0YS5idXR0b25ZZXNEb3ArJz4nICsgZGF0YS5idXR0b25ZZXMgKyAnPC8nK2RhdGEuYnV0dG9uVGFnKyc+JztcclxuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzwnK2RhdGEuYnV0dG9uVGFnKycgY2xhc3M9XCJub3RpZnlfYnRuX25vXCIgJytkYXRhLmJ1dHRvbk5vRG9wKyc+JyArIGRhdGEuYnV0dG9uTm8gKyAnPC8nK2RhdGEuYnV0dG9uVGFnKyc+JztcclxuICAgICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcbiAgICB9O1xyXG5cclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XHJcblxyXG5cclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcclxuICAgIH0sMTAwKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29uZmlybShkYXRhKXtcclxuICAgIGlmKCFkYXRhKWRhdGE9e307XHJcbiAgICBkYXRhPW9iamVjdHMoY29uZmlybV9vcHQsZGF0YSk7XHJcblxyXG4gICAgaWYoIWlzX2luaXQpaW5pdCgpO1xyXG5cclxuICAgIGJveF9odG1sPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveFwiPic7XHJcbiAgICBib3hfaHRtbCs9JzxkaXYgY2xhc3M9XCJub3RpZnlfdGl0bGVcIj4nO1xyXG4gICAgYm94X2h0bWwrPWRhdGEudGl0bGU7XHJcbiAgICBib3hfaHRtbCs9JzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XHJcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XHJcblxyXG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRlbnRcIj4nO1xyXG4gICAgYm94X2h0bWwrPWRhdGEucXVlc3Rpb247XHJcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XHJcblxyXG4gICAgaWYoZGF0YS5idXR0b25ZZXN8fGRhdGEuYnV0dG9uTm8pIHtcclxuICAgICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udHJvbFwiPic7XHJcbiAgICAgIGlmIChkYXRhLmJ1dHRvblllcylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5feWVzXCI+JyArIGRhdGEuYnV0dG9uWWVzICsgJzwvZGl2Pic7XHJcbiAgICAgIGlmIChkYXRhLmJ1dHRvbk5vKWJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2J0bl9ub1wiPicgKyBkYXRhLmJ1dHRvbk5vICsgJzwvZGl2Pic7XHJcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG4gICAgfVxyXG5cclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XHJcblxyXG4gICAgaWYoZGF0YS5jYWxsYmFja1llcyE9ZmFsc2Upe1xyXG4gICAgICBub3RpZmljYXRpb25fYm94LmZpbmQoJy5ub3RpZnlfYnRuX3llcycpLm9uKCdjbGljaycsZGF0YS5jYWxsYmFja1llcy5iaW5kKGRhdGEub2JqKSk7XHJcbiAgICB9XHJcbiAgICBpZihkYXRhLmNhbGxiYWNrTm8hPWZhbHNlKXtcclxuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl9ubycpLm9uKCdjbGljaycsZGF0YS5jYWxsYmFja05vLmJpbmQoZGF0YS5vYmopKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XHJcbiAgICB9LDEwMClcclxuXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBub3RpZmkoZGF0YSkge1xyXG4gICAgaWYoIWRhdGEpZGF0YT17fTtcclxuICAgIHZhciBvcHRpb24gPSB7dGltZSA6IChkYXRhLnRpbWV8fGRhdGEudGltZT09PTApP2RhdGEudGltZTp0aW1lfTtcclxuICAgIGlmICghY29udGVpbmVyKSB7XHJcbiAgICAgIGNvbnRlaW5lciA9ICQoJzx1bC8+Jywge1xyXG4gICAgICAgICdjbGFzcyc6ICdub3RpZmljYXRpb25fY29udGFpbmVyJ1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgICQoJ2JvZHknKS5hcHBlbmQoY29udGVpbmVyKTtcclxuICAgICAgX3NldFVwTGlzdGVuZXJzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGxpID0gJCgnPGxpLz4nLCB7XHJcbiAgICAgIGNsYXNzOiAnbm90aWZpY2F0aW9uX2l0ZW0nXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoZGF0YS50eXBlKXtcclxuICAgICAgbGkuYWRkQ2xhc3MoJ25vdGlmaWNhdGlvbl9pdGVtLScgKyBkYXRhLnR5cGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBjbG9zZT0kKCc8c3Bhbi8+Jyx7XHJcbiAgICAgIGNsYXNzOidub3RpZmljYXRpb25fY2xvc2UnXHJcbiAgICB9KTtcclxuICAgIG9wdGlvbi5jbG9zZT1jbG9zZTtcclxuICAgIGxpLmFwcGVuZChjbG9zZSk7XHJcblxyXG4gICAgdmFyIGNvbnRlbnQgPSAkKCc8ZGl2Lz4nLHtcclxuICAgICAgY2xhc3M6XCJub3RpZmljYXRpb25fY29udGVudFwiXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZihkYXRhLnRpdGxlICYmIGRhdGEudGl0bGUubGVuZ3RoPjApIHtcclxuICAgICAgdmFyIHRpdGxlID0gJCgnPGg1Lz4nLCB7XHJcbiAgICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX3RpdGxlXCJcclxuICAgICAgfSk7XHJcbiAgICAgIHRpdGxlLmh0bWwoZGF0YS50aXRsZSk7XHJcbiAgICAgIGNvbnRlbnQuYXBwZW5kKHRpdGxlKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdGV4dD0gJCgnPGRpdi8+Jyx7XHJcbiAgICAgIGNsYXNzOlwibm90aWZpY2F0aW9uX3RleHRcIlxyXG4gICAgfSk7XHJcbiAgICB0ZXh0Lmh0bWwoZGF0YS5tZXNzYWdlKTtcclxuXHJcbiAgICBpZihkYXRhLmltZyAmJiBkYXRhLmltZy5sZW5ndGg+MCkge1xyXG4gICAgICB2YXIgaW1nID0gJCgnPGRpdi8+Jywge1xyXG4gICAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl9pbWdcIlxyXG4gICAgICB9KTtcclxuICAgICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgnK2RhdGEuaW1nKycpJyk7XHJcbiAgICAgIHZhciB3cmFwID0gJCgnPGRpdi8+Jywge1xyXG4gICAgICAgIGNsYXNzOiBcIndyYXBcIlxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHdyYXAuYXBwZW5kKGltZyk7XHJcbiAgICAgIHdyYXAuYXBwZW5kKHRleHQpO1xyXG4gICAgICBjb250ZW50LmFwcGVuZCh3cmFwKTtcclxuICAgIH1lbHNle1xyXG4gICAgICBjb250ZW50LmFwcGVuZCh0ZXh0KTtcclxuICAgIH1cclxuICAgIGxpLmFwcGVuZChjb250ZW50KTtcclxuXHJcbiAgICAvL1xyXG4gICAgLy8gaWYoZGF0YS50aXRsZSAmJiBkYXRhLnRpdGxlLmxlbmd0aD4wKSB7XHJcbiAgICAvLyAgIHZhciB0aXRsZSA9ICQoJzxwLz4nLCB7XHJcbiAgICAvLyAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX3RpdGxlXCJcclxuICAgIC8vICAgfSk7XHJcbiAgICAvLyAgIHRpdGxlLmh0bWwoZGF0YS50aXRsZSk7XHJcbiAgICAvLyAgIGxpLmFwcGVuZCh0aXRsZSk7XHJcbiAgICAvLyB9XHJcbiAgICAvL1xyXG4gICAgLy8gaWYoZGF0YS5pbWcgJiYgZGF0YS5pbWcubGVuZ3RoPjApIHtcclxuICAgIC8vICAgdmFyIGltZyA9ICQoJzxkaXYvPicsIHtcclxuICAgIC8vICAgICBjbGFzczogXCJub3RpZmljYXRpb25faW1nXCJcclxuICAgIC8vICAgfSk7XHJcbiAgICAvLyAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytkYXRhLmltZysnKScpO1xyXG4gICAgLy8gICBsaS5hcHBlbmQoaW1nKTtcclxuICAgIC8vIH1cclxuICAgIC8vXHJcbiAgICAvLyB2YXIgY29udGVudCA9ICQoJzxkaXYvPicse1xyXG4gICAgLy8gICBjbGFzczpcIm5vdGlmaWNhdGlvbl9jb250ZW50XCJcclxuICAgIC8vIH0pO1xyXG4gICAgLy8gY29udGVudC5odG1sKGRhdGEubWVzc2FnZSk7XHJcbiAgICAvL1xyXG4gICAgLy8gbGkuYXBwZW5kKGNvbnRlbnQpO1xyXG4gICAgLy9cclxuICAgICBjb250ZWluZXIuYXBwZW5kKGxpKTtcclxuXHJcbiAgICBpZihvcHRpb24udGltZT4wKXtcclxuICAgICAgb3B0aW9uLnRpbWVyPXNldFRpbWVvdXQoX2Nsb3NlUG9wdXAuYmluZChjbG9zZSksIG9wdGlvbi50aW1lKTtcclxuICAgIH1cclxuICAgIGxpLmRhdGEoJ29wdGlvbicsb3B0aW9uKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGFsZXJ0OiBhbGVydCxcclxuICAgIGNvbmZpcm06IGNvbmZpcm0sXHJcbiAgICBub3RpZmk6IG5vdGlmaSxcclxuICB9O1xyXG5cclxufSkoKTtcclxuXHJcblxyXG4kKCdbcmVmPXBvcHVwXScpLm9uKCdjbGljaycsZnVuY3Rpb24gKGUpe1xyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxuICAkdGhpcz0kKHRoaXMpO1xyXG4gIGVsPSQoJHRoaXMuYXR0cignaHJlZicpKTtcclxuICBkYXRhPWVsLmRhdGEoKTtcclxuXHJcbiAgZGF0YS5xdWVzdGlvbj1lbC5odG1sKCk7XHJcbiAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xyXG59KTtcclxuXHJcblxyXG4kKCcuZGlzYWJsZWQnKS5vbignY2xpY2snLGZ1bmN0aW9uIChlKXtcclxuICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgJHRoaXM9JCh0aGlzKTtcclxuICBkYXRhPSR0aGlzLmRhdGEoKTtcclxuICBpZihkYXRhWydidXR0b25feWVzJ10pZGF0YVsnYnV0dG9uWWVzJ109ZGF0YVsnYnV0dG9uX3llcyddXHJcblxyXG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxufSk7IiwiZnVuY3Rpb24gYWpheEZvcm0oZWxzKSB7XHJcbiAgdmFyIGZpbGVBcGkgPSB3aW5kb3cuRmlsZSAmJiB3aW5kb3cuRmlsZVJlYWRlciAmJiB3aW5kb3cuRmlsZUxpc3QgJiYgd2luZG93LkJsb2IgPyB0cnVlIDogZmFsc2U7XHJcbiAgdmFyIGRlZmF1bHRzID0ge1xyXG4gICAgZXJyb3JfY2xhc3M6ICcuaGFzLWVycm9yJ1xyXG4gIH07XHJcbiAgdmFyIGxhc3RfcG9zdCA9IGZhbHNlO1xyXG5cclxuICBmdW5jdGlvbiBvblBvc3QocG9zdCkge1xyXG4gICAgbGFzdF9wb3N0ID0gK25ldyBEYXRlKCk7XHJcbiAgICAvL2NvbnNvbGUubG9nKHBvc3QsIHRoaXMpO1xyXG4gICAgdmFyIGRhdGEgPSB0aGlzO1xyXG4gICAgdmFyIGZvcm0gPSBkYXRhLmZvcm07XHJcbiAgICB2YXIgd3JhcCA9IGRhdGEud3JhcDtcclxuXHJcbiAgICBpZiAocG9zdC5yZW5kZXIpIHtcclxuICAgICAgcG9zdC5ub3R5ZnlfY2xhc3MgPSBcIm5vdGlmeV93aGl0ZVwiO1xyXG4gICAgICBub3RpZmljYXRpb24uYWxlcnQocG9zdCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB3cmFwLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICAgIGZvcm0ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgICAgaWYgKHBvc3QuaHRtbCkge1xyXG4gICAgICAgIHdyYXAuaHRtbChwb3N0Lmh0bWwpO1xyXG4gICAgICAgIGFqYXhGb3JtKHdyYXApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmICghcG9zdC5lcnJvcikge1xyXG4gICAgICAgICAgZm9ybS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xyXG4gICAgICAgICAgZm9ybS5maW5kKCdpbnB1dFt0eXBlPXRleHRdLHRleHRhcmVhJykudmFsKCcnKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiBwb3N0LmVycm9yID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgIGZvciAodmFyIGluZGV4IGluIHBvc3QuZXJyb3IpIHtcclxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcclxuICAgICAgICAgICd0eXBlJzogJ2VycicsXHJcbiAgICAgICAgICAndGl0bGUnOiAn0J7RiNC40LHQutCwJyxcclxuICAgICAgICAgICdtZXNzYWdlJzogcG9zdC5lcnJvcltpbmRleF1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHBvc3QuZXJyb3IpKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcG9zdC5lcnJvci5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xyXG4gICAgICAgICAgJ3R5cGUnOiAnZXJyJyxcclxuICAgICAgICAgICd0aXRsZSc6ICfQntGI0LjQsdC60LAnLFxyXG4gICAgICAgICAgJ21lc3NhZ2UnOiBwb3N0LmVycm9yW2ldXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmIChwb3N0LmVycm9yIHx8IHBvc3QubWVzc2FnZSkge1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xyXG4gICAgICAgICAgJ3R5cGUnOiBwb3N0LmVycm9yID09PSBmYWxzZSA/ICdzdWNjZXNzJyA6ICdlcnInLFxyXG4gICAgICAgICAgJ3RpdGxlJzogcG9zdC5lcnJvciA9PT0gZmFsc2UgPyAn0KPRgdC/0LXRiNC90L4nIDogJ9Ce0YjQuNCx0LrQsCcsXHJcbiAgICAgICAgICAnbWVzc2FnZSc6IHBvc3QubWVzc2FnZSA/IHBvc3QubWVzc2FnZSA6IHBvc3QuZXJyb3JcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy9cclxuICAgIC8vIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xyXG4gICAgLy8gICAgICd0eXBlJzogcG9zdC5lcnJvciA9PT0gZmFsc2UgPyAnc3VjY2VzcycgOiAnZXJyJyxcclxuICAgIC8vICAgICAndGl0bGUnOiBwb3N0LmVycm9yID09PSBmYWxzZSA/ICfQo9GB0L/QtdGI0L3QvicgOiAn0J7RiNC40LHQutCwJyxcclxuICAgIC8vICAgICAnbWVzc2FnZSc6IEFycmF5LmlzQXJyYXkocG9zdC5lcnJvcikgPyBwb3N0LmVycm9yWzBdIDogKHBvc3QubWVzc2FnZSA/IHBvc3QubWVzc2FnZSA6IHBvc3QuZXJyb3IpXHJcbiAgICAvLyB9KTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG9uRmFpbCgpIHtcclxuICAgIGxhc3RfcG9zdCA9ICtuZXcgRGF0ZSgpO1xyXG4gICAgdmFyIGRhdGEgPSB0aGlzO1xyXG4gICAgdmFyIGZvcm0gPSBkYXRhLmZvcm07XHJcbiAgICB2YXIgd3JhcCA9IGRhdGEud3JhcDtcclxuICAgIHdyYXAucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgIHdyYXAuaHRtbCgnPGgzPtCj0L/RgS4uLiDQktC+0LfQvdC40LrQu9CwINC90LXQv9GA0LXQtNCy0LjQtNC10L3QvdCw0Y8g0L7RiNC40LHQutCwPGgzPicgK1xyXG4gICAgICAnPHA+0KfQsNGB0YLQviDRjdGC0L4g0L/RgNC+0LjRgdGF0L7QtNC40YIg0LIg0YHQu9GD0YfQsNC1LCDQtdGB0LvQuCDQstGLINC90LXRgdC60L7Qu9GM0LrQviDRgNCw0Lcg0L/QvtC00YDRj9C0INC90LXQstC10YDQvdC+INCy0LLQtdC70Lgg0YHQstC+0Lgg0YPRh9C10YLQvdGL0LUg0LTQsNC90L3Ri9C1LiDQndC+INCy0L7Qt9C80L7QttC90Ysg0Lgg0LTRgNGD0LPQuNC1INC/0YDQuNGH0LjQvdGLLiDQkiDQu9GO0LHQvtC8INGB0LvRg9GH0LDQtSDQvdC1INGA0LDRgdGB0YLRgNCw0LjQstCw0LnRgtC10YHRjCDQuCDQv9GA0L7RgdGC0L4g0L7QsdGA0LDRgtC40YLQtdGB0Ywg0Log0L3QsNGI0LXQvNGDINC+0L/QtdGA0LDRgtC+0YDRgyDRgdC70YPQttCx0Ysg0L/QvtC00LTQtdGA0LbQutC4LjwvcD48YnI+JyArXHJcbiAgICAgICc8cD7QodC/0LDRgdC40LHQvi48L3A+Jyk7XHJcbiAgICBhamF4Rm9ybSh3cmFwKTtcclxuXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBvblN1Ym1pdChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAvL2Uuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAvL2Uuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgdmFyIGN1cnJlbnRUaW1lTWlsbGlzID0gK25ldyBEYXRlKCk7XHJcbiAgICBpZiAoY3VycmVudFRpbWVNaWxsaXMgLSBsYXN0X3Bvc3QgPCAxMDAwICogMikge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgbGFzdF9wb3N0ID0gY3VycmVudFRpbWVNaWxsaXM7XHJcbiAgICB2YXIgZGF0YSA9IHRoaXM7XHJcbiAgICB2YXIgZm9ybSA9IGRhdGEuZm9ybTtcclxuICAgIHZhciB3cmFwID0gZGF0YS53cmFwO1xyXG4gICAgdmFyIGlzVmFsaWQgPSB0cnVlO1xyXG5cclxuICAgIC8vaW5pdCh3cmFwKTtcclxuXHJcbiAgICBpZiAoZm9ybS55aWlBY3RpdmVGb3JtKSB7XHJcbiAgICAgIHZhciBkID0gZm9ybS5kYXRhKCd5aWlBY3RpdmVGb3JtJyk7XHJcbiAgICAgIGlmIChkKSB7XHJcbiAgICAgICAgZC52YWxpZGF0ZWQgPSB0cnVlO1xyXG4gICAgICAgIGZvcm0uZGF0YSgneWlpQWN0aXZlRm9ybScsIGQpO1xyXG4gICAgICAgIGZvcm0ueWlpQWN0aXZlRm9ybSgndmFsaWRhdGUnKTtcclxuICAgICAgICBpc1ZhbGlkID0gZC52YWxpZGF0ZWQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpc1ZhbGlkID0gaXNWYWxpZCAmJiAoZm9ybS5maW5kKGRhdGEucGFyYW0uZXJyb3JfY2xhc3MpLmxlbmd0aCA9PSAwKTtcclxuXHJcbiAgICBpZiAoIWlzVmFsaWQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICB2YXIgcmVxdWlyZWQgPSBmb3JtLmZpbmQoJ2lucHV0LnJlcXVpcmVkJyk7XHJcblxyXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgcmVxdWlyZWQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgaGVscEJsb2NrID0gcmVxdWlyZWQuZXEoaSkuYXR0cigndHlwZScpID09ICdoaWRkZW4nID8gcmVxdWlyZWQuZXEoaSkubmV4dCgnLmhlbHAtYmxvY2snKSA6XHJcbiAgICAgICAgICByZXF1aXJlZC5lcShpKS5jbG9zZXN0KCcuZm9ybS1pbnB1dC1ncm91cCcpLm5leHQoJy5oZWxwLWJsb2NrJyk7XHJcbiAgICAgICAgdmFyIGhlbHBNZXNzYWdlID0gaGVscEJsb2NrICYmIGhlbHBCbG9jay5kYXRhKCdtZXNzYWdlJykgPyBoZWxwQmxvY2suZGF0YSgnbWVzc2FnZScpIDogJ9Cd0LXQvtCx0YXQvtC00LjQvNC+INC30LDQv9C+0LvQvdC40YLRjCc7XHJcblxyXG4gICAgICAgIGlmIChyZXF1aXJlZC5lcShpKS52YWwoKS5sZW5ndGggPCAxKSB7XHJcbiAgICAgICAgICBoZWxwQmxvY2suaHRtbChoZWxwTWVzc2FnZSk7XHJcbiAgICAgICAgICBpc1ZhbGlkID0gZmFsc2U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGhlbHBCbG9jay5odG1sKCcnKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCFpc1ZhbGlkKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFmb3JtLnNlcmlhbGl6ZU9iamVjdClhZGRTUk8oKTtcclxuXHJcbiAgICB2YXIgcG9zdERhdGEgPSBmb3JtLnNlcmlhbGl6ZU9iamVjdCgpO1xyXG4gICAgZm9ybS5hZGRDbGFzcygnbG9hZGluZycpO1xyXG4gICAgLy9mb3JtLmh0bWwoJycpO1xyXG4gICAgLy93cmFwLmh0bWwoJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjtcIj48cD7QntGC0L/RgNCw0LLQutCwINC00LDQvdC90YvRhTwvcD48L2Rpdj4nKTtcclxuXHJcbiAgICBkYXRhLnVybCArPSAoZGF0YS51cmwuaW5kZXhPZignPycpID4gMCA/ICcmJyA6ICc/JykgKyAncmM9JyArIE1hdGgucmFuZG9tKCk7XHJcbiAgICBjb25zb2xlLmxvZyhkYXRhLnVybCk7XHJcblxyXG4gICAgJC5wb3N0KFxyXG4gICAgICBkYXRhLnVybCxcclxuICAgICAgcG9zdERhdGEsXHJcbiAgICAgIG9uUG9zdC5iaW5kKGRhdGEpLFxyXG4gICAgICAnanNvbidcclxuICAgICkuZmFpbChvbkZhaWwuYmluZChkYXRhKSk7XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW5pdCh3cmFwKSB7XHJcbiAgICBmb3JtID0gd3JhcC5maW5kKCdmb3JtJyk7XHJcbiAgICBkYXRhID0ge1xyXG4gICAgICBmb3JtOiBmb3JtLFxyXG4gICAgICBwYXJhbTogZGVmYXVsdHMsXHJcbiAgICAgIHdyYXA6IHdyYXBcclxuICAgIH07XHJcbiAgICBkYXRhLnVybCA9IGZvcm0uYXR0cignYWN0aW9uJykgfHwgbG9jYXRpb24uaHJlZjtcclxuICAgIGRhdGEubWV0aG9kID0gZm9ybS5hdHRyKCdtZXRob2QnKSB8fCAncG9zdCc7XHJcbiAgICBmb3JtLnVuYmluZCgnc3VibWl0Jyk7XHJcbiAgICAvL2Zvcm0ub2ZmKCdzdWJtaXQnKTtcclxuICAgIGZvcm0ub24oJ3N1Ym1pdCcsIG9uU3VibWl0LmJpbmQoZGF0YSkpO1xyXG4gIH1cclxuXHJcbiAgZWxzLmZpbmQoJ1tyZXF1aXJlZF0nKVxyXG4gICAgLmFkZENsYXNzKCdyZXF1aXJlZCcpXHJcbiAgICAucmVtb3ZlQXR0cigncmVxdWlyZWQnKTtcclxuXHJcblxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZWxzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpbml0KGVscy5lcShpKSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBhZGRTUk8oKSB7XHJcbiAgJC5mbi5zZXJpYWxpemVPYmplY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgbyA9IHt9O1xyXG4gICAgdmFyIGEgPSB0aGlzLnNlcmlhbGl6ZUFycmF5KCk7XHJcbiAgICAkLmVhY2goYSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICBpZiAob1t0aGlzLm5hbWVdKSB7XHJcbiAgICAgICAgaWYgKCFvW3RoaXMubmFtZV0ucHVzaCkge1xyXG4gICAgICAgICAgb1t0aGlzLm5hbWVdID0gW29bdGhpcy5uYW1lXV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9bdGhpcy5uYW1lXS5wdXNoKHRoaXMudmFsdWUgfHwgJycpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG9bdGhpcy5uYW1lXSA9IHRoaXMudmFsdWUgfHwgJyc7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG87XHJcbiAgfTtcclxufTtcclxuYWRkU1JPKCk7IiwiJCgnLmFjdGlvbl91c2VyX2NvbmZpcm0nKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAoIWNvbmZpcm0oKSl7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbi8vY2hlY2tib3hlcyDQstGA0LXQvNGR0L0g0YDQsNCx0L7RgtGLINGC0L7Rh9C10Log0L/RgNC+0LTQsNC2LCDQv9GA0Lgg0LrQu9C40LrQsNGFINGE0YPQvdC60YbQuNC+0L3QsNC7XHJcbnZhciBzdG9yZXNQb2ludENoZWNrYm94ZXMgPSAkKCcuYjJiLXN0b3Jlcy1wb2ludHMtZm9ybSBpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKTtcclxuXHJcbnN0b3Jlc1BvaW50Q2hlY2tib3hlcy5jbGljayhmdW5jdGlvbigpIHtcclxuICAgIHZhciBuYW1lID0gJCh0aGlzKS5hdHRyKCduYW1lJyk7XHJcbiAgICB2YXIgcm93ID0gJCh0aGlzKS5jbG9zZXN0KCd0cicpO1xyXG4gICAgLy8gaWYgKG5hbWUubWF0Y2goL0IyYlN0b3Jlc1BvaW50c1xcW3dvcmtfdGltZV9kZXRhaWxzXFxdXFxbXFxkKlxcXVxcW2hvbGlkYXlcXF0vKSkge1xyXG4gICAgLy8gICAgIGNoZWNrRGlzYWJsZWQocm93LCB0aGlzLmNoZWNrZWQsICdkZXBlbmRzLWhvbGlkYXknKTtcclxuICAgIC8vIH1cclxuICAgIGlmIChuYW1lLm1hdGNoKC9CMmJTdG9yZXNQb2ludHNcXFt3b3JrX3RpbWVfZGV0YWlsc1xcXVxcW1xcZCpcXF1cXFsyNC1ob3VyXFxdLykpIHtcclxuICAgICAgICBjaGVja0Rpc2FibGVkKHJvdywgdGhpcy5jaGVja2VkLCAnZGVwZW5kcy0yNC1ob3VyJyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuLy/Qv9GA0Lgg0LfQsNCz0YDRg9C30LrQtSDQv9GA0L7QstC10YDRj9C10Lwg0YLQviDQttC1LCDRh9GC0L4g0L/RgNC4INC60LvQuNC60LVcclxuJC5lYWNoKHN0b3Jlc1BvaW50Q2hlY2tib3hlcywgZnVuY3Rpb24oaW5kZXgsIGl0ZW0pe1xyXG4gICAgdmFyIG5hbWUgPSAkKGl0ZW0pLmF0dHIoJ25hbWUnKTtcclxuICAgIHZhciByb3cgPSAkKGl0ZW0pLmNsb3Nlc3QoJ3RyJyk7XHJcbiAgICAvLyBpZiAobmFtZS5tYXRjaCgvQjJiU3RvcmVzUG9pbnRzXFxbd29ya190aW1lX2RldGFpbHNcXF1cXFtcXGQqXFxdXFxbaG9saWRheVxcXS8pICYmIGl0ZW0uY2hlY2tlZCkge1xyXG4gICAgLy8gICAgIGNoZWNrRGlzYWJsZWQocm93LCB0cnVlLCAnZGVwZW5kcy1ob2xpZGF5Jyk7XHJcbiAgICAvLyB9XHJcbiAgICBpZiAobmFtZS5tYXRjaCgvQjJiU3RvcmVzUG9pbnRzXFxbd29ya190aW1lX2RldGFpbHNcXF1cXFtcXGQqXFxdXFxbMjQtaG91clxcXS8pICYmIGl0ZW0uY2hlY2tlZCkge1xyXG4gICAgICAgIGNoZWNrRGlzYWJsZWQocm93LCB0cnVlLCAnZGVwZW5kcy0yNC1ob3VyJyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gIGNoZWNrRGlzYWJsZWQocm93LCBjaGVja2VkLCBjbGFzc05hbWUpIHtcclxuICAgIC8vdmFyIGlucHV0c0NoZWNrYm94ID0gJChyb3cpLmZpbmQoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXS4nK2NsYXNzTmFtZSk7XHJcbiAgICB2YXIgaW5wdXRzVGV4dCA9ICQocm93KS5maW5kKCdpbnB1dFt0eXBlPVwidGV4dFwiXS4nK2NsYXNzTmFtZSk7XHJcbiAgICBpbnB1dHNUZXh0LnZhbCgnJyk7XHJcbiAgICAvL2lucHV0c0NoZWNrYm94LmF0dHIoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcbiAgICBpbnB1dHNUZXh0LmF0dHIoJ2Rpc2FibGVkJywgY2hlY2tlZCk7XHJcbiAgICAvL2lucHV0c0NoZWNrYm94LmF0dHIoJ2Rpc2FibGVkJywgY2hlY2tlZCk7XHJcbn1cclxuXHJcbiQoJyNwYXltZW50c19zZWxlY3Rfc3RvcmUnKS5vbignY2hhbmdlJywgcGF5bWVudHNTZWxlY3RTdG9yZSk7XHJcblxyXG5mdW5jdGlvbiBwYXltZW50c1NlbGVjdFN0b3JlKCl7XHJcbiAgICB2YXIgc2VsZiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXltZW50c19zZWxlY3Rfc3RvcmUnKSxcclxuICAgICAgICBzZWxlY3RQb2ludHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGF5bWVudHNfc2VsZWN0X3N0b3JlX3BvaW50Jyk7XHJcbiAgICBpZiAoc2VsZiAmJiBzZWxlY3RQb2ludHMpIHtcclxuICAgICAgICB2YXIgcG9pbnRzID0gJCgnb3B0aW9uOnNlbGVjdGVkJywgc2VsZikuYXR0cignZGF0YS1wb2ludHMnKSxcclxuICAgICAgICAgICAgZ2V0U2VsZWN0UG9pbnQgPSAkKHNlbGVjdFBvaW50cykuZGF0YSgnZ2V0JyksXHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSAnJztcclxuICAgICAgICBpZiAocG9pbnRzKSB7XHJcbiAgICAgICAgICAgIHBvaW50cyA9IEpTT04ucGFyc2UocG9pbnRzKTtcclxuICAgICAgICAgICAgb3B0aW9ucyA9ICc8b3B0aW9uPjwvb3B0aW9uPic7XHJcbiAgICAgICAgICAgIHBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pe1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucyArPSAnPG9wdGlvbiB2YWx1ZT1cIicraXRlbS5pZCsnXCIgJysocGFyc2VJbnQoZ2V0U2VsZWN0UG9pbnQpID09IHBhcnNlSW50KGl0ZW0uaWQpID8gJ3NlbGVjdGVkJyA6ICcnKStcclxuICAgICAgICAgICAgICAgICAgICAnPicraXRlbS5uYW1lKycsICcraXRlbS5jb3VudHJ5KycsICcraXRlbS5jaXR5KycsICcraXRlbS5hZGRyZXNzKyc8L29wdGlvbnM+JztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNlbGVjdFBvaW50cy5pbm5lckhUTUwgPSBvcHRpb25zO1xyXG4gICAgfVxyXG5cclxufVxyXG5wYXltZW50c1NlbGVjdFN0b3JlKCk7XHJcblxyXG4vLyBiMmIg0L/Qu9Cw0YLQtdC20LggLSDQtNC10LnRgdGC0LLQuNGPINGBINCz0YDQuNC0XHJcbiQoXCIucmV2ZXJ0LW9yZGVyXCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBocmVmID0gJy9wYXltZW50cy9yZXZva2UnO1xyXG4gICAgdmFyIGlkcyA9ICQodGhpcykuZGF0YSgnaWQnKTtcclxuICAgIHZhciBkYXRhPXtcclxuICAgICAgICBidXR0b25ZZXM6ZmFsc2UsXHJcbiAgICAgICAgbm90eWZ5X2NsYXNzOlwibm90aWZ5X3doaXRlIG5vdGlmeV9ub3RfYmlnXCIsXHJcbiAgICAgICAgdGl0bGU6ICfQn9GA0Lgg0L7RgtC80LXQvdC1INC/0LvQsNGC0LXQttC10Lkg0L3Rg9C20L3QviDRg9C60LDQt9Cw0YLRjCDQv9GA0LjRh9C40L3RgyDQvtGC0LzQtdC90YsnLFxyXG4gICAgICAgIHF1ZXN0aW9uOlxyXG4gICAgICAgICc8Zm9ybSBhY3Rpb249XCInK2hyZWYrJ1wiIG1ldGhvZD1cInBvc3RcIiBjbGFzcz1cInBheW1lbnRzLWZvcm1zIHJldm9rZV9wYXllbnRzX2Zvcm1cIj4nK1xyXG4gICAgICAgICc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJpZHNcIiBpZD1cInBheW1lbnRzLWlkXCIgdmFsdWU9XCInK2lkcysnXCInKyc+JytcclxuICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj4nK1xyXG4gICAgICAgICc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwicGF5bWVudHMtYWRtaW4tY29tbWVudFwiIG5hbWU9XCJhZG1pbi1jb21tZW50XCIgcGxhY2Vob2xkZXI9XCLQktCy0LXQtNC40YLQtSDQv9GA0LjRh9C40L3RgyDQvtGC0LzQtdC90YtcIj4nK1xyXG4gICAgICAgICc8cCBjbGFzcz1cImhlbHAtYmxvY2sgaGVscC1ibG9jay1lcnJvclwiPjwvcD4nK1xyXG4gICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXAgYnV0dG9uc1wiPicrXHJcbiAgICAgICAgJzxpbnB1dCB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIiB2YWx1ZT1cItCe0YLQutC70L7QvdC40YLRjFwiPicrXHJcbiAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICc8Zm9ybT4nXHJcbiAgICB9O1xyXG4gICAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpXHJcblxyXG5cclxufSk7XHJcblxyXG4kKFwiLnBheW1lbnRzLWdyaWQtdmlldyAuY2hhbmdlLW9yZGVyLXByaWNlXCIpLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XHJcbiAgICB2YXIgb3JkZXJfcHJpY2UgPSAkKHRoaXMpLmRhdGEoJ29yZGVycHJpY2UnKTtcclxuICAgIHZhciBkYXRhPXtcclxuICAgICAgICBidXR0b25ZZXM6ZmFsc2UsXHJcbiAgICAgICAgbm90eWZ5X2NsYXNzOlwibm90aWZ5X3doaXRlIG5vdGlmeV9ub3RfYmlnXCIsXHJcbiAgICAgICAgdGl0bGU6ICfQmNC30LzQtdC90LjRgtGMINGB0YPQvNC80YMg0L/QvtC60YPQv9C60LgnLFxyXG4gICAgICAgIHF1ZXN0aW9uOlxyXG4gICAgICAgICc8Zm9ybSBhY3Rpb249XCIvcGF5bWVudHMvdXBkYXRlXCIgbWV0aG9kPVwicG9zdFwiIGNsYXNzPVwicGF5bWVudHMtZm9ybXMgY2hhbmdlX29yZGVyX3ByaWNlX2Zvcm1cIj4nK1xyXG4gICAgICAgICc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJQYXltZW50c1t1aWRdXCIgaWQ9XCJwYXltZW50cy1pZFwiIHZhbHVlPVwiJytpZCsnXCInKyc+JytcclxuICAgICAgICAnPHAgY2xhc3M9XCJoZWxwLWJsb2NrIGhlbHAtYmxvY2stZXJyb3JcIj48L3A+JytcclxuICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj4nK1xyXG4gICAgICAgICc8bGFiZWw+0J3QvtCy0LDRjyDRgdGD0LzQvNCwPC9sYWJlbD4nK1xyXG4gICAgICAgICc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwicGF5bWVudHMtb3JkZXJfcHJpY2VcIiBuYW1lPVwiUGF5bWVudHNbb3JkZXJfcHJpY2VdXCIgcGxhY2Vob2xkZXI9XCLQktCy0LXQtNC40YLQtSDQvdC+0LLRg9GOINGB0YPQvNC80YNcIiB2YWx1ZT1cIicrb3JkZXJfcHJpY2UrJ1wiPicrXHJcbiAgICAgICAgICAgICc8cCBjbGFzcz1cImhlbHAtYmxvY2sgaGVscC1ibG9jay1lcnJvclwiPjwvcD4nK1xyXG4gICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj4nK1xyXG4gICAgICAgICc8bGFiZWw+0JrQvtC80LzQtdC90YLQsNGA0LjQuTwvbGFiZWw+JytcclxuICAgICAgICAnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBpZD1cInBheW1lbnRzLWFkbWluLWNvbW1lbnRcIiBuYW1lPVwiUGF5bWVudHNbYWRtaW4tY29tbWVudF1cIiBwbGFjZWhvbGRlcj1cItCS0LLQtdC00LjRgtC1INC60L7QvNC80LXQvdGC0LDRgNC40LlcIj4nK1xyXG4gICAgICAgICc8cCBjbGFzcz1cImhlbHAtYmxvY2sgaGVscC1ibG9jay1lcnJvclwiPjwvcD4nK1xyXG4gICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXAgYnV0dG9uc1wiPicrXHJcbiAgICAgICAgJzxpbnB1dCB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIiB2YWx1ZT1cItCY0LfQvNC10L3QuNGC0YxcIj4nK1xyXG4gICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAnPGZvcm0+J1xyXG4gICAgfTtcclxuICAgIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKVxyXG59KTtcclxuXHJcbiQoZG9jdW1lbnQpLm9uKCdzdWJtaXQnLCdmb3JtLmNoYW5nZV9vcmRlcl9wcmljZV9mb3JtJywgZnVuY3Rpb24oZSl7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAkKHRoaXMpLmZpbmQoJ3AuaGVscC1ibG9jaycpLnRleHQoJycpO1xyXG4gICAgdmFyIGlkID0gJCgnI3BheW1lbnRzLWlkJykudmFsKCk7XHJcbiAgICB2YXIgb3JkZXJfcHJpY2UgPSAkKCcjcGF5bWVudHMtb3JkZXJfcHJpY2UnKS52YWwoKTtcclxuICAgIHZhciBhZG1pbl9jb21tZW50ID0gJCgnI3BheW1lbnRzLWFkbWluLWNvbW1lbnQnKS52YWwoKTtcclxuICAgIGlmIChwYXJzZUludChpZCk8MSkge1xyXG4gICAgICAgICQoJyNwYXltZW50cy1pZCcpLnNpYmxpbmdzKCdwLmhlbHAtYmxvY2snKS50ZXh0KCdJRCDQtNC+0LvQttC10L0g0LHRi9GC0Ywg0YbQtdC70YvQvCDRh9C40YHQu9C+0LwnKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBpZiAob3JkZXJfcHJpY2UgPT0gJycpIHtcclxuICAgICAgICAkKCcjcGF5bWVudHMtb3JkZXJfcHJpY2UnKS5zaWJsaW5ncygncC5oZWxwLWJsb2NrJykudGV4dCgn0JLQstC10LTQuNGC0LUg0YHRg9C80LzRgycpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHZhciByZWcgPSAvXlxcZCpcXC4/XFxkKiQvO1xyXG4gICAgaWYgKCFvcmRlcl9wcmljZS5tYXRjaChyZWcpKSB7XHJcbiAgICAgICAgJCgnI3BheW1lbnRzLW9yZGVyX3ByaWNlJykuc2libGluZ3MoJ3AuaGVscC1ibG9jaycpLmh0bWwoJ9CS0LLQtdC00LjRgtC1INC/0YDQsNCy0LjQu9GM0L3QviDRgdGD0LzQvNGDLjxicj7QmtC+0L/QtdC50LrQuCDQvtGCINGA0YPQsdC70LXQuSDQtNC+0LvQttC90Ysg0L7RgtC00LXQu9GP0YLRjNGB0Y8g0YLQvtGH0LrQvtC5Jyk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgaWYgKGFkbWluX2NvbW1lbnQubGVuZ3RoPDUgfHwgYWRtaW5fY29tbWVudC5sZW5ndGg+MjU2KSB7XHJcbiAgICAgICAgJCgnI3BheW1lbnRzLWFkbWluLWNvbW1lbnQnKS5zaWJsaW5ncygncC5oZWxwLWJsb2NrJykudGV4dCgn0JTQu9C40L3QsCDQutC+0LzQvNC10L3RgtCw0YDQuNGPINC00L7Qu9C20L3QsCDQsdGL0YLRjCDQvtGCIDUg0LTQviAyNTYg0YHQuNC80LLQvtC70L7QsicpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgICdpZCcgOiBwYXJzZUludChpZCksXHJcbiAgICAgICAgJ29yZGVyX3ByaWNlJyA6IG9yZGVyX3ByaWNlLFxyXG4gICAgICAgICdhZG1pbi1jb21tZW50JyA6IGFkbWluX2NvbW1lbnRcclxuICAgIH07XHJcbiAgICAkLnBvc3QoJCh0aGlzKS5hdHRyKCdhY3Rpb24nKSwgZGF0YSwgZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnc2hvd19ub3RpZmknKTtcclxuICAgICAgICBpZiAocmVzcG9uc2UuZXJyb3IgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgLy8gbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTogJ9Cf0LvQsNGC0ZHQtiDQuNC30LzQtdC90ZHQvScsIHR5cGU6J3N1Y2Nlc3MnfSk7XHJcbiAgICAgICAgICAgIC8vIHZhciByb3cgPSAkKCd0cltkYXRhLWtleT1cIicraWQrJ1wiXScpO1xyXG4gICAgICAgICAgICAvLyB2YXIgdGRfcHJpY2UgPSAkKHJvdykuZmluZCgnLnRkLW9yZGVyLXByaWNlJyk7XHJcbiAgICAgICAgICAgIC8vICQodGRfcHJpY2UpLnRleHQocmVzcG9uc2UucmVjYWxjLm9yZGVyX3ByaWNlKycgJyskKHRkX3ByaWNlKS5kYXRhKCdjdXInKSk7XHJcbiAgICAgICAgICAgIC8vICQocm93KS5maW5kKCcudGQtcmV3YXJkJykuaHRtbChyZXNwb25zZS5yZWNhbGMucmV3YXJkKycgPHNwYW4gY2xhc3M9XCJmYSBmYS1ydWJcIj48L3NwYW4+Jyk7XHJcbiAgICAgICAgICAgIC8vICQocm93KS5maW5kKCcudGQtY2FzaGJhY2snKS5odG1sKHJlc3BvbnNlLnJlY2FsYy5jYXNoYmFjaysnIDxzcGFuIGNsYXNzPVwiZmEgZmEtcnViXCI+PC9zcGFuPicpO1xyXG4gICAgICAgICAgICAvLyAkKHJvdykuZmluZCgnLmNoYW5nZS1vcmRlci1wcmljZScpLmF0dHIoJ2RhdGEtb3JkZXJwcmljZScsIHJlc3BvbnNlLnJlY2FsYy5vcmRlcl9wcmljZSk7XHJcbiAgICAgICAgICAgICQoJyNncmlkLWFqYXgtYWN0aW9uJykueWlpR3JpZFZpZXcoXCJhcHBseUZpbHRlclwiKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOiAn0J/RgNC+0LjQt9C+0YjQu9CwINC+0YjQuNCx0LrQsCcsIHR5cGU6J2Vycid9KTtcclxuICAgICAgICB9XHJcbiAgICB9LCdqc29uJykuZmFpbChmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnc2hvd19ub3RpZmknKTtcclxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOifQn9GA0L7QuNC30L7RiNC70LAg0L7RiNC40LHQutCwIScsIHR5cGU6J2Vycid9KVxyXG4gICAgfSk7XHJcbn0pO1xyXG5cclxuJChkb2N1bWVudCkub24oJ3N1Ym1pdCcsJ2Zvcm0ucmV2b2tlX3BheWVudHNfZm9ybScsIGZ1bmN0aW9uKGUpe1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgJCh0aGlzKS5maW5kKCdwLmhlbHAtYmxvY2snKS50ZXh0KCcnKTtcclxuICAgIHZhciBpZHMgPSAkKCcjcGF5bWVudHMtaWQnKS52YWwoKTtcclxuICAgIHZhciBzdGF0dXMgPSAkKCcjcGF5bWVudHMtc3RhdHVzJykudmFsKCk7XHJcbiAgICB2YXIgYWRtaW5fY29tbWVudCA9ICQoJyNwYXltZW50cy1hZG1pbi1jb21tZW50JykudmFsKCk7XHJcblxyXG4gICAgaWYgKGFkbWluX2NvbW1lbnQubGVuZ3RoPDUgfHwgYWRtaW5fY29tbWVudC5sZW5ndGg+MjU2KSB7XHJcbiAgICAgICAgJCgnI3BheW1lbnRzLWFkbWluLWNvbW1lbnQnKS5zaWJsaW5ncygncC5oZWxwLWJsb2NrJykudGV4dCgn0JTQu9C40L3QsCDQutC+0LzQvNC10L3RgtCw0YDQuNGPINC00L7Qu9C20L3QsCDQsdGL0YLRjCDQvtGCIDUg0LTQviAyNTYg0YHQuNC80LLQvtC70L7QsicpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgICdpZHMnIDogaWRzLFxyXG4gICAgICAgICdzdGF0dXMnIDogc3RhdHVzLFxyXG4gICAgICAgICdhZG1pbi1jb21tZW50JyA6IGFkbWluX2NvbW1lbnRcclxuICAgIH07XHJcbiAgICAkLnBvc3QoJCh0aGlzKS5hdHRyKCdhY3Rpb24nKSwgZGF0YSwgZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnc2hvd19ub3RpZmknKTtcclxuICAgICAgICBpZiAocmVzcG9uc2UuZXJyb3IgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICQoJyNncmlkLWFqYXgtYWN0aW9uJykueWlpR3JpZFZpZXcoXCJhcHBseUZpbHRlclwiKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOiAn0J/RgNC+0LjQt9C+0YjQu9CwINC+0YjQuNCx0LrQsCcsIHR5cGU6J2Vycid9KTtcclxuICAgICAgICB9XHJcbiAgICB9LCdqc29uJykuZmFpbChmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnc2hvd19ub3RpZmknKTtcclxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOifQn9GA0L7QuNC30L7RiNC70LAg0L7RiNC40LHQutCwIScsIHR5cGU6J2Vycid9KVxyXG4gICAgfSk7XHJcbn0pO1xyXG5cclxuXHJcblxyXG5cclxuIl19
