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
    // temp
    $(document).on("click", "a[href='#reflink']", function() {return false;});

    var urlPrefix = '';

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
                                successCallback();
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

    var settings = {
        control: {
            events: function() {
                ajax.control.sendFormData("#top form[name=user-settings]", "/account/settings/change-settings", "Account Settings Ajax Error", function() {
                    $("#top form[name=user-settings]").attr("name", "valid-data-settings");

                    var settingsSuccess = noty({
                        text: "<b>Поздравляем!</b><br>Информация успешно обновлена.",
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

                    setTimeout(function() {
                        $("#top form[name=valid-data-settings]").submit();
                    }, 1500);
                });

                ajax.control.sendFormData("#top form[name=user-password]", "/account/settings/change-password", "Account Password Ajax Error", function() {
                    var passwordSuccess = noty({
                        text: "<b>Поздравляем!</b><br>Пароль успешно изменён.",
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

                    $("#top form[name=user-password]")[0].reset();
                });

                $('#top input[ref=date]').datepicker({
                    dateFormat: "yyyy-mm-dd"
                });
            }   
        }
    }


    var balance = {
        control: {
            events: function() {
                var confirmBalance = $("#uinfo").attr("data-balance"),
                      status = $("#uinfo").attr("data-status");

                Circles.create({
                    id: 'bronze',
                    radius: 100,
                    value: confirmBalance,
                    maxValue: 500,
                    width: (status == "default" ? 20 : 10),
                    text: function(value) {
                        return value + ' <span class="fa fa-rub"></span>';
                    },
                    colors:  ['#EC8B6C', '#87260C'],
                    duration: 500,
                    wrpClass: 'circles-wrp',
                    textClass:  'circles-text',
                    valueStrokeClass:  'circles-valueStroke',
                    maxValueStrokeClass: 'circles-maxValueStroke',
                    styleWrapper: true,
                    styleText:  true
                });

                Circles.create({
                    id: 'silver',
                    radius: 100,
                    value: confirmBalance,
                    maxValue: 3000,
                    width: (status == "bronze" ? 20 : 10),
                    text: function(value){return value + ' <span class="fa fa-rub"></span>';},
                    colors:  ['#E3E3E3', '#9D9D9B'],
                    duration: 600,
                    wrpClass: 'circles-wrp',
                    textClass:  'circles-text',
                    valueStrokeClass:  'circles-valueStroke',
                    maxValueStrokeClass: 'circles-maxValueStroke',
                    styleWrapper: true,
                    styleText:  true
                });

                Circles.create({
                    id: 'gold',
                    radius: 100,
                    value: confirmBalance,
                    maxValue: 7000,
                    width: (status == "silver" ? 20 : 10),
                    text: function(value){return value + ' <span class="fa fa-rub"></span>';},
                    colors:  ['#FCB84B', '#D58417'],
                    duration: 700,
                    wrpClass: 'circles-wrp',
                    textClass:  'circles-text',
                    valueStrokeClass:  'circles-valueStroke',
                    maxValueStrokeClass: 'circles-maxValueStroke',
                    styleWrapper: true,
                    styleText:  true
                });

                Circles.create({
                    id: 'platinum',
                    radius: 100,
                    value: confirmBalance,
                    maxValue: 10000,
                    width: (status == "gold" ? 20 : 10),
                    text: function(value){return value + ' <span class="fa fa-rub"></span>';},
                    colors:  ['#9D9D9B', '#060606'],
                    duration: 800,
                    wrpClass: 'circles-wrp',
                    textClass:  'circles-text',
                    valueStrokeClass:  'circles-valueStroke',
                    maxValueStrokeClass: 'circles-maxValueStroke',
                    styleWrapper: true,
                    styleText:  true
                });                
            }
        }
    }

    var favorites = {
        control: {
            events: function() {
                $("#top").find(".favorite-link").click(function() {
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

    var header = {
        control: {
            events: function() {
                if($(window).width() > 991) {
                    $("#search").autocomplete({
                        serviceUrl: '/search',
                        noCache: 'true',
                        deferRequestBy: 300,
                        triggerSelectOnValidInput: false,
                        onSelect: function (suggestion) {
                            location.href = '/stores/' + suggestion.data.route;
                        }
                    });
                }

                $(".dobrohead i").animo({animation: "pulse", iterate: "infinite"});
                $(".link-head-stores span").animo({animation: "flash", iterate: "infinite", duration: 2.4});
            }
        }
    }

    var withdraw = {
        control: {
            events: function() {
                $("#top").find(".account-withdraw .option a").click(function() {
                    var self = $(this),
                          option = self.parent().attr("data-option-process"),
                          placeholder = "";
                    $("#top").find(".account-withdraw .option a").removeClass("active");
                    self.addClass("active");

                    $("#top").find("form[name=withdraw-form]").find("input[name=withdraw-process]").val(option);

                    switch(option) {
                        case "1":
                        placeholder = "Введите номер счёта";
                        break;

                        case "2":
                        placeholder = "Введите номер R-кошелька";
                        break;

                        case "3":
                        placeholder = "Введите номер телефона";
                        break;

                        case "4":
                        placeholder = "Введите номер карты";
                        break;

                        case "5":
                        placeholder = "Введите email адрес";
                        break;

                        case "6":
                        placeholder = "Введите номер телефона";
                        break;
                    }

                    $("#top").find("form[name=withdraw-form]").find("input[name=bill]").attr("placeholder", placeholder);

                    return false;
                });

                ajax.control.sendFormData("#top form[name=withdraw-form]", "/account/withdraw", "Withdraw Ajax Error", function() {
                    var withdrawSuccess = noty({
                        text: "<b>Поздравляем!</b><br>Запрос на вывод денег был успешно выполнен.",
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

                    $("#top form[name=withdraw-form]")[0].reset();
                });
            }
        }
    }

    var charity = {
        control: {
            events: function() {
                $("#top").find(".account-fund-transfer .option a").click(function() {
                    var self = $(this),
                          option = self.parent().attr("data-option-process"),
                          placeholder = "";

                    var titleFund = self.prev(".title").text();
                    $(".to-fund span").text(titleFund);

                    $("#top").find(".account-fund-transfer .option a").removeClass("active");
                    self.addClass("active");

                    $("#top").find("form[name=fund-transfer-form]").find("input[name=charity-process]").val(option);

                    $("#top").find(".account-fund-transfer .autopayment-info").css("display", "block");
                    $("#top").find("form[name=autopayment-form]").find("input[name=autopayment-uid]").val(option);

                    return false;
                });

                ajax.control.sendFormData("#top form[name=fund-transfer-form]", "/account/dobro/send", "Fund Transfer Ajax Error", function() {
                    var withdrawSuccess = noty({
                        text: "<b>Поздравляем!</b><br>Денежные средства успешно переведены. Спасибо за Вашу помощь. Историю Ваших добрых дел вы можете посмотреть в <a href='/account/charity'>личном кабинете</a>.",
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

                    $("#top form[name=fund-transfer-form]")[0].reset();
                });

                ajax.control.sendFormData("#top form[name=autopayment-form]", "/account/dobro/auto-send", "Auto Payment Ajax Error", function() {
                    var withdrawSuccess = noty({
                        text: "<b>Поздравляем!</b><br>Автоплатёж был успешно установлен.",
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

                ajax.control.sendFormData("#top form[name=delete-autopayment-form]", "/account/dobro/auto-delete", "Delete Auto Payment Ajax Error", function() {
                    var withdrawSuccess = noty({
                        text: "<b>Поздравляем!</b><br>Автоплатёж был успешно удалён.",
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

                    $("#top").find(".self-autopayment").parent().remove();
                });
            }
        }
    }

    var support = {
        control: {
            events: function() {
                ajax.control.sendFormData("#top form[name=support-form]", "/account/support", "Support Ajax Error", function() {
                    var supportSuccess = noty({
                        text: "<b>Поздравляем!</b><br>Запрос в службу поддержки был успешно отправлен.",
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

                    $("#top form[name=support-form]")[0].reset();
                });
            }
        }
    }

    support.control.events();
    withdraw.control.events();
    charity.control.events();
    settings.control.events();
    balance.control.events();
    favorites.control.events();
    header.control.events();
});

$(function(){
    $("input.link").click(function(){	// получение фокуса текстовым полем-ссылкой
        $(this).select();
    });
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpxdWVyeS5tZW51LWFpbS5qcyIsImNpcmNsZXMubWluLmpzIiwiZGF0ZXBpY2tlci5qcyIsImpxdWVyeS5ub3R5LnBhY2thZ2VkLm1pbi5qcyIsIm1haW4uanMiLCJhbmltby5qcyIsImpxdWVyeS5tb2NramF4LmpzIiwianF1ZXJ5LmF1dG9jb21wbGV0ZS5qcyIsIm5vdGlmaWNhdGlvbi5qcyIsImZvcl9hbGwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDblVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbm9EQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4bEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBSDE5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FJamlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogbWVudS1haW0gaXMgYSBqUXVlcnkgcGx1Z2luIGZvciBkcm9wZG93biBtZW51cyB0aGF0IGNhbiBkaWZmZXJlbnRpYXRlXG4gKiBiZXR3ZWVuIGEgdXNlciB0cnlpbmcgaG92ZXIgb3ZlciBhIGRyb3Bkb3duIGl0ZW0gdnMgdHJ5aW5nIHRvIG5hdmlnYXRlIGludG9cbiAqIGEgc3VibWVudSdzIGNvbnRlbnRzLlxuICpcbiAqIG1lbnUtYWltIGFzc3VtZXMgdGhhdCB5b3UgaGF2ZSBhcmUgdXNpbmcgYSBtZW51IHdpdGggc3VibWVudXMgdGhhdCBleHBhbmRcbiAqIHRvIHRoZSBtZW51J3MgcmlnaHQuIEl0IHdpbGwgZmlyZSBldmVudHMgd2hlbiB0aGUgdXNlcidzIG1vdXNlIGVudGVycyBhIG5ld1xuICogZHJvcGRvd24gaXRlbSAqYW5kKiB3aGVuIHRoYXQgaXRlbSBpcyBiZWluZyBpbnRlbnRpb25hbGx5IGhvdmVyZWQgb3Zlci5cbiAqXG4gKiBfX19fX19fX19fX19fX19fX19fX19fX19fX1xuICogfCBNb25rZXlzICA+fCAgIEdvcmlsbGEgIHxcbiAqIHwgR29yaWxsYXMgPnwgICBDb250ZW50ICB8XG4gKiB8IENoaW1wcyAgID58ICAgSGVyZSAgICAgfFxuICogfF9fX19fX19fX19ffF9fX19fX19fX19fX3xcbiAqXG4gKiBJbiB0aGUgYWJvdmUgZXhhbXBsZSwgXCJHb3JpbGxhc1wiIGlzIHNlbGVjdGVkIGFuZCBpdHMgc3VibWVudSBjb250ZW50IGlzXG4gKiBiZWluZyBzaG93biBvbiB0aGUgcmlnaHQuIEltYWdpbmUgdGhhdCB0aGUgdXNlcidzIGN1cnNvciBpcyBob3ZlcmluZyBvdmVyXG4gKiBcIkdvcmlsbGFzLlwiIFdoZW4gdGhleSBtb3ZlIHRoZWlyIG1vdXNlIGludG8gdGhlIFwiR29yaWxsYSBDb250ZW50XCIgYXJlYSwgdGhleVxuICogbWF5IGJyaWVmbHkgaG92ZXIgb3ZlciBcIkNoaW1wcy5cIiBUaGlzIHNob3VsZG4ndCBjbG9zZSB0aGUgXCJHb3JpbGxhIENvbnRlbnRcIlxuICogYXJlYS5cbiAqXG4gKiBUaGlzIHByb2JsZW0gaXMgbm9ybWFsbHkgc29sdmVkIHVzaW5nIHRpbWVvdXRzIGFuZCBkZWxheXMuIG1lbnUtYWltIHRyaWVzIHRvXG4gKiBzb2x2ZSB0aGlzIGJ5IGRldGVjdGluZyB0aGUgZGlyZWN0aW9uIG9mIHRoZSB1c2VyJ3MgbW91c2UgbW92ZW1lbnQuIFRoaXMgY2FuXG4gKiBtYWtlIGZvciBxdWlja2VyIHRyYW5zaXRpb25zIHdoZW4gbmF2aWdhdGluZyB1cCBhbmQgZG93biB0aGUgbWVudS4gVGhlXG4gKiBleHBlcmllbmNlIGlzIGhvcGVmdWxseSBzaW1pbGFyIHRvIGFtYXpvbi5jb20vJ3MgXCJTaG9wIGJ5IERlcGFydG1lbnRcIlxuICogZHJvcGRvd24uXG4gKlxuICogVXNlIGxpa2Ugc286XG4gKlxuICogICAgICAkKFwiI21lbnVcIikubWVudUFpbSh7XG4gKiAgICAgICAgICBhY3RpdmF0ZTogJC5ub29wLCAgLy8gZmlyZWQgb24gcm93IGFjdGl2YXRpb25cbiAqICAgICAgICAgIGRlYWN0aXZhdGU6ICQubm9vcCAgLy8gZmlyZWQgb24gcm93IGRlYWN0aXZhdGlvblxuICogICAgICB9KTtcbiAqXG4gKiAgLi4udG8gcmVjZWl2ZSBldmVudHMgd2hlbiBhIG1lbnUncyByb3cgaGFzIGJlZW4gcHVycG9zZWZ1bGx5IChkZSlhY3RpdmF0ZWQuXG4gKlxuICogVGhlIGZvbGxvd2luZyBvcHRpb25zIGNhbiBiZSBwYXNzZWQgdG8gbWVudUFpbS4gQWxsIGZ1bmN0aW9ucyBleGVjdXRlIHdpdGhcbiAqIHRoZSByZWxldmFudCByb3cncyBIVE1MIGVsZW1lbnQgYXMgdGhlIGV4ZWN1dGlvbiBjb250ZXh0ICgndGhpcycpOlxuICpcbiAqICAgICAgLm1lbnVBaW0oe1xuICogICAgICAgICAgLy8gRnVuY3Rpb24gdG8gY2FsbCB3aGVuIGEgcm93IGlzIHB1cnBvc2VmdWxseSBhY3RpdmF0ZWQuIFVzZSB0aGlzXG4gKiAgICAgICAgICAvLyB0byBzaG93IGEgc3VibWVudSdzIGNvbnRlbnQgZm9yIHRoZSBhY3RpdmF0ZWQgcm93LlxuICogICAgICAgICAgYWN0aXZhdGU6IGZ1bmN0aW9uKCkge30sXG4gKlxuICogICAgICAgICAgLy8gRnVuY3Rpb24gdG8gY2FsbCB3aGVuIGEgcm93IGlzIGRlYWN0aXZhdGVkLlxuICogICAgICAgICAgZGVhY3RpdmF0ZTogZnVuY3Rpb24oKSB7fSxcbiAqXG4gKiAgICAgICAgICAvLyBGdW5jdGlvbiB0byBjYWxsIHdoZW4gbW91c2UgZW50ZXJzIGEgbWVudSByb3cuIEVudGVyaW5nIGEgcm93XG4gKiAgICAgICAgICAvLyBkb2VzIG5vdCBtZWFuIHRoZSByb3cgaGFzIGJlZW4gYWN0aXZhdGVkLCBhcyB0aGUgdXNlciBtYXkgYmVcbiAqICAgICAgICAgIC8vIG1vdXNpbmcgb3ZlciB0byBhIHN1Ym1lbnUuXG4gKiAgICAgICAgICBlbnRlcjogZnVuY3Rpb24oKSB7fSxcbiAqXG4gKiAgICAgICAgICAvLyBGdW5jdGlvbiB0byBjYWxsIHdoZW4gbW91c2UgZXhpdHMgYSBtZW51IHJvdy5cbiAqICAgICAgICAgIGV4aXQ6IGZ1bmN0aW9uKCkge30sXG4gKlxuICogICAgICAgICAgLy8gU2VsZWN0b3IgZm9yIGlkZW50aWZ5aW5nIHdoaWNoIGVsZW1lbnRzIGluIHRoZSBtZW51IGFyZSByb3dzXG4gKiAgICAgICAgICAvLyB0aGF0IGNhbiB0cmlnZ2VyIHRoZSBhYm92ZSBldmVudHMuIERlZmF1bHRzIHRvIFwiPiBsaVwiLlxuICogICAgICAgICAgcm93U2VsZWN0b3I6IFwiPiBsaVwiLFxuICpcbiAqICAgICAgICAgIC8vIFlvdSBtYXkgaGF2ZSBzb21lIG1lbnUgcm93cyB0aGF0IGFyZW4ndCBzdWJtZW51cyBhbmQgdGhlcmVmb3JlXG4gKiAgICAgICAgICAvLyBzaG91bGRuJ3QgZXZlciBuZWVkIHRvIFwiYWN0aXZhdGUuXCIgSWYgc28sIGZpbHRlciBzdWJtZW51IHJvd3Mgdy9cbiAqICAgICAgICAgIC8vIHRoaXMgc2VsZWN0b3IuIERlZmF1bHRzIHRvIFwiKlwiIChhbGwgZWxlbWVudHMpLlxuICogICAgICAgICAgc3VibWVudVNlbGVjdG9yOiBcIipcIixcbiAqXG4gKiAgICAgICAgICAvLyBEaXJlY3Rpb24gdGhlIHN1Ym1lbnUgb3BlbnMgcmVsYXRpdmUgdG8gdGhlIG1haW4gbWVudS4gQ2FuIGJlXG4gKiAgICAgICAgICAvLyBsZWZ0LCByaWdodCwgYWJvdmUsIG9yIGJlbG93LiBEZWZhdWx0cyB0byBcInJpZ2h0XCIuXG4gKiAgICAgICAgICBzdWJtZW51RGlyZWN0aW9uOiBcInJpZ2h0XCJcbiAqICAgICAgfSk7XG4gKlxuICogaHR0cHM6Ly9naXRodWIuY29tL2thbWVucy9qUXVlcnktbWVudS1haW1cbiovXG4oZnVuY3Rpb24oJCkge1xuXG4gICAgJC5mbi5tZW51QWltID0gZnVuY3Rpb24ob3B0cykge1xuICAgICAgICAvLyBJbml0aWFsaXplIG1lbnUtYWltIGZvciBhbGwgZWxlbWVudHMgaW4galF1ZXJ5IGNvbGxlY3Rpb25cbiAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaW5pdC5jYWxsKHRoaXMsIG9wdHMpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gaW5pdChvcHRzKSB7XG4gICAgICAgIHZhciAkbWVudSA9ICQodGhpcyksXG4gICAgICAgICAgICBhY3RpdmVSb3cgPSBudWxsLFxuICAgICAgICAgICAgbW91c2VMb2NzID0gW10sXG4gICAgICAgICAgICBsYXN0RGVsYXlMb2MgPSBudWxsLFxuICAgICAgICAgICAgdGltZW91dElkID0gbnVsbCxcbiAgICAgICAgICAgIG9wdGlvbnMgPSAkLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgcm93U2VsZWN0b3I6IFwiPiBsaVwiLFxuICAgICAgICAgICAgICAgIHN1Ym1lbnVTZWxlY3RvcjogXCIqXCIsXG4gICAgICAgICAgICAgICAgc3VibWVudURpcmVjdGlvbjogXCJyaWdodFwiLFxuICAgICAgICAgICAgICAgIHRvbGVyYW5jZTogNzUsICAvLyBiaWdnZXIgPSBtb3JlIGZvcmdpdmV5IHdoZW4gZW50ZXJpbmcgc3VibWVudVxuICAgICAgICAgICAgICAgIGVudGVyOiAkLm5vb3AsXG4gICAgICAgICAgICAgICAgZXhpdDogJC5ub29wLFxuICAgICAgICAgICAgICAgIGFjdGl2YXRlOiAkLm5vb3AsXG4gICAgICAgICAgICAgICAgZGVhY3RpdmF0ZTogJC5ub29wLFxuICAgICAgICAgICAgICAgIGV4aXRNZW51OiAkLm5vb3BcbiAgICAgICAgICAgIH0sIG9wdHMpO1xuXG4gICAgICAgIHZhciBNT1VTRV9MT0NTX1RSQUNLRUQgPSAzLCAgLy8gbnVtYmVyIG9mIHBhc3QgbW91c2UgbG9jYXRpb25zIHRvIHRyYWNrXG4gICAgICAgICAgICBERUxBWSA9IDMwMDsgIC8vIG1zIGRlbGF5IHdoZW4gdXNlciBhcHBlYXJzIHRvIGJlIGVudGVyaW5nIHN1Ym1lbnVcblxuICAgICAgICAvKipcbiAgICAgICAgICogS2VlcCB0cmFjayBvZiB0aGUgbGFzdCBmZXcgbG9jYXRpb25zIG9mIHRoZSBtb3VzZS5cbiAgICAgICAgICovXG4gICAgICAgIHZhciBtb3VzZW1vdmVEb2N1bWVudCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBtb3VzZUxvY3MucHVzaCh7eDogZS5wYWdlWCwgeTogZS5wYWdlWX0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKG1vdXNlTG9jcy5sZW5ndGggPiBNT1VTRV9MT0NTX1RSQUNLRUQpIHtcbiAgICAgICAgICAgICAgICAgICAgbW91c2VMb2NzLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2FuY2VsIHBvc3NpYmxlIHJvdyBhY3RpdmF0aW9ucyB3aGVuIGxlYXZpbmcgdGhlIG1lbnUgZW50aXJlbHlcbiAgICAgICAgICovXG4gICAgICAgIHZhciBtb3VzZWxlYXZlTWVudSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aW1lb3V0SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gSWYgZXhpdE1lbnUgaXMgc3VwcGxpZWQgYW5kIHJldHVybnMgdHJ1ZSwgZGVhY3RpdmF0ZSB0aGVcbiAgICAgICAgICAgICAgICAvLyBjdXJyZW50bHkgYWN0aXZlIHJvdyBvbiBtZW51IGV4aXQuXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZXhpdE1lbnUodGhpcykpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFjdGl2ZVJvdykge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5kZWFjdGl2YXRlKGFjdGl2ZVJvdyk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBhY3RpdmVSb3cgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyaWdnZXIgYSBwb3NzaWJsZSByb3cgYWN0aXZhdGlvbiB3aGVuZXZlciBlbnRlcmluZyBhIG5ldyByb3cuXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgbW91c2VlbnRlclJvdyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aW1lb3V0SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ2FuY2VsIGFueSBwcmV2aW91cyBhY3RpdmF0aW9uIGRlbGF5c1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBvcHRpb25zLmVudGVyKHRoaXMpO1xuICAgICAgICAgICAgICAgIHBvc3NpYmx5QWN0aXZhdGUodGhpcyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbW91c2VsZWF2ZVJvdyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuZXhpdCh0aGlzKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgLypcbiAgICAgICAgICogSW1tZWRpYXRlbHkgYWN0aXZhdGUgYSByb3cgaWYgdGhlIHVzZXIgY2xpY2tzIG9uIGl0LlxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGNsaWNrUm93ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgYWN0aXZhdGUodGhpcyk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBY3RpdmF0ZSBhIG1lbnUgcm93LlxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGFjdGl2YXRlID0gZnVuY3Rpb24ocm93KSB7XG4gICAgICAgICAgICAgICAgaWYgKHJvdyA9PSBhY3RpdmVSb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChhY3RpdmVSb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5kZWFjdGl2YXRlKGFjdGl2ZVJvdyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5hY3RpdmF0ZShyb3cpO1xuICAgICAgICAgICAgICAgIGFjdGl2ZVJvdyA9IHJvdztcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBvc3NpYmx5IGFjdGl2YXRlIGEgbWVudSByb3cuIElmIG1vdXNlIG1vdmVtZW50IGluZGljYXRlcyB0aGF0IHdlXG4gICAgICAgICAqIHNob3VsZG4ndCBhY3RpdmF0ZSB5ZXQgYmVjYXVzZSB1c2VyIG1heSBiZSB0cnlpbmcgdG8gZW50ZXJcbiAgICAgICAgICogYSBzdWJtZW51J3MgY29udGVudCwgdGhlbiBkZWxheSBhbmQgY2hlY2sgYWdhaW4gbGF0ZXIuXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcG9zc2libHlBY3RpdmF0ZSA9IGZ1bmN0aW9uKHJvdykge1xuICAgICAgICAgICAgICAgIHZhciBkZWxheSA9IGFjdGl2YXRpb25EZWxheSgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGRlbGF5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NzaWJseUFjdGl2YXRlKHJvdyk7XG4gICAgICAgICAgICAgICAgICAgIH0sIGRlbGF5KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhY3RpdmF0ZShyb3cpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybiB0aGUgYW1vdW50IG9mIHRpbWUgdGhhdCBzaG91bGQgYmUgdXNlZCBhcyBhIGRlbGF5IGJlZm9yZSB0aGVcbiAgICAgICAgICogY3VycmVudGx5IGhvdmVyZWQgcm93IGlzIGFjdGl2YXRlZC5cbiAgICAgICAgICpcbiAgICAgICAgICogUmV0dXJucyAwIGlmIHRoZSBhY3RpdmF0aW9uIHNob3VsZCBoYXBwZW4gaW1tZWRpYXRlbHkuIE90aGVyd2lzZSxcbiAgICAgICAgICogcmV0dXJucyB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0aGF0IHNob3VsZCBiZSBkZWxheWVkIGJlZm9yZVxuICAgICAgICAgKiBjaGVja2luZyBhZ2FpbiB0byBzZWUgaWYgdGhlIHJvdyBzaG91bGQgYmUgYWN0aXZhdGVkLlxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGFjdGl2YXRpb25EZWxheSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICghYWN0aXZlUm93IHx8ICEkKGFjdGl2ZVJvdykuaXMob3B0aW9ucy5zdWJtZW51U2VsZWN0b3IpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlIGlzIG5vIG90aGVyIHN1Ym1lbnUgcm93IGFscmVhZHkgYWN0aXZlLCB0aGVuXG4gICAgICAgICAgICAgICAgICAgIC8vIGdvIGFoZWFkIGFuZCBhY3RpdmF0ZSBpbW1lZGlhdGVseS5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9ICRtZW51Lm9mZnNldCgpLFxuICAgICAgICAgICAgICAgICAgICB1cHBlckxlZnQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBvZmZzZXQubGVmdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IG9mZnNldC50b3AgLSBvcHRpb25zLnRvbGVyYW5jZVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB1cHBlclJpZ2h0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgeDogb2Zmc2V0LmxlZnQgKyAkbWVudS5vdXRlcldpZHRoKCksXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiB1cHBlckxlZnQueVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBsb3dlckxlZnQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBvZmZzZXQubGVmdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IG9mZnNldC50b3AgKyAkbWVudS5vdXRlckhlaWdodCgpICsgb3B0aW9ucy50b2xlcmFuY2VcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgbG93ZXJSaWdodCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IG9mZnNldC5sZWZ0ICsgJG1lbnUub3V0ZXJXaWR0aCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogbG93ZXJMZWZ0LnlcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgbG9jID0gbW91c2VMb2NzW21vdXNlTG9jcy5sZW5ndGggLSAxXSxcbiAgICAgICAgICAgICAgICAgICAgcHJldkxvYyA9IG1vdXNlTG9jc1swXTtcblxuICAgICAgICAgICAgICAgIGlmICghbG9jKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghcHJldkxvYykge1xuICAgICAgICAgICAgICAgICAgICBwcmV2TG9jID0gbG9jO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChwcmV2TG9jLnggPCBvZmZzZXQubGVmdCB8fCBwcmV2TG9jLnggPiBsb3dlclJpZ2h0LnggfHxcbiAgICAgICAgICAgICAgICAgICAgcHJldkxvYy55IDwgb2Zmc2V0LnRvcCB8fCBwcmV2TG9jLnkgPiBsb3dlclJpZ2h0LnkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIHByZXZpb3VzIG1vdXNlIGxvY2F0aW9uIHdhcyBvdXRzaWRlIG9mIHRoZSBlbnRpcmVcbiAgICAgICAgICAgICAgICAgICAgLy8gbWVudSdzIGJvdW5kcywgaW1tZWRpYXRlbHkgYWN0aXZhdGUuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChsYXN0RGVsYXlMb2MgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYy54ID09IGxhc3REZWxheUxvYy54ICYmIGxvYy55ID09IGxhc3REZWxheUxvYy55KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSBtb3VzZSBoYXNuJ3QgbW92ZWQgc2luY2UgdGhlIGxhc3QgdGltZSB3ZSBjaGVja2VkXG4gICAgICAgICAgICAgICAgICAgIC8vIGZvciBhY3RpdmF0aW9uIHN0YXR1cywgaW1tZWRpYXRlbHkgYWN0aXZhdGUuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIERldGVjdCBpZiB0aGUgdXNlciBpcyBtb3ZpbmcgdG93YXJkcyB0aGUgY3VycmVudGx5IGFjdGl2YXRlZFxuICAgICAgICAgICAgICAgIC8vIHN1Ym1lbnUuXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgbW91c2UgaXMgaGVhZGluZyByZWxhdGl2ZWx5IGNsZWFybHkgdG93YXJkc1xuICAgICAgICAgICAgICAgIC8vIHRoZSBzdWJtZW51J3MgY29udGVudCwgd2Ugc2hvdWxkIHdhaXQgYW5kIGdpdmUgdGhlIHVzZXIgbW9yZVxuICAgICAgICAgICAgICAgIC8vIHRpbWUgYmVmb3JlIGFjdGl2YXRpbmcgYSBuZXcgcm93LiBJZiB0aGUgbW91c2UgaXMgaGVhZGluZ1xuICAgICAgICAgICAgICAgIC8vIGVsc2V3aGVyZSwgd2UgY2FuIGltbWVkaWF0ZWx5IGFjdGl2YXRlIGEgbmV3IHJvdy5cbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIC8vIFdlIGRldGVjdCB0aGlzIGJ5IGNhbGN1bGF0aW5nIHRoZSBzbG9wZSBmb3JtZWQgYmV0d2VlbiB0aGVcbiAgICAgICAgICAgICAgICAvLyBjdXJyZW50IG1vdXNlIGxvY2F0aW9uIGFuZCB0aGUgdXBwZXIvbG93ZXIgcmlnaHQgcG9pbnRzIG9mXG4gICAgICAgICAgICAgICAgLy8gdGhlIG1lbnUuIFdlIGRvIHRoZSBzYW1lIGZvciB0aGUgcHJldmlvdXMgbW91c2UgbG9jYXRpb24uXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIGN1cnJlbnQgbW91c2UgbG9jYXRpb24ncyBzbG9wZXMgYXJlXG4gICAgICAgICAgICAgICAgLy8gaW5jcmVhc2luZy9kZWNyZWFzaW5nIGFwcHJvcHJpYXRlbHkgY29tcGFyZWQgdG8gdGhlXG4gICAgICAgICAgICAgICAgLy8gcHJldmlvdXMncywgd2Uga25vdyB0aGUgdXNlciBpcyBtb3ZpbmcgdG93YXJkIHRoZSBzdWJtZW51LlxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgLy8gTm90ZSB0aGF0IHNpbmNlIHRoZSB5LWF4aXMgaW5jcmVhc2VzIGFzIHRoZSBjdXJzb3IgbW92ZXNcbiAgICAgICAgICAgICAgICAvLyBkb3duIHRoZSBzY3JlZW4sIHdlIGFyZSBsb29raW5nIGZvciB0aGUgc2xvcGUgYmV0d2VlbiB0aGVcbiAgICAgICAgICAgICAgICAvLyBjdXJzb3IgYW5kIHRoZSB1cHBlciByaWdodCBjb3JuZXIgdG8gZGVjcmVhc2Ugb3ZlciB0aW1lLCBub3RcbiAgICAgICAgICAgICAgICAvLyBpbmNyZWFzZSAoc29tZXdoYXQgY291bnRlcmludHVpdGl2ZWx5KS5cbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzbG9wZShhLCBiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoYi55IC0gYS55KSAvIChiLnggLSBhLngpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB2YXIgZGVjcmVhc2luZ0Nvcm5lciA9IHVwcGVyUmlnaHQsXG4gICAgICAgICAgICAgICAgICAgIGluY3JlYXNpbmdDb3JuZXIgPSBsb3dlclJpZ2h0O1xuXG4gICAgICAgICAgICAgICAgLy8gT3VyIGV4cGVjdGF0aW9ucyBmb3IgZGVjcmVhc2luZyBvciBpbmNyZWFzaW5nIHNsb3BlIHZhbHVlc1xuICAgICAgICAgICAgICAgIC8vIGRlcGVuZHMgb24gd2hpY2ggZGlyZWN0aW9uIHRoZSBzdWJtZW51IG9wZW5zIHJlbGF0aXZlIHRvIHRoZVxuICAgICAgICAgICAgICAgIC8vIG1haW4gbWVudS4gQnkgZGVmYXVsdCwgaWYgdGhlIG1lbnUgb3BlbnMgb24gdGhlIHJpZ2h0LCB3ZVxuICAgICAgICAgICAgICAgIC8vIGV4cGVjdCB0aGUgc2xvcGUgYmV0d2VlbiB0aGUgY3Vyc29yIGFuZCB0aGUgdXBwZXIgcmlnaHRcbiAgICAgICAgICAgICAgICAvLyBjb3JuZXIgdG8gZGVjcmVhc2Ugb3ZlciB0aW1lLCBhcyBleHBsYWluZWQgYWJvdmUuIElmIHRoZVxuICAgICAgICAgICAgICAgIC8vIHN1Ym1lbnUgb3BlbnMgaW4gYSBkaWZmZXJlbnQgZGlyZWN0aW9uLCB3ZSBjaGFuZ2Ugb3VyIHNsb3BlXG4gICAgICAgICAgICAgICAgLy8gZXhwZWN0YXRpb25zLlxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnN1Ym1lbnVEaXJlY3Rpb24gPT0gXCJsZWZ0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVjcmVhc2luZ0Nvcm5lciA9IGxvd2VyTGVmdDtcbiAgICAgICAgICAgICAgICAgICAgaW5jcmVhc2luZ0Nvcm5lciA9IHVwcGVyTGVmdDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuc3VibWVudURpcmVjdGlvbiA9PSBcImJlbG93XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVjcmVhc2luZ0Nvcm5lciA9IGxvd2VyUmlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIGluY3JlYXNpbmdDb3JuZXIgPSBsb3dlckxlZnQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLnN1Ym1lbnVEaXJlY3Rpb24gPT0gXCJhYm92ZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlY3JlYXNpbmdDb3JuZXIgPSB1cHBlckxlZnQ7XG4gICAgICAgICAgICAgICAgICAgIGluY3JlYXNpbmdDb3JuZXIgPSB1cHBlclJpZ2h0O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBkZWNyZWFzaW5nU2xvcGUgPSBzbG9wZShsb2MsIGRlY3JlYXNpbmdDb3JuZXIpLFxuICAgICAgICAgICAgICAgICAgICBpbmNyZWFzaW5nU2xvcGUgPSBzbG9wZShsb2MsIGluY3JlYXNpbmdDb3JuZXIpLFxuICAgICAgICAgICAgICAgICAgICBwcmV2RGVjcmVhc2luZ1Nsb3BlID0gc2xvcGUocHJldkxvYywgZGVjcmVhc2luZ0Nvcm5lciksXG4gICAgICAgICAgICAgICAgICAgIHByZXZJbmNyZWFzaW5nU2xvcGUgPSBzbG9wZShwcmV2TG9jLCBpbmNyZWFzaW5nQ29ybmVyKTtcblxuICAgICAgICAgICAgICAgIGlmIChkZWNyZWFzaW5nU2xvcGUgPCBwcmV2RGVjcmVhc2luZ1Nsb3BlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNyZWFzaW5nU2xvcGUgPiBwcmV2SW5jcmVhc2luZ1Nsb3BlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE1vdXNlIGlzIG1vdmluZyBmcm9tIHByZXZpb3VzIGxvY2F0aW9uIHRvd2FyZHMgdGhlXG4gICAgICAgICAgICAgICAgICAgIC8vIGN1cnJlbnRseSBhY3RpdmF0ZWQgc3VibWVudS4gRGVsYXkgYmVmb3JlIGFjdGl2YXRpbmcgYVxuICAgICAgICAgICAgICAgICAgICAvLyBuZXcgbWVudSByb3csIGJlY2F1c2UgdXNlciBtYXkgYmUgbW92aW5nIGludG8gc3VibWVudS5cbiAgICAgICAgICAgICAgICAgICAgbGFzdERlbGF5TG9jID0gbG9jO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gREVMQVk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGFzdERlbGF5TG9jID0gbnVsbDtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEhvb2sgdXAgaW5pdGlhbCBtZW51IGV2ZW50c1xuICAgICAgICAgKi9cbiAgICAgICAgJG1lbnVcbiAgICAgICAgICAgIC5tb3VzZWxlYXZlKG1vdXNlbGVhdmVNZW51KVxuICAgICAgICAgICAgLmZpbmQob3B0aW9ucy5yb3dTZWxlY3RvcilcbiAgICAgICAgICAgICAgICAubW91c2VlbnRlcihtb3VzZWVudGVyUm93KVxuICAgICAgICAgICAgICAgIC5tb3VzZWxlYXZlKG1vdXNlbGVhdmVSb3cpXG4gICAgICAgICAgICAgICAgLmNsaWNrKGNsaWNrUm93KTtcblxuICAgICAgICAkKGRvY3VtZW50KS5tb3VzZW1vdmUobW91c2Vtb3ZlRG9jdW1lbnQpO1xuXG4gICAgfTtcbn0pKGpRdWVyeSk7XG5cbiIsIi8qKlxuICogY2lyY2xlcyAtIHYwLjAuNiAtIDIwMTUtMTEtMjdcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUgbHVnb2xhYnNcbiAqIExpY2Vuc2VkIFxuICovXG4hZnVuY3Rpb24oYSxiKXtcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1iKCk6XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXSxiKTphLkNpcmNsZXM9YigpfSh0aGlzLGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7dmFyIGE9d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93Lm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZXx8ZnVuY3Rpb24oYSl7c2V0VGltZW91dChhLDFlMy82MCl9LGI9ZnVuY3Rpb24oYSl7dmFyIGI9YS5pZDtpZih0aGlzLl9lbD1kb2N1bWVudC5nZXRFbGVtZW50QnlJZChiKSxudWxsIT09dGhpcy5fZWwpe3RoaXMuX3JhZGl1cz1hLnJhZGl1c3x8MTAsdGhpcy5fZHVyYXRpb249dm9pZCAwPT09YS5kdXJhdGlvbj81MDA6YS5kdXJhdGlvbix0aGlzLl92YWx1ZT0wLHRoaXMuX21heFZhbHVlPWEubWF4VmFsdWV8fDEwMCx0aGlzLl90ZXh0PXZvaWQgMD09PWEudGV4dD9mdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5odG1saWZ5TnVtYmVyKGEpfTphLnRleHQsdGhpcy5fc3Ryb2tlV2lkdGg9YS53aWR0aHx8MTAsdGhpcy5fY29sb3JzPWEuY29sb3JzfHxbXCIjRUVFXCIsXCIjRjAwXCJdLHRoaXMuX3N2Zz1udWxsLHRoaXMuX21vdmluZ1BhdGg9bnVsbCx0aGlzLl93cmFwQ29udGFpbmVyPW51bGwsdGhpcy5fdGV4dENvbnRhaW5lcj1udWxsLHRoaXMuX3dycENsYXNzPWEud3JwQ2xhc3N8fFwiY2lyY2xlcy13cnBcIix0aGlzLl90ZXh0Q2xhc3M9YS50ZXh0Q2xhc3N8fFwiY2lyY2xlcy10ZXh0XCIsdGhpcy5fdmFsQ2xhc3M9YS52YWx1ZVN0cm9rZUNsYXNzfHxcImNpcmNsZXMtdmFsdWVTdHJva2VcIix0aGlzLl9tYXhWYWxDbGFzcz1hLm1heFZhbHVlU3Ryb2tlQ2xhc3N8fFwiY2lyY2xlcy1tYXhWYWx1ZVN0cm9rZVwiLHRoaXMuX3N0eWxlV3JhcHBlcj1hLnN0eWxlV3JhcHBlcj09PSExPyExOiEwLHRoaXMuX3N0eWxlVGV4dD1hLnN0eWxlVGV4dD09PSExPyExOiEwO3ZhciBjPU1hdGguUEkvMTgwKjI3MDt0aGlzLl9zdGFydD0tTWF0aC5QSS8xODAqOTAsdGhpcy5fc3RhcnRQcmVjaXNlPXRoaXMuX3ByZWNpc2UodGhpcy5fc3RhcnQpLHRoaXMuX2NpcmM9Yy10aGlzLl9zdGFydCx0aGlzLl9nZW5lcmF0ZSgpLnVwZGF0ZShhLnZhbHVlfHwwKX19O3JldHVybiBiLnByb3RvdHlwZT17VkVSU0lPTjpcIjAuMC42XCIsX2dlbmVyYXRlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3N2Z1NpemU9Mip0aGlzLl9yYWRpdXMsdGhpcy5fcmFkaXVzQWRqdXN0ZWQ9dGhpcy5fcmFkaXVzLXRoaXMuX3N0cm9rZVdpZHRoLzIsdGhpcy5fZ2VuZXJhdGVTdmcoKS5fZ2VuZXJhdGVUZXh0KCkuX2dlbmVyYXRlV3JhcHBlcigpLHRoaXMuX2VsLmlubmVySFRNTD1cIlwiLHRoaXMuX2VsLmFwcGVuZENoaWxkKHRoaXMuX3dyYXBDb250YWluZXIpLHRoaXN9LF9zZXRQZXJjZW50YWdlOmZ1bmN0aW9uKGEpe3RoaXMuX21vdmluZ1BhdGguc2V0QXR0cmlidXRlKFwiZFwiLHRoaXMuX2NhbGN1bGF0ZVBhdGgoYSwhMCkpLHRoaXMuX3RleHRDb250YWluZXIuaW5uZXJIVE1MPXRoaXMuX2dldFRleHQodGhpcy5nZXRWYWx1ZUZyb21QZXJjZW50KGEpKX0sX2dlbmVyYXRlV3JhcHBlcjpmdW5jdGlvbigpe3JldHVybiB0aGlzLl93cmFwQ29udGFpbmVyPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksdGhpcy5fd3JhcENvbnRhaW5lci5jbGFzc05hbWU9dGhpcy5fd3JwQ2xhc3MsdGhpcy5fc3R5bGVXcmFwcGVyJiYodGhpcy5fd3JhcENvbnRhaW5lci5zdHlsZS5wb3NpdGlvbj1cInJlbGF0aXZlXCIsdGhpcy5fd3JhcENvbnRhaW5lci5zdHlsZS5kaXNwbGF5PVwiaW5saW5lLWJsb2NrXCIpLHRoaXMuX3dyYXBDb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fc3ZnKSx0aGlzLl93cmFwQ29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuX3RleHRDb250YWluZXIpLHRoaXN9LF9nZW5lcmF0ZVRleHQ6ZnVuY3Rpb24oKXtpZih0aGlzLl90ZXh0Q29udGFpbmVyPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksdGhpcy5fdGV4dENvbnRhaW5lci5jbGFzc05hbWU9dGhpcy5fdGV4dENsYXNzLHRoaXMuX3N0eWxlVGV4dCl7dmFyIGE9e3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6MCxsZWZ0OjAsdGV4dEFsaWduOlwiY2VudGVyXCIsd2lkdGg6XCIxMDAlXCIsZm9udFNpemU6LjcqdGhpcy5fcmFkaXVzK1wicHhcIixoZWlnaHQ6dGhpcy5fc3ZnU2l6ZStcInB4XCIsbGluZUhlaWdodDp0aGlzLl9zdmdTaXplK1wicHhcIn07Zm9yKHZhciBiIGluIGEpdGhpcy5fdGV4dENvbnRhaW5lci5zdHlsZVtiXT1hW2JdfXJldHVybiB0aGlzLl90ZXh0Q29udGFpbmVyLmlubmVySFRNTD10aGlzLl9nZXRUZXh0KDApLHRoaXN9LF9nZXRUZXh0OmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLl90ZXh0Pyh2b2lkIDA9PT1hJiYoYT10aGlzLl92YWx1ZSksYT1wYXJzZUZsb2F0KGEudG9GaXhlZCgyKSksXCJmdW5jdGlvblwiPT10eXBlb2YgdGhpcy5fdGV4dD90aGlzLl90ZXh0LmNhbGwodGhpcyxhKTp0aGlzLl90ZXh0KTpcIlwifSxfZ2VuZXJhdGVTdmc6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fc3ZnPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsXCJzdmdcIiksdGhpcy5fc3ZnLnNldEF0dHJpYnV0ZShcInhtbG5zXCIsXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiKSx0aGlzLl9zdmcuc2V0QXR0cmlidXRlKFwid2lkdGhcIix0aGlzLl9zdmdTaXplKSx0aGlzLl9zdmcuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsdGhpcy5fc3ZnU2l6ZSksdGhpcy5fZ2VuZXJhdGVQYXRoKDEwMCwhMSx0aGlzLl9jb2xvcnNbMF0sdGhpcy5fbWF4VmFsQ2xhc3MpLl9nZW5lcmF0ZVBhdGgoMSwhMCx0aGlzLl9jb2xvcnNbMV0sdGhpcy5fdmFsQ2xhc3MpLHRoaXMuX21vdmluZ1BhdGg9dGhpcy5fc3ZnLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwicGF0aFwiKVsxXSx0aGlzfSxfZ2VuZXJhdGVQYXRoOmZ1bmN0aW9uKGEsYixjLGQpe3ZhciBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsXCJwYXRoXCIpO3JldHVybiBlLnNldEF0dHJpYnV0ZShcImZpbGxcIixcInRyYW5zcGFyZW50XCIpLGUuc2V0QXR0cmlidXRlKFwic3Ryb2tlXCIsYyksZS5zZXRBdHRyaWJ1dGUoXCJzdHJva2Utd2lkdGhcIix0aGlzLl9zdHJva2VXaWR0aCksZS5zZXRBdHRyaWJ1dGUoXCJkXCIsdGhpcy5fY2FsY3VsYXRlUGF0aChhLGIpKSxlLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsZCksdGhpcy5fc3ZnLmFwcGVuZENoaWxkKGUpLHRoaXN9LF9jYWxjdWxhdGVQYXRoOmZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcy5fc3RhcnQrYS8xMDAqdGhpcy5fY2lyYyxkPXRoaXMuX3ByZWNpc2UoYyk7cmV0dXJuIHRoaXMuX2FyYyhkLGIpfSxfYXJjOmZ1bmN0aW9uKGEsYil7dmFyIGM9YS0uMDAxLGQ9YS10aGlzLl9zdGFydFByZWNpc2U8TWF0aC5QST8wOjE7cmV0dXJuW1wiTVwiLHRoaXMuX3JhZGl1cyt0aGlzLl9yYWRpdXNBZGp1c3RlZCpNYXRoLmNvcyh0aGlzLl9zdGFydFByZWNpc2UpLHRoaXMuX3JhZGl1cyt0aGlzLl9yYWRpdXNBZGp1c3RlZCpNYXRoLnNpbih0aGlzLl9zdGFydFByZWNpc2UpLFwiQVwiLHRoaXMuX3JhZGl1c0FkanVzdGVkLHRoaXMuX3JhZGl1c0FkanVzdGVkLDAsZCwxLHRoaXMuX3JhZGl1cyt0aGlzLl9yYWRpdXNBZGp1c3RlZCpNYXRoLmNvcyhjKSx0aGlzLl9yYWRpdXMrdGhpcy5fcmFkaXVzQWRqdXN0ZWQqTWF0aC5zaW4oYyksYj9cIlwiOlwiWlwiXS5qb2luKFwiIFwiKX0sX3ByZWNpc2U6ZnVuY3Rpb24oYSl7cmV0dXJuIE1hdGgucm91bmQoMWUzKmEpLzFlM30saHRtbGlmeU51bWJlcjpmdW5jdGlvbihhLGIsYyl7Yj1ifHxcImNpcmNsZXMtaW50ZWdlclwiLGM9Y3x8XCJjaXJjbGVzLWRlY2ltYWxzXCI7dmFyIGQ9KGErXCJcIikuc3BsaXQoXCIuXCIpLGU9JzxzcGFuIGNsYXNzPVwiJytiKydcIj4nK2RbMF0rXCI8L3NwYW4+XCI7cmV0dXJuIGQubGVuZ3RoPjEmJihlKz0nLjxzcGFuIGNsYXNzPVwiJytjKydcIj4nK2RbMV0uc3Vic3RyaW5nKDAsMikrXCI8L3NwYW4+XCIpLGV9LHVwZGF0ZVJhZGl1czpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5fcmFkaXVzPWEsdGhpcy5fZ2VuZXJhdGUoKS51cGRhdGUoITApfSx1cGRhdGVXaWR0aDpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5fc3Ryb2tlV2lkdGg9YSx0aGlzLl9nZW5lcmF0ZSgpLnVwZGF0ZSghMCl9LHVwZGF0ZUNvbG9yczpmdW5jdGlvbihhKXt0aGlzLl9jb2xvcnM9YTt2YXIgYj10aGlzLl9zdmcuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJwYXRoXCIpO3JldHVybiBiWzBdLnNldEF0dHJpYnV0ZShcInN0cm9rZVwiLGFbMF0pLGJbMV0uc2V0QXR0cmlidXRlKFwic3Ryb2tlXCIsYVsxXSksdGhpc30sZ2V0UGVyY2VudDpmdW5jdGlvbigpe3JldHVybiAxMDAqdGhpcy5fdmFsdWUvdGhpcy5fbWF4VmFsdWV9LGdldFZhbHVlRnJvbVBlcmNlbnQ6ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuX21heFZhbHVlKmEvMTAwfSxnZXRWYWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl92YWx1ZX0sZ2V0TWF4VmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fbWF4VmFsdWV9LHVwZGF0ZTpmdW5jdGlvbihiLGMpe2lmKGI9PT0hMClyZXR1cm4gdGhpcy5fc2V0UGVyY2VudGFnZSh0aGlzLmdldFBlcmNlbnQoKSksdGhpcztpZih0aGlzLl92YWx1ZT09Ynx8aXNOYU4oYikpcmV0dXJuIHRoaXM7dm9pZCAwPT09YyYmKGM9dGhpcy5fZHVyYXRpb24pO3ZhciBkLGUsZixnLGg9dGhpcyxpPWguZ2V0UGVyY2VudCgpLGo9MTtyZXR1cm4gdGhpcy5fdmFsdWU9TWF0aC5taW4odGhpcy5fbWF4VmFsdWUsTWF0aC5tYXgoMCxiKSksYz8oZD1oLmdldFBlcmNlbnQoKSxlPWQ+aSxqKz1kJTEsZj1NYXRoLmZsb29yKE1hdGguYWJzKGQtaSkvaiksZz1jL2YsZnVuY3Rpb24gayhiKXtpZihlP2krPWo6aS09aixlJiZpPj1kfHwhZSYmZD49aSlyZXR1cm4gdm9pZCBhKGZ1bmN0aW9uKCl7aC5fc2V0UGVyY2VudGFnZShkKX0pO2EoZnVuY3Rpb24oKXtoLl9zZXRQZXJjZW50YWdlKGkpfSk7dmFyIGM9RGF0ZS5ub3coKSxmPWMtYjtmPj1nP2soYyk6c2V0VGltZW91dChmdW5jdGlvbigpe2soRGF0ZS5ub3coKSl9LGctZil9KERhdGUubm93KCkpLHRoaXMpOih0aGlzLl9zZXRQZXJjZW50YWdlKHRoaXMuZ2V0UGVyY2VudCgpKSx0aGlzKX19LGIuY3JlYXRlPWZ1bmN0aW9uKGEpe3JldHVybiBuZXcgYihhKX0sYn0pOyIsInZhciBEYXRlcGlja2VyO1xuXG4oZnVuY3Rpb24gKHdpbmRvdywgJCwgdW5kZWZpbmVkKSB7XG4gICAgdmFyIHBsdWdpbk5hbWUgPSAnZGF0ZXBpY2tlcicsXG4gICAgICAgIGF1dG9Jbml0U2VsZWN0b3IgPSAnLmRhdGVwaWNrZXItaGVyZScsXG4gICAgICAgICRib2R5LCAkZGF0ZXBpY2tlcnNDb250YWluZXIsXG4gICAgICAgIGNvbnRhaW5lckJ1aWx0ID0gZmFsc2UsXG4gICAgICAgIGJhc2VUZW1wbGF0ZSA9ICcnICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlclwiPicgK1xuICAgICAgICAgICAgJzxuYXYgY2xhc3M9XCJkYXRlcGlja2VyLS1uYXZcIj48L25hdj4nICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tY29udGVudFwiPjwvZGl2PicgK1xuICAgICAgICAgICAgJzwvZGl2PicsXG4gICAgICAgIGRlZmF1bHRzID0ge1xuICAgICAgICAgICAgY2xhc3NlczogJycsXG4gICAgICAgICAgICBpbmxpbmU6IGZhbHNlLFxuICAgICAgICAgICAgbGFuZ3VhZ2U6ICdydScsXG4gICAgICAgICAgICBzdGFydERhdGU6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICBmaXJzdERheTogJycsXG4gICAgICAgICAgICB3ZWVrZW5kczogWzYsIDBdLFxuICAgICAgICAgICAgZGF0ZUZvcm1hdDogJycsXG4gICAgICAgICAgICBhbHRGaWVsZDogJycsXG4gICAgICAgICAgICBhbHRGaWVsZERhdGVGb3JtYXQ6ICdAJyxcbiAgICAgICAgICAgIHRvZ2dsZVNlbGVjdGVkOiB0cnVlLFxuICAgICAgICAgICAga2V5Ym9hcmROYXY6IHRydWUsXG5cbiAgICAgICAgICAgIHBvc2l0aW9uOiAnYm90dG9tIGxlZnQnLFxuICAgICAgICAgICAgb2Zmc2V0OiAxMixcblxuICAgICAgICAgICAgdmlldzogJ2RheXMnLFxuICAgICAgICAgICAgbWluVmlldzogJ2RheXMnLFxuXG4gICAgICAgICAgICBzaG93T3RoZXJNb250aHM6IHRydWUsXG4gICAgICAgICAgICBzZWxlY3RPdGhlck1vbnRoczogdHJ1ZSxcbiAgICAgICAgICAgIG1vdmVUb090aGVyTW9udGhzT25TZWxlY3Q6IHRydWUsXG5cbiAgICAgICAgICAgIHNob3dPdGhlclllYXJzOiB0cnVlLFxuICAgICAgICAgICAgc2VsZWN0T3RoZXJZZWFyczogdHJ1ZSxcbiAgICAgICAgICAgIG1vdmVUb090aGVyWWVhcnNPblNlbGVjdDogdHJ1ZSxcblxuICAgICAgICAgICAgbWluRGF0ZTogJycsXG4gICAgICAgICAgICBtYXhEYXRlOiAnJyxcbiAgICAgICAgICAgIGRpc2FibGVOYXZXaGVuT3V0T2ZSYW5nZTogdHJ1ZSxcblxuICAgICAgICAgICAgbXVsdGlwbGVEYXRlczogZmFsc2UsIC8vIEJvb2xlYW4gb3IgTnVtYmVyXG4gICAgICAgICAgICBtdWx0aXBsZURhdGVzU2VwYXJhdG9yOiAnLCcsXG4gICAgICAgICAgICByYW5nZTogZmFsc2UsXG5cbiAgICAgICAgICAgIHRvZGF5QnV0dG9uOiBmYWxzZSxcbiAgICAgICAgICAgIGNsZWFyQnV0dG9uOiBmYWxzZSxcblxuICAgICAgICAgICAgc2hvd0V2ZW50OiAnZm9jdXMnLFxuICAgICAgICAgICAgYXV0b0Nsb3NlOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gbmF2aWdhdGlvblxuICAgICAgICAgICAgbW9udGhzRmllbGQ6ICdtb250aHNTaG9ydCcsXG4gICAgICAgICAgICBwcmV2SHRtbDogJzxzdmc+PHBhdGggZD1cIk0gMTcsMTIgbCAtNSw1IGwgNSw1XCI+PC9wYXRoPjwvc3ZnPicsXG4gICAgICAgICAgICBuZXh0SHRtbDogJzxzdmc+PHBhdGggZD1cIk0gMTQsMTIgbCA1LDUgbCAtNSw1XCI+PC9wYXRoPjwvc3ZnPicsXG4gICAgICAgICAgICBuYXZUaXRsZXM6IHtcbiAgICAgICAgICAgICAgICBkYXlzOiAnTU0sIDxpPnl5eXk8L2k+JyxcbiAgICAgICAgICAgICAgICBtb250aHM6ICd5eXl5JyxcbiAgICAgICAgICAgICAgICB5ZWFyczogJ3l5eXkxIC0geXl5eTInXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvLyBldmVudHNcbiAgICAgICAgICAgIG9uU2VsZWN0OiAnJyxcbiAgICAgICAgICAgIG9uQ2hhbmdlTW9udGg6ICcnLFxuICAgICAgICAgICAgb25DaGFuZ2VZZWFyOiAnJyxcbiAgICAgICAgICAgIG9uQ2hhbmdlRGVjYWRlOiAnJyxcbiAgICAgICAgICAgIG9uQ2hhbmdlVmlldzogJycsXG4gICAgICAgICAgICBvblJlbmRlckNlbGw6ICcnXG4gICAgICAgIH0sXG4gICAgICAgIGhvdEtleXMgPSB7XG4gICAgICAgICAgICAnY3RybFJpZ2h0JzogWzE3LCAzOV0sXG4gICAgICAgICAgICAnY3RybFVwJzogWzE3LCAzOF0sXG4gICAgICAgICAgICAnY3RybExlZnQnOiBbMTcsIDM3XSxcbiAgICAgICAgICAgICdjdHJsRG93bic6IFsxNywgNDBdLFxuICAgICAgICAgICAgJ3NoaWZ0UmlnaHQnOiBbMTYsIDM5XSxcbiAgICAgICAgICAgICdzaGlmdFVwJzogWzE2LCAzOF0sXG4gICAgICAgICAgICAnc2hpZnRMZWZ0JzogWzE2LCAzN10sXG4gICAgICAgICAgICAnc2hpZnREb3duJzogWzE2LCA0MF0sXG4gICAgICAgICAgICAnYWx0VXAnOiBbMTgsIDM4XSxcbiAgICAgICAgICAgICdhbHRSaWdodCc6IFsxOCwgMzldLFxuICAgICAgICAgICAgJ2FsdExlZnQnOiBbMTgsIDM3XSxcbiAgICAgICAgICAgICdhbHREb3duJzogWzE4LCA0MF0sXG4gICAgICAgICAgICAnY3RybFNoaWZ0VXAnOiBbMTYsIDE3LCAzOF1cbiAgICAgICAgfSxcbiAgICAgICAgZGF0ZXBpY2tlcjtcblxuICAgIERhdGVwaWNrZXIgID0gZnVuY3Rpb24gKGVsLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuZWwgPSBlbDtcbiAgICAgICAgdGhpcy4kZWwgPSAkKGVsKTtcblxuICAgICAgICB0aGlzLm9wdHMgPSAkLmV4dGVuZCh0cnVlLCB7fSwgZGVmYXVsdHMsIG9wdGlvbnMsIHRoaXMuJGVsLmRhdGEoKSk7XG5cbiAgICAgICAgaWYgKCRib2R5ID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgJGJvZHkgPSAkKCdib2R5Jyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMub3B0cy5zdGFydERhdGUpIHtcbiAgICAgICAgICAgIHRoaXMub3B0cy5zdGFydERhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuZWwubm9kZU5hbWUgPT0gJ0lOUFVUJykge1xuICAgICAgICAgICAgdGhpcy5lbElzSW5wdXQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0cy5hbHRGaWVsZCkge1xuICAgICAgICAgICAgdGhpcy4kYWx0RmllbGQgPSB0eXBlb2YgdGhpcy5vcHRzLmFsdEZpZWxkID09ICdzdHJpbmcnID8gJCh0aGlzLm9wdHMuYWx0RmllbGQpIDogdGhpcy5vcHRzLmFsdEZpZWxkO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pbml0ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc2lsZW50ID0gZmFsc2U7IC8vIE5lZWQgdG8gcHJldmVudCB1bm5lY2Vzc2FyeSByZW5kZXJpbmdcblxuICAgICAgICB0aGlzLmN1cnJlbnREYXRlID0gdGhpcy5vcHRzLnN0YXJ0RGF0ZTtcbiAgICAgICAgdGhpcy5jdXJyZW50VmlldyA9IHRoaXMub3B0cy52aWV3O1xuICAgICAgICB0aGlzLl9jcmVhdGVTaG9ydEN1dHMoKTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZERhdGVzID0gW107XG4gICAgICAgIHRoaXMudmlld3MgPSB7fTtcbiAgICAgICAgdGhpcy5rZXlzID0gW107XG4gICAgICAgIHRoaXMubWluUmFuZ2UgPSAnJztcbiAgICAgICAgdGhpcy5tYXhSYW5nZSA9ICcnO1xuXG4gICAgICAgIHRoaXMuaW5pdCgpXG4gICAgfTtcblxuICAgIGRhdGVwaWNrZXIgPSBEYXRlcGlja2VyO1xuXG4gICAgZGF0ZXBpY2tlci5wcm90b3R5cGUgPSB7XG4gICAgICAgIHZpZXdJbmRleGVzOiBbJ2RheXMnLCAnbW9udGhzJywgJ3llYXJzJ10sXG5cbiAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCFjb250YWluZXJCdWlsdCAmJiAhdGhpcy5vcHRzLmlubGluZSAmJiB0aGlzLmVsSXNJbnB1dCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2J1aWxkRGF0ZXBpY2tlcnNDb250YWluZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2J1aWxkQmFzZUh0bWwoKTtcbiAgICAgICAgICAgIHRoaXMuX2RlZmluZUxvY2FsZSh0aGlzLm9wdHMubGFuZ3VhZ2UpO1xuICAgICAgICAgICAgdGhpcy5fc3luY1dpdGhNaW5NYXhEYXRlcygpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5lbElzSW5wdXQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMub3B0cy5pbmxpbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU2V0IGV4dHJhIGNsYXNzZXMgZm9yIHByb3BlciB0cmFuc2l0aW9uc1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRQb3NpdGlvbkNsYXNzZXModGhpcy5vcHRzLnBvc2l0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYmluZEV2ZW50cygpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdHMua2V5Ym9hcmROYXYpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYmluZEtleWJvYXJkRXZlbnRzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXIub24oJ21vdXNlZG93bicsIHRoaXMuX29uTW91c2VEb3duRGF0ZXBpY2tlci5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyLm9uKCdtb3VzZXVwJywgdGhpcy5fb25Nb3VzZVVwRGF0ZXBpY2tlci5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5jbGFzc2VzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlci5hZGRDbGFzcyh0aGlzLm9wdHMuY2xhc3NlcylcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy52aWV3c1t0aGlzLmN1cnJlbnRWaWV3XSA9IG5ldyBEYXRlcGlja2VyLkJvZHkodGhpcywgdGhpcy5jdXJyZW50VmlldywgdGhpcy5vcHRzKTtcbiAgICAgICAgICAgIHRoaXMudmlld3NbdGhpcy5jdXJyZW50Vmlld10uc2hvdygpO1xuICAgICAgICAgICAgdGhpcy5uYXYgPSBuZXcgRGF0ZXBpY2tlci5OYXZpZ2F0aW9uKHRoaXMsIHRoaXMub3B0cyk7XG4gICAgICAgICAgICB0aGlzLnZpZXcgPSB0aGlzLmN1cnJlbnRWaWV3O1xuXG4gICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyLm9uKCdtb3VzZWVudGVyJywgJy5kYXRlcGlja2VyLS1jZWxsJywgdGhpcy5fb25Nb3VzZUVudGVyQ2VsbC5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXIub24oJ21vdXNlbGVhdmUnLCAnLmRhdGVwaWNrZXItLWNlbGwnLCB0aGlzLl9vbk1vdXNlTGVhdmVDZWxsLmJpbmQodGhpcykpO1xuXG4gICAgICAgICAgICB0aGlzLmluaXRlZCA9IHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2NyZWF0ZVNob3J0Q3V0czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5taW5EYXRlID0gdGhpcy5vcHRzLm1pbkRhdGUgPyB0aGlzLm9wdHMubWluRGF0ZSA6IG5ldyBEYXRlKC04NjM5OTk5OTEzNjAwMDAwKTtcbiAgICAgICAgICAgIHRoaXMubWF4RGF0ZSA9IHRoaXMub3B0cy5tYXhEYXRlID8gdGhpcy5vcHRzLm1heERhdGUgOiBuZXcgRGF0ZSg4NjM5OTk5OTEzNjAwMDAwKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfYmluZEV2ZW50cyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLm9uKHRoaXMub3B0cy5zaG93RXZlbnQgKyAnLmFkcCcsIHRoaXMuX29uU2hvd0V2ZW50LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgdGhpcy4kZWwub24oJ2JsdXIuYWRwJywgdGhpcy5fb25CbHVyLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgdGhpcy4kZWwub24oJ2lucHV0LmFkcCcsIHRoaXMuX29uSW5wdXQuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS5hZHAnLCB0aGlzLl9vblJlc2l6ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfYmluZEtleWJvYXJkRXZlbnRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5vbigna2V5ZG93bi5hZHAnLCB0aGlzLl9vbktleURvd24uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB0aGlzLiRlbC5vbigna2V5dXAuYWRwJywgdGhpcy5fb25LZXlVcC5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHRoaXMuJGVsLm9uKCdob3RLZXkuYWRwJywgdGhpcy5fb25Ib3RLZXkuYmluZCh0aGlzKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNXZWVrZW5kOiBmdW5jdGlvbiAoZGF5KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRzLndlZWtlbmRzLmluZGV4T2YoZGF5KSAhPT0gLTE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2RlZmluZUxvY2FsZTogZnVuY3Rpb24gKGxhbmcpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbGFuZyA9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHRoaXMubG9jID0gRGF0ZXBpY2tlci5sYW5ndWFnZVtsYW5nXTtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubG9jKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignQ2FuXFwndCBmaW5kIGxhbmd1YWdlIFwiJyArIGxhbmcgKyAnXCIgaW4gRGF0ZXBpY2tlci5sYW5ndWFnZSwgd2lsbCB1c2UgXCJydVwiIGluc3RlYWQnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2MgPSAkLmV4dGVuZCh0cnVlLCB7fSwgRGF0ZXBpY2tlci5sYW5ndWFnZS5ydSlcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLmxvYyA9ICQuZXh0ZW5kKHRydWUsIHt9LCBEYXRlcGlja2VyLmxhbmd1YWdlLnJ1LCBEYXRlcGlja2VyLmxhbmd1YWdlW2xhbmddKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYyA9ICQuZXh0ZW5kKHRydWUsIHt9LCBEYXRlcGlja2VyLmxhbmd1YWdlLnJ1LCBsYW5nKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLmRhdGVGb3JtYXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYy5kYXRlRm9ybWF0ID0gdGhpcy5vcHRzLmRhdGVGb3JtYXRcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5maXJzdERheSAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYy5maXJzdERheSA9IHRoaXMub3B0cy5maXJzdERheVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9idWlsZERhdGVwaWNrZXJzQ29udGFpbmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb250YWluZXJCdWlsdCA9IHRydWU7XG4gICAgICAgICAgICAkYm9keS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJkYXRlcGlja2Vycy1jb250YWluZXJcIiBpZD1cImRhdGVwaWNrZXJzLWNvbnRhaW5lclwiPjwvZGl2PicpO1xuICAgICAgICAgICAgJGRhdGVwaWNrZXJzQ29udGFpbmVyID0gJCgnI2RhdGVwaWNrZXJzLWNvbnRhaW5lcicpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9idWlsZEJhc2VIdG1sOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgJGFwcGVuZFRhcmdldCxcbiAgICAgICAgICAgICAgICAkaW5saW5lID0gJCgnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItaW5saW5lXCI+Jyk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZWwubm9kZU5hbWUgPT0gJ0lOUFVUJykge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5vcHRzLmlubGluZSkge1xuICAgICAgICAgICAgICAgICAgICAkYXBwZW5kVGFyZ2V0ID0gJGRhdGVwaWNrZXJzQ29udGFpbmVyO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICRhcHBlbmRUYXJnZXQgPSAkaW5saW5lLmluc2VydEFmdGVyKHRoaXMuJGVsKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJGFwcGVuZFRhcmdldCA9ICRpbmxpbmUuYXBwZW5kVG8odGhpcy4kZWwpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXIgPSAkKGJhc2VUZW1wbGF0ZSkuYXBwZW5kVG8oJGFwcGVuZFRhcmdldCk7XG4gICAgICAgICAgICB0aGlzLiRjb250ZW50ID0gJCgnLmRhdGVwaWNrZXItLWNvbnRlbnQnLCB0aGlzLiRkYXRlcGlja2VyKTtcbiAgICAgICAgICAgIHRoaXMuJG5hdiA9ICQoJy5kYXRlcGlja2VyLS1uYXYnLCB0aGlzLiRkYXRlcGlja2VyKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfdHJpZ2dlck9uQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuc2VsZWN0ZWREYXRlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRzLm9uU2VsZWN0KCcnLCAnJywgdGhpcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBzZWxlY3RlZERhdGVzID0gdGhpcy5zZWxlY3RlZERhdGVzLFxuICAgICAgICAgICAgICAgIHBhcnNlZFNlbGVjdGVkID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKHNlbGVjdGVkRGF0ZXNbMF0pLFxuICAgICAgICAgICAgICAgIGZvcm1hdHRlZERhdGVzLFxuICAgICAgICAgICAgICAgIF90aGlzID0gdGhpcyxcbiAgICAgICAgICAgICAgICBkYXRlcyA9IG5ldyBEYXRlKHBhcnNlZFNlbGVjdGVkLnllYXIsIHBhcnNlZFNlbGVjdGVkLm1vbnRoLCBwYXJzZWRTZWxlY3RlZC5kYXRlKTtcblxuICAgICAgICAgICAgICAgIGZvcm1hdHRlZERhdGVzID0gc2VsZWN0ZWREYXRlcy5tYXAoZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLmZvcm1hdERhdGUoX3RoaXMubG9jLmRhdGVGb3JtYXQsIGRhdGUpXG4gICAgICAgICAgICAgICAgfSkuam9pbih0aGlzLm9wdHMubXVsdGlwbGVEYXRlc1NlcGFyYXRvcik7XG5cbiAgICAgICAgICAgIC8vIENyZWF0ZSBuZXcgZGF0ZXMgYXJyYXksIHRvIHNlcGFyYXRlIGl0IGZyb20gb3JpZ2luYWwgc2VsZWN0ZWREYXRlc1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5tdWx0aXBsZURhdGVzIHx8IHRoaXMub3B0cy5yYW5nZSkge1xuICAgICAgICAgICAgICAgIGRhdGVzID0gc2VsZWN0ZWREYXRlcy5tYXAoZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGFyc2VkRGF0ZSA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZShkYXRlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHBhcnNlZERhdGUueWVhciwgcGFyc2VkRGF0ZS5tb250aCwgcGFyc2VkRGF0ZS5kYXRlKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMub3B0cy5vblNlbGVjdChmb3JtYXR0ZWREYXRlcywgZGF0ZXMsIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkID0gdGhpcy5wYXJzZWREYXRlLFxuICAgICAgICAgICAgICAgIG8gPSB0aGlzLm9wdHM7XG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMudmlldykge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2RheXMnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShkLnllYXIsIGQubW9udGggKyAxLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG8ub25DaGFuZ2VNb250aCkgby5vbkNoYW5nZU1vbnRoKHRoaXMucGFyc2VkRGF0ZS5tb250aCwgdGhpcy5wYXJzZWREYXRlLnllYXIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdtb250aHMnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShkLnllYXIgKyAxLCBkLm1vbnRoLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG8ub25DaGFuZ2VZZWFyKSBvLm9uQ2hhbmdlWWVhcih0aGlzLnBhcnNlZERhdGUueWVhcik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3llYXJzJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoZC55ZWFyICsgMTAsIDAsIDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoby5vbkNoYW5nZURlY2FkZSkgby5vbkNoYW5nZURlY2FkZSh0aGlzLmN1ckRlY2FkZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHByZXY6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkID0gdGhpcy5wYXJzZWREYXRlLFxuICAgICAgICAgICAgICAgIG8gPSB0aGlzLm9wdHM7XG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMudmlldykge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2RheXMnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShkLnllYXIsIGQubW9udGggLSAxLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG8ub25DaGFuZ2VNb250aCkgby5vbkNoYW5nZU1vbnRoKHRoaXMucGFyc2VkRGF0ZS5tb250aCwgdGhpcy5wYXJzZWREYXRlLnllYXIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdtb250aHMnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShkLnllYXIgLSAxLCBkLm1vbnRoLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG8ub25DaGFuZ2VZZWFyKSBvLm9uQ2hhbmdlWWVhcih0aGlzLnBhcnNlZERhdGUueWVhcik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3llYXJzJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoZC55ZWFyIC0gMTAsIDAsIDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoby5vbkNoYW5nZURlY2FkZSkgby5vbkNoYW5nZURlY2FkZSh0aGlzLmN1ckRlY2FkZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGZvcm1hdERhdGU6IGZ1bmN0aW9uIChzdHJpbmcsIGRhdGUpIHtcbiAgICAgICAgICAgIGRhdGUgPSBkYXRlIHx8IHRoaXMuZGF0ZTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBzdHJpbmcsXG4gICAgICAgICAgICAgICAgYm91bmRhcnkgPSB0aGlzLl9nZXRXb3JkQm91bmRhcnlSZWdFeHAsXG4gICAgICAgICAgICAgICAgbG9jYWxlID0gdGhpcy5sb2MsXG4gICAgICAgICAgICAgICAgZGVjYWRlID0gZGF0ZXBpY2tlci5nZXREZWNhZGUoZGF0ZSksXG4gICAgICAgICAgICAgICAgZCA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZShkYXRlKTtcblxuICAgICAgICAgICAgc3dpdGNoICh0cnVlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAvQC8udGVzdChyZXN1bHQpOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZSgvQC8sIGRhdGUuZ2V0VGltZSgpKTtcbiAgICAgICAgICAgICAgICBjYXNlIC9kZC8udGVzdChyZXN1bHQpOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgnZGQnKSwgZC5mdWxsRGF0ZSk7XG4gICAgICAgICAgICAgICAgY2FzZSAvZC8udGVzdChyZXN1bHQpOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgnZCcpLCBkLmRhdGUpO1xuICAgICAgICAgICAgICAgIGNhc2UgL0RELy50ZXN0KHJlc3VsdCk6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCdERCcpLCBsb2NhbGUuZGF5c1tkLmRheV0pO1xuICAgICAgICAgICAgICAgIGNhc2UgL0QvLnRlc3QocmVzdWx0KTpcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ0QnKSwgbG9jYWxlLmRheXNTaG9ydFtkLmRheV0pO1xuICAgICAgICAgICAgICAgIGNhc2UgL21tLy50ZXN0KHJlc3VsdCk6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCdtbScpLCBkLmZ1bGxNb250aCk7XG4gICAgICAgICAgICAgICAgY2FzZSAvbS8udGVzdChyZXN1bHQpOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgnbScpLCBkLm1vbnRoICsgMSk7XG4gICAgICAgICAgICAgICAgY2FzZSAvTU0vLnRlc3QocmVzdWx0KTpcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ01NJyksIHRoaXMubG9jLm1vbnRoc1tkLm1vbnRoXSk7XG4gICAgICAgICAgICAgICAgY2FzZSAvTS8udGVzdChyZXN1bHQpOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgnTScpLCBsb2NhbGUubW9udGhzU2hvcnRbZC5tb250aF0pO1xuICAgICAgICAgICAgICAgIGNhc2UgL3l5eXkvLnRlc3QocmVzdWx0KTpcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ3l5eXknKSwgZC55ZWFyKTtcbiAgICAgICAgICAgICAgICBjYXNlIC95eXl5MS8udGVzdChyZXN1bHQpOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgneXl5eTEnKSwgZGVjYWRlWzBdKTtcbiAgICAgICAgICAgICAgICBjYXNlIC95eXl5Mi8udGVzdChyZXN1bHQpOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgneXl5eTInKSwgZGVjYWRlWzFdKTtcbiAgICAgICAgICAgICAgICBjYXNlIC95eS8udGVzdChyZXN1bHQpOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgneXknKSwgZC55ZWFyLnRvU3RyaW5nKCkuc2xpY2UoLTIpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0V29yZEJvdW5kYXJ5UmVnRXhwOiBmdW5jdGlvbiAoc2lnbikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoJ1xcXFxiKD89W2EtekEtWjAtOcOkw7bDvMOfw4TDlsOcPF0pJyArIHNpZ24gKyAnKD8hWz5hLXpBLVowLTnDpMO2w7zDn8OEw5bDnF0pJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VsZWN0RGF0ZTogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0cyA9IF90aGlzLm9wdHMsXG4gICAgICAgICAgICAgICAgZCA9IF90aGlzLnBhcnNlZERhdGUsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWREYXRlcyA9IF90aGlzLnNlbGVjdGVkRGF0ZXMsXG4gICAgICAgICAgICAgICAgbGVuID0gc2VsZWN0ZWREYXRlcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgbmV3RGF0ZSA9ICcnO1xuXG4gICAgICAgICAgICBpZiAoIShkYXRlIGluc3RhbmNlb2YgRGF0ZSkpIHJldHVybjtcblxuICAgICAgICAgICAgaWYgKF90aGlzLnZpZXcgPT0gJ2RheXMnKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGUuZ2V0TW9udGgoKSAhPSBkLm1vbnRoICYmIG9wdHMubW92ZVRvT3RoZXJNb250aHNPblNlbGVjdCkge1xuICAgICAgICAgICAgICAgICAgICBuZXdEYXRlID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKF90aGlzLnZpZXcgPT0gJ3llYXJzJykge1xuICAgICAgICAgICAgICAgIGlmIChkYXRlLmdldEZ1bGxZZWFyKCkgIT0gZC55ZWFyICYmIG9wdHMubW92ZVRvT3RoZXJZZWFyc09uU2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld0RhdGUgPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIDAsIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG5ld0RhdGUpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5zaWxlbnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIF90aGlzLmRhdGUgPSBuZXdEYXRlO1xuICAgICAgICAgICAgICAgIF90aGlzLnNpbGVudCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIF90aGlzLm5hdi5fcmVuZGVyKClcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG9wdHMubXVsdGlwbGVEYXRlcyAmJiAhb3B0cy5yYW5nZSkgeyAvLyBTZXQgcHJpb3JpdHkgdG8gcmFuZ2UgZnVuY3Rpb25hbGl0eVxuICAgICAgICAgICAgICAgIGlmIChsZW4gPT09IG9wdHMubXVsdGlwbGVEYXRlcykgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGlmICghX3RoaXMuX2lzU2VsZWN0ZWQoZGF0ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2VsZWN0ZWREYXRlcy5wdXNoKGRhdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0cy5yYW5nZSkge1xuICAgICAgICAgICAgICAgIGlmIChsZW4gPT0gMikge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZWxlY3RlZERhdGVzID0gW2RhdGVdO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5taW5SYW5nZSA9IGRhdGU7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLm1heFJhbmdlID0gJyc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChsZW4gPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZWxlY3RlZERhdGVzLnB1c2goZGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghX3RoaXMubWF4UmFuZ2Upe1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMubWF4UmFuZ2UgPSBkYXRlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMubWluUmFuZ2UgPSBkYXRlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnNlbGVjdGVkRGF0ZXMgPSBbX3RoaXMubWluUmFuZ2UsIF90aGlzLm1heFJhbmdlXVxuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2VsZWN0ZWREYXRlcyA9IFtkYXRlXTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMubWluUmFuZ2UgPSBkYXRlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuc2VsZWN0ZWREYXRlcyA9IFtkYXRlXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgX3RoaXMuX3NldElucHV0VmFsdWUoKTtcblxuICAgICAgICAgICAgaWYgKG9wdHMub25TZWxlY3QpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5fdHJpZ2dlck9uQ2hhbmdlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcHRzLmF1dG9DbG9zZSkge1xuICAgICAgICAgICAgICAgIGlmICghb3B0cy5tdWx0aXBsZURhdGVzICYmICFvcHRzLnJhbmdlKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9wdHMucmFuZ2UgJiYgX3RoaXMuc2VsZWN0ZWREYXRlcy5sZW5ndGggPT0gMikge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfdGhpcy52aWV3c1t0aGlzLmN1cnJlbnRWaWV3XS5fcmVuZGVyKClcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVEYXRlOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgdmFyIHNlbGVjdGVkID0gdGhpcy5zZWxlY3RlZERhdGVzLFxuICAgICAgICAgICAgICAgIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKCEoZGF0ZSBpbnN0YW5jZW9mIERhdGUpKSByZXR1cm47XG5cbiAgICAgICAgICAgIHJldHVybiBzZWxlY3RlZC5zb21lKGZ1bmN0aW9uIChjdXJEYXRlLCBpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGVwaWNrZXIuaXNTYW1lKGN1ckRhdGUsIGRhdGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkLnNwbGljZShpLCAxKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIV90aGlzLnNlbGVjdGVkRGF0ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5taW5SYW5nZSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMubWF4UmFuZ2UgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnZpZXdzW190aGlzLmN1cnJlbnRWaWV3XS5fcmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLl9zZXRJbnB1dFZhbHVlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzLm9wdHMub25TZWxlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLl90cmlnZ2VyT25DaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICB0b2RheTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5zaWxlbnQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy52aWV3ID0gdGhpcy5vcHRzLm1pblZpZXc7XG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjbGVhcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZERhdGVzID0gW107XG4gICAgICAgICAgICB0aGlzLm1pblJhbmdlID0gJyc7XG4gICAgICAgICAgICB0aGlzLm1heFJhbmdlID0gJyc7XG4gICAgICAgICAgICB0aGlzLnZpZXdzW3RoaXMuY3VycmVudFZpZXddLl9yZW5kZXIoKTtcbiAgICAgICAgICAgIHRoaXMuX3NldElucHV0VmFsdWUoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMub25TZWxlY3QpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl90cmlnZ2VyT25DaGFuZ2UoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBVcGRhdGVzIGRhdGVwaWNrZXIgb3B0aW9uc1xuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IHBhcmFtIC0gcGFyYW1ldGVyJ3MgbmFtZSB0byB1cGRhdGUuIElmIG9iamVjdCB0aGVuIGl0IHdpbGwgZXh0ZW5kIGN1cnJlbnQgb3B0aW9uc1xuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ8T2JqZWN0fSBbdmFsdWVdIC0gbmV3IHBhcmFtIHZhbHVlXG4gICAgICAgICAqL1xuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIChwYXJhbSwgdmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICAgICAgaWYgKGxlbiA9PSAyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRzW3BhcmFtXSA9IHZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChsZW4gPT0gMSAmJiB0eXBlb2YgcGFyYW0gPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdHMgPSAkLmV4dGVuZCh0cnVlLCB0aGlzLm9wdHMsIHBhcmFtKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVTaG9ydEN1dHMoKTtcbiAgICAgICAgICAgIHRoaXMuX3N5bmNXaXRoTWluTWF4RGF0ZXMoKTtcbiAgICAgICAgICAgIHRoaXMuX2RlZmluZUxvY2FsZSh0aGlzLm9wdHMubGFuZ3VhZ2UpO1xuICAgICAgICAgICAgdGhpcy5uYXYuX2FkZEJ1dHRvbnNJZk5lZWQoKTtcbiAgICAgICAgICAgIHRoaXMubmF2Ll9yZW5kZXIoKTtcbiAgICAgICAgICAgIHRoaXMudmlld3NbdGhpcy5jdXJyZW50Vmlld10uX3JlbmRlcigpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5lbElzSW5wdXQgJiYgIXRoaXMub3B0cy5pbmxpbmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRQb3NpdGlvbkNsYXNzZXModGhpcy5vcHRzLnBvc2l0aW9uKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb24odGhpcy5vcHRzLnBvc2l0aW9uKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5jbGFzc2VzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlci5hZGRDbGFzcyh0aGlzLm9wdHMuY2xhc3NlcylcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3N5bmNXaXRoTWluTWF4RGF0ZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBjdXJUaW1lID0gdGhpcy5kYXRlLmdldFRpbWUoKTtcbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1pblRpbWUgPiBjdXJUaW1lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdGhpcy5taW5EYXRlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5tYXhUaW1lIDwgY3VyVGltZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHRoaXMubWF4RGF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2lzU2VsZWN0ZWQ6IGZ1bmN0aW9uIChjaGVja0RhdGUsIGNlbGxUeXBlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZERhdGVzLnNvbWUoZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0ZXBpY2tlci5pc1NhbWUoZGF0ZSwgY2hlY2tEYXRlLCBjZWxsVHlwZSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgX3NldElucHV0VmFsdWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0cyA9IF90aGlzLm9wdHMsXG4gICAgICAgICAgICAgICAgZm9ybWF0ID0gX3RoaXMubG9jLmRhdGVGb3JtYXQsXG4gICAgICAgICAgICAgICAgYWx0Rm9ybWF0ID0gb3B0cy5hbHRGaWVsZERhdGVGb3JtYXQsXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBfdGhpcy5zZWxlY3RlZERhdGVzLm1hcChmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuZm9ybWF0RGF0ZShmb3JtYXQsIGRhdGUpXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgYWx0VmFsdWVzO1xuXG4gICAgICAgICAgICBpZiAob3B0cy5hbHRGaWVsZCAmJiBfdGhpcy4kYWx0RmllbGQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgYWx0VmFsdWVzID0gdGhpcy5zZWxlY3RlZERhdGVzLm1hcChmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuZm9ybWF0RGF0ZShhbHRGb3JtYXQsIGRhdGUpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYWx0VmFsdWVzID0gYWx0VmFsdWVzLmpvaW4odGhpcy5vcHRzLm11bHRpcGxlRGF0ZXNTZXBhcmF0b3IpO1xuICAgICAgICAgICAgICAgIHRoaXMuJGFsdEZpZWxkLnZhbChhbHRWYWx1ZXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLmpvaW4odGhpcy5vcHRzLm11bHRpcGxlRGF0ZXNTZXBhcmF0b3IpO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC52YWwodmFsdWUpXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENoZWNrIGlmIGRhdGUgaXMgYmV0d2VlbiBtaW5EYXRlIGFuZCBtYXhEYXRlXG4gICAgICAgICAqIEBwYXJhbSBkYXRlIHtvYmplY3R9IC0gZGF0ZSBvYmplY3RcbiAgICAgICAgICogQHBhcmFtIHR5cGUge3N0cmluZ30gLSBjZWxsIHR5cGVcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfaXNJblJhbmdlOiBmdW5jdGlvbiAoZGF0ZSwgdHlwZSkge1xuICAgICAgICAgICAgdmFyIHRpbWUgPSBkYXRlLmdldFRpbWUoKSxcbiAgICAgICAgICAgICAgICBkID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKGRhdGUpLFxuICAgICAgICAgICAgICAgIG1pbiA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZSh0aGlzLm1pbkRhdGUpLFxuICAgICAgICAgICAgICAgIG1heCA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZSh0aGlzLm1heERhdGUpLFxuICAgICAgICAgICAgICAgIGRNaW5UaW1lID0gbmV3IERhdGUoZC55ZWFyLCBkLm1vbnRoLCBtaW4uZGF0ZSkuZ2V0VGltZSgpLFxuICAgICAgICAgICAgICAgIGRNYXhUaW1lID0gbmV3IERhdGUoZC55ZWFyLCBkLm1vbnRoLCBtYXguZGF0ZSkuZ2V0VGltZSgpLFxuICAgICAgICAgICAgICAgIHR5cGVzID0ge1xuICAgICAgICAgICAgICAgICAgICBkYXk6IHRpbWUgPj0gdGhpcy5taW5UaW1lICYmIHRpbWUgPD0gdGhpcy5tYXhUaW1lLFxuICAgICAgICAgICAgICAgICAgICBtb250aDogZE1pblRpbWUgPj0gdGhpcy5taW5UaW1lICYmIGRNYXhUaW1lIDw9IHRoaXMubWF4VGltZSxcbiAgICAgICAgICAgICAgICAgICAgeWVhcjogZC55ZWFyID49IG1pbi55ZWFyICYmIGQueWVhciA8PSBtYXgueWVhclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gdHlwZSA/IHR5cGVzW3R5cGVdIDogdHlwZXMuZGF5XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldERpbWVuc2lvbnM6IGZ1bmN0aW9uICgkZWwpIHtcbiAgICAgICAgICAgIHZhciBvZmZzZXQgPSAkZWwub2Zmc2V0KCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgd2lkdGg6ICRlbC5vdXRlcldpZHRoKCksXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAkZWwub3V0ZXJIZWlnaHQoKSxcbiAgICAgICAgICAgICAgICBsZWZ0OiBvZmZzZXQubGVmdCxcbiAgICAgICAgICAgICAgICB0b3A6IG9mZnNldC50b3BcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0RGF0ZUZyb21DZWxsOiBmdW5jdGlvbiAoY2VsbCkge1xuICAgICAgICAgICAgdmFyIGN1ckRhdGUgPSB0aGlzLnBhcnNlZERhdGUsXG4gICAgICAgICAgICAgICAgeWVhciA9IGNlbGwuZGF0YSgneWVhcicpIHx8IGN1ckRhdGUueWVhcixcbiAgICAgICAgICAgICAgICBtb250aCA9IGNlbGwuZGF0YSgnbW9udGgnKSA9PSB1bmRlZmluZWQgPyBjdXJEYXRlLm1vbnRoIDogY2VsbC5kYXRhKCdtb250aCcpLFxuICAgICAgICAgICAgICAgIGRhdGUgPSBjZWxsLmRhdGEoJ2RhdGUnKSB8fCAxO1xuXG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUoeWVhciwgbW9udGgsIGRhdGUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9zZXRQb3NpdGlvbkNsYXNzZXM6IGZ1bmN0aW9uIChwb3MpIHtcbiAgICAgICAgICAgIHBvcyA9IHBvcy5zcGxpdCgnICcpO1xuICAgICAgICAgICAgdmFyIG1haW4gPSBwb3NbMF0sXG4gICAgICAgICAgICAgICAgc2VjID0gcG9zWzFdLFxuICAgICAgICAgICAgICAgIGNsYXNzZXMgPSAnZGF0ZXBpY2tlciAtJyArIG1haW4gKyAnLScgKyBzZWMgKyAnLSAtZnJvbS0nICsgbWFpbiArICctJztcblxuICAgICAgICAgICAgaWYgKHRoaXMudmlzaWJsZSkgY2xhc3NlcyArPSAnIGFjdGl2ZSc7XG5cbiAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXJcbiAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cignY2xhc3MnKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcyhjbGFzc2VzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRQb3NpdGlvbjogZnVuY3Rpb24gKHBvc2l0aW9uKSB7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IHBvc2l0aW9uIHx8IHRoaXMub3B0cy5wb3NpdGlvbjtcblxuICAgICAgICAgICAgdmFyIGRpbXMgPSB0aGlzLl9nZXREaW1lbnNpb25zKHRoaXMuJGVsKSxcbiAgICAgICAgICAgICAgICBzZWxmRGltcyA9IHRoaXMuX2dldERpbWVuc2lvbnModGhpcy4kZGF0ZXBpY2tlciksXG4gICAgICAgICAgICAgICAgcG9zID0gcG9zaXRpb24uc3BsaXQoJyAnKSxcbiAgICAgICAgICAgICAgICB0b3AsIGxlZnQsXG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gdGhpcy5vcHRzLm9mZnNldCxcbiAgICAgICAgICAgICAgICBtYWluID0gcG9zWzBdLFxuICAgICAgICAgICAgICAgIHNlY29uZGFyeSA9IHBvc1sxXTtcblxuICAgICAgICAgICAgc3dpdGNoIChtYWluKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAndG9wJzpcbiAgICAgICAgICAgICAgICAgICAgdG9wID0gZGltcy50b3AgLSBzZWxmRGltcy5oZWlnaHQgLSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgICAgICAgICAgbGVmdCA9IGRpbXMubGVmdCArIGRpbXMud2lkdGggKyBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICAgICAgICAgICAgICAgIHRvcCA9IGRpbXMudG9wICsgZGltcy5oZWlnaHQgKyBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gZGltcy5sZWZ0IC0gc2VsZkRpbXMud2lkdGggLSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzd2l0Y2goc2Vjb25kYXJ5KSB7XG4gICAgICAgICAgICAgICAgY2FzZSAndG9wJzpcbiAgICAgICAgICAgICAgICAgICAgdG9wID0gZGltcy50b3A7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgICAgICAgICAgbGVmdCA9IGRpbXMubGVmdCArIGRpbXMud2lkdGggLSBzZWxmRGltcy53aWR0aDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnYm90dG9tJzpcbiAgICAgICAgICAgICAgICAgICAgdG9wID0gZGltcy50b3AgKyBkaW1zLmhlaWdodCAtIHNlbGZEaW1zLmhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICAgICAgICAgIGxlZnQgPSBkaW1zLmxlZnQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2NlbnRlcic6XG4gICAgICAgICAgICAgICAgICAgIGlmICgvbGVmdHxyaWdodC8udGVzdChtYWluKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9wID0gZGltcy50b3AgKyBkaW1zLmhlaWdodC8yIC0gc2VsZkRpbXMuaGVpZ2h0LzI7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gZGltcy5sZWZ0ICsgZGltcy53aWR0aC8yIC0gc2VsZkRpbXMud2lkdGgvMjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyXG4gICAgICAgICAgICAgICAgLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogdG9wXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLnNldFBvc2l0aW9uKHRoaXMub3B0cy5wb3NpdGlvbik7XG4gICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGlkZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlclxuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnYWN0aXZlJylcbiAgICAgICAgICAgICAgICAuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogJy0xMDAwMDBweCdcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5mb2N1c2VkID0gJyc7XG4gICAgICAgICAgICB0aGlzLmtleXMgPSBbXTtcblxuICAgICAgICAgICAgdGhpcy5pbkZvY3VzID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuJGVsLmJsdXIoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkb3duOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgdGhpcy5fY2hhbmdlVmlldyhkYXRlLCAnZG93bicpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHVwOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgdGhpcy5fY2hhbmdlVmlldyhkYXRlLCAndXAnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfY2hhbmdlVmlldzogZnVuY3Rpb24gKGRhdGUsIGRpcikge1xuICAgICAgICAgICAgZGF0ZSA9IGRhdGUgfHwgdGhpcy5mb2N1c2VkIHx8IHRoaXMuZGF0ZTtcblxuICAgICAgICAgICAgdmFyIG5leHRWaWV3ID0gZGlyID09ICd1cCcgPyB0aGlzLnZpZXdJbmRleCArIDEgOiB0aGlzLnZpZXdJbmRleCAtIDE7XG4gICAgICAgICAgICBpZiAobmV4dFZpZXcgPiAyKSBuZXh0VmlldyA9IDI7XG4gICAgICAgICAgICBpZiAobmV4dFZpZXcgPCAwKSBuZXh0VmlldyA9IDA7XG5cbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCAxKTtcbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnZpZXcgPSB0aGlzLnZpZXdJbmRleGVzW25leHRWaWV3XTtcblxuICAgICAgICB9LFxuXG4gICAgICAgIF9oYW5kbGVIb3RLZXk6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHZhciBkYXRlID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKHRoaXMuX2dldEZvY3VzZWREYXRlKCkpLFxuICAgICAgICAgICAgICAgIGZvY3VzZWRQYXJzZWQsXG4gICAgICAgICAgICAgICAgbyA9IHRoaXMub3B0cyxcbiAgICAgICAgICAgICAgICBuZXdEYXRlLFxuICAgICAgICAgICAgICAgIHRvdGFsRGF5c0luTmV4dE1vbnRoLFxuICAgICAgICAgICAgICAgIG1vbnRoQ2hhbmdlZCA9IGZhbHNlLFxuICAgICAgICAgICAgICAgIHllYXJDaGFuZ2VkID0gZmFsc2UsXG4gICAgICAgICAgICAgICAgZGVjYWRlQ2hhbmdlZCA9IGZhbHNlLFxuICAgICAgICAgICAgICAgIHkgPSBkYXRlLnllYXIsXG4gICAgICAgICAgICAgICAgbSA9IGRhdGUubW9udGgsXG4gICAgICAgICAgICAgICAgZCA9IGRhdGUuZGF0ZTtcblxuICAgICAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdjdHJsUmlnaHQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2N0cmxVcCc6XG4gICAgICAgICAgICAgICAgICAgIG0gKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgbW9udGhDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnY3RybExlZnQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2N0cmxEb3duJzpcbiAgICAgICAgICAgICAgICAgICAgbSAtPSAxO1xuICAgICAgICAgICAgICAgICAgICBtb250aENoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdzaGlmdFJpZ2h0JzpcbiAgICAgICAgICAgICAgICBjYXNlICdzaGlmdFVwJzpcbiAgICAgICAgICAgICAgICAgICAgeWVhckNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB5ICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3NoaWZ0TGVmdCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnc2hpZnREb3duJzpcbiAgICAgICAgICAgICAgICAgICAgeWVhckNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB5IC09IDE7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2FsdFJpZ2h0JzpcbiAgICAgICAgICAgICAgICBjYXNlICdhbHRVcCc6XG4gICAgICAgICAgICAgICAgICAgIGRlY2FkZUNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB5ICs9IDEwO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdhbHRMZWZ0JzpcbiAgICAgICAgICAgICAgICBjYXNlICdhbHREb3duJzpcbiAgICAgICAgICAgICAgICAgICAgZGVjYWRlQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHkgLT0gMTA7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2N0cmxTaGlmdFVwJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cCgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdG90YWxEYXlzSW5OZXh0TW9udGggPSBkYXRlcGlja2VyLmdldERheXNDb3VudChuZXcgRGF0ZSh5LG0pKTtcbiAgICAgICAgICAgIG5ld0RhdGUgPSBuZXcgRGF0ZSh5LG0sZCk7XG5cbiAgICAgICAgICAgIC8vIElmIG5leHQgbW9udGggaGFzIGxlc3MgZGF5cyB0aGFuIGN1cnJlbnQsIHNldCBkYXRlIHRvIHRvdGFsIGRheXMgaW4gdGhhdCBtb250aFxuICAgICAgICAgICAgaWYgKHRvdGFsRGF5c0luTmV4dE1vbnRoIDwgZCkgZCA9IHRvdGFsRGF5c0luTmV4dE1vbnRoO1xuXG4gICAgICAgICAgICAvLyBDaGVjayBpZiBuZXdEYXRlIGlzIGluIHZhbGlkIHJhbmdlXG4gICAgICAgICAgICBpZiAobmV3RGF0ZS5nZXRUaW1lKCkgPCB0aGlzLm1pblRpbWUpIHtcbiAgICAgICAgICAgICAgICBuZXdEYXRlID0gdGhpcy5taW5EYXRlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdEYXRlLmdldFRpbWUoKSA+IHRoaXMubWF4VGltZSkge1xuICAgICAgICAgICAgICAgIG5ld0RhdGUgPSB0aGlzLm1heERhdGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuZm9jdXNlZCA9IG5ld0RhdGU7XG5cbiAgICAgICAgICAgIGZvY3VzZWRQYXJzZWQgPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUobmV3RGF0ZSk7XG4gICAgICAgICAgICBpZiAobW9udGhDaGFuZ2VkICYmIG8ub25DaGFuZ2VNb250aCkge1xuICAgICAgICAgICAgICAgIG8ub25DaGFuZ2VNb250aChmb2N1c2VkUGFyc2VkLm1vbnRoLCBmb2N1c2VkUGFyc2VkLnllYXIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoeWVhckNoYW5nZWQgJiYgby5vbkNoYW5nZVllYXIpIHtcbiAgICAgICAgICAgICAgICBvLm9uQ2hhbmdlWWVhcihmb2N1c2VkUGFyc2VkLnllYXIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGVjYWRlQ2hhbmdlZCAmJiBvLm9uQ2hhbmdlRGVjYWRlKSB7XG4gICAgICAgICAgICAgICAgby5vbkNoYW5nZURlY2FkZSh0aGlzLmN1ckRlY2FkZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfcmVnaXN0ZXJLZXk6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHZhciBleGlzdHMgPSB0aGlzLmtleXMuc29tZShmdW5jdGlvbiAoY3VyS2V5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cktleSA9PSBrZXk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKCFleGlzdHMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmtleXMucHVzaChrZXkpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3VuUmVnaXN0ZXJLZXk6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMua2V5cy5pbmRleE9mKGtleSk7XG5cbiAgICAgICAgICAgIHRoaXMua2V5cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9pc0hvdEtleVByZXNzZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50SG90S2V5LFxuICAgICAgICAgICAgICAgIGZvdW5kID0gZmFsc2UsXG4gICAgICAgICAgICAgICAgX3RoaXMgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHByZXNzZWRLZXlzID0gdGhpcy5rZXlzLnNvcnQoKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaG90S2V5IGluIGhvdEtleXMpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50SG90S2V5ID0gaG90S2V5c1tob3RLZXldO1xuICAgICAgICAgICAgICAgIGlmIChwcmVzc2VkS2V5cy5sZW5ndGggIT0gY3VycmVudEhvdEtleS5sZW5ndGgpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRIb3RLZXkuZXZlcnkoZnVuY3Rpb24gKGtleSwgaSkgeyByZXR1cm4ga2V5ID09IHByZXNzZWRLZXlzW2ldfSkpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuX3RyaWdnZXIoJ2hvdEtleScsIGhvdEtleSk7XG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmb3VuZDtcbiAgICAgICAgfSxcblxuICAgICAgICBfdHJpZ2dlcjogZnVuY3Rpb24gKGV2ZW50LCBhcmdzKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC50cmlnZ2VyKGV2ZW50LCBhcmdzKVxuICAgICAgICB9LFxuXG4gICAgICAgIF9mb2N1c05leHRDZWxsOiBmdW5jdGlvbiAoa2V5Q29kZSwgdHlwZSkge1xuICAgICAgICAgICAgdHlwZSA9IHR5cGUgfHwgdGhpcy5jZWxsVHlwZTtcblxuICAgICAgICAgICAgdmFyIGRhdGUgPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUodGhpcy5fZ2V0Rm9jdXNlZERhdGUoKSksXG4gICAgICAgICAgICAgICAgeSA9IGRhdGUueWVhcixcbiAgICAgICAgICAgICAgICBtID0gZGF0ZS5tb250aCxcbiAgICAgICAgICAgICAgICBkID0gZGF0ZS5kYXRlO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5faXNIb3RLZXlQcmVzc2VkKCkpe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3dpdGNoKGtleUNvZGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDM3OiAvLyBsZWZ0XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ2RheScgPyAoZCAtPSAxKSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICdtb250aCcgPyAobSAtPSAxKSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICd5ZWFyJyA/ICh5IC09IDEpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMzg6IC8vIHVwXG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ2RheScgPyAoZCAtPSA3KSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICdtb250aCcgPyAobSAtPSAzKSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICd5ZWFyJyA/ICh5IC09IDQpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMzk6IC8vIHJpZ2h0XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ2RheScgPyAoZCArPSAxKSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICdtb250aCcgPyAobSArPSAxKSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICd5ZWFyJyA/ICh5ICs9IDEpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNDA6IC8vIGRvd25cbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAnZGF5JyA/IChkICs9IDcpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ21vbnRoJyA/IChtICs9IDMpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ3llYXInID8gKHkgKz0gNCkgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBuZCA9IG5ldyBEYXRlKHksbSxkKTtcbiAgICAgICAgICAgIGlmIChuZC5nZXRUaW1lKCkgPCB0aGlzLm1pblRpbWUpIHtcbiAgICAgICAgICAgICAgICBuZCA9IHRoaXMubWluRGF0ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmQuZ2V0VGltZSgpID4gdGhpcy5tYXhUaW1lKSB7XG4gICAgICAgICAgICAgICAgbmQgPSB0aGlzLm1heERhdGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuZm9jdXNlZCA9IG5kO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldEZvY3VzZWREYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZm9jdXNlZCAgPSB0aGlzLmZvY3VzZWQgfHwgdGhpcy5zZWxlY3RlZERhdGVzW3RoaXMuc2VsZWN0ZWREYXRlcy5sZW5ndGggLSAxXSxcbiAgICAgICAgICAgICAgICBkID0gdGhpcy5wYXJzZWREYXRlO1xuXG4gICAgICAgICAgICBpZiAoIWZvY3VzZWQpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMudmlldykge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdkYXlzJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzZWQgPSBuZXcgRGF0ZShkLnllYXIsIGQubW9udGgsIG5ldyBEYXRlKCkuZ2V0RGF0ZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdtb250aHMnOlxuICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXNlZCA9IG5ldyBEYXRlKGQueWVhciwgZC5tb250aCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAneWVhcnMnOlxuICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXNlZCA9IG5ldyBEYXRlKGQueWVhciwgMCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmb2N1c2VkO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRDZWxsOiBmdW5jdGlvbiAoZGF0ZSwgdHlwZSkge1xuICAgICAgICAgICAgdHlwZSA9IHR5cGUgfHwgdGhpcy5jZWxsVHlwZTtcblxuICAgICAgICAgICAgdmFyIGQgPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUoZGF0ZSksXG4gICAgICAgICAgICAgICAgc2VsZWN0b3IgPSAnLmRhdGVwaWNrZXItLWNlbGxbZGF0YS15ZWFyPVwiJyArIGQueWVhciArICdcIl0nLFxuICAgICAgICAgICAgICAgICRjZWxsO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdtb250aCc6XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gJ1tkYXRhLW1vbnRoPVwiJyArIGQubW9udGggKyAnXCJdJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnZGF5JzpcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IgKz0gJ1tkYXRhLW1vbnRoPVwiJyArIGQubW9udGggKyAnXCJdW2RhdGEtZGF0ZT1cIicgKyBkLmRhdGUgKyAnXCJdJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkY2VsbCA9IHRoaXMudmlld3NbdGhpcy5jdXJyZW50Vmlld10uJGVsLmZpbmQoc2VsZWN0b3IpO1xuXG4gICAgICAgICAgICByZXR1cm4gJGNlbGwubGVuZ3RoID8gJGNlbGwgOiAnJztcbiAgICAgICAgfSxcblxuICAgICAgICBkZXN0cm95OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgX3RoaXMuJGVsXG4gICAgICAgICAgICAgICAgLm9mZignLmFkcCcpXG4gICAgICAgICAgICAgICAgLmRhdGEoJ2RhdGVwaWNrZXInLCAnJyk7XG5cbiAgICAgICAgICAgIF90aGlzLnNlbGVjdGVkRGF0ZXMgPSBbXTtcbiAgICAgICAgICAgIF90aGlzLmZvY3VzZWQgPSAnJztcbiAgICAgICAgICAgIF90aGlzLnZpZXdzID0ge307XG4gICAgICAgICAgICBfdGhpcy5rZXlzID0gW107XG4gICAgICAgICAgICBfdGhpcy5taW5SYW5nZSA9ICcnO1xuICAgICAgICAgICAgX3RoaXMubWF4UmFuZ2UgPSAnJztcblxuICAgICAgICAgICAgaWYgKF90aGlzLm9wdHMuaW5saW5lIHx8ICFfdGhpcy5lbElzSW5wdXQpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy4kZGF0ZXBpY2tlci5jbG9zZXN0KCcuZGF0ZXBpY2tlci1pbmxpbmUnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuJGRhdGVwaWNrZXIucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uU2hvd0V2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9vbkJsdXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5pbkZvY3VzICYmIHRoaXMudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9vbk1vdXNlRG93bkRhdGVwaWNrZXI6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB0aGlzLmluRm9jdXMgPSB0cnVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9vbk1vdXNlVXBEYXRlcGlja2VyOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdGhpcy5pbkZvY3VzID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLiRlbC5mb2N1cygpXG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uSW5wdXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB2YWwgPSB0aGlzLiRlbC52YWwoKTtcblxuICAgICAgICAgICAgaWYgKCF2YWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uUmVzaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9vbktleURvd246IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgY29kZSA9IGUud2hpY2g7XG4gICAgICAgICAgICB0aGlzLl9yZWdpc3RlcktleShjb2RlKTtcblxuICAgICAgICAgICAgLy8gQXJyb3dzXG4gICAgICAgICAgICBpZiAoY29kZSA+PSAzNyAmJiBjb2RlIDw9IDQwKSB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2ZvY3VzTmV4dENlbGwoY29kZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEVudGVyXG4gICAgICAgICAgICBpZiAoY29kZSA9PSAxMykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZvY3VzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2dldENlbGwodGhpcy5mb2N1c2VkKS5oYXNDbGFzcygnLWRpc2FibGVkLScpKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnZpZXcgIT0gdGhpcy5vcHRzLm1pblZpZXcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZG93bigpXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWxyZWFkeVNlbGVjdGVkID0gdGhpcy5faXNTZWxlY3RlZCh0aGlzLmZvY3VzZWQsIHRoaXMuY2VsbFR5cGUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWFscmVhZHlTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0RGF0ZSh0aGlzLmZvY3VzZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhbHJlYWR5U2VsZWN0ZWQgJiYgdGhpcy5vcHRzLnRvZ2dsZVNlbGVjdGVkKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZURhdGUodGhpcy5mb2N1c2VkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRXNjXG4gICAgICAgICAgICBpZiAoY29kZSA9PSAyNykge1xuICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9vbktleVVwOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyIGNvZGUgPSBlLndoaWNoO1xuICAgICAgICAgICAgdGhpcy5fdW5SZWdpc3RlcktleShjb2RlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfb25Ib3RLZXk6IGZ1bmN0aW9uIChlLCBob3RLZXkpIHtcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZUhvdEtleShob3RLZXkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9vbk1vdXNlRW50ZXJDZWxsOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyICRjZWxsID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLmRhdGVwaWNrZXItLWNlbGwnKSxcbiAgICAgICAgICAgICAgICBkYXRlID0gdGhpcy5fZ2V0RGF0ZUZyb21DZWxsKCRjZWxsKTtcblxuICAgICAgICAgICAgLy8gUHJldmVudCBmcm9tIHVubmVjZXNzYXJ5IHJlbmRlcmluZyBhbmQgc2V0dGluZyBuZXcgY3VycmVudERhdGVcbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuZm9jdXNlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZm9jdXNlZCA9ICcnXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICRjZWxsLmFkZENsYXNzKCctZm9jdXMtJyk7XG5cbiAgICAgICAgICAgIHRoaXMuZm9jdXNlZCA9IGRhdGU7XG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IGZhbHNlO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLnJhbmdlICYmIHRoaXMuc2VsZWN0ZWREYXRlcy5sZW5ndGggPT0gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMubWluUmFuZ2UgPSB0aGlzLnNlbGVjdGVkRGF0ZXNbMF07XG4gICAgICAgICAgICAgICAgdGhpcy5tYXhSYW5nZSA9ICcnO1xuICAgICAgICAgICAgICAgIGlmIChkYXRlcGlja2VyLmxlc3ModGhpcy5taW5SYW5nZSwgdGhpcy5mb2N1c2VkKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1heFJhbmdlID0gdGhpcy5taW5SYW5nZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5taW5SYW5nZSA9ICcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdzW3RoaXMuY3VycmVudFZpZXddLl91cGRhdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfb25Nb3VzZUxlYXZlQ2VsbDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciAkY2VsbCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5kYXRlcGlja2VyLS1jZWxsJyk7XG5cbiAgICAgICAgICAgICRjZWxsLnJlbW92ZUNsYXNzKCctZm9jdXMtJyk7XG5cbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuZm9jdXNlZCA9ICcnO1xuICAgICAgICAgICAgdGhpcy5zaWxlbnQgPSBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXQgZm9jdXNlZCh2YWwpIHtcbiAgICAgICAgICAgIGlmICghdmFsICYmIHRoaXMuZm9jdXNlZCkge1xuICAgICAgICAgICAgICAgIHZhciAkY2VsbCA9IHRoaXMuX2dldENlbGwodGhpcy5mb2N1c2VkKTtcblxuICAgICAgICAgICAgICAgIGlmICgkY2VsbC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgJGNlbGwucmVtb3ZlQ2xhc3MoJy1mb2N1cy0nKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2ZvY3VzZWQgPSB2YWw7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLnJhbmdlICYmIHRoaXMuc2VsZWN0ZWREYXRlcy5sZW5ndGggPT0gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMubWluUmFuZ2UgPSB0aGlzLnNlbGVjdGVkRGF0ZXNbMF07XG4gICAgICAgICAgICAgICAgdGhpcy5tYXhSYW5nZSA9ICcnO1xuICAgICAgICAgICAgICAgIGlmIChkYXRlcGlja2VyLmxlc3ModGhpcy5taW5SYW5nZSwgdGhpcy5fZm9jdXNlZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXhSYW5nZSA9IHRoaXMubWluUmFuZ2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWluUmFuZ2UgPSAnJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5zaWxlbnQpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHZhbDtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXQgZm9jdXNlZCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9mb2N1c2VkO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldCBwYXJzZWREYXRlKCkge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZSh0aGlzLmRhdGUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldCBkYXRlICh2YWwpIHtcbiAgICAgICAgICAgIGlmICghKHZhbCBpbnN0YW5jZW9mIERhdGUpKSByZXR1cm47XG5cbiAgICAgICAgICAgIHRoaXMuY3VycmVudERhdGUgPSB2YWw7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmluaXRlZCAmJiAhdGhpcy5zaWxlbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdzW3RoaXMudmlld10uX3JlbmRlcigpO1xuICAgICAgICAgICAgICAgIHRoaXMubmF2Ll9yZW5kZXIoKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy52aXNpYmxlICYmIHRoaXMuZWxJc0lucHV0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb24oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdmFsO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldCBkYXRlICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnREYXRlXG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0IHZpZXcgKHZhbCkge1xuICAgICAgICAgICAgdGhpcy52aWV3SW5kZXggPSB0aGlzLnZpZXdJbmRleGVzLmluZGV4T2YodmFsKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMudmlld0luZGV4IDwgMCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5wcmV2VmlldyA9IHRoaXMuY3VycmVudFZpZXc7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gdmFsO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5pbml0ZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMudmlld3NbdmFsXSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXdzW3ZhbF0gPSBuZXcgRGF0ZXBpY2tlci5Cb2R5KHRoaXMsIHZhbCwgdGhpcy5vcHRzKVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlld3NbdmFsXS5fcmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy52aWV3c1t0aGlzLnByZXZWaWV3XS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy52aWV3c1t2YWxdLnNob3coKTtcbiAgICAgICAgICAgICAgICB0aGlzLm5hdi5fcmVuZGVyKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRzLm9uQ2hhbmdlVmlldykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdHMub25DaGFuZ2VWaWV3KHZhbClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZWxJc0lucHV0ICYmIHRoaXMudmlzaWJsZSkgdGhpcy5zZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdmFsXG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0IHZpZXcoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50VmlldztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXQgY2VsbFR5cGUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy52aWV3LnN1YnN0cmluZygwLCB0aGlzLnZpZXcubGVuZ3RoIC0gMSlcbiAgICAgICAgfSxcblxuICAgICAgICBnZXQgbWluVGltZSgpIHtcbiAgICAgICAgICAgIHZhciBtaW4gPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUodGhpcy5taW5EYXRlKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZShtaW4ueWVhciwgbWluLm1vbnRoLCBtaW4uZGF0ZSkuZ2V0VGltZSgpXG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0IG1heFRpbWUoKSB7XG4gICAgICAgICAgICB2YXIgbWF4ID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKHRoaXMubWF4RGF0ZSk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUobWF4LnllYXIsIG1heC5tb250aCwgbWF4LmRhdGUpLmdldFRpbWUoKVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldCBjdXJEZWNhZGUoKSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0ZXBpY2tlci5nZXREZWNhZGUodGhpcy5kYXRlKVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vICBVdGlsc1xuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIGRhdGVwaWNrZXIuZ2V0RGF5c0NvdW50ID0gZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpICsgMSwgMCkuZ2V0RGF0ZSgpO1xuICAgIH07XG5cbiAgICBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUgPSBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeWVhcjogZGF0ZS5nZXRGdWxsWWVhcigpLFxuICAgICAgICAgICAgbW9udGg6IGRhdGUuZ2V0TW9udGgoKSxcbiAgICAgICAgICAgIGZ1bGxNb250aDogKGRhdGUuZ2V0TW9udGgoKSArIDEpIDwgMTAgPyAnMCcgKyAoZGF0ZS5nZXRNb250aCgpICsgMSkgOiBkYXRlLmdldE1vbnRoKCkgKyAxLCAvLyBPbmUgYmFzZWRcbiAgICAgICAgICAgIGRhdGU6IGRhdGUuZ2V0RGF0ZSgpLFxuICAgICAgICAgICAgZnVsbERhdGU6IGRhdGUuZ2V0RGF0ZSgpIDwgMTAgPyAnMCcgKyBkYXRlLmdldERhdGUoKSA6IGRhdGUuZ2V0RGF0ZSgpLFxuICAgICAgICAgICAgZGF5OiBkYXRlLmdldERheSgpXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZGF0ZXBpY2tlci5nZXREZWNhZGUgPSBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICB2YXIgZmlyc3RZZWFyID0gTWF0aC5mbG9vcihkYXRlLmdldEZ1bGxZZWFyKCkgLyAxMCkgKiAxMDtcblxuICAgICAgICByZXR1cm4gW2ZpcnN0WWVhciwgZmlyc3RZZWFyICsgOV07XG4gICAgfTtcblxuICAgIGRhdGVwaWNrZXIudGVtcGxhdGUgPSBmdW5jdGlvbiAoc3RyLCBkYXRhKSB7XG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZSgvI1xceyhbXFx3XSspXFx9L2csIGZ1bmN0aW9uIChzb3VyY2UsIG1hdGNoKSB7XG4gICAgICAgICAgICBpZiAoZGF0YVttYXRjaF0gfHwgZGF0YVttYXRjaF0gPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0YVttYXRjaF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGRhdGVwaWNrZXIuaXNTYW1lID0gZnVuY3Rpb24gKGRhdGUxLCBkYXRlMiwgdHlwZSkge1xuICAgICAgICBpZiAoIWRhdGUxIHx8ICFkYXRlMikgcmV0dXJuIGZhbHNlO1xuICAgICAgICB2YXIgZDEgPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUoZGF0ZTEpLFxuICAgICAgICAgICAgZDIgPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUoZGF0ZTIpLFxuICAgICAgICAgICAgX3R5cGUgPSB0eXBlID8gdHlwZSA6ICdkYXknLFxuXG4gICAgICAgICAgICBjb25kaXRpb25zID0ge1xuICAgICAgICAgICAgICAgIGRheTogZDEuZGF0ZSA9PSBkMi5kYXRlICYmIGQxLm1vbnRoID09IGQyLm1vbnRoICYmIGQxLnllYXIgPT0gZDIueWVhcixcbiAgICAgICAgICAgICAgICBtb250aDogZDEubW9udGggPT0gZDIubW9udGggJiYgZDEueWVhciA9PSBkMi55ZWFyLFxuICAgICAgICAgICAgICAgIHllYXI6IGQxLnllYXIgPT0gZDIueWVhclxuICAgICAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gY29uZGl0aW9uc1tfdHlwZV07XG4gICAgfTtcblxuICAgIGRhdGVwaWNrZXIubGVzcyA9IGZ1bmN0aW9uIChkYXRlQ29tcGFyZVRvLCBkYXRlLCB0eXBlKSB7XG4gICAgICAgIGlmICghZGF0ZUNvbXBhcmVUbyB8fCAhZGF0ZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gZGF0ZS5nZXRUaW1lKCkgPCBkYXRlQ29tcGFyZVRvLmdldFRpbWUoKTtcbiAgICB9O1xuXG4gICAgZGF0ZXBpY2tlci5iaWdnZXIgPSBmdW5jdGlvbiAoZGF0ZUNvbXBhcmVUbywgZGF0ZSwgdHlwZSkge1xuICAgICAgICBpZiAoIWRhdGVDb21wYXJlVG8gfHwgIWRhdGUpIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIGRhdGUuZ2V0VGltZSgpID4gZGF0ZUNvbXBhcmVUby5nZXRUaW1lKCk7XG4gICAgfTtcblxuICAgIERhdGVwaWNrZXIubGFuZ3VhZ2UgPSB7XG4gICAgICAgIHJ1OiB7XG4gICAgICAgICAgICBkYXlzOiBbJ9CS0L7RgdC60YDQtdGB0LXQvdGM0LUnLCAn0J/QvtC90LXQtNC10LvRjNC90LjQuicsICfQktGC0L7RgNC90LjQuicsICfQodGA0LXQtNCwJywgJ9Cn0LXRgtCy0LXRgNCzJywgJ9Cf0Y/RgtC90LjRhtCwJywgJ9Ch0YPQsdCx0L7RgtCwJ10sXG4gICAgICAgICAgICBkYXlzU2hvcnQ6IFsn0JLQvtGBJywn0J/QvtC9Jywn0JLRgtC+Jywn0KHRgNC1Jywn0KfQtdGCJywn0J/Rj9GCJywn0KHRg9CxJ10sXG4gICAgICAgICAgICBkYXlzTWluOiBbJ9CS0YEnLCfQn9C9Jywn0JLRgicsJ9Ch0YAnLCfQp9GCJywn0J/RgicsJ9Ch0LEnXSxcbiAgICAgICAgICAgIG1vbnRoczogWyfQr9C90LLQsNGA0YwnLCAn0KTQtdCy0YDQsNC70YwnLCAn0JzQsNGA0YInLCAn0JDQv9GA0LXQu9GMJywgJ9Cc0LDQuScsICfQmNGO0L3RjCcsICfQmNGO0LvRjCcsICfQkNCy0LPRg9GB0YInLCAn0KHQtdC90YLRj9Cx0YDRjCcsICfQntC60YLRj9Cx0YDRjCcsICfQndC+0Y/QsdGA0YwnLCAn0JTQtdC60LDQsdGA0YwnXSxcbiAgICAgICAgICAgIG1vbnRoc1Nob3J0OiBbJ9Cv0L3QsicsICfQpNC10LInLCAn0JzQsNGAJywgJ9CQ0L/RgCcsICfQnNCw0LknLCAn0JjRjtC9JywgJ9CY0Y7QuycsICfQkNCy0LMnLCAn0KHQtdC9JywgJ9Ce0LrRgicsICfQndC+0Y8nLCAn0JTQtdC6J10sXG4gICAgICAgICAgICB0b2RheTogJ9Ch0LXQs9C+0LTQvdGPJyxcbiAgICAgICAgICAgIGNsZWFyOiAn0J7Rh9C40YHRgtC40YLRjCcsXG4gICAgICAgICAgICBkYXRlRm9ybWF0OiAnZGQubW0ueXl5eScsXG4gICAgICAgICAgICBmaXJzdERheTogMVxuICAgICAgICB9XG4gICAgfTtcblxuICAgICQuZm5bcGx1Z2luTmFtZV0gPSBmdW5jdGlvbiAoIG9wdGlvbnMgKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCEkLmRhdGEodGhpcywgcGx1Z2luTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAkLmRhdGEodGhpcywgIHBsdWdpbk5hbWUsXG4gICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlcGlja2VyKCB0aGlzLCBvcHRpb25zICkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSAkLmRhdGEodGhpcywgcGx1Z2luTmFtZSk7XG5cbiAgICAgICAgICAgICAgICBfdGhpcy5vcHRzID0gJC5leHRlbmQodHJ1ZSwgX3RoaXMub3B0cywgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgX3RoaXMudXBkYXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJChhdXRvSW5pdFNlbGVjdG9yKS5kYXRlcGlja2VyKCk7XG4gICAgfSlcblxufSkod2luZG93LCBqUXVlcnkpO1xuOyhmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRlbXBsYXRlcyA9IHtcbiAgICAgICAgZGF5czonJyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tZGF5cyBkYXRlcGlja2VyLS1ib2R5XCI+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tZGF5cy1uYW1lc1wiPjwvZGl2PicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLWNlbGxzIGRhdGVwaWNrZXItLWNlbGxzLWRheXNcIj48L2Rpdj4nICtcbiAgICAgICAgJzwvZGl2PicsXG4gICAgICAgIG1vbnRoczogJycgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLW1vbnRocyBkYXRlcGlja2VyLS1ib2R5XCI+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tY2VsbHMgZGF0ZXBpY2tlci0tY2VsbHMtbW9udGhzXCI+PC9kaXY+JyArXG4gICAgICAgICc8L2Rpdj4nLFxuICAgICAgICB5ZWFyczogJycgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLXllYXJzIGRhdGVwaWNrZXItLWJvZHlcIj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1jZWxscyBkYXRlcGlja2VyLS1jZWxscy15ZWFyc1wiPjwvZGl2PicgK1xuICAgICAgICAnPC9kaXY+J1xuICAgICAgICB9LFxuICAgICAgICBEID0gRGF0ZXBpY2tlcjtcblxuICAgIEQuQm9keSA9IGZ1bmN0aW9uIChkLCB0eXBlLCBvcHRzKSB7XG4gICAgICAgIHRoaXMuZCA9IGQ7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgIHRoaXMub3B0cyA9IG9wdHM7XG5cbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfTtcblxuICAgIEQuQm9keS5wcm90b3R5cGUgPSB7XG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuX2J1aWxkQmFzZUh0bWwoKTtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcigpO1xuXG4gICAgICAgICAgICB0aGlzLl9iaW5kRXZlbnRzKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2JpbmRFdmVudHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLm9uKCdjbGljaycsICcuZGF0ZXBpY2tlci0tY2VsbCcsICQucHJveHkodGhpcy5fb25DbGlja0NlbGwsIHRoaXMpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfYnVpbGRCYXNlSHRtbDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwgPSAkKHRlbXBsYXRlc1t0aGlzLnR5cGVdKS5hcHBlbmRUbyh0aGlzLmQuJGNvbnRlbnQpO1xuICAgICAgICAgICAgdGhpcy4kbmFtZXMgPSAkKCcuZGF0ZXBpY2tlci0tZGF5cy1uYW1lcycsIHRoaXMuJGVsKTtcbiAgICAgICAgICAgIHRoaXMuJGNlbGxzID0gJCgnLmRhdGVwaWNrZXItLWNlbGxzJywgdGhpcy4kZWwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXREYXlOYW1lc0h0bWw6IGZ1bmN0aW9uIChmaXJzdERheSwgY3VyRGF5LCBodG1sLCBpKSB7XG4gICAgICAgICAgICBjdXJEYXkgPSBjdXJEYXkgIT0gdW5kZWZpbmVkID8gY3VyRGF5IDogZmlyc3REYXk7XG4gICAgICAgICAgICBodG1sID0gaHRtbCA/IGh0bWwgOiAnJztcbiAgICAgICAgICAgIGkgPSBpICE9IHVuZGVmaW5lZCA/IGkgOiAwO1xuXG4gICAgICAgICAgICBpZiAoaSA+IDcpIHJldHVybiBodG1sO1xuICAgICAgICAgICAgaWYgKGN1ckRheSA9PSA3KSByZXR1cm4gdGhpcy5fZ2V0RGF5TmFtZXNIdG1sKGZpcnN0RGF5LCAwLCBodG1sLCArK2kpO1xuXG4gICAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tZGF5LW5hbWUnICsgKHRoaXMuZC5pc1dlZWtlbmQoY3VyRGF5KSA/IFwiIC13ZWVrZW5kLVwiIDogXCJcIikgKyAnXCI+JyArIHRoaXMuZC5sb2MuZGF5c01pbltjdXJEYXldICsgJzwvZGl2Pic7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXREYXlOYW1lc0h0bWwoZmlyc3REYXksICsrY3VyRGF5LCBodG1sLCArK2kpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRDZWxsQ29udGVudHM6IGZ1bmN0aW9uIChkYXRlLCB0eXBlKSB7XG4gICAgICAgICAgICB2YXIgY2xhc3NlcyA9IFwiZGF0ZXBpY2tlci0tY2VsbCBkYXRlcGlja2VyLS1jZWxsLVwiICsgdHlwZSxcbiAgICAgICAgICAgICAgICBjdXJyZW50RGF0ZSA9IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgcGFyZW50ID0gdGhpcy5kLFxuICAgICAgICAgICAgICAgIG9wdHMgPSBwYXJlbnQub3B0cyxcbiAgICAgICAgICAgICAgICBkID0gRC5nZXRQYXJzZWREYXRlKGRhdGUpLFxuICAgICAgICAgICAgICAgIHJlbmRlciA9IHt9LFxuICAgICAgICAgICAgICAgIGh0bWwgPSBkLmRhdGU7XG5cbiAgICAgICAgICAgIGlmIChvcHRzLm9uUmVuZGVyQ2VsbCkge1xuICAgICAgICAgICAgICAgIHJlbmRlciA9IG9wdHMub25SZW5kZXJDZWxsKGRhdGUsIHR5cGUpIHx8IHt9O1xuICAgICAgICAgICAgICAgIGh0bWwgPSByZW5kZXIuaHRtbCA/IHJlbmRlci5odG1sIDogaHRtbDtcbiAgICAgICAgICAgICAgICBjbGFzc2VzICs9IHJlbmRlci5jbGFzc2VzID8gJyAnICsgcmVuZGVyLmNsYXNzZXMgOiAnJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnZGF5JzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmVudC5pc1dlZWtlbmQoZC5kYXkpKSBjbGFzc2VzICs9IFwiIC13ZWVrZW5kLVwiO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZC5tb250aCAhPSB0aGlzLmQucGFyc2VkRGF0ZS5tb250aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NlcyArPSBcIiAtb3RoZXItbW9udGgtXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW9wdHMuc2VsZWN0T3RoZXJNb250aHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzICs9IFwiIC1kaXNhYmxlZC1cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghb3B0cy5zaG93T3RoZXJNb250aHMpIGh0bWwgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdtb250aCc6XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgPSBwYXJlbnQubG9jW3BhcmVudC5vcHRzLm1vbnRoc0ZpZWxkXVtkLm1vbnRoXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAneWVhcic6XG4gICAgICAgICAgICAgICAgICAgIHZhciBkZWNhZGUgPSBwYXJlbnQuY3VyRGVjYWRlO1xuICAgICAgICAgICAgICAgICAgICBodG1sID0gZC55ZWFyO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZC55ZWFyIDwgZGVjYWRlWzBdIHx8IGQueWVhciA+IGRlY2FkZVsxXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NlcyArPSAnIC1vdGhlci1kZWNhZGUtJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghb3B0cy5zZWxlY3RPdGhlclllYXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NlcyArPSBcIiAtZGlzYWJsZWQtXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW9wdHMuc2hvd090aGVyWWVhcnMpIGh0bWwgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG9wdHMub25SZW5kZXJDZWxsKSB7XG4gICAgICAgICAgICAgICAgcmVuZGVyID0gb3B0cy5vblJlbmRlckNlbGwoZGF0ZSwgdHlwZSkgfHwge307XG4gICAgICAgICAgICAgICAgaHRtbCA9IHJlbmRlci5odG1sID8gcmVuZGVyLmh0bWwgOiBodG1sO1xuICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gcmVuZGVyLmNsYXNzZXMgPyAnICcgKyByZW5kZXIuY2xhc3NlcyA6ICcnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob3B0cy5yYW5nZSkge1xuICAgICAgICAgICAgICAgIGlmIChELmlzU2FtZShwYXJlbnQubWluUmFuZ2UsIGRhdGUsIHR5cGUpKSBjbGFzc2VzICs9ICcgLXJhbmdlLWZyb20tJztcbiAgICAgICAgICAgICAgICBpZiAoRC5pc1NhbWUocGFyZW50Lm1heFJhbmdlLCBkYXRlLCB0eXBlKSkgY2xhc3NlcyArPSAnIC1yYW5nZS10by0nO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudC5zZWxlY3RlZERhdGVzLmxlbmd0aCA9PSAxICYmIHBhcmVudC5mb2N1c2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIChELmJpZ2dlcihwYXJlbnQubWluUmFuZ2UsIGRhdGUpICYmIEQubGVzcyhwYXJlbnQuZm9jdXNlZCwgZGF0ZSkpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAoRC5sZXNzKHBhcmVudC5tYXhSYW5nZSwgZGF0ZSkgJiYgRC5iaWdnZXIocGFyZW50LmZvY3VzZWQsIGRhdGUpKSlcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NlcyArPSAnIC1pbi1yYW5nZS0nXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoRC5sZXNzKHBhcmVudC5tYXhSYW5nZSwgZGF0ZSkgJiYgRC5pc1NhbWUocGFyZW50LmZvY3VzZWQsIGRhdGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzICs9ICcgLXJhbmdlLWZyb20tJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChELmJpZ2dlcihwYXJlbnQubWluUmFuZ2UsIGRhdGUpICYmIEQuaXNTYW1lKHBhcmVudC5mb2N1c2VkLCBkYXRlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NlcyArPSAnIC1yYW5nZS10by0nXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyZW50LnNlbGVjdGVkRGF0ZXMubGVuZ3RoID09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKEQuYmlnZ2VyKHBhcmVudC5taW5SYW5nZSwgZGF0ZSkgJiYgRC5sZXNzKHBhcmVudC5tYXhSYW5nZSwgZGF0ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gJyAtaW4tcmFuZ2UtJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIGlmIChELmlzU2FtZShjdXJyZW50RGF0ZSwgZGF0ZSwgdHlwZSkpIGNsYXNzZXMgKz0gJyAtY3VycmVudC0nO1xuICAgICAgICAgICAgaWYgKHBhcmVudC5mb2N1c2VkICYmIEQuaXNTYW1lKGRhdGUsIHBhcmVudC5mb2N1c2VkLCB0eXBlKSkgY2xhc3NlcyArPSAnIC1mb2N1cy0nO1xuICAgICAgICAgICAgaWYgKHBhcmVudC5faXNTZWxlY3RlZChkYXRlLCB0eXBlKSkgY2xhc3NlcyArPSAnIC1zZWxlY3RlZC0nO1xuICAgICAgICAgICAgaWYgKCFwYXJlbnQuX2lzSW5SYW5nZShkYXRlLCB0eXBlKSB8fCByZW5kZXIuZGlzYWJsZWQpIGNsYXNzZXMgKz0gJyAtZGlzYWJsZWQtJztcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBodG1sOiBodG1sLFxuICAgICAgICAgICAgICAgIGNsYXNzZXM6IGNsYXNzZXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2FsY3VsYXRlcyBkYXlzIG51bWJlciB0byByZW5kZXIuIEdlbmVyYXRlcyBkYXlzIGh0bWwgYW5kIHJldHVybnMgaXQuXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkYXRlIC0gRGF0ZSBvYmplY3RcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9nZXREYXlzSHRtbDogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgICAgIHZhciB0b3RhbE1vbnRoRGF5cyA9IEQuZ2V0RGF5c0NvdW50KGRhdGUpLFxuICAgICAgICAgICAgICAgIGZpcnN0TW9udGhEYXkgPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSwgMSkuZ2V0RGF5KCksXG4gICAgICAgICAgICAgICAgbGFzdE1vbnRoRGF5ID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIHRvdGFsTW9udGhEYXlzKS5nZXREYXkoKSxcbiAgICAgICAgICAgICAgICBkYXlzRnJvbVBldk1vbnRoID0gZmlyc3RNb250aERheSAtIHRoaXMuZC5sb2MuZmlyc3REYXksXG4gICAgICAgICAgICAgICAgZGF5c0Zyb21OZXh0TW9udGggPSA2IC0gbGFzdE1vbnRoRGF5ICsgdGhpcy5kLmxvYy5maXJzdERheTtcblxuICAgICAgICAgICAgZGF5c0Zyb21QZXZNb250aCA9IGRheXNGcm9tUGV2TW9udGggPCAwID8gZGF5c0Zyb21QZXZNb250aCArIDcgOiBkYXlzRnJvbVBldk1vbnRoO1xuICAgICAgICAgICAgZGF5c0Zyb21OZXh0TW9udGggPSBkYXlzRnJvbU5leHRNb250aCA+IDYgPyBkYXlzRnJvbU5leHRNb250aCAtIDcgOiBkYXlzRnJvbU5leHRNb250aDtcblxuICAgICAgICAgICAgdmFyIHN0YXJ0RGF5SW5kZXggPSAtZGF5c0Zyb21QZXZNb250aCArIDEsXG4gICAgICAgICAgICAgICAgbSwgeSxcbiAgICAgICAgICAgICAgICBodG1sID0gJyc7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBzdGFydERheUluZGV4LCBtYXggPSB0b3RhbE1vbnRoRGF5cyArIGRheXNGcm9tTmV4dE1vbnRoOyBpIDw9IG1heDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgeSA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcbiAgICAgICAgICAgICAgICBtID0gZGF0ZS5nZXRNb250aCgpO1xuXG4gICAgICAgICAgICAgICAgaHRtbCArPSB0aGlzLl9nZXREYXlIdG1sKG5ldyBEYXRlKHksIG0sIGkpKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0RGF5SHRtbDogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgICAgdmFyIGNvbnRlbnQgPSB0aGlzLl9nZXRDZWxsQ29udGVudHMoZGF0ZSwgJ2RheScpO1xuXG4gICAgICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCInICsgY29udGVudC5jbGFzc2VzICsgJ1wiICcgK1xuICAgICAgICAgICAgICAgICdkYXRhLWRhdGU9XCInICsgZGF0ZS5nZXREYXRlKCkgKyAnXCIgJyArXG4gICAgICAgICAgICAgICAgJ2RhdGEtbW9udGg9XCInICsgZGF0ZS5nZXRNb250aCgpICsgJ1wiICcgK1xuICAgICAgICAgICAgICAgICdkYXRhLXllYXI9XCInICsgZGF0ZS5nZXRGdWxsWWVhcigpICsgJ1wiPicgKyBjb250ZW50Lmh0bWwgKyAnPC9kaXY+JztcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogR2VuZXJhdGVzIG1vbnRocyBodG1sXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkYXRlIC0gZGF0ZSBpbnN0YW5jZVxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX2dldE1vbnRoc0h0bWw6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgICAgICB2YXIgaHRtbCA9ICcnLFxuICAgICAgICAgICAgICAgIGQgPSBELmdldFBhcnNlZERhdGUoZGF0ZSksXG4gICAgICAgICAgICAgICAgaSA9IDA7XG5cbiAgICAgICAgICAgIHdoaWxlKGkgPCAxMikge1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gdGhpcy5fZ2V0TW9udGhIdG1sKG5ldyBEYXRlKGQueWVhciwgaSkpO1xuICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0TW9udGhIdG1sOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgdmFyIGNvbnRlbnQgPSB0aGlzLl9nZXRDZWxsQ29udGVudHMoZGF0ZSwgJ21vbnRoJyk7XG5cbiAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cIicgKyBjb250ZW50LmNsYXNzZXMgKyAnXCIgZGF0YS1tb250aD1cIicgKyBkYXRlLmdldE1vbnRoKCkgKyAnXCI+JyArIGNvbnRlbnQuaHRtbCArICc8L2Rpdj4nXG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldFllYXJzSHRtbDogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgICAgIHZhciBkID0gRC5nZXRQYXJzZWREYXRlKGRhdGUpLFxuICAgICAgICAgICAgICAgIGRlY2FkZSA9IEQuZ2V0RGVjYWRlKGRhdGUpLFxuICAgICAgICAgICAgICAgIGZpcnN0WWVhciA9IGRlY2FkZVswXSAtIDEsXG4gICAgICAgICAgICAgICAgaHRtbCA9ICcnLFxuICAgICAgICAgICAgICAgIGkgPSBmaXJzdFllYXI7XG5cbiAgICAgICAgICAgIGZvciAoaTsgaSA8PSBkZWNhZGVbMV0gKyAxOyBpKyspIHtcbiAgICAgICAgICAgICAgICBodG1sICs9IHRoaXMuX2dldFllYXJIdG1sKG5ldyBEYXRlKGkgLCAwKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBodG1sO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRZZWFySHRtbDogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gdGhpcy5fZ2V0Q2VsbENvbnRlbnRzKGRhdGUsICd5ZWFyJyk7XG5cbiAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cIicgKyBjb250ZW50LmNsYXNzZXMgKyAnXCIgZGF0YS15ZWFyPVwiJyArIGRhdGUuZ2V0RnVsbFllYXIoKSArICdcIj4nICsgY29udGVudC5odG1sICsgJzwvZGl2PidcbiAgICAgICAgfSxcblxuICAgICAgICBfcmVuZGVyVHlwZXM6IHtcbiAgICAgICAgICAgIGRheXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGF5TmFtZXMgPSB0aGlzLl9nZXREYXlOYW1lc0h0bWwodGhpcy5kLmxvYy5maXJzdERheSksXG4gICAgICAgICAgICAgICAgICAgIGRheXMgPSB0aGlzLl9nZXREYXlzSHRtbCh0aGlzLmQuY3VycmVudERhdGUpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy4kY2VsbHMuaHRtbChkYXlzKTtcbiAgICAgICAgICAgICAgICB0aGlzLiRuYW1lcy5odG1sKGRheU5hbWVzKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1vbnRoczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBodG1sID0gdGhpcy5fZ2V0TW9udGhzSHRtbCh0aGlzLmQuY3VycmVudERhdGUpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy4kY2VsbHMuaHRtbChodG1sKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHllYXJzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGh0bWwgPSB0aGlzLl9nZXRZZWFyc0h0bWwodGhpcy5kLmN1cnJlbnREYXRlKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuJGNlbGxzLmh0bWwoaHRtbClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJUeXBlc1t0aGlzLnR5cGVdLmJpbmQodGhpcykoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgJGNlbGxzID0gJCgnLmRhdGVwaWNrZXItLWNlbGwnLCB0aGlzLiRjZWxscyksXG4gICAgICAgICAgICAgICAgX3RoaXMgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGNsYXNzZXMsXG4gICAgICAgICAgICAgICAgJGNlbGwsXG4gICAgICAgICAgICAgICAgZGF0ZTtcbiAgICAgICAgICAgICRjZWxscy5lYWNoKGZ1bmN0aW9uIChjZWxsLCBpKSB7XG4gICAgICAgICAgICAgICAgJGNlbGwgPSAkKHRoaXMpO1xuICAgICAgICAgICAgICAgIGRhdGUgPSBfdGhpcy5kLl9nZXREYXRlRnJvbUNlbGwoJCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgY2xhc3NlcyA9IF90aGlzLl9nZXRDZWxsQ29udGVudHMoZGF0ZSwgX3RoaXMuZC5jZWxsVHlwZSk7XG4gICAgICAgICAgICAgICAgJGNlbGwuYXR0cignY2xhc3MnLGNsYXNzZXMuY2xhc3NlcylcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3c6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgIHRoaXMuYWNpdHZlID0gdHJ1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBoaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vICBFdmVudHNcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgICAgIF9oYW5kbGVDbGljazogZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICB2YXIgZGF0ZSA9IGVsLmRhdGEoJ2RhdGUnKSB8fCAxLFxuICAgICAgICAgICAgICAgIG1vbnRoID0gZWwuZGF0YSgnbW9udGgnKSB8fCAwLFxuICAgICAgICAgICAgICAgIHllYXIgPSBlbC5kYXRhKCd5ZWFyJykgfHwgdGhpcy5kLnBhcnNlZERhdGUueWVhcjtcbiAgICAgICAgICAgIC8vIENoYW5nZSB2aWV3IGlmIG1pbiB2aWV3IGRvZXMgbm90IHJlYWNoIHlldFxuICAgICAgICAgICAgaWYgKHRoaXMuZC52aWV3ICE9IHRoaXMub3B0cy5taW5WaWV3KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kLmRvd24obmV3IERhdGUoeWVhciwgbW9udGgsIGRhdGUpKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBTZWxlY3QgZGF0ZSBpZiBtaW4gdmlldyBpcyByZWFjaGVkXG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWREYXRlID0gbmV3IERhdGUoeWVhciwgbW9udGgsIGRhdGUpLFxuICAgICAgICAgICAgICAgIGFscmVhZHlTZWxlY3RlZCA9IHRoaXMuZC5faXNTZWxlY3RlZChzZWxlY3RlZERhdGUsIHRoaXMuZC5jZWxsVHlwZSk7XG5cbiAgICAgICAgICAgIGlmICghYWxyZWFkeVNlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kLnNlbGVjdERhdGUoc2VsZWN0ZWREYXRlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWxyZWFkeVNlbGVjdGVkICYmIHRoaXMub3B0cy50b2dnbGVTZWxlY3RlZCl7XG4gICAgICAgICAgICAgICAgdGhpcy5kLnJlbW92ZURhdGUoc2VsZWN0ZWREYXRlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LFxuXG4gICAgICAgIF9vbkNsaWNrQ2VsbDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciAkZWwgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcuZGF0ZXBpY2tlci0tY2VsbCcpO1xuXG4gICAgICAgICAgICBpZiAoJGVsLmhhc0NsYXNzKCctZGlzYWJsZWQtJykpIHJldHVybjtcblxuICAgICAgICAgICAgdGhpcy5faGFuZGxlQ2xpY2suYmluZCh0aGlzKSgkZWwpO1xuICAgICAgICB9XG4gICAgfTtcbn0pKCk7XG5cbjsoZnVuY3Rpb24gKCkge1xuICAgIHZhciB0ZW1wbGF0ZSA9ICcnICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1uYXYtYWN0aW9uXCIgZGF0YS1hY3Rpb249XCJwcmV2XCI+I3twcmV2SHRtbH08L2Rpdj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1uYXYtdGl0bGVcIj4je3RpdGxlfTwvZGl2PicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLW5hdi1hY3Rpb25cIiBkYXRhLWFjdGlvbj1cIm5leHRcIj4je25leHRIdG1sfTwvZGl2PicsXG4gICAgICAgIGJ1dHRvbnNDb250YWluZXJUZW1wbGF0ZSA9ICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tYnV0dG9uc1wiPjwvZGl2PicsXG4gICAgICAgIGJ1dHRvbiA9ICc8c3BhbiBjbGFzcz1cImRhdGVwaWNrZXItLWJ1dHRvblwiIGRhdGEtYWN0aW9uPVwiI3thY3Rpb259XCI+I3tsYWJlbH08L3NwYW4+JztcblxuICAgIERhdGVwaWNrZXIuTmF2aWdhdGlvbiA9IGZ1bmN0aW9uIChkLCBvcHRzKSB7XG4gICAgICAgIHRoaXMuZCA9IGQ7XG4gICAgICAgIHRoaXMub3B0cyA9IG9wdHM7XG5cbiAgICAgICAgdGhpcy4kYnV0dG9uc0NvbnRhaW5lciA9ICcnO1xuXG4gICAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH07XG5cbiAgICBEYXRlcGlja2VyLk5hdmlnYXRpb24ucHJvdG90eXBlID0ge1xuICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl9idWlsZEJhc2VIdG1sKCk7XG4gICAgICAgICAgICB0aGlzLl9iaW5kRXZlbnRzKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2JpbmRFdmVudHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuZC4kbmF2Lm9uKCdjbGljaycsICcuZGF0ZXBpY2tlci0tbmF2LWFjdGlvbicsICQucHJveHkodGhpcy5fb25DbGlja05hdkJ1dHRvbiwgdGhpcykpO1xuICAgICAgICAgICAgdGhpcy5kLiRuYXYub24oJ2NsaWNrJywgJy5kYXRlcGlja2VyLS1uYXYtdGl0bGUnLCAkLnByb3h5KHRoaXMuX29uQ2xpY2tOYXZUaXRsZSwgdGhpcykpO1xuICAgICAgICAgICAgdGhpcy5kLiRkYXRlcGlja2VyLm9uKCdjbGljaycsICcuZGF0ZXBpY2tlci0tYnV0dG9uJywgJC5wcm94eSh0aGlzLl9vbkNsaWNrTmF2QnV0dG9uLCB0aGlzKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2J1aWxkQmFzZUh0bWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcigpO1xuICAgICAgICAgICAgdGhpcy5fYWRkQnV0dG9uc0lmTmVlZCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9hZGRCdXR0b25zSWZOZWVkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLnRvZGF5QnV0dG9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkQnV0dG9uKCd0b2RheScpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLmNsZWFyQnV0dG9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkQnV0dG9uKCdjbGVhcicpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3JlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRpdGxlID0gdGhpcy5fZ2V0VGl0bGUodGhpcy5kLmN1cnJlbnREYXRlKSxcbiAgICAgICAgICAgICAgICBodG1sID0gRGF0ZXBpY2tlci50ZW1wbGF0ZSh0ZW1wbGF0ZSwgJC5leHRlbmQoe3RpdGxlOiB0aXRsZX0sIHRoaXMub3B0cykpO1xuICAgICAgICAgICAgdGhpcy5kLiRuYXYuaHRtbChodG1sKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmQudmlldyA9PSAneWVhcnMnKSB7XG4gICAgICAgICAgICAgICAgJCgnLmRhdGVwaWNrZXItLW5hdi10aXRsZScsIHRoaXMuZC4kbmF2KS5hZGRDbGFzcygnLWRpc2FibGVkLScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXROYXZTdGF0dXMoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0VGl0bGU6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kLmZvcm1hdERhdGUodGhpcy5vcHRzLm5hdlRpdGxlc1t0aGlzLmQudmlld10sIGRhdGUpXG4gICAgICAgIH0sXG5cbiAgICAgICAgX2FkZEJ1dHRvbjogZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy4kYnV0dG9uc0NvbnRhaW5lci5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRCdXR0b25zQ29udGFpbmVyKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IHR5cGUsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiB0aGlzLmQubG9jW3R5cGVdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBodG1sID0gRGF0ZXBpY2tlci50ZW1wbGF0ZShidXR0b24sIGRhdGEpO1xuXG4gICAgICAgICAgICBpZiAoJCgnW2RhdGEtYWN0aW9uPScgKyB0eXBlICsgJ10nLCB0aGlzLiRidXR0b25zQ29udGFpbmVyKS5sZW5ndGgpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuJGJ1dHRvbnNDb250YWluZXIuYXBwZW5kKGh0bWwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9hZGRCdXR0b25zQ29udGFpbmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmQuJGRhdGVwaWNrZXIuYXBwZW5kKGJ1dHRvbnNDb250YWluZXJUZW1wbGF0ZSk7XG4gICAgICAgICAgICB0aGlzLiRidXR0b25zQ29udGFpbmVyID0gJCgnLmRhdGVwaWNrZXItLWJ1dHRvbnMnLCB0aGlzLmQuJGRhdGVwaWNrZXIpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldE5hdlN0YXR1czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCEodGhpcy5vcHRzLm1pbkRhdGUgfHwgdGhpcy5vcHRzLm1heERhdGUpIHx8ICF0aGlzLm9wdHMuZGlzYWJsZU5hdldoZW5PdXRPZlJhbmdlKSByZXR1cm47XG5cbiAgICAgICAgICAgIHZhciBkYXRlID0gdGhpcy5kLnBhcnNlZERhdGUsXG4gICAgICAgICAgICAgICAgbSA9IGRhdGUubW9udGgsXG4gICAgICAgICAgICAgICAgeSA9IGRhdGUueWVhcixcbiAgICAgICAgICAgICAgICBkID0gZGF0ZS5kYXRlO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMuZC52aWV3KSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnZGF5cyc6XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5kLl9pc0luUmFuZ2UobmV3IERhdGUoeSwgbS0xLCBkKSwgJ21vbnRoJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVOYXYoJ3ByZXYnKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5kLl9pc0luUmFuZ2UobmV3IERhdGUoeSwgbSsxLCBkKSwgJ21vbnRoJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVOYXYoJ25leHQnKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ21vbnRocyc6XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5kLl9pc0luUmFuZ2UobmV3IERhdGUoeS0xLCBtLCBkKSwgJ3llYXInKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZU5hdigncHJldicpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmQuX2lzSW5SYW5nZShuZXcgRGF0ZSh5KzEsIG0sIGQpLCAneWVhcicpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlTmF2KCduZXh0JylcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICd5ZWFycyc6XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5kLl9pc0luUmFuZ2UobmV3IERhdGUoeS0xMCwgbSwgZCksICd5ZWFyJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVOYXYoJ3ByZXYnKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5kLl9pc0luUmFuZ2UobmV3IERhdGUoeSsxMCwgbSwgZCksICd5ZWFyJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVOYXYoJ25leHQnKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9kaXNhYmxlTmF2OiBmdW5jdGlvbiAobmF2KSB7XG4gICAgICAgICAgICAkKCdbZGF0YS1hY3Rpb249XCInICsgbmF2ICsgJ1wiXScsIHRoaXMuZC4kbmF2KS5hZGRDbGFzcygnLWRpc2FibGVkLScpXG4gICAgICAgIH0sXG5cbiAgICAgICAgX2FjdGl2YXRlTmF2OiBmdW5jdGlvbiAobmF2KSB7XG4gICAgICAgICAgICAkKCdbZGF0YS1hY3Rpb249XCInICsgbmF2ICsgJ1wiXScsIHRoaXMuZC4kbmF2KS5yZW1vdmVDbGFzcygnLWRpc2FibGVkLScpXG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uQ2xpY2tOYXZCdXR0b246IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgJGVsID0gJChlLnRhcmdldCkuY2xvc2VzdCgnW2RhdGEtYWN0aW9uXScpLFxuICAgICAgICAgICAgICAgIGFjdGlvbiA9ICRlbC5kYXRhKCdhY3Rpb24nKTtcblxuICAgICAgICAgICAgdGhpcy5kW2FjdGlvbl0oKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfb25DbGlja05hdlRpdGxlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgaWYgKCQoZS50YXJnZXQpLmhhc0NsYXNzKCctZGlzYWJsZWQtJykpIHJldHVybjtcblxuICAgICAgICAgICAgaWYgKHRoaXMuZC52aWV3ID09ICdkYXlzJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmQudmlldyA9ICdtb250aHMnXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuZC52aWV3ID0gJ3llYXJzJztcbiAgICAgICAgfVxuICAgIH1cblxufSkoKTtcbiIsIiFmdW5jdGlvbihhLGIpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW1wianF1ZXJ5XCJdLGIpOlwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP21vZHVsZS5leHBvcnRzPWIocmVxdWlyZShcImpxdWVyeVwiKSk6YihhLmpRdWVyeSl9KHRoaXMsZnVuY3Rpb24oYSl7XCJmdW5jdGlvblwiIT10eXBlb2YgT2JqZWN0LmNyZWF0ZSYmKE9iamVjdC5jcmVhdGU9ZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYigpe31yZXR1cm4gYi5wcm90b3R5cGU9YSxuZXcgYn0pO3ZhciBiPXtpbml0OmZ1bmN0aW9uKGIpe3JldHVybiB0aGlzLm9wdGlvbnM9YS5leHRlbmQoe30sYS5ub3R5LmRlZmF1bHRzLGIpLHRoaXMub3B0aW9ucy5sYXlvdXQ9dGhpcy5vcHRpb25zLmN1c3RvbT9hLm5vdHkubGF5b3V0cy5pbmxpbmU6YS5ub3R5LmxheW91dHNbdGhpcy5vcHRpb25zLmxheW91dF0sYS5ub3R5LnRoZW1lc1t0aGlzLm9wdGlvbnMudGhlbWVdP3RoaXMub3B0aW9ucy50aGVtZT1hLm5vdHkudGhlbWVzW3RoaXMub3B0aW9ucy50aGVtZV06dGhpcy5vcHRpb25zLnRoZW1lQ2xhc3NOYW1lPXRoaXMub3B0aW9ucy50aGVtZSx0aGlzLm9wdGlvbnM9YS5leHRlbmQoe30sdGhpcy5vcHRpb25zLHRoaXMub3B0aW9ucy5sYXlvdXQub3B0aW9ucyksdGhpcy5vcHRpb25zLmlkPVwibm90eV9cIisobmV3IERhdGUpLmdldFRpbWUoKSpNYXRoLmZsb29yKDFlNipNYXRoLnJhbmRvbSgpKSx0aGlzLl9idWlsZCgpLHRoaXN9LF9idWlsZDpmdW5jdGlvbigpe3ZhciBiPWEoJzxkaXYgY2xhc3M9XCJub3R5X2JhciBub3R5X3R5cGVfJyt0aGlzLm9wdGlvbnMudHlwZSsnXCI+PC9kaXY+JykuYXR0cihcImlkXCIsdGhpcy5vcHRpb25zLmlkKTtpZihiLmFwcGVuZCh0aGlzLm9wdGlvbnMudGVtcGxhdGUpLmZpbmQoXCIubm90eV90ZXh0XCIpLmh0bWwodGhpcy5vcHRpb25zLnRleHQpLHRoaXMuJGJhcj1udWxsIT09dGhpcy5vcHRpb25zLmxheW91dC5wYXJlbnQub2JqZWN0P2EodGhpcy5vcHRpb25zLmxheW91dC5wYXJlbnQub2JqZWN0KS5jc3ModGhpcy5vcHRpb25zLmxheW91dC5wYXJlbnQuY3NzKS5hcHBlbmQoYik6Yix0aGlzLm9wdGlvbnMudGhlbWVDbGFzc05hbWUmJnRoaXMuJGJhci5hZGRDbGFzcyh0aGlzLm9wdGlvbnMudGhlbWVDbGFzc05hbWUpLmFkZENsYXNzKFwibm90eV9jb250YWluZXJfdHlwZV9cIit0aGlzLm9wdGlvbnMudHlwZSksdGhpcy5vcHRpb25zLmJ1dHRvbnMpe3RoaXMub3B0aW9ucy5jbG9zZVdpdGg9W10sdGhpcy5vcHRpb25zLnRpbWVvdXQ9ITE7dmFyIGM9YShcIjxkaXYvPlwiKS5hZGRDbGFzcyhcIm5vdHlfYnV0dG9uc1wiKTtudWxsIT09dGhpcy5vcHRpb25zLmxheW91dC5wYXJlbnQub2JqZWN0P3RoaXMuJGJhci5maW5kKFwiLm5vdHlfYmFyXCIpLmFwcGVuZChjKTp0aGlzLiRiYXIuYXBwZW5kKGMpO3ZhciBkPXRoaXM7YS5lYWNoKHRoaXMub3B0aW9ucy5idXR0b25zLGZ1bmN0aW9uKGIsYyl7dmFyIGU9YShcIjxidXR0b24vPlwiKS5hZGRDbGFzcyhjLmFkZENsYXNzP2MuYWRkQ2xhc3M6XCJncmF5XCIpLmh0bWwoYy50ZXh0KS5hdHRyKFwiaWRcIixjLmlkP2MuaWQ6XCJidXR0b24tXCIrYikuYXR0cihcInRpdGxlXCIsYy50aXRsZSkuYXBwZW5kVG8oZC4kYmFyLmZpbmQoXCIubm90eV9idXR0b25zXCIpKS5vbihcImNsaWNrXCIsZnVuY3Rpb24oYil7YS5pc0Z1bmN0aW9uKGMub25DbGljaykmJmMub25DbGljay5jYWxsKGUsZCxiKX0pfSl9dGhpcy4kbWVzc2FnZT10aGlzLiRiYXIuZmluZChcIi5ub3R5X21lc3NhZ2VcIiksdGhpcy4kY2xvc2VCdXR0b249dGhpcy4kYmFyLmZpbmQoXCIubm90eV9jbG9zZVwiKSx0aGlzLiRidXR0b25zPXRoaXMuJGJhci5maW5kKFwiLm5vdHlfYnV0dG9uc1wiKSxhLm5vdHkuc3RvcmVbdGhpcy5vcHRpb25zLmlkXT10aGlzfSxzaG93OmZ1bmN0aW9uKCl7dmFyIGI9dGhpcztyZXR1cm4gYi5vcHRpb25zLmN1c3RvbT9iLm9wdGlvbnMuY3VzdG9tLmZpbmQoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmFwcGVuZChiLiRiYXIpOmEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmFwcGVuZChiLiRiYXIpLGIub3B0aW9ucy50aGVtZSYmYi5vcHRpb25zLnRoZW1lLnN0eWxlJiZiLm9wdGlvbnMudGhlbWUuc3R5bGUuYXBwbHkoYiksXCJmdW5jdGlvblwiPT09YS50eXBlKGIub3B0aW9ucy5sYXlvdXQuY3NzKT90aGlzLm9wdGlvbnMubGF5b3V0LmNzcy5hcHBseShiLiRiYXIpOmIuJGJhci5jc3ModGhpcy5vcHRpb25zLmxheW91dC5jc3N8fHt9KSxiLiRiYXIuYWRkQ2xhc3MoYi5vcHRpb25zLmxheW91dC5hZGRDbGFzcyksYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc3R5bGUuYXBwbHkoYShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvciksW2Iub3B0aW9ucy53aXRoaW5dKSxiLnNob3dpbmc9ITAsYi5vcHRpb25zLnRoZW1lJiZiLm9wdGlvbnMudGhlbWUuc3R5bGUmJmIub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vblNob3cuYXBwbHkodGhpcyksYS5pbkFycmF5KFwiY2xpY2tcIixiLm9wdGlvbnMuY2xvc2VXaXRoKT4tMSYmYi4kYmFyLmNzcyhcImN1cnNvclwiLFwicG9pbnRlclwiKS5vbmUoXCJjbGlja1wiLGZ1bmN0aW9uKGEpe2Iuc3RvcFByb3BhZ2F0aW9uKGEpLGIub3B0aW9ucy5jYWxsYmFjay5vbkNsb3NlQ2xpY2smJmIub3B0aW9ucy5jYWxsYmFjay5vbkNsb3NlQ2xpY2suYXBwbHkoYiksYi5jbG9zZSgpfSksYS5pbkFycmF5KFwiaG92ZXJcIixiLm9wdGlvbnMuY2xvc2VXaXRoKT4tMSYmYi4kYmFyLm9uZShcIm1vdXNlZW50ZXJcIixmdW5jdGlvbigpe2IuY2xvc2UoKX0pLGEuaW5BcnJheShcImJ1dHRvblwiLGIub3B0aW9ucy5jbG9zZVdpdGgpPi0xJiZiLiRjbG9zZUJ1dHRvbi5vbmUoXCJjbGlja1wiLGZ1bmN0aW9uKGEpe2Iuc3RvcFByb3BhZ2F0aW9uKGEpLGIuY2xvc2UoKX0pLC0xPT1hLmluQXJyYXkoXCJidXR0b25cIixiLm9wdGlvbnMuY2xvc2VXaXRoKSYmYi4kY2xvc2VCdXR0b24ucmVtb3ZlKCksYi5vcHRpb25zLmNhbGxiYWNrLm9uU2hvdyYmYi5vcHRpb25zLmNhbGxiYWNrLm9uU2hvdy5hcHBseShiKSxcInN0cmluZ1wiPT10eXBlb2YgYi5vcHRpb25zLmFuaW1hdGlvbi5vcGVuPyhiLiRiYXIuY3NzKFwiaGVpZ2h0XCIsYi4kYmFyLmlubmVySGVpZ2h0KCkpLGIuJGJhci5vbihcImNsaWNrXCIsZnVuY3Rpb24oYSl7Yi53YXNDbGlja2VkPSEwfSksYi4kYmFyLnNob3coKS5hZGRDbGFzcyhiLm9wdGlvbnMuYW5pbWF0aW9uLm9wZW4pLm9uZShcIndlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmRcIixmdW5jdGlvbigpe2Iub3B0aW9ucy5jYWxsYmFjay5hZnRlclNob3cmJmIub3B0aW9ucy5jYWxsYmFjay5hZnRlclNob3cuYXBwbHkoYiksYi5zaG93aW5nPSExLGIuc2hvd249ITAsYi5oYXNPd25Qcm9wZXJ0eShcIndhc0NsaWNrZWRcIikmJihiLiRiYXIub2ZmKFwiY2xpY2tcIixmdW5jdGlvbihhKXtiLndhc0NsaWNrZWQ9ITB9KSxiLmNsb3NlKCkpfSkpOmIuJGJhci5hbmltYXRlKGIub3B0aW9ucy5hbmltYXRpb24ub3BlbixiLm9wdGlvbnMuYW5pbWF0aW9uLnNwZWVkLGIub3B0aW9ucy5hbmltYXRpb24uZWFzaW5nLGZ1bmN0aW9uKCl7Yi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyU2hvdyYmYi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyU2hvdy5hcHBseShiKSxiLnNob3dpbmc9ITEsYi5zaG93bj0hMH0pLGIub3B0aW9ucy50aW1lb3V0JiZiLiRiYXIuZGVsYXkoYi5vcHRpb25zLnRpbWVvdXQpLnByb21pc2UoKS5kb25lKGZ1bmN0aW9uKCl7Yi5jbG9zZSgpfSksdGhpc30sY2xvc2U6ZnVuY3Rpb24oKXtpZighKHRoaXMuY2xvc2VkfHx0aGlzLiRiYXImJnRoaXMuJGJhci5oYXNDbGFzcyhcImktYW0tY2xvc2luZy1ub3dcIikpKXt2YXIgYj10aGlzO2lmKHRoaXMuc2hvd2luZylyZXR1cm4gdm9pZCBiLiRiYXIucXVldWUoZnVuY3Rpb24oKXtiLmNsb3NlLmFwcGx5KGIpfSk7aWYoIXRoaXMuc2hvd24mJiF0aGlzLnNob3dpbmcpe3ZhciBjPVtdO3JldHVybiBhLmVhY2goYS5ub3R5LnF1ZXVlLGZ1bmN0aW9uKGEsZCl7ZC5vcHRpb25zLmlkIT1iLm9wdGlvbnMuaWQmJmMucHVzaChkKX0pLHZvaWQoYS5ub3R5LnF1ZXVlPWMpfWIuJGJhci5hZGRDbGFzcyhcImktYW0tY2xvc2luZy1ub3dcIiksYi5vcHRpb25zLmNhbGxiYWNrLm9uQ2xvc2UmJmIub3B0aW9ucy5jYWxsYmFjay5vbkNsb3NlLmFwcGx5KGIpLFwic3RyaW5nXCI9PXR5cGVvZiBiLm9wdGlvbnMuYW5pbWF0aW9uLmNsb3NlP2IuJGJhci5hZGRDbGFzcyhiLm9wdGlvbnMuYW5pbWF0aW9uLmNsb3NlKS5vbmUoXCJ3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kXCIsZnVuY3Rpb24oKXtiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJDbG9zZSYmYi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyQ2xvc2UuYXBwbHkoYiksYi5jbG9zZUNsZWFuVXAoKX0pOmIuJGJhci5jbGVhclF1ZXVlKCkuc3RvcCgpLmFuaW1hdGUoYi5vcHRpb25zLmFuaW1hdGlvbi5jbG9zZSxiLm9wdGlvbnMuYW5pbWF0aW9uLnNwZWVkLGIub3B0aW9ucy5hbmltYXRpb24uZWFzaW5nLGZ1bmN0aW9uKCl7Yi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyQ2xvc2UmJmIub3B0aW9ucy5jYWxsYmFjay5hZnRlckNsb3NlLmFwcGx5KGIpfSkucHJvbWlzZSgpLmRvbmUoZnVuY3Rpb24oKXtiLmNsb3NlQ2xlYW5VcCgpfSl9fSxjbG9zZUNsZWFuVXA6ZnVuY3Rpb24oKXt2YXIgYj10aGlzO2Iub3B0aW9ucy5tb2RhbCYmKGEubm90eVJlbmRlcmVyLnNldE1vZGFsQ291bnQoLTEpLDA9PWEubm90eVJlbmRlcmVyLmdldE1vZGFsQ291bnQoKSYmYShcIi5ub3R5X21vZGFsXCIpLmZhZGVPdXQoYi5vcHRpb25zLmFuaW1hdGlvbi5mYWRlU3BlZWQsZnVuY3Rpb24oKXthKHRoaXMpLnJlbW92ZSgpfSkpLGEubm90eVJlbmRlcmVyLnNldExheW91dENvdW50Rm9yKGIsLTEpLDA9PWEubm90eVJlbmRlcmVyLmdldExheW91dENvdW50Rm9yKGIpJiZhKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5yZW1vdmUoKSxcInVuZGVmaW5lZFwiIT10eXBlb2YgYi4kYmFyJiZudWxsIT09Yi4kYmFyJiYoXCJzdHJpbmdcIj09dHlwZW9mIGIub3B0aW9ucy5hbmltYXRpb24uY2xvc2U/KGIuJGJhci5jc3MoXCJ0cmFuc2l0aW9uXCIsXCJhbGwgMTAwbXMgZWFzZVwiKS5jc3MoXCJib3JkZXJcIiwwKS5jc3MoXCJtYXJnaW5cIiwwKS5oZWlnaHQoMCksYi4kYmFyLm9uZShcInRyYW5zaXRpb25lbmQgd2Via2l0VHJhbnNpdGlvbkVuZCBvVHJhbnNpdGlvbkVuZCBNU1RyYW5zaXRpb25FbmRcIixmdW5jdGlvbigpe2IuJGJhci5yZW1vdmUoKSxiLiRiYXI9bnVsbCxiLmNsb3NlZD0hMCxiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2smJmIub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vbkNsb3NlJiZiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2sub25DbG9zZS5hcHBseShiKX0pKTooYi4kYmFyLnJlbW92ZSgpLGIuJGJhcj1udWxsLGIuY2xvc2VkPSEwKSksZGVsZXRlIGEubm90eS5zdG9yZVtiLm9wdGlvbnMuaWRdLGIub3B0aW9ucy50aGVtZS5jYWxsYmFjayYmYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrLm9uQ2xvc2UmJmIub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vbkNsb3NlLmFwcGx5KGIpLGIub3B0aW9ucy5kaXNtaXNzUXVldWV8fChhLm5vdHkub250YXA9ITAsYS5ub3R5UmVuZGVyZXIucmVuZGVyKCkpLGIub3B0aW9ucy5tYXhWaXNpYmxlPjAmJmIub3B0aW9ucy5kaXNtaXNzUXVldWUmJmEubm90eVJlbmRlcmVyLnJlbmRlcigpfSxzZXRUZXh0OmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLmNsb3NlZHx8KHRoaXMub3B0aW9ucy50ZXh0PWEsdGhpcy4kYmFyLmZpbmQoXCIubm90eV90ZXh0XCIpLmh0bWwoYSkpLHRoaXN9LHNldFR5cGU6ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuY2xvc2VkfHwodGhpcy5vcHRpb25zLnR5cGU9YSx0aGlzLm9wdGlvbnMudGhlbWUuc3R5bGUuYXBwbHkodGhpcyksdGhpcy5vcHRpb25zLnRoZW1lLmNhbGxiYWNrLm9uU2hvdy5hcHBseSh0aGlzKSksdGhpc30sc2V0VGltZW91dDpmdW5jdGlvbihhKXtpZighdGhpcy5jbG9zZWQpe3ZhciBiPXRoaXM7dGhpcy5vcHRpb25zLnRpbWVvdXQ9YSxiLiRiYXIuZGVsYXkoYi5vcHRpb25zLnRpbWVvdXQpLnByb21pc2UoKS5kb25lKGZ1bmN0aW9uKCl7Yi5jbG9zZSgpfSl9cmV0dXJuIHRoaXN9LHN0b3BQcm9wYWdhdGlvbjpmdW5jdGlvbihhKXthPWF8fHdpbmRvdy5ldmVudCxcInVuZGVmaW5lZFwiIT10eXBlb2YgYS5zdG9wUHJvcGFnYXRpb24/YS5zdG9wUHJvcGFnYXRpb24oKTphLmNhbmNlbEJ1YmJsZT0hMH0sY2xvc2VkOiExLHNob3dpbmc6ITEsc2hvd246ITF9O2Eubm90eVJlbmRlcmVyPXt9LGEubm90eVJlbmRlcmVyLmluaXQ9ZnVuY3Rpb24oYyl7dmFyIGQ9T2JqZWN0LmNyZWF0ZShiKS5pbml0KGMpO3JldHVybiBkLm9wdGlvbnMua2lsbGVyJiZhLm5vdHkuY2xvc2VBbGwoKSxkLm9wdGlvbnMuZm9yY2U/YS5ub3R5LnF1ZXVlLnVuc2hpZnQoZCk6YS5ub3R5LnF1ZXVlLnB1c2goZCksYS5ub3R5UmVuZGVyZXIucmVuZGVyKCksXCJvYmplY3RcIj09YS5ub3R5LnJldHVybnM/ZDpkLm9wdGlvbnMuaWR9LGEubm90eVJlbmRlcmVyLnJlbmRlcj1mdW5jdGlvbigpe3ZhciBiPWEubm90eS5xdWV1ZVswXTtcIm9iamVjdFwiPT09YS50eXBlKGIpP2Iub3B0aW9ucy5kaXNtaXNzUXVldWU/Yi5vcHRpb25zLm1heFZpc2libGU+MD9hKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yK1wiID4gbGlcIikubGVuZ3RoPGIub3B0aW9ucy5tYXhWaXNpYmxlJiZhLm5vdHlSZW5kZXJlci5zaG93KGEubm90eS5xdWV1ZS5zaGlmdCgpKTphLm5vdHlSZW5kZXJlci5zaG93KGEubm90eS5xdWV1ZS5zaGlmdCgpKTphLm5vdHkub250YXAmJihhLm5vdHlSZW5kZXJlci5zaG93KGEubm90eS5xdWV1ZS5zaGlmdCgpKSxhLm5vdHkub250YXA9ITEpOmEubm90eS5vbnRhcD0hMH0sYS5ub3R5UmVuZGVyZXIuc2hvdz1mdW5jdGlvbihiKXtiLm9wdGlvbnMubW9kYWwmJihhLm5vdHlSZW5kZXJlci5jcmVhdGVNb2RhbEZvcihiKSxhLm5vdHlSZW5kZXJlci5zZXRNb2RhbENvdW50KDEpKSxiLm9wdGlvbnMuY3VzdG9tPzA9PWIub3B0aW9ucy5jdXN0b20uZmluZChiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikubGVuZ3RoP2Iub3B0aW9ucy5jdXN0b20uYXBwZW5kKGEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIub2JqZWN0KS5hZGRDbGFzcyhcImktYW0tbmV3XCIpKTpiLm9wdGlvbnMuY3VzdG9tLmZpbmQoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLnJlbW92ZUNsYXNzKFwiaS1hbS1uZXdcIik6MD09YShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikubGVuZ3RoP2EoXCJib2R5XCIpLmFwcGVuZChhKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLm9iamVjdCkuYWRkQ2xhc3MoXCJpLWFtLW5ld1wiKSk6YShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikucmVtb3ZlQ2xhc3MoXCJpLWFtLW5ld1wiKSxhLm5vdHlSZW5kZXJlci5zZXRMYXlvdXRDb3VudEZvcihiLDEpLGIuc2hvdygpfSxhLm5vdHlSZW5kZXJlci5jcmVhdGVNb2RhbEZvcj1mdW5jdGlvbihiKXtpZigwPT1hKFwiLm5vdHlfbW9kYWxcIikubGVuZ3RoKXt2YXIgYz1hKFwiPGRpdi8+XCIpLmFkZENsYXNzKFwibm90eV9tb2RhbFwiKS5hZGRDbGFzcyhiLm9wdGlvbnMudGhlbWUpLmRhdGEoXCJub3R5X21vZGFsX2NvdW50XCIsMCk7Yi5vcHRpb25zLnRoZW1lLm1vZGFsJiZiLm9wdGlvbnMudGhlbWUubW9kYWwuY3NzJiZjLmNzcyhiLm9wdGlvbnMudGhlbWUubW9kYWwuY3NzKSxjLnByZXBlbmRUbyhhKFwiYm9keVwiKSkuZmFkZUluKGIub3B0aW9ucy5hbmltYXRpb24uZmFkZVNwZWVkKSxhLmluQXJyYXkoXCJiYWNrZHJvcFwiLGIub3B0aW9ucy5jbG9zZVdpdGgpPi0xJiZjLm9uKFwiY2xpY2tcIixmdW5jdGlvbihiKXthLm5vdHkuY2xvc2VBbGwoKX0pfX0sYS5ub3R5UmVuZGVyZXIuZ2V0TGF5b3V0Q291bnRGb3I9ZnVuY3Rpb24oYil7cmV0dXJuIGEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmRhdGEoXCJub3R5X2xheW91dF9jb3VudFwiKXx8MH0sYS5ub3R5UmVuZGVyZXIuc2V0TGF5b3V0Q291bnRGb3I9ZnVuY3Rpb24oYixjKXtyZXR1cm4gYShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikuZGF0YShcIm5vdHlfbGF5b3V0X2NvdW50XCIsYS5ub3R5UmVuZGVyZXIuZ2V0TGF5b3V0Q291bnRGb3IoYikrYyl9LGEubm90eVJlbmRlcmVyLmdldE1vZGFsQ291bnQ9ZnVuY3Rpb24oKXtyZXR1cm4gYShcIi5ub3R5X21vZGFsXCIpLmRhdGEoXCJub3R5X21vZGFsX2NvdW50XCIpfHwwfSxhLm5vdHlSZW5kZXJlci5zZXRNb2RhbENvdW50PWZ1bmN0aW9uKGIpe3JldHVybiBhKFwiLm5vdHlfbW9kYWxcIikuZGF0YShcIm5vdHlfbW9kYWxfY291bnRcIixhLm5vdHlSZW5kZXJlci5nZXRNb2RhbENvdW50KCkrYil9LGEuZm4ubm90eT1mdW5jdGlvbihiKXtyZXR1cm4gYi5jdXN0b209YSh0aGlzKSxhLm5vdHlSZW5kZXJlci5pbml0KGIpfSxhLm5vdHk9e30sYS5ub3R5LnF1ZXVlPVtdLGEubm90eS5vbnRhcD0hMCxhLm5vdHkubGF5b3V0cz17fSxhLm5vdHkudGhlbWVzPXt9LGEubm90eS5yZXR1cm5zPVwib2JqZWN0XCIsYS5ub3R5LnN0b3JlPXt9LGEubm90eS5nZXQ9ZnVuY3Rpb24oYil7cmV0dXJuIGEubm90eS5zdG9yZS5oYXNPd25Qcm9wZXJ0eShiKT9hLm5vdHkuc3RvcmVbYl06ITF9LGEubm90eS5jbG9zZT1mdW5jdGlvbihiKXtyZXR1cm4gYS5ub3R5LmdldChiKT9hLm5vdHkuZ2V0KGIpLmNsb3NlKCk6ITF9LGEubm90eS5zZXRUZXh0PWZ1bmN0aW9uKGIsYyl7cmV0dXJuIGEubm90eS5nZXQoYik/YS5ub3R5LmdldChiKS5zZXRUZXh0KGMpOiExfSxhLm5vdHkuc2V0VHlwZT1mdW5jdGlvbihiLGMpe3JldHVybiBhLm5vdHkuZ2V0KGIpP2Eubm90eS5nZXQoYikuc2V0VHlwZShjKTohMX0sYS5ub3R5LmNsZWFyUXVldWU9ZnVuY3Rpb24oKXthLm5vdHkucXVldWU9W119LGEubm90eS5jbG9zZUFsbD1mdW5jdGlvbigpe2Eubm90eS5jbGVhclF1ZXVlKCksYS5lYWNoKGEubm90eS5zdG9yZSxmdW5jdGlvbihhLGIpe2IuY2xvc2UoKX0pfTt2YXIgYz13aW5kb3cuYWxlcnQ7cmV0dXJuIGEubm90eS5jb25zdW1lQWxlcnQ9ZnVuY3Rpb24oYil7d2luZG93LmFsZXJ0PWZ1bmN0aW9uKGMpe2I/Yi50ZXh0PWM6Yj17dGV4dDpjfSxhLm5vdHlSZW5kZXJlci5pbml0KGIpfX0sYS5ub3R5LnN0b3BDb25zdW1lQWxlcnQ9ZnVuY3Rpb24oKXt3aW5kb3cuYWxlcnQ9Y30sYS5ub3R5LmRlZmF1bHRzPXtsYXlvdXQ6XCJ0b3BcIix0aGVtZTpcImRlZmF1bHRUaGVtZVwiLHR5cGU6XCJhbGVydFwiLHRleHQ6XCJcIixkaXNtaXNzUXVldWU6ITAsdGVtcGxhdGU6JzxkaXYgY2xhc3M9XCJub3R5X21lc3NhZ2VcIj48c3BhbiBjbGFzcz1cIm5vdHlfdGV4dFwiPjwvc3Bhbj48ZGl2IGNsYXNzPVwibm90eV9jbG9zZVwiPjwvZGl2PjwvZGl2PicsYW5pbWF0aW9uOntvcGVuOntoZWlnaHQ6XCJ0b2dnbGVcIn0sY2xvc2U6e2hlaWdodDpcInRvZ2dsZVwifSxlYXNpbmc6XCJzd2luZ1wiLHNwZWVkOjUwMCxmYWRlU3BlZWQ6XCJmYXN0XCJ9LHRpbWVvdXQ6ITEsZm9yY2U6ITEsbW9kYWw6ITEsbWF4VmlzaWJsZTo1LGtpbGxlcjohMSxjbG9zZVdpdGg6W1wiY2xpY2tcIl0sY2FsbGJhY2s6e29uU2hvdzpmdW5jdGlvbigpe30sYWZ0ZXJTaG93OmZ1bmN0aW9uKCl7fSxvbkNsb3NlOmZ1bmN0aW9uKCl7fSxhZnRlckNsb3NlOmZ1bmN0aW9uKCl7fSxvbkNsb3NlQ2xpY2s6ZnVuY3Rpb24oKXt9fSxidXR0b25zOiExfSxhKHdpbmRvdykub24oXCJyZXNpemVcIixmdW5jdGlvbigpe2EuZWFjaChhLm5vdHkubGF5b3V0cyxmdW5jdGlvbihiLGMpe2MuY29udGFpbmVyLnN0eWxlLmFwcGx5KGEoYy5jb250YWluZXIuc2VsZWN0b3IpKX0pfSksd2luZG93Lm5vdHk9ZnVuY3Rpb24oYil7cmV0dXJuIGEubm90eVJlbmRlcmVyLmluaXQoYil9LGEubm90eS5sYXlvdXRzLmJvdHRvbT17bmFtZTpcImJvdHRvbVwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfYm90dG9tX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2JvdHRvbV9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7Ym90dG9tOjAsbGVmdDpcIjUlXCIscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiOTAlXCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDo5OTk5OTk5fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuYm90dG9tQ2VudGVyPXtuYW1lOlwiYm90dG9tQ2VudGVyXCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9ib3R0b21DZW50ZXJfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfYm90dG9tQ2VudGVyX2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtib3R0b206MjAsbGVmdDowLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KSxhKHRoaXMpLmNzcyh7bGVmdDooYSh3aW5kb3cpLndpZHRoKCktYSh0aGlzKS5vdXRlcldpZHRoKCExKSkvMitcInB4XCJ9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuYm90dG9tTGVmdD17bmFtZTpcImJvdHRvbUxlZnRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2JvdHRvbUxlZnRfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfYm90dG9tTGVmdF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7Ym90dG9tOjIwLGxlZnQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLHdpbmRvdy5pbm5lcldpZHRoPDYwMCYmYSh0aGlzKS5jc3Moe2xlZnQ6NX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5ib3R0b21SaWdodD17bmFtZTpcImJvdHRvbVJpZ2h0XCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9ib3R0b21SaWdodF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9ib3R0b21SaWdodF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7Ym90dG9tOjIwLHJpZ2h0OjIwLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KSx3aW5kb3cuaW5uZXJXaWR0aDw2MDAmJmEodGhpcykuY3NzKHtyaWdodDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmNlbnRlcj17bmFtZTpcImNlbnRlclwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfY2VudGVyX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2NlbnRlcl9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7cG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pO3ZhciBiPWEodGhpcykuY2xvbmUoKS5jc3Moe3Zpc2liaWxpdHk6XCJoaWRkZW5cIixkaXNwbGF5OlwiYmxvY2tcIixwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOjAsbGVmdDowfSkuYXR0cihcImlkXCIsXCJkdXBlXCIpO2EoXCJib2R5XCIpLmFwcGVuZChiKSxiLmZpbmQoXCIuaS1hbS1jbG9zaW5nLW5vd1wiKS5yZW1vdmUoKSxiLmZpbmQoXCJsaVwiKS5jc3MoXCJkaXNwbGF5XCIsXCJibG9ja1wiKTt2YXIgYz1iLmhlaWdodCgpO2IucmVtb3ZlKCksYSh0aGlzKS5oYXNDbGFzcyhcImktYW0tbmV3XCIpP2EodGhpcykuY3NzKHtsZWZ0OihhKHdpbmRvdykud2lkdGgoKS1hKHRoaXMpLm91dGVyV2lkdGgoITEpKS8yK1wicHhcIix0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0pOmEodGhpcykuYW5pbWF0ZSh7bGVmdDooYSh3aW5kb3cpLndpZHRoKCktYSh0aGlzKS5vdXRlcldpZHRoKCExKSkvMitcInB4XCIsdG9wOihhKHdpbmRvdykuaGVpZ2h0KCktYykvMitcInB4XCJ9LDUwMCl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmNlbnRlckxlZnQ9e25hbWU6XCJjZW50ZXJMZWZ0XCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9jZW50ZXJMZWZ0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2NlbnRlckxlZnRfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe2xlZnQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pO3ZhciBiPWEodGhpcykuY2xvbmUoKS5jc3Moe3Zpc2liaWxpdHk6XCJoaWRkZW5cIixkaXNwbGF5OlwiYmxvY2tcIixwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOjAsbGVmdDowfSkuYXR0cihcImlkXCIsXCJkdXBlXCIpO2EoXCJib2R5XCIpLmFwcGVuZChiKSxiLmZpbmQoXCIuaS1hbS1jbG9zaW5nLW5vd1wiKS5yZW1vdmUoKSxiLmZpbmQoXCJsaVwiKS5jc3MoXCJkaXNwbGF5XCIsXCJibG9ja1wiKTt2YXIgYz1iLmhlaWdodCgpO2IucmVtb3ZlKCksYSh0aGlzKS5oYXNDbGFzcyhcImktYW0tbmV3XCIpP2EodGhpcykuY3NzKHt0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0pOmEodGhpcykuYW5pbWF0ZSh7dG9wOihhKHdpbmRvdykuaGVpZ2h0KCktYykvMitcInB4XCJ9LDUwMCksd2luZG93LmlubmVyV2lkdGg8NjAwJiZhKHRoaXMpLmNzcyh7bGVmdDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmNlbnRlclJpZ2h0PXtuYW1lOlwiY2VudGVyUmlnaHRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2NlbnRlclJpZ2h0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2NlbnRlclJpZ2h0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtyaWdodDoyMCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSk7dmFyIGI9YSh0aGlzKS5jbG9uZSgpLmNzcyh7dmlzaWJpbGl0eTpcImhpZGRlblwiLGRpc3BsYXk6XCJibG9ja1wiLHBvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6MCxsZWZ0OjB9KS5hdHRyKFwiaWRcIixcImR1cGVcIik7YShcImJvZHlcIikuYXBwZW5kKGIpLGIuZmluZChcIi5pLWFtLWNsb3Npbmctbm93XCIpLnJlbW92ZSgpLGIuZmluZChcImxpXCIpLmNzcyhcImRpc3BsYXlcIixcImJsb2NrXCIpO3ZhciBjPWIuaGVpZ2h0KCk7Yi5yZW1vdmUoKSxhKHRoaXMpLmhhc0NsYXNzKFwiaS1hbS1uZXdcIik/YSh0aGlzKS5jc3Moe3RvcDooYSh3aW5kb3cpLmhlaWdodCgpLWMpLzIrXCJweFwifSk6YSh0aGlzKS5hbmltYXRlKHt0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0sNTAwKSx3aW5kb3cuaW5uZXJXaWR0aDw2MDAmJmEodGhpcykuY3NzKHtyaWdodDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmlubGluZT17bmFtZTpcImlubGluZVwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBjbGFzcz1cIm5vdHlfaW5saW5lX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bC5ub3R5X2lubGluZV9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7d2lkdGg6XCIxMDAlXCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDo5OTk5OTk5fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMudG9wPXtuYW1lOlwidG9wXCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV90b3BfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfdG9wX2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHt0b3A6MCxsZWZ0OlwiNSVcIixwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCI5MCVcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4Ojk5OTk5OTl9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy50b3BDZW50ZXI9e25hbWU6XCJ0b3BDZW50ZXJcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X3RvcENlbnRlcl9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV90b3BDZW50ZXJfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3RvcDoyMCxsZWZ0OjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLGEodGhpcykuY3NzKHtsZWZ0OihhKHdpbmRvdykud2lkdGgoKS1hKHRoaXMpLm91dGVyV2lkdGgoITEpKS8yK1wicHhcIn0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy50b3BMZWZ0PXtuYW1lOlwidG9wTGVmdFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfdG9wTGVmdF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV90b3BMZWZ0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHt0b3A6MjAsbGVmdDoyMCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSksd2luZG93LmlubmVyV2lkdGg8NjAwJiZhKHRoaXMpLmNzcyh7bGVmdDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLnRvcFJpZ2h0PXtuYW1lOlwidG9wUmlnaHRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X3RvcFJpZ2h0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X3RvcFJpZ2h0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHt0b3A6MjAscmlnaHQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLHdpbmRvdy5pbm5lcldpZHRoPDYwMCYmYSh0aGlzKS5jc3Moe3JpZ2h0OjV9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LnRoZW1lcy5ib290c3RyYXBUaGVtZT17bmFtZTpcImJvb3RzdHJhcFRoZW1lXCIsbW9kYWw6e2Nzczp7cG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMTAwJVwiLGhlaWdodDpcIjEwMCVcIixiYWNrZ3JvdW5kQ29sb3I6XCIjMDAwXCIsekluZGV4OjFlNCxvcGFjaXR5Oi42LGRpc3BsYXk6XCJub25lXCIsbGVmdDowLHRvcDowfX0sc3R5bGU6ZnVuY3Rpb24oKXt2YXIgYj10aGlzLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3Rvcjtzd2l0Y2goYShiKS5hZGRDbGFzcyhcImxpc3QtZ3JvdXBcIiksdGhpcy4kY2xvc2VCdXR0b24uYXBwZW5kKCc8c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj4mdGltZXM7PC9zcGFuPjxzcGFuIGNsYXNzPVwic3Itb25seVwiPkNsb3NlPC9zcGFuPicpLHRoaXMuJGNsb3NlQnV0dG9uLmFkZENsYXNzKFwiY2xvc2VcIiksdGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtXCIpLmNzcyhcInBhZGRpbmdcIixcIjBweFwiKSx0aGlzLm9wdGlvbnMudHlwZSl7Y2FzZVwiYWxlcnRcIjpjYXNlXCJub3RpZmljYXRpb25cIjp0aGlzLiRiYXIuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwLWl0ZW0taW5mb1wiKTticmVhaztjYXNlXCJ3YXJuaW5nXCI6dGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtLXdhcm5pbmdcIik7YnJlYWs7Y2FzZVwiZXJyb3JcIjp0aGlzLiRiYXIuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwLWl0ZW0tZGFuZ2VyXCIpO2JyZWFrO2Nhc2VcImluZm9ybWF0aW9uXCI6dGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtLWluZm9cIik7YnJlYWs7Y2FzZVwic3VjY2Vzc1wiOnRoaXMuJGJhci5hZGRDbGFzcyhcImxpc3QtZ3JvdXAtaXRlbS1zdWNjZXNzXCIpfXRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjEzcHhcIixsaW5lSGVpZ2h0OlwiMTZweFwiLHRleHRBbGlnbjpcImNlbnRlclwiLHBhZGRpbmc6XCI4cHggMTBweCA5cHhcIix3aWR0aDpcImF1dG9cIixwb3NpdGlvbjpcInJlbGF0aXZlXCJ9KX0sY2FsbGJhY2s6e29uU2hvdzpmdW5jdGlvbigpe30sb25DbG9zZTpmdW5jdGlvbigpe319fSxhLm5vdHkudGhlbWVzLmRlZmF1bHRUaGVtZT17bmFtZTpcImRlZmF1bHRUaGVtZVwiLGhlbHBlcnM6e2JvcmRlckZpeDpmdW5jdGlvbigpe2lmKHRoaXMub3B0aW9ucy5kaXNtaXNzUXVldWUpe3ZhciBiPXRoaXMub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yK1wiIFwiK3RoaXMub3B0aW9ucy5sYXlvdXQucGFyZW50LnNlbGVjdG9yO3N3aXRjaCh0aGlzLm9wdGlvbnMubGF5b3V0Lm5hbWUpe2Nhc2VcInRvcFwiOmEoYikuY3NzKHtib3JkZXJSYWRpdXM6XCIwcHggMHB4IDBweCAwcHhcIn0pLGEoYikubGFzdCgpLmNzcyh7Ym9yZGVyUmFkaXVzOlwiMHB4IDBweCA1cHggNXB4XCJ9KTticmVhaztjYXNlXCJ0b3BDZW50ZXJcIjpjYXNlXCJ0b3BMZWZ0XCI6Y2FzZVwidG9wUmlnaHRcIjpjYXNlXCJib3R0b21DZW50ZXJcIjpjYXNlXCJib3R0b21MZWZ0XCI6Y2FzZVwiYm90dG9tUmlnaHRcIjpjYXNlXCJjZW50ZXJcIjpjYXNlXCJjZW50ZXJMZWZ0XCI6Y2FzZVwiY2VudGVyUmlnaHRcIjpjYXNlXCJpbmxpbmVcIjphKGIpLmNzcyh7Ym9yZGVyUmFkaXVzOlwiMHB4IDBweCAwcHggMHB4XCJ9KSxhKGIpLmZpcnN0KCkuY3NzKHtcImJvcmRlci10b3AtbGVmdC1yYWRpdXNcIjpcIjVweFwiLFwiYm9yZGVyLXRvcC1yaWdodC1yYWRpdXNcIjpcIjVweFwifSksYShiKS5sYXN0KCkuY3NzKHtcImJvcmRlci1ib3R0b20tbGVmdC1yYWRpdXNcIjpcIjVweFwiLFwiYm9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXNcIjpcIjVweFwifSk7YnJlYWs7Y2FzZVwiYm90dG9tXCI6YShiKS5jc3Moe2JvcmRlclJhZGl1czpcIjBweCAwcHggMHB4IDBweFwifSksYShiKS5maXJzdCgpLmNzcyh7Ym9yZGVyUmFkaXVzOlwiNXB4IDVweCAwcHggMHB4XCJ9KX19fX0sbW9kYWw6e2Nzczp7cG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMTAwJVwiLGhlaWdodDpcIjEwMCVcIixiYWNrZ3JvdW5kQ29sb3I6XCIjMDAwXCIsekluZGV4OjFlNCxvcGFjaXR5Oi42LGRpc3BsYXk6XCJub25lXCIsbGVmdDowLHRvcDowfX0sc3R5bGU6ZnVuY3Rpb24oKXtzd2l0Y2godGhpcy4kYmFyLmNzcyh7b3ZlcmZsb3c6XCJoaWRkZW5cIixiYWNrZ3JvdW5kOlwidXJsKCdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUJzQUFBQW9DQVFBQUFDbE0wbmRBQUFBaGtsRVFWUjRBZFhPMFFyQ01CQkUwYnR0a2szOC93OFdSRVJwZHlqelZPYytIeGhJSHFKR01RY0ZGa3BZUlFvdExMU3cwSUo1YUJkb3ZydU1ZREEva1Q4cGxGOVpLTEZRY2dGMThoRGoxU2JRT01sQ0E0a2FvMGlpWG1haDdxQldQZHhwb2hzZ1ZaeWo3ZTVJOUtjSUQrRWhpREk1Z3hCWUtMQlFZS0hBUW9HRkFvRWtzL1lFR0hZS0I3aEZ4ZjBBQUFBQVNVVk9SSzVDWUlJPScpIHJlcGVhdC14IHNjcm9sbCBsZWZ0IHRvcCAjZmZmXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsbGluZUhlaWdodDpcIjE2cHhcIix0ZXh0QWxpZ246XCJjZW50ZXJcIixwYWRkaW5nOlwiOHB4IDEwcHggOXB4XCIsd2lkdGg6XCJhdXRvXCIscG9zaXRpb246XCJyZWxhdGl2ZVwifSksdGhpcy4kY2xvc2VCdXR0b24uY3NzKHtwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOjQscmlnaHQ6NCx3aWR0aDoxMCxoZWlnaHQ6MTAsYmFja2dyb3VuZDpcInVybChkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFvQUFBQUtDQVFBQUFBbk93YzJBQUFBeFVsRVFWUjRBUjNNUFVvRFVSU0EwZSsrdVNra094QzNJQU9XTnRhQ0lEYUNoZmdYQk1FWmJRUkJ5eEN3aytCYXNnUVJaTFNZb0xnRFFiQVJ4cnk4bnl1bVBjVlJLRGZkMEFhOEFzZ0R2MXpwNnBZZDVqV093aHZlYlJUYnpOTkV3NUJTc0lwc2ova3VyUUJubWs3c0lGY0NGNXl5WlBEUkc2dHJRaHVqWFlvc2FGb2MrMmYxTUo4OXVjNzZJTkQ2RjlCdmxYVWRwYjZ4d0QyKzRxM21lM2J5c2lIdnRMWXJVSnRvN1BEL3ZlN0xOSHhTZy93b04ya1N6NHR4YXNCZGh5aXozdWdQR2V0VGptM1hSb2tBQUFBQVNVVk9SSzVDWUlJPSlcIixkaXNwbGF5Olwibm9uZVwiLGN1cnNvcjpcInBvaW50ZXJcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtwYWRkaW5nOjUsdGV4dEFsaWduOlwicmlnaHRcIixib3JkZXJUb3A6XCIxcHggc29saWQgI2NjY1wiLGJhY2tncm91bmRDb2xvcjpcIiNmZmZcIn0pLHRoaXMuJGJ1dHRvbnMuZmluZChcImJ1dHRvblwiKS5jc3Moe21hcmdpbkxlZnQ6NX0pLHRoaXMuJGJ1dHRvbnMuZmluZChcImJ1dHRvbjpmaXJzdFwiKS5jc3Moe21hcmdpbkxlZnQ6MH0pLHRoaXMuJGJhci5vbih7bW91c2VlbnRlcjpmdW5jdGlvbigpe2EodGhpcykuZmluZChcIi5ub3R5X2Nsb3NlXCIpLnN0b3AoKS5mYWRlVG8oXCJub3JtYWxcIiwxKX0sbW91c2VsZWF2ZTpmdW5jdGlvbigpe2EodGhpcykuZmluZChcIi5ub3R5X2Nsb3NlXCIpLnN0b3AoKS5mYWRlVG8oXCJub3JtYWxcIiwwKX19KSx0aGlzLm9wdGlvbnMubGF5b3V0Lm5hbWUpe2Nhc2VcInRvcFwiOnRoaXMuJGJhci5jc3Moe2JvcmRlclJhZGl1czpcIjBweCAwcHggNXB4IDVweFwiLGJvcmRlckJvdHRvbTpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyTGVmdDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyUmlnaHQ6XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pO2JyZWFrO2Nhc2VcInRvcENlbnRlclwiOmNhc2VcImNlbnRlclwiOmNhc2VcImJvdHRvbUNlbnRlclwiOmNhc2VcImlubGluZVwiOnRoaXMuJGJhci5jc3Moe2JvcmRlclJhZGl1czpcIjVweFwiLGJvcmRlcjpcIjFweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTNweFwiLHRleHRBbGlnbjpcImNlbnRlclwifSk7YnJlYWs7Y2FzZVwidG9wTGVmdFwiOmNhc2VcInRvcFJpZ2h0XCI6Y2FzZVwiYm90dG9tTGVmdFwiOmNhc2VcImJvdHRvbVJpZ2h0XCI6Y2FzZVwiY2VudGVyTGVmdFwiOmNhc2VcImNlbnRlclJpZ2h0XCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyUmFkaXVzOlwiNXB4XCIsYm9yZGVyOlwiMXB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsdGV4dEFsaWduOlwibGVmdFwifSk7YnJlYWs7Y2FzZVwiYm90dG9tXCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyUmFkaXVzOlwiNXB4IDVweCAwcHggMHB4XCIsYm9yZGVyVG9wOlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJMZWZ0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJSaWdodDpcIjJweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAtMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pO2JyZWFrO2RlZmF1bHQ6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyOlwiMnB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KX1zd2l0Y2godGhpcy5vcHRpb25zLnR5cGUpe2Nhc2VcImFsZXJ0XCI6Y2FzZVwibm90aWZpY2F0aW9uXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGRlwiLGJvcmRlckNvbG9yOlwiI0NDQ1wiLGNvbG9yOlwiIzQ0NFwifSk7YnJlYWs7Y2FzZVwid2FybmluZ1wiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkVBQThcIixib3JkZXJDb2xvcjpcIiNGRkMyMzdcIixjb2xvcjpcIiM4MjYyMDBcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgI0ZGQzIzN1wifSk7YnJlYWs7Y2FzZVwiZXJyb3JcIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCJyZWRcIixib3JkZXJDb2xvcjpcImRhcmtyZWRcIixjb2xvcjpcIiNGRkZcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250V2VpZ2h0OlwiYm9sZFwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCBkYXJrcmVkXCJ9KTticmVhaztjYXNlXCJpbmZvcm1hdGlvblwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiM1N0I3RTJcIixib3JkZXJDb2xvcjpcIiMwQjkwQzRcIixjb2xvcjpcIiNGRkZcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgIzBCOTBDNFwifSk7YnJlYWs7Y2FzZVwic3VjY2Vzc1wiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcImxpZ2h0Z3JlZW5cIixib3JkZXJDb2xvcjpcIiM1MEMyNEVcIixjb2xvcjpcImRhcmtncmVlblwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjNTBDMjRFXCJ9KTticmVhaztkZWZhdWx0OnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkZcIixib3JkZXJDb2xvcjpcIiNDQ0NcIixjb2xvcjpcIiM0NDRcIn0pfX0sY2FsbGJhY2s6e29uU2hvdzpmdW5jdGlvbigpe2Eubm90eS50aGVtZXMuZGVmYXVsdFRoZW1lLmhlbHBlcnMuYm9yZGVyRml4LmFwcGx5KHRoaXMpfSxvbkNsb3NlOmZ1bmN0aW9uKCl7YS5ub3R5LnRoZW1lcy5kZWZhdWx0VGhlbWUuaGVscGVycy5ib3JkZXJGaXguYXBwbHkodGhpcyl9fX0sYS5ub3R5LnRoZW1lcy5yZWxheD17bmFtZTpcInJlbGF4XCIsaGVscGVyczp7fSxtb2RhbDp7Y3NzOntwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIxMDAlXCIsaGVpZ2h0OlwiMTAwJVwiLGJhY2tncm91bmRDb2xvcjpcIiMwMDBcIix6SW5kZXg6MWU0LG9wYWNpdHk6LjYsZGlzcGxheTpcIm5vbmVcIixsZWZ0OjAsdG9wOjB9fSxzdHlsZTpmdW5jdGlvbigpe3N3aXRjaCh0aGlzLiRiYXIuY3NzKHtvdmVyZmxvdzpcImhpZGRlblwiLG1hcmdpbjpcIjRweCAwXCIsYm9yZGVyUmFkaXVzOlwiMnB4XCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxNHB4XCIsbGluZUhlaWdodDpcIjE2cHhcIix0ZXh0QWxpZ246XCJjZW50ZXJcIixwYWRkaW5nOlwiMTBweFwiLHdpZHRoOlwiYXV0b1wiLHBvc2l0aW9uOlwicmVsYXRpdmVcIn0pLHRoaXMuJGNsb3NlQnV0dG9uLmNzcyh7cG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDo0LHJpZ2h0OjQsd2lkdGg6MTAsaGVpZ2h0OjEwLGJhY2tncm91bmQ6XCJ1cmwoZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBb0FBQUFLQ0FRQUFBQW5Pd2MyQUFBQXhVbEVRVlI0QVIzTVBVb0RVUlNBMGUrK3VTa2tPeEMzSUFPV050YUNJRGFDaGZnWEJNRVpiUVJCeXhDd2srQmFzZ1FSWkxTWW9MZ0RRYkFSeHJ5OG55dW1QY1ZSS0RmZDBBYThBc2dEdjF6cDZwWWQ1aldPd2h2ZWJSVGJ6Tk5FdzVCU3NJcHNqL2t1clFCbm1rN3NJRmNDRjV5eVpQRFJHNnRyUWh1alhZb3NhRm9jKzJmMU1KODl1Yzc2SU5ENkY5QnZsWFVkcGI2eHdEMis0cTNtZTNieXNpSHZ0TFlyVUp0bzdQRC92ZTdMTkh4U2cvd29OMmtTejR0eGFzQmRoeWl6M3VnUEdldFRqbTNYUm9rQUFBQUFTVVZPUks1Q1lJST0pXCIsZGlzcGxheTpcIm5vbmVcIixjdXJzb3I6XCJwb2ludGVyXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7cGFkZGluZzo1LHRleHRBbGlnbjpcInJpZ2h0XCIsYm9yZGVyVG9wOlwiMXB4IHNvbGlkICNjY2NcIixiYWNrZ3JvdW5kQ29sb3I6XCIjZmZmXCJ9KSx0aGlzLiRidXR0b25zLmZpbmQoXCJidXR0b25cIikuY3NzKHttYXJnaW5MZWZ0OjV9KSx0aGlzLiRidXR0b25zLmZpbmQoXCJidXR0b246Zmlyc3RcIikuY3NzKHttYXJnaW5MZWZ0OjB9KSx0aGlzLiRiYXIub24oe21vdXNlZW50ZXI6ZnVuY3Rpb24oKXthKHRoaXMpLmZpbmQoXCIubm90eV9jbG9zZVwiKS5zdG9wKCkuZmFkZVRvKFwibm9ybWFsXCIsMSl9LG1vdXNlbGVhdmU6ZnVuY3Rpb24oKXthKHRoaXMpLmZpbmQoXCIubm90eV9jbG9zZVwiKS5zdG9wKCkuZmFkZVRvKFwibm9ybWFsXCIsMCl9fSksdGhpcy5vcHRpb25zLmxheW91dC5uYW1lKXtjYXNlXCJ0b3BcIjp0aGlzLiRiYXIuY3NzKHtib3JkZXJCb3R0b206XCIycHggc29saWQgI2VlZVwiLGJvcmRlckxlZnQ6XCIycHggc29saWQgI2VlZVwiLGJvcmRlclJpZ2h0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJUb3A6XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pO2JyZWFrO2Nhc2VcInRvcENlbnRlclwiOmNhc2VcImNlbnRlclwiOmNhc2VcImJvdHRvbUNlbnRlclwiOmNhc2VcImlubGluZVwiOnRoaXMuJGJhci5jc3Moe2JvcmRlcjpcIjFweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTNweFwiLHRleHRBbGlnbjpcImNlbnRlclwifSk7YnJlYWs7Y2FzZVwidG9wTGVmdFwiOmNhc2VcInRvcFJpZ2h0XCI6Y2FzZVwiYm90dG9tTGVmdFwiOmNhc2VcImJvdHRvbVJpZ2h0XCI6Y2FzZVwiY2VudGVyTGVmdFwiOmNhc2VcImNlbnRlclJpZ2h0XCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyOlwiMXB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsdGV4dEFsaWduOlwibGVmdFwifSk7YnJlYWs7Y2FzZVwiYm90dG9tXCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyVG9wOlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJMZWZ0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJSaWdodDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyQm90dG9tOlwiMnB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIC0ycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSk7YnJlYWs7ZGVmYXVsdDp0aGlzLiRiYXIuY3NzKHtib3JkZXI6XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pfXN3aXRjaCh0aGlzLm9wdGlvbnMudHlwZSl7Y2FzZVwiYWxlcnRcIjpjYXNlXCJub3RpZmljYXRpb25cIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkZGXCIsYm9yZGVyQ29sb3I6XCIjZGVkZWRlXCIsY29sb3I6XCIjNDQ0XCJ9KTticmVhaztjYXNlXCJ3YXJuaW5nXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGRUFBOFwiLGJvcmRlckNvbG9yOlwiI0ZGQzIzN1wiLGNvbG9yOlwiIzgyNjIwMFwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjRkZDMjM3XCJ9KTticmVhaztjYXNlXCJlcnJvclwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRjgxODFcIixib3JkZXJDb2xvcjpcIiNlMjUzNTNcIixjb2xvcjpcIiNGRkZcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250V2VpZ2h0OlwiYm9sZFwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCBkYXJrcmVkXCJ9KTticmVhaztjYXNlXCJpbmZvcm1hdGlvblwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiM3OEM1RTdcIixib3JkZXJDb2xvcjpcIiMzYmFkZDZcIixjb2xvcjpcIiNGRkZcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgIzBCOTBDNFwifSk7YnJlYWs7Y2FzZVwic3VjY2Vzc1wiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNCQ0Y1QkNcIixib3JkZXJDb2xvcjpcIiM3Y2RkNzdcIixjb2xvcjpcImRhcmtncmVlblwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjNTBDMjRFXCJ9KTticmVhaztkZWZhdWx0OnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkZcIixib3JkZXJDb2xvcjpcIiNDQ0NcIixjb2xvcjpcIiM0NDRcIn0pfX0sY2FsbGJhY2s6e29uU2hvdzpmdW5jdGlvbigpe30sb25DbG9zZTpmdW5jdGlvbigpe319fSx3aW5kb3cubm90eX0pOyIsIiQoZnVuY3Rpb24oKSB7XG4gICAgLy8gdGVtcFxuICAgICQoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIiwgXCJhW2hyZWY9JyNyZWZsaW5rJ11cIiwgZnVuY3Rpb24oKSB7cmV0dXJuIGZhbHNlO30pO1xuXG4gICAgdmFyIHVybFByZWZpeCA9ICcnO1xuXG4gICAgdmFyIGFqYXggPSB7XG4gICAgICAgIGNvbnRyb2w6IHtcbiAgICAgICAgICAgIHNlbmRGb3JtRGF0YTogZnVuY3Rpb24oZm9ybSwgdXJsLCBsb2dOYW1lLCBzdWNjZXNzQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vbiggXCJzdWJtaXRcIiwgZm9ybSwgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZiA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFGb3JtID0gJCh0aGlzKS5zZXJpYWxpemUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0QnV0dG9uID0gJCh0aGlzKS5maW5kKFwiYnV0dG9uW3R5cGU9c3VibWl0XVwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkQnV0dG9uVmFsdWUgPSBzdWJtaXRCdXR0b24uaHRtbCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHN1Ym1pdEJ1dHRvbi5hdHRyKFwiZGlzYWJsZWRcIiwgXCJkaXNhYmxlZFwiKS5odG1sKCc8aSBjbGFzcz1cImZhIGZhLWNvZyBmYS1zcGluXCI+PC9pPicpO1xuXG4gICAgICAgICAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IFwicG9zdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiB1cmxQcmVmaXggKyB1cmwsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBkYXRhRm9ybSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gJC5wYXJzZUpTT04ocmVzcG9uc2UpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVzcG9uc2UuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGtleSBpbiByZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVzcG9uc2Vba2V5XVswXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZvcm1FcnJvciA9IG5vdHkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCe0YjQuNCx0LrQsCE8L2I+IFwiICsgcmVzcG9uc2Vba2V5XVswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNzAwMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc0NhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihqcXhocikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9ycy5jb250cm9sLmxvZyhsb2dOYW1lLCBqcXhocik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZm9ybUVycm9yQWpheCA9IG5vdHkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCi0LXRhdC90LjRh9C10YHQutC40LUg0YDQsNCx0L7RgtGLITwvYj48YnI+0JIg0LTQsNC90L3Ri9C5INC80L7QvNC10L3RgiDQstGA0LXQvNC10L3QuFwiICsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIg0L/RgNC+0LjQt9Cy0LXQtNGR0L3QvdC+0LUg0LTQtdC50YHRgtCy0LjQtSDQvdC10LLQvtC30LzQvtC20L3Qvi4g0J/QvtC/0YDQvtCx0YPQudGC0LUg0L/QvtC30LbQtS5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIg0J/RgNC40L3QvtGB0LjQvCDRgdCy0L7QuCDQuNC30LLQuNC90LXQvdC40Y8g0LfQsCDQvdC10YPQtNC+0LHRgdGC0LLQvi5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3dhcm5pbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiAxMDAwMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJtaXRCdXR0b24ucmVtb3ZlQXR0cihcImRpc2FibGVkXCIpLmh0bWwob2xkQnV0dG9uVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBlcnJvcnMgPSB7XG4gICAgICAgIGNvbnRyb2w6IHtcbiAgICAgICAgICAgIGxvZzogZnVuY3Rpb24odHlwZSwganF4aHIpIHtcbiAgICAgICAgICAgICAgICAkKFwiPGRpdiBpZD0nZXJyb3ItY29udGFpbmVyJyBzdHlsZT0nZGlzcGxheTpub25lOyc+XCIgKyBqcXhoci5yZXNwb25zZVRleHQgKyBcIjwvZGl2PlwiKS5hcHBlbmRUbyhcImJvZHlcIik7XG5cbiAgICAgICAgICAgICAgICB2YXIgZXJyb3JDb250YWluZXIgPSAkKFwiI2Vycm9yLWNvbnRhaW5lclwiKSxcbiAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2UgPSB0eXBlICsgXCI6IFwiICsganF4aHIuc3RhdHVzICsgXCIgXCIgKyBqcXhoci5zdGF0dXNUZXh0ICsgXCIgXCI7XG5cbiAgICAgICAgICAgICAgICBpZihlcnJvckNvbnRhaW5lci5maW5kKFwiaDI6Zmlyc3RcIikudGV4dCgpID09IFwiRGV0YWlsc1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZSArPSBcIi0gXCI7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yQ29udGFpbmVyLmZpbmQoXCJkaXZcIikuZWFjaChmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoaW5kZXggPiA0KSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGVsaW1pdGVyID0gXCIsIFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoaW5kZXggPT0gNCkgZGVsaW1pdGVyID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZSArPSAkKHRoaXMpLnRleHQoKSArIGRlbGltaXRlcjtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiBcInBvc3RcIixcbiAgICAgICAgICAgICAgICAgICAgdXJsOiB1cmxQcmVmaXggKyBcIi9hamF4LWVycm9yXCIsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IFwibWVzc2FnZT1cIiArIGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGVycm9yQ29udGFpbmVyLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHNldHRpbmdzID0ge1xuICAgICAgICBjb250cm9sOiB7XG4gICAgICAgICAgICBldmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGFqYXguY29udHJvbC5zZW5kRm9ybURhdGEoXCIjdG9wIGZvcm1bbmFtZT11c2VyLXNldHRpbmdzXVwiLCBcIi9hY2NvdW50L3NldHRpbmdzL2NoYW5nZS1zZXR0aW5nc1wiLCBcIkFjY291bnQgU2V0dGluZ3MgQWpheCBFcnJvclwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJChcIiN0b3AgZm9ybVtuYW1lPXVzZXItc2V0dGluZ3NdXCIpLmF0dHIoXCJuYW1lXCIsIFwidmFsaWQtZGF0YS1zZXR0aW5nc1wiKTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgc2V0dGluZ3NTdWNjZXNzID0gbm90eSh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCf0L7Qt9C00YDQsNCy0LvRj9C10LwhPC9iPjxicj7QmNC90YTQvtGA0LzQsNGG0LjRjyDRg9GB0L/QtdGI0L3QviDQvtCx0L3QvtCy0LvQtdC90LAuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDcwMDBcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoXCIjdG9wIGZvcm1bbmFtZT12YWxpZC1kYXRhLXNldHRpbmdzXVwiKS5zdWJtaXQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMTUwMCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBhamF4LmNvbnRyb2wuc2VuZEZvcm1EYXRhKFwiI3RvcCBmb3JtW25hbWU9dXNlci1wYXNzd29yZF1cIiwgXCIvYWNjb3VudC9zZXR0aW5ncy9jaGFuZ2UtcGFzc3dvcmRcIiwgXCJBY2NvdW50IFBhc3N3b3JkIEFqYXggRXJyb3JcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXNzd29yZFN1Y2Nlc3MgPSBub3R5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0J/QvtC30LTRgNCw0LLQu9GP0LXQvCE8L2I+PGJyPtCf0LDRgNC+0LvRjCDRg9GB0L/QtdGI0L3QviDQuNC30LzQtdC90ZHQvS5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46ICdhbmltYXRlZCBmYWRlSW5MZWZ0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlZWQ6IDMwMFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiAncmVsYXgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNzAwMFxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAkKFwiI3RvcCBmb3JtW25hbWU9dXNlci1wYXNzd29yZF1cIilbMF0ucmVzZXQoKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICQoJyN0b3AgaW5wdXRbcmVmPWRhdGVdJykuZGF0ZXBpY2tlcih7XG4gICAgICAgICAgICAgICAgICAgIGRhdGVGb3JtYXQ6IFwieXl5eS1tbS1kZFwiXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9ICAgXG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIHZhciBiYWxhbmNlID0ge1xuICAgICAgICBjb250cm9sOiB7XG4gICAgICAgICAgICBldmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBjb25maXJtQmFsYW5jZSA9ICQoXCIjdWluZm9cIikuYXR0cihcImRhdGEtYmFsYW5jZVwiKSxcbiAgICAgICAgICAgICAgICAgICAgICBzdGF0dXMgPSAkKFwiI3VpbmZvXCIpLmF0dHIoXCJkYXRhLXN0YXR1c1wiKTtcblxuICAgICAgICAgICAgICAgIENpcmNsZXMuY3JlYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdicm9uemUnLFxuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDEwMCxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGNvbmZpcm1CYWxhbmNlLFxuICAgICAgICAgICAgICAgICAgICBtYXhWYWx1ZTogNTAwLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogKHN0YXR1cyA9PSBcImRlZmF1bHRcIiA/IDIwIDogMTApLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlICsgJyA8c3BhbiBjbGFzcz1cImZhIGZhLXJ1YlwiPjwvc3Bhbj4nO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBjb2xvcnM6ICBbJyNFQzhCNkMnLCAnIzg3MjYwQyddLFxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogNTAwLFxuICAgICAgICAgICAgICAgICAgICB3cnBDbGFzczogJ2NpcmNsZXMtd3JwJyxcbiAgICAgICAgICAgICAgICAgICAgdGV4dENsYXNzOiAgJ2NpcmNsZXMtdGV4dCcsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlU3Ryb2tlQ2xhc3M6ICAnY2lyY2xlcy12YWx1ZVN0cm9rZScsXG4gICAgICAgICAgICAgICAgICAgIG1heFZhbHVlU3Ryb2tlQ2xhc3M6ICdjaXJjbGVzLW1heFZhbHVlU3Ryb2tlJyxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVXcmFwcGVyOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZVRleHQ6ICB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBDaXJjbGVzLmNyZWF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnc2lsdmVyJyxcbiAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiAxMDAsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjb25maXJtQmFsYW5jZSxcbiAgICAgICAgICAgICAgICAgICAgbWF4VmFsdWU6IDMwMDAsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAoc3RhdHVzID09IFwiYnJvbnplXCIgPyAyMCA6IDEwKSxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogZnVuY3Rpb24odmFsdWUpe3JldHVybiB2YWx1ZSArICcgPHNwYW4gY2xhc3M9XCJmYSBmYS1ydWJcIj48L3NwYW4+Jzt9LFxuICAgICAgICAgICAgICAgICAgICBjb2xvcnM6ICBbJyNFM0UzRTMnLCAnIzlEOUQ5QiddLFxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogNjAwLFxuICAgICAgICAgICAgICAgICAgICB3cnBDbGFzczogJ2NpcmNsZXMtd3JwJyxcbiAgICAgICAgICAgICAgICAgICAgdGV4dENsYXNzOiAgJ2NpcmNsZXMtdGV4dCcsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlU3Ryb2tlQ2xhc3M6ICAnY2lyY2xlcy12YWx1ZVN0cm9rZScsXG4gICAgICAgICAgICAgICAgICAgIG1heFZhbHVlU3Ryb2tlQ2xhc3M6ICdjaXJjbGVzLW1heFZhbHVlU3Ryb2tlJyxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVXcmFwcGVyOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZVRleHQ6ICB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBDaXJjbGVzLmNyZWF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnZ29sZCcsXG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogMTAwLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY29uZmlybUJhbGFuY2UsXG4gICAgICAgICAgICAgICAgICAgIG1heFZhbHVlOiA3MDAwLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogKHN0YXR1cyA9PSBcInNpbHZlclwiID8gMjAgOiAxMCksXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IGZ1bmN0aW9uKHZhbHVlKXtyZXR1cm4gdmFsdWUgKyAnIDxzcGFuIGNsYXNzPVwiZmEgZmEtcnViXCI+PC9zcGFuPic7fSxcbiAgICAgICAgICAgICAgICAgICAgY29sb3JzOiAgWycjRkNCODRCJywgJyNENTg0MTcnXSxcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IDcwMCxcbiAgICAgICAgICAgICAgICAgICAgd3JwQ2xhc3M6ICdjaXJjbGVzLXdycCcsXG4gICAgICAgICAgICAgICAgICAgIHRleHRDbGFzczogICdjaXJjbGVzLXRleHQnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZVN0cm9rZUNsYXNzOiAgJ2NpcmNsZXMtdmFsdWVTdHJva2UnLFxuICAgICAgICAgICAgICAgICAgICBtYXhWYWx1ZVN0cm9rZUNsYXNzOiAnY2lyY2xlcy1tYXhWYWx1ZVN0cm9rZScsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlV3JhcHBlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVUZXh0OiAgdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgQ2lyY2xlcy5jcmVhdGUoe1xuICAgICAgICAgICAgICAgICAgICBpZDogJ3BsYXRpbnVtJyxcbiAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiAxMDAsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjb25maXJtQmFsYW5jZSxcbiAgICAgICAgICAgICAgICAgICAgbWF4VmFsdWU6IDEwMDAwLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogKHN0YXR1cyA9PSBcImdvbGRcIiA/IDIwIDogMTApLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBmdW5jdGlvbih2YWx1ZSl7cmV0dXJuIHZhbHVlICsgJyA8c3BhbiBjbGFzcz1cImZhIGZhLXJ1YlwiPjwvc3Bhbj4nO30sXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yczogIFsnIzlEOUQ5QicsICcjMDYwNjA2J10sXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgICAgIHdycENsYXNzOiAnY2lyY2xlcy13cnAnLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0Q2xhc3M6ICAnY2lyY2xlcy10ZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVTdHJva2VDbGFzczogICdjaXJjbGVzLXZhbHVlU3Ryb2tlJyxcbiAgICAgICAgICAgICAgICAgICAgbWF4VmFsdWVTdHJva2VDbGFzczogJ2NpcmNsZXMtbWF4VmFsdWVTdHJva2UnLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZVdyYXBwZXI6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlVGV4dDogIHRydWVcbiAgICAgICAgICAgICAgICB9KTsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgZmF2b3JpdGVzID0ge1xuICAgICAgICBjb250cm9sOiB7XG4gICAgICAgICAgICBldmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuZmF2b3JpdGUtbGlua1wiKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGYgPSAkKHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdHlwZSA9IHNlbGYuYXR0cihcImRhdGEtc3RhdGVcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFmZmlsaWF0ZV9pZCA9IHNlbGYuYXR0cihcImRhdGEtYWZmaWxpYXRlLWlkXCIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKHR5cGUgPT0gXCJhZGRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5maW5kKFwiLmZhXCIpLnJlbW92ZUNsYXNzKFwibXV0ZWRcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzZWxmLmZpbmQoXCIuZmFcIikucmVtb3ZlQ2xhc3MoXCJwdWxzZTJcIikuYWRkQ2xhc3MoXCJmYS1zcGluXCIpO1xuXG4gICAgICAgICAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IFwicG9zdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiB1cmxQcmVmaXggKyBcIi9hY2NvdW50L2Zhdm9yaXRlc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogXCJ0eXBlPVwiICsgdHlwZSArIFwiJmFmZmlsaWF0ZV9pZD1cIiArIGFmZmlsaWF0ZV9pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoanF4aHIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcnMuY29udHJvbC5sb2coJ0Zhdm9yaXRlcyBBamF4IEVycm9yJywganF4aHIpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZhdkVycm9yQWpheCA9IG5vdHkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCi0LXRhdC90LjRh9C10YHQutC40LUg0YDQsNCx0L7RgtGLITwvYj48YnI+0JIg0LTQsNC90L3Ri9C5INC80L7QvNC10L3RgiDQstGA0LXQvNC10L3QuFwiICsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIg0L/RgNC+0LjQt9Cy0LXQtNGR0L3QvdC+0LUg0LTQtdC50YHRgtCy0LjQtSDQvdC10LLQvtC30LzQvtC20L3Qvi4g0J/QvtC/0YDQvtCx0YPQudGC0LUg0L/QvtC30LbQtS5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIg0J/RgNC40L3QvtGB0LjQvCDRgdCy0L7QuCDQuNC30LLQuNC90LXQvdC40Y8g0LfQsCDQvdC10YPQtNC+0LHRgdGC0LLQvi5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3dhcm5pbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiAxMDAwMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodHlwZSA9PSBcImFkZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZmluZChcIi5mYVwiKS5hZGRDbGFzcyhcIm11dGVkXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZmluZChcIi5mYVwiKS5yZW1vdmVDbGFzcyhcImZhLXNwaW5cIikuYWRkQ2xhc3MoXCJwdWxzZTJcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSAkLnBhcnNlSlNPTihyZXNwb25zZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihyZXNwb25zZS5lcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3Ioa2V5IGluIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihyZXNwb25zZVtrZXldWzBdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmF2b3JpdGVzRXJyb3IgPSBub3R5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCI8Yj7QntGI0LjQsdC60LAhPC9iPiBcIiArIHJlc3BvbnNlW2tleV1bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiAncmVsYXgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICd0b3BSaWdodCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDcwMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHR5cGUgPT0gXCJhZGRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5maW5kKFwiLmZhXCIpLmFkZENsYXNzKFwibXV0ZWRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmZpbmQoXCIuZmFcIikucmVtb3ZlQ2xhc3MoXCJmYS1zcGluXCIpLmFkZENsYXNzKFwicHVsc2UyXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmYXZvcml0ZXNTdWNjZXNzID0gbm90eSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiByZXNwb25zZS5tc2csXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDcwMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodHlwZSA9PSBcImFkZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmF0dHIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS1zdGF0ZVwiOiBcImRlbGV0ZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS1vcmlnaW5hbC10aXRsZVwiOiBcItCj0LTQsNC70LjRgtGMINC40Lcg0LjQt9Cx0YDQsNC90L3QvtCz0L5cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZmluZChcIi5mYVwiKS5yZW1vdmVDbGFzcyhcImZhLXNwaW4gZmEtc3Rhci1vXCIpLmFkZENsYXNzKFwicHVsc2UyIGZhLXN0YXJcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZih0eXBlID09IFwiZGVsZXRlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYXR0cih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLXN0YXRlXCI6IFwiYWRkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLW9yaWdpbmFsLXRpdGxlXCIgOiBcItCU0L7QsdCw0LLQuNGC0Ywg0LIg0LjQt9Cx0YDQsNC90L3QvtC1XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pOyAgICAgICAgICAgICAgICAgICBcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5maW5kKFwiLmZhXCIpLnJlbW92ZUNsYXNzKFwiZmEtc3BpbiBmYS1zdGFyXCIpLmFkZENsYXNzKFwicHVsc2UyIGZhLXN0YXItbyBtdXRlZFwiKTsgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pOyAgICAgICBcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGhlYWRlciA9IHtcbiAgICAgICAgY29udHJvbDoge1xuICAgICAgICAgICAgZXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZigkKHdpbmRvdykud2lkdGgoKSA+IDk5MSkge1xuICAgICAgICAgICAgICAgICAgICAkKFwiI3NlYXJjaFwiKS5hdXRvY29tcGxldGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VydmljZVVybDogJy9zZWFyY2gnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9DYWNoZTogJ3RydWUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJSZXF1ZXN0Qnk6IDMwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9ICcvc3RvcmVzLycgKyBzdWdnZXN0aW9uLmRhdGEucm91dGU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICQoXCIuZG9icm9oZWFkIGlcIikuYW5pbW8oe2FuaW1hdGlvbjogXCJwdWxzZVwiLCBpdGVyYXRlOiBcImluZmluaXRlXCJ9KTtcbiAgICAgICAgICAgICAgICAkKFwiLmxpbmstaGVhZC1zdG9yZXMgc3BhblwiKS5hbmltbyh7YW5pbWF0aW9uOiBcImZsYXNoXCIsIGl0ZXJhdGU6IFwiaW5maW5pdGVcIiwgZHVyYXRpb246IDIuNH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHdpdGhkcmF3ID0ge1xuICAgICAgICBjb250cm9sOiB7XG4gICAgICAgICAgICBldmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuYWNjb3VudC13aXRoZHJhdyAub3B0aW9uIGFcIikuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxmID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uID0gc2VsZi5wYXJlbnQoKS5hdHRyKFwiZGF0YS1vcHRpb24tcHJvY2Vzc1wiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXIgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAkKFwiI3RvcFwiKS5maW5kKFwiLmFjY291bnQtd2l0aGRyYXcgLm9wdGlvbiBhXCIpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xuXG4gICAgICAgICAgICAgICAgICAgICQoXCIjdG9wXCIpLmZpbmQoXCJmb3JtW25hbWU9d2l0aGRyYXctZm9ybV1cIikuZmluZChcImlucHV0W25hbWU9d2l0aGRyYXctcHJvY2Vzc11cIikudmFsKG9wdGlvbik7XG5cbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoKG9wdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIjFcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyID0gXCLQktCy0LXQtNC40YLQtSDQvdC+0LzQtdGAINGB0YfRkdGC0LBcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiMlwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXIgPSBcItCS0LLQtdC00LjRgtC1INC90L7QvNC10YAgUi3QutC+0YjQtdC70YzQutCwXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIjNcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyID0gXCLQktCy0LXQtNC40YLQtSDQvdC+0LzQtdGAINGC0LXQu9C10YTQvtC90LBcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiNFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXIgPSBcItCS0LLQtdC00LjRgtC1INC90L7QvNC10YAg0LrQsNGA0YLRi1wiO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCI1XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlciA9IFwi0JLQstC10LTQuNGC0LUgZW1haWwg0LDQtNGA0LXRgVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCI2XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlciA9IFwi0JLQstC10LTQuNGC0LUg0L3QvtC80LXRgCDRgtC10LvQtdGE0L7QvdCwXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICQoXCIjdG9wXCIpLmZpbmQoXCJmb3JtW25hbWU9d2l0aGRyYXctZm9ybV1cIikuZmluZChcImlucHV0W25hbWU9YmlsbF1cIikuYXR0cihcInBsYWNlaG9sZGVyXCIsIHBsYWNlaG9sZGVyKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBhamF4LmNvbnRyb2wuc2VuZEZvcm1EYXRhKFwiI3RvcCBmb3JtW25hbWU9d2l0aGRyYXctZm9ybV1cIiwgXCIvYWNjb3VudC93aXRoZHJhd1wiLCBcIldpdGhkcmF3IEFqYXggRXJyb3JcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB3aXRoZHJhd1N1Y2Nlc3MgPSBub3R5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0J/QvtC30LTRgNCw0LLQu9GP0LXQvCE8L2I+PGJyPtCX0LDQv9GA0L7RgSDQvdCwINCy0YvQstC+0LQg0LTQtdC90LXQsyDQsdGL0Lsg0YPRgdC/0LXRiNC90L4g0LLRi9C/0L7Qu9C90LXQvS5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46ICdhbmltYXRlZCBmYWRlSW5MZWZ0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlZWQ6IDMwMFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiAncmVsYXgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNzAwMFxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAkKFwiI3RvcCBmb3JtW25hbWU9d2l0aGRyYXctZm9ybV1cIilbMF0ucmVzZXQoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBjaGFyaXR5ID0ge1xuICAgICAgICBjb250cm9sOiB7XG4gICAgICAgICAgICBldmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuYWNjb3VudC1mdW5kLXRyYW5zZmVyIC5vcHRpb24gYVwiKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGYgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb24gPSBzZWxmLnBhcmVudCgpLmF0dHIoXCJkYXRhLW9wdGlvbi1wcm9jZXNzXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlciA9IFwiXCI7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHRpdGxlRnVuZCA9IHNlbGYucHJldihcIi50aXRsZVwiKS50ZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgICQoXCIudG8tZnVuZCBzcGFuXCIpLnRleHQodGl0bGVGdW5kKTtcblxuICAgICAgICAgICAgICAgICAgICAkKFwiI3RvcFwiKS5maW5kKFwiLmFjY291bnQtZnVuZC10cmFuc2ZlciAub3B0aW9uIGFcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XG5cbiAgICAgICAgICAgICAgICAgICAgJChcIiN0b3BcIikuZmluZChcImZvcm1bbmFtZT1mdW5kLXRyYW5zZmVyLWZvcm1dXCIpLmZpbmQoXCJpbnB1dFtuYW1lPWNoYXJpdHktcHJvY2Vzc11cIikudmFsKG9wdGlvbik7XG5cbiAgICAgICAgICAgICAgICAgICAgJChcIiN0b3BcIikuZmluZChcIi5hY2NvdW50LWZ1bmQtdHJhbnNmZXIgLmF1dG9wYXltZW50LWluZm9cIikuY3NzKFwiZGlzcGxheVwiLCBcImJsb2NrXCIpO1xuICAgICAgICAgICAgICAgICAgICAkKFwiI3RvcFwiKS5maW5kKFwiZm9ybVtuYW1lPWF1dG9wYXltZW50LWZvcm1dXCIpLmZpbmQoXCJpbnB1dFtuYW1lPWF1dG9wYXltZW50LXVpZF1cIikudmFsKG9wdGlvbik7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgYWpheC5jb250cm9sLnNlbmRGb3JtRGF0YShcIiN0b3AgZm9ybVtuYW1lPWZ1bmQtdHJhbnNmZXItZm9ybV1cIiwgXCIvYWNjb3VudC9kb2Jyby9zZW5kXCIsIFwiRnVuZCBUcmFuc2ZlciBBamF4IEVycm9yXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgd2l0aGRyYXdTdWNjZXNzID0gbm90eSh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCf0L7Qt9C00YDQsNCy0LvRj9C10LwhPC9iPjxicj7QlNC10L3QtdC20L3Ri9C1INGB0YDQtdC00YHRgtCy0LAg0YPRgdC/0LXRiNC90L4g0L/QtdGA0LXQstC10LTQtdC90YsuINCh0L/QsNGB0LjQsdC+INC30LAg0JLQsNGI0YMg0L/QvtC80L7RidGMLiDQmNGB0YLQvtGA0LjRjiDQktCw0YjQuNGFINC00L7QsdGA0YvRhSDQtNC10Lsg0LLRiyDQvNC+0LbQtdGC0LUg0L/QvtGB0LzQvtGC0YDQtdGC0Ywg0LIgPGEgaHJlZj0nL2FjY291bnQvY2hhcml0eSc+0LvQuNGH0L3QvtC8INC60LDQsdC40L3QtdGC0LU8L2E+LlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiAnYW5pbWF0ZWQgZmxpcE91dFgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICd0b3BSaWdodCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA3MDAwXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICQoXCIjdG9wIGZvcm1bbmFtZT1mdW5kLXRyYW5zZmVyLWZvcm1dXCIpWzBdLnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBhamF4LmNvbnRyb2wuc2VuZEZvcm1EYXRhKFwiI3RvcCBmb3JtW25hbWU9YXV0b3BheW1lbnQtZm9ybV1cIiwgXCIvYWNjb3VudC9kb2Jyby9hdXRvLXNlbmRcIiwgXCJBdXRvIFBheW1lbnQgQWpheCBFcnJvclwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdpdGhkcmF3U3VjY2VzcyA9IG5vdHkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCI8Yj7Qn9C+0LfQtNGA0LDQstC70Y/QtdC8ITwvYj48YnI+0JDQstGC0L7Qv9C70LDRgtGR0LYg0LHRi9C7INGD0YHQv9C10YjQvdC+INGD0YHRgtCw0L3QvtCy0LvQtdC9LlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiAnYW5pbWF0ZWQgZmxpcE91dFgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICd0b3BSaWdodCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA3MDAwXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgYWpheC5jb250cm9sLnNlbmRGb3JtRGF0YShcIiN0b3AgZm9ybVtuYW1lPWRlbGV0ZS1hdXRvcGF5bWVudC1mb3JtXVwiLCBcIi9hY2NvdW50L2RvYnJvL2F1dG8tZGVsZXRlXCIsIFwiRGVsZXRlIEF1dG8gUGF5bWVudCBBamF4IEVycm9yXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgd2l0aGRyYXdTdWNjZXNzID0gbm90eSh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCf0L7Qt9C00YDQsNCy0LvRj9C10LwhPC9iPjxicj7QkNCy0YLQvtC/0LvQsNGC0ZHQtiDQsdGL0Lsg0YPRgdC/0LXRiNC90L4g0YPQtNCw0LvRkdC9LlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiAnYW5pbWF0ZWQgZmxpcE91dFgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICd0b3BSaWdodCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA3MDAwXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuc2VsZi1hdXRvcGF5bWVudFwiKS5wYXJlbnQoKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBzdXBwb3J0ID0ge1xuICAgICAgICBjb250cm9sOiB7XG4gICAgICAgICAgICBldmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGFqYXguY29udHJvbC5zZW5kRm9ybURhdGEoXCIjdG9wIGZvcm1bbmFtZT1zdXBwb3J0LWZvcm1dXCIsIFwiL2FjY291bnQvc3VwcG9ydFwiLCBcIlN1cHBvcnQgQWpheCBFcnJvclwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN1cHBvcnRTdWNjZXNzID0gbm90eSh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCf0L7Qt9C00YDQsNCy0LvRj9C10LwhPC9iPjxicj7Ql9Cw0L/RgNC+0YEg0LIg0YHQu9GD0LbQsdGDINC/0L7QtNC00LXRgNC20LrQuCDQsdGL0Lsg0YPRgdC/0LXRiNC90L4g0L7RgtC/0YDQsNCy0LvQtdC9LlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiAnYW5pbWF0ZWQgZmxpcE91dFgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICd0b3BSaWdodCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA3MDAwXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICQoXCIjdG9wIGZvcm1bbmFtZT1zdXBwb3J0LWZvcm1dXCIpWzBdLnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdXBwb3J0LmNvbnRyb2wuZXZlbnRzKCk7XG4gICAgd2l0aGRyYXcuY29udHJvbC5ldmVudHMoKTtcbiAgICBjaGFyaXR5LmNvbnRyb2wuZXZlbnRzKCk7XG4gICAgc2V0dGluZ3MuY29udHJvbC5ldmVudHMoKTtcbiAgICBiYWxhbmNlLmNvbnRyb2wuZXZlbnRzKCk7XG4gICAgZmF2b3JpdGVzLmNvbnRyb2wuZXZlbnRzKCk7XG4gICAgaGVhZGVyLmNvbnRyb2wuZXZlbnRzKCk7XG59KTtcblxuJChmdW5jdGlvbigpe1xuICAgICQoXCJpbnB1dC5saW5rXCIpLmNsaWNrKGZ1bmN0aW9uKCl7XHQvLyDQv9C+0LvRg9GH0LXQvdC40LUg0YTQvtC60YPRgdCwINGC0LXQutGB0YLQvtCy0YvQvCDQv9C+0LvQtdC8LdGB0YHRi9C70LrQvtC5XG4gICAgICAgICQodGhpcykuc2VsZWN0KCk7XG4gICAgfSk7XG59KTtcbiIsIjsoZnVuY3Rpb24gKCAkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQgKSB7XG5cbiAgLyoqXG4gICAqIGFuaW1vIGlzIGEgcG93ZXJmdWwgbGl0dGxlIHRvb2wgdGhhdCBtYWtlcyBtYW5hZ2luZyBDU1MgYW5pbWF0aW9ucyBleHRyZW1lbHkgZWFzeS4gU3RhY2sgYW5pbWF0aW9ucywgc2V0IGNhbGxiYWNrcywgbWFrZSBtYWdpYy5cbiAgICogTW9kZXJuIGJyb3dzZXJzIGFuZCBhbG1vc3QgYWxsIG1vYmlsZSBicm93c2VycyBzdXBwb3J0IENTUyBhbmltYXRpb25zIChodHRwOi8vY2FuaXVzZS5jb20vY3NzLWFuaW1hdGlvbikuXG4gICAqXG4gICAqIEBhdXRob3IgRGFuaWVsIFJhZnRlcnkgOiB0d2l0dGVyL1Rocml2aW5nS2luZ3NcbiAgICogQHZlcnNpb24gMS4wLjFcbiAgKi9cbiAgZnVuY3Rpb24gYW5pbW8oIGVsZW1lbnQsIG9wdGlvbnMsIGNhbGxiYWNrLCBvdGhlcl9jYiApIHtcbiAgICBcbiAgICAvLyBEZWZhdWx0IGNvbmZpZ3VyYXRpb25cbiAgICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgXHRkdXJhdGlvbjogMSxcbiAgICBcdGFuaW1hdGlvbjogbnVsbCxcbiAgICBcdGl0ZXJhdGU6IDEsXG4gICAgXHR0aW1pbmc6IFwibGluZWFyXCIsXG4gICAgICBrZWVwOiBmYWxzZVxuICAgIH07XG5cbiAgICAvLyBCcm93c2VyIHByZWZpeGVzIGZvciBDU1NcbiAgICB0aGlzLnByZWZpeGVzID0gW1wiXCIsIFwiLW1vei1cIiwgXCItby1hbmltYXRpb24tXCIsIFwiLXdlYmtpdC1cIl07XG5cbiAgICAvLyBDYWNoZSB0aGUgZWxlbWVudFxuICAgIHRoaXMuZWxlbWVudCA9ICQoZWxlbWVudCk7XG5cbiAgICB0aGlzLmJhcmUgPSBlbGVtZW50O1xuXG4gICAgLy8gRm9yIHN0YWNraW5nIG9mIGFuaW1hdGlvbnNcbiAgICB0aGlzLnF1ZXVlID0gW107XG5cbiAgICAvLyBIYWNreVxuICAgIHRoaXMubGlzdGVuaW5nID0gZmFsc2U7XG5cbiAgICAvLyBGaWd1cmUgb3V0IHdoZXJlIHRoZSBjYWxsYmFjayBpc1xuICAgIHZhciBjYiA9ICh0eXBlb2YgY2FsbGJhY2sgPT0gXCJmdW5jdGlvblwiID8gY2FsbGJhY2sgOiBvdGhlcl9jYik7XG5cbiAgICAvLyBPcHRpb25zIGNhbiBzb21ldGltZXMgYmUgYSBjb21tYW5kXG4gICAgc3dpdGNoKG9wdGlvbnMpIHtcblxuICAgICAgY2FzZSBcImJsdXJcIjpcblxuICAgICAgXHRkZWZhdWx0cyA9IHtcbiAgICAgIFx0XHRhbW91bnQ6IDMsXG4gICAgICBcdFx0ZHVyYXRpb246IDAuNSxcbiAgICAgIFx0XHRmb2N1c0FmdGVyOiBudWxsXG4gICAgICBcdH07XG5cbiAgICAgIFx0dGhpcy5vcHRpb25zID0gJC5leHRlbmQoIGRlZmF1bHRzLCBjYWxsYmFjayApO1xuXG4gIFx0ICAgIHRoaXMuX2JsdXIoY2IpO1xuXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwiZm9jdXNcIjpcblxuICBcdCAgXHR0aGlzLl9mb2N1cygpO1xuXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwicm90YXRlXCI6XG5cbiAgICAgICAgZGVmYXVsdHMgPSB7XG4gICAgICAgICAgZGVncmVlczogMTUsXG4gICAgICAgICAgZHVyYXRpb246IDAuNVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKCBkZWZhdWx0cywgY2FsbGJhY2sgKTtcblxuICAgICAgICB0aGlzLl9yb3RhdGUoY2IpO1xuXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwiY2xlYW5zZVwiOlxuXG4gICAgICAgIHRoaXMuY2xlYW5zZSgpO1xuXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuXG5cdCAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCggZGVmYXVsdHMsIG9wdGlvbnMgKTtcblxuXHQgICAgdGhpcy5pbml0KGNiKTtcbiAgXHRcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGFuaW1vLnByb3RvdHlwZSA9IHtcblxuICAgIC8vIEEgc3RhbmRhcmQgQ1NTIGFuaW1hdGlvblxuICAgIGluaXQ6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICBcbiAgICAgIHZhciAkbWUgPSB0aGlzO1xuXG4gICAgICAvLyBBcmUgd2Ugc3RhY2tpbmcgYW5pbWF0aW9ucz9cbiAgICAgIGlmKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCggJG1lLm9wdGlvbnMuYW5pbWF0aW9uICkgPT09ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICAgIFx0JC5tZXJnZSgkbWUucXVldWUsICRtZS5vcHRpb25zLmFuaW1hdGlvbik7XG4gICAgICB9IGVsc2Uge1xuXHQgICAgICAkbWUucXVldWUucHVzaCgkbWUub3B0aW9ucy5hbmltYXRpb24pO1xuXHQgICAgfVxuXG5cdCAgICAkbWUuY2xlYW5zZSgpO1xuXG5cdCAgICAkbWUuYW5pbWF0ZShjYWxsYmFjayk7XG4gICAgICBcbiAgICB9LFxuXG4gICAgLy8gVGhlIGFjdHVhbCBhZGRpbmcgb2YgdGhlIGNsYXNzIGFuZCBsaXN0ZW5pbmcgZm9yIGNvbXBsZXRpb25cbiAgICBhbmltYXRlOiBmdW5jdGlvbihjYWxsYmFjaykge1xuXG4gICAgXHR0aGlzLmVsZW1lbnQuYWRkQ2xhc3MoJ2FuaW1hdGVkJyk7XG5cbiAgICAgIHRoaXMuZWxlbWVudC5hZGRDbGFzcyh0aGlzLnF1ZXVlWzBdKTtcblxuICAgICAgdGhpcy5lbGVtZW50LmRhdGEoXCJhbmltb1wiLCB0aGlzLnF1ZXVlWzBdKTtcblxuICAgICAgdmFyIGFpID0gdGhpcy5wcmVmaXhlcy5sZW5ndGg7XG5cbiAgICAgIC8vIEFkZCB0aGUgb3B0aW9ucyBmb3IgZWFjaCBwcmVmaXhcbiAgICAgIHdoaWxlKGFpLS0pIHtcblxuICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiYW5pbWF0aW9uLWR1cmF0aW9uXCIsIHRoaXMub3B0aW9ucy5kdXJhdGlvbitcInNcIik7XG5cbiAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcImFuaW1hdGlvbi1pdGVyYXRpb24tY291bnRcIiwgdGhpcy5vcHRpb25zLml0ZXJhdGUpO1xuXG4gICAgICBcdHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJhbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uXCIsIHRoaXMub3B0aW9ucy50aW1pbmcpO1xuXG4gICAgICB9XG5cbiAgICAgIHZhciAkbWUgPSB0aGlzLCBfY2IgPSBjYWxsYmFjaztcblxuICAgICAgaWYoJG1lLnF1ZXVlLmxlbmd0aD4xKSB7XG4gICAgICAgIF9jYiA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8vIExpc3RlbiBmb3IgdGhlIGVuZCBvZiB0aGUgYW5pbWF0aW9uXG4gICAgICB0aGlzLl9lbmQoXCJBbmltYXRpb25FbmRcIiwgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG1vcmUsIGNsZWFuIGl0IHVwIGFuZCBtb3ZlIG9uXG4gICAgICBcdGlmKCRtZS5lbGVtZW50Lmhhc0NsYXNzKCRtZS5xdWV1ZVswXSkpIHtcblxuXHQgICAgXHRcdGlmKCEkbWUub3B0aW9ucy5rZWVwKSB7XG4gICAgICAgICAgICAkbWUuY2xlYW5zZSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgICRtZS5xdWV1ZS5zaGlmdCgpO1xuXG5cdCAgICBcdFx0aWYoJG1lLnF1ZXVlLmxlbmd0aCkge1xuXG5cdFx0ICAgICAgXHQkbWUuYW5pbWF0ZShjYWxsYmFjayk7XG5cdFx0ICAgICAgfVxuXHRcdFx0ICB9XG5cdFx0ICB9LCBfY2IpO1xuICAgIH0sXG5cbiAgICBjbGVhbnNlOiBmdW5jdGlvbigpIHtcblxuICAgIFx0dGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKCdhbmltYXRlZCcpO1xuXG4gIFx0XHR0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3ModGhpcy5xdWV1ZVswXSk7XG5cbiAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVDbGFzcyh0aGlzLmVsZW1lbnQuZGF0YShcImFuaW1vXCIpKTtcblxuICBcdFx0dmFyIGFpID0gdGhpcy5wcmVmaXhlcy5sZW5ndGg7XG5cbiAgXHRcdHdoaWxlKGFpLS0pIHtcblxuICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiYW5pbWF0aW9uLWR1cmF0aW9uXCIsIFwiXCIpO1xuXG4gICAgICBcdHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJhbmltYXRpb24taXRlcmF0aW9uLWNvdW50XCIsIFwiXCIpO1xuXG4gICAgICBcdHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJhbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uXCIsIFwiXCIpO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJ0cmFuc2l0aW9uXCIsIFwiXCIpO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJ0cmFuc2Zvcm1cIiwgXCJcIik7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcImZpbHRlclwiLCBcIlwiKTtcblxuICAgICAgfVxuICAgIH0sXG5cbiAgICBfYmx1cjogZnVuY3Rpb24oY2FsbGJhY2spIHtcblxuICAgICAgaWYodGhpcy5lbGVtZW50LmlzKFwiaW1nXCIpKSB7XG5cbiAgICAgIFx0dmFyIHN2Z19pZCA9IFwic3ZnX1wiICsgKCgoMSArIE1hdGgucmFuZG9tKCkpICogMHgxMDAwMDAwKSB8IDApLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSk7XG4gICAgICBcdHZhciBmaWx0ZXJfaWQgPSBcImZpbHRlcl9cIiArICgoKDEgKyBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDAwMCkgfCAwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpO1xuXG4gICAgICBcdCQoJ2JvZHknKS5hcHBlbmQoJzxzdmcgdmVyc2lvbj1cIjEuMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiBpZD1cIicrc3ZnX2lkKydcIiBzdHlsZT1cImhlaWdodDowO1wiPjxmaWx0ZXIgaWQ9XCInK2ZpbHRlcl9pZCsnXCI+PGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj1cIicrdGhpcy5vcHRpb25zLmFtb3VudCsnXCIgLz48L2ZpbHRlcj48L3N2Zz4nKTtcblxuICAgICAgXHR2YXIgYWkgPSB0aGlzLnByZWZpeGVzLmxlbmd0aDtcblxuICAgIFx0XHR3aGlsZShhaS0tKSB7XG5cbiAgICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiZmlsdGVyXCIsIFwiYmx1cihcIit0aGlzLm9wdGlvbnMuYW1vdW50K1wicHgpXCIpO1xuXG4gICAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcInRyYW5zaXRpb25cIiwgdGhpcy5vcHRpb25zLmR1cmF0aW9uK1wicyBhbGwgbGluZWFyXCIpO1xuXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKFwiZmlsdGVyXCIsIFwidXJsKCNcIitmaWx0ZXJfaWQrXCIpXCIpO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudC5kYXRhKFwic3ZnaWRcIiwgc3ZnX2lkKTtcbiAgICAgIFxuICAgICAgfSBlbHNlIHtcblxuICAgICAgICB2YXIgY29sb3IgPSB0aGlzLmVsZW1lbnQuY3NzKCdjb2xvcicpO1xuXG4gICAgICAgIHZhciBhaSA9IHRoaXMucHJlZml4ZXMubGVuZ3RoO1xuXG4gICAgICAgIC8vIEFkZCB0aGUgb3B0aW9ucyBmb3IgZWFjaCBwcmVmaXhcbiAgICAgICAgd2hpbGUoYWktLSkge1xuXG4gICAgICAgICAgdGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcInRyYW5zaXRpb25cIiwgXCJhbGwgXCIrdGhpcy5vcHRpb25zLmR1cmF0aW9uK1wicyBsaW5lYXJcIik7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3MoXCJ0ZXh0LXNoYWRvd1wiLCBcIjAgMCBcIit0aGlzLm9wdGlvbnMuYW1vdW50K1wicHggXCIrY29sb3IpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKFwiY29sb3JcIiwgXCJ0cmFuc3BhcmVudFwiKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fZW5kKFwiVHJhbnNpdGlvbkVuZFwiLCBudWxsLCBjYWxsYmFjayk7XG5cbiAgICAgIHZhciAkbWUgPSB0aGlzO1xuXG4gICAgICBpZih0aGlzLm9wdGlvbnMuZm9jdXNBZnRlcikge1xuXG4gICAgICAgIHZhciBmb2N1c193YWl0ID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAkbWUuX2ZvY3VzKCk7XG5cbiAgICAgICAgICBmb2N1c193YWl0ID0gd2luZG93LmNsZWFyVGltZW91dChmb2N1c193YWl0KTtcblxuICAgICAgICB9LCAodGhpcy5vcHRpb25zLmZvY3VzQWZ0ZXIqMTAwMCkpO1xuICAgICAgfVxuXG4gICAgfSxcblxuICAgIF9mb2N1czogZnVuY3Rpb24oKSB7XG5cbiAgICBcdHZhciBhaSA9IHRoaXMucHJlZml4ZXMubGVuZ3RoO1xuXG4gICAgICBpZih0aGlzLmVsZW1lbnQuaXMoXCJpbWdcIikpIHtcblxuICAgIFx0XHR3aGlsZShhaS0tKSB7XG5cbiAgICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiZmlsdGVyXCIsIFwiXCIpO1xuXG4gICAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcInRyYW5zaXRpb25cIiwgXCJcIik7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciAkc3ZnID0gJCgnIycrdGhpcy5lbGVtZW50LmRhdGEoJ3N2Z2lkJykpO1xuXG4gICAgICAgICRzdmcucmVtb3ZlKCk7XG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIHdoaWxlKGFpLS0pIHtcblxuICAgICAgICAgIHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJ0cmFuc2l0aW9uXCIsIFwiXCIpO1xuXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKFwidGV4dC1zaGFkb3dcIiwgXCJcIik7XG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3MoXCJjb2xvclwiLCBcIlwiKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX3JvdGF0ZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcblxuICAgICAgdmFyIGFpID0gdGhpcy5wcmVmaXhlcy5sZW5ndGg7XG5cbiAgICAgIC8vIEFkZCB0aGUgb3B0aW9ucyBmb3IgZWFjaCBwcmVmaXhcbiAgICAgIHdoaWxlKGFpLS0pIHtcblxuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1widHJhbnNpdGlvblwiLCBcImFsbCBcIit0aGlzLm9wdGlvbnMuZHVyYXRpb24rXCJzIGxpbmVhclwiKTtcblxuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1widHJhbnNmb3JtXCIsIFwicm90YXRlKFwiK3RoaXMub3B0aW9ucy5kZWdyZWVzK1wiZGVnKVwiKTtcblxuICAgICAgfVxuXG4gICAgICB0aGlzLl9lbmQoXCJUcmFuc2l0aW9uRW5kXCIsIG51bGwsIGNhbGxiYWNrKTtcblxuICAgIH0sXG5cbiAgICBfZW5kOiBmdW5jdGlvbih0eXBlLCB0b2RvLCBjYWxsYmFjaykge1xuXG4gICAgICB2YXIgJG1lID0gdGhpcztcblxuICAgICAgdmFyIGJpbmRpbmcgPSB0eXBlLnRvTG93ZXJDYXNlKCkrXCIgd2Via2l0XCIrdHlwZStcIiBvXCIrdHlwZStcIiBNU1wiK3R5cGU7XG5cbiAgICAgIHRoaXMuZWxlbWVudC5iaW5kKGJpbmRpbmcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBcbiAgICAgICAgJG1lLmVsZW1lbnQudW5iaW5kKGJpbmRpbmcpO1xuXG4gICAgICAgIGlmKHR5cGVvZiB0b2RvID09IFwiZnVuY3Rpb25cIikge1xuXG4gICAgICAgICAgdG9kbygpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodHlwZW9mIGNhbGxiYWNrID09IFwiZnVuY3Rpb25cIikge1xuXG4gICAgICAgICAgY2FsbGJhY2soJG1lKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBcbiAgICB9XG4gIH07XG5cbiAgJC5mbi5hbmltbyA9IGZ1bmN0aW9uICggb3B0aW9ucywgY2FsbGJhY2ssIG90aGVyX2NiICkge1xuICAgIFxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHRcblx0XHRcdG5ldyBhbmltbyggdGhpcywgb3B0aW9ucywgY2FsbGJhY2ssIG90aGVyX2NiICk7XG5cblx0XHR9KTtcblxuICB9O1xuXG59KSggalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50ICk7IiwiLyohXG4gKiBNb2NrSmF4IC0galF1ZXJ5IFBsdWdpbiB0byBNb2NrIEFqYXggcmVxdWVzdHNcbiAqXG4gKiBWZXJzaW9uOiAgMS41LjNcbiAqIFJlbGVhc2VkOlxuICogSG9tZTogICBodHRwOi8vZ2l0aHViLmNvbS9hcHBlbmR0by9qcXVlcnktbW9ja2pheFxuICogQXV0aG9yOiAgIEpvbmF0aGFuIFNoYXJwIChodHRwOi8vamRzaGFycC5jb20pXG4gKiBMaWNlbnNlOiAgTUlULEdQTFxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMSBhcHBlbmRUbyBMTEMuXG4gKiBEdWFsIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgb3IgR1BMIGxpY2Vuc2VzLlxuICogaHR0cDovL2FwcGVuZHRvLmNvbS9vcGVuLXNvdXJjZS1saWNlbnNlc1xuICovXG4oZnVuY3Rpb24oJCkge1xuXHR2YXIgX2FqYXggPSAkLmFqYXgsXG5cdFx0bW9ja0hhbmRsZXJzID0gW10sXG5cdFx0bW9ja2VkQWpheENhbGxzID0gW10sXG5cdFx0Q0FMTEJBQ0tfUkVHRVggPSAvPVxcPygmfCQpLyxcblx0XHRqc2MgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpO1xuXG5cblx0Ly8gUGFyc2UgdGhlIGdpdmVuIFhNTCBzdHJpbmcuXG5cdGZ1bmN0aW9uIHBhcnNlWE1MKHhtbCkge1xuXHRcdGlmICggd2luZG93LkRPTVBhcnNlciA9PSB1bmRlZmluZWQgJiYgd2luZG93LkFjdGl2ZVhPYmplY3QgKSB7XG5cdFx0XHRET01QYXJzZXIgPSBmdW5jdGlvbigpIHsgfTtcblx0XHRcdERPTVBhcnNlci5wcm90b3R5cGUucGFyc2VGcm9tU3RyaW5nID0gZnVuY3Rpb24oIHhtbFN0cmluZyApIHtcblx0XHRcdFx0dmFyIGRvYyA9IG5ldyBBY3RpdmVYT2JqZWN0KCdNaWNyb3NvZnQuWE1MRE9NJyk7XG5cdFx0XHRcdGRvYy5hc3luYyA9ICdmYWxzZSc7XG5cdFx0XHRcdGRvYy5sb2FkWE1MKCB4bWxTdHJpbmcgKTtcblx0XHRcdFx0cmV0dXJuIGRvYztcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0dHJ5IHtcblx0XHRcdHZhciB4bWxEb2MgPSAoIG5ldyBET01QYXJzZXIoKSApLnBhcnNlRnJvbVN0cmluZyggeG1sLCAndGV4dC94bWwnICk7XG5cdFx0XHRpZiAoICQuaXNYTUxEb2MoIHhtbERvYyApICkge1xuXHRcdFx0XHR2YXIgZXJyID0gJCgncGFyc2VyZXJyb3InLCB4bWxEb2MpO1xuXHRcdFx0XHRpZiAoIGVyci5sZW5ndGggPT0gMSApIHtcblx0XHRcdFx0XHR0aHJvdygnRXJyb3I6ICcgKyAkKHhtbERvYykudGV4dCgpICk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93KCdVbmFibGUgdG8gcGFyc2UgWE1MJyk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4geG1sRG9jO1xuXHRcdH0gY2F0Y2goIGUgKSB7XG5cdFx0XHR2YXIgbXNnID0gKCBlLm5hbWUgPT0gdW5kZWZpbmVkID8gZSA6IGUubmFtZSArICc6ICcgKyBlLm1lc3NhZ2UgKTtcblx0XHRcdCQoZG9jdW1lbnQpLnRyaWdnZXIoJ3htbFBhcnNlRXJyb3InLCBbIG1zZyBdKTtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG5cblx0Ly8gVHJpZ2dlciBhIGpRdWVyeSBldmVudFxuXHRmdW5jdGlvbiB0cmlnZ2VyKHMsIHR5cGUsIGFyZ3MpIHtcblx0XHQocy5jb250ZXh0ID8gJChzLmNvbnRleHQpIDogJC5ldmVudCkudHJpZ2dlcih0eXBlLCBhcmdzKTtcblx0fVxuXG5cdC8vIENoZWNrIGlmIHRoZSBkYXRhIGZpZWxkIG9uIHRoZSBtb2NrIGhhbmRsZXIgYW5kIHRoZSByZXF1ZXN0IG1hdGNoLiBUaGlzXG5cdC8vIGNhbiBiZSB1c2VkIHRvIHJlc3RyaWN0IGEgbW9jayBoYW5kbGVyIHRvIGJlaW5nIHVzZWQgb25seSB3aGVuIGEgY2VydGFpblxuXHQvLyBzZXQgb2YgZGF0YSBpcyBwYXNzZWQgdG8gaXQuXG5cdGZ1bmN0aW9uIGlzTW9ja0RhdGFFcXVhbCggbW9jaywgbGl2ZSApIHtcblx0XHR2YXIgaWRlbnRpY2FsID0gdHJ1ZTtcblx0XHQvLyBUZXN0IGZvciBzaXR1YXRpb25zIHdoZXJlIHRoZSBkYXRhIGlzIGEgcXVlcnlzdHJpbmcgKG5vdCBhbiBvYmplY3QpXG5cdFx0aWYgKHR5cGVvZiBsaXZlID09PSAnc3RyaW5nJykge1xuXHRcdFx0Ly8gUXVlcnlzdHJpbmcgbWF5IGJlIGEgcmVnZXhcblx0XHRcdHJldHVybiAkLmlzRnVuY3Rpb24oIG1vY2sudGVzdCApID8gbW9jay50ZXN0KGxpdmUpIDogbW9jayA9PSBsaXZlO1xuXHRcdH1cblx0XHQkLmVhY2gobW9jaywgZnVuY3Rpb24oaykge1xuXHRcdFx0aWYgKCBsaXZlW2tdID09PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdGlkZW50aWNhbCA9IGZhbHNlO1xuXHRcdFx0XHRyZXR1cm4gaWRlbnRpY2FsO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aWYgKCB0eXBlb2YgbGl2ZVtrXSA9PT0gJ29iamVjdCcgJiYgbGl2ZVtrXSAhPT0gbnVsbCApIHtcblx0XHRcdFx0XHRpZiAoIGlkZW50aWNhbCAmJiAkLmlzQXJyYXkoIGxpdmVba10gKSApIHtcblx0XHRcdFx0XHRcdGlkZW50aWNhbCA9ICQuaXNBcnJheSggbW9ja1trXSApICYmIGxpdmVba10ubGVuZ3RoID09PSBtb2NrW2tdLmxlbmd0aDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWRlbnRpY2FsID0gaWRlbnRpY2FsICYmIGlzTW9ja0RhdGFFcXVhbChtb2NrW2tdLCBsaXZlW2tdKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRpZiAoIG1vY2tba10gJiYgJC5pc0Z1bmN0aW9uKCBtb2NrW2tdLnRlc3QgKSApIHtcblx0XHRcdFx0XHRcdGlkZW50aWNhbCA9IGlkZW50aWNhbCAmJiBtb2NrW2tdLnRlc3QobGl2ZVtrXSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGlkZW50aWNhbCA9IGlkZW50aWNhbCAmJiAoIG1vY2tba10gPT0gbGl2ZVtrXSApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIGlkZW50aWNhbDtcblx0fVxuXG4gICAgLy8gU2VlIGlmIGEgbW9jayBoYW5kbGVyIHByb3BlcnR5IG1hdGNoZXMgdGhlIGRlZmF1bHQgc2V0dGluZ3NcbiAgICBmdW5jdGlvbiBpc0RlZmF1bHRTZXR0aW5nKGhhbmRsZXIsIHByb3BlcnR5KSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVyW3Byb3BlcnR5XSA9PT0gJC5tb2NramF4U2V0dGluZ3NbcHJvcGVydHldO1xuICAgIH1cblxuXHQvLyBDaGVjayB0aGUgZ2l2ZW4gaGFuZGxlciBzaG91bGQgbW9jayB0aGUgZ2l2ZW4gcmVxdWVzdFxuXHRmdW5jdGlvbiBnZXRNb2NrRm9yUmVxdWVzdCggaGFuZGxlciwgcmVxdWVzdFNldHRpbmdzICkge1xuXHRcdC8vIElmIHRoZSBtb2NrIHdhcyByZWdpc3RlcmVkIHdpdGggYSBmdW5jdGlvbiwgbGV0IHRoZSBmdW5jdGlvbiBkZWNpZGUgaWYgd2Vcblx0XHQvLyB3YW50IHRvIG1vY2sgdGhpcyByZXF1ZXN0XG5cdFx0aWYgKCAkLmlzRnVuY3Rpb24oaGFuZGxlcikgKSB7XG5cdFx0XHRyZXR1cm4gaGFuZGxlciggcmVxdWVzdFNldHRpbmdzICk7XG5cdFx0fVxuXG5cdFx0Ly8gSW5zcGVjdCB0aGUgVVJMIG9mIHRoZSByZXF1ZXN0IGFuZCBjaGVjayBpZiB0aGUgbW9jayBoYW5kbGVyJ3MgdXJsXG5cdFx0Ly8gbWF0Y2hlcyB0aGUgdXJsIGZvciB0aGlzIGFqYXggcmVxdWVzdFxuXHRcdGlmICggJC5pc0Z1bmN0aW9uKGhhbmRsZXIudXJsLnRlc3QpICkge1xuXHRcdFx0Ly8gVGhlIHVzZXIgcHJvdmlkZWQgYSByZWdleCBmb3IgdGhlIHVybCwgdGVzdCBpdFxuXHRcdFx0aWYgKCAhaGFuZGxlci51cmwudGVzdCggcmVxdWVzdFNldHRpbmdzLnVybCApICkge1xuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gTG9vayBmb3IgYSBzaW1wbGUgd2lsZGNhcmQgJyonIG9yIGEgZGlyZWN0IFVSTCBtYXRjaFxuXHRcdFx0dmFyIHN0YXIgPSBoYW5kbGVyLnVybC5pbmRleE9mKCcqJyk7XG5cdFx0XHRpZiAoaGFuZGxlci51cmwgIT09IHJlcXVlc3RTZXR0aW5ncy51cmwgJiYgc3RhciA9PT0gLTEgfHxcblx0XHRcdFx0XHQhbmV3IFJlZ0V4cChoYW5kbGVyLnVybC5yZXBsYWNlKC9bLVtcXF17fSgpKz8uLFxcXFxeJHwjXFxzXS9nLCBcIlxcXFwkJlwiKS5yZXBsYWNlKC9cXCovZywgJy4rJykpLnRlc3QocmVxdWVzdFNldHRpbmdzLnVybCkpIHtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gSW5zcGVjdCB0aGUgZGF0YSBzdWJtaXR0ZWQgaW4gdGhlIHJlcXVlc3QgKGVpdGhlciBQT1NUIGJvZHkgb3IgR0VUIHF1ZXJ5IHN0cmluZylcblx0XHRpZiAoIGhhbmRsZXIuZGF0YSApIHtcblx0XHRcdGlmICggISByZXF1ZXN0U2V0dGluZ3MuZGF0YSB8fCAhaXNNb2NrRGF0YUVxdWFsKGhhbmRsZXIuZGF0YSwgcmVxdWVzdFNldHRpbmdzLmRhdGEpICkge1xuXHRcdFx0XHQvLyBUaGV5J3JlIG5vdCBpZGVudGljYWwsIGRvIG5vdCBtb2NrIHRoaXMgcmVxdWVzdFxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gSW5zcGVjdCB0aGUgcmVxdWVzdCB0eXBlXG5cdFx0aWYgKCBoYW5kbGVyICYmIGhhbmRsZXIudHlwZSAmJlxuXHRcdFx0XHRoYW5kbGVyLnR5cGUudG9Mb3dlckNhc2UoKSAhPSByZXF1ZXN0U2V0dGluZ3MudHlwZS50b0xvd2VyQ2FzZSgpICkge1xuXHRcdFx0Ly8gVGhlIHJlcXVlc3QgdHlwZSBkb2Vzbid0IG1hdGNoIChHRVQgdnMuIFBPU1QpXG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRyZXR1cm4gaGFuZGxlcjtcblx0fVxuXG5cdC8vIFByb2Nlc3MgdGhlIHhociBvYmplY3RzIHNlbmQgb3BlcmF0aW9uXG5cdGZ1bmN0aW9uIF94aHJTZW5kKG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncykge1xuXG5cdFx0Ly8gVGhpcyBpcyBhIHN1YnN0aXR1dGUgZm9yIDwgMS40IHdoaWNoIGxhY2tzICQucHJveHlcblx0XHR2YXIgcHJvY2VzcyA9IChmdW5jdGlvbih0aGF0KSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiAoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dmFyIG9uUmVhZHk7XG5cblx0XHRcdFx0XHQvLyBUaGUgcmVxdWVzdCBoYXMgcmV0dXJuZWRcblx0XHRcdFx0XHR0aGlzLnN0YXR1cyAgICAgPSBtb2NrSGFuZGxlci5zdGF0dXM7XG5cdFx0XHRcdFx0dGhpcy5zdGF0dXNUZXh0ID0gbW9ja0hhbmRsZXIuc3RhdHVzVGV4dDtcblx0XHRcdFx0XHR0aGlzLnJlYWR5U3RhdGVcdD0gNDtcblxuXHRcdFx0XHRcdC8vIFdlIGhhdmUgYW4gZXhlY3V0YWJsZSBmdW5jdGlvbiwgY2FsbCBpdCB0byBnaXZlXG5cdFx0XHRcdFx0Ly8gdGhlIG1vY2sgaGFuZGxlciBhIGNoYW5jZSB0byB1cGRhdGUgaXQncyBkYXRhXG5cdFx0XHRcdFx0aWYgKCAkLmlzRnVuY3Rpb24obW9ja0hhbmRsZXIucmVzcG9uc2UpICkge1xuXHRcdFx0XHRcdFx0bW9ja0hhbmRsZXIucmVzcG9uc2Uob3JpZ1NldHRpbmdzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gQ29weSBvdmVyIG91ciBtb2NrIHRvIG91ciB4aHIgb2JqZWN0IGJlZm9yZSBwYXNzaW5nIGNvbnRyb2wgYmFjayB0b1xuXHRcdFx0XHRcdC8vIGpRdWVyeSdzIG9ucmVhZHlzdGF0ZWNoYW5nZSBjYWxsYmFja1xuXHRcdFx0XHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlID09ICdqc29uJyAmJiAoIHR5cGVvZiBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgPT0gJ29iamVjdCcgKSApIHtcblx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2VUZXh0ID0gSlNPTi5zdHJpbmdpZnkobW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0KTtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKCByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgPT0gJ3htbCcgKSB7XG5cdFx0XHRcdFx0XHRpZiAoIHR5cGVvZiBtb2NrSGFuZGxlci5yZXNwb25zZVhNTCA9PSAnc3RyaW5nJyApIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5yZXNwb25zZVhNTCA9IHBhcnNlWE1MKG1vY2tIYW5kbGVyLnJlc3BvbnNlWE1MKTtcblx0XHRcdFx0XHRcdFx0Ly9pbiBqUXVlcnkgMS45LjErLCByZXNwb25zZVhNTCBpcyBwcm9jZXNzZWQgZGlmZmVyZW50bHkgYW5kIHJlbGllcyBvbiByZXNwb25zZVRleHRcblx0XHRcdFx0XHRcdFx0dGhpcy5yZXNwb25zZVRleHQgPSBtb2NrSGFuZGxlci5yZXNwb25zZVhNTDtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2VYTUwgPSBtb2NrSGFuZGxlci5yZXNwb25zZVhNTDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhpcy5yZXNwb25zZVRleHQgPSBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmKCB0eXBlb2YgbW9ja0hhbmRsZXIuc3RhdHVzID09ICdudW1iZXInIHx8IHR5cGVvZiBtb2NrSGFuZGxlci5zdGF0dXMgPT0gJ3N0cmluZycgKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnN0YXR1cyA9IG1vY2tIYW5kbGVyLnN0YXR1cztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYoIHR5cGVvZiBtb2NrSGFuZGxlci5zdGF0dXNUZXh0ID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnN0YXR1c1RleHQgPSBtb2NrSGFuZGxlci5zdGF0dXNUZXh0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBqUXVlcnkgMi4wIHJlbmFtZWQgb25yZWFkeXN0YXRlY2hhbmdlIHRvIG9ubG9hZFxuXHRcdFx0XHRcdG9uUmVhZHkgPSB0aGlzLm9ucmVhZHlzdGF0ZWNoYW5nZSB8fCB0aGlzLm9ubG9hZDtcblxuXHRcdFx0XHRcdC8vIGpRdWVyeSA8IDEuNCBkb2Vzbid0IGhhdmUgb25yZWFkeXN0YXRlIGNoYW5nZSBmb3IgeGhyXG5cdFx0XHRcdFx0aWYgKCAkLmlzRnVuY3Rpb24oIG9uUmVhZHkgKSApIHtcblx0XHRcdFx0XHRcdGlmKCBtb2NrSGFuZGxlci5pc1RpbWVvdXQpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5zdGF0dXMgPSAtMTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG9uUmVhZHkuY2FsbCggdGhpcywgbW9ja0hhbmRsZXIuaXNUaW1lb3V0ID8gJ3RpbWVvdXQnIDogdW5kZWZpbmVkICk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmICggbW9ja0hhbmRsZXIuaXNUaW1lb3V0ICkge1xuXHRcdFx0XHRcdFx0Ly8gRml4IGZvciAxLjMuMiB0aW1lb3V0IHRvIGtlZXAgc3VjY2VzcyBmcm9tIGZpcmluZy5cblx0XHRcdFx0XHRcdHRoaXMuc3RhdHVzID0gLTE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KS5hcHBseSh0aGF0KTtcblx0XHRcdH07XG5cdFx0fSkodGhpcyk7XG5cblx0XHRpZiAoIG1vY2tIYW5kbGVyLnByb3h5ICkge1xuXHRcdFx0Ly8gV2UncmUgcHJveHlpbmcgdGhpcyByZXF1ZXN0IGFuZCBsb2FkaW5nIGluIGFuIGV4dGVybmFsIGZpbGUgaW5zdGVhZFxuXHRcdFx0X2FqYXgoe1xuXHRcdFx0XHRnbG9iYWw6IGZhbHNlLFxuXHRcdFx0XHR1cmw6IG1vY2tIYW5kbGVyLnByb3h5LFxuXHRcdFx0XHR0eXBlOiBtb2NrSGFuZGxlci5wcm94eVR5cGUsXG5cdFx0XHRcdGRhdGE6IG1vY2tIYW5kbGVyLmRhdGEsXG5cdFx0XHRcdGRhdGFUeXBlOiByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgPT09IFwic2NyaXB0XCIgPyBcInRleHQvcGxhaW5cIiA6IHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSxcblx0XHRcdFx0Y29tcGxldGU6IGZ1bmN0aW9uKHhocikge1xuXHRcdFx0XHRcdG1vY2tIYW5kbGVyLnJlc3BvbnNlWE1MID0geGhyLnJlc3BvbnNlWE1MO1xuXHRcdFx0XHRcdG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCA9IHhoci5yZXNwb25zZVRleHQ7XG4gICAgICAgICAgICAgICAgICAgIC8vIERvbid0IG92ZXJyaWRlIHRoZSBoYW5kbGVyIHN0YXR1cy9zdGF0dXNUZXh0IGlmIGl0J3Mgc3BlY2lmaWVkIGJ5IHRoZSBjb25maWdcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzRGVmYXVsdFNldHRpbmcobW9ja0hhbmRsZXIsICdzdGF0dXMnKSkge1xuXHRcdFx0XHRcdCAgICBtb2NrSGFuZGxlci5zdGF0dXMgPSB4aHIuc3RhdHVzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0RlZmF1bHRTZXR0aW5nKG1vY2tIYW5kbGVyLCAnc3RhdHVzVGV4dCcpKSB7XG5cdFx0XHRcdFx0ICAgIG1vY2tIYW5kbGVyLnN0YXR1c1RleHQgPSB4aHIuc3RhdHVzVGV4dDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG5cdFx0XHRcdFx0dGhpcy5yZXNwb25zZVRpbWVyID0gc2V0VGltZW91dChwcm9jZXNzLCBtb2NrSGFuZGxlci5yZXNwb25zZVRpbWUgfHwgMCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyB0eXBlID09ICdQT1NUJyB8fCAnR0VUJyB8fCAnREVMRVRFJ1xuXHRcdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuYXN5bmMgPT09IGZhbHNlICkge1xuXHRcdFx0XHQvLyBUT0RPOiBCbG9ja2luZyBkZWxheVxuXHRcdFx0XHRwcm9jZXNzKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnJlc3BvbnNlVGltZXIgPSBzZXRUaW1lb3V0KHByb2Nlc3MsIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGltZSB8fCA1MCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gQ29uc3RydWN0IGEgbW9ja2VkIFhIUiBPYmplY3Rcblx0ZnVuY3Rpb24geGhyKG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncywgb3JpZ0hhbmRsZXIpIHtcblx0XHQvLyBFeHRlbmQgd2l0aCBvdXIgZGVmYXVsdCBtb2NramF4IHNldHRpbmdzXG5cdFx0bW9ja0hhbmRsZXIgPSAkLmV4dGVuZCh0cnVlLCB7fSwgJC5tb2NramF4U2V0dGluZ3MsIG1vY2tIYW5kbGVyKTtcblxuXHRcdGlmICh0eXBlb2YgbW9ja0hhbmRsZXIuaGVhZGVycyA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdG1vY2tIYW5kbGVyLmhlYWRlcnMgPSB7fTtcblx0XHR9XG5cdFx0aWYgKCBtb2NrSGFuZGxlci5jb250ZW50VHlwZSApIHtcblx0XHRcdG1vY2tIYW5kbGVyLmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddID0gbW9ja0hhbmRsZXIuY29udGVudFR5cGU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHN0YXR1czogbW9ja0hhbmRsZXIuc3RhdHVzLFxuXHRcdFx0c3RhdHVzVGV4dDogbW9ja0hhbmRsZXIuc3RhdHVzVGV4dCxcblx0XHRcdHJlYWR5U3RhdGU6IDEsXG5cdFx0XHRvcGVuOiBmdW5jdGlvbigpIHsgfSxcblx0XHRcdHNlbmQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRvcmlnSGFuZGxlci5maXJlZCA9IHRydWU7XG5cdFx0XHRcdF94aHJTZW5kLmNhbGwodGhpcywgbW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncywgb3JpZ1NldHRpbmdzKTtcblx0XHRcdH0sXG5cdFx0XHRhYm9ydDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGNsZWFyVGltZW91dCh0aGlzLnJlc3BvbnNlVGltZXIpO1xuXHRcdFx0fSxcblx0XHRcdHNldFJlcXVlc3RIZWFkZXI6IGZ1bmN0aW9uKGhlYWRlciwgdmFsdWUpIHtcblx0XHRcdFx0bW9ja0hhbmRsZXIuaGVhZGVyc1toZWFkZXJdID0gdmFsdWU7XG5cdFx0XHR9LFxuXHRcdFx0Z2V0UmVzcG9uc2VIZWFkZXI6IGZ1bmN0aW9uKGhlYWRlcikge1xuXHRcdFx0XHQvLyAnTGFzdC1tb2RpZmllZCcsICdFdGFnJywgJ2NvbnRlbnQtdHlwZScgYXJlIGFsbCBjaGVja2VkIGJ5IGpRdWVyeVxuXHRcdFx0XHRpZiAoIG1vY2tIYW5kbGVyLmhlYWRlcnMgJiYgbW9ja0hhbmRsZXIuaGVhZGVyc1toZWFkZXJdICkge1xuXHRcdFx0XHRcdC8vIFJldHVybiBhcmJpdHJhcnkgaGVhZGVyc1xuXHRcdFx0XHRcdHJldHVybiBtb2NrSGFuZGxlci5oZWFkZXJzW2hlYWRlcl07XG5cdFx0XHRcdH0gZWxzZSBpZiAoIGhlYWRlci50b0xvd2VyQ2FzZSgpID09ICdsYXN0LW1vZGlmaWVkJyApIHtcblx0XHRcdFx0XHRyZXR1cm4gbW9ja0hhbmRsZXIubGFzdE1vZGlmaWVkIHx8IChuZXcgRGF0ZSgpKS50b1N0cmluZygpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCBoZWFkZXIudG9Mb3dlckNhc2UoKSA9PSAnZXRhZycgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG1vY2tIYW5kbGVyLmV0YWcgfHwgJyc7XG5cdFx0XHRcdH0gZWxzZSBpZiAoIGhlYWRlci50b0xvd2VyQ2FzZSgpID09ICdjb250ZW50LXR5cGUnICkge1xuXHRcdFx0XHRcdHJldHVybiBtb2NrSGFuZGxlci5jb250ZW50VHlwZSB8fCAndGV4dC9wbGFpbic7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRnZXRBbGxSZXNwb25zZUhlYWRlcnM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgaGVhZGVycyA9ICcnO1xuXHRcdFx0XHQkLmVhY2gobW9ja0hhbmRsZXIuaGVhZGVycywgZnVuY3Rpb24oaywgdikge1xuXHRcdFx0XHRcdGhlYWRlcnMgKz0gayArICc6ICcgKyB2ICsgXCJcXG5cIjtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHJldHVybiBoZWFkZXJzO1xuXHRcdFx0fVxuXHRcdH07XG5cdH1cblxuXHQvLyBQcm9jZXNzIGEgSlNPTlAgbW9jayByZXF1ZXN0LlxuXHRmdW5jdGlvbiBwcm9jZXNzSnNvbnBNb2NrKCByZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MgKSB7XG5cdFx0Ly8gSGFuZGxlIEpTT05QIFBhcmFtZXRlciBDYWxsYmFja3MsIHdlIG5lZWQgdG8gcmVwbGljYXRlIHNvbWUgb2YgdGhlIGpRdWVyeSBjb3JlIGhlcmVcblx0XHQvLyBiZWNhdXNlIHRoZXJlIGlzbid0IGFuIGVhc3kgaG9vayBmb3IgdGhlIGNyb3NzIGRvbWFpbiBzY3JpcHQgdGFnIG9mIGpzb25wXG5cblx0XHRwcm9jZXNzSnNvbnBVcmwoIHJlcXVlc3RTZXR0aW5ncyApO1xuXG5cdFx0cmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlID0gXCJqc29uXCI7XG5cdFx0aWYocmVxdWVzdFNldHRpbmdzLmRhdGEgJiYgQ0FMTEJBQ0tfUkVHRVgudGVzdChyZXF1ZXN0U2V0dGluZ3MuZGF0YSkgfHwgQ0FMTEJBQ0tfUkVHRVgudGVzdChyZXF1ZXN0U2V0dGluZ3MudXJsKSkge1xuXHRcdFx0Y3JlYXRlSnNvbnBDYWxsYmFjayhyZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MpO1xuXG5cdFx0XHQvLyBXZSBuZWVkIHRvIG1ha2Ugc3VyZVxuXHRcdFx0Ly8gdGhhdCBhIEpTT05QIHN0eWxlIHJlc3BvbnNlIGlzIGV4ZWN1dGVkIHByb3Blcmx5XG5cblx0XHRcdHZhciBydXJsID0gL14oXFx3KzopP1xcL1xcLyhbXlxcLz8jXSspLyxcblx0XHRcdFx0cGFydHMgPSBydXJsLmV4ZWMoIHJlcXVlc3RTZXR0aW5ncy51cmwgKSxcblx0XHRcdFx0cmVtb3RlID0gcGFydHMgJiYgKHBhcnRzWzFdICYmIHBhcnRzWzFdICE9PSBsb2NhdGlvbi5wcm90b2NvbCB8fCBwYXJ0c1syXSAhPT0gbG9jYXRpb24uaG9zdCk7XG5cblx0XHRcdHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSA9IFwic2NyaXB0XCI7XG5cdFx0XHRpZihyZXF1ZXN0U2V0dGluZ3MudHlwZS50b1VwcGVyQ2FzZSgpID09PSBcIkdFVFwiICYmIHJlbW90ZSApIHtcblx0XHRcdFx0dmFyIG5ld01vY2tSZXR1cm4gPSBwcm9jZXNzSnNvbnBSZXF1ZXN0KCByZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MgKTtcblxuXHRcdFx0XHQvLyBDaGVjayBpZiB3ZSBhcmUgc3VwcG9zZWQgdG8gcmV0dXJuIGEgRGVmZXJyZWQgYmFjayB0byB0aGUgbW9jayBjYWxsLCBvciBqdXN0XG5cdFx0XHRcdC8vIHNpZ25hbCBzdWNjZXNzXG5cdFx0XHRcdGlmKG5ld01vY2tSZXR1cm4pIHtcblx0XHRcdFx0XHRyZXR1cm4gbmV3TW9ja1JldHVybjtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdC8vIEFwcGVuZCB0aGUgcmVxdWlyZWQgY2FsbGJhY2sgcGFyYW1ldGVyIHRvIHRoZSBlbmQgb2YgdGhlIHJlcXVlc3QgVVJMLCBmb3IgYSBKU09OUCByZXF1ZXN0XG5cdGZ1bmN0aW9uIHByb2Nlc3NKc29ucFVybCggcmVxdWVzdFNldHRpbmdzICkge1xuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLnR5cGUudG9VcHBlckNhc2UoKSA9PT0gXCJHRVRcIiApIHtcblx0XHRcdGlmICggIUNBTExCQUNLX1JFR0VYLnRlc3QoIHJlcXVlc3RTZXR0aW5ncy51cmwgKSApIHtcblx0XHRcdFx0cmVxdWVzdFNldHRpbmdzLnVybCArPSAoL1xcPy8udGVzdCggcmVxdWVzdFNldHRpbmdzLnVybCApID8gXCImXCIgOiBcIj9cIikgK1xuXHRcdFx0XHRcdChyZXF1ZXN0U2V0dGluZ3MuanNvbnAgfHwgXCJjYWxsYmFja1wiKSArIFwiPT9cIjtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKCAhcmVxdWVzdFNldHRpbmdzLmRhdGEgfHwgIUNBTExCQUNLX1JFR0VYLnRlc3QocmVxdWVzdFNldHRpbmdzLmRhdGEpICkge1xuXHRcdFx0cmVxdWVzdFNldHRpbmdzLmRhdGEgPSAocmVxdWVzdFNldHRpbmdzLmRhdGEgPyByZXF1ZXN0U2V0dGluZ3MuZGF0YSArIFwiJlwiIDogXCJcIikgKyAocmVxdWVzdFNldHRpbmdzLmpzb25wIHx8IFwiY2FsbGJhY2tcIikgKyBcIj0/XCI7XG5cdFx0fVxuXHR9XG5cblx0Ly8gUHJvY2VzcyBhIEpTT05QIHJlcXVlc3QgYnkgZXZhbHVhdGluZyB0aGUgbW9ja2VkIHJlc3BvbnNlIHRleHRcblx0ZnVuY3Rpb24gcHJvY2Vzc0pzb25wUmVxdWVzdCggcmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzICkge1xuXHRcdC8vIFN5bnRoZXNpemUgdGhlIG1vY2sgcmVxdWVzdCBmb3IgYWRkaW5nIGEgc2NyaXB0IHRhZ1xuXHRcdHZhciBjYWxsYmFja0NvbnRleHQgPSBvcmlnU2V0dGluZ3MgJiYgb3JpZ1NldHRpbmdzLmNvbnRleHQgfHwgcmVxdWVzdFNldHRpbmdzLFxuXHRcdFx0bmV3TW9jayA9IG51bGw7XG5cblxuXHRcdC8vIElmIHRoZSByZXNwb25zZSBoYW5kbGVyIG9uIHRoZSBtb29jayBpcyBhIGZ1bmN0aW9uLCBjYWxsIGl0XG5cdFx0aWYgKCBtb2NrSGFuZGxlci5yZXNwb25zZSAmJiAkLmlzRnVuY3Rpb24obW9ja0hhbmRsZXIucmVzcG9uc2UpICkge1xuXHRcdFx0bW9ja0hhbmRsZXIucmVzcG9uc2Uob3JpZ1NldHRpbmdzKTtcblx0XHR9IGVsc2Uge1xuXG5cdFx0XHQvLyBFdmFsdWF0ZSB0aGUgcmVzcG9uc2VUZXh0IGphdmFzY3JpcHQgaW4gYSBnbG9iYWwgY29udGV4dFxuXHRcdFx0aWYoIHR5cGVvZiBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgPT09ICdvYmplY3QnICkge1xuXHRcdFx0XHQkLmdsb2JhbEV2YWwoICcoJyArIEpTT04uc3RyaW5naWZ5KCBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgKSArICcpJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkLmdsb2JhbEV2YWwoICcoJyArIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCArICcpJyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gU3VjY2Vzc2Z1bCByZXNwb25zZVxuXHRcdGpzb25wU3VjY2VzcyggcmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyICk7XG5cdFx0anNvbnBDb21wbGV0ZSggcmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyICk7XG5cblx0XHQvLyBJZiB3ZSBhcmUgcnVubmluZyB1bmRlciBqUXVlcnkgMS41KywgcmV0dXJuIGEgZGVmZXJyZWQgb2JqZWN0XG5cdFx0aWYoJC5EZWZlcnJlZCl7XG5cdFx0XHRuZXdNb2NrID0gbmV3ICQuRGVmZXJyZWQoKTtcblx0XHRcdGlmKHR5cGVvZiBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgPT0gXCJvYmplY3RcIil7XG5cdFx0XHRcdG5ld01vY2sucmVzb2x2ZVdpdGgoIGNhbGxiYWNrQ29udGV4dCwgW21vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dF0gKTtcblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdG5ld01vY2sucmVzb2x2ZVdpdGgoIGNhbGxiYWNrQ29udGV4dCwgWyQucGFyc2VKU09OKCBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgKV0gKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG5ld01vY2s7XG5cdH1cblxuXG5cdC8vIENyZWF0ZSB0aGUgcmVxdWlyZWQgSlNPTlAgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIHRoZSByZXF1ZXN0XG5cdGZ1bmN0aW9uIGNyZWF0ZUpzb25wQ2FsbGJhY2soIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyApIHtcblx0XHR2YXIgY2FsbGJhY2tDb250ZXh0ID0gb3JpZ1NldHRpbmdzICYmIG9yaWdTZXR0aW5ncy5jb250ZXh0IHx8IHJlcXVlc3RTZXR0aW5ncztcblx0XHR2YXIganNvbnAgPSByZXF1ZXN0U2V0dGluZ3MuanNvbnBDYWxsYmFjayB8fCAoXCJqc29ucFwiICsganNjKyspO1xuXG5cdFx0Ly8gUmVwbGFjZSB0aGUgPT8gc2VxdWVuY2UgYm90aCBpbiB0aGUgcXVlcnkgc3RyaW5nIGFuZCB0aGUgZGF0YVxuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmRhdGEgKSB7XG5cdFx0XHRyZXF1ZXN0U2V0dGluZ3MuZGF0YSA9IChyZXF1ZXN0U2V0dGluZ3MuZGF0YSArIFwiXCIpLnJlcGxhY2UoQ0FMTEJBQ0tfUkVHRVgsIFwiPVwiICsganNvbnAgKyBcIiQxXCIpO1xuXHRcdH1cblxuXHRcdHJlcXVlc3RTZXR0aW5ncy51cmwgPSByZXF1ZXN0U2V0dGluZ3MudXJsLnJlcGxhY2UoQ0FMTEJBQ0tfUkVHRVgsIFwiPVwiICsganNvbnAgKyBcIiQxXCIpO1xuXG5cblx0XHQvLyBIYW5kbGUgSlNPTlAtc3R5bGUgbG9hZGluZ1xuXHRcdHdpbmRvd1sganNvbnAgXSA9IHdpbmRvd1sganNvbnAgXSB8fCBmdW5jdGlvbiggdG1wICkge1xuXHRcdFx0ZGF0YSA9IHRtcDtcblx0XHRcdGpzb25wU3VjY2VzcyggcmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyICk7XG5cdFx0XHRqc29ucENvbXBsZXRlKCByZXF1ZXN0U2V0dGluZ3MsIGNhbGxiYWNrQ29udGV4dCwgbW9ja0hhbmRsZXIgKTtcblx0XHRcdC8vIEdhcmJhZ2UgY29sbGVjdFxuXHRcdFx0d2luZG93WyBqc29ucCBdID0gdW5kZWZpbmVkO1xuXG5cdFx0XHR0cnkge1xuXHRcdFx0XHRkZWxldGUgd2luZG93WyBqc29ucCBdO1xuXHRcdFx0fSBjYXRjaChlKSB7fVxuXG5cdFx0XHRpZiAoIGhlYWQgKSB7XG5cdFx0XHRcdGhlYWQucmVtb3ZlQ2hpbGQoIHNjcmlwdCApO1xuXHRcdFx0fVxuXHRcdH07XG5cdH1cblxuXHQvLyBUaGUgSlNPTlAgcmVxdWVzdCB3YXMgc3VjY2Vzc2Z1bFxuXHRmdW5jdGlvbiBqc29ucFN1Y2Nlc3MocmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyKSB7XG5cdFx0Ly8gSWYgYSBsb2NhbCBjYWxsYmFjayB3YXMgc3BlY2lmaWVkLCBmaXJlIGl0IGFuZCBwYXNzIGl0IHRoZSBkYXRhXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3Muc3VjY2VzcyApIHtcblx0XHRcdHJlcXVlc3RTZXR0aW5ncy5zdWNjZXNzLmNhbGwoIGNhbGxiYWNrQ29udGV4dCwgbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0IHx8IFwiXCIsIHN0YXR1cywge30gKTtcblx0XHR9XG5cblx0XHQvLyBGaXJlIHRoZSBnbG9iYWwgY2FsbGJhY2tcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5nbG9iYWwgKSB7XG5cdFx0XHR0cmlnZ2VyKHJlcXVlc3RTZXR0aW5ncywgXCJhamF4U3VjY2Vzc1wiLCBbe30sIHJlcXVlc3RTZXR0aW5nc10gKTtcblx0XHR9XG5cdH1cblxuXHQvLyBUaGUgSlNPTlAgcmVxdWVzdCB3YXMgY29tcGxldGVkXG5cdGZ1bmN0aW9uIGpzb25wQ29tcGxldGUocmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQpIHtcblx0XHQvLyBQcm9jZXNzIHJlc3VsdFxuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmNvbXBsZXRlICkge1xuXHRcdFx0cmVxdWVzdFNldHRpbmdzLmNvbXBsZXRlLmNhbGwoIGNhbGxiYWNrQ29udGV4dCwge30gLCBzdGF0dXMgKTtcblx0XHR9XG5cblx0XHQvLyBUaGUgcmVxdWVzdCB3YXMgY29tcGxldGVkXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZ2xvYmFsICkge1xuXHRcdFx0dHJpZ2dlciggXCJhamF4Q29tcGxldGVcIiwgW3t9LCByZXF1ZXN0U2V0dGluZ3NdICk7XG5cdFx0fVxuXG5cdFx0Ly8gSGFuZGxlIHRoZSBnbG9iYWwgQUpBWCBjb3VudGVyXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZ2xvYmFsICYmICEgLS0kLmFjdGl2ZSApIHtcblx0XHRcdCQuZXZlbnQudHJpZ2dlciggXCJhamF4U3RvcFwiICk7XG5cdFx0fVxuXHR9XG5cblxuXHQvLyBUaGUgY29yZSAkLmFqYXggcmVwbGFjZW1lbnQuXG5cdGZ1bmN0aW9uIGhhbmRsZUFqYXgoIHVybCwgb3JpZ1NldHRpbmdzICkge1xuXHRcdHZhciBtb2NrUmVxdWVzdCwgcmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlcjtcblxuXHRcdC8vIElmIHVybCBpcyBhbiBvYmplY3QsIHNpbXVsYXRlIHByZS0xLjUgc2lnbmF0dXJlXG5cdFx0aWYgKCB0eXBlb2YgdXJsID09PSBcIm9iamVjdFwiICkge1xuXHRcdFx0b3JpZ1NldHRpbmdzID0gdXJsO1xuXHRcdFx0dXJsID0gdW5kZWZpbmVkO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyB3b3JrIGFyb3VuZCB0byBzdXBwb3J0IDEuNSBzaWduYXR1cmVcblx0XHRcdG9yaWdTZXR0aW5ncyA9IG9yaWdTZXR0aW5ncyB8fCB7fTtcblx0XHRcdG9yaWdTZXR0aW5ncy51cmwgPSB1cmw7XG5cdFx0fVxuXG5cdFx0Ly8gRXh0ZW5kIHRoZSBvcmlnaW5hbCBzZXR0aW5ncyBmb3IgdGhlIHJlcXVlc3Rcblx0XHRyZXF1ZXN0U2V0dGluZ3MgPSAkLmV4dGVuZCh0cnVlLCB7fSwgJC5hamF4U2V0dGluZ3MsIG9yaWdTZXR0aW5ncyk7XG5cblx0XHQvLyBJdGVyYXRlIG92ZXIgb3VyIG1vY2sgaGFuZGxlcnMgKGluIHJlZ2lzdHJhdGlvbiBvcmRlcikgdW50aWwgd2UgZmluZFxuXHRcdC8vIG9uZSB0aGF0IGlzIHdpbGxpbmcgdG8gaW50ZXJjZXB0IHRoZSByZXF1ZXN0XG5cdFx0Zm9yKHZhciBrID0gMDsgayA8IG1vY2tIYW5kbGVycy5sZW5ndGg7IGsrKykge1xuXHRcdFx0aWYgKCAhbW9ja0hhbmRsZXJzW2tdICkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0bW9ja0hhbmRsZXIgPSBnZXRNb2NrRm9yUmVxdWVzdCggbW9ja0hhbmRsZXJzW2tdLCByZXF1ZXN0U2V0dGluZ3MgKTtcblx0XHRcdGlmKCFtb2NrSGFuZGxlcikge1xuXHRcdFx0XHQvLyBObyB2YWxpZCBtb2NrIGZvdW5kIGZvciB0aGlzIHJlcXVlc3Rcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdG1vY2tlZEFqYXhDYWxscy5wdXNoKHJlcXVlc3RTZXR0aW5ncyk7XG5cblx0XHRcdC8vIElmIGxvZ2dpbmcgaXMgZW5hYmxlZCwgbG9nIHRoZSBtb2NrIHRvIHRoZSBjb25zb2xlXG5cdFx0XHQkLm1vY2tqYXhTZXR0aW5ncy5sb2coIG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MgKTtcblxuXG5cdFx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSAmJiByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUudG9VcHBlckNhc2UoKSA9PT0gJ0pTT05QJyApIHtcblx0XHRcdFx0aWYgKChtb2NrUmVxdWVzdCA9IHByb2Nlc3NKc29ucE1vY2soIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyApKSkge1xuXHRcdFx0XHRcdC8vIFRoaXMgbW9jayB3aWxsIGhhbmRsZSB0aGUgSlNPTlAgcmVxdWVzdFxuXHRcdFx0XHRcdHJldHVybiBtb2NrUmVxdWVzdDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cblx0XHRcdC8vIFJlbW92ZWQgdG8gZml4ICM1NCAtIGtlZXAgdGhlIG1vY2tpbmcgZGF0YSBvYmplY3QgaW50YWN0XG5cdFx0XHQvL21vY2tIYW5kbGVyLmRhdGEgPSByZXF1ZXN0U2V0dGluZ3MuZGF0YTtcblxuXHRcdFx0bW9ja0hhbmRsZXIuY2FjaGUgPSByZXF1ZXN0U2V0dGluZ3MuY2FjaGU7XG5cdFx0XHRtb2NrSGFuZGxlci50aW1lb3V0ID0gcmVxdWVzdFNldHRpbmdzLnRpbWVvdXQ7XG5cdFx0XHRtb2NrSGFuZGxlci5nbG9iYWwgPSByZXF1ZXN0U2V0dGluZ3MuZ2xvYmFsO1xuXG5cdFx0XHRjb3B5VXJsUGFyYW1ldGVycyhtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzKTtcblxuXHRcdFx0KGZ1bmN0aW9uKG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncywgb3JpZ0hhbmRsZXIpIHtcblx0XHRcdFx0bW9ja1JlcXVlc3QgPSBfYWpheC5jYWxsKCQsICQuZXh0ZW5kKHRydWUsIHt9LCBvcmlnU2V0dGluZ3MsIHtcblx0XHRcdFx0XHQvLyBNb2NrIHRoZSBYSFIgb2JqZWN0XG5cdFx0XHRcdFx0eGhyOiBmdW5jdGlvbigpIHsgcmV0dXJuIHhociggbW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncywgb3JpZ1NldHRpbmdzLCBvcmlnSGFuZGxlciApOyB9XG5cdFx0XHRcdH0pKTtcblx0XHRcdH0pKG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncywgbW9ja0hhbmRsZXJzW2tdKTtcblxuXHRcdFx0cmV0dXJuIG1vY2tSZXF1ZXN0O1xuXHRcdH1cblxuXHRcdC8vIFdlIGRvbid0IGhhdmUgYSBtb2NrIHJlcXVlc3Rcblx0XHRpZigkLm1vY2tqYXhTZXR0aW5ncy50aHJvd1VubW9ja2VkID09PSB0cnVlKSB7XG5cdFx0XHR0aHJvdygnQUpBWCBub3QgbW9ja2VkOiAnICsgb3JpZ1NldHRpbmdzLnVybCk7XG5cdFx0fVxuXHRcdGVsc2UgeyAvLyB0cmlnZ2VyIGEgbm9ybWFsIHJlcXVlc3Rcblx0XHRcdHJldHVybiBfYWpheC5hcHBseSgkLCBbb3JpZ1NldHRpbmdzXSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCogQ29waWVzIFVSTCBwYXJhbWV0ZXIgdmFsdWVzIGlmIHRoZXkgd2VyZSBjYXB0dXJlZCBieSBhIHJlZ3VsYXIgZXhwcmVzc2lvblxuXHQqIEBwYXJhbSB7T2JqZWN0fSBtb2NrSGFuZGxlclxuXHQqIEBwYXJhbSB7T2JqZWN0fSBvcmlnU2V0dGluZ3Ncblx0Ki9cblx0ZnVuY3Rpb24gY29weVVybFBhcmFtZXRlcnMobW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncykge1xuXHRcdC8vcGFyYW1ldGVycyBhcmVuJ3QgY2FwdHVyZWQgaWYgdGhlIFVSTCBpc24ndCBhIFJlZ0V4cFxuXHRcdGlmICghKG1vY2tIYW5kbGVyLnVybCBpbnN0YW5jZW9mIFJlZ0V4cCkpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Ly9pZiBubyBVUkwgcGFyYW1zIHdlcmUgZGVmaW5lZCBvbiB0aGUgaGFuZGxlciwgZG9uJ3QgYXR0ZW1wdCBhIGNhcHR1cmVcblx0XHRpZiAoIW1vY2tIYW5kbGVyLmhhc093blByb3BlcnR5KCd1cmxQYXJhbXMnKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR2YXIgY2FwdHVyZXMgPSBtb2NrSGFuZGxlci51cmwuZXhlYyhvcmlnU2V0dGluZ3MudXJsKTtcblx0XHQvL3RoZSB3aG9sZSBSZWdFeHAgbWF0Y2ggaXMgYWx3YXlzIHRoZSBmaXJzdCB2YWx1ZSBpbiB0aGUgY2FwdHVyZSByZXN1bHRzXG5cdFx0aWYgKGNhcHR1cmVzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjYXB0dXJlcy5zaGlmdCgpO1xuXHRcdC8vdXNlIGhhbmRsZXIgcGFyYW1zIGFzIGtleXMgYW5kIGNhcHR1cmUgcmVzdXRzIGFzIHZhbHVlc1xuXHRcdHZhciBpID0gMCxcblx0XHRjYXB0dXJlc0xlbmd0aCA9IGNhcHR1cmVzLmxlbmd0aCxcblx0XHRwYXJhbXNMZW5ndGggPSBtb2NrSGFuZGxlci51cmxQYXJhbXMubGVuZ3RoLFxuXHRcdC8vaW4gY2FzZSB0aGUgbnVtYmVyIG9mIHBhcmFtcyBzcGVjaWZpZWQgaXMgbGVzcyB0aGFuIGFjdHVhbCBjYXB0dXJlc1xuXHRcdG1heEl0ZXJhdGlvbnMgPSBNYXRoLm1pbihjYXB0dXJlc0xlbmd0aCwgcGFyYW1zTGVuZ3RoKSxcblx0XHRwYXJhbVZhbHVlcyA9IHt9O1xuXHRcdGZvciAoaTsgaSA8IG1heEl0ZXJhdGlvbnM7IGkrKykge1xuXHRcdFx0dmFyIGtleSA9IG1vY2tIYW5kbGVyLnVybFBhcmFtc1tpXTtcblx0XHRcdHBhcmFtVmFsdWVzW2tleV0gPSBjYXB0dXJlc1tpXTtcblx0XHR9XG5cdFx0b3JpZ1NldHRpbmdzLnVybFBhcmFtcyA9IHBhcmFtVmFsdWVzO1xuXHR9XG5cblxuXHQvLyBQdWJsaWNcblxuXHQkLmV4dGVuZCh7XG5cdFx0YWpheDogaGFuZGxlQWpheFxuXHR9KTtcblxuXHQkLm1vY2tqYXhTZXR0aW5ncyA9IHtcblx0XHQvL3VybDogICAgICAgIG51bGwsXG5cdFx0Ly90eXBlOiAgICAgICAnR0VUJyxcblx0XHRsb2c6ICAgICAgICAgIGZ1bmN0aW9uKCBtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzICkge1xuXHRcdFx0aWYgKCBtb2NrSGFuZGxlci5sb2dnaW5nID09PSBmYWxzZSB8fFxuXHRcdFx0XHQgKCB0eXBlb2YgbW9ja0hhbmRsZXIubG9nZ2luZyA9PT0gJ3VuZGVmaW5lZCcgJiYgJC5tb2NramF4U2V0dGluZ3MubG9nZ2luZyA9PT0gZmFsc2UgKSApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCB3aW5kb3cuY29uc29sZSAmJiBjb25zb2xlLmxvZyApIHtcblx0XHRcdFx0dmFyIG1lc3NhZ2UgPSAnTU9DSyAnICsgcmVxdWVzdFNldHRpbmdzLnR5cGUudG9VcHBlckNhc2UoKSArICc6ICcgKyByZXF1ZXN0U2V0dGluZ3MudXJsO1xuXHRcdFx0XHR2YXIgcmVxdWVzdCA9ICQuZXh0ZW5kKHt9LCByZXF1ZXN0U2V0dGluZ3MpO1xuXG5cdFx0XHRcdGlmICh0eXBlb2YgY29uc29sZS5sb2cgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhtZXNzYWdlLCByZXF1ZXN0KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coIG1lc3NhZ2UgKyAnICcgKyBKU09OLnN0cmluZ2lmeShyZXF1ZXN0KSApO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0bG9nZ2luZzogICAgICAgdHJ1ZSxcblx0XHRzdGF0dXM6ICAgICAgICAyMDAsXG5cdFx0c3RhdHVzVGV4dDogICAgXCJPS1wiLFxuXHRcdHJlc3BvbnNlVGltZTogIDUwMCxcblx0XHRpc1RpbWVvdXQ6ICAgICBmYWxzZSxcblx0XHR0aHJvd1VubW9ja2VkOiBmYWxzZSxcblx0XHRjb250ZW50VHlwZTogICAndGV4dC9wbGFpbicsXG5cdFx0cmVzcG9uc2U6ICAgICAgJycsXG5cdFx0cmVzcG9uc2VUZXh0OiAgJycsXG5cdFx0cmVzcG9uc2VYTUw6ICAgJycsXG5cdFx0cHJveHk6ICAgICAgICAgJycsXG5cdFx0cHJveHlUeXBlOiAgICAgJ0dFVCcsXG5cblx0XHRsYXN0TW9kaWZpZWQ6ICBudWxsLFxuXHRcdGV0YWc6ICAgICAgICAgICcnLFxuXHRcdGhlYWRlcnM6IHtcblx0XHRcdGV0YWc6ICdJSkZASCNAOTIzdWY4MDIzaEZPQEkjSCMnLFxuXHRcdFx0J2NvbnRlbnQtdHlwZScgOiAndGV4dC9wbGFpbidcblx0XHR9XG5cdH07XG5cblx0JC5tb2NramF4ID0gZnVuY3Rpb24oc2V0dGluZ3MpIHtcblx0XHR2YXIgaSA9IG1vY2tIYW5kbGVycy5sZW5ndGg7XG5cdFx0bW9ja0hhbmRsZXJzW2ldID0gc2V0dGluZ3M7XG5cdFx0cmV0dXJuIGk7XG5cdH07XG5cdCQubW9ja2pheENsZWFyID0gZnVuY3Rpb24oaSkge1xuXHRcdGlmICggYXJndW1lbnRzLmxlbmd0aCA9PSAxICkge1xuXHRcdFx0bW9ja0hhbmRsZXJzW2ldID0gbnVsbDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bW9ja0hhbmRsZXJzID0gW107XG5cdFx0fVxuXHRcdG1vY2tlZEFqYXhDYWxscyA9IFtdO1xuXHR9O1xuXHQkLm1vY2tqYXguaGFuZGxlciA9IGZ1bmN0aW9uKGkpIHtcblx0XHRpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT0gMSApIHtcblx0XHRcdHJldHVybiBtb2NrSGFuZGxlcnNbaV07XG5cdFx0fVxuXHR9O1xuXHQkLm1vY2tqYXgubW9ja2VkQWpheENhbGxzID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIG1vY2tlZEFqYXhDYWxscztcblx0fTtcbn0pKGpRdWVyeSk7IiwiLyoqXG4qICBBamF4IEF1dG9jb21wbGV0ZSBmb3IgalF1ZXJ5LCB2ZXJzaW9uICV2ZXJzaW9uJVxuKiAgKGMpIDIwMTUgVG9tYXMgS2lyZGFcbipcbiogIEFqYXggQXV0b2NvbXBsZXRlIGZvciBqUXVlcnkgaXMgZnJlZWx5IGRpc3RyaWJ1dGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIGFuIE1JVC1zdHlsZSBsaWNlbnNlLlxuKiAgRm9yIGRldGFpbHMsIHNlZSB0aGUgd2ViIHNpdGU6IGh0dHBzOi8vZ2l0aHViLmNvbS9kZXZicmlkZ2UvalF1ZXJ5LUF1dG9jb21wbGV0ZVxuKi9cblxuLypqc2xpbnQgIGJyb3dzZXI6IHRydWUsIHdoaXRlOiB0cnVlLCBwbHVzcGx1czogdHJ1ZSwgdmFyczogdHJ1ZSAqL1xuLypnbG9iYWwgZGVmaW5lLCB3aW5kb3csIGRvY3VtZW50LCBqUXVlcnksIGV4cG9ydHMsIHJlcXVpcmUgKi9cblxuLy8gRXhwb3NlIHBsdWdpbiBhcyBhbiBBTUQgbW9kdWxlIGlmIEFNRCBsb2FkZXIgaXMgcHJlc2VudDpcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5J10sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiByZXF1aXJlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIEJyb3dzZXJpZnlcbiAgICAgICAgZmFjdG9yeShyZXF1aXJlKCdqcXVlcnknKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgICAgIGZhY3RvcnkoalF1ZXJ5KTtcbiAgICB9XG59KGZ1bmN0aW9uICgkKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyXG4gICAgICAgIHV0aWxzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXNjYXBlUmVnRXhDaGFyczogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC9bXFwtXFxbXFxdXFwvXFx7XFx9XFwoXFwpXFwqXFwrXFw/XFwuXFxcXFxcXlxcJFxcfF0vZywgXCJcXFxcJCZcIik7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjcmVhdGVOb2RlOiBmdW5jdGlvbiAoY29udGFpbmVyQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgICAgICBkaXYuY2xhc3NOYW1lID0gY29udGFpbmVyQ2xhc3M7XG4gICAgICAgICAgICAgICAgICAgIGRpdi5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgICAgICAgICAgICAgIGRpdi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGl2O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0oKSksXG5cbiAgICAgICAga2V5cyA9IHtcbiAgICAgICAgICAgIEVTQzogMjcsXG4gICAgICAgICAgICBUQUI6IDksXG4gICAgICAgICAgICBSRVRVUk46IDEzLFxuICAgICAgICAgICAgTEVGVDogMzcsXG4gICAgICAgICAgICBVUDogMzgsXG4gICAgICAgICAgICBSSUdIVDogMzksXG4gICAgICAgICAgICBET1dOOiA0MFxuICAgICAgICB9O1xuXG4gICAgZnVuY3Rpb24gQXV0b2NvbXBsZXRlKGVsLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBub29wID0gZnVuY3Rpb24gKCkgeyB9LFxuICAgICAgICAgICAgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICBkZWZhdWx0cyA9IHtcbiAgICAgICAgICAgICAgICBhamF4U2V0dGluZ3M6IHt9LFxuICAgICAgICAgICAgICAgIGF1dG9TZWxlY3RGaXJzdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgYXBwZW5kVG86IGRvY3VtZW50LmJvZHksXG4gICAgICAgICAgICAgICAgc2VydmljZVVybDogbnVsbCxcbiAgICAgICAgICAgICAgICBsb29rdXA6IG51bGwsXG4gICAgICAgICAgICAgICAgb25TZWxlY3Q6IG51bGwsXG4gICAgICAgICAgICAgICAgd2lkdGg6ICdhdXRvJyxcbiAgICAgICAgICAgICAgICBtaW5DaGFyczogMSxcbiAgICAgICAgICAgICAgICBtYXhIZWlnaHQ6IDMwMCxcbiAgICAgICAgICAgICAgICBkZWZlclJlcXVlc3RCeTogMCxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHt9LFxuICAgICAgICAgICAgICAgIGZvcm1hdFJlc3VsdDogQXV0b2NvbXBsZXRlLmZvcm1hdFJlc3VsdCxcbiAgICAgICAgICAgICAgICBkZWxpbWl0ZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgekluZGV4OiA5OTk5LFxuICAgICAgICAgICAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgICAgICAgICAgIG5vQ2FjaGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG9uU2VhcmNoU3RhcnQ6IG5vb3AsXG4gICAgICAgICAgICAgICAgb25TZWFyY2hDb21wbGV0ZTogbm9vcCxcbiAgICAgICAgICAgICAgICBvblNlYXJjaEVycm9yOiBub29wLFxuICAgICAgICAgICAgICAgIHByZXNlcnZlSW5wdXQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lckNsYXNzOiAnYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb25zJyxcbiAgICAgICAgICAgICAgICB0YWJEaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgICAgICBjdXJyZW50UmVxdWVzdDogbnVsbCxcbiAgICAgICAgICAgICAgICB0cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0OiB0cnVlLFxuICAgICAgICAgICAgICAgIHByZXZlbnRCYWRRdWVyaWVzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGxvb2t1cEZpbHRlcjogZnVuY3Rpb24gKHN1Z2dlc3Rpb24sIG9yaWdpbmFsUXVlcnksIHF1ZXJ5TG93ZXJDYXNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdWdnZXN0aW9uLnZhbHVlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxdWVyeUxvd2VyQ2FzZSkgIT09IC0xO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcGFyYW1OYW1lOiAncXVlcnknLFxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybVJlc3VsdDogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0eXBlb2YgcmVzcG9uc2UgPT09ICdzdHJpbmcnID8gJC5wYXJzZUpTT04ocmVzcG9uc2UpIDogcmVzcG9uc2U7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzaG93Tm9TdWdnZXN0aW9uTm90aWNlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBub1N1Z2dlc3Rpb25Ob3RpY2U6ICdObyByZXN1bHRzJyxcbiAgICAgICAgICAgICAgICBvcmllbnRhdGlvbjogJ2JvdHRvbScsXG4gICAgICAgICAgICAgICAgZm9yY2VGaXhQb3NpdGlvbjogZmFsc2VcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgLy8gU2hhcmVkIHZhcmlhYmxlczpcbiAgICAgICAgdGhhdC5lbGVtZW50ID0gZWw7XG4gICAgICAgIHRoYXQuZWwgPSAkKGVsKTtcbiAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IFtdO1xuICAgICAgICB0aGF0LmJhZFF1ZXJpZXMgPSBbXTtcbiAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XG4gICAgICAgIHRoYXQuY3VycmVudFZhbHVlID0gdGhhdC5lbGVtZW50LnZhbHVlO1xuICAgICAgICB0aGF0LmludGVydmFsSWQgPSAwO1xuICAgICAgICB0aGF0LmNhY2hlZFJlc3BvbnNlID0ge307XG4gICAgICAgIHRoYXQub25DaGFuZ2VJbnRlcnZhbCA9IG51bGw7XG4gICAgICAgIHRoYXQub25DaGFuZ2UgPSBudWxsO1xuICAgICAgICB0aGF0LmlzTG9jYWwgPSBmYWxzZTtcbiAgICAgICAgdGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciA9IG51bGw7XG4gICAgICAgIHRoYXQubm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9IG51bGw7XG4gICAgICAgIHRoYXQub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBkZWZhdWx0cywgb3B0aW9ucyk7XG4gICAgICAgIHRoYXQuY2xhc3NlcyA9IHtcbiAgICAgICAgICAgIHNlbGVjdGVkOiAnYXV0b2NvbXBsZXRlLXNlbGVjdGVkJyxcbiAgICAgICAgICAgIHN1Z2dlc3Rpb246ICdhdXRvY29tcGxldGUtc3VnZ2VzdGlvbidcbiAgICAgICAgfTtcbiAgICAgICAgdGhhdC5oaW50ID0gbnVsbDtcbiAgICAgICAgdGhhdC5oaW50VmFsdWUgPSAnJztcbiAgICAgICAgdGhhdC5zZWxlY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIC8vIEluaXRpYWxpemUgYW5kIHNldCBvcHRpb25zOlxuICAgICAgICB0aGF0LmluaXRpYWxpemUoKTtcbiAgICAgICAgdGhhdC5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIEF1dG9jb21wbGV0ZS51dGlscyA9IHV0aWxzO1xuXG4gICAgJC5BdXRvY29tcGxldGUgPSBBdXRvY29tcGxldGU7XG5cbiAgICBBdXRvY29tcGxldGUuZm9ybWF0UmVzdWx0ID0gZnVuY3Rpb24gKHN1Z2dlc3Rpb24sIGN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAvLyBEbyBub3QgcmVwbGFjZSBhbnl0aGluZyBpZiB0aGVyZSBjdXJyZW50IHZhbHVlIGlzIGVtcHR5XG4gICAgICAgIGlmICghY3VycmVudFZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbi52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIHBhdHRlcm4gPSAnKCcgKyB1dGlscy5lc2NhcGVSZWdFeENoYXJzKGN1cnJlbnRWYWx1ZSkgKyAnKSc7XG5cbiAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb24udmFsdWVcbiAgICAgICAgICAgIC5yZXBsYWNlKG5ldyBSZWdFeHAocGF0dGVybiwgJ2dpJyksICc8c3Ryb25nPiQxPFxcL3N0cm9uZz4nKVxuICAgICAgICAgICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8mbHQ7KFxcLz9zdHJvbmcpJmd0Oy9nLCAnPCQxPicpO1xuICAgIH07XG5cbiAgICBBdXRvY29tcGxldGUucHJvdG90eXBlID0ge1xuXG4gICAgICAgIGtpbGxlckZuOiBudWxsLFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9uU2VsZWN0b3IgPSAnLicgKyB0aGF0LmNsYXNzZXMuc3VnZ2VzdGlvbixcbiAgICAgICAgICAgICAgICBzZWxlY3RlZCA9IHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lcjtcblxuICAgICAgICAgICAgLy8gUmVtb3ZlIGF1dG9jb21wbGV0ZSBhdHRyaWJ1dGUgdG8gcHJldmVudCBuYXRpdmUgc3VnZ2VzdGlvbnM6XG4gICAgICAgICAgICB0aGF0LmVsZW1lbnQuc2V0QXR0cmlidXRlKCdhdXRvY29tcGxldGUnLCAnb2ZmJyk7XG5cbiAgICAgICAgICAgIHRoYXQua2lsbGVyRm4gPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGlmICgkKGUudGFyZ2V0KS5jbG9zZXN0KCcuJyArIHRoYXQub3B0aW9ucy5jb250YWluZXJDbGFzcykubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQua2lsbFN1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZGlzYWJsZUtpbGxlckZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gaHRtbCgpIGRlYWxzIHdpdGggbWFueSB0eXBlczogaHRtbFN0cmluZyBvciBFbGVtZW50IG9yIEFycmF5IG9yIGpRdWVyeVxuICAgICAgICAgICAgdGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gJCgnPGRpdiBjbGFzcz1cImF1dG9jb21wbGV0ZS1uby1zdWdnZXN0aW9uXCI+PC9kaXY+JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5odG1sKHRoaXMub3B0aW9ucy5ub1N1Z2dlc3Rpb25Ob3RpY2UpLmdldCgwKTtcblxuICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciA9IEF1dG9jb21wbGV0ZS51dGlscy5jcmVhdGVOb2RlKG9wdGlvbnMuY29udGFpbmVyQ2xhc3MpO1xuXG4gICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpO1xuXG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kVG8ob3B0aW9ucy5hcHBlbmRUbyk7XG5cbiAgICAgICAgICAgIC8vIE9ubHkgc2V0IHdpZHRoIGlmIGl0IHdhcyBwcm92aWRlZDpcbiAgICAgICAgICAgIGlmIChvcHRpb25zLndpZHRoICE9PSAnYXV0bycpIHtcbiAgICAgICAgICAgICAgICBjb250YWluZXIud2lkdGgob3B0aW9ucy53aWR0aCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIExpc3RlbiBmb3IgbW91c2Ugb3ZlciBldmVudCBvbiBzdWdnZXN0aW9ucyBsaXN0OlxuICAgICAgICAgICAgY29udGFpbmVyLm9uKCdtb3VzZW92ZXIuYXV0b2NvbXBsZXRlJywgc3VnZ2VzdGlvblNlbGVjdG9yLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5hY3RpdmF0ZSgkKHRoaXMpLmRhdGEoJ2luZGV4JykpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIERlc2VsZWN0IGFjdGl2ZSBlbGVtZW50IHdoZW4gbW91c2UgbGVhdmVzIHN1Z2dlc3Rpb25zIGNvbnRhaW5lcjpcbiAgICAgICAgICAgIGNvbnRhaW5lci5vbignbW91c2VvdXQuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jaGlsZHJlbignLicgKyBzZWxlY3RlZCkucmVtb3ZlQ2xhc3Moc2VsZWN0ZWQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIExpc3RlbiBmb3IgY2xpY2sgZXZlbnQgb24gc3VnZ2VzdGlvbnMgbGlzdDpcbiAgICAgICAgICAgIGNvbnRhaW5lci5vbignY2xpY2suYXV0b2NvbXBsZXRlJywgc3VnZ2VzdGlvblNlbGVjdG9yLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QoJCh0aGlzKS5kYXRhKCdpbmRleCcpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uQ2FwdHVyZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhhdC52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS5hdXRvY29tcGxldGUnLCB0aGF0LmZpeFBvc2l0aW9uQ2FwdHVyZSk7XG5cbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2tleWRvd24uYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVByZXNzKGUpOyB9KTtcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2tleXVwLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlVcChlKTsgfSk7XG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdibHVyLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uICgpIHsgdGhhdC5vbkJsdXIoKTsgfSk7XG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdmb2N1cy5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoKSB7IHRoYXQub25Gb2N1cygpOyB9KTtcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2NoYW5nZS5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5VXAoZSk7IH0pO1xuICAgICAgICAgICAgdGhhdC5lbC5vbignaW5wdXQuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVVwKGUpOyB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkZvY3VzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuZWwudmFsKCkubGVuZ3RoID49IHRoYXQub3B0aW9ucy5taW5DaGFycykge1xuICAgICAgICAgICAgICAgIHRoYXQub25WYWx1ZUNoYW5nZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uQmx1cjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5lbmFibGVLaWxsZXJGbigpO1xuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgYWJvcnRBamF4OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICBpZiAodGhhdC5jdXJyZW50UmVxdWVzdCkge1xuICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0ID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXRPcHRpb25zOiBmdW5jdGlvbiAoc3VwcGxpZWRPcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucztcblxuICAgICAgICAgICAgJC5leHRlbmQob3B0aW9ucywgc3VwcGxpZWRPcHRpb25zKTtcblxuICAgICAgICAgICAgdGhhdC5pc0xvY2FsID0gJC5pc0FycmF5KG9wdGlvbnMubG9va3VwKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuaXNMb2NhbCkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMubG9va3VwID0gdGhhdC52ZXJpZnlTdWdnZXN0aW9uc0Zvcm1hdChvcHRpb25zLmxvb2t1cCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9wdGlvbnMub3JpZW50YXRpb24gPSB0aGF0LnZhbGlkYXRlT3JpZW50YXRpb24ob3B0aW9ucy5vcmllbnRhdGlvbiwgJ2JvdHRvbScpO1xuXG4gICAgICAgICAgICAvLyBBZGp1c3QgaGVpZ2h0LCB3aWR0aCBhbmQgei1pbmRleDpcbiAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuY3NzKHtcbiAgICAgICAgICAgICAgICAnbWF4LWhlaWdodCc6IG9wdGlvbnMubWF4SGVpZ2h0ICsgJ3B4JyxcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiBvcHRpb25zLndpZHRoICsgJ3B4JyxcbiAgICAgICAgICAgICAgICAnei1pbmRleCc6IG9wdGlvbnMuekluZGV4XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuXG4gICAgICAgIGNsZWFyQ2FjaGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuY2FjaGVkUmVzcG9uc2UgPSB7fTtcbiAgICAgICAgICAgIHRoaXMuYmFkUXVlcmllcyA9IFtdO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFyQ2FjaGUoKTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFZhbHVlID0gJyc7XG4gICAgICAgICAgICB0aGlzLnN1Z2dlc3Rpb25zID0gW107XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzYWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdGhhdC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XG4gICAgICAgICAgICB0aGF0LmFib3J0QWpheCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVuYWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZpeFBvc2l0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBVc2Ugb25seSB3aGVuIGNvbnRhaW5lciBoYXMgYWxyZWFkeSBpdHMgY29udGVudFxuXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgJGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXG4gICAgICAgICAgICAgICAgY29udGFpbmVyUGFyZW50ID0gJGNvbnRhaW5lci5wYXJlbnQoKS5nZXQoMCk7XG4gICAgICAgICAgICAvLyBGaXggcG9zaXRpb24gYXV0b21hdGljYWxseSB3aGVuIGFwcGVuZGVkIHRvIGJvZHkuXG4gICAgICAgICAgICAvLyBJbiBvdGhlciBjYXNlcyBmb3JjZSBwYXJhbWV0ZXIgbXVzdCBiZSBnaXZlbi5cbiAgICAgICAgICAgIGlmIChjb250YWluZXJQYXJlbnQgIT09IGRvY3VtZW50LmJvZHkgJiYgIXRoYXQub3B0aW9ucy5mb3JjZUZpeFBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDaG9vc2Ugb3JpZW50YXRpb25cbiAgICAgICAgICAgIHZhciBvcmllbnRhdGlvbiA9IHRoYXQub3B0aW9ucy5vcmllbnRhdGlvbixcbiAgICAgICAgICAgICAgICBjb250YWluZXJIZWlnaHQgPSAkY29udGFpbmVyLm91dGVySGVpZ2h0KCksXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gdGhhdC5lbC5vdXRlckhlaWdodCgpLFxuICAgICAgICAgICAgICAgIG9mZnNldCA9IHRoYXQuZWwub2Zmc2V0KCksXG4gICAgICAgICAgICAgICAgc3R5bGVzID0geyAndG9wJzogb2Zmc2V0LnRvcCwgJ2xlZnQnOiBvZmZzZXQubGVmdCB9O1xuXG4gICAgICAgICAgICBpZiAob3JpZW50YXRpb24gPT09ICdhdXRvJykge1xuICAgICAgICAgICAgICAgIHZhciB2aWV3UG9ydEhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKSxcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsVG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpLFxuICAgICAgICAgICAgICAgICAgICB0b3BPdmVyZmxvdyA9IC1zY3JvbGxUb3AgKyBvZmZzZXQudG9wIC0gY29udGFpbmVySGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICBib3R0b21PdmVyZmxvdyA9IHNjcm9sbFRvcCArIHZpZXdQb3J0SGVpZ2h0IC0gKG9mZnNldC50b3AgKyBoZWlnaHQgKyBjb250YWluZXJIZWlnaHQpO1xuXG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb24gPSAoTWF0aC5tYXgodG9wT3ZlcmZsb3csIGJvdHRvbU92ZXJmbG93KSA9PT0gdG9wT3ZlcmZsb3cpID8gJ3RvcCcgOiAnYm90dG9tJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG9yaWVudGF0aW9uID09PSAndG9wJykge1xuICAgICAgICAgICAgICAgIHN0eWxlcy50b3AgKz0gLWNvbnRhaW5lckhlaWdodDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3R5bGVzLnRvcCArPSBoZWlnaHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIElmIGNvbnRhaW5lciBpcyBub3QgcG9zaXRpb25lZCB0byBib2R5LFxuICAgICAgICAgICAgLy8gY29ycmVjdCBpdHMgcG9zaXRpb24gdXNpbmcgb2Zmc2V0IHBhcmVudCBvZmZzZXRcbiAgICAgICAgICAgIGlmKGNvbnRhaW5lclBhcmVudCAhPT0gZG9jdW1lbnQuYm9keSkge1xuICAgICAgICAgICAgICAgIHZhciBvcGFjaXR5ID0gJGNvbnRhaW5lci5jc3MoJ29wYWNpdHknKSxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50T2Zmc2V0RGlmZjtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoYXQudmlzaWJsZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmNzcygnb3BhY2l0eScsIDApLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcGFyZW50T2Zmc2V0RGlmZiA9ICRjb250YWluZXIub2Zmc2V0UGFyZW50KCkub2Zmc2V0KCk7XG4gICAgICAgICAgICAgICAgc3R5bGVzLnRvcCAtPSBwYXJlbnRPZmZzZXREaWZmLnRvcDtcbiAgICAgICAgICAgICAgICBzdHlsZXMubGVmdCAtPSBwYXJlbnRPZmZzZXREaWZmLmxlZnQ7XG5cbiAgICAgICAgICAgICAgICBpZiAoIXRoYXQudmlzaWJsZSl7XG4gICAgICAgICAgICAgICAgICAgICRjb250YWluZXIuY3NzKCdvcGFjaXR5Jywgb3BhY2l0eSkuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gLTJweCB0byBhY2NvdW50IGZvciBzdWdnZXN0aW9ucyBib3JkZXIuXG4gICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLndpZHRoID09PSAnYXV0bycpIHtcbiAgICAgICAgICAgICAgICBzdHlsZXMud2lkdGggPSAodGhhdC5lbC5vdXRlcldpZHRoKCkgLSAyKSArICdweCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICRjb250YWluZXIuY3NzKHN0eWxlcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5hYmxlS2lsbGVyRm46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljay5hdXRvY29tcGxldGUnLCB0aGF0LmtpbGxlckZuKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlS2lsbGVyRm46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suYXV0b2NvbXBsZXRlJywgdGhhdC5raWxsZXJGbik7XG4gICAgICAgIH0sXG5cbiAgICAgICAga2lsbFN1Z2dlc3Rpb25zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICB0aGF0LnN0b3BLaWxsU3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgICAgIHRoYXQuaW50ZXJ2YWxJZCA9IHdpbmRvdy5zZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoYXQudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGF0LnN0b3BLaWxsU3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgICAgIH0sIDUwKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzdG9wS2lsbFN1Z2dlc3Rpb25zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsSWQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzQ3Vyc29yQXRFbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICB2YWxMZW5ndGggPSB0aGF0LmVsLnZhbCgpLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25TdGFydCA9IHRoYXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydCxcbiAgICAgICAgICAgICAgICByYW5nZTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzZWxlY3Rpb25TdGFydCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZWN0aW9uU3RhcnQgPT09IHZhbExlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5zZWxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICByYW5nZSA9IGRvY3VtZW50LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSgpO1xuICAgICAgICAgICAgICAgIHJhbmdlLm1vdmVTdGFydCgnY2hhcmFjdGVyJywgLXZhbExlbmd0aCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbExlbmd0aCA9PT0gcmFuZ2UudGV4dC5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbktleVByZXNzOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICAvLyBJZiBzdWdnZXN0aW9ucyBhcmUgaGlkZGVuIGFuZCB1c2VyIHByZXNzZXMgYXJyb3cgZG93biwgZGlzcGxheSBzdWdnZXN0aW9uczpcbiAgICAgICAgICAgIGlmICghdGhhdC5kaXNhYmxlZCAmJiAhdGhhdC52aXNpYmxlICYmIGUud2hpY2ggPT09IGtleXMuRE9XTiAmJiB0aGF0LmN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoYXQuZGlzYWJsZWQgfHwgIXRoYXQudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3dpdGNoIChlLndoaWNoKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLkVTQzpcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlJJR0hUOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5oaW50ICYmIHRoYXQub3B0aW9ucy5vbkhpbnQgJiYgdGhhdC5pc0N1cnNvckF0RW5kKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0SGludCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5UQUI6XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LmhpbnQgJiYgdGhhdC5vcHRpb25zLm9uSGludCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RIaW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KHRoYXQuc2VsZWN0ZWRJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMudGFiRGlzYWJsZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlJFVFVSTjpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KHRoYXQuc2VsZWN0ZWRJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5VUDpcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5tb3ZlVXAoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLkRPV046XG4gICAgICAgICAgICAgICAgICAgIHRoYXQubW92ZURvd24oKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDYW5jZWwgZXZlbnQgaWYgZnVuY3Rpb24gZGlkIG5vdCByZXR1cm46XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uS2V5VXA6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmRpc2FibGVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzd2l0Y2ggKGUud2hpY2gpIHtcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuVVA6XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLkRPV046XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5jdXJyZW50VmFsdWUgIT09IHRoYXQuZWwudmFsKCkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmZpbmRCZXN0SGludCgpO1xuICAgICAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMuZGVmZXJSZXF1ZXN0QnkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIERlZmVyIGxvb2t1cCBpbiBjYXNlIHdoZW4gdmFsdWUgY2hhbmdlcyB2ZXJ5IHF1aWNrbHk6XG4gICAgICAgICAgICAgICAgICAgIHRoYXQub25DaGFuZ2VJbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQub25WYWx1ZUNoYW5nZSgpO1xuICAgICAgICAgICAgICAgICAgICB9LCB0aGF0Lm9wdGlvbnMuZGVmZXJSZXF1ZXN0QnkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQub25WYWx1ZUNoYW5nZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvblZhbHVlQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoYXQuZWwudmFsKCksXG4gICAgICAgICAgICAgICAgcXVlcnkgPSB0aGF0LmdldFF1ZXJ5KHZhbHVlKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0aW9uICYmIHRoYXQuY3VycmVudFZhbHVlICE9PSBxdWVyeSkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uID0gbnVsbDtcbiAgICAgICAgICAgICAgICAob3B0aW9ucy5vbkludmFsaWRhdGVTZWxlY3Rpb24gfHwgJC5ub29wKS5jYWxsKHRoYXQuZWxlbWVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcbiAgICAgICAgICAgIHRoYXQuY3VycmVudFZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgZXhpc3Rpbmcgc3VnZ2VzdGlvbiBmb3IgdGhlIG1hdGNoIGJlZm9yZSBwcm9jZWVkaW5nOlxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dCAmJiB0aGF0LmlzRXhhY3RNYXRjaChxdWVyeSkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCgwKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChxdWVyeS5sZW5ndGggPCBvcHRpb25zLm1pbkNoYXJzKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoYXQuZ2V0U3VnZ2VzdGlvbnMocXVlcnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGlzRXhhY3RNYXRjaDogZnVuY3Rpb24gKHF1ZXJ5KSB7XG4gICAgICAgICAgICB2YXIgc3VnZ2VzdGlvbnMgPSB0aGlzLnN1Z2dlc3Rpb25zO1xuXG4gICAgICAgICAgICByZXR1cm4gKHN1Z2dlc3Rpb25zLmxlbmd0aCA9PT0gMSAmJiBzdWdnZXN0aW9uc1swXS52YWx1ZS50b0xvd2VyQ2FzZSgpID09PSBxdWVyeS50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRRdWVyeTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgZGVsaW1pdGVyID0gdGhpcy5vcHRpb25zLmRlbGltaXRlcixcbiAgICAgICAgICAgICAgICBwYXJ0cztcblxuICAgICAgICAgICAgaWYgKCFkZWxpbWl0ZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJ0cyA9IHZhbHVlLnNwbGl0KGRlbGltaXRlcik7XG4gICAgICAgICAgICByZXR1cm4gJC50cmltKHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTdWdnZXN0aW9uc0xvY2FsOiBmdW5jdGlvbiAocXVlcnkpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIHF1ZXJ5TG93ZXJDYXNlID0gcXVlcnkudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgICAgICAgICBmaWx0ZXIgPSBvcHRpb25zLmxvb2t1cEZpbHRlcixcbiAgICAgICAgICAgICAgICBsaW1pdCA9IHBhcnNlSW50KG9wdGlvbnMubG9va3VwTGltaXQsIDEwKSxcbiAgICAgICAgICAgICAgICBkYXRhO1xuXG4gICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb25zOiAkLmdyZXAob3B0aW9ucy5sb29rdXAsIGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWx0ZXIoc3VnZ2VzdGlvbiwgcXVlcnksIHF1ZXJ5TG93ZXJDYXNlKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKGxpbWl0ICYmIGRhdGEuc3VnZ2VzdGlvbnMubGVuZ3RoID4gbGltaXQpIHtcbiAgICAgICAgICAgICAgICBkYXRhLnN1Z2dlc3Rpb25zID0gZGF0YS5zdWdnZXN0aW9ucy5zbGljZSgwLCBsaW1pdCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFN1Z2dlc3Rpb25zOiBmdW5jdGlvbiAocSkge1xuICAgICAgICAgICAgdmFyIHJlc3BvbnNlLFxuICAgICAgICAgICAgICAgIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgc2VydmljZVVybCA9IG9wdGlvbnMuc2VydmljZVVybCxcbiAgICAgICAgICAgICAgICBwYXJhbXMsXG4gICAgICAgICAgICAgICAgY2FjaGVLZXksXG4gICAgICAgICAgICAgICAgYWpheFNldHRpbmdzO1xuXG4gICAgICAgICAgICBvcHRpb25zLnBhcmFtc1tvcHRpb25zLnBhcmFtTmFtZV0gPSBxO1xuICAgICAgICAgICAgcGFyYW1zID0gb3B0aW9ucy5pZ25vcmVQYXJhbXMgPyBudWxsIDogb3B0aW9ucy5wYXJhbXM7XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLm9uU2VhcmNoU3RhcnQuY2FsbCh0aGF0LmVsZW1lbnQsIG9wdGlvbnMucGFyYW1zKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24ob3B0aW9ucy5sb29rdXApKXtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmxvb2t1cChxLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gZGF0YS5zdWdnZXN0aW9ucztcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgZGF0YS5zdWdnZXN0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhhdC5pc0xvY2FsKSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB0aGF0LmdldFN1Z2dlc3Rpb25zTG9jYWwocSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24oc2VydmljZVVybCkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZVVybCA9IHNlcnZpY2VVcmwuY2FsbCh0aGF0LmVsZW1lbnQsIHEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYWNoZUtleSA9IHNlcnZpY2VVcmwgKyAnPycgKyAkLnBhcmFtKHBhcmFtcyB8fCB7fSk7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB0aGF0LmNhY2hlZFJlc3BvbnNlW2NhY2hlS2V5XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlICYmICQuaXNBcnJheShyZXNwb25zZS5zdWdnZXN0aW9ucykpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gcmVzcG9uc2Uuc3VnZ2VzdGlvbnM7XG4gICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaENvbXBsZXRlLmNhbGwodGhhdC5lbGVtZW50LCBxLCByZXNwb25zZS5zdWdnZXN0aW9ucyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF0aGF0LmlzQmFkUXVlcnkocSkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmFib3J0QWpheCgpO1xuXG4gICAgICAgICAgICAgICAgYWpheFNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICB1cmw6IHNlcnZpY2VVcmwsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHBhcmFtcyxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogb3B0aW9ucy50eXBlLFxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogb3B0aW9ucy5kYXRhVHlwZVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAkLmV4dGVuZChhamF4U2V0dGluZ3MsIG9wdGlvbnMuYWpheFNldHRpbmdzKTtcblxuICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QgPSAkLmFqYXgoYWpheFNldHRpbmdzKS5kb25lKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBvcHRpb25zLnRyYW5zZm9ybVJlc3VsdChkYXRhLCBxKTtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5wcm9jZXNzUmVzcG9uc2UocmVzdWx0LCBxLCBjYWNoZUtleSk7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgcmVzdWx0LnN1Z2dlc3Rpb25zKTtcbiAgICAgICAgICAgICAgICB9KS5mYWlsKGZ1bmN0aW9uIChqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pIHtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaEVycm9yLmNhbGwodGhhdC5lbGVtZW50LCBxLCBqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBpc0JhZFF1ZXJ5OiBmdW5jdGlvbiAocSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMucHJldmVudEJhZFF1ZXJpZXMpe1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGJhZFF1ZXJpZXMgPSB0aGlzLmJhZFF1ZXJpZXMsXG4gICAgICAgICAgICAgICAgaSA9IGJhZFF1ZXJpZXMubGVuZ3RoO1xuXG4gICAgICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgICAgICAgaWYgKHEuaW5kZXhPZihiYWRRdWVyaWVzW2ldKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBoaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbih0aGF0Lm9wdGlvbnMub25IaWRlKSAmJiB0aGF0LnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICB0aGF0Lm9wdGlvbnMub25IaWRlLmNhbGwodGhhdC5lbGVtZW50LCBjb250YWluZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xuICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5oaWRlKCk7XG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQobnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3VnZ2VzdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3VnZ2VzdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zaG93Tm9TdWdnZXN0aW9uTm90aWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm9TdWdnZXN0aW9ucygpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIGdyb3VwQnkgPSBvcHRpb25zLmdyb3VwQnksXG4gICAgICAgICAgICAgICAgZm9ybWF0UmVzdWx0ID0gb3B0aW9ucy5mb3JtYXRSZXN1bHQsXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGF0LmdldFF1ZXJ5KHRoYXQuY3VycmVudFZhbHVlKSxcbiAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSB0aGF0LmNsYXNzZXMuc3VnZ2VzdGlvbixcbiAgICAgICAgICAgICAgICBjbGFzc1NlbGVjdGVkID0gdGhhdC5jbGFzc2VzLnNlbGVjdGVkLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXG4gICAgICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQodGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyKSxcbiAgICAgICAgICAgICAgICBiZWZvcmVSZW5kZXIgPSBvcHRpb25zLmJlZm9yZVJlbmRlcixcbiAgICAgICAgICAgICAgICBodG1sID0gJycsXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgZm9ybWF0R3JvdXAgPSBmdW5jdGlvbiAoc3VnZ2VzdGlvbiwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50Q2F0ZWdvcnkgPSBzdWdnZXN0aW9uLmRhdGFbZ3JvdXBCeV07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYXRlZ29yeSA9PT0gY3VycmVudENhdGVnb3J5KXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5ID0gY3VycmVudENhdGVnb3J5O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJhdXRvY29tcGxldGUtZ3JvdXBcIj48c3Ryb25nPicgKyBjYXRlZ29yeSArICc8L3N0cm9uZz48L2Rpdj4nO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy50cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0ICYmIHRoYXQuaXNFeGFjdE1hdGNoKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KDApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQnVpbGQgc3VnZ2VzdGlvbnMgaW5uZXIgSFRNTDpcbiAgICAgICAgICAgICQuZWFjaCh0aGF0LnN1Z2dlc3Rpb25zLCBmdW5jdGlvbiAoaSwgc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgICAgIGlmIChncm91cEJ5KXtcbiAgICAgICAgICAgICAgICAgICAgaHRtbCArPSBmb3JtYXRHcm91cChzdWdnZXN0aW9uLCB2YWx1ZSwgaSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cIicgKyBjbGFzc05hbWUgKyAnXCIgZGF0YS1pbmRleD1cIicgKyBpICsgJ1wiPicgKyBmb3JtYXRSZXN1bHQoc3VnZ2VzdGlvbiwgdmFsdWUpICsgJzwvZGl2Pic7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5hZGp1c3RDb250YWluZXJXaWR0aCgpO1xuXG4gICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyLmRldGFjaCgpO1xuICAgICAgICAgICAgY29udGFpbmVyLmh0bWwoaHRtbCk7XG5cbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24oYmVmb3JlUmVuZGVyKSkge1xuICAgICAgICAgICAgICAgIGJlZm9yZVJlbmRlci5jYWxsKHRoYXQuZWxlbWVudCwgY29udGFpbmVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xuICAgICAgICAgICAgY29udGFpbmVyLnNob3coKTtcblxuICAgICAgICAgICAgLy8gU2VsZWN0IGZpcnN0IHZhbHVlIGJ5IGRlZmF1bHQ6XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5hdXRvU2VsZWN0Rmlyc3QpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAwO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5zY3JvbGxUb3AoMCk7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmNoaWxkcmVuKCcuJyArIGNsYXNzTmFtZSkuZmlyc3QoKS5hZGRDbGFzcyhjbGFzc1NlbGVjdGVkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoYXQuZmluZEJlc3RIaW50KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbm9TdWdnZXN0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxuICAgICAgICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gJCh0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIpO1xuXG4gICAgICAgICAgICB0aGlzLmFkanVzdENvbnRhaW5lcldpZHRoKCk7XG5cbiAgICAgICAgICAgIC8vIFNvbWUgZXhwbGljaXQgc3RlcHMuIEJlIGNhcmVmdWwgaGVyZSBhcyBpdCBlYXN5IHRvIGdldFxuICAgICAgICAgICAgLy8gbm9TdWdnZXN0aW9uc0NvbnRhaW5lciByZW1vdmVkIGZyb20gRE9NIGlmIG5vdCBkZXRhY2hlZCBwcm9wZXJseS5cbiAgICAgICAgICAgIG5vU3VnZ2VzdGlvbnNDb250YWluZXIuZGV0YWNoKCk7XG4gICAgICAgICAgICBjb250YWluZXIuZW1wdHkoKTsgLy8gY2xlYW4gc3VnZ2VzdGlvbnMgaWYgYW55XG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kKG5vU3VnZ2VzdGlvbnNDb250YWluZXIpO1xuXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XG5cbiAgICAgICAgICAgIGNvbnRhaW5lci5zaG93KCk7XG4gICAgICAgICAgICB0aGF0LnZpc2libGUgPSB0cnVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFkanVzdENvbnRhaW5lcldpZHRoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcik7XG5cbiAgICAgICAgICAgIC8vIElmIHdpZHRoIGlzIGF1dG8sIGFkanVzdCB3aWR0aCBiZWZvcmUgZGlzcGxheWluZyBzdWdnZXN0aW9ucyxcbiAgICAgICAgICAgIC8vIGJlY2F1c2UgaWYgaW5zdGFuY2Ugd2FzIGNyZWF0ZWQgYmVmb3JlIGlucHV0IGhhZCB3aWR0aCwgaXQgd2lsbCBiZSB6ZXJvLlxuICAgICAgICAgICAgLy8gQWxzbyBpdCBhZGp1c3RzIGlmIGlucHV0IHdpZHRoIGhhcyBjaGFuZ2VkLlxuICAgICAgICAgICAgLy8gLTJweCB0byBhY2NvdW50IGZvciBzdWdnZXN0aW9ucyBib3JkZXIuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy53aWR0aCA9PT0gJ2F1dG8nKSB7XG4gICAgICAgICAgICAgICAgd2lkdGggPSB0aGF0LmVsLm91dGVyV2lkdGgoKSAtIDI7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLndpZHRoKHdpZHRoID4gMCA/IHdpZHRoIDogMzAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBmaW5kQmVzdEhpbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoYXQuZWwudmFsKCkudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgICAgICAgICBiZXN0TWF0Y2ggPSBudWxsO1xuXG4gICAgICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkLmVhY2godGhhdC5zdWdnZXN0aW9ucywgZnVuY3Rpb24gKGksIHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgZm91bmRNYXRjaCA9IHN1Z2dlc3Rpb24udmFsdWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHZhbHVlKSA9PT0gMDtcbiAgICAgICAgICAgICAgICBpZiAoZm91bmRNYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICBiZXN0TWF0Y2ggPSBzdWdnZXN0aW9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gIWZvdW5kTWF0Y2g7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KGJlc3RNYXRjaCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2lnbmFsSGludDogZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBoaW50VmFsdWUgPSAnJyxcbiAgICAgICAgICAgICAgICB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIGlmIChzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgaGludFZhbHVlID0gdGhhdC5jdXJyZW50VmFsdWUgKyBzdWdnZXN0aW9uLnZhbHVlLnN1YnN0cih0aGF0LmN1cnJlbnRWYWx1ZS5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoYXQuaGludFZhbHVlICE9PSBoaW50VmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmhpbnRWYWx1ZSA9IGhpbnRWYWx1ZTtcbiAgICAgICAgICAgICAgICB0aGF0LmhpbnQgPSBzdWdnZXN0aW9uO1xuICAgICAgICAgICAgICAgICh0aGlzLm9wdGlvbnMub25IaW50IHx8ICQubm9vcCkoaGludFZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB2ZXJpZnlTdWdnZXN0aW9uc0Zvcm1hdDogZnVuY3Rpb24gKHN1Z2dlc3Rpb25zKSB7XG4gICAgICAgICAgICAvLyBJZiBzdWdnZXN0aW9ucyBpcyBzdHJpbmcgYXJyYXksIGNvbnZlcnQgdGhlbSB0byBzdXBwb3J0ZWQgZm9ybWF0OlxuICAgICAgICAgICAgaWYgKHN1Z2dlc3Rpb25zLmxlbmd0aCAmJiB0eXBlb2Ygc3VnZ2VzdGlvbnNbMF0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICQubWFwKHN1Z2dlc3Rpb25zLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IHZhbHVlLCBkYXRhOiBudWxsIH07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzdWdnZXN0aW9ucztcbiAgICAgICAgfSxcblxuICAgICAgICB2YWxpZGF0ZU9yaWVudGF0aW9uOiBmdW5jdGlvbihvcmllbnRhdGlvbiwgZmFsbGJhY2spIHtcbiAgICAgICAgICAgIG9yaWVudGF0aW9uID0gJC50cmltKG9yaWVudGF0aW9uIHx8ICcnKS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgICAgICBpZigkLmluQXJyYXkob3JpZW50YXRpb24sIFsnYXV0bycsICdib3R0b20nLCAndG9wJ10pID09PSAtMSl7XG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb24gPSBmYWxsYmFjaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG9yaWVudGF0aW9uO1xuICAgICAgICB9LFxuXG4gICAgICAgIHByb2Nlc3NSZXNwb25zZTogZnVuY3Rpb24gKHJlc3VsdCwgb3JpZ2luYWxRdWVyeSwgY2FjaGVLZXkpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zO1xuXG4gICAgICAgICAgICByZXN1bHQuc3VnZ2VzdGlvbnMgPSB0aGF0LnZlcmlmeVN1Z2dlc3Rpb25zRm9ybWF0KHJlc3VsdC5zdWdnZXN0aW9ucyk7XG5cbiAgICAgICAgICAgIC8vIENhY2hlIHJlc3VsdHMgaWYgY2FjaGUgaXMgbm90IGRpc2FibGVkOlxuICAgICAgICAgICAgaWYgKCFvcHRpb25zLm5vQ2FjaGUpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmNhY2hlZFJlc3BvbnNlW2NhY2hlS2V5XSA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5wcmV2ZW50QmFkUXVlcmllcyAmJiByZXN1bHQuc3VnZ2VzdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuYmFkUXVlcmllcy5wdXNoKG9yaWdpbmFsUXVlcnkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUmV0dXJuIGlmIG9yaWdpbmFsUXVlcnkgaXMgbm90IG1hdGNoaW5nIGN1cnJlbnQgcXVlcnk6XG4gICAgICAgICAgICBpZiAob3JpZ2luYWxRdWVyeSAhPT0gdGhhdC5nZXRRdWVyeSh0aGF0LmN1cnJlbnRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSByZXN1bHQuc3VnZ2VzdGlvbnM7XG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhY3RpdmF0ZTogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgYWN0aXZlSXRlbSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZCA9IHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCxcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuID0gY29udGFpbmVyLmZpbmQoJy4nICsgdGhhdC5jbGFzc2VzLnN1Z2dlc3Rpb24pO1xuXG4gICAgICAgICAgICBjb250YWluZXIuZmluZCgnLicgKyBzZWxlY3RlZCkucmVtb3ZlQ2xhc3Moc2VsZWN0ZWQpO1xuXG4gICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSBpbmRleDtcblxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCAhPT0gLTEgJiYgY2hpbGRyZW4ubGVuZ3RoID4gdGhhdC5zZWxlY3RlZEluZGV4KSB7XG4gICAgICAgICAgICAgICAgYWN0aXZlSXRlbSA9IGNoaWxkcmVuLmdldCh0aGF0LnNlbGVjdGVkSW5kZXgpO1xuICAgICAgICAgICAgICAgICQoYWN0aXZlSXRlbSkuYWRkQ2xhc3Moc2VsZWN0ZWQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBhY3RpdmVJdGVtO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWxlY3RIaW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgaSA9ICQuaW5BcnJheSh0aGF0LmhpbnQsIHRoYXQuc3VnZ2VzdGlvbnMpO1xuXG4gICAgICAgICAgICB0aGF0LnNlbGVjdChpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWxlY3Q6IGZ1bmN0aW9uIChpKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgIHRoYXQub25TZWxlY3QoaSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbW92ZVVwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5jaGlsZHJlbigpLmZpcnN0KCkucmVtb3ZlQ2xhc3ModGhhdC5jbGFzc2VzLnNlbGVjdGVkKTtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcbiAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgdGhhdC5maW5kQmVzdEhpbnQoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQuYWRqdXN0U2Nyb2xsKHRoYXQuc2VsZWN0ZWRJbmRleCAtIDEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1vdmVEb3duOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09ICh0aGF0LnN1Z2dlc3Rpb25zLmxlbmd0aCAtIDEpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LmFkanVzdFNjcm9sbCh0aGF0LnNlbGVjdGVkSW5kZXggKyAxKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGp1c3RTY3JvbGw6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGFjdGl2ZUl0ZW0gPSB0aGF0LmFjdGl2YXRlKGluZGV4KTtcblxuICAgICAgICAgICAgaWYgKCFhY3RpdmVJdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgb2Zmc2V0VG9wLFxuICAgICAgICAgICAgICAgIHVwcGVyQm91bmQsXG4gICAgICAgICAgICAgICAgbG93ZXJCb3VuZCxcbiAgICAgICAgICAgICAgICBoZWlnaHREZWx0YSA9ICQoYWN0aXZlSXRlbSkub3V0ZXJIZWlnaHQoKTtcblxuICAgICAgICAgICAgb2Zmc2V0VG9wID0gYWN0aXZlSXRlbS5vZmZzZXRUb3A7XG4gICAgICAgICAgICB1cHBlckJvdW5kID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5zY3JvbGxUb3AoKTtcbiAgICAgICAgICAgIGxvd2VyQm91bmQgPSB1cHBlckJvdW5kICsgdGhhdC5vcHRpb25zLm1heEhlaWdodCAtIGhlaWdodERlbHRhO1xuXG4gICAgICAgICAgICBpZiAob2Zmc2V0VG9wIDwgdXBwZXJCb3VuZCkge1xuICAgICAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuc2Nyb2xsVG9wKG9mZnNldFRvcCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9mZnNldFRvcCA+IGxvd2VyQm91bmQpIHtcbiAgICAgICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnNjcm9sbFRvcChvZmZzZXRUb3AgLSB0aGF0Lm9wdGlvbnMubWF4SGVpZ2h0ICsgaGVpZ2h0RGVsdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXRoYXQub3B0aW9ucy5wcmVzZXJ2ZUlucHV0KSB7XG4gICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5nZXRWYWx1ZSh0aGF0LnN1Z2dlc3Rpb25zW2luZGV4XS52YWx1ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uU2VsZWN0OiBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvblNlbGVjdENhbGxiYWNrID0gdGhhdC5vcHRpb25zLm9uU2VsZWN0LFxuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb24gPSB0aGF0LnN1Z2dlc3Rpb25zW2luZGV4XTtcblxuICAgICAgICAgICAgdGhhdC5jdXJyZW50VmFsdWUgPSB0aGF0LmdldFZhbHVlKHN1Z2dlc3Rpb24udmFsdWUpO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5jdXJyZW50VmFsdWUgIT09IHRoYXQuZWwudmFsKCkgJiYgIXRoYXQub3B0aW9ucy5wcmVzZXJ2ZUlucHV0KSB7XG4gICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQobnVsbCk7XG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gW107XG4gICAgICAgICAgICB0aGF0LnNlbGVjdGlvbiA9IHN1Z2dlc3Rpb247XG5cbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24ob25TZWxlY3RDYWxsYmFjaykpIHtcbiAgICAgICAgICAgICAgICBvblNlbGVjdENhbGxiYWNrLmNhbGwodGhhdC5lbGVtZW50LCBzdWdnZXN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXRWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgZGVsaW1pdGVyID0gdGhhdC5vcHRpb25zLmRlbGltaXRlcixcbiAgICAgICAgICAgICAgICBjdXJyZW50VmFsdWUsXG4gICAgICAgICAgICAgICAgcGFydHM7XG5cbiAgICAgICAgICAgIGlmICghZGVsaW1pdGVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjdXJyZW50VmFsdWUgPSB0aGF0LmN1cnJlbnRWYWx1ZTtcbiAgICAgICAgICAgIHBhcnRzID0gY3VycmVudFZhbHVlLnNwbGl0KGRlbGltaXRlcik7XG5cbiAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50VmFsdWUuc3Vic3RyKDAsIGN1cnJlbnRWYWx1ZS5sZW5ndGggLSBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXS5sZW5ndGgpICsgdmFsdWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzcG9zZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdGhhdC5lbC5vZmYoJy5hdXRvY29tcGxldGUnKS5yZW1vdmVEYXRhKCdhdXRvY29tcGxldGUnKTtcbiAgICAgICAgICAgIHRoYXQuZGlzYWJsZUtpbGxlckZuKCk7XG4gICAgICAgICAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUuYXV0b2NvbXBsZXRlJywgdGhhdC5maXhQb3NpdGlvbkNhcHR1cmUpO1xuICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBDcmVhdGUgY2hhaW5hYmxlIGpRdWVyeSBwbHVnaW46XG4gICAgJC5mbi5hdXRvY29tcGxldGUgPSAkLmZuLmRldmJyaWRnZUF1dG9jb21wbGV0ZSA9IGZ1bmN0aW9uIChvcHRpb25zLCBhcmdzKSB7XG4gICAgICAgIHZhciBkYXRhS2V5ID0gJ2F1dG9jb21wbGV0ZSc7XG4gICAgICAgIC8vIElmIGZ1bmN0aW9uIGludm9rZWQgd2l0aG91dCBhcmd1bWVudCByZXR1cm5cbiAgICAgICAgLy8gaW5zdGFuY2Ugb2YgdGhlIGZpcnN0IG1hdGNoZWQgZWxlbWVudDpcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpcnN0KCkuZGF0YShkYXRhS2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGlucHV0RWxlbWVudCA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBpbnB1dEVsZW1lbnQuZGF0YShkYXRhS2V5KTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZSAmJiB0eXBlb2YgaW5zdGFuY2Vbb3B0aW9uc10gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2Vbb3B0aW9uc10oYXJncyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBJZiBpbnN0YW5jZSBhbHJlYWR5IGV4aXN0cywgZGVzdHJveSBpdDpcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UgJiYgaW5zdGFuY2UuZGlzcG9zZSkge1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGluc3RhbmNlID0gbmV3IEF1dG9jb21wbGV0ZSh0aGlzLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICBpbnB1dEVsZW1lbnQuZGF0YShkYXRhS2V5LCBpbnN0YW5jZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG59KSk7XG4iLCJ2YXIgbm90aWZpY2F0aW9uID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgbm90aWZpY2F0aW9uX2JveCA9ZmFsc2U7XG4gIHZhciBpc19pbml0PWZhbHNlO1xuICB2YXIgY29uZmlybV9vcHQ9e1xuICAgIHRpdGxlOlwi0KPQtNCw0LvQtdC90LjQtVwiLFxuICAgIHF1ZXN0aW9uOlwi0JLRiyDQtNC10LnRgdGC0LLQuNGC0LXQu9GM0L3QviDRhdC+0YLQuNGC0LUg0YPQtNCw0LvQuNGC0Yw/XCIsXG4gICAgYnV0dG9uWWVzOlwi0JTQsFwiLFxuICAgIGJ1dHRvbk5vOlwi0J3QtdGCXCIsXG4gICAgY2FsbGJhY2tZZXM6ZmFsc2UsXG4gICAgY2FsbGJhY2tObzpmYWxzZSxcbiAgICBvYmo6ZmFsc2UsXG4gIH07XG5cbiAgdmFyIGFsZXJ0X29wdD17XG4gICAgdGl0bGU6XCJcIixcbiAgICBxdWVzdGlvbjpcItCh0L7QvtCx0YnQtdC90LjQtVwiLFxuICAgIGJ1dHRvblllczpcItCU0LBcIixcbiAgICBjYWxsYmFja1llczpmYWxzZSxcbiAgICBvYmo6ZmFsc2UsXG4gIH07XG5cblxuICBmdW5jdGlvbiBpbml0KCl7XG4gICAgaXNfaW5pdD10cnVlO1xuICAgIG5vdGlmaWNhdGlvbl9ib3g9JCgnLm5vdGlmaWNhdGlvbl9ib3gnKTtcbiAgICBpZihub3RpZmljYXRpb25fYm94Lmxlbmd0aD4wKXJldHVybjtcblxuICAgICQoJ2JvZHknKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdub3RpZmljYXRpb25fYm94Jz48L2Rpdj5cIik7XG4gICAgbm90aWZpY2F0aW9uX2JveD0kKCcubm90aWZpY2F0aW9uX2JveCcpO1xuXG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCcubm90aWZ5X2NvbnRyb2wnLGNsb3NlTW9kYWwpO1xuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywnLm5vdGlmeV9jbG9zZScsY2xvc2VNb2RhbCk7XG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLGNsb3NlTW9kYWxGb24pO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2VNb2RhbCgpe1xuICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnc2hvd19ub3RpZmknKTtcbiAgfVxuICBmdW5jdGlvbiBjbG9zZU1vZGFsRm9uKGUpe1xuICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG4gICAgaWYodGFyZ2V0LmNsYXNzTmFtZT09XCJub3RpZmljYXRpb25fYm94XCIpe1xuICAgICAgY2xvc2VNb2RhbCgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFsZXJ0KGRhdGEpe1xuICAgIGlmKCFkYXRhKWRhdGE9e307XG4gICAgZGF0YT1vYmplY3RzKGFsZXJ0X29wdCxkYXRhKTtcblxuICAgIGlmKCFpc19pbml0KWluaXQoKTtcblxuICAgIG5vdHlmeV9jbGFzcz0nbm90aWZ5X2JveCAnO1xuICAgIGlmKGRhdGEubm90eWZ5X2NsYXNzKW5vdHlmeV9jbGFzcys9ZGF0YS5ub3R5ZnlfY2xhc3M7XG5cbiAgICBib3hfaHRtbD0nPGRpdiBjbGFzcz1cIicrbm90eWZ5X2NsYXNzKydcIj4nO1xuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV90aXRsZVwiPic7XG4gICAgYm94X2h0bWwrPWRhdGEudGl0bGU7XG4gICAgYm94X2h0bWwrPSc8c3BhbiBjbGFzcz1cIm5vdGlmeV9jbG9zZVwiPjwvc3Bhbj4nO1xuICAgIGJveF9odG1sKz0nPC9kaXY+JztcblxuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcbiAgICBib3hfaHRtbCs9ZGF0YS5xdWVzdGlvbjtcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XG5cbiAgICBpZihkYXRhLmJ1dHRvblllc3x8ZGF0YS5idXR0b25Obykge1xuICAgICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udHJvbFwiPic7XG4gICAgICBpZiAoZGF0YS5idXR0b25ZZXMpYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiPicgKyBkYXRhLmJ1dHRvblllcyArICc8L2Rpdj4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX25vXCI+JyArIGRhdGEuYnV0dG9uTm8gKyAnPC9kaXY+JztcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuICAgIH07XG5cbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XG4gICAgbm90aWZpY2F0aW9uX2JveC5odG1sKGJveF9odG1sKTtcblxuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcbiAgICB9LDEwMClcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbmZpcm0oZGF0YSl7XG4gICAgaWYoIWRhdGEpZGF0YT17fTtcbiAgICBkYXRhPW9iamVjdHMoY29uZmlybV9vcHQsZGF0YSk7XG5cbiAgICBpZighaXNfaW5pdClpbml0KCk7XG5cbiAgICBib3hfaHRtbD0nPGRpdiBjbGFzcz1cIm5vdGlmeV9ib3hcIj4nO1xuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV90aXRsZVwiPic7XG4gICAgYm94X2h0bWwrPWRhdGEudGl0bGU7XG4gICAgYm94X2h0bWwrPSc8c3BhbiBjbGFzcz1cIm5vdGlmeV9jbG9zZVwiPjwvc3Bhbj4nO1xuICAgIGJveF9odG1sKz0nPC9kaXY+JztcblxuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcbiAgICBib3hfaHRtbCs9ZGF0YS5xdWVzdGlvbjtcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XG5cbiAgICBpZihkYXRhLmJ1dHRvblllc3x8ZGF0YS5idXR0b25Obykge1xuICAgICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udHJvbFwiPic7XG4gICAgICBpZiAoZGF0YS5idXR0b25ZZXMpYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiPicgKyBkYXRhLmJ1dHRvblllcyArICc8L2Rpdj4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX25vXCI+JyArIGRhdGEuYnV0dG9uTm8gKyAnPC9kaXY+JztcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuICAgIH1cblxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xuXG4gICAgaWYoZGF0YS5jYWxsYmFja1llcyE9ZmFsc2Upe1xuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl95ZXMnKS5vbignY2xpY2snLGRhdGEuY2FsbGJhY2tZZXMuYmluZChkYXRhLm9iaikpO1xuICAgIH1cbiAgICBpZihkYXRhLmNhbGxiYWNrTm8hPWZhbHNlKXtcbiAgICAgIG5vdGlmaWNhdGlvbl9ib3guZmluZCgnLm5vdGlmeV9idG5fbm8nKS5vbignY2xpY2snLGRhdGEuY2FsbGJhY2tOby5iaW5kKGRhdGEub2JqKSk7XG4gICAgfVxuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcbiAgICB9LDEwMClcblxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBhbGVydDogYWxlcnQsXG4gICAgY29uZmlybTogY29uZmlybVxuICB9O1xuXG59KSgpO1xuXG5cbiQoJ1tyZWY9cG9wdXBdJykub24oJ2NsaWNrJyxmdW5jdGlvbiAoZSl7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgJHRoaXM9JCh0aGlzKVxuICBlbD0kKCR0aGlzLmF0dHIoJ2hyZWYnKSk7XG4gIGRhdGE9ZWwuZGF0YSgpO1xuXG4gIGRhdGEucXVlc3Rpb249ZWwuaHRtbCgpO1xuICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XG59KTtcbiIsIiQod2luZG93KS5sb2FkKGZ1bmN0aW9uKCkge1xuXG4gICQoJy5hY2NvcmRpb24gLmFjY29yZGlvbi1jb250cm9sJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJHRoaXMgPSAkKHRoaXMpO1xuICAgICRhY2NvcmRpb24gPSAkdGhpcy5jbG9zZXN0KCcuYWNjb3JkaW9uJyk7XG5cbiAgICBpZiAoJGFjY29yZGlvbi5oYXNDbGFzcygnb3BlbicpKSB7XG4gICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLmhpZGUoMzAwKTtcbiAgICAgICRhY2NvcmRpb24ucmVtb3ZlQ2xhc3MoJ29wZW4nKVxuICAgIH0gZWxzZSB7XG4gICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLnNob3coMzAwKTtcbiAgICAgICRhY2NvcmRpb24uYWRkQ2xhc3MoJ29wZW4nKVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xufSlcblxub2JqZWN0cyA9IGZ1bmN0aW9uIChhLGIpIHtcbiAgdmFyIGMgPSBiLFxuICAgIGtleTtcbiAgZm9yIChrZXkgaW4gYSkge1xuICAgIGlmIChhLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIGNba2V5XSA9IGtleSBpbiBiID8gYltrZXldIDogYVtrZXldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYztcbn07XG5cbihmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCl7XG4gICAgZGF0YT10aGlzO1xuICAgIGRhdGEuaW1nLmF0dHIoJ3NyYycsZGF0YS5zcmMpO1xuICB9XG5cbiAgaW1ncz0kKCdzZWN0aW9uOm5vdCgubmF2aWdhdGlvbiknKS5maW5kKCcubG9nbyBpbWcnKTtcbiAgZm9yICh2YXIgaT0wO2k8aW1ncy5sZW5ndGg7aSsrKXtcbiAgICBpbWc9aW1ncy5lcShpKTtcbiAgICBzcmM9aW1nLmF0dHIoJ3NyYycpO1xuICAgIGltZy5hdHRyKCdzcmMnLCcvaW1hZ2VzL3RlbXBsYXRlLWxvZ28uanBnJyk7XG4gICAgZGF0YT17XG4gICAgICBzcmM6c3JjLFxuICAgICAgaW1nOmltZ1xuICAgIH07XG4gICAgaW1hZ2U9JCgnPGltZy8+Jyx7XG4gICAgICBzcmM6c3JjXG4gICAgfSkub24oJ2xvYWQnLGltZ19sb2FkX2ZpbmlzaC5iaW5kKGRhdGEpKVxuICB9XG59KSgpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIGVscz0kKCcuYWpheF9sb2FkJyk7XG4gIGZvcihpPTA7aTxlbHMubGVuZ3RoO2krKyl7XG4gICAgZWw9ZWxzLmVxKGkpO1xuICAgIHVybD1lbC5hdHRyKCdyZXMnKTtcbiAgICAkLmdldCh1cmwsZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICR0aGlzPSQodGhpcyk7XG4gICAgICAkdGhpcy5odG1sKGRhdGEpO1xuICAgICAgYWpheEZvcm0oJHRoaXMpO1xuICAgIH0uYmluZChlbCkpXG4gIH1cbn0pKCk7XG5cbiQoJ2lucHV0W3R5cGU9ZmlsZV0nKS5vbignY2hhbmdlJyxmdW5jdGlvbihldnQpe1xuICB2YXIgZmlsZSA9IGV2dC50YXJnZXQuZmlsZXM7IC8vIEZpbGVMaXN0IG9iamVjdFxuICB2YXIgZiA9IGZpbGVbMF07XG4gIC8vIE9ubHkgcHJvY2VzcyBpbWFnZSBmaWxlcy5cbiAgaWYgKCFmLnR5cGUubWF0Y2goJ2ltYWdlLionKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblxuICBkYXRhPSB7XG4gICAgJ2VsJzogdGhpcyxcbiAgICAnZic6IGZcbiAgfTtcbiAgcmVhZGVyLm9ubG9hZCA9IChmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGltZz0kKCdbZm9yPVwiJytkYXRhLmVsLm5hbWUrJ1wiXScpO1xuICAgICAgaWYoaW1nLmxlbmd0aD4wKXtcbiAgICAgICAgaW1nLmF0dHIoJ3NyYycsZS50YXJnZXQucmVzdWx0KVxuICAgICAgfVxuICAgIH07XG4gIH0pKGRhdGEpO1xuICAvLyBSZWFkIGluIHRoZSBpbWFnZSBmaWxlIGFzIGEgZGF0YSBVUkwuXG4gIHJlYWRlci5yZWFkQXNEYXRhVVJMKGYpO1xufSk7XG5cbiQoJ2JvZHknKS5vbignY2xpY2snLCdhLmFqYXhGb3JtT3BlbicsZnVuY3Rpb24oZSl7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgaHJlZj10aGlzLmhyZWYuc3BsaXQoJyMnKTtcbiAgaHJlZj1ocmVmW2hyZWYubGVuZ3RoLTFdO1xuXG4gIGRhdGE9e1xuICAgIGJ1dHRvblllczpmYWxzZSxcbiAgICBub3R5ZnlfY2xhc3M6XCJub3RpZnlfd2hpdGUgbG9hZGluZ1wiLFxuICAgIHF1ZXN0aW9uOicnXG4gIH07XG4gIG1vZGFsX2NsYXNzPSQodGhpcykuZGF0YSgnbW9kYWwtY2xhc3MnKTtcblxuICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XG4gICQuZ2V0KCcvJytocmVmLGZ1bmN0aW9uKGRhdGEpe1xuICAgICQoJy5ub3RpZnlfYm94JykucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAkKCcubm90aWZ5X2JveCAubm90aWZ5X2NvbnRlbnQnKS5odG1sKGRhdGEuaHRtbCk7XG4gICAgYWpheEZvcm0oJCgnLm5vdGlmeV9ib3ggLm5vdGlmeV9jb250ZW50JykpO1xuICAgIGlmKG1vZGFsX2NsYXNzKXtcbiAgICAgICQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCAucm93JykuYWRkQ2xhc3MobW9kYWxfY2xhc3MpO1xuICAgIH1cbiAgfSwnanNvbicpXG59KTsiXX0=
