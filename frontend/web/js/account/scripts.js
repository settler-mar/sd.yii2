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

//если открыто как дочернее
$(function(){
    if(!window.opener)return;
    href=window.opener.location.href;
    if(href.indexOf('store')>0 || href.indexOf('coupon')>0){
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
    content.append(text);

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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpxdWVyeS5tZW51LWFpbS5qcyIsImNpcmNsZXMubWluLmpzIiwiZGF0ZXBpY2tlci5qcyIsImpxdWVyeS5ub3R5LnBhY2thZ2VkLm1pbi5qcyIsIm1haW4uanMiLCJhbmltby5qcyIsImpxdWVyeS5tb2NramF4LmpzIiwianF1ZXJ5LmF1dG9jb21wbGV0ZS5qcyIsIm5vdGlmaWNhdGlvbi5qcyIsImFqYXhfcmVtb3ZlLmpzIiwiZm9yX2FsbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNub0RBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FIMTlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBSWpkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogbWVudS1haW0gaXMgYSBqUXVlcnkgcGx1Z2luIGZvciBkcm9wZG93biBtZW51cyB0aGF0IGNhbiBkaWZmZXJlbnRpYXRlXHJcbiAqIGJldHdlZW4gYSB1c2VyIHRyeWluZyBob3ZlciBvdmVyIGEgZHJvcGRvd24gaXRlbSB2cyB0cnlpbmcgdG8gbmF2aWdhdGUgaW50b1xyXG4gKiBhIHN1Ym1lbnUncyBjb250ZW50cy5cclxuICpcclxuICogbWVudS1haW0gYXNzdW1lcyB0aGF0IHlvdSBoYXZlIGFyZSB1c2luZyBhIG1lbnUgd2l0aCBzdWJtZW51cyB0aGF0IGV4cGFuZFxyXG4gKiB0byB0aGUgbWVudSdzIHJpZ2h0LiBJdCB3aWxsIGZpcmUgZXZlbnRzIHdoZW4gdGhlIHVzZXIncyBtb3VzZSBlbnRlcnMgYSBuZXdcclxuICogZHJvcGRvd24gaXRlbSAqYW5kKiB3aGVuIHRoYXQgaXRlbSBpcyBiZWluZyBpbnRlbnRpb25hbGx5IGhvdmVyZWQgb3Zlci5cclxuICpcclxuICogX19fX19fX19fX19fX19fX19fX19fX19fX19cclxuICogfCBNb25rZXlzICA+fCAgIEdvcmlsbGEgIHxcclxuICogfCBHb3JpbGxhcyA+fCAgIENvbnRlbnQgIHxcclxuICogfCBDaGltcHMgICA+fCAgIEhlcmUgICAgIHxcclxuICogfF9fX19fX19fX19ffF9fX19fX19fX19fX3xcclxuICpcclxuICogSW4gdGhlIGFib3ZlIGV4YW1wbGUsIFwiR29yaWxsYXNcIiBpcyBzZWxlY3RlZCBhbmQgaXRzIHN1Ym1lbnUgY29udGVudCBpc1xyXG4gKiBiZWluZyBzaG93biBvbiB0aGUgcmlnaHQuIEltYWdpbmUgdGhhdCB0aGUgdXNlcidzIGN1cnNvciBpcyBob3ZlcmluZyBvdmVyXHJcbiAqIFwiR29yaWxsYXMuXCIgV2hlbiB0aGV5IG1vdmUgdGhlaXIgbW91c2UgaW50byB0aGUgXCJHb3JpbGxhIENvbnRlbnRcIiBhcmVhLCB0aGV5XHJcbiAqIG1heSBicmllZmx5IGhvdmVyIG92ZXIgXCJDaGltcHMuXCIgVGhpcyBzaG91bGRuJ3QgY2xvc2UgdGhlIFwiR29yaWxsYSBDb250ZW50XCJcclxuICogYXJlYS5cclxuICpcclxuICogVGhpcyBwcm9ibGVtIGlzIG5vcm1hbGx5IHNvbHZlZCB1c2luZyB0aW1lb3V0cyBhbmQgZGVsYXlzLiBtZW51LWFpbSB0cmllcyB0b1xyXG4gKiBzb2x2ZSB0aGlzIGJ5IGRldGVjdGluZyB0aGUgZGlyZWN0aW9uIG9mIHRoZSB1c2VyJ3MgbW91c2UgbW92ZW1lbnQuIFRoaXMgY2FuXHJcbiAqIG1ha2UgZm9yIHF1aWNrZXIgdHJhbnNpdGlvbnMgd2hlbiBuYXZpZ2F0aW5nIHVwIGFuZCBkb3duIHRoZSBtZW51LiBUaGVcclxuICogZXhwZXJpZW5jZSBpcyBob3BlZnVsbHkgc2ltaWxhciB0byBhbWF6b24uY29tLydzIFwiU2hvcCBieSBEZXBhcnRtZW50XCJcclxuICogZHJvcGRvd24uXHJcbiAqXHJcbiAqIFVzZSBsaWtlIHNvOlxyXG4gKlxyXG4gKiAgICAgICQoXCIjbWVudVwiKS5tZW51QWltKHtcclxuICogICAgICAgICAgYWN0aXZhdGU6ICQubm9vcCwgIC8vIGZpcmVkIG9uIHJvdyBhY3RpdmF0aW9uXHJcbiAqICAgICAgICAgIGRlYWN0aXZhdGU6ICQubm9vcCAgLy8gZmlyZWQgb24gcm93IGRlYWN0aXZhdGlvblxyXG4gKiAgICAgIH0pO1xyXG4gKlxyXG4gKiAgLi4udG8gcmVjZWl2ZSBldmVudHMgd2hlbiBhIG1lbnUncyByb3cgaGFzIGJlZW4gcHVycG9zZWZ1bGx5IChkZSlhY3RpdmF0ZWQuXHJcbiAqXHJcbiAqIFRoZSBmb2xsb3dpbmcgb3B0aW9ucyBjYW4gYmUgcGFzc2VkIHRvIG1lbnVBaW0uIEFsbCBmdW5jdGlvbnMgZXhlY3V0ZSB3aXRoXHJcbiAqIHRoZSByZWxldmFudCByb3cncyBIVE1MIGVsZW1lbnQgYXMgdGhlIGV4ZWN1dGlvbiBjb250ZXh0ICgndGhpcycpOlxyXG4gKlxyXG4gKiAgICAgIC5tZW51QWltKHtcclxuICogICAgICAgICAgLy8gRnVuY3Rpb24gdG8gY2FsbCB3aGVuIGEgcm93IGlzIHB1cnBvc2VmdWxseSBhY3RpdmF0ZWQuIFVzZSB0aGlzXHJcbiAqICAgICAgICAgIC8vIHRvIHNob3cgYSBzdWJtZW51J3MgY29udGVudCBmb3IgdGhlIGFjdGl2YXRlZCByb3cuXHJcbiAqICAgICAgICAgIGFjdGl2YXRlOiBmdW5jdGlvbigpIHt9LFxyXG4gKlxyXG4gKiAgICAgICAgICAvLyBGdW5jdGlvbiB0byBjYWxsIHdoZW4gYSByb3cgaXMgZGVhY3RpdmF0ZWQuXHJcbiAqICAgICAgICAgIGRlYWN0aXZhdGU6IGZ1bmN0aW9uKCkge30sXHJcbiAqXHJcbiAqICAgICAgICAgIC8vIEZ1bmN0aW9uIHRvIGNhbGwgd2hlbiBtb3VzZSBlbnRlcnMgYSBtZW51IHJvdy4gRW50ZXJpbmcgYSByb3dcclxuICogICAgICAgICAgLy8gZG9lcyBub3QgbWVhbiB0aGUgcm93IGhhcyBiZWVuIGFjdGl2YXRlZCwgYXMgdGhlIHVzZXIgbWF5IGJlXHJcbiAqICAgICAgICAgIC8vIG1vdXNpbmcgb3ZlciB0byBhIHN1Ym1lbnUuXHJcbiAqICAgICAgICAgIGVudGVyOiBmdW5jdGlvbigpIHt9LFxyXG4gKlxyXG4gKiAgICAgICAgICAvLyBGdW5jdGlvbiB0byBjYWxsIHdoZW4gbW91c2UgZXhpdHMgYSBtZW51IHJvdy5cclxuICogICAgICAgICAgZXhpdDogZnVuY3Rpb24oKSB7fSxcclxuICpcclxuICogICAgICAgICAgLy8gU2VsZWN0b3IgZm9yIGlkZW50aWZ5aW5nIHdoaWNoIGVsZW1lbnRzIGluIHRoZSBtZW51IGFyZSByb3dzXHJcbiAqICAgICAgICAgIC8vIHRoYXQgY2FuIHRyaWdnZXIgdGhlIGFib3ZlIGV2ZW50cy4gRGVmYXVsdHMgdG8gXCI+IGxpXCIuXHJcbiAqICAgICAgICAgIHJvd1NlbGVjdG9yOiBcIj4gbGlcIixcclxuICpcclxuICogICAgICAgICAgLy8gWW91IG1heSBoYXZlIHNvbWUgbWVudSByb3dzIHRoYXQgYXJlbid0IHN1Ym1lbnVzIGFuZCB0aGVyZWZvcmVcclxuICogICAgICAgICAgLy8gc2hvdWxkbid0IGV2ZXIgbmVlZCB0byBcImFjdGl2YXRlLlwiIElmIHNvLCBmaWx0ZXIgc3VibWVudSByb3dzIHcvXHJcbiAqICAgICAgICAgIC8vIHRoaXMgc2VsZWN0b3IuIERlZmF1bHRzIHRvIFwiKlwiIChhbGwgZWxlbWVudHMpLlxyXG4gKiAgICAgICAgICBzdWJtZW51U2VsZWN0b3I6IFwiKlwiLFxyXG4gKlxyXG4gKiAgICAgICAgICAvLyBEaXJlY3Rpb24gdGhlIHN1Ym1lbnUgb3BlbnMgcmVsYXRpdmUgdG8gdGhlIG1haW4gbWVudS4gQ2FuIGJlXHJcbiAqICAgICAgICAgIC8vIGxlZnQsIHJpZ2h0LCBhYm92ZSwgb3IgYmVsb3cuIERlZmF1bHRzIHRvIFwicmlnaHRcIi5cclxuICogICAgICAgICAgc3VibWVudURpcmVjdGlvbjogXCJyaWdodFwiXHJcbiAqICAgICAgfSk7XHJcbiAqXHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9rYW1lbnMvalF1ZXJ5LW1lbnUtYWltXHJcbiovXHJcbihmdW5jdGlvbigkKSB7XHJcblxyXG4gICAgJC5mbi5tZW51QWltID0gZnVuY3Rpb24ob3B0cykge1xyXG4gICAgICAgIC8vIEluaXRpYWxpemUgbWVudS1haW0gZm9yIGFsbCBlbGVtZW50cyBpbiBqUXVlcnkgY29sbGVjdGlvblxyXG4gICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaW5pdC5jYWxsKHRoaXMsIG9wdHMpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdChvcHRzKSB7XHJcbiAgICAgICAgdmFyICRtZW51ID0gJCh0aGlzKSxcclxuICAgICAgICAgICAgYWN0aXZlUm93ID0gbnVsbCxcclxuICAgICAgICAgICAgbW91c2VMb2NzID0gW10sXHJcbiAgICAgICAgICAgIGxhc3REZWxheUxvYyA9IG51bGwsXHJcbiAgICAgICAgICAgIHRpbWVvdXRJZCA9IG51bGwsXHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSAkLmV4dGVuZCh7XHJcbiAgICAgICAgICAgICAgICByb3dTZWxlY3RvcjogXCI+IGxpXCIsXHJcbiAgICAgICAgICAgICAgICBzdWJtZW51U2VsZWN0b3I6IFwiKlwiLFxyXG4gICAgICAgICAgICAgICAgc3VibWVudURpcmVjdGlvbjogXCJyaWdodFwiLFxyXG4gICAgICAgICAgICAgICAgdG9sZXJhbmNlOiA3NSwgIC8vIGJpZ2dlciA9IG1vcmUgZm9yZ2l2ZXkgd2hlbiBlbnRlcmluZyBzdWJtZW51XHJcbiAgICAgICAgICAgICAgICBlbnRlcjogJC5ub29wLFxyXG4gICAgICAgICAgICAgICAgZXhpdDogJC5ub29wLFxyXG4gICAgICAgICAgICAgICAgYWN0aXZhdGU6ICQubm9vcCxcclxuICAgICAgICAgICAgICAgIGRlYWN0aXZhdGU6ICQubm9vcCxcclxuICAgICAgICAgICAgICAgIGV4aXRNZW51OiAkLm5vb3BcclxuICAgICAgICAgICAgfSwgb3B0cyk7XHJcblxyXG4gICAgICAgIHZhciBNT1VTRV9MT0NTX1RSQUNLRUQgPSAzLCAgLy8gbnVtYmVyIG9mIHBhc3QgbW91c2UgbG9jYXRpb25zIHRvIHRyYWNrXHJcbiAgICAgICAgICAgIERFTEFZID0gMzAwOyAgLy8gbXMgZGVsYXkgd2hlbiB1c2VyIGFwcGVhcnMgdG8gYmUgZW50ZXJpbmcgc3VibWVudVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBLZWVwIHRyYWNrIG9mIHRoZSBsYXN0IGZldyBsb2NhdGlvbnMgb2YgdGhlIG1vdXNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHZhciBtb3VzZW1vdmVEb2N1bWVudCA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIG1vdXNlTG9jcy5wdXNoKHt4OiBlLnBhZ2VYLCB5OiBlLnBhZ2VZfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG1vdXNlTG9jcy5sZW5ndGggPiBNT1VTRV9MT0NTX1RSQUNLRUQpIHtcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZUxvY3Muc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2FuY2VsIHBvc3NpYmxlIHJvdyBhY3RpdmF0aW9ucyB3aGVuIGxlYXZpbmcgdGhlIG1lbnUgZW50aXJlbHlcclxuICAgICAgICAgKi9cclxuICAgICAgICB2YXIgbW91c2VsZWF2ZU1lbnUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aW1lb3V0SWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBJZiBleGl0TWVudSBpcyBzdXBwbGllZCBhbmQgcmV0dXJucyB0cnVlLCBkZWFjdGl2YXRlIHRoZVxyXG4gICAgICAgICAgICAgICAgLy8gY3VycmVudGx5IGFjdGl2ZSByb3cgb24gbWVudSBleGl0LlxyXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZXhpdE1lbnUodGhpcykpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYWN0aXZlUm93KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuZGVhY3RpdmF0ZShhY3RpdmVSb3cpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlUm93ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVHJpZ2dlciBhIHBvc3NpYmxlIHJvdyBhY3RpdmF0aW9uIHdoZW5ldmVyIGVudGVyaW5nIGEgbmV3IHJvdy5cclxuICAgICAgICAgKi9cclxuICAgICAgICB2YXIgbW91c2VlbnRlclJvdyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRpbWVvdXRJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIENhbmNlbCBhbnkgcHJldmlvdXMgYWN0aXZhdGlvbiBkZWxheXNcclxuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLmVudGVyKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgcG9zc2libHlBY3RpdmF0ZSh0aGlzKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbW91c2VsZWF2ZVJvdyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5leGl0KHRoaXMpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIEltbWVkaWF0ZWx5IGFjdGl2YXRlIGEgcm93IGlmIHRoZSB1c2VyIGNsaWNrcyBvbiBpdC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB2YXIgY2xpY2tSb3cgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGFjdGl2YXRlKHRoaXMpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBY3RpdmF0ZSBhIG1lbnUgcm93LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHZhciBhY3RpdmF0ZSA9IGZ1bmN0aW9uKHJvdykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJvdyA9PSBhY3RpdmVSb3cpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGFjdGl2ZVJvdykge1xyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuZGVhY3RpdmF0ZShhY3RpdmVSb3cpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIG9wdGlvbnMuYWN0aXZhdGUocm93KTtcclxuICAgICAgICAgICAgICAgIGFjdGl2ZVJvdyA9IHJvdztcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUG9zc2libHkgYWN0aXZhdGUgYSBtZW51IHJvdy4gSWYgbW91c2UgbW92ZW1lbnQgaW5kaWNhdGVzIHRoYXQgd2VcclxuICAgICAgICAgKiBzaG91bGRuJ3QgYWN0aXZhdGUgeWV0IGJlY2F1c2UgdXNlciBtYXkgYmUgdHJ5aW5nIHRvIGVudGVyXHJcbiAgICAgICAgICogYSBzdWJtZW51J3MgY29udGVudCwgdGhlbiBkZWxheSBhbmQgY2hlY2sgYWdhaW4gbGF0ZXIuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdmFyIHBvc3NpYmx5QWN0aXZhdGUgPSBmdW5jdGlvbihyb3cpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkZWxheSA9IGFjdGl2YXRpb25EZWxheSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChkZWxheSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3NpYmx5QWN0aXZhdGUocm93KTtcclxuICAgICAgICAgICAgICAgICAgICB9LCBkZWxheSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2YXRlKHJvdyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybiB0aGUgYW1vdW50IG9mIHRpbWUgdGhhdCBzaG91bGQgYmUgdXNlZCBhcyBhIGRlbGF5IGJlZm9yZSB0aGVcclxuICAgICAgICAgKiBjdXJyZW50bHkgaG92ZXJlZCByb3cgaXMgYWN0aXZhdGVkLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogUmV0dXJucyAwIGlmIHRoZSBhY3RpdmF0aW9uIHNob3VsZCBoYXBwZW4gaW1tZWRpYXRlbHkuIE90aGVyd2lzZSxcclxuICAgICAgICAgKiByZXR1cm5zIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRoYXQgc2hvdWxkIGJlIGRlbGF5ZWQgYmVmb3JlXHJcbiAgICAgICAgICogY2hlY2tpbmcgYWdhaW4gdG8gc2VlIGlmIHRoZSByb3cgc2hvdWxkIGJlIGFjdGl2YXRlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB2YXIgYWN0aXZhdGlvbkRlbGF5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWFjdGl2ZVJvdyB8fCAhJChhY3RpdmVSb3cpLmlzKG9wdGlvbnMuc3VibWVudVNlbGVjdG9yKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlIGlzIG5vIG90aGVyIHN1Ym1lbnUgcm93IGFscmVhZHkgYWN0aXZlLCB0aGVuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZ28gYWhlYWQgYW5kIGFjdGl2YXRlIGltbWVkaWF0ZWx5LlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSAkbWVudS5vZmZzZXQoKSxcclxuICAgICAgICAgICAgICAgICAgICB1cHBlckxlZnQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IG9mZnNldC5sZWZ0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiBvZmZzZXQudG9wIC0gb3B0aW9ucy50b2xlcmFuY2VcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHVwcGVyUmlnaHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IG9mZnNldC5sZWZ0ICsgJG1lbnUub3V0ZXJXaWR0aCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiB1cHBlckxlZnQueVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgbG93ZXJMZWZ0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBvZmZzZXQubGVmdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgeTogb2Zmc2V0LnRvcCArICRtZW51Lm91dGVySGVpZ2h0KCkgKyBvcHRpb25zLnRvbGVyYW5jZVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgbG93ZXJSaWdodCA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeDogb2Zmc2V0LmxlZnQgKyAkbWVudS5vdXRlcldpZHRoKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IGxvd2VyTGVmdC55XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBsb2MgPSBtb3VzZUxvY3NbbW91c2VMb2NzLmxlbmd0aCAtIDFdLFxyXG4gICAgICAgICAgICAgICAgICAgIHByZXZMb2MgPSBtb3VzZUxvY3NbMF07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFsb2MpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIXByZXZMb2MpIHtcclxuICAgICAgICAgICAgICAgICAgICBwcmV2TG9jID0gbG9jO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwcmV2TG9jLnggPCBvZmZzZXQubGVmdCB8fCBwcmV2TG9jLnggPiBsb3dlclJpZ2h0LnggfHxcclxuICAgICAgICAgICAgICAgICAgICBwcmV2TG9jLnkgPCBvZmZzZXQudG9wIHx8IHByZXZMb2MueSA+IGxvd2VyUmlnaHQueSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSBwcmV2aW91cyBtb3VzZSBsb2NhdGlvbiB3YXMgb3V0c2lkZSBvZiB0aGUgZW50aXJlXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbWVudSdzIGJvdW5kcywgaW1tZWRpYXRlbHkgYWN0aXZhdGUuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGxhc3REZWxheUxvYyAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2MueCA9PSBsYXN0RGVsYXlMb2MueCAmJiBsb2MueSA9PSBsYXN0RGVsYXlMb2MueSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSBtb3VzZSBoYXNuJ3QgbW92ZWQgc2luY2UgdGhlIGxhc3QgdGltZSB3ZSBjaGVja2VkXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZm9yIGFjdGl2YXRpb24gc3RhdHVzLCBpbW1lZGlhdGVseSBhY3RpdmF0ZS5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBEZXRlY3QgaWYgdGhlIHVzZXIgaXMgbW92aW5nIHRvd2FyZHMgdGhlIGN1cnJlbnRseSBhY3RpdmF0ZWRcclxuICAgICAgICAgICAgICAgIC8vIHN1Ym1lbnUuXHJcbiAgICAgICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIG1vdXNlIGlzIGhlYWRpbmcgcmVsYXRpdmVseSBjbGVhcmx5IHRvd2FyZHNcclxuICAgICAgICAgICAgICAgIC8vIHRoZSBzdWJtZW51J3MgY29udGVudCwgd2Ugc2hvdWxkIHdhaXQgYW5kIGdpdmUgdGhlIHVzZXIgbW9yZVxyXG4gICAgICAgICAgICAgICAgLy8gdGltZSBiZWZvcmUgYWN0aXZhdGluZyBhIG5ldyByb3cuIElmIHRoZSBtb3VzZSBpcyBoZWFkaW5nXHJcbiAgICAgICAgICAgICAgICAvLyBlbHNld2hlcmUsIHdlIGNhbiBpbW1lZGlhdGVseSBhY3RpdmF0ZSBhIG5ldyByb3cuXHJcbiAgICAgICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAgICAgLy8gV2UgZGV0ZWN0IHRoaXMgYnkgY2FsY3VsYXRpbmcgdGhlIHNsb3BlIGZvcm1lZCBiZXR3ZWVuIHRoZVxyXG4gICAgICAgICAgICAgICAgLy8gY3VycmVudCBtb3VzZSBsb2NhdGlvbiBhbmQgdGhlIHVwcGVyL2xvd2VyIHJpZ2h0IHBvaW50cyBvZlxyXG4gICAgICAgICAgICAgICAgLy8gdGhlIG1lbnUuIFdlIGRvIHRoZSBzYW1lIGZvciB0aGUgcHJldmlvdXMgbW91c2UgbG9jYXRpb24uXHJcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgY3VycmVudCBtb3VzZSBsb2NhdGlvbidzIHNsb3BlcyBhcmVcclxuICAgICAgICAgICAgICAgIC8vIGluY3JlYXNpbmcvZGVjcmVhc2luZyBhcHByb3ByaWF0ZWx5IGNvbXBhcmVkIHRvIHRoZVxyXG4gICAgICAgICAgICAgICAgLy8gcHJldmlvdXMncywgd2Uga25vdyB0aGUgdXNlciBpcyBtb3ZpbmcgdG93YXJkIHRoZSBzdWJtZW51LlxyXG4gICAgICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgICAgIC8vIE5vdGUgdGhhdCBzaW5jZSB0aGUgeS1heGlzIGluY3JlYXNlcyBhcyB0aGUgY3Vyc29yIG1vdmVzXHJcbiAgICAgICAgICAgICAgICAvLyBkb3duIHRoZSBzY3JlZW4sIHdlIGFyZSBsb29raW5nIGZvciB0aGUgc2xvcGUgYmV0d2VlbiB0aGVcclxuICAgICAgICAgICAgICAgIC8vIGN1cnNvciBhbmQgdGhlIHVwcGVyIHJpZ2h0IGNvcm5lciB0byBkZWNyZWFzZSBvdmVyIHRpbWUsIG5vdFxyXG4gICAgICAgICAgICAgICAgLy8gaW5jcmVhc2UgKHNvbWV3aGF0IGNvdW50ZXJpbnR1aXRpdmVseSkuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzbG9wZShhLCBiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChiLnkgLSBhLnkpIC8gKGIueCAtIGEueCk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBkZWNyZWFzaW5nQ29ybmVyID0gdXBwZXJSaWdodCxcclxuICAgICAgICAgICAgICAgICAgICBpbmNyZWFzaW5nQ29ybmVyID0gbG93ZXJSaWdodDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBPdXIgZXhwZWN0YXRpb25zIGZvciBkZWNyZWFzaW5nIG9yIGluY3JlYXNpbmcgc2xvcGUgdmFsdWVzXHJcbiAgICAgICAgICAgICAgICAvLyBkZXBlbmRzIG9uIHdoaWNoIGRpcmVjdGlvbiB0aGUgc3VibWVudSBvcGVucyByZWxhdGl2ZSB0byB0aGVcclxuICAgICAgICAgICAgICAgIC8vIG1haW4gbWVudS4gQnkgZGVmYXVsdCwgaWYgdGhlIG1lbnUgb3BlbnMgb24gdGhlIHJpZ2h0LCB3ZVxyXG4gICAgICAgICAgICAgICAgLy8gZXhwZWN0IHRoZSBzbG9wZSBiZXR3ZWVuIHRoZSBjdXJzb3IgYW5kIHRoZSB1cHBlciByaWdodFxyXG4gICAgICAgICAgICAgICAgLy8gY29ybmVyIHRvIGRlY3JlYXNlIG92ZXIgdGltZSwgYXMgZXhwbGFpbmVkIGFib3ZlLiBJZiB0aGVcclxuICAgICAgICAgICAgICAgIC8vIHN1Ym1lbnUgb3BlbnMgaW4gYSBkaWZmZXJlbnQgZGlyZWN0aW9uLCB3ZSBjaGFuZ2Ugb3VyIHNsb3BlXHJcbiAgICAgICAgICAgICAgICAvLyBleHBlY3RhdGlvbnMuXHJcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5zdWJtZW51RGlyZWN0aW9uID09IFwibGVmdFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjcmVhc2luZ0Nvcm5lciA9IGxvd2VyTGVmdDtcclxuICAgICAgICAgICAgICAgICAgICBpbmNyZWFzaW5nQ29ybmVyID0gdXBwZXJMZWZ0O1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLnN1Ym1lbnVEaXJlY3Rpb24gPT0gXCJiZWxvd1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjcmVhc2luZ0Nvcm5lciA9IGxvd2VyUmlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5jcmVhc2luZ0Nvcm5lciA9IGxvd2VyTGVmdDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5zdWJtZW51RGlyZWN0aW9uID09IFwiYWJvdmVcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlY3JlYXNpbmdDb3JuZXIgPSB1cHBlckxlZnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5jcmVhc2luZ0Nvcm5lciA9IHVwcGVyUmlnaHQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGRlY3JlYXNpbmdTbG9wZSA9IHNsb3BlKGxvYywgZGVjcmVhc2luZ0Nvcm5lciksXHJcbiAgICAgICAgICAgICAgICAgICAgaW5jcmVhc2luZ1Nsb3BlID0gc2xvcGUobG9jLCBpbmNyZWFzaW5nQ29ybmVyKSxcclxuICAgICAgICAgICAgICAgICAgICBwcmV2RGVjcmVhc2luZ1Nsb3BlID0gc2xvcGUocHJldkxvYywgZGVjcmVhc2luZ0Nvcm5lciksXHJcbiAgICAgICAgICAgICAgICAgICAgcHJldkluY3JlYXNpbmdTbG9wZSA9IHNsb3BlKHByZXZMb2MsIGluY3JlYXNpbmdDb3JuZXIpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChkZWNyZWFzaW5nU2xvcGUgPCBwcmV2RGVjcmVhc2luZ1Nsb3BlICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY3JlYXNpbmdTbG9wZSA+IHByZXZJbmNyZWFzaW5nU2xvcGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBNb3VzZSBpcyBtb3ZpbmcgZnJvbSBwcmV2aW91cyBsb2NhdGlvbiB0b3dhcmRzIHRoZVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGN1cnJlbnRseSBhY3RpdmF0ZWQgc3VibWVudS4gRGVsYXkgYmVmb3JlIGFjdGl2YXRpbmcgYVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIG5ldyBtZW51IHJvdywgYmVjYXVzZSB1c2VyIG1heSBiZSBtb3ZpbmcgaW50byBzdWJtZW51LlxyXG4gICAgICAgICAgICAgICAgICAgIGxhc3REZWxheUxvYyA9IGxvYztcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gREVMQVk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbGFzdERlbGF5TG9jID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBIb29rIHVwIGluaXRpYWwgbWVudSBldmVudHNcclxuICAgICAgICAgKi9cclxuICAgICAgICAkbWVudVxyXG4gICAgICAgICAgICAubW91c2VsZWF2ZShtb3VzZWxlYXZlTWVudSlcclxuICAgICAgICAgICAgLmZpbmQob3B0aW9ucy5yb3dTZWxlY3RvcilcclxuICAgICAgICAgICAgICAgIC5tb3VzZWVudGVyKG1vdXNlZW50ZXJSb3cpXHJcbiAgICAgICAgICAgICAgICAubW91c2VsZWF2ZShtb3VzZWxlYXZlUm93KVxyXG4gICAgICAgICAgICAgICAgLmNsaWNrKGNsaWNrUm93KTtcclxuXHJcbiAgICAgICAgJChkb2N1bWVudCkubW91c2Vtb3ZlKG1vdXNlbW92ZURvY3VtZW50KTtcclxuXHJcbiAgICB9O1xyXG59KShqUXVlcnkpO1xyXG5cclxuIiwiLyoqXHJcbiAqIGNpcmNsZXMgLSB2MC4wLjYgLSAyMDE1LTExLTI3XHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAxNSBsdWdvbGFic1xyXG4gKiBMaWNlbnNlZCBcclxuICovXHJcbiFmdW5jdGlvbihhLGIpe1wib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP21vZHVsZS5leHBvcnRzPWIoKTpcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtdLGIpOmEuQ2lyY2xlcz1iKCl9KHRoaXMsZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjt2YXIgYT13aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lfHx3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lfHx3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lfHx3aW5kb3cub1JlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lfHxmdW5jdGlvbihhKXtzZXRUaW1lb3V0KGEsMWUzLzYwKX0sYj1mdW5jdGlvbihhKXt2YXIgYj1hLmlkO2lmKHRoaXMuX2VsPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGIpLG51bGwhPT10aGlzLl9lbCl7dGhpcy5fcmFkaXVzPWEucmFkaXVzfHwxMCx0aGlzLl9kdXJhdGlvbj12b2lkIDA9PT1hLmR1cmF0aW9uPzUwMDphLmR1cmF0aW9uLHRoaXMuX3ZhbHVlPTAsdGhpcy5fbWF4VmFsdWU9YS5tYXhWYWx1ZXx8MTAwLHRoaXMuX3RleHQ9dm9pZCAwPT09YS50ZXh0P2Z1bmN0aW9uKGEpe3JldHVybiB0aGlzLmh0bWxpZnlOdW1iZXIoYSl9OmEudGV4dCx0aGlzLl9zdHJva2VXaWR0aD1hLndpZHRofHwxMCx0aGlzLl9jb2xvcnM9YS5jb2xvcnN8fFtcIiNFRUVcIixcIiNGMDBcIl0sdGhpcy5fc3ZnPW51bGwsdGhpcy5fbW92aW5nUGF0aD1udWxsLHRoaXMuX3dyYXBDb250YWluZXI9bnVsbCx0aGlzLl90ZXh0Q29udGFpbmVyPW51bGwsdGhpcy5fd3JwQ2xhc3M9YS53cnBDbGFzc3x8XCJjaXJjbGVzLXdycFwiLHRoaXMuX3RleHRDbGFzcz1hLnRleHRDbGFzc3x8XCJjaXJjbGVzLXRleHRcIix0aGlzLl92YWxDbGFzcz1hLnZhbHVlU3Ryb2tlQ2xhc3N8fFwiY2lyY2xlcy12YWx1ZVN0cm9rZVwiLHRoaXMuX21heFZhbENsYXNzPWEubWF4VmFsdWVTdHJva2VDbGFzc3x8XCJjaXJjbGVzLW1heFZhbHVlU3Ryb2tlXCIsdGhpcy5fc3R5bGVXcmFwcGVyPWEuc3R5bGVXcmFwcGVyPT09ITE/ITE6ITAsdGhpcy5fc3R5bGVUZXh0PWEuc3R5bGVUZXh0PT09ITE/ITE6ITA7dmFyIGM9TWF0aC5QSS8xODAqMjcwO3RoaXMuX3N0YXJ0PS1NYXRoLlBJLzE4MCo5MCx0aGlzLl9zdGFydFByZWNpc2U9dGhpcy5fcHJlY2lzZSh0aGlzLl9zdGFydCksdGhpcy5fY2lyYz1jLXRoaXMuX3N0YXJ0LHRoaXMuX2dlbmVyYXRlKCkudXBkYXRlKGEudmFsdWV8fDApfX07cmV0dXJuIGIucHJvdG90eXBlPXtWRVJTSU9OOlwiMC4wLjZcIixfZ2VuZXJhdGU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fc3ZnU2l6ZT0yKnRoaXMuX3JhZGl1cyx0aGlzLl9yYWRpdXNBZGp1c3RlZD10aGlzLl9yYWRpdXMtdGhpcy5fc3Ryb2tlV2lkdGgvMix0aGlzLl9nZW5lcmF0ZVN2ZygpLl9nZW5lcmF0ZVRleHQoKS5fZ2VuZXJhdGVXcmFwcGVyKCksdGhpcy5fZWwuaW5uZXJIVE1MPVwiXCIsdGhpcy5fZWwuYXBwZW5kQ2hpbGQodGhpcy5fd3JhcENvbnRhaW5lciksdGhpc30sX3NldFBlcmNlbnRhZ2U6ZnVuY3Rpb24oYSl7dGhpcy5fbW92aW5nUGF0aC5zZXRBdHRyaWJ1dGUoXCJkXCIsdGhpcy5fY2FsY3VsYXRlUGF0aChhLCEwKSksdGhpcy5fdGV4dENvbnRhaW5lci5pbm5lckhUTUw9dGhpcy5fZ2V0VGV4dCh0aGlzLmdldFZhbHVlRnJvbVBlcmNlbnQoYSkpfSxfZ2VuZXJhdGVXcmFwcGVyOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3dyYXBDb250YWluZXI9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSx0aGlzLl93cmFwQ29udGFpbmVyLmNsYXNzTmFtZT10aGlzLl93cnBDbGFzcyx0aGlzLl9zdHlsZVdyYXBwZXImJih0aGlzLl93cmFwQ29udGFpbmVyLnN0eWxlLnBvc2l0aW9uPVwicmVsYXRpdmVcIix0aGlzLl93cmFwQ29udGFpbmVyLnN0eWxlLmRpc3BsYXk9XCJpbmxpbmUtYmxvY2tcIiksdGhpcy5fd3JhcENvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9zdmcpLHRoaXMuX3dyYXBDb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fdGV4dENvbnRhaW5lciksdGhpc30sX2dlbmVyYXRlVGV4dDpmdW5jdGlvbigpe2lmKHRoaXMuX3RleHRDb250YWluZXI9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSx0aGlzLl90ZXh0Q29udGFpbmVyLmNsYXNzTmFtZT10aGlzLl90ZXh0Q2xhc3MsdGhpcy5fc3R5bGVUZXh0KXt2YXIgYT17cG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDowLGxlZnQ6MCx0ZXh0QWxpZ246XCJjZW50ZXJcIix3aWR0aDpcIjEwMCVcIixmb250U2l6ZTouNyp0aGlzLl9yYWRpdXMrXCJweFwiLGhlaWdodDp0aGlzLl9zdmdTaXplK1wicHhcIixsaW5lSGVpZ2h0OnRoaXMuX3N2Z1NpemUrXCJweFwifTtmb3IodmFyIGIgaW4gYSl0aGlzLl90ZXh0Q29udGFpbmVyLnN0eWxlW2JdPWFbYl19cmV0dXJuIHRoaXMuX3RleHRDb250YWluZXIuaW5uZXJIVE1MPXRoaXMuX2dldFRleHQoMCksdGhpc30sX2dldFRleHQ6ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuX3RleHQ/KHZvaWQgMD09PWEmJihhPXRoaXMuX3ZhbHVlKSxhPXBhcnNlRmxvYXQoYS50b0ZpeGVkKDIpKSxcImZ1bmN0aW9uXCI9PXR5cGVvZiB0aGlzLl90ZXh0P3RoaXMuX3RleHQuY2FsbCh0aGlzLGEpOnRoaXMuX3RleHQpOlwiXCJ9LF9nZW5lcmF0ZVN2ZzpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9zdmc9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIixcInN2Z1wiKSx0aGlzLl9zdmcuc2V0QXR0cmlidXRlKFwieG1sbnNcIixcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIpLHRoaXMuX3N2Zy5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLHRoaXMuX3N2Z1NpemUpLHRoaXMuX3N2Zy5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIix0aGlzLl9zdmdTaXplKSx0aGlzLl9nZW5lcmF0ZVBhdGgoMTAwLCExLHRoaXMuX2NvbG9yc1swXSx0aGlzLl9tYXhWYWxDbGFzcykuX2dlbmVyYXRlUGF0aCgxLCEwLHRoaXMuX2NvbG9yc1sxXSx0aGlzLl92YWxDbGFzcyksdGhpcy5fbW92aW5nUGF0aD10aGlzLl9zdmcuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJwYXRoXCIpWzFdLHRoaXN9LF9nZW5lcmF0ZVBhdGg6ZnVuY3Rpb24oYSxiLGMsZCl7dmFyIGU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIixcInBhdGhcIik7cmV0dXJuIGUuc2V0QXR0cmlidXRlKFwiZmlsbFwiLFwidHJhbnNwYXJlbnRcIiksZS5zZXRBdHRyaWJ1dGUoXCJzdHJva2VcIixjKSxlLnNldEF0dHJpYnV0ZShcInN0cm9rZS13aWR0aFwiLHRoaXMuX3N0cm9rZVdpZHRoKSxlLnNldEF0dHJpYnV0ZShcImRcIix0aGlzLl9jYWxjdWxhdGVQYXRoKGEsYikpLGUuc2V0QXR0cmlidXRlKFwiY2xhc3NcIixkKSx0aGlzLl9zdmcuYXBwZW5kQ2hpbGQoZSksdGhpc30sX2NhbGN1bGF0ZVBhdGg6ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzLl9zdGFydCthLzEwMCp0aGlzLl9jaXJjLGQ9dGhpcy5fcHJlY2lzZShjKTtyZXR1cm4gdGhpcy5fYXJjKGQsYil9LF9hcmM6ZnVuY3Rpb24oYSxiKXt2YXIgYz1hLS4wMDEsZD1hLXRoaXMuX3N0YXJ0UHJlY2lzZTxNYXRoLlBJPzA6MTtyZXR1cm5bXCJNXCIsdGhpcy5fcmFkaXVzK3RoaXMuX3JhZGl1c0FkanVzdGVkKk1hdGguY29zKHRoaXMuX3N0YXJ0UHJlY2lzZSksdGhpcy5fcmFkaXVzK3RoaXMuX3JhZGl1c0FkanVzdGVkKk1hdGguc2luKHRoaXMuX3N0YXJ0UHJlY2lzZSksXCJBXCIsdGhpcy5fcmFkaXVzQWRqdXN0ZWQsdGhpcy5fcmFkaXVzQWRqdXN0ZWQsMCxkLDEsdGhpcy5fcmFkaXVzK3RoaXMuX3JhZGl1c0FkanVzdGVkKk1hdGguY29zKGMpLHRoaXMuX3JhZGl1cyt0aGlzLl9yYWRpdXNBZGp1c3RlZCpNYXRoLnNpbihjKSxiP1wiXCI6XCJaXCJdLmpvaW4oXCIgXCIpfSxfcHJlY2lzZTpmdW5jdGlvbihhKXtyZXR1cm4gTWF0aC5yb3VuZCgxZTMqYSkvMWUzfSxodG1saWZ5TnVtYmVyOmZ1bmN0aW9uKGEsYixjKXtiPWJ8fFwiY2lyY2xlcy1pbnRlZ2VyXCIsYz1jfHxcImNpcmNsZXMtZGVjaW1hbHNcIjt2YXIgZD0oYStcIlwiKS5zcGxpdChcIi5cIiksZT0nPHNwYW4gY2xhc3M9XCInK2IrJ1wiPicrZFswXStcIjwvc3Bhbj5cIjtyZXR1cm4gZC5sZW5ndGg+MSYmKGUrPScuPHNwYW4gY2xhc3M9XCInK2MrJ1wiPicrZFsxXS5zdWJzdHJpbmcoMCwyKStcIjwvc3Bhbj5cIiksZX0sdXBkYXRlUmFkaXVzOmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLl9yYWRpdXM9YSx0aGlzLl9nZW5lcmF0ZSgpLnVwZGF0ZSghMCl9LHVwZGF0ZVdpZHRoOmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLl9zdHJva2VXaWR0aD1hLHRoaXMuX2dlbmVyYXRlKCkudXBkYXRlKCEwKX0sdXBkYXRlQ29sb3JzOmZ1bmN0aW9uKGEpe3RoaXMuX2NvbG9ycz1hO3ZhciBiPXRoaXMuX3N2Zy5nZXRFbGVtZW50c0J5VGFnTmFtZShcInBhdGhcIik7cmV0dXJuIGJbMF0uc2V0QXR0cmlidXRlKFwic3Ryb2tlXCIsYVswXSksYlsxXS5zZXRBdHRyaWJ1dGUoXCJzdHJva2VcIixhWzFdKSx0aGlzfSxnZXRQZXJjZW50OmZ1bmN0aW9uKCl7cmV0dXJuIDEwMCp0aGlzLl92YWx1ZS90aGlzLl9tYXhWYWx1ZX0sZ2V0VmFsdWVGcm9tUGVyY2VudDpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5fbWF4VmFsdWUqYS8xMDB9LGdldFZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3ZhbHVlfSxnZXRNYXhWYWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9tYXhWYWx1ZX0sdXBkYXRlOmZ1bmN0aW9uKGIsYyl7aWYoYj09PSEwKXJldHVybiB0aGlzLl9zZXRQZXJjZW50YWdlKHRoaXMuZ2V0UGVyY2VudCgpKSx0aGlzO2lmKHRoaXMuX3ZhbHVlPT1ifHxpc05hTihiKSlyZXR1cm4gdGhpczt2b2lkIDA9PT1jJiYoYz10aGlzLl9kdXJhdGlvbik7dmFyIGQsZSxmLGcsaD10aGlzLGk9aC5nZXRQZXJjZW50KCksaj0xO3JldHVybiB0aGlzLl92YWx1ZT1NYXRoLm1pbih0aGlzLl9tYXhWYWx1ZSxNYXRoLm1heCgwLGIpKSxjPyhkPWguZ2V0UGVyY2VudCgpLGU9ZD5pLGorPWQlMSxmPU1hdGguZmxvb3IoTWF0aC5hYnMoZC1pKS9qKSxnPWMvZixmdW5jdGlvbiBrKGIpe2lmKGU/aSs9ajppLT1qLGUmJmk+PWR8fCFlJiZkPj1pKXJldHVybiB2b2lkIGEoZnVuY3Rpb24oKXtoLl9zZXRQZXJjZW50YWdlKGQpfSk7YShmdW5jdGlvbigpe2guX3NldFBlcmNlbnRhZ2UoaSl9KTt2YXIgYz1EYXRlLm5vdygpLGY9Yy1iO2Y+PWc/ayhjKTpzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ayhEYXRlLm5vdygpKX0sZy1mKX0oRGF0ZS5ub3coKSksdGhpcyk6KHRoaXMuX3NldFBlcmNlbnRhZ2UodGhpcy5nZXRQZXJjZW50KCkpLHRoaXMpfX0sYi5jcmVhdGU9ZnVuY3Rpb24oYSl7cmV0dXJuIG5ldyBiKGEpfSxifSk7IiwidmFyIERhdGVwaWNrZXI7XHJcblxyXG4oZnVuY3Rpb24gKHdpbmRvdywgJCwgdW5kZWZpbmVkKSB7XHJcbiAgICB2YXIgcGx1Z2luTmFtZSA9ICdkYXRlcGlja2VyJyxcclxuICAgICAgICBhdXRvSW5pdFNlbGVjdG9yID0gJy5kYXRlcGlja2VyLWhlcmUnLFxyXG4gICAgICAgICRib2R5LCAkZGF0ZXBpY2tlcnNDb250YWluZXIsXHJcbiAgICAgICAgY29udGFpbmVyQnVpbHQgPSBmYWxzZSxcclxuICAgICAgICBiYXNlVGVtcGxhdGUgPSAnJyArXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlclwiPicgK1xyXG4gICAgICAgICAgICAnPG5hdiBjbGFzcz1cImRhdGVwaWNrZXItLW5hdlwiPjwvbmF2PicgK1xyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLWNvbnRlbnRcIj48L2Rpdj4nICtcclxuICAgICAgICAgICAgJzwvZGl2PicsXHJcbiAgICAgICAgZGVmYXVsdHMgPSB7XHJcbiAgICAgICAgICAgIGNsYXNzZXM6ICcnLFxyXG4gICAgICAgICAgICBpbmxpbmU6IGZhbHNlLFxyXG4gICAgICAgICAgICBsYW5ndWFnZTogJ3J1JyxcclxuICAgICAgICAgICAgc3RhcnREYXRlOiBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgICBmaXJzdERheTogJycsXHJcbiAgICAgICAgICAgIHdlZWtlbmRzOiBbNiwgMF0sXHJcbiAgICAgICAgICAgIGRhdGVGb3JtYXQ6ICcnLFxyXG4gICAgICAgICAgICBhbHRGaWVsZDogJycsXHJcbiAgICAgICAgICAgIGFsdEZpZWxkRGF0ZUZvcm1hdDogJ0AnLFxyXG4gICAgICAgICAgICB0b2dnbGVTZWxlY3RlZDogdHJ1ZSxcclxuICAgICAgICAgICAga2V5Ym9hcmROYXY6IHRydWUsXHJcblxyXG4gICAgICAgICAgICBwb3NpdGlvbjogJ2JvdHRvbSBsZWZ0JyxcclxuICAgICAgICAgICAgb2Zmc2V0OiAxMixcclxuXHJcbiAgICAgICAgICAgIHZpZXc6ICdkYXlzJyxcclxuICAgICAgICAgICAgbWluVmlldzogJ2RheXMnLFxyXG5cclxuICAgICAgICAgICAgc2hvd090aGVyTW9udGhzOiB0cnVlLFxyXG4gICAgICAgICAgICBzZWxlY3RPdGhlck1vbnRoczogdHJ1ZSxcclxuICAgICAgICAgICAgbW92ZVRvT3RoZXJNb250aHNPblNlbGVjdDogdHJ1ZSxcclxuXHJcbiAgICAgICAgICAgIHNob3dPdGhlclllYXJzOiB0cnVlLFxyXG4gICAgICAgICAgICBzZWxlY3RPdGhlclllYXJzOiB0cnVlLFxyXG4gICAgICAgICAgICBtb3ZlVG9PdGhlclllYXJzT25TZWxlY3Q6IHRydWUsXHJcblxyXG4gICAgICAgICAgICBtaW5EYXRlOiAnJyxcclxuICAgICAgICAgICAgbWF4RGF0ZTogJycsXHJcbiAgICAgICAgICAgIGRpc2FibGVOYXZXaGVuT3V0T2ZSYW5nZTogdHJ1ZSxcclxuXHJcbiAgICAgICAgICAgIG11bHRpcGxlRGF0ZXM6IGZhbHNlLCAvLyBCb29sZWFuIG9yIE51bWJlclxyXG4gICAgICAgICAgICBtdWx0aXBsZURhdGVzU2VwYXJhdG9yOiAnLCcsXHJcbiAgICAgICAgICAgIHJhbmdlOiBmYWxzZSxcclxuXHJcbiAgICAgICAgICAgIHRvZGF5QnV0dG9uOiBmYWxzZSxcclxuICAgICAgICAgICAgY2xlYXJCdXR0b246IGZhbHNlLFxyXG5cclxuICAgICAgICAgICAgc2hvd0V2ZW50OiAnZm9jdXMnLFxyXG4gICAgICAgICAgICBhdXRvQ2xvc2U6IGZhbHNlLFxyXG5cclxuICAgICAgICAgICAgLy8gbmF2aWdhdGlvblxyXG4gICAgICAgICAgICBtb250aHNGaWVsZDogJ21vbnRoc1Nob3J0JyxcclxuICAgICAgICAgICAgcHJldkh0bWw6ICc8c3ZnPjxwYXRoIGQ9XCJNIDE3LDEyIGwgLTUsNSBsIDUsNVwiPjwvcGF0aD48L3N2Zz4nLFxyXG4gICAgICAgICAgICBuZXh0SHRtbDogJzxzdmc+PHBhdGggZD1cIk0gMTQsMTIgbCA1LDUgbCAtNSw1XCI+PC9wYXRoPjwvc3ZnPicsXHJcbiAgICAgICAgICAgIG5hdlRpdGxlczoge1xyXG4gICAgICAgICAgICAgICAgZGF5czogJ01NLCA8aT55eXl5PC9pPicsXHJcbiAgICAgICAgICAgICAgICBtb250aHM6ICd5eXl5JyxcclxuICAgICAgICAgICAgICAgIHllYXJzOiAneXl5eTEgLSB5eXl5MidcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIC8vIGV2ZW50c1xyXG4gICAgICAgICAgICBvblNlbGVjdDogJycsXHJcbiAgICAgICAgICAgIG9uQ2hhbmdlTW9udGg6ICcnLFxyXG4gICAgICAgICAgICBvbkNoYW5nZVllYXI6ICcnLFxyXG4gICAgICAgICAgICBvbkNoYW5nZURlY2FkZTogJycsXHJcbiAgICAgICAgICAgIG9uQ2hhbmdlVmlldzogJycsXHJcbiAgICAgICAgICAgIG9uUmVuZGVyQ2VsbDogJydcclxuICAgICAgICB9LFxyXG4gICAgICAgIGhvdEtleXMgPSB7XHJcbiAgICAgICAgICAgICdjdHJsUmlnaHQnOiBbMTcsIDM5XSxcclxuICAgICAgICAgICAgJ2N0cmxVcCc6IFsxNywgMzhdLFxyXG4gICAgICAgICAgICAnY3RybExlZnQnOiBbMTcsIDM3XSxcclxuICAgICAgICAgICAgJ2N0cmxEb3duJzogWzE3LCA0MF0sXHJcbiAgICAgICAgICAgICdzaGlmdFJpZ2h0JzogWzE2LCAzOV0sXHJcbiAgICAgICAgICAgICdzaGlmdFVwJzogWzE2LCAzOF0sXHJcbiAgICAgICAgICAgICdzaGlmdExlZnQnOiBbMTYsIDM3XSxcclxuICAgICAgICAgICAgJ3NoaWZ0RG93bic6IFsxNiwgNDBdLFxyXG4gICAgICAgICAgICAnYWx0VXAnOiBbMTgsIDM4XSxcclxuICAgICAgICAgICAgJ2FsdFJpZ2h0JzogWzE4LCAzOV0sXHJcbiAgICAgICAgICAgICdhbHRMZWZ0JzogWzE4LCAzN10sXHJcbiAgICAgICAgICAgICdhbHREb3duJzogWzE4LCA0MF0sXHJcbiAgICAgICAgICAgICdjdHJsU2hpZnRVcCc6IFsxNiwgMTcsIDM4XVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGF0ZXBpY2tlcjtcclxuXHJcbiAgICBEYXRlcGlja2VyICA9IGZ1bmN0aW9uIChlbCwgb3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMuZWwgPSBlbDtcclxuICAgICAgICB0aGlzLiRlbCA9ICQoZWwpO1xyXG5cclxuICAgICAgICB0aGlzLm9wdHMgPSAkLmV4dGVuZCh0cnVlLCB7fSwgZGVmYXVsdHMsIG9wdGlvbnMsIHRoaXMuJGVsLmRhdGEoKSk7XHJcblxyXG4gICAgICAgIGlmICgkYm9keSA9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgJGJvZHkgPSAkKCdib2R5Jyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXRoaXMub3B0cy5zdGFydERhdGUpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRzLnN0YXJ0RGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5lbC5ub2RlTmFtZSA9PSAnSU5QVVQnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWxJc0lucHV0ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm9wdHMuYWx0RmllbGQpIHtcclxuICAgICAgICAgICAgdGhpcy4kYWx0RmllbGQgPSB0eXBlb2YgdGhpcy5vcHRzLmFsdEZpZWxkID09ICdzdHJpbmcnID8gJCh0aGlzLm9wdHMuYWx0RmllbGQpIDogdGhpcy5vcHRzLmFsdEZpZWxkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5pbml0ZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnNpbGVudCA9IGZhbHNlOyAvLyBOZWVkIHRvIHByZXZlbnQgdW5uZWNlc3NhcnkgcmVuZGVyaW5nXHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudERhdGUgPSB0aGlzLm9wdHMuc3RhcnREYXRlO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFZpZXcgPSB0aGlzLm9wdHMudmlldztcclxuICAgICAgICB0aGlzLl9jcmVhdGVTaG9ydEN1dHMoKTtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkRGF0ZXMgPSBbXTtcclxuICAgICAgICB0aGlzLnZpZXdzID0ge307XHJcbiAgICAgICAgdGhpcy5rZXlzID0gW107XHJcbiAgICAgICAgdGhpcy5taW5SYW5nZSA9ICcnO1xyXG4gICAgICAgIHRoaXMubWF4UmFuZ2UgPSAnJztcclxuXHJcbiAgICAgICAgdGhpcy5pbml0KClcclxuICAgIH07XHJcblxyXG4gICAgZGF0ZXBpY2tlciA9IERhdGVwaWNrZXI7XHJcblxyXG4gICAgZGF0ZXBpY2tlci5wcm90b3R5cGUgPSB7XHJcbiAgICAgICAgdmlld0luZGV4ZXM6IFsnZGF5cycsICdtb250aHMnLCAneWVhcnMnXSxcclxuXHJcbiAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoIWNvbnRhaW5lckJ1aWx0ICYmICF0aGlzLm9wdHMuaW5saW5lICYmIHRoaXMuZWxJc0lucHV0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9idWlsZERhdGVwaWNrZXJzQ29udGFpbmVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fYnVpbGRCYXNlSHRtbCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9kZWZpbmVMb2NhbGUodGhpcy5vcHRzLmxhbmd1YWdlKTtcclxuICAgICAgICAgICAgdGhpcy5fc3luY1dpdGhNaW5NYXhEYXRlcygpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuZWxJc0lucHV0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMub3B0cy5pbmxpbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBTZXQgZXh0cmEgY2xhc3NlcyBmb3IgcHJvcGVyIHRyYW5zaXRpb25zXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0UG9zaXRpb25DbGFzc2VzKHRoaXMub3B0cy5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYmluZEV2ZW50cygpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRzLmtleWJvYXJkTmF2KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYmluZEtleWJvYXJkRXZlbnRzKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyLm9uKCdtb3VzZWRvd24nLCB0aGlzLl9vbk1vdXNlRG93bkRhdGVwaWNrZXIuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyLm9uKCdtb3VzZXVwJywgdGhpcy5fb25Nb3VzZVVwRGF0ZXBpY2tlci5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5jbGFzc2VzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyLmFkZENsYXNzKHRoaXMub3B0cy5jbGFzc2VzKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLnZpZXdzW3RoaXMuY3VycmVudFZpZXddID0gbmV3IERhdGVwaWNrZXIuQm9keSh0aGlzLCB0aGlzLmN1cnJlbnRWaWV3LCB0aGlzLm9wdHMpO1xyXG4gICAgICAgICAgICB0aGlzLnZpZXdzW3RoaXMuY3VycmVudFZpZXddLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5uYXYgPSBuZXcgRGF0ZXBpY2tlci5OYXZpZ2F0aW9uKHRoaXMsIHRoaXMub3B0cyk7XHJcbiAgICAgICAgICAgIHRoaXMudmlldyA9IHRoaXMuY3VycmVudFZpZXc7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyLm9uKCdtb3VzZWVudGVyJywgJy5kYXRlcGlja2VyLS1jZWxsJywgdGhpcy5fb25Nb3VzZUVudGVyQ2VsbC5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlci5vbignbW91c2VsZWF2ZScsICcuZGF0ZXBpY2tlci0tY2VsbCcsIHRoaXMuX29uTW91c2VMZWF2ZUNlbGwuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmluaXRlZCA9IHRydWU7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2NyZWF0ZVNob3J0Q3V0czogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLm1pbkRhdGUgPSB0aGlzLm9wdHMubWluRGF0ZSA/IHRoaXMub3B0cy5taW5EYXRlIDogbmV3IERhdGUoLTg2Mzk5OTk5MTM2MDAwMDApO1xyXG4gICAgICAgICAgICB0aGlzLm1heERhdGUgPSB0aGlzLm9wdHMubWF4RGF0ZSA/IHRoaXMub3B0cy5tYXhEYXRlIDogbmV3IERhdGUoODYzOTk5OTkxMzYwMDAwMCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2JpbmRFdmVudHMgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLm9uKHRoaXMub3B0cy5zaG93RXZlbnQgKyAnLmFkcCcsIHRoaXMuX29uU2hvd0V2ZW50LmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICB0aGlzLiRlbC5vbignYmx1ci5hZHAnLCB0aGlzLl9vbkJsdXIuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLm9uKCdpbnB1dC5hZHAnLCB0aGlzLl9vbklucHV0LmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS5hZHAnLCB0aGlzLl9vblJlc2l6ZS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfYmluZEtleWJvYXJkRXZlbnRzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLm9uKCdrZXlkb3duLmFkcCcsIHRoaXMuX29uS2V5RG93bi5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgdGhpcy4kZWwub24oJ2tleXVwLmFkcCcsIHRoaXMuX29uS2V5VXAuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLm9uKCdob3RLZXkuYWRwJywgdGhpcy5fb25Ib3RLZXkuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgaXNXZWVrZW5kOiBmdW5jdGlvbiAoZGF5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdHMud2Vla2VuZHMuaW5kZXhPZihkYXkpICE9PSAtMTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfZGVmaW5lTG9jYWxlOiBmdW5jdGlvbiAobGFuZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGxhbmcgPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9jID0gRGF0ZXBpY2tlci5sYW5ndWFnZVtsYW5nXTtcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5sb2MpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0NhblxcJ3QgZmluZCBsYW5ndWFnZSBcIicgKyBsYW5nICsgJ1wiIGluIERhdGVwaWNrZXIubGFuZ3VhZ2UsIHdpbGwgdXNlIFwicnVcIiBpbnN0ZWFkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2MgPSAkLmV4dGVuZCh0cnVlLCB7fSwgRGF0ZXBpY2tlci5sYW5ndWFnZS5ydSlcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYyA9ICQuZXh0ZW5kKHRydWUsIHt9LCBEYXRlcGlja2VyLmxhbmd1YWdlLnJ1LCBEYXRlcGlja2VyLmxhbmd1YWdlW2xhbmddKVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2MgPSAkLmV4dGVuZCh0cnVlLCB7fSwgRGF0ZXBpY2tlci5sYW5ndWFnZS5ydSwgbGFuZylcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5kYXRlRm9ybWF0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYy5kYXRlRm9ybWF0ID0gdGhpcy5vcHRzLmRhdGVGb3JtYXRcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5maXJzdERheSAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9jLmZpcnN0RGF5ID0gdGhpcy5vcHRzLmZpcnN0RGF5XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfYnVpbGREYXRlcGlja2Vyc0NvbnRhaW5lcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBjb250YWluZXJCdWlsdCA9IHRydWU7XHJcbiAgICAgICAgICAgICRib2R5LmFwcGVuZCgnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXJzLWNvbnRhaW5lclwiIGlkPVwiZGF0ZXBpY2tlcnMtY29udGFpbmVyXCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgICRkYXRlcGlja2Vyc0NvbnRhaW5lciA9ICQoJyNkYXRlcGlja2Vycy1jb250YWluZXInKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfYnVpbGRCYXNlSHRtbDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgJGFwcGVuZFRhcmdldCxcclxuICAgICAgICAgICAgICAgICRpbmxpbmUgPSAkKCc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci1pbmxpbmVcIj4nKTtcclxuXHJcbiAgICAgICAgICAgIGlmKHRoaXMuZWwubm9kZU5hbWUgPT0gJ0lOUFVUJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm9wdHMuaW5saW5lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGFwcGVuZFRhcmdldCA9ICRkYXRlcGlja2Vyc0NvbnRhaW5lcjtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGFwcGVuZFRhcmdldCA9ICRpbmxpbmUuaW5zZXJ0QWZ0ZXIodGhpcy4kZWwpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkYXBwZW5kVGFyZ2V0ID0gJGlubGluZS5hcHBlbmRUbyh0aGlzLiRlbClcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlciA9ICQoYmFzZVRlbXBsYXRlKS5hcHBlbmRUbygkYXBwZW5kVGFyZ2V0KTtcclxuICAgICAgICAgICAgdGhpcy4kY29udGVudCA9ICQoJy5kYXRlcGlja2VyLS1jb250ZW50JywgdGhpcy4kZGF0ZXBpY2tlcik7XHJcbiAgICAgICAgICAgIHRoaXMuJG5hdiA9ICQoJy5kYXRlcGlja2VyLS1uYXYnLCB0aGlzLiRkYXRlcGlja2VyKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfdHJpZ2dlck9uQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5zZWxlY3RlZERhdGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0cy5vblNlbGVjdCgnJywgJycsIHRoaXMpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWREYXRlcyA9IHRoaXMuc2VsZWN0ZWREYXRlcyxcclxuICAgICAgICAgICAgICAgIHBhcnNlZFNlbGVjdGVkID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKHNlbGVjdGVkRGF0ZXNbMF0pLFxyXG4gICAgICAgICAgICAgICAgZm9ybWF0dGVkRGF0ZXMsXHJcbiAgICAgICAgICAgICAgICBfdGhpcyA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBkYXRlcyA9IG5ldyBEYXRlKHBhcnNlZFNlbGVjdGVkLnllYXIsIHBhcnNlZFNlbGVjdGVkLm1vbnRoLCBwYXJzZWRTZWxlY3RlZC5kYXRlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWREYXRlcyA9IHNlbGVjdGVkRGF0ZXMubWFwKGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLmZvcm1hdERhdGUoX3RoaXMubG9jLmRhdGVGb3JtYXQsIGRhdGUpXHJcbiAgICAgICAgICAgICAgICB9KS5qb2luKHRoaXMub3B0cy5tdWx0aXBsZURhdGVzU2VwYXJhdG9yKTtcclxuXHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSBuZXcgZGF0ZXMgYXJyYXksIHRvIHNlcGFyYXRlIGl0IGZyb20gb3JpZ2luYWwgc2VsZWN0ZWREYXRlc1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLm11bHRpcGxlRGF0ZXMgfHwgdGhpcy5vcHRzLnJhbmdlKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRlcyA9IHNlbGVjdGVkRGF0ZXMubWFwKGZ1bmN0aW9uKGRhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcGFyc2VkRGF0ZSA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZShkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IERhdGUocGFyc2VkRGF0ZS55ZWFyLCBwYXJzZWREYXRlLm1vbnRoLCBwYXJzZWREYXRlLmRhdGUpXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLm9wdHMub25TZWxlY3QoZm9ybWF0dGVkRGF0ZXMsIGRhdGVzLCB0aGlzKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBkID0gdGhpcy5wYXJzZWREYXRlLFxyXG4gICAgICAgICAgICAgICAgbyA9IHRoaXMub3B0cztcclxuICAgICAgICAgICAgc3dpdGNoICh0aGlzLnZpZXcpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2RheXMnOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKGQueWVhciwgZC5tb250aCArIDEsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvLm9uQ2hhbmdlTW9udGgpIG8ub25DaGFuZ2VNb250aCh0aGlzLnBhcnNlZERhdGUubW9udGgsIHRoaXMucGFyc2VkRGF0ZS55ZWFyKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ21vbnRocyc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoZC55ZWFyICsgMSwgZC5tb250aCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG8ub25DaGFuZ2VZZWFyKSBvLm9uQ2hhbmdlWWVhcih0aGlzLnBhcnNlZERhdGUueWVhcik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICd5ZWFycyc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoZC55ZWFyICsgMTAsIDAsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvLm9uQ2hhbmdlRGVjYWRlKSBvLm9uQ2hhbmdlRGVjYWRlKHRoaXMuY3VyRGVjYWRlKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHByZXY6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGQgPSB0aGlzLnBhcnNlZERhdGUsXHJcbiAgICAgICAgICAgICAgICBvID0gdGhpcy5vcHRzO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMudmlldykge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZGF5cyc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoZC55ZWFyLCBkLm1vbnRoIC0gMSwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG8ub25DaGFuZ2VNb250aCkgby5vbkNoYW5nZU1vbnRoKHRoaXMucGFyc2VkRGF0ZS5tb250aCwgdGhpcy5wYXJzZWREYXRlLnllYXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbW9udGhzJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShkLnllYXIgLSAxLCBkLm1vbnRoLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoby5vbkNoYW5nZVllYXIpIG8ub25DaGFuZ2VZZWFyKHRoaXMucGFyc2VkRGF0ZS55ZWFyKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3llYXJzJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShkLnllYXIgLSAxMCwgMCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG8ub25DaGFuZ2VEZWNhZGUpIG8ub25DaGFuZ2VEZWNhZGUodGhpcy5jdXJEZWNhZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZm9ybWF0RGF0ZTogZnVuY3Rpb24gKHN0cmluZywgZGF0ZSkge1xyXG4gICAgICAgICAgICBkYXRlID0gZGF0ZSB8fCB0aGlzLmRhdGU7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBzdHJpbmcsXHJcbiAgICAgICAgICAgICAgICBib3VuZGFyeSA9IHRoaXMuX2dldFdvcmRCb3VuZGFyeVJlZ0V4cCxcclxuICAgICAgICAgICAgICAgIGxvY2FsZSA9IHRoaXMubG9jLFxyXG4gICAgICAgICAgICAgICAgZGVjYWRlID0gZGF0ZXBpY2tlci5nZXREZWNhZGUoZGF0ZSksXHJcbiAgICAgICAgICAgICAgICBkID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKGRhdGUpO1xyXG5cclxuICAgICAgICAgICAgc3dpdGNoICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIC9ALy50ZXN0KHJlc3VsdCk6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoL0AvLCBkYXRlLmdldFRpbWUoKSk7XHJcbiAgICAgICAgICAgICAgICBjYXNlIC9kZC8udGVzdChyZXN1bHQpOlxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCdkZCcpLCBkLmZ1bGxEYXRlKTtcclxuICAgICAgICAgICAgICAgIGNhc2UgL2QvLnRlc3QocmVzdWx0KTpcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgnZCcpLCBkLmRhdGUpO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAvREQvLnRlc3QocmVzdWx0KTpcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgnREQnKSwgbG9jYWxlLmRheXNbZC5kYXldKTtcclxuICAgICAgICAgICAgICAgIGNhc2UgL0QvLnRlc3QocmVzdWx0KTpcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgnRCcpLCBsb2NhbGUuZGF5c1Nob3J0W2QuZGF5XSk7XHJcbiAgICAgICAgICAgICAgICBjYXNlIC9tbS8udGVzdChyZXN1bHQpOlxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCdtbScpLCBkLmZ1bGxNb250aCk7XHJcbiAgICAgICAgICAgICAgICBjYXNlIC9tLy50ZXN0KHJlc3VsdCk6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ20nKSwgZC5tb250aCArIDEpO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAvTU0vLnRlc3QocmVzdWx0KTpcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgnTU0nKSwgdGhpcy5sb2MubW9udGhzW2QubW9udGhdKTtcclxuICAgICAgICAgICAgICAgIGNhc2UgL00vLnRlc3QocmVzdWx0KTpcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgnTScpLCBsb2NhbGUubW9udGhzU2hvcnRbZC5tb250aF0pO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAveXl5eS8udGVzdChyZXN1bHQpOlxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCd5eXl5JyksIGQueWVhcik7XHJcbiAgICAgICAgICAgICAgICBjYXNlIC95eXl5MS8udGVzdChyZXN1bHQpOlxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCd5eXl5MScpLCBkZWNhZGVbMF0pO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAveXl5eTIvLnRlc3QocmVzdWx0KTpcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgneXl5eTInKSwgZGVjYWRlWzFdKTtcclxuICAgICAgICAgICAgICAgIGNhc2UgL3l5Ly50ZXN0KHJlc3VsdCk6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ3l5JyksIGQueWVhci50b1N0cmluZygpLnNsaWNlKC0yKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2dldFdvcmRCb3VuZGFyeVJlZ0V4cDogZnVuY3Rpb24gKHNpZ24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoJ1xcXFxiKD89W2EtekEtWjAtOcOkw7bDvMOfw4TDlsOcPF0pJyArIHNpZ24gKyAnKD8hWz5hLXpBLVowLTnDpMO2w7zDn8OEw5bDnF0pJyk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2VsZWN0RGF0ZTogZnVuY3Rpb24gKGRhdGUpIHtcclxuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIG9wdHMgPSBfdGhpcy5vcHRzLFxyXG4gICAgICAgICAgICAgICAgZCA9IF90aGlzLnBhcnNlZERhdGUsXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZERhdGVzID0gX3RoaXMuc2VsZWN0ZWREYXRlcyxcclxuICAgICAgICAgICAgICAgIGxlbiA9IHNlbGVjdGVkRGF0ZXMubGVuZ3RoLFxyXG4gICAgICAgICAgICAgICAgbmV3RGF0ZSA9ICcnO1xyXG5cclxuICAgICAgICAgICAgaWYgKCEoZGF0ZSBpbnN0YW5jZW9mIERhdGUpKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBpZiAoX3RoaXMudmlldyA9PSAnZGF5cycpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRlLmdldE1vbnRoKCkgIT0gZC5tb250aCAmJiBvcHRzLm1vdmVUb090aGVyTW9udGhzT25TZWxlY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICBuZXdEYXRlID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIDEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoX3RoaXMudmlldyA9PSAneWVhcnMnKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZS5nZXRGdWxsWWVhcigpICE9IGQueWVhciAmJiBvcHRzLm1vdmVUb090aGVyWWVhcnNPblNlbGVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld0RhdGUgPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIDAsIDEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobmV3RGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuc2lsZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIF90aGlzLmRhdGUgPSBuZXdEYXRlO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuc2lsZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5uYXYuX3JlbmRlcigpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChvcHRzLm11bHRpcGxlRGF0ZXMgJiYgIW9wdHMucmFuZ2UpIHsgLy8gU2V0IHByaW9yaXR5IHRvIHJhbmdlIGZ1bmN0aW9uYWxpdHlcclxuICAgICAgICAgICAgICAgIGlmIChsZW4gPT09IG9wdHMubXVsdGlwbGVEYXRlcykgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFfdGhpcy5faXNTZWxlY3RlZChkYXRlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnNlbGVjdGVkRGF0ZXMucHVzaChkYXRlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRzLnJhbmdlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobGVuID09IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZWxlY3RlZERhdGVzID0gW2RhdGVdO1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLm1pblJhbmdlID0gZGF0ZTtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5tYXhSYW5nZSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChsZW4gPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnNlbGVjdGVkRGF0ZXMucHVzaChkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIV90aGlzLm1heFJhbmdlKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMubWF4UmFuZ2UgPSBkYXRlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLm1pblJhbmdlID0gZGF0ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2VsZWN0ZWREYXRlcyA9IFtfdGhpcy5taW5SYW5nZSwgX3RoaXMubWF4UmFuZ2VdXHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZWxlY3RlZERhdGVzID0gW2RhdGVdO1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLm1pblJhbmdlID0gZGF0ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLnNlbGVjdGVkRGF0ZXMgPSBbZGF0ZV07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIF90aGlzLl9zZXRJbnB1dFZhbHVlKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAob3B0cy5vblNlbGVjdCkge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuX3RyaWdnZXJPbkNoYW5nZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAob3B0cy5hdXRvQ2xvc2UpIHtcclxuICAgICAgICAgICAgICAgIGlmICghb3B0cy5tdWx0aXBsZURhdGVzICYmICFvcHRzLnJhbmdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRzLnJhbmdlICYmIF90aGlzLnNlbGVjdGVkRGF0ZXMubGVuZ3RoID09IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIF90aGlzLnZpZXdzW3RoaXMuY3VycmVudFZpZXddLl9yZW5kZXIoKVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHJlbW92ZURhdGU6IGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxlY3RlZCA9IHRoaXMuc2VsZWN0ZWREYXRlcyxcclxuICAgICAgICAgICAgICAgIF90aGlzID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIGlmICghKGRhdGUgaW5zdGFuY2VvZiBEYXRlKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGVkLnNvbWUoZnVuY3Rpb24gKGN1ckRhdGUsIGkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRlcGlja2VyLmlzU2FtZShjdXJEYXRlLCBkYXRlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkLnNwbGljZShpLCAxKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFfdGhpcy5zZWxlY3RlZERhdGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5taW5SYW5nZSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5tYXhSYW5nZSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMudmlld3NbX3RoaXMuY3VycmVudFZpZXddLl9yZW5kZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5fc2V0SW5wdXRWYWx1ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXMub3B0cy5vblNlbGVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5fdHJpZ2dlck9uQ2hhbmdlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHRvZGF5OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy52aWV3ID0gdGhpcy5vcHRzLm1pblZpZXc7XHJcbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgY2xlYXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZERhdGVzID0gW107XHJcbiAgICAgICAgICAgIHRoaXMubWluUmFuZ2UgPSAnJztcclxuICAgICAgICAgICAgdGhpcy5tYXhSYW5nZSA9ICcnO1xyXG4gICAgICAgICAgICB0aGlzLnZpZXdzW3RoaXMuY3VycmVudFZpZXddLl9yZW5kZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5fc2V0SW5wdXRWYWx1ZSgpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLm9uU2VsZWN0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl90cmlnZ2VyT25DaGFuZ2UoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVXBkYXRlcyBkYXRlcGlja2VyIG9wdGlvbnNcclxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IHBhcmFtIC0gcGFyYW1ldGVyJ3MgbmFtZSB0byB1cGRhdGUuIElmIG9iamVjdCB0aGVuIGl0IHdpbGwgZXh0ZW5kIGN1cnJlbnQgb3B0aW9uc1xyXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfE51bWJlcnxPYmplY3R9IFt2YWx1ZV0gLSBuZXcgcGFyYW0gdmFsdWVcclxuICAgICAgICAgKi9cclxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIChwYXJhbSwgdmFsdWUpIHtcclxuICAgICAgICAgICAgdmFyIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XHJcbiAgICAgICAgICAgIGlmIChsZW4gPT0gMikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcHRzW3BhcmFtXSA9IHZhbHVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxlbiA9PSAxICYmIHR5cGVvZiBwYXJhbSA9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcHRzID0gJC5leHRlbmQodHJ1ZSwgdGhpcy5vcHRzLCBwYXJhbSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5fY3JlYXRlU2hvcnRDdXRzKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3N5bmNXaXRoTWluTWF4RGF0ZXMoKTtcclxuICAgICAgICAgICAgdGhpcy5fZGVmaW5lTG9jYWxlKHRoaXMub3B0cy5sYW5ndWFnZSk7XHJcbiAgICAgICAgICAgIHRoaXMubmF2Ll9hZGRCdXR0b25zSWZOZWVkKCk7XHJcbiAgICAgICAgICAgIHRoaXMubmF2Ll9yZW5kZXIoKTtcclxuICAgICAgICAgICAgdGhpcy52aWV3c1t0aGlzLmN1cnJlbnRWaWV3XS5fcmVuZGVyKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5lbElzSW5wdXQgJiYgIXRoaXMub3B0cy5pbmxpbmUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NldFBvc2l0aW9uQ2xhc3Nlcyh0aGlzLm9wdHMucG9zaXRpb24pO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudmlzaWJsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb24odGhpcy5vcHRzLnBvc2l0aW9uKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLmNsYXNzZXMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXIuYWRkQ2xhc3ModGhpcy5vcHRzLmNsYXNzZXMpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9zeW5jV2l0aE1pbk1heERhdGVzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBjdXJUaW1lID0gdGhpcy5kYXRlLmdldFRpbWUoKTtcclxuICAgICAgICAgICAgdGhpcy5zaWxlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5taW5UaW1lID4gY3VyVGltZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdGhpcy5taW5EYXRlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5tYXhUaW1lIDwgY3VyVGltZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdGhpcy5tYXhEYXRlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2lzU2VsZWN0ZWQ6IGZ1bmN0aW9uIChjaGVja0RhdGUsIGNlbGxUeXBlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkRGF0ZXMuc29tZShmdW5jdGlvbiAoZGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGVwaWNrZXIuaXNTYW1lKGRhdGUsIGNoZWNrRGF0ZSwgY2VsbFR5cGUpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX3NldElucHV0VmFsdWU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIG9wdHMgPSBfdGhpcy5vcHRzLFxyXG4gICAgICAgICAgICAgICAgZm9ybWF0ID0gX3RoaXMubG9jLmRhdGVGb3JtYXQsXHJcbiAgICAgICAgICAgICAgICBhbHRGb3JtYXQgPSBvcHRzLmFsdEZpZWxkRGF0ZUZvcm1hdCxcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gX3RoaXMuc2VsZWN0ZWREYXRlcy5tYXAoZnVuY3Rpb24gKGRhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuZm9ybWF0RGF0ZShmb3JtYXQsIGRhdGUpXHJcbiAgICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgICAgIGFsdFZhbHVlcztcclxuXHJcbiAgICAgICAgICAgIGlmIChvcHRzLmFsdEZpZWxkICYmIF90aGlzLiRhbHRGaWVsZC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGFsdFZhbHVlcyA9IHRoaXMuc2VsZWN0ZWREYXRlcy5tYXAoZnVuY3Rpb24gKGRhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuZm9ybWF0RGF0ZShhbHRGb3JtYXQsIGRhdGUpXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGFsdFZhbHVlcyA9IGFsdFZhbHVlcy5qb2luKHRoaXMub3B0cy5tdWx0aXBsZURhdGVzU2VwYXJhdG9yKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGFsdEZpZWxkLnZhbChhbHRWYWx1ZXMpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLmpvaW4odGhpcy5vcHRzLm11bHRpcGxlRGF0ZXNTZXBhcmF0b3IpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kZWwudmFsKHZhbHVlKVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENoZWNrIGlmIGRhdGUgaXMgYmV0d2VlbiBtaW5EYXRlIGFuZCBtYXhEYXRlXHJcbiAgICAgICAgICogQHBhcmFtIGRhdGUge29iamVjdH0gLSBkYXRlIG9iamVjdFxyXG4gICAgICAgICAqIEBwYXJhbSB0eXBlIHtzdHJpbmd9IC0gY2VsbCB0eXBlXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBfaXNJblJhbmdlOiBmdW5jdGlvbiAoZGF0ZSwgdHlwZSkge1xyXG4gICAgICAgICAgICB2YXIgdGltZSA9IGRhdGUuZ2V0VGltZSgpLFxyXG4gICAgICAgICAgICAgICAgZCA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZShkYXRlKSxcclxuICAgICAgICAgICAgICAgIG1pbiA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZSh0aGlzLm1pbkRhdGUpLFxyXG4gICAgICAgICAgICAgICAgbWF4ID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKHRoaXMubWF4RGF0ZSksXHJcbiAgICAgICAgICAgICAgICBkTWluVGltZSA9IG5ldyBEYXRlKGQueWVhciwgZC5tb250aCwgbWluLmRhdGUpLmdldFRpbWUoKSxcclxuICAgICAgICAgICAgICAgIGRNYXhUaW1lID0gbmV3IERhdGUoZC55ZWFyLCBkLm1vbnRoLCBtYXguZGF0ZSkuZ2V0VGltZSgpLFxyXG4gICAgICAgICAgICAgICAgdHlwZXMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF5OiB0aW1lID49IHRoaXMubWluVGltZSAmJiB0aW1lIDw9IHRoaXMubWF4VGltZSxcclxuICAgICAgICAgICAgICAgICAgICBtb250aDogZE1pblRpbWUgPj0gdGhpcy5taW5UaW1lICYmIGRNYXhUaW1lIDw9IHRoaXMubWF4VGltZSxcclxuICAgICAgICAgICAgICAgICAgICB5ZWFyOiBkLnllYXIgPj0gbWluLnllYXIgJiYgZC55ZWFyIDw9IG1heC55ZWFyXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gdHlwZSA/IHR5cGVzW3R5cGVdIDogdHlwZXMuZGF5XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2dldERpbWVuc2lvbnM6IGZ1bmN0aW9uICgkZWwpIHtcclxuICAgICAgICAgICAgdmFyIG9mZnNldCA9ICRlbC5vZmZzZXQoKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB3aWR0aDogJGVsLm91dGVyV2lkdGgoKSxcclxuICAgICAgICAgICAgICAgIGhlaWdodDogJGVsLm91dGVySGVpZ2h0KCksXHJcbiAgICAgICAgICAgICAgICBsZWZ0OiBvZmZzZXQubGVmdCxcclxuICAgICAgICAgICAgICAgIHRvcDogb2Zmc2V0LnRvcFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2dldERhdGVGcm9tQ2VsbDogZnVuY3Rpb24gKGNlbGwpIHtcclxuICAgICAgICAgICAgdmFyIGN1ckRhdGUgPSB0aGlzLnBhcnNlZERhdGUsXHJcbiAgICAgICAgICAgICAgICB5ZWFyID0gY2VsbC5kYXRhKCd5ZWFyJykgfHwgY3VyRGF0ZS55ZWFyLFxyXG4gICAgICAgICAgICAgICAgbW9udGggPSBjZWxsLmRhdGEoJ21vbnRoJykgPT0gdW5kZWZpbmVkID8gY3VyRGF0ZS5tb250aCA6IGNlbGwuZGF0YSgnbW9udGgnKSxcclxuICAgICAgICAgICAgICAgIGRhdGUgPSBjZWxsLmRhdGEoJ2RhdGUnKSB8fCAxO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHllYXIsIG1vbnRoLCBkYXRlKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfc2V0UG9zaXRpb25DbGFzc2VzOiBmdW5jdGlvbiAocG9zKSB7XHJcbiAgICAgICAgICAgIHBvcyA9IHBvcy5zcGxpdCgnICcpO1xyXG4gICAgICAgICAgICB2YXIgbWFpbiA9IHBvc1swXSxcclxuICAgICAgICAgICAgICAgIHNlYyA9IHBvc1sxXSxcclxuICAgICAgICAgICAgICAgIGNsYXNzZXMgPSAnZGF0ZXBpY2tlciAtJyArIG1haW4gKyAnLScgKyBzZWMgKyAnLSAtZnJvbS0nICsgbWFpbiArICctJztcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnZpc2libGUpIGNsYXNzZXMgKz0gJyBhY3RpdmUnO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlclxyXG4gICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2NsYXNzJylcclxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcyhjbGFzc2VzKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzZXRQb3NpdGlvbjogZnVuY3Rpb24gKHBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uID0gcG9zaXRpb24gfHwgdGhpcy5vcHRzLnBvc2l0aW9uO1xyXG5cclxuICAgICAgICAgICAgdmFyIGRpbXMgPSB0aGlzLl9nZXREaW1lbnNpb25zKHRoaXMuJGVsKSxcclxuICAgICAgICAgICAgICAgIHNlbGZEaW1zID0gdGhpcy5fZ2V0RGltZW5zaW9ucyh0aGlzLiRkYXRlcGlja2VyKSxcclxuICAgICAgICAgICAgICAgIHBvcyA9IHBvc2l0aW9uLnNwbGl0KCcgJyksXHJcbiAgICAgICAgICAgICAgICB0b3AsIGxlZnQsXHJcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSB0aGlzLm9wdHMub2Zmc2V0LFxyXG4gICAgICAgICAgICAgICAgbWFpbiA9IHBvc1swXSxcclxuICAgICAgICAgICAgICAgIHNlY29uZGFyeSA9IHBvc1sxXTtcclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCAobWFpbikge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAndG9wJzpcclxuICAgICAgICAgICAgICAgICAgICB0b3AgPSBkaW1zLnRvcCAtIHNlbGZEaW1zLmhlaWdodCAtIG9mZnNldDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gZGltcy5sZWZ0ICsgZGltcy53aWR0aCArIG9mZnNldDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XHJcbiAgICAgICAgICAgICAgICAgICAgdG9wID0gZGltcy50b3AgKyBkaW1zLmhlaWdodCArIG9mZnNldDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgICAgICAgICAgICAgIGxlZnQgPSBkaW1zLmxlZnQgLSBzZWxmRGltcy53aWR0aCAtIG9mZnNldDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc3dpdGNoKHNlY29uZGFyeSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAndG9wJzpcclxuICAgICAgICAgICAgICAgICAgICB0b3AgPSBkaW1zLnRvcDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gZGltcy5sZWZ0ICsgZGltcy53aWR0aCAtIHNlbGZEaW1zLndpZHRoO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnYm90dG9tJzpcclxuICAgICAgICAgICAgICAgICAgICB0b3AgPSBkaW1zLnRvcCArIGRpbXMuaGVpZ2h0IC0gc2VsZkRpbXMuaGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgICAgICAgICAgICAgbGVmdCA9IGRpbXMubGVmdDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2NlbnRlcic6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKC9sZWZ0fHJpZ2h0Ly50ZXN0KG1haW4pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcCA9IGRpbXMudG9wICsgZGltcy5oZWlnaHQvMiAtIHNlbGZEaW1zLmhlaWdodC8yO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgPSBkaW1zLmxlZnQgKyBkaW1zLndpZHRoLzIgLSBzZWxmRGltcy53aWR0aC8yO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlclxyXG4gICAgICAgICAgICAgICAgLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogbGVmdCxcclxuICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzaG93OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb24odGhpcy5vcHRzLnBvc2l0aW9uKTtcclxuICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlci5hZGRDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgaGlkZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyXHJcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgICAgICAgICAgICAgICAuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiAnLTEwMDAwMHB4J1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmZvY3VzZWQgPSAnJztcclxuICAgICAgICAgICAgdGhpcy5rZXlzID0gW107XHJcblxyXG4gICAgICAgICAgICB0aGlzLmluRm9jdXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLmJsdXIoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBkb3duOiBmdW5jdGlvbiAoZGF0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9jaGFuZ2VWaWV3KGRhdGUsICdkb3duJyk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgdXA6IGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NoYW5nZVZpZXcoZGF0ZSwgJ3VwJyk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2NoYW5nZVZpZXc6IGZ1bmN0aW9uIChkYXRlLCBkaXIpIHtcclxuICAgICAgICAgICAgZGF0ZSA9IGRhdGUgfHwgdGhpcy5mb2N1c2VkIHx8IHRoaXMuZGF0ZTtcclxuXHJcbiAgICAgICAgICAgIHZhciBuZXh0VmlldyA9IGRpciA9PSAndXAnID8gdGhpcy52aWV3SW5kZXggKyAxIDogdGhpcy52aWV3SW5kZXggLSAxO1xyXG4gICAgICAgICAgICBpZiAobmV4dFZpZXcgPiAyKSBuZXh0VmlldyA9IDI7XHJcbiAgICAgICAgICAgIGlmIChuZXh0VmlldyA8IDApIG5leHRWaWV3ID0gMDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIDEpO1xyXG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnZpZXcgPSB0aGlzLnZpZXdJbmRleGVzW25leHRWaWV3XTtcclxuXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2hhbmRsZUhvdEtleTogZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgICB2YXIgZGF0ZSA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZSh0aGlzLl9nZXRGb2N1c2VkRGF0ZSgpKSxcclxuICAgICAgICAgICAgICAgIGZvY3VzZWRQYXJzZWQsXHJcbiAgICAgICAgICAgICAgICBvID0gdGhpcy5vcHRzLFxyXG4gICAgICAgICAgICAgICAgbmV3RGF0ZSxcclxuICAgICAgICAgICAgICAgIHRvdGFsRGF5c0luTmV4dE1vbnRoLFxyXG4gICAgICAgICAgICAgICAgbW9udGhDaGFuZ2VkID0gZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB5ZWFyQ2hhbmdlZCA9IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgZGVjYWRlQ2hhbmdlZCA9IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgeSA9IGRhdGUueWVhcixcclxuICAgICAgICAgICAgICAgIG0gPSBkYXRlLm1vbnRoLFxyXG4gICAgICAgICAgICAgICAgZCA9IGRhdGUuZGF0ZTtcclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCAoa2V5KSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdjdHJsUmlnaHQnOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAnY3RybFVwJzpcclxuICAgICAgICAgICAgICAgICAgICBtICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9udGhDaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2N0cmxMZWZ0JzpcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2N0cmxEb3duJzpcclxuICAgICAgICAgICAgICAgICAgICBtIC09IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9udGhDaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3NoaWZ0UmlnaHQnOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAnc2hpZnRVcCc6XHJcbiAgICAgICAgICAgICAgICAgICAgeWVhckNoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHkgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3NoaWZ0TGVmdCc6XHJcbiAgICAgICAgICAgICAgICBjYXNlICdzaGlmdERvd24nOlxyXG4gICAgICAgICAgICAgICAgICAgIHllYXJDaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB5IC09IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdhbHRSaWdodCc6XHJcbiAgICAgICAgICAgICAgICBjYXNlICdhbHRVcCc6XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjYWRlQ2hhbmdlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgeSArPSAxMDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2FsdExlZnQnOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAnYWx0RG93bic6XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjYWRlQ2hhbmdlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgeSAtPSAxMDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2N0cmxTaGlmdFVwJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRvdGFsRGF5c0luTmV4dE1vbnRoID0gZGF0ZXBpY2tlci5nZXREYXlzQ291bnQobmV3IERhdGUoeSxtKSk7XHJcbiAgICAgICAgICAgIG5ld0RhdGUgPSBuZXcgRGF0ZSh5LG0sZCk7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBuZXh0IG1vbnRoIGhhcyBsZXNzIGRheXMgdGhhbiBjdXJyZW50LCBzZXQgZGF0ZSB0byB0b3RhbCBkYXlzIGluIHRoYXQgbW9udGhcclxuICAgICAgICAgICAgaWYgKHRvdGFsRGF5c0luTmV4dE1vbnRoIDwgZCkgZCA9IHRvdGFsRGF5c0luTmV4dE1vbnRoO1xyXG5cclxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgbmV3RGF0ZSBpcyBpbiB2YWxpZCByYW5nZVxyXG4gICAgICAgICAgICBpZiAobmV3RGF0ZS5nZXRUaW1lKCkgPCB0aGlzLm1pblRpbWUpIHtcclxuICAgICAgICAgICAgICAgIG5ld0RhdGUgPSB0aGlzLm1pbkRhdGU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3RGF0ZS5nZXRUaW1lKCkgPiB0aGlzLm1heFRpbWUpIHtcclxuICAgICAgICAgICAgICAgIG5ld0RhdGUgPSB0aGlzLm1heERhdGU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuZm9jdXNlZCA9IG5ld0RhdGU7XHJcblxyXG4gICAgICAgICAgICBmb2N1c2VkUGFyc2VkID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKG5ld0RhdGUpO1xyXG4gICAgICAgICAgICBpZiAobW9udGhDaGFuZ2VkICYmIG8ub25DaGFuZ2VNb250aCkge1xyXG4gICAgICAgICAgICAgICAgby5vbkNoYW5nZU1vbnRoKGZvY3VzZWRQYXJzZWQubW9udGgsIGZvY3VzZWRQYXJzZWQueWVhcilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoeWVhckNoYW5nZWQgJiYgby5vbkNoYW5nZVllYXIpIHtcclxuICAgICAgICAgICAgICAgIG8ub25DaGFuZ2VZZWFyKGZvY3VzZWRQYXJzZWQueWVhcilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZGVjYWRlQ2hhbmdlZCAmJiBvLm9uQ2hhbmdlRGVjYWRlKSB7XHJcbiAgICAgICAgICAgICAgICBvLm9uQ2hhbmdlRGVjYWRlKHRoaXMuY3VyRGVjYWRlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX3JlZ2lzdGVyS2V5OiBmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgIHZhciBleGlzdHMgPSB0aGlzLmtleXMuc29tZShmdW5jdGlvbiAoY3VyS2V5KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3VyS2V5ID09IGtleTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWV4aXN0cykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlzLnB1c2goa2V5KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX3VuUmVnaXN0ZXJLZXk6IGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5rZXlzLmluZGV4T2Yoa2V5KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMua2V5cy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9pc0hvdEtleVByZXNzZWQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGN1cnJlbnRIb3RLZXksXHJcbiAgICAgICAgICAgICAgICBmb3VuZCA9IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgX3RoaXMgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgcHJlc3NlZEtleXMgPSB0aGlzLmtleXMuc29ydCgpO1xyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgaG90S2V5IGluIGhvdEtleXMpIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRIb3RLZXkgPSBob3RLZXlzW2hvdEtleV07XHJcbiAgICAgICAgICAgICAgICBpZiAocHJlc3NlZEtleXMubGVuZ3RoICE9IGN1cnJlbnRIb3RLZXkubGVuZ3RoKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudEhvdEtleS5ldmVyeShmdW5jdGlvbiAoa2V5LCBpKSB7IHJldHVybiBrZXkgPT0gcHJlc3NlZEtleXNbaV19KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLl90cmlnZ2VyKCdob3RLZXknLCBob3RLZXkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZvdW5kO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF90cmlnZ2VyOiBmdW5jdGlvbiAoZXZlbnQsIGFyZ3MpIHtcclxuICAgICAgICAgICAgdGhpcy4kZWwudHJpZ2dlcihldmVudCwgYXJncylcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfZm9jdXNOZXh0Q2VsbDogZnVuY3Rpb24gKGtleUNvZGUsIHR5cGUpIHtcclxuICAgICAgICAgICAgdHlwZSA9IHR5cGUgfHwgdGhpcy5jZWxsVHlwZTtcclxuXHJcbiAgICAgICAgICAgIHZhciBkYXRlID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKHRoaXMuX2dldEZvY3VzZWREYXRlKCkpLFxyXG4gICAgICAgICAgICAgICAgeSA9IGRhdGUueWVhcixcclxuICAgICAgICAgICAgICAgIG0gPSBkYXRlLm1vbnRoLFxyXG4gICAgICAgICAgICAgICAgZCA9IGRhdGUuZGF0ZTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0hvdEtleVByZXNzZWQoKSl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHN3aXRjaChrZXlDb2RlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM3OiAvLyBsZWZ0XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAnZGF5JyA/IChkIC09IDEpIDogJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAnbW9udGgnID8gKG0gLT0gMSkgOiAnJztcclxuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICd5ZWFyJyA/ICh5IC09IDEpIDogJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM4OiAvLyB1cFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ2RheScgPyAoZCAtPSA3KSA6ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ21vbnRoJyA/IChtIC09IDMpIDogJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAneWVhcicgPyAoeSAtPSA0KSA6ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzOTogLy8gcmlnaHRcclxuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICdkYXknID8gKGQgKz0gMSkgOiAnJztcclxuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICdtb250aCcgPyAobSArPSAxKSA6ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ3llYXInID8gKHkgKz0gMSkgOiAnJztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgNDA6IC8vIGRvd25cclxuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICdkYXknID8gKGQgKz0gNykgOiAnJztcclxuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICdtb250aCcgPyAobSArPSAzKSA6ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ3llYXInID8gKHkgKz0gNCkgOiAnJztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIG5kID0gbmV3IERhdGUoeSxtLGQpO1xyXG4gICAgICAgICAgICBpZiAobmQuZ2V0VGltZSgpIDwgdGhpcy5taW5UaW1lKSB7XHJcbiAgICAgICAgICAgICAgICBuZCA9IHRoaXMubWluRGF0ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChuZC5nZXRUaW1lKCkgPiB0aGlzLm1heFRpbWUpIHtcclxuICAgICAgICAgICAgICAgIG5kID0gdGhpcy5tYXhEYXRlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmZvY3VzZWQgPSBuZDtcclxuXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2dldEZvY3VzZWREYXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBmb2N1c2VkICA9IHRoaXMuZm9jdXNlZCB8fCB0aGlzLnNlbGVjdGVkRGF0ZXNbdGhpcy5zZWxlY3RlZERhdGVzLmxlbmd0aCAtIDFdLFxyXG4gICAgICAgICAgICAgICAgZCA9IHRoaXMucGFyc2VkRGF0ZTtcclxuXHJcbiAgICAgICAgICAgIGlmICghZm9jdXNlZCkge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnZpZXcpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdkYXlzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXNlZCA9IG5ldyBEYXRlKGQueWVhciwgZC5tb250aCwgbmV3IERhdGUoKS5nZXREYXRlKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdtb250aHMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2N1c2VkID0gbmV3IERhdGUoZC55ZWFyLCBkLm1vbnRoLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAneWVhcnMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2N1c2VkID0gbmV3IERhdGUoZC55ZWFyLCAwLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmb2N1c2VkO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9nZXRDZWxsOiBmdW5jdGlvbiAoZGF0ZSwgdHlwZSkge1xyXG4gICAgICAgICAgICB0eXBlID0gdHlwZSB8fCB0aGlzLmNlbGxUeXBlO1xyXG5cclxuICAgICAgICAgICAgdmFyIGQgPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUoZGF0ZSksXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RvciA9ICcuZGF0ZXBpY2tlci0tY2VsbFtkYXRhLXllYXI9XCInICsgZC55ZWFyICsgJ1wiXScsXHJcbiAgICAgICAgICAgICAgICAkY2VsbDtcclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbW9udGgnOlxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gJ1tkYXRhLW1vbnRoPVwiJyArIGQubW9udGggKyAnXCJdJztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2RheSc6XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IgKz0gJ1tkYXRhLW1vbnRoPVwiJyArIGQubW9udGggKyAnXCJdW2RhdGEtZGF0ZT1cIicgKyBkLmRhdGUgKyAnXCJdJztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkY2VsbCA9IHRoaXMudmlld3NbdGhpcy5jdXJyZW50Vmlld10uJGVsLmZpbmQoc2VsZWN0b3IpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICRjZWxsLmxlbmd0aCA/ICRjZWxsIDogJyc7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZGVzdHJveTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgICAgICBfdGhpcy4kZWxcclxuICAgICAgICAgICAgICAgIC5vZmYoJy5hZHAnKVxyXG4gICAgICAgICAgICAgICAgLmRhdGEoJ2RhdGVwaWNrZXInLCAnJyk7XHJcblxyXG4gICAgICAgICAgICBfdGhpcy5zZWxlY3RlZERhdGVzID0gW107XHJcbiAgICAgICAgICAgIF90aGlzLmZvY3VzZWQgPSAnJztcclxuICAgICAgICAgICAgX3RoaXMudmlld3MgPSB7fTtcclxuICAgICAgICAgICAgX3RoaXMua2V5cyA9IFtdO1xyXG4gICAgICAgICAgICBfdGhpcy5taW5SYW5nZSA9ICcnO1xyXG4gICAgICAgICAgICBfdGhpcy5tYXhSYW5nZSA9ICcnO1xyXG5cclxuICAgICAgICAgICAgaWYgKF90aGlzLm9wdHMuaW5saW5lIHx8ICFfdGhpcy5lbElzSW5wdXQpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLiRkYXRlcGlja2VyLmNsb3Nlc3QoJy5kYXRlcGlja2VyLWlubGluZScpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuJGRhdGVwaWNrZXIucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfb25TaG93RXZlbnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLnZpc2libGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX29uQmx1cjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuaW5Gb2N1cyAmJiB0aGlzLnZpc2libGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX29uTW91c2VEb3duRGF0ZXBpY2tlcjogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdGhpcy5pbkZvY3VzID0gdHJ1ZTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfb25Nb3VzZVVwRGF0ZXBpY2tlcjogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdGhpcy5pbkZvY3VzID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLmZvY3VzKClcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfb25JbnB1dDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdmFsID0gdGhpcy4kZWwudmFsKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXZhbCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX29uUmVzaXplOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnZpc2libGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb24oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9vbktleURvd246IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciBjb2RlID0gZS53aGljaDtcclxuICAgICAgICAgICAgdGhpcy5fcmVnaXN0ZXJLZXkoY29kZSk7XHJcblxyXG4gICAgICAgICAgICAvLyBBcnJvd3NcclxuICAgICAgICAgICAgaWYgKGNvZGUgPj0gMzcgJiYgY29kZSA8PSA0MCkge1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZm9jdXNOZXh0Q2VsbChjb2RlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRW50ZXJcclxuICAgICAgICAgICAgaWYgKGNvZGUgPT0gMTMpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZvY3VzZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fZ2V0Q2VsbCh0aGlzLmZvY3VzZWQpLmhhc0NsYXNzKCctZGlzYWJsZWQtJykpIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy52aWV3ICE9IHRoaXMub3B0cy5taW5WaWV3KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZG93bigpXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFscmVhZHlTZWxlY3RlZCA9IHRoaXMuX2lzU2VsZWN0ZWQodGhpcy5mb2N1c2VkLCB0aGlzLmNlbGxUeXBlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYWxyZWFkeVNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdERhdGUodGhpcy5mb2N1c2VkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhbHJlYWR5U2VsZWN0ZWQgJiYgdGhpcy5vcHRzLnRvZ2dsZVNlbGVjdGVkKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlRGF0ZSh0aGlzLmZvY3VzZWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBFc2NcclxuICAgICAgICAgICAgaWYgKGNvZGUgPT0gMjcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX29uS2V5VXA6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciBjb2RlID0gZS53aGljaDtcclxuICAgICAgICAgICAgdGhpcy5fdW5SZWdpc3RlcktleShjb2RlKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfb25Ib3RLZXk6IGZ1bmN0aW9uIChlLCBob3RLZXkpIHtcclxuICAgICAgICAgICAgdGhpcy5faGFuZGxlSG90S2V5KGhvdEtleSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX29uTW91c2VFbnRlckNlbGw6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciAkY2VsbCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5kYXRlcGlja2VyLS1jZWxsJyksXHJcbiAgICAgICAgICAgICAgICBkYXRlID0gdGhpcy5fZ2V0RGF0ZUZyb21DZWxsKCRjZWxsKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFByZXZlbnQgZnJvbSB1bm5lY2Vzc2FyeSByZW5kZXJpbmcgYW5kIHNldHRpbmcgbmV3IGN1cnJlbnREYXRlXHJcbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmZvY3VzZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZm9jdXNlZCA9ICcnXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICRjZWxsLmFkZENsYXNzKCctZm9jdXMtJyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmZvY3VzZWQgPSBkYXRlO1xyXG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5yYW5nZSAmJiB0aGlzLnNlbGVjdGVkRGF0ZXMubGVuZ3RoID09IDEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubWluUmFuZ2UgPSB0aGlzLnNlbGVjdGVkRGF0ZXNbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1heFJhbmdlID0gJyc7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZXBpY2tlci5sZXNzKHRoaXMubWluUmFuZ2UsIHRoaXMuZm9jdXNlZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1heFJhbmdlID0gdGhpcy5taW5SYW5nZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1pblJhbmdlID0gJyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdzW3RoaXMuY3VycmVudFZpZXddLl91cGRhdGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9vbk1vdXNlTGVhdmVDZWxsOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB2YXIgJGNlbGwgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcuZGF0ZXBpY2tlci0tY2VsbCcpO1xyXG5cclxuICAgICAgICAgICAgJGNlbGwucmVtb3ZlQ2xhc3MoJy1mb2N1cy0nKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5mb2N1c2VkID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2V0IGZvY3VzZWQodmFsKSB7XHJcbiAgICAgICAgICAgIGlmICghdmFsICYmIHRoaXMuZm9jdXNlZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyICRjZWxsID0gdGhpcy5fZ2V0Q2VsbCh0aGlzLmZvY3VzZWQpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICgkY2VsbC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkY2VsbC5yZW1vdmVDbGFzcygnLWZvY3VzLScpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fZm9jdXNlZCA9IHZhbDtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5yYW5nZSAmJiB0aGlzLnNlbGVjdGVkRGF0ZXMubGVuZ3RoID09IDEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubWluUmFuZ2UgPSB0aGlzLnNlbGVjdGVkRGF0ZXNbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1heFJhbmdlID0gJyc7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZXBpY2tlci5sZXNzKHRoaXMubWluUmFuZ2UsIHRoaXMuX2ZvY3VzZWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXhSYW5nZSA9IHRoaXMubWluUmFuZ2U7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5taW5SYW5nZSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNpbGVudCkgcmV0dXJuO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUgPSB2YWw7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZ2V0IGZvY3VzZWQoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9mb2N1c2VkO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGdldCBwYXJzZWREYXRlKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKHRoaXMuZGF0ZSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2V0IGRhdGUgKHZhbCkge1xyXG4gICAgICAgICAgICBpZiAoISh2YWwgaW5zdGFuY2VvZiBEYXRlKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50RGF0ZSA9IHZhbDtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmluaXRlZCAmJiAhdGhpcy5zaWxlbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudmlld3NbdGhpcy52aWV3XS5fcmVuZGVyKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5hdi5fcmVuZGVyKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy52aXNpYmxlICYmIHRoaXMuZWxJc0lucHV0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRQb3NpdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB2YWw7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZ2V0IGRhdGUgKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50RGF0ZVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNldCB2aWV3ICh2YWwpIHtcclxuICAgICAgICAgICAgdGhpcy52aWV3SW5kZXggPSB0aGlzLnZpZXdJbmRleGVzLmluZGV4T2YodmFsKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnZpZXdJbmRleCA8IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5wcmV2VmlldyA9IHRoaXMuY3VycmVudFZpZXc7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFZpZXcgPSB2YWw7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5pbml0ZWQpIHtcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy52aWV3c1t2YWxdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3c1t2YWxdID0gbmV3IERhdGVwaWNrZXIuQm9keSh0aGlzLCB2YWwsIHRoaXMub3B0cylcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3c1t2YWxdLl9yZW5kZXIoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdzW3RoaXMucHJldlZpZXddLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudmlld3NbdmFsXS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5hdi5fcmVuZGVyKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5vbkNoYW5nZVZpZXcpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdHMub25DaGFuZ2VWaWV3KHZhbClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmVsSXNJbnB1dCAmJiB0aGlzLnZpc2libGUpIHRoaXMuc2V0UG9zaXRpb24oKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHZhbFxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGdldCB2aWV3KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50VmlldztcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBnZXQgY2VsbFR5cGUoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZpZXcuc3Vic3RyaW5nKDAsIHRoaXMudmlldy5sZW5ndGggLSAxKVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGdldCBtaW5UaW1lKCkge1xyXG4gICAgICAgICAgICB2YXIgbWluID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKHRoaXMubWluRGF0ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZShtaW4ueWVhciwgbWluLm1vbnRoLCBtaW4uZGF0ZSkuZ2V0VGltZSgpXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZ2V0IG1heFRpbWUoKSB7XHJcbiAgICAgICAgICAgIHZhciBtYXggPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUodGhpcy5tYXhEYXRlKTtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKG1heC55ZWFyLCBtYXgubW9udGgsIG1heC5kYXRlKS5nZXRUaW1lKClcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBnZXQgY3VyRGVjYWRlKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZGF0ZXBpY2tlci5nZXREZWNhZGUodGhpcy5kYXRlKVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gIFV0aWxzXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgZGF0ZXBpY2tlci5nZXREYXlzQ291bnQgPSBmdW5jdGlvbiAoZGF0ZSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSArIDEsIDApLmdldERhdGUoKTtcclxuICAgIH07XHJcblxyXG4gICAgZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlID0gZnVuY3Rpb24gKGRhdGUpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB5ZWFyOiBkYXRlLmdldEZ1bGxZZWFyKCksXHJcbiAgICAgICAgICAgIG1vbnRoOiBkYXRlLmdldE1vbnRoKCksXHJcbiAgICAgICAgICAgIGZ1bGxNb250aDogKGRhdGUuZ2V0TW9udGgoKSArIDEpIDwgMTAgPyAnMCcgKyAoZGF0ZS5nZXRNb250aCgpICsgMSkgOiBkYXRlLmdldE1vbnRoKCkgKyAxLCAvLyBPbmUgYmFzZWRcclxuICAgICAgICAgICAgZGF0ZTogZGF0ZS5nZXREYXRlKCksXHJcbiAgICAgICAgICAgIGZ1bGxEYXRlOiBkYXRlLmdldERhdGUoKSA8IDEwID8gJzAnICsgZGF0ZS5nZXREYXRlKCkgOiBkYXRlLmdldERhdGUoKSxcclxuICAgICAgICAgICAgZGF5OiBkYXRlLmdldERheSgpXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBkYXRlcGlja2VyLmdldERlY2FkZSA9IGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgdmFyIGZpcnN0WWVhciA9IE1hdGguZmxvb3IoZGF0ZS5nZXRGdWxsWWVhcigpIC8gMTApICogMTA7XHJcblxyXG4gICAgICAgIHJldHVybiBbZmlyc3RZZWFyLCBmaXJzdFllYXIgKyA5XTtcclxuICAgIH07XHJcblxyXG4gICAgZGF0ZXBpY2tlci50ZW1wbGF0ZSA9IGZ1bmN0aW9uIChzdHIsIGRhdGEpIHtcclxuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UoLyNcXHsoW1xcd10rKVxcfS9nLCBmdW5jdGlvbiAoc291cmNlLCBtYXRjaCkge1xyXG4gICAgICAgICAgICBpZiAoZGF0YVttYXRjaF0gfHwgZGF0YVttYXRjaF0gPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhW21hdGNoXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGRhdGVwaWNrZXIuaXNTYW1lID0gZnVuY3Rpb24gKGRhdGUxLCBkYXRlMiwgdHlwZSkge1xyXG4gICAgICAgIGlmICghZGF0ZTEgfHwgIWRhdGUyKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgdmFyIGQxID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKGRhdGUxKSxcclxuICAgICAgICAgICAgZDIgPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUoZGF0ZTIpLFxyXG4gICAgICAgICAgICBfdHlwZSA9IHR5cGUgPyB0eXBlIDogJ2RheScsXHJcblxyXG4gICAgICAgICAgICBjb25kaXRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgZGF5OiBkMS5kYXRlID09IGQyLmRhdGUgJiYgZDEubW9udGggPT0gZDIubW9udGggJiYgZDEueWVhciA9PSBkMi55ZWFyLFxyXG4gICAgICAgICAgICAgICAgbW9udGg6IGQxLm1vbnRoID09IGQyLm1vbnRoICYmIGQxLnllYXIgPT0gZDIueWVhcixcclxuICAgICAgICAgICAgICAgIHllYXI6IGQxLnllYXIgPT0gZDIueWVhclxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4gY29uZGl0aW9uc1tfdHlwZV07XHJcbiAgICB9O1xyXG5cclxuICAgIGRhdGVwaWNrZXIubGVzcyA9IGZ1bmN0aW9uIChkYXRlQ29tcGFyZVRvLCBkYXRlLCB0eXBlKSB7XHJcbiAgICAgICAgaWYgKCFkYXRlQ29tcGFyZVRvIHx8ICFkYXRlKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIGRhdGUuZ2V0VGltZSgpIDwgZGF0ZUNvbXBhcmVUby5nZXRUaW1lKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGRhdGVwaWNrZXIuYmlnZ2VyID0gZnVuY3Rpb24gKGRhdGVDb21wYXJlVG8sIGRhdGUsIHR5cGUpIHtcclxuICAgICAgICBpZiAoIWRhdGVDb21wYXJlVG8gfHwgIWRhdGUpIHJldHVybiBmYWxzZTtcclxuICAgICAgICByZXR1cm4gZGF0ZS5nZXRUaW1lKCkgPiBkYXRlQ29tcGFyZVRvLmdldFRpbWUoKTtcclxuICAgIH07XHJcblxyXG4gICAgRGF0ZXBpY2tlci5sYW5ndWFnZSA9IHtcclxuICAgICAgICBydToge1xyXG4gICAgICAgICAgICBkYXlzOiBbJ9CS0L7RgdC60YDQtdGB0LXQvdGM0LUnLCAn0J/QvtC90LXQtNC10LvRjNC90LjQuicsICfQktGC0L7RgNC90LjQuicsICfQodGA0LXQtNCwJywgJ9Cn0LXRgtCy0LXRgNCzJywgJ9Cf0Y/RgtC90LjRhtCwJywgJ9Ch0YPQsdCx0L7RgtCwJ10sXHJcbiAgICAgICAgICAgIGRheXNTaG9ydDogWyfQktC+0YEnLCfQn9C+0L0nLCfQktGC0L4nLCfQodGA0LUnLCfQp9C10YInLCfQn9GP0YInLCfQodGD0LEnXSxcclxuICAgICAgICAgICAgZGF5c01pbjogWyfQktGBJywn0J/QvScsJ9CS0YInLCfQodGAJywn0KfRgicsJ9Cf0YInLCfQodCxJ10sXHJcbiAgICAgICAgICAgIG1vbnRoczogWyfQr9C90LLQsNGA0YwnLCAn0KTQtdCy0YDQsNC70YwnLCAn0JzQsNGA0YInLCAn0JDQv9GA0LXQu9GMJywgJ9Cc0LDQuScsICfQmNGO0L3RjCcsICfQmNGO0LvRjCcsICfQkNCy0LPRg9GB0YInLCAn0KHQtdC90YLRj9Cx0YDRjCcsICfQntC60YLRj9Cx0YDRjCcsICfQndC+0Y/QsdGA0YwnLCAn0JTQtdC60LDQsdGA0YwnXSxcclxuICAgICAgICAgICAgbW9udGhzU2hvcnQ6IFsn0K/QvdCyJywgJ9Ck0LXQsicsICfQnNCw0YAnLCAn0JDQv9GAJywgJ9Cc0LDQuScsICfQmNGO0L0nLCAn0JjRjtC7JywgJ9CQ0LLQsycsICfQodC10L0nLCAn0J7QutGCJywgJ9Cd0L7RjycsICfQlNC10LonXSxcclxuICAgICAgICAgICAgdG9kYXk6ICfQodC10LPQvtC00L3RjycsXHJcbiAgICAgICAgICAgIGNsZWFyOiAn0J7Rh9C40YHRgtC40YLRjCcsXHJcbiAgICAgICAgICAgIGRhdGVGb3JtYXQ6ICdkZC5tbS55eXl5JyxcclxuICAgICAgICAgICAgZmlyc3REYXk6IDFcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgICQuZm5bcGx1Z2luTmFtZV0gPSBmdW5jdGlvbiAoIG9wdGlvbnMgKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghJC5kYXRhKHRoaXMsIHBsdWdpbk5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAkLmRhdGEodGhpcywgIHBsdWdpbk5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IERhdGVwaWNrZXIoIHRoaXMsIG9wdGlvbnMgKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSAkLmRhdGEodGhpcywgcGx1Z2luTmFtZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgX3RoaXMub3B0cyA9ICQuZXh0ZW5kKHRydWUsIF90aGlzLm9wdHMsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgJChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJChhdXRvSW5pdFNlbGVjdG9yKS5kYXRlcGlja2VyKCk7XHJcbiAgICB9KVxyXG5cclxufSkod2luZG93LCBqUXVlcnkpO1xyXG47KGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciB0ZW1wbGF0ZXMgPSB7XHJcbiAgICAgICAgZGF5czonJyArXHJcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1kYXlzIGRhdGVwaWNrZXItLWJvZHlcIj4nICtcclxuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLWRheXMtbmFtZXNcIj48L2Rpdj4nICtcclxuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLWNlbGxzIGRhdGVwaWNrZXItLWNlbGxzLWRheXNcIj48L2Rpdj4nICtcclxuICAgICAgICAnPC9kaXY+JyxcclxuICAgICAgICBtb250aHM6ICcnICtcclxuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLW1vbnRocyBkYXRlcGlja2VyLS1ib2R5XCI+JyArXHJcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1jZWxscyBkYXRlcGlja2VyLS1jZWxscy1tb250aHNcIj48L2Rpdj4nICtcclxuICAgICAgICAnPC9kaXY+JyxcclxuICAgICAgICB5ZWFyczogJycgK1xyXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0teWVhcnMgZGF0ZXBpY2tlci0tYm9keVwiPicgK1xyXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tY2VsbHMgZGF0ZXBpY2tlci0tY2VsbHMteWVhcnNcIj48L2Rpdj4nICtcclxuICAgICAgICAnPC9kaXY+J1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgRCA9IERhdGVwaWNrZXI7XHJcblxyXG4gICAgRC5Cb2R5ID0gZnVuY3Rpb24gKGQsIHR5cGUsIG9wdHMpIHtcclxuICAgICAgICB0aGlzLmQgPSBkO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XHJcbiAgICAgICAgdGhpcy5vcHRzID0gb3B0cztcclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICB9O1xyXG5cclxuICAgIEQuQm9keS5wcm90b3R5cGUgPSB7XHJcbiAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9idWlsZEJhc2VIdG1sKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcigpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fYmluZEV2ZW50cygpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9iaW5kRXZlbnRzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLm9uKCdjbGljaycsICcuZGF0ZXBpY2tlci0tY2VsbCcsICQucHJveHkodGhpcy5fb25DbGlja0NlbGwsIHRoaXMpKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfYnVpbGRCYXNlSHRtbDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRlbCA9ICQodGVtcGxhdGVzW3RoaXMudHlwZV0pLmFwcGVuZFRvKHRoaXMuZC4kY29udGVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuJG5hbWVzID0gJCgnLmRhdGVwaWNrZXItLWRheXMtbmFtZXMnLCB0aGlzLiRlbCk7XHJcbiAgICAgICAgICAgIHRoaXMuJGNlbGxzID0gJCgnLmRhdGVwaWNrZXItLWNlbGxzJywgdGhpcy4kZWwpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9nZXREYXlOYW1lc0h0bWw6IGZ1bmN0aW9uIChmaXJzdERheSwgY3VyRGF5LCBodG1sLCBpKSB7XHJcbiAgICAgICAgICAgIGN1ckRheSA9IGN1ckRheSAhPSB1bmRlZmluZWQgPyBjdXJEYXkgOiBmaXJzdERheTtcclxuICAgICAgICAgICAgaHRtbCA9IGh0bWwgPyBodG1sIDogJyc7XHJcbiAgICAgICAgICAgIGkgPSBpICE9IHVuZGVmaW5lZCA/IGkgOiAwO1xyXG5cclxuICAgICAgICAgICAgaWYgKGkgPiA3KSByZXR1cm4gaHRtbDtcclxuICAgICAgICAgICAgaWYgKGN1ckRheSA9PSA3KSByZXR1cm4gdGhpcy5fZ2V0RGF5TmFtZXNIdG1sKGZpcnN0RGF5LCAwLCBodG1sLCArK2kpO1xyXG5cclxuICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLWRheS1uYW1lJyArICh0aGlzLmQuaXNXZWVrZW5kKGN1ckRheSkgPyBcIiAtd2Vla2VuZC1cIiA6IFwiXCIpICsgJ1wiPicgKyB0aGlzLmQubG9jLmRheXNNaW5bY3VyRGF5XSArICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dldERheU5hbWVzSHRtbChmaXJzdERheSwgKytjdXJEYXksIGh0bWwsICsraSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2dldENlbGxDb250ZW50czogZnVuY3Rpb24gKGRhdGUsIHR5cGUpIHtcclxuICAgICAgICAgICAgdmFyIGNsYXNzZXMgPSBcImRhdGVwaWNrZXItLWNlbGwgZGF0ZXBpY2tlci0tY2VsbC1cIiArIHR5cGUsXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RGF0ZSA9IG5ldyBEYXRlKCksXHJcbiAgICAgICAgICAgICAgICBwYXJlbnQgPSB0aGlzLmQsXHJcbiAgICAgICAgICAgICAgICBvcHRzID0gcGFyZW50Lm9wdHMsXHJcbiAgICAgICAgICAgICAgICBkID0gRC5nZXRQYXJzZWREYXRlKGRhdGUpLFxyXG4gICAgICAgICAgICAgICAgcmVuZGVyID0ge30sXHJcbiAgICAgICAgICAgICAgICBodG1sID0gZC5kYXRlO1xyXG5cclxuICAgICAgICAgICAgaWYgKG9wdHMub25SZW5kZXJDZWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZW5kZXIgPSBvcHRzLm9uUmVuZGVyQ2VsbChkYXRlLCB0eXBlKSB8fCB7fTtcclxuICAgICAgICAgICAgICAgIGh0bWwgPSByZW5kZXIuaHRtbCA/IHJlbmRlci5odG1sIDogaHRtbDtcclxuICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gcmVuZGVyLmNsYXNzZXMgPyAnICcgKyByZW5kZXIuY2xhc3NlcyA6ICcnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2RheSc6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmVudC5pc1dlZWtlbmQoZC5kYXkpKSBjbGFzc2VzICs9IFwiIC13ZWVrZW5kLVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkLm1vbnRoICE9IHRoaXMuZC5wYXJzZWREYXRlLm1vbnRoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gXCIgLW90aGVyLW1vbnRoLVwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW9wdHMuc2VsZWN0T3RoZXJNb250aHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gXCIgLWRpc2FibGVkLVwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghb3B0cy5zaG93T3RoZXJNb250aHMpIGh0bWwgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdtb250aCc6XHJcbiAgICAgICAgICAgICAgICAgICAgaHRtbCA9IHBhcmVudC5sb2NbcGFyZW50Lm9wdHMubW9udGhzRmllbGRdW2QubW9udGhdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAneWVhcic6XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRlY2FkZSA9IHBhcmVudC5jdXJEZWNhZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgaHRtbCA9IGQueWVhcjtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZC55ZWFyIDwgZGVjYWRlWzBdIHx8IGQueWVhciA+IGRlY2FkZVsxXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzICs9ICcgLW90aGVyLWRlY2FkZS0nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW9wdHMuc2VsZWN0T3RoZXJZZWFycykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NlcyArPSBcIiAtZGlzYWJsZWQtXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFvcHRzLnNob3dPdGhlclllYXJzKSBodG1sID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAob3B0cy5vblJlbmRlckNlbGwpIHtcclxuICAgICAgICAgICAgICAgIHJlbmRlciA9IG9wdHMub25SZW5kZXJDZWxsKGRhdGUsIHR5cGUpIHx8IHt9O1xyXG4gICAgICAgICAgICAgICAgaHRtbCA9IHJlbmRlci5odG1sID8gcmVuZGVyLmh0bWwgOiBodG1sO1xyXG4gICAgICAgICAgICAgICAgY2xhc3NlcyArPSByZW5kZXIuY2xhc3NlcyA/ICcgJyArIHJlbmRlci5jbGFzc2VzIDogJyc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChvcHRzLnJhbmdlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoRC5pc1NhbWUocGFyZW50Lm1pblJhbmdlLCBkYXRlLCB0eXBlKSkgY2xhc3NlcyArPSAnIC1yYW5nZS1mcm9tLSc7XHJcbiAgICAgICAgICAgICAgICBpZiAoRC5pc1NhbWUocGFyZW50Lm1heFJhbmdlLCBkYXRlLCB0eXBlKSkgY2xhc3NlcyArPSAnIC1yYW5nZS10by0nO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwYXJlbnQuc2VsZWN0ZWREYXRlcy5sZW5ndGggPT0gMSAmJiBwYXJlbnQuZm9jdXNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgKEQuYmlnZ2VyKHBhcmVudC5taW5SYW5nZSwgZGF0ZSkgJiYgRC5sZXNzKHBhcmVudC5mb2N1c2VkLCBkYXRlKSkgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgKEQubGVzcyhwYXJlbnQubWF4UmFuZ2UsIGRhdGUpICYmIEQuYmlnZ2VyKHBhcmVudC5mb2N1c2VkLCBkYXRlKSkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzICs9ICcgLWluLXJhbmdlLSdcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChELmxlc3MocGFyZW50Lm1heFJhbmdlLCBkYXRlKSAmJiBELmlzU2FtZShwYXJlbnQuZm9jdXNlZCwgZGF0ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NlcyArPSAnIC1yYW5nZS1mcm9tLSdcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKEQuYmlnZ2VyKHBhcmVudC5taW5SYW5nZSwgZGF0ZSkgJiYgRC5pc1NhbWUocGFyZW50LmZvY3VzZWQsIGRhdGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gJyAtcmFuZ2UtdG8tJ1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhcmVudC5zZWxlY3RlZERhdGVzLmxlbmd0aCA9PSAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKEQuYmlnZ2VyKHBhcmVudC5taW5SYW5nZSwgZGF0ZSkgJiYgRC5sZXNzKHBhcmVudC5tYXhSYW5nZSwgZGF0ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NlcyArPSAnIC1pbi1yYW5nZS0nXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKEQuaXNTYW1lKGN1cnJlbnREYXRlLCBkYXRlLCB0eXBlKSkgY2xhc3NlcyArPSAnIC1jdXJyZW50LSc7XHJcbiAgICAgICAgICAgIGlmIChwYXJlbnQuZm9jdXNlZCAmJiBELmlzU2FtZShkYXRlLCBwYXJlbnQuZm9jdXNlZCwgdHlwZSkpIGNsYXNzZXMgKz0gJyAtZm9jdXMtJztcclxuICAgICAgICAgICAgaWYgKHBhcmVudC5faXNTZWxlY3RlZChkYXRlLCB0eXBlKSkgY2xhc3NlcyArPSAnIC1zZWxlY3RlZC0nO1xyXG4gICAgICAgICAgICBpZiAoIXBhcmVudC5faXNJblJhbmdlKGRhdGUsIHR5cGUpIHx8IHJlbmRlci5kaXNhYmxlZCkgY2xhc3NlcyArPSAnIC1kaXNhYmxlZC0nO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGh0bWw6IGh0bWwsXHJcbiAgICAgICAgICAgICAgICBjbGFzc2VzOiBjbGFzc2VzXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDYWxjdWxhdGVzIGRheXMgbnVtYmVyIHRvIHJlbmRlci4gR2VuZXJhdGVzIGRheXMgaHRtbCBhbmQgcmV0dXJucyBpdC5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gZGF0ZSAtIERhdGUgb2JqZWN0XHJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIF9nZXREYXlzSHRtbDogZnVuY3Rpb24gKGRhdGUpIHtcclxuICAgICAgICAgICAgdmFyIHRvdGFsTW9udGhEYXlzID0gRC5nZXREYXlzQ291bnQoZGF0ZSksXHJcbiAgICAgICAgICAgICAgICBmaXJzdE1vbnRoRGF5ID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIDEpLmdldERheSgpLFxyXG4gICAgICAgICAgICAgICAgbGFzdE1vbnRoRGF5ID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIHRvdGFsTW9udGhEYXlzKS5nZXREYXkoKSxcclxuICAgICAgICAgICAgICAgIGRheXNGcm9tUGV2TW9udGggPSBmaXJzdE1vbnRoRGF5IC0gdGhpcy5kLmxvYy5maXJzdERheSxcclxuICAgICAgICAgICAgICAgIGRheXNGcm9tTmV4dE1vbnRoID0gNiAtIGxhc3RNb250aERheSArIHRoaXMuZC5sb2MuZmlyc3REYXk7XHJcblxyXG4gICAgICAgICAgICBkYXlzRnJvbVBldk1vbnRoID0gZGF5c0Zyb21QZXZNb250aCA8IDAgPyBkYXlzRnJvbVBldk1vbnRoICsgNyA6IGRheXNGcm9tUGV2TW9udGg7XHJcbiAgICAgICAgICAgIGRheXNGcm9tTmV4dE1vbnRoID0gZGF5c0Zyb21OZXh0TW9udGggPiA2ID8gZGF5c0Zyb21OZXh0TW9udGggLSA3IDogZGF5c0Zyb21OZXh0TW9udGg7XHJcblxyXG4gICAgICAgICAgICB2YXIgc3RhcnREYXlJbmRleCA9IC1kYXlzRnJvbVBldk1vbnRoICsgMSxcclxuICAgICAgICAgICAgICAgIG0sIHksXHJcbiAgICAgICAgICAgICAgICBodG1sID0gJyc7XHJcblxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gc3RhcnREYXlJbmRleCwgbWF4ID0gdG90YWxNb250aERheXMgKyBkYXlzRnJvbU5leHRNb250aDsgaSA8PSBtYXg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgeSA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcclxuICAgICAgICAgICAgICAgIG0gPSBkYXRlLmdldE1vbnRoKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaHRtbCArPSB0aGlzLl9nZXREYXlIdG1sKG5ldyBEYXRlKHksIG0sIGkpKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gaHRtbDtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfZ2V0RGF5SHRtbDogZnVuY3Rpb24gKGRhdGUpIHtcclxuICAgICAgICAgICB2YXIgY29udGVudCA9IHRoaXMuX2dldENlbGxDb250ZW50cyhkYXRlLCAnZGF5Jyk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCInICsgY29udGVudC5jbGFzc2VzICsgJ1wiICcgK1xyXG4gICAgICAgICAgICAgICAgJ2RhdGEtZGF0ZT1cIicgKyBkYXRlLmdldERhdGUoKSArICdcIiAnICtcclxuICAgICAgICAgICAgICAgICdkYXRhLW1vbnRoPVwiJyArIGRhdGUuZ2V0TW9udGgoKSArICdcIiAnICtcclxuICAgICAgICAgICAgICAgICdkYXRhLXllYXI9XCInICsgZGF0ZS5nZXRGdWxsWWVhcigpICsgJ1wiPicgKyBjb250ZW50Lmh0bWwgKyAnPC9kaXY+JztcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHZW5lcmF0ZXMgbW9udGhzIGh0bWxcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gZGF0ZSAtIGRhdGUgaW5zdGFuY2VcclxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgX2dldE1vbnRoc0h0bWw6IGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgICAgIHZhciBodG1sID0gJycsXHJcbiAgICAgICAgICAgICAgICBkID0gRC5nZXRQYXJzZWREYXRlKGRhdGUpLFxyXG4gICAgICAgICAgICAgICAgaSA9IDA7XHJcblxyXG4gICAgICAgICAgICB3aGlsZShpIDwgMTIpIHtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gdGhpcy5fZ2V0TW9udGhIdG1sKG5ldyBEYXRlKGQueWVhciwgaSkpO1xyXG4gICAgICAgICAgICAgICAgaSsrXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBodG1sO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9nZXRNb250aEh0bWw6IGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gdGhpcy5fZ2V0Q2VsbENvbnRlbnRzKGRhdGUsICdtb250aCcpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiJyArIGNvbnRlbnQuY2xhc3NlcyArICdcIiBkYXRhLW1vbnRoPVwiJyArIGRhdGUuZ2V0TW9udGgoKSArICdcIj4nICsgY29udGVudC5odG1sICsgJzwvZGl2PidcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfZ2V0WWVhcnNIdG1sOiBmdW5jdGlvbiAoZGF0ZSkge1xyXG4gICAgICAgICAgICB2YXIgZCA9IEQuZ2V0UGFyc2VkRGF0ZShkYXRlKSxcclxuICAgICAgICAgICAgICAgIGRlY2FkZSA9IEQuZ2V0RGVjYWRlKGRhdGUpLFxyXG4gICAgICAgICAgICAgICAgZmlyc3RZZWFyID0gZGVjYWRlWzBdIC0gMSxcclxuICAgICAgICAgICAgICAgIGh0bWwgPSAnJyxcclxuICAgICAgICAgICAgICAgIGkgPSBmaXJzdFllYXI7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGk7IGkgPD0gZGVjYWRlWzFdICsgMTsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IHRoaXMuX2dldFllYXJIdG1sKG5ldyBEYXRlKGkgLCAwKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBodG1sO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9nZXRZZWFySHRtbDogZnVuY3Rpb24gKGRhdGUpIHtcclxuICAgICAgICAgICAgdmFyIGNvbnRlbnQgPSB0aGlzLl9nZXRDZWxsQ29udGVudHMoZGF0ZSwgJ3llYXInKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cIicgKyBjb250ZW50LmNsYXNzZXMgKyAnXCIgZGF0YS15ZWFyPVwiJyArIGRhdGUuZ2V0RnVsbFllYXIoKSArICdcIj4nICsgY29udGVudC5odG1sICsgJzwvZGl2PidcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfcmVuZGVyVHlwZXM6IHtcclxuICAgICAgICAgICAgZGF5czogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRheU5hbWVzID0gdGhpcy5fZ2V0RGF5TmFtZXNIdG1sKHRoaXMuZC5sb2MuZmlyc3REYXkpLFxyXG4gICAgICAgICAgICAgICAgICAgIGRheXMgPSB0aGlzLl9nZXREYXlzSHRtbCh0aGlzLmQuY3VycmVudERhdGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuJGNlbGxzLmh0bWwoZGF5cyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRuYW1lcy5odG1sKGRheU5hbWVzKVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBtb250aHM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBodG1sID0gdGhpcy5fZ2V0TW9udGhzSHRtbCh0aGlzLmQuY3VycmVudERhdGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuJGNlbGxzLmh0bWwoaHRtbClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgeWVhcnM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBodG1sID0gdGhpcy5fZ2V0WWVhcnNIdG1sKHRoaXMuZC5jdXJyZW50RGF0ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy4kY2VsbHMuaHRtbChodG1sKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX3JlbmRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJUeXBlc1t0aGlzLnR5cGVdLmJpbmQodGhpcykoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfdXBkYXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciAkY2VsbHMgPSAkKCcuZGF0ZXBpY2tlci0tY2VsbCcsIHRoaXMuJGNlbGxzKSxcclxuICAgICAgICAgICAgICAgIF90aGlzID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIGNsYXNzZXMsXHJcbiAgICAgICAgICAgICAgICAkY2VsbCxcclxuICAgICAgICAgICAgICAgIGRhdGU7XHJcbiAgICAgICAgICAgICRjZWxscy5lYWNoKGZ1bmN0aW9uIChjZWxsLCBpKSB7XHJcbiAgICAgICAgICAgICAgICAkY2VsbCA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgICAgICBkYXRlID0gX3RoaXMuZC5fZ2V0RGF0ZUZyb21DZWxsKCQodGhpcykpO1xyXG4gICAgICAgICAgICAgICAgY2xhc3NlcyA9IF90aGlzLl9nZXRDZWxsQ29udGVudHMoZGF0ZSwgX3RoaXMuZC5jZWxsVHlwZSk7XHJcbiAgICAgICAgICAgICAgICAkY2VsbC5hdHRyKCdjbGFzcycsY2xhc3Nlcy5jbGFzc2VzKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzaG93OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgdGhpcy5hY2l0dmUgPSB0cnVlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGhpZGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy4kZWwucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIC8vICBFdmVudHNcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgIF9oYW5kbGVDbGljazogZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRlID0gZWwuZGF0YSgnZGF0ZScpIHx8IDEsXHJcbiAgICAgICAgICAgICAgICBtb250aCA9IGVsLmRhdGEoJ21vbnRoJykgfHwgMCxcclxuICAgICAgICAgICAgICAgIHllYXIgPSBlbC5kYXRhKCd5ZWFyJykgfHwgdGhpcy5kLnBhcnNlZERhdGUueWVhcjtcclxuICAgICAgICAgICAgLy8gQ2hhbmdlIHZpZXcgaWYgbWluIHZpZXcgZG9lcyBub3QgcmVhY2ggeWV0XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmQudmlldyAhPSB0aGlzLm9wdHMubWluVmlldykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kLmRvd24obmV3IERhdGUoeWVhciwgbW9udGgsIGRhdGUpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBTZWxlY3QgZGF0ZSBpZiBtaW4gdmlldyBpcyByZWFjaGVkXHJcbiAgICAgICAgICAgIHZhciBzZWxlY3RlZERhdGUgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgZGF0ZSksXHJcbiAgICAgICAgICAgICAgICBhbHJlYWR5U2VsZWN0ZWQgPSB0aGlzLmQuX2lzU2VsZWN0ZWQoc2VsZWN0ZWREYXRlLCB0aGlzLmQuY2VsbFR5cGUpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFhbHJlYWR5U2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZC5zZWxlY3REYXRlKHNlbGVjdGVkRGF0ZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWxyZWFkeVNlbGVjdGVkICYmIHRoaXMub3B0cy50b2dnbGVTZWxlY3RlZCl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmQucmVtb3ZlRGF0ZShzZWxlY3RlZERhdGUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9vbkNsaWNrQ2VsbDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdmFyICRlbCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5kYXRlcGlja2VyLS1jZWxsJyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoJGVsLmhhc0NsYXNzKCctZGlzYWJsZWQtJykpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZUNsaWNrLmJpbmQodGhpcykoJGVsKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KSgpO1xyXG5cclxuOyhmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgdGVtcGxhdGUgPSAnJyArXHJcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1uYXYtYWN0aW9uXCIgZGF0YS1hY3Rpb249XCJwcmV2XCI+I3twcmV2SHRtbH08L2Rpdj4nICtcclxuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLW5hdi10aXRsZVwiPiN7dGl0bGV9PC9kaXY+JyArXHJcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1uYXYtYWN0aW9uXCIgZGF0YS1hY3Rpb249XCJuZXh0XCI+I3tuZXh0SHRtbH08L2Rpdj4nLFxyXG4gICAgICAgIGJ1dHRvbnNDb250YWluZXJUZW1wbGF0ZSA9ICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tYnV0dG9uc1wiPjwvZGl2PicsXHJcbiAgICAgICAgYnV0dG9uID0gJzxzcGFuIGNsYXNzPVwiZGF0ZXBpY2tlci0tYnV0dG9uXCIgZGF0YS1hY3Rpb249XCIje2FjdGlvbn1cIj4je2xhYmVsfTwvc3Bhbj4nO1xyXG5cclxuICAgIERhdGVwaWNrZXIuTmF2aWdhdGlvbiA9IGZ1bmN0aW9uIChkLCBvcHRzKSB7XHJcbiAgICAgICAgdGhpcy5kID0gZDtcclxuICAgICAgICB0aGlzLm9wdHMgPSBvcHRzO1xyXG5cclxuICAgICAgICB0aGlzLiRidXR0b25zQ29udGFpbmVyID0gJyc7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfTtcclxuXHJcbiAgICBEYXRlcGlja2VyLk5hdmlnYXRpb24ucHJvdG90eXBlID0ge1xyXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5fYnVpbGRCYXNlSHRtbCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9iaW5kRXZlbnRzKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2JpbmRFdmVudHM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5kLiRuYXYub24oJ2NsaWNrJywgJy5kYXRlcGlja2VyLS1uYXYtYWN0aW9uJywgJC5wcm94eSh0aGlzLl9vbkNsaWNrTmF2QnV0dG9uLCB0aGlzKSk7XHJcbiAgICAgICAgICAgIHRoaXMuZC4kbmF2Lm9uKCdjbGljaycsICcuZGF0ZXBpY2tlci0tbmF2LXRpdGxlJywgJC5wcm94eSh0aGlzLl9vbkNsaWNrTmF2VGl0bGUsIHRoaXMpKTtcclxuICAgICAgICAgICAgdGhpcy5kLiRkYXRlcGlja2VyLm9uKCdjbGljaycsICcuZGF0ZXBpY2tlci0tYnV0dG9uJywgJC5wcm94eSh0aGlzLl9vbkNsaWNrTmF2QnV0dG9uLCB0aGlzKSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2J1aWxkQmFzZUh0bWw6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVuZGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2FkZEJ1dHRvbnNJZk5lZWQoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfYWRkQnV0dG9uc0lmTmVlZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLnRvZGF5QnV0dG9uKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRCdXR0b24oJ3RvZGF5JylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLmNsZWFyQnV0dG9uKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRCdXR0b24oJ2NsZWFyJylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9yZW5kZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRpdGxlID0gdGhpcy5fZ2V0VGl0bGUodGhpcy5kLmN1cnJlbnREYXRlKSxcclxuICAgICAgICAgICAgICAgIGh0bWwgPSBEYXRlcGlja2VyLnRlbXBsYXRlKHRlbXBsYXRlLCAkLmV4dGVuZCh7dGl0bGU6IHRpdGxlfSwgdGhpcy5vcHRzKSk7XHJcbiAgICAgICAgICAgIHRoaXMuZC4kbmF2Lmh0bWwoaHRtbCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmQudmlldyA9PSAneWVhcnMnKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuZGF0ZXBpY2tlci0tbmF2LXRpdGxlJywgdGhpcy5kLiRuYXYpLmFkZENsYXNzKCctZGlzYWJsZWQtJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5zZXROYXZTdGF0dXMoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfZ2V0VGl0bGU6IGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmQuZm9ybWF0RGF0ZSh0aGlzLm9wdHMubmF2VGl0bGVzW3RoaXMuZC52aWV3XSwgZGF0ZSlcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfYWRkQnV0dG9uOiBmdW5jdGlvbiAodHlwZSkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuJGJ1dHRvbnNDb250YWluZXIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRCdXR0b25zQ29udGFpbmVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogdHlwZSxcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogdGhpcy5kLmxvY1t0eXBlXVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGh0bWwgPSBEYXRlcGlja2VyLnRlbXBsYXRlKGJ1dHRvbiwgZGF0YSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoJCgnW2RhdGEtYWN0aW9uPScgKyB0eXBlICsgJ10nLCB0aGlzLiRidXR0b25zQ29udGFpbmVyKS5sZW5ndGgpIHJldHVybjtcclxuICAgICAgICAgICAgdGhpcy4kYnV0dG9uc0NvbnRhaW5lci5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2FkZEJ1dHRvbnNDb250YWluZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5kLiRkYXRlcGlja2VyLmFwcGVuZChidXR0b25zQ29udGFpbmVyVGVtcGxhdGUpO1xyXG4gICAgICAgICAgICB0aGlzLiRidXR0b25zQ29udGFpbmVyID0gJCgnLmRhdGVwaWNrZXItLWJ1dHRvbnMnLCB0aGlzLmQuJGRhdGVwaWNrZXIpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNldE5hdlN0YXR1czogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoISh0aGlzLm9wdHMubWluRGF0ZSB8fCB0aGlzLm9wdHMubWF4RGF0ZSkgfHwgIXRoaXMub3B0cy5kaXNhYmxlTmF2V2hlbk91dE9mUmFuZ2UpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHZhciBkYXRlID0gdGhpcy5kLnBhcnNlZERhdGUsXHJcbiAgICAgICAgICAgICAgICBtID0gZGF0ZS5tb250aCxcclxuICAgICAgICAgICAgICAgIHkgPSBkYXRlLnllYXIsXHJcbiAgICAgICAgICAgICAgICBkID0gZGF0ZS5kYXRlO1xyXG5cclxuICAgICAgICAgICAgc3dpdGNoICh0aGlzLmQudmlldykge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZGF5cyc6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmQuX2lzSW5SYW5nZShuZXcgRGF0ZSh5LCBtLTEsIGQpLCAnbW9udGgnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlTmF2KCdwcmV2JylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmQuX2lzSW5SYW5nZShuZXcgRGF0ZSh5LCBtKzEsIGQpLCAnbW9udGgnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlTmF2KCduZXh0JylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdtb250aHMnOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5kLl9pc0luUmFuZ2UobmV3IERhdGUoeS0xLCBtLCBkKSwgJ3llYXInKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlTmF2KCdwcmV2JylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmQuX2lzSW5SYW5nZShuZXcgRGF0ZSh5KzEsIG0sIGQpLCAneWVhcicpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVOYXYoJ25leHQnKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3llYXJzJzpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZC5faXNJblJhbmdlKG5ldyBEYXRlKHktMTAsIG0sIGQpLCAneWVhcicpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVOYXYoJ3ByZXYnKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZC5faXNJblJhbmdlKG5ldyBEYXRlKHkrMTAsIG0sIGQpLCAneWVhcicpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVOYXYoJ25leHQnKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9kaXNhYmxlTmF2OiBmdW5jdGlvbiAobmF2KSB7XHJcbiAgICAgICAgICAgICQoJ1tkYXRhLWFjdGlvbj1cIicgKyBuYXYgKyAnXCJdJywgdGhpcy5kLiRuYXYpLmFkZENsYXNzKCctZGlzYWJsZWQtJylcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfYWN0aXZhdGVOYXY6IGZ1bmN0aW9uIChuYXYpIHtcclxuICAgICAgICAgICAgJCgnW2RhdGEtYWN0aW9uPVwiJyArIG5hdiArICdcIl0nLCB0aGlzLmQuJG5hdikucmVtb3ZlQ2xhc3MoJy1kaXNhYmxlZC0nKVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9vbkNsaWNrTmF2QnV0dG9uOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB2YXIgJGVsID0gJChlLnRhcmdldCkuY2xvc2VzdCgnW2RhdGEtYWN0aW9uXScpLFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uID0gJGVsLmRhdGEoJ2FjdGlvbicpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5kW2FjdGlvbl0oKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfb25DbGlja05hdlRpdGxlOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBpZiAoJChlLnRhcmdldCkuaGFzQ2xhc3MoJy1kaXNhYmxlZC0nKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuZC52aWV3ID09ICdkYXlzJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZC52aWV3ID0gJ21vbnRocydcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5kLnZpZXcgPSAneWVhcnMnO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0pKCk7XHJcbiIsIiFmdW5jdGlvbihhLGIpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW1wianF1ZXJ5XCJdLGIpOlwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP21vZHVsZS5leHBvcnRzPWIocmVxdWlyZShcImpxdWVyeVwiKSk6YihhLmpRdWVyeSl9KHRoaXMsZnVuY3Rpb24oYSl7XCJmdW5jdGlvblwiIT10eXBlb2YgT2JqZWN0LmNyZWF0ZSYmKE9iamVjdC5jcmVhdGU9ZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYigpe31yZXR1cm4gYi5wcm90b3R5cGU9YSxuZXcgYn0pO3ZhciBiPXtpbml0OmZ1bmN0aW9uKGIpe3JldHVybiB0aGlzLm9wdGlvbnM9YS5leHRlbmQoe30sYS5ub3R5LmRlZmF1bHRzLGIpLHRoaXMub3B0aW9ucy5sYXlvdXQ9dGhpcy5vcHRpb25zLmN1c3RvbT9hLm5vdHkubGF5b3V0cy5pbmxpbmU6YS5ub3R5LmxheW91dHNbdGhpcy5vcHRpb25zLmxheW91dF0sYS5ub3R5LnRoZW1lc1t0aGlzLm9wdGlvbnMudGhlbWVdP3RoaXMub3B0aW9ucy50aGVtZT1hLm5vdHkudGhlbWVzW3RoaXMub3B0aW9ucy50aGVtZV06dGhpcy5vcHRpb25zLnRoZW1lQ2xhc3NOYW1lPXRoaXMub3B0aW9ucy50aGVtZSx0aGlzLm9wdGlvbnM9YS5leHRlbmQoe30sdGhpcy5vcHRpb25zLHRoaXMub3B0aW9ucy5sYXlvdXQub3B0aW9ucyksdGhpcy5vcHRpb25zLmlkPVwibm90eV9cIisobmV3IERhdGUpLmdldFRpbWUoKSpNYXRoLmZsb29yKDFlNipNYXRoLnJhbmRvbSgpKSx0aGlzLl9idWlsZCgpLHRoaXN9LF9idWlsZDpmdW5jdGlvbigpe3ZhciBiPWEoJzxkaXYgY2xhc3M9XCJub3R5X2JhciBub3R5X3R5cGVfJyt0aGlzLm9wdGlvbnMudHlwZSsnXCI+PC9kaXY+JykuYXR0cihcImlkXCIsdGhpcy5vcHRpb25zLmlkKTtpZihiLmFwcGVuZCh0aGlzLm9wdGlvbnMudGVtcGxhdGUpLmZpbmQoXCIubm90eV90ZXh0XCIpLmh0bWwodGhpcy5vcHRpb25zLnRleHQpLHRoaXMuJGJhcj1udWxsIT09dGhpcy5vcHRpb25zLmxheW91dC5wYXJlbnQub2JqZWN0P2EodGhpcy5vcHRpb25zLmxheW91dC5wYXJlbnQub2JqZWN0KS5jc3ModGhpcy5vcHRpb25zLmxheW91dC5wYXJlbnQuY3NzKS5hcHBlbmQoYik6Yix0aGlzLm9wdGlvbnMudGhlbWVDbGFzc05hbWUmJnRoaXMuJGJhci5hZGRDbGFzcyh0aGlzLm9wdGlvbnMudGhlbWVDbGFzc05hbWUpLmFkZENsYXNzKFwibm90eV9jb250YWluZXJfdHlwZV9cIit0aGlzLm9wdGlvbnMudHlwZSksdGhpcy5vcHRpb25zLmJ1dHRvbnMpe3RoaXMub3B0aW9ucy5jbG9zZVdpdGg9W10sdGhpcy5vcHRpb25zLnRpbWVvdXQ9ITE7dmFyIGM9YShcIjxkaXYvPlwiKS5hZGRDbGFzcyhcIm5vdHlfYnV0dG9uc1wiKTtudWxsIT09dGhpcy5vcHRpb25zLmxheW91dC5wYXJlbnQub2JqZWN0P3RoaXMuJGJhci5maW5kKFwiLm5vdHlfYmFyXCIpLmFwcGVuZChjKTp0aGlzLiRiYXIuYXBwZW5kKGMpO3ZhciBkPXRoaXM7YS5lYWNoKHRoaXMub3B0aW9ucy5idXR0b25zLGZ1bmN0aW9uKGIsYyl7dmFyIGU9YShcIjxidXR0b24vPlwiKS5hZGRDbGFzcyhjLmFkZENsYXNzP2MuYWRkQ2xhc3M6XCJncmF5XCIpLmh0bWwoYy50ZXh0KS5hdHRyKFwiaWRcIixjLmlkP2MuaWQ6XCJidXR0b24tXCIrYikuYXR0cihcInRpdGxlXCIsYy50aXRsZSkuYXBwZW5kVG8oZC4kYmFyLmZpbmQoXCIubm90eV9idXR0b25zXCIpKS5vbihcImNsaWNrXCIsZnVuY3Rpb24oYil7YS5pc0Z1bmN0aW9uKGMub25DbGljaykmJmMub25DbGljay5jYWxsKGUsZCxiKX0pfSl9dGhpcy4kbWVzc2FnZT10aGlzLiRiYXIuZmluZChcIi5ub3R5X21lc3NhZ2VcIiksdGhpcy4kY2xvc2VCdXR0b249dGhpcy4kYmFyLmZpbmQoXCIubm90eV9jbG9zZVwiKSx0aGlzLiRidXR0b25zPXRoaXMuJGJhci5maW5kKFwiLm5vdHlfYnV0dG9uc1wiKSxhLm5vdHkuc3RvcmVbdGhpcy5vcHRpb25zLmlkXT10aGlzfSxzaG93OmZ1bmN0aW9uKCl7dmFyIGI9dGhpcztyZXR1cm4gYi5vcHRpb25zLmN1c3RvbT9iLm9wdGlvbnMuY3VzdG9tLmZpbmQoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmFwcGVuZChiLiRiYXIpOmEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmFwcGVuZChiLiRiYXIpLGIub3B0aW9ucy50aGVtZSYmYi5vcHRpb25zLnRoZW1lLnN0eWxlJiZiLm9wdGlvbnMudGhlbWUuc3R5bGUuYXBwbHkoYiksXCJmdW5jdGlvblwiPT09YS50eXBlKGIub3B0aW9ucy5sYXlvdXQuY3NzKT90aGlzLm9wdGlvbnMubGF5b3V0LmNzcy5hcHBseShiLiRiYXIpOmIuJGJhci5jc3ModGhpcy5vcHRpb25zLmxheW91dC5jc3N8fHt9KSxiLiRiYXIuYWRkQ2xhc3MoYi5vcHRpb25zLmxheW91dC5hZGRDbGFzcyksYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc3R5bGUuYXBwbHkoYShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvciksW2Iub3B0aW9ucy53aXRoaW5dKSxiLnNob3dpbmc9ITAsYi5vcHRpb25zLnRoZW1lJiZiLm9wdGlvbnMudGhlbWUuc3R5bGUmJmIub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vblNob3cuYXBwbHkodGhpcyksYS5pbkFycmF5KFwiY2xpY2tcIixiLm9wdGlvbnMuY2xvc2VXaXRoKT4tMSYmYi4kYmFyLmNzcyhcImN1cnNvclwiLFwicG9pbnRlclwiKS5vbmUoXCJjbGlja1wiLGZ1bmN0aW9uKGEpe2Iuc3RvcFByb3BhZ2F0aW9uKGEpLGIub3B0aW9ucy5jYWxsYmFjay5vbkNsb3NlQ2xpY2smJmIub3B0aW9ucy5jYWxsYmFjay5vbkNsb3NlQ2xpY2suYXBwbHkoYiksYi5jbG9zZSgpfSksYS5pbkFycmF5KFwiaG92ZXJcIixiLm9wdGlvbnMuY2xvc2VXaXRoKT4tMSYmYi4kYmFyLm9uZShcIm1vdXNlZW50ZXJcIixmdW5jdGlvbigpe2IuY2xvc2UoKX0pLGEuaW5BcnJheShcImJ1dHRvblwiLGIub3B0aW9ucy5jbG9zZVdpdGgpPi0xJiZiLiRjbG9zZUJ1dHRvbi5vbmUoXCJjbGlja1wiLGZ1bmN0aW9uKGEpe2Iuc3RvcFByb3BhZ2F0aW9uKGEpLGIuY2xvc2UoKX0pLC0xPT1hLmluQXJyYXkoXCJidXR0b25cIixiLm9wdGlvbnMuY2xvc2VXaXRoKSYmYi4kY2xvc2VCdXR0b24ucmVtb3ZlKCksYi5vcHRpb25zLmNhbGxiYWNrLm9uU2hvdyYmYi5vcHRpb25zLmNhbGxiYWNrLm9uU2hvdy5hcHBseShiKSxcInN0cmluZ1wiPT10eXBlb2YgYi5vcHRpb25zLmFuaW1hdGlvbi5vcGVuPyhiLiRiYXIuY3NzKFwiaGVpZ2h0XCIsYi4kYmFyLmlubmVySGVpZ2h0KCkpLGIuJGJhci5vbihcImNsaWNrXCIsZnVuY3Rpb24oYSl7Yi53YXNDbGlja2VkPSEwfSksYi4kYmFyLnNob3coKS5hZGRDbGFzcyhiLm9wdGlvbnMuYW5pbWF0aW9uLm9wZW4pLm9uZShcIndlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmRcIixmdW5jdGlvbigpe2Iub3B0aW9ucy5jYWxsYmFjay5hZnRlclNob3cmJmIub3B0aW9ucy5jYWxsYmFjay5hZnRlclNob3cuYXBwbHkoYiksYi5zaG93aW5nPSExLGIuc2hvd249ITAsYi5oYXNPd25Qcm9wZXJ0eShcIndhc0NsaWNrZWRcIikmJihiLiRiYXIub2ZmKFwiY2xpY2tcIixmdW5jdGlvbihhKXtiLndhc0NsaWNrZWQ9ITB9KSxiLmNsb3NlKCkpfSkpOmIuJGJhci5hbmltYXRlKGIub3B0aW9ucy5hbmltYXRpb24ub3BlbixiLm9wdGlvbnMuYW5pbWF0aW9uLnNwZWVkLGIub3B0aW9ucy5hbmltYXRpb24uZWFzaW5nLGZ1bmN0aW9uKCl7Yi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyU2hvdyYmYi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyU2hvdy5hcHBseShiKSxiLnNob3dpbmc9ITEsYi5zaG93bj0hMH0pLGIub3B0aW9ucy50aW1lb3V0JiZiLiRiYXIuZGVsYXkoYi5vcHRpb25zLnRpbWVvdXQpLnByb21pc2UoKS5kb25lKGZ1bmN0aW9uKCl7Yi5jbG9zZSgpfSksdGhpc30sY2xvc2U6ZnVuY3Rpb24oKXtpZighKHRoaXMuY2xvc2VkfHx0aGlzLiRiYXImJnRoaXMuJGJhci5oYXNDbGFzcyhcImktYW0tY2xvc2luZy1ub3dcIikpKXt2YXIgYj10aGlzO2lmKHRoaXMuc2hvd2luZylyZXR1cm4gdm9pZCBiLiRiYXIucXVldWUoZnVuY3Rpb24oKXtiLmNsb3NlLmFwcGx5KGIpfSk7aWYoIXRoaXMuc2hvd24mJiF0aGlzLnNob3dpbmcpe3ZhciBjPVtdO3JldHVybiBhLmVhY2goYS5ub3R5LnF1ZXVlLGZ1bmN0aW9uKGEsZCl7ZC5vcHRpb25zLmlkIT1iLm9wdGlvbnMuaWQmJmMucHVzaChkKX0pLHZvaWQoYS5ub3R5LnF1ZXVlPWMpfWIuJGJhci5hZGRDbGFzcyhcImktYW0tY2xvc2luZy1ub3dcIiksYi5vcHRpb25zLmNhbGxiYWNrLm9uQ2xvc2UmJmIub3B0aW9ucy5jYWxsYmFjay5vbkNsb3NlLmFwcGx5KGIpLFwic3RyaW5nXCI9PXR5cGVvZiBiLm9wdGlvbnMuYW5pbWF0aW9uLmNsb3NlP2IuJGJhci5hZGRDbGFzcyhiLm9wdGlvbnMuYW5pbWF0aW9uLmNsb3NlKS5vbmUoXCJ3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kXCIsZnVuY3Rpb24oKXtiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJDbG9zZSYmYi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyQ2xvc2UuYXBwbHkoYiksYi5jbG9zZUNsZWFuVXAoKX0pOmIuJGJhci5jbGVhclF1ZXVlKCkuc3RvcCgpLmFuaW1hdGUoYi5vcHRpb25zLmFuaW1hdGlvbi5jbG9zZSxiLm9wdGlvbnMuYW5pbWF0aW9uLnNwZWVkLGIub3B0aW9ucy5hbmltYXRpb24uZWFzaW5nLGZ1bmN0aW9uKCl7Yi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyQ2xvc2UmJmIub3B0aW9ucy5jYWxsYmFjay5hZnRlckNsb3NlLmFwcGx5KGIpfSkucHJvbWlzZSgpLmRvbmUoZnVuY3Rpb24oKXtiLmNsb3NlQ2xlYW5VcCgpfSl9fSxjbG9zZUNsZWFuVXA6ZnVuY3Rpb24oKXt2YXIgYj10aGlzO2Iub3B0aW9ucy5tb2RhbCYmKGEubm90eVJlbmRlcmVyLnNldE1vZGFsQ291bnQoLTEpLDA9PWEubm90eVJlbmRlcmVyLmdldE1vZGFsQ291bnQoKSYmYShcIi5ub3R5X21vZGFsXCIpLmZhZGVPdXQoYi5vcHRpb25zLmFuaW1hdGlvbi5mYWRlU3BlZWQsZnVuY3Rpb24oKXthKHRoaXMpLnJlbW92ZSgpfSkpLGEubm90eVJlbmRlcmVyLnNldExheW91dENvdW50Rm9yKGIsLTEpLDA9PWEubm90eVJlbmRlcmVyLmdldExheW91dENvdW50Rm9yKGIpJiZhKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5yZW1vdmUoKSxcInVuZGVmaW5lZFwiIT10eXBlb2YgYi4kYmFyJiZudWxsIT09Yi4kYmFyJiYoXCJzdHJpbmdcIj09dHlwZW9mIGIub3B0aW9ucy5hbmltYXRpb24uY2xvc2U/KGIuJGJhci5jc3MoXCJ0cmFuc2l0aW9uXCIsXCJhbGwgMTAwbXMgZWFzZVwiKS5jc3MoXCJib3JkZXJcIiwwKS5jc3MoXCJtYXJnaW5cIiwwKS5oZWlnaHQoMCksYi4kYmFyLm9uZShcInRyYW5zaXRpb25lbmQgd2Via2l0VHJhbnNpdGlvbkVuZCBvVHJhbnNpdGlvbkVuZCBNU1RyYW5zaXRpb25FbmRcIixmdW5jdGlvbigpe2IuJGJhci5yZW1vdmUoKSxiLiRiYXI9bnVsbCxiLmNsb3NlZD0hMCxiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2smJmIub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vbkNsb3NlJiZiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2sub25DbG9zZS5hcHBseShiKX0pKTooYi4kYmFyLnJlbW92ZSgpLGIuJGJhcj1udWxsLGIuY2xvc2VkPSEwKSksZGVsZXRlIGEubm90eS5zdG9yZVtiLm9wdGlvbnMuaWRdLGIub3B0aW9ucy50aGVtZS5jYWxsYmFjayYmYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrLm9uQ2xvc2UmJmIub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vbkNsb3NlLmFwcGx5KGIpLGIub3B0aW9ucy5kaXNtaXNzUXVldWV8fChhLm5vdHkub250YXA9ITAsYS5ub3R5UmVuZGVyZXIucmVuZGVyKCkpLGIub3B0aW9ucy5tYXhWaXNpYmxlPjAmJmIub3B0aW9ucy5kaXNtaXNzUXVldWUmJmEubm90eVJlbmRlcmVyLnJlbmRlcigpfSxzZXRUZXh0OmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLmNsb3NlZHx8KHRoaXMub3B0aW9ucy50ZXh0PWEsdGhpcy4kYmFyLmZpbmQoXCIubm90eV90ZXh0XCIpLmh0bWwoYSkpLHRoaXN9LHNldFR5cGU6ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuY2xvc2VkfHwodGhpcy5vcHRpb25zLnR5cGU9YSx0aGlzLm9wdGlvbnMudGhlbWUuc3R5bGUuYXBwbHkodGhpcyksdGhpcy5vcHRpb25zLnRoZW1lLmNhbGxiYWNrLm9uU2hvdy5hcHBseSh0aGlzKSksdGhpc30sc2V0VGltZW91dDpmdW5jdGlvbihhKXtpZighdGhpcy5jbG9zZWQpe3ZhciBiPXRoaXM7dGhpcy5vcHRpb25zLnRpbWVvdXQ9YSxiLiRiYXIuZGVsYXkoYi5vcHRpb25zLnRpbWVvdXQpLnByb21pc2UoKS5kb25lKGZ1bmN0aW9uKCl7Yi5jbG9zZSgpfSl9cmV0dXJuIHRoaXN9LHN0b3BQcm9wYWdhdGlvbjpmdW5jdGlvbihhKXthPWF8fHdpbmRvdy5ldmVudCxcInVuZGVmaW5lZFwiIT10eXBlb2YgYS5zdG9wUHJvcGFnYXRpb24/YS5zdG9wUHJvcGFnYXRpb24oKTphLmNhbmNlbEJ1YmJsZT0hMH0sY2xvc2VkOiExLHNob3dpbmc6ITEsc2hvd246ITF9O2Eubm90eVJlbmRlcmVyPXt9LGEubm90eVJlbmRlcmVyLmluaXQ9ZnVuY3Rpb24oYyl7dmFyIGQ9T2JqZWN0LmNyZWF0ZShiKS5pbml0KGMpO3JldHVybiBkLm9wdGlvbnMua2lsbGVyJiZhLm5vdHkuY2xvc2VBbGwoKSxkLm9wdGlvbnMuZm9yY2U/YS5ub3R5LnF1ZXVlLnVuc2hpZnQoZCk6YS5ub3R5LnF1ZXVlLnB1c2goZCksYS5ub3R5UmVuZGVyZXIucmVuZGVyKCksXCJvYmplY3RcIj09YS5ub3R5LnJldHVybnM/ZDpkLm9wdGlvbnMuaWR9LGEubm90eVJlbmRlcmVyLnJlbmRlcj1mdW5jdGlvbigpe3ZhciBiPWEubm90eS5xdWV1ZVswXTtcIm9iamVjdFwiPT09YS50eXBlKGIpP2Iub3B0aW9ucy5kaXNtaXNzUXVldWU/Yi5vcHRpb25zLm1heFZpc2libGU+MD9hKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yK1wiID4gbGlcIikubGVuZ3RoPGIub3B0aW9ucy5tYXhWaXNpYmxlJiZhLm5vdHlSZW5kZXJlci5zaG93KGEubm90eS5xdWV1ZS5zaGlmdCgpKTphLm5vdHlSZW5kZXJlci5zaG93KGEubm90eS5xdWV1ZS5zaGlmdCgpKTphLm5vdHkub250YXAmJihhLm5vdHlSZW5kZXJlci5zaG93KGEubm90eS5xdWV1ZS5zaGlmdCgpKSxhLm5vdHkub250YXA9ITEpOmEubm90eS5vbnRhcD0hMH0sYS5ub3R5UmVuZGVyZXIuc2hvdz1mdW5jdGlvbihiKXtiLm9wdGlvbnMubW9kYWwmJihhLm5vdHlSZW5kZXJlci5jcmVhdGVNb2RhbEZvcihiKSxhLm5vdHlSZW5kZXJlci5zZXRNb2RhbENvdW50KDEpKSxiLm9wdGlvbnMuY3VzdG9tPzA9PWIub3B0aW9ucy5jdXN0b20uZmluZChiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikubGVuZ3RoP2Iub3B0aW9ucy5jdXN0b20uYXBwZW5kKGEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIub2JqZWN0KS5hZGRDbGFzcyhcImktYW0tbmV3XCIpKTpiLm9wdGlvbnMuY3VzdG9tLmZpbmQoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLnJlbW92ZUNsYXNzKFwiaS1hbS1uZXdcIik6MD09YShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikubGVuZ3RoP2EoXCJib2R5XCIpLmFwcGVuZChhKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLm9iamVjdCkuYWRkQ2xhc3MoXCJpLWFtLW5ld1wiKSk6YShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikucmVtb3ZlQ2xhc3MoXCJpLWFtLW5ld1wiKSxhLm5vdHlSZW5kZXJlci5zZXRMYXlvdXRDb3VudEZvcihiLDEpLGIuc2hvdygpfSxhLm5vdHlSZW5kZXJlci5jcmVhdGVNb2RhbEZvcj1mdW5jdGlvbihiKXtpZigwPT1hKFwiLm5vdHlfbW9kYWxcIikubGVuZ3RoKXt2YXIgYz1hKFwiPGRpdi8+XCIpLmFkZENsYXNzKFwibm90eV9tb2RhbFwiKS5hZGRDbGFzcyhiLm9wdGlvbnMudGhlbWUpLmRhdGEoXCJub3R5X21vZGFsX2NvdW50XCIsMCk7Yi5vcHRpb25zLnRoZW1lLm1vZGFsJiZiLm9wdGlvbnMudGhlbWUubW9kYWwuY3NzJiZjLmNzcyhiLm9wdGlvbnMudGhlbWUubW9kYWwuY3NzKSxjLnByZXBlbmRUbyhhKFwiYm9keVwiKSkuZmFkZUluKGIub3B0aW9ucy5hbmltYXRpb24uZmFkZVNwZWVkKSxhLmluQXJyYXkoXCJiYWNrZHJvcFwiLGIub3B0aW9ucy5jbG9zZVdpdGgpPi0xJiZjLm9uKFwiY2xpY2tcIixmdW5jdGlvbihiKXthLm5vdHkuY2xvc2VBbGwoKX0pfX0sYS5ub3R5UmVuZGVyZXIuZ2V0TGF5b3V0Q291bnRGb3I9ZnVuY3Rpb24oYil7cmV0dXJuIGEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmRhdGEoXCJub3R5X2xheW91dF9jb3VudFwiKXx8MH0sYS5ub3R5UmVuZGVyZXIuc2V0TGF5b3V0Q291bnRGb3I9ZnVuY3Rpb24oYixjKXtyZXR1cm4gYShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikuZGF0YShcIm5vdHlfbGF5b3V0X2NvdW50XCIsYS5ub3R5UmVuZGVyZXIuZ2V0TGF5b3V0Q291bnRGb3IoYikrYyl9LGEubm90eVJlbmRlcmVyLmdldE1vZGFsQ291bnQ9ZnVuY3Rpb24oKXtyZXR1cm4gYShcIi5ub3R5X21vZGFsXCIpLmRhdGEoXCJub3R5X21vZGFsX2NvdW50XCIpfHwwfSxhLm5vdHlSZW5kZXJlci5zZXRNb2RhbENvdW50PWZ1bmN0aW9uKGIpe3JldHVybiBhKFwiLm5vdHlfbW9kYWxcIikuZGF0YShcIm5vdHlfbW9kYWxfY291bnRcIixhLm5vdHlSZW5kZXJlci5nZXRNb2RhbENvdW50KCkrYil9LGEuZm4ubm90eT1mdW5jdGlvbihiKXtyZXR1cm4gYi5jdXN0b209YSh0aGlzKSxhLm5vdHlSZW5kZXJlci5pbml0KGIpfSxhLm5vdHk9e30sYS5ub3R5LnF1ZXVlPVtdLGEubm90eS5vbnRhcD0hMCxhLm5vdHkubGF5b3V0cz17fSxhLm5vdHkudGhlbWVzPXt9LGEubm90eS5yZXR1cm5zPVwib2JqZWN0XCIsYS5ub3R5LnN0b3JlPXt9LGEubm90eS5nZXQ9ZnVuY3Rpb24oYil7cmV0dXJuIGEubm90eS5zdG9yZS5oYXNPd25Qcm9wZXJ0eShiKT9hLm5vdHkuc3RvcmVbYl06ITF9LGEubm90eS5jbG9zZT1mdW5jdGlvbihiKXtyZXR1cm4gYS5ub3R5LmdldChiKT9hLm5vdHkuZ2V0KGIpLmNsb3NlKCk6ITF9LGEubm90eS5zZXRUZXh0PWZ1bmN0aW9uKGIsYyl7cmV0dXJuIGEubm90eS5nZXQoYik/YS5ub3R5LmdldChiKS5zZXRUZXh0KGMpOiExfSxhLm5vdHkuc2V0VHlwZT1mdW5jdGlvbihiLGMpe3JldHVybiBhLm5vdHkuZ2V0KGIpP2Eubm90eS5nZXQoYikuc2V0VHlwZShjKTohMX0sYS5ub3R5LmNsZWFyUXVldWU9ZnVuY3Rpb24oKXthLm5vdHkucXVldWU9W119LGEubm90eS5jbG9zZUFsbD1mdW5jdGlvbigpe2Eubm90eS5jbGVhclF1ZXVlKCksYS5lYWNoKGEubm90eS5zdG9yZSxmdW5jdGlvbihhLGIpe2IuY2xvc2UoKX0pfTt2YXIgYz13aW5kb3cuYWxlcnQ7cmV0dXJuIGEubm90eS5jb25zdW1lQWxlcnQ9ZnVuY3Rpb24oYil7d2luZG93LmFsZXJ0PWZ1bmN0aW9uKGMpe2I/Yi50ZXh0PWM6Yj17dGV4dDpjfSxhLm5vdHlSZW5kZXJlci5pbml0KGIpfX0sYS5ub3R5LnN0b3BDb25zdW1lQWxlcnQ9ZnVuY3Rpb24oKXt3aW5kb3cuYWxlcnQ9Y30sYS5ub3R5LmRlZmF1bHRzPXtsYXlvdXQ6XCJ0b3BcIix0aGVtZTpcImRlZmF1bHRUaGVtZVwiLHR5cGU6XCJhbGVydFwiLHRleHQ6XCJcIixkaXNtaXNzUXVldWU6ITAsdGVtcGxhdGU6JzxkaXYgY2xhc3M9XCJub3R5X21lc3NhZ2VcIj48c3BhbiBjbGFzcz1cIm5vdHlfdGV4dFwiPjwvc3Bhbj48ZGl2IGNsYXNzPVwibm90eV9jbG9zZVwiPjwvZGl2PjwvZGl2PicsYW5pbWF0aW9uOntvcGVuOntoZWlnaHQ6XCJ0b2dnbGVcIn0sY2xvc2U6e2hlaWdodDpcInRvZ2dsZVwifSxlYXNpbmc6XCJzd2luZ1wiLHNwZWVkOjUwMCxmYWRlU3BlZWQ6XCJmYXN0XCJ9LHRpbWVvdXQ6ITEsZm9yY2U6ITEsbW9kYWw6ITEsbWF4VmlzaWJsZTo1LGtpbGxlcjohMSxjbG9zZVdpdGg6W1wiY2xpY2tcIl0sY2FsbGJhY2s6e29uU2hvdzpmdW5jdGlvbigpe30sYWZ0ZXJTaG93OmZ1bmN0aW9uKCl7fSxvbkNsb3NlOmZ1bmN0aW9uKCl7fSxhZnRlckNsb3NlOmZ1bmN0aW9uKCl7fSxvbkNsb3NlQ2xpY2s6ZnVuY3Rpb24oKXt9fSxidXR0b25zOiExfSxhKHdpbmRvdykub24oXCJyZXNpemVcIixmdW5jdGlvbigpe2EuZWFjaChhLm5vdHkubGF5b3V0cyxmdW5jdGlvbihiLGMpe2MuY29udGFpbmVyLnN0eWxlLmFwcGx5KGEoYy5jb250YWluZXIuc2VsZWN0b3IpKX0pfSksd2luZG93Lm5vdHk9ZnVuY3Rpb24oYil7cmV0dXJuIGEubm90eVJlbmRlcmVyLmluaXQoYil9LGEubm90eS5sYXlvdXRzLmJvdHRvbT17bmFtZTpcImJvdHRvbVwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfYm90dG9tX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2JvdHRvbV9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7Ym90dG9tOjAsbGVmdDpcIjUlXCIscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiOTAlXCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDo5OTk5OTk5fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuYm90dG9tQ2VudGVyPXtuYW1lOlwiYm90dG9tQ2VudGVyXCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9ib3R0b21DZW50ZXJfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfYm90dG9tQ2VudGVyX2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtib3R0b206MjAsbGVmdDowLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KSxhKHRoaXMpLmNzcyh7bGVmdDooYSh3aW5kb3cpLndpZHRoKCktYSh0aGlzKS5vdXRlcldpZHRoKCExKSkvMitcInB4XCJ9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuYm90dG9tTGVmdD17bmFtZTpcImJvdHRvbUxlZnRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2JvdHRvbUxlZnRfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfYm90dG9tTGVmdF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7Ym90dG9tOjIwLGxlZnQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLHdpbmRvdy5pbm5lcldpZHRoPDYwMCYmYSh0aGlzKS5jc3Moe2xlZnQ6NX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5ib3R0b21SaWdodD17bmFtZTpcImJvdHRvbVJpZ2h0XCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9ib3R0b21SaWdodF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9ib3R0b21SaWdodF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7Ym90dG9tOjIwLHJpZ2h0OjIwLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KSx3aW5kb3cuaW5uZXJXaWR0aDw2MDAmJmEodGhpcykuY3NzKHtyaWdodDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmNlbnRlcj17bmFtZTpcImNlbnRlclwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfY2VudGVyX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2NlbnRlcl9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7cG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pO3ZhciBiPWEodGhpcykuY2xvbmUoKS5jc3Moe3Zpc2liaWxpdHk6XCJoaWRkZW5cIixkaXNwbGF5OlwiYmxvY2tcIixwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOjAsbGVmdDowfSkuYXR0cihcImlkXCIsXCJkdXBlXCIpO2EoXCJib2R5XCIpLmFwcGVuZChiKSxiLmZpbmQoXCIuaS1hbS1jbG9zaW5nLW5vd1wiKS5yZW1vdmUoKSxiLmZpbmQoXCJsaVwiKS5jc3MoXCJkaXNwbGF5XCIsXCJibG9ja1wiKTt2YXIgYz1iLmhlaWdodCgpO2IucmVtb3ZlKCksYSh0aGlzKS5oYXNDbGFzcyhcImktYW0tbmV3XCIpP2EodGhpcykuY3NzKHtsZWZ0OihhKHdpbmRvdykud2lkdGgoKS1hKHRoaXMpLm91dGVyV2lkdGgoITEpKS8yK1wicHhcIix0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0pOmEodGhpcykuYW5pbWF0ZSh7bGVmdDooYSh3aW5kb3cpLndpZHRoKCktYSh0aGlzKS5vdXRlcldpZHRoKCExKSkvMitcInB4XCIsdG9wOihhKHdpbmRvdykuaGVpZ2h0KCktYykvMitcInB4XCJ9LDUwMCl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmNlbnRlckxlZnQ9e25hbWU6XCJjZW50ZXJMZWZ0XCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9jZW50ZXJMZWZ0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2NlbnRlckxlZnRfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe2xlZnQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pO3ZhciBiPWEodGhpcykuY2xvbmUoKS5jc3Moe3Zpc2liaWxpdHk6XCJoaWRkZW5cIixkaXNwbGF5OlwiYmxvY2tcIixwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOjAsbGVmdDowfSkuYXR0cihcImlkXCIsXCJkdXBlXCIpO2EoXCJib2R5XCIpLmFwcGVuZChiKSxiLmZpbmQoXCIuaS1hbS1jbG9zaW5nLW5vd1wiKS5yZW1vdmUoKSxiLmZpbmQoXCJsaVwiKS5jc3MoXCJkaXNwbGF5XCIsXCJibG9ja1wiKTt2YXIgYz1iLmhlaWdodCgpO2IucmVtb3ZlKCksYSh0aGlzKS5oYXNDbGFzcyhcImktYW0tbmV3XCIpP2EodGhpcykuY3NzKHt0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0pOmEodGhpcykuYW5pbWF0ZSh7dG9wOihhKHdpbmRvdykuaGVpZ2h0KCktYykvMitcInB4XCJ9LDUwMCksd2luZG93LmlubmVyV2lkdGg8NjAwJiZhKHRoaXMpLmNzcyh7bGVmdDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmNlbnRlclJpZ2h0PXtuYW1lOlwiY2VudGVyUmlnaHRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2NlbnRlclJpZ2h0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2NlbnRlclJpZ2h0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtyaWdodDoyMCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSk7dmFyIGI9YSh0aGlzKS5jbG9uZSgpLmNzcyh7dmlzaWJpbGl0eTpcImhpZGRlblwiLGRpc3BsYXk6XCJibG9ja1wiLHBvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6MCxsZWZ0OjB9KS5hdHRyKFwiaWRcIixcImR1cGVcIik7YShcImJvZHlcIikuYXBwZW5kKGIpLGIuZmluZChcIi5pLWFtLWNsb3Npbmctbm93XCIpLnJlbW92ZSgpLGIuZmluZChcImxpXCIpLmNzcyhcImRpc3BsYXlcIixcImJsb2NrXCIpO3ZhciBjPWIuaGVpZ2h0KCk7Yi5yZW1vdmUoKSxhKHRoaXMpLmhhc0NsYXNzKFwiaS1hbS1uZXdcIik/YSh0aGlzKS5jc3Moe3RvcDooYSh3aW5kb3cpLmhlaWdodCgpLWMpLzIrXCJweFwifSk6YSh0aGlzKS5hbmltYXRlKHt0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0sNTAwKSx3aW5kb3cuaW5uZXJXaWR0aDw2MDAmJmEodGhpcykuY3NzKHtyaWdodDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmlubGluZT17bmFtZTpcImlubGluZVwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBjbGFzcz1cIm5vdHlfaW5saW5lX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bC5ub3R5X2lubGluZV9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7d2lkdGg6XCIxMDAlXCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDo5OTk5OTk5fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMudG9wPXtuYW1lOlwidG9wXCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV90b3BfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfdG9wX2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHt0b3A6MCxsZWZ0OlwiNSVcIixwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCI5MCVcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4Ojk5OTk5OTl9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy50b3BDZW50ZXI9e25hbWU6XCJ0b3BDZW50ZXJcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X3RvcENlbnRlcl9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV90b3BDZW50ZXJfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3RvcDoyMCxsZWZ0OjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLGEodGhpcykuY3NzKHtsZWZ0OihhKHdpbmRvdykud2lkdGgoKS1hKHRoaXMpLm91dGVyV2lkdGgoITEpKS8yK1wicHhcIn0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy50b3BMZWZ0PXtuYW1lOlwidG9wTGVmdFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfdG9wTGVmdF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV90b3BMZWZ0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHt0b3A6MjAsbGVmdDoyMCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSksd2luZG93LmlubmVyV2lkdGg8NjAwJiZhKHRoaXMpLmNzcyh7bGVmdDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLnRvcFJpZ2h0PXtuYW1lOlwidG9wUmlnaHRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X3RvcFJpZ2h0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X3RvcFJpZ2h0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHt0b3A6MjAscmlnaHQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLHdpbmRvdy5pbm5lcldpZHRoPDYwMCYmYSh0aGlzKS5jc3Moe3JpZ2h0OjV9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LnRoZW1lcy5ib290c3RyYXBUaGVtZT17bmFtZTpcImJvb3RzdHJhcFRoZW1lXCIsbW9kYWw6e2Nzczp7cG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMTAwJVwiLGhlaWdodDpcIjEwMCVcIixiYWNrZ3JvdW5kQ29sb3I6XCIjMDAwXCIsekluZGV4OjFlNCxvcGFjaXR5Oi42LGRpc3BsYXk6XCJub25lXCIsbGVmdDowLHRvcDowfX0sc3R5bGU6ZnVuY3Rpb24oKXt2YXIgYj10aGlzLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3Rvcjtzd2l0Y2goYShiKS5hZGRDbGFzcyhcImxpc3QtZ3JvdXBcIiksdGhpcy4kY2xvc2VCdXR0b24uYXBwZW5kKCc8c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj4mdGltZXM7PC9zcGFuPjxzcGFuIGNsYXNzPVwic3Itb25seVwiPkNsb3NlPC9zcGFuPicpLHRoaXMuJGNsb3NlQnV0dG9uLmFkZENsYXNzKFwiY2xvc2VcIiksdGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtXCIpLmNzcyhcInBhZGRpbmdcIixcIjBweFwiKSx0aGlzLm9wdGlvbnMudHlwZSl7Y2FzZVwiYWxlcnRcIjpjYXNlXCJub3RpZmljYXRpb25cIjp0aGlzLiRiYXIuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwLWl0ZW0taW5mb1wiKTticmVhaztjYXNlXCJ3YXJuaW5nXCI6dGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtLXdhcm5pbmdcIik7YnJlYWs7Y2FzZVwiZXJyb3JcIjp0aGlzLiRiYXIuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwLWl0ZW0tZGFuZ2VyXCIpO2JyZWFrO2Nhc2VcImluZm9ybWF0aW9uXCI6dGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtLWluZm9cIik7YnJlYWs7Y2FzZVwic3VjY2Vzc1wiOnRoaXMuJGJhci5hZGRDbGFzcyhcImxpc3QtZ3JvdXAtaXRlbS1zdWNjZXNzXCIpfXRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjEzcHhcIixsaW5lSGVpZ2h0OlwiMTZweFwiLHRleHRBbGlnbjpcImNlbnRlclwiLHBhZGRpbmc6XCI4cHggMTBweCA5cHhcIix3aWR0aDpcImF1dG9cIixwb3NpdGlvbjpcInJlbGF0aXZlXCJ9KX0sY2FsbGJhY2s6e29uU2hvdzpmdW5jdGlvbigpe30sb25DbG9zZTpmdW5jdGlvbigpe319fSxhLm5vdHkudGhlbWVzLmRlZmF1bHRUaGVtZT17bmFtZTpcImRlZmF1bHRUaGVtZVwiLGhlbHBlcnM6e2JvcmRlckZpeDpmdW5jdGlvbigpe2lmKHRoaXMub3B0aW9ucy5kaXNtaXNzUXVldWUpe3ZhciBiPXRoaXMub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yK1wiIFwiK3RoaXMub3B0aW9ucy5sYXlvdXQucGFyZW50LnNlbGVjdG9yO3N3aXRjaCh0aGlzLm9wdGlvbnMubGF5b3V0Lm5hbWUpe2Nhc2VcInRvcFwiOmEoYikuY3NzKHtib3JkZXJSYWRpdXM6XCIwcHggMHB4IDBweCAwcHhcIn0pLGEoYikubGFzdCgpLmNzcyh7Ym9yZGVyUmFkaXVzOlwiMHB4IDBweCA1cHggNXB4XCJ9KTticmVhaztjYXNlXCJ0b3BDZW50ZXJcIjpjYXNlXCJ0b3BMZWZ0XCI6Y2FzZVwidG9wUmlnaHRcIjpjYXNlXCJib3R0b21DZW50ZXJcIjpjYXNlXCJib3R0b21MZWZ0XCI6Y2FzZVwiYm90dG9tUmlnaHRcIjpjYXNlXCJjZW50ZXJcIjpjYXNlXCJjZW50ZXJMZWZ0XCI6Y2FzZVwiY2VudGVyUmlnaHRcIjpjYXNlXCJpbmxpbmVcIjphKGIpLmNzcyh7Ym9yZGVyUmFkaXVzOlwiMHB4IDBweCAwcHggMHB4XCJ9KSxhKGIpLmZpcnN0KCkuY3NzKHtcImJvcmRlci10b3AtbGVmdC1yYWRpdXNcIjpcIjVweFwiLFwiYm9yZGVyLXRvcC1yaWdodC1yYWRpdXNcIjpcIjVweFwifSksYShiKS5sYXN0KCkuY3NzKHtcImJvcmRlci1ib3R0b20tbGVmdC1yYWRpdXNcIjpcIjVweFwiLFwiYm9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXNcIjpcIjVweFwifSk7YnJlYWs7Y2FzZVwiYm90dG9tXCI6YShiKS5jc3Moe2JvcmRlclJhZGl1czpcIjBweCAwcHggMHB4IDBweFwifSksYShiKS5maXJzdCgpLmNzcyh7Ym9yZGVyUmFkaXVzOlwiNXB4IDVweCAwcHggMHB4XCJ9KX19fX0sbW9kYWw6e2Nzczp7cG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMTAwJVwiLGhlaWdodDpcIjEwMCVcIixiYWNrZ3JvdW5kQ29sb3I6XCIjMDAwXCIsekluZGV4OjFlNCxvcGFjaXR5Oi42LGRpc3BsYXk6XCJub25lXCIsbGVmdDowLHRvcDowfX0sc3R5bGU6ZnVuY3Rpb24oKXtzd2l0Y2godGhpcy4kYmFyLmNzcyh7b3ZlcmZsb3c6XCJoaWRkZW5cIixiYWNrZ3JvdW5kOlwidXJsKCdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUJzQUFBQW9DQVFBQUFDbE0wbmRBQUFBaGtsRVFWUjRBZFhPMFFyQ01CQkUwYnR0a2szOC93OFdSRVJwZHlqelZPYytIeGhJSHFKR01RY0ZGa3BZUlFvdExMU3cwSUo1YUJkb3ZydU1ZREEva1Q4cGxGOVpLTEZRY2dGMThoRGoxU2JRT01sQ0E0a2FvMGlpWG1haDdxQldQZHhwb2hzZ1ZaeWo3ZTVJOUtjSUQrRWhpREk1Z3hCWUtMQlFZS0hBUW9HRkFvRWtzL1lFR0hZS0I3aEZ4ZjBBQUFBQVNVVk9SSzVDWUlJPScpIHJlcGVhdC14IHNjcm9sbCBsZWZ0IHRvcCAjZmZmXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsbGluZUhlaWdodDpcIjE2cHhcIix0ZXh0QWxpZ246XCJjZW50ZXJcIixwYWRkaW5nOlwiOHB4IDEwcHggOXB4XCIsd2lkdGg6XCJhdXRvXCIscG9zaXRpb246XCJyZWxhdGl2ZVwifSksdGhpcy4kY2xvc2VCdXR0b24uY3NzKHtwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOjQscmlnaHQ6NCx3aWR0aDoxMCxoZWlnaHQ6MTAsYmFja2dyb3VuZDpcInVybChkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFvQUFBQUtDQVFBQUFBbk93YzJBQUFBeFVsRVFWUjRBUjNNUFVvRFVSU0EwZSsrdVNra094QzNJQU9XTnRhQ0lEYUNoZmdYQk1FWmJRUkJ5eEN3aytCYXNnUVJaTFNZb0xnRFFiQVJ4cnk4bnl1bVBjVlJLRGZkMEFhOEFzZ0R2MXpwNnBZZDVqV093aHZlYlJUYnpOTkV3NUJTc0lwc2ova3VyUUJubWs3c0lGY0NGNXl5WlBEUkc2dHJRaHVqWFlvc2FGb2MrMmYxTUo4OXVjNzZJTkQ2RjlCdmxYVWRwYjZ4d0QyKzRxM21lM2J5c2lIdnRMWXJVSnRvN1BEL3ZlN0xOSHhTZy93b04ya1N6NHR4YXNCZGh5aXozdWdQR2V0VGptM1hSb2tBQUFBQVNVVk9SSzVDWUlJPSlcIixkaXNwbGF5Olwibm9uZVwiLGN1cnNvcjpcInBvaW50ZXJcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtwYWRkaW5nOjUsdGV4dEFsaWduOlwicmlnaHRcIixib3JkZXJUb3A6XCIxcHggc29saWQgI2NjY1wiLGJhY2tncm91bmRDb2xvcjpcIiNmZmZcIn0pLHRoaXMuJGJ1dHRvbnMuZmluZChcImJ1dHRvblwiKS5jc3Moe21hcmdpbkxlZnQ6NX0pLHRoaXMuJGJ1dHRvbnMuZmluZChcImJ1dHRvbjpmaXJzdFwiKS5jc3Moe21hcmdpbkxlZnQ6MH0pLHRoaXMuJGJhci5vbih7bW91c2VlbnRlcjpmdW5jdGlvbigpe2EodGhpcykuZmluZChcIi5ub3R5X2Nsb3NlXCIpLnN0b3AoKS5mYWRlVG8oXCJub3JtYWxcIiwxKX0sbW91c2VsZWF2ZTpmdW5jdGlvbigpe2EodGhpcykuZmluZChcIi5ub3R5X2Nsb3NlXCIpLnN0b3AoKS5mYWRlVG8oXCJub3JtYWxcIiwwKX19KSx0aGlzLm9wdGlvbnMubGF5b3V0Lm5hbWUpe2Nhc2VcInRvcFwiOnRoaXMuJGJhci5jc3Moe2JvcmRlclJhZGl1czpcIjBweCAwcHggNXB4IDVweFwiLGJvcmRlckJvdHRvbTpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyTGVmdDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyUmlnaHQ6XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pO2JyZWFrO2Nhc2VcInRvcENlbnRlclwiOmNhc2VcImNlbnRlclwiOmNhc2VcImJvdHRvbUNlbnRlclwiOmNhc2VcImlubGluZVwiOnRoaXMuJGJhci5jc3Moe2JvcmRlclJhZGl1czpcIjVweFwiLGJvcmRlcjpcIjFweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTNweFwiLHRleHRBbGlnbjpcImNlbnRlclwifSk7YnJlYWs7Y2FzZVwidG9wTGVmdFwiOmNhc2VcInRvcFJpZ2h0XCI6Y2FzZVwiYm90dG9tTGVmdFwiOmNhc2VcImJvdHRvbVJpZ2h0XCI6Y2FzZVwiY2VudGVyTGVmdFwiOmNhc2VcImNlbnRlclJpZ2h0XCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyUmFkaXVzOlwiNXB4XCIsYm9yZGVyOlwiMXB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsdGV4dEFsaWduOlwibGVmdFwifSk7YnJlYWs7Y2FzZVwiYm90dG9tXCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyUmFkaXVzOlwiNXB4IDVweCAwcHggMHB4XCIsYm9yZGVyVG9wOlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJMZWZ0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJSaWdodDpcIjJweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAtMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pO2JyZWFrO2RlZmF1bHQ6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyOlwiMnB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KX1zd2l0Y2godGhpcy5vcHRpb25zLnR5cGUpe2Nhc2VcImFsZXJ0XCI6Y2FzZVwibm90aWZpY2F0aW9uXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGRlwiLGJvcmRlckNvbG9yOlwiI0NDQ1wiLGNvbG9yOlwiIzQ0NFwifSk7YnJlYWs7Y2FzZVwid2FybmluZ1wiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkVBQThcIixib3JkZXJDb2xvcjpcIiNGRkMyMzdcIixjb2xvcjpcIiM4MjYyMDBcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgI0ZGQzIzN1wifSk7YnJlYWs7Y2FzZVwiZXJyb3JcIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCJyZWRcIixib3JkZXJDb2xvcjpcImRhcmtyZWRcIixjb2xvcjpcIiNGRkZcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250V2VpZ2h0OlwiYm9sZFwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCBkYXJrcmVkXCJ9KTticmVhaztjYXNlXCJpbmZvcm1hdGlvblwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiM1N0I3RTJcIixib3JkZXJDb2xvcjpcIiMwQjkwQzRcIixjb2xvcjpcIiNGRkZcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgIzBCOTBDNFwifSk7YnJlYWs7Y2FzZVwic3VjY2Vzc1wiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcImxpZ2h0Z3JlZW5cIixib3JkZXJDb2xvcjpcIiM1MEMyNEVcIixjb2xvcjpcImRhcmtncmVlblwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjNTBDMjRFXCJ9KTticmVhaztkZWZhdWx0OnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkZcIixib3JkZXJDb2xvcjpcIiNDQ0NcIixjb2xvcjpcIiM0NDRcIn0pfX0sY2FsbGJhY2s6e29uU2hvdzpmdW5jdGlvbigpe2Eubm90eS50aGVtZXMuZGVmYXVsdFRoZW1lLmhlbHBlcnMuYm9yZGVyRml4LmFwcGx5KHRoaXMpfSxvbkNsb3NlOmZ1bmN0aW9uKCl7YS5ub3R5LnRoZW1lcy5kZWZhdWx0VGhlbWUuaGVscGVycy5ib3JkZXJGaXguYXBwbHkodGhpcyl9fX0sYS5ub3R5LnRoZW1lcy5yZWxheD17bmFtZTpcInJlbGF4XCIsaGVscGVyczp7fSxtb2RhbDp7Y3NzOntwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIxMDAlXCIsaGVpZ2h0OlwiMTAwJVwiLGJhY2tncm91bmRDb2xvcjpcIiMwMDBcIix6SW5kZXg6MWU0LG9wYWNpdHk6LjYsZGlzcGxheTpcIm5vbmVcIixsZWZ0OjAsdG9wOjB9fSxzdHlsZTpmdW5jdGlvbigpe3N3aXRjaCh0aGlzLiRiYXIuY3NzKHtvdmVyZmxvdzpcImhpZGRlblwiLG1hcmdpbjpcIjRweCAwXCIsYm9yZGVyUmFkaXVzOlwiMnB4XCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxNHB4XCIsbGluZUhlaWdodDpcIjE2cHhcIix0ZXh0QWxpZ246XCJjZW50ZXJcIixwYWRkaW5nOlwiMTBweFwiLHdpZHRoOlwiYXV0b1wiLHBvc2l0aW9uOlwicmVsYXRpdmVcIn0pLHRoaXMuJGNsb3NlQnV0dG9uLmNzcyh7cG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDo0LHJpZ2h0OjQsd2lkdGg6MTAsaGVpZ2h0OjEwLGJhY2tncm91bmQ6XCJ1cmwoZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBb0FBQUFLQ0FRQUFBQW5Pd2MyQUFBQXhVbEVRVlI0QVIzTVBVb0RVUlNBMGUrK3VTa2tPeEMzSUFPV050YUNJRGFDaGZnWEJNRVpiUVJCeXhDd2srQmFzZ1FSWkxTWW9MZ0RRYkFSeHJ5OG55dW1QY1ZSS0RmZDBBYThBc2dEdjF6cDZwWWQ1aldPd2h2ZWJSVGJ6Tk5FdzVCU3NJcHNqL2t1clFCbm1rN3NJRmNDRjV5eVpQRFJHNnRyUWh1alhZb3NhRm9jKzJmMU1KODl1Yzc2SU5ENkY5QnZsWFVkcGI2eHdEMis0cTNtZTNieXNpSHZ0TFlyVUp0bzdQRC92ZTdMTkh4U2cvd29OMmtTejR0eGFzQmRoeWl6M3VnUEdldFRqbTNYUm9rQUFBQUFTVVZPUks1Q1lJST0pXCIsZGlzcGxheTpcIm5vbmVcIixjdXJzb3I6XCJwb2ludGVyXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7cGFkZGluZzo1LHRleHRBbGlnbjpcInJpZ2h0XCIsYm9yZGVyVG9wOlwiMXB4IHNvbGlkICNjY2NcIixiYWNrZ3JvdW5kQ29sb3I6XCIjZmZmXCJ9KSx0aGlzLiRidXR0b25zLmZpbmQoXCJidXR0b25cIikuY3NzKHttYXJnaW5MZWZ0OjV9KSx0aGlzLiRidXR0b25zLmZpbmQoXCJidXR0b246Zmlyc3RcIikuY3NzKHttYXJnaW5MZWZ0OjB9KSx0aGlzLiRiYXIub24oe21vdXNlZW50ZXI6ZnVuY3Rpb24oKXthKHRoaXMpLmZpbmQoXCIubm90eV9jbG9zZVwiKS5zdG9wKCkuZmFkZVRvKFwibm9ybWFsXCIsMSl9LG1vdXNlbGVhdmU6ZnVuY3Rpb24oKXthKHRoaXMpLmZpbmQoXCIubm90eV9jbG9zZVwiKS5zdG9wKCkuZmFkZVRvKFwibm9ybWFsXCIsMCl9fSksdGhpcy5vcHRpb25zLmxheW91dC5uYW1lKXtjYXNlXCJ0b3BcIjp0aGlzLiRiYXIuY3NzKHtib3JkZXJCb3R0b206XCIycHggc29saWQgI2VlZVwiLGJvcmRlckxlZnQ6XCIycHggc29saWQgI2VlZVwiLGJvcmRlclJpZ2h0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJUb3A6XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pO2JyZWFrO2Nhc2VcInRvcENlbnRlclwiOmNhc2VcImNlbnRlclwiOmNhc2VcImJvdHRvbUNlbnRlclwiOmNhc2VcImlubGluZVwiOnRoaXMuJGJhci5jc3Moe2JvcmRlcjpcIjFweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTNweFwiLHRleHRBbGlnbjpcImNlbnRlclwifSk7YnJlYWs7Y2FzZVwidG9wTGVmdFwiOmNhc2VcInRvcFJpZ2h0XCI6Y2FzZVwiYm90dG9tTGVmdFwiOmNhc2VcImJvdHRvbVJpZ2h0XCI6Y2FzZVwiY2VudGVyTGVmdFwiOmNhc2VcImNlbnRlclJpZ2h0XCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyOlwiMXB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsdGV4dEFsaWduOlwibGVmdFwifSk7YnJlYWs7Y2FzZVwiYm90dG9tXCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyVG9wOlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJMZWZ0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJSaWdodDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyQm90dG9tOlwiMnB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIC0ycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSk7YnJlYWs7ZGVmYXVsdDp0aGlzLiRiYXIuY3NzKHtib3JkZXI6XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pfXN3aXRjaCh0aGlzLm9wdGlvbnMudHlwZSl7Y2FzZVwiYWxlcnRcIjpjYXNlXCJub3RpZmljYXRpb25cIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkZGXCIsYm9yZGVyQ29sb3I6XCIjZGVkZWRlXCIsY29sb3I6XCIjNDQ0XCJ9KTticmVhaztjYXNlXCJ3YXJuaW5nXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGRUFBOFwiLGJvcmRlckNvbG9yOlwiI0ZGQzIzN1wiLGNvbG9yOlwiIzgyNjIwMFwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjRkZDMjM3XCJ9KTticmVhaztjYXNlXCJlcnJvclwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRjgxODFcIixib3JkZXJDb2xvcjpcIiNlMjUzNTNcIixjb2xvcjpcIiNGRkZcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250V2VpZ2h0OlwiYm9sZFwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCBkYXJrcmVkXCJ9KTticmVhaztjYXNlXCJpbmZvcm1hdGlvblwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiM3OEM1RTdcIixib3JkZXJDb2xvcjpcIiMzYmFkZDZcIixjb2xvcjpcIiNGRkZcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgIzBCOTBDNFwifSk7YnJlYWs7Y2FzZVwic3VjY2Vzc1wiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNCQ0Y1QkNcIixib3JkZXJDb2xvcjpcIiM3Y2RkNzdcIixjb2xvcjpcImRhcmtncmVlblwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjNTBDMjRFXCJ9KTticmVhaztkZWZhdWx0OnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkZcIixib3JkZXJDb2xvcjpcIiNDQ0NcIixjb2xvcjpcIiM0NDRcIn0pfX0sY2FsbGJhY2s6e29uU2hvdzpmdW5jdGlvbigpe30sb25DbG9zZTpmdW5jdGlvbigpe319fSx3aW5kb3cubm90eX0pOyIsIiQoZnVuY3Rpb24oKSB7XHJcbiAgICAvLyB0ZW1wXHJcbiAgICAkKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiYVtocmVmPScjcmVmbGluayddXCIsIGZ1bmN0aW9uKCkge3JldHVybiBmYWxzZTt9KTtcclxuXHJcbiAgICB2YXIgdXJsUHJlZml4ID0gJyc7XHJcblxyXG4gICAgdmFyIGFqYXggPSB7XHJcbiAgICAgICAgY29udHJvbDoge1xyXG4gICAgICAgICAgICBzZW5kRm9ybURhdGE6IGZ1bmN0aW9uKGZvcm0sIHVybCwgbG9nTmFtZSwgc3VjY2Vzc0NhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vbiggXCJzdWJtaXRcIiwgZm9ybSwgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZiA9ICQodGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YUZvcm0gPSAkKHRoaXMpLnNlcmlhbGl6ZSgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN1Ym1pdEJ1dHRvbiA9ICQodGhpcykuZmluZChcImJ1dHRvblt0eXBlPXN1Ym1pdF1cIiksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkQnV0dG9uVmFsdWUgPSBzdWJtaXRCdXR0b24uaHRtbCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBzdWJtaXRCdXR0b24uYXR0cihcImRpc2FibGVkXCIsIFwiZGlzYWJsZWRcIikuaHRtbCgnPGkgY2xhc3M9XCJmYSBmYS1jb2cgZmEtc3BpblwiPjwvaT4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiBcInBvc3RcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiB1cmxQcmVmaXggKyB1cmwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGFGb3JtLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gJC5wYXJzZUpTT04ocmVzcG9uc2UpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHJlc3BvbnNlLmVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGtleSBpbiByZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihyZXNwb25zZVtrZXldWzBdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmb3JtRXJyb3IgPSBub3R5KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCe0YjQuNCx0LrQsCE8L2I+IFwiICsgcmVzcG9uc2Vba2V5XVswXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOiAncmVsYXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA3MDAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc0NhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihqcXhocikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JzLmNvbnRyb2wubG9nKGxvZ05hbWUsIGpxeGhyKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZm9ybUVycm9yQWpheCA9IG5vdHkoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0KLQtdGF0L3QuNGH0LXRgdC60LjQtSDRgNCw0LHQvtGC0YshPC9iPjxicj7QkiDQtNCw0L3QvdGL0Lkg0LzQvtC80LXQvdGCINCy0YDQtdC80LXQvdC4XCIgKyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiINC/0YDQvtC40LfQstC10LTRkdC90L3QvtC1INC00LXQudGB0YLQstC40LUg0L3QtdCy0L7Qt9C80L7QttC90L4uINCf0L7Qv9GA0L7QsdGD0LnRgtC1INC/0L7Qt9C20LUuXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIg0J/RgNC40L3QvtGB0LjQvCDRgdCy0L7QuCDQuNC30LLQuNC90LXQvdC40Y8g0LfQsCDQvdC10YPQtNC+0LHRgdGC0LLQvi5cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnc3dpbmcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnd2FybmluZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDEwMDAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0QnV0dG9uLnJlbW92ZUF0dHIoXCJkaXNhYmxlZFwiKS5odG1sKG9sZEJ1dHRvblZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGVycm9ycyA9IHtcclxuICAgICAgICBjb250cm9sOiB7XHJcbiAgICAgICAgICAgIGxvZzogZnVuY3Rpb24odHlwZSwganF4aHIpIHtcclxuICAgICAgICAgICAgICAgICQoXCI8ZGl2IGlkPSdlcnJvci1jb250YWluZXInIHN0eWxlPSdkaXNwbGF5Om5vbmU7Jz5cIiArIGpxeGhyLnJlc3BvbnNlVGV4dCArIFwiPC9kaXY+XCIpLmFwcGVuZFRvKFwiYm9keVwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgZXJyb3JDb250YWluZXIgPSAkKFwiI2Vycm9yLWNvbnRhaW5lclwiKSxcclxuICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZSA9IHR5cGUgKyBcIjogXCIgKyBqcXhoci5zdGF0dXMgKyBcIiBcIiArIGpxeGhyLnN0YXR1c1RleHQgKyBcIiBcIjtcclxuXHJcbiAgICAgICAgICAgICAgICBpZihlcnJvckNvbnRhaW5lci5maW5kKFwiaDI6Zmlyc3RcIikudGV4dCgpID09IFwiRGV0YWlsc1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlICs9IFwiLSBcIjtcclxuICAgICAgICAgICAgICAgICAgICBlcnJvckNvbnRhaW5lci5maW5kKFwiZGl2XCIpLmVhY2goZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoaW5kZXggPiA0KSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkZWxpbWl0ZXIgPSBcIiwgXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGluZGV4ID09IDQpIGRlbGltaXRlciA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZSArPSAkKHRoaXMpLnRleHQoKSArIGRlbGltaXRlcjtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogXCJwb3N0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiB1cmxQcmVmaXggKyBcIi9hamF4LWVycm9yXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogXCJtZXNzYWdlPVwiICsgZXJyb3JNZXNzYWdlLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZXJyb3JDb250YWluZXIucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNldHRpbmdzID0ge1xyXG4gICAgICAgIGNvbnRyb2w6IHtcclxuICAgICAgICAgICAgZXZlbnRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGFqYXguY29udHJvbC5zZW5kRm9ybURhdGEoXCIjdG9wIGZvcm1bbmFtZT11c2VyLXNldHRpbmdzXVwiLCBcIi9hY2NvdW50L3NldHRpbmdzL2NoYW5nZS1zZXR0aW5nc1wiLCBcIkFjY291bnQgU2V0dGluZ3MgQWpheCBFcnJvclwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKFwiI3RvcCBmb3JtW25hbWU9dXNlci1zZXR0aW5nc11cIikuYXR0cihcIm5hbWVcIiwgXCJ2YWxpZC1kYXRhLXNldHRpbmdzXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2V0dGluZ3NTdWNjZXNzID0gbm90eSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0J/QvtC30LTRgNCw0LLQu9GP0LXQvCE8L2I+PGJyPtCY0L3RhNC+0YDQvNCw0YbQuNGPINGD0YHQv9C10YjQvdC+INC+0LHQvdC+0LLQu9C10L3QsC5cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA3MDAwXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoXCIjdG9wIGZvcm1bbmFtZT12YWxpZC1kYXRhLXNldHRpbmdzXVwiKS5zdWJtaXQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCAxNTAwKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGFqYXguY29udHJvbC5zZW5kRm9ybURhdGEoXCIjdG9wIGZvcm1bbmFtZT11c2VyLXBhc3N3b3JkXVwiLCBcIi9hY2NvdW50L3NldHRpbmdzL2NoYW5nZS1wYXNzd29yZFwiLCBcIkFjY291bnQgUGFzc3dvcmQgQWpheCBFcnJvclwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcGFzc3dvcmRTdWNjZXNzID0gbm90eSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0J/QvtC30LTRgNCw0LLQu9GP0LXQvCE8L2I+PGJyPtCf0LDRgNC+0LvRjCDRg9GB0L/QtdGI0L3QviDQuNC30LzQtdC90ZHQvS5cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA3MDAwXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoXCIjdG9wIGZvcm1bbmFtZT11c2VyLXBhc3N3b3JkXVwiKVswXS5yZXNldCgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJCgnI3RvcCBpbnB1dFtyZWY9ZGF0ZV0nKS5kYXRlcGlja2VyKHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRlRm9ybWF0OiBcInl5eXktbW0tZGRcIlxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gICBcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHZhciBiYWxhbmNlID0ge1xyXG4gICAgICAgIGNvbnRyb2w6IHtcclxuICAgICAgICAgICAgZXZlbnRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciBjb25maXJtQmFsYW5jZSA9ICQoXCIjdWluZm9cIikuYXR0cihcImRhdGEtYmFsYW5jZVwiKSxcclxuICAgICAgICAgICAgICAgICAgICAgIHN0YXR1cyA9ICQoXCIjdWluZm9cIikuYXR0cihcImRhdGEtc3RhdHVzXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIENpcmNsZXMuY3JlYXRlKHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogJ2Jyb256ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiAxMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGNvbmZpcm1CYWxhbmNlLFxyXG4gICAgICAgICAgICAgICAgICAgIG1heFZhbHVlOiA1MDAsXHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IChzdGF0dXMgPT0gXCJkZWZhdWx0XCIgPyAyMCA6IDEwKSxcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgKyAnIDxzcGFuIGNsYXNzPVwiZmEgZmEtcnViXCI+PC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcnM6ICBbJyNFQzhCNkMnLCAnIzg3MjYwQyddLFxyXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiA1MDAsXHJcbiAgICAgICAgICAgICAgICAgICAgd3JwQ2xhc3M6ICdjaXJjbGVzLXdycCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dENsYXNzOiAgJ2NpcmNsZXMtdGV4dCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVTdHJva2VDbGFzczogICdjaXJjbGVzLXZhbHVlU3Ryb2tlJyxcclxuICAgICAgICAgICAgICAgICAgICBtYXhWYWx1ZVN0cm9rZUNsYXNzOiAnY2lyY2xlcy1tYXhWYWx1ZVN0cm9rZScsXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVXcmFwcGVyOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlVGV4dDogIHRydWVcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIENpcmNsZXMuY3JlYXRlKHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogJ3NpbHZlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiAxMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGNvbmZpcm1CYWxhbmNlLFxyXG4gICAgICAgICAgICAgICAgICAgIG1heFZhbHVlOiAzMDAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAoc3RhdHVzID09IFwiYnJvbnplXCIgPyAyMCA6IDEwKSxcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBmdW5jdGlvbih2YWx1ZSl7cmV0dXJuIHZhbHVlICsgJyA8c3BhbiBjbGFzcz1cImZhIGZhLXJ1YlwiPjwvc3Bhbj4nO30sXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3JzOiAgWycjRTNFM0UzJywgJyM5RDlEOUInXSxcclxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogNjAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHdycENsYXNzOiAnY2lyY2xlcy13cnAnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRleHRDbGFzczogICdjaXJjbGVzLXRleHQnLFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlU3Ryb2tlQ2xhc3M6ICAnY2lyY2xlcy12YWx1ZVN0cm9rZScsXHJcbiAgICAgICAgICAgICAgICAgICAgbWF4VmFsdWVTdHJva2VDbGFzczogJ2NpcmNsZXMtbWF4VmFsdWVTdHJva2UnLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlV3JhcHBlcjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZVRleHQ6ICB0cnVlXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBDaXJjbGVzLmNyZWF0ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdnb2xkJyxcclxuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDEwMCxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY29uZmlybUJhbGFuY2UsXHJcbiAgICAgICAgICAgICAgICAgICAgbWF4VmFsdWU6IDcwMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IChzdGF0dXMgPT0gXCJzaWx2ZXJcIiA/IDIwIDogMTApLFxyXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IGZ1bmN0aW9uKHZhbHVlKXtyZXR1cm4gdmFsdWUgKyAnIDxzcGFuIGNsYXNzPVwiZmEgZmEtcnViXCI+PC9zcGFuPic7fSxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcnM6ICBbJyNGQ0I4NEInLCAnI0Q1ODQxNyddLFxyXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiA3MDAsXHJcbiAgICAgICAgICAgICAgICAgICAgd3JwQ2xhc3M6ICdjaXJjbGVzLXdycCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dENsYXNzOiAgJ2NpcmNsZXMtdGV4dCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVTdHJva2VDbGFzczogICdjaXJjbGVzLXZhbHVlU3Ryb2tlJyxcclxuICAgICAgICAgICAgICAgICAgICBtYXhWYWx1ZVN0cm9rZUNsYXNzOiAnY2lyY2xlcy1tYXhWYWx1ZVN0cm9rZScsXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVXcmFwcGVyOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlVGV4dDogIHRydWVcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIENpcmNsZXMuY3JlYXRlKHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogJ3BsYXRpbnVtJyxcclxuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDEwMCxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY29uZmlybUJhbGFuY2UsXHJcbiAgICAgICAgICAgICAgICAgICAgbWF4VmFsdWU6IDEwMDAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAoc3RhdHVzID09IFwiZ29sZFwiID8gMjAgOiAxMCksXHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogZnVuY3Rpb24odmFsdWUpe3JldHVybiB2YWx1ZSArICcgPHNwYW4gY2xhc3M9XCJmYSBmYS1ydWJcIj48L3NwYW4+Jzt9LFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yczogIFsnIzlEOUQ5QicsICcjMDYwNjA2J10sXHJcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IDgwMCxcclxuICAgICAgICAgICAgICAgICAgICB3cnBDbGFzczogJ2NpcmNsZXMtd3JwJyxcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0Q2xhc3M6ICAnY2lyY2xlcy10ZXh0JyxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZVN0cm9rZUNsYXNzOiAgJ2NpcmNsZXMtdmFsdWVTdHJva2UnLFxyXG4gICAgICAgICAgICAgICAgICAgIG1heFZhbHVlU3Ryb2tlQ2xhc3M6ICdjaXJjbGVzLW1heFZhbHVlU3Ryb2tlJyxcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZVdyYXBwZXI6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVUZXh0OiAgdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfSk7ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBoZWFkZXIgPSB7XHJcbiAgICAgICAgY29udHJvbDoge1xyXG4gICAgICAgICAgICBldmVudHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYoJCh3aW5kb3cpLndpZHRoKCkgPiA5OTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKFwiI3NlYXJjaFwiKS5hdXRvY29tcGxldGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlVXJsOiAnL3NlYXJjaCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vQ2FjaGU6ICd0cnVlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJSZXF1ZXN0Qnk6IDMwMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU2VsZWN0OiBmdW5jdGlvbiAoc3VnZ2VzdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9ICcvc3RvcmVzLycgKyBzdWdnZXN0aW9uLmRhdGEucm91dGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAkKFwiLmRvYnJvaGVhZCBpXCIpLmFuaW1vKHthbmltYXRpb246IFwicHVsc2VcIiwgaXRlcmF0ZTogXCJpbmZpbml0ZVwifSk7XHJcbiAgICAgICAgICAgICAgICAkKFwiLmxpbmstaGVhZC1zdG9yZXMgc3Bhbi5zdG9yZXMtZmxhc2hcIikuYW5pbW8oe2FuaW1hdGlvbjogXCJmbGFzaFwiLCBpdGVyYXRlOiBcImluZmluaXRlXCIsIGR1cmF0aW9uOiAyLjR9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgd2l0aGRyYXcgPSB7XHJcbiAgICAgICAgY29udHJvbDoge1xyXG4gICAgICAgICAgICBldmVudHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChcIiN0b3BcIikuZmluZChcIi5hY2NvdW50LXdpdGhkcmF3IC5vcHRpb24gYVwiKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZiA9ICQodGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uID0gc2VsZi5wYXJlbnQoKS5hdHRyKFwiZGF0YS1vcHRpb24tcHJvY2Vzc1wiKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlciA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIiN0b3BcIikuZmluZChcIi5hY2NvdW50LXdpdGhkcmF3IC5vcHRpb24gYVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKFwiI3RvcFwiKS5maW5kKFwiZm9ybVtuYW1lPXdpdGhkcmF3LWZvcm1dXCIpLmZpbmQoJyN1c2Vyc3dpdGhkcmF3LXByb2Nlc3NfaWQnKS52YWwob3B0aW9uKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoKG9wdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiMVwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlciA9IFwi0JLQstC10LTQuNGC0LUg0L3QvtC80LXRgCDRgdGH0ZHRgtCwXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIjJcIjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXIgPSBcItCS0LLQtdC00LjRgtC1INC90L7QvNC10YAgUi3QutC+0YjQtdC70YzQutCwXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIjNcIjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXIgPSBcItCS0LLQtdC00LjRgtC1INC90L7QvNC10YAg0YLQtdC70LXRhNC+0L3QsFwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCI0XCI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyID0gXCLQktCy0LXQtNC40YLQtSDQvdC+0LzQtdGAINC60LDRgNGC0YtcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiNVwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlciA9IFwi0JLQstC10LTQuNGC0LUgZW1haWwg0LDQtNGA0LXRgVwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCI2XCI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyID0gXCLQktCy0LXQtNC40YLQtSDQvdC+0LzQtdGAINGC0LXQu9C10YTQvtC90LBcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKFwiI3RvcFwiKS5maW5kKFwiZm9ybVtuYW1lPXdpdGhkcmF3LWZvcm1dXCIpLmZpbmQoXCIjdXNlcnN3aXRoZHJhdy1iaWxsXCIpLmF0dHIoXCJwbGFjZWhvbGRlclwiLCBwbGFjZWhvbGRlcik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGFqYXguY29udHJvbC5zZW5kRm9ybURhdGEoXCIjdG9wIGZvcm1bbmFtZT13aXRoZHJhdy1mb3JtXVwiLCBcIi9hY2NvdW50L3dpdGhkcmF3XCIsIFwiV2l0aGRyYXcgQWpheCBFcnJvclwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgd2l0aGRyYXdTdWNjZXNzID0gbm90eSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0J/QvtC30LTRgNCw0LLQu9GP0LXQvCE8L2I+PGJyPtCX0LDQv9GA0L7RgSDQvdCwINCy0YvQstC+0LQg0LTQtdC90LXQsyDQsdGL0Lsg0YPRgdC/0LXRiNC90L4g0LLRi9C/0L7Qu9C90LXQvS5cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA3MDAwXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoXCIjdG9wIGZvcm1bbmFtZT13aXRoZHJhdy1mb3JtXVwiKVswXS5yZXNldCgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNoYXJpdHkgPSB7XHJcbiAgICAgICAgY29udHJvbDoge1xyXG4gICAgICAgICAgICBldmVudHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChcIiN0b3BcIikuZmluZChcIi5hY2NvdW50LWZ1bmQtdHJhbnNmZXIgLm9wdGlvbiBhXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxmID0gJCh0aGlzKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb24gPSBzZWxmLnBhcmVudCgpLmF0dHIoXCJkYXRhLW9wdGlvbi1wcm9jZXNzXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyID0gXCJcIjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRpdGxlRnVuZCA9IHNlbGYucHJldihcIi50aXRsZVwiKS50ZXh0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIi50by1mdW5kIHNwYW5cIikudGV4dCh0aXRsZUZ1bmQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKFwiI3RvcFwiKS5maW5kKFwiLmFjY291bnQtZnVuZC10cmFuc2ZlciAub3B0aW9uIGFcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJChcIiN0b3BcIikuZmluZChcImZvcm1bbmFtZT1mdW5kLXRyYW5zZmVyLWZvcm1dXCIpLmZpbmQoXCJpbnB1dFtuYW1lPWNoYXJpdHktcHJvY2Vzc11cIikudmFsKG9wdGlvbik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuYWNjb3VudC1mdW5kLXRyYW5zZmVyIC5hdXRvcGF5bWVudC1pbmZvXCIpLmNzcyhcImRpc3BsYXlcIiwgXCJibG9ja1wiKTtcclxuICAgICAgICAgICAgICAgICAgICAkKFwiI3RvcFwiKS5maW5kKFwiZm9ybVtuYW1lPWF1dG9wYXltZW50LWZvcm1dXCIpLmZpbmQoXCJpbnB1dFtuYW1lPWF1dG9wYXltZW50LXVpZF1cIikudmFsKG9wdGlvbik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGFqYXguY29udHJvbC5zZW5kRm9ybURhdGEoXCIjdG9wIGZvcm1bbmFtZT1mdW5kLXRyYW5zZmVyLWZvcm1dXCIsIFwiL2FjY291bnQvZG9icm8vc2VuZFwiLCBcIkZ1bmQgVHJhbnNmZXIgQWpheCBFcnJvclwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgd2l0aGRyYXdTdWNjZXNzID0gbm90eSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiPGI+0J/QvtC30LTRgNCw0LLQu9GP0LXQvCE8L2I+PGJyPtCU0LXQvdC10LbQvdGL0LUg0YHRgNC10LTRgdGC0LLQsCDRg9GB0L/QtdGI0L3QviDQv9C10YDQtdCy0LXQtNC10L3Riy4g0KHQv9Cw0YHQuNCx0L4g0LfQsCDQktCw0YjRgyDQv9C+0LzQvtGJ0YwuINCY0YHRgtC+0YDQuNGOINCS0LDRiNC40YUg0LTQvtCx0YDRi9GFINC00LXQuyDQstGLINC80L7QttC10YLQtSDQv9C+0YHQvNC+0YLRgNC10YLRjCDQsiA8YSBocmVmPScvYWNjb3VudC9jaGFyaXR5Jz7Qu9C40YfQvdC+0Lwg0LrQsNCx0LjQvdC10YLQtTwvYT4uXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNzAwMFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKFwiI3RvcCBmb3JtW25hbWU9ZnVuZC10cmFuc2Zlci1mb3JtXVwiKVswXS5yZXNldCgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgYWpheC5jb250cm9sLnNlbmRGb3JtRGF0YShcIiN0b3AgZm9ybVtuYW1lPWF1dG9wYXltZW50LWZvcm1dXCIsIFwiL2FjY291bnQvZG9icm8vYXV0by1zZW5kXCIsIFwiQXV0byBQYXltZW50IEFqYXggRXJyb3JcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdpdGhkcmF3U3VjY2VzcyA9IG5vdHkoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIjxiPtCf0L7Qt9C00YDQsNCy0LvRj9C10LwhPC9iPjxicj7QkNCy0YLQvtC/0LvQsNGC0ZHQtiDQsdGL0Lsg0YPRgdC/0LXRiNC90L4g0YPRgdGC0LDQvdC+0LLQu9C10L0uXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogJ2FuaW1hdGVkIGZhZGVJbkxlZnQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6ICdhbmltYXRlZCBmbGlwT3V0WCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdzd2luZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogMzAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6ICdyZWxheCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcFJpZ2h0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNzAwMFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgYWpheC5jb250cm9sLnNlbmRGb3JtRGF0YShcIiN0b3AgZm9ybVtuYW1lPWRlbGV0ZS1hdXRvcGF5bWVudC1mb3JtXVwiLCBcIi9hY2NvdW50L2RvYnJvL2F1dG8tZGVsZXRlXCIsIFwiRGVsZXRlIEF1dG8gUGF5bWVudCBBamF4IEVycm9yXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB3aXRoZHJhd1N1Y2Nlc3MgPSBub3R5KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCI8Yj7Qn9C+0LfQtNGA0LDQstC70Y/QtdC8ITwvYj48YnI+0JDQstGC0L7Qv9C70LDRgtGR0LYg0LHRi9C7INGD0YHQv9C10YjQvdC+INGD0LTQsNC70ZHQvS5cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA3MDAwXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoXCIjdG9wXCIpLmZpbmQoXCIuc2VsZi1hdXRvcGF5bWVudFwiKS5wYXJlbnQoKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBzdXBwb3J0ID0ge1xyXG4gICAgICAgIGNvbnRyb2w6IHtcclxuICAgICAgICAgICAgZXZlbnRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGFqYXguY29udHJvbC5zZW5kRm9ybURhdGEoXCIjdG9wIGZvcm1bbmFtZT1zdXBwb3J0LWZvcm1dXCIsIFwiL2FjY291bnQvc3VwcG9ydFwiLCBcIlN1cHBvcnQgQWpheCBFcnJvclwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3VwcG9ydFN1Y2Nlc3MgPSBub3R5KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCI8Yj7Qn9C+0LfQtNGA0LDQstC70Y/QtdC8ITwvYj48YnI+0JfQsNC/0YDQvtGBINCyINGB0LvRg9C20LHRgyDQv9C+0LTQtNC10YDQttC60Lgg0LHRi9C7INGD0YHQv9C10YjQvdC+INC+0YLQv9GA0LDQstC70LXQvS5cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiAnYW5pbWF0ZWQgZmFkZUluTGVmdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogJ2FuaW1hdGVkIGZsaXBPdXRYJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ3N3aW5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWVkOiAzMDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTogJ3JlbGF4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wUmlnaHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA3MDAwXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoXCIjdG9wIGZvcm1bbmFtZT1zdXBwb3J0LWZvcm1dXCIpWzBdLnJlc2V0KCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdXBwb3J0LmNvbnRyb2wuZXZlbnRzKCk7XHJcbiAgICB3aXRoZHJhdy5jb250cm9sLmV2ZW50cygpO1xyXG4gICAgY2hhcml0eS5jb250cm9sLmV2ZW50cygpO1xyXG4gICAgc2V0dGluZ3MuY29udHJvbC5ldmVudHMoKTtcclxuICAgIGJhbGFuY2UuY29udHJvbC5ldmVudHMoKTtcclxuICAgIGhlYWRlci5jb250cm9sLmV2ZW50cygpO1xyXG59KTtcclxuXHJcbiQoZnVuY3Rpb24oKXtcclxuICAgICQoXCJpbnB1dC5saW5rXCIpLmNsaWNrKGZ1bmN0aW9uKCl7XHQvLyDQv9C+0LvRg9GH0LXQvdC40LUg0YTQvtC60YPRgdCwINGC0LXQutGB0YLQvtCy0YvQvCDQv9C+0LvQtdC8LdGB0YHRi9C70LrQvtC5XHJcbiAgICAgICAgJCh0aGlzKS5zZWxlY3QoKTtcclxuICAgIH0pO1xyXG59KTtcclxuXHJcbiQoJ2JvZHknKS5vbignY2xpY2snLCAnLmxpbmstdG8tY2xpcGJvYXJkJywgZnVuY3Rpb24oZSl7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgbGlua1RleHQgPSAkKHRoaXMpLmRhdGEoJ2xpbmsnKTtcclxuICAgIHZhciB0ZXh0ID0gJCh0aGlzKS5kYXRhKCd0ZXh0Jyk7XHJcbiAgICBpZighdGV4dCl7XHJcbiAgICAgICAgdGV4dD0n0JLQsNGI0LAg0L/QsNGA0YLQvdGR0YDRgdC60LDRjyDRgdGB0YvQu9C60LAg0YHQutC+0L/QuNGA0L7QstCw0L3QsCDQsiDQsdGD0YTQtdGAINC+0LHQvNC10L3QsC4g0KPQtNCw0YfQvdC+0Lkg0YDQsNCx0L7RgtGLISc7XHJcbiAgICB9XHJcbiAgICB2YXIgdG1wICAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdJTlBVVCcpO1xyXG4gICAgdG1wLnZhbHVlID0gbGlua1RleHQ7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRtcCk7XHJcbiAgICB0bXAuc2VsZWN0KCk7XHJcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpO1xyXG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0bXApO1xyXG4gICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XHJcbiAgICAgICAgdGl0bGU6ICfQo9GB0L/QtdGI0L3QvicsXHJcbiAgICAgICAgbWVzc2FnZTogdGV4dCxcclxuICAgICAgICB0eXBlOiAnc3VjY2VzcydcclxuICAgIH0pO1xyXG59KTtcclxuXHJcbi8v0LXRgdC70Lgg0L7RgtC60YDRi9GC0L4g0LrQsNC6INC00L7Rh9C10YDQvdC10LVcclxuJChmdW5jdGlvbigpe1xyXG4gICAgaWYoIXdpbmRvdy5vcGVuZXIpcmV0dXJuO1xyXG4gICAgaHJlZj13aW5kb3cub3BlbmVyLmxvY2F0aW9uLmhyZWY7XHJcbiAgICBpZihocmVmLmluZGV4T2YoJ3N0b3JlJyk+MCB8fCBocmVmLmluZGV4T2YoJ2NvdXBvbicpPjApe1xyXG4gICAgICAgIHdpbmRvdy5vcGVuZXIubG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICB9ZWxzZXtcclxuICAgICAgICB3aW5kb3cub3BlbmVyLmxvY2F0aW9uLmhyZWY9bG9jYXRpb24uaHJlZjtcclxuICAgIH1cclxuICAgIHdpbmRvdy5jbG9zZSgpO1xyXG59KTsiLCI7KGZ1bmN0aW9uICggJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkICkge1xyXG5cclxuICAvKipcclxuICAgKiBhbmltbyBpcyBhIHBvd2VyZnVsIGxpdHRsZSB0b29sIHRoYXQgbWFrZXMgbWFuYWdpbmcgQ1NTIGFuaW1hdGlvbnMgZXh0cmVtZWx5IGVhc3kuIFN0YWNrIGFuaW1hdGlvbnMsIHNldCBjYWxsYmFja3MsIG1ha2UgbWFnaWMuXHJcbiAgICogTW9kZXJuIGJyb3dzZXJzIGFuZCBhbG1vc3QgYWxsIG1vYmlsZSBicm93c2VycyBzdXBwb3J0IENTUyBhbmltYXRpb25zIChodHRwOi8vY2FuaXVzZS5jb20vY3NzLWFuaW1hdGlvbikuXHJcbiAgICpcclxuICAgKiBAYXV0aG9yIERhbmllbCBSYWZ0ZXJ5IDogdHdpdHRlci9UaHJpdmluZ0tpbmdzXHJcbiAgICogQHZlcnNpb24gMS4wLjFcclxuICAqL1xyXG4gIGZ1bmN0aW9uIGFuaW1vKCBlbGVtZW50LCBvcHRpb25zLCBjYWxsYmFjaywgb3RoZXJfY2IgKSB7XHJcbiAgICBcclxuICAgIC8vIERlZmF1bHQgY29uZmlndXJhdGlvblxyXG4gICAgdmFyIGRlZmF1bHRzID0ge1xyXG4gICAgXHRkdXJhdGlvbjogMSxcclxuICAgIFx0YW5pbWF0aW9uOiBudWxsLFxyXG4gICAgXHRpdGVyYXRlOiAxLFxyXG4gICAgXHR0aW1pbmc6IFwibGluZWFyXCIsXHJcbiAgICAgIGtlZXA6IGZhbHNlXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEJyb3dzZXIgcHJlZml4ZXMgZm9yIENTU1xyXG4gICAgdGhpcy5wcmVmaXhlcyA9IFtcIlwiLCBcIi1tb3otXCIsIFwiLW8tYW5pbWF0aW9uLVwiLCBcIi13ZWJraXQtXCJdO1xyXG5cclxuICAgIC8vIENhY2hlIHRoZSBlbGVtZW50XHJcbiAgICB0aGlzLmVsZW1lbnQgPSAkKGVsZW1lbnQpO1xyXG5cclxuICAgIHRoaXMuYmFyZSA9IGVsZW1lbnQ7XHJcblxyXG4gICAgLy8gRm9yIHN0YWNraW5nIG9mIGFuaW1hdGlvbnNcclxuICAgIHRoaXMucXVldWUgPSBbXTtcclxuXHJcbiAgICAvLyBIYWNreVxyXG4gICAgdGhpcy5saXN0ZW5pbmcgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBGaWd1cmUgb3V0IHdoZXJlIHRoZSBjYWxsYmFjayBpc1xyXG4gICAgdmFyIGNiID0gKHR5cGVvZiBjYWxsYmFjayA9PSBcImZ1bmN0aW9uXCIgPyBjYWxsYmFjayA6IG90aGVyX2NiKTtcclxuXHJcbiAgICAvLyBPcHRpb25zIGNhbiBzb21ldGltZXMgYmUgYSBjb21tYW5kXHJcbiAgICBzd2l0Y2gob3B0aW9ucykge1xyXG5cclxuICAgICAgY2FzZSBcImJsdXJcIjpcclxuXHJcbiAgICAgIFx0ZGVmYXVsdHMgPSB7XHJcbiAgICAgIFx0XHRhbW91bnQ6IDMsXHJcbiAgICAgIFx0XHRkdXJhdGlvbjogMC41LFxyXG4gICAgICBcdFx0Zm9jdXNBZnRlcjogbnVsbFxyXG4gICAgICBcdH07XHJcblxyXG4gICAgICBcdHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKCBkZWZhdWx0cywgY2FsbGJhY2sgKTtcclxuXHJcbiAgXHQgICAgdGhpcy5fYmx1cihjYik7XHJcblxyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSBcImZvY3VzXCI6XHJcblxyXG4gIFx0ICBcdHRoaXMuX2ZvY3VzKCk7XHJcblxyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSBcInJvdGF0ZVwiOlxyXG5cclxuICAgICAgICBkZWZhdWx0cyA9IHtcclxuICAgICAgICAgIGRlZ3JlZXM6IDE1LFxyXG4gICAgICAgICAgZHVyYXRpb246IDAuNVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKCBkZWZhdWx0cywgY2FsbGJhY2sgKTtcclxuXHJcbiAgICAgICAgdGhpcy5fcm90YXRlKGNiKTtcclxuXHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIFwiY2xlYW5zZVwiOlxyXG5cclxuICAgICAgICB0aGlzLmNsZWFuc2UoKTtcclxuXHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBkZWZhdWx0OlxyXG5cclxuXHQgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoIGRlZmF1bHRzLCBvcHRpb25zICk7XHJcblxyXG5cdCAgICB0aGlzLmluaXQoY2IpO1xyXG4gIFx0XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYW5pbW8ucHJvdG90eXBlID0ge1xyXG5cclxuICAgIC8vIEEgc3RhbmRhcmQgQ1NTIGFuaW1hdGlvblxyXG4gICAgaW5pdDogZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuICAgICAgXHJcbiAgICAgIHZhciAkbWUgPSB0aGlzO1xyXG5cclxuICAgICAgLy8gQXJlIHdlIHN0YWNraW5nIGFuaW1hdGlvbnM/XHJcbiAgICAgIGlmKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCggJG1lLm9wdGlvbnMuYW5pbWF0aW9uICkgPT09ICdbb2JqZWN0IEFycmF5XScpIHtcclxuICAgICAgXHQkLm1lcmdlKCRtZS5xdWV1ZSwgJG1lLm9wdGlvbnMuYW5pbWF0aW9uKTtcclxuICAgICAgfSBlbHNlIHtcclxuXHQgICAgICAkbWUucXVldWUucHVzaCgkbWUub3B0aW9ucy5hbmltYXRpb24pO1xyXG5cdCAgICB9XHJcblxyXG5cdCAgICAkbWUuY2xlYW5zZSgpO1xyXG5cclxuXHQgICAgJG1lLmFuaW1hdGUoY2FsbGJhY2spO1xyXG4gICAgICBcclxuICAgIH0sXHJcblxyXG4gICAgLy8gVGhlIGFjdHVhbCBhZGRpbmcgb2YgdGhlIGNsYXNzIGFuZCBsaXN0ZW5pbmcgZm9yIGNvbXBsZXRpb25cclxuICAgIGFuaW1hdGU6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcblxyXG4gICAgXHR0aGlzLmVsZW1lbnQuYWRkQ2xhc3MoJ2FuaW1hdGVkJyk7XHJcblxyXG4gICAgICB0aGlzLmVsZW1lbnQuYWRkQ2xhc3ModGhpcy5xdWV1ZVswXSk7XHJcblxyXG4gICAgICB0aGlzLmVsZW1lbnQuZGF0YShcImFuaW1vXCIsIHRoaXMucXVldWVbMF0pO1xyXG5cclxuICAgICAgdmFyIGFpID0gdGhpcy5wcmVmaXhlcy5sZW5ndGg7XHJcblxyXG4gICAgICAvLyBBZGQgdGhlIG9wdGlvbnMgZm9yIGVhY2ggcHJlZml4XHJcbiAgICAgIHdoaWxlKGFpLS0pIHtcclxuXHJcbiAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcImFuaW1hdGlvbi1kdXJhdGlvblwiLCB0aGlzLm9wdGlvbnMuZHVyYXRpb24rXCJzXCIpO1xyXG5cclxuICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiYW5pbWF0aW9uLWl0ZXJhdGlvbi1jb3VudFwiLCB0aGlzLm9wdGlvbnMuaXRlcmF0ZSk7XHJcblxyXG4gICAgICBcdHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJhbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uXCIsIHRoaXMub3B0aW9ucy50aW1pbmcpO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyICRtZSA9IHRoaXMsIF9jYiA9IGNhbGxiYWNrO1xyXG5cclxuICAgICAgaWYoJG1lLnF1ZXVlLmxlbmd0aD4xKSB7XHJcbiAgICAgICAgX2NiID0gbnVsbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gTGlzdGVuIGZvciB0aGUgZW5kIG9mIHRoZSBhbmltYXRpb25cclxuICAgICAgdGhpcy5fZW5kKFwiQW5pbWF0aW9uRW5kXCIsIGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAvLyBJZiB0aGVyZSBhcmUgbW9yZSwgY2xlYW4gaXQgdXAgYW5kIG1vdmUgb25cclxuICAgICAgXHRpZigkbWUuZWxlbWVudC5oYXNDbGFzcygkbWUucXVldWVbMF0pKSB7XHJcblxyXG5cdCAgICBcdFx0aWYoISRtZS5vcHRpb25zLmtlZXApIHtcclxuICAgICAgICAgICAgJG1lLmNsZWFuc2UoKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAkbWUucXVldWUuc2hpZnQoKTtcclxuXHJcblx0ICAgIFx0XHRpZigkbWUucXVldWUubGVuZ3RoKSB7XHJcblxyXG5cdFx0ICAgICAgXHQkbWUuYW5pbWF0ZShjYWxsYmFjayk7XHJcblx0XHQgICAgICB9XHJcblx0XHRcdCAgfVxyXG5cdFx0ICB9LCBfY2IpO1xyXG4gICAgfSxcclxuXHJcbiAgICBjbGVhbnNlOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBcdHRoaXMuZWxlbWVudC5yZW1vdmVDbGFzcygnYW5pbWF0ZWQnKTtcclxuXHJcbiAgXHRcdHRoaXMuZWxlbWVudC5yZW1vdmVDbGFzcyh0aGlzLnF1ZXVlWzBdKTtcclxuXHJcbiAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVDbGFzcyh0aGlzLmVsZW1lbnQuZGF0YShcImFuaW1vXCIpKTtcclxuXHJcbiAgXHRcdHZhciBhaSA9IHRoaXMucHJlZml4ZXMubGVuZ3RoO1xyXG5cclxuICBcdFx0d2hpbGUoYWktLSkge1xyXG5cclxuICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiYW5pbWF0aW9uLWR1cmF0aW9uXCIsIFwiXCIpO1xyXG5cclxuICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiYW5pbWF0aW9uLWl0ZXJhdGlvbi1jb3VudFwiLCBcIlwiKTtcclxuXHJcbiAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcImFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb25cIiwgXCJcIik7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJ0cmFuc2l0aW9uXCIsIFwiXCIpO1xyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1widHJhbnNmb3JtXCIsIFwiXCIpO1xyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1wiZmlsdGVyXCIsIFwiXCIpO1xyXG5cclxuICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfYmx1cjogZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuXHJcbiAgICAgIGlmKHRoaXMuZWxlbWVudC5pcyhcImltZ1wiKSkge1xyXG5cclxuICAgICAgXHR2YXIgc3ZnX2lkID0gXCJzdmdfXCIgKyAoKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwMDApIHwgMCkudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKTtcclxuICAgICAgXHR2YXIgZmlsdGVyX2lkID0gXCJmaWx0ZXJfXCIgKyAoKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwMDApIHwgMCkudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKTtcclxuXHJcbiAgICAgIFx0JCgnYm9keScpLmFwcGVuZCgnPHN2ZyB2ZXJzaW9uPVwiMS4xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIGlkPVwiJytzdmdfaWQrJ1wiIHN0eWxlPVwiaGVpZ2h0OjA7XCI+PGZpbHRlciBpZD1cIicrZmlsdGVyX2lkKydcIj48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPVwiJyt0aGlzLm9wdGlvbnMuYW1vdW50KydcIiAvPjwvZmlsdGVyPjwvc3ZnPicpO1xyXG5cclxuICAgICAgXHR2YXIgYWkgPSB0aGlzLnByZWZpeGVzLmxlbmd0aDtcclxuXHJcbiAgICBcdFx0d2hpbGUoYWktLSkge1xyXG5cclxuICAgICAgICBcdHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJmaWx0ZXJcIiwgXCJibHVyKFwiK3RoaXMub3B0aW9ucy5hbW91bnQrXCJweClcIik7XHJcblxyXG4gICAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcInRyYW5zaXRpb25cIiwgdGhpcy5vcHRpb25zLmR1cmF0aW9uK1wicyBhbGwgbGluZWFyXCIpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3MoXCJmaWx0ZXJcIiwgXCJ1cmwoI1wiK2ZpbHRlcl9pZCtcIilcIik7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5kYXRhKFwic3ZnaWRcIiwgc3ZnX2lkKTtcclxuICAgICAgXHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIHZhciBjb2xvciA9IHRoaXMuZWxlbWVudC5jc3MoJ2NvbG9yJyk7XHJcblxyXG4gICAgICAgIHZhciBhaSA9IHRoaXMucHJlZml4ZXMubGVuZ3RoO1xyXG5cclxuICAgICAgICAvLyBBZGQgdGhlIG9wdGlvbnMgZm9yIGVhY2ggcHJlZml4XHJcbiAgICAgICAgd2hpbGUoYWktLSkge1xyXG5cclxuICAgICAgICAgIHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJ0cmFuc2l0aW9uXCIsIFwiYWxsIFwiK3RoaXMub3B0aW9ucy5kdXJhdGlvbitcInMgbGluZWFyXCIpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3MoXCJ0ZXh0LXNoYWRvd1wiLCBcIjAgMCBcIit0aGlzLm9wdGlvbnMuYW1vdW50K1wicHggXCIrY29sb3IpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3MoXCJjb2xvclwiLCBcInRyYW5zcGFyZW50XCIpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLl9lbmQoXCJUcmFuc2l0aW9uRW5kXCIsIG51bGwsIGNhbGxiYWNrKTtcclxuXHJcbiAgICAgIHZhciAkbWUgPSB0aGlzO1xyXG5cclxuICAgICAgaWYodGhpcy5vcHRpb25zLmZvY3VzQWZ0ZXIpIHtcclxuXHJcbiAgICAgICAgdmFyIGZvY3VzX3dhaXQgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAkbWUuX2ZvY3VzKCk7XHJcblxyXG4gICAgICAgICAgZm9jdXNfd2FpdCA9IHdpbmRvdy5jbGVhclRpbWVvdXQoZm9jdXNfd2FpdCk7XHJcblxyXG4gICAgICAgIH0sICh0aGlzLm9wdGlvbnMuZm9jdXNBZnRlcioxMDAwKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIF9mb2N1czogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgXHR2YXIgYWkgPSB0aGlzLnByZWZpeGVzLmxlbmd0aDtcclxuXHJcbiAgICAgIGlmKHRoaXMuZWxlbWVudC5pcyhcImltZ1wiKSkge1xyXG5cclxuICAgIFx0XHR3aGlsZShhaS0tKSB7XHJcblxyXG4gICAgICAgIFx0dGhpcy5lbGVtZW50LmNzcyh0aGlzLnByZWZpeGVzW2FpXStcImZpbHRlclwiLCBcIlwiKTtcclxuXHJcbiAgICAgICAgXHR0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1widHJhbnNpdGlvblwiLCBcIlwiKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgJHN2ZyA9ICQoJyMnK3RoaXMuZWxlbWVudC5kYXRhKCdzdmdpZCcpKTtcclxuXHJcbiAgICAgICAgJHN2Zy5yZW1vdmUoKTtcclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgd2hpbGUoYWktLSkge1xyXG5cclxuICAgICAgICAgIHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJ0cmFuc2l0aW9uXCIsIFwiXCIpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3MoXCJ0ZXh0LXNoYWRvd1wiLCBcIlwiKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKFwiY29sb3JcIiwgXCJcIik7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX3JvdGF0ZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuXHJcbiAgICAgIHZhciBhaSA9IHRoaXMucHJlZml4ZXMubGVuZ3RoO1xyXG5cclxuICAgICAgLy8gQWRkIHRoZSBvcHRpb25zIGZvciBlYWNoIHByZWZpeFxyXG4gICAgICB3aGlsZShhaS0tKSB7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jc3ModGhpcy5wcmVmaXhlc1thaV0rXCJ0cmFuc2l0aW9uXCIsIFwiYWxsIFwiK3RoaXMub3B0aW9ucy5kdXJhdGlvbitcInMgbGluZWFyXCIpO1xyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKHRoaXMucHJlZml4ZXNbYWldK1widHJhbnNmb3JtXCIsIFwicm90YXRlKFwiK3RoaXMub3B0aW9ucy5kZWdyZWVzK1wiZGVnKVwiKTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuX2VuZChcIlRyYW5zaXRpb25FbmRcIiwgbnVsbCwgY2FsbGJhY2spO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgX2VuZDogZnVuY3Rpb24odHlwZSwgdG9kbywgY2FsbGJhY2spIHtcclxuXHJcbiAgICAgIHZhciAkbWUgPSB0aGlzO1xyXG5cclxuICAgICAgdmFyIGJpbmRpbmcgPSB0eXBlLnRvTG93ZXJDYXNlKCkrXCIgd2Via2l0XCIrdHlwZStcIiBvXCIrdHlwZStcIiBNU1wiK3R5cGU7XHJcblxyXG4gICAgICB0aGlzLmVsZW1lbnQuYmluZChiaW5kaW5nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBcclxuICAgICAgICAkbWUuZWxlbWVudC51bmJpbmQoYmluZGluZyk7XHJcblxyXG4gICAgICAgIGlmKHR5cGVvZiB0b2RvID09IFwiZnVuY3Rpb25cIikge1xyXG5cclxuICAgICAgICAgIHRvZG8oKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHR5cGVvZiBjYWxsYmFjayA9PSBcImZ1bmN0aW9uXCIpIHtcclxuXHJcbiAgICAgICAgICBjYWxsYmFjaygkbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIFxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gICQuZm4uYW5pbW8gPSBmdW5jdGlvbiAoIG9wdGlvbnMsIGNhbGxiYWNrLCBvdGhlcl9jYiApIHtcclxuICAgIFxyXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHJcblx0XHRcdG5ldyBhbmltbyggdGhpcywgb3B0aW9ucywgY2FsbGJhY2ssIG90aGVyX2NiICk7XHJcblxyXG5cdFx0fSk7XHJcblxyXG4gIH07XHJcblxyXG59KSggalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50ICk7IiwiLyohXHJcbiAqIE1vY2tKYXggLSBqUXVlcnkgUGx1Z2luIHRvIE1vY2sgQWpheCByZXF1ZXN0c1xyXG4gKlxyXG4gKiBWZXJzaW9uOiAgMS41LjNcclxuICogUmVsZWFzZWQ6XHJcbiAqIEhvbWU6ICAgaHR0cDovL2dpdGh1Yi5jb20vYXBwZW5kdG8vanF1ZXJ5LW1vY2tqYXhcclxuICogQXV0aG9yOiAgIEpvbmF0aGFuIFNoYXJwIChodHRwOi8vamRzaGFycC5jb20pXHJcbiAqIExpY2Vuc2U6ICBNSVQsR1BMXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAxMSBhcHBlbmRUbyBMTEMuXHJcbiAqIER1YWwgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBvciBHUEwgbGljZW5zZXMuXHJcbiAqIGh0dHA6Ly9hcHBlbmR0by5jb20vb3Blbi1zb3VyY2UtbGljZW5zZXNcclxuICovXHJcbihmdW5jdGlvbigkKSB7XHJcblx0dmFyIF9hamF4ID0gJC5hamF4LFxyXG5cdFx0bW9ja0hhbmRsZXJzID0gW10sXHJcblx0XHRtb2NrZWRBamF4Q2FsbHMgPSBbXSxcclxuXHRcdENBTExCQUNLX1JFR0VYID0gLz1cXD8oJnwkKS8sXHJcblx0XHRqc2MgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpO1xyXG5cclxuXHJcblx0Ly8gUGFyc2UgdGhlIGdpdmVuIFhNTCBzdHJpbmcuXHJcblx0ZnVuY3Rpb24gcGFyc2VYTUwoeG1sKSB7XHJcblx0XHRpZiAoIHdpbmRvdy5ET01QYXJzZXIgPT0gdW5kZWZpbmVkICYmIHdpbmRvdy5BY3RpdmVYT2JqZWN0ICkge1xyXG5cdFx0XHRET01QYXJzZXIgPSBmdW5jdGlvbigpIHsgfTtcclxuXHRcdFx0RE9NUGFyc2VyLnByb3RvdHlwZS5wYXJzZUZyb21TdHJpbmcgPSBmdW5jdGlvbiggeG1sU3RyaW5nICkge1xyXG5cdFx0XHRcdHZhciBkb2MgPSBuZXcgQWN0aXZlWE9iamVjdCgnTWljcm9zb2Z0LlhNTERPTScpO1xyXG5cdFx0XHRcdGRvYy5hc3luYyA9ICdmYWxzZSc7XHJcblx0XHRcdFx0ZG9jLmxvYWRYTUwoIHhtbFN0cmluZyApO1xyXG5cdFx0XHRcdHJldHVybiBkb2M7XHJcblx0XHRcdH07XHJcblx0XHR9XHJcblxyXG5cdFx0dHJ5IHtcclxuXHRcdFx0dmFyIHhtbERvYyA9ICggbmV3IERPTVBhcnNlcigpICkucGFyc2VGcm9tU3RyaW5nKCB4bWwsICd0ZXh0L3htbCcgKTtcclxuXHRcdFx0aWYgKCAkLmlzWE1MRG9jKCB4bWxEb2MgKSApIHtcclxuXHRcdFx0XHR2YXIgZXJyID0gJCgncGFyc2VyZXJyb3InLCB4bWxEb2MpO1xyXG5cdFx0XHRcdGlmICggZXJyLmxlbmd0aCA9PSAxICkge1xyXG5cdFx0XHRcdFx0dGhyb3coJ0Vycm9yOiAnICsgJCh4bWxEb2MpLnRleHQoKSApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aHJvdygnVW5hYmxlIHRvIHBhcnNlIFhNTCcpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB4bWxEb2M7XHJcblx0XHR9IGNhdGNoKCBlICkge1xyXG5cdFx0XHR2YXIgbXNnID0gKCBlLm5hbWUgPT0gdW5kZWZpbmVkID8gZSA6IGUubmFtZSArICc6ICcgKyBlLm1lc3NhZ2UgKTtcclxuXHRcdFx0JChkb2N1bWVudCkudHJpZ2dlcigneG1sUGFyc2VFcnJvcicsIFsgbXNnIF0pO1xyXG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gVHJpZ2dlciBhIGpRdWVyeSBldmVudFxyXG5cdGZ1bmN0aW9uIHRyaWdnZXIocywgdHlwZSwgYXJncykge1xyXG5cdFx0KHMuY29udGV4dCA/ICQocy5jb250ZXh0KSA6ICQuZXZlbnQpLnRyaWdnZXIodHlwZSwgYXJncyk7XHJcblx0fVxyXG5cclxuXHQvLyBDaGVjayBpZiB0aGUgZGF0YSBmaWVsZCBvbiB0aGUgbW9jayBoYW5kbGVyIGFuZCB0aGUgcmVxdWVzdCBtYXRjaC4gVGhpc1xyXG5cdC8vIGNhbiBiZSB1c2VkIHRvIHJlc3RyaWN0IGEgbW9jayBoYW5kbGVyIHRvIGJlaW5nIHVzZWQgb25seSB3aGVuIGEgY2VydGFpblxyXG5cdC8vIHNldCBvZiBkYXRhIGlzIHBhc3NlZCB0byBpdC5cclxuXHRmdW5jdGlvbiBpc01vY2tEYXRhRXF1YWwoIG1vY2ssIGxpdmUgKSB7XHJcblx0XHR2YXIgaWRlbnRpY2FsID0gdHJ1ZTtcclxuXHRcdC8vIFRlc3QgZm9yIHNpdHVhdGlvbnMgd2hlcmUgdGhlIGRhdGEgaXMgYSBxdWVyeXN0cmluZyAobm90IGFuIG9iamVjdClcclxuXHRcdGlmICh0eXBlb2YgbGl2ZSA9PT0gJ3N0cmluZycpIHtcclxuXHRcdFx0Ly8gUXVlcnlzdHJpbmcgbWF5IGJlIGEgcmVnZXhcclxuXHRcdFx0cmV0dXJuICQuaXNGdW5jdGlvbiggbW9jay50ZXN0ICkgPyBtb2NrLnRlc3QobGl2ZSkgOiBtb2NrID09IGxpdmU7XHJcblx0XHR9XHJcblx0XHQkLmVhY2gobW9jaywgZnVuY3Rpb24oaykge1xyXG5cdFx0XHRpZiAoIGxpdmVba10gPT09IHVuZGVmaW5lZCApIHtcclxuXHRcdFx0XHRpZGVudGljYWwgPSBmYWxzZTtcclxuXHRcdFx0XHRyZXR1cm4gaWRlbnRpY2FsO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmICggdHlwZW9mIGxpdmVba10gPT09ICdvYmplY3QnICYmIGxpdmVba10gIT09IG51bGwgKSB7XHJcblx0XHRcdFx0XHRpZiAoIGlkZW50aWNhbCAmJiAkLmlzQXJyYXkoIGxpdmVba10gKSApIHtcclxuXHRcdFx0XHRcdFx0aWRlbnRpY2FsID0gJC5pc0FycmF5KCBtb2NrW2tdICkgJiYgbGl2ZVtrXS5sZW5ndGggPT09IG1vY2tba10ubGVuZ3RoO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWRlbnRpY2FsID0gaWRlbnRpY2FsICYmIGlzTW9ja0RhdGFFcXVhbChtb2NrW2tdLCBsaXZlW2tdKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0aWYgKCBtb2NrW2tdICYmICQuaXNGdW5jdGlvbiggbW9ja1trXS50ZXN0ICkgKSB7XHJcblx0XHRcdFx0XHRcdGlkZW50aWNhbCA9IGlkZW50aWNhbCAmJiBtb2NrW2tdLnRlc3QobGl2ZVtrXSk7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRpZGVudGljYWwgPSBpZGVudGljYWwgJiYgKCBtb2NrW2tdID09IGxpdmVba10gKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdHJldHVybiBpZGVudGljYWw7XHJcblx0fVxyXG5cclxuICAgIC8vIFNlZSBpZiBhIG1vY2sgaGFuZGxlciBwcm9wZXJ0eSBtYXRjaGVzIHRoZSBkZWZhdWx0IHNldHRpbmdzXHJcbiAgICBmdW5jdGlvbiBpc0RlZmF1bHRTZXR0aW5nKGhhbmRsZXIsIHByb3BlcnR5KSB7XHJcbiAgICAgICAgcmV0dXJuIGhhbmRsZXJbcHJvcGVydHldID09PSAkLm1vY2tqYXhTZXR0aW5nc1twcm9wZXJ0eV07XHJcbiAgICB9XHJcblxyXG5cdC8vIENoZWNrIHRoZSBnaXZlbiBoYW5kbGVyIHNob3VsZCBtb2NrIHRoZSBnaXZlbiByZXF1ZXN0XHJcblx0ZnVuY3Rpb24gZ2V0TW9ja0ZvclJlcXVlc3QoIGhhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncyApIHtcclxuXHRcdC8vIElmIHRoZSBtb2NrIHdhcyByZWdpc3RlcmVkIHdpdGggYSBmdW5jdGlvbiwgbGV0IHRoZSBmdW5jdGlvbiBkZWNpZGUgaWYgd2VcclxuXHRcdC8vIHdhbnQgdG8gbW9jayB0aGlzIHJlcXVlc3RcclxuXHRcdGlmICggJC5pc0Z1bmN0aW9uKGhhbmRsZXIpICkge1xyXG5cdFx0XHRyZXR1cm4gaGFuZGxlciggcmVxdWVzdFNldHRpbmdzICk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gSW5zcGVjdCB0aGUgVVJMIG9mIHRoZSByZXF1ZXN0IGFuZCBjaGVjayBpZiB0aGUgbW9jayBoYW5kbGVyJ3MgdXJsXHJcblx0XHQvLyBtYXRjaGVzIHRoZSB1cmwgZm9yIHRoaXMgYWpheCByZXF1ZXN0XHJcblx0XHRpZiAoICQuaXNGdW5jdGlvbihoYW5kbGVyLnVybC50ZXN0KSApIHtcclxuXHRcdFx0Ly8gVGhlIHVzZXIgcHJvdmlkZWQgYSByZWdleCBmb3IgdGhlIHVybCwgdGVzdCBpdFxyXG5cdFx0XHRpZiAoICFoYW5kbGVyLnVybC50ZXN0KCByZXF1ZXN0U2V0dGluZ3MudXJsICkgKSB7XHJcblx0XHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIExvb2sgZm9yIGEgc2ltcGxlIHdpbGRjYXJkICcqJyBvciBhIGRpcmVjdCBVUkwgbWF0Y2hcclxuXHRcdFx0dmFyIHN0YXIgPSBoYW5kbGVyLnVybC5pbmRleE9mKCcqJyk7XHJcblx0XHRcdGlmIChoYW5kbGVyLnVybCAhPT0gcmVxdWVzdFNldHRpbmdzLnVybCAmJiBzdGFyID09PSAtMSB8fFxyXG5cdFx0XHRcdFx0IW5ldyBSZWdFeHAoaGFuZGxlci51cmwucmVwbGFjZSgvWy1bXFxde30oKSs/LixcXFxcXiR8I1xcc10vZywgXCJcXFxcJCZcIikucmVwbGFjZSgvXFwqL2csICcuKycpKS50ZXN0KHJlcXVlc3RTZXR0aW5ncy51cmwpKSB7XHJcblx0XHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvLyBJbnNwZWN0IHRoZSBkYXRhIHN1Ym1pdHRlZCBpbiB0aGUgcmVxdWVzdCAoZWl0aGVyIFBPU1QgYm9keSBvciBHRVQgcXVlcnkgc3RyaW5nKVxyXG5cdFx0aWYgKCBoYW5kbGVyLmRhdGEgKSB7XHJcblx0XHRcdGlmICggISByZXF1ZXN0U2V0dGluZ3MuZGF0YSB8fCAhaXNNb2NrRGF0YUVxdWFsKGhhbmRsZXIuZGF0YSwgcmVxdWVzdFNldHRpbmdzLmRhdGEpICkge1xyXG5cdFx0XHRcdC8vIFRoZXkncmUgbm90IGlkZW50aWNhbCwgZG8gbm90IG1vY2sgdGhpcyByZXF1ZXN0XHJcblx0XHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8vIEluc3BlY3QgdGhlIHJlcXVlc3QgdHlwZVxyXG5cdFx0aWYgKCBoYW5kbGVyICYmIGhhbmRsZXIudHlwZSAmJlxyXG5cdFx0XHRcdGhhbmRsZXIudHlwZS50b0xvd2VyQ2FzZSgpICE9IHJlcXVlc3RTZXR0aW5ncy50eXBlLnRvTG93ZXJDYXNlKCkgKSB7XHJcblx0XHRcdC8vIFRoZSByZXF1ZXN0IHR5cGUgZG9lc24ndCBtYXRjaCAoR0VUIHZzLiBQT1NUKVxyXG5cdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gaGFuZGxlcjtcclxuXHR9XHJcblxyXG5cdC8vIFByb2Nlc3MgdGhlIHhociBvYmplY3RzIHNlbmQgb3BlcmF0aW9uXHJcblx0ZnVuY3Rpb24gX3hoclNlbmQobW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncywgb3JpZ1NldHRpbmdzKSB7XHJcblxyXG5cdFx0Ly8gVGhpcyBpcyBhIHN1YnN0aXR1dGUgZm9yIDwgMS40IHdoaWNoIGxhY2tzICQucHJveHlcclxuXHRcdHZhciBwcm9jZXNzID0gKGZ1bmN0aW9uKHRoYXQpIHtcclxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHJldHVybiAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHR2YXIgb25SZWFkeTtcclxuXHJcblx0XHRcdFx0XHQvLyBUaGUgcmVxdWVzdCBoYXMgcmV0dXJuZWRcclxuXHRcdFx0XHRcdHRoaXMuc3RhdHVzICAgICA9IG1vY2tIYW5kbGVyLnN0YXR1cztcclxuXHRcdFx0XHRcdHRoaXMuc3RhdHVzVGV4dCA9IG1vY2tIYW5kbGVyLnN0YXR1c1RleHQ7XHJcblx0XHRcdFx0XHR0aGlzLnJlYWR5U3RhdGVcdD0gNDtcclxuXHJcblx0XHRcdFx0XHQvLyBXZSBoYXZlIGFuIGV4ZWN1dGFibGUgZnVuY3Rpb24sIGNhbGwgaXQgdG8gZ2l2ZVxyXG5cdFx0XHRcdFx0Ly8gdGhlIG1vY2sgaGFuZGxlciBhIGNoYW5jZSB0byB1cGRhdGUgaXQncyBkYXRhXHJcblx0XHRcdFx0XHRpZiAoICQuaXNGdW5jdGlvbihtb2NrSGFuZGxlci5yZXNwb25zZSkgKSB7XHJcblx0XHRcdFx0XHRcdG1vY2tIYW5kbGVyLnJlc3BvbnNlKG9yaWdTZXR0aW5ncyk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvLyBDb3B5IG92ZXIgb3VyIG1vY2sgdG8gb3VyIHhociBvYmplY3QgYmVmb3JlIHBhc3NpbmcgY29udHJvbCBiYWNrIHRvXHJcblx0XHRcdFx0XHQvLyBqUXVlcnkncyBvbnJlYWR5c3RhdGVjaGFuZ2UgY2FsbGJhY2tcclxuXHRcdFx0XHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlID09ICdqc29uJyAmJiAoIHR5cGVvZiBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgPT0gJ29iamVjdCcgKSApIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5yZXNwb25zZVRleHQgPSBKU09OLnN0cmluZ2lmeShtb2NrSGFuZGxlci5yZXNwb25zZVRleHQpO1xyXG5cdFx0XHRcdFx0fSBlbHNlIGlmICggcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlID09ICd4bWwnICkge1xyXG5cdFx0XHRcdFx0XHRpZiAoIHR5cGVvZiBtb2NrSGFuZGxlci5yZXNwb25zZVhNTCA9PSAnc3RyaW5nJyApIHtcclxuXHRcdFx0XHRcdFx0XHR0aGlzLnJlc3BvbnNlWE1MID0gcGFyc2VYTUwobW9ja0hhbmRsZXIucmVzcG9uc2VYTUwpO1xyXG5cdFx0XHRcdFx0XHRcdC8vaW4galF1ZXJ5IDEuOS4xKywgcmVzcG9uc2VYTUwgaXMgcHJvY2Vzc2VkIGRpZmZlcmVudGx5IGFuZCByZWxpZXMgb24gcmVzcG9uc2VUZXh0XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5yZXNwb25zZVRleHQgPSBtb2NrSGFuZGxlci5yZXNwb25zZVhNTDtcclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHR0aGlzLnJlc3BvbnNlWE1MID0gbW9ja0hhbmRsZXIucmVzcG9uc2VYTUw7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2VUZXh0ID0gbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0O1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWYoIHR5cGVvZiBtb2NrSGFuZGxlci5zdGF0dXMgPT0gJ251bWJlcicgfHwgdHlwZW9mIG1vY2tIYW5kbGVyLnN0YXR1cyA9PSAnc3RyaW5nJyApIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5zdGF0dXMgPSBtb2NrSGFuZGxlci5zdGF0dXM7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZiggdHlwZW9mIG1vY2tIYW5kbGVyLnN0YXR1c1RleHQgPT09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5zdGF0dXNUZXh0ID0gbW9ja0hhbmRsZXIuc3RhdHVzVGV4dDtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8vIGpRdWVyeSAyLjAgcmVuYW1lZCBvbnJlYWR5c3RhdGVjaGFuZ2UgdG8gb25sb2FkXHJcblx0XHRcdFx0XHRvblJlYWR5ID0gdGhpcy5vbnJlYWR5c3RhdGVjaGFuZ2UgfHwgdGhpcy5vbmxvYWQ7XHJcblxyXG5cdFx0XHRcdFx0Ly8galF1ZXJ5IDwgMS40IGRvZXNuJ3QgaGF2ZSBvbnJlYWR5c3RhdGUgY2hhbmdlIGZvciB4aHJcclxuXHRcdFx0XHRcdGlmICggJC5pc0Z1bmN0aW9uKCBvblJlYWR5ICkgKSB7XHJcblx0XHRcdFx0XHRcdGlmKCBtb2NrSGFuZGxlci5pc1RpbWVvdXQpIHtcclxuXHRcdFx0XHRcdFx0XHR0aGlzLnN0YXR1cyA9IC0xO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdG9uUmVhZHkuY2FsbCggdGhpcywgbW9ja0hhbmRsZXIuaXNUaW1lb3V0ID8gJ3RpbWVvdXQnIDogdW5kZWZpbmVkICk7XHJcblx0XHRcdFx0XHR9IGVsc2UgaWYgKCBtb2NrSGFuZGxlci5pc1RpbWVvdXQgKSB7XHJcblx0XHRcdFx0XHRcdC8vIEZpeCBmb3IgMS4zLjIgdGltZW91dCB0byBrZWVwIHN1Y2Nlc3MgZnJvbSBmaXJpbmcuXHJcblx0XHRcdFx0XHRcdHRoaXMuc3RhdHVzID0gLTE7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSkuYXBwbHkodGhhdCk7XHJcblx0XHRcdH07XHJcblx0XHR9KSh0aGlzKTtcclxuXHJcblx0XHRpZiAoIG1vY2tIYW5kbGVyLnByb3h5ICkge1xyXG5cdFx0XHQvLyBXZSdyZSBwcm94eWluZyB0aGlzIHJlcXVlc3QgYW5kIGxvYWRpbmcgaW4gYW4gZXh0ZXJuYWwgZmlsZSBpbnN0ZWFkXHJcblx0XHRcdF9hamF4KHtcclxuXHRcdFx0XHRnbG9iYWw6IGZhbHNlLFxyXG5cdFx0XHRcdHVybDogbW9ja0hhbmRsZXIucHJveHksXHJcblx0XHRcdFx0dHlwZTogbW9ja0hhbmRsZXIucHJveHlUeXBlLFxyXG5cdFx0XHRcdGRhdGE6IG1vY2tIYW5kbGVyLmRhdGEsXHJcblx0XHRcdFx0ZGF0YVR5cGU6IHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSA9PT0gXCJzY3JpcHRcIiA/IFwidGV4dC9wbGFpblwiIDogcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlLFxyXG5cdFx0XHRcdGNvbXBsZXRlOiBmdW5jdGlvbih4aHIpIHtcclxuXHRcdFx0XHRcdG1vY2tIYW5kbGVyLnJlc3BvbnNlWE1MID0geGhyLnJlc3BvbnNlWE1MO1xyXG5cdFx0XHRcdFx0bW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ID0geGhyLnJlc3BvbnNlVGV4dDtcclxuICAgICAgICAgICAgICAgICAgICAvLyBEb24ndCBvdmVycmlkZSB0aGUgaGFuZGxlciBzdGF0dXMvc3RhdHVzVGV4dCBpZiBpdCdzIHNwZWNpZmllZCBieSB0aGUgY29uZmlnXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzRGVmYXVsdFNldHRpbmcobW9ja0hhbmRsZXIsICdzdGF0dXMnKSkge1xyXG5cdFx0XHRcdFx0ICAgIG1vY2tIYW5kbGVyLnN0YXR1cyA9IHhoci5zdGF0dXM7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0RlZmF1bHRTZXR0aW5nKG1vY2tIYW5kbGVyLCAnc3RhdHVzVGV4dCcpKSB7XHJcblx0XHRcdFx0XHQgICAgbW9ja0hhbmRsZXIuc3RhdHVzVGV4dCA9IHhoci5zdGF0dXNUZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcblx0XHRcdFx0XHR0aGlzLnJlc3BvbnNlVGltZXIgPSBzZXRUaW1lb3V0KHByb2Nlc3MsIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGltZSB8fCAwKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gdHlwZSA9PSAnUE9TVCcgfHwgJ0dFVCcgfHwgJ0RFTEVURSdcclxuXHRcdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuYXN5bmMgPT09IGZhbHNlICkge1xyXG5cdFx0XHRcdC8vIFRPRE86IEJsb2NraW5nIGRlbGF5XHJcblx0XHRcdFx0cHJvY2VzcygpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMucmVzcG9uc2VUaW1lciA9IHNldFRpbWVvdXQocHJvY2VzcywgbW9ja0hhbmRsZXIucmVzcG9uc2VUaW1lIHx8IDUwKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gQ29uc3RydWN0IGEgbW9ja2VkIFhIUiBPYmplY3RcclxuXHRmdW5jdGlvbiB4aHIobW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncywgb3JpZ1NldHRpbmdzLCBvcmlnSGFuZGxlcikge1xyXG5cdFx0Ly8gRXh0ZW5kIHdpdGggb3VyIGRlZmF1bHQgbW9ja2pheCBzZXR0aW5nc1xyXG5cdFx0bW9ja0hhbmRsZXIgPSAkLmV4dGVuZCh0cnVlLCB7fSwgJC5tb2NramF4U2V0dGluZ3MsIG1vY2tIYW5kbGVyKTtcclxuXHJcblx0XHRpZiAodHlwZW9mIG1vY2tIYW5kbGVyLmhlYWRlcnMgPT09ICd1bmRlZmluZWQnKSB7XHJcblx0XHRcdG1vY2tIYW5kbGVyLmhlYWRlcnMgPSB7fTtcclxuXHRcdH1cclxuXHRcdGlmICggbW9ja0hhbmRsZXIuY29udGVudFR5cGUgKSB7XHJcblx0XHRcdG1vY2tIYW5kbGVyLmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddID0gbW9ja0hhbmRsZXIuY29udGVudFR5cGU7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0c3RhdHVzOiBtb2NrSGFuZGxlci5zdGF0dXMsXHJcblx0XHRcdHN0YXR1c1RleHQ6IG1vY2tIYW5kbGVyLnN0YXR1c1RleHQsXHJcblx0XHRcdHJlYWR5U3RhdGU6IDEsXHJcblx0XHRcdG9wZW46IGZ1bmN0aW9uKCkgeyB9LFxyXG5cdFx0XHRzZW5kOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRvcmlnSGFuZGxlci5maXJlZCA9IHRydWU7XHJcblx0XHRcdFx0X3hoclNlbmQuY2FsbCh0aGlzLCBtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRhYm9ydDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHRoaXMucmVzcG9uc2VUaW1lcik7XHJcblx0XHRcdH0sXHJcblx0XHRcdHNldFJlcXVlc3RIZWFkZXI6IGZ1bmN0aW9uKGhlYWRlciwgdmFsdWUpIHtcclxuXHRcdFx0XHRtb2NrSGFuZGxlci5oZWFkZXJzW2hlYWRlcl0gPSB2YWx1ZTtcclxuXHRcdFx0fSxcclxuXHRcdFx0Z2V0UmVzcG9uc2VIZWFkZXI6IGZ1bmN0aW9uKGhlYWRlcikge1xyXG5cdFx0XHRcdC8vICdMYXN0LW1vZGlmaWVkJywgJ0V0YWcnLCAnY29udGVudC10eXBlJyBhcmUgYWxsIGNoZWNrZWQgYnkgalF1ZXJ5XHJcblx0XHRcdFx0aWYgKCBtb2NrSGFuZGxlci5oZWFkZXJzICYmIG1vY2tIYW5kbGVyLmhlYWRlcnNbaGVhZGVyXSApIHtcclxuXHRcdFx0XHRcdC8vIFJldHVybiBhcmJpdHJhcnkgaGVhZGVyc1xyXG5cdFx0XHRcdFx0cmV0dXJuIG1vY2tIYW5kbGVyLmhlYWRlcnNbaGVhZGVyXTtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKCBoZWFkZXIudG9Mb3dlckNhc2UoKSA9PSAnbGFzdC1tb2RpZmllZCcgKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gbW9ja0hhbmRsZXIubGFzdE1vZGlmaWVkIHx8IChuZXcgRGF0ZSgpKS50b1N0cmluZygpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAoIGhlYWRlci50b0xvd2VyQ2FzZSgpID09ICdldGFnJyApIHtcclxuXHRcdFx0XHRcdHJldHVybiBtb2NrSGFuZGxlci5ldGFnIHx8ICcnO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAoIGhlYWRlci50b0xvd2VyQ2FzZSgpID09ICdjb250ZW50LXR5cGUnICkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIG1vY2tIYW5kbGVyLmNvbnRlbnRUeXBlIHx8ICd0ZXh0L3BsYWluJztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sXHJcblx0XHRcdGdldEFsbFJlc3BvbnNlSGVhZGVyczogZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0dmFyIGhlYWRlcnMgPSAnJztcclxuXHRcdFx0XHQkLmVhY2gobW9ja0hhbmRsZXIuaGVhZGVycywgZnVuY3Rpb24oaywgdikge1xyXG5cdFx0XHRcdFx0aGVhZGVycyArPSBrICsgJzogJyArIHYgKyBcIlxcblwiO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdHJldHVybiBoZWFkZXJzO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0Ly8gUHJvY2VzcyBhIEpTT05QIG1vY2sgcmVxdWVzdC5cclxuXHRmdW5jdGlvbiBwcm9jZXNzSnNvbnBNb2NrKCByZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MgKSB7XHJcblx0XHQvLyBIYW5kbGUgSlNPTlAgUGFyYW1ldGVyIENhbGxiYWNrcywgd2UgbmVlZCB0byByZXBsaWNhdGUgc29tZSBvZiB0aGUgalF1ZXJ5IGNvcmUgaGVyZVxyXG5cdFx0Ly8gYmVjYXVzZSB0aGVyZSBpc24ndCBhbiBlYXN5IGhvb2sgZm9yIHRoZSBjcm9zcyBkb21haW4gc2NyaXB0IHRhZyBvZiBqc29ucFxyXG5cclxuXHRcdHByb2Nlc3NKc29ucFVybCggcmVxdWVzdFNldHRpbmdzICk7XHJcblxyXG5cdFx0cmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlID0gXCJqc29uXCI7XHJcblx0XHRpZihyZXF1ZXN0U2V0dGluZ3MuZGF0YSAmJiBDQUxMQkFDS19SRUdFWC50ZXN0KHJlcXVlc3RTZXR0aW5ncy5kYXRhKSB8fCBDQUxMQkFDS19SRUdFWC50ZXN0KHJlcXVlc3RTZXR0aW5ncy51cmwpKSB7XHJcblx0XHRcdGNyZWF0ZUpzb25wQ2FsbGJhY2socmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzKTtcclxuXHJcblx0XHRcdC8vIFdlIG5lZWQgdG8gbWFrZSBzdXJlXHJcblx0XHRcdC8vIHRoYXQgYSBKU09OUCBzdHlsZSByZXNwb25zZSBpcyBleGVjdXRlZCBwcm9wZXJseVxyXG5cclxuXHRcdFx0dmFyIHJ1cmwgPSAvXihcXHcrOik/XFwvXFwvKFteXFwvPyNdKykvLFxyXG5cdFx0XHRcdHBhcnRzID0gcnVybC5leGVjKCByZXF1ZXN0U2V0dGluZ3MudXJsICksXHJcblx0XHRcdFx0cmVtb3RlID0gcGFydHMgJiYgKHBhcnRzWzFdICYmIHBhcnRzWzFdICE9PSBsb2NhdGlvbi5wcm90b2NvbCB8fCBwYXJ0c1syXSAhPT0gbG9jYXRpb24uaG9zdCk7XHJcblxyXG5cdFx0XHRyZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgPSBcInNjcmlwdFwiO1xyXG5cdFx0XHRpZihyZXF1ZXN0U2V0dGluZ3MudHlwZS50b1VwcGVyQ2FzZSgpID09PSBcIkdFVFwiICYmIHJlbW90ZSApIHtcclxuXHRcdFx0XHR2YXIgbmV3TW9ja1JldHVybiA9IHByb2Nlc3NKc29ucFJlcXVlc3QoIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyApO1xyXG5cclxuXHRcdFx0XHQvLyBDaGVjayBpZiB3ZSBhcmUgc3VwcG9zZWQgdG8gcmV0dXJuIGEgRGVmZXJyZWQgYmFjayB0byB0aGUgbW9jayBjYWxsLCBvciBqdXN0XHJcblx0XHRcdFx0Ly8gc2lnbmFsIHN1Y2Nlc3NcclxuXHRcdFx0XHRpZihuZXdNb2NrUmV0dXJuKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gbmV3TW9ja1JldHVybjtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gbnVsbDtcclxuXHR9XHJcblxyXG5cdC8vIEFwcGVuZCB0aGUgcmVxdWlyZWQgY2FsbGJhY2sgcGFyYW1ldGVyIHRvIHRoZSBlbmQgb2YgdGhlIHJlcXVlc3QgVVJMLCBmb3IgYSBKU09OUCByZXF1ZXN0XHJcblx0ZnVuY3Rpb24gcHJvY2Vzc0pzb25wVXJsKCByZXF1ZXN0U2V0dGluZ3MgKSB7XHJcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy50eXBlLnRvVXBwZXJDYXNlKCkgPT09IFwiR0VUXCIgKSB7XHJcblx0XHRcdGlmICggIUNBTExCQUNLX1JFR0VYLnRlc3QoIHJlcXVlc3RTZXR0aW5ncy51cmwgKSApIHtcclxuXHRcdFx0XHRyZXF1ZXN0U2V0dGluZ3MudXJsICs9ICgvXFw/Ly50ZXN0KCByZXF1ZXN0U2V0dGluZ3MudXJsICkgPyBcIiZcIiA6IFwiP1wiKSArXHJcblx0XHRcdFx0XHQocmVxdWVzdFNldHRpbmdzLmpzb25wIHx8IFwiY2FsbGJhY2tcIikgKyBcIj0/XCI7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSBpZiAoICFyZXF1ZXN0U2V0dGluZ3MuZGF0YSB8fCAhQ0FMTEJBQ0tfUkVHRVgudGVzdChyZXF1ZXN0U2V0dGluZ3MuZGF0YSkgKSB7XHJcblx0XHRcdHJlcXVlc3RTZXR0aW5ncy5kYXRhID0gKHJlcXVlc3RTZXR0aW5ncy5kYXRhID8gcmVxdWVzdFNldHRpbmdzLmRhdGEgKyBcIiZcIiA6IFwiXCIpICsgKHJlcXVlc3RTZXR0aW5ncy5qc29ucCB8fCBcImNhbGxiYWNrXCIpICsgXCI9P1wiO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gUHJvY2VzcyBhIEpTT05QIHJlcXVlc3QgYnkgZXZhbHVhdGluZyB0aGUgbW9ja2VkIHJlc3BvbnNlIHRleHRcclxuXHRmdW5jdGlvbiBwcm9jZXNzSnNvbnBSZXF1ZXN0KCByZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MgKSB7XHJcblx0XHQvLyBTeW50aGVzaXplIHRoZSBtb2NrIHJlcXVlc3QgZm9yIGFkZGluZyBhIHNjcmlwdCB0YWdcclxuXHRcdHZhciBjYWxsYmFja0NvbnRleHQgPSBvcmlnU2V0dGluZ3MgJiYgb3JpZ1NldHRpbmdzLmNvbnRleHQgfHwgcmVxdWVzdFNldHRpbmdzLFxyXG5cdFx0XHRuZXdNb2NrID0gbnVsbDtcclxuXHJcblxyXG5cdFx0Ly8gSWYgdGhlIHJlc3BvbnNlIGhhbmRsZXIgb24gdGhlIG1vb2NrIGlzIGEgZnVuY3Rpb24sIGNhbGwgaXRcclxuXHRcdGlmICggbW9ja0hhbmRsZXIucmVzcG9uc2UgJiYgJC5pc0Z1bmN0aW9uKG1vY2tIYW5kbGVyLnJlc3BvbnNlKSApIHtcclxuXHRcdFx0bW9ja0hhbmRsZXIucmVzcG9uc2Uob3JpZ1NldHRpbmdzKTtcclxuXHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHQvLyBFdmFsdWF0ZSB0aGUgcmVzcG9uc2VUZXh0IGphdmFzY3JpcHQgaW4gYSBnbG9iYWwgY29udGV4dFxyXG5cdFx0XHRpZiggdHlwZW9mIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCA9PT0gJ29iamVjdCcgKSB7XHJcblx0XHRcdFx0JC5nbG9iYWxFdmFsKCAnKCcgKyBKU09OLnN0cmluZ2lmeSggbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ICkgKyAnKScpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCQuZ2xvYmFsRXZhbCggJygnICsgbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ICsgJyknKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFN1Y2Nlc3NmdWwgcmVzcG9uc2VcclxuXHRcdGpzb25wU3VjY2VzcyggcmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyICk7XHJcblx0XHRqc29ucENvbXBsZXRlKCByZXF1ZXN0U2V0dGluZ3MsIGNhbGxiYWNrQ29udGV4dCwgbW9ja0hhbmRsZXIgKTtcclxuXHJcblx0XHQvLyBJZiB3ZSBhcmUgcnVubmluZyB1bmRlciBqUXVlcnkgMS41KywgcmV0dXJuIGEgZGVmZXJyZWQgb2JqZWN0XHJcblx0XHRpZigkLkRlZmVycmVkKXtcclxuXHRcdFx0bmV3TW9jayA9IG5ldyAkLkRlZmVycmVkKCk7XHJcblx0XHRcdGlmKHR5cGVvZiBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgPT0gXCJvYmplY3RcIil7XHJcblx0XHRcdFx0bmV3TW9jay5yZXNvbHZlV2l0aCggY2FsbGJhY2tDb250ZXh0LCBbbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0XSApO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0bmV3TW9jay5yZXNvbHZlV2l0aCggY2FsbGJhY2tDb250ZXh0LCBbJC5wYXJzZUpTT04oIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCApXSApO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gbmV3TW9jaztcclxuXHR9XHJcblxyXG5cclxuXHQvLyBDcmVhdGUgdGhlIHJlcXVpcmVkIEpTT05QIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciB0aGUgcmVxdWVzdFxyXG5cdGZ1bmN0aW9uIGNyZWF0ZUpzb25wQ2FsbGJhY2soIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyApIHtcclxuXHRcdHZhciBjYWxsYmFja0NvbnRleHQgPSBvcmlnU2V0dGluZ3MgJiYgb3JpZ1NldHRpbmdzLmNvbnRleHQgfHwgcmVxdWVzdFNldHRpbmdzO1xyXG5cdFx0dmFyIGpzb25wID0gcmVxdWVzdFNldHRpbmdzLmpzb25wQ2FsbGJhY2sgfHwgKFwianNvbnBcIiArIGpzYysrKTtcclxuXHJcblx0XHQvLyBSZXBsYWNlIHRoZSA9PyBzZXF1ZW5jZSBib3RoIGluIHRoZSBxdWVyeSBzdHJpbmcgYW5kIHRoZSBkYXRhXHJcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5kYXRhICkge1xyXG5cdFx0XHRyZXF1ZXN0U2V0dGluZ3MuZGF0YSA9IChyZXF1ZXN0U2V0dGluZ3MuZGF0YSArIFwiXCIpLnJlcGxhY2UoQ0FMTEJBQ0tfUkVHRVgsIFwiPVwiICsganNvbnAgKyBcIiQxXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJlcXVlc3RTZXR0aW5ncy51cmwgPSByZXF1ZXN0U2V0dGluZ3MudXJsLnJlcGxhY2UoQ0FMTEJBQ0tfUkVHRVgsIFwiPVwiICsganNvbnAgKyBcIiQxXCIpO1xyXG5cclxuXHJcblx0XHQvLyBIYW5kbGUgSlNPTlAtc3R5bGUgbG9hZGluZ1xyXG5cdFx0d2luZG93WyBqc29ucCBdID0gd2luZG93WyBqc29ucCBdIHx8IGZ1bmN0aW9uKCB0bXAgKSB7XHJcblx0XHRcdGRhdGEgPSB0bXA7XHJcblx0XHRcdGpzb25wU3VjY2VzcyggcmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyICk7XHJcblx0XHRcdGpzb25wQ29tcGxldGUoIHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0LCBtb2NrSGFuZGxlciApO1xyXG5cdFx0XHQvLyBHYXJiYWdlIGNvbGxlY3RcclxuXHRcdFx0d2luZG93WyBqc29ucCBdID0gdW5kZWZpbmVkO1xyXG5cclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRkZWxldGUgd2luZG93WyBqc29ucCBdO1xyXG5cdFx0XHR9IGNhdGNoKGUpIHt9XHJcblxyXG5cdFx0XHRpZiAoIGhlYWQgKSB7XHJcblx0XHRcdFx0aGVhZC5yZW1vdmVDaGlsZCggc2NyaXB0ICk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHQvLyBUaGUgSlNPTlAgcmVxdWVzdCB3YXMgc3VjY2Vzc2Z1bFxyXG5cdGZ1bmN0aW9uIGpzb25wU3VjY2VzcyhyZXF1ZXN0U2V0dGluZ3MsIGNhbGxiYWNrQ29udGV4dCwgbW9ja0hhbmRsZXIpIHtcclxuXHRcdC8vIElmIGEgbG9jYWwgY2FsbGJhY2sgd2FzIHNwZWNpZmllZCwgZmlyZSBpdCBhbmQgcGFzcyBpdCB0aGUgZGF0YVxyXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3Muc3VjY2VzcyApIHtcclxuXHRcdFx0cmVxdWVzdFNldHRpbmdzLnN1Y2Nlc3MuY2FsbCggY2FsbGJhY2tDb250ZXh0LCBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgfHwgXCJcIiwgc3RhdHVzLCB7fSApO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEZpcmUgdGhlIGdsb2JhbCBjYWxsYmFja1xyXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZ2xvYmFsICkge1xyXG5cdFx0XHR0cmlnZ2VyKHJlcXVlc3RTZXR0aW5ncywgXCJhamF4U3VjY2Vzc1wiLCBbe30sIHJlcXVlc3RTZXR0aW5nc10gKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIFRoZSBKU09OUCByZXF1ZXN0IHdhcyBjb21wbGV0ZWRcclxuXHRmdW5jdGlvbiBqc29ucENvbXBsZXRlKHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0KSB7XHJcblx0XHQvLyBQcm9jZXNzIHJlc3VsdFxyXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuY29tcGxldGUgKSB7XHJcblx0XHRcdHJlcXVlc3RTZXR0aW5ncy5jb21wbGV0ZS5jYWxsKCBjYWxsYmFja0NvbnRleHQsIHt9ICwgc3RhdHVzICk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gVGhlIHJlcXVlc3Qgd2FzIGNvbXBsZXRlZFxyXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZ2xvYmFsICkge1xyXG5cdFx0XHR0cmlnZ2VyKCBcImFqYXhDb21wbGV0ZVwiLCBbe30sIHJlcXVlc3RTZXR0aW5nc10gKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBIYW5kbGUgdGhlIGdsb2JhbCBBSkFYIGNvdW50ZXJcclxuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmdsb2JhbCAmJiAhIC0tJC5hY3RpdmUgKSB7XHJcblx0XHRcdCQuZXZlbnQudHJpZ2dlciggXCJhamF4U3RvcFwiICk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHJcblx0Ly8gVGhlIGNvcmUgJC5hamF4IHJlcGxhY2VtZW50LlxyXG5cdGZ1bmN0aW9uIGhhbmRsZUFqYXgoIHVybCwgb3JpZ1NldHRpbmdzICkge1xyXG5cdFx0dmFyIG1vY2tSZXF1ZXN0LCByZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyO1xyXG5cclxuXHRcdC8vIElmIHVybCBpcyBhbiBvYmplY3QsIHNpbXVsYXRlIHByZS0xLjUgc2lnbmF0dXJlXHJcblx0XHRpZiAoIHR5cGVvZiB1cmwgPT09IFwib2JqZWN0XCIgKSB7XHJcblx0XHRcdG9yaWdTZXR0aW5ncyA9IHVybDtcclxuXHRcdFx0dXJsID0gdW5kZWZpbmVkO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gd29yayBhcm91bmQgdG8gc3VwcG9ydCAxLjUgc2lnbmF0dXJlXHJcblx0XHRcdG9yaWdTZXR0aW5ncyA9IG9yaWdTZXR0aW5ncyB8fCB7fTtcclxuXHRcdFx0b3JpZ1NldHRpbmdzLnVybCA9IHVybDtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBFeHRlbmQgdGhlIG9yaWdpbmFsIHNldHRpbmdzIGZvciB0aGUgcmVxdWVzdFxyXG5cdFx0cmVxdWVzdFNldHRpbmdzID0gJC5leHRlbmQodHJ1ZSwge30sICQuYWpheFNldHRpbmdzLCBvcmlnU2V0dGluZ3MpO1xyXG5cclxuXHRcdC8vIEl0ZXJhdGUgb3ZlciBvdXIgbW9jayBoYW5kbGVycyAoaW4gcmVnaXN0cmF0aW9uIG9yZGVyKSB1bnRpbCB3ZSBmaW5kXHJcblx0XHQvLyBvbmUgdGhhdCBpcyB3aWxsaW5nIHRvIGludGVyY2VwdCB0aGUgcmVxdWVzdFxyXG5cdFx0Zm9yKHZhciBrID0gMDsgayA8IG1vY2tIYW5kbGVycy5sZW5ndGg7IGsrKykge1xyXG5cdFx0XHRpZiAoICFtb2NrSGFuZGxlcnNba10gKSB7XHJcblx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdG1vY2tIYW5kbGVyID0gZ2V0TW9ja0ZvclJlcXVlc3QoIG1vY2tIYW5kbGVyc1trXSwgcmVxdWVzdFNldHRpbmdzICk7XHJcblx0XHRcdGlmKCFtb2NrSGFuZGxlcikge1xyXG5cdFx0XHRcdC8vIE5vIHZhbGlkIG1vY2sgZm91bmQgZm9yIHRoaXMgcmVxdWVzdFxyXG5cdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRtb2NrZWRBamF4Q2FsbHMucHVzaChyZXF1ZXN0U2V0dGluZ3MpO1xyXG5cclxuXHRcdFx0Ly8gSWYgbG9nZ2luZyBpcyBlbmFibGVkLCBsb2cgdGhlIG1vY2sgdG8gdGhlIGNvbnNvbGVcclxuXHRcdFx0JC5tb2NramF4U2V0dGluZ3MubG9nKCBtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzICk7XHJcblxyXG5cclxuXHRcdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgJiYgcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlLnRvVXBwZXJDYXNlKCkgPT09ICdKU09OUCcgKSB7XHJcblx0XHRcdFx0aWYgKChtb2NrUmVxdWVzdCA9IHByb2Nlc3NKc29ucE1vY2soIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyApKSkge1xyXG5cdFx0XHRcdFx0Ly8gVGhpcyBtb2NrIHdpbGwgaGFuZGxlIHRoZSBKU09OUCByZXF1ZXN0XHJcblx0XHRcdFx0XHRyZXR1cm4gbW9ja1JlcXVlc3Q7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cclxuXHRcdFx0Ly8gUmVtb3ZlZCB0byBmaXggIzU0IC0ga2VlcCB0aGUgbW9ja2luZyBkYXRhIG9iamVjdCBpbnRhY3RcclxuXHRcdFx0Ly9tb2NrSGFuZGxlci5kYXRhID0gcmVxdWVzdFNldHRpbmdzLmRhdGE7XHJcblxyXG5cdFx0XHRtb2NrSGFuZGxlci5jYWNoZSA9IHJlcXVlc3RTZXR0aW5ncy5jYWNoZTtcclxuXHRcdFx0bW9ja0hhbmRsZXIudGltZW91dCA9IHJlcXVlc3RTZXR0aW5ncy50aW1lb3V0O1xyXG5cdFx0XHRtb2NrSGFuZGxlci5nbG9iYWwgPSByZXF1ZXN0U2V0dGluZ3MuZ2xvYmFsO1xyXG5cclxuXHRcdFx0Y29weVVybFBhcmFtZXRlcnMobW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyk7XHJcblxyXG5cdFx0XHQoZnVuY3Rpb24obW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncywgb3JpZ1NldHRpbmdzLCBvcmlnSGFuZGxlcikge1xyXG5cdFx0XHRcdG1vY2tSZXF1ZXN0ID0gX2FqYXguY2FsbCgkLCAkLmV4dGVuZCh0cnVlLCB7fSwgb3JpZ1NldHRpbmdzLCB7XHJcblx0XHRcdFx0XHQvLyBNb2NrIHRoZSBYSFIgb2JqZWN0XHJcblx0XHRcdFx0XHR4aHI6IGZ1bmN0aW9uKCkgeyByZXR1cm4geGhyKCBtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MsIG9yaWdIYW5kbGVyICk7IH1cclxuXHRcdFx0XHR9KSk7XHJcblx0XHRcdH0pKG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncywgbW9ja0hhbmRsZXJzW2tdKTtcclxuXHJcblx0XHRcdHJldHVybiBtb2NrUmVxdWVzdDtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBXZSBkb24ndCBoYXZlIGEgbW9jayByZXF1ZXN0XHJcblx0XHRpZigkLm1vY2tqYXhTZXR0aW5ncy50aHJvd1VubW9ja2VkID09PSB0cnVlKSB7XHJcblx0XHRcdHRocm93KCdBSkFYIG5vdCBtb2NrZWQ6ICcgKyBvcmlnU2V0dGluZ3MudXJsKTtcclxuXHRcdH1cclxuXHRcdGVsc2UgeyAvLyB0cmlnZ2VyIGEgbm9ybWFsIHJlcXVlc3RcclxuXHRcdFx0cmV0dXJuIF9hamF4LmFwcGx5KCQsIFtvcmlnU2V0dGluZ3NdKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCogQ29waWVzIFVSTCBwYXJhbWV0ZXIgdmFsdWVzIGlmIHRoZXkgd2VyZSBjYXB0dXJlZCBieSBhIHJlZ3VsYXIgZXhwcmVzc2lvblxyXG5cdCogQHBhcmFtIHtPYmplY3R9IG1vY2tIYW5kbGVyXHJcblx0KiBAcGFyYW0ge09iamVjdH0gb3JpZ1NldHRpbmdzXHJcblx0Ki9cclxuXHRmdW5jdGlvbiBjb3B5VXJsUGFyYW1ldGVycyhtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzKSB7XHJcblx0XHQvL3BhcmFtZXRlcnMgYXJlbid0IGNhcHR1cmVkIGlmIHRoZSBVUkwgaXNuJ3QgYSBSZWdFeHBcclxuXHRcdGlmICghKG1vY2tIYW5kbGVyLnVybCBpbnN0YW5jZW9mIFJlZ0V4cCkpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0Ly9pZiBubyBVUkwgcGFyYW1zIHdlcmUgZGVmaW5lZCBvbiB0aGUgaGFuZGxlciwgZG9uJ3QgYXR0ZW1wdCBhIGNhcHR1cmVcclxuXHRcdGlmICghbW9ja0hhbmRsZXIuaGFzT3duUHJvcGVydHkoJ3VybFBhcmFtcycpKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdHZhciBjYXB0dXJlcyA9IG1vY2tIYW5kbGVyLnVybC5leGVjKG9yaWdTZXR0aW5ncy51cmwpO1xyXG5cdFx0Ly90aGUgd2hvbGUgUmVnRXhwIG1hdGNoIGlzIGFsd2F5cyB0aGUgZmlyc3QgdmFsdWUgaW4gdGhlIGNhcHR1cmUgcmVzdWx0c1xyXG5cdFx0aWYgKGNhcHR1cmVzLmxlbmd0aCA9PT0gMSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRjYXB0dXJlcy5zaGlmdCgpO1xyXG5cdFx0Ly91c2UgaGFuZGxlciBwYXJhbXMgYXMga2V5cyBhbmQgY2FwdHVyZSByZXN1dHMgYXMgdmFsdWVzXHJcblx0XHR2YXIgaSA9IDAsXHJcblx0XHRjYXB0dXJlc0xlbmd0aCA9IGNhcHR1cmVzLmxlbmd0aCxcclxuXHRcdHBhcmFtc0xlbmd0aCA9IG1vY2tIYW5kbGVyLnVybFBhcmFtcy5sZW5ndGgsXHJcblx0XHQvL2luIGNhc2UgdGhlIG51bWJlciBvZiBwYXJhbXMgc3BlY2lmaWVkIGlzIGxlc3MgdGhhbiBhY3R1YWwgY2FwdHVyZXNcclxuXHRcdG1heEl0ZXJhdGlvbnMgPSBNYXRoLm1pbihjYXB0dXJlc0xlbmd0aCwgcGFyYW1zTGVuZ3RoKSxcclxuXHRcdHBhcmFtVmFsdWVzID0ge307XHJcblx0XHRmb3IgKGk7IGkgPCBtYXhJdGVyYXRpb25zOyBpKyspIHtcclxuXHRcdFx0dmFyIGtleSA9IG1vY2tIYW5kbGVyLnVybFBhcmFtc1tpXTtcclxuXHRcdFx0cGFyYW1WYWx1ZXNba2V5XSA9IGNhcHR1cmVzW2ldO1xyXG5cdFx0fVxyXG5cdFx0b3JpZ1NldHRpbmdzLnVybFBhcmFtcyA9IHBhcmFtVmFsdWVzO1xyXG5cdH1cclxuXHJcblxyXG5cdC8vIFB1YmxpY1xyXG5cclxuXHQkLmV4dGVuZCh7XHJcblx0XHRhamF4OiBoYW5kbGVBamF4XHJcblx0fSk7XHJcblxyXG5cdCQubW9ja2pheFNldHRpbmdzID0ge1xyXG5cdFx0Ly91cmw6ICAgICAgICBudWxsLFxyXG5cdFx0Ly90eXBlOiAgICAgICAnR0VUJyxcclxuXHRcdGxvZzogICAgICAgICAgZnVuY3Rpb24oIG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MgKSB7XHJcblx0XHRcdGlmICggbW9ja0hhbmRsZXIubG9nZ2luZyA9PT0gZmFsc2UgfHxcclxuXHRcdFx0XHQgKCB0eXBlb2YgbW9ja0hhbmRsZXIubG9nZ2luZyA9PT0gJ3VuZGVmaW5lZCcgJiYgJC5tb2NramF4U2V0dGluZ3MubG9nZ2luZyA9PT0gZmFsc2UgKSApIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKCB3aW5kb3cuY29uc29sZSAmJiBjb25zb2xlLmxvZyApIHtcclxuXHRcdFx0XHR2YXIgbWVzc2FnZSA9ICdNT0NLICcgKyByZXF1ZXN0U2V0dGluZ3MudHlwZS50b1VwcGVyQ2FzZSgpICsgJzogJyArIHJlcXVlc3RTZXR0aW5ncy51cmw7XHJcblx0XHRcdFx0dmFyIHJlcXVlc3QgPSAkLmV4dGVuZCh7fSwgcmVxdWVzdFNldHRpbmdzKTtcclxuXHJcblx0XHRcdFx0aWYgKHR5cGVvZiBjb25zb2xlLmxvZyA9PT0gJ2Z1bmN0aW9uJykge1xyXG5cdFx0XHRcdFx0Y29uc29sZS5sb2cobWVzc2FnZSwgcmVxdWVzdCk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHRyeSB7XHJcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCBtZXNzYWdlICsgJyAnICsgSlNPTi5zdHJpbmdpZnkocmVxdWVzdCkgKTtcclxuXHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2cobWVzc2FnZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cdFx0bG9nZ2luZzogICAgICAgdHJ1ZSxcclxuXHRcdHN0YXR1czogICAgICAgIDIwMCxcclxuXHRcdHN0YXR1c1RleHQ6ICAgIFwiT0tcIixcclxuXHRcdHJlc3BvbnNlVGltZTogIDUwMCxcclxuXHRcdGlzVGltZW91dDogICAgIGZhbHNlLFxyXG5cdFx0dGhyb3dVbm1vY2tlZDogZmFsc2UsXHJcblx0XHRjb250ZW50VHlwZTogICAndGV4dC9wbGFpbicsXHJcblx0XHRyZXNwb25zZTogICAgICAnJyxcclxuXHRcdHJlc3BvbnNlVGV4dDogICcnLFxyXG5cdFx0cmVzcG9uc2VYTUw6ICAgJycsXHJcblx0XHRwcm94eTogICAgICAgICAnJyxcclxuXHRcdHByb3h5VHlwZTogICAgICdHRVQnLFxyXG5cclxuXHRcdGxhc3RNb2RpZmllZDogIG51bGwsXHJcblx0XHRldGFnOiAgICAgICAgICAnJyxcclxuXHRcdGhlYWRlcnM6IHtcclxuXHRcdFx0ZXRhZzogJ0lKRkBII0A5MjN1ZjgwMjNoRk9ASSNIIycsXHJcblx0XHRcdCdjb250ZW50LXR5cGUnIDogJ3RleHQvcGxhaW4nXHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0JC5tb2NramF4ID0gZnVuY3Rpb24oc2V0dGluZ3MpIHtcclxuXHRcdHZhciBpID0gbW9ja0hhbmRsZXJzLmxlbmd0aDtcclxuXHRcdG1vY2tIYW5kbGVyc1tpXSA9IHNldHRpbmdzO1xyXG5cdFx0cmV0dXJuIGk7XHJcblx0fTtcclxuXHQkLm1vY2tqYXhDbGVhciA9IGZ1bmN0aW9uKGkpIHtcclxuXHRcdGlmICggYXJndW1lbnRzLmxlbmd0aCA9PSAxICkge1xyXG5cdFx0XHRtb2NrSGFuZGxlcnNbaV0gPSBudWxsO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0bW9ja0hhbmRsZXJzID0gW107XHJcblx0XHR9XHJcblx0XHRtb2NrZWRBamF4Q2FsbHMgPSBbXTtcclxuXHR9O1xyXG5cdCQubW9ja2pheC5oYW5kbGVyID0gZnVuY3Rpb24oaSkge1xyXG5cdFx0aWYgKCBhcmd1bWVudHMubGVuZ3RoID09IDEgKSB7XHJcblx0XHRcdHJldHVybiBtb2NrSGFuZGxlcnNbaV07XHJcblx0XHR9XHJcblx0fTtcclxuXHQkLm1vY2tqYXgubW9ja2VkQWpheENhbGxzID0gZnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4gbW9ja2VkQWpheENhbGxzO1xyXG5cdH07XHJcbn0pKGpRdWVyeSk7IiwiLyoqXHJcbiogIEFqYXggQXV0b2NvbXBsZXRlIGZvciBqUXVlcnksIHZlcnNpb24gJXZlcnNpb24lXHJcbiogIChjKSAyMDE1IFRvbWFzIEtpcmRhXHJcbipcclxuKiAgQWpheCBBdXRvY29tcGxldGUgZm9yIGpRdWVyeSBpcyBmcmVlbHkgZGlzdHJpYnV0YWJsZSB1bmRlciB0aGUgdGVybXMgb2YgYW4gTUlULXN0eWxlIGxpY2Vuc2UuXHJcbiogIEZvciBkZXRhaWxzLCBzZWUgdGhlIHdlYiBzaXRlOiBodHRwczovL2dpdGh1Yi5jb20vZGV2YnJpZGdlL2pRdWVyeS1BdXRvY29tcGxldGVcclxuKi9cclxuXHJcbi8qanNsaW50ICBicm93c2VyOiB0cnVlLCB3aGl0ZTogdHJ1ZSwgcGx1c3BsdXM6IHRydWUsIHZhcnM6IHRydWUgKi9cclxuLypnbG9iYWwgZGVmaW5lLCB3aW5kb3csIGRvY3VtZW50LCBqUXVlcnksIGV4cG9ydHMsIHJlcXVpcmUgKi9cclxuXHJcbi8vIEV4cG9zZSBwbHVnaW4gYXMgYW4gQU1EIG1vZHVsZSBpZiBBTUQgbG9hZGVyIGlzIHByZXNlbnQ6XHJcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG4gICAgICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cclxuICAgICAgICBkZWZpbmUoWydqcXVlcnknXSwgZmFjdG9yeSk7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgcmVxdWlyZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIC8vIEJyb3dzZXJpZnlcclxuICAgICAgICBmYWN0b3J5KHJlcXVpcmUoJ2pxdWVyeScpKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gQnJvd3NlciBnbG9iYWxzXHJcbiAgICAgICAgZmFjdG9yeShqUXVlcnkpO1xyXG4gICAgfVxyXG59KGZ1bmN0aW9uICgkKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyXHJcbiAgICAgICAgdXRpbHMgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgZXNjYXBlUmVnRXhDaGFyczogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoL1tcXC1cXFtcXF1cXC9cXHtcXH1cXChcXClcXCpcXCtcXD9cXC5cXFxcXFxeXFwkXFx8XS9nLCBcIlxcXFwkJlwiKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBjcmVhdGVOb2RlOiBmdW5jdGlvbiAoY29udGFpbmVyQ2xhc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGl2LmNsYXNzTmFtZSA9IGNvbnRhaW5lckNsYXNzO1xyXG4gICAgICAgICAgICAgICAgICAgIGRpdi5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgZGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRpdjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KCkpLFxyXG5cclxuICAgICAgICBrZXlzID0ge1xyXG4gICAgICAgICAgICBFU0M6IDI3LFxyXG4gICAgICAgICAgICBUQUI6IDksXHJcbiAgICAgICAgICAgIFJFVFVSTjogMTMsXHJcbiAgICAgICAgICAgIExFRlQ6IDM3LFxyXG4gICAgICAgICAgICBVUDogMzgsXHJcbiAgICAgICAgICAgIFJJR0hUOiAzOSxcclxuICAgICAgICAgICAgRE9XTjogNDBcclxuICAgICAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIEF1dG9jb21wbGV0ZShlbCwgb3B0aW9ucykge1xyXG4gICAgICAgIHZhciBub29wID0gZnVuY3Rpb24gKCkgeyB9LFxyXG4gICAgICAgICAgICB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgZGVmYXVsdHMgPSB7XHJcbiAgICAgICAgICAgICAgICBhamF4U2V0dGluZ3M6IHt9LFxyXG4gICAgICAgICAgICAgICAgYXV0b1NlbGVjdEZpcnN0OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGFwcGVuZFRvOiBkb2N1bWVudC5ib2R5LFxyXG4gICAgICAgICAgICAgICAgc2VydmljZVVybDogbnVsbCxcclxuICAgICAgICAgICAgICAgIGxvb2t1cDogbnVsbCxcclxuICAgICAgICAgICAgICAgIG9uU2VsZWN0OiBudWxsLFxyXG4gICAgICAgICAgICAgICAgd2lkdGg6ICdhdXRvJyxcclxuICAgICAgICAgICAgICAgIG1pbkNoYXJzOiAxLFxyXG4gICAgICAgICAgICAgICAgbWF4SGVpZ2h0OiAzMDAsXHJcbiAgICAgICAgICAgICAgICBkZWZlclJlcXVlc3RCeTogMCxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge30sXHJcbiAgICAgICAgICAgICAgICBmb3JtYXRSZXN1bHQ6IEF1dG9jb21wbGV0ZS5mb3JtYXRSZXN1bHQsXHJcbiAgICAgICAgICAgICAgICBkZWxpbWl0ZXI6IG51bGwsXHJcbiAgICAgICAgICAgICAgICB6SW5kZXg6IDk5OTksXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnR0VUJyxcclxuICAgICAgICAgICAgICAgIG5vQ2FjaGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgb25TZWFyY2hTdGFydDogbm9vcCxcclxuICAgICAgICAgICAgICAgIG9uU2VhcmNoQ29tcGxldGU6IG5vb3AsXHJcbiAgICAgICAgICAgICAgICBvblNlYXJjaEVycm9yOiBub29wLFxyXG4gICAgICAgICAgICAgICAgcHJlc2VydmVJbnB1dDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBjb250YWluZXJDbGFzczogJ2F1dG9jb21wbGV0ZS1zdWdnZXN0aW9ucycsXHJcbiAgICAgICAgICAgICAgICB0YWJEaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ3RleHQnLFxyXG4gICAgICAgICAgICAgICAgY3VycmVudFJlcXVlc3Q6IG51bGwsXHJcbiAgICAgICAgICAgICAgICB0cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgcHJldmVudEJhZFF1ZXJpZXM6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBsb29rdXBGaWx0ZXI6IGZ1bmN0aW9uIChzdWdnZXN0aW9uLCBvcmlnaW5hbFF1ZXJ5LCBxdWVyeUxvd2VyQ2FzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdWdnZXN0aW9uLnZhbHVlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxdWVyeUxvd2VyQ2FzZSkgIT09IC0xO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHBhcmFtTmFtZTogJ3F1ZXJ5JyxcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybVJlc3VsdDogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiByZXNwb25zZSA9PT0gJ3N0cmluZycgPyAkLnBhcnNlSlNPTihyZXNwb25zZSkgOiByZXNwb25zZTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBzaG93Tm9TdWdnZXN0aW9uTm90aWNlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIG5vU3VnZ2VzdGlvbk5vdGljZTogJ05vIHJlc3VsdHMnLFxyXG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb246ICdib3R0b20nLFxyXG4gICAgICAgICAgICAgICAgZm9yY2VGaXhQb3NpdGlvbjogZmFsc2VcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gU2hhcmVkIHZhcmlhYmxlczpcclxuICAgICAgICB0aGF0LmVsZW1lbnQgPSBlbDtcclxuICAgICAgICB0aGF0LmVsID0gJChlbCk7XHJcbiAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IFtdO1xyXG4gICAgICAgIHRoYXQuYmFkUXVlcmllcyA9IFtdO1xyXG4gICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xyXG4gICAgICAgIHRoYXQuY3VycmVudFZhbHVlID0gdGhhdC5lbGVtZW50LnZhbHVlO1xyXG4gICAgICAgIHRoYXQuaW50ZXJ2YWxJZCA9IDA7XHJcbiAgICAgICAgdGhhdC5jYWNoZWRSZXNwb25zZSA9IHt9O1xyXG4gICAgICAgIHRoYXQub25DaGFuZ2VJbnRlcnZhbCA9IG51bGw7XHJcbiAgICAgICAgdGhhdC5vbkNoYW5nZSA9IG51bGw7XHJcbiAgICAgICAgdGhhdC5pc0xvY2FsID0gZmFsc2U7XHJcbiAgICAgICAgdGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciA9IG51bGw7XHJcbiAgICAgICAgdGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gbnVsbDtcclxuICAgICAgICB0aGF0Lm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG4gICAgICAgIHRoYXQuY2xhc3NlcyA9IHtcclxuICAgICAgICAgICAgc2VsZWN0ZWQ6ICdhdXRvY29tcGxldGUtc2VsZWN0ZWQnLFxyXG4gICAgICAgICAgICBzdWdnZXN0aW9uOiAnYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb24nXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGF0LmhpbnQgPSBudWxsO1xyXG4gICAgICAgIHRoYXQuaGludFZhbHVlID0gJyc7XHJcbiAgICAgICAgdGhhdC5zZWxlY3Rpb24gPSBudWxsO1xyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXplIGFuZCBzZXQgb3B0aW9uczpcclxuICAgICAgICB0aGF0LmluaXRpYWxpemUoKTtcclxuICAgICAgICB0aGF0LnNldE9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgQXV0b2NvbXBsZXRlLnV0aWxzID0gdXRpbHM7XHJcblxyXG4gICAgJC5BdXRvY29tcGxldGUgPSBBdXRvY29tcGxldGU7XHJcblxyXG4gICAgQXV0b2NvbXBsZXRlLmZvcm1hdFJlc3VsdCA9IGZ1bmN0aW9uIChzdWdnZXN0aW9uLCBjdXJyZW50VmFsdWUpIHtcclxuICAgICAgICAvLyBEbyBub3QgcmVwbGFjZSBhbnl0aGluZyBpZiB0aGVyZSBjdXJyZW50IHZhbHVlIGlzIGVtcHR5XHJcbiAgICAgICAgaWYgKCFjdXJyZW50VmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb24udmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBwYXR0ZXJuID0gJygnICsgdXRpbHMuZXNjYXBlUmVnRXhDaGFycyhjdXJyZW50VmFsdWUpICsgJyknO1xyXG5cclxuICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbi52YWx1ZVxyXG4gICAgICAgICAgICAucmVwbGFjZShuZXcgUmVnRXhwKHBhdHRlcm4sICdnaScpLCAnPHN0cm9uZz4kMTxcXC9zdHJvbmc+JylcclxuICAgICAgICAgICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcclxuICAgICAgICAgICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcclxuICAgICAgICAgICAgLnJlcGxhY2UoLyZsdDsoXFwvP3N0cm9uZykmZ3Q7L2csICc8JDE+Jyk7XHJcbiAgICB9O1xyXG5cclxuICAgIEF1dG9jb21wbGV0ZS5wcm90b3R5cGUgPSB7XHJcblxyXG4gICAgICAgIGtpbGxlckZuOiBudWxsLFxyXG5cclxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb25TZWxlY3RvciA9ICcuJyArIHRoYXQuY2xhc3Nlcy5zdWdnZXN0aW9uLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSB0aGF0LmNsYXNzZXMuc2VsZWN0ZWQsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlIGF1dG9jb21wbGV0ZSBhdHRyaWJ1dGUgdG8gcHJldmVudCBuYXRpdmUgc3VnZ2VzdGlvbnM6XHJcbiAgICAgICAgICAgIHRoYXQuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2F1dG9jb21wbGV0ZScsICdvZmYnKTtcclxuXHJcbiAgICAgICAgICAgIHRoYXQua2lsbGVyRm4gPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCQoZS50YXJnZXQpLmNsb3Nlc3QoJy4nICsgdGhhdC5vcHRpb25zLmNvbnRhaW5lckNsYXNzKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmtpbGxTdWdnZXN0aW9ucygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZGlzYWJsZUtpbGxlckZuKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvLyBodG1sKCkgZGVhbHMgd2l0aCBtYW55IHR5cGVzOiBodG1sU3RyaW5nIG9yIEVsZW1lbnQgb3IgQXJyYXkgb3IgalF1ZXJ5XHJcbiAgICAgICAgICAgIHRoYXQubm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQoJzxkaXYgY2xhc3M9XCJhdXRvY29tcGxldGUtbm8tc3VnZ2VzdGlvblwiPjwvZGl2PicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5odG1sKHRoaXMub3B0aW9ucy5ub1N1Z2dlc3Rpb25Ob3RpY2UpLmdldCgwKTtcclxuXHJcbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIgPSBBdXRvY29tcGxldGUudXRpbHMuY3JlYXRlTm9kZShvcHRpb25zLmNvbnRhaW5lckNsYXNzKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kVG8ob3B0aW9ucy5hcHBlbmRUbyk7XHJcblxyXG4gICAgICAgICAgICAvLyBPbmx5IHNldCB3aWR0aCBpZiBpdCB3YXMgcHJvdmlkZWQ6XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLndpZHRoICE9PSAnYXV0bycpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci53aWR0aChvcHRpb25zLndpZHRoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gTGlzdGVuIGZvciBtb3VzZSBvdmVyIGV2ZW50IG9uIHN1Z2dlc3Rpb25zIGxpc3Q6XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5vbignbW91c2VvdmVyLmF1dG9jb21wbGV0ZScsIHN1Z2dlc3Rpb25TZWxlY3RvciwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5hY3RpdmF0ZSgkKHRoaXMpLmRhdGEoJ2luZGV4JykpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIERlc2VsZWN0IGFjdGl2ZSBlbGVtZW50IHdoZW4gbW91c2UgbGVhdmVzIHN1Z2dlc3Rpb25zIGNvbnRhaW5lcjpcclxuICAgICAgICAgICAgY29udGFpbmVyLm9uKCdtb3VzZW91dC5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jaGlsZHJlbignLicgKyBzZWxlY3RlZCkucmVtb3ZlQ2xhc3Moc2VsZWN0ZWQpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIExpc3RlbiBmb3IgY2xpY2sgZXZlbnQgb24gc3VnZ2VzdGlvbnMgbGlzdDpcclxuICAgICAgICAgICAgY29udGFpbmVyLm9uKCdjbGljay5hdXRvY29tcGxldGUnLCBzdWdnZXN0aW9uU2VsZWN0b3IsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KCQodGhpcykuZGF0YSgnaW5kZXgnKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbkNhcHR1cmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhhdC52aXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuYXV0b2NvbXBsZXRlJywgdGhhdC5maXhQb3NpdGlvbkNhcHR1cmUpO1xyXG5cclxuICAgICAgICAgICAgdGhhdC5lbC5vbigna2V5ZG93bi5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5UHJlc3MoZSk7IH0pO1xyXG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdrZXl1cC5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5VXAoZSk7IH0pO1xyXG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdibHVyLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uICgpIHsgdGhhdC5vbkJsdXIoKTsgfSk7XHJcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2ZvY3VzLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uICgpIHsgdGhhdC5vbkZvY3VzKCk7IH0pO1xyXG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdjaGFuZ2UuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVVwKGUpOyB9KTtcclxuICAgICAgICAgICAgdGhhdC5lbC5vbignaW5wdXQuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVVwKGUpOyB9KTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBvbkZvY3VzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LmVsLnZhbCgpLmxlbmd0aCA+PSB0aGF0Lm9wdGlvbnMubWluQ2hhcnMpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQub25WYWx1ZUNoYW5nZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgb25CbHVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZW5hYmxlS2lsbGVyRm4oKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIFxyXG4gICAgICAgIGFib3J0QWpheDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgIGlmICh0aGF0LmN1cnJlbnRSZXF1ZXN0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0LmFib3J0KCk7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0ID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNldE9wdGlvbnM6IGZ1bmN0aW9uIChzdXBwbGllZE9wdGlvbnMpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucztcclxuXHJcbiAgICAgICAgICAgICQuZXh0ZW5kKG9wdGlvbnMsIHN1cHBsaWVkT3B0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICB0aGF0LmlzTG9jYWwgPSAkLmlzQXJyYXkob3B0aW9ucy5sb29rdXApO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuaXNMb2NhbCkge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5sb29rdXAgPSB0aGF0LnZlcmlmeVN1Z2dlc3Rpb25zRm9ybWF0KG9wdGlvbnMubG9va3VwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgb3B0aW9ucy5vcmllbnRhdGlvbiA9IHRoYXQudmFsaWRhdGVPcmllbnRhdGlvbihvcHRpb25zLm9yaWVudGF0aW9uLCAnYm90dG9tJyk7XHJcblxyXG4gICAgICAgICAgICAvLyBBZGp1c3QgaGVpZ2h0LCB3aWR0aCBhbmQgei1pbmRleDpcclxuICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5jc3Moe1xyXG4gICAgICAgICAgICAgICAgJ21heC1oZWlnaHQnOiBvcHRpb25zLm1heEhlaWdodCArICdweCcsXHJcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiBvcHRpb25zLndpZHRoICsgJ3B4JyxcclxuICAgICAgICAgICAgICAgICd6LWluZGV4Jzogb3B0aW9ucy56SW5kZXhcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuXHJcblxyXG4gICAgICAgIGNsZWFyQ2FjaGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5jYWNoZWRSZXNwb25zZSA9IHt9O1xyXG4gICAgICAgICAgICB0aGlzLmJhZFF1ZXJpZXMgPSBbXTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBjbGVhcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNsZWFyQ2FjaGUoKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50VmFsdWUgPSAnJztcclxuICAgICAgICAgICAgdGhpcy5zdWdnZXN0aW9ucyA9IFtdO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGRpc2FibGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICB0aGF0LmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICB0aGF0LmFib3J0QWpheCgpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGVuYWJsZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZml4UG9zaXRpb246IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gVXNlIG9ubHkgd2hlbiBjb250YWluZXIgaGFzIGFscmVhZHkgaXRzIGNvbnRlbnRcclxuXHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgICRjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyUGFyZW50ID0gJGNvbnRhaW5lci5wYXJlbnQoKS5nZXQoMCk7XHJcbiAgICAgICAgICAgIC8vIEZpeCBwb3NpdGlvbiBhdXRvbWF0aWNhbGx5IHdoZW4gYXBwZW5kZWQgdG8gYm9keS5cclxuICAgICAgICAgICAgLy8gSW4gb3RoZXIgY2FzZXMgZm9yY2UgcGFyYW1ldGVyIG11c3QgYmUgZ2l2ZW4uXHJcbiAgICAgICAgICAgIGlmIChjb250YWluZXJQYXJlbnQgIT09IGRvY3VtZW50LmJvZHkgJiYgIXRoYXQub3B0aW9ucy5mb3JjZUZpeFBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIENob29zZSBvcmllbnRhdGlvblxyXG4gICAgICAgICAgICB2YXIgb3JpZW50YXRpb24gPSB0aGF0Lm9wdGlvbnMub3JpZW50YXRpb24sXHJcbiAgICAgICAgICAgICAgICBjb250YWluZXJIZWlnaHQgPSAkY29udGFpbmVyLm91dGVySGVpZ2h0KCksXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSB0aGF0LmVsLm91dGVySGVpZ2h0KCksXHJcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSB0aGF0LmVsLm9mZnNldCgpLFxyXG4gICAgICAgICAgICAgICAgc3R5bGVzID0geyAndG9wJzogb2Zmc2V0LnRvcCwgJ2xlZnQnOiBvZmZzZXQubGVmdCB9O1xyXG5cclxuICAgICAgICAgICAgaWYgKG9yaWVudGF0aW9uID09PSAnYXV0bycpIHtcclxuICAgICAgICAgICAgICAgIHZhciB2aWV3UG9ydEhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKSxcclxuICAgICAgICAgICAgICAgICAgICBzY3JvbGxUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCksXHJcbiAgICAgICAgICAgICAgICAgICAgdG9wT3ZlcmZsb3cgPSAtc2Nyb2xsVG9wICsgb2Zmc2V0LnRvcCAtIGNvbnRhaW5lckhlaWdodCxcclxuICAgICAgICAgICAgICAgICAgICBib3R0b21PdmVyZmxvdyA9IHNjcm9sbFRvcCArIHZpZXdQb3J0SGVpZ2h0IC0gKG9mZnNldC50b3AgKyBoZWlnaHQgKyBjb250YWluZXJIZWlnaHQpO1xyXG5cclxuICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uID0gKE1hdGgubWF4KHRvcE92ZXJmbG93LCBib3R0b21PdmVyZmxvdykgPT09IHRvcE92ZXJmbG93KSA/ICd0b3AnIDogJ2JvdHRvbSc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChvcmllbnRhdGlvbiA9PT0gJ3RvcCcpIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlcy50b3AgKz0gLWNvbnRhaW5lckhlaWdodDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlcy50b3AgKz0gaGVpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBjb250YWluZXIgaXMgbm90IHBvc2l0aW9uZWQgdG8gYm9keSxcclxuICAgICAgICAgICAgLy8gY29ycmVjdCBpdHMgcG9zaXRpb24gdXNpbmcgb2Zmc2V0IHBhcmVudCBvZmZzZXRcclxuICAgICAgICAgICAgaWYoY29udGFpbmVyUGFyZW50ICE9PSBkb2N1bWVudC5ib2R5KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgb3BhY2l0eSA9ICRjb250YWluZXIuY3NzKCdvcGFjaXR5JyksXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50T2Zmc2V0RGlmZjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGF0LnZpc2libGUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmNzcygnb3BhY2l0eScsIDApLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcGFyZW50T2Zmc2V0RGlmZiA9ICRjb250YWluZXIub2Zmc2V0UGFyZW50KCkub2Zmc2V0KCk7XHJcbiAgICAgICAgICAgICAgICBzdHlsZXMudG9wIC09IHBhcmVudE9mZnNldERpZmYudG9wO1xyXG4gICAgICAgICAgICAgICAgc3R5bGVzLmxlZnQgLT0gcGFyZW50T2Zmc2V0RGlmZi5sZWZ0O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghdGhhdC52aXNpYmxlKXtcclxuICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmNzcygnb3BhY2l0eScsIG9wYWNpdHkpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gLTJweCB0byBhY2NvdW50IGZvciBzdWdnZXN0aW9ucyBib3JkZXIuXHJcbiAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMud2lkdGggPT09ICdhdXRvJykge1xyXG4gICAgICAgICAgICAgICAgc3R5bGVzLndpZHRoID0gKHRoYXQuZWwub3V0ZXJXaWR0aCgpIC0gMikgKyAncHgnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAkY29udGFpbmVyLmNzcyhzdHlsZXMpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGVuYWJsZUtpbGxlckZuOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrLmF1dG9jb21wbGV0ZScsIHRoYXQua2lsbGVyRm4pO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGRpc2FibGVLaWxsZXJGbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suYXV0b2NvbXBsZXRlJywgdGhhdC5raWxsZXJGbik7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAga2lsbFN1Z2dlc3Rpb25zOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgdGhhdC5zdG9wS2lsbFN1Z2dlc3Rpb25zKCk7XHJcbiAgICAgICAgICAgIHRoYXQuaW50ZXJ2YWxJZCA9IHdpbmRvdy5zZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhhdC52aXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGF0LnN0b3BLaWxsU3VnZ2VzdGlvbnMoKTtcclxuICAgICAgICAgICAgfSwgNTApO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHN0b3BLaWxsU3VnZ2VzdGlvbnM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbElkKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBpc0N1cnNvckF0RW5kOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIHZhbExlbmd0aCA9IHRoYXQuZWwudmFsKCkubGVuZ3RoLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uU3RhcnQgPSB0aGF0LmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQsXHJcbiAgICAgICAgICAgICAgICByYW5nZTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2VsZWN0aW9uU3RhcnQgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZWN0aW9uU3RhcnQgPT09IHZhbExlbmd0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICByYW5nZSA9IGRvY3VtZW50LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSgpO1xyXG4gICAgICAgICAgICAgICAgcmFuZ2UubW92ZVN0YXJ0KCdjaGFyYWN0ZXInLCAtdmFsTGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWxMZW5ndGggPT09IHJhbmdlLnRleHQubGVuZ3RoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG9uS2V5UHJlc3M6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIC8vIElmIHN1Z2dlc3Rpb25zIGFyZSBoaWRkZW4gYW5kIHVzZXIgcHJlc3NlcyBhcnJvdyBkb3duLCBkaXNwbGF5IHN1Z2dlc3Rpb25zOlxyXG4gICAgICAgICAgICBpZiAoIXRoYXQuZGlzYWJsZWQgJiYgIXRoYXQudmlzaWJsZSAmJiBlLndoaWNoID09PSBrZXlzLkRPV04gJiYgdGhhdC5jdXJyZW50VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhhdC5kaXNhYmxlZCB8fCAhdGhhdC52aXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLkVTQzpcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmN1cnJlbnRWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuUklHSFQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuaGludCAmJiB0aGF0Lm9wdGlvbnMub25IaW50ICYmIHRoYXQuaXNDdXJzb3JBdEVuZCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0SGludCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlRBQjpcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5oaW50ICYmIHRoYXQub3B0aW9ucy5vbkhpbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RIaW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QodGhhdC5zZWxlY3RlZEluZGV4KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLnRhYkRpc2FibGVkID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlJFVFVSTjpcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCh0aGF0LnNlbGVjdGVkSW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlVQOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQubW92ZVVwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuRE9XTjpcclxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm1vdmVEb3duKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQ2FuY2VsIGV2ZW50IGlmIGZ1bmN0aW9uIGRpZCBub3QgcmV0dXJuOlxyXG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgb25LZXlVcDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuZGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc3dpdGNoIChlLndoaWNoKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuVVA6XHJcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuRE9XTjpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LmN1cnJlbnRWYWx1ZSAhPT0gdGhhdC5lbC52YWwoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5maW5kQmVzdEhpbnQoKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMuZGVmZXJSZXF1ZXN0QnkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRGVmZXIgbG9va3VwIGluIGNhc2Ugd2hlbiB2YWx1ZSBjaGFuZ2VzIHZlcnkgcXVpY2tseTpcclxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQub25WYWx1ZUNoYW5nZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIHRoYXQub3B0aW9ucy5kZWZlclJlcXVlc3RCeSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQub25WYWx1ZUNoYW5nZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgb25WYWx1ZUNoYW5nZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGF0LmVsLnZhbCgpLFxyXG4gICAgICAgICAgICAgICAgcXVlcnkgPSB0aGF0LmdldFF1ZXJ5KHZhbHVlKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGlvbiAmJiB0aGF0LmN1cnJlbnRWYWx1ZSAhPT0gcXVlcnkpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIChvcHRpb25zLm9uSW52YWxpZGF0ZVNlbGVjdGlvbiB8fCAkLm5vb3ApLmNhbGwodGhhdC5lbGVtZW50KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICB0aGF0LmN1cnJlbnRWYWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcclxuXHJcbiAgICAgICAgICAgIC8vIENoZWNrIGV4aXN0aW5nIHN1Z2dlc3Rpb24gZm9yIHRoZSBtYXRjaCBiZWZvcmUgcHJvY2VlZGluZzpcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dCAmJiB0aGF0LmlzRXhhY3RNYXRjaChxdWVyeSkpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KDApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAocXVlcnkubGVuZ3RoIDwgb3B0aW9ucy5taW5DaGFycykge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmdldFN1Z2dlc3Rpb25zKHF1ZXJ5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGlzRXhhY3RNYXRjaDogZnVuY3Rpb24gKHF1ZXJ5KSB7XHJcbiAgICAgICAgICAgIHZhciBzdWdnZXN0aW9ucyA9IHRoaXMuc3VnZ2VzdGlvbnM7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gKHN1Z2dlc3Rpb25zLmxlbmd0aCA9PT0gMSAmJiBzdWdnZXN0aW9uc1swXS52YWx1ZS50b0xvd2VyQ2FzZSgpID09PSBxdWVyeS50b0xvd2VyQ2FzZSgpKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBnZXRRdWVyeTogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWxpbWl0ZXIgPSB0aGlzLm9wdGlvbnMuZGVsaW1pdGVyLFxyXG4gICAgICAgICAgICAgICAgcGFydHM7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWRlbGltaXRlcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBhcnRzID0gdmFsdWUuc3BsaXQoZGVsaW1pdGVyKTtcclxuICAgICAgICAgICAgcmV0dXJuICQudHJpbShwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZ2V0U3VnZ2VzdGlvbnNMb2NhbDogZnVuY3Rpb24gKHF1ZXJ5KSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgICBxdWVyeUxvd2VyQ2FzZSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCksXHJcbiAgICAgICAgICAgICAgICBmaWx0ZXIgPSBvcHRpb25zLmxvb2t1cEZpbHRlcixcclxuICAgICAgICAgICAgICAgIGxpbWl0ID0gcGFyc2VJbnQob3B0aW9ucy5sb29rdXBMaW1pdCwgMTApLFxyXG4gICAgICAgICAgICAgICAgZGF0YTtcclxuXHJcbiAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9uczogJC5ncmVwKG9wdGlvbnMubG9va3VwLCBmdW5jdGlvbiAoc3VnZ2VzdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWx0ZXIoc3VnZ2VzdGlvbiwgcXVlcnksIHF1ZXJ5TG93ZXJDYXNlKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBpZiAobGltaXQgJiYgZGF0YS5zdWdnZXN0aW9ucy5sZW5ndGggPiBsaW1pdCkge1xyXG4gICAgICAgICAgICAgICAgZGF0YS5zdWdnZXN0aW9ucyA9IGRhdGEuc3VnZ2VzdGlvbnMuc2xpY2UoMCwgbGltaXQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBnZXRTdWdnZXN0aW9uczogZnVuY3Rpb24gKHEpIHtcclxuICAgICAgICAgICAgdmFyIHJlc3BvbnNlLFxyXG4gICAgICAgICAgICAgICAgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgc2VydmljZVVybCA9IG9wdGlvbnMuc2VydmljZVVybCxcclxuICAgICAgICAgICAgICAgIHBhcmFtcyxcclxuICAgICAgICAgICAgICAgIGNhY2hlS2V5LFxyXG4gICAgICAgICAgICAgICAgYWpheFNldHRpbmdzO1xyXG5cclxuICAgICAgICAgICAgb3B0aW9ucy5wYXJhbXNbb3B0aW9ucy5wYXJhbU5hbWVdID0gcTtcclxuICAgICAgICAgICAgcGFyYW1zID0gb3B0aW9ucy5pZ25vcmVQYXJhbXMgPyBudWxsIDogb3B0aW9ucy5wYXJhbXM7XHJcblxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5vblNlYXJjaFN0YXJ0LmNhbGwodGhhdC5lbGVtZW50LCBvcHRpb25zLnBhcmFtcykgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24ob3B0aW9ucy5sb29rdXApKXtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMubG9va3VwKHEsIGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IGRhdGEuc3VnZ2VzdGlvbnM7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaENvbXBsZXRlLmNhbGwodGhhdC5lbGVtZW50LCBxLCBkYXRhLnN1Z2dlc3Rpb25zKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhhdC5pc0xvY2FsKSB7XHJcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IHRoYXQuZ2V0U3VnZ2VzdGlvbnNMb2NhbChxKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24oc2VydmljZVVybCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlVXJsID0gc2VydmljZVVybC5jYWxsKHRoYXQuZWxlbWVudCwgcSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYWNoZUtleSA9IHNlcnZpY2VVcmwgKyAnPycgKyAkLnBhcmFtKHBhcmFtcyB8fCB7fSk7XHJcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IHRoYXQuY2FjaGVkUmVzcG9uc2VbY2FjaGVLZXldO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAocmVzcG9uc2UgJiYgJC5pc0FycmF5KHJlc3BvbnNlLnN1Z2dlc3Rpb25zKSkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IHJlc3BvbnNlLnN1Z2dlc3Rpb25zO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIHJlc3BvbnNlLnN1Z2dlc3Rpb25zKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghdGhhdC5pc0JhZFF1ZXJ5KHEpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmFib3J0QWpheCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGFqYXhTZXR0aW5ncyA9IHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IHNlcnZpY2VVcmwsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogcGFyYW1zLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IG9wdGlvbnMudHlwZSxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogb3B0aW9ucy5kYXRhVHlwZVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAkLmV4dGVuZChhamF4U2V0dGluZ3MsIG9wdGlvbnMuYWpheFNldHRpbmdzKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0ID0gJC5hamF4KGFqYXhTZXR0aW5ncykuZG9uZShmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5jdXJyZW50UmVxdWVzdCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gb3B0aW9ucy50cmFuc2Zvcm1SZXN1bHQoZGF0YSwgcSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5wcm9jZXNzUmVzcG9uc2UocmVzdWx0LCBxLCBjYWNoZUtleSk7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaENvbXBsZXRlLmNhbGwodGhhdC5lbGVtZW50LCBxLCByZXN1bHQuc3VnZ2VzdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgfSkuZmFpbChmdW5jdGlvbiAoanFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaEVycm9yLmNhbGwodGhhdC5lbGVtZW50LCBxLCBqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIFtdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGlzQmFkUXVlcnk6IGZ1bmN0aW9uIChxKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5vcHRpb25zLnByZXZlbnRCYWRRdWVyaWVzKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIGJhZFF1ZXJpZXMgPSB0aGlzLmJhZFF1ZXJpZXMsXHJcbiAgICAgICAgICAgICAgICBpID0gYmFkUXVlcmllcy5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAoaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocS5pbmRleE9mKGJhZFF1ZXJpZXNbaV0pID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBoaWRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKHRoYXQub3B0aW9ucy5vbkhpZGUpICYmIHRoYXQudmlzaWJsZSkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5vcHRpb25zLm9uSGlkZS5jYWxsKHRoYXQuZWxlbWVudCwgY29udGFpbmVyKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhhdC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xyXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuaGlkZSgpO1xyXG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQobnVsbCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc3VnZ2VzdDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zdWdnZXN0aW9ucy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2hvd05vU3VnZ2VzdGlvbk5vdGljZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm9TdWdnZXN0aW9ucygpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcclxuICAgICAgICAgICAgICAgIGdyb3VwQnkgPSBvcHRpb25zLmdyb3VwQnksXHJcbiAgICAgICAgICAgICAgICBmb3JtYXRSZXN1bHQgPSBvcHRpb25zLmZvcm1hdFJlc3VsdCxcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gdGhhdC5nZXRRdWVyeSh0aGF0LmN1cnJlbnRWYWx1ZSksXHJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSB0aGF0LmNsYXNzZXMuc3VnZ2VzdGlvbixcclxuICAgICAgICAgICAgICAgIGNsYXNzU2VsZWN0ZWQgPSB0aGF0LmNsYXNzZXMuc2VsZWN0ZWQsXHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxyXG4gICAgICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQodGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyKSxcclxuICAgICAgICAgICAgICAgIGJlZm9yZVJlbmRlciA9IG9wdGlvbnMuYmVmb3JlUmVuZGVyLFxyXG4gICAgICAgICAgICAgICAgaHRtbCA9ICcnLFxyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBmb3JtYXRHcm91cCA9IGZ1bmN0aW9uIChzdWdnZXN0aW9uLCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudENhdGVnb3J5ID0gc3VnZ2VzdGlvbi5kYXRhW2dyb3VwQnldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhdGVnb3J5ID09PSBjdXJyZW50Q2F0ZWdvcnkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeSA9IGN1cnJlbnRDYXRlZ29yeTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImF1dG9jb21wbGV0ZS1ncm91cFwiPjxzdHJvbmc+JyArIGNhdGVnb3J5ICsgJzwvc3Ryb25nPjwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQgJiYgdGhhdC5pc0V4YWN0TWF0Y2godmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCgwKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQnVpbGQgc3VnZ2VzdGlvbnMgaW5uZXIgSFRNTDpcclxuICAgICAgICAgICAgJC5lYWNoKHRoYXQuc3VnZ2VzdGlvbnMsIGZ1bmN0aW9uIChpLCBzdWdnZXN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZ3JvdXBCeSl7XHJcbiAgICAgICAgICAgICAgICAgICAgaHRtbCArPSBmb3JtYXRHcm91cChzdWdnZXN0aW9uLCB2YWx1ZSwgaSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cIicgKyBjbGFzc05hbWUgKyAnXCIgZGF0YS1pbmRleD1cIicgKyBpICsgJ1wiPicgKyBmb3JtYXRSZXN1bHQoc3VnZ2VzdGlvbiwgdmFsdWUpICsgJzwvZGl2Pic7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hZGp1c3RDb250YWluZXJXaWR0aCgpO1xyXG5cclxuICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lci5kZXRhY2goKTtcclxuICAgICAgICAgICAgY29udGFpbmVyLmh0bWwoaHRtbCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKGJlZm9yZVJlbmRlcikpIHtcclxuICAgICAgICAgICAgICAgIGJlZm9yZVJlbmRlci5jYWxsKHRoYXQuZWxlbWVudCwgY29udGFpbmVyKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xyXG4gICAgICAgICAgICBjb250YWluZXIuc2hvdygpO1xyXG5cclxuICAgICAgICAgICAgLy8gU2VsZWN0IGZpcnN0IHZhbHVlIGJ5IGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmF1dG9TZWxlY3RGaXJzdCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gMDtcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5zY3JvbGxUb3AoMCk7XHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIuY2hpbGRyZW4oJy4nICsgY2xhc3NOYW1lKS5maXJzdCgpLmFkZENsYXNzKGNsYXNzU2VsZWN0ZWQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGF0LnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGF0LmZpbmRCZXN0SGludCgpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG5vU3VnZ2VzdGlvbnM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXHJcbiAgICAgICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQodGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWRqdXN0Q29udGFpbmVyV2lkdGgoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNvbWUgZXhwbGljaXQgc3RlcHMuIEJlIGNhcmVmdWwgaGVyZSBhcyBpdCBlYXN5IHRvIGdldFxyXG4gICAgICAgICAgICAvLyBub1N1Z2dlc3Rpb25zQ29udGFpbmVyIHJlbW92ZWQgZnJvbSBET00gaWYgbm90IGRldGFjaGVkIHByb3Blcmx5LlxyXG4gICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyLmRldGFjaCgpO1xyXG4gICAgICAgICAgICBjb250YWluZXIuZW1wdHkoKTsgLy8gY2xlYW4gc3VnZ2VzdGlvbnMgaWYgYW55XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmQobm9TdWdnZXN0aW9uc0NvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICBjb250YWluZXIuc2hvdygpO1xyXG4gICAgICAgICAgICB0aGF0LnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGFkanVzdENvbnRhaW5lcldpZHRoOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcclxuICAgICAgICAgICAgICAgIHdpZHRoLFxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIHdpZHRoIGlzIGF1dG8sIGFkanVzdCB3aWR0aCBiZWZvcmUgZGlzcGxheWluZyBzdWdnZXN0aW9ucyxcclxuICAgICAgICAgICAgLy8gYmVjYXVzZSBpZiBpbnN0YW5jZSB3YXMgY3JlYXRlZCBiZWZvcmUgaW5wdXQgaGFkIHdpZHRoLCBpdCB3aWxsIGJlIHplcm8uXHJcbiAgICAgICAgICAgIC8vIEFsc28gaXQgYWRqdXN0cyBpZiBpbnB1dCB3aWR0aCBoYXMgY2hhbmdlZC5cclxuICAgICAgICAgICAgLy8gLTJweCB0byBhY2NvdW50IGZvciBzdWdnZXN0aW9ucyBib3JkZXIuXHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLndpZHRoID09PSAnYXV0bycpIHtcclxuICAgICAgICAgICAgICAgIHdpZHRoID0gdGhhdC5lbC5vdXRlcldpZHRoKCkgLSAyO1xyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyLndpZHRoKHdpZHRoID4gMCA/IHdpZHRoIDogMzAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGZpbmRCZXN0SGludDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoYXQuZWwudmFsKCkudG9Mb3dlckNhc2UoKSxcclxuICAgICAgICAgICAgICAgIGJlc3RNYXRjaCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICQuZWFjaCh0aGF0LnN1Z2dlc3Rpb25zLCBmdW5jdGlvbiAoaSwgc3VnZ2VzdGlvbikge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZvdW5kTWF0Y2ggPSBzdWdnZXN0aW9uLnZhbHVlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZih2YWx1ZSkgPT09IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAoZm91bmRNYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaCA9IHN1Z2dlc3Rpb247XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gIWZvdW5kTWF0Y2g7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KGJlc3RNYXRjaCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2lnbmFsSGludDogZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcclxuICAgICAgICAgICAgdmFyIGhpbnRWYWx1ZSA9ICcnLFxyXG4gICAgICAgICAgICAgICAgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgIGlmIChzdWdnZXN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBoaW50VmFsdWUgPSB0aGF0LmN1cnJlbnRWYWx1ZSArIHN1Z2dlc3Rpb24udmFsdWUuc3Vic3RyKHRoYXQuY3VycmVudFZhbHVlLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoYXQuaGludFZhbHVlICE9PSBoaW50VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuaGludFZhbHVlID0gaGludFZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5oaW50ID0gc3VnZ2VzdGlvbjtcclxuICAgICAgICAgICAgICAgICh0aGlzLm9wdGlvbnMub25IaW50IHx8ICQubm9vcCkoaGludFZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHZlcmlmeVN1Z2dlc3Rpb25zRm9ybWF0OiBmdW5jdGlvbiAoc3VnZ2VzdGlvbnMpIHtcclxuICAgICAgICAgICAgLy8gSWYgc3VnZ2VzdGlvbnMgaXMgc3RyaW5nIGFycmF5LCBjb252ZXJ0IHRoZW0gdG8gc3VwcG9ydGVkIGZvcm1hdDpcclxuICAgICAgICAgICAgaWYgKHN1Z2dlc3Rpb25zLmxlbmd0aCAmJiB0eXBlb2Ygc3VnZ2VzdGlvbnNbMF0gPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJC5tYXAoc3VnZ2VzdGlvbnMsIGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiB2YWx1ZSwgZGF0YTogbnVsbCB9O1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdWdnZXN0aW9ucztcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICB2YWxpZGF0ZU9yaWVudGF0aW9uOiBmdW5jdGlvbihvcmllbnRhdGlvbiwgZmFsbGJhY2spIHtcclxuICAgICAgICAgICAgb3JpZW50YXRpb24gPSAkLnRyaW0ob3JpZW50YXRpb24gfHwgJycpLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gICAgICAgICAgICBpZigkLmluQXJyYXkob3JpZW50YXRpb24sIFsnYXV0bycsICdib3R0b20nLCAndG9wJ10pID09PSAtMSl7XHJcbiAgICAgICAgICAgICAgICBvcmllbnRhdGlvbiA9IGZhbGxiYWNrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gb3JpZW50YXRpb247XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgcHJvY2Vzc1Jlc3BvbnNlOiBmdW5jdGlvbiAocmVzdWx0LCBvcmlnaW5hbFF1ZXJ5LCBjYWNoZUtleSkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zO1xyXG5cclxuICAgICAgICAgICAgcmVzdWx0LnN1Z2dlc3Rpb25zID0gdGhhdC52ZXJpZnlTdWdnZXN0aW9uc0Zvcm1hdChyZXN1bHQuc3VnZ2VzdGlvbnMpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ2FjaGUgcmVzdWx0cyBpZiBjYWNoZSBpcyBub3QgZGlzYWJsZWQ6XHJcbiAgICAgICAgICAgIGlmICghb3B0aW9ucy5ub0NhY2hlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmNhY2hlZFJlc3BvbnNlW2NhY2hlS2V5XSA9IHJlc3VsdDtcclxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnByZXZlbnRCYWRRdWVyaWVzICYmIHJlc3VsdC5zdWdnZXN0aW9ucy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmJhZFF1ZXJpZXMucHVzaChvcmlnaW5hbFF1ZXJ5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gUmV0dXJuIGlmIG9yaWdpbmFsUXVlcnkgaXMgbm90IG1hdGNoaW5nIGN1cnJlbnQgcXVlcnk6XHJcbiAgICAgICAgICAgIGlmIChvcmlnaW5hbFF1ZXJ5ICE9PSB0aGF0LmdldFF1ZXJ5KHRoYXQuY3VycmVudFZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gcmVzdWx0LnN1Z2dlc3Rpb25zO1xyXG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBhY3RpdmF0ZTogZnVuY3Rpb24gKGluZGV4KSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIGFjdGl2ZUl0ZW0sXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZCA9IHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCxcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlbiA9IGNvbnRhaW5lci5maW5kKCcuJyArIHRoYXQuY2xhc3Nlcy5zdWdnZXN0aW9uKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5maW5kKCcuJyArIHNlbGVjdGVkKS5yZW1vdmVDbGFzcyhzZWxlY3RlZCk7XHJcblxyXG4gICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSBpbmRleDtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggIT09IC0xICYmIGNoaWxkcmVuLmxlbmd0aCA+IHRoYXQuc2VsZWN0ZWRJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgYWN0aXZlSXRlbSA9IGNoaWxkcmVuLmdldCh0aGF0LnNlbGVjdGVkSW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgJChhY3RpdmVJdGVtKS5hZGRDbGFzcyhzZWxlY3RlZCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYWN0aXZlSXRlbTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2VsZWN0SGludDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBpID0gJC5pbkFycmF5KHRoYXQuaGludCwgdGhhdC5zdWdnZXN0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICB0aGF0LnNlbGVjdChpKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzZWxlY3Q6IGZ1bmN0aW9uIChpKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgdGhhdC5oaWRlKCk7XHJcbiAgICAgICAgICAgIHRoYXQub25TZWxlY3QoaSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgbW92ZVVwOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuY2hpbGRyZW4oKS5maXJzdCgpLnJlbW92ZUNsYXNzKHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCk7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcclxuICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHRoYXQuZmluZEJlc3RIaW50KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoYXQuYWRqdXN0U2Nyb2xsKHRoYXQuc2VsZWN0ZWRJbmRleCAtIDEpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG1vdmVEb3duOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09ICh0aGF0LnN1Z2dlc3Rpb25zLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoYXQuYWRqdXN0U2Nyb2xsKHRoYXQuc2VsZWN0ZWRJbmRleCArIDEpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGFkanVzdFNjcm9sbDogZnVuY3Rpb24gKGluZGV4KSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIGFjdGl2ZUl0ZW0gPSB0aGF0LmFjdGl2YXRlKGluZGV4KTtcclxuXHJcbiAgICAgICAgICAgIGlmICghYWN0aXZlSXRlbSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0VG9wLFxyXG4gICAgICAgICAgICAgICAgdXBwZXJCb3VuZCxcclxuICAgICAgICAgICAgICAgIGxvd2VyQm91bmQsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHREZWx0YSA9ICQoYWN0aXZlSXRlbSkub3V0ZXJIZWlnaHQoKTtcclxuXHJcbiAgICAgICAgICAgIG9mZnNldFRvcCA9IGFjdGl2ZUl0ZW0ub2Zmc2V0VG9wO1xyXG4gICAgICAgICAgICB1cHBlckJvdW5kID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5zY3JvbGxUb3AoKTtcclxuICAgICAgICAgICAgbG93ZXJCb3VuZCA9IHVwcGVyQm91bmQgKyB0aGF0Lm9wdGlvbnMubWF4SGVpZ2h0IC0gaGVpZ2h0RGVsdGE7XHJcblxyXG4gICAgICAgICAgICBpZiAob2Zmc2V0VG9wIDwgdXBwZXJCb3VuZCkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5zY3JvbGxUb3Aob2Zmc2V0VG9wKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChvZmZzZXRUb3AgPiBsb3dlckJvdW5kKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnNjcm9sbFRvcChvZmZzZXRUb3AgLSB0aGF0Lm9wdGlvbnMubWF4SGVpZ2h0ICsgaGVpZ2h0RGVsdGEpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRoYXQub3B0aW9ucy5wcmVzZXJ2ZUlucHV0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmdldFZhbHVlKHRoYXQuc3VnZ2VzdGlvbnNbaW5kZXhdLnZhbHVlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KG51bGwpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG9uU2VsZWN0OiBmdW5jdGlvbiAoaW5kZXgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgb25TZWxlY3RDYWxsYmFjayA9IHRoYXQub3B0aW9ucy5vblNlbGVjdCxcclxuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb24gPSB0aGF0LnN1Z2dlc3Rpb25zW2luZGV4XTtcclxuXHJcbiAgICAgICAgICAgIHRoYXQuY3VycmVudFZhbHVlID0gdGhhdC5nZXRWYWx1ZShzdWdnZXN0aW9uLnZhbHVlKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LmN1cnJlbnRWYWx1ZSAhPT0gdGhhdC5lbC52YWwoKSAmJiAhdGhhdC5vcHRpb25zLnByZXNlcnZlSW5wdXQpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KG51bGwpO1xyXG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gW107XHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uID0gc3VnZ2VzdGlvbjtcclxuXHJcbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24ob25TZWxlY3RDYWxsYmFjaykpIHtcclxuICAgICAgICAgICAgICAgIG9uU2VsZWN0Q2FsbGJhY2suY2FsbCh0aGF0LmVsZW1lbnQsIHN1Z2dlc3Rpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZ2V0VmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBkZWxpbWl0ZXIgPSB0aGF0Lm9wdGlvbnMuZGVsaW1pdGVyLFxyXG4gICAgICAgICAgICAgICAgY3VycmVudFZhbHVlLFxyXG4gICAgICAgICAgICAgICAgcGFydHM7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWRlbGltaXRlcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjdXJyZW50VmFsdWUgPSB0aGF0LmN1cnJlbnRWYWx1ZTtcclxuICAgICAgICAgICAgcGFydHMgPSBjdXJyZW50VmFsdWUuc3BsaXQoZGVsaW1pdGVyKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRWYWx1ZS5zdWJzdHIoMCwgY3VycmVudFZhbHVlLmxlbmd0aCAtIHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdLmxlbmd0aCkgKyB2YWx1ZTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBkaXNwb3NlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgdGhhdC5lbC5vZmYoJy5hdXRvY29tcGxldGUnKS5yZW1vdmVEYXRhKCdhdXRvY29tcGxldGUnKTtcclxuICAgICAgICAgICAgdGhhdC5kaXNhYmxlS2lsbGVyRm4oKTtcclxuICAgICAgICAgICAgJCh3aW5kb3cpLm9mZigncmVzaXplLmF1dG9jb21wbGV0ZScsIHRoYXQuZml4UG9zaXRpb25DYXB0dXJlKTtcclxuICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5yZW1vdmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIENyZWF0ZSBjaGFpbmFibGUgalF1ZXJ5IHBsdWdpbjpcclxuICAgICQuZm4uYXV0b2NvbXBsZXRlID0gJC5mbi5kZXZicmlkZ2VBdXRvY29tcGxldGUgPSBmdW5jdGlvbiAob3B0aW9ucywgYXJncykge1xyXG4gICAgICAgIHZhciBkYXRhS2V5ID0gJ2F1dG9jb21wbGV0ZSc7XHJcbiAgICAgICAgLy8gSWYgZnVuY3Rpb24gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50IHJldHVyblxyXG4gICAgICAgIC8vIGluc3RhbmNlIG9mIHRoZSBmaXJzdCBtYXRjaGVkIGVsZW1lbnQ6XHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlyc3QoKS5kYXRhKGRhdGFLZXkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBpbnB1dEVsZW1lbnQgPSAkKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBpbnB1dEVsZW1lbnQuZGF0YShkYXRhS2V5KTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZSAmJiB0eXBlb2YgaW5zdGFuY2Vbb3B0aW9uc10gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZVtvcHRpb25zXShhcmdzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIGluc3RhbmNlIGFscmVhZHkgZXhpc3RzLCBkZXN0cm95IGl0OlxyXG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlICYmIGluc3RhbmNlLmRpc3Bvc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IG5ldyBBdXRvY29tcGxldGUodGhpcywgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICBpbnB1dEVsZW1lbnQuZGF0YShkYXRhS2V5LCBpbnN0YW5jZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbn0pKTtcclxuIiwidmFyIG5vdGlmaWNhdGlvbiA9IChmdW5jdGlvbigpIHtcclxuICB2YXIgY29udGVpbmVyO1xyXG4gIHZhciBtb3VzZU92ZXIgPSAwO1xyXG4gIHZhciB0aW1lckNsZWFyQWxsID0gbnVsbDtcclxuICB2YXIgYW5pbWF0aW9uRW5kID0gJ3dlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmQnO1xyXG4gIHZhciB0aW1lID0gMTAwMDA7XHJcblxyXG4gIHZhciBub3RpZmljYXRpb25fYm94ID1mYWxzZTtcclxuICB2YXIgaXNfaW5pdD1mYWxzZTtcclxuICB2YXIgY29uZmlybV9vcHQ9e1xyXG4gICAgdGl0bGU6XCLQo9C00LDQu9C10L3QuNC1XCIsXHJcbiAgICBxdWVzdGlvbjpcItCS0Ysg0LTQtdC50YHRgtCy0LjRgtC10LvRjNC90L4g0YXQvtGC0LjRgtC1INGD0LTQsNC70LjRgtGMP1wiLFxyXG4gICAgYnV0dG9uWWVzOlwi0JTQsFwiLFxyXG4gICAgYnV0dG9uTm86XCLQndC10YJcIixcclxuICAgIGNhbGxiYWNrWWVzOmZhbHNlLFxyXG4gICAgY2FsbGJhY2tObzpmYWxzZSxcclxuICAgIG9iajpmYWxzZSxcclxuICAgIGJ1dHRvblRhZzonZGl2JyxcclxuICAgIGJ1dHRvblllc0RvcDonJyxcclxuICAgIGJ1dHRvbk5vRG9wOicnLFxyXG4gIH07XHJcbiAgdmFyIGFsZXJ0X29wdD17XHJcbiAgICB0aXRsZTpcIlwiLFxyXG4gICAgcXVlc3Rpb246XCLQodC+0L7QsdGJ0LXQvdC40LVcIixcclxuICAgIGJ1dHRvblllczpcItCU0LBcIixcclxuICAgIGNhbGxiYWNrWWVzOmZhbHNlLFxyXG4gICAgYnV0dG9uVGFnOidkaXYnLFxyXG4gICAgb2JqOmZhbHNlLFxyXG4gIH07XHJcblxyXG5cclxuICBmdW5jdGlvbiBpbml0KCl7XHJcbiAgICBpc19pbml0PXRydWU7XHJcbiAgICBub3RpZmljYXRpb25fYm94PSQoJy5ub3RpZmljYXRpb25fYm94Jyk7XHJcbiAgICBpZihub3RpZmljYXRpb25fYm94Lmxlbmd0aD4wKXJldHVybjtcclxuXHJcbiAgICAkKCdib2R5JykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nbm90aWZpY2F0aW9uX2JveCc+PC9kaXY+XCIpO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveD0kKCcubm90aWZpY2F0aW9uX2JveCcpO1xyXG5cclxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywnLm5vdGlmeV9jb250cm9sJyxjbG9zZU1vZGFsKTtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywnLm5vdGlmeV9jbG9zZScsY2xvc2VNb2RhbCk7XHJcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsY2xvc2VNb2RhbEZvbik7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjbG9zZU1vZGFsKCl7XHJcbiAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjbG9zZU1vZGFsRm9uKGUpe1xyXG4gICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcclxuICAgIGlmKHRhcmdldC5jbGFzc05hbWU9PVwibm90aWZpY2F0aW9uX2JveFwiKXtcclxuICAgICAgY2xvc2VNb2RhbCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdmFyIF9zZXRVcExpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJCgnYm9keScpLm9uKCdjbGljaycsICcubm90aWZpY2F0aW9uX2Nsb3NlJywgX2Nsb3NlUG9wdXApO1xyXG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWVudGVyJywgJy5ub3RpZmljYXRpb25fY29udGFpbmVyJywgX29uRW50ZXIpO1xyXG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWxlYXZlJywgJy5ub3RpZmljYXRpb25fY29udGFpbmVyJywgX29uTGVhdmUpO1xyXG4gIH07XHJcblxyXG4gIHZhciBfb25FbnRlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBpZihldmVudClldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgaWYgKHRpbWVyQ2xlYXJBbGwhPW51bGwpIHtcclxuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyQ2xlYXJBbGwpO1xyXG4gICAgICB0aW1lckNsZWFyQWxsID0gbnVsbDtcclxuICAgIH1cclxuICAgIGNvbnRlaW5lci5maW5kKCcubm90aWZpY2F0aW9uX2l0ZW0nKS5lYWNoKGZ1bmN0aW9uKGkpe1xyXG4gICAgICB2YXIgb3B0aW9uPSQodGhpcykuZGF0YSgnb3B0aW9uJyk7XHJcbiAgICAgIGlmKG9wdGlvbi50aW1lcikge1xyXG4gICAgICAgIGNsZWFyVGltZW91dChvcHRpb24udGltZXIpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIG1vdXNlT3ZlciA9IDE7XHJcbiAgfTtcclxuXHJcbiAgdmFyIF9vbkxlYXZlID0gZnVuY3Rpb24oKSB7XHJcbiAgICBjb250ZWluZXIuZmluZCgnLm5vdGlmaWNhdGlvbl9pdGVtJykuZWFjaChmdW5jdGlvbihpKXtcclxuICAgICAgJHRoaXM9JCh0aGlzKTtcclxuICAgICAgdmFyIG9wdGlvbj0kdGhpcy5kYXRhKCdvcHRpb24nKTtcclxuICAgICAgaWYob3B0aW9uLnRpbWU+MCkge1xyXG4gICAgICAgIG9wdGlvbi50aW1lciA9IHNldFRpbWVvdXQoX2Nsb3NlUG9wdXAuYmluZChvcHRpb24uY2xvc2UpLCBvcHRpb24udGltZSAtIDE1MDAgKyAxMDAgKiBpKTtcclxuICAgICAgICAkdGhpcy5kYXRhKCdvcHRpb24nLG9wdGlvbilcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBtb3VzZU92ZXIgPSAwO1xyXG4gIH07XHJcblxyXG4gIHZhciBfY2xvc2VQb3B1cCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBpZihldmVudClldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgIHZhciAkdGhpcyA9ICQodGhpcykucGFyZW50KCk7XHJcbiAgICAkdGhpcy5vbihhbmltYXRpb25FbmQsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAkKHRoaXMpLnJlbW92ZSgpO1xyXG4gICAgfSk7XHJcbiAgICAkdGhpcy5hZGRDbGFzcygnbm90aWZpY2F0aW9uX2hpZGUnKVxyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIGFsZXJ0KGRhdGEpe1xyXG4gICAgaWYoIWRhdGEpZGF0YT17fTtcclxuICAgIGRhdGE9b2JqZWN0cyhhbGVydF9vcHQsZGF0YSk7XHJcblxyXG4gICAgaWYoIWlzX2luaXQpaW5pdCgpO1xyXG5cclxuICAgIG5vdHlmeV9jbGFzcz0nbm90aWZ5X2JveCAnO1xyXG4gICAgaWYoZGF0YS5ub3R5ZnlfY2xhc3Mpbm90eWZ5X2NsYXNzKz1kYXRhLm5vdHlmeV9jbGFzcztcclxuXHJcbiAgICBib3hfaHRtbD0nPGRpdiBjbGFzcz1cIicrbm90eWZ5X2NsYXNzKydcIj4nO1xyXG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X3RpdGxlXCI+JztcclxuICAgIGJveF9odG1sKz1kYXRhLnRpdGxlO1xyXG4gICAgYm94X2h0bWwrPSc8c3BhbiBjbGFzcz1cIm5vdGlmeV9jbG9zZVwiPjwvc3Bhbj4nO1xyXG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xyXG5cclxuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcclxuICAgIGJveF9odG1sKz1kYXRhLnF1ZXN0aW9uO1xyXG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xyXG5cclxuICAgIGlmKGRhdGEuYnV0dG9uWWVzfHxkYXRhLmJ1dHRvbk5vKSB7XHJcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xyXG4gICAgICBpZiAoZGF0YS5idXR0b25ZZXMpYm94X2h0bWwgKz0gJzwnK2RhdGEuYnV0dG9uVGFnKycgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiICcrZGF0YS5idXR0b25ZZXNEb3ArJz4nICsgZGF0YS5idXR0b25ZZXMgKyAnPC8nK2RhdGEuYnV0dG9uVGFnKyc+JztcclxuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzwnK2RhdGEuYnV0dG9uVGFnKycgY2xhc3M9XCJub3RpZnlfYnRuX25vXCIgJytkYXRhLmJ1dHRvbk5vRG9wKyc+JyArIGRhdGEuYnV0dG9uTm8gKyAnPC8nK2RhdGEuYnV0dG9uVGFnKyc+JztcclxuICAgICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcbiAgICB9O1xyXG5cclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XHJcblxyXG5cclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcclxuICAgIH0sMTAwKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29uZmlybShkYXRhKXtcclxuICAgIGlmKCFkYXRhKWRhdGE9e307XHJcbiAgICBkYXRhPW9iamVjdHMoY29uZmlybV9vcHQsZGF0YSk7XHJcblxyXG4gICAgaWYoIWlzX2luaXQpaW5pdCgpO1xyXG5cclxuICAgIGJveF9odG1sPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveFwiPic7XHJcbiAgICBib3hfaHRtbCs9JzxkaXYgY2xhc3M9XCJub3RpZnlfdGl0bGVcIj4nO1xyXG4gICAgYm94X2h0bWwrPWRhdGEudGl0bGU7XHJcbiAgICBib3hfaHRtbCs9JzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XHJcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XHJcblxyXG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRlbnRcIj4nO1xyXG4gICAgYm94X2h0bWwrPWRhdGEucXVlc3Rpb247XHJcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XHJcblxyXG4gICAgaWYoZGF0YS5idXR0b25ZZXN8fGRhdGEuYnV0dG9uTm8pIHtcclxuICAgICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udHJvbFwiPic7XHJcbiAgICAgIGlmIChkYXRhLmJ1dHRvblllcylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5feWVzXCI+JyArIGRhdGEuYnV0dG9uWWVzICsgJzwvZGl2Pic7XHJcbiAgICAgIGlmIChkYXRhLmJ1dHRvbk5vKWJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2J0bl9ub1wiPicgKyBkYXRhLmJ1dHRvbk5vICsgJzwvZGl2Pic7XHJcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG4gICAgfVxyXG5cclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XHJcblxyXG4gICAgaWYoZGF0YS5jYWxsYmFja1llcyE9ZmFsc2Upe1xyXG4gICAgICBub3RpZmljYXRpb25fYm94LmZpbmQoJy5ub3RpZnlfYnRuX3llcycpLm9uKCdjbGljaycsZGF0YS5jYWxsYmFja1llcy5iaW5kKGRhdGEub2JqKSk7XHJcbiAgICB9XHJcbiAgICBpZihkYXRhLmNhbGxiYWNrTm8hPWZhbHNlKXtcclxuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl9ubycpLm9uKCdjbGljaycsZGF0YS5jYWxsYmFja05vLmJpbmQoZGF0YS5vYmopKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XHJcbiAgICB9LDEwMClcclxuXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBub3RpZmkoZGF0YSkge1xyXG4gICAgaWYoIWRhdGEpZGF0YT17fTtcclxuICAgIHZhciBvcHRpb24gPSB7dGltZSA6IChkYXRhLnRpbWV8fGRhdGEudGltZT09PTApP2RhdGEudGltZTp0aW1lfTtcclxuICAgIGlmICghY29udGVpbmVyKSB7XHJcbiAgICAgIGNvbnRlaW5lciA9ICQoJzx1bC8+Jywge1xyXG4gICAgICAgICdjbGFzcyc6ICdub3RpZmljYXRpb25fY29udGFpbmVyJ1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgICQoJ2JvZHknKS5hcHBlbmQoY29udGVpbmVyKTtcclxuICAgICAgX3NldFVwTGlzdGVuZXJzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGxpID0gJCgnPGxpLz4nLCB7XHJcbiAgICAgIGNsYXNzOiAnbm90aWZpY2F0aW9uX2l0ZW0nXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoZGF0YS50eXBlKXtcclxuICAgICAgbGkuYWRkQ2xhc3MoJ25vdGlmaWNhdGlvbl9pdGVtLScgKyBkYXRhLnR5cGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBjbG9zZT0kKCc8c3Bhbi8+Jyx7XHJcbiAgICAgIGNsYXNzOidub3RpZmljYXRpb25fY2xvc2UnXHJcbiAgICB9KTtcclxuICAgIG9wdGlvbi5jbG9zZT1jbG9zZTtcclxuICAgIGxpLmFwcGVuZChjbG9zZSk7XHJcblxyXG4gICAgaWYoZGF0YS5pbWcgJiYgZGF0YS5pbWcubGVuZ3RoPjApIHtcclxuICAgICAgdmFyIGltZyA9ICQoJzxkaXYvPicsIHtcclxuICAgICAgICBjbGFzczogXCJub3RpZmljYXRpb25faW1nXCJcclxuICAgICAgfSk7XHJcbiAgICAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytkYXRhLmltZysnKScpO1xyXG4gICAgICBsaS5hcHBlbmQoaW1nKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgY29udGVudCA9ICQoJzxkaXYvPicse1xyXG4gICAgICBjbGFzczpcIm5vdGlmaWNhdGlvbl9jb250ZW50XCJcclxuICAgIH0pO1xyXG5cclxuICAgIGlmKGRhdGEudGl0bGUgJiYgZGF0YS50aXRsZS5sZW5ndGg+MCkge1xyXG4gICAgICB2YXIgdGl0bGUgPSAkKCc8aDUvPicsIHtcclxuICAgICAgICBjbGFzczogXCJub3RpZmljYXRpb25fdGl0bGVcIlxyXG4gICAgICB9KTtcclxuICAgICAgdGl0bGUuaHRtbChkYXRhLnRpdGxlKTtcclxuICAgICAgY29udGVudC5hcHBlbmQodGl0bGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB0ZXh0PSAkKCc8ZGl2Lz4nLHtcclxuICAgICAgY2xhc3M6XCJub3RpZmljYXRpb25fdGV4dFwiXHJcbiAgICB9KTtcclxuICAgIHRleHQuaHRtbChkYXRhLm1lc3NhZ2UpO1xyXG4gICAgY29udGVudC5hcHBlbmQodGV4dCk7XHJcblxyXG4gICAgbGkuYXBwZW5kKGNvbnRlbnQpO1xyXG5cclxuICAgIC8vXHJcbiAgICAvLyBpZihkYXRhLnRpdGxlICYmIGRhdGEudGl0bGUubGVuZ3RoPjApIHtcclxuICAgIC8vICAgdmFyIHRpdGxlID0gJCgnPHAvPicsIHtcclxuICAgIC8vICAgICBjbGFzczogXCJub3RpZmljYXRpb25fdGl0bGVcIlxyXG4gICAgLy8gICB9KTtcclxuICAgIC8vICAgdGl0bGUuaHRtbChkYXRhLnRpdGxlKTtcclxuICAgIC8vICAgbGkuYXBwZW5kKHRpdGxlKTtcclxuICAgIC8vIH1cclxuICAgIC8vXHJcbiAgICAvLyBpZihkYXRhLmltZyAmJiBkYXRhLmltZy5sZW5ndGg+MCkge1xyXG4gICAgLy8gICB2YXIgaW1nID0gJCgnPGRpdi8+Jywge1xyXG4gICAgLy8gICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl9pbWdcIlxyXG4gICAgLy8gICB9KTtcclxuICAgIC8vICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgnK2RhdGEuaW1nKycpJyk7XHJcbiAgICAvLyAgIGxpLmFwcGVuZChpbWcpO1xyXG4gICAgLy8gfVxyXG4gICAgLy9cclxuICAgIC8vIHZhciBjb250ZW50ID0gJCgnPGRpdi8+Jyx7XHJcbiAgICAvLyAgIGNsYXNzOlwibm90aWZpY2F0aW9uX2NvbnRlbnRcIlxyXG4gICAgLy8gfSk7XHJcbiAgICAvLyBjb250ZW50Lmh0bWwoZGF0YS5tZXNzYWdlKTtcclxuICAgIC8vXHJcbiAgICAvLyBsaS5hcHBlbmQoY29udGVudCk7XHJcbiAgICAvL1xyXG4gICAgIGNvbnRlaW5lci5hcHBlbmQobGkpO1xyXG5cclxuICAgIGlmKG9wdGlvbi50aW1lPjApe1xyXG4gICAgICBvcHRpb24udGltZXI9c2V0VGltZW91dChfY2xvc2VQb3B1cC5iaW5kKGNsb3NlKSwgb3B0aW9uLnRpbWUpO1xyXG4gICAgfVxyXG4gICAgbGkuZGF0YSgnb3B0aW9uJyxvcHRpb24pXHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgYWxlcnQ6IGFsZXJ0LFxyXG4gICAgY29uZmlybTogY29uZmlybSxcclxuICAgIG5vdGlmaTogbm90aWZpLFxyXG4gIH07XHJcblxyXG59KSgpO1xyXG5cclxuXHJcbiQoJ1tyZWY9cG9wdXBdJykub24oJ2NsaWNrJyxmdW5jdGlvbiAoZSl7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICR0aGlzPSQodGhpcyk7XHJcbiAgZWw9JCgkdGhpcy5hdHRyKCdocmVmJykpO1xyXG4gIGRhdGE9ZWwuZGF0YSgpO1xyXG5cclxuICBkYXRhLnF1ZXN0aW9uPWVsLmh0bWwoKTtcclxuICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XHJcbn0pO1xyXG4iLCI7XHJcbiQoZnVuY3Rpb24oKSB7XHJcbiAgZnVuY3Rpb24gb25SZW1vdmUoKXtcclxuICAgICR0aGlzPSQodGhpcyk7XHJcbiAgICBwb3N0PXtcclxuICAgICAgaWQ6JHRoaXMuYXR0cigndWlkJyksXHJcbiAgICAgIHR5cGU6JHRoaXMuYXR0cignbW9kZScpXHJcbiAgICB9O1xyXG4gICAgJC5wb3N0KCR0aGlzLmF0dHIoJ3VybCcpLHBvc3QsZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgIGlmKGRhdGEgJiYgZGF0YT09J2Vycicpe1xyXG4gICAgICAgIG1zZz0kdGhpcy5kYXRhKCdyZW1vdmUtZXJyb3InKTtcclxuICAgICAgICBpZighbXNnKXtcclxuICAgICAgICAgIG1zZz0n0J3QtdCy0L7Qt9C80L7QttC90L4g0YPQtNCw0LvQuNGC0Ywg0Y3Qu9C10LzQtdC90YInO1xyXG4gICAgICAgIH1cclxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOm1zZyx0eXBlOidlcnInfSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBtb2RlPSR0aGlzLmF0dHIoJ21vZGUnKTtcclxuICAgICAgaWYoIW1vZGUpe1xyXG4gICAgICAgIG1vZGU9J3JtJztcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYobW9kZT09J3JtJykge1xyXG4gICAgICAgIHJtID0gJHRoaXMuY2xvc2VzdCgnLnRvX3JlbW92ZScpO1xyXG4gICAgICAgIHJtX2NsYXNzID0gcm0uYXR0cigncm1fY2xhc3MnKTtcclxuICAgICAgICBpZiAocm1fY2xhc3MpIHtcclxuICAgICAgICAgICQocm1fY2xhc3MpLnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcm0ucmVtb3ZlKCk7XHJcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0KPRgdC/0LXRiNC90L7QtSDRg9C00LDQu9C10L3QuNC1LicsdHlwZTonaW5mbyd9KVxyXG4gICAgICB9XHJcbiAgICAgIGlmKG1vZGU9PSdyZWxvYWQnKXtcclxuICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgICAgICBsb2NhdGlvbi5ocmVmPWxvY2F0aW9uLmhyZWY7XHJcbiAgICAgIH1cclxuICAgIH0pLmZhaWwoZnVuY3Rpb24oKXtcclxuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0J7RiNC40LHQutCwINGD0LTQsNC70L3QuNGPJyx0eXBlOidlcnInfSk7XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgJCgnYm9keScpLm9uKCdjbGljaycsJy5hamF4X3JlbW92ZScsZnVuY3Rpb24oKXtcclxuICAgIG5vdGlmaWNhdGlvbi5jb25maXJtKHtcclxuICAgICAgY2FsbGJhY2tZZXM6b25SZW1vdmUsXHJcbiAgICAgIG9iajokKHRoaXMpXHJcbiAgICB9KVxyXG4gIH0pO1xyXG5cclxufSk7XHJcblxyXG4iLCIvLyQod2luZG93KS5sb2FkKGZ1bmN0aW9uKCkge1xyXG5cclxudmFyIGFjY29yZGlvbkNvbnRyb2wgPSAkKCcuYWNjb3JkaW9uIC5hY2NvcmRpb24tY29udHJvbCcpO1xyXG5cclxuYWNjb3JkaW9uQ29udHJvbC5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgJGFjY29yZGlvbiA9ICR0aGlzLmNsb3Nlc3QoJy5hY2NvcmRpb24nKTtcclxuXHJcbiAgICBpZiAoJGFjY29yZGlvbi5oYXNDbGFzcygnb3BlbicpKSB7XHJcbiAgICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50JykuaGlkZSgzMDApO1xyXG4gICAgICAkYWNjb3JkaW9uLnJlbW92ZUNsYXNzKCdvcGVuJylcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50Jykuc2hvdygzMDApO1xyXG4gICAgICAkYWNjb3JkaW9uLmFkZENsYXNzKCdvcGVuJylcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9KTtcclxuYWNjb3JkaW9uQ29udHJvbC5zaG93KCk7XHJcbi8vfSlcclxuXHJcbm9iamVjdHMgPSBmdW5jdGlvbiAoYSxiKSB7XHJcbiAgdmFyIGMgPSBiLFxyXG4gICAga2V5O1xyXG4gIGZvciAoa2V5IGluIGEpIHtcclxuICAgIGlmIChhLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgY1trZXldID0ga2V5IGluIGIgPyBiW2tleV0gOiBhW2tleV07XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBjO1xyXG59O1xyXG5cclxuJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcclxuICBmdW5jdGlvbiBpbWdfbG9hZF9maW5pc2goKXtcclxuICAgIGRhdGE9dGhpcztcclxuICAgIGlmKGRhdGEudHlwZT09MCkge1xyXG4gICAgICBkYXRhLmltZy5hdHRyKCdzcmMnLCBkYXRhLnNyYyk7XHJcbiAgICB9ZWxzZXtcclxuICAgICAgZGF0YS5pbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnK2RhdGEuc3JjKycpJyk7XHJcbiAgICAgIGRhdGEuaW1nLnJlbW92ZUNsYXNzKCdub19hdmEnKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8v0YLQtdGB0YIg0LvQvtCz0L4g0LzQsNCz0LDQt9C40L3QsFxyXG4gIGltZ3M9JCgnc2VjdGlvbjpub3QoLm5hdmlnYXRpb24pJykuZmluZCgnLmxvZ28gaW1nJyk7XHJcbiAgZm9yICh2YXIgaT0wO2k8aW1ncy5sZW5ndGg7aSsrKXtcclxuICAgIGltZz1pbWdzLmVxKGkpO1xyXG4gICAgc3JjPWltZy5hdHRyKCdzcmMnKTtcclxuICAgIGltZy5hdHRyKCdzcmMnLCcvaW1hZ2VzL3RlbXBsYXRlLWxvZ28uanBnJyk7XHJcbiAgICBkYXRhPXtcclxuICAgICAgc3JjOnNyYyxcclxuICAgICAgaW1nOmltZyxcclxuICAgICAgdHlwZTowIC8vINC00LvRjyBpbWdbc3JjXVxyXG4gICAgfTtcclxuICAgIGltYWdlPSQoJzxpbWcvPicse1xyXG4gICAgICBzcmM6c3JjXHJcbiAgICB9KS5vbignbG9hZCcsaW1nX2xvYWRfZmluaXNoLmJpbmQoZGF0YSkpXHJcbiAgfVxyXG5cclxuICAvL9GC0LXRgdGCINCw0LLQsNGC0LDRgNC+0Log0LIg0LrQvtC80LXQvdGC0LDRgNC40Y/RhVxyXG4gIGltZ3M9JCgnLmNvbW1lbnQtcGhvdG8nKTtcclxuICBmb3IgKHZhciBpPTA7aTxpbWdzLmxlbmd0aDtpKyspe1xyXG4gICAgaW1nPWltZ3MuZXEoaSk7XHJcbiAgICBpZihpbWcuaGFzQ2xhc3MoJ25vX2F2YScpKXtcclxuICAgICAgY29udGludWU7XHJcbiAgICB9XHJcblxyXG4gICAgc3JjPWltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnKTtcclxuICAgIHNyYz1zcmMucmVwbGFjZSgndXJsKFwiJywnJyk7XHJcbiAgICBzcmM9c3JjLnJlcGxhY2UoJ1wiKScsJycpO1xyXG4gICAgaW1nLmFkZENsYXNzKCdub19hdmEnKTtcclxuXHJcbiAgICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKC9pbWFnZXMvbm9fYXZhLnBuZyknKTtcclxuICAgIGRhdGE9e1xyXG4gICAgICBzcmM6c3JjLFxyXG4gICAgICBpbWc6aW1nLFxyXG4gICAgICB0eXBlOjEgLy8g0LTQu9GPINGE0L7QvdC+0LLRi9GFINC60LDRgNGC0LjQvdC+0LpcclxuICAgIH07XHJcbiAgICBpbWFnZT0kKCc8aW1nLz4nLHtcclxuICAgICAgc3JjOnNyY1xyXG4gICAgfSkub24oJ2xvYWQnLGltZ19sb2FkX2ZpbmlzaC5iaW5kKGRhdGEpKVxyXG4gIH1cclxufSk7XHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgZWxzPSQoJy5hamF4X2xvYWQnKTtcclxuICBmb3IoaT0wO2k8ZWxzLmxlbmd0aDtpKyspe1xyXG4gICAgZWw9ZWxzLmVxKGkpO1xyXG4gICAgdXJsPWVsLmF0dHIoJ3JlcycpO1xyXG4gICAgJC5nZXQodXJsLGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICR0aGlzPSQodGhpcyk7XHJcbiAgICAgICR0aGlzLmh0bWwoZGF0YSk7XHJcbiAgICAgIGFqYXhGb3JtKCR0aGlzKTtcclxuICAgIH0uYmluZChlbCkpXHJcbiAgfVxyXG59KSgpO1xyXG5cclxuJCgnaW5wdXRbdHlwZT1maWxlXScpLm9uKCdjaGFuZ2UnLGZ1bmN0aW9uKGV2dCl7XHJcbiAgdmFyIGZpbGUgPSBldnQudGFyZ2V0LmZpbGVzOyAvLyBGaWxlTGlzdCBvYmplY3RcclxuICB2YXIgZiA9IGZpbGVbMF07XHJcbiAgLy8gT25seSBwcm9jZXNzIGltYWdlIGZpbGVzLlxyXG4gIGlmICghZi50eXBlLm1hdGNoKCdpbWFnZS4qJykpIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbiAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcblxyXG4gIGRhdGE9IHtcclxuICAgICdlbCc6IHRoaXMsXHJcbiAgICAnZic6IGZcclxuICB9O1xyXG4gIHJlYWRlci5vbmxvYWQgPSAoZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgaW1nPSQoJ1tmb3I9XCInK2RhdGEuZWwubmFtZSsnXCJdJyk7XHJcbiAgICAgIGlmKGltZy5sZW5ndGg+MCl7XHJcbiAgICAgICAgaW1nLmF0dHIoJ3NyYycsZS50YXJnZXQucmVzdWx0KVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH0pKGRhdGEpO1xyXG4gIC8vIFJlYWQgaW4gdGhlIGltYWdlIGZpbGUgYXMgYSBkYXRhIFVSTC5cclxuICByZWFkZXIucmVhZEFzRGF0YVVSTChmKTtcclxufSk7XHJcblxyXG4kKCdib2R5Jykub24oJ2NsaWNrJywnYS5hamF4Rm9ybU9wZW4nLGZ1bmN0aW9uKGUpe1xyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxuICBocmVmPXRoaXMuaHJlZi5zcGxpdCgnIycpO1xyXG4gIGhyZWY9aHJlZltocmVmLmxlbmd0aC0xXTtcclxuXHJcbiAgZGF0YT17XHJcbiAgICBidXR0b25ZZXM6ZmFsc2UsXHJcbiAgICBub3R5ZnlfY2xhc3M6XCJub3RpZnlfd2hpdGUgbG9hZGluZ1wiLFxyXG4gICAgcXVlc3Rpb246JydcclxuICB9O1xyXG4gIG1vZGFsX2NsYXNzPSQodGhpcykuZGF0YSgnbW9kYWwtY2xhc3MnKTtcclxuXHJcbiAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xyXG4gICQuZ2V0KCcvJytocmVmLGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgJCgnLm5vdGlmeV9ib3gnKS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xyXG4gICAgJCgnLm5vdGlmeV9ib3ggLm5vdGlmeV9jb250ZW50JykuaHRtbChkYXRhLmh0bWwpO1xyXG4gICAgYWpheEZvcm0oJCgnLm5vdGlmeV9ib3ggLm5vdGlmeV9jb250ZW50JykpO1xyXG4gICAgaWYobW9kYWxfY2xhc3Mpe1xyXG4gICAgICAkKCcubm90aWZ5X2JveCAubm90aWZ5X2NvbnRlbnQgLnJvdycpLmFkZENsYXNzKG1vZGFsX2NsYXNzKTtcclxuICAgIH1cclxuICB9LCdqc29uJylcclxufSk7XHJcblxyXG4kKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCh7XHJcbiAgZGVsYXk6IHtcclxuICAgIHNob3c6IDUwMCwgaGlkZTogMjAwMFxyXG4gIH1cclxufSk7XHJcbiQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS5vbignY2xpY2snLGZ1bmN0aW9uIChlKSB7XHJcbiAgJHRoaXM9JCh0aGlzKTtcclxuICBpZigkdGhpcy5jbG9zZXN0KCd1bCcpLmhhc0NsYXNzKCdwYWdpbmF0ZScpKSB7XHJcbiAgICAvL9C00LvRjyDQv9Cw0LPQuNC90LDRhtC40Lgg0YHRgdGL0LvQutCwINC00L7Qu9C20L3QsCDRgNCw0LHQvtGC0LDRgtGMXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbiAgaWYoJHRoaXMuaGFzQ2xhc3MoJ3dvcmtIcmVmJykpe1xyXG4gICAgLy/QldGB0LvQuCDRgdGB0YvQu9C60LAg0L/QvtC80LXRh9C10L3QvdCwINC60LDQuiDRgNCw0LHQvtGH0LDRjyDRgtC+INC90YPQttC90L4g0L/QtdGA0LXRhdC+0LTQuNGC0YxcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59KTtcclxuXHJcblxyXG4kKCcuYWpheC1hY3Rpb24nKS5jbGljayhmdW5jdGlvbihlKSB7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIHZhciBzdGF0dXMgPSAkKHRoaXMpLmRhdGEoJ3ZhbHVlJyk7XHJcbiAgdmFyIGhyZWYgPSAkKHRoaXMpLmF0dHIoJ2hyZWYnKTtcclxuICB2YXIgaWRzID0gJCgnI2dyaWQtYWpheC1hY3Rpb24nKS55aWlHcmlkVmlldygnZ2V0U2VsZWN0ZWRSb3dzJyk7XHJcbiAgaWYgKGlkcy5sZW5ndGggPiAwKSB7XHJcbiAgICBpZiAoIWNvbmZpcm0oJ9Cf0L7QtNGC0LLQtdGA0LTQuNGC0LUg0LjQt9C80LXQvdC10L3QuNC1INC30LDQv9C40YHQtdC5JykpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICAkLmFqYXgoe1xyXG4gICAgICB1cmw6IGhyZWYsXHJcbiAgICAgIHR5cGU6ICdwb3N0JyxcclxuICAgICAgZGF0YVR5cGU6ICdqc29uJyxcclxuICAgICAgZGF0YToge1xyXG4gICAgICAgIHN0YXR1czogc3RhdHVzLFxyXG4gICAgICAgIGlkOiBpZHNcclxuICAgICAgfVxyXG4gICAgfSkuc3VjY2VzcyhmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICQoJyNncmlkLWFqYXgtYWN0aW9uJykueWlpR3JpZFZpZXcoXCJhcHBseUZpbHRlclwiKTtcclxuICAgICAgaWYgKGRhdGEuZXJyb3IgIT0gZmFsc2UpIHtcclxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOifQn9GA0L7QuNC30L7RiNC70LAg0L7RiNC40LHQutCwIScsdHlwZTonZXJyJ30pXHJcbiAgICAgIH1cclxuICAgIH0pLmZhaWwoZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Cf0YDQvtC40LfQvtGI0LvQsCDQvtGI0LjQsdC60LAhJyx0eXBlOidlcnInfSlcclxuICAgIH0pO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOifQndC10L7QsdGF0L7QtNC40LzQviDQstGL0LHRgNCw0YLRjCDRjdC70LXQvNC10L3RgtGLIScsdHlwZTonZXJyJ30pXHJcbiAgfVxyXG59KTtcclxuXHJcbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgJCgnLmVkaXRpYmxlW2Rpc2FibGVkXScpLm9uKCdjbGljaycsZnVuY3Rpb24gKCkge1xyXG4gICAgJCh0aGlzKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKVxyXG4gIH0pXHJcblxyXG4gICQoJy5lZGl0aWJsZVtkaXNhYmxlZF0nKS5vbignbW91c2Vkb3duJyxmdW5jdGlvbiAoKSB7XHJcbiAgICAkKHRoaXMpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpXHJcbiAgfSlcclxuXHJcbiAgYnRuPSc8YnV0dG9uIGNsYXNzPXVubG9jaz48aSBjbGFzcz1cImZhIGZhLXVubG9jayBmYS00XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPjwvYnV0dG9uPic7XHJcbiAgYnRuPSQoYnRuKTtcclxuICBidG4ub24oJ2NsaWNrJyxmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgJHRoaXM9JCh0aGlzKTtcclxuICAgIGlucD0kdGhpcy5wcmV2KCk7XHJcbiAgICBpbnAucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSk7XHJcbiAgJCgnLmVkaXRpYmxlW2Rpc2FibGVkXScpLmFmdGVyKGJ0bilcclxufSk7XHJcblxyXG4kKGZ1bmN0aW9uKCkge1xyXG5cclxuICB2YXIgbWVudSA9IHtcclxuICAgIGNvbnRyb2w6IHtcclxuICAgICAgaGVhZGVyU3RvcmVzTWVudTogJChcIiN0b3BcIikuZmluZChcIi5zdWJtZW51LWhhbmRsXCIpLFxyXG4gICAgICBzdG9yZXNTdWJtZW51czogJChcIiN0b3BcIikuZmluZChcIi5zdWJtZW51LWhhbmRsXCIpLmZpbmQoXCIuc3VibWVudVwiKSxcclxuICAgICAgZXZlbnRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgc2VsZi5oZWFkZXJTdG9yZXNNZW51LmhvdmVyKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgdmFyIHN1Ym1lbnUgPSAkKHRoaXMpLmZpbmQoJy5zdWJtZW51Jyk7XHJcbiAgICAgICAgICBpZigkKHdpbmRvdykud2lkdGgoKSA+IDk5MSkge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoc2VsZi5zdG9yZUhpZGUpO1xyXG4gICAgICAgICAgICBzZWxmLnN0b3Jlc1N1Ym1lbnVzLmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xyXG4gICAgICAgICAgICBzZWxmLnN0b3JlU2hvdyA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgc3VibWVudS5jbGVhclF1ZXVlKCk7XHJcbiAgICAgICAgICAgICAgc3VibWVudS5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIikuYW5pbWF0ZSh7XCJvcGFjaXR5XCI6IDF9LCAzNTApO1xyXG4gICAgICAgICAgICAgIC8vIHNlbGYuc3RvcmVzU3VibWVudS5jbGVhclF1ZXVlKCk7XHJcbiAgICAgICAgICAgICAgLy8gc2VsZi5zdG9yZXNTdWJtZW51LmNzcyhcImRpc3BsYXlcIiwgXCJibG9ja1wiKS5hbmltYXRlKHtcIm9wYWNpdHlcIjogMX0sIDM1MCk7XHJcbiAgICAgICAgICAgIH0sIDIwMCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICB2YXIgc3VibWVudSA9ICQodGhpcykuZmluZCgnLnN1Ym1lbnUnKTtcclxuICAgICAgICAgIGlmKCQod2luZG93KS53aWR0aCgpID4gOTkxKSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChzZWxmLnN0b3JlU2hvdyk7XHJcbiAgICAgICAgICAgIHNlbGYuc3RvcmVIaWRlID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBzdWJtZW51LmNsZWFyUXVldWUoKTtcclxuICAgICAgICAgICAgICBzdWJtZW51LmFuaW1hdGUoe1wib3BhY2l0eVwiOiAwfSwgMjAwLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykuY3NzKFwiZGlzcGxheVwiLCBcIm5vbmVcIik7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgLy8gc2VsZi5zdG9yZXNTdWJtZW51LmNsZWFyUXVldWUoKTtcclxuICAgICAgICAgICAgICAvLyBzZWxmLnN0b3Jlc1N1Ym1lbnUuYW5pbWF0ZSh7XCJvcGFjaXR5XCI6IDB9LCAyMDAsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIC8vICAgICAkKHRoaXMpLmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xyXG4gICAgICAgICAgICAgIC8vIH0pO1xyXG4gICAgICAgICAgICB9LCAzMDApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuICBtZW51LmNvbnRyb2wuZXZlbnRzKCk7XHJcbn0pO1xyXG5cclxuJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAvKm1fdyA9ICQoJy50ZXh0LWNvbnRlbnQnKS53aWR0aCgpXHJcbiAgaWYgKG1fdyA8IDUwKW1fdyA9IHNjcmVlbi53aWR0aCAtIDQwKi9cclxuICBtdz1zY3JlZW4ud2lkdGgtNDA7XHJcbiAgcCA9ICQoJy5jb250YWluZXIgaW1nLC5jb250YWluZXIgaWZyYW1lJylcclxuICBmb3IgKGkgPSAwOyBpIDwgcC5sZW5ndGg7IGkrKykge1xyXG4gICAgZWwgPSBwLmVxKGkpO1xyXG4gICAgbV93PWVsLnBhcmVudCgpLndpZHRoKCk7XHJcbiAgICBpZihtX3c+bXcpbV93PW13O1xyXG4gICAgaWYgKGVsLndpZHRoKCkgPiBtX3cpIHtcclxuICAgICAgayA9IGVsLndpZHRoKCkgLyBtX3c7XHJcbiAgICAgIGVsLmhlaWdodChlbC5oZWlnaHQoKSAvIGspO1xyXG4gICAgICBlbC53aWR0aChtX3cpXHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuXHJcbi8v0LjQt9Cx0YDQsNC90L3QvtC1XHJcbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgJChcIiN0b3AgLmZhdm9yaXRlLWxpbmtcIikub24oJ2NsaWNrJyxmdW5jdGlvbigpIHtcclxuICAgIHZhciBzZWxmID0gJCh0aGlzKTtcclxuICAgIHZhciB0eXBlID0gc2VsZi5hdHRyKFwiZGF0YS1zdGF0ZVwiKSxcclxuICAgICAgYWZmaWxpYXRlX2lkID0gc2VsZi5hdHRyKFwiZGF0YS1hZmZpbGlhdGUtaWRcIik7XHJcblxyXG4gICAgaWYodHlwZSA9PSBcImFkZFwiKSB7XHJcbiAgICAgIHNlbGYuZmluZChcIi5mYVwiKS5yZW1vdmVDbGFzcyhcIm11dGVkXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHNlbGYuZmluZChcIi5mYVwiKS5yZW1vdmVDbGFzcyhcInB1bHNlMlwiKS5hZGRDbGFzcyhcImZhLXNwaW5cIik7XHJcblxyXG4gICAgJC5wb3N0KFwiL2FjY291bnQvZmF2b3JpdGVzXCIse1xyXG4gICAgICBcInR5cGVcIiA6IHR5cGUgLFxyXG4gICAgICBcImFmZmlsaWF0ZV9pZFwiOiBhZmZpbGlhdGVfaWRcclxuICAgIH0sZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgaWYoZGF0YS5lcnJvcil7XHJcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTpkYXRhLmVycm9yLHR5cGU6J2VycicsJ3RpdGxlJzooZGF0YS50aXRsZT9kYXRhLnRpdGxlOmZhbHNlKX0pO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XHJcbiAgICAgICAgbWVzc2FnZTpkYXRhLm1zZyxcclxuICAgICAgICB0eXBlOidzdWNjZXNzJyxcclxuICAgICAgICAndGl0bGUnOihkYXRhLnRpdGxlP2RhdGEudGl0bGU6ZmFsc2UpXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYodHlwZSA9PSBcImFkZFwiKSB7XHJcbiAgICAgICAgc2VsZi5maW5kKFwiLmZhXCIpLmFkZENsYXNzKFwibXV0ZWRcIik7XHJcbiAgICAgIH1cclxuICAgICAgc2VsZi5maW5kKFwiLmZhXCIpLnJlbW92ZUNsYXNzKFwiZmEtc3BpblwiKTtcclxuXHJcbiAgICAgIHNlbGYuYXR0cih7XHJcbiAgICAgICAgXCJkYXRhLXN0YXRlXCI6IGRhdGFbXCJkYXRhLXN0YXRlXCJdLFxyXG4gICAgICAgIFwiZGF0YS1vcmlnaW5hbC10aXRsZVwiOiBkYXRhWydkYXRhLW9yaWdpbmFsLXRpdGxlJ11cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZih0eXBlID09IFwiYWRkXCIpIHtcclxuICAgICAgICBzZWxmLmZpbmQoXCIuZmFcIikucmVtb3ZlQ2xhc3MoXCJmYS1zcGluIGZhLWhlYXJ0LW9cIikuYWRkQ2xhc3MoXCJmYS1oZWFydFwiKTtcclxuICAgICAgfSBlbHNlIGlmKHR5cGUgPT0gXCJkZWxldGVcIikge1xyXG4gICAgICAgIHNlbGYuZmluZChcIi5mYVwiKS5yZW1vdmVDbGFzcyhcImZhLXNwaW4gZmEtaGVhcnRcIikuYWRkQ2xhc3MoXCJmYS1oZWFydC1vIG11dGVkXCIpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSwnanNvbicpLmZhaWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6XCI8Yj7QotC10YXQvdC40YfQtdGB0LrQuNC1INGA0LDQsdC+0YLRiyE8L2I+PGJyPtCSINC00LDQvdC90YvQuSDQvNC+0LzQtdC90YIg0LLRgNC10LzQtdC90LhcIiArXHJcbiAgICAgIFwiINC/0YDQvtC40LfQstC10LTRkdC90L3QvtC1INC00LXQudGB0YLQstC40LUg0L3QtdCy0L7Qt9C80L7QttC90L4uINCf0L7Qv9GA0L7QsdGD0LnRgtC1INC/0L7Qt9C20LUuXCIgK1xyXG4gICAgICBcIiDQn9GA0LjQvdC+0YHQuNC8INGB0LLQvtC4INC40LfQstC40L3QtdC90LjRjyDQt9CwINC90LXRg9C00L7QsdGB0YLQstC+LlwiLHR5cGU6J2Vycid9KTtcclxuXHJcbiAgICAgIGlmKHR5cGUgPT0gXCJhZGRcIikge1xyXG4gICAgICAgIHNlbGYuZmluZChcIi5mYVwiKS5hZGRDbGFzcyhcIm11dGVkXCIpO1xyXG4gICAgICB9XHJcbiAgICAgIHNlbGYuZmluZChcIi5mYVwiKS5yZW1vdmVDbGFzcyhcImZhLXNwaW5cIik7XHJcbiAgICB9KVxyXG4gIH0pO1xyXG59KTtcclxuIl19
