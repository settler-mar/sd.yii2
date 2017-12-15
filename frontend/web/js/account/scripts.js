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
                $(".link-head-stores span.stores-flash").animo({animation: "flash", iterate: "infinite", duration: 2.4});
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

                    $("#top").find("form[name=withdraw-form]").find('#userswithdraw-process_id').val(option);

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

                    $("#top").find("form[name=withdraw-form]").find("#userswithdraw-bill").attr("placeholder", placeholder);

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
    header.control.events();
});

$(function(){
    $("input.link").click(function(){	// получение фокуса текстовым полем-ссылкой
        $(this).select();
    });
});

$('body').on('click', '.link-to-clipboard', function(e){
    e.preventDefault();
    var linkText = $(this).data('link');
    var text = $(this).data('text');
    if(!text){
        text='Ваша партнёрская ссылка скопирована в буфер обмена. Удачной работы!';
    }
    var tmp   = document.createElement('INPUT');
    tmp.value = linkText;
    document.body.appendChild(tmp);
    tmp.select();
    document.execCommand('copy');
    document.body.removeChild(tmp);
    notification.notifi({
        title: 'Успешно',
        message: text,
        type: 'success'
    });
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
      obj:$(this)
    })
  });

});


var lg = (function() {
  var lang={};
  url='/language/'+document.documentElement.lang+'.json';
  $.get(url,function (data) {
    console.log(data);
    for(var index in data) {
      data[index]=clearVar(data[index]);
    }
    lang=data;
    console.log(data);
  },'json')

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

  return function(tpl,data){
    if(typeof(lang[tpl])=="undefined"){
      console.log("lang not found: "+tpl);
      return "";
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
  p = $('.container img,.container iframe');
  for (i = 0; i < p.length; i++) {
    el = p.eq(i);
    var parent = el.parent();
    if(parent[0].tagName=="A"){
      continue;
    }
    m_w = parent.width();
    if (m_w > mw)m_w = mw;
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
    if (self.hasClass('disabled')) {
      return null;
    }
    self.addClass('disabled');

    if(type == "add") {
      self.find(".fa").removeClass("muted");
    }

    self.find(".fa").removeClass("pulse2").addClass("fa-spin");

    $.post("/account/favorites",{
      "type" : type ,
      "affiliate_id": affiliate_id
    },function (data) {
      self.removeClass('disabled');
      if(data.error){
        self.find(".fa").removeClass("fa-spin");
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
      self.removeClass('disabled');
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
(function(){
  if(!window.opener)return;
  if(document.referrer.indexOf('secretdiscounter')<0)return;

  href=window.opener.location.href;
  if(href.indexOf('socials')>0 || href.indexOf('login')>0){
    return;
  }
  if(href.indexOf('store')>0 || href.indexOf('coupon')>0 || href.indexOf('settings')>0){
    window.opener.location.reload();
  }else{
    window.opener.location.href=location.href;
  }
  window.close();
})();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpxdWVyeS5tZW51LWFpbS5qcyIsImNpcmNsZXMubWluLmpzIiwiZGF0ZXBpY2tlci5qcyIsImpxdWVyeS5ub3R5LnBhY2thZ2VkLm1pbi5qcyIsIm1haW4uanMiLCJhbmltby5qcyIsImpxdWVyeS5tb2NramF4LmpzIiwianF1ZXJ5LmF1dG9jb21wbGV0ZS5qcyIsIm5vdGlmaWNhdGlvbi5qcyIsImFqYXhfcmVtb3ZlLmpzIiwibGFuZ3VhZ2UuanMiLCJmb3JfYWxsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25VQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25vREE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbFVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeGxCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUgxOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUl0Y0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIG1lbnUtYWltIGlzIGEgalF1ZXJ5IHBsdWdpbiBmb3IgZHJvcGRvd24gbWVudXMgdGhhdCBjYW4gZGlmZmVyZW50aWF0ZVxuICogYmV0d2VlbiBhIHVzZXIgdHJ5aW5nIGhvdmVyIG92ZXIgYSBkcm9wZG93biBpdGVtIHZzIHRyeWluZyB0byBuYXZpZ2F0ZSBpbnRvXG4gKiBhIHN1Ym1lbnUncyBjb250ZW50cy5cbiAqXG4gKiBtZW51LWFpbSBhc3N1bWVzIHRoYXQgeW91IGhhdmUgYXJlIHVzaW5nIGEgbWVudSB3aXRoIHN1Ym1lbnVzIHRoYXQgZXhwYW5kXG4gKiB0byB0aGUgbWVudSdzIHJpZ2h0LiBJdCB3aWxsIGZpcmUgZXZlbnRzIHdoZW4gdGhlIHVzZXIncyBtb3VzZSBlbnRlcnMgYSBuZXdcbiAqIGRyb3Bkb3duIGl0ZW0gKmFuZCogd2hlbiB0aGF0IGl0ZW0gaXMgYmVpbmcgaW50ZW50aW9uYWxseSBob3ZlcmVkIG92ZXIuXG4gKlxuICogX19fX19fX19fX19fX19fX19fX19fX19fX19cbiAqIHwgTW9ua2V5cyAgPnwgICBHb3JpbGxhICB8XG4gKiB8IEdvcmlsbGFzID58ICAgQ29udGVudCAgfFxuICogfCBDaGltcHMgICA+fCAgIEhlcmUgICAgIHxcbiAqIHxfX19fX19fX19fX3xfX19fX19fX19fX198XG4gKlxuICogSW4gdGhlIGFib3ZlIGV4YW1wbGUsIFwiR29yaWxsYXNcIiBpcyBzZWxlY3RlZCBhbmQgaXRzIHN1Ym1lbnUgY29udGVudCBpc1xuICogYmVpbmcgc2hvd24gb24gdGhlIHJpZ2h0LiBJbWFnaW5lIHRoYXQgdGhlIHVzZXIncyBjdXJzb3IgaXMgaG92ZXJpbmcgb3ZlclxuICogXCJHb3JpbGxhcy5cIiBXaGVuIHRoZXkgbW92ZSB0aGVpciBtb3VzZSBpbnRvIHRoZSBcIkdvcmlsbGEgQ29udGVudFwiIGFyZWEsIHRoZXlcbiAqIG1heSBicmllZmx5IGhvdmVyIG92ZXIgXCJDaGltcHMuXCIgVGhpcyBzaG91bGRuJ3QgY2xvc2UgdGhlIFwiR29yaWxsYSBDb250ZW50XCJcbiAqIGFyZWEuXG4gKlxuICogVGhpcyBwcm9ibGVtIGlzIG5vcm1hbGx5IHNvbHZlZCB1c2luZyB0aW1lb3V0cyBhbmQgZGVsYXlzLiBtZW51LWFpbSB0cmllcyB0b1xuICogc29sdmUgdGhpcyBieSBkZXRlY3RpbmcgdGhlIGRpcmVjdGlvbiBvZiB0aGUgdXNlcidzIG1vdXNlIG1vdmVtZW50LiBUaGlzIGNhblxuICogbWFrZSBmb3IgcXVpY2tlciB0cmFuc2l0aW9ucyB3aGVuIG5hdmlnYXRpbmcgdXAgYW5kIGRvd24gdGhlIG1lbnUuIFRoZVxuICogZXhwZXJpZW5jZSBpcyBob3BlZnVsbHkgc2ltaWxhciB0byBhbWF6b24uY29tLydzIFwiU2hvcCBieSBEZXBhcnRtZW50XCJcbiAqIGRyb3Bkb3duLlxuICpcbiAqIFVzZSBsaWtlIHNvOlxuICpcbiAqICAgICAgJChcIiNtZW51XCIpLm1lbnVBaW0oe1xuICogICAgICAgICAgYWN0aXZhdGU6ICQubm9vcCwgIC8vIGZpcmVkIG9uIHJvdyBhY3RpdmF0aW9uXG4gKiAgICAgICAgICBkZWFjdGl2YXRlOiAkLm5vb3AgIC8vIGZpcmVkIG9uIHJvdyBkZWFjdGl2YXRpb25cbiAqICAgICAgfSk7XG4gKlxuICogIC4uLnRvIHJlY2VpdmUgZXZlbnRzIHdoZW4gYSBtZW51J3Mgcm93IGhhcyBiZWVuIHB1cnBvc2VmdWxseSAoZGUpYWN0aXZhdGVkLlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgb3B0aW9ucyBjYW4gYmUgcGFzc2VkIHRvIG1lbnVBaW0uIEFsbCBmdW5jdGlvbnMgZXhlY3V0ZSB3aXRoXG4gKiB0aGUgcmVsZXZhbnQgcm93J3MgSFRNTCBlbGVtZW50IGFzIHRoZSBleGVjdXRpb24gY29udGV4dCAoJ3RoaXMnKTpcbiAqXG4gKiAgICAgIC5tZW51QWltKHtcbiAqICAgICAgICAgIC8vIEZ1bmN0aW9uIHRvIGNhbGwgd2hlbiBhIHJvdyBpcyBwdXJwb3NlZnVsbHkgYWN0aXZhdGVkLiBVc2UgdGhpc1xuICogICAgICAgICAgLy8gdG8gc2hvdyBhIHN1Ym1lbnUncyBjb250ZW50IGZvciB0aGUgYWN0aXZhdGVkIHJvdy5cbiAqICAgICAgICAgIGFjdGl2YXRlOiBmdW5jdGlvbigpIHt9LFxuICpcbiAqICAgICAgICAgIC8vIEZ1bmN0aW9uIHRvIGNhbGwgd2hlbiBhIHJvdyBpcyBkZWFjdGl2YXRlZC5cbiAqICAgICAgICAgIGRlYWN0aXZhdGU6IGZ1bmN0aW9uKCkge30sXG4gKlxuICogICAgICAgICAgLy8gRnVuY3Rpb24gdG8gY2FsbCB3aGVuIG1vdXNlIGVudGVycyBhIG1lbnUgcm93LiBFbnRlcmluZyBhIHJvd1xuICogICAgICAgICAgLy8gZG9lcyBub3QgbWVhbiB0aGUgcm93IGhhcyBiZWVuIGFjdGl2YXRlZCwgYXMgdGhlIHVzZXIgbWF5IGJlXG4gKiAgICAgICAgICAvLyBtb3VzaW5nIG92ZXIgdG8gYSBzdWJtZW51LlxuICogICAgICAgICAgZW50ZXI6IGZ1bmN0aW9uKCkge30sXG4gKlxuICogICAgICAgICAgLy8gRnVuY3Rpb24gdG8gY2FsbCB3aGVuIG1vdXNlIGV4aXRzIGEgbWVudSByb3cuXG4gKiAgICAgICAgICBleGl0OiBmdW5jdGlvbigpIHt9LFxuICpcbiAqICAgICAgICAgIC8vIFNlbGVjdG9yIGZvciBpZGVudGlmeWluZyB3aGljaCBlbGVtZW50cyBpbiB0aGUgbWVudSBhcmUgcm93c1xuICogICAgICAgICAgLy8gdGhhdCBjYW4gdHJpZ2dlciB0aGUgYWJvdmUgZXZlbnRzLiBEZWZhdWx0cyB0byBcIj4gbGlcIi5cbiAqICAgICAgICAgIHJvd1NlbGVjdG9yOiBcIj4gbGlcIixcbiAqXG4gKiAgICAgICAgICAvLyBZb3UgbWF5IGhhdmUgc29tZSBtZW51IHJvd3MgdGhhdCBhcmVuJ3Qgc3VibWVudXMgYW5kIHRoZXJlZm9yZVxuICogICAgICAgICAgLy8gc2hvdWxkbid0IGV2ZXIgbmVlZCB0byBcImFjdGl2YXRlLlwiIElmIHNvLCBmaWx0ZXIgc3VibWVudSByb3dzIHcvXG4gKiAgICAgICAgICAvLyB0aGlzIHNlbGVjdG9yLiBEZWZhdWx0cyB0byBcIipcIiAoYWxsIGVsZW1lbnRzKS5cbiAqICAgICAgICAgIHN1Ym1lbnVTZWxlY3RvcjogXCIqXCIsXG4gKlxuICogICAgICAgICAgLy8gRGlyZWN0aW9uIHRoZSBzdWJtZW51IG9wZW5zIHJlbGF0aXZlIHRvIHRoZSBtYWluIG1lbnUuIENhbiBiZVxuICogICAgICAgICAgLy8gbGVmdCwgcmlnaHQsIGFib3ZlLCBvciBiZWxvdy4gRGVmYXVsdHMgdG8gXCJyaWdodFwiLlxuICogICAgICAgICAgc3VibWVudURpcmVjdGlvbjogXCJyaWdodFwiXG4gKiAgICAgIH0pO1xuICpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9rYW1lbnMvalF1ZXJ5LW1lbnUtYWltXG4qL1xuKGZ1bmN0aW9uKCQpIHtcblxuICAgICQuZm4ubWVudUFpbSA9IGZ1bmN0aW9uKG9wdHMpIHtcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBtZW51LWFpbSBmb3IgYWxsIGVsZW1lbnRzIGluIGpRdWVyeSBjb2xsZWN0aW9uXG4gICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGluaXQuY2FsbCh0aGlzLCBvcHRzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGluaXQob3B0cykge1xuICAgICAgICB2YXIgJG1lbnUgPSAkKHRoaXMpLFxuICAgICAgICAgICAgYWN0aXZlUm93ID0gbnVsbCxcbiAgICAgICAgICAgIG1vdXNlTG9jcyA9IFtdLFxuICAgICAgICAgICAgbGFzdERlbGF5TG9jID0gbnVsbCxcbiAgICAgICAgICAgIHRpbWVvdXRJZCA9IG51bGwsXG4gICAgICAgICAgICBvcHRpb25zID0gJC5leHRlbmQoe1xuICAgICAgICAgICAgICAgIHJvd1NlbGVjdG9yOiBcIj4gbGlcIixcbiAgICAgICAgICAgICAgICBzdWJtZW51U2VsZWN0b3I6IFwiKlwiLFxuICAgICAgICAgICAgICAgIHN1Ym1lbnVEaXJlY3Rpb246IFwicmlnaHRcIixcbiAgICAgICAgICAgICAgICB0b2xlcmFuY2U6IDc1LCAgLy8gYmlnZ2VyID0gbW9yZSBmb3JnaXZleSB3aGVuIGVudGVyaW5nIHN1Ym1lbnVcbiAgICAgICAgICAgICAgICBlbnRlcjogJC5ub29wLFxuICAgICAgICAgICAgICAgIGV4aXQ6ICQubm9vcCxcbiAgICAgICAgICAgICAgICBhY3RpdmF0ZTogJC5ub29wLFxuICAgICAgICAgICAgICAgIGRlYWN0aXZhdGU6ICQubm9vcCxcbiAgICAgICAgICAgICAgICBleGl0TWVudTogJC5ub29wXG4gICAgICAgICAgICB9LCBvcHRzKTtcblxuICAgICAgICB2YXIgTU9VU0VfTE9DU19UUkFDS0VEID0gMywgIC8vIG51bWJlciBvZiBwYXN0IG1vdXNlIGxvY2F0aW9ucyB0byB0cmFja1xuICAgICAgICAgICAgREVMQVkgPSAzMDA7ICAvLyBtcyBkZWxheSB3aGVuIHVzZXIgYXBwZWFycyB0byBiZSBlbnRlcmluZyBzdWJtZW51XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEtlZXAgdHJhY2sgb2YgdGhlIGxhc3QgZmV3IGxvY2F0aW9ucyBvZiB0aGUgbW91c2UuXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgbW91c2Vtb3ZlRG9jdW1lbnQgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgbW91c2VMb2NzLnB1c2goe3g6IGUucGFnZVgsIHk6IGUucGFnZVl9KTtcblxuICAgICAgICAgICAgICAgIGlmIChtb3VzZUxvY3MubGVuZ3RoID4gTU9VU0VfTE9DU19UUkFDS0VEKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vdXNlTG9jcy5zaGlmdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENhbmNlbCBwb3NzaWJsZSByb3cgYWN0aXZhdGlvbnMgd2hlbiBsZWF2aW5nIHRoZSBtZW51IGVudGlyZWx5XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgbW91c2VsZWF2ZU1lbnUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAodGltZW91dElkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIElmIGV4aXRNZW51IGlzIHN1cHBsaWVkIGFuZCByZXR1cm5zIHRydWUsIGRlYWN0aXZhdGUgdGhlXG4gICAgICAgICAgICAgICAgLy8gY3VycmVudGx5IGFjdGl2ZSByb3cgb24gbWVudSBleGl0LlxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmV4aXRNZW51KHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhY3RpdmVSb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuZGVhY3RpdmF0ZShhY3RpdmVSb3cpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlUm93ID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmlnZ2VyIGEgcG9zc2libGUgcm93IGFjdGl2YXRpb24gd2hlbmV2ZXIgZW50ZXJpbmcgYSBuZXcgcm93LlxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIG1vdXNlZW50ZXJSb3cgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAodGltZW91dElkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENhbmNlbCBhbnkgcHJldmlvdXMgYWN0aXZhdGlvbiBkZWxheXNcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5lbnRlcih0aGlzKTtcbiAgICAgICAgICAgICAgICBwb3NzaWJseUFjdGl2YXRlKHRoaXMpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1vdXNlbGVhdmVSb3cgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmV4aXQodGhpcyk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIC8qXG4gICAgICAgICAqIEltbWVkaWF0ZWx5IGFjdGl2YXRlIGEgcm93IGlmIHRoZSB1c2VyIGNsaWNrcyBvbiBpdC5cbiAgICAgICAgICovXG4gICAgICAgIHZhciBjbGlja1JvdyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGFjdGl2YXRlKHRoaXMpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQWN0aXZhdGUgYSBtZW51IHJvdy5cbiAgICAgICAgICovXG4gICAgICAgIHZhciBhY3RpdmF0ZSA9IGZ1bmN0aW9uKHJvdykge1xuICAgICAgICAgICAgICAgIGlmIChyb3cgPT0gYWN0aXZlUm93KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoYWN0aXZlUm93KSB7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuZGVhY3RpdmF0ZShhY3RpdmVSb3cpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG9wdGlvbnMuYWN0aXZhdGUocm93KTtcbiAgICAgICAgICAgICAgICBhY3RpdmVSb3cgPSByb3c7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQb3NzaWJseSBhY3RpdmF0ZSBhIG1lbnUgcm93LiBJZiBtb3VzZSBtb3ZlbWVudCBpbmRpY2F0ZXMgdGhhdCB3ZVxuICAgICAgICAgKiBzaG91bGRuJ3QgYWN0aXZhdGUgeWV0IGJlY2F1c2UgdXNlciBtYXkgYmUgdHJ5aW5nIHRvIGVudGVyXG4gICAgICAgICAqIGEgc3VibWVudSdzIGNvbnRlbnQsIHRoZW4gZGVsYXkgYW5kIGNoZWNrIGFnYWluIGxhdGVyLlxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHBvc3NpYmx5QWN0aXZhdGUgPSBmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGVsYXkgPSBhY3RpdmF0aW9uRGVsYXkoKTtcblxuICAgICAgICAgICAgICAgIGlmIChkZWxheSkge1xuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zc2libHlBY3RpdmF0ZShyb3cpO1xuICAgICAgICAgICAgICAgICAgICB9LCBkZWxheSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZhdGUocm93KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm4gdGhlIGFtb3VudCBvZiB0aW1lIHRoYXQgc2hvdWxkIGJlIHVzZWQgYXMgYSBkZWxheSBiZWZvcmUgdGhlXG4gICAgICAgICAqIGN1cnJlbnRseSBob3ZlcmVkIHJvdyBpcyBhY3RpdmF0ZWQuXG4gICAgICAgICAqXG4gICAgICAgICAqIFJldHVybnMgMCBpZiB0aGUgYWN0aXZhdGlvbiBzaG91bGQgaGFwcGVuIGltbWVkaWF0ZWx5LiBPdGhlcndpc2UsXG4gICAgICAgICAqIHJldHVybnMgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdGhhdCBzaG91bGQgYmUgZGVsYXllZCBiZWZvcmVcbiAgICAgICAgICogY2hlY2tpbmcgYWdhaW4gdG8gc2VlIGlmIHRoZSByb3cgc2hvdWxkIGJlIGFjdGl2YXRlZC5cbiAgICAgICAgICovXG4gICAgICAgIHZhciBhY3RpdmF0aW9uRGVsYXkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWFjdGl2ZVJvdyB8fCAhJChhY3RpdmVSb3cpLmlzKG9wdGlvbnMuc3VibWVudVNlbGVjdG9yKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBubyBvdGhlciBzdWJtZW51IHJvdyBhbHJlYWR5IGFjdGl2ZSwgdGhlblxuICAgICAgICAgICAgICAgICAgICAvLyBnbyBhaGVhZCBhbmQgYWN0aXZhdGUgaW1tZWRpYXRlbHkuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSAkbWVudS5vZmZzZXQoKSxcbiAgICAgICAgICAgICAgICAgICAgdXBwZXJMZWZ0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgeDogb2Zmc2V0LmxlZnQsXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiBvZmZzZXQudG9wIC0gb3B0aW9ucy50b2xlcmFuY2VcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdXBwZXJSaWdodCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IG9mZnNldC5sZWZ0ICsgJG1lbnUub3V0ZXJXaWR0aCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogdXBwZXJMZWZ0LnlcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgbG93ZXJMZWZ0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgeDogb2Zmc2V0LmxlZnQsXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiBvZmZzZXQudG9wICsgJG1lbnUub3V0ZXJIZWlnaHQoKSArIG9wdGlvbnMudG9sZXJhbmNlXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGxvd2VyUmlnaHQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBvZmZzZXQubGVmdCArICRtZW51Lm91dGVyV2lkdGgoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IGxvd2VyTGVmdC55XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGxvYyA9IG1vdXNlTG9jc1ttb3VzZUxvY3MubGVuZ3RoIC0gMV0sXG4gICAgICAgICAgICAgICAgICAgIHByZXZMb2MgPSBtb3VzZUxvY3NbMF07XG5cbiAgICAgICAgICAgICAgICBpZiAoIWxvYykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIXByZXZMb2MpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJldkxvYyA9IGxvYztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAocHJldkxvYy54IDwgb2Zmc2V0LmxlZnQgfHwgcHJldkxvYy54ID4gbG93ZXJSaWdodC54IHx8XG4gICAgICAgICAgICAgICAgICAgIHByZXZMb2MueSA8IG9mZnNldC50b3AgfHwgcHJldkxvYy55ID4gbG93ZXJSaWdodC55KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSBwcmV2aW91cyBtb3VzZSBsb2NhdGlvbiB3YXMgb3V0c2lkZSBvZiB0aGUgZW50aXJlXG4gICAgICAgICAgICAgICAgICAgIC8vIG1lbnUncyBib3VuZHMsIGltbWVkaWF0ZWx5IGFjdGl2YXRlLlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobGFzdERlbGF5TG9jICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2MueCA9PSBsYXN0RGVsYXlMb2MueCAmJiBsb2MueSA9PSBsYXN0RGVsYXlMb2MueSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgbW91c2UgaGFzbid0IG1vdmVkIHNpbmNlIHRoZSBsYXN0IHRpbWUgd2UgY2hlY2tlZFxuICAgICAgICAgICAgICAgICAgICAvLyBmb3IgYWN0aXZhdGlvbiBzdGF0dXMsIGltbWVkaWF0ZWx5IGFjdGl2YXRlLlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBEZXRlY3QgaWYgdGhlIHVzZXIgaXMgbW92aW5nIHRvd2FyZHMgdGhlIGN1cnJlbnRseSBhY3RpdmF0ZWRcbiAgICAgICAgICAgICAgICAvLyBzdWJtZW51LlxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIG1vdXNlIGlzIGhlYWRpbmcgcmVsYXRpdmVseSBjbGVhcmx5IHRvd2FyZHNcbiAgICAgICAgICAgICAgICAvLyB0aGUgc3VibWVudSdzIGNvbnRlbnQsIHdlIHNob3VsZCB3YWl0IGFuZCBnaXZlIHRoZSB1c2VyIG1vcmVcbiAgICAgICAgICAgICAgICAvLyB0aW1lIGJlZm9yZSBhY3RpdmF0aW5nIGEgbmV3IHJvdy4gSWYgdGhlIG1vdXNlIGlzIGhlYWRpbmdcbiAgICAgICAgICAgICAgICAvLyBlbHNld2hlcmUsIHdlIGNhbiBpbW1lZGlhdGVseSBhY3RpdmF0ZSBhIG5ldyByb3cuXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAvLyBXZSBkZXRlY3QgdGhpcyBieSBjYWxjdWxhdGluZyB0aGUgc2xvcGUgZm9ybWVkIGJldHdlZW4gdGhlXG4gICAgICAgICAgICAgICAgLy8gY3VycmVudCBtb3VzZSBsb2NhdGlvbiBhbmQgdGhlIHVwcGVyL2xvd2VyIHJpZ2h0IHBvaW50cyBvZlxuICAgICAgICAgICAgICAgIC8vIHRoZSBtZW51LiBXZSBkbyB0aGUgc2FtZSBmb3IgdGhlIHByZXZpb3VzIG1vdXNlIGxvY2F0aW9uLlxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBjdXJyZW50IG1vdXNlIGxvY2F0aW9uJ3Mgc2xvcGVzIGFyZVxuICAgICAgICAgICAgICAgIC8vIGluY3JlYXNpbmcvZGVjcmVhc2luZyBhcHByb3ByaWF0ZWx5IGNvbXBhcmVkIHRvIHRoZVxuICAgICAgICAgICAgICAgIC8vIHByZXZpb3VzJ3MsIHdlIGtub3cgdGhlIHVzZXIgaXMgbW92aW5nIHRvd2FyZCB0aGUgc3VibWVudS5cbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIC8vIE5vdGUgdGhhdCBzaW5jZSB0aGUgeS1heGlzIGluY3JlYXNlcyBhcyB0aGUgY3Vyc29yIG1vdmVzXG4gICAgICAgICAgICAgICAgLy8gZG93biB0aGUgc2NyZWVuLCB3ZSBhcmUgbG9va2luZyBmb3IgdGhlIHNsb3BlIGJldHdlZW4gdGhlXG4gICAgICAgICAgICAgICAgLy8gY3Vyc29yIGFuZCB0aGUgdXBwZXIgcmlnaHQgY29ybmVyIHRvIGRlY3JlYXNlIG92ZXIgdGltZSwgbm90XG4gICAgICAgICAgICAgICAgLy8gaW5jcmVhc2UgKHNvbWV3aGF0IGNvdW50ZXJpbnR1aXRpdmVseSkuXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc2xvcGUoYSwgYikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGIueSAtIGEueSkgLyAoYi54IC0gYS54KTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgdmFyIGRlY3JlYXNpbmdDb3JuZXIgPSB1cHBlclJpZ2h0LFxuICAgICAgICAgICAgICAgICAgICBpbmNyZWFzaW5nQ29ybmVyID0gbG93ZXJSaWdodDtcblxuICAgICAgICAgICAgICAgIC8vIE91ciBleHBlY3RhdGlvbnMgZm9yIGRlY3JlYXNpbmcgb3IgaW5jcmVhc2luZyBzbG9wZSB2YWx1ZXNcbiAgICAgICAgICAgICAgICAvLyBkZXBlbmRzIG9uIHdoaWNoIGRpcmVjdGlvbiB0aGUgc3VibWVudSBvcGVucyByZWxhdGl2ZSB0byB0aGVcbiAgICAgICAgICAgICAgICAvLyBtYWluIG1lbnUuIEJ5IGRlZmF1bHQsIGlmIHRoZSBtZW51IG9wZW5zIG9uIHRoZSByaWdodCwgd2VcbiAgICAgICAgICAgICAgICAvLyBleHBlY3QgdGhlIHNsb3BlIGJldHdlZW4gdGhlIGN1cnNvciBhbmQgdGhlIHVwcGVyIHJpZ2h0XG4gICAgICAgICAgICAgICAgLy8gY29ybmVyIHRvIGRlY3JlYXNlIG92ZXIgdGltZSwgYXMgZXhwbGFpbmVkIGFib3ZlLiBJZiB0aGVcbiAgICAgICAgICAgICAgICAvLyBzdWJtZW51IG9wZW5zIGluIGEgZGlmZmVyZW50IGRpcmVjdGlvbiwgd2UgY2hhbmdlIG91ciBzbG9wZVxuICAgICAgICAgICAgICAgIC8vIGV4cGVjdGF0aW9ucy5cbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5zdWJtZW51RGlyZWN0aW9uID09IFwibGVmdFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlY3JlYXNpbmdDb3JuZXIgPSBsb3dlckxlZnQ7XG4gICAgICAgICAgICAgICAgICAgIGluY3JlYXNpbmdDb3JuZXIgPSB1cHBlckxlZnQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLnN1Ym1lbnVEaXJlY3Rpb24gPT0gXCJiZWxvd1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlY3JlYXNpbmdDb3JuZXIgPSBsb3dlclJpZ2h0O1xuICAgICAgICAgICAgICAgICAgICBpbmNyZWFzaW5nQ29ybmVyID0gbG93ZXJMZWZ0O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5zdWJtZW51RGlyZWN0aW9uID09IFwiYWJvdmVcIikge1xuICAgICAgICAgICAgICAgICAgICBkZWNyZWFzaW5nQ29ybmVyID0gdXBwZXJMZWZ0O1xuICAgICAgICAgICAgICAgICAgICBpbmNyZWFzaW5nQ29ybmVyID0gdXBwZXJSaWdodDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgZGVjcmVhc2luZ1Nsb3BlID0gc2xvcGUobG9jLCBkZWNyZWFzaW5nQ29ybmVyKSxcbiAgICAgICAgICAgICAgICAgICAgaW5jcmVhc2luZ1Nsb3BlID0gc2xvcGUobG9jLCBpbmNyZWFzaW5nQ29ybmVyKSxcbiAgICAgICAgICAgICAgICAgICAgcHJldkRlY3JlYXNpbmdTbG9wZSA9IHNsb3BlKHByZXZMb2MsIGRlY3JlYXNpbmdDb3JuZXIpLFxuICAgICAgICAgICAgICAgICAgICBwcmV2SW5jcmVhc2luZ1Nsb3BlID0gc2xvcGUocHJldkxvYywgaW5jcmVhc2luZ0Nvcm5lcik7XG5cbiAgICAgICAgICAgICAgICBpZiAoZGVjcmVhc2luZ1Nsb3BlIDwgcHJldkRlY3JlYXNpbmdTbG9wZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jcmVhc2luZ1Nsb3BlID4gcHJldkluY3JlYXNpbmdTbG9wZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBNb3VzZSBpcyBtb3ZpbmcgZnJvbSBwcmV2aW91cyBsb2NhdGlvbiB0b3dhcmRzIHRoZVxuICAgICAgICAgICAgICAgICAgICAvLyBjdXJyZW50bHkgYWN0aXZhdGVkIHN1Ym1lbnUuIERlbGF5IGJlZm9yZSBhY3RpdmF0aW5nIGFcbiAgICAgICAgICAgICAgICAgICAgLy8gbmV3IG1lbnUgcm93LCBiZWNhdXNlIHVzZXIgbWF5IGJlIG1vdmluZyBpbnRvIHN1Ym1lbnUuXG4gICAgICAgICAgICAgICAgICAgIGxhc3REZWxheUxvYyA9IGxvYztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIERFTEFZO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxhc3REZWxheUxvYyA9IG51bGw7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBIb29rIHVwIGluaXRpYWwgbWVudSBldmVudHNcbiAgICAgICAgICovXG4gICAgICAgICRtZW51XG4gICAgICAgICAgICAubW91c2VsZWF2ZShtb3VzZWxlYXZlTWVudSlcbiAgICAgICAgICAgIC5maW5kKG9wdGlvbnMucm93U2VsZWN0b3IpXG4gICAgICAgICAgICAgICAgLm1vdXNlZW50ZXIobW91c2VlbnRlclJvdylcbiAgICAgICAgICAgICAgICAubW91c2VsZWF2ZShtb3VzZWxlYXZlUm93KVxuICAgICAgICAgICAgICAgIC5jbGljayhjbGlja1Jvdyk7XG5cbiAgICAgICAgJChkb2N1bWVudCkubW91c2Vtb3ZlKG1vdXNlbW92ZURvY3VtZW50KTtcblxuICAgIH07XG59KShqUXVlcnkpO1xuXG4iLCIvKipcbiAqIGNpcmNsZXMgLSB2MC4wLjYgLSAyMDE1LTExLTI3XG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE1IGx1Z29sYWJzXG4gKiBMaWNlbnNlZCBcbiAqL1xuIWZ1bmN0aW9uKGEsYil7XCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9YigpOlwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW10sYik6YS5DaXJjbGVzPWIoKX0odGhpcyxmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO3ZhciBhPXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHdpbmRvdy5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lfHx3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fGZ1bmN0aW9uKGEpe3NldFRpbWVvdXQoYSwxZTMvNjApfSxiPWZ1bmN0aW9uKGEpe3ZhciBiPWEuaWQ7aWYodGhpcy5fZWw9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYiksbnVsbCE9PXRoaXMuX2VsKXt0aGlzLl9yYWRpdXM9YS5yYWRpdXN8fDEwLHRoaXMuX2R1cmF0aW9uPXZvaWQgMD09PWEuZHVyYXRpb24/NTAwOmEuZHVyYXRpb24sdGhpcy5fdmFsdWU9MCx0aGlzLl9tYXhWYWx1ZT1hLm1heFZhbHVlfHwxMDAsdGhpcy5fdGV4dD12b2lkIDA9PT1hLnRleHQ/ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuaHRtbGlmeU51bWJlcihhKX06YS50ZXh0LHRoaXMuX3N0cm9rZVdpZHRoPWEud2lkdGh8fDEwLHRoaXMuX2NvbG9ycz1hLmNvbG9yc3x8W1wiI0VFRVwiLFwiI0YwMFwiXSx0aGlzLl9zdmc9bnVsbCx0aGlzLl9tb3ZpbmdQYXRoPW51bGwsdGhpcy5fd3JhcENvbnRhaW5lcj1udWxsLHRoaXMuX3RleHRDb250YWluZXI9bnVsbCx0aGlzLl93cnBDbGFzcz1hLndycENsYXNzfHxcImNpcmNsZXMtd3JwXCIsdGhpcy5fdGV4dENsYXNzPWEudGV4dENsYXNzfHxcImNpcmNsZXMtdGV4dFwiLHRoaXMuX3ZhbENsYXNzPWEudmFsdWVTdHJva2VDbGFzc3x8XCJjaXJjbGVzLXZhbHVlU3Ryb2tlXCIsdGhpcy5fbWF4VmFsQ2xhc3M9YS5tYXhWYWx1ZVN0cm9rZUNsYXNzfHxcImNpcmNsZXMtbWF4VmFsdWVTdHJva2VcIix0aGlzLl9zdHlsZVdyYXBwZXI9YS5zdHlsZVdyYXBwZXI9PT0hMT8hMTohMCx0aGlzLl9zdHlsZVRleHQ9YS5zdHlsZVRleHQ9PT0hMT8hMTohMDt2YXIgYz1NYXRoLlBJLzE4MCoyNzA7dGhpcy5fc3RhcnQ9LU1hdGguUEkvMTgwKjkwLHRoaXMuX3N0YXJ0UHJlY2lzZT10aGlzLl9wcmVjaXNlKHRoaXMuX3N0YXJ0KSx0aGlzLl9jaXJjPWMtdGhpcy5fc3RhcnQsdGhpcy5fZ2VuZXJhdGUoKS51cGRhdGUoYS52YWx1ZXx8MCl9fTtyZXR1cm4gYi5wcm90b3R5cGU9e1ZFUlNJT046XCIwLjAuNlwiLF9nZW5lcmF0ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9zdmdTaXplPTIqdGhpcy5fcmFkaXVzLHRoaXMuX3JhZGl1c0FkanVzdGVkPXRoaXMuX3JhZGl1cy10aGlzLl9zdHJva2VXaWR0aC8yLHRoaXMuX2dlbmVyYXRlU3ZnKCkuX2dlbmVyYXRlVGV4dCgpLl9nZW5lcmF0ZVdyYXBwZXIoKSx0aGlzLl9lbC5pbm5lckhUTUw9XCJcIix0aGlzLl9lbC5hcHBlbmRDaGlsZCh0aGlzLl93cmFwQ29udGFpbmVyKSx0aGlzfSxfc2V0UGVyY2VudGFnZTpmdW5jdGlvbihhKXt0aGlzLl9tb3ZpbmdQYXRoLnNldEF0dHJpYnV0ZShcImRcIix0aGlzLl9jYWxjdWxhdGVQYXRoKGEsITApKSx0aGlzLl90ZXh0Q29udGFpbmVyLmlubmVySFRNTD10aGlzLl9nZXRUZXh0KHRoaXMuZ2V0VmFsdWVGcm9tUGVyY2VudChhKSl9LF9nZW5lcmF0ZVdyYXBwZXI6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fd3JhcENvbnRhaW5lcj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLHRoaXMuX3dyYXBDb250YWluZXIuY2xhc3NOYW1lPXRoaXMuX3dycENsYXNzLHRoaXMuX3N0eWxlV3JhcHBlciYmKHRoaXMuX3dyYXBDb250YWluZXIuc3R5bGUucG9zaXRpb249XCJyZWxhdGl2ZVwiLHRoaXMuX3dyYXBDb250YWluZXIuc3R5bGUuZGlzcGxheT1cImlubGluZS1ibG9ja1wiKSx0aGlzLl93cmFwQ29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuX3N2ZyksdGhpcy5fd3JhcENvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl90ZXh0Q29udGFpbmVyKSx0aGlzfSxfZ2VuZXJhdGVUZXh0OmZ1bmN0aW9uKCl7aWYodGhpcy5fdGV4dENvbnRhaW5lcj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLHRoaXMuX3RleHRDb250YWluZXIuY2xhc3NOYW1lPXRoaXMuX3RleHRDbGFzcyx0aGlzLl9zdHlsZVRleHQpe3ZhciBhPXtwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOjAsbGVmdDowLHRleHRBbGlnbjpcImNlbnRlclwiLHdpZHRoOlwiMTAwJVwiLGZvbnRTaXplOi43KnRoaXMuX3JhZGl1cytcInB4XCIsaGVpZ2h0OnRoaXMuX3N2Z1NpemUrXCJweFwiLGxpbmVIZWlnaHQ6dGhpcy5fc3ZnU2l6ZStcInB4XCJ9O2Zvcih2YXIgYiBpbiBhKXRoaXMuX3RleHRDb250YWluZXIuc3R5bGVbYl09YVtiXX1yZXR1cm4gdGhpcy5fdGV4dENvbnRhaW5lci5pbm5lckhUTUw9dGhpcy5fZ2V0VGV4dCgwKSx0aGlzfSxfZ2V0VGV4dDpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5fdGV4dD8odm9pZCAwPT09YSYmKGE9dGhpcy5fdmFsdWUpLGE9cGFyc2VGbG9hdChhLnRvRml4ZWQoMikpLFwiZnVuY3Rpb25cIj09dHlwZW9mIHRoaXMuX3RleHQ/dGhpcy5fdGV4dC5jYWxsKHRoaXMsYSk6dGhpcy5fdGV4dCk6XCJcIn0sX2dlbmVyYXRlU3ZnOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3N2Zz1kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLFwic3ZnXCIpLHRoaXMuX3N2Zy5zZXRBdHRyaWJ1dGUoXCJ4bWxuc1wiLFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiksdGhpcy5fc3ZnLnNldEF0dHJpYnV0ZShcIndpZHRoXCIsdGhpcy5fc3ZnU2l6ZSksdGhpcy5fc3ZnLnNldEF0dHJpYnV0ZShcImhlaWdodFwiLHRoaXMuX3N2Z1NpemUpLHRoaXMuX2dlbmVyYXRlUGF0aCgxMDAsITEsdGhpcy5fY29sb3JzWzBdLHRoaXMuX21heFZhbENsYXNzKS5fZ2VuZXJhdGVQYXRoKDEsITAsdGhpcy5fY29sb3JzWzFdLHRoaXMuX3ZhbENsYXNzKSx0aGlzLl9tb3ZpbmdQYXRoPXRoaXMuX3N2Zy5nZXRFbGVtZW50c0J5VGFnTmFtZShcInBhdGhcIilbMV0sdGhpc30sX2dlbmVyYXRlUGF0aDpmdW5jdGlvbihhLGIsYyxkKXt2YXIgZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLFwicGF0aFwiKTtyZXR1cm4gZS5zZXRBdHRyaWJ1dGUoXCJmaWxsXCIsXCJ0cmFuc3BhcmVudFwiKSxlLnNldEF0dHJpYnV0ZShcInN0cm9rZVwiLGMpLGUuc2V0QXR0cmlidXRlKFwic3Ryb2tlLXdpZHRoXCIsdGhpcy5fc3Ryb2tlV2lkdGgpLGUuc2V0QXR0cmlidXRlKFwiZFwiLHRoaXMuX2NhbGN1bGF0ZVBhdGgoYSxiKSksZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLGQpLHRoaXMuX3N2Zy5hcHBlbmRDaGlsZChlKSx0aGlzfSxfY2FsY3VsYXRlUGF0aDpmdW5jdGlvbihhLGIpe3ZhciBjPXRoaXMuX3N0YXJ0K2EvMTAwKnRoaXMuX2NpcmMsZD10aGlzLl9wcmVjaXNlKGMpO3JldHVybiB0aGlzLl9hcmMoZCxiKX0sX2FyYzpmdW5jdGlvbihhLGIpe3ZhciBjPWEtLjAwMSxkPWEtdGhpcy5fc3RhcnRQcmVjaXNlPE1hdGguUEk/MDoxO3JldHVybltcIk1cIix0aGlzLl9yYWRpdXMrdGhpcy5fcmFkaXVzQWRqdXN0ZWQqTWF0aC5jb3ModGhpcy5fc3RhcnRQcmVjaXNlKSx0aGlzLl9yYWRpdXMrdGhpcy5fcmFkaXVzQWRqdXN0ZWQqTWF0aC5zaW4odGhpcy5fc3RhcnRQcmVjaXNlKSxcIkFcIix0aGlzLl9yYWRpdXNBZGp1c3RlZCx0aGlzLl9yYWRpdXNBZGp1c3RlZCwwLGQsMSx0aGlzLl9yYWRpdXMrdGhpcy5fcmFkaXVzQWRqdXN0ZWQqTWF0aC5jb3MoYyksdGhpcy5fcmFkaXVzK3RoaXMuX3JhZGl1c0FkanVzdGVkKk1hdGguc2luKGMpLGI/XCJcIjpcIlpcIl0uam9pbihcIiBcIil9LF9wcmVjaXNlOmZ1bmN0aW9uKGEpe3JldHVybiBNYXRoLnJvdW5kKDFlMyphKS8xZTN9LGh0bWxpZnlOdW1iZXI6ZnVuY3Rpb24oYSxiLGMpe2I9Ynx8XCJjaXJjbGVzLWludGVnZXJcIixjPWN8fFwiY2lyY2xlcy1kZWNpbWFsc1wiO3ZhciBkPShhK1wiXCIpLnNwbGl0KFwiLlwiKSxlPSc8c3BhbiBjbGFzcz1cIicrYisnXCI+JytkWzBdK1wiPC9zcGFuPlwiO3JldHVybiBkLmxlbmd0aD4xJiYoZSs9Jy48c3BhbiBjbGFzcz1cIicrYysnXCI+JytkWzFdLnN1YnN0cmluZygwLDIpK1wiPC9zcGFuPlwiKSxlfSx1cGRhdGVSYWRpdXM6ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuX3JhZGl1cz1hLHRoaXMuX2dlbmVyYXRlKCkudXBkYXRlKCEwKX0sdXBkYXRlV2lkdGg6ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuX3N0cm9rZVdpZHRoPWEsdGhpcy5fZ2VuZXJhdGUoKS51cGRhdGUoITApfSx1cGRhdGVDb2xvcnM6ZnVuY3Rpb24oYSl7dGhpcy5fY29sb3JzPWE7dmFyIGI9dGhpcy5fc3ZnLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwicGF0aFwiKTtyZXR1cm4gYlswXS5zZXRBdHRyaWJ1dGUoXCJzdHJva2VcIixhWzBdKSxiWzFdLnNldEF0dHJpYnV0ZShcInN0cm9rZVwiLGFbMV0pLHRoaXN9LGdldFBlcmNlbnQ6ZnVuY3Rpb24oKXtyZXR1cm4gMTAwKnRoaXMuX3ZhbHVlL3RoaXMuX21heFZhbHVlfSxnZXRWYWx1ZUZyb21QZXJjZW50OmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLl9tYXhWYWx1ZSphLzEwMH0sZ2V0VmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fdmFsdWV9LGdldE1heFZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX21heFZhbHVlfSx1cGRhdGU6ZnVuY3Rpb24oYixjKXtpZihiPT09ITApcmV0dXJuIHRoaXMuX3NldFBlcmNlbnRhZ2UodGhpcy5nZXRQZXJjZW50KCkpLHRoaXM7aWYodGhpcy5fdmFsdWU9PWJ8fGlzTmFOKGIpKXJldHVybiB0aGlzO3ZvaWQgMD09PWMmJihjPXRoaXMuX2R1cmF0aW9uKTt2YXIgZCxlLGYsZyxoPXRoaXMsaT1oLmdldFBlcmNlbnQoKSxqPTE7cmV0dXJuIHRoaXMuX3ZhbHVlPU1hdGgubWluKHRoaXMuX21heFZhbHVlLE1hdGgubWF4KDAsYikpLGM/KGQ9aC5nZXRQZXJjZW50KCksZT1kPmksais9ZCUxLGY9TWF0aC5mbG9vcihNYXRoLmFicyhkLWkpL2opLGc9Yy9mLGZ1bmN0aW9uIGsoYil7aWYoZT9pKz1qOmktPWosZSYmaT49ZHx8IWUmJmQ+PWkpcmV0dXJuIHZvaWQgYShmdW5jdGlvbigpe2guX3NldFBlcmNlbnRhZ2UoZCl9KTthKGZ1bmN0aW9uKCl7aC5fc2V0UGVyY2VudGFnZShpKX0pO3ZhciBjPURhdGUubm93KCksZj1jLWI7Zj49Zz9rKGMpOnNldFRpbWVvdXQoZnVuY3Rpb24oKXtrKERhdGUubm93KCkpfSxnLWYpfShEYXRlLm5vdygpKSx0aGlzKToodGhpcy5fc2V0UGVyY2VudGFnZSh0aGlzLmdldFBlcmNlbnQoKSksdGhpcyl9fSxiLmNyZWF0ZT1mdW5jdGlvbihhKXtyZXR1cm4gbmV3IGIoYSl9LGJ9KTsiLCJ2YXIgRGF0ZXBpY2tlcjtcblxuKGZ1bmN0aW9uICh3aW5kb3csICQsIHVuZGVmaW5lZCkge1xuICAgIHZhciBwbHVnaW5OYW1lID0gJ2RhdGVwaWNrZXInLFxuICAgICAgICBhdXRvSW5pdFNlbGVjdG9yID0gJy5kYXRlcGlja2VyLWhlcmUnLFxuICAgICAgICAkYm9keSwgJGRhdGVwaWNrZXJzQ29udGFpbmVyLFxuICAgICAgICBjb250YWluZXJCdWlsdCA9IGZhbHNlLFxuICAgICAgICBiYXNlVGVtcGxhdGUgPSAnJyArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXJcIj4nICtcbiAgICAgICAgICAgICc8bmF2IGNsYXNzPVwiZGF0ZXBpY2tlci0tbmF2XCI+PC9uYXY+JyArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLWNvbnRlbnRcIj48L2Rpdj4nICtcbiAgICAgICAgICAgICc8L2Rpdj4nLFxuICAgICAgICBkZWZhdWx0cyA9IHtcbiAgICAgICAgICAgIGNsYXNzZXM6ICcnLFxuICAgICAgICAgICAgaW5saW5lOiBmYWxzZSxcbiAgICAgICAgICAgIGxhbmd1YWdlOiAncnUnLFxuICAgICAgICAgICAgc3RhcnREYXRlOiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgZmlyc3REYXk6ICcnLFxuICAgICAgICAgICAgd2Vla2VuZHM6IFs2LCAwXSxcbiAgICAgICAgICAgIGRhdGVGb3JtYXQ6ICcnLFxuICAgICAgICAgICAgYWx0RmllbGQ6ICcnLFxuICAgICAgICAgICAgYWx0RmllbGREYXRlRm9ybWF0OiAnQCcsXG4gICAgICAgICAgICB0b2dnbGVTZWxlY3RlZDogdHJ1ZSxcbiAgICAgICAgICAgIGtleWJvYXJkTmF2OiB0cnVlLFxuXG4gICAgICAgICAgICBwb3NpdGlvbjogJ2JvdHRvbSBsZWZ0JyxcbiAgICAgICAgICAgIG9mZnNldDogMTIsXG5cbiAgICAgICAgICAgIHZpZXc6ICdkYXlzJyxcbiAgICAgICAgICAgIG1pblZpZXc6ICdkYXlzJyxcblxuICAgICAgICAgICAgc2hvd090aGVyTW9udGhzOiB0cnVlLFxuICAgICAgICAgICAgc2VsZWN0T3RoZXJNb250aHM6IHRydWUsXG4gICAgICAgICAgICBtb3ZlVG9PdGhlck1vbnRoc09uU2VsZWN0OiB0cnVlLFxuXG4gICAgICAgICAgICBzaG93T3RoZXJZZWFyczogdHJ1ZSxcbiAgICAgICAgICAgIHNlbGVjdE90aGVyWWVhcnM6IHRydWUsXG4gICAgICAgICAgICBtb3ZlVG9PdGhlclllYXJzT25TZWxlY3Q6IHRydWUsXG5cbiAgICAgICAgICAgIG1pbkRhdGU6ICcnLFxuICAgICAgICAgICAgbWF4RGF0ZTogJycsXG4gICAgICAgICAgICBkaXNhYmxlTmF2V2hlbk91dE9mUmFuZ2U6IHRydWUsXG5cbiAgICAgICAgICAgIG11bHRpcGxlRGF0ZXM6IGZhbHNlLCAvLyBCb29sZWFuIG9yIE51bWJlclxuICAgICAgICAgICAgbXVsdGlwbGVEYXRlc1NlcGFyYXRvcjogJywnLFxuICAgICAgICAgICAgcmFuZ2U6IGZhbHNlLFxuXG4gICAgICAgICAgICB0b2RheUJ1dHRvbjogZmFsc2UsXG4gICAgICAgICAgICBjbGVhckJ1dHRvbjogZmFsc2UsXG5cbiAgICAgICAgICAgIHNob3dFdmVudDogJ2ZvY3VzJyxcbiAgICAgICAgICAgIGF1dG9DbG9zZTogZmFsc2UsXG5cbiAgICAgICAgICAgIC8vIG5hdmlnYXRpb25cbiAgICAgICAgICAgIG1vbnRoc0ZpZWxkOiAnbW9udGhzU2hvcnQnLFxuICAgICAgICAgICAgcHJldkh0bWw6ICc8c3ZnPjxwYXRoIGQ9XCJNIDE3LDEyIGwgLTUsNSBsIDUsNVwiPjwvcGF0aD48L3N2Zz4nLFxuICAgICAgICAgICAgbmV4dEh0bWw6ICc8c3ZnPjxwYXRoIGQ9XCJNIDE0LDEyIGwgNSw1IGwgLTUsNVwiPjwvcGF0aD48L3N2Zz4nLFxuICAgICAgICAgICAgbmF2VGl0bGVzOiB7XG4gICAgICAgICAgICAgICAgZGF5czogJ01NLCA8aT55eXl5PC9pPicsXG4gICAgICAgICAgICAgICAgbW9udGhzOiAneXl5eScsXG4gICAgICAgICAgICAgICAgeWVhcnM6ICd5eXl5MSAtIHl5eXkyJ1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy8gZXZlbnRzXG4gICAgICAgICAgICBvblNlbGVjdDogJycsXG4gICAgICAgICAgICBvbkNoYW5nZU1vbnRoOiAnJyxcbiAgICAgICAgICAgIG9uQ2hhbmdlWWVhcjogJycsXG4gICAgICAgICAgICBvbkNoYW5nZURlY2FkZTogJycsXG4gICAgICAgICAgICBvbkNoYW5nZVZpZXc6ICcnLFxuICAgICAgICAgICAgb25SZW5kZXJDZWxsOiAnJ1xuICAgICAgICB9LFxuICAgICAgICBob3RLZXlzID0ge1xuICAgICAgICAgICAgJ2N0cmxSaWdodCc6IFsxNywgMzldLFxuICAgICAgICAgICAgJ2N0cmxVcCc6IFsxNywgMzhdLFxuICAgICAgICAgICAgJ2N0cmxMZWZ0JzogWzE3LCAzN10sXG4gICAgICAgICAgICAnY3RybERvd24nOiBbMTcsIDQwXSxcbiAgICAgICAgICAgICdzaGlmdFJpZ2h0JzogWzE2LCAzOV0sXG4gICAgICAgICAgICAnc2hpZnRVcCc6IFsxNiwgMzhdLFxuICAgICAgICAgICAgJ3NoaWZ0TGVmdCc6IFsxNiwgMzddLFxuICAgICAgICAgICAgJ3NoaWZ0RG93bic6IFsxNiwgNDBdLFxuICAgICAgICAgICAgJ2FsdFVwJzogWzE4LCAzOF0sXG4gICAgICAgICAgICAnYWx0UmlnaHQnOiBbMTgsIDM5XSxcbiAgICAgICAgICAgICdhbHRMZWZ0JzogWzE4LCAzN10sXG4gICAgICAgICAgICAnYWx0RG93bic6IFsxOCwgNDBdLFxuICAgICAgICAgICAgJ2N0cmxTaGlmdFVwJzogWzE2LCAxNywgMzhdXG4gICAgICAgIH0sXG4gICAgICAgIGRhdGVwaWNrZXI7XG5cbiAgICBEYXRlcGlja2VyICA9IGZ1bmN0aW9uIChlbCwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLmVsID0gZWw7XG4gICAgICAgIHRoaXMuJGVsID0gJChlbCk7XG5cbiAgICAgICAgdGhpcy5vcHRzID0gJC5leHRlbmQodHJ1ZSwge30sIGRlZmF1bHRzLCBvcHRpb25zLCB0aGlzLiRlbC5kYXRhKCkpO1xuXG4gICAgICAgIGlmICgkYm9keSA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICRib2R5ID0gJCgnYm9keScpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLm9wdHMuc3RhcnREYXRlKSB7XG4gICAgICAgICAgICB0aGlzLm9wdHMuc3RhcnREYXRlID0gbmV3IERhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmVsLm5vZGVOYW1lID09ICdJTlBVVCcpIHtcbiAgICAgICAgICAgIHRoaXMuZWxJc0lucHV0ID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdHMuYWx0RmllbGQpIHtcbiAgICAgICAgICAgIHRoaXMuJGFsdEZpZWxkID0gdHlwZW9mIHRoaXMub3B0cy5hbHRGaWVsZCA9PSAnc3RyaW5nJyA/ICQodGhpcy5vcHRzLmFsdEZpZWxkKSA6IHRoaXMub3B0cy5hbHRGaWVsZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaW5pdGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNpbGVudCA9IGZhbHNlOyAvLyBOZWVkIHRvIHByZXZlbnQgdW5uZWNlc3NhcnkgcmVuZGVyaW5nXG5cbiAgICAgICAgdGhpcy5jdXJyZW50RGF0ZSA9IHRoaXMub3B0cy5zdGFydERhdGU7XG4gICAgICAgIHRoaXMuY3VycmVudFZpZXcgPSB0aGlzLm9wdHMudmlldztcbiAgICAgICAgdGhpcy5fY3JlYXRlU2hvcnRDdXRzKCk7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlcyA9IFtdO1xuICAgICAgICB0aGlzLnZpZXdzID0ge307XG4gICAgICAgIHRoaXMua2V5cyA9IFtdO1xuICAgICAgICB0aGlzLm1pblJhbmdlID0gJyc7XG4gICAgICAgIHRoaXMubWF4UmFuZ2UgPSAnJztcblxuICAgICAgICB0aGlzLmluaXQoKVxuICAgIH07XG5cbiAgICBkYXRlcGlja2VyID0gRGF0ZXBpY2tlcjtcblxuICAgIGRhdGVwaWNrZXIucHJvdG90eXBlID0ge1xuICAgICAgICB2aWV3SW5kZXhlczogWydkYXlzJywgJ21vbnRocycsICd5ZWFycyddLFxuXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghY29udGFpbmVyQnVpbHQgJiYgIXRoaXMub3B0cy5pbmxpbmUgJiYgdGhpcy5lbElzSW5wdXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9idWlsZERhdGVwaWNrZXJzQ29udGFpbmVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9idWlsZEJhc2VIdG1sKCk7XG4gICAgICAgICAgICB0aGlzLl9kZWZpbmVMb2NhbGUodGhpcy5vcHRzLmxhbmd1YWdlKTtcbiAgICAgICAgICAgIHRoaXMuX3N5bmNXaXRoTWluTWF4RGF0ZXMoKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuZWxJc0lucHV0KSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm9wdHMuaW5saW5lKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNldCBleHRyYSBjbGFzc2VzIGZvciBwcm9wZXIgdHJhbnNpdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0UG9zaXRpb25DbGFzc2VzKHRoaXMub3B0cy5wb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2JpbmRFdmVudHMoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRzLmtleWJvYXJkTmF2KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2JpbmRLZXlib2FyZEV2ZW50cygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyLm9uKCdtb3VzZWRvd24nLCB0aGlzLl9vbk1vdXNlRG93bkRhdGVwaWNrZXIuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlci5vbignbW91c2V1cCcsIHRoaXMuX29uTW91c2VVcERhdGVwaWNrZXIuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMuY2xhc3Nlcykge1xuICAgICAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXIuYWRkQ2xhc3ModGhpcy5vcHRzLmNsYXNzZXMpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMudmlld3NbdGhpcy5jdXJyZW50Vmlld10gPSBuZXcgRGF0ZXBpY2tlci5Cb2R5KHRoaXMsIHRoaXMuY3VycmVudFZpZXcsIHRoaXMub3B0cyk7XG4gICAgICAgICAgICB0aGlzLnZpZXdzW3RoaXMuY3VycmVudFZpZXddLnNob3coKTtcbiAgICAgICAgICAgIHRoaXMubmF2ID0gbmV3IERhdGVwaWNrZXIuTmF2aWdhdGlvbih0aGlzLCB0aGlzLm9wdHMpO1xuICAgICAgICAgICAgdGhpcy52aWV3ID0gdGhpcy5jdXJyZW50VmlldztcblxuICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlci5vbignbW91c2VlbnRlcicsICcuZGF0ZXBpY2tlci0tY2VsbCcsIHRoaXMuX29uTW91c2VFbnRlckNlbGwuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyLm9uKCdtb3VzZWxlYXZlJywgJy5kYXRlcGlja2VyLS1jZWxsJywgdGhpcy5fb25Nb3VzZUxlYXZlQ2VsbC5iaW5kKHRoaXMpKTtcblxuICAgICAgICAgICAgdGhpcy5pbml0ZWQgPSB0cnVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9jcmVhdGVTaG9ydEN1dHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMubWluRGF0ZSA9IHRoaXMub3B0cy5taW5EYXRlID8gdGhpcy5vcHRzLm1pbkRhdGUgOiBuZXcgRGF0ZSgtODYzOTk5OTkxMzYwMDAwMCk7XG4gICAgICAgICAgICB0aGlzLm1heERhdGUgPSB0aGlzLm9wdHMubWF4RGF0ZSA/IHRoaXMub3B0cy5tYXhEYXRlIDogbmV3IERhdGUoODYzOTk5OTkxMzYwMDAwMCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2JpbmRFdmVudHMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5vbih0aGlzLm9wdHMuc2hvd0V2ZW50ICsgJy5hZHAnLCB0aGlzLl9vblNob3dFdmVudC5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHRoaXMuJGVsLm9uKCdibHVyLmFkcCcsIHRoaXMuX29uQmx1ci5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHRoaXMuJGVsLm9uKCdpbnB1dC5hZHAnLCB0aGlzLl9vbklucHV0LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuYWRwJywgdGhpcy5fb25SZXNpemUuYmluZCh0aGlzKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2JpbmRLZXlib2FyZEV2ZW50czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwub24oJ2tleWRvd24uYWRwJywgdGhpcy5fb25LZXlEb3duLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgdGhpcy4kZWwub24oJ2tleXVwLmFkcCcsIHRoaXMuX29uS2V5VXAuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB0aGlzLiRlbC5vbignaG90S2V5LmFkcCcsIHRoaXMuX29uSG90S2V5LmJpbmQodGhpcykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzV2Vla2VuZDogZnVuY3Rpb24gKGRheSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0cy53ZWVrZW5kcy5pbmRleE9mKGRheSkgIT09IC0xO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9kZWZpbmVMb2NhbGU6IGZ1bmN0aW9uIChsYW5nKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGxhbmcgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYyA9IERhdGVwaWNrZXIubGFuZ3VhZ2VbbGFuZ107XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmxvYykge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0NhblxcJ3QgZmluZCBsYW5ndWFnZSBcIicgKyBsYW5nICsgJ1wiIGluIERhdGVwaWNrZXIubGFuZ3VhZ2UsIHdpbGwgdXNlIFwicnVcIiBpbnN0ZWFkJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9jID0gJC5leHRlbmQodHJ1ZSwge30sIERhdGVwaWNrZXIubGFuZ3VhZ2UucnUpXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5sb2MgPSAkLmV4dGVuZCh0cnVlLCB7fSwgRGF0ZXBpY2tlci5sYW5ndWFnZS5ydSwgRGF0ZXBpY2tlci5sYW5ndWFnZVtsYW5nXSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2MgPSAkLmV4dGVuZCh0cnVlLCB7fSwgRGF0ZXBpY2tlci5sYW5ndWFnZS5ydSwgbGFuZylcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5kYXRlRm9ybWF0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2MuZGF0ZUZvcm1hdCA9IHRoaXMub3B0cy5kYXRlRm9ybWF0XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMuZmlyc3REYXkgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2MuZmlyc3REYXkgPSB0aGlzLm9wdHMuZmlyc3REYXlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfYnVpbGREYXRlcGlja2Vyc0NvbnRhaW5lcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29udGFpbmVyQnVpbHQgPSB0cnVlO1xuICAgICAgICAgICAgJGJvZHkuYXBwZW5kKCc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlcnMtY29udGFpbmVyXCIgaWQ9XCJkYXRlcGlja2Vycy1jb250YWluZXJcIj48L2Rpdj4nKTtcbiAgICAgICAgICAgICRkYXRlcGlja2Vyc0NvbnRhaW5lciA9ICQoJyNkYXRlcGlja2Vycy1jb250YWluZXInKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfYnVpbGRCYXNlSHRtbDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyICRhcHBlbmRUYXJnZXQsXG4gICAgICAgICAgICAgICAgJGlubGluZSA9ICQoJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLWlubGluZVwiPicpO1xuXG4gICAgICAgICAgICBpZih0aGlzLmVsLm5vZGVOYW1lID09ICdJTlBVVCcpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMub3B0cy5pbmxpbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgJGFwcGVuZFRhcmdldCA9ICRkYXRlcGlja2Vyc0NvbnRhaW5lcjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkYXBwZW5kVGFyZ2V0ID0gJGlubGluZS5pbnNlcnRBZnRlcih0aGlzLiRlbClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRhcHBlbmRUYXJnZXQgPSAkaW5saW5lLmFwcGVuZFRvKHRoaXMuJGVsKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyID0gJChiYXNlVGVtcGxhdGUpLmFwcGVuZFRvKCRhcHBlbmRUYXJnZXQpO1xuICAgICAgICAgICAgdGhpcy4kY29udGVudCA9ICQoJy5kYXRlcGlja2VyLS1jb250ZW50JywgdGhpcy4kZGF0ZXBpY2tlcik7XG4gICAgICAgICAgICB0aGlzLiRuYXYgPSAkKCcuZGF0ZXBpY2tlci0tbmF2JywgdGhpcy4kZGF0ZXBpY2tlcik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3RyaWdnZXJPbkNoYW5nZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnNlbGVjdGVkRGF0ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0cy5vblNlbGVjdCgnJywgJycsIHRoaXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWREYXRlcyA9IHRoaXMuc2VsZWN0ZWREYXRlcyxcbiAgICAgICAgICAgICAgICBwYXJzZWRTZWxlY3RlZCA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZShzZWxlY3RlZERhdGVzWzBdKSxcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWREYXRlcyxcbiAgICAgICAgICAgICAgICBfdGhpcyA9IHRoaXMsXG4gICAgICAgICAgICAgICAgZGF0ZXMgPSBuZXcgRGF0ZShwYXJzZWRTZWxlY3RlZC55ZWFyLCBwYXJzZWRTZWxlY3RlZC5tb250aCwgcGFyc2VkU2VsZWN0ZWQuZGF0ZSk7XG5cbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWREYXRlcyA9IHNlbGVjdGVkRGF0ZXMubWFwKGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5mb3JtYXREYXRlKF90aGlzLmxvYy5kYXRlRm9ybWF0LCBkYXRlKVxuICAgICAgICAgICAgICAgIH0pLmpvaW4odGhpcy5vcHRzLm11bHRpcGxlRGF0ZXNTZXBhcmF0b3IpO1xuXG4gICAgICAgICAgICAvLyBDcmVhdGUgbmV3IGRhdGVzIGFycmF5LCB0byBzZXBhcmF0ZSBpdCBmcm9tIG9yaWdpbmFsIHNlbGVjdGVkRGF0ZXNcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMubXVsdGlwbGVEYXRlcyB8fCB0aGlzLm9wdHMucmFuZ2UpIHtcbiAgICAgICAgICAgICAgICBkYXRlcyA9IHNlbGVjdGVkRGF0ZXMubWFwKGZ1bmN0aW9uKGRhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcnNlZERhdGUgPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUoZGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZShwYXJzZWREYXRlLnllYXIsIHBhcnNlZERhdGUubW9udGgsIHBhcnNlZERhdGUuZGF0ZSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm9wdHMub25TZWxlY3QoZm9ybWF0dGVkRGF0ZXMsIGRhdGVzLCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZCA9IHRoaXMucGFyc2VkRGF0ZSxcbiAgICAgICAgICAgICAgICBvID0gdGhpcy5vcHRzO1xuICAgICAgICAgICAgc3dpdGNoICh0aGlzLnZpZXcpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdkYXlzJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoZC55ZWFyLCBkLm1vbnRoICsgMSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvLm9uQ2hhbmdlTW9udGgpIG8ub25DaGFuZ2VNb250aCh0aGlzLnBhcnNlZERhdGUubW9udGgsIHRoaXMucGFyc2VkRGF0ZS55ZWFyKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnbW9udGhzJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoZC55ZWFyICsgMSwgZC5tb250aCwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvLm9uQ2hhbmdlWWVhcikgby5vbkNoYW5nZVllYXIodGhpcy5wYXJzZWREYXRlLnllYXIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICd5ZWFycyc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKGQueWVhciArIDEwLCAwLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG8ub25DaGFuZ2VEZWNhZGUpIG8ub25DaGFuZ2VEZWNhZGUodGhpcy5jdXJEZWNhZGUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBwcmV2OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZCA9IHRoaXMucGFyc2VkRGF0ZSxcbiAgICAgICAgICAgICAgICBvID0gdGhpcy5vcHRzO1xuICAgICAgICAgICAgc3dpdGNoICh0aGlzLnZpZXcpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdkYXlzJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoZC55ZWFyLCBkLm1vbnRoIC0gMSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvLm9uQ2hhbmdlTW9udGgpIG8ub25DaGFuZ2VNb250aCh0aGlzLnBhcnNlZERhdGUubW9udGgsIHRoaXMucGFyc2VkRGF0ZS55ZWFyKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnbW9udGhzJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoZC55ZWFyIC0gMSwgZC5tb250aCwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvLm9uQ2hhbmdlWWVhcikgby5vbkNoYW5nZVllYXIodGhpcy5wYXJzZWREYXRlLnllYXIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICd5ZWFycyc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKGQueWVhciAtIDEwLCAwLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG8ub25DaGFuZ2VEZWNhZGUpIG8ub25DaGFuZ2VEZWNhZGUodGhpcy5jdXJEZWNhZGUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBmb3JtYXREYXRlOiBmdW5jdGlvbiAoc3RyaW5nLCBkYXRlKSB7XG4gICAgICAgICAgICBkYXRlID0gZGF0ZSB8fCB0aGlzLmRhdGU7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gc3RyaW5nLFxuICAgICAgICAgICAgICAgIGJvdW5kYXJ5ID0gdGhpcy5fZ2V0V29yZEJvdW5kYXJ5UmVnRXhwLFxuICAgICAgICAgICAgICAgIGxvY2FsZSA9IHRoaXMubG9jLFxuICAgICAgICAgICAgICAgIGRlY2FkZSA9IGRhdGVwaWNrZXIuZ2V0RGVjYWRlKGRhdGUpLFxuICAgICAgICAgICAgICAgIGQgPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUoZGF0ZSk7XG5cbiAgICAgICAgICAgIHN3aXRjaCAodHJ1ZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgL0AvLnRlc3QocmVzdWx0KTpcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoL0AvLCBkYXRlLmdldFRpbWUoKSk7XG4gICAgICAgICAgICAgICAgY2FzZSAvZGQvLnRlc3QocmVzdWx0KTpcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ2RkJyksIGQuZnVsbERhdGUpO1xuICAgICAgICAgICAgICAgIGNhc2UgL2QvLnRlc3QocmVzdWx0KTpcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ2QnKSwgZC5kYXRlKTtcbiAgICAgICAgICAgICAgICBjYXNlIC9ERC8udGVzdChyZXN1bHQpOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgnREQnKSwgbG9jYWxlLmRheXNbZC5kYXldKTtcbiAgICAgICAgICAgICAgICBjYXNlIC9ELy50ZXN0KHJlc3VsdCk6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCdEJyksIGxvY2FsZS5kYXlzU2hvcnRbZC5kYXldKTtcbiAgICAgICAgICAgICAgICBjYXNlIC9tbS8udGVzdChyZXN1bHQpOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgnbW0nKSwgZC5mdWxsTW9udGgpO1xuICAgICAgICAgICAgICAgIGNhc2UgL20vLnRlc3QocmVzdWx0KTpcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ20nKSwgZC5tb250aCArIDEpO1xuICAgICAgICAgICAgICAgIGNhc2UgL01NLy50ZXN0KHJlc3VsdCk6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCdNTScpLCB0aGlzLmxvYy5tb250aHNbZC5tb250aF0pO1xuICAgICAgICAgICAgICAgIGNhc2UgL00vLnRlc3QocmVzdWx0KTpcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ00nKSwgbG9jYWxlLm1vbnRoc1Nob3J0W2QubW9udGhdKTtcbiAgICAgICAgICAgICAgICBjYXNlIC95eXl5Ly50ZXN0KHJlc3VsdCk6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCd5eXl5JyksIGQueWVhcik7XG4gICAgICAgICAgICAgICAgY2FzZSAveXl5eTEvLnRlc3QocmVzdWx0KTpcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ3l5eXkxJyksIGRlY2FkZVswXSk7XG4gICAgICAgICAgICAgICAgY2FzZSAveXl5eTIvLnRlc3QocmVzdWx0KTpcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ3l5eXkyJyksIGRlY2FkZVsxXSk7XG4gICAgICAgICAgICAgICAgY2FzZSAveXkvLnRlc3QocmVzdWx0KTpcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ3l5JyksIGQueWVhci50b1N0cmluZygpLnNsaWNlKC0yKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldFdvcmRCb3VuZGFyeVJlZ0V4cDogZnVuY3Rpb24gKHNpZ24pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUmVnRXhwKCdcXFxcYig/PVthLXpBLVowLTnDpMO2w7zDn8OEw5bDnDxdKScgKyBzaWduICsgJyg/IVs+YS16QS1aMC05w6TDtsO8w5/DhMOWw5xdKScpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlbGVjdERhdGU6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdHMgPSBfdGhpcy5vcHRzLFxuICAgICAgICAgICAgICAgIGQgPSBfdGhpcy5wYXJzZWREYXRlLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkRGF0ZXMgPSBfdGhpcy5zZWxlY3RlZERhdGVzLFxuICAgICAgICAgICAgICAgIGxlbiA9IHNlbGVjdGVkRGF0ZXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIG5ld0RhdGUgPSAnJztcblxuICAgICAgICAgICAgaWYgKCEoZGF0ZSBpbnN0YW5jZW9mIERhdGUpKSByZXR1cm47XG5cbiAgICAgICAgICAgIGlmIChfdGhpcy52aWV3ID09ICdkYXlzJykge1xuICAgICAgICAgICAgICAgIGlmIChkYXRlLmdldE1vbnRoKCkgIT0gZC5tb250aCAmJiBvcHRzLm1vdmVUb090aGVyTW9udGhzT25TZWxlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3RGF0ZSA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChfdGhpcy52aWV3ID09ICd5ZWFycycpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZS5nZXRGdWxsWWVhcigpICE9IGQueWVhciAmJiBvcHRzLm1vdmVUb090aGVyWWVhcnNPblNlbGVjdCkge1xuICAgICAgICAgICAgICAgICAgICBuZXdEYXRlID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCAwLCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChuZXdEYXRlKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuc2lsZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBfdGhpcy5kYXRlID0gbmV3RGF0ZTtcbiAgICAgICAgICAgICAgICBfdGhpcy5zaWxlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBfdGhpcy5uYXYuX3JlbmRlcigpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcHRzLm11bHRpcGxlRGF0ZXMgJiYgIW9wdHMucmFuZ2UpIHsgLy8gU2V0IHByaW9yaXR5IHRvIHJhbmdlIGZ1bmN0aW9uYWxpdHlcbiAgICAgICAgICAgICAgICBpZiAobGVuID09PSBvcHRzLm11bHRpcGxlRGF0ZXMpIHJldHVybjtcbiAgICAgICAgICAgICAgICBpZiAoIV90aGlzLl9pc1NlbGVjdGVkKGRhdGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnNlbGVjdGVkRGF0ZXMucHVzaChkYXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9wdHMucmFuZ2UpIHtcbiAgICAgICAgICAgICAgICBpZiAobGVuID09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2VsZWN0ZWREYXRlcyA9IFtkYXRlXTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMubWluUmFuZ2UgPSBkYXRlO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5tYXhSYW5nZSA9ICcnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobGVuID09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2VsZWN0ZWREYXRlcy5wdXNoKGRhdGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIV90aGlzLm1heFJhbmdlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLm1heFJhbmdlID0gZGF0ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLm1pblJhbmdlID0gZGF0ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZWxlY3RlZERhdGVzID0gW190aGlzLm1pblJhbmdlLCBfdGhpcy5tYXhSYW5nZV1cblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnNlbGVjdGVkRGF0ZXMgPSBbZGF0ZV07XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLm1pblJhbmdlID0gZGF0ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF90aGlzLnNlbGVjdGVkRGF0ZXMgPSBbZGF0ZV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF90aGlzLl9zZXRJbnB1dFZhbHVlKCk7XG5cbiAgICAgICAgICAgIGlmIChvcHRzLm9uU2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuX3RyaWdnZXJPbkNoYW5nZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob3B0cy5hdXRvQ2xvc2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoIW9wdHMubXVsdGlwbGVEYXRlcyAmJiAhb3B0cy5yYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRzLnJhbmdlICYmIF90aGlzLnNlbGVjdGVkRGF0ZXMubGVuZ3RoID09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgX3RoaXMudmlld3NbdGhpcy5jdXJyZW50Vmlld10uX3JlbmRlcigpXG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlRGF0ZTogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgICAgIHZhciBzZWxlY3RlZCA9IHRoaXMuc2VsZWN0ZWREYXRlcyxcbiAgICAgICAgICAgICAgICBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmICghKGRhdGUgaW5zdGFuY2VvZiBEYXRlKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0ZWQuc29tZShmdW5jdGlvbiAoY3VyRGF0ZSwgaSkge1xuICAgICAgICAgICAgICAgIGlmIChkYXRlcGlja2VyLmlzU2FtZShjdXJEYXRlLCBkYXRlKSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZC5zcGxpY2UoaSwgMSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFfdGhpcy5zZWxlY3RlZERhdGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMubWluUmFuZ2UgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLm1heFJhbmdlID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBfdGhpcy52aWV3c1tfdGhpcy5jdXJyZW50Vmlld10uX3JlbmRlcigpO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5fc2V0SW5wdXRWYWx1ZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChfdGhpcy5vcHRzLm9uU2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5fdHJpZ2dlck9uQ2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9kYXk6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMudmlldyA9IHRoaXMub3B0cy5taW5WaWV3O1xuICAgICAgICAgICAgdGhpcy5zaWxlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2xlYXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5taW5SYW5nZSA9ICcnO1xuICAgICAgICAgICAgdGhpcy5tYXhSYW5nZSA9ICcnO1xuICAgICAgICAgICAgdGhpcy52aWV3c1t0aGlzLmN1cnJlbnRWaWV3XS5fcmVuZGVyKCk7XG4gICAgICAgICAgICB0aGlzLl9zZXRJbnB1dFZhbHVlKCk7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLm9uU2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdHJpZ2dlck9uQ2hhbmdlKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogVXBkYXRlcyBkYXRlcGlja2VyIG9wdGlvbnNcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBwYXJhbSAtIHBhcmFtZXRlcidzIG5hbWUgdG8gdXBkYXRlLiBJZiBvYmplY3QgdGhlbiBpdCB3aWxsIGV4dGVuZCBjdXJyZW50IG9wdGlvbnNcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd8TnVtYmVyfE9iamVjdH0gW3ZhbHVlXSAtIG5ldyBwYXJhbSB2YWx1ZVxuICAgICAgICAgKi9cbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiAocGFyYW0sIHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgICAgIGlmIChsZW4gPT0gMikge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0c1twYXJhbV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGVuID09IDEgJiYgdHlwZW9mIHBhcmFtID09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRzID0gJC5leHRlbmQodHJ1ZSwgdGhpcy5vcHRzLCBwYXJhbSlcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fY3JlYXRlU2hvcnRDdXRzKCk7XG4gICAgICAgICAgICB0aGlzLl9zeW5jV2l0aE1pbk1heERhdGVzKCk7XG4gICAgICAgICAgICB0aGlzLl9kZWZpbmVMb2NhbGUodGhpcy5vcHRzLmxhbmd1YWdlKTtcbiAgICAgICAgICAgIHRoaXMubmF2Ll9hZGRCdXR0b25zSWZOZWVkKCk7XG4gICAgICAgICAgICB0aGlzLm5hdi5fcmVuZGVyKCk7XG4gICAgICAgICAgICB0aGlzLnZpZXdzW3RoaXMuY3VycmVudFZpZXddLl9yZW5kZXIoKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuZWxJc0lucHV0ICYmICF0aGlzLm9wdHMuaW5saW5lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0UG9zaXRpb25DbGFzc2VzKHRoaXMub3B0cy5wb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFBvc2l0aW9uKHRoaXMub3B0cy5wb3NpdGlvbilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMuY2xhc3Nlcykge1xuICAgICAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXIuYWRkQ2xhc3ModGhpcy5vcHRzLmNsYXNzZXMpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9zeW5jV2l0aE1pbk1heERhdGVzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgY3VyVGltZSA9IHRoaXMuZGF0ZS5nZXRUaW1lKCk7XG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IHRydWU7XG4gICAgICAgICAgICBpZiAodGhpcy5taW5UaW1lID4gY3VyVGltZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHRoaXMubWluRGF0ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMubWF4VGltZSA8IGN1clRpbWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSB0aGlzLm1heERhdGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9pc1NlbGVjdGVkOiBmdW5jdGlvbiAoY2hlY2tEYXRlLCBjZWxsVHlwZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWREYXRlcy5zb21lKGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGVwaWNrZXIuaXNTYW1lKGRhdGUsIGNoZWNrRGF0ZSwgY2VsbFR5cGUpXG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIF9zZXRJbnB1dFZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdHMgPSBfdGhpcy5vcHRzLFxuICAgICAgICAgICAgICAgIGZvcm1hdCA9IF90aGlzLmxvYy5kYXRlRm9ybWF0LFxuICAgICAgICAgICAgICAgIGFsdEZvcm1hdCA9IG9wdHMuYWx0RmllbGREYXRlRm9ybWF0LFxuICAgICAgICAgICAgICAgIHZhbHVlID0gX3RoaXMuc2VsZWN0ZWREYXRlcy5tYXAoZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLmZvcm1hdERhdGUoZm9ybWF0LCBkYXRlKVxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIGFsdFZhbHVlcztcblxuICAgICAgICAgICAgaWYgKG9wdHMuYWx0RmllbGQgJiYgX3RoaXMuJGFsdEZpZWxkLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGFsdFZhbHVlcyA9IHRoaXMuc2VsZWN0ZWREYXRlcy5tYXAoZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLmZvcm1hdERhdGUoYWx0Rm9ybWF0LCBkYXRlKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGFsdFZhbHVlcyA9IGFsdFZhbHVlcy5qb2luKHRoaXMub3B0cy5tdWx0aXBsZURhdGVzU2VwYXJhdG9yKTtcbiAgICAgICAgICAgICAgICB0aGlzLiRhbHRGaWVsZC52YWwoYWx0VmFsdWVzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5qb2luKHRoaXMub3B0cy5tdWx0aXBsZURhdGVzU2VwYXJhdG9yKTtcblxuICAgICAgICAgICAgdGhpcy4kZWwudmFsKHZhbHVlKVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDaGVjayBpZiBkYXRlIGlzIGJldHdlZW4gbWluRGF0ZSBhbmQgbWF4RGF0ZVxuICAgICAgICAgKiBAcGFyYW0gZGF0ZSB7b2JqZWN0fSAtIGRhdGUgb2JqZWN0XG4gICAgICAgICAqIEBwYXJhbSB0eXBlIHtzdHJpbmd9IC0gY2VsbCB0eXBlXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX2lzSW5SYW5nZTogZnVuY3Rpb24gKGRhdGUsIHR5cGUpIHtcbiAgICAgICAgICAgIHZhciB0aW1lID0gZGF0ZS5nZXRUaW1lKCksXG4gICAgICAgICAgICAgICAgZCA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZShkYXRlKSxcbiAgICAgICAgICAgICAgICBtaW4gPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUodGhpcy5taW5EYXRlKSxcbiAgICAgICAgICAgICAgICBtYXggPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUodGhpcy5tYXhEYXRlKSxcbiAgICAgICAgICAgICAgICBkTWluVGltZSA9IG5ldyBEYXRlKGQueWVhciwgZC5tb250aCwgbWluLmRhdGUpLmdldFRpbWUoKSxcbiAgICAgICAgICAgICAgICBkTWF4VGltZSA9IG5ldyBEYXRlKGQueWVhciwgZC5tb250aCwgbWF4LmRhdGUpLmdldFRpbWUoKSxcbiAgICAgICAgICAgICAgICB0eXBlcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGF5OiB0aW1lID49IHRoaXMubWluVGltZSAmJiB0aW1lIDw9IHRoaXMubWF4VGltZSxcbiAgICAgICAgICAgICAgICAgICAgbW9udGg6IGRNaW5UaW1lID49IHRoaXMubWluVGltZSAmJiBkTWF4VGltZSA8PSB0aGlzLm1heFRpbWUsXG4gICAgICAgICAgICAgICAgICAgIHllYXI6IGQueWVhciA+PSBtaW4ueWVhciAmJiBkLnllYXIgPD0gbWF4LnllYXJcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIHR5cGUgPyB0eXBlc1t0eXBlXSA6IHR5cGVzLmRheVxuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXREaW1lbnNpb25zOiBmdW5jdGlvbiAoJGVsKSB7XG4gICAgICAgICAgICB2YXIgb2Zmc2V0ID0gJGVsLm9mZnNldCgpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHdpZHRoOiAkZWwub3V0ZXJXaWR0aCgpLFxuICAgICAgICAgICAgICAgIGhlaWdodDogJGVsLm91dGVySGVpZ2h0KCksXG4gICAgICAgICAgICAgICAgbGVmdDogb2Zmc2V0LmxlZnQsXG4gICAgICAgICAgICAgICAgdG9wOiBvZmZzZXQudG9wXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldERhdGVGcm9tQ2VsbDogZnVuY3Rpb24gKGNlbGwpIHtcbiAgICAgICAgICAgIHZhciBjdXJEYXRlID0gdGhpcy5wYXJzZWREYXRlLFxuICAgICAgICAgICAgICAgIHllYXIgPSBjZWxsLmRhdGEoJ3llYXInKSB8fCBjdXJEYXRlLnllYXIsXG4gICAgICAgICAgICAgICAgbW9udGggPSBjZWxsLmRhdGEoJ21vbnRoJykgPT0gdW5kZWZpbmVkID8gY3VyRGF0ZS5tb250aCA6IGNlbGwuZGF0YSgnbW9udGgnKSxcbiAgICAgICAgICAgICAgICBkYXRlID0gY2VsbC5kYXRhKCdkYXRlJykgfHwgMTtcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHllYXIsIG1vbnRoLCBkYXRlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfc2V0UG9zaXRpb25DbGFzc2VzOiBmdW5jdGlvbiAocG9zKSB7XG4gICAgICAgICAgICBwb3MgPSBwb3Muc3BsaXQoJyAnKTtcbiAgICAgICAgICAgIHZhciBtYWluID0gcG9zWzBdLFxuICAgICAgICAgICAgICAgIHNlYyA9IHBvc1sxXSxcbiAgICAgICAgICAgICAgICBjbGFzc2VzID0gJ2RhdGVwaWNrZXIgLScgKyBtYWluICsgJy0nICsgc2VjICsgJy0gLWZyb20tJyArIG1haW4gKyAnLSc7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnZpc2libGUpIGNsYXNzZXMgKz0gJyBhY3RpdmUnO1xuXG4gICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyXG4gICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2NsYXNzJylcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoY2xhc3Nlcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0UG9zaXRpb246IGZ1bmN0aW9uIChwb3NpdGlvbikge1xuICAgICAgICAgICAgcG9zaXRpb24gPSBwb3NpdGlvbiB8fCB0aGlzLm9wdHMucG9zaXRpb247XG5cbiAgICAgICAgICAgIHZhciBkaW1zID0gdGhpcy5fZ2V0RGltZW5zaW9ucyh0aGlzLiRlbCksXG4gICAgICAgICAgICAgICAgc2VsZkRpbXMgPSB0aGlzLl9nZXREaW1lbnNpb25zKHRoaXMuJGRhdGVwaWNrZXIpLFxuICAgICAgICAgICAgICAgIHBvcyA9IHBvc2l0aW9uLnNwbGl0KCcgJyksXG4gICAgICAgICAgICAgICAgdG9wLCBsZWZ0LFxuICAgICAgICAgICAgICAgIG9mZnNldCA9IHRoaXMub3B0cy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgbWFpbiA9IHBvc1swXSxcbiAgICAgICAgICAgICAgICBzZWNvbmRhcnkgPSBwb3NbMV07XG5cbiAgICAgICAgICAgIHN3aXRjaCAobWFpbikge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgICAgICAgICAgICAgIHRvcCA9IGRpbXMudG9wIC0gc2VsZkRpbXMuaGVpZ2h0IC0gb2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgICAgICAgICAgIGxlZnQgPSBkaW1zLmxlZnQgKyBkaW1zLndpZHRoICsgb2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdib3R0b20nOlxuICAgICAgICAgICAgICAgICAgICB0b3AgPSBkaW1zLnRvcCArIGRpbXMuaGVpZ2h0ICsgb2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgICAgICAgICAgbGVmdCA9IGRpbXMubGVmdCAtIHNlbGZEaW1zLndpZHRoIC0gb2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3dpdGNoKHNlY29uZGFyeSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgICAgICAgICAgICAgIHRvcCA9IGRpbXMudG9wO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgICAgICAgICAgIGxlZnQgPSBkaW1zLmxlZnQgKyBkaW1zLndpZHRoIC0gc2VsZkRpbXMud2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICAgICAgICAgICAgICAgIHRvcCA9IGRpbXMudG9wICsgZGltcy5oZWlnaHQgLSBzZWxmRGltcy5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gZGltcy5sZWZ0O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdjZW50ZXInOlxuICAgICAgICAgICAgICAgICAgICBpZiAoL2xlZnR8cmlnaHQvLnRlc3QobWFpbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcCA9IGRpbXMudG9wICsgZGltcy5oZWlnaHQvMiAtIHNlbGZEaW1zLmhlaWdodC8yO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdCA9IGRpbXMubGVmdCArIGRpbXMud2lkdGgvMiAtIHNlbGZEaW1zLndpZHRoLzI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlclxuICAgICAgICAgICAgICAgIC5jc3Moe1xuICAgICAgICAgICAgICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvdzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5zZXRQb3NpdGlvbih0aGlzLm9wdHMucG9zaXRpb24pO1xuICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlci5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICB0aGlzLnZpc2libGUgPSB0cnVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhpZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXJcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAgICAgICAgICAgLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6ICctMTAwMDAwcHgnXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuZm9jdXNlZCA9ICcnO1xuICAgICAgICAgICAgdGhpcy5rZXlzID0gW107XG5cbiAgICAgICAgICAgIHRoaXMuaW5Gb2N1cyA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLiRlbC5ibHVyKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZG93bjogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2NoYW5nZVZpZXcoZGF0ZSwgJ2Rvd24nKTtcbiAgICAgICAgfSxcblxuICAgICAgICB1cDogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2NoYW5nZVZpZXcoZGF0ZSwgJ3VwJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2NoYW5nZVZpZXc6IGZ1bmN0aW9uIChkYXRlLCBkaXIpIHtcbiAgICAgICAgICAgIGRhdGUgPSBkYXRlIHx8IHRoaXMuZm9jdXNlZCB8fCB0aGlzLmRhdGU7XG5cbiAgICAgICAgICAgIHZhciBuZXh0VmlldyA9IGRpciA9PSAndXAnID8gdGhpcy52aWV3SW5kZXggKyAxIDogdGhpcy52aWV3SW5kZXggLSAxO1xuICAgICAgICAgICAgaWYgKG5leHRWaWV3ID4gMikgbmV4dFZpZXcgPSAyO1xuICAgICAgICAgICAgaWYgKG5leHRWaWV3IDwgMCkgbmV4dFZpZXcgPSAwO1xuXG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSwgMSk7XG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy52aWV3ID0gdGhpcy52aWV3SW5kZXhlc1tuZXh0Vmlld107XG5cbiAgICAgICAgfSxcblxuICAgICAgICBfaGFuZGxlSG90S2V5OiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICB2YXIgZGF0ZSA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZSh0aGlzLl9nZXRGb2N1c2VkRGF0ZSgpKSxcbiAgICAgICAgICAgICAgICBmb2N1c2VkUGFyc2VkLFxuICAgICAgICAgICAgICAgIG8gPSB0aGlzLm9wdHMsXG4gICAgICAgICAgICAgICAgbmV3RGF0ZSxcbiAgICAgICAgICAgICAgICB0b3RhbERheXNJbk5leHRNb250aCxcbiAgICAgICAgICAgICAgICBtb250aENoYW5nZWQgPSBmYWxzZSxcbiAgICAgICAgICAgICAgICB5ZWFyQ2hhbmdlZCA9IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRlY2FkZUNoYW5nZWQgPSBmYWxzZSxcbiAgICAgICAgICAgICAgICB5ID0gZGF0ZS55ZWFyLFxuICAgICAgICAgICAgICAgIG0gPSBkYXRlLm1vbnRoLFxuICAgICAgICAgICAgICAgIGQgPSBkYXRlLmRhdGU7XG5cbiAgICAgICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnY3RybFJpZ2h0JzpcbiAgICAgICAgICAgICAgICBjYXNlICdjdHJsVXAnOlxuICAgICAgICAgICAgICAgICAgICBtICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIG1vbnRoQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2N0cmxMZWZ0JzpcbiAgICAgICAgICAgICAgICBjYXNlICdjdHJsRG93bic6XG4gICAgICAgICAgICAgICAgICAgIG0gLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgbW9udGhDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnc2hpZnRSaWdodCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnc2hpZnRVcCc6XG4gICAgICAgICAgICAgICAgICAgIHllYXJDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgeSArPSAxO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdzaGlmdExlZnQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3NoaWZ0RG93bic6XG4gICAgICAgICAgICAgICAgICAgIHllYXJDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgeSAtPSAxO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdhbHRSaWdodCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnYWx0VXAnOlxuICAgICAgICAgICAgICAgICAgICBkZWNhZGVDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgeSArPSAxMDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnYWx0TGVmdCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnYWx0RG93bic6XG4gICAgICAgICAgICAgICAgICAgIGRlY2FkZUNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB5IC09IDEwO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdjdHJsU2hpZnRVcCc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXAoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRvdGFsRGF5c0luTmV4dE1vbnRoID0gZGF0ZXBpY2tlci5nZXREYXlzQ291bnQobmV3IERhdGUoeSxtKSk7XG4gICAgICAgICAgICBuZXdEYXRlID0gbmV3IERhdGUoeSxtLGQpO1xuXG4gICAgICAgICAgICAvLyBJZiBuZXh0IG1vbnRoIGhhcyBsZXNzIGRheXMgdGhhbiBjdXJyZW50LCBzZXQgZGF0ZSB0byB0b3RhbCBkYXlzIGluIHRoYXQgbW9udGhcbiAgICAgICAgICAgIGlmICh0b3RhbERheXNJbk5leHRNb250aCA8IGQpIGQgPSB0b3RhbERheXNJbk5leHRNb250aDtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgbmV3RGF0ZSBpcyBpbiB2YWxpZCByYW5nZVxuICAgICAgICAgICAgaWYgKG5ld0RhdGUuZ2V0VGltZSgpIDwgdGhpcy5taW5UaW1lKSB7XG4gICAgICAgICAgICAgICAgbmV3RGF0ZSA9IHRoaXMubWluRGF0ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3RGF0ZS5nZXRUaW1lKCkgPiB0aGlzLm1heFRpbWUpIHtcbiAgICAgICAgICAgICAgICBuZXdEYXRlID0gdGhpcy5tYXhEYXRlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmZvY3VzZWQgPSBuZXdEYXRlO1xuXG4gICAgICAgICAgICBmb2N1c2VkUGFyc2VkID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKG5ld0RhdGUpO1xuICAgICAgICAgICAgaWYgKG1vbnRoQ2hhbmdlZCAmJiBvLm9uQ2hhbmdlTW9udGgpIHtcbiAgICAgICAgICAgICAgICBvLm9uQ2hhbmdlTW9udGgoZm9jdXNlZFBhcnNlZC5tb250aCwgZm9jdXNlZFBhcnNlZC55ZWFyKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHllYXJDaGFuZ2VkICYmIG8ub25DaGFuZ2VZZWFyKSB7XG4gICAgICAgICAgICAgICAgby5vbkNoYW5nZVllYXIoZm9jdXNlZFBhcnNlZC55ZWFyKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRlY2FkZUNoYW5nZWQgJiYgby5vbkNoYW5nZURlY2FkZSkge1xuICAgICAgICAgICAgICAgIG8ub25DaGFuZ2VEZWNhZGUodGhpcy5jdXJEZWNhZGUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3JlZ2lzdGVyS2V5OiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICB2YXIgZXhpc3RzID0gdGhpcy5rZXlzLnNvbWUoZnVuY3Rpb24gKGN1cktleSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjdXJLZXkgPT0ga2V5O1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmICghZXhpc3RzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5rZXlzLnB1c2goa2V5KVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF91blJlZ2lzdGVyS2V5OiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmtleXMuaW5kZXhPZihrZXkpO1xuXG4gICAgICAgICAgICB0aGlzLmtleXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfaXNIb3RLZXlQcmVzc2VkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudEhvdEtleSxcbiAgICAgICAgICAgICAgICBmb3VuZCA9IGZhbHNlLFxuICAgICAgICAgICAgICAgIF90aGlzID0gdGhpcyxcbiAgICAgICAgICAgICAgICBwcmVzc2VkS2V5cyA9IHRoaXMua2V5cy5zb3J0KCk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGhvdEtleSBpbiBob3RLZXlzKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudEhvdEtleSA9IGhvdEtleXNbaG90S2V5XTtcbiAgICAgICAgICAgICAgICBpZiAocHJlc3NlZEtleXMubGVuZ3RoICE9IGN1cnJlbnRIb3RLZXkubGVuZ3RoKSBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50SG90S2V5LmV2ZXJ5KGZ1bmN0aW9uIChrZXksIGkpIHsgcmV0dXJuIGtleSA9PSBwcmVzc2VkS2V5c1tpXX0pKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLl90cmlnZ2VyKCdob3RLZXknLCBob3RLZXkpO1xuICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZm91bmQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3RyaWdnZXI6IGZ1bmN0aW9uIChldmVudCwgYXJncykge1xuICAgICAgICAgICAgdGhpcy4kZWwudHJpZ2dlcihldmVudCwgYXJncylcbiAgICAgICAgfSxcblxuICAgICAgICBfZm9jdXNOZXh0Q2VsbDogZnVuY3Rpb24gKGtleUNvZGUsIHR5cGUpIHtcbiAgICAgICAgICAgIHR5cGUgPSB0eXBlIHx8IHRoaXMuY2VsbFR5cGU7XG5cbiAgICAgICAgICAgIHZhciBkYXRlID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKHRoaXMuX2dldEZvY3VzZWREYXRlKCkpLFxuICAgICAgICAgICAgICAgIHkgPSBkYXRlLnllYXIsXG4gICAgICAgICAgICAgICAgbSA9IGRhdGUubW9udGgsXG4gICAgICAgICAgICAgICAgZCA9IGRhdGUuZGF0ZTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzSG90S2V5UHJlc3NlZCgpKXtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN3aXRjaChrZXlDb2RlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAzNzogLy8gbGVmdFxuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICdkYXknID8gKGQgLT0gMSkgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAnbW9udGgnID8gKG0gLT0gMSkgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAneWVhcicgPyAoeSAtPSAxKSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDM4OiAvLyB1cFxuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICdkYXknID8gKGQgLT0gNykgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAnbW9udGgnID8gKG0gLT0gMykgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAneWVhcicgPyAoeSAtPSA0KSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDM5OiAvLyByaWdodFxuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICdkYXknID8gKGQgKz0gMSkgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAnbW9udGgnID8gKG0gKz0gMSkgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAneWVhcicgPyAoeSArPSAxKSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDQwOiAvLyBkb3duXG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ2RheScgPyAoZCArPSA3KSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICdtb250aCcgPyAobSArPSAzKSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICd5ZWFyJyA/ICh5ICs9IDQpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgbmQgPSBuZXcgRGF0ZSh5LG0sZCk7XG4gICAgICAgICAgICBpZiAobmQuZ2V0VGltZSgpIDwgdGhpcy5taW5UaW1lKSB7XG4gICAgICAgICAgICAgICAgbmQgPSB0aGlzLm1pbkRhdGU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5kLmdldFRpbWUoKSA+IHRoaXMubWF4VGltZSkge1xuICAgICAgICAgICAgICAgIG5kID0gdGhpcy5tYXhEYXRlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmZvY3VzZWQgPSBuZDtcblxuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRGb2N1c2VkRGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGZvY3VzZWQgID0gdGhpcy5mb2N1c2VkIHx8IHRoaXMuc2VsZWN0ZWREYXRlc1t0aGlzLnNlbGVjdGVkRGF0ZXMubGVuZ3RoIC0gMV0sXG4gICAgICAgICAgICAgICAgZCA9IHRoaXMucGFyc2VkRGF0ZTtcblxuICAgICAgICAgICAgaWYgKCFmb2N1c2VkKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnZpZXcpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZGF5cyc6XG4gICAgICAgICAgICAgICAgICAgICAgICBmb2N1c2VkID0gbmV3IERhdGUoZC55ZWFyLCBkLm1vbnRoLCBuZXcgRGF0ZSgpLmdldERhdGUoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbW9udGhzJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzZWQgPSBuZXcgRGF0ZShkLnllYXIsIGQubW9udGgsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3llYXJzJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzZWQgPSBuZXcgRGF0ZShkLnllYXIsIDAsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZm9jdXNlZDtcbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0Q2VsbDogZnVuY3Rpb24gKGRhdGUsIHR5cGUpIHtcbiAgICAgICAgICAgIHR5cGUgPSB0eXBlIHx8IHRoaXMuY2VsbFR5cGU7XG5cbiAgICAgICAgICAgIHZhciBkID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKGRhdGUpLFxuICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gJy5kYXRlcGlja2VyLS1jZWxsW2RhdGEteWVhcj1cIicgKyBkLnllYXIgKyAnXCJdJyxcbiAgICAgICAgICAgICAgICAkY2VsbDtcblxuICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnbW9udGgnOlxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RvciA9ICdbZGF0YS1tb250aD1cIicgKyBkLm1vbnRoICsgJ1wiXSc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2RheSc6XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yICs9ICdbZGF0YS1tb250aD1cIicgKyBkLm1vbnRoICsgJ1wiXVtkYXRhLWRhdGU9XCInICsgZC5kYXRlICsgJ1wiXSc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJGNlbGwgPSB0aGlzLnZpZXdzW3RoaXMuY3VycmVudFZpZXddLiRlbC5maW5kKHNlbGVjdG9yKTtcblxuICAgICAgICAgICAgcmV0dXJuICRjZWxsLmxlbmd0aCA/ICRjZWxsIDogJyc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVzdHJveTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgIF90aGlzLiRlbFxuICAgICAgICAgICAgICAgIC5vZmYoJy5hZHAnKVxuICAgICAgICAgICAgICAgIC5kYXRhKCdkYXRlcGlja2VyJywgJycpO1xuXG4gICAgICAgICAgICBfdGhpcy5zZWxlY3RlZERhdGVzID0gW107XG4gICAgICAgICAgICBfdGhpcy5mb2N1c2VkID0gJyc7XG4gICAgICAgICAgICBfdGhpcy52aWV3cyA9IHt9O1xuICAgICAgICAgICAgX3RoaXMua2V5cyA9IFtdO1xuICAgICAgICAgICAgX3RoaXMubWluUmFuZ2UgPSAnJztcbiAgICAgICAgICAgIF90aGlzLm1heFJhbmdlID0gJyc7XG5cbiAgICAgICAgICAgIGlmIChfdGhpcy5vcHRzLmlubGluZSB8fCAhX3RoaXMuZWxJc0lucHV0KSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuJGRhdGVwaWNrZXIuY2xvc2VzdCgnLmRhdGVwaWNrZXItaW5saW5lJykucmVtb3ZlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF90aGlzLiRkYXRlcGlja2VyLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9vblNob3dFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3coKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfb25CbHVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaW5Gb2N1cyAmJiB0aGlzLnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfb25Nb3VzZURvd25EYXRlcGlja2VyOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdGhpcy5pbkZvY3VzID0gdHJ1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBfb25Nb3VzZVVwRGF0ZXBpY2tlcjogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHRoaXMuaW5Gb2N1cyA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy4kZWwuZm9jdXMoKVxuICAgICAgICB9LFxuXG4gICAgICAgIF9vbklucHV0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdmFsID0gdGhpcy4kZWwudmFsKCk7XG5cbiAgICAgICAgICAgIGlmICghdmFsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9vblJlc2l6ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfb25LZXlEb3duOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyIGNvZGUgPSBlLndoaWNoO1xuICAgICAgICAgICAgdGhpcy5fcmVnaXN0ZXJLZXkoY29kZSk7XG5cbiAgICAgICAgICAgIC8vIEFycm93c1xuICAgICAgICAgICAgaWYgKGNvZGUgPj0gMzcgJiYgY29kZSA8PSA0MCkge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9mb2N1c05leHRDZWxsKGNvZGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBFbnRlclxuICAgICAgICAgICAgaWYgKGNvZGUgPT0gMTMpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5mb2N1c2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9nZXRDZWxsKHRoaXMuZm9jdXNlZCkuaGFzQ2xhc3MoJy1kaXNhYmxlZC0nKSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy52aWV3ICE9IHRoaXMub3B0cy5taW5WaWV3KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRvd24oKVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFscmVhZHlTZWxlY3RlZCA9IHRoaXMuX2lzU2VsZWN0ZWQodGhpcy5mb2N1c2VkLCB0aGlzLmNlbGxUeXBlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFhbHJlYWR5U2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdERhdGUodGhpcy5mb2N1c2VkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYWxyZWFkeVNlbGVjdGVkICYmIHRoaXMub3B0cy50b2dnbGVTZWxlY3RlZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVEYXRlKHRoaXMuZm9jdXNlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEVzY1xuICAgICAgICAgICAgaWYgKGNvZGUgPT0gMjcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfb25LZXlVcDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciBjb2RlID0gZS53aGljaDtcbiAgICAgICAgICAgIHRoaXMuX3VuUmVnaXN0ZXJLZXkoY29kZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uSG90S2V5OiBmdW5jdGlvbiAoZSwgaG90S2V5KSB7XG4gICAgICAgICAgICB0aGlzLl9oYW5kbGVIb3RLZXkoaG90S2V5KTtcbiAgICAgICAgfSxcblxuICAgICAgICBfb25Nb3VzZUVudGVyQ2VsbDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciAkY2VsbCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5kYXRlcGlja2VyLS1jZWxsJyksXG4gICAgICAgICAgICAgICAgZGF0ZSA9IHRoaXMuX2dldERhdGVGcm9tQ2VsbCgkY2VsbCk7XG5cbiAgICAgICAgICAgIC8vIFByZXZlbnQgZnJvbSB1bm5lY2Vzc2FyeSByZW5kZXJpbmcgYW5kIHNldHRpbmcgbmV3IGN1cnJlbnREYXRlXG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmZvY3VzZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZvY3VzZWQgPSAnJ1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkY2VsbC5hZGRDbGFzcygnLWZvY3VzLScpO1xuXG4gICAgICAgICAgICB0aGlzLmZvY3VzZWQgPSBkYXRlO1xuICAgICAgICAgICAgdGhpcy5zaWxlbnQgPSBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5yYW5nZSAmJiB0aGlzLnNlbGVjdGVkRGF0ZXMubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1pblJhbmdlID0gdGhpcy5zZWxlY3RlZERhdGVzWzBdO1xuICAgICAgICAgICAgICAgIHRoaXMubWF4UmFuZ2UgPSAnJztcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZXBpY2tlci5sZXNzKHRoaXMubWluUmFuZ2UsIHRoaXMuZm9jdXNlZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXhSYW5nZSA9IHRoaXMubWluUmFuZ2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWluUmFuZ2UgPSAnJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy52aWV3c1t0aGlzLmN1cnJlbnRWaWV3XS5fdXBkYXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uTW91c2VMZWF2ZUNlbGw6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgJGNlbGwgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcuZGF0ZXBpY2tlci0tY2VsbCcpO1xuXG4gICAgICAgICAgICAkY2VsbC5yZW1vdmVDbGFzcygnLWZvY3VzLScpO1xuXG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmZvY3VzZWQgPSAnJztcbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0IGZvY3VzZWQodmFsKSB7XG4gICAgICAgICAgICBpZiAoIXZhbCAmJiB0aGlzLmZvY3VzZWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgJGNlbGwgPSB0aGlzLl9nZXRDZWxsKHRoaXMuZm9jdXNlZCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoJGNlbGwubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICRjZWxsLnJlbW92ZUNsYXNzKCctZm9jdXMtJylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9mb2N1c2VkID0gdmFsO1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5yYW5nZSAmJiB0aGlzLnNlbGVjdGVkRGF0ZXMubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1pblJhbmdlID0gdGhpcy5zZWxlY3RlZERhdGVzWzBdO1xuICAgICAgICAgICAgICAgIHRoaXMubWF4UmFuZ2UgPSAnJztcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZXBpY2tlci5sZXNzKHRoaXMubWluUmFuZ2UsIHRoaXMuX2ZvY3VzZWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWF4UmFuZ2UgPSB0aGlzLm1pblJhbmdlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1pblJhbmdlID0gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuc2lsZW50KSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLmRhdGUgPSB2YWw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0IGZvY3VzZWQoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZm9jdXNlZDtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXQgcGFyc2VkRGF0ZSgpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUodGhpcy5kYXRlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXQgZGF0ZSAodmFsKSB7XG4gICAgICAgICAgICBpZiAoISh2YWwgaW5zdGFuY2VvZiBEYXRlKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnREYXRlID0gdmFsO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5pbml0ZWQgJiYgIXRoaXMuc2lsZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy52aWV3c1t0aGlzLnZpZXddLl9yZW5kZXIoKTtcbiAgICAgICAgICAgICAgICB0aGlzLm5hdi5fcmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudmlzaWJsZSAmJiB0aGlzLmVsSXNJbnB1dCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFBvc2l0aW9uKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZhbDtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXQgZGF0ZSAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50RGF0ZVxuICAgICAgICB9LFxuXG4gICAgICAgIHNldCB2aWV3ICh2YWwpIHtcbiAgICAgICAgICAgIHRoaXMudmlld0luZGV4ID0gdGhpcy52aWV3SW5kZXhlcy5pbmRleE9mKHZhbCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnZpZXdJbmRleCA8IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucHJldlZpZXcgPSB0aGlzLmN1cnJlbnRWaWV3O1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50VmlldyA9IHZhbDtcblxuICAgICAgICAgICAgaWYgKHRoaXMuaW5pdGVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLnZpZXdzW3ZhbF0pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3c1t2YWxdID0gbmV3IERhdGVwaWNrZXIuQm9keSh0aGlzLCB2YWwsIHRoaXMub3B0cylcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXdzW3ZhbF0uX3JlbmRlcigpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMudmlld3NbdGhpcy5wcmV2Vmlld10uaGlkZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMudmlld3NbdmFsXS5zaG93KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5uYXYuX3JlbmRlcigpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5vbkNoYW5nZVZpZXcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRzLm9uQ2hhbmdlVmlldyh2YWwpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmVsSXNJbnB1dCAmJiB0aGlzLnZpc2libGUpIHRoaXMuc2V0UG9zaXRpb24oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHZhbFxuICAgICAgICB9LFxuXG4gICAgICAgIGdldCB2aWV3KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFZpZXc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0IGNlbGxUeXBlKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmlldy5zdWJzdHJpbmcoMCwgdGhpcy52aWV3Lmxlbmd0aCAtIDEpXG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0IG1pblRpbWUoKSB7XG4gICAgICAgICAgICB2YXIgbWluID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKHRoaXMubWluRGF0ZSk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUobWluLnllYXIsIG1pbi5tb250aCwgbWluLmRhdGUpLmdldFRpbWUoKVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldCBtYXhUaW1lKCkge1xuICAgICAgICAgICAgdmFyIG1heCA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZSh0aGlzLm1heERhdGUpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKG1heC55ZWFyLCBtYXgubW9udGgsIG1heC5kYXRlKS5nZXRUaW1lKClcbiAgICAgICAgfSxcblxuICAgICAgICBnZXQgY3VyRGVjYWRlKCkge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGVwaWNrZXIuZ2V0RGVjYWRlKHRoaXMuZGF0ZSlcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyAgVXRpbHNcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICBkYXRlcGlja2VyLmdldERheXNDb3VudCA9IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSArIDEsIDApLmdldERhdGUoKTtcbiAgICB9O1xuXG4gICAgZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlID0gZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHllYXI6IGRhdGUuZ2V0RnVsbFllYXIoKSxcbiAgICAgICAgICAgIG1vbnRoOiBkYXRlLmdldE1vbnRoKCksXG4gICAgICAgICAgICBmdWxsTW9udGg6IChkYXRlLmdldE1vbnRoKCkgKyAxKSA8IDEwID8gJzAnICsgKGRhdGUuZ2V0TW9udGgoKSArIDEpIDogZGF0ZS5nZXRNb250aCgpICsgMSwgLy8gT25lIGJhc2VkXG4gICAgICAgICAgICBkYXRlOiBkYXRlLmdldERhdGUoKSxcbiAgICAgICAgICAgIGZ1bGxEYXRlOiBkYXRlLmdldERhdGUoKSA8IDEwID8gJzAnICsgZGF0ZS5nZXREYXRlKCkgOiBkYXRlLmdldERhdGUoKSxcbiAgICAgICAgICAgIGRheTogZGF0ZS5nZXREYXkoKVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIGRhdGVwaWNrZXIuZ2V0RGVjYWRlID0gZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgdmFyIGZpcnN0WWVhciA9IE1hdGguZmxvb3IoZGF0ZS5nZXRGdWxsWWVhcigpIC8gMTApICogMTA7XG5cbiAgICAgICAgcmV0dXJuIFtmaXJzdFllYXIsIGZpcnN0WWVhciArIDldO1xuICAgIH07XG5cbiAgICBkYXRlcGlja2VyLnRlbXBsYXRlID0gZnVuY3Rpb24gKHN0ciwgZGF0YSkge1xuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UoLyNcXHsoW1xcd10rKVxcfS9nLCBmdW5jdGlvbiAoc291cmNlLCBtYXRjaCkge1xuICAgICAgICAgICAgaWYgKGRhdGFbbWF0Y2hdIHx8IGRhdGFbbWF0Y2hdID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGFbbWF0Y2hdXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBkYXRlcGlja2VyLmlzU2FtZSA9IGZ1bmN0aW9uIChkYXRlMSwgZGF0ZTIsIHR5cGUpIHtcbiAgICAgICAgaWYgKCFkYXRlMSB8fCAhZGF0ZTIpIHJldHVybiBmYWxzZTtcbiAgICAgICAgdmFyIGQxID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKGRhdGUxKSxcbiAgICAgICAgICAgIGQyID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKGRhdGUyKSxcbiAgICAgICAgICAgIF90eXBlID0gdHlwZSA/IHR5cGUgOiAnZGF5JyxcblxuICAgICAgICAgICAgY29uZGl0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICBkYXk6IGQxLmRhdGUgPT0gZDIuZGF0ZSAmJiBkMS5tb250aCA9PSBkMi5tb250aCAmJiBkMS55ZWFyID09IGQyLnllYXIsXG4gICAgICAgICAgICAgICAgbW9udGg6IGQxLm1vbnRoID09IGQyLm1vbnRoICYmIGQxLnllYXIgPT0gZDIueWVhcixcbiAgICAgICAgICAgICAgICB5ZWFyOiBkMS55ZWFyID09IGQyLnllYXJcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIGNvbmRpdGlvbnNbX3R5cGVdO1xuICAgIH07XG5cbiAgICBkYXRlcGlja2VyLmxlc3MgPSBmdW5jdGlvbiAoZGF0ZUNvbXBhcmVUbywgZGF0ZSwgdHlwZSkge1xuICAgICAgICBpZiAoIWRhdGVDb21wYXJlVG8gfHwgIWRhdGUpIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIGRhdGUuZ2V0VGltZSgpIDwgZGF0ZUNvbXBhcmVUby5nZXRUaW1lKCk7XG4gICAgfTtcblxuICAgIGRhdGVwaWNrZXIuYmlnZ2VyID0gZnVuY3Rpb24gKGRhdGVDb21wYXJlVG8sIGRhdGUsIHR5cGUpIHtcbiAgICAgICAgaWYgKCFkYXRlQ29tcGFyZVRvIHx8ICFkYXRlKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiBkYXRlLmdldFRpbWUoKSA+IGRhdGVDb21wYXJlVG8uZ2V0VGltZSgpO1xuICAgIH07XG5cbiAgICBEYXRlcGlja2VyLmxhbmd1YWdlID0ge1xuICAgICAgICBydToge1xuICAgICAgICAgICAgZGF5czogWyfQktC+0YHQutGA0LXRgdC10L3RjNC1JywgJ9Cf0L7QvdC10LTQtdC70YzQvdC40LonLCAn0JLRgtC+0YDQvdC40LonLCAn0KHRgNC10LTQsCcsICfQp9C10YLQstC10YDQsycsICfQn9GP0YLQvdC40YbQsCcsICfQodGD0LHQsdC+0YLQsCddLFxuICAgICAgICAgICAgZGF5c1Nob3J0OiBbJ9CS0L7RgScsJ9Cf0L7QvScsJ9CS0YLQvicsJ9Ch0YDQtScsJ9Cn0LXRgicsJ9Cf0Y/RgicsJ9Ch0YPQsSddLFxuICAgICAgICAgICAgZGF5c01pbjogWyfQktGBJywn0J/QvScsJ9CS0YInLCfQodGAJywn0KfRgicsJ9Cf0YInLCfQodCxJ10sXG4gICAgICAgICAgICBtb250aHM6IFsn0K/QvdCy0LDRgNGMJywgJ9Ck0LXQstGA0LDQu9GMJywgJ9Cc0LDRgNGCJywgJ9CQ0L/RgNC10LvRjCcsICfQnNCw0LknLCAn0JjRjtC90YwnLCAn0JjRjtC70YwnLCAn0JDQstCz0YPRgdGCJywgJ9Ch0LXQvdGC0Y/QsdGA0YwnLCAn0J7QutGC0Y/QsdGA0YwnLCAn0J3QvtGP0LHRgNGMJywgJ9CU0LXQutCw0LHRgNGMJ10sXG4gICAgICAgICAgICBtb250aHNTaG9ydDogWyfQr9C90LInLCAn0KTQtdCyJywgJ9Cc0LDRgCcsICfQkNC/0YAnLCAn0JzQsNC5JywgJ9CY0Y7QvScsICfQmNGO0LsnLCAn0JDQstCzJywgJ9Ch0LXQvScsICfQntC60YInLCAn0J3QvtGPJywgJ9CU0LXQuiddLFxuICAgICAgICAgICAgdG9kYXk6ICfQodC10LPQvtC00L3RjycsXG4gICAgICAgICAgICBjbGVhcjogJ9Ce0YfQuNGB0YLQuNGC0YwnLFxuICAgICAgICAgICAgZGF0ZUZvcm1hdDogJ2RkLm1tLnl5eXknLFxuICAgICAgICAgICAgZmlyc3REYXk6IDFcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAkLmZuW3BsdWdpbk5hbWVdID0gZnVuY3Rpb24gKCBvcHRpb25zICkge1xuICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghJC5kYXRhKHRoaXMsIHBsdWdpbk5hbWUpKSB7XG4gICAgICAgICAgICAgICAgJC5kYXRhKHRoaXMsICBwbHVnaW5OYW1lLFxuICAgICAgICAgICAgICAgICAgICBuZXcgRGF0ZXBpY2tlciggdGhpcywgb3B0aW9ucyApKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIF90aGlzID0gJC5kYXRhKHRoaXMsIHBsdWdpbk5hbWUpO1xuXG4gICAgICAgICAgICAgICAgX3RoaXMub3B0cyA9ICQuZXh0ZW5kKHRydWUsIF90aGlzLm9wdHMsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIF90aGlzLnVwZGF0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgJChmdW5jdGlvbiAoKSB7XG4gICAgICAgICQoYXV0b0luaXRTZWxlY3RvcikuZGF0ZXBpY2tlcigpO1xuICAgIH0pXG5cbn0pKHdpbmRvdywgalF1ZXJ5KTtcbjsoZnVuY3Rpb24gKCkge1xuICAgIHZhciB0ZW1wbGF0ZXMgPSB7XG4gICAgICAgIGRheXM6JycgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLWRheXMgZGF0ZXBpY2tlci0tYm9keVwiPicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLWRheXMtbmFtZXNcIj48L2Rpdj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1jZWxscyBkYXRlcGlja2VyLS1jZWxscy1kYXlzXCI+PC9kaXY+JyArXG4gICAgICAgICc8L2Rpdj4nLFxuICAgICAgICBtb250aHM6ICcnICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1tb250aHMgZGF0ZXBpY2tlci0tYm9keVwiPicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLWNlbGxzIGRhdGVwaWNrZXItLWNlbGxzLW1vbnRoc1wiPjwvZGl2PicgK1xuICAgICAgICAnPC9kaXY+JyxcbiAgICAgICAgeWVhcnM6ICcnICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS15ZWFycyBkYXRlcGlja2VyLS1ib2R5XCI+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tY2VsbHMgZGF0ZXBpY2tlci0tY2VsbHMteWVhcnNcIj48L2Rpdj4nICtcbiAgICAgICAgJzwvZGl2PidcbiAgICAgICAgfSxcbiAgICAgICAgRCA9IERhdGVwaWNrZXI7XG5cbiAgICBELkJvZHkgPSBmdW5jdGlvbiAoZCwgdHlwZSwgb3B0cykge1xuICAgICAgICB0aGlzLmQgPSBkO1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLm9wdHMgPSBvcHRzO1xuXG4gICAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH07XG5cbiAgICBELkJvZHkucHJvdG90eXBlID0ge1xuICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl9idWlsZEJhc2VIdG1sKCk7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXIoKTtcblxuICAgICAgICAgICAgdGhpcy5fYmluZEV2ZW50cygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9iaW5kRXZlbnRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5vbignY2xpY2snLCAnLmRhdGVwaWNrZXItLWNlbGwnLCAkLnByb3h5KHRoaXMuX29uQ2xpY2tDZWxsLCB0aGlzKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2J1aWxkQmFzZUh0bWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsID0gJCh0ZW1wbGF0ZXNbdGhpcy50eXBlXSkuYXBwZW5kVG8odGhpcy5kLiRjb250ZW50KTtcbiAgICAgICAgICAgIHRoaXMuJG5hbWVzID0gJCgnLmRhdGVwaWNrZXItLWRheXMtbmFtZXMnLCB0aGlzLiRlbCk7XG4gICAgICAgICAgICB0aGlzLiRjZWxscyA9ICQoJy5kYXRlcGlja2VyLS1jZWxscycsIHRoaXMuJGVsKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0RGF5TmFtZXNIdG1sOiBmdW5jdGlvbiAoZmlyc3REYXksIGN1ckRheSwgaHRtbCwgaSkge1xuICAgICAgICAgICAgY3VyRGF5ID0gY3VyRGF5ICE9IHVuZGVmaW5lZCA/IGN1ckRheSA6IGZpcnN0RGF5O1xuICAgICAgICAgICAgaHRtbCA9IGh0bWwgPyBodG1sIDogJyc7XG4gICAgICAgICAgICBpID0gaSAhPSB1bmRlZmluZWQgPyBpIDogMDtcblxuICAgICAgICAgICAgaWYgKGkgPiA3KSByZXR1cm4gaHRtbDtcbiAgICAgICAgICAgIGlmIChjdXJEYXkgPT0gNykgcmV0dXJuIHRoaXMuX2dldERheU5hbWVzSHRtbChmaXJzdERheSwgMCwgaHRtbCwgKytpKTtcblxuICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLWRheS1uYW1lJyArICh0aGlzLmQuaXNXZWVrZW5kKGN1ckRheSkgPyBcIiAtd2Vla2VuZC1cIiA6IFwiXCIpICsgJ1wiPicgKyB0aGlzLmQubG9jLmRheXNNaW5bY3VyRGF5XSArICc8L2Rpdj4nO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0RGF5TmFtZXNIdG1sKGZpcnN0RGF5LCArK2N1ckRheSwgaHRtbCwgKytpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0Q2VsbENvbnRlbnRzOiBmdW5jdGlvbiAoZGF0ZSwgdHlwZSkge1xuICAgICAgICAgICAgdmFyIGNsYXNzZXMgPSBcImRhdGVwaWNrZXItLWNlbGwgZGF0ZXBpY2tlci0tY2VsbC1cIiArIHR5cGUsXG4gICAgICAgICAgICAgICAgY3VycmVudERhdGUgPSBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgICAgIHBhcmVudCA9IHRoaXMuZCxcbiAgICAgICAgICAgICAgICBvcHRzID0gcGFyZW50Lm9wdHMsXG4gICAgICAgICAgICAgICAgZCA9IEQuZ2V0UGFyc2VkRGF0ZShkYXRlKSxcbiAgICAgICAgICAgICAgICByZW5kZXIgPSB7fSxcbiAgICAgICAgICAgICAgICBodG1sID0gZC5kYXRlO1xuXG4gICAgICAgICAgICBpZiAob3B0cy5vblJlbmRlckNlbGwpIHtcbiAgICAgICAgICAgICAgICByZW5kZXIgPSBvcHRzLm9uUmVuZGVyQ2VsbChkYXRlLCB0eXBlKSB8fCB7fTtcbiAgICAgICAgICAgICAgICBodG1sID0gcmVuZGVyLmh0bWwgPyByZW5kZXIuaHRtbCA6IGh0bWw7XG4gICAgICAgICAgICAgICAgY2xhc3NlcyArPSByZW5kZXIuY2xhc3NlcyA/ICcgJyArIHJlbmRlci5jbGFzc2VzIDogJyc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2RheSc6XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJlbnQuaXNXZWVrZW5kKGQuZGF5KSkgY2xhc3NlcyArPSBcIiAtd2Vla2VuZC1cIjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGQubW9udGggIT0gdGhpcy5kLnBhcnNlZERhdGUubW9udGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gXCIgLW90aGVyLW1vbnRoLVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFvcHRzLnNlbGVjdE90aGVyTW9udGhzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NlcyArPSBcIiAtZGlzYWJsZWQtXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW9wdHMuc2hvd090aGVyTW9udGhzKSBodG1sID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnbW9udGgnOlxuICAgICAgICAgICAgICAgICAgICBodG1sID0gcGFyZW50LmxvY1twYXJlbnQub3B0cy5tb250aHNGaWVsZF1bZC5tb250aF07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3llYXInOlxuICAgICAgICAgICAgICAgICAgICB2YXIgZGVjYWRlID0gcGFyZW50LmN1ckRlY2FkZTtcbiAgICAgICAgICAgICAgICAgICAgaHRtbCA9IGQueWVhcjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGQueWVhciA8IGRlY2FkZVswXSB8fCBkLnllYXIgPiBkZWNhZGVbMV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gJyAtb3RoZXItZGVjYWRlLSc7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW9wdHMuc2VsZWN0T3RoZXJZZWFycykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gXCIgLWRpc2FibGVkLVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFvcHRzLnNob3dPdGhlclllYXJzKSBodG1sID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcHRzLm9uUmVuZGVyQ2VsbCkge1xuICAgICAgICAgICAgICAgIHJlbmRlciA9IG9wdHMub25SZW5kZXJDZWxsKGRhdGUsIHR5cGUpIHx8IHt9O1xuICAgICAgICAgICAgICAgIGh0bWwgPSByZW5kZXIuaHRtbCA/IHJlbmRlci5odG1sIDogaHRtbDtcbiAgICAgICAgICAgICAgICBjbGFzc2VzICs9IHJlbmRlci5jbGFzc2VzID8gJyAnICsgcmVuZGVyLmNsYXNzZXMgOiAnJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG9wdHMucmFuZ2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoRC5pc1NhbWUocGFyZW50Lm1pblJhbmdlLCBkYXRlLCB0eXBlKSkgY2xhc3NlcyArPSAnIC1yYW5nZS1mcm9tLSc7XG4gICAgICAgICAgICAgICAgaWYgKEQuaXNTYW1lKHBhcmVudC5tYXhSYW5nZSwgZGF0ZSwgdHlwZSkpIGNsYXNzZXMgKz0gJyAtcmFuZ2UtdG8tJztcblxuICAgICAgICAgICAgICAgIGlmIChwYXJlbnQuc2VsZWN0ZWREYXRlcy5sZW5ndGggPT0gMSAmJiBwYXJlbnQuZm9jdXNlZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAoRC5iaWdnZXIocGFyZW50Lm1pblJhbmdlLCBkYXRlKSAmJiBELmxlc3MocGFyZW50LmZvY3VzZWQsIGRhdGUpKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgKEQubGVzcyhwYXJlbnQubWF4UmFuZ2UsIGRhdGUpICYmIEQuYmlnZ2VyKHBhcmVudC5mb2N1c2VkLCBkYXRlKSkpXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gJyAtaW4tcmFuZ2UtJ1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKEQubGVzcyhwYXJlbnQubWF4UmFuZ2UsIGRhdGUpICYmIEQuaXNTYW1lKHBhcmVudC5mb2N1c2VkLCBkYXRlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NlcyArPSAnIC1yYW5nZS1mcm9tLSdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoRC5iaWdnZXIocGFyZW50Lm1pblJhbmdlLCBkYXRlKSAmJiBELmlzU2FtZShwYXJlbnQuZm9jdXNlZCwgZGF0ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gJyAtcmFuZ2UtdG8tJ1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhcmVudC5zZWxlY3RlZERhdGVzLmxlbmd0aCA9PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChELmJpZ2dlcihwYXJlbnQubWluUmFuZ2UsIGRhdGUpICYmIEQubGVzcyhwYXJlbnQubWF4UmFuZ2UsIGRhdGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzICs9ICcgLWluLXJhbmdlLSdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICBpZiAoRC5pc1NhbWUoY3VycmVudERhdGUsIGRhdGUsIHR5cGUpKSBjbGFzc2VzICs9ICcgLWN1cnJlbnQtJztcbiAgICAgICAgICAgIGlmIChwYXJlbnQuZm9jdXNlZCAmJiBELmlzU2FtZShkYXRlLCBwYXJlbnQuZm9jdXNlZCwgdHlwZSkpIGNsYXNzZXMgKz0gJyAtZm9jdXMtJztcbiAgICAgICAgICAgIGlmIChwYXJlbnQuX2lzU2VsZWN0ZWQoZGF0ZSwgdHlwZSkpIGNsYXNzZXMgKz0gJyAtc2VsZWN0ZWQtJztcbiAgICAgICAgICAgIGlmICghcGFyZW50Ll9pc0luUmFuZ2UoZGF0ZSwgdHlwZSkgfHwgcmVuZGVyLmRpc2FibGVkKSBjbGFzc2VzICs9ICcgLWRpc2FibGVkLSc7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaHRtbDogaHRtbCxcbiAgICAgICAgICAgICAgICBjbGFzc2VzOiBjbGFzc2VzXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENhbGN1bGF0ZXMgZGF5cyBudW1iZXIgdG8gcmVuZGVyLiBHZW5lcmF0ZXMgZGF5cyBodG1sIGFuZCByZXR1cm5zIGl0LlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gZGF0ZSAtIERhdGUgb2JqZWN0XG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfZ2V0RGF5c0h0bWw6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgICAgICB2YXIgdG90YWxNb250aERheXMgPSBELmdldERheXNDb3VudChkYXRlKSxcbiAgICAgICAgICAgICAgICBmaXJzdE1vbnRoRGF5ID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIDEpLmdldERheSgpLFxuICAgICAgICAgICAgICAgIGxhc3RNb250aERheSA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCB0b3RhbE1vbnRoRGF5cykuZ2V0RGF5KCksXG4gICAgICAgICAgICAgICAgZGF5c0Zyb21QZXZNb250aCA9IGZpcnN0TW9udGhEYXkgLSB0aGlzLmQubG9jLmZpcnN0RGF5LFxuICAgICAgICAgICAgICAgIGRheXNGcm9tTmV4dE1vbnRoID0gNiAtIGxhc3RNb250aERheSArIHRoaXMuZC5sb2MuZmlyc3REYXk7XG5cbiAgICAgICAgICAgIGRheXNGcm9tUGV2TW9udGggPSBkYXlzRnJvbVBldk1vbnRoIDwgMCA/IGRheXNGcm9tUGV2TW9udGggKyA3IDogZGF5c0Zyb21QZXZNb250aDtcbiAgICAgICAgICAgIGRheXNGcm9tTmV4dE1vbnRoID0gZGF5c0Zyb21OZXh0TW9udGggPiA2ID8gZGF5c0Zyb21OZXh0TW9udGggLSA3IDogZGF5c0Zyb21OZXh0TW9udGg7XG5cbiAgICAgICAgICAgIHZhciBzdGFydERheUluZGV4ID0gLWRheXNGcm9tUGV2TW9udGggKyAxLFxuICAgICAgICAgICAgICAgIG0sIHksXG4gICAgICAgICAgICAgICAgaHRtbCA9ICcnO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gc3RhcnREYXlJbmRleCwgbWF4ID0gdG90YWxNb250aERheXMgKyBkYXlzRnJvbU5leHRNb250aDsgaSA8PSBtYXg7IGkrKykge1xuICAgICAgICAgICAgICAgIHkgPSBkYXRlLmdldEZ1bGxZZWFyKCk7XG4gICAgICAgICAgICAgICAgbSA9IGRhdGUuZ2V0TW9udGgoKTtcblxuICAgICAgICAgICAgICAgIGh0bWwgKz0gdGhpcy5fZ2V0RGF5SHRtbChuZXcgRGF0ZSh5LCBtLCBpKSlcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldERheUh0bWw6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgICAgIHZhciBjb250ZW50ID0gdGhpcy5fZ2V0Q2VsbENvbnRlbnRzKGRhdGUsICdkYXknKTtcblxuICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiJyArIGNvbnRlbnQuY2xhc3NlcyArICdcIiAnICtcbiAgICAgICAgICAgICAgICAnZGF0YS1kYXRlPVwiJyArIGRhdGUuZ2V0RGF0ZSgpICsgJ1wiICcgK1xuICAgICAgICAgICAgICAgICdkYXRhLW1vbnRoPVwiJyArIGRhdGUuZ2V0TW9udGgoKSArICdcIiAnICtcbiAgICAgICAgICAgICAgICAnZGF0YS15ZWFyPVwiJyArIGRhdGUuZ2V0RnVsbFllYXIoKSArICdcIj4nICsgY29udGVudC5odG1sICsgJzwvZGl2Pic7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdlbmVyYXRlcyBtb250aHMgaHRtbFxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gZGF0ZSAtIGRhdGUgaW5zdGFuY2VcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9nZXRNb250aHNIdG1sOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgdmFyIGh0bWwgPSAnJyxcbiAgICAgICAgICAgICAgICBkID0gRC5nZXRQYXJzZWREYXRlKGRhdGUpLFxuICAgICAgICAgICAgICAgIGkgPSAwO1xuXG4gICAgICAgICAgICB3aGlsZShpIDwgMTIpIHtcbiAgICAgICAgICAgICAgICBodG1sICs9IHRoaXMuX2dldE1vbnRoSHRtbChuZXcgRGF0ZShkLnllYXIsIGkpKTtcbiAgICAgICAgICAgICAgICBpKytcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldE1vbnRoSHRtbDogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gdGhpcy5fZ2V0Q2VsbENvbnRlbnRzKGRhdGUsICdtb250aCcpO1xuXG4gICAgICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCInICsgY29udGVudC5jbGFzc2VzICsgJ1wiIGRhdGEtbW9udGg9XCInICsgZGF0ZS5nZXRNb250aCgpICsgJ1wiPicgKyBjb250ZW50Lmh0bWwgKyAnPC9kaXY+J1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRZZWFyc0h0bWw6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgICAgICB2YXIgZCA9IEQuZ2V0UGFyc2VkRGF0ZShkYXRlKSxcbiAgICAgICAgICAgICAgICBkZWNhZGUgPSBELmdldERlY2FkZShkYXRlKSxcbiAgICAgICAgICAgICAgICBmaXJzdFllYXIgPSBkZWNhZGVbMF0gLSAxLFxuICAgICAgICAgICAgICAgIGh0bWwgPSAnJyxcbiAgICAgICAgICAgICAgICBpID0gZmlyc3RZZWFyO1xuXG4gICAgICAgICAgICBmb3IgKGk7IGkgPD0gZGVjYWRlWzFdICsgMTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaHRtbCArPSB0aGlzLl9nZXRZZWFySHRtbChuZXcgRGF0ZShpICwgMCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0WWVhckh0bWw6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgICAgICB2YXIgY29udGVudCA9IHRoaXMuX2dldENlbGxDb250ZW50cyhkYXRlLCAneWVhcicpO1xuXG4gICAgICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCInICsgY29udGVudC5jbGFzc2VzICsgJ1wiIGRhdGEteWVhcj1cIicgKyBkYXRlLmdldEZ1bGxZZWFyKCkgKyAnXCI+JyArIGNvbnRlbnQuaHRtbCArICc8L2Rpdj4nXG4gICAgICAgIH0sXG5cbiAgICAgICAgX3JlbmRlclR5cGVzOiB7XG4gICAgICAgICAgICBkYXlzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRheU5hbWVzID0gdGhpcy5fZ2V0RGF5TmFtZXNIdG1sKHRoaXMuZC5sb2MuZmlyc3REYXkpLFxuICAgICAgICAgICAgICAgICAgICBkYXlzID0gdGhpcy5fZ2V0RGF5c0h0bWwodGhpcy5kLmN1cnJlbnREYXRlKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuJGNlbGxzLmh0bWwoZGF5cyk7XG4gICAgICAgICAgICAgICAgdGhpcy4kbmFtZXMuaHRtbChkYXlOYW1lcylcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtb250aHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IHRoaXMuX2dldE1vbnRoc0h0bWwodGhpcy5kLmN1cnJlbnREYXRlKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuJGNlbGxzLmh0bWwoaHRtbClcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB5ZWFyczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBodG1sID0gdGhpcy5fZ2V0WWVhcnNIdG1sKHRoaXMuZC5jdXJyZW50RGF0ZSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLiRjZWxscy5odG1sKGh0bWwpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3JlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyVHlwZXNbdGhpcy50eXBlXS5iaW5kKHRoaXMpKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3VwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyICRjZWxscyA9ICQoJy5kYXRlcGlja2VyLS1jZWxsJywgdGhpcy4kY2VsbHMpLFxuICAgICAgICAgICAgICAgIF90aGlzID0gdGhpcyxcbiAgICAgICAgICAgICAgICBjbGFzc2VzLFxuICAgICAgICAgICAgICAgICRjZWxsLFxuICAgICAgICAgICAgICAgIGRhdGU7XG4gICAgICAgICAgICAkY2VsbHMuZWFjaChmdW5jdGlvbiAoY2VsbCwgaSkge1xuICAgICAgICAgICAgICAgICRjZWxsID0gJCh0aGlzKTtcbiAgICAgICAgICAgICAgICBkYXRlID0gX3RoaXMuZC5fZ2V0RGF0ZUZyb21DZWxsKCQodGhpcykpO1xuICAgICAgICAgICAgICAgIGNsYXNzZXMgPSBfdGhpcy5fZ2V0Q2VsbENvbnRlbnRzKGRhdGUsIF90aGlzLmQuY2VsbFR5cGUpO1xuICAgICAgICAgICAgICAgICRjZWxsLmF0dHIoJ2NsYXNzJyxjbGFzc2VzLmNsYXNzZXMpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICB0aGlzLmFjaXR2ZSA9IHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGlkZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyAgRXZlbnRzXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgICAgICBfaGFuZGxlQ2xpY2s6IGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgdmFyIGRhdGUgPSBlbC5kYXRhKCdkYXRlJykgfHwgMSxcbiAgICAgICAgICAgICAgICBtb250aCA9IGVsLmRhdGEoJ21vbnRoJykgfHwgMCxcbiAgICAgICAgICAgICAgICB5ZWFyID0gZWwuZGF0YSgneWVhcicpIHx8IHRoaXMuZC5wYXJzZWREYXRlLnllYXI7XG4gICAgICAgICAgICAvLyBDaGFuZ2UgdmlldyBpZiBtaW4gdmlldyBkb2VzIG5vdCByZWFjaCB5ZXRcbiAgICAgICAgICAgIGlmICh0aGlzLmQudmlldyAhPSB0aGlzLm9wdHMubWluVmlldykge1xuICAgICAgICAgICAgICAgIHRoaXMuZC5kb3duKG5ldyBEYXRlKHllYXIsIG1vbnRoLCBkYXRlKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gU2VsZWN0IGRhdGUgaWYgbWluIHZpZXcgaXMgcmVhY2hlZFxuICAgICAgICAgICAgdmFyIHNlbGVjdGVkRGF0ZSA9IG5ldyBEYXRlKHllYXIsIG1vbnRoLCBkYXRlKSxcbiAgICAgICAgICAgICAgICBhbHJlYWR5U2VsZWN0ZWQgPSB0aGlzLmQuX2lzU2VsZWN0ZWQoc2VsZWN0ZWREYXRlLCB0aGlzLmQuY2VsbFR5cGUpO1xuXG4gICAgICAgICAgICBpZiAoIWFscmVhZHlTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZC5zZWxlY3REYXRlKHNlbGVjdGVkRGF0ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFscmVhZHlTZWxlY3RlZCAmJiB0aGlzLm9wdHMudG9nZ2xlU2VsZWN0ZWQpe1xuICAgICAgICAgICAgICAgIHRoaXMuZC5yZW1vdmVEYXRlKHNlbGVjdGVkRGF0ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSxcblxuICAgICAgICBfb25DbGlja0NlbGw6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgJGVsID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLmRhdGVwaWNrZXItLWNlbGwnKTtcblxuICAgICAgICAgICAgaWYgKCRlbC5oYXNDbGFzcygnLWRpc2FibGVkLScpKSByZXR1cm47XG5cbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZUNsaWNrLmJpbmQodGhpcykoJGVsKTtcbiAgICAgICAgfVxuICAgIH07XG59KSgpO1xuXG47KGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGVtcGxhdGUgPSAnJyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tbmF2LWFjdGlvblwiIGRhdGEtYWN0aW9uPVwicHJldlwiPiN7cHJldkh0bWx9PC9kaXY+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tbmF2LXRpdGxlXCI+I3t0aXRsZX08L2Rpdj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1uYXYtYWN0aW9uXCIgZGF0YS1hY3Rpb249XCJuZXh0XCI+I3tuZXh0SHRtbH08L2Rpdj4nLFxuICAgICAgICBidXR0b25zQ29udGFpbmVyVGVtcGxhdGUgPSAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLWJ1dHRvbnNcIj48L2Rpdj4nLFxuICAgICAgICBidXR0b24gPSAnPHNwYW4gY2xhc3M9XCJkYXRlcGlja2VyLS1idXR0b25cIiBkYXRhLWFjdGlvbj1cIiN7YWN0aW9ufVwiPiN7bGFiZWx9PC9zcGFuPic7XG5cbiAgICBEYXRlcGlja2VyLk5hdmlnYXRpb24gPSBmdW5jdGlvbiAoZCwgb3B0cykge1xuICAgICAgICB0aGlzLmQgPSBkO1xuICAgICAgICB0aGlzLm9wdHMgPSBvcHRzO1xuXG4gICAgICAgIHRoaXMuJGJ1dHRvbnNDb250YWluZXIgPSAnJztcblxuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICB9O1xuXG4gICAgRGF0ZXBpY2tlci5OYXZpZ2F0aW9uLnByb3RvdHlwZSA9IHtcbiAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fYnVpbGRCYXNlSHRtbCgpO1xuICAgICAgICAgICAgdGhpcy5fYmluZEV2ZW50cygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9iaW5kRXZlbnRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmQuJG5hdi5vbignY2xpY2snLCAnLmRhdGVwaWNrZXItLW5hdi1hY3Rpb24nLCAkLnByb3h5KHRoaXMuX29uQ2xpY2tOYXZCdXR0b24sIHRoaXMpKTtcbiAgICAgICAgICAgIHRoaXMuZC4kbmF2Lm9uKCdjbGljaycsICcuZGF0ZXBpY2tlci0tbmF2LXRpdGxlJywgJC5wcm94eSh0aGlzLl9vbkNsaWNrTmF2VGl0bGUsIHRoaXMpKTtcbiAgICAgICAgICAgIHRoaXMuZC4kZGF0ZXBpY2tlci5vbignY2xpY2snLCAnLmRhdGVwaWNrZXItLWJ1dHRvbicsICQucHJveHkodGhpcy5fb25DbGlja05hdkJ1dHRvbiwgdGhpcykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9idWlsZEJhc2VIdG1sOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXIoKTtcbiAgICAgICAgICAgIHRoaXMuX2FkZEJ1dHRvbnNJZk5lZWQoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfYWRkQnV0dG9uc0lmTmVlZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy50b2RheUJ1dHRvbikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZEJ1dHRvbigndG9kYXknKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5jbGVhckJ1dHRvbikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZEJ1dHRvbignY2xlYXInKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9yZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aXRsZSA9IHRoaXMuX2dldFRpdGxlKHRoaXMuZC5jdXJyZW50RGF0ZSksXG4gICAgICAgICAgICAgICAgaHRtbCA9IERhdGVwaWNrZXIudGVtcGxhdGUodGVtcGxhdGUsICQuZXh0ZW5kKHt0aXRsZTogdGl0bGV9LCB0aGlzLm9wdHMpKTtcbiAgICAgICAgICAgIHRoaXMuZC4kbmF2Lmh0bWwoaHRtbCk7XG4gICAgICAgICAgICBpZiAodGhpcy5kLnZpZXcgPT0gJ3llYXJzJykge1xuICAgICAgICAgICAgICAgICQoJy5kYXRlcGlja2VyLS1uYXYtdGl0bGUnLCB0aGlzLmQuJG5hdikuYWRkQ2xhc3MoJy1kaXNhYmxlZC0nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0TmF2U3RhdHVzKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldFRpdGxlOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZC5mb3JtYXREYXRlKHRoaXMub3B0cy5uYXZUaXRsZXNbdGhpcy5kLnZpZXddLCBkYXRlKVxuICAgICAgICB9LFxuXG4gICAgICAgIF9hZGRCdXR0b246IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuJGJ1dHRvbnNDb250YWluZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkQnV0dG9uc0NvbnRhaW5lcigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiB0eXBlLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogdGhpcy5kLmxvY1t0eXBlXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaHRtbCA9IERhdGVwaWNrZXIudGVtcGxhdGUoYnV0dG9uLCBkYXRhKTtcblxuICAgICAgICAgICAgaWYgKCQoJ1tkYXRhLWFjdGlvbj0nICsgdHlwZSArICddJywgdGhpcy4kYnV0dG9uc0NvbnRhaW5lcikubGVuZ3RoKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLiRidXR0b25zQ29udGFpbmVyLmFwcGVuZChodG1sKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfYWRkQnV0dG9uc0NvbnRhaW5lcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5kLiRkYXRlcGlja2VyLmFwcGVuZChidXR0b25zQ29udGFpbmVyVGVtcGxhdGUpO1xuICAgICAgICAgICAgdGhpcy4kYnV0dG9uc0NvbnRhaW5lciA9ICQoJy5kYXRlcGlja2VyLS1idXR0b25zJywgdGhpcy5kLiRkYXRlcGlja2VyKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXROYXZTdGF0dXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghKHRoaXMub3B0cy5taW5EYXRlIHx8IHRoaXMub3B0cy5tYXhEYXRlKSB8fCAhdGhpcy5vcHRzLmRpc2FibGVOYXZXaGVuT3V0T2ZSYW5nZSkgcmV0dXJuO1xuXG4gICAgICAgICAgICB2YXIgZGF0ZSA9IHRoaXMuZC5wYXJzZWREYXRlLFxuICAgICAgICAgICAgICAgIG0gPSBkYXRlLm1vbnRoLFxuICAgICAgICAgICAgICAgIHkgPSBkYXRlLnllYXIsXG4gICAgICAgICAgICAgICAgZCA9IGRhdGUuZGF0ZTtcblxuICAgICAgICAgICAgc3dpdGNoICh0aGlzLmQudmlldykge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2RheXMnOlxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZC5faXNJblJhbmdlKG5ldyBEYXRlKHksIG0tMSwgZCksICdtb250aCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlTmF2KCdwcmV2JylcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZC5faXNJblJhbmdlKG5ldyBEYXRlKHksIG0rMSwgZCksICdtb250aCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlTmF2KCduZXh0JylcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdtb250aHMnOlxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZC5faXNJblJhbmdlKG5ldyBEYXRlKHktMSwgbSwgZCksICd5ZWFyJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVOYXYoJ3ByZXYnKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5kLl9pc0luUmFuZ2UobmV3IERhdGUoeSsxLCBtLCBkKSwgJ3llYXInKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZU5hdignbmV4dCcpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAneWVhcnMnOlxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZC5faXNJblJhbmdlKG5ldyBEYXRlKHktMTAsIG0sIGQpLCAneWVhcicpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlTmF2KCdwcmV2JylcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZC5faXNJblJhbmdlKG5ldyBEYXRlKHkrMTAsIG0sIGQpLCAneWVhcicpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlTmF2KCduZXh0JylcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfZGlzYWJsZU5hdjogZnVuY3Rpb24gKG5hdikge1xuICAgICAgICAgICAgJCgnW2RhdGEtYWN0aW9uPVwiJyArIG5hdiArICdcIl0nLCB0aGlzLmQuJG5hdikuYWRkQ2xhc3MoJy1kaXNhYmxlZC0nKVxuICAgICAgICB9LFxuXG4gICAgICAgIF9hY3RpdmF0ZU5hdjogZnVuY3Rpb24gKG5hdikge1xuICAgICAgICAgICAgJCgnW2RhdGEtYWN0aW9uPVwiJyArIG5hdiArICdcIl0nLCB0aGlzLmQuJG5hdikucmVtb3ZlQ2xhc3MoJy1kaXNhYmxlZC0nKVxuICAgICAgICB9LFxuXG4gICAgICAgIF9vbkNsaWNrTmF2QnV0dG9uOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyICRlbCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ1tkYXRhLWFjdGlvbl0nKSxcbiAgICAgICAgICAgICAgICBhY3Rpb24gPSAkZWwuZGF0YSgnYWN0aW9uJyk7XG5cbiAgICAgICAgICAgIHRoaXMuZFthY3Rpb25dKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uQ2xpY2tOYXZUaXRsZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGlmICgkKGUudGFyZ2V0KS5oYXNDbGFzcygnLWRpc2FibGVkLScpKSByZXR1cm47XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmQudmlldyA9PSAnZGF5cycpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kLnZpZXcgPSAnbW9udGhzJ1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmQudmlldyA9ICd5ZWFycyc7XG4gICAgICAgIH1cbiAgICB9XG5cbn0pKCk7XG4iLCIhZnVuY3Rpb24oYSxiKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtcImpxdWVyeVwiXSxiKTpcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1iKHJlcXVpcmUoXCJqcXVlcnlcIikpOmIoYS5qUXVlcnkpfSh0aGlzLGZ1bmN0aW9uKGEpe1wiZnVuY3Rpb25cIiE9dHlwZW9mIE9iamVjdC5jcmVhdGUmJihPYmplY3QuY3JlYXRlPWZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoKXt9cmV0dXJuIGIucHJvdG90eXBlPWEsbmV3IGJ9KTt2YXIgYj17aW5pdDpmdW5jdGlvbihiKXtyZXR1cm4gdGhpcy5vcHRpb25zPWEuZXh0ZW5kKHt9LGEubm90eS5kZWZhdWx0cyxiKSx0aGlzLm9wdGlvbnMubGF5b3V0PXRoaXMub3B0aW9ucy5jdXN0b20/YS5ub3R5LmxheW91dHMuaW5saW5lOmEubm90eS5sYXlvdXRzW3RoaXMub3B0aW9ucy5sYXlvdXRdLGEubm90eS50aGVtZXNbdGhpcy5vcHRpb25zLnRoZW1lXT90aGlzLm9wdGlvbnMudGhlbWU9YS5ub3R5LnRoZW1lc1t0aGlzLm9wdGlvbnMudGhlbWVdOnRoaXMub3B0aW9ucy50aGVtZUNsYXNzTmFtZT10aGlzLm9wdGlvbnMudGhlbWUsdGhpcy5vcHRpb25zPWEuZXh0ZW5kKHt9LHRoaXMub3B0aW9ucyx0aGlzLm9wdGlvbnMubGF5b3V0Lm9wdGlvbnMpLHRoaXMub3B0aW9ucy5pZD1cIm5vdHlfXCIrKG5ldyBEYXRlKS5nZXRUaW1lKCkqTWF0aC5mbG9vcigxZTYqTWF0aC5yYW5kb20oKSksdGhpcy5fYnVpbGQoKSx0aGlzfSxfYnVpbGQ6ZnVuY3Rpb24oKXt2YXIgYj1hKCc8ZGl2IGNsYXNzPVwibm90eV9iYXIgbm90eV90eXBlXycrdGhpcy5vcHRpb25zLnR5cGUrJ1wiPjwvZGl2PicpLmF0dHIoXCJpZFwiLHRoaXMub3B0aW9ucy5pZCk7aWYoYi5hcHBlbmQodGhpcy5vcHRpb25zLnRlbXBsYXRlKS5maW5kKFwiLm5vdHlfdGV4dFwiKS5odG1sKHRoaXMub3B0aW9ucy50ZXh0KSx0aGlzLiRiYXI9bnVsbCE9PXRoaXMub3B0aW9ucy5sYXlvdXQucGFyZW50Lm9iamVjdD9hKHRoaXMub3B0aW9ucy5sYXlvdXQucGFyZW50Lm9iamVjdCkuY3NzKHRoaXMub3B0aW9ucy5sYXlvdXQucGFyZW50LmNzcykuYXBwZW5kKGIpOmIsdGhpcy5vcHRpb25zLnRoZW1lQ2xhc3NOYW1lJiZ0aGlzLiRiYXIuYWRkQ2xhc3ModGhpcy5vcHRpb25zLnRoZW1lQ2xhc3NOYW1lKS5hZGRDbGFzcyhcIm5vdHlfY29udGFpbmVyX3R5cGVfXCIrdGhpcy5vcHRpb25zLnR5cGUpLHRoaXMub3B0aW9ucy5idXR0b25zKXt0aGlzLm9wdGlvbnMuY2xvc2VXaXRoPVtdLHRoaXMub3B0aW9ucy50aW1lb3V0PSExO3ZhciBjPWEoXCI8ZGl2Lz5cIikuYWRkQ2xhc3MoXCJub3R5X2J1dHRvbnNcIik7bnVsbCE9PXRoaXMub3B0aW9ucy5sYXlvdXQucGFyZW50Lm9iamVjdD90aGlzLiRiYXIuZmluZChcIi5ub3R5X2JhclwiKS5hcHBlbmQoYyk6dGhpcy4kYmFyLmFwcGVuZChjKTt2YXIgZD10aGlzO2EuZWFjaCh0aGlzLm9wdGlvbnMuYnV0dG9ucyxmdW5jdGlvbihiLGMpe3ZhciBlPWEoXCI8YnV0dG9uLz5cIikuYWRkQ2xhc3MoYy5hZGRDbGFzcz9jLmFkZENsYXNzOlwiZ3JheVwiKS5odG1sKGMudGV4dCkuYXR0cihcImlkXCIsYy5pZD9jLmlkOlwiYnV0dG9uLVwiK2IpLmF0dHIoXCJ0aXRsZVwiLGMudGl0bGUpLmFwcGVuZFRvKGQuJGJhci5maW5kKFwiLm5vdHlfYnV0dG9uc1wiKSkub24oXCJjbGlja1wiLGZ1bmN0aW9uKGIpe2EuaXNGdW5jdGlvbihjLm9uQ2xpY2spJiZjLm9uQ2xpY2suY2FsbChlLGQsYil9KX0pfXRoaXMuJG1lc3NhZ2U9dGhpcy4kYmFyLmZpbmQoXCIubm90eV9tZXNzYWdlXCIpLHRoaXMuJGNsb3NlQnV0dG9uPXRoaXMuJGJhci5maW5kKFwiLm5vdHlfY2xvc2VcIiksdGhpcy4kYnV0dG9ucz10aGlzLiRiYXIuZmluZChcIi5ub3R5X2J1dHRvbnNcIiksYS5ub3R5LnN0b3JlW3RoaXMub3B0aW9ucy5pZF09dGhpc30sc2hvdzpmdW5jdGlvbigpe3ZhciBiPXRoaXM7cmV0dXJuIGIub3B0aW9ucy5jdXN0b20/Yi5vcHRpb25zLmN1c3RvbS5maW5kKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5hcHBlbmQoYi4kYmFyKTphKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5hcHBlbmQoYi4kYmFyKSxiLm9wdGlvbnMudGhlbWUmJmIub3B0aW9ucy50aGVtZS5zdHlsZSYmYi5vcHRpb25zLnRoZW1lLnN0eWxlLmFwcGx5KGIpLFwiZnVuY3Rpb25cIj09PWEudHlwZShiLm9wdGlvbnMubGF5b3V0LmNzcyk/dGhpcy5vcHRpb25zLmxheW91dC5jc3MuYXBwbHkoYi4kYmFyKTpiLiRiYXIuY3NzKHRoaXMub3B0aW9ucy5sYXlvdXQuY3NzfHx7fSksYi4kYmFyLmFkZENsYXNzKGIub3B0aW9ucy5sYXlvdXQuYWRkQ2xhc3MpLGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnN0eWxlLmFwcGx5KGEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLFtiLm9wdGlvbnMud2l0aGluXSksYi5zaG93aW5nPSEwLGIub3B0aW9ucy50aGVtZSYmYi5vcHRpb25zLnRoZW1lLnN0eWxlJiZiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2sub25TaG93LmFwcGx5KHRoaXMpLGEuaW5BcnJheShcImNsaWNrXCIsYi5vcHRpb25zLmNsb3NlV2l0aCk+LTEmJmIuJGJhci5jc3MoXCJjdXJzb3JcIixcInBvaW50ZXJcIikub25lKFwiY2xpY2tcIixmdW5jdGlvbihhKXtiLnN0b3BQcm9wYWdhdGlvbihhKSxiLm9wdGlvbnMuY2FsbGJhY2sub25DbG9zZUNsaWNrJiZiLm9wdGlvbnMuY2FsbGJhY2sub25DbG9zZUNsaWNrLmFwcGx5KGIpLGIuY2xvc2UoKX0pLGEuaW5BcnJheShcImhvdmVyXCIsYi5vcHRpb25zLmNsb3NlV2l0aCk+LTEmJmIuJGJhci5vbmUoXCJtb3VzZWVudGVyXCIsZnVuY3Rpb24oKXtiLmNsb3NlKCl9KSxhLmluQXJyYXkoXCJidXR0b25cIixiLm9wdGlvbnMuY2xvc2VXaXRoKT4tMSYmYi4kY2xvc2VCdXR0b24ub25lKFwiY2xpY2tcIixmdW5jdGlvbihhKXtiLnN0b3BQcm9wYWdhdGlvbihhKSxiLmNsb3NlKCl9KSwtMT09YS5pbkFycmF5KFwiYnV0dG9uXCIsYi5vcHRpb25zLmNsb3NlV2l0aCkmJmIuJGNsb3NlQnV0dG9uLnJlbW92ZSgpLGIub3B0aW9ucy5jYWxsYmFjay5vblNob3cmJmIub3B0aW9ucy5jYWxsYmFjay5vblNob3cuYXBwbHkoYiksXCJzdHJpbmdcIj09dHlwZW9mIGIub3B0aW9ucy5hbmltYXRpb24ub3Blbj8oYi4kYmFyLmNzcyhcImhlaWdodFwiLGIuJGJhci5pbm5lckhlaWdodCgpKSxiLiRiYXIub24oXCJjbGlja1wiLGZ1bmN0aW9uKGEpe2Iud2FzQ2xpY2tlZD0hMH0pLGIuJGJhci5zaG93KCkuYWRkQ2xhc3MoYi5vcHRpb25zLmFuaW1hdGlvbi5vcGVuKS5vbmUoXCJ3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kXCIsZnVuY3Rpb24oKXtiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJTaG93JiZiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJTaG93LmFwcGx5KGIpLGIuc2hvd2luZz0hMSxiLnNob3duPSEwLGIuaGFzT3duUHJvcGVydHkoXCJ3YXNDbGlja2VkXCIpJiYoYi4kYmFyLm9mZihcImNsaWNrXCIsZnVuY3Rpb24oYSl7Yi53YXNDbGlja2VkPSEwfSksYi5jbG9zZSgpKX0pKTpiLiRiYXIuYW5pbWF0ZShiLm9wdGlvbnMuYW5pbWF0aW9uLm9wZW4sYi5vcHRpb25zLmFuaW1hdGlvbi5zcGVlZCxiLm9wdGlvbnMuYW5pbWF0aW9uLmVhc2luZyxmdW5jdGlvbigpe2Iub3B0aW9ucy5jYWxsYmFjay5hZnRlclNob3cmJmIub3B0aW9ucy5jYWxsYmFjay5hZnRlclNob3cuYXBwbHkoYiksYi5zaG93aW5nPSExLGIuc2hvd249ITB9KSxiLm9wdGlvbnMudGltZW91dCYmYi4kYmFyLmRlbGF5KGIub3B0aW9ucy50aW1lb3V0KS5wcm9taXNlKCkuZG9uZShmdW5jdGlvbigpe2IuY2xvc2UoKX0pLHRoaXN9LGNsb3NlOmZ1bmN0aW9uKCl7aWYoISh0aGlzLmNsb3NlZHx8dGhpcy4kYmFyJiZ0aGlzLiRiYXIuaGFzQ2xhc3MoXCJpLWFtLWNsb3Npbmctbm93XCIpKSl7dmFyIGI9dGhpcztpZih0aGlzLnNob3dpbmcpcmV0dXJuIHZvaWQgYi4kYmFyLnF1ZXVlKGZ1bmN0aW9uKCl7Yi5jbG9zZS5hcHBseShiKX0pO2lmKCF0aGlzLnNob3duJiYhdGhpcy5zaG93aW5nKXt2YXIgYz1bXTtyZXR1cm4gYS5lYWNoKGEubm90eS5xdWV1ZSxmdW5jdGlvbihhLGQpe2Qub3B0aW9ucy5pZCE9Yi5vcHRpb25zLmlkJiZjLnB1c2goZCl9KSx2b2lkKGEubm90eS5xdWV1ZT1jKX1iLiRiYXIuYWRkQ2xhc3MoXCJpLWFtLWNsb3Npbmctbm93XCIpLGIub3B0aW9ucy5jYWxsYmFjay5vbkNsb3NlJiZiLm9wdGlvbnMuY2FsbGJhY2sub25DbG9zZS5hcHBseShiKSxcInN0cmluZ1wiPT10eXBlb2YgYi5vcHRpb25zLmFuaW1hdGlvbi5jbG9zZT9iLiRiYXIuYWRkQ2xhc3MoYi5vcHRpb25zLmFuaW1hdGlvbi5jbG9zZSkub25lKFwid2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZFwiLGZ1bmN0aW9uKCl7Yi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyQ2xvc2UmJmIub3B0aW9ucy5jYWxsYmFjay5hZnRlckNsb3NlLmFwcGx5KGIpLGIuY2xvc2VDbGVhblVwKCl9KTpiLiRiYXIuY2xlYXJRdWV1ZSgpLnN0b3AoKS5hbmltYXRlKGIub3B0aW9ucy5hbmltYXRpb24uY2xvc2UsYi5vcHRpb25zLmFuaW1hdGlvbi5zcGVlZCxiLm9wdGlvbnMuYW5pbWF0aW9uLmVhc2luZyxmdW5jdGlvbigpe2Iub3B0aW9ucy5jYWxsYmFjay5hZnRlckNsb3NlJiZiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJDbG9zZS5hcHBseShiKX0pLnByb21pc2UoKS5kb25lKGZ1bmN0aW9uKCl7Yi5jbG9zZUNsZWFuVXAoKX0pfX0sY2xvc2VDbGVhblVwOmZ1bmN0aW9uKCl7dmFyIGI9dGhpcztiLm9wdGlvbnMubW9kYWwmJihhLm5vdHlSZW5kZXJlci5zZXRNb2RhbENvdW50KC0xKSwwPT1hLm5vdHlSZW5kZXJlci5nZXRNb2RhbENvdW50KCkmJmEoXCIubm90eV9tb2RhbFwiKS5mYWRlT3V0KGIub3B0aW9ucy5hbmltYXRpb24uZmFkZVNwZWVkLGZ1bmN0aW9uKCl7YSh0aGlzKS5yZW1vdmUoKX0pKSxhLm5vdHlSZW5kZXJlci5zZXRMYXlvdXRDb3VudEZvcihiLC0xKSwwPT1hLm5vdHlSZW5kZXJlci5nZXRMYXlvdXRDb3VudEZvcihiKSYmYShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikucmVtb3ZlKCksXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGIuJGJhciYmbnVsbCE9PWIuJGJhciYmKFwic3RyaW5nXCI9PXR5cGVvZiBiLm9wdGlvbnMuYW5pbWF0aW9uLmNsb3NlPyhiLiRiYXIuY3NzKFwidHJhbnNpdGlvblwiLFwiYWxsIDEwMG1zIGVhc2VcIikuY3NzKFwiYm9yZGVyXCIsMCkuY3NzKFwibWFyZ2luXCIsMCkuaGVpZ2h0KDApLGIuJGJhci5vbmUoXCJ0cmFuc2l0aW9uZW5kIHdlYmtpdFRyYW5zaXRpb25FbmQgb1RyYW5zaXRpb25FbmQgTVNUcmFuc2l0aW9uRW5kXCIsZnVuY3Rpb24oKXtiLiRiYXIucmVtb3ZlKCksYi4kYmFyPW51bGwsYi5jbG9zZWQ9ITAsYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrJiZiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2sub25DbG9zZSYmYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrLm9uQ2xvc2UuYXBwbHkoYil9KSk6KGIuJGJhci5yZW1vdmUoKSxiLiRiYXI9bnVsbCxiLmNsb3NlZD0hMCkpLGRlbGV0ZSBhLm5vdHkuc3RvcmVbYi5vcHRpb25zLmlkXSxiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2smJmIub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vbkNsb3NlJiZiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2sub25DbG9zZS5hcHBseShiKSxiLm9wdGlvbnMuZGlzbWlzc1F1ZXVlfHwoYS5ub3R5Lm9udGFwPSEwLGEubm90eVJlbmRlcmVyLnJlbmRlcigpKSxiLm9wdGlvbnMubWF4VmlzaWJsZT4wJiZiLm9wdGlvbnMuZGlzbWlzc1F1ZXVlJiZhLm5vdHlSZW5kZXJlci5yZW5kZXIoKX0sc2V0VGV4dDpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5jbG9zZWR8fCh0aGlzLm9wdGlvbnMudGV4dD1hLHRoaXMuJGJhci5maW5kKFwiLm5vdHlfdGV4dFwiKS5odG1sKGEpKSx0aGlzfSxzZXRUeXBlOmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLmNsb3NlZHx8KHRoaXMub3B0aW9ucy50eXBlPWEsdGhpcy5vcHRpb25zLnRoZW1lLnN0eWxlLmFwcGx5KHRoaXMpLHRoaXMub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vblNob3cuYXBwbHkodGhpcykpLHRoaXN9LHNldFRpbWVvdXQ6ZnVuY3Rpb24oYSl7aWYoIXRoaXMuY2xvc2VkKXt2YXIgYj10aGlzO3RoaXMub3B0aW9ucy50aW1lb3V0PWEsYi4kYmFyLmRlbGF5KGIub3B0aW9ucy50aW1lb3V0KS5wcm9taXNlKCkuZG9uZShmdW5jdGlvbigpe2IuY2xvc2UoKX0pfXJldHVybiB0aGlzfSxzdG9wUHJvcGFnYXRpb246ZnVuY3Rpb24oYSl7YT1hfHx3aW5kb3cuZXZlbnQsXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGEuc3RvcFByb3BhZ2F0aW9uP2Euc3RvcFByb3BhZ2F0aW9uKCk6YS5jYW5jZWxCdWJibGU9ITB9LGNsb3NlZDohMSxzaG93aW5nOiExLHNob3duOiExfTthLm5vdHlSZW5kZXJlcj17fSxhLm5vdHlSZW5kZXJlci5pbml0PWZ1bmN0aW9uKGMpe3ZhciBkPU9iamVjdC5jcmVhdGUoYikuaW5pdChjKTtyZXR1cm4gZC5vcHRpb25zLmtpbGxlciYmYS5ub3R5LmNsb3NlQWxsKCksZC5vcHRpb25zLmZvcmNlP2Eubm90eS5xdWV1ZS51bnNoaWZ0KGQpOmEubm90eS5xdWV1ZS5wdXNoKGQpLGEubm90eVJlbmRlcmVyLnJlbmRlcigpLFwib2JqZWN0XCI9PWEubm90eS5yZXR1cm5zP2Q6ZC5vcHRpb25zLmlkfSxhLm5vdHlSZW5kZXJlci5yZW5kZXI9ZnVuY3Rpb24oKXt2YXIgYj1hLm5vdHkucXVldWVbMF07XCJvYmplY3RcIj09PWEudHlwZShiKT9iLm9wdGlvbnMuZGlzbWlzc1F1ZXVlP2Iub3B0aW9ucy5tYXhWaXNpYmxlPjA/YShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcitcIiA+IGxpXCIpLmxlbmd0aDxiLm9wdGlvbnMubWF4VmlzaWJsZSYmYS5ub3R5UmVuZGVyZXIuc2hvdyhhLm5vdHkucXVldWUuc2hpZnQoKSk6YS5ub3R5UmVuZGVyZXIuc2hvdyhhLm5vdHkucXVldWUuc2hpZnQoKSk6YS5ub3R5Lm9udGFwJiYoYS5ub3R5UmVuZGVyZXIuc2hvdyhhLm5vdHkucXVldWUuc2hpZnQoKSksYS5ub3R5Lm9udGFwPSExKTphLm5vdHkub250YXA9ITB9LGEubm90eVJlbmRlcmVyLnNob3c9ZnVuY3Rpb24oYil7Yi5vcHRpb25zLm1vZGFsJiYoYS5ub3R5UmVuZGVyZXIuY3JlYXRlTW9kYWxGb3IoYiksYS5ub3R5UmVuZGVyZXIuc2V0TW9kYWxDb3VudCgxKSksYi5vcHRpb25zLmN1c3RvbT8wPT1iLm9wdGlvbnMuY3VzdG9tLmZpbmQoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmxlbmd0aD9iLm9wdGlvbnMuY3VzdG9tLmFwcGVuZChhKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLm9iamVjdCkuYWRkQ2xhc3MoXCJpLWFtLW5ld1wiKSk6Yi5vcHRpb25zLmN1c3RvbS5maW5kKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5yZW1vdmVDbGFzcyhcImktYW0tbmV3XCIpOjA9PWEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmxlbmd0aD9hKFwiYm9keVwiKS5hcHBlbmQoYShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5vYmplY3QpLmFkZENsYXNzKFwiaS1hbS1uZXdcIikpOmEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLnJlbW92ZUNsYXNzKFwiaS1hbS1uZXdcIiksYS5ub3R5UmVuZGVyZXIuc2V0TGF5b3V0Q291bnRGb3IoYiwxKSxiLnNob3coKX0sYS5ub3R5UmVuZGVyZXIuY3JlYXRlTW9kYWxGb3I9ZnVuY3Rpb24oYil7aWYoMD09YShcIi5ub3R5X21vZGFsXCIpLmxlbmd0aCl7dmFyIGM9YShcIjxkaXYvPlwiKS5hZGRDbGFzcyhcIm5vdHlfbW9kYWxcIikuYWRkQ2xhc3MoYi5vcHRpb25zLnRoZW1lKS5kYXRhKFwibm90eV9tb2RhbF9jb3VudFwiLDApO2Iub3B0aW9ucy50aGVtZS5tb2RhbCYmYi5vcHRpb25zLnRoZW1lLm1vZGFsLmNzcyYmYy5jc3MoYi5vcHRpb25zLnRoZW1lLm1vZGFsLmNzcyksYy5wcmVwZW5kVG8oYShcImJvZHlcIikpLmZhZGVJbihiLm9wdGlvbnMuYW5pbWF0aW9uLmZhZGVTcGVlZCksYS5pbkFycmF5KFwiYmFja2Ryb3BcIixiLm9wdGlvbnMuY2xvc2VXaXRoKT4tMSYmYy5vbihcImNsaWNrXCIsZnVuY3Rpb24oYil7YS5ub3R5LmNsb3NlQWxsKCl9KX19LGEubm90eVJlbmRlcmVyLmdldExheW91dENvdW50Rm9yPWZ1bmN0aW9uKGIpe3JldHVybiBhKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5kYXRhKFwibm90eV9sYXlvdXRfY291bnRcIil8fDB9LGEubm90eVJlbmRlcmVyLnNldExheW91dENvdW50Rm9yPWZ1bmN0aW9uKGIsYyl7cmV0dXJuIGEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmRhdGEoXCJub3R5X2xheW91dF9jb3VudFwiLGEubm90eVJlbmRlcmVyLmdldExheW91dENvdW50Rm9yKGIpK2MpfSxhLm5vdHlSZW5kZXJlci5nZXRNb2RhbENvdW50PWZ1bmN0aW9uKCl7cmV0dXJuIGEoXCIubm90eV9tb2RhbFwiKS5kYXRhKFwibm90eV9tb2RhbF9jb3VudFwiKXx8MH0sYS5ub3R5UmVuZGVyZXIuc2V0TW9kYWxDb3VudD1mdW5jdGlvbihiKXtyZXR1cm4gYShcIi5ub3R5X21vZGFsXCIpLmRhdGEoXCJub3R5X21vZGFsX2NvdW50XCIsYS5ub3R5UmVuZGVyZXIuZ2V0TW9kYWxDb3VudCgpK2IpfSxhLmZuLm5vdHk9ZnVuY3Rpb24oYil7cmV0dXJuIGIuY3VzdG9tPWEodGhpcyksYS5ub3R5UmVuZGVyZXIuaW5pdChiKX0sYS5ub3R5PXt9LGEubm90eS5xdWV1ZT1bXSxhLm5vdHkub250YXA9ITAsYS5ub3R5LmxheW91dHM9e30sYS5ub3R5LnRoZW1lcz17fSxhLm5vdHkucmV0dXJucz1cIm9iamVjdFwiLGEubm90eS5zdG9yZT17fSxhLm5vdHkuZ2V0PWZ1bmN0aW9uKGIpe3JldHVybiBhLm5vdHkuc3RvcmUuaGFzT3duUHJvcGVydHkoYik/YS5ub3R5LnN0b3JlW2JdOiExfSxhLm5vdHkuY2xvc2U9ZnVuY3Rpb24oYil7cmV0dXJuIGEubm90eS5nZXQoYik/YS5ub3R5LmdldChiKS5jbG9zZSgpOiExfSxhLm5vdHkuc2V0VGV4dD1mdW5jdGlvbihiLGMpe3JldHVybiBhLm5vdHkuZ2V0KGIpP2Eubm90eS5nZXQoYikuc2V0VGV4dChjKTohMX0sYS5ub3R5LnNldFR5cGU9ZnVuY3Rpb24oYixjKXtyZXR1cm4gYS5ub3R5LmdldChiKT9hLm5vdHkuZ2V0KGIpLnNldFR5cGUoYyk6ITF9LGEubm90eS5jbGVhclF1ZXVlPWZ1bmN0aW9uKCl7YS5ub3R5LnF1ZXVlPVtdfSxhLm5vdHkuY2xvc2VBbGw9ZnVuY3Rpb24oKXthLm5vdHkuY2xlYXJRdWV1ZSgpLGEuZWFjaChhLm5vdHkuc3RvcmUsZnVuY3Rpb24oYSxiKXtiLmNsb3NlKCl9KX07dmFyIGM9d2luZG93LmFsZXJ0O3JldHVybiBhLm5vdHkuY29uc3VtZUFsZXJ0PWZ1bmN0aW9uKGIpe3dpbmRvdy5hbGVydD1mdW5jdGlvbihjKXtiP2IudGV4dD1jOmI9e3RleHQ6Y30sYS5ub3R5UmVuZGVyZXIuaW5pdChiKX19LGEubm90eS5zdG9wQ29uc3VtZUFsZXJ0PWZ1bmN0aW9uKCl7d2luZG93LmFsZXJ0PWN9LGEubm90eS5kZWZhdWx0cz17bGF5b3V0OlwidG9wXCIsdGhlbWU6XCJkZWZhdWx0VGhlbWVcIix0eXBlOlwiYWxlcnRcIix0ZXh0OlwiXCIsZGlzbWlzc1F1ZXVlOiEwLHRlbXBsYXRlOic8ZGl2IGNsYXNzPVwibm90eV9tZXNzYWdlXCI+PHNwYW4gY2xhc3M9XCJub3R5X3RleHRcIj48L3NwYW4+PGRpdiBjbGFzcz1cIm5vdHlfY2xvc2VcIj48L2Rpdj48L2Rpdj4nLGFuaW1hdGlvbjp7b3Blbjp7aGVpZ2h0OlwidG9nZ2xlXCJ9LGNsb3NlOntoZWlnaHQ6XCJ0b2dnbGVcIn0sZWFzaW5nOlwic3dpbmdcIixzcGVlZDo1MDAsZmFkZVNwZWVkOlwiZmFzdFwifSx0aW1lb3V0OiExLGZvcmNlOiExLG1vZGFsOiExLG1heFZpc2libGU6NSxraWxsZXI6ITEsY2xvc2VXaXRoOltcImNsaWNrXCJdLGNhbGxiYWNrOntvblNob3c6ZnVuY3Rpb24oKXt9LGFmdGVyU2hvdzpmdW5jdGlvbigpe30sb25DbG9zZTpmdW5jdGlvbigpe30sYWZ0ZXJDbG9zZTpmdW5jdGlvbigpe30sb25DbG9zZUNsaWNrOmZ1bmN0aW9uKCl7fX0sYnV0dG9uczohMX0sYSh3aW5kb3cpLm9uKFwicmVzaXplXCIsZnVuY3Rpb24oKXthLmVhY2goYS5ub3R5LmxheW91dHMsZnVuY3Rpb24oYixjKXtjLmNvbnRhaW5lci5zdHlsZS5hcHBseShhKGMuY29udGFpbmVyLnNlbGVjdG9yKSl9KX0pLHdpbmRvdy5ub3R5PWZ1bmN0aW9uKGIpe3JldHVybiBhLm5vdHlSZW5kZXJlci5pbml0KGIpfSxhLm5vdHkubGF5b3V0cy5ib3R0b209e25hbWU6XCJib3R0b21cIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2JvdHRvbV9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9ib3R0b21fbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe2JvdHRvbTowLGxlZnQ6XCI1JVwiLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjkwJVwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6OTk5OTk5OX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmJvdHRvbUNlbnRlcj17bmFtZTpcImJvdHRvbUNlbnRlclwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfYm90dG9tQ2VudGVyX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2JvdHRvbUNlbnRlcl9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7Ym90dG9tOjIwLGxlZnQ6MCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSksYSh0aGlzKS5jc3Moe2xlZnQ6KGEod2luZG93KS53aWR0aCgpLWEodGhpcykub3V0ZXJXaWR0aCghMSkpLzIrXCJweFwifSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmJvdHRvbUxlZnQ9e25hbWU6XCJib3R0b21MZWZ0XCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9ib3R0b21MZWZ0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2JvdHRvbUxlZnRfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe2JvdHRvbToyMCxsZWZ0OjIwLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KSx3aW5kb3cuaW5uZXJXaWR0aDw2MDAmJmEodGhpcykuY3NzKHtsZWZ0OjV9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuYm90dG9tUmlnaHQ9e25hbWU6XCJib3R0b21SaWdodFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfYm90dG9tUmlnaHRfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfYm90dG9tUmlnaHRfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe2JvdHRvbToyMCxyaWdodDoyMCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSksd2luZG93LmlubmVyV2lkdGg8NjAwJiZhKHRoaXMpLmNzcyh7cmlnaHQ6NX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5jZW50ZXI9e25hbWU6XCJjZW50ZXJcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2NlbnRlcl9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9jZW50ZXJfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3Bvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KTt2YXIgYj1hKHRoaXMpLmNsb25lKCkuY3NzKHt2aXNpYmlsaXR5OlwiaGlkZGVuXCIsZGlzcGxheTpcImJsb2NrXCIscG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDowLGxlZnQ6MH0pLmF0dHIoXCJpZFwiLFwiZHVwZVwiKTthKFwiYm9keVwiKS5hcHBlbmQoYiksYi5maW5kKFwiLmktYW0tY2xvc2luZy1ub3dcIikucmVtb3ZlKCksYi5maW5kKFwibGlcIikuY3NzKFwiZGlzcGxheVwiLFwiYmxvY2tcIik7dmFyIGM9Yi5oZWlnaHQoKTtiLnJlbW92ZSgpLGEodGhpcykuaGFzQ2xhc3MoXCJpLWFtLW5ld1wiKT9hKHRoaXMpLmNzcyh7bGVmdDooYSh3aW5kb3cpLndpZHRoKCktYSh0aGlzKS5vdXRlcldpZHRoKCExKSkvMitcInB4XCIsdG9wOihhKHdpbmRvdykuaGVpZ2h0KCktYykvMitcInB4XCJ9KTphKHRoaXMpLmFuaW1hdGUoe2xlZnQ6KGEod2luZG93KS53aWR0aCgpLWEodGhpcykub3V0ZXJXaWR0aCghMSkpLzIrXCJweFwiLHRvcDooYSh3aW5kb3cpLmhlaWdodCgpLWMpLzIrXCJweFwifSw1MDApfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5jZW50ZXJMZWZ0PXtuYW1lOlwiY2VudGVyTGVmdFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfY2VudGVyTGVmdF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9jZW50ZXJMZWZ0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtsZWZ0OjIwLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KTt2YXIgYj1hKHRoaXMpLmNsb25lKCkuY3NzKHt2aXNpYmlsaXR5OlwiaGlkZGVuXCIsZGlzcGxheTpcImJsb2NrXCIscG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDowLGxlZnQ6MH0pLmF0dHIoXCJpZFwiLFwiZHVwZVwiKTthKFwiYm9keVwiKS5hcHBlbmQoYiksYi5maW5kKFwiLmktYW0tY2xvc2luZy1ub3dcIikucmVtb3ZlKCksYi5maW5kKFwibGlcIikuY3NzKFwiZGlzcGxheVwiLFwiYmxvY2tcIik7dmFyIGM9Yi5oZWlnaHQoKTtiLnJlbW92ZSgpLGEodGhpcykuaGFzQ2xhc3MoXCJpLWFtLW5ld1wiKT9hKHRoaXMpLmNzcyh7dG9wOihhKHdpbmRvdykuaGVpZ2h0KCktYykvMitcInB4XCJ9KTphKHRoaXMpLmFuaW1hdGUoe3RvcDooYSh3aW5kb3cpLmhlaWdodCgpLWMpLzIrXCJweFwifSw1MDApLHdpbmRvdy5pbm5lcldpZHRoPDYwMCYmYSh0aGlzKS5jc3Moe2xlZnQ6NX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5jZW50ZXJSaWdodD17bmFtZTpcImNlbnRlclJpZ2h0XCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9jZW50ZXJSaWdodF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9jZW50ZXJSaWdodF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7cmlnaHQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pO3ZhciBiPWEodGhpcykuY2xvbmUoKS5jc3Moe3Zpc2liaWxpdHk6XCJoaWRkZW5cIixkaXNwbGF5OlwiYmxvY2tcIixwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOjAsbGVmdDowfSkuYXR0cihcImlkXCIsXCJkdXBlXCIpO2EoXCJib2R5XCIpLmFwcGVuZChiKSxiLmZpbmQoXCIuaS1hbS1jbG9zaW5nLW5vd1wiKS5yZW1vdmUoKSxiLmZpbmQoXCJsaVwiKS5jc3MoXCJkaXNwbGF5XCIsXCJibG9ja1wiKTt2YXIgYz1iLmhlaWdodCgpO2IucmVtb3ZlKCksYSh0aGlzKS5oYXNDbGFzcyhcImktYW0tbmV3XCIpP2EodGhpcykuY3NzKHt0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0pOmEodGhpcykuYW5pbWF0ZSh7dG9wOihhKHdpbmRvdykuaGVpZ2h0KCktYykvMitcInB4XCJ9LDUwMCksd2luZG93LmlubmVyV2lkdGg8NjAwJiZhKHRoaXMpLmNzcyh7cmlnaHQ6NX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5pbmxpbmU9e25hbWU6XCJpbmxpbmVcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgY2xhc3M9XCJub3R5X2lubGluZV9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwubm90eV9pbmxpbmVfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3dpZHRoOlwiMTAwJVwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6OTk5OTk5OX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLnRvcD17bmFtZTpcInRvcFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfdG9wX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X3RvcF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7dG9wOjAsbGVmdDpcIjUlXCIscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiOTAlXCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDo5OTk5OTk5fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMudG9wQ2VudGVyPXtuYW1lOlwidG9wQ2VudGVyXCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV90b3BDZW50ZXJfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfdG9wQ2VudGVyX2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHt0b3A6MjAsbGVmdDowLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KSxhKHRoaXMpLmNzcyh7bGVmdDooYSh3aW5kb3cpLndpZHRoKCktYSh0aGlzKS5vdXRlcldpZHRoKCExKSkvMitcInB4XCJ9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMudG9wTGVmdD17bmFtZTpcInRvcExlZnRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X3RvcExlZnRfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfdG9wTGVmdF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7dG9wOjIwLGxlZnQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLHdpbmRvdy5pbm5lcldpZHRoPDYwMCYmYSh0aGlzKS5jc3Moe2xlZnQ6NX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy50b3BSaWdodD17bmFtZTpcInRvcFJpZ2h0XCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV90b3BSaWdodF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV90b3BSaWdodF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7dG9wOjIwLHJpZ2h0OjIwLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KSx3aW5kb3cuaW5uZXJXaWR0aDw2MDAmJmEodGhpcykuY3NzKHtyaWdodDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS50aGVtZXMuYm9vdHN0cmFwVGhlbWU9e25hbWU6XCJib290c3RyYXBUaGVtZVwiLG1vZGFsOntjc3M6e3Bvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjEwMCVcIixoZWlnaHQ6XCIxMDAlXCIsYmFja2dyb3VuZENvbG9yOlwiIzAwMFwiLHpJbmRleDoxZTQsb3BhY2l0eTouNixkaXNwbGF5Olwibm9uZVwiLGxlZnQ6MCx0b3A6MH19LHN0eWxlOmZ1bmN0aW9uKCl7dmFyIGI9dGhpcy5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3I7c3dpdGNoKGEoYikuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwXCIpLHRoaXMuJGNsb3NlQnV0dG9uLmFwcGVuZCgnPHNwYW4gYXJpYS1oaWRkZW49XCJ0cnVlXCI+JnRpbWVzOzwvc3Bhbj48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5DbG9zZTwvc3Bhbj4nKSx0aGlzLiRjbG9zZUJ1dHRvbi5hZGRDbGFzcyhcImNsb3NlXCIpLHRoaXMuJGJhci5hZGRDbGFzcyhcImxpc3QtZ3JvdXAtaXRlbVwiKS5jc3MoXCJwYWRkaW5nXCIsXCIwcHhcIiksdGhpcy5vcHRpb25zLnR5cGUpe2Nhc2VcImFsZXJ0XCI6Y2FzZVwibm90aWZpY2F0aW9uXCI6dGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtLWluZm9cIik7YnJlYWs7Y2FzZVwid2FybmluZ1wiOnRoaXMuJGJhci5hZGRDbGFzcyhcImxpc3QtZ3JvdXAtaXRlbS13YXJuaW5nXCIpO2JyZWFrO2Nhc2VcImVycm9yXCI6dGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtLWRhbmdlclwiKTticmVhaztjYXNlXCJpbmZvcm1hdGlvblwiOnRoaXMuJGJhci5hZGRDbGFzcyhcImxpc3QtZ3JvdXAtaXRlbS1pbmZvXCIpO2JyZWFrO2Nhc2VcInN1Y2Nlc3NcIjp0aGlzLiRiYXIuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwLWl0ZW0tc3VjY2Vzc1wiKX10aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsbGluZUhlaWdodDpcIjE2cHhcIix0ZXh0QWxpZ246XCJjZW50ZXJcIixwYWRkaW5nOlwiOHB4IDEwcHggOXB4XCIsd2lkdGg6XCJhdXRvXCIscG9zaXRpb246XCJyZWxhdGl2ZVwifSl9LGNhbGxiYWNrOntvblNob3c6ZnVuY3Rpb24oKXt9LG9uQ2xvc2U6ZnVuY3Rpb24oKXt9fX0sYS5ub3R5LnRoZW1lcy5kZWZhdWx0VGhlbWU9e25hbWU6XCJkZWZhdWx0VGhlbWVcIixoZWxwZXJzOntib3JkZXJGaXg6ZnVuY3Rpb24oKXtpZih0aGlzLm9wdGlvbnMuZGlzbWlzc1F1ZXVlKXt2YXIgYj10aGlzLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcitcIiBcIit0aGlzLm9wdGlvbnMubGF5b3V0LnBhcmVudC5zZWxlY3Rvcjtzd2l0Y2godGhpcy5vcHRpb25zLmxheW91dC5uYW1lKXtjYXNlXCJ0b3BcIjphKGIpLmNzcyh7Ym9yZGVyUmFkaXVzOlwiMHB4IDBweCAwcHggMHB4XCJ9KSxhKGIpLmxhc3QoKS5jc3Moe2JvcmRlclJhZGl1czpcIjBweCAwcHggNXB4IDVweFwifSk7YnJlYWs7Y2FzZVwidG9wQ2VudGVyXCI6Y2FzZVwidG9wTGVmdFwiOmNhc2VcInRvcFJpZ2h0XCI6Y2FzZVwiYm90dG9tQ2VudGVyXCI6Y2FzZVwiYm90dG9tTGVmdFwiOmNhc2VcImJvdHRvbVJpZ2h0XCI6Y2FzZVwiY2VudGVyXCI6Y2FzZVwiY2VudGVyTGVmdFwiOmNhc2VcImNlbnRlclJpZ2h0XCI6Y2FzZVwiaW5saW5lXCI6YShiKS5jc3Moe2JvcmRlclJhZGl1czpcIjBweCAwcHggMHB4IDBweFwifSksYShiKS5maXJzdCgpLmNzcyh7XCJib3JkZXItdG9wLWxlZnQtcmFkaXVzXCI6XCI1cHhcIixcImJvcmRlci10b3AtcmlnaHQtcmFkaXVzXCI6XCI1cHhcIn0pLGEoYikubGFzdCgpLmNzcyh7XCJib3JkZXItYm90dG9tLWxlZnQtcmFkaXVzXCI6XCI1cHhcIixcImJvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzXCI6XCI1cHhcIn0pO2JyZWFrO2Nhc2VcImJvdHRvbVwiOmEoYikuY3NzKHtib3JkZXJSYWRpdXM6XCIwcHggMHB4IDBweCAwcHhcIn0pLGEoYikuZmlyc3QoKS5jc3Moe2JvcmRlclJhZGl1czpcIjVweCA1cHggMHB4IDBweFwifSl9fX19LG1vZGFsOntjc3M6e3Bvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjEwMCVcIixoZWlnaHQ6XCIxMDAlXCIsYmFja2dyb3VuZENvbG9yOlwiIzAwMFwiLHpJbmRleDoxZTQsb3BhY2l0eTouNixkaXNwbGF5Olwibm9uZVwiLGxlZnQ6MCx0b3A6MH19LHN0eWxlOmZ1bmN0aW9uKCl7c3dpdGNoKHRoaXMuJGJhci5jc3Moe292ZXJmbG93OlwiaGlkZGVuXCIsYmFja2dyb3VuZDpcInVybCgnZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFCc0FBQUFvQ0FRQUFBQ2xNMG5kQUFBQWhrbEVRVlI0QWRYTzBRckNNQkJFMGJ0dGtrMzgvdzhXUkVScGR5anpWT2MrSHhoSUhxSkdNUWNGRmtwWVJRb3RMTFN3MElKNWFCZG92cnVNWURBL2tUOHBsRjlaS0xGUWNnRjE4aERqMVNiUU9NbENBNGthbzBpaVhtYWg3cUJXUGR4cG9oc2dWWnlqN2U1STlLY0lEK0VoaURJNWd4QllLTEJRWUtIQVFvR0ZBb0Vrcy9ZRUdIWUtCN2hGeGYwQUFBQUFTVVZPUks1Q1lJST0nKSByZXBlYXQteCBzY3JvbGwgbGVmdCB0b3AgI2ZmZlwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTNweFwiLGxpbmVIZWlnaHQ6XCIxNnB4XCIsdGV4dEFsaWduOlwiY2VudGVyXCIscGFkZGluZzpcIjhweCAxMHB4IDlweFwiLHdpZHRoOlwiYXV0b1wiLHBvc2l0aW9uOlwicmVsYXRpdmVcIn0pLHRoaXMuJGNsb3NlQnV0dG9uLmNzcyh7cG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDo0LHJpZ2h0OjQsd2lkdGg6MTAsaGVpZ2h0OjEwLGJhY2tncm91bmQ6XCJ1cmwoZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBb0FBQUFLQ0FRQUFBQW5Pd2MyQUFBQXhVbEVRVlI0QVIzTVBVb0RVUlNBMGUrK3VTa2tPeEMzSUFPV050YUNJRGFDaGZnWEJNRVpiUVJCeXhDd2srQmFzZ1FSWkxTWW9MZ0RRYkFSeHJ5OG55dW1QY1ZSS0RmZDBBYThBc2dEdjF6cDZwWWQ1aldPd2h2ZWJSVGJ6Tk5FdzVCU3NJcHNqL2t1clFCbm1rN3NJRmNDRjV5eVpQRFJHNnRyUWh1alhZb3NhRm9jKzJmMU1KODl1Yzc2SU5ENkY5QnZsWFVkcGI2eHdEMis0cTNtZTNieXNpSHZ0TFlyVUp0bzdQRC92ZTdMTkh4U2cvd29OMmtTejR0eGFzQmRoeWl6M3VnUEdldFRqbTNYUm9rQUFBQUFTVVZPUks1Q1lJST0pXCIsZGlzcGxheTpcIm5vbmVcIixjdXJzb3I6XCJwb2ludGVyXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7cGFkZGluZzo1LHRleHRBbGlnbjpcInJpZ2h0XCIsYm9yZGVyVG9wOlwiMXB4IHNvbGlkICNjY2NcIixiYWNrZ3JvdW5kQ29sb3I6XCIjZmZmXCJ9KSx0aGlzLiRidXR0b25zLmZpbmQoXCJidXR0b25cIikuY3NzKHttYXJnaW5MZWZ0OjV9KSx0aGlzLiRidXR0b25zLmZpbmQoXCJidXR0b246Zmlyc3RcIikuY3NzKHttYXJnaW5MZWZ0OjB9KSx0aGlzLiRiYXIub24oe21vdXNlZW50ZXI6ZnVuY3Rpb24oKXthKHRoaXMpLmZpbmQoXCIubm90eV9jbG9zZVwiKS5zdG9wKCkuZmFkZVRvKFwibm9ybWFsXCIsMSl9LG1vdXNlbGVhdmU6ZnVuY3Rpb24oKXthKHRoaXMpLmZpbmQoXCIubm90eV9jbG9zZVwiKS5zdG9wKCkuZmFkZVRvKFwibm9ybWFsXCIsMCl9fSksdGhpcy5vcHRpb25zLmxheW91dC5uYW1lKXtjYXNlXCJ0b3BcIjp0aGlzLiRiYXIuY3NzKHtib3JkZXJSYWRpdXM6XCIwcHggMHB4IDVweCA1cHhcIixib3JkZXJCb3R0b206XCIycHggc29saWQgI2VlZVwiLGJvcmRlckxlZnQ6XCIycHggc29saWQgI2VlZVwiLGJvcmRlclJpZ2h0OlwiMnB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KTticmVhaztjYXNlXCJ0b3BDZW50ZXJcIjpjYXNlXCJjZW50ZXJcIjpjYXNlXCJib3R0b21DZW50ZXJcIjpjYXNlXCJpbmxpbmVcIjp0aGlzLiRiYXIuY3NzKHtib3JkZXJSYWRpdXM6XCI1cHhcIixib3JkZXI6XCIxcHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjEzcHhcIix0ZXh0QWxpZ246XCJjZW50ZXJcIn0pO2JyZWFrO2Nhc2VcInRvcExlZnRcIjpjYXNlXCJ0b3BSaWdodFwiOmNhc2VcImJvdHRvbUxlZnRcIjpjYXNlXCJib3R0b21SaWdodFwiOmNhc2VcImNlbnRlckxlZnRcIjpjYXNlXCJjZW50ZXJSaWdodFwiOnRoaXMuJGJhci5jc3Moe2JvcmRlclJhZGl1czpcIjVweFwiLGJvcmRlcjpcIjFweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTNweFwiLHRleHRBbGlnbjpcImxlZnRcIn0pO2JyZWFrO2Nhc2VcImJvdHRvbVwiOnRoaXMuJGJhci5jc3Moe2JvcmRlclJhZGl1czpcIjVweCA1cHggMHB4IDBweFwiLGJvcmRlclRvcDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyTGVmdDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyUmlnaHQ6XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgLTJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KTticmVhaztkZWZhdWx0OnRoaXMuJGJhci5jc3Moe2JvcmRlcjpcIjJweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSl9c3dpdGNoKHRoaXMub3B0aW9ucy50eXBlKXtjYXNlXCJhbGVydFwiOmNhc2VcIm5vdGlmaWNhdGlvblwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkZcIixib3JkZXJDb2xvcjpcIiNDQ0NcIixjb2xvcjpcIiM0NDRcIn0pO2JyZWFrO2Nhc2VcIndhcm5pbmdcIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkZFQUE4XCIsYm9yZGVyQ29sb3I6XCIjRkZDMjM3XCIsY29sb3I6XCIjODI2MjAwXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkICNGRkMyMzdcIn0pO2JyZWFrO2Nhc2VcImVycm9yXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwicmVkXCIsYm9yZGVyQ29sb3I6XCJkYXJrcmVkXCIsY29sb3I6XCIjRkZGXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFdlaWdodDpcImJvbGRcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgZGFya3JlZFwifSk7YnJlYWs7Y2FzZVwiaW5mb3JtYXRpb25cIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjNTdCN0UyXCIsYm9yZGVyQ29sb3I6XCIjMEI5MEM0XCIsY29sb3I6XCIjRkZGXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkICMwQjkwQzRcIn0pO2JyZWFrO2Nhc2VcInN1Y2Nlc3NcIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCJsaWdodGdyZWVuXCIsYm9yZGVyQ29sb3I6XCIjNTBDMjRFXCIsY29sb3I6XCJkYXJrZ3JlZW5cIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgIzUwQzI0RVwifSk7YnJlYWs7ZGVmYXVsdDp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkZGXCIsYm9yZGVyQ29sb3I6XCIjQ0NDXCIsY29sb3I6XCIjNDQ0XCJ9KX19LGNhbGxiYWNrOntvblNob3c6ZnVuY3Rpb24oKXthLm5vdHkudGhlbWVzLmRlZmF1bHRUaGVtZS5oZWxwZXJzLmJvcmRlckZpeC5hcHBseSh0aGlzKX0sb25DbG9zZTpmdW5jdGlvbigpe2Eubm90eS50aGVtZXMuZGVmYXVsdFRoZW1lLmhlbHBlcnMuYm9yZGVyRml4LmFwcGx5KHRoaXMpfX19LGEubm90eS50aGVtZXMucmVsYXg9e25hbWU6XCJyZWxheFwiLGhlbHBlcnM6e30sbW9kYWw6e2Nzczp7cG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMTAwJVwiLGhlaWdodDpcIjEwMCVcIixiYWNrZ3JvdW5kQ29sb3I6XCIjMDAwXCIsekluZGV4OjFlNCxvcGFjaXR5Oi42LGRpc3BsYXk6XCJub25lXCIsbGVmdDowLHRvcDowfX0sc3R5bGU6ZnVuY3Rpb24oKXtzd2l0Y2godGhpcy4kYmFyLmNzcyh7b3ZlcmZsb3c6XCJoaWRkZW5cIixtYXJnaW46XCI0cHggMFwiLGJvcmRlclJhZGl1czpcIjJweFwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTRweFwiLGxpbmVIZWlnaHQ6XCIxNnB4XCIsdGV4dEFsaWduOlwiY2VudGVyXCIscGFkZGluZzpcIjEwcHhcIix3aWR0aDpcImF1dG9cIixwb3NpdGlvbjpcInJlbGF0aXZlXCJ9KSx0aGlzLiRjbG9zZUJ1dHRvbi5jc3Moe3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6NCxyaWdodDo0LHdpZHRoOjEwLGhlaWdodDoxMCxiYWNrZ3JvdW5kOlwidXJsKGRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQW9BQUFBS0NBUUFBQUFuT3djMkFBQUF4VWxFUVZSNEFSM01QVW9EVVJTQTBlKyt1U2trT3hDM0lBT1dOdGFDSURhQ2hmZ1hCTUVaYlFSQnl4Q3drK0Jhc2dRUlpMU1lvTGdEUWJBUnhyeThueXVtUGNWUktEZmQwQWE4QXNnRHYxenA2cFlkNWpXT3dodmViUlRiek5ORXc1QlNzSXBzai9rdXJRQm5tazdzSUZjQ0Y1eXlaUERSRzZ0clFodWpYWW9zYUZvYysyZjFNSjg5dWM3NklORDZGOUJ2bFhVZHBiNnh3RDIrNHEzbWUzYnlzaUh2dExZclVKdG83UEQvdmU3TE5IeFNnL3dvTjJrU3o0dHhhc0JkaHlpejN1Z1BHZXRUam0zWFJva0FBQUFBU1VWT1JLNUNZSUk9KVwiLGRpc3BsYXk6XCJub25lXCIsY3Vyc29yOlwicG9pbnRlclwifSksdGhpcy4kYnV0dG9ucy5jc3Moe3BhZGRpbmc6NSx0ZXh0QWxpZ246XCJyaWdodFwiLGJvcmRlclRvcDpcIjFweCBzb2xpZCAjY2NjXCIsYmFja2dyb3VuZENvbG9yOlwiI2ZmZlwifSksdGhpcy4kYnV0dG9ucy5maW5kKFwiYnV0dG9uXCIpLmNzcyh7bWFyZ2luTGVmdDo1fSksdGhpcy4kYnV0dG9ucy5maW5kKFwiYnV0dG9uOmZpcnN0XCIpLmNzcyh7bWFyZ2luTGVmdDowfSksdGhpcy4kYmFyLm9uKHttb3VzZWVudGVyOmZ1bmN0aW9uKCl7YSh0aGlzKS5maW5kKFwiLm5vdHlfY2xvc2VcIikuc3RvcCgpLmZhZGVUbyhcIm5vcm1hbFwiLDEpfSxtb3VzZWxlYXZlOmZ1bmN0aW9uKCl7YSh0aGlzKS5maW5kKFwiLm5vdHlfY2xvc2VcIikuc3RvcCgpLmZhZGVUbyhcIm5vcm1hbFwiLDApfX0pLHRoaXMub3B0aW9ucy5sYXlvdXQubmFtZSl7Y2FzZVwidG9wXCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyQm90dG9tOlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJMZWZ0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJSaWdodDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyVG9wOlwiMnB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KTticmVhaztjYXNlXCJ0b3BDZW50ZXJcIjpjYXNlXCJjZW50ZXJcIjpjYXNlXCJib3R0b21DZW50ZXJcIjpjYXNlXCJpbmxpbmVcIjp0aGlzLiRiYXIuY3NzKHtib3JkZXI6XCIxcHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjEzcHhcIix0ZXh0QWxpZ246XCJjZW50ZXJcIn0pO2JyZWFrO2Nhc2VcInRvcExlZnRcIjpjYXNlXCJ0b3BSaWdodFwiOmNhc2VcImJvdHRvbUxlZnRcIjpjYXNlXCJib3R0b21SaWdodFwiOmNhc2VcImNlbnRlckxlZnRcIjpjYXNlXCJjZW50ZXJSaWdodFwiOnRoaXMuJGJhci5jc3Moe2JvcmRlcjpcIjFweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTNweFwiLHRleHRBbGlnbjpcImxlZnRcIn0pO2JyZWFrO2Nhc2VcImJvdHRvbVwiOnRoaXMuJGJhci5jc3Moe2JvcmRlclRvcDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyTGVmdDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyUmlnaHQ6XCIycHggc29saWQgI2VlZVwiLGJvcmRlckJvdHRvbTpcIjJweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAtMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pO2JyZWFrO2RlZmF1bHQ6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyOlwiMnB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KX1zd2l0Y2godGhpcy5vcHRpb25zLnR5cGUpe2Nhc2VcImFsZXJ0XCI6Y2FzZVwibm90aWZpY2F0aW9uXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGRlwiLGJvcmRlckNvbG9yOlwiI2RlZGVkZVwiLGNvbG9yOlwiIzQ0NFwifSk7YnJlYWs7Y2FzZVwid2FybmluZ1wiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkVBQThcIixib3JkZXJDb2xvcjpcIiNGRkMyMzdcIixjb2xvcjpcIiM4MjYyMDBcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgI0ZGQzIzN1wifSk7YnJlYWs7Y2FzZVwiZXJyb3JcIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkY4MTgxXCIsYm9yZGVyQ29sb3I6XCIjZTI1MzUzXCIsY29sb3I6XCIjRkZGXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFdlaWdodDpcImJvbGRcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgZGFya3JlZFwifSk7YnJlYWs7Y2FzZVwiaW5mb3JtYXRpb25cIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjNzhDNUU3XCIsYm9yZGVyQ29sb3I6XCIjM2JhZGQ2XCIsY29sb3I6XCIjRkZGXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkICMwQjkwQzRcIn0pO2JyZWFrO2Nhc2VcInN1Y2Nlc3NcIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjQkNGNUJDXCIsYm9yZGVyQ29sb3I6XCIjN2NkZDc3XCIsY29sb3I6XCJkYXJrZ3JlZW5cIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgIzUwQzI0RVwifSk7YnJlYWs7ZGVmYXVsdDp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkZGXCIsYm9yZGVyQ29sb3I6XCIjQ0NDXCIsY29sb3I6XCIjNDQ0XCJ9KX19LGNhbGxiYWNrOntvblNob3c6ZnVuY3Rpb24oKXt9LG9uQ2xvc2U6ZnVuY3Rpb24oKXt9fX0sd2luZG93Lm5vdHl9KTsiLCIkKGZ1bmN0aW9uKCkge1xuICAgIC8vIHRlbXBcbiAgICAkKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiYVtocmVmPScjcmVmbGluayddXCIsIGZ1bmN0aW9uKCkge3JldHVybiBmYWxzZTt9KTtcblxuICAgIHZhciB1cmxQcmVmaXggPSAnJztcblxuICAgIHZhciBhamF4ID0ge1xuICAgICAgICBjb250cm9sOiB7XG4gICAgICAgICAgICBzZW5kRm9ybURhdGE6IGZ1bmN0aW9uKGZvcm0sIHVybCwgbG9nTmFtZSwgc3VjY2Vzc0NhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgJChkb2N1bWVudCkub24oIFwic3VibWl0XCIsIGZvcm0sIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGYgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhRm9ybSA9ICQodGhpcykuc2VyaWFsaXplKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN1Ym1pdEJ1dHRvbiA9ICQodGhpcykuZmluZChcImJ1dHRvblt0eXBlPXN1Ym1pdF1cIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9sZEJ1dHRvblZhbHVlID0gc3VibWl0QnV0dG9uLmh0bWwoKTtcblxuICAgICAgICAgICAgICAgICAgICBzdWJtaXRCdXR0b24uYXR0cihcImRpc2FibGVkXCIsIFwiZGlzYWJsZWRcIikuaHRtbCgnPGkgY2xhc3M9XCJmYSBmYS1jb2cgZmEtc3BpblwiPjwvaT4nKTtcblxuICAgICAgICAgICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiBcInBvc3RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogdXJsUHJlZml4ICsgdXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YUZvcm0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXNwb25zZSA9ICQucGFyc2VKU09OKHJlc3BvbnNlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHJlc3BvbnNlLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcihrZXkgaW4gcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHJlc3BvbnNlW2tleV1bMF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmb3JtRXJyb3IgPSBub3R5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCI8Yj7QntGI0LjQsdC60LAhPC9iPiBcIiArIHJlc3BvbnNlW2tleV1bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiAncmVsYXgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICd0b3BSaWdodCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDcwMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NDYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oanF4aHIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcnMuY29udHJvbC5sb2cobG9nTmFtZSwganF4aHIpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZvcm1FcnJvckFqYXggPSBub3R5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCI8Yj7QotC10YXQvdC40YfQtdGB0LrQuNC1INGA0LDQsdC+0YLRiyE8L2I+PGJyPtCSINC00LDQvdC90YvQuSDQvNC+0LzQtdC90YIg0LLRgNC10LzQtdC90LhcIiArIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiINC/0YDQvtC40LfQstC10LTRkdC90L3QvtC1INC00LXQudGB0YLQstC40LUg0L3QtdCy0L7Qt9C80L7QttC90L4uINCf0L7Qv9GA0L7QsdGD0LnRgtC1INC/0L7Qt9C20LUuXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiINCf0YDQuNC90L7RgdC40Lwg0YHQstC+0Lgg0LjQt9Cy0LjQvdC10L3QuNGPINC30LAg0L3QtdGD0LTQvtCx0YHRgtCy0L4uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd3YXJuaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogMTAwMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0QnV0dG9uLnJlbW92ZUF0dHIoXCJkaXNhYmxlZFwiKS5odG1sKG9sZEJ1dHRvblZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgZXJyb3JzID0ge1xuICAgICAgICBjb250cm9sOiB7XG4gICAgICAgICAgICBsb2c6IGZ1bmN0aW9uKHR5cGUsIGpxeGhyKSB7XG4gICAgICAgICAgICAgICAgJChcIjxkaXYgaWQ9J2Vycm9yLWNvbnRhaW5lcicgc3R5bGU9J2Rpc3BsYXk6bm9uZTsnPlwiICsganF4aHIucmVzcG9uc2VUZXh0ICsgXCI8L2Rpdj5cIikuYXBwZW5kVG8oXCJib2R5XCIpO1xuXG4gICAgICAgICAgICAgICAgdmFyIGVycm9yQ29udGFpbmVyID0gJChcIiNlcnJvci1jb250YWluZXJcIiksXG4gICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlID0gdHlwZSArIFwiOiBcIiArIGpxeGhyLnN0YXR1cyArIFwiIFwiICsganF4aHIuc3RhdHVzVGV4dCArIFwiIFwiO1xuXG4gICAgICAgICAgICAgICAgaWYoZXJyb3JDb250YWluZXIuZmluZChcImgyOmZpcnN0XCIpLnRleHQoKSA9PSBcIkRldGFpbHNcIikge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2UgKz0gXCItIFwiO1xuICAgICAgICAgICAgICAgICAgICBlcnJvckNvbnRhaW5lci5maW5kKFwiZGl2XCIpLmVhY2goZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGluZGV4ID4gNCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRlbGltaXRlciA9IFwiLCBcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGluZGV4ID09IDQpIGRlbGltaXRlciA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2UgKz0gJCh0aGlzKS50ZXh0KCkgKyBkZWxpbWl0ZXI7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogXCJwb3N0XCIsXG4gICAgICAgICAgICAgICAgICAgIHVybDogdXJsUHJlZml4ICsgXCIvYWpheC1lcnJvclwiLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBcIm1lc3NhZ2U9XCIgKyBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBlcnJvckNvbnRhaW5lci5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBzZXR0aW5ncyA9IHtcbiAgICAgICAgY29udHJvbDoge1xuICAgICAgICAgICAgZXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBhamF4LmNvbnRyb2wuc2VuZEZvcm1EYXRhKFwiI3RvcCBmb3JtW25hbWU9dXNlci1zZXR0aW5nc11cIiwgXCIvYWNjb3VudC9zZXR0aW5ncy9jaGFuZ2Utc2V0dGluZ3NcIiwgXCJBY2NvdW50IFNldHRpbmdzIEFqYXggRXJyb3JcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICQoXCIjdG9wIGZvcm1bbmFtZT11c2VyLXNldHRpbmdzXVwiKS5hdHRyKFwibmFtZVwiLCBcInZhbGlkLWRhdGEtc2V0dGluZ3NcIik7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHNldHRpbmdzU3VjY2VzcyA9IG5vdHkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCI8Yj7Qn9C+0LfQtNGA0LDQstC70Y/QtdC8ITwvYj48YnI+0JjQvdGE0L7RgNC80LDRhtC40Y8g0YPRgdC/0LXRiNC90L4g0L7QsdC90L7QstC70LXQvdCwLlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiAnYW5pbWF0ZWQgZmxpcE91dFgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICd0b3BSaWdodCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA3MDAwXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKFwiI3RvcCBmb3JtW25hbWU9dmFsaWQtZGF0YS1zZXR0aW5nc11cIikuc3VibWl0KCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDE1MDApO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgYWpheC5jb250cm9sLnNlbmRGb3JtRGF0YShcIiN0b3AgZm9ybVtuYW1lPXVzZXItcGFzc3dvcmRdXCIsIFwiL2FjY291bnQvc2V0dGluZ3MvY2hhbmdlLXBhc3N3b3JkXCIsIFwiQWNjb3VudCBQYXNzd29yZCBBamF4IEVycm9yXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGFzc3dvcmRTdWNjZXNzID0gbm90eSh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCf0L7Qt9C00YDQsNCy0LvRj9C10LwhPC9iPjxicj7Qn9Cw0YDQvtC70Ywg0YPRgdC/0LXRiNC90L4g0LjQt9C80LXQvdGR0L0uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDcwMDBcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgJChcIiN0b3AgZm9ybVtuYW1lPXVzZXItcGFzc3dvcmRdXCIpWzBdLnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAkKCcjdG9wIGlucHV0W3JlZj1kYXRlXScpLmRhdGVwaWNrZXIoe1xuICAgICAgICAgICAgICAgICAgICBkYXRlRm9ybWF0OiBcInl5eXktbW0tZGRcIlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSAgIFxuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICB2YXIgYmFsYW5jZSA9IHtcbiAgICAgICAgY29udHJvbDoge1xuICAgICAgICAgICAgZXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29uZmlybUJhbGFuY2UgPSAkKFwiI3VpbmZvXCIpLmF0dHIoXCJkYXRhLWJhbGFuY2VcIiksXG4gICAgICAgICAgICAgICAgICAgICAgc3RhdHVzID0gJChcIiN1aW5mb1wiKS5hdHRyKFwiZGF0YS1zdGF0dXNcIik7XG5cbiAgICAgICAgICAgICAgICBDaXJjbGVzLmNyZWF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnYnJvbnplJyxcbiAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiAxMDAsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjb25maXJtQmFsYW5jZSxcbiAgICAgICAgICAgICAgICAgICAgbWF4VmFsdWU6IDUwMCxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IChzdGF0dXMgPT0gXCJkZWZhdWx0XCIgPyAyMCA6IDEwKSxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSArICcgPHNwYW4gY2xhc3M9XCJmYSBmYS1ydWJcIj48L3NwYW4+JztcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgY29sb3JzOiAgWycjRUM4QjZDJywgJyM4NzI2MEMnXSxcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IDUwMCxcbiAgICAgICAgICAgICAgICAgICAgd3JwQ2xhc3M6ICdjaXJjbGVzLXdycCcsXG4gICAgICAgICAgICAgICAgICAgIHRleHRDbGFzczogICdjaXJjbGVzLXRleHQnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZVN0cm9rZUNsYXNzOiAgJ2NpcmNsZXMtdmFsdWVTdHJva2UnLFxuICAgICAgICAgICAgICAgICAgICBtYXhWYWx1ZVN0cm9rZUNsYXNzOiAnY2lyY2xlcy1tYXhWYWx1ZVN0cm9rZScsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlV3JhcHBlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVUZXh0OiAgdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgQ2lyY2xlcy5jcmVhdGUoe1xuICAgICAgICAgICAgICAgICAgICBpZDogJ3NpbHZlcicsXG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogMTAwLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY29uZmlybUJhbGFuY2UsXG4gICAgICAgICAgICAgICAgICAgIG1heFZhbHVlOiAzMDAwLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogKHN0YXR1cyA9PSBcImJyb256ZVwiID8gMjAgOiAxMCksXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IGZ1bmN0aW9uKHZhbHVlKXtyZXR1cm4gdmFsdWUgKyAnIDxzcGFuIGNsYXNzPVwiZmEgZmEtcnViXCI+PC9zcGFuPic7fSxcbiAgICAgICAgICAgICAgICAgICAgY29sb3JzOiAgWycjRTNFM0UzJywgJyM5RDlEOUInXSxcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IDYwMCxcbiAgICAgICAgICAgICAgICAgICAgd3JwQ2xhc3M6ICdjaXJjbGVzLXdycCcsXG4gICAgICAgICAgICAgICAgICAgIHRleHRDbGFzczogICdjaXJjbGVzLXRleHQnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZVN0cm9rZUNsYXNzOiAgJ2NpcmNsZXMtdmFsdWVTdHJva2UnLFxuICAgICAgICAgICAgICAgICAgICBtYXhWYWx1ZVN0cm9rZUNsYXNzOiAnY2lyY2xlcy1tYXhWYWx1ZVN0cm9rZScsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlV3JhcHBlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVUZXh0OiAgdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgQ2lyY2xlcy5jcmVhdGUoe1xuICAgICAgICAgICAgICAgICAgICBpZDogJ2dvbGQnLFxuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDEwMCxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGNvbmZpcm1CYWxhbmNlLFxuICAgICAgICAgICAgICAgICAgICBtYXhWYWx1ZTogNzAwMCxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IChzdGF0dXMgPT0gXCJzaWx2ZXJcIiA/IDIwIDogMTApLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBmdW5jdGlvbih2YWx1ZSl7cmV0dXJuIHZhbHVlICsgJyA8c3BhbiBjbGFzcz1cImZhIGZhLXJ1YlwiPjwvc3Bhbj4nO30sXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yczogIFsnI0ZDQjg0QicsICcjRDU4NDE3J10sXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiA3MDAsXG4gICAgICAgICAgICAgICAgICAgIHdycENsYXNzOiAnY2lyY2xlcy13cnAnLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0Q2xhc3M6ICAnY2lyY2xlcy10ZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVTdHJva2VDbGFzczogICdjaXJjbGVzLXZhbHVlU3Ryb2tlJyxcbiAgICAgICAgICAgICAgICAgICAgbWF4VmFsdWVTdHJva2VDbGFzczogJ2NpcmNsZXMtbWF4VmFsdWVTdHJva2UnLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZVdyYXBwZXI6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlVGV4dDogIHRydWVcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIENpcmNsZXMuY3JlYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdwbGF0aW51bScsXG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogMTAwLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY29uZmlybUJhbGFuY2UsXG4gICAgICAgICAgICAgICAgICAgIG1heFZhbHVlOiAxMDAwMCxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IChzdGF0dXMgPT0gXCJnb2xkXCIgPyAyMCA6IDEwKSxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogZnVuY3Rpb24odmFsdWUpe3JldHVybiB2YWx1ZSArICcgPHNwYW4gY2xhc3M9XCJmYSBmYS1ydWJcIj48L3NwYW4+Jzt9LFxuICAgICAgICAgICAgICAgICAgICBjb2xvcnM6ICBbJyM5RDlEOUInLCAnIzA2MDYwNiddLFxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgICAgICB3cnBDbGFzczogJ2NpcmNsZXMtd3JwJyxcbiAgICAgICAgICAgICAgICAgICAgdGV4dENsYXNzOiAgJ2NpcmNsZXMtdGV4dCcsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlU3Ryb2tlQ2xhc3M6ICAnY2lyY2xlcy12YWx1ZVN0cm9rZScsXG4gICAgICAgICAgICAgICAgICAgIG1heFZhbHVlU3Ryb2tlQ2xhc3M6ICdjaXJjbGVzLW1heFZhbHVlU3Ryb2tlJyxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVXcmFwcGVyOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZVRleHQ6ICB0cnVlXG4gICAgICAgICAgICAgICAgfSk7ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGhlYWRlciA9IHtcbiAgICAgICAgY29udHJvbDoge1xuICAgICAgICAgICAgZXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZigkKHdpbmRvdykud2lkdGgoKSA+IDk5MSkge1xuICAgICAgICAgICAgICAgICAgICAkKFwiI3NlYXJjaFwiKS5hdXRvY29tcGxldGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VydmljZVVybDogJy9zZWFyY2gnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9DYWNoZTogJ3RydWUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJSZXF1ZXN0Qnk6IDMwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9ICcvc3RvcmVzLycgKyBzdWdnZXN0aW9uLmRhdGEucm91dGU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICQoXCIuZG9icm9oZWFkIGlcIikuYW5pbW8oe2FuaW1hdGlvbjogXCJwdWxzZVwiLCBpdGVyYXRlOiBcImluZmluaXRlXCJ9KTtcbiAgICAgICAgICAgICAgICAkKFwiLmxpbmstaGVhZC1zdG9yZXMgc3Bhbi5zdG9yZXMtZmxhc2hcIikuYW5pbW8oe2FuaW1hdGlvbjogXCJmbGFzaFwiLCBpdGVyYXRlOiBcImluZmluaXRlXCIsIGR1cmF0aW9uOiAyLjR9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciB3aXRoZHJhdyA9IHtcbiAgICAgICAgY29udHJvbDoge1xuICAgICAgICAgICAgZXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkKFwiI3RvcFwiKS5maW5kKFwiLmFjY291bnQtd2l0aGRyYXcgLm9wdGlvbiBhXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZiA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbiA9IHNlbGYucGFyZW50KCkuYXR0cihcImRhdGEtb3B0aW9uLXByb2Nlc3NcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgJChcIiN0b3BcIikuZmluZChcIi5hY2NvdW50LXdpdGhkcmF3IC5vcHRpb24gYVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcblxuICAgICAgICAgICAgICAgICAgICAkKFwiI3RvcFwiKS5maW5kKFwiZm9ybVtuYW1lPXdpdGhkcmF3LWZvcm1dXCIpLmZpbmQoJyN1c2Vyc3dpdGhkcmF3LXByb2Nlc3NfaWQnKS52YWwob3B0aW9uKTtcblxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2gob3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiMVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXIgPSBcItCS0LLQtdC00LjRgtC1INC90L7QvNC10YAg0YHRh9GR0YLQsFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCIyXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlciA9IFwi0JLQstC10LTQuNGC0LUg0L3QvtC80LXRgCBSLdC60L7RiNC10LvRjNC60LBcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiM1wiOlxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXIgPSBcItCS0LLQtdC00LjRgtC1INC90L7QvNC10YAg0YLQtdC70LXRhNC+0L3QsFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCI0XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlciA9IFwi0JLQstC10LTQuNGC0LUg0L3QvtC80LXRgCDQutCw0YDRgtGLXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIjVcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyID0gXCLQktCy0LXQtNC40YLQtSBlbWFpbCDQsNC00YDQtdGBXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIjZcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyID0gXCLQktCy0LXQtNC40YLQtSDQvdC+0LzQtdGAINGC0LXQu9C10YTQvtC90LBcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgJChcIiN0b3BcIikuZmluZChcImZvcm1bbmFtZT13aXRoZHJhdy1mb3JtXVwiKS5maW5kKFwiI3VzZXJzd2l0aGRyYXctYmlsbFwiKS5hdHRyKFwicGxhY2Vob2xkZXJcIiwgcGxhY2Vob2xkZXIpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGFqYXguY29udHJvbC5zZW5kRm9ybURhdGEoXCIjdG9wIGZvcm1bbmFtZT13aXRoZHJhdy1mb3JtXVwiLCBcIi9hY2NvdW50L3dpdGhkcmF3XCIsIFwiV2l0aGRyYXcgQWpheCBFcnJvclwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdpdGhkcmF3U3VjY2VzcyA9IG5vdHkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCI8Yj7Qn9C+0LfQtNGA0LDQstC70Y/QtdC8ITwvYj48YnI+0JfQsNC/0YDQvtGBINC90LAg0LLRi9Cy0L7QtCDQtNC10L3QtdCzINCx0YvQuyDRg9GB0L/QtdGI0L3QviDQstGL0L/QvtC70L3QtdC9LlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiAnYW5pbWF0ZWQgZmxpcE91dFgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICd0b3BSaWdodCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA3MDAwXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICQoXCIjdG9wIGZvcm1bbmFtZT13aXRoZHJhdy1mb3JtXVwiKVswXS5yZXNldCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGNoYXJpdHkgPSB7XG4gICAgICAgIGNvbnRyb2w6IHtcbiAgICAgICAgICAgIGV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJChcIiN0b3BcIikuZmluZChcIi5hY2NvdW50LWZ1bmQtdHJhbnNmZXIgLm9wdGlvbiBhXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZiA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbiA9IHNlbGYucGFyZW50KCkuYXR0cihcImRhdGEtb3B0aW9uLXByb2Nlc3NcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyID0gXCJcIjtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgdGl0bGVGdW5kID0gc2VsZi5wcmV2KFwiLnRpdGxlXCIpLnRleHQoKTtcbiAgICAgICAgICAgICAgICAgICAgJChcIi50by1mdW5kIHNwYW5cIikudGV4dCh0aXRsZUZ1bmQpO1xuXG4gICAgICAgICAgICAgICAgICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuYWNjb3VudC1mdW5kLXRyYW5zZmVyIC5vcHRpb24gYVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcblxuICAgICAgICAgICAgICAgICAgICAkKFwiI3RvcFwiKS5maW5kKFwiZm9ybVtuYW1lPWZ1bmQtdHJhbnNmZXItZm9ybV1cIikuZmluZChcImlucHV0W25hbWU9Y2hhcml0eS1wcm9jZXNzXVwiKS52YWwob3B0aW9uKTtcblxuICAgICAgICAgICAgICAgICAgICAkKFwiI3RvcFwiKS5maW5kKFwiLmFjY291bnQtZnVuZC10cmFuc2ZlciAuYXV0b3BheW1lbnQtaW5mb1wiKS5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIik7XG4gICAgICAgICAgICAgICAgICAgICQoXCIjdG9wXCIpLmZpbmQoXCJmb3JtW25hbWU9YXV0b3BheW1lbnQtZm9ybV1cIikuZmluZChcImlucHV0W25hbWU9YXV0b3BheW1lbnQtdWlkXVwiKS52YWwob3B0aW9uKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBhamF4LmNvbnRyb2wuc2VuZEZvcm1EYXRhKFwiI3RvcCBmb3JtW25hbWU9ZnVuZC10cmFuc2Zlci1mb3JtXVwiLCBcIi9hY2NvdW50L2RvYnJvL3NlbmRcIiwgXCJGdW5kIFRyYW5zZmVyIEFqYXggRXJyb3JcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB3aXRoZHJhd1N1Y2Nlc3MgPSBub3R5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0J/QvtC30LTRgNCw0LLQu9GP0LXQvCE8L2I+PGJyPtCU0LXQvdC10LbQvdGL0LUg0YHRgNC10LTRgdGC0LLQsCDRg9GB0L/QtdGI0L3QviDQv9C10YDQtdCy0LXQtNC10L3Riy4g0KHQv9Cw0YHQuNCx0L4g0LfQsCDQktCw0YjRgyDQv9C+0LzQvtGJ0YwuINCY0YHRgtC+0YDQuNGOINCS0LDRiNC40YUg0LTQvtCx0YDRi9GFINC00LXQuyDQstGLINC80L7QttC10YLQtSDQv9C+0YHQvNC+0YLRgNC10YLRjCDQsiA8YSBocmVmPScvYWNjb3VudC9jaGFyaXR5Jz7Qu9C40YfQvdC+0Lwg0LrQsNCx0LjQvdC10YLQtTwvYT4uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDcwMDBcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgJChcIiN0b3AgZm9ybVtuYW1lPWZ1bmQtdHJhbnNmZXItZm9ybV1cIilbMF0ucmVzZXQoKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGFqYXguY29udHJvbC5zZW5kRm9ybURhdGEoXCIjdG9wIGZvcm1bbmFtZT1hdXRvcGF5bWVudC1mb3JtXVwiLCBcIi9hY2NvdW50L2RvYnJvL2F1dG8tc2VuZFwiLCBcIkF1dG8gUGF5bWVudCBBamF4IEVycm9yXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgd2l0aGRyYXdTdWNjZXNzID0gbm90eSh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCf0L7Qt9C00YDQsNCy0LvRj9C10LwhPC9iPjxicj7QkNCy0YLQvtC/0LvQsNGC0ZHQtiDQsdGL0Lsg0YPRgdC/0LXRiNC90L4g0YPRgdGC0LDQvdC+0LLQu9C10L0uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDcwMDBcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBhamF4LmNvbnRyb2wuc2VuZEZvcm1EYXRhKFwiI3RvcCBmb3JtW25hbWU9ZGVsZXRlLWF1dG9wYXltZW50LWZvcm1dXCIsIFwiL2FjY291bnQvZG9icm8vYXV0by1kZWxldGVcIiwgXCJEZWxldGUgQXV0byBQYXltZW50IEFqYXggRXJyb3JcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB3aXRoZHJhd1N1Y2Nlc3MgPSBub3R5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0J/QvtC30LTRgNCw0LLQu9GP0LXQvCE8L2I+PGJyPtCQ0LLRgtC+0L/Qu9Cw0YLRkdC2INCx0YvQuyDRg9GB0L/QtdGI0L3QviDRg9C00LDQu9GR0L0uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDcwMDBcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgJChcIiN0b3BcIikuZmluZChcIi5zZWxmLWF1dG9wYXltZW50XCIpLnBhcmVudCgpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHN1cHBvcnQgPSB7XG4gICAgICAgIGNvbnRyb2w6IHtcbiAgICAgICAgICAgIGV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgYWpheC5jb250cm9sLnNlbmRGb3JtRGF0YShcIiN0b3AgZm9ybVtuYW1lPXN1cHBvcnQtZm9ybV1cIiwgXCIvYWNjb3VudC9zdXBwb3J0XCIsIFwiU3VwcG9ydCBBamF4IEVycm9yXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3VwcG9ydFN1Y2Nlc3MgPSBub3R5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0J/QvtC30LTRgNCw0LLQu9GP0LXQvCE8L2I+PGJyPtCX0LDQv9GA0L7RgSDQsiDRgdC70YPQttCx0YMg0L/QvtC00LTQtdGA0LbQutC4INCx0YvQuyDRg9GB0L/QtdGI0L3QviDQvtGC0L/RgNCw0LLQu9C10L0uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDcwMDBcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgJChcIiN0b3AgZm9ybVtuYW1lPXN1cHBvcnQtZm9ybV1cIilbMF0ucmVzZXQoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN1cHBvcnQuY29udHJvbC5ldmVudHMoKTtcbiAgICB3aXRoZHJhdy5jb250cm9sLmV2ZW50cygpO1xuICAgIGNoYXJpdHkuY29udHJvbC5ldmVudHMoKTtcbiAgICBzZXR0aW5ncy5jb250cm9sLmV2ZW50cygpO1xuICAgIGJhbGFuY2UuY29udHJvbC5ldmVudHMoKTtcbiAgICBoZWFkZXIuY29udHJvbC5ldmVudHMoKTtcbn0pO1xuXG4kKGZ1bmN0aW9uKCl7XG4gICAgJChcImlucHV0LmxpbmtcIikuY2xpY2soZnVuY3Rpb24oKXtcdC8vINC/0L7Qu9GD0YfQtdC90LjQtSDRhNC+0LrRg9GB0LAg0YLQtdC60YHRgtC+0LLRi9C8INC/0L7Qu9C10Lwt0YHRgdGL0LvQutC+0LlcbiAgICAgICAgJCh0aGlzKS5zZWxlY3QoKTtcbiAgICB9KTtcbn0pO1xuXG4kKCdib2R5Jykub24oJ2NsaWNrJywgJy5saW5rLXRvLWNsaXBib2FyZCcsIGZ1bmN0aW9uKGUpe1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgbGlua1RleHQgPSAkKHRoaXMpLmRhdGEoJ2xpbmsnKTtcbiAgICB2YXIgdGV4dCA9ICQodGhpcykuZGF0YSgndGV4dCcpO1xuICAgIGlmKCF0ZXh0KXtcbiAgICAgICAgdGV4dD0n0JLQsNGI0LAg0L/QsNGA0YLQvdGR0YDRgdC60LDRjyDRgdGB0YvQu9C60LAg0YHQutC+0L/QuNGA0L7QstCw0L3QsCDQsiDQsdGD0YTQtdGAINC+0LHQvNC10L3QsC4g0KPQtNCw0YfQvdC+0Lkg0YDQsNCx0L7RgtGLISc7XG4gICAgfVxuICAgIHZhciB0bXAgICA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0lOUFVUJyk7XG4gICAgdG1wLnZhbHVlID0gbGlua1RleHQ7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0bXApO1xuICAgIHRtcC5zZWxlY3QoKTtcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpO1xuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQodG1wKTtcbiAgICBub3RpZmljYXRpb24ubm90aWZpKHtcbiAgICAgICAgdGl0bGU6ICfQo9GB0L/QtdGI0L3QvicsXG4gICAgICAgIG1lc3NhZ2U6IHRleHQsXG4gICAgICAgIHR5cGU6ICdzdWNjZXNzJ1xuICAgIH0pO1xufSk7XG4iLCI7KGZ1bmN0aW9uICggJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkICkge1xuXG4gIC8qKlxuICAgKiBhbmltbyBpcyBhIHBvd2VyZnVsIGxpdHRsZSB0b29sIHRoYXQgbWFrZXMgbWFuYWdpbmcgQ1NTIGFuaW1hdGlvbnMgZXh0cmVtZWx5IGVhc3kuIFN0YWNrIGFuaW1hdGlvbnMsIHNldCBjYWxsYmFja3MsIG1ha2UgbWFnaWMuXG4gICAqIE1vZGVybiBicm93c2VycyBhbmQgYWxtb3N0IGFsbCBtb2JpbGUgYnJvd3NlcnMgc3VwcG9ydCBDU1MgYW5pbWF0aW9ucyAoaHR0cDovL2Nhbml1c2UuY29tL2Nzcy1hbmltYXRpb24pLlxuICAgKlxuICAgKiBAYXV0aG9yIERhbmllbCBSYWZ0ZXJ5IDogdHdpdHRlci9UaHJpdmluZ0tpbmdzXG4gICAqIEB2ZXJzaW9uIDEuMC4xXG4gICovXG4gIGZ1bmN0aW9uIGFuaW1vKCBlbGVtZW50LCBvcHRpb25zLCBjYWxsYmFjaywgb3RoZXJfY2IgKSB7XG4gICAgXG4gICAgLy8gRGVmYXVsdCBjb25maWd1cmF0aW9uXG4gICAgdmFyIGRlZmF1bHRzID0ge1xuICAgIFx0ZHVyYXRpb246IDEsXG4gICAgXHRhbmltYXRpb246IG51bGwsXG4gICAgXHRpdGVyYXRlOiAxLFxuICAgIFx0dGltaW5nOiBcImxpbmVhclwiLFxuICAgICAga2VlcDogZmFsc2VcbiAgICB9O1xuXG4gICAgLy8gQnJvd3NlciBwcmVmaXhlcyBmb3IgQ1NTXG4gICAgdGhpcy5wcmVmaXhlcyA9IFtcIlwiLCBcIi1tb3otXCIsIFwiLW8tYW5pbWF0aW9uLVwiLCBcIi13ZWJraXQtXCJdO1xuXG4gICAgLy8gQ2FjaGUgdGhlIGVsZW1lbnRcbiAgICB0aGlzLmVsZW1lbnQgPSAkKGVsZW1lbnQpO1xuXG4gICAgdGhpcy5iYXJlID0gZWxlbWVudDtcblxuICAgIC8vIEZvciBzdGFja2luZyBvZiBhbmltYXRpb25zXG4gICAgdGhpcy5xdWV1ZSA9IFtdO1xuXG4gICAgLy8gSGFja3lcbiAgICB0aGlzLmxpc3RlbmluZyA9IGZhbHNlO1xuXG4gICAgLy8gRmlndXJlIG91dCB3aGVyZSB0aGUgY2FsbGJhY2sgaXNcbiAgICB2YXIgY2IgPSAodHlwZW9mIGNhbGxiYWNrID09IFwiZnVuY3Rpb25cIiA/IGNhbGxiYWNrIDogb3RoZXJfY2IpO1xuXG4gICAgLy8gT3B0aW9ucyBjYW4gc29tZXRpbWVzIGJlIGEgY29tbWFuZFxuICAgIHN3aXRjaChvcHRpb25zKSB7XG5cbiAgICAgIGNhc2UgXCJibHVyXCI6XG5cbiAgICAgIFx0ZGVmYXVsdHMgPSB7XG4gICAgICBcdFx0YW1vdW50OiAzLFxuICAgICAgXHRcdGR1cmF0aW9uOiAwLjUsXG4gICAgICBcdFx0Zm9jdXNBZnRlcjogbnVsbFxuICAgICAgXHR9O1xuXG4gICAgICBcdHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKCBkZWZhdWx0cywgY2FsbGJhY2sgKTtcblxuICBcdCAgICB0aGlzLl9ibHVyKGNiKTtcblxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcImZvY3VzXCI6XG5cbiAgXHQgIFx0dGhpcy5fZm9jdXMoKTtcblxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcInJvdGF0ZVwiOlxuXG4gICAgICAgIGRlZmF1bHRzID0ge1xuICAgICAgICAgIGRlZ3JlZXM6IDE1LFxuICAgICAgICAgIGR1cmF0aW9uOiAwLjVcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCggZGVmYXVsdHMsIGNhbGxiYWNrICk7XG5cbiAgICAgICAgdGhpcy5fcm90YXRlKGNiKTtcblxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcImNsZWFuc2VcIjpcblxuICAgICAgICB0aGlzLmNsZWFuc2UoKTtcblxuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcblxuXHQgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoIGRlZmF1bHRzLCBvcHRpb25zICk7XG5cblx0ICAgIHRoaXMuaW5pdChjYik7XG4gIFx0XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBhbmltby5wcm90b3R5cGUgPSB7XG5cbiAgICAvLyBBIHN0YW5kYXJkIENTUyBhbmltYXRpb25cbiAgICBpbml0OiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgXG4gICAgICB2YXIgJG1lID0gdGhpcztcblxuICAgICAgLy8gQXJlIHdlIHN0YWNraW5nIGFuaW1hdGlvbnM/XG4gICAgICBpZihPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoICRtZS5vcHRpb25zLmFuaW1hdGlvbiApID09PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICBcdCQubWVyZ2UoJG1lLnF1ZXVlLCAkbWUub3B0aW9ucy5hbmltYXRpb24pO1xuICAgICAgfSBlbHNlIHtcblx0ICAgICAgJG1lLnF1ZXVlLnB1c2goJG1lLm9wdGlvbnMuYW5pbWF0aW9uKTtcblx0ICAgIH1cblxuXHQgICAgJG1lLmNsZWFuc2UoKTtcblxuXHQgICAgJG1lLmFuaW1hdGUoY2FsbGJhY2spO1xuICAgICAgXG4gICAgfSxcblxuICAgIC8vIFRoZSBhY3R1YWwgYWRkaW5nIG9mIHRoZSBjbGFzcyBhbmQgbGlzdGVuaW5nIGZvciBjb21wbGV0aW9uXG4gICAgYW5pbWF0ZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcblxuICAgIFx0dGhpcy5lbGVtZW50LmFkZENsYXNzKCdhbmltYXRlZCcpO1xuXG4gICAgICB0aGlzLmVsZW1lbnQuYWRkQ2xhc3ModGhpcy5xdWV1ZVswXSk7XG5cbiAgICAgIHRoaXMuZWxlbWVudC5kYXRhKFwiYW5pbW9cIiwgdGhpcy5xdWV1ZVswXSk7XG5cbiAgICAgIHZhciBhaSA9IHRoaXMucHJlZml4ZXMubGVuZ3RoO1xuXG4gICAgICAvLyBBZGQgdGhlIG9wdGlvbnMgZm9yIGVhY2ggcHJlZml4XG4gICAgICB3aGlsZShhaS0tKSB7XG5cbiAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcImFuaW1hdGlvbi1kdXJhdGlvblwiLCB0aGlzLm9wdGlvbnMuZHVyYXRpb24rXCJzXCIpO1xuXG4gICAgICBcdHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJhbmltYXRpb24taXRlcmF0aW9uLWNvdW50XCIsIHRoaXMub3B0aW9ucy5pdGVyYXRlKTtcblxuICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiYW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvblwiLCB0aGlzLm9wdGlvbnMudGltaW5nKTtcblxuICAgICAgfVxuXG4gICAgICB2YXIgJG1lID0gdGhpcywgX2NiID0gY2FsbGJhY2s7XG5cbiAgICAgIGlmKCRtZS5xdWV1ZS5sZW5ndGg+MSkge1xuICAgICAgICBfY2IgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICAvLyBMaXN0ZW4gZm9yIHRoZSBlbmQgb2YgdGhlIGFuaW1hdGlvblxuICAgICAgdGhpcy5fZW5kKFwiQW5pbWF0aW9uRW5kXCIsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIC8vIElmIHRoZXJlIGFyZSBtb3JlLCBjbGVhbiBpdCB1cCBhbmQgbW92ZSBvblxuICAgICAgXHRpZigkbWUuZWxlbWVudC5oYXNDbGFzcygkbWUucXVldWVbMF0pKSB7XG5cblx0ICAgIFx0XHRpZighJG1lLm9wdGlvbnMua2VlcCkge1xuICAgICAgICAgICAgJG1lLmNsZWFuc2UoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAkbWUucXVldWUuc2hpZnQoKTtcblxuXHQgICAgXHRcdGlmKCRtZS5xdWV1ZS5sZW5ndGgpIHtcblxuXHRcdCAgICAgIFx0JG1lLmFuaW1hdGUoY2FsbGJhY2spO1xuXHRcdCAgICAgIH1cblx0XHRcdCAgfVxuXHRcdCAgfSwgX2NiKTtcbiAgICB9LFxuXG4gICAgY2xlYW5zZTogZnVuY3Rpb24oKSB7XG5cbiAgICBcdHRoaXMuZWxlbWVudC5yZW1vdmVDbGFzcygnYW5pbWF0ZWQnKTtcblxuICBcdFx0dGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKHRoaXMucXVldWVbMF0pO1xuXG4gICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3ModGhpcy5lbGVtZW50LmRhdGEoXCJhbmltb1wiKSk7XG5cbiAgXHRcdHZhciBhaSA9IHRoaXMucHJlZml4ZXMubGVuZ3RoO1xuXG4gIFx0XHR3aGlsZShhaS0tKSB7XG5cbiAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcImFuaW1hdGlvbi1kdXJhdGlvblwiLCBcIlwiKTtcblxuICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiYW5pbWF0aW9uLWl0ZXJhdGlvbi1jb3VudFwiLCBcIlwiKTtcblxuICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiYW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvblwiLCBcIlwiKTtcblxuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1widHJhbnNpdGlvblwiLCBcIlwiKTtcblxuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1widHJhbnNmb3JtXCIsIFwiXCIpO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJmaWx0ZXJcIiwgXCJcIik7XG5cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX2JsdXI6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cbiAgICAgIGlmKHRoaXMuZWxlbWVudC5pcyhcImltZ1wiKSkge1xuXG4gICAgICBcdHZhciBzdmdfaWQgPSBcInN2Z19cIiArICgoKDEgKyBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDAwMCkgfCAwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpO1xuICAgICAgXHR2YXIgZmlsdGVyX2lkID0gXCJmaWx0ZXJfXCIgKyAoKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwMDApIHwgMCkudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKTtcblxuICAgICAgXHQkKCdib2R5JykuYXBwZW5kKCc8c3ZnIHZlcnNpb249XCIxLjFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgaWQ9XCInK3N2Z19pZCsnXCIgc3R5bGU9XCJoZWlnaHQ6MDtcIj48ZmlsdGVyIGlkPVwiJytmaWx0ZXJfaWQrJ1wiPjxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249XCInK3RoaXMub3B0aW9ucy5hbW91bnQrJ1wiIC8+PC9maWx0ZXI+PC9zdmc+Jyk7XG5cbiAgICAgIFx0dmFyIGFpID0gdGhpcy5wcmVmaXhlcy5sZW5ndGg7XG5cbiAgICBcdFx0d2hpbGUoYWktLSkge1xuXG4gICAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcImZpbHRlclwiLCBcImJsdXIoXCIrdGhpcy5vcHRpb25zLmFtb3VudCtcInB4KVwiKTtcblxuICAgICAgICBcdHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJ0cmFuc2l0aW9uXCIsIHRoaXMub3B0aW9ucy5kdXJhdGlvbitcInMgYWxsIGxpbmVhclwiKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LmNzcyhcImZpbHRlclwiLCBcInVybCgjXCIrZmlsdGVyX2lkK1wiKVwiKTtcblxuICAgICAgICB0aGlzLmVsZW1lbnQuZGF0YShcInN2Z2lkXCIsIHN2Z19pZCk7XG4gICAgICBcbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgdmFyIGNvbG9yID0gdGhpcy5lbGVtZW50LmNzcygnY29sb3InKTtcblxuICAgICAgICB2YXIgYWkgPSB0aGlzLnByZWZpeGVzLmxlbmd0aDtcblxuICAgICAgICAvLyBBZGQgdGhlIG9wdGlvbnMgZm9yIGVhY2ggcHJlZml4XG4gICAgICAgIHdoaWxlKGFpLS0pIHtcblxuICAgICAgICAgIHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJ0cmFuc2l0aW9uXCIsIFwiYWxsIFwiK3RoaXMub3B0aW9ucy5kdXJhdGlvbitcInMgbGluZWFyXCIpO1xuXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKFwidGV4dC1zaGFkb3dcIiwgXCIwIDAgXCIrdGhpcy5vcHRpb25zLmFtb3VudCtcInB4IFwiK2NvbG9yKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LmNzcyhcImNvbG9yXCIsIFwidHJhbnNwYXJlbnRcIik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2VuZChcIlRyYW5zaXRpb25FbmRcIiwgbnVsbCwgY2FsbGJhY2spO1xuXG4gICAgICB2YXIgJG1lID0gdGhpcztcblxuICAgICAgaWYodGhpcy5vcHRpb25zLmZvY3VzQWZ0ZXIpIHtcblxuICAgICAgICB2YXIgZm9jdXNfd2FpdCA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgJG1lLl9mb2N1cygpO1xuXG4gICAgICAgICAgZm9jdXNfd2FpdCA9IHdpbmRvdy5jbGVhclRpbWVvdXQoZm9jdXNfd2FpdCk7XG5cbiAgICAgICAgfSwgKHRoaXMub3B0aW9ucy5mb2N1c0FmdGVyKjEwMDApKTtcbiAgICAgIH1cblxuICAgIH0sXG5cbiAgICBfZm9jdXM6IGZ1bmN0aW9uKCkge1xuXG4gICAgXHR2YXIgYWkgPSB0aGlzLnByZWZpeGVzLmxlbmd0aDtcblxuICAgICAgaWYodGhpcy5lbGVtZW50LmlzKFwiaW1nXCIpKSB7XG5cbiAgICBcdFx0d2hpbGUoYWktLSkge1xuXG4gICAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcImZpbHRlclwiLCBcIlwiKTtcblxuICAgICAgICBcdHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJ0cmFuc2l0aW9uXCIsIFwiXCIpO1xuXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgJHN2ZyA9ICQoJyMnK3RoaXMuZWxlbWVudC5kYXRhKCdzdmdpZCcpKTtcblxuICAgICAgICAkc3ZnLnJlbW92ZSgpO1xuICAgICAgfSBlbHNlIHtcblxuICAgICAgICB3aGlsZShhaS0tKSB7XG5cbiAgICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1widHJhbnNpdGlvblwiLCBcIlwiKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LmNzcyhcInRleHQtc2hhZG93XCIsIFwiXCIpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKFwiY29sb3JcIiwgXCJcIik7XG4gICAgICB9XG4gICAgfSxcblxuICAgIF9yb3RhdGU6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cbiAgICAgIHZhciBhaSA9IHRoaXMucHJlZml4ZXMubGVuZ3RoO1xuXG4gICAgICAvLyBBZGQgdGhlIG9wdGlvbnMgZm9yIGVhY2ggcHJlZml4XG4gICAgICB3aGlsZShhaS0tKSB7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcInRyYW5zaXRpb25cIiwgXCJhbGwgXCIrdGhpcy5vcHRpb25zLmR1cmF0aW9uK1wicyBsaW5lYXJcIik7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcInRyYW5zZm9ybVwiLCBcInJvdGF0ZShcIit0aGlzLm9wdGlvbnMuZGVncmVlcytcImRlZylcIik7XG5cbiAgICAgIH1cblxuICAgICAgdGhpcy5fZW5kKFwiVHJhbnNpdGlvbkVuZFwiLCBudWxsLCBjYWxsYmFjayk7XG5cbiAgICB9LFxuXG4gICAgX2VuZDogZnVuY3Rpb24odHlwZSwgdG9kbywgY2FsbGJhY2spIHtcblxuICAgICAgdmFyICRtZSA9IHRoaXM7XG5cbiAgICAgIHZhciBiaW5kaW5nID0gdHlwZS50b0xvd2VyQ2FzZSgpK1wiIHdlYmtpdFwiK3R5cGUrXCIgb1wiK3R5cGUrXCIgTVNcIit0eXBlO1xuXG4gICAgICB0aGlzLmVsZW1lbnQuYmluZChiaW5kaW5nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgXG4gICAgICAgICRtZS5lbGVtZW50LnVuYmluZChiaW5kaW5nKTtcblxuICAgICAgICBpZih0eXBlb2YgdG9kbyA9PSBcImZ1bmN0aW9uXCIpIHtcblxuICAgICAgICAgIHRvZG8oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHR5cGVvZiBjYWxsYmFjayA9PSBcImZ1bmN0aW9uXCIpIHtcblxuICAgICAgICAgIGNhbGxiYWNrKCRtZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgXG4gICAgfVxuICB9O1xuXG4gICQuZm4uYW5pbW8gPSBmdW5jdGlvbiAoIG9wdGlvbnMsIGNhbGxiYWNrLCBvdGhlcl9jYiApIHtcbiAgICBcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0XG5cdFx0XHRuZXcgYW5pbW8oIHRoaXMsIG9wdGlvbnMsIGNhbGxiYWNrLCBvdGhlcl9jYiApO1xuXG5cdFx0fSk7XG5cbiAgfTtcblxufSkoIGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCApOyIsIi8qIVxuICogTW9ja0pheCAtIGpRdWVyeSBQbHVnaW4gdG8gTW9jayBBamF4IHJlcXVlc3RzXG4gKlxuICogVmVyc2lvbjogIDEuNS4zXG4gKiBSZWxlYXNlZDpcbiAqIEhvbWU6ICAgaHR0cDovL2dpdGh1Yi5jb20vYXBwZW5kdG8vanF1ZXJ5LW1vY2tqYXhcbiAqIEF1dGhvcjogICBKb25hdGhhbiBTaGFycCAoaHR0cDovL2pkc2hhcnAuY29tKVxuICogTGljZW5zZTogIE1JVCxHUExcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEgYXBwZW5kVG8gTExDLlxuICogRHVhbCBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIG9yIEdQTCBsaWNlbnNlcy5cbiAqIGh0dHA6Ly9hcHBlbmR0by5jb20vb3Blbi1zb3VyY2UtbGljZW5zZXNcbiAqL1xuKGZ1bmN0aW9uKCQpIHtcblx0dmFyIF9hamF4ID0gJC5hamF4LFxuXHRcdG1vY2tIYW5kbGVycyA9IFtdLFxuXHRcdG1vY2tlZEFqYXhDYWxscyA9IFtdLFxuXHRcdENBTExCQUNLX1JFR0VYID0gLz1cXD8oJnwkKS8sXG5cdFx0anNjID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcblxuXG5cdC8vIFBhcnNlIHRoZSBnaXZlbiBYTUwgc3RyaW5nLlxuXHRmdW5jdGlvbiBwYXJzZVhNTCh4bWwpIHtcblx0XHRpZiAoIHdpbmRvdy5ET01QYXJzZXIgPT0gdW5kZWZpbmVkICYmIHdpbmRvdy5BY3RpdmVYT2JqZWN0ICkge1xuXHRcdFx0RE9NUGFyc2VyID0gZnVuY3Rpb24oKSB7IH07XG5cdFx0XHRET01QYXJzZXIucHJvdG90eXBlLnBhcnNlRnJvbVN0cmluZyA9IGZ1bmN0aW9uKCB4bWxTdHJpbmcgKSB7XG5cdFx0XHRcdHZhciBkb2MgPSBuZXcgQWN0aXZlWE9iamVjdCgnTWljcm9zb2Z0LlhNTERPTScpO1xuXHRcdFx0XHRkb2MuYXN5bmMgPSAnZmFsc2UnO1xuXHRcdFx0XHRkb2MubG9hZFhNTCggeG1sU3RyaW5nICk7XG5cdFx0XHRcdHJldHVybiBkb2M7XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdHRyeSB7XG5cdFx0XHR2YXIgeG1sRG9jID0gKCBuZXcgRE9NUGFyc2VyKCkgKS5wYXJzZUZyb21TdHJpbmcoIHhtbCwgJ3RleHQveG1sJyApO1xuXHRcdFx0aWYgKCAkLmlzWE1MRG9jKCB4bWxEb2MgKSApIHtcblx0XHRcdFx0dmFyIGVyciA9ICQoJ3BhcnNlcmVycm9yJywgeG1sRG9jKTtcblx0XHRcdFx0aWYgKCBlcnIubGVuZ3RoID09IDEgKSB7XG5cdFx0XHRcdFx0dGhyb3coJ0Vycm9yOiAnICsgJCh4bWxEb2MpLnRleHQoKSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdygnVW5hYmxlIHRvIHBhcnNlIFhNTCcpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHhtbERvYztcblx0XHR9IGNhdGNoKCBlICkge1xuXHRcdFx0dmFyIG1zZyA9ICggZS5uYW1lID09IHVuZGVmaW5lZCA/IGUgOiBlLm5hbWUgKyAnOiAnICsgZS5tZXNzYWdlICk7XG5cdFx0XHQkKGRvY3VtZW50KS50cmlnZ2VyKCd4bWxQYXJzZUVycm9yJywgWyBtc2cgXSk7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0fVxuXG5cdC8vIFRyaWdnZXIgYSBqUXVlcnkgZXZlbnRcblx0ZnVuY3Rpb24gdHJpZ2dlcihzLCB0eXBlLCBhcmdzKSB7XG5cdFx0KHMuY29udGV4dCA/ICQocy5jb250ZXh0KSA6ICQuZXZlbnQpLnRyaWdnZXIodHlwZSwgYXJncyk7XG5cdH1cblxuXHQvLyBDaGVjayBpZiB0aGUgZGF0YSBmaWVsZCBvbiB0aGUgbW9jayBoYW5kbGVyIGFuZCB0aGUgcmVxdWVzdCBtYXRjaC4gVGhpc1xuXHQvLyBjYW4gYmUgdXNlZCB0byByZXN0cmljdCBhIG1vY2sgaGFuZGxlciB0byBiZWluZyB1c2VkIG9ubHkgd2hlbiBhIGNlcnRhaW5cblx0Ly8gc2V0IG9mIGRhdGEgaXMgcGFzc2VkIHRvIGl0LlxuXHRmdW5jdGlvbiBpc01vY2tEYXRhRXF1YWwoIG1vY2ssIGxpdmUgKSB7XG5cdFx0dmFyIGlkZW50aWNhbCA9IHRydWU7XG5cdFx0Ly8gVGVzdCBmb3Igc2l0dWF0aW9ucyB3aGVyZSB0aGUgZGF0YSBpcyBhIHF1ZXJ5c3RyaW5nIChub3QgYW4gb2JqZWN0KVxuXHRcdGlmICh0eXBlb2YgbGl2ZSA9PT0gJ3N0cmluZycpIHtcblx0XHRcdC8vIFF1ZXJ5c3RyaW5nIG1heSBiZSBhIHJlZ2V4XG5cdFx0XHRyZXR1cm4gJC5pc0Z1bmN0aW9uKCBtb2NrLnRlc3QgKSA/IG1vY2sudGVzdChsaXZlKSA6IG1vY2sgPT0gbGl2ZTtcblx0XHR9XG5cdFx0JC5lYWNoKG1vY2ssIGZ1bmN0aW9uKGspIHtcblx0XHRcdGlmICggbGl2ZVtrXSA9PT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHRpZGVudGljYWwgPSBmYWxzZTtcblx0XHRcdFx0cmV0dXJuIGlkZW50aWNhbDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmICggdHlwZW9mIGxpdmVba10gPT09ICdvYmplY3QnICYmIGxpdmVba10gIT09IG51bGwgKSB7XG5cdFx0XHRcdFx0aWYgKCBpZGVudGljYWwgJiYgJC5pc0FycmF5KCBsaXZlW2tdICkgKSB7XG5cdFx0XHRcdFx0XHRpZGVudGljYWwgPSAkLmlzQXJyYXkoIG1vY2tba10gKSAmJiBsaXZlW2tdLmxlbmd0aCA9PT0gbW9ja1trXS5sZW5ndGg7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlkZW50aWNhbCA9IGlkZW50aWNhbCAmJiBpc01vY2tEYXRhRXF1YWwobW9ja1trXSwgbGl2ZVtrXSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aWYgKCBtb2NrW2tdICYmICQuaXNGdW5jdGlvbiggbW9ja1trXS50ZXN0ICkgKSB7XG5cdFx0XHRcdFx0XHRpZGVudGljYWwgPSBpZGVudGljYWwgJiYgbW9ja1trXS50ZXN0KGxpdmVba10pO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRpZGVudGljYWwgPSBpZGVudGljYWwgJiYgKCBtb2NrW2tdID09IGxpdmVba10gKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiBpZGVudGljYWw7XG5cdH1cblxuICAgIC8vIFNlZSBpZiBhIG1vY2sgaGFuZGxlciBwcm9wZXJ0eSBtYXRjaGVzIHRoZSBkZWZhdWx0IHNldHRpbmdzXG4gICAgZnVuY3Rpb24gaXNEZWZhdWx0U2V0dGluZyhoYW5kbGVyLCBwcm9wZXJ0eSkge1xuICAgICAgICByZXR1cm4gaGFuZGxlcltwcm9wZXJ0eV0gPT09ICQubW9ja2pheFNldHRpbmdzW3Byb3BlcnR5XTtcbiAgICB9XG5cblx0Ly8gQ2hlY2sgdGhlIGdpdmVuIGhhbmRsZXIgc2hvdWxkIG1vY2sgdGhlIGdpdmVuIHJlcXVlc3Rcblx0ZnVuY3Rpb24gZ2V0TW9ja0ZvclJlcXVlc3QoIGhhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncyApIHtcblx0XHQvLyBJZiB0aGUgbW9jayB3YXMgcmVnaXN0ZXJlZCB3aXRoIGEgZnVuY3Rpb24sIGxldCB0aGUgZnVuY3Rpb24gZGVjaWRlIGlmIHdlXG5cdFx0Ly8gd2FudCB0byBtb2NrIHRoaXMgcmVxdWVzdFxuXHRcdGlmICggJC5pc0Z1bmN0aW9uKGhhbmRsZXIpICkge1xuXHRcdFx0cmV0dXJuIGhhbmRsZXIoIHJlcXVlc3RTZXR0aW5ncyApO1xuXHRcdH1cblxuXHRcdC8vIEluc3BlY3QgdGhlIFVSTCBvZiB0aGUgcmVxdWVzdCBhbmQgY2hlY2sgaWYgdGhlIG1vY2sgaGFuZGxlcidzIHVybFxuXHRcdC8vIG1hdGNoZXMgdGhlIHVybCBmb3IgdGhpcyBhamF4IHJlcXVlc3Rcblx0XHRpZiAoICQuaXNGdW5jdGlvbihoYW5kbGVyLnVybC50ZXN0KSApIHtcblx0XHRcdC8vIFRoZSB1c2VyIHByb3ZpZGVkIGEgcmVnZXggZm9yIHRoZSB1cmwsIHRlc3QgaXRcblx0XHRcdGlmICggIWhhbmRsZXIudXJsLnRlc3QoIHJlcXVlc3RTZXR0aW5ncy51cmwgKSApIHtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIExvb2sgZm9yIGEgc2ltcGxlIHdpbGRjYXJkICcqJyBvciBhIGRpcmVjdCBVUkwgbWF0Y2hcblx0XHRcdHZhciBzdGFyID0gaGFuZGxlci51cmwuaW5kZXhPZignKicpO1xuXHRcdFx0aWYgKGhhbmRsZXIudXJsICE9PSByZXF1ZXN0U2V0dGluZ3MudXJsICYmIHN0YXIgPT09IC0xIHx8XG5cdFx0XHRcdFx0IW5ldyBSZWdFeHAoaGFuZGxlci51cmwucmVwbGFjZSgvWy1bXFxde30oKSs/LixcXFxcXiR8I1xcc10vZywgXCJcXFxcJCZcIikucmVwbGFjZSgvXFwqL2csICcuKycpKS50ZXN0KHJlcXVlc3RTZXR0aW5ncy51cmwpKSB7XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIEluc3BlY3QgdGhlIGRhdGEgc3VibWl0dGVkIGluIHRoZSByZXF1ZXN0IChlaXRoZXIgUE9TVCBib2R5IG9yIEdFVCBxdWVyeSBzdHJpbmcpXG5cdFx0aWYgKCBoYW5kbGVyLmRhdGEgKSB7XG5cdFx0XHRpZiAoICEgcmVxdWVzdFNldHRpbmdzLmRhdGEgfHwgIWlzTW9ja0RhdGFFcXVhbChoYW5kbGVyLmRhdGEsIHJlcXVlc3RTZXR0aW5ncy5kYXRhKSApIHtcblx0XHRcdFx0Ly8gVGhleSdyZSBub3QgaWRlbnRpY2FsLCBkbyBub3QgbW9jayB0aGlzIHJlcXVlc3Rcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIEluc3BlY3QgdGhlIHJlcXVlc3QgdHlwZVxuXHRcdGlmICggaGFuZGxlciAmJiBoYW5kbGVyLnR5cGUgJiZcblx0XHRcdFx0aGFuZGxlci50eXBlLnRvTG93ZXJDYXNlKCkgIT0gcmVxdWVzdFNldHRpbmdzLnR5cGUudG9Mb3dlckNhc2UoKSApIHtcblx0XHRcdC8vIFRoZSByZXF1ZXN0IHR5cGUgZG9lc24ndCBtYXRjaCAoR0VUIHZzLiBQT1NUKVxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGhhbmRsZXI7XG5cdH1cblxuXHQvLyBQcm9jZXNzIHRoZSB4aHIgb2JqZWN0cyBzZW5kIG9wZXJhdGlvblxuXHRmdW5jdGlvbiBfeGhyU2VuZChtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MpIHtcblxuXHRcdC8vIFRoaXMgaXMgYSBzdWJzdGl0dXRlIGZvciA8IDEuNCB3aGljaCBsYWNrcyAkLnByb3h5XG5cdFx0dmFyIHByb2Nlc3MgPSAoZnVuY3Rpb24odGhhdCkge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHZhciBvblJlYWR5O1xuXG5cdFx0XHRcdFx0Ly8gVGhlIHJlcXVlc3QgaGFzIHJldHVybmVkXG5cdFx0XHRcdFx0dGhpcy5zdGF0dXMgICAgID0gbW9ja0hhbmRsZXIuc3RhdHVzO1xuXHRcdFx0XHRcdHRoaXMuc3RhdHVzVGV4dCA9IG1vY2tIYW5kbGVyLnN0YXR1c1RleHQ7XG5cdFx0XHRcdFx0dGhpcy5yZWFkeVN0YXRlXHQ9IDQ7XG5cblx0XHRcdFx0XHQvLyBXZSBoYXZlIGFuIGV4ZWN1dGFibGUgZnVuY3Rpb24sIGNhbGwgaXQgdG8gZ2l2ZVxuXHRcdFx0XHRcdC8vIHRoZSBtb2NrIGhhbmRsZXIgYSBjaGFuY2UgdG8gdXBkYXRlIGl0J3MgZGF0YVxuXHRcdFx0XHRcdGlmICggJC5pc0Z1bmN0aW9uKG1vY2tIYW5kbGVyLnJlc3BvbnNlKSApIHtcblx0XHRcdFx0XHRcdG1vY2tIYW5kbGVyLnJlc3BvbnNlKG9yaWdTZXR0aW5ncyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIENvcHkgb3ZlciBvdXIgbW9jayB0byBvdXIgeGhyIG9iamVjdCBiZWZvcmUgcGFzc2luZyBjb250cm9sIGJhY2sgdG9cblx0XHRcdFx0XHQvLyBqUXVlcnkncyBvbnJlYWR5c3RhdGVjaGFuZ2UgY2FsbGJhY2tcblx0XHRcdFx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSA9PSAnanNvbicgJiYgKCB0eXBlb2YgbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ID09ICdvYmplY3QnICkgKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnJlc3BvbnNlVGV4dCA9IEpTT04uc3RyaW5naWZ5KG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmICggcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlID09ICd4bWwnICkge1xuXHRcdFx0XHRcdFx0aWYgKCB0eXBlb2YgbW9ja0hhbmRsZXIucmVzcG9uc2VYTUwgPT0gJ3N0cmluZycgKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2VYTUwgPSBwYXJzZVhNTChtb2NrSGFuZGxlci5yZXNwb25zZVhNTCk7XG5cdFx0XHRcdFx0XHRcdC8vaW4galF1ZXJ5IDEuOS4xKywgcmVzcG9uc2VYTUwgaXMgcHJvY2Vzc2VkIGRpZmZlcmVudGx5IGFuZCByZWxpZXMgb24gcmVzcG9uc2VUZXh0XG5cdFx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2VUZXh0ID0gbW9ja0hhbmRsZXIucmVzcG9uc2VYTUw7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHR0aGlzLnJlc3BvbnNlWE1MID0gbW9ja0hhbmRsZXIucmVzcG9uc2VYTUw7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2VUZXh0ID0gbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiggdHlwZW9mIG1vY2tIYW5kbGVyLnN0YXR1cyA9PSAnbnVtYmVyJyB8fCB0eXBlb2YgbW9ja0hhbmRsZXIuc3RhdHVzID09ICdzdHJpbmcnICkge1xuXHRcdFx0XHRcdFx0dGhpcy5zdGF0dXMgPSBtb2NrSGFuZGxlci5zdGF0dXM7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmKCB0eXBlb2YgbW9ja0hhbmRsZXIuc3RhdHVzVGV4dCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRcdFx0dGhpcy5zdGF0dXNUZXh0ID0gbW9ja0hhbmRsZXIuc3RhdHVzVGV4dDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8galF1ZXJ5IDIuMCByZW5hbWVkIG9ucmVhZHlzdGF0ZWNoYW5nZSB0byBvbmxvYWRcblx0XHRcdFx0XHRvblJlYWR5ID0gdGhpcy5vbnJlYWR5c3RhdGVjaGFuZ2UgfHwgdGhpcy5vbmxvYWQ7XG5cblx0XHRcdFx0XHQvLyBqUXVlcnkgPCAxLjQgZG9lc24ndCBoYXZlIG9ucmVhZHlzdGF0ZSBjaGFuZ2UgZm9yIHhoclxuXHRcdFx0XHRcdGlmICggJC5pc0Z1bmN0aW9uKCBvblJlYWR5ICkgKSB7XG5cdFx0XHRcdFx0XHRpZiggbW9ja0hhbmRsZXIuaXNUaW1lb3V0KSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMuc3RhdHVzID0gLTE7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRvblJlYWR5LmNhbGwoIHRoaXMsIG1vY2tIYW5kbGVyLmlzVGltZW91dCA/ICd0aW1lb3V0JyA6IHVuZGVmaW5lZCApO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoIG1vY2tIYW5kbGVyLmlzVGltZW91dCApIHtcblx0XHRcdFx0XHRcdC8vIEZpeCBmb3IgMS4zLjIgdGltZW91dCB0byBrZWVwIHN1Y2Nlc3MgZnJvbSBmaXJpbmcuXG5cdFx0XHRcdFx0XHR0aGlzLnN0YXR1cyA9IC0xO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSkuYXBwbHkodGhhdCk7XG5cdFx0XHR9O1xuXHRcdH0pKHRoaXMpO1xuXG5cdFx0aWYgKCBtb2NrSGFuZGxlci5wcm94eSApIHtcblx0XHRcdC8vIFdlJ3JlIHByb3h5aW5nIHRoaXMgcmVxdWVzdCBhbmQgbG9hZGluZyBpbiBhbiBleHRlcm5hbCBmaWxlIGluc3RlYWRcblx0XHRcdF9hamF4KHtcblx0XHRcdFx0Z2xvYmFsOiBmYWxzZSxcblx0XHRcdFx0dXJsOiBtb2NrSGFuZGxlci5wcm94eSxcblx0XHRcdFx0dHlwZTogbW9ja0hhbmRsZXIucHJveHlUeXBlLFxuXHRcdFx0XHRkYXRhOiBtb2NrSGFuZGxlci5kYXRhLFxuXHRcdFx0XHRkYXRhVHlwZTogcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlID09PSBcInNjcmlwdFwiID8gXCJ0ZXh0L3BsYWluXCIgOiByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUsXG5cdFx0XHRcdGNvbXBsZXRlOiBmdW5jdGlvbih4aHIpIHtcblx0XHRcdFx0XHRtb2NrSGFuZGxlci5yZXNwb25zZVhNTCA9IHhoci5yZXNwb25zZVhNTDtcblx0XHRcdFx0XHRtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgPSB4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgICAgICAgICAgICAgICAvLyBEb24ndCBvdmVycmlkZSB0aGUgaGFuZGxlciBzdGF0dXMvc3RhdHVzVGV4dCBpZiBpdCdzIHNwZWNpZmllZCBieSB0aGUgY29uZmlnXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0RlZmF1bHRTZXR0aW5nKG1vY2tIYW5kbGVyLCAnc3RhdHVzJykpIHtcblx0XHRcdFx0XHQgICAgbW9ja0hhbmRsZXIuc3RhdHVzID0geGhyLnN0YXR1cztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNEZWZhdWx0U2V0dGluZyhtb2NrSGFuZGxlciwgJ3N0YXR1c1RleHQnKSkge1xuXHRcdFx0XHRcdCAgICBtb2NrSGFuZGxlci5zdGF0dXNUZXh0ID0geGhyLnN0YXR1c1RleHQ7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuXHRcdFx0XHRcdHRoaXMucmVzcG9uc2VUaW1lciA9IHNldFRpbWVvdXQocHJvY2VzcywgbW9ja0hhbmRsZXIucmVzcG9uc2VUaW1lIHx8IDApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gdHlwZSA9PSAnUE9TVCcgfHwgJ0dFVCcgfHwgJ0RFTEVURSdcblx0XHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmFzeW5jID09PSBmYWxzZSApIHtcblx0XHRcdFx0Ly8gVE9ETzogQmxvY2tpbmcgZGVsYXlcblx0XHRcdFx0cHJvY2VzcygpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5yZXNwb25zZVRpbWVyID0gc2V0VGltZW91dChwcm9jZXNzLCBtb2NrSGFuZGxlci5yZXNwb25zZVRpbWUgfHwgNTApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIENvbnN0cnVjdCBhIG1vY2tlZCBYSFIgT2JqZWN0XG5cdGZ1bmN0aW9uIHhocihtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MsIG9yaWdIYW5kbGVyKSB7XG5cdFx0Ly8gRXh0ZW5kIHdpdGggb3VyIGRlZmF1bHQgbW9ja2pheCBzZXR0aW5nc1xuXHRcdG1vY2tIYW5kbGVyID0gJC5leHRlbmQodHJ1ZSwge30sICQubW9ja2pheFNldHRpbmdzLCBtb2NrSGFuZGxlcik7XG5cblx0XHRpZiAodHlwZW9mIG1vY2tIYW5kbGVyLmhlYWRlcnMgPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRtb2NrSGFuZGxlci5oZWFkZXJzID0ge307XG5cdFx0fVxuXHRcdGlmICggbW9ja0hhbmRsZXIuY29udGVudFR5cGUgKSB7XG5cdFx0XHRtb2NrSGFuZGxlci5oZWFkZXJzWydjb250ZW50LXR5cGUnXSA9IG1vY2tIYW5kbGVyLmNvbnRlbnRUeXBlO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRzdGF0dXM6IG1vY2tIYW5kbGVyLnN0YXR1cyxcblx0XHRcdHN0YXR1c1RleHQ6IG1vY2tIYW5kbGVyLnN0YXR1c1RleHQsXG5cdFx0XHRyZWFkeVN0YXRlOiAxLFxuXHRcdFx0b3BlbjogZnVuY3Rpb24oKSB7IH0sXG5cdFx0XHRzZW5kOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0b3JpZ0hhbmRsZXIuZmlyZWQgPSB0cnVlO1xuXHRcdFx0XHRfeGhyU2VuZC5jYWxsKHRoaXMsIG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncyk7XG5cdFx0XHR9LFxuXHRcdFx0YWJvcnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjbGVhclRpbWVvdXQodGhpcy5yZXNwb25zZVRpbWVyKTtcblx0XHRcdH0sXG5cdFx0XHRzZXRSZXF1ZXN0SGVhZGVyOiBmdW5jdGlvbihoZWFkZXIsIHZhbHVlKSB7XG5cdFx0XHRcdG1vY2tIYW5kbGVyLmhlYWRlcnNbaGVhZGVyXSA9IHZhbHVlO1xuXHRcdFx0fSxcblx0XHRcdGdldFJlc3BvbnNlSGVhZGVyOiBmdW5jdGlvbihoZWFkZXIpIHtcblx0XHRcdFx0Ly8gJ0xhc3QtbW9kaWZpZWQnLCAnRXRhZycsICdjb250ZW50LXR5cGUnIGFyZSBhbGwgY2hlY2tlZCBieSBqUXVlcnlcblx0XHRcdFx0aWYgKCBtb2NrSGFuZGxlci5oZWFkZXJzICYmIG1vY2tIYW5kbGVyLmhlYWRlcnNbaGVhZGVyXSApIHtcblx0XHRcdFx0XHQvLyBSZXR1cm4gYXJiaXRyYXJ5IGhlYWRlcnNcblx0XHRcdFx0XHRyZXR1cm4gbW9ja0hhbmRsZXIuaGVhZGVyc1toZWFkZXJdO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCBoZWFkZXIudG9Mb3dlckNhc2UoKSA9PSAnbGFzdC1tb2RpZmllZCcgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG1vY2tIYW5kbGVyLmxhc3RNb2RpZmllZCB8fCAobmV3IERhdGUoKSkudG9TdHJpbmcoKTtcblx0XHRcdFx0fSBlbHNlIGlmICggaGVhZGVyLnRvTG93ZXJDYXNlKCkgPT0gJ2V0YWcnICkge1xuXHRcdFx0XHRcdHJldHVybiBtb2NrSGFuZGxlci5ldGFnIHx8ICcnO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCBoZWFkZXIudG9Mb3dlckNhc2UoKSA9PSAnY29udGVudC10eXBlJyApIHtcblx0XHRcdFx0XHRyZXR1cm4gbW9ja0hhbmRsZXIuY29udGVudFR5cGUgfHwgJ3RleHQvcGxhaW4nO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0Z2V0QWxsUmVzcG9uc2VIZWFkZXJzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGhlYWRlcnMgPSAnJztcblx0XHRcdFx0JC5lYWNoKG1vY2tIYW5kbGVyLmhlYWRlcnMsIGZ1bmN0aW9uKGssIHYpIHtcblx0XHRcdFx0XHRoZWFkZXJzICs9IGsgKyAnOiAnICsgdiArIFwiXFxuXCI7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXR1cm4gaGVhZGVycztcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cblx0Ly8gUHJvY2VzcyBhIEpTT05QIG1vY2sgcmVxdWVzdC5cblx0ZnVuY3Rpb24gcHJvY2Vzc0pzb25wTW9jayggcmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzICkge1xuXHRcdC8vIEhhbmRsZSBKU09OUCBQYXJhbWV0ZXIgQ2FsbGJhY2tzLCB3ZSBuZWVkIHRvIHJlcGxpY2F0ZSBzb21lIG9mIHRoZSBqUXVlcnkgY29yZSBoZXJlXG5cdFx0Ly8gYmVjYXVzZSB0aGVyZSBpc24ndCBhbiBlYXN5IGhvb2sgZm9yIHRoZSBjcm9zcyBkb21haW4gc2NyaXB0IHRhZyBvZiBqc29ucFxuXG5cdFx0cHJvY2Vzc0pzb25wVXJsKCByZXF1ZXN0U2V0dGluZ3MgKTtcblxuXHRcdHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSA9IFwianNvblwiO1xuXHRcdGlmKHJlcXVlc3RTZXR0aW5ncy5kYXRhICYmIENBTExCQUNLX1JFR0VYLnRlc3QocmVxdWVzdFNldHRpbmdzLmRhdGEpIHx8IENBTExCQUNLX1JFR0VYLnRlc3QocmVxdWVzdFNldHRpbmdzLnVybCkpIHtcblx0XHRcdGNyZWF0ZUpzb25wQ2FsbGJhY2socmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzKTtcblxuXHRcdFx0Ly8gV2UgbmVlZCB0byBtYWtlIHN1cmVcblx0XHRcdC8vIHRoYXQgYSBKU09OUCBzdHlsZSByZXNwb25zZSBpcyBleGVjdXRlZCBwcm9wZXJseVxuXG5cdFx0XHR2YXIgcnVybCA9IC9eKFxcdys6KT9cXC9cXC8oW15cXC8/I10rKS8sXG5cdFx0XHRcdHBhcnRzID0gcnVybC5leGVjKCByZXF1ZXN0U2V0dGluZ3MudXJsICksXG5cdFx0XHRcdHJlbW90ZSA9IHBhcnRzICYmIChwYXJ0c1sxXSAmJiBwYXJ0c1sxXSAhPT0gbG9jYXRpb24ucHJvdG9jb2wgfHwgcGFydHNbMl0gIT09IGxvY2F0aW9uLmhvc3QpO1xuXG5cdFx0XHRyZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgPSBcInNjcmlwdFwiO1xuXHRcdFx0aWYocmVxdWVzdFNldHRpbmdzLnR5cGUudG9VcHBlckNhc2UoKSA9PT0gXCJHRVRcIiAmJiByZW1vdGUgKSB7XG5cdFx0XHRcdHZhciBuZXdNb2NrUmV0dXJuID0gcHJvY2Vzc0pzb25wUmVxdWVzdCggcmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzICk7XG5cblx0XHRcdFx0Ly8gQ2hlY2sgaWYgd2UgYXJlIHN1cHBvc2VkIHRvIHJldHVybiBhIERlZmVycmVkIGJhY2sgdG8gdGhlIG1vY2sgY2FsbCwgb3IganVzdFxuXHRcdFx0XHQvLyBzaWduYWwgc3VjY2Vzc1xuXHRcdFx0XHRpZihuZXdNb2NrUmV0dXJuKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG5ld01vY2tSZXR1cm47XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHQvLyBBcHBlbmQgdGhlIHJlcXVpcmVkIGNhbGxiYWNrIHBhcmFtZXRlciB0byB0aGUgZW5kIG9mIHRoZSByZXF1ZXN0IFVSTCwgZm9yIGEgSlNPTlAgcmVxdWVzdFxuXHRmdW5jdGlvbiBwcm9jZXNzSnNvbnBVcmwoIHJlcXVlc3RTZXR0aW5ncyApIHtcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy50eXBlLnRvVXBwZXJDYXNlKCkgPT09IFwiR0VUXCIgKSB7XG5cdFx0XHRpZiAoICFDQUxMQkFDS19SRUdFWC50ZXN0KCByZXF1ZXN0U2V0dGluZ3MudXJsICkgKSB7XG5cdFx0XHRcdHJlcXVlc3RTZXR0aW5ncy51cmwgKz0gKC9cXD8vLnRlc3QoIHJlcXVlc3RTZXR0aW5ncy51cmwgKSA/IFwiJlwiIDogXCI/XCIpICtcblx0XHRcdFx0XHQocmVxdWVzdFNldHRpbmdzLmpzb25wIHx8IFwiY2FsbGJhY2tcIikgKyBcIj0/XCI7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICggIXJlcXVlc3RTZXR0aW5ncy5kYXRhIHx8ICFDQUxMQkFDS19SRUdFWC50ZXN0KHJlcXVlc3RTZXR0aW5ncy5kYXRhKSApIHtcblx0XHRcdHJlcXVlc3RTZXR0aW5ncy5kYXRhID0gKHJlcXVlc3RTZXR0aW5ncy5kYXRhID8gcmVxdWVzdFNldHRpbmdzLmRhdGEgKyBcIiZcIiA6IFwiXCIpICsgKHJlcXVlc3RTZXR0aW5ncy5qc29ucCB8fCBcImNhbGxiYWNrXCIpICsgXCI9P1wiO1xuXHRcdH1cblx0fVxuXG5cdC8vIFByb2Nlc3MgYSBKU09OUCByZXF1ZXN0IGJ5IGV2YWx1YXRpbmcgdGhlIG1vY2tlZCByZXNwb25zZSB0ZXh0XG5cdGZ1bmN0aW9uIHByb2Nlc3NKc29ucFJlcXVlc3QoIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyApIHtcblx0XHQvLyBTeW50aGVzaXplIHRoZSBtb2NrIHJlcXVlc3QgZm9yIGFkZGluZyBhIHNjcmlwdCB0YWdcblx0XHR2YXIgY2FsbGJhY2tDb250ZXh0ID0gb3JpZ1NldHRpbmdzICYmIG9yaWdTZXR0aW5ncy5jb250ZXh0IHx8IHJlcXVlc3RTZXR0aW5ncyxcblx0XHRcdG5ld01vY2sgPSBudWxsO1xuXG5cblx0XHQvLyBJZiB0aGUgcmVzcG9uc2UgaGFuZGxlciBvbiB0aGUgbW9vY2sgaXMgYSBmdW5jdGlvbiwgY2FsbCBpdFxuXHRcdGlmICggbW9ja0hhbmRsZXIucmVzcG9uc2UgJiYgJC5pc0Z1bmN0aW9uKG1vY2tIYW5kbGVyLnJlc3BvbnNlKSApIHtcblx0XHRcdG1vY2tIYW5kbGVyLnJlc3BvbnNlKG9yaWdTZXR0aW5ncyk7XG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0Ly8gRXZhbHVhdGUgdGhlIHJlc3BvbnNlVGV4dCBqYXZhc2NyaXB0IGluIGEgZ2xvYmFsIGNvbnRleHRcblx0XHRcdGlmKCB0eXBlb2YgbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ID09PSAnb2JqZWN0JyApIHtcblx0XHRcdFx0JC5nbG9iYWxFdmFsKCAnKCcgKyBKU09OLnN0cmluZ2lmeSggbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ICkgKyAnKScpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JC5nbG9iYWxFdmFsKCAnKCcgKyBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgKyAnKScpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIFN1Y2Nlc3NmdWwgcmVzcG9uc2Vcblx0XHRqc29ucFN1Y2Nlc3MoIHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0LCBtb2NrSGFuZGxlciApO1xuXHRcdGpzb25wQ29tcGxldGUoIHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0LCBtb2NrSGFuZGxlciApO1xuXG5cdFx0Ly8gSWYgd2UgYXJlIHJ1bm5pbmcgdW5kZXIgalF1ZXJ5IDEuNSssIHJldHVybiBhIGRlZmVycmVkIG9iamVjdFxuXHRcdGlmKCQuRGVmZXJyZWQpe1xuXHRcdFx0bmV3TW9jayA9IG5ldyAkLkRlZmVycmVkKCk7XG5cdFx0XHRpZih0eXBlb2YgbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ID09IFwib2JqZWN0XCIpe1xuXHRcdFx0XHRuZXdNb2NrLnJlc29sdmVXaXRoKCBjYWxsYmFja0NvbnRleHQsIFttb2NrSGFuZGxlci5yZXNwb25zZVRleHRdICk7XG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHRuZXdNb2NrLnJlc29sdmVXaXRoKCBjYWxsYmFja0NvbnRleHQsIFskLnBhcnNlSlNPTiggbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ICldICk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBuZXdNb2NrO1xuXHR9XG5cblxuXHQvLyBDcmVhdGUgdGhlIHJlcXVpcmVkIEpTT05QIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciB0aGUgcmVxdWVzdFxuXHRmdW5jdGlvbiBjcmVhdGVKc29ucENhbGxiYWNrKCByZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MgKSB7XG5cdFx0dmFyIGNhbGxiYWNrQ29udGV4dCA9IG9yaWdTZXR0aW5ncyAmJiBvcmlnU2V0dGluZ3MuY29udGV4dCB8fCByZXF1ZXN0U2V0dGluZ3M7XG5cdFx0dmFyIGpzb25wID0gcmVxdWVzdFNldHRpbmdzLmpzb25wQ2FsbGJhY2sgfHwgKFwianNvbnBcIiArIGpzYysrKTtcblxuXHRcdC8vIFJlcGxhY2UgdGhlID0/IHNlcXVlbmNlIGJvdGggaW4gdGhlIHF1ZXJ5IHN0cmluZyBhbmQgdGhlIGRhdGFcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5kYXRhICkge1xuXHRcdFx0cmVxdWVzdFNldHRpbmdzLmRhdGEgPSAocmVxdWVzdFNldHRpbmdzLmRhdGEgKyBcIlwiKS5yZXBsYWNlKENBTExCQUNLX1JFR0VYLCBcIj1cIiArIGpzb25wICsgXCIkMVwiKTtcblx0XHR9XG5cblx0XHRyZXF1ZXN0U2V0dGluZ3MudXJsID0gcmVxdWVzdFNldHRpbmdzLnVybC5yZXBsYWNlKENBTExCQUNLX1JFR0VYLCBcIj1cIiArIGpzb25wICsgXCIkMVwiKTtcblxuXG5cdFx0Ly8gSGFuZGxlIEpTT05QLXN0eWxlIGxvYWRpbmdcblx0XHR3aW5kb3dbIGpzb25wIF0gPSB3aW5kb3dbIGpzb25wIF0gfHwgZnVuY3Rpb24oIHRtcCApIHtcblx0XHRcdGRhdGEgPSB0bXA7XG5cdFx0XHRqc29ucFN1Y2Nlc3MoIHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0LCBtb2NrSGFuZGxlciApO1xuXHRcdFx0anNvbnBDb21wbGV0ZSggcmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyICk7XG5cdFx0XHQvLyBHYXJiYWdlIGNvbGxlY3Rcblx0XHRcdHdpbmRvd1sganNvbnAgXSA9IHVuZGVmaW5lZDtcblxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0ZGVsZXRlIHdpbmRvd1sganNvbnAgXTtcblx0XHRcdH0gY2F0Y2goZSkge31cblxuXHRcdFx0aWYgKCBoZWFkICkge1xuXHRcdFx0XHRoZWFkLnJlbW92ZUNoaWxkKCBzY3JpcHQgKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cblx0Ly8gVGhlIEpTT05QIHJlcXVlc3Qgd2FzIHN1Y2Nlc3NmdWxcblx0ZnVuY3Rpb24ganNvbnBTdWNjZXNzKHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0LCBtb2NrSGFuZGxlcikge1xuXHRcdC8vIElmIGEgbG9jYWwgY2FsbGJhY2sgd2FzIHNwZWNpZmllZCwgZmlyZSBpdCBhbmQgcGFzcyBpdCB0aGUgZGF0YVxuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLnN1Y2Nlc3MgKSB7XG5cdFx0XHRyZXF1ZXN0U2V0dGluZ3Muc3VjY2Vzcy5jYWxsKCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCB8fCBcIlwiLCBzdGF0dXMsIHt9ICk7XG5cdFx0fVxuXG5cdFx0Ly8gRmlyZSB0aGUgZ2xvYmFsIGNhbGxiYWNrXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZ2xvYmFsICkge1xuXHRcdFx0dHJpZ2dlcihyZXF1ZXN0U2V0dGluZ3MsIFwiYWpheFN1Y2Nlc3NcIiwgW3t9LCByZXF1ZXN0U2V0dGluZ3NdICk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gVGhlIEpTT05QIHJlcXVlc3Qgd2FzIGNvbXBsZXRlZFxuXHRmdW5jdGlvbiBqc29ucENvbXBsZXRlKHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0KSB7XG5cdFx0Ly8gUHJvY2VzcyByZXN1bHRcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5jb21wbGV0ZSApIHtcblx0XHRcdHJlcXVlc3RTZXR0aW5ncy5jb21wbGV0ZS5jYWxsKCBjYWxsYmFja0NvbnRleHQsIHt9ICwgc3RhdHVzICk7XG5cdFx0fVxuXG5cdFx0Ly8gVGhlIHJlcXVlc3Qgd2FzIGNvbXBsZXRlZFxuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmdsb2JhbCApIHtcblx0XHRcdHRyaWdnZXIoIFwiYWpheENvbXBsZXRlXCIsIFt7fSwgcmVxdWVzdFNldHRpbmdzXSApO1xuXHRcdH1cblxuXHRcdC8vIEhhbmRsZSB0aGUgZ2xvYmFsIEFKQVggY291bnRlclxuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmdsb2JhbCAmJiAhIC0tJC5hY3RpdmUgKSB7XG5cdFx0XHQkLmV2ZW50LnRyaWdnZXIoIFwiYWpheFN0b3BcIiApO1xuXHRcdH1cblx0fVxuXG5cblx0Ly8gVGhlIGNvcmUgJC5hamF4IHJlcGxhY2VtZW50LlxuXHRmdW5jdGlvbiBoYW5kbGVBamF4KCB1cmwsIG9yaWdTZXR0aW5ncyApIHtcblx0XHR2YXIgbW9ja1JlcXVlc3QsIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXI7XG5cblx0XHQvLyBJZiB1cmwgaXMgYW4gb2JqZWN0LCBzaW11bGF0ZSBwcmUtMS41IHNpZ25hdHVyZVxuXHRcdGlmICggdHlwZW9mIHVybCA9PT0gXCJvYmplY3RcIiApIHtcblx0XHRcdG9yaWdTZXR0aW5ncyA9IHVybDtcblx0XHRcdHVybCA9IHVuZGVmaW5lZDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gd29yayBhcm91bmQgdG8gc3VwcG9ydCAxLjUgc2lnbmF0dXJlXG5cdFx0XHRvcmlnU2V0dGluZ3MgPSBvcmlnU2V0dGluZ3MgfHwge307XG5cdFx0XHRvcmlnU2V0dGluZ3MudXJsID0gdXJsO1xuXHRcdH1cblxuXHRcdC8vIEV4dGVuZCB0aGUgb3JpZ2luYWwgc2V0dGluZ3MgZm9yIHRoZSByZXF1ZXN0XG5cdFx0cmVxdWVzdFNldHRpbmdzID0gJC5leHRlbmQodHJ1ZSwge30sICQuYWpheFNldHRpbmdzLCBvcmlnU2V0dGluZ3MpO1xuXG5cdFx0Ly8gSXRlcmF0ZSBvdmVyIG91ciBtb2NrIGhhbmRsZXJzIChpbiByZWdpc3RyYXRpb24gb3JkZXIpIHVudGlsIHdlIGZpbmRcblx0XHQvLyBvbmUgdGhhdCBpcyB3aWxsaW5nIHRvIGludGVyY2VwdCB0aGUgcmVxdWVzdFxuXHRcdGZvcih2YXIgayA9IDA7IGsgPCBtb2NrSGFuZGxlcnMubGVuZ3RoOyBrKyspIHtcblx0XHRcdGlmICggIW1vY2tIYW5kbGVyc1trXSApIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdG1vY2tIYW5kbGVyID0gZ2V0TW9ja0ZvclJlcXVlc3QoIG1vY2tIYW5kbGVyc1trXSwgcmVxdWVzdFNldHRpbmdzICk7XG5cdFx0XHRpZighbW9ja0hhbmRsZXIpIHtcblx0XHRcdFx0Ly8gTm8gdmFsaWQgbW9jayBmb3VuZCBmb3IgdGhpcyByZXF1ZXN0XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRtb2NrZWRBamF4Q2FsbHMucHVzaChyZXF1ZXN0U2V0dGluZ3MpO1xuXG5cdFx0XHQvLyBJZiBsb2dnaW5nIGlzIGVuYWJsZWQsIGxvZyB0aGUgbW9jayB0byB0aGUgY29uc29sZVxuXHRcdFx0JC5tb2NramF4U2V0dGluZ3MubG9nKCBtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzICk7XG5cblxuXHRcdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgJiYgcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlLnRvVXBwZXJDYXNlKCkgPT09ICdKU09OUCcgKSB7XG5cdFx0XHRcdGlmICgobW9ja1JlcXVlc3QgPSBwcm9jZXNzSnNvbnBNb2NrKCByZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MgKSkpIHtcblx0XHRcdFx0XHQvLyBUaGlzIG1vY2sgd2lsbCBoYW5kbGUgdGhlIEpTT05QIHJlcXVlc3Rcblx0XHRcdFx0XHRyZXR1cm4gbW9ja1JlcXVlc3Q7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXG5cdFx0XHQvLyBSZW1vdmVkIHRvIGZpeCAjNTQgLSBrZWVwIHRoZSBtb2NraW5nIGRhdGEgb2JqZWN0IGludGFjdFxuXHRcdFx0Ly9tb2NrSGFuZGxlci5kYXRhID0gcmVxdWVzdFNldHRpbmdzLmRhdGE7XG5cblx0XHRcdG1vY2tIYW5kbGVyLmNhY2hlID0gcmVxdWVzdFNldHRpbmdzLmNhY2hlO1xuXHRcdFx0bW9ja0hhbmRsZXIudGltZW91dCA9IHJlcXVlc3RTZXR0aW5ncy50aW1lb3V0O1xuXHRcdFx0bW9ja0hhbmRsZXIuZ2xvYmFsID0gcmVxdWVzdFNldHRpbmdzLmdsb2JhbDtcblxuXHRcdFx0Y29weVVybFBhcmFtZXRlcnMobW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyk7XG5cblx0XHRcdChmdW5jdGlvbihtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MsIG9yaWdIYW5kbGVyKSB7XG5cdFx0XHRcdG1vY2tSZXF1ZXN0ID0gX2FqYXguY2FsbCgkLCAkLmV4dGVuZCh0cnVlLCB7fSwgb3JpZ1NldHRpbmdzLCB7XG5cdFx0XHRcdFx0Ly8gTW9jayB0aGUgWEhSIG9iamVjdFxuXHRcdFx0XHRcdHhocjogZnVuY3Rpb24oKSB7IHJldHVybiB4aHIoIG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncywgb3JpZ0hhbmRsZXIgKTsgfVxuXHRcdFx0XHR9KSk7XG5cdFx0XHR9KShtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MsIG1vY2tIYW5kbGVyc1trXSk7XG5cblx0XHRcdHJldHVybiBtb2NrUmVxdWVzdDtcblx0XHR9XG5cblx0XHQvLyBXZSBkb24ndCBoYXZlIGEgbW9jayByZXF1ZXN0XG5cdFx0aWYoJC5tb2NramF4U2V0dGluZ3MudGhyb3dVbm1vY2tlZCA9PT0gdHJ1ZSkge1xuXHRcdFx0dGhyb3coJ0FKQVggbm90IG1vY2tlZDogJyArIG9yaWdTZXR0aW5ncy51cmwpO1xuXHRcdH1cblx0XHRlbHNlIHsgLy8gdHJpZ2dlciBhIG5vcm1hbCByZXF1ZXN0XG5cdFx0XHRyZXR1cm4gX2FqYXguYXBwbHkoJCwgW29yaWdTZXR0aW5nc10pO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQqIENvcGllcyBVUkwgcGFyYW1ldGVyIHZhbHVlcyBpZiB0aGV5IHdlcmUgY2FwdHVyZWQgYnkgYSByZWd1bGFyIGV4cHJlc3Npb25cblx0KiBAcGFyYW0ge09iamVjdH0gbW9ja0hhbmRsZXJcblx0KiBAcGFyYW0ge09iamVjdH0gb3JpZ1NldHRpbmdzXG5cdCovXG5cdGZ1bmN0aW9uIGNvcHlVcmxQYXJhbWV0ZXJzKG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MpIHtcblx0XHQvL3BhcmFtZXRlcnMgYXJlbid0IGNhcHR1cmVkIGlmIHRoZSBVUkwgaXNuJ3QgYSBSZWdFeHBcblx0XHRpZiAoIShtb2NrSGFuZGxlci51cmwgaW5zdGFuY2VvZiBSZWdFeHApKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdC8vaWYgbm8gVVJMIHBhcmFtcyB3ZXJlIGRlZmluZWQgb24gdGhlIGhhbmRsZXIsIGRvbid0IGF0dGVtcHQgYSBjYXB0dXJlXG5cdFx0aWYgKCFtb2NrSGFuZGxlci5oYXNPd25Qcm9wZXJ0eSgndXJsUGFyYW1zJykpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dmFyIGNhcHR1cmVzID0gbW9ja0hhbmRsZXIudXJsLmV4ZWMob3JpZ1NldHRpbmdzLnVybCk7XG5cdFx0Ly90aGUgd2hvbGUgUmVnRXhwIG1hdGNoIGlzIGFsd2F5cyB0aGUgZmlyc3QgdmFsdWUgaW4gdGhlIGNhcHR1cmUgcmVzdWx0c1xuXHRcdGlmIChjYXB0dXJlcy5sZW5ndGggPT09IDEpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y2FwdHVyZXMuc2hpZnQoKTtcblx0XHQvL3VzZSBoYW5kbGVyIHBhcmFtcyBhcyBrZXlzIGFuZCBjYXB0dXJlIHJlc3V0cyBhcyB2YWx1ZXNcblx0XHR2YXIgaSA9IDAsXG5cdFx0Y2FwdHVyZXNMZW5ndGggPSBjYXB0dXJlcy5sZW5ndGgsXG5cdFx0cGFyYW1zTGVuZ3RoID0gbW9ja0hhbmRsZXIudXJsUGFyYW1zLmxlbmd0aCxcblx0XHQvL2luIGNhc2UgdGhlIG51bWJlciBvZiBwYXJhbXMgc3BlY2lmaWVkIGlzIGxlc3MgdGhhbiBhY3R1YWwgY2FwdHVyZXNcblx0XHRtYXhJdGVyYXRpb25zID0gTWF0aC5taW4oY2FwdHVyZXNMZW5ndGgsIHBhcmFtc0xlbmd0aCksXG5cdFx0cGFyYW1WYWx1ZXMgPSB7fTtcblx0XHRmb3IgKGk7IGkgPCBtYXhJdGVyYXRpb25zOyBpKyspIHtcblx0XHRcdHZhciBrZXkgPSBtb2NrSGFuZGxlci51cmxQYXJhbXNbaV07XG5cdFx0XHRwYXJhbVZhbHVlc1trZXldID0gY2FwdHVyZXNbaV07XG5cdFx0fVxuXHRcdG9yaWdTZXR0aW5ncy51cmxQYXJhbXMgPSBwYXJhbVZhbHVlcztcblx0fVxuXG5cblx0Ly8gUHVibGljXG5cblx0JC5leHRlbmQoe1xuXHRcdGFqYXg6IGhhbmRsZUFqYXhcblx0fSk7XG5cblx0JC5tb2NramF4U2V0dGluZ3MgPSB7XG5cdFx0Ly91cmw6ICAgICAgICBudWxsLFxuXHRcdC8vdHlwZTogICAgICAgJ0dFVCcsXG5cdFx0bG9nOiAgICAgICAgICBmdW5jdGlvbiggbW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncyApIHtcblx0XHRcdGlmICggbW9ja0hhbmRsZXIubG9nZ2luZyA9PT0gZmFsc2UgfHxcblx0XHRcdFx0ICggdHlwZW9mIG1vY2tIYW5kbGVyLmxvZ2dpbmcgPT09ICd1bmRlZmluZWQnICYmICQubW9ja2pheFNldHRpbmdzLmxvZ2dpbmcgPT09IGZhbHNlICkgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGlmICggd2luZG93LmNvbnNvbGUgJiYgY29uc29sZS5sb2cgKSB7XG5cdFx0XHRcdHZhciBtZXNzYWdlID0gJ01PQ0sgJyArIHJlcXVlc3RTZXR0aW5ncy50eXBlLnRvVXBwZXJDYXNlKCkgKyAnOiAnICsgcmVxdWVzdFNldHRpbmdzLnVybDtcblx0XHRcdFx0dmFyIHJlcXVlc3QgPSAkLmV4dGVuZCh7fSwgcmVxdWVzdFNldHRpbmdzKTtcblxuXHRcdFx0XHRpZiAodHlwZW9mIGNvbnNvbGUubG9nID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2cobWVzc2FnZSwgcmVxdWVzdCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCBtZXNzYWdlICsgJyAnICsgSlNPTi5zdHJpbmdpZnkocmVxdWVzdCkgKTtcblx0XHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhtZXNzYWdlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXHRcdGxvZ2dpbmc6ICAgICAgIHRydWUsXG5cdFx0c3RhdHVzOiAgICAgICAgMjAwLFxuXHRcdHN0YXR1c1RleHQ6ICAgIFwiT0tcIixcblx0XHRyZXNwb25zZVRpbWU6ICA1MDAsXG5cdFx0aXNUaW1lb3V0OiAgICAgZmFsc2UsXG5cdFx0dGhyb3dVbm1vY2tlZDogZmFsc2UsXG5cdFx0Y29udGVudFR5cGU6ICAgJ3RleHQvcGxhaW4nLFxuXHRcdHJlc3BvbnNlOiAgICAgICcnLFxuXHRcdHJlc3BvbnNlVGV4dDogICcnLFxuXHRcdHJlc3BvbnNlWE1MOiAgICcnLFxuXHRcdHByb3h5OiAgICAgICAgICcnLFxuXHRcdHByb3h5VHlwZTogICAgICdHRVQnLFxuXG5cdFx0bGFzdE1vZGlmaWVkOiAgbnVsbCxcblx0XHRldGFnOiAgICAgICAgICAnJyxcblx0XHRoZWFkZXJzOiB7XG5cdFx0XHRldGFnOiAnSUpGQEgjQDkyM3VmODAyM2hGT0BJI0gjJyxcblx0XHRcdCdjb250ZW50LXR5cGUnIDogJ3RleHQvcGxhaW4nXG5cdFx0fVxuXHR9O1xuXG5cdCQubW9ja2pheCA9IGZ1bmN0aW9uKHNldHRpbmdzKSB7XG5cdFx0dmFyIGkgPSBtb2NrSGFuZGxlcnMubGVuZ3RoO1xuXHRcdG1vY2tIYW5kbGVyc1tpXSA9IHNldHRpbmdzO1xuXHRcdHJldHVybiBpO1xuXHR9O1xuXHQkLm1vY2tqYXhDbGVhciA9IGZ1bmN0aW9uKGkpIHtcblx0XHRpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT0gMSApIHtcblx0XHRcdG1vY2tIYW5kbGVyc1tpXSA9IG51bGw7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG1vY2tIYW5kbGVycyA9IFtdO1xuXHRcdH1cblx0XHRtb2NrZWRBamF4Q2FsbHMgPSBbXTtcblx0fTtcblx0JC5tb2NramF4LmhhbmRsZXIgPSBmdW5jdGlvbihpKSB7XG5cdFx0aWYgKCBhcmd1bWVudHMubGVuZ3RoID09IDEgKSB7XG5cdFx0XHRyZXR1cm4gbW9ja0hhbmRsZXJzW2ldO1xuXHRcdH1cblx0fTtcblx0JC5tb2NramF4Lm1vY2tlZEFqYXhDYWxscyA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBtb2NrZWRBamF4Q2FsbHM7XG5cdH07XG59KShqUXVlcnkpOyIsIi8qKlxuKiAgQWpheCBBdXRvY29tcGxldGUgZm9yIGpRdWVyeSwgdmVyc2lvbiAldmVyc2lvbiVcbiogIChjKSAyMDE1IFRvbWFzIEtpcmRhXG4qXG4qICBBamF4IEF1dG9jb21wbGV0ZSBmb3IgalF1ZXJ5IGlzIGZyZWVseSBkaXN0cmlidXRhYmxlIHVuZGVyIHRoZSB0ZXJtcyBvZiBhbiBNSVQtc3R5bGUgbGljZW5zZS5cbiogIEZvciBkZXRhaWxzLCBzZWUgdGhlIHdlYiBzaXRlOiBodHRwczovL2dpdGh1Yi5jb20vZGV2YnJpZGdlL2pRdWVyeS1BdXRvY29tcGxldGVcbiovXG5cbi8qanNsaW50ICBicm93c2VyOiB0cnVlLCB3aGl0ZTogdHJ1ZSwgcGx1c3BsdXM6IHRydWUsIHZhcnM6IHRydWUgKi9cbi8qZ2xvYmFsIGRlZmluZSwgd2luZG93LCBkb2N1bWVudCwgalF1ZXJ5LCBleHBvcnRzLCByZXF1aXJlICovXG5cbi8vIEV4cG9zZSBwbHVnaW4gYXMgYW4gQU1EIG1vZHVsZSBpZiBBTUQgbG9hZGVyIGlzIHByZXNlbnQ6XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgICAgIGRlZmluZShbJ2pxdWVyeSddLCBmYWN0b3J5KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgcmVxdWlyZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBCcm93c2VyaWZ5XG4gICAgICAgIGZhY3RvcnkocmVxdWlyZSgnanF1ZXJ5JykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEJyb3dzZXIgZ2xvYmFsc1xuICAgICAgICBmYWN0b3J5KGpRdWVyeSk7XG4gICAgfVxufShmdW5jdGlvbiAoJCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhclxuICAgICAgICB1dGlscyA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVzY2FwZVJlZ0V4Q2hhcnM6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvW1xcLVxcW1xcXVxcL1xce1xcfVxcKFxcKVxcKlxcK1xcP1xcLlxcXFxcXF5cXCRcXHxdL2csIFwiXFxcXCQmXCIpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY3JlYXRlTm9kZTogZnVuY3Rpb24gKGNvbnRhaW5lckNsYXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICAgICAgZGl2LmNsYXNzTmFtZSA9IGNvbnRhaW5lckNsYXNzO1xuICAgICAgICAgICAgICAgICAgICBkaXYuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICAgICAgICAgICAgICBkaXYuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRpdjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KCkpLFxuXG4gICAgICAgIGtleXMgPSB7XG4gICAgICAgICAgICBFU0M6IDI3LFxuICAgICAgICAgICAgVEFCOiA5LFxuICAgICAgICAgICAgUkVUVVJOOiAxMyxcbiAgICAgICAgICAgIExFRlQ6IDM3LFxuICAgICAgICAgICAgVVA6IDM4LFxuICAgICAgICAgICAgUklHSFQ6IDM5LFxuICAgICAgICAgICAgRE9XTjogNDBcbiAgICAgICAgfTtcblxuICAgIGZ1bmN0aW9uIEF1dG9jb21wbGV0ZShlbCwgb3B0aW9ucykge1xuICAgICAgICB2YXIgbm9vcCA9IGZ1bmN0aW9uICgpIHsgfSxcbiAgICAgICAgICAgIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgZGVmYXVsdHMgPSB7XG4gICAgICAgICAgICAgICAgYWpheFNldHRpbmdzOiB7fSxcbiAgICAgICAgICAgICAgICBhdXRvU2VsZWN0Rmlyc3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGFwcGVuZFRvOiBkb2N1bWVudC5ib2R5LFxuICAgICAgICAgICAgICAgIHNlcnZpY2VVcmw6IG51bGwsXG4gICAgICAgICAgICAgICAgbG9va3VwOiBudWxsLFxuICAgICAgICAgICAgICAgIG9uU2VsZWN0OiBudWxsLFxuICAgICAgICAgICAgICAgIHdpZHRoOiAnYXV0bycsXG4gICAgICAgICAgICAgICAgbWluQ2hhcnM6IDEsXG4gICAgICAgICAgICAgICAgbWF4SGVpZ2h0OiAzMDAsXG4gICAgICAgICAgICAgICAgZGVmZXJSZXF1ZXN0Qnk6IDAsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7fSxcbiAgICAgICAgICAgICAgICBmb3JtYXRSZXN1bHQ6IEF1dG9jb21wbGV0ZS5mb3JtYXRSZXN1bHQsXG4gICAgICAgICAgICAgICAgZGVsaW1pdGVyOiBudWxsLFxuICAgICAgICAgICAgICAgIHpJbmRleDogOTk5OSxcbiAgICAgICAgICAgICAgICB0eXBlOiAnR0VUJyxcbiAgICAgICAgICAgICAgICBub0NhY2hlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBvblNlYXJjaFN0YXJ0OiBub29wLFxuICAgICAgICAgICAgICAgIG9uU2VhcmNoQ29tcGxldGU6IG5vb3AsXG4gICAgICAgICAgICAgICAgb25TZWFyY2hFcnJvcjogbm9vcCxcbiAgICAgICAgICAgICAgICBwcmVzZXJ2ZUlucHV0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb250YWluZXJDbGFzczogJ2F1dG9jb21wbGV0ZS1zdWdnZXN0aW9ucycsXG4gICAgICAgICAgICAgICAgdGFiRGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAndGV4dCcsXG4gICAgICAgICAgICAgICAgY3VycmVudFJlcXVlc3Q6IG51bGwsXG4gICAgICAgICAgICAgICAgdHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwcmV2ZW50QmFkUXVlcmllczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBsb29rdXBGaWx0ZXI6IGZ1bmN0aW9uIChzdWdnZXN0aW9uLCBvcmlnaW5hbFF1ZXJ5LCBxdWVyeUxvd2VyQ2FzZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbi52YWx1ZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnlMb3dlckNhc2UpICE9PSAtMTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBhcmFtTmFtZTogJ3F1ZXJ5JyxcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1SZXN1bHQ6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIHJlc3BvbnNlID09PSAnc3RyaW5nJyA/ICQucGFyc2VKU09OKHJlc3BvbnNlKSA6IHJlc3BvbnNlO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2hvd05vU3VnZ2VzdGlvbk5vdGljZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgbm9TdWdnZXN0aW9uTm90aWNlOiAnTm8gcmVzdWx0cycsXG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb246ICdib3R0b20nLFxuICAgICAgICAgICAgICAgIGZvcmNlRml4UG9zaXRpb246IGZhbHNlXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIC8vIFNoYXJlZCB2YXJpYWJsZXM6XG4gICAgICAgIHRoYXQuZWxlbWVudCA9IGVsO1xuICAgICAgICB0aGF0LmVsID0gJChlbCk7XG4gICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSBbXTtcbiAgICAgICAgdGhhdC5iYWRRdWVyaWVzID0gW107XG4gICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgICAgICB0aGF0LmN1cnJlbnRWYWx1ZSA9IHRoYXQuZWxlbWVudC52YWx1ZTtcbiAgICAgICAgdGhhdC5pbnRlcnZhbElkID0gMDtcbiAgICAgICAgdGhhdC5jYWNoZWRSZXNwb25zZSA9IHt9O1xuICAgICAgICB0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwgPSBudWxsO1xuICAgICAgICB0aGF0Lm9uQ2hhbmdlID0gbnVsbDtcbiAgICAgICAgdGhhdC5pc0xvY2FsID0gZmFsc2U7XG4gICAgICAgIHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIgPSBudWxsO1xuICAgICAgICB0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIgPSBudWxsO1xuICAgICAgICB0aGF0Lm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgICAgICB0aGF0LmNsYXNzZXMgPSB7XG4gICAgICAgICAgICBzZWxlY3RlZDogJ2F1dG9jb21wbGV0ZS1zZWxlY3RlZCcsXG4gICAgICAgICAgICBzdWdnZXN0aW9uOiAnYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb24nXG4gICAgICAgIH07XG4gICAgICAgIHRoYXQuaGludCA9IG51bGw7XG4gICAgICAgIHRoYXQuaGludFZhbHVlID0gJyc7XG4gICAgICAgIHRoYXQuc2VsZWN0aW9uID0gbnVsbDtcblxuICAgICAgICAvLyBJbml0aWFsaXplIGFuZCBzZXQgb3B0aW9uczpcbiAgICAgICAgdGhhdC5pbml0aWFsaXplKCk7XG4gICAgICAgIHRoYXQuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICB9XG5cbiAgICBBdXRvY29tcGxldGUudXRpbHMgPSB1dGlscztcblxuICAgICQuQXV0b2NvbXBsZXRlID0gQXV0b2NvbXBsZXRlO1xuXG4gICAgQXV0b2NvbXBsZXRlLmZvcm1hdFJlc3VsdCA9IGZ1bmN0aW9uIChzdWdnZXN0aW9uLCBjdXJyZW50VmFsdWUpIHtcbiAgICAgICAgLy8gRG8gbm90IHJlcGxhY2UgYW55dGhpbmcgaWYgdGhlcmUgY3VycmVudCB2YWx1ZSBpcyBlbXB0eVxuICAgICAgICBpZiAoIWN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb24udmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciBwYXR0ZXJuID0gJygnICsgdXRpbHMuZXNjYXBlUmVnRXhDaGFycyhjdXJyZW50VmFsdWUpICsgJyknO1xuXG4gICAgICAgIHJldHVybiBzdWdnZXN0aW9uLnZhbHVlXG4gICAgICAgICAgICAucmVwbGFjZShuZXcgUmVnRXhwKHBhdHRlcm4sICdnaScpLCAnPHN0cm9uZz4kMTxcXC9zdHJvbmc+JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgICAgICAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvJmx0OyhcXC8/c3Ryb25nKSZndDsvZywgJzwkMT4nKTtcbiAgICB9O1xuXG4gICAgQXV0b2NvbXBsZXRlLnByb3RvdHlwZSA9IHtcblxuICAgICAgICBraWxsZXJGbjogbnVsbCxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgc3VnZ2VzdGlvblNlbGVjdG9yID0gJy4nICsgdGhhdC5jbGFzc2VzLnN1Z2dlc3Rpb24sXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSB0aGF0LmNsYXNzZXMuc2VsZWN0ZWQsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBjb250YWluZXI7XG5cbiAgICAgICAgICAgIC8vIFJlbW92ZSBhdXRvY29tcGxldGUgYXR0cmlidXRlIHRvIHByZXZlbnQgbmF0aXZlIHN1Z2dlc3Rpb25zOlxuICAgICAgICAgICAgdGhhdC5lbGVtZW50LnNldEF0dHJpYnV0ZSgnYXV0b2NvbXBsZXRlJywgJ29mZicpO1xuXG4gICAgICAgICAgICB0aGF0LmtpbGxlckZuID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoJChlLnRhcmdldCkuY2xvc2VzdCgnLicgKyB0aGF0Lm9wdGlvbnMuY29udGFpbmVyQ2xhc3MpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmtpbGxTdWdnZXN0aW9ucygpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmRpc2FibGVLaWxsZXJGbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIGh0bWwoKSBkZWFscyB3aXRoIG1hbnkgdHlwZXM6IGh0bWxTdHJpbmcgb3IgRWxlbWVudCBvciBBcnJheSBvciBqUXVlcnlcbiAgICAgICAgICAgIHRoYXQubm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQoJzxkaXYgY2xhc3M9XCJhdXRvY29tcGxldGUtbm8tc3VnZ2VzdGlvblwiPjwvZGl2PicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaHRtbCh0aGlzLm9wdGlvbnMubm9TdWdnZXN0aW9uTm90aWNlKS5nZXQoMCk7XG5cbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIgPSBBdXRvY29tcGxldGUudXRpbHMuY3JlYXRlTm9kZShvcHRpb25zLmNvbnRhaW5lckNsYXNzKTtcblxuICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZFRvKG9wdGlvbnMuYXBwZW5kVG8pO1xuXG4gICAgICAgICAgICAvLyBPbmx5IHNldCB3aWR0aCBpZiBpdCB3YXMgcHJvdmlkZWQ6XG4gICAgICAgICAgICBpZiAob3B0aW9ucy53aWR0aCAhPT0gJ2F1dG8nKSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLndpZHRoKG9wdGlvbnMud2lkdGgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBMaXN0ZW4gZm9yIG1vdXNlIG92ZXIgZXZlbnQgb24gc3VnZ2VzdGlvbnMgbGlzdDpcbiAgICAgICAgICAgIGNvbnRhaW5lci5vbignbW91c2VvdmVyLmF1dG9jb21wbGV0ZScsIHN1Z2dlc3Rpb25TZWxlY3RvciwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoYXQuYWN0aXZhdGUoJCh0aGlzKS5kYXRhKCdpbmRleCcpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBEZXNlbGVjdCBhY3RpdmUgZWxlbWVudCB3aGVuIG1vdXNlIGxlYXZlcyBzdWdnZXN0aW9ucyBjb250YWluZXI6XG4gICAgICAgICAgICBjb250YWluZXIub24oJ21vdXNlb3V0LmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuY2hpbGRyZW4oJy4nICsgc2VsZWN0ZWQpLnJlbW92ZUNsYXNzKHNlbGVjdGVkKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBMaXN0ZW4gZm9yIGNsaWNrIGV2ZW50IG9uIHN1Z2dlc3Rpb25zIGxpc3Q6XG4gICAgICAgICAgICBjb250YWluZXIub24oJ2NsaWNrLmF1dG9jb21wbGV0ZScsIHN1Z2dlc3Rpb25TZWxlY3RvciwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KCQodGhpcykuZGF0YSgnaW5kZXgnKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbkNhcHR1cmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoYXQudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuYXV0b2NvbXBsZXRlJywgdGhhdC5maXhQb3NpdGlvbkNhcHR1cmUpO1xuXG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdrZXlkb3duLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlQcmVzcyhlKTsgfSk7XG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdrZXl1cC5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5VXAoZSk7IH0pO1xuICAgICAgICAgICAgdGhhdC5lbC5vbignYmx1ci5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoKSB7IHRoYXQub25CbHVyKCk7IH0pO1xuICAgICAgICAgICAgdGhhdC5lbC5vbignZm9jdXMuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKCkgeyB0aGF0Lm9uRm9jdXMoKTsgfSk7XG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdjaGFuZ2UuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVVwKGUpOyB9KTtcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2lucHV0LmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlVcChlKTsgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Gb2N1czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmVsLnZhbCgpLmxlbmd0aCA+PSB0aGF0Lm9wdGlvbnMubWluQ2hhcnMpIHtcbiAgICAgICAgICAgICAgICB0aGF0Lm9uVmFsdWVDaGFuZ2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbkJsdXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuZW5hYmxlS2lsbGVyRm4oKTtcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIGFib3J0QWpheDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKHRoYXQuY3VycmVudFJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgICAgICAgICAgdGhhdC5jdXJyZW50UmVxdWVzdCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0T3B0aW9uczogZnVuY3Rpb24gKHN1cHBsaWVkT3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnM7XG5cbiAgICAgICAgICAgICQuZXh0ZW5kKG9wdGlvbnMsIHN1cHBsaWVkT3B0aW9ucyk7XG5cbiAgICAgICAgICAgIHRoYXQuaXNMb2NhbCA9ICQuaXNBcnJheShvcHRpb25zLmxvb2t1cCk7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmlzTG9jYWwpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmxvb2t1cCA9IHRoYXQudmVyaWZ5U3VnZ2VzdGlvbnNGb3JtYXQob3B0aW9ucy5sb29rdXApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvcHRpb25zLm9yaWVudGF0aW9uID0gdGhhdC52YWxpZGF0ZU9yaWVudGF0aW9uKG9wdGlvbnMub3JpZW50YXRpb24sICdib3R0b20nKTtcblxuICAgICAgICAgICAgLy8gQWRqdXN0IGhlaWdodCwgd2lkdGggYW5kIHotaW5kZXg6XG4gICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLmNzcyh7XG4gICAgICAgICAgICAgICAgJ21heC1oZWlnaHQnOiBvcHRpb25zLm1heEhlaWdodCArICdweCcsXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogb3B0aW9ucy53aWR0aCArICdweCcsXG4gICAgICAgICAgICAgICAgJ3otaW5kZXgnOiBvcHRpb25zLnpJbmRleFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cblxuICAgICAgICBjbGVhckNhY2hlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmNhY2hlZFJlc3BvbnNlID0ge307XG4gICAgICAgICAgICB0aGlzLmJhZFF1ZXJpZXMgPSBbXTtcbiAgICAgICAgfSxcblxuICAgICAgICBjbGVhcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5jbGVhckNhY2hlKCk7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRWYWx1ZSA9ICcnO1xuICAgICAgICAgICAgdGhpcy5zdWdnZXN0aW9ucyA9IFtdO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHRoYXQuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xuICAgICAgICAgICAgdGhhdC5hYm9ydEFqYXgoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbmFibGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBmaXhQb3NpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gVXNlIG9ubHkgd2hlbiBjb250YWluZXIgaGFzIGFscmVhZHkgaXRzIGNvbnRlbnRcblxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgICRjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lclBhcmVudCA9ICRjb250YWluZXIucGFyZW50KCkuZ2V0KDApO1xuICAgICAgICAgICAgLy8gRml4IHBvc2l0aW9uIGF1dG9tYXRpY2FsbHkgd2hlbiBhcHBlbmRlZCB0byBib2R5LlxuICAgICAgICAgICAgLy8gSW4gb3RoZXIgY2FzZXMgZm9yY2UgcGFyYW1ldGVyIG11c3QgYmUgZ2l2ZW4uXG4gICAgICAgICAgICBpZiAoY29udGFpbmVyUGFyZW50ICE9PSBkb2N1bWVudC5ib2R5ICYmICF0aGF0Lm9wdGlvbnMuZm9yY2VGaXhQb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2hvb3NlIG9yaWVudGF0aW9uXG4gICAgICAgICAgICB2YXIgb3JpZW50YXRpb24gPSB0aGF0Lm9wdGlvbnMub3JpZW50YXRpb24sXG4gICAgICAgICAgICAgICAgY29udGFpbmVySGVpZ2h0ID0gJGNvbnRhaW5lci5vdXRlckhlaWdodCgpLFxuICAgICAgICAgICAgICAgIGhlaWdodCA9IHRoYXQuZWwub3V0ZXJIZWlnaHQoKSxcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSB0aGF0LmVsLm9mZnNldCgpLFxuICAgICAgICAgICAgICAgIHN0eWxlcyA9IHsgJ3RvcCc6IG9mZnNldC50b3AsICdsZWZ0Jzogb2Zmc2V0LmxlZnQgfTtcblxuICAgICAgICAgICAgaWYgKG9yaWVudGF0aW9uID09PSAnYXV0bycpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmlld1BvcnRIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCksXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKSxcbiAgICAgICAgICAgICAgICAgICAgdG9wT3ZlcmZsb3cgPSAtc2Nyb2xsVG9wICsgb2Zmc2V0LnRvcCAtIGNvbnRhaW5lckhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgYm90dG9tT3ZlcmZsb3cgPSBzY3JvbGxUb3AgKyB2aWV3UG9ydEhlaWdodCAtIChvZmZzZXQudG9wICsgaGVpZ2h0ICsgY29udGFpbmVySGVpZ2h0KTtcblxuICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uID0gKE1hdGgubWF4KHRvcE92ZXJmbG93LCBib3R0b21PdmVyZmxvdykgPT09IHRvcE92ZXJmbG93KSA/ICd0b3AnIDogJ2JvdHRvbSc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcmllbnRhdGlvbiA9PT0gJ3RvcCcpIHtcbiAgICAgICAgICAgICAgICBzdHlsZXMudG9wICs9IC1jb250YWluZXJIZWlnaHQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN0eWxlcy50b3AgKz0gaGVpZ2h0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJZiBjb250YWluZXIgaXMgbm90IHBvc2l0aW9uZWQgdG8gYm9keSxcbiAgICAgICAgICAgIC8vIGNvcnJlY3QgaXRzIHBvc2l0aW9uIHVzaW5nIG9mZnNldCBwYXJlbnQgb2Zmc2V0XG4gICAgICAgICAgICBpZihjb250YWluZXJQYXJlbnQgIT09IGRvY3VtZW50LmJvZHkpIHtcbiAgICAgICAgICAgICAgICB2YXIgb3BhY2l0eSA9ICRjb250YWluZXIuY3NzKCdvcGFjaXR5JyksXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudE9mZnNldERpZmY7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGF0LnZpc2libGUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgJGNvbnRhaW5lci5jc3MoJ29wYWNpdHknLCAwKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHBhcmVudE9mZnNldERpZmYgPSAkY29udGFpbmVyLm9mZnNldFBhcmVudCgpLm9mZnNldCgpO1xuICAgICAgICAgICAgICAgIHN0eWxlcy50b3AgLT0gcGFyZW50T2Zmc2V0RGlmZi50b3A7XG4gICAgICAgICAgICAgICAgc3R5bGVzLmxlZnQgLT0gcGFyZW50T2Zmc2V0RGlmZi5sZWZ0O1xuXG4gICAgICAgICAgICAgICAgaWYgKCF0aGF0LnZpc2libGUpe1xuICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmNzcygnb3BhY2l0eScsIG9wYWNpdHkpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIC0ycHggdG8gYWNjb3VudCBmb3Igc3VnZ2VzdGlvbnMgYm9yZGVyLlxuICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy53aWR0aCA9PT0gJ2F1dG8nKSB7XG4gICAgICAgICAgICAgICAgc3R5bGVzLndpZHRoID0gKHRoYXQuZWwub3V0ZXJXaWR0aCgpIC0gMikgKyAncHgnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkY29udGFpbmVyLmNzcyhzdHlsZXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVuYWJsZUtpbGxlckZuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vbignY2xpY2suYXV0b2NvbXBsZXRlJywgdGhhdC5raWxsZXJGbik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzYWJsZUtpbGxlckZuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLmF1dG9jb21wbGV0ZScsIHRoYXQua2lsbGVyRm4pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGtpbGxTdWdnZXN0aW9uczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdGhhdC5zdG9wS2lsbFN1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgICB0aGF0LmludGVydmFsSWQgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGF0LnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhhdC5zdG9wS2lsbFN1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgICB9LCA1MCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3RvcEtpbGxTdWdnZXN0aW9uczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbElkKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc0N1cnNvckF0RW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgdmFsTGVuZ3RoID0gdGhhdC5lbC52YWwoKS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uU3RhcnQgPSB0aGF0LmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQsXG4gICAgICAgICAgICAgICAgcmFuZ2U7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2VsZWN0aW9uU3RhcnQgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGlvblN0YXJ0ID09PSB2YWxMZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmFuZ2UgPSBkb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgICAgICAgICByYW5nZS5tb3ZlU3RhcnQoJ2NoYXJhY3RlcicsIC12YWxMZW5ndGgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWxMZW5ndGggPT09IHJhbmdlLnRleHQubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25LZXlQcmVzczogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAgICAgLy8gSWYgc3VnZ2VzdGlvbnMgYXJlIGhpZGRlbiBhbmQgdXNlciBwcmVzc2VzIGFycm93IGRvd24sIGRpc3BsYXkgc3VnZ2VzdGlvbnM6XG4gICAgICAgICAgICBpZiAoIXRoYXQuZGlzYWJsZWQgJiYgIXRoYXQudmlzaWJsZSAmJiBlLndoaWNoID09PSBrZXlzLkRPV04gJiYgdGhhdC5jdXJyZW50VmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmRpc2FibGVkIHx8ICF0aGF0LnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5FU0M6XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5SSUdIVDpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuaGludCAmJiB0aGF0Lm9wdGlvbnMub25IaW50ICYmIHRoYXQuaXNDdXJzb3JBdEVuZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdEhpbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuVEFCOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5oaW50ICYmIHRoYXQub3B0aW9ucy5vbkhpbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0SGludCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCh0aGF0LnNlbGVjdGVkSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLnRhYkRpc2FibGVkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5SRVRVUk46XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCh0aGF0LnNlbGVjdGVkSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuVVA6XG4gICAgICAgICAgICAgICAgICAgIHRoYXQubW92ZVVwKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5ET1dOOlxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm1vdmVEb3duKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2FuY2VsIGV2ZW50IGlmIGZ1bmN0aW9uIGRpZCBub3QgcmV0dXJuOlxuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbktleVVwOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5kaXNhYmxlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3dpdGNoIChlLndoaWNoKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlVQOlxuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5ET1dOOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuY3VycmVudFZhbHVlICE9PSB0aGF0LmVsLnZhbCgpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5maW5kQmVzdEhpbnQoKTtcbiAgICAgICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLmRlZmVyUmVxdWVzdEJ5ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBEZWZlciBsb29rdXAgaW4gY2FzZSB3aGVuIHZhbHVlIGNoYW5nZXMgdmVyeSBxdWlja2x5OlxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uVmFsdWVDaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhhdC5vcHRpb25zLmRlZmVyUmVxdWVzdEJ5KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uVmFsdWVDaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25WYWx1ZUNoYW5nZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGF0LmVsLnZhbCgpLFxuICAgICAgICAgICAgICAgIHF1ZXJ5ID0gdGhhdC5nZXRRdWVyeSh2YWx1ZSk7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGlvbiAmJiB0aGF0LmN1cnJlbnRWYWx1ZSAhPT0gcXVlcnkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGlvbiA9IG51bGw7XG4gICAgICAgICAgICAgICAgKG9wdGlvbnMub25JbnZhbGlkYXRlU2VsZWN0aW9uIHx8ICQubm9vcCkuY2FsbCh0aGF0LmVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XG4gICAgICAgICAgICB0aGF0LmN1cnJlbnRWYWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGV4aXN0aW5nIHN1Z2dlc3Rpb24gZm9yIHRoZSBtYXRjaCBiZWZvcmUgcHJvY2VlZGluZzpcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQgJiYgdGhhdC5pc0V4YWN0TWF0Y2gocXVlcnkpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QoMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocXVlcnkubGVuZ3RoIDwgb3B0aW9ucy5taW5DaGFycykge1xuICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGF0LmdldFN1Z2dlc3Rpb25zKHF1ZXJ5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBpc0V4YWN0TWF0Y2g6IGZ1bmN0aW9uIChxdWVyeSkge1xuICAgICAgICAgICAgdmFyIHN1Z2dlc3Rpb25zID0gdGhpcy5zdWdnZXN0aW9ucztcblxuICAgICAgICAgICAgcmV0dXJuIChzdWdnZXN0aW9ucy5sZW5ndGggPT09IDEgJiYgc3VnZ2VzdGlvbnNbMF0udmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gcXVlcnkudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0UXVlcnk6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGRlbGltaXRlciA9IHRoaXMub3B0aW9ucy5kZWxpbWl0ZXIsXG4gICAgICAgICAgICAgICAgcGFydHM7XG5cbiAgICAgICAgICAgIGlmICghZGVsaW1pdGVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFydHMgPSB2YWx1ZS5zcGxpdChkZWxpbWl0ZXIpO1xuICAgICAgICAgICAgcmV0dXJuICQudHJpbShwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0U3VnZ2VzdGlvbnNMb2NhbDogZnVuY3Rpb24gKHF1ZXJ5KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBxdWVyeUxvd2VyQ2FzZSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCksXG4gICAgICAgICAgICAgICAgZmlsdGVyID0gb3B0aW9ucy5sb29rdXBGaWx0ZXIsXG4gICAgICAgICAgICAgICAgbGltaXQgPSBwYXJzZUludChvcHRpb25zLmxvb2t1cExpbWl0LCAxMCksXG4gICAgICAgICAgICAgICAgZGF0YTtcblxuICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9uczogJC5ncmVwKG9wdGlvbnMubG9va3VwLCBmdW5jdGlvbiAoc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmlsdGVyKHN1Z2dlc3Rpb24sIHF1ZXJ5LCBxdWVyeUxvd2VyQ2FzZSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChsaW1pdCAmJiBkYXRhLnN1Z2dlc3Rpb25zLmxlbmd0aCA+IGxpbWl0KSB7XG4gICAgICAgICAgICAgICAgZGF0YS5zdWdnZXN0aW9ucyA9IGRhdGEuc3VnZ2VzdGlvbnMuc2xpY2UoMCwgbGltaXQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTdWdnZXN0aW9uczogZnVuY3Rpb24gKHEpIHtcbiAgICAgICAgICAgIHZhciByZXNwb25zZSxcbiAgICAgICAgICAgICAgICB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIHNlcnZpY2VVcmwgPSBvcHRpb25zLnNlcnZpY2VVcmwsXG4gICAgICAgICAgICAgICAgcGFyYW1zLFxuICAgICAgICAgICAgICAgIGNhY2hlS2V5LFxuICAgICAgICAgICAgICAgIGFqYXhTZXR0aW5ncztcblxuICAgICAgICAgICAgb3B0aW9ucy5wYXJhbXNbb3B0aW9ucy5wYXJhbU5hbWVdID0gcTtcbiAgICAgICAgICAgIHBhcmFtcyA9IG9wdGlvbnMuaWdub3JlUGFyYW1zID8gbnVsbCA6IG9wdGlvbnMucGFyYW1zO1xuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5vblNlYXJjaFN0YXJ0LmNhbGwodGhhdC5lbGVtZW50LCBvcHRpb25zLnBhcmFtcykgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKG9wdGlvbnMubG9va3VwKSl7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5sb29rdXAocSwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IGRhdGEuc3VnZ2VzdGlvbnM7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIGRhdGEuc3VnZ2VzdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoYXQuaXNMb2NhbCkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gdGhhdC5nZXRTdWdnZXN0aW9uc0xvY2FsKHEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKHNlcnZpY2VVcmwpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VVcmwgPSBzZXJ2aWNlVXJsLmNhbGwodGhhdC5lbGVtZW50LCBxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FjaGVLZXkgPSBzZXJ2aWNlVXJsICsgJz8nICsgJC5wYXJhbShwYXJhbXMgfHwge30pO1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gdGhhdC5jYWNoZWRSZXNwb25zZVtjYWNoZUtleV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChyZXNwb25zZSAmJiAkLmlzQXJyYXkocmVzcG9uc2Uuc3VnZ2VzdGlvbnMpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IHJlc3BvbnNlLnN1Z2dlc3Rpb25zO1xuICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xuICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgcmVzcG9uc2Uuc3VnZ2VzdGlvbnMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghdGhhdC5pc0JhZFF1ZXJ5KHEpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5hYm9ydEFqYXgoKTtcblxuICAgICAgICAgICAgICAgIGFqYXhTZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBzZXJ2aWNlVXJsLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBwYXJhbXMsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IG9wdGlvbnMudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IG9wdGlvbnMuZGF0YVR5cGVcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgJC5leHRlbmQoYWpheFNldHRpbmdzLCBvcHRpb25zLmFqYXhTZXR0aW5ncyk7XG5cbiAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0ID0gJC5hamF4KGFqYXhTZXR0aW5ncykuZG9uZShmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gb3B0aW9ucy50cmFuc2Zvcm1SZXN1bHQoZGF0YSwgcSk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQucHJvY2Vzc1Jlc3BvbnNlKHJlc3VsdCwgcSwgY2FjaGVLZXkpO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIHJlc3VsdC5zdWdnZXN0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSkuZmFpbChmdW5jdGlvbiAoanFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hFcnJvci5jYWxsKHRoYXQuZWxlbWVudCwgcSwganFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaENvbXBsZXRlLmNhbGwodGhhdC5lbGVtZW50LCBxLCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNCYWRRdWVyeTogZnVuY3Rpb24gKHEpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5vcHRpb25zLnByZXZlbnRCYWRRdWVyaWVzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBiYWRRdWVyaWVzID0gdGhpcy5iYWRRdWVyaWVzLFxuICAgICAgICAgICAgICAgIGkgPSBiYWRRdWVyaWVzLmxlbmd0aDtcblxuICAgICAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgICAgICAgIGlmIChxLmluZGV4T2YoYmFkUXVlcmllc1tpXSkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGlkZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcik7XG5cbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24odGhhdC5vcHRpb25zLm9uSGlkZSkgJiYgdGhhdC52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5vcHRpb25zLm9uSGlkZS5jYWxsKHRoYXQuZWxlbWVudCwgY29udGFpbmVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcbiAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuaGlkZSgpO1xuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHN1Z2dlc3Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnN1Z2dlc3Rpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2hvd05vU3VnZ2VzdGlvbk5vdGljZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vU3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBncm91cEJ5ID0gb3B0aW9ucy5ncm91cEJ5LFxuICAgICAgICAgICAgICAgIGZvcm1hdFJlc3VsdCA9IG9wdGlvbnMuZm9ybWF0UmVzdWx0LFxuICAgICAgICAgICAgICAgIHZhbHVlID0gdGhhdC5nZXRRdWVyeSh0aGF0LmN1cnJlbnRWYWx1ZSksXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gdGhhdC5jbGFzc2VzLnN1Z2dlc3Rpb24sXG4gICAgICAgICAgICAgICAgY2xhc3NTZWxlY3RlZCA9IHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCxcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxuICAgICAgICAgICAgICAgIG5vU3VnZ2VzdGlvbnNDb250YWluZXIgPSAkKHRoYXQubm9TdWdnZXN0aW9uc0NvbnRhaW5lciksXG4gICAgICAgICAgICAgICAgYmVmb3JlUmVuZGVyID0gb3B0aW9ucy5iZWZvcmVSZW5kZXIsXG4gICAgICAgICAgICAgICAgaHRtbCA9ICcnLFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5LFxuICAgICAgICAgICAgICAgIGZvcm1hdEdyb3VwID0gZnVuY3Rpb24gKHN1Z2dlc3Rpb24sIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudENhdGVnb3J5ID0gc3VnZ2VzdGlvbi5kYXRhW2dyb3VwQnldO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2F0ZWdvcnkgPT09IGN1cnJlbnRDYXRlZ29yeSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeSA9IGN1cnJlbnRDYXRlZ29yeTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiYXV0b2NvbXBsZXRlLWdyb3VwXCI+PHN0cm9uZz4nICsgY2F0ZWdvcnkgKyAnPC9zdHJvbmc+PC9kaXY+JztcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dCAmJiB0aGF0LmlzRXhhY3RNYXRjaCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCgwKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEJ1aWxkIHN1Z2dlc3Rpb25zIGlubmVyIEhUTUw6XG4gICAgICAgICAgICAkLmVhY2godGhhdC5zdWdnZXN0aW9ucywgZnVuY3Rpb24gKGksIHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoZ3JvdXBCeSl7XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gZm9ybWF0R3JvdXAoc3VnZ2VzdGlvbiwgdmFsdWUsIGkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCInICsgY2xhc3NOYW1lICsgJ1wiIGRhdGEtaW5kZXg9XCInICsgaSArICdcIj4nICsgZm9ybWF0UmVzdWx0KHN1Z2dlc3Rpb24sIHZhbHVlKSArICc8L2Rpdj4nO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuYWRqdXN0Q29udGFpbmVyV2lkdGgoKTtcblxuICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lci5kZXRhY2goKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5odG1sKGh0bWwpO1xuXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKGJlZm9yZVJlbmRlcikpIHtcbiAgICAgICAgICAgICAgICBiZWZvcmVSZW5kZXIuY2FsbCh0aGF0LmVsZW1lbnQsIGNvbnRhaW5lcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5zaG93KCk7XG5cbiAgICAgICAgICAgIC8vIFNlbGVjdCBmaXJzdCB2YWx1ZSBieSBkZWZhdWx0OlxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuYXV0b1NlbGVjdEZpcnN0KSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wKDApO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jaGlsZHJlbignLicgKyBjbGFzc05hbWUpLmZpcnN0KCkuYWRkQ2xhc3MoY2xhc3NTZWxlY3RlZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQudmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICB0aGF0LmZpbmRCZXN0SGludCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG5vU3VnZ2VzdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKSxcbiAgICAgICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQodGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgdGhpcy5hZGp1c3RDb250YWluZXJXaWR0aCgpO1xuXG4gICAgICAgICAgICAvLyBTb21lIGV4cGxpY2l0IHN0ZXBzLiBCZSBjYXJlZnVsIGhlcmUgYXMgaXQgZWFzeSB0byBnZXRcbiAgICAgICAgICAgIC8vIG5vU3VnZ2VzdGlvbnNDb250YWluZXIgcmVtb3ZlZCBmcm9tIERPTSBpZiBub3QgZGV0YWNoZWQgcHJvcGVybHkuXG4gICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyLmRldGFjaCgpO1xuICAgICAgICAgICAgY29udGFpbmVyLmVtcHR5KCk7IC8vIGNsZWFuIHN1Z2dlc3Rpb25zIGlmIGFueVxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZChub1N1Z2dlc3Rpb25zQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xuXG4gICAgICAgICAgICBjb250YWluZXIuc2hvdygpO1xuICAgICAgICAgICAgdGhhdC52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGp1c3RDb250YWluZXJXaWR0aDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICB3aWR0aCxcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpO1xuXG4gICAgICAgICAgICAvLyBJZiB3aWR0aCBpcyBhdXRvLCBhZGp1c3Qgd2lkdGggYmVmb3JlIGRpc3BsYXlpbmcgc3VnZ2VzdGlvbnMsXG4gICAgICAgICAgICAvLyBiZWNhdXNlIGlmIGluc3RhbmNlIHdhcyBjcmVhdGVkIGJlZm9yZSBpbnB1dCBoYWQgd2lkdGgsIGl0IHdpbGwgYmUgemVyby5cbiAgICAgICAgICAgIC8vIEFsc28gaXQgYWRqdXN0cyBpZiBpbnB1dCB3aWR0aCBoYXMgY2hhbmdlZC5cbiAgICAgICAgICAgIC8vIC0ycHggdG8gYWNjb3VudCBmb3Igc3VnZ2VzdGlvbnMgYm9yZGVyLlxuICAgICAgICAgICAgaWYgKG9wdGlvbnMud2lkdGggPT09ICdhdXRvJykge1xuICAgICAgICAgICAgICAgIHdpZHRoID0gdGhhdC5lbC5vdXRlcldpZHRoKCkgLSAyO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci53aWR0aCh3aWR0aCA+IDAgPyB3aWR0aCA6IDMwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZmluZEJlc3RIaW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGF0LmVsLnZhbCgpLnRvTG93ZXJDYXNlKCksXG4gICAgICAgICAgICAgICAgYmVzdE1hdGNoID0gbnVsbDtcblxuICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJC5lYWNoKHRoYXQuc3VnZ2VzdGlvbnMsIGZ1bmN0aW9uIChpLCBzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZvdW5kTWF0Y2ggPSBzdWdnZXN0aW9uLnZhbHVlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZih2YWx1ZSkgPT09IDA7XG4gICAgICAgICAgICAgICAgaWYgKGZvdW5kTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoID0gc3VnZ2VzdGlvbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuICFmb3VuZE1hdGNoO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoYXQuc2lnbmFsSGludChiZXN0TWF0Y2gpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNpZ25hbEhpbnQ6IGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgaGludFZhbHVlID0gJycsXG4gICAgICAgICAgICAgICAgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICBpZiAoc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgICAgIGhpbnRWYWx1ZSA9IHRoYXQuY3VycmVudFZhbHVlICsgc3VnZ2VzdGlvbi52YWx1ZS5zdWJzdHIodGhhdC5jdXJyZW50VmFsdWUubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGF0LmhpbnRWYWx1ZSAhPT0gaGludFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5oaW50VmFsdWUgPSBoaW50VmFsdWU7XG4gICAgICAgICAgICAgICAgdGhhdC5oaW50ID0gc3VnZ2VzdGlvbjtcbiAgICAgICAgICAgICAgICAodGhpcy5vcHRpb25zLm9uSGludCB8fCAkLm5vb3ApKGhpbnRWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmVyaWZ5U3VnZ2VzdGlvbnNGb3JtYXQ6IGZ1bmN0aW9uIChzdWdnZXN0aW9ucykge1xuICAgICAgICAgICAgLy8gSWYgc3VnZ2VzdGlvbnMgaXMgc3RyaW5nIGFycmF5LCBjb252ZXJ0IHRoZW0gdG8gc3VwcG9ydGVkIGZvcm1hdDpcbiAgICAgICAgICAgIGlmIChzdWdnZXN0aW9ucy5sZW5ndGggJiYgdHlwZW9mIHN1Z2dlc3Rpb25zWzBdID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHJldHVybiAkLm1hcChzdWdnZXN0aW9ucywgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiB2YWx1ZSwgZGF0YTogbnVsbCB9O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbnM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmFsaWRhdGVPcmllbnRhdGlvbjogZnVuY3Rpb24ob3JpZW50YXRpb24sIGZhbGxiYWNrKSB7XG4gICAgICAgICAgICBvcmllbnRhdGlvbiA9ICQudHJpbShvcmllbnRhdGlvbiB8fCAnJykudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAgICAgaWYoJC5pbkFycmF5KG9yaWVudGF0aW9uLCBbJ2F1dG8nLCAnYm90dG9tJywgJ3RvcCddKSA9PT0gLTEpe1xuICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uID0gZmFsbGJhY2s7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBvcmllbnRhdGlvbjtcbiAgICAgICAgfSxcblxuICAgICAgICBwcm9jZXNzUmVzcG9uc2U6IGZ1bmN0aW9uIChyZXN1bHQsIG9yaWdpbmFsUXVlcnksIGNhY2hlS2V5KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucztcblxuICAgICAgICAgICAgcmVzdWx0LnN1Z2dlc3Rpb25zID0gdGhhdC52ZXJpZnlTdWdnZXN0aW9uc0Zvcm1hdChyZXN1bHQuc3VnZ2VzdGlvbnMpO1xuXG4gICAgICAgICAgICAvLyBDYWNoZSByZXN1bHRzIGlmIGNhY2hlIGlzIG5vdCBkaXNhYmxlZDpcbiAgICAgICAgICAgIGlmICghb3B0aW9ucy5ub0NhY2hlKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5jYWNoZWRSZXNwb25zZVtjYWNoZUtleV0gPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMucHJldmVudEJhZFF1ZXJpZXMgJiYgcmVzdWx0LnN1Z2dlc3Rpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmJhZFF1ZXJpZXMucHVzaChvcmlnaW5hbFF1ZXJ5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFJldHVybiBpZiBvcmlnaW5hbFF1ZXJ5IGlzIG5vdCBtYXRjaGluZyBjdXJyZW50IHF1ZXJ5OlxuICAgICAgICAgICAgaWYgKG9yaWdpbmFsUXVlcnkgIT09IHRoYXQuZ2V0UXVlcnkodGhhdC5jdXJyZW50VmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gcmVzdWx0LnN1Z2dlc3Rpb25zO1xuICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWN0aXZhdGU6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGFjdGl2ZUl0ZW0sXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSB0aGF0LmNsYXNzZXMuc2VsZWN0ZWQsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKSxcbiAgICAgICAgICAgICAgICBjaGlsZHJlbiA9IGNvbnRhaW5lci5maW5kKCcuJyArIHRoYXQuY2xhc3Nlcy5zdWdnZXN0aW9uKTtcblxuICAgICAgICAgICAgY29udGFpbmVyLmZpbmQoJy4nICsgc2VsZWN0ZWQpLnJlbW92ZUNsYXNzKHNlbGVjdGVkKTtcblxuICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gaW5kZXg7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggIT09IC0xICYmIGNoaWxkcmVuLmxlbmd0aCA+IHRoYXQuc2VsZWN0ZWRJbmRleCkge1xuICAgICAgICAgICAgICAgIGFjdGl2ZUl0ZW0gPSBjaGlsZHJlbi5nZXQodGhhdC5zZWxlY3RlZEluZGV4KTtcbiAgICAgICAgICAgICAgICAkKGFjdGl2ZUl0ZW0pLmFkZENsYXNzKHNlbGVjdGVkKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYWN0aXZlSXRlbTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VsZWN0SGludDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGkgPSAkLmluQXJyYXkodGhhdC5oaW50LCB0aGF0LnN1Z2dlc3Rpb25zKTtcblxuICAgICAgICAgICAgdGhhdC5zZWxlY3QoaSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VsZWN0OiBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICB0aGF0Lm9uU2VsZWN0KGkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1vdmVVcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuY2hpbGRyZW4oKS5maXJzdCgpLnJlbW92ZUNsYXNzKHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCk7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XG4gICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xuICAgICAgICAgICAgICAgIHRoYXQuZmluZEJlc3RIaW50KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LmFkanVzdFNjcm9sbCh0aGF0LnNlbGVjdGVkSW5kZXggLSAxKTtcbiAgICAgICAgfSxcblxuICAgICAgICBtb3ZlRG93bjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAodGhhdC5zdWdnZXN0aW9ucy5sZW5ndGggLSAxKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5hZGp1c3RTY3JvbGwodGhhdC5zZWxlY3RlZEluZGV4ICsgMSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRqdXN0U2Nyb2xsOiBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBhY3RpdmVJdGVtID0gdGhhdC5hY3RpdmF0ZShpbmRleCk7XG5cbiAgICAgICAgICAgIGlmICghYWN0aXZlSXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG9mZnNldFRvcCxcbiAgICAgICAgICAgICAgICB1cHBlckJvdW5kLFxuICAgICAgICAgICAgICAgIGxvd2VyQm91bmQsXG4gICAgICAgICAgICAgICAgaGVpZ2h0RGVsdGEgPSAkKGFjdGl2ZUl0ZW0pLm91dGVySGVpZ2h0KCk7XG5cbiAgICAgICAgICAgIG9mZnNldFRvcCA9IGFjdGl2ZUl0ZW0ub2Zmc2V0VG9wO1xuICAgICAgICAgICAgdXBwZXJCb3VuZCA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuc2Nyb2xsVG9wKCk7XG4gICAgICAgICAgICBsb3dlckJvdW5kID0gdXBwZXJCb3VuZCArIHRoYXQub3B0aW9ucy5tYXhIZWlnaHQgLSBoZWlnaHREZWx0YTtcblxuICAgICAgICAgICAgaWYgKG9mZnNldFRvcCA8IHVwcGVyQm91bmQpIHtcbiAgICAgICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnNjcm9sbFRvcChvZmZzZXRUb3ApO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvZmZzZXRUb3AgPiBsb3dlckJvdW5kKSB7XG4gICAgICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5zY3JvbGxUb3Aob2Zmc2V0VG9wIC0gdGhhdC5vcHRpb25zLm1heEhlaWdodCArIGhlaWdodERlbHRhKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF0aGF0Lm9wdGlvbnMucHJlc2VydmVJbnB1dCkge1xuICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuZ2V0VmFsdWUodGhhdC5zdWdnZXN0aW9uc1tpbmRleF0udmFsdWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoYXQuc2lnbmFsSGludChudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblNlbGVjdDogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb25TZWxlY3RDYWxsYmFjayA9IHRoYXQub3B0aW9ucy5vblNlbGVjdCxcbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9uID0gdGhhdC5zdWdnZXN0aW9uc1tpbmRleF07XG5cbiAgICAgICAgICAgIHRoYXQuY3VycmVudFZhbHVlID0gdGhhdC5nZXRWYWx1ZShzdWdnZXN0aW9uLnZhbHVlKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuY3VycmVudFZhbHVlICE9PSB0aGF0LmVsLnZhbCgpICYmICF0aGF0Lm9wdGlvbnMucHJlc2VydmVJbnB1dCkge1xuICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KG51bGwpO1xuICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IFtdO1xuICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb24gPSBzdWdnZXN0aW9uO1xuXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKG9uU2VsZWN0Q2FsbGJhY2spKSB7XG4gICAgICAgICAgICAgICAgb25TZWxlY3RDYWxsYmFjay5jYWxsKHRoYXQuZWxlbWVudCwgc3VnZ2VzdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0VmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGRlbGltaXRlciA9IHRoYXQub3B0aW9ucy5kZWxpbWl0ZXIsXG4gICAgICAgICAgICAgICAgY3VycmVudFZhbHVlLFxuICAgICAgICAgICAgICAgIHBhcnRzO1xuXG4gICAgICAgICAgICBpZiAoIWRlbGltaXRlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3VycmVudFZhbHVlID0gdGhhdC5jdXJyZW50VmFsdWU7XG4gICAgICAgICAgICBwYXJ0cyA9IGN1cnJlbnRWYWx1ZS5zcGxpdChkZWxpbWl0ZXIpO1xuXG4gICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gY3VycmVudFZhbHVlLnN1YnN0cigwLCBjdXJyZW50VmFsdWUubGVuZ3RoIC0gcGFydHNbcGFydHMubGVuZ3RoIC0gMV0ubGVuZ3RoKSArIHZhbHVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc3Bvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHRoYXQuZWwub2ZmKCcuYXV0b2NvbXBsZXRlJykucmVtb3ZlRGF0YSgnYXV0b2NvbXBsZXRlJyk7XG4gICAgICAgICAgICB0aGF0LmRpc2FibGVLaWxsZXJGbigpO1xuICAgICAgICAgICAgJCh3aW5kb3cpLm9mZigncmVzaXplLmF1dG9jb21wbGV0ZScsIHRoYXQuZml4UG9zaXRpb25DYXB0dXJlKTtcbiAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQ3JlYXRlIGNoYWluYWJsZSBqUXVlcnkgcGx1Z2luOlxuICAgICQuZm4uYXV0b2NvbXBsZXRlID0gJC5mbi5kZXZicmlkZ2VBdXRvY29tcGxldGUgPSBmdW5jdGlvbiAob3B0aW9ucywgYXJncykge1xuICAgICAgICB2YXIgZGF0YUtleSA9ICdhdXRvY29tcGxldGUnO1xuICAgICAgICAvLyBJZiBmdW5jdGlvbiBpbnZva2VkIHdpdGhvdXQgYXJndW1lbnQgcmV0dXJuXG4gICAgICAgIC8vIGluc3RhbmNlIG9mIHRoZSBmaXJzdCBtYXRjaGVkIGVsZW1lbnQ6XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maXJzdCgpLmRhdGEoZGF0YUtleSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBpbnB1dEVsZW1lbnQgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgIGluc3RhbmNlID0gaW5wdXRFbGVtZW50LmRhdGEoZGF0YUtleSk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UgJiYgdHlwZW9mIGluc3RhbmNlW29wdGlvbnNdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlW29wdGlvbnNdKGFyZ3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgaW5zdGFuY2UgYWxyZWFkeSBleGlzdHMsIGRlc3Ryb3kgaXQ6XG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlICYmIGluc3RhbmNlLmRpc3Bvc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UuZGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IG5ldyBBdXRvY29tcGxldGUodGhpcywgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgaW5wdXRFbGVtZW50LmRhdGEoZGF0YUtleSwgaW5zdGFuY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xufSkpO1xuIiwidmFyIG5vdGlmaWNhdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgdmFyIGNvbnRlaW5lcjtcbiAgdmFyIG1vdXNlT3ZlciA9IDA7XG4gIHZhciB0aW1lckNsZWFyQWxsID0gbnVsbDtcbiAgdmFyIGFuaW1hdGlvbkVuZCA9ICd3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kJztcbiAgdmFyIHRpbWUgPSAxMDAwMDtcblxuICB2YXIgbm90aWZpY2F0aW9uX2JveCA9ZmFsc2U7XG4gIHZhciBpc19pbml0PWZhbHNlO1xuICB2YXIgY29uZmlybV9vcHQ9e1xuICAgIHRpdGxlOlwi0KPQtNCw0LvQtdC90LjQtVwiLFxuICAgIHF1ZXN0aW9uOlwi0JLRiyDQtNC10LnRgdGC0LLQuNGC0LXQu9GM0L3QviDRhdC+0YLQuNGC0LUg0YPQtNCw0LvQuNGC0Yw/XCIsXG4gICAgYnV0dG9uWWVzOlwi0JTQsFwiLFxuICAgIGJ1dHRvbk5vOlwi0J3QtdGCXCIsXG4gICAgY2FsbGJhY2tZZXM6ZmFsc2UsXG4gICAgY2FsbGJhY2tObzpmYWxzZSxcbiAgICBvYmo6ZmFsc2UsXG4gICAgYnV0dG9uVGFnOidkaXYnLFxuICAgIGJ1dHRvblllc0RvcDonJyxcbiAgICBidXR0b25Ob0RvcDonJyxcbiAgfTtcbiAgdmFyIGFsZXJ0X29wdD17XG4gICAgdGl0bGU6XCJcIixcbiAgICBxdWVzdGlvbjpcItCh0L7QvtCx0YnQtdC90LjQtVwiLFxuICAgIGJ1dHRvblllczpcItCU0LBcIixcbiAgICBjYWxsYmFja1llczpmYWxzZSxcbiAgICBidXR0b25UYWc6J2RpdicsXG4gICAgb2JqOmZhbHNlLFxuICB9O1xuXG5cbiAgZnVuY3Rpb24gaW5pdCgpe1xuICAgIGlzX2luaXQ9dHJ1ZTtcbiAgICBub3RpZmljYXRpb25fYm94PSQoJy5ub3RpZmljYXRpb25fYm94Jyk7XG4gICAgaWYobm90aWZpY2F0aW9uX2JveC5sZW5ndGg+MClyZXR1cm47XG5cbiAgICAkKCdib2R5JykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nbm90aWZpY2F0aW9uX2JveCc+PC9kaXY+XCIpO1xuICAgIG5vdGlmaWNhdGlvbl9ib3g9JCgnLm5vdGlmaWNhdGlvbl9ib3gnKTtcblxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywnLm5vdGlmeV9jb250cm9sJyxjbG9zZU1vZGFsKTtcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsJy5ub3RpZnlfY2xvc2UnLGNsb3NlTW9kYWwpO1xuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJyxjbG9zZU1vZGFsRm9uKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb3NlTW9kYWwoKXtcbiAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XG4gIH1cblxuICBmdW5jdGlvbiBjbG9zZU1vZGFsRm9uKGUpe1xuICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG4gICAgaWYodGFyZ2V0LmNsYXNzTmFtZT09XCJub3RpZmljYXRpb25fYm94XCIpe1xuICAgICAgY2xvc2VNb2RhbCgpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBfc2V0VXBMaXN0ZW5lcnMgPSBmdW5jdGlvbigpIHtcbiAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5ub3RpZmljYXRpb25fY2xvc2UnLCBfY2xvc2VQb3B1cCk7XG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWVudGVyJywgJy5ub3RpZmljYXRpb25fY29udGFpbmVyJywgX29uRW50ZXIpO1xuICAgICQoJ2JvZHknKS5vbignbW91c2VsZWF2ZScsICcubm90aWZpY2F0aW9uX2NvbnRhaW5lcicsIF9vbkxlYXZlKTtcbiAgfTtcblxuICB2YXIgX29uRW50ZXIgPSBmdW5jdGlvbihldmVudCkge1xuICAgIGlmKGV2ZW50KWV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYgKHRpbWVyQ2xlYXJBbGwhPW51bGwpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lckNsZWFyQWxsKTtcbiAgICAgIHRpbWVyQ2xlYXJBbGwgPSBudWxsO1xuICAgIH1cbiAgICBjb250ZWluZXIuZmluZCgnLm5vdGlmaWNhdGlvbl9pdGVtJykuZWFjaChmdW5jdGlvbihpKXtcbiAgICAgIHZhciBvcHRpb249JCh0aGlzKS5kYXRhKCdvcHRpb24nKTtcbiAgICAgIGlmKG9wdGlvbi50aW1lcikge1xuICAgICAgICBjbGVhclRpbWVvdXQob3B0aW9uLnRpbWVyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBtb3VzZU92ZXIgPSAxO1xuICB9O1xuXG4gIHZhciBfb25MZWF2ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnRlaW5lci5maW5kKCcubm90aWZpY2F0aW9uX2l0ZW0nKS5lYWNoKGZ1bmN0aW9uKGkpe1xuICAgICAgJHRoaXM9JCh0aGlzKTtcbiAgICAgIHZhciBvcHRpb249JHRoaXMuZGF0YSgnb3B0aW9uJyk7XG4gICAgICBpZihvcHRpb24udGltZT4wKSB7XG4gICAgICAgIG9wdGlvbi50aW1lciA9IHNldFRpbWVvdXQoX2Nsb3NlUG9wdXAuYmluZChvcHRpb24uY2xvc2UpLCBvcHRpb24udGltZSAtIDE1MDAgKyAxMDAgKiBpKTtcbiAgICAgICAgJHRoaXMuZGF0YSgnb3B0aW9uJyxvcHRpb24pXG4gICAgICB9XG4gICAgfSk7XG4gICAgbW91c2VPdmVyID0gMDtcbiAgfTtcblxuICB2YXIgX2Nsb3NlUG9wdXAgPSBmdW5jdGlvbihldmVudCkge1xuICAgIGlmKGV2ZW50KWV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLnBhcmVudCgpO1xuICAgICR0aGlzLm9uKGFuaW1hdGlvbkVuZCwgZnVuY3Rpb24oKSB7XG4gICAgICAkKHRoaXMpLnJlbW92ZSgpO1xuICAgIH0pO1xuICAgICR0aGlzLmFkZENsYXNzKCdub3RpZmljYXRpb25faGlkZScpXG4gIH07XG5cbiAgZnVuY3Rpb24gYWxlcnQoZGF0YSl7XG4gICAgaWYoIWRhdGEpZGF0YT17fTtcbiAgICBkYXRhPW9iamVjdHMoYWxlcnRfb3B0LGRhdGEpO1xuXG4gICAgaWYoIWlzX2luaXQpaW5pdCgpO1xuXG4gICAgbm90eWZ5X2NsYXNzPSdub3RpZnlfYm94ICc7XG4gICAgaWYoZGF0YS5ub3R5ZnlfY2xhc3Mpbm90eWZ5X2NsYXNzKz1kYXRhLm5vdHlmeV9jbGFzcztcblxuICAgIGJveF9odG1sPSc8ZGl2IGNsYXNzPVwiJytub3R5ZnlfY2xhc3MrJ1wiPic7XG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X3RpdGxlXCI+JztcbiAgICBib3hfaHRtbCs9ZGF0YS50aXRsZTtcbiAgICBib3hfaHRtbCs9JzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xuXG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRlbnRcIj4nO1xuICAgIGJveF9odG1sKz1kYXRhLnF1ZXN0aW9uO1xuICAgIGJveF9odG1sKz0nPC9kaXY+JztcblxuICAgIGlmKGRhdGEuYnV0dG9uWWVzfHxkYXRhLmJ1dHRvbk5vKSB7XG4gICAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250cm9sXCI+JztcbiAgICAgIGlmIChkYXRhLmJ1dHRvblllcylib3hfaHRtbCArPSAnPCcrZGF0YS5idXR0b25UYWcrJyBjbGFzcz1cIm5vdGlmeV9idG5feWVzXCIgJytkYXRhLmJ1dHRvblllc0RvcCsnPicgKyBkYXRhLmJ1dHRvblllcyArICc8LycrZGF0YS5idXR0b25UYWcrJz4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzwnK2RhdGEuYnV0dG9uVGFnKycgY2xhc3M9XCJub3RpZnlfYnRuX25vXCIgJytkYXRhLmJ1dHRvbk5vRG9wKyc+JyArIGRhdGEuYnV0dG9uTm8gKyAnPC8nK2RhdGEuYnV0dG9uVGFnKyc+JztcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuICAgIH07XG5cbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XG4gICAgbm90aWZpY2F0aW9uX2JveC5odG1sKGJveF9odG1sKTtcblxuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcbiAgICB9LDEwMClcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbmZpcm0oZGF0YSl7XG4gICAgaWYoIWRhdGEpZGF0YT17fTtcbiAgICBkYXRhPW9iamVjdHMoY29uZmlybV9vcHQsZGF0YSk7XG5cbiAgICBpZighaXNfaW5pdClpbml0KCk7XG5cbiAgICBib3hfaHRtbD0nPGRpdiBjbGFzcz1cIm5vdGlmeV9ib3hcIj4nO1xuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV90aXRsZVwiPic7XG4gICAgYm94X2h0bWwrPWRhdGEudGl0bGU7XG4gICAgYm94X2h0bWwrPSc8c3BhbiBjbGFzcz1cIm5vdGlmeV9jbG9zZVwiPjwvc3Bhbj4nO1xuICAgIGJveF9odG1sKz0nPC9kaXY+JztcblxuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcbiAgICBib3hfaHRtbCs9ZGF0YS5xdWVzdGlvbjtcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XG5cbiAgICBpZihkYXRhLmJ1dHRvblllc3x8ZGF0YS5idXR0b25Obykge1xuICAgICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udHJvbFwiPic7XG4gICAgICBpZiAoZGF0YS5idXR0b25ZZXMpYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiPicgKyBkYXRhLmJ1dHRvblllcyArICc8L2Rpdj4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX25vXCI+JyArIGRhdGEuYnV0dG9uTm8gKyAnPC9kaXY+JztcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuICAgIH1cblxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xuXG4gICAgaWYoZGF0YS5jYWxsYmFja1llcyE9ZmFsc2Upe1xuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl95ZXMnKS5vbignY2xpY2snLGRhdGEuY2FsbGJhY2tZZXMuYmluZChkYXRhLm9iaikpO1xuICAgIH1cbiAgICBpZihkYXRhLmNhbGxiYWNrTm8hPWZhbHNlKXtcbiAgICAgIG5vdGlmaWNhdGlvbl9ib3guZmluZCgnLm5vdGlmeV9idG5fbm8nKS5vbignY2xpY2snLGRhdGEuY2FsbGJhY2tOby5iaW5kKGRhdGEub2JqKSk7XG4gICAgfVxuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcbiAgICB9LDEwMClcblxuICB9XG5cbiAgZnVuY3Rpb24gbm90aWZpKGRhdGEpIHtcbiAgICBpZighZGF0YSlkYXRhPXt9O1xuICAgIHZhciBvcHRpb24gPSB7dGltZSA6IChkYXRhLnRpbWV8fGRhdGEudGltZT09PTApP2RhdGEudGltZTp0aW1lfTtcbiAgICBpZiAoIWNvbnRlaW5lcikge1xuICAgICAgY29udGVpbmVyID0gJCgnPHVsLz4nLCB7XG4gICAgICAgICdjbGFzcyc6ICdub3RpZmljYXRpb25fY29udGFpbmVyJ1xuICAgICAgfSk7XG5cbiAgICAgICQoJ2JvZHknKS5hcHBlbmQoY29udGVpbmVyKTtcbiAgICAgIF9zZXRVcExpc3RlbmVycygpO1xuICAgIH1cblxuICAgIHZhciBsaSA9ICQoJzxsaS8+Jywge1xuICAgICAgY2xhc3M6ICdub3RpZmljYXRpb25faXRlbSdcbiAgICB9KTtcblxuICAgIGlmIChkYXRhLnR5cGUpe1xuICAgICAgbGkuYWRkQ2xhc3MoJ25vdGlmaWNhdGlvbl9pdGVtLScgKyBkYXRhLnR5cGUpO1xuICAgIH1cblxuICAgIHZhciBjbG9zZT0kKCc8c3Bhbi8+Jyx7XG4gICAgICBjbGFzczonbm90aWZpY2F0aW9uX2Nsb3NlJ1xuICAgIH0pO1xuICAgIG9wdGlvbi5jbG9zZT1jbG9zZTtcbiAgICBsaS5hcHBlbmQoY2xvc2UpO1xuXG4gICAgdmFyIGNvbnRlbnQgPSAkKCc8ZGl2Lz4nLHtcbiAgICAgIGNsYXNzOlwibm90aWZpY2F0aW9uX2NvbnRlbnRcIlxuICAgIH0pO1xuXG4gICAgaWYoZGF0YS50aXRsZSAmJiBkYXRhLnRpdGxlLmxlbmd0aD4wKSB7XG4gICAgICB2YXIgdGl0bGUgPSAkKCc8aDUvPicsIHtcbiAgICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX3RpdGxlXCJcbiAgICAgIH0pO1xuICAgICAgdGl0bGUuaHRtbChkYXRhLnRpdGxlKTtcbiAgICAgIGNvbnRlbnQuYXBwZW5kKHRpdGxlKTtcbiAgICB9XG5cbiAgICB2YXIgdGV4dD0gJCgnPGRpdi8+Jyx7XG4gICAgICBjbGFzczpcIm5vdGlmaWNhdGlvbl90ZXh0XCJcbiAgICB9KTtcbiAgICB0ZXh0Lmh0bWwoZGF0YS5tZXNzYWdlKTtcblxuICAgIGlmKGRhdGEuaW1nICYmIGRhdGEuaW1nLmxlbmd0aD4wKSB7XG4gICAgICB2YXIgaW1nID0gJCgnPGRpdi8+Jywge1xuICAgICAgICBjbGFzczogXCJub3RpZmljYXRpb25faW1nXCJcbiAgICAgIH0pO1xuICAgICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgnK2RhdGEuaW1nKycpJyk7XG4gICAgICB2YXIgd3JhcCA9ICQoJzxkaXYvPicsIHtcbiAgICAgICAgY2xhc3M6IFwid3JhcFwiXG4gICAgICB9KTtcblxuICAgICAgd3JhcC5hcHBlbmQoaW1nKTtcbiAgICAgIHdyYXAuYXBwZW5kKHRleHQpO1xuICAgICAgY29udGVudC5hcHBlbmQod3JhcCk7XG4gICAgfWVsc2V7XG4gICAgICBjb250ZW50LmFwcGVuZCh0ZXh0KTtcbiAgICB9XG4gICAgbGkuYXBwZW5kKGNvbnRlbnQpO1xuXG4gICAgLy9cbiAgICAvLyBpZihkYXRhLnRpdGxlICYmIGRhdGEudGl0bGUubGVuZ3RoPjApIHtcbiAgICAvLyAgIHZhciB0aXRsZSA9ICQoJzxwLz4nLCB7XG4gICAgLy8gICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90aXRsZVwiXG4gICAgLy8gICB9KTtcbiAgICAvLyAgIHRpdGxlLmh0bWwoZGF0YS50aXRsZSk7XG4gICAgLy8gICBsaS5hcHBlbmQodGl0bGUpO1xuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIGlmKGRhdGEuaW1nICYmIGRhdGEuaW1nLmxlbmd0aD4wKSB7XG4gICAgLy8gICB2YXIgaW1nID0gJCgnPGRpdi8+Jywge1xuICAgIC8vICAgICBjbGFzczogXCJub3RpZmljYXRpb25faW1nXCJcbiAgICAvLyAgIH0pO1xuICAgIC8vICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgnK2RhdGEuaW1nKycpJyk7XG4gICAgLy8gICBsaS5hcHBlbmQoaW1nKTtcbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyB2YXIgY29udGVudCA9ICQoJzxkaXYvPicse1xuICAgIC8vICAgY2xhc3M6XCJub3RpZmljYXRpb25fY29udGVudFwiXG4gICAgLy8gfSk7XG4gICAgLy8gY29udGVudC5odG1sKGRhdGEubWVzc2FnZSk7XG4gICAgLy9cbiAgICAvLyBsaS5hcHBlbmQoY29udGVudCk7XG4gICAgLy9cbiAgICAgY29udGVpbmVyLmFwcGVuZChsaSk7XG5cbiAgICBpZihvcHRpb24udGltZT4wKXtcbiAgICAgIG9wdGlvbi50aW1lcj1zZXRUaW1lb3V0KF9jbG9zZVBvcHVwLmJpbmQoY2xvc2UpLCBvcHRpb24udGltZSk7XG4gICAgfVxuICAgIGxpLmRhdGEoJ29wdGlvbicsb3B0aW9uKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBhbGVydDogYWxlcnQsXG4gICAgY29uZmlybTogY29uZmlybSxcbiAgICBub3RpZmk6IG5vdGlmaSxcbiAgfTtcblxufSkoKTtcblxuXG4kKCdbcmVmPXBvcHVwXScpLm9uKCdjbGljaycsZnVuY3Rpb24gKGUpe1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICR0aGlzPSQodGhpcyk7XG4gIGVsPSQoJHRoaXMuYXR0cignaHJlZicpKTtcbiAgZGF0YT1lbC5kYXRhKCk7XG5cbiAgZGF0YS5xdWVzdGlvbj1lbC5odG1sKCk7XG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcbn0pO1xuIiwiO1xuJChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gb25SZW1vdmUoKXtcbiAgICAkdGhpcz0kKHRoaXMpO1xuICAgIHBvc3Q9e1xuICAgICAgaWQ6JHRoaXMuYXR0cigndWlkJyksXG4gICAgICB0eXBlOiR0aGlzLmF0dHIoJ21vZGUnKVxuICAgIH07XG4gICAgJC5wb3N0KCR0aGlzLmF0dHIoJ3VybCcpLHBvc3QsZnVuY3Rpb24oZGF0YSl7XG4gICAgICBpZihkYXRhICYmIGRhdGE9PSdlcnInKXtcbiAgICAgICAgbXNnPSR0aGlzLmRhdGEoJ3JlbW92ZS1lcnJvcicpO1xuICAgICAgICBpZighbXNnKXtcbiAgICAgICAgICBtc2c9J9Cd0LXQstC+0LfQvNC+0LbQvdC+INGD0LTQsNC70LjRgtGMINGN0LvQtdC80LXQvdGCJztcbiAgICAgICAgfVxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOm1zZyx0eXBlOidlcnInfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbW9kZT0kdGhpcy5hdHRyKCdtb2RlJyk7XG4gICAgICBpZighbW9kZSl7XG4gICAgICAgIG1vZGU9J3JtJztcbiAgICAgIH1cblxuICAgICAgaWYobW9kZT09J3JtJykge1xuICAgICAgICBybSA9ICR0aGlzLmNsb3Nlc3QoJy50b19yZW1vdmUnKTtcbiAgICAgICAgcm1fY2xhc3MgPSBybS5hdHRyKCdybV9jbGFzcycpO1xuICAgICAgICBpZiAocm1fY2xhc3MpIHtcbiAgICAgICAgICAkKHJtX2NsYXNzKS5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJtLnJlbW92ZSgpO1xuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOifQo9GB0L/QtdGI0L3QvtC1INGD0LTQsNC70LXQvdC40LUuJyx0eXBlOidpbmZvJ30pXG4gICAgICB9XG4gICAgICBpZihtb2RlPT0ncmVsb2FkJyl7XG4gICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICBsb2NhdGlvbi5ocmVmPWxvY2F0aW9uLmhyZWY7XG4gICAgICB9XG4gICAgfSkuZmFpbChmdW5jdGlvbigpe1xuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0J7RiNC40LHQutCwINGD0LTQsNC70L3QuNGPJyx0eXBlOidlcnInfSk7XG4gICAgfSlcbiAgfVxuXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCcuYWpheF9yZW1vdmUnLGZ1bmN0aW9uKCl7XG4gICAgbm90aWZpY2F0aW9uLmNvbmZpcm0oe1xuICAgICAgY2FsbGJhY2tZZXM6b25SZW1vdmUsXG4gICAgICBvYmo6JCh0aGlzKVxuICAgIH0pXG4gIH0pO1xuXG59KTtcblxuIiwidmFyIGxnID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgbGFuZz17fTtcbiAgdXJsPScvbGFuZ3VhZ2UvJytkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQubGFuZysnLmpzb24nO1xuICAkLmdldCh1cmwsZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgICBmb3IodmFyIGluZGV4IGluIGRhdGEpIHtcbiAgICAgIGRhdGFbaW5kZXhdPWNsZWFyVmFyKGRhdGFbaW5kZXhdKTtcbiAgICB9XG4gICAgbGFuZz1kYXRhO1xuICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICB9LCdqc29uJylcblxuICBmdW5jdGlvbiBjbGVhclZhcih0eHQpe1xuICAgIHR4dD10eHQucmVwbGFjZSgvXFxzKy9nLFwiIFwiKTsvL9GD0LTQsNC70LXQvdC40LUg0LfQsNC00LLQvtC10L3QuNC1INC/0YDQvtCx0LXQu9C+0LJcblxuICAgIC8v0KfQuNGB0YLQuNC8INC/0L7QtNGB0YLQsNCy0LvRj9C10LzRi9C1INC/0LXRgNC10LzQtdC90L3Ri9C1XG4gICAgc3RyPXR4dC5tYXRjaCgvXFx7KC4qPylcXH0vZyk7XG4gICAgaWYgKCBzdHIgIT0gbnVsbCkge1xuICAgICAgZm9yICggaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIHN0cl90PXN0cltpXS5yZXBsYWNlKC8gL2csXCJcIik7XG4gICAgICAgIHR4dD10eHQucmVwbGFjZShzdHJbaV0sc3RyX3QpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHh0O1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHRwbCxkYXRhKXtcbiAgICBpZih0eXBlb2YobGFuZ1t0cGxdKT09XCJ1bmRlZmluZWRcIil7XG4gICAgICBjb25zb2xlLmxvZyhcImxhbmcgbm90IGZvdW5kOiBcIit0cGwpO1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIHRwbD1sYW5nW3RwbF07XG4gICAgaWYodHlwZW9mKGRhdGEpPT1cIm9iamVjdFwiKXtcbiAgICAgIGZvcih2YXIgaW5kZXggaW4gZGF0YSkge1xuICAgICAgICB0cGw9dHBsLnNwbGl0KFwie1wiK2luZGV4K1wifVwiKS5qb2luKGRhdGFbaW5kZXhdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRwbDtcbiAgfVxufSkoKTsiLCIvLyQod2luZG93KS5sb2FkKGZ1bmN0aW9uKCkge1xuXG52YXIgYWNjb3JkaW9uQ29udHJvbCA9ICQoJy5hY2NvcmRpb24gLmFjY29yZGlvbi1jb250cm9sJyk7XG5cbmFjY29yZGlvbkNvbnRyb2wub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJHRoaXMgPSAkKHRoaXMpO1xuICAgICRhY2NvcmRpb24gPSAkdGhpcy5jbG9zZXN0KCcuYWNjb3JkaW9uJyk7XG5cbiAgICBpZiAoJGFjY29yZGlvbi5oYXNDbGFzcygnb3BlbicpKSB7XG4gICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLmhpZGUoMzAwKTtcbiAgICAgICRhY2NvcmRpb24ucmVtb3ZlQ2xhc3MoJ29wZW4nKVxuICAgIH0gZWxzZSB7XG4gICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLnNob3coMzAwKTtcbiAgICAgICRhY2NvcmRpb24uYWRkQ2xhc3MoJ29wZW4nKVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xuYWNjb3JkaW9uQ29udHJvbC5zaG93KCk7XG4vL30pXG5cbm9iamVjdHMgPSBmdW5jdGlvbiAoYSxiKSB7XG4gIHZhciBjID0gYixcbiAgICBrZXk7XG4gIGZvciAoa2V5IGluIGEpIHtcbiAgICBpZiAoYS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICBjW2tleV0gPSBrZXkgaW4gYiA/IGJba2V5XSA6IGFba2V5XTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGM7XG59O1xuXG4kKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBpbWdfbG9hZF9maW5pc2goKXtcbiAgICBkYXRhPXRoaXM7XG4gICAgaWYoZGF0YS50eXBlPT0wKSB7XG4gICAgICBkYXRhLmltZy5hdHRyKCdzcmMnLCBkYXRhLnNyYyk7XG4gICAgfWVsc2V7XG4gICAgICBkYXRhLmltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcrZGF0YS5zcmMrJyknKTtcbiAgICAgIGRhdGEuaW1nLnJlbW92ZUNsYXNzKCdub19hdmEnKTtcbiAgICB9XG4gIH1cblxuICAvL9GC0LXRgdGCINC70L7Qs9C+INC80LDQs9Cw0LfQuNC90LBcbiAgaW1ncz0kKCdzZWN0aW9uOm5vdCgubmF2aWdhdGlvbiknKS5maW5kKCcubG9nbyBpbWcnKTtcbiAgZm9yICh2YXIgaT0wO2k8aW1ncy5sZW5ndGg7aSsrKXtcbiAgICBpbWc9aW1ncy5lcShpKTtcbiAgICBzcmM9aW1nLmF0dHIoJ3NyYycpO1xuICAgIGltZy5hdHRyKCdzcmMnLCcvaW1hZ2VzL3RlbXBsYXRlLWxvZ28uanBnJyk7XG4gICAgZGF0YT17XG4gICAgICBzcmM6c3JjLFxuICAgICAgaW1nOmltZyxcbiAgICAgIHR5cGU6MCAvLyDQtNC70Y8gaW1nW3NyY11cbiAgICB9O1xuICAgIGltYWdlPSQoJzxpbWcvPicse1xuICAgICAgc3JjOnNyY1xuICAgIH0pLm9uKCdsb2FkJyxpbWdfbG9hZF9maW5pc2guYmluZChkYXRhKSlcbiAgfVxuXG4gIC8v0YLQtdGB0YIg0LDQstCw0YLQsNGA0L7QuiDQsiDQutC+0LzQtdC90YLQsNGA0LjRj9GFXG4gIGltZ3M9JCgnLmNvbW1lbnQtcGhvdG8nKTtcbiAgZm9yICh2YXIgaT0wO2k8aW1ncy5sZW5ndGg7aSsrKXtcbiAgICBpbWc9aW1ncy5lcShpKTtcbiAgICBpZihpbWcuaGFzQ2xhc3MoJ25vX2F2YScpKXtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHNyYz1pbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJyk7XG4gICAgc3JjPXNyYy5yZXBsYWNlKCd1cmwoXCInLCcnKTtcbiAgICBzcmM9c3JjLnJlcGxhY2UoJ1wiKScsJycpO1xuICAgIGltZy5hZGRDbGFzcygnbm9fYXZhJyk7XG5cbiAgICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKC9pbWFnZXMvbm9fYXZhLnBuZyknKTtcbiAgICBkYXRhPXtcbiAgICAgIHNyYzpzcmMsXG4gICAgICBpbWc6aW1nLFxuICAgICAgdHlwZToxIC8vINC00LvRjyDRhNC+0L3QvtCy0YvRhSDQutCw0YDRgtC40L3QvtC6XG4gICAgfTtcbiAgICBpbWFnZT0kKCc8aW1nLz4nLHtcbiAgICAgIHNyYzpzcmNcbiAgICB9KS5vbignbG9hZCcsaW1nX2xvYWRfZmluaXNoLmJpbmQoZGF0YSkpXG4gIH1cbn0pO1xuXG4oZnVuY3Rpb24oKSB7XG4gIGVscz0kKCcuYWpheF9sb2FkJyk7XG4gIGZvcihpPTA7aTxlbHMubGVuZ3RoO2krKyl7XG4gICAgZWw9ZWxzLmVxKGkpO1xuICAgIHVybD1lbC5hdHRyKCdyZXMnKTtcbiAgICAkLmdldCh1cmwsZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICR0aGlzPSQodGhpcyk7XG4gICAgICAkdGhpcy5odG1sKGRhdGEpO1xuICAgICAgYWpheEZvcm0oJHRoaXMpO1xuICAgIH0uYmluZChlbCkpXG4gIH1cbn0pKCk7XG5cbiQoJ2lucHV0W3R5cGU9ZmlsZV0nKS5vbignY2hhbmdlJyxmdW5jdGlvbihldnQpe1xuICB2YXIgZmlsZSA9IGV2dC50YXJnZXQuZmlsZXM7IC8vIEZpbGVMaXN0IG9iamVjdFxuICB2YXIgZiA9IGZpbGVbMF07XG4gIC8vIE9ubHkgcHJvY2VzcyBpbWFnZSBmaWxlcy5cbiAgaWYgKCFmLnR5cGUubWF0Y2goJ2ltYWdlLionKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblxuICBkYXRhPSB7XG4gICAgJ2VsJzogdGhpcyxcbiAgICAnZic6IGZcbiAgfTtcbiAgcmVhZGVyLm9ubG9hZCA9IChmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGltZz0kKCdbZm9yPVwiJytkYXRhLmVsLm5hbWUrJ1wiXScpO1xuICAgICAgaWYoaW1nLmxlbmd0aD4wKXtcbiAgICAgICAgaW1nLmF0dHIoJ3NyYycsZS50YXJnZXQucmVzdWx0KVxuICAgICAgfVxuICAgIH07XG4gIH0pKGRhdGEpO1xuICAvLyBSZWFkIGluIHRoZSBpbWFnZSBmaWxlIGFzIGEgZGF0YSBVUkwuXG4gIHJlYWRlci5yZWFkQXNEYXRhVVJMKGYpO1xufSk7XG5cbiQoJ2JvZHknKS5vbignY2xpY2snLCdhLmFqYXhGb3JtT3BlbicsZnVuY3Rpb24oZSl7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgaHJlZj10aGlzLmhyZWYuc3BsaXQoJyMnKTtcbiAgaHJlZj1ocmVmW2hyZWYubGVuZ3RoLTFdO1xuXG4gIGRhdGE9e1xuICAgIGJ1dHRvblllczpmYWxzZSxcbiAgICBub3R5ZnlfY2xhc3M6XCJub3RpZnlfd2hpdGUgbG9hZGluZ1wiLFxuICAgIHF1ZXN0aW9uOicnXG4gIH07XG4gIG1vZGFsX2NsYXNzPSQodGhpcykuZGF0YSgnbW9kYWwtY2xhc3MnKTtcblxuICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XG4gICQuZ2V0KCcvJytocmVmLGZ1bmN0aW9uKGRhdGEpe1xuICAgICQoJy5ub3RpZnlfYm94JykucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAkKCcubm90aWZ5X2JveCAubm90aWZ5X2NvbnRlbnQnKS5odG1sKGRhdGEuaHRtbCk7XG4gICAgYWpheEZvcm0oJCgnLm5vdGlmeV9ib3ggLm5vdGlmeV9jb250ZW50JykpO1xuICAgIGlmKG1vZGFsX2NsYXNzKXtcbiAgICAgICQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCAucm93JykuYWRkQ2xhc3MobW9kYWxfY2xhc3MpO1xuICAgIH1cbiAgfSwnanNvbicpXG59KTtcblxuJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoe1xuICBkZWxheToge1xuICAgIHNob3c6IDUwMCwgaGlkZTogMjAwMFxuICB9XG59KTtcbiQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS5vbignY2xpY2snLGZ1bmN0aW9uIChlKSB7XG4gICR0aGlzPSQodGhpcyk7XG4gIGlmKCR0aGlzLmNsb3Nlc3QoJ3VsJykuaGFzQ2xhc3MoJ3BhZ2luYXRlJykpIHtcbiAgICAvL9C00LvRjyDQv9Cw0LPQuNC90LDRhtC40Lgg0YHRgdGL0LvQutCwINC00L7Qu9C20L3QsCDRgNCw0LHQvtGC0LDRgtGMXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYoJHRoaXMuaGFzQ2xhc3MoJ3dvcmtIcmVmJykpe1xuICAgIC8v0JXRgdC70Lgg0YHRgdGL0LvQutCwINC/0L7QvNC10YfQtdC90L3QsCDQutCw0Log0YDQsNCx0L7Rh9Cw0Y8g0YLQviDQvdGD0LbQvdC+INC/0LXRgNC10YXQvtC00LjRgtGMXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICByZXR1cm4gZmFsc2U7XG59KTtcblxuXG4kKCcuYWpheC1hY3Rpb24nKS5jbGljayhmdW5jdGlvbihlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgdmFyIHN0YXR1cyA9ICQodGhpcykuZGF0YSgndmFsdWUnKTtcbiAgdmFyIGhyZWYgPSAkKHRoaXMpLmF0dHIoJ2hyZWYnKTtcbiAgdmFyIGlkcyA9ICQoJyNncmlkLWFqYXgtYWN0aW9uJykueWlpR3JpZFZpZXcoJ2dldFNlbGVjdGVkUm93cycpO1xuICBpZiAoaWRzLmxlbmd0aCA+IDApIHtcbiAgICBpZiAoIWNvbmZpcm0oJ9Cf0L7QtNGC0LLQtdGA0LTQuNGC0LUg0LjQt9C80LXQvdC10L3QuNC1INC30LDQv9C40YHQtdC5JykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiBocmVmLFxuICAgICAgdHlwZTogJ3Bvc3QnLFxuICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgc3RhdHVzOiBzdGF0dXMsXG4gICAgICAgIGlkOiBpZHNcbiAgICAgIH1cbiAgICB9KS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICQoJyNncmlkLWFqYXgtYWN0aW9uJykueWlpR3JpZFZpZXcoXCJhcHBseUZpbHRlclwiKTtcbiAgICAgIGlmIChkYXRhLmVycm9yICE9IGZhbHNlKSB7XG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Cf0YDQvtC40LfQvtGI0LvQsCDQvtGI0LjQsdC60LAhJyx0eXBlOidlcnInfSlcbiAgICAgIH1cbiAgICB9KS5mYWlsKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0J/RgNC+0LjQt9C+0YjQu9CwINC+0YjQuNCx0LrQsCEnLHR5cGU6J2Vycid9KVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Cd0LXQvtCx0YXQvtC00LjQvNC+INCy0YvQsdGA0LDRgtGMINGN0LvQtdC80LXQvdGC0YshJyx0eXBlOidlcnInfSlcbiAgfVxufSk7XG5cbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICQoJy5lZGl0aWJsZVtkaXNhYmxlZF0nKS5vbignY2xpY2snLGZ1bmN0aW9uICgpIHtcbiAgICAkKHRoaXMpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpXG4gIH0pXG5cbiAgJCgnLmVkaXRpYmxlW2Rpc2FibGVkXScpLm9uKCdtb3VzZWRvd24nLGZ1bmN0aW9uICgpIHtcbiAgICAkKHRoaXMpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpXG4gIH0pXG5cbiAgYnRuPSc8YnV0dG9uIGNsYXNzPXVubG9jaz48aSBjbGFzcz1cImZhIGZhLXVubG9jayBmYS00XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPjwvYnV0dG9uPic7XG4gIGJ0bj0kKGJ0bik7XG4gIGJ0bi5vbignY2xpY2snLGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICR0aGlzPSQodGhpcyk7XG4gICAgaW5wPSR0aGlzLnByZXYoKTtcbiAgICBpbnAucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcbiAgJCgnLmVkaXRpYmxlW2Rpc2FibGVkXScpLmFmdGVyKGJ0bilcbn0pO1xuXG4kKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBtZW51ID0ge1xuICAgIGNvbnRyb2w6IHtcbiAgICAgIGhlYWRlclN0b3Jlc01lbnU6ICQoXCIjdG9wXCIpLmZpbmQoXCIuc3VibWVudS1oYW5kbFwiKSxcbiAgICAgIHN0b3Jlc1N1Ym1lbnVzOiAkKFwiI3RvcFwiKS5maW5kKFwiLnN1Ym1lbnUtaGFuZGxcIikuZmluZChcIi5zdWJtZW51XCIpLFxuICAgICAgZXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLmhlYWRlclN0b3Jlc01lbnUuaG92ZXIoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIHN1Ym1lbnUgPSAkKHRoaXMpLmZpbmQoJy5zdWJtZW51Jyk7XG4gICAgICAgICAgaWYoJCh3aW5kb3cpLndpZHRoKCkgPiA5OTEpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChzZWxmLnN0b3JlSGlkZSk7XG4gICAgICAgICAgICBzZWxmLnN0b3Jlc1N1Ym1lbnVzLmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xuICAgICAgICAgICAgc2VsZi5zdG9yZVNob3cgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBzdWJtZW51LmNsZWFyUXVldWUoKTtcbiAgICAgICAgICAgICAgc3VibWVudS5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIikuYW5pbWF0ZSh7XCJvcGFjaXR5XCI6IDF9LCAzNTApO1xuICAgICAgICAgICAgICAvLyBzZWxmLnN0b3Jlc1N1Ym1lbnUuY2xlYXJRdWV1ZSgpO1xuICAgICAgICAgICAgICAvLyBzZWxmLnN0b3Jlc1N1Ym1lbnUuY3NzKFwiZGlzcGxheVwiLCBcImJsb2NrXCIpLmFuaW1hdGUoe1wib3BhY2l0eVwiOiAxfSwgMzUwKTtcbiAgICAgICAgICAgIH0sIDIwMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgc3VibWVudSA9ICQodGhpcykuZmluZCgnLnN1Ym1lbnUnKTtcbiAgICAgICAgICBpZigkKHdpbmRvdykud2lkdGgoKSA+IDk5MSkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYuc3RvcmVTaG93KTtcbiAgICAgICAgICAgIHNlbGYuc3RvcmVIaWRlID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgc3VibWVudS5jbGVhclF1ZXVlKCk7XG4gICAgICAgICAgICAgIHN1Ym1lbnUuYW5pbWF0ZSh7XCJvcGFjaXR5XCI6IDB9LCAyMDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICQodGhpcykuY3NzKFwiZGlzcGxheVwiLCBcIm5vbmVcIik7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAvLyBzZWxmLnN0b3Jlc1N1Ym1lbnUuY2xlYXJRdWV1ZSgpO1xuICAgICAgICAgICAgICAvLyBzZWxmLnN0b3Jlc1N1Ym1lbnUuYW5pbWF0ZSh7XCJvcGFjaXR5XCI6IDB9LCAyMDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAvLyAgICAgJCh0aGlzKS5jc3MoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcbiAgICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgICB9LCAzMDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBtZW51LmNvbnRyb2wuZXZlbnRzKCk7XG59KTtcblxuLy/Rh9GC0L4g0LEg0LjRhNGA0LXQudC80Ysg0Lgg0LrQsNGA0YLQuNC90LrQuCDQvdC1INCy0YvQu9Cw0LfQuNC70LhcbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XG4gIC8qbV93ID0gJCgnLnRleHQtY29udGVudCcpLndpZHRoKClcbiAgaWYgKG1fdyA8IDUwKW1fdyA9IHNjcmVlbi53aWR0aCAtIDQwKi9cbiAgbXc9c2NyZWVuLndpZHRoLTQwO1xuICBwID0gJCgnLmNvbnRhaW5lciBpbWcsLmNvbnRhaW5lciBpZnJhbWUnKTtcbiAgZm9yIChpID0gMDsgaSA8IHAubGVuZ3RoOyBpKyspIHtcbiAgICBlbCA9IHAuZXEoaSk7XG4gICAgdmFyIHBhcmVudCA9IGVsLnBhcmVudCgpO1xuICAgIGlmKHBhcmVudFswXS50YWdOYW1lPT1cIkFcIil7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgbV93ID0gcGFyZW50LndpZHRoKCk7XG4gICAgaWYgKG1fdyA+IG13KW1fdyA9IG13O1xuICAgIGlmIChlbC53aWR0aCgpID4gbV93KSB7XG4gICAgICBrID0gZWwud2lkdGgoKSAvIG1fdztcbiAgICAgIGVsLmhlaWdodChlbC5oZWlnaHQoKSAvIGspO1xuICAgICAgZWwud2lkdGgobV93KVxuICAgIH1cbiAgfVxufSk7XG5cbi8v0LjQt9Cx0YDQsNC90L3QvtC1XG4kKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAkKFwiI3RvcCAuZmF2b3JpdGUtbGlua1wiKS5vbignY2xpY2snLGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gJCh0aGlzKTtcbiAgICB2YXIgdHlwZSA9IHNlbGYuYXR0cihcImRhdGEtc3RhdGVcIiksXG4gICAgICBhZmZpbGlhdGVfaWQgPSBzZWxmLmF0dHIoXCJkYXRhLWFmZmlsaWF0ZS1pZFwiKTtcbiAgICBpZiAoc2VsZi5oYXNDbGFzcygnZGlzYWJsZWQnKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHNlbGYuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cbiAgICBpZih0eXBlID09IFwiYWRkXCIpIHtcbiAgICAgIHNlbGYuZmluZChcIi5mYVwiKS5yZW1vdmVDbGFzcyhcIm11dGVkXCIpO1xuICAgIH1cblxuICAgIHNlbGYuZmluZChcIi5mYVwiKS5yZW1vdmVDbGFzcyhcInB1bHNlMlwiKS5hZGRDbGFzcyhcImZhLXNwaW5cIik7XG5cbiAgICAkLnBvc3QoXCIvYWNjb3VudC9mYXZvcml0ZXNcIix7XG4gICAgICBcInR5cGVcIiA6IHR5cGUgLFxuICAgICAgXCJhZmZpbGlhdGVfaWRcIjogYWZmaWxpYXRlX2lkXG4gICAgfSxmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgc2VsZi5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgIGlmKGRhdGEuZXJyb3Ipe1xuICAgICAgICBzZWxmLmZpbmQoXCIuZmFcIikucmVtb3ZlQ2xhc3MoXCJmYS1zcGluXCIpO1xuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOmRhdGEuZXJyb3IsdHlwZTonZXJyJywndGl0bGUnOihkYXRhLnRpdGxlP2RhdGEudGl0bGU6ZmFsc2UpfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XG4gICAgICAgIG1lc3NhZ2U6ZGF0YS5tc2csXG4gICAgICAgIHR5cGU6J3N1Y2Nlc3MnLFxuICAgICAgICAndGl0bGUnOihkYXRhLnRpdGxlP2RhdGEudGl0bGU6ZmFsc2UpXG4gICAgICB9KTtcblxuICAgICAgaWYodHlwZSA9PSBcImFkZFwiKSB7XG4gICAgICAgIHNlbGYuZmluZChcIi5mYVwiKS5hZGRDbGFzcyhcIm11dGVkXCIpO1xuICAgICAgfVxuICAgICAgc2VsZi5maW5kKFwiLmZhXCIpLnJlbW92ZUNsYXNzKFwiZmEtc3BpblwiKTtcblxuICAgICAgc2VsZi5hdHRyKHtcbiAgICAgICAgXCJkYXRhLXN0YXRlXCI6IGRhdGFbXCJkYXRhLXN0YXRlXCJdLFxuICAgICAgICBcImRhdGEtb3JpZ2luYWwtdGl0bGVcIjogZGF0YVsnZGF0YS1vcmlnaW5hbC10aXRsZSddXG4gICAgICB9KTtcblxuICAgICAgaWYodHlwZSA9PSBcImFkZFwiKSB7XG4gICAgICAgIHNlbGYuZmluZChcIi5mYVwiKS5yZW1vdmVDbGFzcyhcImZhLXNwaW4gZmEtaGVhcnQtb1wiKS5hZGRDbGFzcyhcImZhLWhlYXJ0XCIpO1xuICAgICAgfSBlbHNlIGlmKHR5cGUgPT0gXCJkZWxldGVcIikge1xuICAgICAgICBzZWxmLmZpbmQoXCIuZmFcIikucmVtb3ZlQ2xhc3MoXCJmYS1zcGluIGZhLWhlYXJ0XCIpLmFkZENsYXNzKFwiZmEtaGVhcnQtbyBtdXRlZFwiKTtcbiAgICAgIH1cblxuICAgIH0sJ2pzb24nKS5mYWlsKGZ1bmN0aW9uKCkge1xuICAgICAgc2VsZi5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6XCI8Yj7QotC10YXQvdC40YfQtdGB0LrQuNC1INGA0LDQsdC+0YLRiyE8L2I+PGJyPtCSINC00LDQvdC90YvQuSDQvNC+0LzQtdC90YIg0LLRgNC10LzQtdC90LhcIiArXG4gICAgICBcIiDQv9GA0L7QuNC30LLQtdC00ZHQvdC90L7QtSDQtNC10LnRgdGC0LLQuNC1INC90LXQstC+0LfQvNC+0LbQvdC+LiDQn9C+0L/RgNC+0LHRg9C50YLQtSDQv9C+0LfQttC1LlwiICtcbiAgICAgIFwiINCf0YDQuNC90L7RgdC40Lwg0YHQstC+0Lgg0LjQt9Cy0LjQvdC10L3QuNGPINC30LAg0L3QtdGD0LTQvtCx0YHRgtCy0L4uXCIsdHlwZTonZXJyJ30pO1xuXG4gICAgICBpZih0eXBlID09IFwiYWRkXCIpIHtcbiAgICAgICAgc2VsZi5maW5kKFwiLmZhXCIpLmFkZENsYXNzKFwibXV0ZWRcIik7XG4gICAgICB9XG4gICAgICBzZWxmLmZpbmQoXCIuZmFcIikucmVtb3ZlQ2xhc3MoXCJmYS1zcGluXCIpO1xuICAgIH0pXG4gIH0pO1xufSk7XG5cbi8v0LXRgdC70Lgg0L7RgtC60YDRi9GC0L4g0LrQsNC6INC00L7Rh9C10YDQvdC10LVcbihmdW5jdGlvbigpe1xuICBpZighd2luZG93Lm9wZW5lcilyZXR1cm47XG4gIGlmKGRvY3VtZW50LnJlZmVycmVyLmluZGV4T2YoJ3NlY3JldGRpc2NvdW50ZXInKTwwKXJldHVybjtcblxuICBocmVmPXdpbmRvdy5vcGVuZXIubG9jYXRpb24uaHJlZjtcbiAgaWYoaHJlZi5pbmRleE9mKCdzb2NpYWxzJyk+MCB8fCBocmVmLmluZGV4T2YoJ2xvZ2luJyk+MCl7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmKGhyZWYuaW5kZXhPZignc3RvcmUnKT4wIHx8IGhyZWYuaW5kZXhPZignY291cG9uJyk+MCB8fCBocmVmLmluZGV4T2YoJ3NldHRpbmdzJyk+MCl7XG4gICAgd2luZG93Lm9wZW5lci5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgfWVsc2V7XG4gICAgd2luZG93Lm9wZW5lci5sb2NhdGlvbi5ocmVmPWxvY2F0aW9uLmhyZWY7XG4gIH1cbiAgd2luZG93LmNsb3NlKCk7XG59KSgpOyJdfQ==
