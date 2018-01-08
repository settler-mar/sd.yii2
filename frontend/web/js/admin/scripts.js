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
var script = document.createElement('script');
script.onload=initEditor;
script.src = "/plugins/tinymce/tinymce.min.js";
script.async = true;
document.head.appendChild(script);

function initEditor(){
  tinymce.init({
    selector:'.visual_editor',
    height: 500,
    theme: 'modern',
    relative_urls:false,
    remove_script_host : false,
    document_base_url : "https://secretdiscounter.ru/",
    forced_root_block: false,
    plugins: [
      'advlist autolink lists link image charmap hr anchor pagebreak accordion clear_br',
      'searchreplace wordcount visualblocks visualchars code fullscreen',
      'insertdatetime media nonbreaking save table contextmenu directionality',
      'emoticons template paste textcolor colorpicker textpattern imagetools  toc help code filemanager responsivefilemanager'
    ],
    external_filemanager_path:'plugins/tinymce/plugins/responsivefilemanager/filemanager/',
    external_plugins: {
      'filemanager': 'plugins/responsivefilemanager/filemanager/plugin.min.js',
      'responsivefilemanager': 'plugins/responsivefilemanager/filemanager/plugin.min.js'
    },
    toolbar1: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | media | forecolor backcolor | accordion | clear_br | code help ',

    //file_browser_callback: RoxyFileBrowser,


    image_advtab: true,
    content_css : "/plugins/tinymce/content.css",
    style_formats: [
      { title: 'Headers', items: [
        { title: 'h1', block: 'h1' },
        { title: 'h2', block: 'h2' },
        { title: 'h3', block: 'h3' },
        { title: 'h4', block: 'h4' },
        { title: 'h5', block: 'h5' },
        { title: 'h6', block: 'h6' }
      ] },

      { title: 'Blocks', items: [
        { title: 'p', block: 'p' },
        { title: 'div', block: 'div' },
        { title: 'pre', block: 'pre' }
      ] },

      { title: 'Containers', items: [
        { title: 'section', block: 'section', wrapper: true, merge_siblings: false },
        { title: 'article', block: 'article', wrapper: true, merge_siblings: false },
        { title: 'blockquote', block: 'blockquote', wrapper: true },
        { title: 'hgroup', block: 'hgroup', wrapper: true },
        { title: 'aside', block: 'aside', wrapper: true },
        { title: 'figure', block: 'figure', wrapper: true }
      ] }
    ]
  });
  
  function RoxyFileBrowser(field_name, url, type, win) {
    var roxyFileman = '/plugins/fileman/index.html';
    if (roxyFileman.indexOf("?") < 0) {
      roxyFileman += "?type=" + type;
    }
    else {
      roxyFileman += "&type=" + type;
    }
    roxyFileman += '&input=' + field_name + '&value=' + win.document.getElementById(field_name).value;
    if(tinyMCE.activeEditor.settings.language){
      roxyFileman += '&langCode=' + tinyMCE.activeEditor.settings.language;
    }
    tinyMCE.activeEditor.windowManager.open({
      file: roxyFileman,
      title: 'Roxy Fileman',
      width: 850,
      height: 650,
      resizable: "yes",
      plugins: "media",
      inline: "yes",
      close_previous: "no"
    }, {     window: win,     input: field_name    });
    return false;
  }
  function FileSelected(file){
    /**
     * file is an object containing following properties:
     *
     * fullPath - path to the file - absolute from your site root
     * path - directory in which the file is located - absolute from your site root
     * size - size of the file in bytes
     * time - timestamo of last modification
     * name - file name
     * ext - file extension
     * width - if the file is image, this will be the width of the original image, 0 otherwise
     * height - if the file is image, this will be the height of the original image, 0 otherwise
     *
     */
      // Get the ID of the input to fill
    var fieldId = RoxyUtils.GetUrlParam('txtFieldId');
    $(window.parent.document).find('#' + fieldId).attr('value', file.fullPath);
    window.parent.closeCustomRoxy2();
  }
  initImageServerSelect($('.fileServerSelect'));
};

function initImageServerSelect(els){
  if(els.length==0)return;
  els.wrap('<div class="select_img">');
  els=els.parent();
  els.append('<button type="button"><i class="mce-ico mce-i-browse"></i></button>');
  els.find('button').on('click',openCustomRoxy2);

  if($('#roxyCustomPanel2').length==0){
    browserBlk='<div id="roxyCustomPanel2" style="display_: none;">';
    browserBlk+='<div>';
    browserBlk+='<span class="close"></span>';
    browserBlk+='<iframe src="/plugins/fileman/index.html?integration=custom&type=image" style="width:100%;height:100%" frameborder="0">';
    browserBlk+='</iframe>';
    browserBlk+='</div>';
    browserBlk+='</div>';
    $('body').append(browserBlk);
    $('#roxyCustomPanel2 .close').click(function(){
      $('#roxyCustomPanel2').removeClass('open')
    })
  }
}

function openCustomRoxy2(){
  closeCustomRoxy2=closeCustomRoxy.bind(this)
  $('#roxyCustomPanel2').addClass('open')
}
var closeCustomRoxy2;
function closeCustomRoxy(img){
  if(img) {
    $(this).parent().find('input').val(img);
  }
  $('#roxyCustomPanel2 .close').click()
}
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

//что б ифреймы и картинки не вылазили
$( document ).ready(function() {
  /*m_w = $('.text-content').width()
  if (m_w < 50)m_w = screen.width - 40*/
  mw=screen.width-40;
  p = $('.container img,.container iframe');
  $('.container img').height('auto');
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
  })
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
    wrap.html('<h3>Упс... Возникла непредвиденная ошибка<h3>' +
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
    wrap.html('<div style="text-align:center;"><p>Отправка данных</p></div>');

    data.url+=(data.url.indexOf('?')>0?'&':'?')+'rc='+Math.random();

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpxdWVyeS5tZW51LWFpbS5qcyIsImNpcmNsZXMubWluLmpzIiwiZGF0ZXBpY2tlci5qcyIsImpxdWVyeS5ub3R5LnBhY2thZ2VkLm1pbi5qcyIsIm1haW4uanMiLCJqcXVlcnkubW9ja2pheC5qcyIsImpxdWVyeS5hdXRvY29tcGxldGUuanMiLCJzZWxlY3QyLmZ1bGwubWluLmpzIiwibWFpbl9hZG1pbi5qcyIsImVkaXRvcl9pbml0LmpzIiwiYWpheF9zYXZlLmpzIiwiYWpheF9yZW1vdmUuanMiLCJmb3JfYWxsLmpzIiwibm90aWZpY2F0aW9uLmpzIiwic3RvcmVzLmpzIiwianF1ZXJ5LmFqYXhGb3JtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25VQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25vREE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMTlCQTtBQUNBO0FBQ0E7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIG1lbnUtYWltIGlzIGEgalF1ZXJ5IHBsdWdpbiBmb3IgZHJvcGRvd24gbWVudXMgdGhhdCBjYW4gZGlmZmVyZW50aWF0ZVxyXG4gKiBiZXR3ZWVuIGEgdXNlciB0cnlpbmcgaG92ZXIgb3ZlciBhIGRyb3Bkb3duIGl0ZW0gdnMgdHJ5aW5nIHRvIG5hdmlnYXRlIGludG9cclxuICogYSBzdWJtZW51J3MgY29udGVudHMuXHJcbiAqXHJcbiAqIG1lbnUtYWltIGFzc3VtZXMgdGhhdCB5b3UgaGF2ZSBhcmUgdXNpbmcgYSBtZW51IHdpdGggc3VibWVudXMgdGhhdCBleHBhbmRcclxuICogdG8gdGhlIG1lbnUncyByaWdodC4gSXQgd2lsbCBmaXJlIGV2ZW50cyB3aGVuIHRoZSB1c2VyJ3MgbW91c2UgZW50ZXJzIGEgbmV3XHJcbiAqIGRyb3Bkb3duIGl0ZW0gKmFuZCogd2hlbiB0aGF0IGl0ZW0gaXMgYmVpbmcgaW50ZW50aW9uYWxseSBob3ZlcmVkIG92ZXIuXHJcbiAqXHJcbiAqIF9fX19fX19fX19fX19fX19fX19fX19fX19fXHJcbiAqIHwgTW9ua2V5cyAgPnwgICBHb3JpbGxhICB8XHJcbiAqIHwgR29yaWxsYXMgPnwgICBDb250ZW50ICB8XHJcbiAqIHwgQ2hpbXBzICAgPnwgICBIZXJlICAgICB8XHJcbiAqIHxfX19fX19fX19fX3xfX19fX19fX19fX198XHJcbiAqXHJcbiAqIEluIHRoZSBhYm92ZSBleGFtcGxlLCBcIkdvcmlsbGFzXCIgaXMgc2VsZWN0ZWQgYW5kIGl0cyBzdWJtZW51IGNvbnRlbnQgaXNcclxuICogYmVpbmcgc2hvd24gb24gdGhlIHJpZ2h0LiBJbWFnaW5lIHRoYXQgdGhlIHVzZXIncyBjdXJzb3IgaXMgaG92ZXJpbmcgb3ZlclxyXG4gKiBcIkdvcmlsbGFzLlwiIFdoZW4gdGhleSBtb3ZlIHRoZWlyIG1vdXNlIGludG8gdGhlIFwiR29yaWxsYSBDb250ZW50XCIgYXJlYSwgdGhleVxyXG4gKiBtYXkgYnJpZWZseSBob3ZlciBvdmVyIFwiQ2hpbXBzLlwiIFRoaXMgc2hvdWxkbid0IGNsb3NlIHRoZSBcIkdvcmlsbGEgQ29udGVudFwiXHJcbiAqIGFyZWEuXHJcbiAqXHJcbiAqIFRoaXMgcHJvYmxlbSBpcyBub3JtYWxseSBzb2x2ZWQgdXNpbmcgdGltZW91dHMgYW5kIGRlbGF5cy4gbWVudS1haW0gdHJpZXMgdG9cclxuICogc29sdmUgdGhpcyBieSBkZXRlY3RpbmcgdGhlIGRpcmVjdGlvbiBvZiB0aGUgdXNlcidzIG1vdXNlIG1vdmVtZW50LiBUaGlzIGNhblxyXG4gKiBtYWtlIGZvciBxdWlja2VyIHRyYW5zaXRpb25zIHdoZW4gbmF2aWdhdGluZyB1cCBhbmQgZG93biB0aGUgbWVudS4gVGhlXHJcbiAqIGV4cGVyaWVuY2UgaXMgaG9wZWZ1bGx5IHNpbWlsYXIgdG8gYW1hem9uLmNvbS8ncyBcIlNob3AgYnkgRGVwYXJ0bWVudFwiXHJcbiAqIGRyb3Bkb3duLlxyXG4gKlxyXG4gKiBVc2UgbGlrZSBzbzpcclxuICpcclxuICogICAgICAkKFwiI21lbnVcIikubWVudUFpbSh7XHJcbiAqICAgICAgICAgIGFjdGl2YXRlOiAkLm5vb3AsICAvLyBmaXJlZCBvbiByb3cgYWN0aXZhdGlvblxyXG4gKiAgICAgICAgICBkZWFjdGl2YXRlOiAkLm5vb3AgIC8vIGZpcmVkIG9uIHJvdyBkZWFjdGl2YXRpb25cclxuICogICAgICB9KTtcclxuICpcclxuICogIC4uLnRvIHJlY2VpdmUgZXZlbnRzIHdoZW4gYSBtZW51J3Mgcm93IGhhcyBiZWVuIHB1cnBvc2VmdWxseSAoZGUpYWN0aXZhdGVkLlxyXG4gKlxyXG4gKiBUaGUgZm9sbG93aW5nIG9wdGlvbnMgY2FuIGJlIHBhc3NlZCB0byBtZW51QWltLiBBbGwgZnVuY3Rpb25zIGV4ZWN1dGUgd2l0aFxyXG4gKiB0aGUgcmVsZXZhbnQgcm93J3MgSFRNTCBlbGVtZW50IGFzIHRoZSBleGVjdXRpb24gY29udGV4dCAoJ3RoaXMnKTpcclxuICpcclxuICogICAgICAubWVudUFpbSh7XHJcbiAqICAgICAgICAgIC8vIEZ1bmN0aW9uIHRvIGNhbGwgd2hlbiBhIHJvdyBpcyBwdXJwb3NlZnVsbHkgYWN0aXZhdGVkLiBVc2UgdGhpc1xyXG4gKiAgICAgICAgICAvLyB0byBzaG93IGEgc3VibWVudSdzIGNvbnRlbnQgZm9yIHRoZSBhY3RpdmF0ZWQgcm93LlxyXG4gKiAgICAgICAgICBhY3RpdmF0ZTogZnVuY3Rpb24oKSB7fSxcclxuICpcclxuICogICAgICAgICAgLy8gRnVuY3Rpb24gdG8gY2FsbCB3aGVuIGEgcm93IGlzIGRlYWN0aXZhdGVkLlxyXG4gKiAgICAgICAgICBkZWFjdGl2YXRlOiBmdW5jdGlvbigpIHt9LFxyXG4gKlxyXG4gKiAgICAgICAgICAvLyBGdW5jdGlvbiB0byBjYWxsIHdoZW4gbW91c2UgZW50ZXJzIGEgbWVudSByb3cuIEVudGVyaW5nIGEgcm93XHJcbiAqICAgICAgICAgIC8vIGRvZXMgbm90IG1lYW4gdGhlIHJvdyBoYXMgYmVlbiBhY3RpdmF0ZWQsIGFzIHRoZSB1c2VyIG1heSBiZVxyXG4gKiAgICAgICAgICAvLyBtb3VzaW5nIG92ZXIgdG8gYSBzdWJtZW51LlxyXG4gKiAgICAgICAgICBlbnRlcjogZnVuY3Rpb24oKSB7fSxcclxuICpcclxuICogICAgICAgICAgLy8gRnVuY3Rpb24gdG8gY2FsbCB3aGVuIG1vdXNlIGV4aXRzIGEgbWVudSByb3cuXHJcbiAqICAgICAgICAgIGV4aXQ6IGZ1bmN0aW9uKCkge30sXHJcbiAqXHJcbiAqICAgICAgICAgIC8vIFNlbGVjdG9yIGZvciBpZGVudGlmeWluZyB3aGljaCBlbGVtZW50cyBpbiB0aGUgbWVudSBhcmUgcm93c1xyXG4gKiAgICAgICAgICAvLyB0aGF0IGNhbiB0cmlnZ2VyIHRoZSBhYm92ZSBldmVudHMuIERlZmF1bHRzIHRvIFwiPiBsaVwiLlxyXG4gKiAgICAgICAgICByb3dTZWxlY3RvcjogXCI+IGxpXCIsXHJcbiAqXHJcbiAqICAgICAgICAgIC8vIFlvdSBtYXkgaGF2ZSBzb21lIG1lbnUgcm93cyB0aGF0IGFyZW4ndCBzdWJtZW51cyBhbmQgdGhlcmVmb3JlXHJcbiAqICAgICAgICAgIC8vIHNob3VsZG4ndCBldmVyIG5lZWQgdG8gXCJhY3RpdmF0ZS5cIiBJZiBzbywgZmlsdGVyIHN1Ym1lbnUgcm93cyB3L1xyXG4gKiAgICAgICAgICAvLyB0aGlzIHNlbGVjdG9yLiBEZWZhdWx0cyB0byBcIipcIiAoYWxsIGVsZW1lbnRzKS5cclxuICogICAgICAgICAgc3VibWVudVNlbGVjdG9yOiBcIipcIixcclxuICpcclxuICogICAgICAgICAgLy8gRGlyZWN0aW9uIHRoZSBzdWJtZW51IG9wZW5zIHJlbGF0aXZlIHRvIHRoZSBtYWluIG1lbnUuIENhbiBiZVxyXG4gKiAgICAgICAgICAvLyBsZWZ0LCByaWdodCwgYWJvdmUsIG9yIGJlbG93LiBEZWZhdWx0cyB0byBcInJpZ2h0XCIuXHJcbiAqICAgICAgICAgIHN1Ym1lbnVEaXJlY3Rpb246IFwicmlnaHRcIlxyXG4gKiAgICAgIH0pO1xyXG4gKlxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20va2FtZW5zL2pRdWVyeS1tZW51LWFpbVxyXG4qL1xyXG4oZnVuY3Rpb24oJCkge1xyXG5cclxuICAgICQuZm4ubWVudUFpbSA9IGZ1bmN0aW9uKG9wdHMpIHtcclxuICAgICAgICAvLyBJbml0aWFsaXplIG1lbnUtYWltIGZvciBhbGwgZWxlbWVudHMgaW4galF1ZXJ5IGNvbGxlY3Rpb25cclxuICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGluaXQuY2FsbCh0aGlzLCBvcHRzKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXQob3B0cykge1xyXG4gICAgICAgIHZhciAkbWVudSA9ICQodGhpcyksXHJcbiAgICAgICAgICAgIGFjdGl2ZVJvdyA9IG51bGwsXHJcbiAgICAgICAgICAgIG1vdXNlTG9jcyA9IFtdLFxyXG4gICAgICAgICAgICBsYXN0RGVsYXlMb2MgPSBudWxsLFxyXG4gICAgICAgICAgICB0aW1lb3V0SWQgPSBudWxsLFxyXG4gICAgICAgICAgICBvcHRpb25zID0gJC5leHRlbmQoe1xyXG4gICAgICAgICAgICAgICAgcm93U2VsZWN0b3I6IFwiPiBsaVwiLFxyXG4gICAgICAgICAgICAgICAgc3VibWVudVNlbGVjdG9yOiBcIipcIixcclxuICAgICAgICAgICAgICAgIHN1Ym1lbnVEaXJlY3Rpb246IFwicmlnaHRcIixcclxuICAgICAgICAgICAgICAgIHRvbGVyYW5jZTogNzUsICAvLyBiaWdnZXIgPSBtb3JlIGZvcmdpdmV5IHdoZW4gZW50ZXJpbmcgc3VibWVudVxyXG4gICAgICAgICAgICAgICAgZW50ZXI6ICQubm9vcCxcclxuICAgICAgICAgICAgICAgIGV4aXQ6ICQubm9vcCxcclxuICAgICAgICAgICAgICAgIGFjdGl2YXRlOiAkLm5vb3AsXHJcbiAgICAgICAgICAgICAgICBkZWFjdGl2YXRlOiAkLm5vb3AsXHJcbiAgICAgICAgICAgICAgICBleGl0TWVudTogJC5ub29wXHJcbiAgICAgICAgICAgIH0sIG9wdHMpO1xyXG5cclxuICAgICAgICB2YXIgTU9VU0VfTE9DU19UUkFDS0VEID0gMywgIC8vIG51bWJlciBvZiBwYXN0IG1vdXNlIGxvY2F0aW9ucyB0byB0cmFja1xyXG4gICAgICAgICAgICBERUxBWSA9IDMwMDsgIC8vIG1zIGRlbGF5IHdoZW4gdXNlciBhcHBlYXJzIHRvIGJlIGVudGVyaW5nIHN1Ym1lbnVcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogS2VlcCB0cmFjayBvZiB0aGUgbGFzdCBmZXcgbG9jYXRpb25zIG9mIHRoZSBtb3VzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB2YXIgbW91c2Vtb3ZlRG9jdW1lbnQgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICBtb3VzZUxvY3MucHVzaCh7eDogZS5wYWdlWCwgeTogZS5wYWdlWX0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtb3VzZUxvY3MubGVuZ3RoID4gTU9VU0VfTE9DU19UUkFDS0VEKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VMb2NzLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENhbmNlbCBwb3NzaWJsZSByb3cgYWN0aXZhdGlvbnMgd2hlbiBsZWF2aW5nIHRoZSBtZW51IGVudGlyZWx5XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdmFyIG1vdXNlbGVhdmVNZW51ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGltZW91dElkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gSWYgZXhpdE1lbnUgaXMgc3VwcGxpZWQgYW5kIHJldHVybnMgdHJ1ZSwgZGVhY3RpdmF0ZSB0aGVcclxuICAgICAgICAgICAgICAgIC8vIGN1cnJlbnRseSBhY3RpdmUgcm93IG9uIG1lbnUgZXhpdC5cclxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmV4aXRNZW51KHRoaXMpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFjdGl2ZVJvdykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmRlYWN0aXZhdGUoYWN0aXZlUm93KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZVJvdyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRyaWdnZXIgYSBwb3NzaWJsZSByb3cgYWN0aXZhdGlvbiB3aGVuZXZlciBlbnRlcmluZyBhIG5ldyByb3cuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdmFyIG1vdXNlZW50ZXJSb3cgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aW1lb3V0SWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBDYW5jZWwgYW55IHByZXZpb3VzIGFjdGl2YXRpb24gZGVsYXlzXHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5lbnRlcih0aGlzKTtcclxuICAgICAgICAgICAgICAgIHBvc3NpYmx5QWN0aXZhdGUodGhpcyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG1vdXNlbGVhdmVSb3cgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMuZXhpdCh0aGlzKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBJbW1lZGlhdGVseSBhY3RpdmF0ZSBhIHJvdyBpZiB0aGUgdXNlciBjbGlja3Mgb24gaXQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdmFyIGNsaWNrUm93ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBhY3RpdmF0ZSh0aGlzKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWN0aXZhdGUgYSBtZW51IHJvdy5cclxuICAgICAgICAgKi9cclxuICAgICAgICB2YXIgYWN0aXZhdGUgPSBmdW5jdGlvbihyb3cpIHtcclxuICAgICAgICAgICAgICAgIGlmIChyb3cgPT0gYWN0aXZlUm93KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChhY3RpdmVSb3cpIHtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmRlYWN0aXZhdGUoYWN0aXZlUm93KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLmFjdGl2YXRlKHJvdyk7XHJcbiAgICAgICAgICAgICAgICBhY3RpdmVSb3cgPSByb3c7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFBvc3NpYmx5IGFjdGl2YXRlIGEgbWVudSByb3cuIElmIG1vdXNlIG1vdmVtZW50IGluZGljYXRlcyB0aGF0IHdlXHJcbiAgICAgICAgICogc2hvdWxkbid0IGFjdGl2YXRlIHlldCBiZWNhdXNlIHVzZXIgbWF5IGJlIHRyeWluZyB0byBlbnRlclxyXG4gICAgICAgICAqIGEgc3VibWVudSdzIGNvbnRlbnQsIHRoZW4gZGVsYXkgYW5kIGNoZWNrIGFnYWluIGxhdGVyLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHZhciBwb3NzaWJseUFjdGl2YXRlID0gZnVuY3Rpb24ocm93KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGVsYXkgPSBhY3RpdmF0aW9uRGVsYXkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZGVsYXkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NzaWJseUFjdGl2YXRlKHJvdyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgZGVsYXkpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmF0ZShyb3cpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm4gdGhlIGFtb3VudCBvZiB0aW1lIHRoYXQgc2hvdWxkIGJlIHVzZWQgYXMgYSBkZWxheSBiZWZvcmUgdGhlXHJcbiAgICAgICAgICogY3VycmVudGx5IGhvdmVyZWQgcm93IGlzIGFjdGl2YXRlZC5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIFJldHVybnMgMCBpZiB0aGUgYWN0aXZhdGlvbiBzaG91bGQgaGFwcGVuIGltbWVkaWF0ZWx5LiBPdGhlcndpc2UsXHJcbiAgICAgICAgICogcmV0dXJucyB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0aGF0IHNob3VsZCBiZSBkZWxheWVkIGJlZm9yZVxyXG4gICAgICAgICAqIGNoZWNraW5nIGFnYWluIHRvIHNlZSBpZiB0aGUgcm93IHNob3VsZCBiZSBhY3RpdmF0ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdmFyIGFjdGl2YXRpb25EZWxheSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFhY3RpdmVSb3cgfHwgISQoYWN0aXZlUm93KS5pcyhvcHRpb25zLnN1Ym1lbnVTZWxlY3RvcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBubyBvdGhlciBzdWJtZW51IHJvdyBhbHJlYWR5IGFjdGl2ZSwgdGhlblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGdvIGFoZWFkIGFuZCBhY3RpdmF0ZSBpbW1lZGlhdGVseS5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gJG1lbnUub2Zmc2V0KCksXHJcbiAgICAgICAgICAgICAgICAgICAgdXBwZXJMZWZ0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBvZmZzZXQubGVmdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgeTogb2Zmc2V0LnRvcCAtIG9wdGlvbnMudG9sZXJhbmNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB1cHBlclJpZ2h0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBvZmZzZXQubGVmdCArICRtZW51Lm91dGVyV2lkdGgoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgeTogdXBwZXJMZWZ0LnlcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGxvd2VyTGVmdCA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeDogb2Zmc2V0LmxlZnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IG9mZnNldC50b3AgKyAkbWVudS5vdXRlckhlaWdodCgpICsgb3B0aW9ucy50b2xlcmFuY2VcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGxvd2VyUmlnaHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IG9mZnNldC5sZWZ0ICsgJG1lbnUub3V0ZXJXaWR0aCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiBsb3dlckxlZnQueVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgbG9jID0gbW91c2VMb2NzW21vdXNlTG9jcy5sZW5ndGggLSAxXSxcclxuICAgICAgICAgICAgICAgICAgICBwcmV2TG9jID0gbW91c2VMb2NzWzBdO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghbG9jKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFwcmV2TG9jKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJldkxvYyA9IGxvYztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocHJldkxvYy54IDwgb2Zmc2V0LmxlZnQgfHwgcHJldkxvYy54ID4gbG93ZXJSaWdodC54IHx8XHJcbiAgICAgICAgICAgICAgICAgICAgcHJldkxvYy55IDwgb2Zmc2V0LnRvcCB8fCBwcmV2TG9jLnkgPiBsb3dlclJpZ2h0LnkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgcHJldmlvdXMgbW91c2UgbG9jYXRpb24gd2FzIG91dHNpZGUgb2YgdGhlIGVudGlyZVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIG1lbnUncyBib3VuZHMsIGltbWVkaWF0ZWx5IGFjdGl2YXRlLlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChsYXN0RGVsYXlMb2MgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jLnggPT0gbGFzdERlbGF5TG9jLnggJiYgbG9jLnkgPT0gbGFzdERlbGF5TG9jLnkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgbW91c2UgaGFzbid0IG1vdmVkIHNpbmNlIHRoZSBsYXN0IHRpbWUgd2UgY2hlY2tlZFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGZvciBhY3RpdmF0aW9uIHN0YXR1cywgaW1tZWRpYXRlbHkgYWN0aXZhdGUuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRGV0ZWN0IGlmIHRoZSB1c2VyIGlzIG1vdmluZyB0b3dhcmRzIHRoZSBjdXJyZW50bHkgYWN0aXZhdGVkXHJcbiAgICAgICAgICAgICAgICAvLyBzdWJtZW51LlxyXG4gICAgICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBtb3VzZSBpcyBoZWFkaW5nIHJlbGF0aXZlbHkgY2xlYXJseSB0b3dhcmRzXHJcbiAgICAgICAgICAgICAgICAvLyB0aGUgc3VibWVudSdzIGNvbnRlbnQsIHdlIHNob3VsZCB3YWl0IGFuZCBnaXZlIHRoZSB1c2VyIG1vcmVcclxuICAgICAgICAgICAgICAgIC8vIHRpbWUgYmVmb3JlIGFjdGl2YXRpbmcgYSBuZXcgcm93LiBJZiB0aGUgbW91c2UgaXMgaGVhZGluZ1xyXG4gICAgICAgICAgICAgICAgLy8gZWxzZXdoZXJlLCB3ZSBjYW4gaW1tZWRpYXRlbHkgYWN0aXZhdGUgYSBuZXcgcm93LlxyXG4gICAgICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgICAgIC8vIFdlIGRldGVjdCB0aGlzIGJ5IGNhbGN1bGF0aW5nIHRoZSBzbG9wZSBmb3JtZWQgYmV0d2VlbiB0aGVcclxuICAgICAgICAgICAgICAgIC8vIGN1cnJlbnQgbW91c2UgbG9jYXRpb24gYW5kIHRoZSB1cHBlci9sb3dlciByaWdodCBwb2ludHMgb2ZcclxuICAgICAgICAgICAgICAgIC8vIHRoZSBtZW51LiBXZSBkbyB0aGUgc2FtZSBmb3IgdGhlIHByZXZpb3VzIG1vdXNlIGxvY2F0aW9uLlxyXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIGN1cnJlbnQgbW91c2UgbG9jYXRpb24ncyBzbG9wZXMgYXJlXHJcbiAgICAgICAgICAgICAgICAvLyBpbmNyZWFzaW5nL2RlY3JlYXNpbmcgYXBwcm9wcmlhdGVseSBjb21wYXJlZCB0byB0aGVcclxuICAgICAgICAgICAgICAgIC8vIHByZXZpb3VzJ3MsIHdlIGtub3cgdGhlIHVzZXIgaXMgbW92aW5nIHRvd2FyZCB0aGUgc3VibWVudS5cclxuICAgICAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgICAgICAvLyBOb3RlIHRoYXQgc2luY2UgdGhlIHktYXhpcyBpbmNyZWFzZXMgYXMgdGhlIGN1cnNvciBtb3Zlc1xyXG4gICAgICAgICAgICAgICAgLy8gZG93biB0aGUgc2NyZWVuLCB3ZSBhcmUgbG9va2luZyBmb3IgdGhlIHNsb3BlIGJldHdlZW4gdGhlXHJcbiAgICAgICAgICAgICAgICAvLyBjdXJzb3IgYW5kIHRoZSB1cHBlciByaWdodCBjb3JuZXIgdG8gZGVjcmVhc2Ugb3ZlciB0aW1lLCBub3RcclxuICAgICAgICAgICAgICAgIC8vIGluY3JlYXNlIChzb21ld2hhdCBjb3VudGVyaW50dWl0aXZlbHkpLlxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc2xvcGUoYSwgYikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoYi55IC0gYS55KSAvIChiLnggLSBhLngpO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgZGVjcmVhc2luZ0Nvcm5lciA9IHVwcGVyUmlnaHQsXHJcbiAgICAgICAgICAgICAgICAgICAgaW5jcmVhc2luZ0Nvcm5lciA9IGxvd2VyUmlnaHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gT3VyIGV4cGVjdGF0aW9ucyBmb3IgZGVjcmVhc2luZyBvciBpbmNyZWFzaW5nIHNsb3BlIHZhbHVlc1xyXG4gICAgICAgICAgICAgICAgLy8gZGVwZW5kcyBvbiB3aGljaCBkaXJlY3Rpb24gdGhlIHN1Ym1lbnUgb3BlbnMgcmVsYXRpdmUgdG8gdGhlXHJcbiAgICAgICAgICAgICAgICAvLyBtYWluIG1lbnUuIEJ5IGRlZmF1bHQsIGlmIHRoZSBtZW51IG9wZW5zIG9uIHRoZSByaWdodCwgd2VcclxuICAgICAgICAgICAgICAgIC8vIGV4cGVjdCB0aGUgc2xvcGUgYmV0d2VlbiB0aGUgY3Vyc29yIGFuZCB0aGUgdXBwZXIgcmlnaHRcclxuICAgICAgICAgICAgICAgIC8vIGNvcm5lciB0byBkZWNyZWFzZSBvdmVyIHRpbWUsIGFzIGV4cGxhaW5lZCBhYm92ZS4gSWYgdGhlXHJcbiAgICAgICAgICAgICAgICAvLyBzdWJtZW51IG9wZW5zIGluIGEgZGlmZmVyZW50IGRpcmVjdGlvbiwgd2UgY2hhbmdlIG91ciBzbG9wZVxyXG4gICAgICAgICAgICAgICAgLy8gZXhwZWN0YXRpb25zLlxyXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuc3VibWVudURpcmVjdGlvbiA9PSBcImxlZnRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlY3JlYXNpbmdDb3JuZXIgPSBsb3dlckxlZnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5jcmVhc2luZ0Nvcm5lciA9IHVwcGVyTGVmdDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5zdWJtZW51RGlyZWN0aW9uID09IFwiYmVsb3dcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlY3JlYXNpbmdDb3JuZXIgPSBsb3dlclJpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgIGluY3JlYXNpbmdDb3JuZXIgPSBsb3dlckxlZnQ7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuc3VibWVudURpcmVjdGlvbiA9PSBcImFib3ZlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWNyZWFzaW5nQ29ybmVyID0gdXBwZXJMZWZ0O1xyXG4gICAgICAgICAgICAgICAgICAgIGluY3JlYXNpbmdDb3JuZXIgPSB1cHBlclJpZ2h0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHZhciBkZWNyZWFzaW5nU2xvcGUgPSBzbG9wZShsb2MsIGRlY3JlYXNpbmdDb3JuZXIpLFxyXG4gICAgICAgICAgICAgICAgICAgIGluY3JlYXNpbmdTbG9wZSA9IHNsb3BlKGxvYywgaW5jcmVhc2luZ0Nvcm5lciksXHJcbiAgICAgICAgICAgICAgICAgICAgcHJldkRlY3JlYXNpbmdTbG9wZSA9IHNsb3BlKHByZXZMb2MsIGRlY3JlYXNpbmdDb3JuZXIpLFxyXG4gICAgICAgICAgICAgICAgICAgIHByZXZJbmNyZWFzaW5nU2xvcGUgPSBzbG9wZShwcmV2TG9jLCBpbmNyZWFzaW5nQ29ybmVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZGVjcmVhc2luZ1Nsb3BlIDwgcHJldkRlY3JlYXNpbmdTbG9wZSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNyZWFzaW5nU2xvcGUgPiBwcmV2SW5jcmVhc2luZ1Nsb3BlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTW91c2UgaXMgbW92aW5nIGZyb20gcHJldmlvdXMgbG9jYXRpb24gdG93YXJkcyB0aGVcclxuICAgICAgICAgICAgICAgICAgICAvLyBjdXJyZW50bHkgYWN0aXZhdGVkIHN1Ym1lbnUuIERlbGF5IGJlZm9yZSBhY3RpdmF0aW5nIGFcclxuICAgICAgICAgICAgICAgICAgICAvLyBuZXcgbWVudSByb3csIGJlY2F1c2UgdXNlciBtYXkgYmUgbW92aW5nIGludG8gc3VibWVudS5cclxuICAgICAgICAgICAgICAgICAgICBsYXN0RGVsYXlMb2MgPSBsb2M7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIERFTEFZO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGxhc3REZWxheUxvYyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSG9vayB1cCBpbml0aWFsIG1lbnUgZXZlbnRzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgJG1lbnVcclxuICAgICAgICAgICAgLm1vdXNlbGVhdmUobW91c2VsZWF2ZU1lbnUpXHJcbiAgICAgICAgICAgIC5maW5kKG9wdGlvbnMucm93U2VsZWN0b3IpXHJcbiAgICAgICAgICAgICAgICAubW91c2VlbnRlcihtb3VzZWVudGVyUm93KVxyXG4gICAgICAgICAgICAgICAgLm1vdXNlbGVhdmUobW91c2VsZWF2ZVJvdylcclxuICAgICAgICAgICAgICAgIC5jbGljayhjbGlja1Jvdyk7XHJcblxyXG4gICAgICAgICQoZG9jdW1lbnQpLm1vdXNlbW92ZShtb3VzZW1vdmVEb2N1bWVudCk7XHJcblxyXG4gICAgfTtcclxufSkoalF1ZXJ5KTtcclxuXHJcbiIsIi8qKlxyXG4gKiBjaXJjbGVzIC0gdjAuMC42IC0gMjAxNS0xMS0yN1xyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUgbHVnb2xhYnNcclxuICogTGljZW5zZWQgXHJcbiAqL1xyXG4hZnVuY3Rpb24oYSxiKXtcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1iKCk6XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXSxiKTphLkNpcmNsZXM9YigpfSh0aGlzLGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7dmFyIGE9d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93Lm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZXx8ZnVuY3Rpb24oYSl7c2V0VGltZW91dChhLDFlMy82MCl9LGI9ZnVuY3Rpb24oYSl7dmFyIGI9YS5pZDtpZih0aGlzLl9lbD1kb2N1bWVudC5nZXRFbGVtZW50QnlJZChiKSxudWxsIT09dGhpcy5fZWwpe3RoaXMuX3JhZGl1cz1hLnJhZGl1c3x8MTAsdGhpcy5fZHVyYXRpb249dm9pZCAwPT09YS5kdXJhdGlvbj81MDA6YS5kdXJhdGlvbix0aGlzLl92YWx1ZT0wLHRoaXMuX21heFZhbHVlPWEubWF4VmFsdWV8fDEwMCx0aGlzLl90ZXh0PXZvaWQgMD09PWEudGV4dD9mdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5odG1saWZ5TnVtYmVyKGEpfTphLnRleHQsdGhpcy5fc3Ryb2tlV2lkdGg9YS53aWR0aHx8MTAsdGhpcy5fY29sb3JzPWEuY29sb3JzfHxbXCIjRUVFXCIsXCIjRjAwXCJdLHRoaXMuX3N2Zz1udWxsLHRoaXMuX21vdmluZ1BhdGg9bnVsbCx0aGlzLl93cmFwQ29udGFpbmVyPW51bGwsdGhpcy5fdGV4dENvbnRhaW5lcj1udWxsLHRoaXMuX3dycENsYXNzPWEud3JwQ2xhc3N8fFwiY2lyY2xlcy13cnBcIix0aGlzLl90ZXh0Q2xhc3M9YS50ZXh0Q2xhc3N8fFwiY2lyY2xlcy10ZXh0XCIsdGhpcy5fdmFsQ2xhc3M9YS52YWx1ZVN0cm9rZUNsYXNzfHxcImNpcmNsZXMtdmFsdWVTdHJva2VcIix0aGlzLl9tYXhWYWxDbGFzcz1hLm1heFZhbHVlU3Ryb2tlQ2xhc3N8fFwiY2lyY2xlcy1tYXhWYWx1ZVN0cm9rZVwiLHRoaXMuX3N0eWxlV3JhcHBlcj1hLnN0eWxlV3JhcHBlcj09PSExPyExOiEwLHRoaXMuX3N0eWxlVGV4dD1hLnN0eWxlVGV4dD09PSExPyExOiEwO3ZhciBjPU1hdGguUEkvMTgwKjI3MDt0aGlzLl9zdGFydD0tTWF0aC5QSS8xODAqOTAsdGhpcy5fc3RhcnRQcmVjaXNlPXRoaXMuX3ByZWNpc2UodGhpcy5fc3RhcnQpLHRoaXMuX2NpcmM9Yy10aGlzLl9zdGFydCx0aGlzLl9nZW5lcmF0ZSgpLnVwZGF0ZShhLnZhbHVlfHwwKX19O3JldHVybiBiLnByb3RvdHlwZT17VkVSU0lPTjpcIjAuMC42XCIsX2dlbmVyYXRlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3N2Z1NpemU9Mip0aGlzLl9yYWRpdXMsdGhpcy5fcmFkaXVzQWRqdXN0ZWQ9dGhpcy5fcmFkaXVzLXRoaXMuX3N0cm9rZVdpZHRoLzIsdGhpcy5fZ2VuZXJhdGVTdmcoKS5fZ2VuZXJhdGVUZXh0KCkuX2dlbmVyYXRlV3JhcHBlcigpLHRoaXMuX2VsLmlubmVySFRNTD1cIlwiLHRoaXMuX2VsLmFwcGVuZENoaWxkKHRoaXMuX3dyYXBDb250YWluZXIpLHRoaXN9LF9zZXRQZXJjZW50YWdlOmZ1bmN0aW9uKGEpe3RoaXMuX21vdmluZ1BhdGguc2V0QXR0cmlidXRlKFwiZFwiLHRoaXMuX2NhbGN1bGF0ZVBhdGgoYSwhMCkpLHRoaXMuX3RleHRDb250YWluZXIuaW5uZXJIVE1MPXRoaXMuX2dldFRleHQodGhpcy5nZXRWYWx1ZUZyb21QZXJjZW50KGEpKX0sX2dlbmVyYXRlV3JhcHBlcjpmdW5jdGlvbigpe3JldHVybiB0aGlzLl93cmFwQ29udGFpbmVyPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksdGhpcy5fd3JhcENvbnRhaW5lci5jbGFzc05hbWU9dGhpcy5fd3JwQ2xhc3MsdGhpcy5fc3R5bGVXcmFwcGVyJiYodGhpcy5fd3JhcENvbnRhaW5lci5zdHlsZS5wb3NpdGlvbj1cInJlbGF0aXZlXCIsdGhpcy5fd3JhcENvbnRhaW5lci5zdHlsZS5kaXNwbGF5PVwiaW5saW5lLWJsb2NrXCIpLHRoaXMuX3dyYXBDb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fc3ZnKSx0aGlzLl93cmFwQ29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuX3RleHRDb250YWluZXIpLHRoaXN9LF9nZW5lcmF0ZVRleHQ6ZnVuY3Rpb24oKXtpZih0aGlzLl90ZXh0Q29udGFpbmVyPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksdGhpcy5fdGV4dENvbnRhaW5lci5jbGFzc05hbWU9dGhpcy5fdGV4dENsYXNzLHRoaXMuX3N0eWxlVGV4dCl7dmFyIGE9e3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6MCxsZWZ0OjAsdGV4dEFsaWduOlwiY2VudGVyXCIsd2lkdGg6XCIxMDAlXCIsZm9udFNpemU6LjcqdGhpcy5fcmFkaXVzK1wicHhcIixoZWlnaHQ6dGhpcy5fc3ZnU2l6ZStcInB4XCIsbGluZUhlaWdodDp0aGlzLl9zdmdTaXplK1wicHhcIn07Zm9yKHZhciBiIGluIGEpdGhpcy5fdGV4dENvbnRhaW5lci5zdHlsZVtiXT1hW2JdfXJldHVybiB0aGlzLl90ZXh0Q29udGFpbmVyLmlubmVySFRNTD10aGlzLl9nZXRUZXh0KDApLHRoaXN9LF9nZXRUZXh0OmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLl90ZXh0Pyh2b2lkIDA9PT1hJiYoYT10aGlzLl92YWx1ZSksYT1wYXJzZUZsb2F0KGEudG9GaXhlZCgyKSksXCJmdW5jdGlvblwiPT10eXBlb2YgdGhpcy5fdGV4dD90aGlzLl90ZXh0LmNhbGwodGhpcyxhKTp0aGlzLl90ZXh0KTpcIlwifSxfZ2VuZXJhdGVTdmc6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fc3ZnPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsXCJzdmdcIiksdGhpcy5fc3ZnLnNldEF0dHJpYnV0ZShcInhtbG5zXCIsXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiKSx0aGlzLl9zdmcuc2V0QXR0cmlidXRlKFwid2lkdGhcIix0aGlzLl9zdmdTaXplKSx0aGlzLl9zdmcuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsdGhpcy5fc3ZnU2l6ZSksdGhpcy5fZ2VuZXJhdGVQYXRoKDEwMCwhMSx0aGlzLl9jb2xvcnNbMF0sdGhpcy5fbWF4VmFsQ2xhc3MpLl9nZW5lcmF0ZVBhdGgoMSwhMCx0aGlzLl9jb2xvcnNbMV0sdGhpcy5fdmFsQ2xhc3MpLHRoaXMuX21vdmluZ1BhdGg9dGhpcy5fc3ZnLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwicGF0aFwiKVsxXSx0aGlzfSxfZ2VuZXJhdGVQYXRoOmZ1bmN0aW9uKGEsYixjLGQpe3ZhciBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsXCJwYXRoXCIpO3JldHVybiBlLnNldEF0dHJpYnV0ZShcImZpbGxcIixcInRyYW5zcGFyZW50XCIpLGUuc2V0QXR0cmlidXRlKFwic3Ryb2tlXCIsYyksZS5zZXRBdHRyaWJ1dGUoXCJzdHJva2Utd2lkdGhcIix0aGlzLl9zdHJva2VXaWR0aCksZS5zZXRBdHRyaWJ1dGUoXCJkXCIsdGhpcy5fY2FsY3VsYXRlUGF0aChhLGIpKSxlLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsZCksdGhpcy5fc3ZnLmFwcGVuZENoaWxkKGUpLHRoaXN9LF9jYWxjdWxhdGVQYXRoOmZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcy5fc3RhcnQrYS8xMDAqdGhpcy5fY2lyYyxkPXRoaXMuX3ByZWNpc2UoYyk7cmV0dXJuIHRoaXMuX2FyYyhkLGIpfSxfYXJjOmZ1bmN0aW9uKGEsYil7dmFyIGM9YS0uMDAxLGQ9YS10aGlzLl9zdGFydFByZWNpc2U8TWF0aC5QST8wOjE7cmV0dXJuW1wiTVwiLHRoaXMuX3JhZGl1cyt0aGlzLl9yYWRpdXNBZGp1c3RlZCpNYXRoLmNvcyh0aGlzLl9zdGFydFByZWNpc2UpLHRoaXMuX3JhZGl1cyt0aGlzLl9yYWRpdXNBZGp1c3RlZCpNYXRoLnNpbih0aGlzLl9zdGFydFByZWNpc2UpLFwiQVwiLHRoaXMuX3JhZGl1c0FkanVzdGVkLHRoaXMuX3JhZGl1c0FkanVzdGVkLDAsZCwxLHRoaXMuX3JhZGl1cyt0aGlzLl9yYWRpdXNBZGp1c3RlZCpNYXRoLmNvcyhjKSx0aGlzLl9yYWRpdXMrdGhpcy5fcmFkaXVzQWRqdXN0ZWQqTWF0aC5zaW4oYyksYj9cIlwiOlwiWlwiXS5qb2luKFwiIFwiKX0sX3ByZWNpc2U6ZnVuY3Rpb24oYSl7cmV0dXJuIE1hdGgucm91bmQoMWUzKmEpLzFlM30saHRtbGlmeU51bWJlcjpmdW5jdGlvbihhLGIsYyl7Yj1ifHxcImNpcmNsZXMtaW50ZWdlclwiLGM9Y3x8XCJjaXJjbGVzLWRlY2ltYWxzXCI7dmFyIGQ9KGErXCJcIikuc3BsaXQoXCIuXCIpLGU9JzxzcGFuIGNsYXNzPVwiJytiKydcIj4nK2RbMF0rXCI8L3NwYW4+XCI7cmV0dXJuIGQubGVuZ3RoPjEmJihlKz0nLjxzcGFuIGNsYXNzPVwiJytjKydcIj4nK2RbMV0uc3Vic3RyaW5nKDAsMikrXCI8L3NwYW4+XCIpLGV9LHVwZGF0ZVJhZGl1czpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5fcmFkaXVzPWEsdGhpcy5fZ2VuZXJhdGUoKS51cGRhdGUoITApfSx1cGRhdGVXaWR0aDpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5fc3Ryb2tlV2lkdGg9YSx0aGlzLl9nZW5lcmF0ZSgpLnVwZGF0ZSghMCl9LHVwZGF0ZUNvbG9yczpmdW5jdGlvbihhKXt0aGlzLl9jb2xvcnM9YTt2YXIgYj10aGlzLl9zdmcuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJwYXRoXCIpO3JldHVybiBiWzBdLnNldEF0dHJpYnV0ZShcInN0cm9rZVwiLGFbMF0pLGJbMV0uc2V0QXR0cmlidXRlKFwic3Ryb2tlXCIsYVsxXSksdGhpc30sZ2V0UGVyY2VudDpmdW5jdGlvbigpe3JldHVybiAxMDAqdGhpcy5fdmFsdWUvdGhpcy5fbWF4VmFsdWV9LGdldFZhbHVlRnJvbVBlcmNlbnQ6ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuX21heFZhbHVlKmEvMTAwfSxnZXRWYWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl92YWx1ZX0sZ2V0TWF4VmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fbWF4VmFsdWV9LHVwZGF0ZTpmdW5jdGlvbihiLGMpe2lmKGI9PT0hMClyZXR1cm4gdGhpcy5fc2V0UGVyY2VudGFnZSh0aGlzLmdldFBlcmNlbnQoKSksdGhpcztpZih0aGlzLl92YWx1ZT09Ynx8aXNOYU4oYikpcmV0dXJuIHRoaXM7dm9pZCAwPT09YyYmKGM9dGhpcy5fZHVyYXRpb24pO3ZhciBkLGUsZixnLGg9dGhpcyxpPWguZ2V0UGVyY2VudCgpLGo9MTtyZXR1cm4gdGhpcy5fdmFsdWU9TWF0aC5taW4odGhpcy5fbWF4VmFsdWUsTWF0aC5tYXgoMCxiKSksYz8oZD1oLmdldFBlcmNlbnQoKSxlPWQ+aSxqKz1kJTEsZj1NYXRoLmZsb29yKE1hdGguYWJzKGQtaSkvaiksZz1jL2YsZnVuY3Rpb24gayhiKXtpZihlP2krPWo6aS09aixlJiZpPj1kfHwhZSYmZD49aSlyZXR1cm4gdm9pZCBhKGZ1bmN0aW9uKCl7aC5fc2V0UGVyY2VudGFnZShkKX0pO2EoZnVuY3Rpb24oKXtoLl9zZXRQZXJjZW50YWdlKGkpfSk7dmFyIGM9RGF0ZS5ub3coKSxmPWMtYjtmPj1nP2soYyk6c2V0VGltZW91dChmdW5jdGlvbigpe2soRGF0ZS5ub3coKSl9LGctZil9KERhdGUubm93KCkpLHRoaXMpOih0aGlzLl9zZXRQZXJjZW50YWdlKHRoaXMuZ2V0UGVyY2VudCgpKSx0aGlzKX19LGIuY3JlYXRlPWZ1bmN0aW9uKGEpe3JldHVybiBuZXcgYihhKX0sYn0pOyIsInZhciBEYXRlcGlja2VyO1xyXG5cclxuKGZ1bmN0aW9uICh3aW5kb3csICQsIHVuZGVmaW5lZCkge1xyXG4gICAgdmFyIHBsdWdpbk5hbWUgPSAnZGF0ZXBpY2tlcicsXHJcbiAgICAgICAgYXV0b0luaXRTZWxlY3RvciA9ICcuZGF0ZXBpY2tlci1oZXJlJyxcclxuICAgICAgICAkYm9keSwgJGRhdGVwaWNrZXJzQ29udGFpbmVyLFxyXG4gICAgICAgIGNvbnRhaW5lckJ1aWx0ID0gZmFsc2UsXHJcbiAgICAgICAgYmFzZVRlbXBsYXRlID0gJycgK1xyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXJcIj4nICtcclxuICAgICAgICAgICAgJzxuYXYgY2xhc3M9XCJkYXRlcGlja2VyLS1uYXZcIj48L25hdj4nICtcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1jb250ZW50XCI+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nLFxyXG4gICAgICAgIGRlZmF1bHRzID0ge1xyXG4gICAgICAgICAgICBjbGFzc2VzOiAnJyxcclxuICAgICAgICAgICAgaW5saW5lOiBmYWxzZSxcclxuICAgICAgICAgICAgbGFuZ3VhZ2U6ICdydScsXHJcbiAgICAgICAgICAgIHN0YXJ0RGF0ZTogbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgZmlyc3REYXk6ICcnLFxyXG4gICAgICAgICAgICB3ZWVrZW5kczogWzYsIDBdLFxyXG4gICAgICAgICAgICBkYXRlRm9ybWF0OiAnJyxcclxuICAgICAgICAgICAgYWx0RmllbGQ6ICcnLFxyXG4gICAgICAgICAgICBhbHRGaWVsZERhdGVGb3JtYXQ6ICdAJyxcclxuICAgICAgICAgICAgdG9nZ2xlU2VsZWN0ZWQ6IHRydWUsXHJcbiAgICAgICAgICAgIGtleWJvYXJkTmF2OiB0cnVlLFxyXG5cclxuICAgICAgICAgICAgcG9zaXRpb246ICdib3R0b20gbGVmdCcsXHJcbiAgICAgICAgICAgIG9mZnNldDogMTIsXHJcblxyXG4gICAgICAgICAgICB2aWV3OiAnZGF5cycsXHJcbiAgICAgICAgICAgIG1pblZpZXc6ICdkYXlzJyxcclxuXHJcbiAgICAgICAgICAgIHNob3dPdGhlck1vbnRoczogdHJ1ZSxcclxuICAgICAgICAgICAgc2VsZWN0T3RoZXJNb250aHM6IHRydWUsXHJcbiAgICAgICAgICAgIG1vdmVUb090aGVyTW9udGhzT25TZWxlY3Q6IHRydWUsXHJcblxyXG4gICAgICAgICAgICBzaG93T3RoZXJZZWFyczogdHJ1ZSxcclxuICAgICAgICAgICAgc2VsZWN0T3RoZXJZZWFyczogdHJ1ZSxcclxuICAgICAgICAgICAgbW92ZVRvT3RoZXJZZWFyc09uU2VsZWN0OiB0cnVlLFxyXG5cclxuICAgICAgICAgICAgbWluRGF0ZTogJycsXHJcbiAgICAgICAgICAgIG1heERhdGU6ICcnLFxyXG4gICAgICAgICAgICBkaXNhYmxlTmF2V2hlbk91dE9mUmFuZ2U6IHRydWUsXHJcblxyXG4gICAgICAgICAgICBtdWx0aXBsZURhdGVzOiBmYWxzZSwgLy8gQm9vbGVhbiBvciBOdW1iZXJcclxuICAgICAgICAgICAgbXVsdGlwbGVEYXRlc1NlcGFyYXRvcjogJywnLFxyXG4gICAgICAgICAgICByYW5nZTogZmFsc2UsXHJcblxyXG4gICAgICAgICAgICB0b2RheUJ1dHRvbjogZmFsc2UsXHJcbiAgICAgICAgICAgIGNsZWFyQnV0dG9uOiBmYWxzZSxcclxuXHJcbiAgICAgICAgICAgIHNob3dFdmVudDogJ2ZvY3VzJyxcclxuICAgICAgICAgICAgYXV0b0Nsb3NlOiBmYWxzZSxcclxuXHJcbiAgICAgICAgICAgIC8vIG5hdmlnYXRpb25cclxuICAgICAgICAgICAgbW9udGhzRmllbGQ6ICdtb250aHNTaG9ydCcsXHJcbiAgICAgICAgICAgIHByZXZIdG1sOiAnPHN2Zz48cGF0aCBkPVwiTSAxNywxMiBsIC01LDUgbCA1LDVcIj48L3BhdGg+PC9zdmc+JyxcclxuICAgICAgICAgICAgbmV4dEh0bWw6ICc8c3ZnPjxwYXRoIGQ9XCJNIDE0LDEyIGwgNSw1IGwgLTUsNVwiPjwvcGF0aD48L3N2Zz4nLFxyXG4gICAgICAgICAgICBuYXZUaXRsZXM6IHtcclxuICAgICAgICAgICAgICAgIGRheXM6ICdNTSwgPGk+eXl5eTwvaT4nLFxyXG4gICAgICAgICAgICAgICAgbW9udGhzOiAneXl5eScsXHJcbiAgICAgICAgICAgICAgICB5ZWFyczogJ3l5eXkxIC0geXl5eTInXHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAvLyBldmVudHNcclxuICAgICAgICAgICAgb25TZWxlY3Q6ICcnLFxyXG4gICAgICAgICAgICBvbkNoYW5nZU1vbnRoOiAnJyxcclxuICAgICAgICAgICAgb25DaGFuZ2VZZWFyOiAnJyxcclxuICAgICAgICAgICAgb25DaGFuZ2VEZWNhZGU6ICcnLFxyXG4gICAgICAgICAgICBvbkNoYW5nZVZpZXc6ICcnLFxyXG4gICAgICAgICAgICBvblJlbmRlckNlbGw6ICcnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBob3RLZXlzID0ge1xyXG4gICAgICAgICAgICAnY3RybFJpZ2h0JzogWzE3LCAzOV0sXHJcbiAgICAgICAgICAgICdjdHJsVXAnOiBbMTcsIDM4XSxcclxuICAgICAgICAgICAgJ2N0cmxMZWZ0JzogWzE3LCAzN10sXHJcbiAgICAgICAgICAgICdjdHJsRG93bic6IFsxNywgNDBdLFxyXG4gICAgICAgICAgICAnc2hpZnRSaWdodCc6IFsxNiwgMzldLFxyXG4gICAgICAgICAgICAnc2hpZnRVcCc6IFsxNiwgMzhdLFxyXG4gICAgICAgICAgICAnc2hpZnRMZWZ0JzogWzE2LCAzN10sXHJcbiAgICAgICAgICAgICdzaGlmdERvd24nOiBbMTYsIDQwXSxcclxuICAgICAgICAgICAgJ2FsdFVwJzogWzE4LCAzOF0sXHJcbiAgICAgICAgICAgICdhbHRSaWdodCc6IFsxOCwgMzldLFxyXG4gICAgICAgICAgICAnYWx0TGVmdCc6IFsxOCwgMzddLFxyXG4gICAgICAgICAgICAnYWx0RG93bic6IFsxOCwgNDBdLFxyXG4gICAgICAgICAgICAnY3RybFNoaWZ0VXAnOiBbMTYsIDE3LCAzOF1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGRhdGVwaWNrZXI7XHJcblxyXG4gICAgRGF0ZXBpY2tlciAgPSBmdW5jdGlvbiAoZWwsIG9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLmVsID0gZWw7XHJcbiAgICAgICAgdGhpcy4kZWwgPSAkKGVsKTtcclxuXHJcbiAgICAgICAgdGhpcy5vcHRzID0gJC5leHRlbmQodHJ1ZSwge30sIGRlZmF1bHRzLCBvcHRpb25zLCB0aGlzLiRlbC5kYXRhKCkpO1xyXG5cclxuICAgICAgICBpZiAoJGJvZHkgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICRib2R5ID0gJCgnYm9keScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLm9wdHMuc3RhcnREYXRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0cy5zdGFydERhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZWwubm9kZU5hbWUgPT0gJ0lOUFVUJykge1xyXG4gICAgICAgICAgICB0aGlzLmVsSXNJbnB1dCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5vcHRzLmFsdEZpZWxkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGFsdEZpZWxkID0gdHlwZW9mIHRoaXMub3B0cy5hbHRGaWVsZCA9PSAnc3RyaW5nJyA/ICQodGhpcy5vcHRzLmFsdEZpZWxkKSA6IHRoaXMub3B0cy5hbHRGaWVsZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zaWxlbnQgPSBmYWxzZTsgLy8gTmVlZCB0byBwcmV2ZW50IHVubmVjZXNzYXJ5IHJlbmRlcmluZ1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnREYXRlID0gdGhpcy5vcHRzLnN0YXJ0RGF0ZTtcclxuICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gdGhpcy5vcHRzLnZpZXc7XHJcbiAgICAgICAgdGhpcy5fY3JlYXRlU2hvcnRDdXRzKCk7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZERhdGVzID0gW107XHJcbiAgICAgICAgdGhpcy52aWV3cyA9IHt9O1xyXG4gICAgICAgIHRoaXMua2V5cyA9IFtdO1xyXG4gICAgICAgIHRoaXMubWluUmFuZ2UgPSAnJztcclxuICAgICAgICB0aGlzLm1heFJhbmdlID0gJyc7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpXHJcbiAgICB9O1xyXG5cclxuICAgIGRhdGVwaWNrZXIgPSBEYXRlcGlja2VyO1xyXG5cclxuICAgIGRhdGVwaWNrZXIucHJvdG90eXBlID0ge1xyXG4gICAgICAgIHZpZXdJbmRleGVzOiBbJ2RheXMnLCAnbW9udGhzJywgJ3llYXJzJ10sXHJcblxyXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCFjb250YWluZXJCdWlsdCAmJiAhdGhpcy5vcHRzLmlubGluZSAmJiB0aGlzLmVsSXNJbnB1dCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYnVpbGREYXRlcGlja2Vyc0NvbnRhaW5lcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2J1aWxkQmFzZUh0bWwoKTtcclxuICAgICAgICAgICAgdGhpcy5fZGVmaW5lTG9jYWxlKHRoaXMub3B0cy5sYW5ndWFnZSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3N5bmNXaXRoTWluTWF4RGF0ZXMoKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmVsSXNJbnB1dCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm9wdHMuaW5saW5lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gU2V0IGV4dHJhIGNsYXNzZXMgZm9yIHByb3BlciB0cmFuc2l0aW9uc1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldFBvc2l0aW9uQ2xhc3Nlcyh0aGlzLm9wdHMucG9zaXRpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2JpbmRFdmVudHMoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5rZXlib2FyZE5hdikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2JpbmRLZXlib2FyZEV2ZW50cygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlci5vbignbW91c2Vkb3duJywgdGhpcy5fb25Nb3VzZURvd25EYXRlcGlja2VyLmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlci5vbignbW91c2V1cCcsIHRoaXMuX29uTW91c2VVcERhdGVwaWNrZXIuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMuY2xhc3Nlcykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlci5hZGRDbGFzcyh0aGlzLm9wdHMuY2xhc3NlcylcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy52aWV3c1t0aGlzLmN1cnJlbnRWaWV3XSA9IG5ldyBEYXRlcGlja2VyLkJvZHkodGhpcywgdGhpcy5jdXJyZW50VmlldywgdGhpcy5vcHRzKTtcclxuICAgICAgICAgICAgdGhpcy52aWV3c1t0aGlzLmN1cnJlbnRWaWV3XS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMubmF2ID0gbmV3IERhdGVwaWNrZXIuTmF2aWdhdGlvbih0aGlzLCB0aGlzLm9wdHMpO1xyXG4gICAgICAgICAgICB0aGlzLnZpZXcgPSB0aGlzLmN1cnJlbnRWaWV3O1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlci5vbignbW91c2VlbnRlcicsICcuZGF0ZXBpY2tlci0tY2VsbCcsIHRoaXMuX29uTW91c2VFbnRlckNlbGwuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXIub24oJ21vdXNlbGVhdmUnLCAnLmRhdGVwaWNrZXItLWNlbGwnLCB0aGlzLl9vbk1vdXNlTGVhdmVDZWxsLmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pbml0ZWQgPSB0cnVlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9jcmVhdGVTaG9ydEN1dHM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5taW5EYXRlID0gdGhpcy5vcHRzLm1pbkRhdGUgPyB0aGlzLm9wdHMubWluRGF0ZSA6IG5ldyBEYXRlKC04NjM5OTk5OTEzNjAwMDAwKTtcclxuICAgICAgICAgICAgdGhpcy5tYXhEYXRlID0gdGhpcy5vcHRzLm1heERhdGUgPyB0aGlzLm9wdHMubWF4RGF0ZSA6IG5ldyBEYXRlKDg2Mzk5OTk5MTM2MDAwMDApO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9iaW5kRXZlbnRzIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRlbC5vbih0aGlzLm9wdHMuc2hvd0V2ZW50ICsgJy5hZHAnLCB0aGlzLl9vblNob3dFdmVudC5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgdGhpcy4kZWwub24oJ2JsdXIuYWRwJywgdGhpcy5fb25CbHVyLmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICB0aGlzLiRlbC5vbignaW5wdXQuYWRwJywgdGhpcy5fb25JbnB1dC5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuYWRwJywgdGhpcy5fb25SZXNpemUuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2JpbmRLZXlib2FyZEV2ZW50czogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRlbC5vbigna2V5ZG93bi5hZHAnLCB0aGlzLl9vbktleURvd24uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLm9uKCdrZXl1cC5hZHAnLCB0aGlzLl9vbktleVVwLmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICB0aGlzLiRlbC5vbignaG90S2V5LmFkcCcsIHRoaXMuX29uSG90S2V5LmJpbmQodGhpcykpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGlzV2Vla2VuZDogZnVuY3Rpb24gKGRheSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRzLndlZWtlbmRzLmluZGV4T2YoZGF5KSAhPT0gLTE7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2RlZmluZUxvY2FsZTogZnVuY3Rpb24gKGxhbmcpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBsYW5nID09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYyA9IERhdGVwaWNrZXIubGFuZ3VhZ2VbbGFuZ107XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubG9jKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdDYW5cXCd0IGZpbmQgbGFuZ3VhZ2UgXCInICsgbGFuZyArICdcIiBpbiBEYXRlcGlja2VyLmxhbmd1YWdlLCB3aWxsIHVzZSBcInJ1XCIgaW5zdGVhZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9jID0gJC5leHRlbmQodHJ1ZSwge30sIERhdGVwaWNrZXIubGFuZ3VhZ2UucnUpXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2MgPSAkLmV4dGVuZCh0cnVlLCB7fSwgRGF0ZXBpY2tlci5sYW5ndWFnZS5ydSwgRGF0ZXBpY2tlci5sYW5ndWFnZVtsYW5nXSlcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9jID0gJC5leHRlbmQodHJ1ZSwge30sIERhdGVwaWNrZXIubGFuZ3VhZ2UucnUsIGxhbmcpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMuZGF0ZUZvcm1hdCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2MuZGF0ZUZvcm1hdCA9IHRoaXMub3B0cy5kYXRlRm9ybWF0XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMuZmlyc3REYXkgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYy5maXJzdERheSA9IHRoaXMub3B0cy5maXJzdERheVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2J1aWxkRGF0ZXBpY2tlcnNDb250YWluZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgY29udGFpbmVyQnVpbHQgPSB0cnVlO1xyXG4gICAgICAgICAgICAkYm9keS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJkYXRlcGlja2Vycy1jb250YWluZXJcIiBpZD1cImRhdGVwaWNrZXJzLWNvbnRhaW5lclwiPjwvZGl2PicpO1xyXG4gICAgICAgICAgICAkZGF0ZXBpY2tlcnNDb250YWluZXIgPSAkKCcjZGF0ZXBpY2tlcnMtY29udGFpbmVyJyk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2J1aWxkQmFzZUh0bWw6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyICRhcHBlbmRUYXJnZXQsXHJcbiAgICAgICAgICAgICAgICAkaW5saW5lID0gJCgnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItaW5saW5lXCI+Jyk7XHJcblxyXG4gICAgICAgICAgICBpZih0aGlzLmVsLm5vZGVOYW1lID09ICdJTlBVVCcpIHtcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5vcHRzLmlubGluZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICRhcHBlbmRUYXJnZXQgPSAkZGF0ZXBpY2tlcnNDb250YWluZXI7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICRhcHBlbmRUYXJnZXQgPSAkaW5saW5lLmluc2VydEFmdGVyKHRoaXMuJGVsKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJGFwcGVuZFRhcmdldCA9ICRpbmxpbmUuYXBwZW5kVG8odGhpcy4kZWwpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXIgPSAkKGJhc2VUZW1wbGF0ZSkuYXBwZW5kVG8oJGFwcGVuZFRhcmdldCk7XHJcbiAgICAgICAgICAgIHRoaXMuJGNvbnRlbnQgPSAkKCcuZGF0ZXBpY2tlci0tY29udGVudCcsIHRoaXMuJGRhdGVwaWNrZXIpO1xyXG4gICAgICAgICAgICB0aGlzLiRuYXYgPSAkKCcuZGF0ZXBpY2tlci0tbmF2JywgdGhpcy4kZGF0ZXBpY2tlcik7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX3RyaWdnZXJPbkNoYW5nZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuc2VsZWN0ZWREYXRlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdHMub25TZWxlY3QoJycsICcnLCB0aGlzKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHNlbGVjdGVkRGF0ZXMgPSB0aGlzLnNlbGVjdGVkRGF0ZXMsXHJcbiAgICAgICAgICAgICAgICBwYXJzZWRTZWxlY3RlZCA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZShzZWxlY3RlZERhdGVzWzBdKSxcclxuICAgICAgICAgICAgICAgIGZvcm1hdHRlZERhdGVzLFxyXG4gICAgICAgICAgICAgICAgX3RoaXMgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgZGF0ZXMgPSBuZXcgRGF0ZShwYXJzZWRTZWxlY3RlZC55ZWFyLCBwYXJzZWRTZWxlY3RlZC5tb250aCwgcGFyc2VkU2VsZWN0ZWQuZGF0ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9ybWF0dGVkRGF0ZXMgPSBzZWxlY3RlZERhdGVzLm1hcChmdW5jdGlvbiAoZGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5mb3JtYXREYXRlKF90aGlzLmxvYy5kYXRlRm9ybWF0LCBkYXRlKVxyXG4gICAgICAgICAgICAgICAgfSkuam9pbih0aGlzLm9wdHMubXVsdGlwbGVEYXRlc1NlcGFyYXRvcik7XHJcblxyXG4gICAgICAgICAgICAvLyBDcmVhdGUgbmV3IGRhdGVzIGFycmF5LCB0byBzZXBhcmF0ZSBpdCBmcm9tIG9yaWdpbmFsIHNlbGVjdGVkRGF0ZXNcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5tdWx0aXBsZURhdGVzIHx8IHRoaXMub3B0cy5yYW5nZSkge1xyXG4gICAgICAgICAgICAgICAgZGF0ZXMgPSBzZWxlY3RlZERhdGVzLm1hcChmdW5jdGlvbihkYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcnNlZERhdGUgPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUoZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHBhcnNlZERhdGUueWVhciwgcGFyc2VkRGF0ZS5tb250aCwgcGFyc2VkRGF0ZS5kYXRlKVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5vcHRzLm9uU2VsZWN0KGZvcm1hdHRlZERhdGVzLCBkYXRlcywgdGhpcyk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgZCA9IHRoaXMucGFyc2VkRGF0ZSxcclxuICAgICAgICAgICAgICAgIG8gPSB0aGlzLm9wdHM7XHJcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy52aWV3KSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdkYXlzJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShkLnllYXIsIGQubW9udGggKyAxLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoby5vbkNoYW5nZU1vbnRoKSBvLm9uQ2hhbmdlTW9udGgodGhpcy5wYXJzZWREYXRlLm1vbnRoLCB0aGlzLnBhcnNlZERhdGUueWVhcik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdtb250aHMnOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKGQueWVhciArIDEsIGQubW9udGgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvLm9uQ2hhbmdlWWVhcikgby5vbkNoYW5nZVllYXIodGhpcy5wYXJzZWREYXRlLnllYXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAneWVhcnMnOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKGQueWVhciArIDEwLCAwLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoby5vbkNoYW5nZURlY2FkZSkgby5vbkNoYW5nZURlY2FkZSh0aGlzLmN1ckRlY2FkZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBwcmV2OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBkID0gdGhpcy5wYXJzZWREYXRlLFxyXG4gICAgICAgICAgICAgICAgbyA9IHRoaXMub3B0cztcclxuICAgICAgICAgICAgc3dpdGNoICh0aGlzLnZpZXcpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2RheXMnOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKGQueWVhciwgZC5tb250aCAtIDEsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvLm9uQ2hhbmdlTW9udGgpIG8ub25DaGFuZ2VNb250aCh0aGlzLnBhcnNlZERhdGUubW9udGgsIHRoaXMucGFyc2VkRGF0ZS55ZWFyKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ21vbnRocyc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoZC55ZWFyIC0gMSwgZC5tb250aCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG8ub25DaGFuZ2VZZWFyKSBvLm9uQ2hhbmdlWWVhcih0aGlzLnBhcnNlZERhdGUueWVhcik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICd5ZWFycyc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoZC55ZWFyIC0gMTAsIDAsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvLm9uQ2hhbmdlRGVjYWRlKSBvLm9uQ2hhbmdlRGVjYWRlKHRoaXMuY3VyRGVjYWRlKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGZvcm1hdERhdGU6IGZ1bmN0aW9uIChzdHJpbmcsIGRhdGUpIHtcclxuICAgICAgICAgICAgZGF0ZSA9IGRhdGUgfHwgdGhpcy5kYXRlO1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gc3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgYm91bmRhcnkgPSB0aGlzLl9nZXRXb3JkQm91bmRhcnlSZWdFeHAsXHJcbiAgICAgICAgICAgICAgICBsb2NhbGUgPSB0aGlzLmxvYyxcclxuICAgICAgICAgICAgICAgIGRlY2FkZSA9IGRhdGVwaWNrZXIuZ2V0RGVjYWRlKGRhdGUpLFxyXG4gICAgICAgICAgICAgICAgZCA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZShkYXRlKTtcclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAvQC8udGVzdChyZXN1bHQpOlxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKC9ALywgZGF0ZS5nZXRUaW1lKCkpO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAvZGQvLnRlc3QocmVzdWx0KTpcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgnZGQnKSwgZC5mdWxsRGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBjYXNlIC9kLy50ZXN0KHJlc3VsdCk6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ2QnKSwgZC5kYXRlKTtcclxuICAgICAgICAgICAgICAgIGNhc2UgL0RELy50ZXN0KHJlc3VsdCk6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ0REJyksIGxvY2FsZS5kYXlzW2QuZGF5XSk7XHJcbiAgICAgICAgICAgICAgICBjYXNlIC9ELy50ZXN0KHJlc3VsdCk6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ0QnKSwgbG9jYWxlLmRheXNTaG9ydFtkLmRheV0pO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAvbW0vLnRlc3QocmVzdWx0KTpcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgnbW0nKSwgZC5mdWxsTW9udGgpO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAvbS8udGVzdChyZXN1bHQpOlxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCdtJyksIGQubW9udGggKyAxKTtcclxuICAgICAgICAgICAgICAgIGNhc2UgL01NLy50ZXN0KHJlc3VsdCk6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ01NJyksIHRoaXMubG9jLm1vbnRoc1tkLm1vbnRoXSk7XHJcbiAgICAgICAgICAgICAgICBjYXNlIC9NLy50ZXN0KHJlc3VsdCk6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ00nKSwgbG9jYWxlLm1vbnRoc1Nob3J0W2QubW9udGhdKTtcclxuICAgICAgICAgICAgICAgIGNhc2UgL3l5eXkvLnRlc3QocmVzdWx0KTpcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgneXl5eScpLCBkLnllYXIpO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAveXl5eTEvLnRlc3QocmVzdWx0KTpcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgneXl5eTEnKSwgZGVjYWRlWzBdKTtcclxuICAgICAgICAgICAgICAgIGNhc2UgL3l5eXkyLy50ZXN0KHJlc3VsdCk6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ3l5eXkyJyksIGRlY2FkZVsxXSk7XHJcbiAgICAgICAgICAgICAgICBjYXNlIC95eS8udGVzdChyZXN1bHQpOlxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCd5eScpLCBkLnllYXIudG9TdHJpbmcoKS5zbGljZSgtMikpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9nZXRXb3JkQm91bmRhcnlSZWdFeHA6IGZ1bmN0aW9uIChzaWduKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUmVnRXhwKCdcXFxcYig/PVthLXpBLVowLTnDpMO2w7zDn8OEw5bDnDxdKScgKyBzaWduICsgJyg/IVs+YS16QS1aMC05w6TDtsO8w5/DhMOWw5xdKScpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNlbGVjdERhdGU6IGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvcHRzID0gX3RoaXMub3B0cyxcclxuICAgICAgICAgICAgICAgIGQgPSBfdGhpcy5wYXJzZWREYXRlLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWREYXRlcyA9IF90aGlzLnNlbGVjdGVkRGF0ZXMsXHJcbiAgICAgICAgICAgICAgICBsZW4gPSBzZWxlY3RlZERhdGVzLmxlbmd0aCxcclxuICAgICAgICAgICAgICAgIG5ld0RhdGUgPSAnJztcclxuXHJcbiAgICAgICAgICAgIGlmICghKGRhdGUgaW5zdGFuY2VvZiBEYXRlKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgaWYgKF90aGlzLnZpZXcgPT0gJ2RheXMnKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZS5nZXRNb250aCgpICE9IGQubW9udGggJiYgb3B0cy5tb3ZlVG9PdGhlck1vbnRoc09uU2VsZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3RGF0ZSA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCAxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKF90aGlzLnZpZXcgPT0gJ3llYXJzJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGUuZ2V0RnVsbFllYXIoKSAhPSBkLnllYXIgJiYgb3B0cy5tb3ZlVG9PdGhlclllYXJzT25TZWxlY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICBuZXdEYXRlID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCAwLCAxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKG5ld0RhdGUpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLnNpbGVudCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5kYXRlID0gbmV3RGF0ZTtcclxuICAgICAgICAgICAgICAgIF90aGlzLnNpbGVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMubmF2Ll9yZW5kZXIoKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAob3B0cy5tdWx0aXBsZURhdGVzICYmICFvcHRzLnJhbmdlKSB7IC8vIFNldCBwcmlvcml0eSB0byByYW5nZSBmdW5jdGlvbmFsaXR5XHJcbiAgICAgICAgICAgICAgICBpZiAobGVuID09PSBvcHRzLm11bHRpcGxlRGF0ZXMpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIGlmICghX3RoaXMuX2lzU2VsZWN0ZWQoZGF0ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZWxlY3RlZERhdGVzLnB1c2goZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0cy5yYW5nZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGxlbiA9PSAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2VsZWN0ZWREYXRlcyA9IFtkYXRlXTtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5taW5SYW5nZSA9IGRhdGU7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMubWF4UmFuZ2UgPSAnJztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobGVuID09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZWxlY3RlZERhdGVzLnB1c2goZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFfdGhpcy5tYXhSYW5nZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLm1heFJhbmdlID0gZGF0ZTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5taW5SYW5nZSA9IGRhdGU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnNlbGVjdGVkRGF0ZXMgPSBbX3RoaXMubWluUmFuZ2UsIF90aGlzLm1heFJhbmdlXVxyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2VsZWN0ZWREYXRlcyA9IFtkYXRlXTtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5taW5SYW5nZSA9IGRhdGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5zZWxlY3RlZERhdGVzID0gW2RhdGVdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBfdGhpcy5fc2V0SW5wdXRWYWx1ZSgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKG9wdHMub25TZWxlY3QpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLl90cmlnZ2VyT25DaGFuZ2UoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKG9wdHMuYXV0b0Nsb3NlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIW9wdHMubXVsdGlwbGVEYXRlcyAmJiAhb3B0cy5yYW5nZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0cy5yYW5nZSAmJiBfdGhpcy5zZWxlY3RlZERhdGVzLmxlbmd0aCA9PSAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBfdGhpcy52aWV3c1t0aGlzLmN1cnJlbnRWaWV3XS5fcmVuZGVyKClcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICByZW1vdmVEYXRlOiBmdW5jdGlvbiAoZGF0ZSkge1xyXG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSB0aGlzLnNlbGVjdGVkRGF0ZXMsXHJcbiAgICAgICAgICAgICAgICBfdGhpcyA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICBpZiAoIShkYXRlIGluc3RhbmNlb2YgRGF0ZSkpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzZWxlY3RlZC5zb21lKGZ1bmN0aW9uIChjdXJEYXRlLCBpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZXBpY2tlci5pc1NhbWUoY3VyRGF0ZSwgZGF0ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZC5zcGxpY2UoaSwgMSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghX3RoaXMuc2VsZWN0ZWREYXRlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMubWluUmFuZ2UgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMubWF4UmFuZ2UgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnZpZXdzW190aGlzLmN1cnJlbnRWaWV3XS5fcmVuZGVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuX3NldElucHV0VmFsdWUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzLm9wdHMub25TZWxlY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuX3RyaWdnZXJPbkNoYW5nZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICB0b2RheTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMudmlldyA9IHRoaXMub3B0cy5taW5WaWV3O1xyXG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlcyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLm1pblJhbmdlID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMubWF4UmFuZ2UgPSAnJztcclxuICAgICAgICAgICAgdGhpcy52aWV3c1t0aGlzLmN1cnJlbnRWaWV3XS5fcmVuZGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3NldElucHV0VmFsdWUoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5vblNlbGVjdCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdHJpZ2dlck9uQ2hhbmdlKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFVwZGF0ZXMgZGF0ZXBpY2tlciBvcHRpb25zXHJcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBwYXJhbSAtIHBhcmFtZXRlcidzIG5hbWUgdG8gdXBkYXRlLiBJZiBvYmplY3QgdGhlbiBpdCB3aWxsIGV4dGVuZCBjdXJyZW50IG9wdGlvbnNcclxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ8T2JqZWN0fSBbdmFsdWVdIC0gbmV3IHBhcmFtIHZhbHVlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiAocGFyYW0sIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHZhciBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xyXG4gICAgICAgICAgICBpZiAobGVuID09IDIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3B0c1twYXJhbV0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChsZW4gPT0gMSAmJiB0eXBlb2YgcGFyYW0gPT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3B0cyA9ICQuZXh0ZW5kKHRydWUsIHRoaXMub3B0cywgcGFyYW0pXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZVNob3J0Q3V0cygpO1xyXG4gICAgICAgICAgICB0aGlzLl9zeW5jV2l0aE1pbk1heERhdGVzKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2RlZmluZUxvY2FsZSh0aGlzLm9wdHMubGFuZ3VhZ2UpO1xyXG4gICAgICAgICAgICB0aGlzLm5hdi5fYWRkQnV0dG9uc0lmTmVlZCgpO1xyXG4gICAgICAgICAgICB0aGlzLm5hdi5fcmVuZGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMudmlld3NbdGhpcy5jdXJyZW50Vmlld10uX3JlbmRlcigpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuZWxJc0lucHV0ICYmICF0aGlzLm9wdHMuaW5saW5lKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRQb3NpdGlvbkNsYXNzZXModGhpcy5vcHRzLnBvc2l0aW9uKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnZpc2libGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFBvc2l0aW9uKHRoaXMub3B0cy5wb3NpdGlvbilcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5jbGFzc2VzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyLmFkZENsYXNzKHRoaXMub3B0cy5jbGFzc2VzKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfc3luY1dpdGhNaW5NYXhEYXRlczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgY3VyVGltZSA9IHRoaXMuZGF0ZS5nZXRUaW1lKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgaWYgKHRoaXMubWluVGltZSA+IGN1clRpbWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHRoaXMubWluRGF0ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMubWF4VGltZSA8IGN1clRpbWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IHRoaXMubWF4RGF0ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IGZhbHNlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9pc1NlbGVjdGVkOiBmdW5jdGlvbiAoY2hlY2tEYXRlLCBjZWxsVHlwZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZERhdGVzLnNvbWUoZnVuY3Rpb24gKGRhdGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRlcGlja2VyLmlzU2FtZShkYXRlLCBjaGVja0RhdGUsIGNlbGxUeXBlKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9zZXRJbnB1dFZhbHVlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvcHRzID0gX3RoaXMub3B0cyxcclxuICAgICAgICAgICAgICAgIGZvcm1hdCA9IF90aGlzLmxvYy5kYXRlRm9ybWF0LFxyXG4gICAgICAgICAgICAgICAgYWx0Rm9ybWF0ID0gb3B0cy5hbHRGaWVsZERhdGVGb3JtYXQsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IF90aGlzLnNlbGVjdGVkRGF0ZXMubWFwKGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLmZvcm1hdERhdGUoZm9ybWF0LCBkYXRlKVxyXG4gICAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgICAgICBhbHRWYWx1ZXM7XHJcblxyXG4gICAgICAgICAgICBpZiAob3B0cy5hbHRGaWVsZCAmJiBfdGhpcy4kYWx0RmllbGQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBhbHRWYWx1ZXMgPSB0aGlzLnNlbGVjdGVkRGF0ZXMubWFwKGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLmZvcm1hdERhdGUoYWx0Rm9ybWF0LCBkYXRlKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBhbHRWYWx1ZXMgPSBhbHRWYWx1ZXMuam9pbih0aGlzLm9wdHMubXVsdGlwbGVEYXRlc1NlcGFyYXRvcik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRhbHRGaWVsZC52YWwoYWx0VmFsdWVzKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5qb2luKHRoaXMub3B0cy5tdWx0aXBsZURhdGVzU2VwYXJhdG9yKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJGVsLnZhbCh2YWx1ZSlcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDaGVjayBpZiBkYXRlIGlzIGJldHdlZW4gbWluRGF0ZSBhbmQgbWF4RGF0ZVxyXG4gICAgICAgICAqIEBwYXJhbSBkYXRlIHtvYmplY3R9IC0gZGF0ZSBvYmplY3RcclxuICAgICAgICAgKiBAcGFyYW0gdHlwZSB7c3RyaW5nfSAtIGNlbGwgdHlwZVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgX2lzSW5SYW5nZTogZnVuY3Rpb24gKGRhdGUsIHR5cGUpIHtcclxuICAgICAgICAgICAgdmFyIHRpbWUgPSBkYXRlLmdldFRpbWUoKSxcclxuICAgICAgICAgICAgICAgIGQgPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUoZGF0ZSksXHJcbiAgICAgICAgICAgICAgICBtaW4gPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUodGhpcy5taW5EYXRlKSxcclxuICAgICAgICAgICAgICAgIG1heCA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZSh0aGlzLm1heERhdGUpLFxyXG4gICAgICAgICAgICAgICAgZE1pblRpbWUgPSBuZXcgRGF0ZShkLnllYXIsIGQubW9udGgsIG1pbi5kYXRlKS5nZXRUaW1lKCksXHJcbiAgICAgICAgICAgICAgICBkTWF4VGltZSA9IG5ldyBEYXRlKGQueWVhciwgZC5tb250aCwgbWF4LmRhdGUpLmdldFRpbWUoKSxcclxuICAgICAgICAgICAgICAgIHR5cGVzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRheTogdGltZSA+PSB0aGlzLm1pblRpbWUgJiYgdGltZSA8PSB0aGlzLm1heFRpbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgbW9udGg6IGRNaW5UaW1lID49IHRoaXMubWluVGltZSAmJiBkTWF4VGltZSA8PSB0aGlzLm1heFRpbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgeWVhcjogZC55ZWFyID49IG1pbi55ZWFyICYmIGQueWVhciA8PSBtYXgueWVhclxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIHR5cGUgPyB0eXBlc1t0eXBlXSA6IHR5cGVzLmRheVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9nZXREaW1lbnNpb25zOiBmdW5jdGlvbiAoJGVsKSB7XHJcbiAgICAgICAgICAgIHZhciBvZmZzZXQgPSAkZWwub2Zmc2V0KCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgd2lkdGg6ICRlbC5vdXRlcldpZHRoKCksXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICRlbC5vdXRlckhlaWdodCgpLFxyXG4gICAgICAgICAgICAgICAgbGVmdDogb2Zmc2V0LmxlZnQsXHJcbiAgICAgICAgICAgICAgICB0b3A6IG9mZnNldC50b3BcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9nZXREYXRlRnJvbUNlbGw6IGZ1bmN0aW9uIChjZWxsKSB7XHJcbiAgICAgICAgICAgIHZhciBjdXJEYXRlID0gdGhpcy5wYXJzZWREYXRlLFxyXG4gICAgICAgICAgICAgICAgeWVhciA9IGNlbGwuZGF0YSgneWVhcicpIHx8IGN1ckRhdGUueWVhcixcclxuICAgICAgICAgICAgICAgIG1vbnRoID0gY2VsbC5kYXRhKCdtb250aCcpID09IHVuZGVmaW5lZCA/IGN1ckRhdGUubW9udGggOiBjZWxsLmRhdGEoJ21vbnRoJyksXHJcbiAgICAgICAgICAgICAgICBkYXRlID0gY2VsbC5kYXRhKCdkYXRlJykgfHwgMTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgZGF0ZSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX3NldFBvc2l0aW9uQ2xhc3NlczogZnVuY3Rpb24gKHBvcykge1xyXG4gICAgICAgICAgICBwb3MgPSBwb3Muc3BsaXQoJyAnKTtcclxuICAgICAgICAgICAgdmFyIG1haW4gPSBwb3NbMF0sXHJcbiAgICAgICAgICAgICAgICBzZWMgPSBwb3NbMV0sXHJcbiAgICAgICAgICAgICAgICBjbGFzc2VzID0gJ2RhdGVwaWNrZXIgLScgKyBtYWluICsgJy0nICsgc2VjICsgJy0gLWZyb20tJyArIG1haW4gKyAnLSc7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy52aXNpYmxlKSBjbGFzc2VzICs9ICcgYWN0aXZlJztcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXJcclxuICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdjbGFzcycpXHJcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoY2xhc3Nlcyk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2V0UG9zaXRpb246IGZ1bmN0aW9uIChwb3NpdGlvbikge1xyXG4gICAgICAgICAgICBwb3NpdGlvbiA9IHBvc2l0aW9uIHx8IHRoaXMub3B0cy5wb3NpdGlvbjtcclxuXHJcbiAgICAgICAgICAgIHZhciBkaW1zID0gdGhpcy5fZ2V0RGltZW5zaW9ucyh0aGlzLiRlbCksXHJcbiAgICAgICAgICAgICAgICBzZWxmRGltcyA9IHRoaXMuX2dldERpbWVuc2lvbnModGhpcy4kZGF0ZXBpY2tlciksXHJcbiAgICAgICAgICAgICAgICBwb3MgPSBwb3NpdGlvbi5zcGxpdCgnICcpLFxyXG4gICAgICAgICAgICAgICAgdG9wLCBsZWZ0LFxyXG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gdGhpcy5vcHRzLm9mZnNldCxcclxuICAgICAgICAgICAgICAgIG1haW4gPSBwb3NbMF0sXHJcbiAgICAgICAgICAgICAgICBzZWNvbmRhcnkgPSBwb3NbMV07XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2ggKG1haW4pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XHJcbiAgICAgICAgICAgICAgICAgICAgdG9wID0gZGltcy50b3AgLSBzZWxmRGltcy5oZWlnaHQgLSBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgICAgICAgICAgICAgbGVmdCA9IGRpbXMubGVmdCArIGRpbXMud2lkdGggKyBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdib3R0b20nOlxyXG4gICAgICAgICAgICAgICAgICAgIHRvcCA9IGRpbXMudG9wICsgZGltcy5oZWlnaHQgKyBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gZGltcy5sZWZ0IC0gc2VsZkRpbXMud2lkdGggLSBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHN3aXRjaChzZWNvbmRhcnkpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XHJcbiAgICAgICAgICAgICAgICAgICAgdG9wID0gZGltcy50b3A7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgICAgICAgICAgICAgbGVmdCA9IGRpbXMubGVmdCArIGRpbXMud2lkdGggLSBzZWxmRGltcy53aWR0aDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XHJcbiAgICAgICAgICAgICAgICAgICAgdG9wID0gZGltcy50b3AgKyBkaW1zLmhlaWdodCAtIHNlbGZEaW1zLmhlaWdodDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgICAgICAgICAgICAgIGxlZnQgPSBkaW1zLmxlZnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdjZW50ZXInOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgvbGVmdHxyaWdodC8udGVzdChtYWluKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3AgPSBkaW1zLnRvcCArIGRpbXMuaGVpZ2h0LzIgLSBzZWxmRGltcy5oZWlnaHQvMjtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gZGltcy5sZWZ0ICsgZGltcy53aWR0aC8yIC0gc2VsZkRpbXMud2lkdGgvMjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXJcclxuICAgICAgICAgICAgICAgIC5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnQsXHJcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0b3BcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2hvdzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLnNldFBvc2l0aW9uKHRoaXMub3B0cy5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXIuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICB0aGlzLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGhpZGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlclxyXG4gICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxyXG4gICAgICAgICAgICAgICAgLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogJy0xMDAwMDBweCdcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5mb2N1c2VkID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMua2V5cyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pbkZvY3VzID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLiRlbC5ibHVyKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZG93bjogZnVuY3Rpb24gKGRhdGUpIHtcclxuICAgICAgICAgICAgdGhpcy5fY2hhbmdlVmlldyhkYXRlLCAnZG93bicpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHVwOiBmdW5jdGlvbiAoZGF0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9jaGFuZ2VWaWV3KGRhdGUsICd1cCcpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9jaGFuZ2VWaWV3OiBmdW5jdGlvbiAoZGF0ZSwgZGlyKSB7XHJcbiAgICAgICAgICAgIGRhdGUgPSBkYXRlIHx8IHRoaXMuZm9jdXNlZCB8fCB0aGlzLmRhdGU7XHJcblxyXG4gICAgICAgICAgICB2YXIgbmV4dFZpZXcgPSBkaXIgPT0gJ3VwJyA/IHRoaXMudmlld0luZGV4ICsgMSA6IHRoaXMudmlld0luZGV4IC0gMTtcclxuICAgICAgICAgICAgaWYgKG5leHRWaWV3ID4gMikgbmV4dFZpZXcgPSAyO1xyXG4gICAgICAgICAgICBpZiAobmV4dFZpZXcgPCAwKSBuZXh0VmlldyA9IDA7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCAxKTtcclxuICAgICAgICAgICAgdGhpcy5zaWxlbnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy52aWV3ID0gdGhpcy52aWV3SW5kZXhlc1tuZXh0Vmlld107XHJcblxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9oYW5kbGVIb3RLZXk6IGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGUgPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUodGhpcy5fZ2V0Rm9jdXNlZERhdGUoKSksXHJcbiAgICAgICAgICAgICAgICBmb2N1c2VkUGFyc2VkLFxyXG4gICAgICAgICAgICAgICAgbyA9IHRoaXMub3B0cyxcclxuICAgICAgICAgICAgICAgIG5ld0RhdGUsXHJcbiAgICAgICAgICAgICAgICB0b3RhbERheXNJbk5leHRNb250aCxcclxuICAgICAgICAgICAgICAgIG1vbnRoQ2hhbmdlZCA9IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgeWVhckNoYW5nZWQgPSBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGRlY2FkZUNoYW5nZWQgPSBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHkgPSBkYXRlLnllYXIsXHJcbiAgICAgICAgICAgICAgICBtID0gZGF0ZS5tb250aCxcclxuICAgICAgICAgICAgICAgIGQgPSBkYXRlLmRhdGU7XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2ggKGtleSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnY3RybFJpZ2h0JzpcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2N0cmxVcCc6XHJcbiAgICAgICAgICAgICAgICAgICAgbSArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vbnRoQ2hhbmdlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdjdHJsTGVmdCc6XHJcbiAgICAgICAgICAgICAgICBjYXNlICdjdHJsRG93bic6XHJcbiAgICAgICAgICAgICAgICAgICAgbSAtPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vbnRoQ2hhbmdlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdzaGlmdFJpZ2h0JzpcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3NoaWZ0VXAnOlxyXG4gICAgICAgICAgICAgICAgICAgIHllYXJDaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB5ICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdzaGlmdExlZnQnOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAnc2hpZnREb3duJzpcclxuICAgICAgICAgICAgICAgICAgICB5ZWFyQ2hhbmdlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgeSAtPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnYWx0UmlnaHQnOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAnYWx0VXAnOlxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2FkZUNoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHkgKz0gMTA7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdhbHRMZWZ0JzpcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2FsdERvd24nOlxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2FkZUNoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHkgLT0gMTA7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdjdHJsU2hpZnRVcCc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0b3RhbERheXNJbk5leHRNb250aCA9IGRhdGVwaWNrZXIuZ2V0RGF5c0NvdW50KG5ldyBEYXRlKHksbSkpO1xyXG4gICAgICAgICAgICBuZXdEYXRlID0gbmV3IERhdGUoeSxtLGQpO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgbmV4dCBtb250aCBoYXMgbGVzcyBkYXlzIHRoYW4gY3VycmVudCwgc2V0IGRhdGUgdG8gdG90YWwgZGF5cyBpbiB0aGF0IG1vbnRoXHJcbiAgICAgICAgICAgIGlmICh0b3RhbERheXNJbk5leHRNb250aCA8IGQpIGQgPSB0b3RhbERheXNJbk5leHRNb250aDtcclxuXHJcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIG5ld0RhdGUgaXMgaW4gdmFsaWQgcmFuZ2VcclxuICAgICAgICAgICAgaWYgKG5ld0RhdGUuZ2V0VGltZSgpIDwgdGhpcy5taW5UaW1lKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdEYXRlID0gdGhpcy5taW5EYXRlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0RhdGUuZ2V0VGltZSgpID4gdGhpcy5tYXhUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdEYXRlID0gdGhpcy5tYXhEYXRlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmZvY3VzZWQgPSBuZXdEYXRlO1xyXG5cclxuICAgICAgICAgICAgZm9jdXNlZFBhcnNlZCA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZShuZXdEYXRlKTtcclxuICAgICAgICAgICAgaWYgKG1vbnRoQ2hhbmdlZCAmJiBvLm9uQ2hhbmdlTW9udGgpIHtcclxuICAgICAgICAgICAgICAgIG8ub25DaGFuZ2VNb250aChmb2N1c2VkUGFyc2VkLm1vbnRoLCBmb2N1c2VkUGFyc2VkLnllYXIpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHllYXJDaGFuZ2VkICYmIG8ub25DaGFuZ2VZZWFyKSB7XHJcbiAgICAgICAgICAgICAgICBvLm9uQ2hhbmdlWWVhcihmb2N1c2VkUGFyc2VkLnllYXIpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRlY2FkZUNoYW5nZWQgJiYgby5vbkNoYW5nZURlY2FkZSkge1xyXG4gICAgICAgICAgICAgICAgby5vbkNoYW5nZURlY2FkZSh0aGlzLmN1ckRlY2FkZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9yZWdpc3RlcktleTogZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgICB2YXIgZXhpc3RzID0gdGhpcy5rZXlzLnNvbWUoZnVuY3Rpb24gKGN1cktleSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cktleSA9PSBrZXk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFleGlzdHMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMua2V5cy5wdXNoKGtleSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF91blJlZ2lzdGVyS2V5OiBmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMua2V5cy5pbmRleE9mKGtleSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmtleXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfaXNIb3RLZXlQcmVzc2VkOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBjdXJyZW50SG90S2V5LFxyXG4gICAgICAgICAgICAgICAgZm91bmQgPSBmYWxzZSxcclxuICAgICAgICAgICAgICAgIF90aGlzID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIHByZXNzZWRLZXlzID0gdGhpcy5rZXlzLnNvcnQoKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGhvdEtleSBpbiBob3RLZXlzKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50SG90S2V5ID0gaG90S2V5c1tob3RLZXldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHByZXNzZWRLZXlzLmxlbmd0aCAhPSBjdXJyZW50SG90S2V5Lmxlbmd0aCkgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRIb3RLZXkuZXZlcnkoZnVuY3Rpb24gKGtleSwgaSkgeyByZXR1cm4ga2V5ID09IHByZXNzZWRLZXlzW2ldfSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5fdHJpZ2dlcignaG90S2V5JywgaG90S2V5KTtcclxuICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmb3VuZDtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfdHJpZ2dlcjogZnVuY3Rpb24gKGV2ZW50LCBhcmdzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLnRyaWdnZXIoZXZlbnQsIGFyZ3MpXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2ZvY3VzTmV4dENlbGw6IGZ1bmN0aW9uIChrZXlDb2RlLCB0eXBlKSB7XHJcbiAgICAgICAgICAgIHR5cGUgPSB0eXBlIHx8IHRoaXMuY2VsbFR5cGU7XHJcblxyXG4gICAgICAgICAgICB2YXIgZGF0ZSA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZSh0aGlzLl9nZXRGb2N1c2VkRGF0ZSgpKSxcclxuICAgICAgICAgICAgICAgIHkgPSBkYXRlLnllYXIsXHJcbiAgICAgICAgICAgICAgICBtID0gZGF0ZS5tb250aCxcclxuICAgICAgICAgICAgICAgIGQgPSBkYXRlLmRhdGU7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5faXNIb3RLZXlQcmVzc2VkKCkpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2goa2V5Q29kZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzNzogLy8gbGVmdFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ2RheScgPyAoZCAtPSAxKSA6ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ21vbnRoJyA/IChtIC09IDEpIDogJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAneWVhcicgPyAoeSAtPSAxKSA6ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzODogLy8gdXBcclxuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICdkYXknID8gKGQgLT0gNykgOiAnJztcclxuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICdtb250aCcgPyAobSAtPSAzKSA6ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ3llYXInID8gKHkgLT0gNCkgOiAnJztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMzk6IC8vIHJpZ2h0XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAnZGF5JyA/IChkICs9IDEpIDogJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAnbW9udGgnID8gKG0gKz0gMSkgOiAnJztcclxuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICd5ZWFyJyA/ICh5ICs9IDEpIDogJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQwOiAvLyBkb3duXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAnZGF5JyA/IChkICs9IDcpIDogJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAnbW9udGgnID8gKG0gKz0gMykgOiAnJztcclxuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICd5ZWFyJyA/ICh5ICs9IDQpIDogJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBuZCA9IG5ldyBEYXRlKHksbSxkKTtcclxuICAgICAgICAgICAgaWYgKG5kLmdldFRpbWUoKSA8IHRoaXMubWluVGltZSkge1xyXG4gICAgICAgICAgICAgICAgbmQgPSB0aGlzLm1pbkRhdGU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmQuZ2V0VGltZSgpID4gdGhpcy5tYXhUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICBuZCA9IHRoaXMubWF4RGF0ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5mb2N1c2VkID0gbmQ7XHJcblxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9nZXRGb2N1c2VkRGF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgZm9jdXNlZCAgPSB0aGlzLmZvY3VzZWQgfHwgdGhpcy5zZWxlY3RlZERhdGVzW3RoaXMuc2VsZWN0ZWREYXRlcy5sZW5ndGggLSAxXSxcclxuICAgICAgICAgICAgICAgIGQgPSB0aGlzLnBhcnNlZERhdGU7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWZvY3VzZWQpIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy52aWV3KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZGF5cyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzZWQgPSBuZXcgRGF0ZShkLnllYXIsIGQubW9udGgsIG5ldyBEYXRlKCkuZ2V0RGF0ZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbW9udGhzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXNlZCA9IG5ldyBEYXRlKGQueWVhciwgZC5tb250aCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3llYXJzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXNlZCA9IG5ldyBEYXRlKGQueWVhciwgMCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZm9jdXNlZDtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfZ2V0Q2VsbDogZnVuY3Rpb24gKGRhdGUsIHR5cGUpIHtcclxuICAgICAgICAgICAgdHlwZSA9IHR5cGUgfHwgdGhpcy5jZWxsVHlwZTtcclxuXHJcbiAgICAgICAgICAgIHZhciBkID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKGRhdGUpLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0b3IgPSAnLmRhdGVwaWNrZXItLWNlbGxbZGF0YS15ZWFyPVwiJyArIGQueWVhciArICdcIl0nLFxyXG4gICAgICAgICAgICAgICAgJGNlbGw7XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ21vbnRoJzpcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RvciA9ICdbZGF0YS1tb250aD1cIicgKyBkLm1vbnRoICsgJ1wiXSc7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdkYXknOlxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yICs9ICdbZGF0YS1tb250aD1cIicgKyBkLm1vbnRoICsgJ1wiXVtkYXRhLWRhdGU9XCInICsgZC5kYXRlICsgJ1wiXSc7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgJGNlbGwgPSB0aGlzLnZpZXdzW3RoaXMuY3VycmVudFZpZXddLiRlbC5maW5kKHNlbGVjdG9yKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAkY2VsbC5sZW5ndGggPyAkY2VsbCA6ICcnO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICAgICAgX3RoaXMuJGVsXHJcbiAgICAgICAgICAgICAgICAub2ZmKCcuYWRwJylcclxuICAgICAgICAgICAgICAgIC5kYXRhKCdkYXRlcGlja2VyJywgJycpO1xyXG5cclxuICAgICAgICAgICAgX3RoaXMuc2VsZWN0ZWREYXRlcyA9IFtdO1xyXG4gICAgICAgICAgICBfdGhpcy5mb2N1c2VkID0gJyc7XHJcbiAgICAgICAgICAgIF90aGlzLnZpZXdzID0ge307XHJcbiAgICAgICAgICAgIF90aGlzLmtleXMgPSBbXTtcclxuICAgICAgICAgICAgX3RoaXMubWluUmFuZ2UgPSAnJztcclxuICAgICAgICAgICAgX3RoaXMubWF4UmFuZ2UgPSAnJztcclxuXHJcbiAgICAgICAgICAgIGlmIChfdGhpcy5vcHRzLmlubGluZSB8fCAhX3RoaXMuZWxJc0lucHV0KSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy4kZGF0ZXBpY2tlci5jbG9zZXN0KCcuZGF0ZXBpY2tlci1pbmxpbmUnKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLiRkYXRlcGlja2VyLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX29uU2hvd0V2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy52aXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9vbkJsdXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmluRm9jdXMgJiYgdGhpcy52aXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9vbk1vdXNlRG93bkRhdGVwaWNrZXI6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5Gb2N1cyA9IHRydWU7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX29uTW91c2VVcERhdGVwaWNrZXI6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5Gb2N1cyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLiRlbC5mb2N1cygpXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX29uSW5wdXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHZhbCA9IHRoaXMuJGVsLnZhbCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCF2YWwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXIoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9vblJlc2l6ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy52aXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFBvc2l0aW9uKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfb25LZXlEb3duOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB2YXIgY29kZSA9IGUud2hpY2g7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlZ2lzdGVyS2V5KGNvZGUpO1xyXG5cclxuICAgICAgICAgICAgLy8gQXJyb3dzXHJcbiAgICAgICAgICAgIGlmIChjb2RlID49IDM3ICYmIGNvZGUgPD0gNDApIHtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2ZvY3VzTmV4dENlbGwoY29kZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEVudGVyXHJcbiAgICAgICAgICAgIGlmIChjb2RlID09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5mb2N1c2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2dldENlbGwodGhpcy5mb2N1c2VkKS5oYXNDbGFzcygnLWRpc2FibGVkLScpKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudmlldyAhPSB0aGlzLm9wdHMubWluVmlldykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRvd24oKVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhbHJlYWR5U2VsZWN0ZWQgPSB0aGlzLl9pc1NlbGVjdGVkKHRoaXMuZm9jdXNlZCwgdGhpcy5jZWxsVHlwZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWFscmVhZHlTZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3REYXRlKHRoaXMuZm9jdXNlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYWxyZWFkeVNlbGVjdGVkICYmIHRoaXMub3B0cy50b2dnbGVTZWxlY3RlZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZURhdGUodGhpcy5mb2N1c2VkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRXNjXHJcbiAgICAgICAgICAgIGlmIChjb2RlID09IDI3KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9vbktleVVwOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB2YXIgY29kZSA9IGUud2hpY2g7XHJcbiAgICAgICAgICAgIHRoaXMuX3VuUmVnaXN0ZXJLZXkoY29kZSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX29uSG90S2V5OiBmdW5jdGlvbiAoZSwgaG90S2V5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZUhvdEtleShob3RLZXkpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9vbk1vdXNlRW50ZXJDZWxsOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB2YXIgJGNlbGwgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcuZGF0ZXBpY2tlci0tY2VsbCcpLFxyXG4gICAgICAgICAgICAgICAgZGF0ZSA9IHRoaXMuX2dldERhdGVGcm9tQ2VsbCgkY2VsbCk7XHJcblxyXG4gICAgICAgICAgICAvLyBQcmV2ZW50IGZyb20gdW5uZWNlc3NhcnkgcmVuZGVyaW5nIGFuZCBzZXR0aW5nIG5ldyBjdXJyZW50RGF0ZVxyXG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5mb2N1c2VkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZvY3VzZWQgPSAnJ1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAkY2VsbC5hZGRDbGFzcygnLWZvY3VzLScpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5mb2N1c2VkID0gZGF0ZTtcclxuICAgICAgICAgICAgdGhpcy5zaWxlbnQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMucmFuZ2UgJiYgdGhpcy5zZWxlY3RlZERhdGVzLmxlbmd0aCA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1pblJhbmdlID0gdGhpcy5zZWxlY3RlZERhdGVzWzBdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXhSYW5nZSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGVwaWNrZXIubGVzcyh0aGlzLm1pblJhbmdlLCB0aGlzLmZvY3VzZWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXhSYW5nZSA9IHRoaXMubWluUmFuZ2U7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5taW5SYW5nZSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy52aWV3c1t0aGlzLmN1cnJlbnRWaWV3XS5fdXBkYXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfb25Nb3VzZUxlYXZlQ2VsbDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdmFyICRjZWxsID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLmRhdGVwaWNrZXItLWNlbGwnKTtcclxuXHJcbiAgICAgICAgICAgICRjZWxsLnJlbW92ZUNsYXNzKCctZm9jdXMtJyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuZm9jdXNlZCA9ICcnO1xyXG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IGZhbHNlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNldCBmb2N1c2VkKHZhbCkge1xyXG4gICAgICAgICAgICBpZiAoIXZhbCAmJiB0aGlzLmZvY3VzZWQpIHtcclxuICAgICAgICAgICAgICAgIHZhciAkY2VsbCA9IHRoaXMuX2dldENlbGwodGhpcy5mb2N1c2VkKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoJGNlbGwubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGNlbGwucmVtb3ZlQ2xhc3MoJy1mb2N1cy0nKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2ZvY3VzZWQgPSB2YWw7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMucmFuZ2UgJiYgdGhpcy5zZWxlY3RlZERhdGVzLmxlbmd0aCA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1pblJhbmdlID0gdGhpcy5zZWxlY3RlZERhdGVzWzBdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXhSYW5nZSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGVwaWNrZXIubGVzcyh0aGlzLm1pblJhbmdlLCB0aGlzLl9mb2N1c2VkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWF4UmFuZ2UgPSB0aGlzLm1pblJhbmdlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWluUmFuZ2UgPSAnJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5zaWxlbnQpIHJldHVybjtcclxuICAgICAgICAgICAgdGhpcy5kYXRlID0gdmFsO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGdldCBmb2N1c2VkKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZm9jdXNlZDtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBnZXQgcGFyc2VkRGF0ZSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZSh0aGlzLmRhdGUpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNldCBkYXRlICh2YWwpIHtcclxuICAgICAgICAgICAgaWYgKCEodmFsIGluc3RhbmNlb2YgRGF0ZSkpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudERhdGUgPSB2YWw7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5pbml0ZWQgJiYgIXRoaXMuc2lsZW50KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdzW3RoaXMudmlld10uX3JlbmRlcigpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uYXYuX3JlbmRlcigpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudmlzaWJsZSAmJiB0aGlzLmVsSXNJbnB1dCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb24oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdmFsO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGdldCBkYXRlICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudERhdGVcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzZXQgdmlldyAodmFsKSB7XHJcbiAgICAgICAgICAgIHRoaXMudmlld0luZGV4ID0gdGhpcy52aWV3SW5kZXhlcy5pbmRleE9mKHZhbCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy52aWV3SW5kZXggPCAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMucHJldlZpZXcgPSB0aGlzLmN1cnJlbnRWaWV3O1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gdmFsO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuaW5pdGVkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMudmlld3NbdmFsXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlld3NbdmFsXSA9IG5ldyBEYXRlcGlja2VyLkJvZHkodGhpcywgdmFsLCB0aGlzLm9wdHMpXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlld3NbdmFsXS5fcmVuZGVyKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy52aWV3c1t0aGlzLnByZXZWaWV3XS5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdzW3ZhbF0uc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uYXYuX3JlbmRlcigpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdHMub25DaGFuZ2VWaWV3KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRzLm9uQ2hhbmdlVmlldyh2YWwpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5lbElzSW5wdXQgJiYgdGhpcy52aXNpYmxlKSB0aGlzLnNldFBvc2l0aW9uKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB2YWxcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBnZXQgdmlldygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFZpZXc7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZ2V0IGNlbGxUeXBlKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy52aWV3LnN1YnN0cmluZygwLCB0aGlzLnZpZXcubGVuZ3RoIC0gMSlcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBnZXQgbWluVGltZSgpIHtcclxuICAgICAgICAgICAgdmFyIG1pbiA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZSh0aGlzLm1pbkRhdGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUobWluLnllYXIsIG1pbi5tb250aCwgbWluLmRhdGUpLmdldFRpbWUoKVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGdldCBtYXhUaW1lKCkge1xyXG4gICAgICAgICAgICB2YXIgbWF4ID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKHRoaXMubWF4RGF0ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZShtYXgueWVhciwgbWF4Lm1vbnRoLCBtYXguZGF0ZSkuZ2V0VGltZSgpXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZ2V0IGN1ckRlY2FkZSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGRhdGVwaWNrZXIuZ2V0RGVjYWRlKHRoaXMuZGF0ZSlcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vICBVdGlsc1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGRhdGVwaWNrZXIuZ2V0RGF5c0NvdW50ID0gZnVuY3Rpb24gKGRhdGUpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCkgKyAxLCAwKS5nZXREYXRlKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZSA9IGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgeWVhcjogZGF0ZS5nZXRGdWxsWWVhcigpLFxyXG4gICAgICAgICAgICBtb250aDogZGF0ZS5nZXRNb250aCgpLFxyXG4gICAgICAgICAgICBmdWxsTW9udGg6IChkYXRlLmdldE1vbnRoKCkgKyAxKSA8IDEwID8gJzAnICsgKGRhdGUuZ2V0TW9udGgoKSArIDEpIDogZGF0ZS5nZXRNb250aCgpICsgMSwgLy8gT25lIGJhc2VkXHJcbiAgICAgICAgICAgIGRhdGU6IGRhdGUuZ2V0RGF0ZSgpLFxyXG4gICAgICAgICAgICBmdWxsRGF0ZTogZGF0ZS5nZXREYXRlKCkgPCAxMCA/ICcwJyArIGRhdGUuZ2V0RGF0ZSgpIDogZGF0ZS5nZXREYXRlKCksXHJcbiAgICAgICAgICAgIGRheTogZGF0ZS5nZXREYXkoKVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgZGF0ZXBpY2tlci5nZXREZWNhZGUgPSBmdW5jdGlvbiAoZGF0ZSkge1xyXG4gICAgICAgIHZhciBmaXJzdFllYXIgPSBNYXRoLmZsb29yKGRhdGUuZ2V0RnVsbFllYXIoKSAvIDEwKSAqIDEwO1xyXG5cclxuICAgICAgICByZXR1cm4gW2ZpcnN0WWVhciwgZmlyc3RZZWFyICsgOV07XHJcbiAgICB9O1xyXG5cclxuICAgIGRhdGVwaWNrZXIudGVtcGxhdGUgPSBmdW5jdGlvbiAoc3RyLCBkYXRhKSB7XHJcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8jXFx7KFtcXHddKylcXH0vZywgZnVuY3Rpb24gKHNvdXJjZSwgbWF0Y2gpIHtcclxuICAgICAgICAgICAgaWYgKGRhdGFbbWF0Y2hdIHx8IGRhdGFbbWF0Y2hdID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0YVttYXRjaF1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBkYXRlcGlja2VyLmlzU2FtZSA9IGZ1bmN0aW9uIChkYXRlMSwgZGF0ZTIsIHR5cGUpIHtcclxuICAgICAgICBpZiAoIWRhdGUxIHx8ICFkYXRlMikgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIHZhciBkMSA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZShkYXRlMSksXHJcbiAgICAgICAgICAgIGQyID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKGRhdGUyKSxcclxuICAgICAgICAgICAgX3R5cGUgPSB0eXBlID8gdHlwZSA6ICdkYXknLFxyXG5cclxuICAgICAgICAgICAgY29uZGl0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgIGRheTogZDEuZGF0ZSA9PSBkMi5kYXRlICYmIGQxLm1vbnRoID09IGQyLm1vbnRoICYmIGQxLnllYXIgPT0gZDIueWVhcixcclxuICAgICAgICAgICAgICAgIG1vbnRoOiBkMS5tb250aCA9PSBkMi5tb250aCAmJiBkMS55ZWFyID09IGQyLnllYXIsXHJcbiAgICAgICAgICAgICAgICB5ZWFyOiBkMS55ZWFyID09IGQyLnllYXJcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNvbmRpdGlvbnNbX3R5cGVdO1xyXG4gICAgfTtcclxuXHJcbiAgICBkYXRlcGlja2VyLmxlc3MgPSBmdW5jdGlvbiAoZGF0ZUNvbXBhcmVUbywgZGF0ZSwgdHlwZSkge1xyXG4gICAgICAgIGlmICghZGF0ZUNvbXBhcmVUbyB8fCAhZGF0ZSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIHJldHVybiBkYXRlLmdldFRpbWUoKSA8IGRhdGVDb21wYXJlVG8uZ2V0VGltZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICBkYXRlcGlja2VyLmJpZ2dlciA9IGZ1bmN0aW9uIChkYXRlQ29tcGFyZVRvLCBkYXRlLCB0eXBlKSB7XHJcbiAgICAgICAgaWYgKCFkYXRlQ29tcGFyZVRvIHx8ICFkYXRlKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIGRhdGUuZ2V0VGltZSgpID4gZGF0ZUNvbXBhcmVUby5nZXRUaW1lKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIERhdGVwaWNrZXIubGFuZ3VhZ2UgPSB7XHJcbiAgICAgICAgcnU6IHtcclxuICAgICAgICAgICAgZGF5czogWyfQktC+0YHQutGA0LXRgdC10L3RjNC1JywgJ9Cf0L7QvdC10LTQtdC70YzQvdC40LonLCAn0JLRgtC+0YDQvdC40LonLCAn0KHRgNC10LTQsCcsICfQp9C10YLQstC10YDQsycsICfQn9GP0YLQvdC40YbQsCcsICfQodGD0LHQsdC+0YLQsCddLFxyXG4gICAgICAgICAgICBkYXlzU2hvcnQ6IFsn0JLQvtGBJywn0J/QvtC9Jywn0JLRgtC+Jywn0KHRgNC1Jywn0KfQtdGCJywn0J/Rj9GCJywn0KHRg9CxJ10sXHJcbiAgICAgICAgICAgIGRheXNNaW46IFsn0JLRgScsJ9Cf0L0nLCfQktGCJywn0KHRgCcsJ9Cn0YInLCfQn9GCJywn0KHQsSddLFxyXG4gICAgICAgICAgICBtb250aHM6IFsn0K/QvdCy0LDRgNGMJywgJ9Ck0LXQstGA0LDQu9GMJywgJ9Cc0LDRgNGCJywgJ9CQ0L/RgNC10LvRjCcsICfQnNCw0LknLCAn0JjRjtC90YwnLCAn0JjRjtC70YwnLCAn0JDQstCz0YPRgdGCJywgJ9Ch0LXQvdGC0Y/QsdGA0YwnLCAn0J7QutGC0Y/QsdGA0YwnLCAn0J3QvtGP0LHRgNGMJywgJ9CU0LXQutCw0LHRgNGMJ10sXHJcbiAgICAgICAgICAgIG1vbnRoc1Nob3J0OiBbJ9Cv0L3QsicsICfQpNC10LInLCAn0JzQsNGAJywgJ9CQ0L/RgCcsICfQnNCw0LknLCAn0JjRjtC9JywgJ9CY0Y7QuycsICfQkNCy0LMnLCAn0KHQtdC9JywgJ9Ce0LrRgicsICfQndC+0Y8nLCAn0JTQtdC6J10sXHJcbiAgICAgICAgICAgIHRvZGF5OiAn0KHQtdCz0L7QtNC90Y8nLFxyXG4gICAgICAgICAgICBjbGVhcjogJ9Ce0YfQuNGB0YLQuNGC0YwnLFxyXG4gICAgICAgICAgICBkYXRlRm9ybWF0OiAnZGQubW0ueXl5eScsXHJcbiAgICAgICAgICAgIGZpcnN0RGF5OiAxXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAkLmZuW3BsdWdpbk5hbWVdID0gZnVuY3Rpb24gKCBvcHRpb25zICkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoISQuZGF0YSh0aGlzLCBwbHVnaW5OYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgJC5kYXRhKHRoaXMsICBwbHVnaW5OYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlcGlja2VyKCB0aGlzLCBvcHRpb25zICkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFyIF90aGlzID0gJC5kYXRhKHRoaXMsIHBsdWdpbk5hbWUpO1xyXG5cclxuICAgICAgICAgICAgICAgIF90aGlzLm9wdHMgPSAkLmV4dGVuZCh0cnVlLCBfdGhpcy5vcHRzLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIF90aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgICQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICQoYXV0b0luaXRTZWxlY3RvcikuZGF0ZXBpY2tlcigpO1xyXG4gICAgfSlcclxuXHJcbn0pKHdpbmRvdywgalF1ZXJ5KTtcclxuOyhmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgdGVtcGxhdGVzID0ge1xyXG4gICAgICAgIGRheXM6JycgK1xyXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tZGF5cyBkYXRlcGlja2VyLS1ib2R5XCI+JyArXHJcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1kYXlzLW5hbWVzXCI+PC9kaXY+JyArXHJcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1jZWxscyBkYXRlcGlja2VyLS1jZWxscy1kYXlzXCI+PC9kaXY+JyArXHJcbiAgICAgICAgJzwvZGl2PicsXHJcbiAgICAgICAgbW9udGhzOiAnJyArXHJcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1tb250aHMgZGF0ZXBpY2tlci0tYm9keVwiPicgK1xyXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tY2VsbHMgZGF0ZXBpY2tlci0tY2VsbHMtbW9udGhzXCI+PC9kaXY+JyArXHJcbiAgICAgICAgJzwvZGl2PicsXHJcbiAgICAgICAgeWVhcnM6ICcnICtcclxuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLXllYXJzIGRhdGVwaWNrZXItLWJvZHlcIj4nICtcclxuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLWNlbGxzIGRhdGVwaWNrZXItLWNlbGxzLXllYXJzXCI+PC9kaXY+JyArXHJcbiAgICAgICAgJzwvZGl2PidcclxuICAgICAgICB9LFxyXG4gICAgICAgIEQgPSBEYXRlcGlja2VyO1xyXG5cclxuICAgIEQuQm9keSA9IGZ1bmN0aW9uIChkLCB0eXBlLCBvcHRzKSB7XHJcbiAgICAgICAgdGhpcy5kID0gZDtcclxuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xyXG4gICAgICAgIHRoaXMub3B0cyA9IG9wdHM7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfTtcclxuXHJcbiAgICBELkJvZHkucHJvdG90eXBlID0ge1xyXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5fYnVpbGRCYXNlSHRtbCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9yZW5kZXIoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2JpbmRFdmVudHMoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfYmluZEV2ZW50czogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRlbC5vbignY2xpY2snLCAnLmRhdGVwaWNrZXItLWNlbGwnLCAkLnByb3h5KHRoaXMuX29uQ2xpY2tDZWxsLCB0aGlzKSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2J1aWxkQmFzZUh0bWw6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy4kZWwgPSAkKHRlbXBsYXRlc1t0aGlzLnR5cGVdKS5hcHBlbmRUbyh0aGlzLmQuJGNvbnRlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLiRuYW1lcyA9ICQoJy5kYXRlcGlja2VyLS1kYXlzLW5hbWVzJywgdGhpcy4kZWwpO1xyXG4gICAgICAgICAgICB0aGlzLiRjZWxscyA9ICQoJy5kYXRlcGlja2VyLS1jZWxscycsIHRoaXMuJGVsKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfZ2V0RGF5TmFtZXNIdG1sOiBmdW5jdGlvbiAoZmlyc3REYXksIGN1ckRheSwgaHRtbCwgaSkge1xyXG4gICAgICAgICAgICBjdXJEYXkgPSBjdXJEYXkgIT0gdW5kZWZpbmVkID8gY3VyRGF5IDogZmlyc3REYXk7XHJcbiAgICAgICAgICAgIGh0bWwgPSBodG1sID8gaHRtbCA6ICcnO1xyXG4gICAgICAgICAgICBpID0gaSAhPSB1bmRlZmluZWQgPyBpIDogMDtcclxuXHJcbiAgICAgICAgICAgIGlmIChpID4gNykgcmV0dXJuIGh0bWw7XHJcbiAgICAgICAgICAgIGlmIChjdXJEYXkgPT0gNykgcmV0dXJuIHRoaXMuX2dldERheU5hbWVzSHRtbChmaXJzdERheSwgMCwgaHRtbCwgKytpKTtcclxuXHJcbiAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1kYXktbmFtZScgKyAodGhpcy5kLmlzV2Vla2VuZChjdXJEYXkpID8gXCIgLXdlZWtlbmQtXCIgOiBcIlwiKSArICdcIj4nICsgdGhpcy5kLmxvYy5kYXlzTWluW2N1ckRheV0gKyAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXREYXlOYW1lc0h0bWwoZmlyc3REYXksICsrY3VyRGF5LCBodG1sLCArK2kpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9nZXRDZWxsQ29udGVudHM6IGZ1bmN0aW9uIChkYXRlLCB0eXBlKSB7XHJcbiAgICAgICAgICAgIHZhciBjbGFzc2VzID0gXCJkYXRlcGlja2VyLS1jZWxsIGRhdGVwaWNrZXItLWNlbGwtXCIgKyB0eXBlLFxyXG4gICAgICAgICAgICAgICAgY3VycmVudERhdGUgPSBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgICAgICAgcGFyZW50ID0gdGhpcy5kLFxyXG4gICAgICAgICAgICAgICAgb3B0cyA9IHBhcmVudC5vcHRzLFxyXG4gICAgICAgICAgICAgICAgZCA9IEQuZ2V0UGFyc2VkRGF0ZShkYXRlKSxcclxuICAgICAgICAgICAgICAgIHJlbmRlciA9IHt9LFxyXG4gICAgICAgICAgICAgICAgaHRtbCA9IGQuZGF0ZTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvcHRzLm9uUmVuZGVyQ2VsbCkge1xyXG4gICAgICAgICAgICAgICAgcmVuZGVyID0gb3B0cy5vblJlbmRlckNlbGwoZGF0ZSwgdHlwZSkgfHwge307XHJcbiAgICAgICAgICAgICAgICBodG1sID0gcmVuZGVyLmh0bWwgPyByZW5kZXIuaHRtbCA6IGh0bWw7XHJcbiAgICAgICAgICAgICAgICBjbGFzc2VzICs9IHJlbmRlci5jbGFzc2VzID8gJyAnICsgcmVuZGVyLmNsYXNzZXMgOiAnJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdkYXknOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJlbnQuaXNXZWVrZW5kKGQuZGF5KSkgY2xhc3NlcyArPSBcIiAtd2Vla2VuZC1cIjtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZC5tb250aCAhPSB0aGlzLmQucGFyc2VkRGF0ZS5tb250aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzICs9IFwiIC1vdGhlci1tb250aC1cIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFvcHRzLnNlbGVjdE90aGVyTW9udGhzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzICs9IFwiIC1kaXNhYmxlZC1cIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW9wdHMuc2hvd090aGVyTW9udGhzKSBodG1sID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbW9udGgnOlxyXG4gICAgICAgICAgICAgICAgICAgIGh0bWwgPSBwYXJlbnQubG9jW3BhcmVudC5vcHRzLm1vbnRoc0ZpZWxkXVtkLm1vbnRoXTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3llYXInOlxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkZWNhZGUgPSBwYXJlbnQuY3VyRGVjYWRlO1xyXG4gICAgICAgICAgICAgICAgICAgIGh0bWwgPSBkLnllYXI7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGQueWVhciA8IGRlY2FkZVswXSB8fCBkLnllYXIgPiBkZWNhZGVbMV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NlcyArPSAnIC1vdGhlci1kZWNhZGUtJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFvcHRzLnNlbGVjdE90aGVyWWVhcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gXCIgLWRpc2FibGVkLVwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghb3B0cy5zaG93T3RoZXJZZWFycykgaHRtbCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKG9wdHMub25SZW5kZXJDZWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZW5kZXIgPSBvcHRzLm9uUmVuZGVyQ2VsbChkYXRlLCB0eXBlKSB8fCB7fTtcclxuICAgICAgICAgICAgICAgIGh0bWwgPSByZW5kZXIuaHRtbCA/IHJlbmRlci5odG1sIDogaHRtbDtcclxuICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gcmVuZGVyLmNsYXNzZXMgPyAnICcgKyByZW5kZXIuY2xhc3NlcyA6ICcnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAob3B0cy5yYW5nZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKEQuaXNTYW1lKHBhcmVudC5taW5SYW5nZSwgZGF0ZSwgdHlwZSkpIGNsYXNzZXMgKz0gJyAtcmFuZ2UtZnJvbS0nO1xyXG4gICAgICAgICAgICAgICAgaWYgKEQuaXNTYW1lKHBhcmVudC5tYXhSYW5nZSwgZGF0ZSwgdHlwZSkpIGNsYXNzZXMgKz0gJyAtcmFuZ2UtdG8tJztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocGFyZW50LnNlbGVjdGVkRGF0ZXMubGVuZ3RoID09IDEgJiYgcGFyZW50LmZvY3VzZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChELmJpZ2dlcihwYXJlbnQubWluUmFuZ2UsIGRhdGUpICYmIEQubGVzcyhwYXJlbnQuZm9jdXNlZCwgZGF0ZSkpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChELmxlc3MocGFyZW50Lm1heFJhbmdlLCBkYXRlKSAmJiBELmJpZ2dlcihwYXJlbnQuZm9jdXNlZCwgZGF0ZSkpKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NlcyArPSAnIC1pbi1yYW5nZS0nXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoRC5sZXNzKHBhcmVudC5tYXhSYW5nZSwgZGF0ZSkgJiYgRC5pc1NhbWUocGFyZW50LmZvY3VzZWQsIGRhdGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gJyAtcmFuZ2UtZnJvbS0nXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChELmJpZ2dlcihwYXJlbnQubWluUmFuZ2UsIGRhdGUpICYmIEQuaXNTYW1lKHBhcmVudC5mb2N1c2VkLCBkYXRlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzICs9ICcgLXJhbmdlLXRvLSdcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJlbnQuc2VsZWN0ZWREYXRlcy5sZW5ndGggPT0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChELmJpZ2dlcihwYXJlbnQubWluUmFuZ2UsIGRhdGUpICYmIEQubGVzcyhwYXJlbnQubWF4UmFuZ2UsIGRhdGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gJyAtaW4tcmFuZ2UtJ1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgIGlmIChELmlzU2FtZShjdXJyZW50RGF0ZSwgZGF0ZSwgdHlwZSkpIGNsYXNzZXMgKz0gJyAtY3VycmVudC0nO1xyXG4gICAgICAgICAgICBpZiAocGFyZW50LmZvY3VzZWQgJiYgRC5pc1NhbWUoZGF0ZSwgcGFyZW50LmZvY3VzZWQsIHR5cGUpKSBjbGFzc2VzICs9ICcgLWZvY3VzLSc7XHJcbiAgICAgICAgICAgIGlmIChwYXJlbnQuX2lzU2VsZWN0ZWQoZGF0ZSwgdHlwZSkpIGNsYXNzZXMgKz0gJyAtc2VsZWN0ZWQtJztcclxuICAgICAgICAgICAgaWYgKCFwYXJlbnQuX2lzSW5SYW5nZShkYXRlLCB0eXBlKSB8fCByZW5kZXIuZGlzYWJsZWQpIGNsYXNzZXMgKz0gJyAtZGlzYWJsZWQtJztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBodG1sOiBodG1sLFxyXG4gICAgICAgICAgICAgICAgY2xhc3NlczogY2xhc3Nlc1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2FsY3VsYXRlcyBkYXlzIG51bWJlciB0byByZW5kZXIuIEdlbmVyYXRlcyBkYXlzIGh0bWwgYW5kIHJldHVybnMgaXQuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGRhdGUgLSBEYXRlIG9iamVjdFxyXG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBfZ2V0RGF5c0h0bWw6IGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgICAgIHZhciB0b3RhbE1vbnRoRGF5cyA9IEQuZ2V0RGF5c0NvdW50KGRhdGUpLFxyXG4gICAgICAgICAgICAgICAgZmlyc3RNb250aERheSA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCAxKS5nZXREYXkoKSxcclxuICAgICAgICAgICAgICAgIGxhc3RNb250aERheSA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCB0b3RhbE1vbnRoRGF5cykuZ2V0RGF5KCksXHJcbiAgICAgICAgICAgICAgICBkYXlzRnJvbVBldk1vbnRoID0gZmlyc3RNb250aERheSAtIHRoaXMuZC5sb2MuZmlyc3REYXksXHJcbiAgICAgICAgICAgICAgICBkYXlzRnJvbU5leHRNb250aCA9IDYgLSBsYXN0TW9udGhEYXkgKyB0aGlzLmQubG9jLmZpcnN0RGF5O1xyXG5cclxuICAgICAgICAgICAgZGF5c0Zyb21QZXZNb250aCA9IGRheXNGcm9tUGV2TW9udGggPCAwID8gZGF5c0Zyb21QZXZNb250aCArIDcgOiBkYXlzRnJvbVBldk1vbnRoO1xyXG4gICAgICAgICAgICBkYXlzRnJvbU5leHRNb250aCA9IGRheXNGcm9tTmV4dE1vbnRoID4gNiA/IGRheXNGcm9tTmV4dE1vbnRoIC0gNyA6IGRheXNGcm9tTmV4dE1vbnRoO1xyXG5cclxuICAgICAgICAgICAgdmFyIHN0YXJ0RGF5SW5kZXggPSAtZGF5c0Zyb21QZXZNb250aCArIDEsXHJcbiAgICAgICAgICAgICAgICBtLCB5LFxyXG4gICAgICAgICAgICAgICAgaHRtbCA9ICcnO1xyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IHN0YXJ0RGF5SW5kZXgsIG1heCA9IHRvdGFsTW9udGhEYXlzICsgZGF5c0Zyb21OZXh0TW9udGg7IGkgPD0gbWF4OyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHkgPSBkYXRlLmdldEZ1bGxZZWFyKCk7XHJcbiAgICAgICAgICAgICAgICBtID0gZGF0ZS5nZXRNb250aCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gdGhpcy5fZ2V0RGF5SHRtbChuZXcgRGF0ZSh5LCBtLCBpKSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGh0bWw7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2dldERheUh0bWw6IGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgICAgdmFyIGNvbnRlbnQgPSB0aGlzLl9nZXRDZWxsQ29udGVudHMoZGF0ZSwgJ2RheScpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiJyArIGNvbnRlbnQuY2xhc3NlcyArICdcIiAnICtcclxuICAgICAgICAgICAgICAgICdkYXRhLWRhdGU9XCInICsgZGF0ZS5nZXREYXRlKCkgKyAnXCIgJyArXHJcbiAgICAgICAgICAgICAgICAnZGF0YS1tb250aD1cIicgKyBkYXRlLmdldE1vbnRoKCkgKyAnXCIgJyArXHJcbiAgICAgICAgICAgICAgICAnZGF0YS15ZWFyPVwiJyArIGRhdGUuZ2V0RnVsbFllYXIoKSArICdcIj4nICsgY29udGVudC5odG1sICsgJzwvZGl2Pic7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR2VuZXJhdGVzIG1vbnRocyBodG1sXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGRhdGUgLSBkYXRlIGluc3RhbmNlXHJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIF9nZXRNb250aHNIdG1sOiBmdW5jdGlvbiAoZGF0ZSkge1xyXG4gICAgICAgICAgICB2YXIgaHRtbCA9ICcnLFxyXG4gICAgICAgICAgICAgICAgZCA9IEQuZ2V0UGFyc2VkRGF0ZShkYXRlKSxcclxuICAgICAgICAgICAgICAgIGkgPSAwO1xyXG5cclxuICAgICAgICAgICAgd2hpbGUoaSA8IDEyKSB7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IHRoaXMuX2dldE1vbnRoSHRtbChuZXcgRGF0ZShkLnllYXIsIGkpKTtcclxuICAgICAgICAgICAgICAgIGkrK1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gaHRtbDtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfZ2V0TW9udGhIdG1sOiBmdW5jdGlvbiAoZGF0ZSkge1xyXG4gICAgICAgICAgICB2YXIgY29udGVudCA9IHRoaXMuX2dldENlbGxDb250ZW50cyhkYXRlLCAnbW9udGgnKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cIicgKyBjb250ZW50LmNsYXNzZXMgKyAnXCIgZGF0YS1tb250aD1cIicgKyBkYXRlLmdldE1vbnRoKCkgKyAnXCI+JyArIGNvbnRlbnQuaHRtbCArICc8L2Rpdj4nXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2dldFllYXJzSHRtbDogZnVuY3Rpb24gKGRhdGUpIHtcclxuICAgICAgICAgICAgdmFyIGQgPSBELmdldFBhcnNlZERhdGUoZGF0ZSksXHJcbiAgICAgICAgICAgICAgICBkZWNhZGUgPSBELmdldERlY2FkZShkYXRlKSxcclxuICAgICAgICAgICAgICAgIGZpcnN0WWVhciA9IGRlY2FkZVswXSAtIDEsXHJcbiAgICAgICAgICAgICAgICBodG1sID0gJycsXHJcbiAgICAgICAgICAgICAgICBpID0gZmlyc3RZZWFyO1xyXG5cclxuICAgICAgICAgICAgZm9yIChpOyBpIDw9IGRlY2FkZVsxXSArIDE7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSB0aGlzLl9nZXRZZWFySHRtbChuZXcgRGF0ZShpICwgMCkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gaHRtbDtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfZ2V0WWVhckh0bWw6IGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gdGhpcy5fZ2V0Q2VsbENvbnRlbnRzKGRhdGUsICd5ZWFyJyk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCInICsgY29udGVudC5jbGFzc2VzICsgJ1wiIGRhdGEteWVhcj1cIicgKyBkYXRlLmdldEZ1bGxZZWFyKCkgKyAnXCI+JyArIGNvbnRlbnQuaHRtbCArICc8L2Rpdj4nXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX3JlbmRlclR5cGVzOiB7XHJcbiAgICAgICAgICAgIGRheXM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkYXlOYW1lcyA9IHRoaXMuX2dldERheU5hbWVzSHRtbCh0aGlzLmQubG9jLmZpcnN0RGF5KSxcclxuICAgICAgICAgICAgICAgICAgICBkYXlzID0gdGhpcy5fZ2V0RGF5c0h0bWwodGhpcy5kLmN1cnJlbnREYXRlKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLiRjZWxscy5odG1sKGRheXMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kbmFtZXMuaHRtbChkYXlOYW1lcylcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbW9udGhzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IHRoaXMuX2dldE1vbnRoc0h0bWwodGhpcy5kLmN1cnJlbnREYXRlKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLiRjZWxscy5odG1sKGh0bWwpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHllYXJzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IHRoaXMuX2dldFllYXJzSHRtbCh0aGlzLmQuY3VycmVudERhdGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuJGNlbGxzLmh0bWwoaHRtbClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9yZW5kZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVuZGVyVHlwZXNbdGhpcy50eXBlXS5iaW5kKHRoaXMpKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX3VwZGF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgJGNlbGxzID0gJCgnLmRhdGVwaWNrZXItLWNlbGwnLCB0aGlzLiRjZWxscyksXHJcbiAgICAgICAgICAgICAgICBfdGhpcyA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBjbGFzc2VzLFxyXG4gICAgICAgICAgICAgICAgJGNlbGwsXHJcbiAgICAgICAgICAgICAgICBkYXRlO1xyXG4gICAgICAgICAgICAkY2VsbHMuZWFjaChmdW5jdGlvbiAoY2VsbCwgaSkge1xyXG4gICAgICAgICAgICAgICAgJGNlbGwgPSAkKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgZGF0ZSA9IF90aGlzLmQuX2dldERhdGVGcm9tQ2VsbCgkKHRoaXMpKTtcclxuICAgICAgICAgICAgICAgIGNsYXNzZXMgPSBfdGhpcy5fZ2V0Q2VsbENvbnRlbnRzKGRhdGUsIF90aGlzLmQuY2VsbFR5cGUpO1xyXG4gICAgICAgICAgICAgICAgJGNlbGwuYXR0cignY2xhc3MnLGNsYXNzZXMuY2xhc3NlcylcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2hvdzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRlbC5hZGRDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIHRoaXMuYWNpdHZlID0gdHJ1ZTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBoaWRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICAvLyAgRXZlbnRzXHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICBfaGFuZGxlQ2xpY2s6IGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICAgICAgICB2YXIgZGF0ZSA9IGVsLmRhdGEoJ2RhdGUnKSB8fCAxLFxyXG4gICAgICAgICAgICAgICAgbW9udGggPSBlbC5kYXRhKCdtb250aCcpIHx8IDAsXHJcbiAgICAgICAgICAgICAgICB5ZWFyID0gZWwuZGF0YSgneWVhcicpIHx8IHRoaXMuZC5wYXJzZWREYXRlLnllYXI7XHJcbiAgICAgICAgICAgIC8vIENoYW5nZSB2aWV3IGlmIG1pbiB2aWV3IGRvZXMgbm90IHJlYWNoIHlldFxyXG4gICAgICAgICAgICBpZiAodGhpcy5kLnZpZXcgIT0gdGhpcy5vcHRzLm1pblZpZXcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZC5kb3duKG5ldyBEYXRlKHllYXIsIG1vbnRoLCBkYXRlKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gU2VsZWN0IGRhdGUgaWYgbWluIHZpZXcgaXMgcmVhY2hlZFxyXG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWREYXRlID0gbmV3IERhdGUoeWVhciwgbW9udGgsIGRhdGUpLFxyXG4gICAgICAgICAgICAgICAgYWxyZWFkeVNlbGVjdGVkID0gdGhpcy5kLl9pc1NlbGVjdGVkKHNlbGVjdGVkRGF0ZSwgdGhpcy5kLmNlbGxUeXBlKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghYWxyZWFkeVNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmQuc2VsZWN0RGF0ZShzZWxlY3RlZERhdGUpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFscmVhZHlTZWxlY3RlZCAmJiB0aGlzLm9wdHMudG9nZ2xlU2VsZWN0ZWQpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kLnJlbW92ZURhdGUoc2VsZWN0ZWREYXRlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfb25DbGlja0NlbGw6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciAkZWwgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcuZGF0ZXBpY2tlci0tY2VsbCcpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCRlbC5oYXNDbGFzcygnLWRpc2FibGVkLScpKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9oYW5kbGVDbGljay5iaW5kKHRoaXMpKCRlbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSkoKTtcclxuXHJcbjsoZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHRlbXBsYXRlID0gJycgK1xyXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tbmF2LWFjdGlvblwiIGRhdGEtYWN0aW9uPVwicHJldlwiPiN7cHJldkh0bWx9PC9kaXY+JyArXHJcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1uYXYtdGl0bGVcIj4je3RpdGxlfTwvZGl2PicgK1xyXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tbmF2LWFjdGlvblwiIGRhdGEtYWN0aW9uPVwibmV4dFwiPiN7bmV4dEh0bWx9PC9kaXY+JyxcclxuICAgICAgICBidXR0b25zQ29udGFpbmVyVGVtcGxhdGUgPSAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLWJ1dHRvbnNcIj48L2Rpdj4nLFxyXG4gICAgICAgIGJ1dHRvbiA9ICc8c3BhbiBjbGFzcz1cImRhdGVwaWNrZXItLWJ1dHRvblwiIGRhdGEtYWN0aW9uPVwiI3thY3Rpb259XCI+I3tsYWJlbH08L3NwYW4+JztcclxuXHJcbiAgICBEYXRlcGlja2VyLk5hdmlnYXRpb24gPSBmdW5jdGlvbiAoZCwgb3B0cykge1xyXG4gICAgICAgIHRoaXMuZCA9IGQ7XHJcbiAgICAgICAgdGhpcy5vcHRzID0gb3B0cztcclxuXHJcbiAgICAgICAgdGhpcy4kYnV0dG9uc0NvbnRhaW5lciA9ICcnO1xyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgIH07XHJcblxyXG4gICAgRGF0ZXBpY2tlci5OYXZpZ2F0aW9uLnByb3RvdHlwZSA9IHtcclxuICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2J1aWxkQmFzZUh0bWwoKTtcclxuICAgICAgICAgICAgdGhpcy5fYmluZEV2ZW50cygpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9iaW5kRXZlbnRzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZC4kbmF2Lm9uKCdjbGljaycsICcuZGF0ZXBpY2tlci0tbmF2LWFjdGlvbicsICQucHJveHkodGhpcy5fb25DbGlja05hdkJ1dHRvbiwgdGhpcykpO1xyXG4gICAgICAgICAgICB0aGlzLmQuJG5hdi5vbignY2xpY2snLCAnLmRhdGVwaWNrZXItLW5hdi10aXRsZScsICQucHJveHkodGhpcy5fb25DbGlja05hdlRpdGxlLCB0aGlzKSk7XHJcbiAgICAgICAgICAgIHRoaXMuZC4kZGF0ZXBpY2tlci5vbignY2xpY2snLCAnLmRhdGVwaWNrZXItLWJ1dHRvbicsICQucHJveHkodGhpcy5fb25DbGlja05hdkJ1dHRvbiwgdGhpcykpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9idWlsZEJhc2VIdG1sOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcigpO1xyXG4gICAgICAgICAgICB0aGlzLl9hZGRCdXR0b25zSWZOZWVkKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2FkZEJ1dHRvbnNJZk5lZWQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy50b2RheUJ1dHRvbikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkQnV0dG9uKCd0b2RheScpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5jbGVhckJ1dHRvbikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkQnV0dG9uKCdjbGVhcicpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfcmVuZGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aXRsZSA9IHRoaXMuX2dldFRpdGxlKHRoaXMuZC5jdXJyZW50RGF0ZSksXHJcbiAgICAgICAgICAgICAgICBodG1sID0gRGF0ZXBpY2tlci50ZW1wbGF0ZSh0ZW1wbGF0ZSwgJC5leHRlbmQoe3RpdGxlOiB0aXRsZX0sIHRoaXMub3B0cykpO1xyXG4gICAgICAgICAgICB0aGlzLmQuJG5hdi5odG1sKGh0bWwpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kLnZpZXcgPT0gJ3llYXJzJykge1xyXG4gICAgICAgICAgICAgICAgJCgnLmRhdGVwaWNrZXItLW5hdi10aXRsZScsIHRoaXMuZC4kbmF2KS5hZGRDbGFzcygnLWRpc2FibGVkLScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuc2V0TmF2U3RhdHVzKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2dldFRpdGxlOiBmdW5jdGlvbiAoZGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kLmZvcm1hdERhdGUodGhpcy5vcHRzLm5hdlRpdGxlc1t0aGlzLmQudmlld10sIGRhdGUpXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2FkZEJ1dHRvbjogZnVuY3Rpb24gKHR5cGUpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLiRidXR0b25zQ29udGFpbmVyLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkQnV0dG9uc0NvbnRhaW5lcigpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IHR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHRoaXMuZC5sb2NbdHlwZV1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBodG1sID0gRGF0ZXBpY2tlci50ZW1wbGF0ZShidXR0b24sIGRhdGEpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCQoJ1tkYXRhLWFjdGlvbj0nICsgdHlwZSArICddJywgdGhpcy4kYnV0dG9uc0NvbnRhaW5lcikubGVuZ3RoKSByZXR1cm47XHJcbiAgICAgICAgICAgIHRoaXMuJGJ1dHRvbnNDb250YWluZXIuYXBwZW5kKGh0bWwpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9hZGRCdXR0b25zQ29udGFpbmVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZC4kZGF0ZXBpY2tlci5hcHBlbmQoYnV0dG9uc0NvbnRhaW5lclRlbXBsYXRlKTtcclxuICAgICAgICAgICAgdGhpcy4kYnV0dG9uc0NvbnRhaW5lciA9ICQoJy5kYXRlcGlja2VyLS1idXR0b25zJywgdGhpcy5kLiRkYXRlcGlja2VyKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzZXROYXZTdGF0dXM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCEodGhpcy5vcHRzLm1pbkRhdGUgfHwgdGhpcy5vcHRzLm1heERhdGUpIHx8ICF0aGlzLm9wdHMuZGlzYWJsZU5hdldoZW5PdXRPZlJhbmdlKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICB2YXIgZGF0ZSA9IHRoaXMuZC5wYXJzZWREYXRlLFxyXG4gICAgICAgICAgICAgICAgbSA9IGRhdGUubW9udGgsXHJcbiAgICAgICAgICAgICAgICB5ID0gZGF0ZS55ZWFyLFxyXG4gICAgICAgICAgICAgICAgZCA9IGRhdGUuZGF0ZTtcclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy5kLnZpZXcpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2RheXMnOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5kLl9pc0luUmFuZ2UobmV3IERhdGUoeSwgbS0xLCBkKSwgJ21vbnRoJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZU5hdigncHJldicpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5kLl9pc0luUmFuZ2UobmV3IERhdGUoeSwgbSsxLCBkKSwgJ21vbnRoJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZU5hdignbmV4dCcpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbW9udGhzJzpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZC5faXNJblJhbmdlKG5ldyBEYXRlKHktMSwgbSwgZCksICd5ZWFyJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZU5hdigncHJldicpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5kLl9pc0luUmFuZ2UobmV3IERhdGUoeSsxLCBtLCBkKSwgJ3llYXInKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlTmF2KCduZXh0JylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICd5ZWFycyc6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmQuX2lzSW5SYW5nZShuZXcgRGF0ZSh5LTEwLCBtLCBkKSwgJ3llYXInKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlTmF2KCdwcmV2JylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmQuX2lzSW5SYW5nZShuZXcgRGF0ZSh5KzEwLCBtLCBkKSwgJ3llYXInKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlTmF2KCduZXh0JylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfZGlzYWJsZU5hdjogZnVuY3Rpb24gKG5hdikge1xyXG4gICAgICAgICAgICAkKCdbZGF0YS1hY3Rpb249XCInICsgbmF2ICsgJ1wiXScsIHRoaXMuZC4kbmF2KS5hZGRDbGFzcygnLWRpc2FibGVkLScpXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2FjdGl2YXRlTmF2OiBmdW5jdGlvbiAobmF2KSB7XHJcbiAgICAgICAgICAgICQoJ1tkYXRhLWFjdGlvbj1cIicgKyBuYXYgKyAnXCJdJywgdGhpcy5kLiRuYXYpLnJlbW92ZUNsYXNzKCctZGlzYWJsZWQtJylcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfb25DbGlja05hdkJ1dHRvbjogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdmFyICRlbCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ1tkYXRhLWFjdGlvbl0nKSxcclxuICAgICAgICAgICAgICAgIGFjdGlvbiA9ICRlbC5kYXRhKCdhY3Rpb24nKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZFthY3Rpb25dKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX29uQ2xpY2tOYXZUaXRsZTogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgaWYgKCQoZS50YXJnZXQpLmhhc0NsYXNzKCctZGlzYWJsZWQtJykpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmQudmlldyA9PSAnZGF5cycpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmQudmlldyA9ICdtb250aHMnXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuZC52aWV3ID0gJ3llYXJzJztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59KSgpO1xyXG4iLCIhZnVuY3Rpb24oYSxiKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtcImpxdWVyeVwiXSxiKTpcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1iKHJlcXVpcmUoXCJqcXVlcnlcIikpOmIoYS5qUXVlcnkpfSh0aGlzLGZ1bmN0aW9uKGEpe1wiZnVuY3Rpb25cIiE9dHlwZW9mIE9iamVjdC5jcmVhdGUmJihPYmplY3QuY3JlYXRlPWZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoKXt9cmV0dXJuIGIucHJvdG90eXBlPWEsbmV3IGJ9KTt2YXIgYj17aW5pdDpmdW5jdGlvbihiKXtyZXR1cm4gdGhpcy5vcHRpb25zPWEuZXh0ZW5kKHt9LGEubm90eS5kZWZhdWx0cyxiKSx0aGlzLm9wdGlvbnMubGF5b3V0PXRoaXMub3B0aW9ucy5jdXN0b20/YS5ub3R5LmxheW91dHMuaW5saW5lOmEubm90eS5sYXlvdXRzW3RoaXMub3B0aW9ucy5sYXlvdXRdLGEubm90eS50aGVtZXNbdGhpcy5vcHRpb25zLnRoZW1lXT90aGlzLm9wdGlvbnMudGhlbWU9YS5ub3R5LnRoZW1lc1t0aGlzLm9wdGlvbnMudGhlbWVdOnRoaXMub3B0aW9ucy50aGVtZUNsYXNzTmFtZT10aGlzLm9wdGlvbnMudGhlbWUsdGhpcy5vcHRpb25zPWEuZXh0ZW5kKHt9LHRoaXMub3B0aW9ucyx0aGlzLm9wdGlvbnMubGF5b3V0Lm9wdGlvbnMpLHRoaXMub3B0aW9ucy5pZD1cIm5vdHlfXCIrKG5ldyBEYXRlKS5nZXRUaW1lKCkqTWF0aC5mbG9vcigxZTYqTWF0aC5yYW5kb20oKSksdGhpcy5fYnVpbGQoKSx0aGlzfSxfYnVpbGQ6ZnVuY3Rpb24oKXt2YXIgYj1hKCc8ZGl2IGNsYXNzPVwibm90eV9iYXIgbm90eV90eXBlXycrdGhpcy5vcHRpb25zLnR5cGUrJ1wiPjwvZGl2PicpLmF0dHIoXCJpZFwiLHRoaXMub3B0aW9ucy5pZCk7aWYoYi5hcHBlbmQodGhpcy5vcHRpb25zLnRlbXBsYXRlKS5maW5kKFwiLm5vdHlfdGV4dFwiKS5odG1sKHRoaXMub3B0aW9ucy50ZXh0KSx0aGlzLiRiYXI9bnVsbCE9PXRoaXMub3B0aW9ucy5sYXlvdXQucGFyZW50Lm9iamVjdD9hKHRoaXMub3B0aW9ucy5sYXlvdXQucGFyZW50Lm9iamVjdCkuY3NzKHRoaXMub3B0aW9ucy5sYXlvdXQucGFyZW50LmNzcykuYXBwZW5kKGIpOmIsdGhpcy5vcHRpb25zLnRoZW1lQ2xhc3NOYW1lJiZ0aGlzLiRiYXIuYWRkQ2xhc3ModGhpcy5vcHRpb25zLnRoZW1lQ2xhc3NOYW1lKS5hZGRDbGFzcyhcIm5vdHlfY29udGFpbmVyX3R5cGVfXCIrdGhpcy5vcHRpb25zLnR5cGUpLHRoaXMub3B0aW9ucy5idXR0b25zKXt0aGlzLm9wdGlvbnMuY2xvc2VXaXRoPVtdLHRoaXMub3B0aW9ucy50aW1lb3V0PSExO3ZhciBjPWEoXCI8ZGl2Lz5cIikuYWRkQ2xhc3MoXCJub3R5X2J1dHRvbnNcIik7bnVsbCE9PXRoaXMub3B0aW9ucy5sYXlvdXQucGFyZW50Lm9iamVjdD90aGlzLiRiYXIuZmluZChcIi5ub3R5X2JhclwiKS5hcHBlbmQoYyk6dGhpcy4kYmFyLmFwcGVuZChjKTt2YXIgZD10aGlzO2EuZWFjaCh0aGlzLm9wdGlvbnMuYnV0dG9ucyxmdW5jdGlvbihiLGMpe3ZhciBlPWEoXCI8YnV0dG9uLz5cIikuYWRkQ2xhc3MoYy5hZGRDbGFzcz9jLmFkZENsYXNzOlwiZ3JheVwiKS5odG1sKGMudGV4dCkuYXR0cihcImlkXCIsYy5pZD9jLmlkOlwiYnV0dG9uLVwiK2IpLmF0dHIoXCJ0aXRsZVwiLGMudGl0bGUpLmFwcGVuZFRvKGQuJGJhci5maW5kKFwiLm5vdHlfYnV0dG9uc1wiKSkub24oXCJjbGlja1wiLGZ1bmN0aW9uKGIpe2EuaXNGdW5jdGlvbihjLm9uQ2xpY2spJiZjLm9uQ2xpY2suY2FsbChlLGQsYil9KX0pfXRoaXMuJG1lc3NhZ2U9dGhpcy4kYmFyLmZpbmQoXCIubm90eV9tZXNzYWdlXCIpLHRoaXMuJGNsb3NlQnV0dG9uPXRoaXMuJGJhci5maW5kKFwiLm5vdHlfY2xvc2VcIiksdGhpcy4kYnV0dG9ucz10aGlzLiRiYXIuZmluZChcIi5ub3R5X2J1dHRvbnNcIiksYS5ub3R5LnN0b3JlW3RoaXMub3B0aW9ucy5pZF09dGhpc30sc2hvdzpmdW5jdGlvbigpe3ZhciBiPXRoaXM7cmV0dXJuIGIub3B0aW9ucy5jdXN0b20/Yi5vcHRpb25zLmN1c3RvbS5maW5kKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5hcHBlbmQoYi4kYmFyKTphKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5hcHBlbmQoYi4kYmFyKSxiLm9wdGlvbnMudGhlbWUmJmIub3B0aW9ucy50aGVtZS5zdHlsZSYmYi5vcHRpb25zLnRoZW1lLnN0eWxlLmFwcGx5KGIpLFwiZnVuY3Rpb25cIj09PWEudHlwZShiLm9wdGlvbnMubGF5b3V0LmNzcyk/dGhpcy5vcHRpb25zLmxheW91dC5jc3MuYXBwbHkoYi4kYmFyKTpiLiRiYXIuY3NzKHRoaXMub3B0aW9ucy5sYXlvdXQuY3NzfHx7fSksYi4kYmFyLmFkZENsYXNzKGIub3B0aW9ucy5sYXlvdXQuYWRkQ2xhc3MpLGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnN0eWxlLmFwcGx5KGEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLFtiLm9wdGlvbnMud2l0aGluXSksYi5zaG93aW5nPSEwLGIub3B0aW9ucy50aGVtZSYmYi5vcHRpb25zLnRoZW1lLnN0eWxlJiZiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2sub25TaG93LmFwcGx5KHRoaXMpLGEuaW5BcnJheShcImNsaWNrXCIsYi5vcHRpb25zLmNsb3NlV2l0aCk+LTEmJmIuJGJhci5jc3MoXCJjdXJzb3JcIixcInBvaW50ZXJcIikub25lKFwiY2xpY2tcIixmdW5jdGlvbihhKXtiLnN0b3BQcm9wYWdhdGlvbihhKSxiLm9wdGlvbnMuY2FsbGJhY2sub25DbG9zZUNsaWNrJiZiLm9wdGlvbnMuY2FsbGJhY2sub25DbG9zZUNsaWNrLmFwcGx5KGIpLGIuY2xvc2UoKX0pLGEuaW5BcnJheShcImhvdmVyXCIsYi5vcHRpb25zLmNsb3NlV2l0aCk+LTEmJmIuJGJhci5vbmUoXCJtb3VzZWVudGVyXCIsZnVuY3Rpb24oKXtiLmNsb3NlKCl9KSxhLmluQXJyYXkoXCJidXR0b25cIixiLm9wdGlvbnMuY2xvc2VXaXRoKT4tMSYmYi4kY2xvc2VCdXR0b24ub25lKFwiY2xpY2tcIixmdW5jdGlvbihhKXtiLnN0b3BQcm9wYWdhdGlvbihhKSxiLmNsb3NlKCl9KSwtMT09YS5pbkFycmF5KFwiYnV0dG9uXCIsYi5vcHRpb25zLmNsb3NlV2l0aCkmJmIuJGNsb3NlQnV0dG9uLnJlbW92ZSgpLGIub3B0aW9ucy5jYWxsYmFjay5vblNob3cmJmIub3B0aW9ucy5jYWxsYmFjay5vblNob3cuYXBwbHkoYiksXCJzdHJpbmdcIj09dHlwZW9mIGIub3B0aW9ucy5hbmltYXRpb24ub3Blbj8oYi4kYmFyLmNzcyhcImhlaWdodFwiLGIuJGJhci5pbm5lckhlaWdodCgpKSxiLiRiYXIub24oXCJjbGlja1wiLGZ1bmN0aW9uKGEpe2Iud2FzQ2xpY2tlZD0hMH0pLGIuJGJhci5zaG93KCkuYWRkQ2xhc3MoYi5vcHRpb25zLmFuaW1hdGlvbi5vcGVuKS5vbmUoXCJ3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kXCIsZnVuY3Rpb24oKXtiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJTaG93JiZiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJTaG93LmFwcGx5KGIpLGIuc2hvd2luZz0hMSxiLnNob3duPSEwLGIuaGFzT3duUHJvcGVydHkoXCJ3YXNDbGlja2VkXCIpJiYoYi4kYmFyLm9mZihcImNsaWNrXCIsZnVuY3Rpb24oYSl7Yi53YXNDbGlja2VkPSEwfSksYi5jbG9zZSgpKX0pKTpiLiRiYXIuYW5pbWF0ZShiLm9wdGlvbnMuYW5pbWF0aW9uLm9wZW4sYi5vcHRpb25zLmFuaW1hdGlvbi5zcGVlZCxiLm9wdGlvbnMuYW5pbWF0aW9uLmVhc2luZyxmdW5jdGlvbigpe2Iub3B0aW9ucy5jYWxsYmFjay5hZnRlclNob3cmJmIub3B0aW9ucy5jYWxsYmFjay5hZnRlclNob3cuYXBwbHkoYiksYi5zaG93aW5nPSExLGIuc2hvd249ITB9KSxiLm9wdGlvbnMudGltZW91dCYmYi4kYmFyLmRlbGF5KGIub3B0aW9ucy50aW1lb3V0KS5wcm9taXNlKCkuZG9uZShmdW5jdGlvbigpe2IuY2xvc2UoKX0pLHRoaXN9LGNsb3NlOmZ1bmN0aW9uKCl7aWYoISh0aGlzLmNsb3NlZHx8dGhpcy4kYmFyJiZ0aGlzLiRiYXIuaGFzQ2xhc3MoXCJpLWFtLWNsb3Npbmctbm93XCIpKSl7dmFyIGI9dGhpcztpZih0aGlzLnNob3dpbmcpcmV0dXJuIHZvaWQgYi4kYmFyLnF1ZXVlKGZ1bmN0aW9uKCl7Yi5jbG9zZS5hcHBseShiKX0pO2lmKCF0aGlzLnNob3duJiYhdGhpcy5zaG93aW5nKXt2YXIgYz1bXTtyZXR1cm4gYS5lYWNoKGEubm90eS5xdWV1ZSxmdW5jdGlvbihhLGQpe2Qub3B0aW9ucy5pZCE9Yi5vcHRpb25zLmlkJiZjLnB1c2goZCl9KSx2b2lkKGEubm90eS5xdWV1ZT1jKX1iLiRiYXIuYWRkQ2xhc3MoXCJpLWFtLWNsb3Npbmctbm93XCIpLGIub3B0aW9ucy5jYWxsYmFjay5vbkNsb3NlJiZiLm9wdGlvbnMuY2FsbGJhY2sub25DbG9zZS5hcHBseShiKSxcInN0cmluZ1wiPT10eXBlb2YgYi5vcHRpb25zLmFuaW1hdGlvbi5jbG9zZT9iLiRiYXIuYWRkQ2xhc3MoYi5vcHRpb25zLmFuaW1hdGlvbi5jbG9zZSkub25lKFwid2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZFwiLGZ1bmN0aW9uKCl7Yi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyQ2xvc2UmJmIub3B0aW9ucy5jYWxsYmFjay5hZnRlckNsb3NlLmFwcGx5KGIpLGIuY2xvc2VDbGVhblVwKCl9KTpiLiRiYXIuY2xlYXJRdWV1ZSgpLnN0b3AoKS5hbmltYXRlKGIub3B0aW9ucy5hbmltYXRpb24uY2xvc2UsYi5vcHRpb25zLmFuaW1hdGlvbi5zcGVlZCxiLm9wdGlvbnMuYW5pbWF0aW9uLmVhc2luZyxmdW5jdGlvbigpe2Iub3B0aW9ucy5jYWxsYmFjay5hZnRlckNsb3NlJiZiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJDbG9zZS5hcHBseShiKX0pLnByb21pc2UoKS5kb25lKGZ1bmN0aW9uKCl7Yi5jbG9zZUNsZWFuVXAoKX0pfX0sY2xvc2VDbGVhblVwOmZ1bmN0aW9uKCl7dmFyIGI9dGhpcztiLm9wdGlvbnMubW9kYWwmJihhLm5vdHlSZW5kZXJlci5zZXRNb2RhbENvdW50KC0xKSwwPT1hLm5vdHlSZW5kZXJlci5nZXRNb2RhbENvdW50KCkmJmEoXCIubm90eV9tb2RhbFwiKS5mYWRlT3V0KGIub3B0aW9ucy5hbmltYXRpb24uZmFkZVNwZWVkLGZ1bmN0aW9uKCl7YSh0aGlzKS5yZW1vdmUoKX0pKSxhLm5vdHlSZW5kZXJlci5zZXRMYXlvdXRDb3VudEZvcihiLC0xKSwwPT1hLm5vdHlSZW5kZXJlci5nZXRMYXlvdXRDb3VudEZvcihiKSYmYShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikucmVtb3ZlKCksXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGIuJGJhciYmbnVsbCE9PWIuJGJhciYmKFwic3RyaW5nXCI9PXR5cGVvZiBiLm9wdGlvbnMuYW5pbWF0aW9uLmNsb3NlPyhiLiRiYXIuY3NzKFwidHJhbnNpdGlvblwiLFwiYWxsIDEwMG1zIGVhc2VcIikuY3NzKFwiYm9yZGVyXCIsMCkuY3NzKFwibWFyZ2luXCIsMCkuaGVpZ2h0KDApLGIuJGJhci5vbmUoXCJ0cmFuc2l0aW9uZW5kIHdlYmtpdFRyYW5zaXRpb25FbmQgb1RyYW5zaXRpb25FbmQgTVNUcmFuc2l0aW9uRW5kXCIsZnVuY3Rpb24oKXtiLiRiYXIucmVtb3ZlKCksYi4kYmFyPW51bGwsYi5jbG9zZWQ9ITAsYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrJiZiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2sub25DbG9zZSYmYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrLm9uQ2xvc2UuYXBwbHkoYil9KSk6KGIuJGJhci5yZW1vdmUoKSxiLiRiYXI9bnVsbCxiLmNsb3NlZD0hMCkpLGRlbGV0ZSBhLm5vdHkuc3RvcmVbYi5vcHRpb25zLmlkXSxiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2smJmIub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vbkNsb3NlJiZiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2sub25DbG9zZS5hcHBseShiKSxiLm9wdGlvbnMuZGlzbWlzc1F1ZXVlfHwoYS5ub3R5Lm9udGFwPSEwLGEubm90eVJlbmRlcmVyLnJlbmRlcigpKSxiLm9wdGlvbnMubWF4VmlzaWJsZT4wJiZiLm9wdGlvbnMuZGlzbWlzc1F1ZXVlJiZhLm5vdHlSZW5kZXJlci5yZW5kZXIoKX0sc2V0VGV4dDpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5jbG9zZWR8fCh0aGlzLm9wdGlvbnMudGV4dD1hLHRoaXMuJGJhci5maW5kKFwiLm5vdHlfdGV4dFwiKS5odG1sKGEpKSx0aGlzfSxzZXRUeXBlOmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLmNsb3NlZHx8KHRoaXMub3B0aW9ucy50eXBlPWEsdGhpcy5vcHRpb25zLnRoZW1lLnN0eWxlLmFwcGx5KHRoaXMpLHRoaXMub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vblNob3cuYXBwbHkodGhpcykpLHRoaXN9LHNldFRpbWVvdXQ6ZnVuY3Rpb24oYSl7aWYoIXRoaXMuY2xvc2VkKXt2YXIgYj10aGlzO3RoaXMub3B0aW9ucy50aW1lb3V0PWEsYi4kYmFyLmRlbGF5KGIub3B0aW9ucy50aW1lb3V0KS5wcm9taXNlKCkuZG9uZShmdW5jdGlvbigpe2IuY2xvc2UoKX0pfXJldHVybiB0aGlzfSxzdG9wUHJvcGFnYXRpb246ZnVuY3Rpb24oYSl7YT1hfHx3aW5kb3cuZXZlbnQsXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGEuc3RvcFByb3BhZ2F0aW9uP2Euc3RvcFByb3BhZ2F0aW9uKCk6YS5jYW5jZWxCdWJibGU9ITB9LGNsb3NlZDohMSxzaG93aW5nOiExLHNob3duOiExfTthLm5vdHlSZW5kZXJlcj17fSxhLm5vdHlSZW5kZXJlci5pbml0PWZ1bmN0aW9uKGMpe3ZhciBkPU9iamVjdC5jcmVhdGUoYikuaW5pdChjKTtyZXR1cm4gZC5vcHRpb25zLmtpbGxlciYmYS5ub3R5LmNsb3NlQWxsKCksZC5vcHRpb25zLmZvcmNlP2Eubm90eS5xdWV1ZS51bnNoaWZ0KGQpOmEubm90eS5xdWV1ZS5wdXNoKGQpLGEubm90eVJlbmRlcmVyLnJlbmRlcigpLFwib2JqZWN0XCI9PWEubm90eS5yZXR1cm5zP2Q6ZC5vcHRpb25zLmlkfSxhLm5vdHlSZW5kZXJlci5yZW5kZXI9ZnVuY3Rpb24oKXt2YXIgYj1hLm5vdHkucXVldWVbMF07XCJvYmplY3RcIj09PWEudHlwZShiKT9iLm9wdGlvbnMuZGlzbWlzc1F1ZXVlP2Iub3B0aW9ucy5tYXhWaXNpYmxlPjA/YShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcitcIiA+IGxpXCIpLmxlbmd0aDxiLm9wdGlvbnMubWF4VmlzaWJsZSYmYS5ub3R5UmVuZGVyZXIuc2hvdyhhLm5vdHkucXVldWUuc2hpZnQoKSk6YS5ub3R5UmVuZGVyZXIuc2hvdyhhLm5vdHkucXVldWUuc2hpZnQoKSk6YS5ub3R5Lm9udGFwJiYoYS5ub3R5UmVuZGVyZXIuc2hvdyhhLm5vdHkucXVldWUuc2hpZnQoKSksYS5ub3R5Lm9udGFwPSExKTphLm5vdHkub250YXA9ITB9LGEubm90eVJlbmRlcmVyLnNob3c9ZnVuY3Rpb24oYil7Yi5vcHRpb25zLm1vZGFsJiYoYS5ub3R5UmVuZGVyZXIuY3JlYXRlTW9kYWxGb3IoYiksYS5ub3R5UmVuZGVyZXIuc2V0TW9kYWxDb3VudCgxKSksYi5vcHRpb25zLmN1c3RvbT8wPT1iLm9wdGlvbnMuY3VzdG9tLmZpbmQoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmxlbmd0aD9iLm9wdGlvbnMuY3VzdG9tLmFwcGVuZChhKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLm9iamVjdCkuYWRkQ2xhc3MoXCJpLWFtLW5ld1wiKSk6Yi5vcHRpb25zLmN1c3RvbS5maW5kKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5yZW1vdmVDbGFzcyhcImktYW0tbmV3XCIpOjA9PWEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmxlbmd0aD9hKFwiYm9keVwiKS5hcHBlbmQoYShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5vYmplY3QpLmFkZENsYXNzKFwiaS1hbS1uZXdcIikpOmEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLnJlbW92ZUNsYXNzKFwiaS1hbS1uZXdcIiksYS5ub3R5UmVuZGVyZXIuc2V0TGF5b3V0Q291bnRGb3IoYiwxKSxiLnNob3coKX0sYS5ub3R5UmVuZGVyZXIuY3JlYXRlTW9kYWxGb3I9ZnVuY3Rpb24oYil7aWYoMD09YShcIi5ub3R5X21vZGFsXCIpLmxlbmd0aCl7dmFyIGM9YShcIjxkaXYvPlwiKS5hZGRDbGFzcyhcIm5vdHlfbW9kYWxcIikuYWRkQ2xhc3MoYi5vcHRpb25zLnRoZW1lKS5kYXRhKFwibm90eV9tb2RhbF9jb3VudFwiLDApO2Iub3B0aW9ucy50aGVtZS5tb2RhbCYmYi5vcHRpb25zLnRoZW1lLm1vZGFsLmNzcyYmYy5jc3MoYi5vcHRpb25zLnRoZW1lLm1vZGFsLmNzcyksYy5wcmVwZW5kVG8oYShcImJvZHlcIikpLmZhZGVJbihiLm9wdGlvbnMuYW5pbWF0aW9uLmZhZGVTcGVlZCksYS5pbkFycmF5KFwiYmFja2Ryb3BcIixiLm9wdGlvbnMuY2xvc2VXaXRoKT4tMSYmYy5vbihcImNsaWNrXCIsZnVuY3Rpb24oYil7YS5ub3R5LmNsb3NlQWxsKCl9KX19LGEubm90eVJlbmRlcmVyLmdldExheW91dENvdW50Rm9yPWZ1bmN0aW9uKGIpe3JldHVybiBhKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5kYXRhKFwibm90eV9sYXlvdXRfY291bnRcIil8fDB9LGEubm90eVJlbmRlcmVyLnNldExheW91dENvdW50Rm9yPWZ1bmN0aW9uKGIsYyl7cmV0dXJuIGEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmRhdGEoXCJub3R5X2xheW91dF9jb3VudFwiLGEubm90eVJlbmRlcmVyLmdldExheW91dENvdW50Rm9yKGIpK2MpfSxhLm5vdHlSZW5kZXJlci5nZXRNb2RhbENvdW50PWZ1bmN0aW9uKCl7cmV0dXJuIGEoXCIubm90eV9tb2RhbFwiKS5kYXRhKFwibm90eV9tb2RhbF9jb3VudFwiKXx8MH0sYS5ub3R5UmVuZGVyZXIuc2V0TW9kYWxDb3VudD1mdW5jdGlvbihiKXtyZXR1cm4gYShcIi5ub3R5X21vZGFsXCIpLmRhdGEoXCJub3R5X21vZGFsX2NvdW50XCIsYS5ub3R5UmVuZGVyZXIuZ2V0TW9kYWxDb3VudCgpK2IpfSxhLmZuLm5vdHk9ZnVuY3Rpb24oYil7cmV0dXJuIGIuY3VzdG9tPWEodGhpcyksYS5ub3R5UmVuZGVyZXIuaW5pdChiKX0sYS5ub3R5PXt9LGEubm90eS5xdWV1ZT1bXSxhLm5vdHkub250YXA9ITAsYS5ub3R5LmxheW91dHM9e30sYS5ub3R5LnRoZW1lcz17fSxhLm5vdHkucmV0dXJucz1cIm9iamVjdFwiLGEubm90eS5zdG9yZT17fSxhLm5vdHkuZ2V0PWZ1bmN0aW9uKGIpe3JldHVybiBhLm5vdHkuc3RvcmUuaGFzT3duUHJvcGVydHkoYik/YS5ub3R5LnN0b3JlW2JdOiExfSxhLm5vdHkuY2xvc2U9ZnVuY3Rpb24oYil7cmV0dXJuIGEubm90eS5nZXQoYik/YS5ub3R5LmdldChiKS5jbG9zZSgpOiExfSxhLm5vdHkuc2V0VGV4dD1mdW5jdGlvbihiLGMpe3JldHVybiBhLm5vdHkuZ2V0KGIpP2Eubm90eS5nZXQoYikuc2V0VGV4dChjKTohMX0sYS5ub3R5LnNldFR5cGU9ZnVuY3Rpb24oYixjKXtyZXR1cm4gYS5ub3R5LmdldChiKT9hLm5vdHkuZ2V0KGIpLnNldFR5cGUoYyk6ITF9LGEubm90eS5jbGVhclF1ZXVlPWZ1bmN0aW9uKCl7YS5ub3R5LnF1ZXVlPVtdfSxhLm5vdHkuY2xvc2VBbGw9ZnVuY3Rpb24oKXthLm5vdHkuY2xlYXJRdWV1ZSgpLGEuZWFjaChhLm5vdHkuc3RvcmUsZnVuY3Rpb24oYSxiKXtiLmNsb3NlKCl9KX07dmFyIGM9d2luZG93LmFsZXJ0O3JldHVybiBhLm5vdHkuY29uc3VtZUFsZXJ0PWZ1bmN0aW9uKGIpe3dpbmRvdy5hbGVydD1mdW5jdGlvbihjKXtiP2IudGV4dD1jOmI9e3RleHQ6Y30sYS5ub3R5UmVuZGVyZXIuaW5pdChiKX19LGEubm90eS5zdG9wQ29uc3VtZUFsZXJ0PWZ1bmN0aW9uKCl7d2luZG93LmFsZXJ0PWN9LGEubm90eS5kZWZhdWx0cz17bGF5b3V0OlwidG9wXCIsdGhlbWU6XCJkZWZhdWx0VGhlbWVcIix0eXBlOlwiYWxlcnRcIix0ZXh0OlwiXCIsZGlzbWlzc1F1ZXVlOiEwLHRlbXBsYXRlOic8ZGl2IGNsYXNzPVwibm90eV9tZXNzYWdlXCI+PHNwYW4gY2xhc3M9XCJub3R5X3RleHRcIj48L3NwYW4+PGRpdiBjbGFzcz1cIm5vdHlfY2xvc2VcIj48L2Rpdj48L2Rpdj4nLGFuaW1hdGlvbjp7b3Blbjp7aGVpZ2h0OlwidG9nZ2xlXCJ9LGNsb3NlOntoZWlnaHQ6XCJ0b2dnbGVcIn0sZWFzaW5nOlwic3dpbmdcIixzcGVlZDo1MDAsZmFkZVNwZWVkOlwiZmFzdFwifSx0aW1lb3V0OiExLGZvcmNlOiExLG1vZGFsOiExLG1heFZpc2libGU6NSxraWxsZXI6ITEsY2xvc2VXaXRoOltcImNsaWNrXCJdLGNhbGxiYWNrOntvblNob3c6ZnVuY3Rpb24oKXt9LGFmdGVyU2hvdzpmdW5jdGlvbigpe30sb25DbG9zZTpmdW5jdGlvbigpe30sYWZ0ZXJDbG9zZTpmdW5jdGlvbigpe30sb25DbG9zZUNsaWNrOmZ1bmN0aW9uKCl7fX0sYnV0dG9uczohMX0sYSh3aW5kb3cpLm9uKFwicmVzaXplXCIsZnVuY3Rpb24oKXthLmVhY2goYS5ub3R5LmxheW91dHMsZnVuY3Rpb24oYixjKXtjLmNvbnRhaW5lci5zdHlsZS5hcHBseShhKGMuY29udGFpbmVyLnNlbGVjdG9yKSl9KX0pLHdpbmRvdy5ub3R5PWZ1bmN0aW9uKGIpe3JldHVybiBhLm5vdHlSZW5kZXJlci5pbml0KGIpfSxhLm5vdHkubGF5b3V0cy5ib3R0b209e25hbWU6XCJib3R0b21cIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2JvdHRvbV9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9ib3R0b21fbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe2JvdHRvbTowLGxlZnQ6XCI1JVwiLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjkwJVwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6OTk5OTk5OX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmJvdHRvbUNlbnRlcj17bmFtZTpcImJvdHRvbUNlbnRlclwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfYm90dG9tQ2VudGVyX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2JvdHRvbUNlbnRlcl9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7Ym90dG9tOjIwLGxlZnQ6MCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSksYSh0aGlzKS5jc3Moe2xlZnQ6KGEod2luZG93KS53aWR0aCgpLWEodGhpcykub3V0ZXJXaWR0aCghMSkpLzIrXCJweFwifSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmJvdHRvbUxlZnQ9e25hbWU6XCJib3R0b21MZWZ0XCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9ib3R0b21MZWZ0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2JvdHRvbUxlZnRfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe2JvdHRvbToyMCxsZWZ0OjIwLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KSx3aW5kb3cuaW5uZXJXaWR0aDw2MDAmJmEodGhpcykuY3NzKHtsZWZ0OjV9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuYm90dG9tUmlnaHQ9e25hbWU6XCJib3R0b21SaWdodFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfYm90dG9tUmlnaHRfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfYm90dG9tUmlnaHRfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe2JvdHRvbToyMCxyaWdodDoyMCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSksd2luZG93LmlubmVyV2lkdGg8NjAwJiZhKHRoaXMpLmNzcyh7cmlnaHQ6NX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5jZW50ZXI9e25hbWU6XCJjZW50ZXJcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2NlbnRlcl9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9jZW50ZXJfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3Bvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KTt2YXIgYj1hKHRoaXMpLmNsb25lKCkuY3NzKHt2aXNpYmlsaXR5OlwiaGlkZGVuXCIsZGlzcGxheTpcImJsb2NrXCIscG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDowLGxlZnQ6MH0pLmF0dHIoXCJpZFwiLFwiZHVwZVwiKTthKFwiYm9keVwiKS5hcHBlbmQoYiksYi5maW5kKFwiLmktYW0tY2xvc2luZy1ub3dcIikucmVtb3ZlKCksYi5maW5kKFwibGlcIikuY3NzKFwiZGlzcGxheVwiLFwiYmxvY2tcIik7dmFyIGM9Yi5oZWlnaHQoKTtiLnJlbW92ZSgpLGEodGhpcykuaGFzQ2xhc3MoXCJpLWFtLW5ld1wiKT9hKHRoaXMpLmNzcyh7bGVmdDooYSh3aW5kb3cpLndpZHRoKCktYSh0aGlzKS5vdXRlcldpZHRoKCExKSkvMitcInB4XCIsdG9wOihhKHdpbmRvdykuaGVpZ2h0KCktYykvMitcInB4XCJ9KTphKHRoaXMpLmFuaW1hdGUoe2xlZnQ6KGEod2luZG93KS53aWR0aCgpLWEodGhpcykub3V0ZXJXaWR0aCghMSkpLzIrXCJweFwiLHRvcDooYSh3aW5kb3cpLmhlaWdodCgpLWMpLzIrXCJweFwifSw1MDApfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5jZW50ZXJMZWZ0PXtuYW1lOlwiY2VudGVyTGVmdFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfY2VudGVyTGVmdF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9jZW50ZXJMZWZ0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtsZWZ0OjIwLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KTt2YXIgYj1hKHRoaXMpLmNsb25lKCkuY3NzKHt2aXNpYmlsaXR5OlwiaGlkZGVuXCIsZGlzcGxheTpcImJsb2NrXCIscG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDowLGxlZnQ6MH0pLmF0dHIoXCJpZFwiLFwiZHVwZVwiKTthKFwiYm9keVwiKS5hcHBlbmQoYiksYi5maW5kKFwiLmktYW0tY2xvc2luZy1ub3dcIikucmVtb3ZlKCksYi5maW5kKFwibGlcIikuY3NzKFwiZGlzcGxheVwiLFwiYmxvY2tcIik7dmFyIGM9Yi5oZWlnaHQoKTtiLnJlbW92ZSgpLGEodGhpcykuaGFzQ2xhc3MoXCJpLWFtLW5ld1wiKT9hKHRoaXMpLmNzcyh7dG9wOihhKHdpbmRvdykuaGVpZ2h0KCktYykvMitcInB4XCJ9KTphKHRoaXMpLmFuaW1hdGUoe3RvcDooYSh3aW5kb3cpLmhlaWdodCgpLWMpLzIrXCJweFwifSw1MDApLHdpbmRvdy5pbm5lcldpZHRoPDYwMCYmYSh0aGlzKS5jc3Moe2xlZnQ6NX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5jZW50ZXJSaWdodD17bmFtZTpcImNlbnRlclJpZ2h0XCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9jZW50ZXJSaWdodF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9jZW50ZXJSaWdodF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7cmlnaHQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pO3ZhciBiPWEodGhpcykuY2xvbmUoKS5jc3Moe3Zpc2liaWxpdHk6XCJoaWRkZW5cIixkaXNwbGF5OlwiYmxvY2tcIixwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOjAsbGVmdDowfSkuYXR0cihcImlkXCIsXCJkdXBlXCIpO2EoXCJib2R5XCIpLmFwcGVuZChiKSxiLmZpbmQoXCIuaS1hbS1jbG9zaW5nLW5vd1wiKS5yZW1vdmUoKSxiLmZpbmQoXCJsaVwiKS5jc3MoXCJkaXNwbGF5XCIsXCJibG9ja1wiKTt2YXIgYz1iLmhlaWdodCgpO2IucmVtb3ZlKCksYSh0aGlzKS5oYXNDbGFzcyhcImktYW0tbmV3XCIpP2EodGhpcykuY3NzKHt0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0pOmEodGhpcykuYW5pbWF0ZSh7dG9wOihhKHdpbmRvdykuaGVpZ2h0KCktYykvMitcInB4XCJ9LDUwMCksd2luZG93LmlubmVyV2lkdGg8NjAwJiZhKHRoaXMpLmNzcyh7cmlnaHQ6NX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5pbmxpbmU9e25hbWU6XCJpbmxpbmVcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgY2xhc3M9XCJub3R5X2lubGluZV9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwubm90eV9pbmxpbmVfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3dpZHRoOlwiMTAwJVwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6OTk5OTk5OX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLnRvcD17bmFtZTpcInRvcFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfdG9wX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X3RvcF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7dG9wOjAsbGVmdDpcIjUlXCIscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiOTAlXCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDo5OTk5OTk5fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMudG9wQ2VudGVyPXtuYW1lOlwidG9wQ2VudGVyXCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV90b3BDZW50ZXJfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfdG9wQ2VudGVyX2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHt0b3A6MjAsbGVmdDowLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KSxhKHRoaXMpLmNzcyh7bGVmdDooYSh3aW5kb3cpLndpZHRoKCktYSh0aGlzKS5vdXRlcldpZHRoKCExKSkvMitcInB4XCJ9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMudG9wTGVmdD17bmFtZTpcInRvcExlZnRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X3RvcExlZnRfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfdG9wTGVmdF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7dG9wOjIwLGxlZnQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLHdpbmRvdy5pbm5lcldpZHRoPDYwMCYmYSh0aGlzKS5jc3Moe2xlZnQ6NX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy50b3BSaWdodD17bmFtZTpcInRvcFJpZ2h0XCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV90b3BSaWdodF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV90b3BSaWdodF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7dG9wOjIwLHJpZ2h0OjIwLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KSx3aW5kb3cuaW5uZXJXaWR0aDw2MDAmJmEodGhpcykuY3NzKHtyaWdodDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS50aGVtZXMuYm9vdHN0cmFwVGhlbWU9e25hbWU6XCJib290c3RyYXBUaGVtZVwiLG1vZGFsOntjc3M6e3Bvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjEwMCVcIixoZWlnaHQ6XCIxMDAlXCIsYmFja2dyb3VuZENvbG9yOlwiIzAwMFwiLHpJbmRleDoxZTQsb3BhY2l0eTouNixkaXNwbGF5Olwibm9uZVwiLGxlZnQ6MCx0b3A6MH19LHN0eWxlOmZ1bmN0aW9uKCl7dmFyIGI9dGhpcy5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3I7c3dpdGNoKGEoYikuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwXCIpLHRoaXMuJGNsb3NlQnV0dG9uLmFwcGVuZCgnPHNwYW4gYXJpYS1oaWRkZW49XCJ0cnVlXCI+JnRpbWVzOzwvc3Bhbj48c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5DbG9zZTwvc3Bhbj4nKSx0aGlzLiRjbG9zZUJ1dHRvbi5hZGRDbGFzcyhcImNsb3NlXCIpLHRoaXMuJGJhci5hZGRDbGFzcyhcImxpc3QtZ3JvdXAtaXRlbVwiKS5jc3MoXCJwYWRkaW5nXCIsXCIwcHhcIiksdGhpcy5vcHRpb25zLnR5cGUpe2Nhc2VcImFsZXJ0XCI6Y2FzZVwibm90aWZpY2F0aW9uXCI6dGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtLWluZm9cIik7YnJlYWs7Y2FzZVwid2FybmluZ1wiOnRoaXMuJGJhci5hZGRDbGFzcyhcImxpc3QtZ3JvdXAtaXRlbS13YXJuaW5nXCIpO2JyZWFrO2Nhc2VcImVycm9yXCI6dGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtLWRhbmdlclwiKTticmVhaztjYXNlXCJpbmZvcm1hdGlvblwiOnRoaXMuJGJhci5hZGRDbGFzcyhcImxpc3QtZ3JvdXAtaXRlbS1pbmZvXCIpO2JyZWFrO2Nhc2VcInN1Y2Nlc3NcIjp0aGlzLiRiYXIuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwLWl0ZW0tc3VjY2Vzc1wiKX10aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsbGluZUhlaWdodDpcIjE2cHhcIix0ZXh0QWxpZ246XCJjZW50ZXJcIixwYWRkaW5nOlwiOHB4IDEwcHggOXB4XCIsd2lkdGg6XCJhdXRvXCIscG9zaXRpb246XCJyZWxhdGl2ZVwifSl9LGNhbGxiYWNrOntvblNob3c6ZnVuY3Rpb24oKXt9LG9uQ2xvc2U6ZnVuY3Rpb24oKXt9fX0sYS5ub3R5LnRoZW1lcy5kZWZhdWx0VGhlbWU9e25hbWU6XCJkZWZhdWx0VGhlbWVcIixoZWxwZXJzOntib3JkZXJGaXg6ZnVuY3Rpb24oKXtpZih0aGlzLm9wdGlvbnMuZGlzbWlzc1F1ZXVlKXt2YXIgYj10aGlzLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcitcIiBcIit0aGlzLm9wdGlvbnMubGF5b3V0LnBhcmVudC5zZWxlY3Rvcjtzd2l0Y2godGhpcy5vcHRpb25zLmxheW91dC5uYW1lKXtjYXNlXCJ0b3BcIjphKGIpLmNzcyh7Ym9yZGVyUmFkaXVzOlwiMHB4IDBweCAwcHggMHB4XCJ9KSxhKGIpLmxhc3QoKS5jc3Moe2JvcmRlclJhZGl1czpcIjBweCAwcHggNXB4IDVweFwifSk7YnJlYWs7Y2FzZVwidG9wQ2VudGVyXCI6Y2FzZVwidG9wTGVmdFwiOmNhc2VcInRvcFJpZ2h0XCI6Y2FzZVwiYm90dG9tQ2VudGVyXCI6Y2FzZVwiYm90dG9tTGVmdFwiOmNhc2VcImJvdHRvbVJpZ2h0XCI6Y2FzZVwiY2VudGVyXCI6Y2FzZVwiY2VudGVyTGVmdFwiOmNhc2VcImNlbnRlclJpZ2h0XCI6Y2FzZVwiaW5saW5lXCI6YShiKS5jc3Moe2JvcmRlclJhZGl1czpcIjBweCAwcHggMHB4IDBweFwifSksYShiKS5maXJzdCgpLmNzcyh7XCJib3JkZXItdG9wLWxlZnQtcmFkaXVzXCI6XCI1cHhcIixcImJvcmRlci10b3AtcmlnaHQtcmFkaXVzXCI6XCI1cHhcIn0pLGEoYikubGFzdCgpLmNzcyh7XCJib3JkZXItYm90dG9tLWxlZnQtcmFkaXVzXCI6XCI1cHhcIixcImJvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzXCI6XCI1cHhcIn0pO2JyZWFrO2Nhc2VcImJvdHRvbVwiOmEoYikuY3NzKHtib3JkZXJSYWRpdXM6XCIwcHggMHB4IDBweCAwcHhcIn0pLGEoYikuZmlyc3QoKS5jc3Moe2JvcmRlclJhZGl1czpcIjVweCA1cHggMHB4IDBweFwifSl9fX19LG1vZGFsOntjc3M6e3Bvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjEwMCVcIixoZWlnaHQ6XCIxMDAlXCIsYmFja2dyb3VuZENvbG9yOlwiIzAwMFwiLHpJbmRleDoxZTQsb3BhY2l0eTouNixkaXNwbGF5Olwibm9uZVwiLGxlZnQ6MCx0b3A6MH19LHN0eWxlOmZ1bmN0aW9uKCl7c3dpdGNoKHRoaXMuJGJhci5jc3Moe292ZXJmbG93OlwiaGlkZGVuXCIsYmFja2dyb3VuZDpcInVybCgnZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFCc0FBQUFvQ0FRQUFBQ2xNMG5kQUFBQWhrbEVRVlI0QWRYTzBRckNNQkJFMGJ0dGtrMzgvdzhXUkVScGR5anpWT2MrSHhoSUhxSkdNUWNGRmtwWVJRb3RMTFN3MElKNWFCZG92cnVNWURBL2tUOHBsRjlaS0xGUWNnRjE4aERqMVNiUU9NbENBNGthbzBpaVhtYWg3cUJXUGR4cG9oc2dWWnlqN2U1STlLY0lEK0VoaURJNWd4QllLTEJRWUtIQVFvR0ZBb0Vrcy9ZRUdIWUtCN2hGeGYwQUFBQUFTVVZPUks1Q1lJST0nKSByZXBlYXQteCBzY3JvbGwgbGVmdCB0b3AgI2ZmZlwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTNweFwiLGxpbmVIZWlnaHQ6XCIxNnB4XCIsdGV4dEFsaWduOlwiY2VudGVyXCIscGFkZGluZzpcIjhweCAxMHB4IDlweFwiLHdpZHRoOlwiYXV0b1wiLHBvc2l0aW9uOlwicmVsYXRpdmVcIn0pLHRoaXMuJGNsb3NlQnV0dG9uLmNzcyh7cG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDo0LHJpZ2h0OjQsd2lkdGg6MTAsaGVpZ2h0OjEwLGJhY2tncm91bmQ6XCJ1cmwoZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBb0FBQUFLQ0FRQUFBQW5Pd2MyQUFBQXhVbEVRVlI0QVIzTVBVb0RVUlNBMGUrK3VTa2tPeEMzSUFPV050YUNJRGFDaGZnWEJNRVpiUVJCeXhDd2srQmFzZ1FSWkxTWW9MZ0RRYkFSeHJ5OG55dW1QY1ZSS0RmZDBBYThBc2dEdjF6cDZwWWQ1aldPd2h2ZWJSVGJ6Tk5FdzVCU3NJcHNqL2t1clFCbm1rN3NJRmNDRjV5eVpQRFJHNnRyUWh1alhZb3NhRm9jKzJmMU1KODl1Yzc2SU5ENkY5QnZsWFVkcGI2eHdEMis0cTNtZTNieXNpSHZ0TFlyVUp0bzdQRC92ZTdMTkh4U2cvd29OMmtTejR0eGFzQmRoeWl6M3VnUEdldFRqbTNYUm9rQUFBQUFTVVZPUks1Q1lJST0pXCIsZGlzcGxheTpcIm5vbmVcIixjdXJzb3I6XCJwb2ludGVyXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7cGFkZGluZzo1LHRleHRBbGlnbjpcInJpZ2h0XCIsYm9yZGVyVG9wOlwiMXB4IHNvbGlkICNjY2NcIixiYWNrZ3JvdW5kQ29sb3I6XCIjZmZmXCJ9KSx0aGlzLiRidXR0b25zLmZpbmQoXCJidXR0b25cIikuY3NzKHttYXJnaW5MZWZ0OjV9KSx0aGlzLiRidXR0b25zLmZpbmQoXCJidXR0b246Zmlyc3RcIikuY3NzKHttYXJnaW5MZWZ0OjB9KSx0aGlzLiRiYXIub24oe21vdXNlZW50ZXI6ZnVuY3Rpb24oKXthKHRoaXMpLmZpbmQoXCIubm90eV9jbG9zZVwiKS5zdG9wKCkuZmFkZVRvKFwibm9ybWFsXCIsMSl9LG1vdXNlbGVhdmU6ZnVuY3Rpb24oKXthKHRoaXMpLmZpbmQoXCIubm90eV9jbG9zZVwiKS5zdG9wKCkuZmFkZVRvKFwibm9ybWFsXCIsMCl9fSksdGhpcy5vcHRpb25zLmxheW91dC5uYW1lKXtjYXNlXCJ0b3BcIjp0aGlzLiRiYXIuY3NzKHtib3JkZXJSYWRpdXM6XCIwcHggMHB4IDVweCA1cHhcIixib3JkZXJCb3R0b206XCIycHggc29saWQgI2VlZVwiLGJvcmRlckxlZnQ6XCIycHggc29saWQgI2VlZVwiLGJvcmRlclJpZ2h0OlwiMnB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KTticmVhaztjYXNlXCJ0b3BDZW50ZXJcIjpjYXNlXCJjZW50ZXJcIjpjYXNlXCJib3R0b21DZW50ZXJcIjpjYXNlXCJpbmxpbmVcIjp0aGlzLiRiYXIuY3NzKHtib3JkZXJSYWRpdXM6XCI1cHhcIixib3JkZXI6XCIxcHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjEzcHhcIix0ZXh0QWxpZ246XCJjZW50ZXJcIn0pO2JyZWFrO2Nhc2VcInRvcExlZnRcIjpjYXNlXCJ0b3BSaWdodFwiOmNhc2VcImJvdHRvbUxlZnRcIjpjYXNlXCJib3R0b21SaWdodFwiOmNhc2VcImNlbnRlckxlZnRcIjpjYXNlXCJjZW50ZXJSaWdodFwiOnRoaXMuJGJhci5jc3Moe2JvcmRlclJhZGl1czpcIjVweFwiLGJvcmRlcjpcIjFweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTNweFwiLHRleHRBbGlnbjpcImxlZnRcIn0pO2JyZWFrO2Nhc2VcImJvdHRvbVwiOnRoaXMuJGJhci5jc3Moe2JvcmRlclJhZGl1czpcIjVweCA1cHggMHB4IDBweFwiLGJvcmRlclRvcDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyTGVmdDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyUmlnaHQ6XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgLTJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KTticmVhaztkZWZhdWx0OnRoaXMuJGJhci5jc3Moe2JvcmRlcjpcIjJweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSl9c3dpdGNoKHRoaXMub3B0aW9ucy50eXBlKXtjYXNlXCJhbGVydFwiOmNhc2VcIm5vdGlmaWNhdGlvblwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkZcIixib3JkZXJDb2xvcjpcIiNDQ0NcIixjb2xvcjpcIiM0NDRcIn0pO2JyZWFrO2Nhc2VcIndhcm5pbmdcIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkZFQUE4XCIsYm9yZGVyQ29sb3I6XCIjRkZDMjM3XCIsY29sb3I6XCIjODI2MjAwXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkICNGRkMyMzdcIn0pO2JyZWFrO2Nhc2VcImVycm9yXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwicmVkXCIsYm9yZGVyQ29sb3I6XCJkYXJrcmVkXCIsY29sb3I6XCIjRkZGXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFdlaWdodDpcImJvbGRcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgZGFya3JlZFwifSk7YnJlYWs7Y2FzZVwiaW5mb3JtYXRpb25cIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjNTdCN0UyXCIsYm9yZGVyQ29sb3I6XCIjMEI5MEM0XCIsY29sb3I6XCIjRkZGXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkICMwQjkwQzRcIn0pO2JyZWFrO2Nhc2VcInN1Y2Nlc3NcIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCJsaWdodGdyZWVuXCIsYm9yZGVyQ29sb3I6XCIjNTBDMjRFXCIsY29sb3I6XCJkYXJrZ3JlZW5cIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgIzUwQzI0RVwifSk7YnJlYWs7ZGVmYXVsdDp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkZGXCIsYm9yZGVyQ29sb3I6XCIjQ0NDXCIsY29sb3I6XCIjNDQ0XCJ9KX19LGNhbGxiYWNrOntvblNob3c6ZnVuY3Rpb24oKXthLm5vdHkudGhlbWVzLmRlZmF1bHRUaGVtZS5oZWxwZXJzLmJvcmRlckZpeC5hcHBseSh0aGlzKX0sb25DbG9zZTpmdW5jdGlvbigpe2Eubm90eS50aGVtZXMuZGVmYXVsdFRoZW1lLmhlbHBlcnMuYm9yZGVyRml4LmFwcGx5KHRoaXMpfX19LGEubm90eS50aGVtZXMucmVsYXg9e25hbWU6XCJyZWxheFwiLGhlbHBlcnM6e30sbW9kYWw6e2Nzczp7cG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMTAwJVwiLGhlaWdodDpcIjEwMCVcIixiYWNrZ3JvdW5kQ29sb3I6XCIjMDAwXCIsekluZGV4OjFlNCxvcGFjaXR5Oi42LGRpc3BsYXk6XCJub25lXCIsbGVmdDowLHRvcDowfX0sc3R5bGU6ZnVuY3Rpb24oKXtzd2l0Y2godGhpcy4kYmFyLmNzcyh7b3ZlcmZsb3c6XCJoaWRkZW5cIixtYXJnaW46XCI0cHggMFwiLGJvcmRlclJhZGl1czpcIjJweFwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTRweFwiLGxpbmVIZWlnaHQ6XCIxNnB4XCIsdGV4dEFsaWduOlwiY2VudGVyXCIscGFkZGluZzpcIjEwcHhcIix3aWR0aDpcImF1dG9cIixwb3NpdGlvbjpcInJlbGF0aXZlXCJ9KSx0aGlzLiRjbG9zZUJ1dHRvbi5jc3Moe3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6NCxyaWdodDo0LHdpZHRoOjEwLGhlaWdodDoxMCxiYWNrZ3JvdW5kOlwidXJsKGRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQW9BQUFBS0NBUUFBQUFuT3djMkFBQUF4VWxFUVZSNEFSM01QVW9EVVJTQTBlKyt1U2trT3hDM0lBT1dOdGFDSURhQ2hmZ1hCTUVaYlFSQnl4Q3drK0Jhc2dRUlpMU1lvTGdEUWJBUnhyeThueXVtUGNWUktEZmQwQWE4QXNnRHYxenA2cFlkNWpXT3dodmViUlRiek5ORXc1QlNzSXBzai9rdXJRQm5tazdzSUZjQ0Y1eXlaUERSRzZ0clFodWpYWW9zYUZvYysyZjFNSjg5dWM3NklORDZGOUJ2bFhVZHBiNnh3RDIrNHEzbWUzYnlzaUh2dExZclVKdG83UEQvdmU3TE5IeFNnL3dvTjJrU3o0dHhhc0JkaHlpejN1Z1BHZXRUam0zWFJva0FBQUFBU1VWT1JLNUNZSUk9KVwiLGRpc3BsYXk6XCJub25lXCIsY3Vyc29yOlwicG9pbnRlclwifSksdGhpcy4kYnV0dG9ucy5jc3Moe3BhZGRpbmc6NSx0ZXh0QWxpZ246XCJyaWdodFwiLGJvcmRlclRvcDpcIjFweCBzb2xpZCAjY2NjXCIsYmFja2dyb3VuZENvbG9yOlwiI2ZmZlwifSksdGhpcy4kYnV0dG9ucy5maW5kKFwiYnV0dG9uXCIpLmNzcyh7bWFyZ2luTGVmdDo1fSksdGhpcy4kYnV0dG9ucy5maW5kKFwiYnV0dG9uOmZpcnN0XCIpLmNzcyh7bWFyZ2luTGVmdDowfSksdGhpcy4kYmFyLm9uKHttb3VzZWVudGVyOmZ1bmN0aW9uKCl7YSh0aGlzKS5maW5kKFwiLm5vdHlfY2xvc2VcIikuc3RvcCgpLmZhZGVUbyhcIm5vcm1hbFwiLDEpfSxtb3VzZWxlYXZlOmZ1bmN0aW9uKCl7YSh0aGlzKS5maW5kKFwiLm5vdHlfY2xvc2VcIikuc3RvcCgpLmZhZGVUbyhcIm5vcm1hbFwiLDApfX0pLHRoaXMub3B0aW9ucy5sYXlvdXQubmFtZSl7Y2FzZVwidG9wXCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyQm90dG9tOlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJMZWZ0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJSaWdodDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyVG9wOlwiMnB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KTticmVhaztjYXNlXCJ0b3BDZW50ZXJcIjpjYXNlXCJjZW50ZXJcIjpjYXNlXCJib3R0b21DZW50ZXJcIjpjYXNlXCJpbmxpbmVcIjp0aGlzLiRiYXIuY3NzKHtib3JkZXI6XCIxcHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjEzcHhcIix0ZXh0QWxpZ246XCJjZW50ZXJcIn0pO2JyZWFrO2Nhc2VcInRvcExlZnRcIjpjYXNlXCJ0b3BSaWdodFwiOmNhc2VcImJvdHRvbUxlZnRcIjpjYXNlXCJib3R0b21SaWdodFwiOmNhc2VcImNlbnRlckxlZnRcIjpjYXNlXCJjZW50ZXJSaWdodFwiOnRoaXMuJGJhci5jc3Moe2JvcmRlcjpcIjFweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTNweFwiLHRleHRBbGlnbjpcImxlZnRcIn0pO2JyZWFrO2Nhc2VcImJvdHRvbVwiOnRoaXMuJGJhci5jc3Moe2JvcmRlclRvcDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyTGVmdDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyUmlnaHQ6XCIycHggc29saWQgI2VlZVwiLGJvcmRlckJvdHRvbTpcIjJweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAtMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pO2JyZWFrO2RlZmF1bHQ6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyOlwiMnB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KX1zd2l0Y2godGhpcy5vcHRpb25zLnR5cGUpe2Nhc2VcImFsZXJ0XCI6Y2FzZVwibm90aWZpY2F0aW9uXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGRlwiLGJvcmRlckNvbG9yOlwiI2RlZGVkZVwiLGNvbG9yOlwiIzQ0NFwifSk7YnJlYWs7Y2FzZVwid2FybmluZ1wiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkVBQThcIixib3JkZXJDb2xvcjpcIiNGRkMyMzdcIixjb2xvcjpcIiM4MjYyMDBcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgI0ZGQzIzN1wifSk7YnJlYWs7Y2FzZVwiZXJyb3JcIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkY4MTgxXCIsYm9yZGVyQ29sb3I6XCIjZTI1MzUzXCIsY29sb3I6XCIjRkZGXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFdlaWdodDpcImJvbGRcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgZGFya3JlZFwifSk7YnJlYWs7Y2FzZVwiaW5mb3JtYXRpb25cIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjNzhDNUU3XCIsYm9yZGVyQ29sb3I6XCIjM2JhZGQ2XCIsY29sb3I6XCIjRkZGXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkICMwQjkwQzRcIn0pO2JyZWFrO2Nhc2VcInN1Y2Nlc3NcIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjQkNGNUJDXCIsYm9yZGVyQ29sb3I6XCIjN2NkZDc3XCIsY29sb3I6XCJkYXJrZ3JlZW5cIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgIzUwQzI0RVwifSk7YnJlYWs7ZGVmYXVsdDp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkZGXCIsYm9yZGVyQ29sb3I6XCIjQ0NDXCIsY29sb3I6XCIjNDQ0XCJ9KX19LGNhbGxiYWNrOntvblNob3c6ZnVuY3Rpb24oKXt9LG9uQ2xvc2U6ZnVuY3Rpb24oKXt9fX0sd2luZG93Lm5vdHl9KTsiLCJqUXVlcnkoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XHJcblx0Ly9jYWNoZSBET00gZWxlbWVudHNcclxuXHR2YXIgbWFpbkNvbnRlbnQgPSAkKCcuY2QtbWFpbi1jb250ZW50JyksXHJcblx0XHRoZWFkZXIgPSAkKCcuY2QtbWFpbi1oZWFkZXInKSxcclxuXHRcdHNpZGViYXIgPSAkKCcuY2Qtc2lkZS1uYXYnKSxcclxuXHRcdHNpZGViYXJUcmlnZ2VyID0gJCgnLmNkLW5hdi10cmlnZ2VyJyksXHJcblx0XHR0b3BOYXZpZ2F0aW9uID0gJCgnLmNkLXRvcC1uYXYnKSxcclxuXHRcdHNlYXJjaEZvcm0gPSAkKCcuY2Qtc2VhcmNoJyksXHJcblx0XHRhY2NvdW50SW5mbyA9ICQoJy5hY2NvdW50Jyk7XHJcblxyXG5cdC8vb24gcmVzaXplLCBtb3ZlIHNlYXJjaCBhbmQgdG9wIG5hdiBwb3NpdGlvbiBhY2NvcmRpbmcgdG8gd2luZG93IHdpZHRoXHJcblx0dmFyIHJlc2l6aW5nID0gZmFsc2U7XHJcblx0bW92ZU5hdmlnYXRpb24oKTtcclxuXHQkKHdpbmRvdykub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uKCl7XHJcblx0XHRpZiggIXJlc2l6aW5nICkge1xyXG5cdFx0XHQoIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpID8gc2V0VGltZW91dChtb3ZlTmF2aWdhdGlvbiwgMzAwKSA6IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobW92ZU5hdmlnYXRpb24pO1xyXG5cdFx0XHRyZXNpemluZyA9IHRydWU7XHJcblx0XHR9XHJcblx0fSk7XHJcblxyXG5cdC8vb24gd2luZG93IHNjcm9sbGluZyAtIGZpeCBzaWRlYmFyIG5hdlxyXG5cdHZhciBzY3JvbGxpbmcgPSBmYWxzZTtcclxuXHRjaGVja1Njcm9sbGJhclBvc2l0aW9uKCk7XHJcblx0JCh3aW5kb3cpLm9uKCdzY3JvbGwnLCBmdW5jdGlvbigpe1xyXG5cdFx0aWYoICFzY3JvbGxpbmcgKSB7XHJcblx0XHRcdCghd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSkgPyBzZXRUaW1lb3V0KGNoZWNrU2Nyb2xsYmFyUG9zaXRpb24sIDMwMCkgOiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNoZWNrU2Nyb2xsYmFyUG9zaXRpb24pO1xyXG5cdFx0XHRzY3JvbGxpbmcgPSB0cnVlO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG5cclxuXHQvL21vYmlsZSBvbmx5IC0gb3BlbiBzaWRlYmFyIHdoZW4gdXNlciBjbGlja3MgdGhlIGhhbWJ1cmdlciBtZW51XHJcblx0c2lkZWJhclRyaWdnZXIub24oJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpe1xyXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdCQoW3NpZGViYXIsIHNpZGViYXJUcmlnZ2VyXSkudG9nZ2xlQ2xhc3MoJ25hdi1pcy12aXNpYmxlJyk7XHJcblx0fSk7XHJcblxyXG5cdC8vY2xpY2sgb24gaXRlbSBhbmQgc2hvdyBzdWJtZW51XHJcblx0JCgnLmhhcy1jaGlsZHJlbiA+IGEnKS5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCl7XHJcblx0XHR2YXIgbXEgPSBjaGVja01RKCksXHJcblx0XHRcdHNlbGVjdGVkSXRlbSA9ICQodGhpcyk7XHJcblx0XHRpZiggbXEgPT0gJ21vYmlsZScgfHwgbXEgPT0gJ3RhYmxldCcgKSB7XHJcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdGlmKCBzZWxlY3RlZEl0ZW0ucGFyZW50KCdsaScpLmhhc0NsYXNzKCdzZWxlY3RlZCcpKSB7XHJcblx0XHRcdFx0c2VsZWN0ZWRJdGVtLnBhcmVudCgnbGknKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRzaWRlYmFyLmZpbmQoJy5oYXMtY2hpbGRyZW4uc2VsZWN0ZWQnKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcclxuXHRcdFx0XHRhY2NvdW50SW5mby5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcclxuXHRcdFx0XHRzZWxlY3RlZEl0ZW0ucGFyZW50KCdsaScpLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSk7XHJcblxyXG5cdC8vY2xpY2sgb24gYWNjb3VudCBhbmQgc2hvdyBzdWJtZW51IC0gZGVza3RvcCB2ZXJzaW9uIG9ubHlcclxuXHRhY2NvdW50SW5mby5jaGlsZHJlbignYScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KXtcclxuXHRcdHZhciBtcSA9IGNoZWNrTVEoKSxcclxuXHRcdFx0c2VsZWN0ZWRJdGVtID0gJCh0aGlzKTtcclxuXHRcdGlmKCBtcSA9PSAnZGVza3RvcCcpIHtcclxuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0YWNjb3VudEluZm8udG9nZ2xlQ2xhc3MoJ3NlbGVjdGVkJyk7XHJcblx0XHRcdHNpZGViYXIuZmluZCgnLmhhcy1jaGlsZHJlbi5zZWxlY3RlZCcpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG5cclxuXHQkKGRvY3VtZW50KS5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCl7XHJcblx0XHRpZiggISQoZXZlbnQudGFyZ2V0KS5pcygnLmhhcy1jaGlsZHJlbiBhJykgKSB7XHJcblx0XHRcdHNpZGViYXIuZmluZCgnLmhhcy1jaGlsZHJlbi5zZWxlY3RlZCcpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xyXG5cdFx0XHRhY2NvdW50SW5mby5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcclxuXHRcdH1cclxuXHR9KTtcclxuXHJcblx0Ly9vbiBkZXNrdG9wIC0gZGlmZmVyZW50aWF0ZSBiZXR3ZWVuIGEgdXNlciB0cnlpbmcgdG8gaG92ZXIgb3ZlciBhIGRyb3Bkb3duIGl0ZW0gdnMgdHJ5aW5nIHRvIG5hdmlnYXRlIGludG8gYSBzdWJtZW51J3MgY29udGVudHNcclxuXHRzaWRlYmFyLmNoaWxkcmVuKCd1bCcpLm1lbnVBaW0oe1xyXG4gICAgICAgIGFjdGl2YXRlOiBmdW5jdGlvbihyb3cpIHtcclxuICAgICAgICBcdCQocm93KS5hZGRDbGFzcygnaG92ZXInKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlYWN0aXZhdGU6IGZ1bmN0aW9uKHJvdykge1xyXG4gICAgICAgIFx0JChyb3cpLnJlbW92ZUNsYXNzKCdob3ZlcicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZXhpdE1lbnU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIFx0c2lkZWJhci5maW5kKCcuaG92ZXInKS5yZW1vdmVDbGFzcygnaG92ZXInKTtcclxuICAgICAgICBcdHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3VibWVudVNlbGVjdG9yOiBcIi5oYXMtY2hpbGRyZW5cIixcclxuICAgIH0pO1xyXG5cclxuXHRmdW5jdGlvbiBjaGVja01RKCkge1xyXG5cdFx0Ly9jaGVjayBpZiBtb2JpbGUgb3IgZGVza3RvcCBkZXZpY2VcclxuXHRcdHJldHVybiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY2QtbWFpbi1jb250ZW50JyksICc6OmJlZm9yZScpLmdldFByb3BlcnR5VmFsdWUoJ2NvbnRlbnQnKS5yZXBsYWNlKC8nL2csIFwiXCIpLnJlcGxhY2UoL1wiL2csIFwiXCIpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gbW92ZU5hdmlnYXRpb24oKXtcclxuICBcdFx0dmFyIG1xID0gY2hlY2tNUSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICggbXEgPT0gJ21vYmlsZScgJiYgdG9wTmF2aWdhdGlvbi5wYXJlbnRzKCcuY2Qtc2lkZS1uYXYnKS5sZW5ndGggPT0gMCApIHtcclxuICAgICAgICBcdGRldGFjaEVsZW1lbnRzKCk7XHJcblx0XHRcdHRvcE5hdmlnYXRpb24uYXBwZW5kVG8oc2lkZWJhcik7XHJcblx0XHRcdHNlYXJjaEZvcm0ucmVtb3ZlQ2xhc3MoJ2lzLWhpZGRlbicpLnByZXBlbmRUbyhzaWRlYmFyKTtcclxuXHRcdH0gZWxzZSBpZiAoICggbXEgPT0gJ3RhYmxldCcgfHwgbXEgPT0gJ2Rlc2t0b3AnKSAmJiAgdG9wTmF2aWdhdGlvbi5wYXJlbnRzKCcuY2Qtc2lkZS1uYXYnKS5sZW5ndGggPiAwICkge1xyXG5cdFx0XHRkZXRhY2hFbGVtZW50cygpO1xyXG5cdFx0XHRzZWFyY2hGb3JtLmluc2VydEFmdGVyKGhlYWRlci5maW5kKCcuY2QtbG9nbycpKTtcclxuXHRcdFx0dG9wTmF2aWdhdGlvbi5hcHBlbmRUbyhoZWFkZXIuZmluZCgnLmNkLW5hdicpKTtcclxuXHRcdH1cclxuXHRcdGNoZWNrU2VsZWN0ZWQobXEpO1xyXG5cdFx0cmVzaXppbmcgPSBmYWxzZTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGRldGFjaEVsZW1lbnRzKCkge1xyXG5cdFx0dG9wTmF2aWdhdGlvbi5kZXRhY2goKTtcclxuXHRcdHNlYXJjaEZvcm0uZGV0YWNoKCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjaGVja1NlbGVjdGVkKG1xKSB7XHJcblx0XHQvL29uIGRlc2t0b3AsIHJlbW92ZSBzZWxlY3RlZCBjbGFzcyBmcm9tIGl0ZW1zIHNlbGVjdGVkIG9uIG1vYmlsZS90YWJsZXQgdmVyc2lvblxyXG5cdFx0aWYoIG1xID09ICdkZXNrdG9wJyApICQoJy5oYXMtY2hpbGRyZW4uc2VsZWN0ZWQnKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNoZWNrU2Nyb2xsYmFyUG9zaXRpb24oKSB7XHJcblx0XHR2YXIgbXEgPSBjaGVja01RKCk7XHJcblx0XHRcclxuXHRcdGlmKCBtcSAhPSAnbW9iaWxlJyApIHtcclxuXHRcdFx0dmFyIHNpZGViYXJIZWlnaHQgPSBzaWRlYmFyLm91dGVySGVpZ2h0KCksXHJcblx0XHRcdFx0d2luZG93SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpLFxyXG5cdFx0XHRcdG1haW5Db250ZW50SGVpZ2h0ID0gbWFpbkNvbnRlbnQub3V0ZXJIZWlnaHQoKSxcclxuXHRcdFx0XHRzY3JvbGxUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XHJcblxyXG5cdFx0XHQoICggc2Nyb2xsVG9wICsgd2luZG93SGVpZ2h0ID4gc2lkZWJhckhlaWdodCApICYmICggbWFpbkNvbnRlbnRIZWlnaHQgLSBzaWRlYmFySGVpZ2h0ICE9IDAgKSApID8gc2lkZWJhci5hZGRDbGFzcygnaXMtZml4ZWQnKS5jc3MoJ2JvdHRvbScsIDApIDogc2lkZWJhci5yZW1vdmVDbGFzcygnaXMtZml4ZWQnKS5hdHRyKCdzdHlsZScsICcnKTtcclxuXHRcdH1cclxuXHRcdHNjcm9sbGluZyA9IGZhbHNlO1xyXG5cdH1cclxufSk7IiwiLyohXHJcbiAqIE1vY2tKYXggLSBqUXVlcnkgUGx1Z2luIHRvIE1vY2sgQWpheCByZXF1ZXN0c1xyXG4gKlxyXG4gKiBWZXJzaW9uOiAgMS41LjNcclxuICogUmVsZWFzZWQ6XHJcbiAqIEhvbWU6ICAgaHR0cDovL2dpdGh1Yi5jb20vYXBwZW5kdG8vanF1ZXJ5LW1vY2tqYXhcclxuICogQXV0aG9yOiAgIEpvbmF0aGFuIFNoYXJwIChodHRwOi8vamRzaGFycC5jb20pXHJcbiAqIExpY2Vuc2U6ICBNSVQsR1BMXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAxMSBhcHBlbmRUbyBMTEMuXHJcbiAqIER1YWwgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBvciBHUEwgbGljZW5zZXMuXHJcbiAqIGh0dHA6Ly9hcHBlbmR0by5jb20vb3Blbi1zb3VyY2UtbGljZW5zZXNcclxuICovXHJcbihmdW5jdGlvbigkKSB7XHJcblx0dmFyIF9hamF4ID0gJC5hamF4LFxyXG5cdFx0bW9ja0hhbmRsZXJzID0gW10sXHJcblx0XHRtb2NrZWRBamF4Q2FsbHMgPSBbXSxcclxuXHRcdENBTExCQUNLX1JFR0VYID0gLz1cXD8oJnwkKS8sXHJcblx0XHRqc2MgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpO1xyXG5cclxuXHJcblx0Ly8gUGFyc2UgdGhlIGdpdmVuIFhNTCBzdHJpbmcuXHJcblx0ZnVuY3Rpb24gcGFyc2VYTUwoeG1sKSB7XHJcblx0XHRpZiAoIHdpbmRvdy5ET01QYXJzZXIgPT0gdW5kZWZpbmVkICYmIHdpbmRvdy5BY3RpdmVYT2JqZWN0ICkge1xyXG5cdFx0XHRET01QYXJzZXIgPSBmdW5jdGlvbigpIHsgfTtcclxuXHRcdFx0RE9NUGFyc2VyLnByb3RvdHlwZS5wYXJzZUZyb21TdHJpbmcgPSBmdW5jdGlvbiggeG1sU3RyaW5nICkge1xyXG5cdFx0XHRcdHZhciBkb2MgPSBuZXcgQWN0aXZlWE9iamVjdCgnTWljcm9zb2Z0LlhNTERPTScpO1xyXG5cdFx0XHRcdGRvYy5hc3luYyA9ICdmYWxzZSc7XHJcblx0XHRcdFx0ZG9jLmxvYWRYTUwoIHhtbFN0cmluZyApO1xyXG5cdFx0XHRcdHJldHVybiBkb2M7XHJcblx0XHRcdH07XHJcblx0XHR9XHJcblxyXG5cdFx0dHJ5IHtcclxuXHRcdFx0dmFyIHhtbERvYyA9ICggbmV3IERPTVBhcnNlcigpICkucGFyc2VGcm9tU3RyaW5nKCB4bWwsICd0ZXh0L3htbCcgKTtcclxuXHRcdFx0aWYgKCAkLmlzWE1MRG9jKCB4bWxEb2MgKSApIHtcclxuXHRcdFx0XHR2YXIgZXJyID0gJCgncGFyc2VyZXJyb3InLCB4bWxEb2MpO1xyXG5cdFx0XHRcdGlmICggZXJyLmxlbmd0aCA9PSAxICkge1xyXG5cdFx0XHRcdFx0dGhyb3coJ0Vycm9yOiAnICsgJCh4bWxEb2MpLnRleHQoKSApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aHJvdygnVW5hYmxlIHRvIHBhcnNlIFhNTCcpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB4bWxEb2M7XHJcblx0XHR9IGNhdGNoKCBlICkge1xyXG5cdFx0XHR2YXIgbXNnID0gKCBlLm5hbWUgPT0gdW5kZWZpbmVkID8gZSA6IGUubmFtZSArICc6ICcgKyBlLm1lc3NhZ2UgKTtcclxuXHRcdFx0JChkb2N1bWVudCkudHJpZ2dlcigneG1sUGFyc2VFcnJvcicsIFsgbXNnIF0pO1xyXG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gVHJpZ2dlciBhIGpRdWVyeSBldmVudFxyXG5cdGZ1bmN0aW9uIHRyaWdnZXIocywgdHlwZSwgYXJncykge1xyXG5cdFx0KHMuY29udGV4dCA/ICQocy5jb250ZXh0KSA6ICQuZXZlbnQpLnRyaWdnZXIodHlwZSwgYXJncyk7XHJcblx0fVxyXG5cclxuXHQvLyBDaGVjayBpZiB0aGUgZGF0YSBmaWVsZCBvbiB0aGUgbW9jayBoYW5kbGVyIGFuZCB0aGUgcmVxdWVzdCBtYXRjaC4gVGhpc1xyXG5cdC8vIGNhbiBiZSB1c2VkIHRvIHJlc3RyaWN0IGEgbW9jayBoYW5kbGVyIHRvIGJlaW5nIHVzZWQgb25seSB3aGVuIGEgY2VydGFpblxyXG5cdC8vIHNldCBvZiBkYXRhIGlzIHBhc3NlZCB0byBpdC5cclxuXHRmdW5jdGlvbiBpc01vY2tEYXRhRXF1YWwoIG1vY2ssIGxpdmUgKSB7XHJcblx0XHR2YXIgaWRlbnRpY2FsID0gdHJ1ZTtcclxuXHRcdC8vIFRlc3QgZm9yIHNpdHVhdGlvbnMgd2hlcmUgdGhlIGRhdGEgaXMgYSBxdWVyeXN0cmluZyAobm90IGFuIG9iamVjdClcclxuXHRcdGlmICh0eXBlb2YgbGl2ZSA9PT0gJ3N0cmluZycpIHtcclxuXHRcdFx0Ly8gUXVlcnlzdHJpbmcgbWF5IGJlIGEgcmVnZXhcclxuXHRcdFx0cmV0dXJuICQuaXNGdW5jdGlvbiggbW9jay50ZXN0ICkgPyBtb2NrLnRlc3QobGl2ZSkgOiBtb2NrID09IGxpdmU7XHJcblx0XHR9XHJcblx0XHQkLmVhY2gobW9jaywgZnVuY3Rpb24oaykge1xyXG5cdFx0XHRpZiAoIGxpdmVba10gPT09IHVuZGVmaW5lZCApIHtcclxuXHRcdFx0XHRpZGVudGljYWwgPSBmYWxzZTtcclxuXHRcdFx0XHRyZXR1cm4gaWRlbnRpY2FsO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmICggdHlwZW9mIGxpdmVba10gPT09ICdvYmplY3QnICYmIGxpdmVba10gIT09IG51bGwgKSB7XHJcblx0XHRcdFx0XHRpZiAoIGlkZW50aWNhbCAmJiAkLmlzQXJyYXkoIGxpdmVba10gKSApIHtcclxuXHRcdFx0XHRcdFx0aWRlbnRpY2FsID0gJC5pc0FycmF5KCBtb2NrW2tdICkgJiYgbGl2ZVtrXS5sZW5ndGggPT09IG1vY2tba10ubGVuZ3RoO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWRlbnRpY2FsID0gaWRlbnRpY2FsICYmIGlzTW9ja0RhdGFFcXVhbChtb2NrW2tdLCBsaXZlW2tdKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0aWYgKCBtb2NrW2tdICYmICQuaXNGdW5jdGlvbiggbW9ja1trXS50ZXN0ICkgKSB7XHJcblx0XHRcdFx0XHRcdGlkZW50aWNhbCA9IGlkZW50aWNhbCAmJiBtb2NrW2tdLnRlc3QobGl2ZVtrXSk7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRpZGVudGljYWwgPSBpZGVudGljYWwgJiYgKCBtb2NrW2tdID09IGxpdmVba10gKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdHJldHVybiBpZGVudGljYWw7XHJcblx0fVxyXG5cclxuICAgIC8vIFNlZSBpZiBhIG1vY2sgaGFuZGxlciBwcm9wZXJ0eSBtYXRjaGVzIHRoZSBkZWZhdWx0IHNldHRpbmdzXHJcbiAgICBmdW5jdGlvbiBpc0RlZmF1bHRTZXR0aW5nKGhhbmRsZXIsIHByb3BlcnR5KSB7XHJcbiAgICAgICAgcmV0dXJuIGhhbmRsZXJbcHJvcGVydHldID09PSAkLm1vY2tqYXhTZXR0aW5nc1twcm9wZXJ0eV07XHJcbiAgICB9XHJcblxyXG5cdC8vIENoZWNrIHRoZSBnaXZlbiBoYW5kbGVyIHNob3VsZCBtb2NrIHRoZSBnaXZlbiByZXF1ZXN0XHJcblx0ZnVuY3Rpb24gZ2V0TW9ja0ZvclJlcXVlc3QoIGhhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncyApIHtcclxuXHRcdC8vIElmIHRoZSBtb2NrIHdhcyByZWdpc3RlcmVkIHdpdGggYSBmdW5jdGlvbiwgbGV0IHRoZSBmdW5jdGlvbiBkZWNpZGUgaWYgd2VcclxuXHRcdC8vIHdhbnQgdG8gbW9jayB0aGlzIHJlcXVlc3RcclxuXHRcdGlmICggJC5pc0Z1bmN0aW9uKGhhbmRsZXIpICkge1xyXG5cdFx0XHRyZXR1cm4gaGFuZGxlciggcmVxdWVzdFNldHRpbmdzICk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gSW5zcGVjdCB0aGUgVVJMIG9mIHRoZSByZXF1ZXN0IGFuZCBjaGVjayBpZiB0aGUgbW9jayBoYW5kbGVyJ3MgdXJsXHJcblx0XHQvLyBtYXRjaGVzIHRoZSB1cmwgZm9yIHRoaXMgYWpheCByZXF1ZXN0XHJcblx0XHRpZiAoICQuaXNGdW5jdGlvbihoYW5kbGVyLnVybC50ZXN0KSApIHtcclxuXHRcdFx0Ly8gVGhlIHVzZXIgcHJvdmlkZWQgYSByZWdleCBmb3IgdGhlIHVybCwgdGVzdCBpdFxyXG5cdFx0XHRpZiAoICFoYW5kbGVyLnVybC50ZXN0KCByZXF1ZXN0U2V0dGluZ3MudXJsICkgKSB7XHJcblx0XHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIExvb2sgZm9yIGEgc2ltcGxlIHdpbGRjYXJkICcqJyBvciBhIGRpcmVjdCBVUkwgbWF0Y2hcclxuXHRcdFx0dmFyIHN0YXIgPSBoYW5kbGVyLnVybC5pbmRleE9mKCcqJyk7XHJcblx0XHRcdGlmIChoYW5kbGVyLnVybCAhPT0gcmVxdWVzdFNldHRpbmdzLnVybCAmJiBzdGFyID09PSAtMSB8fFxyXG5cdFx0XHRcdFx0IW5ldyBSZWdFeHAoaGFuZGxlci51cmwucmVwbGFjZSgvWy1bXFxde30oKSs/LixcXFxcXiR8I1xcc10vZywgXCJcXFxcJCZcIikucmVwbGFjZSgvXFwqL2csICcuKycpKS50ZXN0KHJlcXVlc3RTZXR0aW5ncy51cmwpKSB7XHJcblx0XHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvLyBJbnNwZWN0IHRoZSBkYXRhIHN1Ym1pdHRlZCBpbiB0aGUgcmVxdWVzdCAoZWl0aGVyIFBPU1QgYm9keSBvciBHRVQgcXVlcnkgc3RyaW5nKVxyXG5cdFx0aWYgKCBoYW5kbGVyLmRhdGEgKSB7XHJcblx0XHRcdGlmICggISByZXF1ZXN0U2V0dGluZ3MuZGF0YSB8fCAhaXNNb2NrRGF0YUVxdWFsKGhhbmRsZXIuZGF0YSwgcmVxdWVzdFNldHRpbmdzLmRhdGEpICkge1xyXG5cdFx0XHRcdC8vIFRoZXkncmUgbm90IGlkZW50aWNhbCwgZG8gbm90IG1vY2sgdGhpcyByZXF1ZXN0XHJcblx0XHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8vIEluc3BlY3QgdGhlIHJlcXVlc3QgdHlwZVxyXG5cdFx0aWYgKCBoYW5kbGVyICYmIGhhbmRsZXIudHlwZSAmJlxyXG5cdFx0XHRcdGhhbmRsZXIudHlwZS50b0xvd2VyQ2FzZSgpICE9IHJlcXVlc3RTZXR0aW5ncy50eXBlLnRvTG93ZXJDYXNlKCkgKSB7XHJcblx0XHRcdC8vIFRoZSByZXF1ZXN0IHR5cGUgZG9lc24ndCBtYXRjaCAoR0VUIHZzLiBQT1NUKVxyXG5cdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gaGFuZGxlcjtcclxuXHR9XHJcblxyXG5cdC8vIFByb2Nlc3MgdGhlIHhociBvYmplY3RzIHNlbmQgb3BlcmF0aW9uXHJcblx0ZnVuY3Rpb24gX3hoclNlbmQobW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncywgb3JpZ1NldHRpbmdzKSB7XHJcblxyXG5cdFx0Ly8gVGhpcyBpcyBhIHN1YnN0aXR1dGUgZm9yIDwgMS40IHdoaWNoIGxhY2tzICQucHJveHlcclxuXHRcdHZhciBwcm9jZXNzID0gKGZ1bmN0aW9uKHRoYXQpIHtcclxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHJldHVybiAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHR2YXIgb25SZWFkeTtcclxuXHJcblx0XHRcdFx0XHQvLyBUaGUgcmVxdWVzdCBoYXMgcmV0dXJuZWRcclxuXHRcdFx0XHRcdHRoaXMuc3RhdHVzICAgICA9IG1vY2tIYW5kbGVyLnN0YXR1cztcclxuXHRcdFx0XHRcdHRoaXMuc3RhdHVzVGV4dCA9IG1vY2tIYW5kbGVyLnN0YXR1c1RleHQ7XHJcblx0XHRcdFx0XHR0aGlzLnJlYWR5U3RhdGVcdD0gNDtcclxuXHJcblx0XHRcdFx0XHQvLyBXZSBoYXZlIGFuIGV4ZWN1dGFibGUgZnVuY3Rpb24sIGNhbGwgaXQgdG8gZ2l2ZVxyXG5cdFx0XHRcdFx0Ly8gdGhlIG1vY2sgaGFuZGxlciBhIGNoYW5jZSB0byB1cGRhdGUgaXQncyBkYXRhXHJcblx0XHRcdFx0XHRpZiAoICQuaXNGdW5jdGlvbihtb2NrSGFuZGxlci5yZXNwb25zZSkgKSB7XHJcblx0XHRcdFx0XHRcdG1vY2tIYW5kbGVyLnJlc3BvbnNlKG9yaWdTZXR0aW5ncyk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvLyBDb3B5IG92ZXIgb3VyIG1vY2sgdG8gb3VyIHhociBvYmplY3QgYmVmb3JlIHBhc3NpbmcgY29udHJvbCBiYWNrIHRvXHJcblx0XHRcdFx0XHQvLyBqUXVlcnkncyBvbnJlYWR5c3RhdGVjaGFuZ2UgY2FsbGJhY2tcclxuXHRcdFx0XHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlID09ICdqc29uJyAmJiAoIHR5cGVvZiBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgPT0gJ29iamVjdCcgKSApIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5yZXNwb25zZVRleHQgPSBKU09OLnN0cmluZ2lmeShtb2NrSGFuZGxlci5yZXNwb25zZVRleHQpO1xyXG5cdFx0XHRcdFx0fSBlbHNlIGlmICggcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlID09ICd4bWwnICkge1xyXG5cdFx0XHRcdFx0XHRpZiAoIHR5cGVvZiBtb2NrSGFuZGxlci5yZXNwb25zZVhNTCA9PSAnc3RyaW5nJyApIHtcclxuXHRcdFx0XHRcdFx0XHR0aGlzLnJlc3BvbnNlWE1MID0gcGFyc2VYTUwobW9ja0hhbmRsZXIucmVzcG9uc2VYTUwpO1xyXG5cdFx0XHRcdFx0XHRcdC8vaW4galF1ZXJ5IDEuOS4xKywgcmVzcG9uc2VYTUwgaXMgcHJvY2Vzc2VkIGRpZmZlcmVudGx5IGFuZCByZWxpZXMgb24gcmVzcG9uc2VUZXh0XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5yZXNwb25zZVRleHQgPSBtb2NrSGFuZGxlci5yZXNwb25zZVhNTDtcclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHR0aGlzLnJlc3BvbnNlWE1MID0gbW9ja0hhbmRsZXIucmVzcG9uc2VYTUw7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2VUZXh0ID0gbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0O1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWYoIHR5cGVvZiBtb2NrSGFuZGxlci5zdGF0dXMgPT0gJ251bWJlcicgfHwgdHlwZW9mIG1vY2tIYW5kbGVyLnN0YXR1cyA9PSAnc3RyaW5nJyApIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5zdGF0dXMgPSBtb2NrSGFuZGxlci5zdGF0dXM7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZiggdHlwZW9mIG1vY2tIYW5kbGVyLnN0YXR1c1RleHQgPT09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5zdGF0dXNUZXh0ID0gbW9ja0hhbmRsZXIuc3RhdHVzVGV4dDtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8vIGpRdWVyeSAyLjAgcmVuYW1lZCBvbnJlYWR5c3RhdGVjaGFuZ2UgdG8gb25sb2FkXHJcblx0XHRcdFx0XHRvblJlYWR5ID0gdGhpcy5vbnJlYWR5c3RhdGVjaGFuZ2UgfHwgdGhpcy5vbmxvYWQ7XHJcblxyXG5cdFx0XHRcdFx0Ly8galF1ZXJ5IDwgMS40IGRvZXNuJ3QgaGF2ZSBvbnJlYWR5c3RhdGUgY2hhbmdlIGZvciB4aHJcclxuXHRcdFx0XHRcdGlmICggJC5pc0Z1bmN0aW9uKCBvblJlYWR5ICkgKSB7XHJcblx0XHRcdFx0XHRcdGlmKCBtb2NrSGFuZGxlci5pc1RpbWVvdXQpIHtcclxuXHRcdFx0XHRcdFx0XHR0aGlzLnN0YXR1cyA9IC0xO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdG9uUmVhZHkuY2FsbCggdGhpcywgbW9ja0hhbmRsZXIuaXNUaW1lb3V0ID8gJ3RpbWVvdXQnIDogdW5kZWZpbmVkICk7XHJcblx0XHRcdFx0XHR9IGVsc2UgaWYgKCBtb2NrSGFuZGxlci5pc1RpbWVvdXQgKSB7XHJcblx0XHRcdFx0XHRcdC8vIEZpeCBmb3IgMS4zLjIgdGltZW91dCB0byBrZWVwIHN1Y2Nlc3MgZnJvbSBmaXJpbmcuXHJcblx0XHRcdFx0XHRcdHRoaXMuc3RhdHVzID0gLTE7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSkuYXBwbHkodGhhdCk7XHJcblx0XHRcdH07XHJcblx0XHR9KSh0aGlzKTtcclxuXHJcblx0XHRpZiAoIG1vY2tIYW5kbGVyLnByb3h5ICkge1xyXG5cdFx0XHQvLyBXZSdyZSBwcm94eWluZyB0aGlzIHJlcXVlc3QgYW5kIGxvYWRpbmcgaW4gYW4gZXh0ZXJuYWwgZmlsZSBpbnN0ZWFkXHJcblx0XHRcdF9hamF4KHtcclxuXHRcdFx0XHRnbG9iYWw6IGZhbHNlLFxyXG5cdFx0XHRcdHVybDogbW9ja0hhbmRsZXIucHJveHksXHJcblx0XHRcdFx0dHlwZTogbW9ja0hhbmRsZXIucHJveHlUeXBlLFxyXG5cdFx0XHRcdGRhdGE6IG1vY2tIYW5kbGVyLmRhdGEsXHJcblx0XHRcdFx0ZGF0YVR5cGU6IHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSA9PT0gXCJzY3JpcHRcIiA/IFwidGV4dC9wbGFpblwiIDogcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlLFxyXG5cdFx0XHRcdGNvbXBsZXRlOiBmdW5jdGlvbih4aHIpIHtcclxuXHRcdFx0XHRcdG1vY2tIYW5kbGVyLnJlc3BvbnNlWE1MID0geGhyLnJlc3BvbnNlWE1MO1xyXG5cdFx0XHRcdFx0bW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ID0geGhyLnJlc3BvbnNlVGV4dDtcclxuICAgICAgICAgICAgICAgICAgICAvLyBEb24ndCBvdmVycmlkZSB0aGUgaGFuZGxlciBzdGF0dXMvc3RhdHVzVGV4dCBpZiBpdCdzIHNwZWNpZmllZCBieSB0aGUgY29uZmlnXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzRGVmYXVsdFNldHRpbmcobW9ja0hhbmRsZXIsICdzdGF0dXMnKSkge1xyXG5cdFx0XHRcdFx0ICAgIG1vY2tIYW5kbGVyLnN0YXR1cyA9IHhoci5zdGF0dXM7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0RlZmF1bHRTZXR0aW5nKG1vY2tIYW5kbGVyLCAnc3RhdHVzVGV4dCcpKSB7XHJcblx0XHRcdFx0XHQgICAgbW9ja0hhbmRsZXIuc3RhdHVzVGV4dCA9IHhoci5zdGF0dXNUZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcblx0XHRcdFx0XHR0aGlzLnJlc3BvbnNlVGltZXIgPSBzZXRUaW1lb3V0KHByb2Nlc3MsIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGltZSB8fCAwKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gdHlwZSA9PSAnUE9TVCcgfHwgJ0dFVCcgfHwgJ0RFTEVURSdcclxuXHRcdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuYXN5bmMgPT09IGZhbHNlICkge1xyXG5cdFx0XHRcdC8vIFRPRE86IEJsb2NraW5nIGRlbGF5XHJcblx0XHRcdFx0cHJvY2VzcygpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMucmVzcG9uc2VUaW1lciA9IHNldFRpbWVvdXQocHJvY2VzcywgbW9ja0hhbmRsZXIucmVzcG9uc2VUaW1lIHx8IDUwKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gQ29uc3RydWN0IGEgbW9ja2VkIFhIUiBPYmplY3RcclxuXHRmdW5jdGlvbiB4aHIobW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncywgb3JpZ1NldHRpbmdzLCBvcmlnSGFuZGxlcikge1xyXG5cdFx0Ly8gRXh0ZW5kIHdpdGggb3VyIGRlZmF1bHQgbW9ja2pheCBzZXR0aW5nc1xyXG5cdFx0bW9ja0hhbmRsZXIgPSAkLmV4dGVuZCh0cnVlLCB7fSwgJC5tb2NramF4U2V0dGluZ3MsIG1vY2tIYW5kbGVyKTtcclxuXHJcblx0XHRpZiAodHlwZW9mIG1vY2tIYW5kbGVyLmhlYWRlcnMgPT09ICd1bmRlZmluZWQnKSB7XHJcblx0XHRcdG1vY2tIYW5kbGVyLmhlYWRlcnMgPSB7fTtcclxuXHRcdH1cclxuXHRcdGlmICggbW9ja0hhbmRsZXIuY29udGVudFR5cGUgKSB7XHJcblx0XHRcdG1vY2tIYW5kbGVyLmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddID0gbW9ja0hhbmRsZXIuY29udGVudFR5cGU7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0c3RhdHVzOiBtb2NrSGFuZGxlci5zdGF0dXMsXHJcblx0XHRcdHN0YXR1c1RleHQ6IG1vY2tIYW5kbGVyLnN0YXR1c1RleHQsXHJcblx0XHRcdHJlYWR5U3RhdGU6IDEsXHJcblx0XHRcdG9wZW46IGZ1bmN0aW9uKCkgeyB9LFxyXG5cdFx0XHRzZW5kOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRvcmlnSGFuZGxlci5maXJlZCA9IHRydWU7XHJcblx0XHRcdFx0X3hoclNlbmQuY2FsbCh0aGlzLCBtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRhYm9ydDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHRoaXMucmVzcG9uc2VUaW1lcik7XHJcblx0XHRcdH0sXHJcblx0XHRcdHNldFJlcXVlc3RIZWFkZXI6IGZ1bmN0aW9uKGhlYWRlciwgdmFsdWUpIHtcclxuXHRcdFx0XHRtb2NrSGFuZGxlci5oZWFkZXJzW2hlYWRlcl0gPSB2YWx1ZTtcclxuXHRcdFx0fSxcclxuXHRcdFx0Z2V0UmVzcG9uc2VIZWFkZXI6IGZ1bmN0aW9uKGhlYWRlcikge1xyXG5cdFx0XHRcdC8vICdMYXN0LW1vZGlmaWVkJywgJ0V0YWcnLCAnY29udGVudC10eXBlJyBhcmUgYWxsIGNoZWNrZWQgYnkgalF1ZXJ5XHJcblx0XHRcdFx0aWYgKCBtb2NrSGFuZGxlci5oZWFkZXJzICYmIG1vY2tIYW5kbGVyLmhlYWRlcnNbaGVhZGVyXSApIHtcclxuXHRcdFx0XHRcdC8vIFJldHVybiBhcmJpdHJhcnkgaGVhZGVyc1xyXG5cdFx0XHRcdFx0cmV0dXJuIG1vY2tIYW5kbGVyLmhlYWRlcnNbaGVhZGVyXTtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKCBoZWFkZXIudG9Mb3dlckNhc2UoKSA9PSAnbGFzdC1tb2RpZmllZCcgKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gbW9ja0hhbmRsZXIubGFzdE1vZGlmaWVkIHx8IChuZXcgRGF0ZSgpKS50b1N0cmluZygpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAoIGhlYWRlci50b0xvd2VyQ2FzZSgpID09ICdldGFnJyApIHtcclxuXHRcdFx0XHRcdHJldHVybiBtb2NrSGFuZGxlci5ldGFnIHx8ICcnO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAoIGhlYWRlci50b0xvd2VyQ2FzZSgpID09ICdjb250ZW50LXR5cGUnICkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIG1vY2tIYW5kbGVyLmNvbnRlbnRUeXBlIHx8ICd0ZXh0L3BsYWluJztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sXHJcblx0XHRcdGdldEFsbFJlc3BvbnNlSGVhZGVyczogZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0dmFyIGhlYWRlcnMgPSAnJztcclxuXHRcdFx0XHQkLmVhY2gobW9ja0hhbmRsZXIuaGVhZGVycywgZnVuY3Rpb24oaywgdikge1xyXG5cdFx0XHRcdFx0aGVhZGVycyArPSBrICsgJzogJyArIHYgKyBcIlxcblwiO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdHJldHVybiBoZWFkZXJzO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0Ly8gUHJvY2VzcyBhIEpTT05QIG1vY2sgcmVxdWVzdC5cclxuXHRmdW5jdGlvbiBwcm9jZXNzSnNvbnBNb2NrKCByZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MgKSB7XHJcblx0XHQvLyBIYW5kbGUgSlNPTlAgUGFyYW1ldGVyIENhbGxiYWNrcywgd2UgbmVlZCB0byByZXBsaWNhdGUgc29tZSBvZiB0aGUgalF1ZXJ5IGNvcmUgaGVyZVxyXG5cdFx0Ly8gYmVjYXVzZSB0aGVyZSBpc24ndCBhbiBlYXN5IGhvb2sgZm9yIHRoZSBjcm9zcyBkb21haW4gc2NyaXB0IHRhZyBvZiBqc29ucFxyXG5cclxuXHRcdHByb2Nlc3NKc29ucFVybCggcmVxdWVzdFNldHRpbmdzICk7XHJcblxyXG5cdFx0cmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlID0gXCJqc29uXCI7XHJcblx0XHRpZihyZXF1ZXN0U2V0dGluZ3MuZGF0YSAmJiBDQUxMQkFDS19SRUdFWC50ZXN0KHJlcXVlc3RTZXR0aW5ncy5kYXRhKSB8fCBDQUxMQkFDS19SRUdFWC50ZXN0KHJlcXVlc3RTZXR0aW5ncy51cmwpKSB7XHJcblx0XHRcdGNyZWF0ZUpzb25wQ2FsbGJhY2socmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzKTtcclxuXHJcblx0XHRcdC8vIFdlIG5lZWQgdG8gbWFrZSBzdXJlXHJcblx0XHRcdC8vIHRoYXQgYSBKU09OUCBzdHlsZSByZXNwb25zZSBpcyBleGVjdXRlZCBwcm9wZXJseVxyXG5cclxuXHRcdFx0dmFyIHJ1cmwgPSAvXihcXHcrOik/XFwvXFwvKFteXFwvPyNdKykvLFxyXG5cdFx0XHRcdHBhcnRzID0gcnVybC5leGVjKCByZXF1ZXN0U2V0dGluZ3MudXJsICksXHJcblx0XHRcdFx0cmVtb3RlID0gcGFydHMgJiYgKHBhcnRzWzFdICYmIHBhcnRzWzFdICE9PSBsb2NhdGlvbi5wcm90b2NvbCB8fCBwYXJ0c1syXSAhPT0gbG9jYXRpb24uaG9zdCk7XHJcblxyXG5cdFx0XHRyZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgPSBcInNjcmlwdFwiO1xyXG5cdFx0XHRpZihyZXF1ZXN0U2V0dGluZ3MudHlwZS50b1VwcGVyQ2FzZSgpID09PSBcIkdFVFwiICYmIHJlbW90ZSApIHtcclxuXHRcdFx0XHR2YXIgbmV3TW9ja1JldHVybiA9IHByb2Nlc3NKc29ucFJlcXVlc3QoIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyApO1xyXG5cclxuXHRcdFx0XHQvLyBDaGVjayBpZiB3ZSBhcmUgc3VwcG9zZWQgdG8gcmV0dXJuIGEgRGVmZXJyZWQgYmFjayB0byB0aGUgbW9jayBjYWxsLCBvciBqdXN0XHJcblx0XHRcdFx0Ly8gc2lnbmFsIHN1Y2Nlc3NcclxuXHRcdFx0XHRpZihuZXdNb2NrUmV0dXJuKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gbmV3TW9ja1JldHVybjtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gbnVsbDtcclxuXHR9XHJcblxyXG5cdC8vIEFwcGVuZCB0aGUgcmVxdWlyZWQgY2FsbGJhY2sgcGFyYW1ldGVyIHRvIHRoZSBlbmQgb2YgdGhlIHJlcXVlc3QgVVJMLCBmb3IgYSBKU09OUCByZXF1ZXN0XHJcblx0ZnVuY3Rpb24gcHJvY2Vzc0pzb25wVXJsKCByZXF1ZXN0U2V0dGluZ3MgKSB7XHJcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy50eXBlLnRvVXBwZXJDYXNlKCkgPT09IFwiR0VUXCIgKSB7XHJcblx0XHRcdGlmICggIUNBTExCQUNLX1JFR0VYLnRlc3QoIHJlcXVlc3RTZXR0aW5ncy51cmwgKSApIHtcclxuXHRcdFx0XHRyZXF1ZXN0U2V0dGluZ3MudXJsICs9ICgvXFw/Ly50ZXN0KCByZXF1ZXN0U2V0dGluZ3MudXJsICkgPyBcIiZcIiA6IFwiP1wiKSArXHJcblx0XHRcdFx0XHQocmVxdWVzdFNldHRpbmdzLmpzb25wIHx8IFwiY2FsbGJhY2tcIikgKyBcIj0/XCI7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSBpZiAoICFyZXF1ZXN0U2V0dGluZ3MuZGF0YSB8fCAhQ0FMTEJBQ0tfUkVHRVgudGVzdChyZXF1ZXN0U2V0dGluZ3MuZGF0YSkgKSB7XHJcblx0XHRcdHJlcXVlc3RTZXR0aW5ncy5kYXRhID0gKHJlcXVlc3RTZXR0aW5ncy5kYXRhID8gcmVxdWVzdFNldHRpbmdzLmRhdGEgKyBcIiZcIiA6IFwiXCIpICsgKHJlcXVlc3RTZXR0aW5ncy5qc29ucCB8fCBcImNhbGxiYWNrXCIpICsgXCI9P1wiO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gUHJvY2VzcyBhIEpTT05QIHJlcXVlc3QgYnkgZXZhbHVhdGluZyB0aGUgbW9ja2VkIHJlc3BvbnNlIHRleHRcclxuXHRmdW5jdGlvbiBwcm9jZXNzSnNvbnBSZXF1ZXN0KCByZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MgKSB7XHJcblx0XHQvLyBTeW50aGVzaXplIHRoZSBtb2NrIHJlcXVlc3QgZm9yIGFkZGluZyBhIHNjcmlwdCB0YWdcclxuXHRcdHZhciBjYWxsYmFja0NvbnRleHQgPSBvcmlnU2V0dGluZ3MgJiYgb3JpZ1NldHRpbmdzLmNvbnRleHQgfHwgcmVxdWVzdFNldHRpbmdzLFxyXG5cdFx0XHRuZXdNb2NrID0gbnVsbDtcclxuXHJcblxyXG5cdFx0Ly8gSWYgdGhlIHJlc3BvbnNlIGhhbmRsZXIgb24gdGhlIG1vb2NrIGlzIGEgZnVuY3Rpb24sIGNhbGwgaXRcclxuXHRcdGlmICggbW9ja0hhbmRsZXIucmVzcG9uc2UgJiYgJC5pc0Z1bmN0aW9uKG1vY2tIYW5kbGVyLnJlc3BvbnNlKSApIHtcclxuXHRcdFx0bW9ja0hhbmRsZXIucmVzcG9uc2Uob3JpZ1NldHRpbmdzKTtcclxuXHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHQvLyBFdmFsdWF0ZSB0aGUgcmVzcG9uc2VUZXh0IGphdmFzY3JpcHQgaW4gYSBnbG9iYWwgY29udGV4dFxyXG5cdFx0XHRpZiggdHlwZW9mIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCA9PT0gJ29iamVjdCcgKSB7XHJcblx0XHRcdFx0JC5nbG9iYWxFdmFsKCAnKCcgKyBKU09OLnN0cmluZ2lmeSggbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ICkgKyAnKScpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCQuZ2xvYmFsRXZhbCggJygnICsgbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ICsgJyknKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFN1Y2Nlc3NmdWwgcmVzcG9uc2VcclxuXHRcdGpzb25wU3VjY2VzcyggcmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyICk7XHJcblx0XHRqc29ucENvbXBsZXRlKCByZXF1ZXN0U2V0dGluZ3MsIGNhbGxiYWNrQ29udGV4dCwgbW9ja0hhbmRsZXIgKTtcclxuXHJcblx0XHQvLyBJZiB3ZSBhcmUgcnVubmluZyB1bmRlciBqUXVlcnkgMS41KywgcmV0dXJuIGEgZGVmZXJyZWQgb2JqZWN0XHJcblx0XHRpZigkLkRlZmVycmVkKXtcclxuXHRcdFx0bmV3TW9jayA9IG5ldyAkLkRlZmVycmVkKCk7XHJcblx0XHRcdGlmKHR5cGVvZiBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgPT0gXCJvYmplY3RcIil7XHJcblx0XHRcdFx0bmV3TW9jay5yZXNvbHZlV2l0aCggY2FsbGJhY2tDb250ZXh0LCBbbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0XSApO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0bmV3TW9jay5yZXNvbHZlV2l0aCggY2FsbGJhY2tDb250ZXh0LCBbJC5wYXJzZUpTT04oIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCApXSApO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gbmV3TW9jaztcclxuXHR9XHJcblxyXG5cclxuXHQvLyBDcmVhdGUgdGhlIHJlcXVpcmVkIEpTT05QIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciB0aGUgcmVxdWVzdFxyXG5cdGZ1bmN0aW9uIGNyZWF0ZUpzb25wQ2FsbGJhY2soIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyApIHtcclxuXHRcdHZhciBjYWxsYmFja0NvbnRleHQgPSBvcmlnU2V0dGluZ3MgJiYgb3JpZ1NldHRpbmdzLmNvbnRleHQgfHwgcmVxdWVzdFNldHRpbmdzO1xyXG5cdFx0dmFyIGpzb25wID0gcmVxdWVzdFNldHRpbmdzLmpzb25wQ2FsbGJhY2sgfHwgKFwianNvbnBcIiArIGpzYysrKTtcclxuXHJcblx0XHQvLyBSZXBsYWNlIHRoZSA9PyBzZXF1ZW5jZSBib3RoIGluIHRoZSBxdWVyeSBzdHJpbmcgYW5kIHRoZSBkYXRhXHJcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5kYXRhICkge1xyXG5cdFx0XHRyZXF1ZXN0U2V0dGluZ3MuZGF0YSA9IChyZXF1ZXN0U2V0dGluZ3MuZGF0YSArIFwiXCIpLnJlcGxhY2UoQ0FMTEJBQ0tfUkVHRVgsIFwiPVwiICsganNvbnAgKyBcIiQxXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJlcXVlc3RTZXR0aW5ncy51cmwgPSByZXF1ZXN0U2V0dGluZ3MudXJsLnJlcGxhY2UoQ0FMTEJBQ0tfUkVHRVgsIFwiPVwiICsganNvbnAgKyBcIiQxXCIpO1xyXG5cclxuXHJcblx0XHQvLyBIYW5kbGUgSlNPTlAtc3R5bGUgbG9hZGluZ1xyXG5cdFx0d2luZG93WyBqc29ucCBdID0gd2luZG93WyBqc29ucCBdIHx8IGZ1bmN0aW9uKCB0bXAgKSB7XHJcblx0XHRcdGRhdGEgPSB0bXA7XHJcblx0XHRcdGpzb25wU3VjY2VzcyggcmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyICk7XHJcblx0XHRcdGpzb25wQ29tcGxldGUoIHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0LCBtb2NrSGFuZGxlciApO1xyXG5cdFx0XHQvLyBHYXJiYWdlIGNvbGxlY3RcclxuXHRcdFx0d2luZG93WyBqc29ucCBdID0gdW5kZWZpbmVkO1xyXG5cclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRkZWxldGUgd2luZG93WyBqc29ucCBdO1xyXG5cdFx0XHR9IGNhdGNoKGUpIHt9XHJcblxyXG5cdFx0XHRpZiAoIGhlYWQgKSB7XHJcblx0XHRcdFx0aGVhZC5yZW1vdmVDaGlsZCggc2NyaXB0ICk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHQvLyBUaGUgSlNPTlAgcmVxdWVzdCB3YXMgc3VjY2Vzc2Z1bFxyXG5cdGZ1bmN0aW9uIGpzb25wU3VjY2VzcyhyZXF1ZXN0U2V0dGluZ3MsIGNhbGxiYWNrQ29udGV4dCwgbW9ja0hhbmRsZXIpIHtcclxuXHRcdC8vIElmIGEgbG9jYWwgY2FsbGJhY2sgd2FzIHNwZWNpZmllZCwgZmlyZSBpdCBhbmQgcGFzcyBpdCB0aGUgZGF0YVxyXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3Muc3VjY2VzcyApIHtcclxuXHRcdFx0cmVxdWVzdFNldHRpbmdzLnN1Y2Nlc3MuY2FsbCggY2FsbGJhY2tDb250ZXh0LCBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgfHwgXCJcIiwgc3RhdHVzLCB7fSApO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEZpcmUgdGhlIGdsb2JhbCBjYWxsYmFja1xyXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZ2xvYmFsICkge1xyXG5cdFx0XHR0cmlnZ2VyKHJlcXVlc3RTZXR0aW5ncywgXCJhamF4U3VjY2Vzc1wiLCBbe30sIHJlcXVlc3RTZXR0aW5nc10gKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIFRoZSBKU09OUCByZXF1ZXN0IHdhcyBjb21wbGV0ZWRcclxuXHRmdW5jdGlvbiBqc29ucENvbXBsZXRlKHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0KSB7XHJcblx0XHQvLyBQcm9jZXNzIHJlc3VsdFxyXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuY29tcGxldGUgKSB7XHJcblx0XHRcdHJlcXVlc3RTZXR0aW5ncy5jb21wbGV0ZS5jYWxsKCBjYWxsYmFja0NvbnRleHQsIHt9ICwgc3RhdHVzICk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gVGhlIHJlcXVlc3Qgd2FzIGNvbXBsZXRlZFxyXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZ2xvYmFsICkge1xyXG5cdFx0XHR0cmlnZ2VyKCBcImFqYXhDb21wbGV0ZVwiLCBbe30sIHJlcXVlc3RTZXR0aW5nc10gKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBIYW5kbGUgdGhlIGdsb2JhbCBBSkFYIGNvdW50ZXJcclxuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmdsb2JhbCAmJiAhIC0tJC5hY3RpdmUgKSB7XHJcblx0XHRcdCQuZXZlbnQudHJpZ2dlciggXCJhamF4U3RvcFwiICk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHJcblx0Ly8gVGhlIGNvcmUgJC5hamF4IHJlcGxhY2VtZW50LlxyXG5cdGZ1bmN0aW9uIGhhbmRsZUFqYXgoIHVybCwgb3JpZ1NldHRpbmdzICkge1xyXG5cdFx0dmFyIG1vY2tSZXF1ZXN0LCByZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyO1xyXG5cclxuXHRcdC8vIElmIHVybCBpcyBhbiBvYmplY3QsIHNpbXVsYXRlIHByZS0xLjUgc2lnbmF0dXJlXHJcblx0XHRpZiAoIHR5cGVvZiB1cmwgPT09IFwib2JqZWN0XCIgKSB7XHJcblx0XHRcdG9yaWdTZXR0aW5ncyA9IHVybDtcclxuXHRcdFx0dXJsID0gdW5kZWZpbmVkO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gd29yayBhcm91bmQgdG8gc3VwcG9ydCAxLjUgc2lnbmF0dXJlXHJcblx0XHRcdG9yaWdTZXR0aW5ncyA9IG9yaWdTZXR0aW5ncyB8fCB7fTtcclxuXHRcdFx0b3JpZ1NldHRpbmdzLnVybCA9IHVybDtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBFeHRlbmQgdGhlIG9yaWdpbmFsIHNldHRpbmdzIGZvciB0aGUgcmVxdWVzdFxyXG5cdFx0cmVxdWVzdFNldHRpbmdzID0gJC5leHRlbmQodHJ1ZSwge30sICQuYWpheFNldHRpbmdzLCBvcmlnU2V0dGluZ3MpO1xyXG5cclxuXHRcdC8vIEl0ZXJhdGUgb3ZlciBvdXIgbW9jayBoYW5kbGVycyAoaW4gcmVnaXN0cmF0aW9uIG9yZGVyKSB1bnRpbCB3ZSBmaW5kXHJcblx0XHQvLyBvbmUgdGhhdCBpcyB3aWxsaW5nIHRvIGludGVyY2VwdCB0aGUgcmVxdWVzdFxyXG5cdFx0Zm9yKHZhciBrID0gMDsgayA8IG1vY2tIYW5kbGVycy5sZW5ndGg7IGsrKykge1xyXG5cdFx0XHRpZiAoICFtb2NrSGFuZGxlcnNba10gKSB7XHJcblx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdG1vY2tIYW5kbGVyID0gZ2V0TW9ja0ZvclJlcXVlc3QoIG1vY2tIYW5kbGVyc1trXSwgcmVxdWVzdFNldHRpbmdzICk7XHJcblx0XHRcdGlmKCFtb2NrSGFuZGxlcikge1xyXG5cdFx0XHRcdC8vIE5vIHZhbGlkIG1vY2sgZm91bmQgZm9yIHRoaXMgcmVxdWVzdFxyXG5cdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRtb2NrZWRBamF4Q2FsbHMucHVzaChyZXF1ZXN0U2V0dGluZ3MpO1xyXG5cclxuXHRcdFx0Ly8gSWYgbG9nZ2luZyBpcyBlbmFibGVkLCBsb2cgdGhlIG1vY2sgdG8gdGhlIGNvbnNvbGVcclxuXHRcdFx0JC5tb2NramF4U2V0dGluZ3MubG9nKCBtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzICk7XHJcblxyXG5cclxuXHRcdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgJiYgcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlLnRvVXBwZXJDYXNlKCkgPT09ICdKU09OUCcgKSB7XHJcblx0XHRcdFx0aWYgKChtb2NrUmVxdWVzdCA9IHByb2Nlc3NKc29ucE1vY2soIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyApKSkge1xyXG5cdFx0XHRcdFx0Ly8gVGhpcyBtb2NrIHdpbGwgaGFuZGxlIHRoZSBKU09OUCByZXF1ZXN0XHJcblx0XHRcdFx0XHRyZXR1cm4gbW9ja1JlcXVlc3Q7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cclxuXHRcdFx0Ly8gUmVtb3ZlZCB0byBmaXggIzU0IC0ga2VlcCB0aGUgbW9ja2luZyBkYXRhIG9iamVjdCBpbnRhY3RcclxuXHRcdFx0Ly9tb2NrSGFuZGxlci5kYXRhID0gcmVxdWVzdFNldHRpbmdzLmRhdGE7XHJcblxyXG5cdFx0XHRtb2NrSGFuZGxlci5jYWNoZSA9IHJlcXVlc3RTZXR0aW5ncy5jYWNoZTtcclxuXHRcdFx0bW9ja0hhbmRsZXIudGltZW91dCA9IHJlcXVlc3RTZXR0aW5ncy50aW1lb3V0O1xyXG5cdFx0XHRtb2NrSGFuZGxlci5nbG9iYWwgPSByZXF1ZXN0U2V0dGluZ3MuZ2xvYmFsO1xyXG5cclxuXHRcdFx0Y29weVVybFBhcmFtZXRlcnMobW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyk7XHJcblxyXG5cdFx0XHQoZnVuY3Rpb24obW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncywgb3JpZ1NldHRpbmdzLCBvcmlnSGFuZGxlcikge1xyXG5cdFx0XHRcdG1vY2tSZXF1ZXN0ID0gX2FqYXguY2FsbCgkLCAkLmV4dGVuZCh0cnVlLCB7fSwgb3JpZ1NldHRpbmdzLCB7XHJcblx0XHRcdFx0XHQvLyBNb2NrIHRoZSBYSFIgb2JqZWN0XHJcblx0XHRcdFx0XHR4aHI6IGZ1bmN0aW9uKCkgeyByZXR1cm4geGhyKCBtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MsIG9yaWdIYW5kbGVyICk7IH1cclxuXHRcdFx0XHR9KSk7XHJcblx0XHRcdH0pKG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncywgbW9ja0hhbmRsZXJzW2tdKTtcclxuXHJcblx0XHRcdHJldHVybiBtb2NrUmVxdWVzdDtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBXZSBkb24ndCBoYXZlIGEgbW9jayByZXF1ZXN0XHJcblx0XHRpZigkLm1vY2tqYXhTZXR0aW5ncy50aHJvd1VubW9ja2VkID09PSB0cnVlKSB7XHJcblx0XHRcdHRocm93KCdBSkFYIG5vdCBtb2NrZWQ6ICcgKyBvcmlnU2V0dGluZ3MudXJsKTtcclxuXHRcdH1cclxuXHRcdGVsc2UgeyAvLyB0cmlnZ2VyIGEgbm9ybWFsIHJlcXVlc3RcclxuXHRcdFx0cmV0dXJuIF9hamF4LmFwcGx5KCQsIFtvcmlnU2V0dGluZ3NdKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCogQ29waWVzIFVSTCBwYXJhbWV0ZXIgdmFsdWVzIGlmIHRoZXkgd2VyZSBjYXB0dXJlZCBieSBhIHJlZ3VsYXIgZXhwcmVzc2lvblxyXG5cdCogQHBhcmFtIHtPYmplY3R9IG1vY2tIYW5kbGVyXHJcblx0KiBAcGFyYW0ge09iamVjdH0gb3JpZ1NldHRpbmdzXHJcblx0Ki9cclxuXHRmdW5jdGlvbiBjb3B5VXJsUGFyYW1ldGVycyhtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzKSB7XHJcblx0XHQvL3BhcmFtZXRlcnMgYXJlbid0IGNhcHR1cmVkIGlmIHRoZSBVUkwgaXNuJ3QgYSBSZWdFeHBcclxuXHRcdGlmICghKG1vY2tIYW5kbGVyLnVybCBpbnN0YW5jZW9mIFJlZ0V4cCkpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0Ly9pZiBubyBVUkwgcGFyYW1zIHdlcmUgZGVmaW5lZCBvbiB0aGUgaGFuZGxlciwgZG9uJ3QgYXR0ZW1wdCBhIGNhcHR1cmVcclxuXHRcdGlmICghbW9ja0hhbmRsZXIuaGFzT3duUHJvcGVydHkoJ3VybFBhcmFtcycpKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdHZhciBjYXB0dXJlcyA9IG1vY2tIYW5kbGVyLnVybC5leGVjKG9yaWdTZXR0aW5ncy51cmwpO1xyXG5cdFx0Ly90aGUgd2hvbGUgUmVnRXhwIG1hdGNoIGlzIGFsd2F5cyB0aGUgZmlyc3QgdmFsdWUgaW4gdGhlIGNhcHR1cmUgcmVzdWx0c1xyXG5cdFx0aWYgKGNhcHR1cmVzLmxlbmd0aCA9PT0gMSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRjYXB0dXJlcy5zaGlmdCgpO1xyXG5cdFx0Ly91c2UgaGFuZGxlciBwYXJhbXMgYXMga2V5cyBhbmQgY2FwdHVyZSByZXN1dHMgYXMgdmFsdWVzXHJcblx0XHR2YXIgaSA9IDAsXHJcblx0XHRjYXB0dXJlc0xlbmd0aCA9IGNhcHR1cmVzLmxlbmd0aCxcclxuXHRcdHBhcmFtc0xlbmd0aCA9IG1vY2tIYW5kbGVyLnVybFBhcmFtcy5sZW5ndGgsXHJcblx0XHQvL2luIGNhc2UgdGhlIG51bWJlciBvZiBwYXJhbXMgc3BlY2lmaWVkIGlzIGxlc3MgdGhhbiBhY3R1YWwgY2FwdHVyZXNcclxuXHRcdG1heEl0ZXJhdGlvbnMgPSBNYXRoLm1pbihjYXB0dXJlc0xlbmd0aCwgcGFyYW1zTGVuZ3RoKSxcclxuXHRcdHBhcmFtVmFsdWVzID0ge307XHJcblx0XHRmb3IgKGk7IGkgPCBtYXhJdGVyYXRpb25zOyBpKyspIHtcclxuXHRcdFx0dmFyIGtleSA9IG1vY2tIYW5kbGVyLnVybFBhcmFtc1tpXTtcclxuXHRcdFx0cGFyYW1WYWx1ZXNba2V5XSA9IGNhcHR1cmVzW2ldO1xyXG5cdFx0fVxyXG5cdFx0b3JpZ1NldHRpbmdzLnVybFBhcmFtcyA9IHBhcmFtVmFsdWVzO1xyXG5cdH1cclxuXHJcblxyXG5cdC8vIFB1YmxpY1xyXG5cclxuXHQkLmV4dGVuZCh7XHJcblx0XHRhamF4OiBoYW5kbGVBamF4XHJcblx0fSk7XHJcblxyXG5cdCQubW9ja2pheFNldHRpbmdzID0ge1xyXG5cdFx0Ly91cmw6ICAgICAgICBudWxsLFxyXG5cdFx0Ly90eXBlOiAgICAgICAnR0VUJyxcclxuXHRcdGxvZzogICAgICAgICAgZnVuY3Rpb24oIG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MgKSB7XHJcblx0XHRcdGlmICggbW9ja0hhbmRsZXIubG9nZ2luZyA9PT0gZmFsc2UgfHxcclxuXHRcdFx0XHQgKCB0eXBlb2YgbW9ja0hhbmRsZXIubG9nZ2luZyA9PT0gJ3VuZGVmaW5lZCcgJiYgJC5tb2NramF4U2V0dGluZ3MubG9nZ2luZyA9PT0gZmFsc2UgKSApIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKCB3aW5kb3cuY29uc29sZSAmJiBjb25zb2xlLmxvZyApIHtcclxuXHRcdFx0XHR2YXIgbWVzc2FnZSA9ICdNT0NLICcgKyByZXF1ZXN0U2V0dGluZ3MudHlwZS50b1VwcGVyQ2FzZSgpICsgJzogJyArIHJlcXVlc3RTZXR0aW5ncy51cmw7XHJcblx0XHRcdFx0dmFyIHJlcXVlc3QgPSAkLmV4dGVuZCh7fSwgcmVxdWVzdFNldHRpbmdzKTtcclxuXHJcblx0XHRcdFx0aWYgKHR5cGVvZiBjb25zb2xlLmxvZyA9PT0gJ2Z1bmN0aW9uJykge1xyXG5cdFx0XHRcdFx0Y29uc29sZS5sb2cobWVzc2FnZSwgcmVxdWVzdCk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHRyeSB7XHJcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCBtZXNzYWdlICsgJyAnICsgSlNPTi5zdHJpbmdpZnkocmVxdWVzdCkgKTtcclxuXHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2cobWVzc2FnZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cdFx0bG9nZ2luZzogICAgICAgdHJ1ZSxcclxuXHRcdHN0YXR1czogICAgICAgIDIwMCxcclxuXHRcdHN0YXR1c1RleHQ6ICAgIFwiT0tcIixcclxuXHRcdHJlc3BvbnNlVGltZTogIDUwMCxcclxuXHRcdGlzVGltZW91dDogICAgIGZhbHNlLFxyXG5cdFx0dGhyb3dVbm1vY2tlZDogZmFsc2UsXHJcblx0XHRjb250ZW50VHlwZTogICAndGV4dC9wbGFpbicsXHJcblx0XHRyZXNwb25zZTogICAgICAnJyxcclxuXHRcdHJlc3BvbnNlVGV4dDogICcnLFxyXG5cdFx0cmVzcG9uc2VYTUw6ICAgJycsXHJcblx0XHRwcm94eTogICAgICAgICAnJyxcclxuXHRcdHByb3h5VHlwZTogICAgICdHRVQnLFxyXG5cclxuXHRcdGxhc3RNb2RpZmllZDogIG51bGwsXHJcblx0XHRldGFnOiAgICAgICAgICAnJyxcclxuXHRcdGhlYWRlcnM6IHtcclxuXHRcdFx0ZXRhZzogJ0lKRkBII0A5MjN1ZjgwMjNoRk9ASSNIIycsXHJcblx0XHRcdCdjb250ZW50LXR5cGUnIDogJ3RleHQvcGxhaW4nXHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0JC5tb2NramF4ID0gZnVuY3Rpb24oc2V0dGluZ3MpIHtcclxuXHRcdHZhciBpID0gbW9ja0hhbmRsZXJzLmxlbmd0aDtcclxuXHRcdG1vY2tIYW5kbGVyc1tpXSA9IHNldHRpbmdzO1xyXG5cdFx0cmV0dXJuIGk7XHJcblx0fTtcclxuXHQkLm1vY2tqYXhDbGVhciA9IGZ1bmN0aW9uKGkpIHtcclxuXHRcdGlmICggYXJndW1lbnRzLmxlbmd0aCA9PSAxICkge1xyXG5cdFx0XHRtb2NrSGFuZGxlcnNbaV0gPSBudWxsO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0bW9ja0hhbmRsZXJzID0gW107XHJcblx0XHR9XHJcblx0XHRtb2NrZWRBamF4Q2FsbHMgPSBbXTtcclxuXHR9O1xyXG5cdCQubW9ja2pheC5oYW5kbGVyID0gZnVuY3Rpb24oaSkge1xyXG5cdFx0aWYgKCBhcmd1bWVudHMubGVuZ3RoID09IDEgKSB7XHJcblx0XHRcdHJldHVybiBtb2NrSGFuZGxlcnNbaV07XHJcblx0XHR9XHJcblx0fTtcclxuXHQkLm1vY2tqYXgubW9ja2VkQWpheENhbGxzID0gZnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4gbW9ja2VkQWpheENhbGxzO1xyXG5cdH07XHJcbn0pKGpRdWVyeSk7IiwiLyoqXHJcbiogIEFqYXggQXV0b2NvbXBsZXRlIGZvciBqUXVlcnksIHZlcnNpb24gJXZlcnNpb24lXHJcbiogIChjKSAyMDE1IFRvbWFzIEtpcmRhXHJcbipcclxuKiAgQWpheCBBdXRvY29tcGxldGUgZm9yIGpRdWVyeSBpcyBmcmVlbHkgZGlzdHJpYnV0YWJsZSB1bmRlciB0aGUgdGVybXMgb2YgYW4gTUlULXN0eWxlIGxpY2Vuc2UuXHJcbiogIEZvciBkZXRhaWxzLCBzZWUgdGhlIHdlYiBzaXRlOiBodHRwczovL2dpdGh1Yi5jb20vZGV2YnJpZGdlL2pRdWVyeS1BdXRvY29tcGxldGVcclxuKi9cclxuXHJcbi8qanNsaW50ICBicm93c2VyOiB0cnVlLCB3aGl0ZTogdHJ1ZSwgcGx1c3BsdXM6IHRydWUsIHZhcnM6IHRydWUgKi9cclxuLypnbG9iYWwgZGVmaW5lLCB3aW5kb3csIGRvY3VtZW50LCBqUXVlcnksIGV4cG9ydHMsIHJlcXVpcmUgKi9cclxuXHJcbi8vIEV4cG9zZSBwbHVnaW4gYXMgYW4gQU1EIG1vZHVsZSBpZiBBTUQgbG9hZGVyIGlzIHByZXNlbnQ6XHJcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG4gICAgICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cclxuICAgICAgICBkZWZpbmUoWydqcXVlcnknXSwgZmFjdG9yeSk7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgcmVxdWlyZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIC8vIEJyb3dzZXJpZnlcclxuICAgICAgICBmYWN0b3J5KHJlcXVpcmUoJ2pxdWVyeScpKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gQnJvd3NlciBnbG9iYWxzXHJcbiAgICAgICAgZmFjdG9yeShqUXVlcnkpO1xyXG4gICAgfVxyXG59KGZ1bmN0aW9uICgkKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyXHJcbiAgICAgICAgdXRpbHMgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgZXNjYXBlUmVnRXhDaGFyczogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoL1tcXC1cXFtcXF1cXC9cXHtcXH1cXChcXClcXCpcXCtcXD9cXC5cXFxcXFxeXFwkXFx8XS9nLCBcIlxcXFwkJlwiKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBjcmVhdGVOb2RlOiBmdW5jdGlvbiAoY29udGFpbmVyQ2xhc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGl2LmNsYXNzTmFtZSA9IGNvbnRhaW5lckNsYXNzO1xyXG4gICAgICAgICAgICAgICAgICAgIGRpdi5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgZGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRpdjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KCkpLFxyXG5cclxuICAgICAgICBrZXlzID0ge1xyXG4gICAgICAgICAgICBFU0M6IDI3LFxyXG4gICAgICAgICAgICBUQUI6IDksXHJcbiAgICAgICAgICAgIFJFVFVSTjogMTMsXHJcbiAgICAgICAgICAgIExFRlQ6IDM3LFxyXG4gICAgICAgICAgICBVUDogMzgsXHJcbiAgICAgICAgICAgIFJJR0hUOiAzOSxcclxuICAgICAgICAgICAgRE9XTjogNDBcclxuICAgICAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIEF1dG9jb21wbGV0ZShlbCwgb3B0aW9ucykge1xyXG4gICAgICAgIHZhciBub29wID0gZnVuY3Rpb24gKCkgeyB9LFxyXG4gICAgICAgICAgICB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgZGVmYXVsdHMgPSB7XHJcbiAgICAgICAgICAgICAgICBhamF4U2V0dGluZ3M6IHt9LFxyXG4gICAgICAgICAgICAgICAgYXV0b1NlbGVjdEZpcnN0OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGFwcGVuZFRvOiBkb2N1bWVudC5ib2R5LFxyXG4gICAgICAgICAgICAgICAgc2VydmljZVVybDogbnVsbCxcclxuICAgICAgICAgICAgICAgIGxvb2t1cDogbnVsbCxcclxuICAgICAgICAgICAgICAgIG9uU2VsZWN0OiBudWxsLFxyXG4gICAgICAgICAgICAgICAgd2lkdGg6ICdhdXRvJyxcclxuICAgICAgICAgICAgICAgIG1pbkNoYXJzOiAxLFxyXG4gICAgICAgICAgICAgICAgbWF4SGVpZ2h0OiAzMDAsXHJcbiAgICAgICAgICAgICAgICBkZWZlclJlcXVlc3RCeTogMCxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge30sXHJcbiAgICAgICAgICAgICAgICBmb3JtYXRSZXN1bHQ6IEF1dG9jb21wbGV0ZS5mb3JtYXRSZXN1bHQsXHJcbiAgICAgICAgICAgICAgICBkZWxpbWl0ZXI6IG51bGwsXHJcbiAgICAgICAgICAgICAgICB6SW5kZXg6IDk5OTksXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnR0VUJyxcclxuICAgICAgICAgICAgICAgIG5vQ2FjaGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgb25TZWFyY2hTdGFydDogbm9vcCxcclxuICAgICAgICAgICAgICAgIG9uU2VhcmNoQ29tcGxldGU6IG5vb3AsXHJcbiAgICAgICAgICAgICAgICBvblNlYXJjaEVycm9yOiBub29wLFxyXG4gICAgICAgICAgICAgICAgcHJlc2VydmVJbnB1dDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBjb250YWluZXJDbGFzczogJ2F1dG9jb21wbGV0ZS1zdWdnZXN0aW9ucycsXHJcbiAgICAgICAgICAgICAgICB0YWJEaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ3RleHQnLFxyXG4gICAgICAgICAgICAgICAgY3VycmVudFJlcXVlc3Q6IG51bGwsXHJcbiAgICAgICAgICAgICAgICB0cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgcHJldmVudEJhZFF1ZXJpZXM6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBsb29rdXBGaWx0ZXI6IGZ1bmN0aW9uIChzdWdnZXN0aW9uLCBvcmlnaW5hbFF1ZXJ5LCBxdWVyeUxvd2VyQ2FzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdWdnZXN0aW9uLnZhbHVlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxdWVyeUxvd2VyQ2FzZSkgIT09IC0xO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHBhcmFtTmFtZTogJ3F1ZXJ5JyxcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybVJlc3VsdDogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiByZXNwb25zZSA9PT0gJ3N0cmluZycgPyAkLnBhcnNlSlNPTihyZXNwb25zZSkgOiByZXNwb25zZTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBzaG93Tm9TdWdnZXN0aW9uTm90aWNlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIG5vU3VnZ2VzdGlvbk5vdGljZTogJ05vIHJlc3VsdHMnLFxyXG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb246ICdib3R0b20nLFxyXG4gICAgICAgICAgICAgICAgZm9yY2VGaXhQb3NpdGlvbjogZmFsc2VcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gU2hhcmVkIHZhcmlhYmxlczpcclxuICAgICAgICB0aGF0LmVsZW1lbnQgPSBlbDtcclxuICAgICAgICB0aGF0LmVsID0gJChlbCk7XHJcbiAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IFtdO1xyXG4gICAgICAgIHRoYXQuYmFkUXVlcmllcyA9IFtdO1xyXG4gICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xyXG4gICAgICAgIHRoYXQuY3VycmVudFZhbHVlID0gdGhhdC5lbGVtZW50LnZhbHVlO1xyXG4gICAgICAgIHRoYXQuaW50ZXJ2YWxJZCA9IDA7XHJcbiAgICAgICAgdGhhdC5jYWNoZWRSZXNwb25zZSA9IHt9O1xyXG4gICAgICAgIHRoYXQub25DaGFuZ2VJbnRlcnZhbCA9IG51bGw7XHJcbiAgICAgICAgdGhhdC5vbkNoYW5nZSA9IG51bGw7XHJcbiAgICAgICAgdGhhdC5pc0xvY2FsID0gZmFsc2U7XHJcbiAgICAgICAgdGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciA9IG51bGw7XHJcbiAgICAgICAgdGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gbnVsbDtcclxuICAgICAgICB0aGF0Lm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG4gICAgICAgIHRoYXQuY2xhc3NlcyA9IHtcclxuICAgICAgICAgICAgc2VsZWN0ZWQ6ICdhdXRvY29tcGxldGUtc2VsZWN0ZWQnLFxyXG4gICAgICAgICAgICBzdWdnZXN0aW9uOiAnYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb24nXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGF0LmhpbnQgPSBudWxsO1xyXG4gICAgICAgIHRoYXQuaGludFZhbHVlID0gJyc7XHJcbiAgICAgICAgdGhhdC5zZWxlY3Rpb24gPSBudWxsO1xyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXplIGFuZCBzZXQgb3B0aW9uczpcclxuICAgICAgICB0aGF0LmluaXRpYWxpemUoKTtcclxuICAgICAgICB0aGF0LnNldE9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgQXV0b2NvbXBsZXRlLnV0aWxzID0gdXRpbHM7XHJcblxyXG4gICAgJC5BdXRvY29tcGxldGUgPSBBdXRvY29tcGxldGU7XHJcblxyXG4gICAgQXV0b2NvbXBsZXRlLmZvcm1hdFJlc3VsdCA9IGZ1bmN0aW9uIChzdWdnZXN0aW9uLCBjdXJyZW50VmFsdWUpIHtcclxuICAgICAgICAvLyBEbyBub3QgcmVwbGFjZSBhbnl0aGluZyBpZiB0aGVyZSBjdXJyZW50IHZhbHVlIGlzIGVtcHR5XHJcbiAgICAgICAgaWYgKCFjdXJyZW50VmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb24udmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBwYXR0ZXJuID0gJygnICsgdXRpbHMuZXNjYXBlUmVnRXhDaGFycyhjdXJyZW50VmFsdWUpICsgJyknO1xyXG5cclxuICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbi52YWx1ZVxyXG4gICAgICAgICAgICAucmVwbGFjZShuZXcgUmVnRXhwKHBhdHRlcm4sICdnaScpLCAnPHN0cm9uZz4kMTxcXC9zdHJvbmc+JylcclxuICAgICAgICAgICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcclxuICAgICAgICAgICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcclxuICAgICAgICAgICAgLnJlcGxhY2UoLyZsdDsoXFwvP3N0cm9uZykmZ3Q7L2csICc8JDE+Jyk7XHJcbiAgICB9O1xyXG5cclxuICAgIEF1dG9jb21wbGV0ZS5wcm90b3R5cGUgPSB7XHJcblxyXG4gICAgICAgIGtpbGxlckZuOiBudWxsLFxyXG5cclxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb25TZWxlY3RvciA9ICcuJyArIHRoYXQuY2xhc3Nlcy5zdWdnZXN0aW9uLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSB0aGF0LmNsYXNzZXMuc2VsZWN0ZWQsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlIGF1dG9jb21wbGV0ZSBhdHRyaWJ1dGUgdG8gcHJldmVudCBuYXRpdmUgc3VnZ2VzdGlvbnM6XHJcbiAgICAgICAgICAgIHRoYXQuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2F1dG9jb21wbGV0ZScsICdvZmYnKTtcclxuXHJcbiAgICAgICAgICAgIHRoYXQua2lsbGVyRm4gPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCQoZS50YXJnZXQpLmNsb3Nlc3QoJy4nICsgdGhhdC5vcHRpb25zLmNvbnRhaW5lckNsYXNzKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmtpbGxTdWdnZXN0aW9ucygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZGlzYWJsZUtpbGxlckZuKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvLyBodG1sKCkgZGVhbHMgd2l0aCBtYW55IHR5cGVzOiBodG1sU3RyaW5nIG9yIEVsZW1lbnQgb3IgQXJyYXkgb3IgalF1ZXJ5XHJcbiAgICAgICAgICAgIHRoYXQubm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQoJzxkaXYgY2xhc3M9XCJhdXRvY29tcGxldGUtbm8tc3VnZ2VzdGlvblwiPjwvZGl2PicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5odG1sKHRoaXMub3B0aW9ucy5ub1N1Z2dlc3Rpb25Ob3RpY2UpLmdldCgwKTtcclxuXHJcbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIgPSBBdXRvY29tcGxldGUudXRpbHMuY3JlYXRlTm9kZShvcHRpb25zLmNvbnRhaW5lckNsYXNzKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kVG8ob3B0aW9ucy5hcHBlbmRUbyk7XHJcblxyXG4gICAgICAgICAgICAvLyBPbmx5IHNldCB3aWR0aCBpZiBpdCB3YXMgcHJvdmlkZWQ6XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLndpZHRoICE9PSAnYXV0bycpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci53aWR0aChvcHRpb25zLndpZHRoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gTGlzdGVuIGZvciBtb3VzZSBvdmVyIGV2ZW50IG9uIHN1Z2dlc3Rpb25zIGxpc3Q6XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5vbignbW91c2VvdmVyLmF1dG9jb21wbGV0ZScsIHN1Z2dlc3Rpb25TZWxlY3RvciwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5hY3RpdmF0ZSgkKHRoaXMpLmRhdGEoJ2luZGV4JykpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIERlc2VsZWN0IGFjdGl2ZSBlbGVtZW50IHdoZW4gbW91c2UgbGVhdmVzIHN1Z2dlc3Rpb25zIGNvbnRhaW5lcjpcclxuICAgICAgICAgICAgY29udGFpbmVyLm9uKCdtb3VzZW91dC5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jaGlsZHJlbignLicgKyBzZWxlY3RlZCkucmVtb3ZlQ2xhc3Moc2VsZWN0ZWQpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIExpc3RlbiBmb3IgY2xpY2sgZXZlbnQgb24gc3VnZ2VzdGlvbnMgbGlzdDpcclxuICAgICAgICAgICAgY29udGFpbmVyLm9uKCdjbGljay5hdXRvY29tcGxldGUnLCBzdWdnZXN0aW9uU2VsZWN0b3IsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KCQodGhpcykuZGF0YSgnaW5kZXgnKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbkNhcHR1cmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhhdC52aXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuYXV0b2NvbXBsZXRlJywgdGhhdC5maXhQb3NpdGlvbkNhcHR1cmUpO1xyXG5cclxuICAgICAgICAgICAgdGhhdC5lbC5vbigna2V5ZG93bi5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5UHJlc3MoZSk7IH0pO1xyXG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdrZXl1cC5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5VXAoZSk7IH0pO1xyXG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdibHVyLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uICgpIHsgdGhhdC5vbkJsdXIoKTsgfSk7XHJcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2ZvY3VzLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uICgpIHsgdGhhdC5vbkZvY3VzKCk7IH0pO1xyXG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdjaGFuZ2UuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVVwKGUpOyB9KTtcclxuICAgICAgICAgICAgdGhhdC5lbC5vbignaW5wdXQuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVVwKGUpOyB9KTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBvbkZvY3VzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LmVsLnZhbCgpLmxlbmd0aCA+PSB0aGF0Lm9wdGlvbnMubWluQ2hhcnMpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQub25WYWx1ZUNoYW5nZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgb25CbHVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZW5hYmxlS2lsbGVyRm4oKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIFxyXG4gICAgICAgIGFib3J0QWpheDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgIGlmICh0aGF0LmN1cnJlbnRSZXF1ZXN0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0LmFib3J0KCk7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0ID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNldE9wdGlvbnM6IGZ1bmN0aW9uIChzdXBwbGllZE9wdGlvbnMpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucztcclxuXHJcbiAgICAgICAgICAgICQuZXh0ZW5kKG9wdGlvbnMsIHN1cHBsaWVkT3B0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICB0aGF0LmlzTG9jYWwgPSAkLmlzQXJyYXkob3B0aW9ucy5sb29rdXApO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuaXNMb2NhbCkge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5sb29rdXAgPSB0aGF0LnZlcmlmeVN1Z2dlc3Rpb25zRm9ybWF0KG9wdGlvbnMubG9va3VwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgb3B0aW9ucy5vcmllbnRhdGlvbiA9IHRoYXQudmFsaWRhdGVPcmllbnRhdGlvbihvcHRpb25zLm9yaWVudGF0aW9uLCAnYm90dG9tJyk7XHJcblxyXG4gICAgICAgICAgICAvLyBBZGp1c3QgaGVpZ2h0LCB3aWR0aCBhbmQgei1pbmRleDpcclxuICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5jc3Moe1xyXG4gICAgICAgICAgICAgICAgJ21heC1oZWlnaHQnOiBvcHRpb25zLm1heEhlaWdodCArICdweCcsXHJcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiBvcHRpb25zLndpZHRoICsgJ3B4JyxcclxuICAgICAgICAgICAgICAgICd6LWluZGV4Jzogb3B0aW9ucy56SW5kZXhcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuXHJcblxyXG4gICAgICAgIGNsZWFyQ2FjaGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5jYWNoZWRSZXNwb25zZSA9IHt9O1xyXG4gICAgICAgICAgICB0aGlzLmJhZFF1ZXJpZXMgPSBbXTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBjbGVhcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNsZWFyQ2FjaGUoKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50VmFsdWUgPSAnJztcclxuICAgICAgICAgICAgdGhpcy5zdWdnZXN0aW9ucyA9IFtdO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGRpc2FibGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICB0aGF0LmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICB0aGF0LmFib3J0QWpheCgpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGVuYWJsZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZml4UG9zaXRpb246IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gVXNlIG9ubHkgd2hlbiBjb250YWluZXIgaGFzIGFscmVhZHkgaXRzIGNvbnRlbnRcclxuXHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgICRjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyUGFyZW50ID0gJGNvbnRhaW5lci5wYXJlbnQoKS5nZXQoMCk7XHJcbiAgICAgICAgICAgIC8vIEZpeCBwb3NpdGlvbiBhdXRvbWF0aWNhbGx5IHdoZW4gYXBwZW5kZWQgdG8gYm9keS5cclxuICAgICAgICAgICAgLy8gSW4gb3RoZXIgY2FzZXMgZm9yY2UgcGFyYW1ldGVyIG11c3QgYmUgZ2l2ZW4uXHJcbiAgICAgICAgICAgIGlmIChjb250YWluZXJQYXJlbnQgIT09IGRvY3VtZW50LmJvZHkgJiYgIXRoYXQub3B0aW9ucy5mb3JjZUZpeFBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIENob29zZSBvcmllbnRhdGlvblxyXG4gICAgICAgICAgICB2YXIgb3JpZW50YXRpb24gPSB0aGF0Lm9wdGlvbnMub3JpZW50YXRpb24sXHJcbiAgICAgICAgICAgICAgICBjb250YWluZXJIZWlnaHQgPSAkY29udGFpbmVyLm91dGVySGVpZ2h0KCksXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSB0aGF0LmVsLm91dGVySGVpZ2h0KCksXHJcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSB0aGF0LmVsLm9mZnNldCgpLFxyXG4gICAgICAgICAgICAgICAgc3R5bGVzID0geyAndG9wJzogb2Zmc2V0LnRvcCwgJ2xlZnQnOiBvZmZzZXQubGVmdCB9O1xyXG5cclxuICAgICAgICAgICAgaWYgKG9yaWVudGF0aW9uID09PSAnYXV0bycpIHtcclxuICAgICAgICAgICAgICAgIHZhciB2aWV3UG9ydEhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKSxcclxuICAgICAgICAgICAgICAgICAgICBzY3JvbGxUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCksXHJcbiAgICAgICAgICAgICAgICAgICAgdG9wT3ZlcmZsb3cgPSAtc2Nyb2xsVG9wICsgb2Zmc2V0LnRvcCAtIGNvbnRhaW5lckhlaWdodCxcclxuICAgICAgICAgICAgICAgICAgICBib3R0b21PdmVyZmxvdyA9IHNjcm9sbFRvcCArIHZpZXdQb3J0SGVpZ2h0IC0gKG9mZnNldC50b3AgKyBoZWlnaHQgKyBjb250YWluZXJIZWlnaHQpO1xyXG5cclxuICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uID0gKE1hdGgubWF4KHRvcE92ZXJmbG93LCBib3R0b21PdmVyZmxvdykgPT09IHRvcE92ZXJmbG93KSA/ICd0b3AnIDogJ2JvdHRvbSc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChvcmllbnRhdGlvbiA9PT0gJ3RvcCcpIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlcy50b3AgKz0gLWNvbnRhaW5lckhlaWdodDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlcy50b3AgKz0gaGVpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBjb250YWluZXIgaXMgbm90IHBvc2l0aW9uZWQgdG8gYm9keSxcclxuICAgICAgICAgICAgLy8gY29ycmVjdCBpdHMgcG9zaXRpb24gdXNpbmcgb2Zmc2V0IHBhcmVudCBvZmZzZXRcclxuICAgICAgICAgICAgaWYoY29udGFpbmVyUGFyZW50ICE9PSBkb2N1bWVudC5ib2R5KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgb3BhY2l0eSA9ICRjb250YWluZXIuY3NzKCdvcGFjaXR5JyksXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50T2Zmc2V0RGlmZjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGF0LnZpc2libGUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmNzcygnb3BhY2l0eScsIDApLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcGFyZW50T2Zmc2V0RGlmZiA9ICRjb250YWluZXIub2Zmc2V0UGFyZW50KCkub2Zmc2V0KCk7XHJcbiAgICAgICAgICAgICAgICBzdHlsZXMudG9wIC09IHBhcmVudE9mZnNldERpZmYudG9wO1xyXG4gICAgICAgICAgICAgICAgc3R5bGVzLmxlZnQgLT0gcGFyZW50T2Zmc2V0RGlmZi5sZWZ0O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghdGhhdC52aXNpYmxlKXtcclxuICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmNzcygnb3BhY2l0eScsIG9wYWNpdHkpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gLTJweCB0byBhY2NvdW50IGZvciBzdWdnZXN0aW9ucyBib3JkZXIuXHJcbiAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMud2lkdGggPT09ICdhdXRvJykge1xyXG4gICAgICAgICAgICAgICAgc3R5bGVzLndpZHRoID0gKHRoYXQuZWwub3V0ZXJXaWR0aCgpIC0gMikgKyAncHgnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAkY29udGFpbmVyLmNzcyhzdHlsZXMpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGVuYWJsZUtpbGxlckZuOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrLmF1dG9jb21wbGV0ZScsIHRoYXQua2lsbGVyRm4pO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGRpc2FibGVLaWxsZXJGbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suYXV0b2NvbXBsZXRlJywgdGhhdC5raWxsZXJGbik7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAga2lsbFN1Z2dlc3Rpb25zOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgdGhhdC5zdG9wS2lsbFN1Z2dlc3Rpb25zKCk7XHJcbiAgICAgICAgICAgIHRoYXQuaW50ZXJ2YWxJZCA9IHdpbmRvdy5zZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhhdC52aXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGF0LnN0b3BLaWxsU3VnZ2VzdGlvbnMoKTtcclxuICAgICAgICAgICAgfSwgNTApO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHN0b3BLaWxsU3VnZ2VzdGlvbnM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbElkKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBpc0N1cnNvckF0RW5kOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIHZhbExlbmd0aCA9IHRoYXQuZWwudmFsKCkubGVuZ3RoLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uU3RhcnQgPSB0aGF0LmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQsXHJcbiAgICAgICAgICAgICAgICByYW5nZTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2VsZWN0aW9uU3RhcnQgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZWN0aW9uU3RhcnQgPT09IHZhbExlbmd0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICByYW5nZSA9IGRvY3VtZW50LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSgpO1xyXG4gICAgICAgICAgICAgICAgcmFuZ2UubW92ZVN0YXJ0KCdjaGFyYWN0ZXInLCAtdmFsTGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWxMZW5ndGggPT09IHJhbmdlLnRleHQubGVuZ3RoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG9uS2V5UHJlc3M6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIC8vIElmIHN1Z2dlc3Rpb25zIGFyZSBoaWRkZW4gYW5kIHVzZXIgcHJlc3NlcyBhcnJvdyBkb3duLCBkaXNwbGF5IHN1Z2dlc3Rpb25zOlxyXG4gICAgICAgICAgICBpZiAoIXRoYXQuZGlzYWJsZWQgJiYgIXRoYXQudmlzaWJsZSAmJiBlLndoaWNoID09PSBrZXlzLkRPV04gJiYgdGhhdC5jdXJyZW50VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhhdC5kaXNhYmxlZCB8fCAhdGhhdC52aXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLkVTQzpcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmN1cnJlbnRWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuUklHSFQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuaGludCAmJiB0aGF0Lm9wdGlvbnMub25IaW50ICYmIHRoYXQuaXNDdXJzb3JBdEVuZCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0SGludCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlRBQjpcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5oaW50ICYmIHRoYXQub3B0aW9ucy5vbkhpbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RIaW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QodGhhdC5zZWxlY3RlZEluZGV4KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLnRhYkRpc2FibGVkID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlJFVFVSTjpcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCh0aGF0LnNlbGVjdGVkSW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlVQOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQubW92ZVVwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuRE9XTjpcclxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm1vdmVEb3duKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQ2FuY2VsIGV2ZW50IGlmIGZ1bmN0aW9uIGRpZCBub3QgcmV0dXJuOlxyXG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgb25LZXlVcDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuZGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc3dpdGNoIChlLndoaWNoKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuVVA6XHJcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuRE9XTjpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LmN1cnJlbnRWYWx1ZSAhPT0gdGhhdC5lbC52YWwoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5maW5kQmVzdEhpbnQoKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMuZGVmZXJSZXF1ZXN0QnkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRGVmZXIgbG9va3VwIGluIGNhc2Ugd2hlbiB2YWx1ZSBjaGFuZ2VzIHZlcnkgcXVpY2tseTpcclxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQub25WYWx1ZUNoYW5nZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIHRoYXQub3B0aW9ucy5kZWZlclJlcXVlc3RCeSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQub25WYWx1ZUNoYW5nZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgb25WYWx1ZUNoYW5nZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGF0LmVsLnZhbCgpLFxyXG4gICAgICAgICAgICAgICAgcXVlcnkgPSB0aGF0LmdldFF1ZXJ5KHZhbHVlKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGlvbiAmJiB0aGF0LmN1cnJlbnRWYWx1ZSAhPT0gcXVlcnkpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIChvcHRpb25zLm9uSW52YWxpZGF0ZVNlbGVjdGlvbiB8fCAkLm5vb3ApLmNhbGwodGhhdC5lbGVtZW50KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICB0aGF0LmN1cnJlbnRWYWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcclxuXHJcbiAgICAgICAgICAgIC8vIENoZWNrIGV4aXN0aW5nIHN1Z2dlc3Rpb24gZm9yIHRoZSBtYXRjaCBiZWZvcmUgcHJvY2VlZGluZzpcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dCAmJiB0aGF0LmlzRXhhY3RNYXRjaChxdWVyeSkpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KDApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAocXVlcnkubGVuZ3RoIDwgb3B0aW9ucy5taW5DaGFycykge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmdldFN1Z2dlc3Rpb25zKHF1ZXJ5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGlzRXhhY3RNYXRjaDogZnVuY3Rpb24gKHF1ZXJ5KSB7XHJcbiAgICAgICAgICAgIHZhciBzdWdnZXN0aW9ucyA9IHRoaXMuc3VnZ2VzdGlvbnM7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gKHN1Z2dlc3Rpb25zLmxlbmd0aCA9PT0gMSAmJiBzdWdnZXN0aW9uc1swXS52YWx1ZS50b0xvd2VyQ2FzZSgpID09PSBxdWVyeS50b0xvd2VyQ2FzZSgpKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBnZXRRdWVyeTogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWxpbWl0ZXIgPSB0aGlzLm9wdGlvbnMuZGVsaW1pdGVyLFxyXG4gICAgICAgICAgICAgICAgcGFydHM7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWRlbGltaXRlcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBhcnRzID0gdmFsdWUuc3BsaXQoZGVsaW1pdGVyKTtcclxuICAgICAgICAgICAgcmV0dXJuICQudHJpbShwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZ2V0U3VnZ2VzdGlvbnNMb2NhbDogZnVuY3Rpb24gKHF1ZXJ5KSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgICBxdWVyeUxvd2VyQ2FzZSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCksXHJcbiAgICAgICAgICAgICAgICBmaWx0ZXIgPSBvcHRpb25zLmxvb2t1cEZpbHRlcixcclxuICAgICAgICAgICAgICAgIGxpbWl0ID0gcGFyc2VJbnQob3B0aW9ucy5sb29rdXBMaW1pdCwgMTApLFxyXG4gICAgICAgICAgICAgICAgZGF0YTtcclxuXHJcbiAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9uczogJC5ncmVwKG9wdGlvbnMubG9va3VwLCBmdW5jdGlvbiAoc3VnZ2VzdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWx0ZXIoc3VnZ2VzdGlvbiwgcXVlcnksIHF1ZXJ5TG93ZXJDYXNlKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBpZiAobGltaXQgJiYgZGF0YS5zdWdnZXN0aW9ucy5sZW5ndGggPiBsaW1pdCkge1xyXG4gICAgICAgICAgICAgICAgZGF0YS5zdWdnZXN0aW9ucyA9IGRhdGEuc3VnZ2VzdGlvbnMuc2xpY2UoMCwgbGltaXQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBnZXRTdWdnZXN0aW9uczogZnVuY3Rpb24gKHEpIHtcclxuICAgICAgICAgICAgdmFyIHJlc3BvbnNlLFxyXG4gICAgICAgICAgICAgICAgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgc2VydmljZVVybCA9IG9wdGlvbnMuc2VydmljZVVybCxcclxuICAgICAgICAgICAgICAgIHBhcmFtcyxcclxuICAgICAgICAgICAgICAgIGNhY2hlS2V5LFxyXG4gICAgICAgICAgICAgICAgYWpheFNldHRpbmdzO1xyXG5cclxuICAgICAgICAgICAgb3B0aW9ucy5wYXJhbXNbb3B0aW9ucy5wYXJhbU5hbWVdID0gcTtcclxuICAgICAgICAgICAgcGFyYW1zID0gb3B0aW9ucy5pZ25vcmVQYXJhbXMgPyBudWxsIDogb3B0aW9ucy5wYXJhbXM7XHJcblxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5vblNlYXJjaFN0YXJ0LmNhbGwodGhhdC5lbGVtZW50LCBvcHRpb25zLnBhcmFtcykgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24ob3B0aW9ucy5sb29rdXApKXtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMubG9va3VwKHEsIGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IGRhdGEuc3VnZ2VzdGlvbnM7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaENvbXBsZXRlLmNhbGwodGhhdC5lbGVtZW50LCBxLCBkYXRhLnN1Z2dlc3Rpb25zKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhhdC5pc0xvY2FsKSB7XHJcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IHRoYXQuZ2V0U3VnZ2VzdGlvbnNMb2NhbChxKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24oc2VydmljZVVybCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlVXJsID0gc2VydmljZVVybC5jYWxsKHRoYXQuZWxlbWVudCwgcSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYWNoZUtleSA9IHNlcnZpY2VVcmwgKyAnPycgKyAkLnBhcmFtKHBhcmFtcyB8fCB7fSk7XHJcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IHRoYXQuY2FjaGVkUmVzcG9uc2VbY2FjaGVLZXldO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAocmVzcG9uc2UgJiYgJC5pc0FycmF5KHJlc3BvbnNlLnN1Z2dlc3Rpb25zKSkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IHJlc3BvbnNlLnN1Z2dlc3Rpb25zO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIHJlc3BvbnNlLnN1Z2dlc3Rpb25zKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghdGhhdC5pc0JhZFF1ZXJ5KHEpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmFib3J0QWpheCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGFqYXhTZXR0aW5ncyA9IHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IHNlcnZpY2VVcmwsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogcGFyYW1zLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IG9wdGlvbnMudHlwZSxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogb3B0aW9ucy5kYXRhVHlwZVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAkLmV4dGVuZChhamF4U2V0dGluZ3MsIG9wdGlvbnMuYWpheFNldHRpbmdzKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0ID0gJC5hamF4KGFqYXhTZXR0aW5ncykuZG9uZShmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5jdXJyZW50UmVxdWVzdCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gb3B0aW9ucy50cmFuc2Zvcm1SZXN1bHQoZGF0YSwgcSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5wcm9jZXNzUmVzcG9uc2UocmVzdWx0LCBxLCBjYWNoZUtleSk7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaENvbXBsZXRlLmNhbGwodGhhdC5lbGVtZW50LCBxLCByZXN1bHQuc3VnZ2VzdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgfSkuZmFpbChmdW5jdGlvbiAoanFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaEVycm9yLmNhbGwodGhhdC5lbGVtZW50LCBxLCBqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIFtdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGlzQmFkUXVlcnk6IGZ1bmN0aW9uIChxKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5vcHRpb25zLnByZXZlbnRCYWRRdWVyaWVzKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIGJhZFF1ZXJpZXMgPSB0aGlzLmJhZFF1ZXJpZXMsXHJcbiAgICAgICAgICAgICAgICBpID0gYmFkUXVlcmllcy5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAoaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocS5pbmRleE9mKGJhZFF1ZXJpZXNbaV0pID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBoaWRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKHRoYXQub3B0aW9ucy5vbkhpZGUpICYmIHRoYXQudmlzaWJsZSkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5vcHRpb25zLm9uSGlkZS5jYWxsKHRoYXQuZWxlbWVudCwgY29udGFpbmVyKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhhdC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xyXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuaGlkZSgpO1xyXG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQobnVsbCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc3VnZ2VzdDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zdWdnZXN0aW9ucy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2hvd05vU3VnZ2VzdGlvbk5vdGljZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm9TdWdnZXN0aW9ucygpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcclxuICAgICAgICAgICAgICAgIGdyb3VwQnkgPSBvcHRpb25zLmdyb3VwQnksXHJcbiAgICAgICAgICAgICAgICBmb3JtYXRSZXN1bHQgPSBvcHRpb25zLmZvcm1hdFJlc3VsdCxcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gdGhhdC5nZXRRdWVyeSh0aGF0LmN1cnJlbnRWYWx1ZSksXHJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSB0aGF0LmNsYXNzZXMuc3VnZ2VzdGlvbixcclxuICAgICAgICAgICAgICAgIGNsYXNzU2VsZWN0ZWQgPSB0aGF0LmNsYXNzZXMuc2VsZWN0ZWQsXHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxyXG4gICAgICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQodGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyKSxcclxuICAgICAgICAgICAgICAgIGJlZm9yZVJlbmRlciA9IG9wdGlvbnMuYmVmb3JlUmVuZGVyLFxyXG4gICAgICAgICAgICAgICAgaHRtbCA9ICcnLFxyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBmb3JtYXRHcm91cCA9IGZ1bmN0aW9uIChzdWdnZXN0aW9uLCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudENhdGVnb3J5ID0gc3VnZ2VzdGlvbi5kYXRhW2dyb3VwQnldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhdGVnb3J5ID09PSBjdXJyZW50Q2F0ZWdvcnkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeSA9IGN1cnJlbnRDYXRlZ29yeTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImF1dG9jb21wbGV0ZS1ncm91cFwiPjxzdHJvbmc+JyArIGNhdGVnb3J5ICsgJzwvc3Ryb25nPjwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQgJiYgdGhhdC5pc0V4YWN0TWF0Y2godmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCgwKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQnVpbGQgc3VnZ2VzdGlvbnMgaW5uZXIgSFRNTDpcclxuICAgICAgICAgICAgJC5lYWNoKHRoYXQuc3VnZ2VzdGlvbnMsIGZ1bmN0aW9uIChpLCBzdWdnZXN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZ3JvdXBCeSl7XHJcbiAgICAgICAgICAgICAgICAgICAgaHRtbCArPSBmb3JtYXRHcm91cChzdWdnZXN0aW9uLCB2YWx1ZSwgaSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cIicgKyBjbGFzc05hbWUgKyAnXCIgZGF0YS1pbmRleD1cIicgKyBpICsgJ1wiPicgKyBmb3JtYXRSZXN1bHQoc3VnZ2VzdGlvbiwgdmFsdWUpICsgJzwvZGl2Pic7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hZGp1c3RDb250YWluZXJXaWR0aCgpO1xyXG5cclxuICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lci5kZXRhY2goKTtcclxuICAgICAgICAgICAgY29udGFpbmVyLmh0bWwoaHRtbCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKGJlZm9yZVJlbmRlcikpIHtcclxuICAgICAgICAgICAgICAgIGJlZm9yZVJlbmRlci5jYWxsKHRoYXQuZWxlbWVudCwgY29udGFpbmVyKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xyXG4gICAgICAgICAgICBjb250YWluZXIuc2hvdygpO1xyXG5cclxuICAgICAgICAgICAgLy8gU2VsZWN0IGZpcnN0IHZhbHVlIGJ5IGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmF1dG9TZWxlY3RGaXJzdCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gMDtcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5zY3JvbGxUb3AoMCk7XHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIuY2hpbGRyZW4oJy4nICsgY2xhc3NOYW1lKS5maXJzdCgpLmFkZENsYXNzKGNsYXNzU2VsZWN0ZWQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGF0LnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGF0LmZpbmRCZXN0SGludCgpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG5vU3VnZ2VzdGlvbnM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXHJcbiAgICAgICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQodGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWRqdXN0Q29udGFpbmVyV2lkdGgoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNvbWUgZXhwbGljaXQgc3RlcHMuIEJlIGNhcmVmdWwgaGVyZSBhcyBpdCBlYXN5IHRvIGdldFxyXG4gICAgICAgICAgICAvLyBub1N1Z2dlc3Rpb25zQ29udGFpbmVyIHJlbW92ZWQgZnJvbSBET00gaWYgbm90IGRldGFjaGVkIHByb3Blcmx5LlxyXG4gICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyLmRldGFjaCgpO1xyXG4gICAgICAgICAgICBjb250YWluZXIuZW1wdHkoKTsgLy8gY2xlYW4gc3VnZ2VzdGlvbnMgaWYgYW55XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmQobm9TdWdnZXN0aW9uc0NvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICBjb250YWluZXIuc2hvdygpO1xyXG4gICAgICAgICAgICB0aGF0LnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGFkanVzdENvbnRhaW5lcldpZHRoOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcclxuICAgICAgICAgICAgICAgIHdpZHRoLFxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIHdpZHRoIGlzIGF1dG8sIGFkanVzdCB3aWR0aCBiZWZvcmUgZGlzcGxheWluZyBzdWdnZXN0aW9ucyxcclxuICAgICAgICAgICAgLy8gYmVjYXVzZSBpZiBpbnN0YW5jZSB3YXMgY3JlYXRlZCBiZWZvcmUgaW5wdXQgaGFkIHdpZHRoLCBpdCB3aWxsIGJlIHplcm8uXHJcbiAgICAgICAgICAgIC8vIEFsc28gaXQgYWRqdXN0cyBpZiBpbnB1dCB3aWR0aCBoYXMgY2hhbmdlZC5cclxuICAgICAgICAgICAgLy8gLTJweCB0byBhY2NvdW50IGZvciBzdWdnZXN0aW9ucyBib3JkZXIuXHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLndpZHRoID09PSAnYXV0bycpIHtcclxuICAgICAgICAgICAgICAgIHdpZHRoID0gdGhhdC5lbC5vdXRlcldpZHRoKCkgLSAyO1xyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyLndpZHRoKHdpZHRoID4gMCA/IHdpZHRoIDogMzAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGZpbmRCZXN0SGludDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoYXQuZWwudmFsKCkudG9Mb3dlckNhc2UoKSxcclxuICAgICAgICAgICAgICAgIGJlc3RNYXRjaCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICQuZWFjaCh0aGF0LnN1Z2dlc3Rpb25zLCBmdW5jdGlvbiAoaSwgc3VnZ2VzdGlvbikge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZvdW5kTWF0Y2ggPSBzdWdnZXN0aW9uLnZhbHVlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZih2YWx1ZSkgPT09IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAoZm91bmRNYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaCA9IHN1Z2dlc3Rpb247XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gIWZvdW5kTWF0Y2g7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KGJlc3RNYXRjaCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2lnbmFsSGludDogZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcclxuICAgICAgICAgICAgdmFyIGhpbnRWYWx1ZSA9ICcnLFxyXG4gICAgICAgICAgICAgICAgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgIGlmIChzdWdnZXN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBoaW50VmFsdWUgPSB0aGF0LmN1cnJlbnRWYWx1ZSArIHN1Z2dlc3Rpb24udmFsdWUuc3Vic3RyKHRoYXQuY3VycmVudFZhbHVlLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoYXQuaGludFZhbHVlICE9PSBoaW50VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuaGludFZhbHVlID0gaGludFZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5oaW50ID0gc3VnZ2VzdGlvbjtcclxuICAgICAgICAgICAgICAgICh0aGlzLm9wdGlvbnMub25IaW50IHx8ICQubm9vcCkoaGludFZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHZlcmlmeVN1Z2dlc3Rpb25zRm9ybWF0OiBmdW5jdGlvbiAoc3VnZ2VzdGlvbnMpIHtcclxuICAgICAgICAgICAgLy8gSWYgc3VnZ2VzdGlvbnMgaXMgc3RyaW5nIGFycmF5LCBjb252ZXJ0IHRoZW0gdG8gc3VwcG9ydGVkIGZvcm1hdDpcclxuICAgICAgICAgICAgaWYgKHN1Z2dlc3Rpb25zLmxlbmd0aCAmJiB0eXBlb2Ygc3VnZ2VzdGlvbnNbMF0gPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJC5tYXAoc3VnZ2VzdGlvbnMsIGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiB2YWx1ZSwgZGF0YTogbnVsbCB9O1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdWdnZXN0aW9ucztcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICB2YWxpZGF0ZU9yaWVudGF0aW9uOiBmdW5jdGlvbihvcmllbnRhdGlvbiwgZmFsbGJhY2spIHtcclxuICAgICAgICAgICAgb3JpZW50YXRpb24gPSAkLnRyaW0ob3JpZW50YXRpb24gfHwgJycpLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gICAgICAgICAgICBpZigkLmluQXJyYXkob3JpZW50YXRpb24sIFsnYXV0bycsICdib3R0b20nLCAndG9wJ10pID09PSAtMSl7XHJcbiAgICAgICAgICAgICAgICBvcmllbnRhdGlvbiA9IGZhbGxiYWNrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gb3JpZW50YXRpb247XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgcHJvY2Vzc1Jlc3BvbnNlOiBmdW5jdGlvbiAocmVzdWx0LCBvcmlnaW5hbFF1ZXJ5LCBjYWNoZUtleSkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zO1xyXG5cclxuICAgICAgICAgICAgcmVzdWx0LnN1Z2dlc3Rpb25zID0gdGhhdC52ZXJpZnlTdWdnZXN0aW9uc0Zvcm1hdChyZXN1bHQuc3VnZ2VzdGlvbnMpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ2FjaGUgcmVzdWx0cyBpZiBjYWNoZSBpcyBub3QgZGlzYWJsZWQ6XHJcbiAgICAgICAgICAgIGlmICghb3B0aW9ucy5ub0NhY2hlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmNhY2hlZFJlc3BvbnNlW2NhY2hlS2V5XSA9IHJlc3VsdDtcclxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnByZXZlbnRCYWRRdWVyaWVzICYmIHJlc3VsdC5zdWdnZXN0aW9ucy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmJhZFF1ZXJpZXMucHVzaChvcmlnaW5hbFF1ZXJ5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gUmV0dXJuIGlmIG9yaWdpbmFsUXVlcnkgaXMgbm90IG1hdGNoaW5nIGN1cnJlbnQgcXVlcnk6XHJcbiAgICAgICAgICAgIGlmIChvcmlnaW5hbFF1ZXJ5ICE9PSB0aGF0LmdldFF1ZXJ5KHRoYXQuY3VycmVudFZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gcmVzdWx0LnN1Z2dlc3Rpb25zO1xyXG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBhY3RpdmF0ZTogZnVuY3Rpb24gKGluZGV4KSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIGFjdGl2ZUl0ZW0sXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZCA9IHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCxcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlbiA9IGNvbnRhaW5lci5maW5kKCcuJyArIHRoYXQuY2xhc3Nlcy5zdWdnZXN0aW9uKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5maW5kKCcuJyArIHNlbGVjdGVkKS5yZW1vdmVDbGFzcyhzZWxlY3RlZCk7XHJcblxyXG4gICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSBpbmRleDtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggIT09IC0xICYmIGNoaWxkcmVuLmxlbmd0aCA+IHRoYXQuc2VsZWN0ZWRJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgYWN0aXZlSXRlbSA9IGNoaWxkcmVuLmdldCh0aGF0LnNlbGVjdGVkSW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgJChhY3RpdmVJdGVtKS5hZGRDbGFzcyhzZWxlY3RlZCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYWN0aXZlSXRlbTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2VsZWN0SGludDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBpID0gJC5pbkFycmF5KHRoYXQuaGludCwgdGhhdC5zdWdnZXN0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICB0aGF0LnNlbGVjdChpKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzZWxlY3Q6IGZ1bmN0aW9uIChpKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgdGhhdC5oaWRlKCk7XHJcbiAgICAgICAgICAgIHRoYXQub25TZWxlY3QoaSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgbW92ZVVwOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuY2hpbGRyZW4oKS5maXJzdCgpLnJlbW92ZUNsYXNzKHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCk7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcclxuICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHRoYXQuZmluZEJlc3RIaW50KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoYXQuYWRqdXN0U2Nyb2xsKHRoYXQuc2VsZWN0ZWRJbmRleCAtIDEpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG1vdmVEb3duOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09ICh0aGF0LnN1Z2dlc3Rpb25zLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoYXQuYWRqdXN0U2Nyb2xsKHRoYXQuc2VsZWN0ZWRJbmRleCArIDEpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGFkanVzdFNjcm9sbDogZnVuY3Rpb24gKGluZGV4KSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIGFjdGl2ZUl0ZW0gPSB0aGF0LmFjdGl2YXRlKGluZGV4KTtcclxuXHJcbiAgICAgICAgICAgIGlmICghYWN0aXZlSXRlbSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0VG9wLFxyXG4gICAgICAgICAgICAgICAgdXBwZXJCb3VuZCxcclxuICAgICAgICAgICAgICAgIGxvd2VyQm91bmQsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHREZWx0YSA9ICQoYWN0aXZlSXRlbSkub3V0ZXJIZWlnaHQoKTtcclxuXHJcbiAgICAgICAgICAgIG9mZnNldFRvcCA9IGFjdGl2ZUl0ZW0ub2Zmc2V0VG9wO1xyXG4gICAgICAgICAgICB1cHBlckJvdW5kID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5zY3JvbGxUb3AoKTtcclxuICAgICAgICAgICAgbG93ZXJCb3VuZCA9IHVwcGVyQm91bmQgKyB0aGF0Lm9wdGlvbnMubWF4SGVpZ2h0IC0gaGVpZ2h0RGVsdGE7XHJcblxyXG4gICAgICAgICAgICBpZiAob2Zmc2V0VG9wIDwgdXBwZXJCb3VuZCkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5zY3JvbGxUb3Aob2Zmc2V0VG9wKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChvZmZzZXRUb3AgPiBsb3dlckJvdW5kKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnNjcm9sbFRvcChvZmZzZXRUb3AgLSB0aGF0Lm9wdGlvbnMubWF4SGVpZ2h0ICsgaGVpZ2h0RGVsdGEpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRoYXQub3B0aW9ucy5wcmVzZXJ2ZUlucHV0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmdldFZhbHVlKHRoYXQuc3VnZ2VzdGlvbnNbaW5kZXhdLnZhbHVlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KG51bGwpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG9uU2VsZWN0OiBmdW5jdGlvbiAoaW5kZXgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgb25TZWxlY3RDYWxsYmFjayA9IHRoYXQub3B0aW9ucy5vblNlbGVjdCxcclxuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb24gPSB0aGF0LnN1Z2dlc3Rpb25zW2luZGV4XTtcclxuXHJcbiAgICAgICAgICAgIHRoYXQuY3VycmVudFZhbHVlID0gdGhhdC5nZXRWYWx1ZShzdWdnZXN0aW9uLnZhbHVlKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LmN1cnJlbnRWYWx1ZSAhPT0gdGhhdC5lbC52YWwoKSAmJiAhdGhhdC5vcHRpb25zLnByZXNlcnZlSW5wdXQpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KG51bGwpO1xyXG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gW107XHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uID0gc3VnZ2VzdGlvbjtcclxuXHJcbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24ob25TZWxlY3RDYWxsYmFjaykpIHtcclxuICAgICAgICAgICAgICAgIG9uU2VsZWN0Q2FsbGJhY2suY2FsbCh0aGF0LmVsZW1lbnQsIHN1Z2dlc3Rpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZ2V0VmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBkZWxpbWl0ZXIgPSB0aGF0Lm9wdGlvbnMuZGVsaW1pdGVyLFxyXG4gICAgICAgICAgICAgICAgY3VycmVudFZhbHVlLFxyXG4gICAgICAgICAgICAgICAgcGFydHM7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWRlbGltaXRlcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjdXJyZW50VmFsdWUgPSB0aGF0LmN1cnJlbnRWYWx1ZTtcclxuICAgICAgICAgICAgcGFydHMgPSBjdXJyZW50VmFsdWUuc3BsaXQoZGVsaW1pdGVyKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRWYWx1ZS5zdWJzdHIoMCwgY3VycmVudFZhbHVlLmxlbmd0aCAtIHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdLmxlbmd0aCkgKyB2YWx1ZTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBkaXNwb3NlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgdGhhdC5lbC5vZmYoJy5hdXRvY29tcGxldGUnKS5yZW1vdmVEYXRhKCdhdXRvY29tcGxldGUnKTtcclxuICAgICAgICAgICAgdGhhdC5kaXNhYmxlS2lsbGVyRm4oKTtcclxuICAgICAgICAgICAgJCh3aW5kb3cpLm9mZigncmVzaXplLmF1dG9jb21wbGV0ZScsIHRoYXQuZml4UG9zaXRpb25DYXB0dXJlKTtcclxuICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5yZW1vdmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIENyZWF0ZSBjaGFpbmFibGUgalF1ZXJ5IHBsdWdpbjpcclxuICAgICQuZm4uYXV0b2NvbXBsZXRlID0gJC5mbi5kZXZicmlkZ2VBdXRvY29tcGxldGUgPSBmdW5jdGlvbiAob3B0aW9ucywgYXJncykge1xyXG4gICAgICAgIHZhciBkYXRhS2V5ID0gJ2F1dG9jb21wbGV0ZSc7XHJcbiAgICAgICAgLy8gSWYgZnVuY3Rpb24gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50IHJldHVyblxyXG4gICAgICAgIC8vIGluc3RhbmNlIG9mIHRoZSBmaXJzdCBtYXRjaGVkIGVsZW1lbnQ6XHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlyc3QoKS5kYXRhKGRhdGFLZXkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBpbnB1dEVsZW1lbnQgPSAkKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBpbnB1dEVsZW1lbnQuZGF0YShkYXRhS2V5KTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZSAmJiB0eXBlb2YgaW5zdGFuY2Vbb3B0aW9uc10gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZVtvcHRpb25zXShhcmdzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIGluc3RhbmNlIGFscmVhZHkgZXhpc3RzLCBkZXN0cm95IGl0OlxyXG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlICYmIGluc3RhbmNlLmRpc3Bvc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IG5ldyBBdXRvY29tcGxldGUodGhpcywgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICBpbnB1dEVsZW1lbnQuZGF0YShkYXRhS2V5LCBpbnN0YW5jZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbn0pKTtcclxuIiwiLyohIFNlbGVjdDIgNC4wLjMgfCBodHRwczovL2dpdGh1Yi5jb20vc2VsZWN0Mi9zZWxlY3QyL2Jsb2IvbWFzdGVyL0xJQ0VOU0UubWQgKi8hZnVuY3Rpb24oYSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXCJqcXVlcnlcIl0sYSk6YShcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cz9yZXF1aXJlKFwianF1ZXJ5XCIpOmpRdWVyeSl9KGZ1bmN0aW9uKGEpe3ZhciBiPWZ1bmN0aW9uKCl7aWYoYSYmYS5mbiYmYS5mbi5zZWxlY3QyJiZhLmZuLnNlbGVjdDIuYW1kKXZhciBiPWEuZm4uc2VsZWN0Mi5hbWQ7dmFyIGI7cmV0dXJuIGZ1bmN0aW9uKCl7aWYoIWJ8fCFiLnJlcXVpcmVqcyl7Yj9jPWI6Yj17fTt2YXIgYSxjLGQ7IWZ1bmN0aW9uKGIpe2Z1bmN0aW9uIGUoYSxiKXtyZXR1cm4gdS5jYWxsKGEsYil9ZnVuY3Rpb24gZihhLGIpe3ZhciBjLGQsZSxmLGcsaCxpLGosayxsLG0sbj1iJiZiLnNwbGl0KFwiL1wiKSxvPXMubWFwLHA9byYmb1tcIipcIl18fHt9O2lmKGEmJlwiLlwiPT09YS5jaGFyQXQoMCkpaWYoYil7Zm9yKGE9YS5zcGxpdChcIi9cIiksZz1hLmxlbmd0aC0xLHMubm9kZUlkQ29tcGF0JiZ3LnRlc3QoYVtnXSkmJihhW2ddPWFbZ10ucmVwbGFjZSh3LFwiXCIpKSxhPW4uc2xpY2UoMCxuLmxlbmd0aC0xKS5jb25jYXQoYSksaz0wO2s8YS5sZW5ndGg7ays9MSlpZihtPWFba10sXCIuXCI9PT1tKWEuc3BsaWNlKGssMSksay09MTtlbHNlIGlmKFwiLi5cIj09PW0pe2lmKDE9PT1rJiYoXCIuLlwiPT09YVsyXXx8XCIuLlwiPT09YVswXSkpYnJlYWs7az4wJiYoYS5zcGxpY2Uoay0xLDIpLGstPTIpfWE9YS5qb2luKFwiL1wiKX1lbHNlIDA9PT1hLmluZGV4T2YoXCIuL1wiKSYmKGE9YS5zdWJzdHJpbmcoMikpO2lmKChufHxwKSYmbyl7Zm9yKGM9YS5zcGxpdChcIi9cIiksaz1jLmxlbmd0aDtrPjA7ay09MSl7aWYoZD1jLnNsaWNlKDAsaykuam9pbihcIi9cIiksbilmb3IobD1uLmxlbmd0aDtsPjA7bC09MSlpZihlPW9bbi5zbGljZSgwLGwpLmpvaW4oXCIvXCIpXSxlJiYoZT1lW2RdKSl7Zj1lLGg9azticmVha31pZihmKWJyZWFrOyFpJiZwJiZwW2RdJiYoaT1wW2RdLGo9ayl9IWYmJmkmJihmPWksaD1qKSxmJiYoYy5zcGxpY2UoMCxoLGYpLGE9Yy5qb2luKFwiL1wiKSl9cmV0dXJuIGF9ZnVuY3Rpb24gZyhhLGMpe3JldHVybiBmdW5jdGlvbigpe3ZhciBkPXYuY2FsbChhcmd1bWVudHMsMCk7cmV0dXJuXCJzdHJpbmdcIiE9dHlwZW9mIGRbMF0mJjE9PT1kLmxlbmd0aCYmZC5wdXNoKG51bGwpLG4uYXBwbHkoYixkLmNvbmNhdChbYSxjXSkpfX1mdW5jdGlvbiBoKGEpe3JldHVybiBmdW5jdGlvbihiKXtyZXR1cm4gZihiLGEpfX1mdW5jdGlvbiBpKGEpe3JldHVybiBmdW5jdGlvbihiKXtxW2FdPWJ9fWZ1bmN0aW9uIGooYSl7aWYoZShyLGEpKXt2YXIgYz1yW2FdO2RlbGV0ZSByW2FdLHRbYV09ITAsbS5hcHBseShiLGMpfWlmKCFlKHEsYSkmJiFlKHQsYSkpdGhyb3cgbmV3IEVycm9yKFwiTm8gXCIrYSk7cmV0dXJuIHFbYV19ZnVuY3Rpb24gayhhKXt2YXIgYixjPWE/YS5pbmRleE9mKFwiIVwiKTotMTtyZXR1cm4gYz4tMSYmKGI9YS5zdWJzdHJpbmcoMCxjKSxhPWEuc3Vic3RyaW5nKGMrMSxhLmxlbmd0aCkpLFtiLGFdfWZ1bmN0aW9uIGwoYSl7cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIHMmJnMuY29uZmlnJiZzLmNvbmZpZ1thXXx8e319fXZhciBtLG4sbyxwLHE9e30scj17fSxzPXt9LHQ9e30sdT1PYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LHY9W10uc2xpY2Usdz0vXFwuanMkLztvPWZ1bmN0aW9uKGEsYil7dmFyIGMsZD1rKGEpLGU9ZFswXTtyZXR1cm4gYT1kWzFdLGUmJihlPWYoZSxiKSxjPWooZSkpLGU/YT1jJiZjLm5vcm1hbGl6ZT9jLm5vcm1hbGl6ZShhLGgoYikpOmYoYSxiKTooYT1mKGEsYiksZD1rKGEpLGU9ZFswXSxhPWRbMV0sZSYmKGM9aihlKSkpLHtmOmU/ZStcIiFcIithOmEsbjphLHByOmUscDpjfX0scD17cmVxdWlyZTpmdW5jdGlvbihhKXtyZXR1cm4gZyhhKX0sZXhwb3J0czpmdW5jdGlvbihhKXt2YXIgYj1xW2FdO3JldHVyblwidW5kZWZpbmVkXCIhPXR5cGVvZiBiP2I6cVthXT17fX0sbW9kdWxlOmZ1bmN0aW9uKGEpe3JldHVybntpZDphLHVyaTpcIlwiLGV4cG9ydHM6cVthXSxjb25maWc6bChhKX19fSxtPWZ1bmN0aW9uKGEsYyxkLGYpe3ZhciBoLGssbCxtLG4scyx1PVtdLHY9dHlwZW9mIGQ7aWYoZj1mfHxhLFwidW5kZWZpbmVkXCI9PT12fHxcImZ1bmN0aW9uXCI9PT12KXtmb3IoYz0hYy5sZW5ndGgmJmQubGVuZ3RoP1tcInJlcXVpcmVcIixcImV4cG9ydHNcIixcIm1vZHVsZVwiXTpjLG49MDtuPGMubGVuZ3RoO24rPTEpaWYobT1vKGNbbl0sZiksaz1tLmYsXCJyZXF1aXJlXCI9PT1rKXVbbl09cC5yZXF1aXJlKGEpO2Vsc2UgaWYoXCJleHBvcnRzXCI9PT1rKXVbbl09cC5leHBvcnRzKGEpLHM9ITA7ZWxzZSBpZihcIm1vZHVsZVwiPT09ayloPXVbbl09cC5tb2R1bGUoYSk7ZWxzZSBpZihlKHEsayl8fGUocixrKXx8ZSh0LGspKXVbbl09aihrKTtlbHNle2lmKCFtLnApdGhyb3cgbmV3IEVycm9yKGErXCIgbWlzc2luZyBcIitrKTttLnAubG9hZChtLm4sZyhmLCEwKSxpKGspLHt9KSx1W25dPXFba119bD1kP2QuYXBwbHkocVthXSx1KTp2b2lkIDAsYSYmKGgmJmguZXhwb3J0cyE9PWImJmguZXhwb3J0cyE9PXFbYV0/cVthXT1oLmV4cG9ydHM6bD09PWImJnN8fChxW2FdPWwpKX1lbHNlIGEmJihxW2FdPWQpfSxhPWM9bj1mdW5jdGlvbihhLGMsZCxlLGYpe2lmKFwic3RyaW5nXCI9PXR5cGVvZiBhKXJldHVybiBwW2FdP3BbYV0oYyk6aihvKGEsYykuZik7aWYoIWEuc3BsaWNlKXtpZihzPWEscy5kZXBzJiZuKHMuZGVwcyxzLmNhbGxiYWNrKSwhYylyZXR1cm47Yy5zcGxpY2U/KGE9YyxjPWQsZD1udWxsKTphPWJ9cmV0dXJuIGM9Y3x8ZnVuY3Rpb24oKXt9LFwiZnVuY3Rpb25cIj09dHlwZW9mIGQmJihkPWUsZT1mKSxlP20oYixhLGMsZCk6c2V0VGltZW91dChmdW5jdGlvbigpe20oYixhLGMsZCl9LDQpLG59LG4uY29uZmlnPWZ1bmN0aW9uKGEpe3JldHVybiBuKGEpfSxhLl9kZWZpbmVkPXEsZD1mdW5jdGlvbihhLGIsYyl7aWYoXCJzdHJpbmdcIiE9dHlwZW9mIGEpdGhyb3cgbmV3IEVycm9yKFwiU2VlIGFsbW9uZCBSRUFETUU6IGluY29ycmVjdCBtb2R1bGUgYnVpbGQsIG5vIG1vZHVsZSBuYW1lXCIpO2Iuc3BsaWNlfHwoYz1iLGI9W10pLGUocSxhKXx8ZShyLGEpfHwoclthXT1bYSxiLGNdKX0sZC5hbWQ9e2pRdWVyeTohMH19KCksYi5yZXF1aXJlanM9YSxiLnJlcXVpcmU9YyxiLmRlZmluZT1kfX0oKSxiLmRlZmluZShcImFsbW9uZFwiLGZ1bmN0aW9uKCl7fSksYi5kZWZpbmUoXCJqcXVlcnlcIixbXSxmdW5jdGlvbigpe3ZhciBiPWF8fCQ7cmV0dXJuIG51bGw9PWImJmNvbnNvbGUmJmNvbnNvbGUuZXJyb3ImJmNvbnNvbGUuZXJyb3IoXCJTZWxlY3QyOiBBbiBpbnN0YW5jZSBvZiBqUXVlcnkgb3IgYSBqUXVlcnktY29tcGF0aWJsZSBsaWJyYXJ5IHdhcyBub3QgZm91bmQuIE1ha2Ugc3VyZSB0aGF0IHlvdSBhcmUgaW5jbHVkaW5nIGpRdWVyeSBiZWZvcmUgU2VsZWN0MiBvbiB5b3VyIHdlYiBwYWdlLlwiKSxifSksYi5kZWZpbmUoXCJzZWxlY3QyL3V0aWxzXCIsW1wianF1ZXJ5XCJdLGZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoYSl7dmFyIGI9YS5wcm90b3R5cGUsYz1bXTtmb3IodmFyIGQgaW4gYil7dmFyIGU9YltkXTtcImZ1bmN0aW9uXCI9PXR5cGVvZiBlJiZcImNvbnN0cnVjdG9yXCIhPT1kJiZjLnB1c2goZCl9cmV0dXJuIGN9dmFyIGM9e307Yy5FeHRlbmQ9ZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKCl7dGhpcy5jb25zdHJ1Y3Rvcj1hfXZhciBkPXt9Lmhhc093blByb3BlcnR5O2Zvcih2YXIgZSBpbiBiKWQuY2FsbChiLGUpJiYoYVtlXT1iW2VdKTtyZXR1cm4gYy5wcm90b3R5cGU9Yi5wcm90b3R5cGUsYS5wcm90b3R5cGU9bmV3IGMsYS5fX3N1cGVyX189Yi5wcm90b3R5cGUsYX0sYy5EZWNvcmF0ZT1mdW5jdGlvbihhLGMpe2Z1bmN0aW9uIGQoKXt2YXIgYj1BcnJheS5wcm90b3R5cGUudW5zaGlmdCxkPWMucHJvdG90eXBlLmNvbnN0cnVjdG9yLmxlbmd0aCxlPWEucHJvdG90eXBlLmNvbnN0cnVjdG9yO2Q+MCYmKGIuY2FsbChhcmd1bWVudHMsYS5wcm90b3R5cGUuY29uc3RydWN0b3IpLGU9Yy5wcm90b3R5cGUuY29uc3RydWN0b3IpLGUuYXBwbHkodGhpcyxhcmd1bWVudHMpfWZ1bmN0aW9uIGUoKXt0aGlzLmNvbnN0cnVjdG9yPWR9dmFyIGY9YihjKSxnPWIoYSk7Yy5kaXNwbGF5TmFtZT1hLmRpc3BsYXlOYW1lLGQucHJvdG90eXBlPW5ldyBlO2Zvcih2YXIgaD0wO2g8Zy5sZW5ndGg7aCsrKXt2YXIgaT1nW2hdO2QucHJvdG90eXBlW2ldPWEucHJvdG90eXBlW2ldfWZvcih2YXIgaj0oZnVuY3Rpb24oYSl7dmFyIGI9ZnVuY3Rpb24oKXt9O2EgaW4gZC5wcm90b3R5cGUmJihiPWQucHJvdG90eXBlW2FdKTt2YXIgZT1jLnByb3RvdHlwZVthXTtyZXR1cm4gZnVuY3Rpb24oKXt2YXIgYT1BcnJheS5wcm90b3R5cGUudW5zaGlmdDtyZXR1cm4gYS5jYWxsKGFyZ3VtZW50cyxiKSxlLmFwcGx5KHRoaXMsYXJndW1lbnRzKX19KSxrPTA7azxmLmxlbmd0aDtrKyspe3ZhciBsPWZba107ZC5wcm90b3R5cGVbbF09aihsKX1yZXR1cm4gZH07dmFyIGQ9ZnVuY3Rpb24oKXt0aGlzLmxpc3RlbmVycz17fX07cmV0dXJuIGQucHJvdG90eXBlLm9uPWZ1bmN0aW9uKGEsYil7dGhpcy5saXN0ZW5lcnM9dGhpcy5saXN0ZW5lcnN8fHt9LGEgaW4gdGhpcy5saXN0ZW5lcnM/dGhpcy5saXN0ZW5lcnNbYV0ucHVzaChiKTp0aGlzLmxpc3RlbmVyc1thXT1bYl19LGQucHJvdG90eXBlLnRyaWdnZXI9ZnVuY3Rpb24oYSl7dmFyIGI9QXJyYXkucHJvdG90eXBlLnNsaWNlLGM9Yi5jYWxsKGFyZ3VtZW50cywxKTt0aGlzLmxpc3RlbmVycz10aGlzLmxpc3RlbmVyc3x8e30sbnVsbD09YyYmKGM9W10pLDA9PT1jLmxlbmd0aCYmYy5wdXNoKHt9KSxjWzBdLl90eXBlPWEsYSBpbiB0aGlzLmxpc3RlbmVycyYmdGhpcy5pbnZva2UodGhpcy5saXN0ZW5lcnNbYV0sYi5jYWxsKGFyZ3VtZW50cywxKSksXCIqXCJpbiB0aGlzLmxpc3RlbmVycyYmdGhpcy5pbnZva2UodGhpcy5saXN0ZW5lcnNbXCIqXCJdLGFyZ3VtZW50cyl9LGQucHJvdG90eXBlLmludm9rZT1mdW5jdGlvbihhLGIpe2Zvcih2YXIgYz0wLGQ9YS5sZW5ndGg7ZD5jO2MrKylhW2NdLmFwcGx5KHRoaXMsYil9LGMuT2JzZXJ2YWJsZT1kLGMuZ2VuZXJhdGVDaGFycz1mdW5jdGlvbihhKXtmb3IodmFyIGI9XCJcIixjPTA7YT5jO2MrKyl7dmFyIGQ9TWF0aC5mbG9vcigzNipNYXRoLnJhbmRvbSgpKTtiKz1kLnRvU3RyaW5nKDM2KX1yZXR1cm4gYn0sYy5iaW5kPWZ1bmN0aW9uKGEsYil7cmV0dXJuIGZ1bmN0aW9uKCl7YS5hcHBseShiLGFyZ3VtZW50cyl9fSxjLl9jb252ZXJ0RGF0YT1mdW5jdGlvbihhKXtmb3IodmFyIGIgaW4gYSl7dmFyIGM9Yi5zcGxpdChcIi1cIiksZD1hO2lmKDEhPT1jLmxlbmd0aCl7Zm9yKHZhciBlPTA7ZTxjLmxlbmd0aDtlKyspe3ZhciBmPWNbZV07Zj1mLnN1YnN0cmluZygwLDEpLnRvTG93ZXJDYXNlKCkrZi5zdWJzdHJpbmcoMSksZiBpbiBkfHwoZFtmXT17fSksZT09Yy5sZW5ndGgtMSYmKGRbZl09YVtiXSksZD1kW2ZdfWRlbGV0ZSBhW2JdfX1yZXR1cm4gYX0sYy5oYXNTY3JvbGw9ZnVuY3Rpb24oYixjKXt2YXIgZD1hKGMpLGU9Yy5zdHlsZS5vdmVyZmxvd1gsZj1jLnN0eWxlLm92ZXJmbG93WTtyZXR1cm4gZSE9PWZ8fFwiaGlkZGVuXCIhPT1mJiZcInZpc2libGVcIiE9PWY/XCJzY3JvbGxcIj09PWV8fFwic2Nyb2xsXCI9PT1mPyEwOmQuaW5uZXJIZWlnaHQoKTxjLnNjcm9sbEhlaWdodHx8ZC5pbm5lcldpZHRoKCk8Yy5zY3JvbGxXaWR0aDohMX0sYy5lc2NhcGVNYXJrdXA9ZnVuY3Rpb24oYSl7dmFyIGI9e1wiXFxcXFwiOlwiJiM5MjtcIixcIiZcIjpcIiZhbXA7XCIsXCI8XCI6XCImbHQ7XCIsXCI+XCI6XCImZ3Q7XCIsJ1wiJzpcIiZxdW90O1wiLFwiJ1wiOlwiJiMzOTtcIixcIi9cIjpcIiYjNDc7XCJ9O3JldHVyblwic3RyaW5nXCIhPXR5cGVvZiBhP2E6U3RyaW5nKGEpLnJlcGxhY2UoL1smPD5cIidcXC9cXFxcXS9nLGZ1bmN0aW9uKGEpe3JldHVybiBiW2FdfSl9LGMuYXBwZW5kTWFueT1mdW5jdGlvbihiLGMpe2lmKFwiMS43XCI9PT1hLmZuLmpxdWVyeS5zdWJzdHIoMCwzKSl7dmFyIGQ9YSgpO2EubWFwKGMsZnVuY3Rpb24oYSl7ZD1kLmFkZChhKX0pLGM9ZH1iLmFwcGVuZChjKX0sY30pLGIuZGVmaW5lKFwic2VsZWN0Mi9yZXN1bHRzXCIsW1wianF1ZXJ5XCIsXCIuL3V0aWxzXCJdLGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhhLGIsZCl7dGhpcy4kZWxlbWVudD1hLHRoaXMuZGF0YT1kLHRoaXMub3B0aW9ucz1iLGMuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmNhbGwodGhpcyl9cmV0dXJuIGIuRXh0ZW5kKGMsYi5PYnNlcnZhYmxlKSxjLnByb3RvdHlwZS5yZW5kZXI9ZnVuY3Rpb24oKXt2YXIgYj1hKCc8dWwgY2xhc3M9XCJzZWxlY3QyLXJlc3VsdHNfX29wdGlvbnNcIiByb2xlPVwidHJlZVwiPjwvdWw+Jyk7cmV0dXJuIHRoaXMub3B0aW9ucy5nZXQoXCJtdWx0aXBsZVwiKSYmYi5hdHRyKFwiYXJpYS1tdWx0aXNlbGVjdGFibGVcIixcInRydWVcIiksdGhpcy4kcmVzdWx0cz1iLGJ9LGMucHJvdG90eXBlLmNsZWFyPWZ1bmN0aW9uKCl7dGhpcy4kcmVzdWx0cy5lbXB0eSgpfSxjLnByb3RvdHlwZS5kaXNwbGF5TWVzc2FnZT1mdW5jdGlvbihiKXt2YXIgYz10aGlzLm9wdGlvbnMuZ2V0KFwiZXNjYXBlTWFya3VwXCIpO3RoaXMuY2xlYXIoKSx0aGlzLmhpZGVMb2FkaW5nKCk7dmFyIGQ9YSgnPGxpIHJvbGU9XCJ0cmVlaXRlbVwiIGFyaWEtbGl2ZT1cImFzc2VydGl2ZVwiIGNsYXNzPVwic2VsZWN0Mi1yZXN1bHRzX19vcHRpb25cIj48L2xpPicpLGU9dGhpcy5vcHRpb25zLmdldChcInRyYW5zbGF0aW9uc1wiKS5nZXQoYi5tZXNzYWdlKTtkLmFwcGVuZChjKGUoYi5hcmdzKSkpLGRbMF0uY2xhc3NOYW1lKz1cIiBzZWxlY3QyLXJlc3VsdHNfX21lc3NhZ2VcIix0aGlzLiRyZXN1bHRzLmFwcGVuZChkKX0sYy5wcm90b3R5cGUuaGlkZU1lc3NhZ2VzPWZ1bmN0aW9uKCl7dGhpcy4kcmVzdWx0cy5maW5kKFwiLnNlbGVjdDItcmVzdWx0c19fbWVzc2FnZVwiKS5yZW1vdmUoKX0sYy5wcm90b3R5cGUuYXBwZW5kPWZ1bmN0aW9uKGEpe3RoaXMuaGlkZUxvYWRpbmcoKTt2YXIgYj1bXTtpZihudWxsPT1hLnJlc3VsdHN8fDA9PT1hLnJlc3VsdHMubGVuZ3RoKXJldHVybiB2b2lkKDA9PT10aGlzLiRyZXN1bHRzLmNoaWxkcmVuKCkubGVuZ3RoJiZ0aGlzLnRyaWdnZXIoXCJyZXN1bHRzOm1lc3NhZ2VcIix7bWVzc2FnZTpcIm5vUmVzdWx0c1wifSkpO2EucmVzdWx0cz10aGlzLnNvcnQoYS5yZXN1bHRzKTtmb3IodmFyIGM9MDtjPGEucmVzdWx0cy5sZW5ndGg7YysrKXt2YXIgZD1hLnJlc3VsdHNbY10sZT10aGlzLm9wdGlvbihkKTtiLnB1c2goZSl9dGhpcy4kcmVzdWx0cy5hcHBlbmQoYil9LGMucHJvdG90eXBlLnBvc2l0aW9uPWZ1bmN0aW9uKGEsYil7dmFyIGM9Yi5maW5kKFwiLnNlbGVjdDItcmVzdWx0c1wiKTtjLmFwcGVuZChhKX0sYy5wcm90b3R5cGUuc29ydD1mdW5jdGlvbihhKXt2YXIgYj10aGlzLm9wdGlvbnMuZ2V0KFwic29ydGVyXCIpO3JldHVybiBiKGEpfSxjLnByb3RvdHlwZS5oaWdobGlnaHRGaXJzdEl0ZW09ZnVuY3Rpb24oKXt2YXIgYT10aGlzLiRyZXN1bHRzLmZpbmQoXCIuc2VsZWN0Mi1yZXN1bHRzX19vcHRpb25bYXJpYS1zZWxlY3RlZF1cIiksYj1hLmZpbHRlcihcIlthcmlhLXNlbGVjdGVkPXRydWVdXCIpO2IubGVuZ3RoPjA/Yi5maXJzdCgpLnRyaWdnZXIoXCJtb3VzZWVudGVyXCIpOmEuZmlyc3QoKS50cmlnZ2VyKFwibW91c2VlbnRlclwiKSx0aGlzLmVuc3VyZUhpZ2hsaWdodFZpc2libGUoKX0sYy5wcm90b3R5cGUuc2V0Q2xhc3Nlcz1mdW5jdGlvbigpe3ZhciBiPXRoaXM7dGhpcy5kYXRhLmN1cnJlbnQoZnVuY3Rpb24oYyl7dmFyIGQ9YS5tYXAoYyxmdW5jdGlvbihhKXtyZXR1cm4gYS5pZC50b1N0cmluZygpfSksZT1iLiRyZXN1bHRzLmZpbmQoXCIuc2VsZWN0Mi1yZXN1bHRzX19vcHRpb25bYXJpYS1zZWxlY3RlZF1cIik7ZS5lYWNoKGZ1bmN0aW9uKCl7dmFyIGI9YSh0aGlzKSxjPWEuZGF0YSh0aGlzLFwiZGF0YVwiKSxlPVwiXCIrYy5pZDtudWxsIT1jLmVsZW1lbnQmJmMuZWxlbWVudC5zZWxlY3RlZHx8bnVsbD09Yy5lbGVtZW50JiZhLmluQXJyYXkoZSxkKT4tMT9iLmF0dHIoXCJhcmlhLXNlbGVjdGVkXCIsXCJ0cnVlXCIpOmIuYXR0cihcImFyaWEtc2VsZWN0ZWRcIixcImZhbHNlXCIpfSl9KX0sYy5wcm90b3R5cGUuc2hvd0xvYWRpbmc9ZnVuY3Rpb24oYSl7dGhpcy5oaWRlTG9hZGluZygpO3ZhciBiPXRoaXMub3B0aW9ucy5nZXQoXCJ0cmFuc2xhdGlvbnNcIikuZ2V0KFwic2VhcmNoaW5nXCIpLGM9e2Rpc2FibGVkOiEwLGxvYWRpbmc6ITAsdGV4dDpiKGEpfSxkPXRoaXMub3B0aW9uKGMpO2QuY2xhc3NOYW1lKz1cIiBsb2FkaW5nLXJlc3VsdHNcIix0aGlzLiRyZXN1bHRzLnByZXBlbmQoZCl9LGMucHJvdG90eXBlLmhpZGVMb2FkaW5nPWZ1bmN0aW9uKCl7dGhpcy4kcmVzdWx0cy5maW5kKFwiLmxvYWRpbmctcmVzdWx0c1wiKS5yZW1vdmUoKX0sYy5wcm90b3R5cGUub3B0aW9uPWZ1bmN0aW9uKGIpe3ZhciBjPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtjLmNsYXNzTmFtZT1cInNlbGVjdDItcmVzdWx0c19fb3B0aW9uXCI7dmFyIGQ9e3JvbGU6XCJ0cmVlaXRlbVwiLFwiYXJpYS1zZWxlY3RlZFwiOlwiZmFsc2VcIn07Yi5kaXNhYmxlZCYmKGRlbGV0ZSBkW1wiYXJpYS1zZWxlY3RlZFwiXSxkW1wiYXJpYS1kaXNhYmxlZFwiXT1cInRydWVcIiksbnVsbD09Yi5pZCYmZGVsZXRlIGRbXCJhcmlhLXNlbGVjdGVkXCJdLG51bGwhPWIuX3Jlc3VsdElkJiYoYy5pZD1iLl9yZXN1bHRJZCksYi50aXRsZSYmKGMudGl0bGU9Yi50aXRsZSksYi5jaGlsZHJlbiYmKGQucm9sZT1cImdyb3VwXCIsZFtcImFyaWEtbGFiZWxcIl09Yi50ZXh0LGRlbGV0ZSBkW1wiYXJpYS1zZWxlY3RlZFwiXSk7Zm9yKHZhciBlIGluIGQpe3ZhciBmPWRbZV07Yy5zZXRBdHRyaWJ1dGUoZSxmKX1pZihiLmNoaWxkcmVuKXt2YXIgZz1hKGMpLGg9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0cm9uZ1wiKTtoLmNsYXNzTmFtZT1cInNlbGVjdDItcmVzdWx0c19fZ3JvdXBcIjthKGgpO3RoaXMudGVtcGxhdGUoYixoKTtmb3IodmFyIGk9W10saj0wO2o8Yi5jaGlsZHJlbi5sZW5ndGg7aisrKXt2YXIgaz1iLmNoaWxkcmVuW2pdLGw9dGhpcy5vcHRpb24oayk7aS5wdXNoKGwpfXZhciBtPWEoXCI8dWw+PC91bD5cIix7XCJjbGFzc1wiOlwic2VsZWN0Mi1yZXN1bHRzX19vcHRpb25zIHNlbGVjdDItcmVzdWx0c19fb3B0aW9ucy0tbmVzdGVkXCJ9KTttLmFwcGVuZChpKSxnLmFwcGVuZChoKSxnLmFwcGVuZChtKX1lbHNlIHRoaXMudGVtcGxhdGUoYixjKTtyZXR1cm4gYS5kYXRhKGMsXCJkYXRhXCIsYiksY30sYy5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihiLGMpe3ZhciBkPXRoaXMsZT1iLmlkK1wiLXJlc3VsdHNcIjt0aGlzLiRyZXN1bHRzLmF0dHIoXCJpZFwiLGUpLGIub24oXCJyZXN1bHRzOmFsbFwiLGZ1bmN0aW9uKGEpe2QuY2xlYXIoKSxkLmFwcGVuZChhLmRhdGEpLGIuaXNPcGVuKCkmJihkLnNldENsYXNzZXMoKSxkLmhpZ2hsaWdodEZpcnN0SXRlbSgpKX0pLGIub24oXCJyZXN1bHRzOmFwcGVuZFwiLGZ1bmN0aW9uKGEpe2QuYXBwZW5kKGEuZGF0YSksYi5pc09wZW4oKSYmZC5zZXRDbGFzc2VzKCl9KSxiLm9uKFwicXVlcnlcIixmdW5jdGlvbihhKXtkLmhpZGVNZXNzYWdlcygpLGQuc2hvd0xvYWRpbmcoYSl9KSxiLm9uKFwic2VsZWN0XCIsZnVuY3Rpb24oKXtiLmlzT3BlbigpJiYoZC5zZXRDbGFzc2VzKCksZC5oaWdobGlnaHRGaXJzdEl0ZW0oKSl9KSxiLm9uKFwidW5zZWxlY3RcIixmdW5jdGlvbigpe2IuaXNPcGVuKCkmJihkLnNldENsYXNzZXMoKSxkLmhpZ2hsaWdodEZpcnN0SXRlbSgpKX0pLGIub24oXCJvcGVuXCIsZnVuY3Rpb24oKXtkLiRyZXN1bHRzLmF0dHIoXCJhcmlhLWV4cGFuZGVkXCIsXCJ0cnVlXCIpLGQuJHJlc3VsdHMuYXR0cihcImFyaWEtaGlkZGVuXCIsXCJmYWxzZVwiKSxkLnNldENsYXNzZXMoKSxkLmVuc3VyZUhpZ2hsaWdodFZpc2libGUoKX0pLGIub24oXCJjbG9zZVwiLGZ1bmN0aW9uKCl7ZC4kcmVzdWx0cy5hdHRyKFwiYXJpYS1leHBhbmRlZFwiLFwiZmFsc2VcIiksZC4kcmVzdWx0cy5hdHRyKFwiYXJpYS1oaWRkZW5cIixcInRydWVcIiksZC4kcmVzdWx0cy5yZW1vdmVBdHRyKFwiYXJpYS1hY3RpdmVkZXNjZW5kYW50XCIpfSksYi5vbihcInJlc3VsdHM6dG9nZ2xlXCIsZnVuY3Rpb24oKXt2YXIgYT1kLmdldEhpZ2hsaWdodGVkUmVzdWx0cygpOzAhPT1hLmxlbmd0aCYmYS50cmlnZ2VyKFwibW91c2V1cFwiKX0pLGIub24oXCJyZXN1bHRzOnNlbGVjdFwiLGZ1bmN0aW9uKCl7dmFyIGE9ZC5nZXRIaWdobGlnaHRlZFJlc3VsdHMoKTtpZigwIT09YS5sZW5ndGgpe3ZhciBiPWEuZGF0YShcImRhdGFcIik7XCJ0cnVlXCI9PWEuYXR0cihcImFyaWEtc2VsZWN0ZWRcIik/ZC50cmlnZ2VyKFwiY2xvc2VcIix7fSk6ZC50cmlnZ2VyKFwic2VsZWN0XCIse2RhdGE6Yn0pfX0pLGIub24oXCJyZXN1bHRzOnByZXZpb3VzXCIsZnVuY3Rpb24oKXt2YXIgYT1kLmdldEhpZ2hsaWdodGVkUmVzdWx0cygpLGI9ZC4kcmVzdWx0cy5maW5kKFwiW2FyaWEtc2VsZWN0ZWRdXCIpLGM9Yi5pbmRleChhKTtpZigwIT09Yyl7dmFyIGU9Yy0xOzA9PT1hLmxlbmd0aCYmKGU9MCk7dmFyIGY9Yi5lcShlKTtmLnRyaWdnZXIoXCJtb3VzZWVudGVyXCIpO3ZhciBnPWQuJHJlc3VsdHMub2Zmc2V0KCkudG9wLGg9Zi5vZmZzZXQoKS50b3AsaT1kLiRyZXN1bHRzLnNjcm9sbFRvcCgpKyhoLWcpOzA9PT1lP2QuJHJlc3VsdHMuc2Nyb2xsVG9wKDApOjA+aC1nJiZkLiRyZXN1bHRzLnNjcm9sbFRvcChpKX19KSxiLm9uKFwicmVzdWx0czpuZXh0XCIsZnVuY3Rpb24oKXt2YXIgYT1kLmdldEhpZ2hsaWdodGVkUmVzdWx0cygpLGI9ZC4kcmVzdWx0cy5maW5kKFwiW2FyaWEtc2VsZWN0ZWRdXCIpLGM9Yi5pbmRleChhKSxlPWMrMTtpZighKGU+PWIubGVuZ3RoKSl7dmFyIGY9Yi5lcShlKTtmLnRyaWdnZXIoXCJtb3VzZWVudGVyXCIpO3ZhciBnPWQuJHJlc3VsdHMub2Zmc2V0KCkudG9wK2QuJHJlc3VsdHMub3V0ZXJIZWlnaHQoITEpLGg9Zi5vZmZzZXQoKS50b3ArZi5vdXRlckhlaWdodCghMSksaT1kLiRyZXN1bHRzLnNjcm9sbFRvcCgpK2gtZzswPT09ZT9kLiRyZXN1bHRzLnNjcm9sbFRvcCgwKTpoPmcmJmQuJHJlc3VsdHMuc2Nyb2xsVG9wKGkpfX0pLGIub24oXCJyZXN1bHRzOmZvY3VzXCIsZnVuY3Rpb24oYSl7YS5lbGVtZW50LmFkZENsYXNzKFwic2VsZWN0Mi1yZXN1bHRzX19vcHRpb24tLWhpZ2hsaWdodGVkXCIpfSksYi5vbihcInJlc3VsdHM6bWVzc2FnZVwiLGZ1bmN0aW9uKGEpe2QuZGlzcGxheU1lc3NhZ2UoYSl9KSxhLmZuLm1vdXNld2hlZWwmJnRoaXMuJHJlc3VsdHMub24oXCJtb3VzZXdoZWVsXCIsZnVuY3Rpb24oYSl7dmFyIGI9ZC4kcmVzdWx0cy5zY3JvbGxUb3AoKSxjPWQuJHJlc3VsdHMuZ2V0KDApLnNjcm9sbEhlaWdodC1iK2EuZGVsdGFZLGU9YS5kZWx0YVk+MCYmYi1hLmRlbHRhWTw9MCxmPWEuZGVsdGFZPDAmJmM8PWQuJHJlc3VsdHMuaGVpZ2h0KCk7ZT8oZC4kcmVzdWx0cy5zY3JvbGxUb3AoMCksYS5wcmV2ZW50RGVmYXVsdCgpLGEuc3RvcFByb3BhZ2F0aW9uKCkpOmYmJihkLiRyZXN1bHRzLnNjcm9sbFRvcChkLiRyZXN1bHRzLmdldCgwKS5zY3JvbGxIZWlnaHQtZC4kcmVzdWx0cy5oZWlnaHQoKSksYS5wcmV2ZW50RGVmYXVsdCgpLGEuc3RvcFByb3BhZ2F0aW9uKCkpfSksdGhpcy4kcmVzdWx0cy5vbihcIm1vdXNldXBcIixcIi5zZWxlY3QyLXJlc3VsdHNfX29wdGlvblthcmlhLXNlbGVjdGVkXVwiLGZ1bmN0aW9uKGIpe3ZhciBjPWEodGhpcyksZT1jLmRhdGEoXCJkYXRhXCIpO3JldHVyblwidHJ1ZVwiPT09Yy5hdHRyKFwiYXJpYS1zZWxlY3RlZFwiKT92b2lkKGQub3B0aW9ucy5nZXQoXCJtdWx0aXBsZVwiKT9kLnRyaWdnZXIoXCJ1bnNlbGVjdFwiLHtvcmlnaW5hbEV2ZW50OmIsZGF0YTplfSk6ZC50cmlnZ2VyKFwiY2xvc2VcIix7fSkpOnZvaWQgZC50cmlnZ2VyKFwic2VsZWN0XCIse29yaWdpbmFsRXZlbnQ6YixkYXRhOmV9KX0pLHRoaXMuJHJlc3VsdHMub24oXCJtb3VzZWVudGVyXCIsXCIuc2VsZWN0Mi1yZXN1bHRzX19vcHRpb25bYXJpYS1zZWxlY3RlZF1cIixmdW5jdGlvbihiKXt2YXIgYz1hKHRoaXMpLmRhdGEoXCJkYXRhXCIpO2QuZ2V0SGlnaGxpZ2h0ZWRSZXN1bHRzKCkucmVtb3ZlQ2xhc3MoXCJzZWxlY3QyLXJlc3VsdHNfX29wdGlvbi0taGlnaGxpZ2h0ZWRcIiksZC50cmlnZ2VyKFwicmVzdWx0czpmb2N1c1wiLHtkYXRhOmMsZWxlbWVudDphKHRoaXMpfSl9KX0sYy5wcm90b3R5cGUuZ2V0SGlnaGxpZ2h0ZWRSZXN1bHRzPWZ1bmN0aW9uKCl7dmFyIGE9dGhpcy4kcmVzdWx0cy5maW5kKFwiLnNlbGVjdDItcmVzdWx0c19fb3B0aW9uLS1oaWdobGlnaHRlZFwiKTtyZXR1cm4gYX0sYy5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe3RoaXMuJHJlc3VsdHMucmVtb3ZlKCl9LGMucHJvdG90eXBlLmVuc3VyZUhpZ2hsaWdodFZpc2libGU9ZnVuY3Rpb24oKXt2YXIgYT10aGlzLmdldEhpZ2hsaWdodGVkUmVzdWx0cygpO2lmKDAhPT1hLmxlbmd0aCl7dmFyIGI9dGhpcy4kcmVzdWx0cy5maW5kKFwiW2FyaWEtc2VsZWN0ZWRdXCIpLGM9Yi5pbmRleChhKSxkPXRoaXMuJHJlc3VsdHMub2Zmc2V0KCkudG9wLGU9YS5vZmZzZXQoKS50b3AsZj10aGlzLiRyZXN1bHRzLnNjcm9sbFRvcCgpKyhlLWQpLGc9ZS1kO2YtPTIqYS5vdXRlckhlaWdodCghMSksMj49Yz90aGlzLiRyZXN1bHRzLnNjcm9sbFRvcCgwKTooZz50aGlzLiRyZXN1bHRzLm91dGVySGVpZ2h0KCl8fDA+ZykmJnRoaXMuJHJlc3VsdHMuc2Nyb2xsVG9wKGYpfX0sYy5wcm90b3R5cGUudGVtcGxhdGU9ZnVuY3Rpb24oYixjKXt2YXIgZD10aGlzLm9wdGlvbnMuZ2V0KFwidGVtcGxhdGVSZXN1bHRcIiksZT10aGlzLm9wdGlvbnMuZ2V0KFwiZXNjYXBlTWFya3VwXCIpLGY9ZChiLGMpO251bGw9PWY/Yy5zdHlsZS5kaXNwbGF5PVwibm9uZVwiOlwic3RyaW5nXCI9PXR5cGVvZiBmP2MuaW5uZXJIVE1MPWUoZik6YShjKS5hcHBlbmQoZil9LGN9KSxiLmRlZmluZShcInNlbGVjdDIva2V5c1wiLFtdLGZ1bmN0aW9uKCl7dmFyIGE9e0JBQ0tTUEFDRTo4LFRBQjo5LEVOVEVSOjEzLFNISUZUOjE2LENUUkw6MTcsQUxUOjE4LEVTQzoyNyxTUEFDRTozMixQQUdFX1VQOjMzLFBBR0VfRE9XTjozNCxFTkQ6MzUsSE9NRTozNixMRUZUOjM3LFVQOjM4LFJJR0hUOjM5LERPV046NDAsREVMRVRFOjQ2fTtyZXR1cm4gYX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9zZWxlY3Rpb24vYmFzZVwiLFtcImpxdWVyeVwiLFwiLi4vdXRpbHNcIixcIi4uL2tleXNcIl0sZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQoYSxiKXt0aGlzLiRlbGVtZW50PWEsdGhpcy5vcHRpb25zPWIsZC5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzKX1yZXR1cm4gYi5FeHRlbmQoZCxiLk9ic2VydmFibGUpLGQucHJvdG90eXBlLnJlbmRlcj1mdW5jdGlvbigpe3ZhciBiPWEoJzxzcGFuIGNsYXNzPVwic2VsZWN0Mi1zZWxlY3Rpb25cIiByb2xlPVwiY29tYm9ib3hcIiAgYXJpYS1oYXNwb3B1cD1cInRydWVcIiBhcmlhLWV4cGFuZGVkPVwiZmFsc2VcIj48L3NwYW4+Jyk7cmV0dXJuIHRoaXMuX3RhYmluZGV4PTAsbnVsbCE9dGhpcy4kZWxlbWVudC5kYXRhKFwib2xkLXRhYmluZGV4XCIpP3RoaXMuX3RhYmluZGV4PXRoaXMuJGVsZW1lbnQuZGF0YShcIm9sZC10YWJpbmRleFwiKTpudWxsIT10aGlzLiRlbGVtZW50LmF0dHIoXCJ0YWJpbmRleFwiKSYmKHRoaXMuX3RhYmluZGV4PXRoaXMuJGVsZW1lbnQuYXR0cihcInRhYmluZGV4XCIpKSxiLmF0dHIoXCJ0aXRsZVwiLHRoaXMuJGVsZW1lbnQuYXR0cihcInRpdGxlXCIpKSxiLmF0dHIoXCJ0YWJpbmRleFwiLHRoaXMuX3RhYmluZGV4KSx0aGlzLiRzZWxlY3Rpb249YixifSxkLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGEsYil7dmFyIGQ9dGhpcyxlPShhLmlkK1wiLWNvbnRhaW5lclwiLGEuaWQrXCItcmVzdWx0c1wiKTt0aGlzLmNvbnRhaW5lcj1hLHRoaXMuJHNlbGVjdGlvbi5vbihcImZvY3VzXCIsZnVuY3Rpb24oYSl7ZC50cmlnZ2VyKFwiZm9jdXNcIixhKX0pLHRoaXMuJHNlbGVjdGlvbi5vbihcImJsdXJcIixmdW5jdGlvbihhKXtkLl9oYW5kbGVCbHVyKGEpfSksdGhpcy4kc2VsZWN0aW9uLm9uKFwia2V5ZG93blwiLGZ1bmN0aW9uKGEpe2QudHJpZ2dlcihcImtleXByZXNzXCIsYSksYS53aGljaD09PWMuU1BBQ0UmJmEucHJldmVudERlZmF1bHQoKX0pLGEub24oXCJyZXN1bHRzOmZvY3VzXCIsZnVuY3Rpb24oYSl7ZC4kc2VsZWN0aW9uLmF0dHIoXCJhcmlhLWFjdGl2ZWRlc2NlbmRhbnRcIixhLmRhdGEuX3Jlc3VsdElkKX0pLGEub24oXCJzZWxlY3Rpb246dXBkYXRlXCIsZnVuY3Rpb24oYSl7ZC51cGRhdGUoYS5kYXRhKX0pLGEub24oXCJvcGVuXCIsZnVuY3Rpb24oKXtkLiRzZWxlY3Rpb24uYXR0cihcImFyaWEtZXhwYW5kZWRcIixcInRydWVcIiksZC4kc2VsZWN0aW9uLmF0dHIoXCJhcmlhLW93bnNcIixlKSxkLl9hdHRhY2hDbG9zZUhhbmRsZXIoYSl9KSxhLm9uKFwiY2xvc2VcIixmdW5jdGlvbigpe2QuJHNlbGVjdGlvbi5hdHRyKFwiYXJpYS1leHBhbmRlZFwiLFwiZmFsc2VcIiksZC4kc2VsZWN0aW9uLnJlbW92ZUF0dHIoXCJhcmlhLWFjdGl2ZWRlc2NlbmRhbnRcIiksZC4kc2VsZWN0aW9uLnJlbW92ZUF0dHIoXCJhcmlhLW93bnNcIiksZC4kc2VsZWN0aW9uLmZvY3VzKCksZC5fZGV0YWNoQ2xvc2VIYW5kbGVyKGEpfSksYS5vbihcImVuYWJsZVwiLGZ1bmN0aW9uKCl7ZC4kc2VsZWN0aW9uLmF0dHIoXCJ0YWJpbmRleFwiLGQuX3RhYmluZGV4KX0pLGEub24oXCJkaXNhYmxlXCIsZnVuY3Rpb24oKXtkLiRzZWxlY3Rpb24uYXR0cihcInRhYmluZGV4XCIsXCItMVwiKX0pfSxkLnByb3RvdHlwZS5faGFuZGxlQmx1cj1mdW5jdGlvbihiKXt2YXIgYz10aGlzO3dpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZG9jdW1lbnQuYWN0aXZlRWxlbWVudD09Yy4kc2VsZWN0aW9uWzBdfHxhLmNvbnRhaW5zKGMuJHNlbGVjdGlvblswXSxkb2N1bWVudC5hY3RpdmVFbGVtZW50KXx8Yy50cmlnZ2VyKFwiYmx1clwiLGIpfSwxKX0sZC5wcm90b3R5cGUuX2F0dGFjaENsb3NlSGFuZGxlcj1mdW5jdGlvbihiKXthKGRvY3VtZW50LmJvZHkpLm9uKFwibW91c2Vkb3duLnNlbGVjdDIuXCIrYi5pZCxmdW5jdGlvbihiKXt2YXIgYz1hKGIudGFyZ2V0KSxkPWMuY2xvc2VzdChcIi5zZWxlY3QyXCIpLGU9YShcIi5zZWxlY3QyLnNlbGVjdDItY29udGFpbmVyLS1vcGVuXCIpO2UuZWFjaChmdW5jdGlvbigpe3ZhciBiPWEodGhpcyk7aWYodGhpcyE9ZFswXSl7dmFyIGM9Yi5kYXRhKFwiZWxlbWVudFwiKTtjLnNlbGVjdDIoXCJjbG9zZVwiKX19KX0pfSxkLnByb3RvdHlwZS5fZGV0YWNoQ2xvc2VIYW5kbGVyPWZ1bmN0aW9uKGIpe2EoZG9jdW1lbnQuYm9keSkub2ZmKFwibW91c2Vkb3duLnNlbGVjdDIuXCIrYi5pZCl9LGQucHJvdG90eXBlLnBvc2l0aW9uPWZ1bmN0aW9uKGEsYil7dmFyIGM9Yi5maW5kKFwiLnNlbGVjdGlvblwiKTtjLmFwcGVuZChhKX0sZC5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe3RoaXMuX2RldGFjaENsb3NlSGFuZGxlcih0aGlzLmNvbnRhaW5lcil9LGQucHJvdG90eXBlLnVwZGF0ZT1mdW5jdGlvbihhKXt0aHJvdyBuZXcgRXJyb3IoXCJUaGUgYHVwZGF0ZWAgbWV0aG9kIG11c3QgYmUgZGVmaW5lZCBpbiBjaGlsZCBjbGFzc2VzLlwiKX0sZH0pLGIuZGVmaW5lKFwic2VsZWN0Mi9zZWxlY3Rpb24vc2luZ2xlXCIsW1wianF1ZXJ5XCIsXCIuL2Jhc2VcIixcIi4uL3V0aWxzXCIsXCIuLi9rZXlzXCJdLGZ1bmN0aW9uKGEsYixjLGQpe2Z1bmN0aW9uIGUoKXtlLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLGFyZ3VtZW50cyl9cmV0dXJuIGMuRXh0ZW5kKGUsYiksZS5wcm90b3R5cGUucmVuZGVyPWZ1bmN0aW9uKCl7dmFyIGE9ZS5fX3N1cGVyX18ucmVuZGVyLmNhbGwodGhpcyk7cmV0dXJuIGEuYWRkQ2xhc3MoXCJzZWxlY3QyLXNlbGVjdGlvbi0tc2luZ2xlXCIpLGEuaHRtbCgnPHNwYW4gY2xhc3M9XCJzZWxlY3QyLXNlbGVjdGlvbl9fcmVuZGVyZWRcIj48L3NwYW4+PHNwYW4gY2xhc3M9XCJzZWxlY3QyLXNlbGVjdGlvbl9fYXJyb3dcIiByb2xlPVwicHJlc2VudGF0aW9uXCI+PGIgcm9sZT1cInByZXNlbnRhdGlvblwiPjwvYj48L3NwYW4+JyksYX0sZS5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihhLGIpe3ZhciBjPXRoaXM7ZS5fX3N1cGVyX18uYmluZC5hcHBseSh0aGlzLGFyZ3VtZW50cyk7dmFyIGQ9YS5pZCtcIi1jb250YWluZXJcIjt0aGlzLiRzZWxlY3Rpb24uZmluZChcIi5zZWxlY3QyLXNlbGVjdGlvbl9fcmVuZGVyZWRcIikuYXR0cihcImlkXCIsZCksdGhpcy4kc2VsZWN0aW9uLmF0dHIoXCJhcmlhLWxhYmVsbGVkYnlcIixkKSx0aGlzLiRzZWxlY3Rpb24ub24oXCJtb3VzZWRvd25cIixmdW5jdGlvbihhKXsxPT09YS53aGljaCYmYy50cmlnZ2VyKFwidG9nZ2xlXCIse29yaWdpbmFsRXZlbnQ6YX0pfSksdGhpcy4kc2VsZWN0aW9uLm9uKFwiZm9jdXNcIixmdW5jdGlvbihhKXt9KSx0aGlzLiRzZWxlY3Rpb24ub24oXCJibHVyXCIsZnVuY3Rpb24oYSl7fSksYS5vbihcImZvY3VzXCIsZnVuY3Rpb24oYil7YS5pc09wZW4oKXx8Yy4kc2VsZWN0aW9uLmZvY3VzKCl9KSxhLm9uKFwic2VsZWN0aW9uOnVwZGF0ZVwiLGZ1bmN0aW9uKGEpe2MudXBkYXRlKGEuZGF0YSl9KX0sZS5wcm90b3R5cGUuY2xlYXI9ZnVuY3Rpb24oKXt0aGlzLiRzZWxlY3Rpb24uZmluZChcIi5zZWxlY3QyLXNlbGVjdGlvbl9fcmVuZGVyZWRcIikuZW1wdHkoKX0sZS5wcm90b3R5cGUuZGlzcGxheT1mdW5jdGlvbihhLGIpe3ZhciBjPXRoaXMub3B0aW9ucy5nZXQoXCJ0ZW1wbGF0ZVNlbGVjdGlvblwiKSxkPXRoaXMub3B0aW9ucy5nZXQoXCJlc2NhcGVNYXJrdXBcIik7cmV0dXJuIGQoYyhhLGIpKX0sZS5wcm90b3R5cGUuc2VsZWN0aW9uQ29udGFpbmVyPWZ1bmN0aW9uKCl7cmV0dXJuIGEoXCI8c3Bhbj48L3NwYW4+XCIpfSxlLnByb3RvdHlwZS51cGRhdGU9ZnVuY3Rpb24oYSl7aWYoMD09PWEubGVuZ3RoKXJldHVybiB2b2lkIHRoaXMuY2xlYXIoKTt2YXIgYj1hWzBdLGM9dGhpcy4kc2VsZWN0aW9uLmZpbmQoXCIuc2VsZWN0Mi1zZWxlY3Rpb25fX3JlbmRlcmVkXCIpLGQ9dGhpcy5kaXNwbGF5KGIsYyk7Yy5lbXB0eSgpLmFwcGVuZChkKSxjLnByb3AoXCJ0aXRsZVwiLGIudGl0bGV8fGIudGV4dCl9LGV9KSxiLmRlZmluZShcInNlbGVjdDIvc2VsZWN0aW9uL211bHRpcGxlXCIsW1wianF1ZXJ5XCIsXCIuL2Jhc2VcIixcIi4uL3V0aWxzXCJdLGZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGEsYil7ZC5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcyxhcmd1bWVudHMpfXJldHVybiBjLkV4dGVuZChkLGIpLGQucHJvdG90eXBlLnJlbmRlcj1mdW5jdGlvbigpe3ZhciBhPWQuX19zdXBlcl9fLnJlbmRlci5jYWxsKHRoaXMpO3JldHVybiBhLmFkZENsYXNzKFwic2VsZWN0Mi1zZWxlY3Rpb24tLW11bHRpcGxlXCIpLGEuaHRtbCgnPHVsIGNsYXNzPVwic2VsZWN0Mi1zZWxlY3Rpb25fX3JlbmRlcmVkXCI+PC91bD4nKSxhfSxkLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGIsYyl7dmFyIGU9dGhpcztkLl9fc3VwZXJfXy5iaW5kLmFwcGx5KHRoaXMsYXJndW1lbnRzKSx0aGlzLiRzZWxlY3Rpb24ub24oXCJjbGlja1wiLGZ1bmN0aW9uKGEpe2UudHJpZ2dlcihcInRvZ2dsZVwiLHtvcmlnaW5hbEV2ZW50OmF9KX0pLHRoaXMuJHNlbGVjdGlvbi5vbihcImNsaWNrXCIsXCIuc2VsZWN0Mi1zZWxlY3Rpb25fX2Nob2ljZV9fcmVtb3ZlXCIsZnVuY3Rpb24oYil7aWYoIWUub3B0aW9ucy5nZXQoXCJkaXNhYmxlZFwiKSl7dmFyIGM9YSh0aGlzKSxkPWMucGFyZW50KCksZj1kLmRhdGEoXCJkYXRhXCIpO2UudHJpZ2dlcihcInVuc2VsZWN0XCIse29yaWdpbmFsRXZlbnQ6YixkYXRhOmZ9KX19KX0sZC5wcm90b3R5cGUuY2xlYXI9ZnVuY3Rpb24oKXt0aGlzLiRzZWxlY3Rpb24uZmluZChcIi5zZWxlY3QyLXNlbGVjdGlvbl9fcmVuZGVyZWRcIikuZW1wdHkoKX0sZC5wcm90b3R5cGUuZGlzcGxheT1mdW5jdGlvbihhLGIpe3ZhciBjPXRoaXMub3B0aW9ucy5nZXQoXCJ0ZW1wbGF0ZVNlbGVjdGlvblwiKSxkPXRoaXMub3B0aW9ucy5nZXQoXCJlc2NhcGVNYXJrdXBcIik7cmV0dXJuIGQoYyhhLGIpKX0sZC5wcm90b3R5cGUuc2VsZWN0aW9uQ29udGFpbmVyPWZ1bmN0aW9uKCl7dmFyIGI9YSgnPGxpIGNsYXNzPVwic2VsZWN0Mi1zZWxlY3Rpb25fX2Nob2ljZVwiPjxzcGFuIGNsYXNzPVwic2VsZWN0Mi1zZWxlY3Rpb25fX2Nob2ljZV9fcmVtb3ZlXCIgcm9sZT1cInByZXNlbnRhdGlvblwiPiZ0aW1lczs8L3NwYW4+PC9saT4nKTtyZXR1cm4gYn0sZC5wcm90b3R5cGUudXBkYXRlPWZ1bmN0aW9uKGEpe2lmKHRoaXMuY2xlYXIoKSwwIT09YS5sZW5ndGgpe2Zvcih2YXIgYj1bXSxkPTA7ZDxhLmxlbmd0aDtkKyspe3ZhciBlPWFbZF0sZj10aGlzLnNlbGVjdGlvbkNvbnRhaW5lcigpLGc9dGhpcy5kaXNwbGF5KGUsZik7Zi5hcHBlbmQoZyksZi5wcm9wKFwidGl0bGVcIixlLnRpdGxlfHxlLnRleHQpLGYuZGF0YShcImRhdGFcIixlKSxiLnB1c2goZil9dmFyIGg9dGhpcy4kc2VsZWN0aW9uLmZpbmQoXCIuc2VsZWN0Mi1zZWxlY3Rpb25fX3JlbmRlcmVkXCIpO2MuYXBwZW5kTWFueShoLGIpfX0sZH0pLGIuZGVmaW5lKFwic2VsZWN0Mi9zZWxlY3Rpb24vcGxhY2Vob2xkZXJcIixbXCIuLi91dGlsc1wiXSxmdW5jdGlvbihhKXtmdW5jdGlvbiBiKGEsYixjKXt0aGlzLnBsYWNlaG9sZGVyPXRoaXMubm9ybWFsaXplUGxhY2Vob2xkZXIoYy5nZXQoXCJwbGFjZWhvbGRlclwiKSksYS5jYWxsKHRoaXMsYixjKX1yZXR1cm4gYi5wcm90b3R5cGUubm9ybWFsaXplUGxhY2Vob2xkZXI9ZnVuY3Rpb24oYSxiKXtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgYiYmKGI9e2lkOlwiXCIsdGV4dDpifSksYn0sYi5wcm90b3R5cGUuY3JlYXRlUGxhY2Vob2xkZXI9ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzLnNlbGVjdGlvbkNvbnRhaW5lcigpO3JldHVybiBjLmh0bWwodGhpcy5kaXNwbGF5KGIpKSxjLmFkZENsYXNzKFwic2VsZWN0Mi1zZWxlY3Rpb25fX3BsYWNlaG9sZGVyXCIpLnJlbW92ZUNsYXNzKFwic2VsZWN0Mi1zZWxlY3Rpb25fX2Nob2ljZVwiKSxjfSxiLnByb3RvdHlwZS51cGRhdGU9ZnVuY3Rpb24oYSxiKXt2YXIgYz0xPT1iLmxlbmd0aCYmYlswXS5pZCE9dGhpcy5wbGFjZWhvbGRlci5pZCxkPWIubGVuZ3RoPjE7aWYoZHx8YylyZXR1cm4gYS5jYWxsKHRoaXMsYik7dGhpcy5jbGVhcigpO3ZhciBlPXRoaXMuY3JlYXRlUGxhY2Vob2xkZXIodGhpcy5wbGFjZWhvbGRlcik7dGhpcy4kc2VsZWN0aW9uLmZpbmQoXCIuc2VsZWN0Mi1zZWxlY3Rpb25fX3JlbmRlcmVkXCIpLmFwcGVuZChlKX0sYn0pLGIuZGVmaW5lKFwic2VsZWN0Mi9zZWxlY3Rpb24vYWxsb3dDbGVhclwiLFtcImpxdWVyeVwiLFwiLi4va2V5c1wiXSxmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoKXt9cmV0dXJuIGMucHJvdG90eXBlLmJpbmQ9ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPXRoaXM7YS5jYWxsKHRoaXMsYixjKSxudWxsPT10aGlzLnBsYWNlaG9sZGVyJiZ0aGlzLm9wdGlvbnMuZ2V0KFwiZGVidWdcIikmJndpbmRvdy5jb25zb2xlJiZjb25zb2xlLmVycm9yJiZjb25zb2xlLmVycm9yKFwiU2VsZWN0MjogVGhlIGBhbGxvd0NsZWFyYCBvcHRpb24gc2hvdWxkIGJlIHVzZWQgaW4gY29tYmluYXRpb24gd2l0aCB0aGUgYHBsYWNlaG9sZGVyYCBvcHRpb24uXCIpLHRoaXMuJHNlbGVjdGlvbi5vbihcIm1vdXNlZG93blwiLFwiLnNlbGVjdDItc2VsZWN0aW9uX19jbGVhclwiLGZ1bmN0aW9uKGEpe2QuX2hhbmRsZUNsZWFyKGEpfSksYi5vbihcImtleXByZXNzXCIsZnVuY3Rpb24oYSl7ZC5faGFuZGxlS2V5Ym9hcmRDbGVhcihhLGIpfSl9LGMucHJvdG90eXBlLl9oYW5kbGVDbGVhcj1mdW5jdGlvbihhLGIpe2lmKCF0aGlzLm9wdGlvbnMuZ2V0KFwiZGlzYWJsZWRcIikpe3ZhciBjPXRoaXMuJHNlbGVjdGlvbi5maW5kKFwiLnNlbGVjdDItc2VsZWN0aW9uX19jbGVhclwiKTtpZigwIT09Yy5sZW5ndGgpe2Iuc3RvcFByb3BhZ2F0aW9uKCk7Zm9yKHZhciBkPWMuZGF0YShcImRhdGFcIiksZT0wO2U8ZC5sZW5ndGg7ZSsrKXt2YXIgZj17ZGF0YTpkW2VdfTtpZih0aGlzLnRyaWdnZXIoXCJ1bnNlbGVjdFwiLGYpLGYucHJldmVudGVkKXJldHVybn10aGlzLiRlbGVtZW50LnZhbCh0aGlzLnBsYWNlaG9sZGVyLmlkKS50cmlnZ2VyKFwiY2hhbmdlXCIpLHRoaXMudHJpZ2dlcihcInRvZ2dsZVwiLHt9KX19fSxjLnByb3RvdHlwZS5faGFuZGxlS2V5Ym9hcmRDbGVhcj1mdW5jdGlvbihhLGMsZCl7ZC5pc09wZW4oKXx8KGMud2hpY2g9PWIuREVMRVRFfHxjLndoaWNoPT1iLkJBQ0tTUEFDRSkmJnRoaXMuX2hhbmRsZUNsZWFyKGMpfSxjLnByb3RvdHlwZS51cGRhdGU9ZnVuY3Rpb24oYixjKXtpZihiLmNhbGwodGhpcyxjKSwhKHRoaXMuJHNlbGVjdGlvbi5maW5kKFwiLnNlbGVjdDItc2VsZWN0aW9uX19wbGFjZWhvbGRlclwiKS5sZW5ndGg+MHx8MD09PWMubGVuZ3RoKSl7dmFyIGQ9YSgnPHNwYW4gY2xhc3M9XCJzZWxlY3QyLXNlbGVjdGlvbl9fY2xlYXJcIj4mdGltZXM7PC9zcGFuPicpO2QuZGF0YShcImRhdGFcIixjKSx0aGlzLiRzZWxlY3Rpb24uZmluZChcIi5zZWxlY3QyLXNlbGVjdGlvbl9fcmVuZGVyZWRcIikucHJlcGVuZChkKX19LGN9KSxiLmRlZmluZShcInNlbGVjdDIvc2VsZWN0aW9uL3NlYXJjaFwiLFtcImpxdWVyeVwiLFwiLi4vdXRpbHNcIixcIi4uL2tleXNcIl0sZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQoYSxiLGMpe2EuY2FsbCh0aGlzLGIsYyl9cmV0dXJuIGQucHJvdG90eXBlLnJlbmRlcj1mdW5jdGlvbihiKXt2YXIgYz1hKCc8bGkgY2xhc3M9XCJzZWxlY3QyLXNlYXJjaCBzZWxlY3QyLXNlYXJjaC0taW5saW5lXCI+PGlucHV0IGNsYXNzPVwic2VsZWN0Mi1zZWFyY2hfX2ZpZWxkXCIgdHlwZT1cInNlYXJjaFwiIHRhYmluZGV4PVwiLTFcIiBhdXRvY29tcGxldGU9XCJvZmZcIiBhdXRvY29ycmVjdD1cIm9mZlwiIGF1dG9jYXBpdGFsaXplPVwib2ZmXCIgc3BlbGxjaGVjaz1cImZhbHNlXCIgcm9sZT1cInRleHRib3hcIiBhcmlhLWF1dG9jb21wbGV0ZT1cImxpc3RcIiAvPjwvbGk+Jyk7dGhpcy4kc2VhcmNoQ29udGFpbmVyPWMsdGhpcy4kc2VhcmNoPWMuZmluZChcImlucHV0XCIpO3ZhciBkPWIuY2FsbCh0aGlzKTtyZXR1cm4gdGhpcy5fdHJhbnNmZXJUYWJJbmRleCgpLGR9LGQucHJvdG90eXBlLmJpbmQ9ZnVuY3Rpb24oYSxiLGQpe3ZhciBlPXRoaXM7YS5jYWxsKHRoaXMsYixkKSxiLm9uKFwib3BlblwiLGZ1bmN0aW9uKCl7ZS4kc2VhcmNoLnRyaWdnZXIoXCJmb2N1c1wiKX0pLGIub24oXCJjbG9zZVwiLGZ1bmN0aW9uKCl7ZS4kc2VhcmNoLnZhbChcIlwiKSxlLiRzZWFyY2gucmVtb3ZlQXR0cihcImFyaWEtYWN0aXZlZGVzY2VuZGFudFwiKSxlLiRzZWFyY2gudHJpZ2dlcihcImZvY3VzXCIpfSksYi5vbihcImVuYWJsZVwiLGZ1bmN0aW9uKCl7ZS4kc2VhcmNoLnByb3AoXCJkaXNhYmxlZFwiLCExKSxlLl90cmFuc2ZlclRhYkluZGV4KCl9KSxiLm9uKFwiZGlzYWJsZVwiLGZ1bmN0aW9uKCl7ZS4kc2VhcmNoLnByb3AoXCJkaXNhYmxlZFwiLCEwKX0pLGIub24oXCJmb2N1c1wiLGZ1bmN0aW9uKGEpe2UuJHNlYXJjaC50cmlnZ2VyKFwiZm9jdXNcIil9KSxiLm9uKFwicmVzdWx0czpmb2N1c1wiLGZ1bmN0aW9uKGEpe2UuJHNlYXJjaC5hdHRyKFwiYXJpYS1hY3RpdmVkZXNjZW5kYW50XCIsYS5pZCl9KSx0aGlzLiRzZWxlY3Rpb24ub24oXCJmb2N1c2luXCIsXCIuc2VsZWN0Mi1zZWFyY2gtLWlubGluZVwiLGZ1bmN0aW9uKGEpe2UudHJpZ2dlcihcImZvY3VzXCIsYSl9KSx0aGlzLiRzZWxlY3Rpb24ub24oXCJmb2N1c291dFwiLFwiLnNlbGVjdDItc2VhcmNoLS1pbmxpbmVcIixmdW5jdGlvbihhKXtlLl9oYW5kbGVCbHVyKGEpfSksdGhpcy4kc2VsZWN0aW9uLm9uKFwia2V5ZG93blwiLFwiLnNlbGVjdDItc2VhcmNoLS1pbmxpbmVcIixmdW5jdGlvbihhKXthLnN0b3BQcm9wYWdhdGlvbigpLGUudHJpZ2dlcihcImtleXByZXNzXCIsYSksZS5fa2V5VXBQcmV2ZW50ZWQ9YS5pc0RlZmF1bHRQcmV2ZW50ZWQoKTt2YXIgYj1hLndoaWNoO2lmKGI9PT1jLkJBQ0tTUEFDRSYmXCJcIj09PWUuJHNlYXJjaC52YWwoKSl7dmFyIGQ9ZS4kc2VhcmNoQ29udGFpbmVyLnByZXYoXCIuc2VsZWN0Mi1zZWxlY3Rpb25fX2Nob2ljZVwiKTtpZihkLmxlbmd0aD4wKXt2YXIgZj1kLmRhdGEoXCJkYXRhXCIpO2Uuc2VhcmNoUmVtb3ZlQ2hvaWNlKGYpLGEucHJldmVudERlZmF1bHQoKX19fSk7dmFyIGY9ZG9jdW1lbnQuZG9jdW1lbnRNb2RlLGc9ZiYmMTE+PWY7dGhpcy4kc2VsZWN0aW9uLm9uKFwiaW5wdXQuc2VhcmNoY2hlY2tcIixcIi5zZWxlY3QyLXNlYXJjaC0taW5saW5lXCIsZnVuY3Rpb24oYSl7cmV0dXJuIGc/dm9pZCBlLiRzZWxlY3Rpb24ub2ZmKFwiaW5wdXQuc2VhcmNoIGlucHV0LnNlYXJjaGNoZWNrXCIpOnZvaWQgZS4kc2VsZWN0aW9uLm9mZihcImtleXVwLnNlYXJjaFwiKX0pLHRoaXMuJHNlbGVjdGlvbi5vbihcImtleXVwLnNlYXJjaCBpbnB1dC5zZWFyY2hcIixcIi5zZWxlY3QyLXNlYXJjaC0taW5saW5lXCIsZnVuY3Rpb24oYSl7aWYoZyYmXCJpbnB1dFwiPT09YS50eXBlKXJldHVybiB2b2lkIGUuJHNlbGVjdGlvbi5vZmYoXCJpbnB1dC5zZWFyY2ggaW5wdXQuc2VhcmNoY2hlY2tcIik7dmFyIGI9YS53aGljaDtiIT1jLlNISUZUJiZiIT1jLkNUUkwmJmIhPWMuQUxUJiZiIT1jLlRBQiYmZS5oYW5kbGVTZWFyY2goYSl9KX0sZC5wcm90b3R5cGUuX3RyYW5zZmVyVGFiSW5kZXg9ZnVuY3Rpb24oYSl7dGhpcy4kc2VhcmNoLmF0dHIoXCJ0YWJpbmRleFwiLHRoaXMuJHNlbGVjdGlvbi5hdHRyKFwidGFiaW5kZXhcIikpLHRoaXMuJHNlbGVjdGlvbi5hdHRyKFwidGFiaW5kZXhcIixcIi0xXCIpfSxkLnByb3RvdHlwZS5jcmVhdGVQbGFjZWhvbGRlcj1mdW5jdGlvbihhLGIpe3RoaXMuJHNlYXJjaC5hdHRyKFwicGxhY2Vob2xkZXJcIixiLnRleHQpfSxkLnByb3RvdHlwZS51cGRhdGU9ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzLiRzZWFyY2hbMF09PWRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7dGhpcy4kc2VhcmNoLmF0dHIoXCJwbGFjZWhvbGRlclwiLFwiXCIpLGEuY2FsbCh0aGlzLGIpLHRoaXMuJHNlbGVjdGlvbi5maW5kKFwiLnNlbGVjdDItc2VsZWN0aW9uX19yZW5kZXJlZFwiKS5hcHBlbmQodGhpcy4kc2VhcmNoQ29udGFpbmVyKSx0aGlzLnJlc2l6ZVNlYXJjaCgpLGMmJnRoaXMuJHNlYXJjaC5mb2N1cygpfSxkLnByb3RvdHlwZS5oYW5kbGVTZWFyY2g9ZnVuY3Rpb24oKXtpZih0aGlzLnJlc2l6ZVNlYXJjaCgpLCF0aGlzLl9rZXlVcFByZXZlbnRlZCl7dmFyIGE9dGhpcy4kc2VhcmNoLnZhbCgpO3RoaXMudHJpZ2dlcihcInF1ZXJ5XCIse3Rlcm06YX0pfXRoaXMuX2tleVVwUHJldmVudGVkPSExfSxkLnByb3RvdHlwZS5zZWFyY2hSZW1vdmVDaG9pY2U9ZnVuY3Rpb24oYSxiKXt0aGlzLnRyaWdnZXIoXCJ1bnNlbGVjdFwiLHtkYXRhOmJ9KSx0aGlzLiRzZWFyY2gudmFsKGIudGV4dCksdGhpcy5oYW5kbGVTZWFyY2goKX0sZC5wcm90b3R5cGUucmVzaXplU2VhcmNoPWZ1bmN0aW9uKCl7dGhpcy4kc2VhcmNoLmNzcyhcIndpZHRoXCIsXCIyNXB4XCIpO3ZhciBhPVwiXCI7aWYoXCJcIiE9PXRoaXMuJHNlYXJjaC5hdHRyKFwicGxhY2Vob2xkZXJcIikpYT10aGlzLiRzZWxlY3Rpb24uZmluZChcIi5zZWxlY3QyLXNlbGVjdGlvbl9fcmVuZGVyZWRcIikuaW5uZXJXaWR0aCgpO2Vsc2V7dmFyIGI9dGhpcy4kc2VhcmNoLnZhbCgpLmxlbmd0aCsxO2E9Ljc1KmIrXCJlbVwifXRoaXMuJHNlYXJjaC5jc3MoXCJ3aWR0aFwiLGEpfSxkfSksYi5kZWZpbmUoXCJzZWxlY3QyL3NlbGVjdGlvbi9ldmVudFJlbGF5XCIsW1wianF1ZXJ5XCJdLGZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoKXt9cmV0dXJuIGIucHJvdG90eXBlLmJpbmQ9ZnVuY3Rpb24oYixjLGQpe3ZhciBlPXRoaXMsZj1bXCJvcGVuXCIsXCJvcGVuaW5nXCIsXCJjbG9zZVwiLFwiY2xvc2luZ1wiLFwic2VsZWN0XCIsXCJzZWxlY3RpbmdcIixcInVuc2VsZWN0XCIsXCJ1bnNlbGVjdGluZ1wiXSxnPVtcIm9wZW5pbmdcIixcImNsb3NpbmdcIixcInNlbGVjdGluZ1wiLFwidW5zZWxlY3RpbmdcIl07Yi5jYWxsKHRoaXMsYyxkKSxjLm9uKFwiKlwiLGZ1bmN0aW9uKGIsYyl7aWYoLTEhPT1hLmluQXJyYXkoYixmKSl7Yz1jfHx7fTt2YXIgZD1hLkV2ZW50KFwic2VsZWN0MjpcIitiLHtwYXJhbXM6Y30pO2UuJGVsZW1lbnQudHJpZ2dlcihkKSwtMSE9PWEuaW5BcnJheShiLGcpJiYoYy5wcmV2ZW50ZWQ9ZC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSl9fSl9LGJ9KSxiLmRlZmluZShcInNlbGVjdDIvdHJhbnNsYXRpb25cIixbXCJqcXVlcnlcIixcInJlcXVpcmVcIl0sZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGEpe3RoaXMuZGljdD1hfHx7fX1yZXR1cm4gYy5wcm90b3R5cGUuYWxsPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZGljdH0sYy5wcm90b3R5cGUuZ2V0PWZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLmRpY3RbYV19LGMucHJvdG90eXBlLmV4dGVuZD1mdW5jdGlvbihiKXt0aGlzLmRpY3Q9YS5leHRlbmQoe30sYi5hbGwoKSx0aGlzLmRpY3QpfSxjLl9jYWNoZT17fSxjLmxvYWRQYXRoPWZ1bmN0aW9uKGEpe2lmKCEoYSBpbiBjLl9jYWNoZSkpe3ZhciBkPWIoYSk7Yy5fY2FjaGVbYV09ZH1yZXR1cm4gbmV3IGMoYy5fY2FjaGVbYV0pfSxjfSksYi5kZWZpbmUoXCJzZWxlY3QyL2RpYWNyaXRpY3NcIixbXSxmdW5jdGlvbigpe3ZhciBhPXtcIuKStlwiOlwiQVwiLFwi77yhXCI6XCJBXCIsXCLDgFwiOlwiQVwiLFwiw4FcIjpcIkFcIixcIsOCXCI6XCJBXCIsXCLhuqZcIjpcIkFcIixcIuG6pFwiOlwiQVwiLFwi4bqqXCI6XCJBXCIsXCLhuqhcIjpcIkFcIixcIsODXCI6XCJBXCIsXCLEgFwiOlwiQVwiLFwixIJcIjpcIkFcIixcIuG6sFwiOlwiQVwiLFwi4bquXCI6XCJBXCIsXCLhurRcIjpcIkFcIixcIuG6slwiOlwiQVwiLFwiyKZcIjpcIkFcIixcIsegXCI6XCJBXCIsXCLDhFwiOlwiQVwiLFwix55cIjpcIkFcIixcIuG6olwiOlwiQVwiLFwiw4VcIjpcIkFcIixcIse6XCI6XCJBXCIsXCLHjVwiOlwiQVwiLFwiyIBcIjpcIkFcIixcIsiCXCI6XCJBXCIsXCLhuqBcIjpcIkFcIixcIuG6rFwiOlwiQVwiLFwi4bq2XCI6XCJBXCIsXCLhuIBcIjpcIkFcIixcIsSEXCI6XCJBXCIsXCLIulwiOlwiQVwiLFwi4rGvXCI6XCJBXCIsXCLqnLJcIjpcIkFBXCIsXCLDhlwiOlwiQUVcIixcIse8XCI6XCJBRVwiLFwix6JcIjpcIkFFXCIsXCLqnLRcIjpcIkFPXCIsXCLqnLZcIjpcIkFVXCIsXCLqnLhcIjpcIkFWXCIsXCLqnLpcIjpcIkFWXCIsXCLqnLxcIjpcIkFZXCIsXCLikrdcIjpcIkJcIixcIu+8olwiOlwiQlwiLFwi4biCXCI6XCJCXCIsXCLhuIRcIjpcIkJcIixcIuG4hlwiOlwiQlwiLFwiyYNcIjpcIkJcIixcIsaCXCI6XCJCXCIsXCLGgVwiOlwiQlwiLFwi4pK4XCI6XCJDXCIsXCLvvKNcIjpcIkNcIixcIsSGXCI6XCJDXCIsXCLEiFwiOlwiQ1wiLFwixIpcIjpcIkNcIixcIsSMXCI6XCJDXCIsXCLDh1wiOlwiQ1wiLFwi4biIXCI6XCJDXCIsXCLGh1wiOlwiQ1wiLFwiyLtcIjpcIkNcIixcIuqcvlwiOlwiQ1wiLFwi4pK5XCI6XCJEXCIsXCLvvKRcIjpcIkRcIixcIuG4ilwiOlwiRFwiLFwixI5cIjpcIkRcIixcIuG4jFwiOlwiRFwiLFwi4biQXCI6XCJEXCIsXCLhuJJcIjpcIkRcIixcIuG4jlwiOlwiRFwiLFwixJBcIjpcIkRcIixcIsaLXCI6XCJEXCIsXCLGilwiOlwiRFwiLFwixolcIjpcIkRcIixcIuqduVwiOlwiRFwiLFwix7FcIjpcIkRaXCIsXCLHhFwiOlwiRFpcIixcIseyXCI6XCJEelwiLFwix4VcIjpcIkR6XCIsXCLikrpcIjpcIkVcIixcIu+8pVwiOlwiRVwiLFwiw4hcIjpcIkVcIixcIsOJXCI6XCJFXCIsXCLDilwiOlwiRVwiLFwi4buAXCI6XCJFXCIsXCLhur5cIjpcIkVcIixcIuG7hFwiOlwiRVwiLFwi4buCXCI6XCJFXCIsXCLhurxcIjpcIkVcIixcIsSSXCI6XCJFXCIsXCLhuJRcIjpcIkVcIixcIuG4llwiOlwiRVwiLFwixJRcIjpcIkVcIixcIsSWXCI6XCJFXCIsXCLDi1wiOlwiRVwiLFwi4bq6XCI6XCJFXCIsXCLEmlwiOlwiRVwiLFwiyIRcIjpcIkVcIixcIsiGXCI6XCJFXCIsXCLhurhcIjpcIkVcIixcIuG7hlwiOlwiRVwiLFwiyKhcIjpcIkVcIixcIuG4nFwiOlwiRVwiLFwixJhcIjpcIkVcIixcIuG4mFwiOlwiRVwiLFwi4biaXCI6XCJFXCIsXCLGkFwiOlwiRVwiLFwixo5cIjpcIkVcIixcIuKSu1wiOlwiRlwiLFwi77ymXCI6XCJGXCIsXCLhuJ5cIjpcIkZcIixcIsaRXCI6XCJGXCIsXCLqnbtcIjpcIkZcIixcIuKSvFwiOlwiR1wiLFwi77ynXCI6XCJHXCIsXCLHtFwiOlwiR1wiLFwixJxcIjpcIkdcIixcIuG4oFwiOlwiR1wiLFwixJ5cIjpcIkdcIixcIsSgXCI6XCJHXCIsXCLHplwiOlwiR1wiLFwixKJcIjpcIkdcIixcIsekXCI6XCJHXCIsXCLGk1wiOlwiR1wiLFwi6p6gXCI6XCJHXCIsXCLqnb1cIjpcIkdcIixcIuqdvlwiOlwiR1wiLFwi4pK9XCI6XCJIXCIsXCLvvKhcIjpcIkhcIixcIsSkXCI6XCJIXCIsXCLhuKJcIjpcIkhcIixcIuG4plwiOlwiSFwiLFwiyJ5cIjpcIkhcIixcIuG4pFwiOlwiSFwiLFwi4bioXCI6XCJIXCIsXCLhuKpcIjpcIkhcIixcIsSmXCI6XCJIXCIsXCLisadcIjpcIkhcIixcIuKxtVwiOlwiSFwiLFwi6p6NXCI6XCJIXCIsXCLikr5cIjpcIklcIixcIu+8qVwiOlwiSVwiLFwiw4xcIjpcIklcIixcIsONXCI6XCJJXCIsXCLDjlwiOlwiSVwiLFwixKhcIjpcIklcIixcIsSqXCI6XCJJXCIsXCLErFwiOlwiSVwiLFwixLBcIjpcIklcIixcIsOPXCI6XCJJXCIsXCLhuK5cIjpcIklcIixcIuG7iFwiOlwiSVwiLFwix49cIjpcIklcIixcIsiIXCI6XCJJXCIsXCLIilwiOlwiSVwiLFwi4buKXCI6XCJJXCIsXCLErlwiOlwiSVwiLFwi4bisXCI6XCJJXCIsXCLGl1wiOlwiSVwiLFwi4pK/XCI6XCJKXCIsXCLvvKpcIjpcIkpcIixcIsS0XCI6XCJKXCIsXCLJiFwiOlwiSlwiLFwi4pOAXCI6XCJLXCIsXCLvvKtcIjpcIktcIixcIuG4sFwiOlwiS1wiLFwix6hcIjpcIktcIixcIuG4slwiOlwiS1wiLFwixLZcIjpcIktcIixcIuG4tFwiOlwiS1wiLFwixphcIjpcIktcIixcIuKxqVwiOlwiS1wiLFwi6p2AXCI6XCJLXCIsXCLqnYJcIjpcIktcIixcIuqdhFwiOlwiS1wiLFwi6p6iXCI6XCJLXCIsXCLik4FcIjpcIkxcIixcIu+8rFwiOlwiTFwiLFwixL9cIjpcIkxcIixcIsS5XCI6XCJMXCIsXCLEvVwiOlwiTFwiLFwi4bi2XCI6XCJMXCIsXCLhuLhcIjpcIkxcIixcIsS7XCI6XCJMXCIsXCLhuLxcIjpcIkxcIixcIuG4ulwiOlwiTFwiLFwixYFcIjpcIkxcIixcIsi9XCI6XCJMXCIsXCLisaJcIjpcIkxcIixcIuKxoFwiOlwiTFwiLFwi6p2IXCI6XCJMXCIsXCLqnYZcIjpcIkxcIixcIuqegFwiOlwiTFwiLFwix4dcIjpcIkxKXCIsXCLHiFwiOlwiTGpcIixcIuKTglwiOlwiTVwiLFwi77ytXCI6XCJNXCIsXCLhuL5cIjpcIk1cIixcIuG5gFwiOlwiTVwiLFwi4bmCXCI6XCJNXCIsXCLisa5cIjpcIk1cIixcIsacXCI6XCJNXCIsXCLik4NcIjpcIk5cIixcIu+8rlwiOlwiTlwiLFwix7hcIjpcIk5cIixcIsWDXCI6XCJOXCIsXCLDkVwiOlwiTlwiLFwi4bmEXCI6XCJOXCIsXCLFh1wiOlwiTlwiLFwi4bmGXCI6XCJOXCIsXCLFhVwiOlwiTlwiLFwi4bmKXCI6XCJOXCIsXCLhuYhcIjpcIk5cIixcIsigXCI6XCJOXCIsXCLGnVwiOlwiTlwiLFwi6p6QXCI6XCJOXCIsXCLqnqRcIjpcIk5cIixcIseKXCI6XCJOSlwiLFwix4tcIjpcIk5qXCIsXCLik4RcIjpcIk9cIixcIu+8r1wiOlwiT1wiLFwiw5JcIjpcIk9cIixcIsOTXCI6XCJPXCIsXCLDlFwiOlwiT1wiLFwi4buSXCI6XCJPXCIsXCLhu5BcIjpcIk9cIixcIuG7llwiOlwiT1wiLFwi4buUXCI6XCJPXCIsXCLDlVwiOlwiT1wiLFwi4bmMXCI6XCJPXCIsXCLIrFwiOlwiT1wiLFwi4bmOXCI6XCJPXCIsXCLFjFwiOlwiT1wiLFwi4bmQXCI6XCJPXCIsXCLhuZJcIjpcIk9cIixcIsWOXCI6XCJPXCIsXCLIrlwiOlwiT1wiLFwiyLBcIjpcIk9cIixcIsOWXCI6XCJPXCIsXCLIqlwiOlwiT1wiLFwi4buOXCI6XCJPXCIsXCLFkFwiOlwiT1wiLFwix5FcIjpcIk9cIixcIsiMXCI6XCJPXCIsXCLIjlwiOlwiT1wiLFwixqBcIjpcIk9cIixcIuG7nFwiOlwiT1wiLFwi4buaXCI6XCJPXCIsXCLhu6BcIjpcIk9cIixcIuG7nlwiOlwiT1wiLFwi4buiXCI6XCJPXCIsXCLhu4xcIjpcIk9cIixcIuG7mFwiOlwiT1wiLFwix6pcIjpcIk9cIixcIsesXCI6XCJPXCIsXCLDmFwiOlwiT1wiLFwix75cIjpcIk9cIixcIsaGXCI6XCJPXCIsXCLGn1wiOlwiT1wiLFwi6p2KXCI6XCJPXCIsXCLqnYxcIjpcIk9cIixcIsaiXCI6XCJPSVwiLFwi6p2OXCI6XCJPT1wiLFwiyKJcIjpcIk9VXCIsXCLik4VcIjpcIlBcIixcIu+8sFwiOlwiUFwiLFwi4bmUXCI6XCJQXCIsXCLhuZZcIjpcIlBcIixcIsakXCI6XCJQXCIsXCLisaNcIjpcIlBcIixcIuqdkFwiOlwiUFwiLFwi6p2SXCI6XCJQXCIsXCLqnZRcIjpcIlBcIixcIuKThlwiOlwiUVwiLFwi77yxXCI6XCJRXCIsXCLqnZZcIjpcIlFcIixcIuqdmFwiOlwiUVwiLFwiyYpcIjpcIlFcIixcIuKTh1wiOlwiUlwiLFwi77yyXCI6XCJSXCIsXCLFlFwiOlwiUlwiLFwi4bmYXCI6XCJSXCIsXCLFmFwiOlwiUlwiLFwiyJBcIjpcIlJcIixcIsiSXCI6XCJSXCIsXCLhuZpcIjpcIlJcIixcIuG5nFwiOlwiUlwiLFwixZZcIjpcIlJcIixcIuG5nlwiOlwiUlwiLFwiyYxcIjpcIlJcIixcIuKxpFwiOlwiUlwiLFwi6p2aXCI6XCJSXCIsXCLqnqZcIjpcIlJcIixcIuqeglwiOlwiUlwiLFwi4pOIXCI6XCJTXCIsXCLvvLNcIjpcIlNcIixcIuG6nlwiOlwiU1wiLFwixZpcIjpcIlNcIixcIuG5pFwiOlwiU1wiLFwixZxcIjpcIlNcIixcIuG5oFwiOlwiU1wiLFwixaBcIjpcIlNcIixcIuG5plwiOlwiU1wiLFwi4bmiXCI6XCJTXCIsXCLhuahcIjpcIlNcIixcIsiYXCI6XCJTXCIsXCLFnlwiOlwiU1wiLFwi4rG+XCI6XCJTXCIsXCLqnqhcIjpcIlNcIixcIuqehFwiOlwiU1wiLFwi4pOJXCI6XCJUXCIsXCLvvLRcIjpcIlRcIixcIuG5qlwiOlwiVFwiLFwixaRcIjpcIlRcIixcIuG5rFwiOlwiVFwiLFwiyJpcIjpcIlRcIixcIsWiXCI6XCJUXCIsXCLhubBcIjpcIlRcIixcIuG5rlwiOlwiVFwiLFwixaZcIjpcIlRcIixcIsasXCI6XCJUXCIsXCLGrlwiOlwiVFwiLFwiyL5cIjpcIlRcIixcIuqehlwiOlwiVFwiLFwi6pyoXCI6XCJUWlwiLFwi4pOKXCI6XCJVXCIsXCLvvLVcIjpcIlVcIixcIsOZXCI6XCJVXCIsXCLDmlwiOlwiVVwiLFwiw5tcIjpcIlVcIixcIsWoXCI6XCJVXCIsXCLhubhcIjpcIlVcIixcIsWqXCI6XCJVXCIsXCLhubpcIjpcIlVcIixcIsWsXCI6XCJVXCIsXCLDnFwiOlwiVVwiLFwix5tcIjpcIlVcIixcIseXXCI6XCJVXCIsXCLHlVwiOlwiVVwiLFwix5lcIjpcIlVcIixcIuG7plwiOlwiVVwiLFwixa5cIjpcIlVcIixcIsWwXCI6XCJVXCIsXCLHk1wiOlwiVVwiLFwiyJRcIjpcIlVcIixcIsiWXCI6XCJVXCIsXCLGr1wiOlwiVVwiLFwi4buqXCI6XCJVXCIsXCLhu6hcIjpcIlVcIixcIuG7rlwiOlwiVVwiLFwi4busXCI6XCJVXCIsXCLhu7BcIjpcIlVcIixcIuG7pFwiOlwiVVwiLFwi4bmyXCI6XCJVXCIsXCLFslwiOlwiVVwiLFwi4bm2XCI6XCJVXCIsXCLhubRcIjpcIlVcIixcIsmEXCI6XCJVXCIsXCLik4tcIjpcIlZcIixcIu+8tlwiOlwiVlwiLFwi4bm8XCI6XCJWXCIsXCLhub5cIjpcIlZcIixcIsayXCI6XCJWXCIsXCLqnZ5cIjpcIlZcIixcIsmFXCI6XCJWXCIsXCLqnaBcIjpcIlZZXCIsXCLik4xcIjpcIldcIixcIu+8t1wiOlwiV1wiLFwi4bqAXCI6XCJXXCIsXCLhuoJcIjpcIldcIixcIsW0XCI6XCJXXCIsXCLhuoZcIjpcIldcIixcIuG6hFwiOlwiV1wiLFwi4bqIXCI6XCJXXCIsXCLisbJcIjpcIldcIixcIuKTjVwiOlwiWFwiLFwi77y4XCI6XCJYXCIsXCLhuopcIjpcIlhcIixcIuG6jFwiOlwiWFwiLFwi4pOOXCI6XCJZXCIsXCLvvLlcIjpcIllcIixcIuG7slwiOlwiWVwiLFwiw51cIjpcIllcIixcIsW2XCI6XCJZXCIsXCLhu7hcIjpcIllcIixcIsiyXCI6XCJZXCIsXCLhuo5cIjpcIllcIixcIsW4XCI6XCJZXCIsXCLhu7ZcIjpcIllcIixcIuG7tFwiOlwiWVwiLFwixrNcIjpcIllcIixcIsmOXCI6XCJZXCIsXCLhu75cIjpcIllcIixcIuKTj1wiOlwiWlwiLFwi77y6XCI6XCJaXCIsXCLFuVwiOlwiWlwiLFwi4bqQXCI6XCJaXCIsXCLFu1wiOlwiWlwiLFwixb1cIjpcIlpcIixcIuG6klwiOlwiWlwiLFwi4bqUXCI6XCJaXCIsXCLGtVwiOlwiWlwiLFwiyKRcIjpcIlpcIixcIuKxv1wiOlwiWlwiLFwi4rGrXCI6XCJaXCIsXCLqnaJcIjpcIlpcIixcIuKTkFwiOlwiYVwiLFwi772BXCI6XCJhXCIsXCLhuppcIjpcImFcIixcIsOgXCI6XCJhXCIsXCLDoVwiOlwiYVwiLFwiw6JcIjpcImFcIixcIuG6p1wiOlwiYVwiLFwi4bqlXCI6XCJhXCIsXCLhuqtcIjpcImFcIixcIuG6qVwiOlwiYVwiLFwiw6NcIjpcImFcIixcIsSBXCI6XCJhXCIsXCLEg1wiOlwiYVwiLFwi4bqxXCI6XCJhXCIsXCLhuq9cIjpcImFcIixcIuG6tVwiOlwiYVwiLFwi4bqzXCI6XCJhXCIsXCLIp1wiOlwiYVwiLFwix6FcIjpcImFcIixcIsOkXCI6XCJhXCIsXCLHn1wiOlwiYVwiLFwi4bqjXCI6XCJhXCIsXCLDpVwiOlwiYVwiLFwix7tcIjpcImFcIixcIseOXCI6XCJhXCIsXCLIgVwiOlwiYVwiLFwiyINcIjpcImFcIixcIuG6oVwiOlwiYVwiLFwi4bqtXCI6XCJhXCIsXCLhurdcIjpcImFcIixcIuG4gVwiOlwiYVwiLFwixIVcIjpcImFcIixcIuKxpVwiOlwiYVwiLFwiyZBcIjpcImFcIixcIuqcs1wiOlwiYWFcIixcIsOmXCI6XCJhZVwiLFwix71cIjpcImFlXCIsXCLHo1wiOlwiYWVcIixcIuqctVwiOlwiYW9cIixcIuqct1wiOlwiYXVcIixcIuqcuVwiOlwiYXZcIixcIuqcu1wiOlwiYXZcIixcIuqcvVwiOlwiYXlcIixcIuKTkVwiOlwiYlwiLFwi772CXCI6XCJiXCIsXCLhuINcIjpcImJcIixcIuG4hVwiOlwiYlwiLFwi4biHXCI6XCJiXCIsXCLGgFwiOlwiYlwiLFwixoNcIjpcImJcIixcIsmTXCI6XCJiXCIsXCLik5JcIjpcImNcIixcIu+9g1wiOlwiY1wiLFwixIdcIjpcImNcIixcIsSJXCI6XCJjXCIsXCLEi1wiOlwiY1wiLFwixI1cIjpcImNcIixcIsOnXCI6XCJjXCIsXCLhuIlcIjpcImNcIixcIsaIXCI6XCJjXCIsXCLIvFwiOlwiY1wiLFwi6py/XCI6XCJjXCIsXCLihoRcIjpcImNcIixcIuKTk1wiOlwiZFwiLFwi772EXCI6XCJkXCIsXCLhuItcIjpcImRcIixcIsSPXCI6XCJkXCIsXCLhuI1cIjpcImRcIixcIuG4kVwiOlwiZFwiLFwi4biTXCI6XCJkXCIsXCLhuI9cIjpcImRcIixcIsSRXCI6XCJkXCIsXCLGjFwiOlwiZFwiLFwiyZZcIjpcImRcIixcIsmXXCI6XCJkXCIsXCLqnbpcIjpcImRcIixcIsezXCI6XCJkelwiLFwix4ZcIjpcImR6XCIsXCLik5RcIjpcImVcIixcIu+9hVwiOlwiZVwiLFwiw6hcIjpcImVcIixcIsOpXCI6XCJlXCIsXCLDqlwiOlwiZVwiLFwi4buBXCI6XCJlXCIsXCLhur9cIjpcImVcIixcIuG7hVwiOlwiZVwiLFwi4buDXCI6XCJlXCIsXCLhur1cIjpcImVcIixcIsSTXCI6XCJlXCIsXCLhuJVcIjpcImVcIixcIuG4l1wiOlwiZVwiLFwixJVcIjpcImVcIixcIsSXXCI6XCJlXCIsXCLDq1wiOlwiZVwiLFwi4bq7XCI6XCJlXCIsXCLEm1wiOlwiZVwiLFwiyIVcIjpcImVcIixcIsiHXCI6XCJlXCIsXCLhurlcIjpcImVcIixcIuG7h1wiOlwiZVwiLFwiyKlcIjpcImVcIixcIuG4nVwiOlwiZVwiLFwixJlcIjpcImVcIixcIuG4mVwiOlwiZVwiLFwi4bibXCI6XCJlXCIsXCLJh1wiOlwiZVwiLFwiyZtcIjpcImVcIixcIsedXCI6XCJlXCIsXCLik5VcIjpcImZcIixcIu+9hlwiOlwiZlwiLFwi4bifXCI6XCJmXCIsXCLGklwiOlwiZlwiLFwi6p28XCI6XCJmXCIsXCLik5ZcIjpcImdcIixcIu+9h1wiOlwiZ1wiLFwix7VcIjpcImdcIixcIsSdXCI6XCJnXCIsXCLhuKFcIjpcImdcIixcIsSfXCI6XCJnXCIsXCLEoVwiOlwiZ1wiLFwix6dcIjpcImdcIixcIsSjXCI6XCJnXCIsXCLHpVwiOlwiZ1wiLFwiyaBcIjpcImdcIixcIuqeoVwiOlwiZ1wiLFwi4bW5XCI6XCJnXCIsXCLqnb9cIjpcImdcIixcIuKTl1wiOlwiaFwiLFwi772IXCI6XCJoXCIsXCLEpVwiOlwiaFwiLFwi4bijXCI6XCJoXCIsXCLhuKdcIjpcImhcIixcIsifXCI6XCJoXCIsXCLhuKVcIjpcImhcIixcIuG4qVwiOlwiaFwiLFwi4birXCI6XCJoXCIsXCLhupZcIjpcImhcIixcIsSnXCI6XCJoXCIsXCLisahcIjpcImhcIixcIuKxtlwiOlwiaFwiLFwiyaVcIjpcImhcIixcIsaVXCI6XCJodlwiLFwi4pOYXCI6XCJpXCIsXCLvvYlcIjpcImlcIixcIsOsXCI6XCJpXCIsXCLDrVwiOlwiaVwiLFwiw65cIjpcImlcIixcIsSpXCI6XCJpXCIsXCLEq1wiOlwiaVwiLFwixK1cIjpcImlcIixcIsOvXCI6XCJpXCIsXCLhuK9cIjpcImlcIixcIuG7iVwiOlwiaVwiLFwix5BcIjpcImlcIixcIsiJXCI6XCJpXCIsXCLIi1wiOlwiaVwiLFwi4buLXCI6XCJpXCIsXCLEr1wiOlwiaVwiLFwi4bitXCI6XCJpXCIsXCLJqFwiOlwiaVwiLFwixLFcIjpcImlcIixcIuKTmVwiOlwialwiLFwi772KXCI6XCJqXCIsXCLEtVwiOlwialwiLFwix7BcIjpcImpcIixcIsmJXCI6XCJqXCIsXCLik5pcIjpcImtcIixcIu+9i1wiOlwia1wiLFwi4bixXCI6XCJrXCIsXCLHqVwiOlwia1wiLFwi4bizXCI6XCJrXCIsXCLEt1wiOlwia1wiLFwi4bi1XCI6XCJrXCIsXCLGmVwiOlwia1wiLFwi4rGqXCI6XCJrXCIsXCLqnYFcIjpcImtcIixcIuqdg1wiOlwia1wiLFwi6p2FXCI6XCJrXCIsXCLqnqNcIjpcImtcIixcIuKTm1wiOlwibFwiLFwi772MXCI6XCJsXCIsXCLFgFwiOlwibFwiLFwixLpcIjpcImxcIixcIsS+XCI6XCJsXCIsXCLhuLdcIjpcImxcIixcIuG4uVwiOlwibFwiLFwixLxcIjpcImxcIixcIuG4vVwiOlwibFwiLFwi4bi7XCI6XCJsXCIsXCLFv1wiOlwibFwiLFwixYJcIjpcImxcIixcIsaaXCI6XCJsXCIsXCLJq1wiOlwibFwiLFwi4rGhXCI6XCJsXCIsXCLqnYlcIjpcImxcIixcIuqegVwiOlwibFwiLFwi6p2HXCI6XCJsXCIsXCLHiVwiOlwibGpcIixcIuKTnFwiOlwibVwiLFwi772NXCI6XCJtXCIsXCLhuL9cIjpcIm1cIixcIuG5gVwiOlwibVwiLFwi4bmDXCI6XCJtXCIsXCLJsVwiOlwibVwiLFwiya9cIjpcIm1cIixcIuKTnVwiOlwiblwiLFwi772OXCI6XCJuXCIsXCLHuVwiOlwiblwiLFwixYRcIjpcIm5cIixcIsOxXCI6XCJuXCIsXCLhuYVcIjpcIm5cIixcIsWIXCI6XCJuXCIsXCLhuYdcIjpcIm5cIixcIsWGXCI6XCJuXCIsXCLhuYtcIjpcIm5cIixcIuG5iVwiOlwiblwiLFwixp5cIjpcIm5cIixcIsmyXCI6XCJuXCIsXCLFiVwiOlwiblwiLFwi6p6RXCI6XCJuXCIsXCLqnqVcIjpcIm5cIixcIseMXCI6XCJualwiLFwi4pOeXCI6XCJvXCIsXCLvvY9cIjpcIm9cIixcIsOyXCI6XCJvXCIsXCLDs1wiOlwib1wiLFwiw7RcIjpcIm9cIixcIuG7k1wiOlwib1wiLFwi4buRXCI6XCJvXCIsXCLhu5dcIjpcIm9cIixcIuG7lVwiOlwib1wiLFwiw7VcIjpcIm9cIixcIuG5jVwiOlwib1wiLFwiyK1cIjpcIm9cIixcIuG5j1wiOlwib1wiLFwixY1cIjpcIm9cIixcIuG5kVwiOlwib1wiLFwi4bmTXCI6XCJvXCIsXCLFj1wiOlwib1wiLFwiyK9cIjpcIm9cIixcIsixXCI6XCJvXCIsXCLDtlwiOlwib1wiLFwiyKtcIjpcIm9cIixcIuG7j1wiOlwib1wiLFwixZFcIjpcIm9cIixcIseSXCI6XCJvXCIsXCLIjVwiOlwib1wiLFwiyI9cIjpcIm9cIixcIsahXCI6XCJvXCIsXCLhu51cIjpcIm9cIixcIuG7m1wiOlwib1wiLFwi4buhXCI6XCJvXCIsXCLhu59cIjpcIm9cIixcIuG7o1wiOlwib1wiLFwi4buNXCI6XCJvXCIsXCLhu5lcIjpcIm9cIixcIserXCI6XCJvXCIsXCLHrVwiOlwib1wiLFwiw7hcIjpcIm9cIixcIse/XCI6XCJvXCIsXCLJlFwiOlwib1wiLFwi6p2LXCI6XCJvXCIsXCLqnY1cIjpcIm9cIixcIsm1XCI6XCJvXCIsXCLGo1wiOlwib2lcIixcIsijXCI6XCJvdVwiLFwi6p2PXCI6XCJvb1wiLFwi4pOfXCI6XCJwXCIsXCLvvZBcIjpcInBcIixcIuG5lVwiOlwicFwiLFwi4bmXXCI6XCJwXCIsXCLGpVwiOlwicFwiLFwi4bW9XCI6XCJwXCIsXCLqnZFcIjpcInBcIixcIuqdk1wiOlwicFwiLFwi6p2VXCI6XCJwXCIsXCLik6BcIjpcInFcIixcIu+9kVwiOlwicVwiLFwiyYtcIjpcInFcIixcIuqdl1wiOlwicVwiLFwi6p2ZXCI6XCJxXCIsXCLik6FcIjpcInJcIixcIu+9klwiOlwiclwiLFwixZVcIjpcInJcIixcIuG5mVwiOlwiclwiLFwixZlcIjpcInJcIixcIsiRXCI6XCJyXCIsXCLIk1wiOlwiclwiLFwi4bmbXCI6XCJyXCIsXCLhuZ1cIjpcInJcIixcIsWXXCI6XCJyXCIsXCLhuZ9cIjpcInJcIixcIsmNXCI6XCJyXCIsXCLJvVwiOlwiclwiLFwi6p2bXCI6XCJyXCIsXCLqnqdcIjpcInJcIixcIuqeg1wiOlwiclwiLFwi4pOiXCI6XCJzXCIsXCLvvZNcIjpcInNcIixcIsOfXCI6XCJzXCIsXCLFm1wiOlwic1wiLFwi4bmlXCI6XCJzXCIsXCLFnVwiOlwic1wiLFwi4bmhXCI6XCJzXCIsXCLFoVwiOlwic1wiLFwi4bmnXCI6XCJzXCIsXCLhuaNcIjpcInNcIixcIuG5qVwiOlwic1wiLFwiyJlcIjpcInNcIixcIsWfXCI6XCJzXCIsXCLIv1wiOlwic1wiLFwi6p6pXCI6XCJzXCIsXCLqnoVcIjpcInNcIixcIuG6m1wiOlwic1wiLFwi4pOjXCI6XCJ0XCIsXCLvvZRcIjpcInRcIixcIuG5q1wiOlwidFwiLFwi4bqXXCI6XCJ0XCIsXCLFpVwiOlwidFwiLFwi4bmtXCI6XCJ0XCIsXCLIm1wiOlwidFwiLFwixaNcIjpcInRcIixcIuG5sVwiOlwidFwiLFwi4bmvXCI6XCJ0XCIsXCLFp1wiOlwidFwiLFwixq1cIjpcInRcIixcIsqIXCI6XCJ0XCIsXCLisaZcIjpcInRcIixcIuqeh1wiOlwidFwiLFwi6pypXCI6XCJ0elwiLFwi4pOkXCI6XCJ1XCIsXCLvvZVcIjpcInVcIixcIsO5XCI6XCJ1XCIsXCLDulwiOlwidVwiLFwiw7tcIjpcInVcIixcIsWpXCI6XCJ1XCIsXCLhublcIjpcInVcIixcIsWrXCI6XCJ1XCIsXCLhubtcIjpcInVcIixcIsWtXCI6XCJ1XCIsXCLDvFwiOlwidVwiLFwix5xcIjpcInVcIixcIseYXCI6XCJ1XCIsXCLHllwiOlwidVwiLFwix5pcIjpcInVcIixcIuG7p1wiOlwidVwiLFwixa9cIjpcInVcIixcIsWxXCI6XCJ1XCIsXCLHlFwiOlwidVwiLFwiyJVcIjpcInVcIixcIsiXXCI6XCJ1XCIsXCLGsFwiOlwidVwiLFwi4burXCI6XCJ1XCIsXCLhu6lcIjpcInVcIixcIuG7r1wiOlwidVwiLFwi4butXCI6XCJ1XCIsXCLhu7FcIjpcInVcIixcIuG7pVwiOlwidVwiLFwi4bmzXCI6XCJ1XCIsXCLFs1wiOlwidVwiLFwi4bm3XCI6XCJ1XCIsXCLhubVcIjpcInVcIixcIsqJXCI6XCJ1XCIsXCLik6VcIjpcInZcIixcIu+9llwiOlwidlwiLFwi4bm9XCI6XCJ2XCIsXCLhub9cIjpcInZcIixcIsqLXCI6XCJ2XCIsXCLqnZ9cIjpcInZcIixcIsqMXCI6XCJ2XCIsXCLqnaFcIjpcInZ5XCIsXCLik6ZcIjpcIndcIixcIu+9l1wiOlwid1wiLFwi4bqBXCI6XCJ3XCIsXCLhuoNcIjpcIndcIixcIsW1XCI6XCJ3XCIsXCLhuodcIjpcIndcIixcIuG6hVwiOlwid1wiLFwi4bqYXCI6XCJ3XCIsXCLhuolcIjpcIndcIixcIuKxs1wiOlwid1wiLFwi4pOnXCI6XCJ4XCIsXCLvvZhcIjpcInhcIixcIuG6i1wiOlwieFwiLFwi4bqNXCI6XCJ4XCIsXCLik6hcIjpcInlcIixcIu+9mVwiOlwieVwiLFwi4buzXCI6XCJ5XCIsXCLDvVwiOlwieVwiLFwixbdcIjpcInlcIixcIuG7uVwiOlwieVwiLFwiyLNcIjpcInlcIixcIuG6j1wiOlwieVwiLFwiw79cIjpcInlcIixcIuG7t1wiOlwieVwiLFwi4bqZXCI6XCJ5XCIsXCLhu7VcIjpcInlcIixcIsa0XCI6XCJ5XCIsXCLJj1wiOlwieVwiLFwi4bu/XCI6XCJ5XCIsXCLik6lcIjpcInpcIixcIu+9mlwiOlwielwiLFwixbpcIjpcInpcIixcIuG6kVwiOlwielwiLFwixbxcIjpcInpcIixcIsW+XCI6XCJ6XCIsXCLhupNcIjpcInpcIixcIuG6lVwiOlwielwiLFwixrZcIjpcInpcIixcIsilXCI6XCJ6XCIsXCLJgFwiOlwielwiLFwi4rGsXCI6XCJ6XCIsXCLqnaNcIjpcInpcIixcIs6GXCI6XCLOkVwiLFwizohcIjpcIs6VXCIsXCLOiVwiOlwizpdcIixcIs6KXCI6XCLOmVwiLFwizqpcIjpcIs6ZXCIsXCLOjFwiOlwizp9cIixcIs6OXCI6XCLOpVwiLFwizqtcIjpcIs6lXCIsXCLOj1wiOlwizqlcIixcIs6sXCI6XCLOsVwiLFwizq1cIjpcIs61XCIsXCLOrlwiOlwizrdcIixcIs6vXCI6XCLOuVwiLFwiz4pcIjpcIs65XCIsXCLOkFwiOlwizrlcIixcIs+MXCI6XCLOv1wiLFwiz41cIjpcIs+FXCIsXCLPi1wiOlwiz4VcIixcIs6wXCI6XCLPhVwiLFwiz4lcIjpcIs+JXCIsXCLPglwiOlwiz4NcIn07cmV0dXJuIGF9KSxiLmRlZmluZShcInNlbGVjdDIvZGF0YS9iYXNlXCIsW1wiLi4vdXRpbHNcIl0sZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYihhLGMpe2IuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmNhbGwodGhpcyl9cmV0dXJuIGEuRXh0ZW5kKGIsYS5PYnNlcnZhYmxlKSxiLnByb3RvdHlwZS5jdXJyZW50PWZ1bmN0aW9uKGEpe3Rocm93IG5ldyBFcnJvcihcIlRoZSBgY3VycmVudGAgbWV0aG9kIG11c3QgYmUgZGVmaW5lZCBpbiBjaGlsZCBjbGFzc2VzLlwiKX0sYi5wcm90b3R5cGUucXVlcnk9ZnVuY3Rpb24oYSxiKXt0aHJvdyBuZXcgRXJyb3IoXCJUaGUgYHF1ZXJ5YCBtZXRob2QgbXVzdCBiZSBkZWZpbmVkIGluIGNoaWxkIGNsYXNzZXMuXCIpfSxiLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGEsYil7fSxiLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7fSxiLnByb3RvdHlwZS5nZW5lcmF0ZVJlc3VsdElkPWZ1bmN0aW9uKGIsYyl7dmFyIGQ9Yi5pZCtcIi1yZXN1bHQtXCI7cmV0dXJuIGQrPWEuZ2VuZXJhdGVDaGFycyg0KSxkKz1udWxsIT1jLmlkP1wiLVwiK2MuaWQudG9TdHJpbmcoKTpcIi1cIithLmdlbmVyYXRlQ2hhcnMoNCl9LGJ9KSxiLmRlZmluZShcInNlbGVjdDIvZGF0YS9zZWxlY3RcIixbXCIuL2Jhc2VcIixcIi4uL3V0aWxzXCIsXCJqcXVlcnlcIl0sZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQoYSxiKXt0aGlzLiRlbGVtZW50PWEsdGhpcy5vcHRpb25zPWIsZC5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzKX1yZXR1cm4gYi5FeHRlbmQoZCxhKSxkLnByb3RvdHlwZS5jdXJyZW50PWZ1bmN0aW9uKGEpe3ZhciBiPVtdLGQ9dGhpczt0aGlzLiRlbGVtZW50LmZpbmQoXCI6c2VsZWN0ZWRcIikuZWFjaChmdW5jdGlvbigpe3ZhciBhPWModGhpcyksZT1kLml0ZW0oYSk7Yi5wdXNoKGUpfSksYShiKX0sZC5wcm90b3R5cGUuc2VsZWN0PWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXM7aWYoYS5zZWxlY3RlZD0hMCxjKGEuZWxlbWVudCkuaXMoXCJvcHRpb25cIikpcmV0dXJuIGEuZWxlbWVudC5zZWxlY3RlZD0hMCx2b2lkIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihcImNoYW5nZVwiKTtcclxuaWYodGhpcy4kZWxlbWVudC5wcm9wKFwibXVsdGlwbGVcIikpdGhpcy5jdXJyZW50KGZ1bmN0aW9uKGQpe3ZhciBlPVtdO2E9W2FdLGEucHVzaC5hcHBseShhLGQpO2Zvcih2YXIgZj0wO2Y8YS5sZW5ndGg7ZisrKXt2YXIgZz1hW2ZdLmlkOy0xPT09Yy5pbkFycmF5KGcsZSkmJmUucHVzaChnKX1iLiRlbGVtZW50LnZhbChlKSxiLiRlbGVtZW50LnRyaWdnZXIoXCJjaGFuZ2VcIil9KTtlbHNle3ZhciBkPWEuaWQ7dGhpcy4kZWxlbWVudC52YWwoZCksdGhpcy4kZWxlbWVudC50cmlnZ2VyKFwiY2hhbmdlXCIpfX0sZC5wcm90b3R5cGUudW5zZWxlY3Q9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcztpZih0aGlzLiRlbGVtZW50LnByb3AoXCJtdWx0aXBsZVwiKSlyZXR1cm4gYS5zZWxlY3RlZD0hMSxjKGEuZWxlbWVudCkuaXMoXCJvcHRpb25cIik/KGEuZWxlbWVudC5zZWxlY3RlZD0hMSx2b2lkIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihcImNoYW5nZVwiKSk6dm9pZCB0aGlzLmN1cnJlbnQoZnVuY3Rpb24oZCl7Zm9yKHZhciBlPVtdLGY9MDtmPGQubGVuZ3RoO2YrKyl7dmFyIGc9ZFtmXS5pZDtnIT09YS5pZCYmLTE9PT1jLmluQXJyYXkoZyxlKSYmZS5wdXNoKGcpfWIuJGVsZW1lbnQudmFsKGUpLGIuJGVsZW1lbnQudHJpZ2dlcihcImNoYW5nZVwiKX0pfSxkLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpczt0aGlzLmNvbnRhaW5lcj1hLGEub24oXCJzZWxlY3RcIixmdW5jdGlvbihhKXtjLnNlbGVjdChhLmRhdGEpfSksYS5vbihcInVuc2VsZWN0XCIsZnVuY3Rpb24oYSl7Yy51bnNlbGVjdChhLmRhdGEpfSl9LGQucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLiRlbGVtZW50LmZpbmQoXCIqXCIpLmVhY2goZnVuY3Rpb24oKXtjLnJlbW92ZURhdGEodGhpcyxcImRhdGFcIil9KX0sZC5wcm90b3R5cGUucXVlcnk9ZnVuY3Rpb24oYSxiKXt2YXIgZD1bXSxlPXRoaXMsZj10aGlzLiRlbGVtZW50LmNoaWxkcmVuKCk7Zi5lYWNoKGZ1bmN0aW9uKCl7dmFyIGI9Yyh0aGlzKTtpZihiLmlzKFwib3B0aW9uXCIpfHxiLmlzKFwib3B0Z3JvdXBcIikpe3ZhciBmPWUuaXRlbShiKSxnPWUubWF0Y2hlcyhhLGYpO251bGwhPT1nJiZkLnB1c2goZyl9fSksYih7cmVzdWx0czpkfSl9LGQucHJvdG90eXBlLmFkZE9wdGlvbnM9ZnVuY3Rpb24oYSl7Yi5hcHBlbmRNYW55KHRoaXMuJGVsZW1lbnQsYSl9LGQucHJvdG90eXBlLm9wdGlvbj1mdW5jdGlvbihhKXt2YXIgYjthLmNoaWxkcmVuPyhiPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvcHRncm91cFwiKSxiLmxhYmVsPWEudGV4dCk6KGI9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9wdGlvblwiKSx2b2lkIDAhPT1iLnRleHRDb250ZW50P2IudGV4dENvbnRlbnQ9YS50ZXh0OmIuaW5uZXJUZXh0PWEudGV4dCksYS5pZCYmKGIudmFsdWU9YS5pZCksYS5kaXNhYmxlZCYmKGIuZGlzYWJsZWQ9ITApLGEuc2VsZWN0ZWQmJihiLnNlbGVjdGVkPSEwKSxhLnRpdGxlJiYoYi50aXRsZT1hLnRpdGxlKTt2YXIgZD1jKGIpLGU9dGhpcy5fbm9ybWFsaXplSXRlbShhKTtyZXR1cm4gZS5lbGVtZW50PWIsYy5kYXRhKGIsXCJkYXRhXCIsZSksZH0sZC5wcm90b3R5cGUuaXRlbT1mdW5jdGlvbihhKXt2YXIgYj17fTtpZihiPWMuZGF0YShhWzBdLFwiZGF0YVwiKSxudWxsIT1iKXJldHVybiBiO2lmKGEuaXMoXCJvcHRpb25cIikpYj17aWQ6YS52YWwoKSx0ZXh0OmEudGV4dCgpLGRpc2FibGVkOmEucHJvcChcImRpc2FibGVkXCIpLHNlbGVjdGVkOmEucHJvcChcInNlbGVjdGVkXCIpLHRpdGxlOmEucHJvcChcInRpdGxlXCIpfTtlbHNlIGlmKGEuaXMoXCJvcHRncm91cFwiKSl7Yj17dGV4dDphLnByb3AoXCJsYWJlbFwiKSxjaGlsZHJlbjpbXSx0aXRsZTphLnByb3AoXCJ0aXRsZVwiKX07Zm9yKHZhciBkPWEuY2hpbGRyZW4oXCJvcHRpb25cIiksZT1bXSxmPTA7ZjxkLmxlbmd0aDtmKyspe3ZhciBnPWMoZFtmXSksaD10aGlzLml0ZW0oZyk7ZS5wdXNoKGgpfWIuY2hpbGRyZW49ZX1yZXR1cm4gYj10aGlzLl9ub3JtYWxpemVJdGVtKGIpLGIuZWxlbWVudD1hWzBdLGMuZGF0YShhWzBdLFwiZGF0YVwiLGIpLGJ9LGQucHJvdG90eXBlLl9ub3JtYWxpemVJdGVtPWZ1bmN0aW9uKGEpe2MuaXNQbGFpbk9iamVjdChhKXx8KGE9e2lkOmEsdGV4dDphfSksYT1jLmV4dGVuZCh7fSx7dGV4dDpcIlwifSxhKTt2YXIgYj17c2VsZWN0ZWQ6ITEsZGlzYWJsZWQ6ITF9O3JldHVybiBudWxsIT1hLmlkJiYoYS5pZD1hLmlkLnRvU3RyaW5nKCkpLG51bGwhPWEudGV4dCYmKGEudGV4dD1hLnRleHQudG9TdHJpbmcoKSksbnVsbD09YS5fcmVzdWx0SWQmJmEuaWQmJm51bGwhPXRoaXMuY29udGFpbmVyJiYoYS5fcmVzdWx0SWQ9dGhpcy5nZW5lcmF0ZVJlc3VsdElkKHRoaXMuY29udGFpbmVyLGEpKSxjLmV4dGVuZCh7fSxiLGEpfSxkLnByb3RvdHlwZS5tYXRjaGVzPWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcy5vcHRpb25zLmdldChcIm1hdGNoZXJcIik7cmV0dXJuIGMoYSxiKX0sZH0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kYXRhL2FycmF5XCIsW1wiLi9zZWxlY3RcIixcIi4uL3V0aWxzXCIsXCJqcXVlcnlcIl0sZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQoYSxiKXt2YXIgYz1iLmdldChcImRhdGFcIil8fFtdO2QuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmNhbGwodGhpcyxhLGIpLHRoaXMuYWRkT3B0aW9ucyh0aGlzLmNvbnZlcnRUb09wdGlvbnMoYykpfXJldHVybiBiLkV4dGVuZChkLGEpLGQucHJvdG90eXBlLnNlbGVjdD1mdW5jdGlvbihhKXt2YXIgYj10aGlzLiRlbGVtZW50LmZpbmQoXCJvcHRpb25cIikuZmlsdGVyKGZ1bmN0aW9uKGIsYyl7cmV0dXJuIGMudmFsdWU9PWEuaWQudG9TdHJpbmcoKX0pOzA9PT1iLmxlbmd0aCYmKGI9dGhpcy5vcHRpb24oYSksdGhpcy5hZGRPcHRpb25zKGIpKSxkLl9fc3VwZXJfXy5zZWxlY3QuY2FsbCh0aGlzLGEpfSxkLnByb3RvdHlwZS5jb252ZXJ0VG9PcHRpb25zPWZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGQoYSl7cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIGModGhpcykudmFsKCk9PWEuaWR9fWZvcih2YXIgZT10aGlzLGY9dGhpcy4kZWxlbWVudC5maW5kKFwib3B0aW9uXCIpLGc9Zi5tYXAoZnVuY3Rpb24oKXtyZXR1cm4gZS5pdGVtKGModGhpcykpLmlkfSkuZ2V0KCksaD1bXSxpPTA7aTxhLmxlbmd0aDtpKyspe3ZhciBqPXRoaXMuX25vcm1hbGl6ZUl0ZW0oYVtpXSk7aWYoYy5pbkFycmF5KGouaWQsZyk+PTApe3ZhciBrPWYuZmlsdGVyKGQoaikpLGw9dGhpcy5pdGVtKGspLG09Yy5leHRlbmQoITAse30saixsKSxuPXRoaXMub3B0aW9uKG0pO2sucmVwbGFjZVdpdGgobil9ZWxzZXt2YXIgbz10aGlzLm9wdGlvbihqKTtpZihqLmNoaWxkcmVuKXt2YXIgcD10aGlzLmNvbnZlcnRUb09wdGlvbnMoai5jaGlsZHJlbik7Yi5hcHBlbmRNYW55KG8scCl9aC5wdXNoKG8pfX1yZXR1cm4gaH0sZH0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kYXRhL2FqYXhcIixbXCIuL2FycmF5XCIsXCIuLi91dGlsc1wiLFwianF1ZXJ5XCJdLGZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGEsYil7dGhpcy5hamF4T3B0aW9ucz10aGlzLl9hcHBseURlZmF1bHRzKGIuZ2V0KFwiYWpheFwiKSksbnVsbCE9dGhpcy5hamF4T3B0aW9ucy5wcm9jZXNzUmVzdWx0cyYmKHRoaXMucHJvY2Vzc1Jlc3VsdHM9dGhpcy5hamF4T3B0aW9ucy5wcm9jZXNzUmVzdWx0cyksZC5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzLGEsYil9cmV0dXJuIGIuRXh0ZW5kKGQsYSksZC5wcm90b3R5cGUuX2FwcGx5RGVmYXVsdHM9ZnVuY3Rpb24oYSl7dmFyIGI9e2RhdGE6ZnVuY3Rpb24oYSl7cmV0dXJuIGMuZXh0ZW5kKHt9LGEse3E6YS50ZXJtfSl9LHRyYW5zcG9ydDpmdW5jdGlvbihhLGIsZCl7dmFyIGU9Yy5hamF4KGEpO3JldHVybiBlLnRoZW4oYiksZS5mYWlsKGQpLGV9fTtyZXR1cm4gYy5leHRlbmQoe30sYixhLCEwKX0sZC5wcm90b3R5cGUucHJvY2Vzc1Jlc3VsdHM9ZnVuY3Rpb24oYSl7cmV0dXJuIGF9LGQucHJvdG90eXBlLnF1ZXJ5PWZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gZCgpe3ZhciBkPWYudHJhbnNwb3J0KGYsZnVuY3Rpb24oZCl7dmFyIGY9ZS5wcm9jZXNzUmVzdWx0cyhkLGEpO2Uub3B0aW9ucy5nZXQoXCJkZWJ1Z1wiKSYmd2luZG93LmNvbnNvbGUmJmNvbnNvbGUuZXJyb3ImJihmJiZmLnJlc3VsdHMmJmMuaXNBcnJheShmLnJlc3VsdHMpfHxjb25zb2xlLmVycm9yKFwiU2VsZWN0MjogVGhlIEFKQVggcmVzdWx0cyBkaWQgbm90IHJldHVybiBhbiBhcnJheSBpbiB0aGUgYHJlc3VsdHNgIGtleSBvZiB0aGUgcmVzcG9uc2UuXCIpKSxiKGYpfSxmdW5jdGlvbigpe2Quc3RhdHVzJiZcIjBcIj09PWQuc3RhdHVzfHxlLnRyaWdnZXIoXCJyZXN1bHRzOm1lc3NhZ2VcIix7bWVzc2FnZTpcImVycm9yTG9hZGluZ1wifSl9KTtlLl9yZXF1ZXN0PWR9dmFyIGU9dGhpcztudWxsIT10aGlzLl9yZXF1ZXN0JiYoYy5pc0Z1bmN0aW9uKHRoaXMuX3JlcXVlc3QuYWJvcnQpJiZ0aGlzLl9yZXF1ZXN0LmFib3J0KCksdGhpcy5fcmVxdWVzdD1udWxsKTt2YXIgZj1jLmV4dGVuZCh7dHlwZTpcIkdFVFwifSx0aGlzLmFqYXhPcHRpb25zKTtcImZ1bmN0aW9uXCI9PXR5cGVvZiBmLnVybCYmKGYudXJsPWYudXJsLmNhbGwodGhpcy4kZWxlbWVudCxhKSksXCJmdW5jdGlvblwiPT10eXBlb2YgZi5kYXRhJiYoZi5kYXRhPWYuZGF0YS5jYWxsKHRoaXMuJGVsZW1lbnQsYSkpLHRoaXMuYWpheE9wdGlvbnMuZGVsYXkmJm51bGwhPWEudGVybT8odGhpcy5fcXVlcnlUaW1lb3V0JiZ3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuX3F1ZXJ5VGltZW91dCksdGhpcy5fcXVlcnlUaW1lb3V0PXdpbmRvdy5zZXRUaW1lb3V0KGQsdGhpcy5hamF4T3B0aW9ucy5kZWxheSkpOmQoKX0sZH0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kYXRhL3RhZ3NcIixbXCJqcXVlcnlcIl0sZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYihiLGMsZCl7dmFyIGU9ZC5nZXQoXCJ0YWdzXCIpLGY9ZC5nZXQoXCJjcmVhdGVUYWdcIik7dm9pZCAwIT09ZiYmKHRoaXMuY3JlYXRlVGFnPWYpO3ZhciBnPWQuZ2V0KFwiaW5zZXJ0VGFnXCIpO2lmKHZvaWQgMCE9PWcmJih0aGlzLmluc2VydFRhZz1nKSxiLmNhbGwodGhpcyxjLGQpLGEuaXNBcnJheShlKSlmb3IodmFyIGg9MDtoPGUubGVuZ3RoO2grKyl7dmFyIGk9ZVtoXSxqPXRoaXMuX25vcm1hbGl6ZUl0ZW0oaSksaz10aGlzLm9wdGlvbihqKTt0aGlzLiRlbGVtZW50LmFwcGVuZChrKX19cmV0dXJuIGIucHJvdG90eXBlLnF1ZXJ5PWZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGEsZil7Zm9yKHZhciBnPWEucmVzdWx0cyxoPTA7aDxnLmxlbmd0aDtoKyspe3ZhciBpPWdbaF0saj1udWxsIT1pLmNoaWxkcmVuJiYhZCh7cmVzdWx0czppLmNoaWxkcmVufSwhMCksaz1pLnRleHQ9PT1iLnRlcm07aWYoa3x8ailyZXR1cm4gZj8hMTooYS5kYXRhPWcsdm9pZCBjKGEpKX1pZihmKXJldHVybiEwO3ZhciBsPWUuY3JlYXRlVGFnKGIpO2lmKG51bGwhPWwpe3ZhciBtPWUub3B0aW9uKGwpO20uYXR0cihcImRhdGEtc2VsZWN0Mi10YWdcIiwhMCksZS5hZGRPcHRpb25zKFttXSksZS5pbnNlcnRUYWcoZyxsKX1hLnJlc3VsdHM9ZyxjKGEpfXZhciBlPXRoaXM7cmV0dXJuIHRoaXMuX3JlbW92ZU9sZFRhZ3MoKSxudWxsPT1iLnRlcm18fG51bGwhPWIucGFnZT92b2lkIGEuY2FsbCh0aGlzLGIsYyk6dm9pZCBhLmNhbGwodGhpcyxiLGQpfSxiLnByb3RvdHlwZS5jcmVhdGVUYWc9ZnVuY3Rpb24oYixjKXt2YXIgZD1hLnRyaW0oYy50ZXJtKTtyZXR1cm5cIlwiPT09ZD9udWxsOntpZDpkLHRleHQ6ZH19LGIucHJvdG90eXBlLmluc2VydFRhZz1mdW5jdGlvbihhLGIsYyl7Yi51bnNoaWZ0KGMpfSxiLnByb3RvdHlwZS5fcmVtb3ZlT2xkVGFncz1mdW5jdGlvbihiKXt2YXIgYz0odGhpcy5fbGFzdFRhZyx0aGlzLiRlbGVtZW50LmZpbmQoXCJvcHRpb25bZGF0YS1zZWxlY3QyLXRhZ11cIikpO2MuZWFjaChmdW5jdGlvbigpe3RoaXMuc2VsZWN0ZWR8fGEodGhpcykucmVtb3ZlKCl9KX0sYn0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kYXRhL3Rva2VuaXplclwiLFtcImpxdWVyeVwiXSxmdW5jdGlvbihhKXtmdW5jdGlvbiBiKGEsYixjKXt2YXIgZD1jLmdldChcInRva2VuaXplclwiKTt2b2lkIDAhPT1kJiYodGhpcy50b2tlbml6ZXI9ZCksYS5jYWxsKHRoaXMsYixjKX1yZXR1cm4gYi5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihhLGIsYyl7YS5jYWxsKHRoaXMsYixjKSx0aGlzLiRzZWFyY2g9Yi5kcm9wZG93bi4kc2VhcmNofHxiLnNlbGVjdGlvbi4kc2VhcmNofHxjLmZpbmQoXCIuc2VsZWN0Mi1zZWFyY2hfX2ZpZWxkXCIpfSxiLnByb3RvdHlwZS5xdWVyeT1mdW5jdGlvbihiLGMsZCl7ZnVuY3Rpb24gZShiKXt2YXIgYz1nLl9ub3JtYWxpemVJdGVtKGIpLGQ9Zy4kZWxlbWVudC5maW5kKFwib3B0aW9uXCIpLmZpbHRlcihmdW5jdGlvbigpe3JldHVybiBhKHRoaXMpLnZhbCgpPT09Yy5pZH0pO2lmKCFkLmxlbmd0aCl7dmFyIGU9Zy5vcHRpb24oYyk7ZS5hdHRyKFwiZGF0YS1zZWxlY3QyLXRhZ1wiLCEwKSxnLl9yZW1vdmVPbGRUYWdzKCksZy5hZGRPcHRpb25zKFtlXSl9ZihjKX1mdW5jdGlvbiBmKGEpe2cudHJpZ2dlcihcInNlbGVjdFwiLHtkYXRhOmF9KX12YXIgZz10aGlzO2MudGVybT1jLnRlcm18fFwiXCI7dmFyIGg9dGhpcy50b2tlbml6ZXIoYyx0aGlzLm9wdGlvbnMsZSk7aC50ZXJtIT09Yy50ZXJtJiYodGhpcy4kc2VhcmNoLmxlbmd0aCYmKHRoaXMuJHNlYXJjaC52YWwoaC50ZXJtKSx0aGlzLiRzZWFyY2guZm9jdXMoKSksYy50ZXJtPWgudGVybSksYi5jYWxsKHRoaXMsYyxkKX0sYi5wcm90b3R5cGUudG9rZW5pemVyPWZ1bmN0aW9uKGIsYyxkLGUpe2Zvcih2YXIgZj1kLmdldChcInRva2VuU2VwYXJhdG9yc1wiKXx8W10sZz1jLnRlcm0saD0wLGk9dGhpcy5jcmVhdGVUYWd8fGZ1bmN0aW9uKGEpe3JldHVybntpZDphLnRlcm0sdGV4dDphLnRlcm19fTtoPGcubGVuZ3RoOyl7dmFyIGo9Z1toXTtpZigtMSE9PWEuaW5BcnJheShqLGYpKXt2YXIgaz1nLnN1YnN0cigwLGgpLGw9YS5leHRlbmQoe30sYyx7dGVybTprfSksbT1pKGwpO251bGwhPW0/KGUobSksZz1nLnN1YnN0cihoKzEpfHxcIlwiLGg9MCk6aCsrfWVsc2UgaCsrfXJldHVybnt0ZXJtOmd9fSxifSksYi5kZWZpbmUoXCJzZWxlY3QyL2RhdGEvbWluaW11bUlucHV0TGVuZ3RoXCIsW10sZnVuY3Rpb24oKXtmdW5jdGlvbiBhKGEsYixjKXt0aGlzLm1pbmltdW1JbnB1dExlbmd0aD1jLmdldChcIm1pbmltdW1JbnB1dExlbmd0aFwiKSxhLmNhbGwodGhpcyxiLGMpfXJldHVybiBhLnByb3RvdHlwZS5xdWVyeT1mdW5jdGlvbihhLGIsYyl7cmV0dXJuIGIudGVybT1iLnRlcm18fFwiXCIsYi50ZXJtLmxlbmd0aDx0aGlzLm1pbmltdW1JbnB1dExlbmd0aD92b2lkIHRoaXMudHJpZ2dlcihcInJlc3VsdHM6bWVzc2FnZVwiLHttZXNzYWdlOlwiaW5wdXRUb29TaG9ydFwiLGFyZ3M6e21pbmltdW06dGhpcy5taW5pbXVtSW5wdXRMZW5ndGgsaW5wdXQ6Yi50ZXJtLHBhcmFtczpifX0pOnZvaWQgYS5jYWxsKHRoaXMsYixjKX0sYX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kYXRhL21heGltdW1JbnB1dExlbmd0aFwiLFtdLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShhLGIsYyl7dGhpcy5tYXhpbXVtSW5wdXRMZW5ndGg9Yy5nZXQoXCJtYXhpbXVtSW5wdXRMZW5ndGhcIiksYS5jYWxsKHRoaXMsYixjKX1yZXR1cm4gYS5wcm90b3R5cGUucXVlcnk9ZnVuY3Rpb24oYSxiLGMpe3JldHVybiBiLnRlcm09Yi50ZXJtfHxcIlwiLHRoaXMubWF4aW11bUlucHV0TGVuZ3RoPjAmJmIudGVybS5sZW5ndGg+dGhpcy5tYXhpbXVtSW5wdXRMZW5ndGg/dm9pZCB0aGlzLnRyaWdnZXIoXCJyZXN1bHRzOm1lc3NhZ2VcIix7bWVzc2FnZTpcImlucHV0VG9vTG9uZ1wiLGFyZ3M6e21heGltdW06dGhpcy5tYXhpbXVtSW5wdXRMZW5ndGgsaW5wdXQ6Yi50ZXJtLHBhcmFtczpifX0pOnZvaWQgYS5jYWxsKHRoaXMsYixjKX0sYX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kYXRhL21heGltdW1TZWxlY3Rpb25MZW5ndGhcIixbXSxmdW5jdGlvbigpe2Z1bmN0aW9uIGEoYSxiLGMpe3RoaXMubWF4aW11bVNlbGVjdGlvbkxlbmd0aD1jLmdldChcIm1heGltdW1TZWxlY3Rpb25MZW5ndGhcIiksYS5jYWxsKHRoaXMsYixjKX1yZXR1cm4gYS5wcm90b3R5cGUucXVlcnk9ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPXRoaXM7dGhpcy5jdXJyZW50KGZ1bmN0aW9uKGUpe3ZhciBmPW51bGwhPWU/ZS5sZW5ndGg6MDtyZXR1cm4gZC5tYXhpbXVtU2VsZWN0aW9uTGVuZ3RoPjAmJmY+PWQubWF4aW11bVNlbGVjdGlvbkxlbmd0aD92b2lkIGQudHJpZ2dlcihcInJlc3VsdHM6bWVzc2FnZVwiLHttZXNzYWdlOlwibWF4aW11bVNlbGVjdGVkXCIsYXJnczp7bWF4aW11bTpkLm1heGltdW1TZWxlY3Rpb25MZW5ndGh9fSk6dm9pZCBhLmNhbGwoZCxiLGMpfSl9LGF9KSxiLmRlZmluZShcInNlbGVjdDIvZHJvcGRvd25cIixbXCJqcXVlcnlcIixcIi4vdXRpbHNcIl0sZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGEsYil7dGhpcy4kZWxlbWVudD1hLHRoaXMub3B0aW9ucz1iLGMuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmNhbGwodGhpcyl9cmV0dXJuIGIuRXh0ZW5kKGMsYi5PYnNlcnZhYmxlKSxjLnByb3RvdHlwZS5yZW5kZXI9ZnVuY3Rpb24oKXt2YXIgYj1hKCc8c3BhbiBjbGFzcz1cInNlbGVjdDItZHJvcGRvd25cIj48c3BhbiBjbGFzcz1cInNlbGVjdDItcmVzdWx0c1wiPjwvc3Bhbj48L3NwYW4+Jyk7cmV0dXJuIGIuYXR0cihcImRpclwiLHRoaXMub3B0aW9ucy5nZXQoXCJkaXJcIikpLHRoaXMuJGRyb3Bkb3duPWIsYn0sYy5wcm90b3R5cGUuYmluZD1mdW5jdGlvbigpe30sYy5wcm90b3R5cGUucG9zaXRpb249ZnVuY3Rpb24oYSxiKXt9LGMucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLiRkcm9wZG93bi5yZW1vdmUoKX0sY30pLGIuZGVmaW5lKFwic2VsZWN0Mi9kcm9wZG93bi9zZWFyY2hcIixbXCJqcXVlcnlcIixcIi4uL3V0aWxzXCJdLGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYygpe31yZXR1cm4gYy5wcm90b3R5cGUucmVuZGVyPWZ1bmN0aW9uKGIpe3ZhciBjPWIuY2FsbCh0aGlzKSxkPWEoJzxzcGFuIGNsYXNzPVwic2VsZWN0Mi1zZWFyY2ggc2VsZWN0Mi1zZWFyY2gtLWRyb3Bkb3duXCI+PGlucHV0IGNsYXNzPVwic2VsZWN0Mi1zZWFyY2hfX2ZpZWxkXCIgdHlwZT1cInNlYXJjaFwiIHRhYmluZGV4PVwiLTFcIiBhdXRvY29tcGxldGU9XCJvZmZcIiBhdXRvY29ycmVjdD1cIm9mZlwiIGF1dG9jYXBpdGFsaXplPVwib2ZmXCIgc3BlbGxjaGVjaz1cImZhbHNlXCIgcm9sZT1cInRleHRib3hcIiAvPjwvc3Bhbj4nKTtyZXR1cm4gdGhpcy4kc2VhcmNoQ29udGFpbmVyPWQsdGhpcy4kc2VhcmNoPWQuZmluZChcImlucHV0XCIpLGMucHJlcGVuZChkKSxjfSxjLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGIsYyxkKXt2YXIgZT10aGlzO2IuY2FsbCh0aGlzLGMsZCksdGhpcy4kc2VhcmNoLm9uKFwia2V5ZG93blwiLGZ1bmN0aW9uKGEpe2UudHJpZ2dlcihcImtleXByZXNzXCIsYSksZS5fa2V5VXBQcmV2ZW50ZWQ9YS5pc0RlZmF1bHRQcmV2ZW50ZWQoKX0pLHRoaXMuJHNlYXJjaC5vbihcImlucHV0XCIsZnVuY3Rpb24oYil7YSh0aGlzKS5vZmYoXCJrZXl1cFwiKX0pLHRoaXMuJHNlYXJjaC5vbihcImtleXVwIGlucHV0XCIsZnVuY3Rpb24oYSl7ZS5oYW5kbGVTZWFyY2goYSl9KSxjLm9uKFwib3BlblwiLGZ1bmN0aW9uKCl7ZS4kc2VhcmNoLmF0dHIoXCJ0YWJpbmRleFwiLDApLGUuJHNlYXJjaC5mb2N1cygpLHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZS4kc2VhcmNoLmZvY3VzKCl9LDApfSksYy5vbihcImNsb3NlXCIsZnVuY3Rpb24oKXtlLiRzZWFyY2guYXR0cihcInRhYmluZGV4XCIsLTEpLGUuJHNlYXJjaC52YWwoXCJcIil9KSxjLm9uKFwiZm9jdXNcIixmdW5jdGlvbigpe2MuaXNPcGVuKCkmJmUuJHNlYXJjaC5mb2N1cygpfSksYy5vbihcInJlc3VsdHM6YWxsXCIsZnVuY3Rpb24oYSl7aWYobnVsbD09YS5xdWVyeS50ZXJtfHxcIlwiPT09YS5xdWVyeS50ZXJtKXt2YXIgYj1lLnNob3dTZWFyY2goYSk7Yj9lLiRzZWFyY2hDb250YWluZXIucmVtb3ZlQ2xhc3MoXCJzZWxlY3QyLXNlYXJjaC0taGlkZVwiKTplLiRzZWFyY2hDb250YWluZXIuYWRkQ2xhc3MoXCJzZWxlY3QyLXNlYXJjaC0taGlkZVwiKX19KX0sYy5wcm90b3R5cGUuaGFuZGxlU2VhcmNoPWZ1bmN0aW9uKGEpe2lmKCF0aGlzLl9rZXlVcFByZXZlbnRlZCl7dmFyIGI9dGhpcy4kc2VhcmNoLnZhbCgpO3RoaXMudHJpZ2dlcihcInF1ZXJ5XCIse3Rlcm06Yn0pfXRoaXMuX2tleVVwUHJldmVudGVkPSExfSxjLnByb3RvdHlwZS5zaG93U2VhcmNoPWZ1bmN0aW9uKGEsYil7cmV0dXJuITB9LGN9KSxiLmRlZmluZShcInNlbGVjdDIvZHJvcGRvd24vaGlkZVBsYWNlaG9sZGVyXCIsW10sZnVuY3Rpb24oKXtmdW5jdGlvbiBhKGEsYixjLGQpe3RoaXMucGxhY2Vob2xkZXI9dGhpcy5ub3JtYWxpemVQbGFjZWhvbGRlcihjLmdldChcInBsYWNlaG9sZGVyXCIpKSxhLmNhbGwodGhpcyxiLGMsZCl9cmV0dXJuIGEucHJvdG90eXBlLmFwcGVuZD1mdW5jdGlvbihhLGIpe2IucmVzdWx0cz10aGlzLnJlbW92ZVBsYWNlaG9sZGVyKGIucmVzdWx0cyksYS5jYWxsKHRoaXMsYil9LGEucHJvdG90eXBlLm5vcm1hbGl6ZVBsYWNlaG9sZGVyPWZ1bmN0aW9uKGEsYil7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIGImJihiPXtpZDpcIlwiLHRleHQ6Yn0pLGJ9LGEucHJvdG90eXBlLnJlbW92ZVBsYWNlaG9sZGVyPWZ1bmN0aW9uKGEsYil7Zm9yKHZhciBjPWIuc2xpY2UoMCksZD1iLmxlbmd0aC0xO2Q+PTA7ZC0tKXt2YXIgZT1iW2RdO3RoaXMucGxhY2Vob2xkZXIuaWQ9PT1lLmlkJiZjLnNwbGljZShkLDEpfXJldHVybiBjfSxhfSksYi5kZWZpbmUoXCJzZWxlY3QyL2Ryb3Bkb3duL2luZmluaXRlU2Nyb2xsXCIsW1wianF1ZXJ5XCJdLGZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoYSxiLGMsZCl7dGhpcy5sYXN0UGFyYW1zPXt9LGEuY2FsbCh0aGlzLGIsYyxkKSx0aGlzLiRsb2FkaW5nTW9yZT10aGlzLmNyZWF0ZUxvYWRpbmdNb3JlKCksdGhpcy5sb2FkaW5nPSExfXJldHVybiBiLnByb3RvdHlwZS5hcHBlbmQ9ZnVuY3Rpb24oYSxiKXt0aGlzLiRsb2FkaW5nTW9yZS5yZW1vdmUoKSx0aGlzLmxvYWRpbmc9ITEsYS5jYWxsKHRoaXMsYiksdGhpcy5zaG93TG9hZGluZ01vcmUoYikmJnRoaXMuJHJlc3VsdHMuYXBwZW5kKHRoaXMuJGxvYWRpbmdNb3JlKX0sYi5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihiLGMsZCl7dmFyIGU9dGhpcztiLmNhbGwodGhpcyxjLGQpLGMub24oXCJxdWVyeVwiLGZ1bmN0aW9uKGEpe2UubGFzdFBhcmFtcz1hLGUubG9hZGluZz0hMH0pLGMub24oXCJxdWVyeTphcHBlbmRcIixmdW5jdGlvbihhKXtlLmxhc3RQYXJhbXM9YSxlLmxvYWRpbmc9ITB9KSx0aGlzLiRyZXN1bHRzLm9uKFwic2Nyb2xsXCIsZnVuY3Rpb24oKXt2YXIgYj1hLmNvbnRhaW5zKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxlLiRsb2FkaW5nTW9yZVswXSk7aWYoIWUubG9hZGluZyYmYil7dmFyIGM9ZS4kcmVzdWx0cy5vZmZzZXQoKS50b3ArZS4kcmVzdWx0cy5vdXRlckhlaWdodCghMSksZD1lLiRsb2FkaW5nTW9yZS5vZmZzZXQoKS50b3ArZS4kbG9hZGluZ01vcmUub3V0ZXJIZWlnaHQoITEpO2MrNTA+PWQmJmUubG9hZE1vcmUoKX19KX0sYi5wcm90b3R5cGUubG9hZE1vcmU9ZnVuY3Rpb24oKXt0aGlzLmxvYWRpbmc9ITA7dmFyIGI9YS5leHRlbmQoe30se3BhZ2U6MX0sdGhpcy5sYXN0UGFyYW1zKTtiLnBhZ2UrKyx0aGlzLnRyaWdnZXIoXCJxdWVyeTphcHBlbmRcIixiKX0sYi5wcm90b3R5cGUuc2hvd0xvYWRpbmdNb3JlPWZ1bmN0aW9uKGEsYil7cmV0dXJuIGIucGFnaW5hdGlvbiYmYi5wYWdpbmF0aW9uLm1vcmV9LGIucHJvdG90eXBlLmNyZWF0ZUxvYWRpbmdNb3JlPWZ1bmN0aW9uKCl7dmFyIGI9YSgnPGxpIGNsYXNzPVwic2VsZWN0Mi1yZXN1bHRzX19vcHRpb24gc2VsZWN0Mi1yZXN1bHRzX19vcHRpb24tLWxvYWQtbW9yZVwicm9sZT1cInRyZWVpdGVtXCIgYXJpYS1kaXNhYmxlZD1cInRydWVcIj48L2xpPicpLGM9dGhpcy5vcHRpb25zLmdldChcInRyYW5zbGF0aW9uc1wiKS5nZXQoXCJsb2FkaW5nTW9yZVwiKTtyZXR1cm4gYi5odG1sKGModGhpcy5sYXN0UGFyYW1zKSksYn0sYn0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kcm9wZG93bi9hdHRhY2hCb2R5XCIsW1wianF1ZXJ5XCIsXCIuLi91dGlsc1wiXSxmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYixjLGQpe3RoaXMuJGRyb3Bkb3duUGFyZW50PWQuZ2V0KFwiZHJvcGRvd25QYXJlbnRcIil8fGEoZG9jdW1lbnQuYm9keSksYi5jYWxsKHRoaXMsYyxkKX1yZXR1cm4gYy5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihhLGIsYyl7dmFyIGQ9dGhpcyxlPSExO2EuY2FsbCh0aGlzLGIsYyksYi5vbihcIm9wZW5cIixmdW5jdGlvbigpe2QuX3Nob3dEcm9wZG93bigpLGQuX2F0dGFjaFBvc2l0aW9uaW5nSGFuZGxlcihiKSxlfHwoZT0hMCxiLm9uKFwicmVzdWx0czphbGxcIixmdW5jdGlvbigpe2QuX3Bvc2l0aW9uRHJvcGRvd24oKSxkLl9yZXNpemVEcm9wZG93bigpfSksYi5vbihcInJlc3VsdHM6YXBwZW5kXCIsZnVuY3Rpb24oKXtkLl9wb3NpdGlvbkRyb3Bkb3duKCksZC5fcmVzaXplRHJvcGRvd24oKX0pKX0pLGIub24oXCJjbG9zZVwiLGZ1bmN0aW9uKCl7ZC5faGlkZURyb3Bkb3duKCksZC5fZGV0YWNoUG9zaXRpb25pbmdIYW5kbGVyKGIpfSksdGhpcy4kZHJvcGRvd25Db250YWluZXIub24oXCJtb3VzZWRvd25cIixmdW5jdGlvbihhKXthLnN0b3BQcm9wYWdhdGlvbigpfSl9LGMucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oYSl7YS5jYWxsKHRoaXMpLHRoaXMuJGRyb3Bkb3duQ29udGFpbmVyLnJlbW92ZSgpfSxjLnByb3RvdHlwZS5wb3NpdGlvbj1mdW5jdGlvbihhLGIsYyl7Yi5hdHRyKFwiY2xhc3NcIixjLmF0dHIoXCJjbGFzc1wiKSksYi5yZW1vdmVDbGFzcyhcInNlbGVjdDJcIiksYi5hZGRDbGFzcyhcInNlbGVjdDItY29udGFpbmVyLS1vcGVuXCIpLGIuY3NzKHtwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOi05OTk5OTl9KSx0aGlzLiRjb250YWluZXI9Y30sYy5wcm90b3R5cGUucmVuZGVyPWZ1bmN0aW9uKGIpe3ZhciBjPWEoXCI8c3Bhbj48L3NwYW4+XCIpLGQ9Yi5jYWxsKHRoaXMpO3JldHVybiBjLmFwcGVuZChkKSx0aGlzLiRkcm9wZG93bkNvbnRhaW5lcj1jLGN9LGMucHJvdG90eXBlLl9oaWRlRHJvcGRvd249ZnVuY3Rpb24oYSl7dGhpcy4kZHJvcGRvd25Db250YWluZXIuZGV0YWNoKCl9LGMucHJvdG90eXBlLl9hdHRhY2hQb3NpdGlvbmluZ0hhbmRsZXI9ZnVuY3Rpb24oYyxkKXt2YXIgZT10aGlzLGY9XCJzY3JvbGwuc2VsZWN0Mi5cIitkLmlkLGc9XCJyZXNpemUuc2VsZWN0Mi5cIitkLmlkLGg9XCJvcmllbnRhdGlvbmNoYW5nZS5zZWxlY3QyLlwiK2QuaWQsaT10aGlzLiRjb250YWluZXIucGFyZW50cygpLmZpbHRlcihiLmhhc1Njcm9sbCk7aS5lYWNoKGZ1bmN0aW9uKCl7YSh0aGlzKS5kYXRhKFwic2VsZWN0Mi1zY3JvbGwtcG9zaXRpb25cIix7eDphKHRoaXMpLnNjcm9sbExlZnQoKSx5OmEodGhpcykuc2Nyb2xsVG9wKCl9KX0pLGkub24oZixmdW5jdGlvbihiKXt2YXIgYz1hKHRoaXMpLmRhdGEoXCJzZWxlY3QyLXNjcm9sbC1wb3NpdGlvblwiKTthKHRoaXMpLnNjcm9sbFRvcChjLnkpfSksYSh3aW5kb3cpLm9uKGYrXCIgXCIrZytcIiBcIitoLGZ1bmN0aW9uKGEpe2UuX3Bvc2l0aW9uRHJvcGRvd24oKSxlLl9yZXNpemVEcm9wZG93bigpfSl9LGMucHJvdG90eXBlLl9kZXRhY2hQb3NpdGlvbmluZ0hhbmRsZXI9ZnVuY3Rpb24oYyxkKXt2YXIgZT1cInNjcm9sbC5zZWxlY3QyLlwiK2QuaWQsZj1cInJlc2l6ZS5zZWxlY3QyLlwiK2QuaWQsZz1cIm9yaWVudGF0aW9uY2hhbmdlLnNlbGVjdDIuXCIrZC5pZCxoPXRoaXMuJGNvbnRhaW5lci5wYXJlbnRzKCkuZmlsdGVyKGIuaGFzU2Nyb2xsKTtoLm9mZihlKSxhKHdpbmRvdykub2ZmKGUrXCIgXCIrZitcIiBcIitnKX0sYy5wcm90b3R5cGUuX3Bvc2l0aW9uRHJvcGRvd249ZnVuY3Rpb24oKXt2YXIgYj1hKHdpbmRvdyksYz10aGlzLiRkcm9wZG93bi5oYXNDbGFzcyhcInNlbGVjdDItZHJvcGRvd24tLWFib3ZlXCIpLGQ9dGhpcy4kZHJvcGRvd24uaGFzQ2xhc3MoXCJzZWxlY3QyLWRyb3Bkb3duLS1iZWxvd1wiKSxlPW51bGwsZj10aGlzLiRjb250YWluZXIub2Zmc2V0KCk7Zi5ib3R0b209Zi50b3ArdGhpcy4kY29udGFpbmVyLm91dGVySGVpZ2h0KCExKTt2YXIgZz17aGVpZ2h0OnRoaXMuJGNvbnRhaW5lci5vdXRlckhlaWdodCghMSl9O2cudG9wPWYudG9wLGcuYm90dG9tPWYudG9wK2cuaGVpZ2h0O3ZhciBoPXtoZWlnaHQ6dGhpcy4kZHJvcGRvd24ub3V0ZXJIZWlnaHQoITEpfSxpPXt0b3A6Yi5zY3JvbGxUb3AoKSxib3R0b206Yi5zY3JvbGxUb3AoKStiLmhlaWdodCgpfSxqPWkudG9wPGYudG9wLWguaGVpZ2h0LGs9aS5ib3R0b20+Zi5ib3R0b20raC5oZWlnaHQsbD17bGVmdDpmLmxlZnQsdG9wOmcuYm90dG9tfSxtPXRoaXMuJGRyb3Bkb3duUGFyZW50O1wic3RhdGljXCI9PT1tLmNzcyhcInBvc2l0aW9uXCIpJiYobT1tLm9mZnNldFBhcmVudCgpKTt2YXIgbj1tLm9mZnNldCgpO2wudG9wLT1uLnRvcCxsLmxlZnQtPW4ubGVmdCxjfHxkfHwoZT1cImJlbG93XCIpLGt8fCFqfHxjPyFqJiZrJiZjJiYoZT1cImJlbG93XCIpOmU9XCJhYm92ZVwiLChcImFib3ZlXCI9PWV8fGMmJlwiYmVsb3dcIiE9PWUpJiYobC50b3A9Zy50b3Atbi50b3AtaC5oZWlnaHQpLG51bGwhPWUmJih0aGlzLiRkcm9wZG93bi5yZW1vdmVDbGFzcyhcInNlbGVjdDItZHJvcGRvd24tLWJlbG93IHNlbGVjdDItZHJvcGRvd24tLWFib3ZlXCIpLmFkZENsYXNzKFwic2VsZWN0Mi1kcm9wZG93bi0tXCIrZSksdGhpcy4kY29udGFpbmVyLnJlbW92ZUNsYXNzKFwic2VsZWN0Mi1jb250YWluZXItLWJlbG93IHNlbGVjdDItY29udGFpbmVyLS1hYm92ZVwiKS5hZGRDbGFzcyhcInNlbGVjdDItY29udGFpbmVyLS1cIitlKSksdGhpcy4kZHJvcGRvd25Db250YWluZXIuY3NzKGwpfSxjLnByb3RvdHlwZS5fcmVzaXplRHJvcGRvd249ZnVuY3Rpb24oKXt2YXIgYT17d2lkdGg6dGhpcy4kY29udGFpbmVyLm91dGVyV2lkdGgoITEpK1wicHhcIn07dGhpcy5vcHRpb25zLmdldChcImRyb3Bkb3duQXV0b1dpZHRoXCIpJiYoYS5taW5XaWR0aD1hLndpZHRoLGEucG9zaXRpb249XCJyZWxhdGl2ZVwiLGEud2lkdGg9XCJhdXRvXCIpLHRoaXMuJGRyb3Bkb3duLmNzcyhhKX0sYy5wcm90b3R5cGUuX3Nob3dEcm9wZG93bj1mdW5jdGlvbihhKXt0aGlzLiRkcm9wZG93bkNvbnRhaW5lci5hcHBlbmRUbyh0aGlzLiRkcm9wZG93blBhcmVudCksdGhpcy5fcG9zaXRpb25Ecm9wZG93bigpLHRoaXMuX3Jlc2l6ZURyb3Bkb3duKCl9LGN9KSxiLmRlZmluZShcInNlbGVjdDIvZHJvcGRvd24vbWluaW11bVJlc3VsdHNGb3JTZWFyY2hcIixbXSxmdW5jdGlvbigpe2Z1bmN0aW9uIGEoYil7Zm9yKHZhciBjPTAsZD0wO2Q8Yi5sZW5ndGg7ZCsrKXt2YXIgZT1iW2RdO2UuY2hpbGRyZW4/Yys9YShlLmNoaWxkcmVuKTpjKyt9cmV0dXJuIGN9ZnVuY3Rpb24gYihhLGIsYyxkKXt0aGlzLm1pbmltdW1SZXN1bHRzRm9yU2VhcmNoPWMuZ2V0KFwibWluaW11bVJlc3VsdHNGb3JTZWFyY2hcIiksdGhpcy5taW5pbXVtUmVzdWx0c0ZvclNlYXJjaDwwJiYodGhpcy5taW5pbXVtUmVzdWx0c0ZvclNlYXJjaD0xLzApLGEuY2FsbCh0aGlzLGIsYyxkKX1yZXR1cm4gYi5wcm90b3R5cGUuc2hvd1NlYXJjaD1mdW5jdGlvbihiLGMpe3JldHVybiBhKGMuZGF0YS5yZXN1bHRzKTx0aGlzLm1pbmltdW1SZXN1bHRzRm9yU2VhcmNoPyExOmIuY2FsbCh0aGlzLGMpfSxifSksYi5kZWZpbmUoXCJzZWxlY3QyL2Ryb3Bkb3duL3NlbGVjdE9uQ2xvc2VcIixbXSxmdW5jdGlvbigpe2Z1bmN0aW9uIGEoKXt9cmV0dXJuIGEucHJvdG90eXBlLmJpbmQ9ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPXRoaXM7YS5jYWxsKHRoaXMsYixjKSxiLm9uKFwiY2xvc2VcIixmdW5jdGlvbihhKXtkLl9oYW5kbGVTZWxlY3RPbkNsb3NlKGEpfSl9LGEucHJvdG90eXBlLl9oYW5kbGVTZWxlY3RPbkNsb3NlPWZ1bmN0aW9uKGEsYil7aWYoYiYmbnVsbCE9Yi5vcmlnaW5hbFNlbGVjdDJFdmVudCl7dmFyIGM9Yi5vcmlnaW5hbFNlbGVjdDJFdmVudDtpZihcInNlbGVjdFwiPT09Yy5fdHlwZXx8XCJ1bnNlbGVjdFwiPT09Yy5fdHlwZSlyZXR1cm59dmFyIGQ9dGhpcy5nZXRIaWdobGlnaHRlZFJlc3VsdHMoKTtpZighKGQubGVuZ3RoPDEpKXt2YXIgZT1kLmRhdGEoXCJkYXRhXCIpO251bGwhPWUuZWxlbWVudCYmZS5lbGVtZW50LnNlbGVjdGVkfHxudWxsPT1lLmVsZW1lbnQmJmUuc2VsZWN0ZWR8fHRoaXMudHJpZ2dlcihcInNlbGVjdFwiLHtkYXRhOmV9KX19LGF9KSxiLmRlZmluZShcInNlbGVjdDIvZHJvcGRvd24vY2xvc2VPblNlbGVjdFwiLFtdLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gYSgpe31yZXR1cm4gYS5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihhLGIsYyl7dmFyIGQ9dGhpczthLmNhbGwodGhpcyxiLGMpLGIub24oXCJzZWxlY3RcIixmdW5jdGlvbihhKXtkLl9zZWxlY3RUcmlnZ2VyZWQoYSl9KSxiLm9uKFwidW5zZWxlY3RcIixmdW5jdGlvbihhKXtkLl9zZWxlY3RUcmlnZ2VyZWQoYSl9KX0sYS5wcm90b3R5cGUuX3NlbGVjdFRyaWdnZXJlZD1mdW5jdGlvbihhLGIpe3ZhciBjPWIub3JpZ2luYWxFdmVudDtjJiZjLmN0cmxLZXl8fHRoaXMudHJpZ2dlcihcImNsb3NlXCIse29yaWdpbmFsRXZlbnQ6YyxvcmlnaW5hbFNlbGVjdDJFdmVudDpifSl9LGF9KSxiLmRlZmluZShcInNlbGVjdDIvaTE4bi9lblwiLFtdLGZ1bmN0aW9uKCl7cmV0dXJue2Vycm9yTG9hZGluZzpmdW5jdGlvbigpe3JldHVyblwiVGhlIHJlc3VsdHMgY291bGQgbm90IGJlIGxvYWRlZC5cIn0saW5wdXRUb29Mb25nOmZ1bmN0aW9uKGEpe3ZhciBiPWEuaW5wdXQubGVuZ3RoLWEubWF4aW11bSxjPVwiUGxlYXNlIGRlbGV0ZSBcIitiK1wiIGNoYXJhY3RlclwiO3JldHVybiAxIT1iJiYoYys9XCJzXCIpLGN9LGlucHV0VG9vU2hvcnQ6ZnVuY3Rpb24oYSl7dmFyIGI9YS5taW5pbXVtLWEuaW5wdXQubGVuZ3RoLGM9XCJQbGVhc2UgZW50ZXIgXCIrYitcIiBvciBtb3JlIGNoYXJhY3RlcnNcIjtyZXR1cm4gY30sbG9hZGluZ01vcmU6ZnVuY3Rpb24oKXtyZXR1cm5cIkxvYWRpbmcgbW9yZSByZXN1bHRz4oCmXCJ9LG1heGltdW1TZWxlY3RlZDpmdW5jdGlvbihhKXt2YXIgYj1cIllvdSBjYW4gb25seSBzZWxlY3QgXCIrYS5tYXhpbXVtK1wiIGl0ZW1cIjtyZXR1cm4gMSE9YS5tYXhpbXVtJiYoYis9XCJzXCIpLGJ9LG5vUmVzdWx0czpmdW5jdGlvbigpe3JldHVyblwiTm8gcmVzdWx0cyBmb3VuZFwifSxzZWFyY2hpbmc6ZnVuY3Rpb24oKXtyZXR1cm5cIlNlYXJjaGluZ+KAplwifX19KSxiLmRlZmluZShcInNlbGVjdDIvZGVmYXVsdHNcIixbXCJqcXVlcnlcIixcInJlcXVpcmVcIixcIi4vcmVzdWx0c1wiLFwiLi9zZWxlY3Rpb24vc2luZ2xlXCIsXCIuL3NlbGVjdGlvbi9tdWx0aXBsZVwiLFwiLi9zZWxlY3Rpb24vcGxhY2Vob2xkZXJcIixcIi4vc2VsZWN0aW9uL2FsbG93Q2xlYXJcIixcIi4vc2VsZWN0aW9uL3NlYXJjaFwiLFwiLi9zZWxlY3Rpb24vZXZlbnRSZWxheVwiLFwiLi91dGlsc1wiLFwiLi90cmFuc2xhdGlvblwiLFwiLi9kaWFjcml0aWNzXCIsXCIuL2RhdGEvc2VsZWN0XCIsXCIuL2RhdGEvYXJyYXlcIixcIi4vZGF0YS9hamF4XCIsXCIuL2RhdGEvdGFnc1wiLFwiLi9kYXRhL3Rva2VuaXplclwiLFwiLi9kYXRhL21pbmltdW1JbnB1dExlbmd0aFwiLFwiLi9kYXRhL21heGltdW1JbnB1dExlbmd0aFwiLFwiLi9kYXRhL21heGltdW1TZWxlY3Rpb25MZW5ndGhcIixcIi4vZHJvcGRvd25cIixcIi4vZHJvcGRvd24vc2VhcmNoXCIsXCIuL2Ryb3Bkb3duL2hpZGVQbGFjZWhvbGRlclwiLFwiLi9kcm9wZG93bi9pbmZpbml0ZVNjcm9sbFwiLFwiLi9kcm9wZG93bi9hdHRhY2hCb2R5XCIsXCIuL2Ryb3Bkb3duL21pbmltdW1SZXN1bHRzRm9yU2VhcmNoXCIsXCIuL2Ryb3Bkb3duL3NlbGVjdE9uQ2xvc2VcIixcIi4vZHJvcGRvd24vY2xvc2VPblNlbGVjdFwiLFwiLi9pMThuL2VuXCJdLGZ1bmN0aW9uKGEsYixjLGQsZSxmLGcsaCxpLGosayxsLG0sbixvLHAscSxyLHMsdCx1LHYsdyx4LHkseixBLEIsQyl7ZnVuY3Rpb24gRCgpe3RoaXMucmVzZXQoKX1ELnByb3RvdHlwZS5hcHBseT1mdW5jdGlvbihsKXtpZihsPWEuZXh0ZW5kKCEwLHt9LHRoaXMuZGVmYXVsdHMsbCksbnVsbD09bC5kYXRhQWRhcHRlcil7aWYobnVsbCE9bC5hamF4P2wuZGF0YUFkYXB0ZXI9bzpudWxsIT1sLmRhdGE/bC5kYXRhQWRhcHRlcj1uOmwuZGF0YUFkYXB0ZXI9bSxsLm1pbmltdW1JbnB1dExlbmd0aD4wJiYobC5kYXRhQWRhcHRlcj1qLkRlY29yYXRlKGwuZGF0YUFkYXB0ZXIscikpLGwubWF4aW11bUlucHV0TGVuZ3RoPjAmJihsLmRhdGFBZGFwdGVyPWouRGVjb3JhdGUobC5kYXRhQWRhcHRlcixzKSksbC5tYXhpbXVtU2VsZWN0aW9uTGVuZ3RoPjAmJihsLmRhdGFBZGFwdGVyPWouRGVjb3JhdGUobC5kYXRhQWRhcHRlcix0KSksbC50YWdzJiYobC5kYXRhQWRhcHRlcj1qLkRlY29yYXRlKGwuZGF0YUFkYXB0ZXIscCkpLChudWxsIT1sLnRva2VuU2VwYXJhdG9yc3x8bnVsbCE9bC50b2tlbml6ZXIpJiYobC5kYXRhQWRhcHRlcj1qLkRlY29yYXRlKGwuZGF0YUFkYXB0ZXIscSkpLG51bGwhPWwucXVlcnkpe3ZhciBDPWIobC5hbWRCYXNlK1wiY29tcGF0L3F1ZXJ5XCIpO2wuZGF0YUFkYXB0ZXI9ai5EZWNvcmF0ZShsLmRhdGFBZGFwdGVyLEMpfWlmKG51bGwhPWwuaW5pdFNlbGVjdGlvbil7dmFyIEQ9YihsLmFtZEJhc2UrXCJjb21wYXQvaW5pdFNlbGVjdGlvblwiKTtsLmRhdGFBZGFwdGVyPWouRGVjb3JhdGUobC5kYXRhQWRhcHRlcixEKX19aWYobnVsbD09bC5yZXN1bHRzQWRhcHRlciYmKGwucmVzdWx0c0FkYXB0ZXI9YyxudWxsIT1sLmFqYXgmJihsLnJlc3VsdHNBZGFwdGVyPWouRGVjb3JhdGUobC5yZXN1bHRzQWRhcHRlcix4KSksbnVsbCE9bC5wbGFjZWhvbGRlciYmKGwucmVzdWx0c0FkYXB0ZXI9ai5EZWNvcmF0ZShsLnJlc3VsdHNBZGFwdGVyLHcpKSxsLnNlbGVjdE9uQ2xvc2UmJihsLnJlc3VsdHNBZGFwdGVyPWouRGVjb3JhdGUobC5yZXN1bHRzQWRhcHRlcixBKSkpLG51bGw9PWwuZHJvcGRvd25BZGFwdGVyKXtpZihsLm11bHRpcGxlKWwuZHJvcGRvd25BZGFwdGVyPXU7ZWxzZXt2YXIgRT1qLkRlY29yYXRlKHUsdik7bC5kcm9wZG93bkFkYXB0ZXI9RX1pZigwIT09bC5taW5pbXVtUmVzdWx0c0ZvclNlYXJjaCYmKGwuZHJvcGRvd25BZGFwdGVyPWouRGVjb3JhdGUobC5kcm9wZG93bkFkYXB0ZXIseikpLGwuY2xvc2VPblNlbGVjdCYmKGwuZHJvcGRvd25BZGFwdGVyPWouRGVjb3JhdGUobC5kcm9wZG93bkFkYXB0ZXIsQikpLG51bGwhPWwuZHJvcGRvd25Dc3NDbGFzc3x8bnVsbCE9bC5kcm9wZG93bkNzc3x8bnVsbCE9bC5hZGFwdERyb3Bkb3duQ3NzQ2xhc3Mpe3ZhciBGPWIobC5hbWRCYXNlK1wiY29tcGF0L2Ryb3Bkb3duQ3NzXCIpO2wuZHJvcGRvd25BZGFwdGVyPWouRGVjb3JhdGUobC5kcm9wZG93bkFkYXB0ZXIsRil9bC5kcm9wZG93bkFkYXB0ZXI9ai5EZWNvcmF0ZShsLmRyb3Bkb3duQWRhcHRlcix5KX1pZihudWxsPT1sLnNlbGVjdGlvbkFkYXB0ZXIpe2lmKGwubXVsdGlwbGU/bC5zZWxlY3Rpb25BZGFwdGVyPWU6bC5zZWxlY3Rpb25BZGFwdGVyPWQsbnVsbCE9bC5wbGFjZWhvbGRlciYmKGwuc2VsZWN0aW9uQWRhcHRlcj1qLkRlY29yYXRlKGwuc2VsZWN0aW9uQWRhcHRlcixmKSksbC5hbGxvd0NsZWFyJiYobC5zZWxlY3Rpb25BZGFwdGVyPWouRGVjb3JhdGUobC5zZWxlY3Rpb25BZGFwdGVyLGcpKSxsLm11bHRpcGxlJiYobC5zZWxlY3Rpb25BZGFwdGVyPWouRGVjb3JhdGUobC5zZWxlY3Rpb25BZGFwdGVyLGgpKSxudWxsIT1sLmNvbnRhaW5lckNzc0NsYXNzfHxudWxsIT1sLmNvbnRhaW5lckNzc3x8bnVsbCE9bC5hZGFwdENvbnRhaW5lckNzc0NsYXNzKXt2YXIgRz1iKGwuYW1kQmFzZStcImNvbXBhdC9jb250YWluZXJDc3NcIik7bC5zZWxlY3Rpb25BZGFwdGVyPWouRGVjb3JhdGUobC5zZWxlY3Rpb25BZGFwdGVyLEcpfWwuc2VsZWN0aW9uQWRhcHRlcj1qLkRlY29yYXRlKGwuc2VsZWN0aW9uQWRhcHRlcixpKX1pZihcInN0cmluZ1wiPT10eXBlb2YgbC5sYW5ndWFnZSlpZihsLmxhbmd1YWdlLmluZGV4T2YoXCItXCIpPjApe3ZhciBIPWwubGFuZ3VhZ2Uuc3BsaXQoXCItXCIpLEk9SFswXTtsLmxhbmd1YWdlPVtsLmxhbmd1YWdlLEldfWVsc2UgbC5sYW5ndWFnZT1bbC5sYW5ndWFnZV07aWYoYS5pc0FycmF5KGwubGFuZ3VhZ2UpKXt2YXIgSj1uZXcgaztsLmxhbmd1YWdlLnB1c2goXCJlblwiKTtmb3IodmFyIEs9bC5sYW5ndWFnZSxMPTA7TDxLLmxlbmd0aDtMKyspe3ZhciBNPUtbTF0sTj17fTt0cnl7Tj1rLmxvYWRQYXRoKE0pfWNhdGNoKE8pe3RyeXtNPXRoaXMuZGVmYXVsdHMuYW1kTGFuZ3VhZ2VCYXNlK00sTj1rLmxvYWRQYXRoKE0pfWNhdGNoKFApe2wuZGVidWcmJndpbmRvdy5jb25zb2xlJiZjb25zb2xlLndhcm4mJmNvbnNvbGUud2FybignU2VsZWN0MjogVGhlIGxhbmd1YWdlIGZpbGUgZm9yIFwiJytNKydcIiBjb3VsZCBub3QgYmUgYXV0b21hdGljYWxseSBsb2FkZWQuIEEgZmFsbGJhY2sgd2lsbCBiZSB1c2VkIGluc3RlYWQuJyk7Y29udGludWV9fUouZXh0ZW5kKE4pfWwudHJhbnNsYXRpb25zPUp9ZWxzZXt2YXIgUT1rLmxvYWRQYXRoKHRoaXMuZGVmYXVsdHMuYW1kTGFuZ3VhZ2VCYXNlK1wiZW5cIiksUj1uZXcgayhsLmxhbmd1YWdlKTtSLmV4dGVuZChRKSxsLnRyYW5zbGF0aW9ucz1SfXJldHVybiBsfSxELnByb3RvdHlwZS5yZXNldD1mdW5jdGlvbigpe2Z1bmN0aW9uIGIoYSl7ZnVuY3Rpb24gYihhKXtyZXR1cm4gbFthXXx8YX1yZXR1cm4gYS5yZXBsYWNlKC9bXlxcdTAwMDAtXFx1MDA3RV0vZyxiKX1mdW5jdGlvbiBjKGQsZSl7aWYoXCJcIj09PWEudHJpbShkLnRlcm0pKXJldHVybiBlO2lmKGUuY2hpbGRyZW4mJmUuY2hpbGRyZW4ubGVuZ3RoPjApe2Zvcih2YXIgZj1hLmV4dGVuZCghMCx7fSxlKSxnPWUuY2hpbGRyZW4ubGVuZ3RoLTE7Zz49MDtnLS0pe3ZhciBoPWUuY2hpbGRyZW5bZ10saT1jKGQsaCk7bnVsbD09aSYmZi5jaGlsZHJlbi5zcGxpY2UoZywxKX1yZXR1cm4gZi5jaGlsZHJlbi5sZW5ndGg+MD9mOmMoZCxmKX12YXIgaj1iKGUudGV4dCkudG9VcHBlckNhc2UoKSxrPWIoZC50ZXJtKS50b1VwcGVyQ2FzZSgpO3JldHVybiBqLmluZGV4T2Yoayk+LTE/ZTpudWxsfXRoaXMuZGVmYXVsdHM9e2FtZEJhc2U6XCIuL1wiLGFtZExhbmd1YWdlQmFzZTpcIi4vaTE4bi9cIixjbG9zZU9uU2VsZWN0OiEwLGRlYnVnOiExLGRyb3Bkb3duQXV0b1dpZHRoOiExLGVzY2FwZU1hcmt1cDpqLmVzY2FwZU1hcmt1cCxsYW5ndWFnZTpDLG1hdGNoZXI6YyxtaW5pbXVtSW5wdXRMZW5ndGg6MCxtYXhpbXVtSW5wdXRMZW5ndGg6MCxtYXhpbXVtU2VsZWN0aW9uTGVuZ3RoOjAsbWluaW11bVJlc3VsdHNGb3JTZWFyY2g6MCxzZWxlY3RPbkNsb3NlOiExLHNvcnRlcjpmdW5jdGlvbihhKXtyZXR1cm4gYX0sdGVtcGxhdGVSZXN1bHQ6ZnVuY3Rpb24oYSl7cmV0dXJuIGEudGV4dH0sdGVtcGxhdGVTZWxlY3Rpb246ZnVuY3Rpb24oYSl7cmV0dXJuIGEudGV4dH0sdGhlbWU6XCJkZWZhdWx0XCIsd2lkdGg6XCJyZXNvbHZlXCJ9fSxELnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24oYixjKXt2YXIgZD1hLmNhbWVsQ2FzZShiKSxlPXt9O2VbZF09Yzt2YXIgZj1qLl9jb252ZXJ0RGF0YShlKTthLmV4dGVuZCh0aGlzLmRlZmF1bHRzLGYpfTt2YXIgRT1uZXcgRDtyZXR1cm4gRX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9vcHRpb25zXCIsW1wicmVxdWlyZVwiLFwianF1ZXJ5XCIsXCIuL2RlZmF1bHRzXCIsXCIuL3V0aWxzXCJdLGZ1bmN0aW9uKGEsYixjLGQpe2Z1bmN0aW9uIGUoYixlKXtpZih0aGlzLm9wdGlvbnM9YixudWxsIT1lJiZ0aGlzLmZyb21FbGVtZW50KGUpLHRoaXMub3B0aW9ucz1jLmFwcGx5KHRoaXMub3B0aW9ucyksZSYmZS5pcyhcImlucHV0XCIpKXt2YXIgZj1hKHRoaXMuZ2V0KFwiYW1kQmFzZVwiKStcImNvbXBhdC9pbnB1dERhdGFcIik7dGhpcy5vcHRpb25zLmRhdGFBZGFwdGVyPWQuRGVjb3JhdGUodGhpcy5vcHRpb25zLmRhdGFBZGFwdGVyLGYpfX1yZXR1cm4gZS5wcm90b3R5cGUuZnJvbUVsZW1lbnQ9ZnVuY3Rpb24oYSl7dmFyIGM9W1wic2VsZWN0MlwiXTtudWxsPT10aGlzLm9wdGlvbnMubXVsdGlwbGUmJih0aGlzLm9wdGlvbnMubXVsdGlwbGU9YS5wcm9wKFwibXVsdGlwbGVcIikpLG51bGw9PXRoaXMub3B0aW9ucy5kaXNhYmxlZCYmKHRoaXMub3B0aW9ucy5kaXNhYmxlZD1hLnByb3AoXCJkaXNhYmxlZFwiKSksbnVsbD09dGhpcy5vcHRpb25zLmxhbmd1YWdlJiYoYS5wcm9wKFwibGFuZ1wiKT90aGlzLm9wdGlvbnMubGFuZ3VhZ2U9YS5wcm9wKFwibGFuZ1wiKS50b0xvd2VyQ2FzZSgpOmEuY2xvc2VzdChcIltsYW5nXVwiKS5wcm9wKFwibGFuZ1wiKSYmKHRoaXMub3B0aW9ucy5sYW5ndWFnZT1hLmNsb3Nlc3QoXCJbbGFuZ11cIikucHJvcChcImxhbmdcIikpKSxudWxsPT10aGlzLm9wdGlvbnMuZGlyJiYoYS5wcm9wKFwiZGlyXCIpP3RoaXMub3B0aW9ucy5kaXI9YS5wcm9wKFwiZGlyXCIpOmEuY2xvc2VzdChcIltkaXJdXCIpLnByb3AoXCJkaXJcIik/dGhpcy5vcHRpb25zLmRpcj1hLmNsb3Nlc3QoXCJbZGlyXVwiKS5wcm9wKFwiZGlyXCIpOnRoaXMub3B0aW9ucy5kaXI9XCJsdHJcIiksYS5wcm9wKFwiZGlzYWJsZWRcIix0aGlzLm9wdGlvbnMuZGlzYWJsZWQpLGEucHJvcChcIm11bHRpcGxlXCIsdGhpcy5vcHRpb25zLm11bHRpcGxlKSxhLmRhdGEoXCJzZWxlY3QyVGFnc1wiKSYmKHRoaXMub3B0aW9ucy5kZWJ1ZyYmd2luZG93LmNvbnNvbGUmJmNvbnNvbGUud2FybiYmY29uc29sZS53YXJuKCdTZWxlY3QyOiBUaGUgYGRhdGEtc2VsZWN0Mi10YWdzYCBhdHRyaWJ1dGUgaGFzIGJlZW4gY2hhbmdlZCB0byB1c2UgdGhlIGBkYXRhLWRhdGFgIGFuZCBgZGF0YS10YWdzPVwidHJ1ZVwiYCBhdHRyaWJ1dGVzIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gZnV0dXJlIHZlcnNpb25zIG9mIFNlbGVjdDIuJyksYS5kYXRhKFwiZGF0YVwiLGEuZGF0YShcInNlbGVjdDJUYWdzXCIpKSxhLmRhdGEoXCJ0YWdzXCIsITApKSxhLmRhdGEoXCJhamF4VXJsXCIpJiYodGhpcy5vcHRpb25zLmRlYnVnJiZ3aW5kb3cuY29uc29sZSYmY29uc29sZS53YXJuJiZjb25zb2xlLndhcm4oXCJTZWxlY3QyOiBUaGUgYGRhdGEtYWpheC11cmxgIGF0dHJpYnV0ZSBoYXMgYmVlbiBjaGFuZ2VkIHRvIGBkYXRhLWFqYXgtLXVybGAgYW5kIHN1cHBvcnQgZm9yIHRoZSBvbGQgYXR0cmlidXRlIHdpbGwgYmUgcmVtb3ZlZCBpbiBmdXR1cmUgdmVyc2lvbnMgb2YgU2VsZWN0Mi5cIiksYS5hdHRyKFwiYWpheC0tdXJsXCIsYS5kYXRhKFwiYWpheFVybFwiKSksYS5kYXRhKFwiYWpheC0tdXJsXCIsYS5kYXRhKFwiYWpheFVybFwiKSkpO3ZhciBlPXt9O2U9Yi5mbi5qcXVlcnkmJlwiMS5cIj09Yi5mbi5qcXVlcnkuc3Vic3RyKDAsMikmJmFbMF0uZGF0YXNldD9iLmV4dGVuZCghMCx7fSxhWzBdLmRhdGFzZXQsYS5kYXRhKCkpOmEuZGF0YSgpO3ZhciBmPWIuZXh0ZW5kKCEwLHt9LGUpO2Y9ZC5fY29udmVydERhdGEoZik7Zm9yKHZhciBnIGluIGYpYi5pbkFycmF5KGcsYyk+LTF8fChiLmlzUGxhaW5PYmplY3QodGhpcy5vcHRpb25zW2ddKT9iLmV4dGVuZCh0aGlzLm9wdGlvbnNbZ10sZltnXSk6dGhpcy5vcHRpb25zW2ddPWZbZ10pO3JldHVybiB0aGlzfSxlLnByb3RvdHlwZS5nZXQ9ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMub3B0aW9uc1thXX0sZS5wcm90b3R5cGUuc2V0PWZ1bmN0aW9uKGEsYil7dGhpcy5vcHRpb25zW2FdPWJ9LGV9KSxiLmRlZmluZShcInNlbGVjdDIvY29yZVwiLFtcImpxdWVyeVwiLFwiLi9vcHRpb25zXCIsXCIuL3V0aWxzXCIsXCIuL2tleXNcIl0sZnVuY3Rpb24oYSxiLGMsZCl7dmFyIGU9ZnVuY3Rpb24oYSxjKXtudWxsIT1hLmRhdGEoXCJzZWxlY3QyXCIpJiZhLmRhdGEoXCJzZWxlY3QyXCIpLmRlc3Ryb3koKSx0aGlzLiRlbGVtZW50PWEsdGhpcy5pZD10aGlzLl9nZW5lcmF0ZUlkKGEpLGM9Y3x8e30sdGhpcy5vcHRpb25zPW5ldyBiKGMsYSksZS5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzKTt2YXIgZD1hLmF0dHIoXCJ0YWJpbmRleFwiKXx8MDthLmRhdGEoXCJvbGQtdGFiaW5kZXhcIixkKSxhLmF0dHIoXCJ0YWJpbmRleFwiLFwiLTFcIik7dmFyIGY9dGhpcy5vcHRpb25zLmdldChcImRhdGFBZGFwdGVyXCIpO3RoaXMuZGF0YUFkYXB0ZXI9bmV3IGYoYSx0aGlzLm9wdGlvbnMpO3ZhciBnPXRoaXMucmVuZGVyKCk7dGhpcy5fcGxhY2VDb250YWluZXIoZyk7dmFyIGg9dGhpcy5vcHRpb25zLmdldChcInNlbGVjdGlvbkFkYXB0ZXJcIik7dGhpcy5zZWxlY3Rpb249bmV3IGgoYSx0aGlzLm9wdGlvbnMpLHRoaXMuJHNlbGVjdGlvbj10aGlzLnNlbGVjdGlvbi5yZW5kZXIoKSx0aGlzLnNlbGVjdGlvbi5wb3NpdGlvbih0aGlzLiRzZWxlY3Rpb24sZyk7dmFyIGk9dGhpcy5vcHRpb25zLmdldChcImRyb3Bkb3duQWRhcHRlclwiKTt0aGlzLmRyb3Bkb3duPW5ldyBpKGEsdGhpcy5vcHRpb25zKSx0aGlzLiRkcm9wZG93bj10aGlzLmRyb3Bkb3duLnJlbmRlcigpLHRoaXMuZHJvcGRvd24ucG9zaXRpb24odGhpcy4kZHJvcGRvd24sZyk7dmFyIGo9dGhpcy5vcHRpb25zLmdldChcInJlc3VsdHNBZGFwdGVyXCIpO3RoaXMucmVzdWx0cz1uZXcgaihhLHRoaXMub3B0aW9ucyx0aGlzLmRhdGFBZGFwdGVyKSx0aGlzLiRyZXN1bHRzPXRoaXMucmVzdWx0cy5yZW5kZXIoKSx0aGlzLnJlc3VsdHMucG9zaXRpb24odGhpcy4kcmVzdWx0cyx0aGlzLiRkcm9wZG93bik7dmFyIGs9dGhpczt0aGlzLl9iaW5kQWRhcHRlcnMoKSx0aGlzLl9yZWdpc3RlckRvbUV2ZW50cygpLHRoaXMuX3JlZ2lzdGVyRGF0YUV2ZW50cygpLHRoaXMuX3JlZ2lzdGVyU2VsZWN0aW9uRXZlbnRzKCksdGhpcy5fcmVnaXN0ZXJEcm9wZG93bkV2ZW50cygpLHRoaXMuX3JlZ2lzdGVyUmVzdWx0c0V2ZW50cygpLHRoaXMuX3JlZ2lzdGVyRXZlbnRzKCksdGhpcy5kYXRhQWRhcHRlci5jdXJyZW50KGZ1bmN0aW9uKGEpe2sudHJpZ2dlcihcInNlbGVjdGlvbjp1cGRhdGVcIix7ZGF0YTphfSl9KSxhLmFkZENsYXNzKFwic2VsZWN0Mi1oaWRkZW4tYWNjZXNzaWJsZVwiKSxhLmF0dHIoXCJhcmlhLWhpZGRlblwiLFwidHJ1ZVwiKSx0aGlzLl9zeW5jQXR0cmlidXRlcygpLGEuZGF0YShcInNlbGVjdDJcIix0aGlzKX07cmV0dXJuIGMuRXh0ZW5kKGUsYy5PYnNlcnZhYmxlKSxlLnByb3RvdHlwZS5fZ2VuZXJhdGVJZD1mdW5jdGlvbihhKXt2YXIgYj1cIlwiO3JldHVybiBiPW51bGwhPWEuYXR0cihcImlkXCIpP2EuYXR0cihcImlkXCIpOm51bGwhPWEuYXR0cihcIm5hbWVcIik/YS5hdHRyKFwibmFtZVwiKStcIi1cIitjLmdlbmVyYXRlQ2hhcnMoMik6Yy5nZW5lcmF0ZUNoYXJzKDQpLGI9Yi5yZXBsYWNlKC8oOnxcXC58XFxbfFxcXXwsKS9nLFwiXCIpLGI9XCJzZWxlY3QyLVwiK2J9LGUucHJvdG90eXBlLl9wbGFjZUNvbnRhaW5lcj1mdW5jdGlvbihhKXthLmluc2VydEFmdGVyKHRoaXMuJGVsZW1lbnQpO3ZhciBiPXRoaXMuX3Jlc29sdmVXaWR0aCh0aGlzLiRlbGVtZW50LHRoaXMub3B0aW9ucy5nZXQoXCJ3aWR0aFwiKSk7bnVsbCE9YiYmYS5jc3MoXCJ3aWR0aFwiLGIpfSxlLnByb3RvdHlwZS5fcmVzb2x2ZVdpZHRoPWZ1bmN0aW9uKGEsYil7dmFyIGM9L153aWR0aDooKFstK10/KFswLTldKlxcLik/WzAtOV0rKShweHxlbXxleHwlfGlufGNtfG1tfHB0fHBjKSkvaTtpZihcInJlc29sdmVcIj09Yil7dmFyIGQ9dGhpcy5fcmVzb2x2ZVdpZHRoKGEsXCJzdHlsZVwiKTtyZXR1cm4gbnVsbCE9ZD9kOnRoaXMuX3Jlc29sdmVXaWR0aChhLFwiZWxlbWVudFwiKX1pZihcImVsZW1lbnRcIj09Yil7dmFyIGU9YS5vdXRlcldpZHRoKCExKTtyZXR1cm4gMD49ZT9cImF1dG9cIjplK1wicHhcIn1pZihcInN0eWxlXCI9PWIpe3ZhciBmPWEuYXR0cihcInN0eWxlXCIpO2lmKFwic3RyaW5nXCIhPXR5cGVvZiBmKXJldHVybiBudWxsO2Zvcih2YXIgZz1mLnNwbGl0KFwiO1wiKSxoPTAsaT1nLmxlbmd0aDtpPmg7aCs9MSl7dmFyIGo9Z1toXS5yZXBsYWNlKC9cXHMvZyxcIlwiKSxrPWoubWF0Y2goYyk7aWYobnVsbCE9PWsmJmsubGVuZ3RoPj0xKXJldHVybiBrWzFdfXJldHVybiBudWxsfXJldHVybiBifSxlLnByb3RvdHlwZS5fYmluZEFkYXB0ZXJzPWZ1bmN0aW9uKCl7dGhpcy5kYXRhQWRhcHRlci5iaW5kKHRoaXMsdGhpcy4kY29udGFpbmVyKSx0aGlzLnNlbGVjdGlvbi5iaW5kKHRoaXMsdGhpcy4kY29udGFpbmVyKSx0aGlzLmRyb3Bkb3duLmJpbmQodGhpcyx0aGlzLiRjb250YWluZXIpLHRoaXMucmVzdWx0cy5iaW5kKHRoaXMsdGhpcy4kY29udGFpbmVyKX0sZS5wcm90b3R5cGUuX3JlZ2lzdGVyRG9tRXZlbnRzPWZ1bmN0aW9uKCl7dmFyIGI9dGhpczt0aGlzLiRlbGVtZW50Lm9uKFwiY2hhbmdlLnNlbGVjdDJcIixmdW5jdGlvbigpe2IuZGF0YUFkYXB0ZXIuY3VycmVudChmdW5jdGlvbihhKXtiLnRyaWdnZXIoXCJzZWxlY3Rpb246dXBkYXRlXCIse2RhdGE6YX0pfSl9KSx0aGlzLiRlbGVtZW50Lm9uKFwiZm9jdXMuc2VsZWN0MlwiLGZ1bmN0aW9uKGEpe2IudHJpZ2dlcihcImZvY3VzXCIsYSl9KSx0aGlzLl9zeW5jQT1jLmJpbmQodGhpcy5fc3luY0F0dHJpYnV0ZXMsdGhpcyksdGhpcy5fc3luY1M9Yy5iaW5kKHRoaXMuX3N5bmNTdWJ0cmVlLHRoaXMpLHRoaXMuJGVsZW1lbnRbMF0uYXR0YWNoRXZlbnQmJnRoaXMuJGVsZW1lbnRbMF0uYXR0YWNoRXZlbnQoXCJvbnByb3BlcnR5Y2hhbmdlXCIsdGhpcy5fc3luY0EpO3ZhciBkPXdpbmRvdy5NdXRhdGlvbk9ic2VydmVyfHx3aW5kb3cuV2ViS2l0TXV0YXRpb25PYnNlcnZlcnx8d2luZG93Lk1vek11dGF0aW9uT2JzZXJ2ZXI7bnVsbCE9ZD8odGhpcy5fb2JzZXJ2ZXI9bmV3IGQoZnVuY3Rpb24oYyl7YS5lYWNoKGMsYi5fc3luY0EpLGEuZWFjaChjLGIuX3N5bmNTKX0pLHRoaXMuX29ic2VydmVyLm9ic2VydmUodGhpcy4kZWxlbWVudFswXSx7YXR0cmlidXRlczohMCxjaGlsZExpc3Q6ITAsc3VidHJlZTohMX0pKTp0aGlzLiRlbGVtZW50WzBdLmFkZEV2ZW50TGlzdGVuZXImJih0aGlzLiRlbGVtZW50WzBdLmFkZEV2ZW50TGlzdGVuZXIoXCJET01BdHRyTW9kaWZpZWRcIixiLl9zeW5jQSwhMSksdGhpcy4kZWxlbWVudFswXS5hZGRFdmVudExpc3RlbmVyKFwiRE9NTm9kZUluc2VydGVkXCIsYi5fc3luY1MsITEpLHRoaXMuJGVsZW1lbnRbMF0uYWRkRXZlbnRMaXN0ZW5lcihcIkRPTU5vZGVSZW1vdmVkXCIsYi5fc3luY1MsITEpKX0sZS5wcm90b3R5cGUuX3JlZ2lzdGVyRGF0YUV2ZW50cz1mdW5jdGlvbigpe3ZhciBhPXRoaXM7dGhpcy5kYXRhQWRhcHRlci5vbihcIipcIixmdW5jdGlvbihiLGMpe2EudHJpZ2dlcihiLGMpfSl9LGUucHJvdG90eXBlLl9yZWdpc3RlclNlbGVjdGlvbkV2ZW50cz1mdW5jdGlvbigpe3ZhciBiPXRoaXMsYz1bXCJ0b2dnbGVcIixcImZvY3VzXCJdO3RoaXMuc2VsZWN0aW9uLm9uKFwidG9nZ2xlXCIsZnVuY3Rpb24oKXtiLnRvZ2dsZURyb3Bkb3duKCl9KSx0aGlzLnNlbGVjdGlvbi5vbihcImZvY3VzXCIsZnVuY3Rpb24oYSl7Yi5mb2N1cyhhKX0pLHRoaXMuc2VsZWN0aW9uLm9uKFwiKlwiLGZ1bmN0aW9uKGQsZSl7LTE9PT1hLmluQXJyYXkoZCxjKSYmYi50cmlnZ2VyKGQsZSl9KX0sZS5wcm90b3R5cGUuX3JlZ2lzdGVyRHJvcGRvd25FdmVudHM9ZnVuY3Rpb24oKXt2YXIgYT10aGlzO3RoaXMuZHJvcGRvd24ub24oXCIqXCIsZnVuY3Rpb24oYixjKXthLnRyaWdnZXIoYixjKX0pfSxlLnByb3RvdHlwZS5fcmVnaXN0ZXJSZXN1bHRzRXZlbnRzPWZ1bmN0aW9uKCl7dmFyIGE9dGhpczt0aGlzLnJlc3VsdHMub24oXCIqXCIsZnVuY3Rpb24oYixjKXthLnRyaWdnZXIoYixjKX0pfSxlLnByb3RvdHlwZS5fcmVnaXN0ZXJFdmVudHM9ZnVuY3Rpb24oKXt2YXIgYT10aGlzO3RoaXMub24oXCJvcGVuXCIsZnVuY3Rpb24oKXthLiRjb250YWluZXIuYWRkQ2xhc3MoXCJzZWxlY3QyLWNvbnRhaW5lci0tb3BlblwiKX0pLHRoaXMub24oXCJjbG9zZVwiLGZ1bmN0aW9uKCl7YS4kY29udGFpbmVyLnJlbW92ZUNsYXNzKFwic2VsZWN0Mi1jb250YWluZXItLW9wZW5cIil9KSx0aGlzLm9uKFwiZW5hYmxlXCIsZnVuY3Rpb24oKXthLiRjb250YWluZXIucmVtb3ZlQ2xhc3MoXCJzZWxlY3QyLWNvbnRhaW5lci0tZGlzYWJsZWRcIil9KSx0aGlzLm9uKFwiZGlzYWJsZVwiLGZ1bmN0aW9uKCl7YS4kY29udGFpbmVyLmFkZENsYXNzKFwic2VsZWN0Mi1jb250YWluZXItLWRpc2FibGVkXCIpfSksdGhpcy5vbihcImJsdXJcIixmdW5jdGlvbigpe2EuJGNvbnRhaW5lci5yZW1vdmVDbGFzcyhcInNlbGVjdDItY29udGFpbmVyLS1mb2N1c1wiKX0pLHRoaXMub24oXCJxdWVyeVwiLGZ1bmN0aW9uKGIpe2EuaXNPcGVuKCl8fGEudHJpZ2dlcihcIm9wZW5cIix7fSksdGhpcy5kYXRhQWRhcHRlci5xdWVyeShiLGZ1bmN0aW9uKGMpe2EudHJpZ2dlcihcInJlc3VsdHM6YWxsXCIse2RhdGE6YyxxdWVyeTpifSl9KX0pLHRoaXMub24oXCJxdWVyeTphcHBlbmRcIixmdW5jdGlvbihiKXt0aGlzLmRhdGFBZGFwdGVyLnF1ZXJ5KGIsZnVuY3Rpb24oYyl7YS50cmlnZ2VyKFwicmVzdWx0czphcHBlbmRcIix7ZGF0YTpjLHF1ZXJ5OmJ9KX0pfSksdGhpcy5vbihcImtleXByZXNzXCIsZnVuY3Rpb24oYil7dmFyIGM9Yi53aGljaDthLmlzT3BlbigpP2M9PT1kLkVTQ3x8Yz09PWQuVEFCfHxjPT09ZC5VUCYmYi5hbHRLZXk/KGEuY2xvc2UoKSxiLnByZXZlbnREZWZhdWx0KCkpOmM9PT1kLkVOVEVSPyhhLnRyaWdnZXIoXCJyZXN1bHRzOnNlbGVjdFwiLHt9KSxiLnByZXZlbnREZWZhdWx0KCkpOmM9PT1kLlNQQUNFJiZiLmN0cmxLZXk/KGEudHJpZ2dlcihcInJlc3VsdHM6dG9nZ2xlXCIse30pLGIucHJldmVudERlZmF1bHQoKSk6Yz09PWQuVVA/KGEudHJpZ2dlcihcInJlc3VsdHM6cHJldmlvdXNcIix7fSksYi5wcmV2ZW50RGVmYXVsdCgpKTpjPT09ZC5ET1dOJiYoYS50cmlnZ2VyKFwicmVzdWx0czpuZXh0XCIse30pLGIucHJldmVudERlZmF1bHQoKSk6KGM9PT1kLkVOVEVSfHxjPT09ZC5TUEFDRXx8Yz09PWQuRE9XTiYmYi5hbHRLZXkpJiYoYS5vcGVuKCksYi5wcmV2ZW50RGVmYXVsdCgpKX0pfSxlLnByb3RvdHlwZS5fc3luY0F0dHJpYnV0ZXM9ZnVuY3Rpb24oKXt0aGlzLm9wdGlvbnMuc2V0KFwiZGlzYWJsZWRcIix0aGlzLiRlbGVtZW50LnByb3AoXCJkaXNhYmxlZFwiKSksdGhpcy5vcHRpb25zLmdldChcImRpc2FibGVkXCIpPyh0aGlzLmlzT3BlbigpJiZ0aGlzLmNsb3NlKCksdGhpcy50cmlnZ2VyKFwiZGlzYWJsZVwiLHt9KSk6dGhpcy50cmlnZ2VyKFwiZW5hYmxlXCIse30pfSxlLnByb3RvdHlwZS5fc3luY1N1YnRyZWU9ZnVuY3Rpb24oYSxiKXt2YXIgYz0hMSxkPXRoaXM7aWYoIWF8fCFhLnRhcmdldHx8XCJPUFRJT05cIj09PWEudGFyZ2V0Lm5vZGVOYW1lfHxcIk9QVEdST1VQXCI9PT1hLnRhcmdldC5ub2RlTmFtZSl7aWYoYilpZihiLmFkZGVkTm9kZXMmJmIuYWRkZWROb2Rlcy5sZW5ndGg+MClmb3IodmFyIGU9MDtlPGIuYWRkZWROb2Rlcy5sZW5ndGg7ZSsrKXt2YXIgZj1iLmFkZGVkTm9kZXNbZV07Zi5zZWxlY3RlZCYmKGM9ITApfWVsc2UgYi5yZW1vdmVkTm9kZXMmJmIucmVtb3ZlZE5vZGVzLmxlbmd0aD4wJiYoYz0hMCk7ZWxzZSBjPSEwO2MmJnRoaXMuZGF0YUFkYXB0ZXIuY3VycmVudChmdW5jdGlvbihhKXtkLnRyaWdnZXIoXCJzZWxlY3Rpb246dXBkYXRlXCIse2RhdGE6YX0pfSl9fSxlLnByb3RvdHlwZS50cmlnZ2VyPWZ1bmN0aW9uKGEsYil7dmFyIGM9ZS5fX3N1cGVyX18udHJpZ2dlcixkPXtvcGVuOlwib3BlbmluZ1wiLGNsb3NlOlwiY2xvc2luZ1wiLHNlbGVjdDpcInNlbGVjdGluZ1wiLHVuc2VsZWN0OlwidW5zZWxlY3RpbmdcIn07aWYodm9pZCAwPT09YiYmKGI9e30pLGEgaW4gZCl7dmFyIGY9ZFthXSxnPXtwcmV2ZW50ZWQ6ITEsbmFtZTphLGFyZ3M6Yn07aWYoYy5jYWxsKHRoaXMsZixnKSxnLnByZXZlbnRlZClyZXR1cm4gdm9pZChiLnByZXZlbnRlZD0hMCl9Yy5jYWxsKHRoaXMsYSxiKX0sZS5wcm90b3R5cGUudG9nZ2xlRHJvcGRvd249ZnVuY3Rpb24oKXt0aGlzLm9wdGlvbnMuZ2V0KFwiZGlzYWJsZWRcIil8fCh0aGlzLmlzT3BlbigpP3RoaXMuY2xvc2UoKTp0aGlzLm9wZW4oKSl9LGUucHJvdG90eXBlLm9wZW49ZnVuY3Rpb24oKXt0aGlzLmlzT3BlbigpfHx0aGlzLnRyaWdnZXIoXCJxdWVyeVwiLHt9KX0sZS5wcm90b3R5cGUuY2xvc2U9ZnVuY3Rpb24oKXt0aGlzLmlzT3BlbigpJiZ0aGlzLnRyaWdnZXIoXCJjbG9zZVwiLHt9KX0sZS5wcm90b3R5cGUuaXNPcGVuPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuJGNvbnRhaW5lci5oYXNDbGFzcyhcInNlbGVjdDItY29udGFpbmVyLS1vcGVuXCIpfSxlLnByb3RvdHlwZS5oYXNGb2N1cz1mdW5jdGlvbigpe3JldHVybiB0aGlzLiRjb250YWluZXIuaGFzQ2xhc3MoXCJzZWxlY3QyLWNvbnRhaW5lci0tZm9jdXNcIil9LGUucHJvdG90eXBlLmZvY3VzPWZ1bmN0aW9uKGEpe3RoaXMuaGFzRm9jdXMoKXx8KHRoaXMuJGNvbnRhaW5lci5hZGRDbGFzcyhcInNlbGVjdDItY29udGFpbmVyLS1mb2N1c1wiKSx0aGlzLnRyaWdnZXIoXCJmb2N1c1wiLHt9KSl9LGUucHJvdG90eXBlLmVuYWJsZT1mdW5jdGlvbihhKXt0aGlzLm9wdGlvbnMuZ2V0KFwiZGVidWdcIikmJndpbmRvdy5jb25zb2xlJiZjb25zb2xlLndhcm4mJmNvbnNvbGUud2FybignU2VsZWN0MjogVGhlIGBzZWxlY3QyKFwiZW5hYmxlXCIpYCBtZXRob2QgaGFzIGJlZW4gZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIGxhdGVyIFNlbGVjdDIgdmVyc2lvbnMuIFVzZSAkZWxlbWVudC5wcm9wKFwiZGlzYWJsZWRcIikgaW5zdGVhZC4nKSwobnVsbD09YXx8MD09PWEubGVuZ3RoKSYmKGE9WyEwXSk7dmFyIGI9IWFbMF07dGhpcy4kZWxlbWVudC5wcm9wKFwiZGlzYWJsZWRcIixiKX0sZS5wcm90b3R5cGUuZGF0YT1mdW5jdGlvbigpe3RoaXMub3B0aW9ucy5nZXQoXCJkZWJ1Z1wiKSYmYXJndW1lbnRzLmxlbmd0aD4wJiZ3aW5kb3cuY29uc29sZSYmY29uc29sZS53YXJuJiZjb25zb2xlLndhcm4oJ1NlbGVjdDI6IERhdGEgY2FuIG5vIGxvbmdlciBiZSBzZXQgdXNpbmcgYHNlbGVjdDIoXCJkYXRhXCIpYC4gWW91IHNob3VsZCBjb25zaWRlciBzZXR0aW5nIHRoZSB2YWx1ZSBpbnN0ZWFkIHVzaW5nIGAkZWxlbWVudC52YWwoKWAuJyk7dmFyIGE9W107cmV0dXJuIHRoaXMuZGF0YUFkYXB0ZXIuY3VycmVudChmdW5jdGlvbihiKXthPWJ9KSxhfSxlLnByb3RvdHlwZS52YWw9ZnVuY3Rpb24oYil7aWYodGhpcy5vcHRpb25zLmdldChcImRlYnVnXCIpJiZ3aW5kb3cuY29uc29sZSYmY29uc29sZS53YXJuJiZjb25zb2xlLndhcm4oJ1NlbGVjdDI6IFRoZSBgc2VsZWN0MihcInZhbFwiKWAgbWV0aG9kIGhhcyBiZWVuIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiBsYXRlciBTZWxlY3QyIHZlcnNpb25zLiBVc2UgJGVsZW1lbnQudmFsKCkgaW5zdGVhZC4nKSxudWxsPT1ifHwwPT09Yi5sZW5ndGgpcmV0dXJuIHRoaXMuJGVsZW1lbnQudmFsKCk7dmFyIGM9YlswXTthLmlzQXJyYXkoYykmJihjPWEubWFwKGMsZnVuY3Rpb24oYSl7cmV0dXJuIGEudG9TdHJpbmcoKX0pKSx0aGlzLiRlbGVtZW50LnZhbChjKS50cmlnZ2VyKFwiY2hhbmdlXCIpfSxlLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy4kY29udGFpbmVyLnJlbW92ZSgpLHRoaXMuJGVsZW1lbnRbMF0uZGV0YWNoRXZlbnQmJnRoaXMuJGVsZW1lbnRbMF0uZGV0YWNoRXZlbnQoXCJvbnByb3BlcnR5Y2hhbmdlXCIsdGhpcy5fc3luY0EpLG51bGwhPXRoaXMuX29ic2VydmVyPyh0aGlzLl9vYnNlcnZlci5kaXNjb25uZWN0KCksdGhpcy5fb2JzZXJ2ZXI9bnVsbCk6dGhpcy4kZWxlbWVudFswXS5yZW1vdmVFdmVudExpc3RlbmVyJiYodGhpcy4kZWxlbWVudFswXS5yZW1vdmVFdmVudExpc3RlbmVyKFwiRE9NQXR0ck1vZGlmaWVkXCIsdGhpcy5fc3luY0EsITEpLHRoaXMuJGVsZW1lbnRbMF0ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIkRPTU5vZGVJbnNlcnRlZFwiLHRoaXMuX3N5bmNTLCExKSx0aGlzLiRlbGVtZW50WzBdLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJET01Ob2RlUmVtb3ZlZFwiLHRoaXMuX3N5bmNTLCExKSksdGhpcy5fc3luY0E9bnVsbCx0aGlzLl9zeW5jUz1udWxsLHRoaXMuJGVsZW1lbnQub2ZmKFwiLnNlbGVjdDJcIiksdGhpcy4kZWxlbWVudC5hdHRyKFwidGFiaW5kZXhcIix0aGlzLiRlbGVtZW50LmRhdGEoXCJvbGQtdGFiaW5kZXhcIikpLHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoXCJzZWxlY3QyLWhpZGRlbi1hY2Nlc3NpYmxlXCIpLHRoaXMuJGVsZW1lbnQuYXR0cihcImFyaWEtaGlkZGVuXCIsXCJmYWxzZVwiKSx0aGlzLiRlbGVtZW50LnJlbW92ZURhdGEoXCJzZWxlY3QyXCIpLHRoaXMuZGF0YUFkYXB0ZXIuZGVzdHJveSgpLHRoaXMuc2VsZWN0aW9uLmRlc3Ryb3koKSx0aGlzLmRyb3Bkb3duLmRlc3Ryb3koKSx0aGlzLnJlc3VsdHMuZGVzdHJveSgpLHRoaXMuZGF0YUFkYXB0ZXI9bnVsbCx0aGlzLnNlbGVjdGlvbj1udWxsLHRoaXMuZHJvcGRvd249bnVsbCx0aGlzLnJlc3VsdHM9bnVsbDtcclxufSxlLnByb3RvdHlwZS5yZW5kZXI9ZnVuY3Rpb24oKXt2YXIgYj1hKCc8c3BhbiBjbGFzcz1cInNlbGVjdDIgc2VsZWN0Mi1jb250YWluZXJcIj48c3BhbiBjbGFzcz1cInNlbGVjdGlvblwiPjwvc3Bhbj48c3BhbiBjbGFzcz1cImRyb3Bkb3duLXdyYXBwZXJcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L3NwYW4+PC9zcGFuPicpO3JldHVybiBiLmF0dHIoXCJkaXJcIix0aGlzLm9wdGlvbnMuZ2V0KFwiZGlyXCIpKSx0aGlzLiRjb250YWluZXI9Yix0aGlzLiRjb250YWluZXIuYWRkQ2xhc3MoXCJzZWxlY3QyLWNvbnRhaW5lci0tXCIrdGhpcy5vcHRpb25zLmdldChcInRoZW1lXCIpKSxiLmRhdGEoXCJlbGVtZW50XCIsdGhpcy4kZWxlbWVudCksYn0sZX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9jb21wYXQvdXRpbHNcIixbXCJqcXVlcnlcIl0sZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYihiLGMsZCl7dmFyIGUsZixnPVtdO2U9YS50cmltKGIuYXR0cihcImNsYXNzXCIpKSxlJiYoZT1cIlwiK2UsYShlLnNwbGl0KC9cXHMrLykpLmVhY2goZnVuY3Rpb24oKXswPT09dGhpcy5pbmRleE9mKFwic2VsZWN0Mi1cIikmJmcucHVzaCh0aGlzKX0pKSxlPWEudHJpbShjLmF0dHIoXCJjbGFzc1wiKSksZSYmKGU9XCJcIitlLGEoZS5zcGxpdCgvXFxzKy8pKS5lYWNoKGZ1bmN0aW9uKCl7MCE9PXRoaXMuaW5kZXhPZihcInNlbGVjdDItXCIpJiYoZj1kKHRoaXMpLG51bGwhPWYmJmcucHVzaChmKSl9KSksYi5hdHRyKFwiY2xhc3NcIixnLmpvaW4oXCIgXCIpKX1yZXR1cm57c3luY0Nzc0NsYXNzZXM6Yn19KSxiLmRlZmluZShcInNlbGVjdDIvY29tcGF0L2NvbnRhaW5lckNzc1wiLFtcImpxdWVyeVwiLFwiLi91dGlsc1wiXSxmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYSl7cmV0dXJuIG51bGx9ZnVuY3Rpb24gZCgpe31yZXR1cm4gZC5wcm90b3R5cGUucmVuZGVyPWZ1bmN0aW9uKGQpe3ZhciBlPWQuY2FsbCh0aGlzKSxmPXRoaXMub3B0aW9ucy5nZXQoXCJjb250YWluZXJDc3NDbGFzc1wiKXx8XCJcIjthLmlzRnVuY3Rpb24oZikmJihmPWYodGhpcy4kZWxlbWVudCkpO3ZhciBnPXRoaXMub3B0aW9ucy5nZXQoXCJhZGFwdENvbnRhaW5lckNzc0NsYXNzXCIpO2lmKGc9Z3x8YywtMSE9PWYuaW5kZXhPZihcIjphbGw6XCIpKXtmPWYucmVwbGFjZShcIjphbGw6XCIsXCJcIik7dmFyIGg9ZztnPWZ1bmN0aW9uKGEpe3ZhciBiPWgoYSk7cmV0dXJuIG51bGwhPWI/YitcIiBcIithOmF9fXZhciBpPXRoaXMub3B0aW9ucy5nZXQoXCJjb250YWluZXJDc3NcIil8fHt9O3JldHVybiBhLmlzRnVuY3Rpb24oaSkmJihpPWkodGhpcy4kZWxlbWVudCkpLGIuc3luY0Nzc0NsYXNzZXMoZSx0aGlzLiRlbGVtZW50LGcpLGUuY3NzKGkpLGUuYWRkQ2xhc3MoZiksZX0sZH0pLGIuZGVmaW5lKFwic2VsZWN0Mi9jb21wYXQvZHJvcGRvd25Dc3NcIixbXCJqcXVlcnlcIixcIi4vdXRpbHNcIl0sZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGEpe3JldHVybiBudWxsfWZ1bmN0aW9uIGQoKXt9cmV0dXJuIGQucHJvdG90eXBlLnJlbmRlcj1mdW5jdGlvbihkKXt2YXIgZT1kLmNhbGwodGhpcyksZj10aGlzLm9wdGlvbnMuZ2V0KFwiZHJvcGRvd25Dc3NDbGFzc1wiKXx8XCJcIjthLmlzRnVuY3Rpb24oZikmJihmPWYodGhpcy4kZWxlbWVudCkpO3ZhciBnPXRoaXMub3B0aW9ucy5nZXQoXCJhZGFwdERyb3Bkb3duQ3NzQ2xhc3NcIik7aWYoZz1nfHxjLC0xIT09Zi5pbmRleE9mKFwiOmFsbDpcIikpe2Y9Zi5yZXBsYWNlKFwiOmFsbDpcIixcIlwiKTt2YXIgaD1nO2c9ZnVuY3Rpb24oYSl7dmFyIGI9aChhKTtyZXR1cm4gbnVsbCE9Yj9iK1wiIFwiK2E6YX19dmFyIGk9dGhpcy5vcHRpb25zLmdldChcImRyb3Bkb3duQ3NzXCIpfHx7fTtyZXR1cm4gYS5pc0Z1bmN0aW9uKGkpJiYoaT1pKHRoaXMuJGVsZW1lbnQpKSxiLnN5bmNDc3NDbGFzc2VzKGUsdGhpcy4kZWxlbWVudCxnKSxlLmNzcyhpKSxlLmFkZENsYXNzKGYpLGV9LGR9KSxiLmRlZmluZShcInNlbGVjdDIvY29tcGF0L2luaXRTZWxlY3Rpb25cIixbXCJqcXVlcnlcIl0sZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYihhLGIsYyl7Yy5nZXQoXCJkZWJ1Z1wiKSYmd2luZG93LmNvbnNvbGUmJmNvbnNvbGUud2FybiYmY29uc29sZS53YXJuKFwiU2VsZWN0MjogVGhlIGBpbml0U2VsZWN0aW9uYCBvcHRpb24gaGFzIGJlZW4gZGVwcmVjYXRlZCBpbiBmYXZvciBvZiBhIGN1c3RvbSBkYXRhIGFkYXB0ZXIgdGhhdCBvdmVycmlkZXMgdGhlIGBjdXJyZW50YCBtZXRob2QuIFRoaXMgbWV0aG9kIGlzIG5vdyBjYWxsZWQgbXVsdGlwbGUgdGltZXMgaW5zdGVhZCBvZiBhIHNpbmdsZSB0aW1lIHdoZW4gdGhlIGluc3RhbmNlIGlzIGluaXRpYWxpemVkLiBTdXBwb3J0IHdpbGwgYmUgcmVtb3ZlZCBmb3IgdGhlIGBpbml0U2VsZWN0aW9uYCBvcHRpb24gaW4gZnV0dXJlIHZlcnNpb25zIG9mIFNlbGVjdDJcIiksdGhpcy5pbml0U2VsZWN0aW9uPWMuZ2V0KFwiaW5pdFNlbGVjdGlvblwiKSx0aGlzLl9pc0luaXRpYWxpemVkPSExLGEuY2FsbCh0aGlzLGIsYyl9cmV0dXJuIGIucHJvdG90eXBlLmN1cnJlbnQ9ZnVuY3Rpb24oYixjKXt2YXIgZD10aGlzO3JldHVybiB0aGlzLl9pc0luaXRpYWxpemVkP3ZvaWQgYi5jYWxsKHRoaXMsYyk6dm9pZCB0aGlzLmluaXRTZWxlY3Rpb24uY2FsbChudWxsLHRoaXMuJGVsZW1lbnQsZnVuY3Rpb24oYil7ZC5faXNJbml0aWFsaXplZD0hMCxhLmlzQXJyYXkoYil8fChiPVtiXSksYyhiKX0pfSxifSksYi5kZWZpbmUoXCJzZWxlY3QyL2NvbXBhdC9pbnB1dERhdGFcIixbXCJqcXVlcnlcIl0sZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYihhLGIsYyl7dGhpcy5fY3VycmVudERhdGE9W10sdGhpcy5fdmFsdWVTZXBhcmF0b3I9Yy5nZXQoXCJ2YWx1ZVNlcGFyYXRvclwiKXx8XCIsXCIsXCJoaWRkZW5cIj09PWIucHJvcChcInR5cGVcIikmJmMuZ2V0KFwiZGVidWdcIikmJmNvbnNvbGUmJmNvbnNvbGUud2FybiYmY29uc29sZS53YXJuKFwiU2VsZWN0MjogVXNpbmcgYSBoaWRkZW4gaW5wdXQgd2l0aCBTZWxlY3QyIGlzIG5vIGxvbmdlciBzdXBwb3J0ZWQgYW5kIG1heSBzdG9wIHdvcmtpbmcgaW4gdGhlIGZ1dHVyZS4gSXQgaXMgcmVjb21tZW5kZWQgdG8gdXNlIGEgYDxzZWxlY3Q+YCBlbGVtZW50IGluc3RlYWQuXCIpLGEuY2FsbCh0aGlzLGIsYyl9cmV0dXJuIGIucHJvdG90eXBlLmN1cnJlbnQ9ZnVuY3Rpb24oYixjKXtmdW5jdGlvbiBkKGIsYyl7dmFyIGU9W107cmV0dXJuIGIuc2VsZWN0ZWR8fC0xIT09YS5pbkFycmF5KGIuaWQsYyk/KGIuc2VsZWN0ZWQ9ITAsZS5wdXNoKGIpKTpiLnNlbGVjdGVkPSExLGIuY2hpbGRyZW4mJmUucHVzaC5hcHBseShlLGQoYi5jaGlsZHJlbixjKSksZX1mb3IodmFyIGU9W10sZj0wO2Y8dGhpcy5fY3VycmVudERhdGEubGVuZ3RoO2YrKyl7dmFyIGc9dGhpcy5fY3VycmVudERhdGFbZl07ZS5wdXNoLmFwcGx5KGUsZChnLHRoaXMuJGVsZW1lbnQudmFsKCkuc3BsaXQodGhpcy5fdmFsdWVTZXBhcmF0b3IpKSl9YyhlKX0sYi5wcm90b3R5cGUuc2VsZWN0PWZ1bmN0aW9uKGIsYyl7aWYodGhpcy5vcHRpb25zLmdldChcIm11bHRpcGxlXCIpKXt2YXIgZD10aGlzLiRlbGVtZW50LnZhbCgpO2QrPXRoaXMuX3ZhbHVlU2VwYXJhdG9yK2MuaWQsdGhpcy4kZWxlbWVudC52YWwoZCksdGhpcy4kZWxlbWVudC50cmlnZ2VyKFwiY2hhbmdlXCIpfWVsc2UgdGhpcy5jdXJyZW50KGZ1bmN0aW9uKGIpe2EubWFwKGIsZnVuY3Rpb24oYSl7YS5zZWxlY3RlZD0hMX0pfSksdGhpcy4kZWxlbWVudC52YWwoYy5pZCksdGhpcy4kZWxlbWVudC50cmlnZ2VyKFwiY2hhbmdlXCIpfSxiLnByb3RvdHlwZS51bnNlbGVjdD1mdW5jdGlvbihhLGIpe3ZhciBjPXRoaXM7Yi5zZWxlY3RlZD0hMSx0aGlzLmN1cnJlbnQoZnVuY3Rpb24oYSl7Zm9yKHZhciBkPVtdLGU9MDtlPGEubGVuZ3RoO2UrKyl7dmFyIGY9YVtlXTtiLmlkIT1mLmlkJiZkLnB1c2goZi5pZCl9Yy4kZWxlbWVudC52YWwoZC5qb2luKGMuX3ZhbHVlU2VwYXJhdG9yKSksYy4kZWxlbWVudC50cmlnZ2VyKFwiY2hhbmdlXCIpfSl9LGIucHJvdG90eXBlLnF1ZXJ5PWZ1bmN0aW9uKGEsYixjKXtmb3IodmFyIGQ9W10sZT0wO2U8dGhpcy5fY3VycmVudERhdGEubGVuZ3RoO2UrKyl7dmFyIGY9dGhpcy5fY3VycmVudERhdGFbZV0sZz10aGlzLm1hdGNoZXMoYixmKTtudWxsIT09ZyYmZC5wdXNoKGcpfWMoe3Jlc3VsdHM6ZH0pfSxiLnByb3RvdHlwZS5hZGRPcHRpb25zPWZ1bmN0aW9uKGIsYyl7dmFyIGQ9YS5tYXAoYyxmdW5jdGlvbihiKXtyZXR1cm4gYS5kYXRhKGJbMF0sXCJkYXRhXCIpfSk7dGhpcy5fY3VycmVudERhdGEucHVzaC5hcHBseSh0aGlzLl9jdXJyZW50RGF0YSxkKX0sYn0pLGIuZGVmaW5lKFwic2VsZWN0Mi9jb21wYXQvbWF0Y2hlclwiLFtcImpxdWVyeVwiXSxmdW5jdGlvbihhKXtmdW5jdGlvbiBiKGIpe2Z1bmN0aW9uIGMoYyxkKXt2YXIgZT1hLmV4dGVuZCghMCx7fSxkKTtpZihudWxsPT1jLnRlcm18fFwiXCI9PT1hLnRyaW0oYy50ZXJtKSlyZXR1cm4gZTtpZihkLmNoaWxkcmVuKXtmb3IodmFyIGY9ZC5jaGlsZHJlbi5sZW5ndGgtMTtmPj0wO2YtLSl7dmFyIGc9ZC5jaGlsZHJlbltmXSxoPWIoYy50ZXJtLGcudGV4dCxnKTtofHxlLmNoaWxkcmVuLnNwbGljZShmLDEpfWlmKGUuY2hpbGRyZW4ubGVuZ3RoPjApcmV0dXJuIGV9cmV0dXJuIGIoYy50ZXJtLGQudGV4dCxkKT9lOm51bGx9cmV0dXJuIGN9cmV0dXJuIGJ9KSxiLmRlZmluZShcInNlbGVjdDIvY29tcGF0L3F1ZXJ5XCIsW10sZnVuY3Rpb24oKXtmdW5jdGlvbiBhKGEsYixjKXtjLmdldChcImRlYnVnXCIpJiZ3aW5kb3cuY29uc29sZSYmY29uc29sZS53YXJuJiZjb25zb2xlLndhcm4oXCJTZWxlY3QyOiBUaGUgYHF1ZXJ5YCBvcHRpb24gaGFzIGJlZW4gZGVwcmVjYXRlZCBpbiBmYXZvciBvZiBhIGN1c3RvbSBkYXRhIGFkYXB0ZXIgdGhhdCBvdmVycmlkZXMgdGhlIGBxdWVyeWAgbWV0aG9kLiBTdXBwb3J0IHdpbGwgYmUgcmVtb3ZlZCBmb3IgdGhlIGBxdWVyeWAgb3B0aW9uIGluIGZ1dHVyZSB2ZXJzaW9ucyBvZiBTZWxlY3QyLlwiKSxhLmNhbGwodGhpcyxiLGMpfXJldHVybiBhLnByb3RvdHlwZS5xdWVyeT1mdW5jdGlvbihhLGIsYyl7Yi5jYWxsYmFjaz1jO3ZhciBkPXRoaXMub3B0aW9ucy5nZXQoXCJxdWVyeVwiKTtkLmNhbGwobnVsbCxiKX0sYX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kcm9wZG93bi9hdHRhY2hDb250YWluZXJcIixbXSxmdW5jdGlvbigpe2Z1bmN0aW9uIGEoYSxiLGMpe2EuY2FsbCh0aGlzLGIsYyl9cmV0dXJuIGEucHJvdG90eXBlLnBvc2l0aW9uPWZ1bmN0aW9uKGEsYixjKXt2YXIgZD1jLmZpbmQoXCIuZHJvcGRvd24td3JhcHBlclwiKTtkLmFwcGVuZChiKSxiLmFkZENsYXNzKFwic2VsZWN0Mi1kcm9wZG93bi0tYmVsb3dcIiksYy5hZGRDbGFzcyhcInNlbGVjdDItY29udGFpbmVyLS1iZWxvd1wiKX0sYX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kcm9wZG93bi9zdG9wUHJvcGFnYXRpb25cIixbXSxmdW5jdGlvbigpe2Z1bmN0aW9uIGEoKXt9cmV0dXJuIGEucHJvdG90eXBlLmJpbmQ9ZnVuY3Rpb24oYSxiLGMpe2EuY2FsbCh0aGlzLGIsYyk7dmFyIGQ9W1wiYmx1clwiLFwiY2hhbmdlXCIsXCJjbGlja1wiLFwiZGJsY2xpY2tcIixcImZvY3VzXCIsXCJmb2N1c2luXCIsXCJmb2N1c291dFwiLFwiaW5wdXRcIixcImtleWRvd25cIixcImtleXVwXCIsXCJrZXlwcmVzc1wiLFwibW91c2Vkb3duXCIsXCJtb3VzZWVudGVyXCIsXCJtb3VzZWxlYXZlXCIsXCJtb3VzZW1vdmVcIixcIm1vdXNlb3ZlclwiLFwibW91c2V1cFwiLFwic2VhcmNoXCIsXCJ0b3VjaGVuZFwiLFwidG91Y2hzdGFydFwiXTt0aGlzLiRkcm9wZG93bi5vbihkLmpvaW4oXCIgXCIpLGZ1bmN0aW9uKGEpe2Euc3RvcFByb3BhZ2F0aW9uKCl9KX0sYX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9zZWxlY3Rpb24vc3RvcFByb3BhZ2F0aW9uXCIsW10sZnVuY3Rpb24oKXtmdW5jdGlvbiBhKCl7fXJldHVybiBhLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGEsYixjKXthLmNhbGwodGhpcyxiLGMpO3ZhciBkPVtcImJsdXJcIixcImNoYW5nZVwiLFwiY2xpY2tcIixcImRibGNsaWNrXCIsXCJmb2N1c1wiLFwiZm9jdXNpblwiLFwiZm9jdXNvdXRcIixcImlucHV0XCIsXCJrZXlkb3duXCIsXCJrZXl1cFwiLFwia2V5cHJlc3NcIixcIm1vdXNlZG93blwiLFwibW91c2VlbnRlclwiLFwibW91c2VsZWF2ZVwiLFwibW91c2Vtb3ZlXCIsXCJtb3VzZW92ZXJcIixcIm1vdXNldXBcIixcInNlYXJjaFwiLFwidG91Y2hlbmRcIixcInRvdWNoc3RhcnRcIl07dGhpcy4kc2VsZWN0aW9uLm9uKGQuam9pbihcIiBcIiksZnVuY3Rpb24oYSl7YS5zdG9wUHJvcGFnYXRpb24oKX0pfSxhfSksZnVuY3Rpb24oYyl7XCJmdW5jdGlvblwiPT10eXBlb2YgYi5kZWZpbmUmJmIuZGVmaW5lLmFtZD9iLmRlZmluZShcImpxdWVyeS1tb3VzZXdoZWVsXCIsW1wianF1ZXJ5XCJdLGMpOlwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP21vZHVsZS5leHBvcnRzPWM6YyhhKX0oZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYihiKXt2YXIgZz1ifHx3aW5kb3cuZXZlbnQsaD1pLmNhbGwoYXJndW1lbnRzLDEpLGo9MCxsPTAsbT0wLG49MCxvPTAscD0wO2lmKGI9YS5ldmVudC5maXgoZyksYi50eXBlPVwibW91c2V3aGVlbFwiLFwiZGV0YWlsXCJpbiBnJiYobT0tMSpnLmRldGFpbCksXCJ3aGVlbERlbHRhXCJpbiBnJiYobT1nLndoZWVsRGVsdGEpLFwid2hlZWxEZWx0YVlcImluIGcmJihtPWcud2hlZWxEZWx0YVkpLFwid2hlZWxEZWx0YVhcImluIGcmJihsPS0xKmcud2hlZWxEZWx0YVgpLFwiYXhpc1wiaW4gZyYmZy5heGlzPT09Zy5IT1JJWk9OVEFMX0FYSVMmJihsPS0xKm0sbT0wKSxqPTA9PT1tP2w6bSxcImRlbHRhWVwiaW4gZyYmKG09LTEqZy5kZWx0YVksaj1tKSxcImRlbHRhWFwiaW4gZyYmKGw9Zy5kZWx0YVgsMD09PW0mJihqPS0xKmwpKSwwIT09bXx8MCE9PWwpe2lmKDE9PT1nLmRlbHRhTW9kZSl7dmFyIHE9YS5kYXRhKHRoaXMsXCJtb3VzZXdoZWVsLWxpbmUtaGVpZ2h0XCIpO2oqPXEsbSo9cSxsKj1xfWVsc2UgaWYoMj09PWcuZGVsdGFNb2RlKXt2YXIgcj1hLmRhdGEodGhpcyxcIm1vdXNld2hlZWwtcGFnZS1oZWlnaHRcIik7aio9cixtKj1yLGwqPXJ9aWYobj1NYXRoLm1heChNYXRoLmFicyhtKSxNYXRoLmFicyhsKSksKCFmfHxmPm4pJiYoZj1uLGQoZyxuKSYmKGYvPTQwKSksZChnLG4pJiYoai89NDAsbC89NDAsbS89NDApLGo9TWF0aFtqPj0xP1wiZmxvb3JcIjpcImNlaWxcIl0oai9mKSxsPU1hdGhbbD49MT9cImZsb29yXCI6XCJjZWlsXCJdKGwvZiksbT1NYXRoW20+PTE/XCJmbG9vclwiOlwiY2VpbFwiXShtL2YpLGsuc2V0dGluZ3Mubm9ybWFsaXplT2Zmc2V0JiZ0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCl7dmFyIHM9dGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtvPWIuY2xpZW50WC1zLmxlZnQscD1iLmNsaWVudFktcy50b3B9cmV0dXJuIGIuZGVsdGFYPWwsYi5kZWx0YVk9bSxiLmRlbHRhRmFjdG9yPWYsYi5vZmZzZXRYPW8sYi5vZmZzZXRZPXAsYi5kZWx0YU1vZGU9MCxoLnVuc2hpZnQoYixqLGwsbSksZSYmY2xlYXJUaW1lb3V0KGUpLGU9c2V0VGltZW91dChjLDIwMCksKGEuZXZlbnQuZGlzcGF0Y2h8fGEuZXZlbnQuaGFuZGxlKS5hcHBseSh0aGlzLGgpfX1mdW5jdGlvbiBjKCl7Zj1udWxsfWZ1bmN0aW9uIGQoYSxiKXtyZXR1cm4gay5zZXR0aW5ncy5hZGp1c3RPbGREZWx0YXMmJlwibW91c2V3aGVlbFwiPT09YS50eXBlJiZiJTEyMD09PTB9dmFyIGUsZixnPVtcIndoZWVsXCIsXCJtb3VzZXdoZWVsXCIsXCJET01Nb3VzZVNjcm9sbFwiLFwiTW96TW91c2VQaXhlbFNjcm9sbFwiXSxoPVwib253aGVlbFwiaW4gZG9jdW1lbnR8fGRvY3VtZW50LmRvY3VtZW50TW9kZT49OT9bXCJ3aGVlbFwiXTpbXCJtb3VzZXdoZWVsXCIsXCJEb21Nb3VzZVNjcm9sbFwiLFwiTW96TW91c2VQaXhlbFNjcm9sbFwiXSxpPUFycmF5LnByb3RvdHlwZS5zbGljZTtpZihhLmV2ZW50LmZpeEhvb2tzKWZvcih2YXIgaj1nLmxlbmd0aDtqOylhLmV2ZW50LmZpeEhvb2tzW2dbLS1qXV09YS5ldmVudC5tb3VzZUhvb2tzO3ZhciBrPWEuZXZlbnQuc3BlY2lhbC5tb3VzZXdoZWVsPXt2ZXJzaW9uOlwiMy4xLjEyXCIsc2V0dXA6ZnVuY3Rpb24oKXtpZih0aGlzLmFkZEV2ZW50TGlzdGVuZXIpZm9yKHZhciBjPWgubGVuZ3RoO2M7KXRoaXMuYWRkRXZlbnRMaXN0ZW5lcihoWy0tY10sYiwhMSk7ZWxzZSB0aGlzLm9ubW91c2V3aGVlbD1iO2EuZGF0YSh0aGlzLFwibW91c2V3aGVlbC1saW5lLWhlaWdodFwiLGsuZ2V0TGluZUhlaWdodCh0aGlzKSksYS5kYXRhKHRoaXMsXCJtb3VzZXdoZWVsLXBhZ2UtaGVpZ2h0XCIsay5nZXRQYWdlSGVpZ2h0KHRoaXMpKX0sdGVhcmRvd246ZnVuY3Rpb24oKXtpZih0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIpZm9yKHZhciBjPWgubGVuZ3RoO2M7KXRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcihoWy0tY10sYiwhMSk7ZWxzZSB0aGlzLm9ubW91c2V3aGVlbD1udWxsO2EucmVtb3ZlRGF0YSh0aGlzLFwibW91c2V3aGVlbC1saW5lLWhlaWdodFwiKSxhLnJlbW92ZURhdGEodGhpcyxcIm1vdXNld2hlZWwtcGFnZS1oZWlnaHRcIil9LGdldExpbmVIZWlnaHQ6ZnVuY3Rpb24oYil7dmFyIGM9YShiKSxkPWNbXCJvZmZzZXRQYXJlbnRcImluIGEuZm4/XCJvZmZzZXRQYXJlbnRcIjpcInBhcmVudFwiXSgpO3JldHVybiBkLmxlbmd0aHx8KGQ9YShcImJvZHlcIikpLHBhcnNlSW50KGQuY3NzKFwiZm9udFNpemVcIiksMTApfHxwYXJzZUludChjLmNzcyhcImZvbnRTaXplXCIpLDEwKXx8MTZ9LGdldFBhZ2VIZWlnaHQ6ZnVuY3Rpb24oYil7cmV0dXJuIGEoYikuaGVpZ2h0KCl9LHNldHRpbmdzOnthZGp1c3RPbGREZWx0YXM6ITAsbm9ybWFsaXplT2Zmc2V0OiEwfX07YS5mbi5leHRlbmQoe21vdXNld2hlZWw6ZnVuY3Rpb24oYSl7cmV0dXJuIGE/dGhpcy5iaW5kKFwibW91c2V3aGVlbFwiLGEpOnRoaXMudHJpZ2dlcihcIm1vdXNld2hlZWxcIil9LHVubW91c2V3aGVlbDpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy51bmJpbmQoXCJtb3VzZXdoZWVsXCIsYSl9fSl9KSxiLmRlZmluZShcImpxdWVyeS5zZWxlY3QyXCIsW1wianF1ZXJ5XCIsXCJqcXVlcnktbW91c2V3aGVlbFwiLFwiLi9zZWxlY3QyL2NvcmVcIixcIi4vc2VsZWN0Mi9kZWZhdWx0c1wiXSxmdW5jdGlvbihhLGIsYyxkKXtpZihudWxsPT1hLmZuLnNlbGVjdDIpe3ZhciBlPVtcIm9wZW5cIixcImNsb3NlXCIsXCJkZXN0cm95XCJdO2EuZm4uc2VsZWN0Mj1mdW5jdGlvbihiKXtpZihiPWJ8fHt9LFwib2JqZWN0XCI9PXR5cGVvZiBiKXJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgZD1hLmV4dGVuZCghMCx7fSxiKTtuZXcgYyhhKHRoaXMpLGQpfSksdGhpcztpZihcInN0cmluZ1wiPT10eXBlb2YgYil7dmFyIGQsZj1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsMSk7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciBjPWEodGhpcykuZGF0YShcInNlbGVjdDJcIik7bnVsbD09YyYmd2luZG93LmNvbnNvbGUmJmNvbnNvbGUuZXJyb3ImJmNvbnNvbGUuZXJyb3IoXCJUaGUgc2VsZWN0MignXCIrYitcIicpIG1ldGhvZCB3YXMgY2FsbGVkIG9uIGFuIGVsZW1lbnQgdGhhdCBpcyBub3QgdXNpbmcgU2VsZWN0Mi5cIiksZD1jW2JdLmFwcGx5KGMsZil9KSxhLmluQXJyYXkoYixlKT4tMT90aGlzOmR9dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBhcmd1bWVudHMgZm9yIFNlbGVjdDI6IFwiK2IpfX1yZXR1cm4gbnVsbD09YS5mbi5zZWxlY3QyLmRlZmF1bHRzJiYoYS5mbi5zZWxlY3QyLmRlZmF1bHRzPWQpLGN9KSx7ZGVmaW5lOmIuZGVmaW5lLHJlcXVpcmU6Yi5yZXF1aXJlfX0oKSxjPWIucmVxdWlyZShcImpxdWVyeS5zZWxlY3QyXCIpO3JldHVybiBhLmZuLnNlbGVjdDIuYW1kPWIsY30pOyIsIiQoZnVuY3Rpb24oKSB7XHJcbiAgICAkKCdpbnB1dFtuYW1lPWRfZnJvbV0sIGlucHV0W25hbWU9ZF90b10nKS5kYXRlcGlja2VyKHtcclxuICAgICAgICBkYXRlRm9ybWF0OiBcInl5eXktbW0tZGRcIlxyXG4gICAgfSk7XHJcblxyXG4gICAgJCgnZm9ybVtuYW1lPWNhdGVnb3JpZXMtZWRpdC1zdG9yZXNdIGlucHV0W3R5cGU9Y2hlY2tib3hdJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICBcdHZhciBzZWxmID0gJCh0aGlzKSxcclxuICAgIFx0XHRjYXRlZ29yaWVzRm9ybSA9ICQoJ2Zvcm1bbmFtZT1jYXRlZ29yaWVzLWVkaXQtc3RvcmVzXScpO1xyXG5cclxuICAgIFx0aWYoc2VsZi5pcyhcIjpjaGVja2VkXCIpICYmIHNlbGYuYXR0cihcImRhdGEtcGFyZW50LWlkXCIpICE9IFwiMFwiKSB7XHJcbiAgICBcdFx0Y2F0ZWdvcmllc0Zvcm0uZmluZCgnaW5wdXRbZGF0YS11aWQ9Jysgc2VsZi5hdHRyKFwiZGF0YS1wYXJlbnQtaWRcIikgKyddJykucHJvcChcImNoZWNrZWRcIiwgZmFsc2UpLnByb3AoXCJjaGVja2VkXCIsIHRydWUpO1xyXG4gICAgXHR9IGVsc2UgaWYoIXNlbGYuaXMoXCI6Y2hlY2tlZFwiKSAmJiBzZWxmLmF0dHIoXCJkYXRhLXBhcmVudC1pZFwiKSAhPSBcIjBcIikge1xyXG4gICAgXHRcdHZhciBwYXJlbnRVbmNoZWtlZCA9IHRydWU7XHJcblxyXG4gICAgXHRcdGNhdGVnb3JpZXNGb3JtLmZpbmQoJ2lucHV0W2RhdGEtcGFyZW50LWlkPScrIHNlbGYuYXR0cihcImRhdGEtcGFyZW50LWlkXCIpICsnXScpLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICBcdFx0XHRpZigkKHRoaXMpLmlzKFwiOmNoZWNrZWRcIikpIHtcclxuICAgIFx0XHRcdFx0cGFyZW50VW5jaGVrZWQgPSBmYWxzZTtcclxuICAgIFx0XHRcdH1cclxuICAgIFx0XHR9KTtcclxuXHJcbiAgICBcdFx0aWYocGFyZW50VW5jaGVrZWQpIHtcclxuICAgIFx0XHRcdGNhdGVnb3JpZXNGb3JtLmZpbmQoJ2lucHV0W2RhdGEtdWlkPScrIHNlbGYuYXR0cihcImRhdGEtcGFyZW50LWlkXCIpICsnXScpLnByb3AoXCJjaGVja2VkXCIsIGZhbHNlKTtcclxuICAgIFx0XHR9XHJcbiAgICBcdH1cclxuICAgIH0pO1xyXG5cclxuXHQkKFwiLnNlbGVjdDItdXNlcnNcIikuc2VsZWN0Mih7XHJcblx0XHRhamF4OiB7XHJcblx0XHRcdHVybDogXCIvYWRtaW4vdXNlcnMvbGlzdFwiLFxyXG5cdFx0XHR0eXBlOiAncG9zdCcsXHJcblx0XHRcdGRhdGFUeXBlOiAnanNvbicsXHJcblx0XHRcdGRlbGF5OiAyNTAsXHJcblx0XHRcdGRhdGE6IGZ1bmN0aW9uIChwYXJhbXMpIHtcclxuXHRcdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdFx0ZW1haWw6IHBhcmFtcy50ZXJtXHJcblx0XHRcdFx0fTtcclxuXHRcdFx0fSxcclxuXHRcdFx0cHJvY2Vzc1Jlc3VsdHM6IGZ1bmN0aW9uIChkYXRhKSB7XHJcblx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdHJlc3VsdHM6IGRhdGFcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRjYWNoZTogdHJ1ZVxyXG5cdFx0fSxcclxuXHRcdHBsYWNlaG9sZGVyOiBcItCS0YvQsdC10YDQuNGC0LUg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GPXCIsXHJcblx0XHRtaW5pbXVtSW5wdXRMZW5ndGg6IDFcclxuXHR9KTtcclxuXHJcblx0JCggXCIuaW5wdXQtZGF0ZXBpY2tlclwiICkuZGF0ZXBpY2tlcih7XHJcblx0XHRkYXRlRm9ybWF0OiBcInl5eXktbW0tZGRcIlxyXG5cdH0pO1xyXG5cclxuXHQkKCcjY2hhcml0eS1jaGVja2JveC0wJykuY2xpY2soIGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBjaGVja2VkID0gdGhpcy5jaGVja2VkO1xyXG5cdFx0QXJyYXkuZnJvbShkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiY2hhcml0eS1jaGVja2JveFwiKSkuZm9yRWFjaChcclxuXHRcdFx0ZnVuY3Rpb24oZWxlbWVudCkge1xyXG5cdFx0XHRcdGVsZW1lbnQuY2hlY2tlZCA9IGNoZWNrZWQ7XHJcblx0XHRcdH1cclxuXHRcdCk7XHJcblx0fSk7XHJcblxyXG5cdCQoJy5hamF4LWNvbmZpcm0nKS5vbignY2xpY2snLGZ1bmN0aW9uKGUpIHtcclxuXHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdCR0aGlzPSQodGhpcyk7XHJcblx0XHRkYXRhPXtcclxuXHRcdFx0J3F1ZXN0aW9uJzokdGhpcy5kYXRhKCdxdWVzdGlvbicpfHwn0JLRiyDRg9Cy0YPRgNC10L3QvdGLPycsXHJcblx0XHRcdCd0aXRsZSc6JHRoaXMuZGF0YSgndGl0bGUnKXx8J9Cf0L7QtNGC0LLQtdGA0LbQtNC10L3QuNC1INC00LXQudGB0YLQstC40Y8nLFxyXG5cdFx0XHQnY2FsbGJhY2tZZXMnOmZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0JHRoaXM9JCh0aGlzKTtcclxuXHRcdFx0XHQkLnBvc3QoJy9hZG1pbi9zdG9yZXMvaW1wb3J0LWNhdC9pZDonKyR0aGlzLmRhdGEoJ3N0b3JlJyksZnVuY3Rpb24oZGF0YSl7XHJcblx0XHRcdFx0XHRpZihkYXRhLmVycm9yKXtcclxuXHRcdFx0XHRcdFx0bm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTpkYXRhLmVycm9yLHR5cGU6J2Vycid9KVxyXG5cdFx0XHRcdFx0fWVsc2Uge1xyXG5cdFx0XHRcdFx0XHRsb2NhdGlvbi5yZWxvYWQoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9LCdqc29uJylcclxuXHRcdFx0XHRcdC5mYWlsKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOlwi0J7RiNC40LHQutCwINC/0LXRgNC10LTQsNGH0Lgg0LTQsNC90L3Ri9GFXCIsdHlwZTonZXJyJ30pXHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0fSxcclxuXHRcdFx0J29iaic6JHRoaXNcclxuXHRcdH07XHJcblx0XHRub3RpZmljYXRpb24uY29uZmlybShkYXRhKVxyXG5cdH0pXHJcbn0pO1xyXG5cclxuLyokKGZ1bmN0aW9uKCkge1xyXG5cdCQoJy5jaF90cmVlIGlucHV0Jykub24oJ2NoYW5nZScsZnVuY3Rpb24oKXtcclxuXHRcdCR0aGlzPSQodGhpcylcclxuXHRcdGlucHV0PSR0aGlzLnBhcmVudCgpLnBhcmVudCgpLmZpbmQoJ2lucHV0Jyk7XHJcblx0XHRpbnB1dC5wcm9wKCdjaGVja2VkJywkdGhpcy5wcm9wKCdjaGVja2VkJykpXHJcblx0fSlcclxufSk7Ki9cclxuJChmdW5jdGlvbigpIHtcclxuXHQkKCcuZ2V0X2FkbWl0YWQnKS5vbignY2xpY2snLGZ1bmN0aW9uKGUpe1xyXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0aHJlZj10aGlzLmhyZWZ8fFwiXCI7XHJcblxyXG5cdFx0JCgnLnVzZXJfZGF0YScpLmh0bWwoXCJcIik7XHJcblx0XHRhZD0kKCcuYWRtaXRhZF9kYXRhJyk7XHJcblx0XHRhZC5hZGRDbGFzcygnbG9hZGluZycpO1xyXG5cdFx0YWQucmVtb3ZlQ2xhc3MoJ25vcm1hbF9sb2FkJyk7XHJcblx0XHRhZC50ZXh0KCcnKTtcclxuXHJcblx0XHR0cj1hZC5jbG9zZXN0KCd0cicpO1xyXG5cdFx0aWRzPVtdO1xyXG5cdFx0Zm9yKHZhciBpPTA7aTx0ci5sZW5ndGg7aSsrKXtcclxuXHRcdFx0aWQ9dHIuZXEoaSkuZGF0YSgna2V5Jyk7XHJcblx0XHRcdGlmKGlkKWlkcy5wdXNoKGlkKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZihpZHMubGVuZ3RoPT0wKXtcclxuXHRcdFx0YWQucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuXHRcdFx0YWxlcnQoJ9Cd0LXRgiDQt9Cw0LrQsNC30L7QsiDQtNC70Y8g0L/RgNC+0LLQtdGA0LrQuCcpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0JC5wb3N0KCcvYWRtaW4vcGF5bWVudHMvYWRtaXRhZC10ZXN0Jyx7J2lkcyc6aWRzLCd1cGRhdGUnOihocmVmLmluZGV4T2YoJ3VwZGF0ZScpPjA/MTowKX0sZnVuY3Rpb24oZGF0YSl7XHJcblx0XHRcdGFkPSQoJy5hZG1pdGFkX2RhdGEnKTtcclxuXHRcdFx0YWQudGV4dCgn0LTQsNC90L3Ri9C1INC90LUg0L3QsNC50LTQtdC90YsnKTtcclxuXHRcdFx0YWQucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuXHJcblx0XHRcdHRyPWFkLmNsb3Nlc3QoJ3RyJyk7XHJcblx0XHRcdGZvcih2YXIgaT0wO2k8dHIubGVuZ3RoO2krKykge1xyXG5cdFx0XHRcdHZhciBpdGVtID0gdHIuZXEoaSk7XHJcblx0XHRcdFx0aWQgPSBpdGVtLmRhdGEoJ2tleScpO1xyXG5cdFx0XHRcdGlmICghZGF0YVtpZF0pIHtcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0dGRzPWl0ZW0uZmluZCgnLmFkbWl0YWRfZGF0YScpO1xyXG5cdFx0XHRcdGZvcih2YXIgaj0wO2o8dGRzLmxlbmd0aDtqKyspIHtcclxuXHRcdFx0XHRcdHZhciB0ZCA9IHRkcy5lcShqKTtcclxuXHRcdFx0XHRcdGtleT10ZC5kYXRhKCdjb2wnKTtcclxuXHRcdFx0XHRcdGlmKGRhdGFbaWRdW2tleV0pe1xyXG5cdFx0XHRcdFx0XHR0ZC5odG1sKGRhdGFbaWRdW2tleV0pO1xyXG5cdFx0XHRcdFx0XHR0ZC5hZGRDbGFzcygnbm9ybWFsX2xvYWQnKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKGRhdGFbJ3VzZXJfZGF0YSddKXtcclxuXHRcdFx0XHR1c2VyPWRhdGFbJ3VzZXJfZGF0YSddO1xyXG5cdFx0XHRcdHVzZXJfZGF0YT0nPEgyPtCR0LDQu9Cw0L3RgSDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y8gJyt1c2VyWydlbWFpbCddKycgKCcrdXNlclsndWlkJ10rJykg0L7QsdC90L7QstC70LXQvTwvSDI+JztcclxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRhYmxlIGNsYXNzPSd0YWJsZSB0YWJsZS1zdW0nPlwiXHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0cj5cIlxyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGg+PC90aD5cIjtcclxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRoPtCh0YLQsNGA0YvQtSDQtNCw0L3QvdGL0LU8L3RoPlwiO1xyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGg+0J3QvtCy0YvQtSDQtNCw0L3QvdGL0LU8L3RoPlwiO1xyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8L3RyPlwiXHJcblxyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dHI+XCJcclxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRkPtCSINC+0LbQuNC00LDQvdC40LggKNC60L7Quy3QstC+KTwvdGQ+XCI7XHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0ZCBjbGFzcz0ndmFsdWUnPlwiK3VzZXJbJ29sZCddWydjbnRfcGVuZGluZyddK1wiPC90ZD5cIjtcclxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRkIGNsYXNzPSd2YWx1ZSc+XCIrdXNlclsnbmV3J11bJ2NudF9wZW5kaW5nJ10rXCI8L3RkPlwiO1xyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8L3RyPlwiXHJcblxyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dHI+XCJcclxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRkPtCSINC+0LbQuNC00LDQvdC40LggKNGB0YPQvNC80LApPC90ZD5cIjtcclxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRkIGNsYXNzPSd2YWx1ZSc+XCIrdXNlclsnb2xkJ11bJ3N1bV9wZW5kaW5nJ10rXCI8L3RkPlwiO1xyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQgY2xhc3M9J3ZhbHVlJz5cIit1c2VyWyduZXcnXVsnc3VtX3BlbmRpbmcnXStcIjwvdGQ+XCI7XHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjwvdHI+XCJcclxuXHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0cj5cIlxyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQ+0J7RgtC60LvQvtC90LXQvdC+ICjQutC+0Lst0LLQvik8L3RkPlwiO1xyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQgY2xhc3M9J3ZhbHVlJz5cIit1c2VyWydvbGQnXVsnY250X2RlY2xpbmVkJ10rXCI8L3RkPlwiO1xyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQgY2xhc3M9J3ZhbHVlJz5cIit1c2VyWyduZXcnXVsnY250X2RlY2xpbmVkJ10rXCI8L3RkPlwiO1xyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8L3RyPlwiXHJcblxyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dHI+XCJcclxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRkPtCe0YLQutC70L7QvdC10L3QviAo0YHRg9C80LzQsCk8L3RkPlwiO1xyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQgY2xhc3M9J3ZhbHVlJz5cIit1c2VyWydvbGQnXVsnc3VtX2RlY2xpbmVkJ10rXCI8L3RkPlwiO1xyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQgY2xhc3M9J3ZhbHVlJz5cIit1c2VyWyduZXcnXVsnc3VtX2RlY2xpbmVkJ10rXCI8L3RkPlwiO1xyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8L3RyPlwiXHJcblxyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dHI+XCJcclxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRkPtCf0L7QtNGC0LLQtdGA0LbQtNC10L3QviAo0LrQvtC7LdCy0L4pPC90ZD5cIjtcclxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRkIGNsYXNzPSd2YWx1ZSc+XCIrdXNlclsnb2xkJ11bJ2NudF9jb25maXJtZWQnXStcIjwvdGQ+XCI7XHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0ZCBjbGFzcz0ndmFsdWUnPlwiK3VzZXJbJ25ldyddWydjbnRfY29uZmlybWVkJ10rXCI8L3RkPlwiO1xyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8L3RyPlwiXHJcblxyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dHI+XCJcclxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRkPtCf0L7QtNGC0LLQtdGA0LbQtNC10L3QviAo0YHRg9C80LzQsCk8L3RkPlwiO1xyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQgY2xhc3M9J3ZhbHVlJz5cIit1c2VyWydvbGQnXVsnc3VtX2NvbmZpcm1lZCddK1wiPC90ZD5cIjtcclxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRkIGNsYXNzPSd2YWx1ZSc+XCIrdXNlclsnbmV3J11bJ3N1bV9jb25maXJtZWQnXStcIjwvdGQ+XCI7XHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjwvdHI+XCJcclxuXHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0cj5cIlxyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQ+0JHQsNC70LDQvdGBICjQvtCx0YnQuNC5KTwvdGQ+XCI7XHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0ZCBjbGFzcz0ndmFsdWUnPlwiK3VzZXJbJ29sZCddWydiYWxhbnMnXStcIjwvdGQ+XCI7XHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0ZCBjbGFzcz0ndmFsdWUnPlwiK3VzZXJbJ25ldyddWydiYWxhbnMnXStcIjwvdGQ+XCI7XHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjwvdHI+XCJcclxuXHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjwvdGFibGU+XCJcclxuXHRcdFx0XHQkKCcudXNlcl9kYXRhJykuaHRtbCh1c2VyX2RhdGEpO1xyXG5cdFx0XHR9XHJcblx0XHR9LCdqc29uJykuZmFpbChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGFkLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XHJcblx0XHRcdGFsZXJ0KCfQntGI0LjQsdC60LAg0L7QsdGA0LDQsdC+0YLQutC4INC30LDQv9GA0L7RgdCwJylcclxuXHRcdH0pO1xyXG5cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9KVxyXG59KTsiLCJ2YXIgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XHJcbnNjcmlwdC5vbmxvYWQ9aW5pdEVkaXRvcjtcclxuc2NyaXB0LnNyYyA9IFwiL3BsdWdpbnMvdGlueW1jZS90aW55bWNlLm1pbi5qc1wiO1xyXG5zY3JpcHQuYXN5bmMgPSB0cnVlO1xyXG5kb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7XHJcblxyXG5mdW5jdGlvbiBpbml0RWRpdG9yKCl7XHJcbiAgdGlueW1jZS5pbml0KHtcclxuICAgIHNlbGVjdG9yOicudmlzdWFsX2VkaXRvcicsXHJcbiAgICBoZWlnaHQ6IDUwMCxcclxuICAgIHRoZW1lOiAnbW9kZXJuJyxcclxuICAgIHJlbGF0aXZlX3VybHM6ZmFsc2UsXHJcbiAgICByZW1vdmVfc2NyaXB0X2hvc3QgOiBmYWxzZSxcclxuICAgIGRvY3VtZW50X2Jhc2VfdXJsIDogXCJodHRwczovL3NlY3JldGRpc2NvdW50ZXIucnUvXCIsXHJcbiAgICBmb3JjZWRfcm9vdF9ibG9jazogZmFsc2UsXHJcbiAgICBwbHVnaW5zOiBbXHJcbiAgICAgICdhZHZsaXN0IGF1dG9saW5rIGxpc3RzIGxpbmsgaW1hZ2UgY2hhcm1hcCBociBhbmNob3IgcGFnZWJyZWFrIGFjY29yZGlvbiBjbGVhcl9icicsXHJcbiAgICAgICdzZWFyY2hyZXBsYWNlIHdvcmRjb3VudCB2aXN1YWxibG9ja3MgdmlzdWFsY2hhcnMgY29kZSBmdWxsc2NyZWVuJyxcclxuICAgICAgJ2luc2VydGRhdGV0aW1lIG1lZGlhIG5vbmJyZWFraW5nIHNhdmUgdGFibGUgY29udGV4dG1lbnUgZGlyZWN0aW9uYWxpdHknLFxyXG4gICAgICAnZW1vdGljb25zIHRlbXBsYXRlIHBhc3RlIHRleHRjb2xvciBjb2xvcnBpY2tlciB0ZXh0cGF0dGVybiBpbWFnZXRvb2xzICB0b2MgaGVscCBjb2RlIGZpbGVtYW5hZ2VyIHJlc3BvbnNpdmVmaWxlbWFuYWdlcidcclxuICAgIF0sXHJcbiAgICBleHRlcm5hbF9maWxlbWFuYWdlcl9wYXRoOidwbHVnaW5zL3RpbnltY2UvcGx1Z2lucy9yZXNwb25zaXZlZmlsZW1hbmFnZXIvZmlsZW1hbmFnZXIvJyxcclxuICAgIGV4dGVybmFsX3BsdWdpbnM6IHtcclxuICAgICAgJ2ZpbGVtYW5hZ2VyJzogJ3BsdWdpbnMvcmVzcG9uc2l2ZWZpbGVtYW5hZ2VyL2ZpbGVtYW5hZ2VyL3BsdWdpbi5taW4uanMnLFxyXG4gICAgICAncmVzcG9uc2l2ZWZpbGVtYW5hZ2VyJzogJ3BsdWdpbnMvcmVzcG9uc2l2ZWZpbGVtYW5hZ2VyL2ZpbGVtYW5hZ2VyL3BsdWdpbi5taW4uanMnXHJcbiAgICB9LFxyXG4gICAgdG9vbGJhcjE6ICd1bmRvIHJlZG8gfCBzdHlsZXNlbGVjdCB8IGJvbGQgaXRhbGljIHwgYWxpZ25sZWZ0IGFsaWduY2VudGVyIGFsaWducmlnaHQgYWxpZ25qdXN0aWZ5IHwgYnVsbGlzdCBudW1saXN0IG91dGRlbnQgaW5kZW50IHwgbGluayBpbWFnZSB8IG1lZGlhIHwgZm9yZWNvbG9yIGJhY2tjb2xvciB8IGFjY29yZGlvbiB8IGNsZWFyX2JyIHwgY29kZSBoZWxwICcsXHJcblxyXG4gICAgLy9maWxlX2Jyb3dzZXJfY2FsbGJhY2s6IFJveHlGaWxlQnJvd3NlcixcclxuXHJcblxyXG4gICAgaW1hZ2VfYWR2dGFiOiB0cnVlLFxyXG4gICAgY29udGVudF9jc3MgOiBcIi9wbHVnaW5zL3RpbnltY2UvY29udGVudC5jc3NcIixcclxuICAgIHN0eWxlX2Zvcm1hdHM6IFtcclxuICAgICAgeyB0aXRsZTogJ0hlYWRlcnMnLCBpdGVtczogW1xyXG4gICAgICAgIHsgdGl0bGU6ICdoMScsIGJsb2NrOiAnaDEnIH0sXHJcbiAgICAgICAgeyB0aXRsZTogJ2gyJywgYmxvY2s6ICdoMicgfSxcclxuICAgICAgICB7IHRpdGxlOiAnaDMnLCBibG9jazogJ2gzJyB9LFxyXG4gICAgICAgIHsgdGl0bGU6ICdoNCcsIGJsb2NrOiAnaDQnIH0sXHJcbiAgICAgICAgeyB0aXRsZTogJ2g1JywgYmxvY2s6ICdoNScgfSxcclxuICAgICAgICB7IHRpdGxlOiAnaDYnLCBibG9jazogJ2g2JyB9XHJcbiAgICAgIF0gfSxcclxuXHJcbiAgICAgIHsgdGl0bGU6ICdCbG9ja3MnLCBpdGVtczogW1xyXG4gICAgICAgIHsgdGl0bGU6ICdwJywgYmxvY2s6ICdwJyB9LFxyXG4gICAgICAgIHsgdGl0bGU6ICdkaXYnLCBibG9jazogJ2RpdicgfSxcclxuICAgICAgICB7IHRpdGxlOiAncHJlJywgYmxvY2s6ICdwcmUnIH1cclxuICAgICAgXSB9LFxyXG5cclxuICAgICAgeyB0aXRsZTogJ0NvbnRhaW5lcnMnLCBpdGVtczogW1xyXG4gICAgICAgIHsgdGl0bGU6ICdzZWN0aW9uJywgYmxvY2s6ICdzZWN0aW9uJywgd3JhcHBlcjogdHJ1ZSwgbWVyZ2Vfc2libGluZ3M6IGZhbHNlIH0sXHJcbiAgICAgICAgeyB0aXRsZTogJ2FydGljbGUnLCBibG9jazogJ2FydGljbGUnLCB3cmFwcGVyOiB0cnVlLCBtZXJnZV9zaWJsaW5nczogZmFsc2UgfSxcclxuICAgICAgICB7IHRpdGxlOiAnYmxvY2txdW90ZScsIGJsb2NrOiAnYmxvY2txdW90ZScsIHdyYXBwZXI6IHRydWUgfSxcclxuICAgICAgICB7IHRpdGxlOiAnaGdyb3VwJywgYmxvY2s6ICdoZ3JvdXAnLCB3cmFwcGVyOiB0cnVlIH0sXHJcbiAgICAgICAgeyB0aXRsZTogJ2FzaWRlJywgYmxvY2s6ICdhc2lkZScsIHdyYXBwZXI6IHRydWUgfSxcclxuICAgICAgICB7IHRpdGxlOiAnZmlndXJlJywgYmxvY2s6ICdmaWd1cmUnLCB3cmFwcGVyOiB0cnVlIH1cclxuICAgICAgXSB9XHJcbiAgICBdXHJcbiAgfSk7XHJcbiAgXHJcbiAgZnVuY3Rpb24gUm94eUZpbGVCcm93c2VyKGZpZWxkX25hbWUsIHVybCwgdHlwZSwgd2luKSB7XHJcbiAgICB2YXIgcm94eUZpbGVtYW4gPSAnL3BsdWdpbnMvZmlsZW1hbi9pbmRleC5odG1sJztcclxuICAgIGlmIChyb3h5RmlsZW1hbi5pbmRleE9mKFwiP1wiKSA8IDApIHtcclxuICAgICAgcm94eUZpbGVtYW4gKz0gXCI/dHlwZT1cIiArIHR5cGU7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcm94eUZpbGVtYW4gKz0gXCImdHlwZT1cIiArIHR5cGU7XHJcbiAgICB9XHJcbiAgICByb3h5RmlsZW1hbiArPSAnJmlucHV0PScgKyBmaWVsZF9uYW1lICsgJyZ2YWx1ZT0nICsgd2luLmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGZpZWxkX25hbWUpLnZhbHVlO1xyXG4gICAgaWYodGlueU1DRS5hY3RpdmVFZGl0b3Iuc2V0dGluZ3MubGFuZ3VhZ2Upe1xyXG4gICAgICByb3h5RmlsZW1hbiArPSAnJmxhbmdDb2RlPScgKyB0aW55TUNFLmFjdGl2ZUVkaXRvci5zZXR0aW5ncy5sYW5ndWFnZTtcclxuICAgIH1cclxuICAgIHRpbnlNQ0UuYWN0aXZlRWRpdG9yLndpbmRvd01hbmFnZXIub3Blbih7XHJcbiAgICAgIGZpbGU6IHJveHlGaWxlbWFuLFxyXG4gICAgICB0aXRsZTogJ1JveHkgRmlsZW1hbicsXHJcbiAgICAgIHdpZHRoOiA4NTAsXHJcbiAgICAgIGhlaWdodDogNjUwLFxyXG4gICAgICByZXNpemFibGU6IFwieWVzXCIsXHJcbiAgICAgIHBsdWdpbnM6IFwibWVkaWFcIixcclxuICAgICAgaW5saW5lOiBcInllc1wiLFxyXG4gICAgICBjbG9zZV9wcmV2aW91czogXCJub1wiXHJcbiAgICB9LCB7ICAgICB3aW5kb3c6IHdpbiwgICAgIGlucHV0OiBmaWVsZF9uYW1lICAgIH0pO1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICBmdW5jdGlvbiBGaWxlU2VsZWN0ZWQoZmlsZSl7XHJcbiAgICAvKipcclxuICAgICAqIGZpbGUgaXMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgZm9sbG93aW5nIHByb3BlcnRpZXM6XHJcbiAgICAgKlxyXG4gICAgICogZnVsbFBhdGggLSBwYXRoIHRvIHRoZSBmaWxlIC0gYWJzb2x1dGUgZnJvbSB5b3VyIHNpdGUgcm9vdFxyXG4gICAgICogcGF0aCAtIGRpcmVjdG9yeSBpbiB3aGljaCB0aGUgZmlsZSBpcyBsb2NhdGVkIC0gYWJzb2x1dGUgZnJvbSB5b3VyIHNpdGUgcm9vdFxyXG4gICAgICogc2l6ZSAtIHNpemUgb2YgdGhlIGZpbGUgaW4gYnl0ZXNcclxuICAgICAqIHRpbWUgLSB0aW1lc3RhbW8gb2YgbGFzdCBtb2RpZmljYXRpb25cclxuICAgICAqIG5hbWUgLSBmaWxlIG5hbWVcclxuICAgICAqIGV4dCAtIGZpbGUgZXh0ZW5zaW9uXHJcbiAgICAgKiB3aWR0aCAtIGlmIHRoZSBmaWxlIGlzIGltYWdlLCB0aGlzIHdpbGwgYmUgdGhlIHdpZHRoIG9mIHRoZSBvcmlnaW5hbCBpbWFnZSwgMCBvdGhlcndpc2VcclxuICAgICAqIGhlaWdodCAtIGlmIHRoZSBmaWxlIGlzIGltYWdlLCB0aGlzIHdpbGwgYmUgdGhlIGhlaWdodCBvZiB0aGUgb3JpZ2luYWwgaW1hZ2UsIDAgb3RoZXJ3aXNlXHJcbiAgICAgKlxyXG4gICAgICovXHJcbiAgICAgIC8vIEdldCB0aGUgSUQgb2YgdGhlIGlucHV0IHRvIGZpbGxcclxuICAgIHZhciBmaWVsZElkID0gUm94eVV0aWxzLkdldFVybFBhcmFtKCd0eHRGaWVsZElkJyk7XHJcbiAgICAkKHdpbmRvdy5wYXJlbnQuZG9jdW1lbnQpLmZpbmQoJyMnICsgZmllbGRJZCkuYXR0cigndmFsdWUnLCBmaWxlLmZ1bGxQYXRoKTtcclxuICAgIHdpbmRvdy5wYXJlbnQuY2xvc2VDdXN0b21Sb3h5MigpO1xyXG4gIH1cclxuICBpbml0SW1hZ2VTZXJ2ZXJTZWxlY3QoJCgnLmZpbGVTZXJ2ZXJTZWxlY3QnKSk7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBpbml0SW1hZ2VTZXJ2ZXJTZWxlY3QoZWxzKXtcclxuICBpZihlbHMubGVuZ3RoPT0wKXJldHVybjtcclxuICBlbHMud3JhcCgnPGRpdiBjbGFzcz1cInNlbGVjdF9pbWdcIj4nKTtcclxuICBlbHM9ZWxzLnBhcmVudCgpO1xyXG4gIGVscy5hcHBlbmQoJzxidXR0b24gdHlwZT1cImJ1dHRvblwiPjxpIGNsYXNzPVwibWNlLWljbyBtY2UtaS1icm93c2VcIj48L2k+PC9idXR0b24+Jyk7XHJcbiAgZWxzLmZpbmQoJ2J1dHRvbicpLm9uKCdjbGljaycsb3BlbkN1c3RvbVJveHkyKTtcclxuXHJcbiAgaWYoJCgnI3JveHlDdXN0b21QYW5lbDInKS5sZW5ndGg9PTApe1xyXG4gICAgYnJvd3NlckJsaz0nPGRpdiBpZD1cInJveHlDdXN0b21QYW5lbDJcIiBzdHlsZT1cImRpc3BsYXlfOiBub25lO1wiPic7XHJcbiAgICBicm93c2VyQmxrKz0nPGRpdj4nO1xyXG4gICAgYnJvd3NlckJsays9JzxzcGFuIGNsYXNzPVwiY2xvc2VcIj48L3NwYW4+JztcclxuICAgIGJyb3dzZXJCbGsrPSc8aWZyYW1lIHNyYz1cIi9wbHVnaW5zL2ZpbGVtYW4vaW5kZXguaHRtbD9pbnRlZ3JhdGlvbj1jdXN0b20mdHlwZT1pbWFnZVwiIHN0eWxlPVwid2lkdGg6MTAwJTtoZWlnaHQ6MTAwJVwiIGZyYW1lYm9yZGVyPVwiMFwiPic7XHJcbiAgICBicm93c2VyQmxrKz0nPC9pZnJhbWU+JztcclxuICAgIGJyb3dzZXJCbGsrPSc8L2Rpdj4nO1xyXG4gICAgYnJvd3NlckJsays9JzwvZGl2Pic7XHJcbiAgICAkKCdib2R5JykuYXBwZW5kKGJyb3dzZXJCbGspO1xyXG4gICAgJCgnI3JveHlDdXN0b21QYW5lbDIgLmNsb3NlJykuY2xpY2soZnVuY3Rpb24oKXtcclxuICAgICAgJCgnI3JveHlDdXN0b21QYW5lbDInKS5yZW1vdmVDbGFzcygnb3BlbicpXHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gb3BlbkN1c3RvbVJveHkyKCl7XHJcbiAgY2xvc2VDdXN0b21Sb3h5Mj1jbG9zZUN1c3RvbVJveHkuYmluZCh0aGlzKVxyXG4gICQoJyNyb3h5Q3VzdG9tUGFuZWwyJykuYWRkQ2xhc3MoJ29wZW4nKVxyXG59XHJcbnZhciBjbG9zZUN1c3RvbVJveHkyO1xyXG5mdW5jdGlvbiBjbG9zZUN1c3RvbVJveHkoaW1nKXtcclxuICBpZihpbWcpIHtcclxuICAgICQodGhpcykucGFyZW50KCkuZmluZCgnaW5wdXQnKS52YWwoaW1nKTtcclxuICB9XHJcbiAgJCgnI3JveHlDdXN0b21QYW5lbDIgLmNsb3NlJykuY2xpY2soKVxyXG59IiwiOyhmdW5jdGlvbigkKXtcclxuXHJcbiAgZnVuY3Rpb24gYWpheF9zYXZlKGVsZW1lbnQpe1xyXG4gICAgdGhpcy5pbml0KGVsZW1lbnQpO1xyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIGNsZWFyQ2xhc3MoKXtcclxuICAgIHZhciBvcHRpb25zPXRoaXM7XHJcbiAgICBvcHRpb25zLnRoaXMucGFyZW50KCkucmVtb3ZlQ2xhc3MoJ2FqYXhTYXZpbmdGYWlsZWQnKTtcclxuICAgIG9wdGlvbnMudGhpcy5wYXJlbnQoKS5yZW1vdmVDbGFzcygnYWpheFNhdmluZ09rJyk7XHJcbiAgfVxyXG5cclxuICBhamF4X3NhdmUucHJvdG90eXBlLmluaXQ9ZnVuY3Rpb24oZWxlbWVudCl7XHJcbiAgICB0YWdOYW1lPWVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgZWxlbWVudD0kKGVsZW1lbnQpO1xyXG4gICAgaWYodGFnTmFtZT09XCJpbnB1dFwiIHx8IHRhZ05hbWU9PVwic2VsZWN0XCIpe1xyXG4gICAgICBvYmo9ZWxlbWVudDtcclxuICAgIH1lbHNle1xyXG4gICAgICBvYmo9ZWxlbWVudC5maW5kKCdpbnB1dCxzZWxlY3QnKTtcclxuICAgIH1cclxuXHJcbiAgICBwb3N0X3VybD1lbGVtZW50LmF0dHIoJ3NhdmVfdXJsJyk7XHJcbiAgICB1aWQ9ZWxlbWVudC5hdHRyKCd1aWQnKTtcclxuXHJcbiAgICBmb3IodmFyIGk9MDtpPG9iai5sZW5ndGg7aSsrKXtcclxuICAgICAgdmFyIG9wdGlvbnM9e1xyXG4gICAgICAgIHVybDpwb3N0X3VybCxcclxuICAgICAgICBpZDp1aWQsXHJcbiAgICAgICAgdGhpczpvYmouZXEoaSlcclxuICAgICAgfTtcclxuXHJcbiAgICAgIG9wdGlvbnMudGhpc1xyXG4gICAgICAgIC5vZmYoJ2NoYW5nZScpXHJcbiAgICAgICAgLm9uKCdjaGFuZ2UnLGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIG9wdGlvbnM9dGhpcztcclxuICAgICAgICB2YXIgdmFsPW9wdGlvbnMudGhpcy52YWwoKTtcclxuICAgICAgICB2YXIgdHlwZT1vcHRpb25zLnRoaXMuYXR0cigndHlwZScpO1xyXG4gICAgICAgIGlmKHR5cGUgJiYgdHlwZS50b0xvd2VyQ2FzZSgpPT0nY2hlY2tib3gnKXtcclxuICAgICAgICAgIGlmKCFvcHRpb25zLnRoaXMucHJvcCgnY2hlY2tlZCcpKXtcclxuICAgICAgICAgICAgdmFsPTA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBwb3N0PXtcclxuICAgICAgICAgIGlkOm9wdGlvbnMuaWQsXHJcbiAgICAgICAgICB2YWx1ZTp2YWwsXHJcbiAgICAgICAgICBuYW1lOm9wdGlvbnMudGhpcy5hdHRyKCduYW1lJylcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBvcHRpb25zLnRoaXMucGFyZW50KCkuYWRkQ2xhc3MoJ2FqYXhJblNhdmluZycpO1xyXG4gICAgICAgICQucG9zdChvcHRpb25zLnVybCxwb3N0LGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICB2YXIgb3B0aW9ucz10aGlzO1xyXG4gICAgICAgICAgb3B0aW9ucy50aGlzLnBhcmVudCgpLnJlbW92ZUNsYXNzKCdhamF4SW5TYXZpbmcnKTtcclxuICAgICAgICAgIG9wdGlvbnMudGhpcy5wYXJlbnQoKS5hZGRDbGFzcygnYWpheFNhdmluZ09rJyk7XHJcbiAgICAgICAgICBzZXRUaW1lb3V0KGNsZWFyQ2xhc3MuYmluZChvcHRpb25zKSwzMDAwKVxyXG4gICAgICAgIH0uYmluZChvcHRpb25zKSkuZmFpbChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgdmFyIG9wdGlvbnM9dGhpcztcclxuICAgICAgICAgIG9wdGlvbnMudGhpcy5wYXJlbnQoKS5yZW1vdmVDbGFzcygnYWpheEluU2F2aW5nJyk7XHJcbiAgICAgICAgICBvcHRpb25zLnRoaXMucGFyZW50KCkuYWRkQ2xhc3MoJ2FqYXhTYXZpbmdGYWlsZWQnKTtcclxuICAgICAgICAgIHNldFRpbWVvdXQoY2xlYXJDbGFzcy5iaW5kKG9wdGlvbnMpLDQwMDApXHJcbiAgICAgICAgfS5iaW5kKG9wdGlvbnMpKVxyXG4gICAgICB9LmJpbmQob3B0aW9ucykpXHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJC5mbi5hamF4X3NhdmU9ZnVuY3Rpb24oKXtcclxuICAgICQodGhpcykuZWFjaChmdW5jdGlvbigpe1xyXG4gICAgICBuZXcgYWpheF9zYXZlKHRoaXMpO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG59KShqUXVlcnkpO1xyXG4kKCcuYWpheF9zYXZlJykuYWpheF9zYXZlKCk7IiwiO1xyXG4kKGZ1bmN0aW9uKCkge1xyXG4gIGZ1bmN0aW9uIG9uUmVtb3ZlKCl7XHJcbiAgICAkdGhpcz0kKHRoaXMpO1xyXG4gICAgcG9zdD17XHJcbiAgICAgIGlkOiR0aGlzLmF0dHIoJ3VpZCcpLFxyXG4gICAgICB0eXBlOiR0aGlzLmF0dHIoJ21vZGUnKVxyXG4gICAgfTtcclxuICAgICQucG9zdCgkdGhpcy5hdHRyKCd1cmwnKSxwb3N0LGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICBpZihkYXRhICYmIGRhdGE9PSdlcnInKXtcclxuICAgICAgICBtc2c9JHRoaXMuZGF0YSgncmVtb3ZlLWVycm9yJyk7XHJcbiAgICAgICAgaWYoIW1zZyl7XHJcbiAgICAgICAgICBtc2c9J9Cd0LXQstC+0LfQvNC+0LbQvdC+INGD0LTQsNC70LjRgtGMINGN0LvQtdC80LXQvdGCJztcclxuICAgICAgICB9XHJcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTptc2csdHlwZTonZXJyJ30pO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbW9kZT0kdGhpcy5hdHRyKCdtb2RlJyk7XHJcbiAgICAgIGlmKCFtb2RlKXtcclxuICAgICAgICBtb2RlPSdybSc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmKG1vZGU9PSdybScpIHtcclxuICAgICAgICBybSA9ICR0aGlzLmNsb3Nlc3QoJy50b19yZW1vdmUnKTtcclxuICAgICAgICBybV9jbGFzcyA9IHJtLmF0dHIoJ3JtX2NsYXNzJyk7XHJcbiAgICAgICAgaWYgKHJtX2NsYXNzKSB7XHJcbiAgICAgICAgICAkKHJtX2NsYXNzKS5yZW1vdmUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJtLnJlbW92ZSgpO1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Cj0YHQv9C10YjQvdC+0LUg0YPQtNCw0LvQtdC90LjQtS4nLHR5cGU6J2luZm8nfSlcclxuICAgICAgfVxyXG4gICAgICBpZihtb2RlPT0ncmVsb2FkJyl7XHJcbiAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgbG9jYXRpb24uaHJlZj1sb2NhdGlvbi5ocmVmO1xyXG4gICAgICB9XHJcbiAgICB9KS5mYWlsKGZ1bmN0aW9uKCl7XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Ce0YjQuNCx0LrQsCDRg9C00LDQu9C90LjRjycsdHlwZTonZXJyJ30pO1xyXG4gICAgfSlcclxuICB9XHJcblxyXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCcuYWpheF9yZW1vdmUnLGZ1bmN0aW9uKCl7XHJcbiAgICBub3RpZmljYXRpb24uY29uZmlybSh7XHJcbiAgICAgIGNhbGxiYWNrWWVzOm9uUmVtb3ZlLFxyXG4gICAgICBvYmo6JCh0aGlzKVxyXG4gICAgfSlcclxuICB9KTtcclxuXHJcbn0pO1xyXG5cclxuIiwiLy8kKHdpbmRvdykubG9hZChmdW5jdGlvbigpIHtcclxuXHJcbnZhciBhY2NvcmRpb25Db250cm9sID0gJCgnLmFjY29yZGlvbiAuYWNjb3JkaW9uLWNvbnRyb2wnKTtcclxuXHJcbmFjY29yZGlvbkNvbnRyb2wub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICR0aGlzID0gJCh0aGlzKTtcclxuICAgICRhY2NvcmRpb24gPSAkdGhpcy5jbG9zZXN0KCcuYWNjb3JkaW9uJyk7XHJcblxyXG4gICAgaWYgKCRhY2NvcmRpb24uaGFzQ2xhc3MoJ29wZW4nKSkge1xyXG4gICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLmhpZGUoMzAwKTtcclxuICAgICAgJGFjY29yZGlvbi5yZW1vdmVDbGFzcygnb3BlbicpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAkYWNjb3JkaW9uLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLnNob3coMzAwKTtcclxuICAgICAgJGFjY29yZGlvbi5hZGRDbGFzcygnb3BlbicpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSk7XHJcbmFjY29yZGlvbkNvbnRyb2wuc2hvdygpO1xyXG4vL30pXHJcblxyXG5vYmplY3RzID0gZnVuY3Rpb24gKGEsYikge1xyXG4gIHZhciBjID0gYixcclxuICAgIGtleTtcclxuICBmb3IgKGtleSBpbiBhKSB7XHJcbiAgICBpZiAoYS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgIGNba2V5XSA9IGtleSBpbiBiID8gYltrZXldIDogYVtrZXldO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gYztcclxufTtcclxuXHJcbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCl7XHJcbiAgICBkYXRhPXRoaXM7XHJcbiAgICBpZihkYXRhLnR5cGU9PTApIHtcclxuICAgICAgZGF0YS5pbWcuYXR0cignc3JjJywgZGF0YS5zcmMpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIGRhdGEuaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJytkYXRhLnNyYysnKScpO1xyXG4gICAgICBkYXRhLmltZy5yZW1vdmVDbGFzcygnbm9fYXZhJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvL9GC0LXRgdGCINC70L7Qs9C+INC80LDQs9Cw0LfQuNC90LBcclxuICBpbWdzPSQoJ3NlY3Rpb246bm90KC5uYXZpZ2F0aW9uKScpLmZpbmQoJy5sb2dvIGltZycpO1xyXG4gIGZvciAodmFyIGk9MDtpPGltZ3MubGVuZ3RoO2krKyl7XHJcbiAgICBpbWc9aW1ncy5lcShpKTtcclxuICAgIHNyYz1pbWcuYXR0cignc3JjJyk7XHJcbiAgICBpbWcuYXR0cignc3JjJywnL2ltYWdlcy90ZW1wbGF0ZS1sb2dvLmpwZycpO1xyXG4gICAgZGF0YT17XHJcbiAgICAgIHNyYzpzcmMsXHJcbiAgICAgIGltZzppbWcsXHJcbiAgICAgIHR5cGU6MCAvLyDQtNC70Y8gaW1nW3NyY11cclxuICAgIH07XHJcbiAgICBpbWFnZT0kKCc8aW1nLz4nLHtcclxuICAgICAgc3JjOnNyY1xyXG4gICAgfSkub24oJ2xvYWQnLGltZ19sb2FkX2ZpbmlzaC5iaW5kKGRhdGEpKVxyXG4gIH1cclxuXHJcbiAgLy/RgtC10YHRgiDQsNCy0LDRgtCw0YDQvtC6INCyINC60L7QvNC10L3RgtCw0YDQuNGP0YVcclxuICBpbWdzPSQoJy5jb21tZW50LXBob3RvJyk7XHJcbiAgZm9yICh2YXIgaT0wO2k8aW1ncy5sZW5ndGg7aSsrKXtcclxuICAgIGltZz1pbWdzLmVxKGkpO1xyXG4gICAgaWYoaW1nLmhhc0NsYXNzKCdub19hdmEnKSl7XHJcbiAgICAgIGNvbnRpbnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHNyYz1pbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJyk7XHJcbiAgICBzcmM9c3JjLnJlcGxhY2UoJ3VybChcIicsJycpO1xyXG4gICAgc3JjPXNyYy5yZXBsYWNlKCdcIiknLCcnKTtcclxuICAgIGltZy5hZGRDbGFzcygnbm9fYXZhJyk7XHJcblxyXG4gICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgvaW1hZ2VzL25vX2F2YS5wbmcpJyk7XHJcbiAgICBkYXRhPXtcclxuICAgICAgc3JjOnNyYyxcclxuICAgICAgaW1nOmltZyxcclxuICAgICAgdHlwZToxIC8vINC00LvRjyDRhNC+0L3QvtCy0YvRhSDQutCw0YDRgtC40L3QvtC6XHJcbiAgICB9O1xyXG4gICAgaW1hZ2U9JCgnPGltZy8+Jyx7XHJcbiAgICAgIHNyYzpzcmNcclxuICAgIH0pLm9uKCdsb2FkJyxpbWdfbG9hZF9maW5pc2guYmluZChkYXRhKSlcclxuICB9XHJcbn0pO1xyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gIGVscz0kKCcuYWpheF9sb2FkJyk7XHJcbiAgZm9yKGk9MDtpPGVscy5sZW5ndGg7aSsrKXtcclxuICAgIGVsPWVscy5lcShpKTtcclxuICAgIHVybD1lbC5hdHRyKCdyZXMnKTtcclxuICAgICQuZ2V0KHVybCxmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAkdGhpcz0kKHRoaXMpO1xyXG4gICAgICAkdGhpcy5odG1sKGRhdGEpO1xyXG4gICAgICBhamF4Rm9ybSgkdGhpcyk7XHJcbiAgICB9LmJpbmQoZWwpKVxyXG4gIH1cclxufSkoKTtcclxuXHJcbiQoJ2lucHV0W3R5cGU9ZmlsZV0nKS5vbignY2hhbmdlJyxmdW5jdGlvbihldnQpe1xyXG4gIHZhciBmaWxlID0gZXZ0LnRhcmdldC5maWxlczsgLy8gRmlsZUxpc3Qgb2JqZWN0XHJcbiAgdmFyIGYgPSBmaWxlWzBdO1xyXG4gIC8vIE9ubHkgcHJvY2VzcyBpbWFnZSBmaWxlcy5cclxuICBpZiAoIWYudHlwZS5tYXRjaCgnaW1hZ2UuKicpKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG5cclxuICBkYXRhPSB7XHJcbiAgICAnZWwnOiB0aGlzLFxyXG4gICAgJ2YnOiBmXHJcbiAgfTtcclxuICByZWFkZXIub25sb2FkID0gKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbihlKSB7XHJcbiAgICAgIGltZz0kKCdbZm9yPVwiJytkYXRhLmVsLm5hbWUrJ1wiXScpO1xyXG4gICAgICBpZihpbWcubGVuZ3RoPjApe1xyXG4gICAgICAgIGltZy5hdHRyKCdzcmMnLGUudGFyZ2V0LnJlc3VsdClcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9KShkYXRhKTtcclxuICAvLyBSZWFkIGluIHRoZSBpbWFnZSBmaWxlIGFzIGEgZGF0YSBVUkwuXHJcbiAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZik7XHJcbn0pO1xyXG5cclxuJCgnYm9keScpLm9uKCdjbGljaycsJ2EuYWpheEZvcm1PcGVuJyxmdW5jdGlvbihlKXtcclxuICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgaHJlZj10aGlzLmhyZWYuc3BsaXQoJyMnKTtcclxuICBocmVmPWhyZWZbaHJlZi5sZW5ndGgtMV07XHJcblxyXG4gIGRhdGE9e1xyXG4gICAgYnV0dG9uWWVzOmZhbHNlLFxyXG4gICAgbm90eWZ5X2NsYXNzOlwibm90aWZ5X3doaXRlIGxvYWRpbmdcIixcclxuICAgIHF1ZXN0aW9uOicnXHJcbiAgfTtcclxuICBtb2RhbF9jbGFzcz0kKHRoaXMpLmRhdGEoJ21vZGFsLWNsYXNzJyk7XHJcblxyXG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxuICAkLmdldCgnLycraHJlZixmdW5jdGlvbihkYXRhKXtcclxuICAgICQoJy5ub3RpZnlfYm94JykucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgICQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpLmh0bWwoZGF0YS5odG1sKTtcclxuICAgIGFqYXhGb3JtKCQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpKTtcclxuICAgIGlmKG1vZGFsX2NsYXNzKXtcclxuICAgICAgJCgnLm5vdGlmeV9ib3ggLm5vdGlmeV9jb250ZW50IC5yb3cnKS5hZGRDbGFzcyhtb2RhbF9jbGFzcyk7XHJcbiAgICB9XHJcbiAgfSwnanNvbicpXHJcbn0pO1xyXG5cclxuJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoe1xyXG4gIGRlbGF5OiB7XHJcbiAgICBzaG93OiA1MDAsIGhpZGU6IDIwMDBcclxuICB9XHJcbn0pO1xyXG4kKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykub24oJ2NsaWNrJyxmdW5jdGlvbiAoZSkge1xyXG4gICR0aGlzPSQodGhpcyk7XHJcbiAgaWYoJHRoaXMuY2xvc2VzdCgndWwnKS5oYXNDbGFzcygncGFnaW5hdGUnKSkge1xyXG4gICAgLy/QtNC70Y8g0L/QsNCz0LjQvdCw0YbQuNC4INGB0YHRi9C70LrQsCDQtNC+0LvQttC90LAg0YDQsNCx0L7RgtCw0YLRjFxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gIGlmKCR0aGlzLmhhc0NsYXNzKCd3b3JrSHJlZicpKXtcclxuICAgIC8v0JXRgdC70Lgg0YHRgdGL0LvQutCwINC/0L7QvNC10YfQtdC90L3QsCDQutCw0Log0YDQsNCx0L7Rh9Cw0Y8g0YLQviDQvdGD0LbQvdC+INC/0LXRgNC10YXQvtC00LjRgtGMXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIHJldHVybiBmYWxzZTtcclxufSk7XHJcblxyXG5cclxuJCgnLmFqYXgtYWN0aW9uJykuY2xpY2soZnVuY3Rpb24oZSkge1xyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxuICB2YXIgc3RhdHVzID0gJCh0aGlzKS5kYXRhKCd2YWx1ZScpO1xyXG4gIHZhciBocmVmID0gJCh0aGlzKS5hdHRyKCdocmVmJyk7XHJcbiAgdmFyIGlkcyA9ICQoJyNncmlkLWFqYXgtYWN0aW9uJykueWlpR3JpZFZpZXcoJ2dldFNlbGVjdGVkUm93cycpO1xyXG4gIGlmIChpZHMubGVuZ3RoID4gMCkge1xyXG4gICAgaWYgKCFjb25maXJtKCfQn9C+0LTRgtCy0LXRgNC00LjRgtC1INC40LfQvNC10L3QtdC90LjQtSDQt9Cw0L/QuNGB0LXQuScpKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgJC5hamF4KHtcclxuICAgICAgdXJsOiBocmVmLFxyXG4gICAgICB0eXBlOiAncG9zdCcsXHJcbiAgICAgIGRhdGFUeXBlOiAnanNvbicsXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICBzdGF0dXM6IHN0YXR1cyxcclxuICAgICAgICBpZDogaWRzXHJcbiAgICAgIH1cclxuICAgIH0pLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAkKCcjZ3JpZC1hamF4LWFjdGlvbicpLnlpaUdyaWRWaWV3KFwiYXBwbHlGaWx0ZXJcIik7XHJcbiAgICAgIGlmIChkYXRhLmVycm9yICE9IGZhbHNlKSB7XHJcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0J/RgNC+0LjQt9C+0YjQu9CwINC+0YjQuNCx0LrQsCEnLHR5cGU6J2Vycid9KVxyXG4gICAgICB9XHJcbiAgICB9KS5mYWlsKGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOifQn9GA0L7QuNC30L7RiNC70LAg0L7RiNC40LHQutCwIScsdHlwZTonZXJyJ30pXHJcbiAgICB9KTtcclxuICB9IGVsc2Uge1xyXG4gICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0J3QtdC+0LHRhdC+0LTQuNC80L4g0LLRi9Cx0YDQsNGC0Ywg0Y3Qu9C10LzQtdC90YLRiyEnLHR5cGU6J2Vycid9KVxyXG4gIH1cclxufSk7XHJcblxyXG4kKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICQoJy5lZGl0aWJsZVtkaXNhYmxlZF0nKS5vbignY2xpY2snLGZ1bmN0aW9uICgpIHtcclxuICAgICQodGhpcykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSlcclxuICB9KVxyXG5cclxuICAkKCcuZWRpdGlibGVbZGlzYWJsZWRdJykub24oJ21vdXNlZG93bicsZnVuY3Rpb24gKCkge1xyXG4gICAgJCh0aGlzKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKVxyXG4gIH0pXHJcblxyXG4gIGJ0bj0nPGJ1dHRvbiBjbGFzcz11bmxvY2s+PGkgY2xhc3M9XCJmYSBmYS11bmxvY2sgZmEtNFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT48L2J1dHRvbj4nO1xyXG4gIGJ0bj0kKGJ0bik7XHJcbiAgYnRuLm9uKCdjbGljaycsZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICR0aGlzPSQodGhpcyk7XHJcbiAgICBpbnA9JHRoaXMucHJldigpO1xyXG4gICAgaW5wLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH0pO1xyXG4gICQoJy5lZGl0aWJsZVtkaXNhYmxlZF0nKS5hZnRlcihidG4pXHJcbn0pO1xyXG5cclxuJChmdW5jdGlvbigpIHtcclxuXHJcbiAgdmFyIG1lbnUgPSB7XHJcbiAgICBjb250cm9sOiB7XHJcbiAgICAgIGhlYWRlclN0b3Jlc01lbnU6ICQoXCIjdG9wXCIpLmZpbmQoXCIuc3VibWVudS1oYW5kbFwiKSxcclxuICAgICAgc3RvcmVzU3VibWVudXM6ICQoXCIjdG9wXCIpLmZpbmQoXCIuc3VibWVudS1oYW5kbFwiKS5maW5kKFwiLnN1Ym1lbnVcIiksXHJcbiAgICAgIGV2ZW50czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHNlbGYuaGVhZGVyU3RvcmVzTWVudS5ob3ZlcihmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHZhciBzdWJtZW51ID0gJCh0aGlzKS5maW5kKCcuc3VibWVudScpO1xyXG4gICAgICAgICAgaWYoJCh3aW5kb3cpLndpZHRoKCkgPiA5OTEpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYuc3RvcmVIaWRlKTtcclxuICAgICAgICAgICAgc2VsZi5zdG9yZXNTdWJtZW51cy5jc3MoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcclxuICAgICAgICAgICAgc2VsZi5zdG9yZVNob3cgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIHN1Ym1lbnUuY2xlYXJRdWV1ZSgpO1xyXG4gICAgICAgICAgICAgIHN1Ym1lbnUuY3NzKFwiZGlzcGxheVwiLCBcImJsb2NrXCIpLmFuaW1hdGUoe1wib3BhY2l0eVwiOiAxfSwgMzUwKTtcclxuICAgICAgICAgICAgICAvLyBzZWxmLnN0b3Jlc1N1Ym1lbnUuY2xlYXJRdWV1ZSgpO1xyXG4gICAgICAgICAgICAgIC8vIHNlbGYuc3RvcmVzU3VibWVudS5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIikuYW5pbWF0ZSh7XCJvcGFjaXR5XCI6IDF9LCAzNTApO1xyXG4gICAgICAgICAgICB9LCAyMDApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgdmFyIHN1Ym1lbnUgPSAkKHRoaXMpLmZpbmQoJy5zdWJtZW51Jyk7XHJcbiAgICAgICAgICBpZigkKHdpbmRvdykud2lkdGgoKSA+IDk5MSkge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoc2VsZi5zdG9yZVNob3cpO1xyXG4gICAgICAgICAgICBzZWxmLnN0b3JlSGlkZSA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgc3VibWVudS5jbGVhclF1ZXVlKCk7XHJcbiAgICAgICAgICAgICAgc3VibWVudS5hbmltYXRlKHtcIm9wYWNpdHlcIjogMH0sIDIwMCwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIC8vIHNlbGYuc3RvcmVzU3VibWVudS5jbGVhclF1ZXVlKCk7XHJcbiAgICAgICAgICAgICAgLy8gc2VsZi5zdG9yZXNTdWJtZW51LmFuaW1hdGUoe1wib3BhY2l0eVwiOiAwfSwgMjAwLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAvLyAgICAgJCh0aGlzKS5jc3MoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcclxuICAgICAgICAgICAgICAvLyB9KTtcclxuICAgICAgICAgICAgfSwgMzAwKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcbiAgbWVudS5jb250cm9sLmV2ZW50cygpO1xyXG59KTtcclxuXHJcbi8v0YfRgtC+INCxINC40YTRgNC10LnQvNGLINC4INC60LDRgNGC0LjQvdC60Lgg0L3QtSDQstGL0LvQsNC30LjQu9C4XHJcbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgLyptX3cgPSAkKCcudGV4dC1jb250ZW50Jykud2lkdGgoKVxyXG4gIGlmIChtX3cgPCA1MCltX3cgPSBzY3JlZW4ud2lkdGggLSA0MCovXHJcbiAgbXc9c2NyZWVuLndpZHRoLTQwO1xyXG4gIHAgPSAkKCcuY29udGFpbmVyIGltZywuY29udGFpbmVyIGlmcmFtZScpO1xyXG4gICQoJy5jb250YWluZXIgaW1nJykuaGVpZ2h0KCdhdXRvJyk7XHJcbiAgZm9yIChpID0gMDsgaSA8IHAubGVuZ3RoOyBpKyspIHtcclxuICAgIGVsID0gcC5lcShpKTtcclxuICAgIHZhciBwYXJlbnQgPSBlbC5wYXJlbnQoKTtcclxuICAgIGlmKHBhcmVudFswXS50YWdOYW1lPT1cIkFcIil7XHJcbiAgICAgIGNvbnRpbnVlO1xyXG4gICAgfVxyXG4gICAgbV93ID0gcGFyZW50LndpZHRoKCk7XHJcbiAgICBpZiAobV93ID4gbXcpbV93ID0gbXc7XHJcbiAgICBpZiAoZWwud2lkdGgoKSA+IG1fdykge1xyXG4gICAgICBrID0gZWwud2lkdGgoKSAvIG1fdztcclxuICAgICAgZWwuaGVpZ2h0KGVsLmhlaWdodCgpIC8gayk7XHJcbiAgICAgIGVsLndpZHRoKG1fdylcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuLy/QuNC30LHRgNCw0L3QvdC+0LVcclxuJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAkKFwiI3RvcCAuZmF2b3JpdGUtbGlua1wiKS5vbignY2xpY2snLGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHNlbGYgPSAkKHRoaXMpO1xyXG4gICAgdmFyIHR5cGUgPSBzZWxmLmF0dHIoXCJkYXRhLXN0YXRlXCIpLFxyXG4gICAgICBhZmZpbGlhdGVfaWQgPSBzZWxmLmF0dHIoXCJkYXRhLWFmZmlsaWF0ZS1pZFwiKTtcclxuICAgIGlmIChzZWxmLmhhc0NsYXNzKCdkaXNhYmxlZCcpKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgc2VsZi5hZGRDbGFzcygnZGlzYWJsZWQnKTtcclxuXHJcbiAgICBpZih0eXBlID09IFwiYWRkXCIpIHtcclxuICAgICAgc2VsZi5maW5kKFwiLmZhXCIpLnJlbW92ZUNsYXNzKFwibXV0ZWRcIik7XHJcbiAgICB9XHJcblxyXG4gICAgc2VsZi5maW5kKFwiLmZhXCIpLnJlbW92ZUNsYXNzKFwicHVsc2UyXCIpLmFkZENsYXNzKFwiZmEtc3BpblwiKTtcclxuXHJcbiAgICAkLnBvc3QoXCIvYWNjb3VudC9mYXZvcml0ZXNcIix7XHJcbiAgICAgIFwidHlwZVwiIDogdHlwZSAsXHJcbiAgICAgIFwiYWZmaWxpYXRlX2lkXCI6IGFmZmlsaWF0ZV9pZFxyXG4gICAgfSxmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICBzZWxmLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xyXG4gICAgICBpZihkYXRhLmVycm9yKXtcclxuICAgICAgICBzZWxmLmZpbmQoXCIuZmFcIikucmVtb3ZlQ2xhc3MoXCJmYS1zcGluXCIpO1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6ZGF0YS5lcnJvcix0eXBlOidlcnInLCd0aXRsZSc6KGRhdGEudGl0bGU/ZGF0YS50aXRsZTpmYWxzZSl9KTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe1xyXG4gICAgICAgIG1lc3NhZ2U6ZGF0YS5tc2csXHJcbiAgICAgICAgdHlwZTonc3VjY2VzcycsXHJcbiAgICAgICAgJ3RpdGxlJzooZGF0YS50aXRsZT9kYXRhLnRpdGxlOmZhbHNlKVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmKHR5cGUgPT0gXCJhZGRcIikge1xyXG4gICAgICAgIHNlbGYuZmluZChcIi5mYVwiKS5hZGRDbGFzcyhcIm11dGVkXCIpO1xyXG4gICAgICB9XHJcbiAgICAgIHNlbGYuZmluZChcIi5mYVwiKS5yZW1vdmVDbGFzcyhcImZhLXNwaW5cIik7XHJcblxyXG4gICAgICBzZWxmLmF0dHIoe1xyXG4gICAgICAgIFwiZGF0YS1zdGF0ZVwiOiBkYXRhW1wiZGF0YS1zdGF0ZVwiXSxcclxuICAgICAgICBcImRhdGEtb3JpZ2luYWwtdGl0bGVcIjogZGF0YVsnZGF0YS1vcmlnaW5hbC10aXRsZSddXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYodHlwZSA9PSBcImFkZFwiKSB7XHJcbiAgICAgICAgc2VsZi5maW5kKFwiLmZhXCIpLnJlbW92ZUNsYXNzKFwiZmEtc3BpbiBmYS1oZWFydC1vXCIpLmFkZENsYXNzKFwiZmEtaGVhcnRcIik7XHJcbiAgICAgIH0gZWxzZSBpZih0eXBlID09IFwiZGVsZXRlXCIpIHtcclxuICAgICAgICBzZWxmLmZpbmQoXCIuZmFcIikucmVtb3ZlQ2xhc3MoXCJmYS1zcGluIGZhLWhlYXJ0XCIpLmFkZENsYXNzKFwiZmEtaGVhcnQtbyBtdXRlZFwiKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0sJ2pzb24nKS5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICBzZWxmLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xyXG4gICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOlwiPGI+0KLQtdGF0L3QuNGH0LXRgdC60LjQtSDRgNCw0LHQvtGC0YshPC9iPjxicj7QkiDQtNCw0L3QvdGL0Lkg0LzQvtC80LXQvdGCINCy0YDQtdC80LXQvdC4XCIgK1xyXG4gICAgICBcIiDQv9GA0L7QuNC30LLQtdC00ZHQvdC90L7QtSDQtNC10LnRgdGC0LLQuNC1INC90LXQstC+0LfQvNC+0LbQvdC+LiDQn9C+0L/RgNC+0LHRg9C50YLQtSDQv9C+0LfQttC1LlwiICtcclxuICAgICAgXCIg0J/RgNC40L3QvtGB0LjQvCDRgdCy0L7QuCDQuNC30LLQuNC90LXQvdC40Y8g0LfQsCDQvdC10YPQtNC+0LHRgdGC0LLQvi5cIix0eXBlOidlcnInfSk7XHJcblxyXG4gICAgICBpZih0eXBlID09IFwiYWRkXCIpIHtcclxuICAgICAgICBzZWxmLmZpbmQoXCIuZmFcIikuYWRkQ2xhc3MoXCJtdXRlZFwiKTtcclxuICAgICAgfVxyXG4gICAgICBzZWxmLmZpbmQoXCIuZmFcIikucmVtb3ZlQ2xhc3MoXCJmYS1zcGluXCIpO1xyXG4gICAgfSlcclxuICB9KTtcclxufSk7XHJcblxyXG4vL9C10YHQu9C4INC+0YLQutGA0YvRgtC+INC60LDQuiDQtNC+0YfQtdGA0L3QtdC1XHJcbihmdW5jdGlvbigpe1xyXG4gIGlmKCF3aW5kb3cub3BlbmVyKXJldHVybjtcclxuICBpZihkb2N1bWVudC5yZWZlcnJlci5pbmRleE9mKCdzZWNyZXRkaXNjb3VudGVyJyk8MClyZXR1cm47XHJcblxyXG4gIGhyZWY9d2luZG93Lm9wZW5lci5sb2NhdGlvbi5ocmVmO1xyXG4gIGlmKFxyXG4gICAgaHJlZi5pbmRleE9mKCdzb2NpYWxzJyk+MCB8fFxyXG4gICAgaHJlZi5pbmRleE9mKCdsb2dpbicpPjAgfHxcclxuICAgIGhyZWYuaW5kZXhPZignYWRtaW4nKT4wIHx8XHJcbiAgICBocmVmLmluZGV4T2YoJ2FjY291bnQnKT4wXHJcbiAgKXtcclxuICAgIHJldHVybjtcclxuICB9XHJcbiAgaWYoaHJlZi5pbmRleE9mKCdzdG9yZScpPjAgfHwgaHJlZi5pbmRleE9mKCdjb3Vwb24nKT4wIHx8IGhyZWYuaW5kZXhPZignc2V0dGluZ3MnKT4wKXtcclxuICAgIHdpbmRvdy5vcGVuZXIubG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgfWVsc2V7XHJcbiAgICB3aW5kb3cub3BlbmVyLmxvY2F0aW9uLmhyZWY9bG9jYXRpb24uaHJlZjtcclxuICB9XHJcbiAgd2luZG93LmNsb3NlKCk7XHJcbn0pKCk7XHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcblxyXG4gIGZ1bmN0aW9uIGltZ19sb2FkX2ZpbmlzaCgpe1xyXG4gICAgdmFyIGRhdGE9dGhpcztcclxuICAgIHZhciBpbWcgPSBkYXRhLmltZztcclxuICAgIGltZy53cmFwKCc8ZGl2IGNsYXNzPVwiZG93bmxvYWRcIj48L2Rpdj4nKTtcclxuICAgIHZhciB3cmFwPWltZy5wYXJlbnQoKTtcclxuICAgICQoJ2JvZHknKS5hcHBlbmQoZGF0YS5lbCk7XHJcbiAgICBzaXplPWRhdGEuZWwud2lkdGgoKStcInhcIitkYXRhLmVsLmhlaWdodCgpO1xyXG4gICAgZGF0YS5lbC5yZW1vdmUoKTtcclxuICAgIHdyYXAuYXBwZW5kKCc8c3Bhbj4nK3NpemUrJzwvc3Bhbj4gPGEgaHJlZj1cIicrZGF0YS5zcmMrJ1wiIGRvd25sb2FkPtCh0LrQsNGH0LDRgtGMPC9hPicpXHJcbiAgfVxyXG5cclxuICB2YXIgaW1ncyA9ICQoJy5kb3dubG9hZHNfaW1nIGltZycpO1xyXG4gIGZvcih2YXIgaT0wO2k8aW1ncy5sZW5ndGg7aSsrKSB7XHJcbiAgICB2YXIgaW1nPWltZ3MuZXEoaSk7XHJcbiAgICB2YXIgc3JjPWltZy5hdHRyKCdzcmMnKTtcclxuICAgIGltYWdlID0gJCgnPGltZy8+Jywge1xyXG4gICAgICBzcmM6IHNyY1xyXG4gICAgfSk7XHJcbiAgICBkYXRhID0ge1xyXG4gICAgICBzcmM6IHNyYyxcclxuICAgICAgaW1nOiBpbWcsXHJcbiAgICAgIGVsOmltYWdlXHJcbiAgICB9O1xyXG4gICAgaW1hZ2Uub24oJ2xvYWQnLCBpbWdfbG9hZF9maW5pc2guYmluZChkYXRhKSlcclxuICB9XHJcbn0pKCk7IiwidmFyIG5vdGlmaWNhdGlvbiA9IChmdW5jdGlvbigpIHtcclxuICB2YXIgY29udGVpbmVyO1xyXG4gIHZhciBtb3VzZU92ZXIgPSAwO1xyXG4gIHZhciB0aW1lckNsZWFyQWxsID0gbnVsbDtcclxuICB2YXIgYW5pbWF0aW9uRW5kID0gJ3dlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmQnO1xyXG4gIHZhciB0aW1lID0gMTAwMDA7XHJcblxyXG4gIHZhciBub3RpZmljYXRpb25fYm94ID1mYWxzZTtcclxuICB2YXIgaXNfaW5pdD1mYWxzZTtcclxuICB2YXIgY29uZmlybV9vcHQ9e1xyXG4gICAgdGl0bGU6XCLQo9C00LDQu9C10L3QuNC1XCIsXHJcbiAgICBxdWVzdGlvbjpcItCS0Ysg0LTQtdC50YHRgtCy0LjRgtC10LvRjNC90L4g0YXQvtGC0LjRgtC1INGD0LTQsNC70LjRgtGMP1wiLFxyXG4gICAgYnV0dG9uWWVzOlwi0JTQsFwiLFxyXG4gICAgYnV0dG9uTm86XCLQndC10YJcIixcclxuICAgIGNhbGxiYWNrWWVzOmZhbHNlLFxyXG4gICAgY2FsbGJhY2tObzpmYWxzZSxcclxuICAgIG9iajpmYWxzZSxcclxuICAgIGJ1dHRvblRhZzonZGl2JyxcclxuICAgIGJ1dHRvblllc0RvcDonJyxcclxuICAgIGJ1dHRvbk5vRG9wOicnLFxyXG4gIH07XHJcbiAgdmFyIGFsZXJ0X29wdD17XHJcbiAgICB0aXRsZTpcIlwiLFxyXG4gICAgcXVlc3Rpb246XCLQodC+0L7QsdGJ0LXQvdC40LVcIixcclxuICAgIGJ1dHRvblllczpcItCU0LBcIixcclxuICAgIGNhbGxiYWNrWWVzOmZhbHNlLFxyXG4gICAgYnV0dG9uVGFnOidkaXYnLFxyXG4gICAgb2JqOmZhbHNlLFxyXG4gIH07XHJcblxyXG5cclxuICBmdW5jdGlvbiBpbml0KCl7XHJcbiAgICBpc19pbml0PXRydWU7XHJcbiAgICBub3RpZmljYXRpb25fYm94PSQoJy5ub3RpZmljYXRpb25fYm94Jyk7XHJcbiAgICBpZihub3RpZmljYXRpb25fYm94Lmxlbmd0aD4wKXJldHVybjtcclxuXHJcbiAgICAkKCdib2R5JykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nbm90aWZpY2F0aW9uX2JveCc+PC9kaXY+XCIpO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveD0kKCcubm90aWZpY2F0aW9uX2JveCcpO1xyXG5cclxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywnLm5vdGlmeV9jb250cm9sJyxjbG9zZU1vZGFsKTtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywnLm5vdGlmeV9jbG9zZScsY2xvc2VNb2RhbCk7XHJcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsY2xvc2VNb2RhbEZvbik7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjbG9zZU1vZGFsKCl7XHJcbiAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjbG9zZU1vZGFsRm9uKGUpe1xyXG4gICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcclxuICAgIGlmKHRhcmdldC5jbGFzc05hbWU9PVwibm90aWZpY2F0aW9uX2JveFwiKXtcclxuICAgICAgY2xvc2VNb2RhbCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdmFyIF9zZXRVcExpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJCgnYm9keScpLm9uKCdjbGljaycsICcubm90aWZpY2F0aW9uX2Nsb3NlJywgX2Nsb3NlUG9wdXApO1xyXG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWVudGVyJywgJy5ub3RpZmljYXRpb25fY29udGFpbmVyJywgX29uRW50ZXIpO1xyXG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWxlYXZlJywgJy5ub3RpZmljYXRpb25fY29udGFpbmVyJywgX29uTGVhdmUpO1xyXG4gIH07XHJcblxyXG4gIHZhciBfb25FbnRlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBpZihldmVudClldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgaWYgKHRpbWVyQ2xlYXJBbGwhPW51bGwpIHtcclxuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyQ2xlYXJBbGwpO1xyXG4gICAgICB0aW1lckNsZWFyQWxsID0gbnVsbDtcclxuICAgIH1cclxuICAgIGNvbnRlaW5lci5maW5kKCcubm90aWZpY2F0aW9uX2l0ZW0nKS5lYWNoKGZ1bmN0aW9uKGkpe1xyXG4gICAgICB2YXIgb3B0aW9uPSQodGhpcykuZGF0YSgnb3B0aW9uJyk7XHJcbiAgICAgIGlmKG9wdGlvbi50aW1lcikge1xyXG4gICAgICAgIGNsZWFyVGltZW91dChvcHRpb24udGltZXIpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIG1vdXNlT3ZlciA9IDE7XHJcbiAgfTtcclxuXHJcbiAgdmFyIF9vbkxlYXZlID0gZnVuY3Rpb24oKSB7XHJcbiAgICBjb250ZWluZXIuZmluZCgnLm5vdGlmaWNhdGlvbl9pdGVtJykuZWFjaChmdW5jdGlvbihpKXtcclxuICAgICAgJHRoaXM9JCh0aGlzKTtcclxuICAgICAgdmFyIG9wdGlvbj0kdGhpcy5kYXRhKCdvcHRpb24nKTtcclxuICAgICAgaWYob3B0aW9uLnRpbWU+MCkge1xyXG4gICAgICAgIG9wdGlvbi50aW1lciA9IHNldFRpbWVvdXQoX2Nsb3NlUG9wdXAuYmluZChvcHRpb24uY2xvc2UpLCBvcHRpb24udGltZSAtIDE1MDAgKyAxMDAgKiBpKTtcclxuICAgICAgICAkdGhpcy5kYXRhKCdvcHRpb24nLG9wdGlvbilcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBtb3VzZU92ZXIgPSAwO1xyXG4gIH07XHJcblxyXG4gIHZhciBfY2xvc2VQb3B1cCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBpZihldmVudClldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgIHZhciAkdGhpcyA9ICQodGhpcykucGFyZW50KCk7XHJcbiAgICAkdGhpcy5vbihhbmltYXRpb25FbmQsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAkKHRoaXMpLnJlbW92ZSgpO1xyXG4gICAgfSk7XHJcbiAgICAkdGhpcy5hZGRDbGFzcygnbm90aWZpY2F0aW9uX2hpZGUnKVxyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIGFsZXJ0KGRhdGEpe1xyXG4gICAgaWYoIWRhdGEpZGF0YT17fTtcclxuICAgIGRhdGE9b2JqZWN0cyhhbGVydF9vcHQsZGF0YSk7XHJcblxyXG4gICAgaWYoIWlzX2luaXQpaW5pdCgpO1xyXG5cclxuICAgIG5vdHlmeV9jbGFzcz0nbm90aWZ5X2JveCAnO1xyXG4gICAgaWYoZGF0YS5ub3R5ZnlfY2xhc3Mpbm90eWZ5X2NsYXNzKz1kYXRhLm5vdHlmeV9jbGFzcztcclxuXHJcbiAgICBib3hfaHRtbD0nPGRpdiBjbGFzcz1cIicrbm90eWZ5X2NsYXNzKydcIj4nO1xyXG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X3RpdGxlXCI+JztcclxuICAgIGJveF9odG1sKz1kYXRhLnRpdGxlO1xyXG4gICAgYm94X2h0bWwrPSc8c3BhbiBjbGFzcz1cIm5vdGlmeV9jbG9zZVwiPjwvc3Bhbj4nO1xyXG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xyXG5cclxuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcclxuICAgIGJveF9odG1sKz1kYXRhLnF1ZXN0aW9uO1xyXG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xyXG5cclxuICAgIGlmKGRhdGEuYnV0dG9uWWVzfHxkYXRhLmJ1dHRvbk5vKSB7XHJcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xyXG4gICAgICBpZiAoZGF0YS5idXR0b25ZZXMpYm94X2h0bWwgKz0gJzwnK2RhdGEuYnV0dG9uVGFnKycgY2xhc3M9XCJub3RpZnlfYnRuX3llc1wiICcrZGF0YS5idXR0b25ZZXNEb3ArJz4nICsgZGF0YS5idXR0b25ZZXMgKyAnPC8nK2RhdGEuYnV0dG9uVGFnKyc+JztcclxuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzwnK2RhdGEuYnV0dG9uVGFnKycgY2xhc3M9XCJub3RpZnlfYnRuX25vXCIgJytkYXRhLmJ1dHRvbk5vRG9wKyc+JyArIGRhdGEuYnV0dG9uTm8gKyAnPC8nK2RhdGEuYnV0dG9uVGFnKyc+JztcclxuICAgICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcbiAgICB9O1xyXG5cclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XHJcblxyXG5cclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcclxuICAgIH0sMTAwKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29uZmlybShkYXRhKXtcclxuICAgIGlmKCFkYXRhKWRhdGE9e307XHJcbiAgICBkYXRhPW9iamVjdHMoY29uZmlybV9vcHQsZGF0YSk7XHJcblxyXG4gICAgaWYoIWlzX2luaXQpaW5pdCgpO1xyXG5cclxuICAgIGJveF9odG1sPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveFwiPic7XHJcbiAgICBib3hfaHRtbCs9JzxkaXYgY2xhc3M9XCJub3RpZnlfdGl0bGVcIj4nO1xyXG4gICAgYm94X2h0bWwrPWRhdGEudGl0bGU7XHJcbiAgICBib3hfaHRtbCs9JzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XHJcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XHJcblxyXG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRlbnRcIj4nO1xyXG4gICAgYm94X2h0bWwrPWRhdGEucXVlc3Rpb247XHJcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XHJcblxyXG4gICAgaWYoZGF0YS5idXR0b25ZZXN8fGRhdGEuYnV0dG9uTm8pIHtcclxuICAgICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udHJvbFwiPic7XHJcbiAgICAgIGlmIChkYXRhLmJ1dHRvblllcylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5feWVzXCI+JyArIGRhdGEuYnV0dG9uWWVzICsgJzwvZGl2Pic7XHJcbiAgICAgIGlmIChkYXRhLmJ1dHRvbk5vKWJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2J0bl9ub1wiPicgKyBkYXRhLmJ1dHRvbk5vICsgJzwvZGl2Pic7XHJcbiAgICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xyXG4gICAgfVxyXG5cclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XHJcblxyXG4gICAgaWYoZGF0YS5jYWxsYmFja1llcyE9ZmFsc2Upe1xyXG4gICAgICBub3RpZmljYXRpb25fYm94LmZpbmQoJy5ub3RpZnlfYnRuX3llcycpLm9uKCdjbGljaycsZGF0YS5jYWxsYmFja1llcy5iaW5kKGRhdGEub2JqKSk7XHJcbiAgICB9XHJcbiAgICBpZihkYXRhLmNhbGxiYWNrTm8hPWZhbHNlKXtcclxuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl9ubycpLm9uKCdjbGljaycsZGF0YS5jYWxsYmFja05vLmJpbmQoZGF0YS5vYmopKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XHJcbiAgICB9LDEwMClcclxuXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBub3RpZmkoZGF0YSkge1xyXG4gICAgaWYoIWRhdGEpZGF0YT17fTtcclxuICAgIHZhciBvcHRpb24gPSB7dGltZSA6IChkYXRhLnRpbWV8fGRhdGEudGltZT09PTApP2RhdGEudGltZTp0aW1lfTtcclxuICAgIGlmICghY29udGVpbmVyKSB7XHJcbiAgICAgIGNvbnRlaW5lciA9ICQoJzx1bC8+Jywge1xyXG4gICAgICAgICdjbGFzcyc6ICdub3RpZmljYXRpb25fY29udGFpbmVyJ1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgICQoJ2JvZHknKS5hcHBlbmQoY29udGVpbmVyKTtcclxuICAgICAgX3NldFVwTGlzdGVuZXJzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGxpID0gJCgnPGxpLz4nLCB7XHJcbiAgICAgIGNsYXNzOiAnbm90aWZpY2F0aW9uX2l0ZW0nXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoZGF0YS50eXBlKXtcclxuICAgICAgbGkuYWRkQ2xhc3MoJ25vdGlmaWNhdGlvbl9pdGVtLScgKyBkYXRhLnR5cGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBjbG9zZT0kKCc8c3Bhbi8+Jyx7XHJcbiAgICAgIGNsYXNzOidub3RpZmljYXRpb25fY2xvc2UnXHJcbiAgICB9KTtcclxuICAgIG9wdGlvbi5jbG9zZT1jbG9zZTtcclxuICAgIGxpLmFwcGVuZChjbG9zZSk7XHJcblxyXG4gICAgdmFyIGNvbnRlbnQgPSAkKCc8ZGl2Lz4nLHtcclxuICAgICAgY2xhc3M6XCJub3RpZmljYXRpb25fY29udGVudFwiXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZihkYXRhLnRpdGxlICYmIGRhdGEudGl0bGUubGVuZ3RoPjApIHtcclxuICAgICAgdmFyIHRpdGxlID0gJCgnPGg1Lz4nLCB7XHJcbiAgICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX3RpdGxlXCJcclxuICAgICAgfSk7XHJcbiAgICAgIHRpdGxlLmh0bWwoZGF0YS50aXRsZSk7XHJcbiAgICAgIGNvbnRlbnQuYXBwZW5kKHRpdGxlKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdGV4dD0gJCgnPGRpdi8+Jyx7XHJcbiAgICAgIGNsYXNzOlwibm90aWZpY2F0aW9uX3RleHRcIlxyXG4gICAgfSk7XHJcbiAgICB0ZXh0Lmh0bWwoZGF0YS5tZXNzYWdlKTtcclxuXHJcbiAgICBpZihkYXRhLmltZyAmJiBkYXRhLmltZy5sZW5ndGg+MCkge1xyXG4gICAgICB2YXIgaW1nID0gJCgnPGRpdi8+Jywge1xyXG4gICAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl9pbWdcIlxyXG4gICAgICB9KTtcclxuICAgICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgnK2RhdGEuaW1nKycpJyk7XHJcbiAgICAgIHZhciB3cmFwID0gJCgnPGRpdi8+Jywge1xyXG4gICAgICAgIGNsYXNzOiBcIndyYXBcIlxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHdyYXAuYXBwZW5kKGltZyk7XHJcbiAgICAgIHdyYXAuYXBwZW5kKHRleHQpO1xyXG4gICAgICBjb250ZW50LmFwcGVuZCh3cmFwKTtcclxuICAgIH1lbHNle1xyXG4gICAgICBjb250ZW50LmFwcGVuZCh0ZXh0KTtcclxuICAgIH1cclxuICAgIGxpLmFwcGVuZChjb250ZW50KTtcclxuXHJcbiAgICAvL1xyXG4gICAgLy8gaWYoZGF0YS50aXRsZSAmJiBkYXRhLnRpdGxlLmxlbmd0aD4wKSB7XHJcbiAgICAvLyAgIHZhciB0aXRsZSA9ICQoJzxwLz4nLCB7XHJcbiAgICAvLyAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX3RpdGxlXCJcclxuICAgIC8vICAgfSk7XHJcbiAgICAvLyAgIHRpdGxlLmh0bWwoZGF0YS50aXRsZSk7XHJcbiAgICAvLyAgIGxpLmFwcGVuZCh0aXRsZSk7XHJcbiAgICAvLyB9XHJcbiAgICAvL1xyXG4gICAgLy8gaWYoZGF0YS5pbWcgJiYgZGF0YS5pbWcubGVuZ3RoPjApIHtcclxuICAgIC8vICAgdmFyIGltZyA9ICQoJzxkaXYvPicsIHtcclxuICAgIC8vICAgICBjbGFzczogXCJub3RpZmljYXRpb25faW1nXCJcclxuICAgIC8vICAgfSk7XHJcbiAgICAvLyAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytkYXRhLmltZysnKScpO1xyXG4gICAgLy8gICBsaS5hcHBlbmQoaW1nKTtcclxuICAgIC8vIH1cclxuICAgIC8vXHJcbiAgICAvLyB2YXIgY29udGVudCA9ICQoJzxkaXYvPicse1xyXG4gICAgLy8gICBjbGFzczpcIm5vdGlmaWNhdGlvbl9jb250ZW50XCJcclxuICAgIC8vIH0pO1xyXG4gICAgLy8gY29udGVudC5odG1sKGRhdGEubWVzc2FnZSk7XHJcbiAgICAvL1xyXG4gICAgLy8gbGkuYXBwZW5kKGNvbnRlbnQpO1xyXG4gICAgLy9cclxuICAgICBjb250ZWluZXIuYXBwZW5kKGxpKTtcclxuXHJcbiAgICBpZihvcHRpb24udGltZT4wKXtcclxuICAgICAgb3B0aW9uLnRpbWVyPXNldFRpbWVvdXQoX2Nsb3NlUG9wdXAuYmluZChjbG9zZSksIG9wdGlvbi50aW1lKTtcclxuICAgIH1cclxuICAgIGxpLmRhdGEoJ29wdGlvbicsb3B0aW9uKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGFsZXJ0OiBhbGVydCxcclxuICAgIGNvbmZpcm06IGNvbmZpcm0sXHJcbiAgICBub3RpZmk6IG5vdGlmaSxcclxuICB9O1xyXG5cclxufSkoKTtcclxuXHJcblxyXG4kKCdbcmVmPXBvcHVwXScpLm9uKCdjbGljaycsZnVuY3Rpb24gKGUpe1xyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxuICAkdGhpcz0kKHRoaXMpO1xyXG4gIGVsPSQoJHRoaXMuYXR0cignaHJlZicpKTtcclxuICBkYXRhPWVsLmRhdGEoKTtcclxuXHJcbiAgZGF0YS5xdWVzdGlvbj1lbC5odG1sKCk7XHJcbiAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xyXG59KTtcclxuIiwiJChmdW5jdGlvbigpIHtcclxuXHJcbiAgZnVuY3Rpb24gdXBkYXRlKGRhdGEpe1xyXG4gICAgJHRoaXM9JCh0aGlzKTtcclxuICAgIG1vZGU9JHRoaXMuYXR0cignbW9kZScpO1xyXG4gICAgaWYobW9kZT09J3JhdGUnKXtcclxuICAgICAgJHBhcmVudD0kdGhpcy5jbG9zZXN0KCcuYWNvcmRpb25fY29udGVudCcpO1xyXG4gICAgICAkcGFyZW50PSRwYXJlbnQuZmluZCgndGFibGUnKTtcclxuICAgICAgZGF0YT0kKGRhdGEpO1xyXG4gICAgICBkYXRhLmFqYXhfc2F2ZSgpO1xyXG4gICAgICAkcGFyZW50LmFwcGVuZChkYXRhKVxyXG4gICAgfVxyXG5cclxuICAgIGlmKG1vZGU9PSd0YXJpZmYnKXtcclxuICAgICAgJHBhcmVudD0kdGhpcy5jbG9zZXN0KCcuYWNvcmRpb25fY29udGVudCcpO1xyXG4gICAgICBkYXRhPSQoZGF0YSk7XHJcbiAgICAgIGRhdGEuZmluZCgnLmFqYXhfc2F2ZScpLmFqYXhfc2F2ZSgpO1xyXG4gICAgICAkcGFyZW50LmFwcGVuZChkYXRhKVxyXG4gICAgfVxyXG5cclxuICAgIGlmKG1vZGU9PSdhY3Rpb24nKXtcclxuICAgICAgJHBhcmVudD0kdGhpcy5jbG9zZXN0KCcuY3BhX2JveCcpO1xyXG4gICAgICBkYXRhPSQoZGF0YSk7XHJcbiAgICAgIGRhdGEuZmluZCgnLmFqYXhfc2F2ZScpLmFqYXhfc2F2ZSgpO1xyXG4gICAgICAkcGFyZW50LmFwcGVuZChkYXRhKVxyXG4gICAgfVxyXG5cclxuICAgIGlmKG1vZGU9PSdjcGEnKXtcclxuICAgICAgZGF0YT1KU09OLnBhcnNlKGRhdGEpO1xyXG5cclxuICAgICAgJHBhcmVudD0kdGhpcy5jbG9zZXN0KCcudGFyaWZfc2VsZWN0X2JsaycpO1xyXG5cclxuICAgICAgJHBhcmVudC5wcmVwZW5kKGRhdGFbJ3RhYl9oZWFkX3N1ZiddKTtcclxuICAgICAgJHBhcmVudC5maW5kKCcudGFiX2NvbnRyb2wnKVxyXG4gICAgICAgIC5hcHBlbmQoZGF0YVsndGFiX2hlYWRfYnV0J10pXHJcbiAgICAgICAgLmFqYXhfc2F2ZSgpO1xyXG5cclxuICAgICAgZGF0YT0kKGRhdGFbJ3RhYl9ib2R5J10pO1xyXG4gICAgICBkYXRhLmZpbmQoJy5hamF4X3NhdmUnKS5hamF4X3NhdmUoKTtcclxuICAgICAgJHBhcmVudFxyXG4gICAgICAgIC5maW5kKCcuY29udGVudF90YWInKVxyXG4gICAgICAgIC5hcHBlbmQoZGF0YSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCcuYWRkX3Nob3BfZWxlbWVudCcsZnVuY3Rpb24oKXtcclxuICAgICR0aGlzPSQodGhpcyk7XHJcbiAgICBwb3N0PXtcclxuICAgICAgY29kZTokdGhpcy5hdHRyKCdjb2RlJyksXHJcbiAgICAgIHBhcmVudDokdGhpcy5hdHRyKCdwYXJlbnQnKSxcclxuICAgICAgdHlwZTokdGhpcy5hdHRyKCdtb2RlJylcclxuICAgIH07XHJcbiAgICB1cGRhdGVFbGVtZW50PXVwZGF0ZS5iaW5kKCR0aGlzKTtcclxuICAgICQucG9zdChcIi9hZG1pbi9zdG9yZXMvYWpheF9pbnNlcnQvXCIrJHRoaXMuYXR0cignbW9kZScpLHBvc3QsdXBkYXRlRWxlbWVudCkuZmFpbChmdW5jdGlvbigpIHtcclxuICAgICAgYWxlcnQoIFwi0J7RiNC40LHQutCwINC00L7QsdCw0LLQu9C10L3QuNGPXCIgKTtcclxuICAgIH0pXHJcbiAgfSlcclxufSk7XHJcbiIsImZ1bmN0aW9uIGFqYXhGb3JtKGVscykge1xyXG4gIHZhciBmaWxlQXBpID0gd2luZG93LkZpbGUgJiYgd2luZG93LkZpbGVSZWFkZXIgJiYgd2luZG93LkZpbGVMaXN0ICYmIHdpbmRvdy5CbG9iID8gdHJ1ZSA6IGZhbHNlO1xyXG4gIHZhciBkZWZhdWx0cyA9IHtcclxuICAgIGVycm9yX2NsYXNzOiAnLmhhcy1lcnJvcicsXHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gb25Qb3N0KHBvc3Qpe1xyXG4gICAgdmFyIGRhdGE9dGhpcztcclxuICAgIGZvcm09ZGF0YS5mb3JtO1xyXG4gICAgd3JhcD1kYXRhLndyYXA7XHJcbiAgICBpZihwb3N0LnJlbmRlcil7XHJcbiAgICAgIHBvc3Qubm90eWZ5X2NsYXNzPVwibm90aWZ5X3doaXRlXCI7XHJcbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydChwb3N0KTtcclxuICAgIH1lbHNle1xyXG4gICAgICB3cmFwLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICAgIHdyYXAuaHRtbChwb3N0Lmh0bWwpO1xyXG4gICAgICBhamF4Rm9ybSh3cmFwKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG9uRmFpbCgpe1xyXG4gICAgdmFyIGRhdGE9dGhpcztcclxuICAgIGZvcm09ZGF0YS5mb3JtO1xyXG4gICAgd3JhcD1kYXRhLndyYXA7XHJcbiAgICB3cmFwLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICB3cmFwLmh0bWwoJzxoMz7Qo9C/0YEuLi4g0JLQvtC30L3QuNC60LvQsCDQvdC10L/RgNC10LTQstC40LTQtdC90L3QsNGPINC+0YjQuNCx0LrQsDxoMz4nICtcclxuICAgICAgJzxwPtCn0LDRgdGC0L4g0Y3RgtC+INC/0YDQvtC40YHRhdC+0LTQuNGCINCyINGB0LvRg9GH0LDQtSwg0LXRgdC70Lgg0LLRiyDQvdC10YHQutC+0LvRjNC60L4g0YDQsNC3INC/0L7QtNGA0Y/QtCDQvdC10LLQtdGA0L3QviDQstCy0LXQu9C4INGB0LLQvtC4INGD0YfQtdGC0L3Ri9C1INC00LDQvdC90YvQtS4g0J3QviDQstC+0LfQvNC+0LbQvdGLINC4INC00YDRg9Cz0LjQtSDQv9GA0LjRh9C40L3Riy4g0JIg0LvRjtCx0L7QvCDRgdC70YPRh9Cw0LUg0L3QtSDRgNCw0YHRgdGC0YDQsNC40LLQsNC50YLQtdGB0Ywg0Lgg0L/RgNC+0YHRgtC+INC+0LHRgNCw0YLQuNGC0LXRgdGMINC6INC90LDRiNC10LzRgyDQvtC/0LXRgNCw0YLQvtGA0YMg0YHQu9GD0LbQsdGLINC/0L7QtNC00LXRgNC20LrQuC48L3A+PGJyPicgK1xyXG4gICAgICAnPHA+0KHQv9Cw0YHQuNCx0L4uPC9wPicpO1xyXG4gICAgYWpheEZvcm0od3JhcCk7XHJcblxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gb25TdWJtaXQoZSl7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgZGF0YT10aGlzO1xyXG4gICAgZm9ybT1kYXRhLmZvcm07XHJcbiAgICB3cmFwPWRhdGEud3JhcDtcclxuXHJcbiAgICBpZihmb3JtLnlpaUFjdGl2ZUZvcm0pe1xyXG4gICAgICBmb3JtLnlpaUFjdGl2ZUZvcm0oJ3ZhbGlkYXRlJyk7XHJcbiAgICB9O1xyXG5cclxuICAgIGlzVmFsaWQ9KGZvcm0uZmluZChkYXRhLnBhcmFtLmVycm9yX2NsYXNzKS5sZW5ndGg9PTApO1xyXG5cclxuICAgIGlmKCFpc1ZhbGlkKXtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIHJlcXVpcmVkPWZvcm0uZmluZCgnaW5wdXQucmVxdWlyZWQnKTtcclxuICAgICAgZm9yKGk9MDtpPHJlcXVpcmVkLmxlbmd0aDtpKyspe1xyXG4gICAgICAgIGlmKHJlcXVpcmVkLmVxKGkpLnZhbCgpLmxlbmd0aDwxKXtcclxuICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmKCFmb3JtLnNlcmlhbGl6ZU9iamVjdClhZGRTUk8oKTtcclxuXHJcbiAgICB2YXIgcG9zdD1mb3JtLnNlcmlhbGl6ZU9iamVjdCgpO1xyXG4gICAgZm9ybS5hZGRDbGFzcygnbG9hZGluZycpO1xyXG4gICAgZm9ybS5odG1sKCcnKTtcclxuICAgIHdyYXAuaHRtbCgnPGRpdiBzdHlsZT1cInRleHQtYWxpZ246Y2VudGVyO1wiPjxwPtCe0YLQv9GA0LDQstC60LAg0LTQsNC90L3Ri9GFPC9wPjwvZGl2PicpO1xyXG5cclxuICAgIGRhdGEudXJsKz0oZGF0YS51cmwuaW5kZXhPZignPycpPjA/JyYnOic/JykrJ3JjPScrTWF0aC5yYW5kb20oKTtcclxuXHJcbiAgICAkLnBvc3QoXHJcbiAgICAgIGRhdGEudXJsLFxyXG4gICAgICBwb3N0LFxyXG4gICAgICBvblBvc3QuYmluZChkYXRhKSxcclxuICAgICAgJ2pzb24nXHJcbiAgICApLmZhaWwob25GYWlsLmJpbmQoZGF0YSkpO1xyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIGVscy5maW5kKCdbcmVxdWlyZWRdJylcclxuICAgIC5hZGRDbGFzcygncmVxdWlyZWQnKVxyXG4gICAgLnJlbW92ZUF0dHIoJ3JlcXVpcmVkJyk7XHJcblxyXG4gIGZvcih2YXIgaT0wO2k8ZWxzLmxlbmd0aDtpKyspe1xyXG4gICAgd3JhcD1lbHMuZXEoaSk7XHJcbiAgICBmb3JtPXdyYXAuZmluZCgnZm9ybScpO1xyXG4gICAgZGF0YT17XHJcbiAgICAgIGZvcm06Zm9ybSxcclxuICAgICAgcGFyYW06ZGVmYXVsdHMsXHJcbiAgICAgIHdyYXA6d3JhcFxyXG4gICAgfTtcclxuICAgIGRhdGEudXJsPWZvcm0uYXR0cignYWN0aW9uJykgfHwgbG9jYXRpb24uaHJlZjtcclxuICAgIGRhdGEubWV0aG9kPSBmb3JtLmF0dHIoJ21ldGhvZCcpIHx8ICdwb3N0JztcclxuICAgIGZvcm0ub2ZmKCdzdWJtaXQnKTtcclxuICAgIGZvcm0ub24oJ3N1Ym1pdCcsIG9uU3VibWl0LmJpbmQoZGF0YSkpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gYWRkU1JPKCl7XHJcbiAgJC5mbi5zZXJpYWxpemVPYmplY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgbyA9IHt9O1xyXG4gICAgdmFyIGEgPSB0aGlzLnNlcmlhbGl6ZUFycmF5KCk7XHJcbiAgICAkLmVhY2goYSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICBpZiAob1t0aGlzLm5hbWVdKSB7XHJcbiAgICAgICAgaWYgKCFvW3RoaXMubmFtZV0ucHVzaCkge1xyXG4gICAgICAgICAgb1t0aGlzLm5hbWVdID0gW29bdGhpcy5uYW1lXV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9bdGhpcy5uYW1lXS5wdXNoKHRoaXMudmFsdWUgfHwgJycpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG9bdGhpcy5uYW1lXSA9IHRoaXMudmFsdWUgfHwgJyc7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG87XHJcbiAgfTtcclxufTtcclxuYWRkU1JPKCk7Il19
