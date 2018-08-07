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
/**
 * menu-aim is a jQuery plugin for dropdown menus that can differentiate
 * between a user trying hover over a dropdown item vs trying to navigate into
 * a submenu's contents.
 *
 * menu-aim assumes that you have are using a menu with submenus that expand
 * to the menu's right. It will fire events when the user's mouse enters a new
 * dropdown item *and* when that item is being intentionally hovered over.
 *
 * __________________________
 * | Monkeys  >|   Gorilla  |
 * | Gorillas >|   Content  |
 * | Chimps   >|   Here     |
 * |___________|____________|
 *
 * In the above example, "Gorillas" is selected and its submenu content is
 * being shown on the right. Imagine that the user's cursor is hovering over
 * "Gorillas." When they move their mouse into the "Gorilla Content" area, they
 * may briefly hover over "Chimps." This shouldn't close the "Gorilla Content"
 * area.
 *
 * This problem is normally solved using timeouts and delays. menu-aim tries to
 * solve this by detecting the direction of the user's mouse movement. This can
 * make for quicker transitions when navigating up and down the menu. The
 * experience is hopefully similar to amazon.com/'s "Shop by Department"
 * dropdown.
 *
 * Use like so:
 *
 *      $("#menu").menuAim({
 *          activate: $.noop,  // fired on row activation
 *          deactivate: $.noop  // fired on row deactivation
 *      });
 *
 *  ...to receive events when a menu's row has been purposefully (de)activated.
 *
 * The following options can be passed to menuAim. All functions execute with
 * the relevant row's HTML element as the execution context ('this'):
 *
 *      .menuAim({
 *          // Function to call when a row is purposefully activated. Use this
 *          // to show a submenu's content for the activated row.
 *          activate: function() {},
 *
 *          // Function to call when a row is deactivated.
 *          deactivate: function() {},
 *
 *          // Function to call when mouse enters a menu row. Entering a row
 *          // does not mean the row has been activated, as the user may be
 *          // mousing over to a submenu.
 *          enter: function() {},
 *
 *          // Function to call when mouse exits a menu row.
 *          exit: function() {},
 *
 *          // Selector for identifying which elements in the menu are rows
 *          // that can trigger the above events. Defaults to "> li".
 *          rowSelector: "> li",
 *
 *          // You may have some menu rows that aren't submenus and therefore
 *          // shouldn't ever need to "activate." If so, filter submenu rows w/
 *          // this selector. Defaults to "*" (all elements).
 *          submenuSelector: "*",
 *
 *          // Direction the submenu opens relative to the main menu. Can be
 *          // left, right, above, or below. Defaults to "right".
 *          submenuDirection: "right"
 *      });
 *
 * https://github.com/kamens/jQuery-menu-aim
*/
(function($) {

    $.fn.menuAim = function(opts) {
        // Initialize menu-aim for all elements in jQuery collection
        this.each(function() {
            init.call(this, opts);
        });

        return this;
    };

    function init(opts) {
        var $menu = $(this),
            activeRow = null,
            mouseLocs = [],
            lastDelayLoc = null,
            timeoutId = null,
            options = $.extend({
                rowSelector: "> li",
                submenuSelector: "*",
                submenuDirection: "right",
                tolerance: 75,  // bigger = more forgivey when entering submenu
                enter: $.noop,
                exit: $.noop,
                activate: $.noop,
                deactivate: $.noop,
                exitMenu: $.noop
            }, opts);

        var MOUSE_LOCS_TRACKED = 3,  // number of past mouse locations to track
            DELAY = 300;  // ms delay when user appears to be entering submenu

        /**
         * Keep track of the last few locations of the mouse.
         */
        var mousemoveDocument = function(e) {
                mouseLocs.push({x: e.pageX, y: e.pageY});

                if (mouseLocs.length > MOUSE_LOCS_TRACKED) {
                    mouseLocs.shift();
                }
            };

        /**
         * Cancel possible row activations when leaving the menu entirely
         */
        var mouseleaveMenu = function() {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }

                // If exitMenu is supplied and returns true, deactivate the
                // currently active row on menu exit.
                if (options.exitMenu(this)) {
                    if (activeRow) {
                        options.deactivate(activeRow);
                    }

                    activeRow = null;
                }
            };

        /**
         * Trigger a possible row activation whenever entering a new row.
         */
        var mouseenterRow = function() {
                if (timeoutId) {
                    // Cancel any previous activation delays
                    clearTimeout(timeoutId);
                }

                options.enter(this);
                possiblyActivate(this);
            },
            mouseleaveRow = function() {
                options.exit(this);
            };

        /*
         * Immediately activate a row if the user clicks on it.
         */
        var clickRow = function() {
                activate(this);
            };

        /**
         * Activate a menu row.
         */
        var activate = function(row) {
                if (row == activeRow) {
                    return;
                }

                if (activeRow) {
                    options.deactivate(activeRow);
                }

                options.activate(row);
                activeRow = row;
            };

        /**
         * Possibly activate a menu row. If mouse movement indicates that we
         * shouldn't activate yet because user may be trying to enter
         * a submenu's content, then delay and check again later.
         */
        var possiblyActivate = function(row) {
                var delay = activationDelay();

                if (delay) {
                    timeoutId = setTimeout(function() {
                        possiblyActivate(row);
                    }, delay);
                } else {
                    activate(row);
                }
            };

        /**
         * Return the amount of time that should be used as a delay before the
         * currently hovered row is activated.
         *
         * Returns 0 if the activation should happen immediately. Otherwise,
         * returns the number of milliseconds that should be delayed before
         * checking again to see if the row should be activated.
         */
        var activationDelay = function() {
                if (!activeRow || !$(activeRow).is(options.submenuSelector)) {
                    // If there is no other submenu row already active, then
                    // go ahead and activate immediately.
                    return 0;
                }

                var offset = $menu.offset(),
                    upperLeft = {
                        x: offset.left,
                        y: offset.top - options.tolerance
                    },
                    upperRight = {
                        x: offset.left + $menu.outerWidth(),
                        y: upperLeft.y
                    },
                    lowerLeft = {
                        x: offset.left,
                        y: offset.top + $menu.outerHeight() + options.tolerance
                    },
                    lowerRight = {
                        x: offset.left + $menu.outerWidth(),
                        y: lowerLeft.y
                    },
                    loc = mouseLocs[mouseLocs.length - 1],
                    prevLoc = mouseLocs[0];

                if (!loc) {
                    return 0;
                }

                if (!prevLoc) {
                    prevLoc = loc;
                }

                if (prevLoc.x < offset.left || prevLoc.x > lowerRight.x ||
                    prevLoc.y < offset.top || prevLoc.y > lowerRight.y) {
                    // If the previous mouse location was outside of the entire
                    // menu's bounds, immediately activate.
                    return 0;
                }

                if (lastDelayLoc &&
                        loc.x == lastDelayLoc.x && loc.y == lastDelayLoc.y) {
                    // If the mouse hasn't moved since the last time we checked
                    // for activation status, immediately activate.
                    return 0;
                }

                // Detect if the user is moving towards the currently activated
                // submenu.
                //
                // If the mouse is heading relatively clearly towards
                // the submenu's content, we should wait and give the user more
                // time before activating a new row. If the mouse is heading
                // elsewhere, we can immediately activate a new row.
                //
                // We detect this by calculating the slope formed between the
                // current mouse location and the upper/lower right points of
                // the menu. We do the same for the previous mouse location.
                // If the current mouse location's slopes are
                // increasing/decreasing appropriately compared to the
                // previous's, we know the user is moving toward the submenu.
                //
                // Note that since the y-axis increases as the cursor moves
                // down the screen, we are looking for the slope between the
                // cursor and the upper right corner to decrease over time, not
                // increase (somewhat counterintuitively).
                function slope(a, b) {
                    return (b.y - a.y) / (b.x - a.x);
                };

                var decreasingCorner = upperRight,
                    increasingCorner = lowerRight;

                // Our expectations for decreasing or increasing slope values
                // depends on which direction the submenu opens relative to the
                // main menu. By default, if the menu opens on the right, we
                // expect the slope between the cursor and the upper right
                // corner to decrease over time, as explained above. If the
                // submenu opens in a different direction, we change our slope
                // expectations.
                if (options.submenuDirection == "left") {
                    decreasingCorner = lowerLeft;
                    increasingCorner = upperLeft;
                } else if (options.submenuDirection == "below") {
                    decreasingCorner = lowerRight;
                    increasingCorner = lowerLeft;
                } else if (options.submenuDirection == "above") {
                    decreasingCorner = upperLeft;
                    increasingCorner = upperRight;
                }

                var decreasingSlope = slope(loc, decreasingCorner),
                    increasingSlope = slope(loc, increasingCorner),
                    prevDecreasingSlope = slope(prevLoc, decreasingCorner),
                    prevIncreasingSlope = slope(prevLoc, increasingCorner);

                if (decreasingSlope < prevDecreasingSlope &&
                        increasingSlope > prevIncreasingSlope) {
                    // Mouse is moving from previous location towards the
                    // currently activated submenu. Delay before activating a
                    // new menu row, because user may be moving into submenu.
                    lastDelayLoc = loc;
                    return DELAY;
                }

                lastDelayLoc = null;
                return 0;
            };

        /**
         * Hook up initial menu events
         */
        $menu
            .mouseleave(mouseleaveMenu)
            .find(options.rowSelector)
                .mouseenter(mouseenterRow)
                .mouseleave(mouseleaveRow)
                .click(clickRow);

        $(document).mousemove(mousemoveDocument);

    };
})(jQuery);


/**
 * circles - v0.0.6 - 2015-11-27
 *
 * Copyright (c) 2015 lugolabs
 * Licensed 
 */
!function(a,b){"object"==typeof exports?module.exports=b():"function"==typeof define&&define.amd?define([],b):a.Circles=b()}(this,function(){"use strict";var a=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(a){setTimeout(a,1e3/60)},b=function(a){var b=a.id;if(this._el=document.getElementById(b),null!==this._el){this._radius=a.radius||10,this._duration=void 0===a.duration?500:a.duration,this._value=0,this._maxValue=a.maxValue||100,this._text=void 0===a.text?function(a){return this.htmlifyNumber(a)}:a.text,this._strokeWidth=a.width||10,this._colors=a.colors||["#EEE","#F00"],this._svg=null,this._movingPath=null,this._wrapContainer=null,this._textContainer=null,this._wrpClass=a.wrpClass||"circles-wrp",this._textClass=a.textClass||"circles-text",this._valClass=a.valueStrokeClass||"circles-valueStroke",this._maxValClass=a.maxValueStrokeClass||"circles-maxValueStroke",this._styleWrapper=a.styleWrapper===!1?!1:!0,this._styleText=a.styleText===!1?!1:!0;var c=Math.PI/180*270;this._start=-Math.PI/180*90,this._startPrecise=this._precise(this._start),this._circ=c-this._start,this._generate().update(a.value||0)}};return b.prototype={VERSION:"0.0.6",_generate:function(){return this._svgSize=2*this._radius,this._radiusAdjusted=this._radius-this._strokeWidth/2,this._generateSvg()._generateText()._generateWrapper(),this._el.innerHTML="",this._el.appendChild(this._wrapContainer),this},_setPercentage:function(a){this._movingPath.setAttribute("d",this._calculatePath(a,!0)),this._textContainer.innerHTML=this._getText(this.getValueFromPercent(a))},_generateWrapper:function(){return this._wrapContainer=document.createElement("div"),this._wrapContainer.className=this._wrpClass,this._styleWrapper&&(this._wrapContainer.style.position="relative",this._wrapContainer.style.display="inline-block"),this._wrapContainer.appendChild(this._svg),this._wrapContainer.appendChild(this._textContainer),this},_generateText:function(){if(this._textContainer=document.createElement("div"),this._textContainer.className=this._textClass,this._styleText){var a={position:"absolute",top:0,left:0,textAlign:"center",width:"100%",fontSize:.7*this._radius+"px",height:this._svgSize+"px",lineHeight:this._svgSize+"px"};for(var b in a)this._textContainer.style[b]=a[b]}return this._textContainer.innerHTML=this._getText(0),this},_getText:function(a){return this._text?(void 0===a&&(a=this._value),a=parseFloat(a.toFixed(2)),"function"==typeof this._text?this._text.call(this,a):this._text):""},_generateSvg:function(){return this._svg=document.createElementNS("http://www.w3.org/2000/svg","svg"),this._svg.setAttribute("xmlns","http://www.w3.org/2000/svg"),this._svg.setAttribute("width",this._svgSize),this._svg.setAttribute("height",this._svgSize),this._generatePath(100,!1,this._colors[0],this._maxValClass)._generatePath(1,!0,this._colors[1],this._valClass),this._movingPath=this._svg.getElementsByTagName("path")[1],this},_generatePath:function(a,b,c,d){var e=document.createElementNS("http://www.w3.org/2000/svg","path");return e.setAttribute("fill","transparent"),e.setAttribute("stroke",c),e.setAttribute("stroke-width",this._strokeWidth),e.setAttribute("d",this._calculatePath(a,b)),e.setAttribute("class",d),this._svg.appendChild(e),this},_calculatePath:function(a,b){var c=this._start+a/100*this._circ,d=this._precise(c);return this._arc(d,b)},_arc:function(a,b){var c=a-.001,d=a-this._startPrecise<Math.PI?0:1;return["M",this._radius+this._radiusAdjusted*Math.cos(this._startPrecise),this._radius+this._radiusAdjusted*Math.sin(this._startPrecise),"A",this._radiusAdjusted,this._radiusAdjusted,0,d,1,this._radius+this._radiusAdjusted*Math.cos(c),this._radius+this._radiusAdjusted*Math.sin(c),b?"":"Z"].join(" ")},_precise:function(a){return Math.round(1e3*a)/1e3},htmlifyNumber:function(a,b,c){b=b||"circles-integer",c=c||"circles-decimals";var d=(a+"").split("."),e='<span class="'+b+'">'+d[0]+"</span>";return d.length>1&&(e+='.<span class="'+c+'">'+d[1].substring(0,2)+"</span>"),e},updateRadius:function(a){return this._radius=a,this._generate().update(!0)},updateWidth:function(a){return this._strokeWidth=a,this._generate().update(!0)},updateColors:function(a){this._colors=a;var b=this._svg.getElementsByTagName("path");return b[0].setAttribute("stroke",a[0]),b[1].setAttribute("stroke",a[1]),this},getPercent:function(){return 100*this._value/this._maxValue},getValueFromPercent:function(a){return this._maxValue*a/100},getValue:function(){return this._value},getMaxValue:function(){return this._maxValue},update:function(b,c){if(b===!0)return this._setPercentage(this.getPercent()),this;if(this._value==b||isNaN(b))return this;void 0===c&&(c=this._duration);var d,e,f,g,h=this,i=h.getPercent(),j=1;return this._value=Math.min(this._maxValue,Math.max(0,b)),c?(d=h.getPercent(),e=d>i,j+=d%1,f=Math.floor(Math.abs(d-i)/j),g=c/f,function k(b){if(e?i+=j:i-=j,e&&i>=d||!e&&d>=i)return void a(function(){h._setPercentage(d)});a(function(){h._setPercentage(i)});var c=Date.now(),f=c-b;f>=g?k(c):setTimeout(function(){k(Date.now())},g-f)}(Date.now()),this):(this._setPercentage(this.getPercent()),this)}},b.create=function(a){return new b(a)},b});
var Datepicker;

(function (window, $, undefined) {
    var pluginName = 'datepicker',
        autoInitSelector = '.datepicker-here',
        $body, $datepickersContainer,
        containerBuilt = false,
        baseTemplate = '' +
            '<div class="datepicker">' +
            '<nav class="datepicker--nav"></nav>' +
            '<div class="datepicker--content"></div>' +
            '</div>',
        defaults = {
            classes: '',
            inline: false,
            language: 'ru',
            startDate: new Date(),
            firstDay: '',
            weekends: [6, 0],
            dateFormat: '',
            altField: '',
            altFieldDateFormat: '@',
            toggleSelected: true,
            keyboardNav: true,

            position: 'bottom left',
            offset: 12,

            view: 'days',
            minView: 'days',

            showOtherMonths: true,
            selectOtherMonths: true,
            moveToOtherMonthsOnSelect: true,

            showOtherYears: true,
            selectOtherYears: true,
            moveToOtherYearsOnSelect: true,

            minDate: '',
            maxDate: '',
            disableNavWhenOutOfRange: true,

            multipleDates: false, // Boolean or Number
            multipleDatesSeparator: ',',
            range: false,

            todayButton: false,
            clearButton: false,

            showEvent: 'focus',
            autoClose: false,

            // navigation
            monthsField: 'monthsShort',
            prevHtml: '<svg><path d="M 17,12 l -5,5 l 5,5"></path></svg>',
            nextHtml: '<svg><path d="M 14,12 l 5,5 l -5,5"></path></svg>',
            navTitles: {
                days: 'MM, <i>yyyy</i>',
                months: 'yyyy',
                years: 'yyyy1 - yyyy2'
            },

            // events
            onSelect: '',
            onChangeMonth: '',
            onChangeYear: '',
            onChangeDecade: '',
            onChangeView: '',
            onRenderCell: ''
        },
        hotKeys = {
            'ctrlRight': [17, 39],
            'ctrlUp': [17, 38],
            'ctrlLeft': [17, 37],
            'ctrlDown': [17, 40],
            'shiftRight': [16, 39],
            'shiftUp': [16, 38],
            'shiftLeft': [16, 37],
            'shiftDown': [16, 40],
            'altUp': [18, 38],
            'altRight': [18, 39],
            'altLeft': [18, 37],
            'altDown': [18, 40],
            'ctrlShiftUp': [16, 17, 38]
        },
        datepicker;

    Datepicker  = function (el, options) {
        this.el = el;
        this.$el = $(el);

        this.opts = $.extend(true, {}, defaults, options, this.$el.data());

        if ($body == undefined) {
            $body = $('body');
        }

        if (!this.opts.startDate) {
            this.opts.startDate = new Date();
        }

        if (this.el.nodeName == 'INPUT') {
            this.elIsInput = true;
        }

        if (this.opts.altField) {
            this.$altField = typeof this.opts.altField == 'string' ? $(this.opts.altField) : this.opts.altField;
        }

        this.inited = false;
        this.visible = false;
        this.silent = false; // Need to prevent unnecessary rendering

        this.currentDate = this.opts.startDate;
        this.currentView = this.opts.view;
        this._createShortCuts();
        this.selectedDates = [];
        this.views = {};
        this.keys = [];
        this.minRange = '';
        this.maxRange = '';

        this.init()
    };

    datepicker = Datepicker;

    datepicker.prototype = {
        viewIndexes: ['days', 'months', 'years'],

        init: function () {
            if (!containerBuilt && !this.opts.inline && this.elIsInput) {
                this._buildDatepickersContainer();
            }
            this._buildBaseHtml();
            this._defineLocale(this.opts.language);
            this._syncWithMinMaxDates();

            if (this.elIsInput) {
                if (!this.opts.inline) {
                    // Set extra classes for proper transitions
                    this._setPositionClasses(this.opts.position);
                    this._bindEvents()
                }
                if (this.opts.keyboardNav) {
                    this._bindKeyboardEvents();
                }
                this.$datepicker.on('mousedown', this._onMouseDownDatepicker.bind(this));
                this.$datepicker.on('mouseup', this._onMouseUpDatepicker.bind(this));
            }

            if (this.opts.classes) {
                this.$datepicker.addClass(this.opts.classes)
            }

            this.views[this.currentView] = new Datepicker.Body(this, this.currentView, this.opts);
            this.views[this.currentView].show();
            this.nav = new Datepicker.Navigation(this, this.opts);
            this.view = this.currentView;

            this.$datepicker.on('mouseenter', '.datepicker--cell', this._onMouseEnterCell.bind(this));
            this.$datepicker.on('mouseleave', '.datepicker--cell', this._onMouseLeaveCell.bind(this));

            this.inited = true;
        },

        _createShortCuts: function () {
            this.minDate = this.opts.minDate ? this.opts.minDate : new Date(-8639999913600000);
            this.maxDate = this.opts.maxDate ? this.opts.maxDate : new Date(8639999913600000);
        },

        _bindEvents : function () {
            this.$el.on(this.opts.showEvent + '.adp', this._onShowEvent.bind(this));
            this.$el.on('blur.adp', this._onBlur.bind(this));
            this.$el.on('input.adp', this._onInput.bind(this));
            $(window).on('resize.adp', this._onResize.bind(this));
        },

        _bindKeyboardEvents: function () {
            this.$el.on('keydown.adp', this._onKeyDown.bind(this));
            this.$el.on('keyup.adp', this._onKeyUp.bind(this));
            this.$el.on('hotKey.adp', this._onHotKey.bind(this));
        },

        isWeekend: function (day) {
            return this.opts.weekends.indexOf(day) !== -1;
        },

        _defineLocale: function (lang) {
            if (typeof lang == 'string') {
                this.loc = Datepicker.language[lang];
                if (!this.loc) {
                    console.warn('Can\'t find language "' + lang + '" in Datepicker.language, will use "ru" instead');
                    this.loc = $.extend(true, {}, Datepicker.language.ru)
                }

                this.loc = $.extend(true, {}, Datepicker.language.ru, Datepicker.language[lang])
            } else {
                this.loc = $.extend(true, {}, Datepicker.language.ru, lang)
            }

            if (this.opts.dateFormat) {
                this.loc.dateFormat = this.opts.dateFormat
            }

            if (this.opts.firstDay !== '') {
                this.loc.firstDay = this.opts.firstDay
            }
        },

        _buildDatepickersContainer: function () {
            containerBuilt = true;
            $body.append('<div class="datepickers-container" id="datepickers-container"></div>');
            $datepickersContainer = $('#datepickers-container');
        },

        _buildBaseHtml: function () {
            var $appendTarget,
                $inline = $('<div class="datepicker-inline">');

            if(this.el.nodeName == 'INPUT') {
                if (!this.opts.inline) {
                    $appendTarget = $datepickersContainer;
                } else {
                    $appendTarget = $inline.insertAfter(this.$el)
                }
            } else {
                $appendTarget = $inline.appendTo(this.$el)
            }

            this.$datepicker = $(baseTemplate).appendTo($appendTarget);
            this.$content = $('.datepicker--content', this.$datepicker);
            this.$nav = $('.datepicker--nav', this.$datepicker);
        },

        _triggerOnChange: function () {
            if (!this.selectedDates.length) {
                return this.opts.onSelect('', '', this);
            }

            var selectedDates = this.selectedDates,
                parsedSelected = datepicker.getParsedDate(selectedDates[0]),
                formattedDates,
                _this = this,
                dates = new Date(parsedSelected.year, parsedSelected.month, parsedSelected.date);

                formattedDates = selectedDates.map(function (date) {
                    return _this.formatDate(_this.loc.dateFormat, date)
                }).join(this.opts.multipleDatesSeparator);

            // Create new dates array, to separate it from original selectedDates
            if (this.opts.multipleDates || this.opts.range) {
                dates = selectedDates.map(function(date) {
                    var parsedDate = datepicker.getParsedDate(date);
                    return new Date(parsedDate.year, parsedDate.month, parsedDate.date)
                })
            }

            this.opts.onSelect(formattedDates, dates, this);
        },

        next: function () {
            var d = this.parsedDate,
                o = this.opts;
            switch (this.view) {
                case 'days':
                    this.date = new Date(d.year, d.month + 1, 1);
                    if (o.onChangeMonth) o.onChangeMonth(this.parsedDate.month, this.parsedDate.year);
                    break;
                case 'months':
                    this.date = new Date(d.year + 1, d.month, 1);
                    if (o.onChangeYear) o.onChangeYear(this.parsedDate.year);
                    break;
                case 'years':
                    this.date = new Date(d.year + 10, 0, 1);
                    if (o.onChangeDecade) o.onChangeDecade(this.curDecade);
                    break;
            }
        },

        prev: function () {
            var d = this.parsedDate,
                o = this.opts;
            switch (this.view) {
                case 'days':
                    this.date = new Date(d.year, d.month - 1, 1);
                    if (o.onChangeMonth) o.onChangeMonth(this.parsedDate.month, this.parsedDate.year);
                    break;
                case 'months':
                    this.date = new Date(d.year - 1, d.month, 1);
                    if (o.onChangeYear) o.onChangeYear(this.parsedDate.year);
                    break;
                case 'years':
                    this.date = new Date(d.year - 10, 0, 1);
                    if (o.onChangeDecade) o.onChangeDecade(this.curDecade);
                    break;
            }
        },

        formatDate: function (string, date) {
            date = date || this.date;
            var result = string,
                boundary = this._getWordBoundaryRegExp,
                locale = this.loc,
                decade = datepicker.getDecade(date),
                d = datepicker.getParsedDate(date);

            switch (true) {
                case /@/.test(result):
                    result = result.replace(/@/, date.getTime());
                case /dd/.test(result):
                    result = result.replace(boundary('dd'), d.fullDate);
                case /d/.test(result):
                    result = result.replace(boundary('d'), d.date);
                case /DD/.test(result):
                    result = result.replace(boundary('DD'), locale.days[d.day]);
                case /D/.test(result):
                    result = result.replace(boundary('D'), locale.daysShort[d.day]);
                case /mm/.test(result):
                    result = result.replace(boundary('mm'), d.fullMonth);
                case /m/.test(result):
                    result = result.replace(boundary('m'), d.month + 1);
                case /MM/.test(result):
                    result = result.replace(boundary('MM'), this.loc.months[d.month]);
                case /M/.test(result):
                    result = result.replace(boundary('M'), locale.monthsShort[d.month]);
                case /yyyy/.test(result):
                    result = result.replace(boundary('yyyy'), d.year);
                case /yyyy1/.test(result):
                    result = result.replace(boundary('yyyy1'), decade[0]);
                case /yyyy2/.test(result):
                    result = result.replace(boundary('yyyy2'), decade[1]);
                case /yy/.test(result):
                    result = result.replace(boundary('yy'), d.year.toString().slice(-2));
            }

            return result;
        },

        _getWordBoundaryRegExp: function (sign) {
            return new RegExp('\\b(?=[a-zA-Z0-9äöüßÄÖÜ<])' + sign + '(?![>a-zA-Z0-9äöüßÄÖÜ])');
        },

        selectDate: function (date) {
            var _this = this,
                opts = _this.opts,
                d = _this.parsedDate,
                selectedDates = _this.selectedDates,
                len = selectedDates.length,
                newDate = '';

            if (!(date instanceof Date)) return;

            if (_this.view == 'days') {
                if (date.getMonth() != d.month && opts.moveToOtherMonthsOnSelect) {
                    newDate = new Date(date.getFullYear(), date.getMonth(), 1);
                }
            }

            if (_this.view == 'years') {
                if (date.getFullYear() != d.year && opts.moveToOtherYearsOnSelect) {
                    newDate = new Date(date.getFullYear(), 0, 1);
                }
            }

            if (newDate) {
                _this.silent = true;
                _this.date = newDate;
                _this.silent = false;
                _this.nav._render()
            }

            if (opts.multipleDates && !opts.range) { // Set priority to range functionality
                if (len === opts.multipleDates) return;
                if (!_this._isSelected(date)) {
                    _this.selectedDates.push(date);
                }
            } else if (opts.range) {
                if (len == 2) {
                    _this.selectedDates = [date];
                    _this.minRange = date;
                    _this.maxRange = '';
                } else if (len == 1) {
                    _this.selectedDates.push(date);
                    if (!_this.maxRange){
                        _this.maxRange = date;
                    } else {
                        _this.minRange = date;
                    }
                    _this.selectedDates = [_this.minRange, _this.maxRange]

                } else {
                    _this.selectedDates = [date];
                    _this.minRange = date;
                }
            } else {
                _this.selectedDates = [date];
            }

            _this._setInputValue();

            if (opts.onSelect) {
                _this._triggerOnChange();
            }

            if (opts.autoClose) {
                if (!opts.multipleDates && !opts.range) {
                    _this.hide();
                } else if (opts.range && _this.selectedDates.length == 2) {
                    _this.hide();
                }
            }

            _this.views[this.currentView]._render()
        },

        removeDate: function (date) {
            var selected = this.selectedDates,
                _this = this;

            if (!(date instanceof Date)) return;

            return selected.some(function (curDate, i) {
                if (datepicker.isSame(curDate, date)) {
                    selected.splice(i, 1);

                    if (!_this.selectedDates.length) {
                        _this.minRange = '';
                        _this.maxRange = '';
                    }

                    _this.views[_this.currentView]._render();
                    _this._setInputValue();

                    if (_this.opts.onSelect) {
                        _this._triggerOnChange();
                    }

                    return true
                }
            })
        },

        today: function () {
            this.silent = true;
            this.view = this.opts.minView;
            this.silent = false;
            this.date = new Date();
        },

        clear: function () {
            this.selectedDates = [];
            this.minRange = '';
            this.maxRange = '';
            this.views[this.currentView]._render();
            this._setInputValue();
            if (this.opts.onSelect) {
                this._triggerOnChange()
            }
        },

        /**
         * Updates datepicker options
         * @param {String|Object} param - parameter's name to update. If object then it will extend current options
         * @param {String|Number|Object} [value] - new param value
         */
        update: function (param, value) {
            var len = arguments.length;
            if (len == 2) {
                this.opts[param] = value;
            } else if (len == 1 && typeof param == 'object') {
                this.opts = $.extend(true, this.opts, param)
            }

            this._createShortCuts();
            this._syncWithMinMaxDates();
            this._defineLocale(this.opts.language);
            this.nav._addButtonsIfNeed();
            this.nav._render();
            this.views[this.currentView]._render();

            if (this.elIsInput && !this.opts.inline) {
                this._setPositionClasses(this.opts.position);
                if (this.visible) {
                    this.setPosition(this.opts.position)
                }
            }

            if (this.opts.classes) {
                this.$datepicker.addClass(this.opts.classes)
            }

            return this;
        },

        _syncWithMinMaxDates: function () {
            var curTime = this.date.getTime();
            this.silent = true;
            if (this.minTime > curTime) {
                this.date = this.minDate;
            }

            if (this.maxTime < curTime) {
                this.date = this.maxDate;
            }
            this.silent = false;
        },

        _isSelected: function (checkDate, cellType) {
            return this.selectedDates.some(function (date) {
                return datepicker.isSame(date, checkDate, cellType)
            })
        },

        _setInputValue: function () {
            var _this = this,
                opts = _this.opts,
                format = _this.loc.dateFormat,
                altFormat = opts.altFieldDateFormat,
                value = _this.selectedDates.map(function (date) {
                    return _this.formatDate(format, date)
                }),
                altValues;

            if (opts.altField && _this.$altField.length) {
                altValues = this.selectedDates.map(function (date) {
                    return _this.formatDate(altFormat, date)
                });
                altValues = altValues.join(this.opts.multipleDatesSeparator);
                this.$altField.val(altValues);
            }

            value = value.join(this.opts.multipleDatesSeparator);

            this.$el.val(value)
        },

        /**
         * Check if date is between minDate and maxDate
         * @param date {object} - date object
         * @param type {string} - cell type
         * @returns {boolean}
         * @private
         */
        _isInRange: function (date, type) {
            var time = date.getTime(),
                d = datepicker.getParsedDate(date),
                min = datepicker.getParsedDate(this.minDate),
                max = datepicker.getParsedDate(this.maxDate),
                dMinTime = new Date(d.year, d.month, min.date).getTime(),
                dMaxTime = new Date(d.year, d.month, max.date).getTime(),
                types = {
                    day: time >= this.minTime && time <= this.maxTime,
                    month: dMinTime >= this.minTime && dMaxTime <= this.maxTime,
                    year: d.year >= min.year && d.year <= max.year
                };
            return type ? types[type] : types.day
        },

        _getDimensions: function ($el) {
            var offset = $el.offset();

            return {
                width: $el.outerWidth(),
                height: $el.outerHeight(),
                left: offset.left,
                top: offset.top
            }
        },

        _getDateFromCell: function (cell) {
            var curDate = this.parsedDate,
                year = cell.data('year') || curDate.year,
                month = cell.data('month') == undefined ? curDate.month : cell.data('month'),
                date = cell.data('date') || 1;

            return new Date(year, month, date);
        },

        _setPositionClasses: function (pos) {
            pos = pos.split(' ');
            var main = pos[0],
                sec = pos[1],
                classes = 'datepicker -' + main + '-' + sec + '- -from-' + main + '-';

            if (this.visible) classes += ' active';

            this.$datepicker
                .removeAttr('class')
                .addClass(classes);
        },

        setPosition: function (position) {
            position = position || this.opts.position;

            var dims = this._getDimensions(this.$el),
                selfDims = this._getDimensions(this.$datepicker),
                pos = position.split(' '),
                top, left,
                offset = this.opts.offset,
                main = pos[0],
                secondary = pos[1];

            switch (main) {
                case 'top':
                    top = dims.top - selfDims.height - offset;
                    break;
                case 'right':
                    left = dims.left + dims.width + offset;
                    break;
                case 'bottom':
                    top = dims.top + dims.height + offset;
                    break;
                case 'left':
                    left = dims.left - selfDims.width - offset;
                    break;
            }

            switch(secondary) {
                case 'top':
                    top = dims.top;
                    break;
                case 'right':
                    left = dims.left + dims.width - selfDims.width;
                    break;
                case 'bottom':
                    top = dims.top + dims.height - selfDims.height;
                    break;
                case 'left':
                    left = dims.left;
                    break;
                case 'center':
                    if (/left|right/.test(main)) {
                        top = dims.top + dims.height/2 - selfDims.height/2;
                    } else {
                        left = dims.left + dims.width/2 - selfDims.width/2;
                    }
            }

            this.$datepicker
                .css({
                    left: left,
                    top: top
                })
        },

        show: function () {
            this.setPosition(this.opts.position);
            this.$datepicker.addClass('active');
            this.visible = true;
        },

        hide: function () {
            this.$datepicker
                .removeClass('active')
                .css({
                    left: '-100000px'
                });

            this.focused = '';
            this.keys = [];

            this.inFocus = false;
            this.visible = false;
            this.$el.blur();
        },

        down: function (date) {
            this._changeView(date, 'down');
        },

        up: function (date) {
            this._changeView(date, 'up');
        },

        _changeView: function (date, dir) {
            date = date || this.focused || this.date;

            var nextView = dir == 'up' ? this.viewIndex + 1 : this.viewIndex - 1;
            if (nextView > 2) nextView = 2;
            if (nextView < 0) nextView = 0;

            this.silent = true;
            this.date = new Date(date.getFullYear(), date.getMonth(), 1);
            this.silent = false;
            this.view = this.viewIndexes[nextView];

        },

        _handleHotKey: function (key) {
            var date = datepicker.getParsedDate(this._getFocusedDate()),
                focusedParsed,
                o = this.opts,
                newDate,
                totalDaysInNextMonth,
                monthChanged = false,
                yearChanged = false,
                decadeChanged = false,
                y = date.year,
                m = date.month,
                d = date.date;

            switch (key) {
                case 'ctrlRight':
                case 'ctrlUp':
                    m += 1;
                    monthChanged = true;
                    break;
                case 'ctrlLeft':
                case 'ctrlDown':
                    m -= 1;
                    monthChanged = true;
                    break;
                case 'shiftRight':
                case 'shiftUp':
                    yearChanged = true;
                    y += 1;
                    break;
                case 'shiftLeft':
                case 'shiftDown':
                    yearChanged = true;
                    y -= 1;
                    break;
                case 'altRight':
                case 'altUp':
                    decadeChanged = true;
                    y += 10;
                    break;
                case 'altLeft':
                case 'altDown':
                    decadeChanged = true;
                    y -= 10;
                    break;
                case 'ctrlShiftUp':
                    this.up();
                    break;
            }

            totalDaysInNextMonth = datepicker.getDaysCount(new Date(y,m));
            newDate = new Date(y,m,d);

            // If next month has less days than current, set date to total days in that month
            if (totalDaysInNextMonth < d) d = totalDaysInNextMonth;

            // Check if newDate is in valid range
            if (newDate.getTime() < this.minTime) {
                newDate = this.minDate;
            } else if (newDate.getTime() > this.maxTime) {
                newDate = this.maxDate;
            }

            this.focused = newDate;

            focusedParsed = datepicker.getParsedDate(newDate);
            if (monthChanged && o.onChangeMonth) {
                o.onChangeMonth(focusedParsed.month, focusedParsed.year)
            }
            if (yearChanged && o.onChangeYear) {
                o.onChangeYear(focusedParsed.year)
            }
            if (decadeChanged && o.onChangeDecade) {
                o.onChangeDecade(this.curDecade)
            }
        },

        _registerKey: function (key) {
            var exists = this.keys.some(function (curKey) {
                return curKey == key;
            });

            if (!exists) {
                this.keys.push(key)
            }
        },

        _unRegisterKey: function (key) {
            var index = this.keys.indexOf(key);

            this.keys.splice(index, 1);
        },

        _isHotKeyPressed: function () {
            var currentHotKey,
                found = false,
                _this = this,
                pressedKeys = this.keys.sort();

            for (var hotKey in hotKeys) {
                currentHotKey = hotKeys[hotKey];
                if (pressedKeys.length != currentHotKey.length) continue;

                if (currentHotKey.every(function (key, i) { return key == pressedKeys[i]})) {
                    _this._trigger('hotKey', hotKey);
                    found = true;
                }
            }

            return found;
        },

        _trigger: function (event, args) {
            this.$el.trigger(event, args)
        },

        _focusNextCell: function (keyCode, type) {
            type = type || this.cellType;

            var date = datepicker.getParsedDate(this._getFocusedDate()),
                y = date.year,
                m = date.month,
                d = date.date;

            if (this._isHotKeyPressed()){
                return;
            }

            switch(keyCode) {
                case 37: // left
                    type == 'day' ? (d -= 1) : '';
                    type == 'month' ? (m -= 1) : '';
                    type == 'year' ? (y -= 1) : '';
                    break;
                case 38: // up
                    type == 'day' ? (d -= 7) : '';
                    type == 'month' ? (m -= 3) : '';
                    type == 'year' ? (y -= 4) : '';
                    break;
                case 39: // right
                    type == 'day' ? (d += 1) : '';
                    type == 'month' ? (m += 1) : '';
                    type == 'year' ? (y += 1) : '';
                    break;
                case 40: // down
                    type == 'day' ? (d += 7) : '';
                    type == 'month' ? (m += 3) : '';
                    type == 'year' ? (y += 4) : '';
                    break;
            }

            var nd = new Date(y,m,d);
            if (nd.getTime() < this.minTime) {
                nd = this.minDate;
            } else if (nd.getTime() > this.maxTime) {
                nd = this.maxDate;
            }

            this.focused = nd;

        },

        _getFocusedDate: function () {
            var focused  = this.focused || this.selectedDates[this.selectedDates.length - 1],
                d = this.parsedDate;

            if (!focused) {
                switch (this.view) {
                    case 'days':
                        focused = new Date(d.year, d.month, new Date().getDate());
                        break;
                    case 'months':
                        focused = new Date(d.year, d.month, 1);
                        break;
                    case 'years':
                        focused = new Date(d.year, 0, 1);
                        break;
                }
            }

            return focused;
        },

        _getCell: function (date, type) {
            type = type || this.cellType;

            var d = datepicker.getParsedDate(date),
                selector = '.datepicker--cell[data-year="' + d.year + '"]',
                $cell;

            switch (type) {
                case 'month':
                    selector = '[data-month="' + d.month + '"]';
                    break;
                case 'day':
                    selector += '[data-month="' + d.month + '"][data-date="' + d.date + '"]';
                    break;
            }
            $cell = this.views[this.currentView].$el.find(selector);

            return $cell.length ? $cell : '';
        },

        destroy: function () {
            var _this = this;
            _this.$el
                .off('.adp')
                .data('datepicker', '');

            _this.selectedDates = [];
            _this.focused = '';
            _this.views = {};
            _this.keys = [];
            _this.minRange = '';
            _this.maxRange = '';

            if (_this.opts.inline || !_this.elIsInput) {
                _this.$datepicker.closest('.datepicker-inline').remove();
            } else {
                _this.$datepicker.remove();
            }
        },

        _onShowEvent: function () {
            if (!this.visible) {
                this.show();
            }
        },

        _onBlur: function () {
            if (!this.inFocus && this.visible) {
                this.hide();
            }
        },

        _onMouseDownDatepicker: function (e) {
            this.inFocus = true;
        },

        _onMouseUpDatepicker: function (e) {
            this.inFocus = false;
            this.$el.focus()
        },

        _onInput: function () {
            var val = this.$el.val();

            if (!val) {
                this.clear();
            }
        },

        _onResize: function () {
            if (this.visible) {
                this.setPosition();
            }
        },

        _onKeyDown: function (e) {
            var code = e.which;
            this._registerKey(code);

            // Arrows
            if (code >= 37 && code <= 40) {
                e.preventDefault();
                this._focusNextCell(code);
            }

            // Enter
            if (code == 13) {
                if (this.focused) {
                    if (this._getCell(this.focused).hasClass('-disabled-')) return;
                    if (this.view != this.opts.minView) {
                        this.down()
                    } else {
                        var alreadySelected = this._isSelected(this.focused, this.cellType);

                        if (!alreadySelected) {
                            this.selectDate(this.focused);
                        } else if (alreadySelected && this.opts.toggleSelected){
                            this.removeDate(this.focused);
                        }
                    }
                }
            }

            // Esc
            if (code == 27) {
                this.hide();
            }
        },

        _onKeyUp: function (e) {
            var code = e.which;
            this._unRegisterKey(code);
        },

        _onHotKey: function (e, hotKey) {
            this._handleHotKey(hotKey);
        },

        _onMouseEnterCell: function (e) {
            var $cell = $(e.target).closest('.datepicker--cell'),
                date = this._getDateFromCell($cell);

            // Prevent from unnecessary rendering and setting new currentDate
            this.silent = true;

            if (this.focused) {
                this.focused = ''
            }

            $cell.addClass('-focus-');

            this.focused = date;
            this.silent = false;

            if (this.opts.range && this.selectedDates.length == 1) {
                this.minRange = this.selectedDates[0];
                this.maxRange = '';
                if (datepicker.less(this.minRange, this.focused)) {
                    this.maxRange = this.minRange;
                    this.minRange = '';
                }
                this.views[this.currentView]._update();
            }
        },

        _onMouseLeaveCell: function (e) {
            var $cell = $(e.target).closest('.datepicker--cell');

            $cell.removeClass('-focus-');

            this.silent = true;
            this.focused = '';
            this.silent = false;
        },

        set focused(val) {
            if (!val && this.focused) {
                var $cell = this._getCell(this.focused);

                if ($cell.length) {
                    $cell.removeClass('-focus-')
                }
            }
            this._focused = val;
            if (this.opts.range && this.selectedDates.length == 1) {
                this.minRange = this.selectedDates[0];
                this.maxRange = '';
                if (datepicker.less(this.minRange, this._focused)) {
                    this.maxRange = this.minRange;
                    this.minRange = '';
                }
            }
            if (this.silent) return;
            this.date = val;
        },

        get focused() {
            return this._focused;
        },

        get parsedDate() {
            return datepicker.getParsedDate(this.date);
        },

        set date (val) {
            if (!(val instanceof Date)) return;

            this.currentDate = val;

            if (this.inited && !this.silent) {
                this.views[this.view]._render();
                this.nav._render();
                if (this.visible && this.elIsInput) {
                    this.setPosition();
                }
            }
            return val;
        },

        get date () {
            return this.currentDate
        },

        set view (val) {
            this.viewIndex = this.viewIndexes.indexOf(val);

            if (this.viewIndex < 0) {
                return;
            }

            this.prevView = this.currentView;
            this.currentView = val;

            if (this.inited) {
                if (!this.views[val]) {
                    this.views[val] = new Datepicker.Body(this, val, this.opts)
                } else {
                    this.views[val]._render();
                }

                this.views[this.prevView].hide();
                this.views[val].show();
                this.nav._render();

                if (this.opts.onChangeView) {
                    this.opts.onChangeView(val)
                }
                if (this.elIsInput && this.visible) this.setPosition();
            }

            return val
        },

        get view() {
            return this.currentView;
        },

        get cellType() {
            return this.view.substring(0, this.view.length - 1)
        },

        get minTime() {
            var min = datepicker.getParsedDate(this.minDate);
            return new Date(min.year, min.month, min.date).getTime()
        },

        get maxTime() {
            var max = datepicker.getParsedDate(this.maxDate);
            return new Date(max.year, max.month, max.date).getTime()
        },

        get curDecade() {
            return datepicker.getDecade(this.date)
        }
    };

    //  Utils
    // -------------------------------------------------

    datepicker.getDaysCount = function (date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    datepicker.getParsedDate = function (date) {
        return {
            year: date.getFullYear(),
            month: date.getMonth(),
            fullMonth: (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1, // One based
            date: date.getDate(),
            fullDate: date.getDate() < 10 ? '0' + date.getDate() : date.getDate(),
            day: date.getDay()
        }
    };

    datepicker.getDecade = function (date) {
        var firstYear = Math.floor(date.getFullYear() / 10) * 10;

        return [firstYear, firstYear + 9];
    };

    datepicker.template = function (str, data) {
        return str.replace(/#\{([\w]+)\}/g, function (source, match) {
            if (data[match] || data[match] === 0) {
                return data[match]
            }
        });
    };

    datepicker.isSame = function (date1, date2, type) {
        if (!date1 || !date2) return false;
        var d1 = datepicker.getParsedDate(date1),
            d2 = datepicker.getParsedDate(date2),
            _type = type ? type : 'day',

            conditions = {
                day: d1.date == d2.date && d1.month == d2.month && d1.year == d2.year,
                month: d1.month == d2.month && d1.year == d2.year,
                year: d1.year == d2.year
            };

        return conditions[_type];
    };

    datepicker.less = function (dateCompareTo, date, type) {
        if (!dateCompareTo || !date) return false;
        return date.getTime() < dateCompareTo.getTime();
    };

    datepicker.bigger = function (dateCompareTo, date, type) {
        if (!dateCompareTo || !date) return false;
        return date.getTime() > dateCompareTo.getTime();
    };

    Datepicker.language = {
        ru: {
            days: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
            daysShort: ['Вос','Пон','Вто','Сре','Чет','Пят','Суб'],
            daysMin: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
            months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
            monthsShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
            today: 'Сегодня',
            clear: 'Очистить',
            dateFormat: 'dd.mm.yyyy',
            firstDay: 1
        }
    };

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, pluginName)) {
                $.data(this,  pluginName,
                    new Datepicker( this, options ));
            } else {
                var _this = $.data(this, pluginName);

                _this.opts = $.extend(true, _this.opts, options);
                _this.update();
            }
        });
    };

    $(function () {
        $(autoInitSelector).datepicker();
    })

})(window, jQuery);
;(function () {
    var templates = {
        days:'' +
        '<div class="datepicker--days datepicker--body">' +
        '<div class="datepicker--days-names"></div>' +
        '<div class="datepicker--cells datepicker--cells-days"></div>' +
        '</div>',
        months: '' +
        '<div class="datepicker--months datepicker--body">' +
        '<div class="datepicker--cells datepicker--cells-months"></div>' +
        '</div>',
        years: '' +
        '<div class="datepicker--years datepicker--body">' +
        '<div class="datepicker--cells datepicker--cells-years"></div>' +
        '</div>'
        },
        D = Datepicker;

    D.Body = function (d, type, opts) {
        this.d = d;
        this.type = type;
        this.opts = opts;

        this.init();
    };

    D.Body.prototype = {
        init: function () {
            this._buildBaseHtml();
            this._render();

            this._bindEvents();
        },

        _bindEvents: function () {
            this.$el.on('click', '.datepicker--cell', $.proxy(this._onClickCell, this));
        },

        _buildBaseHtml: function () {
            this.$el = $(templates[this.type]).appendTo(this.d.$content);
            this.$names = $('.datepicker--days-names', this.$el);
            this.$cells = $('.datepicker--cells', this.$el);
        },

        _getDayNamesHtml: function (firstDay, curDay, html, i) {
            curDay = curDay != undefined ? curDay : firstDay;
            html = html ? html : '';
            i = i != undefined ? i : 0;

            if (i > 7) return html;
            if (curDay == 7) return this._getDayNamesHtml(firstDay, 0, html, ++i);

            html += '<div class="datepicker--day-name' + (this.d.isWeekend(curDay) ? " -weekend-" : "") + '">' + this.d.loc.daysMin[curDay] + '</div>';

            return this._getDayNamesHtml(firstDay, ++curDay, html, ++i);
        },

        _getCellContents: function (date, type) {
            var classes = "datepicker--cell datepicker--cell-" + type,
                currentDate = new Date(),
                parent = this.d,
                opts = parent.opts,
                d = D.getParsedDate(date),
                render = {},
                html = d.date;

            if (opts.onRenderCell) {
                render = opts.onRenderCell(date, type) || {};
                html = render.html ? render.html : html;
                classes += render.classes ? ' ' + render.classes : '';
            }

            switch (type) {
                case 'day':
                    if (parent.isWeekend(d.day)) classes += " -weekend-";
                    if (d.month != this.d.parsedDate.month) {
                        classes += " -other-month-";
                        if (!opts.selectOtherMonths) {
                            classes += " -disabled-";
                        }
                        if (!opts.showOtherMonths) html = '';
                    }
                    break;
                case 'month':
                    html = parent.loc[parent.opts.monthsField][d.month];
                    break;
                case 'year':
                    var decade = parent.curDecade;
                    html = d.year;
                    if (d.year < decade[0] || d.year > decade[1]) {
                        classes += ' -other-decade-';
                        if (!opts.selectOtherYears) {
                            classes += " -disabled-";
                        }
                        if (!opts.showOtherYears) html = '';
                    }
                    break;
            }

            if (opts.onRenderCell) {
                render = opts.onRenderCell(date, type) || {};
                html = render.html ? render.html : html;
                classes += render.classes ? ' ' + render.classes : '';
            }

            if (opts.range) {
                if (D.isSame(parent.minRange, date, type)) classes += ' -range-from-';
                if (D.isSame(parent.maxRange, date, type)) classes += ' -range-to-';

                if (parent.selectedDates.length == 1 && parent.focused) {
                    if (
                        (D.bigger(parent.minRange, date) && D.less(parent.focused, date)) ||
                        (D.less(parent.maxRange, date) && D.bigger(parent.focused, date)))
                    {
                        classes += ' -in-range-'
                    }

                    if (D.less(parent.maxRange, date) && D.isSame(parent.focused, date)) {
                        classes += ' -range-from-'
                    }
                    if (D.bigger(parent.minRange, date) && D.isSame(parent.focused, date)) {
                        classes += ' -range-to-'
                    }

                } else if (parent.selectedDates.length == 2) {
                    if (D.bigger(parent.minRange, date) && D.less(parent.maxRange, date)) {
                        classes += ' -in-range-'
                    }
                }
            }


            if (D.isSame(currentDate, date, type)) classes += ' -current-';
            if (parent.focused && D.isSame(date, parent.focused, type)) classes += ' -focus-';
            if (parent._isSelected(date, type)) classes += ' -selected-';
            if (!parent._isInRange(date, type) || render.disabled) classes += ' -disabled-';

            return {
                html: html,
                classes: classes
            }
        },

        /**
         * Calculates days number to render. Generates days html and returns it.
         * @param {object} date - Date object
         * @returns {string}
         * @private
         */
        _getDaysHtml: function (date) {
            var totalMonthDays = D.getDaysCount(date),
                firstMonthDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay(),
                lastMonthDay = new Date(date.getFullYear(), date.getMonth(), totalMonthDays).getDay(),
                daysFromPevMonth = firstMonthDay - this.d.loc.firstDay,
                daysFromNextMonth = 6 - lastMonthDay + this.d.loc.firstDay;

            daysFromPevMonth = daysFromPevMonth < 0 ? daysFromPevMonth + 7 : daysFromPevMonth;
            daysFromNextMonth = daysFromNextMonth > 6 ? daysFromNextMonth - 7 : daysFromNextMonth;

            var startDayIndex = -daysFromPevMonth + 1,
                m, y,
                html = '';

            for (var i = startDayIndex, max = totalMonthDays + daysFromNextMonth; i <= max; i++) {
                y = date.getFullYear();
                m = date.getMonth();

                html += this._getDayHtml(new Date(y, m, i))
            }

            return html;
        },

        _getDayHtml: function (date) {
           var content = this._getCellContents(date, 'day');

            return '<div class="' + content.classes + '" ' +
                'data-date="' + date.getDate() + '" ' +
                'data-month="' + date.getMonth() + '" ' +
                'data-year="' + date.getFullYear() + '">' + content.html + '</div>';
        },

        /**
         * Generates months html
         * @param {object} date - date instance
         * @returns {string}
         * @private
         */
        _getMonthsHtml: function (date) {
            var html = '',
                d = D.getParsedDate(date),
                i = 0;

            while(i < 12) {
                html += this._getMonthHtml(new Date(d.year, i));
                i++
            }

            return html;
        },

        _getMonthHtml: function (date) {
            var content = this._getCellContents(date, 'month');

            return '<div class="' + content.classes + '" data-month="' + date.getMonth() + '">' + content.html + '</div>'
        },

        _getYearsHtml: function (date) {
            var d = D.getParsedDate(date),
                decade = D.getDecade(date),
                firstYear = decade[0] - 1,
                html = '',
                i = firstYear;

            for (i; i <= decade[1] + 1; i++) {
                html += this._getYearHtml(new Date(i , 0));
            }

            return html;
        },

        _getYearHtml: function (date) {
            var content = this._getCellContents(date, 'year');

            return '<div class="' + content.classes + '" data-year="' + date.getFullYear() + '">' + content.html + '</div>'
        },

        _renderTypes: {
            days: function () {
                var dayNames = this._getDayNamesHtml(this.d.loc.firstDay),
                    days = this._getDaysHtml(this.d.currentDate);

                this.$cells.html(days);
                this.$names.html(dayNames)
            },
            months: function () {
                var html = this._getMonthsHtml(this.d.currentDate);

                this.$cells.html(html)
            },
            years: function () {
                var html = this._getYearsHtml(this.d.currentDate);

                this.$cells.html(html)
            }
        },

        _render: function () {
            this._renderTypes[this.type].bind(this)();
        },

        _update: function () {
            var $cells = $('.datepicker--cell', this.$cells),
                _this = this,
                classes,
                $cell,
                date;
            $cells.each(function (cell, i) {
                $cell = $(this);
                date = _this.d._getDateFromCell($(this));
                classes = _this._getCellContents(date, _this.d.cellType);
                $cell.attr('class',classes.classes)
            });
        },

        show: function () {
            this.$el.addClass('active');
            this.acitve = true;
        },

        hide: function () {
            this.$el.removeClass('active');
            this.active = false;
        },

        //  Events
        // -------------------------------------------------

        _handleClick: function (el) {
            var date = el.data('date') || 1,
                month = el.data('month') || 0,
                year = el.data('year') || this.d.parsedDate.year;
            // Change view if min view does not reach yet
            if (this.d.view != this.opts.minView) {
                this.d.down(new Date(year, month, date));
                return;
            }
            // Select date if min view is reached
            var selectedDate = new Date(year, month, date),
                alreadySelected = this.d._isSelected(selectedDate, this.d.cellType);

            if (!alreadySelected) {
                this.d.selectDate(selectedDate);
            } else if (alreadySelected && this.opts.toggleSelected){
                this.d.removeDate(selectedDate);
            }

        },

        _onClickCell: function (e) {
            var $el = $(e.target).closest('.datepicker--cell');

            if ($el.hasClass('-disabled-')) return;

            this._handleClick.bind(this)($el);
        }
    };
})();

;(function () {
    var template = '' +
        '<div class="datepicker--nav-action" data-action="prev">#{prevHtml}</div>' +
        '<div class="datepicker--nav-title">#{title}</div>' +
        '<div class="datepicker--nav-action" data-action="next">#{nextHtml}</div>',
        buttonsContainerTemplate = '<div class="datepicker--buttons"></div>',
        button = '<span class="datepicker--button" data-action="#{action}">#{label}</span>';

    Datepicker.Navigation = function (d, opts) {
        this.d = d;
        this.opts = opts;

        this.$buttonsContainer = '';

        this.init();
    };

    Datepicker.Navigation.prototype = {
        init: function () {
            this._buildBaseHtml();
            this._bindEvents();
        },

        _bindEvents: function () {
            this.d.$nav.on('click', '.datepicker--nav-action', $.proxy(this._onClickNavButton, this));
            this.d.$nav.on('click', '.datepicker--nav-title', $.proxy(this._onClickNavTitle, this));
            this.d.$datepicker.on('click', '.datepicker--button', $.proxy(this._onClickNavButton, this));
        },

        _buildBaseHtml: function () {
            this._render();
            this._addButtonsIfNeed();
        },

        _addButtonsIfNeed: function () {
            if (this.opts.todayButton) {
                this._addButton('today')
            }
            if (this.opts.clearButton) {
                this._addButton('clear')
            }
        },

        _render: function () {
            var title = this._getTitle(this.d.currentDate),
                html = Datepicker.template(template, $.extend({title: title}, this.opts));
            this.d.$nav.html(html);
            if (this.d.view == 'years') {
                $('.datepicker--nav-title', this.d.$nav).addClass('-disabled-');
            }
            this.setNavStatus();
        },

        _getTitle: function (date) {
            return this.d.formatDate(this.opts.navTitles[this.d.view], date)
        },

        _addButton: function (type) {
            if (!this.$buttonsContainer.length) {
                this._addButtonsContainer();
            }

            var data = {
                    action: type,
                    label: this.d.loc[type]
                },
                html = Datepicker.template(button, data);

            if ($('[data-action=' + type + ']', this.$buttonsContainer).length) return;
            this.$buttonsContainer.append(html);
        },

        _addButtonsContainer: function () {
            this.d.$datepicker.append(buttonsContainerTemplate);
            this.$buttonsContainer = $('.datepicker--buttons', this.d.$datepicker);
        },

        setNavStatus: function () {
            if (!(this.opts.minDate || this.opts.maxDate) || !this.opts.disableNavWhenOutOfRange) return;

            var date = this.d.parsedDate,
                m = date.month,
                y = date.year,
                d = date.date;

            switch (this.d.view) {
                case 'days':
                    if (!this.d._isInRange(new Date(y, m-1, d), 'month')) {
                        this._disableNav('prev')
                    }
                    if (!this.d._isInRange(new Date(y, m+1, d), 'month')) {
                        this._disableNav('next')
                    }
                    break;
                case 'months':
                    if (!this.d._isInRange(new Date(y-1, m, d), 'year')) {
                        this._disableNav('prev')
                    }
                    if (!this.d._isInRange(new Date(y+1, m, d), 'year')) {
                        this._disableNav('next')
                    }
                    break;
                case 'years':
                    if (!this.d._isInRange(new Date(y-10, m, d), 'year')) {
                        this._disableNav('prev')
                    }
                    if (!this.d._isInRange(new Date(y+10, m, d), 'year')) {
                        this._disableNav('next')
                    }
                    break;
            }
        },

        _disableNav: function (nav) {
            $('[data-action="' + nav + '"]', this.d.$nav).addClass('-disabled-')
        },

        _activateNav: function (nav) {
            $('[data-action="' + nav + '"]', this.d.$nav).removeClass('-disabled-')
        },

        _onClickNavButton: function (e) {
            var $el = $(e.target).closest('[data-action]'),
                action = $el.data('action');

            this.d[action]();
        },

        _onClickNavTitle: function (e) {
            if ($(e.target).hasClass('-disabled-')) return;

            if (this.d.view == 'days') {
                return this.d.view = 'months'
            }

            this.d.view = 'years';
        }
    }

})();

!function(a,b){"function"==typeof define&&define.amd?define(["jquery"],b):"object"==typeof exports?module.exports=b(require("jquery")):b(a.jQuery)}(this,function(a){"function"!=typeof Object.create&&(Object.create=function(a){function b(){}return b.prototype=a,new b});var b={init:function(b){return this.options=a.extend({},a.noty.defaults,b),this.options.layout=this.options.custom?a.noty.layouts.inline:a.noty.layouts[this.options.layout],a.noty.themes[this.options.theme]?this.options.theme=a.noty.themes[this.options.theme]:this.options.themeClassName=this.options.theme,this.options=a.extend({},this.options,this.options.layout.options),this.options.id="noty_"+(new Date).getTime()*Math.floor(1e6*Math.random()),this._build(),this},_build:function(){var b=a('<div class="noty_bar noty_type_'+this.options.type+'"></div>').attr("id",this.options.id);if(b.append(this.options.template).find(".noty_text").html(this.options.text),this.$bar=null!==this.options.layout.parent.object?a(this.options.layout.parent.object).css(this.options.layout.parent.css).append(b):b,this.options.themeClassName&&this.$bar.addClass(this.options.themeClassName).addClass("noty_container_type_"+this.options.type),this.options.buttons){this.options.closeWith=[],this.options.timeout=!1;var c=a("<div/>").addClass("noty_buttons");null!==this.options.layout.parent.object?this.$bar.find(".noty_bar").append(c):this.$bar.append(c);var d=this;a.each(this.options.buttons,function(b,c){var e=a("<button/>").addClass(c.addClass?c.addClass:"gray").html(c.text).attr("id",c.id?c.id:"button-"+b).attr("title",c.title).appendTo(d.$bar.find(".noty_buttons")).on("click",function(b){a.isFunction(c.onClick)&&c.onClick.call(e,d,b)})})}this.$message=this.$bar.find(".noty_message"),this.$closeButton=this.$bar.find(".noty_close"),this.$buttons=this.$bar.find(".noty_buttons"),a.noty.store[this.options.id]=this},show:function(){var b=this;return b.options.custom?b.options.custom.find(b.options.layout.container.selector).append(b.$bar):a(b.options.layout.container.selector).append(b.$bar),b.options.theme&&b.options.theme.style&&b.options.theme.style.apply(b),"function"===a.type(b.options.layout.css)?this.options.layout.css.apply(b.$bar):b.$bar.css(this.options.layout.css||{}),b.$bar.addClass(b.options.layout.addClass),b.options.layout.container.style.apply(a(b.options.layout.container.selector),[b.options.within]),b.showing=!0,b.options.theme&&b.options.theme.style&&b.options.theme.callback.onShow.apply(this),a.inArray("click",b.options.closeWith)>-1&&b.$bar.css("cursor","pointer").one("click",function(a){b.stopPropagation(a),b.options.callback.onCloseClick&&b.options.callback.onCloseClick.apply(b),b.close()}),a.inArray("hover",b.options.closeWith)>-1&&b.$bar.one("mouseenter",function(){b.close()}),a.inArray("button",b.options.closeWith)>-1&&b.$closeButton.one("click",function(a){b.stopPropagation(a),b.close()}),-1==a.inArray("button",b.options.closeWith)&&b.$closeButton.remove(),b.options.callback.onShow&&b.options.callback.onShow.apply(b),"string"==typeof b.options.animation.open?(b.$bar.css("height",b.$bar.innerHeight()),b.$bar.on("click",function(a){b.wasClicked=!0}),b.$bar.show().addClass(b.options.animation.open).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",function(){b.options.callback.afterShow&&b.options.callback.afterShow.apply(b),b.showing=!1,b.shown=!0,b.hasOwnProperty("wasClicked")&&(b.$bar.off("click",function(a){b.wasClicked=!0}),b.close())})):b.$bar.animate(b.options.animation.open,b.options.animation.speed,b.options.animation.easing,function(){b.options.callback.afterShow&&b.options.callback.afterShow.apply(b),b.showing=!1,b.shown=!0}),b.options.timeout&&b.$bar.delay(b.options.timeout).promise().done(function(){b.close()}),this},close:function(){if(!(this.closed||this.$bar&&this.$bar.hasClass("i-am-closing-now"))){var b=this;if(this.showing)return void b.$bar.queue(function(){b.close.apply(b)});if(!this.shown&&!this.showing){var c=[];return a.each(a.noty.queue,function(a,d){d.options.id!=b.options.id&&c.push(d)}),void(a.noty.queue=c)}b.$bar.addClass("i-am-closing-now"),b.options.callback.onClose&&b.options.callback.onClose.apply(b),"string"==typeof b.options.animation.close?b.$bar.addClass(b.options.animation.close).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",function(){b.options.callback.afterClose&&b.options.callback.afterClose.apply(b),b.closeCleanUp()}):b.$bar.clearQueue().stop().animate(b.options.animation.close,b.options.animation.speed,b.options.animation.easing,function(){b.options.callback.afterClose&&b.options.callback.afterClose.apply(b)}).promise().done(function(){b.closeCleanUp()})}},closeCleanUp:function(){var b=this;b.options.modal&&(a.notyRenderer.setModalCount(-1),0==a.notyRenderer.getModalCount()&&a(".noty_modal").fadeOut(b.options.animation.fadeSpeed,function(){a(this).remove()})),a.notyRenderer.setLayoutCountFor(b,-1),0==a.notyRenderer.getLayoutCountFor(b)&&a(b.options.layout.container.selector).remove(),"undefined"!=typeof b.$bar&&null!==b.$bar&&("string"==typeof b.options.animation.close?(b.$bar.css("transition","all 100ms ease").css("border",0).css("margin",0).height(0),b.$bar.one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd",function(){b.$bar.remove(),b.$bar=null,b.closed=!0,b.options.theme.callback&&b.options.theme.callback.onClose&&b.options.theme.callback.onClose.apply(b)})):(b.$bar.remove(),b.$bar=null,b.closed=!0)),delete a.noty.store[b.options.id],b.options.theme.callback&&b.options.theme.callback.onClose&&b.options.theme.callback.onClose.apply(b),b.options.dismissQueue||(a.noty.ontap=!0,a.notyRenderer.render()),b.options.maxVisible>0&&b.options.dismissQueue&&a.notyRenderer.render()},setText:function(a){return this.closed||(this.options.text=a,this.$bar.find(".noty_text").html(a)),this},setType:function(a){return this.closed||(this.options.type=a,this.options.theme.style.apply(this),this.options.theme.callback.onShow.apply(this)),this},setTimeout:function(a){if(!this.closed){var b=this;this.options.timeout=a,b.$bar.delay(b.options.timeout).promise().done(function(){b.close()})}return this},stopPropagation:function(a){a=a||window.event,"undefined"!=typeof a.stopPropagation?a.stopPropagation():a.cancelBubble=!0},closed:!1,showing:!1,shown:!1};a.notyRenderer={},a.notyRenderer.init=function(c){var d=Object.create(b).init(c);return d.options.killer&&a.noty.closeAll(),d.options.force?a.noty.queue.unshift(d):a.noty.queue.push(d),a.notyRenderer.render(),"object"==a.noty.returns?d:d.options.id},a.notyRenderer.render=function(){var b=a.noty.queue[0];"object"===a.type(b)?b.options.dismissQueue?b.options.maxVisible>0?a(b.options.layout.container.selector+" > li").length<b.options.maxVisible&&a.notyRenderer.show(a.noty.queue.shift()):a.notyRenderer.show(a.noty.queue.shift()):a.noty.ontap&&(a.notyRenderer.show(a.noty.queue.shift()),a.noty.ontap=!1):a.noty.ontap=!0},a.notyRenderer.show=function(b){b.options.modal&&(a.notyRenderer.createModalFor(b),a.notyRenderer.setModalCount(1)),b.options.custom?0==b.options.custom.find(b.options.layout.container.selector).length?b.options.custom.append(a(b.options.layout.container.object).addClass("i-am-new")):b.options.custom.find(b.options.layout.container.selector).removeClass("i-am-new"):0==a(b.options.layout.container.selector).length?a("body").append(a(b.options.layout.container.object).addClass("i-am-new")):a(b.options.layout.container.selector).removeClass("i-am-new"),a.notyRenderer.setLayoutCountFor(b,1),b.show()},a.notyRenderer.createModalFor=function(b){if(0==a(".noty_modal").length){var c=a("<div/>").addClass("noty_modal").addClass(b.options.theme).data("noty_modal_count",0);b.options.theme.modal&&b.options.theme.modal.css&&c.css(b.options.theme.modal.css),c.prependTo(a("body")).fadeIn(b.options.animation.fadeSpeed),a.inArray("backdrop",b.options.closeWith)>-1&&c.on("click",function(b){a.noty.closeAll()})}},a.notyRenderer.getLayoutCountFor=function(b){return a(b.options.layout.container.selector).data("noty_layout_count")||0},a.notyRenderer.setLayoutCountFor=function(b,c){return a(b.options.layout.container.selector).data("noty_layout_count",a.notyRenderer.getLayoutCountFor(b)+c)},a.notyRenderer.getModalCount=function(){return a(".noty_modal").data("noty_modal_count")||0},a.notyRenderer.setModalCount=function(b){return a(".noty_modal").data("noty_modal_count",a.notyRenderer.getModalCount()+b)},a.fn.noty=function(b){return b.custom=a(this),a.notyRenderer.init(b)},a.noty={},a.noty.queue=[],a.noty.ontap=!0,a.noty.layouts={},a.noty.themes={},a.noty.returns="object",a.noty.store={},a.noty.get=function(b){return a.noty.store.hasOwnProperty(b)?a.noty.store[b]:!1},a.noty.close=function(b){return a.noty.get(b)?a.noty.get(b).close():!1},a.noty.setText=function(b,c){return a.noty.get(b)?a.noty.get(b).setText(c):!1},a.noty.setType=function(b,c){return a.noty.get(b)?a.noty.get(b).setType(c):!1},a.noty.clearQueue=function(){a.noty.queue=[]},a.noty.closeAll=function(){a.noty.clearQueue(),a.each(a.noty.store,function(a,b){b.close()})};var c=window.alert;return a.noty.consumeAlert=function(b){window.alert=function(c){b?b.text=c:b={text:c},a.notyRenderer.init(b)}},a.noty.stopConsumeAlert=function(){window.alert=c},a.noty.defaults={layout:"top",theme:"defaultTheme",type:"alert",text:"",dismissQueue:!0,template:'<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>',animation:{open:{height:"toggle"},close:{height:"toggle"},easing:"swing",speed:500,fadeSpeed:"fast"},timeout:!1,force:!1,modal:!1,maxVisible:5,killer:!1,closeWith:["click"],callback:{onShow:function(){},afterShow:function(){},onClose:function(){},afterClose:function(){},onCloseClick:function(){}},buttons:!1},a(window).on("resize",function(){a.each(a.noty.layouts,function(b,c){c.container.style.apply(a(c.container.selector))})}),window.noty=function(b){return a.notyRenderer.init(b)},a.noty.layouts.bottom={name:"bottom",options:{},container:{object:'<ul id="noty_bottom_layout_container" />',selector:"ul#noty_bottom_layout_container",style:function(){a(this).css({bottom:0,left:"5%",position:"fixed",width:"90%",height:"auto",margin:0,padding:0,listStyleType:"none",zIndex:9999999})}},parent:{object:"<li />",selector:"li",css:{}},css:{display:"none"},addClass:""},a.noty.layouts.bottomCenter={name:"bottomCenter",options:{},container:{object:'<ul id="noty_bottomCenter_layout_container" />',selector:"ul#noty_bottomCenter_layout_container",style:function(){a(this).css({bottom:20,left:0,position:"fixed",width:"310px",height:"auto",margin:0,padding:0,listStyleType:"none",zIndex:1e7}),a(this).css({left:(a(window).width()-a(this).outerWidth(!1))/2+"px"})}},parent:{object:"<li />",selector:"li",css:{}},css:{display:"none",width:"310px"},addClass:""},a.noty.layouts.bottomLeft={name:"bottomLeft",options:{},container:{object:'<ul id="noty_bottomLeft_layout_container" />',selector:"ul#noty_bottomLeft_layout_container",style:function(){a(this).css({bottom:20,left:20,position:"fixed",width:"310px",height:"auto",margin:0,padding:0,listStyleType:"none",zIndex:1e7}),window.innerWidth<600&&a(this).css({left:5})}},parent:{object:"<li />",selector:"li",css:{}},css:{display:"none",width:"310px"},addClass:""},a.noty.layouts.bottomRight={name:"bottomRight",options:{},container:{object:'<ul id="noty_bottomRight_layout_container" />',selector:"ul#noty_bottomRight_layout_container",style:function(){a(this).css({bottom:20,right:20,position:"fixed",width:"310px",height:"auto",margin:0,padding:0,listStyleType:"none",zIndex:1e7}),window.innerWidth<600&&a(this).css({right:5})}},parent:{object:"<li />",selector:"li",css:{}},css:{display:"none",width:"310px"},addClass:""},a.noty.layouts.center={name:"center",options:{},container:{object:'<ul id="noty_center_layout_container" />',selector:"ul#noty_center_layout_container",style:function(){a(this).css({position:"fixed",width:"310px",height:"auto",margin:0,padding:0,listStyleType:"none",zIndex:1e7});var b=a(this).clone().css({visibility:"hidden",display:"block",position:"absolute",top:0,left:0}).attr("id","dupe");a("body").append(b),b.find(".i-am-closing-now").remove(),b.find("li").css("display","block");var c=b.height();b.remove(),a(this).hasClass("i-am-new")?a(this).css({left:(a(window).width()-a(this).outerWidth(!1))/2+"px",top:(a(window).height()-c)/2+"px"}):a(this).animate({left:(a(window).width()-a(this).outerWidth(!1))/2+"px",top:(a(window).height()-c)/2+"px"},500)}},parent:{object:"<li />",selector:"li",css:{}},css:{display:"none",width:"310px"},addClass:""},a.noty.layouts.centerLeft={name:"centerLeft",options:{},container:{object:'<ul id="noty_centerLeft_layout_container" />',selector:"ul#noty_centerLeft_layout_container",style:function(){a(this).css({left:20,position:"fixed",width:"310px",height:"auto",margin:0,padding:0,listStyleType:"none",zIndex:1e7});var b=a(this).clone().css({visibility:"hidden",display:"block",position:"absolute",top:0,left:0}).attr("id","dupe");a("body").append(b),b.find(".i-am-closing-now").remove(),b.find("li").css("display","block");var c=b.height();b.remove(),a(this).hasClass("i-am-new")?a(this).css({top:(a(window).height()-c)/2+"px"}):a(this).animate({top:(a(window).height()-c)/2+"px"},500),window.innerWidth<600&&a(this).css({left:5})}},parent:{object:"<li />",selector:"li",css:{}},css:{display:"none",width:"310px"},addClass:""},a.noty.layouts.centerRight={name:"centerRight",options:{},container:{object:'<ul id="noty_centerRight_layout_container" />',selector:"ul#noty_centerRight_layout_container",style:function(){a(this).css({right:20,position:"fixed",width:"310px",height:"auto",margin:0,padding:0,listStyleType:"none",zIndex:1e7});var b=a(this).clone().css({visibility:"hidden",display:"block",position:"absolute",top:0,left:0}).attr("id","dupe");a("body").append(b),b.find(".i-am-closing-now").remove(),b.find("li").css("display","block");var c=b.height();b.remove(),a(this).hasClass("i-am-new")?a(this).css({top:(a(window).height()-c)/2+"px"}):a(this).animate({top:(a(window).height()-c)/2+"px"},500),window.innerWidth<600&&a(this).css({right:5})}},parent:{object:"<li />",selector:"li",css:{}},css:{display:"none",width:"310px"},addClass:""},a.noty.layouts.inline={name:"inline",options:{},container:{object:'<ul class="noty_inline_layout_container" />',selector:"ul.noty_inline_layout_container",style:function(){a(this).css({width:"100%",height:"auto",margin:0,padding:0,listStyleType:"none",zIndex:9999999})}},parent:{object:"<li />",selector:"li",css:{}},css:{display:"none"},addClass:""},a.noty.layouts.top={name:"top",options:{},container:{object:'<ul id="noty_top_layout_container" />',selector:"ul#noty_top_layout_container",style:function(){a(this).css({top:0,left:"5%",position:"fixed",width:"90%",height:"auto",margin:0,padding:0,listStyleType:"none",zIndex:9999999})}},parent:{object:"<li />",selector:"li",css:{}},css:{display:"none"},addClass:""},a.noty.layouts.topCenter={name:"topCenter",options:{},container:{object:'<ul id="noty_topCenter_layout_container" />',selector:"ul#noty_topCenter_layout_container",style:function(){a(this).css({top:20,left:0,position:"fixed",width:"310px",height:"auto",margin:0,padding:0,listStyleType:"none",zIndex:1e7}),a(this).css({left:(a(window).width()-a(this).outerWidth(!1))/2+"px"})}},parent:{object:"<li />",selector:"li",css:{}},css:{display:"none",width:"310px"},addClass:""},a.noty.layouts.topLeft={name:"topLeft",options:{},container:{object:'<ul id="noty_topLeft_layout_container" />',selector:"ul#noty_topLeft_layout_container",style:function(){a(this).css({top:20,left:20,position:"fixed",width:"310px",height:"auto",margin:0,padding:0,listStyleType:"none",zIndex:1e7}),window.innerWidth<600&&a(this).css({left:5})}},parent:{object:"<li />",selector:"li",css:{}},css:{display:"none",width:"310px"},addClass:""},a.noty.layouts.topRight={name:"topRight",options:{},container:{object:'<ul id="noty_topRight_layout_container" />',selector:"ul#noty_topRight_layout_container",style:function(){a(this).css({top:20,right:20,position:"fixed",width:"310px",height:"auto",margin:0,padding:0,listStyleType:"none",zIndex:1e7}),window.innerWidth<600&&a(this).css({right:5})}},parent:{object:"<li />",selector:"li",css:{}},css:{display:"none",width:"310px"},addClass:""},a.noty.themes.bootstrapTheme={name:"bootstrapTheme",modal:{css:{position:"fixed",width:"100%",height:"100%",backgroundColor:"#000",zIndex:1e4,opacity:.6,display:"none",left:0,top:0}},style:function(){var b=this.options.layout.container.selector;switch(a(b).addClass("list-group"),this.$closeButton.append('<span aria-hidden="true">&times;</span><span class="sr-only">Close</span>'),this.$closeButton.addClass("close"),this.$bar.addClass("list-group-item").css("padding","0px"),this.options.type){case"alert":case"notification":this.$bar.addClass("list-group-item-info");break;case"warning":this.$bar.addClass("list-group-item-warning");break;case"error":this.$bar.addClass("list-group-item-danger");break;case"information":this.$bar.addClass("list-group-item-info");break;case"success":this.$bar.addClass("list-group-item-success")}this.$message.css({fontSize:"13px",lineHeight:"16px",textAlign:"center",padding:"8px 10px 9px",width:"auto",position:"relative"})},callback:{onShow:function(){},onClose:function(){}}},a.noty.themes.defaultTheme={name:"defaultTheme",helpers:{borderFix:function(){if(this.options.dismissQueue){var b=this.options.layout.container.selector+" "+this.options.layout.parent.selector;switch(this.options.layout.name){case"top":a(b).css({borderRadius:"0px 0px 0px 0px"}),a(b).last().css({borderRadius:"0px 0px 5px 5px"});break;case"topCenter":case"topLeft":case"topRight":case"bottomCenter":case"bottomLeft":case"bottomRight":case"center":case"centerLeft":case"centerRight":case"inline":a(b).css({borderRadius:"0px 0px 0px 0px"}),a(b).first().css({"border-top-left-radius":"5px","border-top-right-radius":"5px"}),a(b).last().css({"border-bottom-left-radius":"5px","border-bottom-right-radius":"5px"});break;case"bottom":a(b).css({borderRadius:"0px 0px 0px 0px"}),a(b).first().css({borderRadius:"5px 5px 0px 0px"})}}}},modal:{css:{position:"fixed",width:"100%",height:"100%",backgroundColor:"#000",zIndex:1e4,opacity:.6,display:"none",left:0,top:0}},style:function(){switch(this.$bar.css({overflow:"hidden",background:"url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAoCAQAAAClM0ndAAAAhklEQVR4AdXO0QrCMBBE0bttkk38/w8WRERpdyjzVOc+HxhIHqJGMQcFFkpYRQotLLSw0IJ5aBdovruMYDA/kT8plF9ZKLFQcgF18hDj1SbQOMlCA4kao0iiXmah7qBWPdxpohsgVZyj7e5I9KcID+EhiDI5gxBYKLBQYKHAQoGFAoEks/YEGHYKB7hFxf0AAAAASUVORK5CYII=') repeat-x scroll left top #fff"}),this.$message.css({fontSize:"13px",lineHeight:"16px",textAlign:"center",padding:"8px 10px 9px",width:"auto",position:"relative"}),this.$closeButton.css({position:"absolute",top:4,right:4,width:10,height:10,background:"url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAQAAAAnOwc2AAAAxUlEQVR4AR3MPUoDURSA0e++uSkkOxC3IAOWNtaCIDaChfgXBMEZbQRByxCwk+BasgQRZLSYoLgDQbARxry8nyumPcVRKDfd0Aa8AsgDv1zp6pYd5jWOwhvebRTbzNNEw5BSsIpsj/kurQBnmk7sIFcCF5yyZPDRG6trQhujXYosaFoc+2f1MJ89uc76IND6F9BvlXUdpb6xwD2+4q3me3bysiHvtLYrUJto7PD/ve7LNHxSg/woN2kSz4txasBdhyiz3ugPGetTjm3XRokAAAAASUVORK5CYII=)",display:"none",cursor:"pointer"}),this.$buttons.css({padding:5,textAlign:"right",borderTop:"1px solid #ccc",backgroundColor:"#fff"}),this.$buttons.find("button").css({marginLeft:5}),this.$buttons.find("button:first").css({marginLeft:0}),this.$bar.on({mouseenter:function(){a(this).find(".noty_close").stop().fadeTo("normal",1)},mouseleave:function(){a(this).find(".noty_close").stop().fadeTo("normal",0)}}),this.options.layout.name){case"top":this.$bar.css({borderRadius:"0px 0px 5px 5px",borderBottom:"2px solid #eee",borderLeft:"2px solid #eee",borderRight:"2px solid #eee",boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)"});break;case"topCenter":case"center":case"bottomCenter":case"inline":this.$bar.css({borderRadius:"5px",border:"1px solid #eee",boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)"}),this.$message.css({fontSize:"13px",textAlign:"center"});break;case"topLeft":case"topRight":case"bottomLeft":case"bottomRight":case"centerLeft":case"centerRight":this.$bar.css({borderRadius:"5px",border:"1px solid #eee",boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)"}),this.$message.css({fontSize:"13px",textAlign:"left"});break;case"bottom":this.$bar.css({borderRadius:"5px 5px 0px 0px",borderTop:"2px solid #eee",borderLeft:"2px solid #eee",borderRight:"2px solid #eee",boxShadow:"0 -2px 4px rgba(0, 0, 0, 0.1)"});break;default:this.$bar.css({border:"2px solid #eee",boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)"})}switch(this.options.type){case"alert":case"notification":this.$bar.css({backgroundColor:"#FFF",borderColor:"#CCC",color:"#444"});break;case"warning":this.$bar.css({backgroundColor:"#FFEAA8",borderColor:"#FFC237",color:"#826200"}),this.$buttons.css({borderTop:"1px solid #FFC237"});break;case"error":this.$bar.css({backgroundColor:"red",borderColor:"darkred",color:"#FFF"}),this.$message.css({fontWeight:"bold"}),this.$buttons.css({borderTop:"1px solid darkred"});break;case"information":this.$bar.css({backgroundColor:"#57B7E2",borderColor:"#0B90C4",color:"#FFF"}),this.$buttons.css({borderTop:"1px solid #0B90C4"});break;case"success":this.$bar.css({backgroundColor:"lightgreen",borderColor:"#50C24E",color:"darkgreen"}),this.$buttons.css({borderTop:"1px solid #50C24E"});break;default:this.$bar.css({backgroundColor:"#FFF",borderColor:"#CCC",color:"#444"})}},callback:{onShow:function(){a.noty.themes.defaultTheme.helpers.borderFix.apply(this)},onClose:function(){a.noty.themes.defaultTheme.helpers.borderFix.apply(this)}}},a.noty.themes.relax={name:"relax",helpers:{},modal:{css:{position:"fixed",width:"100%",height:"100%",backgroundColor:"#000",zIndex:1e4,opacity:.6,display:"none",left:0,top:0}},style:function(){switch(this.$bar.css({overflow:"hidden",margin:"4px 0",borderRadius:"2px"}),this.$message.css({fontSize:"14px",lineHeight:"16px",textAlign:"center",padding:"10px",width:"auto",position:"relative"}),this.$closeButton.css({position:"absolute",top:4,right:4,width:10,height:10,background:"url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAQAAAAnOwc2AAAAxUlEQVR4AR3MPUoDURSA0e++uSkkOxC3IAOWNtaCIDaChfgXBMEZbQRByxCwk+BasgQRZLSYoLgDQbARxry8nyumPcVRKDfd0Aa8AsgDv1zp6pYd5jWOwhvebRTbzNNEw5BSsIpsj/kurQBnmk7sIFcCF5yyZPDRG6trQhujXYosaFoc+2f1MJ89uc76IND6F9BvlXUdpb6xwD2+4q3me3bysiHvtLYrUJto7PD/ve7LNHxSg/woN2kSz4txasBdhyiz3ugPGetTjm3XRokAAAAASUVORK5CYII=)",display:"none",cursor:"pointer"}),this.$buttons.css({padding:5,textAlign:"right",borderTop:"1px solid #ccc",backgroundColor:"#fff"}),this.$buttons.find("button").css({marginLeft:5}),this.$buttons.find("button:first").css({marginLeft:0}),this.$bar.on({mouseenter:function(){a(this).find(".noty_close").stop().fadeTo("normal",1)},mouseleave:function(){a(this).find(".noty_close").stop().fadeTo("normal",0)}}),this.options.layout.name){case"top":this.$bar.css({borderBottom:"2px solid #eee",borderLeft:"2px solid #eee",borderRight:"2px solid #eee",borderTop:"2px solid #eee",boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)"});break;case"topCenter":case"center":case"bottomCenter":case"inline":this.$bar.css({border:"1px solid #eee",boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)"}),this.$message.css({fontSize:"13px",textAlign:"center"});break;case"topLeft":case"topRight":case"bottomLeft":case"bottomRight":case"centerLeft":case"centerRight":this.$bar.css({border:"1px solid #eee",boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)"}),this.$message.css({fontSize:"13px",textAlign:"left"});break;case"bottom":this.$bar.css({borderTop:"2px solid #eee",borderLeft:"2px solid #eee",borderRight:"2px solid #eee",borderBottom:"2px solid #eee",boxShadow:"0 -2px 4px rgba(0, 0, 0, 0.1)"});break;default:this.$bar.css({border:"2px solid #eee",boxShadow:"0 2px 4px rgba(0, 0, 0, 0.1)"})}switch(this.options.type){case"alert":case"notification":this.$bar.css({backgroundColor:"#FFF",borderColor:"#dedede",color:"#444"});break;case"warning":this.$bar.css({backgroundColor:"#FFEAA8",borderColor:"#FFC237",color:"#826200"}),this.$buttons.css({borderTop:"1px solid #FFC237"});break;case"error":this.$bar.css({backgroundColor:"#FF8181",borderColor:"#e25353",color:"#FFF"}),this.$message.css({fontWeight:"bold"}),this.$buttons.css({borderTop:"1px solid darkred"});break;case"information":this.$bar.css({backgroundColor:"#78C5E7",borderColor:"#3badd6",color:"#FFF"}),this.$buttons.css({borderTop:"1px solid #0B90C4"});break;case"success":this.$bar.css({backgroundColor:"#BCF5BC",borderColor:"#7cdd77",color:"darkgreen"}),this.$buttons.css({borderTop:"1px solid #50C24E"});break;default:this.$bar.css({backgroundColor:"#FFF",borderColor:"#CCC",color:"#444"})}},callback:{onShow:function(){},onClose:function(){}}},window.noty});
jQuery(document).ready(function(){
	//cache DOM elements
	var mainContent = $('.cd-main-content'),
		header = $('.cd-main-header'),
		sidebar = $('.cd-side-nav'),
		sidebarTrigger = $('.cd-nav-trigger'),
		topNavigation = $('.cd-top-nav'),
		searchForm = $('.cd-search'),
		accountInfo = $('.account');

	//on resize, move search and top nav position according to window width
	var resizing = false;
	moveNavigation();
	$(window).on('resize', function(){
		if( !resizing ) {
			(!window.requestAnimationFrame) ? setTimeout(moveNavigation, 300) : window.requestAnimationFrame(moveNavigation);
			resizing = true;
		}
	});

	//on window scrolling - fix sidebar nav
	var scrolling = false;
	checkScrollbarPosition();
	$(window).on('scroll', function(){
		if( !scrolling ) {
			(!window.requestAnimationFrame) ? setTimeout(checkScrollbarPosition, 300) : window.requestAnimationFrame(checkScrollbarPosition);
			scrolling = true;
		}
	});

	//mobile only - open sidebar when user clicks the hamburger menu
	sidebarTrigger.on('click', function(event){
		event.preventDefault();
		$([sidebar, sidebarTrigger]).toggleClass('nav-is-visible');
	});

	//click on item and show submenu
	$('.has-children > a').on('click', function(event){
		var mq = checkMQ(),
			selectedItem = $(this);
		if( mq == 'mobile' || mq == 'tablet' ) {
			event.preventDefault();
			if( selectedItem.parent('li').hasClass('selected')) {
				selectedItem.parent('li').removeClass('selected');
			} else {
				sidebar.find('.has-children.selected').removeClass('selected');
				accountInfo.removeClass('selected');
				selectedItem.parent('li').addClass('selected');
			}
		}
	});

	//click on account and show submenu - desktop version only
	accountInfo.children('a').on('click', function(event){
		var mq = checkMQ(),
			selectedItem = $(this);
		if( mq == 'desktop') {
			event.preventDefault();
			accountInfo.toggleClass('selected');
			sidebar.find('.has-children.selected').removeClass('selected');
		}
	});

	$(document).on('click', function(event){
		if( !$(event.target).is('.has-children a') ) {
			sidebar.find('.has-children.selected').removeClass('selected');
			accountInfo.removeClass('selected');
		}
	});

	//on desktop - differentiate between a user trying to hover over a dropdown item vs trying to navigate into a submenu's contents
	sidebar.children('ul').menuAim({
        activate: function(row) {
        	$(row).addClass('hover');
        },
        deactivate: function(row) {
        	$(row).removeClass('hover');
        },
        exitMenu: function() {
        	sidebar.find('.hover').removeClass('hover');
        	return true;
        },
        submenuSelector: ".has-children",
    });

	function checkMQ() {
		//check if mobile or desktop device
		return window.getComputedStyle(document.querySelector('.cd-main-content'), '::before').getPropertyValue('content').replace(/'/g, "").replace(/"/g, "");
	}

	function moveNavigation(){
  		var mq = checkMQ();
        
        if ( mq == 'mobile' && topNavigation.parents('.cd-side-nav').length == 0 ) {
        	detachElements();
			topNavigation.appendTo(sidebar);
			searchForm.removeClass('is-hidden').prependTo(sidebar);
		} else if ( ( mq == 'tablet' || mq == 'desktop') &&  topNavigation.parents('.cd-side-nav').length > 0 ) {
			detachElements();
			searchForm.insertAfter(header.find('.cd-logo'));
			topNavigation.appendTo(header.find('.cd-nav'));
		}
		checkSelected(mq);
		resizing = false;
	}

	function detachElements() {
		topNavigation.detach();
		searchForm.detach();
	}

	function checkSelected(mq) {
		//on desktop, remove selected class from items selected on mobile/tablet version
		if( mq == 'desktop' ) $('.has-children.selected').removeClass('selected');
	}

	function checkScrollbarPosition() {
		var mq = checkMQ();
		
		if( mq != 'mobile' ) {
			var sidebarHeight = sidebar.outerHeight(),
				windowHeight = $(window).height(),
				mainContentHeight = mainContent.outerHeight(),
				scrollTop = $(window).scrollTop();

			( ( scrollTop + windowHeight > sidebarHeight ) && ( mainContentHeight - sidebarHeight != 0 ) ) ? sidebar.addClass('is-fixed').css('bottom', 0) : sidebar.removeClass('is-fixed').attr('style', '');
		}
		scrolling = false;
	}
});
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

/*! Select2 4.0.3 | https://github.com/select2/select2/blob/master/LICENSE.md */!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):a("object"==typeof exports?require("jquery"):jQuery)}(function(a){var b=function(){if(a&&a.fn&&a.fn.select2&&a.fn.select2.amd)var b=a.fn.select2.amd;var b;return function(){if(!b||!b.requirejs){b?c=b:b={};var a,c,d;!function(b){function e(a,b){return u.call(a,b)}function f(a,b){var c,d,e,f,g,h,i,j,k,l,m,n=b&&b.split("/"),o=s.map,p=o&&o["*"]||{};if(a&&"."===a.charAt(0))if(b){for(a=a.split("/"),g=a.length-1,s.nodeIdCompat&&w.test(a[g])&&(a[g]=a[g].replace(w,"")),a=n.slice(0,n.length-1).concat(a),k=0;k<a.length;k+=1)if(m=a[k],"."===m)a.splice(k,1),k-=1;else if(".."===m){if(1===k&&(".."===a[2]||".."===a[0]))break;k>0&&(a.splice(k-1,2),k-=2)}a=a.join("/")}else 0===a.indexOf("./")&&(a=a.substring(2));if((n||p)&&o){for(c=a.split("/"),k=c.length;k>0;k-=1){if(d=c.slice(0,k).join("/"),n)for(l=n.length;l>0;l-=1)if(e=o[n.slice(0,l).join("/")],e&&(e=e[d])){f=e,h=k;break}if(f)break;!i&&p&&p[d]&&(i=p[d],j=k)}!f&&i&&(f=i,h=j),f&&(c.splice(0,h,f),a=c.join("/"))}return a}function g(a,c){return function(){var d=v.call(arguments,0);return"string"!=typeof d[0]&&1===d.length&&d.push(null),n.apply(b,d.concat([a,c]))}}function h(a){return function(b){return f(b,a)}}function i(a){return function(b){q[a]=b}}function j(a){if(e(r,a)){var c=r[a];delete r[a],t[a]=!0,m.apply(b,c)}if(!e(q,a)&&!e(t,a))throw new Error("No "+a);return q[a]}function k(a){var b,c=a?a.indexOf("!"):-1;return c>-1&&(b=a.substring(0,c),a=a.substring(c+1,a.length)),[b,a]}function l(a){return function(){return s&&s.config&&s.config[a]||{}}}var m,n,o,p,q={},r={},s={},t={},u=Object.prototype.hasOwnProperty,v=[].slice,w=/\.js$/;o=function(a,b){var c,d=k(a),e=d[0];return a=d[1],e&&(e=f(e,b),c=j(e)),e?a=c&&c.normalize?c.normalize(a,h(b)):f(a,b):(a=f(a,b),d=k(a),e=d[0],a=d[1],e&&(c=j(e))),{f:e?e+"!"+a:a,n:a,pr:e,p:c}},p={require:function(a){return g(a)},exports:function(a){var b=q[a];return"undefined"!=typeof b?b:q[a]={}},module:function(a){return{id:a,uri:"",exports:q[a],config:l(a)}}},m=function(a,c,d,f){var h,k,l,m,n,s,u=[],v=typeof d;if(f=f||a,"undefined"===v||"function"===v){for(c=!c.length&&d.length?["require","exports","module"]:c,n=0;n<c.length;n+=1)if(m=o(c[n],f),k=m.f,"require"===k)u[n]=p.require(a);else if("exports"===k)u[n]=p.exports(a),s=!0;else if("module"===k)h=u[n]=p.module(a);else if(e(q,k)||e(r,k)||e(t,k))u[n]=j(k);else{if(!m.p)throw new Error(a+" missing "+k);m.p.load(m.n,g(f,!0),i(k),{}),u[n]=q[k]}l=d?d.apply(q[a],u):void 0,a&&(h&&h.exports!==b&&h.exports!==q[a]?q[a]=h.exports:l===b&&s||(q[a]=l))}else a&&(q[a]=d)},a=c=n=function(a,c,d,e,f){if("string"==typeof a)return p[a]?p[a](c):j(o(a,c).f);if(!a.splice){if(s=a,s.deps&&n(s.deps,s.callback),!c)return;c.splice?(a=c,c=d,d=null):a=b}return c=c||function(){},"function"==typeof d&&(d=e,e=f),e?m(b,a,c,d):setTimeout(function(){m(b,a,c,d)},4),n},n.config=function(a){return n(a)},a._defined=q,d=function(a,b,c){if("string"!=typeof a)throw new Error("See almond README: incorrect module build, no module name");b.splice||(c=b,b=[]),e(q,a)||e(r,a)||(r[a]=[a,b,c])},d.amd={jQuery:!0}}(),b.requirejs=a,b.require=c,b.define=d}}(),b.define("almond",function(){}),b.define("jquery",[],function(){var b=a||$;return null==b&&console&&console.error&&console.error("Select2: An instance of jQuery or a jQuery-compatible library was not found. Make sure that you are including jQuery before Select2 on your web page."),b}),b.define("select2/utils",["jquery"],function(a){function b(a){var b=a.prototype,c=[];for(var d in b){var e=b[d];"function"==typeof e&&"constructor"!==d&&c.push(d)}return c}var c={};c.Extend=function(a,b){function c(){this.constructor=a}var d={}.hasOwnProperty;for(var e in b)d.call(b,e)&&(a[e]=b[e]);return c.prototype=b.prototype,a.prototype=new c,a.__super__=b.prototype,a},c.Decorate=function(a,c){function d(){var b=Array.prototype.unshift,d=c.prototype.constructor.length,e=a.prototype.constructor;d>0&&(b.call(arguments,a.prototype.constructor),e=c.prototype.constructor),e.apply(this,arguments)}function e(){this.constructor=d}var f=b(c),g=b(a);c.displayName=a.displayName,d.prototype=new e;for(var h=0;h<g.length;h++){var i=g[h];d.prototype[i]=a.prototype[i]}for(var j=(function(a){var b=function(){};a in d.prototype&&(b=d.prototype[a]);var e=c.prototype[a];return function(){var a=Array.prototype.unshift;return a.call(arguments,b),e.apply(this,arguments)}}),k=0;k<f.length;k++){var l=f[k];d.prototype[l]=j(l)}return d};var d=function(){this.listeners={}};return d.prototype.on=function(a,b){this.listeners=this.listeners||{},a in this.listeners?this.listeners[a].push(b):this.listeners[a]=[b]},d.prototype.trigger=function(a){var b=Array.prototype.slice,c=b.call(arguments,1);this.listeners=this.listeners||{},null==c&&(c=[]),0===c.length&&c.push({}),c[0]._type=a,a in this.listeners&&this.invoke(this.listeners[a],b.call(arguments,1)),"*"in this.listeners&&this.invoke(this.listeners["*"],arguments)},d.prototype.invoke=function(a,b){for(var c=0,d=a.length;d>c;c++)a[c].apply(this,b)},c.Observable=d,c.generateChars=function(a){for(var b="",c=0;a>c;c++){var d=Math.floor(36*Math.random());b+=d.toString(36)}return b},c.bind=function(a,b){return function(){a.apply(b,arguments)}},c._convertData=function(a){for(var b in a){var c=b.split("-"),d=a;if(1!==c.length){for(var e=0;e<c.length;e++){var f=c[e];f=f.substring(0,1).toLowerCase()+f.substring(1),f in d||(d[f]={}),e==c.length-1&&(d[f]=a[b]),d=d[f]}delete a[b]}}return a},c.hasScroll=function(b,c){var d=a(c),e=c.style.overflowX,f=c.style.overflowY;return e!==f||"hidden"!==f&&"visible"!==f?"scroll"===e||"scroll"===f?!0:d.innerHeight()<c.scrollHeight||d.innerWidth()<c.scrollWidth:!1},c.escapeMarkup=function(a){var b={"\\":"&#92;","&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#47;"};return"string"!=typeof a?a:String(a).replace(/[&<>"'\/\\]/g,function(a){return b[a]})},c.appendMany=function(b,c){if("1.7"===a.fn.jquery.substr(0,3)){var d=a();a.map(c,function(a){d=d.add(a)}),c=d}b.append(c)},c}),b.define("select2/results",["jquery","./utils"],function(a,b){function c(a,b,d){this.$element=a,this.data=d,this.options=b,c.__super__.constructor.call(this)}return b.Extend(c,b.Observable),c.prototype.render=function(){var b=a('<ul class="select2-results__options" role="tree"></ul>');return this.options.get("multiple")&&b.attr("aria-multiselectable","true"),this.$results=b,b},c.prototype.clear=function(){this.$results.empty()},c.prototype.displayMessage=function(b){var c=this.options.get("escapeMarkup");this.clear(),this.hideLoading();var d=a('<li role="treeitem" aria-live="assertive" class="select2-results__option"></li>'),e=this.options.get("translations").get(b.message);d.append(c(e(b.args))),d[0].className+=" select2-results__message",this.$results.append(d)},c.prototype.hideMessages=function(){this.$results.find(".select2-results__message").remove()},c.prototype.append=function(a){this.hideLoading();var b=[];if(null==a.results||0===a.results.length)return void(0===this.$results.children().length&&this.trigger("results:message",{message:"noResults"}));a.results=this.sort(a.results);for(var c=0;c<a.results.length;c++){var d=a.results[c],e=this.option(d);b.push(e)}this.$results.append(b)},c.prototype.position=function(a,b){var c=b.find(".select2-results");c.append(a)},c.prototype.sort=function(a){var b=this.options.get("sorter");return b(a)},c.prototype.highlightFirstItem=function(){var a=this.$results.find(".select2-results__option[aria-selected]"),b=a.filter("[aria-selected=true]");b.length>0?b.first().trigger("mouseenter"):a.first().trigger("mouseenter"),this.ensureHighlightVisible()},c.prototype.setClasses=function(){var b=this;this.data.current(function(c){var d=a.map(c,function(a){return a.id.toString()}),e=b.$results.find(".select2-results__option[aria-selected]");e.each(function(){var b=a(this),c=a.data(this,"data"),e=""+c.id;null!=c.element&&c.element.selected||null==c.element&&a.inArray(e,d)>-1?b.attr("aria-selected","true"):b.attr("aria-selected","false")})})},c.prototype.showLoading=function(a){this.hideLoading();var b=this.options.get("translations").get("searching"),c={disabled:!0,loading:!0,text:b(a)},d=this.option(c);d.className+=" loading-results",this.$results.prepend(d)},c.prototype.hideLoading=function(){this.$results.find(".loading-results").remove()},c.prototype.option=function(b){var c=document.createElement("li");c.className="select2-results__option";var d={role:"treeitem","aria-selected":"false"};b.disabled&&(delete d["aria-selected"],d["aria-disabled"]="true"),null==b.id&&delete d["aria-selected"],null!=b._resultId&&(c.id=b._resultId),b.title&&(c.title=b.title),b.children&&(d.role="group",d["aria-label"]=b.text,delete d["aria-selected"]);for(var e in d){var f=d[e];c.setAttribute(e,f)}if(b.children){var g=a(c),h=document.createElement("strong");h.className="select2-results__group";a(h);this.template(b,h);for(var i=[],j=0;j<b.children.length;j++){var k=b.children[j],l=this.option(k);i.push(l)}var m=a("<ul></ul>",{"class":"select2-results__options select2-results__options--nested"});m.append(i),g.append(h),g.append(m)}else this.template(b,c);return a.data(c,"data",b),c},c.prototype.bind=function(b,c){var d=this,e=b.id+"-results";this.$results.attr("id",e),b.on("results:all",function(a){d.clear(),d.append(a.data),b.isOpen()&&(d.setClasses(),d.highlightFirstItem())}),b.on("results:append",function(a){d.append(a.data),b.isOpen()&&d.setClasses()}),b.on("query",function(a){d.hideMessages(),d.showLoading(a)}),b.on("select",function(){b.isOpen()&&(d.setClasses(),d.highlightFirstItem())}),b.on("unselect",function(){b.isOpen()&&(d.setClasses(),d.highlightFirstItem())}),b.on("open",function(){d.$results.attr("aria-expanded","true"),d.$results.attr("aria-hidden","false"),d.setClasses(),d.ensureHighlightVisible()}),b.on("close",function(){d.$results.attr("aria-expanded","false"),d.$results.attr("aria-hidden","true"),d.$results.removeAttr("aria-activedescendant")}),b.on("results:toggle",function(){var a=d.getHighlightedResults();0!==a.length&&a.trigger("mouseup")}),b.on("results:select",function(){var a=d.getHighlightedResults();if(0!==a.length){var b=a.data("data");"true"==a.attr("aria-selected")?d.trigger("close",{}):d.trigger("select",{data:b})}}),b.on("results:previous",function(){var a=d.getHighlightedResults(),b=d.$results.find("[aria-selected]"),c=b.index(a);if(0!==c){var e=c-1;0===a.length&&(e=0);var f=b.eq(e);f.trigger("mouseenter");var g=d.$results.offset().top,h=f.offset().top,i=d.$results.scrollTop()+(h-g);0===e?d.$results.scrollTop(0):0>h-g&&d.$results.scrollTop(i)}}),b.on("results:next",function(){var a=d.getHighlightedResults(),b=d.$results.find("[aria-selected]"),c=b.index(a),e=c+1;if(!(e>=b.length)){var f=b.eq(e);f.trigger("mouseenter");var g=d.$results.offset().top+d.$results.outerHeight(!1),h=f.offset().top+f.outerHeight(!1),i=d.$results.scrollTop()+h-g;0===e?d.$results.scrollTop(0):h>g&&d.$results.scrollTop(i)}}),b.on("results:focus",function(a){a.element.addClass("select2-results__option--highlighted")}),b.on("results:message",function(a){d.displayMessage(a)}),a.fn.mousewheel&&this.$results.on("mousewheel",function(a){var b=d.$results.scrollTop(),c=d.$results.get(0).scrollHeight-b+a.deltaY,e=a.deltaY>0&&b-a.deltaY<=0,f=a.deltaY<0&&c<=d.$results.height();e?(d.$results.scrollTop(0),a.preventDefault(),a.stopPropagation()):f&&(d.$results.scrollTop(d.$results.get(0).scrollHeight-d.$results.height()),a.preventDefault(),a.stopPropagation())}),this.$results.on("mouseup",".select2-results__option[aria-selected]",function(b){var c=a(this),e=c.data("data");return"true"===c.attr("aria-selected")?void(d.options.get("multiple")?d.trigger("unselect",{originalEvent:b,data:e}):d.trigger("close",{})):void d.trigger("select",{originalEvent:b,data:e})}),this.$results.on("mouseenter",".select2-results__option[aria-selected]",function(b){var c=a(this).data("data");d.getHighlightedResults().removeClass("select2-results__option--highlighted"),d.trigger("results:focus",{data:c,element:a(this)})})},c.prototype.getHighlightedResults=function(){var a=this.$results.find(".select2-results__option--highlighted");return a},c.prototype.destroy=function(){this.$results.remove()},c.prototype.ensureHighlightVisible=function(){var a=this.getHighlightedResults();if(0!==a.length){var b=this.$results.find("[aria-selected]"),c=b.index(a),d=this.$results.offset().top,e=a.offset().top,f=this.$results.scrollTop()+(e-d),g=e-d;f-=2*a.outerHeight(!1),2>=c?this.$results.scrollTop(0):(g>this.$results.outerHeight()||0>g)&&this.$results.scrollTop(f)}},c.prototype.template=function(b,c){var d=this.options.get("templateResult"),e=this.options.get("escapeMarkup"),f=d(b,c);null==f?c.style.display="none":"string"==typeof f?c.innerHTML=e(f):a(c).append(f)},c}),b.define("select2/keys",[],function(){var a={BACKSPACE:8,TAB:9,ENTER:13,SHIFT:16,CTRL:17,ALT:18,ESC:27,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT:37,UP:38,RIGHT:39,DOWN:40,DELETE:46};return a}),b.define("select2/selection/base",["jquery","../utils","../keys"],function(a,b,c){function d(a,b){this.$element=a,this.options=b,d.__super__.constructor.call(this)}return b.Extend(d,b.Observable),d.prototype.render=function(){var b=a('<span class="select2-selection" role="combobox"  aria-haspopup="true" aria-expanded="false"></span>');return this._tabindex=0,null!=this.$element.data("old-tabindex")?this._tabindex=this.$element.data("old-tabindex"):null!=this.$element.attr("tabindex")&&(this._tabindex=this.$element.attr("tabindex")),b.attr("title",this.$element.attr("title")),b.attr("tabindex",this._tabindex),this.$selection=b,b},d.prototype.bind=function(a,b){var d=this,e=(a.id+"-container",a.id+"-results");this.container=a,this.$selection.on("focus",function(a){d.trigger("focus",a)}),this.$selection.on("blur",function(a){d._handleBlur(a)}),this.$selection.on("keydown",function(a){d.trigger("keypress",a),a.which===c.SPACE&&a.preventDefault()}),a.on("results:focus",function(a){d.$selection.attr("aria-activedescendant",a.data._resultId)}),a.on("selection:update",function(a){d.update(a.data)}),a.on("open",function(){d.$selection.attr("aria-expanded","true"),d.$selection.attr("aria-owns",e),d._attachCloseHandler(a)}),a.on("close",function(){d.$selection.attr("aria-expanded","false"),d.$selection.removeAttr("aria-activedescendant"),d.$selection.removeAttr("aria-owns"),d.$selection.focus(),d._detachCloseHandler(a)}),a.on("enable",function(){d.$selection.attr("tabindex",d._tabindex)}),a.on("disable",function(){d.$selection.attr("tabindex","-1")})},d.prototype._handleBlur=function(b){var c=this;window.setTimeout(function(){document.activeElement==c.$selection[0]||a.contains(c.$selection[0],document.activeElement)||c.trigger("blur",b)},1)},d.prototype._attachCloseHandler=function(b){a(document.body).on("mousedown.select2."+b.id,function(b){var c=a(b.target),d=c.closest(".select2"),e=a(".select2.select2-container--open");e.each(function(){var b=a(this);if(this!=d[0]){var c=b.data("element");c.select2("close")}})})},d.prototype._detachCloseHandler=function(b){a(document.body).off("mousedown.select2."+b.id)},d.prototype.position=function(a,b){var c=b.find(".selection");c.append(a)},d.prototype.destroy=function(){this._detachCloseHandler(this.container)},d.prototype.update=function(a){throw new Error("The `update` method must be defined in child classes.")},d}),b.define("select2/selection/single",["jquery","./base","../utils","../keys"],function(a,b,c,d){function e(){e.__super__.constructor.apply(this,arguments)}return c.Extend(e,b),e.prototype.render=function(){var a=e.__super__.render.call(this);return a.addClass("select2-selection--single"),a.html('<span class="select2-selection__rendered"></span><span class="select2-selection__arrow" role="presentation"><b role="presentation"></b></span>'),a},e.prototype.bind=function(a,b){var c=this;e.__super__.bind.apply(this,arguments);var d=a.id+"-container";this.$selection.find(".select2-selection__rendered").attr("id",d),this.$selection.attr("aria-labelledby",d),this.$selection.on("mousedown",function(a){1===a.which&&c.trigger("toggle",{originalEvent:a})}),this.$selection.on("focus",function(a){}),this.$selection.on("blur",function(a){}),a.on("focus",function(b){a.isOpen()||c.$selection.focus()}),a.on("selection:update",function(a){c.update(a.data)})},e.prototype.clear=function(){this.$selection.find(".select2-selection__rendered").empty()},e.prototype.display=function(a,b){var c=this.options.get("templateSelection"),d=this.options.get("escapeMarkup");return d(c(a,b))},e.prototype.selectionContainer=function(){return a("<span></span>")},e.prototype.update=function(a){if(0===a.length)return void this.clear();var b=a[0],c=this.$selection.find(".select2-selection__rendered"),d=this.display(b,c);c.empty().append(d),c.prop("title",b.title||b.text)},e}),b.define("select2/selection/multiple",["jquery","./base","../utils"],function(a,b,c){function d(a,b){d.__super__.constructor.apply(this,arguments)}return c.Extend(d,b),d.prototype.render=function(){var a=d.__super__.render.call(this);return a.addClass("select2-selection--multiple"),a.html('<ul class="select2-selection__rendered"></ul>'),a},d.prototype.bind=function(b,c){var e=this;d.__super__.bind.apply(this,arguments),this.$selection.on("click",function(a){e.trigger("toggle",{originalEvent:a})}),this.$selection.on("click",".select2-selection__choice__remove",function(b){if(!e.options.get("disabled")){var c=a(this),d=c.parent(),f=d.data("data");e.trigger("unselect",{originalEvent:b,data:f})}})},d.prototype.clear=function(){this.$selection.find(".select2-selection__rendered").empty()},d.prototype.display=function(a,b){var c=this.options.get("templateSelection"),d=this.options.get("escapeMarkup");return d(c(a,b))},d.prototype.selectionContainer=function(){var b=a('<li class="select2-selection__choice"><span class="select2-selection__choice__remove" role="presentation">&times;</span></li>');return b},d.prototype.update=function(a){if(this.clear(),0!==a.length){for(var b=[],d=0;d<a.length;d++){var e=a[d],f=this.selectionContainer(),g=this.display(e,f);f.append(g),f.prop("title",e.title||e.text),f.data("data",e),b.push(f)}var h=this.$selection.find(".select2-selection__rendered");c.appendMany(h,b)}},d}),b.define("select2/selection/placeholder",["../utils"],function(a){function b(a,b,c){this.placeholder=this.normalizePlaceholder(c.get("placeholder")),a.call(this,b,c)}return b.prototype.normalizePlaceholder=function(a,b){return"string"==typeof b&&(b={id:"",text:b}),b},b.prototype.createPlaceholder=function(a,b){var c=this.selectionContainer();return c.html(this.display(b)),c.addClass("select2-selection__placeholder").removeClass("select2-selection__choice"),c},b.prototype.update=function(a,b){var c=1==b.length&&b[0].id!=this.placeholder.id,d=b.length>1;if(d||c)return a.call(this,b);this.clear();var e=this.createPlaceholder(this.placeholder);this.$selection.find(".select2-selection__rendered").append(e)},b}),b.define("select2/selection/allowClear",["jquery","../keys"],function(a,b){function c(){}return c.prototype.bind=function(a,b,c){var d=this;a.call(this,b,c),null==this.placeholder&&this.options.get("debug")&&window.console&&console.error&&console.error("Select2: The `allowClear` option should be used in combination with the `placeholder` option."),this.$selection.on("mousedown",".select2-selection__clear",function(a){d._handleClear(a)}),b.on("keypress",function(a){d._handleKeyboardClear(a,b)})},c.prototype._handleClear=function(a,b){if(!this.options.get("disabled")){var c=this.$selection.find(".select2-selection__clear");if(0!==c.length){b.stopPropagation();for(var d=c.data("data"),e=0;e<d.length;e++){var f={data:d[e]};if(this.trigger("unselect",f),f.prevented)return}this.$element.val(this.placeholder.id).trigger("change"),this.trigger("toggle",{})}}},c.prototype._handleKeyboardClear=function(a,c,d){d.isOpen()||(c.which==b.DELETE||c.which==b.BACKSPACE)&&this._handleClear(c)},c.prototype.update=function(b,c){if(b.call(this,c),!(this.$selection.find(".select2-selection__placeholder").length>0||0===c.length)){var d=a('<span class="select2-selection__clear">&times;</span>');d.data("data",c),this.$selection.find(".select2-selection__rendered").prepend(d)}},c}),b.define("select2/selection/search",["jquery","../utils","../keys"],function(a,b,c){function d(a,b,c){a.call(this,b,c)}return d.prototype.render=function(b){var c=a('<li class="select2-search select2-search--inline"><input class="select2-search__field" type="search" tabindex="-1" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" role="textbox" aria-autocomplete="list" /></li>');this.$searchContainer=c,this.$search=c.find("input");var d=b.call(this);return this._transferTabIndex(),d},d.prototype.bind=function(a,b,d){var e=this;a.call(this,b,d),b.on("open",function(){e.$search.trigger("focus")}),b.on("close",function(){e.$search.val(""),e.$search.removeAttr("aria-activedescendant"),e.$search.trigger("focus")}),b.on("enable",function(){e.$search.prop("disabled",!1),e._transferTabIndex()}),b.on("disable",function(){e.$search.prop("disabled",!0)}),b.on("focus",function(a){e.$search.trigger("focus")}),b.on("results:focus",function(a){e.$search.attr("aria-activedescendant",a.id)}),this.$selection.on("focusin",".select2-search--inline",function(a){e.trigger("focus",a)}),this.$selection.on("focusout",".select2-search--inline",function(a){e._handleBlur(a)}),this.$selection.on("keydown",".select2-search--inline",function(a){a.stopPropagation(),e.trigger("keypress",a),e._keyUpPrevented=a.isDefaultPrevented();var b=a.which;if(b===c.BACKSPACE&&""===e.$search.val()){var d=e.$searchContainer.prev(".select2-selection__choice");if(d.length>0){var f=d.data("data");e.searchRemoveChoice(f),a.preventDefault()}}});var f=document.documentMode,g=f&&11>=f;this.$selection.on("input.searchcheck",".select2-search--inline",function(a){return g?void e.$selection.off("input.search input.searchcheck"):void e.$selection.off("keyup.search")}),this.$selection.on("keyup.search input.search",".select2-search--inline",function(a){if(g&&"input"===a.type)return void e.$selection.off("input.search input.searchcheck");var b=a.which;b!=c.SHIFT&&b!=c.CTRL&&b!=c.ALT&&b!=c.TAB&&e.handleSearch(a)})},d.prototype._transferTabIndex=function(a){this.$search.attr("tabindex",this.$selection.attr("tabindex")),this.$selection.attr("tabindex","-1")},d.prototype.createPlaceholder=function(a,b){this.$search.attr("placeholder",b.text)},d.prototype.update=function(a,b){var c=this.$search[0]==document.activeElement;this.$search.attr("placeholder",""),a.call(this,b),this.$selection.find(".select2-selection__rendered").append(this.$searchContainer),this.resizeSearch(),c&&this.$search.focus()},d.prototype.handleSearch=function(){if(this.resizeSearch(),!this._keyUpPrevented){var a=this.$search.val();this.trigger("query",{term:a})}this._keyUpPrevented=!1},d.prototype.searchRemoveChoice=function(a,b){this.trigger("unselect",{data:b}),this.$search.val(b.text),this.handleSearch()},d.prototype.resizeSearch=function(){this.$search.css("width","25px");var a="";if(""!==this.$search.attr("placeholder"))a=this.$selection.find(".select2-selection__rendered").innerWidth();else{var b=this.$search.val().length+1;a=.75*b+"em"}this.$search.css("width",a)},d}),b.define("select2/selection/eventRelay",["jquery"],function(a){function b(){}return b.prototype.bind=function(b,c,d){var e=this,f=["open","opening","close","closing","select","selecting","unselect","unselecting"],g=["opening","closing","selecting","unselecting"];b.call(this,c,d),c.on("*",function(b,c){if(-1!==a.inArray(b,f)){c=c||{};var d=a.Event("select2:"+b,{params:c});e.$element.trigger(d),-1!==a.inArray(b,g)&&(c.prevented=d.isDefaultPrevented())}})},b}),b.define("select2/translation",["jquery","require"],function(a,b){function c(a){this.dict=a||{}}return c.prototype.all=function(){return this.dict},c.prototype.get=function(a){return this.dict[a]},c.prototype.extend=function(b){this.dict=a.extend({},b.all(),this.dict)},c._cache={},c.loadPath=function(a){if(!(a in c._cache)){var d=b(a);c._cache[a]=d}return new c(c._cache[a])},c}),b.define("select2/diacritics",[],function(){var a={"Ⓐ":"A","Ａ":"A","À":"A","Á":"A","Â":"A","Ầ":"A","Ấ":"A","Ẫ":"A","Ẩ":"A","Ã":"A","Ā":"A","Ă":"A","Ằ":"A","Ắ":"A","Ẵ":"A","Ẳ":"A","Ȧ":"A","Ǡ":"A","Ä":"A","Ǟ":"A","Ả":"A","Å":"A","Ǻ":"A","Ǎ":"A","Ȁ":"A","Ȃ":"A","Ạ":"A","Ậ":"A","Ặ":"A","Ḁ":"A","Ą":"A","Ⱥ":"A","Ɐ":"A","Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ⓑ":"B","Ｂ":"B","Ḃ":"B","Ḅ":"B","Ḇ":"B","Ƀ":"B","Ƃ":"B","Ɓ":"B","Ⓒ":"C","Ｃ":"C","Ć":"C","Ĉ":"C","Ċ":"C","Č":"C","Ç":"C","Ḉ":"C","Ƈ":"C","Ȼ":"C","Ꜿ":"C","Ⓓ":"D","Ｄ":"D","Ḋ":"D","Ď":"D","Ḍ":"D","Ḑ":"D","Ḓ":"D","Ḏ":"D","Đ":"D","Ƌ":"D","Ɗ":"D","Ɖ":"D","Ꝺ":"D","Ǳ":"DZ","Ǆ":"DZ","ǲ":"Dz","ǅ":"Dz","Ⓔ":"E","Ｅ":"E","È":"E","É":"E","Ê":"E","Ề":"E","Ế":"E","Ễ":"E","Ể":"E","Ẽ":"E","Ē":"E","Ḕ":"E","Ḗ":"E","Ĕ":"E","Ė":"E","Ë":"E","Ẻ":"E","Ě":"E","Ȅ":"E","Ȇ":"E","Ẹ":"E","Ệ":"E","Ȩ":"E","Ḝ":"E","Ę":"E","Ḙ":"E","Ḛ":"E","Ɛ":"E","Ǝ":"E","Ⓕ":"F","Ｆ":"F","Ḟ":"F","Ƒ":"F","Ꝼ":"F","Ⓖ":"G","Ｇ":"G","Ǵ":"G","Ĝ":"G","Ḡ":"G","Ğ":"G","Ġ":"G","Ǧ":"G","Ģ":"G","Ǥ":"G","Ɠ":"G","Ꞡ":"G","Ᵹ":"G","Ꝿ":"G","Ⓗ":"H","Ｈ":"H","Ĥ":"H","Ḣ":"H","Ḧ":"H","Ȟ":"H","Ḥ":"H","Ḩ":"H","Ḫ":"H","Ħ":"H","Ⱨ":"H","Ⱶ":"H","Ɥ":"H","Ⓘ":"I","Ｉ":"I","Ì":"I","Í":"I","Î":"I","Ĩ":"I","Ī":"I","Ĭ":"I","İ":"I","Ï":"I","Ḯ":"I","Ỉ":"I","Ǐ":"I","Ȉ":"I","Ȋ":"I","Ị":"I","Į":"I","Ḭ":"I","Ɨ":"I","Ⓙ":"J","Ｊ":"J","Ĵ":"J","Ɉ":"J","Ⓚ":"K","Ｋ":"K","Ḱ":"K","Ǩ":"K","Ḳ":"K","Ķ":"K","Ḵ":"K","Ƙ":"K","Ⱪ":"K","Ꝁ":"K","Ꝃ":"K","Ꝅ":"K","Ꞣ":"K","Ⓛ":"L","Ｌ":"L","Ŀ":"L","Ĺ":"L","Ľ":"L","Ḷ":"L","Ḹ":"L","Ļ":"L","Ḽ":"L","Ḻ":"L","Ł":"L","Ƚ":"L","Ɫ":"L","Ⱡ":"L","Ꝉ":"L","Ꝇ":"L","Ꞁ":"L","Ǉ":"LJ","ǈ":"Lj","Ⓜ":"M","Ｍ":"M","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ɯ":"M","Ⓝ":"N","Ｎ":"N","Ǹ":"N","Ń":"N","Ñ":"N","Ṅ":"N","Ň":"N","Ṇ":"N","Ņ":"N","Ṋ":"N","Ṉ":"N","Ƞ":"N","Ɲ":"N","Ꞑ":"N","Ꞥ":"N","Ǌ":"NJ","ǋ":"Nj","Ⓞ":"O","Ｏ":"O","Ò":"O","Ó":"O","Ô":"O","Ồ":"O","Ố":"O","Ỗ":"O","Ổ":"O","Õ":"O","Ṍ":"O","Ȭ":"O","Ṏ":"O","Ō":"O","Ṑ":"O","Ṓ":"O","Ŏ":"O","Ȯ":"O","Ȱ":"O","Ö":"O","Ȫ":"O","Ỏ":"O","Ő":"O","Ǒ":"O","Ȍ":"O","Ȏ":"O","Ơ":"O","Ờ":"O","Ớ":"O","Ỡ":"O","Ở":"O","Ợ":"O","Ọ":"O","Ộ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Ɔ":"O","Ɵ":"O","Ꝋ":"O","Ꝍ":"O","Ƣ":"OI","Ꝏ":"OO","Ȣ":"OU","Ⓟ":"P","Ｐ":"P","Ṕ":"P","Ṗ":"P","Ƥ":"P","Ᵽ":"P","Ꝑ":"P","Ꝓ":"P","Ꝕ":"P","Ⓠ":"Q","Ｑ":"Q","Ꝗ":"Q","Ꝙ":"Q","Ɋ":"Q","Ⓡ":"R","Ｒ":"R","Ŕ":"R","Ṙ":"R","Ř":"R","Ȑ":"R","Ȓ":"R","Ṛ":"R","Ṝ":"R","Ŗ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꝛ":"R","Ꞧ":"R","Ꞃ":"R","Ⓢ":"S","Ｓ":"S","ẞ":"S","Ś":"S","Ṥ":"S","Ŝ":"S","Ṡ":"S","Š":"S","Ṧ":"S","Ṣ":"S","Ṩ":"S","Ș":"S","Ş":"S","Ȿ":"S","Ꞩ":"S","Ꞅ":"S","Ⓣ":"T","Ｔ":"T","Ṫ":"T","Ť":"T","Ṭ":"T","Ț":"T","Ţ":"T","Ṱ":"T","Ṯ":"T","Ŧ":"T","Ƭ":"T","Ʈ":"T","Ⱦ":"T","Ꞇ":"T","Ꜩ":"TZ","Ⓤ":"U","Ｕ":"U","Ù":"U","Ú":"U","Û":"U","Ũ":"U","Ṹ":"U","Ū":"U","Ṻ":"U","Ŭ":"U","Ü":"U","Ǜ":"U","Ǘ":"U","Ǖ":"U","Ǚ":"U","Ủ":"U","Ů":"U","Ű":"U","Ǔ":"U","Ȕ":"U","Ȗ":"U","Ư":"U","Ừ":"U","Ứ":"U","Ữ":"U","Ử":"U","Ự":"U","Ụ":"U","Ṳ":"U","Ų":"U","Ṷ":"U","Ṵ":"U","Ʉ":"U","Ⓥ":"V","Ｖ":"V","Ṽ":"V","Ṿ":"V","Ʋ":"V","Ꝟ":"V","Ʌ":"V","Ꝡ":"VY","Ⓦ":"W","Ｗ":"W","Ẁ":"W","Ẃ":"W","Ŵ":"W","Ẇ":"W","Ẅ":"W","Ẉ":"W","Ⱳ":"W","Ⓧ":"X","Ｘ":"X","Ẋ":"X","Ẍ":"X","Ⓨ":"Y","Ｙ":"Y","Ỳ":"Y","Ý":"Y","Ŷ":"Y","Ỹ":"Y","Ȳ":"Y","Ẏ":"Y","Ÿ":"Y","Ỷ":"Y","Ỵ":"Y","Ƴ":"Y","Ɏ":"Y","Ỿ":"Y","Ⓩ":"Z","Ｚ":"Z","Ź":"Z","Ẑ":"Z","Ż":"Z","Ž":"Z","Ẓ":"Z","Ẕ":"Z","Ƶ":"Z","Ȥ":"Z","Ɀ":"Z","Ⱬ":"Z","Ꝣ":"Z","ⓐ":"a","ａ":"a","ẚ":"a","à":"a","á":"a","â":"a","ầ":"a","ấ":"a","ẫ":"a","ẩ":"a","ã":"a","ā":"a","ă":"a","ằ":"a","ắ":"a","ẵ":"a","ẳ":"a","ȧ":"a","ǡ":"a","ä":"a","ǟ":"a","ả":"a","å":"a","ǻ":"a","ǎ":"a","ȁ":"a","ȃ":"a","ạ":"a","ậ":"a","ặ":"a","ḁ":"a","ą":"a","ⱥ":"a","ɐ":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ⓑ":"b","ｂ":"b","ḃ":"b","ḅ":"b","ḇ":"b","ƀ":"b","ƃ":"b","ɓ":"b","ⓒ":"c","ｃ":"c","ć":"c","ĉ":"c","ċ":"c","č":"c","ç":"c","ḉ":"c","ƈ":"c","ȼ":"c","ꜿ":"c","ↄ":"c","ⓓ":"d","ｄ":"d","ḋ":"d","ď":"d","ḍ":"d","ḑ":"d","ḓ":"d","ḏ":"d","đ":"d","ƌ":"d","ɖ":"d","ɗ":"d","ꝺ":"d","ǳ":"dz","ǆ":"dz","ⓔ":"e","ｅ":"e","è":"e","é":"e","ê":"e","ề":"e","ế":"e","ễ":"e","ể":"e","ẽ":"e","ē":"e","ḕ":"e","ḗ":"e","ĕ":"e","ė":"e","ë":"e","ẻ":"e","ě":"e","ȅ":"e","ȇ":"e","ẹ":"e","ệ":"e","ȩ":"e","ḝ":"e","ę":"e","ḙ":"e","ḛ":"e","ɇ":"e","ɛ":"e","ǝ":"e","ⓕ":"f","ｆ":"f","ḟ":"f","ƒ":"f","ꝼ":"f","ⓖ":"g","ｇ":"g","ǵ":"g","ĝ":"g","ḡ":"g","ğ":"g","ġ":"g","ǧ":"g","ģ":"g","ǥ":"g","ɠ":"g","ꞡ":"g","ᵹ":"g","ꝿ":"g","ⓗ":"h","ｈ":"h","ĥ":"h","ḣ":"h","ḧ":"h","ȟ":"h","ḥ":"h","ḩ":"h","ḫ":"h","ẖ":"h","ħ":"h","ⱨ":"h","ⱶ":"h","ɥ":"h","ƕ":"hv","ⓘ":"i","ｉ":"i","ì":"i","í":"i","î":"i","ĩ":"i","ī":"i","ĭ":"i","ï":"i","ḯ":"i","ỉ":"i","ǐ":"i","ȉ":"i","ȋ":"i","ị":"i","į":"i","ḭ":"i","ɨ":"i","ı":"i","ⓙ":"j","ｊ":"j","ĵ":"j","ǰ":"j","ɉ":"j","ⓚ":"k","ｋ":"k","ḱ":"k","ǩ":"k","ḳ":"k","ķ":"k","ḵ":"k","ƙ":"k","ⱪ":"k","ꝁ":"k","ꝃ":"k","ꝅ":"k","ꞣ":"k","ⓛ":"l","ｌ":"l","ŀ":"l","ĺ":"l","ľ":"l","ḷ":"l","ḹ":"l","ļ":"l","ḽ":"l","ḻ":"l","ſ":"l","ł":"l","ƚ":"l","ɫ":"l","ⱡ":"l","ꝉ":"l","ꞁ":"l","ꝇ":"l","ǉ":"lj","ⓜ":"m","ｍ":"m","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ɯ":"m","ⓝ":"n","ｎ":"n","ǹ":"n","ń":"n","ñ":"n","ṅ":"n","ň":"n","ṇ":"n","ņ":"n","ṋ":"n","ṉ":"n","ƞ":"n","ɲ":"n","ŉ":"n","ꞑ":"n","ꞥ":"n","ǌ":"nj","ⓞ":"o","ｏ":"o","ò":"o","ó":"o","ô":"o","ồ":"o","ố":"o","ỗ":"o","ổ":"o","õ":"o","ṍ":"o","ȭ":"o","ṏ":"o","ō":"o","ṑ":"o","ṓ":"o","ŏ":"o","ȯ":"o","ȱ":"o","ö":"o","ȫ":"o","ỏ":"o","ő":"o","ǒ":"o","ȍ":"o","ȏ":"o","ơ":"o","ờ":"o","ớ":"o","ỡ":"o","ở":"o","ợ":"o","ọ":"o","ộ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","ɔ":"o","ꝋ":"o","ꝍ":"o","ɵ":"o","ƣ":"oi","ȣ":"ou","ꝏ":"oo","ⓟ":"p","ｐ":"p","ṕ":"p","ṗ":"p","ƥ":"p","ᵽ":"p","ꝑ":"p","ꝓ":"p","ꝕ":"p","ⓠ":"q","ｑ":"q","ɋ":"q","ꝗ":"q","ꝙ":"q","ⓡ":"r","ｒ":"r","ŕ":"r","ṙ":"r","ř":"r","ȑ":"r","ȓ":"r","ṛ":"r","ṝ":"r","ŗ":"r","ṟ":"r","ɍ":"r","ɽ":"r","ꝛ":"r","ꞧ":"r","ꞃ":"r","ⓢ":"s","ｓ":"s","ß":"s","ś":"s","ṥ":"s","ŝ":"s","ṡ":"s","š":"s","ṧ":"s","ṣ":"s","ṩ":"s","ș":"s","ş":"s","ȿ":"s","ꞩ":"s","ꞅ":"s","ẛ":"s","ⓣ":"t","ｔ":"t","ṫ":"t","ẗ":"t","ť":"t","ṭ":"t","ț":"t","ţ":"t","ṱ":"t","ṯ":"t","ŧ":"t","ƭ":"t","ʈ":"t","ⱦ":"t","ꞇ":"t","ꜩ":"tz","ⓤ":"u","ｕ":"u","ù":"u","ú":"u","û":"u","ũ":"u","ṹ":"u","ū":"u","ṻ":"u","ŭ":"u","ü":"u","ǜ":"u","ǘ":"u","ǖ":"u","ǚ":"u","ủ":"u","ů":"u","ű":"u","ǔ":"u","ȕ":"u","ȗ":"u","ư":"u","ừ":"u","ứ":"u","ữ":"u","ử":"u","ự":"u","ụ":"u","ṳ":"u","ų":"u","ṷ":"u","ṵ":"u","ʉ":"u","ⓥ":"v","ｖ":"v","ṽ":"v","ṿ":"v","ʋ":"v","ꝟ":"v","ʌ":"v","ꝡ":"vy","ⓦ":"w","ｗ":"w","ẁ":"w","ẃ":"w","ŵ":"w","ẇ":"w","ẅ":"w","ẘ":"w","ẉ":"w","ⱳ":"w","ⓧ":"x","ｘ":"x","ẋ":"x","ẍ":"x","ⓨ":"y","ｙ":"y","ỳ":"y","ý":"y","ŷ":"y","ỹ":"y","ȳ":"y","ẏ":"y","ÿ":"y","ỷ":"y","ẙ":"y","ỵ":"y","ƴ":"y","ɏ":"y","ỿ":"y","ⓩ":"z","ｚ":"z","ź":"z","ẑ":"z","ż":"z","ž":"z","ẓ":"z","ẕ":"z","ƶ":"z","ȥ":"z","ɀ":"z","ⱬ":"z","ꝣ":"z","Ά":"Α","Έ":"Ε","Ή":"Η","Ί":"Ι","Ϊ":"Ι","Ό":"Ο","Ύ":"Υ","Ϋ":"Υ","Ώ":"Ω","ά":"α","έ":"ε","ή":"η","ί":"ι","ϊ":"ι","ΐ":"ι","ό":"ο","ύ":"υ","ϋ":"υ","ΰ":"υ","ω":"ω","ς":"σ"};return a}),b.define("select2/data/base",["../utils"],function(a){function b(a,c){b.__super__.constructor.call(this)}return a.Extend(b,a.Observable),b.prototype.current=function(a){throw new Error("The `current` method must be defined in child classes.")},b.prototype.query=function(a,b){throw new Error("The `query` method must be defined in child classes.")},b.prototype.bind=function(a,b){},b.prototype.destroy=function(){},b.prototype.generateResultId=function(b,c){var d=b.id+"-result-";return d+=a.generateChars(4),d+=null!=c.id?"-"+c.id.toString():"-"+a.generateChars(4)},b}),b.define("select2/data/select",["./base","../utils","jquery"],function(a,b,c){function d(a,b){this.$element=a,this.options=b,d.__super__.constructor.call(this)}return b.Extend(d,a),d.prototype.current=function(a){var b=[],d=this;this.$element.find(":selected").each(function(){var a=c(this),e=d.item(a);b.push(e)}),a(b)},d.prototype.select=function(a){var b=this;if(a.selected=!0,c(a.element).is("option"))return a.element.selected=!0,void this.$element.trigger("change");
if(this.$element.prop("multiple"))this.current(function(d){var e=[];a=[a],a.push.apply(a,d);for(var f=0;f<a.length;f++){var g=a[f].id;-1===c.inArray(g,e)&&e.push(g)}b.$element.val(e),b.$element.trigger("change")});else{var d=a.id;this.$element.val(d),this.$element.trigger("change")}},d.prototype.unselect=function(a){var b=this;if(this.$element.prop("multiple"))return a.selected=!1,c(a.element).is("option")?(a.element.selected=!1,void this.$element.trigger("change")):void this.current(function(d){for(var e=[],f=0;f<d.length;f++){var g=d[f].id;g!==a.id&&-1===c.inArray(g,e)&&e.push(g)}b.$element.val(e),b.$element.trigger("change")})},d.prototype.bind=function(a,b){var c=this;this.container=a,a.on("select",function(a){c.select(a.data)}),a.on("unselect",function(a){c.unselect(a.data)})},d.prototype.destroy=function(){this.$element.find("*").each(function(){c.removeData(this,"data")})},d.prototype.query=function(a,b){var d=[],e=this,f=this.$element.children();f.each(function(){var b=c(this);if(b.is("option")||b.is("optgroup")){var f=e.item(b),g=e.matches(a,f);null!==g&&d.push(g)}}),b({results:d})},d.prototype.addOptions=function(a){b.appendMany(this.$element,a)},d.prototype.option=function(a){var b;a.children?(b=document.createElement("optgroup"),b.label=a.text):(b=document.createElement("option"),void 0!==b.textContent?b.textContent=a.text:b.innerText=a.text),a.id&&(b.value=a.id),a.disabled&&(b.disabled=!0),a.selected&&(b.selected=!0),a.title&&(b.title=a.title);var d=c(b),e=this._normalizeItem(a);return e.element=b,c.data(b,"data",e),d},d.prototype.item=function(a){var b={};if(b=c.data(a[0],"data"),null!=b)return b;if(a.is("option"))b={id:a.val(),text:a.text(),disabled:a.prop("disabled"),selected:a.prop("selected"),title:a.prop("title")};else if(a.is("optgroup")){b={text:a.prop("label"),children:[],title:a.prop("title")};for(var d=a.children("option"),e=[],f=0;f<d.length;f++){var g=c(d[f]),h=this.item(g);e.push(h)}b.children=e}return b=this._normalizeItem(b),b.element=a[0],c.data(a[0],"data",b),b},d.prototype._normalizeItem=function(a){c.isPlainObject(a)||(a={id:a,text:a}),a=c.extend({},{text:""},a);var b={selected:!1,disabled:!1};return null!=a.id&&(a.id=a.id.toString()),null!=a.text&&(a.text=a.text.toString()),null==a._resultId&&a.id&&null!=this.container&&(a._resultId=this.generateResultId(this.container,a)),c.extend({},b,a)},d.prototype.matches=function(a,b){var c=this.options.get("matcher");return c(a,b)},d}),b.define("select2/data/array",["./select","../utils","jquery"],function(a,b,c){function d(a,b){var c=b.get("data")||[];d.__super__.constructor.call(this,a,b),this.addOptions(this.convertToOptions(c))}return b.Extend(d,a),d.prototype.select=function(a){var b=this.$element.find("option").filter(function(b,c){return c.value==a.id.toString()});0===b.length&&(b=this.option(a),this.addOptions(b)),d.__super__.select.call(this,a)},d.prototype.convertToOptions=function(a){function d(a){return function(){return c(this).val()==a.id}}for(var e=this,f=this.$element.find("option"),g=f.map(function(){return e.item(c(this)).id}).get(),h=[],i=0;i<a.length;i++){var j=this._normalizeItem(a[i]);if(c.inArray(j.id,g)>=0){var k=f.filter(d(j)),l=this.item(k),m=c.extend(!0,{},j,l),n=this.option(m);k.replaceWith(n)}else{var o=this.option(j);if(j.children){var p=this.convertToOptions(j.children);b.appendMany(o,p)}h.push(o)}}return h},d}),b.define("select2/data/ajax",["./array","../utils","jquery"],function(a,b,c){function d(a,b){this.ajaxOptions=this._applyDefaults(b.get("ajax")),null!=this.ajaxOptions.processResults&&(this.processResults=this.ajaxOptions.processResults),d.__super__.constructor.call(this,a,b)}return b.Extend(d,a),d.prototype._applyDefaults=function(a){var b={data:function(a){return c.extend({},a,{q:a.term})},transport:function(a,b,d){var e=c.ajax(a);return e.then(b),e.fail(d),e}};return c.extend({},b,a,!0)},d.prototype.processResults=function(a){return a},d.prototype.query=function(a,b){function d(){var d=f.transport(f,function(d){var f=e.processResults(d,a);e.options.get("debug")&&window.console&&console.error&&(f&&f.results&&c.isArray(f.results)||console.error("Select2: The AJAX results did not return an array in the `results` key of the response.")),b(f)},function(){d.status&&"0"===d.status||e.trigger("results:message",{message:"errorLoading"})});e._request=d}var e=this;null!=this._request&&(c.isFunction(this._request.abort)&&this._request.abort(),this._request=null);var f=c.extend({type:"GET"},this.ajaxOptions);"function"==typeof f.url&&(f.url=f.url.call(this.$element,a)),"function"==typeof f.data&&(f.data=f.data.call(this.$element,a)),this.ajaxOptions.delay&&null!=a.term?(this._queryTimeout&&window.clearTimeout(this._queryTimeout),this._queryTimeout=window.setTimeout(d,this.ajaxOptions.delay)):d()},d}),b.define("select2/data/tags",["jquery"],function(a){function b(b,c,d){var e=d.get("tags"),f=d.get("createTag");void 0!==f&&(this.createTag=f);var g=d.get("insertTag");if(void 0!==g&&(this.insertTag=g),b.call(this,c,d),a.isArray(e))for(var h=0;h<e.length;h++){var i=e[h],j=this._normalizeItem(i),k=this.option(j);this.$element.append(k)}}return b.prototype.query=function(a,b,c){function d(a,f){for(var g=a.results,h=0;h<g.length;h++){var i=g[h],j=null!=i.children&&!d({results:i.children},!0),k=i.text===b.term;if(k||j)return f?!1:(a.data=g,void c(a))}if(f)return!0;var l=e.createTag(b);if(null!=l){var m=e.option(l);m.attr("data-select2-tag",!0),e.addOptions([m]),e.insertTag(g,l)}a.results=g,c(a)}var e=this;return this._removeOldTags(),null==b.term||null!=b.page?void a.call(this,b,c):void a.call(this,b,d)},b.prototype.createTag=function(b,c){var d=a.trim(c.term);return""===d?null:{id:d,text:d}},b.prototype.insertTag=function(a,b,c){b.unshift(c)},b.prototype._removeOldTags=function(b){var c=(this._lastTag,this.$element.find("option[data-select2-tag]"));c.each(function(){this.selected||a(this).remove()})},b}),b.define("select2/data/tokenizer",["jquery"],function(a){function b(a,b,c){var d=c.get("tokenizer");void 0!==d&&(this.tokenizer=d),a.call(this,b,c)}return b.prototype.bind=function(a,b,c){a.call(this,b,c),this.$search=b.dropdown.$search||b.selection.$search||c.find(".select2-search__field")},b.prototype.query=function(b,c,d){function e(b){var c=g._normalizeItem(b),d=g.$element.find("option").filter(function(){return a(this).val()===c.id});if(!d.length){var e=g.option(c);e.attr("data-select2-tag",!0),g._removeOldTags(),g.addOptions([e])}f(c)}function f(a){g.trigger("select",{data:a})}var g=this;c.term=c.term||"";var h=this.tokenizer(c,this.options,e);h.term!==c.term&&(this.$search.length&&(this.$search.val(h.term),this.$search.focus()),c.term=h.term),b.call(this,c,d)},b.prototype.tokenizer=function(b,c,d,e){for(var f=d.get("tokenSeparators")||[],g=c.term,h=0,i=this.createTag||function(a){return{id:a.term,text:a.term}};h<g.length;){var j=g[h];if(-1!==a.inArray(j,f)){var k=g.substr(0,h),l=a.extend({},c,{term:k}),m=i(l);null!=m?(e(m),g=g.substr(h+1)||"",h=0):h++}else h++}return{term:g}},b}),b.define("select2/data/minimumInputLength",[],function(){function a(a,b,c){this.minimumInputLength=c.get("minimumInputLength"),a.call(this,b,c)}return a.prototype.query=function(a,b,c){return b.term=b.term||"",b.term.length<this.minimumInputLength?void this.trigger("results:message",{message:"inputTooShort",args:{minimum:this.minimumInputLength,input:b.term,params:b}}):void a.call(this,b,c)},a}),b.define("select2/data/maximumInputLength",[],function(){function a(a,b,c){this.maximumInputLength=c.get("maximumInputLength"),a.call(this,b,c)}return a.prototype.query=function(a,b,c){return b.term=b.term||"",this.maximumInputLength>0&&b.term.length>this.maximumInputLength?void this.trigger("results:message",{message:"inputTooLong",args:{maximum:this.maximumInputLength,input:b.term,params:b}}):void a.call(this,b,c)},a}),b.define("select2/data/maximumSelectionLength",[],function(){function a(a,b,c){this.maximumSelectionLength=c.get("maximumSelectionLength"),a.call(this,b,c)}return a.prototype.query=function(a,b,c){var d=this;this.current(function(e){var f=null!=e?e.length:0;return d.maximumSelectionLength>0&&f>=d.maximumSelectionLength?void d.trigger("results:message",{message:"maximumSelected",args:{maximum:d.maximumSelectionLength}}):void a.call(d,b,c)})},a}),b.define("select2/dropdown",["jquery","./utils"],function(a,b){function c(a,b){this.$element=a,this.options=b,c.__super__.constructor.call(this)}return b.Extend(c,b.Observable),c.prototype.render=function(){var b=a('<span class="select2-dropdown"><span class="select2-results"></span></span>');return b.attr("dir",this.options.get("dir")),this.$dropdown=b,b},c.prototype.bind=function(){},c.prototype.position=function(a,b){},c.prototype.destroy=function(){this.$dropdown.remove()},c}),b.define("select2/dropdown/search",["jquery","../utils"],function(a,b){function c(){}return c.prototype.render=function(b){var c=b.call(this),d=a('<span class="select2-search select2-search--dropdown"><input class="select2-search__field" type="search" tabindex="-1" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" role="textbox" /></span>');return this.$searchContainer=d,this.$search=d.find("input"),c.prepend(d),c},c.prototype.bind=function(b,c,d){var e=this;b.call(this,c,d),this.$search.on("keydown",function(a){e.trigger("keypress",a),e._keyUpPrevented=a.isDefaultPrevented()}),this.$search.on("input",function(b){a(this).off("keyup")}),this.$search.on("keyup input",function(a){e.handleSearch(a)}),c.on("open",function(){e.$search.attr("tabindex",0),e.$search.focus(),window.setTimeout(function(){e.$search.focus()},0)}),c.on("close",function(){e.$search.attr("tabindex",-1),e.$search.val("")}),c.on("focus",function(){c.isOpen()&&e.$search.focus()}),c.on("results:all",function(a){if(null==a.query.term||""===a.query.term){var b=e.showSearch(a);b?e.$searchContainer.removeClass("select2-search--hide"):e.$searchContainer.addClass("select2-search--hide")}})},c.prototype.handleSearch=function(a){if(!this._keyUpPrevented){var b=this.$search.val();this.trigger("query",{term:b})}this._keyUpPrevented=!1},c.prototype.showSearch=function(a,b){return!0},c}),b.define("select2/dropdown/hidePlaceholder",[],function(){function a(a,b,c,d){this.placeholder=this.normalizePlaceholder(c.get("placeholder")),a.call(this,b,c,d)}return a.prototype.append=function(a,b){b.results=this.removePlaceholder(b.results),a.call(this,b)},a.prototype.normalizePlaceholder=function(a,b){return"string"==typeof b&&(b={id:"",text:b}),b},a.prototype.removePlaceholder=function(a,b){for(var c=b.slice(0),d=b.length-1;d>=0;d--){var e=b[d];this.placeholder.id===e.id&&c.splice(d,1)}return c},a}),b.define("select2/dropdown/infiniteScroll",["jquery"],function(a){function b(a,b,c,d){this.lastParams={},a.call(this,b,c,d),this.$loadingMore=this.createLoadingMore(),this.loading=!1}return b.prototype.append=function(a,b){this.$loadingMore.remove(),this.loading=!1,a.call(this,b),this.showLoadingMore(b)&&this.$results.append(this.$loadingMore)},b.prototype.bind=function(b,c,d){var e=this;b.call(this,c,d),c.on("query",function(a){e.lastParams=a,e.loading=!0}),c.on("query:append",function(a){e.lastParams=a,e.loading=!0}),this.$results.on("scroll",function(){var b=a.contains(document.documentElement,e.$loadingMore[0]);if(!e.loading&&b){var c=e.$results.offset().top+e.$results.outerHeight(!1),d=e.$loadingMore.offset().top+e.$loadingMore.outerHeight(!1);c+50>=d&&e.loadMore()}})},b.prototype.loadMore=function(){this.loading=!0;var b=a.extend({},{page:1},this.lastParams);b.page++,this.trigger("query:append",b)},b.prototype.showLoadingMore=function(a,b){return b.pagination&&b.pagination.more},b.prototype.createLoadingMore=function(){var b=a('<li class="select2-results__option select2-results__option--load-more"role="treeitem" aria-disabled="true"></li>'),c=this.options.get("translations").get("loadingMore");return b.html(c(this.lastParams)),b},b}),b.define("select2/dropdown/attachBody",["jquery","../utils"],function(a,b){function c(b,c,d){this.$dropdownParent=d.get("dropdownParent")||a(document.body),b.call(this,c,d)}return c.prototype.bind=function(a,b,c){var d=this,e=!1;a.call(this,b,c),b.on("open",function(){d._showDropdown(),d._attachPositioningHandler(b),e||(e=!0,b.on("results:all",function(){d._positionDropdown(),d._resizeDropdown()}),b.on("results:append",function(){d._positionDropdown(),d._resizeDropdown()}))}),b.on("close",function(){d._hideDropdown(),d._detachPositioningHandler(b)}),this.$dropdownContainer.on("mousedown",function(a){a.stopPropagation()})},c.prototype.destroy=function(a){a.call(this),this.$dropdownContainer.remove()},c.prototype.position=function(a,b,c){b.attr("class",c.attr("class")),b.removeClass("select2"),b.addClass("select2-container--open"),b.css({position:"absolute",top:-999999}),this.$container=c},c.prototype.render=function(b){var c=a("<span></span>"),d=b.call(this);return c.append(d),this.$dropdownContainer=c,c},c.prototype._hideDropdown=function(a){this.$dropdownContainer.detach()},c.prototype._attachPositioningHandler=function(c,d){var e=this,f="scroll.select2."+d.id,g="resize.select2."+d.id,h="orientationchange.select2."+d.id,i=this.$container.parents().filter(b.hasScroll);i.each(function(){a(this).data("select2-scroll-position",{x:a(this).scrollLeft(),y:a(this).scrollTop()})}),i.on(f,function(b){var c=a(this).data("select2-scroll-position");a(this).scrollTop(c.y)}),a(window).on(f+" "+g+" "+h,function(a){e._positionDropdown(),e._resizeDropdown()})},c.prototype._detachPositioningHandler=function(c,d){var e="scroll.select2."+d.id,f="resize.select2."+d.id,g="orientationchange.select2."+d.id,h=this.$container.parents().filter(b.hasScroll);h.off(e),a(window).off(e+" "+f+" "+g)},c.prototype._positionDropdown=function(){var b=a(window),c=this.$dropdown.hasClass("select2-dropdown--above"),d=this.$dropdown.hasClass("select2-dropdown--below"),e=null,f=this.$container.offset();f.bottom=f.top+this.$container.outerHeight(!1);var g={height:this.$container.outerHeight(!1)};g.top=f.top,g.bottom=f.top+g.height;var h={height:this.$dropdown.outerHeight(!1)},i={top:b.scrollTop(),bottom:b.scrollTop()+b.height()},j=i.top<f.top-h.height,k=i.bottom>f.bottom+h.height,l={left:f.left,top:g.bottom},m=this.$dropdownParent;"static"===m.css("position")&&(m=m.offsetParent());var n=m.offset();l.top-=n.top,l.left-=n.left,c||d||(e="below"),k||!j||c?!j&&k&&c&&(e="below"):e="above",("above"==e||c&&"below"!==e)&&(l.top=g.top-n.top-h.height),null!=e&&(this.$dropdown.removeClass("select2-dropdown--below select2-dropdown--above").addClass("select2-dropdown--"+e),this.$container.removeClass("select2-container--below select2-container--above").addClass("select2-container--"+e)),this.$dropdownContainer.css(l)},c.prototype._resizeDropdown=function(){var a={width:this.$container.outerWidth(!1)+"px"};this.options.get("dropdownAutoWidth")&&(a.minWidth=a.width,a.position="relative",a.width="auto"),this.$dropdown.css(a)},c.prototype._showDropdown=function(a){this.$dropdownContainer.appendTo(this.$dropdownParent),this._positionDropdown(),this._resizeDropdown()},c}),b.define("select2/dropdown/minimumResultsForSearch",[],function(){function a(b){for(var c=0,d=0;d<b.length;d++){var e=b[d];e.children?c+=a(e.children):c++}return c}function b(a,b,c,d){this.minimumResultsForSearch=c.get("minimumResultsForSearch"),this.minimumResultsForSearch<0&&(this.minimumResultsForSearch=1/0),a.call(this,b,c,d)}return b.prototype.showSearch=function(b,c){return a(c.data.results)<this.minimumResultsForSearch?!1:b.call(this,c)},b}),b.define("select2/dropdown/selectOnClose",[],function(){function a(){}return a.prototype.bind=function(a,b,c){var d=this;a.call(this,b,c),b.on("close",function(a){d._handleSelectOnClose(a)})},a.prototype._handleSelectOnClose=function(a,b){if(b&&null!=b.originalSelect2Event){var c=b.originalSelect2Event;if("select"===c._type||"unselect"===c._type)return}var d=this.getHighlightedResults();if(!(d.length<1)){var e=d.data("data");null!=e.element&&e.element.selected||null==e.element&&e.selected||this.trigger("select",{data:e})}},a}),b.define("select2/dropdown/closeOnSelect",[],function(){function a(){}return a.prototype.bind=function(a,b,c){var d=this;a.call(this,b,c),b.on("select",function(a){d._selectTriggered(a)}),b.on("unselect",function(a){d._selectTriggered(a)})},a.prototype._selectTriggered=function(a,b){var c=b.originalEvent;c&&c.ctrlKey||this.trigger("close",{originalEvent:c,originalSelect2Event:b})},a}),b.define("select2/i18n/en",[],function(){return{errorLoading:function(){return"The results could not be loaded."},inputTooLong:function(a){var b=a.input.length-a.maximum,c="Please delete "+b+" character";return 1!=b&&(c+="s"),c},inputTooShort:function(a){var b=a.minimum-a.input.length,c="Please enter "+b+" or more characters";return c},loadingMore:function(){return"Loading more results…"},maximumSelected:function(a){var b="You can only select "+a.maximum+" item";return 1!=a.maximum&&(b+="s"),b},noResults:function(){return"No results found"},searching:function(){return"Searching…"}}}),b.define("select2/defaults",["jquery","require","./results","./selection/single","./selection/multiple","./selection/placeholder","./selection/allowClear","./selection/search","./selection/eventRelay","./utils","./translation","./diacritics","./data/select","./data/array","./data/ajax","./data/tags","./data/tokenizer","./data/minimumInputLength","./data/maximumInputLength","./data/maximumSelectionLength","./dropdown","./dropdown/search","./dropdown/hidePlaceholder","./dropdown/infiniteScroll","./dropdown/attachBody","./dropdown/minimumResultsForSearch","./dropdown/selectOnClose","./dropdown/closeOnSelect","./i18n/en"],function(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C){function D(){this.reset()}D.prototype.apply=function(l){if(l=a.extend(!0,{},this.defaults,l),null==l.dataAdapter){if(null!=l.ajax?l.dataAdapter=o:null!=l.data?l.dataAdapter=n:l.dataAdapter=m,l.minimumInputLength>0&&(l.dataAdapter=j.Decorate(l.dataAdapter,r)),l.maximumInputLength>0&&(l.dataAdapter=j.Decorate(l.dataAdapter,s)),l.maximumSelectionLength>0&&(l.dataAdapter=j.Decorate(l.dataAdapter,t)),l.tags&&(l.dataAdapter=j.Decorate(l.dataAdapter,p)),(null!=l.tokenSeparators||null!=l.tokenizer)&&(l.dataAdapter=j.Decorate(l.dataAdapter,q)),null!=l.query){var C=b(l.amdBase+"compat/query");l.dataAdapter=j.Decorate(l.dataAdapter,C)}if(null!=l.initSelection){var D=b(l.amdBase+"compat/initSelection");l.dataAdapter=j.Decorate(l.dataAdapter,D)}}if(null==l.resultsAdapter&&(l.resultsAdapter=c,null!=l.ajax&&(l.resultsAdapter=j.Decorate(l.resultsAdapter,x)),null!=l.placeholder&&(l.resultsAdapter=j.Decorate(l.resultsAdapter,w)),l.selectOnClose&&(l.resultsAdapter=j.Decorate(l.resultsAdapter,A))),null==l.dropdownAdapter){if(l.multiple)l.dropdownAdapter=u;else{var E=j.Decorate(u,v);l.dropdownAdapter=E}if(0!==l.minimumResultsForSearch&&(l.dropdownAdapter=j.Decorate(l.dropdownAdapter,z)),l.closeOnSelect&&(l.dropdownAdapter=j.Decorate(l.dropdownAdapter,B)),null!=l.dropdownCssClass||null!=l.dropdownCss||null!=l.adaptDropdownCssClass){var F=b(l.amdBase+"compat/dropdownCss");l.dropdownAdapter=j.Decorate(l.dropdownAdapter,F)}l.dropdownAdapter=j.Decorate(l.dropdownAdapter,y)}if(null==l.selectionAdapter){if(l.multiple?l.selectionAdapter=e:l.selectionAdapter=d,null!=l.placeholder&&(l.selectionAdapter=j.Decorate(l.selectionAdapter,f)),l.allowClear&&(l.selectionAdapter=j.Decorate(l.selectionAdapter,g)),l.multiple&&(l.selectionAdapter=j.Decorate(l.selectionAdapter,h)),null!=l.containerCssClass||null!=l.containerCss||null!=l.adaptContainerCssClass){var G=b(l.amdBase+"compat/containerCss");l.selectionAdapter=j.Decorate(l.selectionAdapter,G)}l.selectionAdapter=j.Decorate(l.selectionAdapter,i)}if("string"==typeof l.language)if(l.language.indexOf("-")>0){var H=l.language.split("-"),I=H[0];l.language=[l.language,I]}else l.language=[l.language];if(a.isArray(l.language)){var J=new k;l.language.push("en");for(var K=l.language,L=0;L<K.length;L++){var M=K[L],N={};try{N=k.loadPath(M)}catch(O){try{M=this.defaults.amdLanguageBase+M,N=k.loadPath(M)}catch(P){l.debug&&window.console&&console.warn&&console.warn('Select2: The language file for "'+M+'" could not be automatically loaded. A fallback will be used instead.');continue}}J.extend(N)}l.translations=J}else{var Q=k.loadPath(this.defaults.amdLanguageBase+"en"),R=new k(l.language);R.extend(Q),l.translations=R}return l},D.prototype.reset=function(){function b(a){function b(a){return l[a]||a}return a.replace(/[^\u0000-\u007E]/g,b)}function c(d,e){if(""===a.trim(d.term))return e;if(e.children&&e.children.length>0){for(var f=a.extend(!0,{},e),g=e.children.length-1;g>=0;g--){var h=e.children[g],i=c(d,h);null==i&&f.children.splice(g,1)}return f.children.length>0?f:c(d,f)}var j=b(e.text).toUpperCase(),k=b(d.term).toUpperCase();return j.indexOf(k)>-1?e:null}this.defaults={amdBase:"./",amdLanguageBase:"./i18n/",closeOnSelect:!0,debug:!1,dropdownAutoWidth:!1,escapeMarkup:j.escapeMarkup,language:C,matcher:c,minimumInputLength:0,maximumInputLength:0,maximumSelectionLength:0,minimumResultsForSearch:0,selectOnClose:!1,sorter:function(a){return a},templateResult:function(a){return a.text},templateSelection:function(a){return a.text},theme:"default",width:"resolve"}},D.prototype.set=function(b,c){var d=a.camelCase(b),e={};e[d]=c;var f=j._convertData(e);a.extend(this.defaults,f)};var E=new D;return E}),b.define("select2/options",["require","jquery","./defaults","./utils"],function(a,b,c,d){function e(b,e){if(this.options=b,null!=e&&this.fromElement(e),this.options=c.apply(this.options),e&&e.is("input")){var f=a(this.get("amdBase")+"compat/inputData");this.options.dataAdapter=d.Decorate(this.options.dataAdapter,f)}}return e.prototype.fromElement=function(a){var c=["select2"];null==this.options.multiple&&(this.options.multiple=a.prop("multiple")),null==this.options.disabled&&(this.options.disabled=a.prop("disabled")),null==this.options.language&&(a.prop("lang")?this.options.language=a.prop("lang").toLowerCase():a.closest("[lang]").prop("lang")&&(this.options.language=a.closest("[lang]").prop("lang"))),null==this.options.dir&&(a.prop("dir")?this.options.dir=a.prop("dir"):a.closest("[dir]").prop("dir")?this.options.dir=a.closest("[dir]").prop("dir"):this.options.dir="ltr"),a.prop("disabled",this.options.disabled),a.prop("multiple",this.options.multiple),a.data("select2Tags")&&(this.options.debug&&window.console&&console.warn&&console.warn('Select2: The `data-select2-tags` attribute has been changed to use the `data-data` and `data-tags="true"` attributes and will be removed in future versions of Select2.'),a.data("data",a.data("select2Tags")),a.data("tags",!0)),a.data("ajaxUrl")&&(this.options.debug&&window.console&&console.warn&&console.warn("Select2: The `data-ajax-url` attribute has been changed to `data-ajax--url` and support for the old attribute will be removed in future versions of Select2."),a.attr("ajax--url",a.data("ajaxUrl")),a.data("ajax--url",a.data("ajaxUrl")));var e={};e=b.fn.jquery&&"1."==b.fn.jquery.substr(0,2)&&a[0].dataset?b.extend(!0,{},a[0].dataset,a.data()):a.data();var f=b.extend(!0,{},e);f=d._convertData(f);for(var g in f)b.inArray(g,c)>-1||(b.isPlainObject(this.options[g])?b.extend(this.options[g],f[g]):this.options[g]=f[g]);return this},e.prototype.get=function(a){return this.options[a]},e.prototype.set=function(a,b){this.options[a]=b},e}),b.define("select2/core",["jquery","./options","./utils","./keys"],function(a,b,c,d){var e=function(a,c){null!=a.data("select2")&&a.data("select2").destroy(),this.$element=a,this.id=this._generateId(a),c=c||{},this.options=new b(c,a),e.__super__.constructor.call(this);var d=a.attr("tabindex")||0;a.data("old-tabindex",d),a.attr("tabindex","-1");var f=this.options.get("dataAdapter");this.dataAdapter=new f(a,this.options);var g=this.render();this._placeContainer(g);var h=this.options.get("selectionAdapter");this.selection=new h(a,this.options),this.$selection=this.selection.render(),this.selection.position(this.$selection,g);var i=this.options.get("dropdownAdapter");this.dropdown=new i(a,this.options),this.$dropdown=this.dropdown.render(),this.dropdown.position(this.$dropdown,g);var j=this.options.get("resultsAdapter");this.results=new j(a,this.options,this.dataAdapter),this.$results=this.results.render(),this.results.position(this.$results,this.$dropdown);var k=this;this._bindAdapters(),this._registerDomEvents(),this._registerDataEvents(),this._registerSelectionEvents(),this._registerDropdownEvents(),this._registerResultsEvents(),this._registerEvents(),this.dataAdapter.current(function(a){k.trigger("selection:update",{data:a})}),a.addClass("select2-hidden-accessible"),a.attr("aria-hidden","true"),this._syncAttributes(),a.data("select2",this)};return c.Extend(e,c.Observable),e.prototype._generateId=function(a){var b="";return b=null!=a.attr("id")?a.attr("id"):null!=a.attr("name")?a.attr("name")+"-"+c.generateChars(2):c.generateChars(4),b=b.replace(/(:|\.|\[|\]|,)/g,""),b="select2-"+b},e.prototype._placeContainer=function(a){a.insertAfter(this.$element);var b=this._resolveWidth(this.$element,this.options.get("width"));null!=b&&a.css("width",b)},e.prototype._resolveWidth=function(a,b){var c=/^width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/i;if("resolve"==b){var d=this._resolveWidth(a,"style");return null!=d?d:this._resolveWidth(a,"element")}if("element"==b){var e=a.outerWidth(!1);return 0>=e?"auto":e+"px"}if("style"==b){var f=a.attr("style");if("string"!=typeof f)return null;for(var g=f.split(";"),h=0,i=g.length;i>h;h+=1){var j=g[h].replace(/\s/g,""),k=j.match(c);if(null!==k&&k.length>=1)return k[1]}return null}return b},e.prototype._bindAdapters=function(){this.dataAdapter.bind(this,this.$container),this.selection.bind(this,this.$container),this.dropdown.bind(this,this.$container),this.results.bind(this,this.$container)},e.prototype._registerDomEvents=function(){var b=this;this.$element.on("change.select2",function(){b.dataAdapter.current(function(a){b.trigger("selection:update",{data:a})})}),this.$element.on("focus.select2",function(a){b.trigger("focus",a)}),this._syncA=c.bind(this._syncAttributes,this),this._syncS=c.bind(this._syncSubtree,this),this.$element[0].attachEvent&&this.$element[0].attachEvent("onpropertychange",this._syncA);var d=window.MutationObserver||window.WebKitMutationObserver||window.MozMutationObserver;null!=d?(this._observer=new d(function(c){a.each(c,b._syncA),a.each(c,b._syncS)}),this._observer.observe(this.$element[0],{attributes:!0,childList:!0,subtree:!1})):this.$element[0].addEventListener&&(this.$element[0].addEventListener("DOMAttrModified",b._syncA,!1),this.$element[0].addEventListener("DOMNodeInserted",b._syncS,!1),this.$element[0].addEventListener("DOMNodeRemoved",b._syncS,!1))},e.prototype._registerDataEvents=function(){var a=this;this.dataAdapter.on("*",function(b,c){a.trigger(b,c)})},e.prototype._registerSelectionEvents=function(){var b=this,c=["toggle","focus"];this.selection.on("toggle",function(){b.toggleDropdown()}),this.selection.on("focus",function(a){b.focus(a)}),this.selection.on("*",function(d,e){-1===a.inArray(d,c)&&b.trigger(d,e)})},e.prototype._registerDropdownEvents=function(){var a=this;this.dropdown.on("*",function(b,c){a.trigger(b,c)})},e.prototype._registerResultsEvents=function(){var a=this;this.results.on("*",function(b,c){a.trigger(b,c)})},e.prototype._registerEvents=function(){var a=this;this.on("open",function(){a.$container.addClass("select2-container--open")}),this.on("close",function(){a.$container.removeClass("select2-container--open")}),this.on("enable",function(){a.$container.removeClass("select2-container--disabled")}),this.on("disable",function(){a.$container.addClass("select2-container--disabled")}),this.on("blur",function(){a.$container.removeClass("select2-container--focus")}),this.on("query",function(b){a.isOpen()||a.trigger("open",{}),this.dataAdapter.query(b,function(c){a.trigger("results:all",{data:c,query:b})})}),this.on("query:append",function(b){this.dataAdapter.query(b,function(c){a.trigger("results:append",{data:c,query:b})})}),this.on("keypress",function(b){var c=b.which;a.isOpen()?c===d.ESC||c===d.TAB||c===d.UP&&b.altKey?(a.close(),b.preventDefault()):c===d.ENTER?(a.trigger("results:select",{}),b.preventDefault()):c===d.SPACE&&b.ctrlKey?(a.trigger("results:toggle",{}),b.preventDefault()):c===d.UP?(a.trigger("results:previous",{}),b.preventDefault()):c===d.DOWN&&(a.trigger("results:next",{}),b.preventDefault()):(c===d.ENTER||c===d.SPACE||c===d.DOWN&&b.altKey)&&(a.open(),b.preventDefault())})},e.prototype._syncAttributes=function(){this.options.set("disabled",this.$element.prop("disabled")),this.options.get("disabled")?(this.isOpen()&&this.close(),this.trigger("disable",{})):this.trigger("enable",{})},e.prototype._syncSubtree=function(a,b){var c=!1,d=this;if(!a||!a.target||"OPTION"===a.target.nodeName||"OPTGROUP"===a.target.nodeName){if(b)if(b.addedNodes&&b.addedNodes.length>0)for(var e=0;e<b.addedNodes.length;e++){var f=b.addedNodes[e];f.selected&&(c=!0)}else b.removedNodes&&b.removedNodes.length>0&&(c=!0);else c=!0;c&&this.dataAdapter.current(function(a){d.trigger("selection:update",{data:a})})}},e.prototype.trigger=function(a,b){var c=e.__super__.trigger,d={open:"opening",close:"closing",select:"selecting",unselect:"unselecting"};if(void 0===b&&(b={}),a in d){var f=d[a],g={prevented:!1,name:a,args:b};if(c.call(this,f,g),g.prevented)return void(b.prevented=!0)}c.call(this,a,b)},e.prototype.toggleDropdown=function(){this.options.get("disabled")||(this.isOpen()?this.close():this.open())},e.prototype.open=function(){this.isOpen()||this.trigger("query",{})},e.prototype.close=function(){this.isOpen()&&this.trigger("close",{})},e.prototype.isOpen=function(){return this.$container.hasClass("select2-container--open")},e.prototype.hasFocus=function(){return this.$container.hasClass("select2-container--focus")},e.prototype.focus=function(a){this.hasFocus()||(this.$container.addClass("select2-container--focus"),this.trigger("focus",{}))},e.prototype.enable=function(a){this.options.get("debug")&&window.console&&console.warn&&console.warn('Select2: The `select2("enable")` method has been deprecated and will be removed in later Select2 versions. Use $element.prop("disabled") instead.'),(null==a||0===a.length)&&(a=[!0]);var b=!a[0];this.$element.prop("disabled",b)},e.prototype.data=function(){this.options.get("debug")&&arguments.length>0&&window.console&&console.warn&&console.warn('Select2: Data can no longer be set using `select2("data")`. You should consider setting the value instead using `$element.val()`.');var a=[];return this.dataAdapter.current(function(b){a=b}),a},e.prototype.val=function(b){if(this.options.get("debug")&&window.console&&console.warn&&console.warn('Select2: The `select2("val")` method has been deprecated and will be removed in later Select2 versions. Use $element.val() instead.'),null==b||0===b.length)return this.$element.val();var c=b[0];a.isArray(c)&&(c=a.map(c,function(a){return a.toString()})),this.$element.val(c).trigger("change")},e.prototype.destroy=function(){this.$container.remove(),this.$element[0].detachEvent&&this.$element[0].detachEvent("onpropertychange",this._syncA),null!=this._observer?(this._observer.disconnect(),this._observer=null):this.$element[0].removeEventListener&&(this.$element[0].removeEventListener("DOMAttrModified",this._syncA,!1),this.$element[0].removeEventListener("DOMNodeInserted",this._syncS,!1),this.$element[0].removeEventListener("DOMNodeRemoved",this._syncS,!1)),this._syncA=null,this._syncS=null,this.$element.off(".select2"),this.$element.attr("tabindex",this.$element.data("old-tabindex")),this.$element.removeClass("select2-hidden-accessible"),this.$element.attr("aria-hidden","false"),this.$element.removeData("select2"),this.dataAdapter.destroy(),this.selection.destroy(),this.dropdown.destroy(),this.results.destroy(),this.dataAdapter=null,this.selection=null,this.dropdown=null,this.results=null;
},e.prototype.render=function(){var b=a('<span class="select2 select2-container"><span class="selection"></span><span class="dropdown-wrapper" aria-hidden="true"></span></span>');return b.attr("dir",this.options.get("dir")),this.$container=b,this.$container.addClass("select2-container--"+this.options.get("theme")),b.data("element",this.$element),b},e}),b.define("select2/compat/utils",["jquery"],function(a){function b(b,c,d){var e,f,g=[];e=a.trim(b.attr("class")),e&&(e=""+e,a(e.split(/\s+/)).each(function(){0===this.indexOf("select2-")&&g.push(this)})),e=a.trim(c.attr("class")),e&&(e=""+e,a(e.split(/\s+/)).each(function(){0!==this.indexOf("select2-")&&(f=d(this),null!=f&&g.push(f))})),b.attr("class",g.join(" "))}return{syncCssClasses:b}}),b.define("select2/compat/containerCss",["jquery","./utils"],function(a,b){function c(a){return null}function d(){}return d.prototype.render=function(d){var e=d.call(this),f=this.options.get("containerCssClass")||"";a.isFunction(f)&&(f=f(this.$element));var g=this.options.get("adaptContainerCssClass");if(g=g||c,-1!==f.indexOf(":all:")){f=f.replace(":all:","");var h=g;g=function(a){var b=h(a);return null!=b?b+" "+a:a}}var i=this.options.get("containerCss")||{};return a.isFunction(i)&&(i=i(this.$element)),b.syncCssClasses(e,this.$element,g),e.css(i),e.addClass(f),e},d}),b.define("select2/compat/dropdownCss",["jquery","./utils"],function(a,b){function c(a){return null}function d(){}return d.prototype.render=function(d){var e=d.call(this),f=this.options.get("dropdownCssClass")||"";a.isFunction(f)&&(f=f(this.$element));var g=this.options.get("adaptDropdownCssClass");if(g=g||c,-1!==f.indexOf(":all:")){f=f.replace(":all:","");var h=g;g=function(a){var b=h(a);return null!=b?b+" "+a:a}}var i=this.options.get("dropdownCss")||{};return a.isFunction(i)&&(i=i(this.$element)),b.syncCssClasses(e,this.$element,g),e.css(i),e.addClass(f),e},d}),b.define("select2/compat/initSelection",["jquery"],function(a){function b(a,b,c){c.get("debug")&&window.console&&console.warn&&console.warn("Select2: The `initSelection` option has been deprecated in favor of a custom data adapter that overrides the `current` method. This method is now called multiple times instead of a single time when the instance is initialized. Support will be removed for the `initSelection` option in future versions of Select2"),this.initSelection=c.get("initSelection"),this._isInitialized=!1,a.call(this,b,c)}return b.prototype.current=function(b,c){var d=this;return this._isInitialized?void b.call(this,c):void this.initSelection.call(null,this.$element,function(b){d._isInitialized=!0,a.isArray(b)||(b=[b]),c(b)})},b}),b.define("select2/compat/inputData",["jquery"],function(a){function b(a,b,c){this._currentData=[],this._valueSeparator=c.get("valueSeparator")||",","hidden"===b.prop("type")&&c.get("debug")&&console&&console.warn&&console.warn("Select2: Using a hidden input with Select2 is no longer supported and may stop working in the future. It is recommended to use a `<select>` element instead."),a.call(this,b,c)}return b.prototype.current=function(b,c){function d(b,c){var e=[];return b.selected||-1!==a.inArray(b.id,c)?(b.selected=!0,e.push(b)):b.selected=!1,b.children&&e.push.apply(e,d(b.children,c)),e}for(var e=[],f=0;f<this._currentData.length;f++){var g=this._currentData[f];e.push.apply(e,d(g,this.$element.val().split(this._valueSeparator)))}c(e)},b.prototype.select=function(b,c){if(this.options.get("multiple")){var d=this.$element.val();d+=this._valueSeparator+c.id,this.$element.val(d),this.$element.trigger("change")}else this.current(function(b){a.map(b,function(a){a.selected=!1})}),this.$element.val(c.id),this.$element.trigger("change")},b.prototype.unselect=function(a,b){var c=this;b.selected=!1,this.current(function(a){for(var d=[],e=0;e<a.length;e++){var f=a[e];b.id!=f.id&&d.push(f.id)}c.$element.val(d.join(c._valueSeparator)),c.$element.trigger("change")})},b.prototype.query=function(a,b,c){for(var d=[],e=0;e<this._currentData.length;e++){var f=this._currentData[e],g=this.matches(b,f);null!==g&&d.push(g)}c({results:d})},b.prototype.addOptions=function(b,c){var d=a.map(c,function(b){return a.data(b[0],"data")});this._currentData.push.apply(this._currentData,d)},b}),b.define("select2/compat/matcher",["jquery"],function(a){function b(b){function c(c,d){var e=a.extend(!0,{},d);if(null==c.term||""===a.trim(c.term))return e;if(d.children){for(var f=d.children.length-1;f>=0;f--){var g=d.children[f],h=b(c.term,g.text,g);h||e.children.splice(f,1)}if(e.children.length>0)return e}return b(c.term,d.text,d)?e:null}return c}return b}),b.define("select2/compat/query",[],function(){function a(a,b,c){c.get("debug")&&window.console&&console.warn&&console.warn("Select2: The `query` option has been deprecated in favor of a custom data adapter that overrides the `query` method. Support will be removed for the `query` option in future versions of Select2."),a.call(this,b,c)}return a.prototype.query=function(a,b,c){b.callback=c;var d=this.options.get("query");d.call(null,b)},a}),b.define("select2/dropdown/attachContainer",[],function(){function a(a,b,c){a.call(this,b,c)}return a.prototype.position=function(a,b,c){var d=c.find(".dropdown-wrapper");d.append(b),b.addClass("select2-dropdown--below"),c.addClass("select2-container--below")},a}),b.define("select2/dropdown/stopPropagation",[],function(){function a(){}return a.prototype.bind=function(a,b,c){a.call(this,b,c);var d=["blur","change","click","dblclick","focus","focusin","focusout","input","keydown","keyup","keypress","mousedown","mouseenter","mouseleave","mousemove","mouseover","mouseup","search","touchend","touchstart"];this.$dropdown.on(d.join(" "),function(a){a.stopPropagation()})},a}),b.define("select2/selection/stopPropagation",[],function(){function a(){}return a.prototype.bind=function(a,b,c){a.call(this,b,c);var d=["blur","change","click","dblclick","focus","focusin","focusout","input","keydown","keyup","keypress","mousedown","mouseenter","mouseleave","mousemove","mouseover","mouseup","search","touchend","touchstart"];this.$selection.on(d.join(" "),function(a){a.stopPropagation()})},a}),function(c){"function"==typeof b.define&&b.define.amd?b.define("jquery-mousewheel",["jquery"],c):"object"==typeof exports?module.exports=c:c(a)}(function(a){function b(b){var g=b||window.event,h=i.call(arguments,1),j=0,l=0,m=0,n=0,o=0,p=0;if(b=a.event.fix(g),b.type="mousewheel","detail"in g&&(m=-1*g.detail),"wheelDelta"in g&&(m=g.wheelDelta),"wheelDeltaY"in g&&(m=g.wheelDeltaY),"wheelDeltaX"in g&&(l=-1*g.wheelDeltaX),"axis"in g&&g.axis===g.HORIZONTAL_AXIS&&(l=-1*m,m=0),j=0===m?l:m,"deltaY"in g&&(m=-1*g.deltaY,j=m),"deltaX"in g&&(l=g.deltaX,0===m&&(j=-1*l)),0!==m||0!==l){if(1===g.deltaMode){var q=a.data(this,"mousewheel-line-height");j*=q,m*=q,l*=q}else if(2===g.deltaMode){var r=a.data(this,"mousewheel-page-height");j*=r,m*=r,l*=r}if(n=Math.max(Math.abs(m),Math.abs(l)),(!f||f>n)&&(f=n,d(g,n)&&(f/=40)),d(g,n)&&(j/=40,l/=40,m/=40),j=Math[j>=1?"floor":"ceil"](j/f),l=Math[l>=1?"floor":"ceil"](l/f),m=Math[m>=1?"floor":"ceil"](m/f),k.settings.normalizeOffset&&this.getBoundingClientRect){var s=this.getBoundingClientRect();o=b.clientX-s.left,p=b.clientY-s.top}return b.deltaX=l,b.deltaY=m,b.deltaFactor=f,b.offsetX=o,b.offsetY=p,b.deltaMode=0,h.unshift(b,j,l,m),e&&clearTimeout(e),e=setTimeout(c,200),(a.event.dispatch||a.event.handle).apply(this,h)}}function c(){f=null}function d(a,b){return k.settings.adjustOldDeltas&&"mousewheel"===a.type&&b%120===0}var e,f,g=["wheel","mousewheel","DOMMouseScroll","MozMousePixelScroll"],h="onwheel"in document||document.documentMode>=9?["wheel"]:["mousewheel","DomMouseScroll","MozMousePixelScroll"],i=Array.prototype.slice;if(a.event.fixHooks)for(var j=g.length;j;)a.event.fixHooks[g[--j]]=a.event.mouseHooks;var k=a.event.special.mousewheel={version:"3.1.12",setup:function(){if(this.addEventListener)for(var c=h.length;c;)this.addEventListener(h[--c],b,!1);else this.onmousewheel=b;a.data(this,"mousewheel-line-height",k.getLineHeight(this)),a.data(this,"mousewheel-page-height",k.getPageHeight(this))},teardown:function(){if(this.removeEventListener)for(var c=h.length;c;)this.removeEventListener(h[--c],b,!1);else this.onmousewheel=null;a.removeData(this,"mousewheel-line-height"),a.removeData(this,"mousewheel-page-height")},getLineHeight:function(b){var c=a(b),d=c["offsetParent"in a.fn?"offsetParent":"parent"]();return d.length||(d=a("body")),parseInt(d.css("fontSize"),10)||parseInt(c.css("fontSize"),10)||16},getPageHeight:function(b){return a(b).height()},settings:{adjustOldDeltas:!0,normalizeOffset:!0}};a.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})}),b.define("jquery.select2",["jquery","jquery-mousewheel","./select2/core","./select2/defaults"],function(a,b,c,d){if(null==a.fn.select2){var e=["open","close","destroy"];a.fn.select2=function(b){if(b=b||{},"object"==typeof b)return this.each(function(){var d=a.extend(!0,{},b);new c(a(this),d)}),this;if("string"==typeof b){var d,f=Array.prototype.slice.call(arguments,1);return this.each(function(){var c=a(this).data("select2");null==c&&window.console&&console.error&&console.error("The select2('"+b+"') method was called on an element that is not using Select2."),d=c[b].apply(c,f)}),a.inArray(b,e)>-1?this:d}throw new Error("Invalid arguments for Select2: "+b)}}return null==a.fn.select2.defaults&&(a.fn.select2.defaults=d),c}),{define:b.define,require:b.require}}(),c=b.require("jquery.select2");return a.fn.select2.amd=b,c});
$(function() {
    $('input[name=d_from], input[name=d_to]').datepicker({
        dateFormat: "yyyy-mm-dd"
    });

    $('form[name=categories-edit-stores] input[type=checkbox]').click(function() {
    	var self = $(this),
    		categoriesForm = $('form[name=categories-edit-stores]');

    	if(self.is(":checked") && self.attr("data-parent-id") != "0") {
    		categoriesForm.find('input[data-uid='+ self.attr("data-parent-id") +']').prop("checked", false).prop("checked", true);
    	} else if(!self.is(":checked") && self.attr("data-parent-id") != "0") {
    		var parentUncheked = true;

    		categoriesForm.find('input[data-parent-id='+ self.attr("data-parent-id") +']').each(function() {
    			if($(this).is(":checked")) {
    				parentUncheked = false;
    			}
    		});

    		if(parentUncheked) {
    			categoriesForm.find('input[data-uid='+ self.attr("data-parent-id") +']').prop("checked", false);
    		}
    	}
    });

	$(".select2-users").select2({
		ajax: {
			url: "/admin/users/list",
			type: 'post',
			dataType: 'json',
			delay: 250,
			data: function (params) {
				return {
					email: params.term
				};
			},
			processResults: function (data) {
				return {
					results: data
				};
			},
			cache: true
		},
		placeholder: "Выберите пользователя",
		minimumInputLength: 1
	});

	$( ".input-datepicker" ).datepicker({
		dateFormat: "yyyy-mm-dd"
	});

	$('#charity-checkbox-0').click( function () {
		var checked = this.checked;
		Array.from(document.getElementsByClassName("charity-checkbox")).forEach(
			function(element) {
				element.checked = checked;
			}
		);
	});

	$('.ajax-confirm').on('click',function(e) {
		e.preventDefault();
		$this=$(this);
		data={
			'question':$this.data('question')||'Вы увуренны?',
			'title':$this.data('title')||'Подтверждение действия',
			'callbackYes':function(){
				$this=$(this);
				$.post('/admin/stores/import-cat/id:'+$this.data('store'),function(data){
					if(data.error){
						notification.notifi({message:data.error,type:'err'})
					}else {
						location.reload();
					}
				},'json')
					.fail(function() {
						notification.notifi({message:"Ошибка передачи данных",type:'err'})
					});
			},
			'obj':$this
		};
		notification.confirm(data)
	})
});

/*$(function() {
	$('.ch_tree input').on('change',function(){
		$this=$(this)
		input=$this.parent().parent().find('input');
		input.prop('checked',$this.prop('checked'))
	})
});*/
$(function() {
	$('.get_admitad').on('click',function(e){
		e.preventDefault();
		href=this.href||"";

		$('.user_data').html("");
		ad=$('.admitad_data');
		ad.addClass('loading');
		ad.removeClass('normal_load');
		ad.text('');

		tr=ad.closest('tr');
		ids=[];
		for(var i=0;i<tr.length;i++){
			id=tr.eq(i).data('key');
			if(id)ids.push(id);
		}

		if(ids.length==0){
			ad.removeClass('loading');
			alert('Нет заказов для проверки');
			return;
		}

		$.post('/admin/payments/admitad-test',{'ids':ids,'update':(href.indexOf('update')>0?1:0)},function(data){
			ad=$('.admitad_data');
			ad.text('данные не найдены');
			ad.removeClass('loading');

			tr=ad.closest('tr');
			for(var i=0;i<tr.length;i++) {
				var item = tr.eq(i);
				id = item.data('key');
				if (!data[id]) {
					continue;
				}

				tds=item.find('.admitad_data');
				for(var j=0;j<tds.length;j++) {
					var td = tds.eq(j);
					key=td.data('col');
					if(data[id][key]){
						td.html(data[id][key]);
						td.addClass('normal_load');
					}
				}
			}

			if(data['user_data']){
				user=data['user_data'];
				user_data='<H2>Баланс пользователя '+user['email']+' ('+user['uid']+') обновлен</H2>';
				user_data+="<table class='table table-sum'>"
				user_data+="<tr>"
				user_data+="<th></th>";
				user_data+="<th>Старые данные</th>";
				user_data+="<th>Новые данные</th>";
				user_data+="</tr>"

				user_data+="<tr>"
				user_data+="<td>В ожидании (кол-во)</td>";
				user_data+="<td class='value'>"+user['old']['cnt_pending']+"</td>";
				user_data+="<td class='value'>"+user['new']['cnt_pending']+"</td>";
				user_data+="</tr>"

				user_data+="<tr>"
				user_data+="<td>В ожидании (сумма)</td>";
				user_data+="<td class='value'>"+user['old']['sum_pending']+"</td>";
				user_data+="<td class='value'>"+user['new']['sum_pending']+"</td>";
				user_data+="</tr>"

				user_data+="<tr>"
				user_data+="<td>Отклонено (кол-во)</td>";
				user_data+="<td class='value'>"+user['old']['cnt_declined']+"</td>";
				user_data+="<td class='value'>"+user['new']['cnt_declined']+"</td>";
				user_data+="</tr>"

				user_data+="<tr>"
				user_data+="<td>Отклонено (сумма)</td>";
				user_data+="<td class='value'>"+user['old']['sum_declined']+"</td>";
				user_data+="<td class='value'>"+user['new']['sum_declined']+"</td>";
				user_data+="</tr>"

				user_data+="<tr>"
				user_data+="<td>Подтверждено (кол-во)</td>";
				user_data+="<td class='value'>"+user['old']['cnt_confirmed']+"</td>";
				user_data+="<td class='value'>"+user['new']['cnt_confirmed']+"</td>";
				user_data+="</tr>"

				user_data+="<tr>"
				user_data+="<td>Подтверждено (сумма)</td>";
				user_data+="<td class='value'>"+user['old']['sum_confirmed']+"</td>";
				user_data+="<td class='value'>"+user['new']['sum_confirmed']+"</td>";
				user_data+="</tr>"

				user_data+="<tr>"
				user_data+="<td>Баланс (общий)</td>";
				user_data+="<td class='value'>"+user['old']['balans']+"</td>";
				user_data+="<td class='value'>"+user['new']['balans']+"</td>";
				user_data+="</tr>"

				user_data+="</table>"
				$('.user_data').html(user_data);
			}
		},'json').fail(function () {
			ad.removeClass('loading');
			alert('Ошибка обработки запроса')
		});

		return false;
	})
});
'use strict';

if (typeof mihaildev == "undefined" || !mihaildev) {
    var mihaildev = {};
    mihaildev.elFinder = {
        openManager: function(options){
            var params = "menubar=no,toolbar=no,location=no,directories=no,status=no,fullscreen=no";
            if(options.width == 'auto'){
                options.width = $(window).width()/1.5;
            }

            if(options.height == 'auto'){
                options.height = $(window).height()/1.5;
            }

            params = params + ",width=" + options.width;
            params = params + ",height=" + options.height;

            //console.log(params);
            var win = window.open(options.url, 'ElFinderManager' + options.id, params);
            win.focus()
        },
        functions: {},
        register: function(id, func){
            this.functions[id] = func;
        },
        callFunction: function(id, file){
            return this.functions[id](file, id);
        },
        functionReturnToInput: function(file, id){
            jQuery('#' + id).val(file.url);
            return true;
        }
    };

}



var megaslider = (function () {
  var slider_data = false;
  var container_id = "section#mega_slider";
  var parallax_group = false;
  var parallax_timer = false;
  var parallax_counter = 0;
  var parallax_d = 1;
  var mobile_mode = -1;
  var max_time_load_pic = 300;
  var mobile_size = 700;
  var render_slide_nom = 0;
  var tot_img_wait;
  var slides;
  var slide_select_box;
  var editor;
  var timeoutId;
  var scroll_period = 6000;

  var posArr = [
    'slider__text-lt', 'slider__text-ct', 'slider__text-rt',
    'slider__text-lc', 'slider__text-cc', 'slider__text-rc',
    'slider__text-lb', 'slider__text-cb', 'slider__text-rb',
  ];
  var pos_list = [
    'Лево верх', 'центр верх', 'право верх',
    'Лево центр', 'центр', 'право центр',
    'Лево низ', 'центр низ', 'право низ',
  ];
  var show_delay = [
    'show_no_delay',
    'show_delay_05',
    'show_delay_10',
    'show_delay_15',
    'show_delay_20',
    'show_delay_25',
    'show_delay_30'
  ];
  var hide_delay = [
    'hide_no_delay',
    'hide_delay_05',
    'hide_delay_10',
    'hide_delay_15',
    'hide_delay_20'
  ];
  var yes_no_arr = [
    'no',
    'yes'
  ];
  var yes_no_val = [
    '',
    'fixed__full-height'
  ];
  var btn_style = [
    'none',
    'bordo',
    'black',
    'blue',
    'dark-blue',
    'red',
    'orange',
    'green',
    'light-green',
    'dark-green',
    'pink',
    'yellow'
  ];
  var show_animations = [
    "not_animate",
    "bounceIn",
    "bounceInDown",
    "bounceInLeft",
    "bounceInRight",
    "bounceInUp",
    "fadeIn",
    "fadeInDown",
    "fadeInLeft",
    "fadeInRight",
    "fadeInUp",
    "flipInX",
    "flipInY",
    "lightSpeedIn",
    "rotateIn",
    "rotateInDownLeft",
    "rotateInUpLeft",
    "rotateInUpRight",
    "jackInTheBox",
    "rollIn",
    "zoomIn"
  ];

  var hide_animations = [
    "not_animate",
    "bounceOut",
    "bounceOutDown",
    "bounceOutLeft",
    "bounceOutRight",
    "bounceOutUp",
    "fadeOut",
    "fadeOutDown",
    "fadeOutLeft",
    "fadeOutRight",
    "fadeOutUp",
    "flipOutX",
    "lipOutY",
    "lightSpeedOut",
    "rotateOut",
    "rotateOutDownLeft",
    "rotateOutDownRight",
    "rotateOutUpLeft",
    "rotateOutUpRight",
    "hinge",
    "rollOut"
  ];
  var stTable;
  var paralaxTable;

  function initImageServerSelect(els) {
    if (els.length == 0)return;
    els.wrap('<div class="select_img">');
    els = els.parent();
    els.append('<button type="button" class="file_button"><i class="mce-ico mce-i-browse"></i></button>');
    /*els.find('button').on('click',function () {
     $('#roxyCustomPanel2').addClass('open')
     });*/
    for (var i = 0; i < els.length; i++) {
      var el = els.eq(i).find('input');
      if (!el.attr('id')) {
        el.attr('id', 'file_' + i + '_' + Date.now())
      }
      var t_id = el.attr('id');
      mihaildev.elFinder.register(t_id, function (file, id) {
        //$(this).val(file.url).trigger('change', [file, id]);
        $('#' + id).val(file.url).change();
        return true;
      });
    }
    ;

    $(document).on('click', '.file_button', function () {
      var $this = $(this).prev();
      var id = $this.attr('id');
      mihaildev.elFinder.openManager({
        "url": "/manager/elfinder?filter=image&callback=" + id + "&lang=ru",
        "width": "auto",
        "height": "auto",
        "id": id
      });
    });
  }

  function genInput(data) {
    var input = '<input class="' + (data.inputClass || '') + '" value="' + (data.value || '') + '">';
    if (data.label) {
      input = '<label><span>' + data.label + '</span>' + input + '</label>';
    }
    if (data.parent) {
      input = '<' + data.parent + '>' + input + '</' + data.parent + '>';
    }
    input = $(input);

    if (data.onChange) {
      var onChange;
      if (data.bind) {
        data.bind.input = input.find('input');
        onChange = data.onChange.bind(data.bind);
      } else {
        onChange = data.onChange.bind(input.find('input'));
      }
      input.find('input').on('change', onChange)
    }
    return input;
  }

  function genSelect(data) {
    var input = $('<select/>');

    var el = slider_data[0][data.gr];
    if (data.index !== false) {
      el = el[data.index];
    }

    if (el[data.param]) {
      data.value = el[data.param];
    } else {
      data.value = 0;
    }

    if (data.start_option) {
      input.append(data.start_option)
    }

    for (var i = 0; i < data.list.length; i++) {
      var val;
      var txt = data.list[i];
      if (data.val_type == 0) {
        val = data.list[i];
      } else if (data.val_type == 1) {
        val = i;
      } else if (data.val_type == 2) {
        //val=data.val_list[i];
        val = i;
        txt = data.val_list[i];
      }

      var sel = (val == data.value ? 'selected' : '');
      if (sel == 'selected') {
        input.attr('t_val', data.list[i]);
      }
      var option = '<option value="' + val + '" ' + sel + '>' + txt + '</option>';
      if (data.val_type == 2) {
        option = $(option).attr('code', data.list[i]);
      }
      input.append(option)
    }

    input.on('change', function () {
      data = this;
      var val = data.el.val();
      var sl_op = data.el.find('option[value=' + val + ']');
      var cls = sl_op.text();
      var ch = sl_op.attr('code');
      if (!ch)ch = cls;
      if (data.index !== false) {
        slider_data[0][data.gr][data.index][data.param] = val;
      } else {
        slider_data[0][data.gr][data.param] = val;
      }

      data.obj.removeClass(data.prefix + data.el.attr('t_val'));
      data.obj.addClass(data.prefix + ch);
      data.el.attr('t_val', ch);

      $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
    }.bind({
      el: input,
      obj: data.obj,
      gr: data.gr,
      index: data.index,
      param: data.param,
      prefix: data.prefix || ''
    }));

    if (data.parent) {
      var parent = $('<' + data.parent + '/>');
      parent.append(input);
      return parent;
    }
    return input;
  }

  function getSelAnimationControll(data) {
    var anim_sel = [];
    var out;

    if (data.type == 0) {
      anim_sel.push('<span>Show animation</span>');
    }
    anim_sel.push(genSelect({
      list: show_animations,
      val_type: 0,
      obj: data.obj,
      gr: data.gr,
      index: data.index,
      param: 'show_animation',
      prefix: 'slide_',
      parent: data.parent
    }));
    if (data.type == 0) {
      anim_sel.push('<span>Show delay</span>');
    }
    anim_sel.push(genSelect({
      list: show_delay,
      val_type: 1,
      obj: data.obj,
      gr: data.gr,
      index: data.index,
      param: 'show_delay',
      prefix: 'slide_',
      parent: data.parent
    }));

    if (data.type == 0) {
      anim_sel.push('<br/>');
      anim_sel.push('<span>Hide animation</span>');
    }
    anim_sel.push(genSelect({
      list: hide_animations,
      val_type: 0,
      obj: data.obj,
      gr: data.gr,
      index: data.index,
      param: 'hide_animation',
      prefix: 'slide_',
      parent: data.parent
    }));
    if (data.type == 0) {
      anim_sel.push('<span>Hide delay</span>');
    }
    anim_sel.push(genSelect({
      list: hide_delay,
      val_type: 1,
      obj: data.obj,
      gr: data.gr,
      index: data.index,
      param: 'hide_delay',
      prefix: 'slide_',
      parent: data.parent
    }));

    if (data.type == 0) {
      out = $('<div class="anim_sel"/>');
      out.append(anim_sel);
    }
    if (data.type == 1) {
      out = anim_sel;
    }

    return out;
  }

  function init_editor() {
    $('#w1').remove();
    $('#w1_button').remove();
    slider_data[0].mobile = slider_data[0].mobile.split('?')[0];

    var el = $('#mega_slider_controle');
    var btns_box = $('<div class="btn_box"/>');

    el.append('<h2>Управление</h2>');
    el.append($('<textarea/>', {
      text: JSON.stringify(slider_data[0]),
      id: 'slide_data',
      name: editor
    }));

    var btn = $('<button class=""/>').text("Активировать слайд");
    btns_box.append(btn);
    btn.on('click', function (e) {
      e.preventDefault();
      $('#mega_slider .slide').eq(0).addClass('slider-active');
      $('#mega_slider .slide').eq(0).removeClass('hide_slide');
    });

    var btn = $('<button class=""/>').text("Деактивировать слайд");
    btns_box.append(btn);
    btn.on('click', function (e) {
      e.preventDefault();
      $('#mega_slider .slide').eq(0).removeClass('slider-active');
      $('#mega_slider .slide').eq(0).addClass('hide_slide');
    });
    el.append(btns_box);

    el.append('<h2>Общие параметры</h2>');
    el.append(genInput({
      value: slider_data[0].mobile,
      label: "Слайд для телефона",
      inputClass: "fileSelect",
      onChange: function (e) {
        e.preventDefault();
        slider_data[0].mobile = $(this).val()
        $('.mob_bg').eq(0).css('background-image', 'url(' + slider_data[0].mobile + ')');
        $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
      }
    }));

    el.append(genInput({
      value: slider_data[0].fon,
      label: "Осноной фон",
      inputClass: "fileSelect",
      onChange: function (e) {
        e.preventDefault();
        slider_data[0].fon = $(this).val()
        $('#mega_slider .slide').eq(0).css('background-image', 'url(' + slider_data[0].fon + ')')
        $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
      }
    }));

    var btn_ch = $('<div class="btns"/>');
    btn_ch.append('<h3>Кнопка перехода(для ПК версии)</h3>');
    btn_ch.append(genInput({
      value: slider_data[0].button.text,
      label: "Текст",
      onChange: function (e) {
        e.preventDefault();
        slider_data[0].button.text = $(this).val();
        $('#mega_slider .slider__href').eq(0).text(slider_data[0].button.text);
        $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
      },
    }));

    var but_sl = $('#mega_slider .slider__href').eq(0);
    btn_ch.append(genInput({
      value: slider_data[0].button.href,
      label: "Ссылка",
      onChange: function (e) {
        e.preventDefault();
        slider_data[0].button.href = $(this).val();
        $('#mega_slider .slider__href').eq(0).attr('href',slider_data[0].button.href);
        $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
      },
    }));

    btn_ch.append('<br/>');
    var wrap_lab = $('<label/>');
    btn_ch.append(wrap_lab);
    wrap_lab.append('<span>Оформление кнопки</span>');
    wrap_lab.append(genSelect({
      list: btn_style,
      val_type: 0,
      obj: but_sl,
      gr: 'button',
      index: false,
      param: 'color'
    }));

    btn_ch.append('<br/>');
    wrap_lab = $('<label/>');
    btn_ch.append(wrap_lab);
    wrap_lab.append('<span>Положение кнопки</span>');
    wrap_lab.append(genSelect({
      list: posArr,
      val_list: pos_list,
      val_type: 2,
      obj: but_sl.parent().parent(),
      gr: 'button',
      index: false,
      param: 'pos'
    }));

    btn_ch.append(getSelAnimationControll({
      type: 0,
      obj: but_sl.parent(),
      gr: 'button',
      index: false
    }));
    el.append(btn_ch);

    var layer = $('<div class="fixed_layer"/>');
    layer.append('<h2>Статические слои</h2>');
    var th = "<th>№</th>" +
      "<th>Картинка</th>" +
      "<th>Положение</th>" +
      "<th>Слой на всю высоту</th>" +
      "<th>Анимация появления</th>" +
      "<th>Задержка появления</th>" +
      "<th>Анимация исчезновения</th>" +
      "<th>Задержка исчезновения</th>" +
      "<th>Действие</th>";
    stTable = $('<table border="1"><tr>' + th + '</tr></table>');
    //если есть паралакс слои заполняем
    var data = slider_data[0].fixed;
    if (data && data.length > 0) {
      for (var i = 0; i < data.length; i++) {
        addTrStatic(data[i]);
      }
    }
    layer.append(stTable);
    var addBtn = $('<button/>', {
      text: "Добавить слой"
    });
    addBtn.on('click', function (e) {
      e.preventDefault();
      data = addTrStatic(false);
      initImageServerSelect(data.editor.find('.fileSelect'));
      $('textarea#slide_data').text(JSON.stringify(this.slider_data[0]))
    }.bind({
      slider_data: slider_data
    }));
    layer.append(addBtn);
    el.append(layer);

    var layer = $('<div class="paralax_layer"/>');
    layer.append('<h2>Паралакс слои</h2>');
    var th = "<th>№</th>" +
      "<th>Картинка</th>" +
      "<th>Положение</th>" +
      "<th>Удаленность (целое положительное число)</th>" +
      "<th>Действие</th>";

    paralaxTable = $('<table border="1"><tr>' + th + '</tr></table>');
    //если есть паралакс слои заполняем
    var data = slider_data[0].paralax;
    if (data && data.length > 0) {
      for (var i = 0; i < data.length; i++) {
        addTrParalax(data[i]);
      }
    }
    layer.append(paralaxTable);
    var addBtn = $('<button/>', {
      text: "Добавить слой"
    });
    addBtn.on('click', function (e) {
      e.preventDefault();
      data = addTrParalax(false);
      initImageServerSelect(data.editor.find('.fileSelect'));
      $('textarea#slide_data').text(JSON.stringify(this.slider_data[0]))
    }.bind({
      slider_data: slider_data
    }));

    layer.append(addBtn);
    el.append(layer);

    initImageServerSelect(el.find('.fileSelect'));
  }

  function addTrStatic(data) {
    var i = stTable.find('tr').length - 1;
    if (!data) {
      data = {
        "img": "",
        "full_height": 0,
        "pos": 0,
        "show_delay": 1,
        "show_animation": "lightSpeedIn",
        "hide_delay": 1,
        "hide_animation": "bounceOut"
      };
      slider_data[0].fixed.push(data);
      var fix = $('#mega_slider .fixed_group');
      addStaticLayer(data, fix, true);
    }
    ;

    var tr = $('<tr/>');
    tr.append('<td class="td_counter"/>');
    tr.append(genInput({
      value: data.img,
      label: false,
      parent: 'td',
      inputClass: "fileSelect",
      bind: {
        gr: 'fixed',
        index: i,
        param: 'img',
        obj: $('#mega_slider .fixed_group .fixed__layer').eq(i).find('.animation_layer'),
      },
      onChange: function (e) {
        e.preventDefault();
        var data = this;
        data.obj.css('background-image', 'url(' + data.input.val() + ')');
        slider_data[0].fixed[data.index].img = data.input.val();
        $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
      }
    }));
    tr.append(genSelect({
      list: posArr,
      val_list: pos_list,
      val_type: 2,
      obj: $('#mega_slider .fixed_group .fixed__layer').eq(i),
      gr: 'fixed',
      index: i,
      param: 'pos',
      parent: 'td',
    }));
    tr.append(genSelect({
      list: yes_no_val,
      val_list: yes_no_arr,
      val_type: 2,
      obj: $('#mega_slider .fixed_group .fixed__layer').eq(i),
      gr: 'fixed',
      index: i,
      param: 'full_height',
      parent: 'td',
    }));
    tr.append(getSelAnimationControll({
      type: 1,
      obj: $('#mega_slider .fixed_group .fixed__layer').eq(i).find('.animation_layer'),
      gr: 'fixed',
      index: i,
      parent: 'td'
    }));
    var delBtn = $('<button/>', {
      text: "Удалить"
    });
    delBtn.on('click', function (e) {
      e.preventDefault();
      var $this = $(this.el);
      i = $this.closest('tr').index() - 1;
      $('#mega_slider .fixed_group .fixed__layer').eq(i).remove(); //удаляем слой на слайдере
      $this.closest('tr').remove(); //удаляем строку в таблице
      this.slider_data[0].fixed.splice(i, 1); //удаляем из конфига слайда
      $('textarea#slide_data').text(JSON.stringify(this.slider_data[0]))
    }.bind({
      el: delBtn,
      slider_data: slider_data
    }));
    var delBtnTd = $('<td/>').append(delBtn);
    tr.append(delBtnTd);
    stTable.append(tr)

    return {
      editor: tr,
      data: data
    }
  }

  function addTrParalax(data) {
    var i = paralaxTable.find('tr').length - 1;
    if (!data) {
      data = {
        "img": "",
        "z": 1
      };
      slider_data[0].paralax.push(data);
      var paralax_gr = $('#mega_slider .parallax__group');
      addParalaxLayer(data, paralax_gr);
    }
    ;
    var tr = $('<tr/>');
    tr.append('<td class="td_counter"/>');
    tr.append(genInput({
      value: data.img,
      label: false,
      parent: 'td',
      inputClass: "fileSelect",
      bind: {
        index: i,
        param: 'img',
        obj: $('#mega_slider .parallax__group .parallax__layer').eq(i).find('span'),
      },
      onChange: function (e) {
        e.preventDefault();
        var data = this;
        data.obj.css('background-image', 'url(' + data.input.val() + ')');
        slider_data[0].paralax[data.index].img = data.input.val();
        $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
      }
    }));
    tr.append(genSelect({
      list: posArr,
      val_list: pos_list,
      val_type: 2,
      obj: $('#mega_slider .parallax__group .parallax__layer').eq(i).find('span'),
      gr: 'paralax',
      index: i,
      param: 'pos',
      parent: 'td',
      start_option: '<option value="" code="">на весь экран</option>'
    }));
    tr.append(genInput({
      value: data.z,
      label: false,
      parent: 'td',
      bind: {
        index: i,
        param: 'img',
        obj: $('#mega_slider .parallax__group .parallax__layer').eq(i),
      },
      onChange: function (e) {
        e.preventDefault();
        var data = this;
        data.obj.attr('z', data.input.val());
        slider_data[0].paralax[data.index].z = data.input.val();
        $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
      }
    }));

    var delBtn = $('<button/>', {
      text: "Удалить"
    });
    delBtn.on('click', function (e) {
      e.preventDefault();
      var $this = $(this.el);
      i = $this.closest('tr').index() - 1;
      $('#mega_slider .fixed_group .fixed__layer').eq(i).remove(); //удаляем слой на слайдере
      $this.closest('tr').remove(); //удаляем строку в таблице
      this.slider_data[0].paralax.splice(i, 1); //удаляем из конфига слайда
      $('textarea#slide_data').text(JSON.stringify(this.slider_data[0]))
    }.bind({
      el: delBtn,
      slider_data: slider_data
    }));
    var delBtnTd = $('<td/>').append(delBtn);
    tr.append(delBtnTd);
    paralaxTable.append(tr)

    return {
      editor: tr,
      data: data
    }
  }

  function add_animation(el, data) {
    var out = $('<div/>', {
      'class': 'animation_layer'
    });

    if (typeof(data.show_delay) != 'undefined') {
      out.addClass(show_delay[data.show_delay]);
      if (data.show_animation) {
        out.addClass('slide_' + data.show_animation);
      }
    }

    if (typeof(data.hide_delay) != 'undefined') {
      out.addClass(hide_delay[data.hide_delay]);
      if (data.hide_animation) {
        out.addClass('slide_' + data.hide_animation);
      }
    }

    el.append(out);
    return el;
  }

  function generate_slide(data) {
    var slide = $('<div class="slide"/>');

    var mob_bg = $('<a class="mob_bg" href="' + data.button.href + '"/>');
    mob_bg.css('background-image', 'url(' + data.mobile + ')')

    slide.append(mob_bg);
    if (mobile_mode) {
      return slide;
    }

    //если есть фон то заполняем
    if (data.fon) {
      slide.css('background-image', 'url(' + data.fon + ')')
    }

    //если есть паралакс слои заполняем
    if (data.paralax && data.paralax.length > 0) {
      var paralax_gr = $('<div class="parallax__group"/>');
      for (var i = 0; i < data.paralax.length; i++) {
        addParalaxLayer(data.paralax[i], paralax_gr)
      }
      slide.append(paralax_gr)
    }

    var fix = $('<div class="fixed_group"/>');
    for (var i = 0; i < data.fixed.length; i++) {
      addStaticLayer(data.fixed[i], fix)
    }

    var dop_blk = $("<div class='fixed__layer'/>");
    dop_blk.addClass(posArr[data.button.pos]);
    var but = $("<a class='slider__href'/>");
    but.attr('href', data.button.href);
    but.text(data.button.text);
    but.addClass(data.button.color);
    dop_blk = add_animation(dop_blk, data.button);
    dop_blk.find('div').append(but);
    fix.append(dop_blk);

    slide.append(fix);
    return slide;
  }

  function addParalaxLayer(data, paralax_gr) {
    var parallax_layer = $('<div class="parallax__layer"\>');
    parallax_layer.attr('z', data.z || i * 10);
    var dop_blk = $("<span class='slider__text'/>");
    if (data.pos) {
      dop_blk.addClass(posArr[data.pos]);
    }
    dop_blk.css('background-image', 'url(' + data.img + ')');
    parallax_layer.append(dop_blk);
    paralax_gr.append(parallax_layer);
  }

  function addStaticLayer(data, fix, befor_button) {
    var dop_blk = $("<div class='fixed__layer'/>");
    dop_blk.addClass(posArr[data.pos]);
    if (data.full_height) {
      dop_blk.addClass('fixed__full-height');
    }
    dop_blk = add_animation(dop_blk, data);
    dop_blk.find('.animation_layer').css('background-image', 'url(' + data.img + ')');

    if (befor_button) {
      fix.find('.slider__href').closest('.fixed__layer').before(dop_blk)
    } else {
      fix.append(dop_blk)
    }
  }

  function next_slide() {
    if ($('#mega_slider').hasClass('stop_slide'))return;

    var slide_points = $('.slide_select_box .slide_select')
    var slide_cnt = slide_points.length;
    var active = $('.slide_select_box .slider-active').index() + 1;
    if (active >= slide_cnt)active = 0;
    slide_points.eq(active).click();

    timeoutId=setTimeout(next_slide, scroll_period);
  }

  function img_to_load(src) {
    var img = $('<img/>');
    img.on('load', function () {
      tot_img_wait--;

      if (tot_img_wait == 0) {

        slides.append(generate_slide(slider_data[render_slide_nom]));
        slide_select_box.find('li').eq(render_slide_nom).removeClass('disabled');

        if (render_slide_nom == 0) {
          slides.find('.slide')
            .addClass('first_show')
            .addClass('slider-active');
          slide_select_box.find('li').eq(0).addClass('slider-active');

          if (!editor) {
            if(timeoutId)clearTimeout(timeoutId);
            timeoutId=setTimeout(function () {
              $(this).find('.first_show').removeClass('first_show');
            }.bind(slides), scroll_period);
          }

          if (mobile_mode === false) {
            parallax_group = $(container_id + ' .slider-active .parallax__group>*');
            parallax_counter = 0;
            parallax_timer = setInterval(render, 100);
          }

          if (editor) {
            init_editor()
          } else {
            if(timeoutId)clearTimeout(timeoutId);
            timeoutId = setTimeout(next_slide, scroll_period);

            $('.slide_select_box').on('click', '.slide_select', function () {
              var $this = $(this);
              if ($this.hasClass('slider-active'))return;

              var index = $this.index();
              $('.slide_select_box .slider-active').removeClass('slider-active');
              $this.addClass('slider-active');

              $(container_id + ' .slide.slider-active').removeClass('slider-active');
              $(container_id + ' .slide').eq(index).addClass('slider-active');

              parallax_group = $(container_id + ' .slider-active .parallax__group>*');
            });

            $('#mega_slider').hover(function () {
              if(timeoutId)clearTimeout(timeoutId);
              $('#mega_slider').addClass('stop_slide');
            }, function () {
              timeoutId = setTimeout(next_slide, scroll_period);
              $('#mega_slider').removeClass('stop_slide');
            });
          }
        }

        render_slide_nom++;
        if (render_slide_nom < slider_data.length) {
          load_slide_img()
        }
      }
    }).on('error', function () {
      tot_img_wait--;
    });
    img.prop('src', src);
  }

  function load_slide_img() {
    var data = slider_data[render_slide_nom];
    tot_img_wait = 1;

    if (mobile_mode === false) {
      tot_img_wait++;
      img_to_load(data.fon);
      //если есть паралакс слои заполняем
      if (data.paralax && data.paralax.length > 0) {
        tot_img_wait += data.paralax.length;
        for (var i = 0; i < data.paralax.length; i++) {
          img_to_load(data.paralax[i].img)
        }
      }
      if (data.fixed && data.fixed.length > 0) {
        tot_img_wait += data.fixed.length;
        for (var i = 0; i < data.fixed.length; i++) {
          img_to_load(data.fixed[i].img)
        }
      }
    }

    img_to_load(data.mobile);
  }

  function start_init_slide(data) {
    var n = performance.now();
    var img = $('<img/>');
    img.attr('time', n);

    function on_img_load() {
      var n = performance.now();
      img = $(this);
      n = n - parseInt(img.attr('time'));
      if (n > max_time_load_pic) {
        mobile_mode = true;
      } else {
        var max_size = (screen.height > screen.width ? screen.height : screen.width);
        if (max_size < mobile_size) {
          mobile_mode = true;
        } else {
          mobile_mode = false;
        }
      }
      if (mobile_mode == true) {
        $(container_id).addClass('mobile_mode')
      }
      render_slide_nom = 0;
      load_slide_img();
      $('.sk-folding-cube').remove();
    };

    img.on('load', on_img_load());
    if (slider_data.length > 0) {
      slider_data[0].mobile = slider_data[0].mobile + '?r=' + Math.random();
      img.prop('src', slider_data[0].mobile);
    } else {
      on_img_load().bind(img);
    }
  }

  function init(data, editor_init) {
    slider_data = data;
    editor = editor_init;
    //находим контейнер и очищаем его
    var container = $(container_id);
    container.html('');

    //созжаем базовые контейнеры для самих слайдов и для переключателей
    slides = $('<div/>', {
      'class': 'slides'
    });
    var slide_control = $('<div/>', {
      'class': 'slide_control'
    });
    slide_select_box = $('<ul/>', {
      'class': 'slide_select_box'
    });

    //добавляем индикатор загрузки
    var l = '<div class="sk-folding-cube">' +
      '<div class="sk-cube1 sk-cube"></div>' +
      '<div class="sk-cube2 sk-cube"></div>' +
      '<div class="sk-cube4 sk-cube"></div>' +
      '<div class="sk-cube3 sk-cube"></div>' +
      '</div>';
    container.html(l);


    start_init_slide(data[0]);

    //генерируем кнопки и слайды
    for (var i = 0; i < data.length; i++) {
      //slides.append(generate_slide(data[i]));
      slide_select_box.append('<li class="slide_select disabled"/>')
    }

    /*slides.find('.slide').eq(0)
     .addClass('slider-active')
     .addClass('first_show');
     slide_control.find('li').eq(0).addClass('slider-active');*/

    container.append(slides);
    slide_control.append(slide_select_box);
    container.append(slide_control);


  }

  function render() {
    if (!parallax_group)return false;
    var parallax_k = (parallax_counter - 10) / 2;

    for (var i = 0; i < parallax_group.length; i++) {
      var el = parallax_group.eq(i);
      var j = el.attr('z');
      var tr = 'rotate3d(0.1,0.8,0,' + (parallax_k) + 'deg) scale(' + (1 + j * 0.5) + ') translateZ(-' + (10 + j * 20) + 'px)';
      el.css('transform', tr)
    }
    parallax_counter += parallax_d * 0.1;
    if (parallax_counter >= 20)parallax_d = -parallax_d;
    if (parallax_counter <= 0)parallax_d = -parallax_d;
  }

  initImageServerSelect($('.fileSelect'));

  return {
    init: init
  };
}());

;(function($){

  function ajax_save(element){
    this.init(element);
  };

  function clearClass(){
    var options=this;
    options.this.parent().removeClass('ajaxSavingFailed');
    options.this.parent().removeClass('ajaxSavingOk');
  }

  ajax_save.prototype.init=function(element){
    tagName=element.tagName.toLowerCase();
    element=$(element);
    if(tagName=="input" || tagName=="select"){
      obj=element;
    }else{
      obj=element.find('input,select');
    }

    post_url=element.attr('save_url');
    uid=element.attr('uid');

    for(var i=0;i<obj.length;i++){
      var options={
        url:post_url,
        id:uid,
        this:obj.eq(i)
      };

      options.this
        .off('change')
        .on('change',function(){
        var options=this;
        var val=options.this.val();
        var type=options.this.attr('type');
        if(type && type.toLowerCase()=='checkbox'){
          if(!options.this.prop('checked')){
            val=0;
          }
        }
        var post={
          id:options.id,
          value:val,
          name:options.this.attr('name')
        };

        options.this.parent().addClass('ajaxInSaving');
        $.post(options.url,post,function(){
          var options=this;
          options.this.parent().removeClass('ajaxInSaving');
          options.this.parent().addClass('ajaxSavingOk');
          setTimeout(clearClass.bind(options),3000)
        }.bind(options)).fail(function(){
          var options=this;
          options.this.parent().removeClass('ajaxInSaving');
          options.this.parent().addClass('ajaxSavingFailed');
          setTimeout(clearClass.bind(options),4000)
        }.bind(options))
      }.bind(options))
    }
  };

  $.fn.ajax_save=function(){
    $(this).each(function(){
      new ajax_save(this);
    });
    return this;
  }

})(jQuery);
$('.ajax_save').ajax_save();
;
$(function() {
  function onRemove(){
    $this=$(this);
    post={
      id:$this.attr('uid'),
      type:$this.attr('mode')
    };
    $.post($this.attr('url'),post,function(data){
      if(data && data=='err'){
        msg=$this.data('remove-error');
        if(!msg){
          msg='Невозможно удалить элемент';
        }
        notification.notifi({message:msg,type:'err'});
        return;
      }

      mode=$this.attr('mode');
      if(!mode){
        mode='rm';
      }

      if(mode=='rm') {
        rm = $this.closest('.to_remove');
        rm_class = rm.attr('rm_class');
        if (rm_class) {
          $(rm_class).remove();
        }

        rm.remove();
        notification.notifi({message:'Успешное удаление.',type:'info'})
      }
      if(mode=='reload'){
        location.reload();
        location.href=location.href;
      }
    }).fail(function(){
      notification.notifi({message:'Ошибка удалния',type:'err'});
    })
  }

  $('body').on('click','.ajax_remove',function(){
    notification.confirm({
      callbackYes:onRemove,
      obj:$(this),
      notyfy_class: "notify_box-alert"
    })
  });

});


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
$(function() {

  function update(data){
    $this=$(this);
    mode=$this.attr('mode');
    if(mode=='rate'){
      $parent=$this.closest('.acordion_content');
      $parent=$parent.find('table');
      data=$(data);
      data.ajax_save();
      $parent.append(data)
    }

    if(mode=='tariff'){
      $parent=$this.closest('.acordion_content');
      data=$(data);
      data.find('.ajax_save').ajax_save();
      $parent.append(data)
    }

    if(mode=='action'){
      $parent=$this.closest('.cpa_box');
      data=$(data);
      data.find('.ajax_save').ajax_save();
      $parent.append(data)
    }

    if(mode=='cpa'){
      data=JSON.parse(data);

      $parent=$this.closest('.tarif_select_blk');

      $parent.prepend(data['tab_head_suf']);
      $parent.find('.tab_control')
        .append(data['tab_head_but'])
        .ajax_save();

      data=$(data['tab_body']);
      data.find('.ajax_save').ajax_save();
      $parent
        .find('.content_tab')
        .append(data)
    }
  }

  $('body').on('click','.add_shop_element',function(){
    $this=$(this);
    post={
      code:$this.attr('code'),
      parent:$this.attr('parent'),
      type:$this.attr('mode')
    };
    updateElement=update.bind($this);
    $.post("/admin/stores/ajax_insert/"+$this.attr('mode'),post,updateElement).fail(function() {
      alert( "Ошибка добавления" );
    })
  });

  $('body').on('click','.cpa_box_change_store', function(){
    $('.edit_blk_store').toggleClass('hidden');
  })
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxhbmd1YWdlLmpzIiwianF1ZXJ5Lm1lbnUtYWltLmpzIiwiY2lyY2xlcy5taW4uanMiLCJkYXRlcGlja2VyLmpzIiwianF1ZXJ5Lm5vdHkucGFja2FnZWQubWluLmpzIiwibWFpbi5qcyIsImpxdWVyeS5tb2NramF4LmpzIiwianF1ZXJ5LmF1dG9jb21wbGV0ZS5qcyIsInNlbGVjdDIuZnVsbC5taW4uanMiLCJtYWluX2FkbWluLmpzIiwic2xpZGVyLmpzIiwiYWpheF9zYXZlLmpzIiwiYWpheF9yZW1vdmUuanMiLCJub3RpZmljYXRpb24uanMiLCJzdG9yZXMuanMiLCJqcXVlcnkuYWpheEZvcm0uanMiLCJmb3JfYWxsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNub0RBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4bEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzE5QkE7QUFDQTtBQUNBO0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcmdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBsZyA9IChmdW5jdGlvbigpIHtcbiAgdmFyIGxhbmc9e307XG4gIHVybD0nL2xhbmd1YWdlLycrZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmxhbmcrJy5qc29uJztcbiAgJC5nZXQodXJsLGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgLy9jb25zb2xlLmxvZyhkYXRhKTtcbiAgICBmb3IodmFyIGluZGV4IGluIGRhdGEpIHtcbiAgICAgIGRhdGFbaW5kZXhdPWNsZWFyVmFyKGRhdGFbaW5kZXhdKTtcbiAgICB9XG4gICAgbGFuZz1kYXRhO1xuICAgIHZhciBldmVudCA9IG5ldyBDdXN0b21FdmVudChcImxhbmd1YWdlX2xvYWRlZFwiKTtcbiAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAvL2NvbnNvbGUubG9nKGRhdGEsIGV2ZW50KTtcbiAgfSwnanNvbicpO1xuXG4gIGZ1bmN0aW9uIGNsZWFyVmFyKHR4dCl7XG4gICAgdHh0PXR4dC5yZXBsYWNlKC9cXHMrL2csXCIgXCIpOy8v0YPQtNCw0LvQtdC90LjQtSDQt9Cw0LTQstC+0LXQvdC40LUg0L/RgNC+0LHQtdC70L7QslxuXG4gICAgLy/Qp9C40YHRgtC40Lwg0L/QvtC00YHRgtCw0LLQu9GP0LXQvNGL0LUg0L/QtdGA0LXQvNC10L3QvdGL0LVcbiAgICBzdHI9dHh0Lm1hdGNoKC9cXHsoLio/KVxcfS9nKTtcbiAgICBpZiAoIHN0ciAhPSBudWxsKSB7XG4gICAgICBmb3IgKCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgc3RyX3Q9c3RyW2ldLnJlcGxhY2UoLyAvZyxcIlwiKTtcbiAgICAgICAgdHh0PXR4dC5yZXBsYWNlKHN0cltpXSxzdHJfdCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0eHQ7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24odHBsLCBkYXRhKXtcbiAgICBpZih0eXBlb2YobGFuZ1t0cGxdKT09XCJ1bmRlZmluZWRcIil7XG4gICAgICBjb25zb2xlLmxvZyhcImxhbmcgbm90IGZvdW5kOiBcIit0cGwpO1xuICAgICAgcmV0dXJuIHRwbDtcbiAgICB9XG4gICAgdHBsPWxhbmdbdHBsXTtcbiAgICBpZih0eXBlb2YoZGF0YSk9PVwib2JqZWN0XCIpe1xuICAgICAgZm9yKHZhciBpbmRleCBpbiBkYXRhKSB7XG4gICAgICAgIHRwbD10cGwuc3BsaXQoXCJ7XCIraW5kZXgrXCJ9XCIpLmpvaW4oZGF0YVtpbmRleF0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHBsO1xuICB9XG59KSgpOyIsIi8qKlxuICogbWVudS1haW0gaXMgYSBqUXVlcnkgcGx1Z2luIGZvciBkcm9wZG93biBtZW51cyB0aGF0IGNhbiBkaWZmZXJlbnRpYXRlXG4gKiBiZXR3ZWVuIGEgdXNlciB0cnlpbmcgaG92ZXIgb3ZlciBhIGRyb3Bkb3duIGl0ZW0gdnMgdHJ5aW5nIHRvIG5hdmlnYXRlIGludG9cbiAqIGEgc3VibWVudSdzIGNvbnRlbnRzLlxuICpcbiAqIG1lbnUtYWltIGFzc3VtZXMgdGhhdCB5b3UgaGF2ZSBhcmUgdXNpbmcgYSBtZW51IHdpdGggc3VibWVudXMgdGhhdCBleHBhbmRcbiAqIHRvIHRoZSBtZW51J3MgcmlnaHQuIEl0IHdpbGwgZmlyZSBldmVudHMgd2hlbiB0aGUgdXNlcidzIG1vdXNlIGVudGVycyBhIG5ld1xuICogZHJvcGRvd24gaXRlbSAqYW5kKiB3aGVuIHRoYXQgaXRlbSBpcyBiZWluZyBpbnRlbnRpb25hbGx5IGhvdmVyZWQgb3Zlci5cbiAqXG4gKiBfX19fX19fX19fX19fX19fX19fX19fX19fX1xuICogfCBNb25rZXlzICA+fCAgIEdvcmlsbGEgIHxcbiAqIHwgR29yaWxsYXMgPnwgICBDb250ZW50ICB8XG4gKiB8IENoaW1wcyAgID58ICAgSGVyZSAgICAgfFxuICogfF9fX19fX19fX19ffF9fX19fX19fX19fX3xcbiAqXG4gKiBJbiB0aGUgYWJvdmUgZXhhbXBsZSwgXCJHb3JpbGxhc1wiIGlzIHNlbGVjdGVkIGFuZCBpdHMgc3VibWVudSBjb250ZW50IGlzXG4gKiBiZWluZyBzaG93biBvbiB0aGUgcmlnaHQuIEltYWdpbmUgdGhhdCB0aGUgdXNlcidzIGN1cnNvciBpcyBob3ZlcmluZyBvdmVyXG4gKiBcIkdvcmlsbGFzLlwiIFdoZW4gdGhleSBtb3ZlIHRoZWlyIG1vdXNlIGludG8gdGhlIFwiR29yaWxsYSBDb250ZW50XCIgYXJlYSwgdGhleVxuICogbWF5IGJyaWVmbHkgaG92ZXIgb3ZlciBcIkNoaW1wcy5cIiBUaGlzIHNob3VsZG4ndCBjbG9zZSB0aGUgXCJHb3JpbGxhIENvbnRlbnRcIlxuICogYXJlYS5cbiAqXG4gKiBUaGlzIHByb2JsZW0gaXMgbm9ybWFsbHkgc29sdmVkIHVzaW5nIHRpbWVvdXRzIGFuZCBkZWxheXMuIG1lbnUtYWltIHRyaWVzIHRvXG4gKiBzb2x2ZSB0aGlzIGJ5IGRldGVjdGluZyB0aGUgZGlyZWN0aW9uIG9mIHRoZSB1c2VyJ3MgbW91c2UgbW92ZW1lbnQuIFRoaXMgY2FuXG4gKiBtYWtlIGZvciBxdWlja2VyIHRyYW5zaXRpb25zIHdoZW4gbmF2aWdhdGluZyB1cCBhbmQgZG93biB0aGUgbWVudS4gVGhlXG4gKiBleHBlcmllbmNlIGlzIGhvcGVmdWxseSBzaW1pbGFyIHRvIGFtYXpvbi5jb20vJ3MgXCJTaG9wIGJ5IERlcGFydG1lbnRcIlxuICogZHJvcGRvd24uXG4gKlxuICogVXNlIGxpa2Ugc286XG4gKlxuICogICAgICAkKFwiI21lbnVcIikubWVudUFpbSh7XG4gKiAgICAgICAgICBhY3RpdmF0ZTogJC5ub29wLCAgLy8gZmlyZWQgb24gcm93IGFjdGl2YXRpb25cbiAqICAgICAgICAgIGRlYWN0aXZhdGU6ICQubm9vcCAgLy8gZmlyZWQgb24gcm93IGRlYWN0aXZhdGlvblxuICogICAgICB9KTtcbiAqXG4gKiAgLi4udG8gcmVjZWl2ZSBldmVudHMgd2hlbiBhIG1lbnUncyByb3cgaGFzIGJlZW4gcHVycG9zZWZ1bGx5IChkZSlhY3RpdmF0ZWQuXG4gKlxuICogVGhlIGZvbGxvd2luZyBvcHRpb25zIGNhbiBiZSBwYXNzZWQgdG8gbWVudUFpbS4gQWxsIGZ1bmN0aW9ucyBleGVjdXRlIHdpdGhcbiAqIHRoZSByZWxldmFudCByb3cncyBIVE1MIGVsZW1lbnQgYXMgdGhlIGV4ZWN1dGlvbiBjb250ZXh0ICgndGhpcycpOlxuICpcbiAqICAgICAgLm1lbnVBaW0oe1xuICogICAgICAgICAgLy8gRnVuY3Rpb24gdG8gY2FsbCB3aGVuIGEgcm93IGlzIHB1cnBvc2VmdWxseSBhY3RpdmF0ZWQuIFVzZSB0aGlzXG4gKiAgICAgICAgICAvLyB0byBzaG93IGEgc3VibWVudSdzIGNvbnRlbnQgZm9yIHRoZSBhY3RpdmF0ZWQgcm93LlxuICogICAgICAgICAgYWN0aXZhdGU6IGZ1bmN0aW9uKCkge30sXG4gKlxuICogICAgICAgICAgLy8gRnVuY3Rpb24gdG8gY2FsbCB3aGVuIGEgcm93IGlzIGRlYWN0aXZhdGVkLlxuICogICAgICAgICAgZGVhY3RpdmF0ZTogZnVuY3Rpb24oKSB7fSxcbiAqXG4gKiAgICAgICAgICAvLyBGdW5jdGlvbiB0byBjYWxsIHdoZW4gbW91c2UgZW50ZXJzIGEgbWVudSByb3cuIEVudGVyaW5nIGEgcm93XG4gKiAgICAgICAgICAvLyBkb2VzIG5vdCBtZWFuIHRoZSByb3cgaGFzIGJlZW4gYWN0aXZhdGVkLCBhcyB0aGUgdXNlciBtYXkgYmVcbiAqICAgICAgICAgIC8vIG1vdXNpbmcgb3ZlciB0byBhIHN1Ym1lbnUuXG4gKiAgICAgICAgICBlbnRlcjogZnVuY3Rpb24oKSB7fSxcbiAqXG4gKiAgICAgICAgICAvLyBGdW5jdGlvbiB0byBjYWxsIHdoZW4gbW91c2UgZXhpdHMgYSBtZW51IHJvdy5cbiAqICAgICAgICAgIGV4aXQ6IGZ1bmN0aW9uKCkge30sXG4gKlxuICogICAgICAgICAgLy8gU2VsZWN0b3IgZm9yIGlkZW50aWZ5aW5nIHdoaWNoIGVsZW1lbnRzIGluIHRoZSBtZW51IGFyZSByb3dzXG4gKiAgICAgICAgICAvLyB0aGF0IGNhbiB0cmlnZ2VyIHRoZSBhYm92ZSBldmVudHMuIERlZmF1bHRzIHRvIFwiPiBsaVwiLlxuICogICAgICAgICAgcm93U2VsZWN0b3I6IFwiPiBsaVwiLFxuICpcbiAqICAgICAgICAgIC8vIFlvdSBtYXkgaGF2ZSBzb21lIG1lbnUgcm93cyB0aGF0IGFyZW4ndCBzdWJtZW51cyBhbmQgdGhlcmVmb3JlXG4gKiAgICAgICAgICAvLyBzaG91bGRuJ3QgZXZlciBuZWVkIHRvIFwiYWN0aXZhdGUuXCIgSWYgc28sIGZpbHRlciBzdWJtZW51IHJvd3Mgdy9cbiAqICAgICAgICAgIC8vIHRoaXMgc2VsZWN0b3IuIERlZmF1bHRzIHRvIFwiKlwiIChhbGwgZWxlbWVudHMpLlxuICogICAgICAgICAgc3VibWVudVNlbGVjdG9yOiBcIipcIixcbiAqXG4gKiAgICAgICAgICAvLyBEaXJlY3Rpb24gdGhlIHN1Ym1lbnUgb3BlbnMgcmVsYXRpdmUgdG8gdGhlIG1haW4gbWVudS4gQ2FuIGJlXG4gKiAgICAgICAgICAvLyBsZWZ0LCByaWdodCwgYWJvdmUsIG9yIGJlbG93LiBEZWZhdWx0cyB0byBcInJpZ2h0XCIuXG4gKiAgICAgICAgICBzdWJtZW51RGlyZWN0aW9uOiBcInJpZ2h0XCJcbiAqICAgICAgfSk7XG4gKlxuICogaHR0cHM6Ly9naXRodWIuY29tL2thbWVucy9qUXVlcnktbWVudS1haW1cbiovXG4oZnVuY3Rpb24oJCkge1xuXG4gICAgJC5mbi5tZW51QWltID0gZnVuY3Rpb24ob3B0cykge1xuICAgICAgICAvLyBJbml0aWFsaXplIG1lbnUtYWltIGZvciBhbGwgZWxlbWVudHMgaW4galF1ZXJ5IGNvbGxlY3Rpb25cbiAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaW5pdC5jYWxsKHRoaXMsIG9wdHMpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gaW5pdChvcHRzKSB7XG4gICAgICAgIHZhciAkbWVudSA9ICQodGhpcyksXG4gICAgICAgICAgICBhY3RpdmVSb3cgPSBudWxsLFxuICAgICAgICAgICAgbW91c2VMb2NzID0gW10sXG4gICAgICAgICAgICBsYXN0RGVsYXlMb2MgPSBudWxsLFxuICAgICAgICAgICAgdGltZW91dElkID0gbnVsbCxcbiAgICAgICAgICAgIG9wdGlvbnMgPSAkLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgcm93U2VsZWN0b3I6IFwiPiBsaVwiLFxuICAgICAgICAgICAgICAgIHN1Ym1lbnVTZWxlY3RvcjogXCIqXCIsXG4gICAgICAgICAgICAgICAgc3VibWVudURpcmVjdGlvbjogXCJyaWdodFwiLFxuICAgICAgICAgICAgICAgIHRvbGVyYW5jZTogNzUsICAvLyBiaWdnZXIgPSBtb3JlIGZvcmdpdmV5IHdoZW4gZW50ZXJpbmcgc3VibWVudVxuICAgICAgICAgICAgICAgIGVudGVyOiAkLm5vb3AsXG4gICAgICAgICAgICAgICAgZXhpdDogJC5ub29wLFxuICAgICAgICAgICAgICAgIGFjdGl2YXRlOiAkLm5vb3AsXG4gICAgICAgICAgICAgICAgZGVhY3RpdmF0ZTogJC5ub29wLFxuICAgICAgICAgICAgICAgIGV4aXRNZW51OiAkLm5vb3BcbiAgICAgICAgICAgIH0sIG9wdHMpO1xuXG4gICAgICAgIHZhciBNT1VTRV9MT0NTX1RSQUNLRUQgPSAzLCAgLy8gbnVtYmVyIG9mIHBhc3QgbW91c2UgbG9jYXRpb25zIHRvIHRyYWNrXG4gICAgICAgICAgICBERUxBWSA9IDMwMDsgIC8vIG1zIGRlbGF5IHdoZW4gdXNlciBhcHBlYXJzIHRvIGJlIGVudGVyaW5nIHN1Ym1lbnVcblxuICAgICAgICAvKipcbiAgICAgICAgICogS2VlcCB0cmFjayBvZiB0aGUgbGFzdCBmZXcgbG9jYXRpb25zIG9mIHRoZSBtb3VzZS5cbiAgICAgICAgICovXG4gICAgICAgIHZhciBtb3VzZW1vdmVEb2N1bWVudCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBtb3VzZUxvY3MucHVzaCh7eDogZS5wYWdlWCwgeTogZS5wYWdlWX0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKG1vdXNlTG9jcy5sZW5ndGggPiBNT1VTRV9MT0NTX1RSQUNLRUQpIHtcbiAgICAgICAgICAgICAgICAgICAgbW91c2VMb2NzLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2FuY2VsIHBvc3NpYmxlIHJvdyBhY3RpdmF0aW9ucyB3aGVuIGxlYXZpbmcgdGhlIG1lbnUgZW50aXJlbHlcbiAgICAgICAgICovXG4gICAgICAgIHZhciBtb3VzZWxlYXZlTWVudSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aW1lb3V0SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gSWYgZXhpdE1lbnUgaXMgc3VwcGxpZWQgYW5kIHJldHVybnMgdHJ1ZSwgZGVhY3RpdmF0ZSB0aGVcbiAgICAgICAgICAgICAgICAvLyBjdXJyZW50bHkgYWN0aXZlIHJvdyBvbiBtZW51IGV4aXQuXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZXhpdE1lbnUodGhpcykpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFjdGl2ZVJvdykge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5kZWFjdGl2YXRlKGFjdGl2ZVJvdyk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBhY3RpdmVSb3cgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyaWdnZXIgYSBwb3NzaWJsZSByb3cgYWN0aXZhdGlvbiB3aGVuZXZlciBlbnRlcmluZyBhIG5ldyByb3cuXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgbW91c2VlbnRlclJvdyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aW1lb3V0SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ2FuY2VsIGFueSBwcmV2aW91cyBhY3RpdmF0aW9uIGRlbGF5c1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBvcHRpb25zLmVudGVyKHRoaXMpO1xuICAgICAgICAgICAgICAgIHBvc3NpYmx5QWN0aXZhdGUodGhpcyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbW91c2VsZWF2ZVJvdyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuZXhpdCh0aGlzKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgLypcbiAgICAgICAgICogSW1tZWRpYXRlbHkgYWN0aXZhdGUgYSByb3cgaWYgdGhlIHVzZXIgY2xpY2tzIG9uIGl0LlxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGNsaWNrUm93ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgYWN0aXZhdGUodGhpcyk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBY3RpdmF0ZSBhIG1lbnUgcm93LlxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGFjdGl2YXRlID0gZnVuY3Rpb24ocm93KSB7XG4gICAgICAgICAgICAgICAgaWYgKHJvdyA9PSBhY3RpdmVSb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChhY3RpdmVSb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5kZWFjdGl2YXRlKGFjdGl2ZVJvdyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5hY3RpdmF0ZShyb3cpO1xuICAgICAgICAgICAgICAgIGFjdGl2ZVJvdyA9IHJvdztcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBvc3NpYmx5IGFjdGl2YXRlIGEgbWVudSByb3cuIElmIG1vdXNlIG1vdmVtZW50IGluZGljYXRlcyB0aGF0IHdlXG4gICAgICAgICAqIHNob3VsZG4ndCBhY3RpdmF0ZSB5ZXQgYmVjYXVzZSB1c2VyIG1heSBiZSB0cnlpbmcgdG8gZW50ZXJcbiAgICAgICAgICogYSBzdWJtZW51J3MgY29udGVudCwgdGhlbiBkZWxheSBhbmQgY2hlY2sgYWdhaW4gbGF0ZXIuXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcG9zc2libHlBY3RpdmF0ZSA9IGZ1bmN0aW9uKHJvdykge1xuICAgICAgICAgICAgICAgIHZhciBkZWxheSA9IGFjdGl2YXRpb25EZWxheSgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGRlbGF5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NzaWJseUFjdGl2YXRlKHJvdyk7XG4gICAgICAgICAgICAgICAgICAgIH0sIGRlbGF5KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhY3RpdmF0ZShyb3cpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybiB0aGUgYW1vdW50IG9mIHRpbWUgdGhhdCBzaG91bGQgYmUgdXNlZCBhcyBhIGRlbGF5IGJlZm9yZSB0aGVcbiAgICAgICAgICogY3VycmVudGx5IGhvdmVyZWQgcm93IGlzIGFjdGl2YXRlZC5cbiAgICAgICAgICpcbiAgICAgICAgICogUmV0dXJucyAwIGlmIHRoZSBhY3RpdmF0aW9uIHNob3VsZCBoYXBwZW4gaW1tZWRpYXRlbHkuIE90aGVyd2lzZSxcbiAgICAgICAgICogcmV0dXJucyB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0aGF0IHNob3VsZCBiZSBkZWxheWVkIGJlZm9yZVxuICAgICAgICAgKiBjaGVja2luZyBhZ2FpbiB0byBzZWUgaWYgdGhlIHJvdyBzaG91bGQgYmUgYWN0aXZhdGVkLlxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGFjdGl2YXRpb25EZWxheSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICghYWN0aXZlUm93IHx8ICEkKGFjdGl2ZVJvdykuaXMob3B0aW9ucy5zdWJtZW51U2VsZWN0b3IpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlIGlzIG5vIG90aGVyIHN1Ym1lbnUgcm93IGFscmVhZHkgYWN0aXZlLCB0aGVuXG4gICAgICAgICAgICAgICAgICAgIC8vIGdvIGFoZWFkIGFuZCBhY3RpdmF0ZSBpbW1lZGlhdGVseS5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9ICRtZW51Lm9mZnNldCgpLFxuICAgICAgICAgICAgICAgICAgICB1cHBlckxlZnQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBvZmZzZXQubGVmdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IG9mZnNldC50b3AgLSBvcHRpb25zLnRvbGVyYW5jZVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB1cHBlclJpZ2h0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgeDogb2Zmc2V0LmxlZnQgKyAkbWVudS5vdXRlcldpZHRoKCksXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiB1cHBlckxlZnQueVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBsb3dlckxlZnQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBvZmZzZXQubGVmdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IG9mZnNldC50b3AgKyAkbWVudS5vdXRlckhlaWdodCgpICsgb3B0aW9ucy50b2xlcmFuY2VcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgbG93ZXJSaWdodCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IG9mZnNldC5sZWZ0ICsgJG1lbnUub3V0ZXJXaWR0aCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogbG93ZXJMZWZ0LnlcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgbG9jID0gbW91c2VMb2NzW21vdXNlTG9jcy5sZW5ndGggLSAxXSxcbiAgICAgICAgICAgICAgICAgICAgcHJldkxvYyA9IG1vdXNlTG9jc1swXTtcblxuICAgICAgICAgICAgICAgIGlmICghbG9jKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghcHJldkxvYykge1xuICAgICAgICAgICAgICAgICAgICBwcmV2TG9jID0gbG9jO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChwcmV2TG9jLnggPCBvZmZzZXQubGVmdCB8fCBwcmV2TG9jLnggPiBsb3dlclJpZ2h0LnggfHxcbiAgICAgICAgICAgICAgICAgICAgcHJldkxvYy55IDwgb2Zmc2V0LnRvcCB8fCBwcmV2TG9jLnkgPiBsb3dlclJpZ2h0LnkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIHByZXZpb3VzIG1vdXNlIGxvY2F0aW9uIHdhcyBvdXRzaWRlIG9mIHRoZSBlbnRpcmVcbiAgICAgICAgICAgICAgICAgICAgLy8gbWVudSdzIGJvdW5kcywgaW1tZWRpYXRlbHkgYWN0aXZhdGUuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChsYXN0RGVsYXlMb2MgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYy54ID09IGxhc3REZWxheUxvYy54ICYmIGxvYy55ID09IGxhc3REZWxheUxvYy55KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSBtb3VzZSBoYXNuJ3QgbW92ZWQgc2luY2UgdGhlIGxhc3QgdGltZSB3ZSBjaGVja2VkXG4gICAgICAgICAgICAgICAgICAgIC8vIGZvciBhY3RpdmF0aW9uIHN0YXR1cywgaW1tZWRpYXRlbHkgYWN0aXZhdGUuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIERldGVjdCBpZiB0aGUgdXNlciBpcyBtb3ZpbmcgdG93YXJkcyB0aGUgY3VycmVudGx5IGFjdGl2YXRlZFxuICAgICAgICAgICAgICAgIC8vIHN1Ym1lbnUuXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgbW91c2UgaXMgaGVhZGluZyByZWxhdGl2ZWx5IGNsZWFybHkgdG93YXJkc1xuICAgICAgICAgICAgICAgIC8vIHRoZSBzdWJtZW51J3MgY29udGVudCwgd2Ugc2hvdWxkIHdhaXQgYW5kIGdpdmUgdGhlIHVzZXIgbW9yZVxuICAgICAgICAgICAgICAgIC8vIHRpbWUgYmVmb3JlIGFjdGl2YXRpbmcgYSBuZXcgcm93LiBJZiB0aGUgbW91c2UgaXMgaGVhZGluZ1xuICAgICAgICAgICAgICAgIC8vIGVsc2V3aGVyZSwgd2UgY2FuIGltbWVkaWF0ZWx5IGFjdGl2YXRlIGEgbmV3IHJvdy5cbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIC8vIFdlIGRldGVjdCB0aGlzIGJ5IGNhbGN1bGF0aW5nIHRoZSBzbG9wZSBmb3JtZWQgYmV0d2VlbiB0aGVcbiAgICAgICAgICAgICAgICAvLyBjdXJyZW50IG1vdXNlIGxvY2F0aW9uIGFuZCB0aGUgdXBwZXIvbG93ZXIgcmlnaHQgcG9pbnRzIG9mXG4gICAgICAgICAgICAgICAgLy8gdGhlIG1lbnUuIFdlIGRvIHRoZSBzYW1lIGZvciB0aGUgcHJldmlvdXMgbW91c2UgbG9jYXRpb24uXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIGN1cnJlbnQgbW91c2UgbG9jYXRpb24ncyBzbG9wZXMgYXJlXG4gICAgICAgICAgICAgICAgLy8gaW5jcmVhc2luZy9kZWNyZWFzaW5nIGFwcHJvcHJpYXRlbHkgY29tcGFyZWQgdG8gdGhlXG4gICAgICAgICAgICAgICAgLy8gcHJldmlvdXMncywgd2Uga25vdyB0aGUgdXNlciBpcyBtb3ZpbmcgdG93YXJkIHRoZSBzdWJtZW51LlxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgLy8gTm90ZSB0aGF0IHNpbmNlIHRoZSB5LWF4aXMgaW5jcmVhc2VzIGFzIHRoZSBjdXJzb3IgbW92ZXNcbiAgICAgICAgICAgICAgICAvLyBkb3duIHRoZSBzY3JlZW4sIHdlIGFyZSBsb29raW5nIGZvciB0aGUgc2xvcGUgYmV0d2VlbiB0aGVcbiAgICAgICAgICAgICAgICAvLyBjdXJzb3IgYW5kIHRoZSB1cHBlciByaWdodCBjb3JuZXIgdG8gZGVjcmVhc2Ugb3ZlciB0aW1lLCBub3RcbiAgICAgICAgICAgICAgICAvLyBpbmNyZWFzZSAoc29tZXdoYXQgY291bnRlcmludHVpdGl2ZWx5KS5cbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzbG9wZShhLCBiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoYi55IC0gYS55KSAvIChiLnggLSBhLngpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB2YXIgZGVjcmVhc2luZ0Nvcm5lciA9IHVwcGVyUmlnaHQsXG4gICAgICAgICAgICAgICAgICAgIGluY3JlYXNpbmdDb3JuZXIgPSBsb3dlclJpZ2h0O1xuXG4gICAgICAgICAgICAgICAgLy8gT3VyIGV4cGVjdGF0aW9ucyBmb3IgZGVjcmVhc2luZyBvciBpbmNyZWFzaW5nIHNsb3BlIHZhbHVlc1xuICAgICAgICAgICAgICAgIC8vIGRlcGVuZHMgb24gd2hpY2ggZGlyZWN0aW9uIHRoZSBzdWJtZW51IG9wZW5zIHJlbGF0aXZlIHRvIHRoZVxuICAgICAgICAgICAgICAgIC8vIG1haW4gbWVudS4gQnkgZGVmYXVsdCwgaWYgdGhlIG1lbnUgb3BlbnMgb24gdGhlIHJpZ2h0LCB3ZVxuICAgICAgICAgICAgICAgIC8vIGV4cGVjdCB0aGUgc2xvcGUgYmV0d2VlbiB0aGUgY3Vyc29yIGFuZCB0aGUgdXBwZXIgcmlnaHRcbiAgICAgICAgICAgICAgICAvLyBjb3JuZXIgdG8gZGVjcmVhc2Ugb3ZlciB0aW1lLCBhcyBleHBsYWluZWQgYWJvdmUuIElmIHRoZVxuICAgICAgICAgICAgICAgIC8vIHN1Ym1lbnUgb3BlbnMgaW4gYSBkaWZmZXJlbnQgZGlyZWN0aW9uLCB3ZSBjaGFuZ2Ugb3VyIHNsb3BlXG4gICAgICAgICAgICAgICAgLy8gZXhwZWN0YXRpb25zLlxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnN1Ym1lbnVEaXJlY3Rpb24gPT0gXCJsZWZ0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVjcmVhc2luZ0Nvcm5lciA9IGxvd2VyTGVmdDtcbiAgICAgICAgICAgICAgICAgICAgaW5jcmVhc2luZ0Nvcm5lciA9IHVwcGVyTGVmdDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuc3VibWVudURpcmVjdGlvbiA9PSBcImJlbG93XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVjcmVhc2luZ0Nvcm5lciA9IGxvd2VyUmlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIGluY3JlYXNpbmdDb3JuZXIgPSBsb3dlckxlZnQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLnN1Ym1lbnVEaXJlY3Rpb24gPT0gXCJhYm92ZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlY3JlYXNpbmdDb3JuZXIgPSB1cHBlckxlZnQ7XG4gICAgICAgICAgICAgICAgICAgIGluY3JlYXNpbmdDb3JuZXIgPSB1cHBlclJpZ2h0O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBkZWNyZWFzaW5nU2xvcGUgPSBzbG9wZShsb2MsIGRlY3JlYXNpbmdDb3JuZXIpLFxuICAgICAgICAgICAgICAgICAgICBpbmNyZWFzaW5nU2xvcGUgPSBzbG9wZShsb2MsIGluY3JlYXNpbmdDb3JuZXIpLFxuICAgICAgICAgICAgICAgICAgICBwcmV2RGVjcmVhc2luZ1Nsb3BlID0gc2xvcGUocHJldkxvYywgZGVjcmVhc2luZ0Nvcm5lciksXG4gICAgICAgICAgICAgICAgICAgIHByZXZJbmNyZWFzaW5nU2xvcGUgPSBzbG9wZShwcmV2TG9jLCBpbmNyZWFzaW5nQ29ybmVyKTtcblxuICAgICAgICAgICAgICAgIGlmIChkZWNyZWFzaW5nU2xvcGUgPCBwcmV2RGVjcmVhc2luZ1Nsb3BlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNyZWFzaW5nU2xvcGUgPiBwcmV2SW5jcmVhc2luZ1Nsb3BlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE1vdXNlIGlzIG1vdmluZyBmcm9tIHByZXZpb3VzIGxvY2F0aW9uIHRvd2FyZHMgdGhlXG4gICAgICAgICAgICAgICAgICAgIC8vIGN1cnJlbnRseSBhY3RpdmF0ZWQgc3VibWVudS4gRGVsYXkgYmVmb3JlIGFjdGl2YXRpbmcgYVxuICAgICAgICAgICAgICAgICAgICAvLyBuZXcgbWVudSByb3csIGJlY2F1c2UgdXNlciBtYXkgYmUgbW92aW5nIGludG8gc3VibWVudS5cbiAgICAgICAgICAgICAgICAgICAgbGFzdERlbGF5TG9jID0gbG9jO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gREVMQVk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGFzdERlbGF5TG9jID0gbnVsbDtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEhvb2sgdXAgaW5pdGlhbCBtZW51IGV2ZW50c1xuICAgICAgICAgKi9cbiAgICAgICAgJG1lbnVcbiAgICAgICAgICAgIC5tb3VzZWxlYXZlKG1vdXNlbGVhdmVNZW51KVxuICAgICAgICAgICAgLmZpbmQob3B0aW9ucy5yb3dTZWxlY3RvcilcbiAgICAgICAgICAgICAgICAubW91c2VlbnRlcihtb3VzZWVudGVyUm93KVxuICAgICAgICAgICAgICAgIC5tb3VzZWxlYXZlKG1vdXNlbGVhdmVSb3cpXG4gICAgICAgICAgICAgICAgLmNsaWNrKGNsaWNrUm93KTtcblxuICAgICAgICAkKGRvY3VtZW50KS5tb3VzZW1vdmUobW91c2Vtb3ZlRG9jdW1lbnQpO1xuXG4gICAgfTtcbn0pKGpRdWVyeSk7XG5cbiIsIi8qKlxuICogY2lyY2xlcyAtIHYwLjAuNiAtIDIwMTUtMTEtMjdcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUgbHVnb2xhYnNcbiAqIExpY2Vuc2VkIFxuICovXG4hZnVuY3Rpb24oYSxiKXtcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1iKCk6XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXSxiKTphLkNpcmNsZXM9YigpfSh0aGlzLGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7dmFyIGE9d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93Lm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZXx8ZnVuY3Rpb24oYSl7c2V0VGltZW91dChhLDFlMy82MCl9LGI9ZnVuY3Rpb24oYSl7dmFyIGI9YS5pZDtpZih0aGlzLl9lbD1kb2N1bWVudC5nZXRFbGVtZW50QnlJZChiKSxudWxsIT09dGhpcy5fZWwpe3RoaXMuX3JhZGl1cz1hLnJhZGl1c3x8MTAsdGhpcy5fZHVyYXRpb249dm9pZCAwPT09YS5kdXJhdGlvbj81MDA6YS5kdXJhdGlvbix0aGlzLl92YWx1ZT0wLHRoaXMuX21heFZhbHVlPWEubWF4VmFsdWV8fDEwMCx0aGlzLl90ZXh0PXZvaWQgMD09PWEudGV4dD9mdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5odG1saWZ5TnVtYmVyKGEpfTphLnRleHQsdGhpcy5fc3Ryb2tlV2lkdGg9YS53aWR0aHx8MTAsdGhpcy5fY29sb3JzPWEuY29sb3JzfHxbXCIjRUVFXCIsXCIjRjAwXCJdLHRoaXMuX3N2Zz1udWxsLHRoaXMuX21vdmluZ1BhdGg9bnVsbCx0aGlzLl93cmFwQ29udGFpbmVyPW51bGwsdGhpcy5fdGV4dENvbnRhaW5lcj1udWxsLHRoaXMuX3dycENsYXNzPWEud3JwQ2xhc3N8fFwiY2lyY2xlcy13cnBcIix0aGlzLl90ZXh0Q2xhc3M9YS50ZXh0Q2xhc3N8fFwiY2lyY2xlcy10ZXh0XCIsdGhpcy5fdmFsQ2xhc3M9YS52YWx1ZVN0cm9rZUNsYXNzfHxcImNpcmNsZXMtdmFsdWVTdHJva2VcIix0aGlzLl9tYXhWYWxDbGFzcz1hLm1heFZhbHVlU3Ryb2tlQ2xhc3N8fFwiY2lyY2xlcy1tYXhWYWx1ZVN0cm9rZVwiLHRoaXMuX3N0eWxlV3JhcHBlcj1hLnN0eWxlV3JhcHBlcj09PSExPyExOiEwLHRoaXMuX3N0eWxlVGV4dD1hLnN0eWxlVGV4dD09PSExPyExOiEwO3ZhciBjPU1hdGguUEkvMTgwKjI3MDt0aGlzLl9zdGFydD0tTWF0aC5QSS8xODAqOTAsdGhpcy5fc3RhcnRQcmVjaXNlPXRoaXMuX3ByZWNpc2UodGhpcy5fc3RhcnQpLHRoaXMuX2NpcmM9Yy10aGlzLl9zdGFydCx0aGlzLl9nZW5lcmF0ZSgpLnVwZGF0ZShhLnZhbHVlfHwwKX19O3JldHVybiBiLnByb3RvdHlwZT17VkVSU0lPTjpcIjAuMC42XCIsX2dlbmVyYXRlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3N2Z1NpemU9Mip0aGlzLl9yYWRpdXMsdGhpcy5fcmFkaXVzQWRqdXN0ZWQ9dGhpcy5fcmFkaXVzLXRoaXMuX3N0cm9rZVdpZHRoLzIsdGhpcy5fZ2VuZXJhdGVTdmcoKS5fZ2VuZXJhdGVUZXh0KCkuX2dlbmVyYXRlV3JhcHBlcigpLHRoaXMuX2VsLmlubmVySFRNTD1cIlwiLHRoaXMuX2VsLmFwcGVuZENoaWxkKHRoaXMuX3dyYXBDb250YWluZXIpLHRoaXN9LF9zZXRQZXJjZW50YWdlOmZ1bmN0aW9uKGEpe3RoaXMuX21vdmluZ1BhdGguc2V0QXR0cmlidXRlKFwiZFwiLHRoaXMuX2NhbGN1bGF0ZVBhdGgoYSwhMCkpLHRoaXMuX3RleHRDb250YWluZXIuaW5uZXJIVE1MPXRoaXMuX2dldFRleHQodGhpcy5nZXRWYWx1ZUZyb21QZXJjZW50KGEpKX0sX2dlbmVyYXRlV3JhcHBlcjpmdW5jdGlvbigpe3JldHVybiB0aGlzLl93cmFwQ29udGFpbmVyPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksdGhpcy5fd3JhcENvbnRhaW5lci5jbGFzc05hbWU9dGhpcy5fd3JwQ2xhc3MsdGhpcy5fc3R5bGVXcmFwcGVyJiYodGhpcy5fd3JhcENvbnRhaW5lci5zdHlsZS5wb3NpdGlvbj1cInJlbGF0aXZlXCIsdGhpcy5fd3JhcENvbnRhaW5lci5zdHlsZS5kaXNwbGF5PVwiaW5saW5lLWJsb2NrXCIpLHRoaXMuX3dyYXBDb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fc3ZnKSx0aGlzLl93cmFwQ29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuX3RleHRDb250YWluZXIpLHRoaXN9LF9nZW5lcmF0ZVRleHQ6ZnVuY3Rpb24oKXtpZih0aGlzLl90ZXh0Q29udGFpbmVyPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksdGhpcy5fdGV4dENvbnRhaW5lci5jbGFzc05hbWU9dGhpcy5fdGV4dENsYXNzLHRoaXMuX3N0eWxlVGV4dCl7dmFyIGE9e3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6MCxsZWZ0OjAsdGV4dEFsaWduOlwiY2VudGVyXCIsd2lkdGg6XCIxMDAlXCIsZm9udFNpemU6LjcqdGhpcy5fcmFkaXVzK1wicHhcIixoZWlnaHQ6dGhpcy5fc3ZnU2l6ZStcInB4XCIsbGluZUhlaWdodDp0aGlzLl9zdmdTaXplK1wicHhcIn07Zm9yKHZhciBiIGluIGEpdGhpcy5fdGV4dENvbnRhaW5lci5zdHlsZVtiXT1hW2JdfXJldHVybiB0aGlzLl90ZXh0Q29udGFpbmVyLmlubmVySFRNTD10aGlzLl9nZXRUZXh0KDApLHRoaXN9LF9nZXRUZXh0OmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLl90ZXh0Pyh2b2lkIDA9PT1hJiYoYT10aGlzLl92YWx1ZSksYT1wYXJzZUZsb2F0KGEudG9GaXhlZCgyKSksXCJmdW5jdGlvblwiPT10eXBlb2YgdGhpcy5fdGV4dD90aGlzLl90ZXh0LmNhbGwodGhpcyxhKTp0aGlzLl90ZXh0KTpcIlwifSxfZ2VuZXJhdGVTdmc6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fc3ZnPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsXCJzdmdcIiksdGhpcy5fc3ZnLnNldEF0dHJpYnV0ZShcInhtbG5zXCIsXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiKSx0aGlzLl9zdmcuc2V0QXR0cmlidXRlKFwid2lkdGhcIix0aGlzLl9zdmdTaXplKSx0aGlzLl9zdmcuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsdGhpcy5fc3ZnU2l6ZSksdGhpcy5fZ2VuZXJhdGVQYXRoKDEwMCwhMSx0aGlzLl9jb2xvcnNbMF0sdGhpcy5fbWF4VmFsQ2xhc3MpLl9nZW5lcmF0ZVBhdGgoMSwhMCx0aGlzLl9jb2xvcnNbMV0sdGhpcy5fdmFsQ2xhc3MpLHRoaXMuX21vdmluZ1BhdGg9dGhpcy5fc3ZnLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwicGF0aFwiKVsxXSx0aGlzfSxfZ2VuZXJhdGVQYXRoOmZ1bmN0aW9uKGEsYixjLGQpe3ZhciBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsXCJwYXRoXCIpO3JldHVybiBlLnNldEF0dHJpYnV0ZShcImZpbGxcIixcInRyYW5zcGFyZW50XCIpLGUuc2V0QXR0cmlidXRlKFwic3Ryb2tlXCIsYyksZS5zZXRBdHRyaWJ1dGUoXCJzdHJva2Utd2lkdGhcIix0aGlzLl9zdHJva2VXaWR0aCksZS5zZXRBdHRyaWJ1dGUoXCJkXCIsdGhpcy5fY2FsY3VsYXRlUGF0aChhLGIpKSxlLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsZCksdGhpcy5fc3ZnLmFwcGVuZENoaWxkKGUpLHRoaXN9LF9jYWxjdWxhdGVQYXRoOmZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcy5fc3RhcnQrYS8xMDAqdGhpcy5fY2lyYyxkPXRoaXMuX3ByZWNpc2UoYyk7cmV0dXJuIHRoaXMuX2FyYyhkLGIpfSxfYXJjOmZ1bmN0aW9uKGEsYil7dmFyIGM9YS0uMDAxLGQ9YS10aGlzLl9zdGFydFByZWNpc2U8TWF0aC5QST8wOjE7cmV0dXJuW1wiTVwiLHRoaXMuX3JhZGl1cyt0aGlzLl9yYWRpdXNBZGp1c3RlZCpNYXRoLmNvcyh0aGlzLl9zdGFydFByZWNpc2UpLHRoaXMuX3JhZGl1cyt0aGlzLl9yYWRpdXNBZGp1c3RlZCpNYXRoLnNpbih0aGlzLl9zdGFydFByZWNpc2UpLFwiQVwiLHRoaXMuX3JhZGl1c0FkanVzdGVkLHRoaXMuX3JhZGl1c0FkanVzdGVkLDAsZCwxLHRoaXMuX3JhZGl1cyt0aGlzLl9yYWRpdXNBZGp1c3RlZCpNYXRoLmNvcyhjKSx0aGlzLl9yYWRpdXMrdGhpcy5fcmFkaXVzQWRqdXN0ZWQqTWF0aC5zaW4oYyksYj9cIlwiOlwiWlwiXS5qb2luKFwiIFwiKX0sX3ByZWNpc2U6ZnVuY3Rpb24oYSl7cmV0dXJuIE1hdGgucm91bmQoMWUzKmEpLzFlM30saHRtbGlmeU51bWJlcjpmdW5jdGlvbihhLGIsYyl7Yj1ifHxcImNpcmNsZXMtaW50ZWdlclwiLGM9Y3x8XCJjaXJjbGVzLWRlY2ltYWxzXCI7dmFyIGQ9KGErXCJcIikuc3BsaXQoXCIuXCIpLGU9JzxzcGFuIGNsYXNzPVwiJytiKydcIj4nK2RbMF0rXCI8L3NwYW4+XCI7cmV0dXJuIGQubGVuZ3RoPjEmJihlKz0nLjxzcGFuIGNsYXNzPVwiJytjKydcIj4nK2RbMV0uc3Vic3RyaW5nKDAsMikrXCI8L3NwYW4+XCIpLGV9LHVwZGF0ZVJhZGl1czpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5fcmFkaXVzPWEsdGhpcy5fZ2VuZXJhdGUoKS51cGRhdGUoITApfSx1cGRhdGVXaWR0aDpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5fc3Ryb2tlV2lkdGg9YSx0aGlzLl9nZW5lcmF0ZSgpLnVwZGF0ZSghMCl9LHVwZGF0ZUNvbG9yczpmdW5jdGlvbihhKXt0aGlzLl9jb2xvcnM9YTt2YXIgYj10aGlzLl9zdmcuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJwYXRoXCIpO3JldHVybiBiWzBdLnNldEF0dHJpYnV0ZShcInN0cm9rZVwiLGFbMF0pLGJbMV0uc2V0QXR0cmlidXRlKFwic3Ryb2tlXCIsYVsxXSksdGhpc30sZ2V0UGVyY2VudDpmdW5jdGlvbigpe3JldHVybiAxMDAqdGhpcy5fdmFsdWUvdGhpcy5fbWF4VmFsdWV9LGdldFZhbHVlRnJvbVBlcmNlbnQ6ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuX21heFZhbHVlKmEvMTAwfSxnZXRWYWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl92YWx1ZX0sZ2V0TWF4VmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fbWF4VmFsdWV9LHVwZGF0ZTpmdW5jdGlvbihiLGMpe2lmKGI9PT0hMClyZXR1cm4gdGhpcy5fc2V0UGVyY2VudGFnZSh0aGlzLmdldFBlcmNlbnQoKSksdGhpcztpZih0aGlzLl92YWx1ZT09Ynx8aXNOYU4oYikpcmV0dXJuIHRoaXM7dm9pZCAwPT09YyYmKGM9dGhpcy5fZHVyYXRpb24pO3ZhciBkLGUsZixnLGg9dGhpcyxpPWguZ2V0UGVyY2VudCgpLGo9MTtyZXR1cm4gdGhpcy5fdmFsdWU9TWF0aC5taW4odGhpcy5fbWF4VmFsdWUsTWF0aC5tYXgoMCxiKSksYz8oZD1oLmdldFBlcmNlbnQoKSxlPWQ+aSxqKz1kJTEsZj1NYXRoLmZsb29yKE1hdGguYWJzKGQtaSkvaiksZz1jL2YsZnVuY3Rpb24gayhiKXtpZihlP2krPWo6aS09aixlJiZpPj1kfHwhZSYmZD49aSlyZXR1cm4gdm9pZCBhKGZ1bmN0aW9uKCl7aC5fc2V0UGVyY2VudGFnZShkKX0pO2EoZnVuY3Rpb24oKXtoLl9zZXRQZXJjZW50YWdlKGkpfSk7dmFyIGM9RGF0ZS5ub3coKSxmPWMtYjtmPj1nP2soYyk6c2V0VGltZW91dChmdW5jdGlvbigpe2soRGF0ZS5ub3coKSl9LGctZil9KERhdGUubm93KCkpLHRoaXMpOih0aGlzLl9zZXRQZXJjZW50YWdlKHRoaXMuZ2V0UGVyY2VudCgpKSx0aGlzKX19LGIuY3JlYXRlPWZ1bmN0aW9uKGEpe3JldHVybiBuZXcgYihhKX0sYn0pOyIsInZhciBEYXRlcGlja2VyO1xuXG4oZnVuY3Rpb24gKHdpbmRvdywgJCwgdW5kZWZpbmVkKSB7XG4gICAgdmFyIHBsdWdpbk5hbWUgPSAnZGF0ZXBpY2tlcicsXG4gICAgICAgIGF1dG9Jbml0U2VsZWN0b3IgPSAnLmRhdGVwaWNrZXItaGVyZScsXG4gICAgICAgICRib2R5LCAkZGF0ZXBpY2tlcnNDb250YWluZXIsXG4gICAgICAgIGNvbnRhaW5lckJ1aWx0ID0gZmFsc2UsXG4gICAgICAgIGJhc2VUZW1wbGF0ZSA9ICcnICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlclwiPicgK1xuICAgICAgICAgICAgJzxuYXYgY2xhc3M9XCJkYXRlcGlja2VyLS1uYXZcIj48L25hdj4nICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tY29udGVudFwiPjwvZGl2PicgK1xuICAgICAgICAgICAgJzwvZGl2PicsXG4gICAgICAgIGRlZmF1bHRzID0ge1xuICAgICAgICAgICAgY2xhc3NlczogJycsXG4gICAgICAgICAgICBpbmxpbmU6IGZhbHNlLFxuICAgICAgICAgICAgbGFuZ3VhZ2U6ICdydScsXG4gICAgICAgICAgICBzdGFydERhdGU6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICBmaXJzdERheTogJycsXG4gICAgICAgICAgICB3ZWVrZW5kczogWzYsIDBdLFxuICAgICAgICAgICAgZGF0ZUZvcm1hdDogJycsXG4gICAgICAgICAgICBhbHRGaWVsZDogJycsXG4gICAgICAgICAgICBhbHRGaWVsZERhdGVGb3JtYXQ6ICdAJyxcbiAgICAgICAgICAgIHRvZ2dsZVNlbGVjdGVkOiB0cnVlLFxuICAgICAgICAgICAga2V5Ym9hcmROYXY6IHRydWUsXG5cbiAgICAgICAgICAgIHBvc2l0aW9uOiAnYm90dG9tIGxlZnQnLFxuICAgICAgICAgICAgb2Zmc2V0OiAxMixcblxuICAgICAgICAgICAgdmlldzogJ2RheXMnLFxuICAgICAgICAgICAgbWluVmlldzogJ2RheXMnLFxuXG4gICAgICAgICAgICBzaG93T3RoZXJNb250aHM6IHRydWUsXG4gICAgICAgICAgICBzZWxlY3RPdGhlck1vbnRoczogdHJ1ZSxcbiAgICAgICAgICAgIG1vdmVUb090aGVyTW9udGhzT25TZWxlY3Q6IHRydWUsXG5cbiAgICAgICAgICAgIHNob3dPdGhlclllYXJzOiB0cnVlLFxuICAgICAgICAgICAgc2VsZWN0T3RoZXJZZWFyczogdHJ1ZSxcbiAgICAgICAgICAgIG1vdmVUb090aGVyWWVhcnNPblNlbGVjdDogdHJ1ZSxcblxuICAgICAgICAgICAgbWluRGF0ZTogJycsXG4gICAgICAgICAgICBtYXhEYXRlOiAnJyxcbiAgICAgICAgICAgIGRpc2FibGVOYXZXaGVuT3V0T2ZSYW5nZTogdHJ1ZSxcblxuICAgICAgICAgICAgbXVsdGlwbGVEYXRlczogZmFsc2UsIC8vIEJvb2xlYW4gb3IgTnVtYmVyXG4gICAgICAgICAgICBtdWx0aXBsZURhdGVzU2VwYXJhdG9yOiAnLCcsXG4gICAgICAgICAgICByYW5nZTogZmFsc2UsXG5cbiAgICAgICAgICAgIHRvZGF5QnV0dG9uOiBmYWxzZSxcbiAgICAgICAgICAgIGNsZWFyQnV0dG9uOiBmYWxzZSxcblxuICAgICAgICAgICAgc2hvd0V2ZW50OiAnZm9jdXMnLFxuICAgICAgICAgICAgYXV0b0Nsb3NlOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gbmF2aWdhdGlvblxuICAgICAgICAgICAgbW9udGhzRmllbGQ6ICdtb250aHNTaG9ydCcsXG4gICAgICAgICAgICBwcmV2SHRtbDogJzxzdmc+PHBhdGggZD1cIk0gMTcsMTIgbCAtNSw1IGwgNSw1XCI+PC9wYXRoPjwvc3ZnPicsXG4gICAgICAgICAgICBuZXh0SHRtbDogJzxzdmc+PHBhdGggZD1cIk0gMTQsMTIgbCA1LDUgbCAtNSw1XCI+PC9wYXRoPjwvc3ZnPicsXG4gICAgICAgICAgICBuYXZUaXRsZXM6IHtcbiAgICAgICAgICAgICAgICBkYXlzOiAnTU0sIDxpPnl5eXk8L2k+JyxcbiAgICAgICAgICAgICAgICBtb250aHM6ICd5eXl5JyxcbiAgICAgICAgICAgICAgICB5ZWFyczogJ3l5eXkxIC0geXl5eTInXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvLyBldmVudHNcbiAgICAgICAgICAgIG9uU2VsZWN0OiAnJyxcbiAgICAgICAgICAgIG9uQ2hhbmdlTW9udGg6ICcnLFxuICAgICAgICAgICAgb25DaGFuZ2VZZWFyOiAnJyxcbiAgICAgICAgICAgIG9uQ2hhbmdlRGVjYWRlOiAnJyxcbiAgICAgICAgICAgIG9uQ2hhbmdlVmlldzogJycsXG4gICAgICAgICAgICBvblJlbmRlckNlbGw6ICcnXG4gICAgICAgIH0sXG4gICAgICAgIGhvdEtleXMgPSB7XG4gICAgICAgICAgICAnY3RybFJpZ2h0JzogWzE3LCAzOV0sXG4gICAgICAgICAgICAnY3RybFVwJzogWzE3LCAzOF0sXG4gICAgICAgICAgICAnY3RybExlZnQnOiBbMTcsIDM3XSxcbiAgICAgICAgICAgICdjdHJsRG93bic6IFsxNywgNDBdLFxuICAgICAgICAgICAgJ3NoaWZ0UmlnaHQnOiBbMTYsIDM5XSxcbiAgICAgICAgICAgICdzaGlmdFVwJzogWzE2LCAzOF0sXG4gICAgICAgICAgICAnc2hpZnRMZWZ0JzogWzE2LCAzN10sXG4gICAgICAgICAgICAnc2hpZnREb3duJzogWzE2LCA0MF0sXG4gICAgICAgICAgICAnYWx0VXAnOiBbMTgsIDM4XSxcbiAgICAgICAgICAgICdhbHRSaWdodCc6IFsxOCwgMzldLFxuICAgICAgICAgICAgJ2FsdExlZnQnOiBbMTgsIDM3XSxcbiAgICAgICAgICAgICdhbHREb3duJzogWzE4LCA0MF0sXG4gICAgICAgICAgICAnY3RybFNoaWZ0VXAnOiBbMTYsIDE3LCAzOF1cbiAgICAgICAgfSxcbiAgICAgICAgZGF0ZXBpY2tlcjtcblxuICAgIERhdGVwaWNrZXIgID0gZnVuY3Rpb24gKGVsLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuZWwgPSBlbDtcbiAgICAgICAgdGhpcy4kZWwgPSAkKGVsKTtcblxuICAgICAgICB0aGlzLm9wdHMgPSAkLmV4dGVuZCh0cnVlLCB7fSwgZGVmYXVsdHMsIG9wdGlvbnMsIHRoaXMuJGVsLmRhdGEoKSk7XG5cbiAgICAgICAgaWYgKCRib2R5ID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgJGJvZHkgPSAkKCdib2R5Jyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMub3B0cy5zdGFydERhdGUpIHtcbiAgICAgICAgICAgIHRoaXMub3B0cy5zdGFydERhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuZWwubm9kZU5hbWUgPT0gJ0lOUFVUJykge1xuICAgICAgICAgICAgdGhpcy5lbElzSW5wdXQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0cy5hbHRGaWVsZCkge1xuICAgICAgICAgICAgdGhpcy4kYWx0RmllbGQgPSB0eXBlb2YgdGhpcy5vcHRzLmFsdEZpZWxkID09ICdzdHJpbmcnID8gJCh0aGlzLm9wdHMuYWx0RmllbGQpIDogdGhpcy5vcHRzLmFsdEZpZWxkO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pbml0ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc2lsZW50ID0gZmFsc2U7IC8vIE5lZWQgdG8gcHJldmVudCB1bm5lY2Vzc2FyeSByZW5kZXJpbmdcblxuICAgICAgICB0aGlzLmN1cnJlbnREYXRlID0gdGhpcy5vcHRzLnN0YXJ0RGF0ZTtcbiAgICAgICAgdGhpcy5jdXJyZW50VmlldyA9IHRoaXMub3B0cy52aWV3O1xuICAgICAgICB0aGlzLl9jcmVhdGVTaG9ydEN1dHMoKTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZERhdGVzID0gW107XG4gICAgICAgIHRoaXMudmlld3MgPSB7fTtcbiAgICAgICAgdGhpcy5rZXlzID0gW107XG4gICAgICAgIHRoaXMubWluUmFuZ2UgPSAnJztcbiAgICAgICAgdGhpcy5tYXhSYW5nZSA9ICcnO1xuXG4gICAgICAgIHRoaXMuaW5pdCgpXG4gICAgfTtcblxuICAgIGRhdGVwaWNrZXIgPSBEYXRlcGlja2VyO1xuXG4gICAgZGF0ZXBpY2tlci5wcm90b3R5cGUgPSB7XG4gICAgICAgIHZpZXdJbmRleGVzOiBbJ2RheXMnLCAnbW9udGhzJywgJ3llYXJzJ10sXG5cbiAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCFjb250YWluZXJCdWlsdCAmJiAhdGhpcy5vcHRzLmlubGluZSAmJiB0aGlzLmVsSXNJbnB1dCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2J1aWxkRGF0ZXBpY2tlcnNDb250YWluZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2J1aWxkQmFzZUh0bWwoKTtcbiAgICAgICAgICAgIHRoaXMuX2RlZmluZUxvY2FsZSh0aGlzLm9wdHMubGFuZ3VhZ2UpO1xuICAgICAgICAgICAgdGhpcy5fc3luY1dpdGhNaW5NYXhEYXRlcygpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5lbElzSW5wdXQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMub3B0cy5pbmxpbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU2V0IGV4dHJhIGNsYXNzZXMgZm9yIHByb3BlciB0cmFuc2l0aW9uc1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRQb3NpdGlvbkNsYXNzZXModGhpcy5vcHRzLnBvc2l0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYmluZEV2ZW50cygpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdHMua2V5Ym9hcmROYXYpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYmluZEtleWJvYXJkRXZlbnRzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXIub24oJ21vdXNlZG93bicsIHRoaXMuX29uTW91c2VEb3duRGF0ZXBpY2tlci5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyLm9uKCdtb3VzZXVwJywgdGhpcy5fb25Nb3VzZVVwRGF0ZXBpY2tlci5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5jbGFzc2VzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlci5hZGRDbGFzcyh0aGlzLm9wdHMuY2xhc3NlcylcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy52aWV3c1t0aGlzLmN1cnJlbnRWaWV3XSA9IG5ldyBEYXRlcGlja2VyLkJvZHkodGhpcywgdGhpcy5jdXJyZW50VmlldywgdGhpcy5vcHRzKTtcbiAgICAgICAgICAgIHRoaXMudmlld3NbdGhpcy5jdXJyZW50Vmlld10uc2hvdygpO1xuICAgICAgICAgICAgdGhpcy5uYXYgPSBuZXcgRGF0ZXBpY2tlci5OYXZpZ2F0aW9uKHRoaXMsIHRoaXMub3B0cyk7XG4gICAgICAgICAgICB0aGlzLnZpZXcgPSB0aGlzLmN1cnJlbnRWaWV3O1xuXG4gICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyLm9uKCdtb3VzZWVudGVyJywgJy5kYXRlcGlja2VyLS1jZWxsJywgdGhpcy5fb25Nb3VzZUVudGVyQ2VsbC5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXIub24oJ21vdXNlbGVhdmUnLCAnLmRhdGVwaWNrZXItLWNlbGwnLCB0aGlzLl9vbk1vdXNlTGVhdmVDZWxsLmJpbmQodGhpcykpO1xuXG4gICAgICAgICAgICB0aGlzLmluaXRlZCA9IHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2NyZWF0ZVNob3J0Q3V0czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5taW5EYXRlID0gdGhpcy5vcHRzLm1pbkRhdGUgPyB0aGlzLm9wdHMubWluRGF0ZSA6IG5ldyBEYXRlKC04NjM5OTk5OTEzNjAwMDAwKTtcbiAgICAgICAgICAgIHRoaXMubWF4RGF0ZSA9IHRoaXMub3B0cy5tYXhEYXRlID8gdGhpcy5vcHRzLm1heERhdGUgOiBuZXcgRGF0ZSg4NjM5OTk5OTEzNjAwMDAwKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfYmluZEV2ZW50cyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLm9uKHRoaXMub3B0cy5zaG93RXZlbnQgKyAnLmFkcCcsIHRoaXMuX29uU2hvd0V2ZW50LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgdGhpcy4kZWwub24oJ2JsdXIuYWRwJywgdGhpcy5fb25CbHVyLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgdGhpcy4kZWwub24oJ2lucHV0LmFkcCcsIHRoaXMuX29uSW5wdXQuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS5hZHAnLCB0aGlzLl9vblJlc2l6ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfYmluZEtleWJvYXJkRXZlbnRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5vbigna2V5ZG93bi5hZHAnLCB0aGlzLl9vbktleURvd24uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB0aGlzLiRlbC5vbigna2V5dXAuYWRwJywgdGhpcy5fb25LZXlVcC5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHRoaXMuJGVsLm9uKCdob3RLZXkuYWRwJywgdGhpcy5fb25Ib3RLZXkuYmluZCh0aGlzKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNXZWVrZW5kOiBmdW5jdGlvbiAoZGF5KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRzLndlZWtlbmRzLmluZGV4T2YoZGF5KSAhPT0gLTE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2RlZmluZUxvY2FsZTogZnVuY3Rpb24gKGxhbmcpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbGFuZyA9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHRoaXMubG9jID0gRGF0ZXBpY2tlci5sYW5ndWFnZVtsYW5nXTtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubG9jKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignQ2FuXFwndCBmaW5kIGxhbmd1YWdlIFwiJyArIGxhbmcgKyAnXCIgaW4gRGF0ZXBpY2tlci5sYW5ndWFnZSwgd2lsbCB1c2UgXCJydVwiIGluc3RlYWQnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2MgPSAkLmV4dGVuZCh0cnVlLCB7fSwgRGF0ZXBpY2tlci5sYW5ndWFnZS5ydSlcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLmxvYyA9ICQuZXh0ZW5kKHRydWUsIHt9LCBEYXRlcGlja2VyLmxhbmd1YWdlLnJ1LCBEYXRlcGlja2VyLmxhbmd1YWdlW2xhbmddKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYyA9ICQuZXh0ZW5kKHRydWUsIHt9LCBEYXRlcGlja2VyLmxhbmd1YWdlLnJ1LCBsYW5nKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLmRhdGVGb3JtYXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYy5kYXRlRm9ybWF0ID0gdGhpcy5vcHRzLmRhdGVGb3JtYXRcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5maXJzdERheSAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYy5maXJzdERheSA9IHRoaXMub3B0cy5maXJzdERheVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9idWlsZERhdGVwaWNrZXJzQ29udGFpbmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb250YWluZXJCdWlsdCA9IHRydWU7XG4gICAgICAgICAgICAkYm9keS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJkYXRlcGlja2Vycy1jb250YWluZXJcIiBpZD1cImRhdGVwaWNrZXJzLWNvbnRhaW5lclwiPjwvZGl2PicpO1xuICAgICAgICAgICAgJGRhdGVwaWNrZXJzQ29udGFpbmVyID0gJCgnI2RhdGVwaWNrZXJzLWNvbnRhaW5lcicpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9idWlsZEJhc2VIdG1sOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgJGFwcGVuZFRhcmdldCxcbiAgICAgICAgICAgICAgICAkaW5saW5lID0gJCgnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItaW5saW5lXCI+Jyk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZWwubm9kZU5hbWUgPT0gJ0lOUFVUJykge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5vcHRzLmlubGluZSkge1xuICAgICAgICAgICAgICAgICAgICAkYXBwZW5kVGFyZ2V0ID0gJGRhdGVwaWNrZXJzQ29udGFpbmVyO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICRhcHBlbmRUYXJnZXQgPSAkaW5saW5lLmluc2VydEFmdGVyKHRoaXMuJGVsKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJGFwcGVuZFRhcmdldCA9ICRpbmxpbmUuYXBwZW5kVG8odGhpcy4kZWwpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXIgPSAkKGJhc2VUZW1wbGF0ZSkuYXBwZW5kVG8oJGFwcGVuZFRhcmdldCk7XG4gICAgICAgICAgICB0aGlzLiRjb250ZW50ID0gJCgnLmRhdGVwaWNrZXItLWNvbnRlbnQnLCB0aGlzLiRkYXRlcGlja2VyKTtcbiAgICAgICAgICAgIHRoaXMuJG5hdiA9ICQoJy5kYXRlcGlja2VyLS1uYXYnLCB0aGlzLiRkYXRlcGlja2VyKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfdHJpZ2dlck9uQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuc2VsZWN0ZWREYXRlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRzLm9uU2VsZWN0KCcnLCAnJywgdGhpcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBzZWxlY3RlZERhdGVzID0gdGhpcy5zZWxlY3RlZERhdGVzLFxuICAgICAgICAgICAgICAgIHBhcnNlZFNlbGVjdGVkID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKHNlbGVjdGVkRGF0ZXNbMF0pLFxuICAgICAgICAgICAgICAgIGZvcm1hdHRlZERhdGVzLFxuICAgICAgICAgICAgICAgIF90aGlzID0gdGhpcyxcbiAgICAgICAgICAgICAgICBkYXRlcyA9IG5ldyBEYXRlKHBhcnNlZFNlbGVjdGVkLnllYXIsIHBhcnNlZFNlbGVjdGVkLm1vbnRoLCBwYXJzZWRTZWxlY3RlZC5kYXRlKTtcblxuICAgICAgICAgICAgICAgIGZvcm1hdHRlZERhdGVzID0gc2VsZWN0ZWREYXRlcy5tYXAoZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLmZvcm1hdERhdGUoX3RoaXMubG9jLmRhdGVGb3JtYXQsIGRhdGUpXG4gICAgICAgICAgICAgICAgfSkuam9pbih0aGlzLm9wdHMubXVsdGlwbGVEYXRlc1NlcGFyYXRvcik7XG5cbiAgICAgICAgICAgIC8vIENyZWF0ZSBuZXcgZGF0ZXMgYXJyYXksIHRvIHNlcGFyYXRlIGl0IGZyb20gb3JpZ2luYWwgc2VsZWN0ZWREYXRlc1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5tdWx0aXBsZURhdGVzIHx8IHRoaXMub3B0cy5yYW5nZSkge1xuICAgICAgICAgICAgICAgIGRhdGVzID0gc2VsZWN0ZWREYXRlcy5tYXAoZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGFyc2VkRGF0ZSA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZShkYXRlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHBhcnNlZERhdGUueWVhciwgcGFyc2VkRGF0ZS5tb250aCwgcGFyc2VkRGF0ZS5kYXRlKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMub3B0cy5vblNlbGVjdChmb3JtYXR0ZWREYXRlcywgZGF0ZXMsIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkID0gdGhpcy5wYXJzZWREYXRlLFxuICAgICAgICAgICAgICAgIG8gPSB0aGlzLm9wdHM7XG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMudmlldykge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2RheXMnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShkLnllYXIsIGQubW9udGggKyAxLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG8ub25DaGFuZ2VNb250aCkgby5vbkNoYW5nZU1vbnRoKHRoaXMucGFyc2VkRGF0ZS5tb250aCwgdGhpcy5wYXJzZWREYXRlLnllYXIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdtb250aHMnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShkLnllYXIgKyAxLCBkLm1vbnRoLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG8ub25DaGFuZ2VZZWFyKSBvLm9uQ2hhbmdlWWVhcih0aGlzLnBhcnNlZERhdGUueWVhcik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3llYXJzJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoZC55ZWFyICsgMTAsIDAsIDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoby5vbkNoYW5nZURlY2FkZSkgby5vbkNoYW5nZURlY2FkZSh0aGlzLmN1ckRlY2FkZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHByZXY6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkID0gdGhpcy5wYXJzZWREYXRlLFxuICAgICAgICAgICAgICAgIG8gPSB0aGlzLm9wdHM7XG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMudmlldykge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2RheXMnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShkLnllYXIsIGQubW9udGggLSAxLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG8ub25DaGFuZ2VNb250aCkgby5vbkNoYW5nZU1vbnRoKHRoaXMucGFyc2VkRGF0ZS5tb250aCwgdGhpcy5wYXJzZWREYXRlLnllYXIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdtb250aHMnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShkLnllYXIgLSAxLCBkLm1vbnRoLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG8ub25DaGFuZ2VZZWFyKSBvLm9uQ2hhbmdlWWVhcih0aGlzLnBhcnNlZERhdGUueWVhcik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3llYXJzJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoZC55ZWFyIC0gMTAsIDAsIDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoby5vbkNoYW5nZURlY2FkZSkgby5vbkNoYW5nZURlY2FkZSh0aGlzLmN1ckRlY2FkZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGZvcm1hdERhdGU6IGZ1bmN0aW9uIChzdHJpbmcsIGRhdGUpIHtcbiAgICAgICAgICAgIGRhdGUgPSBkYXRlIHx8IHRoaXMuZGF0ZTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBzdHJpbmcsXG4gICAgICAgICAgICAgICAgYm91bmRhcnkgPSB0aGlzLl9nZXRXb3JkQm91bmRhcnlSZWdFeHAsXG4gICAgICAgICAgICAgICAgbG9jYWxlID0gdGhpcy5sb2MsXG4gICAgICAgICAgICAgICAgZGVjYWRlID0gZGF0ZXBpY2tlci5nZXREZWNhZGUoZGF0ZSksXG4gICAgICAgICAgICAgICAgZCA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZShkYXRlKTtcblxuICAgICAgICAgICAgc3dpdGNoICh0cnVlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAvQC8udGVzdChyZXN1bHQpOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZSgvQC8sIGRhdGUuZ2V0VGltZSgpKTtcbiAgICAgICAgICAgICAgICBjYXNlIC9kZC8udGVzdChyZXN1bHQpOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgnZGQnKSwgZC5mdWxsRGF0ZSk7XG4gICAgICAgICAgICAgICAgY2FzZSAvZC8udGVzdChyZXN1bHQpOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgnZCcpLCBkLmRhdGUpO1xuICAgICAgICAgICAgICAgIGNhc2UgL0RELy50ZXN0KHJlc3VsdCk6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCdERCcpLCBsb2NhbGUuZGF5c1tkLmRheV0pO1xuICAgICAgICAgICAgICAgIGNhc2UgL0QvLnRlc3QocmVzdWx0KTpcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ0QnKSwgbG9jYWxlLmRheXNTaG9ydFtkLmRheV0pO1xuICAgICAgICAgICAgICAgIGNhc2UgL21tLy50ZXN0KHJlc3VsdCk6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCdtbScpLCBkLmZ1bGxNb250aCk7XG4gICAgICAgICAgICAgICAgY2FzZSAvbS8udGVzdChyZXN1bHQpOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgnbScpLCBkLm1vbnRoICsgMSk7XG4gICAgICAgICAgICAgICAgY2FzZSAvTU0vLnRlc3QocmVzdWx0KTpcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ01NJyksIHRoaXMubG9jLm1vbnRoc1tkLm1vbnRoXSk7XG4gICAgICAgICAgICAgICAgY2FzZSAvTS8udGVzdChyZXN1bHQpOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgnTScpLCBsb2NhbGUubW9udGhzU2hvcnRbZC5tb250aF0pO1xuICAgICAgICAgICAgICAgIGNhc2UgL3l5eXkvLnRlc3QocmVzdWx0KTpcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ3l5eXknKSwgZC55ZWFyKTtcbiAgICAgICAgICAgICAgICBjYXNlIC95eXl5MS8udGVzdChyZXN1bHQpOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgneXl5eTEnKSwgZGVjYWRlWzBdKTtcbiAgICAgICAgICAgICAgICBjYXNlIC95eXl5Mi8udGVzdChyZXN1bHQpOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgneXl5eTInKSwgZGVjYWRlWzFdKTtcbiAgICAgICAgICAgICAgICBjYXNlIC95eS8udGVzdChyZXN1bHQpOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgneXknKSwgZC55ZWFyLnRvU3RyaW5nKCkuc2xpY2UoLTIpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0V29yZEJvdW5kYXJ5UmVnRXhwOiBmdW5jdGlvbiAoc2lnbikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoJ1xcXFxiKD89W2EtekEtWjAtOcOkw7bDvMOfw4TDlsOcPF0pJyArIHNpZ24gKyAnKD8hWz5hLXpBLVowLTnDpMO2w7zDn8OEw5bDnF0pJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VsZWN0RGF0ZTogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0cyA9IF90aGlzLm9wdHMsXG4gICAgICAgICAgICAgICAgZCA9IF90aGlzLnBhcnNlZERhdGUsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWREYXRlcyA9IF90aGlzLnNlbGVjdGVkRGF0ZXMsXG4gICAgICAgICAgICAgICAgbGVuID0gc2VsZWN0ZWREYXRlcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgbmV3RGF0ZSA9ICcnO1xuXG4gICAgICAgICAgICBpZiAoIShkYXRlIGluc3RhbmNlb2YgRGF0ZSkpIHJldHVybjtcblxuICAgICAgICAgICAgaWYgKF90aGlzLnZpZXcgPT0gJ2RheXMnKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGUuZ2V0TW9udGgoKSAhPSBkLm1vbnRoICYmIG9wdHMubW92ZVRvT3RoZXJNb250aHNPblNlbGVjdCkge1xuICAgICAgICAgICAgICAgICAgICBuZXdEYXRlID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKF90aGlzLnZpZXcgPT0gJ3llYXJzJykge1xuICAgICAgICAgICAgICAgIGlmIChkYXRlLmdldEZ1bGxZZWFyKCkgIT0gZC55ZWFyICYmIG9wdHMubW92ZVRvT3RoZXJZZWFyc09uU2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld0RhdGUgPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIDAsIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG5ld0RhdGUpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5zaWxlbnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIF90aGlzLmRhdGUgPSBuZXdEYXRlO1xuICAgICAgICAgICAgICAgIF90aGlzLnNpbGVudCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIF90aGlzLm5hdi5fcmVuZGVyKClcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG9wdHMubXVsdGlwbGVEYXRlcyAmJiAhb3B0cy5yYW5nZSkgeyAvLyBTZXQgcHJpb3JpdHkgdG8gcmFuZ2UgZnVuY3Rpb25hbGl0eVxuICAgICAgICAgICAgICAgIGlmIChsZW4gPT09IG9wdHMubXVsdGlwbGVEYXRlcykgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGlmICghX3RoaXMuX2lzU2VsZWN0ZWQoZGF0ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2VsZWN0ZWREYXRlcy5wdXNoKGRhdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0cy5yYW5nZSkge1xuICAgICAgICAgICAgICAgIGlmIChsZW4gPT0gMikge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZWxlY3RlZERhdGVzID0gW2RhdGVdO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5taW5SYW5nZSA9IGRhdGU7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLm1heFJhbmdlID0gJyc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChsZW4gPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZWxlY3RlZERhdGVzLnB1c2goZGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghX3RoaXMubWF4UmFuZ2Upe1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMubWF4UmFuZ2UgPSBkYXRlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMubWluUmFuZ2UgPSBkYXRlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnNlbGVjdGVkRGF0ZXMgPSBbX3RoaXMubWluUmFuZ2UsIF90aGlzLm1heFJhbmdlXVxuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2VsZWN0ZWREYXRlcyA9IFtkYXRlXTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMubWluUmFuZ2UgPSBkYXRlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuc2VsZWN0ZWREYXRlcyA9IFtkYXRlXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgX3RoaXMuX3NldElucHV0VmFsdWUoKTtcblxuICAgICAgICAgICAgaWYgKG9wdHMub25TZWxlY3QpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5fdHJpZ2dlck9uQ2hhbmdlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcHRzLmF1dG9DbG9zZSkge1xuICAgICAgICAgICAgICAgIGlmICghb3B0cy5tdWx0aXBsZURhdGVzICYmICFvcHRzLnJhbmdlKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9wdHMucmFuZ2UgJiYgX3RoaXMuc2VsZWN0ZWREYXRlcy5sZW5ndGggPT0gMikge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfdGhpcy52aWV3c1t0aGlzLmN1cnJlbnRWaWV3XS5fcmVuZGVyKClcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVEYXRlOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgdmFyIHNlbGVjdGVkID0gdGhpcy5zZWxlY3RlZERhdGVzLFxuICAgICAgICAgICAgICAgIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKCEoZGF0ZSBpbnN0YW5jZW9mIERhdGUpKSByZXR1cm47XG5cbiAgICAgICAgICAgIHJldHVybiBzZWxlY3RlZC5zb21lKGZ1bmN0aW9uIChjdXJEYXRlLCBpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGVwaWNrZXIuaXNTYW1lKGN1ckRhdGUsIGRhdGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkLnNwbGljZShpLCAxKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIV90aGlzLnNlbGVjdGVkRGF0ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5taW5SYW5nZSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMubWF4UmFuZ2UgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnZpZXdzW190aGlzLmN1cnJlbnRWaWV3XS5fcmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLl9zZXRJbnB1dFZhbHVlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzLm9wdHMub25TZWxlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLl90cmlnZ2VyT25DaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICB0b2RheTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5zaWxlbnQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy52aWV3ID0gdGhpcy5vcHRzLm1pblZpZXc7XG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjbGVhcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZERhdGVzID0gW107XG4gICAgICAgICAgICB0aGlzLm1pblJhbmdlID0gJyc7XG4gICAgICAgICAgICB0aGlzLm1heFJhbmdlID0gJyc7XG4gICAgICAgICAgICB0aGlzLnZpZXdzW3RoaXMuY3VycmVudFZpZXddLl9yZW5kZXIoKTtcbiAgICAgICAgICAgIHRoaXMuX3NldElucHV0VmFsdWUoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMub25TZWxlY3QpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl90cmlnZ2VyT25DaGFuZ2UoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBVcGRhdGVzIGRhdGVwaWNrZXIgb3B0aW9uc1xuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IHBhcmFtIC0gcGFyYW1ldGVyJ3MgbmFtZSB0byB1cGRhdGUuIElmIG9iamVjdCB0aGVuIGl0IHdpbGwgZXh0ZW5kIGN1cnJlbnQgb3B0aW9uc1xuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ8T2JqZWN0fSBbdmFsdWVdIC0gbmV3IHBhcmFtIHZhbHVlXG4gICAgICAgICAqL1xuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIChwYXJhbSwgdmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICAgICAgaWYgKGxlbiA9PSAyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRzW3BhcmFtXSA9IHZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChsZW4gPT0gMSAmJiB0eXBlb2YgcGFyYW0gPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdHMgPSAkLmV4dGVuZCh0cnVlLCB0aGlzLm9wdHMsIHBhcmFtKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVTaG9ydEN1dHMoKTtcbiAgICAgICAgICAgIHRoaXMuX3N5bmNXaXRoTWluTWF4RGF0ZXMoKTtcbiAgICAgICAgICAgIHRoaXMuX2RlZmluZUxvY2FsZSh0aGlzLm9wdHMubGFuZ3VhZ2UpO1xuICAgICAgICAgICAgdGhpcy5uYXYuX2FkZEJ1dHRvbnNJZk5lZWQoKTtcbiAgICAgICAgICAgIHRoaXMubmF2Ll9yZW5kZXIoKTtcbiAgICAgICAgICAgIHRoaXMudmlld3NbdGhpcy5jdXJyZW50Vmlld10uX3JlbmRlcigpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5lbElzSW5wdXQgJiYgIXRoaXMub3B0cy5pbmxpbmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRQb3NpdGlvbkNsYXNzZXModGhpcy5vcHRzLnBvc2l0aW9uKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb24odGhpcy5vcHRzLnBvc2l0aW9uKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5jbGFzc2VzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlci5hZGRDbGFzcyh0aGlzLm9wdHMuY2xhc3NlcylcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3N5bmNXaXRoTWluTWF4RGF0ZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBjdXJUaW1lID0gdGhpcy5kYXRlLmdldFRpbWUoKTtcbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1pblRpbWUgPiBjdXJUaW1lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdGhpcy5taW5EYXRlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5tYXhUaW1lIDwgY3VyVGltZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHRoaXMubWF4RGF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2lzU2VsZWN0ZWQ6IGZ1bmN0aW9uIChjaGVja0RhdGUsIGNlbGxUeXBlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZERhdGVzLnNvbWUoZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0ZXBpY2tlci5pc1NhbWUoZGF0ZSwgY2hlY2tEYXRlLCBjZWxsVHlwZSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgX3NldElucHV0VmFsdWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0cyA9IF90aGlzLm9wdHMsXG4gICAgICAgICAgICAgICAgZm9ybWF0ID0gX3RoaXMubG9jLmRhdGVGb3JtYXQsXG4gICAgICAgICAgICAgICAgYWx0Rm9ybWF0ID0gb3B0cy5hbHRGaWVsZERhdGVGb3JtYXQsXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBfdGhpcy5zZWxlY3RlZERhdGVzLm1hcChmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuZm9ybWF0RGF0ZShmb3JtYXQsIGRhdGUpXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgYWx0VmFsdWVzO1xuXG4gICAgICAgICAgICBpZiAob3B0cy5hbHRGaWVsZCAmJiBfdGhpcy4kYWx0RmllbGQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgYWx0VmFsdWVzID0gdGhpcy5zZWxlY3RlZERhdGVzLm1hcChmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuZm9ybWF0RGF0ZShhbHRGb3JtYXQsIGRhdGUpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYWx0VmFsdWVzID0gYWx0VmFsdWVzLmpvaW4odGhpcy5vcHRzLm11bHRpcGxlRGF0ZXNTZXBhcmF0b3IpO1xuICAgICAgICAgICAgICAgIHRoaXMuJGFsdEZpZWxkLnZhbChhbHRWYWx1ZXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLmpvaW4odGhpcy5vcHRzLm11bHRpcGxlRGF0ZXNTZXBhcmF0b3IpO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC52YWwodmFsdWUpXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENoZWNrIGlmIGRhdGUgaXMgYmV0d2VlbiBtaW5EYXRlIGFuZCBtYXhEYXRlXG4gICAgICAgICAqIEBwYXJhbSBkYXRlIHtvYmplY3R9IC0gZGF0ZSBvYmplY3RcbiAgICAgICAgICogQHBhcmFtIHR5cGUge3N0cmluZ30gLSBjZWxsIHR5cGVcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfaXNJblJhbmdlOiBmdW5jdGlvbiAoZGF0ZSwgdHlwZSkge1xuICAgICAgICAgICAgdmFyIHRpbWUgPSBkYXRlLmdldFRpbWUoKSxcbiAgICAgICAgICAgICAgICBkID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKGRhdGUpLFxuICAgICAgICAgICAgICAgIG1pbiA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZSh0aGlzLm1pbkRhdGUpLFxuICAgICAgICAgICAgICAgIG1heCA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZSh0aGlzLm1heERhdGUpLFxuICAgICAgICAgICAgICAgIGRNaW5UaW1lID0gbmV3IERhdGUoZC55ZWFyLCBkLm1vbnRoLCBtaW4uZGF0ZSkuZ2V0VGltZSgpLFxuICAgICAgICAgICAgICAgIGRNYXhUaW1lID0gbmV3IERhdGUoZC55ZWFyLCBkLm1vbnRoLCBtYXguZGF0ZSkuZ2V0VGltZSgpLFxuICAgICAgICAgICAgICAgIHR5cGVzID0ge1xuICAgICAgICAgICAgICAgICAgICBkYXk6IHRpbWUgPj0gdGhpcy5taW5UaW1lICYmIHRpbWUgPD0gdGhpcy5tYXhUaW1lLFxuICAgICAgICAgICAgICAgICAgICBtb250aDogZE1pblRpbWUgPj0gdGhpcy5taW5UaW1lICYmIGRNYXhUaW1lIDw9IHRoaXMubWF4VGltZSxcbiAgICAgICAgICAgICAgICAgICAgeWVhcjogZC55ZWFyID49IG1pbi55ZWFyICYmIGQueWVhciA8PSBtYXgueWVhclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gdHlwZSA/IHR5cGVzW3R5cGVdIDogdHlwZXMuZGF5XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldERpbWVuc2lvbnM6IGZ1bmN0aW9uICgkZWwpIHtcbiAgICAgICAgICAgIHZhciBvZmZzZXQgPSAkZWwub2Zmc2V0KCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgd2lkdGg6ICRlbC5vdXRlcldpZHRoKCksXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAkZWwub3V0ZXJIZWlnaHQoKSxcbiAgICAgICAgICAgICAgICBsZWZ0OiBvZmZzZXQubGVmdCxcbiAgICAgICAgICAgICAgICB0b3A6IG9mZnNldC50b3BcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0RGF0ZUZyb21DZWxsOiBmdW5jdGlvbiAoY2VsbCkge1xuICAgICAgICAgICAgdmFyIGN1ckRhdGUgPSB0aGlzLnBhcnNlZERhdGUsXG4gICAgICAgICAgICAgICAgeWVhciA9IGNlbGwuZGF0YSgneWVhcicpIHx8IGN1ckRhdGUueWVhcixcbiAgICAgICAgICAgICAgICBtb250aCA9IGNlbGwuZGF0YSgnbW9udGgnKSA9PSB1bmRlZmluZWQgPyBjdXJEYXRlLm1vbnRoIDogY2VsbC5kYXRhKCdtb250aCcpLFxuICAgICAgICAgICAgICAgIGRhdGUgPSBjZWxsLmRhdGEoJ2RhdGUnKSB8fCAxO1xuXG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUoeWVhciwgbW9udGgsIGRhdGUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9zZXRQb3NpdGlvbkNsYXNzZXM6IGZ1bmN0aW9uIChwb3MpIHtcbiAgICAgICAgICAgIHBvcyA9IHBvcy5zcGxpdCgnICcpO1xuICAgICAgICAgICAgdmFyIG1haW4gPSBwb3NbMF0sXG4gICAgICAgICAgICAgICAgc2VjID0gcG9zWzFdLFxuICAgICAgICAgICAgICAgIGNsYXNzZXMgPSAnZGF0ZXBpY2tlciAtJyArIG1haW4gKyAnLScgKyBzZWMgKyAnLSAtZnJvbS0nICsgbWFpbiArICctJztcblxuICAgICAgICAgICAgaWYgKHRoaXMudmlzaWJsZSkgY2xhc3NlcyArPSAnIGFjdGl2ZSc7XG5cbiAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXJcbiAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cignY2xhc3MnKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcyhjbGFzc2VzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRQb3NpdGlvbjogZnVuY3Rpb24gKHBvc2l0aW9uKSB7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IHBvc2l0aW9uIHx8IHRoaXMub3B0cy5wb3NpdGlvbjtcblxuICAgICAgICAgICAgdmFyIGRpbXMgPSB0aGlzLl9nZXREaW1lbnNpb25zKHRoaXMuJGVsKSxcbiAgICAgICAgICAgICAgICBzZWxmRGltcyA9IHRoaXMuX2dldERpbWVuc2lvbnModGhpcy4kZGF0ZXBpY2tlciksXG4gICAgICAgICAgICAgICAgcG9zID0gcG9zaXRpb24uc3BsaXQoJyAnKSxcbiAgICAgICAgICAgICAgICB0b3AsIGxlZnQsXG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gdGhpcy5vcHRzLm9mZnNldCxcbiAgICAgICAgICAgICAgICBtYWluID0gcG9zWzBdLFxuICAgICAgICAgICAgICAgIHNlY29uZGFyeSA9IHBvc1sxXTtcblxuICAgICAgICAgICAgc3dpdGNoIChtYWluKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAndG9wJzpcbiAgICAgICAgICAgICAgICAgICAgdG9wID0gZGltcy50b3AgLSBzZWxmRGltcy5oZWlnaHQgLSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgICAgICAgICAgbGVmdCA9IGRpbXMubGVmdCArIGRpbXMud2lkdGggKyBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICAgICAgICAgICAgICAgIHRvcCA9IGRpbXMudG9wICsgZGltcy5oZWlnaHQgKyBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gZGltcy5sZWZ0IC0gc2VsZkRpbXMud2lkdGggLSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzd2l0Y2goc2Vjb25kYXJ5KSB7XG4gICAgICAgICAgICAgICAgY2FzZSAndG9wJzpcbiAgICAgICAgICAgICAgICAgICAgdG9wID0gZGltcy50b3A7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgICAgICAgICAgbGVmdCA9IGRpbXMubGVmdCArIGRpbXMud2lkdGggLSBzZWxmRGltcy53aWR0aDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnYm90dG9tJzpcbiAgICAgICAgICAgICAgICAgICAgdG9wID0gZGltcy50b3AgKyBkaW1zLmhlaWdodCAtIHNlbGZEaW1zLmhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICAgICAgICAgIGxlZnQgPSBkaW1zLmxlZnQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2NlbnRlcic6XG4gICAgICAgICAgICAgICAgICAgIGlmICgvbGVmdHxyaWdodC8udGVzdChtYWluKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9wID0gZGltcy50b3AgKyBkaW1zLmhlaWdodC8yIC0gc2VsZkRpbXMuaGVpZ2h0LzI7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gZGltcy5sZWZ0ICsgZGltcy53aWR0aC8yIC0gc2VsZkRpbXMud2lkdGgvMjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyXG4gICAgICAgICAgICAgICAgLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogdG9wXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLnNldFBvc2l0aW9uKHRoaXMub3B0cy5wb3NpdGlvbik7XG4gICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGlkZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlclxuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnYWN0aXZlJylcbiAgICAgICAgICAgICAgICAuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogJy0xMDAwMDBweCdcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5mb2N1c2VkID0gJyc7XG4gICAgICAgICAgICB0aGlzLmtleXMgPSBbXTtcblxuICAgICAgICAgICAgdGhpcy5pbkZvY3VzID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuJGVsLmJsdXIoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkb3duOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgdGhpcy5fY2hhbmdlVmlldyhkYXRlLCAnZG93bicpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHVwOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgdGhpcy5fY2hhbmdlVmlldyhkYXRlLCAndXAnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfY2hhbmdlVmlldzogZnVuY3Rpb24gKGRhdGUsIGRpcikge1xuICAgICAgICAgICAgZGF0ZSA9IGRhdGUgfHwgdGhpcy5mb2N1c2VkIHx8IHRoaXMuZGF0ZTtcblxuICAgICAgICAgICAgdmFyIG5leHRWaWV3ID0gZGlyID09ICd1cCcgPyB0aGlzLnZpZXdJbmRleCArIDEgOiB0aGlzLnZpZXdJbmRleCAtIDE7XG4gICAgICAgICAgICBpZiAobmV4dFZpZXcgPiAyKSBuZXh0VmlldyA9IDI7XG4gICAgICAgICAgICBpZiAobmV4dFZpZXcgPCAwKSBuZXh0VmlldyA9IDA7XG5cbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCAxKTtcbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnZpZXcgPSB0aGlzLnZpZXdJbmRleGVzW25leHRWaWV3XTtcblxuICAgICAgICB9LFxuXG4gICAgICAgIF9oYW5kbGVIb3RLZXk6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHZhciBkYXRlID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKHRoaXMuX2dldEZvY3VzZWREYXRlKCkpLFxuICAgICAgICAgICAgICAgIGZvY3VzZWRQYXJzZWQsXG4gICAgICAgICAgICAgICAgbyA9IHRoaXMub3B0cyxcbiAgICAgICAgICAgICAgICBuZXdEYXRlLFxuICAgICAgICAgICAgICAgIHRvdGFsRGF5c0luTmV4dE1vbnRoLFxuICAgICAgICAgICAgICAgIG1vbnRoQ2hhbmdlZCA9IGZhbHNlLFxuICAgICAgICAgICAgICAgIHllYXJDaGFuZ2VkID0gZmFsc2UsXG4gICAgICAgICAgICAgICAgZGVjYWRlQ2hhbmdlZCA9IGZhbHNlLFxuICAgICAgICAgICAgICAgIHkgPSBkYXRlLnllYXIsXG4gICAgICAgICAgICAgICAgbSA9IGRhdGUubW9udGgsXG4gICAgICAgICAgICAgICAgZCA9IGRhdGUuZGF0ZTtcblxuICAgICAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdjdHJsUmlnaHQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2N0cmxVcCc6XG4gICAgICAgICAgICAgICAgICAgIG0gKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgbW9udGhDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnY3RybExlZnQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2N0cmxEb3duJzpcbiAgICAgICAgICAgICAgICAgICAgbSAtPSAxO1xuICAgICAgICAgICAgICAgICAgICBtb250aENoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdzaGlmdFJpZ2h0JzpcbiAgICAgICAgICAgICAgICBjYXNlICdzaGlmdFVwJzpcbiAgICAgICAgICAgICAgICAgICAgeWVhckNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB5ICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3NoaWZ0TGVmdCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnc2hpZnREb3duJzpcbiAgICAgICAgICAgICAgICAgICAgeWVhckNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB5IC09IDE7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2FsdFJpZ2h0JzpcbiAgICAgICAgICAgICAgICBjYXNlICdhbHRVcCc6XG4gICAgICAgICAgICAgICAgICAgIGRlY2FkZUNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB5ICs9IDEwO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdhbHRMZWZ0JzpcbiAgICAgICAgICAgICAgICBjYXNlICdhbHREb3duJzpcbiAgICAgICAgICAgICAgICAgICAgZGVjYWRlQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHkgLT0gMTA7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2N0cmxTaGlmdFVwJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cCgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdG90YWxEYXlzSW5OZXh0TW9udGggPSBkYXRlcGlja2VyLmdldERheXNDb3VudChuZXcgRGF0ZSh5LG0pKTtcbiAgICAgICAgICAgIG5ld0RhdGUgPSBuZXcgRGF0ZSh5LG0sZCk7XG5cbiAgICAgICAgICAgIC8vIElmIG5leHQgbW9udGggaGFzIGxlc3MgZGF5cyB0aGFuIGN1cnJlbnQsIHNldCBkYXRlIHRvIHRvdGFsIGRheXMgaW4gdGhhdCBtb250aFxuICAgICAgICAgICAgaWYgKHRvdGFsRGF5c0luTmV4dE1vbnRoIDwgZCkgZCA9IHRvdGFsRGF5c0luTmV4dE1vbnRoO1xuXG4gICAgICAgICAgICAvLyBDaGVjayBpZiBuZXdEYXRlIGlzIGluIHZhbGlkIHJhbmdlXG4gICAgICAgICAgICBpZiAobmV3RGF0ZS5nZXRUaW1lKCkgPCB0aGlzLm1pblRpbWUpIHtcbiAgICAgICAgICAgICAgICBuZXdEYXRlID0gdGhpcy5taW5EYXRlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdEYXRlLmdldFRpbWUoKSA+IHRoaXMubWF4VGltZSkge1xuICAgICAgICAgICAgICAgIG5ld0RhdGUgPSB0aGlzLm1heERhdGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuZm9jdXNlZCA9IG5ld0RhdGU7XG5cbiAgICAgICAgICAgIGZvY3VzZWRQYXJzZWQgPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUobmV3RGF0ZSk7XG4gICAgICAgICAgICBpZiAobW9udGhDaGFuZ2VkICYmIG8ub25DaGFuZ2VNb250aCkge1xuICAgICAgICAgICAgICAgIG8ub25DaGFuZ2VNb250aChmb2N1c2VkUGFyc2VkLm1vbnRoLCBmb2N1c2VkUGFyc2VkLnllYXIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoeWVhckNoYW5nZWQgJiYgby5vbkNoYW5nZVllYXIpIHtcbiAgICAgICAgICAgICAgICBvLm9uQ2hhbmdlWWVhcihmb2N1c2VkUGFyc2VkLnllYXIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGVjYWRlQ2hhbmdlZCAmJiBvLm9uQ2hhbmdlRGVjYWRlKSB7XG4gICAgICAgICAgICAgICAgby5vbkNoYW5nZURlY2FkZSh0aGlzLmN1ckRlY2FkZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfcmVnaXN0ZXJLZXk6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHZhciBleGlzdHMgPSB0aGlzLmtleXMuc29tZShmdW5jdGlvbiAoY3VyS2V5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cktleSA9PSBrZXk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKCFleGlzdHMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmtleXMucHVzaChrZXkpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3VuUmVnaXN0ZXJLZXk6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMua2V5cy5pbmRleE9mKGtleSk7XG5cbiAgICAgICAgICAgIHRoaXMua2V5cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9pc0hvdEtleVByZXNzZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50SG90S2V5LFxuICAgICAgICAgICAgICAgIGZvdW5kID0gZmFsc2UsXG4gICAgICAgICAgICAgICAgX3RoaXMgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHByZXNzZWRLZXlzID0gdGhpcy5rZXlzLnNvcnQoKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaG90S2V5IGluIGhvdEtleXMpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50SG90S2V5ID0gaG90S2V5c1tob3RLZXldO1xuICAgICAgICAgICAgICAgIGlmIChwcmVzc2VkS2V5cy5sZW5ndGggIT0gY3VycmVudEhvdEtleS5sZW5ndGgpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRIb3RLZXkuZXZlcnkoZnVuY3Rpb24gKGtleSwgaSkgeyByZXR1cm4ga2V5ID09IHByZXNzZWRLZXlzW2ldfSkpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuX3RyaWdnZXIoJ2hvdEtleScsIGhvdEtleSk7XG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmb3VuZDtcbiAgICAgICAgfSxcblxuICAgICAgICBfdHJpZ2dlcjogZnVuY3Rpb24gKGV2ZW50LCBhcmdzKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC50cmlnZ2VyKGV2ZW50LCBhcmdzKVxuICAgICAgICB9LFxuXG4gICAgICAgIF9mb2N1c05leHRDZWxsOiBmdW5jdGlvbiAoa2V5Q29kZSwgdHlwZSkge1xuICAgICAgICAgICAgdHlwZSA9IHR5cGUgfHwgdGhpcy5jZWxsVHlwZTtcblxuICAgICAgICAgICAgdmFyIGRhdGUgPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUodGhpcy5fZ2V0Rm9jdXNlZERhdGUoKSksXG4gICAgICAgICAgICAgICAgeSA9IGRhdGUueWVhcixcbiAgICAgICAgICAgICAgICBtID0gZGF0ZS5tb250aCxcbiAgICAgICAgICAgICAgICBkID0gZGF0ZS5kYXRlO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5faXNIb3RLZXlQcmVzc2VkKCkpe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3dpdGNoKGtleUNvZGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDM3OiAvLyBsZWZ0XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ2RheScgPyAoZCAtPSAxKSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICdtb250aCcgPyAobSAtPSAxKSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICd5ZWFyJyA/ICh5IC09IDEpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMzg6IC8vIHVwXG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ2RheScgPyAoZCAtPSA3KSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICdtb250aCcgPyAobSAtPSAzKSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICd5ZWFyJyA/ICh5IC09IDQpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMzk6IC8vIHJpZ2h0XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ2RheScgPyAoZCArPSAxKSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICdtb250aCcgPyAobSArPSAxKSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICd5ZWFyJyA/ICh5ICs9IDEpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNDA6IC8vIGRvd25cbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAnZGF5JyA/IChkICs9IDcpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ21vbnRoJyA/IChtICs9IDMpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ3llYXInID8gKHkgKz0gNCkgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBuZCA9IG5ldyBEYXRlKHksbSxkKTtcbiAgICAgICAgICAgIGlmIChuZC5nZXRUaW1lKCkgPCB0aGlzLm1pblRpbWUpIHtcbiAgICAgICAgICAgICAgICBuZCA9IHRoaXMubWluRGF0ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmQuZ2V0VGltZSgpID4gdGhpcy5tYXhUaW1lKSB7XG4gICAgICAgICAgICAgICAgbmQgPSB0aGlzLm1heERhdGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuZm9jdXNlZCA9IG5kO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldEZvY3VzZWREYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZm9jdXNlZCAgPSB0aGlzLmZvY3VzZWQgfHwgdGhpcy5zZWxlY3RlZERhdGVzW3RoaXMuc2VsZWN0ZWREYXRlcy5sZW5ndGggLSAxXSxcbiAgICAgICAgICAgICAgICBkID0gdGhpcy5wYXJzZWREYXRlO1xuXG4gICAgICAgICAgICBpZiAoIWZvY3VzZWQpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMudmlldykge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdkYXlzJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzZWQgPSBuZXcgRGF0ZShkLnllYXIsIGQubW9udGgsIG5ldyBEYXRlKCkuZ2V0RGF0ZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdtb250aHMnOlxuICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXNlZCA9IG5ldyBEYXRlKGQueWVhciwgZC5tb250aCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAneWVhcnMnOlxuICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXNlZCA9IG5ldyBEYXRlKGQueWVhciwgMCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmb2N1c2VkO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRDZWxsOiBmdW5jdGlvbiAoZGF0ZSwgdHlwZSkge1xuICAgICAgICAgICAgdHlwZSA9IHR5cGUgfHwgdGhpcy5jZWxsVHlwZTtcblxuICAgICAgICAgICAgdmFyIGQgPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUoZGF0ZSksXG4gICAgICAgICAgICAgICAgc2VsZWN0b3IgPSAnLmRhdGVwaWNrZXItLWNlbGxbZGF0YS15ZWFyPVwiJyArIGQueWVhciArICdcIl0nLFxuICAgICAgICAgICAgICAgICRjZWxsO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdtb250aCc6XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gJ1tkYXRhLW1vbnRoPVwiJyArIGQubW9udGggKyAnXCJdJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnZGF5JzpcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IgKz0gJ1tkYXRhLW1vbnRoPVwiJyArIGQubW9udGggKyAnXCJdW2RhdGEtZGF0ZT1cIicgKyBkLmRhdGUgKyAnXCJdJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkY2VsbCA9IHRoaXMudmlld3NbdGhpcy5jdXJyZW50Vmlld10uJGVsLmZpbmQoc2VsZWN0b3IpO1xuXG4gICAgICAgICAgICByZXR1cm4gJGNlbGwubGVuZ3RoID8gJGNlbGwgOiAnJztcbiAgICAgICAgfSxcblxuICAgICAgICBkZXN0cm95OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgX3RoaXMuJGVsXG4gICAgICAgICAgICAgICAgLm9mZignLmFkcCcpXG4gICAgICAgICAgICAgICAgLmRhdGEoJ2RhdGVwaWNrZXInLCAnJyk7XG5cbiAgICAgICAgICAgIF90aGlzLnNlbGVjdGVkRGF0ZXMgPSBbXTtcbiAgICAgICAgICAgIF90aGlzLmZvY3VzZWQgPSAnJztcbiAgICAgICAgICAgIF90aGlzLnZpZXdzID0ge307XG4gICAgICAgICAgICBfdGhpcy5rZXlzID0gW107XG4gICAgICAgICAgICBfdGhpcy5taW5SYW5nZSA9ICcnO1xuICAgICAgICAgICAgX3RoaXMubWF4UmFuZ2UgPSAnJztcblxuICAgICAgICAgICAgaWYgKF90aGlzLm9wdHMuaW5saW5lIHx8ICFfdGhpcy5lbElzSW5wdXQpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy4kZGF0ZXBpY2tlci5jbG9zZXN0KCcuZGF0ZXBpY2tlci1pbmxpbmUnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuJGRhdGVwaWNrZXIucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uU2hvd0V2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9vbkJsdXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5pbkZvY3VzICYmIHRoaXMudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9vbk1vdXNlRG93bkRhdGVwaWNrZXI6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB0aGlzLmluRm9jdXMgPSB0cnVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9vbk1vdXNlVXBEYXRlcGlja2VyOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdGhpcy5pbkZvY3VzID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLiRlbC5mb2N1cygpXG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uSW5wdXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB2YWwgPSB0aGlzLiRlbC52YWwoKTtcblxuICAgICAgICAgICAgaWYgKCF2YWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uUmVzaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9vbktleURvd246IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgY29kZSA9IGUud2hpY2g7XG4gICAgICAgICAgICB0aGlzLl9yZWdpc3RlcktleShjb2RlKTtcblxuICAgICAgICAgICAgLy8gQXJyb3dzXG4gICAgICAgICAgICBpZiAoY29kZSA+PSAzNyAmJiBjb2RlIDw9IDQwKSB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2ZvY3VzTmV4dENlbGwoY29kZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEVudGVyXG4gICAgICAgICAgICBpZiAoY29kZSA9PSAxMykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZvY3VzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2dldENlbGwodGhpcy5mb2N1c2VkKS5oYXNDbGFzcygnLWRpc2FibGVkLScpKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnZpZXcgIT0gdGhpcy5vcHRzLm1pblZpZXcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZG93bigpXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWxyZWFkeVNlbGVjdGVkID0gdGhpcy5faXNTZWxlY3RlZCh0aGlzLmZvY3VzZWQsIHRoaXMuY2VsbFR5cGUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWFscmVhZHlTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0RGF0ZSh0aGlzLmZvY3VzZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhbHJlYWR5U2VsZWN0ZWQgJiYgdGhpcy5vcHRzLnRvZ2dsZVNlbGVjdGVkKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZURhdGUodGhpcy5mb2N1c2VkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRXNjXG4gICAgICAgICAgICBpZiAoY29kZSA9PSAyNykge1xuICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9vbktleVVwOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyIGNvZGUgPSBlLndoaWNoO1xuICAgICAgICAgICAgdGhpcy5fdW5SZWdpc3RlcktleShjb2RlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfb25Ib3RLZXk6IGZ1bmN0aW9uIChlLCBob3RLZXkpIHtcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZUhvdEtleShob3RLZXkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9vbk1vdXNlRW50ZXJDZWxsOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyICRjZWxsID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLmRhdGVwaWNrZXItLWNlbGwnKSxcbiAgICAgICAgICAgICAgICBkYXRlID0gdGhpcy5fZ2V0RGF0ZUZyb21DZWxsKCRjZWxsKTtcblxuICAgICAgICAgICAgLy8gUHJldmVudCBmcm9tIHVubmVjZXNzYXJ5IHJlbmRlcmluZyBhbmQgc2V0dGluZyBuZXcgY3VycmVudERhdGVcbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuZm9jdXNlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZm9jdXNlZCA9ICcnXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICRjZWxsLmFkZENsYXNzKCctZm9jdXMtJyk7XG5cbiAgICAgICAgICAgIHRoaXMuZm9jdXNlZCA9IGRhdGU7XG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IGZhbHNlO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLnJhbmdlICYmIHRoaXMuc2VsZWN0ZWREYXRlcy5sZW5ndGggPT0gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMubWluUmFuZ2UgPSB0aGlzLnNlbGVjdGVkRGF0ZXNbMF07XG4gICAgICAgICAgICAgICAgdGhpcy5tYXhSYW5nZSA9ICcnO1xuICAgICAgICAgICAgICAgIGlmIChkYXRlcGlja2VyLmxlc3ModGhpcy5taW5SYW5nZSwgdGhpcy5mb2N1c2VkKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1heFJhbmdlID0gdGhpcy5taW5SYW5nZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5taW5SYW5nZSA9ICcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdzW3RoaXMuY3VycmVudFZpZXddLl91cGRhdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfb25Nb3VzZUxlYXZlQ2VsbDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciAkY2VsbCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5kYXRlcGlja2VyLS1jZWxsJyk7XG5cbiAgICAgICAgICAgICRjZWxsLnJlbW92ZUNsYXNzKCctZm9jdXMtJyk7XG5cbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuZm9jdXNlZCA9ICcnO1xuICAgICAgICAgICAgdGhpcy5zaWxlbnQgPSBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXQgZm9jdXNlZCh2YWwpIHtcbiAgICAgICAgICAgIGlmICghdmFsICYmIHRoaXMuZm9jdXNlZCkge1xuICAgICAgICAgICAgICAgIHZhciAkY2VsbCA9IHRoaXMuX2dldENlbGwodGhpcy5mb2N1c2VkKTtcblxuICAgICAgICAgICAgICAgIGlmICgkY2VsbC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgJGNlbGwucmVtb3ZlQ2xhc3MoJy1mb2N1cy0nKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2ZvY3VzZWQgPSB2YWw7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLnJhbmdlICYmIHRoaXMuc2VsZWN0ZWREYXRlcy5sZW5ndGggPT0gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMubWluUmFuZ2UgPSB0aGlzLnNlbGVjdGVkRGF0ZXNbMF07XG4gICAgICAgICAgICAgICAgdGhpcy5tYXhSYW5nZSA9ICcnO1xuICAgICAgICAgICAgICAgIGlmIChkYXRlcGlja2VyLmxlc3ModGhpcy5taW5SYW5nZSwgdGhpcy5fZm9jdXNlZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXhSYW5nZSA9IHRoaXMubWluUmFuZ2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWluUmFuZ2UgPSAnJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5zaWxlbnQpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHZhbDtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXQgZm9jdXNlZCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9mb2N1c2VkO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldCBwYXJzZWREYXRlKCkge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZSh0aGlzLmRhdGUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldCBkYXRlICh2YWwpIHtcbiAgICAgICAgICAgIGlmICghKHZhbCBpbnN0YW5jZW9mIERhdGUpKSByZXR1cm47XG5cbiAgICAgICAgICAgIHRoaXMuY3VycmVudERhdGUgPSB2YWw7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmluaXRlZCAmJiAhdGhpcy5zaWxlbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdzW3RoaXMudmlld10uX3JlbmRlcigpO1xuICAgICAgICAgICAgICAgIHRoaXMubmF2Ll9yZW5kZXIoKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy52aXNpYmxlICYmIHRoaXMuZWxJc0lucHV0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb24oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdmFsO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldCBkYXRlICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnREYXRlXG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0IHZpZXcgKHZhbCkge1xuICAgICAgICAgICAgdGhpcy52aWV3SW5kZXggPSB0aGlzLnZpZXdJbmRleGVzLmluZGV4T2YodmFsKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMudmlld0luZGV4IDwgMCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5wcmV2VmlldyA9IHRoaXMuY3VycmVudFZpZXc7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gdmFsO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5pbml0ZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMudmlld3NbdmFsXSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXdzW3ZhbF0gPSBuZXcgRGF0ZXBpY2tlci5Cb2R5KHRoaXMsIHZhbCwgdGhpcy5vcHRzKVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlld3NbdmFsXS5fcmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy52aWV3c1t0aGlzLnByZXZWaWV3XS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy52aWV3c1t2YWxdLnNob3coKTtcbiAgICAgICAgICAgICAgICB0aGlzLm5hdi5fcmVuZGVyKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRzLm9uQ2hhbmdlVmlldykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdHMub25DaGFuZ2VWaWV3KHZhbClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZWxJc0lucHV0ICYmIHRoaXMudmlzaWJsZSkgdGhpcy5zZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdmFsXG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0IHZpZXcoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50VmlldztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXQgY2VsbFR5cGUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy52aWV3LnN1YnN0cmluZygwLCB0aGlzLnZpZXcubGVuZ3RoIC0gMSlcbiAgICAgICAgfSxcblxuICAgICAgICBnZXQgbWluVGltZSgpIHtcbiAgICAgICAgICAgIHZhciBtaW4gPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUodGhpcy5taW5EYXRlKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZShtaW4ueWVhciwgbWluLm1vbnRoLCBtaW4uZGF0ZSkuZ2V0VGltZSgpXG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0IG1heFRpbWUoKSB7XG4gICAgICAgICAgICB2YXIgbWF4ID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKHRoaXMubWF4RGF0ZSk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUobWF4LnllYXIsIG1heC5tb250aCwgbWF4LmRhdGUpLmdldFRpbWUoKVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldCBjdXJEZWNhZGUoKSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0ZXBpY2tlci5nZXREZWNhZGUodGhpcy5kYXRlKVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vICBVdGlsc1xuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIGRhdGVwaWNrZXIuZ2V0RGF5c0NvdW50ID0gZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpICsgMSwgMCkuZ2V0RGF0ZSgpO1xuICAgIH07XG5cbiAgICBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUgPSBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeWVhcjogZGF0ZS5nZXRGdWxsWWVhcigpLFxuICAgICAgICAgICAgbW9udGg6IGRhdGUuZ2V0TW9udGgoKSxcbiAgICAgICAgICAgIGZ1bGxNb250aDogKGRhdGUuZ2V0TW9udGgoKSArIDEpIDwgMTAgPyAnMCcgKyAoZGF0ZS5nZXRNb250aCgpICsgMSkgOiBkYXRlLmdldE1vbnRoKCkgKyAxLCAvLyBPbmUgYmFzZWRcbiAgICAgICAgICAgIGRhdGU6IGRhdGUuZ2V0RGF0ZSgpLFxuICAgICAgICAgICAgZnVsbERhdGU6IGRhdGUuZ2V0RGF0ZSgpIDwgMTAgPyAnMCcgKyBkYXRlLmdldERhdGUoKSA6IGRhdGUuZ2V0RGF0ZSgpLFxuICAgICAgICAgICAgZGF5OiBkYXRlLmdldERheSgpXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZGF0ZXBpY2tlci5nZXREZWNhZGUgPSBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICB2YXIgZmlyc3RZZWFyID0gTWF0aC5mbG9vcihkYXRlLmdldEZ1bGxZZWFyKCkgLyAxMCkgKiAxMDtcblxuICAgICAgICByZXR1cm4gW2ZpcnN0WWVhciwgZmlyc3RZZWFyICsgOV07XG4gICAgfTtcblxuICAgIGRhdGVwaWNrZXIudGVtcGxhdGUgPSBmdW5jdGlvbiAoc3RyLCBkYXRhKSB7XG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZSgvI1xceyhbXFx3XSspXFx9L2csIGZ1bmN0aW9uIChzb3VyY2UsIG1hdGNoKSB7XG4gICAgICAgICAgICBpZiAoZGF0YVttYXRjaF0gfHwgZGF0YVttYXRjaF0gPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0YVttYXRjaF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGRhdGVwaWNrZXIuaXNTYW1lID0gZnVuY3Rpb24gKGRhdGUxLCBkYXRlMiwgdHlwZSkge1xuICAgICAgICBpZiAoIWRhdGUxIHx8ICFkYXRlMikgcmV0dXJuIGZhbHNlO1xuICAgICAgICB2YXIgZDEgPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUoZGF0ZTEpLFxuICAgICAgICAgICAgZDIgPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUoZGF0ZTIpLFxuICAgICAgICAgICAgX3R5cGUgPSB0eXBlID8gdHlwZSA6ICdkYXknLFxuXG4gICAgICAgICAgICBjb25kaXRpb25zID0ge1xuICAgICAgICAgICAgICAgIGRheTogZDEuZGF0ZSA9PSBkMi5kYXRlICYmIGQxLm1vbnRoID09IGQyLm1vbnRoICYmIGQxLnllYXIgPT0gZDIueWVhcixcbiAgICAgICAgICAgICAgICBtb250aDogZDEubW9udGggPT0gZDIubW9udGggJiYgZDEueWVhciA9PSBkMi55ZWFyLFxuICAgICAgICAgICAgICAgIHllYXI6IGQxLnllYXIgPT0gZDIueWVhclxuICAgICAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gY29uZGl0aW9uc1tfdHlwZV07XG4gICAgfTtcblxuICAgIGRhdGVwaWNrZXIubGVzcyA9IGZ1bmN0aW9uIChkYXRlQ29tcGFyZVRvLCBkYXRlLCB0eXBlKSB7XG4gICAgICAgIGlmICghZGF0ZUNvbXBhcmVUbyB8fCAhZGF0ZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gZGF0ZS5nZXRUaW1lKCkgPCBkYXRlQ29tcGFyZVRvLmdldFRpbWUoKTtcbiAgICB9O1xuXG4gICAgZGF0ZXBpY2tlci5iaWdnZXIgPSBmdW5jdGlvbiAoZGF0ZUNvbXBhcmVUbywgZGF0ZSwgdHlwZSkge1xuICAgICAgICBpZiAoIWRhdGVDb21wYXJlVG8gfHwgIWRhdGUpIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIGRhdGUuZ2V0VGltZSgpID4gZGF0ZUNvbXBhcmVUby5nZXRUaW1lKCk7XG4gICAgfTtcblxuICAgIERhdGVwaWNrZXIubGFuZ3VhZ2UgPSB7XG4gICAgICAgIHJ1OiB7XG4gICAgICAgICAgICBkYXlzOiBbJ9CS0L7RgdC60YDQtdGB0LXQvdGM0LUnLCAn0J/QvtC90LXQtNC10LvRjNC90LjQuicsICfQktGC0L7RgNC90LjQuicsICfQodGA0LXQtNCwJywgJ9Cn0LXRgtCy0LXRgNCzJywgJ9Cf0Y/RgtC90LjRhtCwJywgJ9Ch0YPQsdCx0L7RgtCwJ10sXG4gICAgICAgICAgICBkYXlzU2hvcnQ6IFsn0JLQvtGBJywn0J/QvtC9Jywn0JLRgtC+Jywn0KHRgNC1Jywn0KfQtdGCJywn0J/Rj9GCJywn0KHRg9CxJ10sXG4gICAgICAgICAgICBkYXlzTWluOiBbJ9CS0YEnLCfQn9C9Jywn0JLRgicsJ9Ch0YAnLCfQp9GCJywn0J/RgicsJ9Ch0LEnXSxcbiAgICAgICAgICAgIG1vbnRoczogWyfQr9C90LLQsNGA0YwnLCAn0KTQtdCy0YDQsNC70YwnLCAn0JzQsNGA0YInLCAn0JDQv9GA0LXQu9GMJywgJ9Cc0LDQuScsICfQmNGO0L3RjCcsICfQmNGO0LvRjCcsICfQkNCy0LPRg9GB0YInLCAn0KHQtdC90YLRj9Cx0YDRjCcsICfQntC60YLRj9Cx0YDRjCcsICfQndC+0Y/QsdGA0YwnLCAn0JTQtdC60LDQsdGA0YwnXSxcbiAgICAgICAgICAgIG1vbnRoc1Nob3J0OiBbJ9Cv0L3QsicsICfQpNC10LInLCAn0JzQsNGAJywgJ9CQ0L/RgCcsICfQnNCw0LknLCAn0JjRjtC9JywgJ9CY0Y7QuycsICfQkNCy0LMnLCAn0KHQtdC9JywgJ9Ce0LrRgicsICfQndC+0Y8nLCAn0JTQtdC6J10sXG4gICAgICAgICAgICB0b2RheTogJ9Ch0LXQs9C+0LTQvdGPJyxcbiAgICAgICAgICAgIGNsZWFyOiAn0J7Rh9C40YHRgtC40YLRjCcsXG4gICAgICAgICAgICBkYXRlRm9ybWF0OiAnZGQubW0ueXl5eScsXG4gICAgICAgICAgICBmaXJzdERheTogMVxuICAgICAgICB9XG4gICAgfTtcblxuICAgICQuZm5bcGx1Z2luTmFtZV0gPSBmdW5jdGlvbiAoIG9wdGlvbnMgKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCEkLmRhdGEodGhpcywgcGx1Z2luTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAkLmRhdGEodGhpcywgIHBsdWdpbk5hbWUsXG4gICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlcGlja2VyKCB0aGlzLCBvcHRpb25zICkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSAkLmRhdGEodGhpcywgcGx1Z2luTmFtZSk7XG5cbiAgICAgICAgICAgICAgICBfdGhpcy5vcHRzID0gJC5leHRlbmQodHJ1ZSwgX3RoaXMub3B0cywgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgX3RoaXMudXBkYXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJChhdXRvSW5pdFNlbGVjdG9yKS5kYXRlcGlja2VyKCk7XG4gICAgfSlcblxufSkod2luZG93LCBqUXVlcnkpO1xuOyhmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRlbXBsYXRlcyA9IHtcbiAgICAgICAgZGF5czonJyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tZGF5cyBkYXRlcGlja2VyLS1ib2R5XCI+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tZGF5cy1uYW1lc1wiPjwvZGl2PicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLWNlbGxzIGRhdGVwaWNrZXItLWNlbGxzLWRheXNcIj48L2Rpdj4nICtcbiAgICAgICAgJzwvZGl2PicsXG4gICAgICAgIG1vbnRoczogJycgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLW1vbnRocyBkYXRlcGlja2VyLS1ib2R5XCI+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tY2VsbHMgZGF0ZXBpY2tlci0tY2VsbHMtbW9udGhzXCI+PC9kaXY+JyArXG4gICAgICAgICc8L2Rpdj4nLFxuICAgICAgICB5ZWFyczogJycgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLXllYXJzIGRhdGVwaWNrZXItLWJvZHlcIj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1jZWxscyBkYXRlcGlja2VyLS1jZWxscy15ZWFyc1wiPjwvZGl2PicgK1xuICAgICAgICAnPC9kaXY+J1xuICAgICAgICB9LFxuICAgICAgICBEID0gRGF0ZXBpY2tlcjtcblxuICAgIEQuQm9keSA9IGZ1bmN0aW9uIChkLCB0eXBlLCBvcHRzKSB7XG4gICAgICAgIHRoaXMuZCA9IGQ7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgIHRoaXMub3B0cyA9IG9wdHM7XG5cbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfTtcblxuICAgIEQuQm9keS5wcm90b3R5cGUgPSB7XG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuX2J1aWxkQmFzZUh0bWwoKTtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcigpO1xuXG4gICAgICAgICAgICB0aGlzLl9iaW5kRXZlbnRzKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2JpbmRFdmVudHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLm9uKCdjbGljaycsICcuZGF0ZXBpY2tlci0tY2VsbCcsICQucHJveHkodGhpcy5fb25DbGlja0NlbGwsIHRoaXMpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfYnVpbGRCYXNlSHRtbDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwgPSAkKHRlbXBsYXRlc1t0aGlzLnR5cGVdKS5hcHBlbmRUbyh0aGlzLmQuJGNvbnRlbnQpO1xuICAgICAgICAgICAgdGhpcy4kbmFtZXMgPSAkKCcuZGF0ZXBpY2tlci0tZGF5cy1uYW1lcycsIHRoaXMuJGVsKTtcbiAgICAgICAgICAgIHRoaXMuJGNlbGxzID0gJCgnLmRhdGVwaWNrZXItLWNlbGxzJywgdGhpcy4kZWwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXREYXlOYW1lc0h0bWw6IGZ1bmN0aW9uIChmaXJzdERheSwgY3VyRGF5LCBodG1sLCBpKSB7XG4gICAgICAgICAgICBjdXJEYXkgPSBjdXJEYXkgIT0gdW5kZWZpbmVkID8gY3VyRGF5IDogZmlyc3REYXk7XG4gICAgICAgICAgICBodG1sID0gaHRtbCA/IGh0bWwgOiAnJztcbiAgICAgICAgICAgIGkgPSBpICE9IHVuZGVmaW5lZCA/IGkgOiAwO1xuXG4gICAgICAgICAgICBpZiAoaSA+IDcpIHJldHVybiBodG1sO1xuICAgICAgICAgICAgaWYgKGN1ckRheSA9PSA3KSByZXR1cm4gdGhpcy5fZ2V0RGF5TmFtZXNIdG1sKGZpcnN0RGF5LCAwLCBodG1sLCArK2kpO1xuXG4gICAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tZGF5LW5hbWUnICsgKHRoaXMuZC5pc1dlZWtlbmQoY3VyRGF5KSA/IFwiIC13ZWVrZW5kLVwiIDogXCJcIikgKyAnXCI+JyArIHRoaXMuZC5sb2MuZGF5c01pbltjdXJEYXldICsgJzwvZGl2Pic7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXREYXlOYW1lc0h0bWwoZmlyc3REYXksICsrY3VyRGF5LCBodG1sLCArK2kpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRDZWxsQ29udGVudHM6IGZ1bmN0aW9uIChkYXRlLCB0eXBlKSB7XG4gICAgICAgICAgICB2YXIgY2xhc3NlcyA9IFwiZGF0ZXBpY2tlci0tY2VsbCBkYXRlcGlja2VyLS1jZWxsLVwiICsgdHlwZSxcbiAgICAgICAgICAgICAgICBjdXJyZW50RGF0ZSA9IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgcGFyZW50ID0gdGhpcy5kLFxuICAgICAgICAgICAgICAgIG9wdHMgPSBwYXJlbnQub3B0cyxcbiAgICAgICAgICAgICAgICBkID0gRC5nZXRQYXJzZWREYXRlKGRhdGUpLFxuICAgICAgICAgICAgICAgIHJlbmRlciA9IHt9LFxuICAgICAgICAgICAgICAgIGh0bWwgPSBkLmRhdGU7XG5cbiAgICAgICAgICAgIGlmIChvcHRzLm9uUmVuZGVyQ2VsbCkge1xuICAgICAgICAgICAgICAgIHJlbmRlciA9IG9wdHMub25SZW5kZXJDZWxsKGRhdGUsIHR5cGUpIHx8IHt9O1xuICAgICAgICAgICAgICAgIGh0bWwgPSByZW5kZXIuaHRtbCA/IHJlbmRlci5odG1sIDogaHRtbDtcbiAgICAgICAgICAgICAgICBjbGFzc2VzICs9IHJlbmRlci5jbGFzc2VzID8gJyAnICsgcmVuZGVyLmNsYXNzZXMgOiAnJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnZGF5JzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmVudC5pc1dlZWtlbmQoZC5kYXkpKSBjbGFzc2VzICs9IFwiIC13ZWVrZW5kLVwiO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZC5tb250aCAhPSB0aGlzLmQucGFyc2VkRGF0ZS5tb250aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NlcyArPSBcIiAtb3RoZXItbW9udGgtXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW9wdHMuc2VsZWN0T3RoZXJNb250aHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzICs9IFwiIC1kaXNhYmxlZC1cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghb3B0cy5zaG93T3RoZXJNb250aHMpIGh0bWwgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdtb250aCc6XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgPSBwYXJlbnQubG9jW3BhcmVudC5vcHRzLm1vbnRoc0ZpZWxkXVtkLm1vbnRoXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAneWVhcic6XG4gICAgICAgICAgICAgICAgICAgIHZhciBkZWNhZGUgPSBwYXJlbnQuY3VyRGVjYWRlO1xuICAgICAgICAgICAgICAgICAgICBodG1sID0gZC55ZWFyO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZC55ZWFyIDwgZGVjYWRlWzBdIHx8IGQueWVhciA+IGRlY2FkZVsxXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NlcyArPSAnIC1vdGhlci1kZWNhZGUtJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghb3B0cy5zZWxlY3RPdGhlclllYXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NlcyArPSBcIiAtZGlzYWJsZWQtXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW9wdHMuc2hvd090aGVyWWVhcnMpIGh0bWwgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG9wdHMub25SZW5kZXJDZWxsKSB7XG4gICAgICAgICAgICAgICAgcmVuZGVyID0gb3B0cy5vblJlbmRlckNlbGwoZGF0ZSwgdHlwZSkgfHwge307XG4gICAgICAgICAgICAgICAgaHRtbCA9IHJlbmRlci5odG1sID8gcmVuZGVyLmh0bWwgOiBodG1sO1xuICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gcmVuZGVyLmNsYXNzZXMgPyAnICcgKyByZW5kZXIuY2xhc3NlcyA6ICcnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob3B0cy5yYW5nZSkge1xuICAgICAgICAgICAgICAgIGlmIChELmlzU2FtZShwYXJlbnQubWluUmFuZ2UsIGRhdGUsIHR5cGUpKSBjbGFzc2VzICs9ICcgLXJhbmdlLWZyb20tJztcbiAgICAgICAgICAgICAgICBpZiAoRC5pc1NhbWUocGFyZW50Lm1heFJhbmdlLCBkYXRlLCB0eXBlKSkgY2xhc3NlcyArPSAnIC1yYW5nZS10by0nO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudC5zZWxlY3RlZERhdGVzLmxlbmd0aCA9PSAxICYmIHBhcmVudC5mb2N1c2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIChELmJpZ2dlcihwYXJlbnQubWluUmFuZ2UsIGRhdGUpICYmIEQubGVzcyhwYXJlbnQuZm9jdXNlZCwgZGF0ZSkpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAoRC5sZXNzKHBhcmVudC5tYXhSYW5nZSwgZGF0ZSkgJiYgRC5iaWdnZXIocGFyZW50LmZvY3VzZWQsIGRhdGUpKSlcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NlcyArPSAnIC1pbi1yYW5nZS0nXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoRC5sZXNzKHBhcmVudC5tYXhSYW5nZSwgZGF0ZSkgJiYgRC5pc1NhbWUocGFyZW50LmZvY3VzZWQsIGRhdGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzICs9ICcgLXJhbmdlLWZyb20tJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChELmJpZ2dlcihwYXJlbnQubWluUmFuZ2UsIGRhdGUpICYmIEQuaXNTYW1lKHBhcmVudC5mb2N1c2VkLCBkYXRlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NlcyArPSAnIC1yYW5nZS10by0nXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyZW50LnNlbGVjdGVkRGF0ZXMubGVuZ3RoID09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKEQuYmlnZ2VyKHBhcmVudC5taW5SYW5nZSwgZGF0ZSkgJiYgRC5sZXNzKHBhcmVudC5tYXhSYW5nZSwgZGF0ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gJyAtaW4tcmFuZ2UtJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIGlmIChELmlzU2FtZShjdXJyZW50RGF0ZSwgZGF0ZSwgdHlwZSkpIGNsYXNzZXMgKz0gJyAtY3VycmVudC0nO1xuICAgICAgICAgICAgaWYgKHBhcmVudC5mb2N1c2VkICYmIEQuaXNTYW1lKGRhdGUsIHBhcmVudC5mb2N1c2VkLCB0eXBlKSkgY2xhc3NlcyArPSAnIC1mb2N1cy0nO1xuICAgICAgICAgICAgaWYgKHBhcmVudC5faXNTZWxlY3RlZChkYXRlLCB0eXBlKSkgY2xhc3NlcyArPSAnIC1zZWxlY3RlZC0nO1xuICAgICAgICAgICAgaWYgKCFwYXJlbnQuX2lzSW5SYW5nZShkYXRlLCB0eXBlKSB8fCByZW5kZXIuZGlzYWJsZWQpIGNsYXNzZXMgKz0gJyAtZGlzYWJsZWQtJztcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBodG1sOiBodG1sLFxuICAgICAgICAgICAgICAgIGNsYXNzZXM6IGNsYXNzZXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2FsY3VsYXRlcyBkYXlzIG51bWJlciB0byByZW5kZXIuIEdlbmVyYXRlcyBkYXlzIGh0bWwgYW5kIHJldHVybnMgaXQuXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkYXRlIC0gRGF0ZSBvYmplY3RcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9nZXREYXlzSHRtbDogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgICAgIHZhciB0b3RhbE1vbnRoRGF5cyA9IEQuZ2V0RGF5c0NvdW50KGRhdGUpLFxuICAgICAgICAgICAgICAgIGZpcnN0TW9udGhEYXkgPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSwgMSkuZ2V0RGF5KCksXG4gICAgICAgICAgICAgICAgbGFzdE1vbnRoRGF5ID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIHRvdGFsTW9udGhEYXlzKS5nZXREYXkoKSxcbiAgICAgICAgICAgICAgICBkYXlzRnJvbVBldk1vbnRoID0gZmlyc3RNb250aERheSAtIHRoaXMuZC5sb2MuZmlyc3REYXksXG4gICAgICAgICAgICAgICAgZGF5c0Zyb21OZXh0TW9udGggPSA2IC0gbGFzdE1vbnRoRGF5ICsgdGhpcy5kLmxvYy5maXJzdERheTtcblxuICAgICAgICAgICAgZGF5c0Zyb21QZXZNb250aCA9IGRheXNGcm9tUGV2TW9udGggPCAwID8gZGF5c0Zyb21QZXZNb250aCArIDcgOiBkYXlzRnJvbVBldk1vbnRoO1xuICAgICAgICAgICAgZGF5c0Zyb21OZXh0TW9udGggPSBkYXlzRnJvbU5leHRNb250aCA+IDYgPyBkYXlzRnJvbU5leHRNb250aCAtIDcgOiBkYXlzRnJvbU5leHRNb250aDtcblxuICAgICAgICAgICAgdmFyIHN0YXJ0RGF5SW5kZXggPSAtZGF5c0Zyb21QZXZNb250aCArIDEsXG4gICAgICAgICAgICAgICAgbSwgeSxcbiAgICAgICAgICAgICAgICBodG1sID0gJyc7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBzdGFydERheUluZGV4LCBtYXggPSB0b3RhbE1vbnRoRGF5cyArIGRheXNGcm9tTmV4dE1vbnRoOyBpIDw9IG1heDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgeSA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcbiAgICAgICAgICAgICAgICBtID0gZGF0ZS5nZXRNb250aCgpO1xuXG4gICAgICAgICAgICAgICAgaHRtbCArPSB0aGlzLl9nZXREYXlIdG1sKG5ldyBEYXRlKHksIG0sIGkpKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0RGF5SHRtbDogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgICAgdmFyIGNvbnRlbnQgPSB0aGlzLl9nZXRDZWxsQ29udGVudHMoZGF0ZSwgJ2RheScpO1xuXG4gICAgICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCInICsgY29udGVudC5jbGFzc2VzICsgJ1wiICcgK1xuICAgICAgICAgICAgICAgICdkYXRhLWRhdGU9XCInICsgZGF0ZS5nZXREYXRlKCkgKyAnXCIgJyArXG4gICAgICAgICAgICAgICAgJ2RhdGEtbW9udGg9XCInICsgZGF0ZS5nZXRNb250aCgpICsgJ1wiICcgK1xuICAgICAgICAgICAgICAgICdkYXRhLXllYXI9XCInICsgZGF0ZS5nZXRGdWxsWWVhcigpICsgJ1wiPicgKyBjb250ZW50Lmh0bWwgKyAnPC9kaXY+JztcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogR2VuZXJhdGVzIG1vbnRocyBodG1sXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkYXRlIC0gZGF0ZSBpbnN0YW5jZVxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX2dldE1vbnRoc0h0bWw6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgICAgICB2YXIgaHRtbCA9ICcnLFxuICAgICAgICAgICAgICAgIGQgPSBELmdldFBhcnNlZERhdGUoZGF0ZSksXG4gICAgICAgICAgICAgICAgaSA9IDA7XG5cbiAgICAgICAgICAgIHdoaWxlKGkgPCAxMikge1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gdGhpcy5fZ2V0TW9udGhIdG1sKG5ldyBEYXRlKGQueWVhciwgaSkpO1xuICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0TW9udGhIdG1sOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgdmFyIGNvbnRlbnQgPSB0aGlzLl9nZXRDZWxsQ29udGVudHMoZGF0ZSwgJ21vbnRoJyk7XG5cbiAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cIicgKyBjb250ZW50LmNsYXNzZXMgKyAnXCIgZGF0YS1tb250aD1cIicgKyBkYXRlLmdldE1vbnRoKCkgKyAnXCI+JyArIGNvbnRlbnQuaHRtbCArICc8L2Rpdj4nXG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldFllYXJzSHRtbDogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgICAgIHZhciBkID0gRC5nZXRQYXJzZWREYXRlKGRhdGUpLFxuICAgICAgICAgICAgICAgIGRlY2FkZSA9IEQuZ2V0RGVjYWRlKGRhdGUpLFxuICAgICAgICAgICAgICAgIGZpcnN0WWVhciA9IGRlY2FkZVswXSAtIDEsXG4gICAgICAgICAgICAgICAgaHRtbCA9ICcnLFxuICAgICAgICAgICAgICAgIGkgPSBmaXJzdFllYXI7XG5cbiAgICAgICAgICAgIGZvciAoaTsgaSA8PSBkZWNhZGVbMV0gKyAxOyBpKyspIHtcbiAgICAgICAgICAgICAgICBodG1sICs9IHRoaXMuX2dldFllYXJIdG1sKG5ldyBEYXRlKGkgLCAwKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBodG1sO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRZZWFySHRtbDogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gdGhpcy5fZ2V0Q2VsbENvbnRlbnRzKGRhdGUsICd5ZWFyJyk7XG5cbiAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cIicgKyBjb250ZW50LmNsYXNzZXMgKyAnXCIgZGF0YS15ZWFyPVwiJyArIGRhdGUuZ2V0RnVsbFllYXIoKSArICdcIj4nICsgY29udGVudC5odG1sICsgJzwvZGl2PidcbiAgICAgICAgfSxcblxuICAgICAgICBfcmVuZGVyVHlwZXM6IHtcbiAgICAgICAgICAgIGRheXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGF5TmFtZXMgPSB0aGlzLl9nZXREYXlOYW1lc0h0bWwodGhpcy5kLmxvYy5maXJzdERheSksXG4gICAgICAgICAgICAgICAgICAgIGRheXMgPSB0aGlzLl9nZXREYXlzSHRtbCh0aGlzLmQuY3VycmVudERhdGUpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy4kY2VsbHMuaHRtbChkYXlzKTtcbiAgICAgICAgICAgICAgICB0aGlzLiRuYW1lcy5odG1sKGRheU5hbWVzKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1vbnRoczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBodG1sID0gdGhpcy5fZ2V0TW9udGhzSHRtbCh0aGlzLmQuY3VycmVudERhdGUpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy4kY2VsbHMuaHRtbChodG1sKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHllYXJzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGh0bWwgPSB0aGlzLl9nZXRZZWFyc0h0bWwodGhpcy5kLmN1cnJlbnREYXRlKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuJGNlbGxzLmh0bWwoaHRtbClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJUeXBlc1t0aGlzLnR5cGVdLmJpbmQodGhpcykoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgJGNlbGxzID0gJCgnLmRhdGVwaWNrZXItLWNlbGwnLCB0aGlzLiRjZWxscyksXG4gICAgICAgICAgICAgICAgX3RoaXMgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGNsYXNzZXMsXG4gICAgICAgICAgICAgICAgJGNlbGwsXG4gICAgICAgICAgICAgICAgZGF0ZTtcbiAgICAgICAgICAgICRjZWxscy5lYWNoKGZ1bmN0aW9uIChjZWxsLCBpKSB7XG4gICAgICAgICAgICAgICAgJGNlbGwgPSAkKHRoaXMpO1xuICAgICAgICAgICAgICAgIGRhdGUgPSBfdGhpcy5kLl9nZXREYXRlRnJvbUNlbGwoJCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgY2xhc3NlcyA9IF90aGlzLl9nZXRDZWxsQ29udGVudHMoZGF0ZSwgX3RoaXMuZC5jZWxsVHlwZSk7XG4gICAgICAgICAgICAgICAgJGNlbGwuYXR0cignY2xhc3MnLGNsYXNzZXMuY2xhc3NlcylcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3c6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgIHRoaXMuYWNpdHZlID0gdHJ1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBoaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vICBFdmVudHNcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgICAgIF9oYW5kbGVDbGljazogZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICB2YXIgZGF0ZSA9IGVsLmRhdGEoJ2RhdGUnKSB8fCAxLFxuICAgICAgICAgICAgICAgIG1vbnRoID0gZWwuZGF0YSgnbW9udGgnKSB8fCAwLFxuICAgICAgICAgICAgICAgIHllYXIgPSBlbC5kYXRhKCd5ZWFyJykgfHwgdGhpcy5kLnBhcnNlZERhdGUueWVhcjtcbiAgICAgICAgICAgIC8vIENoYW5nZSB2aWV3IGlmIG1pbiB2aWV3IGRvZXMgbm90IHJlYWNoIHlldFxuICAgICAgICAgICAgaWYgKHRoaXMuZC52aWV3ICE9IHRoaXMub3B0cy5taW5WaWV3KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kLmRvd24obmV3IERhdGUoeWVhciwgbW9udGgsIGRhdGUpKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBTZWxlY3QgZGF0ZSBpZiBtaW4gdmlldyBpcyByZWFjaGVkXG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWREYXRlID0gbmV3IERhdGUoeWVhciwgbW9udGgsIGRhdGUpLFxuICAgICAgICAgICAgICAgIGFscmVhZHlTZWxlY3RlZCA9IHRoaXMuZC5faXNTZWxlY3RlZChzZWxlY3RlZERhdGUsIHRoaXMuZC5jZWxsVHlwZSk7XG5cbiAgICAgICAgICAgIGlmICghYWxyZWFkeVNlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kLnNlbGVjdERhdGUoc2VsZWN0ZWREYXRlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWxyZWFkeVNlbGVjdGVkICYmIHRoaXMub3B0cy50b2dnbGVTZWxlY3RlZCl7XG4gICAgICAgICAgICAgICAgdGhpcy5kLnJlbW92ZURhdGUoc2VsZWN0ZWREYXRlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LFxuXG4gICAgICAgIF9vbkNsaWNrQ2VsbDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciAkZWwgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcuZGF0ZXBpY2tlci0tY2VsbCcpO1xuXG4gICAgICAgICAgICBpZiAoJGVsLmhhc0NsYXNzKCctZGlzYWJsZWQtJykpIHJldHVybjtcblxuICAgICAgICAgICAgdGhpcy5faGFuZGxlQ2xpY2suYmluZCh0aGlzKSgkZWwpO1xuICAgICAgICB9XG4gICAgfTtcbn0pKCk7XG5cbjsoZnVuY3Rpb24gKCkge1xuICAgIHZhciB0ZW1wbGF0ZSA9ICcnICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1uYXYtYWN0aW9uXCIgZGF0YS1hY3Rpb249XCJwcmV2XCI+I3twcmV2SHRtbH08L2Rpdj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1uYXYtdGl0bGVcIj4je3RpdGxlfTwvZGl2PicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLW5hdi1hY3Rpb25cIiBkYXRhLWFjdGlvbj1cIm5leHRcIj4je25leHRIdG1sfTwvZGl2PicsXG4gICAgICAgIGJ1dHRvbnNDb250YWluZXJUZW1wbGF0ZSA9ICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tYnV0dG9uc1wiPjwvZGl2PicsXG4gICAgICAgIGJ1dHRvbiA9ICc8c3BhbiBjbGFzcz1cImRhdGVwaWNrZXItLWJ1dHRvblwiIGRhdGEtYWN0aW9uPVwiI3thY3Rpb259XCI+I3tsYWJlbH08L3NwYW4+JztcblxuICAgIERhdGVwaWNrZXIuTmF2aWdhdGlvbiA9IGZ1bmN0aW9uIChkLCBvcHRzKSB7XG4gICAgICAgIHRoaXMuZCA9IGQ7XG4gICAgICAgIHRoaXMub3B0cyA9IG9wdHM7XG5cbiAgICAgICAgdGhpcy4kYnV0dG9uc0NvbnRhaW5lciA9ICcnO1xuXG4gICAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH07XG5cbiAgICBEYXRlcGlja2VyLk5hdmlnYXRpb24ucHJvdG90eXBlID0ge1xuICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl9idWlsZEJhc2VIdG1sKCk7XG4gICAgICAgICAgICB0aGlzLl9iaW5kRXZlbnRzKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2JpbmRFdmVudHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuZC4kbmF2Lm9uKCdjbGljaycsICcuZGF0ZXBpY2tlci0tbmF2LWFjdGlvbicsICQucHJveHkodGhpcy5fb25DbGlja05hdkJ1dHRvbiwgdGhpcykpO1xuICAgICAgICAgICAgdGhpcy5kLiRuYXYub24oJ2NsaWNrJywgJy5kYXRlcGlja2VyLS1uYXYtdGl0bGUnLCAkLnByb3h5KHRoaXMuX29uQ2xpY2tOYXZUaXRsZSwgdGhpcykpO1xuICAgICAgICAgICAgdGhpcy5kLiRkYXRlcGlja2VyLm9uKCdjbGljaycsICcuZGF0ZXBpY2tlci0tYnV0dG9uJywgJC5wcm94eSh0aGlzLl9vbkNsaWNrTmF2QnV0dG9uLCB0aGlzKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2J1aWxkQmFzZUh0bWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcigpO1xuICAgICAgICAgICAgdGhpcy5fYWRkQnV0dG9uc0lmTmVlZCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9hZGRCdXR0b25zSWZOZWVkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLnRvZGF5QnV0dG9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkQnV0dG9uKCd0b2RheScpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLmNsZWFyQnV0dG9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkQnV0dG9uKCdjbGVhcicpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3JlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRpdGxlID0gdGhpcy5fZ2V0VGl0bGUodGhpcy5kLmN1cnJlbnREYXRlKSxcbiAgICAgICAgICAgICAgICBodG1sID0gRGF0ZXBpY2tlci50ZW1wbGF0ZSh0ZW1wbGF0ZSwgJC5leHRlbmQoe3RpdGxlOiB0aXRsZX0sIHRoaXMub3B0cykpO1xuICAgICAgICAgICAgdGhpcy5kLiRuYXYuaHRtbChodG1sKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmQudmlldyA9PSAneWVhcnMnKSB7XG4gICAgICAgICAgICAgICAgJCgnLmRhdGVwaWNrZXItLW5hdi10aXRsZScsIHRoaXMuZC4kbmF2KS5hZGRDbGFzcygnLWRpc2FibGVkLScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXROYXZTdGF0dXMoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0VGl0bGU6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kLmZvcm1hdERhdGUodGhpcy5vcHRzLm5hdlRpdGxlc1t0aGlzLmQudmlld10sIGRhdGUpXG4gICAgICAgIH0sXG5cbiAgICAgICAgX2FkZEJ1dHRvbjogZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy4kYnV0dG9uc0NvbnRhaW5lci5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRCdXR0b25zQ29udGFpbmVyKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IHR5cGUsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiB0aGlzLmQubG9jW3R5cGVdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBodG1sID0gRGF0ZXBpY2tlci50ZW1wbGF0ZShidXR0b24sIGRhdGEpO1xuXG4gICAgICAgICAgICBpZiAoJCgnW2RhdGEtYWN0aW9uPScgKyB0eXBlICsgJ10nLCB0aGlzLiRidXR0b25zQ29udGFpbmVyKS5sZW5ndGgpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuJGJ1dHRvbnNDb250YWluZXIuYXBwZW5kKGh0bWwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9hZGRCdXR0b25zQ29udGFpbmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmQuJGRhdGVwaWNrZXIuYXBwZW5kKGJ1dHRvbnNDb250YWluZXJUZW1wbGF0ZSk7XG4gICAgICAgICAgICB0aGlzLiRidXR0b25zQ29udGFpbmVyID0gJCgnLmRhdGVwaWNrZXItLWJ1dHRvbnMnLCB0aGlzLmQuJGRhdGVwaWNrZXIpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldE5hdlN0YXR1czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCEodGhpcy5vcHRzLm1pbkRhdGUgfHwgdGhpcy5vcHRzLm1heERhdGUpIHx8ICF0aGlzLm9wdHMuZGlzYWJsZU5hdldoZW5PdXRPZlJhbmdlKSByZXR1cm47XG5cbiAgICAgICAgICAgIHZhciBkYXRlID0gdGhpcy5kLnBhcnNlZERhdGUsXG4gICAgICAgICAgICAgICAgbSA9IGRhdGUubW9udGgsXG4gICAgICAgICAgICAgICAgeSA9IGRhdGUueWVhcixcbiAgICAgICAgICAgICAgICBkID0gZGF0ZS5kYXRlO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMuZC52aWV3KSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnZGF5cyc6XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5kLl9pc0luUmFuZ2UobmV3IERhdGUoeSwgbS0xLCBkKSwgJ21vbnRoJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVOYXYoJ3ByZXYnKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5kLl9pc0luUmFuZ2UobmV3IERhdGUoeSwgbSsxLCBkKSwgJ21vbnRoJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVOYXYoJ25leHQnKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ21vbnRocyc6XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5kLl9pc0luUmFuZ2UobmV3IERhdGUoeS0xLCBtLCBkKSwgJ3llYXInKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZU5hdigncHJldicpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmQuX2lzSW5SYW5nZShuZXcgRGF0ZSh5KzEsIG0sIGQpLCAneWVhcicpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlTmF2KCduZXh0JylcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICd5ZWFycyc6XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5kLl9pc0luUmFuZ2UobmV3IERhdGUoeS0xMCwgbSwgZCksICd5ZWFyJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVOYXYoJ3ByZXYnKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5kLl9pc0luUmFuZ2UobmV3IERhdGUoeSsxMCwgbSwgZCksICd5ZWFyJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVOYXYoJ25leHQnKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9kaXNhYmxlTmF2OiBmdW5jdGlvbiAobmF2KSB7XG4gICAgICAgICAgICAkKCdbZGF0YS1hY3Rpb249XCInICsgbmF2ICsgJ1wiXScsIHRoaXMuZC4kbmF2KS5hZGRDbGFzcygnLWRpc2FibGVkLScpXG4gICAgICAgIH0sXG5cbiAgICAgICAgX2FjdGl2YXRlTmF2OiBmdW5jdGlvbiAobmF2KSB7XG4gICAgICAgICAgICAkKCdbZGF0YS1hY3Rpb249XCInICsgbmF2ICsgJ1wiXScsIHRoaXMuZC4kbmF2KS5yZW1vdmVDbGFzcygnLWRpc2FibGVkLScpXG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uQ2xpY2tOYXZCdXR0b246IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgJGVsID0gJChlLnRhcmdldCkuY2xvc2VzdCgnW2RhdGEtYWN0aW9uXScpLFxuICAgICAgICAgICAgICAgIGFjdGlvbiA9ICRlbC5kYXRhKCdhY3Rpb24nKTtcblxuICAgICAgICAgICAgdGhpcy5kW2FjdGlvbl0oKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfb25DbGlja05hdlRpdGxlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgaWYgKCQoZS50YXJnZXQpLmhhc0NsYXNzKCctZGlzYWJsZWQtJykpIHJldHVybjtcblxuICAgICAgICAgICAgaWYgKHRoaXMuZC52aWV3ID09ICdkYXlzJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmQudmlldyA9ICdtb250aHMnXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuZC52aWV3ID0gJ3llYXJzJztcbiAgICAgICAgfVxuICAgIH1cblxufSkoKTtcbiIsIiFmdW5jdGlvbihhLGIpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW1wianF1ZXJ5XCJdLGIpOlwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP21vZHVsZS5leHBvcnRzPWIocmVxdWlyZShcImpxdWVyeVwiKSk6YihhLmpRdWVyeSl9KHRoaXMsZnVuY3Rpb24oYSl7XCJmdW5jdGlvblwiIT10eXBlb2YgT2JqZWN0LmNyZWF0ZSYmKE9iamVjdC5jcmVhdGU9ZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYigpe31yZXR1cm4gYi5wcm90b3R5cGU9YSxuZXcgYn0pO3ZhciBiPXtpbml0OmZ1bmN0aW9uKGIpe3JldHVybiB0aGlzLm9wdGlvbnM9YS5leHRlbmQoe30sYS5ub3R5LmRlZmF1bHRzLGIpLHRoaXMub3B0aW9ucy5sYXlvdXQ9dGhpcy5vcHRpb25zLmN1c3RvbT9hLm5vdHkubGF5b3V0cy5pbmxpbmU6YS5ub3R5LmxheW91dHNbdGhpcy5vcHRpb25zLmxheW91dF0sYS5ub3R5LnRoZW1lc1t0aGlzLm9wdGlvbnMudGhlbWVdP3RoaXMub3B0aW9ucy50aGVtZT1hLm5vdHkudGhlbWVzW3RoaXMub3B0aW9ucy50aGVtZV06dGhpcy5vcHRpb25zLnRoZW1lQ2xhc3NOYW1lPXRoaXMub3B0aW9ucy50aGVtZSx0aGlzLm9wdGlvbnM9YS5leHRlbmQoe30sdGhpcy5vcHRpb25zLHRoaXMub3B0aW9ucy5sYXlvdXQub3B0aW9ucyksdGhpcy5vcHRpb25zLmlkPVwibm90eV9cIisobmV3IERhdGUpLmdldFRpbWUoKSpNYXRoLmZsb29yKDFlNipNYXRoLnJhbmRvbSgpKSx0aGlzLl9idWlsZCgpLHRoaXN9LF9idWlsZDpmdW5jdGlvbigpe3ZhciBiPWEoJzxkaXYgY2xhc3M9XCJub3R5X2JhciBub3R5X3R5cGVfJyt0aGlzLm9wdGlvbnMudHlwZSsnXCI+PC9kaXY+JykuYXR0cihcImlkXCIsdGhpcy5vcHRpb25zLmlkKTtpZihiLmFwcGVuZCh0aGlzLm9wdGlvbnMudGVtcGxhdGUpLmZpbmQoXCIubm90eV90ZXh0XCIpLmh0bWwodGhpcy5vcHRpb25zLnRleHQpLHRoaXMuJGJhcj1udWxsIT09dGhpcy5vcHRpb25zLmxheW91dC5wYXJlbnQub2JqZWN0P2EodGhpcy5vcHRpb25zLmxheW91dC5wYXJlbnQub2JqZWN0KS5jc3ModGhpcy5vcHRpb25zLmxheW91dC5wYXJlbnQuY3NzKS5hcHBlbmQoYik6Yix0aGlzLm9wdGlvbnMudGhlbWVDbGFzc05hbWUmJnRoaXMuJGJhci5hZGRDbGFzcyh0aGlzLm9wdGlvbnMudGhlbWVDbGFzc05hbWUpLmFkZENsYXNzKFwibm90eV9jb250YWluZXJfdHlwZV9cIit0aGlzLm9wdGlvbnMudHlwZSksdGhpcy5vcHRpb25zLmJ1dHRvbnMpe3RoaXMub3B0aW9ucy5jbG9zZVdpdGg9W10sdGhpcy5vcHRpb25zLnRpbWVvdXQ9ITE7dmFyIGM9YShcIjxkaXYvPlwiKS5hZGRDbGFzcyhcIm5vdHlfYnV0dG9uc1wiKTtudWxsIT09dGhpcy5vcHRpb25zLmxheW91dC5wYXJlbnQub2JqZWN0P3RoaXMuJGJhci5maW5kKFwiLm5vdHlfYmFyXCIpLmFwcGVuZChjKTp0aGlzLiRiYXIuYXBwZW5kKGMpO3ZhciBkPXRoaXM7YS5lYWNoKHRoaXMub3B0aW9ucy5idXR0b25zLGZ1bmN0aW9uKGIsYyl7dmFyIGU9YShcIjxidXR0b24vPlwiKS5hZGRDbGFzcyhjLmFkZENsYXNzP2MuYWRkQ2xhc3M6XCJncmF5XCIpLmh0bWwoYy50ZXh0KS5hdHRyKFwiaWRcIixjLmlkP2MuaWQ6XCJidXR0b24tXCIrYikuYXR0cihcInRpdGxlXCIsYy50aXRsZSkuYXBwZW5kVG8oZC4kYmFyLmZpbmQoXCIubm90eV9idXR0b25zXCIpKS5vbihcImNsaWNrXCIsZnVuY3Rpb24oYil7YS5pc0Z1bmN0aW9uKGMub25DbGljaykmJmMub25DbGljay5jYWxsKGUsZCxiKX0pfSl9dGhpcy4kbWVzc2FnZT10aGlzLiRiYXIuZmluZChcIi5ub3R5X21lc3NhZ2VcIiksdGhpcy4kY2xvc2VCdXR0b249dGhpcy4kYmFyLmZpbmQoXCIubm90eV9jbG9zZVwiKSx0aGlzLiRidXR0b25zPXRoaXMuJGJhci5maW5kKFwiLm5vdHlfYnV0dG9uc1wiKSxhLm5vdHkuc3RvcmVbdGhpcy5vcHRpb25zLmlkXT10aGlzfSxzaG93OmZ1bmN0aW9uKCl7dmFyIGI9dGhpcztyZXR1cm4gYi5vcHRpb25zLmN1c3RvbT9iLm9wdGlvbnMuY3VzdG9tLmZpbmQoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmFwcGVuZChiLiRiYXIpOmEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmFwcGVuZChiLiRiYXIpLGIub3B0aW9ucy50aGVtZSYmYi5vcHRpb25zLnRoZW1lLnN0eWxlJiZiLm9wdGlvbnMudGhlbWUuc3R5bGUuYXBwbHkoYiksXCJmdW5jdGlvblwiPT09YS50eXBlKGIub3B0aW9ucy5sYXlvdXQuY3NzKT90aGlzLm9wdGlvbnMubGF5b3V0LmNzcy5hcHBseShiLiRiYXIpOmIuJGJhci5jc3ModGhpcy5vcHRpb25zLmxheW91dC5jc3N8fHt9KSxiLiRiYXIuYWRkQ2xhc3MoYi5vcHRpb25zLmxheW91dC5hZGRDbGFzcyksYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc3R5bGUuYXBwbHkoYShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvciksW2Iub3B0aW9ucy53aXRoaW5dKSxiLnNob3dpbmc9ITAsYi5vcHRpb25zLnRoZW1lJiZiLm9wdGlvbnMudGhlbWUuc3R5bGUmJmIub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vblNob3cuYXBwbHkodGhpcyksYS5pbkFycmF5KFwiY2xpY2tcIixiLm9wdGlvbnMuY2xvc2VXaXRoKT4tMSYmYi4kYmFyLmNzcyhcImN1cnNvclwiLFwicG9pbnRlclwiKS5vbmUoXCJjbGlja1wiLGZ1bmN0aW9uKGEpe2Iuc3RvcFByb3BhZ2F0aW9uKGEpLGIub3B0aW9ucy5jYWxsYmFjay5vbkNsb3NlQ2xpY2smJmIub3B0aW9ucy5jYWxsYmFjay5vbkNsb3NlQ2xpY2suYXBwbHkoYiksYi5jbG9zZSgpfSksYS5pbkFycmF5KFwiaG92ZXJcIixiLm9wdGlvbnMuY2xvc2VXaXRoKT4tMSYmYi4kYmFyLm9uZShcIm1vdXNlZW50ZXJcIixmdW5jdGlvbigpe2IuY2xvc2UoKX0pLGEuaW5BcnJheShcImJ1dHRvblwiLGIub3B0aW9ucy5jbG9zZVdpdGgpPi0xJiZiLiRjbG9zZUJ1dHRvbi5vbmUoXCJjbGlja1wiLGZ1bmN0aW9uKGEpe2Iuc3RvcFByb3BhZ2F0aW9uKGEpLGIuY2xvc2UoKX0pLC0xPT1hLmluQXJyYXkoXCJidXR0b25cIixiLm9wdGlvbnMuY2xvc2VXaXRoKSYmYi4kY2xvc2VCdXR0b24ucmVtb3ZlKCksYi5vcHRpb25zLmNhbGxiYWNrLm9uU2hvdyYmYi5vcHRpb25zLmNhbGxiYWNrLm9uU2hvdy5hcHBseShiKSxcInN0cmluZ1wiPT10eXBlb2YgYi5vcHRpb25zLmFuaW1hdGlvbi5vcGVuPyhiLiRiYXIuY3NzKFwiaGVpZ2h0XCIsYi4kYmFyLmlubmVySGVpZ2h0KCkpLGIuJGJhci5vbihcImNsaWNrXCIsZnVuY3Rpb24oYSl7Yi53YXNDbGlja2VkPSEwfSksYi4kYmFyLnNob3coKS5hZGRDbGFzcyhiLm9wdGlvbnMuYW5pbWF0aW9uLm9wZW4pLm9uZShcIndlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmRcIixmdW5jdGlvbigpe2Iub3B0aW9ucy5jYWxsYmFjay5hZnRlclNob3cmJmIub3B0aW9ucy5jYWxsYmFjay5hZnRlclNob3cuYXBwbHkoYiksYi5zaG93aW5nPSExLGIuc2hvd249ITAsYi5oYXNPd25Qcm9wZXJ0eShcIndhc0NsaWNrZWRcIikmJihiLiRiYXIub2ZmKFwiY2xpY2tcIixmdW5jdGlvbihhKXtiLndhc0NsaWNrZWQ9ITB9KSxiLmNsb3NlKCkpfSkpOmIuJGJhci5hbmltYXRlKGIub3B0aW9ucy5hbmltYXRpb24ub3BlbixiLm9wdGlvbnMuYW5pbWF0aW9uLnNwZWVkLGIub3B0aW9ucy5hbmltYXRpb24uZWFzaW5nLGZ1bmN0aW9uKCl7Yi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyU2hvdyYmYi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyU2hvdy5hcHBseShiKSxiLnNob3dpbmc9ITEsYi5zaG93bj0hMH0pLGIub3B0aW9ucy50aW1lb3V0JiZiLiRiYXIuZGVsYXkoYi5vcHRpb25zLnRpbWVvdXQpLnByb21pc2UoKS5kb25lKGZ1bmN0aW9uKCl7Yi5jbG9zZSgpfSksdGhpc30sY2xvc2U6ZnVuY3Rpb24oKXtpZighKHRoaXMuY2xvc2VkfHx0aGlzLiRiYXImJnRoaXMuJGJhci5oYXNDbGFzcyhcImktYW0tY2xvc2luZy1ub3dcIikpKXt2YXIgYj10aGlzO2lmKHRoaXMuc2hvd2luZylyZXR1cm4gdm9pZCBiLiRiYXIucXVldWUoZnVuY3Rpb24oKXtiLmNsb3NlLmFwcGx5KGIpfSk7aWYoIXRoaXMuc2hvd24mJiF0aGlzLnNob3dpbmcpe3ZhciBjPVtdO3JldHVybiBhLmVhY2goYS5ub3R5LnF1ZXVlLGZ1bmN0aW9uKGEsZCl7ZC5vcHRpb25zLmlkIT1iLm9wdGlvbnMuaWQmJmMucHVzaChkKX0pLHZvaWQoYS5ub3R5LnF1ZXVlPWMpfWIuJGJhci5hZGRDbGFzcyhcImktYW0tY2xvc2luZy1ub3dcIiksYi5vcHRpb25zLmNhbGxiYWNrLm9uQ2xvc2UmJmIub3B0aW9ucy5jYWxsYmFjay5vbkNsb3NlLmFwcGx5KGIpLFwic3RyaW5nXCI9PXR5cGVvZiBiLm9wdGlvbnMuYW5pbWF0aW9uLmNsb3NlP2IuJGJhci5hZGRDbGFzcyhiLm9wdGlvbnMuYW5pbWF0aW9uLmNsb3NlKS5vbmUoXCJ3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kXCIsZnVuY3Rpb24oKXtiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJDbG9zZSYmYi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyQ2xvc2UuYXBwbHkoYiksYi5jbG9zZUNsZWFuVXAoKX0pOmIuJGJhci5jbGVhclF1ZXVlKCkuc3RvcCgpLmFuaW1hdGUoYi5vcHRpb25zLmFuaW1hdGlvbi5jbG9zZSxiLm9wdGlvbnMuYW5pbWF0aW9uLnNwZWVkLGIub3B0aW9ucy5hbmltYXRpb24uZWFzaW5nLGZ1bmN0aW9uKCl7Yi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyQ2xvc2UmJmIub3B0aW9ucy5jYWxsYmFjay5hZnRlckNsb3NlLmFwcGx5KGIpfSkucHJvbWlzZSgpLmRvbmUoZnVuY3Rpb24oKXtiLmNsb3NlQ2xlYW5VcCgpfSl9fSxjbG9zZUNsZWFuVXA6ZnVuY3Rpb24oKXt2YXIgYj10aGlzO2Iub3B0aW9ucy5tb2RhbCYmKGEubm90eVJlbmRlcmVyLnNldE1vZGFsQ291bnQoLTEpLDA9PWEubm90eVJlbmRlcmVyLmdldE1vZGFsQ291bnQoKSYmYShcIi5ub3R5X21vZGFsXCIpLmZhZGVPdXQoYi5vcHRpb25zLmFuaW1hdGlvbi5mYWRlU3BlZWQsZnVuY3Rpb24oKXthKHRoaXMpLnJlbW92ZSgpfSkpLGEubm90eVJlbmRlcmVyLnNldExheW91dENvdW50Rm9yKGIsLTEpLDA9PWEubm90eVJlbmRlcmVyLmdldExheW91dENvdW50Rm9yKGIpJiZhKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5yZW1vdmUoKSxcInVuZGVmaW5lZFwiIT10eXBlb2YgYi4kYmFyJiZudWxsIT09Yi4kYmFyJiYoXCJzdHJpbmdcIj09dHlwZW9mIGIub3B0aW9ucy5hbmltYXRpb24uY2xvc2U/KGIuJGJhci5jc3MoXCJ0cmFuc2l0aW9uXCIsXCJhbGwgMTAwbXMgZWFzZVwiKS5jc3MoXCJib3JkZXJcIiwwKS5jc3MoXCJtYXJnaW5cIiwwKS5oZWlnaHQoMCksYi4kYmFyLm9uZShcInRyYW5zaXRpb25lbmQgd2Via2l0VHJhbnNpdGlvbkVuZCBvVHJhbnNpdGlvbkVuZCBNU1RyYW5zaXRpb25FbmRcIixmdW5jdGlvbigpe2IuJGJhci5yZW1vdmUoKSxiLiRiYXI9bnVsbCxiLmNsb3NlZD0hMCxiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2smJmIub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vbkNsb3NlJiZiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2sub25DbG9zZS5hcHBseShiKX0pKTooYi4kYmFyLnJlbW92ZSgpLGIuJGJhcj1udWxsLGIuY2xvc2VkPSEwKSksZGVsZXRlIGEubm90eS5zdG9yZVtiLm9wdGlvbnMuaWRdLGIub3B0aW9ucy50aGVtZS5jYWxsYmFjayYmYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrLm9uQ2xvc2UmJmIub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vbkNsb3NlLmFwcGx5KGIpLGIub3B0aW9ucy5kaXNtaXNzUXVldWV8fChhLm5vdHkub250YXA9ITAsYS5ub3R5UmVuZGVyZXIucmVuZGVyKCkpLGIub3B0aW9ucy5tYXhWaXNpYmxlPjAmJmIub3B0aW9ucy5kaXNtaXNzUXVldWUmJmEubm90eVJlbmRlcmVyLnJlbmRlcigpfSxzZXRUZXh0OmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLmNsb3NlZHx8KHRoaXMub3B0aW9ucy50ZXh0PWEsdGhpcy4kYmFyLmZpbmQoXCIubm90eV90ZXh0XCIpLmh0bWwoYSkpLHRoaXN9LHNldFR5cGU6ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuY2xvc2VkfHwodGhpcy5vcHRpb25zLnR5cGU9YSx0aGlzLm9wdGlvbnMudGhlbWUuc3R5bGUuYXBwbHkodGhpcyksdGhpcy5vcHRpb25zLnRoZW1lLmNhbGxiYWNrLm9uU2hvdy5hcHBseSh0aGlzKSksdGhpc30sc2V0VGltZW91dDpmdW5jdGlvbihhKXtpZighdGhpcy5jbG9zZWQpe3ZhciBiPXRoaXM7dGhpcy5vcHRpb25zLnRpbWVvdXQ9YSxiLiRiYXIuZGVsYXkoYi5vcHRpb25zLnRpbWVvdXQpLnByb21pc2UoKS5kb25lKGZ1bmN0aW9uKCl7Yi5jbG9zZSgpfSl9cmV0dXJuIHRoaXN9LHN0b3BQcm9wYWdhdGlvbjpmdW5jdGlvbihhKXthPWF8fHdpbmRvdy5ldmVudCxcInVuZGVmaW5lZFwiIT10eXBlb2YgYS5zdG9wUHJvcGFnYXRpb24/YS5zdG9wUHJvcGFnYXRpb24oKTphLmNhbmNlbEJ1YmJsZT0hMH0sY2xvc2VkOiExLHNob3dpbmc6ITEsc2hvd246ITF9O2Eubm90eVJlbmRlcmVyPXt9LGEubm90eVJlbmRlcmVyLmluaXQ9ZnVuY3Rpb24oYyl7dmFyIGQ9T2JqZWN0LmNyZWF0ZShiKS5pbml0KGMpO3JldHVybiBkLm9wdGlvbnMua2lsbGVyJiZhLm5vdHkuY2xvc2VBbGwoKSxkLm9wdGlvbnMuZm9yY2U/YS5ub3R5LnF1ZXVlLnVuc2hpZnQoZCk6YS5ub3R5LnF1ZXVlLnB1c2goZCksYS5ub3R5UmVuZGVyZXIucmVuZGVyKCksXCJvYmplY3RcIj09YS5ub3R5LnJldHVybnM/ZDpkLm9wdGlvbnMuaWR9LGEubm90eVJlbmRlcmVyLnJlbmRlcj1mdW5jdGlvbigpe3ZhciBiPWEubm90eS5xdWV1ZVswXTtcIm9iamVjdFwiPT09YS50eXBlKGIpP2Iub3B0aW9ucy5kaXNtaXNzUXVldWU/Yi5vcHRpb25zLm1heFZpc2libGU+MD9hKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yK1wiID4gbGlcIikubGVuZ3RoPGIub3B0aW9ucy5tYXhWaXNpYmxlJiZhLm5vdHlSZW5kZXJlci5zaG93KGEubm90eS5xdWV1ZS5zaGlmdCgpKTphLm5vdHlSZW5kZXJlci5zaG93KGEubm90eS5xdWV1ZS5zaGlmdCgpKTphLm5vdHkub250YXAmJihhLm5vdHlSZW5kZXJlci5zaG93KGEubm90eS5xdWV1ZS5zaGlmdCgpKSxhLm5vdHkub250YXA9ITEpOmEubm90eS5vbnRhcD0hMH0sYS5ub3R5UmVuZGVyZXIuc2hvdz1mdW5jdGlvbihiKXtiLm9wdGlvbnMubW9kYWwmJihhLm5vdHlSZW5kZXJlci5jcmVhdGVNb2RhbEZvcihiKSxhLm5vdHlSZW5kZXJlci5zZXRNb2RhbENvdW50KDEpKSxiLm9wdGlvbnMuY3VzdG9tPzA9PWIub3B0aW9ucy5jdXN0b20uZmluZChiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikubGVuZ3RoP2Iub3B0aW9ucy5jdXN0b20uYXBwZW5kKGEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIub2JqZWN0KS5hZGRDbGFzcyhcImktYW0tbmV3XCIpKTpiLm9wdGlvbnMuY3VzdG9tLmZpbmQoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLnJlbW92ZUNsYXNzKFwiaS1hbS1uZXdcIik6MD09YShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikubGVuZ3RoP2EoXCJib2R5XCIpLmFwcGVuZChhKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLm9iamVjdCkuYWRkQ2xhc3MoXCJpLWFtLW5ld1wiKSk6YShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikucmVtb3ZlQ2xhc3MoXCJpLWFtLW5ld1wiKSxhLm5vdHlSZW5kZXJlci5zZXRMYXlvdXRDb3VudEZvcihiLDEpLGIuc2hvdygpfSxhLm5vdHlSZW5kZXJlci5jcmVhdGVNb2RhbEZvcj1mdW5jdGlvbihiKXtpZigwPT1hKFwiLm5vdHlfbW9kYWxcIikubGVuZ3RoKXt2YXIgYz1hKFwiPGRpdi8+XCIpLmFkZENsYXNzKFwibm90eV9tb2RhbFwiKS5hZGRDbGFzcyhiLm9wdGlvbnMudGhlbWUpLmRhdGEoXCJub3R5X21vZGFsX2NvdW50XCIsMCk7Yi5vcHRpb25zLnRoZW1lLm1vZGFsJiZiLm9wdGlvbnMudGhlbWUubW9kYWwuY3NzJiZjLmNzcyhiLm9wdGlvbnMudGhlbWUubW9kYWwuY3NzKSxjLnByZXBlbmRUbyhhKFwiYm9keVwiKSkuZmFkZUluKGIub3B0aW9ucy5hbmltYXRpb24uZmFkZVNwZWVkKSxhLmluQXJyYXkoXCJiYWNrZHJvcFwiLGIub3B0aW9ucy5jbG9zZVdpdGgpPi0xJiZjLm9uKFwiY2xpY2tcIixmdW5jdGlvbihiKXthLm5vdHkuY2xvc2VBbGwoKX0pfX0sYS5ub3R5UmVuZGVyZXIuZ2V0TGF5b3V0Q291bnRGb3I9ZnVuY3Rpb24oYil7cmV0dXJuIGEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmRhdGEoXCJub3R5X2xheW91dF9jb3VudFwiKXx8MH0sYS5ub3R5UmVuZGVyZXIuc2V0TGF5b3V0Q291bnRGb3I9ZnVuY3Rpb24oYixjKXtyZXR1cm4gYShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikuZGF0YShcIm5vdHlfbGF5b3V0X2NvdW50XCIsYS5ub3R5UmVuZGVyZXIuZ2V0TGF5b3V0Q291bnRGb3IoYikrYyl9LGEubm90eVJlbmRlcmVyLmdldE1vZGFsQ291bnQ9ZnVuY3Rpb24oKXtyZXR1cm4gYShcIi5ub3R5X21vZGFsXCIpLmRhdGEoXCJub3R5X21vZGFsX2NvdW50XCIpfHwwfSxhLm5vdHlSZW5kZXJlci5zZXRNb2RhbENvdW50PWZ1bmN0aW9uKGIpe3JldHVybiBhKFwiLm5vdHlfbW9kYWxcIikuZGF0YShcIm5vdHlfbW9kYWxfY291bnRcIixhLm5vdHlSZW5kZXJlci5nZXRNb2RhbENvdW50KCkrYil9LGEuZm4ubm90eT1mdW5jdGlvbihiKXtyZXR1cm4gYi5jdXN0b209YSh0aGlzKSxhLm5vdHlSZW5kZXJlci5pbml0KGIpfSxhLm5vdHk9e30sYS5ub3R5LnF1ZXVlPVtdLGEubm90eS5vbnRhcD0hMCxhLm5vdHkubGF5b3V0cz17fSxhLm5vdHkudGhlbWVzPXt9LGEubm90eS5yZXR1cm5zPVwib2JqZWN0XCIsYS5ub3R5LnN0b3JlPXt9LGEubm90eS5nZXQ9ZnVuY3Rpb24oYil7cmV0dXJuIGEubm90eS5zdG9yZS5oYXNPd25Qcm9wZXJ0eShiKT9hLm5vdHkuc3RvcmVbYl06ITF9LGEubm90eS5jbG9zZT1mdW5jdGlvbihiKXtyZXR1cm4gYS5ub3R5LmdldChiKT9hLm5vdHkuZ2V0KGIpLmNsb3NlKCk6ITF9LGEubm90eS5zZXRUZXh0PWZ1bmN0aW9uKGIsYyl7cmV0dXJuIGEubm90eS5nZXQoYik/YS5ub3R5LmdldChiKS5zZXRUZXh0KGMpOiExfSxhLm5vdHkuc2V0VHlwZT1mdW5jdGlvbihiLGMpe3JldHVybiBhLm5vdHkuZ2V0KGIpP2Eubm90eS5nZXQoYikuc2V0VHlwZShjKTohMX0sYS5ub3R5LmNsZWFyUXVldWU9ZnVuY3Rpb24oKXthLm5vdHkucXVldWU9W119LGEubm90eS5jbG9zZUFsbD1mdW5jdGlvbigpe2Eubm90eS5jbGVhclF1ZXVlKCksYS5lYWNoKGEubm90eS5zdG9yZSxmdW5jdGlvbihhLGIpe2IuY2xvc2UoKX0pfTt2YXIgYz13aW5kb3cuYWxlcnQ7cmV0dXJuIGEubm90eS5jb25zdW1lQWxlcnQ9ZnVuY3Rpb24oYil7d2luZG93LmFsZXJ0PWZ1bmN0aW9uKGMpe2I/Yi50ZXh0PWM6Yj17dGV4dDpjfSxhLm5vdHlSZW5kZXJlci5pbml0KGIpfX0sYS5ub3R5LnN0b3BDb25zdW1lQWxlcnQ9ZnVuY3Rpb24oKXt3aW5kb3cuYWxlcnQ9Y30sYS5ub3R5LmRlZmF1bHRzPXtsYXlvdXQ6XCJ0b3BcIix0aGVtZTpcImRlZmF1bHRUaGVtZVwiLHR5cGU6XCJhbGVydFwiLHRleHQ6XCJcIixkaXNtaXNzUXVldWU6ITAsdGVtcGxhdGU6JzxkaXYgY2xhc3M9XCJub3R5X21lc3NhZ2VcIj48c3BhbiBjbGFzcz1cIm5vdHlfdGV4dFwiPjwvc3Bhbj48ZGl2IGNsYXNzPVwibm90eV9jbG9zZVwiPjwvZGl2PjwvZGl2PicsYW5pbWF0aW9uOntvcGVuOntoZWlnaHQ6XCJ0b2dnbGVcIn0sY2xvc2U6e2hlaWdodDpcInRvZ2dsZVwifSxlYXNpbmc6XCJzd2luZ1wiLHNwZWVkOjUwMCxmYWRlU3BlZWQ6XCJmYXN0XCJ9LHRpbWVvdXQ6ITEsZm9yY2U6ITEsbW9kYWw6ITEsbWF4VmlzaWJsZTo1LGtpbGxlcjohMSxjbG9zZVdpdGg6W1wiY2xpY2tcIl0sY2FsbGJhY2s6e29uU2hvdzpmdW5jdGlvbigpe30sYWZ0ZXJTaG93OmZ1bmN0aW9uKCl7fSxvbkNsb3NlOmZ1bmN0aW9uKCl7fSxhZnRlckNsb3NlOmZ1bmN0aW9uKCl7fSxvbkNsb3NlQ2xpY2s6ZnVuY3Rpb24oKXt9fSxidXR0b25zOiExfSxhKHdpbmRvdykub24oXCJyZXNpemVcIixmdW5jdGlvbigpe2EuZWFjaChhLm5vdHkubGF5b3V0cyxmdW5jdGlvbihiLGMpe2MuY29udGFpbmVyLnN0eWxlLmFwcGx5KGEoYy5jb250YWluZXIuc2VsZWN0b3IpKX0pfSksd2luZG93Lm5vdHk9ZnVuY3Rpb24oYil7cmV0dXJuIGEubm90eVJlbmRlcmVyLmluaXQoYil9LGEubm90eS5sYXlvdXRzLmJvdHRvbT17bmFtZTpcImJvdHRvbVwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfYm90dG9tX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2JvdHRvbV9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7Ym90dG9tOjAsbGVmdDpcIjUlXCIscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiOTAlXCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDo5OTk5OTk5fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuYm90dG9tQ2VudGVyPXtuYW1lOlwiYm90dG9tQ2VudGVyXCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9ib3R0b21DZW50ZXJfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfYm90dG9tQ2VudGVyX2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtib3R0b206MjAsbGVmdDowLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KSxhKHRoaXMpLmNzcyh7bGVmdDooYSh3aW5kb3cpLndpZHRoKCktYSh0aGlzKS5vdXRlcldpZHRoKCExKSkvMitcInB4XCJ9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuYm90dG9tTGVmdD17bmFtZTpcImJvdHRvbUxlZnRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2JvdHRvbUxlZnRfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfYm90dG9tTGVmdF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7Ym90dG9tOjIwLGxlZnQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLHdpbmRvdy5pbm5lcldpZHRoPDYwMCYmYSh0aGlzKS5jc3Moe2xlZnQ6NX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5ib3R0b21SaWdodD17bmFtZTpcImJvdHRvbVJpZ2h0XCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9ib3R0b21SaWdodF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9ib3R0b21SaWdodF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7Ym90dG9tOjIwLHJpZ2h0OjIwLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KSx3aW5kb3cuaW5uZXJXaWR0aDw2MDAmJmEodGhpcykuY3NzKHtyaWdodDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmNlbnRlcj17bmFtZTpcImNlbnRlclwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfY2VudGVyX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2NlbnRlcl9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7cG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pO3ZhciBiPWEodGhpcykuY2xvbmUoKS5jc3Moe3Zpc2liaWxpdHk6XCJoaWRkZW5cIixkaXNwbGF5OlwiYmxvY2tcIixwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOjAsbGVmdDowfSkuYXR0cihcImlkXCIsXCJkdXBlXCIpO2EoXCJib2R5XCIpLmFwcGVuZChiKSxiLmZpbmQoXCIuaS1hbS1jbG9zaW5nLW5vd1wiKS5yZW1vdmUoKSxiLmZpbmQoXCJsaVwiKS5jc3MoXCJkaXNwbGF5XCIsXCJibG9ja1wiKTt2YXIgYz1iLmhlaWdodCgpO2IucmVtb3ZlKCksYSh0aGlzKS5oYXNDbGFzcyhcImktYW0tbmV3XCIpP2EodGhpcykuY3NzKHtsZWZ0OihhKHdpbmRvdykud2lkdGgoKS1hKHRoaXMpLm91dGVyV2lkdGgoITEpKS8yK1wicHhcIix0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0pOmEodGhpcykuYW5pbWF0ZSh7bGVmdDooYSh3aW5kb3cpLndpZHRoKCktYSh0aGlzKS5vdXRlcldpZHRoKCExKSkvMitcInB4XCIsdG9wOihhKHdpbmRvdykuaGVpZ2h0KCktYykvMitcInB4XCJ9LDUwMCl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmNlbnRlckxlZnQ9e25hbWU6XCJjZW50ZXJMZWZ0XCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9jZW50ZXJMZWZ0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2NlbnRlckxlZnRfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe2xlZnQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pO3ZhciBiPWEodGhpcykuY2xvbmUoKS5jc3Moe3Zpc2liaWxpdHk6XCJoaWRkZW5cIixkaXNwbGF5OlwiYmxvY2tcIixwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOjAsbGVmdDowfSkuYXR0cihcImlkXCIsXCJkdXBlXCIpO2EoXCJib2R5XCIpLmFwcGVuZChiKSxiLmZpbmQoXCIuaS1hbS1jbG9zaW5nLW5vd1wiKS5yZW1vdmUoKSxiLmZpbmQoXCJsaVwiKS5jc3MoXCJkaXNwbGF5XCIsXCJibG9ja1wiKTt2YXIgYz1iLmhlaWdodCgpO2IucmVtb3ZlKCksYSh0aGlzKS5oYXNDbGFzcyhcImktYW0tbmV3XCIpP2EodGhpcykuY3NzKHt0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0pOmEodGhpcykuYW5pbWF0ZSh7dG9wOihhKHdpbmRvdykuaGVpZ2h0KCktYykvMitcInB4XCJ9LDUwMCksd2luZG93LmlubmVyV2lkdGg8NjAwJiZhKHRoaXMpLmNzcyh7bGVmdDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmNlbnRlclJpZ2h0PXtuYW1lOlwiY2VudGVyUmlnaHRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2NlbnRlclJpZ2h0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2NlbnRlclJpZ2h0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtyaWdodDoyMCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSk7dmFyIGI9YSh0aGlzKS5jbG9uZSgpLmNzcyh7dmlzaWJpbGl0eTpcImhpZGRlblwiLGRpc3BsYXk6XCJibG9ja1wiLHBvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6MCxsZWZ0OjB9KS5hdHRyKFwiaWRcIixcImR1cGVcIik7YShcImJvZHlcIikuYXBwZW5kKGIpLGIuZmluZChcIi5pLWFtLWNsb3Npbmctbm93XCIpLnJlbW92ZSgpLGIuZmluZChcImxpXCIpLmNzcyhcImRpc3BsYXlcIixcImJsb2NrXCIpO3ZhciBjPWIuaGVpZ2h0KCk7Yi5yZW1vdmUoKSxhKHRoaXMpLmhhc0NsYXNzKFwiaS1hbS1uZXdcIik/YSh0aGlzKS5jc3Moe3RvcDooYSh3aW5kb3cpLmhlaWdodCgpLWMpLzIrXCJweFwifSk6YSh0aGlzKS5hbmltYXRlKHt0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0sNTAwKSx3aW5kb3cuaW5uZXJXaWR0aDw2MDAmJmEodGhpcykuY3NzKHtyaWdodDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmlubGluZT17bmFtZTpcImlubGluZVwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBjbGFzcz1cIm5vdHlfaW5saW5lX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bC5ub3R5X2lubGluZV9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7d2lkdGg6XCIxMDAlXCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDo5OTk5OTk5fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMudG9wPXtuYW1lOlwidG9wXCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV90b3BfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfdG9wX2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHt0b3A6MCxsZWZ0OlwiNSVcIixwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCI5MCVcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4Ojk5OTk5OTl9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy50b3BDZW50ZXI9e25hbWU6XCJ0b3BDZW50ZXJcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X3RvcENlbnRlcl9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV90b3BDZW50ZXJfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3RvcDoyMCxsZWZ0OjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLGEodGhpcykuY3NzKHtsZWZ0OihhKHdpbmRvdykud2lkdGgoKS1hKHRoaXMpLm91dGVyV2lkdGgoITEpKS8yK1wicHhcIn0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy50b3BMZWZ0PXtuYW1lOlwidG9wTGVmdFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfdG9wTGVmdF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV90b3BMZWZ0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHt0b3A6MjAsbGVmdDoyMCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSksd2luZG93LmlubmVyV2lkdGg8NjAwJiZhKHRoaXMpLmNzcyh7bGVmdDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLnRvcFJpZ2h0PXtuYW1lOlwidG9wUmlnaHRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X3RvcFJpZ2h0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X3RvcFJpZ2h0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHt0b3A6MjAscmlnaHQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLHdpbmRvdy5pbm5lcldpZHRoPDYwMCYmYSh0aGlzKS5jc3Moe3JpZ2h0OjV9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LnRoZW1lcy5ib290c3RyYXBUaGVtZT17bmFtZTpcImJvb3RzdHJhcFRoZW1lXCIsbW9kYWw6e2Nzczp7cG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMTAwJVwiLGhlaWdodDpcIjEwMCVcIixiYWNrZ3JvdW5kQ29sb3I6XCIjMDAwXCIsekluZGV4OjFlNCxvcGFjaXR5Oi42LGRpc3BsYXk6XCJub25lXCIsbGVmdDowLHRvcDowfX0sc3R5bGU6ZnVuY3Rpb24oKXt2YXIgYj10aGlzLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3Rvcjtzd2l0Y2goYShiKS5hZGRDbGFzcyhcImxpc3QtZ3JvdXBcIiksdGhpcy4kY2xvc2VCdXR0b24uYXBwZW5kKCc8c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj4mdGltZXM7PC9zcGFuPjxzcGFuIGNsYXNzPVwic3Itb25seVwiPkNsb3NlPC9zcGFuPicpLHRoaXMuJGNsb3NlQnV0dG9uLmFkZENsYXNzKFwiY2xvc2VcIiksdGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtXCIpLmNzcyhcInBhZGRpbmdcIixcIjBweFwiKSx0aGlzLm9wdGlvbnMudHlwZSl7Y2FzZVwiYWxlcnRcIjpjYXNlXCJub3RpZmljYXRpb25cIjp0aGlzLiRiYXIuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwLWl0ZW0taW5mb1wiKTticmVhaztjYXNlXCJ3YXJuaW5nXCI6dGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtLXdhcm5pbmdcIik7YnJlYWs7Y2FzZVwiZXJyb3JcIjp0aGlzLiRiYXIuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwLWl0ZW0tZGFuZ2VyXCIpO2JyZWFrO2Nhc2VcImluZm9ybWF0aW9uXCI6dGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtLWluZm9cIik7YnJlYWs7Y2FzZVwic3VjY2Vzc1wiOnRoaXMuJGJhci5hZGRDbGFzcyhcImxpc3QtZ3JvdXAtaXRlbS1zdWNjZXNzXCIpfXRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjEzcHhcIixsaW5lSGVpZ2h0OlwiMTZweFwiLHRleHRBbGlnbjpcImNlbnRlclwiLHBhZGRpbmc6XCI4cHggMTBweCA5cHhcIix3aWR0aDpcImF1dG9cIixwb3NpdGlvbjpcInJlbGF0aXZlXCJ9KX0sY2FsbGJhY2s6e29uU2hvdzpmdW5jdGlvbigpe30sb25DbG9zZTpmdW5jdGlvbigpe319fSxhLm5vdHkudGhlbWVzLmRlZmF1bHRUaGVtZT17bmFtZTpcImRlZmF1bHRUaGVtZVwiLGhlbHBlcnM6e2JvcmRlckZpeDpmdW5jdGlvbigpe2lmKHRoaXMub3B0aW9ucy5kaXNtaXNzUXVldWUpe3ZhciBiPXRoaXMub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yK1wiIFwiK3RoaXMub3B0aW9ucy5sYXlvdXQucGFyZW50LnNlbGVjdG9yO3N3aXRjaCh0aGlzLm9wdGlvbnMubGF5b3V0Lm5hbWUpe2Nhc2VcInRvcFwiOmEoYikuY3NzKHtib3JkZXJSYWRpdXM6XCIwcHggMHB4IDBweCAwcHhcIn0pLGEoYikubGFzdCgpLmNzcyh7Ym9yZGVyUmFkaXVzOlwiMHB4IDBweCA1cHggNXB4XCJ9KTticmVhaztjYXNlXCJ0b3BDZW50ZXJcIjpjYXNlXCJ0b3BMZWZ0XCI6Y2FzZVwidG9wUmlnaHRcIjpjYXNlXCJib3R0b21DZW50ZXJcIjpjYXNlXCJib3R0b21MZWZ0XCI6Y2FzZVwiYm90dG9tUmlnaHRcIjpjYXNlXCJjZW50ZXJcIjpjYXNlXCJjZW50ZXJMZWZ0XCI6Y2FzZVwiY2VudGVyUmlnaHRcIjpjYXNlXCJpbmxpbmVcIjphKGIpLmNzcyh7Ym9yZGVyUmFkaXVzOlwiMHB4IDBweCAwcHggMHB4XCJ9KSxhKGIpLmZpcnN0KCkuY3NzKHtcImJvcmRlci10b3AtbGVmdC1yYWRpdXNcIjpcIjVweFwiLFwiYm9yZGVyLXRvcC1yaWdodC1yYWRpdXNcIjpcIjVweFwifSksYShiKS5sYXN0KCkuY3NzKHtcImJvcmRlci1ib3R0b20tbGVmdC1yYWRpdXNcIjpcIjVweFwiLFwiYm9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXNcIjpcIjVweFwifSk7YnJlYWs7Y2FzZVwiYm90dG9tXCI6YShiKS5jc3Moe2JvcmRlclJhZGl1czpcIjBweCAwcHggMHB4IDBweFwifSksYShiKS5maXJzdCgpLmNzcyh7Ym9yZGVyUmFkaXVzOlwiNXB4IDVweCAwcHggMHB4XCJ9KX19fX0sbW9kYWw6e2Nzczp7cG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMTAwJVwiLGhlaWdodDpcIjEwMCVcIixiYWNrZ3JvdW5kQ29sb3I6XCIjMDAwXCIsekluZGV4OjFlNCxvcGFjaXR5Oi42LGRpc3BsYXk6XCJub25lXCIsbGVmdDowLHRvcDowfX0sc3R5bGU6ZnVuY3Rpb24oKXtzd2l0Y2godGhpcy4kYmFyLmNzcyh7b3ZlcmZsb3c6XCJoaWRkZW5cIixiYWNrZ3JvdW5kOlwidXJsKCdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUJzQUFBQW9DQVFBQUFDbE0wbmRBQUFBaGtsRVFWUjRBZFhPMFFyQ01CQkUwYnR0a2szOC93OFdSRVJwZHlqelZPYytIeGhJSHFKR01RY0ZGa3BZUlFvdExMU3cwSUo1YUJkb3ZydU1ZREEva1Q4cGxGOVpLTEZRY2dGMThoRGoxU2JRT01sQ0E0a2FvMGlpWG1haDdxQldQZHhwb2hzZ1ZaeWo3ZTVJOUtjSUQrRWhpREk1Z3hCWUtMQlFZS0hBUW9HRkFvRWtzL1lFR0hZS0I3aEZ4ZjBBQUFBQVNVVk9SSzVDWUlJPScpIHJlcGVhdC14IHNjcm9sbCBsZWZ0IHRvcCAjZmZmXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsbGluZUhlaWdodDpcIjE2cHhcIix0ZXh0QWxpZ246XCJjZW50ZXJcIixwYWRkaW5nOlwiOHB4IDEwcHggOXB4XCIsd2lkdGg6XCJhdXRvXCIscG9zaXRpb246XCJyZWxhdGl2ZVwifSksdGhpcy4kY2xvc2VCdXR0b24uY3NzKHtwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOjQscmlnaHQ6NCx3aWR0aDoxMCxoZWlnaHQ6MTAsYmFja2dyb3VuZDpcInVybChkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFvQUFBQUtDQVFBQUFBbk93YzJBQUFBeFVsRVFWUjRBUjNNUFVvRFVSU0EwZSsrdVNra094QzNJQU9XTnRhQ0lEYUNoZmdYQk1FWmJRUkJ5eEN3aytCYXNnUVJaTFNZb0xnRFFiQVJ4cnk4bnl1bVBjVlJLRGZkMEFhOEFzZ0R2MXpwNnBZZDVqV093aHZlYlJUYnpOTkV3NUJTc0lwc2ova3VyUUJubWs3c0lGY0NGNXl5WlBEUkc2dHJRaHVqWFlvc2FGb2MrMmYxTUo4OXVjNzZJTkQ2RjlCdmxYVWRwYjZ4d0QyKzRxM21lM2J5c2lIdnRMWXJVSnRvN1BEL3ZlN0xOSHhTZy93b04ya1N6NHR4YXNCZGh5aXozdWdQR2V0VGptM1hSb2tBQUFBQVNVVk9SSzVDWUlJPSlcIixkaXNwbGF5Olwibm9uZVwiLGN1cnNvcjpcInBvaW50ZXJcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtwYWRkaW5nOjUsdGV4dEFsaWduOlwicmlnaHRcIixib3JkZXJUb3A6XCIxcHggc29saWQgI2NjY1wiLGJhY2tncm91bmRDb2xvcjpcIiNmZmZcIn0pLHRoaXMuJGJ1dHRvbnMuZmluZChcImJ1dHRvblwiKS5jc3Moe21hcmdpbkxlZnQ6NX0pLHRoaXMuJGJ1dHRvbnMuZmluZChcImJ1dHRvbjpmaXJzdFwiKS5jc3Moe21hcmdpbkxlZnQ6MH0pLHRoaXMuJGJhci5vbih7bW91c2VlbnRlcjpmdW5jdGlvbigpe2EodGhpcykuZmluZChcIi5ub3R5X2Nsb3NlXCIpLnN0b3AoKS5mYWRlVG8oXCJub3JtYWxcIiwxKX0sbW91c2VsZWF2ZTpmdW5jdGlvbigpe2EodGhpcykuZmluZChcIi5ub3R5X2Nsb3NlXCIpLnN0b3AoKS5mYWRlVG8oXCJub3JtYWxcIiwwKX19KSx0aGlzLm9wdGlvbnMubGF5b3V0Lm5hbWUpe2Nhc2VcInRvcFwiOnRoaXMuJGJhci5jc3Moe2JvcmRlclJhZGl1czpcIjBweCAwcHggNXB4IDVweFwiLGJvcmRlckJvdHRvbTpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyTGVmdDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyUmlnaHQ6XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pO2JyZWFrO2Nhc2VcInRvcENlbnRlclwiOmNhc2VcImNlbnRlclwiOmNhc2VcImJvdHRvbUNlbnRlclwiOmNhc2VcImlubGluZVwiOnRoaXMuJGJhci5jc3Moe2JvcmRlclJhZGl1czpcIjVweFwiLGJvcmRlcjpcIjFweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTNweFwiLHRleHRBbGlnbjpcImNlbnRlclwifSk7YnJlYWs7Y2FzZVwidG9wTGVmdFwiOmNhc2VcInRvcFJpZ2h0XCI6Y2FzZVwiYm90dG9tTGVmdFwiOmNhc2VcImJvdHRvbVJpZ2h0XCI6Y2FzZVwiY2VudGVyTGVmdFwiOmNhc2VcImNlbnRlclJpZ2h0XCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyUmFkaXVzOlwiNXB4XCIsYm9yZGVyOlwiMXB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsdGV4dEFsaWduOlwibGVmdFwifSk7YnJlYWs7Y2FzZVwiYm90dG9tXCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyUmFkaXVzOlwiNXB4IDVweCAwcHggMHB4XCIsYm9yZGVyVG9wOlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJMZWZ0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJSaWdodDpcIjJweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAtMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pO2JyZWFrO2RlZmF1bHQ6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyOlwiMnB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KX1zd2l0Y2godGhpcy5vcHRpb25zLnR5cGUpe2Nhc2VcImFsZXJ0XCI6Y2FzZVwibm90aWZpY2F0aW9uXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGRlwiLGJvcmRlckNvbG9yOlwiI0NDQ1wiLGNvbG9yOlwiIzQ0NFwifSk7YnJlYWs7Y2FzZVwid2FybmluZ1wiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkVBQThcIixib3JkZXJDb2xvcjpcIiNGRkMyMzdcIixjb2xvcjpcIiM4MjYyMDBcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgI0ZGQzIzN1wifSk7YnJlYWs7Y2FzZVwiZXJyb3JcIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCJyZWRcIixib3JkZXJDb2xvcjpcImRhcmtyZWRcIixjb2xvcjpcIiNGRkZcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250V2VpZ2h0OlwiYm9sZFwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCBkYXJrcmVkXCJ9KTticmVhaztjYXNlXCJpbmZvcm1hdGlvblwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiM1N0I3RTJcIixib3JkZXJDb2xvcjpcIiMwQjkwQzRcIixjb2xvcjpcIiNGRkZcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgIzBCOTBDNFwifSk7YnJlYWs7Y2FzZVwic3VjY2Vzc1wiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcImxpZ2h0Z3JlZW5cIixib3JkZXJDb2xvcjpcIiM1MEMyNEVcIixjb2xvcjpcImRhcmtncmVlblwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjNTBDMjRFXCJ9KTticmVhaztkZWZhdWx0OnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkZcIixib3JkZXJDb2xvcjpcIiNDQ0NcIixjb2xvcjpcIiM0NDRcIn0pfX0sY2FsbGJhY2s6e29uU2hvdzpmdW5jdGlvbigpe2Eubm90eS50aGVtZXMuZGVmYXVsdFRoZW1lLmhlbHBlcnMuYm9yZGVyRml4LmFwcGx5KHRoaXMpfSxvbkNsb3NlOmZ1bmN0aW9uKCl7YS5ub3R5LnRoZW1lcy5kZWZhdWx0VGhlbWUuaGVscGVycy5ib3JkZXJGaXguYXBwbHkodGhpcyl9fX0sYS5ub3R5LnRoZW1lcy5yZWxheD17bmFtZTpcInJlbGF4XCIsaGVscGVyczp7fSxtb2RhbDp7Y3NzOntwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIxMDAlXCIsaGVpZ2h0OlwiMTAwJVwiLGJhY2tncm91bmRDb2xvcjpcIiMwMDBcIix6SW5kZXg6MWU0LG9wYWNpdHk6LjYsZGlzcGxheTpcIm5vbmVcIixsZWZ0OjAsdG9wOjB9fSxzdHlsZTpmdW5jdGlvbigpe3N3aXRjaCh0aGlzLiRiYXIuY3NzKHtvdmVyZmxvdzpcImhpZGRlblwiLG1hcmdpbjpcIjRweCAwXCIsYm9yZGVyUmFkaXVzOlwiMnB4XCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxNHB4XCIsbGluZUhlaWdodDpcIjE2cHhcIix0ZXh0QWxpZ246XCJjZW50ZXJcIixwYWRkaW5nOlwiMTBweFwiLHdpZHRoOlwiYXV0b1wiLHBvc2l0aW9uOlwicmVsYXRpdmVcIn0pLHRoaXMuJGNsb3NlQnV0dG9uLmNzcyh7cG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDo0LHJpZ2h0OjQsd2lkdGg6MTAsaGVpZ2h0OjEwLGJhY2tncm91bmQ6XCJ1cmwoZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBb0FBQUFLQ0FRQUFBQW5Pd2MyQUFBQXhVbEVRVlI0QVIzTVBVb0RVUlNBMGUrK3VTa2tPeEMzSUFPV050YUNJRGFDaGZnWEJNRVpiUVJCeXhDd2srQmFzZ1FSWkxTWW9MZ0RRYkFSeHJ5OG55dW1QY1ZSS0RmZDBBYThBc2dEdjF6cDZwWWQ1aldPd2h2ZWJSVGJ6Tk5FdzVCU3NJcHNqL2t1clFCbm1rN3NJRmNDRjV5eVpQRFJHNnRyUWh1alhZb3NhRm9jKzJmMU1KODl1Yzc2SU5ENkY5QnZsWFVkcGI2eHdEMis0cTNtZTNieXNpSHZ0TFlyVUp0bzdQRC92ZTdMTkh4U2cvd29OMmtTejR0eGFzQmRoeWl6M3VnUEdldFRqbTNYUm9rQUFBQUFTVVZPUks1Q1lJST0pXCIsZGlzcGxheTpcIm5vbmVcIixjdXJzb3I6XCJwb2ludGVyXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7cGFkZGluZzo1LHRleHRBbGlnbjpcInJpZ2h0XCIsYm9yZGVyVG9wOlwiMXB4IHNvbGlkICNjY2NcIixiYWNrZ3JvdW5kQ29sb3I6XCIjZmZmXCJ9KSx0aGlzLiRidXR0b25zLmZpbmQoXCJidXR0b25cIikuY3NzKHttYXJnaW5MZWZ0OjV9KSx0aGlzLiRidXR0b25zLmZpbmQoXCJidXR0b246Zmlyc3RcIikuY3NzKHttYXJnaW5MZWZ0OjB9KSx0aGlzLiRiYXIub24oe21vdXNlZW50ZXI6ZnVuY3Rpb24oKXthKHRoaXMpLmZpbmQoXCIubm90eV9jbG9zZVwiKS5zdG9wKCkuZmFkZVRvKFwibm9ybWFsXCIsMSl9LG1vdXNlbGVhdmU6ZnVuY3Rpb24oKXthKHRoaXMpLmZpbmQoXCIubm90eV9jbG9zZVwiKS5zdG9wKCkuZmFkZVRvKFwibm9ybWFsXCIsMCl9fSksdGhpcy5vcHRpb25zLmxheW91dC5uYW1lKXtjYXNlXCJ0b3BcIjp0aGlzLiRiYXIuY3NzKHtib3JkZXJCb3R0b206XCIycHggc29saWQgI2VlZVwiLGJvcmRlckxlZnQ6XCIycHggc29saWQgI2VlZVwiLGJvcmRlclJpZ2h0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJUb3A6XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pO2JyZWFrO2Nhc2VcInRvcENlbnRlclwiOmNhc2VcImNlbnRlclwiOmNhc2VcImJvdHRvbUNlbnRlclwiOmNhc2VcImlubGluZVwiOnRoaXMuJGJhci5jc3Moe2JvcmRlcjpcIjFweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTNweFwiLHRleHRBbGlnbjpcImNlbnRlclwifSk7YnJlYWs7Y2FzZVwidG9wTGVmdFwiOmNhc2VcInRvcFJpZ2h0XCI6Y2FzZVwiYm90dG9tTGVmdFwiOmNhc2VcImJvdHRvbVJpZ2h0XCI6Y2FzZVwiY2VudGVyTGVmdFwiOmNhc2VcImNlbnRlclJpZ2h0XCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyOlwiMXB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsdGV4dEFsaWduOlwibGVmdFwifSk7YnJlYWs7Y2FzZVwiYm90dG9tXCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyVG9wOlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJMZWZ0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJSaWdodDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyQm90dG9tOlwiMnB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIC0ycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSk7YnJlYWs7ZGVmYXVsdDp0aGlzLiRiYXIuY3NzKHtib3JkZXI6XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pfXN3aXRjaCh0aGlzLm9wdGlvbnMudHlwZSl7Y2FzZVwiYWxlcnRcIjpjYXNlXCJub3RpZmljYXRpb25cIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkZGXCIsYm9yZGVyQ29sb3I6XCIjZGVkZWRlXCIsY29sb3I6XCIjNDQ0XCJ9KTticmVhaztjYXNlXCJ3YXJuaW5nXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGRUFBOFwiLGJvcmRlckNvbG9yOlwiI0ZGQzIzN1wiLGNvbG9yOlwiIzgyNjIwMFwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjRkZDMjM3XCJ9KTticmVhaztjYXNlXCJlcnJvclwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRjgxODFcIixib3JkZXJDb2xvcjpcIiNlMjUzNTNcIixjb2xvcjpcIiNGRkZcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250V2VpZ2h0OlwiYm9sZFwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCBkYXJrcmVkXCJ9KTticmVhaztjYXNlXCJpbmZvcm1hdGlvblwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiM3OEM1RTdcIixib3JkZXJDb2xvcjpcIiMzYmFkZDZcIixjb2xvcjpcIiNGRkZcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgIzBCOTBDNFwifSk7YnJlYWs7Y2FzZVwic3VjY2Vzc1wiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNCQ0Y1QkNcIixib3JkZXJDb2xvcjpcIiM3Y2RkNzdcIixjb2xvcjpcImRhcmtncmVlblwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjNTBDMjRFXCJ9KTticmVhaztkZWZhdWx0OnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkZcIixib3JkZXJDb2xvcjpcIiNDQ0NcIixjb2xvcjpcIiM0NDRcIn0pfX0sY2FsbGJhY2s6e29uU2hvdzpmdW5jdGlvbigpe30sb25DbG9zZTpmdW5jdGlvbigpe319fSx3aW5kb3cubm90eX0pOyIsImpRdWVyeShkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcblx0Ly9jYWNoZSBET00gZWxlbWVudHNcblx0dmFyIG1haW5Db250ZW50ID0gJCgnLmNkLW1haW4tY29udGVudCcpLFxuXHRcdGhlYWRlciA9ICQoJy5jZC1tYWluLWhlYWRlcicpLFxuXHRcdHNpZGViYXIgPSAkKCcuY2Qtc2lkZS1uYXYnKSxcblx0XHRzaWRlYmFyVHJpZ2dlciA9ICQoJy5jZC1uYXYtdHJpZ2dlcicpLFxuXHRcdHRvcE5hdmlnYXRpb24gPSAkKCcuY2QtdG9wLW5hdicpLFxuXHRcdHNlYXJjaEZvcm0gPSAkKCcuY2Qtc2VhcmNoJyksXG5cdFx0YWNjb3VudEluZm8gPSAkKCcuYWNjb3VudCcpO1xuXG5cdC8vb24gcmVzaXplLCBtb3ZlIHNlYXJjaCBhbmQgdG9wIG5hdiBwb3NpdGlvbiBhY2NvcmRpbmcgdG8gd2luZG93IHdpZHRoXG5cdHZhciByZXNpemluZyA9IGZhbHNlO1xuXHRtb3ZlTmF2aWdhdGlvbigpO1xuXHQkKHdpbmRvdykub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uKCl7XG5cdFx0aWYoICFyZXNpemluZyApIHtcblx0XHRcdCghd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSkgPyBzZXRUaW1lb3V0KG1vdmVOYXZpZ2F0aW9uLCAzMDApIDogd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShtb3ZlTmF2aWdhdGlvbik7XG5cdFx0XHRyZXNpemluZyA9IHRydWU7XG5cdFx0fVxuXHR9KTtcblxuXHQvL29uIHdpbmRvdyBzY3JvbGxpbmcgLSBmaXggc2lkZWJhciBuYXZcblx0dmFyIHNjcm9sbGluZyA9IGZhbHNlO1xuXHRjaGVja1Njcm9sbGJhclBvc2l0aW9uKCk7XG5cdCQod2luZG93KS5vbignc2Nyb2xsJywgZnVuY3Rpb24oKXtcblx0XHRpZiggIXNjcm9sbGluZyApIHtcblx0XHRcdCghd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSkgPyBzZXRUaW1lb3V0KGNoZWNrU2Nyb2xsYmFyUG9zaXRpb24sIDMwMCkgOiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNoZWNrU2Nyb2xsYmFyUG9zaXRpb24pO1xuXHRcdFx0c2Nyb2xsaW5nID0gdHJ1ZTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vbW9iaWxlIG9ubHkgLSBvcGVuIHNpZGViYXIgd2hlbiB1c2VyIGNsaWNrcyB0aGUgaGFtYnVyZ2VyIG1lbnVcblx0c2lkZWJhclRyaWdnZXIub24oJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpe1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0JChbc2lkZWJhciwgc2lkZWJhclRyaWdnZXJdKS50b2dnbGVDbGFzcygnbmF2LWlzLXZpc2libGUnKTtcblx0fSk7XG5cblx0Ly9jbGljayBvbiBpdGVtIGFuZCBzaG93IHN1Ym1lbnVcblx0JCgnLmhhcy1jaGlsZHJlbiA+IGEnKS5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCl7XG5cdFx0dmFyIG1xID0gY2hlY2tNUSgpLFxuXHRcdFx0c2VsZWN0ZWRJdGVtID0gJCh0aGlzKTtcblx0XHRpZiggbXEgPT0gJ21vYmlsZScgfHwgbXEgPT0gJ3RhYmxldCcgKSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0aWYoIHNlbGVjdGVkSXRlbS5wYXJlbnQoJ2xpJykuaGFzQ2xhc3MoJ3NlbGVjdGVkJykpIHtcblx0XHRcdFx0c2VsZWN0ZWRJdGVtLnBhcmVudCgnbGknKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNpZGViYXIuZmluZCgnLmhhcy1jaGlsZHJlbi5zZWxlY3RlZCcpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuXHRcdFx0XHRhY2NvdW50SW5mby5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcblx0XHRcdFx0c2VsZWN0ZWRJdGVtLnBhcmVudCgnbGknKS5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xuXG5cdC8vY2xpY2sgb24gYWNjb3VudCBhbmQgc2hvdyBzdWJtZW51IC0gZGVza3RvcCB2ZXJzaW9uIG9ubHlcblx0YWNjb3VudEluZm8uY2hpbGRyZW4oJ2EnKS5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCl7XG5cdFx0dmFyIG1xID0gY2hlY2tNUSgpLFxuXHRcdFx0c2VsZWN0ZWRJdGVtID0gJCh0aGlzKTtcblx0XHRpZiggbXEgPT0gJ2Rlc2t0b3AnKSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0YWNjb3VudEluZm8udG9nZ2xlQ2xhc3MoJ3NlbGVjdGVkJyk7XG5cdFx0XHRzaWRlYmFyLmZpbmQoJy5oYXMtY2hpbGRyZW4uc2VsZWN0ZWQnKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcblx0XHR9XG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRpZiggISQoZXZlbnQudGFyZ2V0KS5pcygnLmhhcy1jaGlsZHJlbiBhJykgKSB7XG5cdFx0XHRzaWRlYmFyLmZpbmQoJy5oYXMtY2hpbGRyZW4uc2VsZWN0ZWQnKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcblx0XHRcdGFjY291bnRJbmZvLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuXHRcdH1cblx0fSk7XG5cblx0Ly9vbiBkZXNrdG9wIC0gZGlmZmVyZW50aWF0ZSBiZXR3ZWVuIGEgdXNlciB0cnlpbmcgdG8gaG92ZXIgb3ZlciBhIGRyb3Bkb3duIGl0ZW0gdnMgdHJ5aW5nIHRvIG5hdmlnYXRlIGludG8gYSBzdWJtZW51J3MgY29udGVudHNcblx0c2lkZWJhci5jaGlsZHJlbigndWwnKS5tZW51QWltKHtcbiAgICAgICAgYWN0aXZhdGU6IGZ1bmN0aW9uKHJvdykge1xuICAgICAgICBcdCQocm93KS5hZGRDbGFzcygnaG92ZXInKTtcbiAgICAgICAgfSxcbiAgICAgICAgZGVhY3RpdmF0ZTogZnVuY3Rpb24ocm93KSB7XG4gICAgICAgIFx0JChyb3cpLnJlbW92ZUNsYXNzKCdob3ZlcicpO1xuICAgICAgICB9LFxuICAgICAgICBleGl0TWVudTogZnVuY3Rpb24oKSB7XG4gICAgICAgIFx0c2lkZWJhci5maW5kKCcuaG92ZXInKS5yZW1vdmVDbGFzcygnaG92ZXInKTtcbiAgICAgICAgXHRyZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgc3VibWVudVNlbGVjdG9yOiBcIi5oYXMtY2hpbGRyZW5cIixcbiAgICB9KTtcblxuXHRmdW5jdGlvbiBjaGVja01RKCkge1xuXHRcdC8vY2hlY2sgaWYgbW9iaWxlIG9yIGRlc2t0b3AgZGV2aWNlXG5cdFx0cmV0dXJuIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jZC1tYWluLWNvbnRlbnQnKSwgJzo6YmVmb3JlJykuZ2V0UHJvcGVydHlWYWx1ZSgnY29udGVudCcpLnJlcGxhY2UoLycvZywgXCJcIikucmVwbGFjZSgvXCIvZywgXCJcIik7XG5cdH1cblxuXHRmdW5jdGlvbiBtb3ZlTmF2aWdhdGlvbigpe1xuICBcdFx0dmFyIG1xID0gY2hlY2tNUSgpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCBtcSA9PSAnbW9iaWxlJyAmJiB0b3BOYXZpZ2F0aW9uLnBhcmVudHMoJy5jZC1zaWRlLW5hdicpLmxlbmd0aCA9PSAwICkge1xuICAgICAgICBcdGRldGFjaEVsZW1lbnRzKCk7XG5cdFx0XHR0b3BOYXZpZ2F0aW9uLmFwcGVuZFRvKHNpZGViYXIpO1xuXHRcdFx0c2VhcmNoRm9ybS5yZW1vdmVDbGFzcygnaXMtaGlkZGVuJykucHJlcGVuZFRvKHNpZGViYXIpO1xuXHRcdH0gZWxzZSBpZiAoICggbXEgPT0gJ3RhYmxldCcgfHwgbXEgPT0gJ2Rlc2t0b3AnKSAmJiAgdG9wTmF2aWdhdGlvbi5wYXJlbnRzKCcuY2Qtc2lkZS1uYXYnKS5sZW5ndGggPiAwICkge1xuXHRcdFx0ZGV0YWNoRWxlbWVudHMoKTtcblx0XHRcdHNlYXJjaEZvcm0uaW5zZXJ0QWZ0ZXIoaGVhZGVyLmZpbmQoJy5jZC1sb2dvJykpO1xuXHRcdFx0dG9wTmF2aWdhdGlvbi5hcHBlbmRUbyhoZWFkZXIuZmluZCgnLmNkLW5hdicpKTtcblx0XHR9XG5cdFx0Y2hlY2tTZWxlY3RlZChtcSk7XG5cdFx0cmVzaXppbmcgPSBmYWxzZTtcblx0fVxuXG5cdGZ1bmN0aW9uIGRldGFjaEVsZW1lbnRzKCkge1xuXHRcdHRvcE5hdmlnYXRpb24uZGV0YWNoKCk7XG5cdFx0c2VhcmNoRm9ybS5kZXRhY2goKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGNoZWNrU2VsZWN0ZWQobXEpIHtcblx0XHQvL29uIGRlc2t0b3AsIHJlbW92ZSBzZWxlY3RlZCBjbGFzcyBmcm9tIGl0ZW1zIHNlbGVjdGVkIG9uIG1vYmlsZS90YWJsZXQgdmVyc2lvblxuXHRcdGlmKCBtcSA9PSAnZGVza3RvcCcgKSAkKCcuaGFzLWNoaWxkcmVuLnNlbGVjdGVkJykucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XG5cdH1cblxuXHRmdW5jdGlvbiBjaGVja1Njcm9sbGJhclBvc2l0aW9uKCkge1xuXHRcdHZhciBtcSA9IGNoZWNrTVEoKTtcblx0XHRcblx0XHRpZiggbXEgIT0gJ21vYmlsZScgKSB7XG5cdFx0XHR2YXIgc2lkZWJhckhlaWdodCA9IHNpZGViYXIub3V0ZXJIZWlnaHQoKSxcblx0XHRcdFx0d2luZG93SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpLFxuXHRcdFx0XHRtYWluQ29udGVudEhlaWdodCA9IG1haW5Db250ZW50Lm91dGVySGVpZ2h0KCksXG5cdFx0XHRcdHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcblxuXHRcdFx0KCAoIHNjcm9sbFRvcCArIHdpbmRvd0hlaWdodCA+IHNpZGViYXJIZWlnaHQgKSAmJiAoIG1haW5Db250ZW50SGVpZ2h0IC0gc2lkZWJhckhlaWdodCAhPSAwICkgKSA/IHNpZGViYXIuYWRkQ2xhc3MoJ2lzLWZpeGVkJykuY3NzKCdib3R0b20nLCAwKSA6IHNpZGViYXIucmVtb3ZlQ2xhc3MoJ2lzLWZpeGVkJykuYXR0cignc3R5bGUnLCAnJyk7XG5cdFx0fVxuXHRcdHNjcm9sbGluZyA9IGZhbHNlO1xuXHR9XG59KTsiLCIvKiFcbiAqIE1vY2tKYXggLSBqUXVlcnkgUGx1Z2luIHRvIE1vY2sgQWpheCByZXF1ZXN0c1xuICpcbiAqIFZlcnNpb246ICAxLjUuM1xuICogUmVsZWFzZWQ6XG4gKiBIb21lOiAgIGh0dHA6Ly9naXRodWIuY29tL2FwcGVuZHRvL2pxdWVyeS1tb2NramF4XG4gKiBBdXRob3I6ICAgSm9uYXRoYW4gU2hhcnAgKGh0dHA6Ly9qZHNoYXJwLmNvbSlcbiAqIExpY2Vuc2U6ICBNSVQsR1BMXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDExIGFwcGVuZFRvIExMQy5cbiAqIER1YWwgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBvciBHUEwgbGljZW5zZXMuXG4gKiBodHRwOi8vYXBwZW5kdG8uY29tL29wZW4tc291cmNlLWxpY2Vuc2VzXG4gKi9cbihmdW5jdGlvbigkKSB7XG5cdHZhciBfYWpheCA9ICQuYWpheCxcblx0XHRtb2NrSGFuZGxlcnMgPSBbXSxcblx0XHRtb2NrZWRBamF4Q2FsbHMgPSBbXSxcblx0XHRDQUxMQkFDS19SRUdFWCA9IC89XFw/KCZ8JCkvLFxuXHRcdGpzYyA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG5cblxuXHQvLyBQYXJzZSB0aGUgZ2l2ZW4gWE1MIHN0cmluZy5cblx0ZnVuY3Rpb24gcGFyc2VYTUwoeG1sKSB7XG5cdFx0aWYgKCB3aW5kb3cuRE9NUGFyc2VyID09IHVuZGVmaW5lZCAmJiB3aW5kb3cuQWN0aXZlWE9iamVjdCApIHtcblx0XHRcdERPTVBhcnNlciA9IGZ1bmN0aW9uKCkgeyB9O1xuXHRcdFx0RE9NUGFyc2VyLnByb3RvdHlwZS5wYXJzZUZyb21TdHJpbmcgPSBmdW5jdGlvbiggeG1sU3RyaW5nICkge1xuXHRcdFx0XHR2YXIgZG9jID0gbmV3IEFjdGl2ZVhPYmplY3QoJ01pY3Jvc29mdC5YTUxET00nKTtcblx0XHRcdFx0ZG9jLmFzeW5jID0gJ2ZhbHNlJztcblx0XHRcdFx0ZG9jLmxvYWRYTUwoIHhtbFN0cmluZyApO1xuXHRcdFx0XHRyZXR1cm4gZG9jO1xuXHRcdFx0fTtcblx0XHR9XG5cblx0XHR0cnkge1xuXHRcdFx0dmFyIHhtbERvYyA9ICggbmV3IERPTVBhcnNlcigpICkucGFyc2VGcm9tU3RyaW5nKCB4bWwsICd0ZXh0L3htbCcgKTtcblx0XHRcdGlmICggJC5pc1hNTERvYyggeG1sRG9jICkgKSB7XG5cdFx0XHRcdHZhciBlcnIgPSAkKCdwYXJzZXJlcnJvcicsIHhtbERvYyk7XG5cdFx0XHRcdGlmICggZXJyLmxlbmd0aCA9PSAxICkge1xuXHRcdFx0XHRcdHRocm93KCdFcnJvcjogJyArICQoeG1sRG9jKS50ZXh0KCkgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3coJ1VuYWJsZSB0byBwYXJzZSBYTUwnKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB4bWxEb2M7XG5cdFx0fSBjYXRjaCggZSApIHtcblx0XHRcdHZhciBtc2cgPSAoIGUubmFtZSA9PSB1bmRlZmluZWQgPyBlIDogZS5uYW1lICsgJzogJyArIGUubWVzc2FnZSApO1xuXHRcdFx0JChkb2N1bWVudCkudHJpZ2dlcigneG1sUGFyc2VFcnJvcicsIFsgbXNnIF0pO1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdH1cblxuXHQvLyBUcmlnZ2VyIGEgalF1ZXJ5IGV2ZW50XG5cdGZ1bmN0aW9uIHRyaWdnZXIocywgdHlwZSwgYXJncykge1xuXHRcdChzLmNvbnRleHQgPyAkKHMuY29udGV4dCkgOiAkLmV2ZW50KS50cmlnZ2VyKHR5cGUsIGFyZ3MpO1xuXHR9XG5cblx0Ly8gQ2hlY2sgaWYgdGhlIGRhdGEgZmllbGQgb24gdGhlIG1vY2sgaGFuZGxlciBhbmQgdGhlIHJlcXVlc3QgbWF0Y2guIFRoaXNcblx0Ly8gY2FuIGJlIHVzZWQgdG8gcmVzdHJpY3QgYSBtb2NrIGhhbmRsZXIgdG8gYmVpbmcgdXNlZCBvbmx5IHdoZW4gYSBjZXJ0YWluXG5cdC8vIHNldCBvZiBkYXRhIGlzIHBhc3NlZCB0byBpdC5cblx0ZnVuY3Rpb24gaXNNb2NrRGF0YUVxdWFsKCBtb2NrLCBsaXZlICkge1xuXHRcdHZhciBpZGVudGljYWwgPSB0cnVlO1xuXHRcdC8vIFRlc3QgZm9yIHNpdHVhdGlvbnMgd2hlcmUgdGhlIGRhdGEgaXMgYSBxdWVyeXN0cmluZyAobm90IGFuIG9iamVjdClcblx0XHRpZiAodHlwZW9mIGxpdmUgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHQvLyBRdWVyeXN0cmluZyBtYXkgYmUgYSByZWdleFxuXHRcdFx0cmV0dXJuICQuaXNGdW5jdGlvbiggbW9jay50ZXN0ICkgPyBtb2NrLnRlc3QobGl2ZSkgOiBtb2NrID09IGxpdmU7XG5cdFx0fVxuXHRcdCQuZWFjaChtb2NrLCBmdW5jdGlvbihrKSB7XG5cdFx0XHRpZiAoIGxpdmVba10gPT09IHVuZGVmaW5lZCApIHtcblx0XHRcdFx0aWRlbnRpY2FsID0gZmFsc2U7XG5cdFx0XHRcdHJldHVybiBpZGVudGljYWw7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAoIHR5cGVvZiBsaXZlW2tdID09PSAnb2JqZWN0JyAmJiBsaXZlW2tdICE9PSBudWxsICkge1xuXHRcdFx0XHRcdGlmICggaWRlbnRpY2FsICYmICQuaXNBcnJheSggbGl2ZVtrXSApICkge1xuXHRcdFx0XHRcdFx0aWRlbnRpY2FsID0gJC5pc0FycmF5KCBtb2NrW2tdICkgJiYgbGl2ZVtrXS5sZW5ndGggPT09IG1vY2tba10ubGVuZ3RoO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZGVudGljYWwgPSBpZGVudGljYWwgJiYgaXNNb2NrRGF0YUVxdWFsKG1vY2tba10sIGxpdmVba10pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGlmICggbW9ja1trXSAmJiAkLmlzRnVuY3Rpb24oIG1vY2tba10udGVzdCApICkge1xuXHRcdFx0XHRcdFx0aWRlbnRpY2FsID0gaWRlbnRpY2FsICYmIG1vY2tba10udGVzdChsaXZlW2tdKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0aWRlbnRpY2FsID0gaWRlbnRpY2FsICYmICggbW9ja1trXSA9PSBsaXZlW2tdICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gaWRlbnRpY2FsO1xuXHR9XG5cbiAgICAvLyBTZWUgaWYgYSBtb2NrIGhhbmRsZXIgcHJvcGVydHkgbWF0Y2hlcyB0aGUgZGVmYXVsdCBzZXR0aW5nc1xuICAgIGZ1bmN0aW9uIGlzRGVmYXVsdFNldHRpbmcoaGFuZGxlciwgcHJvcGVydHkpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZXJbcHJvcGVydHldID09PSAkLm1vY2tqYXhTZXR0aW5nc1twcm9wZXJ0eV07XG4gICAgfVxuXG5cdC8vIENoZWNrIHRoZSBnaXZlbiBoYW5kbGVyIHNob3VsZCBtb2NrIHRoZSBnaXZlbiByZXF1ZXN0XG5cdGZ1bmN0aW9uIGdldE1vY2tGb3JSZXF1ZXN0KCBoYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MgKSB7XG5cdFx0Ly8gSWYgdGhlIG1vY2sgd2FzIHJlZ2lzdGVyZWQgd2l0aCBhIGZ1bmN0aW9uLCBsZXQgdGhlIGZ1bmN0aW9uIGRlY2lkZSBpZiB3ZVxuXHRcdC8vIHdhbnQgdG8gbW9jayB0aGlzIHJlcXVlc3Rcblx0XHRpZiAoICQuaXNGdW5jdGlvbihoYW5kbGVyKSApIHtcblx0XHRcdHJldHVybiBoYW5kbGVyKCByZXF1ZXN0U2V0dGluZ3MgKTtcblx0XHR9XG5cblx0XHQvLyBJbnNwZWN0IHRoZSBVUkwgb2YgdGhlIHJlcXVlc3QgYW5kIGNoZWNrIGlmIHRoZSBtb2NrIGhhbmRsZXIncyB1cmxcblx0XHQvLyBtYXRjaGVzIHRoZSB1cmwgZm9yIHRoaXMgYWpheCByZXF1ZXN0XG5cdFx0aWYgKCAkLmlzRnVuY3Rpb24oaGFuZGxlci51cmwudGVzdCkgKSB7XG5cdFx0XHQvLyBUaGUgdXNlciBwcm92aWRlZCBhIHJlZ2V4IGZvciB0aGUgdXJsLCB0ZXN0IGl0XG5cdFx0XHRpZiAoICFoYW5kbGVyLnVybC50ZXN0KCByZXF1ZXN0U2V0dGluZ3MudXJsICkgKSB7XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBMb29rIGZvciBhIHNpbXBsZSB3aWxkY2FyZCAnKicgb3IgYSBkaXJlY3QgVVJMIG1hdGNoXG5cdFx0XHR2YXIgc3RhciA9IGhhbmRsZXIudXJsLmluZGV4T2YoJyonKTtcblx0XHRcdGlmIChoYW5kbGVyLnVybCAhPT0gcmVxdWVzdFNldHRpbmdzLnVybCAmJiBzdGFyID09PSAtMSB8fFxuXHRcdFx0XHRcdCFuZXcgUmVnRXhwKGhhbmRsZXIudXJsLnJlcGxhY2UoL1stW1xcXXt9KCkrPy4sXFxcXF4kfCNcXHNdL2csIFwiXFxcXCQmXCIpLnJlcGxhY2UoL1xcKi9nLCAnLisnKSkudGVzdChyZXF1ZXN0U2V0dGluZ3MudXJsKSkge1xuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBJbnNwZWN0IHRoZSBkYXRhIHN1Ym1pdHRlZCBpbiB0aGUgcmVxdWVzdCAoZWl0aGVyIFBPU1QgYm9keSBvciBHRVQgcXVlcnkgc3RyaW5nKVxuXHRcdGlmICggaGFuZGxlci5kYXRhICkge1xuXHRcdFx0aWYgKCAhIHJlcXVlc3RTZXR0aW5ncy5kYXRhIHx8ICFpc01vY2tEYXRhRXF1YWwoaGFuZGxlci5kYXRhLCByZXF1ZXN0U2V0dGluZ3MuZGF0YSkgKSB7XG5cdFx0XHRcdC8vIFRoZXkncmUgbm90IGlkZW50aWNhbCwgZG8gbm90IG1vY2sgdGhpcyByZXF1ZXN0XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyBJbnNwZWN0IHRoZSByZXF1ZXN0IHR5cGVcblx0XHRpZiAoIGhhbmRsZXIgJiYgaGFuZGxlci50eXBlICYmXG5cdFx0XHRcdGhhbmRsZXIudHlwZS50b0xvd2VyQ2FzZSgpICE9IHJlcXVlc3RTZXR0aW5ncy50eXBlLnRvTG93ZXJDYXNlKCkgKSB7XG5cdFx0XHQvLyBUaGUgcmVxdWVzdCB0eXBlIGRvZXNuJ3QgbWF0Y2ggKEdFVCB2cy4gUE9TVClcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdHJldHVybiBoYW5kbGVyO1xuXHR9XG5cblx0Ly8gUHJvY2VzcyB0aGUgeGhyIG9iamVjdHMgc2VuZCBvcGVyYXRpb25cblx0ZnVuY3Rpb24gX3hoclNlbmQobW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncywgb3JpZ1NldHRpbmdzKSB7XG5cblx0XHQvLyBUaGlzIGlzIGEgc3Vic3RpdHV0ZSBmb3IgPCAxLjQgd2hpY2ggbGFja3MgJC5wcm94eVxuXHRcdHZhciBwcm9jZXNzID0gKGZ1bmN0aW9uKHRoYXQpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR2YXIgb25SZWFkeTtcblxuXHRcdFx0XHRcdC8vIFRoZSByZXF1ZXN0IGhhcyByZXR1cm5lZFxuXHRcdFx0XHRcdHRoaXMuc3RhdHVzICAgICA9IG1vY2tIYW5kbGVyLnN0YXR1cztcblx0XHRcdFx0XHR0aGlzLnN0YXR1c1RleHQgPSBtb2NrSGFuZGxlci5zdGF0dXNUZXh0O1xuXHRcdFx0XHRcdHRoaXMucmVhZHlTdGF0ZVx0PSA0O1xuXG5cdFx0XHRcdFx0Ly8gV2UgaGF2ZSBhbiBleGVjdXRhYmxlIGZ1bmN0aW9uLCBjYWxsIGl0IHRvIGdpdmVcblx0XHRcdFx0XHQvLyB0aGUgbW9jayBoYW5kbGVyIGEgY2hhbmNlIHRvIHVwZGF0ZSBpdCdzIGRhdGFcblx0XHRcdFx0XHRpZiAoICQuaXNGdW5jdGlvbihtb2NrSGFuZGxlci5yZXNwb25zZSkgKSB7XG5cdFx0XHRcdFx0XHRtb2NrSGFuZGxlci5yZXNwb25zZShvcmlnU2V0dGluZ3MpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBDb3B5IG92ZXIgb3VyIG1vY2sgdG8gb3VyIHhociBvYmplY3QgYmVmb3JlIHBhc3NpbmcgY29udHJvbCBiYWNrIHRvXG5cdFx0XHRcdFx0Ly8galF1ZXJ5J3Mgb25yZWFkeXN0YXRlY2hhbmdlIGNhbGxiYWNrXG5cdFx0XHRcdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgPT0gJ2pzb24nICYmICggdHlwZW9mIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCA9PSAnb2JqZWN0JyApICkge1xuXHRcdFx0XHRcdFx0dGhpcy5yZXNwb25zZVRleHQgPSBKU09OLnN0cmluZ2lmeShtb2NrSGFuZGxlci5yZXNwb25zZVRleHQpO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoIHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSA9PSAneG1sJyApIHtcblx0XHRcdFx0XHRcdGlmICggdHlwZW9mIG1vY2tIYW5kbGVyLnJlc3BvbnNlWE1MID09ICdzdHJpbmcnICkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLnJlc3BvbnNlWE1MID0gcGFyc2VYTUwobW9ja0hhbmRsZXIucmVzcG9uc2VYTUwpO1xuXHRcdFx0XHRcdFx0XHQvL2luIGpRdWVyeSAxLjkuMSssIHJlc3BvbnNlWE1MIGlzIHByb2Nlc3NlZCBkaWZmZXJlbnRseSBhbmQgcmVsaWVzIG9uIHJlc3BvbnNlVGV4dFxuXHRcdFx0XHRcdFx0XHR0aGlzLnJlc3BvbnNlVGV4dCA9IG1vY2tIYW5kbGVyLnJlc3BvbnNlWE1MO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5yZXNwb25zZVhNTCA9IG1vY2tIYW5kbGVyLnJlc3BvbnNlWE1MO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aGlzLnJlc3BvbnNlVGV4dCA9IG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYoIHR5cGVvZiBtb2NrSGFuZGxlci5zdGF0dXMgPT0gJ251bWJlcicgfHwgdHlwZW9mIG1vY2tIYW5kbGVyLnN0YXR1cyA9PSAnc3RyaW5nJyApIHtcblx0XHRcdFx0XHRcdHRoaXMuc3RhdHVzID0gbW9ja0hhbmRsZXIuc3RhdHVzO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiggdHlwZW9mIG1vY2tIYW5kbGVyLnN0YXR1c1RleHQgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0XHRcdHRoaXMuc3RhdHVzVGV4dCA9IG1vY2tIYW5kbGVyLnN0YXR1c1RleHQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIGpRdWVyeSAyLjAgcmVuYW1lZCBvbnJlYWR5c3RhdGVjaGFuZ2UgdG8gb25sb2FkXG5cdFx0XHRcdFx0b25SZWFkeSA9IHRoaXMub25yZWFkeXN0YXRlY2hhbmdlIHx8IHRoaXMub25sb2FkO1xuXG5cdFx0XHRcdFx0Ly8galF1ZXJ5IDwgMS40IGRvZXNuJ3QgaGF2ZSBvbnJlYWR5c3RhdGUgY2hhbmdlIGZvciB4aHJcblx0XHRcdFx0XHRpZiAoICQuaXNGdW5jdGlvbiggb25SZWFkeSApICkge1xuXHRcdFx0XHRcdFx0aWYoIG1vY2tIYW5kbGVyLmlzVGltZW91dCkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLnN0YXR1cyA9IC0xO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0b25SZWFkeS5jYWxsKCB0aGlzLCBtb2NrSGFuZGxlci5pc1RpbWVvdXQgPyAndGltZW91dCcgOiB1bmRlZmluZWQgKTtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKCBtb2NrSGFuZGxlci5pc1RpbWVvdXQgKSB7XG5cdFx0XHRcdFx0XHQvLyBGaXggZm9yIDEuMy4yIHRpbWVvdXQgdG8ga2VlcCBzdWNjZXNzIGZyb20gZmlyaW5nLlxuXHRcdFx0XHRcdFx0dGhpcy5zdGF0dXMgPSAtMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pLmFwcGx5KHRoYXQpO1xuXHRcdFx0fTtcblx0XHR9KSh0aGlzKTtcblxuXHRcdGlmICggbW9ja0hhbmRsZXIucHJveHkgKSB7XG5cdFx0XHQvLyBXZSdyZSBwcm94eWluZyB0aGlzIHJlcXVlc3QgYW5kIGxvYWRpbmcgaW4gYW4gZXh0ZXJuYWwgZmlsZSBpbnN0ZWFkXG5cdFx0XHRfYWpheCh7XG5cdFx0XHRcdGdsb2JhbDogZmFsc2UsXG5cdFx0XHRcdHVybDogbW9ja0hhbmRsZXIucHJveHksXG5cdFx0XHRcdHR5cGU6IG1vY2tIYW5kbGVyLnByb3h5VHlwZSxcblx0XHRcdFx0ZGF0YTogbW9ja0hhbmRsZXIuZGF0YSxcblx0XHRcdFx0ZGF0YVR5cGU6IHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSA9PT0gXCJzY3JpcHRcIiA/IFwidGV4dC9wbGFpblwiIDogcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlLFxuXHRcdFx0XHRjb21wbGV0ZTogZnVuY3Rpb24oeGhyKSB7XG5cdFx0XHRcdFx0bW9ja0hhbmRsZXIucmVzcG9uc2VYTUwgPSB4aHIucmVzcG9uc2VYTUw7XG5cdFx0XHRcdFx0bW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ID0geGhyLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgICAgICAgICAgICAgLy8gRG9uJ3Qgb3ZlcnJpZGUgdGhlIGhhbmRsZXIgc3RhdHVzL3N0YXR1c1RleHQgaWYgaXQncyBzcGVjaWZpZWQgYnkgdGhlIGNvbmZpZ1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNEZWZhdWx0U2V0dGluZyhtb2NrSGFuZGxlciwgJ3N0YXR1cycpKSB7XG5cdFx0XHRcdFx0ICAgIG1vY2tIYW5kbGVyLnN0YXR1cyA9IHhoci5zdGF0dXM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzRGVmYXVsdFNldHRpbmcobW9ja0hhbmRsZXIsICdzdGF0dXNUZXh0JykpIHtcblx0XHRcdFx0XHQgICAgbW9ja0hhbmRsZXIuc3RhdHVzVGV4dCA9IHhoci5zdGF0dXNUZXh0O1xuICAgICAgICAgICAgICAgICAgICB9XG5cblx0XHRcdFx0XHR0aGlzLnJlc3BvbnNlVGltZXIgPSBzZXRUaW1lb3V0KHByb2Nlc3MsIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGltZSB8fCAwKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIHR5cGUgPT0gJ1BPU1QnIHx8ICdHRVQnIHx8ICdERUxFVEUnXG5cdFx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5hc3luYyA9PT0gZmFsc2UgKSB7XG5cdFx0XHRcdC8vIFRPRE86IEJsb2NraW5nIGRlbGF5XG5cdFx0XHRcdHByb2Nlc3MoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMucmVzcG9uc2VUaW1lciA9IHNldFRpbWVvdXQocHJvY2VzcywgbW9ja0hhbmRsZXIucmVzcG9uc2VUaW1lIHx8IDUwKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLyBDb25zdHJ1Y3QgYSBtb2NrZWQgWEhSIE9iamVjdFxuXHRmdW5jdGlvbiB4aHIobW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncywgb3JpZ1NldHRpbmdzLCBvcmlnSGFuZGxlcikge1xuXHRcdC8vIEV4dGVuZCB3aXRoIG91ciBkZWZhdWx0IG1vY2tqYXggc2V0dGluZ3Ncblx0XHRtb2NrSGFuZGxlciA9ICQuZXh0ZW5kKHRydWUsIHt9LCAkLm1vY2tqYXhTZXR0aW5ncywgbW9ja0hhbmRsZXIpO1xuXG5cdFx0aWYgKHR5cGVvZiBtb2NrSGFuZGxlci5oZWFkZXJzID09PSAndW5kZWZpbmVkJykge1xuXHRcdFx0bW9ja0hhbmRsZXIuaGVhZGVycyA9IHt9O1xuXHRcdH1cblx0XHRpZiAoIG1vY2tIYW5kbGVyLmNvbnRlbnRUeXBlICkge1xuXHRcdFx0bW9ja0hhbmRsZXIuaGVhZGVyc1snY29udGVudC10eXBlJ10gPSBtb2NrSGFuZGxlci5jb250ZW50VHlwZTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0c3RhdHVzOiBtb2NrSGFuZGxlci5zdGF0dXMsXG5cdFx0XHRzdGF0dXNUZXh0OiBtb2NrSGFuZGxlci5zdGF0dXNUZXh0LFxuXHRcdFx0cmVhZHlTdGF0ZTogMSxcblx0XHRcdG9wZW46IGZ1bmN0aW9uKCkgeyB9LFxuXHRcdFx0c2VuZDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdG9yaWdIYW5kbGVyLmZpcmVkID0gdHJ1ZTtcblx0XHRcdFx0X3hoclNlbmQuY2FsbCh0aGlzLCBtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MpO1xuXHRcdFx0fSxcblx0XHRcdGFib3J0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHRoaXMucmVzcG9uc2VUaW1lcik7XG5cdFx0XHR9LFxuXHRcdFx0c2V0UmVxdWVzdEhlYWRlcjogZnVuY3Rpb24oaGVhZGVyLCB2YWx1ZSkge1xuXHRcdFx0XHRtb2NrSGFuZGxlci5oZWFkZXJzW2hlYWRlcl0gPSB2YWx1ZTtcblx0XHRcdH0sXG5cdFx0XHRnZXRSZXNwb25zZUhlYWRlcjogZnVuY3Rpb24oaGVhZGVyKSB7XG5cdFx0XHRcdC8vICdMYXN0LW1vZGlmaWVkJywgJ0V0YWcnLCAnY29udGVudC10eXBlJyBhcmUgYWxsIGNoZWNrZWQgYnkgalF1ZXJ5XG5cdFx0XHRcdGlmICggbW9ja0hhbmRsZXIuaGVhZGVycyAmJiBtb2NrSGFuZGxlci5oZWFkZXJzW2hlYWRlcl0gKSB7XG5cdFx0XHRcdFx0Ly8gUmV0dXJuIGFyYml0cmFyeSBoZWFkZXJzXG5cdFx0XHRcdFx0cmV0dXJuIG1vY2tIYW5kbGVyLmhlYWRlcnNbaGVhZGVyXTtcblx0XHRcdFx0fSBlbHNlIGlmICggaGVhZGVyLnRvTG93ZXJDYXNlKCkgPT0gJ2xhc3QtbW9kaWZpZWQnICkge1xuXHRcdFx0XHRcdHJldHVybiBtb2NrSGFuZGxlci5sYXN0TW9kaWZpZWQgfHwgKG5ldyBEYXRlKCkpLnRvU3RyaW5nKCk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoIGhlYWRlci50b0xvd2VyQ2FzZSgpID09ICdldGFnJyApIHtcblx0XHRcdFx0XHRyZXR1cm4gbW9ja0hhbmRsZXIuZXRhZyB8fCAnJztcblx0XHRcdFx0fSBlbHNlIGlmICggaGVhZGVyLnRvTG93ZXJDYXNlKCkgPT0gJ2NvbnRlbnQtdHlwZScgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG1vY2tIYW5kbGVyLmNvbnRlbnRUeXBlIHx8ICd0ZXh0L3BsYWluJztcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGdldEFsbFJlc3BvbnNlSGVhZGVyczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBoZWFkZXJzID0gJyc7XG5cdFx0XHRcdCQuZWFjaChtb2NrSGFuZGxlci5oZWFkZXJzLCBmdW5jdGlvbihrLCB2KSB7XG5cdFx0XHRcdFx0aGVhZGVycyArPSBrICsgJzogJyArIHYgKyBcIlxcblwiO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0cmV0dXJuIGhlYWRlcnM7XG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXG5cdC8vIFByb2Nlc3MgYSBKU09OUCBtb2NrIHJlcXVlc3QuXG5cdGZ1bmN0aW9uIHByb2Nlc3NKc29ucE1vY2soIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyApIHtcblx0XHQvLyBIYW5kbGUgSlNPTlAgUGFyYW1ldGVyIENhbGxiYWNrcywgd2UgbmVlZCB0byByZXBsaWNhdGUgc29tZSBvZiB0aGUgalF1ZXJ5IGNvcmUgaGVyZVxuXHRcdC8vIGJlY2F1c2UgdGhlcmUgaXNuJ3QgYW4gZWFzeSBob29rIGZvciB0aGUgY3Jvc3MgZG9tYWluIHNjcmlwdCB0YWcgb2YganNvbnBcblxuXHRcdHByb2Nlc3NKc29ucFVybCggcmVxdWVzdFNldHRpbmdzICk7XG5cblx0XHRyZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgPSBcImpzb25cIjtcblx0XHRpZihyZXF1ZXN0U2V0dGluZ3MuZGF0YSAmJiBDQUxMQkFDS19SRUdFWC50ZXN0KHJlcXVlc3RTZXR0aW5ncy5kYXRhKSB8fCBDQUxMQkFDS19SRUdFWC50ZXN0KHJlcXVlc3RTZXR0aW5ncy51cmwpKSB7XG5cdFx0XHRjcmVhdGVKc29ucENhbGxiYWNrKHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyk7XG5cblx0XHRcdC8vIFdlIG5lZWQgdG8gbWFrZSBzdXJlXG5cdFx0XHQvLyB0aGF0IGEgSlNPTlAgc3R5bGUgcmVzcG9uc2UgaXMgZXhlY3V0ZWQgcHJvcGVybHlcblxuXHRcdFx0dmFyIHJ1cmwgPSAvXihcXHcrOik/XFwvXFwvKFteXFwvPyNdKykvLFxuXHRcdFx0XHRwYXJ0cyA9IHJ1cmwuZXhlYyggcmVxdWVzdFNldHRpbmdzLnVybCApLFxuXHRcdFx0XHRyZW1vdGUgPSBwYXJ0cyAmJiAocGFydHNbMV0gJiYgcGFydHNbMV0gIT09IGxvY2F0aW9uLnByb3RvY29sIHx8IHBhcnRzWzJdICE9PSBsb2NhdGlvbi5ob3N0KTtcblxuXHRcdFx0cmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlID0gXCJzY3JpcHRcIjtcblx0XHRcdGlmKHJlcXVlc3RTZXR0aW5ncy50eXBlLnRvVXBwZXJDYXNlKCkgPT09IFwiR0VUXCIgJiYgcmVtb3RlICkge1xuXHRcdFx0XHR2YXIgbmV3TW9ja1JldHVybiA9IHByb2Nlc3NKc29ucFJlcXVlc3QoIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyApO1xuXG5cdFx0XHRcdC8vIENoZWNrIGlmIHdlIGFyZSBzdXBwb3NlZCB0byByZXR1cm4gYSBEZWZlcnJlZCBiYWNrIHRvIHRoZSBtb2NrIGNhbGwsIG9yIGp1c3Rcblx0XHRcdFx0Ly8gc2lnbmFsIHN1Y2Nlc3Ncblx0XHRcdFx0aWYobmV3TW9ja1JldHVybikge1xuXHRcdFx0XHRcdHJldHVybiBuZXdNb2NrUmV0dXJuO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0Ly8gQXBwZW5kIHRoZSByZXF1aXJlZCBjYWxsYmFjayBwYXJhbWV0ZXIgdG8gdGhlIGVuZCBvZiB0aGUgcmVxdWVzdCBVUkwsIGZvciBhIEpTT05QIHJlcXVlc3Rcblx0ZnVuY3Rpb24gcHJvY2Vzc0pzb25wVXJsKCByZXF1ZXN0U2V0dGluZ3MgKSB7XG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MudHlwZS50b1VwcGVyQ2FzZSgpID09PSBcIkdFVFwiICkge1xuXHRcdFx0aWYgKCAhQ0FMTEJBQ0tfUkVHRVgudGVzdCggcmVxdWVzdFNldHRpbmdzLnVybCApICkge1xuXHRcdFx0XHRyZXF1ZXN0U2V0dGluZ3MudXJsICs9ICgvXFw/Ly50ZXN0KCByZXF1ZXN0U2V0dGluZ3MudXJsICkgPyBcIiZcIiA6IFwiP1wiKSArXG5cdFx0XHRcdFx0KHJlcXVlc3RTZXR0aW5ncy5qc29ucCB8fCBcImNhbGxiYWNrXCIpICsgXCI9P1wiO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoICFyZXF1ZXN0U2V0dGluZ3MuZGF0YSB8fCAhQ0FMTEJBQ0tfUkVHRVgudGVzdChyZXF1ZXN0U2V0dGluZ3MuZGF0YSkgKSB7XG5cdFx0XHRyZXF1ZXN0U2V0dGluZ3MuZGF0YSA9IChyZXF1ZXN0U2V0dGluZ3MuZGF0YSA/IHJlcXVlc3RTZXR0aW5ncy5kYXRhICsgXCImXCIgOiBcIlwiKSArIChyZXF1ZXN0U2V0dGluZ3MuanNvbnAgfHwgXCJjYWxsYmFja1wiKSArIFwiPT9cIjtcblx0XHR9XG5cdH1cblxuXHQvLyBQcm9jZXNzIGEgSlNPTlAgcmVxdWVzdCBieSBldmFsdWF0aW5nIHRoZSBtb2NrZWQgcmVzcG9uc2UgdGV4dFxuXHRmdW5jdGlvbiBwcm9jZXNzSnNvbnBSZXF1ZXN0KCByZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MgKSB7XG5cdFx0Ly8gU3ludGhlc2l6ZSB0aGUgbW9jayByZXF1ZXN0IGZvciBhZGRpbmcgYSBzY3JpcHQgdGFnXG5cdFx0dmFyIGNhbGxiYWNrQ29udGV4dCA9IG9yaWdTZXR0aW5ncyAmJiBvcmlnU2V0dGluZ3MuY29udGV4dCB8fCByZXF1ZXN0U2V0dGluZ3MsXG5cdFx0XHRuZXdNb2NrID0gbnVsbDtcblxuXG5cdFx0Ly8gSWYgdGhlIHJlc3BvbnNlIGhhbmRsZXIgb24gdGhlIG1vb2NrIGlzIGEgZnVuY3Rpb24sIGNhbGwgaXRcblx0XHRpZiAoIG1vY2tIYW5kbGVyLnJlc3BvbnNlICYmICQuaXNGdW5jdGlvbihtb2NrSGFuZGxlci5yZXNwb25zZSkgKSB7XG5cdFx0XHRtb2NrSGFuZGxlci5yZXNwb25zZShvcmlnU2V0dGluZ3MpO1xuXHRcdH0gZWxzZSB7XG5cblx0XHRcdC8vIEV2YWx1YXRlIHRoZSByZXNwb25zZVRleHQgamF2YXNjcmlwdCBpbiBhIGdsb2JhbCBjb250ZXh0XG5cdFx0XHRpZiggdHlwZW9mIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCA9PT0gJ29iamVjdCcgKSB7XG5cdFx0XHRcdCQuZ2xvYmFsRXZhbCggJygnICsgSlNPTi5zdHJpbmdpZnkoIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCApICsgJyknKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQuZ2xvYmFsRXZhbCggJygnICsgbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ICsgJyknKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBTdWNjZXNzZnVsIHJlc3BvbnNlXG5cdFx0anNvbnBTdWNjZXNzKCByZXF1ZXN0U2V0dGluZ3MsIGNhbGxiYWNrQ29udGV4dCwgbW9ja0hhbmRsZXIgKTtcblx0XHRqc29ucENvbXBsZXRlKCByZXF1ZXN0U2V0dGluZ3MsIGNhbGxiYWNrQ29udGV4dCwgbW9ja0hhbmRsZXIgKTtcblxuXHRcdC8vIElmIHdlIGFyZSBydW5uaW5nIHVuZGVyIGpRdWVyeSAxLjUrLCByZXR1cm4gYSBkZWZlcnJlZCBvYmplY3Rcblx0XHRpZigkLkRlZmVycmVkKXtcblx0XHRcdG5ld01vY2sgPSBuZXcgJC5EZWZlcnJlZCgpO1xuXHRcdFx0aWYodHlwZW9mIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCA9PSBcIm9iamVjdFwiKXtcblx0XHRcdFx0bmV3TW9jay5yZXNvbHZlV2l0aCggY2FsbGJhY2tDb250ZXh0LCBbbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0XSApO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0bmV3TW9jay5yZXNvbHZlV2l0aCggY2FsbGJhY2tDb250ZXh0LCBbJC5wYXJzZUpTT04oIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCApXSApO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gbmV3TW9jaztcblx0fVxuXG5cblx0Ly8gQ3JlYXRlIHRoZSByZXF1aXJlZCBKU09OUCBjYWxsYmFjayBmdW5jdGlvbiBmb3IgdGhlIHJlcXVlc3Rcblx0ZnVuY3Rpb24gY3JlYXRlSnNvbnBDYWxsYmFjayggcmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzICkge1xuXHRcdHZhciBjYWxsYmFja0NvbnRleHQgPSBvcmlnU2V0dGluZ3MgJiYgb3JpZ1NldHRpbmdzLmNvbnRleHQgfHwgcmVxdWVzdFNldHRpbmdzO1xuXHRcdHZhciBqc29ucCA9IHJlcXVlc3RTZXR0aW5ncy5qc29ucENhbGxiYWNrIHx8IChcImpzb25wXCIgKyBqc2MrKyk7XG5cblx0XHQvLyBSZXBsYWNlIHRoZSA9PyBzZXF1ZW5jZSBib3RoIGluIHRoZSBxdWVyeSBzdHJpbmcgYW5kIHRoZSBkYXRhXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZGF0YSApIHtcblx0XHRcdHJlcXVlc3RTZXR0aW5ncy5kYXRhID0gKHJlcXVlc3RTZXR0aW5ncy5kYXRhICsgXCJcIikucmVwbGFjZShDQUxMQkFDS19SRUdFWCwgXCI9XCIgKyBqc29ucCArIFwiJDFcIik7XG5cdFx0fVxuXG5cdFx0cmVxdWVzdFNldHRpbmdzLnVybCA9IHJlcXVlc3RTZXR0aW5ncy51cmwucmVwbGFjZShDQUxMQkFDS19SRUdFWCwgXCI9XCIgKyBqc29ucCArIFwiJDFcIik7XG5cblxuXHRcdC8vIEhhbmRsZSBKU09OUC1zdHlsZSBsb2FkaW5nXG5cdFx0d2luZG93WyBqc29ucCBdID0gd2luZG93WyBqc29ucCBdIHx8IGZ1bmN0aW9uKCB0bXAgKSB7XG5cdFx0XHRkYXRhID0gdG1wO1xuXHRcdFx0anNvbnBTdWNjZXNzKCByZXF1ZXN0U2V0dGluZ3MsIGNhbGxiYWNrQ29udGV4dCwgbW9ja0hhbmRsZXIgKTtcblx0XHRcdGpzb25wQ29tcGxldGUoIHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0LCBtb2NrSGFuZGxlciApO1xuXHRcdFx0Ly8gR2FyYmFnZSBjb2xsZWN0XG5cdFx0XHR3aW5kb3dbIGpzb25wIF0gPSB1bmRlZmluZWQ7XG5cblx0XHRcdHRyeSB7XG5cdFx0XHRcdGRlbGV0ZSB3aW5kb3dbIGpzb25wIF07XG5cdFx0XHR9IGNhdGNoKGUpIHt9XG5cblx0XHRcdGlmICggaGVhZCApIHtcblx0XHRcdFx0aGVhZC5yZW1vdmVDaGlsZCggc2NyaXB0ICk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXG5cdC8vIFRoZSBKU09OUCByZXF1ZXN0IHdhcyBzdWNjZXNzZnVsXG5cdGZ1bmN0aW9uIGpzb25wU3VjY2VzcyhyZXF1ZXN0U2V0dGluZ3MsIGNhbGxiYWNrQ29udGV4dCwgbW9ja0hhbmRsZXIpIHtcblx0XHQvLyBJZiBhIGxvY2FsIGNhbGxiYWNrIHdhcyBzcGVjaWZpZWQsIGZpcmUgaXQgYW5kIHBhc3MgaXQgdGhlIGRhdGFcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5zdWNjZXNzICkge1xuXHRcdFx0cmVxdWVzdFNldHRpbmdzLnN1Y2Nlc3MuY2FsbCggY2FsbGJhY2tDb250ZXh0LCBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgfHwgXCJcIiwgc3RhdHVzLCB7fSApO1xuXHRcdH1cblxuXHRcdC8vIEZpcmUgdGhlIGdsb2JhbCBjYWxsYmFja1xuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmdsb2JhbCApIHtcblx0XHRcdHRyaWdnZXIocmVxdWVzdFNldHRpbmdzLCBcImFqYXhTdWNjZXNzXCIsIFt7fSwgcmVxdWVzdFNldHRpbmdzXSApO1xuXHRcdH1cblx0fVxuXG5cdC8vIFRoZSBKU09OUCByZXF1ZXN0IHdhcyBjb21wbGV0ZWRcblx0ZnVuY3Rpb24ganNvbnBDb21wbGV0ZShyZXF1ZXN0U2V0dGluZ3MsIGNhbGxiYWNrQ29udGV4dCkge1xuXHRcdC8vIFByb2Nlc3MgcmVzdWx0XG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuY29tcGxldGUgKSB7XG5cdFx0XHRyZXF1ZXN0U2V0dGluZ3MuY29tcGxldGUuY2FsbCggY2FsbGJhY2tDb250ZXh0LCB7fSAsIHN0YXR1cyApO1xuXHRcdH1cblxuXHRcdC8vIFRoZSByZXF1ZXN0IHdhcyBjb21wbGV0ZWRcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5nbG9iYWwgKSB7XG5cdFx0XHR0cmlnZ2VyKCBcImFqYXhDb21wbGV0ZVwiLCBbe30sIHJlcXVlc3RTZXR0aW5nc10gKTtcblx0XHR9XG5cblx0XHQvLyBIYW5kbGUgdGhlIGdsb2JhbCBBSkFYIGNvdW50ZXJcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5nbG9iYWwgJiYgISAtLSQuYWN0aXZlICkge1xuXHRcdFx0JC5ldmVudC50cmlnZ2VyKCBcImFqYXhTdG9wXCIgKTtcblx0XHR9XG5cdH1cblxuXG5cdC8vIFRoZSBjb3JlICQuYWpheCByZXBsYWNlbWVudC5cblx0ZnVuY3Rpb24gaGFuZGxlQWpheCggdXJsLCBvcmlnU2V0dGluZ3MgKSB7XG5cdFx0dmFyIG1vY2tSZXF1ZXN0LCByZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyO1xuXG5cdFx0Ly8gSWYgdXJsIGlzIGFuIG9iamVjdCwgc2ltdWxhdGUgcHJlLTEuNSBzaWduYXR1cmVcblx0XHRpZiAoIHR5cGVvZiB1cmwgPT09IFwib2JqZWN0XCIgKSB7XG5cdFx0XHRvcmlnU2V0dGluZ3MgPSB1cmw7XG5cdFx0XHR1cmwgPSB1bmRlZmluZWQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIHdvcmsgYXJvdW5kIHRvIHN1cHBvcnQgMS41IHNpZ25hdHVyZVxuXHRcdFx0b3JpZ1NldHRpbmdzID0gb3JpZ1NldHRpbmdzIHx8IHt9O1xuXHRcdFx0b3JpZ1NldHRpbmdzLnVybCA9IHVybDtcblx0XHR9XG5cblx0XHQvLyBFeHRlbmQgdGhlIG9yaWdpbmFsIHNldHRpbmdzIGZvciB0aGUgcmVxdWVzdFxuXHRcdHJlcXVlc3RTZXR0aW5ncyA9ICQuZXh0ZW5kKHRydWUsIHt9LCAkLmFqYXhTZXR0aW5ncywgb3JpZ1NldHRpbmdzKTtcblxuXHRcdC8vIEl0ZXJhdGUgb3ZlciBvdXIgbW9jayBoYW5kbGVycyAoaW4gcmVnaXN0cmF0aW9uIG9yZGVyKSB1bnRpbCB3ZSBmaW5kXG5cdFx0Ly8gb25lIHRoYXQgaXMgd2lsbGluZyB0byBpbnRlcmNlcHQgdGhlIHJlcXVlc3Rcblx0XHRmb3IodmFyIGsgPSAwOyBrIDwgbW9ja0hhbmRsZXJzLmxlbmd0aDsgaysrKSB7XG5cdFx0XHRpZiAoICFtb2NrSGFuZGxlcnNba10gKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRtb2NrSGFuZGxlciA9IGdldE1vY2tGb3JSZXF1ZXN0KCBtb2NrSGFuZGxlcnNba10sIHJlcXVlc3RTZXR0aW5ncyApO1xuXHRcdFx0aWYoIW1vY2tIYW5kbGVyKSB7XG5cdFx0XHRcdC8vIE5vIHZhbGlkIG1vY2sgZm91bmQgZm9yIHRoaXMgcmVxdWVzdFxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0bW9ja2VkQWpheENhbGxzLnB1c2gocmVxdWVzdFNldHRpbmdzKTtcblxuXHRcdFx0Ly8gSWYgbG9nZ2luZyBpcyBlbmFibGVkLCBsb2cgdGhlIG1vY2sgdG8gdGhlIGNvbnNvbGVcblx0XHRcdCQubW9ja2pheFNldHRpbmdzLmxvZyggbW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncyApO1xuXG5cblx0XHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlICYmIHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZS50b1VwcGVyQ2FzZSgpID09PSAnSlNPTlAnICkge1xuXHRcdFx0XHRpZiAoKG1vY2tSZXF1ZXN0ID0gcHJvY2Vzc0pzb25wTW9jayggcmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzICkpKSB7XG5cdFx0XHRcdFx0Ly8gVGhpcyBtb2NrIHdpbGwgaGFuZGxlIHRoZSBKU09OUCByZXF1ZXN0XG5cdFx0XHRcdFx0cmV0dXJuIG1vY2tSZXF1ZXN0O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblxuXHRcdFx0Ly8gUmVtb3ZlZCB0byBmaXggIzU0IC0ga2VlcCB0aGUgbW9ja2luZyBkYXRhIG9iamVjdCBpbnRhY3Rcblx0XHRcdC8vbW9ja0hhbmRsZXIuZGF0YSA9IHJlcXVlc3RTZXR0aW5ncy5kYXRhO1xuXG5cdFx0XHRtb2NrSGFuZGxlci5jYWNoZSA9IHJlcXVlc3RTZXR0aW5ncy5jYWNoZTtcblx0XHRcdG1vY2tIYW5kbGVyLnRpbWVvdXQgPSByZXF1ZXN0U2V0dGluZ3MudGltZW91dDtcblx0XHRcdG1vY2tIYW5kbGVyLmdsb2JhbCA9IHJlcXVlc3RTZXR0aW5ncy5nbG9iYWw7XG5cblx0XHRcdGNvcHlVcmxQYXJhbWV0ZXJzKG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MpO1xuXG5cdFx0XHQoZnVuY3Rpb24obW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncywgb3JpZ1NldHRpbmdzLCBvcmlnSGFuZGxlcikge1xuXHRcdFx0XHRtb2NrUmVxdWVzdCA9IF9hamF4LmNhbGwoJCwgJC5leHRlbmQodHJ1ZSwge30sIG9yaWdTZXR0aW5ncywge1xuXHRcdFx0XHRcdC8vIE1vY2sgdGhlIFhIUiBvYmplY3Rcblx0XHRcdFx0XHR4aHI6IGZ1bmN0aW9uKCkgeyByZXR1cm4geGhyKCBtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MsIG9yaWdIYW5kbGVyICk7IH1cblx0XHRcdFx0fSkpO1xuXHRcdFx0fSkobW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncywgb3JpZ1NldHRpbmdzLCBtb2NrSGFuZGxlcnNba10pO1xuXG5cdFx0XHRyZXR1cm4gbW9ja1JlcXVlc3Q7XG5cdFx0fVxuXG5cdFx0Ly8gV2UgZG9uJ3QgaGF2ZSBhIG1vY2sgcmVxdWVzdFxuXHRcdGlmKCQubW9ja2pheFNldHRpbmdzLnRocm93VW5tb2NrZWQgPT09IHRydWUpIHtcblx0XHRcdHRocm93KCdBSkFYIG5vdCBtb2NrZWQ6ICcgKyBvcmlnU2V0dGluZ3MudXJsKTtcblx0XHR9XG5cdFx0ZWxzZSB7IC8vIHRyaWdnZXIgYSBub3JtYWwgcmVxdWVzdFxuXHRcdFx0cmV0dXJuIF9hamF4LmFwcGx5KCQsIFtvcmlnU2V0dGluZ3NdKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0KiBDb3BpZXMgVVJMIHBhcmFtZXRlciB2YWx1ZXMgaWYgdGhleSB3ZXJlIGNhcHR1cmVkIGJ5IGEgcmVndWxhciBleHByZXNzaW9uXG5cdCogQHBhcmFtIHtPYmplY3R9IG1vY2tIYW5kbGVyXG5cdCogQHBhcmFtIHtPYmplY3R9IG9yaWdTZXR0aW5nc1xuXHQqL1xuXHRmdW5jdGlvbiBjb3B5VXJsUGFyYW1ldGVycyhtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzKSB7XG5cdFx0Ly9wYXJhbWV0ZXJzIGFyZW4ndCBjYXB0dXJlZCBpZiB0aGUgVVJMIGlzbid0IGEgUmVnRXhwXG5cdFx0aWYgKCEobW9ja0hhbmRsZXIudXJsIGluc3RhbmNlb2YgUmVnRXhwKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHQvL2lmIG5vIFVSTCBwYXJhbXMgd2VyZSBkZWZpbmVkIG9uIHRoZSBoYW5kbGVyLCBkb24ndCBhdHRlbXB0IGEgY2FwdHVyZVxuXHRcdGlmICghbW9ja0hhbmRsZXIuaGFzT3duUHJvcGVydHkoJ3VybFBhcmFtcycpKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHZhciBjYXB0dXJlcyA9IG1vY2tIYW5kbGVyLnVybC5leGVjKG9yaWdTZXR0aW5ncy51cmwpO1xuXHRcdC8vdGhlIHdob2xlIFJlZ0V4cCBtYXRjaCBpcyBhbHdheXMgdGhlIGZpcnN0IHZhbHVlIGluIHRoZSBjYXB0dXJlIHJlc3VsdHNcblx0XHRpZiAoY2FwdHVyZXMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNhcHR1cmVzLnNoaWZ0KCk7XG5cdFx0Ly91c2UgaGFuZGxlciBwYXJhbXMgYXMga2V5cyBhbmQgY2FwdHVyZSByZXN1dHMgYXMgdmFsdWVzXG5cdFx0dmFyIGkgPSAwLFxuXHRcdGNhcHR1cmVzTGVuZ3RoID0gY2FwdHVyZXMubGVuZ3RoLFxuXHRcdHBhcmFtc0xlbmd0aCA9IG1vY2tIYW5kbGVyLnVybFBhcmFtcy5sZW5ndGgsXG5cdFx0Ly9pbiBjYXNlIHRoZSBudW1iZXIgb2YgcGFyYW1zIHNwZWNpZmllZCBpcyBsZXNzIHRoYW4gYWN0dWFsIGNhcHR1cmVzXG5cdFx0bWF4SXRlcmF0aW9ucyA9IE1hdGgubWluKGNhcHR1cmVzTGVuZ3RoLCBwYXJhbXNMZW5ndGgpLFxuXHRcdHBhcmFtVmFsdWVzID0ge307XG5cdFx0Zm9yIChpOyBpIDwgbWF4SXRlcmF0aW9uczsgaSsrKSB7XG5cdFx0XHR2YXIga2V5ID0gbW9ja0hhbmRsZXIudXJsUGFyYW1zW2ldO1xuXHRcdFx0cGFyYW1WYWx1ZXNba2V5XSA9IGNhcHR1cmVzW2ldO1xuXHRcdH1cblx0XHRvcmlnU2V0dGluZ3MudXJsUGFyYW1zID0gcGFyYW1WYWx1ZXM7XG5cdH1cblxuXG5cdC8vIFB1YmxpY1xuXG5cdCQuZXh0ZW5kKHtcblx0XHRhamF4OiBoYW5kbGVBamF4XG5cdH0pO1xuXG5cdCQubW9ja2pheFNldHRpbmdzID0ge1xuXHRcdC8vdXJsOiAgICAgICAgbnVsbCxcblx0XHQvL3R5cGU6ICAgICAgICdHRVQnLFxuXHRcdGxvZzogICAgICAgICAgZnVuY3Rpb24oIG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MgKSB7XG5cdFx0XHRpZiAoIG1vY2tIYW5kbGVyLmxvZ2dpbmcgPT09IGZhbHNlIHx8XG5cdFx0XHRcdCAoIHR5cGVvZiBtb2NrSGFuZGxlci5sb2dnaW5nID09PSAndW5kZWZpbmVkJyAmJiAkLm1vY2tqYXhTZXR0aW5ncy5sb2dnaW5nID09PSBmYWxzZSApICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZiAoIHdpbmRvdy5jb25zb2xlICYmIGNvbnNvbGUubG9nICkge1xuXHRcdFx0XHR2YXIgbWVzc2FnZSA9ICdNT0NLICcgKyByZXF1ZXN0U2V0dGluZ3MudHlwZS50b1VwcGVyQ2FzZSgpICsgJzogJyArIHJlcXVlc3RTZXR0aW5ncy51cmw7XG5cdFx0XHRcdHZhciByZXF1ZXN0ID0gJC5leHRlbmQoe30sIHJlcXVlc3RTZXR0aW5ncyk7XG5cblx0XHRcdFx0aWYgKHR5cGVvZiBjb25zb2xlLmxvZyA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKG1lc3NhZ2UsIHJlcXVlc3QpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyggbWVzc2FnZSArICcgJyArIEpTT04uc3RyaW5naWZ5KHJlcXVlc3QpICk7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2cobWVzc2FnZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRsb2dnaW5nOiAgICAgICB0cnVlLFxuXHRcdHN0YXR1czogICAgICAgIDIwMCxcblx0XHRzdGF0dXNUZXh0OiAgICBcIk9LXCIsXG5cdFx0cmVzcG9uc2VUaW1lOiAgNTAwLFxuXHRcdGlzVGltZW91dDogICAgIGZhbHNlLFxuXHRcdHRocm93VW5tb2NrZWQ6IGZhbHNlLFxuXHRcdGNvbnRlbnRUeXBlOiAgICd0ZXh0L3BsYWluJyxcblx0XHRyZXNwb25zZTogICAgICAnJyxcblx0XHRyZXNwb25zZVRleHQ6ICAnJyxcblx0XHRyZXNwb25zZVhNTDogICAnJyxcblx0XHRwcm94eTogICAgICAgICAnJyxcblx0XHRwcm94eVR5cGU6ICAgICAnR0VUJyxcblxuXHRcdGxhc3RNb2RpZmllZDogIG51bGwsXG5cdFx0ZXRhZzogICAgICAgICAgJycsXG5cdFx0aGVhZGVyczoge1xuXHRcdFx0ZXRhZzogJ0lKRkBII0A5MjN1ZjgwMjNoRk9ASSNIIycsXG5cdFx0XHQnY29udGVudC10eXBlJyA6ICd0ZXh0L3BsYWluJ1xuXHRcdH1cblx0fTtcblxuXHQkLm1vY2tqYXggPSBmdW5jdGlvbihzZXR0aW5ncykge1xuXHRcdHZhciBpID0gbW9ja0hhbmRsZXJzLmxlbmd0aDtcblx0XHRtb2NrSGFuZGxlcnNbaV0gPSBzZXR0aW5ncztcblx0XHRyZXR1cm4gaTtcblx0fTtcblx0JC5tb2NramF4Q2xlYXIgPSBmdW5jdGlvbihpKSB7XG5cdFx0aWYgKCBhcmd1bWVudHMubGVuZ3RoID09IDEgKSB7XG5cdFx0XHRtb2NrSGFuZGxlcnNbaV0gPSBudWxsO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRtb2NrSGFuZGxlcnMgPSBbXTtcblx0XHR9XG5cdFx0bW9ja2VkQWpheENhbGxzID0gW107XG5cdH07XG5cdCQubW9ja2pheC5oYW5kbGVyID0gZnVuY3Rpb24oaSkge1xuXHRcdGlmICggYXJndW1lbnRzLmxlbmd0aCA9PSAxICkge1xuXHRcdFx0cmV0dXJuIG1vY2tIYW5kbGVyc1tpXTtcblx0XHR9XG5cdH07XG5cdCQubW9ja2pheC5tb2NrZWRBamF4Q2FsbHMgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gbW9ja2VkQWpheENhbGxzO1xuXHR9O1xufSkoalF1ZXJ5KTsiLCIvKipcbiogIEFqYXggQXV0b2NvbXBsZXRlIGZvciBqUXVlcnksIHZlcnNpb24gJXZlcnNpb24lXG4qICAoYykgMjAxNSBUb21hcyBLaXJkYVxuKlxuKiAgQWpheCBBdXRvY29tcGxldGUgZm9yIGpRdWVyeSBpcyBmcmVlbHkgZGlzdHJpYnV0YWJsZSB1bmRlciB0aGUgdGVybXMgb2YgYW4gTUlULXN0eWxlIGxpY2Vuc2UuXG4qICBGb3IgZGV0YWlscywgc2VlIHRoZSB3ZWIgc2l0ZTogaHR0cHM6Ly9naXRodWIuY29tL2RldmJyaWRnZS9qUXVlcnktQXV0b2NvbXBsZXRlXG4qL1xuXG4vKmpzbGludCAgYnJvd3NlcjogdHJ1ZSwgd2hpdGU6IHRydWUsIHBsdXNwbHVzOiB0cnVlLCB2YXJzOiB0cnVlICovXG4vKmdsb2JhbCBkZWZpbmUsIHdpbmRvdywgZG9jdW1lbnQsIGpRdWVyeSwgZXhwb3J0cywgcmVxdWlyZSAqL1xuXG4vLyBFeHBvc2UgcGx1Z2luIGFzIGFuIEFNRCBtb2R1bGUgaWYgQU1EIGxvYWRlciBpcyBwcmVzZW50OlxuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgICAgICBkZWZpbmUoWydqcXVlcnknXSwgZmFjdG9yeSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHJlcXVpcmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gQnJvd3NlcmlmeVxuICAgICAgICBmYWN0b3J5KHJlcXVpcmUoJ2pxdWVyeScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBCcm93c2VyIGdsb2JhbHNcbiAgICAgICAgZmFjdG9yeShqUXVlcnkpO1xuICAgIH1cbn0oZnVuY3Rpb24gKCQpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXJcbiAgICAgICAgdXRpbHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlc2NhcGVSZWdFeENoYXJzOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoL1tcXC1cXFtcXF1cXC9cXHtcXH1cXChcXClcXCpcXCtcXD9cXC5cXFxcXFxeXFwkXFx8XS9nLCBcIlxcXFwkJlwiKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNyZWF0ZU5vZGU6IGZ1bmN0aW9uIChjb250YWluZXJDbGFzcykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgICAgIGRpdi5jbGFzc05hbWUgPSBjb250YWluZXJDbGFzcztcbiAgICAgICAgICAgICAgICAgICAgZGl2LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgICAgICAgICAgICAgZGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkaXY7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSgpKSxcblxuICAgICAgICBrZXlzID0ge1xuICAgICAgICAgICAgRVNDOiAyNyxcbiAgICAgICAgICAgIFRBQjogOSxcbiAgICAgICAgICAgIFJFVFVSTjogMTMsXG4gICAgICAgICAgICBMRUZUOiAzNyxcbiAgICAgICAgICAgIFVQOiAzOCxcbiAgICAgICAgICAgIFJJR0hUOiAzOSxcbiAgICAgICAgICAgIERPV046IDQwXG4gICAgICAgIH07XG5cbiAgICBmdW5jdGlvbiBBdXRvY29tcGxldGUoZWwsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIG5vb3AgPSBmdW5jdGlvbiAoKSB7IH0sXG4gICAgICAgICAgICB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgIGRlZmF1bHRzID0ge1xuICAgICAgICAgICAgICAgIGFqYXhTZXR0aW5nczoge30sXG4gICAgICAgICAgICAgICAgYXV0b1NlbGVjdEZpcnN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBhcHBlbmRUbzogZG9jdW1lbnQuYm9keSxcbiAgICAgICAgICAgICAgICBzZXJ2aWNlVXJsOiBudWxsLFxuICAgICAgICAgICAgICAgIGxvb2t1cDogbnVsbCxcbiAgICAgICAgICAgICAgICBvblNlbGVjdDogbnVsbCxcbiAgICAgICAgICAgICAgICB3aWR0aDogJ2F1dG8nLFxuICAgICAgICAgICAgICAgIG1pbkNoYXJzOiAxLFxuICAgICAgICAgICAgICAgIG1heEhlaWdodDogMzAwLFxuICAgICAgICAgICAgICAgIGRlZmVyUmVxdWVzdEJ5OiAwLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge30sXG4gICAgICAgICAgICAgICAgZm9ybWF0UmVzdWx0OiBBdXRvY29tcGxldGUuZm9ybWF0UmVzdWx0LFxuICAgICAgICAgICAgICAgIGRlbGltaXRlcjogbnVsbCxcbiAgICAgICAgICAgICAgICB6SW5kZXg6IDk5OTksXG4gICAgICAgICAgICAgICAgdHlwZTogJ0dFVCcsXG4gICAgICAgICAgICAgICAgbm9DYWNoZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgb25TZWFyY2hTdGFydDogbm9vcCxcbiAgICAgICAgICAgICAgICBvblNlYXJjaENvbXBsZXRlOiBub29wLFxuICAgICAgICAgICAgICAgIG9uU2VhcmNoRXJyb3I6IG5vb3AsXG4gICAgICAgICAgICAgICAgcHJlc2VydmVJbnB1dDogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyQ2xhc3M6ICdhdXRvY29tcGxldGUtc3VnZ2VzdGlvbnMnLFxuICAgICAgICAgICAgICAgIHRhYkRpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRSZXF1ZXN0OiBudWxsLFxuICAgICAgICAgICAgICAgIHRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQ6IHRydWUsXG4gICAgICAgICAgICAgICAgcHJldmVudEJhZFF1ZXJpZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgbG9va3VwRmlsdGVyOiBmdW5jdGlvbiAoc3VnZ2VzdGlvbiwgb3JpZ2luYWxRdWVyeSwgcXVlcnlMb3dlckNhc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb24udmFsdWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHF1ZXJ5TG93ZXJDYXNlKSAhPT0gLTE7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwYXJhbU5hbWU6ICdxdWVyeScsXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtUmVzdWx0OiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiByZXNwb25zZSA9PT0gJ3N0cmluZycgPyAkLnBhcnNlSlNPTihyZXNwb25zZSkgOiByZXNwb25zZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNob3dOb1N1Z2dlc3Rpb25Ob3RpY2U6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG5vU3VnZ2VzdGlvbk5vdGljZTogJ05vIHJlc3VsdHMnLFxuICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uOiAnYm90dG9tJyxcbiAgICAgICAgICAgICAgICBmb3JjZUZpeFBvc2l0aW9uOiBmYWxzZVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAvLyBTaGFyZWQgdmFyaWFibGVzOlxuICAgICAgICB0aGF0LmVsZW1lbnQgPSBlbDtcbiAgICAgICAgdGhhdC5lbCA9ICQoZWwpO1xuICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gW107XG4gICAgICAgIHRoYXQuYmFkUXVlcmllcyA9IFtdO1xuICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcbiAgICAgICAgdGhhdC5jdXJyZW50VmFsdWUgPSB0aGF0LmVsZW1lbnQudmFsdWU7XG4gICAgICAgIHRoYXQuaW50ZXJ2YWxJZCA9IDA7XG4gICAgICAgIHRoYXQuY2FjaGVkUmVzcG9uc2UgPSB7fTtcbiAgICAgICAgdGhhdC5vbkNoYW5nZUludGVydmFsID0gbnVsbDtcbiAgICAgICAgdGhhdC5vbkNoYW5nZSA9IG51bGw7XG4gICAgICAgIHRoYXQuaXNMb2NhbCA9IGZhbHNlO1xuICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyID0gbnVsbDtcbiAgICAgICAgdGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gbnVsbDtcbiAgICAgICAgdGhhdC5vcHRpb25zID0gJC5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHRpb25zKTtcbiAgICAgICAgdGhhdC5jbGFzc2VzID0ge1xuICAgICAgICAgICAgc2VsZWN0ZWQ6ICdhdXRvY29tcGxldGUtc2VsZWN0ZWQnLFxuICAgICAgICAgICAgc3VnZ2VzdGlvbjogJ2F1dG9jb21wbGV0ZS1zdWdnZXN0aW9uJ1xuICAgICAgICB9O1xuICAgICAgICB0aGF0LmhpbnQgPSBudWxsO1xuICAgICAgICB0aGF0LmhpbnRWYWx1ZSA9ICcnO1xuICAgICAgICB0aGF0LnNlbGVjdGlvbiA9IG51bGw7XG5cbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBhbmQgc2V0IG9wdGlvbnM6XG4gICAgICAgIHRoYXQuaW5pdGlhbGl6ZSgpO1xuICAgICAgICB0aGF0LnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgQXV0b2NvbXBsZXRlLnV0aWxzID0gdXRpbHM7XG5cbiAgICAkLkF1dG9jb21wbGV0ZSA9IEF1dG9jb21wbGV0ZTtcblxuICAgIEF1dG9jb21wbGV0ZS5mb3JtYXRSZXN1bHQgPSBmdW5jdGlvbiAoc3VnZ2VzdGlvbiwgY3VycmVudFZhbHVlKSB7XG4gICAgICAgIC8vIERvIG5vdCByZXBsYWNlIGFueXRoaW5nIGlmIHRoZXJlIGN1cnJlbnQgdmFsdWUgaXMgZW1wdHlcbiAgICAgICAgaWYgKCFjdXJyZW50VmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBzdWdnZXN0aW9uLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgcGF0dGVybiA9ICcoJyArIHV0aWxzLmVzY2FwZVJlZ0V4Q2hhcnMoY3VycmVudFZhbHVlKSArICcpJztcblxuICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbi52YWx1ZVxuICAgICAgICAgICAgLnJlcGxhY2UobmV3IFJlZ0V4cChwYXR0ZXJuLCAnZ2knKSwgJzxzdHJvbmc+JDE8XFwvc3Ryb25nPicpXG4gICAgICAgICAgICAucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLyZsdDsoXFwvP3N0cm9uZykmZ3Q7L2csICc8JDE+Jyk7XG4gICAgfTtcblxuICAgIEF1dG9jb21wbGV0ZS5wcm90b3R5cGUgPSB7XG5cbiAgICAgICAga2lsbGVyRm46IG51bGwsXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb25TZWxlY3RvciA9ICcuJyArIHRoYXQuY2xhc3Nlcy5zdWdnZXN0aW9uLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkID0gdGhhdC5jbGFzc2VzLnNlbGVjdGVkLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyO1xuXG4gICAgICAgICAgICAvLyBSZW1vdmUgYXV0b2NvbXBsZXRlIGF0dHJpYnV0ZSB0byBwcmV2ZW50IG5hdGl2ZSBzdWdnZXN0aW9uczpcbiAgICAgICAgICAgIHRoYXQuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2F1dG9jb21wbGV0ZScsICdvZmYnKTtcblxuICAgICAgICAgICAgdGhhdC5raWxsZXJGbiA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCQoZS50YXJnZXQpLmNsb3Nlc3QoJy4nICsgdGhhdC5vcHRpb25zLmNvbnRhaW5lckNsYXNzKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5raWxsU3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5kaXNhYmxlS2lsbGVyRm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBodG1sKCkgZGVhbHMgd2l0aCBtYW55IHR5cGVzOiBodG1sU3RyaW5nIG9yIEVsZW1lbnQgb3IgQXJyYXkgb3IgalF1ZXJ5XG4gICAgICAgICAgICB0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIgPSAkKCc8ZGl2IGNsYXNzPVwiYXV0b2NvbXBsZXRlLW5vLXN1Z2dlc3Rpb25cIj48L2Rpdj4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmh0bWwodGhpcy5vcHRpb25zLm5vU3VnZ2VzdGlvbk5vdGljZSkuZ2V0KDApO1xuXG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyID0gQXV0b2NvbXBsZXRlLnV0aWxzLmNyZWF0ZU5vZGUob3B0aW9ucy5jb250YWluZXJDbGFzcyk7XG5cbiAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcik7XG5cbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRUbyhvcHRpb25zLmFwcGVuZFRvKTtcblxuICAgICAgICAgICAgLy8gT25seSBzZXQgd2lkdGggaWYgaXQgd2FzIHByb3ZpZGVkOlxuICAgICAgICAgICAgaWYgKG9wdGlvbnMud2lkdGggIT09ICdhdXRvJykge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci53aWR0aChvcHRpb25zLndpZHRoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTGlzdGVuIGZvciBtb3VzZSBvdmVyIGV2ZW50IG9uIHN1Z2dlc3Rpb25zIGxpc3Q6XG4gICAgICAgICAgICBjb250YWluZXIub24oJ21vdXNlb3Zlci5hdXRvY29tcGxldGUnLCBzdWdnZXN0aW9uU2VsZWN0b3IsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmFjdGl2YXRlKCQodGhpcykuZGF0YSgnaW5kZXgnKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gRGVzZWxlY3QgYWN0aXZlIGVsZW1lbnQgd2hlbiBtb3VzZSBsZWF2ZXMgc3VnZ2VzdGlvbnMgY29udGFpbmVyOlxuICAgICAgICAgICAgY29udGFpbmVyLm9uKCdtb3VzZW91dC5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmNoaWxkcmVuKCcuJyArIHNlbGVjdGVkKS5yZW1vdmVDbGFzcyhzZWxlY3RlZCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gTGlzdGVuIGZvciBjbGljayBldmVudCBvbiBzdWdnZXN0aW9ucyBsaXN0OlxuICAgICAgICAgICAgY29udGFpbmVyLm9uKCdjbGljay5hdXRvY29tcGxldGUnLCBzdWdnZXN0aW9uU2VsZWN0b3IsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCgkKHRoaXMpLmRhdGEoJ2luZGV4JykpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb25DYXB0dXJlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGF0LnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICQod2luZG93KS5vbigncmVzaXplLmF1dG9jb21wbGV0ZScsIHRoYXQuZml4UG9zaXRpb25DYXB0dXJlKTtcblxuICAgICAgICAgICAgdGhhdC5lbC5vbigna2V5ZG93bi5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5UHJlc3MoZSk7IH0pO1xuICAgICAgICAgICAgdGhhdC5lbC5vbigna2V5dXAuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVVwKGUpOyB9KTtcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2JsdXIuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKCkgeyB0aGF0Lm9uQmx1cigpOyB9KTtcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2ZvY3VzLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uICgpIHsgdGhhdC5vbkZvY3VzKCk7IH0pO1xuICAgICAgICAgICAgdGhhdC5lbC5vbignY2hhbmdlLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlVcChlKTsgfSk7XG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdpbnB1dC5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5VXAoZSk7IH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRm9jdXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5lbC52YWwoKS5sZW5ndGggPj0gdGhhdC5vcHRpb25zLm1pbkNoYXJzKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5vblZhbHVlQ2hhbmdlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25CbHVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmVuYWJsZUtpbGxlckZuKCk7XG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBhYm9ydEFqYXg6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIGlmICh0aGF0LmN1cnJlbnRSZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgdGhhdC5jdXJyZW50UmVxdWVzdC5hYm9ydCgpO1xuICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNldE9wdGlvbnM6IGZ1bmN0aW9uIChzdXBwbGllZE9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zO1xuXG4gICAgICAgICAgICAkLmV4dGVuZChvcHRpb25zLCBzdXBwbGllZE9wdGlvbnMpO1xuXG4gICAgICAgICAgICB0aGF0LmlzTG9jYWwgPSAkLmlzQXJyYXkob3B0aW9ucy5sb29rdXApO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5pc0xvY2FsKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5sb29rdXAgPSB0aGF0LnZlcmlmeVN1Z2dlc3Rpb25zRm9ybWF0KG9wdGlvbnMubG9va3VwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb3B0aW9ucy5vcmllbnRhdGlvbiA9IHRoYXQudmFsaWRhdGVPcmllbnRhdGlvbihvcHRpb25zLm9yaWVudGF0aW9uLCAnYm90dG9tJyk7XG5cbiAgICAgICAgICAgIC8vIEFkanVzdCBoZWlnaHQsIHdpZHRoIGFuZCB6LWluZGV4OlxuICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5jc3Moe1xuICAgICAgICAgICAgICAgICdtYXgtaGVpZ2h0Jzogb3B0aW9ucy5tYXhIZWlnaHQgKyAncHgnLFxuICAgICAgICAgICAgICAgICd3aWR0aCc6IG9wdGlvbnMud2lkdGggKyAncHgnLFxuICAgICAgICAgICAgICAgICd6LWluZGV4Jzogb3B0aW9ucy56SW5kZXhcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG5cbiAgICAgICAgY2xlYXJDYWNoZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5jYWNoZWRSZXNwb25zZSA9IHt9O1xuICAgICAgICAgICAgdGhpcy5iYWRRdWVyaWVzID0gW107XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2xlYXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJDYWNoZSgpO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50VmFsdWUgPSAnJztcbiAgICAgICAgICAgIHRoaXMuc3VnZ2VzdGlvbnMgPSBbXTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICB0aGF0LmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcbiAgICAgICAgICAgIHRoYXQuYWJvcnRBamF4KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5hYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZml4UG9zaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIFVzZSBvbmx5IHdoZW4gY29udGFpbmVyIGhhcyBhbHJlYWR5IGl0cyBjb250ZW50XG5cbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICAkY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKSxcbiAgICAgICAgICAgICAgICBjb250YWluZXJQYXJlbnQgPSAkY29udGFpbmVyLnBhcmVudCgpLmdldCgwKTtcbiAgICAgICAgICAgIC8vIEZpeCBwb3NpdGlvbiBhdXRvbWF0aWNhbGx5IHdoZW4gYXBwZW5kZWQgdG8gYm9keS5cbiAgICAgICAgICAgIC8vIEluIG90aGVyIGNhc2VzIGZvcmNlIHBhcmFtZXRlciBtdXN0IGJlIGdpdmVuLlxuICAgICAgICAgICAgaWYgKGNvbnRhaW5lclBhcmVudCAhPT0gZG9jdW1lbnQuYm9keSAmJiAhdGhhdC5vcHRpb25zLmZvcmNlRml4UG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENob29zZSBvcmllbnRhdGlvblxuICAgICAgICAgICAgdmFyIG9yaWVudGF0aW9uID0gdGhhdC5vcHRpb25zLm9yaWVudGF0aW9uLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lckhlaWdodCA9ICRjb250YWluZXIub3V0ZXJIZWlnaHQoKSxcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSB0aGF0LmVsLm91dGVySGVpZ2h0KCksXG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gdGhhdC5lbC5vZmZzZXQoKSxcbiAgICAgICAgICAgICAgICBzdHlsZXMgPSB7ICd0b3AnOiBvZmZzZXQudG9wLCAnbGVmdCc6IG9mZnNldC5sZWZ0IH07XG5cbiAgICAgICAgICAgIGlmIChvcmllbnRhdGlvbiA9PT0gJ2F1dG8nKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZpZXdQb3J0SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpLFxuICAgICAgICAgICAgICAgICAgICBzY3JvbGxUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCksXG4gICAgICAgICAgICAgICAgICAgIHRvcE92ZXJmbG93ID0gLXNjcm9sbFRvcCArIG9mZnNldC50b3AgLSBjb250YWluZXJIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIGJvdHRvbU92ZXJmbG93ID0gc2Nyb2xsVG9wICsgdmlld1BvcnRIZWlnaHQgLSAob2Zmc2V0LnRvcCArIGhlaWdodCArIGNvbnRhaW5lckhlaWdodCk7XG5cbiAgICAgICAgICAgICAgICBvcmllbnRhdGlvbiA9IChNYXRoLm1heCh0b3BPdmVyZmxvdywgYm90dG9tT3ZlcmZsb3cpID09PSB0b3BPdmVyZmxvdykgPyAndG9wJyA6ICdib3R0b20nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob3JpZW50YXRpb24gPT09ICd0b3AnKSB7XG4gICAgICAgICAgICAgICAgc3R5bGVzLnRvcCArPSAtY29udGFpbmVySGVpZ2h0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdHlsZXMudG9wICs9IGhlaWdodDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgY29udGFpbmVyIGlzIG5vdCBwb3NpdGlvbmVkIHRvIGJvZHksXG4gICAgICAgICAgICAvLyBjb3JyZWN0IGl0cyBwb3NpdGlvbiB1c2luZyBvZmZzZXQgcGFyZW50IG9mZnNldFxuICAgICAgICAgICAgaWYoY29udGFpbmVyUGFyZW50ICE9PSBkb2N1bWVudC5ib2R5KSB7XG4gICAgICAgICAgICAgICAgdmFyIG9wYWNpdHkgPSAkY29udGFpbmVyLmNzcygnb3BhY2l0eScpLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnRPZmZzZXREaWZmO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhhdC52aXNpYmxlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICRjb250YWluZXIuY3NzKCdvcGFjaXR5JywgMCkuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBwYXJlbnRPZmZzZXREaWZmID0gJGNvbnRhaW5lci5vZmZzZXRQYXJlbnQoKS5vZmZzZXQoKTtcbiAgICAgICAgICAgICAgICBzdHlsZXMudG9wIC09IHBhcmVudE9mZnNldERpZmYudG9wO1xuICAgICAgICAgICAgICAgIHN0eWxlcy5sZWZ0IC09IHBhcmVudE9mZnNldERpZmYubGVmdDtcblxuICAgICAgICAgICAgICAgIGlmICghdGhhdC52aXNpYmxlKXtcbiAgICAgICAgICAgICAgICAgICAgJGNvbnRhaW5lci5jc3MoJ29wYWNpdHknLCBvcGFjaXR5KS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyAtMnB4IHRvIGFjY291bnQgZm9yIHN1Z2dlc3Rpb25zIGJvcmRlci5cbiAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMud2lkdGggPT09ICdhdXRvJykge1xuICAgICAgICAgICAgICAgIHN0eWxlcy53aWR0aCA9ICh0aGF0LmVsLm91dGVyV2lkdGgoKSAtIDIpICsgJ3B4JztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJGNvbnRhaW5lci5jc3Moc3R5bGVzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbmFibGVLaWxsZXJGbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrLmF1dG9jb21wbGV0ZScsIHRoYXQua2lsbGVyRm4pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGVLaWxsZXJGbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5hdXRvY29tcGxldGUnLCB0aGF0LmtpbGxlckZuKTtcbiAgICAgICAgfSxcblxuICAgICAgICBraWxsU3VnZ2VzdGlvbnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHRoYXQuc3RvcEtpbGxTdWdnZXN0aW9ucygpO1xuICAgICAgICAgICAgdGhhdC5pbnRlcnZhbElkID0gd2luZG93LnNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhhdC52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoYXQuc3RvcEtpbGxTdWdnZXN0aW9ucygpO1xuICAgICAgICAgICAgfSwgNTApO1xuICAgICAgICB9LFxuXG4gICAgICAgIHN0b3BLaWxsU3VnZ2VzdGlvbnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWxJZCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNDdXJzb3JBdEVuZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHZhbExlbmd0aCA9IHRoYXQuZWwudmFsKCkubGVuZ3RoLFxuICAgICAgICAgICAgICAgIHNlbGVjdGlvblN0YXJ0ID0gdGhhdC5lbGVtZW50LnNlbGVjdGlvblN0YXJ0LFxuICAgICAgICAgICAgICAgIHJhbmdlO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHNlbGVjdGlvblN0YXJ0ID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxlY3Rpb25TdGFydCA9PT0gdmFsTGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRvY3VtZW50LnNlbGVjdGlvbikge1xuICAgICAgICAgICAgICAgIHJhbmdlID0gZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgICAgICAgICAgcmFuZ2UubW92ZVN0YXJ0KCdjaGFyYWN0ZXInLCAtdmFsTGVuZ3RoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsTGVuZ3RoID09PSByYW5nZS50ZXh0Lmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uS2V5UHJlc3M6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIC8vIElmIHN1Z2dlc3Rpb25zIGFyZSBoaWRkZW4gYW5kIHVzZXIgcHJlc3NlcyBhcnJvdyBkb3duLCBkaXNwbGF5IHN1Z2dlc3Rpb25zOlxuICAgICAgICAgICAgaWYgKCF0aGF0LmRpc2FibGVkICYmICF0aGF0LnZpc2libGUgJiYgZS53aGljaCA9PT0ga2V5cy5ET1dOICYmIHRoYXQuY3VycmVudFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhhdC5kaXNhYmxlZCB8fCAhdGhhdC52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzd2l0Y2ggKGUud2hpY2gpIHtcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuRVNDOlxuICAgICAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuUklHSFQ6XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LmhpbnQgJiYgdGhhdC5vcHRpb25zLm9uSGludCAmJiB0aGF0LmlzQ3Vyc29yQXRFbmQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RIaW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlRBQjpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuaGludCAmJiB0aGF0Lm9wdGlvbnMub25IaW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdEhpbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QodGhhdC5zZWxlY3RlZEluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy50YWJEaXNhYmxlZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuUkVUVVJOOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QodGhhdC5zZWxlY3RlZEluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlVQOlxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm1vdmVVcCgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuRE9XTjpcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5tb3ZlRG93bigpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENhbmNlbCBldmVudCBpZiBmdW5jdGlvbiBkaWQgbm90IHJldHVybjpcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25LZXlVcDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKHRoYXQuZGlzYWJsZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5VUDpcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuRE9XTjpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmN1cnJlbnRWYWx1ZSAhPT0gdGhhdC5lbC52YWwoKSkge1xuICAgICAgICAgICAgICAgIHRoYXQuZmluZEJlc3RIaW50KCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy5kZWZlclJlcXVlc3RCeSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRGVmZXIgbG9va3VwIGluIGNhc2Ugd2hlbiB2YWx1ZSBjaGFuZ2VzIHZlcnkgcXVpY2tseTpcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5vbkNoYW5nZUludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5vblZhbHVlQ2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHRoYXQub3B0aW9ucy5kZWZlclJlcXVlc3RCeSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5vblZhbHVlQ2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uVmFsdWVDaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIHZhbHVlID0gdGhhdC5lbC52YWwoKSxcbiAgICAgICAgICAgICAgICBxdWVyeSA9IHRoYXQuZ2V0UXVlcnkodmFsdWUpO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3Rpb24gJiYgdGhhdC5jdXJyZW50VmFsdWUgIT09IHF1ZXJ5KSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb24gPSBudWxsO1xuICAgICAgICAgICAgICAgIChvcHRpb25zLm9uSW52YWxpZGF0ZVNlbGVjdGlvbiB8fCAkLm5vb3ApLmNhbGwodGhhdC5lbGVtZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xuICAgICAgICAgICAgdGhhdC5jdXJyZW50VmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xuXG4gICAgICAgICAgICAvLyBDaGVjayBleGlzdGluZyBzdWdnZXN0aW9uIGZvciB0aGUgbWF0Y2ggYmVmb3JlIHByb2NlZWRpbmc6XG4gICAgICAgICAgICBpZiAob3B0aW9ucy50cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0ICYmIHRoYXQuaXNFeGFjdE1hdGNoKHF1ZXJ5KSkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KDApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHF1ZXJ5Lmxlbmd0aCA8IG9wdGlvbnMubWluQ2hhcnMpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhhdC5nZXRTdWdnZXN0aW9ucyhxdWVyeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNFeGFjdE1hdGNoOiBmdW5jdGlvbiAocXVlcnkpIHtcbiAgICAgICAgICAgIHZhciBzdWdnZXN0aW9ucyA9IHRoaXMuc3VnZ2VzdGlvbnM7XG5cbiAgICAgICAgICAgIHJldHVybiAoc3VnZ2VzdGlvbnMubGVuZ3RoID09PSAxICYmIHN1Z2dlc3Rpb25zWzBdLnZhbHVlLnRvTG93ZXJDYXNlKCkgPT09IHF1ZXJ5LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFF1ZXJ5OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBkZWxpbWl0ZXIgPSB0aGlzLm9wdGlvbnMuZGVsaW1pdGVyLFxuICAgICAgICAgICAgICAgIHBhcnRzO1xuXG4gICAgICAgICAgICBpZiAoIWRlbGltaXRlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhcnRzID0gdmFsdWUuc3BsaXQoZGVsaW1pdGVyKTtcbiAgICAgICAgICAgIHJldHVybiAkLnRyaW0ocGFydHNbcGFydHMubGVuZ3RoIC0gMV0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFN1Z2dlc3Rpb25zTG9jYWw6IGZ1bmN0aW9uIChxdWVyeSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgcXVlcnlMb3dlckNhc2UgPSBxdWVyeS50b0xvd2VyQ2FzZSgpLFxuICAgICAgICAgICAgICAgIGZpbHRlciA9IG9wdGlvbnMubG9va3VwRmlsdGVyLFxuICAgICAgICAgICAgICAgIGxpbWl0ID0gcGFyc2VJbnQob3B0aW9ucy5sb29rdXBMaW1pdCwgMTApLFxuICAgICAgICAgICAgICAgIGRhdGE7XG5cbiAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgc3VnZ2VzdGlvbnM6ICQuZ3JlcChvcHRpb25zLmxvb2t1cCwgZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpbHRlcihzdWdnZXN0aW9uLCBxdWVyeSwgcXVlcnlMb3dlckNhc2UpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAobGltaXQgJiYgZGF0YS5zdWdnZXN0aW9ucy5sZW5ndGggPiBsaW1pdCkge1xuICAgICAgICAgICAgICAgIGRhdGEuc3VnZ2VzdGlvbnMgPSBkYXRhLnN1Z2dlc3Rpb25zLnNsaWNlKDAsIGxpbWl0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0U3VnZ2VzdGlvbnM6IGZ1bmN0aW9uIChxKSB7XG4gICAgICAgICAgICB2YXIgcmVzcG9uc2UsXG4gICAgICAgICAgICAgICAgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBzZXJ2aWNlVXJsID0gb3B0aW9ucy5zZXJ2aWNlVXJsLFxuICAgICAgICAgICAgICAgIHBhcmFtcyxcbiAgICAgICAgICAgICAgICBjYWNoZUtleSxcbiAgICAgICAgICAgICAgICBhamF4U2V0dGluZ3M7XG5cbiAgICAgICAgICAgIG9wdGlvbnMucGFyYW1zW29wdGlvbnMucGFyYW1OYW1lXSA9IHE7XG4gICAgICAgICAgICBwYXJhbXMgPSBvcHRpb25zLmlnbm9yZVBhcmFtcyA/IG51bGwgOiBvcHRpb25zLnBhcmFtcztcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMub25TZWFyY2hTdGFydC5jYWxsKHRoYXQuZWxlbWVudCwgb3B0aW9ucy5wYXJhbXMpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihvcHRpb25zLmxvb2t1cCkpe1xuICAgICAgICAgICAgICAgIG9wdGlvbnMubG9va3VwKHEsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSBkYXRhLnN1Z2dlc3Rpb25zO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaENvbXBsZXRlLmNhbGwodGhhdC5lbGVtZW50LCBxLCBkYXRhLnN1Z2dlc3Rpb25zKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmlzTG9jYWwpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IHRoYXQuZ2V0U3VnZ2VzdGlvbnNMb2NhbChxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihzZXJ2aWNlVXJsKSkge1xuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlVXJsID0gc2VydmljZVVybC5jYWxsKHRoYXQuZWxlbWVudCwgcSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhY2hlS2V5ID0gc2VydmljZVVybCArICc/JyArICQucGFyYW0ocGFyYW1zIHx8IHt9KTtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IHRoYXQuY2FjaGVkUmVzcG9uc2VbY2FjaGVLZXldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocmVzcG9uc2UgJiYgJC5pc0FycmF5KHJlc3BvbnNlLnN1Z2dlc3Rpb25zKSkge1xuICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSByZXNwb25zZS5zdWdnZXN0aW9ucztcbiAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcbiAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIHJlc3BvbnNlLnN1Z2dlc3Rpb25zKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoYXQuaXNCYWRRdWVyeShxKSkge1xuICAgICAgICAgICAgICAgIHRoYXQuYWJvcnRBamF4KCk7XG5cbiAgICAgICAgICAgICAgICBhamF4U2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIHVybDogc2VydmljZVVybCxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogcGFyYW1zLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBvcHRpb25zLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBvcHRpb25zLmRhdGFUeXBlXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICQuZXh0ZW5kKGFqYXhTZXR0aW5ncywgb3B0aW9ucy5hamF4U2V0dGluZ3MpO1xuXG4gICAgICAgICAgICAgICAgdGhhdC5jdXJyZW50UmVxdWVzdCA9ICQuYWpheChhamF4U2V0dGluZ3MpLmRvbmUoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5jdXJyZW50UmVxdWVzdCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG9wdGlvbnMudHJhbnNmb3JtUmVzdWx0KGRhdGEsIHEpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LnByb2Nlc3NSZXNwb25zZShyZXN1bHQsIHEsIGNhY2hlS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaENvbXBsZXRlLmNhbGwodGhhdC5lbGVtZW50LCBxLCByZXN1bHQuc3VnZ2VzdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0pLmZhaWwoZnVuY3Rpb24gKGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bikge1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoRXJyb3IuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGlzQmFkUXVlcnk6IGZ1bmN0aW9uIChxKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5wcmV2ZW50QmFkUXVlcmllcyl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgYmFkUXVlcmllcyA9IHRoaXMuYmFkUXVlcmllcyxcbiAgICAgICAgICAgICAgICBpID0gYmFkUXVlcmllcy5sZW5ndGg7XG5cbiAgICAgICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICAgICAgICBpZiAocS5pbmRleE9mKGJhZFF1ZXJpZXNbaV0pID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhpZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpO1xuXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKHRoYXQub3B0aW9ucy5vbkhpZGUpICYmIHRoYXQudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgIHRoYXQub3B0aW9ucy5vbkhpZGUuY2FsbCh0aGF0LmVsZW1lbnQsIGNvbnRhaW5lcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XG4gICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLmhpZGUoKTtcbiAgICAgICAgICAgIHRoYXQuc2lnbmFsSGludChudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzdWdnZXN0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zdWdnZXN0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNob3dOb1N1Z2dlc3Rpb25Ob3RpY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub1N1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgZ3JvdXBCeSA9IG9wdGlvbnMuZ3JvdXBCeSxcbiAgICAgICAgICAgICAgICBmb3JtYXRSZXN1bHQgPSBvcHRpb25zLmZvcm1hdFJlc3VsdCxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoYXQuZ2V0UXVlcnkodGhhdC5jdXJyZW50VmFsdWUpLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IHRoYXQuY2xhc3Nlcy5zdWdnZXN0aW9uLFxuICAgICAgICAgICAgICAgIGNsYXNzU2VsZWN0ZWQgPSB0aGF0LmNsYXNzZXMuc2VsZWN0ZWQsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKSxcbiAgICAgICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gJCh0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIpLFxuICAgICAgICAgICAgICAgIGJlZm9yZVJlbmRlciA9IG9wdGlvbnMuYmVmb3JlUmVuZGVyLFxuICAgICAgICAgICAgICAgIGh0bWwgPSAnJyxcbiAgICAgICAgICAgICAgICBjYXRlZ29yeSxcbiAgICAgICAgICAgICAgICBmb3JtYXRHcm91cCA9IGZ1bmN0aW9uIChzdWdnZXN0aW9uLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRDYXRlZ29yeSA9IHN1Z2dlc3Rpb24uZGF0YVtncm91cEJ5XTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhdGVnb3J5ID09PSBjdXJyZW50Q2F0ZWdvcnkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnkgPSBjdXJyZW50Q2F0ZWdvcnk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImF1dG9jb21wbGV0ZS1ncm91cFwiPjxzdHJvbmc+JyArIGNhdGVnb3J5ICsgJzwvc3Ryb25nPjwvZGl2Pic7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLnRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQgJiYgdGhhdC5pc0V4YWN0TWF0Y2godmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QoMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBCdWlsZCBzdWdnZXN0aW9ucyBpbm5lciBIVE1MOlxuICAgICAgICAgICAgJC5lYWNoKHRoYXQuc3VnZ2VzdGlvbnMsIGZ1bmN0aW9uIChpLCBzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKGdyb3VwQnkpe1xuICAgICAgICAgICAgICAgICAgICBodG1sICs9IGZvcm1hdEdyb3VwKHN1Z2dlc3Rpb24sIHZhbHVlLCBpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwiJyArIGNsYXNzTmFtZSArICdcIiBkYXRhLWluZGV4PVwiJyArIGkgKyAnXCI+JyArIGZvcm1hdFJlc3VsdChzdWdnZXN0aW9uLCB2YWx1ZSkgKyAnPC9kaXY+JztcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLmFkanVzdENvbnRhaW5lcldpZHRoKCk7XG5cbiAgICAgICAgICAgIG5vU3VnZ2VzdGlvbnNDb250YWluZXIuZGV0YWNoKCk7XG4gICAgICAgICAgICBjb250YWluZXIuaHRtbChodG1sKTtcblxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihiZWZvcmVSZW5kZXIpKSB7XG4gICAgICAgICAgICAgICAgYmVmb3JlUmVuZGVyLmNhbGwodGhhdC5lbGVtZW50LCBjb250YWluZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XG4gICAgICAgICAgICBjb250YWluZXIuc2hvdygpO1xuXG4gICAgICAgICAgICAvLyBTZWxlY3QgZmlyc3QgdmFsdWUgYnkgZGVmYXVsdDpcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmF1dG9TZWxlY3RGaXJzdCkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLnNjcm9sbFRvcCgwKTtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuY2hpbGRyZW4oJy4nICsgY2xhc3NOYW1lKS5maXJzdCgpLmFkZENsYXNzKGNsYXNzU2VsZWN0ZWQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LnZpc2libGUgPSB0cnVlO1xuICAgICAgICAgICAgdGhhdC5maW5kQmVzdEhpbnQoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBub1N1Z2dlc3Rpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXG4gICAgICAgICAgICAgICAgIG5vU3VnZ2VzdGlvbnNDb250YWluZXIgPSAkKHRoYXQubm9TdWdnZXN0aW9uc0NvbnRhaW5lcik7XG5cbiAgICAgICAgICAgIHRoaXMuYWRqdXN0Q29udGFpbmVyV2lkdGgoKTtcblxuICAgICAgICAgICAgLy8gU29tZSBleHBsaWNpdCBzdGVwcy4gQmUgY2FyZWZ1bCBoZXJlIGFzIGl0IGVhc3kgdG8gZ2V0XG4gICAgICAgICAgICAvLyBub1N1Z2dlc3Rpb25zQ29udGFpbmVyIHJlbW92ZWQgZnJvbSBET00gaWYgbm90IGRldGFjaGVkIHByb3Blcmx5LlxuICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lci5kZXRhY2goKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5lbXB0eSgpOyAvLyBjbGVhbiBzdWdnZXN0aW9ucyBpZiBhbnlcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmQobm9TdWdnZXN0aW9uc0NvbnRhaW5lcik7XG5cbiAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcblxuICAgICAgICAgICAgY29udGFpbmVyLnNob3coKTtcbiAgICAgICAgICAgIHRoYXQudmlzaWJsZSA9IHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRqdXN0Q29udGFpbmVyV2lkdGg6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgLy8gSWYgd2lkdGggaXMgYXV0bywgYWRqdXN0IHdpZHRoIGJlZm9yZSBkaXNwbGF5aW5nIHN1Z2dlc3Rpb25zLFxuICAgICAgICAgICAgLy8gYmVjYXVzZSBpZiBpbnN0YW5jZSB3YXMgY3JlYXRlZCBiZWZvcmUgaW5wdXQgaGFkIHdpZHRoLCBpdCB3aWxsIGJlIHplcm8uXG4gICAgICAgICAgICAvLyBBbHNvIGl0IGFkanVzdHMgaWYgaW5wdXQgd2lkdGggaGFzIGNoYW5nZWQuXG4gICAgICAgICAgICAvLyAtMnB4IHRvIGFjY291bnQgZm9yIHN1Z2dlc3Rpb25zIGJvcmRlci5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLndpZHRoID09PSAnYXV0bycpIHtcbiAgICAgICAgICAgICAgICB3aWR0aCA9IHRoYXQuZWwub3V0ZXJXaWR0aCgpIC0gMjtcbiAgICAgICAgICAgICAgICBjb250YWluZXIud2lkdGgod2lkdGggPiAwID8gd2lkdGggOiAzMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGZpbmRCZXN0SGludDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHZhbHVlID0gdGhhdC5lbC52YWwoKS50b0xvd2VyQ2FzZSgpLFxuICAgICAgICAgICAgICAgIGJlc3RNYXRjaCA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICQuZWFjaCh0aGF0LnN1Z2dlc3Rpb25zLCBmdW5jdGlvbiAoaSwgc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBmb3VuZE1hdGNoID0gc3VnZ2VzdGlvbi52YWx1ZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YodmFsdWUpID09PSAwO1xuICAgICAgICAgICAgICAgIGlmIChmb3VuZE1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaCA9IHN1Z2dlc3Rpb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiAhZm91bmRNYXRjaDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQoYmVzdE1hdGNoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaWduYWxIaW50OiBmdW5jdGlvbiAoc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgdmFyIGhpbnRWYWx1ZSA9ICcnLFxuICAgICAgICAgICAgICAgIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICBoaW50VmFsdWUgPSB0aGF0LmN1cnJlbnRWYWx1ZSArIHN1Z2dlc3Rpb24udmFsdWUuc3Vic3RyKHRoYXQuY3VycmVudFZhbHVlLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhhdC5oaW50VmFsdWUgIT09IGhpbnRWYWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoYXQuaGludFZhbHVlID0gaGludFZhbHVlO1xuICAgICAgICAgICAgICAgIHRoYXQuaGludCA9IHN1Z2dlc3Rpb247XG4gICAgICAgICAgICAgICAgKHRoaXMub3B0aW9ucy5vbkhpbnQgfHwgJC5ub29wKShoaW50VmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHZlcmlmeVN1Z2dlc3Rpb25zRm9ybWF0OiBmdW5jdGlvbiAoc3VnZ2VzdGlvbnMpIHtcbiAgICAgICAgICAgIC8vIElmIHN1Z2dlc3Rpb25zIGlzIHN0cmluZyBhcnJheSwgY29udmVydCB0aGVtIHRvIHN1cHBvcnRlZCBmb3JtYXQ6XG4gICAgICAgICAgICBpZiAoc3VnZ2VzdGlvbnMubGVuZ3RoICYmIHR5cGVvZiBzdWdnZXN0aW9uc1swXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJC5tYXAoc3VnZ2VzdGlvbnMsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogdmFsdWUsIGRhdGE6IG51bGwgfTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb25zO1xuICAgICAgICB9LFxuXG4gICAgICAgIHZhbGlkYXRlT3JpZW50YXRpb246IGZ1bmN0aW9uKG9yaWVudGF0aW9uLCBmYWxsYmFjaykge1xuICAgICAgICAgICAgb3JpZW50YXRpb24gPSAkLnRyaW0ob3JpZW50YXRpb24gfHwgJycpLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgICAgIGlmKCQuaW5BcnJheShvcmllbnRhdGlvbiwgWydhdXRvJywgJ2JvdHRvbScsICd0b3AnXSkgPT09IC0xKXtcbiAgICAgICAgICAgICAgICBvcmllbnRhdGlvbiA9IGZhbGxiYWNrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gb3JpZW50YXRpb247XG4gICAgICAgIH0sXG5cbiAgICAgICAgcHJvY2Vzc1Jlc3BvbnNlOiBmdW5jdGlvbiAocmVzdWx0LCBvcmlnaW5hbFF1ZXJ5LCBjYWNoZUtleSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnM7XG5cbiAgICAgICAgICAgIHJlc3VsdC5zdWdnZXN0aW9ucyA9IHRoYXQudmVyaWZ5U3VnZ2VzdGlvbnNGb3JtYXQocmVzdWx0LnN1Z2dlc3Rpb25zKTtcblxuICAgICAgICAgICAgLy8gQ2FjaGUgcmVzdWx0cyBpZiBjYWNoZSBpcyBub3QgZGlzYWJsZWQ6XG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMubm9DYWNoZSkge1xuICAgICAgICAgICAgICAgIHRoYXQuY2FjaGVkUmVzcG9uc2VbY2FjaGVLZXldID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnByZXZlbnRCYWRRdWVyaWVzICYmIHJlc3VsdC5zdWdnZXN0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5iYWRRdWVyaWVzLnB1c2gob3JpZ2luYWxRdWVyeSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBSZXR1cm4gaWYgb3JpZ2luYWxRdWVyeSBpcyBub3QgbWF0Y2hpbmcgY3VycmVudCBxdWVyeTpcbiAgICAgICAgICAgIGlmIChvcmlnaW5hbFF1ZXJ5ICE9PSB0aGF0LmdldFF1ZXJ5KHRoYXQuY3VycmVudFZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IHJlc3VsdC5zdWdnZXN0aW9ucztcbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFjdGl2YXRlOiBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBhY3RpdmVJdGVtLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkID0gdGhhdC5jbGFzc2VzLnNlbGVjdGVkLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXG4gICAgICAgICAgICAgICAgY2hpbGRyZW4gPSBjb250YWluZXIuZmluZCgnLicgKyB0aGF0LmNsYXNzZXMuc3VnZ2VzdGlvbik7XG5cbiAgICAgICAgICAgIGNvbnRhaW5lci5maW5kKCcuJyArIHNlbGVjdGVkKS5yZW1vdmVDbGFzcyhzZWxlY3RlZCk7XG5cbiAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IGluZGV4O1xuXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ICE9PSAtMSAmJiBjaGlsZHJlbi5sZW5ndGggPiB0aGF0LnNlbGVjdGVkSW5kZXgpIHtcbiAgICAgICAgICAgICAgICBhY3RpdmVJdGVtID0gY2hpbGRyZW4uZ2V0KHRoYXQuc2VsZWN0ZWRJbmRleCk7XG4gICAgICAgICAgICAgICAgJChhY3RpdmVJdGVtKS5hZGRDbGFzcyhzZWxlY3RlZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjdGl2ZUl0ZW07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlbGVjdEhpbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBpID0gJC5pbkFycmF5KHRoYXQuaGludCwgdGhhdC5zdWdnZXN0aW9ucyk7XG5cbiAgICAgICAgICAgIHRoYXQuc2VsZWN0KGkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlbGVjdDogZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgdGhhdC5vblNlbGVjdChpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBtb3ZlVXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IDApIHtcbiAgICAgICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLmNoaWxkcmVuKCkuZmlyc3QoKS5yZW1vdmVDbGFzcyh0aGF0LmNsYXNzZXMuc2VsZWN0ZWQpO1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcbiAgICAgICAgICAgICAgICB0aGF0LmZpbmRCZXN0SGludCgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5hZGp1c3RTY3JvbGwodGhhdC5zZWxlY3RlZEluZGV4IC0gMSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbW92ZURvd246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gKHRoYXQuc3VnZ2VzdGlvbnMubGVuZ3RoIC0gMSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQuYWRqdXN0U2Nyb2xsKHRoYXQuc2VsZWN0ZWRJbmRleCArIDEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFkanVzdFNjcm9sbDogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgYWN0aXZlSXRlbSA9IHRoYXQuYWN0aXZhdGUoaW5kZXgpO1xuXG4gICAgICAgICAgICBpZiAoIWFjdGl2ZUl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBvZmZzZXRUb3AsXG4gICAgICAgICAgICAgICAgdXBwZXJCb3VuZCxcbiAgICAgICAgICAgICAgICBsb3dlckJvdW5kLFxuICAgICAgICAgICAgICAgIGhlaWdodERlbHRhID0gJChhY3RpdmVJdGVtKS5vdXRlckhlaWdodCgpO1xuXG4gICAgICAgICAgICBvZmZzZXRUb3AgPSBhY3RpdmVJdGVtLm9mZnNldFRvcDtcbiAgICAgICAgICAgIHVwcGVyQm91bmQgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnNjcm9sbFRvcCgpO1xuICAgICAgICAgICAgbG93ZXJCb3VuZCA9IHVwcGVyQm91bmQgKyB0aGF0Lm9wdGlvbnMubWF4SGVpZ2h0IC0gaGVpZ2h0RGVsdGE7XG5cbiAgICAgICAgICAgIGlmIChvZmZzZXRUb3AgPCB1cHBlckJvdW5kKSB7XG4gICAgICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5zY3JvbGxUb3Aob2Zmc2V0VG9wKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob2Zmc2V0VG9wID4gbG93ZXJCb3VuZCkge1xuICAgICAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuc2Nyb2xsVG9wKG9mZnNldFRvcCAtIHRoYXQub3B0aW9ucy5tYXhIZWlnaHQgKyBoZWlnaHREZWx0YSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghdGhhdC5vcHRpb25zLnByZXNlcnZlSW5wdXQpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmdldFZhbHVlKHRoYXQuc3VnZ2VzdGlvbnNbaW5kZXhdLnZhbHVlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQobnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9uU2VsZWN0Q2FsbGJhY2sgPSB0aGF0Lm9wdGlvbnMub25TZWxlY3QsXG4gICAgICAgICAgICAgICAgc3VnZ2VzdGlvbiA9IHRoYXQuc3VnZ2VzdGlvbnNbaW5kZXhdO1xuXG4gICAgICAgICAgICB0aGF0LmN1cnJlbnRWYWx1ZSA9IHRoYXQuZ2V0VmFsdWUoc3VnZ2VzdGlvbi52YWx1ZSk7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmN1cnJlbnRWYWx1ZSAhPT0gdGhhdC5lbC52YWwoKSAmJiAhdGhhdC5vcHRpb25zLnByZXNlcnZlSW5wdXQpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQuc2lnbmFsSGludChudWxsKTtcbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSBbXTtcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uID0gc3VnZ2VzdGlvbjtcblxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihvblNlbGVjdENhbGxiYWNrKSkge1xuICAgICAgICAgICAgICAgIG9uU2VsZWN0Q2FsbGJhY2suY2FsbCh0aGF0LmVsZW1lbnQsIHN1Z2dlc3Rpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldFZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBkZWxpbWl0ZXIgPSB0aGF0Lm9wdGlvbnMuZGVsaW1pdGVyLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRWYWx1ZSxcbiAgICAgICAgICAgICAgICBwYXJ0cztcblxuICAgICAgICAgICAgaWYgKCFkZWxpbWl0ZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGN1cnJlbnRWYWx1ZSA9IHRoYXQuY3VycmVudFZhbHVlO1xuICAgICAgICAgICAgcGFydHMgPSBjdXJyZW50VmFsdWUuc3BsaXQoZGVsaW1pdGVyKTtcblxuICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRWYWx1ZS5zdWJzdHIoMCwgY3VycmVudFZhbHVlLmxlbmd0aCAtIHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdLmxlbmd0aCkgKyB2YWx1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNwb3NlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICB0aGF0LmVsLm9mZignLmF1dG9jb21wbGV0ZScpLnJlbW92ZURhdGEoJ2F1dG9jb21wbGV0ZScpO1xuICAgICAgICAgICAgdGhhdC5kaXNhYmxlS2lsbGVyRm4oKTtcbiAgICAgICAgICAgICQod2luZG93KS5vZmYoJ3Jlc2l6ZS5hdXRvY29tcGxldGUnLCB0aGF0LmZpeFBvc2l0aW9uQ2FwdHVyZSk7XG4gICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIENyZWF0ZSBjaGFpbmFibGUgalF1ZXJ5IHBsdWdpbjpcbiAgICAkLmZuLmF1dG9jb21wbGV0ZSA9ICQuZm4uZGV2YnJpZGdlQXV0b2NvbXBsZXRlID0gZnVuY3Rpb24gKG9wdGlvbnMsIGFyZ3MpIHtcbiAgICAgICAgdmFyIGRhdGFLZXkgPSAnYXV0b2NvbXBsZXRlJztcbiAgICAgICAgLy8gSWYgZnVuY3Rpb24gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50IHJldHVyblxuICAgICAgICAvLyBpbnN0YW5jZSBvZiB0aGUgZmlyc3QgbWF0Y2hlZCBlbGVtZW50OlxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlyc3QoKS5kYXRhKGRhdGFLZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgaW5wdXRFbGVtZW50ID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IGlucHV0RWxlbWVudC5kYXRhKGRhdGFLZXkpO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlICYmIHR5cGVvZiBpbnN0YW5jZVtvcHRpb25zXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZVtvcHRpb25zXShhcmdzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIElmIGluc3RhbmNlIGFscmVhZHkgZXhpc3RzLCBkZXN0cm95IGl0OlxuICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZSAmJiBpbnN0YW5jZS5kaXNwb3NlKSB7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBuZXcgQXV0b2NvbXBsZXRlKHRoaXMsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGlucHV0RWxlbWVudC5kYXRhKGRhdGFLZXksIGluc3RhbmNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcbn0pKTtcbiIsIi8qISBTZWxlY3QyIDQuMC4zIHwgaHR0cHM6Ly9naXRodWIuY29tL3NlbGVjdDIvc2VsZWN0Mi9ibG9iL21hc3Rlci9MSUNFTlNFLm1kICovIWZ1bmN0aW9uKGEpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW1wianF1ZXJ5XCJdLGEpOmEoXCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHM/cmVxdWlyZShcImpxdWVyeVwiKTpqUXVlcnkpfShmdW5jdGlvbihhKXt2YXIgYj1mdW5jdGlvbigpe2lmKGEmJmEuZm4mJmEuZm4uc2VsZWN0MiYmYS5mbi5zZWxlY3QyLmFtZCl2YXIgYj1hLmZuLnNlbGVjdDIuYW1kO3ZhciBiO3JldHVybiBmdW5jdGlvbigpe2lmKCFifHwhYi5yZXF1aXJlanMpe2I/Yz1iOmI9e307dmFyIGEsYyxkOyFmdW5jdGlvbihiKXtmdW5jdGlvbiBlKGEsYil7cmV0dXJuIHUuY2FsbChhLGIpfWZ1bmN0aW9uIGYoYSxiKXt2YXIgYyxkLGUsZixnLGgsaSxqLGssbCxtLG49YiYmYi5zcGxpdChcIi9cIiksbz1zLm1hcCxwPW8mJm9bXCIqXCJdfHx7fTtpZihhJiZcIi5cIj09PWEuY2hhckF0KDApKWlmKGIpe2ZvcihhPWEuc3BsaXQoXCIvXCIpLGc9YS5sZW5ndGgtMSxzLm5vZGVJZENvbXBhdCYmdy50ZXN0KGFbZ10pJiYoYVtnXT1hW2ddLnJlcGxhY2UodyxcIlwiKSksYT1uLnNsaWNlKDAsbi5sZW5ndGgtMSkuY29uY2F0KGEpLGs9MDtrPGEubGVuZ3RoO2srPTEpaWYobT1hW2tdLFwiLlwiPT09bSlhLnNwbGljZShrLDEpLGstPTE7ZWxzZSBpZihcIi4uXCI9PT1tKXtpZigxPT09ayYmKFwiLi5cIj09PWFbMl18fFwiLi5cIj09PWFbMF0pKWJyZWFrO2s+MCYmKGEuc3BsaWNlKGstMSwyKSxrLT0yKX1hPWEuam9pbihcIi9cIil9ZWxzZSAwPT09YS5pbmRleE9mKFwiLi9cIikmJihhPWEuc3Vic3RyaW5nKDIpKTtpZigobnx8cCkmJm8pe2ZvcihjPWEuc3BsaXQoXCIvXCIpLGs9Yy5sZW5ndGg7az4wO2stPTEpe2lmKGQ9Yy5zbGljZSgwLGspLmpvaW4oXCIvXCIpLG4pZm9yKGw9bi5sZW5ndGg7bD4wO2wtPTEpaWYoZT1vW24uc2xpY2UoMCxsKS5qb2luKFwiL1wiKV0sZSYmKGU9ZVtkXSkpe2Y9ZSxoPWs7YnJlYWt9aWYoZilicmVhazshaSYmcCYmcFtkXSYmKGk9cFtkXSxqPWspfSFmJiZpJiYoZj1pLGg9aiksZiYmKGMuc3BsaWNlKDAsaCxmKSxhPWMuam9pbihcIi9cIikpfXJldHVybiBhfWZ1bmN0aW9uIGcoYSxjKXtyZXR1cm4gZnVuY3Rpb24oKXt2YXIgZD12LmNhbGwoYXJndW1lbnRzLDApO3JldHVyblwic3RyaW5nXCIhPXR5cGVvZiBkWzBdJiYxPT09ZC5sZW5ndGgmJmQucHVzaChudWxsKSxuLmFwcGx5KGIsZC5jb25jYXQoW2EsY10pKX19ZnVuY3Rpb24gaChhKXtyZXR1cm4gZnVuY3Rpb24oYil7cmV0dXJuIGYoYixhKX19ZnVuY3Rpb24gaShhKXtyZXR1cm4gZnVuY3Rpb24oYil7cVthXT1ifX1mdW5jdGlvbiBqKGEpe2lmKGUocixhKSl7dmFyIGM9clthXTtkZWxldGUgclthXSx0W2FdPSEwLG0uYXBwbHkoYixjKX1pZighZShxLGEpJiYhZSh0LGEpKXRocm93IG5ldyBFcnJvcihcIk5vIFwiK2EpO3JldHVybiBxW2FdfWZ1bmN0aW9uIGsoYSl7dmFyIGIsYz1hP2EuaW5kZXhPZihcIiFcIik6LTE7cmV0dXJuIGM+LTEmJihiPWEuc3Vic3RyaW5nKDAsYyksYT1hLnN1YnN0cmluZyhjKzEsYS5sZW5ndGgpKSxbYixhXX1mdW5jdGlvbiBsKGEpe3JldHVybiBmdW5jdGlvbigpe3JldHVybiBzJiZzLmNvbmZpZyYmcy5jb25maWdbYV18fHt9fX12YXIgbSxuLG8scCxxPXt9LHI9e30scz17fSx0PXt9LHU9T2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSx2PVtdLnNsaWNlLHc9L1xcLmpzJC87bz1mdW5jdGlvbihhLGIpe3ZhciBjLGQ9ayhhKSxlPWRbMF07cmV0dXJuIGE9ZFsxXSxlJiYoZT1mKGUsYiksYz1qKGUpKSxlP2E9YyYmYy5ub3JtYWxpemU/Yy5ub3JtYWxpemUoYSxoKGIpKTpmKGEsYik6KGE9ZihhLGIpLGQ9ayhhKSxlPWRbMF0sYT1kWzFdLGUmJihjPWooZSkpKSx7ZjplP2UrXCIhXCIrYTphLG46YSxwcjplLHA6Y319LHA9e3JlcXVpcmU6ZnVuY3Rpb24oYSl7cmV0dXJuIGcoYSl9LGV4cG9ydHM6ZnVuY3Rpb24oYSl7dmFyIGI9cVthXTtyZXR1cm5cInVuZGVmaW5lZFwiIT10eXBlb2YgYj9iOnFbYV09e319LG1vZHVsZTpmdW5jdGlvbihhKXtyZXR1cm57aWQ6YSx1cmk6XCJcIixleHBvcnRzOnFbYV0sY29uZmlnOmwoYSl9fX0sbT1mdW5jdGlvbihhLGMsZCxmKXt2YXIgaCxrLGwsbSxuLHMsdT1bXSx2PXR5cGVvZiBkO2lmKGY9Znx8YSxcInVuZGVmaW5lZFwiPT09dnx8XCJmdW5jdGlvblwiPT09dil7Zm9yKGM9IWMubGVuZ3RoJiZkLmxlbmd0aD9bXCJyZXF1aXJlXCIsXCJleHBvcnRzXCIsXCJtb2R1bGVcIl06YyxuPTA7bjxjLmxlbmd0aDtuKz0xKWlmKG09byhjW25dLGYpLGs9bS5mLFwicmVxdWlyZVwiPT09ayl1W25dPXAucmVxdWlyZShhKTtlbHNlIGlmKFwiZXhwb3J0c1wiPT09ayl1W25dPXAuZXhwb3J0cyhhKSxzPSEwO2Vsc2UgaWYoXCJtb2R1bGVcIj09PWspaD11W25dPXAubW9kdWxlKGEpO2Vsc2UgaWYoZShxLGspfHxlKHIsayl8fGUodCxrKSl1W25dPWooayk7ZWxzZXtpZighbS5wKXRocm93IG5ldyBFcnJvcihhK1wiIG1pc3NpbmcgXCIrayk7bS5wLmxvYWQobS5uLGcoZiwhMCksaShrKSx7fSksdVtuXT1xW2tdfWw9ZD9kLmFwcGx5KHFbYV0sdSk6dm9pZCAwLGEmJihoJiZoLmV4cG9ydHMhPT1iJiZoLmV4cG9ydHMhPT1xW2FdP3FbYV09aC5leHBvcnRzOmw9PT1iJiZzfHwocVthXT1sKSl9ZWxzZSBhJiYocVthXT1kKX0sYT1jPW49ZnVuY3Rpb24oYSxjLGQsZSxmKXtpZihcInN0cmluZ1wiPT10eXBlb2YgYSlyZXR1cm4gcFthXT9wW2FdKGMpOmoobyhhLGMpLmYpO2lmKCFhLnNwbGljZSl7aWYocz1hLHMuZGVwcyYmbihzLmRlcHMscy5jYWxsYmFjayksIWMpcmV0dXJuO2Muc3BsaWNlPyhhPWMsYz1kLGQ9bnVsbCk6YT1ifXJldHVybiBjPWN8fGZ1bmN0aW9uKCl7fSxcImZ1bmN0aW9uXCI9PXR5cGVvZiBkJiYoZD1lLGU9ZiksZT9tKGIsYSxjLGQpOnNldFRpbWVvdXQoZnVuY3Rpb24oKXttKGIsYSxjLGQpfSw0KSxufSxuLmNvbmZpZz1mdW5jdGlvbihhKXtyZXR1cm4gbihhKX0sYS5fZGVmaW5lZD1xLGQ9ZnVuY3Rpb24oYSxiLGMpe2lmKFwic3RyaW5nXCIhPXR5cGVvZiBhKXRocm93IG5ldyBFcnJvcihcIlNlZSBhbG1vbmQgUkVBRE1FOiBpbmNvcnJlY3QgbW9kdWxlIGJ1aWxkLCBubyBtb2R1bGUgbmFtZVwiKTtiLnNwbGljZXx8KGM9YixiPVtdKSxlKHEsYSl8fGUocixhKXx8KHJbYV09W2EsYixjXSl9LGQuYW1kPXtqUXVlcnk6ITB9fSgpLGIucmVxdWlyZWpzPWEsYi5yZXF1aXJlPWMsYi5kZWZpbmU9ZH19KCksYi5kZWZpbmUoXCJhbG1vbmRcIixmdW5jdGlvbigpe30pLGIuZGVmaW5lKFwianF1ZXJ5XCIsW10sZnVuY3Rpb24oKXt2YXIgYj1hfHwkO3JldHVybiBudWxsPT1iJiZjb25zb2xlJiZjb25zb2xlLmVycm9yJiZjb25zb2xlLmVycm9yKFwiU2VsZWN0MjogQW4gaW5zdGFuY2Ugb2YgalF1ZXJ5IG9yIGEgalF1ZXJ5LWNvbXBhdGlibGUgbGlicmFyeSB3YXMgbm90IGZvdW5kLiBNYWtlIHN1cmUgdGhhdCB5b3UgYXJlIGluY2x1ZGluZyBqUXVlcnkgYmVmb3JlIFNlbGVjdDIgb24geW91ciB3ZWIgcGFnZS5cIiksYn0pLGIuZGVmaW5lKFwic2VsZWN0Mi91dGlsc1wiLFtcImpxdWVyeVwiXSxmdW5jdGlvbihhKXtmdW5jdGlvbiBiKGEpe3ZhciBiPWEucHJvdG90eXBlLGM9W107Zm9yKHZhciBkIGluIGIpe3ZhciBlPWJbZF07XCJmdW5jdGlvblwiPT10eXBlb2YgZSYmXCJjb25zdHJ1Y3RvclwiIT09ZCYmYy5wdXNoKGQpfXJldHVybiBjfXZhciBjPXt9O2MuRXh0ZW5kPWZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYygpe3RoaXMuY29uc3RydWN0b3I9YX12YXIgZD17fS5oYXNPd25Qcm9wZXJ0eTtmb3IodmFyIGUgaW4gYilkLmNhbGwoYixlKSYmKGFbZV09YltlXSk7cmV0dXJuIGMucHJvdG90eXBlPWIucHJvdG90eXBlLGEucHJvdG90eXBlPW5ldyBjLGEuX19zdXBlcl9fPWIucHJvdG90eXBlLGF9LGMuRGVjb3JhdGU9ZnVuY3Rpb24oYSxjKXtmdW5jdGlvbiBkKCl7dmFyIGI9QXJyYXkucHJvdG90eXBlLnVuc2hpZnQsZD1jLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5sZW5ndGgsZT1hLnByb3RvdHlwZS5jb25zdHJ1Y3RvcjtkPjAmJihiLmNhbGwoYXJndW1lbnRzLGEucHJvdG90eXBlLmNvbnN0cnVjdG9yKSxlPWMucHJvdG90eXBlLmNvbnN0cnVjdG9yKSxlLmFwcGx5KHRoaXMsYXJndW1lbnRzKX1mdW5jdGlvbiBlKCl7dGhpcy5jb25zdHJ1Y3Rvcj1kfXZhciBmPWIoYyksZz1iKGEpO2MuZGlzcGxheU5hbWU9YS5kaXNwbGF5TmFtZSxkLnByb3RvdHlwZT1uZXcgZTtmb3IodmFyIGg9MDtoPGcubGVuZ3RoO2grKyl7dmFyIGk9Z1toXTtkLnByb3RvdHlwZVtpXT1hLnByb3RvdHlwZVtpXX1mb3IodmFyIGo9KGZ1bmN0aW9uKGEpe3ZhciBiPWZ1bmN0aW9uKCl7fTthIGluIGQucHJvdG90eXBlJiYoYj1kLnByb3RvdHlwZVthXSk7dmFyIGU9Yy5wcm90b3R5cGVbYV07cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIGE9QXJyYXkucHJvdG90eXBlLnVuc2hpZnQ7cmV0dXJuIGEuY2FsbChhcmd1bWVudHMsYiksZS5hcHBseSh0aGlzLGFyZ3VtZW50cyl9fSksaz0wO2s8Zi5sZW5ndGg7aysrKXt2YXIgbD1mW2tdO2QucHJvdG90eXBlW2xdPWoobCl9cmV0dXJuIGR9O3ZhciBkPWZ1bmN0aW9uKCl7dGhpcy5saXN0ZW5lcnM9e319O3JldHVybiBkLnByb3RvdHlwZS5vbj1mdW5jdGlvbihhLGIpe3RoaXMubGlzdGVuZXJzPXRoaXMubGlzdGVuZXJzfHx7fSxhIGluIHRoaXMubGlzdGVuZXJzP3RoaXMubGlzdGVuZXJzW2FdLnB1c2goYik6dGhpcy5saXN0ZW5lcnNbYV09W2JdfSxkLnByb3RvdHlwZS50cmlnZ2VyPWZ1bmN0aW9uKGEpe3ZhciBiPUFycmF5LnByb3RvdHlwZS5zbGljZSxjPWIuY2FsbChhcmd1bWVudHMsMSk7dGhpcy5saXN0ZW5lcnM9dGhpcy5saXN0ZW5lcnN8fHt9LG51bGw9PWMmJihjPVtdKSwwPT09Yy5sZW5ndGgmJmMucHVzaCh7fSksY1swXS5fdHlwZT1hLGEgaW4gdGhpcy5saXN0ZW5lcnMmJnRoaXMuaW52b2tlKHRoaXMubGlzdGVuZXJzW2FdLGIuY2FsbChhcmd1bWVudHMsMSkpLFwiKlwiaW4gdGhpcy5saXN0ZW5lcnMmJnRoaXMuaW52b2tlKHRoaXMubGlzdGVuZXJzW1wiKlwiXSxhcmd1bWVudHMpfSxkLnByb3RvdHlwZS5pbnZva2U9ZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9MCxkPWEubGVuZ3RoO2Q+YztjKyspYVtjXS5hcHBseSh0aGlzLGIpfSxjLk9ic2VydmFibGU9ZCxjLmdlbmVyYXRlQ2hhcnM9ZnVuY3Rpb24oYSl7Zm9yKHZhciBiPVwiXCIsYz0wO2E+YztjKyspe3ZhciBkPU1hdGguZmxvb3IoMzYqTWF0aC5yYW5kb20oKSk7Yis9ZC50b1N0cmluZygzNil9cmV0dXJuIGJ9LGMuYmluZD1mdW5jdGlvbihhLGIpe3JldHVybiBmdW5jdGlvbigpe2EuYXBwbHkoYixhcmd1bWVudHMpfX0sYy5fY29udmVydERhdGE9ZnVuY3Rpb24oYSl7Zm9yKHZhciBiIGluIGEpe3ZhciBjPWIuc3BsaXQoXCItXCIpLGQ9YTtpZigxIT09Yy5sZW5ndGgpe2Zvcih2YXIgZT0wO2U8Yy5sZW5ndGg7ZSsrKXt2YXIgZj1jW2VdO2Y9Zi5zdWJzdHJpbmcoMCwxKS50b0xvd2VyQ2FzZSgpK2Yuc3Vic3RyaW5nKDEpLGYgaW4gZHx8KGRbZl09e30pLGU9PWMubGVuZ3RoLTEmJihkW2ZdPWFbYl0pLGQ9ZFtmXX1kZWxldGUgYVtiXX19cmV0dXJuIGF9LGMuaGFzU2Nyb2xsPWZ1bmN0aW9uKGIsYyl7dmFyIGQ9YShjKSxlPWMuc3R5bGUub3ZlcmZsb3dYLGY9Yy5zdHlsZS5vdmVyZmxvd1k7cmV0dXJuIGUhPT1mfHxcImhpZGRlblwiIT09ZiYmXCJ2aXNpYmxlXCIhPT1mP1wic2Nyb2xsXCI9PT1lfHxcInNjcm9sbFwiPT09Zj8hMDpkLmlubmVySGVpZ2h0KCk8Yy5zY3JvbGxIZWlnaHR8fGQuaW5uZXJXaWR0aCgpPGMuc2Nyb2xsV2lkdGg6ITF9LGMuZXNjYXBlTWFya3VwPWZ1bmN0aW9uKGEpe3ZhciBiPXtcIlxcXFxcIjpcIiYjOTI7XCIsXCImXCI6XCImYW1wO1wiLFwiPFwiOlwiJmx0O1wiLFwiPlwiOlwiJmd0O1wiLCdcIic6XCImcXVvdDtcIixcIidcIjpcIiYjMzk7XCIsXCIvXCI6XCImIzQ3O1wifTtyZXR1cm5cInN0cmluZ1wiIT10eXBlb2YgYT9hOlN0cmluZyhhKS5yZXBsYWNlKC9bJjw+XCInXFwvXFxcXF0vZyxmdW5jdGlvbihhKXtyZXR1cm4gYlthXX0pfSxjLmFwcGVuZE1hbnk9ZnVuY3Rpb24oYixjKXtpZihcIjEuN1wiPT09YS5mbi5qcXVlcnkuc3Vic3RyKDAsMykpe3ZhciBkPWEoKTthLm1hcChjLGZ1bmN0aW9uKGEpe2Q9ZC5hZGQoYSl9KSxjPWR9Yi5hcHBlbmQoYyl9LGN9KSxiLmRlZmluZShcInNlbGVjdDIvcmVzdWx0c1wiLFtcImpxdWVyeVwiLFwiLi91dGlsc1wiXSxmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYSxiLGQpe3RoaXMuJGVsZW1lbnQ9YSx0aGlzLmRhdGE9ZCx0aGlzLm9wdGlvbnM9YixjLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMpfXJldHVybiBiLkV4dGVuZChjLGIuT2JzZXJ2YWJsZSksYy5wcm90b3R5cGUucmVuZGVyPWZ1bmN0aW9uKCl7dmFyIGI9YSgnPHVsIGNsYXNzPVwic2VsZWN0Mi1yZXN1bHRzX19vcHRpb25zXCIgcm9sZT1cInRyZWVcIj48L3VsPicpO3JldHVybiB0aGlzLm9wdGlvbnMuZ2V0KFwibXVsdGlwbGVcIikmJmIuYXR0cihcImFyaWEtbXVsdGlzZWxlY3RhYmxlXCIsXCJ0cnVlXCIpLHRoaXMuJHJlc3VsdHM9YixifSxjLnByb3RvdHlwZS5jbGVhcj1mdW5jdGlvbigpe3RoaXMuJHJlc3VsdHMuZW1wdHkoKX0sYy5wcm90b3R5cGUuZGlzcGxheU1lc3NhZ2U9ZnVuY3Rpb24oYil7dmFyIGM9dGhpcy5vcHRpb25zLmdldChcImVzY2FwZU1hcmt1cFwiKTt0aGlzLmNsZWFyKCksdGhpcy5oaWRlTG9hZGluZygpO3ZhciBkPWEoJzxsaSByb2xlPVwidHJlZWl0ZW1cIiBhcmlhLWxpdmU9XCJhc3NlcnRpdmVcIiBjbGFzcz1cInNlbGVjdDItcmVzdWx0c19fb3B0aW9uXCI+PC9saT4nKSxlPXRoaXMub3B0aW9ucy5nZXQoXCJ0cmFuc2xhdGlvbnNcIikuZ2V0KGIubWVzc2FnZSk7ZC5hcHBlbmQoYyhlKGIuYXJncykpKSxkWzBdLmNsYXNzTmFtZSs9XCIgc2VsZWN0Mi1yZXN1bHRzX19tZXNzYWdlXCIsdGhpcy4kcmVzdWx0cy5hcHBlbmQoZCl9LGMucHJvdG90eXBlLmhpZGVNZXNzYWdlcz1mdW5jdGlvbigpe3RoaXMuJHJlc3VsdHMuZmluZChcIi5zZWxlY3QyLXJlc3VsdHNfX21lc3NhZ2VcIikucmVtb3ZlKCl9LGMucHJvdG90eXBlLmFwcGVuZD1mdW5jdGlvbihhKXt0aGlzLmhpZGVMb2FkaW5nKCk7dmFyIGI9W107aWYobnVsbD09YS5yZXN1bHRzfHwwPT09YS5yZXN1bHRzLmxlbmd0aClyZXR1cm4gdm9pZCgwPT09dGhpcy4kcmVzdWx0cy5jaGlsZHJlbigpLmxlbmd0aCYmdGhpcy50cmlnZ2VyKFwicmVzdWx0czptZXNzYWdlXCIse21lc3NhZ2U6XCJub1Jlc3VsdHNcIn0pKTthLnJlc3VsdHM9dGhpcy5zb3J0KGEucmVzdWx0cyk7Zm9yKHZhciBjPTA7YzxhLnJlc3VsdHMubGVuZ3RoO2MrKyl7dmFyIGQ9YS5yZXN1bHRzW2NdLGU9dGhpcy5vcHRpb24oZCk7Yi5wdXNoKGUpfXRoaXMuJHJlc3VsdHMuYXBwZW5kKGIpfSxjLnByb3RvdHlwZS5wb3NpdGlvbj1mdW5jdGlvbihhLGIpe3ZhciBjPWIuZmluZChcIi5zZWxlY3QyLXJlc3VsdHNcIik7Yy5hcHBlbmQoYSl9LGMucHJvdG90eXBlLnNvcnQ9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcy5vcHRpb25zLmdldChcInNvcnRlclwiKTtyZXR1cm4gYihhKX0sYy5wcm90b3R5cGUuaGlnaGxpZ2h0Rmlyc3RJdGVtPWZ1bmN0aW9uKCl7dmFyIGE9dGhpcy4kcmVzdWx0cy5maW5kKFwiLnNlbGVjdDItcmVzdWx0c19fb3B0aW9uW2FyaWEtc2VsZWN0ZWRdXCIpLGI9YS5maWx0ZXIoXCJbYXJpYS1zZWxlY3RlZD10cnVlXVwiKTtiLmxlbmd0aD4wP2IuZmlyc3QoKS50cmlnZ2VyKFwibW91c2VlbnRlclwiKTphLmZpcnN0KCkudHJpZ2dlcihcIm1vdXNlZW50ZXJcIiksdGhpcy5lbnN1cmVIaWdobGlnaHRWaXNpYmxlKCl9LGMucHJvdG90eXBlLnNldENsYXNzZXM9ZnVuY3Rpb24oKXt2YXIgYj10aGlzO3RoaXMuZGF0YS5jdXJyZW50KGZ1bmN0aW9uKGMpe3ZhciBkPWEubWFwKGMsZnVuY3Rpb24oYSl7cmV0dXJuIGEuaWQudG9TdHJpbmcoKX0pLGU9Yi4kcmVzdWx0cy5maW5kKFwiLnNlbGVjdDItcmVzdWx0c19fb3B0aW9uW2FyaWEtc2VsZWN0ZWRdXCIpO2UuZWFjaChmdW5jdGlvbigpe3ZhciBiPWEodGhpcyksYz1hLmRhdGEodGhpcyxcImRhdGFcIiksZT1cIlwiK2MuaWQ7bnVsbCE9Yy5lbGVtZW50JiZjLmVsZW1lbnQuc2VsZWN0ZWR8fG51bGw9PWMuZWxlbWVudCYmYS5pbkFycmF5KGUsZCk+LTE/Yi5hdHRyKFwiYXJpYS1zZWxlY3RlZFwiLFwidHJ1ZVwiKTpiLmF0dHIoXCJhcmlhLXNlbGVjdGVkXCIsXCJmYWxzZVwiKX0pfSl9LGMucHJvdG90eXBlLnNob3dMb2FkaW5nPWZ1bmN0aW9uKGEpe3RoaXMuaGlkZUxvYWRpbmcoKTt2YXIgYj10aGlzLm9wdGlvbnMuZ2V0KFwidHJhbnNsYXRpb25zXCIpLmdldChcInNlYXJjaGluZ1wiKSxjPXtkaXNhYmxlZDohMCxsb2FkaW5nOiEwLHRleHQ6YihhKX0sZD10aGlzLm9wdGlvbihjKTtkLmNsYXNzTmFtZSs9XCIgbG9hZGluZy1yZXN1bHRzXCIsdGhpcy4kcmVzdWx0cy5wcmVwZW5kKGQpfSxjLnByb3RvdHlwZS5oaWRlTG9hZGluZz1mdW5jdGlvbigpe3RoaXMuJHJlc3VsdHMuZmluZChcIi5sb2FkaW5nLXJlc3VsdHNcIikucmVtb3ZlKCl9LGMucHJvdG90eXBlLm9wdGlvbj1mdW5jdGlvbihiKXt2YXIgYz1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7Yy5jbGFzc05hbWU9XCJzZWxlY3QyLXJlc3VsdHNfX29wdGlvblwiO3ZhciBkPXtyb2xlOlwidHJlZWl0ZW1cIixcImFyaWEtc2VsZWN0ZWRcIjpcImZhbHNlXCJ9O2IuZGlzYWJsZWQmJihkZWxldGUgZFtcImFyaWEtc2VsZWN0ZWRcIl0sZFtcImFyaWEtZGlzYWJsZWRcIl09XCJ0cnVlXCIpLG51bGw9PWIuaWQmJmRlbGV0ZSBkW1wiYXJpYS1zZWxlY3RlZFwiXSxudWxsIT1iLl9yZXN1bHRJZCYmKGMuaWQ9Yi5fcmVzdWx0SWQpLGIudGl0bGUmJihjLnRpdGxlPWIudGl0bGUpLGIuY2hpbGRyZW4mJihkLnJvbGU9XCJncm91cFwiLGRbXCJhcmlhLWxhYmVsXCJdPWIudGV4dCxkZWxldGUgZFtcImFyaWEtc2VsZWN0ZWRcIl0pO2Zvcih2YXIgZSBpbiBkKXt2YXIgZj1kW2VdO2Muc2V0QXR0cmlidXRlKGUsZil9aWYoYi5jaGlsZHJlbil7dmFyIGc9YShjKSxoPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHJvbmdcIik7aC5jbGFzc05hbWU9XCJzZWxlY3QyLXJlc3VsdHNfX2dyb3VwXCI7YShoKTt0aGlzLnRlbXBsYXRlKGIsaCk7Zm9yKHZhciBpPVtdLGo9MDtqPGIuY2hpbGRyZW4ubGVuZ3RoO2orKyl7dmFyIGs9Yi5jaGlsZHJlbltqXSxsPXRoaXMub3B0aW9uKGspO2kucHVzaChsKX12YXIgbT1hKFwiPHVsPjwvdWw+XCIse1wiY2xhc3NcIjpcInNlbGVjdDItcmVzdWx0c19fb3B0aW9ucyBzZWxlY3QyLXJlc3VsdHNfX29wdGlvbnMtLW5lc3RlZFwifSk7bS5hcHBlbmQoaSksZy5hcHBlbmQoaCksZy5hcHBlbmQobSl9ZWxzZSB0aGlzLnRlbXBsYXRlKGIsYyk7cmV0dXJuIGEuZGF0YShjLFwiZGF0YVwiLGIpLGN9LGMucHJvdG90eXBlLmJpbmQ9ZnVuY3Rpb24oYixjKXt2YXIgZD10aGlzLGU9Yi5pZCtcIi1yZXN1bHRzXCI7dGhpcy4kcmVzdWx0cy5hdHRyKFwiaWRcIixlKSxiLm9uKFwicmVzdWx0czphbGxcIixmdW5jdGlvbihhKXtkLmNsZWFyKCksZC5hcHBlbmQoYS5kYXRhKSxiLmlzT3BlbigpJiYoZC5zZXRDbGFzc2VzKCksZC5oaWdobGlnaHRGaXJzdEl0ZW0oKSl9KSxiLm9uKFwicmVzdWx0czphcHBlbmRcIixmdW5jdGlvbihhKXtkLmFwcGVuZChhLmRhdGEpLGIuaXNPcGVuKCkmJmQuc2V0Q2xhc3NlcygpfSksYi5vbihcInF1ZXJ5XCIsZnVuY3Rpb24oYSl7ZC5oaWRlTWVzc2FnZXMoKSxkLnNob3dMb2FkaW5nKGEpfSksYi5vbihcInNlbGVjdFwiLGZ1bmN0aW9uKCl7Yi5pc09wZW4oKSYmKGQuc2V0Q2xhc3NlcygpLGQuaGlnaGxpZ2h0Rmlyc3RJdGVtKCkpfSksYi5vbihcInVuc2VsZWN0XCIsZnVuY3Rpb24oKXtiLmlzT3BlbigpJiYoZC5zZXRDbGFzc2VzKCksZC5oaWdobGlnaHRGaXJzdEl0ZW0oKSl9KSxiLm9uKFwib3BlblwiLGZ1bmN0aW9uKCl7ZC4kcmVzdWx0cy5hdHRyKFwiYXJpYS1leHBhbmRlZFwiLFwidHJ1ZVwiKSxkLiRyZXN1bHRzLmF0dHIoXCJhcmlhLWhpZGRlblwiLFwiZmFsc2VcIiksZC5zZXRDbGFzc2VzKCksZC5lbnN1cmVIaWdobGlnaHRWaXNpYmxlKCl9KSxiLm9uKFwiY2xvc2VcIixmdW5jdGlvbigpe2QuJHJlc3VsdHMuYXR0cihcImFyaWEtZXhwYW5kZWRcIixcImZhbHNlXCIpLGQuJHJlc3VsdHMuYXR0cihcImFyaWEtaGlkZGVuXCIsXCJ0cnVlXCIpLGQuJHJlc3VsdHMucmVtb3ZlQXR0cihcImFyaWEtYWN0aXZlZGVzY2VuZGFudFwiKX0pLGIub24oXCJyZXN1bHRzOnRvZ2dsZVwiLGZ1bmN0aW9uKCl7dmFyIGE9ZC5nZXRIaWdobGlnaHRlZFJlc3VsdHMoKTswIT09YS5sZW5ndGgmJmEudHJpZ2dlcihcIm1vdXNldXBcIil9KSxiLm9uKFwicmVzdWx0czpzZWxlY3RcIixmdW5jdGlvbigpe3ZhciBhPWQuZ2V0SGlnaGxpZ2h0ZWRSZXN1bHRzKCk7aWYoMCE9PWEubGVuZ3RoKXt2YXIgYj1hLmRhdGEoXCJkYXRhXCIpO1widHJ1ZVwiPT1hLmF0dHIoXCJhcmlhLXNlbGVjdGVkXCIpP2QudHJpZ2dlcihcImNsb3NlXCIse30pOmQudHJpZ2dlcihcInNlbGVjdFwiLHtkYXRhOmJ9KX19KSxiLm9uKFwicmVzdWx0czpwcmV2aW91c1wiLGZ1bmN0aW9uKCl7dmFyIGE9ZC5nZXRIaWdobGlnaHRlZFJlc3VsdHMoKSxiPWQuJHJlc3VsdHMuZmluZChcIlthcmlhLXNlbGVjdGVkXVwiKSxjPWIuaW5kZXgoYSk7aWYoMCE9PWMpe3ZhciBlPWMtMTswPT09YS5sZW5ndGgmJihlPTApO3ZhciBmPWIuZXEoZSk7Zi50cmlnZ2VyKFwibW91c2VlbnRlclwiKTt2YXIgZz1kLiRyZXN1bHRzLm9mZnNldCgpLnRvcCxoPWYub2Zmc2V0KCkudG9wLGk9ZC4kcmVzdWx0cy5zY3JvbGxUb3AoKSsoaC1nKTswPT09ZT9kLiRyZXN1bHRzLnNjcm9sbFRvcCgwKTowPmgtZyYmZC4kcmVzdWx0cy5zY3JvbGxUb3AoaSl9fSksYi5vbihcInJlc3VsdHM6bmV4dFwiLGZ1bmN0aW9uKCl7dmFyIGE9ZC5nZXRIaWdobGlnaHRlZFJlc3VsdHMoKSxiPWQuJHJlc3VsdHMuZmluZChcIlthcmlhLXNlbGVjdGVkXVwiKSxjPWIuaW5kZXgoYSksZT1jKzE7aWYoIShlPj1iLmxlbmd0aCkpe3ZhciBmPWIuZXEoZSk7Zi50cmlnZ2VyKFwibW91c2VlbnRlclwiKTt2YXIgZz1kLiRyZXN1bHRzLm9mZnNldCgpLnRvcCtkLiRyZXN1bHRzLm91dGVySGVpZ2h0KCExKSxoPWYub2Zmc2V0KCkudG9wK2Yub3V0ZXJIZWlnaHQoITEpLGk9ZC4kcmVzdWx0cy5zY3JvbGxUb3AoKStoLWc7MD09PWU/ZC4kcmVzdWx0cy5zY3JvbGxUb3AoMCk6aD5nJiZkLiRyZXN1bHRzLnNjcm9sbFRvcChpKX19KSxiLm9uKFwicmVzdWx0czpmb2N1c1wiLGZ1bmN0aW9uKGEpe2EuZWxlbWVudC5hZGRDbGFzcyhcInNlbGVjdDItcmVzdWx0c19fb3B0aW9uLS1oaWdobGlnaHRlZFwiKX0pLGIub24oXCJyZXN1bHRzOm1lc3NhZ2VcIixmdW5jdGlvbihhKXtkLmRpc3BsYXlNZXNzYWdlKGEpfSksYS5mbi5tb3VzZXdoZWVsJiZ0aGlzLiRyZXN1bHRzLm9uKFwibW91c2V3aGVlbFwiLGZ1bmN0aW9uKGEpe3ZhciBiPWQuJHJlc3VsdHMuc2Nyb2xsVG9wKCksYz1kLiRyZXN1bHRzLmdldCgwKS5zY3JvbGxIZWlnaHQtYithLmRlbHRhWSxlPWEuZGVsdGFZPjAmJmItYS5kZWx0YVk8PTAsZj1hLmRlbHRhWTwwJiZjPD1kLiRyZXN1bHRzLmhlaWdodCgpO2U/KGQuJHJlc3VsdHMuc2Nyb2xsVG9wKDApLGEucHJldmVudERlZmF1bHQoKSxhLnN0b3BQcm9wYWdhdGlvbigpKTpmJiYoZC4kcmVzdWx0cy5zY3JvbGxUb3AoZC4kcmVzdWx0cy5nZXQoMCkuc2Nyb2xsSGVpZ2h0LWQuJHJlc3VsdHMuaGVpZ2h0KCkpLGEucHJldmVudERlZmF1bHQoKSxhLnN0b3BQcm9wYWdhdGlvbigpKX0pLHRoaXMuJHJlc3VsdHMub24oXCJtb3VzZXVwXCIsXCIuc2VsZWN0Mi1yZXN1bHRzX19vcHRpb25bYXJpYS1zZWxlY3RlZF1cIixmdW5jdGlvbihiKXt2YXIgYz1hKHRoaXMpLGU9Yy5kYXRhKFwiZGF0YVwiKTtyZXR1cm5cInRydWVcIj09PWMuYXR0cihcImFyaWEtc2VsZWN0ZWRcIik/dm9pZChkLm9wdGlvbnMuZ2V0KFwibXVsdGlwbGVcIik/ZC50cmlnZ2VyKFwidW5zZWxlY3RcIix7b3JpZ2luYWxFdmVudDpiLGRhdGE6ZX0pOmQudHJpZ2dlcihcImNsb3NlXCIse30pKTp2b2lkIGQudHJpZ2dlcihcInNlbGVjdFwiLHtvcmlnaW5hbEV2ZW50OmIsZGF0YTplfSl9KSx0aGlzLiRyZXN1bHRzLm9uKFwibW91c2VlbnRlclwiLFwiLnNlbGVjdDItcmVzdWx0c19fb3B0aW9uW2FyaWEtc2VsZWN0ZWRdXCIsZnVuY3Rpb24oYil7dmFyIGM9YSh0aGlzKS5kYXRhKFwiZGF0YVwiKTtkLmdldEhpZ2hsaWdodGVkUmVzdWx0cygpLnJlbW92ZUNsYXNzKFwic2VsZWN0Mi1yZXN1bHRzX19vcHRpb24tLWhpZ2hsaWdodGVkXCIpLGQudHJpZ2dlcihcInJlc3VsdHM6Zm9jdXNcIix7ZGF0YTpjLGVsZW1lbnQ6YSh0aGlzKX0pfSl9LGMucHJvdG90eXBlLmdldEhpZ2hsaWdodGVkUmVzdWx0cz1mdW5jdGlvbigpe3ZhciBhPXRoaXMuJHJlc3VsdHMuZmluZChcIi5zZWxlY3QyLXJlc3VsdHNfX29wdGlvbi0taGlnaGxpZ2h0ZWRcIik7cmV0dXJuIGF9LGMucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLiRyZXN1bHRzLnJlbW92ZSgpfSxjLnByb3RvdHlwZS5lbnN1cmVIaWdobGlnaHRWaXNpYmxlPWZ1bmN0aW9uKCl7dmFyIGE9dGhpcy5nZXRIaWdobGlnaHRlZFJlc3VsdHMoKTtpZigwIT09YS5sZW5ndGgpe3ZhciBiPXRoaXMuJHJlc3VsdHMuZmluZChcIlthcmlhLXNlbGVjdGVkXVwiKSxjPWIuaW5kZXgoYSksZD10aGlzLiRyZXN1bHRzLm9mZnNldCgpLnRvcCxlPWEub2Zmc2V0KCkudG9wLGY9dGhpcy4kcmVzdWx0cy5zY3JvbGxUb3AoKSsoZS1kKSxnPWUtZDtmLT0yKmEub3V0ZXJIZWlnaHQoITEpLDI+PWM/dGhpcy4kcmVzdWx0cy5zY3JvbGxUb3AoMCk6KGc+dGhpcy4kcmVzdWx0cy5vdXRlckhlaWdodCgpfHwwPmcpJiZ0aGlzLiRyZXN1bHRzLnNjcm9sbFRvcChmKX19LGMucHJvdG90eXBlLnRlbXBsYXRlPWZ1bmN0aW9uKGIsYyl7dmFyIGQ9dGhpcy5vcHRpb25zLmdldChcInRlbXBsYXRlUmVzdWx0XCIpLGU9dGhpcy5vcHRpb25zLmdldChcImVzY2FwZU1hcmt1cFwiKSxmPWQoYixjKTtudWxsPT1mP2Muc3R5bGUuZGlzcGxheT1cIm5vbmVcIjpcInN0cmluZ1wiPT10eXBlb2YgZj9jLmlubmVySFRNTD1lKGYpOmEoYykuYXBwZW5kKGYpfSxjfSksYi5kZWZpbmUoXCJzZWxlY3QyL2tleXNcIixbXSxmdW5jdGlvbigpe3ZhciBhPXtCQUNLU1BBQ0U6OCxUQUI6OSxFTlRFUjoxMyxTSElGVDoxNixDVFJMOjE3LEFMVDoxOCxFU0M6MjcsU1BBQ0U6MzIsUEFHRV9VUDozMyxQQUdFX0RPV046MzQsRU5EOjM1LEhPTUU6MzYsTEVGVDozNyxVUDozOCxSSUdIVDozOSxET1dOOjQwLERFTEVURTo0Nn07cmV0dXJuIGF9KSxiLmRlZmluZShcInNlbGVjdDIvc2VsZWN0aW9uL2Jhc2VcIixbXCJqcXVlcnlcIixcIi4uL3V0aWxzXCIsXCIuLi9rZXlzXCJdLGZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGEsYil7dGhpcy4kZWxlbWVudD1hLHRoaXMub3B0aW9ucz1iLGQuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmNhbGwodGhpcyl9cmV0dXJuIGIuRXh0ZW5kKGQsYi5PYnNlcnZhYmxlKSxkLnByb3RvdHlwZS5yZW5kZXI9ZnVuY3Rpb24oKXt2YXIgYj1hKCc8c3BhbiBjbGFzcz1cInNlbGVjdDItc2VsZWN0aW9uXCIgcm9sZT1cImNvbWJvYm94XCIgIGFyaWEtaGFzcG9wdXA9XCJ0cnVlXCIgYXJpYS1leHBhbmRlZD1cImZhbHNlXCI+PC9zcGFuPicpO3JldHVybiB0aGlzLl90YWJpbmRleD0wLG51bGwhPXRoaXMuJGVsZW1lbnQuZGF0YShcIm9sZC10YWJpbmRleFwiKT90aGlzLl90YWJpbmRleD10aGlzLiRlbGVtZW50LmRhdGEoXCJvbGQtdGFiaW5kZXhcIik6bnVsbCE9dGhpcy4kZWxlbWVudC5hdHRyKFwidGFiaW5kZXhcIikmJih0aGlzLl90YWJpbmRleD10aGlzLiRlbGVtZW50LmF0dHIoXCJ0YWJpbmRleFwiKSksYi5hdHRyKFwidGl0bGVcIix0aGlzLiRlbGVtZW50LmF0dHIoXCJ0aXRsZVwiKSksYi5hdHRyKFwidGFiaW5kZXhcIix0aGlzLl90YWJpbmRleCksdGhpcy4kc2VsZWN0aW9uPWIsYn0sZC5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihhLGIpe3ZhciBkPXRoaXMsZT0oYS5pZCtcIi1jb250YWluZXJcIixhLmlkK1wiLXJlc3VsdHNcIik7dGhpcy5jb250YWluZXI9YSx0aGlzLiRzZWxlY3Rpb24ub24oXCJmb2N1c1wiLGZ1bmN0aW9uKGEpe2QudHJpZ2dlcihcImZvY3VzXCIsYSl9KSx0aGlzLiRzZWxlY3Rpb24ub24oXCJibHVyXCIsZnVuY3Rpb24oYSl7ZC5faGFuZGxlQmx1cihhKX0pLHRoaXMuJHNlbGVjdGlvbi5vbihcImtleWRvd25cIixmdW5jdGlvbihhKXtkLnRyaWdnZXIoXCJrZXlwcmVzc1wiLGEpLGEud2hpY2g9PT1jLlNQQUNFJiZhLnByZXZlbnREZWZhdWx0KCl9KSxhLm9uKFwicmVzdWx0czpmb2N1c1wiLGZ1bmN0aW9uKGEpe2QuJHNlbGVjdGlvbi5hdHRyKFwiYXJpYS1hY3RpdmVkZXNjZW5kYW50XCIsYS5kYXRhLl9yZXN1bHRJZCl9KSxhLm9uKFwic2VsZWN0aW9uOnVwZGF0ZVwiLGZ1bmN0aW9uKGEpe2QudXBkYXRlKGEuZGF0YSl9KSxhLm9uKFwib3BlblwiLGZ1bmN0aW9uKCl7ZC4kc2VsZWN0aW9uLmF0dHIoXCJhcmlhLWV4cGFuZGVkXCIsXCJ0cnVlXCIpLGQuJHNlbGVjdGlvbi5hdHRyKFwiYXJpYS1vd25zXCIsZSksZC5fYXR0YWNoQ2xvc2VIYW5kbGVyKGEpfSksYS5vbihcImNsb3NlXCIsZnVuY3Rpb24oKXtkLiRzZWxlY3Rpb24uYXR0cihcImFyaWEtZXhwYW5kZWRcIixcImZhbHNlXCIpLGQuJHNlbGVjdGlvbi5yZW1vdmVBdHRyKFwiYXJpYS1hY3RpdmVkZXNjZW5kYW50XCIpLGQuJHNlbGVjdGlvbi5yZW1vdmVBdHRyKFwiYXJpYS1vd25zXCIpLGQuJHNlbGVjdGlvbi5mb2N1cygpLGQuX2RldGFjaENsb3NlSGFuZGxlcihhKX0pLGEub24oXCJlbmFibGVcIixmdW5jdGlvbigpe2QuJHNlbGVjdGlvbi5hdHRyKFwidGFiaW5kZXhcIixkLl90YWJpbmRleCl9KSxhLm9uKFwiZGlzYWJsZVwiLGZ1bmN0aW9uKCl7ZC4kc2VsZWN0aW9uLmF0dHIoXCJ0YWJpbmRleFwiLFwiLTFcIil9KX0sZC5wcm90b3R5cGUuX2hhbmRsZUJsdXI9ZnVuY3Rpb24oYil7dmFyIGM9dGhpczt3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe2RvY3VtZW50LmFjdGl2ZUVsZW1lbnQ9PWMuJHNlbGVjdGlvblswXXx8YS5jb250YWlucyhjLiRzZWxlY3Rpb25bMF0sZG9jdW1lbnQuYWN0aXZlRWxlbWVudCl8fGMudHJpZ2dlcihcImJsdXJcIixiKX0sMSl9LGQucHJvdG90eXBlLl9hdHRhY2hDbG9zZUhhbmRsZXI9ZnVuY3Rpb24oYil7YShkb2N1bWVudC5ib2R5KS5vbihcIm1vdXNlZG93bi5zZWxlY3QyLlwiK2IuaWQsZnVuY3Rpb24oYil7dmFyIGM9YShiLnRhcmdldCksZD1jLmNsb3Nlc3QoXCIuc2VsZWN0MlwiKSxlPWEoXCIuc2VsZWN0Mi5zZWxlY3QyLWNvbnRhaW5lci0tb3BlblwiKTtlLmVhY2goZnVuY3Rpb24oKXt2YXIgYj1hKHRoaXMpO2lmKHRoaXMhPWRbMF0pe3ZhciBjPWIuZGF0YShcImVsZW1lbnRcIik7Yy5zZWxlY3QyKFwiY2xvc2VcIil9fSl9KX0sZC5wcm90b3R5cGUuX2RldGFjaENsb3NlSGFuZGxlcj1mdW5jdGlvbihiKXthKGRvY3VtZW50LmJvZHkpLm9mZihcIm1vdXNlZG93bi5zZWxlY3QyLlwiK2IuaWQpfSxkLnByb3RvdHlwZS5wb3NpdGlvbj1mdW5jdGlvbihhLGIpe3ZhciBjPWIuZmluZChcIi5zZWxlY3Rpb25cIik7Yy5hcHBlbmQoYSl9LGQucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLl9kZXRhY2hDbG9zZUhhbmRsZXIodGhpcy5jb250YWluZXIpfSxkLnByb3RvdHlwZS51cGRhdGU9ZnVuY3Rpb24oYSl7dGhyb3cgbmV3IEVycm9yKFwiVGhlIGB1cGRhdGVgIG1ldGhvZCBtdXN0IGJlIGRlZmluZWQgaW4gY2hpbGQgY2xhc3Nlcy5cIil9LGR9KSxiLmRlZmluZShcInNlbGVjdDIvc2VsZWN0aW9uL3NpbmdsZVwiLFtcImpxdWVyeVwiLFwiLi9iYXNlXCIsXCIuLi91dGlsc1wiLFwiLi4va2V5c1wiXSxmdW5jdGlvbihhLGIsYyxkKXtmdW5jdGlvbiBlKCl7ZS5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcyxhcmd1bWVudHMpfXJldHVybiBjLkV4dGVuZChlLGIpLGUucHJvdG90eXBlLnJlbmRlcj1mdW5jdGlvbigpe3ZhciBhPWUuX19zdXBlcl9fLnJlbmRlci5jYWxsKHRoaXMpO3JldHVybiBhLmFkZENsYXNzKFwic2VsZWN0Mi1zZWxlY3Rpb24tLXNpbmdsZVwiKSxhLmh0bWwoJzxzcGFuIGNsYXNzPVwic2VsZWN0Mi1zZWxlY3Rpb25fX3JlbmRlcmVkXCI+PC9zcGFuPjxzcGFuIGNsYXNzPVwic2VsZWN0Mi1zZWxlY3Rpb25fX2Fycm93XCIgcm9sZT1cInByZXNlbnRhdGlvblwiPjxiIHJvbGU9XCJwcmVzZW50YXRpb25cIj48L2I+PC9zcGFuPicpLGF9LGUucHJvdG90eXBlLmJpbmQ9ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzO2UuX19zdXBlcl9fLmJpbmQuYXBwbHkodGhpcyxhcmd1bWVudHMpO3ZhciBkPWEuaWQrXCItY29udGFpbmVyXCI7dGhpcy4kc2VsZWN0aW9uLmZpbmQoXCIuc2VsZWN0Mi1zZWxlY3Rpb25fX3JlbmRlcmVkXCIpLmF0dHIoXCJpZFwiLGQpLHRoaXMuJHNlbGVjdGlvbi5hdHRyKFwiYXJpYS1sYWJlbGxlZGJ5XCIsZCksdGhpcy4kc2VsZWN0aW9uLm9uKFwibW91c2Vkb3duXCIsZnVuY3Rpb24oYSl7MT09PWEud2hpY2gmJmMudHJpZ2dlcihcInRvZ2dsZVwiLHtvcmlnaW5hbEV2ZW50OmF9KX0pLHRoaXMuJHNlbGVjdGlvbi5vbihcImZvY3VzXCIsZnVuY3Rpb24oYSl7fSksdGhpcy4kc2VsZWN0aW9uLm9uKFwiYmx1clwiLGZ1bmN0aW9uKGEpe30pLGEub24oXCJmb2N1c1wiLGZ1bmN0aW9uKGIpe2EuaXNPcGVuKCl8fGMuJHNlbGVjdGlvbi5mb2N1cygpfSksYS5vbihcInNlbGVjdGlvbjp1cGRhdGVcIixmdW5jdGlvbihhKXtjLnVwZGF0ZShhLmRhdGEpfSl9LGUucHJvdG90eXBlLmNsZWFyPWZ1bmN0aW9uKCl7dGhpcy4kc2VsZWN0aW9uLmZpbmQoXCIuc2VsZWN0Mi1zZWxlY3Rpb25fX3JlbmRlcmVkXCIpLmVtcHR5KCl9LGUucHJvdG90eXBlLmRpc3BsYXk9ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzLm9wdGlvbnMuZ2V0KFwidGVtcGxhdGVTZWxlY3Rpb25cIiksZD10aGlzLm9wdGlvbnMuZ2V0KFwiZXNjYXBlTWFya3VwXCIpO3JldHVybiBkKGMoYSxiKSl9LGUucHJvdG90eXBlLnNlbGVjdGlvbkNvbnRhaW5lcj1mdW5jdGlvbigpe3JldHVybiBhKFwiPHNwYW4+PC9zcGFuPlwiKX0sZS5wcm90b3R5cGUudXBkYXRlPWZ1bmN0aW9uKGEpe2lmKDA9PT1hLmxlbmd0aClyZXR1cm4gdm9pZCB0aGlzLmNsZWFyKCk7dmFyIGI9YVswXSxjPXRoaXMuJHNlbGVjdGlvbi5maW5kKFwiLnNlbGVjdDItc2VsZWN0aW9uX19yZW5kZXJlZFwiKSxkPXRoaXMuZGlzcGxheShiLGMpO2MuZW1wdHkoKS5hcHBlbmQoZCksYy5wcm9wKFwidGl0bGVcIixiLnRpdGxlfHxiLnRleHQpfSxlfSksYi5kZWZpbmUoXCJzZWxlY3QyL3NlbGVjdGlvbi9tdWx0aXBsZVwiLFtcImpxdWVyeVwiLFwiLi9iYXNlXCIsXCIuLi91dGlsc1wiXSxmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZChhLGIpe2QuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsYXJndW1lbnRzKX1yZXR1cm4gYy5FeHRlbmQoZCxiKSxkLnByb3RvdHlwZS5yZW5kZXI9ZnVuY3Rpb24oKXt2YXIgYT1kLl9fc3VwZXJfXy5yZW5kZXIuY2FsbCh0aGlzKTtyZXR1cm4gYS5hZGRDbGFzcyhcInNlbGVjdDItc2VsZWN0aW9uLS1tdWx0aXBsZVwiKSxhLmh0bWwoJzx1bCBjbGFzcz1cInNlbGVjdDItc2VsZWN0aW9uX19yZW5kZXJlZFwiPjwvdWw+JyksYX0sZC5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihiLGMpe3ZhciBlPXRoaXM7ZC5fX3N1cGVyX18uYmluZC5hcHBseSh0aGlzLGFyZ3VtZW50cyksdGhpcy4kc2VsZWN0aW9uLm9uKFwiY2xpY2tcIixmdW5jdGlvbihhKXtlLnRyaWdnZXIoXCJ0b2dnbGVcIix7b3JpZ2luYWxFdmVudDphfSl9KSx0aGlzLiRzZWxlY3Rpb24ub24oXCJjbGlja1wiLFwiLnNlbGVjdDItc2VsZWN0aW9uX19jaG9pY2VfX3JlbW92ZVwiLGZ1bmN0aW9uKGIpe2lmKCFlLm9wdGlvbnMuZ2V0KFwiZGlzYWJsZWRcIikpe3ZhciBjPWEodGhpcyksZD1jLnBhcmVudCgpLGY9ZC5kYXRhKFwiZGF0YVwiKTtlLnRyaWdnZXIoXCJ1bnNlbGVjdFwiLHtvcmlnaW5hbEV2ZW50OmIsZGF0YTpmfSl9fSl9LGQucHJvdG90eXBlLmNsZWFyPWZ1bmN0aW9uKCl7dGhpcy4kc2VsZWN0aW9uLmZpbmQoXCIuc2VsZWN0Mi1zZWxlY3Rpb25fX3JlbmRlcmVkXCIpLmVtcHR5KCl9LGQucHJvdG90eXBlLmRpc3BsYXk9ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzLm9wdGlvbnMuZ2V0KFwidGVtcGxhdGVTZWxlY3Rpb25cIiksZD10aGlzLm9wdGlvbnMuZ2V0KFwiZXNjYXBlTWFya3VwXCIpO3JldHVybiBkKGMoYSxiKSl9LGQucHJvdG90eXBlLnNlbGVjdGlvbkNvbnRhaW5lcj1mdW5jdGlvbigpe3ZhciBiPWEoJzxsaSBjbGFzcz1cInNlbGVjdDItc2VsZWN0aW9uX19jaG9pY2VcIj48c3BhbiBjbGFzcz1cInNlbGVjdDItc2VsZWN0aW9uX19jaG9pY2VfX3JlbW92ZVwiIHJvbGU9XCJwcmVzZW50YXRpb25cIj4mdGltZXM7PC9zcGFuPjwvbGk+Jyk7cmV0dXJuIGJ9LGQucHJvdG90eXBlLnVwZGF0ZT1mdW5jdGlvbihhKXtpZih0aGlzLmNsZWFyKCksMCE9PWEubGVuZ3RoKXtmb3IodmFyIGI9W10sZD0wO2Q8YS5sZW5ndGg7ZCsrKXt2YXIgZT1hW2RdLGY9dGhpcy5zZWxlY3Rpb25Db250YWluZXIoKSxnPXRoaXMuZGlzcGxheShlLGYpO2YuYXBwZW5kKGcpLGYucHJvcChcInRpdGxlXCIsZS50aXRsZXx8ZS50ZXh0KSxmLmRhdGEoXCJkYXRhXCIsZSksYi5wdXNoKGYpfXZhciBoPXRoaXMuJHNlbGVjdGlvbi5maW5kKFwiLnNlbGVjdDItc2VsZWN0aW9uX19yZW5kZXJlZFwiKTtjLmFwcGVuZE1hbnkoaCxiKX19LGR9KSxiLmRlZmluZShcInNlbGVjdDIvc2VsZWN0aW9uL3BsYWNlaG9sZGVyXCIsW1wiLi4vdXRpbHNcIl0sZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYihhLGIsYyl7dGhpcy5wbGFjZWhvbGRlcj10aGlzLm5vcm1hbGl6ZVBsYWNlaG9sZGVyKGMuZ2V0KFwicGxhY2Vob2xkZXJcIikpLGEuY2FsbCh0aGlzLGIsYyl9cmV0dXJuIGIucHJvdG90eXBlLm5vcm1hbGl6ZVBsYWNlaG9sZGVyPWZ1bmN0aW9uKGEsYil7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIGImJihiPXtpZDpcIlwiLHRleHQ6Yn0pLGJ9LGIucHJvdG90eXBlLmNyZWF0ZVBsYWNlaG9sZGVyPWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcy5zZWxlY3Rpb25Db250YWluZXIoKTtyZXR1cm4gYy5odG1sKHRoaXMuZGlzcGxheShiKSksYy5hZGRDbGFzcyhcInNlbGVjdDItc2VsZWN0aW9uX19wbGFjZWhvbGRlclwiKS5yZW1vdmVDbGFzcyhcInNlbGVjdDItc2VsZWN0aW9uX19jaG9pY2VcIiksY30sYi5wcm90b3R5cGUudXBkYXRlPWZ1bmN0aW9uKGEsYil7dmFyIGM9MT09Yi5sZW5ndGgmJmJbMF0uaWQhPXRoaXMucGxhY2Vob2xkZXIuaWQsZD1iLmxlbmd0aD4xO2lmKGR8fGMpcmV0dXJuIGEuY2FsbCh0aGlzLGIpO3RoaXMuY2xlYXIoKTt2YXIgZT10aGlzLmNyZWF0ZVBsYWNlaG9sZGVyKHRoaXMucGxhY2Vob2xkZXIpO3RoaXMuJHNlbGVjdGlvbi5maW5kKFwiLnNlbGVjdDItc2VsZWN0aW9uX19yZW5kZXJlZFwiKS5hcHBlbmQoZSl9LGJ9KSxiLmRlZmluZShcInNlbGVjdDIvc2VsZWN0aW9uL2FsbG93Q2xlYXJcIixbXCJqcXVlcnlcIixcIi4uL2tleXNcIl0sZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKCl7fXJldHVybiBjLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGEsYixjKXt2YXIgZD10aGlzO2EuY2FsbCh0aGlzLGIsYyksbnVsbD09dGhpcy5wbGFjZWhvbGRlciYmdGhpcy5vcHRpb25zLmdldChcImRlYnVnXCIpJiZ3aW5kb3cuY29uc29sZSYmY29uc29sZS5lcnJvciYmY29uc29sZS5lcnJvcihcIlNlbGVjdDI6IFRoZSBgYWxsb3dDbGVhcmAgb3B0aW9uIHNob3VsZCBiZSB1c2VkIGluIGNvbWJpbmF0aW9uIHdpdGggdGhlIGBwbGFjZWhvbGRlcmAgb3B0aW9uLlwiKSx0aGlzLiRzZWxlY3Rpb24ub24oXCJtb3VzZWRvd25cIixcIi5zZWxlY3QyLXNlbGVjdGlvbl9fY2xlYXJcIixmdW5jdGlvbihhKXtkLl9oYW5kbGVDbGVhcihhKX0pLGIub24oXCJrZXlwcmVzc1wiLGZ1bmN0aW9uKGEpe2QuX2hhbmRsZUtleWJvYXJkQ2xlYXIoYSxiKX0pfSxjLnByb3RvdHlwZS5faGFuZGxlQ2xlYXI9ZnVuY3Rpb24oYSxiKXtpZighdGhpcy5vcHRpb25zLmdldChcImRpc2FibGVkXCIpKXt2YXIgYz10aGlzLiRzZWxlY3Rpb24uZmluZChcIi5zZWxlY3QyLXNlbGVjdGlvbl9fY2xlYXJcIik7aWYoMCE9PWMubGVuZ3RoKXtiLnN0b3BQcm9wYWdhdGlvbigpO2Zvcih2YXIgZD1jLmRhdGEoXCJkYXRhXCIpLGU9MDtlPGQubGVuZ3RoO2UrKyl7dmFyIGY9e2RhdGE6ZFtlXX07aWYodGhpcy50cmlnZ2VyKFwidW5zZWxlY3RcIixmKSxmLnByZXZlbnRlZClyZXR1cm59dGhpcy4kZWxlbWVudC52YWwodGhpcy5wbGFjZWhvbGRlci5pZCkudHJpZ2dlcihcImNoYW5nZVwiKSx0aGlzLnRyaWdnZXIoXCJ0b2dnbGVcIix7fSl9fX0sYy5wcm90b3R5cGUuX2hhbmRsZUtleWJvYXJkQ2xlYXI9ZnVuY3Rpb24oYSxjLGQpe2QuaXNPcGVuKCl8fChjLndoaWNoPT1iLkRFTEVURXx8Yy53aGljaD09Yi5CQUNLU1BBQ0UpJiZ0aGlzLl9oYW5kbGVDbGVhcihjKX0sYy5wcm90b3R5cGUudXBkYXRlPWZ1bmN0aW9uKGIsYyl7aWYoYi5jYWxsKHRoaXMsYyksISh0aGlzLiRzZWxlY3Rpb24uZmluZChcIi5zZWxlY3QyLXNlbGVjdGlvbl9fcGxhY2Vob2xkZXJcIikubGVuZ3RoPjB8fDA9PT1jLmxlbmd0aCkpe3ZhciBkPWEoJzxzcGFuIGNsYXNzPVwic2VsZWN0Mi1zZWxlY3Rpb25fX2NsZWFyXCI+JnRpbWVzOzwvc3Bhbj4nKTtkLmRhdGEoXCJkYXRhXCIsYyksdGhpcy4kc2VsZWN0aW9uLmZpbmQoXCIuc2VsZWN0Mi1zZWxlY3Rpb25fX3JlbmRlcmVkXCIpLnByZXBlbmQoZCl9fSxjfSksYi5kZWZpbmUoXCJzZWxlY3QyL3NlbGVjdGlvbi9zZWFyY2hcIixbXCJqcXVlcnlcIixcIi4uL3V0aWxzXCIsXCIuLi9rZXlzXCJdLGZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGEsYixjKXthLmNhbGwodGhpcyxiLGMpfXJldHVybiBkLnByb3RvdHlwZS5yZW5kZXI9ZnVuY3Rpb24oYil7dmFyIGM9YSgnPGxpIGNsYXNzPVwic2VsZWN0Mi1zZWFyY2ggc2VsZWN0Mi1zZWFyY2gtLWlubGluZVwiPjxpbnB1dCBjbGFzcz1cInNlbGVjdDItc2VhcmNoX19maWVsZFwiIHR5cGU9XCJzZWFyY2hcIiB0YWJpbmRleD1cIi0xXCIgYXV0b2NvbXBsZXRlPVwib2ZmXCIgYXV0b2NvcnJlY3Q9XCJvZmZcIiBhdXRvY2FwaXRhbGl6ZT1cIm9mZlwiIHNwZWxsY2hlY2s9XCJmYWxzZVwiIHJvbGU9XCJ0ZXh0Ym94XCIgYXJpYS1hdXRvY29tcGxldGU9XCJsaXN0XCIgLz48L2xpPicpO3RoaXMuJHNlYXJjaENvbnRhaW5lcj1jLHRoaXMuJHNlYXJjaD1jLmZpbmQoXCJpbnB1dFwiKTt2YXIgZD1iLmNhbGwodGhpcyk7cmV0dXJuIHRoaXMuX3RyYW5zZmVyVGFiSW5kZXgoKSxkfSxkLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGEsYixkKXt2YXIgZT10aGlzO2EuY2FsbCh0aGlzLGIsZCksYi5vbihcIm9wZW5cIixmdW5jdGlvbigpe2UuJHNlYXJjaC50cmlnZ2VyKFwiZm9jdXNcIil9KSxiLm9uKFwiY2xvc2VcIixmdW5jdGlvbigpe2UuJHNlYXJjaC52YWwoXCJcIiksZS4kc2VhcmNoLnJlbW92ZUF0dHIoXCJhcmlhLWFjdGl2ZWRlc2NlbmRhbnRcIiksZS4kc2VhcmNoLnRyaWdnZXIoXCJmb2N1c1wiKX0pLGIub24oXCJlbmFibGVcIixmdW5jdGlvbigpe2UuJHNlYXJjaC5wcm9wKFwiZGlzYWJsZWRcIiwhMSksZS5fdHJhbnNmZXJUYWJJbmRleCgpfSksYi5vbihcImRpc2FibGVcIixmdW5jdGlvbigpe2UuJHNlYXJjaC5wcm9wKFwiZGlzYWJsZWRcIiwhMCl9KSxiLm9uKFwiZm9jdXNcIixmdW5jdGlvbihhKXtlLiRzZWFyY2gudHJpZ2dlcihcImZvY3VzXCIpfSksYi5vbihcInJlc3VsdHM6Zm9jdXNcIixmdW5jdGlvbihhKXtlLiRzZWFyY2guYXR0cihcImFyaWEtYWN0aXZlZGVzY2VuZGFudFwiLGEuaWQpfSksdGhpcy4kc2VsZWN0aW9uLm9uKFwiZm9jdXNpblwiLFwiLnNlbGVjdDItc2VhcmNoLS1pbmxpbmVcIixmdW5jdGlvbihhKXtlLnRyaWdnZXIoXCJmb2N1c1wiLGEpfSksdGhpcy4kc2VsZWN0aW9uLm9uKFwiZm9jdXNvdXRcIixcIi5zZWxlY3QyLXNlYXJjaC0taW5saW5lXCIsZnVuY3Rpb24oYSl7ZS5faGFuZGxlQmx1cihhKX0pLHRoaXMuJHNlbGVjdGlvbi5vbihcImtleWRvd25cIixcIi5zZWxlY3QyLXNlYXJjaC0taW5saW5lXCIsZnVuY3Rpb24oYSl7YS5zdG9wUHJvcGFnYXRpb24oKSxlLnRyaWdnZXIoXCJrZXlwcmVzc1wiLGEpLGUuX2tleVVwUHJldmVudGVkPWEuaXNEZWZhdWx0UHJldmVudGVkKCk7dmFyIGI9YS53aGljaDtpZihiPT09Yy5CQUNLU1BBQ0UmJlwiXCI9PT1lLiRzZWFyY2gudmFsKCkpe3ZhciBkPWUuJHNlYXJjaENvbnRhaW5lci5wcmV2KFwiLnNlbGVjdDItc2VsZWN0aW9uX19jaG9pY2VcIik7aWYoZC5sZW5ndGg+MCl7dmFyIGY9ZC5kYXRhKFwiZGF0YVwiKTtlLnNlYXJjaFJlbW92ZUNob2ljZShmKSxhLnByZXZlbnREZWZhdWx0KCl9fX0pO3ZhciBmPWRvY3VtZW50LmRvY3VtZW50TW9kZSxnPWYmJjExPj1mO3RoaXMuJHNlbGVjdGlvbi5vbihcImlucHV0LnNlYXJjaGNoZWNrXCIsXCIuc2VsZWN0Mi1zZWFyY2gtLWlubGluZVwiLGZ1bmN0aW9uKGEpe3JldHVybiBnP3ZvaWQgZS4kc2VsZWN0aW9uLm9mZihcImlucHV0LnNlYXJjaCBpbnB1dC5zZWFyY2hjaGVja1wiKTp2b2lkIGUuJHNlbGVjdGlvbi5vZmYoXCJrZXl1cC5zZWFyY2hcIil9KSx0aGlzLiRzZWxlY3Rpb24ub24oXCJrZXl1cC5zZWFyY2ggaW5wdXQuc2VhcmNoXCIsXCIuc2VsZWN0Mi1zZWFyY2gtLWlubGluZVwiLGZ1bmN0aW9uKGEpe2lmKGcmJlwiaW5wdXRcIj09PWEudHlwZSlyZXR1cm4gdm9pZCBlLiRzZWxlY3Rpb24ub2ZmKFwiaW5wdXQuc2VhcmNoIGlucHV0LnNlYXJjaGNoZWNrXCIpO3ZhciBiPWEud2hpY2g7YiE9Yy5TSElGVCYmYiE9Yy5DVFJMJiZiIT1jLkFMVCYmYiE9Yy5UQUImJmUuaGFuZGxlU2VhcmNoKGEpfSl9LGQucHJvdG90eXBlLl90cmFuc2ZlclRhYkluZGV4PWZ1bmN0aW9uKGEpe3RoaXMuJHNlYXJjaC5hdHRyKFwidGFiaW5kZXhcIix0aGlzLiRzZWxlY3Rpb24uYXR0cihcInRhYmluZGV4XCIpKSx0aGlzLiRzZWxlY3Rpb24uYXR0cihcInRhYmluZGV4XCIsXCItMVwiKX0sZC5wcm90b3R5cGUuY3JlYXRlUGxhY2Vob2xkZXI9ZnVuY3Rpb24oYSxiKXt0aGlzLiRzZWFyY2guYXR0cihcInBsYWNlaG9sZGVyXCIsYi50ZXh0KX0sZC5wcm90b3R5cGUudXBkYXRlPWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcy4kc2VhcmNoWzBdPT1kb2N1bWVudC5hY3RpdmVFbGVtZW50O3RoaXMuJHNlYXJjaC5hdHRyKFwicGxhY2Vob2xkZXJcIixcIlwiKSxhLmNhbGwodGhpcyxiKSx0aGlzLiRzZWxlY3Rpb24uZmluZChcIi5zZWxlY3QyLXNlbGVjdGlvbl9fcmVuZGVyZWRcIikuYXBwZW5kKHRoaXMuJHNlYXJjaENvbnRhaW5lciksdGhpcy5yZXNpemVTZWFyY2goKSxjJiZ0aGlzLiRzZWFyY2guZm9jdXMoKX0sZC5wcm90b3R5cGUuaGFuZGxlU2VhcmNoPWZ1bmN0aW9uKCl7aWYodGhpcy5yZXNpemVTZWFyY2goKSwhdGhpcy5fa2V5VXBQcmV2ZW50ZWQpe3ZhciBhPXRoaXMuJHNlYXJjaC52YWwoKTt0aGlzLnRyaWdnZXIoXCJxdWVyeVwiLHt0ZXJtOmF9KX10aGlzLl9rZXlVcFByZXZlbnRlZD0hMX0sZC5wcm90b3R5cGUuc2VhcmNoUmVtb3ZlQ2hvaWNlPWZ1bmN0aW9uKGEsYil7dGhpcy50cmlnZ2VyKFwidW5zZWxlY3RcIix7ZGF0YTpifSksdGhpcy4kc2VhcmNoLnZhbChiLnRleHQpLHRoaXMuaGFuZGxlU2VhcmNoKCl9LGQucHJvdG90eXBlLnJlc2l6ZVNlYXJjaD1mdW5jdGlvbigpe3RoaXMuJHNlYXJjaC5jc3MoXCJ3aWR0aFwiLFwiMjVweFwiKTt2YXIgYT1cIlwiO2lmKFwiXCIhPT10aGlzLiRzZWFyY2guYXR0cihcInBsYWNlaG9sZGVyXCIpKWE9dGhpcy4kc2VsZWN0aW9uLmZpbmQoXCIuc2VsZWN0Mi1zZWxlY3Rpb25fX3JlbmRlcmVkXCIpLmlubmVyV2lkdGgoKTtlbHNle3ZhciBiPXRoaXMuJHNlYXJjaC52YWwoKS5sZW5ndGgrMTthPS43NSpiK1wiZW1cIn10aGlzLiRzZWFyY2guY3NzKFwid2lkdGhcIixhKX0sZH0pLGIuZGVmaW5lKFwic2VsZWN0Mi9zZWxlY3Rpb24vZXZlbnRSZWxheVwiLFtcImpxdWVyeVwiXSxmdW5jdGlvbihhKXtmdW5jdGlvbiBiKCl7fXJldHVybiBiLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGIsYyxkKXt2YXIgZT10aGlzLGY9W1wib3BlblwiLFwib3BlbmluZ1wiLFwiY2xvc2VcIixcImNsb3NpbmdcIixcInNlbGVjdFwiLFwic2VsZWN0aW5nXCIsXCJ1bnNlbGVjdFwiLFwidW5zZWxlY3RpbmdcIl0sZz1bXCJvcGVuaW5nXCIsXCJjbG9zaW5nXCIsXCJzZWxlY3RpbmdcIixcInVuc2VsZWN0aW5nXCJdO2IuY2FsbCh0aGlzLGMsZCksYy5vbihcIipcIixmdW5jdGlvbihiLGMpe2lmKC0xIT09YS5pbkFycmF5KGIsZikpe2M9Y3x8e307dmFyIGQ9YS5FdmVudChcInNlbGVjdDI6XCIrYix7cGFyYW1zOmN9KTtlLiRlbGVtZW50LnRyaWdnZXIoZCksLTEhPT1hLmluQXJyYXkoYixnKSYmKGMucHJldmVudGVkPWQuaXNEZWZhdWx0UHJldmVudGVkKCkpfX0pfSxifSksYi5kZWZpbmUoXCJzZWxlY3QyL3RyYW5zbGF0aW9uXCIsW1wianF1ZXJ5XCIsXCJyZXF1aXJlXCJdLGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhhKXt0aGlzLmRpY3Q9YXx8e319cmV0dXJuIGMucHJvdG90eXBlLmFsbD1mdW5jdGlvbigpe3JldHVybiB0aGlzLmRpY3R9LGMucHJvdG90eXBlLmdldD1mdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5kaWN0W2FdfSxjLnByb3RvdHlwZS5leHRlbmQ9ZnVuY3Rpb24oYil7dGhpcy5kaWN0PWEuZXh0ZW5kKHt9LGIuYWxsKCksdGhpcy5kaWN0KX0sYy5fY2FjaGU9e30sYy5sb2FkUGF0aD1mdW5jdGlvbihhKXtpZighKGEgaW4gYy5fY2FjaGUpKXt2YXIgZD1iKGEpO2MuX2NhY2hlW2FdPWR9cmV0dXJuIG5ldyBjKGMuX2NhY2hlW2FdKX0sY30pLGIuZGVmaW5lKFwic2VsZWN0Mi9kaWFjcml0aWNzXCIsW10sZnVuY3Rpb24oKXt2YXIgYT17XCLikrZcIjpcIkFcIixcIu+8oVwiOlwiQVwiLFwiw4BcIjpcIkFcIixcIsOBXCI6XCJBXCIsXCLDglwiOlwiQVwiLFwi4bqmXCI6XCJBXCIsXCLhuqRcIjpcIkFcIixcIuG6qlwiOlwiQVwiLFwi4bqoXCI6XCJBXCIsXCLDg1wiOlwiQVwiLFwixIBcIjpcIkFcIixcIsSCXCI6XCJBXCIsXCLhurBcIjpcIkFcIixcIuG6rlwiOlwiQVwiLFwi4bq0XCI6XCJBXCIsXCLhurJcIjpcIkFcIixcIsimXCI6XCJBXCIsXCLHoFwiOlwiQVwiLFwiw4RcIjpcIkFcIixcIseeXCI6XCJBXCIsXCLhuqJcIjpcIkFcIixcIsOFXCI6XCJBXCIsXCLHulwiOlwiQVwiLFwix41cIjpcIkFcIixcIsiAXCI6XCJBXCIsXCLIglwiOlwiQVwiLFwi4bqgXCI6XCJBXCIsXCLhuqxcIjpcIkFcIixcIuG6tlwiOlwiQVwiLFwi4biAXCI6XCJBXCIsXCLEhFwiOlwiQVwiLFwiyLpcIjpcIkFcIixcIuKxr1wiOlwiQVwiLFwi6pyyXCI6XCJBQVwiLFwiw4ZcIjpcIkFFXCIsXCLHvFwiOlwiQUVcIixcIseiXCI6XCJBRVwiLFwi6py0XCI6XCJBT1wiLFwi6py2XCI6XCJBVVwiLFwi6py4XCI6XCJBVlwiLFwi6py6XCI6XCJBVlwiLFwi6py8XCI6XCJBWVwiLFwi4pK3XCI6XCJCXCIsXCLvvKJcIjpcIkJcIixcIuG4glwiOlwiQlwiLFwi4biEXCI6XCJCXCIsXCLhuIZcIjpcIkJcIixcIsmDXCI6XCJCXCIsXCLGglwiOlwiQlwiLFwixoFcIjpcIkJcIixcIuKSuFwiOlwiQ1wiLFwi77yjXCI6XCJDXCIsXCLEhlwiOlwiQ1wiLFwixIhcIjpcIkNcIixcIsSKXCI6XCJDXCIsXCLEjFwiOlwiQ1wiLFwiw4dcIjpcIkNcIixcIuG4iFwiOlwiQ1wiLFwixodcIjpcIkNcIixcIsi7XCI6XCJDXCIsXCLqnL5cIjpcIkNcIixcIuKSuVwiOlwiRFwiLFwi77ykXCI6XCJEXCIsXCLhuIpcIjpcIkRcIixcIsSOXCI6XCJEXCIsXCLhuIxcIjpcIkRcIixcIuG4kFwiOlwiRFwiLFwi4biSXCI6XCJEXCIsXCLhuI5cIjpcIkRcIixcIsSQXCI6XCJEXCIsXCLGi1wiOlwiRFwiLFwixopcIjpcIkRcIixcIsaJXCI6XCJEXCIsXCLqnblcIjpcIkRcIixcIsexXCI6XCJEWlwiLFwix4RcIjpcIkRaXCIsXCLHslwiOlwiRHpcIixcIseFXCI6XCJEelwiLFwi4pK6XCI6XCJFXCIsXCLvvKVcIjpcIkVcIixcIsOIXCI6XCJFXCIsXCLDiVwiOlwiRVwiLFwiw4pcIjpcIkVcIixcIuG7gFwiOlwiRVwiLFwi4bq+XCI6XCJFXCIsXCLhu4RcIjpcIkVcIixcIuG7glwiOlwiRVwiLFwi4bq8XCI6XCJFXCIsXCLEklwiOlwiRVwiLFwi4biUXCI6XCJFXCIsXCLhuJZcIjpcIkVcIixcIsSUXCI6XCJFXCIsXCLEllwiOlwiRVwiLFwiw4tcIjpcIkVcIixcIuG6ulwiOlwiRVwiLFwixJpcIjpcIkVcIixcIsiEXCI6XCJFXCIsXCLIhlwiOlwiRVwiLFwi4bq4XCI6XCJFXCIsXCLhu4ZcIjpcIkVcIixcIsioXCI6XCJFXCIsXCLhuJxcIjpcIkVcIixcIsSYXCI6XCJFXCIsXCLhuJhcIjpcIkVcIixcIuG4mlwiOlwiRVwiLFwixpBcIjpcIkVcIixcIsaOXCI6XCJFXCIsXCLikrtcIjpcIkZcIixcIu+8plwiOlwiRlwiLFwi4bieXCI6XCJGXCIsXCLGkVwiOlwiRlwiLFwi6p27XCI6XCJGXCIsXCLikrxcIjpcIkdcIixcIu+8p1wiOlwiR1wiLFwix7RcIjpcIkdcIixcIsScXCI6XCJHXCIsXCLhuKBcIjpcIkdcIixcIsSeXCI6XCJHXCIsXCLEoFwiOlwiR1wiLFwix6ZcIjpcIkdcIixcIsSiXCI6XCJHXCIsXCLHpFwiOlwiR1wiLFwixpNcIjpcIkdcIixcIuqeoFwiOlwiR1wiLFwi6p29XCI6XCJHXCIsXCLqnb5cIjpcIkdcIixcIuKSvVwiOlwiSFwiLFwi77yoXCI6XCJIXCIsXCLEpFwiOlwiSFwiLFwi4biiXCI6XCJIXCIsXCLhuKZcIjpcIkhcIixcIsieXCI6XCJIXCIsXCLhuKRcIjpcIkhcIixcIuG4qFwiOlwiSFwiLFwi4biqXCI6XCJIXCIsXCLEplwiOlwiSFwiLFwi4rGnXCI6XCJIXCIsXCLisbVcIjpcIkhcIixcIuqejVwiOlwiSFwiLFwi4pK+XCI6XCJJXCIsXCLvvKlcIjpcIklcIixcIsOMXCI6XCJJXCIsXCLDjVwiOlwiSVwiLFwiw45cIjpcIklcIixcIsSoXCI6XCJJXCIsXCLEqlwiOlwiSVwiLFwixKxcIjpcIklcIixcIsSwXCI6XCJJXCIsXCLDj1wiOlwiSVwiLFwi4biuXCI6XCJJXCIsXCLhu4hcIjpcIklcIixcIsePXCI6XCJJXCIsXCLIiFwiOlwiSVwiLFwiyIpcIjpcIklcIixcIuG7ilwiOlwiSVwiLFwixK5cIjpcIklcIixcIuG4rFwiOlwiSVwiLFwixpdcIjpcIklcIixcIuKSv1wiOlwiSlwiLFwi77yqXCI6XCJKXCIsXCLEtFwiOlwiSlwiLFwiyYhcIjpcIkpcIixcIuKTgFwiOlwiS1wiLFwi77yrXCI6XCJLXCIsXCLhuLBcIjpcIktcIixcIseoXCI6XCJLXCIsXCLhuLJcIjpcIktcIixcIsS2XCI6XCJLXCIsXCLhuLRcIjpcIktcIixcIsaYXCI6XCJLXCIsXCLisalcIjpcIktcIixcIuqdgFwiOlwiS1wiLFwi6p2CXCI6XCJLXCIsXCLqnYRcIjpcIktcIixcIuqeolwiOlwiS1wiLFwi4pOBXCI6XCJMXCIsXCLvvKxcIjpcIkxcIixcIsS/XCI6XCJMXCIsXCLEuVwiOlwiTFwiLFwixL1cIjpcIkxcIixcIuG4tlwiOlwiTFwiLFwi4bi4XCI6XCJMXCIsXCLEu1wiOlwiTFwiLFwi4bi8XCI6XCJMXCIsXCLhuLpcIjpcIkxcIixcIsWBXCI6XCJMXCIsXCLIvVwiOlwiTFwiLFwi4rGiXCI6XCJMXCIsXCLisaBcIjpcIkxcIixcIuqdiFwiOlwiTFwiLFwi6p2GXCI6XCJMXCIsXCLqnoBcIjpcIkxcIixcIseHXCI6XCJMSlwiLFwix4hcIjpcIkxqXCIsXCLik4JcIjpcIk1cIixcIu+8rVwiOlwiTVwiLFwi4bi+XCI6XCJNXCIsXCLhuYBcIjpcIk1cIixcIuG5glwiOlwiTVwiLFwi4rGuXCI6XCJNXCIsXCLGnFwiOlwiTVwiLFwi4pODXCI6XCJOXCIsXCLvvK5cIjpcIk5cIixcIse4XCI6XCJOXCIsXCLFg1wiOlwiTlwiLFwiw5FcIjpcIk5cIixcIuG5hFwiOlwiTlwiLFwixYdcIjpcIk5cIixcIuG5hlwiOlwiTlwiLFwixYVcIjpcIk5cIixcIuG5ilwiOlwiTlwiLFwi4bmIXCI6XCJOXCIsXCLIoFwiOlwiTlwiLFwixp1cIjpcIk5cIixcIuqekFwiOlwiTlwiLFwi6p6kXCI6XCJOXCIsXCLHilwiOlwiTkpcIixcIseLXCI6XCJOalwiLFwi4pOEXCI6XCJPXCIsXCLvvK9cIjpcIk9cIixcIsOSXCI6XCJPXCIsXCLDk1wiOlwiT1wiLFwiw5RcIjpcIk9cIixcIuG7klwiOlwiT1wiLFwi4buQXCI6XCJPXCIsXCLhu5ZcIjpcIk9cIixcIuG7lFwiOlwiT1wiLFwiw5VcIjpcIk9cIixcIuG5jFwiOlwiT1wiLFwiyKxcIjpcIk9cIixcIuG5jlwiOlwiT1wiLFwixYxcIjpcIk9cIixcIuG5kFwiOlwiT1wiLFwi4bmSXCI6XCJPXCIsXCLFjlwiOlwiT1wiLFwiyK5cIjpcIk9cIixcIsiwXCI6XCJPXCIsXCLDllwiOlwiT1wiLFwiyKpcIjpcIk9cIixcIuG7jlwiOlwiT1wiLFwixZBcIjpcIk9cIixcIseRXCI6XCJPXCIsXCLIjFwiOlwiT1wiLFwiyI5cIjpcIk9cIixcIsagXCI6XCJPXCIsXCLhu5xcIjpcIk9cIixcIuG7mlwiOlwiT1wiLFwi4bugXCI6XCJPXCIsXCLhu55cIjpcIk9cIixcIuG7olwiOlwiT1wiLFwi4buMXCI6XCJPXCIsXCLhu5hcIjpcIk9cIixcIseqXCI6XCJPXCIsXCLHrFwiOlwiT1wiLFwiw5hcIjpcIk9cIixcIse+XCI6XCJPXCIsXCLGhlwiOlwiT1wiLFwixp9cIjpcIk9cIixcIuqdilwiOlwiT1wiLFwi6p2MXCI6XCJPXCIsXCLGolwiOlwiT0lcIixcIuqdjlwiOlwiT09cIixcIsiiXCI6XCJPVVwiLFwi4pOFXCI6XCJQXCIsXCLvvLBcIjpcIlBcIixcIuG5lFwiOlwiUFwiLFwi4bmWXCI6XCJQXCIsXCLGpFwiOlwiUFwiLFwi4rGjXCI6XCJQXCIsXCLqnZBcIjpcIlBcIixcIuqdklwiOlwiUFwiLFwi6p2UXCI6XCJQXCIsXCLik4ZcIjpcIlFcIixcIu+8sVwiOlwiUVwiLFwi6p2WXCI6XCJRXCIsXCLqnZhcIjpcIlFcIixcIsmKXCI6XCJRXCIsXCLik4dcIjpcIlJcIixcIu+8slwiOlwiUlwiLFwixZRcIjpcIlJcIixcIuG5mFwiOlwiUlwiLFwixZhcIjpcIlJcIixcIsiQXCI6XCJSXCIsXCLIklwiOlwiUlwiLFwi4bmaXCI6XCJSXCIsXCLhuZxcIjpcIlJcIixcIsWWXCI6XCJSXCIsXCLhuZ5cIjpcIlJcIixcIsmMXCI6XCJSXCIsXCLisaRcIjpcIlJcIixcIuqdmlwiOlwiUlwiLFwi6p6mXCI6XCJSXCIsXCLqnoJcIjpcIlJcIixcIuKTiFwiOlwiU1wiLFwi77yzXCI6XCJTXCIsXCLhup5cIjpcIlNcIixcIsWaXCI6XCJTXCIsXCLhuaRcIjpcIlNcIixcIsWcXCI6XCJTXCIsXCLhuaBcIjpcIlNcIixcIsWgXCI6XCJTXCIsXCLhuaZcIjpcIlNcIixcIuG5olwiOlwiU1wiLFwi4bmoXCI6XCJTXCIsXCLImFwiOlwiU1wiLFwixZ5cIjpcIlNcIixcIuKxvlwiOlwiU1wiLFwi6p6oXCI6XCJTXCIsXCLqnoRcIjpcIlNcIixcIuKTiVwiOlwiVFwiLFwi77y0XCI6XCJUXCIsXCLhuapcIjpcIlRcIixcIsWkXCI6XCJUXCIsXCLhuaxcIjpcIlRcIixcIsiaXCI6XCJUXCIsXCLFolwiOlwiVFwiLFwi4bmwXCI6XCJUXCIsXCLhua5cIjpcIlRcIixcIsWmXCI6XCJUXCIsXCLGrFwiOlwiVFwiLFwixq5cIjpcIlRcIixcIsi+XCI6XCJUXCIsXCLqnoZcIjpcIlRcIixcIuqcqFwiOlwiVFpcIixcIuKTilwiOlwiVVwiLFwi77y1XCI6XCJVXCIsXCLDmVwiOlwiVVwiLFwiw5pcIjpcIlVcIixcIsObXCI6XCJVXCIsXCLFqFwiOlwiVVwiLFwi4bm4XCI6XCJVXCIsXCLFqlwiOlwiVVwiLFwi4bm6XCI6XCJVXCIsXCLFrFwiOlwiVVwiLFwiw5xcIjpcIlVcIixcIsebXCI6XCJVXCIsXCLHl1wiOlwiVVwiLFwix5VcIjpcIlVcIixcIseZXCI6XCJVXCIsXCLhu6ZcIjpcIlVcIixcIsWuXCI6XCJVXCIsXCLFsFwiOlwiVVwiLFwix5NcIjpcIlVcIixcIsiUXCI6XCJVXCIsXCLIllwiOlwiVVwiLFwixq9cIjpcIlVcIixcIuG7qlwiOlwiVVwiLFwi4buoXCI6XCJVXCIsXCLhu65cIjpcIlVcIixcIuG7rFwiOlwiVVwiLFwi4buwXCI6XCJVXCIsXCLhu6RcIjpcIlVcIixcIuG5slwiOlwiVVwiLFwixbJcIjpcIlVcIixcIuG5tlwiOlwiVVwiLFwi4bm0XCI6XCJVXCIsXCLJhFwiOlwiVVwiLFwi4pOLXCI6XCJWXCIsXCLvvLZcIjpcIlZcIixcIuG5vFwiOlwiVlwiLFwi4bm+XCI6XCJWXCIsXCLGslwiOlwiVlwiLFwi6p2eXCI6XCJWXCIsXCLJhVwiOlwiVlwiLFwi6p2gXCI6XCJWWVwiLFwi4pOMXCI6XCJXXCIsXCLvvLdcIjpcIldcIixcIuG6gFwiOlwiV1wiLFwi4bqCXCI6XCJXXCIsXCLFtFwiOlwiV1wiLFwi4bqGXCI6XCJXXCIsXCLhuoRcIjpcIldcIixcIuG6iFwiOlwiV1wiLFwi4rGyXCI6XCJXXCIsXCLik41cIjpcIlhcIixcIu+8uFwiOlwiWFwiLFwi4bqKXCI6XCJYXCIsXCLhuoxcIjpcIlhcIixcIuKTjlwiOlwiWVwiLFwi77y5XCI6XCJZXCIsXCLhu7JcIjpcIllcIixcIsOdXCI6XCJZXCIsXCLFtlwiOlwiWVwiLFwi4bu4XCI6XCJZXCIsXCLIslwiOlwiWVwiLFwi4bqOXCI6XCJZXCIsXCLFuFwiOlwiWVwiLFwi4bu2XCI6XCJZXCIsXCLhu7RcIjpcIllcIixcIsazXCI6XCJZXCIsXCLJjlwiOlwiWVwiLFwi4bu+XCI6XCJZXCIsXCLik49cIjpcIlpcIixcIu+8ulwiOlwiWlwiLFwixblcIjpcIlpcIixcIuG6kFwiOlwiWlwiLFwixbtcIjpcIlpcIixcIsW9XCI6XCJaXCIsXCLhupJcIjpcIlpcIixcIuG6lFwiOlwiWlwiLFwixrVcIjpcIlpcIixcIsikXCI6XCJaXCIsXCLisb9cIjpcIlpcIixcIuKxq1wiOlwiWlwiLFwi6p2iXCI6XCJaXCIsXCLik5BcIjpcImFcIixcIu+9gVwiOlwiYVwiLFwi4bqaXCI6XCJhXCIsXCLDoFwiOlwiYVwiLFwiw6FcIjpcImFcIixcIsOiXCI6XCJhXCIsXCLhuqdcIjpcImFcIixcIuG6pVwiOlwiYVwiLFwi4bqrXCI6XCJhXCIsXCLhuqlcIjpcImFcIixcIsOjXCI6XCJhXCIsXCLEgVwiOlwiYVwiLFwixINcIjpcImFcIixcIuG6sVwiOlwiYVwiLFwi4bqvXCI6XCJhXCIsXCLhurVcIjpcImFcIixcIuG6s1wiOlwiYVwiLFwiyKdcIjpcImFcIixcIsehXCI6XCJhXCIsXCLDpFwiOlwiYVwiLFwix59cIjpcImFcIixcIuG6o1wiOlwiYVwiLFwiw6VcIjpcImFcIixcIse7XCI6XCJhXCIsXCLHjlwiOlwiYVwiLFwiyIFcIjpcImFcIixcIsiDXCI6XCJhXCIsXCLhuqFcIjpcImFcIixcIuG6rVwiOlwiYVwiLFwi4bq3XCI6XCJhXCIsXCLhuIFcIjpcImFcIixcIsSFXCI6XCJhXCIsXCLisaVcIjpcImFcIixcIsmQXCI6XCJhXCIsXCLqnLNcIjpcImFhXCIsXCLDplwiOlwiYWVcIixcIse9XCI6XCJhZVwiLFwix6NcIjpcImFlXCIsXCLqnLVcIjpcImFvXCIsXCLqnLdcIjpcImF1XCIsXCLqnLlcIjpcImF2XCIsXCLqnLtcIjpcImF2XCIsXCLqnL1cIjpcImF5XCIsXCLik5FcIjpcImJcIixcIu+9glwiOlwiYlwiLFwi4biDXCI6XCJiXCIsXCLhuIVcIjpcImJcIixcIuG4h1wiOlwiYlwiLFwixoBcIjpcImJcIixcIsaDXCI6XCJiXCIsXCLJk1wiOlwiYlwiLFwi4pOSXCI6XCJjXCIsXCLvvYNcIjpcImNcIixcIsSHXCI6XCJjXCIsXCLEiVwiOlwiY1wiLFwixItcIjpcImNcIixcIsSNXCI6XCJjXCIsXCLDp1wiOlwiY1wiLFwi4biJXCI6XCJjXCIsXCLGiFwiOlwiY1wiLFwiyLxcIjpcImNcIixcIuqcv1wiOlwiY1wiLFwi4oaEXCI6XCJjXCIsXCLik5NcIjpcImRcIixcIu+9hFwiOlwiZFwiLFwi4biLXCI6XCJkXCIsXCLEj1wiOlwiZFwiLFwi4biNXCI6XCJkXCIsXCLhuJFcIjpcImRcIixcIuG4k1wiOlwiZFwiLFwi4biPXCI6XCJkXCIsXCLEkVwiOlwiZFwiLFwixoxcIjpcImRcIixcIsmWXCI6XCJkXCIsXCLJl1wiOlwiZFwiLFwi6p26XCI6XCJkXCIsXCLHs1wiOlwiZHpcIixcIseGXCI6XCJkelwiLFwi4pOUXCI6XCJlXCIsXCLvvYVcIjpcImVcIixcIsOoXCI6XCJlXCIsXCLDqVwiOlwiZVwiLFwiw6pcIjpcImVcIixcIuG7gVwiOlwiZVwiLFwi4bq/XCI6XCJlXCIsXCLhu4VcIjpcImVcIixcIuG7g1wiOlwiZVwiLFwi4bq9XCI6XCJlXCIsXCLEk1wiOlwiZVwiLFwi4biVXCI6XCJlXCIsXCLhuJdcIjpcImVcIixcIsSVXCI6XCJlXCIsXCLEl1wiOlwiZVwiLFwiw6tcIjpcImVcIixcIuG6u1wiOlwiZVwiLFwixJtcIjpcImVcIixcIsiFXCI6XCJlXCIsXCLIh1wiOlwiZVwiLFwi4bq5XCI6XCJlXCIsXCLhu4dcIjpcImVcIixcIsipXCI6XCJlXCIsXCLhuJ1cIjpcImVcIixcIsSZXCI6XCJlXCIsXCLhuJlcIjpcImVcIixcIuG4m1wiOlwiZVwiLFwiyYdcIjpcImVcIixcIsmbXCI6XCJlXCIsXCLHnVwiOlwiZVwiLFwi4pOVXCI6XCJmXCIsXCLvvYZcIjpcImZcIixcIuG4n1wiOlwiZlwiLFwixpJcIjpcImZcIixcIuqdvFwiOlwiZlwiLFwi4pOWXCI6XCJnXCIsXCLvvYdcIjpcImdcIixcIse1XCI6XCJnXCIsXCLEnVwiOlwiZ1wiLFwi4bihXCI6XCJnXCIsXCLEn1wiOlwiZ1wiLFwixKFcIjpcImdcIixcIsenXCI6XCJnXCIsXCLEo1wiOlwiZ1wiLFwix6VcIjpcImdcIixcIsmgXCI6XCJnXCIsXCLqnqFcIjpcImdcIixcIuG1uVwiOlwiZ1wiLFwi6p2/XCI6XCJnXCIsXCLik5dcIjpcImhcIixcIu+9iFwiOlwiaFwiLFwixKVcIjpcImhcIixcIuG4o1wiOlwiaFwiLFwi4binXCI6XCJoXCIsXCLIn1wiOlwiaFwiLFwi4bilXCI6XCJoXCIsXCLhuKlcIjpcImhcIixcIuG4q1wiOlwiaFwiLFwi4bqWXCI6XCJoXCIsXCLEp1wiOlwiaFwiLFwi4rGoXCI6XCJoXCIsXCLisbZcIjpcImhcIixcIsmlXCI6XCJoXCIsXCLGlVwiOlwiaHZcIixcIuKTmFwiOlwiaVwiLFwi772JXCI6XCJpXCIsXCLDrFwiOlwiaVwiLFwiw61cIjpcImlcIixcIsOuXCI6XCJpXCIsXCLEqVwiOlwiaVwiLFwixKtcIjpcImlcIixcIsStXCI6XCJpXCIsXCLDr1wiOlwiaVwiLFwi4bivXCI6XCJpXCIsXCLhu4lcIjpcImlcIixcIseQXCI6XCJpXCIsXCLIiVwiOlwiaVwiLFwiyItcIjpcImlcIixcIuG7i1wiOlwiaVwiLFwixK9cIjpcImlcIixcIuG4rVwiOlwiaVwiLFwiyahcIjpcImlcIixcIsSxXCI6XCJpXCIsXCLik5lcIjpcImpcIixcIu+9ilwiOlwialwiLFwixLVcIjpcImpcIixcIsewXCI6XCJqXCIsXCLJiVwiOlwialwiLFwi4pOaXCI6XCJrXCIsXCLvvYtcIjpcImtcIixcIuG4sVwiOlwia1wiLFwix6lcIjpcImtcIixcIuG4s1wiOlwia1wiLFwixLdcIjpcImtcIixcIuG4tVwiOlwia1wiLFwixplcIjpcImtcIixcIuKxqlwiOlwia1wiLFwi6p2BXCI6XCJrXCIsXCLqnYNcIjpcImtcIixcIuqdhVwiOlwia1wiLFwi6p6jXCI6XCJrXCIsXCLik5tcIjpcImxcIixcIu+9jFwiOlwibFwiLFwixYBcIjpcImxcIixcIsS6XCI6XCJsXCIsXCLEvlwiOlwibFwiLFwi4bi3XCI6XCJsXCIsXCLhuLlcIjpcImxcIixcIsS8XCI6XCJsXCIsXCLhuL1cIjpcImxcIixcIuG4u1wiOlwibFwiLFwixb9cIjpcImxcIixcIsWCXCI6XCJsXCIsXCLGmlwiOlwibFwiLFwiyatcIjpcImxcIixcIuKxoVwiOlwibFwiLFwi6p2JXCI6XCJsXCIsXCLqnoFcIjpcImxcIixcIuqdh1wiOlwibFwiLFwix4lcIjpcImxqXCIsXCLik5xcIjpcIm1cIixcIu+9jVwiOlwibVwiLFwi4bi/XCI6XCJtXCIsXCLhuYFcIjpcIm1cIixcIuG5g1wiOlwibVwiLFwiybFcIjpcIm1cIixcIsmvXCI6XCJtXCIsXCLik51cIjpcIm5cIixcIu+9jlwiOlwiblwiLFwix7lcIjpcIm5cIixcIsWEXCI6XCJuXCIsXCLDsVwiOlwiblwiLFwi4bmFXCI6XCJuXCIsXCLFiFwiOlwiblwiLFwi4bmHXCI6XCJuXCIsXCLFhlwiOlwiblwiLFwi4bmLXCI6XCJuXCIsXCLhuYlcIjpcIm5cIixcIsaeXCI6XCJuXCIsXCLJslwiOlwiblwiLFwixYlcIjpcIm5cIixcIuqekVwiOlwiblwiLFwi6p6lXCI6XCJuXCIsXCLHjFwiOlwibmpcIixcIuKTnlwiOlwib1wiLFwi772PXCI6XCJvXCIsXCLDslwiOlwib1wiLFwiw7NcIjpcIm9cIixcIsO0XCI6XCJvXCIsXCLhu5NcIjpcIm9cIixcIuG7kVwiOlwib1wiLFwi4buXXCI6XCJvXCIsXCLhu5VcIjpcIm9cIixcIsO1XCI6XCJvXCIsXCLhuY1cIjpcIm9cIixcIsitXCI6XCJvXCIsXCLhuY9cIjpcIm9cIixcIsWNXCI6XCJvXCIsXCLhuZFcIjpcIm9cIixcIuG5k1wiOlwib1wiLFwixY9cIjpcIm9cIixcIsivXCI6XCJvXCIsXCLIsVwiOlwib1wiLFwiw7ZcIjpcIm9cIixcIsirXCI6XCJvXCIsXCLhu49cIjpcIm9cIixcIsWRXCI6XCJvXCIsXCLHklwiOlwib1wiLFwiyI1cIjpcIm9cIixcIsiPXCI6XCJvXCIsXCLGoVwiOlwib1wiLFwi4budXCI6XCJvXCIsXCLhu5tcIjpcIm9cIixcIuG7oVwiOlwib1wiLFwi4bufXCI6XCJvXCIsXCLhu6NcIjpcIm9cIixcIuG7jVwiOlwib1wiLFwi4buZXCI6XCJvXCIsXCLHq1wiOlwib1wiLFwix61cIjpcIm9cIixcIsO4XCI6XCJvXCIsXCLHv1wiOlwib1wiLFwiyZRcIjpcIm9cIixcIuqdi1wiOlwib1wiLFwi6p2NXCI6XCJvXCIsXCLJtVwiOlwib1wiLFwixqNcIjpcIm9pXCIsXCLIo1wiOlwib3VcIixcIuqdj1wiOlwib29cIixcIuKTn1wiOlwicFwiLFwi772QXCI6XCJwXCIsXCLhuZVcIjpcInBcIixcIuG5l1wiOlwicFwiLFwixqVcIjpcInBcIixcIuG1vVwiOlwicFwiLFwi6p2RXCI6XCJwXCIsXCLqnZNcIjpcInBcIixcIuqdlVwiOlwicFwiLFwi4pOgXCI6XCJxXCIsXCLvvZFcIjpcInFcIixcIsmLXCI6XCJxXCIsXCLqnZdcIjpcInFcIixcIuqdmVwiOlwicVwiLFwi4pOhXCI6XCJyXCIsXCLvvZJcIjpcInJcIixcIsWVXCI6XCJyXCIsXCLhuZlcIjpcInJcIixcIsWZXCI6XCJyXCIsXCLIkVwiOlwiclwiLFwiyJNcIjpcInJcIixcIuG5m1wiOlwiclwiLFwi4bmdXCI6XCJyXCIsXCLFl1wiOlwiclwiLFwi4bmfXCI6XCJyXCIsXCLJjVwiOlwiclwiLFwiyb1cIjpcInJcIixcIuqdm1wiOlwiclwiLFwi6p6nXCI6XCJyXCIsXCLqnoNcIjpcInJcIixcIuKTolwiOlwic1wiLFwi772TXCI6XCJzXCIsXCLDn1wiOlwic1wiLFwixZtcIjpcInNcIixcIuG5pVwiOlwic1wiLFwixZ1cIjpcInNcIixcIuG5oVwiOlwic1wiLFwixaFcIjpcInNcIixcIuG5p1wiOlwic1wiLFwi4bmjXCI6XCJzXCIsXCLhualcIjpcInNcIixcIsiZXCI6XCJzXCIsXCLFn1wiOlwic1wiLFwiyL9cIjpcInNcIixcIuqeqVwiOlwic1wiLFwi6p6FXCI6XCJzXCIsXCLhuptcIjpcInNcIixcIuKTo1wiOlwidFwiLFwi772UXCI6XCJ0XCIsXCLhuatcIjpcInRcIixcIuG6l1wiOlwidFwiLFwixaVcIjpcInRcIixcIuG5rVwiOlwidFwiLFwiyJtcIjpcInRcIixcIsWjXCI6XCJ0XCIsXCLhubFcIjpcInRcIixcIuG5r1wiOlwidFwiLFwixadcIjpcInRcIixcIsatXCI6XCJ0XCIsXCLKiFwiOlwidFwiLFwi4rGmXCI6XCJ0XCIsXCLqnodcIjpcInRcIixcIuqcqVwiOlwidHpcIixcIuKTpFwiOlwidVwiLFwi772VXCI6XCJ1XCIsXCLDuVwiOlwidVwiLFwiw7pcIjpcInVcIixcIsO7XCI6XCJ1XCIsXCLFqVwiOlwidVwiLFwi4bm5XCI6XCJ1XCIsXCLFq1wiOlwidVwiLFwi4bm7XCI6XCJ1XCIsXCLFrVwiOlwidVwiLFwiw7xcIjpcInVcIixcIsecXCI6XCJ1XCIsXCLHmFwiOlwidVwiLFwix5ZcIjpcInVcIixcIseaXCI6XCJ1XCIsXCLhu6dcIjpcInVcIixcIsWvXCI6XCJ1XCIsXCLFsVwiOlwidVwiLFwix5RcIjpcInVcIixcIsiVXCI6XCJ1XCIsXCLIl1wiOlwidVwiLFwixrBcIjpcInVcIixcIuG7q1wiOlwidVwiLFwi4bupXCI6XCJ1XCIsXCLhu69cIjpcInVcIixcIuG7rVwiOlwidVwiLFwi4buxXCI6XCJ1XCIsXCLhu6VcIjpcInVcIixcIuG5s1wiOlwidVwiLFwixbNcIjpcInVcIixcIuG5t1wiOlwidVwiLFwi4bm1XCI6XCJ1XCIsXCLKiVwiOlwidVwiLFwi4pOlXCI6XCJ2XCIsXCLvvZZcIjpcInZcIixcIuG5vVwiOlwidlwiLFwi4bm/XCI6XCJ2XCIsXCLKi1wiOlwidlwiLFwi6p2fXCI6XCJ2XCIsXCLKjFwiOlwidlwiLFwi6p2hXCI6XCJ2eVwiLFwi4pOmXCI6XCJ3XCIsXCLvvZdcIjpcIndcIixcIuG6gVwiOlwid1wiLFwi4bqDXCI6XCJ3XCIsXCLFtVwiOlwid1wiLFwi4bqHXCI6XCJ3XCIsXCLhuoVcIjpcIndcIixcIuG6mFwiOlwid1wiLFwi4bqJXCI6XCJ3XCIsXCLisbNcIjpcIndcIixcIuKTp1wiOlwieFwiLFwi772YXCI6XCJ4XCIsXCLhuotcIjpcInhcIixcIuG6jVwiOlwieFwiLFwi4pOoXCI6XCJ5XCIsXCLvvZlcIjpcInlcIixcIuG7s1wiOlwieVwiLFwiw71cIjpcInlcIixcIsW3XCI6XCJ5XCIsXCLhu7lcIjpcInlcIixcIsizXCI6XCJ5XCIsXCLhuo9cIjpcInlcIixcIsO/XCI6XCJ5XCIsXCLhu7dcIjpcInlcIixcIuG6mVwiOlwieVwiLFwi4bu1XCI6XCJ5XCIsXCLGtFwiOlwieVwiLFwiyY9cIjpcInlcIixcIuG7v1wiOlwieVwiLFwi4pOpXCI6XCJ6XCIsXCLvvZpcIjpcInpcIixcIsW6XCI6XCJ6XCIsXCLhupFcIjpcInpcIixcIsW8XCI6XCJ6XCIsXCLFvlwiOlwielwiLFwi4bqTXCI6XCJ6XCIsXCLhupVcIjpcInpcIixcIsa2XCI6XCJ6XCIsXCLIpVwiOlwielwiLFwiyYBcIjpcInpcIixcIuKxrFwiOlwielwiLFwi6p2jXCI6XCJ6XCIsXCLOhlwiOlwizpFcIixcIs6IXCI6XCLOlVwiLFwizolcIjpcIs6XXCIsXCLOilwiOlwizplcIixcIs6qXCI6XCLOmVwiLFwizoxcIjpcIs6fXCIsXCLOjlwiOlwizqVcIixcIs6rXCI6XCLOpVwiLFwizo9cIjpcIs6pXCIsXCLOrFwiOlwizrFcIixcIs6tXCI6XCLOtVwiLFwizq5cIjpcIs63XCIsXCLOr1wiOlwizrlcIixcIs+KXCI6XCLOuVwiLFwizpBcIjpcIs65XCIsXCLPjFwiOlwizr9cIixcIs+NXCI6XCLPhVwiLFwiz4tcIjpcIs+FXCIsXCLOsFwiOlwiz4VcIixcIs+JXCI6XCLPiVwiLFwiz4JcIjpcIs+DXCJ9O3JldHVybiBhfSksYi5kZWZpbmUoXCJzZWxlY3QyL2RhdGEvYmFzZVwiLFtcIi4uL3V0aWxzXCJdLGZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoYSxjKXtiLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMpfXJldHVybiBhLkV4dGVuZChiLGEuT2JzZXJ2YWJsZSksYi5wcm90b3R5cGUuY3VycmVudD1mdW5jdGlvbihhKXt0aHJvdyBuZXcgRXJyb3IoXCJUaGUgYGN1cnJlbnRgIG1ldGhvZCBtdXN0IGJlIGRlZmluZWQgaW4gY2hpbGQgY2xhc3Nlcy5cIil9LGIucHJvdG90eXBlLnF1ZXJ5PWZ1bmN0aW9uKGEsYil7dGhyb3cgbmV3IEVycm9yKFwiVGhlIGBxdWVyeWAgbWV0aG9kIG11c3QgYmUgZGVmaW5lZCBpbiBjaGlsZCBjbGFzc2VzLlwiKX0sYi5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihhLGIpe30sYi5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe30sYi5wcm90b3R5cGUuZ2VuZXJhdGVSZXN1bHRJZD1mdW5jdGlvbihiLGMpe3ZhciBkPWIuaWQrXCItcmVzdWx0LVwiO3JldHVybiBkKz1hLmdlbmVyYXRlQ2hhcnMoNCksZCs9bnVsbCE9Yy5pZD9cIi1cIitjLmlkLnRvU3RyaW5nKCk6XCItXCIrYS5nZW5lcmF0ZUNoYXJzKDQpfSxifSksYi5kZWZpbmUoXCJzZWxlY3QyL2RhdGEvc2VsZWN0XCIsW1wiLi9iYXNlXCIsXCIuLi91dGlsc1wiLFwianF1ZXJ5XCJdLGZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGEsYil7dGhpcy4kZWxlbWVudD1hLHRoaXMub3B0aW9ucz1iLGQuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmNhbGwodGhpcyl9cmV0dXJuIGIuRXh0ZW5kKGQsYSksZC5wcm90b3R5cGUuY3VycmVudD1mdW5jdGlvbihhKXt2YXIgYj1bXSxkPXRoaXM7dGhpcy4kZWxlbWVudC5maW5kKFwiOnNlbGVjdGVkXCIpLmVhY2goZnVuY3Rpb24oKXt2YXIgYT1jKHRoaXMpLGU9ZC5pdGVtKGEpO2IucHVzaChlKX0pLGEoYil9LGQucHJvdG90eXBlLnNlbGVjdD1mdW5jdGlvbihhKXt2YXIgYj10aGlzO2lmKGEuc2VsZWN0ZWQ9ITAsYyhhLmVsZW1lbnQpLmlzKFwib3B0aW9uXCIpKXJldHVybiBhLmVsZW1lbnQuc2VsZWN0ZWQ9ITAsdm9pZCB0aGlzLiRlbGVtZW50LnRyaWdnZXIoXCJjaGFuZ2VcIik7XG5pZih0aGlzLiRlbGVtZW50LnByb3AoXCJtdWx0aXBsZVwiKSl0aGlzLmN1cnJlbnQoZnVuY3Rpb24oZCl7dmFyIGU9W107YT1bYV0sYS5wdXNoLmFwcGx5KGEsZCk7Zm9yKHZhciBmPTA7ZjxhLmxlbmd0aDtmKyspe3ZhciBnPWFbZl0uaWQ7LTE9PT1jLmluQXJyYXkoZyxlKSYmZS5wdXNoKGcpfWIuJGVsZW1lbnQudmFsKGUpLGIuJGVsZW1lbnQudHJpZ2dlcihcImNoYW5nZVwiKX0pO2Vsc2V7dmFyIGQ9YS5pZDt0aGlzLiRlbGVtZW50LnZhbChkKSx0aGlzLiRlbGVtZW50LnRyaWdnZXIoXCJjaGFuZ2VcIil9fSxkLnByb3RvdHlwZS51bnNlbGVjdD1mdW5jdGlvbihhKXt2YXIgYj10aGlzO2lmKHRoaXMuJGVsZW1lbnQucHJvcChcIm11bHRpcGxlXCIpKXJldHVybiBhLnNlbGVjdGVkPSExLGMoYS5lbGVtZW50KS5pcyhcIm9wdGlvblwiKT8oYS5lbGVtZW50LnNlbGVjdGVkPSExLHZvaWQgdGhpcy4kZWxlbWVudC50cmlnZ2VyKFwiY2hhbmdlXCIpKTp2b2lkIHRoaXMuY3VycmVudChmdW5jdGlvbihkKXtmb3IodmFyIGU9W10sZj0wO2Y8ZC5sZW5ndGg7ZisrKXt2YXIgZz1kW2ZdLmlkO2chPT1hLmlkJiYtMT09PWMuaW5BcnJheShnLGUpJiZlLnB1c2goZyl9Yi4kZWxlbWVudC52YWwoZSksYi4kZWxlbWVudC50cmlnZ2VyKFwiY2hhbmdlXCIpfSl9LGQucHJvdG90eXBlLmJpbmQ9ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzO3RoaXMuY29udGFpbmVyPWEsYS5vbihcInNlbGVjdFwiLGZ1bmN0aW9uKGEpe2Muc2VsZWN0KGEuZGF0YSl9KSxhLm9uKFwidW5zZWxlY3RcIixmdW5jdGlvbihhKXtjLnVuc2VsZWN0KGEuZGF0YSl9KX0sZC5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe3RoaXMuJGVsZW1lbnQuZmluZChcIipcIikuZWFjaChmdW5jdGlvbigpe2MucmVtb3ZlRGF0YSh0aGlzLFwiZGF0YVwiKX0pfSxkLnByb3RvdHlwZS5xdWVyeT1mdW5jdGlvbihhLGIpe3ZhciBkPVtdLGU9dGhpcyxmPXRoaXMuJGVsZW1lbnQuY2hpbGRyZW4oKTtmLmVhY2goZnVuY3Rpb24oKXt2YXIgYj1jKHRoaXMpO2lmKGIuaXMoXCJvcHRpb25cIil8fGIuaXMoXCJvcHRncm91cFwiKSl7dmFyIGY9ZS5pdGVtKGIpLGc9ZS5tYXRjaGVzKGEsZik7bnVsbCE9PWcmJmQucHVzaChnKX19KSxiKHtyZXN1bHRzOmR9KX0sZC5wcm90b3R5cGUuYWRkT3B0aW9ucz1mdW5jdGlvbihhKXtiLmFwcGVuZE1hbnkodGhpcy4kZWxlbWVudCxhKX0sZC5wcm90b3R5cGUub3B0aW9uPWZ1bmN0aW9uKGEpe3ZhciBiO2EuY2hpbGRyZW4/KGI9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9wdGdyb3VwXCIpLGIubGFiZWw9YS50ZXh0KTooYj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpLHZvaWQgMCE9PWIudGV4dENvbnRlbnQ/Yi50ZXh0Q29udGVudD1hLnRleHQ6Yi5pbm5lclRleHQ9YS50ZXh0KSxhLmlkJiYoYi52YWx1ZT1hLmlkKSxhLmRpc2FibGVkJiYoYi5kaXNhYmxlZD0hMCksYS5zZWxlY3RlZCYmKGIuc2VsZWN0ZWQ9ITApLGEudGl0bGUmJihiLnRpdGxlPWEudGl0bGUpO3ZhciBkPWMoYiksZT10aGlzLl9ub3JtYWxpemVJdGVtKGEpO3JldHVybiBlLmVsZW1lbnQ9YixjLmRhdGEoYixcImRhdGFcIixlKSxkfSxkLnByb3RvdHlwZS5pdGVtPWZ1bmN0aW9uKGEpe3ZhciBiPXt9O2lmKGI9Yy5kYXRhKGFbMF0sXCJkYXRhXCIpLG51bGwhPWIpcmV0dXJuIGI7aWYoYS5pcyhcIm9wdGlvblwiKSliPXtpZDphLnZhbCgpLHRleHQ6YS50ZXh0KCksZGlzYWJsZWQ6YS5wcm9wKFwiZGlzYWJsZWRcIiksc2VsZWN0ZWQ6YS5wcm9wKFwic2VsZWN0ZWRcIiksdGl0bGU6YS5wcm9wKFwidGl0bGVcIil9O2Vsc2UgaWYoYS5pcyhcIm9wdGdyb3VwXCIpKXtiPXt0ZXh0OmEucHJvcChcImxhYmVsXCIpLGNoaWxkcmVuOltdLHRpdGxlOmEucHJvcChcInRpdGxlXCIpfTtmb3IodmFyIGQ9YS5jaGlsZHJlbihcIm9wdGlvblwiKSxlPVtdLGY9MDtmPGQubGVuZ3RoO2YrKyl7dmFyIGc9YyhkW2ZdKSxoPXRoaXMuaXRlbShnKTtlLnB1c2goaCl9Yi5jaGlsZHJlbj1lfXJldHVybiBiPXRoaXMuX25vcm1hbGl6ZUl0ZW0oYiksYi5lbGVtZW50PWFbMF0sYy5kYXRhKGFbMF0sXCJkYXRhXCIsYiksYn0sZC5wcm90b3R5cGUuX25vcm1hbGl6ZUl0ZW09ZnVuY3Rpb24oYSl7Yy5pc1BsYWluT2JqZWN0KGEpfHwoYT17aWQ6YSx0ZXh0OmF9KSxhPWMuZXh0ZW5kKHt9LHt0ZXh0OlwiXCJ9LGEpO3ZhciBiPXtzZWxlY3RlZDohMSxkaXNhYmxlZDohMX07cmV0dXJuIG51bGwhPWEuaWQmJihhLmlkPWEuaWQudG9TdHJpbmcoKSksbnVsbCE9YS50ZXh0JiYoYS50ZXh0PWEudGV4dC50b1N0cmluZygpKSxudWxsPT1hLl9yZXN1bHRJZCYmYS5pZCYmbnVsbCE9dGhpcy5jb250YWluZXImJihhLl9yZXN1bHRJZD10aGlzLmdlbmVyYXRlUmVzdWx0SWQodGhpcy5jb250YWluZXIsYSkpLGMuZXh0ZW5kKHt9LGIsYSl9LGQucHJvdG90eXBlLm1hdGNoZXM9ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzLm9wdGlvbnMuZ2V0KFwibWF0Y2hlclwiKTtyZXR1cm4gYyhhLGIpfSxkfSksYi5kZWZpbmUoXCJzZWxlY3QyL2RhdGEvYXJyYXlcIixbXCIuL3NlbGVjdFwiLFwiLi4vdXRpbHNcIixcImpxdWVyeVwiXSxmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZChhLGIpe3ZhciBjPWIuZ2V0KFwiZGF0YVwiKXx8W107ZC5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzLGEsYiksdGhpcy5hZGRPcHRpb25zKHRoaXMuY29udmVydFRvT3B0aW9ucyhjKSl9cmV0dXJuIGIuRXh0ZW5kKGQsYSksZC5wcm90b3R5cGUuc2VsZWN0PWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMuJGVsZW1lbnQuZmluZChcIm9wdGlvblwiKS5maWx0ZXIoZnVuY3Rpb24oYixjKXtyZXR1cm4gYy52YWx1ZT09YS5pZC50b1N0cmluZygpfSk7MD09PWIubGVuZ3RoJiYoYj10aGlzLm9wdGlvbihhKSx0aGlzLmFkZE9wdGlvbnMoYikpLGQuX19zdXBlcl9fLnNlbGVjdC5jYWxsKHRoaXMsYSl9LGQucHJvdG90eXBlLmNvbnZlcnRUb09wdGlvbnM9ZnVuY3Rpb24oYSl7ZnVuY3Rpb24gZChhKXtyZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gYyh0aGlzKS52YWwoKT09YS5pZH19Zm9yKHZhciBlPXRoaXMsZj10aGlzLiRlbGVtZW50LmZpbmQoXCJvcHRpb25cIiksZz1mLm1hcChmdW5jdGlvbigpe3JldHVybiBlLml0ZW0oYyh0aGlzKSkuaWR9KS5nZXQoKSxoPVtdLGk9MDtpPGEubGVuZ3RoO2krKyl7dmFyIGo9dGhpcy5fbm9ybWFsaXplSXRlbShhW2ldKTtpZihjLmluQXJyYXkoai5pZCxnKT49MCl7dmFyIGs9Zi5maWx0ZXIoZChqKSksbD10aGlzLml0ZW0oayksbT1jLmV4dGVuZCghMCx7fSxqLGwpLG49dGhpcy5vcHRpb24obSk7ay5yZXBsYWNlV2l0aChuKX1lbHNle3ZhciBvPXRoaXMub3B0aW9uKGopO2lmKGouY2hpbGRyZW4pe3ZhciBwPXRoaXMuY29udmVydFRvT3B0aW9ucyhqLmNoaWxkcmVuKTtiLmFwcGVuZE1hbnkobyxwKX1oLnB1c2gobyl9fXJldHVybiBofSxkfSksYi5kZWZpbmUoXCJzZWxlY3QyL2RhdGEvYWpheFwiLFtcIi4vYXJyYXlcIixcIi4uL3V0aWxzXCIsXCJqcXVlcnlcIl0sZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQoYSxiKXt0aGlzLmFqYXhPcHRpb25zPXRoaXMuX2FwcGx5RGVmYXVsdHMoYi5nZXQoXCJhamF4XCIpKSxudWxsIT10aGlzLmFqYXhPcHRpb25zLnByb2Nlc3NSZXN1bHRzJiYodGhpcy5wcm9jZXNzUmVzdWx0cz10aGlzLmFqYXhPcHRpb25zLnByb2Nlc3NSZXN1bHRzKSxkLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsYSxiKX1yZXR1cm4gYi5FeHRlbmQoZCxhKSxkLnByb3RvdHlwZS5fYXBwbHlEZWZhdWx0cz1mdW5jdGlvbihhKXt2YXIgYj17ZGF0YTpmdW5jdGlvbihhKXtyZXR1cm4gYy5leHRlbmQoe30sYSx7cTphLnRlcm19KX0sdHJhbnNwb3J0OmZ1bmN0aW9uKGEsYixkKXt2YXIgZT1jLmFqYXgoYSk7cmV0dXJuIGUudGhlbihiKSxlLmZhaWwoZCksZX19O3JldHVybiBjLmV4dGVuZCh7fSxiLGEsITApfSxkLnByb3RvdHlwZS5wcm9jZXNzUmVzdWx0cz1mdW5jdGlvbihhKXtyZXR1cm4gYX0sZC5wcm90b3R5cGUucXVlcnk9ZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBkKCl7dmFyIGQ9Zi50cmFuc3BvcnQoZixmdW5jdGlvbihkKXt2YXIgZj1lLnByb2Nlc3NSZXN1bHRzKGQsYSk7ZS5vcHRpb25zLmdldChcImRlYnVnXCIpJiZ3aW5kb3cuY29uc29sZSYmY29uc29sZS5lcnJvciYmKGYmJmYucmVzdWx0cyYmYy5pc0FycmF5KGYucmVzdWx0cyl8fGNvbnNvbGUuZXJyb3IoXCJTZWxlY3QyOiBUaGUgQUpBWCByZXN1bHRzIGRpZCBub3QgcmV0dXJuIGFuIGFycmF5IGluIHRoZSBgcmVzdWx0c2Aga2V5IG9mIHRoZSByZXNwb25zZS5cIikpLGIoZil9LGZ1bmN0aW9uKCl7ZC5zdGF0dXMmJlwiMFwiPT09ZC5zdGF0dXN8fGUudHJpZ2dlcihcInJlc3VsdHM6bWVzc2FnZVwiLHttZXNzYWdlOlwiZXJyb3JMb2FkaW5nXCJ9KX0pO2UuX3JlcXVlc3Q9ZH12YXIgZT10aGlzO251bGwhPXRoaXMuX3JlcXVlc3QmJihjLmlzRnVuY3Rpb24odGhpcy5fcmVxdWVzdC5hYm9ydCkmJnRoaXMuX3JlcXVlc3QuYWJvcnQoKSx0aGlzLl9yZXF1ZXN0PW51bGwpO3ZhciBmPWMuZXh0ZW5kKHt0eXBlOlwiR0VUXCJ9LHRoaXMuYWpheE9wdGlvbnMpO1wiZnVuY3Rpb25cIj09dHlwZW9mIGYudXJsJiYoZi51cmw9Zi51cmwuY2FsbCh0aGlzLiRlbGVtZW50LGEpKSxcImZ1bmN0aW9uXCI9PXR5cGVvZiBmLmRhdGEmJihmLmRhdGE9Zi5kYXRhLmNhbGwodGhpcy4kZWxlbWVudCxhKSksdGhpcy5hamF4T3B0aW9ucy5kZWxheSYmbnVsbCE9YS50ZXJtPyh0aGlzLl9xdWVyeVRpbWVvdXQmJndpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5fcXVlcnlUaW1lb3V0KSx0aGlzLl9xdWVyeVRpbWVvdXQ9d2luZG93LnNldFRpbWVvdXQoZCx0aGlzLmFqYXhPcHRpb25zLmRlbGF5KSk6ZCgpfSxkfSksYi5kZWZpbmUoXCJzZWxlY3QyL2RhdGEvdGFnc1wiLFtcImpxdWVyeVwiXSxmdW5jdGlvbihhKXtmdW5jdGlvbiBiKGIsYyxkKXt2YXIgZT1kLmdldChcInRhZ3NcIiksZj1kLmdldChcImNyZWF0ZVRhZ1wiKTt2b2lkIDAhPT1mJiYodGhpcy5jcmVhdGVUYWc9Zik7dmFyIGc9ZC5nZXQoXCJpbnNlcnRUYWdcIik7aWYodm9pZCAwIT09ZyYmKHRoaXMuaW5zZXJ0VGFnPWcpLGIuY2FsbCh0aGlzLGMsZCksYS5pc0FycmF5KGUpKWZvcih2YXIgaD0wO2g8ZS5sZW5ndGg7aCsrKXt2YXIgaT1lW2hdLGo9dGhpcy5fbm9ybWFsaXplSXRlbShpKSxrPXRoaXMub3B0aW9uKGopO3RoaXMuJGVsZW1lbnQuYXBwZW5kKGspfX1yZXR1cm4gYi5wcm90b3R5cGUucXVlcnk9ZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQoYSxmKXtmb3IodmFyIGc9YS5yZXN1bHRzLGg9MDtoPGcubGVuZ3RoO2grKyl7dmFyIGk9Z1toXSxqPW51bGwhPWkuY2hpbGRyZW4mJiFkKHtyZXN1bHRzOmkuY2hpbGRyZW59LCEwKSxrPWkudGV4dD09PWIudGVybTtpZihrfHxqKXJldHVybiBmPyExOihhLmRhdGE9Zyx2b2lkIGMoYSkpfWlmKGYpcmV0dXJuITA7dmFyIGw9ZS5jcmVhdGVUYWcoYik7aWYobnVsbCE9bCl7dmFyIG09ZS5vcHRpb24obCk7bS5hdHRyKFwiZGF0YS1zZWxlY3QyLXRhZ1wiLCEwKSxlLmFkZE9wdGlvbnMoW21dKSxlLmluc2VydFRhZyhnLGwpfWEucmVzdWx0cz1nLGMoYSl9dmFyIGU9dGhpcztyZXR1cm4gdGhpcy5fcmVtb3ZlT2xkVGFncygpLG51bGw9PWIudGVybXx8bnVsbCE9Yi5wYWdlP3ZvaWQgYS5jYWxsKHRoaXMsYixjKTp2b2lkIGEuY2FsbCh0aGlzLGIsZCl9LGIucHJvdG90eXBlLmNyZWF0ZVRhZz1mdW5jdGlvbihiLGMpe3ZhciBkPWEudHJpbShjLnRlcm0pO3JldHVyblwiXCI9PT1kP251bGw6e2lkOmQsdGV4dDpkfX0sYi5wcm90b3R5cGUuaW5zZXJ0VGFnPWZ1bmN0aW9uKGEsYixjKXtiLnVuc2hpZnQoYyl9LGIucHJvdG90eXBlLl9yZW1vdmVPbGRUYWdzPWZ1bmN0aW9uKGIpe3ZhciBjPSh0aGlzLl9sYXN0VGFnLHRoaXMuJGVsZW1lbnQuZmluZChcIm9wdGlvbltkYXRhLXNlbGVjdDItdGFnXVwiKSk7Yy5lYWNoKGZ1bmN0aW9uKCl7dGhpcy5zZWxlY3RlZHx8YSh0aGlzKS5yZW1vdmUoKX0pfSxifSksYi5kZWZpbmUoXCJzZWxlY3QyL2RhdGEvdG9rZW5pemVyXCIsW1wianF1ZXJ5XCJdLGZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoYSxiLGMpe3ZhciBkPWMuZ2V0KFwidG9rZW5pemVyXCIpO3ZvaWQgMCE9PWQmJih0aGlzLnRva2VuaXplcj1kKSxhLmNhbGwodGhpcyxiLGMpfXJldHVybiBiLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGEsYixjKXthLmNhbGwodGhpcyxiLGMpLHRoaXMuJHNlYXJjaD1iLmRyb3Bkb3duLiRzZWFyY2h8fGIuc2VsZWN0aW9uLiRzZWFyY2h8fGMuZmluZChcIi5zZWxlY3QyLXNlYXJjaF9fZmllbGRcIil9LGIucHJvdG90eXBlLnF1ZXJ5PWZ1bmN0aW9uKGIsYyxkKXtmdW5jdGlvbiBlKGIpe3ZhciBjPWcuX25vcm1hbGl6ZUl0ZW0oYiksZD1nLiRlbGVtZW50LmZpbmQoXCJvcHRpb25cIikuZmlsdGVyKGZ1bmN0aW9uKCl7cmV0dXJuIGEodGhpcykudmFsKCk9PT1jLmlkfSk7aWYoIWQubGVuZ3RoKXt2YXIgZT1nLm9wdGlvbihjKTtlLmF0dHIoXCJkYXRhLXNlbGVjdDItdGFnXCIsITApLGcuX3JlbW92ZU9sZFRhZ3MoKSxnLmFkZE9wdGlvbnMoW2VdKX1mKGMpfWZ1bmN0aW9uIGYoYSl7Zy50cmlnZ2VyKFwic2VsZWN0XCIse2RhdGE6YX0pfXZhciBnPXRoaXM7Yy50ZXJtPWMudGVybXx8XCJcIjt2YXIgaD10aGlzLnRva2VuaXplcihjLHRoaXMub3B0aW9ucyxlKTtoLnRlcm0hPT1jLnRlcm0mJih0aGlzLiRzZWFyY2gubGVuZ3RoJiYodGhpcy4kc2VhcmNoLnZhbChoLnRlcm0pLHRoaXMuJHNlYXJjaC5mb2N1cygpKSxjLnRlcm09aC50ZXJtKSxiLmNhbGwodGhpcyxjLGQpfSxiLnByb3RvdHlwZS50b2tlbml6ZXI9ZnVuY3Rpb24oYixjLGQsZSl7Zm9yKHZhciBmPWQuZ2V0KFwidG9rZW5TZXBhcmF0b3JzXCIpfHxbXSxnPWMudGVybSxoPTAsaT10aGlzLmNyZWF0ZVRhZ3x8ZnVuY3Rpb24oYSl7cmV0dXJue2lkOmEudGVybSx0ZXh0OmEudGVybX19O2g8Zy5sZW5ndGg7KXt2YXIgaj1nW2hdO2lmKC0xIT09YS5pbkFycmF5KGosZikpe3ZhciBrPWcuc3Vic3RyKDAsaCksbD1hLmV4dGVuZCh7fSxjLHt0ZXJtOmt9KSxtPWkobCk7bnVsbCE9bT8oZShtKSxnPWcuc3Vic3RyKGgrMSl8fFwiXCIsaD0wKTpoKyt9ZWxzZSBoKyt9cmV0dXJue3Rlcm06Z319LGJ9KSxiLmRlZmluZShcInNlbGVjdDIvZGF0YS9taW5pbXVtSW5wdXRMZW5ndGhcIixbXSxmdW5jdGlvbigpe2Z1bmN0aW9uIGEoYSxiLGMpe3RoaXMubWluaW11bUlucHV0TGVuZ3RoPWMuZ2V0KFwibWluaW11bUlucHV0TGVuZ3RoXCIpLGEuY2FsbCh0aGlzLGIsYyl9cmV0dXJuIGEucHJvdG90eXBlLnF1ZXJ5PWZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gYi50ZXJtPWIudGVybXx8XCJcIixiLnRlcm0ubGVuZ3RoPHRoaXMubWluaW11bUlucHV0TGVuZ3RoP3ZvaWQgdGhpcy50cmlnZ2VyKFwicmVzdWx0czptZXNzYWdlXCIse21lc3NhZ2U6XCJpbnB1dFRvb1Nob3J0XCIsYXJnczp7bWluaW11bTp0aGlzLm1pbmltdW1JbnB1dExlbmd0aCxpbnB1dDpiLnRlcm0scGFyYW1zOmJ9fSk6dm9pZCBhLmNhbGwodGhpcyxiLGMpfSxhfSksYi5kZWZpbmUoXCJzZWxlY3QyL2RhdGEvbWF4aW11bUlucHV0TGVuZ3RoXCIsW10sZnVuY3Rpb24oKXtmdW5jdGlvbiBhKGEsYixjKXt0aGlzLm1heGltdW1JbnB1dExlbmd0aD1jLmdldChcIm1heGltdW1JbnB1dExlbmd0aFwiKSxhLmNhbGwodGhpcyxiLGMpfXJldHVybiBhLnByb3RvdHlwZS5xdWVyeT1mdW5jdGlvbihhLGIsYyl7cmV0dXJuIGIudGVybT1iLnRlcm18fFwiXCIsdGhpcy5tYXhpbXVtSW5wdXRMZW5ndGg+MCYmYi50ZXJtLmxlbmd0aD50aGlzLm1heGltdW1JbnB1dExlbmd0aD92b2lkIHRoaXMudHJpZ2dlcihcInJlc3VsdHM6bWVzc2FnZVwiLHttZXNzYWdlOlwiaW5wdXRUb29Mb25nXCIsYXJnczp7bWF4aW11bTp0aGlzLm1heGltdW1JbnB1dExlbmd0aCxpbnB1dDpiLnRlcm0scGFyYW1zOmJ9fSk6dm9pZCBhLmNhbGwodGhpcyxiLGMpfSxhfSksYi5kZWZpbmUoXCJzZWxlY3QyL2RhdGEvbWF4aW11bVNlbGVjdGlvbkxlbmd0aFwiLFtdLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShhLGIsYyl7dGhpcy5tYXhpbXVtU2VsZWN0aW9uTGVuZ3RoPWMuZ2V0KFwibWF4aW11bVNlbGVjdGlvbkxlbmd0aFwiKSxhLmNhbGwodGhpcyxiLGMpfXJldHVybiBhLnByb3RvdHlwZS5xdWVyeT1mdW5jdGlvbihhLGIsYyl7dmFyIGQ9dGhpczt0aGlzLmN1cnJlbnQoZnVuY3Rpb24oZSl7dmFyIGY9bnVsbCE9ZT9lLmxlbmd0aDowO3JldHVybiBkLm1heGltdW1TZWxlY3Rpb25MZW5ndGg+MCYmZj49ZC5tYXhpbXVtU2VsZWN0aW9uTGVuZ3RoP3ZvaWQgZC50cmlnZ2VyKFwicmVzdWx0czptZXNzYWdlXCIse21lc3NhZ2U6XCJtYXhpbXVtU2VsZWN0ZWRcIixhcmdzOnttYXhpbXVtOmQubWF4aW11bVNlbGVjdGlvbkxlbmd0aH19KTp2b2lkIGEuY2FsbChkLGIsYyl9KX0sYX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kcm9wZG93blwiLFtcImpxdWVyeVwiLFwiLi91dGlsc1wiXSxmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYSxiKXt0aGlzLiRlbGVtZW50PWEsdGhpcy5vcHRpb25zPWIsYy5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzKX1yZXR1cm4gYi5FeHRlbmQoYyxiLk9ic2VydmFibGUpLGMucHJvdG90eXBlLnJlbmRlcj1mdW5jdGlvbigpe3ZhciBiPWEoJzxzcGFuIGNsYXNzPVwic2VsZWN0Mi1kcm9wZG93blwiPjxzcGFuIGNsYXNzPVwic2VsZWN0Mi1yZXN1bHRzXCI+PC9zcGFuPjwvc3Bhbj4nKTtyZXR1cm4gYi5hdHRyKFwiZGlyXCIsdGhpcy5vcHRpb25zLmdldChcImRpclwiKSksdGhpcy4kZHJvcGRvd249YixifSxjLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKCl7fSxjLnByb3RvdHlwZS5wb3NpdGlvbj1mdW5jdGlvbihhLGIpe30sYy5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe3RoaXMuJGRyb3Bkb3duLnJlbW92ZSgpfSxjfSksYi5kZWZpbmUoXCJzZWxlY3QyL2Ryb3Bkb3duL3NlYXJjaFwiLFtcImpxdWVyeVwiLFwiLi4vdXRpbHNcIl0sZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKCl7fXJldHVybiBjLnByb3RvdHlwZS5yZW5kZXI9ZnVuY3Rpb24oYil7dmFyIGM9Yi5jYWxsKHRoaXMpLGQ9YSgnPHNwYW4gY2xhc3M9XCJzZWxlY3QyLXNlYXJjaCBzZWxlY3QyLXNlYXJjaC0tZHJvcGRvd25cIj48aW5wdXQgY2xhc3M9XCJzZWxlY3QyLXNlYXJjaF9fZmllbGRcIiB0eXBlPVwic2VhcmNoXCIgdGFiaW5kZXg9XCItMVwiIGF1dG9jb21wbGV0ZT1cIm9mZlwiIGF1dG9jb3JyZWN0PVwib2ZmXCIgYXV0b2NhcGl0YWxpemU9XCJvZmZcIiBzcGVsbGNoZWNrPVwiZmFsc2VcIiByb2xlPVwidGV4dGJveFwiIC8+PC9zcGFuPicpO3JldHVybiB0aGlzLiRzZWFyY2hDb250YWluZXI9ZCx0aGlzLiRzZWFyY2g9ZC5maW5kKFwiaW5wdXRcIiksYy5wcmVwZW5kKGQpLGN9LGMucHJvdG90eXBlLmJpbmQ9ZnVuY3Rpb24oYixjLGQpe3ZhciBlPXRoaXM7Yi5jYWxsKHRoaXMsYyxkKSx0aGlzLiRzZWFyY2gub24oXCJrZXlkb3duXCIsZnVuY3Rpb24oYSl7ZS50cmlnZ2VyKFwia2V5cHJlc3NcIixhKSxlLl9rZXlVcFByZXZlbnRlZD1hLmlzRGVmYXVsdFByZXZlbnRlZCgpfSksdGhpcy4kc2VhcmNoLm9uKFwiaW5wdXRcIixmdW5jdGlvbihiKXthKHRoaXMpLm9mZihcImtleXVwXCIpfSksdGhpcy4kc2VhcmNoLm9uKFwia2V5dXAgaW5wdXRcIixmdW5jdGlvbihhKXtlLmhhbmRsZVNlYXJjaChhKX0pLGMub24oXCJvcGVuXCIsZnVuY3Rpb24oKXtlLiRzZWFyY2guYXR0cihcInRhYmluZGV4XCIsMCksZS4kc2VhcmNoLmZvY3VzKCksd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKXtlLiRzZWFyY2guZm9jdXMoKX0sMCl9KSxjLm9uKFwiY2xvc2VcIixmdW5jdGlvbigpe2UuJHNlYXJjaC5hdHRyKFwidGFiaW5kZXhcIiwtMSksZS4kc2VhcmNoLnZhbChcIlwiKX0pLGMub24oXCJmb2N1c1wiLGZ1bmN0aW9uKCl7Yy5pc09wZW4oKSYmZS4kc2VhcmNoLmZvY3VzKCl9KSxjLm9uKFwicmVzdWx0czphbGxcIixmdW5jdGlvbihhKXtpZihudWxsPT1hLnF1ZXJ5LnRlcm18fFwiXCI9PT1hLnF1ZXJ5LnRlcm0pe3ZhciBiPWUuc2hvd1NlYXJjaChhKTtiP2UuJHNlYXJjaENvbnRhaW5lci5yZW1vdmVDbGFzcyhcInNlbGVjdDItc2VhcmNoLS1oaWRlXCIpOmUuJHNlYXJjaENvbnRhaW5lci5hZGRDbGFzcyhcInNlbGVjdDItc2VhcmNoLS1oaWRlXCIpfX0pfSxjLnByb3RvdHlwZS5oYW5kbGVTZWFyY2g9ZnVuY3Rpb24oYSl7aWYoIXRoaXMuX2tleVVwUHJldmVudGVkKXt2YXIgYj10aGlzLiRzZWFyY2gudmFsKCk7dGhpcy50cmlnZ2VyKFwicXVlcnlcIix7dGVybTpifSl9dGhpcy5fa2V5VXBQcmV2ZW50ZWQ9ITF9LGMucHJvdG90eXBlLnNob3dTZWFyY2g9ZnVuY3Rpb24oYSxiKXtyZXR1cm4hMH0sY30pLGIuZGVmaW5lKFwic2VsZWN0Mi9kcm9wZG93bi9oaWRlUGxhY2Vob2xkZXJcIixbXSxmdW5jdGlvbigpe2Z1bmN0aW9uIGEoYSxiLGMsZCl7dGhpcy5wbGFjZWhvbGRlcj10aGlzLm5vcm1hbGl6ZVBsYWNlaG9sZGVyKGMuZ2V0KFwicGxhY2Vob2xkZXJcIikpLGEuY2FsbCh0aGlzLGIsYyxkKX1yZXR1cm4gYS5wcm90b3R5cGUuYXBwZW5kPWZ1bmN0aW9uKGEsYil7Yi5yZXN1bHRzPXRoaXMucmVtb3ZlUGxhY2Vob2xkZXIoYi5yZXN1bHRzKSxhLmNhbGwodGhpcyxiKX0sYS5wcm90b3R5cGUubm9ybWFsaXplUGxhY2Vob2xkZXI9ZnVuY3Rpb24oYSxiKXtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgYiYmKGI9e2lkOlwiXCIsdGV4dDpifSksYn0sYS5wcm90b3R5cGUucmVtb3ZlUGxhY2Vob2xkZXI9ZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9Yi5zbGljZSgwKSxkPWIubGVuZ3RoLTE7ZD49MDtkLS0pe3ZhciBlPWJbZF07dGhpcy5wbGFjZWhvbGRlci5pZD09PWUuaWQmJmMuc3BsaWNlKGQsMSl9cmV0dXJuIGN9LGF9KSxiLmRlZmluZShcInNlbGVjdDIvZHJvcGRvd24vaW5maW5pdGVTY3JvbGxcIixbXCJqcXVlcnlcIl0sZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYihhLGIsYyxkKXt0aGlzLmxhc3RQYXJhbXM9e30sYS5jYWxsKHRoaXMsYixjLGQpLHRoaXMuJGxvYWRpbmdNb3JlPXRoaXMuY3JlYXRlTG9hZGluZ01vcmUoKSx0aGlzLmxvYWRpbmc9ITF9cmV0dXJuIGIucHJvdG90eXBlLmFwcGVuZD1mdW5jdGlvbihhLGIpe3RoaXMuJGxvYWRpbmdNb3JlLnJlbW92ZSgpLHRoaXMubG9hZGluZz0hMSxhLmNhbGwodGhpcyxiKSx0aGlzLnNob3dMb2FkaW5nTW9yZShiKSYmdGhpcy4kcmVzdWx0cy5hcHBlbmQodGhpcy4kbG9hZGluZ01vcmUpfSxiLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGIsYyxkKXt2YXIgZT10aGlzO2IuY2FsbCh0aGlzLGMsZCksYy5vbihcInF1ZXJ5XCIsZnVuY3Rpb24oYSl7ZS5sYXN0UGFyYW1zPWEsZS5sb2FkaW5nPSEwfSksYy5vbihcInF1ZXJ5OmFwcGVuZFwiLGZ1bmN0aW9uKGEpe2UubGFzdFBhcmFtcz1hLGUubG9hZGluZz0hMH0pLHRoaXMuJHJlc3VsdHMub24oXCJzY3JvbGxcIixmdW5jdGlvbigpe3ZhciBiPWEuY29udGFpbnMoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LGUuJGxvYWRpbmdNb3JlWzBdKTtpZighZS5sb2FkaW5nJiZiKXt2YXIgYz1lLiRyZXN1bHRzLm9mZnNldCgpLnRvcCtlLiRyZXN1bHRzLm91dGVySGVpZ2h0KCExKSxkPWUuJGxvYWRpbmdNb3JlLm9mZnNldCgpLnRvcCtlLiRsb2FkaW5nTW9yZS5vdXRlckhlaWdodCghMSk7Yys1MD49ZCYmZS5sb2FkTW9yZSgpfX0pfSxiLnByb3RvdHlwZS5sb2FkTW9yZT1mdW5jdGlvbigpe3RoaXMubG9hZGluZz0hMDt2YXIgYj1hLmV4dGVuZCh7fSx7cGFnZToxfSx0aGlzLmxhc3RQYXJhbXMpO2IucGFnZSsrLHRoaXMudHJpZ2dlcihcInF1ZXJ5OmFwcGVuZFwiLGIpfSxiLnByb3RvdHlwZS5zaG93TG9hZGluZ01vcmU9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYi5wYWdpbmF0aW9uJiZiLnBhZ2luYXRpb24ubW9yZX0sYi5wcm90b3R5cGUuY3JlYXRlTG9hZGluZ01vcmU9ZnVuY3Rpb24oKXt2YXIgYj1hKCc8bGkgY2xhc3M9XCJzZWxlY3QyLXJlc3VsdHNfX29wdGlvbiBzZWxlY3QyLXJlc3VsdHNfX29wdGlvbi0tbG9hZC1tb3JlXCJyb2xlPVwidHJlZWl0ZW1cIiBhcmlhLWRpc2FibGVkPVwidHJ1ZVwiPjwvbGk+JyksYz10aGlzLm9wdGlvbnMuZ2V0KFwidHJhbnNsYXRpb25zXCIpLmdldChcImxvYWRpbmdNb3JlXCIpO3JldHVybiBiLmh0bWwoYyh0aGlzLmxhc3RQYXJhbXMpKSxifSxifSksYi5kZWZpbmUoXCJzZWxlY3QyL2Ryb3Bkb3duL2F0dGFjaEJvZHlcIixbXCJqcXVlcnlcIixcIi4uL3V0aWxzXCJdLGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhiLGMsZCl7dGhpcy4kZHJvcGRvd25QYXJlbnQ9ZC5nZXQoXCJkcm9wZG93blBhcmVudFwiKXx8YShkb2N1bWVudC5ib2R5KSxiLmNhbGwodGhpcyxjLGQpfXJldHVybiBjLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGEsYixjKXt2YXIgZD10aGlzLGU9ITE7YS5jYWxsKHRoaXMsYixjKSxiLm9uKFwib3BlblwiLGZ1bmN0aW9uKCl7ZC5fc2hvd0Ryb3Bkb3duKCksZC5fYXR0YWNoUG9zaXRpb25pbmdIYW5kbGVyKGIpLGV8fChlPSEwLGIub24oXCJyZXN1bHRzOmFsbFwiLGZ1bmN0aW9uKCl7ZC5fcG9zaXRpb25Ecm9wZG93bigpLGQuX3Jlc2l6ZURyb3Bkb3duKCl9KSxiLm9uKFwicmVzdWx0czphcHBlbmRcIixmdW5jdGlvbigpe2QuX3Bvc2l0aW9uRHJvcGRvd24oKSxkLl9yZXNpemVEcm9wZG93bigpfSkpfSksYi5vbihcImNsb3NlXCIsZnVuY3Rpb24oKXtkLl9oaWRlRHJvcGRvd24oKSxkLl9kZXRhY2hQb3NpdGlvbmluZ0hhbmRsZXIoYil9KSx0aGlzLiRkcm9wZG93bkNvbnRhaW5lci5vbihcIm1vdXNlZG93blwiLGZ1bmN0aW9uKGEpe2Euc3RvcFByb3BhZ2F0aW9uKCl9KX0sYy5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbihhKXthLmNhbGwodGhpcyksdGhpcy4kZHJvcGRvd25Db250YWluZXIucmVtb3ZlKCl9LGMucHJvdG90eXBlLnBvc2l0aW9uPWZ1bmN0aW9uKGEsYixjKXtiLmF0dHIoXCJjbGFzc1wiLGMuYXR0cihcImNsYXNzXCIpKSxiLnJlbW92ZUNsYXNzKFwic2VsZWN0MlwiKSxiLmFkZENsYXNzKFwic2VsZWN0Mi1jb250YWluZXItLW9wZW5cIiksYi5jc3Moe3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6LTk5OTk5OX0pLHRoaXMuJGNvbnRhaW5lcj1jfSxjLnByb3RvdHlwZS5yZW5kZXI9ZnVuY3Rpb24oYil7dmFyIGM9YShcIjxzcGFuPjwvc3Bhbj5cIiksZD1iLmNhbGwodGhpcyk7cmV0dXJuIGMuYXBwZW5kKGQpLHRoaXMuJGRyb3Bkb3duQ29udGFpbmVyPWMsY30sYy5wcm90b3R5cGUuX2hpZGVEcm9wZG93bj1mdW5jdGlvbihhKXt0aGlzLiRkcm9wZG93bkNvbnRhaW5lci5kZXRhY2goKX0sYy5wcm90b3R5cGUuX2F0dGFjaFBvc2l0aW9uaW5nSGFuZGxlcj1mdW5jdGlvbihjLGQpe3ZhciBlPXRoaXMsZj1cInNjcm9sbC5zZWxlY3QyLlwiK2QuaWQsZz1cInJlc2l6ZS5zZWxlY3QyLlwiK2QuaWQsaD1cIm9yaWVudGF0aW9uY2hhbmdlLnNlbGVjdDIuXCIrZC5pZCxpPXRoaXMuJGNvbnRhaW5lci5wYXJlbnRzKCkuZmlsdGVyKGIuaGFzU2Nyb2xsKTtpLmVhY2goZnVuY3Rpb24oKXthKHRoaXMpLmRhdGEoXCJzZWxlY3QyLXNjcm9sbC1wb3NpdGlvblwiLHt4OmEodGhpcykuc2Nyb2xsTGVmdCgpLHk6YSh0aGlzKS5zY3JvbGxUb3AoKX0pfSksaS5vbihmLGZ1bmN0aW9uKGIpe3ZhciBjPWEodGhpcykuZGF0YShcInNlbGVjdDItc2Nyb2xsLXBvc2l0aW9uXCIpO2EodGhpcykuc2Nyb2xsVG9wKGMueSl9KSxhKHdpbmRvdykub24oZitcIiBcIitnK1wiIFwiK2gsZnVuY3Rpb24oYSl7ZS5fcG9zaXRpb25Ecm9wZG93bigpLGUuX3Jlc2l6ZURyb3Bkb3duKCl9KX0sYy5wcm90b3R5cGUuX2RldGFjaFBvc2l0aW9uaW5nSGFuZGxlcj1mdW5jdGlvbihjLGQpe3ZhciBlPVwic2Nyb2xsLnNlbGVjdDIuXCIrZC5pZCxmPVwicmVzaXplLnNlbGVjdDIuXCIrZC5pZCxnPVwib3JpZW50YXRpb25jaGFuZ2Uuc2VsZWN0Mi5cIitkLmlkLGg9dGhpcy4kY29udGFpbmVyLnBhcmVudHMoKS5maWx0ZXIoYi5oYXNTY3JvbGwpO2gub2ZmKGUpLGEod2luZG93KS5vZmYoZStcIiBcIitmK1wiIFwiK2cpfSxjLnByb3RvdHlwZS5fcG9zaXRpb25Ecm9wZG93bj1mdW5jdGlvbigpe3ZhciBiPWEod2luZG93KSxjPXRoaXMuJGRyb3Bkb3duLmhhc0NsYXNzKFwic2VsZWN0Mi1kcm9wZG93bi0tYWJvdmVcIiksZD10aGlzLiRkcm9wZG93bi5oYXNDbGFzcyhcInNlbGVjdDItZHJvcGRvd24tLWJlbG93XCIpLGU9bnVsbCxmPXRoaXMuJGNvbnRhaW5lci5vZmZzZXQoKTtmLmJvdHRvbT1mLnRvcCt0aGlzLiRjb250YWluZXIub3V0ZXJIZWlnaHQoITEpO3ZhciBnPXtoZWlnaHQ6dGhpcy4kY29udGFpbmVyLm91dGVySGVpZ2h0KCExKX07Zy50b3A9Zi50b3AsZy5ib3R0b209Zi50b3ArZy5oZWlnaHQ7dmFyIGg9e2hlaWdodDp0aGlzLiRkcm9wZG93bi5vdXRlckhlaWdodCghMSl9LGk9e3RvcDpiLnNjcm9sbFRvcCgpLGJvdHRvbTpiLnNjcm9sbFRvcCgpK2IuaGVpZ2h0KCl9LGo9aS50b3A8Zi50b3AtaC5oZWlnaHQsaz1pLmJvdHRvbT5mLmJvdHRvbStoLmhlaWdodCxsPXtsZWZ0OmYubGVmdCx0b3A6Zy5ib3R0b219LG09dGhpcy4kZHJvcGRvd25QYXJlbnQ7XCJzdGF0aWNcIj09PW0uY3NzKFwicG9zaXRpb25cIikmJihtPW0ub2Zmc2V0UGFyZW50KCkpO3ZhciBuPW0ub2Zmc2V0KCk7bC50b3AtPW4udG9wLGwubGVmdC09bi5sZWZ0LGN8fGR8fChlPVwiYmVsb3dcIiksa3x8IWp8fGM/IWomJmsmJmMmJihlPVwiYmVsb3dcIik6ZT1cImFib3ZlXCIsKFwiYWJvdmVcIj09ZXx8YyYmXCJiZWxvd1wiIT09ZSkmJihsLnRvcD1nLnRvcC1uLnRvcC1oLmhlaWdodCksbnVsbCE9ZSYmKHRoaXMuJGRyb3Bkb3duLnJlbW92ZUNsYXNzKFwic2VsZWN0Mi1kcm9wZG93bi0tYmVsb3cgc2VsZWN0Mi1kcm9wZG93bi0tYWJvdmVcIikuYWRkQ2xhc3MoXCJzZWxlY3QyLWRyb3Bkb3duLS1cIitlKSx0aGlzLiRjb250YWluZXIucmVtb3ZlQ2xhc3MoXCJzZWxlY3QyLWNvbnRhaW5lci0tYmVsb3cgc2VsZWN0Mi1jb250YWluZXItLWFib3ZlXCIpLmFkZENsYXNzKFwic2VsZWN0Mi1jb250YWluZXItLVwiK2UpKSx0aGlzLiRkcm9wZG93bkNvbnRhaW5lci5jc3MobCl9LGMucHJvdG90eXBlLl9yZXNpemVEcm9wZG93bj1mdW5jdGlvbigpe3ZhciBhPXt3aWR0aDp0aGlzLiRjb250YWluZXIub3V0ZXJXaWR0aCghMSkrXCJweFwifTt0aGlzLm9wdGlvbnMuZ2V0KFwiZHJvcGRvd25BdXRvV2lkdGhcIikmJihhLm1pbldpZHRoPWEud2lkdGgsYS5wb3NpdGlvbj1cInJlbGF0aXZlXCIsYS53aWR0aD1cImF1dG9cIiksdGhpcy4kZHJvcGRvd24uY3NzKGEpfSxjLnByb3RvdHlwZS5fc2hvd0Ryb3Bkb3duPWZ1bmN0aW9uKGEpe3RoaXMuJGRyb3Bkb3duQ29udGFpbmVyLmFwcGVuZFRvKHRoaXMuJGRyb3Bkb3duUGFyZW50KSx0aGlzLl9wb3NpdGlvbkRyb3Bkb3duKCksdGhpcy5fcmVzaXplRHJvcGRvd24oKX0sY30pLGIuZGVmaW5lKFwic2VsZWN0Mi9kcm9wZG93bi9taW5pbXVtUmVzdWx0c0ZvclNlYXJjaFwiLFtdLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShiKXtmb3IodmFyIGM9MCxkPTA7ZDxiLmxlbmd0aDtkKyspe3ZhciBlPWJbZF07ZS5jaGlsZHJlbj9jKz1hKGUuY2hpbGRyZW4pOmMrK31yZXR1cm4gY31mdW5jdGlvbiBiKGEsYixjLGQpe3RoaXMubWluaW11bVJlc3VsdHNGb3JTZWFyY2g9Yy5nZXQoXCJtaW5pbXVtUmVzdWx0c0ZvclNlYXJjaFwiKSx0aGlzLm1pbmltdW1SZXN1bHRzRm9yU2VhcmNoPDAmJih0aGlzLm1pbmltdW1SZXN1bHRzRm9yU2VhcmNoPTEvMCksYS5jYWxsKHRoaXMsYixjLGQpfXJldHVybiBiLnByb3RvdHlwZS5zaG93U2VhcmNoPWZ1bmN0aW9uKGIsYyl7cmV0dXJuIGEoYy5kYXRhLnJlc3VsdHMpPHRoaXMubWluaW11bVJlc3VsdHNGb3JTZWFyY2g/ITE6Yi5jYWxsKHRoaXMsYyl9LGJ9KSxiLmRlZmluZShcInNlbGVjdDIvZHJvcGRvd24vc2VsZWN0T25DbG9zZVwiLFtdLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gYSgpe31yZXR1cm4gYS5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihhLGIsYyl7dmFyIGQ9dGhpczthLmNhbGwodGhpcyxiLGMpLGIub24oXCJjbG9zZVwiLGZ1bmN0aW9uKGEpe2QuX2hhbmRsZVNlbGVjdE9uQ2xvc2UoYSl9KX0sYS5wcm90b3R5cGUuX2hhbmRsZVNlbGVjdE9uQ2xvc2U9ZnVuY3Rpb24oYSxiKXtpZihiJiZudWxsIT1iLm9yaWdpbmFsU2VsZWN0MkV2ZW50KXt2YXIgYz1iLm9yaWdpbmFsU2VsZWN0MkV2ZW50O2lmKFwic2VsZWN0XCI9PT1jLl90eXBlfHxcInVuc2VsZWN0XCI9PT1jLl90eXBlKXJldHVybn12YXIgZD10aGlzLmdldEhpZ2hsaWdodGVkUmVzdWx0cygpO2lmKCEoZC5sZW5ndGg8MSkpe3ZhciBlPWQuZGF0YShcImRhdGFcIik7bnVsbCE9ZS5lbGVtZW50JiZlLmVsZW1lbnQuc2VsZWN0ZWR8fG51bGw9PWUuZWxlbWVudCYmZS5zZWxlY3RlZHx8dGhpcy50cmlnZ2VyKFwic2VsZWN0XCIse2RhdGE6ZX0pfX0sYX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kcm9wZG93bi9jbG9zZU9uU2VsZWN0XCIsW10sZnVuY3Rpb24oKXtmdW5jdGlvbiBhKCl7fXJldHVybiBhLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGEsYixjKXt2YXIgZD10aGlzO2EuY2FsbCh0aGlzLGIsYyksYi5vbihcInNlbGVjdFwiLGZ1bmN0aW9uKGEpe2QuX3NlbGVjdFRyaWdnZXJlZChhKX0pLGIub24oXCJ1bnNlbGVjdFwiLGZ1bmN0aW9uKGEpe2QuX3NlbGVjdFRyaWdnZXJlZChhKX0pfSxhLnByb3RvdHlwZS5fc2VsZWN0VHJpZ2dlcmVkPWZ1bmN0aW9uKGEsYil7dmFyIGM9Yi5vcmlnaW5hbEV2ZW50O2MmJmMuY3RybEtleXx8dGhpcy50cmlnZ2VyKFwiY2xvc2VcIix7b3JpZ2luYWxFdmVudDpjLG9yaWdpbmFsU2VsZWN0MkV2ZW50OmJ9KX0sYX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9pMThuL2VuXCIsW10sZnVuY3Rpb24oKXtyZXR1cm57ZXJyb3JMb2FkaW5nOmZ1bmN0aW9uKCl7cmV0dXJuXCJUaGUgcmVzdWx0cyBjb3VsZCBub3QgYmUgbG9hZGVkLlwifSxpbnB1dFRvb0xvbmc6ZnVuY3Rpb24oYSl7dmFyIGI9YS5pbnB1dC5sZW5ndGgtYS5tYXhpbXVtLGM9XCJQbGVhc2UgZGVsZXRlIFwiK2IrXCIgY2hhcmFjdGVyXCI7cmV0dXJuIDEhPWImJihjKz1cInNcIiksY30saW5wdXRUb29TaG9ydDpmdW5jdGlvbihhKXt2YXIgYj1hLm1pbmltdW0tYS5pbnB1dC5sZW5ndGgsYz1cIlBsZWFzZSBlbnRlciBcIitiK1wiIG9yIG1vcmUgY2hhcmFjdGVyc1wiO3JldHVybiBjfSxsb2FkaW5nTW9yZTpmdW5jdGlvbigpe3JldHVyblwiTG9hZGluZyBtb3JlIHJlc3VsdHPigKZcIn0sbWF4aW11bVNlbGVjdGVkOmZ1bmN0aW9uKGEpe3ZhciBiPVwiWW91IGNhbiBvbmx5IHNlbGVjdCBcIithLm1heGltdW0rXCIgaXRlbVwiO3JldHVybiAxIT1hLm1heGltdW0mJihiKz1cInNcIiksYn0sbm9SZXN1bHRzOmZ1bmN0aW9uKCl7cmV0dXJuXCJObyByZXN1bHRzIGZvdW5kXCJ9LHNlYXJjaGluZzpmdW5jdGlvbigpe3JldHVyblwiU2VhcmNoaW5n4oCmXCJ9fX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kZWZhdWx0c1wiLFtcImpxdWVyeVwiLFwicmVxdWlyZVwiLFwiLi9yZXN1bHRzXCIsXCIuL3NlbGVjdGlvbi9zaW5nbGVcIixcIi4vc2VsZWN0aW9uL211bHRpcGxlXCIsXCIuL3NlbGVjdGlvbi9wbGFjZWhvbGRlclwiLFwiLi9zZWxlY3Rpb24vYWxsb3dDbGVhclwiLFwiLi9zZWxlY3Rpb24vc2VhcmNoXCIsXCIuL3NlbGVjdGlvbi9ldmVudFJlbGF5XCIsXCIuL3V0aWxzXCIsXCIuL3RyYW5zbGF0aW9uXCIsXCIuL2RpYWNyaXRpY3NcIixcIi4vZGF0YS9zZWxlY3RcIixcIi4vZGF0YS9hcnJheVwiLFwiLi9kYXRhL2FqYXhcIixcIi4vZGF0YS90YWdzXCIsXCIuL2RhdGEvdG9rZW5pemVyXCIsXCIuL2RhdGEvbWluaW11bUlucHV0TGVuZ3RoXCIsXCIuL2RhdGEvbWF4aW11bUlucHV0TGVuZ3RoXCIsXCIuL2RhdGEvbWF4aW11bVNlbGVjdGlvbkxlbmd0aFwiLFwiLi9kcm9wZG93blwiLFwiLi9kcm9wZG93bi9zZWFyY2hcIixcIi4vZHJvcGRvd24vaGlkZVBsYWNlaG9sZGVyXCIsXCIuL2Ryb3Bkb3duL2luZmluaXRlU2Nyb2xsXCIsXCIuL2Ryb3Bkb3duL2F0dGFjaEJvZHlcIixcIi4vZHJvcGRvd24vbWluaW11bVJlc3VsdHNGb3JTZWFyY2hcIixcIi4vZHJvcGRvd24vc2VsZWN0T25DbG9zZVwiLFwiLi9kcm9wZG93bi9jbG9zZU9uU2VsZWN0XCIsXCIuL2kxOG4vZW5cIl0sZnVuY3Rpb24oYSxiLGMsZCxlLGYsZyxoLGksaixrLGwsbSxuLG8scCxxLHIscyx0LHUsdix3LHgseSx6LEEsQixDKXtmdW5jdGlvbiBEKCl7dGhpcy5yZXNldCgpfUQucHJvdG90eXBlLmFwcGx5PWZ1bmN0aW9uKGwpe2lmKGw9YS5leHRlbmQoITAse30sdGhpcy5kZWZhdWx0cyxsKSxudWxsPT1sLmRhdGFBZGFwdGVyKXtpZihudWxsIT1sLmFqYXg/bC5kYXRhQWRhcHRlcj1vOm51bGwhPWwuZGF0YT9sLmRhdGFBZGFwdGVyPW46bC5kYXRhQWRhcHRlcj1tLGwubWluaW11bUlucHV0TGVuZ3RoPjAmJihsLmRhdGFBZGFwdGVyPWouRGVjb3JhdGUobC5kYXRhQWRhcHRlcixyKSksbC5tYXhpbXVtSW5wdXRMZW5ndGg+MCYmKGwuZGF0YUFkYXB0ZXI9ai5EZWNvcmF0ZShsLmRhdGFBZGFwdGVyLHMpKSxsLm1heGltdW1TZWxlY3Rpb25MZW5ndGg+MCYmKGwuZGF0YUFkYXB0ZXI9ai5EZWNvcmF0ZShsLmRhdGFBZGFwdGVyLHQpKSxsLnRhZ3MmJihsLmRhdGFBZGFwdGVyPWouRGVjb3JhdGUobC5kYXRhQWRhcHRlcixwKSksKG51bGwhPWwudG9rZW5TZXBhcmF0b3JzfHxudWxsIT1sLnRva2VuaXplcikmJihsLmRhdGFBZGFwdGVyPWouRGVjb3JhdGUobC5kYXRhQWRhcHRlcixxKSksbnVsbCE9bC5xdWVyeSl7dmFyIEM9YihsLmFtZEJhc2UrXCJjb21wYXQvcXVlcnlcIik7bC5kYXRhQWRhcHRlcj1qLkRlY29yYXRlKGwuZGF0YUFkYXB0ZXIsQyl9aWYobnVsbCE9bC5pbml0U2VsZWN0aW9uKXt2YXIgRD1iKGwuYW1kQmFzZStcImNvbXBhdC9pbml0U2VsZWN0aW9uXCIpO2wuZGF0YUFkYXB0ZXI9ai5EZWNvcmF0ZShsLmRhdGFBZGFwdGVyLEQpfX1pZihudWxsPT1sLnJlc3VsdHNBZGFwdGVyJiYobC5yZXN1bHRzQWRhcHRlcj1jLG51bGwhPWwuYWpheCYmKGwucmVzdWx0c0FkYXB0ZXI9ai5EZWNvcmF0ZShsLnJlc3VsdHNBZGFwdGVyLHgpKSxudWxsIT1sLnBsYWNlaG9sZGVyJiYobC5yZXN1bHRzQWRhcHRlcj1qLkRlY29yYXRlKGwucmVzdWx0c0FkYXB0ZXIsdykpLGwuc2VsZWN0T25DbG9zZSYmKGwucmVzdWx0c0FkYXB0ZXI9ai5EZWNvcmF0ZShsLnJlc3VsdHNBZGFwdGVyLEEpKSksbnVsbD09bC5kcm9wZG93bkFkYXB0ZXIpe2lmKGwubXVsdGlwbGUpbC5kcm9wZG93bkFkYXB0ZXI9dTtlbHNle3ZhciBFPWouRGVjb3JhdGUodSx2KTtsLmRyb3Bkb3duQWRhcHRlcj1FfWlmKDAhPT1sLm1pbmltdW1SZXN1bHRzRm9yU2VhcmNoJiYobC5kcm9wZG93bkFkYXB0ZXI9ai5EZWNvcmF0ZShsLmRyb3Bkb3duQWRhcHRlcix6KSksbC5jbG9zZU9uU2VsZWN0JiYobC5kcm9wZG93bkFkYXB0ZXI9ai5EZWNvcmF0ZShsLmRyb3Bkb3duQWRhcHRlcixCKSksbnVsbCE9bC5kcm9wZG93bkNzc0NsYXNzfHxudWxsIT1sLmRyb3Bkb3duQ3NzfHxudWxsIT1sLmFkYXB0RHJvcGRvd25Dc3NDbGFzcyl7dmFyIEY9YihsLmFtZEJhc2UrXCJjb21wYXQvZHJvcGRvd25Dc3NcIik7bC5kcm9wZG93bkFkYXB0ZXI9ai5EZWNvcmF0ZShsLmRyb3Bkb3duQWRhcHRlcixGKX1sLmRyb3Bkb3duQWRhcHRlcj1qLkRlY29yYXRlKGwuZHJvcGRvd25BZGFwdGVyLHkpfWlmKG51bGw9PWwuc2VsZWN0aW9uQWRhcHRlcil7aWYobC5tdWx0aXBsZT9sLnNlbGVjdGlvbkFkYXB0ZXI9ZTpsLnNlbGVjdGlvbkFkYXB0ZXI9ZCxudWxsIT1sLnBsYWNlaG9sZGVyJiYobC5zZWxlY3Rpb25BZGFwdGVyPWouRGVjb3JhdGUobC5zZWxlY3Rpb25BZGFwdGVyLGYpKSxsLmFsbG93Q2xlYXImJihsLnNlbGVjdGlvbkFkYXB0ZXI9ai5EZWNvcmF0ZShsLnNlbGVjdGlvbkFkYXB0ZXIsZykpLGwubXVsdGlwbGUmJihsLnNlbGVjdGlvbkFkYXB0ZXI9ai5EZWNvcmF0ZShsLnNlbGVjdGlvbkFkYXB0ZXIsaCkpLG51bGwhPWwuY29udGFpbmVyQ3NzQ2xhc3N8fG51bGwhPWwuY29udGFpbmVyQ3NzfHxudWxsIT1sLmFkYXB0Q29udGFpbmVyQ3NzQ2xhc3Mpe3ZhciBHPWIobC5hbWRCYXNlK1wiY29tcGF0L2NvbnRhaW5lckNzc1wiKTtsLnNlbGVjdGlvbkFkYXB0ZXI9ai5EZWNvcmF0ZShsLnNlbGVjdGlvbkFkYXB0ZXIsRyl9bC5zZWxlY3Rpb25BZGFwdGVyPWouRGVjb3JhdGUobC5zZWxlY3Rpb25BZGFwdGVyLGkpfWlmKFwic3RyaW5nXCI9PXR5cGVvZiBsLmxhbmd1YWdlKWlmKGwubGFuZ3VhZ2UuaW5kZXhPZihcIi1cIik+MCl7dmFyIEg9bC5sYW5ndWFnZS5zcGxpdChcIi1cIiksST1IWzBdO2wubGFuZ3VhZ2U9W2wubGFuZ3VhZ2UsSV19ZWxzZSBsLmxhbmd1YWdlPVtsLmxhbmd1YWdlXTtpZihhLmlzQXJyYXkobC5sYW5ndWFnZSkpe3ZhciBKPW5ldyBrO2wubGFuZ3VhZ2UucHVzaChcImVuXCIpO2Zvcih2YXIgSz1sLmxhbmd1YWdlLEw9MDtMPEsubGVuZ3RoO0wrKyl7dmFyIE09S1tMXSxOPXt9O3RyeXtOPWsubG9hZFBhdGgoTSl9Y2F0Y2goTyl7dHJ5e009dGhpcy5kZWZhdWx0cy5hbWRMYW5ndWFnZUJhc2UrTSxOPWsubG9hZFBhdGgoTSl9Y2F0Y2goUCl7bC5kZWJ1ZyYmd2luZG93LmNvbnNvbGUmJmNvbnNvbGUud2FybiYmY29uc29sZS53YXJuKCdTZWxlY3QyOiBUaGUgbGFuZ3VhZ2UgZmlsZSBmb3IgXCInK00rJ1wiIGNvdWxkIG5vdCBiZSBhdXRvbWF0aWNhbGx5IGxvYWRlZC4gQSBmYWxsYmFjayB3aWxsIGJlIHVzZWQgaW5zdGVhZC4nKTtjb250aW51ZX19Si5leHRlbmQoTil9bC50cmFuc2xhdGlvbnM9Sn1lbHNle3ZhciBRPWsubG9hZFBhdGgodGhpcy5kZWZhdWx0cy5hbWRMYW5ndWFnZUJhc2UrXCJlblwiKSxSPW5ldyBrKGwubGFuZ3VhZ2UpO1IuZXh0ZW5kKFEpLGwudHJhbnNsYXRpb25zPVJ9cmV0dXJuIGx9LEQucHJvdG90eXBlLnJlc2V0PWZ1bmN0aW9uKCl7ZnVuY3Rpb24gYihhKXtmdW5jdGlvbiBiKGEpe3JldHVybiBsW2FdfHxhfXJldHVybiBhLnJlcGxhY2UoL1teXFx1MDAwMC1cXHUwMDdFXS9nLGIpfWZ1bmN0aW9uIGMoZCxlKXtpZihcIlwiPT09YS50cmltKGQudGVybSkpcmV0dXJuIGU7aWYoZS5jaGlsZHJlbiYmZS5jaGlsZHJlbi5sZW5ndGg+MCl7Zm9yKHZhciBmPWEuZXh0ZW5kKCEwLHt9LGUpLGc9ZS5jaGlsZHJlbi5sZW5ndGgtMTtnPj0wO2ctLSl7dmFyIGg9ZS5jaGlsZHJlbltnXSxpPWMoZCxoKTtudWxsPT1pJiZmLmNoaWxkcmVuLnNwbGljZShnLDEpfXJldHVybiBmLmNoaWxkcmVuLmxlbmd0aD4wP2Y6YyhkLGYpfXZhciBqPWIoZS50ZXh0KS50b1VwcGVyQ2FzZSgpLGs9YihkLnRlcm0pLnRvVXBwZXJDYXNlKCk7cmV0dXJuIGouaW5kZXhPZihrKT4tMT9lOm51bGx9dGhpcy5kZWZhdWx0cz17YW1kQmFzZTpcIi4vXCIsYW1kTGFuZ3VhZ2VCYXNlOlwiLi9pMThuL1wiLGNsb3NlT25TZWxlY3Q6ITAsZGVidWc6ITEsZHJvcGRvd25BdXRvV2lkdGg6ITEsZXNjYXBlTWFya3VwOmouZXNjYXBlTWFya3VwLGxhbmd1YWdlOkMsbWF0Y2hlcjpjLG1pbmltdW1JbnB1dExlbmd0aDowLG1heGltdW1JbnB1dExlbmd0aDowLG1heGltdW1TZWxlY3Rpb25MZW5ndGg6MCxtaW5pbXVtUmVzdWx0c0ZvclNlYXJjaDowLHNlbGVjdE9uQ2xvc2U6ITEsc29ydGVyOmZ1bmN0aW9uKGEpe3JldHVybiBhfSx0ZW1wbGF0ZVJlc3VsdDpmdW5jdGlvbihhKXtyZXR1cm4gYS50ZXh0fSx0ZW1wbGF0ZVNlbGVjdGlvbjpmdW5jdGlvbihhKXtyZXR1cm4gYS50ZXh0fSx0aGVtZTpcImRlZmF1bHRcIix3aWR0aDpcInJlc29sdmVcIn19LEQucHJvdG90eXBlLnNldD1mdW5jdGlvbihiLGMpe3ZhciBkPWEuY2FtZWxDYXNlKGIpLGU9e307ZVtkXT1jO3ZhciBmPWouX2NvbnZlcnREYXRhKGUpO2EuZXh0ZW5kKHRoaXMuZGVmYXVsdHMsZil9O3ZhciBFPW5ldyBEO3JldHVybiBFfSksYi5kZWZpbmUoXCJzZWxlY3QyL29wdGlvbnNcIixbXCJyZXF1aXJlXCIsXCJqcXVlcnlcIixcIi4vZGVmYXVsdHNcIixcIi4vdXRpbHNcIl0sZnVuY3Rpb24oYSxiLGMsZCl7ZnVuY3Rpb24gZShiLGUpe2lmKHRoaXMub3B0aW9ucz1iLG51bGwhPWUmJnRoaXMuZnJvbUVsZW1lbnQoZSksdGhpcy5vcHRpb25zPWMuYXBwbHkodGhpcy5vcHRpb25zKSxlJiZlLmlzKFwiaW5wdXRcIikpe3ZhciBmPWEodGhpcy5nZXQoXCJhbWRCYXNlXCIpK1wiY29tcGF0L2lucHV0RGF0YVwiKTt0aGlzLm9wdGlvbnMuZGF0YUFkYXB0ZXI9ZC5EZWNvcmF0ZSh0aGlzLm9wdGlvbnMuZGF0YUFkYXB0ZXIsZil9fXJldHVybiBlLnByb3RvdHlwZS5mcm9tRWxlbWVudD1mdW5jdGlvbihhKXt2YXIgYz1bXCJzZWxlY3QyXCJdO251bGw9PXRoaXMub3B0aW9ucy5tdWx0aXBsZSYmKHRoaXMub3B0aW9ucy5tdWx0aXBsZT1hLnByb3AoXCJtdWx0aXBsZVwiKSksbnVsbD09dGhpcy5vcHRpb25zLmRpc2FibGVkJiYodGhpcy5vcHRpb25zLmRpc2FibGVkPWEucHJvcChcImRpc2FibGVkXCIpKSxudWxsPT10aGlzLm9wdGlvbnMubGFuZ3VhZ2UmJihhLnByb3AoXCJsYW5nXCIpP3RoaXMub3B0aW9ucy5sYW5ndWFnZT1hLnByb3AoXCJsYW5nXCIpLnRvTG93ZXJDYXNlKCk6YS5jbG9zZXN0KFwiW2xhbmddXCIpLnByb3AoXCJsYW5nXCIpJiYodGhpcy5vcHRpb25zLmxhbmd1YWdlPWEuY2xvc2VzdChcIltsYW5nXVwiKS5wcm9wKFwibGFuZ1wiKSkpLG51bGw9PXRoaXMub3B0aW9ucy5kaXImJihhLnByb3AoXCJkaXJcIik/dGhpcy5vcHRpb25zLmRpcj1hLnByb3AoXCJkaXJcIik6YS5jbG9zZXN0KFwiW2Rpcl1cIikucHJvcChcImRpclwiKT90aGlzLm9wdGlvbnMuZGlyPWEuY2xvc2VzdChcIltkaXJdXCIpLnByb3AoXCJkaXJcIik6dGhpcy5vcHRpb25zLmRpcj1cImx0clwiKSxhLnByb3AoXCJkaXNhYmxlZFwiLHRoaXMub3B0aW9ucy5kaXNhYmxlZCksYS5wcm9wKFwibXVsdGlwbGVcIix0aGlzLm9wdGlvbnMubXVsdGlwbGUpLGEuZGF0YShcInNlbGVjdDJUYWdzXCIpJiYodGhpcy5vcHRpb25zLmRlYnVnJiZ3aW5kb3cuY29uc29sZSYmY29uc29sZS53YXJuJiZjb25zb2xlLndhcm4oJ1NlbGVjdDI6IFRoZSBgZGF0YS1zZWxlY3QyLXRhZ3NgIGF0dHJpYnV0ZSBoYXMgYmVlbiBjaGFuZ2VkIHRvIHVzZSB0aGUgYGRhdGEtZGF0YWAgYW5kIGBkYXRhLXRhZ3M9XCJ0cnVlXCJgIGF0dHJpYnV0ZXMgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiBmdXR1cmUgdmVyc2lvbnMgb2YgU2VsZWN0Mi4nKSxhLmRhdGEoXCJkYXRhXCIsYS5kYXRhKFwic2VsZWN0MlRhZ3NcIikpLGEuZGF0YShcInRhZ3NcIiwhMCkpLGEuZGF0YShcImFqYXhVcmxcIikmJih0aGlzLm9wdGlvbnMuZGVidWcmJndpbmRvdy5jb25zb2xlJiZjb25zb2xlLndhcm4mJmNvbnNvbGUud2FybihcIlNlbGVjdDI6IFRoZSBgZGF0YS1hamF4LXVybGAgYXR0cmlidXRlIGhhcyBiZWVuIGNoYW5nZWQgdG8gYGRhdGEtYWpheC0tdXJsYCBhbmQgc3VwcG9ydCBmb3IgdGhlIG9sZCBhdHRyaWJ1dGUgd2lsbCBiZSByZW1vdmVkIGluIGZ1dHVyZSB2ZXJzaW9ucyBvZiBTZWxlY3QyLlwiKSxhLmF0dHIoXCJhamF4LS11cmxcIixhLmRhdGEoXCJhamF4VXJsXCIpKSxhLmRhdGEoXCJhamF4LS11cmxcIixhLmRhdGEoXCJhamF4VXJsXCIpKSk7dmFyIGU9e307ZT1iLmZuLmpxdWVyeSYmXCIxLlwiPT1iLmZuLmpxdWVyeS5zdWJzdHIoMCwyKSYmYVswXS5kYXRhc2V0P2IuZXh0ZW5kKCEwLHt9LGFbMF0uZGF0YXNldCxhLmRhdGEoKSk6YS5kYXRhKCk7dmFyIGY9Yi5leHRlbmQoITAse30sZSk7Zj1kLl9jb252ZXJ0RGF0YShmKTtmb3IodmFyIGcgaW4gZiliLmluQXJyYXkoZyxjKT4tMXx8KGIuaXNQbGFpbk9iamVjdCh0aGlzLm9wdGlvbnNbZ10pP2IuZXh0ZW5kKHRoaXMub3B0aW9uc1tnXSxmW2ddKTp0aGlzLm9wdGlvbnNbZ109ZltnXSk7cmV0dXJuIHRoaXN9LGUucHJvdG90eXBlLmdldD1mdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5vcHRpb25zW2FdfSxlLnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24oYSxiKXt0aGlzLm9wdGlvbnNbYV09Yn0sZX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9jb3JlXCIsW1wianF1ZXJ5XCIsXCIuL29wdGlvbnNcIixcIi4vdXRpbHNcIixcIi4va2V5c1wiXSxmdW5jdGlvbihhLGIsYyxkKXt2YXIgZT1mdW5jdGlvbihhLGMpe251bGwhPWEuZGF0YShcInNlbGVjdDJcIikmJmEuZGF0YShcInNlbGVjdDJcIikuZGVzdHJveSgpLHRoaXMuJGVsZW1lbnQ9YSx0aGlzLmlkPXRoaXMuX2dlbmVyYXRlSWQoYSksYz1jfHx7fSx0aGlzLm9wdGlvbnM9bmV3IGIoYyxhKSxlLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMpO3ZhciBkPWEuYXR0cihcInRhYmluZGV4XCIpfHwwO2EuZGF0YShcIm9sZC10YWJpbmRleFwiLGQpLGEuYXR0cihcInRhYmluZGV4XCIsXCItMVwiKTt2YXIgZj10aGlzLm9wdGlvbnMuZ2V0KFwiZGF0YUFkYXB0ZXJcIik7dGhpcy5kYXRhQWRhcHRlcj1uZXcgZihhLHRoaXMub3B0aW9ucyk7dmFyIGc9dGhpcy5yZW5kZXIoKTt0aGlzLl9wbGFjZUNvbnRhaW5lcihnKTt2YXIgaD10aGlzLm9wdGlvbnMuZ2V0KFwic2VsZWN0aW9uQWRhcHRlclwiKTt0aGlzLnNlbGVjdGlvbj1uZXcgaChhLHRoaXMub3B0aW9ucyksdGhpcy4kc2VsZWN0aW9uPXRoaXMuc2VsZWN0aW9uLnJlbmRlcigpLHRoaXMuc2VsZWN0aW9uLnBvc2l0aW9uKHRoaXMuJHNlbGVjdGlvbixnKTt2YXIgaT10aGlzLm9wdGlvbnMuZ2V0KFwiZHJvcGRvd25BZGFwdGVyXCIpO3RoaXMuZHJvcGRvd249bmV3IGkoYSx0aGlzLm9wdGlvbnMpLHRoaXMuJGRyb3Bkb3duPXRoaXMuZHJvcGRvd24ucmVuZGVyKCksdGhpcy5kcm9wZG93bi5wb3NpdGlvbih0aGlzLiRkcm9wZG93bixnKTt2YXIgaj10aGlzLm9wdGlvbnMuZ2V0KFwicmVzdWx0c0FkYXB0ZXJcIik7dGhpcy5yZXN1bHRzPW5ldyBqKGEsdGhpcy5vcHRpb25zLHRoaXMuZGF0YUFkYXB0ZXIpLHRoaXMuJHJlc3VsdHM9dGhpcy5yZXN1bHRzLnJlbmRlcigpLHRoaXMucmVzdWx0cy5wb3NpdGlvbih0aGlzLiRyZXN1bHRzLHRoaXMuJGRyb3Bkb3duKTt2YXIgaz10aGlzO3RoaXMuX2JpbmRBZGFwdGVycygpLHRoaXMuX3JlZ2lzdGVyRG9tRXZlbnRzKCksdGhpcy5fcmVnaXN0ZXJEYXRhRXZlbnRzKCksdGhpcy5fcmVnaXN0ZXJTZWxlY3Rpb25FdmVudHMoKSx0aGlzLl9yZWdpc3RlckRyb3Bkb3duRXZlbnRzKCksdGhpcy5fcmVnaXN0ZXJSZXN1bHRzRXZlbnRzKCksdGhpcy5fcmVnaXN0ZXJFdmVudHMoKSx0aGlzLmRhdGFBZGFwdGVyLmN1cnJlbnQoZnVuY3Rpb24oYSl7ay50cmlnZ2VyKFwic2VsZWN0aW9uOnVwZGF0ZVwiLHtkYXRhOmF9KX0pLGEuYWRkQ2xhc3MoXCJzZWxlY3QyLWhpZGRlbi1hY2Nlc3NpYmxlXCIpLGEuYXR0cihcImFyaWEtaGlkZGVuXCIsXCJ0cnVlXCIpLHRoaXMuX3N5bmNBdHRyaWJ1dGVzKCksYS5kYXRhKFwic2VsZWN0MlwiLHRoaXMpfTtyZXR1cm4gYy5FeHRlbmQoZSxjLk9ic2VydmFibGUpLGUucHJvdG90eXBlLl9nZW5lcmF0ZUlkPWZ1bmN0aW9uKGEpe3ZhciBiPVwiXCI7cmV0dXJuIGI9bnVsbCE9YS5hdHRyKFwiaWRcIik/YS5hdHRyKFwiaWRcIik6bnVsbCE9YS5hdHRyKFwibmFtZVwiKT9hLmF0dHIoXCJuYW1lXCIpK1wiLVwiK2MuZ2VuZXJhdGVDaGFycygyKTpjLmdlbmVyYXRlQ2hhcnMoNCksYj1iLnJlcGxhY2UoLyg6fFxcLnxcXFt8XFxdfCwpL2csXCJcIiksYj1cInNlbGVjdDItXCIrYn0sZS5wcm90b3R5cGUuX3BsYWNlQ29udGFpbmVyPWZ1bmN0aW9uKGEpe2EuaW5zZXJ0QWZ0ZXIodGhpcy4kZWxlbWVudCk7dmFyIGI9dGhpcy5fcmVzb2x2ZVdpZHRoKHRoaXMuJGVsZW1lbnQsdGhpcy5vcHRpb25zLmdldChcIndpZHRoXCIpKTtudWxsIT1iJiZhLmNzcyhcIndpZHRoXCIsYil9LGUucHJvdG90eXBlLl9yZXNvbHZlV2lkdGg9ZnVuY3Rpb24oYSxiKXt2YXIgYz0vXndpZHRoOigoWy0rXT8oWzAtOV0qXFwuKT9bMC05XSspKHB4fGVtfGV4fCV8aW58Y218bW18cHR8cGMpKS9pO2lmKFwicmVzb2x2ZVwiPT1iKXt2YXIgZD10aGlzLl9yZXNvbHZlV2lkdGgoYSxcInN0eWxlXCIpO3JldHVybiBudWxsIT1kP2Q6dGhpcy5fcmVzb2x2ZVdpZHRoKGEsXCJlbGVtZW50XCIpfWlmKFwiZWxlbWVudFwiPT1iKXt2YXIgZT1hLm91dGVyV2lkdGgoITEpO3JldHVybiAwPj1lP1wiYXV0b1wiOmUrXCJweFwifWlmKFwic3R5bGVcIj09Yil7dmFyIGY9YS5hdHRyKFwic3R5bGVcIik7aWYoXCJzdHJpbmdcIiE9dHlwZW9mIGYpcmV0dXJuIG51bGw7Zm9yKHZhciBnPWYuc3BsaXQoXCI7XCIpLGg9MCxpPWcubGVuZ3RoO2k+aDtoKz0xKXt2YXIgaj1nW2hdLnJlcGxhY2UoL1xccy9nLFwiXCIpLGs9ai5tYXRjaChjKTtpZihudWxsIT09ayYmay5sZW5ndGg+PTEpcmV0dXJuIGtbMV19cmV0dXJuIG51bGx9cmV0dXJuIGJ9LGUucHJvdG90eXBlLl9iaW5kQWRhcHRlcnM9ZnVuY3Rpb24oKXt0aGlzLmRhdGFBZGFwdGVyLmJpbmQodGhpcyx0aGlzLiRjb250YWluZXIpLHRoaXMuc2VsZWN0aW9uLmJpbmQodGhpcyx0aGlzLiRjb250YWluZXIpLHRoaXMuZHJvcGRvd24uYmluZCh0aGlzLHRoaXMuJGNvbnRhaW5lciksdGhpcy5yZXN1bHRzLmJpbmQodGhpcyx0aGlzLiRjb250YWluZXIpfSxlLnByb3RvdHlwZS5fcmVnaXN0ZXJEb21FdmVudHM9ZnVuY3Rpb24oKXt2YXIgYj10aGlzO3RoaXMuJGVsZW1lbnQub24oXCJjaGFuZ2Uuc2VsZWN0MlwiLGZ1bmN0aW9uKCl7Yi5kYXRhQWRhcHRlci5jdXJyZW50KGZ1bmN0aW9uKGEpe2IudHJpZ2dlcihcInNlbGVjdGlvbjp1cGRhdGVcIix7ZGF0YTphfSl9KX0pLHRoaXMuJGVsZW1lbnQub24oXCJmb2N1cy5zZWxlY3QyXCIsZnVuY3Rpb24oYSl7Yi50cmlnZ2VyKFwiZm9jdXNcIixhKX0pLHRoaXMuX3N5bmNBPWMuYmluZCh0aGlzLl9zeW5jQXR0cmlidXRlcyx0aGlzKSx0aGlzLl9zeW5jUz1jLmJpbmQodGhpcy5fc3luY1N1YnRyZWUsdGhpcyksdGhpcy4kZWxlbWVudFswXS5hdHRhY2hFdmVudCYmdGhpcy4kZWxlbWVudFswXS5hdHRhY2hFdmVudChcIm9ucHJvcGVydHljaGFuZ2VcIix0aGlzLl9zeW5jQSk7dmFyIGQ9d2luZG93Lk11dGF0aW9uT2JzZXJ2ZXJ8fHdpbmRvdy5XZWJLaXRNdXRhdGlvbk9ic2VydmVyfHx3aW5kb3cuTW96TXV0YXRpb25PYnNlcnZlcjtudWxsIT1kPyh0aGlzLl9vYnNlcnZlcj1uZXcgZChmdW5jdGlvbihjKXthLmVhY2goYyxiLl9zeW5jQSksYS5lYWNoKGMsYi5fc3luY1MpfSksdGhpcy5fb2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzLiRlbGVtZW50WzBdLHthdHRyaWJ1dGVzOiEwLGNoaWxkTGlzdDohMCxzdWJ0cmVlOiExfSkpOnRoaXMuJGVsZW1lbnRbMF0uYWRkRXZlbnRMaXN0ZW5lciYmKHRoaXMuJGVsZW1lbnRbMF0uYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUF0dHJNb2RpZmllZFwiLGIuX3N5bmNBLCExKSx0aGlzLiRlbGVtZW50WzBdLmFkZEV2ZW50TGlzdGVuZXIoXCJET01Ob2RlSW5zZXJ0ZWRcIixiLl9zeW5jUywhMSksdGhpcy4kZWxlbWVudFswXS5hZGRFdmVudExpc3RlbmVyKFwiRE9NTm9kZVJlbW92ZWRcIixiLl9zeW5jUywhMSkpfSxlLnByb3RvdHlwZS5fcmVnaXN0ZXJEYXRhRXZlbnRzPWZ1bmN0aW9uKCl7dmFyIGE9dGhpczt0aGlzLmRhdGFBZGFwdGVyLm9uKFwiKlwiLGZ1bmN0aW9uKGIsYyl7YS50cmlnZ2VyKGIsYyl9KX0sZS5wcm90b3R5cGUuX3JlZ2lzdGVyU2VsZWN0aW9uRXZlbnRzPWZ1bmN0aW9uKCl7dmFyIGI9dGhpcyxjPVtcInRvZ2dsZVwiLFwiZm9jdXNcIl07dGhpcy5zZWxlY3Rpb24ub24oXCJ0b2dnbGVcIixmdW5jdGlvbigpe2IudG9nZ2xlRHJvcGRvd24oKX0pLHRoaXMuc2VsZWN0aW9uLm9uKFwiZm9jdXNcIixmdW5jdGlvbihhKXtiLmZvY3VzKGEpfSksdGhpcy5zZWxlY3Rpb24ub24oXCIqXCIsZnVuY3Rpb24oZCxlKXstMT09PWEuaW5BcnJheShkLGMpJiZiLnRyaWdnZXIoZCxlKX0pfSxlLnByb3RvdHlwZS5fcmVnaXN0ZXJEcm9wZG93bkV2ZW50cz1mdW5jdGlvbigpe3ZhciBhPXRoaXM7dGhpcy5kcm9wZG93bi5vbihcIipcIixmdW5jdGlvbihiLGMpe2EudHJpZ2dlcihiLGMpfSl9LGUucHJvdG90eXBlLl9yZWdpc3RlclJlc3VsdHNFdmVudHM9ZnVuY3Rpb24oKXt2YXIgYT10aGlzO3RoaXMucmVzdWx0cy5vbihcIipcIixmdW5jdGlvbihiLGMpe2EudHJpZ2dlcihiLGMpfSl9LGUucHJvdG90eXBlLl9yZWdpc3RlckV2ZW50cz1mdW5jdGlvbigpe3ZhciBhPXRoaXM7dGhpcy5vbihcIm9wZW5cIixmdW5jdGlvbigpe2EuJGNvbnRhaW5lci5hZGRDbGFzcyhcInNlbGVjdDItY29udGFpbmVyLS1vcGVuXCIpfSksdGhpcy5vbihcImNsb3NlXCIsZnVuY3Rpb24oKXthLiRjb250YWluZXIucmVtb3ZlQ2xhc3MoXCJzZWxlY3QyLWNvbnRhaW5lci0tb3BlblwiKX0pLHRoaXMub24oXCJlbmFibGVcIixmdW5jdGlvbigpe2EuJGNvbnRhaW5lci5yZW1vdmVDbGFzcyhcInNlbGVjdDItY29udGFpbmVyLS1kaXNhYmxlZFwiKX0pLHRoaXMub24oXCJkaXNhYmxlXCIsZnVuY3Rpb24oKXthLiRjb250YWluZXIuYWRkQ2xhc3MoXCJzZWxlY3QyLWNvbnRhaW5lci0tZGlzYWJsZWRcIil9KSx0aGlzLm9uKFwiYmx1clwiLGZ1bmN0aW9uKCl7YS4kY29udGFpbmVyLnJlbW92ZUNsYXNzKFwic2VsZWN0Mi1jb250YWluZXItLWZvY3VzXCIpfSksdGhpcy5vbihcInF1ZXJ5XCIsZnVuY3Rpb24oYil7YS5pc09wZW4oKXx8YS50cmlnZ2VyKFwib3BlblwiLHt9KSx0aGlzLmRhdGFBZGFwdGVyLnF1ZXJ5KGIsZnVuY3Rpb24oYyl7YS50cmlnZ2VyKFwicmVzdWx0czphbGxcIix7ZGF0YTpjLHF1ZXJ5OmJ9KX0pfSksdGhpcy5vbihcInF1ZXJ5OmFwcGVuZFwiLGZ1bmN0aW9uKGIpe3RoaXMuZGF0YUFkYXB0ZXIucXVlcnkoYixmdW5jdGlvbihjKXthLnRyaWdnZXIoXCJyZXN1bHRzOmFwcGVuZFwiLHtkYXRhOmMscXVlcnk6Yn0pfSl9KSx0aGlzLm9uKFwia2V5cHJlc3NcIixmdW5jdGlvbihiKXt2YXIgYz1iLndoaWNoO2EuaXNPcGVuKCk/Yz09PWQuRVNDfHxjPT09ZC5UQUJ8fGM9PT1kLlVQJiZiLmFsdEtleT8oYS5jbG9zZSgpLGIucHJldmVudERlZmF1bHQoKSk6Yz09PWQuRU5URVI/KGEudHJpZ2dlcihcInJlc3VsdHM6c2VsZWN0XCIse30pLGIucHJldmVudERlZmF1bHQoKSk6Yz09PWQuU1BBQ0UmJmIuY3RybEtleT8oYS50cmlnZ2VyKFwicmVzdWx0czp0b2dnbGVcIix7fSksYi5wcmV2ZW50RGVmYXVsdCgpKTpjPT09ZC5VUD8oYS50cmlnZ2VyKFwicmVzdWx0czpwcmV2aW91c1wiLHt9KSxiLnByZXZlbnREZWZhdWx0KCkpOmM9PT1kLkRPV04mJihhLnRyaWdnZXIoXCJyZXN1bHRzOm5leHRcIix7fSksYi5wcmV2ZW50RGVmYXVsdCgpKTooYz09PWQuRU5URVJ8fGM9PT1kLlNQQUNFfHxjPT09ZC5ET1dOJiZiLmFsdEtleSkmJihhLm9wZW4oKSxiLnByZXZlbnREZWZhdWx0KCkpfSl9LGUucHJvdG90eXBlLl9zeW5jQXR0cmlidXRlcz1mdW5jdGlvbigpe3RoaXMub3B0aW9ucy5zZXQoXCJkaXNhYmxlZFwiLHRoaXMuJGVsZW1lbnQucHJvcChcImRpc2FibGVkXCIpKSx0aGlzLm9wdGlvbnMuZ2V0KFwiZGlzYWJsZWRcIik/KHRoaXMuaXNPcGVuKCkmJnRoaXMuY2xvc2UoKSx0aGlzLnRyaWdnZXIoXCJkaXNhYmxlXCIse30pKTp0aGlzLnRyaWdnZXIoXCJlbmFibGVcIix7fSl9LGUucHJvdG90eXBlLl9zeW5jU3VidHJlZT1mdW5jdGlvbihhLGIpe3ZhciBjPSExLGQ9dGhpcztpZighYXx8IWEudGFyZ2V0fHxcIk9QVElPTlwiPT09YS50YXJnZXQubm9kZU5hbWV8fFwiT1BUR1JPVVBcIj09PWEudGFyZ2V0Lm5vZGVOYW1lKXtpZihiKWlmKGIuYWRkZWROb2RlcyYmYi5hZGRlZE5vZGVzLmxlbmd0aD4wKWZvcih2YXIgZT0wO2U8Yi5hZGRlZE5vZGVzLmxlbmd0aDtlKyspe3ZhciBmPWIuYWRkZWROb2Rlc1tlXTtmLnNlbGVjdGVkJiYoYz0hMCl9ZWxzZSBiLnJlbW92ZWROb2RlcyYmYi5yZW1vdmVkTm9kZXMubGVuZ3RoPjAmJihjPSEwKTtlbHNlIGM9ITA7YyYmdGhpcy5kYXRhQWRhcHRlci5jdXJyZW50KGZ1bmN0aW9uKGEpe2QudHJpZ2dlcihcInNlbGVjdGlvbjp1cGRhdGVcIix7ZGF0YTphfSl9KX19LGUucHJvdG90eXBlLnRyaWdnZXI9ZnVuY3Rpb24oYSxiKXt2YXIgYz1lLl9fc3VwZXJfXy50cmlnZ2VyLGQ9e29wZW46XCJvcGVuaW5nXCIsY2xvc2U6XCJjbG9zaW5nXCIsc2VsZWN0Olwic2VsZWN0aW5nXCIsdW5zZWxlY3Q6XCJ1bnNlbGVjdGluZ1wifTtpZih2b2lkIDA9PT1iJiYoYj17fSksYSBpbiBkKXt2YXIgZj1kW2FdLGc9e3ByZXZlbnRlZDohMSxuYW1lOmEsYXJnczpifTtpZihjLmNhbGwodGhpcyxmLGcpLGcucHJldmVudGVkKXJldHVybiB2b2lkKGIucHJldmVudGVkPSEwKX1jLmNhbGwodGhpcyxhLGIpfSxlLnByb3RvdHlwZS50b2dnbGVEcm9wZG93bj1mdW5jdGlvbigpe3RoaXMub3B0aW9ucy5nZXQoXCJkaXNhYmxlZFwiKXx8KHRoaXMuaXNPcGVuKCk/dGhpcy5jbG9zZSgpOnRoaXMub3BlbigpKX0sZS5wcm90b3R5cGUub3Blbj1mdW5jdGlvbigpe3RoaXMuaXNPcGVuKCl8fHRoaXMudHJpZ2dlcihcInF1ZXJ5XCIse30pfSxlLnByb3RvdHlwZS5jbG9zZT1mdW5jdGlvbigpe3RoaXMuaXNPcGVuKCkmJnRoaXMudHJpZ2dlcihcImNsb3NlXCIse30pfSxlLnByb3RvdHlwZS5pc09wZW49ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy4kY29udGFpbmVyLmhhc0NsYXNzKFwic2VsZWN0Mi1jb250YWluZXItLW9wZW5cIil9LGUucHJvdG90eXBlLmhhc0ZvY3VzPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuJGNvbnRhaW5lci5oYXNDbGFzcyhcInNlbGVjdDItY29udGFpbmVyLS1mb2N1c1wiKX0sZS5wcm90b3R5cGUuZm9jdXM9ZnVuY3Rpb24oYSl7dGhpcy5oYXNGb2N1cygpfHwodGhpcy4kY29udGFpbmVyLmFkZENsYXNzKFwic2VsZWN0Mi1jb250YWluZXItLWZvY3VzXCIpLHRoaXMudHJpZ2dlcihcImZvY3VzXCIse30pKX0sZS5wcm90b3R5cGUuZW5hYmxlPWZ1bmN0aW9uKGEpe3RoaXMub3B0aW9ucy5nZXQoXCJkZWJ1Z1wiKSYmd2luZG93LmNvbnNvbGUmJmNvbnNvbGUud2FybiYmY29uc29sZS53YXJuKCdTZWxlY3QyOiBUaGUgYHNlbGVjdDIoXCJlbmFibGVcIilgIG1ldGhvZCBoYXMgYmVlbiBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gbGF0ZXIgU2VsZWN0MiB2ZXJzaW9ucy4gVXNlICRlbGVtZW50LnByb3AoXCJkaXNhYmxlZFwiKSBpbnN0ZWFkLicpLChudWxsPT1hfHwwPT09YS5sZW5ndGgpJiYoYT1bITBdKTt2YXIgYj0hYVswXTt0aGlzLiRlbGVtZW50LnByb3AoXCJkaXNhYmxlZFwiLGIpfSxlLnByb3RvdHlwZS5kYXRhPWZ1bmN0aW9uKCl7dGhpcy5vcHRpb25zLmdldChcImRlYnVnXCIpJiZhcmd1bWVudHMubGVuZ3RoPjAmJndpbmRvdy5jb25zb2xlJiZjb25zb2xlLndhcm4mJmNvbnNvbGUud2FybignU2VsZWN0MjogRGF0YSBjYW4gbm8gbG9uZ2VyIGJlIHNldCB1c2luZyBgc2VsZWN0MihcImRhdGFcIilgLiBZb3Ugc2hvdWxkIGNvbnNpZGVyIHNldHRpbmcgdGhlIHZhbHVlIGluc3RlYWQgdXNpbmcgYCRlbGVtZW50LnZhbCgpYC4nKTt2YXIgYT1bXTtyZXR1cm4gdGhpcy5kYXRhQWRhcHRlci5jdXJyZW50KGZ1bmN0aW9uKGIpe2E9Yn0pLGF9LGUucHJvdG90eXBlLnZhbD1mdW5jdGlvbihiKXtpZih0aGlzLm9wdGlvbnMuZ2V0KFwiZGVidWdcIikmJndpbmRvdy5jb25zb2xlJiZjb25zb2xlLndhcm4mJmNvbnNvbGUud2FybignU2VsZWN0MjogVGhlIGBzZWxlY3QyKFwidmFsXCIpYCBtZXRob2QgaGFzIGJlZW4gZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIGxhdGVyIFNlbGVjdDIgdmVyc2lvbnMuIFVzZSAkZWxlbWVudC52YWwoKSBpbnN0ZWFkLicpLG51bGw9PWJ8fDA9PT1iLmxlbmd0aClyZXR1cm4gdGhpcy4kZWxlbWVudC52YWwoKTt2YXIgYz1iWzBdO2EuaXNBcnJheShjKSYmKGM9YS5tYXAoYyxmdW5jdGlvbihhKXtyZXR1cm4gYS50b1N0cmluZygpfSkpLHRoaXMuJGVsZW1lbnQudmFsKGMpLnRyaWdnZXIoXCJjaGFuZ2VcIil9LGUucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLiRjb250YWluZXIucmVtb3ZlKCksdGhpcy4kZWxlbWVudFswXS5kZXRhY2hFdmVudCYmdGhpcy4kZWxlbWVudFswXS5kZXRhY2hFdmVudChcIm9ucHJvcGVydHljaGFuZ2VcIix0aGlzLl9zeW5jQSksbnVsbCE9dGhpcy5fb2JzZXJ2ZXI/KHRoaXMuX29ic2VydmVyLmRpc2Nvbm5lY3QoKSx0aGlzLl9vYnNlcnZlcj1udWxsKTp0aGlzLiRlbGVtZW50WzBdLnJlbW92ZUV2ZW50TGlzdGVuZXImJih0aGlzLiRlbGVtZW50WzBdLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJET01BdHRyTW9kaWZpZWRcIix0aGlzLl9zeW5jQSwhMSksdGhpcy4kZWxlbWVudFswXS5yZW1vdmVFdmVudExpc3RlbmVyKFwiRE9NTm9kZUluc2VydGVkXCIsdGhpcy5fc3luY1MsITEpLHRoaXMuJGVsZW1lbnRbMF0ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIkRPTU5vZGVSZW1vdmVkXCIsdGhpcy5fc3luY1MsITEpKSx0aGlzLl9zeW5jQT1udWxsLHRoaXMuX3N5bmNTPW51bGwsdGhpcy4kZWxlbWVudC5vZmYoXCIuc2VsZWN0MlwiKSx0aGlzLiRlbGVtZW50LmF0dHIoXCJ0YWJpbmRleFwiLHRoaXMuJGVsZW1lbnQuZGF0YShcIm9sZC10YWJpbmRleFwiKSksdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyhcInNlbGVjdDItaGlkZGVuLWFjY2Vzc2libGVcIiksdGhpcy4kZWxlbWVudC5hdHRyKFwiYXJpYS1oaWRkZW5cIixcImZhbHNlXCIpLHRoaXMuJGVsZW1lbnQucmVtb3ZlRGF0YShcInNlbGVjdDJcIiksdGhpcy5kYXRhQWRhcHRlci5kZXN0cm95KCksdGhpcy5zZWxlY3Rpb24uZGVzdHJveSgpLHRoaXMuZHJvcGRvd24uZGVzdHJveSgpLHRoaXMucmVzdWx0cy5kZXN0cm95KCksdGhpcy5kYXRhQWRhcHRlcj1udWxsLHRoaXMuc2VsZWN0aW9uPW51bGwsdGhpcy5kcm9wZG93bj1udWxsLHRoaXMucmVzdWx0cz1udWxsO1xufSxlLnByb3RvdHlwZS5yZW5kZXI9ZnVuY3Rpb24oKXt2YXIgYj1hKCc8c3BhbiBjbGFzcz1cInNlbGVjdDIgc2VsZWN0Mi1jb250YWluZXJcIj48c3BhbiBjbGFzcz1cInNlbGVjdGlvblwiPjwvc3Bhbj48c3BhbiBjbGFzcz1cImRyb3Bkb3duLXdyYXBwZXJcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L3NwYW4+PC9zcGFuPicpO3JldHVybiBiLmF0dHIoXCJkaXJcIix0aGlzLm9wdGlvbnMuZ2V0KFwiZGlyXCIpKSx0aGlzLiRjb250YWluZXI9Yix0aGlzLiRjb250YWluZXIuYWRkQ2xhc3MoXCJzZWxlY3QyLWNvbnRhaW5lci0tXCIrdGhpcy5vcHRpb25zLmdldChcInRoZW1lXCIpKSxiLmRhdGEoXCJlbGVtZW50XCIsdGhpcy4kZWxlbWVudCksYn0sZX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9jb21wYXQvdXRpbHNcIixbXCJqcXVlcnlcIl0sZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYihiLGMsZCl7dmFyIGUsZixnPVtdO2U9YS50cmltKGIuYXR0cihcImNsYXNzXCIpKSxlJiYoZT1cIlwiK2UsYShlLnNwbGl0KC9cXHMrLykpLmVhY2goZnVuY3Rpb24oKXswPT09dGhpcy5pbmRleE9mKFwic2VsZWN0Mi1cIikmJmcucHVzaCh0aGlzKX0pKSxlPWEudHJpbShjLmF0dHIoXCJjbGFzc1wiKSksZSYmKGU9XCJcIitlLGEoZS5zcGxpdCgvXFxzKy8pKS5lYWNoKGZ1bmN0aW9uKCl7MCE9PXRoaXMuaW5kZXhPZihcInNlbGVjdDItXCIpJiYoZj1kKHRoaXMpLG51bGwhPWYmJmcucHVzaChmKSl9KSksYi5hdHRyKFwiY2xhc3NcIixnLmpvaW4oXCIgXCIpKX1yZXR1cm57c3luY0Nzc0NsYXNzZXM6Yn19KSxiLmRlZmluZShcInNlbGVjdDIvY29tcGF0L2NvbnRhaW5lckNzc1wiLFtcImpxdWVyeVwiLFwiLi91dGlsc1wiXSxmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYSl7cmV0dXJuIG51bGx9ZnVuY3Rpb24gZCgpe31yZXR1cm4gZC5wcm90b3R5cGUucmVuZGVyPWZ1bmN0aW9uKGQpe3ZhciBlPWQuY2FsbCh0aGlzKSxmPXRoaXMub3B0aW9ucy5nZXQoXCJjb250YWluZXJDc3NDbGFzc1wiKXx8XCJcIjthLmlzRnVuY3Rpb24oZikmJihmPWYodGhpcy4kZWxlbWVudCkpO3ZhciBnPXRoaXMub3B0aW9ucy5nZXQoXCJhZGFwdENvbnRhaW5lckNzc0NsYXNzXCIpO2lmKGc9Z3x8YywtMSE9PWYuaW5kZXhPZihcIjphbGw6XCIpKXtmPWYucmVwbGFjZShcIjphbGw6XCIsXCJcIik7dmFyIGg9ZztnPWZ1bmN0aW9uKGEpe3ZhciBiPWgoYSk7cmV0dXJuIG51bGwhPWI/YitcIiBcIithOmF9fXZhciBpPXRoaXMub3B0aW9ucy5nZXQoXCJjb250YWluZXJDc3NcIil8fHt9O3JldHVybiBhLmlzRnVuY3Rpb24oaSkmJihpPWkodGhpcy4kZWxlbWVudCkpLGIuc3luY0Nzc0NsYXNzZXMoZSx0aGlzLiRlbGVtZW50LGcpLGUuY3NzKGkpLGUuYWRkQ2xhc3MoZiksZX0sZH0pLGIuZGVmaW5lKFwic2VsZWN0Mi9jb21wYXQvZHJvcGRvd25Dc3NcIixbXCJqcXVlcnlcIixcIi4vdXRpbHNcIl0sZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGEpe3JldHVybiBudWxsfWZ1bmN0aW9uIGQoKXt9cmV0dXJuIGQucHJvdG90eXBlLnJlbmRlcj1mdW5jdGlvbihkKXt2YXIgZT1kLmNhbGwodGhpcyksZj10aGlzLm9wdGlvbnMuZ2V0KFwiZHJvcGRvd25Dc3NDbGFzc1wiKXx8XCJcIjthLmlzRnVuY3Rpb24oZikmJihmPWYodGhpcy4kZWxlbWVudCkpO3ZhciBnPXRoaXMub3B0aW9ucy5nZXQoXCJhZGFwdERyb3Bkb3duQ3NzQ2xhc3NcIik7aWYoZz1nfHxjLC0xIT09Zi5pbmRleE9mKFwiOmFsbDpcIikpe2Y9Zi5yZXBsYWNlKFwiOmFsbDpcIixcIlwiKTt2YXIgaD1nO2c9ZnVuY3Rpb24oYSl7dmFyIGI9aChhKTtyZXR1cm4gbnVsbCE9Yj9iK1wiIFwiK2E6YX19dmFyIGk9dGhpcy5vcHRpb25zLmdldChcImRyb3Bkb3duQ3NzXCIpfHx7fTtyZXR1cm4gYS5pc0Z1bmN0aW9uKGkpJiYoaT1pKHRoaXMuJGVsZW1lbnQpKSxiLnN5bmNDc3NDbGFzc2VzKGUsdGhpcy4kZWxlbWVudCxnKSxlLmNzcyhpKSxlLmFkZENsYXNzKGYpLGV9LGR9KSxiLmRlZmluZShcInNlbGVjdDIvY29tcGF0L2luaXRTZWxlY3Rpb25cIixbXCJqcXVlcnlcIl0sZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYihhLGIsYyl7Yy5nZXQoXCJkZWJ1Z1wiKSYmd2luZG93LmNvbnNvbGUmJmNvbnNvbGUud2FybiYmY29uc29sZS53YXJuKFwiU2VsZWN0MjogVGhlIGBpbml0U2VsZWN0aW9uYCBvcHRpb24gaGFzIGJlZW4gZGVwcmVjYXRlZCBpbiBmYXZvciBvZiBhIGN1c3RvbSBkYXRhIGFkYXB0ZXIgdGhhdCBvdmVycmlkZXMgdGhlIGBjdXJyZW50YCBtZXRob2QuIFRoaXMgbWV0aG9kIGlzIG5vdyBjYWxsZWQgbXVsdGlwbGUgdGltZXMgaW5zdGVhZCBvZiBhIHNpbmdsZSB0aW1lIHdoZW4gdGhlIGluc3RhbmNlIGlzIGluaXRpYWxpemVkLiBTdXBwb3J0IHdpbGwgYmUgcmVtb3ZlZCBmb3IgdGhlIGBpbml0U2VsZWN0aW9uYCBvcHRpb24gaW4gZnV0dXJlIHZlcnNpb25zIG9mIFNlbGVjdDJcIiksdGhpcy5pbml0U2VsZWN0aW9uPWMuZ2V0KFwiaW5pdFNlbGVjdGlvblwiKSx0aGlzLl9pc0luaXRpYWxpemVkPSExLGEuY2FsbCh0aGlzLGIsYyl9cmV0dXJuIGIucHJvdG90eXBlLmN1cnJlbnQ9ZnVuY3Rpb24oYixjKXt2YXIgZD10aGlzO3JldHVybiB0aGlzLl9pc0luaXRpYWxpemVkP3ZvaWQgYi5jYWxsKHRoaXMsYyk6dm9pZCB0aGlzLmluaXRTZWxlY3Rpb24uY2FsbChudWxsLHRoaXMuJGVsZW1lbnQsZnVuY3Rpb24oYil7ZC5faXNJbml0aWFsaXplZD0hMCxhLmlzQXJyYXkoYil8fChiPVtiXSksYyhiKX0pfSxifSksYi5kZWZpbmUoXCJzZWxlY3QyL2NvbXBhdC9pbnB1dERhdGFcIixbXCJqcXVlcnlcIl0sZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYihhLGIsYyl7dGhpcy5fY3VycmVudERhdGE9W10sdGhpcy5fdmFsdWVTZXBhcmF0b3I9Yy5nZXQoXCJ2YWx1ZVNlcGFyYXRvclwiKXx8XCIsXCIsXCJoaWRkZW5cIj09PWIucHJvcChcInR5cGVcIikmJmMuZ2V0KFwiZGVidWdcIikmJmNvbnNvbGUmJmNvbnNvbGUud2FybiYmY29uc29sZS53YXJuKFwiU2VsZWN0MjogVXNpbmcgYSBoaWRkZW4gaW5wdXQgd2l0aCBTZWxlY3QyIGlzIG5vIGxvbmdlciBzdXBwb3J0ZWQgYW5kIG1heSBzdG9wIHdvcmtpbmcgaW4gdGhlIGZ1dHVyZS4gSXQgaXMgcmVjb21tZW5kZWQgdG8gdXNlIGEgYDxzZWxlY3Q+YCBlbGVtZW50IGluc3RlYWQuXCIpLGEuY2FsbCh0aGlzLGIsYyl9cmV0dXJuIGIucHJvdG90eXBlLmN1cnJlbnQ9ZnVuY3Rpb24oYixjKXtmdW5jdGlvbiBkKGIsYyl7dmFyIGU9W107cmV0dXJuIGIuc2VsZWN0ZWR8fC0xIT09YS5pbkFycmF5KGIuaWQsYyk/KGIuc2VsZWN0ZWQ9ITAsZS5wdXNoKGIpKTpiLnNlbGVjdGVkPSExLGIuY2hpbGRyZW4mJmUucHVzaC5hcHBseShlLGQoYi5jaGlsZHJlbixjKSksZX1mb3IodmFyIGU9W10sZj0wO2Y8dGhpcy5fY3VycmVudERhdGEubGVuZ3RoO2YrKyl7dmFyIGc9dGhpcy5fY3VycmVudERhdGFbZl07ZS5wdXNoLmFwcGx5KGUsZChnLHRoaXMuJGVsZW1lbnQudmFsKCkuc3BsaXQodGhpcy5fdmFsdWVTZXBhcmF0b3IpKSl9YyhlKX0sYi5wcm90b3R5cGUuc2VsZWN0PWZ1bmN0aW9uKGIsYyl7aWYodGhpcy5vcHRpb25zLmdldChcIm11bHRpcGxlXCIpKXt2YXIgZD10aGlzLiRlbGVtZW50LnZhbCgpO2QrPXRoaXMuX3ZhbHVlU2VwYXJhdG9yK2MuaWQsdGhpcy4kZWxlbWVudC52YWwoZCksdGhpcy4kZWxlbWVudC50cmlnZ2VyKFwiY2hhbmdlXCIpfWVsc2UgdGhpcy5jdXJyZW50KGZ1bmN0aW9uKGIpe2EubWFwKGIsZnVuY3Rpb24oYSl7YS5zZWxlY3RlZD0hMX0pfSksdGhpcy4kZWxlbWVudC52YWwoYy5pZCksdGhpcy4kZWxlbWVudC50cmlnZ2VyKFwiY2hhbmdlXCIpfSxiLnByb3RvdHlwZS51bnNlbGVjdD1mdW5jdGlvbihhLGIpe3ZhciBjPXRoaXM7Yi5zZWxlY3RlZD0hMSx0aGlzLmN1cnJlbnQoZnVuY3Rpb24oYSl7Zm9yKHZhciBkPVtdLGU9MDtlPGEubGVuZ3RoO2UrKyl7dmFyIGY9YVtlXTtiLmlkIT1mLmlkJiZkLnB1c2goZi5pZCl9Yy4kZWxlbWVudC52YWwoZC5qb2luKGMuX3ZhbHVlU2VwYXJhdG9yKSksYy4kZWxlbWVudC50cmlnZ2VyKFwiY2hhbmdlXCIpfSl9LGIucHJvdG90eXBlLnF1ZXJ5PWZ1bmN0aW9uKGEsYixjKXtmb3IodmFyIGQ9W10sZT0wO2U8dGhpcy5fY3VycmVudERhdGEubGVuZ3RoO2UrKyl7dmFyIGY9dGhpcy5fY3VycmVudERhdGFbZV0sZz10aGlzLm1hdGNoZXMoYixmKTtudWxsIT09ZyYmZC5wdXNoKGcpfWMoe3Jlc3VsdHM6ZH0pfSxiLnByb3RvdHlwZS5hZGRPcHRpb25zPWZ1bmN0aW9uKGIsYyl7dmFyIGQ9YS5tYXAoYyxmdW5jdGlvbihiKXtyZXR1cm4gYS5kYXRhKGJbMF0sXCJkYXRhXCIpfSk7dGhpcy5fY3VycmVudERhdGEucHVzaC5hcHBseSh0aGlzLl9jdXJyZW50RGF0YSxkKX0sYn0pLGIuZGVmaW5lKFwic2VsZWN0Mi9jb21wYXQvbWF0Y2hlclwiLFtcImpxdWVyeVwiXSxmdW5jdGlvbihhKXtmdW5jdGlvbiBiKGIpe2Z1bmN0aW9uIGMoYyxkKXt2YXIgZT1hLmV4dGVuZCghMCx7fSxkKTtpZihudWxsPT1jLnRlcm18fFwiXCI9PT1hLnRyaW0oYy50ZXJtKSlyZXR1cm4gZTtpZihkLmNoaWxkcmVuKXtmb3IodmFyIGY9ZC5jaGlsZHJlbi5sZW5ndGgtMTtmPj0wO2YtLSl7dmFyIGc9ZC5jaGlsZHJlbltmXSxoPWIoYy50ZXJtLGcudGV4dCxnKTtofHxlLmNoaWxkcmVuLnNwbGljZShmLDEpfWlmKGUuY2hpbGRyZW4ubGVuZ3RoPjApcmV0dXJuIGV9cmV0dXJuIGIoYy50ZXJtLGQudGV4dCxkKT9lOm51bGx9cmV0dXJuIGN9cmV0dXJuIGJ9KSxiLmRlZmluZShcInNlbGVjdDIvY29tcGF0L3F1ZXJ5XCIsW10sZnVuY3Rpb24oKXtmdW5jdGlvbiBhKGEsYixjKXtjLmdldChcImRlYnVnXCIpJiZ3aW5kb3cuY29uc29sZSYmY29uc29sZS53YXJuJiZjb25zb2xlLndhcm4oXCJTZWxlY3QyOiBUaGUgYHF1ZXJ5YCBvcHRpb24gaGFzIGJlZW4gZGVwcmVjYXRlZCBpbiBmYXZvciBvZiBhIGN1c3RvbSBkYXRhIGFkYXB0ZXIgdGhhdCBvdmVycmlkZXMgdGhlIGBxdWVyeWAgbWV0aG9kLiBTdXBwb3J0IHdpbGwgYmUgcmVtb3ZlZCBmb3IgdGhlIGBxdWVyeWAgb3B0aW9uIGluIGZ1dHVyZSB2ZXJzaW9ucyBvZiBTZWxlY3QyLlwiKSxhLmNhbGwodGhpcyxiLGMpfXJldHVybiBhLnByb3RvdHlwZS5xdWVyeT1mdW5jdGlvbihhLGIsYyl7Yi5jYWxsYmFjaz1jO3ZhciBkPXRoaXMub3B0aW9ucy5nZXQoXCJxdWVyeVwiKTtkLmNhbGwobnVsbCxiKX0sYX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kcm9wZG93bi9hdHRhY2hDb250YWluZXJcIixbXSxmdW5jdGlvbigpe2Z1bmN0aW9uIGEoYSxiLGMpe2EuY2FsbCh0aGlzLGIsYyl9cmV0dXJuIGEucHJvdG90eXBlLnBvc2l0aW9uPWZ1bmN0aW9uKGEsYixjKXt2YXIgZD1jLmZpbmQoXCIuZHJvcGRvd24td3JhcHBlclwiKTtkLmFwcGVuZChiKSxiLmFkZENsYXNzKFwic2VsZWN0Mi1kcm9wZG93bi0tYmVsb3dcIiksYy5hZGRDbGFzcyhcInNlbGVjdDItY29udGFpbmVyLS1iZWxvd1wiKX0sYX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kcm9wZG93bi9zdG9wUHJvcGFnYXRpb25cIixbXSxmdW5jdGlvbigpe2Z1bmN0aW9uIGEoKXt9cmV0dXJuIGEucHJvdG90eXBlLmJpbmQ9ZnVuY3Rpb24oYSxiLGMpe2EuY2FsbCh0aGlzLGIsYyk7dmFyIGQ9W1wiYmx1clwiLFwiY2hhbmdlXCIsXCJjbGlja1wiLFwiZGJsY2xpY2tcIixcImZvY3VzXCIsXCJmb2N1c2luXCIsXCJmb2N1c291dFwiLFwiaW5wdXRcIixcImtleWRvd25cIixcImtleXVwXCIsXCJrZXlwcmVzc1wiLFwibW91c2Vkb3duXCIsXCJtb3VzZWVudGVyXCIsXCJtb3VzZWxlYXZlXCIsXCJtb3VzZW1vdmVcIixcIm1vdXNlb3ZlclwiLFwibW91c2V1cFwiLFwic2VhcmNoXCIsXCJ0b3VjaGVuZFwiLFwidG91Y2hzdGFydFwiXTt0aGlzLiRkcm9wZG93bi5vbihkLmpvaW4oXCIgXCIpLGZ1bmN0aW9uKGEpe2Euc3RvcFByb3BhZ2F0aW9uKCl9KX0sYX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9zZWxlY3Rpb24vc3RvcFByb3BhZ2F0aW9uXCIsW10sZnVuY3Rpb24oKXtmdW5jdGlvbiBhKCl7fXJldHVybiBhLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGEsYixjKXthLmNhbGwodGhpcyxiLGMpO3ZhciBkPVtcImJsdXJcIixcImNoYW5nZVwiLFwiY2xpY2tcIixcImRibGNsaWNrXCIsXCJmb2N1c1wiLFwiZm9jdXNpblwiLFwiZm9jdXNvdXRcIixcImlucHV0XCIsXCJrZXlkb3duXCIsXCJrZXl1cFwiLFwia2V5cHJlc3NcIixcIm1vdXNlZG93blwiLFwibW91c2VlbnRlclwiLFwibW91c2VsZWF2ZVwiLFwibW91c2Vtb3ZlXCIsXCJtb3VzZW92ZXJcIixcIm1vdXNldXBcIixcInNlYXJjaFwiLFwidG91Y2hlbmRcIixcInRvdWNoc3RhcnRcIl07dGhpcy4kc2VsZWN0aW9uLm9uKGQuam9pbihcIiBcIiksZnVuY3Rpb24oYSl7YS5zdG9wUHJvcGFnYXRpb24oKX0pfSxhfSksZnVuY3Rpb24oYyl7XCJmdW5jdGlvblwiPT10eXBlb2YgYi5kZWZpbmUmJmIuZGVmaW5lLmFtZD9iLmRlZmluZShcImpxdWVyeS1tb3VzZXdoZWVsXCIsW1wianF1ZXJ5XCJdLGMpOlwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP21vZHVsZS5leHBvcnRzPWM6YyhhKX0oZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYihiKXt2YXIgZz1ifHx3aW5kb3cuZXZlbnQsaD1pLmNhbGwoYXJndW1lbnRzLDEpLGo9MCxsPTAsbT0wLG49MCxvPTAscD0wO2lmKGI9YS5ldmVudC5maXgoZyksYi50eXBlPVwibW91c2V3aGVlbFwiLFwiZGV0YWlsXCJpbiBnJiYobT0tMSpnLmRldGFpbCksXCJ3aGVlbERlbHRhXCJpbiBnJiYobT1nLndoZWVsRGVsdGEpLFwid2hlZWxEZWx0YVlcImluIGcmJihtPWcud2hlZWxEZWx0YVkpLFwid2hlZWxEZWx0YVhcImluIGcmJihsPS0xKmcud2hlZWxEZWx0YVgpLFwiYXhpc1wiaW4gZyYmZy5heGlzPT09Zy5IT1JJWk9OVEFMX0FYSVMmJihsPS0xKm0sbT0wKSxqPTA9PT1tP2w6bSxcImRlbHRhWVwiaW4gZyYmKG09LTEqZy5kZWx0YVksaj1tKSxcImRlbHRhWFwiaW4gZyYmKGw9Zy5kZWx0YVgsMD09PW0mJihqPS0xKmwpKSwwIT09bXx8MCE9PWwpe2lmKDE9PT1nLmRlbHRhTW9kZSl7dmFyIHE9YS5kYXRhKHRoaXMsXCJtb3VzZXdoZWVsLWxpbmUtaGVpZ2h0XCIpO2oqPXEsbSo9cSxsKj1xfWVsc2UgaWYoMj09PWcuZGVsdGFNb2RlKXt2YXIgcj1hLmRhdGEodGhpcyxcIm1vdXNld2hlZWwtcGFnZS1oZWlnaHRcIik7aio9cixtKj1yLGwqPXJ9aWYobj1NYXRoLm1heChNYXRoLmFicyhtKSxNYXRoLmFicyhsKSksKCFmfHxmPm4pJiYoZj1uLGQoZyxuKSYmKGYvPTQwKSksZChnLG4pJiYoai89NDAsbC89NDAsbS89NDApLGo9TWF0aFtqPj0xP1wiZmxvb3JcIjpcImNlaWxcIl0oai9mKSxsPU1hdGhbbD49MT9cImZsb29yXCI6XCJjZWlsXCJdKGwvZiksbT1NYXRoW20+PTE/XCJmbG9vclwiOlwiY2VpbFwiXShtL2YpLGsuc2V0dGluZ3Mubm9ybWFsaXplT2Zmc2V0JiZ0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCl7dmFyIHM9dGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtvPWIuY2xpZW50WC1zLmxlZnQscD1iLmNsaWVudFktcy50b3B9cmV0dXJuIGIuZGVsdGFYPWwsYi5kZWx0YVk9bSxiLmRlbHRhRmFjdG9yPWYsYi5vZmZzZXRYPW8sYi5vZmZzZXRZPXAsYi5kZWx0YU1vZGU9MCxoLnVuc2hpZnQoYixqLGwsbSksZSYmY2xlYXJUaW1lb3V0KGUpLGU9c2V0VGltZW91dChjLDIwMCksKGEuZXZlbnQuZGlzcGF0Y2h8fGEuZXZlbnQuaGFuZGxlKS5hcHBseSh0aGlzLGgpfX1mdW5jdGlvbiBjKCl7Zj1udWxsfWZ1bmN0aW9uIGQoYSxiKXtyZXR1cm4gay5zZXR0aW5ncy5hZGp1c3RPbGREZWx0YXMmJlwibW91c2V3aGVlbFwiPT09YS50eXBlJiZiJTEyMD09PTB9dmFyIGUsZixnPVtcIndoZWVsXCIsXCJtb3VzZXdoZWVsXCIsXCJET01Nb3VzZVNjcm9sbFwiLFwiTW96TW91c2VQaXhlbFNjcm9sbFwiXSxoPVwib253aGVlbFwiaW4gZG9jdW1lbnR8fGRvY3VtZW50LmRvY3VtZW50TW9kZT49OT9bXCJ3aGVlbFwiXTpbXCJtb3VzZXdoZWVsXCIsXCJEb21Nb3VzZVNjcm9sbFwiLFwiTW96TW91c2VQaXhlbFNjcm9sbFwiXSxpPUFycmF5LnByb3RvdHlwZS5zbGljZTtpZihhLmV2ZW50LmZpeEhvb2tzKWZvcih2YXIgaj1nLmxlbmd0aDtqOylhLmV2ZW50LmZpeEhvb2tzW2dbLS1qXV09YS5ldmVudC5tb3VzZUhvb2tzO3ZhciBrPWEuZXZlbnQuc3BlY2lhbC5tb3VzZXdoZWVsPXt2ZXJzaW9uOlwiMy4xLjEyXCIsc2V0dXA6ZnVuY3Rpb24oKXtpZih0aGlzLmFkZEV2ZW50TGlzdGVuZXIpZm9yKHZhciBjPWgubGVuZ3RoO2M7KXRoaXMuYWRkRXZlbnRMaXN0ZW5lcihoWy0tY10sYiwhMSk7ZWxzZSB0aGlzLm9ubW91c2V3aGVlbD1iO2EuZGF0YSh0aGlzLFwibW91c2V3aGVlbC1saW5lLWhlaWdodFwiLGsuZ2V0TGluZUhlaWdodCh0aGlzKSksYS5kYXRhKHRoaXMsXCJtb3VzZXdoZWVsLXBhZ2UtaGVpZ2h0XCIsay5nZXRQYWdlSGVpZ2h0KHRoaXMpKX0sdGVhcmRvd246ZnVuY3Rpb24oKXtpZih0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIpZm9yKHZhciBjPWgubGVuZ3RoO2M7KXRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcihoWy0tY10sYiwhMSk7ZWxzZSB0aGlzLm9ubW91c2V3aGVlbD1udWxsO2EucmVtb3ZlRGF0YSh0aGlzLFwibW91c2V3aGVlbC1saW5lLWhlaWdodFwiKSxhLnJlbW92ZURhdGEodGhpcyxcIm1vdXNld2hlZWwtcGFnZS1oZWlnaHRcIil9LGdldExpbmVIZWlnaHQ6ZnVuY3Rpb24oYil7dmFyIGM9YShiKSxkPWNbXCJvZmZzZXRQYXJlbnRcImluIGEuZm4/XCJvZmZzZXRQYXJlbnRcIjpcInBhcmVudFwiXSgpO3JldHVybiBkLmxlbmd0aHx8KGQ9YShcImJvZHlcIikpLHBhcnNlSW50KGQuY3NzKFwiZm9udFNpemVcIiksMTApfHxwYXJzZUludChjLmNzcyhcImZvbnRTaXplXCIpLDEwKXx8MTZ9LGdldFBhZ2VIZWlnaHQ6ZnVuY3Rpb24oYil7cmV0dXJuIGEoYikuaGVpZ2h0KCl9LHNldHRpbmdzOnthZGp1c3RPbGREZWx0YXM6ITAsbm9ybWFsaXplT2Zmc2V0OiEwfX07YS5mbi5leHRlbmQoe21vdXNld2hlZWw6ZnVuY3Rpb24oYSl7cmV0dXJuIGE/dGhpcy5iaW5kKFwibW91c2V3aGVlbFwiLGEpOnRoaXMudHJpZ2dlcihcIm1vdXNld2hlZWxcIil9LHVubW91c2V3aGVlbDpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy51bmJpbmQoXCJtb3VzZXdoZWVsXCIsYSl9fSl9KSxiLmRlZmluZShcImpxdWVyeS5zZWxlY3QyXCIsW1wianF1ZXJ5XCIsXCJqcXVlcnktbW91c2V3aGVlbFwiLFwiLi9zZWxlY3QyL2NvcmVcIixcIi4vc2VsZWN0Mi9kZWZhdWx0c1wiXSxmdW5jdGlvbihhLGIsYyxkKXtpZihudWxsPT1hLmZuLnNlbGVjdDIpe3ZhciBlPVtcIm9wZW5cIixcImNsb3NlXCIsXCJkZXN0cm95XCJdO2EuZm4uc2VsZWN0Mj1mdW5jdGlvbihiKXtpZihiPWJ8fHt9LFwib2JqZWN0XCI9PXR5cGVvZiBiKXJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgZD1hLmV4dGVuZCghMCx7fSxiKTtuZXcgYyhhKHRoaXMpLGQpfSksdGhpcztpZihcInN0cmluZ1wiPT10eXBlb2YgYil7dmFyIGQsZj1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsMSk7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciBjPWEodGhpcykuZGF0YShcInNlbGVjdDJcIik7bnVsbD09YyYmd2luZG93LmNvbnNvbGUmJmNvbnNvbGUuZXJyb3ImJmNvbnNvbGUuZXJyb3IoXCJUaGUgc2VsZWN0MignXCIrYitcIicpIG1ldGhvZCB3YXMgY2FsbGVkIG9uIGFuIGVsZW1lbnQgdGhhdCBpcyBub3QgdXNpbmcgU2VsZWN0Mi5cIiksZD1jW2JdLmFwcGx5KGMsZil9KSxhLmluQXJyYXkoYixlKT4tMT90aGlzOmR9dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBhcmd1bWVudHMgZm9yIFNlbGVjdDI6IFwiK2IpfX1yZXR1cm4gbnVsbD09YS5mbi5zZWxlY3QyLmRlZmF1bHRzJiYoYS5mbi5zZWxlY3QyLmRlZmF1bHRzPWQpLGN9KSx7ZGVmaW5lOmIuZGVmaW5lLHJlcXVpcmU6Yi5yZXF1aXJlfX0oKSxjPWIucmVxdWlyZShcImpxdWVyeS5zZWxlY3QyXCIpO3JldHVybiBhLmZuLnNlbGVjdDIuYW1kPWIsY30pOyIsIiQoZnVuY3Rpb24oKSB7XG4gICAgJCgnaW5wdXRbbmFtZT1kX2Zyb21dLCBpbnB1dFtuYW1lPWRfdG9dJykuZGF0ZXBpY2tlcih7XG4gICAgICAgIGRhdGVGb3JtYXQ6IFwieXl5eS1tbS1kZFwiXG4gICAgfSk7XG5cbiAgICAkKCdmb3JtW25hbWU9Y2F0ZWdvcmllcy1lZGl0LXN0b3Jlc10gaW5wdXRbdHlwZT1jaGVja2JveF0nKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICBcdHZhciBzZWxmID0gJCh0aGlzKSxcbiAgICBcdFx0Y2F0ZWdvcmllc0Zvcm0gPSAkKCdmb3JtW25hbWU9Y2F0ZWdvcmllcy1lZGl0LXN0b3Jlc10nKTtcblxuICAgIFx0aWYoc2VsZi5pcyhcIjpjaGVja2VkXCIpICYmIHNlbGYuYXR0cihcImRhdGEtcGFyZW50LWlkXCIpICE9IFwiMFwiKSB7XG4gICAgXHRcdGNhdGVnb3JpZXNGb3JtLmZpbmQoJ2lucHV0W2RhdGEtdWlkPScrIHNlbGYuYXR0cihcImRhdGEtcGFyZW50LWlkXCIpICsnXScpLnByb3AoXCJjaGVja2VkXCIsIGZhbHNlKS5wcm9wKFwiY2hlY2tlZFwiLCB0cnVlKTtcbiAgICBcdH0gZWxzZSBpZighc2VsZi5pcyhcIjpjaGVja2VkXCIpICYmIHNlbGYuYXR0cihcImRhdGEtcGFyZW50LWlkXCIpICE9IFwiMFwiKSB7XG4gICAgXHRcdHZhciBwYXJlbnRVbmNoZWtlZCA9IHRydWU7XG5cbiAgICBcdFx0Y2F0ZWdvcmllc0Zvcm0uZmluZCgnaW5wdXRbZGF0YS1wYXJlbnQtaWQ9Jysgc2VsZi5hdHRyKFwiZGF0YS1wYXJlbnQtaWRcIikgKyddJykuZWFjaChmdW5jdGlvbigpIHtcbiAgICBcdFx0XHRpZigkKHRoaXMpLmlzKFwiOmNoZWNrZWRcIikpIHtcbiAgICBcdFx0XHRcdHBhcmVudFVuY2hla2VkID0gZmFsc2U7XG4gICAgXHRcdFx0fVxuICAgIFx0XHR9KTtcblxuICAgIFx0XHRpZihwYXJlbnRVbmNoZWtlZCkge1xuICAgIFx0XHRcdGNhdGVnb3JpZXNGb3JtLmZpbmQoJ2lucHV0W2RhdGEtdWlkPScrIHNlbGYuYXR0cihcImRhdGEtcGFyZW50LWlkXCIpICsnXScpLnByb3AoXCJjaGVja2VkXCIsIGZhbHNlKTtcbiAgICBcdFx0fVxuICAgIFx0fVxuICAgIH0pO1xuXG5cdCQoXCIuc2VsZWN0Mi11c2Vyc1wiKS5zZWxlY3QyKHtcblx0XHRhamF4OiB7XG5cdFx0XHR1cmw6IFwiL2FkbWluL3VzZXJzL2xpc3RcIixcblx0XHRcdHR5cGU6ICdwb3N0Jyxcblx0XHRcdGRhdGFUeXBlOiAnanNvbicsXG5cdFx0XHRkZWxheTogMjUwLFxuXHRcdFx0ZGF0YTogZnVuY3Rpb24gKHBhcmFtcykge1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdGVtYWlsOiBwYXJhbXMudGVybVxuXHRcdFx0XHR9O1xuXHRcdFx0fSxcblx0XHRcdHByb2Nlc3NSZXN1bHRzOiBmdW5jdGlvbiAoZGF0YSkge1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdHJlc3VsdHM6IGRhdGFcblx0XHRcdFx0fTtcblx0XHRcdH0sXG5cdFx0XHRjYWNoZTogdHJ1ZVxuXHRcdH0sXG5cdFx0cGxhY2Vob2xkZXI6IFwi0JLRi9Cx0LXRgNC40YLQtSDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y9cIixcblx0XHRtaW5pbXVtSW5wdXRMZW5ndGg6IDFcblx0fSk7XG5cblx0JCggXCIuaW5wdXQtZGF0ZXBpY2tlclwiICkuZGF0ZXBpY2tlcih7XG5cdFx0ZGF0ZUZvcm1hdDogXCJ5eXl5LW1tLWRkXCJcblx0fSk7XG5cblx0JCgnI2NoYXJpdHktY2hlY2tib3gtMCcpLmNsaWNrKCBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIGNoZWNrZWQgPSB0aGlzLmNoZWNrZWQ7XG5cdFx0QXJyYXkuZnJvbShkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiY2hhcml0eS1jaGVja2JveFwiKSkuZm9yRWFjaChcblx0XHRcdGZ1bmN0aW9uKGVsZW1lbnQpIHtcblx0XHRcdFx0ZWxlbWVudC5jaGVja2VkID0gY2hlY2tlZDtcblx0XHRcdH1cblx0XHQpO1xuXHR9KTtcblxuXHQkKCcuYWpheC1jb25maXJtJykub24oJ2NsaWNrJyxmdW5jdGlvbihlKSB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdCR0aGlzPSQodGhpcyk7XG5cdFx0ZGF0YT17XG5cdFx0XHQncXVlc3Rpb24nOiR0aGlzLmRhdGEoJ3F1ZXN0aW9uJyl8fCfQktGLINGD0LLRg9GA0LXQvdC90Ys/Jyxcblx0XHRcdCd0aXRsZSc6JHRoaXMuZGF0YSgndGl0bGUnKXx8J9Cf0L7QtNGC0LLQtdGA0LbQtNC10L3QuNC1INC00LXQudGB0YLQstC40Y8nLFxuXHRcdFx0J2NhbGxiYWNrWWVzJzpmdW5jdGlvbigpe1xuXHRcdFx0XHQkdGhpcz0kKHRoaXMpO1xuXHRcdFx0XHQkLnBvc3QoJy9hZG1pbi9zdG9yZXMvaW1wb3J0LWNhdC9pZDonKyR0aGlzLmRhdGEoJ3N0b3JlJyksZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHRcdFx0aWYoZGF0YS5lcnJvcil7XG5cdFx0XHRcdFx0XHRub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOmRhdGEuZXJyb3IsdHlwZTonZXJyJ30pXG5cdFx0XHRcdFx0fWVsc2Uge1xuXHRcdFx0XHRcdFx0bG9jYXRpb24ucmVsb2FkKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LCdqc29uJylcblx0XHRcdFx0XHQuZmFpbChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6XCLQntGI0LjQsdC60LAg0L/QtdGA0LXQtNCw0YfQuCDQtNCw0L3QvdGL0YVcIix0eXBlOidlcnInfSlcblx0XHRcdFx0XHR9KTtcblx0XHRcdH0sXG5cdFx0XHQnb2JqJzokdGhpc1xuXHRcdH07XG5cdFx0bm90aWZpY2F0aW9uLmNvbmZpcm0oZGF0YSlcblx0fSlcbn0pO1xuXG4vKiQoZnVuY3Rpb24oKSB7XG5cdCQoJy5jaF90cmVlIGlucHV0Jykub24oJ2NoYW5nZScsZnVuY3Rpb24oKXtcblx0XHQkdGhpcz0kKHRoaXMpXG5cdFx0aW5wdXQ9JHRoaXMucGFyZW50KCkucGFyZW50KCkuZmluZCgnaW5wdXQnKTtcblx0XHRpbnB1dC5wcm9wKCdjaGVja2VkJywkdGhpcy5wcm9wKCdjaGVja2VkJykpXG5cdH0pXG59KTsqL1xuJChmdW5jdGlvbigpIHtcblx0JCgnLmdldF9hZG1pdGFkJykub24oJ2NsaWNrJyxmdW5jdGlvbihlKXtcblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0aHJlZj10aGlzLmhyZWZ8fFwiXCI7XG5cblx0XHQkKCcudXNlcl9kYXRhJykuaHRtbChcIlwiKTtcblx0XHRhZD0kKCcuYWRtaXRhZF9kYXRhJyk7XG5cdFx0YWQuYWRkQ2xhc3MoJ2xvYWRpbmcnKTtcblx0XHRhZC5yZW1vdmVDbGFzcygnbm9ybWFsX2xvYWQnKTtcblx0XHRhZC50ZXh0KCcnKTtcblxuXHRcdHRyPWFkLmNsb3Nlc3QoJ3RyJyk7XG5cdFx0aWRzPVtdO1xuXHRcdGZvcih2YXIgaT0wO2k8dHIubGVuZ3RoO2krKyl7XG5cdFx0XHRpZD10ci5lcShpKS5kYXRhKCdrZXknKTtcblx0XHRcdGlmKGlkKWlkcy5wdXNoKGlkKTtcblx0XHR9XG5cblx0XHRpZihpZHMubGVuZ3RoPT0wKXtcblx0XHRcdGFkLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG5cdFx0XHRhbGVydCgn0J3QtdGCINC30LDQutCw0LfQvtCyINC00LvRjyDQv9GA0L7QstC10YDQutC4Jyk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0JC5wb3N0KCcvYWRtaW4vcGF5bWVudHMvYWRtaXRhZC10ZXN0Jyx7J2lkcyc6aWRzLCd1cGRhdGUnOihocmVmLmluZGV4T2YoJ3VwZGF0ZScpPjA/MTowKX0sZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHRhZD0kKCcuYWRtaXRhZF9kYXRhJyk7XG5cdFx0XHRhZC50ZXh0KCfQtNCw0L3QvdGL0LUg0L3QtSDQvdCw0LnQtNC10L3RiycpO1xuXHRcdFx0YWQucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcblxuXHRcdFx0dHI9YWQuY2xvc2VzdCgndHInKTtcblx0XHRcdGZvcih2YXIgaT0wO2k8dHIubGVuZ3RoO2krKykge1xuXHRcdFx0XHR2YXIgaXRlbSA9IHRyLmVxKGkpO1xuXHRcdFx0XHRpZCA9IGl0ZW0uZGF0YSgna2V5Jyk7XG5cdFx0XHRcdGlmICghZGF0YVtpZF0pIHtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRkcz1pdGVtLmZpbmQoJy5hZG1pdGFkX2RhdGEnKTtcblx0XHRcdFx0Zm9yKHZhciBqPTA7ajx0ZHMubGVuZ3RoO2orKykge1xuXHRcdFx0XHRcdHZhciB0ZCA9IHRkcy5lcShqKTtcblx0XHRcdFx0XHRrZXk9dGQuZGF0YSgnY29sJyk7XG5cdFx0XHRcdFx0aWYoZGF0YVtpZF1ba2V5XSl7XG5cdFx0XHRcdFx0XHR0ZC5odG1sKGRhdGFbaWRdW2tleV0pO1xuXHRcdFx0XHRcdFx0dGQuYWRkQ2xhc3MoJ25vcm1hbF9sb2FkJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmKGRhdGFbJ3VzZXJfZGF0YSddKXtcblx0XHRcdFx0dXNlcj1kYXRhWyd1c2VyX2RhdGEnXTtcblx0XHRcdFx0dXNlcl9kYXRhPSc8SDI+0JHQsNC70LDQvdGBINC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRjyAnK3VzZXJbJ2VtYWlsJ10rJyAoJyt1c2VyWyd1aWQnXSsnKSDQvtCx0L3QvtCy0LvQtdC9PC9IMj4nO1xuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRhYmxlIGNsYXNzPSd0YWJsZSB0YWJsZS1zdW0nPlwiXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dHI+XCJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0aD48L3RoPlwiO1xuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRoPtCh0YLQsNGA0YvQtSDQtNCw0L3QvdGL0LU8L3RoPlwiO1xuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRoPtCd0L7QstGL0LUg0LTQsNC90L3Ri9C1PC90aD5cIjtcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjwvdHI+XCJcblxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRyPlwiXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQ+0JIg0L7QttC40LTQsNC90LjQuCAo0LrQvtC7LdCy0L4pPC90ZD5cIjtcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0ZCBjbGFzcz0ndmFsdWUnPlwiK3VzZXJbJ29sZCddWydjbnRfcGVuZGluZyddK1wiPC90ZD5cIjtcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0ZCBjbGFzcz0ndmFsdWUnPlwiK3VzZXJbJ25ldyddWydjbnRfcGVuZGluZyddK1wiPC90ZD5cIjtcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjwvdHI+XCJcblxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRyPlwiXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQ+0JIg0L7QttC40LTQsNC90LjQuCAo0YHRg9C80LzQsCk8L3RkPlwiO1xuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRkIGNsYXNzPSd2YWx1ZSc+XCIrdXNlclsnb2xkJ11bJ3N1bV9wZW5kaW5nJ10rXCI8L3RkPlwiO1xuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRkIGNsYXNzPSd2YWx1ZSc+XCIrdXNlclsnbmV3J11bJ3N1bV9wZW5kaW5nJ10rXCI8L3RkPlwiO1xuXHRcdFx0XHR1c2VyX2RhdGErPVwiPC90cj5cIlxuXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dHI+XCJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0ZD7QntGC0LrQu9C+0L3QtdC90L4gKNC60L7Quy3QstC+KTwvdGQ+XCI7XG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQgY2xhc3M9J3ZhbHVlJz5cIit1c2VyWydvbGQnXVsnY250X2RlY2xpbmVkJ10rXCI8L3RkPlwiO1xuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRkIGNsYXNzPSd2YWx1ZSc+XCIrdXNlclsnbmV3J11bJ2NudF9kZWNsaW5lZCddK1wiPC90ZD5cIjtcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjwvdHI+XCJcblxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRyPlwiXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQ+0J7RgtC60LvQvtC90LXQvdC+ICjRgdGD0LzQvNCwKTwvdGQ+XCI7XG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQgY2xhc3M9J3ZhbHVlJz5cIit1c2VyWydvbGQnXVsnc3VtX2RlY2xpbmVkJ10rXCI8L3RkPlwiO1xuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRkIGNsYXNzPSd2YWx1ZSc+XCIrdXNlclsnbmV3J11bJ3N1bV9kZWNsaW5lZCddK1wiPC90ZD5cIjtcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjwvdHI+XCJcblxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRyPlwiXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQ+0J/QvtC00YLQstC10YDQttC00LXQvdC+ICjQutC+0Lst0LLQvik8L3RkPlwiO1xuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRkIGNsYXNzPSd2YWx1ZSc+XCIrdXNlclsnb2xkJ11bJ2NudF9jb25maXJtZWQnXStcIjwvdGQ+XCI7XG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQgY2xhc3M9J3ZhbHVlJz5cIit1c2VyWyduZXcnXVsnY250X2NvbmZpcm1lZCddK1wiPC90ZD5cIjtcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjwvdHI+XCJcblxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRyPlwiXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQ+0J/QvtC00YLQstC10YDQttC00LXQvdC+ICjRgdGD0LzQvNCwKTwvdGQ+XCI7XG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQgY2xhc3M9J3ZhbHVlJz5cIit1c2VyWydvbGQnXVsnc3VtX2NvbmZpcm1lZCddK1wiPC90ZD5cIjtcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0ZCBjbGFzcz0ndmFsdWUnPlwiK3VzZXJbJ25ldyddWydzdW1fY29uZmlybWVkJ10rXCI8L3RkPlwiO1xuXHRcdFx0XHR1c2VyX2RhdGErPVwiPC90cj5cIlxuXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dHI+XCJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0ZD7QkdCw0LvQsNC90YEgKNC+0LHRidC40LkpPC90ZD5cIjtcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0ZCBjbGFzcz0ndmFsdWUnPlwiK3VzZXJbJ29sZCddWydiYWxhbnMnXStcIjwvdGQ+XCI7XG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQgY2xhc3M9J3ZhbHVlJz5cIit1c2VyWyduZXcnXVsnYmFsYW5zJ10rXCI8L3RkPlwiO1xuXHRcdFx0XHR1c2VyX2RhdGErPVwiPC90cj5cIlxuXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8L3RhYmxlPlwiXG5cdFx0XHRcdCQoJy51c2VyX2RhdGEnKS5odG1sKHVzZXJfZGF0YSk7XG5cdFx0XHR9XG5cdFx0fSwnanNvbicpLmZhaWwoZnVuY3Rpb24gKCkge1xuXHRcdFx0YWQucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcblx0XHRcdGFsZXJ0KCfQntGI0LjQsdC60LAg0L7QsdGA0LDQsdC+0YLQutC4INC30LDQv9GA0L7RgdCwJylcblx0XHR9KTtcblxuXHRcdHJldHVybiBmYWxzZTtcblx0fSlcbn0pOyIsIid1c2Ugc3RyaWN0JztcblxuaWYgKHR5cGVvZiBtaWhhaWxkZXYgPT0gXCJ1bmRlZmluZWRcIiB8fCAhbWloYWlsZGV2KSB7XG4gICAgdmFyIG1paGFpbGRldiA9IHt9O1xuICAgIG1paGFpbGRldi5lbEZpbmRlciA9IHtcbiAgICAgICAgb3Blbk1hbmFnZXI6IGZ1bmN0aW9uKG9wdGlvbnMpe1xuICAgICAgICAgICAgdmFyIHBhcmFtcyA9IFwibWVudWJhcj1ubyx0b29sYmFyPW5vLGxvY2F0aW9uPW5vLGRpcmVjdG9yaWVzPW5vLHN0YXR1cz1ubyxmdWxsc2NyZWVuPW5vXCI7XG4gICAgICAgICAgICBpZihvcHRpb25zLndpZHRoID09ICdhdXRvJyl7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy53aWR0aCA9ICQod2luZG93KS53aWR0aCgpLzEuNTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYob3B0aW9ucy5oZWlnaHQgPT0gJ2F1dG8nKXtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKS8xLjU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHBhcmFtcyA9IHBhcmFtcyArIFwiLHdpZHRoPVwiICsgb3B0aW9ucy53aWR0aDtcbiAgICAgICAgICAgIHBhcmFtcyA9IHBhcmFtcyArIFwiLGhlaWdodD1cIiArIG9wdGlvbnMuaGVpZ2h0O1xuXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKHBhcmFtcyk7XG4gICAgICAgICAgICB2YXIgd2luID0gd2luZG93Lm9wZW4ob3B0aW9ucy51cmwsICdFbEZpbmRlck1hbmFnZXInICsgb3B0aW9ucy5pZCwgcGFyYW1zKTtcbiAgICAgICAgICAgIHdpbi5mb2N1cygpXG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uczoge30sXG4gICAgICAgIHJlZ2lzdGVyOiBmdW5jdGlvbihpZCwgZnVuYyl7XG4gICAgICAgICAgICB0aGlzLmZ1bmN0aW9uc1tpZF0gPSBmdW5jO1xuICAgICAgICB9LFxuICAgICAgICBjYWxsRnVuY3Rpb246IGZ1bmN0aW9uKGlkLCBmaWxlKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZ1bmN0aW9uc1tpZF0oZmlsZSwgaWQpO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvblJldHVyblRvSW5wdXQ6IGZ1bmN0aW9uKGZpbGUsIGlkKXtcbiAgICAgICAgICAgIGpRdWVyeSgnIycgKyBpZCkudmFsKGZpbGUudXJsKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfTtcblxufVxuXG5cblxudmFyIG1lZ2FzbGlkZXIgPSAoZnVuY3Rpb24gKCkge1xuICB2YXIgc2xpZGVyX2RhdGEgPSBmYWxzZTtcbiAgdmFyIGNvbnRhaW5lcl9pZCA9IFwic2VjdGlvbiNtZWdhX3NsaWRlclwiO1xuICB2YXIgcGFyYWxsYXhfZ3JvdXAgPSBmYWxzZTtcbiAgdmFyIHBhcmFsbGF4X3RpbWVyID0gZmFsc2U7XG4gIHZhciBwYXJhbGxheF9jb3VudGVyID0gMDtcbiAgdmFyIHBhcmFsbGF4X2QgPSAxO1xuICB2YXIgbW9iaWxlX21vZGUgPSAtMTtcbiAgdmFyIG1heF90aW1lX2xvYWRfcGljID0gMzAwO1xuICB2YXIgbW9iaWxlX3NpemUgPSA3MDA7XG4gIHZhciByZW5kZXJfc2xpZGVfbm9tID0gMDtcbiAgdmFyIHRvdF9pbWdfd2FpdDtcbiAgdmFyIHNsaWRlcztcbiAgdmFyIHNsaWRlX3NlbGVjdF9ib3g7XG4gIHZhciBlZGl0b3I7XG4gIHZhciB0aW1lb3V0SWQ7XG4gIHZhciBzY3JvbGxfcGVyaW9kID0gNjAwMDtcblxuICB2YXIgcG9zQXJyID0gW1xuICAgICdzbGlkZXJfX3RleHQtbHQnLCAnc2xpZGVyX190ZXh0LWN0JywgJ3NsaWRlcl9fdGV4dC1ydCcsXG4gICAgJ3NsaWRlcl9fdGV4dC1sYycsICdzbGlkZXJfX3RleHQtY2MnLCAnc2xpZGVyX190ZXh0LXJjJyxcbiAgICAnc2xpZGVyX190ZXh0LWxiJywgJ3NsaWRlcl9fdGV4dC1jYicsICdzbGlkZXJfX3RleHQtcmInLFxuICBdO1xuICB2YXIgcG9zX2xpc3QgPSBbXG4gICAgJ9Cb0LXQstC+INCy0LXRgNGFJywgJ9GG0LXQvdGC0YAg0LLQtdGA0YUnLCAn0L/RgNCw0LLQviDQstC10YDRhScsXG4gICAgJ9Cb0LXQstC+INGG0LXQvdGC0YAnLCAn0YbQtdC90YLRgCcsICfQv9GA0LDQstC+INGG0LXQvdGC0YAnLFxuICAgICfQm9C10LLQviDQvdC40LcnLCAn0YbQtdC90YLRgCDQvdC40LcnLCAn0L/RgNCw0LLQviDQvdC40LcnLFxuICBdO1xuICB2YXIgc2hvd19kZWxheSA9IFtcbiAgICAnc2hvd19ub19kZWxheScsXG4gICAgJ3Nob3dfZGVsYXlfMDUnLFxuICAgICdzaG93X2RlbGF5XzEwJyxcbiAgICAnc2hvd19kZWxheV8xNScsXG4gICAgJ3Nob3dfZGVsYXlfMjAnLFxuICAgICdzaG93X2RlbGF5XzI1JyxcbiAgICAnc2hvd19kZWxheV8zMCdcbiAgXTtcbiAgdmFyIGhpZGVfZGVsYXkgPSBbXG4gICAgJ2hpZGVfbm9fZGVsYXknLFxuICAgICdoaWRlX2RlbGF5XzA1JyxcbiAgICAnaGlkZV9kZWxheV8xMCcsXG4gICAgJ2hpZGVfZGVsYXlfMTUnLFxuICAgICdoaWRlX2RlbGF5XzIwJ1xuICBdO1xuICB2YXIgeWVzX25vX2FyciA9IFtcbiAgICAnbm8nLFxuICAgICd5ZXMnXG4gIF07XG4gIHZhciB5ZXNfbm9fdmFsID0gW1xuICAgICcnLFxuICAgICdmaXhlZF9fZnVsbC1oZWlnaHQnXG4gIF07XG4gIHZhciBidG5fc3R5bGUgPSBbXG4gICAgJ25vbmUnLFxuICAgICdib3JkbycsXG4gICAgJ2JsYWNrJyxcbiAgICAnYmx1ZScsXG4gICAgJ2RhcmstYmx1ZScsXG4gICAgJ3JlZCcsXG4gICAgJ29yYW5nZScsXG4gICAgJ2dyZWVuJyxcbiAgICAnbGlnaHQtZ3JlZW4nLFxuICAgICdkYXJrLWdyZWVuJyxcbiAgICAncGluaycsXG4gICAgJ3llbGxvdydcbiAgXTtcbiAgdmFyIHNob3dfYW5pbWF0aW9ucyA9IFtcbiAgICBcIm5vdF9hbmltYXRlXCIsXG4gICAgXCJib3VuY2VJblwiLFxuICAgIFwiYm91bmNlSW5Eb3duXCIsXG4gICAgXCJib3VuY2VJbkxlZnRcIixcbiAgICBcImJvdW5jZUluUmlnaHRcIixcbiAgICBcImJvdW5jZUluVXBcIixcbiAgICBcImZhZGVJblwiLFxuICAgIFwiZmFkZUluRG93blwiLFxuICAgIFwiZmFkZUluTGVmdFwiLFxuICAgIFwiZmFkZUluUmlnaHRcIixcbiAgICBcImZhZGVJblVwXCIsXG4gICAgXCJmbGlwSW5YXCIsXG4gICAgXCJmbGlwSW5ZXCIsXG4gICAgXCJsaWdodFNwZWVkSW5cIixcbiAgICBcInJvdGF0ZUluXCIsXG4gICAgXCJyb3RhdGVJbkRvd25MZWZ0XCIsXG4gICAgXCJyb3RhdGVJblVwTGVmdFwiLFxuICAgIFwicm90YXRlSW5VcFJpZ2h0XCIsXG4gICAgXCJqYWNrSW5UaGVCb3hcIixcbiAgICBcInJvbGxJblwiLFxuICAgIFwiem9vbUluXCJcbiAgXTtcblxuICB2YXIgaGlkZV9hbmltYXRpb25zID0gW1xuICAgIFwibm90X2FuaW1hdGVcIixcbiAgICBcImJvdW5jZU91dFwiLFxuICAgIFwiYm91bmNlT3V0RG93blwiLFxuICAgIFwiYm91bmNlT3V0TGVmdFwiLFxuICAgIFwiYm91bmNlT3V0UmlnaHRcIixcbiAgICBcImJvdW5jZU91dFVwXCIsXG4gICAgXCJmYWRlT3V0XCIsXG4gICAgXCJmYWRlT3V0RG93blwiLFxuICAgIFwiZmFkZU91dExlZnRcIixcbiAgICBcImZhZGVPdXRSaWdodFwiLFxuICAgIFwiZmFkZU91dFVwXCIsXG4gICAgXCJmbGlwT3V0WFwiLFxuICAgIFwibGlwT3V0WVwiLFxuICAgIFwibGlnaHRTcGVlZE91dFwiLFxuICAgIFwicm90YXRlT3V0XCIsXG4gICAgXCJyb3RhdGVPdXREb3duTGVmdFwiLFxuICAgIFwicm90YXRlT3V0RG93blJpZ2h0XCIsXG4gICAgXCJyb3RhdGVPdXRVcExlZnRcIixcbiAgICBcInJvdGF0ZU91dFVwUmlnaHRcIixcbiAgICBcImhpbmdlXCIsXG4gICAgXCJyb2xsT3V0XCJcbiAgXTtcbiAgdmFyIHN0VGFibGU7XG4gIHZhciBwYXJhbGF4VGFibGU7XG5cbiAgZnVuY3Rpb24gaW5pdEltYWdlU2VydmVyU2VsZWN0KGVscykge1xuICAgIGlmIChlbHMubGVuZ3RoID09IDApcmV0dXJuO1xuICAgIGVscy53cmFwKCc8ZGl2IGNsYXNzPVwic2VsZWN0X2ltZ1wiPicpO1xuICAgIGVscyA9IGVscy5wYXJlbnQoKTtcbiAgICBlbHMuYXBwZW5kKCc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImZpbGVfYnV0dG9uXCI+PGkgY2xhc3M9XCJtY2UtaWNvIG1jZS1pLWJyb3dzZVwiPjwvaT48L2J1dHRvbj4nKTtcbiAgICAvKmVscy5maW5kKCdidXR0b24nKS5vbignY2xpY2snLGZ1bmN0aW9uICgpIHtcbiAgICAgJCgnI3JveHlDdXN0b21QYW5lbDInKS5hZGRDbGFzcygnb3BlbicpXG4gICAgIH0pOyovXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBlbCA9IGVscy5lcShpKS5maW5kKCdpbnB1dCcpO1xuICAgICAgaWYgKCFlbC5hdHRyKCdpZCcpKSB7XG4gICAgICAgIGVsLmF0dHIoJ2lkJywgJ2ZpbGVfJyArIGkgKyAnXycgKyBEYXRlLm5vdygpKVxuICAgICAgfVxuICAgICAgdmFyIHRfaWQgPSBlbC5hdHRyKCdpZCcpO1xuICAgICAgbWloYWlsZGV2LmVsRmluZGVyLnJlZ2lzdGVyKHRfaWQsIGZ1bmN0aW9uIChmaWxlLCBpZCkge1xuICAgICAgICAvLyQodGhpcykudmFsKGZpbGUudXJsKS50cmlnZ2VyKCdjaGFuZ2UnLCBbZmlsZSwgaWRdKTtcbiAgICAgICAgJCgnIycgKyBpZCkudmFsKGZpbGUudXJsKS5jaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9KTtcbiAgICB9XG4gICAgO1xuXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5maWxlX2J1dHRvbicsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcykucHJldigpO1xuICAgICAgdmFyIGlkID0gJHRoaXMuYXR0cignaWQnKTtcbiAgICAgIG1paGFpbGRldi5lbEZpbmRlci5vcGVuTWFuYWdlcih7XG4gICAgICAgIFwidXJsXCI6IFwiL21hbmFnZXIvZWxmaW5kZXI/ZmlsdGVyPWltYWdlJmNhbGxiYWNrPVwiICsgaWQgKyBcIiZsYW5nPXJ1XCIsXG4gICAgICAgIFwid2lkdGhcIjogXCJhdXRvXCIsXG4gICAgICAgIFwiaGVpZ2h0XCI6IFwiYXV0b1wiLFxuICAgICAgICBcImlkXCI6IGlkXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlbklucHV0KGRhdGEpIHtcbiAgICB2YXIgaW5wdXQgPSAnPGlucHV0IGNsYXNzPVwiJyArIChkYXRhLmlucHV0Q2xhc3MgfHwgJycpICsgJ1wiIHZhbHVlPVwiJyArIChkYXRhLnZhbHVlIHx8ICcnKSArICdcIj4nO1xuICAgIGlmIChkYXRhLmxhYmVsKSB7XG4gICAgICBpbnB1dCA9ICc8bGFiZWw+PHNwYW4+JyArIGRhdGEubGFiZWwgKyAnPC9zcGFuPicgKyBpbnB1dCArICc8L2xhYmVsPic7XG4gICAgfVxuICAgIGlmIChkYXRhLnBhcmVudCkge1xuICAgICAgaW5wdXQgPSAnPCcgKyBkYXRhLnBhcmVudCArICc+JyArIGlucHV0ICsgJzwvJyArIGRhdGEucGFyZW50ICsgJz4nO1xuICAgIH1cbiAgICBpbnB1dCA9ICQoaW5wdXQpO1xuXG4gICAgaWYgKGRhdGEub25DaGFuZ2UpIHtcbiAgICAgIHZhciBvbkNoYW5nZTtcbiAgICAgIGlmIChkYXRhLmJpbmQpIHtcbiAgICAgICAgZGF0YS5iaW5kLmlucHV0ID0gaW5wdXQuZmluZCgnaW5wdXQnKTtcbiAgICAgICAgb25DaGFuZ2UgPSBkYXRhLm9uQ2hhbmdlLmJpbmQoZGF0YS5iaW5kKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9uQ2hhbmdlID0gZGF0YS5vbkNoYW5nZS5iaW5kKGlucHV0LmZpbmQoJ2lucHV0JykpO1xuICAgICAgfVxuICAgICAgaW5wdXQuZmluZCgnaW5wdXQnKS5vbignY2hhbmdlJywgb25DaGFuZ2UpXG4gICAgfVxuICAgIHJldHVybiBpbnB1dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlblNlbGVjdChkYXRhKSB7XG4gICAgdmFyIGlucHV0ID0gJCgnPHNlbGVjdC8+Jyk7XG5cbiAgICB2YXIgZWwgPSBzbGlkZXJfZGF0YVswXVtkYXRhLmdyXTtcbiAgICBpZiAoZGF0YS5pbmRleCAhPT0gZmFsc2UpIHtcbiAgICAgIGVsID0gZWxbZGF0YS5pbmRleF07XG4gICAgfVxuXG4gICAgaWYgKGVsW2RhdGEucGFyYW1dKSB7XG4gICAgICBkYXRhLnZhbHVlID0gZWxbZGF0YS5wYXJhbV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRhdGEudmFsdWUgPSAwO1xuICAgIH1cblxuICAgIGlmIChkYXRhLnN0YXJ0X29wdGlvbikge1xuICAgICAgaW5wdXQuYXBwZW5kKGRhdGEuc3RhcnRfb3B0aW9uKVxuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5saXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgdmFsO1xuICAgICAgdmFyIHR4dCA9IGRhdGEubGlzdFtpXTtcbiAgICAgIGlmIChkYXRhLnZhbF90eXBlID09IDApIHtcbiAgICAgICAgdmFsID0gZGF0YS5saXN0W2ldO1xuICAgICAgfSBlbHNlIGlmIChkYXRhLnZhbF90eXBlID09IDEpIHtcbiAgICAgICAgdmFsID0gaTtcbiAgICAgIH0gZWxzZSBpZiAoZGF0YS52YWxfdHlwZSA9PSAyKSB7XG4gICAgICAgIC8vdmFsPWRhdGEudmFsX2xpc3RbaV07XG4gICAgICAgIHZhbCA9IGk7XG4gICAgICAgIHR4dCA9IGRhdGEudmFsX2xpc3RbaV07XG4gICAgICB9XG5cbiAgICAgIHZhciBzZWwgPSAodmFsID09IGRhdGEudmFsdWUgPyAnc2VsZWN0ZWQnIDogJycpO1xuICAgICAgaWYgKHNlbCA9PSAnc2VsZWN0ZWQnKSB7XG4gICAgICAgIGlucHV0LmF0dHIoJ3RfdmFsJywgZGF0YS5saXN0W2ldKTtcbiAgICAgIH1cbiAgICAgIHZhciBvcHRpb24gPSAnPG9wdGlvbiB2YWx1ZT1cIicgKyB2YWwgKyAnXCIgJyArIHNlbCArICc+JyArIHR4dCArICc8L29wdGlvbj4nO1xuICAgICAgaWYgKGRhdGEudmFsX3R5cGUgPT0gMikge1xuICAgICAgICBvcHRpb24gPSAkKG9wdGlvbikuYXR0cignY29kZScsIGRhdGEubGlzdFtpXSk7XG4gICAgICB9XG4gICAgICBpbnB1dC5hcHBlbmQob3B0aW9uKVxuICAgIH1cblxuICAgIGlucHV0Lm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBkYXRhID0gdGhpcztcbiAgICAgIHZhciB2YWwgPSBkYXRhLmVsLnZhbCgpO1xuICAgICAgdmFyIHNsX29wID0gZGF0YS5lbC5maW5kKCdvcHRpb25bdmFsdWU9JyArIHZhbCArICddJyk7XG4gICAgICB2YXIgY2xzID0gc2xfb3AudGV4dCgpO1xuICAgICAgdmFyIGNoID0gc2xfb3AuYXR0cignY29kZScpO1xuICAgICAgaWYgKCFjaCljaCA9IGNscztcbiAgICAgIGlmIChkYXRhLmluZGV4ICE9PSBmYWxzZSkge1xuICAgICAgICBzbGlkZXJfZGF0YVswXVtkYXRhLmdyXVtkYXRhLmluZGV4XVtkYXRhLnBhcmFtXSA9IHZhbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdW2RhdGEuZ3JdW2RhdGEucGFyYW1dID0gdmFsO1xuICAgICAgfVxuXG4gICAgICBkYXRhLm9iai5yZW1vdmVDbGFzcyhkYXRhLnByZWZpeCArIGRhdGEuZWwuYXR0cigndF92YWwnKSk7XG4gICAgICBkYXRhLm9iai5hZGRDbGFzcyhkYXRhLnByZWZpeCArIGNoKTtcbiAgICAgIGRhdGEuZWwuYXR0cigndF92YWwnLCBjaCk7XG5cbiAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcbiAgICB9LmJpbmQoe1xuICAgICAgZWw6IGlucHV0LFxuICAgICAgb2JqOiBkYXRhLm9iaixcbiAgICAgIGdyOiBkYXRhLmdyLFxuICAgICAgaW5kZXg6IGRhdGEuaW5kZXgsXG4gICAgICBwYXJhbTogZGF0YS5wYXJhbSxcbiAgICAgIHByZWZpeDogZGF0YS5wcmVmaXggfHwgJydcbiAgICB9KSk7XG5cbiAgICBpZiAoZGF0YS5wYXJlbnQpIHtcbiAgICAgIHZhciBwYXJlbnQgPSAkKCc8JyArIGRhdGEucGFyZW50ICsgJy8+Jyk7XG4gICAgICBwYXJlbnQuYXBwZW5kKGlucHV0KTtcbiAgICAgIHJldHVybiBwYXJlbnQ7XG4gICAgfVxuICAgIHJldHVybiBpbnB1dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFNlbEFuaW1hdGlvbkNvbnRyb2xsKGRhdGEpIHtcbiAgICB2YXIgYW5pbV9zZWwgPSBbXTtcbiAgICB2YXIgb3V0O1xuXG4gICAgaWYgKGRhdGEudHlwZSA9PSAwKSB7XG4gICAgICBhbmltX3NlbC5wdXNoKCc8c3Bhbj5TaG93IGFuaW1hdGlvbjwvc3Bhbj4nKTtcbiAgICB9XG4gICAgYW5pbV9zZWwucHVzaChnZW5TZWxlY3Qoe1xuICAgICAgbGlzdDogc2hvd19hbmltYXRpb25zLFxuICAgICAgdmFsX3R5cGU6IDAsXG4gICAgICBvYmo6IGRhdGEub2JqLFxuICAgICAgZ3I6IGRhdGEuZ3IsXG4gICAgICBpbmRleDogZGF0YS5pbmRleCxcbiAgICAgIHBhcmFtOiAnc2hvd19hbmltYXRpb24nLFxuICAgICAgcHJlZml4OiAnc2xpZGVfJyxcbiAgICAgIHBhcmVudDogZGF0YS5wYXJlbnRcbiAgICB9KSk7XG4gICAgaWYgKGRhdGEudHlwZSA9PSAwKSB7XG4gICAgICBhbmltX3NlbC5wdXNoKCc8c3Bhbj5TaG93IGRlbGF5PC9zcGFuPicpO1xuICAgIH1cbiAgICBhbmltX3NlbC5wdXNoKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OiBzaG93X2RlbGF5LFxuICAgICAgdmFsX3R5cGU6IDEsXG4gICAgICBvYmo6IGRhdGEub2JqLFxuICAgICAgZ3I6IGRhdGEuZ3IsXG4gICAgICBpbmRleDogZGF0YS5pbmRleCxcbiAgICAgIHBhcmFtOiAnc2hvd19kZWxheScsXG4gICAgICBwcmVmaXg6ICdzbGlkZV8nLFxuICAgICAgcGFyZW50OiBkYXRhLnBhcmVudFxuICAgIH0pKTtcblxuICAgIGlmIChkYXRhLnR5cGUgPT0gMCkge1xuICAgICAgYW5pbV9zZWwucHVzaCgnPGJyLz4nKTtcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPkhpZGUgYW5pbWF0aW9uPC9zcGFuPicpO1xuICAgIH1cbiAgICBhbmltX3NlbC5wdXNoKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OiBoaWRlX2FuaW1hdGlvbnMsXG4gICAgICB2YWxfdHlwZTogMCxcbiAgICAgIG9iajogZGF0YS5vYmosXG4gICAgICBncjogZGF0YS5ncixcbiAgICAgIGluZGV4OiBkYXRhLmluZGV4LFxuICAgICAgcGFyYW06ICdoaWRlX2FuaW1hdGlvbicsXG4gICAgICBwcmVmaXg6ICdzbGlkZV8nLFxuICAgICAgcGFyZW50OiBkYXRhLnBhcmVudFxuICAgIH0pKTtcbiAgICBpZiAoZGF0YS50eXBlID09IDApIHtcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPkhpZGUgZGVsYXk8L3NwYW4+Jyk7XG4gICAgfVxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6IGhpZGVfZGVsYXksXG4gICAgICB2YWxfdHlwZTogMSxcbiAgICAgIG9iajogZGF0YS5vYmosXG4gICAgICBncjogZGF0YS5ncixcbiAgICAgIGluZGV4OiBkYXRhLmluZGV4LFxuICAgICAgcGFyYW06ICdoaWRlX2RlbGF5JyxcbiAgICAgIHByZWZpeDogJ3NsaWRlXycsXG4gICAgICBwYXJlbnQ6IGRhdGEucGFyZW50XG4gICAgfSkpO1xuXG4gICAgaWYgKGRhdGEudHlwZSA9PSAwKSB7XG4gICAgICBvdXQgPSAkKCc8ZGl2IGNsYXNzPVwiYW5pbV9zZWxcIi8+Jyk7XG4gICAgICBvdXQuYXBwZW5kKGFuaW1fc2VsKTtcbiAgICB9XG4gICAgaWYgKGRhdGEudHlwZSA9PSAxKSB7XG4gICAgICBvdXQgPSBhbmltX3NlbDtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdF9lZGl0b3IoKSB7XG4gICAgJCgnI3cxJykucmVtb3ZlKCk7XG4gICAgJCgnI3cxX2J1dHRvbicpLnJlbW92ZSgpO1xuICAgIHNsaWRlcl9kYXRhWzBdLm1vYmlsZSA9IHNsaWRlcl9kYXRhWzBdLm1vYmlsZS5zcGxpdCgnPycpWzBdO1xuXG4gICAgdmFyIGVsID0gJCgnI21lZ2Ffc2xpZGVyX2NvbnRyb2xlJyk7XG4gICAgdmFyIGJ0bnNfYm94ID0gJCgnPGRpdiBjbGFzcz1cImJ0bl9ib3hcIi8+Jyk7XG5cbiAgICBlbC5hcHBlbmQoJzxoMj7Qo9C/0YDQsNCy0LvQtdC90LjQtTwvaDI+Jyk7XG4gICAgZWwuYXBwZW5kKCQoJzx0ZXh0YXJlYS8+Jywge1xuICAgICAgdGV4dDogSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pLFxuICAgICAgaWQ6ICdzbGlkZV9kYXRhJyxcbiAgICAgIG5hbWU6IGVkaXRvclxuICAgIH0pKTtcblxuICAgIHZhciBidG4gPSAkKCc8YnV0dG9uIGNsYXNzPVwiXCIvPicpLnRleHQoXCLQkNC60YLQuNCy0LjRgNC+0LLQsNGC0Ywg0YHQu9Cw0LnQtFwiKTtcbiAgICBidG5zX2JveC5hcHBlbmQoYnRuKTtcbiAgICBidG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLnJlbW92ZUNsYXNzKCdoaWRlX3NsaWRlJyk7XG4gICAgfSk7XG5cbiAgICB2YXIgYnRuID0gJCgnPGJ1dHRvbiBjbGFzcz1cIlwiLz4nKS50ZXh0KFwi0JTQtdCw0LrRgtC40LLQuNGA0L7QstCw0YLRjCDRgdC70LDQudC0XCIpO1xuICAgIGJ0bnNfYm94LmFwcGVuZChidG4pO1xuICAgIGJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLnJlbW92ZUNsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkuYWRkQ2xhc3MoJ2hpZGVfc2xpZGUnKTtcbiAgICB9KTtcbiAgICBlbC5hcHBlbmQoYnRuc19ib3gpO1xuXG4gICAgZWwuYXBwZW5kKCc8aDI+0J7QsdGJ0LjQtSDQv9Cw0YDQsNC80LXRgtGA0Ys8L2gyPicpO1xuICAgIGVsLmFwcGVuZChnZW5JbnB1dCh7XG4gICAgICB2YWx1ZTogc2xpZGVyX2RhdGFbMF0ubW9iaWxlLFxuICAgICAgbGFiZWw6IFwi0KHQu9Cw0LnQtCDQtNC70Y8g0YLQtdC70LXRhNC+0L3QsFwiLFxuICAgICAgaW5wdXRDbGFzczogXCJmaWxlU2VsZWN0XCIsXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBzbGlkZXJfZGF0YVswXS5tb2JpbGUgPSAkKHRoaXMpLnZhbCgpXG4gICAgICAgICQoJy5tb2JfYmcnKS5lcSgwKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBzbGlkZXJfZGF0YVswXS5tb2JpbGUgKyAnKScpO1xuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgZWwuYXBwZW5kKGdlbklucHV0KHtcbiAgICAgIHZhbHVlOiBzbGlkZXJfZGF0YVswXS5mb24sXG4gICAgICBsYWJlbDogXCLQntGB0L3QvtC90L7QuSDRhNC+0L1cIixcbiAgICAgIGlucHV0Q2xhc3M6IFwiZmlsZVNlbGVjdFwiLFxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0uZm9uID0gJCh0aGlzKS52YWwoKVxuICAgICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgc2xpZGVyX2RhdGFbMF0uZm9uICsgJyknKVxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgdmFyIGJ0bl9jaCA9ICQoJzxkaXYgY2xhc3M9XCJidG5zXCIvPicpO1xuICAgIGJ0bl9jaC5hcHBlbmQoJzxoMz7QmtC90L7Qv9C60LAg0L/QtdGA0LXRhdC+0LTQsCjQtNC70Y8g0J/QmiDQstC10YDRgdC40LgpPC9oMz4nKTtcbiAgICBidG5fY2guYXBwZW5kKGdlbklucHV0KHtcbiAgICAgIHZhbHVlOiBzbGlkZXJfZGF0YVswXS5idXR0b24udGV4dCxcbiAgICAgIGxhYmVsOiBcItCi0LXQutGB0YJcIixcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi50ZXh0ID0gJCh0aGlzKS52YWwoKTtcbiAgICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZXJfX2hyZWYnKS5lcSgwKS50ZXh0KHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi50ZXh0KTtcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxuICAgICAgfSxcbiAgICB9KSk7XG5cbiAgICB2YXIgYnV0X3NsID0gJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZXJfX2hyZWYnKS5lcSgwKTtcbiAgICBidG5fY2guYXBwZW5kKGdlbklucHV0KHtcbiAgICAgIHZhbHVlOiBzbGlkZXJfZGF0YVswXS5idXR0b24uaHJlZixcbiAgICAgIGxhYmVsOiBcItCh0YHRi9C70LrQsFwiLFxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0uYnV0dG9uLmhyZWYgPSAkKHRoaXMpLnZhbCgpO1xuICAgICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlcl9faHJlZicpLmVxKDApLmF0dHIoJ2hyZWYnLHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi5ocmVmKTtcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxuICAgICAgfSxcbiAgICB9KSk7XG5cbiAgICBidG5fY2guYXBwZW5kKCc8YnIvPicpO1xuICAgIHZhciB3cmFwX2xhYiA9ICQoJzxsYWJlbC8+Jyk7XG4gICAgYnRuX2NoLmFwcGVuZCh3cmFwX2xhYik7XG4gICAgd3JhcF9sYWIuYXBwZW5kKCc8c3Bhbj7QntGE0L7RgNC80LvQtdC90LjQtSDQutC90L7Qv9C60Lg8L3NwYW4+Jyk7XG4gICAgd3JhcF9sYWIuYXBwZW5kKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OiBidG5fc3R5bGUsXG4gICAgICB2YWxfdHlwZTogMCxcbiAgICAgIG9iajogYnV0X3NsLFxuICAgICAgZ3I6ICdidXR0b24nLFxuICAgICAgaW5kZXg6IGZhbHNlLFxuICAgICAgcGFyYW06ICdjb2xvcidcbiAgICB9KSk7XG5cbiAgICBidG5fY2guYXBwZW5kKCc8YnIvPicpO1xuICAgIHdyYXBfbGFiID0gJCgnPGxhYmVsLz4nKTtcbiAgICBidG5fY2guYXBwZW5kKHdyYXBfbGFiKTtcbiAgICB3cmFwX2xhYi5hcHBlbmQoJzxzcGFuPtCf0L7Qu9C+0LbQtdC90LjQtSDQutC90L7Qv9C60Lg8L3NwYW4+Jyk7XG4gICAgd3JhcF9sYWIuYXBwZW5kKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OiBwb3NBcnIsXG4gICAgICB2YWxfbGlzdDogcG9zX2xpc3QsXG4gICAgICB2YWxfdHlwZTogMixcbiAgICAgIG9iajogYnV0X3NsLnBhcmVudCgpLnBhcmVudCgpLFxuICAgICAgZ3I6ICdidXR0b24nLFxuICAgICAgaW5kZXg6IGZhbHNlLFxuICAgICAgcGFyYW06ICdwb3MnXG4gICAgfSkpO1xuXG4gICAgYnRuX2NoLmFwcGVuZChnZXRTZWxBbmltYXRpb25Db250cm9sbCh7XG4gICAgICB0eXBlOiAwLFxuICAgICAgb2JqOiBidXRfc2wucGFyZW50KCksXG4gICAgICBncjogJ2J1dHRvbicsXG4gICAgICBpbmRleDogZmFsc2VcbiAgICB9KSk7XG4gICAgZWwuYXBwZW5kKGJ0bl9jaCk7XG5cbiAgICB2YXIgbGF5ZXIgPSAkKCc8ZGl2IGNsYXNzPVwiZml4ZWRfbGF5ZXJcIi8+Jyk7XG4gICAgbGF5ZXIuYXBwZW5kKCc8aDI+0KHRgtCw0YLQuNGH0LXRgdC60LjQtSDRgdC70L7QuDwvaDI+Jyk7XG4gICAgdmFyIHRoID0gXCI8dGg+4oSWPC90aD5cIiArXG4gICAgICBcIjx0aD7QmtCw0YDRgtC40L3QutCwPC90aD5cIiArXG4gICAgICBcIjx0aD7Qn9C+0LvQvtC20LXQvdC40LU8L3RoPlwiICtcbiAgICAgIFwiPHRoPtCh0LvQvtC5INC90LAg0LLRgdGOINCy0YvRgdC+0YLRgzwvdGg+XCIgK1xuICAgICAgXCI8dGg+0JDQvdC40LzQsNGG0LjRjyDQv9C+0Y/QstC70LXQvdC40Y88L3RoPlwiICtcbiAgICAgIFwiPHRoPtCX0LDQtNC10YDQttC60LAg0L/QvtGP0LLQu9C10L3QuNGPPC90aD5cIiArXG4gICAgICBcIjx0aD7QkNC90LjQvNCw0YbQuNGPINC40YHRh9C10LfQvdC+0LLQtdC90LjRjzwvdGg+XCIgK1xuICAgICAgXCI8dGg+0JfQsNC00LXRgNC20LrQsCDQuNGB0YfQtdC30L3QvtCy0LXQvdC40Y88L3RoPlwiICtcbiAgICAgIFwiPHRoPtCU0LXQudGB0YLQstC40LU8L3RoPlwiO1xuICAgIHN0VGFibGUgPSAkKCc8dGFibGUgYm9yZGVyPVwiMVwiPjx0cj4nICsgdGggKyAnPC90cj48L3RhYmxlPicpO1xuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcbiAgICB2YXIgZGF0YSA9IHNsaWRlcl9kYXRhWzBdLmZpeGVkO1xuICAgIGlmIChkYXRhICYmIGRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFkZFRyU3RhdGljKGRhdGFbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgICBsYXllci5hcHBlbmQoc3RUYWJsZSk7XG4gICAgdmFyIGFkZEJ0biA9ICQoJzxidXR0b24vPicsIHtcbiAgICAgIHRleHQ6IFwi0JTQvtCx0LDQstC40YLRjCDRgdC70L7QuVwiXG4gICAgfSk7XG4gICAgYWRkQnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBkYXRhID0gYWRkVHJTdGF0aWMoZmFsc2UpO1xuICAgICAgaW5pdEltYWdlU2VydmVyU2VsZWN0KGRhdGEuZWRpdG9yLmZpbmQoJy5maWxlU2VsZWN0JykpO1xuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkodGhpcy5zbGlkZXJfZGF0YVswXSkpXG4gICAgfS5iaW5kKHtcbiAgICAgIHNsaWRlcl9kYXRhOiBzbGlkZXJfZGF0YVxuICAgIH0pKTtcbiAgICBsYXllci5hcHBlbmQoYWRkQnRuKTtcbiAgICBlbC5hcHBlbmQobGF5ZXIpO1xuXG4gICAgdmFyIGxheWVyID0gJCgnPGRpdiBjbGFzcz1cInBhcmFsYXhfbGF5ZXJcIi8+Jyk7XG4gICAgbGF5ZXIuYXBwZW5kKCc8aDI+0J/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuDwvaDI+Jyk7XG4gICAgdmFyIHRoID0gXCI8dGg+4oSWPC90aD5cIiArXG4gICAgICBcIjx0aD7QmtCw0YDRgtC40L3QutCwPC90aD5cIiArXG4gICAgICBcIjx0aD7Qn9C+0LvQvtC20LXQvdC40LU8L3RoPlwiICtcbiAgICAgIFwiPHRoPtCj0LTQsNC70LXQvdC90L7RgdGC0YwgKNGG0LXQu9C+0LUg0L/QvtC70L7QttC40YLQtdC70YzQvdC+0LUg0YfQuNGB0LvQvik8L3RoPlwiICtcbiAgICAgIFwiPHRoPtCU0LXQudGB0YLQstC40LU8L3RoPlwiO1xuXG4gICAgcGFyYWxheFRhYmxlID0gJCgnPHRhYmxlIGJvcmRlcj1cIjFcIj48dHI+JyArIHRoICsgJzwvdHI+PC90YWJsZT4nKTtcbiAgICAvL9C10YHQu9C4INC10YHRgtGMINC/0LDRgNCw0LvQsNC60YEg0YHQu9C+0Lgg0LfQsNC/0L7Qu9C90Y/QtdC8XG4gICAgdmFyIGRhdGEgPSBzbGlkZXJfZGF0YVswXS5wYXJhbGF4O1xuICAgIGlmIChkYXRhICYmIGRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFkZFRyUGFyYWxheChkYXRhW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbGF5ZXIuYXBwZW5kKHBhcmFsYXhUYWJsZSk7XG4gICAgdmFyIGFkZEJ0biA9ICQoJzxidXR0b24vPicsIHtcbiAgICAgIHRleHQ6IFwi0JTQvtCx0LDQstC40YLRjCDRgdC70L7QuVwiXG4gICAgfSk7XG4gICAgYWRkQnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBkYXRhID0gYWRkVHJQYXJhbGF4KGZhbHNlKTtcbiAgICAgIGluaXRJbWFnZVNlcnZlclNlbGVjdChkYXRhLmVkaXRvci5maW5kKCcuZmlsZVNlbGVjdCcpKTtcbiAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHRoaXMuc2xpZGVyX2RhdGFbMF0pKVxuICAgIH0uYmluZCh7XG4gICAgICBzbGlkZXJfZGF0YTogc2xpZGVyX2RhdGFcbiAgICB9KSk7XG5cbiAgICBsYXllci5hcHBlbmQoYWRkQnRuKTtcbiAgICBlbC5hcHBlbmQobGF5ZXIpO1xuXG4gICAgaW5pdEltYWdlU2VydmVyU2VsZWN0KGVsLmZpbmQoJy5maWxlU2VsZWN0JykpO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkVHJTdGF0aWMoZGF0YSkge1xuICAgIHZhciBpID0gc3RUYWJsZS5maW5kKCd0cicpLmxlbmd0aCAtIDE7XG4gICAgaWYgKCFkYXRhKSB7XG4gICAgICBkYXRhID0ge1xuICAgICAgICBcImltZ1wiOiBcIlwiLFxuICAgICAgICBcImZ1bGxfaGVpZ2h0XCI6IDAsXG4gICAgICAgIFwicG9zXCI6IDAsXG4gICAgICAgIFwic2hvd19kZWxheVwiOiAxLFxuICAgICAgICBcInNob3dfYW5pbWF0aW9uXCI6IFwibGlnaHRTcGVlZEluXCIsXG4gICAgICAgIFwiaGlkZV9kZWxheVwiOiAxLFxuICAgICAgICBcImhpZGVfYW5pbWF0aW9uXCI6IFwiYm91bmNlT3V0XCJcbiAgICAgIH07XG4gICAgICBzbGlkZXJfZGF0YVswXS5maXhlZC5wdXNoKGRhdGEpO1xuICAgICAgdmFyIGZpeCA9ICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAnKTtcbiAgICAgIGFkZFN0YXRpY0xheWVyKGRhdGEsIGZpeCwgdHJ1ZSk7XG4gICAgfVxuICAgIDtcblxuICAgIHZhciB0ciA9ICQoJzx0ci8+Jyk7XG4gICAgdHIuYXBwZW5kKCc8dGQgY2xhc3M9XCJ0ZF9jb3VudGVyXCIvPicpO1xuICAgIHRyLmFwcGVuZChnZW5JbnB1dCh7XG4gICAgICB2YWx1ZTogZGF0YS5pbWcsXG4gICAgICBsYWJlbDogZmFsc2UsXG4gICAgICBwYXJlbnQ6ICd0ZCcsXG4gICAgICBpbnB1dENsYXNzOiBcImZpbGVTZWxlY3RcIixcbiAgICAgIGJpbmQ6IHtcbiAgICAgICAgZ3I6ICdmaXhlZCcsXG4gICAgICAgIGluZGV4OiBpLFxuICAgICAgICBwYXJhbTogJ2ltZycsXG4gICAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSkuZmluZCgnLmFuaW1hdGlvbl9sYXllcicpLFxuICAgICAgfSxcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciBkYXRhID0gdGhpcztcbiAgICAgICAgZGF0YS5vYmouY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5pbnB1dC52YWwoKSArICcpJyk7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLmZpeGVkW2RhdGEuaW5kZXhdLmltZyA9IGRhdGEuaW5wdXQudmFsKCk7XG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcbiAgICAgIH1cbiAgICB9KSk7XG4gICAgdHIuYXBwZW5kKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OiBwb3NBcnIsXG4gICAgICB2YWxfbGlzdDogcG9zX2xpc3QsXG4gICAgICB2YWxfdHlwZTogMixcbiAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSksXG4gICAgICBncjogJ2ZpeGVkJyxcbiAgICAgIGluZGV4OiBpLFxuICAgICAgcGFyYW06ICdwb3MnLFxuICAgICAgcGFyZW50OiAndGQnLFxuICAgIH0pKTtcbiAgICB0ci5hcHBlbmQoZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6IHllc19ub192YWwsXG4gICAgICB2YWxfbGlzdDogeWVzX25vX2FycixcbiAgICAgIHZhbF90eXBlOiAyLFxuICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKSxcbiAgICAgIGdyOiAnZml4ZWQnLFxuICAgICAgaW5kZXg6IGksXG4gICAgICBwYXJhbTogJ2Z1bGxfaGVpZ2h0JyxcbiAgICAgIHBhcmVudDogJ3RkJyxcbiAgICB9KSk7XG4gICAgdHIuYXBwZW5kKGdldFNlbEFuaW1hdGlvbkNvbnRyb2xsKHtcbiAgICAgIHR5cGU6IDEsXG4gICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLmZpbmQoJy5hbmltYXRpb25fbGF5ZXInKSxcbiAgICAgIGdyOiAnZml4ZWQnLFxuICAgICAgaW5kZXg6IGksXG4gICAgICBwYXJlbnQ6ICd0ZCdcbiAgICB9KSk7XG4gICAgdmFyIGRlbEJ0biA9ICQoJzxidXR0b24vPicsIHtcbiAgICAgIHRleHQ6IFwi0KPQtNCw0LvQuNGC0YxcIlxuICAgIH0pO1xuICAgIGRlbEJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdmFyICR0aGlzID0gJCh0aGlzLmVsKTtcbiAgICAgIGkgPSAkdGhpcy5jbG9zZXN0KCd0cicpLmluZGV4KCkgLSAxO1xuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSkucmVtb3ZlKCk7IC8v0YPQtNCw0LvRj9C10Lwg0YHQu9C+0Lkg0L3QsCDRgdC70LDQudC00LXRgNC1XG4gICAgICAkdGhpcy5jbG9zZXN0KCd0cicpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0YLRgNC+0LrRgyDQsiDRgtCw0LHQu9C40YbQtVxuICAgICAgdGhpcy5zbGlkZXJfZGF0YVswXS5maXhlZC5zcGxpY2UoaSwgMSk7IC8v0YPQtNCw0LvRj9C10Lwg0LjQtyDQutC+0L3RhNC40LPQsCDRgdC70LDQudC00LBcbiAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHRoaXMuc2xpZGVyX2RhdGFbMF0pKVxuICAgIH0uYmluZCh7XG4gICAgICBlbDogZGVsQnRuLFxuICAgICAgc2xpZGVyX2RhdGE6IHNsaWRlcl9kYXRhXG4gICAgfSkpO1xuICAgIHZhciBkZWxCdG5UZCA9ICQoJzx0ZC8+JykuYXBwZW5kKGRlbEJ0bik7XG4gICAgdHIuYXBwZW5kKGRlbEJ0blRkKTtcbiAgICBzdFRhYmxlLmFwcGVuZCh0cilcblxuICAgIHJldHVybiB7XG4gICAgICBlZGl0b3I6IHRyLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFRyUGFyYWxheChkYXRhKSB7XG4gICAgdmFyIGkgPSBwYXJhbGF4VGFibGUuZmluZCgndHInKS5sZW5ndGggLSAxO1xuICAgIGlmICghZGF0YSkge1xuICAgICAgZGF0YSA9IHtcbiAgICAgICAgXCJpbWdcIjogXCJcIixcbiAgICAgICAgXCJ6XCI6IDFcbiAgICAgIH07XG4gICAgICBzbGlkZXJfZGF0YVswXS5wYXJhbGF4LnB1c2goZGF0YSk7XG4gICAgICB2YXIgcGFyYWxheF9nciA9ICQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwJyk7XG4gICAgICBhZGRQYXJhbGF4TGF5ZXIoZGF0YSwgcGFyYWxheF9ncik7XG4gICAgfVxuICAgIDtcbiAgICB2YXIgdHIgPSAkKCc8dHIvPicpO1xuICAgIHRyLmFwcGVuZCgnPHRkIGNsYXNzPVwidGRfY291bnRlclwiLz4nKTtcbiAgICB0ci5hcHBlbmQoZ2VuSW5wdXQoe1xuICAgICAgdmFsdWU6IGRhdGEuaW1nLFxuICAgICAgbGFiZWw6IGZhbHNlLFxuICAgICAgcGFyZW50OiAndGQnLFxuICAgICAgaW5wdXRDbGFzczogXCJmaWxlU2VsZWN0XCIsXG4gICAgICBiaW5kOiB7XG4gICAgICAgIGluZGV4OiBpLFxuICAgICAgICBwYXJhbTogJ2ltZycsXG4gICAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5wYXJhbGxheF9fZ3JvdXAgLnBhcmFsbGF4X19sYXllcicpLmVxKGkpLmZpbmQoJ3NwYW4nKSxcbiAgICAgIH0sXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXM7XG4gICAgICAgIGRhdGEub2JqLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuaW5wdXQudmFsKCkgKyAnKScpO1xuICAgICAgICBzbGlkZXJfZGF0YVswXS5wYXJhbGF4W2RhdGEuaW5kZXhdLmltZyA9IGRhdGEuaW5wdXQudmFsKCk7XG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcbiAgICAgIH1cbiAgICB9KSk7XG4gICAgdHIuYXBwZW5kKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OiBwb3NBcnIsXG4gICAgICB2YWxfbGlzdDogcG9zX2xpc3QsXG4gICAgICB2YWxfdHlwZTogMixcbiAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5wYXJhbGxheF9fZ3JvdXAgLnBhcmFsbGF4X19sYXllcicpLmVxKGkpLmZpbmQoJ3NwYW4nKSxcbiAgICAgIGdyOiAncGFyYWxheCcsXG4gICAgICBpbmRleDogaSxcbiAgICAgIHBhcmFtOiAncG9zJyxcbiAgICAgIHBhcmVudDogJ3RkJyxcbiAgICAgIHN0YXJ0X29wdGlvbjogJzxvcHRpb24gdmFsdWU9XCJcIiBjb2RlPVwiXCI+0L3QsCDQstC10YHRjCDRjdC60YDQsNC9PC9vcHRpb24+J1xuICAgIH0pKTtcbiAgICB0ci5hcHBlbmQoZ2VuSW5wdXQoe1xuICAgICAgdmFsdWU6IGRhdGEueixcbiAgICAgIGxhYmVsOiBmYWxzZSxcbiAgICAgIHBhcmVudDogJ3RkJyxcbiAgICAgIGJpbmQ6IHtcbiAgICAgICAgaW5kZXg6IGksXG4gICAgICAgIHBhcmFtOiAnaW1nJyxcbiAgICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLnBhcmFsbGF4X19ncm91cCAucGFyYWxsYXhfX2xheWVyJykuZXEoaSksXG4gICAgICB9LFxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzO1xuICAgICAgICBkYXRhLm9iai5hdHRyKCd6JywgZGF0YS5pbnB1dC52YWwoKSk7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLnBhcmFsYXhbZGF0YS5pbmRleF0ueiA9IGRhdGEuaW5wdXQudmFsKCk7XG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICB2YXIgZGVsQnRuID0gJCgnPGJ1dHRvbi8+Jywge1xuICAgICAgdGV4dDogXCLQo9C00LDQu9C40YLRjFwiXG4gICAgfSk7XG4gICAgZGVsQnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMuZWwpO1xuICAgICAgaSA9ICR0aGlzLmNsb3Nlc3QoJ3RyJykuaW5kZXgoKSAtIDE7XG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKS5yZW1vdmUoKTsgLy/Rg9C00LDQu9GP0LXQvCDRgdC70L7QuSDQvdCwINGB0LvQsNC50LTQtdGA0LVcbiAgICAgICR0aGlzLmNsb3Nlc3QoJ3RyJykucmVtb3ZlKCk7IC8v0YPQtNCw0LvRj9C10Lwg0YHRgtGA0L7QutGDINCyINGC0LDQsdC70LjRhtC1XG4gICAgICB0aGlzLnNsaWRlcl9kYXRhWzBdLnBhcmFsYXguc3BsaWNlKGksIDEpOyAvL9GD0LTQsNC70Y/QtdC8INC40Lcg0LrQvtC90YTQuNCz0LAg0YHQu9Cw0LnQtNCwXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcbiAgICB9LmJpbmQoe1xuICAgICAgZWw6IGRlbEJ0bixcbiAgICAgIHNsaWRlcl9kYXRhOiBzbGlkZXJfZGF0YVxuICAgIH0pKTtcbiAgICB2YXIgZGVsQnRuVGQgPSAkKCc8dGQvPicpLmFwcGVuZChkZWxCdG4pO1xuICAgIHRyLmFwcGVuZChkZWxCdG5UZCk7XG4gICAgcGFyYWxheFRhYmxlLmFwcGVuZCh0cilcblxuICAgIHJldHVybiB7XG4gICAgICBlZGl0b3I6IHRyLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZF9hbmltYXRpb24oZWwsIGRhdGEpIHtcbiAgICB2YXIgb3V0ID0gJCgnPGRpdi8+Jywge1xuICAgICAgJ2NsYXNzJzogJ2FuaW1hdGlvbl9sYXllcidcbiAgICB9KTtcblxuICAgIGlmICh0eXBlb2YoZGF0YS5zaG93X2RlbGF5KSAhPSAndW5kZWZpbmVkJykge1xuICAgICAgb3V0LmFkZENsYXNzKHNob3dfZGVsYXlbZGF0YS5zaG93X2RlbGF5XSk7XG4gICAgICBpZiAoZGF0YS5zaG93X2FuaW1hdGlvbikge1xuICAgICAgICBvdXQuYWRkQ2xhc3MoJ3NsaWRlXycgKyBkYXRhLnNob3dfYW5pbWF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mKGRhdGEuaGlkZV9kZWxheSkgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIG91dC5hZGRDbGFzcyhoaWRlX2RlbGF5W2RhdGEuaGlkZV9kZWxheV0pO1xuICAgICAgaWYgKGRhdGEuaGlkZV9hbmltYXRpb24pIHtcbiAgICAgICAgb3V0LmFkZENsYXNzKCdzbGlkZV8nICsgZGF0YS5oaWRlX2FuaW1hdGlvbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZWwuYXBwZW5kKG91dCk7XG4gICAgcmV0dXJuIGVsO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VuZXJhdGVfc2xpZGUoZGF0YSkge1xuICAgIHZhciBzbGlkZSA9ICQoJzxkaXYgY2xhc3M9XCJzbGlkZVwiLz4nKTtcblxuICAgIHZhciBtb2JfYmcgPSAkKCc8YSBjbGFzcz1cIm1vYl9iZ1wiIGhyZWY9XCInICsgZGF0YS5idXR0b24uaHJlZiArICdcIi8+Jyk7XG4gICAgbW9iX2JnLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEubW9iaWxlICsgJyknKVxuXG4gICAgc2xpZGUuYXBwZW5kKG1vYl9iZyk7XG4gICAgaWYgKG1vYmlsZV9tb2RlKSB7XG4gICAgICByZXR1cm4gc2xpZGU7XG4gICAgfVxuXG4gICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDRhNC+0L0g0YLQviDQt9Cw0L/QvtC70L3Rj9C10LxcbiAgICBpZiAoZGF0YS5mb24pIHtcbiAgICAgIHNsaWRlLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuZm9uICsgJyknKVxuICAgIH1cblxuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcbiAgICBpZiAoZGF0YS5wYXJhbGF4ICYmIGRhdGEucGFyYWxheC5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgcGFyYWxheF9nciA9ICQoJzxkaXYgY2xhc3M9XCJwYXJhbGxheF9fZ3JvdXBcIi8+Jyk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEucGFyYWxheC5sZW5ndGg7IGkrKykge1xuICAgICAgICBhZGRQYXJhbGF4TGF5ZXIoZGF0YS5wYXJhbGF4W2ldLCBwYXJhbGF4X2dyKVxuICAgICAgfVxuICAgICAgc2xpZGUuYXBwZW5kKHBhcmFsYXhfZ3IpXG4gICAgfVxuXG4gICAgdmFyIGZpeCA9ICQoJzxkaXYgY2xhc3M9XCJmaXhlZF9ncm91cFwiLz4nKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEuZml4ZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFkZFN0YXRpY0xheWVyKGRhdGEuZml4ZWRbaV0sIGZpeClcbiAgICB9XG5cbiAgICB2YXIgZG9wX2JsayA9ICQoXCI8ZGl2IGNsYXNzPSdmaXhlZF9fbGF5ZXInLz5cIik7XG4gICAgZG9wX2Jsay5hZGRDbGFzcyhwb3NBcnJbZGF0YS5idXR0b24ucG9zXSk7XG4gICAgdmFyIGJ1dCA9ICQoXCI8YSBjbGFzcz0nc2xpZGVyX19ocmVmJy8+XCIpO1xuICAgIGJ1dC5hdHRyKCdocmVmJywgZGF0YS5idXR0b24uaHJlZik7XG4gICAgYnV0LnRleHQoZGF0YS5idXR0b24udGV4dCk7XG4gICAgYnV0LmFkZENsYXNzKGRhdGEuYnV0dG9uLmNvbG9yKTtcbiAgICBkb3BfYmxrID0gYWRkX2FuaW1hdGlvbihkb3BfYmxrLCBkYXRhLmJ1dHRvbik7XG4gICAgZG9wX2Jsay5maW5kKCdkaXYnKS5hcHBlbmQoYnV0KTtcbiAgICBmaXguYXBwZW5kKGRvcF9ibGspO1xuXG4gICAgc2xpZGUuYXBwZW5kKGZpeCk7XG4gICAgcmV0dXJuIHNsaWRlO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkUGFyYWxheExheWVyKGRhdGEsIHBhcmFsYXhfZ3IpIHtcbiAgICB2YXIgcGFyYWxsYXhfbGF5ZXIgPSAkKCc8ZGl2IGNsYXNzPVwicGFyYWxsYXhfX2xheWVyXCJcXD4nKTtcbiAgICBwYXJhbGxheF9sYXllci5hdHRyKCd6JywgZGF0YS56IHx8IGkgKiAxMCk7XG4gICAgdmFyIGRvcF9ibGsgPSAkKFwiPHNwYW4gY2xhc3M9J3NsaWRlcl9fdGV4dCcvPlwiKTtcbiAgICBpZiAoZGF0YS5wb3MpIHtcbiAgICAgIGRvcF9ibGsuYWRkQ2xhc3MocG9zQXJyW2RhdGEucG9zXSk7XG4gICAgfVxuICAgIGRvcF9ibGsuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5pbWcgKyAnKScpO1xuICAgIHBhcmFsbGF4X2xheWVyLmFwcGVuZChkb3BfYmxrKTtcbiAgICBwYXJhbGF4X2dyLmFwcGVuZChwYXJhbGxheF9sYXllcik7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRTdGF0aWNMYXllcihkYXRhLCBmaXgsIGJlZm9yX2J1dHRvbikge1xuICAgIHZhciBkb3BfYmxrID0gJChcIjxkaXYgY2xhc3M9J2ZpeGVkX19sYXllcicvPlwiKTtcbiAgICBkb3BfYmxrLmFkZENsYXNzKHBvc0FycltkYXRhLnBvc10pO1xuICAgIGlmIChkYXRhLmZ1bGxfaGVpZ2h0KSB7XG4gICAgICBkb3BfYmxrLmFkZENsYXNzKCdmaXhlZF9fZnVsbC1oZWlnaHQnKTtcbiAgICB9XG4gICAgZG9wX2JsayA9IGFkZF9hbmltYXRpb24oZG9wX2JsaywgZGF0YSk7XG4gICAgZG9wX2Jsay5maW5kKCcuYW5pbWF0aW9uX2xheWVyJykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgZGF0YS5pbWcgKyAnKScpO1xuXG4gICAgaWYgKGJlZm9yX2J1dHRvbikge1xuICAgICAgZml4LmZpbmQoJy5zbGlkZXJfX2hyZWYnKS5jbG9zZXN0KCcuZml4ZWRfX2xheWVyJykuYmVmb3JlKGRvcF9ibGspXG4gICAgfSBlbHNlIHtcbiAgICAgIGZpeC5hcHBlbmQoZG9wX2JsaylcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBuZXh0X3NsaWRlKCkge1xuICAgIGlmICgkKCcjbWVnYV9zbGlkZXInKS5oYXNDbGFzcygnc3RvcF9zbGlkZScpKXJldHVybjtcblxuICAgIHZhciBzbGlkZV9wb2ludHMgPSAkKCcuc2xpZGVfc2VsZWN0X2JveCAuc2xpZGVfc2VsZWN0JylcbiAgICB2YXIgc2xpZGVfY250ID0gc2xpZGVfcG9pbnRzLmxlbmd0aDtcbiAgICB2YXIgYWN0aXZlID0gJCgnLnNsaWRlX3NlbGVjdF9ib3ggLnNsaWRlci1hY3RpdmUnKS5pbmRleCgpICsgMTtcbiAgICBpZiAoYWN0aXZlID49IHNsaWRlX2NudClhY3RpdmUgPSAwO1xuICAgIHNsaWRlX3BvaW50cy5lcShhY3RpdmUpLmNsaWNrKCk7XG5cbiAgICB0aW1lb3V0SWQ9c2V0VGltZW91dChuZXh0X3NsaWRlLCBzY3JvbGxfcGVyaW9kKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGltZ190b19sb2FkKHNyYykge1xuICAgIHZhciBpbWcgPSAkKCc8aW1nLz4nKTtcbiAgICBpbWcub24oJ2xvYWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICB0b3RfaW1nX3dhaXQtLTtcblxuICAgICAgaWYgKHRvdF9pbWdfd2FpdCA9PSAwKSB7XG5cbiAgICAgICAgc2xpZGVzLmFwcGVuZChnZW5lcmF0ZV9zbGlkZShzbGlkZXJfZGF0YVtyZW5kZXJfc2xpZGVfbm9tXSkpO1xuICAgICAgICBzbGlkZV9zZWxlY3RfYm94LmZpbmQoJ2xpJykuZXEocmVuZGVyX3NsaWRlX25vbSkucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cbiAgICAgICAgaWYgKHJlbmRlcl9zbGlkZV9ub20gPT0gMCkge1xuICAgICAgICAgIHNsaWRlcy5maW5kKCcuc2xpZGUnKVxuICAgICAgICAgICAgLmFkZENsYXNzKCdmaXJzdF9zaG93JylcbiAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xuICAgICAgICAgIHNsaWRlX3NlbGVjdF9ib3guZmluZCgnbGknKS5lcSgwKS5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xuXG4gICAgICAgICAgaWYgKCFlZGl0b3IpIHtcbiAgICAgICAgICAgIGlmKHRpbWVvdXRJZCljbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgICAgIHRpbWVvdXRJZD1zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgJCh0aGlzKS5maW5kKCcuZmlyc3Rfc2hvdycpLnJlbW92ZUNsYXNzKCdmaXJzdF9zaG93Jyk7XG4gICAgICAgICAgICB9LmJpbmQoc2xpZGVzKSwgc2Nyb2xsX3BlcmlvZCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG1vYmlsZV9tb2RlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcGFyYWxsYXhfZ3JvdXAgPSAkKGNvbnRhaW5lcl9pZCArICcgLnNsaWRlci1hY3RpdmUgLnBhcmFsbGF4X19ncm91cD4qJyk7XG4gICAgICAgICAgICBwYXJhbGxheF9jb3VudGVyID0gMDtcbiAgICAgICAgICAgIHBhcmFsbGF4X3RpbWVyID0gc2V0SW50ZXJ2YWwocmVuZGVyLCAxMDApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChlZGl0b3IpIHtcbiAgICAgICAgICAgIGluaXRfZWRpdG9yKClcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYodGltZW91dElkKWNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICAgICAgdGltZW91dElkID0gc2V0VGltZW91dChuZXh0X3NsaWRlLCBzY3JvbGxfcGVyaW9kKTtcblxuICAgICAgICAgICAgJCgnLnNsaWRlX3NlbGVjdF9ib3gnKS5vbignY2xpY2snLCAnLnNsaWRlX3NlbGVjdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgICAgICAgaWYgKCR0aGlzLmhhc0NsYXNzKCdzbGlkZXItYWN0aXZlJykpcmV0dXJuO1xuXG4gICAgICAgICAgICAgIHZhciBpbmRleCA9ICR0aGlzLmluZGV4KCk7XG4gICAgICAgICAgICAgICQoJy5zbGlkZV9zZWxlY3RfYm94IC5zbGlkZXItYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgJHRoaXMuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcblxuICAgICAgICAgICAgICAkKGNvbnRhaW5lcl9pZCArICcgLnNsaWRlLnNsaWRlci1hY3RpdmUnKS5yZW1vdmVDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAkKGNvbnRhaW5lcl9pZCArICcgLnNsaWRlJykuZXEoaW5kZXgpLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG5cbiAgICAgICAgICAgICAgcGFyYWxsYXhfZ3JvdXAgPSAkKGNvbnRhaW5lcl9pZCArICcgLnNsaWRlci1hY3RpdmUgLnBhcmFsbGF4X19ncm91cD4qJyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJCgnI21lZ2Ffc2xpZGVyJykuaG92ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBpZih0aW1lb3V0SWQpY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICAgICQoJyNtZWdhX3NsaWRlcicpLmFkZENsYXNzKCdzdG9wX3NsaWRlJyk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQobmV4dF9zbGlkZSwgc2Nyb2xsX3BlcmlvZCk7XG4gICAgICAgICAgICAgICQoJyNtZWdhX3NsaWRlcicpLnJlbW92ZUNsYXNzKCdzdG9wX3NsaWRlJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZW5kZXJfc2xpZGVfbm9tKys7XG4gICAgICAgIGlmIChyZW5kZXJfc2xpZGVfbm9tIDwgc2xpZGVyX2RhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgbG9hZF9zbGlkZV9pbWcoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkub24oJ2Vycm9yJywgZnVuY3Rpb24gKCkge1xuICAgICAgdG90X2ltZ193YWl0LS07XG4gICAgfSk7XG4gICAgaW1nLnByb3AoJ3NyYycsIHNyYyk7XG4gIH1cblxuICBmdW5jdGlvbiBsb2FkX3NsaWRlX2ltZygpIHtcbiAgICB2YXIgZGF0YSA9IHNsaWRlcl9kYXRhW3JlbmRlcl9zbGlkZV9ub21dO1xuICAgIHRvdF9pbWdfd2FpdCA9IDE7XG5cbiAgICBpZiAobW9iaWxlX21vZGUgPT09IGZhbHNlKSB7XG4gICAgICB0b3RfaW1nX3dhaXQrKztcbiAgICAgIGltZ190b19sb2FkKGRhdGEuZm9uKTtcbiAgICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcbiAgICAgIGlmIChkYXRhLnBhcmFsYXggJiYgZGF0YS5wYXJhbGF4Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgdG90X2ltZ193YWl0ICs9IGRhdGEucGFyYWxheC5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5wYXJhbGF4Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaW1nX3RvX2xvYWQoZGF0YS5wYXJhbGF4W2ldLmltZylcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGRhdGEuZml4ZWQgJiYgZGF0YS5maXhlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRvdF9pbWdfd2FpdCArPSBkYXRhLmZpeGVkLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmZpeGVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaW1nX3RvX2xvYWQoZGF0YS5maXhlZFtpXS5pbWcpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpbWdfdG9fbG9hZChkYXRhLm1vYmlsZSk7XG4gIH1cblxuICBmdW5jdGlvbiBzdGFydF9pbml0X3NsaWRlKGRhdGEpIHtcbiAgICB2YXIgbiA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIHZhciBpbWcgPSAkKCc8aW1nLz4nKTtcbiAgICBpbWcuYXR0cigndGltZScsIG4pO1xuXG4gICAgZnVuY3Rpb24gb25faW1nX2xvYWQoKSB7XG4gICAgICB2YXIgbiA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgaW1nID0gJCh0aGlzKTtcbiAgICAgIG4gPSBuIC0gcGFyc2VJbnQoaW1nLmF0dHIoJ3RpbWUnKSk7XG4gICAgICBpZiAobiA+IG1heF90aW1lX2xvYWRfcGljKSB7XG4gICAgICAgIG1vYmlsZV9tb2RlID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBtYXhfc2l6ZSA9IChzY3JlZW4uaGVpZ2h0ID4gc2NyZWVuLndpZHRoID8gc2NyZWVuLmhlaWdodCA6IHNjcmVlbi53aWR0aCk7XG4gICAgICAgIGlmIChtYXhfc2l6ZSA8IG1vYmlsZV9zaXplKSB7XG4gICAgICAgICAgbW9iaWxlX21vZGUgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1vYmlsZV9tb2RlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChtb2JpbGVfbW9kZSA9PSB0cnVlKSB7XG4gICAgICAgICQoY29udGFpbmVyX2lkKS5hZGRDbGFzcygnbW9iaWxlX21vZGUnKVxuICAgICAgfVxuICAgICAgcmVuZGVyX3NsaWRlX25vbSA9IDA7XG4gICAgICBsb2FkX3NsaWRlX2ltZygpO1xuICAgICAgJCgnLnNrLWZvbGRpbmctY3ViZScpLnJlbW92ZSgpO1xuICAgIH07XG5cbiAgICBpbWcub24oJ2xvYWQnLCBvbl9pbWdfbG9hZCgpKTtcbiAgICBpZiAoc2xpZGVyX2RhdGEubGVuZ3RoID4gMCkge1xuICAgICAgc2xpZGVyX2RhdGFbMF0ubW9iaWxlID0gc2xpZGVyX2RhdGFbMF0ubW9iaWxlICsgJz9yPScgKyBNYXRoLnJhbmRvbSgpO1xuICAgICAgaW1nLnByb3AoJ3NyYycsIHNsaWRlcl9kYXRhWzBdLm1vYmlsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9uX2ltZ19sb2FkKCkuYmluZChpbWcpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXQoZGF0YSwgZWRpdG9yX2luaXQpIHtcbiAgICBzbGlkZXJfZGF0YSA9IGRhdGE7XG4gICAgZWRpdG9yID0gZWRpdG9yX2luaXQ7XG4gICAgLy/QvdCw0YXQvtC00LjQvCDQutC+0L3RgtC10LnQvdC10YAg0Lgg0L7Rh9C40YnQsNC10Lwg0LXQs9C+XG4gICAgdmFyIGNvbnRhaW5lciA9ICQoY29udGFpbmVyX2lkKTtcbiAgICBjb250YWluZXIuaHRtbCgnJyk7XG5cbiAgICAvL9GB0L7Qt9C20LDQtdC8INCx0LDQt9C+0LLRi9C1INC60L7QvdGC0LXQudC90LXRgNGLINC00LvRjyDRgdCw0LzQuNGFINGB0LvQsNC50LTQvtCyINC4INC00LvRjyDQv9C10YDQtdC60LvRjtGH0LDRgtC10LvQtdC5XG4gICAgc2xpZGVzID0gJCgnPGRpdi8+Jywge1xuICAgICAgJ2NsYXNzJzogJ3NsaWRlcydcbiAgICB9KTtcbiAgICB2YXIgc2xpZGVfY29udHJvbCA9ICQoJzxkaXYvPicsIHtcbiAgICAgICdjbGFzcyc6ICdzbGlkZV9jb250cm9sJ1xuICAgIH0pO1xuICAgIHNsaWRlX3NlbGVjdF9ib3ggPSAkKCc8dWwvPicsIHtcbiAgICAgICdjbGFzcyc6ICdzbGlkZV9zZWxlY3RfYm94J1xuICAgIH0pO1xuXG4gICAgLy/QtNC+0LHQsNCy0LvRj9C10Lwg0LjQvdC00LjQutCw0YLQvtGAINC30LDQs9GA0YPQt9C60LhcbiAgICB2YXIgbCA9ICc8ZGl2IGNsYXNzPVwic2stZm9sZGluZy1jdWJlXCI+JyArXG4gICAgICAnPGRpdiBjbGFzcz1cInNrLWN1YmUxIHNrLWN1YmVcIj48L2Rpdj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTIgc2stY3ViZVwiPjwvZGl2PicgK1xuICAgICAgJzxkaXYgY2xhc3M9XCJzay1jdWJlNCBzay1jdWJlXCI+PC9kaXY+JyArXG4gICAgICAnPGRpdiBjbGFzcz1cInNrLWN1YmUzIHNrLWN1YmVcIj48L2Rpdj4nICtcbiAgICAgICc8L2Rpdj4nO1xuICAgIGNvbnRhaW5lci5odG1sKGwpO1xuXG5cbiAgICBzdGFydF9pbml0X3NsaWRlKGRhdGFbMF0pO1xuXG4gICAgLy/Qs9C10L3QtdGA0LjRgNGD0LXQvCDQutC90L7Qv9C60Lgg0Lgg0YHQu9Cw0LnQtNGLXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvL3NsaWRlcy5hcHBlbmQoZ2VuZXJhdGVfc2xpZGUoZGF0YVtpXSkpO1xuICAgICAgc2xpZGVfc2VsZWN0X2JveC5hcHBlbmQoJzxsaSBjbGFzcz1cInNsaWRlX3NlbGVjdCBkaXNhYmxlZFwiLz4nKVxuICAgIH1cblxuICAgIC8qc2xpZGVzLmZpbmQoJy5zbGlkZScpLmVxKDApXG4gICAgIC5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpXG4gICAgIC5hZGRDbGFzcygnZmlyc3Rfc2hvdycpO1xuICAgICBzbGlkZV9jb250cm9sLmZpbmQoJ2xpJykuZXEoMCkuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTsqL1xuXG4gICAgY29udGFpbmVyLmFwcGVuZChzbGlkZXMpO1xuICAgIHNsaWRlX2NvbnRyb2wuYXBwZW5kKHNsaWRlX3NlbGVjdF9ib3gpO1xuICAgIGNvbnRhaW5lci5hcHBlbmQoc2xpZGVfY29udHJvbCk7XG5cblxuICB9XG5cbiAgZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIGlmICghcGFyYWxsYXhfZ3JvdXApcmV0dXJuIGZhbHNlO1xuICAgIHZhciBwYXJhbGxheF9rID0gKHBhcmFsbGF4X2NvdW50ZXIgLSAxMCkgLyAyO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJhbGxheF9ncm91cC5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGVsID0gcGFyYWxsYXhfZ3JvdXAuZXEoaSk7XG4gICAgICB2YXIgaiA9IGVsLmF0dHIoJ3onKTtcbiAgICAgIHZhciB0ciA9ICdyb3RhdGUzZCgwLjEsMC44LDAsJyArIChwYXJhbGxheF9rKSArICdkZWcpIHNjYWxlKCcgKyAoMSArIGogKiAwLjUpICsgJykgdHJhbnNsYXRlWigtJyArICgxMCArIGogKiAyMCkgKyAncHgpJztcbiAgICAgIGVsLmNzcygndHJhbnNmb3JtJywgdHIpXG4gICAgfVxuICAgIHBhcmFsbGF4X2NvdW50ZXIgKz0gcGFyYWxsYXhfZCAqIDAuMTtcbiAgICBpZiAocGFyYWxsYXhfY291bnRlciA+PSAyMClwYXJhbGxheF9kID0gLXBhcmFsbGF4X2Q7XG4gICAgaWYgKHBhcmFsbGF4X2NvdW50ZXIgPD0gMClwYXJhbGxheF9kID0gLXBhcmFsbGF4X2Q7XG4gIH1cblxuICBpbml0SW1hZ2VTZXJ2ZXJTZWxlY3QoJCgnLmZpbGVTZWxlY3QnKSk7XG5cbiAgcmV0dXJuIHtcbiAgICBpbml0OiBpbml0XG4gIH07XG59KCkpO1xuIiwiOyhmdW5jdGlvbigkKXtcblxuICBmdW5jdGlvbiBhamF4X3NhdmUoZWxlbWVudCl7XG4gICAgdGhpcy5pbml0KGVsZW1lbnQpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGNsZWFyQ2xhc3MoKXtcbiAgICB2YXIgb3B0aW9ucz10aGlzO1xuICAgIG9wdGlvbnMudGhpcy5wYXJlbnQoKS5yZW1vdmVDbGFzcygnYWpheFNhdmluZ0ZhaWxlZCcpO1xuICAgIG9wdGlvbnMudGhpcy5wYXJlbnQoKS5yZW1vdmVDbGFzcygnYWpheFNhdmluZ09rJyk7XG4gIH1cblxuICBhamF4X3NhdmUucHJvdG90eXBlLmluaXQ9ZnVuY3Rpb24oZWxlbWVudCl7XG4gICAgdGFnTmFtZT1lbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcbiAgICBlbGVtZW50PSQoZWxlbWVudCk7XG4gICAgaWYodGFnTmFtZT09XCJpbnB1dFwiIHx8IHRhZ05hbWU9PVwic2VsZWN0XCIpe1xuICAgICAgb2JqPWVsZW1lbnQ7XG4gICAgfWVsc2V7XG4gICAgICBvYmo9ZWxlbWVudC5maW5kKCdpbnB1dCxzZWxlY3QnKTtcbiAgICB9XG5cbiAgICBwb3N0X3VybD1lbGVtZW50LmF0dHIoJ3NhdmVfdXJsJyk7XG4gICAgdWlkPWVsZW1lbnQuYXR0cigndWlkJyk7XG5cbiAgICBmb3IodmFyIGk9MDtpPG9iai5sZW5ndGg7aSsrKXtcbiAgICAgIHZhciBvcHRpb25zPXtcbiAgICAgICAgdXJsOnBvc3RfdXJsLFxuICAgICAgICBpZDp1aWQsXG4gICAgICAgIHRoaXM6b2JqLmVxKGkpXG4gICAgICB9O1xuXG4gICAgICBvcHRpb25zLnRoaXNcbiAgICAgICAgLm9mZignY2hhbmdlJylcbiAgICAgICAgLm9uKCdjaGFuZ2UnLGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBvcHRpb25zPXRoaXM7XG4gICAgICAgIHZhciB2YWw9b3B0aW9ucy50aGlzLnZhbCgpO1xuICAgICAgICB2YXIgdHlwZT1vcHRpb25zLnRoaXMuYXR0cigndHlwZScpO1xuICAgICAgICBpZih0eXBlICYmIHR5cGUudG9Mb3dlckNhc2UoKT09J2NoZWNrYm94Jyl7XG4gICAgICAgICAgaWYoIW9wdGlvbnMudGhpcy5wcm9wKCdjaGVja2VkJykpe1xuICAgICAgICAgICAgdmFsPTA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBwb3N0PXtcbiAgICAgICAgICBpZDpvcHRpb25zLmlkLFxuICAgICAgICAgIHZhbHVlOnZhbCxcbiAgICAgICAgICBuYW1lOm9wdGlvbnMudGhpcy5hdHRyKCduYW1lJylcbiAgICAgICAgfTtcblxuICAgICAgICBvcHRpb25zLnRoaXMucGFyZW50KCkuYWRkQ2xhc3MoJ2FqYXhJblNhdmluZycpO1xuICAgICAgICAkLnBvc3Qob3B0aW9ucy51cmwscG9zdCxmdW5jdGlvbigpe1xuICAgICAgICAgIHZhciBvcHRpb25zPXRoaXM7XG4gICAgICAgICAgb3B0aW9ucy50aGlzLnBhcmVudCgpLnJlbW92ZUNsYXNzKCdhamF4SW5TYXZpbmcnKTtcbiAgICAgICAgICBvcHRpb25zLnRoaXMucGFyZW50KCkuYWRkQ2xhc3MoJ2FqYXhTYXZpbmdPaycpO1xuICAgICAgICAgIHNldFRpbWVvdXQoY2xlYXJDbGFzcy5iaW5kKG9wdGlvbnMpLDMwMDApXG4gICAgICAgIH0uYmluZChvcHRpb25zKSkuZmFpbChmdW5jdGlvbigpe1xuICAgICAgICAgIHZhciBvcHRpb25zPXRoaXM7XG4gICAgICAgICAgb3B0aW9ucy50aGlzLnBhcmVudCgpLnJlbW92ZUNsYXNzKCdhamF4SW5TYXZpbmcnKTtcbiAgICAgICAgICBvcHRpb25zLnRoaXMucGFyZW50KCkuYWRkQ2xhc3MoJ2FqYXhTYXZpbmdGYWlsZWQnKTtcbiAgICAgICAgICBzZXRUaW1lb3V0KGNsZWFyQ2xhc3MuYmluZChvcHRpb25zKSw0MDAwKVxuICAgICAgICB9LmJpbmQob3B0aW9ucykpXG4gICAgICB9LmJpbmQob3B0aW9ucykpXG4gICAgfVxuICB9O1xuXG4gICQuZm4uYWpheF9zYXZlPWZ1bmN0aW9uKCl7XG4gICAgJCh0aGlzKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICBuZXcgYWpheF9zYXZlKHRoaXMpO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbn0pKGpRdWVyeSk7XG4kKCcuYWpheF9zYXZlJykuYWpheF9zYXZlKCk7IiwiO1xuJChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gb25SZW1vdmUoKXtcbiAgICAkdGhpcz0kKHRoaXMpO1xuICAgIHBvc3Q9e1xuICAgICAgaWQ6JHRoaXMuYXR0cigndWlkJyksXG4gICAgICB0eXBlOiR0aGlzLmF0dHIoJ21vZGUnKVxuICAgIH07XG4gICAgJC5wb3N0KCR0aGlzLmF0dHIoJ3VybCcpLHBvc3QsZnVuY3Rpb24oZGF0YSl7XG4gICAgICBpZihkYXRhICYmIGRhdGE9PSdlcnInKXtcbiAgICAgICAgbXNnPSR0aGlzLmRhdGEoJ3JlbW92ZS1lcnJvcicpO1xuICAgICAgICBpZighbXNnKXtcbiAgICAgICAgICBtc2c9J9Cd0LXQstC+0LfQvNC+0LbQvdC+INGD0LTQsNC70LjRgtGMINGN0LvQtdC80LXQvdGCJztcbiAgICAgICAgfVxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOm1zZyx0eXBlOidlcnInfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbW9kZT0kdGhpcy5hdHRyKCdtb2RlJyk7XG4gICAgICBpZighbW9kZSl7XG4gICAgICAgIG1vZGU9J3JtJztcbiAgICAgIH1cblxuICAgICAgaWYobW9kZT09J3JtJykge1xuICAgICAgICBybSA9ICR0aGlzLmNsb3Nlc3QoJy50b19yZW1vdmUnKTtcbiAgICAgICAgcm1fY2xhc3MgPSBybS5hdHRyKCdybV9jbGFzcycpO1xuICAgICAgICBpZiAocm1fY2xhc3MpIHtcbiAgICAgICAgICAkKHJtX2NsYXNzKS5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJtLnJlbW92ZSgpO1xuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOifQo9GB0L/QtdGI0L3QvtC1INGD0LTQsNC70LXQvdC40LUuJyx0eXBlOidpbmZvJ30pXG4gICAgICB9XG4gICAgICBpZihtb2RlPT0ncmVsb2FkJyl7XG4gICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICBsb2NhdGlvbi5ocmVmPWxvY2F0aW9uLmhyZWY7XG4gICAgICB9XG4gICAgfSkuZmFpbChmdW5jdGlvbigpe1xuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0J7RiNC40LHQutCwINGD0LTQsNC70L3QuNGPJyx0eXBlOidlcnInfSk7XG4gICAgfSlcbiAgfVxuXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCcuYWpheF9yZW1vdmUnLGZ1bmN0aW9uKCl7XG4gICAgbm90aWZpY2F0aW9uLmNvbmZpcm0oe1xuICAgICAgY2FsbGJhY2tZZXM6b25SZW1vdmUsXG4gICAgICBvYmo6JCh0aGlzKSxcbiAgICAgIG5vdHlmeV9jbGFzczogXCJub3RpZnlfYm94LWFsZXJ0XCJcbiAgICB9KVxuICB9KTtcblxufSk7XG5cbiIsInZhciBub3RpZmljYXRpb24gPSAoZnVuY3Rpb24gKCkge1xuICB2YXIgY29udGVpbmVyO1xuICB2YXIgbW91c2VPdmVyID0gMDtcbiAgdmFyIHRpbWVyQ2xlYXJBbGwgPSBudWxsO1xuICB2YXIgYW5pbWF0aW9uRW5kID0gJ3dlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmQnO1xuICB2YXIgdGltZSA9IDEwMDAwO1xuXG4gIHZhciBub3RpZmljYXRpb25fYm94ID0gZmFsc2U7XG4gIHZhciBpc19pbml0ID0gZmFsc2U7XG4gIHZhciBjb25maXJtX29wdCA9IHtcbiAgICAvLyB0aXRsZTogbGcoJ2RlbGV0aW5nJyksXG4gICAgLy8gcXVlc3Rpb246IGxnKCdhcmVfeW91X3N1cmVfdG9fZGVsZXRlJyksXG4gICAgLy8gYnV0dG9uWWVzOiBsZygneWVzJyksXG4gICAgLy8gYnV0dG9uTm86IGxnKCdubycpLFxuICAgIGNhbGxiYWNrWWVzOiBmYWxzZSxcbiAgICBjYWxsYmFja05vOiBmYWxzZSxcbiAgICBvYmo6IGZhbHNlLFxuICAgIGJ1dHRvblRhZzogJ2RpdicsXG4gICAgYnV0dG9uWWVzRG9wOiAnJyxcbiAgICBidXR0b25Ob0RvcDogJydcbiAgfTtcbiAgdmFyIGFsZXJ0X29wdCA9IHtcbiAgICB0aXRsZTogXCJcIixcbiAgICBxdWVzdGlvbjogJ21lc3NhZ2UnLFxuICAgIC8vIGJ1dHRvblllczogbGcoJ3llcycpLFxuICAgIGNhbGxiYWNrWWVzOiBmYWxzZSxcbiAgICBidXR0b25UYWc6ICdkaXYnLFxuICAgIG9iajogZmFsc2VcbiAgfTtcblxuICBmdW5jdGlvbiB0ZXN0SXBob25lKCkge1xuICAgIGlmICghLyhpUGhvbmV8aVBhZHxpUG9kKS4qKE9TIDExKS8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSkgcmV0dXJuO1xuICAgIG5vdGlmaWNhdGlvbl9ib3guY3NzKCdwb3NpdGlvbicsICdhYnNvbHV0ZScpO1xuICAgIG5vdGlmaWNhdGlvbl9ib3guY3NzKCd0b3AnLCAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKSk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0KCkge1xuICAgIGlzX2luaXQgPSB0cnVlO1xuICAgIG5vdGlmaWNhdGlvbl9ib3ggPSAkKCcubm90aWZpY2F0aW9uX2JveCcpO1xuICAgIGlmIChub3RpZmljYXRpb25fYm94Lmxlbmd0aCA+IDApcmV0dXJuO1xuXG4gICAgJCgnYm9keScpLmFwcGVuZChcIjxkaXYgY2xhc3M9J25vdGlmaWNhdGlvbl9ib3gnPjwvZGl2PlwiKTtcbiAgICBub3RpZmljYXRpb25fYm94ID0gJCgnLm5vdGlmaWNhdGlvbl9ib3gnKTtcblxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywgJy5ub3RpZnlfY29udHJvbCcsIGNsb3NlTW9kYWwpO1xuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywgJy5ub3RpZnlfY2xvc2UnLCBjbG9zZU1vZGFsKTtcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsIGNsb3NlTW9kYWxGb24pO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2VNb2RhbCgpIHtcbiAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XG4gICAgJCgnLm5vdGlmaWNhdGlvbl9ib3ggLm5vdGlmeV9jb250ZW50JykuaHRtbCgnJyk7XG4gIH1cblxuICBmdW5jdGlvbiBjbG9zZU1vZGFsRm9uKGUpIHtcbiAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xuICAgIGlmICh0YXJnZXQuY2xhc3NOYW1lID09IFwibm90aWZpY2F0aW9uX2JveFwiKSB7XG4gICAgICBjbG9zZU1vZGFsKCk7XG4gICAgfVxuICB9XG5cbiAgdmFyIF9zZXRVcExpc3RlbmVycyA9IGZ1bmN0aW9uICgpIHtcbiAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5ub3RpZmljYXRpb25fY2xvc2UnLCBfY2xvc2VQb3B1cCk7XG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWVudGVyJywgJy5ub3RpZmljYXRpb25fY29udGFpbmVyJywgX29uRW50ZXIpO1xuICAgICQoJ2JvZHknKS5vbignbW91c2VsZWF2ZScsICcubm90aWZpY2F0aW9uX2NvbnRhaW5lcicsIF9vbkxlYXZlKTtcbiAgfTtcblxuICB2YXIgX29uRW50ZXIgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQpZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAodGltZXJDbGVhckFsbCAhPSBudWxsKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXJDbGVhckFsbCk7XG4gICAgICB0aW1lckNsZWFyQWxsID0gbnVsbDtcbiAgICB9XG4gICAgY29udGVpbmVyLmZpbmQoJy5ub3RpZmljYXRpb25faXRlbScpLmVhY2goZnVuY3Rpb24gKGkpIHtcbiAgICAgIHZhciBvcHRpb24gPSAkKHRoaXMpLmRhdGEoJ29wdGlvbicpO1xuICAgICAgaWYgKG9wdGlvbi50aW1lcikge1xuICAgICAgICBjbGVhclRpbWVvdXQob3B0aW9uLnRpbWVyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBtb3VzZU92ZXIgPSAxO1xuICB9O1xuXG4gIHZhciBfb25MZWF2ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb250ZWluZXIuZmluZCgnLm5vdGlmaWNhdGlvbl9pdGVtJykuZWFjaChmdW5jdGlvbiAoaSkge1xuICAgICAgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgdmFyIG9wdGlvbiA9ICR0aGlzLmRhdGEoJ29wdGlvbicpO1xuICAgICAgaWYgKG9wdGlvbi50aW1lID4gMCkge1xuICAgICAgICBvcHRpb24udGltZXIgPSBzZXRUaW1lb3V0KF9jbG9zZVBvcHVwLmJpbmQob3B0aW9uLmNsb3NlKSwgb3B0aW9uLnRpbWUgLSAxNTAwICsgMTAwICogaSk7XG4gICAgICAgICR0aGlzLmRhdGEoJ29wdGlvbicsIG9wdGlvbilcbiAgICAgIH1cbiAgICB9KTtcbiAgICBtb3VzZU92ZXIgPSAwO1xuICB9O1xuXG4gIHZhciBfY2xvc2VQb3B1cCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIGlmIChldmVudClldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKS5wYXJlbnQoKTtcbiAgICAkdGhpcy5vbihhbmltYXRpb25FbmQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICQodGhpcykucmVtb3ZlKCk7XG4gICAgfSk7XG4gICAgJHRoaXMuYWRkQ2xhc3MoJ25vdGlmaWNhdGlvbl9oaWRlJylcbiAgfTtcblxuICBmdW5jdGlvbiBhbGVydChkYXRhKSB7XG4gICAgaWYgKCFkYXRhKWRhdGEgPSB7fTtcbiAgICBhbGVydF9vcHQgPSBvYmplY3RzKGFsZXJ0X29wdCwge1xuICAgICAgICBidXR0b25ZZXM6IGxnKCd5ZXMnKVxuICAgIH0pO1xuICAgIGRhdGEgPSBvYmplY3RzKGFsZXJ0X29wdCwgZGF0YSk7XG5cbiAgICBpZiAoIWlzX2luaXQpaW5pdCgpO1xuICAgIHRlc3RJcGhvbmUoKTtcblxuICAgIG5vdHlmeV9jbGFzcyA9ICdub3RpZnlfYm94ICc7XG4gICAgaWYgKGRhdGEubm90eWZ5X2NsYXNzKW5vdHlmeV9jbGFzcyArPSBkYXRhLm5vdHlmeV9jbGFzcztcblxuICAgIGJveF9odG1sID0gJzxkaXYgY2xhc3M9XCInICsgbm90eWZ5X2NsYXNzICsgJ1wiPic7XG4gICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfdGl0bGVcIj4nO1xuICAgIGJveF9odG1sICs9IGRhdGEudGl0bGU7XG4gICAgYm94X2h0bWwgKz0gJzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG5cbiAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcbiAgICBib3hfaHRtbCArPSBkYXRhLnF1ZXN0aW9uO1xuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuXG4gICAgaWYgKGRhdGEuYnV0dG9uWWVzIHx8IGRhdGEuYnV0dG9uTm8pIHtcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uWWVzKWJveF9odG1sICs9ICc8JyArIGRhdGEuYnV0dG9uVGFnICsgJyBjbGFzcz1cIm5vdGlmeV9idG5feWVzXCIgJyArIGRhdGEuYnV0dG9uWWVzRG9wICsgJz4nICsgZGF0YS5idXR0b25ZZXMgKyAnPC8nICsgZGF0YS5idXR0b25UYWcgKyAnPic7XG4gICAgICBpZiAoZGF0YS5idXR0b25Obylib3hfaHRtbCArPSAnPCcgKyBkYXRhLmJ1dHRvblRhZyArICcgY2xhc3M9XCJub3RpZnlfYnRuX25vXCIgJyArIGRhdGEuYnV0dG9uTm9Eb3AgKyAnPicgKyBkYXRhLmJ1dHRvbk5vICsgJzwvJyArIGRhdGEuYnV0dG9uVGFnICsgJz4nO1xuICAgICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG4gICAgfVxuXG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG4gICAgbm90aWZpY2F0aW9uX2JveC5odG1sKGJveF9odG1sKTtcblxuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XG4gICAgfSwgMTAwKVxuICB9XG5cbiAgZnVuY3Rpb24gY29uZmlybShkYXRhKSB7XG4gICAgaWYgKCFkYXRhKWRhdGEgPSB7fTtcbiAgICBjb25maXJtX29wdCA9IG9iamVjdHMoY29uZmlybV9vcHQsIHtcbiAgICAgICAgdGl0bGU6IGxnKCdkZWxldGluZycpLFxuICAgICAgICBxdWVzdGlvbjogbGcoJ2FyZV95b3Vfc3VyZV90b19kZWxldGUnKSxcbiAgICAgICAgYnV0dG9uWWVzOiBsZygneWVzJyksXG4gICAgICAgIGJ1dHRvbk5vOiBsZygnbm8nKVxuICAgIH0pO1xuICAgIGRhdGEgPSBvYmplY3RzKGNvbmZpcm1fb3B0LCBkYXRhKTtcbiAgICBpZiAodHlwZW9mKGRhdGEuY2FsbGJhY2tZZXMpID09ICdzdHJpbmcnKSB7XG4gICAgICB2YXIgY29kZSA9ICdkYXRhLmNhbGxiYWNrWWVzID0gZnVuY3Rpb24oKXsnK2RhdGEuY2FsbGJhY2tZZXMrJ30nO1xuICAgICAgZXZhbChjb2RlKTtcbiAgICB9XG5cbiAgICBpZiAoIWlzX2luaXQpaW5pdCgpO1xuICAgIHRlc3RJcGhvbmUoKTtcbiAgICAvL2JveF9odG1sPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveFwiPic7XG5cbiAgICBub3R5ZnlfY2xhc3MgPSAnbm90aWZ5X2JveCAnO1xuICAgIGlmIChkYXRhLm5vdHlmeV9jbGFzcylub3R5ZnlfY2xhc3MgKz0gZGF0YS5ub3R5ZnlfY2xhc3M7XG5cbiAgICBib3hfaHRtbCA9ICc8ZGl2IGNsYXNzPVwiJyArIG5vdHlmeV9jbGFzcyArICdcIj4nO1xuXG4gICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfdGl0bGVcIj4nO1xuICAgIGJveF9odG1sICs9IGRhdGEudGl0bGU7XG4gICAgYm94X2h0bWwgKz0gJzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG5cbiAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcbiAgICBib3hfaHRtbCArPSBkYXRhLnF1ZXN0aW9uO1xuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuXG4gICAgaWYgKGRhdGEuYnV0dG9uWWVzIHx8IGRhdGEuYnV0dG9uTm8pIHtcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uWWVzKWJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2J0bl95ZXNcIj4nICsgZGF0YS5idXR0b25ZZXMgKyAnPC9kaXY+JztcbiAgICAgIGlmIChkYXRhLmJ1dHRvbk5vKWJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2J0bl9ub1wiPicgKyBkYXRhLmJ1dHRvbk5vICsgJzwvZGl2Pic7XG4gICAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcbiAgICB9XG5cbiAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xuXG4gICAgaWYgKGRhdGEuY2FsbGJhY2tZZXMgIT0gZmFsc2UpIHtcbiAgICAgIG5vdGlmaWNhdGlvbl9ib3guZmluZCgnLm5vdGlmeV9idG5feWVzJykub24oJ2NsaWNrJywgZGF0YS5jYWxsYmFja1llcy5iaW5kKGRhdGEub2JqKSk7XG4gICAgfVxuICAgIGlmIChkYXRhLmNhbGxiYWNrTm8gIT0gZmFsc2UpIHtcbiAgICAgIG5vdGlmaWNhdGlvbl9ib3guZmluZCgnLm5vdGlmeV9idG5fbm8nKS5vbignY2xpY2snLCBkYXRhLmNhbGxiYWNrTm8uYmluZChkYXRhLm9iaikpO1xuICAgIH1cblxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdzaG93X25vdGlmaScpO1xuICAgIH0sIDEwMClcblxuICB9XG5cbiAgZnVuY3Rpb24gbm90aWZpKGRhdGEpIHtcbiAgICBpZiAoIWRhdGEpZGF0YSA9IHt9O1xuICAgIHZhciBvcHRpb24gPSB7dGltZTogKGRhdGEudGltZSB8fCBkYXRhLnRpbWUgPT09IDApID8gZGF0YS50aW1lIDogdGltZX07XG4gICAgaWYgKCFjb250ZWluZXIpIHtcbiAgICAgIGNvbnRlaW5lciA9ICQoJzx1bC8+Jywge1xuICAgICAgICAnY2xhc3MnOiAnbm90aWZpY2F0aW9uX2NvbnRhaW5lcidcbiAgICAgIH0pO1xuXG4gICAgICAkKCdib2R5JykuYXBwZW5kKGNvbnRlaW5lcik7XG4gICAgICBfc2V0VXBMaXN0ZW5lcnMoKTtcbiAgICB9XG5cbiAgICB2YXIgbGkgPSAkKCc8bGkvPicsIHtcbiAgICAgIGNsYXNzOiAnbm90aWZpY2F0aW9uX2l0ZW0nXG4gICAgfSk7XG5cbiAgICBpZiAoZGF0YS50eXBlKSB7XG4gICAgICBsaS5hZGRDbGFzcygnbm90aWZpY2F0aW9uX2l0ZW0tJyArIGRhdGEudHlwZSk7XG4gICAgfVxuXG4gICAgdmFyIGNsb3NlID0gJCgnPHNwYW4vPicsIHtcbiAgICAgIGNsYXNzOiAnbm90aWZpY2F0aW9uX2Nsb3NlJ1xuICAgIH0pO1xuICAgIG9wdGlvbi5jbG9zZSA9IGNsb3NlO1xuICAgIGxpLmFwcGVuZChjbG9zZSk7XG5cbiAgICB2YXIgY29udGVudCA9ICQoJzxkaXYvPicsIHtcbiAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl9jb250ZW50XCJcbiAgICB9KTtcblxuICAgIGlmIChkYXRhLnRpdGxlICYmIGRhdGEudGl0bGUubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIHRpdGxlID0gJCgnPGg1Lz4nLCB7XG4gICAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90aXRsZVwiXG4gICAgICB9KTtcbiAgICAgIHRpdGxlLmh0bWwoZGF0YS50aXRsZSk7XG4gICAgICBjb250ZW50LmFwcGVuZCh0aXRsZSk7XG4gICAgfVxuXG4gICAgdmFyIHRleHQgPSAkKCc8ZGl2Lz4nLCB7XG4gICAgICBjbGFzczogXCJub3RpZmljYXRpb25fdGV4dFwiXG4gICAgfSk7XG4gICAgdGV4dC5odG1sKGRhdGEubWVzc2FnZSk7XG5cbiAgICBpZiAoZGF0YS5pbWcgJiYgZGF0YS5pbWcubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIGltZyA9ICQoJzxkaXYvPicsIHtcbiAgICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX2ltZ1wiXG4gICAgICB9KTtcbiAgICAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLmltZyArICcpJyk7XG4gICAgICB2YXIgd3JhcCA9ICQoJzxkaXYvPicsIHtcbiAgICAgICAgY2xhc3M6IFwid3JhcFwiXG4gICAgICB9KTtcblxuICAgICAgd3JhcC5hcHBlbmQoaW1nKTtcbiAgICAgIHdyYXAuYXBwZW5kKHRleHQpO1xuICAgICAgY29udGVudC5hcHBlbmQod3JhcCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRlbnQuYXBwZW5kKHRleHQpO1xuICAgIH1cbiAgICBsaS5hcHBlbmQoY29udGVudCk7XG5cbiAgICAvL1xuICAgIC8vIGlmKGRhdGEudGl0bGUgJiYgZGF0YS50aXRsZS5sZW5ndGg+MCkge1xuICAgIC8vICAgdmFyIHRpdGxlID0gJCgnPHAvPicsIHtcbiAgICAvLyAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX3RpdGxlXCJcbiAgICAvLyAgIH0pO1xuICAgIC8vICAgdGl0bGUuaHRtbChkYXRhLnRpdGxlKTtcbiAgICAvLyAgIGxpLmFwcGVuZCh0aXRsZSk7XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gaWYoZGF0YS5pbWcgJiYgZGF0YS5pbWcubGVuZ3RoPjApIHtcbiAgICAvLyAgIHZhciBpbWcgPSAkKCc8ZGl2Lz4nLCB7XG4gICAgLy8gICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl9pbWdcIlxuICAgIC8vICAgfSk7XG4gICAgLy8gICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5pbWcrJyknKTtcbiAgICAvLyAgIGxpLmFwcGVuZChpbWcpO1xuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIHZhciBjb250ZW50ID0gJCgnPGRpdi8+Jyx7XG4gICAgLy8gICBjbGFzczpcIm5vdGlmaWNhdGlvbl9jb250ZW50XCJcbiAgICAvLyB9KTtcbiAgICAvLyBjb250ZW50Lmh0bWwoZGF0YS5tZXNzYWdlKTtcbiAgICAvL1xuICAgIC8vIGxpLmFwcGVuZChjb250ZW50KTtcbiAgICAvL1xuICAgIGNvbnRlaW5lci5hcHBlbmQobGkpO1xuXG4gICAgaWYgKG9wdGlvbi50aW1lID4gMCkge1xuICAgICAgb3B0aW9uLnRpbWVyID0gc2V0VGltZW91dChfY2xvc2VQb3B1cC5iaW5kKGNsb3NlKSwgb3B0aW9uLnRpbWUpO1xuICAgIH1cbiAgICBsaS5kYXRhKCdvcHRpb24nLCBvcHRpb24pXG4gIH1cblxuICByZXR1cm4ge1xuICAgIGFsZXJ0OiBhbGVydCxcbiAgICBjb25maXJtOiBjb25maXJtLFxuICAgIG5vdGlmaTogbm90aWZpXG4gIH07XG5cbn0pKCk7XG5cblxuJCgnW3JlZj1wb3B1cF0nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICR0aGlzID0gJCh0aGlzKTtcbiAgZWwgPSAkKCR0aGlzLmF0dHIoJ2hyZWYnKSk7XG4gIGRhdGEgPSBlbC5kYXRhKCk7XG5cbiAgZGF0YS5xdWVzdGlvbiA9IGVsLmh0bWwoKTtcbiAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xufSk7XG5cbiQoJ1tyZWY9Y29uZmlybV0nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICR0aGlzID0gJCh0aGlzKTtcbiAgZWwgPSAkKCR0aGlzLmF0dHIoJ2hyZWYnKSk7XG4gIGRhdGEgPSBlbC5kYXRhKCk7XG4gIGRhdGEucXVlc3Rpb24gPSBlbC5odG1sKCk7XG4gIG5vdGlmaWNhdGlvbi5jb25maXJtKGRhdGEpO1xufSk7XG5cblxuJCgnLmRpc2FibGVkJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAkdGhpcyA9ICQodGhpcyk7XG4gIGRhdGEgPSAkdGhpcy5kYXRhKCk7XG4gIGlmIChkYXRhWydidXR0b25feWVzJ10pIHtcbiAgICBkYXRhWydidXR0b25ZZXMnXSA9IGRhdGFbJ2J1dHRvbl95ZXMnXTtcbiAgfVxuICBpZiAoZGF0YVsnYnV0dG9uX3llcyddID09PSBmYWxzZSkge1xuICAgIGRhdGFbJ2J1dHRvblllcyddID0gZmFsc2U7XG4gIH1cblxuICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XG59KTsiLCIkKGZ1bmN0aW9uKCkge1xuXG4gIGZ1bmN0aW9uIHVwZGF0ZShkYXRhKXtcbiAgICAkdGhpcz0kKHRoaXMpO1xuICAgIG1vZGU9JHRoaXMuYXR0cignbW9kZScpO1xuICAgIGlmKG1vZGU9PSdyYXRlJyl7XG4gICAgICAkcGFyZW50PSR0aGlzLmNsb3Nlc3QoJy5hY29yZGlvbl9jb250ZW50Jyk7XG4gICAgICAkcGFyZW50PSRwYXJlbnQuZmluZCgndGFibGUnKTtcbiAgICAgIGRhdGE9JChkYXRhKTtcbiAgICAgIGRhdGEuYWpheF9zYXZlKCk7XG4gICAgICAkcGFyZW50LmFwcGVuZChkYXRhKVxuICAgIH1cblxuICAgIGlmKG1vZGU9PSd0YXJpZmYnKXtcbiAgICAgICRwYXJlbnQ9JHRoaXMuY2xvc2VzdCgnLmFjb3JkaW9uX2NvbnRlbnQnKTtcbiAgICAgIGRhdGE9JChkYXRhKTtcbiAgICAgIGRhdGEuZmluZCgnLmFqYXhfc2F2ZScpLmFqYXhfc2F2ZSgpO1xuICAgICAgJHBhcmVudC5hcHBlbmQoZGF0YSlcbiAgICB9XG5cbiAgICBpZihtb2RlPT0nYWN0aW9uJyl7XG4gICAgICAkcGFyZW50PSR0aGlzLmNsb3Nlc3QoJy5jcGFfYm94Jyk7XG4gICAgICBkYXRhPSQoZGF0YSk7XG4gICAgICBkYXRhLmZpbmQoJy5hamF4X3NhdmUnKS5hamF4X3NhdmUoKTtcbiAgICAgICRwYXJlbnQuYXBwZW5kKGRhdGEpXG4gICAgfVxuXG4gICAgaWYobW9kZT09J2NwYScpe1xuICAgICAgZGF0YT1KU09OLnBhcnNlKGRhdGEpO1xuXG4gICAgICAkcGFyZW50PSR0aGlzLmNsb3Nlc3QoJy50YXJpZl9zZWxlY3RfYmxrJyk7XG5cbiAgICAgICRwYXJlbnQucHJlcGVuZChkYXRhWyd0YWJfaGVhZF9zdWYnXSk7XG4gICAgICAkcGFyZW50LmZpbmQoJy50YWJfY29udHJvbCcpXG4gICAgICAgIC5hcHBlbmQoZGF0YVsndGFiX2hlYWRfYnV0J10pXG4gICAgICAgIC5hamF4X3NhdmUoKTtcblxuICAgICAgZGF0YT0kKGRhdGFbJ3RhYl9ib2R5J10pO1xuICAgICAgZGF0YS5maW5kKCcuYWpheF9zYXZlJykuYWpheF9zYXZlKCk7XG4gICAgICAkcGFyZW50XG4gICAgICAgIC5maW5kKCcuY29udGVudF90YWInKVxuICAgICAgICAuYXBwZW5kKGRhdGEpXG4gICAgfVxuICB9XG5cbiAgJCgnYm9keScpLm9uKCdjbGljaycsJy5hZGRfc2hvcF9lbGVtZW50JyxmdW5jdGlvbigpe1xuICAgICR0aGlzPSQodGhpcyk7XG4gICAgcG9zdD17XG4gICAgICBjb2RlOiR0aGlzLmF0dHIoJ2NvZGUnKSxcbiAgICAgIHBhcmVudDokdGhpcy5hdHRyKCdwYXJlbnQnKSxcbiAgICAgIHR5cGU6JHRoaXMuYXR0cignbW9kZScpXG4gICAgfTtcbiAgICB1cGRhdGVFbGVtZW50PXVwZGF0ZS5iaW5kKCR0aGlzKTtcbiAgICAkLnBvc3QoXCIvYWRtaW4vc3RvcmVzL2FqYXhfaW5zZXJ0L1wiKyR0aGlzLmF0dHIoJ21vZGUnKSxwb3N0LHVwZGF0ZUVsZW1lbnQpLmZhaWwoZnVuY3Rpb24oKSB7XG4gICAgICBhbGVydCggXCLQntGI0LjQsdC60LAg0LTQvtCx0LDQstC70LXQvdC40Y9cIiApO1xuICAgIH0pXG4gIH0pO1xuXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCcuY3BhX2JveF9jaGFuZ2Vfc3RvcmUnLCBmdW5jdGlvbigpe1xuICAgICQoJy5lZGl0X2Jsa19zdG9yZScpLnRvZ2dsZUNsYXNzKCdoaWRkZW4nKTtcbiAgfSlcbn0pO1xuIiwiZnVuY3Rpb24gYWpheEZvcm0oZWxzKSB7XG4gIHZhciBmaWxlQXBpID0gd2luZG93LkZpbGUgJiYgd2luZG93LkZpbGVSZWFkZXIgJiYgd2luZG93LkZpbGVMaXN0ICYmIHdpbmRvdy5CbG9iID8gdHJ1ZSA6IGZhbHNlO1xuICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgZXJyb3JfY2xhc3M6ICcuaGFzLWVycm9yJ1xuICB9O1xuICB2YXIgbGFzdF9wb3N0ID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gb25Qb3N0KHBvc3QpIHtcbiAgICBsYXN0X3Bvc3QgPSArbmV3IERhdGUoKTtcbiAgICAvL2NvbnNvbGUubG9nKHBvc3QsIHRoaXMpO1xuICAgIHZhciBkYXRhID0gdGhpcztcbiAgICB2YXIgZm9ybSA9IGRhdGEuZm9ybTtcbiAgICB2YXIgd3JhcCA9IGRhdGEud3JhcDtcbiAgICB2YXIgd3JhcF9odG1sID0gZGF0YS53cmFwX2h0bWw7XG5cbiAgICBpZiAocG9zdC5yZW5kZXIpIHtcbiAgICAgIHBvc3Qubm90eWZ5X2NsYXNzID0gXCJub3RpZnlfd2hpdGVcIjtcbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydChwb3N0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgd3JhcC5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgZm9ybS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgaWYgKHBvc3QuaHRtbCkge1xuICAgICAgICB3cmFwLmh0bWwocG9zdC5odG1sKTtcbiAgICAgICAgYWpheEZvcm0od3JhcCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIXBvc3QuZXJyb3IpIHtcbiAgICAgICAgICBmb3JtLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgICAgICAgd3JhcC5odG1sKHdyYXBfaHRtbCk7XG4gICAgICAgICAgZm9ybS5maW5kKCdpbnB1dFt0eXBlPXRleHRdLHRleHRhcmVhJykudmFsKCcnKTtcbiAgICAgICAgICBhamF4Rm9ybSh3cmFwKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgcG9zdC5lcnJvciA9PT0gXCJvYmplY3RcIikge1xuICAgICAgZm9yICh2YXIgaW5kZXggaW4gcG9zdC5lcnJvcikge1xuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcbiAgICAgICAgICAndHlwZSc6ICdlcnInLFxuICAgICAgICAgICd0aXRsZSc6IHBvc3QudGl0bGUgPyBwb3N0LnRpdGxlIDogbGcoJ2Vycm9yJyksXG4gICAgICAgICAgJ21lc3NhZ2UnOiBwb3N0LmVycm9yW2luZGV4XVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocG9zdC5lcnJvcikpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcG9zdC5lcnJvci5sZW5ndGg7IGkrKykge1xuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcbiAgICAgICAgICAndHlwZSc6ICdlcnInLFxuICAgICAgICAgICd0aXRsZSc6IHBvc3QudGl0bGUgPyBwb3N0LnRpdGxlIDogbGcoJ2Vycm9yJyksXG4gICAgICAgICAgJ21lc3NhZ2UnOiBwb3N0LmVycm9yW2ldXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAocG9zdC5lcnJvciB8fCBwb3N0Lm1lc3NhZ2UpIHtcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XG4gICAgICAgICAgJ3R5cGUnOiBwb3N0LmVycm9yID09PSBmYWxzZSA/ICdzdWNjZXNzJyA6ICdlcnInLFxuICAgICAgICAgICd0aXRsZSc6IHBvc3QudGl0bGUgPyBwb3N0LnRpdGxlIDogKHBvc3QuZXJyb3IgPT09IGZhbHNlID8gbGcoJ3N1Y2Nlc3MnKSA6IGxnKCdlcnJvcicpKSxcbiAgICAgICAgICAnbWVzc2FnZSc6IHBvc3QubWVzc2FnZSA/IHBvc3QubWVzc2FnZSA6IHBvc3QuZXJyb3JcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vXG4gICAgLy8gbm90aWZpY2F0aW9uLm5vdGlmaSh7XG4gICAgLy8gICAgICd0eXBlJzogcG9zdC5lcnJvciA9PT0gZmFsc2UgPyAnc3VjY2VzcycgOiAnZXJyJyxcbiAgICAvLyAgICAgJ3RpdGxlJzogcG9zdC5lcnJvciA9PT0gZmFsc2UgPyAn0KPRgdC/0LXRiNC90L4nIDogJ9Ce0YjQuNCx0LrQsCcsXG4gICAgLy8gICAgICdtZXNzYWdlJzogQXJyYXkuaXNBcnJheShwb3N0LmVycm9yKSA/IHBvc3QuZXJyb3JbMF0gOiAocG9zdC5tZXNzYWdlID8gcG9zdC5tZXNzYWdlIDogcG9zdC5lcnJvcilcbiAgICAvLyB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uRmFpbCgpIHtcbiAgICBsYXN0X3Bvc3QgPSArbmV3IERhdGUoKTtcbiAgICB2YXIgZGF0YSA9IHRoaXM7XG4gICAgdmFyIGZvcm0gPSBkYXRhLmZvcm07XG4gICAgdmFyIHdyYXAgPSBkYXRhLndyYXA7XG4gICAgd3JhcC5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgIHdyYXAuaHRtbChcbiAgICAgICAgJzxoMz4nK2xnKCdzb3JyeV9ub3RfZXhwZWN0ZWRfZXJyb3InKSsnPGgzPicgK1xuICAgICAgICBsZygnaXRfaGFwcGVuc19zb21ldGltZXMnKVxuICAgICk7XG4gICAgYWpheEZvcm0od3JhcCk7XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uU3VibWl0KGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgLy9lLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgIC8vZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgIHZhciBjdXJyZW50VGltZU1pbGxpcyA9ICtuZXcgRGF0ZSgpO1xuICAgIGlmIChjdXJyZW50VGltZU1pbGxpcyAtIGxhc3RfcG9zdCA8IDEwMDAgKiAyKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgbGFzdF9wb3N0ID0gY3VycmVudFRpbWVNaWxsaXM7XG4gICAgdmFyIGRhdGEgPSB0aGlzO1xuICAgIHZhciBmb3JtID0gZGF0YS5mb3JtO1xuICAgIHZhciB3cmFwID0gZGF0YS53cmFwO1xuICAgIGRhdGEud3JhcF9odG1sPXdyYXAuaHRtbCgpO1xuICAgIHZhciBpc1ZhbGlkID0gdHJ1ZTtcblxuICAgIC8vaW5pdCh3cmFwKTtcblxuICAgIGlmIChmb3JtLnlpaUFjdGl2ZUZvcm0pIHtcbiAgICAgIHZhciBkID0gZm9ybS5kYXRhKCd5aWlBY3RpdmVGb3JtJyk7XG4gICAgICBpZiAoZCkge1xuICAgICAgICBkLnZhbGlkYXRlZCA9IHRydWU7XG4gICAgICAgIGZvcm0uZGF0YSgneWlpQWN0aXZlRm9ybScsIGQpO1xuICAgICAgICBmb3JtLnlpaUFjdGl2ZUZvcm0oJ3ZhbGlkYXRlJyk7XG4gICAgICAgIGlzVmFsaWQgPSBkLnZhbGlkYXRlZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpc1ZhbGlkID0gaXNWYWxpZCAmJiAoZm9ybS5maW5kKGRhdGEucGFyYW0uZXJyb3JfY2xhc3MpLmxlbmd0aCA9PSAwKTtcblxuICAgIGlmICghaXNWYWxpZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSB7XG5cbiAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgdmFyIHJlcXVpcmVkID0gZm9ybS5maW5kKCdpbnB1dC5yZXF1aXJlZCwgdGV4dGFyZWEucmVxdWlyZWQsIGlucHV0W2lkPVwic3VwcG9ydC1yZWNhcHRjaGFcIl0nKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVxdWlyZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGhlbHBCbG9jayA9IHJlcXVpcmVkLmVxKGkpLmNsb3Nlc3QoJy5mb3JtLWdyb3VwJykuZmluZCgnLmhlbHAtYmxvY2snKTtcbiAgICAgICAgdmFyIGhlbHBNZXNzYWdlID0gaGVscEJsb2NrICYmIGhlbHBCbG9jay5kYXRhKCdtZXNzYWdlJykgPyBoZWxwQmxvY2suZGF0YSgnbWVzc2FnZScpIDogbGcoJ3JlcXVpcmVkJyk7XG5cbiAgICAgICAgaWYgKHJlcXVpcmVkLmVxKGkpLnZhbCgpLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICBoZWxwQmxvY2suaHRtbChoZWxwTWVzc2FnZSk7XG4gICAgICAgICAgaXNWYWxpZCA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGhlbHBCbG9jay5odG1sKCcnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFpc1ZhbGlkKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWZvcm0uc2VyaWFsaXplT2JqZWN0KWFkZFNSTygpO1xuXG4gICAgdmFyIHBvc3REYXRhID0gZm9ybS5zZXJpYWxpemVPYmplY3QoKTtcbiAgICBmb3JtLmFkZENsYXNzKCdsb2FkaW5nJyk7XG4gICAgZm9ybS5odG1sKCcnKTtcbiAgICB3cmFwLmh0bWwoJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjtcIj48cD4nK2xnKCdzZW5kaW5nX2RhdGEnKSsnPC9wPjwvZGl2PicpO1xuXG4gICAgZGF0YS51cmwgKz0gKGRhdGEudXJsLmluZGV4T2YoJz8nKSA+IDAgPyAnJicgOiAnPycpICsgJ3JjPScgKyBNYXRoLnJhbmRvbSgpO1xuICAgIC8vY29uc29sZS5sb2coZGF0YS51cmwpO1xuXG4gICAgLyppZighcG9zdERhdGEucmV0dXJuVXJsKXtcbiAgICAgIHBvc3REYXRhLnJldHVyblVybD1sb2NhdGlvbi5ocmVmO1xuICAgIH0qL1xuXG4gICAgJC5wb3N0KFxuICAgICAgZGF0YS51cmwsXG4gICAgICBwb3N0RGF0YSxcbiAgICAgIG9uUG9zdC5iaW5kKGRhdGEpLFxuICAgICAgJ2pzb24nXG4gICAgKS5mYWlsKG9uRmFpbC5iaW5kKGRhdGEpKTtcblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXQod3JhcCkge1xuICAgIGZvcm0gPSB3cmFwLmZpbmQoJ2Zvcm0nKTtcbiAgICBkYXRhID0ge1xuICAgICAgZm9ybTogZm9ybSxcbiAgICAgIHBhcmFtOiBkZWZhdWx0cyxcbiAgICAgIHdyYXA6IHdyYXBcbiAgICB9O1xuICAgIGRhdGEudXJsID0gZm9ybS5hdHRyKCdhY3Rpb24nKSB8fCBsb2NhdGlvbi5ocmVmO1xuICAgIGRhdGEubWV0aG9kID0gZm9ybS5hdHRyKCdtZXRob2QnKSB8fCAncG9zdCc7XG4gICAgZm9ybS51bmJpbmQoJ3N1Ym1pdCcpO1xuICAgIC8vZm9ybS5vZmYoJ3N1Ym1pdCcpO1xuICAgIGZvcm0ub24oJ3N1Ym1pdCcsIG9uU3VibWl0LmJpbmQoZGF0YSkpO1xuICB9XG5cbiAgZWxzLmZpbmQoJ1tyZXF1aXJlZF0nKVxuICAgIC5hZGRDbGFzcygncmVxdWlyZWQnKVxuICAgIC5yZW1vdmVBdHRyKCdyZXF1aXJlZCcpO1xuXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbHMubGVuZ3RoOyBpKyspIHtcbiAgICBpbml0KGVscy5lcShpKSk7XG4gIH1cblxuICBpZiAodHlwZW9mIHBsYWNlaG9sZGVyID09ICdmdW5jdGlvbicpIHtcbiAgICAgIHBsYWNlaG9sZGVyKCk7XG4gIH1cblxufVxuXG5mdW5jdGlvbiBhZGRTUk8oKSB7XG4gICQuZm4uc2VyaWFsaXplT2JqZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBvID0ge307XG4gICAgdmFyIGEgPSB0aGlzLnNlcmlhbGl6ZUFycmF5KCk7XG4gICAgJC5lYWNoKGEsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChvW3RoaXMubmFtZV0pIHtcbiAgICAgICAgaWYgKCFvW3RoaXMubmFtZV0ucHVzaCkge1xuICAgICAgICAgIG9bdGhpcy5uYW1lXSA9IFtvW3RoaXMubmFtZV1dO1xuICAgICAgICB9XG4gICAgICAgIG9bdGhpcy5uYW1lXS5wdXNoKHRoaXMudmFsdWUgfHwgJycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb1t0aGlzLm5hbWVdID0gdGhpcy52YWx1ZSB8fCAnJztcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbztcbiAgfTtcbn07XG5hZGRTUk8oKTsiLCIvLyQod2luZG93KS5sb2FkKGZ1bmN0aW9uKCkge1xuLy9hY2NvcmRpb24uanNcbnZhciBhY2NvcmRpb25Db250cm9sID0gJCgnLmFjY29yZGlvbiAuYWNjb3JkaW9uLWNvbnRyb2wnKTtcbmFjY29yZGlvbkNvbnRyb2wub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJHRoaXMgPSAkKHRoaXMpO1xuICAgICRhY2NvcmRpb24gPSAkdGhpcy5jbG9zZXN0KCcuYWNjb3JkaW9uJyk7XG5cbiAgICBpZiAoJGFjY29yZGlvbi5oYXNDbGFzcygnb3BlbicpKSB7XG4gICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLmhpZGUoMzAwKTtcbiAgICAgICRhY2NvcmRpb24ucmVtb3ZlQ2xhc3MoJ29wZW4nKVxuICAgIH0gZWxzZSB7XG4gICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLnNob3coMzAwKTtcbiAgICAgICRhY2NvcmRpb24uYWRkQ2xhc3MoJ29wZW4nKVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xuYWNjb3JkaW9uQ29udHJvbC5zaG93KCk7XG4vL30pXG5cblxuLy9mdW5jdGlvbnMuanNcbm9iamVjdHMgPSBmdW5jdGlvbiAoYSxiKSB7XG4gIHZhciBjID0gYixcbiAgICBrZXk7XG4gIGZvciAoa2V5IGluIGEpIHtcbiAgICBpZiAoYS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICBjW2tleV0gPSBrZXkgaW4gYiA/IGJba2V5XSA6IGFba2V5XTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGM7XG59O1xuXG4vL9Cf0YDQvtCy0LXRgNC60LAg0LHQuNGC0Ysg0LrQsNGA0YLQuNC90L7Qui5cbi8vIGltZi5qc1xuJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCl7XG4gICAgZGF0YT10aGlzO1xuICAgIGlmKGRhdGEudHlwZT09MCkge1xuICAgICAgZGF0YS5pbWcuYXR0cignc3JjJywgZGF0YS5zcmMpO1xuICAgIH1lbHNle1xuICAgICAgZGF0YS5pbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnK2RhdGEuc3JjKycpJyk7XG4gICAgICBkYXRhLmltZy5yZW1vdmVDbGFzcygnbm9fYXZhJyk7XG4gICAgfVxuICB9XG5cbiAgLy/RgtC10YHRgiDQu9C+0LPQviDQvNCw0LPQsNC30LjQvdCwXG4gIGltZ3M9JCgnc2VjdGlvbjpub3QoLm5hdmlnYXRpb24pJykuZmluZCgnLmxvZ28gaW1nJyk7XG4gIGZvciAodmFyIGk9MDtpPGltZ3MubGVuZ3RoO2krKyl7XG4gICAgaW1nPWltZ3MuZXEoaSk7XG4gICAgc3JjPWltZy5hdHRyKCdzcmMnKTtcbiAgICBpbWcuYXR0cignc3JjJywnL2ltYWdlcy90ZW1wbGF0ZS1sb2dvLmpwZycpO1xuICAgIGRhdGE9e1xuICAgICAgc3JjOnNyYyxcbiAgICAgIGltZzppbWcsXG4gICAgICB0eXBlOjAgLy8g0LTQu9GPIGltZ1tzcmNdXG4gICAgfTtcbiAgICBpbWFnZT0kKCc8aW1nLz4nLHtcbiAgICAgIHNyYzpzcmNcbiAgICB9KS5vbignbG9hZCcsaW1nX2xvYWRfZmluaXNoLmJpbmQoZGF0YSkpXG4gIH1cblxuICAvL9GC0LXRgdGCINCw0LLQsNGC0LDRgNC+0Log0LIg0LrQvtC80LXQvdGC0LDRgNC40Y/RhVxuICBpbWdzPSQoJy5jb21tZW50LXBob3RvJyk7XG4gIGZvciAodmFyIGk9MDtpPGltZ3MubGVuZ3RoO2krKyl7XG4gICAgaW1nPWltZ3MuZXEoaSk7XG4gICAgaWYoaW1nLmhhc0NsYXNzKCdub19hdmEnKSl7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICB2YXIgc3JjPWltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnKTtcbiAgICBzcmM9c3JjLnJlcGxhY2UoJ3VybChcIicsJycpO1xuICAgIHNyYz1zcmMucmVwbGFjZSgnXCIpJywnJyk7XG4gICAgaW1nLmFkZENsYXNzKCdub19hdmEnKTtcblxuICAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoL2ltYWdlcy9ub19hdmEucG5nKScpO1xuICAgIGRhdGE9e1xuICAgICAgc3JjOnNyYyxcbiAgICAgIGltZzppbWcsXG4gICAgICB0eXBlOjEgLy8g0LTQu9GPINGE0L7QvdC+0LLRi9GFINC60LDRgNGC0LjQvdC+0LpcbiAgICB9O1xuICAgIGltYWdlPSQoJzxpbWcvPicse1xuICAgICAgc3JjOnNyY1xuICAgIH0pLm9uKCdsb2FkJyxpbWdfbG9hZF9maW5pc2guYmluZChkYXRhKSlcbiAgfVxufSk7XG5cbihmdW5jdGlvbigpIHtcbiAgZWxzPSQoJy5hamF4X2xvYWQnKTtcbiAgZm9yKGk9MDtpPGVscy5sZW5ndGg7aSsrKXtcbiAgICBlbD1lbHMuZXEoaSk7XG4gICAgdXJsPWVsLmF0dHIoJ3JlcycpO1xuICAgICQuZ2V0KHVybCxmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgJHRoaXM9JCh0aGlzKTtcbiAgICAgICR0aGlzLmh0bWwoZGF0YSk7XG4gICAgICBhamF4Rm9ybSgkdGhpcyk7XG4gICAgfS5iaW5kKGVsKSlcbiAgfVxufSkoKTtcblxuXG4vL2Zvcm1zLmpzXG4kKCdpbnB1dFt0eXBlPWZpbGVdJykub24oJ2NoYW5nZScsZnVuY3Rpb24oZXZ0KXtcbiAgdmFyIGZpbGUgPSBldnQudGFyZ2V0LmZpbGVzOyAvLyBGaWxlTGlzdCBvYmplY3RcbiAgdmFyIGYgPSBmaWxlWzBdO1xuICAvLyBPbmx5IHByb2Nlc3MgaW1hZ2UgZmlsZXMuXG4gIGlmICghZi50eXBlLm1hdGNoKCdpbWFnZS4qJykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cbiAgZGF0YT0ge1xuICAgICdlbCc6IHRoaXMsXG4gICAgJ2YnOiBmXG4gIH07XG4gIHJlYWRlci5vbmxvYWQgPSAoZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICBpbWc9JCgnW2Zvcj1cIicrZGF0YS5lbC5uYW1lKydcIl0nKTtcbiAgICAgIGlmKGltZy5sZW5ndGg+MCl7XG4gICAgICAgIGltZy5hdHRyKCdzcmMnLGUudGFyZ2V0LnJlc3VsdClcbiAgICAgIH1cbiAgICB9O1xuICB9KShkYXRhKTtcbiAgLy8gUmVhZCBpbiB0aGUgaW1hZ2UgZmlsZSBhcyBhIGRhdGEgVVJMLlxuICByZWFkZXIucmVhZEFzRGF0YVVSTChmKTtcbn0pO1xuXG4kKCdib2R5Jykub24oJ2NsaWNrJywnYS5hamF4Rm9ybU9wZW4nLGZ1bmN0aW9uKGUpe1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIGhyZWY9dGhpcy5ocmVmLnNwbGl0KCcjJyk7XG4gIGhyZWY9aHJlZltocmVmLmxlbmd0aC0xXTtcblxuICBkYXRhPXtcbiAgICBidXR0b25ZZXM6ZmFsc2UsXG4gICAgbm90eWZ5X2NsYXNzOlwibm90aWZ5X3doaXRlIGxvYWRpbmdcIixcbiAgICBxdWVzdGlvbjonJ1xuICB9O1xuICBtb2RhbF9jbGFzcz0kKHRoaXMpLmRhdGEoJ21vZGFsLWNsYXNzJyk7XG5cbiAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xuICAkLmdldCgnLycraHJlZixmdW5jdGlvbihkYXRhKXtcbiAgICAkKCcubm90aWZ5X2JveCcpLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgJCgnLm5vdGlmeV9ib3ggLm5vdGlmeV9jb250ZW50JykuaHRtbChkYXRhLmh0bWwpO1xuICAgIGFqYXhGb3JtKCQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpKTtcbiAgICBpZihtb2RhbF9jbGFzcyl7XG4gICAgICAkKCcubm90aWZ5X2JveCAubm90aWZ5X2NvbnRlbnQgLnJvdycpLmFkZENsYXNzKG1vZGFsX2NsYXNzKTtcbiAgICB9XG4gIH0sJ2pzb24nKVxufSk7XG5cbi8vICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKHtcbi8vICAgZGVsYXk6IHtcbi8vICAgICBzaG93OiA1MDAsIGhpZGU6IDIwMDBcbi8vICAgfVxuLy8gfSk7XG5cbi8vICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS5vbignY2xpY2snLGZ1bmN0aW9uIChlKSB7XG4vLyAgICR0aGlzPSQodGhpcyk7XG4vLyAgIGlmKCR0aGlzLmNsb3Nlc3QoJ3VsJykuaGFzQ2xhc3MoJ3BhZ2luYXRlJykpIHtcbi8vICAgICAvL9C00LvRjyDQv9Cw0LPQuNC90LDRhtC40Lgg0YHRgdGL0LvQutCwINC00L7Qu9C20L3QsCDRgNCw0LHQvtGC0LDRgtGMXG4vLyAgICAgcmV0dXJuIHRydWU7XG4vLyAgIH1cbi8vICAgaWYoJHRoaXMuaGFzQ2xhc3MoJ3dvcmtIcmVmJykpe1xuLy8gICAgIC8v0JXRgdC70Lgg0YHRgdGL0LvQutCwINC/0L7QvNC10YfQtdC90L3QsCDQutCw0Log0YDQsNCx0L7Rh9Cw0Y8g0YLQviDQvdGD0LbQvdC+INC/0LXRgNC10YXQvtC00LjRgtGMXG4vLyAgICAgcmV0dXJuIHRydWU7XG4vLyAgIH1cbi8vICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuLy8gICByZXR1cm4gZmFsc2U7XG4vLyB9KTtcblxuXG4kKCcuYWpheC1hY3Rpb24nKS5jbGljayhmdW5jdGlvbihlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgdmFyIHN0YXR1cyA9ICQodGhpcykuZGF0YSgndmFsdWUnKTtcbiAgdmFyIGhyZWYgPSAkKHRoaXMpLmF0dHIoJ2hyZWYnKTtcbiAgdmFyIGlkcyA9ICQoJyNncmlkLWFqYXgtYWN0aW9uJykueWlpR3JpZFZpZXcoJ2dldFNlbGVjdGVkUm93cycpO1xuICBpZiAoaWRzLmxlbmd0aCA+IDApIHtcbiAgICBpZiAoIWNvbmZpcm0oJ9Cf0L7QtNGC0LLQtdGA0LTQuNGC0LUg0LjQt9C80LXQvdC10L3QuNC1INC30LDQv9C40YHQtdC5JykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiBocmVmLFxuICAgICAgdHlwZTogJ3Bvc3QnLFxuICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgc3RhdHVzOiBzdGF0dXMsXG4gICAgICAgIGlkOiBpZHNcbiAgICAgIH1cbiAgICB9KS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICQoJyNncmlkLWFqYXgtYWN0aW9uJykueWlpR3JpZFZpZXcoXCJhcHBseUZpbHRlclwiKTtcbiAgICAgIGlmIChkYXRhLmVycm9yICE9IGZhbHNlKSB7XG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Cf0YDQvtC40LfQvtGI0LvQsCDQvtGI0LjQsdC60LAhJyx0eXBlOidlcnInfSlcbiAgICAgIH1cbiAgICB9KS5mYWlsKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0J/RgNC+0LjQt9C+0YjQu9CwINC+0YjQuNCx0LrQsCEnLHR5cGU6J2Vycid9KVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Cd0LXQvtCx0YXQvtC00LjQvNC+INCy0YvQsdGA0LDRgtGMINGN0LvQtdC80LXQvdGC0YshJyx0eXBlOidlcnInfSlcbiAgfVxufSk7XG5cbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICQoJy5lZGl0aWJsZVtkaXNhYmxlZF0nKS5vbignY2xpY2snLGZ1bmN0aW9uICgpIHtcbiAgICAkKHRoaXMpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpXG4gIH0pXG5cbiAgJCgnLmVkaXRpYmxlW2Rpc2FibGVkXScpLm9uKCdtb3VzZWRvd24nLGZ1bmN0aW9uICgpIHtcbiAgICAkKHRoaXMpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpXG4gIH0pXG5cbiAgYnRuPSc8YnV0dG9uIGNsYXNzPXVubG9jaz48aSBjbGFzcz1cImZhIGZhLXVubG9jayBmYS00XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPjwvYnV0dG9uPic7XG4gIGJ0bj0kKGJ0bik7XG4gIGJ0bi5vbignY2xpY2snLGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICR0aGlzPSQodGhpcyk7XG4gICAgaW5wPSR0aGlzLnByZXYoKTtcbiAgICBpbnAucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcbiAgJCgnLmVkaXRpYmxlW2Rpc2FibGVkXScpLmFmdGVyKGJ0bilcbn0pO1xuXG4kKGZ1bmN0aW9uKCkge1xuICB2YXIgbWVudSA9IHtcbiAgICBjb250cm9sOiB7XG4gICAgICBoZWFkZXJTdG9yZXNNZW51OiAkKFwiI3RvcFwiKS5maW5kKFwiLnN1Ym1lbnUtaGFuZGxcIiksXG4gICAgICBzdG9yZXNTdWJtZW51czogJChcIiN0b3BcIikuZmluZChcIi5zdWJtZW51LWhhbmRsXCIpLmZpbmQoXCIuc3VibWVudVwiKSxcbiAgICAgIGV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5oZWFkZXJTdG9yZXNNZW51LmhvdmVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBzdWJtZW51ID0gJCh0aGlzKS5maW5kKCcuc3VibWVudScpO1xuICAgICAgICAgIGlmKCQod2luZG93KS53aWR0aCgpID4gOTkxKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoc2VsZi5zdG9yZUhpZGUpO1xuICAgICAgICAgICAgc2VsZi5zdG9yZXNTdWJtZW51cy5jc3MoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcbiAgICAgICAgICAgIHNlbGYuc3RvcmVTaG93ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgc3VibWVudS5jbGVhclF1ZXVlKCk7XG4gICAgICAgICAgICAgIHN1Ym1lbnUuY3NzKFwiZGlzcGxheVwiLCBcImJsb2NrXCIpLmFuaW1hdGUoe1wib3BhY2l0eVwiOiAxfSwgMzUwKTtcbiAgICAgICAgICAgICAgLy8gc2VsZi5zdG9yZXNTdWJtZW51LmNsZWFyUXVldWUoKTtcbiAgICAgICAgICAgICAgLy8gc2VsZi5zdG9yZXNTdWJtZW51LmNzcyhcImRpc3BsYXlcIiwgXCJibG9ja1wiKS5hbmltYXRlKHtcIm9wYWNpdHlcIjogMX0sIDM1MCk7XG4gICAgICAgICAgICB9LCAyMDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIHN1Ym1lbnUgPSAkKHRoaXMpLmZpbmQoJy5zdWJtZW51Jyk7XG4gICAgICAgICAgaWYoJCh3aW5kb3cpLndpZHRoKCkgPiA5OTEpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChzZWxmLnN0b3JlU2hvdyk7XG4gICAgICAgICAgICBzZWxmLnN0b3JlSGlkZSA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHN1Ym1lbnUuY2xlYXJRdWV1ZSgpO1xuICAgICAgICAgICAgICBzdWJtZW51LmFuaW1hdGUoe1wib3BhY2l0eVwiOiAwfSwgMjAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgLy8gc2VsZi5zdG9yZXNTdWJtZW51LmNsZWFyUXVldWUoKTtcbiAgICAgICAgICAgICAgLy8gc2VsZi5zdG9yZXNTdWJtZW51LmFuaW1hdGUoe1wib3BhY2l0eVwiOiAwfSwgMjAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgLy8gICAgICQodGhpcykuY3NzKFwiZGlzcGxheVwiLCBcIm5vbmVcIik7XG4gICAgICAgICAgICAgIC8vIH0pO1xuICAgICAgICAgICAgfSwgMzAwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgbWVudS5jb250cm9sLmV2ZW50cygpO1xufSk7XG5cbi8v0YfRgtC+INCxINC40YTRgNC10LnQvNGLINC4INC60LDRgNGC0LjQvdC60Lgg0L3QtSDQstGL0LvQsNC30LjQu9C4XG4vL2ltZy5qc1xuJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgLyptX3cgPSAkKCcudGV4dC1jb250ZW50Jykud2lkdGgoKVxuICBpZiAobV93IDwgNTApbV93ID0gc2NyZWVuLndpZHRoIC0gNDAqL1xuICB2YXIgbXc9c2NyZWVuLndpZHRoLTQwO1xuXG4gIGZ1bmN0aW9uIG9wdGltYXNlKGVsKXtcbiAgICB2YXIgcGFyZW50ID0gZWwucGFyZW50KCk7XG4gICAgaWYocGFyZW50Lmxlbmd0aD09MCB8fCBwYXJlbnRbMF0udGFnTmFtZT09XCJBXCIpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBtX3cgPSBwYXJlbnQud2lkdGgoKS0zMDtcbiAgICB2YXIgdz1lbC53aWR0aCgpO1xuICAgIGVsLndpZHRoKCdhdXRvJyk7XG4gICAgaWYoZWxbMF0udGFnTmFtZT09XCJJTUdcIiAmJiB3PmVsLndpZHRoKCkpdz1lbC53aWR0aCgpO1xuXG4gICAgaWYgKG13PjUwICYmIG1fdyA+IG13KW1fdyA9IG13O1xuICAgIGlmICh3Pm1fdyA+IG1fdykge1xuICAgICAgaWYoZWxbMF0udGFnTmFtZT09XCJJRlJBTUVcIil7XG4gICAgICAgIGsgPSB3IC8gbV93O1xuICAgICAgICBlbC5oZWlnaHQoZWwuaGVpZ2h0KCkgLyBrKTtcbiAgICAgIH1cbiAgICAgIGVsLndpZHRoKG1fdylcbiAgICB9ZWxzZXtcbiAgICAgIGVsLndpZHRoKHcpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGltZ19sb2FkX2ZpbmlzaCgpe1xuICAgIHZhciBlbD0kKHRoaXMpO1xuICAgIG9wdGltYXNlKGVsKTtcbiAgfVxuXG4gIHZhciBwID0gJCgnLmNvbnRhaW5lciBpbWcsLmNvbnRhaW5lciBpZnJhbWUnKTtcbiAgJCgnLmNvbnRhaW5lciBpbWcnKS5oZWlnaHQoJ2F1dG8nKTtcbiAgLy8kKCcuY29udGFpbmVyIGltZycpLndpZHRoKCdhdXRvJyk7XG4gIGZvciAoaSA9IDA7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XG4gICAgZWwgPSBwLmVxKGkpO1xuICAgIGlmKGVsWzBdLnRhZ05hbWU9PVwiSUZSQU1FXCIpIHtcbiAgICAgIG9wdGltYXNlKGVsKTtcbiAgICB9ZWxzZXtcbiAgICAgIHZhciBzcmM9ZWwuYXR0cignc3JjJyk7XG4gICAgICBpbWFnZSA9ICQoJzxpbWcvPicsIHtcbiAgICAgICAgc3JjOiBzcmNcbiAgICAgIH0pO1xuICAgICAgaW1hZ2Uub24oJ2xvYWQnLCBpbWdfbG9hZF9maW5pc2guYmluZChlbCkpO1xuXG4gICAgfVxuICB9XG59KTtcblxuLy/QtdGB0LvQuCDQvtGC0LrRgNGL0YLQviDQutCw0Log0LTQvtGH0LXRgNC90LXQtVxuLy9wYXJlbnRzX29wZW5fd2luZG93cy5qc1xuKGZ1bmN0aW9uKCl7XG4gIGlmKCF3aW5kb3cub3BlbmVyKXJldHVybjtcbiAgaWYoZG9jdW1lbnQucmVmZXJyZXIuaW5kZXhPZignc2VjcmV0ZGlzY291bnRlcicpPDApcmV0dXJuO1xuXG4gIGhyZWY9d2luZG93Lm9wZW5lci5sb2NhdGlvbi5ocmVmO1xuICBpZihcbiAgICBocmVmLmluZGV4T2YoJ3NvY2lhbHMnKT4wIHx8XG4gICAgaHJlZi5pbmRleE9mKCdsb2dpbicpPjAgfHxcbiAgICBocmVmLmluZGV4T2YoJ2FkbWluJyk+MCB8fFxuICAgIGhyZWYuaW5kZXhPZignYWNjb3VudCcpPjBcbiAgKXtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYoaHJlZi5pbmRleE9mKCdzdG9yZScpPjAgfHwgaHJlZi5pbmRleE9mKCdjb3Vwb24nKT4wIHx8IGhyZWYuaW5kZXhPZignc2V0dGluZ3MnKT4wKXtcbiAgICB3aW5kb3cub3BlbmVyLmxvY2F0aW9uLnJlbG9hZCgpO1xuICB9ZWxzZXtcbiAgICB3aW5kb3cub3BlbmVyLmxvY2F0aW9uLmhyZWY9bG9jYXRpb24uaHJlZjtcbiAgfVxuICB3aW5kb3cuY2xvc2UoKTtcbn0pKCk7XG5cbi8vaW1nLmpzXG4oZnVuY3Rpb24oKSB7XG5cbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCl7XG4gICAgdmFyIGRhdGE9dGhpcztcbiAgICB2YXIgaW1nID0gZGF0YS5pbWc7XG4gICAgaW1nLndyYXAoJzxkaXYgY2xhc3M9XCJkb3dubG9hZFwiPjwvZGl2PicpO1xuICAgIHZhciB3cmFwPWltZy5wYXJlbnQoKTtcbiAgICAkKCdib2R5JykuYXBwZW5kKGRhdGEuZWwpO1xuICAgIHNpemU9ZGF0YS5lbC53aWR0aCgpK1wieFwiK2RhdGEuZWwuaGVpZ2h0KCk7XG4gICAgZGF0YS5lbC5yZW1vdmUoKTtcbiAgICB3cmFwLmFwcGVuZCgnPHNwYW4+JytzaXplKyc8L3NwYW4+IDxhIGhyZWY9XCInK2RhdGEuc3JjKydcIiBkb3dubG9hZD7QodC60LDRh9Cw0YLRjDwvYT4nKVxuICB9XG5cbiAgdmFyIGltZ3MgPSAkKCcuZG93bmxvYWRzX2ltZyBpbWcnKTtcbiAgZm9yKHZhciBpPTA7aTxpbWdzLmxlbmd0aDtpKyspIHtcbiAgICB2YXIgaW1nPWltZ3MuZXEoaSk7XG4gICAgdmFyIHNyYz1pbWcuYXR0cignc3JjJyk7XG4gICAgaW1hZ2UgPSAkKCc8aW1nLz4nLCB7XG4gICAgICBzcmM6IHNyY1xuICAgIH0pO1xuICAgIGRhdGEgPSB7XG4gICAgICBzcmM6IHNyYyxcbiAgICAgIGltZzogaW1nLFxuICAgICAgZWw6aW1hZ2VcbiAgICB9O1xuICAgIGltYWdlLm9uKCdsb2FkJywgaW1nX2xvYWRfZmluaXNoLmJpbmQoZGF0YSkpXG4gIH1cbn0pKCk7Il19
