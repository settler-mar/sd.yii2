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

    var affiliate = {
        control: {
            events: function() {
                ajax.control.sendFormData("#top .mail-invitation-form", "/account/affiliate", "Mail Invitation Ajax Error", function() {
                    var invitationSuccess = noty({
                        text: "<b>Поздравляем!</b><br>Приглашение было успешно отправлено.",
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

                    $("#top .mail-invitation-form")[0].reset();
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

                ajax.control.sendFormData("#top form[name=fund-transfer-form]", "/account/fund-transfer/add", "Fund Transfer Ajax Error", function() {
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

                ajax.control.sendFormData("#top form[name=autopayment-form]", "/account/fund-transfer/auto", "Auto Payment Ajax Error", function() {
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

                ajax.control.sendFormData("#top form[name=delete-autopayment-form]", "/account/fund-transfer/delete-auto", "Delete Auto Payment Ajax Error", function() {
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
    affiliate.control.events();
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpxdWVyeS5tZW51LWFpbS5qcyIsImNpcmNsZXMubWluLmpzIiwiZGF0ZXBpY2tlci5qcyIsImpxdWVyeS5ub3R5LnBhY2thZ2VkLm1pbi5qcyIsIm1haW4uanMiLCJhbmltby5qcyIsImpxdWVyeS5tb2NramF4LmpzIiwianF1ZXJ5LmF1dG9jb21wbGV0ZS5qcyIsIm5vdGlmaWNhdGlvbi5qcyIsImZvcl9hbGwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDblVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbm9EQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4bEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBSDE5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FJempCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIG1lbnUtYWltIGlzIGEgalF1ZXJ5IHBsdWdpbiBmb3IgZHJvcGRvd24gbWVudXMgdGhhdCBjYW4gZGlmZmVyZW50aWF0ZVxyXG4gKiBiZXR3ZWVuIGEgdXNlciB0cnlpbmcgaG92ZXIgb3ZlciBhIGRyb3Bkb3duIGl0ZW0gdnMgdHJ5aW5nIHRvIG5hdmlnYXRlIGludG9cclxuICogYSBzdWJtZW51J3MgY29udGVudHMuXHJcbiAqXHJcbiAqIG1lbnUtYWltIGFzc3VtZXMgdGhhdCB5b3UgaGF2ZSBhcmUgdXNpbmcgYSBtZW51IHdpdGggc3VibWVudXMgdGhhdCBleHBhbmRcclxuICogdG8gdGhlIG1lbnUncyByaWdodC4gSXQgd2lsbCBmaXJlIGV2ZW50cyB3aGVuIHRoZSB1c2VyJ3MgbW91c2UgZW50ZXJzIGEgbmV3XHJcbiAqIGRyb3Bkb3duIGl0ZW0gKmFuZCogd2hlbiB0aGF0IGl0ZW0gaXMgYmVpbmcgaW50ZW50aW9uYWxseSBob3ZlcmVkIG92ZXIuXHJcbiAqXHJcbiAqIF9fX19fX19fX19fX19fX19fX19fX19fX19fXHJcbiAqIHwgTW9ua2V5cyAgPnwgICBHb3JpbGxhICB8XHJcbiAqIHwgR29yaWxsYXMgPnwgICBDb250ZW50ICB8XHJcbiAqIHwgQ2hpbXBzICAgPnwgICBIZXJlICAgICB8XHJcbiAqIHxfX19fX19fX19fX3xfX19fX19fX19fX198XHJcbiAqXHJcbiAqIEluIHRoZSBhYm92ZSBleGFtcGxlLCBcIkdvcmlsbGFzXCIgaXMgc2VsZWN0ZWQgYW5kIGl0cyBzdWJtZW51IGNvbnRlbnQgaXNcclxuICogYmVpbmcgc2hvd24gb24gdGhlIHJpZ2h0LiBJbWFnaW5lIHRoYXQgdGhlIHVzZXIncyBjdXJzb3IgaXMgaG92ZXJpbmcgb3ZlclxyXG4gKiBcIkdvcmlsbGFzLlwiIFdoZW4gdGhleSBtb3ZlIHRoZWlyIG1vdXNlIGludG8gdGhlIFwiR29yaWxsYSBDb250ZW50XCIgYXJlYSwgdGhleVxyXG4gKiBtYXkgYnJpZWZseSBob3ZlciBvdmVyIFwiQ2hpbXBzLlwiIFRoaXMgc2hvdWxkbid0IGNsb3NlIHRoZSBcIkdvcmlsbGEgQ29udGVudFwiXHJcbiAqIGFyZWEuXHJcbiAqXHJcbiAqIFRoaXMgcHJvYmxlbSBpcyBub3JtYWxseSBzb2x2ZWQgdXNpbmcgdGltZW91dHMgYW5kIGRlbGF5cy4gbWVudS1haW0gdHJpZXMgdG9cclxuICogc29sdmUgdGhpcyBieSBkZXRlY3RpbmcgdGhlIGRpcmVjdGlvbiBvZiB0aGUgdXNlcidzIG1vdXNlIG1vdmVtZW50LiBUaGlzIGNhblxyXG4gKiBtYWtlIGZvciBxdWlja2VyIHRyYW5zaXRpb25zIHdoZW4gbmF2aWdhdGluZyB1cCBhbmQgZG93biB0aGUgbWVudS4gVGhlXHJcbiAqIGV4cGVyaWVuY2UgaXMgaG9wZWZ1bGx5IHNpbWlsYXIgdG8gYW1hem9uLmNvbS8ncyBcIlNob3AgYnkgRGVwYXJ0bWVudFwiXHJcbiAqIGRyb3Bkb3duLlxyXG4gKlxyXG4gKiBVc2UgbGlrZSBzbzpcclxuICpcclxuICogICAgICAkKFwiI21lbnVcIikubWVudUFpbSh7XHJcbiAqICAgICAgICAgIGFjdGl2YXRlOiAkLm5vb3AsICAvLyBmaXJlZCBvbiByb3cgYWN0aXZhdGlvblxyXG4gKiAgICAgICAgICBkZWFjdGl2YXRlOiAkLm5vb3AgIC8vIGZpcmVkIG9uIHJvdyBkZWFjdGl2YXRpb25cclxuICogICAgICB9KTtcclxuICpcclxuICogIC4uLnRvIHJlY2VpdmUgZXZlbnRzIHdoZW4gYSBtZW51J3Mgcm93IGhhcyBiZWVuIHB1cnBvc2VmdWxseSAoZGUpYWN0aXZhdGVkLlxyXG4gKlxyXG4gKiBUaGUgZm9sbG93aW5nIG9wdGlvbnMgY2FuIGJlIHBhc3NlZCB0byBtZW51QWltLiBBbGwgZnVuY3Rpb25zIGV4ZWN1dGUgd2l0aFxyXG4gKiB0aGUgcmVsZXZhbnQgcm93J3MgSFRNTCBlbGVtZW50IGFzIHRoZSBleGVjdXRpb24gY29udGV4dCAoJ3RoaXMnKTpcclxuICpcclxuICogICAgICAubWVudUFpbSh7XHJcbiAqICAgICAgICAgIC8vIEZ1bmN0aW9uIHRvIGNhbGwgd2hlbiBhIHJvdyBpcyBwdXJwb3NlZnVsbHkgYWN0aXZhdGVkLiBVc2UgdGhpc1xyXG4gKiAgICAgICAgICAvLyB0byBzaG93IGEgc3VibWVudSdzIGNvbnRlbnQgZm9yIHRoZSBhY3RpdmF0ZWQgcm93LlxyXG4gKiAgICAgICAgICBhY3RpdmF0ZTogZnVuY3Rpb24oKSB7fSxcclxuICpcclxuICogICAgICAgICAgLy8gRnVuY3Rpb24gdG8gY2FsbCB3aGVuIGEgcm93IGlzIGRlYWN0aXZhdGVkLlxyXG4gKiAgICAgICAgICBkZWFjdGl2YXRlOiBmdW5jdGlvbigpIHt9LFxyXG4gKlxyXG4gKiAgICAgICAgICAvLyBGdW5jdGlvbiB0byBjYWxsIHdoZW4gbW91c2UgZW50ZXJzIGEgbWVudSByb3cuIEVudGVyaW5nIGEgcm93XHJcbiAqICAgICAgICAgIC8vIGRvZXMgbm90IG1lYW4gdGhlIHJvdyBoYXMgYmVlbiBhY3RpdmF0ZWQsIGFzIHRoZSB1c2VyIG1heSBiZVxyXG4gKiAgICAgICAgICAvLyBtb3VzaW5nIG92ZXIgdG8gYSBzdWJtZW51LlxyXG4gKiAgICAgICAgICBlbnRlcjogZnVuY3Rpb24oKSB7fSxcclxuICpcclxuICogICAgICAgICAgLy8gRnVuY3Rpb24gdG8gY2FsbCB3aGVuIG1vdXNlIGV4aXRzIGEgbWVudSByb3cuXHJcbiAqICAgICAgICAgIGV4aXQ6IGZ1bmN0aW9uKCkge30sXHJcbiAqXHJcbiAqICAgICAgICAgIC8vIFNlbGVjdG9yIGZvciBpZGVudGlmeWluZyB3aGljaCBlbGVtZW50cyBpbiB0aGUgbWVudSBhcmUgcm93c1xyXG4gKiAgICAgICAgICAvLyB0aGF0IGNhbiB0cmlnZ2VyIHRoZSBhYm92ZSBldmVudHMuIERlZmF1bHRzIHRvIFwiPiBsaVwiLlxyXG4gKiAgICAgICAgICByb3dTZWxlY3RvcjogXCI+IGxpXCIsXHJcbiAqXHJcbiAqICAgICAgICAgIC8vIFlvdSBtYXkgaGF2ZSBzb21lIG1lbnUgcm93cyB0aGF0IGFyZW4ndCBzdWJtZW51cyBhbmQgdGhlcmVmb3JlXHJcbiAqICAgICAgICAgIC8vIHNob3VsZG4ndCBldmVyIG5lZWQgdG8gXCJhY3RpdmF0ZS5cIiBJZiBzbywgZmlsdGVyIHN1Ym1lbnUgcm93cyB3L1xyXG4gKiAgICAgICAgICAvLyB0aGlzIHNlbGVjdG9yLiBEZWZhdWx0cyB0byBcIipcIiAoYWxsIGVsZW1lbnRzKS5cclxuICogICAgICAgICAgc3VibWVudVNlbGVjdG9yOiBcIipcIixcclxuICpcclxuICogICAgICAgICAgLy8gRGlyZWN0aW9uIHRoZSBzdWJtZW51IG9wZW5zIHJlbGF0aXZlIHRvIHRoZSBtYWluIG1lbnUuIENhbiBiZVxyXG4gKiAgICAgICAgICAvLyBsZWZ0LCByaWdodCwgYWJvdmUsIG9yIGJlbG93LiBEZWZhdWx0cyB0byBcInJpZ2h0XCIuXHJcbiAqICAgICAgICAgIHN1Ym1lbnVEaXJlY3Rpb246IFwicmlnaHRcIlxyXG4gKiAgICAgIH0pO1xyXG4gKlxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20va2FtZW5zL2pRdWVyeS1tZW51LWFpbVxyXG4qL1xyXG4oZnVuY3Rpb24oJCkge1xyXG5cclxuICAgICQuZm4ubWVudUFpbSA9IGZ1bmN0aW9uKG9wdHMpIHtcclxuICAgICAgICAvLyBJbml0aWFsaXplIG1lbnUtYWltIGZvciBhbGwgZWxlbWVudHMgaW4galF1ZXJ5IGNvbGxlY3Rpb25cclxuICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGluaXQuY2FsbCh0aGlzLCBvcHRzKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXQob3B0cykge1xyXG4gICAgICAgIHZhciAkbWVudSA9ICQodGhpcyksXHJcbiAgICAgICAgICAgIGFjdGl2ZVJvdyA9IG51bGwsXHJcbiAgICAgICAgICAgIG1vdXNlTG9jcyA9IFtdLFxyXG4gICAgICAgICAgICBsYXN0RGVsYXlMb2MgPSBudWxsLFxyXG4gICAgICAgICAgICB0aW1lb3V0SWQgPSBudWxsLFxyXG4gICAgICAgICAgICBvcHRpb25zID0gJC5leHRlbmQoe1xyXG4gICAgICAgICAgICAgICAgcm93U2VsZWN0b3I6IFwiPiBsaVwiLFxyXG4gICAgICAgICAgICAgICAgc3VibWVudVNlbGVjdG9yOiBcIipcIixcclxuICAgICAgICAgICAgICAgIHN1Ym1lbnVEaXJlY3Rpb246IFwicmlnaHRcIixcclxuICAgICAgICAgICAgICAgIHRvbGVyYW5jZTogNzUsICAvLyBiaWdnZXIgPSBtb3JlIGZvcmdpdmV5IHdoZW4gZW50ZXJpbmcgc3VibWVudVxyXG4gICAgICAgICAgICAgICAgZW50ZXI6ICQubm9vcCxcclxuICAgICAgICAgICAgICAgIGV4aXQ6ICQubm9vcCxcclxuICAgICAgICAgICAgICAgIGFjdGl2YXRlOiAkLm5vb3AsXHJcbiAgICAgICAgICAgICAgICBkZWFjdGl2YXRlOiAkLm5vb3AsXHJcbiAgICAgICAgICAgICAgICBleGl0TWVudTogJC5ub29wXHJcbiAgICAgICAgICAgIH0sIG9wdHMpO1xyXG5cclxuICAgICAgICB2YXIgTU9VU0VfTE9DU19UUkFDS0VEID0gMywgIC8vIG51bWJlciBvZiBwYXN0IG1vdXNlIGxvY2F0aW9ucyB0byB0cmFja1xyXG4gICAgICAgICAgICBERUxBWSA9IDMwMDsgIC8vIG1zIGRlbGF5IHdoZW4gdXNlciBhcHBlYXJzIHRvIGJlIGVudGVyaW5nIHN1Ym1lbnVcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogS2VlcCB0cmFjayBvZiB0aGUgbGFzdCBmZXcgbG9jYXRpb25zIG9mIHRoZSBtb3VzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB2YXIgbW91c2Vtb3ZlRG9jdW1lbnQgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICBtb3VzZUxvY3MucHVzaCh7eDogZS5wYWdlWCwgeTogZS5wYWdlWX0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtb3VzZUxvY3MubGVuZ3RoID4gTU9VU0VfTE9DU19UUkFDS0VEKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VMb2NzLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENhbmNlbCBwb3NzaWJsZSByb3cgYWN0aXZhdGlvbnMgd2hlbiBsZWF2aW5nIHRoZSBtZW51IGVudGlyZWx5XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdmFyIG1vdXNlbGVhdmVNZW51ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGltZW91dElkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gSWYgZXhpdE1lbnUgaXMgc3VwcGxpZWQgYW5kIHJldHVybnMgdHJ1ZSwgZGVhY3RpdmF0ZSB0aGVcclxuICAgICAgICAgICAgICAgIC8vIGN1cnJlbnRseSBhY3RpdmUgcm93IG9uIG1lbnUgZXhpdC5cclxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmV4aXRNZW51KHRoaXMpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFjdGl2ZVJvdykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmRlYWN0aXZhdGUoYWN0aXZlUm93KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZVJvdyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRyaWdnZXIgYSBwb3NzaWJsZSByb3cgYWN0aXZhdGlvbiB3aGVuZXZlciBlbnRlcmluZyBhIG5ldyByb3cuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdmFyIG1vdXNlZW50ZXJSb3cgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aW1lb3V0SWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBDYW5jZWwgYW55IHByZXZpb3VzIGFjdGl2YXRpb24gZGVsYXlzXHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5lbnRlcih0aGlzKTtcclxuICAgICAgICAgICAgICAgIHBvc3NpYmx5QWN0aXZhdGUodGhpcyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG1vdXNlbGVhdmVSb3cgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMuZXhpdCh0aGlzKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBJbW1lZGlhdGVseSBhY3RpdmF0ZSBhIHJvdyBpZiB0aGUgdXNlciBjbGlja3Mgb24gaXQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdmFyIGNsaWNrUm93ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBhY3RpdmF0ZSh0aGlzKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWN0aXZhdGUgYSBtZW51IHJvdy5cclxuICAgICAgICAgKi9cclxuICAgICAgICB2YXIgYWN0aXZhdGUgPSBmdW5jdGlvbihyb3cpIHtcclxuICAgICAgICAgICAgICAgIGlmIChyb3cgPT0gYWN0aXZlUm93KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChhY3RpdmVSb3cpIHtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmRlYWN0aXZhdGUoYWN0aXZlUm93KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLmFjdGl2YXRlKHJvdyk7XHJcbiAgICAgICAgICAgICAgICBhY3RpdmVSb3cgPSByb3c7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFBvc3NpYmx5IGFjdGl2YXRlIGEgbWVudSByb3cuIElmIG1vdXNlIG1vdmVtZW50IGluZGljYXRlcyB0aGF0IHdlXHJcbiAgICAgICAgICogc2hvdWxkbid0IGFjdGl2YXRlIHlldCBiZWNhdXNlIHVzZXIgbWF5IGJlIHRyeWluZyB0byBlbnRlclxyXG4gICAgICAgICAqIGEgc3VibWVudSdzIGNvbnRlbnQsIHRoZW4gZGVsYXkgYW5kIGNoZWNrIGFnYWluIGxhdGVyLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHZhciBwb3NzaWJseUFjdGl2YXRlID0gZnVuY3Rpb24ocm93KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGVsYXkgPSBhY3RpdmF0aW9uRGVsYXkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZGVsYXkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NzaWJseUFjdGl2YXRlKHJvdyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgZGVsYXkpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmF0ZShyb3cpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm4gdGhlIGFtb3VudCBvZiB0aW1lIHRoYXQgc2hvdWxkIGJlIHVzZWQgYXMgYSBkZWxheSBiZWZvcmUgdGhlXHJcbiAgICAgICAgICogY3VycmVudGx5IGhvdmVyZWQgcm93IGlzIGFjdGl2YXRlZC5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIFJldHVybnMgMCBpZiB0aGUgYWN0aXZhdGlvbiBzaG91bGQgaGFwcGVuIGltbWVkaWF0ZWx5LiBPdGhlcndpc2UsXHJcbiAgICAgICAgICogcmV0dXJucyB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0aGF0IHNob3VsZCBiZSBkZWxheWVkIGJlZm9yZVxyXG4gICAgICAgICAqIGNoZWNraW5nIGFnYWluIHRvIHNlZSBpZiB0aGUgcm93IHNob3VsZCBiZSBhY3RpdmF0ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdmFyIGFjdGl2YXRpb25EZWxheSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFhY3RpdmVSb3cgfHwgISQoYWN0aXZlUm93KS5pcyhvcHRpb25zLnN1Ym1lbnVTZWxlY3RvcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBubyBvdGhlciBzdWJtZW51IHJvdyBhbHJlYWR5IGFjdGl2ZSwgdGhlblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGdvIGFoZWFkIGFuZCBhY3RpdmF0ZSBpbW1lZGlhdGVseS5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gJG1lbnUub2Zmc2V0KCksXHJcbiAgICAgICAgICAgICAgICAgICAgdXBwZXJMZWZ0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBvZmZzZXQubGVmdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgeTogb2Zmc2V0LnRvcCAtIG9wdGlvbnMudG9sZXJhbmNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB1cHBlclJpZ2h0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBvZmZzZXQubGVmdCArICRtZW51Lm91dGVyV2lkdGgoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgeTogdXBwZXJMZWZ0LnlcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGxvd2VyTGVmdCA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeDogb2Zmc2V0LmxlZnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IG9mZnNldC50b3AgKyAkbWVudS5vdXRlckhlaWdodCgpICsgb3B0aW9ucy50b2xlcmFuY2VcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGxvd2VyUmlnaHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IG9mZnNldC5sZWZ0ICsgJG1lbnUub3V0ZXJXaWR0aCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiBsb3dlckxlZnQueVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgbG9jID0gbW91c2VMb2NzW21vdXNlTG9jcy5sZW5ndGggLSAxXSxcclxuICAgICAgICAgICAgICAgICAgICBwcmV2TG9jID0gbW91c2VMb2NzWzBdO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghbG9jKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFwcmV2TG9jKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJldkxvYyA9IGxvYztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocHJldkxvYy54IDwgb2Zmc2V0LmxlZnQgfHwgcHJldkxvYy54ID4gbG93ZXJSaWdodC54IHx8XHJcbiAgICAgICAgICAgICAgICAgICAgcHJldkxvYy55IDwgb2Zmc2V0LnRvcCB8fCBwcmV2TG9jLnkgPiBsb3dlclJpZ2h0LnkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgcHJldmlvdXMgbW91c2UgbG9jYXRpb24gd2FzIG91dHNpZGUgb2YgdGhlIGVudGlyZVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIG1lbnUncyBib3VuZHMsIGltbWVkaWF0ZWx5IGFjdGl2YXRlLlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChsYXN0RGVsYXlMb2MgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jLnggPT0gbGFzdERlbGF5TG9jLnggJiYgbG9jLnkgPT0gbGFzdERlbGF5TG9jLnkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgbW91c2UgaGFzbid0IG1vdmVkIHNpbmNlIHRoZSBsYXN0IHRpbWUgd2UgY2hlY2tlZFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGZvciBhY3RpdmF0aW9uIHN0YXR1cywgaW1tZWRpYXRlbHkgYWN0aXZhdGUuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRGV0ZWN0IGlmIHRoZSB1c2VyIGlzIG1vdmluZyB0b3dhcmRzIHRoZSBjdXJyZW50bHkgYWN0aXZhdGVkXHJcbiAgICAgICAgICAgICAgICAvLyBzdWJtZW51LlxyXG4gICAgICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBtb3VzZSBpcyBoZWFkaW5nIHJlbGF0aXZlbHkgY2xlYXJseSB0b3dhcmRzXHJcbiAgICAgICAgICAgICAgICAvLyB0aGUgc3VibWVudSdzIGNvbnRlbnQsIHdlIHNob3VsZCB3YWl0IGFuZCBnaXZlIHRoZSB1c2VyIG1vcmVcclxuICAgICAgICAgICAgICAgIC8vIHRpbWUgYmVmb3JlIGFjdGl2YXRpbmcgYSBuZXcgcm93LiBJZiB0aGUgbW91c2UgaXMgaGVhZGluZ1xyXG4gICAgICAgICAgICAgICAgLy8gZWxzZXdoZXJlLCB3ZSBjYW4gaW1tZWRpYXRlbHkgYWN0aXZhdGUgYSBuZXcgcm93LlxyXG4gICAgICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgICAgIC8vIFdlIGRldGVjdCB0aGlzIGJ5IGNhbGN1bGF0aW5nIHRoZSBzbG9wZSBmb3JtZWQgYmV0d2VlbiB0aGVcclxuICAgICAgICAgICAgICAgIC8vIGN1cnJlbnQgbW91c2UgbG9jYXRpb24gYW5kIHRoZSB1cHBlci9sb3dlciByaWdodCBwb2ludHMgb2ZcclxuICAgICAgICAgICAgICAgIC8vIHRoZSBtZW51LiBXZSBkbyB0aGUgc2FtZSBmb3IgdGhlIHByZXZpb3VzIG1vdXNlIGxvY2F0aW9uLlxyXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIGN1cnJlbnQgbW91c2UgbG9jYXRpb24ncyBzbG9wZXMgYXJlXHJcbiAgICAgICAgICAgICAgICAvLyBpbmNyZWFzaW5nL2RlY3JlYXNpbmcgYXBwcm9wcmlhdGVseSBjb21wYXJlZCB0byB0aGVcclxuICAgICAgICAgICAgICAgIC8vIHByZXZpb3VzJ3MsIHdlIGtub3cgdGhlIHVzZXIgaXMgbW92aW5nIHRvd2FyZCB0aGUgc3VibWVudS5cclxuICAgICAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgICAgICAvLyBOb3RlIHRoYXQgc2luY2UgdGhlIHktYXhpcyBpbmNyZWFzZXMgYXMgdGhlIGN1cnNvciBtb3Zlc1xyXG4gICAgICAgICAgICAgICAgLy8gZG93biB0aGUgc2NyZWVuLCB3ZSBhcmUgbG9va2luZyBmb3IgdGhlIHNsb3BlIGJldHdlZW4gdGhlXHJcbiAgICAgICAgICAgICAgICAvLyBjdXJzb3IgYW5kIHRoZSB1cHBlciByaWdodCBjb3JuZXIgdG8gZGVjcmVhc2Ugb3ZlciB0aW1lLCBub3RcclxuICAgICAgICAgICAgICAgIC8vIGluY3JlYXNlIChzb21ld2hhdCBjb3VudGVyaW50dWl0aXZlbHkpLlxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc2xvcGUoYSwgYikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoYi55IC0gYS55KSAvIChiLnggLSBhLngpO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgZGVjcmVhc2luZ0Nvcm5lciA9IHVwcGVyUmlnaHQsXHJcbiAgICAgICAgICAgICAgICAgICAgaW5jcmVhc2luZ0Nvcm5lciA9IGxvd2VyUmlnaHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gT3VyIGV4cGVjdGF0aW9ucyBmb3IgZGVjcmVhc2luZyBvciBpbmNyZWFzaW5nIHNsb3BlIHZhbHVlc1xyXG4gICAgICAgICAgICAgICAgLy8gZGVwZW5kcyBvbiB3aGljaCBkaXJlY3Rpb24gdGhlIHN1Ym1lbnUgb3BlbnMgcmVsYXRpdmUgdG8gdGhlXHJcbiAgICAgICAgICAgICAgICAvLyBtYWluIG1lbnUuIEJ5IGRlZmF1bHQsIGlmIHRoZSBtZW51IG9wZW5zIG9uIHRoZSByaWdodCwgd2VcclxuICAgICAgICAgICAgICAgIC8vIGV4cGVjdCB0aGUgc2xvcGUgYmV0d2VlbiB0aGUgY3Vyc29yIGFuZCB0aGUgdXBwZXIgcmlnaHRcclxuICAgICAgICAgICAgICAgIC8vIGNvcm5lciB0byBkZWNyZWFzZSBvdmVyIHRpbWUsIGFzIGV4cGxhaW5lZCBhYm92ZS4gSWYgdGhlXHJcbiAgICAgICAgICAgICAgICAvLyBzdWJtZW51IG9wZW5zIGluIGEgZGlmZmVyZW50IGRpcmVjdGlvbiwgd2UgY2hhbmdlIG91ciBzbG9wZVxyXG4gICAgICAgICAgICAgICAgLy8gZXhwZWN0YXRpb25zLlxyXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuc3VibWVudURpcmVjdGlvbiA9PSBcImxlZnRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlY3JlYXNpbmdDb3JuZXIgPSBsb3dlckxlZnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5jcmVhc2luZ0Nvcm5lciA9IHVwcGVyTGVmdDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5zdWJtZW51RGlyZWN0aW9uID09IFwiYmVsb3dcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlY3JlYXNpbmdDb3JuZXIgPSBsb3dlclJpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgIGluY3JlYXNpbmdDb3JuZXIgPSBsb3dlckxlZnQ7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuc3VibWVudURpcmVjdGlvbiA9PSBcImFib3ZlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWNyZWFzaW5nQ29ybmVyID0gdXBwZXJMZWZ0O1xyXG4gICAgICAgICAgICAgICAgICAgIGluY3JlYXNpbmdDb3JuZXIgPSB1cHBlclJpZ2h0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHZhciBkZWNyZWFzaW5nU2xvcGUgPSBzbG9wZShsb2MsIGRlY3JlYXNpbmdDb3JuZXIpLFxyXG4gICAgICAgICAgICAgICAgICAgIGluY3JlYXNpbmdTbG9wZSA9IHNsb3BlKGxvYywgaW5jcmVhc2luZ0Nvcm5lciksXHJcbiAgICAgICAgICAgICAgICAgICAgcHJldkRlY3JlYXNpbmdTbG9wZSA9IHNsb3BlKHByZXZMb2MsIGRlY3JlYXNpbmdDb3JuZXIpLFxyXG4gICAgICAgICAgICAgICAgICAgIHByZXZJbmNyZWFzaW5nU2xvcGUgPSBzbG9wZShwcmV2TG9jLCBpbmNyZWFzaW5nQ29ybmVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZGVjcmVhc2luZ1Nsb3BlIDwgcHJldkRlY3JlYXNpbmdTbG9wZSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNyZWFzaW5nU2xvcGUgPiBwcmV2SW5jcmVhc2luZ1Nsb3BlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTW91c2UgaXMgbW92aW5nIGZyb20gcHJldmlvdXMgbG9jYXRpb24gdG93YXJkcyB0aGVcclxuICAgICAgICAgICAgICAgICAgICAvLyBjdXJyZW50bHkgYWN0aXZhdGVkIHN1Ym1lbnUuIERlbGF5IGJlZm9yZSBhY3RpdmF0aW5nIGFcclxuICAgICAgICAgICAgICAgICAgICAvLyBuZXcgbWVudSByb3csIGJlY2F1c2UgdXNlciBtYXkgYmUgbW92aW5nIGludG8gc3VibWVudS5cclxuICAgICAgICAgICAgICAgICAgICBsYXN0RGVsYXlMb2MgPSBsb2M7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIERFTEFZO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGxhc3REZWxheUxvYyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSG9vayB1cCBpbml0aWFsIG1lbnUgZXZlbnRzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgJG1lbnVcclxuICAgICAgICAgICAgLm1vdXNlbGVhdmUobW91c2VsZWF2ZU1lbnUpXHJcbiAgICAgICAgICAgIC5maW5kKG9wdGlvbnMucm93U2VsZWN0b3IpXHJcbiAgICAgICAgICAgICAgICAubW91c2VlbnRlcihtb3VzZWVudGVyUm93KVxyXG4gICAgICAgICAgICAgICAgLm1vdXNlbGVhdmUobW91c2VsZWF2ZVJvdylcclxuICAgICAgICAgICAgICAgIC5jbGljayhjbGlja1Jvdyk7XHJcblxyXG4gICAgICAgICQoZG9jdW1lbnQpLm1vdXNlbW92ZShtb3VzZW1vdmVEb2N1bWVudCk7XHJcblxyXG4gICAgfTtcclxufSkoalF1ZXJ5KTtcclxuXHJcbiIsIi8qKlxyXG4gKiBjaXJjbGVzIC0gdjAuMC42IC0gMjAxNS0xMS0yN1xyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUgbHVnb2xhYnNcclxuICogTGljZW5zZWQgXHJcbiAqL1xyXG4hZnVuY3Rpb24oYSxiKXtcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1iKCk6XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXSxiKTphLkNpcmNsZXM9YigpfSh0aGlzLGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7dmFyIGE9d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93Lm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZXx8ZnVuY3Rpb24oYSl7c2V0VGltZW91dChhLDFlMy82MCl9LGI9ZnVuY3Rpb24oYSl7dmFyIGI9YS5pZDtpZih0aGlzLl9lbD1kb2N1bWVudC5nZXRFbGVtZW50QnlJZChiKSxudWxsIT09dGhpcy5fZWwpe3RoaXMuX3JhZGl1cz1hLnJhZGl1c3x8MTAsdGhpcy5fZHVyYXRpb249dm9pZCAwPT09YS5kdXJhdGlvbj81MDA6YS5kdXJhdGlvbix0aGlzLl92YWx1ZT0wLHRoaXMuX21heFZhbHVlPWEubWF4VmFsdWV8fDEwMCx0aGlzLl90ZXh0PXZvaWQgMD09PWEudGV4dD9mdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5odG1saWZ5TnVtYmVyKGEpfTphLnRleHQsdGhpcy5fc3Ryb2tlV2lkdGg9YS53aWR0aHx8MTAsdGhpcy5fY29sb3JzPWEuY29sb3JzfHxbXCIjRUVFXCIsXCIjRjAwXCJdLHRoaXMuX3N2Zz1udWxsLHRoaXMuX21vdmluZ1BhdGg9bnVsbCx0aGlzLl93cmFwQ29udGFpbmVyPW51bGwsdGhpcy5fdGV4dENvbnRhaW5lcj1udWxsLHRoaXMuX3dycENsYXNzPWEud3JwQ2xhc3N8fFwiY2lyY2xlcy13cnBcIix0aGlzLl90ZXh0Q2xhc3M9YS50ZXh0Q2xhc3N8fFwiY2lyY2xlcy10ZXh0XCIsdGhpcy5fdmFsQ2xhc3M9YS52YWx1ZVN0cm9rZUNsYXNzfHxcImNpcmNsZXMtdmFsdWVTdHJva2VcIix0aGlzLl9tYXhWYWxDbGFzcz1hLm1heFZhbHVlU3Ryb2tlQ2xhc3N8fFwiY2lyY2xlcy1tYXhWYWx1ZVN0cm9rZVwiLHRoaXMuX3N0eWxlV3JhcHBlcj1hLnN0eWxlV3JhcHBlcj09PSExPyExOiEwLHRoaXMuX3N0eWxlVGV4dD1hLnN0eWxlVGV4dD09PSExPyExOiEwO3ZhciBjPU1hdGguUEkvMTgwKjI3MDt0aGlzLl9zdGFydD0tTWF0aC5QSS8xODAqOTAsdGhpcy5fc3RhcnRQcmVjaXNlPXRoaXMuX3ByZWNpc2UodGhpcy5fc3RhcnQpLHRoaXMuX2NpcmM9Yy10aGlzLl9zdGFydCx0aGlzLl9nZW5lcmF0ZSgpLnVwZGF0ZShhLnZhbHVlfHwwKX19O3JldHVybiBiLnByb3RvdHlwZT17VkVSU0lPTjpcIjAuMC42XCIsX2dlbmVyYXRlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3N2Z1NpemU9Mip0aGlzLl9yYWRpdXMsdGhpcy5fcmFkaXVzQWRqdXN0ZWQ9dGhpcy5fcmFkaXVzLXRoaXMuX3N0cm9rZVdpZHRoLzIsdGhpcy5fZ2VuZXJhdGVTdmcoKS5fZ2VuZXJhdGVUZXh0KCkuX2dlbmVyYXRlV3JhcHBlcigpLHRoaXMuX2VsLmlubmVySFRNTD1cIlwiLHRoaXMuX2VsLmFwcGVuZENoaWxkKHRoaXMuX3dyYXBDb250YWluZXIpLHRoaXN9LF9zZXRQZXJjZW50YWdlOmZ1bmN0aW9uKGEpe3RoaXMuX21vdmluZ1BhdGguc2V0QXR0cmlidXRlKFwiZFwiLHRoaXMuX2NhbGN1bGF0ZVBhdGgoYSwhMCkpLHRoaXMuX3RleHRDb250YWluZXIuaW5uZXJIVE1MPXRoaXMuX2dldFRleHQodGhpcy5nZXRWYWx1ZUZyb21QZXJjZW50KGEpKX0sX2dlbmVyYXRlV3JhcHBlcjpmdW5jdGlvbigpe3JldHVybiB0aGlzLl93cmFwQ29udGFpbmVyPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksdGhpcy5fd3JhcENvbnRhaW5lci5jbGFzc05hbWU9dGhpcy5fd3JwQ2xhc3MsdGhpcy5fc3R5bGVXcmFwcGVyJiYodGhpcy5fd3JhcENvbnRhaW5lci5zdHlsZS5wb3NpdGlvbj1cInJlbGF0aXZlXCIsdGhpcy5fd3JhcENvbnRhaW5lci5zdHlsZS5kaXNwbGF5PVwiaW5saW5lLWJsb2NrXCIpLHRoaXMuX3dyYXBDb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fc3ZnKSx0aGlzLl93cmFwQ29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuX3RleHRDb250YWluZXIpLHRoaXN9LF9nZW5lcmF0ZVRleHQ6ZnVuY3Rpb24oKXtpZih0aGlzLl90ZXh0Q29udGFpbmVyPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksdGhpcy5fdGV4dENvbnRhaW5lci5jbGFzc05hbWU9dGhpcy5fdGV4dENsYXNzLHRoaXMuX3N0eWxlVGV4dCl7dmFyIGE9e3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6MCxsZWZ0OjAsdGV4dEFsaWduOlwiY2VudGVyXCIsd2lkdGg6XCIxMDAlXCIsZm9udFNpemU6LjcqdGhpcy5fcmFkaXVzK1wicHhcIixoZWlnaHQ6dGhpcy5fc3ZnU2l6ZStcInB4XCIsbGluZUhlaWdodDp0aGlzLl9zdmdTaXplK1wicHhcIn07Zm9yKHZhciBiIGluIGEpdGhpcy5fdGV4dENvbnRhaW5lci5zdHlsZVtiXT1hW2JdfXJldHVybiB0aGlzLl90ZXh0Q29udGFpbmVyLmlubmVySFRNTD10aGlzLl9nZXRUZXh0KDApLHRoaXN9LF9nZXRUZXh0OmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLl90ZXh0Pyh2b2lkIDA9PT1hJiYoYT10aGlzLl92YWx1ZSksYT1wYXJzZUZsb2F0KGEudG9GaXhlZCgyKSksXCJmdW5jdGlvblwiPT10eXBlb2YgdGhpcy5fdGV4dD90aGlzLl90ZXh0LmNhbGwodGhpcyxhKTp0aGlzLl90ZXh0KTpcIlwifSxfZ2VuZXJhdGVTdmc6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fc3ZnPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsXCJzdmdcIiksdGhpcy5fc3ZnLnNldEF0dHJpYnV0ZShcInhtbG5zXCIsXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiKSx0aGlzLl9zdmcuc2V0QXR0cmlidXRlKFwid2lkdGhcIix0aGlzLl9zdmdTaXplKSx0aGlzLl9zdmcuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsdGhpcy5fc3ZnU2l6ZSksdGhpcy5fZ2VuZXJhdGVQYXRoKDEwMCwhMSx0aGlzLl9jb2xvcnNbMF0sdGhpcy5fbWF4VmFsQ2xhc3MpLl9nZW5lcmF0ZVBhdGgoMSwhMCx0aGlzLl9jb2xvcnNbMV0sdGhpcy5fdmFsQ2xhc3MpLHRoaXMuX21vdmluZ1BhdGg9dGhpcy5fc3ZnLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwicGF0aFwiKVsxXSx0aGlzfSxfZ2VuZXJhdGVQYXRoOmZ1bmN0aW9uKGEsYixjLGQpe3ZhciBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsXCJwYXRoXCIpO3JldHVybiBlLnNldEF0dHJpYnV0ZShcImZpbGxcIixcInRyYW5zcGFyZW50XCIpLGUuc2V0QXR0cmlidXRlKFwic3Ryb2tlXCIsYyksZS5zZXRBdHRyaWJ1dGUoXCJzdHJva2Utd2lkdGhcIix0aGlzLl9zdHJva2VXaWR0aCksZS5zZXRBdHRyaWJ1dGUoXCJkXCIsdGhpcy5fY2FsY3VsYXRlUGF0aChhLGIpKSxlLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsZCksdGhpcy5fc3ZnLmFwcGVuZENoaWxkKGUpLHRoaXN9LF9jYWxjdWxhdGVQYXRoOmZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcy5fc3RhcnQrYS8xMDAqdGhpcy5fY2lyYyxkPXRoaXMuX3ByZWNpc2UoYyk7cmV0dXJuIHRoaXMuX2FyYyhkLGIpfSxfYXJjOmZ1bmN0aW9uKGEsYil7dmFyIGM9YS0uMDAxLGQ9YS10aGlzLl9zdGFydFByZWNpc2U8TWF0aC5QST8wOjE7cmV0dXJuW1wiTVwiLHRoaXMuX3JhZGl1cyt0aGlzLl9yYWRpdXNBZGp1c3RlZCpNYXRoLmNvcyh0aGlzLl9zdGFydFByZWNpc2UpLHRoaXMuX3JhZGl1cyt0aGlzLl9yYWRpdXNBZGp1c3RlZCpNYXRoLnNpbih0aGlzLl9zdGFydFByZWNpc2UpLFwiQVwiLHRoaXMuX3JhZGl1c0FkanVzdGVkLHRoaXMuX3JhZGl1c0FkanVzdGVkLDAsZCwxLHRoaXMuX3JhZGl1cyt0aGlzLl9yYWRpdXNBZGp1c3RlZCpNYXRoLmNvcyhjKSx0aGlzLl9yYWRpdXMrdGhpcy5fcmFkaXVzQWRqdXN0ZWQqTWF0aC5zaW4oYyksYj9cIlwiOlwiWlwiXS5qb2luKFwiIFwiKX0sX3ByZWNpc2U6ZnVuY3Rpb24oYSl7cmV0dXJuIE1hdGgucm91bmQoMWUzKmEpLzFlM30saHRtbGlmeU51bWJlcjpmdW5jdGlvbihhLGIsYyl7Yj1ifHxcImNpcmNsZXMtaW50ZWdlclwiLGM9Y3x8XCJjaXJjbGVzLWRlY2ltYWxzXCI7dmFyIGQ9KGErXCJcIikuc3BsaXQoXCIuXCIpLGU9JzxzcGFuIGNsYXNzPVwiJytiKydcIj4nK2RbMF0rXCI8L3NwYW4+XCI7cmV0dXJuIGQubGVuZ3RoPjEmJihlKz0nLjxzcGFuIGNsYXNzPVwiJytjKydcIj4nK2RbMV0uc3Vic3RyaW5nKDAsMikrXCI8L3NwYW4+XCIpLGV9LHVwZGF0ZVJhZGl1czpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5fcmFkaXVzPWEsdGhpcy5fZ2VuZXJhdGUoKS51cGRhdGUoITApfSx1cGRhdGVXaWR0aDpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5fc3Ryb2tlV2lkdGg9YSx0aGlzLl9nZW5lcmF0ZSgpLnVwZGF0ZSghMCl9LHVwZGF0ZUNvbG9yczpmdW5jdGlvbihhKXt0aGlzLl9jb2xvcnM9YTt2YXIgYj10aGlzLl9zdmcuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJwYXRoXCIpO3JldHVybiBiWzBdLnNldEF0dHJpYnV0ZShcInN0cm9rZVwiLGFbMF0pLGJbMV0uc2V0QXR0cmlidXRlKFwic3Ryb2tlXCIsYVsxXSksdGhpc30sZ2V0UGVyY2VudDpmdW5jdGlvbigpe3JldHVybiAxMDAqdGhpcy5fdmFsdWUvdGhpcy5fbWF4VmFsdWV9LGdldFZhbHVlRnJvbVBlcmNlbnQ6ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuX21heFZhbHVlKmEvMTAwfSxnZXRWYWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl92YWx1ZX0sZ2V0TWF4VmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fbWF4VmFsdWV9LHVwZGF0ZTpmdW5jdGlvbihiLGMpe2lmKGI9PT0hMClyZXR1cm4gdGhpcy5fc2V0UGVyY2VudGFnZSh0aGlzLmdldFBlcmNlbnQoKSksdGhpcztpZih0aGlzLl92YWx1ZT09Ynx8aXNOYU4oYikpcmV0dXJuIHRoaXM7dm9pZCAwPT09YyYmKGM9dGhpcy5fZHVyYXRpb24pO3ZhciBkLGUsZixnLGg9dGhpcyxpPWguZ2V0UGVyY2VudCgpLGo9MTtyZXR1cm4gdGhpcy5fdmFsdWU9TWF0aC5taW4odGhpcy5fbWF4VmFsdWUsTWF0aC5tYXgoMCxiKSksYz8oZD1oLmdldFBlcmNlbnQoKSxlPWQ+aSxqKz1kJTEsZj1NYXRoLmZsb29yKE1hdGguYWJzKGQtaSkvaiksZz1jL2YsZnVuY3Rpb24gayhiKXtpZihlP2krPWo6aS09aixlJiZpPj1kfHwhZSYmZD49aSlyZXR1cm4gdm9pZCBhKGZ1bmN0aW9uKCl7aC5fc2V0UGVyY2VudGFnZShkKX0pO2EoZnVuY3Rpb24oKXtoLl9zZXRQZXJjZW50YWdlKGkpfSk7dmFyIGM9RGF0ZS5ub3coKSxmPWMtYjtmPj1nP2soYyk6c2V0VGltZW91dChmdW5jdGlvbigpe2soRGF0ZS5ub3coKSl9LGctZil9KERhdGUubm93KCkpLHRoaXMpOih0aGlzLl9zZXRQZXJjZW50YWdlKHRoaXMuZ2V0UGVyY2VudCgpKSx0aGlzKX19LGIuY3JlYXRlPWZ1bmN0aW9uKGEpe3JldHVybiBuZXcgYihhKX0sYn0pOyIsInZhciBEYXRlcGlja2VyO1xyXG5cclxuKGZ1bmN0aW9uICh3aW5kb3csICQsIHVuZGVmaW5lZCkge1xyXG4gICAgdmFyIHBsdWdpbk5hbWUgPSAnZGF0ZXBpY2tlcicsXHJcbiAgICAgICAgYXV0b0luaXRTZWxlY3RvciA9ICcuZGF0ZXBpY2tlci1oZXJlJyxcclxuICAgICAgICAkYm9keSwgJGRhdGVwaWNrZXJzQ29udGFpbmVyLFxyXG4gICAgICAgIGNvbnRhaW5lckJ1aWx0ID0gZmFsc2UsXHJcbiAgICAgICAgYmFzZVRlbXBsYXRlID0gJycgK1xyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXJcIj4nICtcclxuICAgICAgICAgICAgJzxuYXYgY2xhc3M9XCJkYXRlcGlja2VyLS1uYXZcIj48L25hdj4nICtcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1jb250ZW50XCI+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nLFxyXG4gICAgICAgIGRlZmF1bHRzID0ge1xyXG4gICAgICAgICAgICBjbGFzc2VzOiAnJyxcclxuICAgICAgICAgICAgaW5saW5lOiBmYWxzZSxcclxuICAgICAgICAgICAgbGFuZ3VhZ2U6ICdydScsXHJcbiAgICAgICAgICAgIHN0YXJ0RGF0ZTogbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgZmlyc3REYXk6ICcnLFxyXG4gICAgICAgICAgICB3ZWVrZW5kczogWzYsIDBdLFxyXG4gICAgICAgICAgICBkYXRlRm9ybWF0OiAnJyxcclxuICAgICAgICAgICAgYWx0RmllbGQ6ICcnLFxyXG4gICAgICAgICAgICBhbHRGaWVsZERhdGVGb3JtYXQ6ICdAJyxcclxuICAgICAgICAgICAgdG9nZ2xlU2VsZWN0ZWQ6IHRydWUsXHJcbiAgICAgICAgICAgIGtleWJvYXJkTmF2OiB0cnVlLFxyXG5cclxuICAgICAgICAgICAgcG9zaXRpb246ICdib3R0b20gbGVmdCcsXHJcbiAgICAgICAgICAgIG9mZnNldDogMTIsXHJcblxyXG4gICAgICAgICAgICB2aWV3OiAnZGF5cycsXHJcbiAgICAgICAgICAgIG1pblZpZXc6ICdkYXlzJyxcclxuXHJcbiAgICAgICAgICAgIHNob3dPdGhlck1vbnRoczogdHJ1ZSxcclxuICAgICAgICAgICAgc2VsZWN0T3RoZXJNb250aHM6IHRydWUsXHJcbiAgICAgICAgICAgIG1vdmVUb090aGVyTW9udGhzT25TZWxlY3Q6IHRydWUsXHJcblxyXG4gICAgICAgICAgICBzaG93T3RoZXJZZWFyczogdHJ1ZSxcclxuICAgICAgICAgICAgc2VsZWN0T3RoZXJZZWFyczogdHJ1ZSxcclxuICAgICAgICAgICAgbW92ZVRvT3RoZXJZZWFyc09uU2VsZWN0OiB0cnVlLFxyXG5cclxuICAgICAgICAgICAgbWluRGF0ZTogJycsXHJcbiAgICAgICAgICAgIG1heERhdGU6ICcnLFxyXG4gICAgICAgICAgICBkaXNhYmxlTmF2V2hlbk91dE9mUmFuZ2U6IHRydWUsXHJcblxyXG4gICAgICAgICAgICBtdWx0aXBsZURhdGVzOiBmYWxzZSwgLy8gQm9vbGVhbiBvciBOdW1iZXJcclxuICAgICAgICAgICAgbXVsdGlwbGVEYXRlc1NlcGFyYXRvcjogJywnLFxyXG4gICAgICAgICAgICByYW5nZTogZmFsc2UsXHJcblxyXG4gICAgICAgICAgICB0b2RheUJ1dHRvbjogZmFsc2UsXHJcbiAgICAgICAgICAgIGNsZWFyQnV0dG9uOiBmYWxzZSxcclxuXHJcbiAgICAgICAgICAgIHNob3dFdmVudDogJ2ZvY3VzJyxcclxuICAgICAgICAgICAgYXV0b0Nsb3NlOiBmYWxzZSxcclxuXHJcbiAgICAgICAgICAgIC8vIG5hdmlnYXRpb25cclxuICAgICAgICAgICAgbW9udGhzRmllbGQ6ICdtb250aHNTaG9ydCcsXHJcbiAgICAgICAgICAgIHByZXZIdG1sOiAnPHN2Zz48cGF0aCBkPVwiTSAxNywxMiBsIC01LDUgbCA1LDVcIj48L3BhdGg+PC9zdmc+JyxcclxuICAgICAgICAgICAgbmV4dEh0bWw6ICc8c3ZnPjxwYXRoIGQ9XCJNIDE0LDEyIGwgNSw1IGwgLTUsNVwiPjwvcGF0aD48L3N2Zz4nLFxyXG4gICAgICAgICAgICBuYXZUaXRsZXM6IHtcclxuICAgICAgICAgICAgICAgIGRheXM6ICdNTSwgPGk+eXl5eTwvaT4nLFxyXG4gICAgICAgICAgICAgICAgbW9udGhzOiAneXl5eScsXHJcbiAgICAgICAgICAgICAgICB5ZWFyczogJ3l5eXkxIC0geXl5eTInXHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAvLyBldmVudHNcclxuICAgICAgICAgICAgb25TZWxlY3Q6ICcnLFxyXG4gICAgICAgICAgICBvbkNoYW5nZU1vbnRoOiAnJyxcclxuICAgICAgICAgICAgb25DaGFuZ2VZZWFyOiAnJyxcclxuICAgICAgICAgICAgb25DaGFuZ2VEZWNhZGU6ICcnLFxyXG4gICAgICAgICAgICBvbkNoYW5nZVZpZXc6ICcnLFxyXG4gICAgICAgICAgICBvblJlbmRlckNlbGw6ICcnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBob3RLZXlzID0ge1xyXG4gICAgICAgICAgICAnY3RybFJpZ2h0JzogWzE3LCAzOV0sXHJcbiAgICAgICAgICAgICdjdHJsVXAnOiBbMTcsIDM4XSxcclxuICAgICAgICAgICAgJ2N0cmxMZWZ0JzogWzE3LCAzN10sXHJcbiAgICAgICAgICAgICdjdHJsRG93bic6IFsxNywgNDBdLFxyXG4gICAgICAgICAgICAnc2hpZnRSaWdodCc6IFsxNiwgMzldLFxyXG4gICAgICAgICAgICAnc2hpZnRVcCc6IFsxNiwgMzhdLFxyXG4gICAgICAgICAgICAnc2hpZnRMZWZ0JzogWzE2LCAzN10sXHJcbiAgICAgICAgICAgICdzaGlmdERvd24nOiBbMTYsIDQwXSxcclxuICAgICAgICAgICAgJ2FsdFVwJzogWzE4LCAzOF0sXHJcbiAgICAgICAgICAgICdhbHRSaWdodCc6IFsxOCwgMzldLFxyXG4gICAgICAgICAgICAnYWx0TGVmdCc6IFsxOCwgMzddLFxyXG4gICAgICAgICAgICAnYWx0RG93bic6IFsxOCwgNDBdLFxyXG4gICAgICAgICAgICAnY3RybFNoaWZ0VXAnOiBbMTYsIDE3LCAzOF1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGRhdGVwaWNrZXI7XHJcblxyXG4gICAgRGF0ZXBpY2tlciAgPSBmdW5jdGlvbiAoZWwsIG9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLmVsID0gZWw7XHJcbiAgICAgICAgdGhpcy4kZWwgPSAkKGVsKTtcclxuXHJcbiAgICAgICAgdGhpcy5vcHRzID0gJC5leHRlbmQodHJ1ZSwge30sIGRlZmF1bHRzLCBvcHRpb25zLCB0aGlzLiRlbC5kYXRhKCkpO1xyXG5cclxuICAgICAgICBpZiAoJGJvZHkgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICRib2R5ID0gJCgnYm9keScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLm9wdHMuc3RhcnREYXRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0cy5zdGFydERhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZWwubm9kZU5hbWUgPT0gJ0lOUFVUJykge1xyXG4gICAgICAgICAgICB0aGlzLmVsSXNJbnB1dCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5vcHRzLmFsdEZpZWxkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGFsdEZpZWxkID0gdHlwZW9mIHRoaXMub3B0cy5hbHRGaWVsZCA9PSAnc3RyaW5nJyA/ICQodGhpcy5vcHRzLmFsdEZpZWxkKSA6IHRoaXMub3B0cy5hbHRGaWVsZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zaWxlbnQgPSBmYWxzZTsgLy8gTmVlZCB0byBwcmV2ZW50IHVubmVjZXNzYXJ5IHJlbmRlcmluZ1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnREYXRlID0gdGhpcy5vcHRzLnN0YXJ0RGF0ZTtcclxuICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gdGhpcy5vcHRzLnZpZXc7XHJcbiAgICAgICAgdGhpcy5fY3JlYXRlU2hvcnRDdXRzKCk7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZERhdGVzID0gW107XHJcbiAgICAgICAgdGhpcy52aWV3cyA9IHt9O1xyXG4gICAgICAgIHRoaXMua2V5cyA9IFtdO1xyXG4gICAgICAgIHRoaXMubWluUmFuZ2UgPSAnJztcclxuICAgICAgICB0aGlzLm1heFJhbmdlID0gJyc7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpXHJcbiAgICB9O1xyXG5cclxuICAgIGRhdGVwaWNrZXIgPSBEYXRlcGlja2VyO1xyXG5cclxuICAgIGRhdGVwaWNrZXIucHJvdG90eXBlID0ge1xyXG4gICAgICAgIHZpZXdJbmRleGVzOiBbJ2RheXMnLCAnbW9udGhzJywgJ3llYXJzJ10sXHJcblxyXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCFjb250YWluZXJCdWlsdCAmJiAhdGhpcy5vcHRzLmlubGluZSAmJiB0aGlzLmVsSXNJbnB1dCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYnVpbGREYXRlcGlja2Vyc0NvbnRhaW5lcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2J1aWxkQmFzZUh0bWwoKTtcclxuICAgICAgICAgICAgdGhpcy5fZGVmaW5lTG9jYWxlKHRoaXMub3B0cy5sYW5ndWFnZSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3N5bmNXaXRoTWluTWF4RGF0ZXMoKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmVsSXNJbnB1dCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm9wdHMuaW5saW5lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gU2V0IGV4dHJhIGNsYXNzZXMgZm9yIHByb3BlciB0cmFuc2l0aW9uc1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldFBvc2l0aW9uQ2xhc3Nlcyh0aGlzLm9wdHMucG9zaXRpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2JpbmRFdmVudHMoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5rZXlib2FyZE5hdikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2JpbmRLZXlib2FyZEV2ZW50cygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlci5vbignbW91c2Vkb3duJywgdGhpcy5fb25Nb3VzZURvd25EYXRlcGlja2VyLmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlci5vbignbW91c2V1cCcsIHRoaXMuX29uTW91c2VVcERhdGVwaWNrZXIuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMuY2xhc3Nlcykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlci5hZGRDbGFzcyh0aGlzLm9wdHMuY2xhc3NlcylcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy52aWV3c1t0aGlzLmN1cnJlbnRWaWV3XSA9IG5ldyBEYXRlcGlja2VyLkJvZHkodGhpcywgdGhpcy5jdXJyZW50VmlldywgdGhpcy5vcHRzKTtcclxuICAgICAgICAgICAgdGhpcy52aWV3c1t0aGlzLmN1cnJlbnRWaWV3XS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMubmF2ID0gbmV3IERhdGVwaWNrZXIuTmF2aWdhdGlvbih0aGlzLCB0aGlzLm9wdHMpO1xyXG4gICAgICAgICAgICB0aGlzLnZpZXcgPSB0aGlzLmN1cnJlbnRWaWV3O1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlci5vbignbW91c2VlbnRlcicsICcuZGF0ZXBpY2tlci0tY2VsbCcsIHRoaXMuX29uTW91c2VFbnRlckNlbGwuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXIub24oJ21vdXNlbGVhdmUnLCAnLmRhdGVwaWNrZXItLWNlbGwnLCB0aGlzLl9vbk1vdXNlTGVhdmVDZWxsLmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pbml0ZWQgPSB0cnVlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9jcmVhdGVTaG9ydEN1dHM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5taW5EYXRlID0gdGhpcy5vcHRzLm1pbkRhdGUgPyB0aGlzLm9wdHMubWluRGF0ZSA6IG5ldyBEYXRlKC04NjM5OTk5OTEzNjAwMDAwKTtcclxuICAgICAgICAgICAgdGhpcy5tYXhEYXRlID0gdGhpcy5vcHRzLm1heERhdGUgPyB0aGlzLm9wdHMubWF4RGF0ZSA6IG5ldyBEYXRlKDg2Mzk5OTk5MTM2MDAwMDApO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9iaW5kRXZlbnRzIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRlbC5vbih0aGlzLm9wdHMuc2hvd0V2ZW50ICsgJy5hZHAnLCB0aGlzLl9vblNob3dFdmVudC5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgdGhpcy4kZWwub24oJ2JsdXIuYWRwJywgdGhpcy5fb25CbHVyLmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICB0aGlzLiRlbC5vbignaW5wdXQuYWRwJywgdGhpcy5fb25JbnB1dC5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuYWRwJywgdGhpcy5fb25SZXNpemUuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2JpbmRLZXlib2FyZEV2ZW50czogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRlbC5vbigna2V5ZG93bi5hZHAnLCB0aGlzLl9vbktleURvd24uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLm9uKCdrZXl1cC5hZHAnLCB0aGlzLl9vbktleVVwLmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICB0aGlzLiRlbC5vbignaG90S2V5LmFkcCcsIHRoaXMuX29uSG90S2V5LmJpbmQodGhpcykpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGlzV2Vla2VuZDogZnVuY3Rpb24gKGRheSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRzLndlZWtlbmRzLmluZGV4T2YoZGF5KSAhPT0gLTE7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2RlZmluZUxvY2FsZTogZnVuY3Rpb24gKGxhbmcpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBsYW5nID09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYyA9IERhdGVwaWNrZXIubGFuZ3VhZ2VbbGFuZ107XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubG9jKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdDYW5cXCd0IGZpbmQgbGFuZ3VhZ2UgXCInICsgbGFuZyArICdcIiBpbiBEYXRlcGlja2VyLmxhbmd1YWdlLCB3aWxsIHVzZSBcInJ1XCIgaW5zdGVhZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9jID0gJC5leHRlbmQodHJ1ZSwge30sIERhdGVwaWNrZXIubGFuZ3VhZ2UucnUpXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2MgPSAkLmV4dGVuZCh0cnVlLCB7fSwgRGF0ZXBpY2tlci5sYW5ndWFnZS5ydSwgRGF0ZXBpY2tlci5sYW5ndWFnZVtsYW5nXSlcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9jID0gJC5leHRlbmQodHJ1ZSwge30sIERhdGVwaWNrZXIubGFuZ3VhZ2UucnUsIGxhbmcpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMuZGF0ZUZvcm1hdCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2MuZGF0ZUZvcm1hdCA9IHRoaXMub3B0cy5kYXRlRm9ybWF0XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMuZmlyc3REYXkgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYy5maXJzdERheSA9IHRoaXMub3B0cy5maXJzdERheVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2J1aWxkRGF0ZXBpY2tlcnNDb250YWluZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgY29udGFpbmVyQnVpbHQgPSB0cnVlO1xyXG4gICAgICAgICAgICAkYm9keS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJkYXRlcGlja2Vycy1jb250YWluZXJcIiBpZD1cImRhdGVwaWNrZXJzLWNvbnRhaW5lclwiPjwvZGl2PicpO1xyXG4gICAgICAgICAgICAkZGF0ZXBpY2tlcnNDb250YWluZXIgPSAkKCcjZGF0ZXBpY2tlcnMtY29udGFpbmVyJyk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2J1aWxkQmFzZUh0bWw6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyICRhcHBlbmRUYXJnZXQsXHJcbiAgICAgICAgICAgICAgICAkaW5saW5lID0gJCgnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItaW5saW5lXCI+Jyk7XHJcblxyXG4gICAgICAgICAgICBpZih0aGlzLmVsLm5vZGVOYW1lID09ICdJTlBVVCcpIHtcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5vcHRzLmlubGluZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICRhcHBlbmRUYXJnZXQgPSAkZGF0ZXBpY2tlcnNDb250YWluZXI7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICRhcHBlbmRUYXJnZXQgPSAkaW5saW5lLmluc2VydEFmdGVyKHRoaXMuJGVsKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJGFwcGVuZFRhcmdldCA9ICRpbmxpbmUuYXBwZW5kVG8odGhpcy4kZWwpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXIgPSAkKGJhc2VUZW1wbGF0ZSkuYXBwZW5kVG8oJGFwcGVuZFRhcmdldCk7XHJcbiAgICAgICAgICAgIHRoaXMuJGNvbnRlbnQgPSAkKCcuZGF0ZXBpY2tlci0tY29udGVudCcsIHRoaXMuJGRhdGVwaWNrZXIpO1xyXG4gICAgICAgICAgICB0aGlzLiRuYXYgPSAkKCcuZGF0ZXBpY2tlci0tbmF2JywgdGhpcy4kZGF0ZXBpY2tlcik7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX3RyaWdnZXJPbkNoYW5nZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuc2VsZWN0ZWREYXRlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdHMub25TZWxlY3QoJycsICcnLCB0aGlzKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHNlbGVjdGVkRGF0ZXMgPSB0aGlzLnNlbGVjdGVkRGF0ZXMsXHJcbiAgICAgICAgICAgICAgICBwYXJzZWRTZWxlY3RlZCA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZShzZWxlY3RlZERhdGVzWzBdKSxcclxuICAgICAgICAgICAgICAgIGZvcm1hdHRlZERhdGVzLFxyXG4gICAgICAgICAgICAgICAgX3RoaXMgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgZGF0ZXMgPSBuZXcgRGF0ZShwYXJzZWRTZWxlY3RlZC55ZWFyLCBwYXJzZWRTZWxlY3RlZC5tb250aCwgcGFyc2VkU2VsZWN0ZWQuZGF0ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9ybWF0dGVkRGF0ZXMgPSBzZWxlY3RlZERhdGVzLm1hcChmdW5jdGlvbiAoZGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5mb3JtYXREYXRlKF90aGlzLmxvYy5kYXRlRm9ybWF0LCBkYXRlKVxyXG4gICAgICAgICAgICAgICAgfSkuam9pbih0aGlzLm9wdHMubXVsdGlwbGVEYXRlc1NlcGFyYXRvcik7XHJcblxyXG4gICAgICAgICAgICAvLyBDcmVhdGUgbmV3IGRhdGVzIGFycmF5LCB0byBzZXBhcmF0ZSBpdCBmcm9tIG9yaWdpbmFsIHNlbGVjdGVkRGF0ZXNcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5tdWx0aXBsZURhdGVzIHx8IHRoaXMub3B0cy5yYW5nZSkge1xyXG4gICAgICAgICAgICAgICAgZGF0ZXMgPSBzZWxlY3RlZERhdGVzLm1hcChmdW5jdGlvbihkYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcnNlZERhdGUgPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUoZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHBhcnNlZERhdGUueWVhciwgcGFyc2VkRGF0ZS5tb250aCwgcGFyc2VkRGF0ZS5kYXRlKVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5vcHRzLm9uU2VsZWN0KGZvcm1hdHRlZERhdGVzLCBkYXRlcywgdGhpcyk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgZCA9IHRoaXMucGFyc2VkRGF0ZSxcclxuICAgICAgICAgICAgICAgIG8gPSB0aGlzLm9wdHM7XHJcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy52aWV3KSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdkYXlzJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShkLnllYXIsIGQubW9udGggKyAxLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoby5vbkNoYW5nZU1vbnRoKSBvLm9uQ2hhbmdlTW9udGgodGhpcy5wYXJzZWREYXRlLm1vbnRoLCB0aGlzLnBhcnNlZERhdGUueWVhcik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdtb250aHMnOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKGQueWVhciArIDEsIGQubW9udGgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvLm9uQ2hhbmdlWWVhcikgby5vbkNoYW5nZVllYXIodGhpcy5wYXJzZWREYXRlLnllYXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAneWVhcnMnOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKGQueWVhciArIDEwLCAwLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoby5vbkNoYW5nZURlY2FkZSkgby5vbkNoYW5nZURlY2FkZSh0aGlzLmN1ckRlY2FkZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBwcmV2OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBkID0gdGhpcy5wYXJzZWREYXRlLFxyXG4gICAgICAgICAgICAgICAgbyA9IHRoaXMub3B0cztcclxuICAgICAgICAgICAgc3dpdGNoICh0aGlzLnZpZXcpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2RheXMnOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKGQueWVhciwgZC5tb250aCAtIDEsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvLm9uQ2hhbmdlTW9udGgpIG8ub25DaGFuZ2VNb250aCh0aGlzLnBhcnNlZERhdGUubW9udGgsIHRoaXMucGFyc2VkRGF0ZS55ZWFyKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ21vbnRocyc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoZC55ZWFyIC0gMSwgZC5tb250aCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG8ub25DaGFuZ2VZZWFyKSBvLm9uQ2hhbmdlWWVhcih0aGlzLnBhcnNlZERhdGUueWVhcik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICd5ZWFycyc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoZC55ZWFyIC0gMTAsIDAsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvLm9uQ2hhbmdlRGVjYWRlKSBvLm9uQ2hhbmdlRGVjYWRlKHRoaXMuY3VyRGVjYWRlKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGZvcm1hdERhdGU6IGZ1bmN0aW9uIChzdHJpbmcsIGRhdGUpIHtcclxuICAgICAgICAgICAgZGF0ZSA9IGRhdGUgfHwgdGhpcy5kYXRlO1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gc3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgYm91bmRhcnkgPSB0aGlzLl9nZXRXb3JkQm91bmRhcnlSZWdFeHAsXHJcbiAgICAgICAgICAgICAgICBsb2NhbGUgPSB0aGlzLmxvYyxcclxuICAgICAgICAgICAgICAgIGRlY2FkZSA9IGRhdGVwaWNrZXIuZ2V0RGVjYWRlKGRhdGUpLFxyXG4gICAgICAgICAgICAgICAgZCA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZShkYXRlKTtcclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAvQC8udGVzdChyZXN1bHQpOlxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKC9ALywgZGF0ZS5nZXRUaW1lKCkpO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAvZGQvLnRlc3QocmVzdWx0KTpcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgnZGQnKSwgZC5mdWxsRGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBjYXNlIC9kLy50ZXN0KHJlc3VsdCk6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ2QnKSwgZC5kYXRlKTtcclxuICAgICAgICAgICAgICAgIGNhc2UgL0RELy50ZXN0KHJlc3VsdCk6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ0REJyksIGxvY2FsZS5kYXlzW2QuZGF5XSk7XHJcbiAgICAgICAgICAgICAgICBjYXNlIC9ELy50ZXN0KHJlc3VsdCk6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ0QnKSwgbG9jYWxlLmRheXNTaG9ydFtkLmRheV0pO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAvbW0vLnRlc3QocmVzdWx0KTpcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgnbW0nKSwgZC5mdWxsTW9udGgpO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAvbS8udGVzdChyZXN1bHQpOlxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCdtJyksIGQubW9udGggKyAxKTtcclxuICAgICAgICAgICAgICAgIGNhc2UgL01NLy50ZXN0KHJlc3VsdCk6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ01NJyksIHRoaXMubG9jLm1vbnRoc1tkLm1vbnRoXSk7XHJcbiAgICAgICAgICAgICAgICBjYXNlIC9NLy50ZXN0KHJlc3VsdCk6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ00nKSwgbG9jYWxlLm1vbnRoc1Nob3J0W2QubW9udGhdKTtcclxuICAgICAgICAgICAgICAgIGNhc2UgL3l5eXkvLnRlc3QocmVzdWx0KTpcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgneXl5eScpLCBkLnllYXIpO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAveXl5eTEvLnRlc3QocmVzdWx0KTpcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgneXl5eTEnKSwgZGVjYWRlWzBdKTtcclxuICAgICAgICAgICAgICAgIGNhc2UgL3l5eXkyLy50ZXN0KHJlc3VsdCk6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ3l5eXkyJyksIGRlY2FkZVsxXSk7XHJcbiAgICAgICAgICAgICAgICBjYXNlIC95eS8udGVzdChyZXN1bHQpOlxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCd5eScpLCBkLnllYXIudG9TdHJpbmcoKS5zbGljZSgtMikpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9nZXRXb3JkQm91bmRhcnlSZWdFeHA6IGZ1bmN0aW9uIChzaWduKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUmVnRXhwKCdcXFxcYig/PVthLXpBLVowLTnDpMO2w7zDn8OEw5bDnDxdKScgKyBzaWduICsgJyg/IVs+YS16QS1aMC05w6TDtsO8w5/DhMOWw5xdKScpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNlbGVjdERhdGU6IGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvcHRzID0gX3RoaXMub3B0cyxcclxuICAgICAgICAgICAgICAgIGQgPSBfdGhpcy5wYXJzZWREYXRlLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWREYXRlcyA9IF90aGlzLnNlbGVjdGVkRGF0ZXMsXHJcbiAgICAgICAgICAgICAgICBsZW4gPSBzZWxlY3RlZERhdGVzLmxlbmd0aCxcclxuICAgICAgICAgICAgICAgIG5ld0RhdGUgPSAnJztcclxuXHJcbiAgICAgICAgICAgIGlmICghKGRhdGUgaW5zdGFuY2VvZiBEYXRlKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgaWYgKF90aGlzLnZpZXcgPT0gJ2RheXMnKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZS5nZXRNb250aCgpICE9IGQubW9udGggJiYgb3B0cy5tb3ZlVG9PdGhlck1vbnRoc09uU2VsZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3RGF0ZSA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCAxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKF90aGlzLnZpZXcgPT0gJ3llYXJzJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGUuZ2V0RnVsbFllYXIoKSAhPSBkLnllYXIgJiYgb3B0cy5tb3ZlVG9PdGhlclllYXJzT25TZWxlY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICBuZXdEYXRlID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCAwLCAxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKG5ld0RhdGUpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLnNpbGVudCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5kYXRlID0gbmV3RGF0ZTtcclxuICAgICAgICAgICAgICAgIF90aGlzLnNpbGVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMubmF2Ll9yZW5kZXIoKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAob3B0cy5tdWx0aXBsZURhdGVzICYmICFvcHRzLnJhbmdlKSB7IC8vIFNldCBwcmlvcml0eSB0byByYW5nZSBmdW5jdGlvbmFsaXR5XHJcbiAgICAgICAgICAgICAgICBpZiAobGVuID09PSBvcHRzLm11bHRpcGxlRGF0ZXMpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIGlmICghX3RoaXMuX2lzU2VsZWN0ZWQoZGF0ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZWxlY3RlZERhdGVzLnB1c2goZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0cy5yYW5nZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGxlbiA9PSAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2VsZWN0ZWREYXRlcyA9IFtkYXRlXTtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5taW5SYW5nZSA9IGRhdGU7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMubWF4UmFuZ2UgPSAnJztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobGVuID09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZWxlY3RlZERhdGVzLnB1c2goZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFfdGhpcy5tYXhSYW5nZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLm1heFJhbmdlID0gZGF0ZTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5taW5SYW5nZSA9IGRhdGU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnNlbGVjdGVkRGF0ZXMgPSBbX3RoaXMubWluUmFuZ2UsIF90aGlzLm1heFJhbmdlXVxyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2VsZWN0ZWREYXRlcyA9IFtkYXRlXTtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5taW5SYW5nZSA9IGRhdGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5zZWxlY3RlZERhdGVzID0gW2RhdGVdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBfdGhpcy5fc2V0SW5wdXRWYWx1ZSgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKG9wdHMub25TZWxlY3QpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLl90cmlnZ2VyT25DaGFuZ2UoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKG9wdHMuYXV0b0Nsb3NlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIW9wdHMubXVsdGlwbGVEYXRlcyAmJiAhb3B0cy5yYW5nZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0cy5yYW5nZSAmJiBfdGhpcy5zZWxlY3RlZERhdGVzLmxlbmd0aCA9PSAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBfdGhpcy52aWV3c1t0aGlzLmN1cnJlbnRWaWV3XS5fcmVuZGVyKClcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICByZW1vdmVEYXRlOiBmdW5jdGlvbiAoZGF0ZSkge1xyXG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSB0aGlzLnNlbGVjdGVkRGF0ZXMsXHJcbiAgICAgICAgICAgICAgICBfdGhpcyA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICBpZiAoIShkYXRlIGluc3RhbmNlb2YgRGF0ZSkpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzZWxlY3RlZC5zb21lKGZ1bmN0aW9uIChjdXJEYXRlLCBpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZXBpY2tlci5pc1NhbWUoY3VyRGF0ZSwgZGF0ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZC5zcGxpY2UoaSwgMSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghX3RoaXMuc2VsZWN0ZWREYXRlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMubWluUmFuZ2UgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMubWF4UmFuZ2UgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnZpZXdzW190aGlzLmN1cnJlbnRWaWV3XS5fcmVuZGVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuX3NldElucHV0VmFsdWUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzLm9wdHMub25TZWxlY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuX3RyaWdnZXJPbkNoYW5nZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICB0b2RheTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMudmlldyA9IHRoaXMub3B0cy5taW5WaWV3O1xyXG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlcyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLm1pblJhbmdlID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMubWF4UmFuZ2UgPSAnJztcclxuICAgICAgICAgICAgdGhpcy52aWV3c1t0aGlzLmN1cnJlbnRWaWV3XS5fcmVuZGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3NldElucHV0VmFsdWUoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5vblNlbGVjdCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdHJpZ2dlck9uQ2hhbmdlKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFVwZGF0ZXMgZGF0ZXBpY2tlciBvcHRpb25zXHJcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBwYXJhbSAtIHBhcmFtZXRlcidzIG5hbWUgdG8gdXBkYXRlLiBJZiBvYmplY3QgdGhlbiBpdCB3aWxsIGV4dGVuZCBjdXJyZW50IG9wdGlvbnNcclxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ8T2JqZWN0fSBbdmFsdWVdIC0gbmV3IHBhcmFtIHZhbHVlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiAocGFyYW0sIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHZhciBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xyXG4gICAgICAgICAgICBpZiAobGVuID09IDIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3B0c1twYXJhbV0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChsZW4gPT0gMSAmJiB0eXBlb2YgcGFyYW0gPT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3B0cyA9ICQuZXh0ZW5kKHRydWUsIHRoaXMub3B0cywgcGFyYW0pXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZVNob3J0Q3V0cygpO1xyXG4gICAgICAgICAgICB0aGlzLl9zeW5jV2l0aE1pbk1heERhdGVzKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2RlZmluZUxvY2FsZSh0aGlzLm9wdHMubGFuZ3VhZ2UpO1xyXG4gICAgICAgICAgICB0aGlzLm5hdi5fYWRkQnV0dG9uc0lmTmVlZCgpO1xyXG4gICAgICAgICAgICB0aGlzLm5hdi5fcmVuZGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMudmlld3NbdGhpcy5jdXJyZW50Vmlld10uX3JlbmRlcigpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuZWxJc0lucHV0ICYmICF0aGlzLm9wdHMuaW5saW5lKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRQb3NpdGlvbkNsYXNzZXModGhpcy5vcHRzLnBvc2l0aW9uKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnZpc2libGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFBvc2l0aW9uKHRoaXMub3B0cy5wb3NpdGlvbilcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5jbGFzc2VzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyLmFkZENsYXNzKHRoaXMub3B0cy5jbGFzc2VzKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfc3luY1dpdGhNaW5NYXhEYXRlczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgY3VyVGltZSA9IHRoaXMuZGF0ZS5nZXRUaW1lKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgaWYgKHRoaXMubWluVGltZSA+IGN1clRpbWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHRoaXMubWluRGF0ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMubWF4VGltZSA8IGN1clRpbWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHRoaXMubWF4RGF0ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IGZhbHNlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9pc1NlbGVjdGVkOiBmdW5jdGlvbiAoY2hlY2tEYXRlLCBjZWxsVHlwZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZERhdGVzLnNvbWUoZnVuY3Rpb24gKGRhdGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRlcGlja2VyLmlzU2FtZShkYXRlLCBjaGVja0RhdGUsIGNlbGxUeXBlKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9zZXRJbnB1dFZhbHVlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvcHRzID0gX3RoaXMub3B0cyxcclxuICAgICAgICAgICAgICAgIGZvcm1hdCA9IF90aGlzLmxvYy5kYXRlRm9ybWF0LFxyXG4gICAgICAgICAgICAgICAgYWx0Rm9ybWF0ID0gb3B0cy5hbHRGaWVsZERhdGVGb3JtYXQsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IF90aGlzLnNlbGVjdGVkRGF0ZXMubWFwKGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLmZvcm1hdERhdGUoZm9ybWF0LCBkYXRlKVxyXG4gICAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgICAgICBhbHRWYWx1ZXM7XHJcblxyXG4gICAgICAgICAgICBpZiAob3B0cy5hbHRGaWVsZCAmJiBfdGhpcy4kYWx0RmllbGQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBhbHRWYWx1ZXMgPSB0aGlzLnNlbGVjdGVkRGF0ZXMubWFwKGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLmZvcm1hdERhdGUoYWx0Rm9ybWF0LCBkYXRlKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBhbHRWYWx1ZXMgPSBhbHRWYWx1ZXMuam9pbih0aGlzLm9wdHMubXVsdGlwbGVEYXRlc1NlcGFyYXRvcik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRhbHRGaWVsZC52YWwoYWx0VmFsdWVzKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5qb2luKHRoaXMub3B0cy5tdWx0aXBsZURhdGVzU2VwYXJhdG9yKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJGVsLnZhbCh2YWx1ZSlcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDaGVjayBpZiBkYXRlIGlzIGJldHdlZW4gbWluRGF0ZSBhbmQgbWF4RGF0ZVxyXG4gICAgICAgICAqIEBwYXJhbSBkYXRlIHtvYmplY3R9IC0gZGF0ZSBvYmplY3RcclxuICAgICAgICAgKiBAcGFyYW0gdHlwZSB7c3RyaW5nfSAtIGNlbGwgdHlwZVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgX2lzSW5SYW5nZTogZnVuY3Rpb24gKGRhdGUsIHR5cGUpIHtcclxuICAgICAgICAgICAgdmFyIHRpbWUgPSBkYXRlLmdldFRpbWUoKSxcclxuICAgICAgICAgICAgICAgIGQgPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUoZGF0ZSksXHJcbiAgICAgICAgICAgICAgICBtaW4gPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUodGhpcy5taW5EYXRlKSxcclxuICAgICAgICAgICAgICAgIG1heCA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZSh0aGlzLm1heERhdGUpLFxyXG4gICAgICAgICAgICAgICAgZE1pblRpbWUgPSBuZXcgRGF0ZShkLnllYXIsIGQubW9udGgsIG1pbi5kYXRlKS5nZXRUaW1lKCksXHJcbiAgICAgICAgICAgICAgICBkTWF4VGltZSA9IG5ldyBEYXRlKGQueWVhciwgZC5tb250aCwgbWF4LmRhdGUpLmdldFRpbWUoKSxcclxuICAgICAgICAgICAgICAgIHR5cGVzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRheTogdGltZSA+PSB0aGlzLm1pblRpbWUgJiYgdGltZSA8PSB0aGlzLm1heFRpbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgbW9udGg6IGRNaW5UaW1lID49IHRoaXMubWluVGltZSAmJiBkTWF4VGltZSA8PSB0aGlzLm1heFRpbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgeWVhcjogZC55ZWFyID49IG1pbi55ZWFyICYmIGQueWVhciA8PSBtYXgueWVhclxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIHR5cGUgPyB0eXBlc1t0eXBlXSA6IHR5cGVzLmRheVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9nZXREaW1lbnNpb25zOiBmdW5jdGlvbiAoJGVsKSB7XHJcbiAgICAgICAgICAgIHZhciBvZmZzZXQgPSAkZWwub2Zmc2V0KCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgd2lkdGg6ICRlbC5vdXRlcldpZHRoKCksXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICRlbC5vdXRlckhlaWdodCgpLFxyXG4gICAgICAgICAgICAgICAgbGVmdDogb2Zmc2V0LmxlZnQsXHJcbiAgICAgICAgICAgICAgICB0b3A6IG9mZnNldC50b3BcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9nZXREYXRlRnJvbUNlbGw6IGZ1bmN0aW9uIChjZWxsKSB7XHJcbiAgICAgICAgICAgIHZhciBjdXJEYXRlID0gdGhpcy5wYXJzZWREYXRlLFxyXG4gICAgICAgICAgICAgICAgeWVhciA9IGNlbGwuZGF0YSgneWVhcicpIHx8IGN1ckRhdGUueWVhcixcclxuICAgICAgICAgICAgICAgIG1vbnRoID0gY2VsbC5kYXRhKCdtb250aCcpID09IHVuZGVmaW5lZCA/IGN1ckRhdGUubW9udGggOiBjZWxsLmRhdGEoJ21vbnRoJyksXHJcbiAgICAgICAgICAgICAgICBkYXRlID0gY2VsbC5kYXRhKCdkYXRlJykgfHwgMTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgZGF0ZSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX3NldFBvc2l0aW9uQ2xhc3NlczogZnVuY3Rpb24gKHBvcykge1xyXG4gICAgICAgICAgICBwb3MgPSBwb3Muc3BsaXQoJyAnKTtcclxuICAgICAgICAgICAgdmFyIG1haW4gPSBwb3NbMF0sXHJcbiAgICAgICAgICAgICAgICBzZWMgPSBwb3NbMV0sXHJcbiAgICAgICAgICAgICAgICBjbGFzc2VzID0gJ2RhdGVwaWNrZXIgLScgKyBtYWluICsgJy0nICsgc2VjICsgJy0gLWZyb20tJyArIG1haW4gKyAnLSc7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy52aXNpYmxlKSBjbGFzc2VzICs9ICcgYWN0aXZlJztcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXJcclxuICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdjbGFzcycpXHJcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoY2xhc3Nlcyk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2V0UG9zaXRpb246IGZ1bmN0aW9uIChwb3NpdGlvbikge1xyXG4gICAgICAgICAgICBwb3NpdGlvbiA9IHBvc2l0aW9uIHx8IHRoaXMub3B0cy5wb3NpdGlvbjtcclxuXHJcbiAgICAgICAgICAgIHZhciBkaW1zID0gdGhpcy5fZ2V0RGltZW5zaW9ucyh0aGlzLiRlbCksXHJcbiAgICAgICAgICAgICAgICBzZWxmRGltcyA9IHRoaXMuX2dldERpbWVuc2lvbnModGhpcy4kZGF0ZXBpY2tlciksXHJcbiAgICAgICAgICAgICAgICBwb3MgPSBwb3NpdGlvbi5zcGxpdCgnICcpLFxyXG4gICAgICAgICAgICAgICAgdG9wLCBsZWZ0LFxyXG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gdGhpcy5vcHRzLm9mZnNldCxcclxuICAgICAgICAgICAgICAgIG1haW4gPSBwb3NbMF0sXHJcbiAgICAgICAgICAgICAgICBzZWNvbmRhcnkgPSBwb3NbMV07XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2ggKG1haW4pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XHJcbiAgICAgICAgICAgICAgICAgICAgdG9wID0gZGltcy50b3AgLSBzZWxmRGltcy5oZWlnaHQgLSBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgICAgICAgICAgICAgbGVmdCA9IGRpbXMubGVmdCArIGRpbXMud2lkdGggKyBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdib3R0b20nOlxyXG4gICAgICAgICAgICAgICAgICAgIHRvcCA9IGRpbXMudG9wICsgZGltcy5oZWlnaHQgKyBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gZGltcy5sZWZ0IC0gc2VsZkRpbXMud2lkdGggLSBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHN3aXRjaChzZWNvbmRhcnkpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XHJcbiAgICAgICAgICAgICAgICAgICAgdG9wID0gZGltcy50b3A7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgICAgICAgICAgICAgbGVmdCA9IGRpbXMubGVmdCArIGRpbXMud2lkdGggLSBzZWxmRGltcy53aWR0aDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XHJcbiAgICAgICAgICAgICAgICAgICAgdG9wID0gZGltcy50b3AgKyBkaW1zLmhlaWdodCAtIHNlbGZEaW1zLmhlaWdodDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgICAgICAgICAgICAgIGxlZnQgPSBkaW1zLmxlZnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdjZW50ZXInOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgvbGVmdHxyaWdodC8udGVzdChtYWluKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3AgPSBkaW1zLnRvcCArIGRpbXMuaGVpZ2h0LzIgLSBzZWxmRGltcy5oZWlnaHQvMjtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gZGltcy5sZWZ0ICsgZGltcy53aWR0aC8yIC0gc2VsZkRpbXMud2lkdGgvMjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXJcclxuICAgICAgICAgICAgICAgIC5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnQsXHJcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0b3BcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2hvdzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLnNldFBvc2l0aW9uKHRoaXMub3B0cy5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXIuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICB0aGlzLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGhpZGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlclxyXG4gICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxyXG4gICAgICAgICAgICAgICAgLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogJy0xMDAwMDBweCdcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5mb2N1c2VkID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMua2V5cyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pbkZvY3VzID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLiRlbC5ibHVyKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZG93bjogZnVuY3Rpb24gKGRhdGUpIHtcclxuICAgICAgICAgICAgdGhpcy5fY2hhbmdlVmlldyhkYXRlLCAnZG93bicpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHVwOiBmdW5jdGlvbiAoZGF0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9jaGFuZ2VWaWV3KGRhdGUsICd1cCcpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9jaGFuZ2VWaWV3OiBmdW5jdGlvbiAoZGF0ZSwgZGlyKSB7XHJcbiAgICAgICAgICAgIGRhdGUgPSBkYXRlIHx8IHRoaXMuZm9jdXNlZCB8fCB0aGlzLmRhdGU7XHJcblxyXG4gICAgICAgICAgICB2YXIgbmV4dFZpZXcgPSBkaXIgPT0gJ3VwJyA/IHRoaXMudmlld0luZGV4ICsgMSA6IHRoaXMudmlld0luZGV4IC0gMTtcclxuICAgICAgICAgICAgaWYgKG5leHRWaWV3ID4gMikgbmV4dFZpZXcgPSAyO1xyXG4gICAgICAgICAgICBpZiAobmV4dFZpZXcgPCAwKSBuZXh0VmlldyA9IDA7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCAxKTtcclxuICAgICAgICAgICAgdGhpcy5zaWxlbnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy52aWV3ID0gdGhpcy52aWV3SW5kZXhlc1tuZXh0Vmlld107XHJcblxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9oYW5kbGVIb3RLZXk6IGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGUgPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUodGhpcy5fZ2V0Rm9jdXNlZERhdGUoKSksXHJcbiAgICAgICAgICAgICAgICBmb2N1c2VkUGFyc2VkLFxyXG4gICAgICAgICAgICAgICAgbyA9IHRoaXMub3B0cyxcclxuICAgICAgICAgICAgICAgIG5ld0RhdGUsXHJcbiAgICAgICAgICAgICAgICB0b3RhbERheXNJbk5leHRNb250aCxcclxuICAgICAgICAgICAgICAgIG1vbnRoQ2hhbmdlZCA9IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgeWVhckNoYW5nZWQgPSBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGRlY2FkZUNoYW5nZWQgPSBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHkgPSBkYXRlLnllYXIsXHJcbiAgICAgICAgICAgICAgICBtID0gZGF0ZS5tb250aCxcclxuICAgICAgICAgICAgICAgIGQgPSBkYXRlLmRhdGU7XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2ggKGtleSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnY3RybFJpZ2h0JzpcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2N0cmxVcCc6XHJcbiAgICAgICAgICAgICAgICAgICAgbSArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vbnRoQ2hhbmdlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdjdHJsTGVmdCc6XHJcbiAgICAgICAgICAgICAgICBjYXNlICdjdHJsRG93bic6XHJcbiAgICAgICAgICAgICAgICAgICAgbSAtPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vbnRoQ2hhbmdlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdzaGlmdFJpZ2h0JzpcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3NoaWZ0VXAnOlxyXG4gICAgICAgICAgICAgICAgICAgIHllYXJDaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB5ICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdzaGlmdExlZnQnOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAnc2hpZnREb3duJzpcclxuICAgICAgICAgICAgICAgICAgICB5ZWFyQ2hhbmdlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgeSAtPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnYWx0UmlnaHQnOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAnYWx0VXAnOlxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2FkZUNoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHkgKz0gMTA7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdhbHRMZWZ0JzpcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2FsdERvd24nOlxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2FkZUNoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHkgLT0gMTA7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdjdHJsU2hpZnRVcCc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0b3RhbERheXNJbk5leHRNb250aCA9IGRhdGVwaWNrZXIuZ2V0RGF5c0NvdW50KG5ldyBEYXRlKHksbSkpO1xyXG4gICAgICAgICAgICBuZXdEYXRlID0gbmV3IERhdGUoeSxtLGQpO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgbmV4dCBtb250aCBoYXMgbGVzcyBkYXlzIHRoYW4gY3VycmVudCwgc2V0IGRhdGUgdG8gdG90YWwgZGF5cyBpbiB0aGF0IG1vbnRoXHJcbiAgICAgICAgICAgIGlmICh0b3RhbERheXNJbk5leHRNb250aCA8IGQpIGQgPSB0b3RhbERheXNJbk5leHRNb250aDtcclxuXHJcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIG5ld0RhdGUgaXMgaW4gdmFsaWQgcmFuZ2VcclxuICAgICAgICAgICAgaWYgKG5ld0RhdGUuZ2V0VGltZSgpIDwgdGhpcy5taW5UaW1lKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdEYXRlID0gdGhpcy5taW5EYXRlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0RhdGUuZ2V0VGltZSgpID4gdGhpcy5tYXhUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdEYXRlID0gdGhpcy5tYXhEYXRlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmZvY3VzZWQgPSBuZXdEYXRlO1xyXG5cclxuICAgICAgICAgICAgZm9jdXNlZFBhcnNlZCA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZShuZXdEYXRlKTtcclxuICAgICAgICAgICAgaWYgKG1vbnRoQ2hhbmdlZCAmJiBvLm9uQ2hhbmdlTW9udGgpIHtcclxuICAgICAgICAgICAgICAgIG8ub25DaGFuZ2VNb250aChmb2N1c2VkUGFyc2VkLm1vbnRoLCBmb2N1c2VkUGFyc2VkLnllYXIpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHllYXJDaGFuZ2VkICYmIG8ub25DaGFuZ2VZZWFyKSB7XHJcbiAgICAgICAgICAgICAgICBvLm9uQ2hhbmdlWWVhcihmb2N1c2VkUGFyc2VkLnllYXIpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRlY2FkZUNoYW5nZWQgJiYgby5vbkNoYW5nZURlY2FkZSkge1xyXG4gICAgICAgICAgICAgICAgby5vbkNoYW5nZURlY2FkZSh0aGlzLmN1ckRlY2FkZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9yZWdpc3RlcktleTogZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgICB2YXIgZXhpc3RzID0gdGhpcy5rZXlzLnNvbWUoZnVuY3Rpb24gKGN1cktleSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cktleSA9PSBrZXk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFleGlzdHMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMua2V5cy5wdXNoKGtleSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF91blJlZ2lzdGVyS2V5OiBmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMua2V5cy5pbmRleE9mKGtleSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmtleXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfaXNIb3RLZXlQcmVzc2VkOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBjdXJyZW50SG90S2V5LFxyXG4gICAgICAgICAgICAgICAgZm91bmQgPSBmYWxzZSxcclxuICAgICAgICAgICAgICAgIF90aGlzID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIHByZXNzZWRLZXlzID0gdGhpcy5rZXlzLnNvcnQoKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGhvdEtleSBpbiBob3RLZXlzKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50SG90S2V5ID0gaG90S2V5c1tob3RLZXldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHByZXNzZWRLZXlzLmxlbmd0aCAhPSBjdXJyZW50SG90S2V5Lmxlbmd0aCkgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRIb3RLZXkuZXZlcnkoZnVuY3Rpb24gKGtleSwgaSkgeyByZXR1cm4ga2V5ID09IHByZXNzZWRLZXlzW2ldfSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5fdHJpZ2dlcignaG90S2V5JywgaG90S2V5KTtcclxuICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmb3VuZDtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfdHJpZ2dlcjogZnVuY3Rpb24gKGV2ZW50LCBhcmdzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLnRyaWdnZXIoZXZlbnQsIGFyZ3MpXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2ZvY3VzTmV4dENlbGw6IGZ1bmN0aW9uIChrZXlDb2RlLCB0eXBlKSB7XHJcbiAgICAgICAgICAgIHR5cGUgPSB0eXBlIHx8IHRoaXMuY2VsbFR5cGU7XHJcblxyXG4gICAgICAgICAgICB2YXIgZGF0ZSA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZSh0aGlzLl9nZXRGb2N1c2VkRGF0ZSgpKSxcclxuICAgICAgICAgICAgICAgIHkgPSBkYXRlLnllYXIsXHJcbiAgICAgICAgICAgICAgICBtID0gZGF0ZS5tb250aCxcclxuICAgICAgICAgICAgICAgIGQgPSBkYXRlLmRhdGU7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5faXNIb3RLZXlQcmVzc2VkKCkpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2goa2V5Q29kZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzNzogLy8gbGVmdFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ2RheScgPyAoZCAtPSAxKSA6ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ21vbnRoJyA/IChtIC09IDEpIDogJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAneWVhcicgPyAoeSAtPSAxKSA6ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzODogLy8gdXBcclxuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICdkYXknID8gKGQgLT0gNykgOiAnJztcclxuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICdtb250aCcgPyAobSAtPSAzKSA6ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ3llYXInID8gKHkgLT0gNCkgOiAnJztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMzk6IC8vIHJpZ2h0XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAnZGF5JyA/IChkICs9IDEpIDogJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAnbW9udGgnID8gKG0gKz0gMSkgOiAnJztcclxuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICd5ZWFyJyA/ICh5ICs9IDEpIDogJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQwOiAvLyBkb3duXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAnZGF5JyA/IChkICs9IDcpIDogJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAnbW9udGgnID8gKG0gKz0gMykgOiAnJztcclxuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICd5ZWFyJyA/ICh5ICs9IDQpIDogJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBuZCA9IG5ldyBEYXRlKHksbSxkKTtcclxuICAgICAgICAgICAgaWYgKG5kLmdldFRpbWUoKSA8IHRoaXMubWluVGltZSkge1xyXG4gICAgICAgICAgICAgICAgbmQgPSB0aGlzLm1pbkRhdGU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmQuZ2V0VGltZSgpID4gdGhpcy5tYXhUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICBuZCA9IHRoaXMubWF4RGF0ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5mb2N1c2VkID0gbmQ7XHJcblxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9nZXRGb2N1c2VkRGF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgZm9jdXNlZCAgPSB0aGlzLmZvY3VzZWQgfHwgdGhpcy5zZWxlY3RlZERhdGVzW3RoaXMuc2VsZWN0ZWREYXRlcy5sZW5ndGggLSAxXSxcclxuICAgICAgICAgICAgICAgIGQgPSB0aGlzLnBhcnNlZERhdGU7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWZvY3VzZWQpIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy52aWV3KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZGF5cyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzZWQgPSBuZXcgRGF0ZShkLnllYXIsIGQubW9udGgsIG5ldyBEYXRlKCkuZ2V0RGF0ZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbW9udGhzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXNlZCA9IG5ldyBEYXRlKGQueWVhciwgZC5tb250aCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3llYXJzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXNlZCA9IG5ldyBEYXRlKGQueWVhciwgMCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZm9jdXNlZDtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfZ2V0Q2VsbDogZnVuY3Rpb24gKGRhdGUsIHR5cGUpIHtcclxuICAgICAgICAgICAgdHlwZSA9IHR5cGUgfHwgdGhpcy5jZWxsVHlwZTtcclxuXHJcbiAgICAgICAgICAgIHZhciBkID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKGRhdGUpLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0b3IgPSAnLmRhdGVwaWNrZXItLWNlbGxbZGF0YS15ZWFyPVwiJyArIGQueWVhciArICdcIl0nLFxyXG4gICAgICAgICAgICAgICAgJGNlbGw7XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ21vbnRoJzpcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RvciA9ICdbZGF0YS1tb250aD1cIicgKyBkLm1vbnRoICsgJ1wiXSc7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdkYXknOlxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yICs9ICdbZGF0YS1tb250aD1cIicgKyBkLm1vbnRoICsgJ1wiXVtkYXRhLWRhdGU9XCInICsgZC5kYXRlICsgJ1wiXSc7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgJGNlbGwgPSB0aGlzLnZpZXdzW3RoaXMuY3VycmVudFZpZXddLiRlbC5maW5kKHNlbGVjdG9yKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAkY2VsbC5sZW5ndGggPyAkY2VsbCA6ICcnO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICAgICAgX3RoaXMuJGVsXHJcbiAgICAgICAgICAgICAgICAub2ZmKCcuYWRwJylcclxuICAgICAgICAgICAgICAgIC5kYXRhKCdkYXRlcGlja2VyJywgJycpO1xyXG5cclxuICAgICAgICAgICAgX3RoaXMuc2VsZWN0ZWREYXRlcyA9IFtdO1xyXG4gICAgICAgICAgICBfdGhpcy5mb2N1c2VkID0gJyc7XHJcbiAgICAgICAgICAgIF90aGlzLnZpZXdzID0ge307XHJcbiAgICAgICAgICAgIF90aGlzLmtleXMgPSBbXTtcclxuICAgICAgICAgICAgX3RoaXMubWluUmFuZ2UgPSAnJztcclxuICAgICAgICAgICAgX3RoaXMubWF4UmFuZ2UgPSAnJztcclxuXHJcbiAgICAgICAgICAgIGlmIChfdGhpcy5vcHRzLmlubGluZSB8fCAhX3RoaXMuZWxJc0lucHV0KSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy4kZGF0ZXBpY2tlci5jbG9zZXN0KCcuZGF0ZXBpY2tlci1pbmxpbmUnKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLiRkYXRlcGlja2VyLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX29uU2hvd0V2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy52aXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9vbkJsdXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmluRm9jdXMgJiYgdGhpcy52aXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9vbk1vdXNlRG93bkRhdGVwaWNrZXI6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5Gb2N1cyA9IHRydWU7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX29uTW91c2VVcERhdGVwaWNrZXI6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5Gb2N1cyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLiRlbC5mb2N1cygpXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX29uSW5wdXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHZhbCA9IHRoaXMuJGVsLnZhbCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCF2YWwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXIoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9vblJlc2l6ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy52aXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFBvc2l0aW9uKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfb25LZXlEb3duOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB2YXIgY29kZSA9IGUud2hpY2g7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlZ2lzdGVyS2V5KGNvZGUpO1xyXG5cclxuICAgICAgICAgICAgLy8gQXJyb3dzXHJcbiAgICAgICAgICAgIGlmIChjb2RlID49IDM3ICYmIGNvZGUgPD0gNDApIHtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2ZvY3VzTmV4dENlbGwoY29kZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEVudGVyXHJcbiAgICAgICAgICAgIGlmIChjb2RlID09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5mb2N1c2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2dldENlbGwodGhpcy5mb2N1c2VkKS5oYXNDbGFzcygnLWRpc2FibGVkLScpKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudmlldyAhPSB0aGlzLm9wdHMubWluVmlldykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRvd24oKVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhbHJlYWR5U2VsZWN0ZWQgPSB0aGlzLl9pc1NlbGVjdGVkKHRoaXMuZm9jdXNlZCwgdGhpcy5jZWxsVHlwZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWFscmVhZHlTZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3REYXRlKHRoaXMuZm9jdXNlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYWxyZWFkeVNlbGVjdGVkICYmIHRoaXMub3B0cy50b2dnbGVTZWxlY3RlZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZURhdGUodGhpcy5mb2N1c2VkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRXNjXHJcbiAgICAgICAgICAgIGlmIChjb2RlID09IDI3KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9vbktleVVwOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB2YXIgY29kZSA9IGUud2hpY2g7XHJcbiAgICAgICAgICAgIHRoaXMuX3VuUmVnaXN0ZXJLZXkoY29kZSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX29uSG90S2V5OiBmdW5jdGlvbiAoZSwgaG90S2V5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZUhvdEtleShob3RLZXkpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9vbk1vdXNlRW50ZXJDZWxsOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB2YXIgJGNlbGwgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcuZGF0ZXBpY2tlci0tY2VsbCcpLFxyXG4gICAgICAgICAgICAgICAgZGF0ZSA9IHRoaXMuX2dldERhdGVGcm9tQ2VsbCgkY2VsbCk7XHJcblxyXG4gICAgICAgICAgICAvLyBQcmV2ZW50IGZyb20gdW5uZWNlc3NhcnkgcmVuZGVyaW5nIGFuZCBzZXR0aW5nIG5ldyBjdXJyZW50RGF0ZVxyXG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5mb2N1c2VkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZvY3VzZWQgPSAnJ1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAkY2VsbC5hZGRDbGFzcygnLWZvY3VzLScpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5mb2N1c2VkID0gZGF0ZTtcclxuICAgICAgICAgICAgdGhpcy5zaWxlbnQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMucmFuZ2UgJiYgdGhpcy5zZWxlY3RlZERhdGVzLmxlbmd0aCA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1pblJhbmdlID0gdGhpcy5zZWxlY3RlZERhdGVzWzBdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXhSYW5nZSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGVwaWNrZXIubGVzcyh0aGlzLm1pblJhbmdlLCB0aGlzLmZvY3VzZWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXhSYW5nZSA9IHRoaXMubWluUmFuZ2U7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5taW5SYW5nZSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy52aWV3c1t0aGlzLmN1cnJlbnRWaWV3XS5fdXBkYXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfb25Nb3VzZUxlYXZlQ2VsbDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdmFyICRjZWxsID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLmRhdGVwaWNrZXItLWNlbGwnKTtcclxuXHJcbiAgICAgICAgICAgICRjZWxsLnJlbW92ZUNsYXNzKCctZm9jdXMtJyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuZm9jdXNlZCA9ICcnO1xyXG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IGZhbHNlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNldCBmb2N1c2VkKHZhbCkge1xyXG4gICAgICAgICAgICBpZiAoIXZhbCAmJiB0aGlzLmZvY3VzZWQpIHtcclxuICAgICAgICAgICAgICAgIHZhciAkY2VsbCA9IHRoaXMuX2dldENlbGwodGhpcy5mb2N1c2VkKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoJGNlbGwubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGNlbGwucmVtb3ZlQ2xhc3MoJy1mb2N1cy0nKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2ZvY3VzZWQgPSB2YWw7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMucmFuZ2UgJiYgdGhpcy5zZWxlY3RlZERhdGVzLmxlbmd0aCA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1pblJhbmdlID0gdGhpcy5zZWxlY3RlZERhdGVzWzBdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXhSYW5nZSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGVwaWNrZXIubGVzcyh0aGlzLm1pblJhbmdlLCB0aGlzLl9mb2N1c2VkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWF4UmFuZ2UgPSB0aGlzLm1pblJhbmdlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWluUmFuZ2UgPSAnJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5zaWxlbnQpIHJldHVybjtcclxuICAgICAgICAgICAgdGhpcy5kYXRlID0gdmFsO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGdldCBmb2N1c2VkKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZm9jdXNlZDtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBnZXQgcGFyc2VkRGF0ZSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZSh0aGlzLmRhdGUpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNldCBkYXRlICh2YWwpIHtcclxuICAgICAgICAgICAgaWYgKCEodmFsIGluc3RhbmNlb2YgRGF0ZSkpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudERhdGUgPSB2YWw7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5pbml0ZWQgJiYgIXRoaXMuc2lsZW50KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdzW3RoaXMudmlld10uX3JlbmRlcigpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uYXYuX3JlbmRlcigpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudmlzaWJsZSAmJiB0aGlzLmVsSXNJbnB1dCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb24oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdmFsO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGdldCBkYXRlICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudERhdGVcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzZXQgdmlldyAodmFsKSB7XHJcbiAgICAgICAgICAgIHRoaXMudmlld0luZGV4ID0gdGhpcy52aWV3SW5kZXhlcy5pbmRleE9mKHZhbCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy52aWV3SW5kZXggPCAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMucHJldlZpZXcgPSB0aGlzLmN1cnJlbnRWaWV3O1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gdmFsO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuaW5pdGVkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMudmlld3NbdmFsXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlld3NbdmFsXSA9IG5ldyBEYXRlcGlja2VyLkJvZHkodGhpcywgdmFsLCB0aGlzLm9wdHMpXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlld3NbdmFsXS5fcmVuZGVyKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy52aWV3c1t0aGlzLnByZXZWaWV3XS5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdzW3ZhbF0uc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uYXYuX3JlbmRlcigpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdHMub25DaGFuZ2VWaWV3KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRzLm9uQ2hhbmdlVmlldyh2YWwpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5lbElzSW5wdXQgJiYgdGhpcy52aXNpYmxlKSB0aGlzLnNldFBvc2l0aW9uKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB2YWxcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBnZXQgdmlldygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFZpZXc7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZ2V0IGNlbGxUeXBlKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy52aWV3LnN1YnN0cmluZygwLCB0aGlzLnZpZXcubGVuZ3RoIC0gMSlcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBnZXQgbWluVGltZSgpIHtcclxuICAgICAgICAgICAgdmFyIG1pbiA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZSh0aGlzLm1pbkRhdGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUobWluLnllYXIsIG1pbi5tb250aCwgbWluLmRhdGUpLmdldFRpbWUoKVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGdldCBtYXhUaW1lKCkge1xyXG4gICAgICAgICAgICB2YXIgbWF4ID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKHRoaXMubWF4RGF0ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZShtYXgueWVhciwgbWF4Lm1vbnRoLCBtYXguZGF0ZSkuZ2V0VGltZSgpXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZ2V0IGN1ckRlY2FkZSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGRhdGVwaWNrZXIuZ2V0RGVjYWRlKHRoaXMuZGF0ZSlcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vICBVdGlsc1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGRhdGVwaWNrZXIuZ2V0RGF5c0NvdW50ID0gZnVuY3Rpb24gKGRhdGUpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCkgKyAxLCAwKS5nZXREYXRlKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZSA9IGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgeWVhcjogZGF0ZS5nZXRGdWxsWWVhcigpLFxyXG4gICAgICAgICAgICBtb250aDogZGF0ZS5nZXRNb250aCgpLFxyXG4gICAgICAgICAgICBmdWxsTW9udGg6IChkYXRlLmdldE1vbnRoKCkgKyAxKSA8IDEwID8gJzAnICsgKGRhdGUuZ2V0TW9udGgoKSArIDEpIDogZGF0ZS5nZXRNb250aCgpICsgMSwgLy8gT25lIGJhc2VkXHJcbiAgICAgICAgICAgIGRhdGU6IGRhdGUuZ2V0RGF0ZSgpLFxyXG4gICAgICAgICAgICBmdWxsRGF0ZTogZGF0ZS5nZXREYXRlKCkgPCAxMCA/ICcwJyArIGRhdGUuZ2V0RGF0ZSgpIDogZGF0ZS5nZXREYXRlKCksXHJcbiAgICAgICAgICAgIGRheTogZGF0ZS5nZXREYXkoKVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgZGF0ZXBpY2tlci5nZXREZWNhZGUgPSBmdW5jdGlvbiAoZGF0ZSkge1xyXG4gICAgICAgIHZhciBmaXJzdFllYXIgPSBNYXRoLmZsb29yKGRhdGUuZ2V0RnVsbFllYXIoKSAvIDEwKSAqIDEwO1xyXG5cclxuICAgICAgICByZXR1cm4gW2ZpcnN0WWVhciwgZmlyc3RZZWFyICsgOV07XHJcbiAgICB9O1xyXG5cclxuICAgIGRhdGVwaWNrZXIudGVtcGxhdGUgPSBmdW5jdGlvbiAoc3RyLCBkYXRhKSB7XHJcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8jXFx7KFtcXHddKylcXH0vZywgZnVuY3Rpb24gKHNvdXJjZSwgbWF0Y2gpIHtcclxuICAgICAgICAgICAgaWYgKGRhdGFbbWF0Y2hdIHx8IGRhdGFbbWF0Y2hdID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0YVttYXRjaF1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBkYXRlcGlja2VyLmlzU2FtZSA9IGZ1bmN0aW9uIChkYXRlMSwgZGF0ZTIsIHR5cGUpIHtcclxuICAgICAgICBpZiAoIWRhdGUxIHx8ICFkYXRlMikgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIHZhciBkMSA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZShkYXRlMSksXHJcbiAgICAgICAgICAgIGQyID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKGRhdGUyKSxcclxuICAgICAgICAgICAgX3R5cGUgPSB0eXBlID8gdHlwZSA6ICdkYXknLFxyXG5cclxuICAgICAgICAgICAgY29uZGl0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgIGRheTogZDEuZGF0ZSA9PSBkMi5kYXRlICYmIGQxLm1vbnRoID09IGQyLm1vbnRoICYmIGQxLnllYXIgPT0gZDIueWVhcixcclxuICAgICAgICAgICAgICAgIG1vbnRoOiBkMS5tb250aCA9PSBkMi5tb250aCAmJiBkMS55ZWFyID09IGQyLnllYXIsXHJcbiAgICAgICAgICAgICAgICB5ZWFyOiBkMS55ZWFyID09IGQyLnllYXJcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNvbmRpdGlvbnNbX3R5cGVdO1xyXG4gICAgfTtcclxuXHJcbiAgICBkYXRlcGlja2VyLmxlc3MgPSBmdW5jdGlvbiAoZGF0ZUNvbXBhcmVUbywgZGF0ZSwgdHlwZSkge1xyXG4gICAgICAgIGlmICghZGF0ZUNvbXBhcmVUbyB8fCAhZGF0ZSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIHJldHVybiBkYXRlLmdldFRpbWUoKSA8IGRhdGVDb21wYXJlVG8uZ2V0VGltZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICBkYXRlcGlja2VyLmJpZ2dlciA9IGZ1bmN0aW9uIChkYXRlQ29tcGFyZVRvLCBkYXRlLCB0eXBlKSB7XHJcbiAgICAgICAgaWYgKCFkYXRlQ29tcGFyZVRvIHx8ICFkYXRlKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIGRhdGUuZ2V0VGltZSgpID4gZGF0ZUNvbXBhcmVUby5nZXRUaW1lKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIERhdGVwaWNrZXIubGFuZ3VhZ2UgPSB7XHJcbiAgICAgICAgcnU6IHtcclxuICAgICAgICAgICAgZGF5czogWyfQktC+0YHQutGA0LXRgdC10L3RjNC1JywgJ9Cf0L7QvdC10LTQtdC70YzQvdC40LonLCAn0JLRgtC+0YDQvdC40LonLCAn0KHRgNC10LTQsCcsICfQp9C10YLQstC10YDQsycsICfQn9GP0YLQvdC40YbQsCcsICfQodGD0LHQsdC+0YLQsCddLFxyXG4gICAgICAgICAgICBkYXlzU2hvcnQ6IFsn0JLQvtGBJywn0J/QvtC9Jywn0JLRgtC+Jywn0KHRgNC1Jywn0KfQtdGCJywn0J/Rj9GCJywn0KHRg9CxJ10sXHJcbiAgICAgICAgICAgIGRheXNNaW46IFsn0JLRgScsJ9Cf0L0nLCfQktGCJywn0KHRgCcsJ9Cn0YInLCfQn9GCJywn0KHQsSddLFxyXG4gICAgICAgICAgICBtb250aHM6IFsn0K/QvdCy0LDRgNGMJywgJ9Ck0LXQstGA0LDQu9GMJywgJ9Cc0LDRgNGCJywgJ9CQ0L/RgNC10LvRjCcsICfQnNCw0LknLCAn0JjRjtC90YwnLCAn0JjRjtC70YwnLCAn0JDQstCz0YPRgdGCJywgJ9Ch0LXQvdGC0Y/QsdGA0YwnLCAn0J7QutGC0Y/QsdGA0YwnLCAn0J3QvtGP0LHRgNGMJywgJ9CU0LXQutCw0LHRgNGMJ10sXHJcbiAgICAgICAgICAgIG1vbnRoc1Nob3J0OiBbJ9Cv0L3QsicsICfQpNC10LInLCAn0JzQsNGAJywgJ9CQ0L/RgCcsICfQnNCw0LknLCAn0JjRjtC9JywgJ9CY0Y7QuycsICfQkNCy0LMnLCAn0KHQtdC9JywgJ9Ce0LrRgicsICfQndC+0Y8nLCAn0JTQtdC6J10sXHJcbiAgICAgICAgICAgIHRvZGF5OiAn0KHQtdCz0L7QtNC90Y8nLFxyXG4gICAgICAgICAgICBjbGVhcjogJ9Ce0YfQuNGB0YLQuNGC0YwnLFxyXG4gICAgICAgICAgICBkYXRlRm9ybWF0OiAnZGQubW0ueXl5eScsXHJcbiAgICAgICAgICAgIGZpcnN0RGF5OiAxXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAkLmZuW3BsdWdpbk5hbWVdID0gZnVuY3Rpb24gKCBvcHRpb25zICkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoISQuZGF0YSh0aGlzLCBwbHVnaW5OYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgJC5kYXRhKHRoaXMsICBwbHVnaW5OYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlcGlja2VyKCB0aGlzLCBvcHRpb25zICkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFyIF90aGlzID0gJC5kYXRhKHRoaXMsIHBsdWdpbk5hbWUpO1xyXG5cclxuICAgICAgICAgICAgICAgIF90aGlzLm9wdHMgPSAkLmV4dGVuZCh0cnVlLCBfdGhpcy5vcHRzLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIF90aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgICQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICQoYXV0b0luaXRTZWxlY3RvcikuZGF0ZXBpY2tlcigpO1xyXG4gICAgfSlcclxuXHJcbn0pKHdpbmRvdywgalF1ZXJ5KTtcclxuOyhmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgdGVtcGxhdGVzID0ge1xyXG4gICAgICAgIGRheXM6JycgK1xyXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tZGF5cyBkYXRlcGlja2VyLS1ib2R5XCI+JyArXHJcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1kYXlzLW5hbWVzXCI+PC9kaXY+JyArXHJcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1jZWxscyBkYXRlcGlja2VyLS1jZWxscy1kYXlzXCI+PC9kaXY+JyArXHJcbiAgICAgICAgJzwvZGl2PicsXHJcbiAgICAgICAgbW9udGhzOiAnJyArXHJcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1tb250aHMgZGF0ZXBpY2tlci0tYm9keVwiPicgK1xyXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tY2VsbHMgZGF0ZXBpY2tlci0tY2VsbHMtbW9udGhzXCI+PC9kaXY+JyArXHJcbiAgICAgICAgJzwvZGl2PicsXHJcbiAgICAgICAgeWVhcnM6ICcnICtcclxuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLXllYXJzIGRhdGVwaWNrZXItLWJvZHlcIj4nICtcclxuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLWNlbGxzIGRhdGVwaWNrZXItLWNlbGxzLXllYXJzXCI+PC9kaXY+JyArXHJcbiAgICAgICAgJzwvZGl2PidcclxuICAgICAgICB9LFxyXG4gICAgICAgIEQgPSBEYXRlcGlja2VyO1xyXG5cclxuICAgIEQuQm9keSA9IGZ1bmN0aW9uIChkLCB0eXBlLCBvcHRzKSB7XHJcbiAgICAgICAgdGhpcy5kID0gZDtcclxuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xyXG4gICAgICAgIHRoaXMub3B0cyA9IG9wdHM7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfTtcclxuXHJcbiAgICBELkJvZHkucHJvdG90eXBlID0ge1xyXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5fYnVpbGRCYXNlSHRtbCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9yZW5kZXIoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2JpbmRFdmVudHMoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfYmluZEV2ZW50czogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRlbC5vbignY2xpY2snLCAnLmRhdGVwaWNrZXItLWNlbGwnLCAkLnByb3h5KHRoaXMuX29uQ2xpY2tDZWxsLCB0aGlzKSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2J1aWxkQmFzZUh0bWw6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy4kZWwgPSAkKHRlbXBsYXRlc1t0aGlzLnR5cGVdKS5hcHBlbmRUbyh0aGlzLmQuJGNvbnRlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLiRuYW1lcyA9ICQoJy5kYXRlcGlja2VyLS1kYXlzLW5hbWVzJywgdGhpcy4kZWwpO1xyXG4gICAgICAgICAgICB0aGlzLiRjZWxscyA9ICQoJy5kYXRlcGlja2VyLS1jZWxscycsIHRoaXMuJGVsKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfZ2V0RGF5TmFtZXNIdG1sOiBmdW5jdGlvbiAoZmlyc3REYXksIGN1ckRheSwgaHRtbCwgaSkge1xyXG4gICAgICAgICAgICBjdXJEYXkgPSBjdXJEYXkgIT0gdW5kZWZpbmVkID8gY3VyRGF5IDogZmlyc3REYXk7XHJcbiAgICAgICAgICAgIGh0bWwgPSBodG1sID8gaHRtbCA6ICcnO1xyXG4gICAgICAgICAgICBpID0gaSAhPSB1bmRlZmluZWQgPyBpIDogMDtcclxuXHJcbiAgICAgICAgICAgIGlmIChpID4gNykgcmV0dXJuIGh0bWw7XHJcbiAgICAgICAgICAgIGlmIChjdXJEYXkgPT0gNykgcmV0dXJuIHRoaXMuX2dldERheU5hbWVzSHRtbChmaXJzdERheSwgMCwgaHRtbCwgKytpKTtcclxuXHJcbiAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1kYXktbmFtZScgKyAodGhpcy5kLmlzV2Vla2VuZChjdXJEYXkpID8gXCIgLXdlZWtlbmQtXCIgOiBcIlwiKSArICdcIj4nICsgdGhpcy5kLmxvYy5kYXlzTWluW2N1ckRheV0gKyAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXREYXlOYW1lc0h0bWwoZmlyc3REYXksICsrY3VyRGF5LCBodG1sLCArK2kpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9nZXRDZWxsQ29udGVudHM6IGZ1bmN0aW9uIChkYXRlLCB0eXBlKSB7XHJcbiAgICAgICAgICAgIHZhciBjbGFzc2VzID0gXCJkYXRlcGlja2VyLS1jZWxsIGRhdGVwaWNrZXItLWNlbGwtXCIgKyB0eXBlLFxyXG4gICAgICAgICAgICAgICAgY3VycmVudERhdGUgPSBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgICAgICAgcGFyZW50ID0gdGhpcy5kLFxyXG4gICAgICAgICAgICAgICAgb3B0cyA9IHBhcmVudC5vcHRzLFxyXG4gICAgICAgICAgICAgICAgZCA9IEQuZ2V0UGFyc2VkRGF0ZShkYXRlKSxcclxuICAgICAgICAgICAgICAgIHJlbmRlciA9IHt9LFxyXG4gICAgICAgICAgICAgICAgaHRtbCA9IGQuZGF0ZTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvcHRzLm9uUmVuZGVyQ2VsbCkge1xyXG4gICAgICAgICAgICAgICAgcmVuZGVyID0gb3B0cy5vblJlbmRlckNlbGwoZGF0ZSwgdHlwZSkgfHwge307XHJcbiAgICAgICAgICAgICAgICBodG1sID0gcmVuZGVyLmh0bWwgPyByZW5kZXIuaHRtbCA6IGh0bWw7XHJcbiAgICAgICAgICAgICAgICBjbGFzc2VzICs9IHJlbmRlci5jbGFzc2VzID8gJyAnICsgcmVuZGVyLmNsYXNzZXMgOiAnJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdkYXknOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJlbnQuaXNXZWVrZW5kKGQuZGF5KSkgY2xhc3NlcyArPSBcIiAtd2Vla2VuZC1cIjtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZC5tb250aCAhPSB0aGlzLmQucGFyc2VkRGF0ZS5tb250aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzICs9IFwiIC1vdGhlci1tb250aC1cIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFvcHRzLnNlbGVjdE90aGVyTW9udGhzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzICs9IFwiIC1kaXNhYmxlZC1cIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW9wdHMuc2hvd090aGVyTW9udGhzKSBodG1sID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbW9udGgnOlxyXG4gICAgICAgICAgICAgICAgICAgIGh0bWwgPSBwYXJlbnQubG9jW3BhcmVudC5vcHRzLm1vbnRoc0ZpZWxkXVtkLm1vbnRoXTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3llYXInOlxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkZWNhZGUgPSBwYXJlbnQuY3VyRGVjYWRlO1xyXG4gICAgICAgICAgICAgICAgICAgIGh0bWwgPSBkLnllYXI7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGQueWVhciA8IGRlY2FkZVswXSB8fCBkLnllYXIgPiBkZWNhZGVbMV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NlcyArPSAnIC1vdGhlci1kZWNhZGUtJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFvcHRzLnNlbGVjdE90aGVyWWVhcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gXCIgLWRpc2FibGVkLVwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghb3B0cy5zaG93T3RoZXJZZWFycykgaHRtbCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKG9wdHMub25SZW5kZXJDZWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZW5kZXIgPSBvcHRzLm9uUmVuZGVyQ2VsbChkYXRlLCB0eXBlKSB8fCB7fTtcclxuICAgICAgICAgICAgICAgIGh0bWwgPSByZW5kZXIuaHRtbCA/IHJlbmRlci5odG1sIDogaHRtbDtcclxuICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gcmVuZGVyLmNsYXNzZXMgPyAnICcgKyByZW5kZXIuY2xhc3NlcyA6ICcnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAob3B0cy5yYW5nZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKEQuaXNTYW1lKHBhcmVudC5taW5SYW5nZSwgZGF0ZSwgdHlwZSkpIGNsYXNzZXMgKz0gJyAtcmFuZ2UtZnJvbS0nO1xyXG4gICAgICAgICAgICAgICAgaWYgKEQuaXNTYW1lKHBhcmVudC5tYXhSYW5nZSwgZGF0ZSwgdHlwZSkpIGNsYXNzZXMgKz0gJyAtcmFuZ2UtdG8tJztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocGFyZW50LnNlbGVjdGVkRGF0ZXMubGVuZ3RoID09IDEgJiYgcGFyZW50LmZvY3VzZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChELmJpZ2dlcihwYXJlbnQubWluUmFuZ2UsIGRhdGUpICYmIEQubGVzcyhwYXJlbnQuZm9jdXNlZCwgZGF0ZSkpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChELmxlc3MocGFyZW50Lm1heFJhbmdlLCBkYXRlKSAmJiBELmJpZ2dlcihwYXJlbnQuZm9jdXNlZCwgZGF0ZSkpKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NlcyArPSAnIC1pbi1yYW5nZS0nXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoRC5sZXNzKHBhcmVudC5tYXhSYW5nZSwgZGF0ZSkgJiYgRC5pc1NhbWUocGFyZW50LmZvY3VzZWQsIGRhdGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gJyAtcmFuZ2UtZnJvbS0nXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChELmJpZ2dlcihwYXJlbnQubWluUmFuZ2UsIGRhdGUpICYmIEQuaXNTYW1lKHBhcmVudC5mb2N1c2VkLCBkYXRlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzICs9ICcgLXJhbmdlLXRvLSdcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJlbnQuc2VsZWN0ZWREYXRlcy5sZW5ndGggPT0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChELmJpZ2dlcihwYXJlbnQubWluUmFuZ2UsIGRhdGUpICYmIEQubGVzcyhwYXJlbnQubWF4UmFuZ2UsIGRhdGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gJyAtaW4tcmFuZ2UtJ1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgIGlmIChELmlzU2FtZShjdXJyZW50RGF0ZSwgZGF0ZSwgdHlwZSkpIGNsYXNzZXMgKz0gJyAtY3VycmVudC0nO1xyXG4gICAgICAgICAgICBpZiAocGFyZW50LmZvY3VzZWQgJiYgRC5pc1NhbWUoZGF0ZSwgcGFyZW50LmZvY3VzZWQsIHR5cGUpKSBjbGFzc2VzICs9ICcgLWZvY3VzLSc7XHJcbiAgICAgICAgICAgIGlmIChwYXJlbnQuX2lzU2VsZWN0ZWQoZGF0ZSwgdHlwZSkpIGNsYXNzZXMgKz0gJyAtc2VsZWN0ZWQtJztcclxuICAgICAgICAgICAgaWYgKCFwYXJlbnQuX2lzSW5SYW5nZShkYXRlLCB0eXBlKSB8fCByZW5kZXIuZGlzYWJsZWQpIGNsYXNzZXMgKz0gJyAtZGlzYWJsZWQtJztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBodG1sOiBodG1sLFxyXG4gICAgICAgICAgICAgICAgY2xhc3NlczogY2xhc3Nlc1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2FsY3VsYXRlcyBkYXlzIG51bWJlciB0byByZW5kZXIuIEdlbmVyYXRlcyBkYXlzIGh0bWwgYW5kIHJldHVybnMgaXQuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGRhdGUgLSBEYXRlIG9iamVjdFxyXG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBfZ2V0RGF5c0h0bWw6IGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgICAgIHZhciB0b3RhbE1vbnRoRGF5cyA9IEQuZ2V0RGF5c0NvdW50KGRhdGUpLFxyXG4gICAgICAgICAgICAgICAgZmlyc3RNb250aERheSA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCAxKS5nZXREYXkoKSxcclxuICAgICAgICAgICAgICAgIGxhc3RNb250aERheSA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCB0b3RhbE1vbnRoRGF5cykuZ2V0RGF5KCksXHJcbiAgICAgICAgICAgICAgICBkYXlzRnJvbVBldk1vbnRoID0gZmlyc3RNb250aERheSAtIHRoaXMuZC5sb2MuZmlyc3REYXksXHJcbiAgICAgICAgICAgICAgICBkYXlzRnJvbU5leHRNb250aCA9IDYgLSBsYXN0TW9udGhEYXkgKyB0aGlzLmQubG9jLmZpcnN0RGF5O1xyXG5cclxuICAgICAgICAgICAgZGF5c0Zyb21QZXZNb250aCA9IGRheXNGcm9tUGV2TW9udGggPCAwID8gZGF5c0Zyb21QZXZNb250aCArIDcgOiBkYXlzRnJvbVBldk1vbnRoO1xyXG4gICAgICAgICAgICBkYXlzRnJvbU5leHRNb250aCA9IGRheXNGcm9tTmV4dE1vbnRoID4gNiA/IGRheXNGcm9tTmV4dE1vbnRoIC0gNyA6IGRheXNGcm9tTmV4dE1vbnRoO1xyXG5cclxuICAgICAgICAgICAgdmFyIHN0YXJ0RGF5SW5kZXggPSAtZGF5c0Zyb21QZXZNb250aCArIDEsXHJcbiAgICAgICAgICAgICAgICBtLCB5LFxyXG4gICAgICAgICAgICAgICAgaHRtbCA9ICcnO1xyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IHN0YXJ0RGF5SW5kZXgsIG1heCA9IHRvdGFsTW9udGhEYXlzICsgZGF5c0Zyb21OZXh0TW9udGg7IGkgPD0gbWF4OyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHkgPSBkYXRlLmdldEZ1bGxZZWFyKCk7XHJcbiAgICAgICAgICAgICAgICBtID0gZGF0ZS5nZXRNb250aCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gdGhpcy5fZ2V0RGF5SHRtbChuZXcgRGF0ZSh5LCBtLCBpKSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGh0bWw7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2dldERheUh0bWw6IGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgICAgdmFyIGNvbnRlbnQgPSB0aGlzLl9nZXRDZWxsQ29udGVudHMoZGF0ZSwgJ2RheScpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiJyArIGNvbnRlbnQuY2xhc3NlcyArICdcIiAnICtcclxuICAgICAgICAgICAgICAgICdkYXRhLWRhdGU9XCInICsgZGF0ZS5nZXREYXRlKCkgKyAnXCIgJyArXHJcbiAgICAgICAgICAgICAgICAnZGF0YS1tb250aD1cIicgKyBkYXRlLmdldE1vbnRoKCkgKyAnXCIgJyArXHJcbiAgICAgICAgICAgICAgICAnZGF0YS15ZWFyPVwiJyArIGRhdGUuZ2V0RnVsbFllYXIoKSArICdcIj4nICsgY29udGVudC5odG1sICsgJzwvZGl2Pic7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR2VuZXJhdGVzIG1vbnRocyBodG1sXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGRhdGUgLSBkYXRlIGluc3RhbmNlXHJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIF9nZXRNb250aHNIdG1sOiBmdW5jdGlvbiAoZGF0ZSkge1xyXG4gICAgICAgICAgICB2YXIgaHRtbCA9ICcnLFxyXG4gICAgICAgICAgICAgICAgZCA9IEQuZ2V0UGFyc2VkRGF0ZShkYXRlKSxcclxuICAgICAgICAgICAgICAgIGkgPSAwO1xyXG5cclxuICAgICAgICAgICAgd2hpbGUoaSA8IDEyKSB7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IHRoaXMuX2dldE1vbnRoSHRtbChuZXcgRGF0ZShkLnllYXIsIGkpKTtcclxuICAgICAgICAgICAgICAgIGkrK1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gaHRtbDtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfZ2V0TW9udGhIdG1sOiBmdW5jdGlvbiAoZGF0ZSkge1xyXG4gICAgICAgICAgICB2YXIgY29udGVudCA9IHRoaXMuX2dldENlbGxDb250ZW50cyhkYXRlLCAnbW9udGgnKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cIicgKyBjb250ZW50LmNsYXNzZXMgKyAnXCIgZGF0YS1tb250aD1cIicgKyBkYXRlLmdldE1vbnRoKCkgKyAnXCI+JyArIGNvbnRlbnQuaHRtbCArICc8L2Rpdj4nXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2dldFllYXJzSHRtbDogZnVuY3Rpb24gKGRhdGUpIHtcclxuICAgICAgICAgICAgdmFyIGQgPSBELmdldFBhcnNlZERhdGUoZGF0ZSksXHJcbiAgICAgICAgICAgICAgICBkZWNhZGUgPSBELmdldERlY2FkZShkYXRlKSxcclxuICAgICAgICAgICAgICAgIGZpcnN0WWVhciA9IGRlY2FkZVswXSAtIDEsXHJcbiAgICAgICAgICAgICAgICBodG1sID0gJycsXHJcbiAgICAgICAgICAgICAgICBpID0gZmlyc3RZZWFyO1xyXG5cclxuICAgICAgICAgICAgZm9yIChpOyBpIDw9IGRlY2FkZVsxXSArIDE7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSB0aGlzLl9nZXRZZWFySHRtbChuZXcgRGF0ZShpICwgMCkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gaHRtbDtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfZ2V0WWVhckh0bWw6IGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gdGhpcy5fZ2V0Q2VsbENvbnRlbnRzKGRhdGUsICd5ZWFyJyk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCInICsgY29udGVudC5jbGFzc2VzICsgJ1wiIGRhdGEteWVhcj1cIicgKyBkYXRlLmdldEZ1bGxZZWFyKCkgKyAnXCI+JyArIGNvbnRlbnQuaHRtbCArICc8L2Rpdj4nXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX3JlbmRlclR5cGVzOiB7XHJcbiAgICAgICAgICAgIGRheXM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkYXlOYW1lcyA9IHRoaXMuX2dldERheU5hbWVzSHRtbCh0aGlzLmQubG9jLmZpcnN0RGF5KSxcclxuICAgICAgICAgICAgICAgICAgICBkYXlzID0gdGhpcy5fZ2V0RGF5c0h0bWwodGhpcy5kLmN1cnJlbnREYXRlKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLiRjZWxscy5odG1sKGRheXMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kbmFtZXMuaHRtbChkYXlOYW1lcylcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbW9udGhzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IHRoaXMuX2dldE1vbnRoc0h0bWwodGhpcy5kLmN1cnJlbnREYXRlKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLiRjZWxscy5odG1sKGh0bWwpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHllYXJzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IHRoaXMuX2dldFllYXJzSHRtbCh0aGlzLmQuY3VycmVudERhdGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuJGNlbGxzLmh0bWwoaHRtbClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9yZW5kZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVuZGVyVHlwZXNbdGhpcy50eXBlXS5iaW5kKHRoaXMpKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX3VwZGF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgJGNlbGxzID0gJCgnLmRhdGVwaWNrZXItLWNlbGwnLCB0aGlzLiRjZWxscyksXHJcbiAgICAgICAgICAgICAgICBfdGhpcyA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBjbGFzc2VzLFxyXG4gICAgICAgICAgICAgICAgJGNlbGwsXHJcbiAgICAgICAgICAgICAgICBkYXRlO1xyXG4gICAgICAgICAgICAkY2VsbHMuZWFjaChmdW5jdGlvbiAoY2VsbCwgaSkge1xyXG4gICAgICAgICAgICAgICAgJGNlbGwgPSAkKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgZGF0ZSA9IF90aGlzLmQuX2dldERhdGVGcm9tQ2VsbCgkKHRoaXMpKTtcclxuICAgICAgICAgICAgICAgIGNsYXNzZXMgPSBfdGhpcy5fZ2V0Q2VsbENvbnRlbnRzKGRhdGUsIF90aGlzLmQuY2VsbFR5cGUpO1xyXG4gICAgICAgICAgICAgICAgJGNlbGwuYXR0cignY2xhc3MnLGNsYXNzZXMuY2xhc3NlcylcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2hvdzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRlbC5hZGRDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIHRoaXMuYWNpdHZlID0gdHJ1ZTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBoaWRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICAvLyAgRXZlbnRzXHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICBfaGFuZGxlQ2xpY2s6IGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICAgICAgICB2YXIgZGF0ZSA9IGVsLmRhdGEoJ2RhdGUnKSB8fCAxLFxyXG4gICAgICAgICAgICAgICAgbW9udGggPSBlbC5kYXRhKCdtb250aCcpIHx8IDAsXHJcbiAgICAgICAgICAgICAgICB5ZWFyID0gZWwuZGF0YSgneWVhcicpIHx8IHRoaXMuZC5wYXJzZWREYXRlLnllYXI7XHJcbiAgICAgICAgICAgIC8vIENoYW5nZSB2aWV3IGlmIG1pbiB2aWV3IGRvZXMgbm90IHJlYWNoIHlldFxyXG4gICAgICAgICAgICBpZiAodGhpcy5kLnZpZXcgIT0gdGhpcy5vcHRzLm1pblZpZXcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZC5kb3duKG5ldyBEYXRlKHllYXIsIG1vbnRoLCBkYXRlKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gU2VsZWN0IGRhdGUgaWYgbWluIHZpZXcgaXMgcmVhY2hlZFxyXG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWREYXRlID0gbmV3IERhdGUoeWVhciwgbW9udGgsIGRhdGUpLFxyXG4gICAgICAgICAgICAgICAgYWxyZWFkeVNlbGVjdGVkID0gdGhpcy5kLl9pc1NlbGVjdGVkKHNlbGVjdGVkRGF0ZSwgdGhpcy5kLmNlbGxUeXBlKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghYWxyZWFkeVNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmQuc2VsZWN0RGF0ZShzZWxlY3RlZERhdGUpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFscmVhZHlTZWxlY3RlZCAmJiB0aGlzLm9wdHMudG9nZ2xlU2VsZWN0ZWQpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kLnJlbW92ZURhdGUoc2VsZWN0ZWREYXRlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfb25DbGlja0NlbGw6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciAkZWwgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcuZGF0ZXBpY2tlci0tY2VsbCcpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCRlbC5oYXNDbGFzcygnLWRpc2FibGVkLScpKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9oYW5kbGVDbGljay5iaW5kKHRoaXMpKCRlbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSkoKTtcclxuXHJcbjsoZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHRlbXBsYXRlID0gJycgK1xyXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tbmF2LWFjdGlvblwiIGRhdGEtYWN0aW9uPVwicHJldlwiPiN7cHJldkh0bWx9PC9kaXY+JyArXHJcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1uYXYtdGl0bGVcIj4je3RpdGxlfTwvZGl2PicgK1xyXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tbmF2LWFjdGlvblwiIGRhdGEtYWN0aW9uPVwibmV4dFwiPiN7bmV4dEh0bWx9PC9kaXY+JyxcclxuICAgICAgICBidXR0b25zQ29udGFpbmVyVGVtcGxhdGUgPSAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLWJ1dHRvbnNcIj48L2Rpdj4nLFxyXG4gICAgICAgIGJ1dHRvbiA9ICc8c3BhbiBjbGFzcz1cImRhdGVwaWNrZXItLWJ1dHRvblwiIGRhdGEtYWN0aW9uPVwiI3thY3Rpb259XCI+I3tsYWJlbH08L3NwYW4+JztcclxuXHJcbiAgICBEYXRlcGlja2VyLk5hdmlnYXRpb24gPSBmdW5jdGlvbiAoZCwgb3B0cykge1xyXG4gICAgICAgIHRoaXMuZCA9IGQ7XHJcbiAgICAgICAgdGhpcy5vcHRzID0gb3B0cztcclxuXHJcbiAgICAgICAgdGhpcy4kYnV0dG9uc0NvbnRhaW5lciA9ICcnO1xyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgIH07XHJcblxyXG4gICAgRGF0ZXBpY2tlci5OYXZpZ2F0aW9uLnByb3RvdHlwZSA9IHtcclxuICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2J1aWxkQmFzZUh0bWwoKTtcclxuICAgICAgICAgICAgdGhpcy5fYmluZEV2ZW50cygpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9iaW5kRXZlbnRzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZC4kbmF2Lm9uKCdjbGljaycsICcuZGF0ZXBpY2tlci0tbmF2LWFjdGlvbicsICQucHJveHkodGhpcy5fb25DbGlja05hdkJ1dHRvbiwgdGhpcykpO1xyXG4gICAgICAgICAgICB0aGlzLmQuJG5hdi5vbignY2xpY2snLCAnLmRhdGVwaWNrZXItLW5hdi10aXRsZScsICQucHJveHkodGhpcy5fb25DbGlja05hdlRpdGxlLCB0aGlzKSk7XHJcbiAgICAgICAgICAgIHRoaXMuZC4kZGF0ZXBpY2tlci5vbignY2xpY2snLCAnLmRhdGVwaWNrZXItLWJ1dHRvbicsICQucHJveHkodGhpcy5fb25DbGlja05hdkJ1dHRvbiwgdGhpcykpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9idWlsZEJhc2VIdG1sOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcigpO1xyXG4gICAgICAgICAgICB0aGlzLl9hZGRCdXR0b25zSWZOZWVkKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2FkZEJ1dHRvbnNJZk5lZWQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy50b2RheUJ1dHRvbikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkQnV0dG9uKCd0b2RheScpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5jbGVhckJ1dHRvbikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkQnV0dG9uKCdjbGVhcicpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfcmVuZGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aXRsZSA9IHRoaXMuX2dldFRpdGxlKHRoaXMuZC5jdXJyZW50RGF0ZSksXHJcbiAgICAgICAgICAgICAgICBodG1sID0gRGF0ZXBpY2tlci50ZW1wbGF0ZSh0ZW1wbGF0ZSwgJC5leHRlbmQoe3RpdGxlOiB0aXRsZX0sIHRoaXMub3B0cykpO1xyXG4gICAgICAgICAgICB0aGlzLmQuJG5hdi5odG1sKGh0bWwpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kLnZpZXcgPT0gJ3llYXJzJykge1xyXG4gICAgICAgICAgICAgICAgJCgnLmRhdGVwaWNrZXItLW5hdi10aXRsZScsIHRoaXMuZC4kbmF2KS5hZGRDbGFzcygnLWRpc2FibGVkLScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuc2V0TmF2U3RhdHVzKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2dldFRpdGxlOiBmdW5jdGlvbiAoZGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kLmZvcm1hdERhdGUodGhpcy5vcHRzLm5hdlRpdGxlc1t0aGlzLmQudmlld10sIGRhdGUpXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2FkZEJ1dHRvbjogZnVuY3Rpb24gKHR5cGUpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLiRidXR0b25zQ29udGFpbmVyLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkQnV0dG9uc0NvbnRhaW5lcigpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IHR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHRoaXMuZC5sb2NbdHlwZV1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBodG1sID0gRGF0ZXBpY2tlci50ZW1wbGF0ZShidXR0b24sIGRhdGEpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCQoJ1tkYXRhLWFjdGlvbj0nICsgdHlwZSArICddJywgdGhpcy4kYnV0dG9uc0NvbnRhaW5lcikubGVuZ3RoKSByZXR1cm47XHJcbiAgICAgICAgICAgIHRoaXMuJGJ1dHRvbnNDb250YWluZXIuYXBwZW5kKGh0bWwpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9hZGRCdXR0b25zQ29udGFpbmVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZC4kZGF0ZXBpY2tlci5hcHBlbmQoYnV0dG9uc0NvbnRhaW5lclRlbXBsYXRlKTtcclxuICAgICAgICAgICAgdGhpcy4kYnV0dG9uc0NvbnRhaW5lciA9ICQoJy5kYXRlcGlja2VyLS1idXR0b25zJywgdGhpcy5kLiRkYXRlcGlja2VyKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzZXROYXZTdGF0dXM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCEodGhpcy5vcHRzLm1pbkRhdGUgfHwgdGhpcy5vcHRzLm1heERhdGUpIHx8ICF0aGlzLm9wdHMuZGlzYWJsZU5hdldoZW5PdXRPZlJhbmdlKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICB2YXIgZGF0ZSA9IHRoaXMuZC5wYXJzZWREYXRlLFxyXG4gICAgICAgICAgICAgICAgbSA9IGRhdGUubW9udGgsXHJcbiAgICAgICAgICAgICAgICB5ID0gZGF0ZS55ZWFyLFxyXG4gICAgICAgICAgICAgICAgZCA9IGRhdGUuZGF0ZTtcclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy5kLnZpZXcpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2RheXMnOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5kLl9pc0luUmFuZ2UobmV3IERhdGUoeSwgbS0xLCBkKSwgJ21vbnRoJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZU5hdigncHJldicpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5kLl9pc0luUmFuZ2UobmV3IERhdGUoeSwgbSsxLCBkKSwgJ21vbnRoJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZU5hdignbmV4dCcpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbW9udGhzJzpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZC5faXNJblJhbmdlKG5ldyBEYXRlKHktMSwgbSwgZCksICd5ZWFyJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZU5hdigncHJldicpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5kLl9pc0luUmFuZ2UobmV3IERhdGUoeSsxLCBtLCBkKSwgJ3llYXInKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlTmF2KCduZXh0JylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICd5ZWFycyc6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmQuX2lzSW5SYW5nZShuZXcgRGF0ZSh5LTEwLCBtLCBkKSwgJ3llYXInKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlTmF2KCdwcmV2JylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmQuX2lzSW5SYW5nZShuZXcgRGF0ZSh5KzEwLCBtLCBkKSwgJ3llYXInKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlTmF2KCduZXh0JylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfZGlzYWJsZU5hdjogZnVuY3Rpb24gKG5hdikge1xyXG4gICAgICAgICAgICAkKCdbZGF0YS1hY3Rpb249XCInICsgbmF2ICsgJ1wiXScsIHRoaXMuZC4kbmF2KS5hZGRDbGFzcygnLWRpc2FibGVkLScpXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2FjdGl2YXRlTmF2OiBmdW5jdGlvbiAobmF2KSB7XHJcbiAgICAgICAgICAgICQoJ1tkYXRhLWFjdGlvbj1cIicgKyBuYXYgKyAnXCJdJywgdGhpcy5kLiRuYXYpLnJlbW92ZUNsYXNzKCctZGlzYWJsZWQtJylcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfb25DbGlja05hdkJ1dHRvbjogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdmFyICRlbCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ1tkYXRhLWFjdGlvbl0nKSxcclxuICAgICAgICAgICAgICAgIGFjdGlvbiA9ICRlbC5kYXRhKCdhY3Rpb24nKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZFthY3Rpb25dKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX29uQ2xpY2tOYXZUaXRsZTogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgaWYgKCQoZS50YXJnZXQpLmhhc0NsYXNzKCctZGlzYWJsZWQtJykpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmQudmlldyA9PSAnZGF5cycpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmQudmlldyA9ICdtb250aHMnXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuZC52aWV3ID0gJ3llYXJzJztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59KSgpO1xyXG4iLCIhZnVuY3Rpb24oYSxiKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtcImpxdWVyeVwiXSxiKTpcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1iKHJlcXVpcmUoXCJqcXVlcnlcIikpOmIoYS5qUXVlcnkpfSh0aGlzLGZ1bmN0aW9uKGEpe1wiZnVuY3Rpb25cIiE9dHlwZW9mIE9iamVjdC5jcmVhdGUmJihPYmplY3QuY3JlYXRlPWZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoKXt9cmV0dXJuIGIucHJvdG90eXBlPWEsbmV3IGJ9KTt2YXIgYj17aW5pdDpmdW5jdGlvbihiKXtyZXR1cm4gdGhpcy5vcHRpb25zPWEuZXh0ZW5kKHt9LGEubm90eS5kZWZhdWx0cyxiKSx0aGlzLm9wdGlvbnMubGF5b3V0PXRoaXMub3B0aW9ucy5jdXN0b20/YS5ub3R5LmxheW91dHMuaW5saW5lOmEubm90eS5sYXlvdXRzW3RoaXMub3B0aW9ucy5sYXlvdXRdLGEubm90eS50aGVtZXNbdGhpcy5vcHRpb25zLnRoZW1lXT90aGlzLm9wdGlvbnMudGhlbWU9YS5ub3R5LnRoZW1lc1t0aGlzLm9wdGlvbnMudGhlbWVdOnRoaXMub3B0aW9ucy50aGVtZUNsYXNzTmFtZT10aGlzLm9wdGlvbnMudGhlbWUsdGhpcy5vcHRpb25zPWEuZXh0ZW5kKHt9LHRoaXMub3B0aW9ucyx0aGlzLm9wdGlvbnMubGF5b3V0Lm9wdGlvbnMpLHRoaXMub3B0aW9ucy5pZD1cIm5vdHlfXCIrKG5ldyBEYXRlKS5nZXRUaW1lKCkqTWF0aC5mbG9vcigxZTYqTWF0aC5yYW5kb20oKSksdGhpcy5fYnVpbGQoKSx0aGlzfSxfYnVpbGQ6ZnVuY3Rpb24oKXt2YXIgYj1hKCc8ZGl2IGNsYXNzPVwibm90eV9iYXIgbm90eV90eXBlXycrdGhpcy5vcHRpb25zLnR5cGUrJ1wiPjwvZGl2PicpLmF0dHIoXCJpZFwiLHRoaXMub3B0aW9ucy5pZCk7aWYoYi5hcHBlbmQodGhpcy5vcHRpb25zLnRlbXBsYXRlKS5maW5kKFwiLm5vdHlfdGV4dFwiKS5odG1sKHRoaXMub3B0aW9ucy50ZXh0KSx0aGlzLiRiYXI9bnVsbCE9PXRoaXMub3B0aW9ucy5sYXlvdXQucGFyZW50Lm9iamVjdD9hKHRoaXMub3B0aW9ucy5sYXlvdXQucGFyZW50Lm9iamVjdCkuY3NzKHRoaXMub3B0aW9ucy5sYXlvdXQucGFyZW50LmNzcykuYXBwZW5kKGIpOmIsdGhpcy5vcHRpb25zLnRoZW1lQ2xhc3NOYW1lJiZ0aGlzLiRiYXIuYWRkQ2xhc3ModGhpcy5vcHRpb25zLnRoZW1lQ2xhc3NOYW1lKS5hZGRDbGFzcyhcIm5vdHlfY29udGFpbmVyX3R5cGVfXCIrdGhpcy5vcHRpb25zLnR5cGUpLHRoaXMub3B0aW9ucy5idXR0b25zKXt0aGlzLm9wdGlvbnMuY2xvc2VXaXRoPVtdLHRoaXMub3B0aW9ucy50aW1lb3V0PSExO3ZhciBjPWEoXCI8ZGl2Lz5cIikuYWRkQ2xhc3MoXCJub3R5X2J1dHRvbnNcIik7bnVsbCE9PXRoaXMub3B0aW9ucy5sYXlvdXQucGFyZW50Lm9iamVjdD90aGlzLiRiYXIuZmluZChcIi5ub3R5X2JhclwiKS5hcHBlbmQoYyk6dGhpcy4kYmFyLmFwcGVuZChjKTt2YXIgZD10aGlzO2EuZWFjaCh0aGlzLm9wdGlvbnMuYnV0dG9ucyxmdW5jdGlvbihiLGMpe3ZhciBlPWEoXCI8YnV0dG9uLz5cIikuYWRkQ2xhc3MoYy5hZGRDbGFzcz9jLmFkZENsYXNzOlwiZ3JheVwiKS5odG1sKGMudGV4dCkuYXR0cihcImlkXCIsYy5pZD9jLmlkOlwiYnV0dG9uLVwiK2IpLmF0dHIoXCJ0aXRsZVwiLGMudGl0bGUpLmFwcGVuZFRvKGQuJGJhci5maW5kKFwiLm5vdHlfYnV0dG9uc1wiKSkub24oXCJjbGlja1wiLGZ1bmN0aW9uKGIpe2EuaXNGdW5jdGlvbihjLm9uQ2xpY2spJiZjLm9uQ2xpY2suY2FsbChlLGQsYil9KX0pfXRoaXMuJG1lc3NhZ2U9dGhpcy4kYmFyLmZpbmQoXCIubm90eV9tZXNzYWdlXCIpLHRoaXMuJGNsb3NlQnV0dG9uPXRoaXMuJGJhci5maW5kKFwiLm5vdHlfY2xvc2VcIiksdGhpcy4kYnV0dG9ucz10aGlzLiRiYXIuZmluZChcIi5ub3R5X2J1dHRvbnNcIiksYS5ub3R5LnN0b3JlW3RoaXMub3B0aW9ucy5pZF09dGhpc30sc2hvdzpmdW5jdGlvbigpe3ZhciBiPXRoaXM7cmV0dXJuIGIub3B0aW9ucy5jdXN0b20/Yi5vcHRpb25zLmN1c3RvbS5maW5kKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5hcHBlbmQoYi4kYmFyKTphKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5hcHBlbmQoYi4kYmFyKSxiLm9wdGlvbnMudGhlbWUmJmIub3B0aW9ucy50aGVtZS5zdHlsZSYmYi5vcHRpb25zLnRoZW1lLnN0eWxlLmFwcGx5KGIpLFwiZnVuY3Rpb25cIj09PWEudHlwZShiLm9wdGlvbnMubGF5b3V0LmNzcyk/dGhpcy5vcHRpb25zLmxheW91dC5jc3MuYXBwbHkoYi4kYmFyKTpiLiRiYXIuY3NzKHRoaXMub3B0aW9ucy5sYXlvdXQuY3NzfHx7fSksYi4kYmFyLmFkZENsYXNzKGIub3B0aW9ucy5sYXlvdXQuYWRkQ2xhc3MpLGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnN0eWxlLmFwcGx5KGEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLFtiLm9wdGlvbnMud2l0aGluXSksYi5zaG93aW5nPSEwLGIub3B0aW9ucy50aGVtZSYmYi5vcHRpb25zLnRoZW1lLnN0eWxlJiZiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2sub25TaG93LmFwcGx5KHRoaXMpLGEuaW5BcnJheShcImNsaWNrXCIsYi5vcHRpb25zLmNsb3NlV2l0aCk+LTEmJmIuJGJhci5jc3MoXCJjdXJzb3JcIixcInBvaW50ZXJcIikub25lKFwiY2xpY2tcIixmdW5jdGlvbihhKXtiLnN0b3BQcm9wYWdhdGlvbihhKSxiLm9wdGlvbnMuY2FsbGJhY2sub25DbG9zZUNsaWNrJiZiLm9wdGlvbnMuY2FsbGJhY2sub25DbG9zZUNsaWNrLmFwcGx5KGIpLGIuY2xvc2UoKX0pLGEuaW5BcnJheShcImhvdmVyXCIsYi5vcHRpb25zLmNsb3NlV2l0aCk+LTEmJmIuJGJhci5vbmUoXCJtb3VzZWVudGVyXCIsZnVuY3Rpb24oKXtiLmNsb3NlKCl9KSxhLmluQXJyYXkoXCJidXR0b25cIixiLm9wdGlvbnMuY2xvc2VXaXRoKT4tMSYmYi4kY2xvc2VCdXR0b24ub25lKFwiY2xpY2tcIixmdW5jdGlvbihhKXtiLnN0b3BQcm9wYWdhdGlvbihhKSxiLmNsb3NlKCl9KSwtMT09YS5pbkFycmF5KFwiYnV0dG9uXCIsYi5vcHRpb25zLmNsb3NlV2l0aCkmJmIuJGNsb3NlQnV0dG9uLnJlbW92ZSgpLGIub3B0aW9ucy5jYWxsYmFjay5vblNob3cmJmIub3B0aW9ucy5jYWxsYmFjay5vblNob3cuYXBwbHkoYiksXCJzdHJpbmdcIj09dHlwZW9mIGIub3B0aW9ucy5hbmltYXRpb24ub3Blbj8oYi4kYmFyLmNzcyhcImhlaWdodFwiLGIuJGJhci5pbm5lckhlaWdodCgpKSxiLiRiYXIub24oXCJjbGlja1wiLGZ1bmN0aW9uKGEpe2Iud2FzQ2xpY2tlZD0hMH0pLGIuJGJhci5zaG93KCkuYWRkQ2xhc3MoYi5vcHRpb25zLmFuaW1hdGlvbi5vcGVuKS5vbmUoXCJ3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kXCIsZnVuY3Rpb24oKXtiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJTaG93JiZiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJTaG93LmFwcGx5KGIpLGIuc2hvd2luZz0hMSxiLnNob3duPSEwLGIuaGFzT3duUHJvcGVydHkoXCJ3YXNDbGlja2VkXCIpJiYoYi4kYmFyLm9mZihcImNsaWNrXCIsZnVuY3Rpb24oYSl7Yi53YXNDbGlja2VkPSEwfSksYi5jbG9zZSgpKX0pKTpiLiRiYXIuYW5pbWF0ZShiLm9wdGlvbnMuYW5pbWF0aW9uLm9wZW4sYi5vcHRpb25zLmFuaW1hdGlvbi5zcGVlZCxiLm9wdGlvbnMuYW5pbWF0aW9uLmVhc2luZyxmdW5jdGlvbigpe2Iub3B0aW9ucy5jYWxsYmFjay5hZnRlclNob3cmJmIub3B0aW9ucy5jYWxsYmFjay5hZnRlclNob3cuYXBwbHkoYiksYi5zaG93aW5nPSExLGIuc2hvd249ITB9KSxiLm9wdGlvbnMudGltZW91dCYmYi4kYmFyLmRlbGF5KGIub3B0aW9ucy50aW1lb3V0KS5wcm9taXNlKCkuZG9uZShmdW5jdGlvbigpe2IuY2xvc2UoKX0pLHRoaXN9LGNsb3NlOmZ1bmN0aW9uKCl7aWYoISh0aGlzLmNsb3NlZHx8dGhpcy4kYmFyJiZ0aGlzLiRiYXIuaGFzQ2xhc3MoXCJpLWFtLWNsb3Npbmctbm93XCIpKSl7dmFyIGI9dGhpcztpZih0aGlzLnNob3dpbmcpcmV0dXJuIHZvaWQgYi4kYmFyLnF1ZXVlKGZ1bmN0aW9uKCl7Yi5jbG9zZS5hcHBseShiKX0pO2lmKCF0aGlzLnNob3duJiYhdGhpcy5zaG93aW5nKXt2YXIgYz1bXTtyZXR1cm4gYS5lYWNoKGEubm90eS5xdWV1ZSxmdW5jdGlvbihhLGQpe2Qub3B0aW9ucy5pZCE9Yi5vcHRpb25zLmlkJiZjLnB1c2goZCl9KSx2b2lkKGEubm90eS5xdWV1ZT1jKX1iLiRiYXIuYWRkQ2xhc3MoXCJpLWFtLWNsb3Npbmctbm93XCIpLGIub3B0aW9ucy5jYWxsYmFjay5vbkNsb3NlJiZiLm9wdGlvbnMuY2FsbGJhY2sub25DbG9zZS5hcHBseShiKSxcInN0cmluZ1wiPT10eXBlb2YgYi5vcHRpb25zLmFuaW1hdGlvbi5jbG9zZT9iLiRiYXIuYWRkQ2xhc3MoYi5vcHRpb25zLmFuaW1hdGlvbi5jbG9zZSkub25lKFwid2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZFwiLGZ1bmN0aW9uKCl7Yi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyQ2xvc2UmJmIub3B0aW9ucy5jYWxsYmFjay5hZnRlckNsb3NlLmFwcGx5KGIpLGIuY2xvc2VDbGVhblVwKCl9KTpiLiRiYXIuY2xlYXJRdWV1ZSgpLnN0b3AoKS5hbmltYXRlKGIub3B0aW9ucy5hbmltYXRpb24uY2xvc2UsYi5vcHRpb25zLmFuaW1hdGlvbi5zcGVlZCxiLm9wdGlvbnMuYW5pbWF0aW9uLmVhc2luZyxmdW5jdGlvbigpe2Iub3B0aW9ucy5jYWxsYmFjay5hZnRlckNsb3NlJiZiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJDbG9zZS5hcHBseShiKX0pLnByb21pc2UoKS5kb25lKGZ1bmN0aW9uKCl7Yi5jbG9zZUNsZWFuVXAoKX0pfX0sY2xvc2VDbGVhblVwOmZ1bmN0aW9uKCl7dmFyIGI9dGhpcztiLm9wdGlvbnMubW9kYWwmJihhLm5vdHlSZW5kZXJlci5zZXRNb2RhbENvdW50KC0xKSwwPT1hLm5vdHlSZW5kZXJlci5nZXRNb2RhbENvdW50KCkmJmEoXCIubm90eV9tb2RhbFwiKS5mYWRlT3V0KGIub3B0aW9ucy5hbmltYXRpb24uZmFkZVNwZWVkLGZ1bmN0aW9uKCl7YSh0aGlzKS5yZW1vdmUoKX0pKSxhLm5vdHlSZW5kZXJlci5zZXRMYXlvdXRDb3VudEZvcihiLC0xKSwwPT1hLm5vdHlSZW5kZXJlci5nZXRMYXlvdXRDb3VudEZvcihiKSYmYShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikucmVtb3ZlKCksXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGIuJGJhciYmbnVsbCE9PWIuJGJhciYmKFwic3RyaW5nXCI9PXR5cGVvZiBiLm9wdGlvbnMuYW5pbWF0aW9uLmNsb3NlPyhiLiRiYXIuY3NzKFwidHJhbnNpdGlvblwiLFwiYWxsIDEwMG1zIGVhc2VcIikuY3NzKFwiYm9yZGVyXCIsMCkuY3NzKFwibWFyZ2luXCIsMCkuaGVpZ2h0KDApLGIuJGJhci5vbmUoXCJ0cmFuc2l0aW9uZW5kIHdlYmtpdFRyYW5zaXRpb25FbmQgb1RyYW5zaXRpb25FbmQgTVNUcmFuc2l0aW9uRW5kXCIsZnVuY3Rpb24oKXtiLiRiYXIucmVtb3ZlKCksYi4kYmFyPW51bGwsYi5jbG9zZWQ9ITAsYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrJiZiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2sub25DbG9zZSYmYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrLm9uQ2xvc2UuYXBwbHkoYil9KSk6KGIuJGJhci5yZW1vdmUoKSxiLiRiYXI9bnVsbCxiLmNsb3NlZD0hMCkpLGRlbGV0ZSBhLm5vdHkuc3RvcmVbYi5vcHRpb25zLmlkXSxiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2smJmIub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vbkNsb3NlJiZiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2sub25DbG9zZS5hcHBseShiKSxiLm9wdGlvbnMuZGlzbWlzc1F1ZXVlfHwoYS5ub3R5Lm9udGFwPSEwLGEubm90eVJlbmRlcmVyLnJlbmRlcigpKSxiLm9wdGlvbnMubWF4VmlzaWJsZT4wJiZiLm9wdGlvbnMuZGlzbWlzc1F1ZXVlJiZhLm5vdHlSZW5kZXJlci5yZW5kZXIoKX0sc2V0VGV4dDpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5jbG9zZWR8fCh0aGlzLm9wdGlvbnMudGV4dD1hLHRoaXMuJGJhci5maW5kKFwiLm5vdHlfdGV4dFwiKS5odG1sKGEpKSx0aGlzfSxzZXRUeXBlOmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLmNsb3NlZHx8KHRoaXMub3B0aW9ucy50eXBlPWEsdGhpcy5vcHRpb25zLnRoZW1lLnN0eWxlLmFwcGx5KHRoaXMpLHRoaXMub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vblNob3cuYXBwbHkodGhpcykpLHRoaXN9LHNldFRpbWVvdXQ6ZnVuY3Rpb24oYSl7aWYoIXRoaXMuY2xvc2VkKXt2YXIgYj10aGlzO3RoaXMub3B0aW9ucy50aW1lb3V0PWEsYi4kYmFyLmRlbGF5KGIub3B0aW9ucy50aW1lb3V0KS5wcm9taXNlKCkuZG9uZShmdW5jdGlvbigpe2IuY2xvc2UoKX0pfXJldHVybiB0aGlzfSxzdG9wUHJvcGFnYXRpb246ZnVuY3Rpb24oYSl7YT1hfHx3aW5kb3cuZXZlbnQsXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGEuc3RvcFByb3BhZ2F0aW9uP2Euc3RvcFByb3BhZ2F0aW9uKCk6YS5jYW5jZWxCdWJibGU9ITB9LGNsb3NlZDohMSxzaG93aW5nOiExLHNob3duOiExfTthLm5vdHlSZW5kZXJlcj17fSxhLm5vdHlSZW5kZXJlci5pbml0PWZ1bmN0aW9uKGMpe3ZhciBkPU9iamVjdC5jcmVhdGUoYikuaW5pdChjKTtyZXR1cm4gZC5vcHRpb25zLmtpbGxlciYmYS5ub3R5LmNsb3NlQWxsKCksZC5vcHRpb25zLmZvcmNlP2Eubm90eS5xdWV1ZS51bnNoaWZ0KGQpOmEubm90eS5xdWV1ZS5wdXNoKGQpLGEubm90eVJlbmRlcmVyLnJlbmRlcigpLFwib2JqZWN0XCI9PWEubm90eS5yZXR1cm5zP2Q6ZC5vcHRpb25zLmlkfSxhLm5vdHlSZW5kZXJlci5yZW5kZXI9ZnVuY3Rpb24oKXt2YXIgYj1hLm5vdHkucXVldWVbMF07XCJvYmplY3RcIj09PWEudHlwZShiKT9iLm9wdGlvbnMuZGlzbWlzc1F1ZXVlP2Iub3B0aW9ucy5tYXhWaXNpYmxlPjA/YShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcitcIiA+IGxpXCIpLmxlbmd0aDxiLm9wdGlvbnMubWF4VmlzaWJsZSYmYS5ub3R5UmVuZGVyZXIuc2hvdyhhLm5vdHkucXVldWUuc2hpZnQoKSk6YS5ub3R5UmVuZGVyZXIuc2hvdyhhLm5vdHkucXVldWUuc2hpZnQoKSk6YS5ub3R5Lm9udGFwJiYoYS5ub3R5UmVuZGVyZXIuc2hvdyhhLm5vdHkucXVldWUuc2hpZnQoKSksYS5ub3R5Lm9udGFwPSExKTphLm5vdHkub250YXA9ITB9LGEubm90eVJlbmRlcmVyLnNob3c9ZnVuY3Rpb24oYil7Yi5vcHRpb25zLm1vZGFsJiYoYS5ub3R5UmVuZGVyZXIuY3JlYXRlTW9kYWxGb3IoYiksYS5ub3R5UmVuZGVyZXIuc2V0TW9kYWxDb3VudCgxKSksYi5vcHRpb25zLmN1c3RvbT8wPT1iLm9wdGlvbnMuY3VzdG9tLmZpbmQoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmxlbmd0aD9iLm9wdGlvbnMuY3VzdG9tLmFwcGVuZChhKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLm9iamVjdCkuYWRkQ2xhc3MoXCJpLWFtLW5ld1wiKSk6Yi5vcHRpb25zLmN1c3RvbS5maW5kKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5yZW1vdmVDbGFzcyhcImktYW0tbmV3XCIpOjA9PWEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmxlbmd0aD9hKFwiYm9keVwiKS5hcHBlbmQoYShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5vYmplY3QpLmFkZENsYXNzKFwiaS1hbS1uZXdcIikpOmEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLnJlbW92ZUNsYXNzKFwiaS1hbS1uZXdcIiksYS5ub3R5UmVuZGVyZXIuc2V0TGF5b3V0Q291bnRGb3IoYiwxKSxiLnNob3coKX0sYS5ub3R5UmVuZGVyZXIuY3JlYXRlTW9kYWxGb3I9ZnVuY3Rpb24oYil7aWYoMD09YShcIi5ub3R5X21vZGFsXCIpLmxlbmd0aCl7dmFyIGM9YShcIjxkaXYvPlwiKS5hZGRDbGFzcyhcIm5vdHlfbW9kYWxcIikuYWRkQ2xhc3MoYi5vcHRpb25zLnRoZW1lKS5kYXRhKFwibm90eV9tb2RhbF9jb3VudFwiLDApO2Iub3B0aW9ucy50aGVtZS5tb2RhbCYmYi5vcHRpb25zLnRoZW1lLm1vZGFsLmNzcyYmYy5jc3MoYi5vcHRpb25zLnRoZW1lLm1vZGFsLmNzcyksYy5wcmVwZW5kVG8oYShcImJvZHlcIikpLmZhZGVJbihiLm9wdGlvbnMuYW5pbWF0aW9uLmZhZGVTcGVlZCksYS5pbkFycmF5KFwiYmFja2Ryb3BcIixiLm9wdGlvbnMuY2xvc2VXaXRoKT4tMSYmYy5vbihcImNsaWNrXCIsZnVuY3Rpb24oYil7YS5ub3R5LmNsb3NlQWxsKCl9KX19LGEubm90eVJlbmRlcmVyLmdldExheW91dENvdW50Rm9yPWZ1bmN0aW9uKGIpe3JldHVybiBhKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5kYXRhKFwibm90eV9sYXlvdXRfY291bnRcIil8fDB9LGEubm90eVJlbmRlcmVyLnNldExheW91dENvdW50Rm9yPWZ1bmN0aW9uKGIsYyl7cmV0dXJuIGEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmRhdGEoXCJub3R5X2xheW91dF9jb3VudFwiLGEubm90eVJlbmRlcmVyLmdldExheW91dENvdW50Rm9yKGIpK2MpfSxhLm5vdHlSZW5kZXJlci5nZXRNb2RhbENvdW50PWZ1bmN0aW9uKCl7cmV0dXJuIGEoXCIubm90eV9tb2RhbFwiKS5kYXRhKFwibm90eV9tb2RhbF9jb3VudFwiKXx8MH0sYS5ub3R5UmVuZGVyZXIuc2V0TW9kYWxDb3VudD1mdW5jdGlvbihiKXtyZXR1cm4gYShcIi5ub3R5X21vZGFsXCIpLmRhdGEoXCJub3R5X21vZGFsX2NvdW50XCIsYS5ub3R5UmVuZGVyZXIuZ2V0TW9kYWxDb3VudCgpK2IpfSxhLmZuLm5vdHk9ZnVuY3Rpb24oYil7cmV0dXJuIGIuY3VzdG9tPWEodGhpcyksYS5ub3R5UmVuZGVyZXIuaW5pdChiKX0sYS5ub3R5PXt9LGEubm90eS5xdWV1ZT1bXSxhLm5vdHkub250YXA9ITAsYS5ub3R5LmxheW91dHM9e30sYS5ub3R5LnRoZW1lcz17fSxhLm5vdHkucmV0dXJucz1cIm9iamVjdFwiLGEubm90eS5zdG9yZT17fSxhLm5vdHkuZ2V0PWZ1bmN0aW9uKGIpe3JldHVybiBhLm5vdHkuc3RvcmUuaGFzT3duUHJvcGVydHkoYik/YS5ub3R5LnN0b3JlW2JdOiExfSxhLm5vdHkuY2xvc2U9ZnVuY3Rpb24oYil7cmV0dXJuIGEubm90eS5nZXQoYik/YS5ub3R5LmdldChiKS5jbG9zZSgpOiExfSxhLm5vdHkuc2V0VGV4dD1mdW5jdGlvbihiLGMpe3JldHVybiBhLm5vdHkuZ2V0KGIpP2Eubm90eS5nZXQoYikuc2V0VGV4dChjKTohMX0sYS5ub3R5LnNldFR5cGU9ZnVuY3Rpb24oYixjKXtyZXR1cm4gYS5ub3R5LmdldChiKT9hLm5vdHkuZ2V0KGIpLnNldFR5cGUoYyk6ITF9LGEubm90eS5jbGVhclF1ZXVlPWZ1bmN0aW9uKCl7YS5ub3R5LnF1ZXVlPVtdfSxhLm5vdHkuY2xvc2VBbGw9ZnVuY3Rpb24oKXthLm5vdHkuY2xlYXJRdWV1ZSgpLGEuZWFjaChhLm5vdHkuc3RvcmUsZnVuY3Rpb24oYSxiKXtiLmNsb3NlKCl9KX07dmFyIGM9d2luZG93LmFsZXJ0O3JldHVybiBhLm5vdHkuY29uc3VtZUFsZXJ0PWZ1bmN0aW9uKGIpe3dpbmRvdy5hbGVydD1mdW5jdGlvbihjKXtiP2IudGV4dD1jOmI9e3RleHQ6Y30sYS5ub3R5UmVuZGVyZXIuaW5pdChiKX19LGEubm90eS5zdG9wQ29uc3VtZUFsZXJ0PWZ1bmN0aW9uKCl7d2luZG93LmFsZXJ0PWN9LGEubm90eS5kZWZhdWx0cz17bGF5b3V0OlwidG9wXCIsdGhlbWU6XCJkZWZhdWx0VGhlbWVcIix0eXBlOlwiYWxlcnRcIix0ZXh0OlwiXCIsZGlzbWlzc1F1ZXVlOiEwLHRlbXBsYXRlOic8ZGl2IGNsYXNzPVwibm90eV9tZXNzYWdlXCI+PHNwYW4gY2xhc3M9XCJub3R5X3RleHRcIj48L3NwYW4+PGRpdiBjbGFzcz1cIm5vdHlfY2xvc2VcIj48L2Rpdj48L2Rpdj4nLGFuaW1hdGlvbjp7b3Blbjp7aGVpZ2h0OlwidG9nZ2xlXCJ9LGNsb3NlOntoZWlnaHQ6XCJ0b2dnbGVcIn0sZWFzaW5nOlwic3dpbmdcIixzcGVlZDo1MDAsZmFkZVNwZWVkOlwiZmFzdFwifSx0aW1lb3V0OiExLGZvcmNlOiExLG1vZGFsOiExLG1heFZpc2libGU6NSxraWxsZXI6ITEsY2xvc2VXaXRoOltcImNsaWNrXCJdLGNhbGxiYWNrOntvblNob3c6ZnVuY3Rpb24oKXt9LGFmdGVyU2hvdzpmdW5jdGlvbigpe30sb25DbG9zZTpmdW5jdGlvbigpe30sYWZ0ZXJDbG9zZTpmdW5jdGlvbigpe30sb25DbG9zZUNsaWNrOmZ1bmN0aW9uKCl7fX0sYnV0dG9uczohMX0sYSh3aW5kb3cpLm9uKFwicmVzaXplXCIsZnVuY3Rpb24oKXthLmVhY2goYS5ub3R5LmxheW91dHMsZnVuY3Rpb24oYixjKXtjLmNvbnRhaW5lci5zdHlsZS5hcHBseShhKGMuY29udGFpbmVyLnNlbGVjdG9yKSl9KX0pLHdpbmRvdy5ub3R5PWZ1bmN0aW9uKGIpe3JldHVybiBhLm5vdHlSZW5kZXJlci5pbml0KGIpfSxhLm5vdHkubGF5b3V0cy5ib3R0b209e25hbWU6XCJib3R0b21cIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2JvdHRvbV9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9ib3R0b21fbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe2JvdHRvbTowLGxlZnQ6XCI1JVwiLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjkwJVwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6OTk5OTk5OX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmJvdHRvbUNlbnRlcj17bmFtZTpcImJvdHRvbUNlbnRlclwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfYm90dG9tQ2VudGVyX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2JvdHRvbUNlbnRlcl9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7Ym90dG9tOjIwLGxlZnQ6MCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSksYSh0aGlzKS5jc3Moe2xlZnQ6KGEod2luZG93KS53aWR0aCgpLWEodGhpcykub3V0ZXJXaWR0aCghMSkpLzIrXCJweFwifSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmJvdHRvbUxlZnQ9e25hbWU6XCJib3R0b21MZWZ0XCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9ib3R0b21MZWZ0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2JvdHRvbUxlZnRfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe2JvdHRvbToyMCxsZWZ0OjIwLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KSx3aW5kb3cuaW5uZXJXaWR0aDw2MDAmJmEodGhpcykuY3NzKHtsZWZ0OjV9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuYm90dG9tUmlnaHQ9e25hbWU6XCJib3R0b21SaWdodFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfYm90dG9tUmlnaHRfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfYm90dG9tUmlnaHRfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe2JvdHRvbToyMCxyaWdodDoyMCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSksd2luZG93LmlubmVyV2lkdGg8NjAwJiZhKHRoaXMpLmNzcyh7cmlnaHQ6NX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5jZW50ZXI9e25hbWU6XCJjZW50ZXJcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2NlbnRlcl9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9jZW50ZXJfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3Bvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KTt2YXIgYj1hKHRoaXMpLmNsb25lKCkuY3NzKHt2aXNpYmlsaXR5OlwiaGlkZGVuXCIsZGlzcGxheTpcImJsb2NrXCIscG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDowLGxlZnQ6MH0pLmF0dHIoXCJpZFwiLFwiZHVwZVwiKTthKFwiYm9keVwiKS5hcHBlbmQoYiksYi5maW5kKFwiLmktYW0tY2xvc2luZy1ub3dcIikucmVtb3ZlKCksYi5maW5kKFwibGlcIikuY3NzKFwiZGlzcGxheVwiLFwiYmxvY2tcIik7dmFyIGM9Yi5oZWlnaHQoKTtiLnJlbW92ZSgpLGEodGhpcykuaGFzQ2xhc3MoXCJpLWFtLW5ld1wiKT9hKHRoaXMpLmNzcyh7bGVmdDooYSh3aW5kb3cpLndpZHRoKCktYSh0aGlzKS5vdXRlcldpZHRoKCExKSkvMitcInB4XCIsdG9wOihhKHdpbmRvdykuaGVpZ2h0KCktYykvMitcInB4XCJ9KTphKHRoaXMpLmFuaW1hdGUoe2xlZnQ6KGEod2luZG93KS53aWR0aCgpLWEodGhpcykub3V0ZXJXaWR0aCghMSkpLzIrXCJweFwiLHRvcDooYSh3aW5kb3cpLmhlaWdodCgpLWMpLzIrXCJweFwifSw1MDApfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5jZW50ZXJMZWZ0PXtuYW1lOlwiY2VudGVyTGVmdFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfY2VudGVyTGVmdF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9jZW50ZXJMZWZ0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtsZWZ0OjIwLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KTt2YXIgYj1hKHRoaXMpLmNsb25lKCkuY3NzKHt2aXNpYmlsaXR5OlwiaGlkZGVuXCIsZGlzcGxheTpcImJsb2NrXCIscG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDowLGxlZnQ6MH0pLmF0dHIoXCJpZFwiLFwiZHVwZVwiKTthKFwiYm9keVwiKS5hcHBlbmQoYiksYi5maW5kKFwiLmktYW0tY2xvc2luZy1ub3dcIikucmVtb3ZlKCksYi5maW5kKFwibGlcIikuY3NzKFwiZGlzcGxheVwiLFwiYmxvY2tcIik7dmFyIGM9Yi5oZWlnaHQoKTtiLnJlbW92ZSgpLGEodGhpcykuaGFzQ2xhc3MoXCJpLWFtLW5ld1wiKT9hKHRoaXMpLmNzcyh7dG9wOihhKHdpbmRvdykuaGVpZ2h0KCktYykvMitcInB4XCJ9KTphKHRoaXMpLmFuaW1hdGUoe3RvcDooYSh3aW5kb3cpLmhlaWdodCgpLWMpLzIrXCJweFwifSw1MDApLHdpbmRvdy5pbm5lcldpZHRoPDYwMCYmYSh0aGlzKS5jc3Moe2xlZnQ6NX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5jZW50ZXJSaWdodD17bmFtZTpcImNlbnRlclJpZ2h0XCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9jZW50ZXJSaWdodF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9jZW50ZXJSaWdodF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7cmlnaHQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pO3ZhciBiPWEodGhpcykuY2xvbmUoKS5jc3Moe3Zpc2liaWxpdHk6XCJoaWRkZW5cIixkaXNwbGF5OlwiYmxvY2tcIixwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOjAsbGVmdDowfSkuYXR0cihcImlkXCIsXCJkdXBlXCIpO2EoXCJib2R5XCIpLmFwcGVuZChiKSxiLmZpbmQoXCIuaS1hbS1jbG9zaW5nLW5vd1wiKS5yZW1vdmUoKSxiLmZpbmQoXCJsaVwiKS5jc3MoXCJkaXNwbGF5XCIsXCJibG9ja1wiKTt2YXIgYz1iLmhlaWdodCgpO2IucmVtb3ZlKCksYSh0aGlzKS5oYXNDbGFzcyhcImktYW0tbmV3XCIpP2EodGhpcykuY3NzKHt0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0pOmEodGhpcykuYW5pbWF0ZSh7dG9wOihhKHdpbmRvdykuaGVpZ2h0KCktYykvMitcInB4XCJ9LDUwMCksd2luZG93LmlubmVyV2lkdGg8NjAwJiZhKHRoaXMpLmNzcyh7cmlnaHQ6NX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5pbmxpbmU9e25hbWU6XCJpbmxpbmVcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgY2xhc3M9XCJub3R5X2lubGluZV9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwubm90eV9pbmxpbmVfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3dpZHRoOlwiMTAwJVwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6OTk5OTk5OX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLnRvcD17bmFtZTpcInRvcFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfdG9wX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X3RvcF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7dG9wOjAsbGVmdDpcIjUlXCIscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiOTAlXCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDo5OTk5OTk5fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMudG9wQ2VudGVyPXtuYW1lOlwidG9wQ2VudGVyXCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV90b3BDZW50ZXJfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfdG9wQ2VudGVyX2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHt0b3A6MjAsbGVmdDowLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KSxhKHRoaXMpLmNzcyh7bGVmdDooYSh3aW5kb3cpLndpZHRoKCktYSh0aGlzKS5vdXRlcldpZHRoKCExKSkvMitcInB4XCJ9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMudG9wTGVmdD17bmFtZTpcInRvcExlZnRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X3RvcExlZnRfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfdG9wTGVmdF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7dG9wOjIwLGxlZnQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLHdpbmRvdy5pbm5lcldpZHRoPDYwMCYmYSh0aGlzKS5jc3Moe2xlZnQ6NX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy50b3BSaWdodD17bmFtZTpcInRvcFJpZ2h0XCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV90b3BSaWdodF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV90b3BSaWdodF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7dG9wOjIwLHJpZ2h0OjIwLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KSx3aW5kb3cuaW5uZXJXaWR0aDw2MDAmJmEodGhpcykuY3NzKHtyaWdodDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS50aGVtZXMuYm9vdHN0cmFwVGhlbWU9e25hbWU6XCJib290c3RyYXBUaGVtZVwiLG1vZGFsOntjc3M6e3Bvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjEwMCVcIixoZWlnaHQ6XCIxMDAlXCIsYmFja2dyb3VuZENvbG9yOlwiIzAwMFwiLHpJbmRleDoxZTQsb3BhY2l0eTouNixkaXNwbGF5Olwibm9uZVwiLGxlZnQ6MCx0b3A6MH19LHN0eWxlOmZ1bmN0aW9uKCl7dmFyIGI9dGhpcy5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3I7c3dpdGNoKGEoYikuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwXCIpLHRoaXMuJGNsb3NlQnV0dG9uLmFwcGVuZCgnPHNwYW4gYXJpYS1oaWRkZW49XCJ0cnVlXCI+JnRpbWVzOzwvc3Bhbj48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5DbG9zZTwvc3Bhbj4nKSx0aGlzLiRjbG9zZUJ1dHRvbi5hZGRDbGFzcyhcImNsb3NlXCIpLHRoaXMuJGJhci5hZGRDbGFzcyhcImxpc3QtZ3JvdXAtaXRlbVwiKS5jc3MoXCJwYWRkaW5nXCIsXCIwcHhcIiksdGhpcy5vcHRpb25zLnR5cGUpe2Nhc2VcImFsZXJ0XCI6Y2FzZVwibm90aWZpY2F0aW9uXCI6dGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtLWluZm9cIik7YnJlYWs7Y2FzZVwid2FybmluZ1wiOnRoaXMuJGJhci5hZGRDbGFzcyhcImxpc3QtZ3JvdXAtaXRlbS13YXJuaW5nXCIpO2JyZWFrO2Nhc2VcImVycm9yXCI6dGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtLWRhbmdlclwiKTticmVhaztjYXNlXCJpbmZvcm1hdGlvblwiOnRoaXMuJGJhci5hZGRDbGFzcyhcImxpc3QtZ3JvdXAtaXRlbS1pbmZvXCIpO2JyZWFrO2Nhc2VcInN1Y2Nlc3NcIjp0aGlzLiRiYXIuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwLWl0ZW0tc3VjY2Vzc1wiKX10aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsbGluZUhlaWdodDpcIjE2cHhcIix0ZXh0QWxpZ246XCJjZW50ZXJcIixwYWRkaW5nOlwiOHB4IDEwcHggOXB4XCIsd2lkdGg6XCJhdXRvXCIscG9zaXRpb246XCJyZWxhdGl2ZVwifSl9LGNhbGxiYWNrOntvblNob3c6ZnVuY3Rpb24oKXt9LG9uQ2xvc2U6ZnVuY3Rpb24oKXt9fX0sYS5ub3R5LnRoZW1lcy5kZWZhdWx0VGhlbWU9e25hbWU6XCJkZWZhdWx0VGhlbWVcIixoZWxwZXJzOntib3JkZXJGaXg6ZnVuY3Rpb24oKXtpZih0aGlzLm9wdGlvbnMuZGlzbWlzc1F1ZXVlKXt2YXIgYj10aGlzLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcitcIiBcIit0aGlzLm9wdGlvbnMubGF5b3V0LnBhcmVudC5zZWxlY3Rvcjtzd2l0Y2godGhpcy5vcHRpb25zLmxheW91dC5uYW1lKXtjYXNlXCJ0b3BcIjphKGIpLmNzcyh7Ym9yZGVyUmFkaXVzOlwiMHB4IDBweCAwcHggMHB4XCJ9KSxhKGIpLmxhc3QoKS5jc3Moe2JvcmRlclJhZGl1czpcIjBweCAwcHggNXB4IDVweFwifSk7YnJlYWs7Y2FzZVwidG9wQ2VudGVyXCI6Y2FzZVwidG9wTGVmdFwiOmNhc2VcInRvcFJpZ2h0XCI6Y2FzZVwiYm90dG9tQ2VudGVyXCI6Y2FzZVwiYm90dG9tTGVmdFwiOmNhc2VcImJvdHRvbVJpZ2h0XCI6Y2FzZVwiY2VudGVyXCI6Y2FzZVwiY2VudGVyTGVmdFwiOmNhc2VcImNlbnRlclJpZ2h0XCI6Y2FzZVwiaW5saW5lXCI6YShiKS5jc3Moe2JvcmRlclJhZGl1czpcIjBweCAwcHggMHB4IDBweFwifSksYShiKS5maXJzdCgpLmNzcyh7XCJib3JkZXItdG9wLWxlZnQtcmFkaXVzXCI6XCI1cHhcIixcImJvcmRlci10b3AtcmlnaHQtcmFkaXVzXCI6XCI1cHhcIn0pLGEoYikubGFzdCgpLmNzcyh7XCJib3JkZXItYm90dG9tLWxlZnQtcmFkaXVzXCI6XCI1cHhcIixcImJvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzXCI6XCI1cHhcIn0pO2JyZWFrO2Nhc2VcImJvdHRvbVwiOmEoYikuY3NzKHtib3JkZXJSYWRpdXM6XCIwcHggMHB4IDBweCAwcHhcIn0pLGEoYikuZmlyc3QoKS5jc3Moe2JvcmRlclJhZGl1czpcIjVweCA1cHggMHB4IDBweFwifSl9fX19LG1vZGFsOntjc3M6e3Bvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjEwMCVcIixoZWlnaHQ6XCIxMDAlXCIsYmFja2dyb3VuZENvbG9yOlwiIzAwMFwiLHpJbmRleDoxZTQsb3BhY2l0eTouNixkaXNwbGF5Olwibm9uZVwiLGxlZnQ6MCx0b3A6MH19LHN0eWxlOmZ1bmN0aW9uKCl7c3dpdGNoKHRoaXMuJGJhci5jc3Moe292ZXJmbG93OlwiaGlkZGVuXCIsYmFja2dyb3VuZDpcInVybCgnZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFCc0FBQUFvQ0FRQUFBQ2xNMG5kQUFBQWhrbEVRVlI0QWRYTzBRckNNQkJFMGJ0dGtrMzgvdzhXUkVScGR5anpWT2MrSHhoSUhxSkdNUWNGRmtwWVJRb3RMTFN3MElKNWFCZG92cnVNWURBL2tUOHBsRjlaS0xGUWNnRjE4aERqMVNiUU9NbENBNGthbzBpaVhtYWg3cUJXUGR4cG9oc2dWWnlqN2U1STlLY0lEK0VoaURJNWd4QllLTEJRWUtIQVFvR0ZBb0Vrcy9ZRUdIWUtCN2hGeGYwQUFBQUFTVVZPUks1Q1lJST0nKSByZXBlYXQteCBzY3JvbGwgbGVmdCB0b3AgI2ZmZlwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTNweFwiLGxpbmVIZWlnaHQ6XCIxNnB4XCIsdGV4dEFsaWduOlwiY2VudGVyXCIscGFkZGluZzpcIjhweCAxMHB4IDlweFwiLHdpZHRoOlwiYXV0b1wiLHBvc2l0aW9uOlwicmVsYXRpdmVcIn0pLHRoaXMuJGNsb3NlQnV0dG9uLmNzcyh7cG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDo0LHJpZ2h0OjQsd2lkdGg6MTAsaGVpZ2h0OjEwLGJhY2tncm91bmQ6XCJ1cmwoZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBb0FBQUFLQ0FRQUFBQW5Pd2MyQUFBQXhVbEVRVlI0QVIzTVBVb0RVUlNBMGUrK3VTa2tPeEMzSUFPV050YUNJRGFDaGZnWEJNRVpiUVJCeXhDd2srQmFzZ1FSWkxTWW9MZ0RRYkFSeHJ5OG55dW1QY1ZSS0RmZDBBYThBc2dEdjF6cDZwWWQ1aldPd2h2ZWJSVGJ6Tk5FdzVCU3NJcHNqL2t1clFCbm1rN3NJRmNDRjV5eVpQRFJHNnRyUWh1alhZb3NhRm9jKzJmMU1KODl1Yzc2SU5ENkY5QnZsWFVkcGI2eHdEMis0cTNtZTNieXNpSHZ0TFlyVUp0bzdQRC92ZTdMTkh4U2cvd29OMmtTejR0eGFzQmRoeWl6M3VnUEdldFRqbTNYUm9rQUFBQUFTVVZPUks1Q1lJST0pXCIsZGlzcGxheTpcIm5vbmVcIixjdXJzb3I6XCJwb2ludGVyXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7cGFkZGluZzo1LHRleHRBbGlnbjpcInJpZ2h0XCIsYm9yZGVyVG9wOlwiMXB4IHNvbGlkICNjY2NcIixiYWNrZ3JvdW5kQ29sb3I6XCIjZmZmXCJ9KSx0aGlzLiRidXR0b25zLmZpbmQoXCJidXR0b25cIikuY3NzKHttYXJnaW5MZWZ0OjV9KSx0aGlzLiRidXR0b25zLmZpbmQoXCJidXR0b246Zmlyc3RcIikuY3NzKHttYXJnaW5MZWZ0OjB9KSx0aGlzLiRiYXIub24oe21vdXNlZW50ZXI6ZnVuY3Rpb24oKXthKHRoaXMpLmZpbmQoXCIubm90eV9jbG9zZVwiKS5zdG9wKCkuZmFkZVRvKFwibm9ybWFsXCIsMSl9LG1vdXNlbGVhdmU6ZnVuY3Rpb24oKXthKHRoaXMpLmZpbmQoXCIubm90eV9jbG9zZVwiKS5zdG9wKCkuZmFkZVRvKFwibm9ybWFsXCIsMCl9fSksdGhpcy5vcHRpb25zLmxheW91dC5uYW1lKXtjYXNlXCJ0b3BcIjp0aGlzLiRiYXIuY3NzKHtib3JkZXJSYWRpdXM6XCIwcHggMHB4IDVweCA1cHhcIixib3JkZXJCb3R0b206XCIycHggc29saWQgI2VlZVwiLGJvcmRlckxlZnQ6XCIycHggc29saWQgI2VlZVwiLGJvcmRlclJpZ2h0OlwiMnB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KTticmVhaztjYXNlXCJ0b3BDZW50ZXJcIjpjYXNlXCJjZW50ZXJcIjpjYXNlXCJib3R0b21DZW50ZXJcIjpjYXNlXCJpbmxpbmVcIjp0aGlzLiRiYXIuY3NzKHtib3JkZXJSYWRpdXM6XCI1cHhcIixib3JkZXI6XCIxcHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjEzcHhcIix0ZXh0QWxpZ246XCJjZW50ZXJcIn0pO2JyZWFrO2Nhc2VcInRvcExlZnRcIjpjYXNlXCJ0b3BSaWdodFwiOmNhc2VcImJvdHRvbUxlZnRcIjpjYXNlXCJib3R0b21SaWdodFwiOmNhc2VcImNlbnRlckxlZnRcIjpjYXNlXCJjZW50ZXJSaWdodFwiOnRoaXMuJGJhci5jc3Moe2JvcmRlclJhZGl1czpcIjVweFwiLGJvcmRlcjpcIjFweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTNweFwiLHRleHRBbGlnbjpcImxlZnRcIn0pO2JyZWFrO2Nhc2VcImJvdHRvbVwiOnRoaXMuJGJhci5jc3Moe2JvcmRlclJhZGl1czpcIjVweCA1cHggMHB4IDBweFwiLGJvcmRlclRvcDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyTGVmdDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyUmlnaHQ6XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgLTJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KTticmVhaztkZWZhdWx0OnRoaXMuJGJhci5jc3Moe2JvcmRlcjpcIjJweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSl9c3dpdGNoKHRoaXMub3B0aW9ucy50eXBlKXtjYXNlXCJhbGVydFwiOmNhc2VcIm5vdGlmaWNhdGlvblwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkZcIixib3JkZXJDb2xvcjpcIiNDQ0NcIixjb2xvcjpcIiM0NDRcIn0pO2JyZWFrO2Nhc2VcIndhcm5pbmdcIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkZFQUE4XCIsYm9yZGVyQ29sb3I6XCIjRkZDMjM3XCIsY29sb3I6XCIjODI2MjAwXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkICNGRkMyMzdcIn0pO2JyZWFrO2Nhc2VcImVycm9yXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwicmVkXCIsYm9yZGVyQ29sb3I6XCJkYXJrcmVkXCIsY29sb3I6XCIjRkZGXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFdlaWdodDpcImJvbGRcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgZGFya3JlZFwifSk7YnJlYWs7Y2FzZVwiaW5mb3JtYXRpb25cIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjNTdCN0UyXCIsYm9yZGVyQ29sb3I6XCIjMEI5MEM0XCIsY29sb3I6XCIjRkZGXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkICMwQjkwQzRcIn0pO2JyZWFrO2Nhc2VcInN1Y2Nlc3NcIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCJsaWdodGdyZWVuXCIsYm9yZGVyQ29sb3I6XCIjNTBDMjRFXCIsY29sb3I6XCJkYXJrZ3JlZW5cIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgIzUwQzI0RVwifSk7YnJlYWs7ZGVmYXVsdDp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkZGXCIsYm9yZGVyQ29sb3I6XCIjQ0NDXCIsY29sb3I6XCIjNDQ0XCJ9KX19LGNhbGxiYWNrOntvblNob3c6ZnVuY3Rpb24oKXthLm5vdHkudGhlbWVzLmRlZmF1bHRUaGVtZS5oZWxwZXJzLmJvcmRlckZpeC5hcHBseSh0aGlzKX0sb25DbG9zZTpmdW5jdGlvbigpe2Eubm90eS50aGVtZXMuZGVmYXVsdFRoZW1lLmhlbHBlcnMuYm9yZGVyRml4LmFwcGx5KHRoaXMpfX19LGEubm90eS50aGVtZXMucmVsYXg9e25hbWU6XCJyZWxheFwiLGhlbHBlcnM6e30sbW9kYWw6e2Nzczp7cG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMTAwJVwiLGhlaWdodDpcIjEwMCVcIixiYWNrZ3JvdW5kQ29sb3I6XCIjMDAwXCIsekluZGV4OjFlNCxvcGFjaXR5Oi42LGRpc3BsYXk6XCJub25lXCIsbGVmdDowLHRvcDowfX0sc3R5bGU6ZnVuY3Rpb24oKXtzd2l0Y2godGhpcy4kYmFyLmNzcyh7b3ZlcmZsb3c6XCJoaWRkZW5cIixtYXJnaW46XCI0cHggMFwiLGJvcmRlclJhZGl1czpcIjJweFwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTRweFwiLGxpbmVIZWlnaHQ6XCIxNnB4XCIsdGV4dEFsaWduOlwiY2VudGVyXCIscGFkZGluZzpcIjEwcHhcIix3aWR0aDpcImF1dG9cIixwb3NpdGlvbjpcInJlbGF0aXZlXCJ9KSx0aGlzLiRjbG9zZUJ1dHRvbi5jc3Moe3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6NCxyaWdodDo0LHdpZHRoOjEwLGhlaWdodDoxMCxiYWNrZ3JvdW5kOlwidXJsKGRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQW9BQUFBS0NBUUFBQUFuT3djMkFBQUF4VWxFUVZSNEFSM01QVW9EVVJTQTBlKyt1U2trT3hDM0lBT1dOdGFDSURhQ2hmZ1hCTUVaYlFSQnl4Q3drK0Jhc2dRUlpMU1lvTGdEUWJBUnhyeThueXVtUGNWUktEZmQwQWE4QXNnRHYxenA2cFlkNWpXT3dodmViUlRiek5ORXc1QlNzSXBzai9rdXJRQm5tazdzSUZjQ0Y1eXlaUERSRzZ0clFodWpYWW9zYUZvYysyZjFNSjg5dWM3NklORDZGOUJ2bFhVZHBiNnh3RDIrNHEzbWUzYnlzaUh2dExZclVKdG83UEQvdmU3TE5IeFNnL3dvTjJrU3o0dHhhc0JkaHlpejN1Z1BHZXRUam0zWFJva0FBQUFBU1VWT1JLNUNZSUk9KVwiLGRpc3BsYXk6XCJub25lXCIsY3Vyc29yOlwicG9pbnRlclwifSksdGhpcy4kYnV0dG9ucy5jc3Moe3BhZGRpbmc6NSx0ZXh0QWxpZ246XCJyaWdodFwiLGJvcmRlclRvcDpcIjFweCBzb2xpZCAjY2NjXCIsYmFja2dyb3VuZENvbG9yOlwiI2ZmZlwifSksdGhpcy4kYnV0dG9ucy5maW5kKFwiYnV0dG9uXCIpLmNzcyh7bWFyZ2luTGVmdDo1fSksdGhpcy4kYnV0dG9ucy5maW5kKFwiYnV0dG9uOmZpcnN0XCIpLmNzcyh7bWFyZ2luTGVmdDowfSksdGhpcy4kYmFyLm9uKHttb3VzZWVudGVyOmZ1bmN0aW9uKCl7YSh0aGlzKS5maW5kKFwiLm5vdHlfY2xvc2VcIikuc3RvcCgpLmZhZGVUbyhcIm5vcm1hbFwiLDEpfSxtb3VzZWxlYXZlOmZ1bmN0aW9uKCl7YSh0aGlzKS5maW5kKFwiLm5vdHlfY2xvc2VcIikuc3RvcCgpLmZhZGVUbyhcIm5vcm1hbFwiLDApfX0pLHRoaXMub3B0aW9ucy5sYXlvdXQubmFtZSl7Y2FzZVwidG9wXCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyQm90dG9tOlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJMZWZ0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJSaWdodDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyVG9wOlwiMnB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KTticmVhaztjYXNlXCJ0b3BDZW50ZXJcIjpjYXNlXCJjZW50ZXJcIjpjYXNlXCJib3R0b21DZW50ZXJcIjpjYXNlXCJpbmxpbmVcIjp0aGlzLiRiYXIuY3NzKHtib3JkZXI6XCIxcHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjEzcHhcIix0ZXh0QWxpZ246XCJjZW50ZXJcIn0pO2JyZWFrO2Nhc2VcInRvcExlZnRcIjpjYXNlXCJ0b3BSaWdodFwiOmNhc2VcImJvdHRvbUxlZnRcIjpjYXNlXCJib3R0b21SaWdodFwiOmNhc2VcImNlbnRlckxlZnRcIjpjYXNlXCJjZW50ZXJSaWdodFwiOnRoaXMuJGJhci5jc3Moe2JvcmRlcjpcIjFweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTNweFwiLHRleHRBbGlnbjpcImxlZnRcIn0pO2JyZWFrO2Nhc2VcImJvdHRvbVwiOnRoaXMuJGJhci5jc3Moe2JvcmRlclRvcDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyTGVmdDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyUmlnaHQ6XCIycHggc29saWQgI2VlZVwiLGJvcmRlckJvdHRvbTpcIjJweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAtMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pO2JyZWFrO2RlZmF1bHQ6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyOlwiMnB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KX1zd2l0Y2godGhpcy5vcHRpb25zLnR5cGUpe2Nhc2VcImFsZXJ0XCI6Y2FzZVwibm90aWZpY2F0aW9uXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGRlwiLGJvcmRlckNvbG9yOlwiI2RlZGVkZVwiLGNvbG9yOlwiIzQ0NFwifSk7YnJlYWs7Y2FzZVwid2FybmluZ1wiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkVBQThcIixib3JkZXJDb2xvcjpcIiNGRkMyMzdcIixjb2xvcjpcIiM4MjYyMDBcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgI0ZGQzIzN1wifSk7YnJlYWs7Y2FzZVwiZXJyb3JcIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkY4MTgxXCIsYm9yZGVyQ29sb3I6XCIjZTI1MzUzXCIsY29sb3I6XCIjRkZGXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFdlaWdodDpcImJvbGRcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgZGFya3JlZFwifSk7YnJlYWs7Y2FzZVwiaW5mb3JtYXRpb25cIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjNzhDNUU3XCIsYm9yZGVyQ29sb3I6XCIjM2JhZGQ2XCIsY29sb3I6XCIjRkZGXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkICMwQjkwQzRcIn0pO2JyZWFrO2Nhc2VcInN1Y2Nlc3NcIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjQkNGNUJDXCIsYm9yZGVyQ29sb3I6XCIjN2NkZDc3XCIsY29sb3I6XCJkYXJrZ3JlZW5cIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgIzUwQzI0RVwifSk7YnJlYWs7ZGVmYXVsdDp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkZGXCIsYm9yZGVyQ29sb3I6XCIjQ0NDXCIsY29sb3I6XCIjNDQ0XCJ9KX19LGNhbGxiYWNrOntvblNob3c6ZnVuY3Rpb24oKXt9LG9uQ2xvc2U6ZnVuY3Rpb24oKXt9fX0sd2luZG93Lm5vdHl9KTsiLCIkKGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gdGVtcFxyXG4gICAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcImFbaHJlZj0nI3JlZmxpbmsnXVwiLCBmdW5jdGlvbigpIHtyZXR1cm4gZmFsc2U7fSk7XHJcblxyXG4gICAgdmFyIHVybFByZWZpeCA9ICcnO1xyXG5cclxuICAgIHZhciBhamF4ID0ge1xyXG4gICAgICAgIGNvbnRyb2w6IHtcclxuICAgICAgICAgICAgc2VuZEZvcm1EYXRhOiBmdW5jdGlvbihmb3JtLCB1cmwsIGxvZ05hbWUsIHN1Y2Nlc3NDYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgJChkb2N1bWVudCkub24oIFwic3VibWl0XCIsIGZvcm0sIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGYgPSAkKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFGb3JtID0gJCh0aGlzKS5zZXJpYWxpemUoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJtaXRCdXR0b24gPSAkKHRoaXMpLmZpbmQoXCJidXR0b25bdHlwZT1zdWJtaXRdXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9sZEJ1dHRvblZhbHVlID0gc3VibWl0QnV0dG9uLmh0bWwoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc3VibWl0QnV0dG9uLmF0dHIoXCJkaXNhYmxlZFwiLCBcImRpc2FibGVkXCIpLmh0bWwoJzxpIGNsYXNzPVwiZmEgZmEtY29nIGZhLXNwaW5cIj48L2k+Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogXCJwb3N0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogdXJsUHJlZml4ICsgdXJsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBkYXRhRm9ybSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXNwb25zZSA9ICQucGFyc2VKU09OKHJlc3BvbnNlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihyZXNwb25zZS5lcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcihrZXkgaW4gcmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVzcG9uc2Vba2V5XVswXSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZm9ybUVycm9yID0gbm90eSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCI8Yj7QntGI0LjQsdC60LAhPC9iPiBcIiArIHJlc3BvbnNlW2tleV1bMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46ICdhbmltYXRlZCBmYWRlSW5MZWZ0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlZWQ6IDMwMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICd0b3BSaWdodCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNzAwMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NDYWxsYmFjaygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oanF4aHIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9ycy5jb250cm9sLmxvZyhsb2dOYW1lLCBqcXhocik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZvcm1FcnJvckFqYXggPSBub3R5KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCi0LXRhdC90LjRh9C10YHQutC40LUg0YDQsNCx0L7RgtGLITwvYj48YnI+0JIg0LTQsNC90L3Ri9C5INC80L7QvNC10L3RgiDQstGA0LXQvNC10L3QuFwiICsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiDQv9GA0L7QuNC30LLQtdC00ZHQvdC90L7QtSDQtNC10LnRgdGC0LLQuNC1INC90LXQstC+0LfQvNC+0LbQvdC+LiDQn9C+0L/RgNC+0LHRg9C50YLQtSDQv9C+0LfQttC1LlwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiINCf0YDQuNC90L7RgdC40Lwg0YHQstC+0Lgg0LjQt9Cy0LjQvdC10L3QuNGPINC30LAg0L3QtdGD0LTQvtCx0YHRgtCy0L4uXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46ICdhbmltYXRlZCBmYWRlSW5MZWZ0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlZWQ6IDMwMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3dhcm5pbmcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiAncmVsYXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiAxMDAwMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Ym1pdEJ1dHRvbi5yZW1vdmVBdHRyKFwiZGlzYWJsZWRcIikuaHRtbChvbGRCdXR0b25WYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBlcnJvcnMgPSB7XHJcbiAgICAgICAgY29udHJvbDoge1xyXG4gICAgICAgICAgICBsb2c6IGZ1bmN0aW9uKHR5cGUsIGpxeGhyKSB7XHJcbiAgICAgICAgICAgICAgICAkKFwiPGRpdiBpZD0nZXJyb3ItY29udGFpbmVyJyBzdHlsZT0nZGlzcGxheTpub25lOyc+XCIgKyBqcXhoci5yZXNwb25zZVRleHQgKyBcIjwvZGl2PlwiKS5hcHBlbmRUbyhcImJvZHlcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGVycm9yQ29udGFpbmVyID0gJChcIiNlcnJvci1jb250YWluZXJcIiksXHJcbiAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2UgPSB0eXBlICsgXCI6IFwiICsganF4aHIuc3RhdHVzICsgXCIgXCIgKyBqcXhoci5zdGF0dXNUZXh0ICsgXCIgXCI7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoZXJyb3JDb250YWluZXIuZmluZChcImgyOmZpcnN0XCIpLnRleHQoKSA9PSBcIkRldGFpbHNcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZSArPSBcIi0gXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JDb250YWluZXIuZmluZChcImRpdlwiKS5lYWNoKGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGluZGV4ID4gNCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGVsaW1pdGVyID0gXCIsIFwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihpbmRleCA9PSA0KSBkZWxpbWl0ZXIgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2UgKz0gJCh0aGlzKS50ZXh0KCkgKyBkZWxpbWl0ZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IFwicG9zdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHVybDogdXJsUHJlZml4ICsgXCIvYWpheC1lcnJvclwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IFwibWVzc2FnZT1cIiArIGVycm9yTWVzc2FnZSxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGVycm9yQ29udGFpbmVyLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBzZXR0aW5ncyA9IHtcclxuICAgICAgICBjb250cm9sOiB7XHJcbiAgICAgICAgICAgIGV2ZW50czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBhamF4LmNvbnRyb2wuc2VuZEZvcm1EYXRhKFwiI3RvcCBmb3JtW25hbWU9dXNlci1zZXR0aW5nc11cIiwgXCIvYWNjb3VudC9zZXR0aW5ncy9jaGFuZ2Utc2V0dGluZ3NcIiwgXCJBY2NvdW50IFNldHRpbmdzIEFqYXggRXJyb3JcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIiN0b3AgZm9ybVtuYW1lPXVzZXItc2V0dGluZ3NdXCIpLmF0dHIoXCJuYW1lXCIsIFwidmFsaWQtZGF0YS1zZXR0aW5nc1wiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNldHRpbmdzU3VjY2VzcyA9IG5vdHkoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCf0L7Qt9C00YDQsNCy0LvRj9C10LwhPC9iPjxicj7QmNC90YTQvtGA0LzQsNGG0LjRjyDRg9GB0L/QtdGI0L3QviDQvtCx0L3QvtCy0LvQtdC90LAuXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNzAwMFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKFwiI3RvcCBmb3JtW25hbWU9dmFsaWQtZGF0YS1zZXR0aW5nc11cIikuc3VibWl0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgMTUwMCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBhamF4LmNvbnRyb2wuc2VuZEZvcm1EYXRhKFwiI3RvcCBmb3JtW25hbWU9dXNlci1wYXNzd29yZF1cIiwgXCIvYWNjb3VudC9zZXR0aW5ncy9jaGFuZ2UtcGFzc3dvcmRcIiwgXCJBY2NvdW50IFBhc3N3b3JkIEFqYXggRXJyb3JcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhc3N3b3JkU3VjY2VzcyA9IG5vdHkoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCf0L7Qt9C00YDQsNCy0LvRj9C10LwhPC9iPjxicj7Qn9Cw0YDQvtC70Ywg0YPRgdC/0LXRiNC90L4g0LjQt9C80LXQvdGR0L0uXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNzAwMFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKFwiI3RvcCBmb3JtW25hbWU9dXNlci1wYXNzd29yZF1cIilbMF0ucmVzZXQoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICQoJyN0b3AgaW5wdXRbcmVmPWRhdGVdJykuZGF0ZXBpY2tlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZUZvcm1hdDogXCJ5eXl5LW1tLWRkXCJcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9ICAgXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBhZmZpbGlhdGUgPSB7XHJcbiAgICAgICAgY29udHJvbDoge1xyXG4gICAgICAgICAgICBldmVudHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgYWpheC5jb250cm9sLnNlbmRGb3JtRGF0YShcIiN0b3AgLm1haWwtaW52aXRhdGlvbi1mb3JtXCIsIFwiL2FjY291bnQvYWZmaWxpYXRlXCIsIFwiTWFpbCBJbnZpdGF0aW9uIEFqYXggRXJyb3JcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGludml0YXRpb25TdWNjZXNzID0gbm90eSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0J/QvtC30LTRgNCw0LLQu9GP0LXQvCE8L2I+PGJyPtCf0YDQuNCz0LvQsNGI0LXQvdC40LUg0LHRi9C70L4g0YPRgdC/0LXRiNC90L4g0L7RgtC/0YDQsNCy0LvQtdC90L4uXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNzAwMFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKFwiI3RvcCAubWFpbC1pbnZpdGF0aW9uLWZvcm1cIilbMF0ucmVzZXQoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBiYWxhbmNlID0ge1xyXG4gICAgICAgIGNvbnRyb2w6IHtcclxuICAgICAgICAgICAgZXZlbnRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciBjb25maXJtQmFsYW5jZSA9ICQoXCIjdWluZm9cIikuYXR0cihcImRhdGEtYmFsYW5jZVwiKSxcclxuICAgICAgICAgICAgICAgICAgICAgIHN0YXR1cyA9ICQoXCIjdWluZm9cIikuYXR0cihcImRhdGEtc3RhdHVzXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIENpcmNsZXMuY3JlYXRlKHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogJ2Jyb256ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiAxMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGNvbmZpcm1CYWxhbmNlLFxyXG4gICAgICAgICAgICAgICAgICAgIG1heFZhbHVlOiA1MDAsXHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IChzdGF0dXMgPT0gXCJkZWZhdWx0XCIgPyAyMCA6IDEwKSxcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgKyAnIDxzcGFuIGNsYXNzPVwiZmEgZmEtcnViXCI+PC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcnM6ICBbJyNFQzhCNkMnLCAnIzg3MjYwQyddLFxyXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiA1MDAsXHJcbiAgICAgICAgICAgICAgICAgICAgd3JwQ2xhc3M6ICdjaXJjbGVzLXdycCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dENsYXNzOiAgJ2NpcmNsZXMtdGV4dCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVTdHJva2VDbGFzczogICdjaXJjbGVzLXZhbHVlU3Ryb2tlJyxcclxuICAgICAgICAgICAgICAgICAgICBtYXhWYWx1ZVN0cm9rZUNsYXNzOiAnY2lyY2xlcy1tYXhWYWx1ZVN0cm9rZScsXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVXcmFwcGVyOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlVGV4dDogIHRydWVcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIENpcmNsZXMuY3JlYXRlKHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogJ3NpbHZlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiAxMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGNvbmZpcm1CYWxhbmNlLFxyXG4gICAgICAgICAgICAgICAgICAgIG1heFZhbHVlOiAzMDAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAoc3RhdHVzID09IFwiYnJvbnplXCIgPyAyMCA6IDEwKSxcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBmdW5jdGlvbih2YWx1ZSl7cmV0dXJuIHZhbHVlICsgJyA8c3BhbiBjbGFzcz1cImZhIGZhLXJ1YlwiPjwvc3Bhbj4nO30sXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3JzOiAgWycjRTNFM0UzJywgJyM5RDlEOUInXSxcclxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogNjAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHdycENsYXNzOiAnY2lyY2xlcy13cnAnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRleHRDbGFzczogICdjaXJjbGVzLXRleHQnLFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlU3Ryb2tlQ2xhc3M6ICAnY2lyY2xlcy12YWx1ZVN0cm9rZScsXHJcbiAgICAgICAgICAgICAgICAgICAgbWF4VmFsdWVTdHJva2VDbGFzczogJ2NpcmNsZXMtbWF4VmFsdWVTdHJva2UnLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlV3JhcHBlcjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZVRleHQ6ICB0cnVlXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBDaXJjbGVzLmNyZWF0ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdnb2xkJyxcclxuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDEwMCxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY29uZmlybUJhbGFuY2UsXHJcbiAgICAgICAgICAgICAgICAgICAgbWF4VmFsdWU6IDcwMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IChzdGF0dXMgPT0gXCJzaWx2ZXJcIiA/IDIwIDogMTApLFxyXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IGZ1bmN0aW9uKHZhbHVlKXtyZXR1cm4gdmFsdWUgKyAnIDxzcGFuIGNsYXNzPVwiZmEgZmEtcnViXCI+PC9zcGFuPic7fSxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcnM6ICBbJyNGQ0I4NEInLCAnI0Q1ODQxNyddLFxyXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiA3MDAsXHJcbiAgICAgICAgICAgICAgICAgICAgd3JwQ2xhc3M6ICdjaXJjbGVzLXdycCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dENsYXNzOiAgJ2NpcmNsZXMtdGV4dCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVTdHJva2VDbGFzczogICdjaXJjbGVzLXZhbHVlU3Ryb2tlJyxcclxuICAgICAgICAgICAgICAgICAgICBtYXhWYWx1ZVN0cm9rZUNsYXNzOiAnY2lyY2xlcy1tYXhWYWx1ZVN0cm9rZScsXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVXcmFwcGVyOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlVGV4dDogIHRydWVcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIENpcmNsZXMuY3JlYXRlKHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogJ3BsYXRpbnVtJyxcclxuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDEwMCxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY29uZmlybUJhbGFuY2UsXHJcbiAgICAgICAgICAgICAgICAgICAgbWF4VmFsdWU6IDEwMDAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAoc3RhdHVzID09IFwiZ29sZFwiID8gMjAgOiAxMCksXHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogZnVuY3Rpb24odmFsdWUpe3JldHVybiB2YWx1ZSArICcgPHNwYW4gY2xhc3M9XCJmYSBmYS1ydWJcIj48L3NwYW4+Jzt9LFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yczogIFsnIzlEOUQ5QicsICcjMDYwNjA2J10sXHJcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IDgwMCxcclxuICAgICAgICAgICAgICAgICAgICB3cnBDbGFzczogJ2NpcmNsZXMtd3JwJyxcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0Q2xhc3M6ICAnY2lyY2xlcy10ZXh0JyxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZVN0cm9rZUNsYXNzOiAgJ2NpcmNsZXMtdmFsdWVTdHJva2UnLFxyXG4gICAgICAgICAgICAgICAgICAgIG1heFZhbHVlU3Ryb2tlQ2xhc3M6ICdjaXJjbGVzLW1heFZhbHVlU3Ryb2tlJyxcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZVdyYXBwZXI6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVUZXh0OiAgdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfSk7ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBmYXZvcml0ZXMgPSB7XHJcbiAgICAgICAgY29udHJvbDoge1xyXG4gICAgICAgICAgICBldmVudHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChcIiN0b3BcIikuZmluZChcIi5mYXZvcml0ZS1saW5rXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxmID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdHlwZSA9IHNlbGYuYXR0cihcImRhdGEtc3RhdGVcIiksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYWZmaWxpYXRlX2lkID0gc2VsZi5hdHRyKFwiZGF0YS1hZmZpbGlhdGUtaWRcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKHR5cGUgPT0gXCJhZGRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmZpbmQoXCIuZmFcIikucmVtb3ZlQ2xhc3MoXCJtdXRlZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZmluZChcIi5mYVwiKS5yZW1vdmVDbGFzcyhcInB1bHNlMlwiKS5hZGRDbGFzcyhcImZhLXNwaW5cIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogXCJwb3N0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogdXJsUHJlZml4ICsgXCIvYWNjb3VudC9mYXZvcml0ZXNcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogXCJ0eXBlPVwiICsgdHlwZSArIFwiJmFmZmlsaWF0ZV9pZD1cIiArIGFmZmlsaWF0ZV9pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChqcXhocikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JzLmNvbnRyb2wubG9nKCdGYXZvcml0ZXMgQWpheCBFcnJvcicsIGpxeGhyKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmF2RXJyb3JBamF4ID0gbm90eSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCI8Yj7QotC10YXQvdC40YfQtdGB0LrQuNC1INGA0LDQsdC+0YLRiyE8L2I+PGJyPtCSINC00LDQvdC90YvQuSDQvNC+0LzQtdC90YIg0LLRgNC10LzQtdC90LhcIiArIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIg0L/RgNC+0LjQt9Cy0LXQtNGR0L3QvdC+0LUg0LTQtdC50YHRgtCy0LjQtSDQvdC10LLQvtC30LzQvtC20L3Qvi4g0J/QvtC/0YDQvtCx0YPQudGC0LUg0L/QvtC30LbQtS5cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiDQn9GA0LjQvdC+0YHQuNC8INGB0LLQvtC4INC40LfQstC40L3QtdC90LjRjyDQt9CwINC90LXRg9C00L7QsdGB0YLQstC+LlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiAnYW5pbWF0ZWQgZmxpcE91dFgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd3YXJuaW5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICd0b3BSaWdodCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogMTAwMDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHR5cGUgPT0gXCJhZGRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZmluZChcIi5mYVwiKS5hZGRDbGFzcyhcIm11dGVkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZmluZChcIi5mYVwiKS5yZW1vdmVDbGFzcyhcImZhLXNwaW5cIikuYWRkQ2xhc3MoXCJwdWxzZTJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSAkLnBhcnNlSlNPTihyZXNwb25zZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVzcG9uc2UuZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3Ioa2V5IGluIHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHJlc3BvbnNlW2tleV1bMF0gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZhdm9yaXRlc0Vycm9yID0gbm90eSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCI8Yj7QntGI0LjQsdC60LAhPC9iPiBcIiArIHJlc3BvbnNlW2tleV1bMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46ICdhbmltYXRlZCBmYWRlSW5MZWZ0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlZWQ6IDMwMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICd0b3BSaWdodCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNzAwMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHR5cGUgPT0gXCJhZGRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmZpbmQoXCIuZmFcIikuYWRkQ2xhc3MoXCJtdXRlZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZmluZChcIi5mYVwiKS5yZW1vdmVDbGFzcyhcImZhLXNwaW5cIikuYWRkQ2xhc3MoXCJwdWxzZTJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmYXZvcml0ZXNTdWNjZXNzID0gbm90eSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IHJlc3BvbnNlLm1zZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA3MDAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHR5cGUgPT0gXCJhZGRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmF0dHIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLXN0YXRlXCI6IFwiZGVsZXRlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRhdGEtb3JpZ2luYWwtdGl0bGVcIjogXCLQo9C00LDQu9C40YLRjCDQuNC3INC40LfQsdGA0LDQvdC90L7Qs9C+XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmZpbmQoXCIuZmFcIikucmVtb3ZlQ2xhc3MoXCJmYS1zcGluIGZhLXN0YXItb1wiKS5hZGRDbGFzcyhcInB1bHNlMiBmYS1zdGFyXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZih0eXBlID09IFwiZGVsZXRlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hdHRyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS1zdGF0ZVwiOiBcImFkZFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLW9yaWdpbmFsLXRpdGxlXCIgOiBcItCU0L7QsdCw0LLQuNGC0Ywg0LIg0LjQt9Cx0YDQsNC90L3QvtC1XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7ICAgICAgICAgICAgICAgICAgIFxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5maW5kKFwiLmZhXCIpLnJlbW92ZUNsYXNzKFwiZmEtc3BpbiBmYS1zdGFyXCIpLmFkZENsYXNzKFwicHVsc2UyIGZhLXN0YXItbyBtdXRlZFwiKTsgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7ICAgICAgIFxyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGhlYWRlciA9IHtcclxuICAgICAgICBjb250cm9sOiB7XHJcbiAgICAgICAgICAgIGV2ZW50czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZigkKHdpbmRvdykud2lkdGgoKSA+IDk5MSkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoXCIjc2VhcmNoXCIpLmF1dG9jb21wbGV0ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZpY2VVcmw6ICcvc2VhcmNoJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9DYWNoZTogJ3RydWUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlclJlcXVlc3RCeTogMzAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gJy9zdG9yZXMvJyArIHN1Z2dlc3Rpb24uZGF0YS5yb3V0ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICQoXCIuZG9icm9oZWFkIGlcIikuYW5pbW8oe2FuaW1hdGlvbjogXCJwdWxzZVwiLCBpdGVyYXRlOiBcImluZmluaXRlXCJ9KTtcclxuICAgICAgICAgICAgICAgICQoXCIubGluay1oZWFkLXN0b3JlcyBzcGFuXCIpLmFuaW1vKHthbmltYXRpb246IFwiZmxhc2hcIiwgaXRlcmF0ZTogXCJpbmZpbml0ZVwiLCBkdXJhdGlvbjogMi40fSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHdpdGhkcmF3ID0ge1xyXG4gICAgICAgIGNvbnRyb2w6IHtcclxuICAgICAgICAgICAgZXZlbnRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuYWNjb3VudC13aXRoZHJhdyAub3B0aW9uIGFcIikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGYgPSAkKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbiA9IHNlbGYucGFyZW50KCkuYXR0cihcImRhdGEtb3B0aW9uLXByb2Nlc3NcIiksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXIgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuYWNjb3VudC13aXRoZHJhdyAub3B0aW9uIGFcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJChcIiN0b3BcIikuZmluZChcImZvcm1bbmFtZT13aXRoZHJhdy1mb3JtXVwiKS5maW5kKFwiaW5wdXRbbmFtZT13aXRoZHJhdy1wcm9jZXNzXVwiKS52YWwob3B0aW9uKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoKG9wdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiMVwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlciA9IFwi0JLQstC10LTQuNGC0LUg0L3QvtC80LXRgCDRgdGH0ZHRgtCwXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIjJcIjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXIgPSBcItCS0LLQtdC00LjRgtC1INC90L7QvNC10YAgUi3QutC+0YjQtdC70YzQutCwXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIjNcIjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXIgPSBcItCS0LLQtdC00LjRgtC1INC90L7QvNC10YAg0YLQtdC70LXRhNC+0L3QsFwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCI0XCI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyID0gXCLQktCy0LXQtNC40YLQtSDQvdC+0LzQtdGAINC60LDRgNGC0YtcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiNVwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlciA9IFwi0JLQstC10LTQuNGC0LUgZW1haWwg0LDQtNGA0LXRgVwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCI2XCI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyID0gXCLQktCy0LXQtNC40YLQtSDQvdC+0LzQtdGAINGC0LXQu9C10YTQvtC90LBcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKFwiI3RvcFwiKS5maW5kKFwiZm9ybVtuYW1lPXdpdGhkcmF3LWZvcm1dXCIpLmZpbmQoXCJpbnB1dFtuYW1lPWJpbGxdXCIpLmF0dHIoXCJwbGFjZWhvbGRlclwiLCBwbGFjZWhvbGRlcik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGFqYXguY29udHJvbC5zZW5kRm9ybURhdGEoXCIjdG9wIGZvcm1bbmFtZT13aXRoZHJhdy1mb3JtXVwiLCBcIi9hY2NvdW50L3dpdGhkcmF3XCIsIFwiV2l0aGRyYXcgQWpheCBFcnJvclwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgd2l0aGRyYXdTdWNjZXNzID0gbm90eSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0J/QvtC30LTRgNCw0LLQu9GP0LXQvCE8L2I+PGJyPtCX0LDQv9GA0L7RgSDQvdCwINCy0YvQstC+0LQg0LTQtdC90LXQsyDQsdGL0Lsg0YPRgdC/0LXRiNC90L4g0LLRi9C/0L7Qu9C90LXQvS5cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA3MDAwXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoXCIjdG9wIGZvcm1bbmFtZT13aXRoZHJhdy1mb3JtXVwiKVswXS5yZXNldCgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNoYXJpdHkgPSB7XHJcbiAgICAgICAgY29udHJvbDoge1xyXG4gICAgICAgICAgICBldmVudHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChcIiN0b3BcIikuZmluZChcIi5hY2NvdW50LWZ1bmQtdHJhbnNmZXIgLm9wdGlvbiBhXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxmID0gJCh0aGlzKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb24gPSBzZWxmLnBhcmVudCgpLmF0dHIoXCJkYXRhLW9wdGlvbi1wcm9jZXNzXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyID0gXCJcIjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRpdGxlRnVuZCA9IHNlbGYucHJldihcIi50aXRsZVwiKS50ZXh0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIi50by1mdW5kIHNwYW5cIikudGV4dCh0aXRsZUZ1bmQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKFwiI3RvcFwiKS5maW5kKFwiLmFjY291bnQtZnVuZC10cmFuc2ZlciAub3B0aW9uIGFcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJChcIiN0b3BcIikuZmluZChcImZvcm1bbmFtZT1mdW5kLXRyYW5zZmVyLWZvcm1dXCIpLmZpbmQoXCJpbnB1dFtuYW1lPWNoYXJpdHktcHJvY2Vzc11cIikudmFsKG9wdGlvbik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuYWNjb3VudC1mdW5kLXRyYW5zZmVyIC5hdXRvcGF5bWVudC1pbmZvXCIpLmNzcyhcImRpc3BsYXlcIiwgXCJibG9ja1wiKTtcclxuICAgICAgICAgICAgICAgICAgICAkKFwiI3RvcFwiKS5maW5kKFwiZm9ybVtuYW1lPWF1dG9wYXltZW50LWZvcm1dXCIpLmZpbmQoXCJpbnB1dFtuYW1lPWF1dG9wYXltZW50LXVpZF1cIikudmFsKG9wdGlvbik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGFqYXguY29udHJvbC5zZW5kRm9ybURhdGEoXCIjdG9wIGZvcm1bbmFtZT1mdW5kLXRyYW5zZmVyLWZvcm1dXCIsIFwiL2FjY291bnQvZnVuZC10cmFuc2Zlci9hZGRcIiwgXCJGdW5kIFRyYW5zZmVyIEFqYXggRXJyb3JcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdpdGhkcmF3U3VjY2VzcyA9IG5vdHkoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCf0L7Qt9C00YDQsNCy0LvRj9C10LwhPC9iPjxicj7QlNC10L3QtdC20L3Ri9C1INGB0YDQtdC00YHRgtCy0LAg0YPRgdC/0LXRiNC90L4g0L/QtdGA0LXQstC10LTQtdC90YsuINCh0L/QsNGB0LjQsdC+INC30LAg0JLQsNGI0YMg0L/QvtC80L7RidGMLiDQmNGB0YLQvtGA0LjRjiDQktCw0YjQuNGFINC00L7QsdGA0YvRhSDQtNC10Lsg0LLRiyDQvNC+0LbQtdGC0LUg0L/QvtGB0LzQvtGC0YDQtdGC0Ywg0LIgPGEgaHJlZj0nL2FjY291bnQvY2hhcml0eSc+0LvQuNGH0L3QvtC8INC60LDQsdC40L3QtdGC0LU8L2E+LlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46ICdhbmltYXRlZCBmYWRlSW5MZWZ0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiAnYW5pbWF0ZWQgZmxpcE91dFgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlZWQ6IDMwMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiAncmVsYXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICd0b3BSaWdodCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDcwMDBcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJChcIiN0b3AgZm9ybVtuYW1lPWZ1bmQtdHJhbnNmZXItZm9ybV1cIilbMF0ucmVzZXQoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGFqYXguY29udHJvbC5zZW5kRm9ybURhdGEoXCIjdG9wIGZvcm1bbmFtZT1hdXRvcGF5bWVudC1mb3JtXVwiLCBcIi9hY2NvdW50L2Z1bmQtdHJhbnNmZXIvYXV0b1wiLCBcIkF1dG8gUGF5bWVudCBBamF4IEVycm9yXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB3aXRoZHJhd1N1Y2Nlc3MgPSBub3R5KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCI8Yj7Qn9C+0LfQtNGA0LDQstC70Y/QtdC8ITwvYj48YnI+0JDQstGC0L7Qv9C70LDRgtGR0LYg0LHRi9C7INGD0YHQv9C10YjQvdC+INGD0YHRgtCw0L3QvtCy0LvQtdC9LlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46ICdhbmltYXRlZCBmYWRlSW5MZWZ0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiAnYW5pbWF0ZWQgZmxpcE91dFgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlZWQ6IDMwMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiAncmVsYXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICd0b3BSaWdodCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDcwMDBcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGFqYXguY29udHJvbC5zZW5kRm9ybURhdGEoXCIjdG9wIGZvcm1bbmFtZT1kZWxldGUtYXV0b3BheW1lbnQtZm9ybV1cIiwgXCIvYWNjb3VudC9mdW5kLXRyYW5zZmVyL2RlbGV0ZS1hdXRvXCIsIFwiRGVsZXRlIEF1dG8gUGF5bWVudCBBamF4IEVycm9yXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB3aXRoZHJhd1N1Y2Nlc3MgPSBub3R5KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCI8Yj7Qn9C+0LfQtNGA0LDQstC70Y/QtdC8ITwvYj48YnI+0JDQstGC0L7Qv9C70LDRgtGR0LYg0LHRi9C7INGD0YHQv9C10YjQvdC+INGD0LTQsNC70ZHQvS5cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA3MDAwXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuc2VsZi1hdXRvcGF5bWVudFwiKS5wYXJlbnQoKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBzdXBwb3J0ID0ge1xyXG4gICAgICAgIGNvbnRyb2w6IHtcclxuICAgICAgICAgICAgZXZlbnRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGFqYXguY29udHJvbC5zZW5kRm9ybURhdGEoXCIjdG9wIGZvcm1bbmFtZT1zdXBwb3J0LWZvcm1dXCIsIFwiL2FjY291bnQvc3VwcG9ydFwiLCBcIlN1cHBvcnQgQWpheCBFcnJvclwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3VwcG9ydFN1Y2Nlc3MgPSBub3R5KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCI8Yj7Qn9C+0LfQtNGA0LDQstC70Y/QtdC8ITwvYj48YnI+0JfQsNC/0YDQvtGBINCyINGB0LvRg9C20LHRgyDQv9C+0LTQtNC10YDQttC60Lgg0LHRi9C7INGD0YHQv9C10YjQvdC+INC+0YLQv9GA0LDQstC70LXQvS5cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA3MDAwXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoXCIjdG9wIGZvcm1bbmFtZT1zdXBwb3J0LWZvcm1dXCIpWzBdLnJlc2V0KCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdXBwb3J0LmNvbnRyb2wuZXZlbnRzKCk7XHJcbiAgICB3aXRoZHJhdy5jb250cm9sLmV2ZW50cygpO1xyXG4gICAgY2hhcml0eS5jb250cm9sLmV2ZW50cygpO1xyXG4gICAgc2V0dGluZ3MuY29udHJvbC5ldmVudHMoKTtcclxuICAgIGJhbGFuY2UuY29udHJvbC5ldmVudHMoKTtcclxuICAgIGFmZmlsaWF0ZS5jb250cm9sLmV2ZW50cygpO1xyXG4gICAgZmF2b3JpdGVzLmNvbnRyb2wuZXZlbnRzKCk7XHJcbiAgICBoZWFkZXIuY29udHJvbC5ldmVudHMoKTtcclxufSk7XHJcblxyXG4kKGZ1bmN0aW9uKCl7XHJcbiAgICAkKFwiaW5wdXQubGlua1wiKS5jbGljayhmdW5jdGlvbigpe1x0Ly8g0L/QvtC70YPRh9C10L3QuNC1INGE0L7QutGD0YHQsCDRgtC10LrRgdGC0L7QstGL0Lwg0L/QvtC70LXQvC3RgdGB0YvQu9C60L7QuVxyXG4gICAgICAgICQodGhpcykuc2VsZWN0KCk7XHJcbiAgICB9KTtcclxufSk7XHJcbiIsIjsoZnVuY3Rpb24gKCAkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQgKSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIGFuaW1vIGlzIGEgcG93ZXJmdWwgbGl0dGxlIHRvb2wgdGhhdCBtYWtlcyBtYW5hZ2luZyBDU1MgYW5pbWF0aW9ucyBleHRyZW1lbHkgZWFzeS4gU3RhY2sgYW5pbWF0aW9ucywgc2V0IGNhbGxiYWNrcywgbWFrZSBtYWdpYy5cclxuICAgKiBNb2Rlcm4gYnJvd3NlcnMgYW5kIGFsbW9zdCBhbGwgbW9iaWxlIGJyb3dzZXJzIHN1cHBvcnQgQ1NTIGFuaW1hdGlvbnMgKGh0dHA6Ly9jYW5pdXNlLmNvbS9jc3MtYW5pbWF0aW9uKS5cclxuICAgKlxyXG4gICAqIEBhdXRob3IgRGFuaWVsIFJhZnRlcnkgOiB0d2l0dGVyL1Rocml2aW5nS2luZ3NcclxuICAgKiBAdmVyc2lvbiAxLjAuMVxyXG4gICovXHJcbiAgZnVuY3Rpb24gYW5pbW8oIGVsZW1lbnQsIG9wdGlvbnMsIGNhbGxiYWNrLCBvdGhlcl9jYiApIHtcclxuICAgIFxyXG4gICAgLy8gRGVmYXVsdCBjb25maWd1cmF0aW9uXHJcbiAgICB2YXIgZGVmYXVsdHMgPSB7XHJcbiAgICBcdGR1cmF0aW9uOiAxLFxyXG4gICAgXHRhbmltYXRpb246IG51bGwsXHJcbiAgICBcdGl0ZXJhdGU6IDEsXHJcbiAgICBcdHRpbWluZzogXCJsaW5lYXJcIixcclxuICAgICAga2VlcDogZmFsc2VcclxuICAgIH07XHJcblxyXG4gICAgLy8gQnJvd3NlciBwcmVmaXhlcyBmb3IgQ1NTXHJcbiAgICB0aGlzLnByZWZpeGVzID0gW1wiXCIsIFwiLW1vei1cIiwgXCItby1hbmltYXRpb24tXCIsIFwiLXdlYmtpdC1cIl07XHJcblxyXG4gICAgLy8gQ2FjaGUgdGhlIGVsZW1lbnRcclxuICAgIHRoaXMuZWxlbWVudCA9ICQoZWxlbWVudCk7XHJcblxyXG4gICAgdGhpcy5iYXJlID0gZWxlbWVudDtcclxuXHJcbiAgICAvLyBGb3Igc3RhY2tpbmcgb2YgYW5pbWF0aW9uc1xyXG4gICAgdGhpcy5xdWV1ZSA9IFtdO1xyXG5cclxuICAgIC8vIEhhY2t5XHJcbiAgICB0aGlzLmxpc3RlbmluZyA9IGZhbHNlO1xyXG5cclxuICAgIC8vIEZpZ3VyZSBvdXQgd2hlcmUgdGhlIGNhbGxiYWNrIGlzXHJcbiAgICB2YXIgY2IgPSAodHlwZW9mIGNhbGxiYWNrID09IFwiZnVuY3Rpb25cIiA/IGNhbGxiYWNrIDogb3RoZXJfY2IpO1xyXG5cclxuICAgIC8vIE9wdGlvbnMgY2FuIHNvbWV0aW1lcyBiZSBhIGNvbW1hbmRcclxuICAgIHN3aXRjaChvcHRpb25zKSB7XHJcblxyXG4gICAgICBjYXNlIFwiYmx1clwiOlxyXG5cclxuICAgICAgXHRkZWZhdWx0cyA9IHtcclxuICAgICAgXHRcdGFtb3VudDogMyxcclxuICAgICAgXHRcdGR1cmF0aW9uOiAwLjUsXHJcbiAgICAgIFx0XHRmb2N1c0FmdGVyOiBudWxsXHJcbiAgICAgIFx0fTtcclxuXHJcbiAgICAgIFx0dGhpcy5vcHRpb25zID0gJC5leHRlbmQoIGRlZmF1bHRzLCBjYWxsYmFjayApO1xyXG5cclxuICBcdCAgICB0aGlzLl9ibHVyKGNiKTtcclxuXHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIFwiZm9jdXNcIjpcclxuXHJcbiAgXHQgIFx0dGhpcy5fZm9jdXMoKTtcclxuXHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIFwicm90YXRlXCI6XHJcblxyXG4gICAgICAgIGRlZmF1bHRzID0ge1xyXG4gICAgICAgICAgZGVncmVlczogMTUsXHJcbiAgICAgICAgICBkdXJhdGlvbjogMC41XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoIGRlZmF1bHRzLCBjYWxsYmFjayApO1xyXG5cclxuICAgICAgICB0aGlzLl9yb3RhdGUoY2IpO1xyXG5cclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgXCJjbGVhbnNlXCI6XHJcblxyXG4gICAgICAgIHRoaXMuY2xlYW5zZSgpO1xyXG5cclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGRlZmF1bHQ6XHJcblxyXG5cdCAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCggZGVmYXVsdHMsIG9wdGlvbnMgKTtcclxuXHJcblx0ICAgIHRoaXMuaW5pdChjYik7XHJcbiAgXHRcclxuICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhbmltby5wcm90b3R5cGUgPSB7XHJcblxyXG4gICAgLy8gQSBzdGFuZGFyZCBDU1MgYW5pbWF0aW9uXHJcbiAgICBpbml0OiBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gICAgICBcclxuICAgICAgdmFyICRtZSA9IHRoaXM7XHJcblxyXG4gICAgICAvLyBBcmUgd2Ugc3RhY2tpbmcgYW5pbWF0aW9ucz9cclxuICAgICAgaWYoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKCAkbWUub3B0aW9ucy5hbmltYXRpb24gKSA9PT0gJ1tvYmplY3QgQXJyYXldJykge1xyXG4gICAgICBcdCQubWVyZ2UoJG1lLnF1ZXVlLCAkbWUub3B0aW9ucy5hbmltYXRpb24pO1xyXG4gICAgICB9IGVsc2Uge1xyXG5cdCAgICAgICRtZS5xdWV1ZS5wdXNoKCRtZS5vcHRpb25zLmFuaW1hdGlvbik7XHJcblx0ICAgIH1cclxuXHJcblx0ICAgICRtZS5jbGVhbnNlKCk7XHJcblxyXG5cdCAgICAkbWUuYW5pbWF0ZShjYWxsYmFjayk7XHJcbiAgICAgIFxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBUaGUgYWN0dWFsIGFkZGluZyBvZiB0aGUgY2xhc3MgYW5kIGxpc3RlbmluZyBmb3IgY29tcGxldGlvblxyXG4gICAgYW5pbWF0ZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuXHJcbiAgICBcdHRoaXMuZWxlbWVudC5hZGRDbGFzcygnYW5pbWF0ZWQnKTtcclxuXHJcbiAgICAgIHRoaXMuZWxlbWVudC5hZGRDbGFzcyh0aGlzLnF1ZXVlWzBdKTtcclxuXHJcbiAgICAgIHRoaXMuZWxlbWVudC5kYXRhKFwiYW5pbW9cIiwgdGhpcy5xdWV1ZVswXSk7XHJcblxyXG4gICAgICB2YXIgYWkgPSB0aGlzLnByZWZpeGVzLmxlbmd0aDtcclxuXHJcbiAgICAgIC8vIEFkZCB0aGUgb3B0aW9ucyBmb3IgZWFjaCBwcmVmaXhcclxuICAgICAgd2hpbGUoYWktLSkge1xyXG5cclxuICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiYW5pbWF0aW9uLWR1cmF0aW9uXCIsIHRoaXMub3B0aW9ucy5kdXJhdGlvbitcInNcIik7XHJcblxyXG4gICAgICBcdHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJhbmltYXRpb24taXRlcmF0aW9uLWNvdW50XCIsIHRoaXMub3B0aW9ucy5pdGVyYXRlKTtcclxuXHJcbiAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcImFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb25cIiwgdGhpcy5vcHRpb25zLnRpbWluZyk7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgJG1lID0gdGhpcywgX2NiID0gY2FsbGJhY2s7XHJcblxyXG4gICAgICBpZigkbWUucXVldWUubGVuZ3RoPjEpIHtcclxuICAgICAgICBfY2IgPSBudWxsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBMaXN0ZW4gZm9yIHRoZSBlbmQgb2YgdGhlIGFuaW1hdGlvblxyXG4gICAgICB0aGlzLl9lbmQoXCJBbmltYXRpb25FbmRcIiwgZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIC8vIElmIHRoZXJlIGFyZSBtb3JlLCBjbGVhbiBpdCB1cCBhbmQgbW92ZSBvblxyXG4gICAgICBcdGlmKCRtZS5lbGVtZW50Lmhhc0NsYXNzKCRtZS5xdWV1ZVswXSkpIHtcclxuXHJcblx0ICAgIFx0XHRpZighJG1lLm9wdGlvbnMua2VlcCkge1xyXG4gICAgICAgICAgICAkbWUuY2xlYW5zZSgpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICRtZS5xdWV1ZS5zaGlmdCgpO1xyXG5cclxuXHQgICAgXHRcdGlmKCRtZS5xdWV1ZS5sZW5ndGgpIHtcclxuXHJcblx0XHQgICAgICBcdCRtZS5hbmltYXRlKGNhbGxiYWNrKTtcclxuXHRcdCAgICAgIH1cclxuXHRcdFx0ICB9XHJcblx0XHQgIH0sIF9jYik7XHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFuc2U6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIFx0dGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKCdhbmltYXRlZCcpO1xyXG5cclxuICBcdFx0dGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKHRoaXMucXVldWVbMF0pO1xyXG5cclxuICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKHRoaXMuZWxlbWVudC5kYXRhKFwiYW5pbW9cIikpO1xyXG5cclxuICBcdFx0dmFyIGFpID0gdGhpcy5wcmVmaXhlcy5sZW5ndGg7XHJcblxyXG4gIFx0XHR3aGlsZShhaS0tKSB7XHJcblxyXG4gICAgICBcdHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJhbmltYXRpb24tZHVyYXRpb25cIiwgXCJcIik7XHJcblxyXG4gICAgICBcdHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJhbmltYXRpb24taXRlcmF0aW9uLWNvdW50XCIsIFwiXCIpO1xyXG5cclxuICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiYW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvblwiLCBcIlwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcInRyYW5zaXRpb25cIiwgXCJcIik7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJ0cmFuc2Zvcm1cIiwgXCJcIik7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJmaWx0ZXJcIiwgXCJcIik7XHJcblxyXG4gICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9ibHVyOiBmdW5jdGlvbihjYWxsYmFjaykge1xyXG5cclxuICAgICAgaWYodGhpcy5lbGVtZW50LmlzKFwiaW1nXCIpKSB7XHJcblxyXG4gICAgICBcdHZhciBzdmdfaWQgPSBcInN2Z19cIiArICgoKDEgKyBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDAwMCkgfCAwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpO1xyXG4gICAgICBcdHZhciBmaWx0ZXJfaWQgPSBcImZpbHRlcl9cIiArICgoKDEgKyBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDAwMCkgfCAwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpO1xyXG5cclxuICAgICAgXHQkKCdib2R5JykuYXBwZW5kKCc8c3ZnIHZlcnNpb249XCIxLjFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgaWQ9XCInK3N2Z19pZCsnXCIgc3R5bGU9XCJoZWlnaHQ6MDtcIj48ZmlsdGVyIGlkPVwiJytmaWx0ZXJfaWQrJ1wiPjxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249XCInK3RoaXMub3B0aW9ucy5hbW91bnQrJ1wiIC8+PC9maWx0ZXI+PC9zdmc+Jyk7XHJcblxyXG4gICAgICBcdHZhciBhaSA9IHRoaXMucHJlZml4ZXMubGVuZ3RoO1xyXG5cclxuICAgIFx0XHR3aGlsZShhaS0tKSB7XHJcblxyXG4gICAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcImZpbHRlclwiLCBcImJsdXIoXCIrdGhpcy5vcHRpb25zLmFtb3VudCtcInB4KVwiKTtcclxuXHJcbiAgICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1widHJhbnNpdGlvblwiLCB0aGlzLm9wdGlvbnMuZHVyYXRpb24rXCJzIGFsbCBsaW5lYXJcIik7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNzcyhcImZpbHRlclwiLCBcInVybCgjXCIrZmlsdGVyX2lkK1wiKVwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmRhdGEoXCJzdmdpZFwiLCBzdmdfaWQpO1xyXG4gICAgICBcclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgdmFyIGNvbG9yID0gdGhpcy5lbGVtZW50LmNzcygnY29sb3InKTtcclxuXHJcbiAgICAgICAgdmFyIGFpID0gdGhpcy5wcmVmaXhlcy5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8vIEFkZCB0aGUgb3B0aW9ucyBmb3IgZWFjaCBwcmVmaXhcclxuICAgICAgICB3aGlsZShhaS0tKSB7XHJcblxyXG4gICAgICAgICAgdGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcInRyYW5zaXRpb25cIiwgXCJhbGwgXCIrdGhpcy5vcHRpb25zLmR1cmF0aW9uK1wicyBsaW5lYXJcIik7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNzcyhcInRleHQtc2hhZG93XCIsIFwiMCAwIFwiK3RoaXMub3B0aW9ucy5hbW91bnQrXCJweCBcIitjb2xvcik7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNzcyhcImNvbG9yXCIsIFwidHJhbnNwYXJlbnRcIik7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuX2VuZChcIlRyYW5zaXRpb25FbmRcIiwgbnVsbCwgY2FsbGJhY2spO1xyXG5cclxuICAgICAgdmFyICRtZSA9IHRoaXM7XHJcblxyXG4gICAgICBpZih0aGlzLm9wdGlvbnMuZm9jdXNBZnRlcikge1xyXG5cclxuICAgICAgICB2YXIgZm9jdXNfd2FpdCA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICRtZS5fZm9jdXMoKTtcclxuXHJcbiAgICAgICAgICBmb2N1c193YWl0ID0gd2luZG93LmNsZWFyVGltZW91dChmb2N1c193YWl0KTtcclxuXHJcbiAgICAgICAgfSwgKHRoaXMub3B0aW9ucy5mb2N1c0FmdGVyKjEwMDApKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgX2ZvY3VzOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBcdHZhciBhaSA9IHRoaXMucHJlZml4ZXMubGVuZ3RoO1xyXG5cclxuICAgICAgaWYodGhpcy5lbGVtZW50LmlzKFwiaW1nXCIpKSB7XHJcblxyXG4gICAgXHRcdHdoaWxlKGFpLS0pIHtcclxuXHJcbiAgICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiZmlsdGVyXCIsIFwiXCIpO1xyXG5cclxuICAgICAgICBcdHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJ0cmFuc2l0aW9uXCIsIFwiXCIpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciAkc3ZnID0gJCgnIycrdGhpcy5lbGVtZW50LmRhdGEoJ3N2Z2lkJykpO1xyXG5cclxuICAgICAgICAkc3ZnLnJlbW92ZSgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICB3aGlsZShhaS0tKSB7XHJcblxyXG4gICAgICAgICAgdGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcInRyYW5zaXRpb25cIiwgXCJcIik7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNzcyhcInRleHQtc2hhZG93XCIsIFwiXCIpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3MoXCJjb2xvclwiLCBcIlwiKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfcm90YXRlOiBmdW5jdGlvbihjYWxsYmFjaykge1xyXG5cclxuICAgICAgdmFyIGFpID0gdGhpcy5wcmVmaXhlcy5sZW5ndGg7XHJcblxyXG4gICAgICAvLyBBZGQgdGhlIG9wdGlvbnMgZm9yIGVhY2ggcHJlZml4XHJcbiAgICAgIHdoaWxlKGFpLS0pIHtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcInRyYW5zaXRpb25cIiwgXCJhbGwgXCIrdGhpcy5vcHRpb25zLmR1cmF0aW9uK1wicyBsaW5lYXJcIik7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJ0cmFuc2Zvcm1cIiwgXCJyb3RhdGUoXCIrdGhpcy5vcHRpb25zLmRlZ3JlZXMrXCJkZWcpXCIpO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5fZW5kKFwiVHJhbnNpdGlvbkVuZFwiLCBudWxsLCBjYWxsYmFjayk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBfZW5kOiBmdW5jdGlvbih0eXBlLCB0b2RvLCBjYWxsYmFjaykge1xyXG5cclxuICAgICAgdmFyICRtZSA9IHRoaXM7XHJcblxyXG4gICAgICB2YXIgYmluZGluZyA9IHR5cGUudG9Mb3dlckNhc2UoKStcIiB3ZWJraXRcIit0eXBlK1wiIG9cIit0eXBlK1wiIE1TXCIrdHlwZTtcclxuXHJcbiAgICAgIHRoaXMuZWxlbWVudC5iaW5kKGJpbmRpbmcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIFxyXG4gICAgICAgICRtZS5lbGVtZW50LnVuYmluZChiaW5kaW5nKTtcclxuXHJcbiAgICAgICAgaWYodHlwZW9mIHRvZG8gPT0gXCJmdW5jdGlvblwiKSB7XHJcblxyXG4gICAgICAgICAgdG9kbygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYodHlwZW9mIGNhbGxiYWNrID09IFwiZnVuY3Rpb25cIikge1xyXG5cclxuICAgICAgICAgIGNhbGxiYWNrKCRtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgXHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJC5mbi5hbmltbyA9IGZ1bmN0aW9uICggb3B0aW9ucywgY2FsbGJhY2ssIG90aGVyX2NiICkge1xyXG4gICAgXHJcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcclxuXHRcdFx0bmV3IGFuaW1vKCB0aGlzLCBvcHRpb25zLCBjYWxsYmFjaywgb3RoZXJfY2IgKTtcclxuXHJcblx0XHR9KTtcclxuXHJcbiAgfTtcclxuXHJcbn0pKCBqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQgKTsiLCIvKiFcclxuICogTW9ja0pheCAtIGpRdWVyeSBQbHVnaW4gdG8gTW9jayBBamF4IHJlcXVlc3RzXHJcbiAqXHJcbiAqIFZlcnNpb246ICAxLjUuM1xyXG4gKiBSZWxlYXNlZDpcclxuICogSG9tZTogICBodHRwOi8vZ2l0aHViLmNvbS9hcHBlbmR0by9qcXVlcnktbW9ja2pheFxyXG4gKiBBdXRob3I6ICAgSm9uYXRoYW4gU2hhcnAgKGh0dHA6Ly9qZHNoYXJwLmNvbSlcclxuICogTGljZW5zZTogIE1JVCxHUExcclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDExIGFwcGVuZFRvIExMQy5cclxuICogRHVhbCBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIG9yIEdQTCBsaWNlbnNlcy5cclxuICogaHR0cDovL2FwcGVuZHRvLmNvbS9vcGVuLXNvdXJjZS1saWNlbnNlc1xyXG4gKi9cclxuKGZ1bmN0aW9uKCQpIHtcclxuXHR2YXIgX2FqYXggPSAkLmFqYXgsXHJcblx0XHRtb2NrSGFuZGxlcnMgPSBbXSxcclxuXHRcdG1vY2tlZEFqYXhDYWxscyA9IFtdLFxyXG5cdFx0Q0FMTEJBQ0tfUkVHRVggPSAvPVxcPygmfCQpLyxcclxuXHRcdGpzYyA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XHJcblxyXG5cclxuXHQvLyBQYXJzZSB0aGUgZ2l2ZW4gWE1MIHN0cmluZy5cclxuXHRmdW5jdGlvbiBwYXJzZVhNTCh4bWwpIHtcclxuXHRcdGlmICggd2luZG93LkRPTVBhcnNlciA9PSB1bmRlZmluZWQgJiYgd2luZG93LkFjdGl2ZVhPYmplY3QgKSB7XHJcblx0XHRcdERPTVBhcnNlciA9IGZ1bmN0aW9uKCkgeyB9O1xyXG5cdFx0XHRET01QYXJzZXIucHJvdG90eXBlLnBhcnNlRnJvbVN0cmluZyA9IGZ1bmN0aW9uKCB4bWxTdHJpbmcgKSB7XHJcblx0XHRcdFx0dmFyIGRvYyA9IG5ldyBBY3RpdmVYT2JqZWN0KCdNaWNyb3NvZnQuWE1MRE9NJyk7XHJcblx0XHRcdFx0ZG9jLmFzeW5jID0gJ2ZhbHNlJztcclxuXHRcdFx0XHRkb2MubG9hZFhNTCggeG1sU3RyaW5nICk7XHJcblx0XHRcdFx0cmV0dXJuIGRvYztcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHJcblx0XHR0cnkge1xyXG5cdFx0XHR2YXIgeG1sRG9jID0gKCBuZXcgRE9NUGFyc2VyKCkgKS5wYXJzZUZyb21TdHJpbmcoIHhtbCwgJ3RleHQveG1sJyApO1xyXG5cdFx0XHRpZiAoICQuaXNYTUxEb2MoIHhtbERvYyApICkge1xyXG5cdFx0XHRcdHZhciBlcnIgPSAkKCdwYXJzZXJlcnJvcicsIHhtbERvYyk7XHJcblx0XHRcdFx0aWYgKCBlcnIubGVuZ3RoID09IDEgKSB7XHJcblx0XHRcdFx0XHR0aHJvdygnRXJyb3I6ICcgKyAkKHhtbERvYykudGV4dCgpICk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRocm93KCdVbmFibGUgdG8gcGFyc2UgWE1MJyk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHhtbERvYztcclxuXHRcdH0gY2F0Y2goIGUgKSB7XHJcblx0XHRcdHZhciBtc2cgPSAoIGUubmFtZSA9PSB1bmRlZmluZWQgPyBlIDogZS5uYW1lICsgJzogJyArIGUubWVzc2FnZSApO1xyXG5cdFx0XHQkKGRvY3VtZW50KS50cmlnZ2VyKCd4bWxQYXJzZUVycm9yJywgWyBtc2cgXSk7XHJcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBUcmlnZ2VyIGEgalF1ZXJ5IGV2ZW50XHJcblx0ZnVuY3Rpb24gdHJpZ2dlcihzLCB0eXBlLCBhcmdzKSB7XHJcblx0XHQocy5jb250ZXh0ID8gJChzLmNvbnRleHQpIDogJC5ldmVudCkudHJpZ2dlcih0eXBlLCBhcmdzKTtcclxuXHR9XHJcblxyXG5cdC8vIENoZWNrIGlmIHRoZSBkYXRhIGZpZWxkIG9uIHRoZSBtb2NrIGhhbmRsZXIgYW5kIHRoZSByZXF1ZXN0IG1hdGNoLiBUaGlzXHJcblx0Ly8gY2FuIGJlIHVzZWQgdG8gcmVzdHJpY3QgYSBtb2NrIGhhbmRsZXIgdG8gYmVpbmcgdXNlZCBvbmx5IHdoZW4gYSBjZXJ0YWluXHJcblx0Ly8gc2V0IG9mIGRhdGEgaXMgcGFzc2VkIHRvIGl0LlxyXG5cdGZ1bmN0aW9uIGlzTW9ja0RhdGFFcXVhbCggbW9jaywgbGl2ZSApIHtcclxuXHRcdHZhciBpZGVudGljYWwgPSB0cnVlO1xyXG5cdFx0Ly8gVGVzdCBmb3Igc2l0dWF0aW9ucyB3aGVyZSB0aGUgZGF0YSBpcyBhIHF1ZXJ5c3RyaW5nIChub3QgYW4gb2JqZWN0KVxyXG5cdFx0aWYgKHR5cGVvZiBsaXZlID09PSAnc3RyaW5nJykge1xyXG5cdFx0XHQvLyBRdWVyeXN0cmluZyBtYXkgYmUgYSByZWdleFxyXG5cdFx0XHRyZXR1cm4gJC5pc0Z1bmN0aW9uKCBtb2NrLnRlc3QgKSA/IG1vY2sudGVzdChsaXZlKSA6IG1vY2sgPT0gbGl2ZTtcclxuXHRcdH1cclxuXHRcdCQuZWFjaChtb2NrLCBmdW5jdGlvbihrKSB7XHJcblx0XHRcdGlmICggbGl2ZVtrXSA9PT0gdW5kZWZpbmVkICkge1xyXG5cdFx0XHRcdGlkZW50aWNhbCA9IGZhbHNlO1xyXG5cdFx0XHRcdHJldHVybiBpZGVudGljYWw7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aWYgKCB0eXBlb2YgbGl2ZVtrXSA9PT0gJ29iamVjdCcgJiYgbGl2ZVtrXSAhPT0gbnVsbCApIHtcclxuXHRcdFx0XHRcdGlmICggaWRlbnRpY2FsICYmICQuaXNBcnJheSggbGl2ZVtrXSApICkge1xyXG5cdFx0XHRcdFx0XHRpZGVudGljYWwgPSAkLmlzQXJyYXkoIG1vY2tba10gKSAmJiBsaXZlW2tdLmxlbmd0aCA9PT0gbW9ja1trXS5sZW5ndGg7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZGVudGljYWwgPSBpZGVudGljYWwgJiYgaXNNb2NrRGF0YUVxdWFsKG1vY2tba10sIGxpdmVba10pO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRpZiAoIG1vY2tba10gJiYgJC5pc0Z1bmN0aW9uKCBtb2NrW2tdLnRlc3QgKSApIHtcclxuXHRcdFx0XHRcdFx0aWRlbnRpY2FsID0gaWRlbnRpY2FsICYmIG1vY2tba10udGVzdChsaXZlW2tdKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdGlkZW50aWNhbCA9IGlkZW50aWNhbCAmJiAoIG1vY2tba10gPT0gbGl2ZVtrXSApO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0cmV0dXJuIGlkZW50aWNhbDtcclxuXHR9XHJcblxyXG4gICAgLy8gU2VlIGlmIGEgbW9jayBoYW5kbGVyIHByb3BlcnR5IG1hdGNoZXMgdGhlIGRlZmF1bHQgc2V0dGluZ3NcclxuICAgIGZ1bmN0aW9uIGlzRGVmYXVsdFNldHRpbmcoaGFuZGxlciwgcHJvcGVydHkpIHtcclxuICAgICAgICByZXR1cm4gaGFuZGxlcltwcm9wZXJ0eV0gPT09ICQubW9ja2pheFNldHRpbmdzW3Byb3BlcnR5XTtcclxuICAgIH1cclxuXHJcblx0Ly8gQ2hlY2sgdGhlIGdpdmVuIGhhbmRsZXIgc2hvdWxkIG1vY2sgdGhlIGdpdmVuIHJlcXVlc3RcclxuXHRmdW5jdGlvbiBnZXRNb2NrRm9yUmVxdWVzdCggaGFuZGxlciwgcmVxdWVzdFNldHRpbmdzICkge1xyXG5cdFx0Ly8gSWYgdGhlIG1vY2sgd2FzIHJlZ2lzdGVyZWQgd2l0aCBhIGZ1bmN0aW9uLCBsZXQgdGhlIGZ1bmN0aW9uIGRlY2lkZSBpZiB3ZVxyXG5cdFx0Ly8gd2FudCB0byBtb2NrIHRoaXMgcmVxdWVzdFxyXG5cdFx0aWYgKCAkLmlzRnVuY3Rpb24oaGFuZGxlcikgKSB7XHJcblx0XHRcdHJldHVybiBoYW5kbGVyKCByZXF1ZXN0U2V0dGluZ3MgKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBJbnNwZWN0IHRoZSBVUkwgb2YgdGhlIHJlcXVlc3QgYW5kIGNoZWNrIGlmIHRoZSBtb2NrIGhhbmRsZXIncyB1cmxcclxuXHRcdC8vIG1hdGNoZXMgdGhlIHVybCBmb3IgdGhpcyBhamF4IHJlcXVlc3RcclxuXHRcdGlmICggJC5pc0Z1bmN0aW9uKGhhbmRsZXIudXJsLnRlc3QpICkge1xyXG5cdFx0XHQvLyBUaGUgdXNlciBwcm92aWRlZCBhIHJlZ2V4IGZvciB0aGUgdXJsLCB0ZXN0IGl0XHJcblx0XHRcdGlmICggIWhhbmRsZXIudXJsLnRlc3QoIHJlcXVlc3RTZXR0aW5ncy51cmwgKSApIHtcclxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gTG9vayBmb3IgYSBzaW1wbGUgd2lsZGNhcmQgJyonIG9yIGEgZGlyZWN0IFVSTCBtYXRjaFxyXG5cdFx0XHR2YXIgc3RhciA9IGhhbmRsZXIudXJsLmluZGV4T2YoJyonKTtcclxuXHRcdFx0aWYgKGhhbmRsZXIudXJsICE9PSByZXF1ZXN0U2V0dGluZ3MudXJsICYmIHN0YXIgPT09IC0xIHx8XHJcblx0XHRcdFx0XHQhbmV3IFJlZ0V4cChoYW5kbGVyLnVybC5yZXBsYWNlKC9bLVtcXF17fSgpKz8uLFxcXFxeJHwjXFxzXS9nLCBcIlxcXFwkJlwiKS5yZXBsYWNlKC9cXCovZywgJy4rJykpLnRlc3QocmVxdWVzdFNldHRpbmdzLnVybCkpIHtcclxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEluc3BlY3QgdGhlIGRhdGEgc3VibWl0dGVkIGluIHRoZSByZXF1ZXN0IChlaXRoZXIgUE9TVCBib2R5IG9yIEdFVCBxdWVyeSBzdHJpbmcpXHJcblx0XHRpZiAoIGhhbmRsZXIuZGF0YSApIHtcclxuXHRcdFx0aWYgKCAhIHJlcXVlc3RTZXR0aW5ncy5kYXRhIHx8ICFpc01vY2tEYXRhRXF1YWwoaGFuZGxlci5kYXRhLCByZXF1ZXN0U2V0dGluZ3MuZGF0YSkgKSB7XHJcblx0XHRcdFx0Ly8gVGhleSdyZSBub3QgaWRlbnRpY2FsLCBkbyBub3QgbW9jayB0aGlzIHJlcXVlc3RcclxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly8gSW5zcGVjdCB0aGUgcmVxdWVzdCB0eXBlXHJcblx0XHRpZiAoIGhhbmRsZXIgJiYgaGFuZGxlci50eXBlICYmXHJcblx0XHRcdFx0aGFuZGxlci50eXBlLnRvTG93ZXJDYXNlKCkgIT0gcmVxdWVzdFNldHRpbmdzLnR5cGUudG9Mb3dlckNhc2UoKSApIHtcclxuXHRcdFx0Ly8gVGhlIHJlcXVlc3QgdHlwZSBkb2Vzbid0IG1hdGNoIChHRVQgdnMuIFBPU1QpXHJcblx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBoYW5kbGVyO1xyXG5cdH1cclxuXHJcblx0Ly8gUHJvY2VzcyB0aGUgeGhyIG9iamVjdHMgc2VuZCBvcGVyYXRpb25cclxuXHRmdW5jdGlvbiBfeGhyU2VuZChtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MpIHtcclxuXHJcblx0XHQvLyBUaGlzIGlzIGEgc3Vic3RpdHV0ZSBmb3IgPCAxLjQgd2hpY2ggbGFja3MgJC5wcm94eVxyXG5cdFx0dmFyIHByb2Nlc3MgPSAoZnVuY3Rpb24odGhhdCkge1xyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0cmV0dXJuIChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdHZhciBvblJlYWR5O1xyXG5cclxuXHRcdFx0XHRcdC8vIFRoZSByZXF1ZXN0IGhhcyByZXR1cm5lZFxyXG5cdFx0XHRcdFx0dGhpcy5zdGF0dXMgICAgID0gbW9ja0hhbmRsZXIuc3RhdHVzO1xyXG5cdFx0XHRcdFx0dGhpcy5zdGF0dXNUZXh0ID0gbW9ja0hhbmRsZXIuc3RhdHVzVGV4dDtcclxuXHRcdFx0XHRcdHRoaXMucmVhZHlTdGF0ZVx0PSA0O1xyXG5cclxuXHRcdFx0XHRcdC8vIFdlIGhhdmUgYW4gZXhlY3V0YWJsZSBmdW5jdGlvbiwgY2FsbCBpdCB0byBnaXZlXHJcblx0XHRcdFx0XHQvLyB0aGUgbW9jayBoYW5kbGVyIGEgY2hhbmNlIHRvIHVwZGF0ZSBpdCdzIGRhdGFcclxuXHRcdFx0XHRcdGlmICggJC5pc0Z1bmN0aW9uKG1vY2tIYW5kbGVyLnJlc3BvbnNlKSApIHtcclxuXHRcdFx0XHRcdFx0bW9ja0hhbmRsZXIucmVzcG9uc2Uob3JpZ1NldHRpbmdzKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8vIENvcHkgb3ZlciBvdXIgbW9jayB0byBvdXIgeGhyIG9iamVjdCBiZWZvcmUgcGFzc2luZyBjb250cm9sIGJhY2sgdG9cclxuXHRcdFx0XHRcdC8vIGpRdWVyeSdzIG9ucmVhZHlzdGF0ZWNoYW5nZSBjYWxsYmFja1xyXG5cdFx0XHRcdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgPT0gJ2pzb24nICYmICggdHlwZW9mIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCA9PSAnb2JqZWN0JyApICkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLnJlc3BvbnNlVGV4dCA9IEpTT04uc3RyaW5naWZ5KG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCk7XHJcblx0XHRcdFx0XHR9IGVsc2UgaWYgKCByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgPT0gJ3htbCcgKSB7XHJcblx0XHRcdFx0XHRcdGlmICggdHlwZW9mIG1vY2tIYW5kbGVyLnJlc3BvbnNlWE1MID09ICdzdHJpbmcnICkge1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2VYTUwgPSBwYXJzZVhNTChtb2NrSGFuZGxlci5yZXNwb25zZVhNTCk7XHJcblx0XHRcdFx0XHRcdFx0Ly9pbiBqUXVlcnkgMS45LjErLCByZXNwb25zZVhNTCBpcyBwcm9jZXNzZWQgZGlmZmVyZW50bHkgYW5kIHJlbGllcyBvbiByZXNwb25zZVRleHRcclxuXHRcdFx0XHRcdFx0XHR0aGlzLnJlc3BvbnNlVGV4dCA9IG1vY2tIYW5kbGVyLnJlc3BvbnNlWE1MO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2VYTUwgPSBtb2NrSGFuZGxlci5yZXNwb25zZVhNTDtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5yZXNwb25zZVRleHQgPSBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQ7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZiggdHlwZW9mIG1vY2tIYW5kbGVyLnN0YXR1cyA9PSAnbnVtYmVyJyB8fCB0eXBlb2YgbW9ja0hhbmRsZXIuc3RhdHVzID09ICdzdHJpbmcnICkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLnN0YXR1cyA9IG1vY2tIYW5kbGVyLnN0YXR1cztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGlmKCB0eXBlb2YgbW9ja0hhbmRsZXIuc3RhdHVzVGV4dCA9PT0gXCJzdHJpbmdcIikge1xyXG5cdFx0XHRcdFx0XHR0aGlzLnN0YXR1c1RleHQgPSBtb2NrSGFuZGxlci5zdGF0dXNUZXh0O1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0Ly8galF1ZXJ5IDIuMCByZW5hbWVkIG9ucmVhZHlzdGF0ZWNoYW5nZSB0byBvbmxvYWRcclxuXHRcdFx0XHRcdG9uUmVhZHkgPSB0aGlzLm9ucmVhZHlzdGF0ZWNoYW5nZSB8fCB0aGlzLm9ubG9hZDtcclxuXHJcblx0XHRcdFx0XHQvLyBqUXVlcnkgPCAxLjQgZG9lc24ndCBoYXZlIG9ucmVhZHlzdGF0ZSBjaGFuZ2UgZm9yIHhoclxyXG5cdFx0XHRcdFx0aWYgKCAkLmlzRnVuY3Rpb24oIG9uUmVhZHkgKSApIHtcclxuXHRcdFx0XHRcdFx0aWYoIG1vY2tIYW5kbGVyLmlzVGltZW91dCkge1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMuc3RhdHVzID0gLTE7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0b25SZWFkeS5jYWxsKCB0aGlzLCBtb2NrSGFuZGxlci5pc1RpbWVvdXQgPyAndGltZW91dCcgOiB1bmRlZmluZWQgKTtcclxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoIG1vY2tIYW5kbGVyLmlzVGltZW91dCApIHtcclxuXHRcdFx0XHRcdFx0Ly8gRml4IGZvciAxLjMuMiB0aW1lb3V0IHRvIGtlZXAgc3VjY2VzcyBmcm9tIGZpcmluZy5cclxuXHRcdFx0XHRcdFx0dGhpcy5zdGF0dXMgPSAtMTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KS5hcHBseSh0aGF0KTtcclxuXHRcdFx0fTtcclxuXHRcdH0pKHRoaXMpO1xyXG5cclxuXHRcdGlmICggbW9ja0hhbmRsZXIucHJveHkgKSB7XHJcblx0XHRcdC8vIFdlJ3JlIHByb3h5aW5nIHRoaXMgcmVxdWVzdCBhbmQgbG9hZGluZyBpbiBhbiBleHRlcm5hbCBmaWxlIGluc3RlYWRcclxuXHRcdFx0X2FqYXgoe1xyXG5cdFx0XHRcdGdsb2JhbDogZmFsc2UsXHJcblx0XHRcdFx0dXJsOiBtb2NrSGFuZGxlci5wcm94eSxcclxuXHRcdFx0XHR0eXBlOiBtb2NrSGFuZGxlci5wcm94eVR5cGUsXHJcblx0XHRcdFx0ZGF0YTogbW9ja0hhbmRsZXIuZGF0YSxcclxuXHRcdFx0XHRkYXRhVHlwZTogcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlID09PSBcInNjcmlwdFwiID8gXCJ0ZXh0L3BsYWluXCIgOiByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUsXHJcblx0XHRcdFx0Y29tcGxldGU6IGZ1bmN0aW9uKHhocikge1xyXG5cdFx0XHRcdFx0bW9ja0hhbmRsZXIucmVzcG9uc2VYTUwgPSB4aHIucmVzcG9uc2VYTUw7XHJcblx0XHRcdFx0XHRtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgPSB4aHIucmVzcG9uc2VUZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIERvbid0IG92ZXJyaWRlIHRoZSBoYW5kbGVyIHN0YXR1cy9zdGF0dXNUZXh0IGlmIGl0J3Mgc3BlY2lmaWVkIGJ5IHRoZSBjb25maWdcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNEZWZhdWx0U2V0dGluZyhtb2NrSGFuZGxlciwgJ3N0YXR1cycpKSB7XHJcblx0XHRcdFx0XHQgICAgbW9ja0hhbmRsZXIuc3RhdHVzID0geGhyLnN0YXR1cztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzRGVmYXVsdFNldHRpbmcobW9ja0hhbmRsZXIsICdzdGF0dXNUZXh0JykpIHtcclxuXHRcdFx0XHRcdCAgICBtb2NrSGFuZGxlci5zdGF0dXNUZXh0ID0geGhyLnN0YXR1c1RleHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuXHRcdFx0XHRcdHRoaXMucmVzcG9uc2VUaW1lciA9IHNldFRpbWVvdXQocHJvY2VzcywgbW9ja0hhbmRsZXIucmVzcG9uc2VUaW1lIHx8IDApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyB0eXBlID09ICdQT1NUJyB8fCAnR0VUJyB8fCAnREVMRVRFJ1xyXG5cdFx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5hc3luYyA9PT0gZmFsc2UgKSB7XHJcblx0XHRcdFx0Ly8gVE9ETzogQmxvY2tpbmcgZGVsYXlcclxuXHRcdFx0XHRwcm9jZXNzKCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy5yZXNwb25zZVRpbWVyID0gc2V0VGltZW91dChwcm9jZXNzLCBtb2NrSGFuZGxlci5yZXNwb25zZVRpbWUgfHwgNTApO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBDb25zdHJ1Y3QgYSBtb2NrZWQgWEhSIE9iamVjdFxyXG5cdGZ1bmN0aW9uIHhocihtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MsIG9yaWdIYW5kbGVyKSB7XHJcblx0XHQvLyBFeHRlbmQgd2l0aCBvdXIgZGVmYXVsdCBtb2NramF4IHNldHRpbmdzXHJcblx0XHRtb2NrSGFuZGxlciA9ICQuZXh0ZW5kKHRydWUsIHt9LCAkLm1vY2tqYXhTZXR0aW5ncywgbW9ja0hhbmRsZXIpO1xyXG5cclxuXHRcdGlmICh0eXBlb2YgbW9ja0hhbmRsZXIuaGVhZGVycyA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuXHRcdFx0bW9ja0hhbmRsZXIuaGVhZGVycyA9IHt9O1xyXG5cdFx0fVxyXG5cdFx0aWYgKCBtb2NrSGFuZGxlci5jb250ZW50VHlwZSApIHtcclxuXHRcdFx0bW9ja0hhbmRsZXIuaGVhZGVyc1snY29udGVudC10eXBlJ10gPSBtb2NrSGFuZGxlci5jb250ZW50VHlwZTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRzdGF0dXM6IG1vY2tIYW5kbGVyLnN0YXR1cyxcclxuXHRcdFx0c3RhdHVzVGV4dDogbW9ja0hhbmRsZXIuc3RhdHVzVGV4dCxcclxuXHRcdFx0cmVhZHlTdGF0ZTogMSxcclxuXHRcdFx0b3BlbjogZnVuY3Rpb24oKSB7IH0sXHJcblx0XHRcdHNlbmQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdG9yaWdIYW5kbGVyLmZpcmVkID0gdHJ1ZTtcclxuXHRcdFx0XHRfeGhyU2VuZC5jYWxsKHRoaXMsIG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncyk7XHJcblx0XHRcdH0sXHJcblx0XHRcdGFib3J0OiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjbGVhclRpbWVvdXQodGhpcy5yZXNwb25zZVRpbWVyKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0c2V0UmVxdWVzdEhlYWRlcjogZnVuY3Rpb24oaGVhZGVyLCB2YWx1ZSkge1xyXG5cdFx0XHRcdG1vY2tIYW5kbGVyLmhlYWRlcnNbaGVhZGVyXSA9IHZhbHVlO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRnZXRSZXNwb25zZUhlYWRlcjogZnVuY3Rpb24oaGVhZGVyKSB7XHJcblx0XHRcdFx0Ly8gJ0xhc3QtbW9kaWZpZWQnLCAnRXRhZycsICdjb250ZW50LXR5cGUnIGFyZSBhbGwgY2hlY2tlZCBieSBqUXVlcnlcclxuXHRcdFx0XHRpZiAoIG1vY2tIYW5kbGVyLmhlYWRlcnMgJiYgbW9ja0hhbmRsZXIuaGVhZGVyc1toZWFkZXJdICkge1xyXG5cdFx0XHRcdFx0Ly8gUmV0dXJuIGFyYml0cmFyeSBoZWFkZXJzXHJcblx0XHRcdFx0XHRyZXR1cm4gbW9ja0hhbmRsZXIuaGVhZGVyc1toZWFkZXJdO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAoIGhlYWRlci50b0xvd2VyQ2FzZSgpID09ICdsYXN0LW1vZGlmaWVkJyApIHtcclxuXHRcdFx0XHRcdHJldHVybiBtb2NrSGFuZGxlci5sYXN0TW9kaWZpZWQgfHwgKG5ldyBEYXRlKCkpLnRvU3RyaW5nKCk7XHJcblx0XHRcdFx0fSBlbHNlIGlmICggaGVhZGVyLnRvTG93ZXJDYXNlKCkgPT0gJ2V0YWcnICkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIG1vY2tIYW5kbGVyLmV0YWcgfHwgJyc7XHJcblx0XHRcdFx0fSBlbHNlIGlmICggaGVhZGVyLnRvTG93ZXJDYXNlKCkgPT0gJ2NvbnRlbnQtdHlwZScgKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gbW9ja0hhbmRsZXIuY29udGVudFR5cGUgfHwgJ3RleHQvcGxhaW4nO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHRcdFx0Z2V0QWxsUmVzcG9uc2VIZWFkZXJzOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR2YXIgaGVhZGVycyA9ICcnO1xyXG5cdFx0XHRcdCQuZWFjaChtb2NrSGFuZGxlci5oZWFkZXJzLCBmdW5jdGlvbihrLCB2KSB7XHJcblx0XHRcdFx0XHRoZWFkZXJzICs9IGsgKyAnOiAnICsgdiArIFwiXFxuXCI7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0cmV0dXJuIGhlYWRlcnM7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHQvLyBQcm9jZXNzIGEgSlNPTlAgbW9jayByZXF1ZXN0LlxyXG5cdGZ1bmN0aW9uIHByb2Nlc3NKc29ucE1vY2soIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyApIHtcclxuXHRcdC8vIEhhbmRsZSBKU09OUCBQYXJhbWV0ZXIgQ2FsbGJhY2tzLCB3ZSBuZWVkIHRvIHJlcGxpY2F0ZSBzb21lIG9mIHRoZSBqUXVlcnkgY29yZSBoZXJlXHJcblx0XHQvLyBiZWNhdXNlIHRoZXJlIGlzbid0IGFuIGVhc3kgaG9vayBmb3IgdGhlIGNyb3NzIGRvbWFpbiBzY3JpcHQgdGFnIG9mIGpzb25wXHJcblxyXG5cdFx0cHJvY2Vzc0pzb25wVXJsKCByZXF1ZXN0U2V0dGluZ3MgKTtcclxuXHJcblx0XHRyZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgPSBcImpzb25cIjtcclxuXHRcdGlmKHJlcXVlc3RTZXR0aW5ncy5kYXRhICYmIENBTExCQUNLX1JFR0VYLnRlc3QocmVxdWVzdFNldHRpbmdzLmRhdGEpIHx8IENBTExCQUNLX1JFR0VYLnRlc3QocmVxdWVzdFNldHRpbmdzLnVybCkpIHtcclxuXHRcdFx0Y3JlYXRlSnNvbnBDYWxsYmFjayhyZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MpO1xyXG5cclxuXHRcdFx0Ly8gV2UgbmVlZCB0byBtYWtlIHN1cmVcclxuXHRcdFx0Ly8gdGhhdCBhIEpTT05QIHN0eWxlIHJlc3BvbnNlIGlzIGV4ZWN1dGVkIHByb3Blcmx5XHJcblxyXG5cdFx0XHR2YXIgcnVybCA9IC9eKFxcdys6KT9cXC9cXC8oW15cXC8/I10rKS8sXHJcblx0XHRcdFx0cGFydHMgPSBydXJsLmV4ZWMoIHJlcXVlc3RTZXR0aW5ncy51cmwgKSxcclxuXHRcdFx0XHRyZW1vdGUgPSBwYXJ0cyAmJiAocGFydHNbMV0gJiYgcGFydHNbMV0gIT09IGxvY2F0aW9uLnByb3RvY29sIHx8IHBhcnRzWzJdICE9PSBsb2NhdGlvbi5ob3N0KTtcclxuXHJcblx0XHRcdHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSA9IFwic2NyaXB0XCI7XHJcblx0XHRcdGlmKHJlcXVlc3RTZXR0aW5ncy50eXBlLnRvVXBwZXJDYXNlKCkgPT09IFwiR0VUXCIgJiYgcmVtb3RlICkge1xyXG5cdFx0XHRcdHZhciBuZXdNb2NrUmV0dXJuID0gcHJvY2Vzc0pzb25wUmVxdWVzdCggcmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzICk7XHJcblxyXG5cdFx0XHRcdC8vIENoZWNrIGlmIHdlIGFyZSBzdXBwb3NlZCB0byByZXR1cm4gYSBEZWZlcnJlZCBiYWNrIHRvIHRoZSBtb2NrIGNhbGwsIG9yIGp1c3RcclxuXHRcdFx0XHQvLyBzaWduYWwgc3VjY2Vzc1xyXG5cdFx0XHRcdGlmKG5ld01vY2tSZXR1cm4pIHtcclxuXHRcdFx0XHRcdHJldHVybiBuZXdNb2NrUmV0dXJuO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBudWxsO1xyXG5cdH1cclxuXHJcblx0Ly8gQXBwZW5kIHRoZSByZXF1aXJlZCBjYWxsYmFjayBwYXJhbWV0ZXIgdG8gdGhlIGVuZCBvZiB0aGUgcmVxdWVzdCBVUkwsIGZvciBhIEpTT05QIHJlcXVlc3RcclxuXHRmdW5jdGlvbiBwcm9jZXNzSnNvbnBVcmwoIHJlcXVlc3RTZXR0aW5ncyApIHtcclxuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLnR5cGUudG9VcHBlckNhc2UoKSA9PT0gXCJHRVRcIiApIHtcclxuXHRcdFx0aWYgKCAhQ0FMTEJBQ0tfUkVHRVgudGVzdCggcmVxdWVzdFNldHRpbmdzLnVybCApICkge1xyXG5cdFx0XHRcdHJlcXVlc3RTZXR0aW5ncy51cmwgKz0gKC9cXD8vLnRlc3QoIHJlcXVlc3RTZXR0aW5ncy51cmwgKSA/IFwiJlwiIDogXCI/XCIpICtcclxuXHRcdFx0XHRcdChyZXF1ZXN0U2V0dGluZ3MuanNvbnAgfHwgXCJjYWxsYmFja1wiKSArIFwiPT9cIjtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIGlmICggIXJlcXVlc3RTZXR0aW5ncy5kYXRhIHx8ICFDQUxMQkFDS19SRUdFWC50ZXN0KHJlcXVlc3RTZXR0aW5ncy5kYXRhKSApIHtcclxuXHRcdFx0cmVxdWVzdFNldHRpbmdzLmRhdGEgPSAocmVxdWVzdFNldHRpbmdzLmRhdGEgPyByZXF1ZXN0U2V0dGluZ3MuZGF0YSArIFwiJlwiIDogXCJcIikgKyAocmVxdWVzdFNldHRpbmdzLmpzb25wIHx8IFwiY2FsbGJhY2tcIikgKyBcIj0/XCI7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBQcm9jZXNzIGEgSlNPTlAgcmVxdWVzdCBieSBldmFsdWF0aW5nIHRoZSBtb2NrZWQgcmVzcG9uc2UgdGV4dFxyXG5cdGZ1bmN0aW9uIHByb2Nlc3NKc29ucFJlcXVlc3QoIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyApIHtcclxuXHRcdC8vIFN5bnRoZXNpemUgdGhlIG1vY2sgcmVxdWVzdCBmb3IgYWRkaW5nIGEgc2NyaXB0IHRhZ1xyXG5cdFx0dmFyIGNhbGxiYWNrQ29udGV4dCA9IG9yaWdTZXR0aW5ncyAmJiBvcmlnU2V0dGluZ3MuY29udGV4dCB8fCByZXF1ZXN0U2V0dGluZ3MsXHJcblx0XHRcdG5ld01vY2sgPSBudWxsO1xyXG5cclxuXHJcblx0XHQvLyBJZiB0aGUgcmVzcG9uc2UgaGFuZGxlciBvbiB0aGUgbW9vY2sgaXMgYSBmdW5jdGlvbiwgY2FsbCBpdFxyXG5cdFx0aWYgKCBtb2NrSGFuZGxlci5yZXNwb25zZSAmJiAkLmlzRnVuY3Rpb24obW9ja0hhbmRsZXIucmVzcG9uc2UpICkge1xyXG5cdFx0XHRtb2NrSGFuZGxlci5yZXNwb25zZShvcmlnU2V0dGluZ3MpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdC8vIEV2YWx1YXRlIHRoZSByZXNwb25zZVRleHQgamF2YXNjcmlwdCBpbiBhIGdsb2JhbCBjb250ZXh0XHJcblx0XHRcdGlmKCB0eXBlb2YgbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ID09PSAnb2JqZWN0JyApIHtcclxuXHRcdFx0XHQkLmdsb2JhbEV2YWwoICcoJyArIEpTT04uc3RyaW5naWZ5KCBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgKSArICcpJyk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0JC5nbG9iYWxFdmFsKCAnKCcgKyBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgKyAnKScpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gU3VjY2Vzc2Z1bCByZXNwb25zZVxyXG5cdFx0anNvbnBTdWNjZXNzKCByZXF1ZXN0U2V0dGluZ3MsIGNhbGxiYWNrQ29udGV4dCwgbW9ja0hhbmRsZXIgKTtcclxuXHRcdGpzb25wQ29tcGxldGUoIHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0LCBtb2NrSGFuZGxlciApO1xyXG5cclxuXHRcdC8vIElmIHdlIGFyZSBydW5uaW5nIHVuZGVyIGpRdWVyeSAxLjUrLCByZXR1cm4gYSBkZWZlcnJlZCBvYmplY3RcclxuXHRcdGlmKCQuRGVmZXJyZWQpe1xyXG5cdFx0XHRuZXdNb2NrID0gbmV3ICQuRGVmZXJyZWQoKTtcclxuXHRcdFx0aWYodHlwZW9mIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCA9PSBcIm9iamVjdFwiKXtcclxuXHRcdFx0XHRuZXdNb2NrLnJlc29sdmVXaXRoKCBjYWxsYmFja0NvbnRleHQsIFttb2NrSGFuZGxlci5yZXNwb25zZVRleHRdICk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRuZXdNb2NrLnJlc29sdmVXaXRoKCBjYWxsYmFja0NvbnRleHQsIFskLnBhcnNlSlNPTiggbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ICldICk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBuZXdNb2NrO1xyXG5cdH1cclxuXHJcblxyXG5cdC8vIENyZWF0ZSB0aGUgcmVxdWlyZWQgSlNPTlAgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIHRoZSByZXF1ZXN0XHJcblx0ZnVuY3Rpb24gY3JlYXRlSnNvbnBDYWxsYmFjayggcmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzICkge1xyXG5cdFx0dmFyIGNhbGxiYWNrQ29udGV4dCA9IG9yaWdTZXR0aW5ncyAmJiBvcmlnU2V0dGluZ3MuY29udGV4dCB8fCByZXF1ZXN0U2V0dGluZ3M7XHJcblx0XHR2YXIganNvbnAgPSByZXF1ZXN0U2V0dGluZ3MuanNvbnBDYWxsYmFjayB8fCAoXCJqc29ucFwiICsganNjKyspO1xyXG5cclxuXHRcdC8vIFJlcGxhY2UgdGhlID0/IHNlcXVlbmNlIGJvdGggaW4gdGhlIHF1ZXJ5IHN0cmluZyBhbmQgdGhlIGRhdGFcclxuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmRhdGEgKSB7XHJcblx0XHRcdHJlcXVlc3RTZXR0aW5ncy5kYXRhID0gKHJlcXVlc3RTZXR0aW5ncy5kYXRhICsgXCJcIikucmVwbGFjZShDQUxMQkFDS19SRUdFWCwgXCI9XCIgKyBqc29ucCArIFwiJDFcIik7XHJcblx0XHR9XHJcblxyXG5cdFx0cmVxdWVzdFNldHRpbmdzLnVybCA9IHJlcXVlc3RTZXR0aW5ncy51cmwucmVwbGFjZShDQUxMQkFDS19SRUdFWCwgXCI9XCIgKyBqc29ucCArIFwiJDFcIik7XHJcblxyXG5cclxuXHRcdC8vIEhhbmRsZSBKU09OUC1zdHlsZSBsb2FkaW5nXHJcblx0XHR3aW5kb3dbIGpzb25wIF0gPSB3aW5kb3dbIGpzb25wIF0gfHwgZnVuY3Rpb24oIHRtcCApIHtcclxuXHRcdFx0ZGF0YSA9IHRtcDtcclxuXHRcdFx0anNvbnBTdWNjZXNzKCByZXF1ZXN0U2V0dGluZ3MsIGNhbGxiYWNrQ29udGV4dCwgbW9ja0hhbmRsZXIgKTtcclxuXHRcdFx0anNvbnBDb21wbGV0ZSggcmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyICk7XHJcblx0XHRcdC8vIEdhcmJhZ2UgY29sbGVjdFxyXG5cdFx0XHR3aW5kb3dbIGpzb25wIF0gPSB1bmRlZmluZWQ7XHJcblxyXG5cdFx0XHR0cnkge1xyXG5cdFx0XHRcdGRlbGV0ZSB3aW5kb3dbIGpzb25wIF07XHJcblx0XHRcdH0gY2F0Y2goZSkge31cclxuXHJcblx0XHRcdGlmICggaGVhZCApIHtcclxuXHRcdFx0XHRoZWFkLnJlbW92ZUNoaWxkKCBzY3JpcHQgKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cdC8vIFRoZSBKU09OUCByZXF1ZXN0IHdhcyBzdWNjZXNzZnVsXHJcblx0ZnVuY3Rpb24ganNvbnBTdWNjZXNzKHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0LCBtb2NrSGFuZGxlcikge1xyXG5cdFx0Ly8gSWYgYSBsb2NhbCBjYWxsYmFjayB3YXMgc3BlY2lmaWVkLCBmaXJlIGl0IGFuZCBwYXNzIGl0IHRoZSBkYXRhXHJcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5zdWNjZXNzICkge1xyXG5cdFx0XHRyZXF1ZXN0U2V0dGluZ3Muc3VjY2Vzcy5jYWxsKCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCB8fCBcIlwiLCBzdGF0dXMsIHt9ICk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gRmlyZSB0aGUgZ2xvYmFsIGNhbGxiYWNrXHJcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5nbG9iYWwgKSB7XHJcblx0XHRcdHRyaWdnZXIocmVxdWVzdFNldHRpbmdzLCBcImFqYXhTdWNjZXNzXCIsIFt7fSwgcmVxdWVzdFNldHRpbmdzXSApO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gVGhlIEpTT05QIHJlcXVlc3Qgd2FzIGNvbXBsZXRlZFxyXG5cdGZ1bmN0aW9uIGpzb25wQ29tcGxldGUocmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQpIHtcclxuXHRcdC8vIFByb2Nlc3MgcmVzdWx0XHJcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5jb21wbGV0ZSApIHtcclxuXHRcdFx0cmVxdWVzdFNldHRpbmdzLmNvbXBsZXRlLmNhbGwoIGNhbGxiYWNrQ29udGV4dCwge30gLCBzdGF0dXMgKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBUaGUgcmVxdWVzdCB3YXMgY29tcGxldGVkXHJcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5nbG9iYWwgKSB7XHJcblx0XHRcdHRyaWdnZXIoIFwiYWpheENvbXBsZXRlXCIsIFt7fSwgcmVxdWVzdFNldHRpbmdzXSApO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEhhbmRsZSB0aGUgZ2xvYmFsIEFKQVggY291bnRlclxyXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZ2xvYmFsICYmICEgLS0kLmFjdGl2ZSApIHtcclxuXHRcdFx0JC5ldmVudC50cmlnZ2VyKCBcImFqYXhTdG9wXCIgKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cclxuXHQvLyBUaGUgY29yZSAkLmFqYXggcmVwbGFjZW1lbnQuXHJcblx0ZnVuY3Rpb24gaGFuZGxlQWpheCggdXJsLCBvcmlnU2V0dGluZ3MgKSB7XHJcblx0XHR2YXIgbW9ja1JlcXVlc3QsIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXI7XHJcblxyXG5cdFx0Ly8gSWYgdXJsIGlzIGFuIG9iamVjdCwgc2ltdWxhdGUgcHJlLTEuNSBzaWduYXR1cmVcclxuXHRcdGlmICggdHlwZW9mIHVybCA9PT0gXCJvYmplY3RcIiApIHtcclxuXHRcdFx0b3JpZ1NldHRpbmdzID0gdXJsO1xyXG5cdFx0XHR1cmwgPSB1bmRlZmluZWQ7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyB3b3JrIGFyb3VuZCB0byBzdXBwb3J0IDEuNSBzaWduYXR1cmVcclxuXHRcdFx0b3JpZ1NldHRpbmdzID0gb3JpZ1NldHRpbmdzIHx8IHt9O1xyXG5cdFx0XHRvcmlnU2V0dGluZ3MudXJsID0gdXJsO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEV4dGVuZCB0aGUgb3JpZ2luYWwgc2V0dGluZ3MgZm9yIHRoZSByZXF1ZXN0XHJcblx0XHRyZXF1ZXN0U2V0dGluZ3MgPSAkLmV4dGVuZCh0cnVlLCB7fSwgJC5hamF4U2V0dGluZ3MsIG9yaWdTZXR0aW5ncyk7XHJcblxyXG5cdFx0Ly8gSXRlcmF0ZSBvdmVyIG91ciBtb2NrIGhhbmRsZXJzIChpbiByZWdpc3RyYXRpb24gb3JkZXIpIHVudGlsIHdlIGZpbmRcclxuXHRcdC8vIG9uZSB0aGF0IGlzIHdpbGxpbmcgdG8gaW50ZXJjZXB0IHRoZSByZXF1ZXN0XHJcblx0XHRmb3IodmFyIGsgPSAwOyBrIDwgbW9ja0hhbmRsZXJzLmxlbmd0aDsgaysrKSB7XHJcblx0XHRcdGlmICggIW1vY2tIYW5kbGVyc1trXSApIHtcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0bW9ja0hhbmRsZXIgPSBnZXRNb2NrRm9yUmVxdWVzdCggbW9ja0hhbmRsZXJzW2tdLCByZXF1ZXN0U2V0dGluZ3MgKTtcclxuXHRcdFx0aWYoIW1vY2tIYW5kbGVyKSB7XHJcblx0XHRcdFx0Ly8gTm8gdmFsaWQgbW9jayBmb3VuZCBmb3IgdGhpcyByZXF1ZXN0XHJcblx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdG1vY2tlZEFqYXhDYWxscy5wdXNoKHJlcXVlc3RTZXR0aW5ncyk7XHJcblxyXG5cdFx0XHQvLyBJZiBsb2dnaW5nIGlzIGVuYWJsZWQsIGxvZyB0aGUgbW9jayB0byB0aGUgY29uc29sZVxyXG5cdFx0XHQkLm1vY2tqYXhTZXR0aW5ncy5sb2coIG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MgKTtcclxuXHJcblxyXG5cdFx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSAmJiByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUudG9VcHBlckNhc2UoKSA9PT0gJ0pTT05QJyApIHtcclxuXHRcdFx0XHRpZiAoKG1vY2tSZXF1ZXN0ID0gcHJvY2Vzc0pzb25wTW9jayggcmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzICkpKSB7XHJcblx0XHRcdFx0XHQvLyBUaGlzIG1vY2sgd2lsbCBoYW5kbGUgdGhlIEpTT05QIHJlcXVlc3RcclxuXHRcdFx0XHRcdHJldHVybiBtb2NrUmVxdWVzdDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblxyXG5cdFx0XHQvLyBSZW1vdmVkIHRvIGZpeCAjNTQgLSBrZWVwIHRoZSBtb2NraW5nIGRhdGEgb2JqZWN0IGludGFjdFxyXG5cdFx0XHQvL21vY2tIYW5kbGVyLmRhdGEgPSByZXF1ZXN0U2V0dGluZ3MuZGF0YTtcclxuXHJcblx0XHRcdG1vY2tIYW5kbGVyLmNhY2hlID0gcmVxdWVzdFNldHRpbmdzLmNhY2hlO1xyXG5cdFx0XHRtb2NrSGFuZGxlci50aW1lb3V0ID0gcmVxdWVzdFNldHRpbmdzLnRpbWVvdXQ7XHJcblx0XHRcdG1vY2tIYW5kbGVyLmdsb2JhbCA9IHJlcXVlc3RTZXR0aW5ncy5nbG9iYWw7XHJcblxyXG5cdFx0XHRjb3B5VXJsUGFyYW1ldGVycyhtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzKTtcclxuXHJcblx0XHRcdChmdW5jdGlvbihtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MsIG9yaWdIYW5kbGVyKSB7XHJcblx0XHRcdFx0bW9ja1JlcXVlc3QgPSBfYWpheC5jYWxsKCQsICQuZXh0ZW5kKHRydWUsIHt9LCBvcmlnU2V0dGluZ3MsIHtcclxuXHRcdFx0XHRcdC8vIE1vY2sgdGhlIFhIUiBvYmplY3RcclxuXHRcdFx0XHRcdHhocjogZnVuY3Rpb24oKSB7IHJldHVybiB4aHIoIG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncywgb3JpZ0hhbmRsZXIgKTsgfVxyXG5cdFx0XHRcdH0pKTtcclxuXHRcdFx0fSkobW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncywgb3JpZ1NldHRpbmdzLCBtb2NrSGFuZGxlcnNba10pO1xyXG5cclxuXHRcdFx0cmV0dXJuIG1vY2tSZXF1ZXN0O1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFdlIGRvbid0IGhhdmUgYSBtb2NrIHJlcXVlc3RcclxuXHRcdGlmKCQubW9ja2pheFNldHRpbmdzLnRocm93VW5tb2NrZWQgPT09IHRydWUpIHtcclxuXHRcdFx0dGhyb3coJ0FKQVggbm90IG1vY2tlZDogJyArIG9yaWdTZXR0aW5ncy51cmwpO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7IC8vIHRyaWdnZXIgYSBub3JtYWwgcmVxdWVzdFxyXG5cdFx0XHRyZXR1cm4gX2FqYXguYXBwbHkoJCwgW29yaWdTZXR0aW5nc10pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0KiBDb3BpZXMgVVJMIHBhcmFtZXRlciB2YWx1ZXMgaWYgdGhleSB3ZXJlIGNhcHR1cmVkIGJ5IGEgcmVndWxhciBleHByZXNzaW9uXHJcblx0KiBAcGFyYW0ge09iamVjdH0gbW9ja0hhbmRsZXJcclxuXHQqIEBwYXJhbSB7T2JqZWN0fSBvcmlnU2V0dGluZ3NcclxuXHQqL1xyXG5cdGZ1bmN0aW9uIGNvcHlVcmxQYXJhbWV0ZXJzKG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MpIHtcclxuXHRcdC8vcGFyYW1ldGVycyBhcmVuJ3QgY2FwdHVyZWQgaWYgdGhlIFVSTCBpc24ndCBhIFJlZ0V4cFxyXG5cdFx0aWYgKCEobW9ja0hhbmRsZXIudXJsIGluc3RhbmNlb2YgUmVnRXhwKSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHQvL2lmIG5vIFVSTCBwYXJhbXMgd2VyZSBkZWZpbmVkIG9uIHRoZSBoYW5kbGVyLCBkb24ndCBhdHRlbXB0IGEgY2FwdHVyZVxyXG5cdFx0aWYgKCFtb2NrSGFuZGxlci5oYXNPd25Qcm9wZXJ0eSgndXJsUGFyYW1zJykpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0dmFyIGNhcHR1cmVzID0gbW9ja0hhbmRsZXIudXJsLmV4ZWMob3JpZ1NldHRpbmdzLnVybCk7XHJcblx0XHQvL3RoZSB3aG9sZSBSZWdFeHAgbWF0Y2ggaXMgYWx3YXlzIHRoZSBmaXJzdCB2YWx1ZSBpbiB0aGUgY2FwdHVyZSByZXN1bHRzXHJcblx0XHRpZiAoY2FwdHVyZXMubGVuZ3RoID09PSAxKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdGNhcHR1cmVzLnNoaWZ0KCk7XHJcblx0XHQvL3VzZSBoYW5kbGVyIHBhcmFtcyBhcyBrZXlzIGFuZCBjYXB0dXJlIHJlc3V0cyBhcyB2YWx1ZXNcclxuXHRcdHZhciBpID0gMCxcclxuXHRcdGNhcHR1cmVzTGVuZ3RoID0gY2FwdHVyZXMubGVuZ3RoLFxyXG5cdFx0cGFyYW1zTGVuZ3RoID0gbW9ja0hhbmRsZXIudXJsUGFyYW1zLmxlbmd0aCxcclxuXHRcdC8vaW4gY2FzZSB0aGUgbnVtYmVyIG9mIHBhcmFtcyBzcGVjaWZpZWQgaXMgbGVzcyB0aGFuIGFjdHVhbCBjYXB0dXJlc1xyXG5cdFx0bWF4SXRlcmF0aW9ucyA9IE1hdGgubWluKGNhcHR1cmVzTGVuZ3RoLCBwYXJhbXNMZW5ndGgpLFxyXG5cdFx0cGFyYW1WYWx1ZXMgPSB7fTtcclxuXHRcdGZvciAoaTsgaSA8IG1heEl0ZXJhdGlvbnM7IGkrKykge1xyXG5cdFx0XHR2YXIga2V5ID0gbW9ja0hhbmRsZXIudXJsUGFyYW1zW2ldO1xyXG5cdFx0XHRwYXJhbVZhbHVlc1trZXldID0gY2FwdHVyZXNbaV07XHJcblx0XHR9XHJcblx0XHRvcmlnU2V0dGluZ3MudXJsUGFyYW1zID0gcGFyYW1WYWx1ZXM7XHJcblx0fVxyXG5cclxuXHJcblx0Ly8gUHVibGljXHJcblxyXG5cdCQuZXh0ZW5kKHtcclxuXHRcdGFqYXg6IGhhbmRsZUFqYXhcclxuXHR9KTtcclxuXHJcblx0JC5tb2NramF4U2V0dGluZ3MgPSB7XHJcblx0XHQvL3VybDogICAgICAgIG51bGwsXHJcblx0XHQvL3R5cGU6ICAgICAgICdHRVQnLFxyXG5cdFx0bG9nOiAgICAgICAgICBmdW5jdGlvbiggbW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncyApIHtcclxuXHRcdFx0aWYgKCBtb2NrSGFuZGxlci5sb2dnaW5nID09PSBmYWxzZSB8fFxyXG5cdFx0XHRcdCAoIHR5cGVvZiBtb2NrSGFuZGxlci5sb2dnaW5nID09PSAndW5kZWZpbmVkJyAmJiAkLm1vY2tqYXhTZXR0aW5ncy5sb2dnaW5nID09PSBmYWxzZSApICkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoIHdpbmRvdy5jb25zb2xlICYmIGNvbnNvbGUubG9nICkge1xyXG5cdFx0XHRcdHZhciBtZXNzYWdlID0gJ01PQ0sgJyArIHJlcXVlc3RTZXR0aW5ncy50eXBlLnRvVXBwZXJDYXNlKCkgKyAnOiAnICsgcmVxdWVzdFNldHRpbmdzLnVybDtcclxuXHRcdFx0XHR2YXIgcmVxdWVzdCA9ICQuZXh0ZW5kKHt9LCByZXF1ZXN0U2V0dGluZ3MpO1xyXG5cclxuXHRcdFx0XHRpZiAodHlwZW9mIGNvbnNvbGUubG9nID09PSAnZnVuY3Rpb24nKSB7XHJcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhtZXNzYWdlLCByZXF1ZXN0KTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coIG1lc3NhZ2UgKyAnICcgKyBKU09OLnN0cmluZ2lmeShyZXF1ZXN0KSApO1xyXG5cdFx0XHRcdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhtZXNzYWdlKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0XHRsb2dnaW5nOiAgICAgICB0cnVlLFxyXG5cdFx0c3RhdHVzOiAgICAgICAgMjAwLFxyXG5cdFx0c3RhdHVzVGV4dDogICAgXCJPS1wiLFxyXG5cdFx0cmVzcG9uc2VUaW1lOiAgNTAwLFxyXG5cdFx0aXNUaW1lb3V0OiAgICAgZmFsc2UsXHJcblx0XHR0aHJvd1VubW9ja2VkOiBmYWxzZSxcclxuXHRcdGNvbnRlbnRUeXBlOiAgICd0ZXh0L3BsYWluJyxcclxuXHRcdHJlc3BvbnNlOiAgICAgICcnLFxyXG5cdFx0cmVzcG9uc2VUZXh0OiAgJycsXHJcblx0XHRyZXNwb25zZVhNTDogICAnJyxcclxuXHRcdHByb3h5OiAgICAgICAgICcnLFxyXG5cdFx0cHJveHlUeXBlOiAgICAgJ0dFVCcsXHJcblxyXG5cdFx0bGFzdE1vZGlmaWVkOiAgbnVsbCxcclxuXHRcdGV0YWc6ICAgICAgICAgICcnLFxyXG5cdFx0aGVhZGVyczoge1xyXG5cdFx0XHRldGFnOiAnSUpGQEgjQDkyM3VmODAyM2hGT0BJI0gjJyxcclxuXHRcdFx0J2NvbnRlbnQtdHlwZScgOiAndGV4dC9wbGFpbidcclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHQkLm1vY2tqYXggPSBmdW5jdGlvbihzZXR0aW5ncykge1xyXG5cdFx0dmFyIGkgPSBtb2NrSGFuZGxlcnMubGVuZ3RoO1xyXG5cdFx0bW9ja0hhbmRsZXJzW2ldID0gc2V0dGluZ3M7XHJcblx0XHRyZXR1cm4gaTtcclxuXHR9O1xyXG5cdCQubW9ja2pheENsZWFyID0gZnVuY3Rpb24oaSkge1xyXG5cdFx0aWYgKCBhcmd1bWVudHMubGVuZ3RoID09IDEgKSB7XHJcblx0XHRcdG1vY2tIYW5kbGVyc1tpXSA9IG51bGw7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRtb2NrSGFuZGxlcnMgPSBbXTtcclxuXHRcdH1cclxuXHRcdG1vY2tlZEFqYXhDYWxscyA9IFtdO1xyXG5cdH07XHJcblx0JC5tb2NramF4LmhhbmRsZXIgPSBmdW5jdGlvbihpKSB7XHJcblx0XHRpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT0gMSApIHtcclxuXHRcdFx0cmV0dXJuIG1vY2tIYW5kbGVyc1tpXTtcclxuXHRcdH1cclxuXHR9O1xyXG5cdCQubW9ja2pheC5tb2NrZWRBamF4Q2FsbHMgPSBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiBtb2NrZWRBamF4Q2FsbHM7XHJcblx0fTtcclxufSkoalF1ZXJ5KTsiLCIvKipcclxuKiAgQWpheCBBdXRvY29tcGxldGUgZm9yIGpRdWVyeSwgdmVyc2lvbiAldmVyc2lvbiVcclxuKiAgKGMpIDIwMTUgVG9tYXMgS2lyZGFcclxuKlxyXG4qICBBamF4IEF1dG9jb21wbGV0ZSBmb3IgalF1ZXJ5IGlzIGZyZWVseSBkaXN0cmlidXRhYmxlIHVuZGVyIHRoZSB0ZXJtcyBvZiBhbiBNSVQtc3R5bGUgbGljZW5zZS5cclxuKiAgRm9yIGRldGFpbHMsIHNlZSB0aGUgd2ViIHNpdGU6IGh0dHBzOi8vZ2l0aHViLmNvbS9kZXZicmlkZ2UvalF1ZXJ5LUF1dG9jb21wbGV0ZVxyXG4qL1xyXG5cclxuLypqc2xpbnQgIGJyb3dzZXI6IHRydWUsIHdoaXRlOiB0cnVlLCBwbHVzcGx1czogdHJ1ZSwgdmFyczogdHJ1ZSAqL1xyXG4vKmdsb2JhbCBkZWZpbmUsIHdpbmRvdywgZG9jdW1lbnQsIGpRdWVyeSwgZXhwb3J0cywgcmVxdWlyZSAqL1xyXG5cclxuLy8gRXhwb3NlIHBsdWdpbiBhcyBhbiBBTUQgbW9kdWxlIGlmIEFNRCBsb2FkZXIgaXMgcHJlc2VudDpcclxuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcbiAgICAgICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxyXG4gICAgICAgIGRlZmluZShbJ2pxdWVyeSddLCBmYWN0b3J5KTtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiByZXF1aXJlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgLy8gQnJvd3NlcmlmeVxyXG4gICAgICAgIGZhY3RvcnkocmVxdWlyZSgnanF1ZXJ5JykpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBCcm93c2VyIGdsb2JhbHNcclxuICAgICAgICBmYWN0b3J5KGpRdWVyeSk7XHJcbiAgICB9XHJcbn0oZnVuY3Rpb24gKCQpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXJcclxuICAgICAgICB1dGlscyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBlc2NhcGVSZWdFeENoYXJzOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvW1xcLVxcW1xcXVxcL1xce1xcfVxcKFxcKVxcKlxcK1xcP1xcLlxcXFxcXF5cXCRcXHxdL2csIFwiXFxcXCQmXCIpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGNyZWF0ZU5vZGU6IGZ1bmN0aW9uIChjb250YWluZXJDbGFzcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgICAgICAgICAgICBkaXYuY2xhc3NOYW1lID0gY29udGFpbmVyQ2xhc3M7XHJcbiAgICAgICAgICAgICAgICAgICAgZGl2LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcclxuICAgICAgICAgICAgICAgICAgICBkaXYuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGl2O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0oKSksXHJcblxyXG4gICAgICAgIGtleXMgPSB7XHJcbiAgICAgICAgICAgIEVTQzogMjcsXHJcbiAgICAgICAgICAgIFRBQjogOSxcclxuICAgICAgICAgICAgUkVUVVJOOiAxMyxcclxuICAgICAgICAgICAgTEVGVDogMzcsXHJcbiAgICAgICAgICAgIFVQOiAzOCxcclxuICAgICAgICAgICAgUklHSFQ6IDM5LFxyXG4gICAgICAgICAgICBET1dOOiA0MFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gQXV0b2NvbXBsZXRlKGVsLCBvcHRpb25zKSB7XHJcbiAgICAgICAgdmFyIG5vb3AgPSBmdW5jdGlvbiAoKSB7IH0sXHJcbiAgICAgICAgICAgIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICBkZWZhdWx0cyA9IHtcclxuICAgICAgICAgICAgICAgIGFqYXhTZXR0aW5nczoge30sXHJcbiAgICAgICAgICAgICAgICBhdXRvU2VsZWN0Rmlyc3Q6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYXBwZW5kVG86IGRvY3VtZW50LmJvZHksXHJcbiAgICAgICAgICAgICAgICBzZXJ2aWNlVXJsOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgbG9va3VwOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgb25TZWxlY3Q6IG51bGwsXHJcbiAgICAgICAgICAgICAgICB3aWR0aDogJ2F1dG8nLFxyXG4gICAgICAgICAgICAgICAgbWluQ2hhcnM6IDEsXHJcbiAgICAgICAgICAgICAgICBtYXhIZWlnaHQ6IDMwMCxcclxuICAgICAgICAgICAgICAgIGRlZmVyUmVxdWVzdEJ5OiAwLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7fSxcclxuICAgICAgICAgICAgICAgIGZvcm1hdFJlc3VsdDogQXV0b2NvbXBsZXRlLmZvcm1hdFJlc3VsdCxcclxuICAgICAgICAgICAgICAgIGRlbGltaXRlcjogbnVsbCxcclxuICAgICAgICAgICAgICAgIHpJbmRleDogOTk5OSxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgbm9DYWNoZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBvblNlYXJjaFN0YXJ0OiBub29wLFxyXG4gICAgICAgICAgICAgICAgb25TZWFyY2hDb21wbGV0ZTogbm9vcCxcclxuICAgICAgICAgICAgICAgIG9uU2VhcmNoRXJyb3I6IG5vb3AsXHJcbiAgICAgICAgICAgICAgICBwcmVzZXJ2ZUlucHV0OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lckNsYXNzOiAnYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb25zJyxcclxuICAgICAgICAgICAgICAgIHRhYkRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50UmVxdWVzdDogbnVsbCxcclxuICAgICAgICAgICAgICAgIHRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBwcmV2ZW50QmFkUXVlcmllczogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGxvb2t1cEZpbHRlcjogZnVuY3Rpb24gKHN1Z2dlc3Rpb24sIG9yaWdpbmFsUXVlcnksIHF1ZXJ5TG93ZXJDYXNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb24udmFsdWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHF1ZXJ5TG93ZXJDYXNlKSAhPT0gLTE7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcGFyYW1OYW1lOiAncXVlcnknLFxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtUmVzdWx0OiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIHJlc3BvbnNlID09PSAnc3RyaW5nJyA/ICQucGFyc2VKU09OKHJlc3BvbnNlKSA6IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHNob3dOb1N1Z2dlc3Rpb25Ob3RpY2U6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgbm9TdWdnZXN0aW9uTm90aWNlOiAnTm8gcmVzdWx0cycsXHJcbiAgICAgICAgICAgICAgICBvcmllbnRhdGlvbjogJ2JvdHRvbScsXHJcbiAgICAgICAgICAgICAgICBmb3JjZUZpeFBvc2l0aW9uOiBmYWxzZVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBTaGFyZWQgdmFyaWFibGVzOlxyXG4gICAgICAgIHRoYXQuZWxlbWVudCA9IGVsO1xyXG4gICAgICAgIHRoYXQuZWwgPSAkKGVsKTtcclxuICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gW107XHJcbiAgICAgICAgdGhhdC5iYWRRdWVyaWVzID0gW107XHJcbiAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XHJcbiAgICAgICAgdGhhdC5jdXJyZW50VmFsdWUgPSB0aGF0LmVsZW1lbnQudmFsdWU7XHJcbiAgICAgICAgdGhhdC5pbnRlcnZhbElkID0gMDtcclxuICAgICAgICB0aGF0LmNhY2hlZFJlc3BvbnNlID0ge307XHJcbiAgICAgICAgdGhhdC5vbkNoYW5nZUludGVydmFsID0gbnVsbDtcclxuICAgICAgICB0aGF0Lm9uQ2hhbmdlID0gbnVsbDtcclxuICAgICAgICB0aGF0LmlzTG9jYWwgPSBmYWxzZTtcclxuICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyID0gbnVsbDtcclxuICAgICAgICB0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIgPSBudWxsO1xyXG4gICAgICAgIHRoYXQub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBkZWZhdWx0cywgb3B0aW9ucyk7XHJcbiAgICAgICAgdGhhdC5jbGFzc2VzID0ge1xyXG4gICAgICAgICAgICBzZWxlY3RlZDogJ2F1dG9jb21wbGV0ZS1zZWxlY3RlZCcsXHJcbiAgICAgICAgICAgIHN1Z2dlc3Rpb246ICdhdXRvY29tcGxldGUtc3VnZ2VzdGlvbidcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoYXQuaGludCA9IG51bGw7XHJcbiAgICAgICAgdGhhdC5oaW50VmFsdWUgPSAnJztcclxuICAgICAgICB0aGF0LnNlbGVjdGlvbiA9IG51bGw7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgYW5kIHNldCBvcHRpb25zOlxyXG4gICAgICAgIHRoYXQuaW5pdGlhbGl6ZSgpO1xyXG4gICAgICAgIHRoYXQuc2V0T3B0aW9ucyhvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBBdXRvY29tcGxldGUudXRpbHMgPSB1dGlscztcclxuXHJcbiAgICAkLkF1dG9jb21wbGV0ZSA9IEF1dG9jb21wbGV0ZTtcclxuXHJcbiAgICBBdXRvY29tcGxldGUuZm9ybWF0UmVzdWx0ID0gZnVuY3Rpb24gKHN1Z2dlc3Rpb24sIGN1cnJlbnRWYWx1ZSkge1xyXG4gICAgICAgIC8vIERvIG5vdCByZXBsYWNlIGFueXRoaW5nIGlmIHRoZXJlIGN1cnJlbnQgdmFsdWUgaXMgZW1wdHlcclxuICAgICAgICBpZiAoIWN1cnJlbnRWYWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbi52YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIHBhdHRlcm4gPSAnKCcgKyB1dGlscy5lc2NhcGVSZWdFeENoYXJzKGN1cnJlbnRWYWx1ZSkgKyAnKSc7XHJcblxyXG4gICAgICAgIHJldHVybiBzdWdnZXN0aW9uLnZhbHVlXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKG5ldyBSZWdFeHAocGF0dGVybiwgJ2dpJyksICc8c3Ryb25nPiQxPFxcL3N0cm9uZz4nKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcclxuICAgICAgICAgICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvJmx0OyhcXC8/c3Ryb25nKSZndDsvZywgJzwkMT4nKTtcclxuICAgIH07XHJcblxyXG4gICAgQXV0b2NvbXBsZXRlLnByb3RvdHlwZSA9IHtcclxuXHJcbiAgICAgICAga2lsbGVyRm46IG51bGwsXHJcblxyXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgc3VnZ2VzdGlvblNlbGVjdG9yID0gJy4nICsgdGhhdC5jbGFzc2VzLnN1Z2dlc3Rpb24sXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZCA9IHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgICBjb250YWluZXI7XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgYXV0b2NvbXBsZXRlIGF0dHJpYnV0ZSB0byBwcmV2ZW50IG5hdGl2ZSBzdWdnZXN0aW9uczpcclxuICAgICAgICAgICAgdGhhdC5lbGVtZW50LnNldEF0dHJpYnV0ZSgnYXV0b2NvbXBsZXRlJywgJ29mZicpO1xyXG5cclxuICAgICAgICAgICAgdGhhdC5raWxsZXJGbiA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJChlLnRhcmdldCkuY2xvc2VzdCgnLicgKyB0aGF0Lm9wdGlvbnMuY29udGFpbmVyQ2xhc3MpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQua2lsbFN1Z2dlc3Rpb25zKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5kaXNhYmxlS2lsbGVyRm4oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vIGh0bWwoKSBkZWFscyB3aXRoIG1hbnkgdHlwZXM6IGh0bWxTdHJpbmcgb3IgRWxlbWVudCBvciBBcnJheSBvciBqUXVlcnlcclxuICAgICAgICAgICAgdGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gJCgnPGRpdiBjbGFzcz1cImF1dG9jb21wbGV0ZS1uby1zdWdnZXN0aW9uXCI+PC9kaXY+JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmh0bWwodGhpcy5vcHRpb25zLm5vU3VnZ2VzdGlvbk5vdGljZSkuZ2V0KDApO1xyXG5cclxuICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciA9IEF1dG9jb21wbGV0ZS51dGlscy5jcmVhdGVOb2RlKG9wdGlvbnMuY29udGFpbmVyQ2xhc3MpO1xyXG5cclxuICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRUbyhvcHRpb25zLmFwcGVuZFRvKTtcclxuXHJcbiAgICAgICAgICAgIC8vIE9ubHkgc2V0IHdpZHRoIGlmIGl0IHdhcyBwcm92aWRlZDpcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMud2lkdGggIT09ICdhdXRvJykge1xyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyLndpZHRoKG9wdGlvbnMud2lkdGgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBMaXN0ZW4gZm9yIG1vdXNlIG92ZXIgZXZlbnQgb24gc3VnZ2VzdGlvbnMgbGlzdDpcclxuICAgICAgICAgICAgY29udGFpbmVyLm9uKCdtb3VzZW92ZXIuYXV0b2NvbXBsZXRlJywgc3VnZ2VzdGlvblNlbGVjdG9yLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmFjdGl2YXRlKCQodGhpcykuZGF0YSgnaW5kZXgnKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gRGVzZWxlY3QgYWN0aXZlIGVsZW1lbnQgd2hlbiBtb3VzZSBsZWF2ZXMgc3VnZ2VzdGlvbnMgY29udGFpbmVyOlxyXG4gICAgICAgICAgICBjb250YWluZXIub24oJ21vdXNlb3V0LmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmNoaWxkcmVuKCcuJyArIHNlbGVjdGVkKS5yZW1vdmVDbGFzcyhzZWxlY3RlZCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gTGlzdGVuIGZvciBjbGljayBldmVudCBvbiBzdWdnZXN0aW9ucyBsaXN0OlxyXG4gICAgICAgICAgICBjb250YWluZXIub24oJ2NsaWNrLmF1dG9jb21wbGV0ZScsIHN1Z2dlc3Rpb25TZWxlY3RvciwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QoJCh0aGlzKS5kYXRhKCdpbmRleCcpKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uQ2FwdHVyZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGF0LnZpc2libGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS5hdXRvY29tcGxldGUnLCB0aGF0LmZpeFBvc2l0aW9uQ2FwdHVyZSk7XHJcblxyXG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdrZXlkb3duLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlQcmVzcyhlKTsgfSk7XHJcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2tleXVwLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlVcChlKTsgfSk7XHJcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2JsdXIuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKCkgeyB0aGF0Lm9uQmx1cigpOyB9KTtcclxuICAgICAgICAgICAgdGhhdC5lbC5vbignZm9jdXMuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKCkgeyB0aGF0Lm9uRm9jdXMoKTsgfSk7XHJcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2NoYW5nZS5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5VXAoZSk7IH0pO1xyXG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdpbnB1dC5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5VXAoZSk7IH0pO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG9uRm9jdXM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuZWwudmFsKCkubGVuZ3RoID49IHRoYXQub3B0aW9ucy5taW5DaGFycykge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5vblZhbHVlQ2hhbmdlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBvbkJsdXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5lbmFibGVLaWxsZXJGbigpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXHJcbiAgICAgICAgYWJvcnRBamF4OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgaWYgKHRoYXQuY3VycmVudFJlcXVlc3QpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QuYWJvcnQoKTtcclxuICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2V0T3B0aW9uczogZnVuY3Rpb24gKHN1cHBsaWVkT3B0aW9ucykge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zO1xyXG5cclxuICAgICAgICAgICAgJC5leHRlbmQob3B0aW9ucywgc3VwcGxpZWRPcHRpb25zKTtcclxuXHJcbiAgICAgICAgICAgIHRoYXQuaXNMb2NhbCA9ICQuaXNBcnJheShvcHRpb25zLmxvb2t1cCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhhdC5pc0xvY2FsKSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLmxvb2t1cCA9IHRoYXQudmVyaWZ5U3VnZ2VzdGlvbnNGb3JtYXQob3B0aW9ucy5sb29rdXApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBvcHRpb25zLm9yaWVudGF0aW9uID0gdGhhdC52YWxpZGF0ZU9yaWVudGF0aW9uKG9wdGlvbnMub3JpZW50YXRpb24sICdib3R0b20nKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkanVzdCBoZWlnaHQsIHdpZHRoIGFuZCB6LWluZGV4OlxyXG4gICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAnbWF4LWhlaWdodCc6IG9wdGlvbnMubWF4SGVpZ2h0ICsgJ3B4JyxcclxuICAgICAgICAgICAgICAgICd3aWR0aCc6IG9wdGlvbnMud2lkdGggKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgJ3otaW5kZXgnOiBvcHRpb25zLnpJbmRleFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG5cclxuXHJcbiAgICAgICAgY2xlYXJDYWNoZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNhY2hlZFJlc3BvbnNlID0ge307XHJcbiAgICAgICAgICAgIHRoaXMuYmFkUXVlcmllcyA9IFtdO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xlYXJDYWNoZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRWYWx1ZSA9ICcnO1xyXG4gICAgICAgICAgICB0aGlzLnN1Z2dlc3Rpb25zID0gW107XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZGlzYWJsZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgIHRoYXQuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XHJcbiAgICAgICAgICAgIHRoYXQuYWJvcnRBamF4KCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZW5hYmxlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBmaXhQb3NpdGlvbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBVc2Ugb25seSB3aGVuIGNvbnRhaW5lciBoYXMgYWxyZWFkeSBpdHMgY29udGVudFxyXG5cclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgJGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXHJcbiAgICAgICAgICAgICAgICBjb250YWluZXJQYXJlbnQgPSAkY29udGFpbmVyLnBhcmVudCgpLmdldCgwKTtcclxuICAgICAgICAgICAgLy8gRml4IHBvc2l0aW9uIGF1dG9tYXRpY2FsbHkgd2hlbiBhcHBlbmRlZCB0byBib2R5LlxyXG4gICAgICAgICAgICAvLyBJbiBvdGhlciBjYXNlcyBmb3JjZSBwYXJhbWV0ZXIgbXVzdCBiZSBnaXZlbi5cclxuICAgICAgICAgICAgaWYgKGNvbnRhaW5lclBhcmVudCAhPT0gZG9jdW1lbnQuYm9keSAmJiAhdGhhdC5vcHRpb25zLmZvcmNlRml4UG9zaXRpb24pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQ2hvb3NlIG9yaWVudGF0aW9uXHJcbiAgICAgICAgICAgIHZhciBvcmllbnRhdGlvbiA9IHRoYXQub3B0aW9ucy5vcmllbnRhdGlvbixcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lckhlaWdodCA9ICRjb250YWluZXIub3V0ZXJIZWlnaHQoKSxcclxuICAgICAgICAgICAgICAgIGhlaWdodCA9IHRoYXQuZWwub3V0ZXJIZWlnaHQoKSxcclxuICAgICAgICAgICAgICAgIG9mZnNldCA9IHRoYXQuZWwub2Zmc2V0KCksXHJcbiAgICAgICAgICAgICAgICBzdHlsZXMgPSB7ICd0b3AnOiBvZmZzZXQudG9wLCAnbGVmdCc6IG9mZnNldC5sZWZ0IH07XHJcblxyXG4gICAgICAgICAgICBpZiAob3JpZW50YXRpb24gPT09ICdhdXRvJykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHZpZXdQb3J0SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpLFxyXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKSxcclxuICAgICAgICAgICAgICAgICAgICB0b3BPdmVyZmxvdyA9IC1zY3JvbGxUb3AgKyBvZmZzZXQudG9wIC0gY29udGFpbmVySGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgICAgIGJvdHRvbU92ZXJmbG93ID0gc2Nyb2xsVG9wICsgdmlld1BvcnRIZWlnaHQgLSAob2Zmc2V0LnRvcCArIGhlaWdodCArIGNvbnRhaW5lckhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb24gPSAoTWF0aC5tYXgodG9wT3ZlcmZsb3csIGJvdHRvbU92ZXJmbG93KSA9PT0gdG9wT3ZlcmZsb3cpID8gJ3RvcCcgOiAnYm90dG9tJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKG9yaWVudGF0aW9uID09PSAndG9wJykge1xyXG4gICAgICAgICAgICAgICAgc3R5bGVzLnRvcCArPSAtY29udGFpbmVySGVpZ2h0O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc3R5bGVzLnRvcCArPSBoZWlnaHQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIElmIGNvbnRhaW5lciBpcyBub3QgcG9zaXRpb25lZCB0byBib2R5LFxyXG4gICAgICAgICAgICAvLyBjb3JyZWN0IGl0cyBwb3NpdGlvbiB1c2luZyBvZmZzZXQgcGFyZW50IG9mZnNldFxyXG4gICAgICAgICAgICBpZihjb250YWluZXJQYXJlbnQgIT09IGRvY3VtZW50LmJvZHkpIHtcclxuICAgICAgICAgICAgICAgIHZhciBvcGFjaXR5ID0gJGNvbnRhaW5lci5jc3MoJ29wYWNpdHknKSxcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnRPZmZzZXREaWZmO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoYXQudmlzaWJsZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRjb250YWluZXIuY3NzKCdvcGFjaXR5JywgMCkuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBwYXJlbnRPZmZzZXREaWZmID0gJGNvbnRhaW5lci5vZmZzZXRQYXJlbnQoKS5vZmZzZXQoKTtcclxuICAgICAgICAgICAgICAgIHN0eWxlcy50b3AgLT0gcGFyZW50T2Zmc2V0RGlmZi50b3A7XHJcbiAgICAgICAgICAgICAgICBzdHlsZXMubGVmdCAtPSBwYXJlbnRPZmZzZXREaWZmLmxlZnQ7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGF0LnZpc2libGUpe1xyXG4gICAgICAgICAgICAgICAgICAgICRjb250YWluZXIuY3NzKCdvcGFjaXR5Jywgb3BhY2l0eSkuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAtMnB4IHRvIGFjY291bnQgZm9yIHN1Z2dlc3Rpb25zIGJvcmRlci5cclxuICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy53aWR0aCA9PT0gJ2F1dG8nKSB7XHJcbiAgICAgICAgICAgICAgICBzdHlsZXMud2lkdGggPSAodGhhdC5lbC5vdXRlcldpZHRoKCkgLSAyKSArICdweCc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICRjb250YWluZXIuY3NzKHN0eWxlcyk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZW5hYmxlS2lsbGVyRm46IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vbignY2xpY2suYXV0b2NvbXBsZXRlJywgdGhhdC5raWxsZXJGbik7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZGlzYWJsZUtpbGxlckZuOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5hdXRvY29tcGxldGUnLCB0aGF0LmtpbGxlckZuKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBraWxsU3VnZ2VzdGlvbnM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICB0aGF0LnN0b3BLaWxsU3VnZ2VzdGlvbnMoKTtcclxuICAgICAgICAgICAgdGhhdC5pbnRlcnZhbElkID0gd2luZG93LnNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGF0LnZpc2libGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmN1cnJlbnRWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoYXQuc3RvcEtpbGxTdWdnZXN0aW9ucygpO1xyXG4gICAgICAgICAgICB9LCA1MCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc3RvcEtpbGxTdWdnZXN0aW9uczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsSWQpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGlzQ3Vyc29yQXRFbmQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgdmFsTGVuZ3RoID0gdGhhdC5lbC52YWwoKS5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25TdGFydCA9IHRoYXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydCxcclxuICAgICAgICAgICAgICAgIHJhbmdlO1xyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzZWxlY3Rpb25TdGFydCA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxlY3Rpb25TdGFydCA9PT0gdmFsTGVuZ3RoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5zZWxlY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIHJhbmdlID0gZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCk7XHJcbiAgICAgICAgICAgICAgICByYW5nZS5tb3ZlU3RhcnQoJ2NoYXJhY3RlcicsIC12YWxMZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbExlbmd0aCA9PT0gcmFuZ2UudGV4dC5sZW5ndGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgb25LZXlQcmVzczogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgc3VnZ2VzdGlvbnMgYXJlIGhpZGRlbiBhbmQgdXNlciBwcmVzc2VzIGFycm93IGRvd24sIGRpc3BsYXkgc3VnZ2VzdGlvbnM6XHJcbiAgICAgICAgICAgIGlmICghdGhhdC5kaXNhYmxlZCAmJiAhdGhhdC52aXNpYmxlICYmIGUud2hpY2ggPT09IGtleXMuRE9XTiAmJiB0aGF0LmN1cnJlbnRWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LmRpc2FibGVkIHx8ICF0aGF0LnZpc2libGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc3dpdGNoIChlLndoaWNoKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuRVNDOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5SSUdIVDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5oaW50ICYmIHRoYXQub3B0aW9ucy5vbkhpbnQgJiYgdGhhdC5pc0N1cnNvckF0RW5kKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RIaW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuVEFCOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LmhpbnQgJiYgdGhhdC5vcHRpb25zLm9uSGludCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdEhpbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCh0aGF0LnNlbGVjdGVkSW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMudGFiRGlzYWJsZWQgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuUkVUVVJOOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KHRoYXQuc2VsZWN0ZWRJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuVVA6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5tb3ZlVXAoKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5ET1dOOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQubW92ZURvd24oKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBDYW5jZWwgZXZlbnQgaWYgZnVuY3Rpb24gZGlkIG5vdCByZXR1cm46XHJcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBvbktleVVwOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhhdC5kaXNhYmxlZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2ggKGUud2hpY2gpIHtcclxuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5VUDpcclxuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5ET1dOOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuY3VycmVudFZhbHVlICE9PSB0aGF0LmVsLnZhbCgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmZpbmRCZXN0SGludCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy5kZWZlclJlcXVlc3RCeSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBEZWZlciBsb29rdXAgaW4gY2FzZSB3aGVuIHZhbHVlIGNoYW5nZXMgdmVyeSBxdWlja2x5OlxyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQub25DaGFuZ2VJbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5vblZhbHVlQ2hhbmdlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhhdC5vcHRpb25zLmRlZmVyUmVxdWVzdEJ5KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5vblZhbHVlQ2hhbmdlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBvblZhbHVlQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoYXQuZWwudmFsKCksXHJcbiAgICAgICAgICAgICAgICBxdWVyeSA9IHRoYXQuZ2V0UXVlcnkodmFsdWUpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0aW9uICYmIHRoYXQuY3VycmVudFZhbHVlICE9PSBxdWVyeSkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb24gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgKG9wdGlvbnMub25JbnZhbGlkYXRlU2VsZWN0aW9uIHx8ICQubm9vcCkuY2FsbCh0aGF0LmVsZW1lbnQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XHJcbiAgICAgICAgICAgIHRoYXQuY3VycmVudFZhbHVlID0gdmFsdWU7XHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xyXG5cclxuICAgICAgICAgICAgLy8gQ2hlY2sgZXhpc3Rpbmcgc3VnZ2VzdGlvbiBmb3IgdGhlIG1hdGNoIGJlZm9yZSBwcm9jZWVkaW5nOlxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy50cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0ICYmIHRoYXQuaXNFeGFjdE1hdGNoKHF1ZXJ5KSkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QoMCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChxdWVyeS5sZW5ndGggPCBvcHRpb25zLm1pbkNoYXJzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuZ2V0U3VnZ2VzdGlvbnMocXVlcnkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgaXNFeGFjdE1hdGNoOiBmdW5jdGlvbiAocXVlcnkpIHtcclxuICAgICAgICAgICAgdmFyIHN1Z2dlc3Rpb25zID0gdGhpcy5zdWdnZXN0aW9ucztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAoc3VnZ2VzdGlvbnMubGVuZ3RoID09PSAxICYmIHN1Z2dlc3Rpb25zWzBdLnZhbHVlLnRvTG93ZXJDYXNlKCkgPT09IHF1ZXJ5LnRvTG93ZXJDYXNlKCkpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGdldFF1ZXJ5OiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICAgICAgdmFyIGRlbGltaXRlciA9IHRoaXMub3B0aW9ucy5kZWxpbWl0ZXIsXHJcbiAgICAgICAgICAgICAgICBwYXJ0cztcclxuXHJcbiAgICAgICAgICAgIGlmICghZGVsaW1pdGVyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGFydHMgPSB2YWx1ZS5zcGxpdChkZWxpbWl0ZXIpO1xyXG4gICAgICAgICAgICByZXR1cm4gJC50cmltKHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBnZXRTdWdnZXN0aW9uc0xvY2FsOiBmdW5jdGlvbiAocXVlcnkpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcclxuICAgICAgICAgICAgICAgIHF1ZXJ5TG93ZXJDYXNlID0gcXVlcnkudG9Mb3dlckNhc2UoKSxcclxuICAgICAgICAgICAgICAgIGZpbHRlciA9IG9wdGlvbnMubG9va3VwRmlsdGVyLFxyXG4gICAgICAgICAgICAgICAgbGltaXQgPSBwYXJzZUludChvcHRpb25zLmxvb2t1cExpbWl0LCAxMCksXHJcbiAgICAgICAgICAgICAgICBkYXRhO1xyXG5cclxuICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb25zOiAkLmdyZXAob3B0aW9ucy5sb29rdXAsIGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpbHRlcihzdWdnZXN0aW9uLCBxdWVyeSwgcXVlcnlMb3dlckNhc2UpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGlmIChsaW1pdCAmJiBkYXRhLnN1Z2dlc3Rpb25zLmxlbmd0aCA+IGxpbWl0KSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhLnN1Z2dlc3Rpb25zID0gZGF0YS5zdWdnZXN0aW9ucy5zbGljZSgwLCBsaW1pdCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGdldFN1Z2dlc3Rpb25zOiBmdW5jdGlvbiAocSkge1xyXG4gICAgICAgICAgICB2YXIgcmVzcG9uc2UsXHJcbiAgICAgICAgICAgICAgICB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgICBzZXJ2aWNlVXJsID0gb3B0aW9ucy5zZXJ2aWNlVXJsLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zLFxyXG4gICAgICAgICAgICAgICAgY2FjaGVLZXksXHJcbiAgICAgICAgICAgICAgICBhamF4U2V0dGluZ3M7XHJcblxyXG4gICAgICAgICAgICBvcHRpb25zLnBhcmFtc1tvcHRpb25zLnBhcmFtTmFtZV0gPSBxO1xyXG4gICAgICAgICAgICBwYXJhbXMgPSBvcHRpb25zLmlnbm9yZVBhcmFtcyA/IG51bGwgOiBvcHRpb25zLnBhcmFtcztcclxuXHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLm9uU2VhcmNoU3RhcnQuY2FsbCh0aGF0LmVsZW1lbnQsIG9wdGlvbnMucGFyYW1zKSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihvcHRpb25zLmxvb2t1cCkpe1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5sb29rdXAocSwgZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gZGF0YS5zdWdnZXN0aW9ucztcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIGRhdGEuc3VnZ2VzdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LmlzTG9jYWwpIHtcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gdGhhdC5nZXRTdWdnZXN0aW9uc0xvY2FsKHEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihzZXJ2aWNlVXJsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VVcmwgPSBzZXJ2aWNlVXJsLmNhbGwodGhhdC5lbGVtZW50LCBxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhY2hlS2V5ID0gc2VydmljZVVybCArICc/JyArICQucGFyYW0ocGFyYW1zIHx8IHt9KTtcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gdGhhdC5jYWNoZWRSZXNwb25zZVtjYWNoZUtleV07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChyZXNwb25zZSAmJiAkLmlzQXJyYXkocmVzcG9uc2Uuc3VnZ2VzdGlvbnMpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gcmVzcG9uc2Uuc3VnZ2VzdGlvbnM7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgcmVzcG9uc2Uuc3VnZ2VzdGlvbnMpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF0aGF0LmlzQmFkUXVlcnkocSkpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuYWJvcnRBamF4KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgYWpheFNldHRpbmdzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDogc2VydmljZVVybCxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBwYXJhbXMsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogb3B0aW9ucy50eXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBvcHRpb25zLmRhdGFUeXBlXHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICQuZXh0ZW5kKGFqYXhTZXR0aW5ncywgb3B0aW9ucy5hamF4U2V0dGluZ3MpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QgPSAkLmFqYXgoYWpheFNldHRpbmdzKS5kb25lKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdDtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBvcHRpb25zLnRyYW5zZm9ybVJlc3VsdChkYXRhLCBxKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LnByb2Nlc3NSZXNwb25zZShyZXN1bHQsIHEsIGNhY2hlS2V5KTtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIHJlc3VsdC5zdWdnZXN0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICB9KS5mYWlsKGZ1bmN0aW9uIChqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pIHtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoRXJyb3IuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgW10pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgaXNCYWRRdWVyeTogZnVuY3Rpb24gKHEpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMucHJldmVudEJhZFF1ZXJpZXMpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgYmFkUXVlcmllcyA9IHRoaXMuYmFkUXVlcmllcyxcclxuICAgICAgICAgICAgICAgIGkgPSBiYWRRdWVyaWVzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIHdoaWxlIChpLS0pIHtcclxuICAgICAgICAgICAgICAgIGlmIChxLmluZGV4T2YoYmFkUXVlcmllc1tpXSkgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGhpZGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24odGhhdC5vcHRpb25zLm9uSGlkZSkgJiYgdGhhdC52aXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0Lm9wdGlvbnMub25IaWRlLmNhbGwodGhhdC5lbGVtZW50LCBjb250YWluZXIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGF0LnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcclxuICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIHRoYXQuc2lnbmFsSGludChudWxsKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzdWdnZXN0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnN1Z2dlc3Rpb25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zaG93Tm9TdWdnZXN0aW9uTm90aWNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub1N1Z2dlc3Rpb25zKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgZ3JvdXBCeSA9IG9wdGlvbnMuZ3JvdXBCeSxcclxuICAgICAgICAgICAgICAgIGZvcm1hdFJlc3VsdCA9IG9wdGlvbnMuZm9ybWF0UmVzdWx0LFxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGF0LmdldFF1ZXJ5KHRoYXQuY3VycmVudFZhbHVlKSxcclxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IHRoYXQuY2xhc3Nlcy5zdWdnZXN0aW9uLFxyXG4gICAgICAgICAgICAgICAgY2xhc3NTZWxlY3RlZCA9IHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCxcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXHJcbiAgICAgICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gJCh0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIpLFxyXG4gICAgICAgICAgICAgICAgYmVmb3JlUmVuZGVyID0gb3B0aW9ucy5iZWZvcmVSZW5kZXIsXHJcbiAgICAgICAgICAgICAgICBodG1sID0gJycsXHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIGZvcm1hdEdyb3VwID0gZnVuY3Rpb24gKHN1Z2dlc3Rpb24sIGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50Q2F0ZWdvcnkgPSBzdWdnZXN0aW9uLmRhdGFbZ3JvdXBCeV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2F0ZWdvcnkgPT09IGN1cnJlbnRDYXRlZ29yeSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5ID0gY3VycmVudENhdGVnb3J5O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiYXV0b2NvbXBsZXRlLWdyb3VwXCI+PHN0cm9uZz4nICsgY2F0ZWdvcnkgKyAnPC9zdHJvbmc+PC9kaXY+JztcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dCAmJiB0aGF0LmlzRXhhY3RNYXRjaCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KDApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBCdWlsZCBzdWdnZXN0aW9ucyBpbm5lciBIVE1MOlxyXG4gICAgICAgICAgICAkLmVhY2godGhhdC5zdWdnZXN0aW9ucywgZnVuY3Rpb24gKGksIHN1Z2dlc3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIGlmIChncm91cEJ5KXtcclxuICAgICAgICAgICAgICAgICAgICBodG1sICs9IGZvcm1hdEdyb3VwKHN1Z2dlc3Rpb24sIHZhbHVlLCBpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwiJyArIGNsYXNzTmFtZSArICdcIiBkYXRhLWluZGV4PVwiJyArIGkgKyAnXCI+JyArIGZvcm1hdFJlc3VsdChzdWdnZXN0aW9uLCB2YWx1ZSkgKyAnPC9kaXY+JztcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFkanVzdENvbnRhaW5lcldpZHRoKCk7XHJcblxyXG4gICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyLmRldGFjaCgpO1xyXG4gICAgICAgICAgICBjb250YWluZXIuaHRtbChodG1sKTtcclxuXHJcbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24oYmVmb3JlUmVuZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgYmVmb3JlUmVuZGVyLmNhbGwodGhhdC5lbGVtZW50LCBjb250YWluZXIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5zaG93KCk7XHJcblxyXG4gICAgICAgICAgICAvLyBTZWxlY3QgZmlyc3QgdmFsdWUgYnkgZGVmYXVsdDpcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuYXV0b1NlbGVjdEZpcnN0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAwO1xyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyLnNjcm9sbFRvcCgwKTtcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jaGlsZHJlbignLicgKyBjbGFzc05hbWUpLmZpcnN0KCkuYWRkQ2xhc3MoY2xhc3NTZWxlY3RlZCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoYXQudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoYXQuZmluZEJlc3RIaW50KCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgbm9TdWdnZXN0aW9uczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKSxcclxuICAgICAgICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gJCh0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hZGp1c3RDb250YWluZXJXaWR0aCgpO1xyXG5cclxuICAgICAgICAgICAgLy8gU29tZSBleHBsaWNpdCBzdGVwcy4gQmUgY2FyZWZ1bCBoZXJlIGFzIGl0IGVhc3kgdG8gZ2V0XHJcbiAgICAgICAgICAgIC8vIG5vU3VnZ2VzdGlvbnNDb250YWluZXIgcmVtb3ZlZCBmcm9tIERPTSBpZiBub3QgZGV0YWNoZWQgcHJvcGVybHkuXHJcbiAgICAgICAgICAgIG5vU3VnZ2VzdGlvbnNDb250YWluZXIuZGV0YWNoKCk7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5lbXB0eSgpOyAvLyBjbGVhbiBzdWdnZXN0aW9ucyBpZiBhbnlcclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZChub1N1Z2dlc3Rpb25zQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoYXQudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgYWRqdXN0Q29udGFpbmVyV2lkdGg6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgd2lkdGgsXHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgd2lkdGggaXMgYXV0bywgYWRqdXN0IHdpZHRoIGJlZm9yZSBkaXNwbGF5aW5nIHN1Z2dlc3Rpb25zLFxyXG4gICAgICAgICAgICAvLyBiZWNhdXNlIGlmIGluc3RhbmNlIHdhcyBjcmVhdGVkIGJlZm9yZSBpbnB1dCBoYWQgd2lkdGgsIGl0IHdpbGwgYmUgemVyby5cclxuICAgICAgICAgICAgLy8gQWxzbyBpdCBhZGp1c3RzIGlmIGlucHV0IHdpZHRoIGhhcyBjaGFuZ2VkLlxyXG4gICAgICAgICAgICAvLyAtMnB4IHRvIGFjY291bnQgZm9yIHN1Z2dlc3Rpb25zIGJvcmRlci5cclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMud2lkdGggPT09ICdhdXRvJykge1xyXG4gICAgICAgICAgICAgICAgd2lkdGggPSB0aGF0LmVsLm91dGVyV2lkdGgoKSAtIDI7XHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIud2lkdGgod2lkdGggPiAwID8gd2lkdGggOiAzMDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZmluZEJlc3RIaW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gdGhhdC5lbC52YWwoKS50b0xvd2VyQ2FzZSgpLFxyXG4gICAgICAgICAgICAgICAgYmVzdE1hdGNoID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIGlmICghdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgJC5lYWNoKHRoYXQuc3VnZ2VzdGlvbnMsIGZ1bmN0aW9uIChpLCBzdWdnZXN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZm91bmRNYXRjaCA9IHN1Z2dlc3Rpb24udmFsdWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHZhbHVlKSA9PT0gMDtcclxuICAgICAgICAgICAgICAgIGlmIChmb3VuZE1hdGNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoID0gc3VnZ2VzdGlvbjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiAhZm91bmRNYXRjaDtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQoYmVzdE1hdGNoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzaWduYWxIaW50OiBmdW5jdGlvbiAoc3VnZ2VzdGlvbikge1xyXG4gICAgICAgICAgICB2YXIgaGludFZhbHVlID0gJycsXHJcbiAgICAgICAgICAgICAgICB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgaWYgKHN1Z2dlc3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIGhpbnRWYWx1ZSA9IHRoYXQuY3VycmVudFZhbHVlICsgc3VnZ2VzdGlvbi52YWx1ZS5zdWJzdHIodGhhdC5jdXJyZW50VmFsdWUubGVuZ3RoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhhdC5oaW50VmFsdWUgIT09IGhpbnRWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5oaW50VmFsdWUgPSBoaW50VmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmhpbnQgPSBzdWdnZXN0aW9uO1xyXG4gICAgICAgICAgICAgICAgKHRoaXMub3B0aW9ucy5vbkhpbnQgfHwgJC5ub29wKShoaW50VmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgdmVyaWZ5U3VnZ2VzdGlvbnNGb3JtYXQ6IGZ1bmN0aW9uIChzdWdnZXN0aW9ucykge1xyXG4gICAgICAgICAgICAvLyBJZiBzdWdnZXN0aW9ucyBpcyBzdHJpbmcgYXJyYXksIGNvbnZlcnQgdGhlbSB0byBzdXBwb3J0ZWQgZm9ybWF0OlxyXG4gICAgICAgICAgICBpZiAoc3VnZ2VzdGlvbnMubGVuZ3RoICYmIHR5cGVvZiBzdWdnZXN0aW9uc1swXSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkLm1hcChzdWdnZXN0aW9ucywgZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IHZhbHVlLCBkYXRhOiBudWxsIH07XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb25zO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHZhbGlkYXRlT3JpZW50YXRpb246IGZ1bmN0aW9uKG9yaWVudGF0aW9uLCBmYWxsYmFjaykge1xyXG4gICAgICAgICAgICBvcmllbnRhdGlvbiA9ICQudHJpbShvcmllbnRhdGlvbiB8fCAnJykudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgICAgIGlmKCQuaW5BcnJheShvcmllbnRhdGlvbiwgWydhdXRvJywgJ2JvdHRvbScsICd0b3AnXSkgPT09IC0xKXtcclxuICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uID0gZmFsbGJhY2s7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBvcmllbnRhdGlvbjtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBwcm9jZXNzUmVzcG9uc2U6IGZ1bmN0aW9uIChyZXN1bHQsIG9yaWdpbmFsUXVlcnksIGNhY2hlS2V5KSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnM7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQuc3VnZ2VzdGlvbnMgPSB0aGF0LnZlcmlmeVN1Z2dlc3Rpb25zRm9ybWF0KHJlc3VsdC5zdWdnZXN0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICAvLyBDYWNoZSByZXN1bHRzIGlmIGNhY2hlIGlzIG5vdCBkaXNhYmxlZDpcclxuICAgICAgICAgICAgaWYgKCFvcHRpb25zLm5vQ2FjaGUpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuY2FjaGVkUmVzcG9uc2VbY2FjaGVLZXldID0gcmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMucHJldmVudEJhZFF1ZXJpZXMgJiYgcmVzdWx0LnN1Z2dlc3Rpb25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuYmFkUXVlcmllcy5wdXNoKG9yaWdpbmFsUXVlcnkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBSZXR1cm4gaWYgb3JpZ2luYWxRdWVyeSBpcyBub3QgbWF0Y2hpbmcgY3VycmVudCBxdWVyeTpcclxuICAgICAgICAgICAgaWYgKG9yaWdpbmFsUXVlcnkgIT09IHRoYXQuZ2V0UXVlcnkodGhhdC5jdXJyZW50VmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSByZXN1bHQuc3VnZ2VzdGlvbnM7XHJcbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGFjdGl2YXRlOiBmdW5jdGlvbiAoaW5kZXgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgYWN0aXZlSXRlbSxcclxuICAgICAgICAgICAgICAgIHNlbGVjdGVkID0gdGhhdC5jbGFzc2VzLnNlbGVjdGVkLFxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKSxcclxuICAgICAgICAgICAgICAgIGNoaWxkcmVuID0gY29udGFpbmVyLmZpbmQoJy4nICsgdGhhdC5jbGFzc2VzLnN1Z2dlc3Rpb24pO1xyXG5cclxuICAgICAgICAgICAgY29udGFpbmVyLmZpbmQoJy4nICsgc2VsZWN0ZWQpLnJlbW92ZUNsYXNzKHNlbGVjdGVkKTtcclxuXHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IGluZGV4O1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCAhPT0gLTEgJiYgY2hpbGRyZW4ubGVuZ3RoID4gdGhhdC5zZWxlY3RlZEluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICBhY3RpdmVJdGVtID0gY2hpbGRyZW4uZ2V0KHRoYXQuc2VsZWN0ZWRJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAkKGFjdGl2ZUl0ZW0pLmFkZENsYXNzKHNlbGVjdGVkKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBhY3RpdmVJdGVtO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzZWxlY3RIaW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIGkgPSAkLmluQXJyYXkodGhhdC5oaW50LCB0aGF0LnN1Z2dlc3Rpb25zKTtcclxuXHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0KGkpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNlbGVjdDogZnVuY3Rpb24gKGkpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICB0aGF0LmhpZGUoKTtcclxuICAgICAgICAgICAgdGhhdC5vblNlbGVjdChpKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBtb3ZlVXA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5jaGlsZHJlbigpLmZpcnN0KCkucmVtb3ZlQ2xhc3ModGhhdC5jbGFzc2VzLnNlbGVjdGVkKTtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5maW5kQmVzdEhpbnQoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhhdC5hZGp1c3RTY3JvbGwodGhhdC5zZWxlY3RlZEluZGV4IC0gMSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgbW92ZURvd246IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gKHRoYXQuc3VnZ2VzdGlvbnMubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhhdC5hZGp1c3RTY3JvbGwodGhhdC5zZWxlY3RlZEluZGV4ICsgMSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgYWRqdXN0U2Nyb2xsOiBmdW5jdGlvbiAoaW5kZXgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgYWN0aXZlSXRlbSA9IHRoYXQuYWN0aXZhdGUoaW5kZXgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFhY3RpdmVJdGVtKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBvZmZzZXRUb3AsXHJcbiAgICAgICAgICAgICAgICB1cHBlckJvdW5kLFxyXG4gICAgICAgICAgICAgICAgbG93ZXJCb3VuZCxcclxuICAgICAgICAgICAgICAgIGhlaWdodERlbHRhID0gJChhY3RpdmVJdGVtKS5vdXRlckhlaWdodCgpO1xyXG5cclxuICAgICAgICAgICAgb2Zmc2V0VG9wID0gYWN0aXZlSXRlbS5vZmZzZXRUb3A7XHJcbiAgICAgICAgICAgIHVwcGVyQm91bmQgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnNjcm9sbFRvcCgpO1xyXG4gICAgICAgICAgICBsb3dlckJvdW5kID0gdXBwZXJCb3VuZCArIHRoYXQub3B0aW9ucy5tYXhIZWlnaHQgLSBoZWlnaHREZWx0YTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvZmZzZXRUb3AgPCB1cHBlckJvdW5kKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnNjcm9sbFRvcChvZmZzZXRUb3ApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9mZnNldFRvcCA+IGxvd2VyQm91bmQpIHtcclxuICAgICAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuc2Nyb2xsVG9wKG9mZnNldFRvcCAtIHRoYXQub3B0aW9ucy5tYXhIZWlnaHQgKyBoZWlnaHREZWx0YSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghdGhhdC5vcHRpb25zLnByZXNlcnZlSW5wdXQpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuZ2V0VmFsdWUodGhhdC5zdWdnZXN0aW9uc1tpbmRleF0udmFsdWUpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQobnVsbCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChpbmRleCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvblNlbGVjdENhbGxiYWNrID0gdGhhdC5vcHRpb25zLm9uU2VsZWN0LFxyXG4gICAgICAgICAgICAgICAgc3VnZ2VzdGlvbiA9IHRoYXQuc3VnZ2VzdGlvbnNbaW5kZXhdO1xyXG5cclxuICAgICAgICAgICAgdGhhdC5jdXJyZW50VmFsdWUgPSB0aGF0LmdldFZhbHVlKHN1Z2dlc3Rpb24udmFsdWUpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuY3VycmVudFZhbHVlICE9PSB0aGF0LmVsLnZhbCgpICYmICF0aGF0Lm9wdGlvbnMucHJlc2VydmVJbnB1dCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQobnVsbCk7XHJcbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSBbXTtcclxuICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb24gPSBzdWdnZXN0aW9uO1xyXG5cclxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihvblNlbGVjdENhbGxiYWNrKSkge1xyXG4gICAgICAgICAgICAgICAgb25TZWxlY3RDYWxsYmFjay5jYWxsKHRoYXQuZWxlbWVudCwgc3VnZ2VzdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBnZXRWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIGRlbGltaXRlciA9IHRoYXQub3B0aW9ucy5kZWxpbWl0ZXIsXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50VmFsdWUsXHJcbiAgICAgICAgICAgICAgICBwYXJ0cztcclxuXHJcbiAgICAgICAgICAgIGlmICghZGVsaW1pdGVyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGN1cnJlbnRWYWx1ZSA9IHRoYXQuY3VycmVudFZhbHVlO1xyXG4gICAgICAgICAgICBwYXJ0cyA9IGN1cnJlbnRWYWx1ZS5zcGxpdChkZWxpbWl0ZXIpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gY3VycmVudFZhbHVlLnN1YnN0cigwLCBjdXJyZW50VmFsdWUubGVuZ3RoIC0gcGFydHNbcGFydHMubGVuZ3RoIC0gMV0ubGVuZ3RoKSArIHZhbHVlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGRpc3Bvc2U6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICB0aGF0LmVsLm9mZignLmF1dG9jb21wbGV0ZScpLnJlbW92ZURhdGEoJ2F1dG9jb21wbGV0ZScpO1xyXG4gICAgICAgICAgICB0aGF0LmRpc2FibGVLaWxsZXJGbigpO1xyXG4gICAgICAgICAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUuYXV0b2NvbXBsZXRlJywgdGhhdC5maXhQb3NpdGlvbkNhcHR1cmUpO1xyXG4gICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gQ3JlYXRlIGNoYWluYWJsZSBqUXVlcnkgcGx1Z2luOlxyXG4gICAgJC5mbi5hdXRvY29tcGxldGUgPSAkLmZuLmRldmJyaWRnZUF1dG9jb21wbGV0ZSA9IGZ1bmN0aW9uIChvcHRpb25zLCBhcmdzKSB7XHJcbiAgICAgICAgdmFyIGRhdGFLZXkgPSAnYXV0b2NvbXBsZXRlJztcclxuICAgICAgICAvLyBJZiBmdW5jdGlvbiBpbnZva2VkIHdpdGhvdXQgYXJndW1lbnQgcmV0dXJuXHJcbiAgICAgICAgLy8gaW5zdGFuY2Ugb2YgdGhlIGZpcnN0IG1hdGNoZWQgZWxlbWVudDpcclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maXJzdCgpLmRhdGEoZGF0YUtleSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGlucHV0RWxlbWVudCA9ICQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IGlucHV0RWxlbWVudC5kYXRhKGRhdGFLZXkpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlICYmIHR5cGVvZiBpbnN0YW5jZVtvcHRpb25zXSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlW29wdGlvbnNdKGFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgaW5zdGFuY2UgYWxyZWFkeSBleGlzdHMsIGRlc3Ryb3kgaXQ6XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UgJiYgaW5zdGFuY2UuZGlzcG9zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLmRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGluc3RhbmNlID0gbmV3IEF1dG9jb21wbGV0ZSh0aGlzLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIGlucHV0RWxlbWVudC5kYXRhKGRhdGFLZXksIGluc3RhbmNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxufSkpO1xyXG4iLCJ2YXIgbm90aWZpY2F0aW9uID0gKGZ1bmN0aW9uKCkge1xyXG4gIHZhciBub3RpZmljYXRpb25fYm94ID1mYWxzZTtcclxuICB2YXIgaXNfaW5pdD1mYWxzZTtcclxuICB2YXIgY29uZmlybV9vcHQ9e1xyXG4gICAgdGl0bGU6XCLQo9C00LDQu9C10L3QuNC1XCIsXHJcbiAgICBxdWVzdGlvbjpcItCS0Ysg0LTQtdC50YHRgtCy0LjRgtC10LvRjNC90L4g0YXQvtGC0LjRgtC1INGD0LTQsNC70LjRgtGMP1wiLFxyXG4gICAgYnV0dG9uWWVzOlwi0JTQsFwiLFxyXG4gICAgYnV0dG9uTm86XCLQndC10YJcIixcclxuICAgIGNhbGxiYWNrWWVzOmZhbHNlLFxyXG4gICAgY2FsbGJhY2tObzpmYWxzZSxcclxuICAgIG9iajpmYWxzZSxcclxuICB9O1xyXG5cclxuICB2YXIgYWxlcnRfb3B0PXtcclxuICAgIHRpdGxlOlwiXCIsXHJcbiAgICBxdWVzdGlvbjpcItCh0L7QvtCx0YnQtdC90LjQtVwiLFxyXG4gICAgYnV0dG9uWWVzOlwi0JTQsFwiLFxyXG4gICAgY2FsbGJhY2tZZXM6ZmFsc2UsXHJcbiAgICBvYmo6ZmFsc2UsXHJcbiAgfTtcclxuXHJcblxyXG4gIGZ1bmN0aW9uIGluaXQoKXtcclxuICAgIGlzX2luaXQ9dHJ1ZTtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3g9JCgnLm5vdGlmaWNhdGlvbl9ib3gnKTtcclxuICAgIGlmKG5vdGlmaWNhdGlvbl9ib3gubGVuZ3RoPjApcmV0dXJuO1xyXG5cclxuICAgICQoJ2JvZHknKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdub3RpZmljYXRpb25fYm94Jz48L2Rpdj5cIik7XHJcbiAgICBub3RpZmljYXRpb25fYm94PSQoJy5ub3RpZmljYXRpb25fYm94Jyk7XHJcblxyXG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCcubm90aWZ5X2NvbnRyb2wnLGNsb3NlTW9kYWwpO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCcubm90aWZ5X2Nsb3NlJyxjbG9zZU1vZGFsKTtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJyxjbG9zZU1vZGFsRm9uKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNsb3NlTW9kYWwoKXtcclxuICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnc2hvd19ub3RpZmknKTtcclxuICB9XHJcbiAgZnVuY3Rpb24gY2xvc2VNb2RhbEZvbihlKXtcclxuICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XHJcbiAgICBpZih0YXJnZXQuY2xhc3NOYW1lPT1cIm5vdGlmaWNhdGlvbl9ib3hcIil7XHJcbiAgICAgIGNsb3NlTW9kYWwoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFsZXJ0KGRhdGEpe1xyXG4gICAgaWYoIWRhdGEpZGF0YT17fTtcclxuICAgIGRhdGE9b2JqZWN0cyhhbGVydF9vcHQsZGF0YSk7XHJcblxyXG4gICAgaWYoIWlzX2luaXQpaW5pdCgpO1xyXG5cclxuICAgIG5vdHlmeV9jbGFzcz0nbm90aWZ5X2JveCAnO1xyXG4gICAgaWYoZGF0YS5ub3R5ZnlfY2xhc3Mpbm90eWZ5X2NsYXNzKz1kYXRhLm5vdHlmeV9jbGFzcztcclxuXHJcbiAgICBib3hfaHRtbD0nPGRpdiBjbGFzcz1cIicrbm90eWZ5X2NsYXNzKydcIj4nO1xyXG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X3RpdGxlXCI+JztcclxuICAgIGJveF9odG1sKz1kYXRhLnRpdGxlO1xyXG4gICAgYm94X2h0bWwrPSc8c3BhbiBjbGFzcz1cIm5vdGlmeV9jbG9zZVwiPjwvc3Bhbj4nO1xyXG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xyXG5cclxuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcclxuICAgIGJveF9odG1sKz1kYXRhLnF1ZXN0aW9uO1xyXG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xyXG5cclxuICAgIGlmKGRhdGEuYnV0dG9uWWVzfHxkYXRhLmJ1dHRvbk5vKSB7XHJcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xyXG4gICAgICBpZiAoZGF0YS5idXR0b25ZZXMpYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiPicgKyBkYXRhLmJ1dHRvblllcyArICc8L2Rpdj4nO1xyXG4gICAgICBpZiAoZGF0YS5idXR0b25Obylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5fbm9cIj4nICsgZGF0YS5idXR0b25ObyArICc8L2Rpdj4nO1xyXG4gICAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcclxuICAgIH07XHJcblxyXG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveC5odG1sKGJveF9odG1sKTtcclxuXHJcblxyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgJCgnYm9keScpLmFkZENsYXNzKCdzaG93X25vdGlmaScpO1xyXG4gICAgfSwxMDApXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjb25maXJtKGRhdGEpe1xyXG4gICAgaWYoIWRhdGEpZGF0YT17fTtcclxuICAgIGRhdGE9b2JqZWN0cyhjb25maXJtX29wdCxkYXRhKTtcclxuXHJcbiAgICBpZighaXNfaW5pdClpbml0KCk7XHJcblxyXG4gICAgYm94X2h0bWw9JzxkaXYgY2xhc3M9XCJub3RpZnlfYm94XCI+JztcclxuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV90aXRsZVwiPic7XHJcbiAgICBib3hfaHRtbCs9ZGF0YS50aXRsZTtcclxuICAgIGJveF9odG1sKz0nPHNwYW4gY2xhc3M9XCJub3RpZnlfY2xvc2VcIj48L3NwYW4+JztcclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuXHJcbiAgICBib3hfaHRtbCs9JzxkaXYgY2xhc3M9XCJub3RpZnlfY29udGVudFwiPic7XHJcbiAgICBib3hfaHRtbCs9ZGF0YS5xdWVzdGlvbjtcclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuXHJcbiAgICBpZihkYXRhLmJ1dHRvblllc3x8ZGF0YS5idXR0b25Obykge1xyXG4gICAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250cm9sXCI+JztcclxuICAgICAgaWYgKGRhdGEuYnV0dG9uWWVzKWJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2J0bl95ZXNcIj4nICsgZGF0YS5idXR0b25ZZXMgKyAnPC9kaXY+JztcclxuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX25vXCI+JyArIGRhdGEuYnV0dG9uTm8gKyAnPC9kaXY+JztcclxuICAgICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcbiAgICB9XHJcblxyXG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveC5odG1sKGJveF9odG1sKTtcclxuXHJcbiAgICBpZihkYXRhLmNhbGxiYWNrWWVzIT1mYWxzZSl7XHJcbiAgICAgIG5vdGlmaWNhdGlvbl9ib3guZmluZCgnLm5vdGlmeV9idG5feWVzJykub24oJ2NsaWNrJyxkYXRhLmNhbGxiYWNrWWVzLmJpbmQoZGF0YS5vYmopKTtcclxuICAgIH1cclxuICAgIGlmKGRhdGEuY2FsbGJhY2tObyE9ZmFsc2Upe1xyXG4gICAgICBub3RpZmljYXRpb25fYm94LmZpbmQoJy5ub3RpZnlfYnRuX25vJykub24oJ2NsaWNrJyxkYXRhLmNhbGxiYWNrTm8uYmluZChkYXRhLm9iaikpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICQoJ2JvZHknKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcclxuICAgIH0sMTAwKVxyXG5cclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBhbGVydDogYWxlcnQsXHJcbiAgICBjb25maXJtOiBjb25maXJtXHJcbiAgfTtcclxuXHJcbn0pKCk7XHJcblxyXG5cclxuJCgnW3JlZj1wb3B1cF0nKS5vbignY2xpY2snLGZ1bmN0aW9uIChlKXtcclxuICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgJHRoaXM9JCh0aGlzKVxyXG4gIGVsPSQoJHRoaXMuYXR0cignaHJlZicpKTtcclxuICBkYXRhPWVsLmRhdGEoKTtcclxuXHJcbiAgZGF0YS5xdWVzdGlvbj1lbC5odG1sKCk7XHJcbiAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xyXG59KTtcclxuIiwiJCh3aW5kb3cpLmxvYWQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICQoJy5hY2NvcmRpb24gLmFjY29yZGlvbi1jb250cm9sJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICR0aGlzID0gJCh0aGlzKTtcclxuICAgICRhY2NvcmRpb24gPSAkdGhpcy5jbG9zZXN0KCcuYWNjb3JkaW9uJyk7XHJcblxyXG4gICAgaWYgKCRhY2NvcmRpb24uaGFzQ2xhc3MoJ29wZW4nKSkge1xyXG4gICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLmhpZGUoMzAwKTtcclxuICAgICAgJGFjY29yZGlvbi5yZW1vdmVDbGFzcygnb3BlbicpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLnNob3coMzAwKTtcclxuICAgICAgJGFjY29yZGlvbi5hZGRDbGFzcygnb3BlbicpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSk7XHJcbn0pXHJcblxyXG5vYmplY3RzID0gZnVuY3Rpb24gKGEsYikge1xyXG4gIHZhciBjID0gYixcclxuICAgIGtleTtcclxuICBmb3IgKGtleSBpbiBhKSB7XHJcbiAgICBpZiAoYS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgIGNba2V5XSA9IGtleSBpbiBiID8gYltrZXldIDogYVtrZXldO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gYztcclxufTtcclxuXHJcbihmdW5jdGlvbigpIHtcclxuICBmdW5jdGlvbiBpbWdfbG9hZF9maW5pc2goKXtcclxuICAgIGRhdGE9dGhpcztcclxuICAgIGRhdGEuaW1nLmF0dHIoJ3NyYycsZGF0YS5zcmMpO1xyXG4gIH1cclxuXHJcbiAgaW1ncz0kKCdzZWN0aW9uOm5vdCgubmF2aWdhdGlvbiknKS5maW5kKCcubG9nbyBpbWcnKTtcclxuICBmb3IgKHZhciBpPTA7aTxpbWdzLmxlbmd0aDtpKyspe1xyXG4gICAgaW1nPWltZ3MuZXEoaSk7XHJcbiAgICBzcmM9aW1nLmF0dHIoJ3NyYycpO1xyXG4gICAgaW1nLmF0dHIoJ3NyYycsJy9pbWFnZXMvdGVtcGxhdGUtbG9nby5qcGcnKTtcclxuICAgIGRhdGE9e1xyXG4gICAgICBzcmM6c3JjLFxyXG4gICAgICBpbWc6aW1nXHJcbiAgICB9O1xyXG4gICAgaW1hZ2U9JCgnPGltZy8+Jyx7XHJcbiAgICAgIHNyYzpzcmNcclxuICAgIH0pLm9uKCdsb2FkJyxpbWdfbG9hZF9maW5pc2guYmluZChkYXRhKSlcclxuICB9XHJcbn0pKCk7XHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgZWxzPSQoJy5hamF4X2xvYWQnKTtcclxuICBmb3IoaT0wO2k8ZWxzLmxlbmd0aDtpKyspe1xyXG4gICAgZWw9ZWxzLmVxKGkpO1xyXG4gICAgdXJsPWVsLmF0dHIoJ3JlcycpO1xyXG4gICAgJC5nZXQodXJsLGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICR0aGlzPSQodGhpcyk7XHJcbiAgICAgICR0aGlzLmh0bWwoZGF0YSk7XHJcbiAgICAgIGFqYXhGb3JtKCR0aGlzKTtcclxuICAgIH0uYmluZChlbCkpXHJcbiAgfVxyXG59KSgpO1xyXG5cclxuJCgnaW5wdXRbdHlwZT1maWxlXScpLm9uKCdjaGFuZ2UnLGZ1bmN0aW9uKGV2dCl7XHJcbiAgdmFyIGZpbGUgPSBldnQudGFyZ2V0LmZpbGVzOyAvLyBGaWxlTGlzdCBvYmplY3RcclxuICB2YXIgZiA9IGZpbGVbMF07XHJcbiAgLy8gT25seSBwcm9jZXNzIGltYWdlIGZpbGVzLlxyXG4gIGlmICghZi50eXBlLm1hdGNoKCdpbWFnZS4qJykpIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbiAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcblxyXG4gIGRhdGE9IHtcclxuICAgICdlbCc6IHRoaXMsXHJcbiAgICAnZic6IGZcclxuICB9O1xyXG4gIHJlYWRlci5vbmxvYWQgPSAoZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgaW1nPSQoJ1tmb3I9XCInK2RhdGEuZWwubmFtZSsnXCJdJyk7XHJcbiAgICAgIGlmKGltZy5sZW5ndGg+MCl7XHJcbiAgICAgICAgaW1nLmF0dHIoJ3NyYycsZS50YXJnZXQucmVzdWx0KVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH0pKGRhdGEpO1xyXG4gIC8vIFJlYWQgaW4gdGhlIGltYWdlIGZpbGUgYXMgYSBkYXRhIFVSTC5cclxuICByZWFkZXIucmVhZEFzRGF0YVVSTChmKTtcclxufSk7Il19
