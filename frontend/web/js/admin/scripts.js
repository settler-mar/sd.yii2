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

(function (window, document) {

    var Checker = {
        cookiesEnabled: false,
        adblockEnabled: false,

        options: {
            showPopup: true,
            allowClose: false,
            lang: 'ru'
        },

        href:'abp:subscribe?location=https://secretdiscounter.ru/adblock.txt&title=secretdiscounter',
        langText: {
            ru: {
                title: 'ВНИМАНИЕ: <span style="color:red;">Ваш кэшбэк не отслеживается!</span>',
                description: 'Настройки вашего браузера не позволяют использовать файлы cookies, без которых невозможно отследить ваш кэшбэк или использовать промокод, возможны и другие ошибки.',
                listTitle: 'Проблема может быть вызвана:',
                button: 'Настроить Adblock',
                browserSettings: '<h4>Настройками вашего браузера</h4> ' +
                '<p>Зайдите в настройки браузера и разрешите использование файлов cookie. </p>',
                adblockSettings: '<h4>Сторонним расширением типа AdBlock</h4> ' +
                '<p>Просто добавьте наш сайт в <a href="___adblockLink___">белый список</a> в настройках AdBlock. </p>'
            },
        },

        init: function() {
            this.isMobile=!!isMobile.any();
            this.testCookies();
            if(this.isMobile && !this.cookiesEnabled){
                this.showPopup();
            }else{
                this.testAd();
            }
        },
        testCookies: function () {
            setCookie('testWork','test');
            this.cookiesEnabled = (getCookie('testWork')=='test');
        },
        testAd: function () {
            var $adDetect = $('.ad-detect:visible').length;
            this.adblockEnabled = ($adDetect>0);

            if((!this.adblockEnabled || !this.cookiesEnabled) && !getCookie('adBlockShow')){
                setCookie('adBlockShow','show');
                this.showPopup();
            }
        },
        showPopup: function() {
            setTimeout(this.showPop.bind(this),500);
        },
        showPop: function() {
            var lang = this.langText.ru;
            var text='';


            text+='<h3 style="text-align: center;font-weight: bold;">';
            text+=lang.title;
            text+='</h3>';
            text+='<p>';
            text+=lang.description;
            text+='</p>';
            text+='<h3>';
            text+=lang.listTitle;
            text+='</h3>';
            text+='<div class="ad_recomend help-msg">';
            text+='<div>'+lang.browserSettings+'</div>';
            text+='<div>'+lang.adblockSettings+'</div>';
            text+='</div>';

            text=text.replace('___adblockLink___',this.href);
            notification.alert({
                buttonYes:lang.button,
                buttonTag:'a',
                buttonYesDop:'href="'+this.href+'"',
                notyfy_class:"notify_white",
                question: text,

            });
        }
    };

    var isMobile = {
        Android: function() {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function() {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };
    function getCookie(name) {
        var matches = document.cookie.match(new RegExp(
          "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }
    function setCookie(name, value, options) {
        options = options || {};

        var expires = options.expires;

        if (typeof expires == "number" && expires) {
            var d = new Date();
            d.setTime(d.getTime() + expires * 1000);
            expires = options.expires = d;
        }
        if (expires && expires.toUTCString) {
            options.expires = expires.toUTCString();
        }

        value = encodeURIComponent(value);

        var updatedCookie = name + "=" + value;

        for (var propName in options) {
            updatedCookie += "; " + propName;
            var propValue = options[propName];
            if (propValue !== true) {
                updatedCookie += "=" + propValue;
            }
        }

        document.cookie = updatedCookie;
    }
    Checker.init();
    //setTimeout(Checker.init,100);
}(window, document));
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
	
	$('.ajax-action').click(function(e) {
		e.preventDefault();
		var status = $(this).data('value');
		var href = $(this).attr('href');
		var ids = $('#grid-ajax-action').yiiGridView('getSelectedRows');
		if (!confirm('Подтвердите изменение записей')) {
			return null;
		}
		if (ids.length > 0) {
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
					alert('Произошла ошибка!');
				}
			}).fail(function(data){
				alert('Произошла ошибка!');
			});
		} else {
			alert('Необходимо выбрать элементы!')
		}
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

		$.post('/admin/payments/admitad-test',{'ids':ids},function(data){
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
    plugins: [
      'advlist autolink lists link image charmap hr anchor pagebreak accordion clear_br',
      'searchreplace wordcount visualblocks visualchars code fullscreen',
      'insertdatetime media nonbreaking save table contextmenu directionality',
      'emoticons template paste textcolor colorpicker textpattern imagetools  toc help code'
    ],
    toolbar1: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | media | forecolor backcolor | accordion | clear_br | code help ',
    file_browser_callback: RoxyFileBrowser,
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
        notification.notifi({message:'Невозможно удалить элемент',type:'err'});
      }

      mode=$this.attr('mode');
      if(!mode){
        mode='rm';
      }

      if(mode='rm') {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpxdWVyeS5tZW51LWFpbS5qcyIsImNpcmNsZXMubWluLmpzIiwiZGF0ZXBpY2tlci5qcyIsImpxdWVyeS5ub3R5LnBhY2thZ2VkLm1pbi5qcyIsIm1haW4uanMiLCJqcXVlcnkubW9ja2pheC5qcyIsImpxdWVyeS5hdXRvY29tcGxldGUuanMiLCJjb29raWVfY2hlY2suanMiLCJzZWxlY3QyLmZ1bGwubWluLmpzIiwibWFpbl9hZG1pbi5qcyIsImVkaXRvcl9pbml0LmpzIiwiYWpheF9zYXZlLmpzIiwiYWpheF9yZW1vdmUuanMiLCJmb3JfYWxsLmpzIiwibm90aWZpY2F0aW9uLmpzIiwic3RvcmVzLmpzIiwianF1ZXJ5LmFqYXhGb3JtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25VQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25vREE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMTlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFJQTtBQUNBO0FBQ0E7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBtZW51LWFpbSBpcyBhIGpRdWVyeSBwbHVnaW4gZm9yIGRyb3Bkb3duIG1lbnVzIHRoYXQgY2FuIGRpZmZlcmVudGlhdGVcbiAqIGJldHdlZW4gYSB1c2VyIHRyeWluZyBob3ZlciBvdmVyIGEgZHJvcGRvd24gaXRlbSB2cyB0cnlpbmcgdG8gbmF2aWdhdGUgaW50b1xuICogYSBzdWJtZW51J3MgY29udGVudHMuXG4gKlxuICogbWVudS1haW0gYXNzdW1lcyB0aGF0IHlvdSBoYXZlIGFyZSB1c2luZyBhIG1lbnUgd2l0aCBzdWJtZW51cyB0aGF0IGV4cGFuZFxuICogdG8gdGhlIG1lbnUncyByaWdodC4gSXQgd2lsbCBmaXJlIGV2ZW50cyB3aGVuIHRoZSB1c2VyJ3MgbW91c2UgZW50ZXJzIGEgbmV3XG4gKiBkcm9wZG93biBpdGVtICphbmQqIHdoZW4gdGhhdCBpdGVtIGlzIGJlaW5nIGludGVudGlvbmFsbHkgaG92ZXJlZCBvdmVyLlxuICpcbiAqIF9fX19fX19fX19fX19fX19fX19fX19fX19fXG4gKiB8IE1vbmtleXMgID58ICAgR29yaWxsYSAgfFxuICogfCBHb3JpbGxhcyA+fCAgIENvbnRlbnQgIHxcbiAqIHwgQ2hpbXBzICAgPnwgICBIZXJlICAgICB8XG4gKiB8X19fX19fX19fX198X19fX19fX19fX19ffFxuICpcbiAqIEluIHRoZSBhYm92ZSBleGFtcGxlLCBcIkdvcmlsbGFzXCIgaXMgc2VsZWN0ZWQgYW5kIGl0cyBzdWJtZW51IGNvbnRlbnQgaXNcbiAqIGJlaW5nIHNob3duIG9uIHRoZSByaWdodC4gSW1hZ2luZSB0aGF0IHRoZSB1c2VyJ3MgY3Vyc29yIGlzIGhvdmVyaW5nIG92ZXJcbiAqIFwiR29yaWxsYXMuXCIgV2hlbiB0aGV5IG1vdmUgdGhlaXIgbW91c2UgaW50byB0aGUgXCJHb3JpbGxhIENvbnRlbnRcIiBhcmVhLCB0aGV5XG4gKiBtYXkgYnJpZWZseSBob3ZlciBvdmVyIFwiQ2hpbXBzLlwiIFRoaXMgc2hvdWxkbid0IGNsb3NlIHRoZSBcIkdvcmlsbGEgQ29udGVudFwiXG4gKiBhcmVhLlxuICpcbiAqIFRoaXMgcHJvYmxlbSBpcyBub3JtYWxseSBzb2x2ZWQgdXNpbmcgdGltZW91dHMgYW5kIGRlbGF5cy4gbWVudS1haW0gdHJpZXMgdG9cbiAqIHNvbHZlIHRoaXMgYnkgZGV0ZWN0aW5nIHRoZSBkaXJlY3Rpb24gb2YgdGhlIHVzZXIncyBtb3VzZSBtb3ZlbWVudC4gVGhpcyBjYW5cbiAqIG1ha2UgZm9yIHF1aWNrZXIgdHJhbnNpdGlvbnMgd2hlbiBuYXZpZ2F0aW5nIHVwIGFuZCBkb3duIHRoZSBtZW51LiBUaGVcbiAqIGV4cGVyaWVuY2UgaXMgaG9wZWZ1bGx5IHNpbWlsYXIgdG8gYW1hem9uLmNvbS8ncyBcIlNob3AgYnkgRGVwYXJ0bWVudFwiXG4gKiBkcm9wZG93bi5cbiAqXG4gKiBVc2UgbGlrZSBzbzpcbiAqXG4gKiAgICAgICQoXCIjbWVudVwiKS5tZW51QWltKHtcbiAqICAgICAgICAgIGFjdGl2YXRlOiAkLm5vb3AsICAvLyBmaXJlZCBvbiByb3cgYWN0aXZhdGlvblxuICogICAgICAgICAgZGVhY3RpdmF0ZTogJC5ub29wICAvLyBmaXJlZCBvbiByb3cgZGVhY3RpdmF0aW9uXG4gKiAgICAgIH0pO1xuICpcbiAqICAuLi50byByZWNlaXZlIGV2ZW50cyB3aGVuIGEgbWVudSdzIHJvdyBoYXMgYmVlbiBwdXJwb3NlZnVsbHkgKGRlKWFjdGl2YXRlZC5cbiAqXG4gKiBUaGUgZm9sbG93aW5nIG9wdGlvbnMgY2FuIGJlIHBhc3NlZCB0byBtZW51QWltLiBBbGwgZnVuY3Rpb25zIGV4ZWN1dGUgd2l0aFxuICogdGhlIHJlbGV2YW50IHJvdydzIEhUTUwgZWxlbWVudCBhcyB0aGUgZXhlY3V0aW9uIGNvbnRleHQgKCd0aGlzJyk6XG4gKlxuICogICAgICAubWVudUFpbSh7XG4gKiAgICAgICAgICAvLyBGdW5jdGlvbiB0byBjYWxsIHdoZW4gYSByb3cgaXMgcHVycG9zZWZ1bGx5IGFjdGl2YXRlZC4gVXNlIHRoaXNcbiAqICAgICAgICAgIC8vIHRvIHNob3cgYSBzdWJtZW51J3MgY29udGVudCBmb3IgdGhlIGFjdGl2YXRlZCByb3cuXG4gKiAgICAgICAgICBhY3RpdmF0ZTogZnVuY3Rpb24oKSB7fSxcbiAqXG4gKiAgICAgICAgICAvLyBGdW5jdGlvbiB0byBjYWxsIHdoZW4gYSByb3cgaXMgZGVhY3RpdmF0ZWQuXG4gKiAgICAgICAgICBkZWFjdGl2YXRlOiBmdW5jdGlvbigpIHt9LFxuICpcbiAqICAgICAgICAgIC8vIEZ1bmN0aW9uIHRvIGNhbGwgd2hlbiBtb3VzZSBlbnRlcnMgYSBtZW51IHJvdy4gRW50ZXJpbmcgYSByb3dcbiAqICAgICAgICAgIC8vIGRvZXMgbm90IG1lYW4gdGhlIHJvdyBoYXMgYmVlbiBhY3RpdmF0ZWQsIGFzIHRoZSB1c2VyIG1heSBiZVxuICogICAgICAgICAgLy8gbW91c2luZyBvdmVyIHRvIGEgc3VibWVudS5cbiAqICAgICAgICAgIGVudGVyOiBmdW5jdGlvbigpIHt9LFxuICpcbiAqICAgICAgICAgIC8vIEZ1bmN0aW9uIHRvIGNhbGwgd2hlbiBtb3VzZSBleGl0cyBhIG1lbnUgcm93LlxuICogICAgICAgICAgZXhpdDogZnVuY3Rpb24oKSB7fSxcbiAqXG4gKiAgICAgICAgICAvLyBTZWxlY3RvciBmb3IgaWRlbnRpZnlpbmcgd2hpY2ggZWxlbWVudHMgaW4gdGhlIG1lbnUgYXJlIHJvd3NcbiAqICAgICAgICAgIC8vIHRoYXQgY2FuIHRyaWdnZXIgdGhlIGFib3ZlIGV2ZW50cy4gRGVmYXVsdHMgdG8gXCI+IGxpXCIuXG4gKiAgICAgICAgICByb3dTZWxlY3RvcjogXCI+IGxpXCIsXG4gKlxuICogICAgICAgICAgLy8gWW91IG1heSBoYXZlIHNvbWUgbWVudSByb3dzIHRoYXQgYXJlbid0IHN1Ym1lbnVzIGFuZCB0aGVyZWZvcmVcbiAqICAgICAgICAgIC8vIHNob3VsZG4ndCBldmVyIG5lZWQgdG8gXCJhY3RpdmF0ZS5cIiBJZiBzbywgZmlsdGVyIHN1Ym1lbnUgcm93cyB3L1xuICogICAgICAgICAgLy8gdGhpcyBzZWxlY3Rvci4gRGVmYXVsdHMgdG8gXCIqXCIgKGFsbCBlbGVtZW50cykuXG4gKiAgICAgICAgICBzdWJtZW51U2VsZWN0b3I6IFwiKlwiLFxuICpcbiAqICAgICAgICAgIC8vIERpcmVjdGlvbiB0aGUgc3VibWVudSBvcGVucyByZWxhdGl2ZSB0byB0aGUgbWFpbiBtZW51LiBDYW4gYmVcbiAqICAgICAgICAgIC8vIGxlZnQsIHJpZ2h0LCBhYm92ZSwgb3IgYmVsb3cuIERlZmF1bHRzIHRvIFwicmlnaHRcIi5cbiAqICAgICAgICAgIHN1Ym1lbnVEaXJlY3Rpb246IFwicmlnaHRcIlxuICogICAgICB9KTtcbiAqXG4gKiBodHRwczovL2dpdGh1Yi5jb20va2FtZW5zL2pRdWVyeS1tZW51LWFpbVxuKi9cbihmdW5jdGlvbigkKSB7XG5cbiAgICAkLmZuLm1lbnVBaW0gPSBmdW5jdGlvbihvcHRzKSB7XG4gICAgICAgIC8vIEluaXRpYWxpemUgbWVudS1haW0gZm9yIGFsbCBlbGVtZW50cyBpbiBqUXVlcnkgY29sbGVjdGlvblxuICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpbml0LmNhbGwodGhpcywgb3B0cyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBpbml0KG9wdHMpIHtcbiAgICAgICAgdmFyICRtZW51ID0gJCh0aGlzKSxcbiAgICAgICAgICAgIGFjdGl2ZVJvdyA9IG51bGwsXG4gICAgICAgICAgICBtb3VzZUxvY3MgPSBbXSxcbiAgICAgICAgICAgIGxhc3REZWxheUxvYyA9IG51bGwsXG4gICAgICAgICAgICB0aW1lb3V0SWQgPSBudWxsLFxuICAgICAgICAgICAgb3B0aW9ucyA9ICQuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICByb3dTZWxlY3RvcjogXCI+IGxpXCIsXG4gICAgICAgICAgICAgICAgc3VibWVudVNlbGVjdG9yOiBcIipcIixcbiAgICAgICAgICAgICAgICBzdWJtZW51RGlyZWN0aW9uOiBcInJpZ2h0XCIsXG4gICAgICAgICAgICAgICAgdG9sZXJhbmNlOiA3NSwgIC8vIGJpZ2dlciA9IG1vcmUgZm9yZ2l2ZXkgd2hlbiBlbnRlcmluZyBzdWJtZW51XG4gICAgICAgICAgICAgICAgZW50ZXI6ICQubm9vcCxcbiAgICAgICAgICAgICAgICBleGl0OiAkLm5vb3AsXG4gICAgICAgICAgICAgICAgYWN0aXZhdGU6ICQubm9vcCxcbiAgICAgICAgICAgICAgICBkZWFjdGl2YXRlOiAkLm5vb3AsXG4gICAgICAgICAgICAgICAgZXhpdE1lbnU6ICQubm9vcFxuICAgICAgICAgICAgfSwgb3B0cyk7XG5cbiAgICAgICAgdmFyIE1PVVNFX0xPQ1NfVFJBQ0tFRCA9IDMsICAvLyBudW1iZXIgb2YgcGFzdCBtb3VzZSBsb2NhdGlvbnMgdG8gdHJhY2tcbiAgICAgICAgICAgIERFTEFZID0gMzAwOyAgLy8gbXMgZGVsYXkgd2hlbiB1c2VyIGFwcGVhcnMgdG8gYmUgZW50ZXJpbmcgc3VibWVudVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBLZWVwIHRyYWNrIG9mIHRoZSBsYXN0IGZldyBsb2NhdGlvbnMgb2YgdGhlIG1vdXNlLlxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIG1vdXNlbW92ZURvY3VtZW50ID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIG1vdXNlTG9jcy5wdXNoKHt4OiBlLnBhZ2VYLCB5OiBlLnBhZ2VZfSk7XG5cbiAgICAgICAgICAgICAgICBpZiAobW91c2VMb2NzLmxlbmd0aCA+IE1PVVNFX0xPQ1NfVFJBQ0tFRCkge1xuICAgICAgICAgICAgICAgICAgICBtb3VzZUxvY3Muc2hpZnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDYW5jZWwgcG9zc2libGUgcm93IGFjdGl2YXRpb25zIHdoZW4gbGVhdmluZyB0aGUgbWVudSBlbnRpcmVseVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIG1vdXNlbGVhdmVNZW51ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRpbWVvdXRJZCkge1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBJZiBleGl0TWVudSBpcyBzdXBwbGllZCBhbmQgcmV0dXJucyB0cnVlLCBkZWFjdGl2YXRlIHRoZVxuICAgICAgICAgICAgICAgIC8vIGN1cnJlbnRseSBhY3RpdmUgcm93IG9uIG1lbnUgZXhpdC5cbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5leGl0TWVudSh0aGlzKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYWN0aXZlUm93KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmRlYWN0aXZhdGUoYWN0aXZlUm93KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZVJvdyA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlciBhIHBvc3NpYmxlIHJvdyBhY3RpdmF0aW9uIHdoZW5ldmVyIGVudGVyaW5nIGEgbmV3IHJvdy5cbiAgICAgICAgICovXG4gICAgICAgIHZhciBtb3VzZWVudGVyUm93ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRpbWVvdXRJZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBDYW5jZWwgYW55IHByZXZpb3VzIGFjdGl2YXRpb24gZGVsYXlzXG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG9wdGlvbnMuZW50ZXIodGhpcyk7XG4gICAgICAgICAgICAgICAgcG9zc2libHlBY3RpdmF0ZSh0aGlzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtb3VzZWxlYXZlUm93ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5leGl0KHRoaXMpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAvKlxuICAgICAgICAgKiBJbW1lZGlhdGVseSBhY3RpdmF0ZSBhIHJvdyBpZiB0aGUgdXNlciBjbGlja3Mgb24gaXQuXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgY2xpY2tSb3cgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBhY3RpdmF0ZSh0aGlzKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFjdGl2YXRlIGEgbWVudSByb3cuXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgYWN0aXZhdGUgPSBmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgICAgICAgICBpZiAocm93ID09IGFjdGl2ZVJvdykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGFjdGl2ZVJvdykge1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmRlYWN0aXZhdGUoYWN0aXZlUm93KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBvcHRpb25zLmFjdGl2YXRlKHJvdyk7XG4gICAgICAgICAgICAgICAgYWN0aXZlUm93ID0gcm93O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUG9zc2libHkgYWN0aXZhdGUgYSBtZW51IHJvdy4gSWYgbW91c2UgbW92ZW1lbnQgaW5kaWNhdGVzIHRoYXQgd2VcbiAgICAgICAgICogc2hvdWxkbid0IGFjdGl2YXRlIHlldCBiZWNhdXNlIHVzZXIgbWF5IGJlIHRyeWluZyB0byBlbnRlclxuICAgICAgICAgKiBhIHN1Ym1lbnUncyBjb250ZW50LCB0aGVuIGRlbGF5IGFuZCBjaGVjayBhZ2FpbiBsYXRlci5cbiAgICAgICAgICovXG4gICAgICAgIHZhciBwb3NzaWJseUFjdGl2YXRlID0gZnVuY3Rpb24ocm93KSB7XG4gICAgICAgICAgICAgICAgdmFyIGRlbGF5ID0gYWN0aXZhdGlvbkRlbGF5KCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZGVsYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3NpYmx5QWN0aXZhdGUocm93KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgZGVsYXkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2YXRlKHJvdyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJuIHRoZSBhbW91bnQgb2YgdGltZSB0aGF0IHNob3VsZCBiZSB1c2VkIGFzIGEgZGVsYXkgYmVmb3JlIHRoZVxuICAgICAgICAgKiBjdXJyZW50bHkgaG92ZXJlZCByb3cgaXMgYWN0aXZhdGVkLlxuICAgICAgICAgKlxuICAgICAgICAgKiBSZXR1cm5zIDAgaWYgdGhlIGFjdGl2YXRpb24gc2hvdWxkIGhhcHBlbiBpbW1lZGlhdGVseS4gT3RoZXJ3aXNlLFxuICAgICAgICAgKiByZXR1cm5zIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRoYXQgc2hvdWxkIGJlIGRlbGF5ZWQgYmVmb3JlXG4gICAgICAgICAqIGNoZWNraW5nIGFnYWluIHRvIHNlZSBpZiB0aGUgcm93IHNob3VsZCBiZSBhY3RpdmF0ZWQuXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgYWN0aXZhdGlvbkRlbGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFhY3RpdmVSb3cgfHwgISQoYWN0aXZlUm93KS5pcyhvcHRpb25zLnN1Ym1lbnVTZWxlY3RvcikpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gb3RoZXIgc3VibWVudSByb3cgYWxyZWFkeSBhY3RpdmUsIHRoZW5cbiAgICAgICAgICAgICAgICAgICAgLy8gZ28gYWhlYWQgYW5kIGFjdGl2YXRlIGltbWVkaWF0ZWx5LlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gJG1lbnUub2Zmc2V0KCksXG4gICAgICAgICAgICAgICAgICAgIHVwcGVyTGVmdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IG9mZnNldC5sZWZ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogb2Zmc2V0LnRvcCAtIG9wdGlvbnMudG9sZXJhbmNlXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHVwcGVyUmlnaHQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBvZmZzZXQubGVmdCArICRtZW51Lm91dGVyV2lkdGgoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IHVwcGVyTGVmdC55XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGxvd2VyTGVmdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IG9mZnNldC5sZWZ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogb2Zmc2V0LnRvcCArICRtZW51Lm91dGVySGVpZ2h0KCkgKyBvcHRpb25zLnRvbGVyYW5jZVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBsb3dlclJpZ2h0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgeDogb2Zmc2V0LmxlZnQgKyAkbWVudS5vdXRlcldpZHRoKCksXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiBsb3dlckxlZnQueVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBsb2MgPSBtb3VzZUxvY3NbbW91c2VMb2NzLmxlbmd0aCAtIDFdLFxuICAgICAgICAgICAgICAgICAgICBwcmV2TG9jID0gbW91c2VMb2NzWzBdO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFsb2MpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCFwcmV2TG9jKSB7XG4gICAgICAgICAgICAgICAgICAgIHByZXZMb2MgPSBsb2M7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHByZXZMb2MueCA8IG9mZnNldC5sZWZ0IHx8IHByZXZMb2MueCA+IGxvd2VyUmlnaHQueCB8fFxuICAgICAgICAgICAgICAgICAgICBwcmV2TG9jLnkgPCBvZmZzZXQudG9wIHx8IHByZXZMb2MueSA+IGxvd2VyUmlnaHQueSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgcHJldmlvdXMgbW91c2UgbG9jYXRpb24gd2FzIG91dHNpZGUgb2YgdGhlIGVudGlyZVxuICAgICAgICAgICAgICAgICAgICAvLyBtZW51J3MgYm91bmRzLCBpbW1lZGlhdGVseSBhY3RpdmF0ZS5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGxhc3REZWxheUxvYyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jLnggPT0gbGFzdERlbGF5TG9jLnggJiYgbG9jLnkgPT0gbGFzdERlbGF5TG9jLnkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIG1vdXNlIGhhc24ndCBtb3ZlZCBzaW5jZSB0aGUgbGFzdCB0aW1lIHdlIGNoZWNrZWRcbiAgICAgICAgICAgICAgICAgICAgLy8gZm9yIGFjdGl2YXRpb24gc3RhdHVzLCBpbW1lZGlhdGVseSBhY3RpdmF0ZS5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gRGV0ZWN0IGlmIHRoZSB1c2VyIGlzIG1vdmluZyB0b3dhcmRzIHRoZSBjdXJyZW50bHkgYWN0aXZhdGVkXG4gICAgICAgICAgICAgICAgLy8gc3VibWVudS5cbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBtb3VzZSBpcyBoZWFkaW5nIHJlbGF0aXZlbHkgY2xlYXJseSB0b3dhcmRzXG4gICAgICAgICAgICAgICAgLy8gdGhlIHN1Ym1lbnUncyBjb250ZW50LCB3ZSBzaG91bGQgd2FpdCBhbmQgZ2l2ZSB0aGUgdXNlciBtb3JlXG4gICAgICAgICAgICAgICAgLy8gdGltZSBiZWZvcmUgYWN0aXZhdGluZyBhIG5ldyByb3cuIElmIHRoZSBtb3VzZSBpcyBoZWFkaW5nXG4gICAgICAgICAgICAgICAgLy8gZWxzZXdoZXJlLCB3ZSBjYW4gaW1tZWRpYXRlbHkgYWN0aXZhdGUgYSBuZXcgcm93LlxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgLy8gV2UgZGV0ZWN0IHRoaXMgYnkgY2FsY3VsYXRpbmcgdGhlIHNsb3BlIGZvcm1lZCBiZXR3ZWVuIHRoZVxuICAgICAgICAgICAgICAgIC8vIGN1cnJlbnQgbW91c2UgbG9jYXRpb24gYW5kIHRoZSB1cHBlci9sb3dlciByaWdodCBwb2ludHMgb2ZcbiAgICAgICAgICAgICAgICAvLyB0aGUgbWVudS4gV2UgZG8gdGhlIHNhbWUgZm9yIHRoZSBwcmV2aW91cyBtb3VzZSBsb2NhdGlvbi5cbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgY3VycmVudCBtb3VzZSBsb2NhdGlvbidzIHNsb3BlcyBhcmVcbiAgICAgICAgICAgICAgICAvLyBpbmNyZWFzaW5nL2RlY3JlYXNpbmcgYXBwcm9wcmlhdGVseSBjb21wYXJlZCB0byB0aGVcbiAgICAgICAgICAgICAgICAvLyBwcmV2aW91cydzLCB3ZSBrbm93IHRoZSB1c2VyIGlzIG1vdmluZyB0b3dhcmQgdGhlIHN1Ym1lbnUuXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAvLyBOb3RlIHRoYXQgc2luY2UgdGhlIHktYXhpcyBpbmNyZWFzZXMgYXMgdGhlIGN1cnNvciBtb3Zlc1xuICAgICAgICAgICAgICAgIC8vIGRvd24gdGhlIHNjcmVlbiwgd2UgYXJlIGxvb2tpbmcgZm9yIHRoZSBzbG9wZSBiZXR3ZWVuIHRoZVxuICAgICAgICAgICAgICAgIC8vIGN1cnNvciBhbmQgdGhlIHVwcGVyIHJpZ2h0IGNvcm5lciB0byBkZWNyZWFzZSBvdmVyIHRpbWUsIG5vdFxuICAgICAgICAgICAgICAgIC8vIGluY3JlYXNlIChzb21ld2hhdCBjb3VudGVyaW50dWl0aXZlbHkpLlxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHNsb3BlKGEsIGIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChiLnkgLSBhLnkpIC8gKGIueCAtIGEueCk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHZhciBkZWNyZWFzaW5nQ29ybmVyID0gdXBwZXJSaWdodCxcbiAgICAgICAgICAgICAgICAgICAgaW5jcmVhc2luZ0Nvcm5lciA9IGxvd2VyUmlnaHQ7XG5cbiAgICAgICAgICAgICAgICAvLyBPdXIgZXhwZWN0YXRpb25zIGZvciBkZWNyZWFzaW5nIG9yIGluY3JlYXNpbmcgc2xvcGUgdmFsdWVzXG4gICAgICAgICAgICAgICAgLy8gZGVwZW5kcyBvbiB3aGljaCBkaXJlY3Rpb24gdGhlIHN1Ym1lbnUgb3BlbnMgcmVsYXRpdmUgdG8gdGhlXG4gICAgICAgICAgICAgICAgLy8gbWFpbiBtZW51LiBCeSBkZWZhdWx0LCBpZiB0aGUgbWVudSBvcGVucyBvbiB0aGUgcmlnaHQsIHdlXG4gICAgICAgICAgICAgICAgLy8gZXhwZWN0IHRoZSBzbG9wZSBiZXR3ZWVuIHRoZSBjdXJzb3IgYW5kIHRoZSB1cHBlciByaWdodFxuICAgICAgICAgICAgICAgIC8vIGNvcm5lciB0byBkZWNyZWFzZSBvdmVyIHRpbWUsIGFzIGV4cGxhaW5lZCBhYm92ZS4gSWYgdGhlXG4gICAgICAgICAgICAgICAgLy8gc3VibWVudSBvcGVucyBpbiBhIGRpZmZlcmVudCBkaXJlY3Rpb24sIHdlIGNoYW5nZSBvdXIgc2xvcGVcbiAgICAgICAgICAgICAgICAvLyBleHBlY3RhdGlvbnMuXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuc3VibWVudURpcmVjdGlvbiA9PSBcImxlZnRcIikge1xuICAgICAgICAgICAgICAgICAgICBkZWNyZWFzaW5nQ29ybmVyID0gbG93ZXJMZWZ0O1xuICAgICAgICAgICAgICAgICAgICBpbmNyZWFzaW5nQ29ybmVyID0gdXBwZXJMZWZ0O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5zdWJtZW51RGlyZWN0aW9uID09IFwiYmVsb3dcIikge1xuICAgICAgICAgICAgICAgICAgICBkZWNyZWFzaW5nQ29ybmVyID0gbG93ZXJSaWdodDtcbiAgICAgICAgICAgICAgICAgICAgaW5jcmVhc2luZ0Nvcm5lciA9IGxvd2VyTGVmdDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuc3VibWVudURpcmVjdGlvbiA9PSBcImFib3ZlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVjcmVhc2luZ0Nvcm5lciA9IHVwcGVyTGVmdDtcbiAgICAgICAgICAgICAgICAgICAgaW5jcmVhc2luZ0Nvcm5lciA9IHVwcGVyUmlnaHQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGRlY3JlYXNpbmdTbG9wZSA9IHNsb3BlKGxvYywgZGVjcmVhc2luZ0Nvcm5lciksXG4gICAgICAgICAgICAgICAgICAgIGluY3JlYXNpbmdTbG9wZSA9IHNsb3BlKGxvYywgaW5jcmVhc2luZ0Nvcm5lciksXG4gICAgICAgICAgICAgICAgICAgIHByZXZEZWNyZWFzaW5nU2xvcGUgPSBzbG9wZShwcmV2TG9jLCBkZWNyZWFzaW5nQ29ybmVyKSxcbiAgICAgICAgICAgICAgICAgICAgcHJldkluY3JlYXNpbmdTbG9wZSA9IHNsb3BlKHByZXZMb2MsIGluY3JlYXNpbmdDb3JuZXIpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGRlY3JlYXNpbmdTbG9wZSA8IHByZXZEZWNyZWFzaW5nU2xvcGUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY3JlYXNpbmdTbG9wZSA+IHByZXZJbmNyZWFzaW5nU2xvcGUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTW91c2UgaXMgbW92aW5nIGZyb20gcHJldmlvdXMgbG9jYXRpb24gdG93YXJkcyB0aGVcbiAgICAgICAgICAgICAgICAgICAgLy8gY3VycmVudGx5IGFjdGl2YXRlZCBzdWJtZW51LiBEZWxheSBiZWZvcmUgYWN0aXZhdGluZyBhXG4gICAgICAgICAgICAgICAgICAgIC8vIG5ldyBtZW51IHJvdywgYmVjYXVzZSB1c2VyIG1heSBiZSBtb3ZpbmcgaW50byBzdWJtZW51LlxuICAgICAgICAgICAgICAgICAgICBsYXN0RGVsYXlMb2MgPSBsb2M7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBERUxBWTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsYXN0RGVsYXlMb2MgPSBudWxsO1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogSG9vayB1cCBpbml0aWFsIG1lbnUgZXZlbnRzXG4gICAgICAgICAqL1xuICAgICAgICAkbWVudVxuICAgICAgICAgICAgLm1vdXNlbGVhdmUobW91c2VsZWF2ZU1lbnUpXG4gICAgICAgICAgICAuZmluZChvcHRpb25zLnJvd1NlbGVjdG9yKVxuICAgICAgICAgICAgICAgIC5tb3VzZWVudGVyKG1vdXNlZW50ZXJSb3cpXG4gICAgICAgICAgICAgICAgLm1vdXNlbGVhdmUobW91c2VsZWF2ZVJvdylcbiAgICAgICAgICAgICAgICAuY2xpY2soY2xpY2tSb3cpO1xuXG4gICAgICAgICQoZG9jdW1lbnQpLm1vdXNlbW92ZShtb3VzZW1vdmVEb2N1bWVudCk7XG5cbiAgICB9O1xufSkoalF1ZXJ5KTtcblxuIiwiLyoqXG4gKiBjaXJjbGVzIC0gdjAuMC42IC0gMjAxNS0xMS0yN1xuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNSBsdWdvbGFic1xuICogTGljZW5zZWQgXG4gKi9cbiFmdW5jdGlvbihhLGIpe1wib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP21vZHVsZS5leHBvcnRzPWIoKTpcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtdLGIpOmEuQ2lyY2xlcz1iKCl9KHRoaXMsZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjt2YXIgYT13aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lfHx3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lfHx3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lfHx3aW5kb3cub1JlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lfHxmdW5jdGlvbihhKXtzZXRUaW1lb3V0KGEsMWUzLzYwKX0sYj1mdW5jdGlvbihhKXt2YXIgYj1hLmlkO2lmKHRoaXMuX2VsPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGIpLG51bGwhPT10aGlzLl9lbCl7dGhpcy5fcmFkaXVzPWEucmFkaXVzfHwxMCx0aGlzLl9kdXJhdGlvbj12b2lkIDA9PT1hLmR1cmF0aW9uPzUwMDphLmR1cmF0aW9uLHRoaXMuX3ZhbHVlPTAsdGhpcy5fbWF4VmFsdWU9YS5tYXhWYWx1ZXx8MTAwLHRoaXMuX3RleHQ9dm9pZCAwPT09YS50ZXh0P2Z1bmN0aW9uKGEpe3JldHVybiB0aGlzLmh0bWxpZnlOdW1iZXIoYSl9OmEudGV4dCx0aGlzLl9zdHJva2VXaWR0aD1hLndpZHRofHwxMCx0aGlzLl9jb2xvcnM9YS5jb2xvcnN8fFtcIiNFRUVcIixcIiNGMDBcIl0sdGhpcy5fc3ZnPW51bGwsdGhpcy5fbW92aW5nUGF0aD1udWxsLHRoaXMuX3dyYXBDb250YWluZXI9bnVsbCx0aGlzLl90ZXh0Q29udGFpbmVyPW51bGwsdGhpcy5fd3JwQ2xhc3M9YS53cnBDbGFzc3x8XCJjaXJjbGVzLXdycFwiLHRoaXMuX3RleHRDbGFzcz1hLnRleHRDbGFzc3x8XCJjaXJjbGVzLXRleHRcIix0aGlzLl92YWxDbGFzcz1hLnZhbHVlU3Ryb2tlQ2xhc3N8fFwiY2lyY2xlcy12YWx1ZVN0cm9rZVwiLHRoaXMuX21heFZhbENsYXNzPWEubWF4VmFsdWVTdHJva2VDbGFzc3x8XCJjaXJjbGVzLW1heFZhbHVlU3Ryb2tlXCIsdGhpcy5fc3R5bGVXcmFwcGVyPWEuc3R5bGVXcmFwcGVyPT09ITE/ITE6ITAsdGhpcy5fc3R5bGVUZXh0PWEuc3R5bGVUZXh0PT09ITE/ITE6ITA7dmFyIGM9TWF0aC5QSS8xODAqMjcwO3RoaXMuX3N0YXJ0PS1NYXRoLlBJLzE4MCo5MCx0aGlzLl9zdGFydFByZWNpc2U9dGhpcy5fcHJlY2lzZSh0aGlzLl9zdGFydCksdGhpcy5fY2lyYz1jLXRoaXMuX3N0YXJ0LHRoaXMuX2dlbmVyYXRlKCkudXBkYXRlKGEudmFsdWV8fDApfX07cmV0dXJuIGIucHJvdG90eXBlPXtWRVJTSU9OOlwiMC4wLjZcIixfZ2VuZXJhdGU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fc3ZnU2l6ZT0yKnRoaXMuX3JhZGl1cyx0aGlzLl9yYWRpdXNBZGp1c3RlZD10aGlzLl9yYWRpdXMtdGhpcy5fc3Ryb2tlV2lkdGgvMix0aGlzLl9nZW5lcmF0ZVN2ZygpLl9nZW5lcmF0ZVRleHQoKS5fZ2VuZXJhdGVXcmFwcGVyKCksdGhpcy5fZWwuaW5uZXJIVE1MPVwiXCIsdGhpcy5fZWwuYXBwZW5kQ2hpbGQodGhpcy5fd3JhcENvbnRhaW5lciksdGhpc30sX3NldFBlcmNlbnRhZ2U6ZnVuY3Rpb24oYSl7dGhpcy5fbW92aW5nUGF0aC5zZXRBdHRyaWJ1dGUoXCJkXCIsdGhpcy5fY2FsY3VsYXRlUGF0aChhLCEwKSksdGhpcy5fdGV4dENvbnRhaW5lci5pbm5lckhUTUw9dGhpcy5fZ2V0VGV4dCh0aGlzLmdldFZhbHVlRnJvbVBlcmNlbnQoYSkpfSxfZ2VuZXJhdGVXcmFwcGVyOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3dyYXBDb250YWluZXI9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSx0aGlzLl93cmFwQ29udGFpbmVyLmNsYXNzTmFtZT10aGlzLl93cnBDbGFzcyx0aGlzLl9zdHlsZVdyYXBwZXImJih0aGlzLl93cmFwQ29udGFpbmVyLnN0eWxlLnBvc2l0aW9uPVwicmVsYXRpdmVcIix0aGlzLl93cmFwQ29udGFpbmVyLnN0eWxlLmRpc3BsYXk9XCJpbmxpbmUtYmxvY2tcIiksdGhpcy5fd3JhcENvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9zdmcpLHRoaXMuX3dyYXBDb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fdGV4dENvbnRhaW5lciksdGhpc30sX2dlbmVyYXRlVGV4dDpmdW5jdGlvbigpe2lmKHRoaXMuX3RleHRDb250YWluZXI9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSx0aGlzLl90ZXh0Q29udGFpbmVyLmNsYXNzTmFtZT10aGlzLl90ZXh0Q2xhc3MsdGhpcy5fc3R5bGVUZXh0KXt2YXIgYT17cG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDowLGxlZnQ6MCx0ZXh0QWxpZ246XCJjZW50ZXJcIix3aWR0aDpcIjEwMCVcIixmb250U2l6ZTouNyp0aGlzLl9yYWRpdXMrXCJweFwiLGhlaWdodDp0aGlzLl9zdmdTaXplK1wicHhcIixsaW5lSGVpZ2h0OnRoaXMuX3N2Z1NpemUrXCJweFwifTtmb3IodmFyIGIgaW4gYSl0aGlzLl90ZXh0Q29udGFpbmVyLnN0eWxlW2JdPWFbYl19cmV0dXJuIHRoaXMuX3RleHRDb250YWluZXIuaW5uZXJIVE1MPXRoaXMuX2dldFRleHQoMCksdGhpc30sX2dldFRleHQ6ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuX3RleHQ/KHZvaWQgMD09PWEmJihhPXRoaXMuX3ZhbHVlKSxhPXBhcnNlRmxvYXQoYS50b0ZpeGVkKDIpKSxcImZ1bmN0aW9uXCI9PXR5cGVvZiB0aGlzLl90ZXh0P3RoaXMuX3RleHQuY2FsbCh0aGlzLGEpOnRoaXMuX3RleHQpOlwiXCJ9LF9nZW5lcmF0ZVN2ZzpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9zdmc9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIixcInN2Z1wiKSx0aGlzLl9zdmcuc2V0QXR0cmlidXRlKFwieG1sbnNcIixcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIpLHRoaXMuX3N2Zy5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLHRoaXMuX3N2Z1NpemUpLHRoaXMuX3N2Zy5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIix0aGlzLl9zdmdTaXplKSx0aGlzLl9nZW5lcmF0ZVBhdGgoMTAwLCExLHRoaXMuX2NvbG9yc1swXSx0aGlzLl9tYXhWYWxDbGFzcykuX2dlbmVyYXRlUGF0aCgxLCEwLHRoaXMuX2NvbG9yc1sxXSx0aGlzLl92YWxDbGFzcyksdGhpcy5fbW92aW5nUGF0aD10aGlzLl9zdmcuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJwYXRoXCIpWzFdLHRoaXN9LF9nZW5lcmF0ZVBhdGg6ZnVuY3Rpb24oYSxiLGMsZCl7dmFyIGU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIixcInBhdGhcIik7cmV0dXJuIGUuc2V0QXR0cmlidXRlKFwiZmlsbFwiLFwidHJhbnNwYXJlbnRcIiksZS5zZXRBdHRyaWJ1dGUoXCJzdHJva2VcIixjKSxlLnNldEF0dHJpYnV0ZShcInN0cm9rZS13aWR0aFwiLHRoaXMuX3N0cm9rZVdpZHRoKSxlLnNldEF0dHJpYnV0ZShcImRcIix0aGlzLl9jYWxjdWxhdGVQYXRoKGEsYikpLGUuc2V0QXR0cmlidXRlKFwiY2xhc3NcIixkKSx0aGlzLl9zdmcuYXBwZW5kQ2hpbGQoZSksdGhpc30sX2NhbGN1bGF0ZVBhdGg6ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzLl9zdGFydCthLzEwMCp0aGlzLl9jaXJjLGQ9dGhpcy5fcHJlY2lzZShjKTtyZXR1cm4gdGhpcy5fYXJjKGQsYil9LF9hcmM6ZnVuY3Rpb24oYSxiKXt2YXIgYz1hLS4wMDEsZD1hLXRoaXMuX3N0YXJ0UHJlY2lzZTxNYXRoLlBJPzA6MTtyZXR1cm5bXCJNXCIsdGhpcy5fcmFkaXVzK3RoaXMuX3JhZGl1c0FkanVzdGVkKk1hdGguY29zKHRoaXMuX3N0YXJ0UHJlY2lzZSksdGhpcy5fcmFkaXVzK3RoaXMuX3JhZGl1c0FkanVzdGVkKk1hdGguc2luKHRoaXMuX3N0YXJ0UHJlY2lzZSksXCJBXCIsdGhpcy5fcmFkaXVzQWRqdXN0ZWQsdGhpcy5fcmFkaXVzQWRqdXN0ZWQsMCxkLDEsdGhpcy5fcmFkaXVzK3RoaXMuX3JhZGl1c0FkanVzdGVkKk1hdGguY29zKGMpLHRoaXMuX3JhZGl1cyt0aGlzLl9yYWRpdXNBZGp1c3RlZCpNYXRoLnNpbihjKSxiP1wiXCI6XCJaXCJdLmpvaW4oXCIgXCIpfSxfcHJlY2lzZTpmdW5jdGlvbihhKXtyZXR1cm4gTWF0aC5yb3VuZCgxZTMqYSkvMWUzfSxodG1saWZ5TnVtYmVyOmZ1bmN0aW9uKGEsYixjKXtiPWJ8fFwiY2lyY2xlcy1pbnRlZ2VyXCIsYz1jfHxcImNpcmNsZXMtZGVjaW1hbHNcIjt2YXIgZD0oYStcIlwiKS5zcGxpdChcIi5cIiksZT0nPHNwYW4gY2xhc3M9XCInK2IrJ1wiPicrZFswXStcIjwvc3Bhbj5cIjtyZXR1cm4gZC5sZW5ndGg+MSYmKGUrPScuPHNwYW4gY2xhc3M9XCInK2MrJ1wiPicrZFsxXS5zdWJzdHJpbmcoMCwyKStcIjwvc3Bhbj5cIiksZX0sdXBkYXRlUmFkaXVzOmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLl9yYWRpdXM9YSx0aGlzLl9nZW5lcmF0ZSgpLnVwZGF0ZSghMCl9LHVwZGF0ZVdpZHRoOmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLl9zdHJva2VXaWR0aD1hLHRoaXMuX2dlbmVyYXRlKCkudXBkYXRlKCEwKX0sdXBkYXRlQ29sb3JzOmZ1bmN0aW9uKGEpe3RoaXMuX2NvbG9ycz1hO3ZhciBiPXRoaXMuX3N2Zy5nZXRFbGVtZW50c0J5VGFnTmFtZShcInBhdGhcIik7cmV0dXJuIGJbMF0uc2V0QXR0cmlidXRlKFwic3Ryb2tlXCIsYVswXSksYlsxXS5zZXRBdHRyaWJ1dGUoXCJzdHJva2VcIixhWzFdKSx0aGlzfSxnZXRQZXJjZW50OmZ1bmN0aW9uKCl7cmV0dXJuIDEwMCp0aGlzLl92YWx1ZS90aGlzLl9tYXhWYWx1ZX0sZ2V0VmFsdWVGcm9tUGVyY2VudDpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5fbWF4VmFsdWUqYS8xMDB9LGdldFZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3ZhbHVlfSxnZXRNYXhWYWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9tYXhWYWx1ZX0sdXBkYXRlOmZ1bmN0aW9uKGIsYyl7aWYoYj09PSEwKXJldHVybiB0aGlzLl9zZXRQZXJjZW50YWdlKHRoaXMuZ2V0UGVyY2VudCgpKSx0aGlzO2lmKHRoaXMuX3ZhbHVlPT1ifHxpc05hTihiKSlyZXR1cm4gdGhpczt2b2lkIDA9PT1jJiYoYz10aGlzLl9kdXJhdGlvbik7dmFyIGQsZSxmLGcsaD10aGlzLGk9aC5nZXRQZXJjZW50KCksaj0xO3JldHVybiB0aGlzLl92YWx1ZT1NYXRoLm1pbih0aGlzLl9tYXhWYWx1ZSxNYXRoLm1heCgwLGIpKSxjPyhkPWguZ2V0UGVyY2VudCgpLGU9ZD5pLGorPWQlMSxmPU1hdGguZmxvb3IoTWF0aC5hYnMoZC1pKS9qKSxnPWMvZixmdW5jdGlvbiBrKGIpe2lmKGU/aSs9ajppLT1qLGUmJmk+PWR8fCFlJiZkPj1pKXJldHVybiB2b2lkIGEoZnVuY3Rpb24oKXtoLl9zZXRQZXJjZW50YWdlKGQpfSk7YShmdW5jdGlvbigpe2guX3NldFBlcmNlbnRhZ2UoaSl9KTt2YXIgYz1EYXRlLm5vdygpLGY9Yy1iO2Y+PWc/ayhjKTpzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ayhEYXRlLm5vdygpKX0sZy1mKX0oRGF0ZS5ub3coKSksdGhpcyk6KHRoaXMuX3NldFBlcmNlbnRhZ2UodGhpcy5nZXRQZXJjZW50KCkpLHRoaXMpfX0sYi5jcmVhdGU9ZnVuY3Rpb24oYSl7cmV0dXJuIG5ldyBiKGEpfSxifSk7IiwidmFyIERhdGVwaWNrZXI7XG5cbihmdW5jdGlvbiAod2luZG93LCAkLCB1bmRlZmluZWQpIHtcbiAgICB2YXIgcGx1Z2luTmFtZSA9ICdkYXRlcGlja2VyJyxcbiAgICAgICAgYXV0b0luaXRTZWxlY3RvciA9ICcuZGF0ZXBpY2tlci1oZXJlJyxcbiAgICAgICAgJGJvZHksICRkYXRlcGlja2Vyc0NvbnRhaW5lcixcbiAgICAgICAgY29udGFpbmVyQnVpbHQgPSBmYWxzZSxcbiAgICAgICAgYmFzZVRlbXBsYXRlID0gJycgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyXCI+JyArXG4gICAgICAgICAgICAnPG5hdiBjbGFzcz1cImRhdGVwaWNrZXItLW5hdlwiPjwvbmF2PicgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1jb250ZW50XCI+PC9kaXY+JyArXG4gICAgICAgICAgICAnPC9kaXY+JyxcbiAgICAgICAgZGVmYXVsdHMgPSB7XG4gICAgICAgICAgICBjbGFzc2VzOiAnJyxcbiAgICAgICAgICAgIGlubGluZTogZmFsc2UsXG4gICAgICAgICAgICBsYW5ndWFnZTogJ3J1JyxcbiAgICAgICAgICAgIHN0YXJ0RGF0ZTogbmV3IERhdGUoKSxcbiAgICAgICAgICAgIGZpcnN0RGF5OiAnJyxcbiAgICAgICAgICAgIHdlZWtlbmRzOiBbNiwgMF0sXG4gICAgICAgICAgICBkYXRlRm9ybWF0OiAnJyxcbiAgICAgICAgICAgIGFsdEZpZWxkOiAnJyxcbiAgICAgICAgICAgIGFsdEZpZWxkRGF0ZUZvcm1hdDogJ0AnLFxuICAgICAgICAgICAgdG9nZ2xlU2VsZWN0ZWQ6IHRydWUsXG4gICAgICAgICAgICBrZXlib2FyZE5hdjogdHJ1ZSxcblxuICAgICAgICAgICAgcG9zaXRpb246ICdib3R0b20gbGVmdCcsXG4gICAgICAgICAgICBvZmZzZXQ6IDEyLFxuXG4gICAgICAgICAgICB2aWV3OiAnZGF5cycsXG4gICAgICAgICAgICBtaW5WaWV3OiAnZGF5cycsXG5cbiAgICAgICAgICAgIHNob3dPdGhlck1vbnRoczogdHJ1ZSxcbiAgICAgICAgICAgIHNlbGVjdE90aGVyTW9udGhzOiB0cnVlLFxuICAgICAgICAgICAgbW92ZVRvT3RoZXJNb250aHNPblNlbGVjdDogdHJ1ZSxcblxuICAgICAgICAgICAgc2hvd090aGVyWWVhcnM6IHRydWUsXG4gICAgICAgICAgICBzZWxlY3RPdGhlclllYXJzOiB0cnVlLFxuICAgICAgICAgICAgbW92ZVRvT3RoZXJZZWFyc09uU2VsZWN0OiB0cnVlLFxuXG4gICAgICAgICAgICBtaW5EYXRlOiAnJyxcbiAgICAgICAgICAgIG1heERhdGU6ICcnLFxuICAgICAgICAgICAgZGlzYWJsZU5hdldoZW5PdXRPZlJhbmdlOiB0cnVlLFxuXG4gICAgICAgICAgICBtdWx0aXBsZURhdGVzOiBmYWxzZSwgLy8gQm9vbGVhbiBvciBOdW1iZXJcbiAgICAgICAgICAgIG11bHRpcGxlRGF0ZXNTZXBhcmF0b3I6ICcsJyxcbiAgICAgICAgICAgIHJhbmdlOiBmYWxzZSxcblxuICAgICAgICAgICAgdG9kYXlCdXR0b246IGZhbHNlLFxuICAgICAgICAgICAgY2xlYXJCdXR0b246IGZhbHNlLFxuXG4gICAgICAgICAgICBzaG93RXZlbnQ6ICdmb2N1cycsXG4gICAgICAgICAgICBhdXRvQ2xvc2U6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyBuYXZpZ2F0aW9uXG4gICAgICAgICAgICBtb250aHNGaWVsZDogJ21vbnRoc1Nob3J0JyxcbiAgICAgICAgICAgIHByZXZIdG1sOiAnPHN2Zz48cGF0aCBkPVwiTSAxNywxMiBsIC01LDUgbCA1LDVcIj48L3BhdGg+PC9zdmc+JyxcbiAgICAgICAgICAgIG5leHRIdG1sOiAnPHN2Zz48cGF0aCBkPVwiTSAxNCwxMiBsIDUsNSBsIC01LDVcIj48L3BhdGg+PC9zdmc+JyxcbiAgICAgICAgICAgIG5hdlRpdGxlczoge1xuICAgICAgICAgICAgICAgIGRheXM6ICdNTSwgPGk+eXl5eTwvaT4nLFxuICAgICAgICAgICAgICAgIG1vbnRoczogJ3l5eXknLFxuICAgICAgICAgICAgICAgIHllYXJzOiAneXl5eTEgLSB5eXl5MidcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8vIGV2ZW50c1xuICAgICAgICAgICAgb25TZWxlY3Q6ICcnLFxuICAgICAgICAgICAgb25DaGFuZ2VNb250aDogJycsXG4gICAgICAgICAgICBvbkNoYW5nZVllYXI6ICcnLFxuICAgICAgICAgICAgb25DaGFuZ2VEZWNhZGU6ICcnLFxuICAgICAgICAgICAgb25DaGFuZ2VWaWV3OiAnJyxcbiAgICAgICAgICAgIG9uUmVuZGVyQ2VsbDogJydcbiAgICAgICAgfSxcbiAgICAgICAgaG90S2V5cyA9IHtcbiAgICAgICAgICAgICdjdHJsUmlnaHQnOiBbMTcsIDM5XSxcbiAgICAgICAgICAgICdjdHJsVXAnOiBbMTcsIDM4XSxcbiAgICAgICAgICAgICdjdHJsTGVmdCc6IFsxNywgMzddLFxuICAgICAgICAgICAgJ2N0cmxEb3duJzogWzE3LCA0MF0sXG4gICAgICAgICAgICAnc2hpZnRSaWdodCc6IFsxNiwgMzldLFxuICAgICAgICAgICAgJ3NoaWZ0VXAnOiBbMTYsIDM4XSxcbiAgICAgICAgICAgICdzaGlmdExlZnQnOiBbMTYsIDM3XSxcbiAgICAgICAgICAgICdzaGlmdERvd24nOiBbMTYsIDQwXSxcbiAgICAgICAgICAgICdhbHRVcCc6IFsxOCwgMzhdLFxuICAgICAgICAgICAgJ2FsdFJpZ2h0JzogWzE4LCAzOV0sXG4gICAgICAgICAgICAnYWx0TGVmdCc6IFsxOCwgMzddLFxuICAgICAgICAgICAgJ2FsdERvd24nOiBbMTgsIDQwXSxcbiAgICAgICAgICAgICdjdHJsU2hpZnRVcCc6IFsxNiwgMTcsIDM4XVxuICAgICAgICB9LFxuICAgICAgICBkYXRlcGlja2VyO1xuXG4gICAgRGF0ZXBpY2tlciAgPSBmdW5jdGlvbiAoZWwsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5lbCA9IGVsO1xuICAgICAgICB0aGlzLiRlbCA9ICQoZWwpO1xuXG4gICAgICAgIHRoaXMub3B0cyA9ICQuZXh0ZW5kKHRydWUsIHt9LCBkZWZhdWx0cywgb3B0aW9ucywgdGhpcy4kZWwuZGF0YSgpKTtcblxuICAgICAgICBpZiAoJGJvZHkgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAkYm9keSA9ICQoJ2JvZHknKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5vcHRzLnN0YXJ0RGF0ZSkge1xuICAgICAgICAgICAgdGhpcy5vcHRzLnN0YXJ0RGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5lbC5ub2RlTmFtZSA9PSAnSU5QVVQnKSB7XG4gICAgICAgICAgICB0aGlzLmVsSXNJbnB1dCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRzLmFsdEZpZWxkKSB7XG4gICAgICAgICAgICB0aGlzLiRhbHRGaWVsZCA9IHR5cGVvZiB0aGlzLm9wdHMuYWx0RmllbGQgPT0gJ3N0cmluZycgPyAkKHRoaXMub3B0cy5hbHRGaWVsZCkgOiB0aGlzLm9wdHMuYWx0RmllbGQ7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmluaXRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zaWxlbnQgPSBmYWxzZTsgLy8gTmVlZCB0byBwcmV2ZW50IHVubmVjZXNzYXJ5IHJlbmRlcmluZ1xuXG4gICAgICAgIHRoaXMuY3VycmVudERhdGUgPSB0aGlzLm9wdHMuc3RhcnREYXRlO1xuICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gdGhpcy5vcHRzLnZpZXc7XG4gICAgICAgIHRoaXMuX2NyZWF0ZVNob3J0Q3V0cygpO1xuICAgICAgICB0aGlzLnNlbGVjdGVkRGF0ZXMgPSBbXTtcbiAgICAgICAgdGhpcy52aWV3cyA9IHt9O1xuICAgICAgICB0aGlzLmtleXMgPSBbXTtcbiAgICAgICAgdGhpcy5taW5SYW5nZSA9ICcnO1xuICAgICAgICB0aGlzLm1heFJhbmdlID0gJyc7XG5cbiAgICAgICAgdGhpcy5pbml0KClcbiAgICB9O1xuXG4gICAgZGF0ZXBpY2tlciA9IERhdGVwaWNrZXI7XG5cbiAgICBkYXRlcGlja2VyLnByb3RvdHlwZSA9IHtcbiAgICAgICAgdmlld0luZGV4ZXM6IFsnZGF5cycsICdtb250aHMnLCAneWVhcnMnXSxcblxuICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIWNvbnRhaW5lckJ1aWx0ICYmICF0aGlzLm9wdHMuaW5saW5lICYmIHRoaXMuZWxJc0lucHV0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYnVpbGREYXRlcGlja2Vyc0NvbnRhaW5lcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fYnVpbGRCYXNlSHRtbCgpO1xuICAgICAgICAgICAgdGhpcy5fZGVmaW5lTG9jYWxlKHRoaXMub3B0cy5sYW5ndWFnZSk7XG4gICAgICAgICAgICB0aGlzLl9zeW5jV2l0aE1pbk1heERhdGVzKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmVsSXNJbnB1dCkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5vcHRzLmlubGluZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBTZXQgZXh0cmEgY2xhc3NlcyBmb3IgcHJvcGVyIHRyYW5zaXRpb25zXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldFBvc2l0aW9uQ2xhc3Nlcyh0aGlzLm9wdHMucG9zaXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9iaW5kRXZlbnRzKClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5rZXlib2FyZE5hdikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9iaW5kS2V5Ym9hcmRFdmVudHMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlci5vbignbW91c2Vkb3duJywgdGhpcy5fb25Nb3VzZURvd25EYXRlcGlja2VyLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXIub24oJ21vdXNldXAnLCB0aGlzLl9vbk1vdXNlVXBEYXRlcGlja2VyLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLmNsYXNzZXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyLmFkZENsYXNzKHRoaXMub3B0cy5jbGFzc2VzKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnZpZXdzW3RoaXMuY3VycmVudFZpZXddID0gbmV3IERhdGVwaWNrZXIuQm9keSh0aGlzLCB0aGlzLmN1cnJlbnRWaWV3LCB0aGlzLm9wdHMpO1xuICAgICAgICAgICAgdGhpcy52aWV3c1t0aGlzLmN1cnJlbnRWaWV3XS5zaG93KCk7XG4gICAgICAgICAgICB0aGlzLm5hdiA9IG5ldyBEYXRlcGlja2VyLk5hdmlnYXRpb24odGhpcywgdGhpcy5vcHRzKTtcbiAgICAgICAgICAgIHRoaXMudmlldyA9IHRoaXMuY3VycmVudFZpZXc7XG5cbiAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXIub24oJ21vdXNlZW50ZXInLCAnLmRhdGVwaWNrZXItLWNlbGwnLCB0aGlzLl9vbk1vdXNlRW50ZXJDZWxsLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlci5vbignbW91c2VsZWF2ZScsICcuZGF0ZXBpY2tlci0tY2VsbCcsIHRoaXMuX29uTW91c2VMZWF2ZUNlbGwuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgIHRoaXMuaW5pdGVkID0gdHJ1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBfY3JlYXRlU2hvcnRDdXRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLm1pbkRhdGUgPSB0aGlzLm9wdHMubWluRGF0ZSA/IHRoaXMub3B0cy5taW5EYXRlIDogbmV3IERhdGUoLTg2Mzk5OTk5MTM2MDAwMDApO1xuICAgICAgICAgICAgdGhpcy5tYXhEYXRlID0gdGhpcy5vcHRzLm1heERhdGUgPyB0aGlzLm9wdHMubWF4RGF0ZSA6IG5ldyBEYXRlKDg2Mzk5OTk5MTM2MDAwMDApO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9iaW5kRXZlbnRzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwub24odGhpcy5vcHRzLnNob3dFdmVudCArICcuYWRwJywgdGhpcy5fb25TaG93RXZlbnQuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB0aGlzLiRlbC5vbignYmx1ci5hZHAnLCB0aGlzLl9vbkJsdXIuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB0aGlzLiRlbC5vbignaW5wdXQuYWRwJywgdGhpcy5fb25JbnB1dC5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICQod2luZG93KS5vbigncmVzaXplLmFkcCcsIHRoaXMuX29uUmVzaXplLmJpbmQodGhpcykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9iaW5kS2V5Ym9hcmRFdmVudHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLm9uKCdrZXlkb3duLmFkcCcsIHRoaXMuX29uS2V5RG93bi5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHRoaXMuJGVsLm9uKCdrZXl1cC5hZHAnLCB0aGlzLl9vbktleVVwLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgdGhpcy4kZWwub24oJ2hvdEtleS5hZHAnLCB0aGlzLl9vbkhvdEtleS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc1dlZWtlbmQ6IGZ1bmN0aW9uIChkYXkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdHMud2Vla2VuZHMuaW5kZXhPZihkYXkpICE9PSAtMTtcbiAgICAgICAgfSxcblxuICAgICAgICBfZGVmaW5lTG9jYWxlOiBmdW5jdGlvbiAobGFuZykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBsYW5nID09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2MgPSBEYXRlcGlja2VyLmxhbmd1YWdlW2xhbmddO1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5sb2MpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdDYW5cXCd0IGZpbmQgbGFuZ3VhZ2UgXCInICsgbGFuZyArICdcIiBpbiBEYXRlcGlja2VyLmxhbmd1YWdlLCB3aWxsIHVzZSBcInJ1XCIgaW5zdGVhZCcpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYyA9ICQuZXh0ZW5kKHRydWUsIHt9LCBEYXRlcGlja2VyLmxhbmd1YWdlLnJ1KVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMubG9jID0gJC5leHRlbmQodHJ1ZSwge30sIERhdGVwaWNrZXIubGFuZ3VhZ2UucnUsIERhdGVwaWNrZXIubGFuZ3VhZ2VbbGFuZ10pXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubG9jID0gJC5leHRlbmQodHJ1ZSwge30sIERhdGVwaWNrZXIubGFuZ3VhZ2UucnUsIGxhbmcpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMuZGF0ZUZvcm1hdCkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9jLmRhdGVGb3JtYXQgPSB0aGlzLm9wdHMuZGF0ZUZvcm1hdFxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLmZpcnN0RGF5ICE9PSAnJykge1xuICAgICAgICAgICAgICAgIHRoaXMubG9jLmZpcnN0RGF5ID0gdGhpcy5vcHRzLmZpcnN0RGF5XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2J1aWxkRGF0ZXBpY2tlcnNDb250YWluZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnRhaW5lckJ1aWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgICRib2R5LmFwcGVuZCgnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXJzLWNvbnRhaW5lclwiIGlkPVwiZGF0ZXBpY2tlcnMtY29udGFpbmVyXCI+PC9kaXY+Jyk7XG4gICAgICAgICAgICAkZGF0ZXBpY2tlcnNDb250YWluZXIgPSAkKCcjZGF0ZXBpY2tlcnMtY29udGFpbmVyJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2J1aWxkQmFzZUh0bWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciAkYXBwZW5kVGFyZ2V0LFxuICAgICAgICAgICAgICAgICRpbmxpbmUgPSAkKCc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci1pbmxpbmVcIj4nKTtcblxuICAgICAgICAgICAgaWYodGhpcy5lbC5ub2RlTmFtZSA9PSAnSU5QVVQnKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm9wdHMuaW5saW5lKSB7XG4gICAgICAgICAgICAgICAgICAgICRhcHBlbmRUYXJnZXQgPSAkZGF0ZXBpY2tlcnNDb250YWluZXI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJGFwcGVuZFRhcmdldCA9ICRpbmxpbmUuaW5zZXJ0QWZ0ZXIodGhpcy4kZWwpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkYXBwZW5kVGFyZ2V0ID0gJGlubGluZS5hcHBlbmRUbyh0aGlzLiRlbClcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlciA9ICQoYmFzZVRlbXBsYXRlKS5hcHBlbmRUbygkYXBwZW5kVGFyZ2V0KTtcbiAgICAgICAgICAgIHRoaXMuJGNvbnRlbnQgPSAkKCcuZGF0ZXBpY2tlci0tY29udGVudCcsIHRoaXMuJGRhdGVwaWNrZXIpO1xuICAgICAgICAgICAgdGhpcy4kbmF2ID0gJCgnLmRhdGVwaWNrZXItLW5hdicsIHRoaXMuJGRhdGVwaWNrZXIpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF90cmlnZ2VyT25DaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5zZWxlY3RlZERhdGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdHMub25TZWxlY3QoJycsICcnLCB0aGlzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHNlbGVjdGVkRGF0ZXMgPSB0aGlzLnNlbGVjdGVkRGF0ZXMsXG4gICAgICAgICAgICAgICAgcGFyc2VkU2VsZWN0ZWQgPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUoc2VsZWN0ZWREYXRlc1swXSksXG4gICAgICAgICAgICAgICAgZm9ybWF0dGVkRGF0ZXMsXG4gICAgICAgICAgICAgICAgX3RoaXMgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGRhdGVzID0gbmV3IERhdGUocGFyc2VkU2VsZWN0ZWQueWVhciwgcGFyc2VkU2VsZWN0ZWQubW9udGgsIHBhcnNlZFNlbGVjdGVkLmRhdGUpO1xuXG4gICAgICAgICAgICAgICAgZm9ybWF0dGVkRGF0ZXMgPSBzZWxlY3RlZERhdGVzLm1hcChmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuZm9ybWF0RGF0ZShfdGhpcy5sb2MuZGF0ZUZvcm1hdCwgZGF0ZSlcbiAgICAgICAgICAgICAgICB9KS5qb2luKHRoaXMub3B0cy5tdWx0aXBsZURhdGVzU2VwYXJhdG9yKTtcblxuICAgICAgICAgICAgLy8gQ3JlYXRlIG5ldyBkYXRlcyBhcnJheSwgdG8gc2VwYXJhdGUgaXQgZnJvbSBvcmlnaW5hbCBzZWxlY3RlZERhdGVzXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLm11bHRpcGxlRGF0ZXMgfHwgdGhpcy5vcHRzLnJhbmdlKSB7XG4gICAgICAgICAgICAgICAgZGF0ZXMgPSBzZWxlY3RlZERhdGVzLm1hcChmdW5jdGlvbihkYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJzZWREYXRlID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKGRhdGUpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IERhdGUocGFyc2VkRGF0ZS55ZWFyLCBwYXJzZWREYXRlLm1vbnRoLCBwYXJzZWREYXRlLmRhdGUpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5vcHRzLm9uU2VsZWN0KGZvcm1hdHRlZERhdGVzLCBkYXRlcywgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGQgPSB0aGlzLnBhcnNlZERhdGUsXG4gICAgICAgICAgICAgICAgbyA9IHRoaXMub3B0cztcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy52aWV3KSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnZGF5cyc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKGQueWVhciwgZC5tb250aCArIDEsIDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoby5vbkNoYW5nZU1vbnRoKSBvLm9uQ2hhbmdlTW9udGgodGhpcy5wYXJzZWREYXRlLm1vbnRoLCB0aGlzLnBhcnNlZERhdGUueWVhcik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ21vbnRocyc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKGQueWVhciArIDEsIGQubW9udGgsIDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoby5vbkNoYW5nZVllYXIpIG8ub25DaGFuZ2VZZWFyKHRoaXMucGFyc2VkRGF0ZS55ZWFyKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAneWVhcnMnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShkLnllYXIgKyAxMCwgMCwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvLm9uQ2hhbmdlRGVjYWRlKSBvLm9uQ2hhbmdlRGVjYWRlKHRoaXMuY3VyRGVjYWRlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgcHJldjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGQgPSB0aGlzLnBhcnNlZERhdGUsXG4gICAgICAgICAgICAgICAgbyA9IHRoaXMub3B0cztcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy52aWV3KSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnZGF5cyc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKGQueWVhciwgZC5tb250aCAtIDEsIDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoby5vbkNoYW5nZU1vbnRoKSBvLm9uQ2hhbmdlTW9udGgodGhpcy5wYXJzZWREYXRlLm1vbnRoLCB0aGlzLnBhcnNlZERhdGUueWVhcik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ21vbnRocyc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKGQueWVhciAtIDEsIGQubW9udGgsIDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoby5vbkNoYW5nZVllYXIpIG8ub25DaGFuZ2VZZWFyKHRoaXMucGFyc2VkRGF0ZS55ZWFyKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAneWVhcnMnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShkLnllYXIgLSAxMCwgMCwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvLm9uQ2hhbmdlRGVjYWRlKSBvLm9uQ2hhbmdlRGVjYWRlKHRoaXMuY3VyRGVjYWRlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZm9ybWF0RGF0ZTogZnVuY3Rpb24gKHN0cmluZywgZGF0ZSkge1xuICAgICAgICAgICAgZGF0ZSA9IGRhdGUgfHwgdGhpcy5kYXRlO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHN0cmluZyxcbiAgICAgICAgICAgICAgICBib3VuZGFyeSA9IHRoaXMuX2dldFdvcmRCb3VuZGFyeVJlZ0V4cCxcbiAgICAgICAgICAgICAgICBsb2NhbGUgPSB0aGlzLmxvYyxcbiAgICAgICAgICAgICAgICBkZWNhZGUgPSBkYXRlcGlja2VyLmdldERlY2FkZShkYXRlKSxcbiAgICAgICAgICAgICAgICBkID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKGRhdGUpO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKHRydWUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIC9ALy50ZXN0KHJlc3VsdCk6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKC9ALywgZGF0ZS5nZXRUaW1lKCkpO1xuICAgICAgICAgICAgICAgIGNhc2UgL2RkLy50ZXN0KHJlc3VsdCk6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCdkZCcpLCBkLmZ1bGxEYXRlKTtcbiAgICAgICAgICAgICAgICBjYXNlIC9kLy50ZXN0KHJlc3VsdCk6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCdkJyksIGQuZGF0ZSk7XG4gICAgICAgICAgICAgICAgY2FzZSAvREQvLnRlc3QocmVzdWx0KTpcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ0REJyksIGxvY2FsZS5kYXlzW2QuZGF5XSk7XG4gICAgICAgICAgICAgICAgY2FzZSAvRC8udGVzdChyZXN1bHQpOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgnRCcpLCBsb2NhbGUuZGF5c1Nob3J0W2QuZGF5XSk7XG4gICAgICAgICAgICAgICAgY2FzZSAvbW0vLnRlc3QocmVzdWx0KTpcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ21tJyksIGQuZnVsbE1vbnRoKTtcbiAgICAgICAgICAgICAgICBjYXNlIC9tLy50ZXN0KHJlc3VsdCk6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCdtJyksIGQubW9udGggKyAxKTtcbiAgICAgICAgICAgICAgICBjYXNlIC9NTS8udGVzdChyZXN1bHQpOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgnTU0nKSwgdGhpcy5sb2MubW9udGhzW2QubW9udGhdKTtcbiAgICAgICAgICAgICAgICBjYXNlIC9NLy50ZXN0KHJlc3VsdCk6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCdNJyksIGxvY2FsZS5tb250aHNTaG9ydFtkLm1vbnRoXSk7XG4gICAgICAgICAgICAgICAgY2FzZSAveXl5eS8udGVzdChyZXN1bHQpOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgneXl5eScpLCBkLnllYXIpO1xuICAgICAgICAgICAgICAgIGNhc2UgL3l5eXkxLy50ZXN0KHJlc3VsdCk6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCd5eXl5MScpLCBkZWNhZGVbMF0pO1xuICAgICAgICAgICAgICAgIGNhc2UgL3l5eXkyLy50ZXN0KHJlc3VsdCk6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCd5eXl5MicpLCBkZWNhZGVbMV0pO1xuICAgICAgICAgICAgICAgIGNhc2UgL3l5Ly50ZXN0KHJlc3VsdCk6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCd5eScpLCBkLnllYXIudG9TdHJpbmcoKS5zbGljZSgtMikpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRXb3JkQm91bmRhcnlSZWdFeHA6IGZ1bmN0aW9uIChzaWduKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cCgnXFxcXGIoPz1bYS16QS1aMC05w6TDtsO8w5/DhMOWw5w8XSknICsgc2lnbiArICcoPyFbPmEtekEtWjAtOcOkw7bDvMOfw4TDlsOcXSknKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWxlY3REYXRlOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRzID0gX3RoaXMub3B0cyxcbiAgICAgICAgICAgICAgICBkID0gX3RoaXMucGFyc2VkRGF0ZSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZERhdGVzID0gX3RoaXMuc2VsZWN0ZWREYXRlcyxcbiAgICAgICAgICAgICAgICBsZW4gPSBzZWxlY3RlZERhdGVzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBuZXdEYXRlID0gJyc7XG5cbiAgICAgICAgICAgIGlmICghKGRhdGUgaW5zdGFuY2VvZiBEYXRlKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBpZiAoX3RoaXMudmlldyA9PSAnZGF5cycpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZS5nZXRNb250aCgpICE9IGQubW9udGggJiYgb3B0cy5tb3ZlVG9PdGhlck1vbnRoc09uU2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld0RhdGUgPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoX3RoaXMudmlldyA9PSAneWVhcnMnKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGUuZ2V0RnVsbFllYXIoKSAhPSBkLnllYXIgJiYgb3B0cy5tb3ZlVG9PdGhlclllYXJzT25TZWxlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3RGF0ZSA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgMCwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobmV3RGF0ZSkge1xuICAgICAgICAgICAgICAgIF90aGlzLnNpbGVudCA9IHRydWU7XG4gICAgICAgICAgICAgICAgX3RoaXMuZGF0ZSA9IG5ld0RhdGU7XG4gICAgICAgICAgICAgICAgX3RoaXMuc2lsZW50ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgX3RoaXMubmF2Ll9yZW5kZXIoKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob3B0cy5tdWx0aXBsZURhdGVzICYmICFvcHRzLnJhbmdlKSB7IC8vIFNldCBwcmlvcml0eSB0byByYW5nZSBmdW5jdGlvbmFsaXR5XG4gICAgICAgICAgICAgICAgaWYgKGxlbiA9PT0gb3B0cy5tdWx0aXBsZURhdGVzKSByZXR1cm47XG4gICAgICAgICAgICAgICAgaWYgKCFfdGhpcy5faXNTZWxlY3RlZChkYXRlKSkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZWxlY3RlZERhdGVzLnB1c2goZGF0ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRzLnJhbmdlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxlbiA9PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnNlbGVjdGVkRGF0ZXMgPSBbZGF0ZV07XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLm1pblJhbmdlID0gZGF0ZTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMubWF4UmFuZ2UgPSAnJztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGxlbiA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnNlbGVjdGVkRGF0ZXMucHVzaChkYXRlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFfdGhpcy5tYXhSYW5nZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5tYXhSYW5nZSA9IGRhdGU7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5taW5SYW5nZSA9IGRhdGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2VsZWN0ZWREYXRlcyA9IFtfdGhpcy5taW5SYW5nZSwgX3RoaXMubWF4UmFuZ2VdXG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZWxlY3RlZERhdGVzID0gW2RhdGVdO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5taW5SYW5nZSA9IGRhdGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5zZWxlY3RlZERhdGVzID0gW2RhdGVdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfdGhpcy5fc2V0SW5wdXRWYWx1ZSgpO1xuXG4gICAgICAgICAgICBpZiAob3B0cy5vblNlbGVjdCkge1xuICAgICAgICAgICAgICAgIF90aGlzLl90cmlnZ2VyT25DaGFuZ2UoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG9wdHMuYXV0b0Nsb3NlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFvcHRzLm11bHRpcGxlRGF0ZXMgJiYgIW9wdHMucmFuZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0cy5yYW5nZSAmJiBfdGhpcy5zZWxlY3RlZERhdGVzLmxlbmd0aCA9PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF90aGlzLnZpZXdzW3RoaXMuY3VycmVudFZpZXddLl9yZW5kZXIoKVxuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZURhdGU6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSB0aGlzLnNlbGVjdGVkRGF0ZXMsXG4gICAgICAgICAgICAgICAgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAoIShkYXRlIGluc3RhbmNlb2YgRGF0ZSkpIHJldHVybjtcblxuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGVkLnNvbWUoZnVuY3Rpb24gKGN1ckRhdGUsIGkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZXBpY2tlci5pc1NhbWUoY3VyRGF0ZSwgZGF0ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQuc3BsaWNlKGksIDEpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghX3RoaXMuc2VsZWN0ZWREYXRlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLm1pblJhbmdlID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5tYXhSYW5nZSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgX3RoaXMudmlld3NbX3RoaXMuY3VycmVudFZpZXddLl9yZW5kZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuX3NldElucHV0VmFsdWUoKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXMub3B0cy5vblNlbGVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuX3RyaWdnZXJPbkNoYW5nZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIHRvZGF5OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnZpZXcgPSB0aGlzLm9wdHMubWluVmlldztcbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkRGF0ZXMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMubWluUmFuZ2UgPSAnJztcbiAgICAgICAgICAgIHRoaXMubWF4UmFuZ2UgPSAnJztcbiAgICAgICAgICAgIHRoaXMudmlld3NbdGhpcy5jdXJyZW50Vmlld10uX3JlbmRlcigpO1xuICAgICAgICAgICAgdGhpcy5fc2V0SW5wdXRWYWx1ZSgpO1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5vblNlbGVjdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3RyaWdnZXJPbkNoYW5nZSgpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFVwZGF0ZXMgZGF0ZXBpY2tlciBvcHRpb25zXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gcGFyYW0gLSBwYXJhbWV0ZXIncyBuYW1lIHRvIHVwZGF0ZS4gSWYgb2JqZWN0IHRoZW4gaXQgd2lsbCBleHRlbmQgY3VycmVudCBvcHRpb25zXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfE51bWJlcnxPYmplY3R9IFt2YWx1ZV0gLSBuZXcgcGFyYW0gdmFsdWVcbiAgICAgICAgICovXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKHBhcmFtLCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgICAgICBpZiAobGVuID09IDIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdHNbcGFyYW1dID0gdmFsdWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxlbiA9PSAxICYmIHR5cGVvZiBwYXJhbSA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0cyA9ICQuZXh0ZW5kKHRydWUsIHRoaXMub3B0cywgcGFyYW0pXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZVNob3J0Q3V0cygpO1xuICAgICAgICAgICAgdGhpcy5fc3luY1dpdGhNaW5NYXhEYXRlcygpO1xuICAgICAgICAgICAgdGhpcy5fZGVmaW5lTG9jYWxlKHRoaXMub3B0cy5sYW5ndWFnZSk7XG4gICAgICAgICAgICB0aGlzLm5hdi5fYWRkQnV0dG9uc0lmTmVlZCgpO1xuICAgICAgICAgICAgdGhpcy5uYXYuX3JlbmRlcigpO1xuICAgICAgICAgICAgdGhpcy52aWV3c1t0aGlzLmN1cnJlbnRWaWV3XS5fcmVuZGVyKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmVsSXNJbnB1dCAmJiAhdGhpcy5vcHRzLmlubGluZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3NldFBvc2l0aW9uQ2xhc3Nlcyh0aGlzLm9wdHMucG9zaXRpb24pO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRQb3NpdGlvbih0aGlzLm9wdHMucG9zaXRpb24pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLmNsYXNzZXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyLmFkZENsYXNzKHRoaXMub3B0cy5jbGFzc2VzKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcblxuICAgICAgICBfc3luY1dpdGhNaW5NYXhEYXRlczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGN1clRpbWUgPSB0aGlzLmRhdGUuZ2V0VGltZSgpO1xuICAgICAgICAgICAgdGhpcy5zaWxlbnQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKHRoaXMubWluVGltZSA+IGN1clRpbWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSB0aGlzLm1pbkRhdGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm1heFRpbWUgPCBjdXJUaW1lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdGhpcy5tYXhEYXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zaWxlbnQgPSBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBfaXNTZWxlY3RlZDogZnVuY3Rpb24gKGNoZWNrRGF0ZSwgY2VsbFR5cGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkRGF0ZXMuc29tZShmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkYXRlcGlja2VyLmlzU2FtZShkYXRlLCBjaGVja0RhdGUsIGNlbGxUeXBlKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICBfc2V0SW5wdXRWYWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRzID0gX3RoaXMub3B0cyxcbiAgICAgICAgICAgICAgICBmb3JtYXQgPSBfdGhpcy5sb2MuZGF0ZUZvcm1hdCxcbiAgICAgICAgICAgICAgICBhbHRGb3JtYXQgPSBvcHRzLmFsdEZpZWxkRGF0ZUZvcm1hdCxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IF90aGlzLnNlbGVjdGVkRGF0ZXMubWFwKGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5mb3JtYXREYXRlKGZvcm1hdCwgZGF0ZSlcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBhbHRWYWx1ZXM7XG5cbiAgICAgICAgICAgIGlmIChvcHRzLmFsdEZpZWxkICYmIF90aGlzLiRhbHRGaWVsZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBhbHRWYWx1ZXMgPSB0aGlzLnNlbGVjdGVkRGF0ZXMubWFwKGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5mb3JtYXREYXRlKGFsdEZvcm1hdCwgZGF0ZSlcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBhbHRWYWx1ZXMgPSBhbHRWYWx1ZXMuam9pbih0aGlzLm9wdHMubXVsdGlwbGVEYXRlc1NlcGFyYXRvcik7XG4gICAgICAgICAgICAgICAgdGhpcy4kYWx0RmllbGQudmFsKGFsdFZhbHVlcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUuam9pbih0aGlzLm9wdHMubXVsdGlwbGVEYXRlc1NlcGFyYXRvcik7XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLnZhbCh2YWx1ZSlcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2sgaWYgZGF0ZSBpcyBiZXR3ZWVuIG1pbkRhdGUgYW5kIG1heERhdGVcbiAgICAgICAgICogQHBhcmFtIGRhdGUge29iamVjdH0gLSBkYXRlIG9iamVjdFxuICAgICAgICAgKiBAcGFyYW0gdHlwZSB7c3RyaW5nfSAtIGNlbGwgdHlwZVxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9pc0luUmFuZ2U6IGZ1bmN0aW9uIChkYXRlLCB0eXBlKSB7XG4gICAgICAgICAgICB2YXIgdGltZSA9IGRhdGUuZ2V0VGltZSgpLFxuICAgICAgICAgICAgICAgIGQgPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUoZGF0ZSksXG4gICAgICAgICAgICAgICAgbWluID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKHRoaXMubWluRGF0ZSksXG4gICAgICAgICAgICAgICAgbWF4ID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKHRoaXMubWF4RGF0ZSksXG4gICAgICAgICAgICAgICAgZE1pblRpbWUgPSBuZXcgRGF0ZShkLnllYXIsIGQubW9udGgsIG1pbi5kYXRlKS5nZXRUaW1lKCksXG4gICAgICAgICAgICAgICAgZE1heFRpbWUgPSBuZXcgRGF0ZShkLnllYXIsIGQubW9udGgsIG1heC5kYXRlKS5nZXRUaW1lKCksXG4gICAgICAgICAgICAgICAgdHlwZXMgPSB7XG4gICAgICAgICAgICAgICAgICAgIGRheTogdGltZSA+PSB0aGlzLm1pblRpbWUgJiYgdGltZSA8PSB0aGlzLm1heFRpbWUsXG4gICAgICAgICAgICAgICAgICAgIG1vbnRoOiBkTWluVGltZSA+PSB0aGlzLm1pblRpbWUgJiYgZE1heFRpbWUgPD0gdGhpcy5tYXhUaW1lLFxuICAgICAgICAgICAgICAgICAgICB5ZWFyOiBkLnllYXIgPj0gbWluLnllYXIgJiYgZC55ZWFyIDw9IG1heC55ZWFyXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiB0eXBlID8gdHlwZXNbdHlwZV0gOiB0eXBlcy5kYXlcbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0RGltZW5zaW9uczogZnVuY3Rpb24gKCRlbCkge1xuICAgICAgICAgICAgdmFyIG9mZnNldCA9ICRlbC5vZmZzZXQoKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB3aWR0aDogJGVsLm91dGVyV2lkdGgoKSxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICRlbC5vdXRlckhlaWdodCgpLFxuICAgICAgICAgICAgICAgIGxlZnQ6IG9mZnNldC5sZWZ0LFxuICAgICAgICAgICAgICAgIHRvcDogb2Zmc2V0LnRvcFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXREYXRlRnJvbUNlbGw6IGZ1bmN0aW9uIChjZWxsKSB7XG4gICAgICAgICAgICB2YXIgY3VyRGF0ZSA9IHRoaXMucGFyc2VkRGF0ZSxcbiAgICAgICAgICAgICAgICB5ZWFyID0gY2VsbC5kYXRhKCd5ZWFyJykgfHwgY3VyRGF0ZS55ZWFyLFxuICAgICAgICAgICAgICAgIG1vbnRoID0gY2VsbC5kYXRhKCdtb250aCcpID09IHVuZGVmaW5lZCA/IGN1ckRhdGUubW9udGggOiBjZWxsLmRhdGEoJ21vbnRoJyksXG4gICAgICAgICAgICAgICAgZGF0ZSA9IGNlbGwuZGF0YSgnZGF0ZScpIHx8IDE7XG5cbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgZGF0ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3NldFBvc2l0aW9uQ2xhc3NlczogZnVuY3Rpb24gKHBvcykge1xuICAgICAgICAgICAgcG9zID0gcG9zLnNwbGl0KCcgJyk7XG4gICAgICAgICAgICB2YXIgbWFpbiA9IHBvc1swXSxcbiAgICAgICAgICAgICAgICBzZWMgPSBwb3NbMV0sXG4gICAgICAgICAgICAgICAgY2xhc3NlcyA9ICdkYXRlcGlja2VyIC0nICsgbWFpbiArICctJyArIHNlYyArICctIC1mcm9tLScgKyBtYWluICsgJy0nO1xuXG4gICAgICAgICAgICBpZiAodGhpcy52aXNpYmxlKSBjbGFzc2VzICs9ICcgYWN0aXZlJztcblxuICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlclxuICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdjbGFzcycpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKGNsYXNzZXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldFBvc2l0aW9uOiBmdW5jdGlvbiAocG9zaXRpb24pIHtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gcG9zaXRpb24gfHwgdGhpcy5vcHRzLnBvc2l0aW9uO1xuXG4gICAgICAgICAgICB2YXIgZGltcyA9IHRoaXMuX2dldERpbWVuc2lvbnModGhpcy4kZWwpLFxuICAgICAgICAgICAgICAgIHNlbGZEaW1zID0gdGhpcy5fZ2V0RGltZW5zaW9ucyh0aGlzLiRkYXRlcGlja2VyKSxcbiAgICAgICAgICAgICAgICBwb3MgPSBwb3NpdGlvbi5zcGxpdCgnICcpLFxuICAgICAgICAgICAgICAgIHRvcCwgbGVmdCxcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSB0aGlzLm9wdHMub2Zmc2V0LFxuICAgICAgICAgICAgICAgIG1haW4gPSBwb3NbMF0sXG4gICAgICAgICAgICAgICAgc2Vjb25kYXJ5ID0gcG9zWzFdO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKG1haW4pIHtcbiAgICAgICAgICAgICAgICBjYXNlICd0b3AnOlxuICAgICAgICAgICAgICAgICAgICB0b3AgPSBkaW1zLnRvcCAtIHNlbGZEaW1zLmhlaWdodCAtIG9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gZGltcy5sZWZ0ICsgZGltcy53aWR0aCArIG9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnYm90dG9tJzpcbiAgICAgICAgICAgICAgICAgICAgdG9wID0gZGltcy50b3AgKyBkaW1zLmhlaWdodCArIG9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICAgICAgICAgIGxlZnQgPSBkaW1zLmxlZnQgLSBzZWxmRGltcy53aWR0aCAtIG9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN3aXRjaChzZWNvbmRhcnkpIHtcbiAgICAgICAgICAgICAgICBjYXNlICd0b3AnOlxuICAgICAgICAgICAgICAgICAgICB0b3AgPSBkaW1zLnRvcDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gZGltcy5sZWZ0ICsgZGltcy53aWR0aCAtIHNlbGZEaW1zLndpZHRoO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdib3R0b20nOlxuICAgICAgICAgICAgICAgICAgICB0b3AgPSBkaW1zLnRvcCArIGRpbXMuaGVpZ2h0IC0gc2VsZkRpbXMuaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgICAgICAgICAgbGVmdCA9IGRpbXMubGVmdDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnY2VudGVyJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKC9sZWZ0fHJpZ2h0Ly50ZXN0KG1haW4pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3AgPSBkaW1zLnRvcCArIGRpbXMuaGVpZ2h0LzIgLSBzZWxmRGltcy5oZWlnaHQvMjtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgPSBkaW1zLmxlZnQgKyBkaW1zLndpZHRoLzIgLSBzZWxmRGltcy53aWR0aC8yO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXJcbiAgICAgICAgICAgICAgICAuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0b3BcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIHNob3c6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb24odGhpcy5vcHRzLnBvc2l0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXIuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgdGhpcy52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBoaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyXG4gICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgICAgICAgICAgICAgIC5jc3Moe1xuICAgICAgICAgICAgICAgICAgICBsZWZ0OiAnLTEwMDAwMHB4J1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLmZvY3VzZWQgPSAnJztcbiAgICAgICAgICAgIHRoaXMua2V5cyA9IFtdO1xuXG4gICAgICAgICAgICB0aGlzLmluRm9jdXMgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy4kZWwuYmx1cigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRvd246IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgICAgICB0aGlzLl9jaGFuZ2VWaWV3KGRhdGUsICdkb3duJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXA6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgICAgICB0aGlzLl9jaGFuZ2VWaWV3KGRhdGUsICd1cCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9jaGFuZ2VWaWV3OiBmdW5jdGlvbiAoZGF0ZSwgZGlyKSB7XG4gICAgICAgICAgICBkYXRlID0gZGF0ZSB8fCB0aGlzLmZvY3VzZWQgfHwgdGhpcy5kYXRlO1xuXG4gICAgICAgICAgICB2YXIgbmV4dFZpZXcgPSBkaXIgPT0gJ3VwJyA/IHRoaXMudmlld0luZGV4ICsgMSA6IHRoaXMudmlld0luZGV4IC0gMTtcbiAgICAgICAgICAgIGlmIChuZXh0VmlldyA+IDIpIG5leHRWaWV3ID0gMjtcbiAgICAgICAgICAgIGlmIChuZXh0VmlldyA8IDApIG5leHRWaWV3ID0gMDtcblxuICAgICAgICAgICAgdGhpcy5zaWxlbnQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIDEpO1xuICAgICAgICAgICAgdGhpcy5zaWxlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMudmlldyA9IHRoaXMudmlld0luZGV4ZXNbbmV4dFZpZXddO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgX2hhbmRsZUhvdEtleTogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgdmFyIGRhdGUgPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUodGhpcy5fZ2V0Rm9jdXNlZERhdGUoKSksXG4gICAgICAgICAgICAgICAgZm9jdXNlZFBhcnNlZCxcbiAgICAgICAgICAgICAgICBvID0gdGhpcy5vcHRzLFxuICAgICAgICAgICAgICAgIG5ld0RhdGUsXG4gICAgICAgICAgICAgICAgdG90YWxEYXlzSW5OZXh0TW9udGgsXG4gICAgICAgICAgICAgICAgbW9udGhDaGFuZ2VkID0gZmFsc2UsXG4gICAgICAgICAgICAgICAgeWVhckNoYW5nZWQgPSBmYWxzZSxcbiAgICAgICAgICAgICAgICBkZWNhZGVDaGFuZ2VkID0gZmFsc2UsXG4gICAgICAgICAgICAgICAgeSA9IGRhdGUueWVhcixcbiAgICAgICAgICAgICAgICBtID0gZGF0ZS5tb250aCxcbiAgICAgICAgICAgICAgICBkID0gZGF0ZS5kYXRlO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2N0cmxSaWdodCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnY3RybFVwJzpcbiAgICAgICAgICAgICAgICAgICAgbSArPSAxO1xuICAgICAgICAgICAgICAgICAgICBtb250aENoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdjdHJsTGVmdCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnY3RybERvd24nOlxuICAgICAgICAgICAgICAgICAgICBtIC09IDE7XG4gICAgICAgICAgICAgICAgICAgIG1vbnRoQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3NoaWZ0UmlnaHQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3NoaWZ0VXAnOlxuICAgICAgICAgICAgICAgICAgICB5ZWFyQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHkgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnc2hpZnRMZWZ0JzpcbiAgICAgICAgICAgICAgICBjYXNlICdzaGlmdERvd24nOlxuICAgICAgICAgICAgICAgICAgICB5ZWFyQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHkgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnYWx0UmlnaHQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2FsdFVwJzpcbiAgICAgICAgICAgICAgICAgICAgZGVjYWRlQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHkgKz0gMTA7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2FsdExlZnQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2FsdERvd24nOlxuICAgICAgICAgICAgICAgICAgICBkZWNhZGVDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgeSAtPSAxMDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnY3RybFNoaWZ0VXAnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0b3RhbERheXNJbk5leHRNb250aCA9IGRhdGVwaWNrZXIuZ2V0RGF5c0NvdW50KG5ldyBEYXRlKHksbSkpO1xuICAgICAgICAgICAgbmV3RGF0ZSA9IG5ldyBEYXRlKHksbSxkKTtcblxuICAgICAgICAgICAgLy8gSWYgbmV4dCBtb250aCBoYXMgbGVzcyBkYXlzIHRoYW4gY3VycmVudCwgc2V0IGRhdGUgdG8gdG90YWwgZGF5cyBpbiB0aGF0IG1vbnRoXG4gICAgICAgICAgICBpZiAodG90YWxEYXlzSW5OZXh0TW9udGggPCBkKSBkID0gdG90YWxEYXlzSW5OZXh0TW9udGg7XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIG5ld0RhdGUgaXMgaW4gdmFsaWQgcmFuZ2VcbiAgICAgICAgICAgIGlmIChuZXdEYXRlLmdldFRpbWUoKSA8IHRoaXMubWluVGltZSkge1xuICAgICAgICAgICAgICAgIG5ld0RhdGUgPSB0aGlzLm1pbkRhdGU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0RhdGUuZ2V0VGltZSgpID4gdGhpcy5tYXhUaW1lKSB7XG4gICAgICAgICAgICAgICAgbmV3RGF0ZSA9IHRoaXMubWF4RGF0ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5mb2N1c2VkID0gbmV3RGF0ZTtcblxuICAgICAgICAgICAgZm9jdXNlZFBhcnNlZCA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZShuZXdEYXRlKTtcbiAgICAgICAgICAgIGlmIChtb250aENoYW5nZWQgJiYgby5vbkNoYW5nZU1vbnRoKSB7XG4gICAgICAgICAgICAgICAgby5vbkNoYW5nZU1vbnRoKGZvY3VzZWRQYXJzZWQubW9udGgsIGZvY3VzZWRQYXJzZWQueWVhcilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh5ZWFyQ2hhbmdlZCAmJiBvLm9uQ2hhbmdlWWVhcikge1xuICAgICAgICAgICAgICAgIG8ub25DaGFuZ2VZZWFyKGZvY3VzZWRQYXJzZWQueWVhcilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkZWNhZGVDaGFuZ2VkICYmIG8ub25DaGFuZ2VEZWNhZGUpIHtcbiAgICAgICAgICAgICAgICBvLm9uQ2hhbmdlRGVjYWRlKHRoaXMuY3VyRGVjYWRlKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9yZWdpc3RlcktleTogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgdmFyIGV4aXN0cyA9IHRoaXMua2V5cy5zb21lKGZ1bmN0aW9uIChjdXJLZXkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3VyS2V5ID09IGtleTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoIWV4aXN0cykge1xuICAgICAgICAgICAgICAgIHRoaXMua2V5cy5wdXNoKGtleSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfdW5SZWdpc3RlcktleTogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5rZXlzLmluZGV4T2Yoa2V5KTtcblxuICAgICAgICAgICAgdGhpcy5rZXlzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2lzSG90S2V5UHJlc3NlZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRIb3RLZXksXG4gICAgICAgICAgICAgICAgZm91bmQgPSBmYWxzZSxcbiAgICAgICAgICAgICAgICBfdGhpcyA9IHRoaXMsXG4gICAgICAgICAgICAgICAgcHJlc3NlZEtleXMgPSB0aGlzLmtleXMuc29ydCgpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBob3RLZXkgaW4gaG90S2V5cykge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRIb3RLZXkgPSBob3RLZXlzW2hvdEtleV07XG4gICAgICAgICAgICAgICAgaWYgKHByZXNzZWRLZXlzLmxlbmd0aCAhPSBjdXJyZW50SG90S2V5Lmxlbmd0aCkgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudEhvdEtleS5ldmVyeShmdW5jdGlvbiAoa2V5LCBpKSB7IHJldHVybiBrZXkgPT0gcHJlc3NlZEtleXNbaV19KSkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5fdHJpZ2dlcignaG90S2V5JywgaG90S2V5KTtcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgICAgICB9LFxuXG4gICAgICAgIF90cmlnZ2VyOiBmdW5jdGlvbiAoZXZlbnQsIGFyZ3MpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLnRyaWdnZXIoZXZlbnQsIGFyZ3MpXG4gICAgICAgIH0sXG5cbiAgICAgICAgX2ZvY3VzTmV4dENlbGw6IGZ1bmN0aW9uIChrZXlDb2RlLCB0eXBlKSB7XG4gICAgICAgICAgICB0eXBlID0gdHlwZSB8fCB0aGlzLmNlbGxUeXBlO1xuXG4gICAgICAgICAgICB2YXIgZGF0ZSA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZSh0aGlzLl9nZXRGb2N1c2VkRGF0ZSgpKSxcbiAgICAgICAgICAgICAgICB5ID0gZGF0ZS55ZWFyLFxuICAgICAgICAgICAgICAgIG0gPSBkYXRlLm1vbnRoLFxuICAgICAgICAgICAgICAgIGQgPSBkYXRlLmRhdGU7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0hvdEtleVByZXNzZWQoKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzd2l0Y2goa2V5Q29kZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMzc6IC8vIGxlZnRcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAnZGF5JyA/IChkIC09IDEpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ21vbnRoJyA/IChtIC09IDEpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ3llYXInID8gKHkgLT0gMSkgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAzODogLy8gdXBcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAnZGF5JyA/IChkIC09IDcpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ21vbnRoJyA/IChtIC09IDMpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ3llYXInID8gKHkgLT0gNCkgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAzOTogLy8gcmlnaHRcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAnZGF5JyA/IChkICs9IDEpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ21vbnRoJyA/IChtICs9IDEpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ3llYXInID8gKHkgKz0gMSkgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSA0MDogLy8gZG93blxuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICdkYXknID8gKGQgKz0gNykgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAnbW9udGgnID8gKG0gKz0gMykgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAneWVhcicgPyAoeSArPSA0KSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG5kID0gbmV3IERhdGUoeSxtLGQpO1xuICAgICAgICAgICAgaWYgKG5kLmdldFRpbWUoKSA8IHRoaXMubWluVGltZSkge1xuICAgICAgICAgICAgICAgIG5kID0gdGhpcy5taW5EYXRlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuZC5nZXRUaW1lKCkgPiB0aGlzLm1heFRpbWUpIHtcbiAgICAgICAgICAgICAgICBuZCA9IHRoaXMubWF4RGF0ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5mb2N1c2VkID0gbmQ7XG5cbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0Rm9jdXNlZERhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBmb2N1c2VkICA9IHRoaXMuZm9jdXNlZCB8fCB0aGlzLnNlbGVjdGVkRGF0ZXNbdGhpcy5zZWxlY3RlZERhdGVzLmxlbmd0aCAtIDFdLFxuICAgICAgICAgICAgICAgIGQgPSB0aGlzLnBhcnNlZERhdGU7XG5cbiAgICAgICAgICAgIGlmICghZm9jdXNlZCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy52aWV3KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2RheXMnOlxuICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXNlZCA9IG5ldyBEYXRlKGQueWVhciwgZC5tb250aCwgbmV3IERhdGUoKS5nZXREYXRlKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ21vbnRocyc6XG4gICAgICAgICAgICAgICAgICAgICAgICBmb2N1c2VkID0gbmV3IERhdGUoZC55ZWFyLCBkLm1vbnRoLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICd5ZWFycyc6XG4gICAgICAgICAgICAgICAgICAgICAgICBmb2N1c2VkID0gbmV3IERhdGUoZC55ZWFyLCAwLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZvY3VzZWQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldENlbGw6IGZ1bmN0aW9uIChkYXRlLCB0eXBlKSB7XG4gICAgICAgICAgICB0eXBlID0gdHlwZSB8fCB0aGlzLmNlbGxUeXBlO1xuXG4gICAgICAgICAgICB2YXIgZCA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZShkYXRlKSxcbiAgICAgICAgICAgICAgICBzZWxlY3RvciA9ICcuZGF0ZXBpY2tlci0tY2VsbFtkYXRhLXllYXI9XCInICsgZC55ZWFyICsgJ1wiXScsXG4gICAgICAgICAgICAgICAgJGNlbGw7XG5cbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ21vbnRoJzpcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IgPSAnW2RhdGEtbW9udGg9XCInICsgZC5tb250aCArICdcIl0nO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdkYXknOlxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RvciArPSAnW2RhdGEtbW9udGg9XCInICsgZC5tb250aCArICdcIl1bZGF0YS1kYXRlPVwiJyArIGQuZGF0ZSArICdcIl0nO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRjZWxsID0gdGhpcy52aWV3c1t0aGlzLmN1cnJlbnRWaWV3XS4kZWwuZmluZChzZWxlY3Rvcik7XG5cbiAgICAgICAgICAgIHJldHVybiAkY2VsbC5sZW5ndGggPyAkY2VsbCA6ICcnO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICBfdGhpcy4kZWxcbiAgICAgICAgICAgICAgICAub2ZmKCcuYWRwJylcbiAgICAgICAgICAgICAgICAuZGF0YSgnZGF0ZXBpY2tlcicsICcnKTtcblxuICAgICAgICAgICAgX3RoaXMuc2VsZWN0ZWREYXRlcyA9IFtdO1xuICAgICAgICAgICAgX3RoaXMuZm9jdXNlZCA9ICcnO1xuICAgICAgICAgICAgX3RoaXMudmlld3MgPSB7fTtcbiAgICAgICAgICAgIF90aGlzLmtleXMgPSBbXTtcbiAgICAgICAgICAgIF90aGlzLm1pblJhbmdlID0gJyc7XG4gICAgICAgICAgICBfdGhpcy5tYXhSYW5nZSA9ICcnO1xuXG4gICAgICAgICAgICBpZiAoX3RoaXMub3B0cy5pbmxpbmUgfHwgIV90aGlzLmVsSXNJbnB1dCkge1xuICAgICAgICAgICAgICAgIF90aGlzLiRkYXRlcGlja2VyLmNsb3Nlc3QoJy5kYXRlcGlja2VyLWlubGluZScpLnJlbW92ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfdGhpcy4kZGF0ZXBpY2tlci5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfb25TaG93RXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uQmx1cjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmluRm9jdXMgJiYgdGhpcy52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uTW91c2VEb3duRGF0ZXBpY2tlcjogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHRoaXMuaW5Gb2N1cyA9IHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uTW91c2VVcERhdGVwaWNrZXI6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB0aGlzLmluRm9jdXMgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZvY3VzKClcbiAgICAgICAgfSxcblxuICAgICAgICBfb25JbnB1dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHZhbCA9IHRoaXMuJGVsLnZhbCgpO1xuXG4gICAgICAgICAgICBpZiAoIXZhbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfb25SZXNpemU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFBvc2l0aW9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uS2V5RG93bjogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciBjb2RlID0gZS53aGljaDtcbiAgICAgICAgICAgIHRoaXMuX3JlZ2lzdGVyS2V5KGNvZGUpO1xuXG4gICAgICAgICAgICAvLyBBcnJvd3NcbiAgICAgICAgICAgIGlmIChjb2RlID49IDM3ICYmIGNvZGUgPD0gNDApIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fZm9jdXNOZXh0Q2VsbChjb2RlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRW50ZXJcbiAgICAgICAgICAgIGlmIChjb2RlID09IDEzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZm9jdXNlZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fZ2V0Q2VsbCh0aGlzLmZvY3VzZWQpLmhhc0NsYXNzKCctZGlzYWJsZWQtJykpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudmlldyAhPSB0aGlzLm9wdHMubWluVmlldykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kb3duKClcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhbHJlYWR5U2VsZWN0ZWQgPSB0aGlzLl9pc1NlbGVjdGVkKHRoaXMuZm9jdXNlZCwgdGhpcy5jZWxsVHlwZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYWxyZWFkeVNlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3REYXRlKHRoaXMuZm9jdXNlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGFscmVhZHlTZWxlY3RlZCAmJiB0aGlzLm9wdHMudG9nZ2xlU2VsZWN0ZWQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlRGF0ZSh0aGlzLmZvY3VzZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBFc2NcbiAgICAgICAgICAgIGlmIChjb2RlID09IDI3KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uS2V5VXA6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgY29kZSA9IGUud2hpY2g7XG4gICAgICAgICAgICB0aGlzLl91blJlZ2lzdGVyS2V5KGNvZGUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9vbkhvdEtleTogZnVuY3Rpb24gKGUsIGhvdEtleSkge1xuICAgICAgICAgICAgdGhpcy5faGFuZGxlSG90S2V5KGhvdEtleSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uTW91c2VFbnRlckNlbGw6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgJGNlbGwgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcuZGF0ZXBpY2tlci0tY2VsbCcpLFxuICAgICAgICAgICAgICAgIGRhdGUgPSB0aGlzLl9nZXREYXRlRnJvbUNlbGwoJGNlbGwpO1xuXG4gICAgICAgICAgICAvLyBQcmV2ZW50IGZyb20gdW5uZWNlc3NhcnkgcmVuZGVyaW5nIGFuZCBzZXR0aW5nIG5ldyBjdXJyZW50RGF0ZVxuICAgICAgICAgICAgdGhpcy5zaWxlbnQgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5mb2N1c2VkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5mb2N1c2VkID0gJydcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJGNlbGwuYWRkQ2xhc3MoJy1mb2N1cy0nKTtcblxuICAgICAgICAgICAgdGhpcy5mb2N1c2VkID0gZGF0ZTtcbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gZmFsc2U7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMucmFuZ2UgJiYgdGhpcy5zZWxlY3RlZERhdGVzLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5taW5SYW5nZSA9IHRoaXMuc2VsZWN0ZWREYXRlc1swXTtcbiAgICAgICAgICAgICAgICB0aGlzLm1heFJhbmdlID0gJyc7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGVwaWNrZXIubGVzcyh0aGlzLm1pblJhbmdlLCB0aGlzLmZvY3VzZWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWF4UmFuZ2UgPSB0aGlzLm1pblJhbmdlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1pblJhbmdlID0gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMudmlld3NbdGhpcy5jdXJyZW50Vmlld10uX3VwZGF0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9vbk1vdXNlTGVhdmVDZWxsOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyICRjZWxsID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLmRhdGVwaWNrZXItLWNlbGwnKTtcblxuICAgICAgICAgICAgJGNlbGwucmVtb3ZlQ2xhc3MoJy1mb2N1cy0nKTtcblxuICAgICAgICAgICAgdGhpcy5zaWxlbnQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5mb2N1c2VkID0gJyc7XG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldCBmb2N1c2VkKHZhbCkge1xuICAgICAgICAgICAgaWYgKCF2YWwgJiYgdGhpcy5mb2N1c2VkKSB7XG4gICAgICAgICAgICAgICAgdmFyICRjZWxsID0gdGhpcy5fZ2V0Q2VsbCh0aGlzLmZvY3VzZWQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCRjZWxsLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAkY2VsbC5yZW1vdmVDbGFzcygnLWZvY3VzLScpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fZm9jdXNlZCA9IHZhbDtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMucmFuZ2UgJiYgdGhpcy5zZWxlY3RlZERhdGVzLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5taW5SYW5nZSA9IHRoaXMuc2VsZWN0ZWREYXRlc1swXTtcbiAgICAgICAgICAgICAgICB0aGlzLm1heFJhbmdlID0gJyc7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGVwaWNrZXIubGVzcyh0aGlzLm1pblJhbmdlLCB0aGlzLl9mb2N1c2VkKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1heFJhbmdlID0gdGhpcy5taW5SYW5nZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5taW5SYW5nZSA9ICcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnNpbGVudCkgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5kYXRlID0gdmFsO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldCBmb2N1c2VkKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZvY3VzZWQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0IHBhcnNlZERhdGUoKSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKHRoaXMuZGF0ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0IGRhdGUgKHZhbCkge1xuICAgICAgICAgICAgaWYgKCEodmFsIGluc3RhbmNlb2YgRGF0ZSkpIHJldHVybjtcblxuICAgICAgICAgICAgdGhpcy5jdXJyZW50RGF0ZSA9IHZhbDtcblxuICAgICAgICAgICAgaWYgKHRoaXMuaW5pdGVkICYmICF0aGlzLnNpbGVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMudmlld3NbdGhpcy52aWV3XS5fcmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5uYXYuX3JlbmRlcigpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnZpc2libGUgJiYgdGhpcy5lbElzSW5wdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2YWw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0IGRhdGUgKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudERhdGVcbiAgICAgICAgfSxcblxuICAgICAgICBzZXQgdmlldyAodmFsKSB7XG4gICAgICAgICAgICB0aGlzLnZpZXdJbmRleCA9IHRoaXMudmlld0luZGV4ZXMuaW5kZXhPZih2YWwpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy52aWV3SW5kZXggPCAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnByZXZWaWV3ID0gdGhpcy5jdXJyZW50VmlldztcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFZpZXcgPSB2YWw7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmluaXRlZCkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy52aWV3c1t2YWxdKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlld3NbdmFsXSA9IG5ldyBEYXRlcGlja2VyLkJvZHkodGhpcywgdmFsLCB0aGlzLm9wdHMpXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3c1t2YWxdLl9yZW5kZXIoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdzW3RoaXMucHJldlZpZXddLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdzW3ZhbF0uc2hvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMubmF2Ll9yZW5kZXIoKTtcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdHMub25DaGFuZ2VWaWV3KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0cy5vbkNoYW5nZVZpZXcodmFsKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5lbElzSW5wdXQgJiYgdGhpcy52aXNpYmxlKSB0aGlzLnNldFBvc2l0aW9uKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB2YWxcbiAgICAgICAgfSxcblxuICAgICAgICBnZXQgdmlldygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRWaWV3O1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldCBjZWxsVHlwZSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZpZXcuc3Vic3RyaW5nKDAsIHRoaXMudmlldy5sZW5ndGggLSAxKVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldCBtaW5UaW1lKCkge1xuICAgICAgICAgICAgdmFyIG1pbiA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZSh0aGlzLm1pbkRhdGUpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKG1pbi55ZWFyLCBtaW4ubW9udGgsIG1pbi5kYXRlKS5nZXRUaW1lKClcbiAgICAgICAgfSxcblxuICAgICAgICBnZXQgbWF4VGltZSgpIHtcbiAgICAgICAgICAgIHZhciBtYXggPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUodGhpcy5tYXhEYXRlKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZShtYXgueWVhciwgbWF4Lm1vbnRoLCBtYXguZGF0ZSkuZ2V0VGltZSgpXG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0IGN1ckRlY2FkZSgpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRlcGlja2VyLmdldERlY2FkZSh0aGlzLmRhdGUpXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gIFV0aWxzXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgZGF0ZXBpY2tlci5nZXREYXlzQ291bnQgPSBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCkgKyAxLCAwKS5nZXREYXRlKCk7XG4gICAgfTtcblxuICAgIGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZSA9IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB5ZWFyOiBkYXRlLmdldEZ1bGxZZWFyKCksXG4gICAgICAgICAgICBtb250aDogZGF0ZS5nZXRNb250aCgpLFxuICAgICAgICAgICAgZnVsbE1vbnRoOiAoZGF0ZS5nZXRNb250aCgpICsgMSkgPCAxMCA/ICcwJyArIChkYXRlLmdldE1vbnRoKCkgKyAxKSA6IGRhdGUuZ2V0TW9udGgoKSArIDEsIC8vIE9uZSBiYXNlZFxuICAgICAgICAgICAgZGF0ZTogZGF0ZS5nZXREYXRlKCksXG4gICAgICAgICAgICBmdWxsRGF0ZTogZGF0ZS5nZXREYXRlKCkgPCAxMCA/ICcwJyArIGRhdGUuZ2V0RGF0ZSgpIDogZGF0ZS5nZXREYXRlKCksXG4gICAgICAgICAgICBkYXk6IGRhdGUuZ2V0RGF5KClcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBkYXRlcGlja2VyLmdldERlY2FkZSA9IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgIHZhciBmaXJzdFllYXIgPSBNYXRoLmZsb29yKGRhdGUuZ2V0RnVsbFllYXIoKSAvIDEwKSAqIDEwO1xuXG4gICAgICAgIHJldHVybiBbZmlyc3RZZWFyLCBmaXJzdFllYXIgKyA5XTtcbiAgICB9O1xuXG4gICAgZGF0ZXBpY2tlci50ZW1wbGF0ZSA9IGZ1bmN0aW9uIChzdHIsIGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8jXFx7KFtcXHddKylcXH0vZywgZnVuY3Rpb24gKHNvdXJjZSwgbWF0Y2gpIHtcbiAgICAgICAgICAgIGlmIChkYXRhW21hdGNoXSB8fCBkYXRhW21hdGNoXSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhW21hdGNoXVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZGF0ZXBpY2tlci5pc1NhbWUgPSBmdW5jdGlvbiAoZGF0ZTEsIGRhdGUyLCB0eXBlKSB7XG4gICAgICAgIGlmICghZGF0ZTEgfHwgIWRhdGUyKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHZhciBkMSA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZShkYXRlMSksXG4gICAgICAgICAgICBkMiA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZShkYXRlMiksXG4gICAgICAgICAgICBfdHlwZSA9IHR5cGUgPyB0eXBlIDogJ2RheScsXG5cbiAgICAgICAgICAgIGNvbmRpdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgZGF5OiBkMS5kYXRlID09IGQyLmRhdGUgJiYgZDEubW9udGggPT0gZDIubW9udGggJiYgZDEueWVhciA9PSBkMi55ZWFyLFxuICAgICAgICAgICAgICAgIG1vbnRoOiBkMS5tb250aCA9PSBkMi5tb250aCAmJiBkMS55ZWFyID09IGQyLnllYXIsXG4gICAgICAgICAgICAgICAgeWVhcjogZDEueWVhciA9PSBkMi55ZWFyXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBjb25kaXRpb25zW190eXBlXTtcbiAgICB9O1xuXG4gICAgZGF0ZXBpY2tlci5sZXNzID0gZnVuY3Rpb24gKGRhdGVDb21wYXJlVG8sIGRhdGUsIHR5cGUpIHtcbiAgICAgICAgaWYgKCFkYXRlQ29tcGFyZVRvIHx8ICFkYXRlKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiBkYXRlLmdldFRpbWUoKSA8IGRhdGVDb21wYXJlVG8uZ2V0VGltZSgpO1xuICAgIH07XG5cbiAgICBkYXRlcGlja2VyLmJpZ2dlciA9IGZ1bmN0aW9uIChkYXRlQ29tcGFyZVRvLCBkYXRlLCB0eXBlKSB7XG4gICAgICAgIGlmICghZGF0ZUNvbXBhcmVUbyB8fCAhZGF0ZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gZGF0ZS5nZXRUaW1lKCkgPiBkYXRlQ29tcGFyZVRvLmdldFRpbWUoKTtcbiAgICB9O1xuXG4gICAgRGF0ZXBpY2tlci5sYW5ndWFnZSA9IHtcbiAgICAgICAgcnU6IHtcbiAgICAgICAgICAgIGRheXM6IFsn0JLQvtGB0LrRgNC10YHQtdC90YzQtScsICfQn9C+0L3QtdC00LXQu9GM0L3QuNC6JywgJ9CS0YLQvtGA0L3QuNC6JywgJ9Ch0YDQtdC00LAnLCAn0KfQtdGC0LLQtdGA0LMnLCAn0J/Rj9GC0L3QuNGG0LAnLCAn0KHRg9Cx0LHQvtGC0LAnXSxcbiAgICAgICAgICAgIGRheXNTaG9ydDogWyfQktC+0YEnLCfQn9C+0L0nLCfQktGC0L4nLCfQodGA0LUnLCfQp9C10YInLCfQn9GP0YInLCfQodGD0LEnXSxcbiAgICAgICAgICAgIGRheXNNaW46IFsn0JLRgScsJ9Cf0L0nLCfQktGCJywn0KHRgCcsJ9Cn0YInLCfQn9GCJywn0KHQsSddLFxuICAgICAgICAgICAgbW9udGhzOiBbJ9Cv0L3QstCw0YDRjCcsICfQpNC10LLRgNCw0LvRjCcsICfQnNCw0YDRgicsICfQkNC/0YDQtdC70YwnLCAn0JzQsNC5JywgJ9CY0Y7QvdGMJywgJ9CY0Y7Qu9GMJywgJ9CQ0LLQs9GD0YHRgicsICfQodC10L3RgtGP0LHRgNGMJywgJ9Ce0LrRgtGP0LHRgNGMJywgJ9Cd0L7Rj9Cx0YDRjCcsICfQlNC10LrQsNCx0YDRjCddLFxuICAgICAgICAgICAgbW9udGhzU2hvcnQ6IFsn0K/QvdCyJywgJ9Ck0LXQsicsICfQnNCw0YAnLCAn0JDQv9GAJywgJ9Cc0LDQuScsICfQmNGO0L0nLCAn0JjRjtC7JywgJ9CQ0LLQsycsICfQodC10L0nLCAn0J7QutGCJywgJ9Cd0L7RjycsICfQlNC10LonXSxcbiAgICAgICAgICAgIHRvZGF5OiAn0KHQtdCz0L7QtNC90Y8nLFxuICAgICAgICAgICAgY2xlYXI6ICfQntGH0LjRgdGC0LjRgtGMJyxcbiAgICAgICAgICAgIGRhdGVGb3JtYXQ6ICdkZC5tbS55eXl5JyxcbiAgICAgICAgICAgIGZpcnN0RGF5OiAxXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgJC5mbltwbHVnaW5OYW1lXSA9IGZ1bmN0aW9uICggb3B0aW9ucyApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoISQuZGF0YSh0aGlzLCBwbHVnaW5OYW1lKSkge1xuICAgICAgICAgICAgICAgICQuZGF0YSh0aGlzLCAgcGx1Z2luTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgbmV3IERhdGVwaWNrZXIoIHRoaXMsIG9wdGlvbnMgKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9ICQuZGF0YSh0aGlzLCBwbHVnaW5OYW1lKTtcblxuICAgICAgICAgICAgICAgIF90aGlzLm9wdHMgPSAkLmV4dGVuZCh0cnVlLCBfdGhpcy5vcHRzLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICBfdGhpcy51cGRhdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgICQoZnVuY3Rpb24gKCkge1xuICAgICAgICAkKGF1dG9Jbml0U2VsZWN0b3IpLmRhdGVwaWNrZXIoKTtcbiAgICB9KVxuXG59KSh3aW5kb3csIGpRdWVyeSk7XG47KGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGVtcGxhdGVzID0ge1xuICAgICAgICBkYXlzOicnICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1kYXlzIGRhdGVwaWNrZXItLWJvZHlcIj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1kYXlzLW5hbWVzXCI+PC9kaXY+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tY2VsbHMgZGF0ZXBpY2tlci0tY2VsbHMtZGF5c1wiPjwvZGl2PicgK1xuICAgICAgICAnPC9kaXY+JyxcbiAgICAgICAgbW9udGhzOiAnJyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tbW9udGhzIGRhdGVwaWNrZXItLWJvZHlcIj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1jZWxscyBkYXRlcGlja2VyLS1jZWxscy1tb250aHNcIj48L2Rpdj4nICtcbiAgICAgICAgJzwvZGl2PicsXG4gICAgICAgIHllYXJzOiAnJyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0teWVhcnMgZGF0ZXBpY2tlci0tYm9keVwiPicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLWNlbGxzIGRhdGVwaWNrZXItLWNlbGxzLXllYXJzXCI+PC9kaXY+JyArXG4gICAgICAgICc8L2Rpdj4nXG4gICAgICAgIH0sXG4gICAgICAgIEQgPSBEYXRlcGlja2VyO1xuXG4gICAgRC5Cb2R5ID0gZnVuY3Rpb24gKGQsIHR5cGUsIG9wdHMpIHtcbiAgICAgICAgdGhpcy5kID0gZDtcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy5vcHRzID0gb3B0cztcblxuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICB9O1xuXG4gICAgRC5Cb2R5LnByb3RvdHlwZSA9IHtcbiAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fYnVpbGRCYXNlSHRtbCgpO1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyKCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2JpbmRFdmVudHMoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfYmluZEV2ZW50czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwub24oJ2NsaWNrJywgJy5kYXRlcGlja2VyLS1jZWxsJywgJC5wcm94eSh0aGlzLl9vbkNsaWNrQ2VsbCwgdGhpcykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9idWlsZEJhc2VIdG1sOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLiRlbCA9ICQodGVtcGxhdGVzW3RoaXMudHlwZV0pLmFwcGVuZFRvKHRoaXMuZC4kY29udGVudCk7XG4gICAgICAgICAgICB0aGlzLiRuYW1lcyA9ICQoJy5kYXRlcGlja2VyLS1kYXlzLW5hbWVzJywgdGhpcy4kZWwpO1xuICAgICAgICAgICAgdGhpcy4kY2VsbHMgPSAkKCcuZGF0ZXBpY2tlci0tY2VsbHMnLCB0aGlzLiRlbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldERheU5hbWVzSHRtbDogZnVuY3Rpb24gKGZpcnN0RGF5LCBjdXJEYXksIGh0bWwsIGkpIHtcbiAgICAgICAgICAgIGN1ckRheSA9IGN1ckRheSAhPSB1bmRlZmluZWQgPyBjdXJEYXkgOiBmaXJzdERheTtcbiAgICAgICAgICAgIGh0bWwgPSBodG1sID8gaHRtbCA6ICcnO1xuICAgICAgICAgICAgaSA9IGkgIT0gdW5kZWZpbmVkID8gaSA6IDA7XG5cbiAgICAgICAgICAgIGlmIChpID4gNykgcmV0dXJuIGh0bWw7XG4gICAgICAgICAgICBpZiAoY3VyRGF5ID09IDcpIHJldHVybiB0aGlzLl9nZXREYXlOYW1lc0h0bWwoZmlyc3REYXksIDAsIGh0bWwsICsraSk7XG5cbiAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1kYXktbmFtZScgKyAodGhpcy5kLmlzV2Vla2VuZChjdXJEYXkpID8gXCIgLXdlZWtlbmQtXCIgOiBcIlwiKSArICdcIj4nICsgdGhpcy5kLmxvYy5kYXlzTWluW2N1ckRheV0gKyAnPC9kaXY+JztcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dldERheU5hbWVzSHRtbChmaXJzdERheSwgKytjdXJEYXksIGh0bWwsICsraSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldENlbGxDb250ZW50czogZnVuY3Rpb24gKGRhdGUsIHR5cGUpIHtcbiAgICAgICAgICAgIHZhciBjbGFzc2VzID0gXCJkYXRlcGlja2VyLS1jZWxsIGRhdGVwaWNrZXItLWNlbGwtXCIgKyB0eXBlLFxuICAgICAgICAgICAgICAgIGN1cnJlbnREYXRlID0gbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICBwYXJlbnQgPSB0aGlzLmQsXG4gICAgICAgICAgICAgICAgb3B0cyA9IHBhcmVudC5vcHRzLFxuICAgICAgICAgICAgICAgIGQgPSBELmdldFBhcnNlZERhdGUoZGF0ZSksXG4gICAgICAgICAgICAgICAgcmVuZGVyID0ge30sXG4gICAgICAgICAgICAgICAgaHRtbCA9IGQuZGF0ZTtcblxuICAgICAgICAgICAgaWYgKG9wdHMub25SZW5kZXJDZWxsKSB7XG4gICAgICAgICAgICAgICAgcmVuZGVyID0gb3B0cy5vblJlbmRlckNlbGwoZGF0ZSwgdHlwZSkgfHwge307XG4gICAgICAgICAgICAgICAgaHRtbCA9IHJlbmRlci5odG1sID8gcmVuZGVyLmh0bWwgOiBodG1sO1xuICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gcmVuZGVyLmNsYXNzZXMgPyAnICcgKyByZW5kZXIuY2xhc3NlcyA6ICcnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdkYXknOlxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyZW50LmlzV2Vla2VuZChkLmRheSkpIGNsYXNzZXMgKz0gXCIgLXdlZWtlbmQtXCI7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkLm1vbnRoICE9IHRoaXMuZC5wYXJzZWREYXRlLm1vbnRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzICs9IFwiIC1vdGhlci1tb250aC1cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghb3B0cy5zZWxlY3RPdGhlck1vbnRocykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gXCIgLWRpc2FibGVkLVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFvcHRzLnNob3dPdGhlck1vbnRocykgaHRtbCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ21vbnRoJzpcbiAgICAgICAgICAgICAgICAgICAgaHRtbCA9IHBhcmVudC5sb2NbcGFyZW50Lm9wdHMubW9udGhzRmllbGRdW2QubW9udGhdO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICd5ZWFyJzpcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRlY2FkZSA9IHBhcmVudC5jdXJEZWNhZGU7XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgPSBkLnllYXI7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkLnllYXIgPCBkZWNhZGVbMF0gfHwgZC55ZWFyID4gZGVjYWRlWzFdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzICs9ICcgLW90aGVyLWRlY2FkZS0nO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFvcHRzLnNlbGVjdE90aGVyWWVhcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzICs9IFwiIC1kaXNhYmxlZC1cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghb3B0cy5zaG93T3RoZXJZZWFycykgaHRtbCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob3B0cy5vblJlbmRlckNlbGwpIHtcbiAgICAgICAgICAgICAgICByZW5kZXIgPSBvcHRzLm9uUmVuZGVyQ2VsbChkYXRlLCB0eXBlKSB8fCB7fTtcbiAgICAgICAgICAgICAgICBodG1sID0gcmVuZGVyLmh0bWwgPyByZW5kZXIuaHRtbCA6IGh0bWw7XG4gICAgICAgICAgICAgICAgY2xhc3NlcyArPSByZW5kZXIuY2xhc3NlcyA/ICcgJyArIHJlbmRlci5jbGFzc2VzIDogJyc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcHRzLnJhbmdlKSB7XG4gICAgICAgICAgICAgICAgaWYgKEQuaXNTYW1lKHBhcmVudC5taW5SYW5nZSwgZGF0ZSwgdHlwZSkpIGNsYXNzZXMgKz0gJyAtcmFuZ2UtZnJvbS0nO1xuICAgICAgICAgICAgICAgIGlmIChELmlzU2FtZShwYXJlbnQubWF4UmFuZ2UsIGRhdGUsIHR5cGUpKSBjbGFzc2VzICs9ICcgLXJhbmdlLXRvLSc7XG5cbiAgICAgICAgICAgICAgICBpZiAocGFyZW50LnNlbGVjdGVkRGF0ZXMubGVuZ3RoID09IDEgJiYgcGFyZW50LmZvY3VzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgKEQuYmlnZ2VyKHBhcmVudC5taW5SYW5nZSwgZGF0ZSkgJiYgRC5sZXNzKHBhcmVudC5mb2N1c2VkLCBkYXRlKSkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIChELmxlc3MocGFyZW50Lm1heFJhbmdlLCBkYXRlKSAmJiBELmJpZ2dlcihwYXJlbnQuZm9jdXNlZCwgZGF0ZSkpKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzICs9ICcgLWluLXJhbmdlLSdcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChELmxlc3MocGFyZW50Lm1heFJhbmdlLCBkYXRlKSAmJiBELmlzU2FtZShwYXJlbnQuZm9jdXNlZCwgZGF0ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gJyAtcmFuZ2UtZnJvbS0nXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKEQuYmlnZ2VyKHBhcmVudC5taW5SYW5nZSwgZGF0ZSkgJiYgRC5pc1NhbWUocGFyZW50LmZvY3VzZWQsIGRhdGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzICs9ICcgLXJhbmdlLXRvLSdcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJlbnQuc2VsZWN0ZWREYXRlcy5sZW5ndGggPT0gMikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoRC5iaWdnZXIocGFyZW50Lm1pblJhbmdlLCBkYXRlKSAmJiBELmxlc3MocGFyZW50Lm1heFJhbmdlLCBkYXRlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NlcyArPSAnIC1pbi1yYW5nZS0nXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgaWYgKEQuaXNTYW1lKGN1cnJlbnREYXRlLCBkYXRlLCB0eXBlKSkgY2xhc3NlcyArPSAnIC1jdXJyZW50LSc7XG4gICAgICAgICAgICBpZiAocGFyZW50LmZvY3VzZWQgJiYgRC5pc1NhbWUoZGF0ZSwgcGFyZW50LmZvY3VzZWQsIHR5cGUpKSBjbGFzc2VzICs9ICcgLWZvY3VzLSc7XG4gICAgICAgICAgICBpZiAocGFyZW50Ll9pc1NlbGVjdGVkKGRhdGUsIHR5cGUpKSBjbGFzc2VzICs9ICcgLXNlbGVjdGVkLSc7XG4gICAgICAgICAgICBpZiAoIXBhcmVudC5faXNJblJhbmdlKGRhdGUsIHR5cGUpIHx8IHJlbmRlci5kaXNhYmxlZCkgY2xhc3NlcyArPSAnIC1kaXNhYmxlZC0nO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGh0bWw6IGh0bWwsXG4gICAgICAgICAgICAgICAgY2xhc3NlczogY2xhc3Nlc1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDYWxjdWxhdGVzIGRheXMgbnVtYmVyIHRvIHJlbmRlci4gR2VuZXJhdGVzIGRheXMgaHRtbCBhbmQgcmV0dXJucyBpdC5cbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGRhdGUgLSBEYXRlIG9iamVjdFxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX2dldERheXNIdG1sOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgdmFyIHRvdGFsTW9udGhEYXlzID0gRC5nZXREYXlzQ291bnQoZGF0ZSksXG4gICAgICAgICAgICAgICAgZmlyc3RNb250aERheSA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCAxKS5nZXREYXkoKSxcbiAgICAgICAgICAgICAgICBsYXN0TW9udGhEYXkgPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSwgdG90YWxNb250aERheXMpLmdldERheSgpLFxuICAgICAgICAgICAgICAgIGRheXNGcm9tUGV2TW9udGggPSBmaXJzdE1vbnRoRGF5IC0gdGhpcy5kLmxvYy5maXJzdERheSxcbiAgICAgICAgICAgICAgICBkYXlzRnJvbU5leHRNb250aCA9IDYgLSBsYXN0TW9udGhEYXkgKyB0aGlzLmQubG9jLmZpcnN0RGF5O1xuXG4gICAgICAgICAgICBkYXlzRnJvbVBldk1vbnRoID0gZGF5c0Zyb21QZXZNb250aCA8IDAgPyBkYXlzRnJvbVBldk1vbnRoICsgNyA6IGRheXNGcm9tUGV2TW9udGg7XG4gICAgICAgICAgICBkYXlzRnJvbU5leHRNb250aCA9IGRheXNGcm9tTmV4dE1vbnRoID4gNiA/IGRheXNGcm9tTmV4dE1vbnRoIC0gNyA6IGRheXNGcm9tTmV4dE1vbnRoO1xuXG4gICAgICAgICAgICB2YXIgc3RhcnREYXlJbmRleCA9IC1kYXlzRnJvbVBldk1vbnRoICsgMSxcbiAgICAgICAgICAgICAgICBtLCB5LFxuICAgICAgICAgICAgICAgIGh0bWwgPSAnJztcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IHN0YXJ0RGF5SW5kZXgsIG1heCA9IHRvdGFsTW9udGhEYXlzICsgZGF5c0Zyb21OZXh0TW9udGg7IGkgPD0gbWF4OyBpKyspIHtcbiAgICAgICAgICAgICAgICB5ID0gZGF0ZS5nZXRGdWxsWWVhcigpO1xuICAgICAgICAgICAgICAgIG0gPSBkYXRlLmdldE1vbnRoKCk7XG5cbiAgICAgICAgICAgICAgICBodG1sICs9IHRoaXMuX2dldERheUh0bWwobmV3IERhdGUoeSwgbSwgaSkpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBodG1sO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXREYXlIdG1sOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICB2YXIgY29udGVudCA9IHRoaXMuX2dldENlbGxDb250ZW50cyhkYXRlLCAnZGF5Jyk7XG5cbiAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cIicgKyBjb250ZW50LmNsYXNzZXMgKyAnXCIgJyArXG4gICAgICAgICAgICAgICAgJ2RhdGEtZGF0ZT1cIicgKyBkYXRlLmdldERhdGUoKSArICdcIiAnICtcbiAgICAgICAgICAgICAgICAnZGF0YS1tb250aD1cIicgKyBkYXRlLmdldE1vbnRoKCkgKyAnXCIgJyArXG4gICAgICAgICAgICAgICAgJ2RhdGEteWVhcj1cIicgKyBkYXRlLmdldEZ1bGxZZWFyKCkgKyAnXCI+JyArIGNvbnRlbnQuaHRtbCArICc8L2Rpdj4nO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZW5lcmF0ZXMgbW9udGhzIGh0bWxcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGRhdGUgLSBkYXRlIGluc3RhbmNlXG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfZ2V0TW9udGhzSHRtbDogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgICAgIHZhciBodG1sID0gJycsXG4gICAgICAgICAgICAgICAgZCA9IEQuZ2V0UGFyc2VkRGF0ZShkYXRlKSxcbiAgICAgICAgICAgICAgICBpID0gMDtcblxuICAgICAgICAgICAgd2hpbGUoaSA8IDEyKSB7XG4gICAgICAgICAgICAgICAgaHRtbCArPSB0aGlzLl9nZXRNb250aEh0bWwobmV3IERhdGUoZC55ZWFyLCBpKSk7XG4gICAgICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBodG1sO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRNb250aEh0bWw6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgICAgICB2YXIgY29udGVudCA9IHRoaXMuX2dldENlbGxDb250ZW50cyhkYXRlLCAnbW9udGgnKTtcblxuICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiJyArIGNvbnRlbnQuY2xhc3NlcyArICdcIiBkYXRhLW1vbnRoPVwiJyArIGRhdGUuZ2V0TW9udGgoKSArICdcIj4nICsgY29udGVudC5odG1sICsgJzwvZGl2PidcbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0WWVhcnNIdG1sOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgdmFyIGQgPSBELmdldFBhcnNlZERhdGUoZGF0ZSksXG4gICAgICAgICAgICAgICAgZGVjYWRlID0gRC5nZXREZWNhZGUoZGF0ZSksXG4gICAgICAgICAgICAgICAgZmlyc3RZZWFyID0gZGVjYWRlWzBdIC0gMSxcbiAgICAgICAgICAgICAgICBodG1sID0gJycsXG4gICAgICAgICAgICAgICAgaSA9IGZpcnN0WWVhcjtcblxuICAgICAgICAgICAgZm9yIChpOyBpIDw9IGRlY2FkZVsxXSArIDE7IGkrKykge1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gdGhpcy5fZ2V0WWVhckh0bWwobmV3IERhdGUoaSAsIDApKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldFllYXJIdG1sOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgdmFyIGNvbnRlbnQgPSB0aGlzLl9nZXRDZWxsQ29udGVudHMoZGF0ZSwgJ3llYXInKTtcblxuICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiJyArIGNvbnRlbnQuY2xhc3NlcyArICdcIiBkYXRhLXllYXI9XCInICsgZGF0ZS5nZXRGdWxsWWVhcigpICsgJ1wiPicgKyBjb250ZW50Lmh0bWwgKyAnPC9kaXY+J1xuICAgICAgICB9LFxuXG4gICAgICAgIF9yZW5kZXJUeXBlczoge1xuICAgICAgICAgICAgZGF5czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBkYXlOYW1lcyA9IHRoaXMuX2dldERheU5hbWVzSHRtbCh0aGlzLmQubG9jLmZpcnN0RGF5KSxcbiAgICAgICAgICAgICAgICAgICAgZGF5cyA9IHRoaXMuX2dldERheXNIdG1sKHRoaXMuZC5jdXJyZW50RGF0ZSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLiRjZWxscy5odG1sKGRheXMpO1xuICAgICAgICAgICAgICAgIHRoaXMuJG5hbWVzLmh0bWwoZGF5TmFtZXMpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbW9udGhzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGh0bWwgPSB0aGlzLl9nZXRNb250aHNIdG1sKHRoaXMuZC5jdXJyZW50RGF0ZSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLiRjZWxscy5odG1sKGh0bWwpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeWVhcnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IHRoaXMuX2dldFllYXJzSHRtbCh0aGlzLmQuY3VycmVudERhdGUpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy4kY2VsbHMuaHRtbChodG1sKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9yZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlclR5cGVzW3RoaXMudHlwZV0uYmluZCh0aGlzKSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF91cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciAkY2VsbHMgPSAkKCcuZGF0ZXBpY2tlci0tY2VsbCcsIHRoaXMuJGNlbGxzKSxcbiAgICAgICAgICAgICAgICBfdGhpcyA9IHRoaXMsXG4gICAgICAgICAgICAgICAgY2xhc3NlcyxcbiAgICAgICAgICAgICAgICAkY2VsbCxcbiAgICAgICAgICAgICAgICBkYXRlO1xuICAgICAgICAgICAgJGNlbGxzLmVhY2goZnVuY3Rpb24gKGNlbGwsIGkpIHtcbiAgICAgICAgICAgICAgICAkY2VsbCA9ICQodGhpcyk7XG4gICAgICAgICAgICAgICAgZGF0ZSA9IF90aGlzLmQuX2dldERhdGVGcm9tQ2VsbCgkKHRoaXMpKTtcbiAgICAgICAgICAgICAgICBjbGFzc2VzID0gX3RoaXMuX2dldENlbGxDb250ZW50cyhkYXRlLCBfdGhpcy5kLmNlbGxUeXBlKTtcbiAgICAgICAgICAgICAgICAkY2VsbC5hdHRyKCdjbGFzcycsY2xhc3Nlcy5jbGFzc2VzKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvdzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgdGhpcy5hY2l0dmUgPSB0cnVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhpZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gIEV2ZW50c1xuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAgICAgX2hhbmRsZUNsaWNrOiBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgIHZhciBkYXRlID0gZWwuZGF0YSgnZGF0ZScpIHx8IDEsXG4gICAgICAgICAgICAgICAgbW9udGggPSBlbC5kYXRhKCdtb250aCcpIHx8IDAsXG4gICAgICAgICAgICAgICAgeWVhciA9IGVsLmRhdGEoJ3llYXInKSB8fCB0aGlzLmQucGFyc2VkRGF0ZS55ZWFyO1xuICAgICAgICAgICAgLy8gQ2hhbmdlIHZpZXcgaWYgbWluIHZpZXcgZG9lcyBub3QgcmVhY2ggeWV0XG4gICAgICAgICAgICBpZiAodGhpcy5kLnZpZXcgIT0gdGhpcy5vcHRzLm1pblZpZXcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmQuZG93bihuZXcgRGF0ZSh5ZWFyLCBtb250aCwgZGF0ZSkpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFNlbGVjdCBkYXRlIGlmIG1pbiB2aWV3IGlzIHJlYWNoZWRcbiAgICAgICAgICAgIHZhciBzZWxlY3RlZERhdGUgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgZGF0ZSksXG4gICAgICAgICAgICAgICAgYWxyZWFkeVNlbGVjdGVkID0gdGhpcy5kLl9pc1NlbGVjdGVkKHNlbGVjdGVkRGF0ZSwgdGhpcy5kLmNlbGxUeXBlKTtcblxuICAgICAgICAgICAgaWYgKCFhbHJlYWR5U2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmQuc2VsZWN0RGF0ZShzZWxlY3RlZERhdGUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhbHJlYWR5U2VsZWN0ZWQgJiYgdGhpcy5vcHRzLnRvZ2dsZVNlbGVjdGVkKXtcbiAgICAgICAgICAgICAgICB0aGlzLmQucmVtb3ZlRGF0ZShzZWxlY3RlZERhdGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uQ2xpY2tDZWxsOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyICRlbCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5kYXRlcGlja2VyLS1jZWxsJyk7XG5cbiAgICAgICAgICAgIGlmICgkZWwuaGFzQ2xhc3MoJy1kaXNhYmxlZC0nKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICB0aGlzLl9oYW5kbGVDbGljay5iaW5kKHRoaXMpKCRlbCk7XG4gICAgICAgIH1cbiAgICB9O1xufSkoKTtcblxuOyhmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRlbXBsYXRlID0gJycgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLW5hdi1hY3Rpb25cIiBkYXRhLWFjdGlvbj1cInByZXZcIj4je3ByZXZIdG1sfTwvZGl2PicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLW5hdi10aXRsZVwiPiN7dGl0bGV9PC9kaXY+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tbmF2LWFjdGlvblwiIGRhdGEtYWN0aW9uPVwibmV4dFwiPiN7bmV4dEh0bWx9PC9kaXY+JyxcbiAgICAgICAgYnV0dG9uc0NvbnRhaW5lclRlbXBsYXRlID0gJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1idXR0b25zXCI+PC9kaXY+JyxcbiAgICAgICAgYnV0dG9uID0gJzxzcGFuIGNsYXNzPVwiZGF0ZXBpY2tlci0tYnV0dG9uXCIgZGF0YS1hY3Rpb249XCIje2FjdGlvbn1cIj4je2xhYmVsfTwvc3Bhbj4nO1xuXG4gICAgRGF0ZXBpY2tlci5OYXZpZ2F0aW9uID0gZnVuY3Rpb24gKGQsIG9wdHMpIHtcbiAgICAgICAgdGhpcy5kID0gZDtcbiAgICAgICAgdGhpcy5vcHRzID0gb3B0cztcblxuICAgICAgICB0aGlzLiRidXR0b25zQ29udGFpbmVyID0gJyc7XG5cbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfTtcblxuICAgIERhdGVwaWNrZXIuTmF2aWdhdGlvbi5wcm90b3R5cGUgPSB7XG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuX2J1aWxkQmFzZUh0bWwoKTtcbiAgICAgICAgICAgIHRoaXMuX2JpbmRFdmVudHMoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfYmluZEV2ZW50czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5kLiRuYXYub24oJ2NsaWNrJywgJy5kYXRlcGlja2VyLS1uYXYtYWN0aW9uJywgJC5wcm94eSh0aGlzLl9vbkNsaWNrTmF2QnV0dG9uLCB0aGlzKSk7XG4gICAgICAgICAgICB0aGlzLmQuJG5hdi5vbignY2xpY2snLCAnLmRhdGVwaWNrZXItLW5hdi10aXRsZScsICQucHJveHkodGhpcy5fb25DbGlja05hdlRpdGxlLCB0aGlzKSk7XG4gICAgICAgICAgICB0aGlzLmQuJGRhdGVwaWNrZXIub24oJ2NsaWNrJywgJy5kYXRlcGlja2VyLS1idXR0b24nLCAkLnByb3h5KHRoaXMuX29uQ2xpY2tOYXZCdXR0b24sIHRoaXMpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfYnVpbGRCYXNlSHRtbDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyKCk7XG4gICAgICAgICAgICB0aGlzLl9hZGRCdXR0b25zSWZOZWVkKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2FkZEJ1dHRvbnNJZk5lZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMudG9kYXlCdXR0b24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRCdXR0b24oJ3RvZGF5JylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMuY2xlYXJCdXR0b24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRCdXR0b24oJ2NsZWFyJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGl0bGUgPSB0aGlzLl9nZXRUaXRsZSh0aGlzLmQuY3VycmVudERhdGUpLFxuICAgICAgICAgICAgICAgIGh0bWwgPSBEYXRlcGlja2VyLnRlbXBsYXRlKHRlbXBsYXRlLCAkLmV4dGVuZCh7dGl0bGU6IHRpdGxlfSwgdGhpcy5vcHRzKSk7XG4gICAgICAgICAgICB0aGlzLmQuJG5hdi5odG1sKGh0bWwpO1xuICAgICAgICAgICAgaWYgKHRoaXMuZC52aWV3ID09ICd5ZWFycycpIHtcbiAgICAgICAgICAgICAgICAkKCcuZGF0ZXBpY2tlci0tbmF2LXRpdGxlJywgdGhpcy5kLiRuYXYpLmFkZENsYXNzKCctZGlzYWJsZWQtJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldE5hdlN0YXR1cygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRUaXRsZTogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmQuZm9ybWF0RGF0ZSh0aGlzLm9wdHMubmF2VGl0bGVzW3RoaXMuZC52aWV3XSwgZGF0ZSlcbiAgICAgICAgfSxcblxuICAgICAgICBfYWRkQnV0dG9uOiBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLiRidXR0b25zQ29udGFpbmVyLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZEJ1dHRvbnNDb250YWluZXIoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHRoaXMuZC5sb2NbdHlwZV1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGh0bWwgPSBEYXRlcGlja2VyLnRlbXBsYXRlKGJ1dHRvbiwgZGF0YSk7XG5cbiAgICAgICAgICAgIGlmICgkKCdbZGF0YS1hY3Rpb249JyArIHR5cGUgKyAnXScsIHRoaXMuJGJ1dHRvbnNDb250YWluZXIpLmxlbmd0aCkgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy4kYnV0dG9uc0NvbnRhaW5lci5hcHBlbmQoaHRtbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2FkZEJ1dHRvbnNDb250YWluZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuZC4kZGF0ZXBpY2tlci5hcHBlbmQoYnV0dG9uc0NvbnRhaW5lclRlbXBsYXRlKTtcbiAgICAgICAgICAgIHRoaXMuJGJ1dHRvbnNDb250YWluZXIgPSAkKCcuZGF0ZXBpY2tlci0tYnV0dG9ucycsIHRoaXMuZC4kZGF0ZXBpY2tlcik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0TmF2U3RhdHVzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoISh0aGlzLm9wdHMubWluRGF0ZSB8fCB0aGlzLm9wdHMubWF4RGF0ZSkgfHwgIXRoaXMub3B0cy5kaXNhYmxlTmF2V2hlbk91dE9mUmFuZ2UpIHJldHVybjtcblxuICAgICAgICAgICAgdmFyIGRhdGUgPSB0aGlzLmQucGFyc2VkRGF0ZSxcbiAgICAgICAgICAgICAgICBtID0gZGF0ZS5tb250aCxcbiAgICAgICAgICAgICAgICB5ID0gZGF0ZS55ZWFyLFxuICAgICAgICAgICAgICAgIGQgPSBkYXRlLmRhdGU7XG5cbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy5kLnZpZXcpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdkYXlzJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmQuX2lzSW5SYW5nZShuZXcgRGF0ZSh5LCBtLTEsIGQpLCAnbW9udGgnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZU5hdigncHJldicpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmQuX2lzSW5SYW5nZShuZXcgRGF0ZSh5LCBtKzEsIGQpLCAnbW9udGgnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZU5hdignbmV4dCcpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnbW9udGhzJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmQuX2lzSW5SYW5nZShuZXcgRGF0ZSh5LTEsIG0sIGQpLCAneWVhcicpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlTmF2KCdwcmV2JylcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZC5faXNJblJhbmdlKG5ldyBEYXRlKHkrMSwgbSwgZCksICd5ZWFyJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVOYXYoJ25leHQnKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3llYXJzJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmQuX2lzSW5SYW5nZShuZXcgRGF0ZSh5LTEwLCBtLCBkKSwgJ3llYXInKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZU5hdigncHJldicpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmQuX2lzSW5SYW5nZShuZXcgRGF0ZSh5KzEwLCBtLCBkKSwgJ3llYXInKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZU5hdignbmV4dCcpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2Rpc2FibGVOYXY6IGZ1bmN0aW9uIChuYXYpIHtcbiAgICAgICAgICAgICQoJ1tkYXRhLWFjdGlvbj1cIicgKyBuYXYgKyAnXCJdJywgdGhpcy5kLiRuYXYpLmFkZENsYXNzKCctZGlzYWJsZWQtJylcbiAgICAgICAgfSxcblxuICAgICAgICBfYWN0aXZhdGVOYXY6IGZ1bmN0aW9uIChuYXYpIHtcbiAgICAgICAgICAgICQoJ1tkYXRhLWFjdGlvbj1cIicgKyBuYXYgKyAnXCJdJywgdGhpcy5kLiRuYXYpLnJlbW92ZUNsYXNzKCctZGlzYWJsZWQtJylcbiAgICAgICAgfSxcblxuICAgICAgICBfb25DbGlja05hdkJ1dHRvbjogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciAkZWwgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCdbZGF0YS1hY3Rpb25dJyksXG4gICAgICAgICAgICAgICAgYWN0aW9uID0gJGVsLmRhdGEoJ2FjdGlvbicpO1xuXG4gICAgICAgICAgICB0aGlzLmRbYWN0aW9uXSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9vbkNsaWNrTmF2VGl0bGU6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBpZiAoJChlLnRhcmdldCkuaGFzQ2xhc3MoJy1kaXNhYmxlZC0nKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5kLnZpZXcgPT0gJ2RheXMnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZC52aWV3ID0gJ21vbnRocydcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5kLnZpZXcgPSAneWVhcnMnO1xuICAgICAgICB9XG4gICAgfVxuXG59KSgpO1xuIiwiIWZ1bmN0aW9uKGEsYil7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXCJqcXVlcnlcIl0sYik6XCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9YihyZXF1aXJlKFwianF1ZXJ5XCIpKTpiKGEualF1ZXJ5KX0odGhpcyxmdW5jdGlvbihhKXtcImZ1bmN0aW9uXCIhPXR5cGVvZiBPYmplY3QuY3JlYXRlJiYoT2JqZWN0LmNyZWF0ZT1mdW5jdGlvbihhKXtmdW5jdGlvbiBiKCl7fXJldHVybiBiLnByb3RvdHlwZT1hLG5ldyBifSk7dmFyIGI9e2luaXQ6ZnVuY3Rpb24oYil7cmV0dXJuIHRoaXMub3B0aW9ucz1hLmV4dGVuZCh7fSxhLm5vdHkuZGVmYXVsdHMsYiksdGhpcy5vcHRpb25zLmxheW91dD10aGlzLm9wdGlvbnMuY3VzdG9tP2Eubm90eS5sYXlvdXRzLmlubGluZTphLm5vdHkubGF5b3V0c1t0aGlzLm9wdGlvbnMubGF5b3V0XSxhLm5vdHkudGhlbWVzW3RoaXMub3B0aW9ucy50aGVtZV0/dGhpcy5vcHRpb25zLnRoZW1lPWEubm90eS50aGVtZXNbdGhpcy5vcHRpb25zLnRoZW1lXTp0aGlzLm9wdGlvbnMudGhlbWVDbGFzc05hbWU9dGhpcy5vcHRpb25zLnRoZW1lLHRoaXMub3B0aW9ucz1hLmV4dGVuZCh7fSx0aGlzLm9wdGlvbnMsdGhpcy5vcHRpb25zLmxheW91dC5vcHRpb25zKSx0aGlzLm9wdGlvbnMuaWQ9XCJub3R5X1wiKyhuZXcgRGF0ZSkuZ2V0VGltZSgpKk1hdGguZmxvb3IoMWU2Kk1hdGgucmFuZG9tKCkpLHRoaXMuX2J1aWxkKCksdGhpc30sX2J1aWxkOmZ1bmN0aW9uKCl7dmFyIGI9YSgnPGRpdiBjbGFzcz1cIm5vdHlfYmFyIG5vdHlfdHlwZV8nK3RoaXMub3B0aW9ucy50eXBlKydcIj48L2Rpdj4nKS5hdHRyKFwiaWRcIix0aGlzLm9wdGlvbnMuaWQpO2lmKGIuYXBwZW5kKHRoaXMub3B0aW9ucy50ZW1wbGF0ZSkuZmluZChcIi5ub3R5X3RleHRcIikuaHRtbCh0aGlzLm9wdGlvbnMudGV4dCksdGhpcy4kYmFyPW51bGwhPT10aGlzLm9wdGlvbnMubGF5b3V0LnBhcmVudC5vYmplY3Q/YSh0aGlzLm9wdGlvbnMubGF5b3V0LnBhcmVudC5vYmplY3QpLmNzcyh0aGlzLm9wdGlvbnMubGF5b3V0LnBhcmVudC5jc3MpLmFwcGVuZChiKTpiLHRoaXMub3B0aW9ucy50aGVtZUNsYXNzTmFtZSYmdGhpcy4kYmFyLmFkZENsYXNzKHRoaXMub3B0aW9ucy50aGVtZUNsYXNzTmFtZSkuYWRkQ2xhc3MoXCJub3R5X2NvbnRhaW5lcl90eXBlX1wiK3RoaXMub3B0aW9ucy50eXBlKSx0aGlzLm9wdGlvbnMuYnV0dG9ucyl7dGhpcy5vcHRpb25zLmNsb3NlV2l0aD1bXSx0aGlzLm9wdGlvbnMudGltZW91dD0hMTt2YXIgYz1hKFwiPGRpdi8+XCIpLmFkZENsYXNzKFwibm90eV9idXR0b25zXCIpO251bGwhPT10aGlzLm9wdGlvbnMubGF5b3V0LnBhcmVudC5vYmplY3Q/dGhpcy4kYmFyLmZpbmQoXCIubm90eV9iYXJcIikuYXBwZW5kKGMpOnRoaXMuJGJhci5hcHBlbmQoYyk7dmFyIGQ9dGhpczthLmVhY2godGhpcy5vcHRpb25zLmJ1dHRvbnMsZnVuY3Rpb24oYixjKXt2YXIgZT1hKFwiPGJ1dHRvbi8+XCIpLmFkZENsYXNzKGMuYWRkQ2xhc3M/Yy5hZGRDbGFzczpcImdyYXlcIikuaHRtbChjLnRleHQpLmF0dHIoXCJpZFwiLGMuaWQ/Yy5pZDpcImJ1dHRvbi1cIitiKS5hdHRyKFwidGl0bGVcIixjLnRpdGxlKS5hcHBlbmRUbyhkLiRiYXIuZmluZChcIi5ub3R5X2J1dHRvbnNcIikpLm9uKFwiY2xpY2tcIixmdW5jdGlvbihiKXthLmlzRnVuY3Rpb24oYy5vbkNsaWNrKSYmYy5vbkNsaWNrLmNhbGwoZSxkLGIpfSl9KX10aGlzLiRtZXNzYWdlPXRoaXMuJGJhci5maW5kKFwiLm5vdHlfbWVzc2FnZVwiKSx0aGlzLiRjbG9zZUJ1dHRvbj10aGlzLiRiYXIuZmluZChcIi5ub3R5X2Nsb3NlXCIpLHRoaXMuJGJ1dHRvbnM9dGhpcy4kYmFyLmZpbmQoXCIubm90eV9idXR0b25zXCIpLGEubm90eS5zdG9yZVt0aGlzLm9wdGlvbnMuaWRdPXRoaXN9LHNob3c6ZnVuY3Rpb24oKXt2YXIgYj10aGlzO3JldHVybiBiLm9wdGlvbnMuY3VzdG9tP2Iub3B0aW9ucy5jdXN0b20uZmluZChiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikuYXBwZW5kKGIuJGJhcik6YShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikuYXBwZW5kKGIuJGJhciksYi5vcHRpb25zLnRoZW1lJiZiLm9wdGlvbnMudGhlbWUuc3R5bGUmJmIub3B0aW9ucy50aGVtZS5zdHlsZS5hcHBseShiKSxcImZ1bmN0aW9uXCI9PT1hLnR5cGUoYi5vcHRpb25zLmxheW91dC5jc3MpP3RoaXMub3B0aW9ucy5sYXlvdXQuY3NzLmFwcGx5KGIuJGJhcik6Yi4kYmFyLmNzcyh0aGlzLm9wdGlvbnMubGF5b3V0LmNzc3x8e30pLGIuJGJhci5hZGRDbGFzcyhiLm9wdGlvbnMubGF5b3V0LmFkZENsYXNzKSxiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zdHlsZS5hcHBseShhKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKSxbYi5vcHRpb25zLndpdGhpbl0pLGIuc2hvd2luZz0hMCxiLm9wdGlvbnMudGhlbWUmJmIub3B0aW9ucy50aGVtZS5zdHlsZSYmYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrLm9uU2hvdy5hcHBseSh0aGlzKSxhLmluQXJyYXkoXCJjbGlja1wiLGIub3B0aW9ucy5jbG9zZVdpdGgpPi0xJiZiLiRiYXIuY3NzKFwiY3Vyc29yXCIsXCJwb2ludGVyXCIpLm9uZShcImNsaWNrXCIsZnVuY3Rpb24oYSl7Yi5zdG9wUHJvcGFnYXRpb24oYSksYi5vcHRpb25zLmNhbGxiYWNrLm9uQ2xvc2VDbGljayYmYi5vcHRpb25zLmNhbGxiYWNrLm9uQ2xvc2VDbGljay5hcHBseShiKSxiLmNsb3NlKCl9KSxhLmluQXJyYXkoXCJob3ZlclwiLGIub3B0aW9ucy5jbG9zZVdpdGgpPi0xJiZiLiRiYXIub25lKFwibW91c2VlbnRlclwiLGZ1bmN0aW9uKCl7Yi5jbG9zZSgpfSksYS5pbkFycmF5KFwiYnV0dG9uXCIsYi5vcHRpb25zLmNsb3NlV2l0aCk+LTEmJmIuJGNsb3NlQnV0dG9uLm9uZShcImNsaWNrXCIsZnVuY3Rpb24oYSl7Yi5zdG9wUHJvcGFnYXRpb24oYSksYi5jbG9zZSgpfSksLTE9PWEuaW5BcnJheShcImJ1dHRvblwiLGIub3B0aW9ucy5jbG9zZVdpdGgpJiZiLiRjbG9zZUJ1dHRvbi5yZW1vdmUoKSxiLm9wdGlvbnMuY2FsbGJhY2sub25TaG93JiZiLm9wdGlvbnMuY2FsbGJhY2sub25TaG93LmFwcGx5KGIpLFwic3RyaW5nXCI9PXR5cGVvZiBiLm9wdGlvbnMuYW5pbWF0aW9uLm9wZW4/KGIuJGJhci5jc3MoXCJoZWlnaHRcIixiLiRiYXIuaW5uZXJIZWlnaHQoKSksYi4kYmFyLm9uKFwiY2xpY2tcIixmdW5jdGlvbihhKXtiLndhc0NsaWNrZWQ9ITB9KSxiLiRiYXIuc2hvdygpLmFkZENsYXNzKGIub3B0aW9ucy5hbmltYXRpb24ub3Blbikub25lKFwid2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZFwiLGZ1bmN0aW9uKCl7Yi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyU2hvdyYmYi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyU2hvdy5hcHBseShiKSxiLnNob3dpbmc9ITEsYi5zaG93bj0hMCxiLmhhc093blByb3BlcnR5KFwid2FzQ2xpY2tlZFwiKSYmKGIuJGJhci5vZmYoXCJjbGlja1wiLGZ1bmN0aW9uKGEpe2Iud2FzQ2xpY2tlZD0hMH0pLGIuY2xvc2UoKSl9KSk6Yi4kYmFyLmFuaW1hdGUoYi5vcHRpb25zLmFuaW1hdGlvbi5vcGVuLGIub3B0aW9ucy5hbmltYXRpb24uc3BlZWQsYi5vcHRpb25zLmFuaW1hdGlvbi5lYXNpbmcsZnVuY3Rpb24oKXtiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJTaG93JiZiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJTaG93LmFwcGx5KGIpLGIuc2hvd2luZz0hMSxiLnNob3duPSEwfSksYi5vcHRpb25zLnRpbWVvdXQmJmIuJGJhci5kZWxheShiLm9wdGlvbnMudGltZW91dCkucHJvbWlzZSgpLmRvbmUoZnVuY3Rpb24oKXtiLmNsb3NlKCl9KSx0aGlzfSxjbG9zZTpmdW5jdGlvbigpe2lmKCEodGhpcy5jbG9zZWR8fHRoaXMuJGJhciYmdGhpcy4kYmFyLmhhc0NsYXNzKFwiaS1hbS1jbG9zaW5nLW5vd1wiKSkpe3ZhciBiPXRoaXM7aWYodGhpcy5zaG93aW5nKXJldHVybiB2b2lkIGIuJGJhci5xdWV1ZShmdW5jdGlvbigpe2IuY2xvc2UuYXBwbHkoYil9KTtpZighdGhpcy5zaG93biYmIXRoaXMuc2hvd2luZyl7dmFyIGM9W107cmV0dXJuIGEuZWFjaChhLm5vdHkucXVldWUsZnVuY3Rpb24oYSxkKXtkLm9wdGlvbnMuaWQhPWIub3B0aW9ucy5pZCYmYy5wdXNoKGQpfSksdm9pZChhLm5vdHkucXVldWU9Yyl9Yi4kYmFyLmFkZENsYXNzKFwiaS1hbS1jbG9zaW5nLW5vd1wiKSxiLm9wdGlvbnMuY2FsbGJhY2sub25DbG9zZSYmYi5vcHRpb25zLmNhbGxiYWNrLm9uQ2xvc2UuYXBwbHkoYiksXCJzdHJpbmdcIj09dHlwZW9mIGIub3B0aW9ucy5hbmltYXRpb24uY2xvc2U/Yi4kYmFyLmFkZENsYXNzKGIub3B0aW9ucy5hbmltYXRpb24uY2xvc2UpLm9uZShcIndlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmRcIixmdW5jdGlvbigpe2Iub3B0aW9ucy5jYWxsYmFjay5hZnRlckNsb3NlJiZiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJDbG9zZS5hcHBseShiKSxiLmNsb3NlQ2xlYW5VcCgpfSk6Yi4kYmFyLmNsZWFyUXVldWUoKS5zdG9wKCkuYW5pbWF0ZShiLm9wdGlvbnMuYW5pbWF0aW9uLmNsb3NlLGIub3B0aW9ucy5hbmltYXRpb24uc3BlZWQsYi5vcHRpb25zLmFuaW1hdGlvbi5lYXNpbmcsZnVuY3Rpb24oKXtiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJDbG9zZSYmYi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyQ2xvc2UuYXBwbHkoYil9KS5wcm9taXNlKCkuZG9uZShmdW5jdGlvbigpe2IuY2xvc2VDbGVhblVwKCl9KX19LGNsb3NlQ2xlYW5VcDpmdW5jdGlvbigpe3ZhciBiPXRoaXM7Yi5vcHRpb25zLm1vZGFsJiYoYS5ub3R5UmVuZGVyZXIuc2V0TW9kYWxDb3VudCgtMSksMD09YS5ub3R5UmVuZGVyZXIuZ2V0TW9kYWxDb3VudCgpJiZhKFwiLm5vdHlfbW9kYWxcIikuZmFkZU91dChiLm9wdGlvbnMuYW5pbWF0aW9uLmZhZGVTcGVlZCxmdW5jdGlvbigpe2EodGhpcykucmVtb3ZlKCl9KSksYS5ub3R5UmVuZGVyZXIuc2V0TGF5b3V0Q291bnRGb3IoYiwtMSksMD09YS5ub3R5UmVuZGVyZXIuZ2V0TGF5b3V0Q291bnRGb3IoYikmJmEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLnJlbW92ZSgpLFwidW5kZWZpbmVkXCIhPXR5cGVvZiBiLiRiYXImJm51bGwhPT1iLiRiYXImJihcInN0cmluZ1wiPT10eXBlb2YgYi5vcHRpb25zLmFuaW1hdGlvbi5jbG9zZT8oYi4kYmFyLmNzcyhcInRyYW5zaXRpb25cIixcImFsbCAxMDBtcyBlYXNlXCIpLmNzcyhcImJvcmRlclwiLDApLmNzcyhcIm1hcmdpblwiLDApLmhlaWdodCgwKSxiLiRiYXIub25lKFwidHJhbnNpdGlvbmVuZCB3ZWJraXRUcmFuc2l0aW9uRW5kIG9UcmFuc2l0aW9uRW5kIE1TVHJhbnNpdGlvbkVuZFwiLGZ1bmN0aW9uKCl7Yi4kYmFyLnJlbW92ZSgpLGIuJGJhcj1udWxsLGIuY2xvc2VkPSEwLGIub3B0aW9ucy50aGVtZS5jYWxsYmFjayYmYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrLm9uQ2xvc2UmJmIub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vbkNsb3NlLmFwcGx5KGIpfSkpOihiLiRiYXIucmVtb3ZlKCksYi4kYmFyPW51bGwsYi5jbG9zZWQ9ITApKSxkZWxldGUgYS5ub3R5LnN0b3JlW2Iub3B0aW9ucy5pZF0sYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrJiZiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2sub25DbG9zZSYmYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrLm9uQ2xvc2UuYXBwbHkoYiksYi5vcHRpb25zLmRpc21pc3NRdWV1ZXx8KGEubm90eS5vbnRhcD0hMCxhLm5vdHlSZW5kZXJlci5yZW5kZXIoKSksYi5vcHRpb25zLm1heFZpc2libGU+MCYmYi5vcHRpb25zLmRpc21pc3NRdWV1ZSYmYS5ub3R5UmVuZGVyZXIucmVuZGVyKCl9LHNldFRleHQ6ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuY2xvc2VkfHwodGhpcy5vcHRpb25zLnRleHQ9YSx0aGlzLiRiYXIuZmluZChcIi5ub3R5X3RleHRcIikuaHRtbChhKSksdGhpc30sc2V0VHlwZTpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5jbG9zZWR8fCh0aGlzLm9wdGlvbnMudHlwZT1hLHRoaXMub3B0aW9ucy50aGVtZS5zdHlsZS5hcHBseSh0aGlzKSx0aGlzLm9wdGlvbnMudGhlbWUuY2FsbGJhY2sub25TaG93LmFwcGx5KHRoaXMpKSx0aGlzfSxzZXRUaW1lb3V0OmZ1bmN0aW9uKGEpe2lmKCF0aGlzLmNsb3NlZCl7dmFyIGI9dGhpczt0aGlzLm9wdGlvbnMudGltZW91dD1hLGIuJGJhci5kZWxheShiLm9wdGlvbnMudGltZW91dCkucHJvbWlzZSgpLmRvbmUoZnVuY3Rpb24oKXtiLmNsb3NlKCl9KX1yZXR1cm4gdGhpc30sc3RvcFByb3BhZ2F0aW9uOmZ1bmN0aW9uKGEpe2E9YXx8d2luZG93LmV2ZW50LFwidW5kZWZpbmVkXCIhPXR5cGVvZiBhLnN0b3BQcm9wYWdhdGlvbj9hLnN0b3BQcm9wYWdhdGlvbigpOmEuY2FuY2VsQnViYmxlPSEwfSxjbG9zZWQ6ITEsc2hvd2luZzohMSxzaG93bjohMX07YS5ub3R5UmVuZGVyZXI9e30sYS5ub3R5UmVuZGVyZXIuaW5pdD1mdW5jdGlvbihjKXt2YXIgZD1PYmplY3QuY3JlYXRlKGIpLmluaXQoYyk7cmV0dXJuIGQub3B0aW9ucy5raWxsZXImJmEubm90eS5jbG9zZUFsbCgpLGQub3B0aW9ucy5mb3JjZT9hLm5vdHkucXVldWUudW5zaGlmdChkKTphLm5vdHkucXVldWUucHVzaChkKSxhLm5vdHlSZW5kZXJlci5yZW5kZXIoKSxcIm9iamVjdFwiPT1hLm5vdHkucmV0dXJucz9kOmQub3B0aW9ucy5pZH0sYS5ub3R5UmVuZGVyZXIucmVuZGVyPWZ1bmN0aW9uKCl7dmFyIGI9YS5ub3R5LnF1ZXVlWzBdO1wib2JqZWN0XCI9PT1hLnR5cGUoYik/Yi5vcHRpb25zLmRpc21pc3NRdWV1ZT9iLm9wdGlvbnMubWF4VmlzaWJsZT4wP2EoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IrXCIgPiBsaVwiKS5sZW5ndGg8Yi5vcHRpb25zLm1heFZpc2libGUmJmEubm90eVJlbmRlcmVyLnNob3coYS5ub3R5LnF1ZXVlLnNoaWZ0KCkpOmEubm90eVJlbmRlcmVyLnNob3coYS5ub3R5LnF1ZXVlLnNoaWZ0KCkpOmEubm90eS5vbnRhcCYmKGEubm90eVJlbmRlcmVyLnNob3coYS5ub3R5LnF1ZXVlLnNoaWZ0KCkpLGEubm90eS5vbnRhcD0hMSk6YS5ub3R5Lm9udGFwPSEwfSxhLm5vdHlSZW5kZXJlci5zaG93PWZ1bmN0aW9uKGIpe2Iub3B0aW9ucy5tb2RhbCYmKGEubm90eVJlbmRlcmVyLmNyZWF0ZU1vZGFsRm9yKGIpLGEubm90eVJlbmRlcmVyLnNldE1vZGFsQ291bnQoMSkpLGIub3B0aW9ucy5jdXN0b20/MD09Yi5vcHRpb25zLmN1c3RvbS5maW5kKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5sZW5ndGg/Yi5vcHRpb25zLmN1c3RvbS5hcHBlbmQoYShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5vYmplY3QpLmFkZENsYXNzKFwiaS1hbS1uZXdcIikpOmIub3B0aW9ucy5jdXN0b20uZmluZChiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikucmVtb3ZlQ2xhc3MoXCJpLWFtLW5ld1wiKTowPT1hKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5sZW5ndGg/YShcImJvZHlcIikuYXBwZW5kKGEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIub2JqZWN0KS5hZGRDbGFzcyhcImktYW0tbmV3XCIpKTphKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5yZW1vdmVDbGFzcyhcImktYW0tbmV3XCIpLGEubm90eVJlbmRlcmVyLnNldExheW91dENvdW50Rm9yKGIsMSksYi5zaG93KCl9LGEubm90eVJlbmRlcmVyLmNyZWF0ZU1vZGFsRm9yPWZ1bmN0aW9uKGIpe2lmKDA9PWEoXCIubm90eV9tb2RhbFwiKS5sZW5ndGgpe3ZhciBjPWEoXCI8ZGl2Lz5cIikuYWRkQ2xhc3MoXCJub3R5X21vZGFsXCIpLmFkZENsYXNzKGIub3B0aW9ucy50aGVtZSkuZGF0YShcIm5vdHlfbW9kYWxfY291bnRcIiwwKTtiLm9wdGlvbnMudGhlbWUubW9kYWwmJmIub3B0aW9ucy50aGVtZS5tb2RhbC5jc3MmJmMuY3NzKGIub3B0aW9ucy50aGVtZS5tb2RhbC5jc3MpLGMucHJlcGVuZFRvKGEoXCJib2R5XCIpKS5mYWRlSW4oYi5vcHRpb25zLmFuaW1hdGlvbi5mYWRlU3BlZWQpLGEuaW5BcnJheShcImJhY2tkcm9wXCIsYi5vcHRpb25zLmNsb3NlV2l0aCk+LTEmJmMub24oXCJjbGlja1wiLGZ1bmN0aW9uKGIpe2Eubm90eS5jbG9zZUFsbCgpfSl9fSxhLm5vdHlSZW5kZXJlci5nZXRMYXlvdXRDb3VudEZvcj1mdW5jdGlvbihiKXtyZXR1cm4gYShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikuZGF0YShcIm5vdHlfbGF5b3V0X2NvdW50XCIpfHwwfSxhLm5vdHlSZW5kZXJlci5zZXRMYXlvdXRDb3VudEZvcj1mdW5jdGlvbihiLGMpe3JldHVybiBhKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5kYXRhKFwibm90eV9sYXlvdXRfY291bnRcIixhLm5vdHlSZW5kZXJlci5nZXRMYXlvdXRDb3VudEZvcihiKStjKX0sYS5ub3R5UmVuZGVyZXIuZ2V0TW9kYWxDb3VudD1mdW5jdGlvbigpe3JldHVybiBhKFwiLm5vdHlfbW9kYWxcIikuZGF0YShcIm5vdHlfbW9kYWxfY291bnRcIil8fDB9LGEubm90eVJlbmRlcmVyLnNldE1vZGFsQ291bnQ9ZnVuY3Rpb24oYil7cmV0dXJuIGEoXCIubm90eV9tb2RhbFwiKS5kYXRhKFwibm90eV9tb2RhbF9jb3VudFwiLGEubm90eVJlbmRlcmVyLmdldE1vZGFsQ291bnQoKStiKX0sYS5mbi5ub3R5PWZ1bmN0aW9uKGIpe3JldHVybiBiLmN1c3RvbT1hKHRoaXMpLGEubm90eVJlbmRlcmVyLmluaXQoYil9LGEubm90eT17fSxhLm5vdHkucXVldWU9W10sYS5ub3R5Lm9udGFwPSEwLGEubm90eS5sYXlvdXRzPXt9LGEubm90eS50aGVtZXM9e30sYS5ub3R5LnJldHVybnM9XCJvYmplY3RcIixhLm5vdHkuc3RvcmU9e30sYS5ub3R5LmdldD1mdW5jdGlvbihiKXtyZXR1cm4gYS5ub3R5LnN0b3JlLmhhc093blByb3BlcnR5KGIpP2Eubm90eS5zdG9yZVtiXTohMX0sYS5ub3R5LmNsb3NlPWZ1bmN0aW9uKGIpe3JldHVybiBhLm5vdHkuZ2V0KGIpP2Eubm90eS5nZXQoYikuY2xvc2UoKTohMX0sYS5ub3R5LnNldFRleHQ9ZnVuY3Rpb24oYixjKXtyZXR1cm4gYS5ub3R5LmdldChiKT9hLm5vdHkuZ2V0KGIpLnNldFRleHQoYyk6ITF9LGEubm90eS5zZXRUeXBlPWZ1bmN0aW9uKGIsYyl7cmV0dXJuIGEubm90eS5nZXQoYik/YS5ub3R5LmdldChiKS5zZXRUeXBlKGMpOiExfSxhLm5vdHkuY2xlYXJRdWV1ZT1mdW5jdGlvbigpe2Eubm90eS5xdWV1ZT1bXX0sYS5ub3R5LmNsb3NlQWxsPWZ1bmN0aW9uKCl7YS5ub3R5LmNsZWFyUXVldWUoKSxhLmVhY2goYS5ub3R5LnN0b3JlLGZ1bmN0aW9uKGEsYil7Yi5jbG9zZSgpfSl9O3ZhciBjPXdpbmRvdy5hbGVydDtyZXR1cm4gYS5ub3R5LmNvbnN1bWVBbGVydD1mdW5jdGlvbihiKXt3aW5kb3cuYWxlcnQ9ZnVuY3Rpb24oYyl7Yj9iLnRleHQ9YzpiPXt0ZXh0OmN9LGEubm90eVJlbmRlcmVyLmluaXQoYil9fSxhLm5vdHkuc3RvcENvbnN1bWVBbGVydD1mdW5jdGlvbigpe3dpbmRvdy5hbGVydD1jfSxhLm5vdHkuZGVmYXVsdHM9e2xheW91dDpcInRvcFwiLHRoZW1lOlwiZGVmYXVsdFRoZW1lXCIsdHlwZTpcImFsZXJ0XCIsdGV4dDpcIlwiLGRpc21pc3NRdWV1ZTohMCx0ZW1wbGF0ZTonPGRpdiBjbGFzcz1cIm5vdHlfbWVzc2FnZVwiPjxzcGFuIGNsYXNzPVwibm90eV90ZXh0XCI+PC9zcGFuPjxkaXYgY2xhc3M9XCJub3R5X2Nsb3NlXCI+PC9kaXY+PC9kaXY+JyxhbmltYXRpb246e29wZW46e2hlaWdodDpcInRvZ2dsZVwifSxjbG9zZTp7aGVpZ2h0OlwidG9nZ2xlXCJ9LGVhc2luZzpcInN3aW5nXCIsc3BlZWQ6NTAwLGZhZGVTcGVlZDpcImZhc3RcIn0sdGltZW91dDohMSxmb3JjZTohMSxtb2RhbDohMSxtYXhWaXNpYmxlOjUsa2lsbGVyOiExLGNsb3NlV2l0aDpbXCJjbGlja1wiXSxjYWxsYmFjazp7b25TaG93OmZ1bmN0aW9uKCl7fSxhZnRlclNob3c6ZnVuY3Rpb24oKXt9LG9uQ2xvc2U6ZnVuY3Rpb24oKXt9LGFmdGVyQ2xvc2U6ZnVuY3Rpb24oKXt9LG9uQ2xvc2VDbGljazpmdW5jdGlvbigpe319LGJ1dHRvbnM6ITF9LGEod2luZG93KS5vbihcInJlc2l6ZVwiLGZ1bmN0aW9uKCl7YS5lYWNoKGEubm90eS5sYXlvdXRzLGZ1bmN0aW9uKGIsYyl7Yy5jb250YWluZXIuc3R5bGUuYXBwbHkoYShjLmNvbnRhaW5lci5zZWxlY3RvcikpfSl9KSx3aW5kb3cubm90eT1mdW5jdGlvbihiKXtyZXR1cm4gYS5ub3R5UmVuZGVyZXIuaW5pdChiKX0sYS5ub3R5LmxheW91dHMuYm90dG9tPXtuYW1lOlwiYm90dG9tXCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9ib3R0b21fbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfYm90dG9tX2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtib3R0b206MCxsZWZ0OlwiNSVcIixwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCI5MCVcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4Ojk5OTk5OTl9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5ib3R0b21DZW50ZXI9e25hbWU6XCJib3R0b21DZW50ZXJcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2JvdHRvbUNlbnRlcl9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9ib3R0b21DZW50ZXJfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe2JvdHRvbToyMCxsZWZ0OjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLGEodGhpcykuY3NzKHtsZWZ0OihhKHdpbmRvdykud2lkdGgoKS1hKHRoaXMpLm91dGVyV2lkdGgoITEpKS8yK1wicHhcIn0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5ib3R0b21MZWZ0PXtuYW1lOlwiYm90dG9tTGVmdFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfYm90dG9tTGVmdF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9ib3R0b21MZWZ0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtib3R0b206MjAsbGVmdDoyMCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSksd2luZG93LmlubmVyV2lkdGg8NjAwJiZhKHRoaXMpLmNzcyh7bGVmdDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmJvdHRvbVJpZ2h0PXtuYW1lOlwiYm90dG9tUmlnaHRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2JvdHRvbVJpZ2h0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2JvdHRvbVJpZ2h0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtib3R0b206MjAscmlnaHQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLHdpbmRvdy5pbm5lcldpZHRoPDYwMCYmYSh0aGlzKS5jc3Moe3JpZ2h0OjV9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuY2VudGVyPXtuYW1lOlwiY2VudGVyXCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9jZW50ZXJfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfY2VudGVyX2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSk7dmFyIGI9YSh0aGlzKS5jbG9uZSgpLmNzcyh7dmlzaWJpbGl0eTpcImhpZGRlblwiLGRpc3BsYXk6XCJibG9ja1wiLHBvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6MCxsZWZ0OjB9KS5hdHRyKFwiaWRcIixcImR1cGVcIik7YShcImJvZHlcIikuYXBwZW5kKGIpLGIuZmluZChcIi5pLWFtLWNsb3Npbmctbm93XCIpLnJlbW92ZSgpLGIuZmluZChcImxpXCIpLmNzcyhcImRpc3BsYXlcIixcImJsb2NrXCIpO3ZhciBjPWIuaGVpZ2h0KCk7Yi5yZW1vdmUoKSxhKHRoaXMpLmhhc0NsYXNzKFwiaS1hbS1uZXdcIik/YSh0aGlzKS5jc3Moe2xlZnQ6KGEod2luZG93KS53aWR0aCgpLWEodGhpcykub3V0ZXJXaWR0aCghMSkpLzIrXCJweFwiLHRvcDooYSh3aW5kb3cpLmhlaWdodCgpLWMpLzIrXCJweFwifSk6YSh0aGlzKS5hbmltYXRlKHtsZWZ0OihhKHdpbmRvdykud2lkdGgoKS1hKHRoaXMpLm91dGVyV2lkdGgoITEpKS8yK1wicHhcIix0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0sNTAwKX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuY2VudGVyTGVmdD17bmFtZTpcImNlbnRlckxlZnRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2NlbnRlckxlZnRfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfY2VudGVyTGVmdF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7bGVmdDoyMCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSk7dmFyIGI9YSh0aGlzKS5jbG9uZSgpLmNzcyh7dmlzaWJpbGl0eTpcImhpZGRlblwiLGRpc3BsYXk6XCJibG9ja1wiLHBvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6MCxsZWZ0OjB9KS5hdHRyKFwiaWRcIixcImR1cGVcIik7YShcImJvZHlcIikuYXBwZW5kKGIpLGIuZmluZChcIi5pLWFtLWNsb3Npbmctbm93XCIpLnJlbW92ZSgpLGIuZmluZChcImxpXCIpLmNzcyhcImRpc3BsYXlcIixcImJsb2NrXCIpO3ZhciBjPWIuaGVpZ2h0KCk7Yi5yZW1vdmUoKSxhKHRoaXMpLmhhc0NsYXNzKFwiaS1hbS1uZXdcIik/YSh0aGlzKS5jc3Moe3RvcDooYSh3aW5kb3cpLmhlaWdodCgpLWMpLzIrXCJweFwifSk6YSh0aGlzKS5hbmltYXRlKHt0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0sNTAwKSx3aW5kb3cuaW5uZXJXaWR0aDw2MDAmJmEodGhpcykuY3NzKHtsZWZ0OjV9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuY2VudGVyUmlnaHQ9e25hbWU6XCJjZW50ZXJSaWdodFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfY2VudGVyUmlnaHRfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfY2VudGVyUmlnaHRfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3JpZ2h0OjIwLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KTt2YXIgYj1hKHRoaXMpLmNsb25lKCkuY3NzKHt2aXNpYmlsaXR5OlwiaGlkZGVuXCIsZGlzcGxheTpcImJsb2NrXCIscG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDowLGxlZnQ6MH0pLmF0dHIoXCJpZFwiLFwiZHVwZVwiKTthKFwiYm9keVwiKS5hcHBlbmQoYiksYi5maW5kKFwiLmktYW0tY2xvc2luZy1ub3dcIikucmVtb3ZlKCksYi5maW5kKFwibGlcIikuY3NzKFwiZGlzcGxheVwiLFwiYmxvY2tcIik7dmFyIGM9Yi5oZWlnaHQoKTtiLnJlbW92ZSgpLGEodGhpcykuaGFzQ2xhc3MoXCJpLWFtLW5ld1wiKT9hKHRoaXMpLmNzcyh7dG9wOihhKHdpbmRvdykuaGVpZ2h0KCktYykvMitcInB4XCJ9KTphKHRoaXMpLmFuaW1hdGUoe3RvcDooYSh3aW5kb3cpLmhlaWdodCgpLWMpLzIrXCJweFwifSw1MDApLHdpbmRvdy5pbm5lcldpZHRoPDYwMCYmYSh0aGlzKS5jc3Moe3JpZ2h0OjV9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuaW5saW5lPXtuYW1lOlwiaW5saW5lXCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGNsYXNzPVwibm90eV9pbmxpbmVfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsLm5vdHlfaW5saW5lX2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHt3aWR0aDpcIjEwMCVcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4Ojk5OTk5OTl9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy50b3A9e25hbWU6XCJ0b3BcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X3RvcF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV90b3BfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3RvcDowLGxlZnQ6XCI1JVwiLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjkwJVwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6OTk5OTk5OX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLnRvcENlbnRlcj17bmFtZTpcInRvcENlbnRlclwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfdG9wQ2VudGVyX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X3RvcENlbnRlcl9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7dG9wOjIwLGxlZnQ6MCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSksYSh0aGlzKS5jc3Moe2xlZnQ6KGEod2luZG93KS53aWR0aCgpLWEodGhpcykub3V0ZXJXaWR0aCghMSkpLzIrXCJweFwifSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLnRvcExlZnQ9e25hbWU6XCJ0b3BMZWZ0XCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV90b3BMZWZ0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X3RvcExlZnRfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3RvcDoyMCxsZWZ0OjIwLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KSx3aW5kb3cuaW5uZXJXaWR0aDw2MDAmJmEodGhpcykuY3NzKHtsZWZ0OjV9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMudG9wUmlnaHQ9e25hbWU6XCJ0b3BSaWdodFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfdG9wUmlnaHRfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfdG9wUmlnaHRfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3RvcDoyMCxyaWdodDoyMCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSksd2luZG93LmlubmVyV2lkdGg8NjAwJiZhKHRoaXMpLmNzcyh7cmlnaHQ6NX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkudGhlbWVzLmJvb3RzdHJhcFRoZW1lPXtuYW1lOlwiYm9vdHN0cmFwVGhlbWVcIixtb2RhbDp7Y3NzOntwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIxMDAlXCIsaGVpZ2h0OlwiMTAwJVwiLGJhY2tncm91bmRDb2xvcjpcIiMwMDBcIix6SW5kZXg6MWU0LG9wYWNpdHk6LjYsZGlzcGxheTpcIm5vbmVcIixsZWZ0OjAsdG9wOjB9fSxzdHlsZTpmdW5jdGlvbigpe3ZhciBiPXRoaXMub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yO3N3aXRjaChhKGIpLmFkZENsYXNzKFwibGlzdC1ncm91cFwiKSx0aGlzLiRjbG9zZUJ1dHRvbi5hcHBlbmQoJzxzcGFuIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPiZ0aW1lczs8L3NwYW4+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+Q2xvc2U8L3NwYW4+JyksdGhpcy4kY2xvc2VCdXR0b24uYWRkQ2xhc3MoXCJjbG9zZVwiKSx0aGlzLiRiYXIuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwLWl0ZW1cIikuY3NzKFwicGFkZGluZ1wiLFwiMHB4XCIpLHRoaXMub3B0aW9ucy50eXBlKXtjYXNlXCJhbGVydFwiOmNhc2VcIm5vdGlmaWNhdGlvblwiOnRoaXMuJGJhci5hZGRDbGFzcyhcImxpc3QtZ3JvdXAtaXRlbS1pbmZvXCIpO2JyZWFrO2Nhc2VcIndhcm5pbmdcIjp0aGlzLiRiYXIuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwLWl0ZW0td2FybmluZ1wiKTticmVhaztjYXNlXCJlcnJvclwiOnRoaXMuJGJhci5hZGRDbGFzcyhcImxpc3QtZ3JvdXAtaXRlbS1kYW5nZXJcIik7YnJlYWs7Y2FzZVwiaW5mb3JtYXRpb25cIjp0aGlzLiRiYXIuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwLWl0ZW0taW5mb1wiKTticmVhaztjYXNlXCJzdWNjZXNzXCI6dGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtLXN1Y2Nlc3NcIil9dGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTNweFwiLGxpbmVIZWlnaHQ6XCIxNnB4XCIsdGV4dEFsaWduOlwiY2VudGVyXCIscGFkZGluZzpcIjhweCAxMHB4IDlweFwiLHdpZHRoOlwiYXV0b1wiLHBvc2l0aW9uOlwicmVsYXRpdmVcIn0pfSxjYWxsYmFjazp7b25TaG93OmZ1bmN0aW9uKCl7fSxvbkNsb3NlOmZ1bmN0aW9uKCl7fX19LGEubm90eS50aGVtZXMuZGVmYXVsdFRoZW1lPXtuYW1lOlwiZGVmYXVsdFRoZW1lXCIsaGVscGVyczp7Ym9yZGVyRml4OmZ1bmN0aW9uKCl7aWYodGhpcy5vcHRpb25zLmRpc21pc3NRdWV1ZSl7dmFyIGI9dGhpcy5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IrXCIgXCIrdGhpcy5vcHRpb25zLmxheW91dC5wYXJlbnQuc2VsZWN0b3I7c3dpdGNoKHRoaXMub3B0aW9ucy5sYXlvdXQubmFtZSl7Y2FzZVwidG9wXCI6YShiKS5jc3Moe2JvcmRlclJhZGl1czpcIjBweCAwcHggMHB4IDBweFwifSksYShiKS5sYXN0KCkuY3NzKHtib3JkZXJSYWRpdXM6XCIwcHggMHB4IDVweCA1cHhcIn0pO2JyZWFrO2Nhc2VcInRvcENlbnRlclwiOmNhc2VcInRvcExlZnRcIjpjYXNlXCJ0b3BSaWdodFwiOmNhc2VcImJvdHRvbUNlbnRlclwiOmNhc2VcImJvdHRvbUxlZnRcIjpjYXNlXCJib3R0b21SaWdodFwiOmNhc2VcImNlbnRlclwiOmNhc2VcImNlbnRlckxlZnRcIjpjYXNlXCJjZW50ZXJSaWdodFwiOmNhc2VcImlubGluZVwiOmEoYikuY3NzKHtib3JkZXJSYWRpdXM6XCIwcHggMHB4IDBweCAwcHhcIn0pLGEoYikuZmlyc3QoKS5jc3Moe1wiYm9yZGVyLXRvcC1sZWZ0LXJhZGl1c1wiOlwiNXB4XCIsXCJib3JkZXItdG9wLXJpZ2h0LXJhZGl1c1wiOlwiNXB4XCJ9KSxhKGIpLmxhc3QoKS5jc3Moe1wiYm9yZGVyLWJvdHRvbS1sZWZ0LXJhZGl1c1wiOlwiNXB4XCIsXCJib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1c1wiOlwiNXB4XCJ9KTticmVhaztjYXNlXCJib3R0b21cIjphKGIpLmNzcyh7Ym9yZGVyUmFkaXVzOlwiMHB4IDBweCAwcHggMHB4XCJ9KSxhKGIpLmZpcnN0KCkuY3NzKHtib3JkZXJSYWRpdXM6XCI1cHggNXB4IDBweCAwcHhcIn0pfX19fSxtb2RhbDp7Y3NzOntwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIxMDAlXCIsaGVpZ2h0OlwiMTAwJVwiLGJhY2tncm91bmRDb2xvcjpcIiMwMDBcIix6SW5kZXg6MWU0LG9wYWNpdHk6LjYsZGlzcGxheTpcIm5vbmVcIixsZWZ0OjAsdG9wOjB9fSxzdHlsZTpmdW5jdGlvbigpe3N3aXRjaCh0aGlzLiRiYXIuY3NzKHtvdmVyZmxvdzpcImhpZGRlblwiLGJhY2tncm91bmQ6XCJ1cmwoJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQnNBQUFBb0NBUUFBQUNsTTBuZEFBQUFoa2xFUVZSNEFkWE8wUXJDTUJCRTBidHRrazM4L3c4V1JFUnBkeWp6Vk9jK0h4aElIcUpHTVFjRkZrcFlSUW90TExTdzBJSjVhQmRvdnJ1TVlEQS9rVDhwbEY5WktMRlFjZ0YxOGhEajFTYlFPTWxDQTRrYW8waWlYbWFoN3FCV1BkeHBvaHNnVlp5ajdlNUk5S2NJRCtFaGlESTVneEJZS0xCUVlLSEFRb0dGQW9Fa3MvWUVHSFlLQjdoRnhmMEFBQUFBU1VWT1JLNUNZSUk9JykgcmVwZWF0LXggc2Nyb2xsIGxlZnQgdG9wICNmZmZcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjEzcHhcIixsaW5lSGVpZ2h0OlwiMTZweFwiLHRleHRBbGlnbjpcImNlbnRlclwiLHBhZGRpbmc6XCI4cHggMTBweCA5cHhcIix3aWR0aDpcImF1dG9cIixwb3NpdGlvbjpcInJlbGF0aXZlXCJ9KSx0aGlzLiRjbG9zZUJ1dHRvbi5jc3Moe3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6NCxyaWdodDo0LHdpZHRoOjEwLGhlaWdodDoxMCxiYWNrZ3JvdW5kOlwidXJsKGRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQW9BQUFBS0NBUUFBQUFuT3djMkFBQUF4VWxFUVZSNEFSM01QVW9EVVJTQTBlKyt1U2trT3hDM0lBT1dOdGFDSURhQ2hmZ1hCTUVaYlFSQnl4Q3drK0Jhc2dRUlpMU1lvTGdEUWJBUnhyeThueXVtUGNWUktEZmQwQWE4QXNnRHYxenA2cFlkNWpXT3dodmViUlRiek5ORXc1QlNzSXBzai9rdXJRQm5tazdzSUZjQ0Y1eXlaUERSRzZ0clFodWpYWW9zYUZvYysyZjFNSjg5dWM3NklORDZGOUJ2bFhVZHBiNnh3RDIrNHEzbWUzYnlzaUh2dExZclVKdG83UEQvdmU3TE5IeFNnL3dvTjJrU3o0dHhhc0JkaHlpejN1Z1BHZXRUam0zWFJva0FBQUFBU1VWT1JLNUNZSUk9KVwiLGRpc3BsYXk6XCJub25lXCIsY3Vyc29yOlwicG9pbnRlclwifSksdGhpcy4kYnV0dG9ucy5jc3Moe3BhZGRpbmc6NSx0ZXh0QWxpZ246XCJyaWdodFwiLGJvcmRlclRvcDpcIjFweCBzb2xpZCAjY2NjXCIsYmFja2dyb3VuZENvbG9yOlwiI2ZmZlwifSksdGhpcy4kYnV0dG9ucy5maW5kKFwiYnV0dG9uXCIpLmNzcyh7bWFyZ2luTGVmdDo1fSksdGhpcy4kYnV0dG9ucy5maW5kKFwiYnV0dG9uOmZpcnN0XCIpLmNzcyh7bWFyZ2luTGVmdDowfSksdGhpcy4kYmFyLm9uKHttb3VzZWVudGVyOmZ1bmN0aW9uKCl7YSh0aGlzKS5maW5kKFwiLm5vdHlfY2xvc2VcIikuc3RvcCgpLmZhZGVUbyhcIm5vcm1hbFwiLDEpfSxtb3VzZWxlYXZlOmZ1bmN0aW9uKCl7YSh0aGlzKS5maW5kKFwiLm5vdHlfY2xvc2VcIikuc3RvcCgpLmZhZGVUbyhcIm5vcm1hbFwiLDApfX0pLHRoaXMub3B0aW9ucy5sYXlvdXQubmFtZSl7Y2FzZVwidG9wXCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyUmFkaXVzOlwiMHB4IDBweCA1cHggNXB4XCIsYm9yZGVyQm90dG9tOlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJMZWZ0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJSaWdodDpcIjJweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSk7YnJlYWs7Y2FzZVwidG9wQ2VudGVyXCI6Y2FzZVwiY2VudGVyXCI6Y2FzZVwiYm90dG9tQ2VudGVyXCI6Y2FzZVwiaW5saW5lXCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyUmFkaXVzOlwiNXB4XCIsYm9yZGVyOlwiMXB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsdGV4dEFsaWduOlwiY2VudGVyXCJ9KTticmVhaztjYXNlXCJ0b3BMZWZ0XCI6Y2FzZVwidG9wUmlnaHRcIjpjYXNlXCJib3R0b21MZWZ0XCI6Y2FzZVwiYm90dG9tUmlnaHRcIjpjYXNlXCJjZW50ZXJMZWZ0XCI6Y2FzZVwiY2VudGVyUmlnaHRcIjp0aGlzLiRiYXIuY3NzKHtib3JkZXJSYWRpdXM6XCI1cHhcIixib3JkZXI6XCIxcHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjEzcHhcIix0ZXh0QWxpZ246XCJsZWZ0XCJ9KTticmVhaztjYXNlXCJib3R0b21cIjp0aGlzLiRiYXIuY3NzKHtib3JkZXJSYWRpdXM6XCI1cHggNXB4IDBweCAwcHhcIixib3JkZXJUb3A6XCIycHggc29saWQgI2VlZVwiLGJvcmRlckxlZnQ6XCIycHggc29saWQgI2VlZVwiLGJvcmRlclJpZ2h0OlwiMnB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIC0ycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSk7YnJlYWs7ZGVmYXVsdDp0aGlzLiRiYXIuY3NzKHtib3JkZXI6XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pfXN3aXRjaCh0aGlzLm9wdGlvbnMudHlwZSl7Y2FzZVwiYWxlcnRcIjpjYXNlXCJub3RpZmljYXRpb25cIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkZGXCIsYm9yZGVyQ29sb3I6XCIjQ0NDXCIsY29sb3I6XCIjNDQ0XCJ9KTticmVhaztjYXNlXCJ3YXJuaW5nXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGRUFBOFwiLGJvcmRlckNvbG9yOlwiI0ZGQzIzN1wiLGNvbG9yOlwiIzgyNjIwMFwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjRkZDMjM3XCJ9KTticmVhaztjYXNlXCJlcnJvclwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcInJlZFwiLGJvcmRlckNvbG9yOlwiZGFya3JlZFwiLGNvbG9yOlwiI0ZGRlwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRXZWlnaHQ6XCJib2xkXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkIGRhcmtyZWRcIn0pO2JyZWFrO2Nhc2VcImluZm9ybWF0aW9uXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiIzU3QjdFMlwiLGJvcmRlckNvbG9yOlwiIzBCOTBDNFwiLGNvbG9yOlwiI0ZGRlwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjMEI5MEM0XCJ9KTticmVhaztjYXNlXCJzdWNjZXNzXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwibGlnaHRncmVlblwiLGJvcmRlckNvbG9yOlwiIzUwQzI0RVwiLGNvbG9yOlwiZGFya2dyZWVuXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkICM1MEMyNEVcIn0pO2JyZWFrO2RlZmF1bHQ6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGRlwiLGJvcmRlckNvbG9yOlwiI0NDQ1wiLGNvbG9yOlwiIzQ0NFwifSl9fSxjYWxsYmFjazp7b25TaG93OmZ1bmN0aW9uKCl7YS5ub3R5LnRoZW1lcy5kZWZhdWx0VGhlbWUuaGVscGVycy5ib3JkZXJGaXguYXBwbHkodGhpcyl9LG9uQ2xvc2U6ZnVuY3Rpb24oKXthLm5vdHkudGhlbWVzLmRlZmF1bHRUaGVtZS5oZWxwZXJzLmJvcmRlckZpeC5hcHBseSh0aGlzKX19fSxhLm5vdHkudGhlbWVzLnJlbGF4PXtuYW1lOlwicmVsYXhcIixoZWxwZXJzOnt9LG1vZGFsOntjc3M6e3Bvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjEwMCVcIixoZWlnaHQ6XCIxMDAlXCIsYmFja2dyb3VuZENvbG9yOlwiIzAwMFwiLHpJbmRleDoxZTQsb3BhY2l0eTouNixkaXNwbGF5Olwibm9uZVwiLGxlZnQ6MCx0b3A6MH19LHN0eWxlOmZ1bmN0aW9uKCl7c3dpdGNoKHRoaXMuJGJhci5jc3Moe292ZXJmbG93OlwiaGlkZGVuXCIsbWFyZ2luOlwiNHB4IDBcIixib3JkZXJSYWRpdXM6XCIycHhcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjE0cHhcIixsaW5lSGVpZ2h0OlwiMTZweFwiLHRleHRBbGlnbjpcImNlbnRlclwiLHBhZGRpbmc6XCIxMHB4XCIsd2lkdGg6XCJhdXRvXCIscG9zaXRpb246XCJyZWxhdGl2ZVwifSksdGhpcy4kY2xvc2VCdXR0b24uY3NzKHtwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOjQscmlnaHQ6NCx3aWR0aDoxMCxoZWlnaHQ6MTAsYmFja2dyb3VuZDpcInVybChkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFvQUFBQUtDQVFBQUFBbk93YzJBQUFBeFVsRVFWUjRBUjNNUFVvRFVSU0EwZSsrdVNra094QzNJQU9XTnRhQ0lEYUNoZmdYQk1FWmJRUkJ5eEN3aytCYXNnUVJaTFNZb0xnRFFiQVJ4cnk4bnl1bVBjVlJLRGZkMEFhOEFzZ0R2MXpwNnBZZDVqV093aHZlYlJUYnpOTkV3NUJTc0lwc2ova3VyUUJubWs3c0lGY0NGNXl5WlBEUkc2dHJRaHVqWFlvc2FGb2MrMmYxTUo4OXVjNzZJTkQ2RjlCdmxYVWRwYjZ4d0QyKzRxM21lM2J5c2lIdnRMWXJVSnRvN1BEL3ZlN0xOSHhTZy93b04ya1N6NHR4YXNCZGh5aXozdWdQR2V0VGptM1hSb2tBQUFBQVNVVk9SSzVDWUlJPSlcIixkaXNwbGF5Olwibm9uZVwiLGN1cnNvcjpcInBvaW50ZXJcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtwYWRkaW5nOjUsdGV4dEFsaWduOlwicmlnaHRcIixib3JkZXJUb3A6XCIxcHggc29saWQgI2NjY1wiLGJhY2tncm91bmRDb2xvcjpcIiNmZmZcIn0pLHRoaXMuJGJ1dHRvbnMuZmluZChcImJ1dHRvblwiKS5jc3Moe21hcmdpbkxlZnQ6NX0pLHRoaXMuJGJ1dHRvbnMuZmluZChcImJ1dHRvbjpmaXJzdFwiKS5jc3Moe21hcmdpbkxlZnQ6MH0pLHRoaXMuJGJhci5vbih7bW91c2VlbnRlcjpmdW5jdGlvbigpe2EodGhpcykuZmluZChcIi5ub3R5X2Nsb3NlXCIpLnN0b3AoKS5mYWRlVG8oXCJub3JtYWxcIiwxKX0sbW91c2VsZWF2ZTpmdW5jdGlvbigpe2EodGhpcykuZmluZChcIi5ub3R5X2Nsb3NlXCIpLnN0b3AoKS5mYWRlVG8oXCJub3JtYWxcIiwwKX19KSx0aGlzLm9wdGlvbnMubGF5b3V0Lm5hbWUpe2Nhc2VcInRvcFwiOnRoaXMuJGJhci5jc3Moe2JvcmRlckJvdHRvbTpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyTGVmdDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyUmlnaHQ6XCIycHggc29saWQgI2VlZVwiLGJvcmRlclRvcDpcIjJweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSk7YnJlYWs7Y2FzZVwidG9wQ2VudGVyXCI6Y2FzZVwiY2VudGVyXCI6Y2FzZVwiYm90dG9tQ2VudGVyXCI6Y2FzZVwiaW5saW5lXCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyOlwiMXB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsdGV4dEFsaWduOlwiY2VudGVyXCJ9KTticmVhaztjYXNlXCJ0b3BMZWZ0XCI6Y2FzZVwidG9wUmlnaHRcIjpjYXNlXCJib3R0b21MZWZ0XCI6Y2FzZVwiYm90dG9tUmlnaHRcIjpjYXNlXCJjZW50ZXJMZWZ0XCI6Y2FzZVwiY2VudGVyUmlnaHRcIjp0aGlzLiRiYXIuY3NzKHtib3JkZXI6XCIxcHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjEzcHhcIix0ZXh0QWxpZ246XCJsZWZ0XCJ9KTticmVhaztjYXNlXCJib3R0b21cIjp0aGlzLiRiYXIuY3NzKHtib3JkZXJUb3A6XCIycHggc29saWQgI2VlZVwiLGJvcmRlckxlZnQ6XCIycHggc29saWQgI2VlZVwiLGJvcmRlclJpZ2h0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJCb3R0b206XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgLTJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KTticmVhaztkZWZhdWx0OnRoaXMuJGJhci5jc3Moe2JvcmRlcjpcIjJweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSl9c3dpdGNoKHRoaXMub3B0aW9ucy50eXBlKXtjYXNlXCJhbGVydFwiOmNhc2VcIm5vdGlmaWNhdGlvblwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkZcIixib3JkZXJDb2xvcjpcIiNkZWRlZGVcIixjb2xvcjpcIiM0NDRcIn0pO2JyZWFrO2Nhc2VcIndhcm5pbmdcIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkZFQUE4XCIsYm9yZGVyQ29sb3I6XCIjRkZDMjM3XCIsY29sb3I6XCIjODI2MjAwXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkICNGRkMyMzdcIn0pO2JyZWFrO2Nhc2VcImVycm9yXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGODE4MVwiLGJvcmRlckNvbG9yOlwiI2UyNTM1M1wiLGNvbG9yOlwiI0ZGRlwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRXZWlnaHQ6XCJib2xkXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkIGRhcmtyZWRcIn0pO2JyZWFrO2Nhc2VcImluZm9ybWF0aW9uXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiIzc4QzVFN1wiLGJvcmRlckNvbG9yOlwiIzNiYWRkNlwiLGNvbG9yOlwiI0ZGRlwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjMEI5MEM0XCJ9KTticmVhaztjYXNlXCJzdWNjZXNzXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0JDRjVCQ1wiLGJvcmRlckNvbG9yOlwiIzdjZGQ3N1wiLGNvbG9yOlwiZGFya2dyZWVuXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkICM1MEMyNEVcIn0pO2JyZWFrO2RlZmF1bHQ6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGRlwiLGJvcmRlckNvbG9yOlwiI0NDQ1wiLGNvbG9yOlwiIzQ0NFwifSl9fSxjYWxsYmFjazp7b25TaG93OmZ1bmN0aW9uKCl7fSxvbkNsb3NlOmZ1bmN0aW9uKCl7fX19LHdpbmRvdy5ub3R5fSk7IiwialF1ZXJ5KGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xuXHQvL2NhY2hlIERPTSBlbGVtZW50c1xuXHR2YXIgbWFpbkNvbnRlbnQgPSAkKCcuY2QtbWFpbi1jb250ZW50JyksXG5cdFx0aGVhZGVyID0gJCgnLmNkLW1haW4taGVhZGVyJyksXG5cdFx0c2lkZWJhciA9ICQoJy5jZC1zaWRlLW5hdicpLFxuXHRcdHNpZGViYXJUcmlnZ2VyID0gJCgnLmNkLW5hdi10cmlnZ2VyJyksXG5cdFx0dG9wTmF2aWdhdGlvbiA9ICQoJy5jZC10b3AtbmF2JyksXG5cdFx0c2VhcmNoRm9ybSA9ICQoJy5jZC1zZWFyY2gnKSxcblx0XHRhY2NvdW50SW5mbyA9ICQoJy5hY2NvdW50Jyk7XG5cblx0Ly9vbiByZXNpemUsIG1vdmUgc2VhcmNoIGFuZCB0b3AgbmF2IHBvc2l0aW9uIGFjY29yZGluZyB0byB3aW5kb3cgd2lkdGhcblx0dmFyIHJlc2l6aW5nID0gZmFsc2U7XG5cdG1vdmVOYXZpZ2F0aW9uKCk7XG5cdCQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24oKXtcblx0XHRpZiggIXJlc2l6aW5nICkge1xuXHRcdFx0KCF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKSA/IHNldFRpbWVvdXQobW92ZU5hdmlnYXRpb24sIDMwMCkgOiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1vdmVOYXZpZ2F0aW9uKTtcblx0XHRcdHJlc2l6aW5nID0gdHJ1ZTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vb24gd2luZG93IHNjcm9sbGluZyAtIGZpeCBzaWRlYmFyIG5hdlxuXHR2YXIgc2Nyb2xsaW5nID0gZmFsc2U7XG5cdGNoZWNrU2Nyb2xsYmFyUG9zaXRpb24oKTtcblx0JCh3aW5kb3cpLm9uKCdzY3JvbGwnLCBmdW5jdGlvbigpe1xuXHRcdGlmKCAhc2Nyb2xsaW5nICkge1xuXHRcdFx0KCF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKSA/IHNldFRpbWVvdXQoY2hlY2tTY3JvbGxiYXJQb3NpdGlvbiwgMzAwKSA6IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2hlY2tTY3JvbGxiYXJQb3NpdGlvbik7XG5cdFx0XHRzY3JvbGxpbmcgPSB0cnVlO1xuXHRcdH1cblx0fSk7XG5cblx0Ly9tb2JpbGUgb25seSAtIG9wZW4gc2lkZWJhciB3aGVuIHVzZXIgY2xpY2tzIHRoZSBoYW1idXJnZXIgbWVudVxuXHRzaWRlYmFyVHJpZ2dlci5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCl7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHQkKFtzaWRlYmFyLCBzaWRlYmFyVHJpZ2dlcl0pLnRvZ2dsZUNsYXNzKCduYXYtaXMtdmlzaWJsZScpO1xuXHR9KTtcblxuXHQvL2NsaWNrIG9uIGl0ZW0gYW5kIHNob3cgc3VibWVudVxuXHQkKCcuaGFzLWNoaWxkcmVuID4gYScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KXtcblx0XHR2YXIgbXEgPSBjaGVja01RKCksXG5cdFx0XHRzZWxlY3RlZEl0ZW0gPSAkKHRoaXMpO1xuXHRcdGlmKCBtcSA9PSAnbW9iaWxlJyB8fCBtcSA9PSAndGFibGV0JyApIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRpZiggc2VsZWN0ZWRJdGVtLnBhcmVudCgnbGknKS5oYXNDbGFzcygnc2VsZWN0ZWQnKSkge1xuXHRcdFx0XHRzZWxlY3RlZEl0ZW0ucGFyZW50KCdsaScpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2lkZWJhci5maW5kKCcuaGFzLWNoaWxkcmVuLnNlbGVjdGVkJykucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XG5cdFx0XHRcdGFjY291bnRJbmZvLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuXHRcdFx0XHRzZWxlY3RlZEl0ZW0ucGFyZW50KCdsaScpLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cblx0Ly9jbGljayBvbiBhY2NvdW50IGFuZCBzaG93IHN1Ym1lbnUgLSBkZXNrdG9wIHZlcnNpb24gb25seVxuXHRhY2NvdW50SW5mby5jaGlsZHJlbignYScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KXtcblx0XHR2YXIgbXEgPSBjaGVja01RKCksXG5cdFx0XHRzZWxlY3RlZEl0ZW0gPSAkKHRoaXMpO1xuXHRcdGlmKCBtcSA9PSAnZGVza3RvcCcpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRhY2NvdW50SW5mby50b2dnbGVDbGFzcygnc2VsZWN0ZWQnKTtcblx0XHRcdHNpZGViYXIuZmluZCgnLmhhcy1jaGlsZHJlbi5zZWxlY3RlZCcpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuXHRcdH1cblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpe1xuXHRcdGlmKCAhJChldmVudC50YXJnZXQpLmlzKCcuaGFzLWNoaWxkcmVuIGEnKSApIHtcblx0XHRcdHNpZGViYXIuZmluZCgnLmhhcy1jaGlsZHJlbi5zZWxlY3RlZCcpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuXHRcdFx0YWNjb3VudEluZm8ucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XG5cdFx0fVxuXHR9KTtcblxuXHQvL29uIGRlc2t0b3AgLSBkaWZmZXJlbnRpYXRlIGJldHdlZW4gYSB1c2VyIHRyeWluZyB0byBob3ZlciBvdmVyIGEgZHJvcGRvd24gaXRlbSB2cyB0cnlpbmcgdG8gbmF2aWdhdGUgaW50byBhIHN1Ym1lbnUncyBjb250ZW50c1xuXHRzaWRlYmFyLmNoaWxkcmVuKCd1bCcpLm1lbnVBaW0oe1xuICAgICAgICBhY3RpdmF0ZTogZnVuY3Rpb24ocm93KSB7XG4gICAgICAgIFx0JChyb3cpLmFkZENsYXNzKCdob3ZlcicpO1xuICAgICAgICB9LFxuICAgICAgICBkZWFjdGl2YXRlOiBmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgXHQkKHJvdykucmVtb3ZlQ2xhc3MoJ2hvdmVyJyk7XG4gICAgICAgIH0sXG4gICAgICAgIGV4aXRNZW51OiBmdW5jdGlvbigpIHtcbiAgICAgICAgXHRzaWRlYmFyLmZpbmQoJy5ob3ZlcicpLnJlbW92ZUNsYXNzKCdob3ZlcicpO1xuICAgICAgICBcdHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuICAgICAgICBzdWJtZW51U2VsZWN0b3I6IFwiLmhhcy1jaGlsZHJlblwiLFxuICAgIH0pO1xuXG5cdGZ1bmN0aW9uIGNoZWNrTVEoKSB7XG5cdFx0Ly9jaGVjayBpZiBtb2JpbGUgb3IgZGVza3RvcCBkZXZpY2Vcblx0XHRyZXR1cm4gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNkLW1haW4tY29udGVudCcpLCAnOjpiZWZvcmUnKS5nZXRQcm9wZXJ0eVZhbHVlKCdjb250ZW50JykucmVwbGFjZSgvJy9nLCBcIlwiKS5yZXBsYWNlKC9cIi9nLCBcIlwiKTtcblx0fVxuXG5cdGZ1bmN0aW9uIG1vdmVOYXZpZ2F0aW9uKCl7XG4gIFx0XHR2YXIgbXEgPSBjaGVja01RKCk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIG1xID09ICdtb2JpbGUnICYmIHRvcE5hdmlnYXRpb24ucGFyZW50cygnLmNkLXNpZGUtbmF2JykubGVuZ3RoID09IDAgKSB7XG4gICAgICAgIFx0ZGV0YWNoRWxlbWVudHMoKTtcblx0XHRcdHRvcE5hdmlnYXRpb24uYXBwZW5kVG8oc2lkZWJhcik7XG5cdFx0XHRzZWFyY2hGb3JtLnJlbW92ZUNsYXNzKCdpcy1oaWRkZW4nKS5wcmVwZW5kVG8oc2lkZWJhcik7XG5cdFx0fSBlbHNlIGlmICggKCBtcSA9PSAndGFibGV0JyB8fCBtcSA9PSAnZGVza3RvcCcpICYmICB0b3BOYXZpZ2F0aW9uLnBhcmVudHMoJy5jZC1zaWRlLW5hdicpLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHRkZXRhY2hFbGVtZW50cygpO1xuXHRcdFx0c2VhcmNoRm9ybS5pbnNlcnRBZnRlcihoZWFkZXIuZmluZCgnLmNkLWxvZ28nKSk7XG5cdFx0XHR0b3BOYXZpZ2F0aW9uLmFwcGVuZFRvKGhlYWRlci5maW5kKCcuY2QtbmF2JykpO1xuXHRcdH1cblx0XHRjaGVja1NlbGVjdGVkKG1xKTtcblx0XHRyZXNpemluZyA9IGZhbHNlO1xuXHR9XG5cblx0ZnVuY3Rpb24gZGV0YWNoRWxlbWVudHMoKSB7XG5cdFx0dG9wTmF2aWdhdGlvbi5kZXRhY2goKTtcblx0XHRzZWFyY2hGb3JtLmRldGFjaCgpO1xuXHR9XG5cblx0ZnVuY3Rpb24gY2hlY2tTZWxlY3RlZChtcSkge1xuXHRcdC8vb24gZGVza3RvcCwgcmVtb3ZlIHNlbGVjdGVkIGNsYXNzIGZyb20gaXRlbXMgc2VsZWN0ZWQgb24gbW9iaWxlL3RhYmxldCB2ZXJzaW9uXG5cdFx0aWYoIG1xID09ICdkZXNrdG9wJyApICQoJy5oYXMtY2hpbGRyZW4uc2VsZWN0ZWQnKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGNoZWNrU2Nyb2xsYmFyUG9zaXRpb24oKSB7XG5cdFx0dmFyIG1xID0gY2hlY2tNUSgpO1xuXHRcdFxuXHRcdGlmKCBtcSAhPSAnbW9iaWxlJyApIHtcblx0XHRcdHZhciBzaWRlYmFySGVpZ2h0ID0gc2lkZWJhci5vdXRlckhlaWdodCgpLFxuXHRcdFx0XHR3aW5kb3dIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCksXG5cdFx0XHRcdG1haW5Db250ZW50SGVpZ2h0ID0gbWFpbkNvbnRlbnQub3V0ZXJIZWlnaHQoKSxcblx0XHRcdFx0c2Nyb2xsVG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xuXG5cdFx0XHQoICggc2Nyb2xsVG9wICsgd2luZG93SGVpZ2h0ID4gc2lkZWJhckhlaWdodCApICYmICggbWFpbkNvbnRlbnRIZWlnaHQgLSBzaWRlYmFySGVpZ2h0ICE9IDAgKSApID8gc2lkZWJhci5hZGRDbGFzcygnaXMtZml4ZWQnKS5jc3MoJ2JvdHRvbScsIDApIDogc2lkZWJhci5yZW1vdmVDbGFzcygnaXMtZml4ZWQnKS5hdHRyKCdzdHlsZScsICcnKTtcblx0XHR9XG5cdFx0c2Nyb2xsaW5nID0gZmFsc2U7XG5cdH1cbn0pOyIsIi8qIVxuICogTW9ja0pheCAtIGpRdWVyeSBQbHVnaW4gdG8gTW9jayBBamF4IHJlcXVlc3RzXG4gKlxuICogVmVyc2lvbjogIDEuNS4zXG4gKiBSZWxlYXNlZDpcbiAqIEhvbWU6ICAgaHR0cDovL2dpdGh1Yi5jb20vYXBwZW5kdG8vanF1ZXJ5LW1vY2tqYXhcbiAqIEF1dGhvcjogICBKb25hdGhhbiBTaGFycCAoaHR0cDovL2pkc2hhcnAuY29tKVxuICogTGljZW5zZTogIE1JVCxHUExcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEgYXBwZW5kVG8gTExDLlxuICogRHVhbCBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIG9yIEdQTCBsaWNlbnNlcy5cbiAqIGh0dHA6Ly9hcHBlbmR0by5jb20vb3Blbi1zb3VyY2UtbGljZW5zZXNcbiAqL1xuKGZ1bmN0aW9uKCQpIHtcblx0dmFyIF9hamF4ID0gJC5hamF4LFxuXHRcdG1vY2tIYW5kbGVycyA9IFtdLFxuXHRcdG1vY2tlZEFqYXhDYWxscyA9IFtdLFxuXHRcdENBTExCQUNLX1JFR0VYID0gLz1cXD8oJnwkKS8sXG5cdFx0anNjID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcblxuXG5cdC8vIFBhcnNlIHRoZSBnaXZlbiBYTUwgc3RyaW5nLlxuXHRmdW5jdGlvbiBwYXJzZVhNTCh4bWwpIHtcblx0XHRpZiAoIHdpbmRvdy5ET01QYXJzZXIgPT0gdW5kZWZpbmVkICYmIHdpbmRvdy5BY3RpdmVYT2JqZWN0ICkge1xuXHRcdFx0RE9NUGFyc2VyID0gZnVuY3Rpb24oKSB7IH07XG5cdFx0XHRET01QYXJzZXIucHJvdG90eXBlLnBhcnNlRnJvbVN0cmluZyA9IGZ1bmN0aW9uKCB4bWxTdHJpbmcgKSB7XG5cdFx0XHRcdHZhciBkb2MgPSBuZXcgQWN0aXZlWE9iamVjdCgnTWljcm9zb2Z0LlhNTERPTScpO1xuXHRcdFx0XHRkb2MuYXN5bmMgPSAnZmFsc2UnO1xuXHRcdFx0XHRkb2MubG9hZFhNTCggeG1sU3RyaW5nICk7XG5cdFx0XHRcdHJldHVybiBkb2M7XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdHRyeSB7XG5cdFx0XHR2YXIgeG1sRG9jID0gKCBuZXcgRE9NUGFyc2VyKCkgKS5wYXJzZUZyb21TdHJpbmcoIHhtbCwgJ3RleHQveG1sJyApO1xuXHRcdFx0aWYgKCAkLmlzWE1MRG9jKCB4bWxEb2MgKSApIHtcblx0XHRcdFx0dmFyIGVyciA9ICQoJ3BhcnNlcmVycm9yJywgeG1sRG9jKTtcblx0XHRcdFx0aWYgKCBlcnIubGVuZ3RoID09IDEgKSB7XG5cdFx0XHRcdFx0dGhyb3coJ0Vycm9yOiAnICsgJCh4bWxEb2MpLnRleHQoKSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdygnVW5hYmxlIHRvIHBhcnNlIFhNTCcpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHhtbERvYztcblx0XHR9IGNhdGNoKCBlICkge1xuXHRcdFx0dmFyIG1zZyA9ICggZS5uYW1lID09IHVuZGVmaW5lZCA/IGUgOiBlLm5hbWUgKyAnOiAnICsgZS5tZXNzYWdlICk7XG5cdFx0XHQkKGRvY3VtZW50KS50cmlnZ2VyKCd4bWxQYXJzZUVycm9yJywgWyBtc2cgXSk7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0fVxuXG5cdC8vIFRyaWdnZXIgYSBqUXVlcnkgZXZlbnRcblx0ZnVuY3Rpb24gdHJpZ2dlcihzLCB0eXBlLCBhcmdzKSB7XG5cdFx0KHMuY29udGV4dCA/ICQocy5jb250ZXh0KSA6ICQuZXZlbnQpLnRyaWdnZXIodHlwZSwgYXJncyk7XG5cdH1cblxuXHQvLyBDaGVjayBpZiB0aGUgZGF0YSBmaWVsZCBvbiB0aGUgbW9jayBoYW5kbGVyIGFuZCB0aGUgcmVxdWVzdCBtYXRjaC4gVGhpc1xuXHQvLyBjYW4gYmUgdXNlZCB0byByZXN0cmljdCBhIG1vY2sgaGFuZGxlciB0byBiZWluZyB1c2VkIG9ubHkgd2hlbiBhIGNlcnRhaW5cblx0Ly8gc2V0IG9mIGRhdGEgaXMgcGFzc2VkIHRvIGl0LlxuXHRmdW5jdGlvbiBpc01vY2tEYXRhRXF1YWwoIG1vY2ssIGxpdmUgKSB7XG5cdFx0dmFyIGlkZW50aWNhbCA9IHRydWU7XG5cdFx0Ly8gVGVzdCBmb3Igc2l0dWF0aW9ucyB3aGVyZSB0aGUgZGF0YSBpcyBhIHF1ZXJ5c3RyaW5nIChub3QgYW4gb2JqZWN0KVxuXHRcdGlmICh0eXBlb2YgbGl2ZSA9PT0gJ3N0cmluZycpIHtcblx0XHRcdC8vIFF1ZXJ5c3RyaW5nIG1heSBiZSBhIHJlZ2V4XG5cdFx0XHRyZXR1cm4gJC5pc0Z1bmN0aW9uKCBtb2NrLnRlc3QgKSA/IG1vY2sudGVzdChsaXZlKSA6IG1vY2sgPT0gbGl2ZTtcblx0XHR9XG5cdFx0JC5lYWNoKG1vY2ssIGZ1bmN0aW9uKGspIHtcblx0XHRcdGlmICggbGl2ZVtrXSA9PT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHRpZGVudGljYWwgPSBmYWxzZTtcblx0XHRcdFx0cmV0dXJuIGlkZW50aWNhbDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmICggdHlwZW9mIGxpdmVba10gPT09ICdvYmplY3QnICYmIGxpdmVba10gIT09IG51bGwgKSB7XG5cdFx0XHRcdFx0aWYgKCBpZGVudGljYWwgJiYgJC5pc0FycmF5KCBsaXZlW2tdICkgKSB7XG5cdFx0XHRcdFx0XHRpZGVudGljYWwgPSAkLmlzQXJyYXkoIG1vY2tba10gKSAmJiBsaXZlW2tdLmxlbmd0aCA9PT0gbW9ja1trXS5sZW5ndGg7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlkZW50aWNhbCA9IGlkZW50aWNhbCAmJiBpc01vY2tEYXRhRXF1YWwobW9ja1trXSwgbGl2ZVtrXSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aWYgKCBtb2NrW2tdICYmICQuaXNGdW5jdGlvbiggbW9ja1trXS50ZXN0ICkgKSB7XG5cdFx0XHRcdFx0XHRpZGVudGljYWwgPSBpZGVudGljYWwgJiYgbW9ja1trXS50ZXN0KGxpdmVba10pO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRpZGVudGljYWwgPSBpZGVudGljYWwgJiYgKCBtb2NrW2tdID09IGxpdmVba10gKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiBpZGVudGljYWw7XG5cdH1cblxuICAgIC8vIFNlZSBpZiBhIG1vY2sgaGFuZGxlciBwcm9wZXJ0eSBtYXRjaGVzIHRoZSBkZWZhdWx0IHNldHRpbmdzXG4gICAgZnVuY3Rpb24gaXNEZWZhdWx0U2V0dGluZyhoYW5kbGVyLCBwcm9wZXJ0eSkge1xuICAgICAgICByZXR1cm4gaGFuZGxlcltwcm9wZXJ0eV0gPT09ICQubW9ja2pheFNldHRpbmdzW3Byb3BlcnR5XTtcbiAgICB9XG5cblx0Ly8gQ2hlY2sgdGhlIGdpdmVuIGhhbmRsZXIgc2hvdWxkIG1vY2sgdGhlIGdpdmVuIHJlcXVlc3Rcblx0ZnVuY3Rpb24gZ2V0TW9ja0ZvclJlcXVlc3QoIGhhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncyApIHtcblx0XHQvLyBJZiB0aGUgbW9jayB3YXMgcmVnaXN0ZXJlZCB3aXRoIGEgZnVuY3Rpb24sIGxldCB0aGUgZnVuY3Rpb24gZGVjaWRlIGlmIHdlXG5cdFx0Ly8gd2FudCB0byBtb2NrIHRoaXMgcmVxdWVzdFxuXHRcdGlmICggJC5pc0Z1bmN0aW9uKGhhbmRsZXIpICkge1xuXHRcdFx0cmV0dXJuIGhhbmRsZXIoIHJlcXVlc3RTZXR0aW5ncyApO1xuXHRcdH1cblxuXHRcdC8vIEluc3BlY3QgdGhlIFVSTCBvZiB0aGUgcmVxdWVzdCBhbmQgY2hlY2sgaWYgdGhlIG1vY2sgaGFuZGxlcidzIHVybFxuXHRcdC8vIG1hdGNoZXMgdGhlIHVybCBmb3IgdGhpcyBhamF4IHJlcXVlc3Rcblx0XHRpZiAoICQuaXNGdW5jdGlvbihoYW5kbGVyLnVybC50ZXN0KSApIHtcblx0XHRcdC8vIFRoZSB1c2VyIHByb3ZpZGVkIGEgcmVnZXggZm9yIHRoZSB1cmwsIHRlc3QgaXRcblx0XHRcdGlmICggIWhhbmRsZXIudXJsLnRlc3QoIHJlcXVlc3RTZXR0aW5ncy51cmwgKSApIHtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIExvb2sgZm9yIGEgc2ltcGxlIHdpbGRjYXJkICcqJyBvciBhIGRpcmVjdCBVUkwgbWF0Y2hcblx0XHRcdHZhciBzdGFyID0gaGFuZGxlci51cmwuaW5kZXhPZignKicpO1xuXHRcdFx0aWYgKGhhbmRsZXIudXJsICE9PSByZXF1ZXN0U2V0dGluZ3MudXJsICYmIHN0YXIgPT09IC0xIHx8XG5cdFx0XHRcdFx0IW5ldyBSZWdFeHAoaGFuZGxlci51cmwucmVwbGFjZSgvWy1bXFxde30oKSs/LixcXFxcXiR8I1xcc10vZywgXCJcXFxcJCZcIikucmVwbGFjZSgvXFwqL2csICcuKycpKS50ZXN0KHJlcXVlc3RTZXR0aW5ncy51cmwpKSB7XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIEluc3BlY3QgdGhlIGRhdGEgc3VibWl0dGVkIGluIHRoZSByZXF1ZXN0IChlaXRoZXIgUE9TVCBib2R5IG9yIEdFVCBxdWVyeSBzdHJpbmcpXG5cdFx0aWYgKCBoYW5kbGVyLmRhdGEgKSB7XG5cdFx0XHRpZiAoICEgcmVxdWVzdFNldHRpbmdzLmRhdGEgfHwgIWlzTW9ja0RhdGFFcXVhbChoYW5kbGVyLmRhdGEsIHJlcXVlc3RTZXR0aW5ncy5kYXRhKSApIHtcblx0XHRcdFx0Ly8gVGhleSdyZSBub3QgaWRlbnRpY2FsLCBkbyBub3QgbW9jayB0aGlzIHJlcXVlc3Rcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIEluc3BlY3QgdGhlIHJlcXVlc3QgdHlwZVxuXHRcdGlmICggaGFuZGxlciAmJiBoYW5kbGVyLnR5cGUgJiZcblx0XHRcdFx0aGFuZGxlci50eXBlLnRvTG93ZXJDYXNlKCkgIT0gcmVxdWVzdFNldHRpbmdzLnR5cGUudG9Mb3dlckNhc2UoKSApIHtcblx0XHRcdC8vIFRoZSByZXF1ZXN0IHR5cGUgZG9lc24ndCBtYXRjaCAoR0VUIHZzLiBQT1NUKVxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGhhbmRsZXI7XG5cdH1cblxuXHQvLyBQcm9jZXNzIHRoZSB4aHIgb2JqZWN0cyBzZW5kIG9wZXJhdGlvblxuXHRmdW5jdGlvbiBfeGhyU2VuZChtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MpIHtcblxuXHRcdC8vIFRoaXMgaXMgYSBzdWJzdGl0dXRlIGZvciA8IDEuNCB3aGljaCBsYWNrcyAkLnByb3h5XG5cdFx0dmFyIHByb2Nlc3MgPSAoZnVuY3Rpb24odGhhdCkge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHZhciBvblJlYWR5O1xuXG5cdFx0XHRcdFx0Ly8gVGhlIHJlcXVlc3QgaGFzIHJldHVybmVkXG5cdFx0XHRcdFx0dGhpcy5zdGF0dXMgICAgID0gbW9ja0hhbmRsZXIuc3RhdHVzO1xuXHRcdFx0XHRcdHRoaXMuc3RhdHVzVGV4dCA9IG1vY2tIYW5kbGVyLnN0YXR1c1RleHQ7XG5cdFx0XHRcdFx0dGhpcy5yZWFkeVN0YXRlXHQ9IDQ7XG5cblx0XHRcdFx0XHQvLyBXZSBoYXZlIGFuIGV4ZWN1dGFibGUgZnVuY3Rpb24sIGNhbGwgaXQgdG8gZ2l2ZVxuXHRcdFx0XHRcdC8vIHRoZSBtb2NrIGhhbmRsZXIgYSBjaGFuY2UgdG8gdXBkYXRlIGl0J3MgZGF0YVxuXHRcdFx0XHRcdGlmICggJC5pc0Z1bmN0aW9uKG1vY2tIYW5kbGVyLnJlc3BvbnNlKSApIHtcblx0XHRcdFx0XHRcdG1vY2tIYW5kbGVyLnJlc3BvbnNlKG9yaWdTZXR0aW5ncyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIENvcHkgb3ZlciBvdXIgbW9jayB0byBvdXIgeGhyIG9iamVjdCBiZWZvcmUgcGFzc2luZyBjb250cm9sIGJhY2sgdG9cblx0XHRcdFx0XHQvLyBqUXVlcnkncyBvbnJlYWR5c3RhdGVjaGFuZ2UgY2FsbGJhY2tcblx0XHRcdFx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSA9PSAnanNvbicgJiYgKCB0eXBlb2YgbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ID09ICdvYmplY3QnICkgKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnJlc3BvbnNlVGV4dCA9IEpTT04uc3RyaW5naWZ5KG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmICggcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlID09ICd4bWwnICkge1xuXHRcdFx0XHRcdFx0aWYgKCB0eXBlb2YgbW9ja0hhbmRsZXIucmVzcG9uc2VYTUwgPT0gJ3N0cmluZycgKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2VYTUwgPSBwYXJzZVhNTChtb2NrSGFuZGxlci5yZXNwb25zZVhNTCk7XG5cdFx0XHRcdFx0XHRcdC8vaW4galF1ZXJ5IDEuOS4xKywgcmVzcG9uc2VYTUwgaXMgcHJvY2Vzc2VkIGRpZmZlcmVudGx5IGFuZCByZWxpZXMgb24gcmVzcG9uc2VUZXh0XG5cdFx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2VUZXh0ID0gbW9ja0hhbmRsZXIucmVzcG9uc2VYTUw7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHR0aGlzLnJlc3BvbnNlWE1MID0gbW9ja0hhbmRsZXIucmVzcG9uc2VYTUw7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2VUZXh0ID0gbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiggdHlwZW9mIG1vY2tIYW5kbGVyLnN0YXR1cyA9PSAnbnVtYmVyJyB8fCB0eXBlb2YgbW9ja0hhbmRsZXIuc3RhdHVzID09ICdzdHJpbmcnICkge1xuXHRcdFx0XHRcdFx0dGhpcy5zdGF0dXMgPSBtb2NrSGFuZGxlci5zdGF0dXM7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmKCB0eXBlb2YgbW9ja0hhbmRsZXIuc3RhdHVzVGV4dCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRcdFx0dGhpcy5zdGF0dXNUZXh0ID0gbW9ja0hhbmRsZXIuc3RhdHVzVGV4dDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8galF1ZXJ5IDIuMCByZW5hbWVkIG9ucmVhZHlzdGF0ZWNoYW5nZSB0byBvbmxvYWRcblx0XHRcdFx0XHRvblJlYWR5ID0gdGhpcy5vbnJlYWR5c3RhdGVjaGFuZ2UgfHwgdGhpcy5vbmxvYWQ7XG5cblx0XHRcdFx0XHQvLyBqUXVlcnkgPCAxLjQgZG9lc24ndCBoYXZlIG9ucmVhZHlzdGF0ZSBjaGFuZ2UgZm9yIHhoclxuXHRcdFx0XHRcdGlmICggJC5pc0Z1bmN0aW9uKCBvblJlYWR5ICkgKSB7XG5cdFx0XHRcdFx0XHRpZiggbW9ja0hhbmRsZXIuaXNUaW1lb3V0KSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMuc3RhdHVzID0gLTE7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRvblJlYWR5LmNhbGwoIHRoaXMsIG1vY2tIYW5kbGVyLmlzVGltZW91dCA/ICd0aW1lb3V0JyA6IHVuZGVmaW5lZCApO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoIG1vY2tIYW5kbGVyLmlzVGltZW91dCApIHtcblx0XHRcdFx0XHRcdC8vIEZpeCBmb3IgMS4zLjIgdGltZW91dCB0byBrZWVwIHN1Y2Nlc3MgZnJvbSBmaXJpbmcuXG5cdFx0XHRcdFx0XHR0aGlzLnN0YXR1cyA9IC0xO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSkuYXBwbHkodGhhdCk7XG5cdFx0XHR9O1xuXHRcdH0pKHRoaXMpO1xuXG5cdFx0aWYgKCBtb2NrSGFuZGxlci5wcm94eSApIHtcblx0XHRcdC8vIFdlJ3JlIHByb3h5aW5nIHRoaXMgcmVxdWVzdCBhbmQgbG9hZGluZyBpbiBhbiBleHRlcm5hbCBmaWxlIGluc3RlYWRcblx0XHRcdF9hamF4KHtcblx0XHRcdFx0Z2xvYmFsOiBmYWxzZSxcblx0XHRcdFx0dXJsOiBtb2NrSGFuZGxlci5wcm94eSxcblx0XHRcdFx0dHlwZTogbW9ja0hhbmRsZXIucHJveHlUeXBlLFxuXHRcdFx0XHRkYXRhOiBtb2NrSGFuZGxlci5kYXRhLFxuXHRcdFx0XHRkYXRhVHlwZTogcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlID09PSBcInNjcmlwdFwiID8gXCJ0ZXh0L3BsYWluXCIgOiByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUsXG5cdFx0XHRcdGNvbXBsZXRlOiBmdW5jdGlvbih4aHIpIHtcblx0XHRcdFx0XHRtb2NrSGFuZGxlci5yZXNwb25zZVhNTCA9IHhoci5yZXNwb25zZVhNTDtcblx0XHRcdFx0XHRtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgPSB4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgICAgICAgICAgICAgICAvLyBEb24ndCBvdmVycmlkZSB0aGUgaGFuZGxlciBzdGF0dXMvc3RhdHVzVGV4dCBpZiBpdCdzIHNwZWNpZmllZCBieSB0aGUgY29uZmlnXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0RlZmF1bHRTZXR0aW5nKG1vY2tIYW5kbGVyLCAnc3RhdHVzJykpIHtcblx0XHRcdFx0XHQgICAgbW9ja0hhbmRsZXIuc3RhdHVzID0geGhyLnN0YXR1cztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNEZWZhdWx0U2V0dGluZyhtb2NrSGFuZGxlciwgJ3N0YXR1c1RleHQnKSkge1xuXHRcdFx0XHRcdCAgICBtb2NrSGFuZGxlci5zdGF0dXNUZXh0ID0geGhyLnN0YXR1c1RleHQ7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuXHRcdFx0XHRcdHRoaXMucmVzcG9uc2VUaW1lciA9IHNldFRpbWVvdXQocHJvY2VzcywgbW9ja0hhbmRsZXIucmVzcG9uc2VUaW1lIHx8IDApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gdHlwZSA9PSAnUE9TVCcgfHwgJ0dFVCcgfHwgJ0RFTEVURSdcblx0XHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmFzeW5jID09PSBmYWxzZSApIHtcblx0XHRcdFx0Ly8gVE9ETzogQmxvY2tpbmcgZGVsYXlcblx0XHRcdFx0cHJvY2VzcygpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5yZXNwb25zZVRpbWVyID0gc2V0VGltZW91dChwcm9jZXNzLCBtb2NrSGFuZGxlci5yZXNwb25zZVRpbWUgfHwgNTApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIENvbnN0cnVjdCBhIG1vY2tlZCBYSFIgT2JqZWN0XG5cdGZ1bmN0aW9uIHhocihtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MsIG9yaWdIYW5kbGVyKSB7XG5cdFx0Ly8gRXh0ZW5kIHdpdGggb3VyIGRlZmF1bHQgbW9ja2pheCBzZXR0aW5nc1xuXHRcdG1vY2tIYW5kbGVyID0gJC5leHRlbmQodHJ1ZSwge30sICQubW9ja2pheFNldHRpbmdzLCBtb2NrSGFuZGxlcik7XG5cblx0XHRpZiAodHlwZW9mIG1vY2tIYW5kbGVyLmhlYWRlcnMgPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRtb2NrSGFuZGxlci5oZWFkZXJzID0ge307XG5cdFx0fVxuXHRcdGlmICggbW9ja0hhbmRsZXIuY29udGVudFR5cGUgKSB7XG5cdFx0XHRtb2NrSGFuZGxlci5oZWFkZXJzWydjb250ZW50LXR5cGUnXSA9IG1vY2tIYW5kbGVyLmNvbnRlbnRUeXBlO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRzdGF0dXM6IG1vY2tIYW5kbGVyLnN0YXR1cyxcblx0XHRcdHN0YXR1c1RleHQ6IG1vY2tIYW5kbGVyLnN0YXR1c1RleHQsXG5cdFx0XHRyZWFkeVN0YXRlOiAxLFxuXHRcdFx0b3BlbjogZnVuY3Rpb24oKSB7IH0sXG5cdFx0XHRzZW5kOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0b3JpZ0hhbmRsZXIuZmlyZWQgPSB0cnVlO1xuXHRcdFx0XHRfeGhyU2VuZC5jYWxsKHRoaXMsIG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncyk7XG5cdFx0XHR9LFxuXHRcdFx0YWJvcnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjbGVhclRpbWVvdXQodGhpcy5yZXNwb25zZVRpbWVyKTtcblx0XHRcdH0sXG5cdFx0XHRzZXRSZXF1ZXN0SGVhZGVyOiBmdW5jdGlvbihoZWFkZXIsIHZhbHVlKSB7XG5cdFx0XHRcdG1vY2tIYW5kbGVyLmhlYWRlcnNbaGVhZGVyXSA9IHZhbHVlO1xuXHRcdFx0fSxcblx0XHRcdGdldFJlc3BvbnNlSGVhZGVyOiBmdW5jdGlvbihoZWFkZXIpIHtcblx0XHRcdFx0Ly8gJ0xhc3QtbW9kaWZpZWQnLCAnRXRhZycsICdjb250ZW50LXR5cGUnIGFyZSBhbGwgY2hlY2tlZCBieSBqUXVlcnlcblx0XHRcdFx0aWYgKCBtb2NrSGFuZGxlci5oZWFkZXJzICYmIG1vY2tIYW5kbGVyLmhlYWRlcnNbaGVhZGVyXSApIHtcblx0XHRcdFx0XHQvLyBSZXR1cm4gYXJiaXRyYXJ5IGhlYWRlcnNcblx0XHRcdFx0XHRyZXR1cm4gbW9ja0hhbmRsZXIuaGVhZGVyc1toZWFkZXJdO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCBoZWFkZXIudG9Mb3dlckNhc2UoKSA9PSAnbGFzdC1tb2RpZmllZCcgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG1vY2tIYW5kbGVyLmxhc3RNb2RpZmllZCB8fCAobmV3IERhdGUoKSkudG9TdHJpbmcoKTtcblx0XHRcdFx0fSBlbHNlIGlmICggaGVhZGVyLnRvTG93ZXJDYXNlKCkgPT0gJ2V0YWcnICkge1xuXHRcdFx0XHRcdHJldHVybiBtb2NrSGFuZGxlci5ldGFnIHx8ICcnO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCBoZWFkZXIudG9Mb3dlckNhc2UoKSA9PSAnY29udGVudC10eXBlJyApIHtcblx0XHRcdFx0XHRyZXR1cm4gbW9ja0hhbmRsZXIuY29udGVudFR5cGUgfHwgJ3RleHQvcGxhaW4nO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0Z2V0QWxsUmVzcG9uc2VIZWFkZXJzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGhlYWRlcnMgPSAnJztcblx0XHRcdFx0JC5lYWNoKG1vY2tIYW5kbGVyLmhlYWRlcnMsIGZ1bmN0aW9uKGssIHYpIHtcblx0XHRcdFx0XHRoZWFkZXJzICs9IGsgKyAnOiAnICsgdiArIFwiXFxuXCI7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXR1cm4gaGVhZGVycztcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cblx0Ly8gUHJvY2VzcyBhIEpTT05QIG1vY2sgcmVxdWVzdC5cblx0ZnVuY3Rpb24gcHJvY2Vzc0pzb25wTW9jayggcmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzICkge1xuXHRcdC8vIEhhbmRsZSBKU09OUCBQYXJhbWV0ZXIgQ2FsbGJhY2tzLCB3ZSBuZWVkIHRvIHJlcGxpY2F0ZSBzb21lIG9mIHRoZSBqUXVlcnkgY29yZSBoZXJlXG5cdFx0Ly8gYmVjYXVzZSB0aGVyZSBpc24ndCBhbiBlYXN5IGhvb2sgZm9yIHRoZSBjcm9zcyBkb21haW4gc2NyaXB0IHRhZyBvZiBqc29ucFxuXG5cdFx0cHJvY2Vzc0pzb25wVXJsKCByZXF1ZXN0U2V0dGluZ3MgKTtcblxuXHRcdHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSA9IFwianNvblwiO1xuXHRcdGlmKHJlcXVlc3RTZXR0aW5ncy5kYXRhICYmIENBTExCQUNLX1JFR0VYLnRlc3QocmVxdWVzdFNldHRpbmdzLmRhdGEpIHx8IENBTExCQUNLX1JFR0VYLnRlc3QocmVxdWVzdFNldHRpbmdzLnVybCkpIHtcblx0XHRcdGNyZWF0ZUpzb25wQ2FsbGJhY2socmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzKTtcblxuXHRcdFx0Ly8gV2UgbmVlZCB0byBtYWtlIHN1cmVcblx0XHRcdC8vIHRoYXQgYSBKU09OUCBzdHlsZSByZXNwb25zZSBpcyBleGVjdXRlZCBwcm9wZXJseVxuXG5cdFx0XHR2YXIgcnVybCA9IC9eKFxcdys6KT9cXC9cXC8oW15cXC8/I10rKS8sXG5cdFx0XHRcdHBhcnRzID0gcnVybC5leGVjKCByZXF1ZXN0U2V0dGluZ3MudXJsICksXG5cdFx0XHRcdHJlbW90ZSA9IHBhcnRzICYmIChwYXJ0c1sxXSAmJiBwYXJ0c1sxXSAhPT0gbG9jYXRpb24ucHJvdG9jb2wgfHwgcGFydHNbMl0gIT09IGxvY2F0aW9uLmhvc3QpO1xuXG5cdFx0XHRyZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgPSBcInNjcmlwdFwiO1xuXHRcdFx0aWYocmVxdWVzdFNldHRpbmdzLnR5cGUudG9VcHBlckNhc2UoKSA9PT0gXCJHRVRcIiAmJiByZW1vdGUgKSB7XG5cdFx0XHRcdHZhciBuZXdNb2NrUmV0dXJuID0gcHJvY2Vzc0pzb25wUmVxdWVzdCggcmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzICk7XG5cblx0XHRcdFx0Ly8gQ2hlY2sgaWYgd2UgYXJlIHN1cHBvc2VkIHRvIHJldHVybiBhIERlZmVycmVkIGJhY2sgdG8gdGhlIG1vY2sgY2FsbCwgb3IganVzdFxuXHRcdFx0XHQvLyBzaWduYWwgc3VjY2Vzc1xuXHRcdFx0XHRpZihuZXdNb2NrUmV0dXJuKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG5ld01vY2tSZXR1cm47XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHQvLyBBcHBlbmQgdGhlIHJlcXVpcmVkIGNhbGxiYWNrIHBhcmFtZXRlciB0byB0aGUgZW5kIG9mIHRoZSByZXF1ZXN0IFVSTCwgZm9yIGEgSlNPTlAgcmVxdWVzdFxuXHRmdW5jdGlvbiBwcm9jZXNzSnNvbnBVcmwoIHJlcXVlc3RTZXR0aW5ncyApIHtcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy50eXBlLnRvVXBwZXJDYXNlKCkgPT09IFwiR0VUXCIgKSB7XG5cdFx0XHRpZiAoICFDQUxMQkFDS19SRUdFWC50ZXN0KCByZXF1ZXN0U2V0dGluZ3MudXJsICkgKSB7XG5cdFx0XHRcdHJlcXVlc3RTZXR0aW5ncy51cmwgKz0gKC9cXD8vLnRlc3QoIHJlcXVlc3RTZXR0aW5ncy51cmwgKSA/IFwiJlwiIDogXCI/XCIpICtcblx0XHRcdFx0XHQocmVxdWVzdFNldHRpbmdzLmpzb25wIHx8IFwiY2FsbGJhY2tcIikgKyBcIj0/XCI7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICggIXJlcXVlc3RTZXR0aW5ncy5kYXRhIHx8ICFDQUxMQkFDS19SRUdFWC50ZXN0KHJlcXVlc3RTZXR0aW5ncy5kYXRhKSApIHtcblx0XHRcdHJlcXVlc3RTZXR0aW5ncy5kYXRhID0gKHJlcXVlc3RTZXR0aW5ncy5kYXRhID8gcmVxdWVzdFNldHRpbmdzLmRhdGEgKyBcIiZcIiA6IFwiXCIpICsgKHJlcXVlc3RTZXR0aW5ncy5qc29ucCB8fCBcImNhbGxiYWNrXCIpICsgXCI9P1wiO1xuXHRcdH1cblx0fVxuXG5cdC8vIFByb2Nlc3MgYSBKU09OUCByZXF1ZXN0IGJ5IGV2YWx1YXRpbmcgdGhlIG1vY2tlZCByZXNwb25zZSB0ZXh0XG5cdGZ1bmN0aW9uIHByb2Nlc3NKc29ucFJlcXVlc3QoIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyApIHtcblx0XHQvLyBTeW50aGVzaXplIHRoZSBtb2NrIHJlcXVlc3QgZm9yIGFkZGluZyBhIHNjcmlwdCB0YWdcblx0XHR2YXIgY2FsbGJhY2tDb250ZXh0ID0gb3JpZ1NldHRpbmdzICYmIG9yaWdTZXR0aW5ncy5jb250ZXh0IHx8IHJlcXVlc3RTZXR0aW5ncyxcblx0XHRcdG5ld01vY2sgPSBudWxsO1xuXG5cblx0XHQvLyBJZiB0aGUgcmVzcG9uc2UgaGFuZGxlciBvbiB0aGUgbW9vY2sgaXMgYSBmdW5jdGlvbiwgY2FsbCBpdFxuXHRcdGlmICggbW9ja0hhbmRsZXIucmVzcG9uc2UgJiYgJC5pc0Z1bmN0aW9uKG1vY2tIYW5kbGVyLnJlc3BvbnNlKSApIHtcblx0XHRcdG1vY2tIYW5kbGVyLnJlc3BvbnNlKG9yaWdTZXR0aW5ncyk7XG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0Ly8gRXZhbHVhdGUgdGhlIHJlc3BvbnNlVGV4dCBqYXZhc2NyaXB0IGluIGEgZ2xvYmFsIGNvbnRleHRcblx0XHRcdGlmKCB0eXBlb2YgbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ID09PSAnb2JqZWN0JyApIHtcblx0XHRcdFx0JC5nbG9iYWxFdmFsKCAnKCcgKyBKU09OLnN0cmluZ2lmeSggbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ICkgKyAnKScpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JC5nbG9iYWxFdmFsKCAnKCcgKyBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgKyAnKScpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIFN1Y2Nlc3NmdWwgcmVzcG9uc2Vcblx0XHRqc29ucFN1Y2Nlc3MoIHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0LCBtb2NrSGFuZGxlciApO1xuXHRcdGpzb25wQ29tcGxldGUoIHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0LCBtb2NrSGFuZGxlciApO1xuXG5cdFx0Ly8gSWYgd2UgYXJlIHJ1bm5pbmcgdW5kZXIgalF1ZXJ5IDEuNSssIHJldHVybiBhIGRlZmVycmVkIG9iamVjdFxuXHRcdGlmKCQuRGVmZXJyZWQpe1xuXHRcdFx0bmV3TW9jayA9IG5ldyAkLkRlZmVycmVkKCk7XG5cdFx0XHRpZih0eXBlb2YgbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ID09IFwib2JqZWN0XCIpe1xuXHRcdFx0XHRuZXdNb2NrLnJlc29sdmVXaXRoKCBjYWxsYmFja0NvbnRleHQsIFttb2NrSGFuZGxlci5yZXNwb25zZVRleHRdICk7XG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHRuZXdNb2NrLnJlc29sdmVXaXRoKCBjYWxsYmFja0NvbnRleHQsIFskLnBhcnNlSlNPTiggbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ICldICk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBuZXdNb2NrO1xuXHR9XG5cblxuXHQvLyBDcmVhdGUgdGhlIHJlcXVpcmVkIEpTT05QIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciB0aGUgcmVxdWVzdFxuXHRmdW5jdGlvbiBjcmVhdGVKc29ucENhbGxiYWNrKCByZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MgKSB7XG5cdFx0dmFyIGNhbGxiYWNrQ29udGV4dCA9IG9yaWdTZXR0aW5ncyAmJiBvcmlnU2V0dGluZ3MuY29udGV4dCB8fCByZXF1ZXN0U2V0dGluZ3M7XG5cdFx0dmFyIGpzb25wID0gcmVxdWVzdFNldHRpbmdzLmpzb25wQ2FsbGJhY2sgfHwgKFwianNvbnBcIiArIGpzYysrKTtcblxuXHRcdC8vIFJlcGxhY2UgdGhlID0/IHNlcXVlbmNlIGJvdGggaW4gdGhlIHF1ZXJ5IHN0cmluZyBhbmQgdGhlIGRhdGFcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5kYXRhICkge1xuXHRcdFx0cmVxdWVzdFNldHRpbmdzLmRhdGEgPSAocmVxdWVzdFNldHRpbmdzLmRhdGEgKyBcIlwiKS5yZXBsYWNlKENBTExCQUNLX1JFR0VYLCBcIj1cIiArIGpzb25wICsgXCIkMVwiKTtcblx0XHR9XG5cblx0XHRyZXF1ZXN0U2V0dGluZ3MudXJsID0gcmVxdWVzdFNldHRpbmdzLnVybC5yZXBsYWNlKENBTExCQUNLX1JFR0VYLCBcIj1cIiArIGpzb25wICsgXCIkMVwiKTtcblxuXG5cdFx0Ly8gSGFuZGxlIEpTT05QLXN0eWxlIGxvYWRpbmdcblx0XHR3aW5kb3dbIGpzb25wIF0gPSB3aW5kb3dbIGpzb25wIF0gfHwgZnVuY3Rpb24oIHRtcCApIHtcblx0XHRcdGRhdGEgPSB0bXA7XG5cdFx0XHRqc29ucFN1Y2Nlc3MoIHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0LCBtb2NrSGFuZGxlciApO1xuXHRcdFx0anNvbnBDb21wbGV0ZSggcmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyICk7XG5cdFx0XHQvLyBHYXJiYWdlIGNvbGxlY3Rcblx0XHRcdHdpbmRvd1sganNvbnAgXSA9IHVuZGVmaW5lZDtcblxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0ZGVsZXRlIHdpbmRvd1sganNvbnAgXTtcblx0XHRcdH0gY2F0Y2goZSkge31cblxuXHRcdFx0aWYgKCBoZWFkICkge1xuXHRcdFx0XHRoZWFkLnJlbW92ZUNoaWxkKCBzY3JpcHQgKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cblx0Ly8gVGhlIEpTT05QIHJlcXVlc3Qgd2FzIHN1Y2Nlc3NmdWxcblx0ZnVuY3Rpb24ganNvbnBTdWNjZXNzKHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0LCBtb2NrSGFuZGxlcikge1xuXHRcdC8vIElmIGEgbG9jYWwgY2FsbGJhY2sgd2FzIHNwZWNpZmllZCwgZmlyZSBpdCBhbmQgcGFzcyBpdCB0aGUgZGF0YVxuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLnN1Y2Nlc3MgKSB7XG5cdFx0XHRyZXF1ZXN0U2V0dGluZ3Muc3VjY2Vzcy5jYWxsKCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCB8fCBcIlwiLCBzdGF0dXMsIHt9ICk7XG5cdFx0fVxuXG5cdFx0Ly8gRmlyZSB0aGUgZ2xvYmFsIGNhbGxiYWNrXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZ2xvYmFsICkge1xuXHRcdFx0dHJpZ2dlcihyZXF1ZXN0U2V0dGluZ3MsIFwiYWpheFN1Y2Nlc3NcIiwgW3t9LCByZXF1ZXN0U2V0dGluZ3NdICk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gVGhlIEpTT05QIHJlcXVlc3Qgd2FzIGNvbXBsZXRlZFxuXHRmdW5jdGlvbiBqc29ucENvbXBsZXRlKHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0KSB7XG5cdFx0Ly8gUHJvY2VzcyByZXN1bHRcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5jb21wbGV0ZSApIHtcblx0XHRcdHJlcXVlc3RTZXR0aW5ncy5jb21wbGV0ZS5jYWxsKCBjYWxsYmFja0NvbnRleHQsIHt9ICwgc3RhdHVzICk7XG5cdFx0fVxuXG5cdFx0Ly8gVGhlIHJlcXVlc3Qgd2FzIGNvbXBsZXRlZFxuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmdsb2JhbCApIHtcblx0XHRcdHRyaWdnZXIoIFwiYWpheENvbXBsZXRlXCIsIFt7fSwgcmVxdWVzdFNldHRpbmdzXSApO1xuXHRcdH1cblxuXHRcdC8vIEhhbmRsZSB0aGUgZ2xvYmFsIEFKQVggY291bnRlclxuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmdsb2JhbCAmJiAhIC0tJC5hY3RpdmUgKSB7XG5cdFx0XHQkLmV2ZW50LnRyaWdnZXIoIFwiYWpheFN0b3BcIiApO1xuXHRcdH1cblx0fVxuXG5cblx0Ly8gVGhlIGNvcmUgJC5hamF4IHJlcGxhY2VtZW50LlxuXHRmdW5jdGlvbiBoYW5kbGVBamF4KCB1cmwsIG9yaWdTZXR0aW5ncyApIHtcblx0XHR2YXIgbW9ja1JlcXVlc3QsIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXI7XG5cblx0XHQvLyBJZiB1cmwgaXMgYW4gb2JqZWN0LCBzaW11bGF0ZSBwcmUtMS41IHNpZ25hdHVyZVxuXHRcdGlmICggdHlwZW9mIHVybCA9PT0gXCJvYmplY3RcIiApIHtcblx0XHRcdG9yaWdTZXR0aW5ncyA9IHVybDtcblx0XHRcdHVybCA9IHVuZGVmaW5lZDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gd29yayBhcm91bmQgdG8gc3VwcG9ydCAxLjUgc2lnbmF0dXJlXG5cdFx0XHRvcmlnU2V0dGluZ3MgPSBvcmlnU2V0dGluZ3MgfHwge307XG5cdFx0XHRvcmlnU2V0dGluZ3MudXJsID0gdXJsO1xuXHRcdH1cblxuXHRcdC8vIEV4dGVuZCB0aGUgb3JpZ2luYWwgc2V0dGluZ3MgZm9yIHRoZSByZXF1ZXN0XG5cdFx0cmVxdWVzdFNldHRpbmdzID0gJC5leHRlbmQodHJ1ZSwge30sICQuYWpheFNldHRpbmdzLCBvcmlnU2V0dGluZ3MpO1xuXG5cdFx0Ly8gSXRlcmF0ZSBvdmVyIG91ciBtb2NrIGhhbmRsZXJzIChpbiByZWdpc3RyYXRpb24gb3JkZXIpIHVudGlsIHdlIGZpbmRcblx0XHQvLyBvbmUgdGhhdCBpcyB3aWxsaW5nIHRvIGludGVyY2VwdCB0aGUgcmVxdWVzdFxuXHRcdGZvcih2YXIgayA9IDA7IGsgPCBtb2NrSGFuZGxlcnMubGVuZ3RoOyBrKyspIHtcblx0XHRcdGlmICggIW1vY2tIYW5kbGVyc1trXSApIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdG1vY2tIYW5kbGVyID0gZ2V0TW9ja0ZvclJlcXVlc3QoIG1vY2tIYW5kbGVyc1trXSwgcmVxdWVzdFNldHRpbmdzICk7XG5cdFx0XHRpZighbW9ja0hhbmRsZXIpIHtcblx0XHRcdFx0Ly8gTm8gdmFsaWQgbW9jayBmb3VuZCBmb3IgdGhpcyByZXF1ZXN0XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRtb2NrZWRBamF4Q2FsbHMucHVzaChyZXF1ZXN0U2V0dGluZ3MpO1xuXG5cdFx0XHQvLyBJZiBsb2dnaW5nIGlzIGVuYWJsZWQsIGxvZyB0aGUgbW9jayB0byB0aGUgY29uc29sZVxuXHRcdFx0JC5tb2NramF4U2V0dGluZ3MubG9nKCBtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzICk7XG5cblxuXHRcdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgJiYgcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlLnRvVXBwZXJDYXNlKCkgPT09ICdKU09OUCcgKSB7XG5cdFx0XHRcdGlmICgobW9ja1JlcXVlc3QgPSBwcm9jZXNzSnNvbnBNb2NrKCByZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MgKSkpIHtcblx0XHRcdFx0XHQvLyBUaGlzIG1vY2sgd2lsbCBoYW5kbGUgdGhlIEpTT05QIHJlcXVlc3Rcblx0XHRcdFx0XHRyZXR1cm4gbW9ja1JlcXVlc3Q7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXG5cdFx0XHQvLyBSZW1vdmVkIHRvIGZpeCAjNTQgLSBrZWVwIHRoZSBtb2NraW5nIGRhdGEgb2JqZWN0IGludGFjdFxuXHRcdFx0Ly9tb2NrSGFuZGxlci5kYXRhID0gcmVxdWVzdFNldHRpbmdzLmRhdGE7XG5cblx0XHRcdG1vY2tIYW5kbGVyLmNhY2hlID0gcmVxdWVzdFNldHRpbmdzLmNhY2hlO1xuXHRcdFx0bW9ja0hhbmRsZXIudGltZW91dCA9IHJlcXVlc3RTZXR0aW5ncy50aW1lb3V0O1xuXHRcdFx0bW9ja0hhbmRsZXIuZ2xvYmFsID0gcmVxdWVzdFNldHRpbmdzLmdsb2JhbDtcblxuXHRcdFx0Y29weVVybFBhcmFtZXRlcnMobW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyk7XG5cblx0XHRcdChmdW5jdGlvbihtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MsIG9yaWdIYW5kbGVyKSB7XG5cdFx0XHRcdG1vY2tSZXF1ZXN0ID0gX2FqYXguY2FsbCgkLCAkLmV4dGVuZCh0cnVlLCB7fSwgb3JpZ1NldHRpbmdzLCB7XG5cdFx0XHRcdFx0Ly8gTW9jayB0aGUgWEhSIG9iamVjdFxuXHRcdFx0XHRcdHhocjogZnVuY3Rpb24oKSB7IHJldHVybiB4aHIoIG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncywgb3JpZ0hhbmRsZXIgKTsgfVxuXHRcdFx0XHR9KSk7XG5cdFx0XHR9KShtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MsIG1vY2tIYW5kbGVyc1trXSk7XG5cblx0XHRcdHJldHVybiBtb2NrUmVxdWVzdDtcblx0XHR9XG5cblx0XHQvLyBXZSBkb24ndCBoYXZlIGEgbW9jayByZXF1ZXN0XG5cdFx0aWYoJC5tb2NramF4U2V0dGluZ3MudGhyb3dVbm1vY2tlZCA9PT0gdHJ1ZSkge1xuXHRcdFx0dGhyb3coJ0FKQVggbm90IG1vY2tlZDogJyArIG9yaWdTZXR0aW5ncy51cmwpO1xuXHRcdH1cblx0XHRlbHNlIHsgLy8gdHJpZ2dlciBhIG5vcm1hbCByZXF1ZXN0XG5cdFx0XHRyZXR1cm4gX2FqYXguYXBwbHkoJCwgW29yaWdTZXR0aW5nc10pO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQqIENvcGllcyBVUkwgcGFyYW1ldGVyIHZhbHVlcyBpZiB0aGV5IHdlcmUgY2FwdHVyZWQgYnkgYSByZWd1bGFyIGV4cHJlc3Npb25cblx0KiBAcGFyYW0ge09iamVjdH0gbW9ja0hhbmRsZXJcblx0KiBAcGFyYW0ge09iamVjdH0gb3JpZ1NldHRpbmdzXG5cdCovXG5cdGZ1bmN0aW9uIGNvcHlVcmxQYXJhbWV0ZXJzKG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MpIHtcblx0XHQvL3BhcmFtZXRlcnMgYXJlbid0IGNhcHR1cmVkIGlmIHRoZSBVUkwgaXNuJ3QgYSBSZWdFeHBcblx0XHRpZiAoIShtb2NrSGFuZGxlci51cmwgaW5zdGFuY2VvZiBSZWdFeHApKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdC8vaWYgbm8gVVJMIHBhcmFtcyB3ZXJlIGRlZmluZWQgb24gdGhlIGhhbmRsZXIsIGRvbid0IGF0dGVtcHQgYSBjYXB0dXJlXG5cdFx0aWYgKCFtb2NrSGFuZGxlci5oYXNPd25Qcm9wZXJ0eSgndXJsUGFyYW1zJykpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dmFyIGNhcHR1cmVzID0gbW9ja0hhbmRsZXIudXJsLmV4ZWMob3JpZ1NldHRpbmdzLnVybCk7XG5cdFx0Ly90aGUgd2hvbGUgUmVnRXhwIG1hdGNoIGlzIGFsd2F5cyB0aGUgZmlyc3QgdmFsdWUgaW4gdGhlIGNhcHR1cmUgcmVzdWx0c1xuXHRcdGlmIChjYXB0dXJlcy5sZW5ndGggPT09IDEpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y2FwdHVyZXMuc2hpZnQoKTtcblx0XHQvL3VzZSBoYW5kbGVyIHBhcmFtcyBhcyBrZXlzIGFuZCBjYXB0dXJlIHJlc3V0cyBhcyB2YWx1ZXNcblx0XHR2YXIgaSA9IDAsXG5cdFx0Y2FwdHVyZXNMZW5ndGggPSBjYXB0dXJlcy5sZW5ndGgsXG5cdFx0cGFyYW1zTGVuZ3RoID0gbW9ja0hhbmRsZXIudXJsUGFyYW1zLmxlbmd0aCxcblx0XHQvL2luIGNhc2UgdGhlIG51bWJlciBvZiBwYXJhbXMgc3BlY2lmaWVkIGlzIGxlc3MgdGhhbiBhY3R1YWwgY2FwdHVyZXNcblx0XHRtYXhJdGVyYXRpb25zID0gTWF0aC5taW4oY2FwdHVyZXNMZW5ndGgsIHBhcmFtc0xlbmd0aCksXG5cdFx0cGFyYW1WYWx1ZXMgPSB7fTtcblx0XHRmb3IgKGk7IGkgPCBtYXhJdGVyYXRpb25zOyBpKyspIHtcblx0XHRcdHZhciBrZXkgPSBtb2NrSGFuZGxlci51cmxQYXJhbXNbaV07XG5cdFx0XHRwYXJhbVZhbHVlc1trZXldID0gY2FwdHVyZXNbaV07XG5cdFx0fVxuXHRcdG9yaWdTZXR0aW5ncy51cmxQYXJhbXMgPSBwYXJhbVZhbHVlcztcblx0fVxuXG5cblx0Ly8gUHVibGljXG5cblx0JC5leHRlbmQoe1xuXHRcdGFqYXg6IGhhbmRsZUFqYXhcblx0fSk7XG5cblx0JC5tb2NramF4U2V0dGluZ3MgPSB7XG5cdFx0Ly91cmw6ICAgICAgICBudWxsLFxuXHRcdC8vdHlwZTogICAgICAgJ0dFVCcsXG5cdFx0bG9nOiAgICAgICAgICBmdW5jdGlvbiggbW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncyApIHtcblx0XHRcdGlmICggbW9ja0hhbmRsZXIubG9nZ2luZyA9PT0gZmFsc2UgfHxcblx0XHRcdFx0ICggdHlwZW9mIG1vY2tIYW5kbGVyLmxvZ2dpbmcgPT09ICd1bmRlZmluZWQnICYmICQubW9ja2pheFNldHRpbmdzLmxvZ2dpbmcgPT09IGZhbHNlICkgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGlmICggd2luZG93LmNvbnNvbGUgJiYgY29uc29sZS5sb2cgKSB7XG5cdFx0XHRcdHZhciBtZXNzYWdlID0gJ01PQ0sgJyArIHJlcXVlc3RTZXR0aW5ncy50eXBlLnRvVXBwZXJDYXNlKCkgKyAnOiAnICsgcmVxdWVzdFNldHRpbmdzLnVybDtcblx0XHRcdFx0dmFyIHJlcXVlc3QgPSAkLmV4dGVuZCh7fSwgcmVxdWVzdFNldHRpbmdzKTtcblxuXHRcdFx0XHRpZiAodHlwZW9mIGNvbnNvbGUubG9nID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2cobWVzc2FnZSwgcmVxdWVzdCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCBtZXNzYWdlICsgJyAnICsgSlNPTi5zdHJpbmdpZnkocmVxdWVzdCkgKTtcblx0XHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhtZXNzYWdlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXHRcdGxvZ2dpbmc6ICAgICAgIHRydWUsXG5cdFx0c3RhdHVzOiAgICAgICAgMjAwLFxuXHRcdHN0YXR1c1RleHQ6ICAgIFwiT0tcIixcblx0XHRyZXNwb25zZVRpbWU6ICA1MDAsXG5cdFx0aXNUaW1lb3V0OiAgICAgZmFsc2UsXG5cdFx0dGhyb3dVbm1vY2tlZDogZmFsc2UsXG5cdFx0Y29udGVudFR5cGU6ICAgJ3RleHQvcGxhaW4nLFxuXHRcdHJlc3BvbnNlOiAgICAgICcnLFxuXHRcdHJlc3BvbnNlVGV4dDogICcnLFxuXHRcdHJlc3BvbnNlWE1MOiAgICcnLFxuXHRcdHByb3h5OiAgICAgICAgICcnLFxuXHRcdHByb3h5VHlwZTogICAgICdHRVQnLFxuXG5cdFx0bGFzdE1vZGlmaWVkOiAgbnVsbCxcblx0XHRldGFnOiAgICAgICAgICAnJyxcblx0XHRoZWFkZXJzOiB7XG5cdFx0XHRldGFnOiAnSUpGQEgjQDkyM3VmODAyM2hGT0BJI0gjJyxcblx0XHRcdCdjb250ZW50LXR5cGUnIDogJ3RleHQvcGxhaW4nXG5cdFx0fVxuXHR9O1xuXG5cdCQubW9ja2pheCA9IGZ1bmN0aW9uKHNldHRpbmdzKSB7XG5cdFx0dmFyIGkgPSBtb2NrSGFuZGxlcnMubGVuZ3RoO1xuXHRcdG1vY2tIYW5kbGVyc1tpXSA9IHNldHRpbmdzO1xuXHRcdHJldHVybiBpO1xuXHR9O1xuXHQkLm1vY2tqYXhDbGVhciA9IGZ1bmN0aW9uKGkpIHtcblx0XHRpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT0gMSApIHtcblx0XHRcdG1vY2tIYW5kbGVyc1tpXSA9IG51bGw7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG1vY2tIYW5kbGVycyA9IFtdO1xuXHRcdH1cblx0XHRtb2NrZWRBamF4Q2FsbHMgPSBbXTtcblx0fTtcblx0JC5tb2NramF4LmhhbmRsZXIgPSBmdW5jdGlvbihpKSB7XG5cdFx0aWYgKCBhcmd1bWVudHMubGVuZ3RoID09IDEgKSB7XG5cdFx0XHRyZXR1cm4gbW9ja0hhbmRsZXJzW2ldO1xuXHRcdH1cblx0fTtcblx0JC5tb2NramF4Lm1vY2tlZEFqYXhDYWxscyA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBtb2NrZWRBamF4Q2FsbHM7XG5cdH07XG59KShqUXVlcnkpOyIsIi8qKlxuKiAgQWpheCBBdXRvY29tcGxldGUgZm9yIGpRdWVyeSwgdmVyc2lvbiAldmVyc2lvbiVcbiogIChjKSAyMDE1IFRvbWFzIEtpcmRhXG4qXG4qICBBamF4IEF1dG9jb21wbGV0ZSBmb3IgalF1ZXJ5IGlzIGZyZWVseSBkaXN0cmlidXRhYmxlIHVuZGVyIHRoZSB0ZXJtcyBvZiBhbiBNSVQtc3R5bGUgbGljZW5zZS5cbiogIEZvciBkZXRhaWxzLCBzZWUgdGhlIHdlYiBzaXRlOiBodHRwczovL2dpdGh1Yi5jb20vZGV2YnJpZGdlL2pRdWVyeS1BdXRvY29tcGxldGVcbiovXG5cbi8qanNsaW50ICBicm93c2VyOiB0cnVlLCB3aGl0ZTogdHJ1ZSwgcGx1c3BsdXM6IHRydWUsIHZhcnM6IHRydWUgKi9cbi8qZ2xvYmFsIGRlZmluZSwgd2luZG93LCBkb2N1bWVudCwgalF1ZXJ5LCBleHBvcnRzLCByZXF1aXJlICovXG5cbi8vIEV4cG9zZSBwbHVnaW4gYXMgYW4gQU1EIG1vZHVsZSBpZiBBTUQgbG9hZGVyIGlzIHByZXNlbnQ6XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgICAgIGRlZmluZShbJ2pxdWVyeSddLCBmYWN0b3J5KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgcmVxdWlyZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBCcm93c2VyaWZ5XG4gICAgICAgIGZhY3RvcnkocmVxdWlyZSgnanF1ZXJ5JykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEJyb3dzZXIgZ2xvYmFsc1xuICAgICAgICBmYWN0b3J5KGpRdWVyeSk7XG4gICAgfVxufShmdW5jdGlvbiAoJCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhclxuICAgICAgICB1dGlscyA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVzY2FwZVJlZ0V4Q2hhcnM6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvW1xcLVxcW1xcXVxcL1xce1xcfVxcKFxcKVxcKlxcK1xcP1xcLlxcXFxcXF5cXCRcXHxdL2csIFwiXFxcXCQmXCIpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY3JlYXRlTm9kZTogZnVuY3Rpb24gKGNvbnRhaW5lckNsYXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICAgICAgZGl2LmNsYXNzTmFtZSA9IGNvbnRhaW5lckNsYXNzO1xuICAgICAgICAgICAgICAgICAgICBkaXYuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICAgICAgICAgICAgICBkaXYuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRpdjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KCkpLFxuXG4gICAgICAgIGtleXMgPSB7XG4gICAgICAgICAgICBFU0M6IDI3LFxuICAgICAgICAgICAgVEFCOiA5LFxuICAgICAgICAgICAgUkVUVVJOOiAxMyxcbiAgICAgICAgICAgIExFRlQ6IDM3LFxuICAgICAgICAgICAgVVA6IDM4LFxuICAgICAgICAgICAgUklHSFQ6IDM5LFxuICAgICAgICAgICAgRE9XTjogNDBcbiAgICAgICAgfTtcblxuICAgIGZ1bmN0aW9uIEF1dG9jb21wbGV0ZShlbCwgb3B0aW9ucykge1xuICAgICAgICB2YXIgbm9vcCA9IGZ1bmN0aW9uICgpIHsgfSxcbiAgICAgICAgICAgIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgZGVmYXVsdHMgPSB7XG4gICAgICAgICAgICAgICAgYWpheFNldHRpbmdzOiB7fSxcbiAgICAgICAgICAgICAgICBhdXRvU2VsZWN0Rmlyc3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGFwcGVuZFRvOiBkb2N1bWVudC5ib2R5LFxuICAgICAgICAgICAgICAgIHNlcnZpY2VVcmw6IG51bGwsXG4gICAgICAgICAgICAgICAgbG9va3VwOiBudWxsLFxuICAgICAgICAgICAgICAgIG9uU2VsZWN0OiBudWxsLFxuICAgICAgICAgICAgICAgIHdpZHRoOiAnYXV0bycsXG4gICAgICAgICAgICAgICAgbWluQ2hhcnM6IDEsXG4gICAgICAgICAgICAgICAgbWF4SGVpZ2h0OiAzMDAsXG4gICAgICAgICAgICAgICAgZGVmZXJSZXF1ZXN0Qnk6IDAsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7fSxcbiAgICAgICAgICAgICAgICBmb3JtYXRSZXN1bHQ6IEF1dG9jb21wbGV0ZS5mb3JtYXRSZXN1bHQsXG4gICAgICAgICAgICAgICAgZGVsaW1pdGVyOiBudWxsLFxuICAgICAgICAgICAgICAgIHpJbmRleDogOTk5OSxcbiAgICAgICAgICAgICAgICB0eXBlOiAnR0VUJyxcbiAgICAgICAgICAgICAgICBub0NhY2hlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBvblNlYXJjaFN0YXJ0OiBub29wLFxuICAgICAgICAgICAgICAgIG9uU2VhcmNoQ29tcGxldGU6IG5vb3AsXG4gICAgICAgICAgICAgICAgb25TZWFyY2hFcnJvcjogbm9vcCxcbiAgICAgICAgICAgICAgICBwcmVzZXJ2ZUlucHV0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb250YWluZXJDbGFzczogJ2F1dG9jb21wbGV0ZS1zdWdnZXN0aW9ucycsXG4gICAgICAgICAgICAgICAgdGFiRGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAndGV4dCcsXG4gICAgICAgICAgICAgICAgY3VycmVudFJlcXVlc3Q6IG51bGwsXG4gICAgICAgICAgICAgICAgdHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwcmV2ZW50QmFkUXVlcmllczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBsb29rdXBGaWx0ZXI6IGZ1bmN0aW9uIChzdWdnZXN0aW9uLCBvcmlnaW5hbFF1ZXJ5LCBxdWVyeUxvd2VyQ2FzZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbi52YWx1ZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnlMb3dlckNhc2UpICE9PSAtMTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBhcmFtTmFtZTogJ3F1ZXJ5JyxcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1SZXN1bHQ6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIHJlc3BvbnNlID09PSAnc3RyaW5nJyA/ICQucGFyc2VKU09OKHJlc3BvbnNlKSA6IHJlc3BvbnNlO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2hvd05vU3VnZ2VzdGlvbk5vdGljZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgbm9TdWdnZXN0aW9uTm90aWNlOiAnTm8gcmVzdWx0cycsXG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb246ICdib3R0b20nLFxuICAgICAgICAgICAgICAgIGZvcmNlRml4UG9zaXRpb246IGZhbHNlXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIC8vIFNoYXJlZCB2YXJpYWJsZXM6XG4gICAgICAgIHRoYXQuZWxlbWVudCA9IGVsO1xuICAgICAgICB0aGF0LmVsID0gJChlbCk7XG4gICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSBbXTtcbiAgICAgICAgdGhhdC5iYWRRdWVyaWVzID0gW107XG4gICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgICAgICB0aGF0LmN1cnJlbnRWYWx1ZSA9IHRoYXQuZWxlbWVudC52YWx1ZTtcbiAgICAgICAgdGhhdC5pbnRlcnZhbElkID0gMDtcbiAgICAgICAgdGhhdC5jYWNoZWRSZXNwb25zZSA9IHt9O1xuICAgICAgICB0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwgPSBudWxsO1xuICAgICAgICB0aGF0Lm9uQ2hhbmdlID0gbnVsbDtcbiAgICAgICAgdGhhdC5pc0xvY2FsID0gZmFsc2U7XG4gICAgICAgIHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIgPSBudWxsO1xuICAgICAgICB0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIgPSBudWxsO1xuICAgICAgICB0aGF0Lm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgICAgICB0aGF0LmNsYXNzZXMgPSB7XG4gICAgICAgICAgICBzZWxlY3RlZDogJ2F1dG9jb21wbGV0ZS1zZWxlY3RlZCcsXG4gICAgICAgICAgICBzdWdnZXN0aW9uOiAnYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb24nXG4gICAgICAgIH07XG4gICAgICAgIHRoYXQuaGludCA9IG51bGw7XG4gICAgICAgIHRoYXQuaGludFZhbHVlID0gJyc7XG4gICAgICAgIHRoYXQuc2VsZWN0aW9uID0gbnVsbDtcblxuICAgICAgICAvLyBJbml0aWFsaXplIGFuZCBzZXQgb3B0aW9uczpcbiAgICAgICAgdGhhdC5pbml0aWFsaXplKCk7XG4gICAgICAgIHRoYXQuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICB9XG5cbiAgICBBdXRvY29tcGxldGUudXRpbHMgPSB1dGlscztcblxuICAgICQuQXV0b2NvbXBsZXRlID0gQXV0b2NvbXBsZXRlO1xuXG4gICAgQXV0b2NvbXBsZXRlLmZvcm1hdFJlc3VsdCA9IGZ1bmN0aW9uIChzdWdnZXN0aW9uLCBjdXJyZW50VmFsdWUpIHtcbiAgICAgICAgLy8gRG8gbm90IHJlcGxhY2UgYW55dGhpbmcgaWYgdGhlcmUgY3VycmVudCB2YWx1ZSBpcyBlbXB0eVxuICAgICAgICBpZiAoIWN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb24udmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciBwYXR0ZXJuID0gJygnICsgdXRpbHMuZXNjYXBlUmVnRXhDaGFycyhjdXJyZW50VmFsdWUpICsgJyknO1xuXG4gICAgICAgIHJldHVybiBzdWdnZXN0aW9uLnZhbHVlXG4gICAgICAgICAgICAucmVwbGFjZShuZXcgUmVnRXhwKHBhdHRlcm4sICdnaScpLCAnPHN0cm9uZz4kMTxcXC9zdHJvbmc+JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgICAgICAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvJmx0OyhcXC8/c3Ryb25nKSZndDsvZywgJzwkMT4nKTtcbiAgICB9O1xuXG4gICAgQXV0b2NvbXBsZXRlLnByb3RvdHlwZSA9IHtcblxuICAgICAgICBraWxsZXJGbjogbnVsbCxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgc3VnZ2VzdGlvblNlbGVjdG9yID0gJy4nICsgdGhhdC5jbGFzc2VzLnN1Z2dlc3Rpb24sXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSB0aGF0LmNsYXNzZXMuc2VsZWN0ZWQsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBjb250YWluZXI7XG5cbiAgICAgICAgICAgIC8vIFJlbW92ZSBhdXRvY29tcGxldGUgYXR0cmlidXRlIHRvIHByZXZlbnQgbmF0aXZlIHN1Z2dlc3Rpb25zOlxuICAgICAgICAgICAgdGhhdC5lbGVtZW50LnNldEF0dHJpYnV0ZSgnYXV0b2NvbXBsZXRlJywgJ29mZicpO1xuXG4gICAgICAgICAgICB0aGF0LmtpbGxlckZuID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoJChlLnRhcmdldCkuY2xvc2VzdCgnLicgKyB0aGF0Lm9wdGlvbnMuY29udGFpbmVyQ2xhc3MpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmtpbGxTdWdnZXN0aW9ucygpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmRpc2FibGVLaWxsZXJGbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIGh0bWwoKSBkZWFscyB3aXRoIG1hbnkgdHlwZXM6IGh0bWxTdHJpbmcgb3IgRWxlbWVudCBvciBBcnJheSBvciBqUXVlcnlcbiAgICAgICAgICAgIHRoYXQubm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQoJzxkaXYgY2xhc3M9XCJhdXRvY29tcGxldGUtbm8tc3VnZ2VzdGlvblwiPjwvZGl2PicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaHRtbCh0aGlzLm9wdGlvbnMubm9TdWdnZXN0aW9uTm90aWNlKS5nZXQoMCk7XG5cbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIgPSBBdXRvY29tcGxldGUudXRpbHMuY3JlYXRlTm9kZShvcHRpb25zLmNvbnRhaW5lckNsYXNzKTtcblxuICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZFRvKG9wdGlvbnMuYXBwZW5kVG8pO1xuXG4gICAgICAgICAgICAvLyBPbmx5IHNldCB3aWR0aCBpZiBpdCB3YXMgcHJvdmlkZWQ6XG4gICAgICAgICAgICBpZiAob3B0aW9ucy53aWR0aCAhPT0gJ2F1dG8nKSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLndpZHRoKG9wdGlvbnMud2lkdGgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBMaXN0ZW4gZm9yIG1vdXNlIG92ZXIgZXZlbnQgb24gc3VnZ2VzdGlvbnMgbGlzdDpcbiAgICAgICAgICAgIGNvbnRhaW5lci5vbignbW91c2VvdmVyLmF1dG9jb21wbGV0ZScsIHN1Z2dlc3Rpb25TZWxlY3RvciwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoYXQuYWN0aXZhdGUoJCh0aGlzKS5kYXRhKCdpbmRleCcpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBEZXNlbGVjdCBhY3RpdmUgZWxlbWVudCB3aGVuIG1vdXNlIGxlYXZlcyBzdWdnZXN0aW9ucyBjb250YWluZXI6XG4gICAgICAgICAgICBjb250YWluZXIub24oJ21vdXNlb3V0LmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuY2hpbGRyZW4oJy4nICsgc2VsZWN0ZWQpLnJlbW92ZUNsYXNzKHNlbGVjdGVkKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBMaXN0ZW4gZm9yIGNsaWNrIGV2ZW50IG9uIHN1Z2dlc3Rpb25zIGxpc3Q6XG4gICAgICAgICAgICBjb250YWluZXIub24oJ2NsaWNrLmF1dG9jb21wbGV0ZScsIHN1Z2dlc3Rpb25TZWxlY3RvciwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KCQodGhpcykuZGF0YSgnaW5kZXgnKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbkNhcHR1cmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoYXQudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuYXV0b2NvbXBsZXRlJywgdGhhdC5maXhQb3NpdGlvbkNhcHR1cmUpO1xuXG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdrZXlkb3duLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlQcmVzcyhlKTsgfSk7XG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdrZXl1cC5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5VXAoZSk7IH0pO1xuICAgICAgICAgICAgdGhhdC5lbC5vbignYmx1ci5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoKSB7IHRoYXQub25CbHVyKCk7IH0pO1xuICAgICAgICAgICAgdGhhdC5lbC5vbignZm9jdXMuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKCkgeyB0aGF0Lm9uRm9jdXMoKTsgfSk7XG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdjaGFuZ2UuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVVwKGUpOyB9KTtcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2lucHV0LmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlVcChlKTsgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Gb2N1czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmVsLnZhbCgpLmxlbmd0aCA+PSB0aGF0Lm9wdGlvbnMubWluQ2hhcnMpIHtcbiAgICAgICAgICAgICAgICB0aGF0Lm9uVmFsdWVDaGFuZ2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbkJsdXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuZW5hYmxlS2lsbGVyRm4oKTtcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIGFib3J0QWpheDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKHRoYXQuY3VycmVudFJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgICAgICAgICAgdGhhdC5jdXJyZW50UmVxdWVzdCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0T3B0aW9uczogZnVuY3Rpb24gKHN1cHBsaWVkT3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnM7XG5cbiAgICAgICAgICAgICQuZXh0ZW5kKG9wdGlvbnMsIHN1cHBsaWVkT3B0aW9ucyk7XG5cbiAgICAgICAgICAgIHRoYXQuaXNMb2NhbCA9ICQuaXNBcnJheShvcHRpb25zLmxvb2t1cCk7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmlzTG9jYWwpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmxvb2t1cCA9IHRoYXQudmVyaWZ5U3VnZ2VzdGlvbnNGb3JtYXQob3B0aW9ucy5sb29rdXApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvcHRpb25zLm9yaWVudGF0aW9uID0gdGhhdC52YWxpZGF0ZU9yaWVudGF0aW9uKG9wdGlvbnMub3JpZW50YXRpb24sICdib3R0b20nKTtcblxuICAgICAgICAgICAgLy8gQWRqdXN0IGhlaWdodCwgd2lkdGggYW5kIHotaW5kZXg6XG4gICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLmNzcyh7XG4gICAgICAgICAgICAgICAgJ21heC1oZWlnaHQnOiBvcHRpb25zLm1heEhlaWdodCArICdweCcsXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogb3B0aW9ucy53aWR0aCArICdweCcsXG4gICAgICAgICAgICAgICAgJ3otaW5kZXgnOiBvcHRpb25zLnpJbmRleFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cblxuICAgICAgICBjbGVhckNhY2hlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmNhY2hlZFJlc3BvbnNlID0ge307XG4gICAgICAgICAgICB0aGlzLmJhZFF1ZXJpZXMgPSBbXTtcbiAgICAgICAgfSxcblxuICAgICAgICBjbGVhcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5jbGVhckNhY2hlKCk7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRWYWx1ZSA9ICcnO1xuICAgICAgICAgICAgdGhpcy5zdWdnZXN0aW9ucyA9IFtdO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHRoYXQuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xuICAgICAgICAgICAgdGhhdC5hYm9ydEFqYXgoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbmFibGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBmaXhQb3NpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gVXNlIG9ubHkgd2hlbiBjb250YWluZXIgaGFzIGFscmVhZHkgaXRzIGNvbnRlbnRcblxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgICRjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lclBhcmVudCA9ICRjb250YWluZXIucGFyZW50KCkuZ2V0KDApO1xuICAgICAgICAgICAgLy8gRml4IHBvc2l0aW9uIGF1dG9tYXRpY2FsbHkgd2hlbiBhcHBlbmRlZCB0byBib2R5LlxuICAgICAgICAgICAgLy8gSW4gb3RoZXIgY2FzZXMgZm9yY2UgcGFyYW1ldGVyIG11c3QgYmUgZ2l2ZW4uXG4gICAgICAgICAgICBpZiAoY29udGFpbmVyUGFyZW50ICE9PSBkb2N1bWVudC5ib2R5ICYmICF0aGF0Lm9wdGlvbnMuZm9yY2VGaXhQb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2hvb3NlIG9yaWVudGF0aW9uXG4gICAgICAgICAgICB2YXIgb3JpZW50YXRpb24gPSB0aGF0Lm9wdGlvbnMub3JpZW50YXRpb24sXG4gICAgICAgICAgICAgICAgY29udGFpbmVySGVpZ2h0ID0gJGNvbnRhaW5lci5vdXRlckhlaWdodCgpLFxuICAgICAgICAgICAgICAgIGhlaWdodCA9IHRoYXQuZWwub3V0ZXJIZWlnaHQoKSxcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSB0aGF0LmVsLm9mZnNldCgpLFxuICAgICAgICAgICAgICAgIHN0eWxlcyA9IHsgJ3RvcCc6IG9mZnNldC50b3AsICdsZWZ0Jzogb2Zmc2V0LmxlZnQgfTtcblxuICAgICAgICAgICAgaWYgKG9yaWVudGF0aW9uID09PSAnYXV0bycpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmlld1BvcnRIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCksXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKSxcbiAgICAgICAgICAgICAgICAgICAgdG9wT3ZlcmZsb3cgPSAtc2Nyb2xsVG9wICsgb2Zmc2V0LnRvcCAtIGNvbnRhaW5lckhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgYm90dG9tT3ZlcmZsb3cgPSBzY3JvbGxUb3AgKyB2aWV3UG9ydEhlaWdodCAtIChvZmZzZXQudG9wICsgaGVpZ2h0ICsgY29udGFpbmVySGVpZ2h0KTtcblxuICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uID0gKE1hdGgubWF4KHRvcE92ZXJmbG93LCBib3R0b21PdmVyZmxvdykgPT09IHRvcE92ZXJmbG93KSA/ICd0b3AnIDogJ2JvdHRvbSc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcmllbnRhdGlvbiA9PT0gJ3RvcCcpIHtcbiAgICAgICAgICAgICAgICBzdHlsZXMudG9wICs9IC1jb250YWluZXJIZWlnaHQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN0eWxlcy50b3AgKz0gaGVpZ2h0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJZiBjb250YWluZXIgaXMgbm90IHBvc2l0aW9uZWQgdG8gYm9keSxcbiAgICAgICAgICAgIC8vIGNvcnJlY3QgaXRzIHBvc2l0aW9uIHVzaW5nIG9mZnNldCBwYXJlbnQgb2Zmc2V0XG4gICAgICAgICAgICBpZihjb250YWluZXJQYXJlbnQgIT09IGRvY3VtZW50LmJvZHkpIHtcbiAgICAgICAgICAgICAgICB2YXIgb3BhY2l0eSA9ICRjb250YWluZXIuY3NzKCdvcGFjaXR5JyksXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudE9mZnNldERpZmY7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGF0LnZpc2libGUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgJGNvbnRhaW5lci5jc3MoJ29wYWNpdHknLCAwKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHBhcmVudE9mZnNldERpZmYgPSAkY29udGFpbmVyLm9mZnNldFBhcmVudCgpLm9mZnNldCgpO1xuICAgICAgICAgICAgICAgIHN0eWxlcy50b3AgLT0gcGFyZW50T2Zmc2V0RGlmZi50b3A7XG4gICAgICAgICAgICAgICAgc3R5bGVzLmxlZnQgLT0gcGFyZW50T2Zmc2V0RGlmZi5sZWZ0O1xuXG4gICAgICAgICAgICAgICAgaWYgKCF0aGF0LnZpc2libGUpe1xuICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmNzcygnb3BhY2l0eScsIG9wYWNpdHkpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIC0ycHggdG8gYWNjb3VudCBmb3Igc3VnZ2VzdGlvbnMgYm9yZGVyLlxuICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy53aWR0aCA9PT0gJ2F1dG8nKSB7XG4gICAgICAgICAgICAgICAgc3R5bGVzLndpZHRoID0gKHRoYXQuZWwub3V0ZXJXaWR0aCgpIC0gMikgKyAncHgnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkY29udGFpbmVyLmNzcyhzdHlsZXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVuYWJsZUtpbGxlckZuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vbignY2xpY2suYXV0b2NvbXBsZXRlJywgdGhhdC5raWxsZXJGbik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzYWJsZUtpbGxlckZuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLmF1dG9jb21wbGV0ZScsIHRoYXQua2lsbGVyRm4pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGtpbGxTdWdnZXN0aW9uczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdGhhdC5zdG9wS2lsbFN1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgICB0aGF0LmludGVydmFsSWQgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGF0LnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhhdC5zdG9wS2lsbFN1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgICB9LCA1MCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3RvcEtpbGxTdWdnZXN0aW9uczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbElkKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc0N1cnNvckF0RW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgdmFsTGVuZ3RoID0gdGhhdC5lbC52YWwoKS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uU3RhcnQgPSB0aGF0LmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQsXG4gICAgICAgICAgICAgICAgcmFuZ2U7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2VsZWN0aW9uU3RhcnQgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGlvblN0YXJ0ID09PSB2YWxMZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmFuZ2UgPSBkb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgICAgICAgICByYW5nZS5tb3ZlU3RhcnQoJ2NoYXJhY3RlcicsIC12YWxMZW5ndGgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWxMZW5ndGggPT09IHJhbmdlLnRleHQubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25LZXlQcmVzczogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAgICAgLy8gSWYgc3VnZ2VzdGlvbnMgYXJlIGhpZGRlbiBhbmQgdXNlciBwcmVzc2VzIGFycm93IGRvd24sIGRpc3BsYXkgc3VnZ2VzdGlvbnM6XG4gICAgICAgICAgICBpZiAoIXRoYXQuZGlzYWJsZWQgJiYgIXRoYXQudmlzaWJsZSAmJiBlLndoaWNoID09PSBrZXlzLkRPV04gJiYgdGhhdC5jdXJyZW50VmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmRpc2FibGVkIHx8ICF0aGF0LnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5FU0M6XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5SSUdIVDpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuaGludCAmJiB0aGF0Lm9wdGlvbnMub25IaW50ICYmIHRoYXQuaXNDdXJzb3JBdEVuZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdEhpbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuVEFCOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5oaW50ICYmIHRoYXQub3B0aW9ucy5vbkhpbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0SGludCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCh0aGF0LnNlbGVjdGVkSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLnRhYkRpc2FibGVkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5SRVRVUk46XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCh0aGF0LnNlbGVjdGVkSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuVVA6XG4gICAgICAgICAgICAgICAgICAgIHRoYXQubW92ZVVwKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5ET1dOOlxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm1vdmVEb3duKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2FuY2VsIGV2ZW50IGlmIGZ1bmN0aW9uIGRpZCBub3QgcmV0dXJuOlxuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbktleVVwOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5kaXNhYmxlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3dpdGNoIChlLndoaWNoKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlVQOlxuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5ET1dOOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuY3VycmVudFZhbHVlICE9PSB0aGF0LmVsLnZhbCgpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5maW5kQmVzdEhpbnQoKTtcbiAgICAgICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLmRlZmVyUmVxdWVzdEJ5ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBEZWZlciBsb29rdXAgaW4gY2FzZSB3aGVuIHZhbHVlIGNoYW5nZXMgdmVyeSBxdWlja2x5OlxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uVmFsdWVDaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhhdC5vcHRpb25zLmRlZmVyUmVxdWVzdEJ5KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uVmFsdWVDaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25WYWx1ZUNoYW5nZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGF0LmVsLnZhbCgpLFxuICAgICAgICAgICAgICAgIHF1ZXJ5ID0gdGhhdC5nZXRRdWVyeSh2YWx1ZSk7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGlvbiAmJiB0aGF0LmN1cnJlbnRWYWx1ZSAhPT0gcXVlcnkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGlvbiA9IG51bGw7XG4gICAgICAgICAgICAgICAgKG9wdGlvbnMub25JbnZhbGlkYXRlU2VsZWN0aW9uIHx8ICQubm9vcCkuY2FsbCh0aGF0LmVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XG4gICAgICAgICAgICB0aGF0LmN1cnJlbnRWYWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGV4aXN0aW5nIHN1Z2dlc3Rpb24gZm9yIHRoZSBtYXRjaCBiZWZvcmUgcHJvY2VlZGluZzpcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQgJiYgdGhhdC5pc0V4YWN0TWF0Y2gocXVlcnkpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QoMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocXVlcnkubGVuZ3RoIDwgb3B0aW9ucy5taW5DaGFycykge1xuICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGF0LmdldFN1Z2dlc3Rpb25zKHF1ZXJ5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBpc0V4YWN0TWF0Y2g6IGZ1bmN0aW9uIChxdWVyeSkge1xuICAgICAgICAgICAgdmFyIHN1Z2dlc3Rpb25zID0gdGhpcy5zdWdnZXN0aW9ucztcblxuICAgICAgICAgICAgcmV0dXJuIChzdWdnZXN0aW9ucy5sZW5ndGggPT09IDEgJiYgc3VnZ2VzdGlvbnNbMF0udmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gcXVlcnkudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0UXVlcnk6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGRlbGltaXRlciA9IHRoaXMub3B0aW9ucy5kZWxpbWl0ZXIsXG4gICAgICAgICAgICAgICAgcGFydHM7XG5cbiAgICAgICAgICAgIGlmICghZGVsaW1pdGVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFydHMgPSB2YWx1ZS5zcGxpdChkZWxpbWl0ZXIpO1xuICAgICAgICAgICAgcmV0dXJuICQudHJpbShwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0U3VnZ2VzdGlvbnNMb2NhbDogZnVuY3Rpb24gKHF1ZXJ5KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBxdWVyeUxvd2VyQ2FzZSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCksXG4gICAgICAgICAgICAgICAgZmlsdGVyID0gb3B0aW9ucy5sb29rdXBGaWx0ZXIsXG4gICAgICAgICAgICAgICAgbGltaXQgPSBwYXJzZUludChvcHRpb25zLmxvb2t1cExpbWl0LCAxMCksXG4gICAgICAgICAgICAgICAgZGF0YTtcblxuICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9uczogJC5ncmVwKG9wdGlvbnMubG9va3VwLCBmdW5jdGlvbiAoc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmlsdGVyKHN1Z2dlc3Rpb24sIHF1ZXJ5LCBxdWVyeUxvd2VyQ2FzZSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChsaW1pdCAmJiBkYXRhLnN1Z2dlc3Rpb25zLmxlbmd0aCA+IGxpbWl0KSB7XG4gICAgICAgICAgICAgICAgZGF0YS5zdWdnZXN0aW9ucyA9IGRhdGEuc3VnZ2VzdGlvbnMuc2xpY2UoMCwgbGltaXQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTdWdnZXN0aW9uczogZnVuY3Rpb24gKHEpIHtcbiAgICAgICAgICAgIHZhciByZXNwb25zZSxcbiAgICAgICAgICAgICAgICB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIHNlcnZpY2VVcmwgPSBvcHRpb25zLnNlcnZpY2VVcmwsXG4gICAgICAgICAgICAgICAgcGFyYW1zLFxuICAgICAgICAgICAgICAgIGNhY2hlS2V5LFxuICAgICAgICAgICAgICAgIGFqYXhTZXR0aW5ncztcblxuICAgICAgICAgICAgb3B0aW9ucy5wYXJhbXNbb3B0aW9ucy5wYXJhbU5hbWVdID0gcTtcbiAgICAgICAgICAgIHBhcmFtcyA9IG9wdGlvbnMuaWdub3JlUGFyYW1zID8gbnVsbCA6IG9wdGlvbnMucGFyYW1zO1xuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5vblNlYXJjaFN0YXJ0LmNhbGwodGhhdC5lbGVtZW50LCBvcHRpb25zLnBhcmFtcykgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKG9wdGlvbnMubG9va3VwKSl7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5sb29rdXAocSwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IGRhdGEuc3VnZ2VzdGlvbnM7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIGRhdGEuc3VnZ2VzdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoYXQuaXNMb2NhbCkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gdGhhdC5nZXRTdWdnZXN0aW9uc0xvY2FsKHEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKHNlcnZpY2VVcmwpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VVcmwgPSBzZXJ2aWNlVXJsLmNhbGwodGhhdC5lbGVtZW50LCBxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FjaGVLZXkgPSBzZXJ2aWNlVXJsICsgJz8nICsgJC5wYXJhbShwYXJhbXMgfHwge30pO1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gdGhhdC5jYWNoZWRSZXNwb25zZVtjYWNoZUtleV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChyZXNwb25zZSAmJiAkLmlzQXJyYXkocmVzcG9uc2Uuc3VnZ2VzdGlvbnMpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IHJlc3BvbnNlLnN1Z2dlc3Rpb25zO1xuICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xuICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgcmVzcG9uc2Uuc3VnZ2VzdGlvbnMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghdGhhdC5pc0JhZFF1ZXJ5KHEpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5hYm9ydEFqYXgoKTtcblxuICAgICAgICAgICAgICAgIGFqYXhTZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBzZXJ2aWNlVXJsLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBwYXJhbXMsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IG9wdGlvbnMudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IG9wdGlvbnMuZGF0YVR5cGVcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgJC5leHRlbmQoYWpheFNldHRpbmdzLCBvcHRpb25zLmFqYXhTZXR0aW5ncyk7XG5cbiAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0ID0gJC5hamF4KGFqYXhTZXR0aW5ncykuZG9uZShmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gb3B0aW9ucy50cmFuc2Zvcm1SZXN1bHQoZGF0YSwgcSk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQucHJvY2Vzc1Jlc3BvbnNlKHJlc3VsdCwgcSwgY2FjaGVLZXkpO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIHJlc3VsdC5zdWdnZXN0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSkuZmFpbChmdW5jdGlvbiAoanFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hFcnJvci5jYWxsKHRoYXQuZWxlbWVudCwgcSwganFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaENvbXBsZXRlLmNhbGwodGhhdC5lbGVtZW50LCBxLCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNCYWRRdWVyeTogZnVuY3Rpb24gKHEpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5vcHRpb25zLnByZXZlbnRCYWRRdWVyaWVzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBiYWRRdWVyaWVzID0gdGhpcy5iYWRRdWVyaWVzLFxuICAgICAgICAgICAgICAgIGkgPSBiYWRRdWVyaWVzLmxlbmd0aDtcblxuICAgICAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgICAgICAgIGlmIChxLmluZGV4T2YoYmFkUXVlcmllc1tpXSkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGlkZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcik7XG5cbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24odGhhdC5vcHRpb25zLm9uSGlkZSkgJiYgdGhhdC52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5vcHRpb25zLm9uSGlkZS5jYWxsKHRoYXQuZWxlbWVudCwgY29udGFpbmVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcbiAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuaGlkZSgpO1xuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHN1Z2dlc3Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnN1Z2dlc3Rpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2hvd05vU3VnZ2VzdGlvbk5vdGljZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vU3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBncm91cEJ5ID0gb3B0aW9ucy5ncm91cEJ5LFxuICAgICAgICAgICAgICAgIGZvcm1hdFJlc3VsdCA9IG9wdGlvbnMuZm9ybWF0UmVzdWx0LFxuICAgICAgICAgICAgICAgIHZhbHVlID0gdGhhdC5nZXRRdWVyeSh0aGF0LmN1cnJlbnRWYWx1ZSksXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gdGhhdC5jbGFzc2VzLnN1Z2dlc3Rpb24sXG4gICAgICAgICAgICAgICAgY2xhc3NTZWxlY3RlZCA9IHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCxcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxuICAgICAgICAgICAgICAgIG5vU3VnZ2VzdGlvbnNDb250YWluZXIgPSAkKHRoYXQubm9TdWdnZXN0aW9uc0NvbnRhaW5lciksXG4gICAgICAgICAgICAgICAgYmVmb3JlUmVuZGVyID0gb3B0aW9ucy5iZWZvcmVSZW5kZXIsXG4gICAgICAgICAgICAgICAgaHRtbCA9ICcnLFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5LFxuICAgICAgICAgICAgICAgIGZvcm1hdEdyb3VwID0gZnVuY3Rpb24gKHN1Z2dlc3Rpb24sIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudENhdGVnb3J5ID0gc3VnZ2VzdGlvbi5kYXRhW2dyb3VwQnldO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2F0ZWdvcnkgPT09IGN1cnJlbnRDYXRlZ29yeSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeSA9IGN1cnJlbnRDYXRlZ29yeTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiYXV0b2NvbXBsZXRlLWdyb3VwXCI+PHN0cm9uZz4nICsgY2F0ZWdvcnkgKyAnPC9zdHJvbmc+PC9kaXY+JztcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dCAmJiB0aGF0LmlzRXhhY3RNYXRjaCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCgwKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEJ1aWxkIHN1Z2dlc3Rpb25zIGlubmVyIEhUTUw6XG4gICAgICAgICAgICAkLmVhY2godGhhdC5zdWdnZXN0aW9ucywgZnVuY3Rpb24gKGksIHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoZ3JvdXBCeSl7XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gZm9ybWF0R3JvdXAoc3VnZ2VzdGlvbiwgdmFsdWUsIGkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCInICsgY2xhc3NOYW1lICsgJ1wiIGRhdGEtaW5kZXg9XCInICsgaSArICdcIj4nICsgZm9ybWF0UmVzdWx0KHN1Z2dlc3Rpb24sIHZhbHVlKSArICc8L2Rpdj4nO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuYWRqdXN0Q29udGFpbmVyV2lkdGgoKTtcblxuICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lci5kZXRhY2goKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5odG1sKGh0bWwpO1xuXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKGJlZm9yZVJlbmRlcikpIHtcbiAgICAgICAgICAgICAgICBiZWZvcmVSZW5kZXIuY2FsbCh0aGF0LmVsZW1lbnQsIGNvbnRhaW5lcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5zaG93KCk7XG5cbiAgICAgICAgICAgIC8vIFNlbGVjdCBmaXJzdCB2YWx1ZSBieSBkZWZhdWx0OlxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuYXV0b1NlbGVjdEZpcnN0KSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wKDApO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jaGlsZHJlbignLicgKyBjbGFzc05hbWUpLmZpcnN0KCkuYWRkQ2xhc3MoY2xhc3NTZWxlY3RlZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQudmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICB0aGF0LmZpbmRCZXN0SGludCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG5vU3VnZ2VzdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKSxcbiAgICAgICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQodGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgdGhpcy5hZGp1c3RDb250YWluZXJXaWR0aCgpO1xuXG4gICAgICAgICAgICAvLyBTb21lIGV4cGxpY2l0IHN0ZXBzLiBCZSBjYXJlZnVsIGhlcmUgYXMgaXQgZWFzeSB0byBnZXRcbiAgICAgICAgICAgIC8vIG5vU3VnZ2VzdGlvbnNDb250YWluZXIgcmVtb3ZlZCBmcm9tIERPTSBpZiBub3QgZGV0YWNoZWQgcHJvcGVybHkuXG4gICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyLmRldGFjaCgpO1xuICAgICAgICAgICAgY29udGFpbmVyLmVtcHR5KCk7IC8vIGNsZWFuIHN1Z2dlc3Rpb25zIGlmIGFueVxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZChub1N1Z2dlc3Rpb25zQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xuXG4gICAgICAgICAgICBjb250YWluZXIuc2hvdygpO1xuICAgICAgICAgICAgdGhhdC52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGp1c3RDb250YWluZXJXaWR0aDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICB3aWR0aCxcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpO1xuXG4gICAgICAgICAgICAvLyBJZiB3aWR0aCBpcyBhdXRvLCBhZGp1c3Qgd2lkdGggYmVmb3JlIGRpc3BsYXlpbmcgc3VnZ2VzdGlvbnMsXG4gICAgICAgICAgICAvLyBiZWNhdXNlIGlmIGluc3RhbmNlIHdhcyBjcmVhdGVkIGJlZm9yZSBpbnB1dCBoYWQgd2lkdGgsIGl0IHdpbGwgYmUgemVyby5cbiAgICAgICAgICAgIC8vIEFsc28gaXQgYWRqdXN0cyBpZiBpbnB1dCB3aWR0aCBoYXMgY2hhbmdlZC5cbiAgICAgICAgICAgIC8vIC0ycHggdG8gYWNjb3VudCBmb3Igc3VnZ2VzdGlvbnMgYm9yZGVyLlxuICAgICAgICAgICAgaWYgKG9wdGlvbnMud2lkdGggPT09ICdhdXRvJykge1xuICAgICAgICAgICAgICAgIHdpZHRoID0gdGhhdC5lbC5vdXRlcldpZHRoKCkgLSAyO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci53aWR0aCh3aWR0aCA+IDAgPyB3aWR0aCA6IDMwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZmluZEJlc3RIaW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGF0LmVsLnZhbCgpLnRvTG93ZXJDYXNlKCksXG4gICAgICAgICAgICAgICAgYmVzdE1hdGNoID0gbnVsbDtcblxuICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJC5lYWNoKHRoYXQuc3VnZ2VzdGlvbnMsIGZ1bmN0aW9uIChpLCBzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZvdW5kTWF0Y2ggPSBzdWdnZXN0aW9uLnZhbHVlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZih2YWx1ZSkgPT09IDA7XG4gICAgICAgICAgICAgICAgaWYgKGZvdW5kTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoID0gc3VnZ2VzdGlvbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuICFmb3VuZE1hdGNoO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoYXQuc2lnbmFsSGludChiZXN0TWF0Y2gpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNpZ25hbEhpbnQ6IGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgaGludFZhbHVlID0gJycsXG4gICAgICAgICAgICAgICAgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICBpZiAoc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgICAgIGhpbnRWYWx1ZSA9IHRoYXQuY3VycmVudFZhbHVlICsgc3VnZ2VzdGlvbi52YWx1ZS5zdWJzdHIodGhhdC5jdXJyZW50VmFsdWUubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGF0LmhpbnRWYWx1ZSAhPT0gaGludFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5oaW50VmFsdWUgPSBoaW50VmFsdWU7XG4gICAgICAgICAgICAgICAgdGhhdC5oaW50ID0gc3VnZ2VzdGlvbjtcbiAgICAgICAgICAgICAgICAodGhpcy5vcHRpb25zLm9uSGludCB8fCAkLm5vb3ApKGhpbnRWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmVyaWZ5U3VnZ2VzdGlvbnNGb3JtYXQ6IGZ1bmN0aW9uIChzdWdnZXN0aW9ucykge1xuICAgICAgICAgICAgLy8gSWYgc3VnZ2VzdGlvbnMgaXMgc3RyaW5nIGFycmF5LCBjb252ZXJ0IHRoZW0gdG8gc3VwcG9ydGVkIGZvcm1hdDpcbiAgICAgICAgICAgIGlmIChzdWdnZXN0aW9ucy5sZW5ndGggJiYgdHlwZW9mIHN1Z2dlc3Rpb25zWzBdID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHJldHVybiAkLm1hcChzdWdnZXN0aW9ucywgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiB2YWx1ZSwgZGF0YTogbnVsbCB9O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbnM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmFsaWRhdGVPcmllbnRhdGlvbjogZnVuY3Rpb24ob3JpZW50YXRpb24sIGZhbGxiYWNrKSB7XG4gICAgICAgICAgICBvcmllbnRhdGlvbiA9ICQudHJpbShvcmllbnRhdGlvbiB8fCAnJykudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAgICAgaWYoJC5pbkFycmF5KG9yaWVudGF0aW9uLCBbJ2F1dG8nLCAnYm90dG9tJywgJ3RvcCddKSA9PT0gLTEpe1xuICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uID0gZmFsbGJhY2s7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBvcmllbnRhdGlvbjtcbiAgICAgICAgfSxcblxuICAgICAgICBwcm9jZXNzUmVzcG9uc2U6IGZ1bmN0aW9uIChyZXN1bHQsIG9yaWdpbmFsUXVlcnksIGNhY2hlS2V5KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucztcblxuICAgICAgICAgICAgcmVzdWx0LnN1Z2dlc3Rpb25zID0gdGhhdC52ZXJpZnlTdWdnZXN0aW9uc0Zvcm1hdChyZXN1bHQuc3VnZ2VzdGlvbnMpO1xuXG4gICAgICAgICAgICAvLyBDYWNoZSByZXN1bHRzIGlmIGNhY2hlIGlzIG5vdCBkaXNhYmxlZDpcbiAgICAgICAgICAgIGlmICghb3B0aW9ucy5ub0NhY2hlKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5jYWNoZWRSZXNwb25zZVtjYWNoZUtleV0gPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMucHJldmVudEJhZFF1ZXJpZXMgJiYgcmVzdWx0LnN1Z2dlc3Rpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmJhZFF1ZXJpZXMucHVzaChvcmlnaW5hbFF1ZXJ5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFJldHVybiBpZiBvcmlnaW5hbFF1ZXJ5IGlzIG5vdCBtYXRjaGluZyBjdXJyZW50IHF1ZXJ5OlxuICAgICAgICAgICAgaWYgKG9yaWdpbmFsUXVlcnkgIT09IHRoYXQuZ2V0UXVlcnkodGhhdC5jdXJyZW50VmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gcmVzdWx0LnN1Z2dlc3Rpb25zO1xuICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWN0aXZhdGU6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGFjdGl2ZUl0ZW0sXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSB0aGF0LmNsYXNzZXMuc2VsZWN0ZWQsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKSxcbiAgICAgICAgICAgICAgICBjaGlsZHJlbiA9IGNvbnRhaW5lci5maW5kKCcuJyArIHRoYXQuY2xhc3Nlcy5zdWdnZXN0aW9uKTtcblxuICAgICAgICAgICAgY29udGFpbmVyLmZpbmQoJy4nICsgc2VsZWN0ZWQpLnJlbW92ZUNsYXNzKHNlbGVjdGVkKTtcblxuICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gaW5kZXg7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggIT09IC0xICYmIGNoaWxkcmVuLmxlbmd0aCA+IHRoYXQuc2VsZWN0ZWRJbmRleCkge1xuICAgICAgICAgICAgICAgIGFjdGl2ZUl0ZW0gPSBjaGlsZHJlbi5nZXQodGhhdC5zZWxlY3RlZEluZGV4KTtcbiAgICAgICAgICAgICAgICAkKGFjdGl2ZUl0ZW0pLmFkZENsYXNzKHNlbGVjdGVkKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYWN0aXZlSXRlbTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VsZWN0SGludDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGkgPSAkLmluQXJyYXkodGhhdC5oaW50LCB0aGF0LnN1Z2dlc3Rpb25zKTtcblxuICAgICAgICAgICAgdGhhdC5zZWxlY3QoaSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VsZWN0OiBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICB0aGF0Lm9uU2VsZWN0KGkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1vdmVVcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuY2hpbGRyZW4oKS5maXJzdCgpLnJlbW92ZUNsYXNzKHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCk7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XG4gICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xuICAgICAgICAgICAgICAgIHRoYXQuZmluZEJlc3RIaW50KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LmFkanVzdFNjcm9sbCh0aGF0LnNlbGVjdGVkSW5kZXggLSAxKTtcbiAgICAgICAgfSxcblxuICAgICAgICBtb3ZlRG93bjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAodGhhdC5zdWdnZXN0aW9ucy5sZW5ndGggLSAxKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5hZGp1c3RTY3JvbGwodGhhdC5zZWxlY3RlZEluZGV4ICsgMSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRqdXN0U2Nyb2xsOiBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBhY3RpdmVJdGVtID0gdGhhdC5hY3RpdmF0ZShpbmRleCk7XG5cbiAgICAgICAgICAgIGlmICghYWN0aXZlSXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG9mZnNldFRvcCxcbiAgICAgICAgICAgICAgICB1cHBlckJvdW5kLFxuICAgICAgICAgICAgICAgIGxvd2VyQm91bmQsXG4gICAgICAgICAgICAgICAgaGVpZ2h0RGVsdGEgPSAkKGFjdGl2ZUl0ZW0pLm91dGVySGVpZ2h0KCk7XG5cbiAgICAgICAgICAgIG9mZnNldFRvcCA9IGFjdGl2ZUl0ZW0ub2Zmc2V0VG9wO1xuICAgICAgICAgICAgdXBwZXJCb3VuZCA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuc2Nyb2xsVG9wKCk7XG4gICAgICAgICAgICBsb3dlckJvdW5kID0gdXBwZXJCb3VuZCArIHRoYXQub3B0aW9ucy5tYXhIZWlnaHQgLSBoZWlnaHREZWx0YTtcblxuICAgICAgICAgICAgaWYgKG9mZnNldFRvcCA8IHVwcGVyQm91bmQpIHtcbiAgICAgICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnNjcm9sbFRvcChvZmZzZXRUb3ApO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvZmZzZXRUb3AgPiBsb3dlckJvdW5kKSB7XG4gICAgICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5zY3JvbGxUb3Aob2Zmc2V0VG9wIC0gdGhhdC5vcHRpb25zLm1heEhlaWdodCArIGhlaWdodERlbHRhKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF0aGF0Lm9wdGlvbnMucHJlc2VydmVJbnB1dCkge1xuICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuZ2V0VmFsdWUodGhhdC5zdWdnZXN0aW9uc1tpbmRleF0udmFsdWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoYXQuc2lnbmFsSGludChudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblNlbGVjdDogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb25TZWxlY3RDYWxsYmFjayA9IHRoYXQub3B0aW9ucy5vblNlbGVjdCxcbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9uID0gdGhhdC5zdWdnZXN0aW9uc1tpbmRleF07XG5cbiAgICAgICAgICAgIHRoYXQuY3VycmVudFZhbHVlID0gdGhhdC5nZXRWYWx1ZShzdWdnZXN0aW9uLnZhbHVlKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuY3VycmVudFZhbHVlICE9PSB0aGF0LmVsLnZhbCgpICYmICF0aGF0Lm9wdGlvbnMucHJlc2VydmVJbnB1dCkge1xuICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KG51bGwpO1xuICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IFtdO1xuICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb24gPSBzdWdnZXN0aW9uO1xuXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKG9uU2VsZWN0Q2FsbGJhY2spKSB7XG4gICAgICAgICAgICAgICAgb25TZWxlY3RDYWxsYmFjay5jYWxsKHRoYXQuZWxlbWVudCwgc3VnZ2VzdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0VmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGRlbGltaXRlciA9IHRoYXQub3B0aW9ucy5kZWxpbWl0ZXIsXG4gICAgICAgICAgICAgICAgY3VycmVudFZhbHVlLFxuICAgICAgICAgICAgICAgIHBhcnRzO1xuXG4gICAgICAgICAgICBpZiAoIWRlbGltaXRlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3VycmVudFZhbHVlID0gdGhhdC5jdXJyZW50VmFsdWU7XG4gICAgICAgICAgICBwYXJ0cyA9IGN1cnJlbnRWYWx1ZS5zcGxpdChkZWxpbWl0ZXIpO1xuXG4gICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gY3VycmVudFZhbHVlLnN1YnN0cigwLCBjdXJyZW50VmFsdWUubGVuZ3RoIC0gcGFydHNbcGFydHMubGVuZ3RoIC0gMV0ubGVuZ3RoKSArIHZhbHVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc3Bvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHRoYXQuZWwub2ZmKCcuYXV0b2NvbXBsZXRlJykucmVtb3ZlRGF0YSgnYXV0b2NvbXBsZXRlJyk7XG4gICAgICAgICAgICB0aGF0LmRpc2FibGVLaWxsZXJGbigpO1xuICAgICAgICAgICAgJCh3aW5kb3cpLm9mZigncmVzaXplLmF1dG9jb21wbGV0ZScsIHRoYXQuZml4UG9zaXRpb25DYXB0dXJlKTtcbiAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQ3JlYXRlIGNoYWluYWJsZSBqUXVlcnkgcGx1Z2luOlxuICAgICQuZm4uYXV0b2NvbXBsZXRlID0gJC5mbi5kZXZicmlkZ2VBdXRvY29tcGxldGUgPSBmdW5jdGlvbiAob3B0aW9ucywgYXJncykge1xuICAgICAgICB2YXIgZGF0YUtleSA9ICdhdXRvY29tcGxldGUnO1xuICAgICAgICAvLyBJZiBmdW5jdGlvbiBpbnZva2VkIHdpdGhvdXQgYXJndW1lbnQgcmV0dXJuXG4gICAgICAgIC8vIGluc3RhbmNlIG9mIHRoZSBmaXJzdCBtYXRjaGVkIGVsZW1lbnQ6XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maXJzdCgpLmRhdGEoZGF0YUtleSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBpbnB1dEVsZW1lbnQgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgIGluc3RhbmNlID0gaW5wdXRFbGVtZW50LmRhdGEoZGF0YUtleSk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UgJiYgdHlwZW9mIGluc3RhbmNlW29wdGlvbnNdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlW29wdGlvbnNdKGFyZ3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgaW5zdGFuY2UgYWxyZWFkeSBleGlzdHMsIGRlc3Ryb3kgaXQ6XG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlICYmIGluc3RhbmNlLmRpc3Bvc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UuZGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IG5ldyBBdXRvY29tcGxldGUodGhpcywgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgaW5wdXRFbGVtZW50LmRhdGEoZGF0YUtleSwgaW5zdGFuY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xufSkpO1xuIiwiKGZ1bmN0aW9uICh3aW5kb3csIGRvY3VtZW50KSB7XG5cbiAgICB2YXIgQ2hlY2tlciA9IHtcbiAgICAgICAgY29va2llc0VuYWJsZWQ6IGZhbHNlLFxuICAgICAgICBhZGJsb2NrRW5hYmxlZDogZmFsc2UsXG5cbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgc2hvd1BvcHVwOiB0cnVlLFxuICAgICAgICAgICAgYWxsb3dDbG9zZTogZmFsc2UsXG4gICAgICAgICAgICBsYW5nOiAncnUnXG4gICAgICAgIH0sXG5cbiAgICAgICAgaHJlZjonYWJwOnN1YnNjcmliZT9sb2NhdGlvbj1odHRwczovL3NlY3JldGRpc2NvdW50ZXIucnUvYWRibG9jay50eHQmdGl0bGU9c2VjcmV0ZGlzY291bnRlcicsXG4gICAgICAgIGxhbmdUZXh0OiB7XG4gICAgICAgICAgICBydToge1xuICAgICAgICAgICAgICAgIHRpdGxlOiAn0JLQndCY0JzQkNCd0JjQlTogPHNwYW4gc3R5bGU9XCJjb2xvcjpyZWQ7XCI+0JLQsNGIINC60Y3RiNCx0Y3QuiDQvdC1INC+0YLRgdC70LXQttC40LLQsNC10YLRgdGPITwvc3Bhbj4nLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAn0J3QsNGB0YLRgNC+0LnQutC4INCy0LDRiNC10LPQviDQsdGA0LDRg9C30LXRgNCwINC90LUg0L/QvtC30LLQvtC70Y/RjtGCINC40YHQv9C+0LvRjNC30L7QstCw0YLRjCDRhNCw0LnQu9GLIGNvb2tpZXMsINCx0LXQtyDQutC+0YLQvtGA0YvRhSDQvdC10LLQvtC30LzQvtC20L3QviDQvtGC0YHQu9C10LTQuNGC0Ywg0LLQsNGIINC60Y3RiNCx0Y3QuiDQuNC70Lgg0LjRgdC/0L7Qu9GM0LfQvtCy0LDRgtGMINC/0YDQvtC80L7QutC+0LQsINCy0L7Qt9C80L7QttC90Ysg0Lgg0LTRgNGD0LPQuNC1INC+0YjQuNCx0LrQuC4nLFxuICAgICAgICAgICAgICAgIGxpc3RUaXRsZTogJ9Cf0YDQvtCx0LvQtdC80LAg0LzQvtC20LXRgiDQsdGL0YLRjCDQstGL0LfQstCw0L3QsDonLFxuICAgICAgICAgICAgICAgIGJ1dHRvbjogJ9Cd0LDRgdGC0YDQvtC40YLRjCBBZGJsb2NrJyxcbiAgICAgICAgICAgICAgICBicm93c2VyU2V0dGluZ3M6ICc8aDQ+0J3QsNGB0YLRgNC+0LnQutCw0LzQuCDQstCw0YjQtdCz0L4g0LHRgNCw0YPQt9C10YDQsDwvaDQ+ICcgK1xuICAgICAgICAgICAgICAgICc8cD7Ql9Cw0LnQtNC40YLQtSDQsiDQvdCw0YHRgtGA0L7QudC60Lgg0LHRgNCw0YPQt9C10YDQsCDQuCDRgNCw0LfRgNC10YjQuNGC0LUg0LjRgdC/0L7Qu9GM0LfQvtCy0LDQvdC40LUg0YTQsNC50LvQvtCyIGNvb2tpZS4gPC9wPicsXG4gICAgICAgICAgICAgICAgYWRibG9ja1NldHRpbmdzOiAnPGg0PtCh0YLQvtGA0L7QvdC90LjQvCDRgNCw0YHRiNC40YDQtdC90LjQtdC8INGC0LjQv9CwIEFkQmxvY2s8L2g0PiAnICtcbiAgICAgICAgICAgICAgICAnPHA+0J/RgNC+0YHRgtC+INC00L7QsdCw0LLRjNGC0LUg0L3QsNGIINGB0LDQudGCINCyIDxhIGhyZWY9XCJfX19hZGJsb2NrTGlua19fX1wiPtCx0LXQu9GL0Lkg0YHQv9C40YHQvtC6PC9hPiDQsiDQvdCw0YHRgtGA0L7QudC60LDRhSBBZEJsb2NrLiA8L3A+J1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcblxuICAgICAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuaXNNb2JpbGU9ISFpc01vYmlsZS5hbnkoKTtcbiAgICAgICAgICAgIHRoaXMudGVzdENvb2tpZXMoKTtcbiAgICAgICAgICAgIGlmKHRoaXMuaXNNb2JpbGUgJiYgIXRoaXMuY29va2llc0VuYWJsZWQpe1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1BvcHVwKCk7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICB0aGlzLnRlc3RBZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB0ZXN0Q29va2llczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2V0Q29va2llKCd0ZXN0V29yaycsJ3Rlc3QnKTtcbiAgICAgICAgICAgIHRoaXMuY29va2llc0VuYWJsZWQgPSAoZ2V0Q29va2llKCd0ZXN0V29yaycpPT0ndGVzdCcpO1xuICAgICAgICB9LFxuICAgICAgICB0ZXN0QWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciAkYWREZXRlY3QgPSAkKCcuYWQtZGV0ZWN0OnZpc2libGUnKS5sZW5ndGg7XG4gICAgICAgICAgICB0aGlzLmFkYmxvY2tFbmFibGVkID0gKCRhZERldGVjdD4wKTtcblxuICAgICAgICAgICAgaWYoKCF0aGlzLmFkYmxvY2tFbmFibGVkIHx8ICF0aGlzLmNvb2tpZXNFbmFibGVkKSAmJiAhZ2V0Q29va2llKCdhZEJsb2NrU2hvdycpKXtcbiAgICAgICAgICAgICAgICBzZXRDb29raWUoJ2FkQmxvY2tTaG93Jywnc2hvdycpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1BvcHVwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHNob3dQb3B1cDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KHRoaXMuc2hvd1BvcC5iaW5kKHRoaXMpLDUwMCk7XG4gICAgICAgIH0sXG4gICAgICAgIHNob3dQb3A6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGxhbmcgPSB0aGlzLmxhbmdUZXh0LnJ1O1xuICAgICAgICAgICAgdmFyIHRleHQ9Jyc7XG5cblxuICAgICAgICAgICAgdGV4dCs9JzxoMyBzdHlsZT1cInRleHQtYWxpZ246IGNlbnRlcjtmb250LXdlaWdodDogYm9sZDtcIj4nO1xuICAgICAgICAgICAgdGV4dCs9bGFuZy50aXRsZTtcbiAgICAgICAgICAgIHRleHQrPSc8L2gzPic7XG4gICAgICAgICAgICB0ZXh0Kz0nPHA+JztcbiAgICAgICAgICAgIHRleHQrPWxhbmcuZGVzY3JpcHRpb247XG4gICAgICAgICAgICB0ZXh0Kz0nPC9wPic7XG4gICAgICAgICAgICB0ZXh0Kz0nPGgzPic7XG4gICAgICAgICAgICB0ZXh0Kz1sYW5nLmxpc3RUaXRsZTtcbiAgICAgICAgICAgIHRleHQrPSc8L2gzPic7XG4gICAgICAgICAgICB0ZXh0Kz0nPGRpdiBjbGFzcz1cImFkX3JlY29tZW5kIGhlbHAtbXNnXCI+JztcbiAgICAgICAgICAgIHRleHQrPSc8ZGl2PicrbGFuZy5icm93c2VyU2V0dGluZ3MrJzwvZGl2Pic7XG4gICAgICAgICAgICB0ZXh0Kz0nPGRpdj4nK2xhbmcuYWRibG9ja1NldHRpbmdzKyc8L2Rpdj4nO1xuICAgICAgICAgICAgdGV4dCs9JzwvZGl2Pic7XG5cbiAgICAgICAgICAgIHRleHQ9dGV4dC5yZXBsYWNlKCdfX19hZGJsb2NrTGlua19fXycsdGhpcy5ocmVmKTtcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5hbGVydCh7XG4gICAgICAgICAgICAgICAgYnV0dG9uWWVzOmxhbmcuYnV0dG9uLFxuICAgICAgICAgICAgICAgIGJ1dHRvblRhZzonYScsXG4gICAgICAgICAgICAgICAgYnV0dG9uWWVzRG9wOidocmVmPVwiJyt0aGlzLmhyZWYrJ1wiJyxcbiAgICAgICAgICAgICAgICBub3R5ZnlfY2xhc3M6XCJub3RpZnlfd2hpdGVcIixcbiAgICAgICAgICAgICAgICBxdWVzdGlvbjogdGV4dCxcblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGlzTW9iaWxlID0ge1xuICAgICAgICBBbmRyb2lkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9BbmRyb2lkL2kpO1xuICAgICAgICB9LFxuICAgICAgICBCbGFja0JlcnJ5OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9CbGFja0JlcnJ5L2kpO1xuICAgICAgICB9LFxuICAgICAgICBpT1M6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL2lQaG9uZXxpUGFkfGlQb2QvaSk7XG4gICAgICAgIH0sXG4gICAgICAgIE9wZXJhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9PcGVyYSBNaW5pL2kpO1xuICAgICAgICB9LFxuICAgICAgICBXaW5kb3dzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9JRU1vYmlsZS9pKTtcbiAgICAgICAgfSxcbiAgICAgICAgYW55OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAoaXNNb2JpbGUuQW5kcm9pZCgpIHx8IGlzTW9iaWxlLkJsYWNrQmVycnkoKSB8fCBpc01vYmlsZS5pT1MoKSB8fCBpc01vYmlsZS5PcGVyYSgpIHx8IGlzTW9iaWxlLldpbmRvd3MoKSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGZ1bmN0aW9uIGdldENvb2tpZShuYW1lKSB7XG4gICAgICAgIHZhciBtYXRjaGVzID0gZG9jdW1lbnQuY29va2llLm1hdGNoKG5ldyBSZWdFeHAoXG4gICAgICAgICAgXCIoPzpefDsgKVwiICsgbmFtZS5yZXBsYWNlKC8oW1xcLiQ/Knx7fVxcKFxcKVxcW1xcXVxcXFxcXC9cXCteXSkvZywgJ1xcXFwkMScpICsgXCI9KFteO10qKVwiXG4gICAgICAgICkpO1xuICAgICAgICByZXR1cm4gbWF0Y2hlcyA/IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaGVzWzFdKSA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgZnVuY3Rpb24gc2V0Q29va2llKG5hbWUsIHZhbHVlLCBvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICAgIHZhciBleHBpcmVzID0gb3B0aW9ucy5leHBpcmVzO1xuXG4gICAgICAgIGlmICh0eXBlb2YgZXhwaXJlcyA9PSBcIm51bWJlclwiICYmIGV4cGlyZXMpIHtcbiAgICAgICAgICAgIHZhciBkID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIGQuc2V0VGltZShkLmdldFRpbWUoKSArIGV4cGlyZXMgKiAxMDAwKTtcbiAgICAgICAgICAgIGV4cGlyZXMgPSBvcHRpb25zLmV4cGlyZXMgPSBkO1xuICAgICAgICB9XG4gICAgICAgIGlmIChleHBpcmVzICYmIGV4cGlyZXMudG9VVENTdHJpbmcpIHtcbiAgICAgICAgICAgIG9wdGlvbnMuZXhwaXJlcyA9IGV4cGlyZXMudG9VVENTdHJpbmcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhbHVlID0gZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKTtcblxuICAgICAgICB2YXIgdXBkYXRlZENvb2tpZSA9IG5hbWUgKyBcIj1cIiArIHZhbHVlO1xuXG4gICAgICAgIGZvciAodmFyIHByb3BOYW1lIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHVwZGF0ZWRDb29raWUgKz0gXCI7IFwiICsgcHJvcE5hbWU7XG4gICAgICAgICAgICB2YXIgcHJvcFZhbHVlID0gb3B0aW9uc1twcm9wTmFtZV07XG4gICAgICAgICAgICBpZiAocHJvcFZhbHVlICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdXBkYXRlZENvb2tpZSArPSBcIj1cIiArIHByb3BWYWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IHVwZGF0ZWRDb29raWU7XG4gICAgfVxuICAgIENoZWNrZXIuaW5pdCgpO1xuICAgIC8vc2V0VGltZW91dChDaGVja2VyLmluaXQsMTAwKTtcbn0od2luZG93LCBkb2N1bWVudCkpOyIsIi8qISBTZWxlY3QyIDQuMC4zIHwgaHR0cHM6Ly9naXRodWIuY29tL3NlbGVjdDIvc2VsZWN0Mi9ibG9iL21hc3Rlci9MSUNFTlNFLm1kICovIWZ1bmN0aW9uKGEpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW1wianF1ZXJ5XCJdLGEpOmEoXCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHM/cmVxdWlyZShcImpxdWVyeVwiKTpqUXVlcnkpfShmdW5jdGlvbihhKXt2YXIgYj1mdW5jdGlvbigpe2lmKGEmJmEuZm4mJmEuZm4uc2VsZWN0MiYmYS5mbi5zZWxlY3QyLmFtZCl2YXIgYj1hLmZuLnNlbGVjdDIuYW1kO3ZhciBiO3JldHVybiBmdW5jdGlvbigpe2lmKCFifHwhYi5yZXF1aXJlanMpe2I/Yz1iOmI9e307dmFyIGEsYyxkOyFmdW5jdGlvbihiKXtmdW5jdGlvbiBlKGEsYil7cmV0dXJuIHUuY2FsbChhLGIpfWZ1bmN0aW9uIGYoYSxiKXt2YXIgYyxkLGUsZixnLGgsaSxqLGssbCxtLG49YiYmYi5zcGxpdChcIi9cIiksbz1zLm1hcCxwPW8mJm9bXCIqXCJdfHx7fTtpZihhJiZcIi5cIj09PWEuY2hhckF0KDApKWlmKGIpe2ZvcihhPWEuc3BsaXQoXCIvXCIpLGc9YS5sZW5ndGgtMSxzLm5vZGVJZENvbXBhdCYmdy50ZXN0KGFbZ10pJiYoYVtnXT1hW2ddLnJlcGxhY2UodyxcIlwiKSksYT1uLnNsaWNlKDAsbi5sZW5ndGgtMSkuY29uY2F0KGEpLGs9MDtrPGEubGVuZ3RoO2srPTEpaWYobT1hW2tdLFwiLlwiPT09bSlhLnNwbGljZShrLDEpLGstPTE7ZWxzZSBpZihcIi4uXCI9PT1tKXtpZigxPT09ayYmKFwiLi5cIj09PWFbMl18fFwiLi5cIj09PWFbMF0pKWJyZWFrO2s+MCYmKGEuc3BsaWNlKGstMSwyKSxrLT0yKX1hPWEuam9pbihcIi9cIil9ZWxzZSAwPT09YS5pbmRleE9mKFwiLi9cIikmJihhPWEuc3Vic3RyaW5nKDIpKTtpZigobnx8cCkmJm8pe2ZvcihjPWEuc3BsaXQoXCIvXCIpLGs9Yy5sZW5ndGg7az4wO2stPTEpe2lmKGQ9Yy5zbGljZSgwLGspLmpvaW4oXCIvXCIpLG4pZm9yKGw9bi5sZW5ndGg7bD4wO2wtPTEpaWYoZT1vW24uc2xpY2UoMCxsKS5qb2luKFwiL1wiKV0sZSYmKGU9ZVtkXSkpe2Y9ZSxoPWs7YnJlYWt9aWYoZilicmVhazshaSYmcCYmcFtkXSYmKGk9cFtkXSxqPWspfSFmJiZpJiYoZj1pLGg9aiksZiYmKGMuc3BsaWNlKDAsaCxmKSxhPWMuam9pbihcIi9cIikpfXJldHVybiBhfWZ1bmN0aW9uIGcoYSxjKXtyZXR1cm4gZnVuY3Rpb24oKXt2YXIgZD12LmNhbGwoYXJndW1lbnRzLDApO3JldHVyblwic3RyaW5nXCIhPXR5cGVvZiBkWzBdJiYxPT09ZC5sZW5ndGgmJmQucHVzaChudWxsKSxuLmFwcGx5KGIsZC5jb25jYXQoW2EsY10pKX19ZnVuY3Rpb24gaChhKXtyZXR1cm4gZnVuY3Rpb24oYil7cmV0dXJuIGYoYixhKX19ZnVuY3Rpb24gaShhKXtyZXR1cm4gZnVuY3Rpb24oYil7cVthXT1ifX1mdW5jdGlvbiBqKGEpe2lmKGUocixhKSl7dmFyIGM9clthXTtkZWxldGUgclthXSx0W2FdPSEwLG0uYXBwbHkoYixjKX1pZighZShxLGEpJiYhZSh0LGEpKXRocm93IG5ldyBFcnJvcihcIk5vIFwiK2EpO3JldHVybiBxW2FdfWZ1bmN0aW9uIGsoYSl7dmFyIGIsYz1hP2EuaW5kZXhPZihcIiFcIik6LTE7cmV0dXJuIGM+LTEmJihiPWEuc3Vic3RyaW5nKDAsYyksYT1hLnN1YnN0cmluZyhjKzEsYS5sZW5ndGgpKSxbYixhXX1mdW5jdGlvbiBsKGEpe3JldHVybiBmdW5jdGlvbigpe3JldHVybiBzJiZzLmNvbmZpZyYmcy5jb25maWdbYV18fHt9fX12YXIgbSxuLG8scCxxPXt9LHI9e30scz17fSx0PXt9LHU9T2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSx2PVtdLnNsaWNlLHc9L1xcLmpzJC87bz1mdW5jdGlvbihhLGIpe3ZhciBjLGQ9ayhhKSxlPWRbMF07cmV0dXJuIGE9ZFsxXSxlJiYoZT1mKGUsYiksYz1qKGUpKSxlP2E9YyYmYy5ub3JtYWxpemU/Yy5ub3JtYWxpemUoYSxoKGIpKTpmKGEsYik6KGE9ZihhLGIpLGQ9ayhhKSxlPWRbMF0sYT1kWzFdLGUmJihjPWooZSkpKSx7ZjplP2UrXCIhXCIrYTphLG46YSxwcjplLHA6Y319LHA9e3JlcXVpcmU6ZnVuY3Rpb24oYSl7cmV0dXJuIGcoYSl9LGV4cG9ydHM6ZnVuY3Rpb24oYSl7dmFyIGI9cVthXTtyZXR1cm5cInVuZGVmaW5lZFwiIT10eXBlb2YgYj9iOnFbYV09e319LG1vZHVsZTpmdW5jdGlvbihhKXtyZXR1cm57aWQ6YSx1cmk6XCJcIixleHBvcnRzOnFbYV0sY29uZmlnOmwoYSl9fX0sbT1mdW5jdGlvbihhLGMsZCxmKXt2YXIgaCxrLGwsbSxuLHMsdT1bXSx2PXR5cGVvZiBkO2lmKGY9Znx8YSxcInVuZGVmaW5lZFwiPT09dnx8XCJmdW5jdGlvblwiPT09dil7Zm9yKGM9IWMubGVuZ3RoJiZkLmxlbmd0aD9bXCJyZXF1aXJlXCIsXCJleHBvcnRzXCIsXCJtb2R1bGVcIl06YyxuPTA7bjxjLmxlbmd0aDtuKz0xKWlmKG09byhjW25dLGYpLGs9bS5mLFwicmVxdWlyZVwiPT09ayl1W25dPXAucmVxdWlyZShhKTtlbHNlIGlmKFwiZXhwb3J0c1wiPT09ayl1W25dPXAuZXhwb3J0cyhhKSxzPSEwO2Vsc2UgaWYoXCJtb2R1bGVcIj09PWspaD11W25dPXAubW9kdWxlKGEpO2Vsc2UgaWYoZShxLGspfHxlKHIsayl8fGUodCxrKSl1W25dPWooayk7ZWxzZXtpZighbS5wKXRocm93IG5ldyBFcnJvcihhK1wiIG1pc3NpbmcgXCIrayk7bS5wLmxvYWQobS5uLGcoZiwhMCksaShrKSx7fSksdVtuXT1xW2tdfWw9ZD9kLmFwcGx5KHFbYV0sdSk6dm9pZCAwLGEmJihoJiZoLmV4cG9ydHMhPT1iJiZoLmV4cG9ydHMhPT1xW2FdP3FbYV09aC5leHBvcnRzOmw9PT1iJiZzfHwocVthXT1sKSl9ZWxzZSBhJiYocVthXT1kKX0sYT1jPW49ZnVuY3Rpb24oYSxjLGQsZSxmKXtpZihcInN0cmluZ1wiPT10eXBlb2YgYSlyZXR1cm4gcFthXT9wW2FdKGMpOmoobyhhLGMpLmYpO2lmKCFhLnNwbGljZSl7aWYocz1hLHMuZGVwcyYmbihzLmRlcHMscy5jYWxsYmFjayksIWMpcmV0dXJuO2Muc3BsaWNlPyhhPWMsYz1kLGQ9bnVsbCk6YT1ifXJldHVybiBjPWN8fGZ1bmN0aW9uKCl7fSxcImZ1bmN0aW9uXCI9PXR5cGVvZiBkJiYoZD1lLGU9ZiksZT9tKGIsYSxjLGQpOnNldFRpbWVvdXQoZnVuY3Rpb24oKXttKGIsYSxjLGQpfSw0KSxufSxuLmNvbmZpZz1mdW5jdGlvbihhKXtyZXR1cm4gbihhKX0sYS5fZGVmaW5lZD1xLGQ9ZnVuY3Rpb24oYSxiLGMpe2lmKFwic3RyaW5nXCIhPXR5cGVvZiBhKXRocm93IG5ldyBFcnJvcihcIlNlZSBhbG1vbmQgUkVBRE1FOiBpbmNvcnJlY3QgbW9kdWxlIGJ1aWxkLCBubyBtb2R1bGUgbmFtZVwiKTtiLnNwbGljZXx8KGM9YixiPVtdKSxlKHEsYSl8fGUocixhKXx8KHJbYV09W2EsYixjXSl9LGQuYW1kPXtqUXVlcnk6ITB9fSgpLGIucmVxdWlyZWpzPWEsYi5yZXF1aXJlPWMsYi5kZWZpbmU9ZH19KCksYi5kZWZpbmUoXCJhbG1vbmRcIixmdW5jdGlvbigpe30pLGIuZGVmaW5lKFwianF1ZXJ5XCIsW10sZnVuY3Rpb24oKXt2YXIgYj1hfHwkO3JldHVybiBudWxsPT1iJiZjb25zb2xlJiZjb25zb2xlLmVycm9yJiZjb25zb2xlLmVycm9yKFwiU2VsZWN0MjogQW4gaW5zdGFuY2Ugb2YgalF1ZXJ5IG9yIGEgalF1ZXJ5LWNvbXBhdGlibGUgbGlicmFyeSB3YXMgbm90IGZvdW5kLiBNYWtlIHN1cmUgdGhhdCB5b3UgYXJlIGluY2x1ZGluZyBqUXVlcnkgYmVmb3JlIFNlbGVjdDIgb24geW91ciB3ZWIgcGFnZS5cIiksYn0pLGIuZGVmaW5lKFwic2VsZWN0Mi91dGlsc1wiLFtcImpxdWVyeVwiXSxmdW5jdGlvbihhKXtmdW5jdGlvbiBiKGEpe3ZhciBiPWEucHJvdG90eXBlLGM9W107Zm9yKHZhciBkIGluIGIpe3ZhciBlPWJbZF07XCJmdW5jdGlvblwiPT10eXBlb2YgZSYmXCJjb25zdHJ1Y3RvclwiIT09ZCYmYy5wdXNoKGQpfXJldHVybiBjfXZhciBjPXt9O2MuRXh0ZW5kPWZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYygpe3RoaXMuY29uc3RydWN0b3I9YX12YXIgZD17fS5oYXNPd25Qcm9wZXJ0eTtmb3IodmFyIGUgaW4gYilkLmNhbGwoYixlKSYmKGFbZV09YltlXSk7cmV0dXJuIGMucHJvdG90eXBlPWIucHJvdG90eXBlLGEucHJvdG90eXBlPW5ldyBjLGEuX19zdXBlcl9fPWIucHJvdG90eXBlLGF9LGMuRGVjb3JhdGU9ZnVuY3Rpb24oYSxjKXtmdW5jdGlvbiBkKCl7dmFyIGI9QXJyYXkucHJvdG90eXBlLnVuc2hpZnQsZD1jLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5sZW5ndGgsZT1hLnByb3RvdHlwZS5jb25zdHJ1Y3RvcjtkPjAmJihiLmNhbGwoYXJndW1lbnRzLGEucHJvdG90eXBlLmNvbnN0cnVjdG9yKSxlPWMucHJvdG90eXBlLmNvbnN0cnVjdG9yKSxlLmFwcGx5KHRoaXMsYXJndW1lbnRzKX1mdW5jdGlvbiBlKCl7dGhpcy5jb25zdHJ1Y3Rvcj1kfXZhciBmPWIoYyksZz1iKGEpO2MuZGlzcGxheU5hbWU9YS5kaXNwbGF5TmFtZSxkLnByb3RvdHlwZT1uZXcgZTtmb3IodmFyIGg9MDtoPGcubGVuZ3RoO2grKyl7dmFyIGk9Z1toXTtkLnByb3RvdHlwZVtpXT1hLnByb3RvdHlwZVtpXX1mb3IodmFyIGo9KGZ1bmN0aW9uKGEpe3ZhciBiPWZ1bmN0aW9uKCl7fTthIGluIGQucHJvdG90eXBlJiYoYj1kLnByb3RvdHlwZVthXSk7dmFyIGU9Yy5wcm90b3R5cGVbYV07cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIGE9QXJyYXkucHJvdG90eXBlLnVuc2hpZnQ7cmV0dXJuIGEuY2FsbChhcmd1bWVudHMsYiksZS5hcHBseSh0aGlzLGFyZ3VtZW50cyl9fSksaz0wO2s8Zi5sZW5ndGg7aysrKXt2YXIgbD1mW2tdO2QucHJvdG90eXBlW2xdPWoobCl9cmV0dXJuIGR9O3ZhciBkPWZ1bmN0aW9uKCl7dGhpcy5saXN0ZW5lcnM9e319O3JldHVybiBkLnByb3RvdHlwZS5vbj1mdW5jdGlvbihhLGIpe3RoaXMubGlzdGVuZXJzPXRoaXMubGlzdGVuZXJzfHx7fSxhIGluIHRoaXMubGlzdGVuZXJzP3RoaXMubGlzdGVuZXJzW2FdLnB1c2goYik6dGhpcy5saXN0ZW5lcnNbYV09W2JdfSxkLnByb3RvdHlwZS50cmlnZ2VyPWZ1bmN0aW9uKGEpe3ZhciBiPUFycmF5LnByb3RvdHlwZS5zbGljZSxjPWIuY2FsbChhcmd1bWVudHMsMSk7dGhpcy5saXN0ZW5lcnM9dGhpcy5saXN0ZW5lcnN8fHt9LG51bGw9PWMmJihjPVtdKSwwPT09Yy5sZW5ndGgmJmMucHVzaCh7fSksY1swXS5fdHlwZT1hLGEgaW4gdGhpcy5saXN0ZW5lcnMmJnRoaXMuaW52b2tlKHRoaXMubGlzdGVuZXJzW2FdLGIuY2FsbChhcmd1bWVudHMsMSkpLFwiKlwiaW4gdGhpcy5saXN0ZW5lcnMmJnRoaXMuaW52b2tlKHRoaXMubGlzdGVuZXJzW1wiKlwiXSxhcmd1bWVudHMpfSxkLnByb3RvdHlwZS5pbnZva2U9ZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9MCxkPWEubGVuZ3RoO2Q+YztjKyspYVtjXS5hcHBseSh0aGlzLGIpfSxjLk9ic2VydmFibGU9ZCxjLmdlbmVyYXRlQ2hhcnM9ZnVuY3Rpb24oYSl7Zm9yKHZhciBiPVwiXCIsYz0wO2E+YztjKyspe3ZhciBkPU1hdGguZmxvb3IoMzYqTWF0aC5yYW5kb20oKSk7Yis9ZC50b1N0cmluZygzNil9cmV0dXJuIGJ9LGMuYmluZD1mdW5jdGlvbihhLGIpe3JldHVybiBmdW5jdGlvbigpe2EuYXBwbHkoYixhcmd1bWVudHMpfX0sYy5fY29udmVydERhdGE9ZnVuY3Rpb24oYSl7Zm9yKHZhciBiIGluIGEpe3ZhciBjPWIuc3BsaXQoXCItXCIpLGQ9YTtpZigxIT09Yy5sZW5ndGgpe2Zvcih2YXIgZT0wO2U8Yy5sZW5ndGg7ZSsrKXt2YXIgZj1jW2VdO2Y9Zi5zdWJzdHJpbmcoMCwxKS50b0xvd2VyQ2FzZSgpK2Yuc3Vic3RyaW5nKDEpLGYgaW4gZHx8KGRbZl09e30pLGU9PWMubGVuZ3RoLTEmJihkW2ZdPWFbYl0pLGQ9ZFtmXX1kZWxldGUgYVtiXX19cmV0dXJuIGF9LGMuaGFzU2Nyb2xsPWZ1bmN0aW9uKGIsYyl7dmFyIGQ9YShjKSxlPWMuc3R5bGUub3ZlcmZsb3dYLGY9Yy5zdHlsZS5vdmVyZmxvd1k7cmV0dXJuIGUhPT1mfHxcImhpZGRlblwiIT09ZiYmXCJ2aXNpYmxlXCIhPT1mP1wic2Nyb2xsXCI9PT1lfHxcInNjcm9sbFwiPT09Zj8hMDpkLmlubmVySGVpZ2h0KCk8Yy5zY3JvbGxIZWlnaHR8fGQuaW5uZXJXaWR0aCgpPGMuc2Nyb2xsV2lkdGg6ITF9LGMuZXNjYXBlTWFya3VwPWZ1bmN0aW9uKGEpe3ZhciBiPXtcIlxcXFxcIjpcIiYjOTI7XCIsXCImXCI6XCImYW1wO1wiLFwiPFwiOlwiJmx0O1wiLFwiPlwiOlwiJmd0O1wiLCdcIic6XCImcXVvdDtcIixcIidcIjpcIiYjMzk7XCIsXCIvXCI6XCImIzQ3O1wifTtyZXR1cm5cInN0cmluZ1wiIT10eXBlb2YgYT9hOlN0cmluZyhhKS5yZXBsYWNlKC9bJjw+XCInXFwvXFxcXF0vZyxmdW5jdGlvbihhKXtyZXR1cm4gYlthXX0pfSxjLmFwcGVuZE1hbnk9ZnVuY3Rpb24oYixjKXtpZihcIjEuN1wiPT09YS5mbi5qcXVlcnkuc3Vic3RyKDAsMykpe3ZhciBkPWEoKTthLm1hcChjLGZ1bmN0aW9uKGEpe2Q9ZC5hZGQoYSl9KSxjPWR9Yi5hcHBlbmQoYyl9LGN9KSxiLmRlZmluZShcInNlbGVjdDIvcmVzdWx0c1wiLFtcImpxdWVyeVwiLFwiLi91dGlsc1wiXSxmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYSxiLGQpe3RoaXMuJGVsZW1lbnQ9YSx0aGlzLmRhdGE9ZCx0aGlzLm9wdGlvbnM9YixjLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMpfXJldHVybiBiLkV4dGVuZChjLGIuT2JzZXJ2YWJsZSksYy5wcm90b3R5cGUucmVuZGVyPWZ1bmN0aW9uKCl7dmFyIGI9YSgnPHVsIGNsYXNzPVwic2VsZWN0Mi1yZXN1bHRzX19vcHRpb25zXCIgcm9sZT1cInRyZWVcIj48L3VsPicpO3JldHVybiB0aGlzLm9wdGlvbnMuZ2V0KFwibXVsdGlwbGVcIikmJmIuYXR0cihcImFyaWEtbXVsdGlzZWxlY3RhYmxlXCIsXCJ0cnVlXCIpLHRoaXMuJHJlc3VsdHM9YixifSxjLnByb3RvdHlwZS5jbGVhcj1mdW5jdGlvbigpe3RoaXMuJHJlc3VsdHMuZW1wdHkoKX0sYy5wcm90b3R5cGUuZGlzcGxheU1lc3NhZ2U9ZnVuY3Rpb24oYil7dmFyIGM9dGhpcy5vcHRpb25zLmdldChcImVzY2FwZU1hcmt1cFwiKTt0aGlzLmNsZWFyKCksdGhpcy5oaWRlTG9hZGluZygpO3ZhciBkPWEoJzxsaSByb2xlPVwidHJlZWl0ZW1cIiBhcmlhLWxpdmU9XCJhc3NlcnRpdmVcIiBjbGFzcz1cInNlbGVjdDItcmVzdWx0c19fb3B0aW9uXCI+PC9saT4nKSxlPXRoaXMub3B0aW9ucy5nZXQoXCJ0cmFuc2xhdGlvbnNcIikuZ2V0KGIubWVzc2FnZSk7ZC5hcHBlbmQoYyhlKGIuYXJncykpKSxkWzBdLmNsYXNzTmFtZSs9XCIgc2VsZWN0Mi1yZXN1bHRzX19tZXNzYWdlXCIsdGhpcy4kcmVzdWx0cy5hcHBlbmQoZCl9LGMucHJvdG90eXBlLmhpZGVNZXNzYWdlcz1mdW5jdGlvbigpe3RoaXMuJHJlc3VsdHMuZmluZChcIi5zZWxlY3QyLXJlc3VsdHNfX21lc3NhZ2VcIikucmVtb3ZlKCl9LGMucHJvdG90eXBlLmFwcGVuZD1mdW5jdGlvbihhKXt0aGlzLmhpZGVMb2FkaW5nKCk7dmFyIGI9W107aWYobnVsbD09YS5yZXN1bHRzfHwwPT09YS5yZXN1bHRzLmxlbmd0aClyZXR1cm4gdm9pZCgwPT09dGhpcy4kcmVzdWx0cy5jaGlsZHJlbigpLmxlbmd0aCYmdGhpcy50cmlnZ2VyKFwicmVzdWx0czptZXNzYWdlXCIse21lc3NhZ2U6XCJub1Jlc3VsdHNcIn0pKTthLnJlc3VsdHM9dGhpcy5zb3J0KGEucmVzdWx0cyk7Zm9yKHZhciBjPTA7YzxhLnJlc3VsdHMubGVuZ3RoO2MrKyl7dmFyIGQ9YS5yZXN1bHRzW2NdLGU9dGhpcy5vcHRpb24oZCk7Yi5wdXNoKGUpfXRoaXMuJHJlc3VsdHMuYXBwZW5kKGIpfSxjLnByb3RvdHlwZS5wb3NpdGlvbj1mdW5jdGlvbihhLGIpe3ZhciBjPWIuZmluZChcIi5zZWxlY3QyLXJlc3VsdHNcIik7Yy5hcHBlbmQoYSl9LGMucHJvdG90eXBlLnNvcnQ9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcy5vcHRpb25zLmdldChcInNvcnRlclwiKTtyZXR1cm4gYihhKX0sYy5wcm90b3R5cGUuaGlnaGxpZ2h0Rmlyc3RJdGVtPWZ1bmN0aW9uKCl7dmFyIGE9dGhpcy4kcmVzdWx0cy5maW5kKFwiLnNlbGVjdDItcmVzdWx0c19fb3B0aW9uW2FyaWEtc2VsZWN0ZWRdXCIpLGI9YS5maWx0ZXIoXCJbYXJpYS1zZWxlY3RlZD10cnVlXVwiKTtiLmxlbmd0aD4wP2IuZmlyc3QoKS50cmlnZ2VyKFwibW91c2VlbnRlclwiKTphLmZpcnN0KCkudHJpZ2dlcihcIm1vdXNlZW50ZXJcIiksdGhpcy5lbnN1cmVIaWdobGlnaHRWaXNpYmxlKCl9LGMucHJvdG90eXBlLnNldENsYXNzZXM9ZnVuY3Rpb24oKXt2YXIgYj10aGlzO3RoaXMuZGF0YS5jdXJyZW50KGZ1bmN0aW9uKGMpe3ZhciBkPWEubWFwKGMsZnVuY3Rpb24oYSl7cmV0dXJuIGEuaWQudG9TdHJpbmcoKX0pLGU9Yi4kcmVzdWx0cy5maW5kKFwiLnNlbGVjdDItcmVzdWx0c19fb3B0aW9uW2FyaWEtc2VsZWN0ZWRdXCIpO2UuZWFjaChmdW5jdGlvbigpe3ZhciBiPWEodGhpcyksYz1hLmRhdGEodGhpcyxcImRhdGFcIiksZT1cIlwiK2MuaWQ7bnVsbCE9Yy5lbGVtZW50JiZjLmVsZW1lbnQuc2VsZWN0ZWR8fG51bGw9PWMuZWxlbWVudCYmYS5pbkFycmF5KGUsZCk+LTE/Yi5hdHRyKFwiYXJpYS1zZWxlY3RlZFwiLFwidHJ1ZVwiKTpiLmF0dHIoXCJhcmlhLXNlbGVjdGVkXCIsXCJmYWxzZVwiKX0pfSl9LGMucHJvdG90eXBlLnNob3dMb2FkaW5nPWZ1bmN0aW9uKGEpe3RoaXMuaGlkZUxvYWRpbmcoKTt2YXIgYj10aGlzLm9wdGlvbnMuZ2V0KFwidHJhbnNsYXRpb25zXCIpLmdldChcInNlYXJjaGluZ1wiKSxjPXtkaXNhYmxlZDohMCxsb2FkaW5nOiEwLHRleHQ6YihhKX0sZD10aGlzLm9wdGlvbihjKTtkLmNsYXNzTmFtZSs9XCIgbG9hZGluZy1yZXN1bHRzXCIsdGhpcy4kcmVzdWx0cy5wcmVwZW5kKGQpfSxjLnByb3RvdHlwZS5oaWRlTG9hZGluZz1mdW5jdGlvbigpe3RoaXMuJHJlc3VsdHMuZmluZChcIi5sb2FkaW5nLXJlc3VsdHNcIikucmVtb3ZlKCl9LGMucHJvdG90eXBlLm9wdGlvbj1mdW5jdGlvbihiKXt2YXIgYz1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7Yy5jbGFzc05hbWU9XCJzZWxlY3QyLXJlc3VsdHNfX29wdGlvblwiO3ZhciBkPXtyb2xlOlwidHJlZWl0ZW1cIixcImFyaWEtc2VsZWN0ZWRcIjpcImZhbHNlXCJ9O2IuZGlzYWJsZWQmJihkZWxldGUgZFtcImFyaWEtc2VsZWN0ZWRcIl0sZFtcImFyaWEtZGlzYWJsZWRcIl09XCJ0cnVlXCIpLG51bGw9PWIuaWQmJmRlbGV0ZSBkW1wiYXJpYS1zZWxlY3RlZFwiXSxudWxsIT1iLl9yZXN1bHRJZCYmKGMuaWQ9Yi5fcmVzdWx0SWQpLGIudGl0bGUmJihjLnRpdGxlPWIudGl0bGUpLGIuY2hpbGRyZW4mJihkLnJvbGU9XCJncm91cFwiLGRbXCJhcmlhLWxhYmVsXCJdPWIudGV4dCxkZWxldGUgZFtcImFyaWEtc2VsZWN0ZWRcIl0pO2Zvcih2YXIgZSBpbiBkKXt2YXIgZj1kW2VdO2Muc2V0QXR0cmlidXRlKGUsZil9aWYoYi5jaGlsZHJlbil7dmFyIGc9YShjKSxoPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHJvbmdcIik7aC5jbGFzc05hbWU9XCJzZWxlY3QyLXJlc3VsdHNfX2dyb3VwXCI7YShoKTt0aGlzLnRlbXBsYXRlKGIsaCk7Zm9yKHZhciBpPVtdLGo9MDtqPGIuY2hpbGRyZW4ubGVuZ3RoO2orKyl7dmFyIGs9Yi5jaGlsZHJlbltqXSxsPXRoaXMub3B0aW9uKGspO2kucHVzaChsKX12YXIgbT1hKFwiPHVsPjwvdWw+XCIse1wiY2xhc3NcIjpcInNlbGVjdDItcmVzdWx0c19fb3B0aW9ucyBzZWxlY3QyLXJlc3VsdHNfX29wdGlvbnMtLW5lc3RlZFwifSk7bS5hcHBlbmQoaSksZy5hcHBlbmQoaCksZy5hcHBlbmQobSl9ZWxzZSB0aGlzLnRlbXBsYXRlKGIsYyk7cmV0dXJuIGEuZGF0YShjLFwiZGF0YVwiLGIpLGN9LGMucHJvdG90eXBlLmJpbmQ9ZnVuY3Rpb24oYixjKXt2YXIgZD10aGlzLGU9Yi5pZCtcIi1yZXN1bHRzXCI7dGhpcy4kcmVzdWx0cy5hdHRyKFwiaWRcIixlKSxiLm9uKFwicmVzdWx0czphbGxcIixmdW5jdGlvbihhKXtkLmNsZWFyKCksZC5hcHBlbmQoYS5kYXRhKSxiLmlzT3BlbigpJiYoZC5zZXRDbGFzc2VzKCksZC5oaWdobGlnaHRGaXJzdEl0ZW0oKSl9KSxiLm9uKFwicmVzdWx0czphcHBlbmRcIixmdW5jdGlvbihhKXtkLmFwcGVuZChhLmRhdGEpLGIuaXNPcGVuKCkmJmQuc2V0Q2xhc3NlcygpfSksYi5vbihcInF1ZXJ5XCIsZnVuY3Rpb24oYSl7ZC5oaWRlTWVzc2FnZXMoKSxkLnNob3dMb2FkaW5nKGEpfSksYi5vbihcInNlbGVjdFwiLGZ1bmN0aW9uKCl7Yi5pc09wZW4oKSYmKGQuc2V0Q2xhc3NlcygpLGQuaGlnaGxpZ2h0Rmlyc3RJdGVtKCkpfSksYi5vbihcInVuc2VsZWN0XCIsZnVuY3Rpb24oKXtiLmlzT3BlbigpJiYoZC5zZXRDbGFzc2VzKCksZC5oaWdobGlnaHRGaXJzdEl0ZW0oKSl9KSxiLm9uKFwib3BlblwiLGZ1bmN0aW9uKCl7ZC4kcmVzdWx0cy5hdHRyKFwiYXJpYS1leHBhbmRlZFwiLFwidHJ1ZVwiKSxkLiRyZXN1bHRzLmF0dHIoXCJhcmlhLWhpZGRlblwiLFwiZmFsc2VcIiksZC5zZXRDbGFzc2VzKCksZC5lbnN1cmVIaWdobGlnaHRWaXNpYmxlKCl9KSxiLm9uKFwiY2xvc2VcIixmdW5jdGlvbigpe2QuJHJlc3VsdHMuYXR0cihcImFyaWEtZXhwYW5kZWRcIixcImZhbHNlXCIpLGQuJHJlc3VsdHMuYXR0cihcImFyaWEtaGlkZGVuXCIsXCJ0cnVlXCIpLGQuJHJlc3VsdHMucmVtb3ZlQXR0cihcImFyaWEtYWN0aXZlZGVzY2VuZGFudFwiKX0pLGIub24oXCJyZXN1bHRzOnRvZ2dsZVwiLGZ1bmN0aW9uKCl7dmFyIGE9ZC5nZXRIaWdobGlnaHRlZFJlc3VsdHMoKTswIT09YS5sZW5ndGgmJmEudHJpZ2dlcihcIm1vdXNldXBcIil9KSxiLm9uKFwicmVzdWx0czpzZWxlY3RcIixmdW5jdGlvbigpe3ZhciBhPWQuZ2V0SGlnaGxpZ2h0ZWRSZXN1bHRzKCk7aWYoMCE9PWEubGVuZ3RoKXt2YXIgYj1hLmRhdGEoXCJkYXRhXCIpO1widHJ1ZVwiPT1hLmF0dHIoXCJhcmlhLXNlbGVjdGVkXCIpP2QudHJpZ2dlcihcImNsb3NlXCIse30pOmQudHJpZ2dlcihcInNlbGVjdFwiLHtkYXRhOmJ9KX19KSxiLm9uKFwicmVzdWx0czpwcmV2aW91c1wiLGZ1bmN0aW9uKCl7dmFyIGE9ZC5nZXRIaWdobGlnaHRlZFJlc3VsdHMoKSxiPWQuJHJlc3VsdHMuZmluZChcIlthcmlhLXNlbGVjdGVkXVwiKSxjPWIuaW5kZXgoYSk7aWYoMCE9PWMpe3ZhciBlPWMtMTswPT09YS5sZW5ndGgmJihlPTApO3ZhciBmPWIuZXEoZSk7Zi50cmlnZ2VyKFwibW91c2VlbnRlclwiKTt2YXIgZz1kLiRyZXN1bHRzLm9mZnNldCgpLnRvcCxoPWYub2Zmc2V0KCkudG9wLGk9ZC4kcmVzdWx0cy5zY3JvbGxUb3AoKSsoaC1nKTswPT09ZT9kLiRyZXN1bHRzLnNjcm9sbFRvcCgwKTowPmgtZyYmZC4kcmVzdWx0cy5zY3JvbGxUb3AoaSl9fSksYi5vbihcInJlc3VsdHM6bmV4dFwiLGZ1bmN0aW9uKCl7dmFyIGE9ZC5nZXRIaWdobGlnaHRlZFJlc3VsdHMoKSxiPWQuJHJlc3VsdHMuZmluZChcIlthcmlhLXNlbGVjdGVkXVwiKSxjPWIuaW5kZXgoYSksZT1jKzE7aWYoIShlPj1iLmxlbmd0aCkpe3ZhciBmPWIuZXEoZSk7Zi50cmlnZ2VyKFwibW91c2VlbnRlclwiKTt2YXIgZz1kLiRyZXN1bHRzLm9mZnNldCgpLnRvcCtkLiRyZXN1bHRzLm91dGVySGVpZ2h0KCExKSxoPWYub2Zmc2V0KCkudG9wK2Yub3V0ZXJIZWlnaHQoITEpLGk9ZC4kcmVzdWx0cy5zY3JvbGxUb3AoKStoLWc7MD09PWU/ZC4kcmVzdWx0cy5zY3JvbGxUb3AoMCk6aD5nJiZkLiRyZXN1bHRzLnNjcm9sbFRvcChpKX19KSxiLm9uKFwicmVzdWx0czpmb2N1c1wiLGZ1bmN0aW9uKGEpe2EuZWxlbWVudC5hZGRDbGFzcyhcInNlbGVjdDItcmVzdWx0c19fb3B0aW9uLS1oaWdobGlnaHRlZFwiKX0pLGIub24oXCJyZXN1bHRzOm1lc3NhZ2VcIixmdW5jdGlvbihhKXtkLmRpc3BsYXlNZXNzYWdlKGEpfSksYS5mbi5tb3VzZXdoZWVsJiZ0aGlzLiRyZXN1bHRzLm9uKFwibW91c2V3aGVlbFwiLGZ1bmN0aW9uKGEpe3ZhciBiPWQuJHJlc3VsdHMuc2Nyb2xsVG9wKCksYz1kLiRyZXN1bHRzLmdldCgwKS5zY3JvbGxIZWlnaHQtYithLmRlbHRhWSxlPWEuZGVsdGFZPjAmJmItYS5kZWx0YVk8PTAsZj1hLmRlbHRhWTwwJiZjPD1kLiRyZXN1bHRzLmhlaWdodCgpO2U/KGQuJHJlc3VsdHMuc2Nyb2xsVG9wKDApLGEucHJldmVudERlZmF1bHQoKSxhLnN0b3BQcm9wYWdhdGlvbigpKTpmJiYoZC4kcmVzdWx0cy5zY3JvbGxUb3AoZC4kcmVzdWx0cy5nZXQoMCkuc2Nyb2xsSGVpZ2h0LWQuJHJlc3VsdHMuaGVpZ2h0KCkpLGEucHJldmVudERlZmF1bHQoKSxhLnN0b3BQcm9wYWdhdGlvbigpKX0pLHRoaXMuJHJlc3VsdHMub24oXCJtb3VzZXVwXCIsXCIuc2VsZWN0Mi1yZXN1bHRzX19vcHRpb25bYXJpYS1zZWxlY3RlZF1cIixmdW5jdGlvbihiKXt2YXIgYz1hKHRoaXMpLGU9Yy5kYXRhKFwiZGF0YVwiKTtyZXR1cm5cInRydWVcIj09PWMuYXR0cihcImFyaWEtc2VsZWN0ZWRcIik/dm9pZChkLm9wdGlvbnMuZ2V0KFwibXVsdGlwbGVcIik/ZC50cmlnZ2VyKFwidW5zZWxlY3RcIix7b3JpZ2luYWxFdmVudDpiLGRhdGE6ZX0pOmQudHJpZ2dlcihcImNsb3NlXCIse30pKTp2b2lkIGQudHJpZ2dlcihcInNlbGVjdFwiLHtvcmlnaW5hbEV2ZW50OmIsZGF0YTplfSl9KSx0aGlzLiRyZXN1bHRzLm9uKFwibW91c2VlbnRlclwiLFwiLnNlbGVjdDItcmVzdWx0c19fb3B0aW9uW2FyaWEtc2VsZWN0ZWRdXCIsZnVuY3Rpb24oYil7dmFyIGM9YSh0aGlzKS5kYXRhKFwiZGF0YVwiKTtkLmdldEhpZ2hsaWdodGVkUmVzdWx0cygpLnJlbW92ZUNsYXNzKFwic2VsZWN0Mi1yZXN1bHRzX19vcHRpb24tLWhpZ2hsaWdodGVkXCIpLGQudHJpZ2dlcihcInJlc3VsdHM6Zm9jdXNcIix7ZGF0YTpjLGVsZW1lbnQ6YSh0aGlzKX0pfSl9LGMucHJvdG90eXBlLmdldEhpZ2hsaWdodGVkUmVzdWx0cz1mdW5jdGlvbigpe3ZhciBhPXRoaXMuJHJlc3VsdHMuZmluZChcIi5zZWxlY3QyLXJlc3VsdHNfX29wdGlvbi0taGlnaGxpZ2h0ZWRcIik7cmV0dXJuIGF9LGMucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLiRyZXN1bHRzLnJlbW92ZSgpfSxjLnByb3RvdHlwZS5lbnN1cmVIaWdobGlnaHRWaXNpYmxlPWZ1bmN0aW9uKCl7dmFyIGE9dGhpcy5nZXRIaWdobGlnaHRlZFJlc3VsdHMoKTtpZigwIT09YS5sZW5ndGgpe3ZhciBiPXRoaXMuJHJlc3VsdHMuZmluZChcIlthcmlhLXNlbGVjdGVkXVwiKSxjPWIuaW5kZXgoYSksZD10aGlzLiRyZXN1bHRzLm9mZnNldCgpLnRvcCxlPWEub2Zmc2V0KCkudG9wLGY9dGhpcy4kcmVzdWx0cy5zY3JvbGxUb3AoKSsoZS1kKSxnPWUtZDtmLT0yKmEub3V0ZXJIZWlnaHQoITEpLDI+PWM/dGhpcy4kcmVzdWx0cy5zY3JvbGxUb3AoMCk6KGc+dGhpcy4kcmVzdWx0cy5vdXRlckhlaWdodCgpfHwwPmcpJiZ0aGlzLiRyZXN1bHRzLnNjcm9sbFRvcChmKX19LGMucHJvdG90eXBlLnRlbXBsYXRlPWZ1bmN0aW9uKGIsYyl7dmFyIGQ9dGhpcy5vcHRpb25zLmdldChcInRlbXBsYXRlUmVzdWx0XCIpLGU9dGhpcy5vcHRpb25zLmdldChcImVzY2FwZU1hcmt1cFwiKSxmPWQoYixjKTtudWxsPT1mP2Muc3R5bGUuZGlzcGxheT1cIm5vbmVcIjpcInN0cmluZ1wiPT10eXBlb2YgZj9jLmlubmVySFRNTD1lKGYpOmEoYykuYXBwZW5kKGYpfSxjfSksYi5kZWZpbmUoXCJzZWxlY3QyL2tleXNcIixbXSxmdW5jdGlvbigpe3ZhciBhPXtCQUNLU1BBQ0U6OCxUQUI6OSxFTlRFUjoxMyxTSElGVDoxNixDVFJMOjE3LEFMVDoxOCxFU0M6MjcsU1BBQ0U6MzIsUEFHRV9VUDozMyxQQUdFX0RPV046MzQsRU5EOjM1LEhPTUU6MzYsTEVGVDozNyxVUDozOCxSSUdIVDozOSxET1dOOjQwLERFTEVURTo0Nn07cmV0dXJuIGF9KSxiLmRlZmluZShcInNlbGVjdDIvc2VsZWN0aW9uL2Jhc2VcIixbXCJqcXVlcnlcIixcIi4uL3V0aWxzXCIsXCIuLi9rZXlzXCJdLGZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGEsYil7dGhpcy4kZWxlbWVudD1hLHRoaXMub3B0aW9ucz1iLGQuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmNhbGwodGhpcyl9cmV0dXJuIGIuRXh0ZW5kKGQsYi5PYnNlcnZhYmxlKSxkLnByb3RvdHlwZS5yZW5kZXI9ZnVuY3Rpb24oKXt2YXIgYj1hKCc8c3BhbiBjbGFzcz1cInNlbGVjdDItc2VsZWN0aW9uXCIgcm9sZT1cImNvbWJvYm94XCIgIGFyaWEtaGFzcG9wdXA9XCJ0cnVlXCIgYXJpYS1leHBhbmRlZD1cImZhbHNlXCI+PC9zcGFuPicpO3JldHVybiB0aGlzLl90YWJpbmRleD0wLG51bGwhPXRoaXMuJGVsZW1lbnQuZGF0YShcIm9sZC10YWJpbmRleFwiKT90aGlzLl90YWJpbmRleD10aGlzLiRlbGVtZW50LmRhdGEoXCJvbGQtdGFiaW5kZXhcIik6bnVsbCE9dGhpcy4kZWxlbWVudC5hdHRyKFwidGFiaW5kZXhcIikmJih0aGlzLl90YWJpbmRleD10aGlzLiRlbGVtZW50LmF0dHIoXCJ0YWJpbmRleFwiKSksYi5hdHRyKFwidGl0bGVcIix0aGlzLiRlbGVtZW50LmF0dHIoXCJ0aXRsZVwiKSksYi5hdHRyKFwidGFiaW5kZXhcIix0aGlzLl90YWJpbmRleCksdGhpcy4kc2VsZWN0aW9uPWIsYn0sZC5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihhLGIpe3ZhciBkPXRoaXMsZT0oYS5pZCtcIi1jb250YWluZXJcIixhLmlkK1wiLXJlc3VsdHNcIik7dGhpcy5jb250YWluZXI9YSx0aGlzLiRzZWxlY3Rpb24ub24oXCJmb2N1c1wiLGZ1bmN0aW9uKGEpe2QudHJpZ2dlcihcImZvY3VzXCIsYSl9KSx0aGlzLiRzZWxlY3Rpb24ub24oXCJibHVyXCIsZnVuY3Rpb24oYSl7ZC5faGFuZGxlQmx1cihhKX0pLHRoaXMuJHNlbGVjdGlvbi5vbihcImtleWRvd25cIixmdW5jdGlvbihhKXtkLnRyaWdnZXIoXCJrZXlwcmVzc1wiLGEpLGEud2hpY2g9PT1jLlNQQUNFJiZhLnByZXZlbnREZWZhdWx0KCl9KSxhLm9uKFwicmVzdWx0czpmb2N1c1wiLGZ1bmN0aW9uKGEpe2QuJHNlbGVjdGlvbi5hdHRyKFwiYXJpYS1hY3RpdmVkZXNjZW5kYW50XCIsYS5kYXRhLl9yZXN1bHRJZCl9KSxhLm9uKFwic2VsZWN0aW9uOnVwZGF0ZVwiLGZ1bmN0aW9uKGEpe2QudXBkYXRlKGEuZGF0YSl9KSxhLm9uKFwib3BlblwiLGZ1bmN0aW9uKCl7ZC4kc2VsZWN0aW9uLmF0dHIoXCJhcmlhLWV4cGFuZGVkXCIsXCJ0cnVlXCIpLGQuJHNlbGVjdGlvbi5hdHRyKFwiYXJpYS1vd25zXCIsZSksZC5fYXR0YWNoQ2xvc2VIYW5kbGVyKGEpfSksYS5vbihcImNsb3NlXCIsZnVuY3Rpb24oKXtkLiRzZWxlY3Rpb24uYXR0cihcImFyaWEtZXhwYW5kZWRcIixcImZhbHNlXCIpLGQuJHNlbGVjdGlvbi5yZW1vdmVBdHRyKFwiYXJpYS1hY3RpdmVkZXNjZW5kYW50XCIpLGQuJHNlbGVjdGlvbi5yZW1vdmVBdHRyKFwiYXJpYS1vd25zXCIpLGQuJHNlbGVjdGlvbi5mb2N1cygpLGQuX2RldGFjaENsb3NlSGFuZGxlcihhKX0pLGEub24oXCJlbmFibGVcIixmdW5jdGlvbigpe2QuJHNlbGVjdGlvbi5hdHRyKFwidGFiaW5kZXhcIixkLl90YWJpbmRleCl9KSxhLm9uKFwiZGlzYWJsZVwiLGZ1bmN0aW9uKCl7ZC4kc2VsZWN0aW9uLmF0dHIoXCJ0YWJpbmRleFwiLFwiLTFcIil9KX0sZC5wcm90b3R5cGUuX2hhbmRsZUJsdXI9ZnVuY3Rpb24oYil7dmFyIGM9dGhpczt3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe2RvY3VtZW50LmFjdGl2ZUVsZW1lbnQ9PWMuJHNlbGVjdGlvblswXXx8YS5jb250YWlucyhjLiRzZWxlY3Rpb25bMF0sZG9jdW1lbnQuYWN0aXZlRWxlbWVudCl8fGMudHJpZ2dlcihcImJsdXJcIixiKX0sMSl9LGQucHJvdG90eXBlLl9hdHRhY2hDbG9zZUhhbmRsZXI9ZnVuY3Rpb24oYil7YShkb2N1bWVudC5ib2R5KS5vbihcIm1vdXNlZG93bi5zZWxlY3QyLlwiK2IuaWQsZnVuY3Rpb24oYil7dmFyIGM9YShiLnRhcmdldCksZD1jLmNsb3Nlc3QoXCIuc2VsZWN0MlwiKSxlPWEoXCIuc2VsZWN0Mi5zZWxlY3QyLWNvbnRhaW5lci0tb3BlblwiKTtlLmVhY2goZnVuY3Rpb24oKXt2YXIgYj1hKHRoaXMpO2lmKHRoaXMhPWRbMF0pe3ZhciBjPWIuZGF0YShcImVsZW1lbnRcIik7Yy5zZWxlY3QyKFwiY2xvc2VcIil9fSl9KX0sZC5wcm90b3R5cGUuX2RldGFjaENsb3NlSGFuZGxlcj1mdW5jdGlvbihiKXthKGRvY3VtZW50LmJvZHkpLm9mZihcIm1vdXNlZG93bi5zZWxlY3QyLlwiK2IuaWQpfSxkLnByb3RvdHlwZS5wb3NpdGlvbj1mdW5jdGlvbihhLGIpe3ZhciBjPWIuZmluZChcIi5zZWxlY3Rpb25cIik7Yy5hcHBlbmQoYSl9LGQucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLl9kZXRhY2hDbG9zZUhhbmRsZXIodGhpcy5jb250YWluZXIpfSxkLnByb3RvdHlwZS51cGRhdGU9ZnVuY3Rpb24oYSl7dGhyb3cgbmV3IEVycm9yKFwiVGhlIGB1cGRhdGVgIG1ldGhvZCBtdXN0IGJlIGRlZmluZWQgaW4gY2hpbGQgY2xhc3Nlcy5cIil9LGR9KSxiLmRlZmluZShcInNlbGVjdDIvc2VsZWN0aW9uL3NpbmdsZVwiLFtcImpxdWVyeVwiLFwiLi9iYXNlXCIsXCIuLi91dGlsc1wiLFwiLi4va2V5c1wiXSxmdW5jdGlvbihhLGIsYyxkKXtmdW5jdGlvbiBlKCl7ZS5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcyxhcmd1bWVudHMpfXJldHVybiBjLkV4dGVuZChlLGIpLGUucHJvdG90eXBlLnJlbmRlcj1mdW5jdGlvbigpe3ZhciBhPWUuX19zdXBlcl9fLnJlbmRlci5jYWxsKHRoaXMpO3JldHVybiBhLmFkZENsYXNzKFwic2VsZWN0Mi1zZWxlY3Rpb24tLXNpbmdsZVwiKSxhLmh0bWwoJzxzcGFuIGNsYXNzPVwic2VsZWN0Mi1zZWxlY3Rpb25fX3JlbmRlcmVkXCI+PC9zcGFuPjxzcGFuIGNsYXNzPVwic2VsZWN0Mi1zZWxlY3Rpb25fX2Fycm93XCIgcm9sZT1cInByZXNlbnRhdGlvblwiPjxiIHJvbGU9XCJwcmVzZW50YXRpb25cIj48L2I+PC9zcGFuPicpLGF9LGUucHJvdG90eXBlLmJpbmQ9ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzO2UuX19zdXBlcl9fLmJpbmQuYXBwbHkodGhpcyxhcmd1bWVudHMpO3ZhciBkPWEuaWQrXCItY29udGFpbmVyXCI7dGhpcy4kc2VsZWN0aW9uLmZpbmQoXCIuc2VsZWN0Mi1zZWxlY3Rpb25fX3JlbmRlcmVkXCIpLmF0dHIoXCJpZFwiLGQpLHRoaXMuJHNlbGVjdGlvbi5hdHRyKFwiYXJpYS1sYWJlbGxlZGJ5XCIsZCksdGhpcy4kc2VsZWN0aW9uLm9uKFwibW91c2Vkb3duXCIsZnVuY3Rpb24oYSl7MT09PWEud2hpY2gmJmMudHJpZ2dlcihcInRvZ2dsZVwiLHtvcmlnaW5hbEV2ZW50OmF9KX0pLHRoaXMuJHNlbGVjdGlvbi5vbihcImZvY3VzXCIsZnVuY3Rpb24oYSl7fSksdGhpcy4kc2VsZWN0aW9uLm9uKFwiYmx1clwiLGZ1bmN0aW9uKGEpe30pLGEub24oXCJmb2N1c1wiLGZ1bmN0aW9uKGIpe2EuaXNPcGVuKCl8fGMuJHNlbGVjdGlvbi5mb2N1cygpfSksYS5vbihcInNlbGVjdGlvbjp1cGRhdGVcIixmdW5jdGlvbihhKXtjLnVwZGF0ZShhLmRhdGEpfSl9LGUucHJvdG90eXBlLmNsZWFyPWZ1bmN0aW9uKCl7dGhpcy4kc2VsZWN0aW9uLmZpbmQoXCIuc2VsZWN0Mi1zZWxlY3Rpb25fX3JlbmRlcmVkXCIpLmVtcHR5KCl9LGUucHJvdG90eXBlLmRpc3BsYXk9ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzLm9wdGlvbnMuZ2V0KFwidGVtcGxhdGVTZWxlY3Rpb25cIiksZD10aGlzLm9wdGlvbnMuZ2V0KFwiZXNjYXBlTWFya3VwXCIpO3JldHVybiBkKGMoYSxiKSl9LGUucHJvdG90eXBlLnNlbGVjdGlvbkNvbnRhaW5lcj1mdW5jdGlvbigpe3JldHVybiBhKFwiPHNwYW4+PC9zcGFuPlwiKX0sZS5wcm90b3R5cGUudXBkYXRlPWZ1bmN0aW9uKGEpe2lmKDA9PT1hLmxlbmd0aClyZXR1cm4gdm9pZCB0aGlzLmNsZWFyKCk7dmFyIGI9YVswXSxjPXRoaXMuJHNlbGVjdGlvbi5maW5kKFwiLnNlbGVjdDItc2VsZWN0aW9uX19yZW5kZXJlZFwiKSxkPXRoaXMuZGlzcGxheShiLGMpO2MuZW1wdHkoKS5hcHBlbmQoZCksYy5wcm9wKFwidGl0bGVcIixiLnRpdGxlfHxiLnRleHQpfSxlfSksYi5kZWZpbmUoXCJzZWxlY3QyL3NlbGVjdGlvbi9tdWx0aXBsZVwiLFtcImpxdWVyeVwiLFwiLi9iYXNlXCIsXCIuLi91dGlsc1wiXSxmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZChhLGIpe2QuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsYXJndW1lbnRzKX1yZXR1cm4gYy5FeHRlbmQoZCxiKSxkLnByb3RvdHlwZS5yZW5kZXI9ZnVuY3Rpb24oKXt2YXIgYT1kLl9fc3VwZXJfXy5yZW5kZXIuY2FsbCh0aGlzKTtyZXR1cm4gYS5hZGRDbGFzcyhcInNlbGVjdDItc2VsZWN0aW9uLS1tdWx0aXBsZVwiKSxhLmh0bWwoJzx1bCBjbGFzcz1cInNlbGVjdDItc2VsZWN0aW9uX19yZW5kZXJlZFwiPjwvdWw+JyksYX0sZC5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihiLGMpe3ZhciBlPXRoaXM7ZC5fX3N1cGVyX18uYmluZC5hcHBseSh0aGlzLGFyZ3VtZW50cyksdGhpcy4kc2VsZWN0aW9uLm9uKFwiY2xpY2tcIixmdW5jdGlvbihhKXtlLnRyaWdnZXIoXCJ0b2dnbGVcIix7b3JpZ2luYWxFdmVudDphfSl9KSx0aGlzLiRzZWxlY3Rpb24ub24oXCJjbGlja1wiLFwiLnNlbGVjdDItc2VsZWN0aW9uX19jaG9pY2VfX3JlbW92ZVwiLGZ1bmN0aW9uKGIpe2lmKCFlLm9wdGlvbnMuZ2V0KFwiZGlzYWJsZWRcIikpe3ZhciBjPWEodGhpcyksZD1jLnBhcmVudCgpLGY9ZC5kYXRhKFwiZGF0YVwiKTtlLnRyaWdnZXIoXCJ1bnNlbGVjdFwiLHtvcmlnaW5hbEV2ZW50OmIsZGF0YTpmfSl9fSl9LGQucHJvdG90eXBlLmNsZWFyPWZ1bmN0aW9uKCl7dGhpcy4kc2VsZWN0aW9uLmZpbmQoXCIuc2VsZWN0Mi1zZWxlY3Rpb25fX3JlbmRlcmVkXCIpLmVtcHR5KCl9LGQucHJvdG90eXBlLmRpc3BsYXk9ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzLm9wdGlvbnMuZ2V0KFwidGVtcGxhdGVTZWxlY3Rpb25cIiksZD10aGlzLm9wdGlvbnMuZ2V0KFwiZXNjYXBlTWFya3VwXCIpO3JldHVybiBkKGMoYSxiKSl9LGQucHJvdG90eXBlLnNlbGVjdGlvbkNvbnRhaW5lcj1mdW5jdGlvbigpe3ZhciBiPWEoJzxsaSBjbGFzcz1cInNlbGVjdDItc2VsZWN0aW9uX19jaG9pY2VcIj48c3BhbiBjbGFzcz1cInNlbGVjdDItc2VsZWN0aW9uX19jaG9pY2VfX3JlbW92ZVwiIHJvbGU9XCJwcmVzZW50YXRpb25cIj4mdGltZXM7PC9zcGFuPjwvbGk+Jyk7cmV0dXJuIGJ9LGQucHJvdG90eXBlLnVwZGF0ZT1mdW5jdGlvbihhKXtpZih0aGlzLmNsZWFyKCksMCE9PWEubGVuZ3RoKXtmb3IodmFyIGI9W10sZD0wO2Q8YS5sZW5ndGg7ZCsrKXt2YXIgZT1hW2RdLGY9dGhpcy5zZWxlY3Rpb25Db250YWluZXIoKSxnPXRoaXMuZGlzcGxheShlLGYpO2YuYXBwZW5kKGcpLGYucHJvcChcInRpdGxlXCIsZS50aXRsZXx8ZS50ZXh0KSxmLmRhdGEoXCJkYXRhXCIsZSksYi5wdXNoKGYpfXZhciBoPXRoaXMuJHNlbGVjdGlvbi5maW5kKFwiLnNlbGVjdDItc2VsZWN0aW9uX19yZW5kZXJlZFwiKTtjLmFwcGVuZE1hbnkoaCxiKX19LGR9KSxiLmRlZmluZShcInNlbGVjdDIvc2VsZWN0aW9uL3BsYWNlaG9sZGVyXCIsW1wiLi4vdXRpbHNcIl0sZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYihhLGIsYyl7dGhpcy5wbGFjZWhvbGRlcj10aGlzLm5vcm1hbGl6ZVBsYWNlaG9sZGVyKGMuZ2V0KFwicGxhY2Vob2xkZXJcIikpLGEuY2FsbCh0aGlzLGIsYyl9cmV0dXJuIGIucHJvdG90eXBlLm5vcm1hbGl6ZVBsYWNlaG9sZGVyPWZ1bmN0aW9uKGEsYil7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIGImJihiPXtpZDpcIlwiLHRleHQ6Yn0pLGJ9LGIucHJvdG90eXBlLmNyZWF0ZVBsYWNlaG9sZGVyPWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcy5zZWxlY3Rpb25Db250YWluZXIoKTtyZXR1cm4gYy5odG1sKHRoaXMuZGlzcGxheShiKSksYy5hZGRDbGFzcyhcInNlbGVjdDItc2VsZWN0aW9uX19wbGFjZWhvbGRlclwiKS5yZW1vdmVDbGFzcyhcInNlbGVjdDItc2VsZWN0aW9uX19jaG9pY2VcIiksY30sYi5wcm90b3R5cGUudXBkYXRlPWZ1bmN0aW9uKGEsYil7dmFyIGM9MT09Yi5sZW5ndGgmJmJbMF0uaWQhPXRoaXMucGxhY2Vob2xkZXIuaWQsZD1iLmxlbmd0aD4xO2lmKGR8fGMpcmV0dXJuIGEuY2FsbCh0aGlzLGIpO3RoaXMuY2xlYXIoKTt2YXIgZT10aGlzLmNyZWF0ZVBsYWNlaG9sZGVyKHRoaXMucGxhY2Vob2xkZXIpO3RoaXMuJHNlbGVjdGlvbi5maW5kKFwiLnNlbGVjdDItc2VsZWN0aW9uX19yZW5kZXJlZFwiKS5hcHBlbmQoZSl9LGJ9KSxiLmRlZmluZShcInNlbGVjdDIvc2VsZWN0aW9uL2FsbG93Q2xlYXJcIixbXCJqcXVlcnlcIixcIi4uL2tleXNcIl0sZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKCl7fXJldHVybiBjLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGEsYixjKXt2YXIgZD10aGlzO2EuY2FsbCh0aGlzLGIsYyksbnVsbD09dGhpcy5wbGFjZWhvbGRlciYmdGhpcy5vcHRpb25zLmdldChcImRlYnVnXCIpJiZ3aW5kb3cuY29uc29sZSYmY29uc29sZS5lcnJvciYmY29uc29sZS5lcnJvcihcIlNlbGVjdDI6IFRoZSBgYWxsb3dDbGVhcmAgb3B0aW9uIHNob3VsZCBiZSB1c2VkIGluIGNvbWJpbmF0aW9uIHdpdGggdGhlIGBwbGFjZWhvbGRlcmAgb3B0aW9uLlwiKSx0aGlzLiRzZWxlY3Rpb24ub24oXCJtb3VzZWRvd25cIixcIi5zZWxlY3QyLXNlbGVjdGlvbl9fY2xlYXJcIixmdW5jdGlvbihhKXtkLl9oYW5kbGVDbGVhcihhKX0pLGIub24oXCJrZXlwcmVzc1wiLGZ1bmN0aW9uKGEpe2QuX2hhbmRsZUtleWJvYXJkQ2xlYXIoYSxiKX0pfSxjLnByb3RvdHlwZS5faGFuZGxlQ2xlYXI9ZnVuY3Rpb24oYSxiKXtpZighdGhpcy5vcHRpb25zLmdldChcImRpc2FibGVkXCIpKXt2YXIgYz10aGlzLiRzZWxlY3Rpb24uZmluZChcIi5zZWxlY3QyLXNlbGVjdGlvbl9fY2xlYXJcIik7aWYoMCE9PWMubGVuZ3RoKXtiLnN0b3BQcm9wYWdhdGlvbigpO2Zvcih2YXIgZD1jLmRhdGEoXCJkYXRhXCIpLGU9MDtlPGQubGVuZ3RoO2UrKyl7dmFyIGY9e2RhdGE6ZFtlXX07aWYodGhpcy50cmlnZ2VyKFwidW5zZWxlY3RcIixmKSxmLnByZXZlbnRlZClyZXR1cm59dGhpcy4kZWxlbWVudC52YWwodGhpcy5wbGFjZWhvbGRlci5pZCkudHJpZ2dlcihcImNoYW5nZVwiKSx0aGlzLnRyaWdnZXIoXCJ0b2dnbGVcIix7fSl9fX0sYy5wcm90b3R5cGUuX2hhbmRsZUtleWJvYXJkQ2xlYXI9ZnVuY3Rpb24oYSxjLGQpe2QuaXNPcGVuKCl8fChjLndoaWNoPT1iLkRFTEVURXx8Yy53aGljaD09Yi5CQUNLU1BBQ0UpJiZ0aGlzLl9oYW5kbGVDbGVhcihjKX0sYy5wcm90b3R5cGUudXBkYXRlPWZ1bmN0aW9uKGIsYyl7aWYoYi5jYWxsKHRoaXMsYyksISh0aGlzLiRzZWxlY3Rpb24uZmluZChcIi5zZWxlY3QyLXNlbGVjdGlvbl9fcGxhY2Vob2xkZXJcIikubGVuZ3RoPjB8fDA9PT1jLmxlbmd0aCkpe3ZhciBkPWEoJzxzcGFuIGNsYXNzPVwic2VsZWN0Mi1zZWxlY3Rpb25fX2NsZWFyXCI+JnRpbWVzOzwvc3Bhbj4nKTtkLmRhdGEoXCJkYXRhXCIsYyksdGhpcy4kc2VsZWN0aW9uLmZpbmQoXCIuc2VsZWN0Mi1zZWxlY3Rpb25fX3JlbmRlcmVkXCIpLnByZXBlbmQoZCl9fSxjfSksYi5kZWZpbmUoXCJzZWxlY3QyL3NlbGVjdGlvbi9zZWFyY2hcIixbXCJqcXVlcnlcIixcIi4uL3V0aWxzXCIsXCIuLi9rZXlzXCJdLGZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGEsYixjKXthLmNhbGwodGhpcyxiLGMpfXJldHVybiBkLnByb3RvdHlwZS5yZW5kZXI9ZnVuY3Rpb24oYil7dmFyIGM9YSgnPGxpIGNsYXNzPVwic2VsZWN0Mi1zZWFyY2ggc2VsZWN0Mi1zZWFyY2gtLWlubGluZVwiPjxpbnB1dCBjbGFzcz1cInNlbGVjdDItc2VhcmNoX19maWVsZFwiIHR5cGU9XCJzZWFyY2hcIiB0YWJpbmRleD1cIi0xXCIgYXV0b2NvbXBsZXRlPVwib2ZmXCIgYXV0b2NvcnJlY3Q9XCJvZmZcIiBhdXRvY2FwaXRhbGl6ZT1cIm9mZlwiIHNwZWxsY2hlY2s9XCJmYWxzZVwiIHJvbGU9XCJ0ZXh0Ym94XCIgYXJpYS1hdXRvY29tcGxldGU9XCJsaXN0XCIgLz48L2xpPicpO3RoaXMuJHNlYXJjaENvbnRhaW5lcj1jLHRoaXMuJHNlYXJjaD1jLmZpbmQoXCJpbnB1dFwiKTt2YXIgZD1iLmNhbGwodGhpcyk7cmV0dXJuIHRoaXMuX3RyYW5zZmVyVGFiSW5kZXgoKSxkfSxkLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGEsYixkKXt2YXIgZT10aGlzO2EuY2FsbCh0aGlzLGIsZCksYi5vbihcIm9wZW5cIixmdW5jdGlvbigpe2UuJHNlYXJjaC50cmlnZ2VyKFwiZm9jdXNcIil9KSxiLm9uKFwiY2xvc2VcIixmdW5jdGlvbigpe2UuJHNlYXJjaC52YWwoXCJcIiksZS4kc2VhcmNoLnJlbW92ZUF0dHIoXCJhcmlhLWFjdGl2ZWRlc2NlbmRhbnRcIiksZS4kc2VhcmNoLnRyaWdnZXIoXCJmb2N1c1wiKX0pLGIub24oXCJlbmFibGVcIixmdW5jdGlvbigpe2UuJHNlYXJjaC5wcm9wKFwiZGlzYWJsZWRcIiwhMSksZS5fdHJhbnNmZXJUYWJJbmRleCgpfSksYi5vbihcImRpc2FibGVcIixmdW5jdGlvbigpe2UuJHNlYXJjaC5wcm9wKFwiZGlzYWJsZWRcIiwhMCl9KSxiLm9uKFwiZm9jdXNcIixmdW5jdGlvbihhKXtlLiRzZWFyY2gudHJpZ2dlcihcImZvY3VzXCIpfSksYi5vbihcInJlc3VsdHM6Zm9jdXNcIixmdW5jdGlvbihhKXtlLiRzZWFyY2guYXR0cihcImFyaWEtYWN0aXZlZGVzY2VuZGFudFwiLGEuaWQpfSksdGhpcy4kc2VsZWN0aW9uLm9uKFwiZm9jdXNpblwiLFwiLnNlbGVjdDItc2VhcmNoLS1pbmxpbmVcIixmdW5jdGlvbihhKXtlLnRyaWdnZXIoXCJmb2N1c1wiLGEpfSksdGhpcy4kc2VsZWN0aW9uLm9uKFwiZm9jdXNvdXRcIixcIi5zZWxlY3QyLXNlYXJjaC0taW5saW5lXCIsZnVuY3Rpb24oYSl7ZS5faGFuZGxlQmx1cihhKX0pLHRoaXMuJHNlbGVjdGlvbi5vbihcImtleWRvd25cIixcIi5zZWxlY3QyLXNlYXJjaC0taW5saW5lXCIsZnVuY3Rpb24oYSl7YS5zdG9wUHJvcGFnYXRpb24oKSxlLnRyaWdnZXIoXCJrZXlwcmVzc1wiLGEpLGUuX2tleVVwUHJldmVudGVkPWEuaXNEZWZhdWx0UHJldmVudGVkKCk7dmFyIGI9YS53aGljaDtpZihiPT09Yy5CQUNLU1BBQ0UmJlwiXCI9PT1lLiRzZWFyY2gudmFsKCkpe3ZhciBkPWUuJHNlYXJjaENvbnRhaW5lci5wcmV2KFwiLnNlbGVjdDItc2VsZWN0aW9uX19jaG9pY2VcIik7aWYoZC5sZW5ndGg+MCl7dmFyIGY9ZC5kYXRhKFwiZGF0YVwiKTtlLnNlYXJjaFJlbW92ZUNob2ljZShmKSxhLnByZXZlbnREZWZhdWx0KCl9fX0pO3ZhciBmPWRvY3VtZW50LmRvY3VtZW50TW9kZSxnPWYmJjExPj1mO3RoaXMuJHNlbGVjdGlvbi5vbihcImlucHV0LnNlYXJjaGNoZWNrXCIsXCIuc2VsZWN0Mi1zZWFyY2gtLWlubGluZVwiLGZ1bmN0aW9uKGEpe3JldHVybiBnP3ZvaWQgZS4kc2VsZWN0aW9uLm9mZihcImlucHV0LnNlYXJjaCBpbnB1dC5zZWFyY2hjaGVja1wiKTp2b2lkIGUuJHNlbGVjdGlvbi5vZmYoXCJrZXl1cC5zZWFyY2hcIil9KSx0aGlzLiRzZWxlY3Rpb24ub24oXCJrZXl1cC5zZWFyY2ggaW5wdXQuc2VhcmNoXCIsXCIuc2VsZWN0Mi1zZWFyY2gtLWlubGluZVwiLGZ1bmN0aW9uKGEpe2lmKGcmJlwiaW5wdXRcIj09PWEudHlwZSlyZXR1cm4gdm9pZCBlLiRzZWxlY3Rpb24ub2ZmKFwiaW5wdXQuc2VhcmNoIGlucHV0LnNlYXJjaGNoZWNrXCIpO3ZhciBiPWEud2hpY2g7YiE9Yy5TSElGVCYmYiE9Yy5DVFJMJiZiIT1jLkFMVCYmYiE9Yy5UQUImJmUuaGFuZGxlU2VhcmNoKGEpfSl9LGQucHJvdG90eXBlLl90cmFuc2ZlclRhYkluZGV4PWZ1bmN0aW9uKGEpe3RoaXMuJHNlYXJjaC5hdHRyKFwidGFiaW5kZXhcIix0aGlzLiRzZWxlY3Rpb24uYXR0cihcInRhYmluZGV4XCIpKSx0aGlzLiRzZWxlY3Rpb24uYXR0cihcInRhYmluZGV4XCIsXCItMVwiKX0sZC5wcm90b3R5cGUuY3JlYXRlUGxhY2Vob2xkZXI9ZnVuY3Rpb24oYSxiKXt0aGlzLiRzZWFyY2guYXR0cihcInBsYWNlaG9sZGVyXCIsYi50ZXh0KX0sZC5wcm90b3R5cGUudXBkYXRlPWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcy4kc2VhcmNoWzBdPT1kb2N1bWVudC5hY3RpdmVFbGVtZW50O3RoaXMuJHNlYXJjaC5hdHRyKFwicGxhY2Vob2xkZXJcIixcIlwiKSxhLmNhbGwodGhpcyxiKSx0aGlzLiRzZWxlY3Rpb24uZmluZChcIi5zZWxlY3QyLXNlbGVjdGlvbl9fcmVuZGVyZWRcIikuYXBwZW5kKHRoaXMuJHNlYXJjaENvbnRhaW5lciksdGhpcy5yZXNpemVTZWFyY2goKSxjJiZ0aGlzLiRzZWFyY2guZm9jdXMoKX0sZC5wcm90b3R5cGUuaGFuZGxlU2VhcmNoPWZ1bmN0aW9uKCl7aWYodGhpcy5yZXNpemVTZWFyY2goKSwhdGhpcy5fa2V5VXBQcmV2ZW50ZWQpe3ZhciBhPXRoaXMuJHNlYXJjaC52YWwoKTt0aGlzLnRyaWdnZXIoXCJxdWVyeVwiLHt0ZXJtOmF9KX10aGlzLl9rZXlVcFByZXZlbnRlZD0hMX0sZC5wcm90b3R5cGUuc2VhcmNoUmVtb3ZlQ2hvaWNlPWZ1bmN0aW9uKGEsYil7dGhpcy50cmlnZ2VyKFwidW5zZWxlY3RcIix7ZGF0YTpifSksdGhpcy4kc2VhcmNoLnZhbChiLnRleHQpLHRoaXMuaGFuZGxlU2VhcmNoKCl9LGQucHJvdG90eXBlLnJlc2l6ZVNlYXJjaD1mdW5jdGlvbigpe3RoaXMuJHNlYXJjaC5jc3MoXCJ3aWR0aFwiLFwiMjVweFwiKTt2YXIgYT1cIlwiO2lmKFwiXCIhPT10aGlzLiRzZWFyY2guYXR0cihcInBsYWNlaG9sZGVyXCIpKWE9dGhpcy4kc2VsZWN0aW9uLmZpbmQoXCIuc2VsZWN0Mi1zZWxlY3Rpb25fX3JlbmRlcmVkXCIpLmlubmVyV2lkdGgoKTtlbHNle3ZhciBiPXRoaXMuJHNlYXJjaC52YWwoKS5sZW5ndGgrMTthPS43NSpiK1wiZW1cIn10aGlzLiRzZWFyY2guY3NzKFwid2lkdGhcIixhKX0sZH0pLGIuZGVmaW5lKFwic2VsZWN0Mi9zZWxlY3Rpb24vZXZlbnRSZWxheVwiLFtcImpxdWVyeVwiXSxmdW5jdGlvbihhKXtmdW5jdGlvbiBiKCl7fXJldHVybiBiLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGIsYyxkKXt2YXIgZT10aGlzLGY9W1wib3BlblwiLFwib3BlbmluZ1wiLFwiY2xvc2VcIixcImNsb3NpbmdcIixcInNlbGVjdFwiLFwic2VsZWN0aW5nXCIsXCJ1bnNlbGVjdFwiLFwidW5zZWxlY3RpbmdcIl0sZz1bXCJvcGVuaW5nXCIsXCJjbG9zaW5nXCIsXCJzZWxlY3RpbmdcIixcInVuc2VsZWN0aW5nXCJdO2IuY2FsbCh0aGlzLGMsZCksYy5vbihcIipcIixmdW5jdGlvbihiLGMpe2lmKC0xIT09YS5pbkFycmF5KGIsZikpe2M9Y3x8e307dmFyIGQ9YS5FdmVudChcInNlbGVjdDI6XCIrYix7cGFyYW1zOmN9KTtlLiRlbGVtZW50LnRyaWdnZXIoZCksLTEhPT1hLmluQXJyYXkoYixnKSYmKGMucHJldmVudGVkPWQuaXNEZWZhdWx0UHJldmVudGVkKCkpfX0pfSxifSksYi5kZWZpbmUoXCJzZWxlY3QyL3RyYW5zbGF0aW9uXCIsW1wianF1ZXJ5XCIsXCJyZXF1aXJlXCJdLGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhhKXt0aGlzLmRpY3Q9YXx8e319cmV0dXJuIGMucHJvdG90eXBlLmFsbD1mdW5jdGlvbigpe3JldHVybiB0aGlzLmRpY3R9LGMucHJvdG90eXBlLmdldD1mdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5kaWN0W2FdfSxjLnByb3RvdHlwZS5leHRlbmQ9ZnVuY3Rpb24oYil7dGhpcy5kaWN0PWEuZXh0ZW5kKHt9LGIuYWxsKCksdGhpcy5kaWN0KX0sYy5fY2FjaGU9e30sYy5sb2FkUGF0aD1mdW5jdGlvbihhKXtpZighKGEgaW4gYy5fY2FjaGUpKXt2YXIgZD1iKGEpO2MuX2NhY2hlW2FdPWR9cmV0dXJuIG5ldyBjKGMuX2NhY2hlW2FdKX0sY30pLGIuZGVmaW5lKFwic2VsZWN0Mi9kaWFjcml0aWNzXCIsW10sZnVuY3Rpb24oKXt2YXIgYT17XCLikrZcIjpcIkFcIixcIu+8oVwiOlwiQVwiLFwiw4BcIjpcIkFcIixcIsOBXCI6XCJBXCIsXCLDglwiOlwiQVwiLFwi4bqmXCI6XCJBXCIsXCLhuqRcIjpcIkFcIixcIuG6qlwiOlwiQVwiLFwi4bqoXCI6XCJBXCIsXCLDg1wiOlwiQVwiLFwixIBcIjpcIkFcIixcIsSCXCI6XCJBXCIsXCLhurBcIjpcIkFcIixcIuG6rlwiOlwiQVwiLFwi4bq0XCI6XCJBXCIsXCLhurJcIjpcIkFcIixcIsimXCI6XCJBXCIsXCLHoFwiOlwiQVwiLFwiw4RcIjpcIkFcIixcIseeXCI6XCJBXCIsXCLhuqJcIjpcIkFcIixcIsOFXCI6XCJBXCIsXCLHulwiOlwiQVwiLFwix41cIjpcIkFcIixcIsiAXCI6XCJBXCIsXCLIglwiOlwiQVwiLFwi4bqgXCI6XCJBXCIsXCLhuqxcIjpcIkFcIixcIuG6tlwiOlwiQVwiLFwi4biAXCI6XCJBXCIsXCLEhFwiOlwiQVwiLFwiyLpcIjpcIkFcIixcIuKxr1wiOlwiQVwiLFwi6pyyXCI6XCJBQVwiLFwiw4ZcIjpcIkFFXCIsXCLHvFwiOlwiQUVcIixcIseiXCI6XCJBRVwiLFwi6py0XCI6XCJBT1wiLFwi6py2XCI6XCJBVVwiLFwi6py4XCI6XCJBVlwiLFwi6py6XCI6XCJBVlwiLFwi6py8XCI6XCJBWVwiLFwi4pK3XCI6XCJCXCIsXCLvvKJcIjpcIkJcIixcIuG4glwiOlwiQlwiLFwi4biEXCI6XCJCXCIsXCLhuIZcIjpcIkJcIixcIsmDXCI6XCJCXCIsXCLGglwiOlwiQlwiLFwixoFcIjpcIkJcIixcIuKSuFwiOlwiQ1wiLFwi77yjXCI6XCJDXCIsXCLEhlwiOlwiQ1wiLFwixIhcIjpcIkNcIixcIsSKXCI6XCJDXCIsXCLEjFwiOlwiQ1wiLFwiw4dcIjpcIkNcIixcIuG4iFwiOlwiQ1wiLFwixodcIjpcIkNcIixcIsi7XCI6XCJDXCIsXCLqnL5cIjpcIkNcIixcIuKSuVwiOlwiRFwiLFwi77ykXCI6XCJEXCIsXCLhuIpcIjpcIkRcIixcIsSOXCI6XCJEXCIsXCLhuIxcIjpcIkRcIixcIuG4kFwiOlwiRFwiLFwi4biSXCI6XCJEXCIsXCLhuI5cIjpcIkRcIixcIsSQXCI6XCJEXCIsXCLGi1wiOlwiRFwiLFwixopcIjpcIkRcIixcIsaJXCI6XCJEXCIsXCLqnblcIjpcIkRcIixcIsexXCI6XCJEWlwiLFwix4RcIjpcIkRaXCIsXCLHslwiOlwiRHpcIixcIseFXCI6XCJEelwiLFwi4pK6XCI6XCJFXCIsXCLvvKVcIjpcIkVcIixcIsOIXCI6XCJFXCIsXCLDiVwiOlwiRVwiLFwiw4pcIjpcIkVcIixcIuG7gFwiOlwiRVwiLFwi4bq+XCI6XCJFXCIsXCLhu4RcIjpcIkVcIixcIuG7glwiOlwiRVwiLFwi4bq8XCI6XCJFXCIsXCLEklwiOlwiRVwiLFwi4biUXCI6XCJFXCIsXCLhuJZcIjpcIkVcIixcIsSUXCI6XCJFXCIsXCLEllwiOlwiRVwiLFwiw4tcIjpcIkVcIixcIuG6ulwiOlwiRVwiLFwixJpcIjpcIkVcIixcIsiEXCI6XCJFXCIsXCLIhlwiOlwiRVwiLFwi4bq4XCI6XCJFXCIsXCLhu4ZcIjpcIkVcIixcIsioXCI6XCJFXCIsXCLhuJxcIjpcIkVcIixcIsSYXCI6XCJFXCIsXCLhuJhcIjpcIkVcIixcIuG4mlwiOlwiRVwiLFwixpBcIjpcIkVcIixcIsaOXCI6XCJFXCIsXCLikrtcIjpcIkZcIixcIu+8plwiOlwiRlwiLFwi4bieXCI6XCJGXCIsXCLGkVwiOlwiRlwiLFwi6p27XCI6XCJGXCIsXCLikrxcIjpcIkdcIixcIu+8p1wiOlwiR1wiLFwix7RcIjpcIkdcIixcIsScXCI6XCJHXCIsXCLhuKBcIjpcIkdcIixcIsSeXCI6XCJHXCIsXCLEoFwiOlwiR1wiLFwix6ZcIjpcIkdcIixcIsSiXCI6XCJHXCIsXCLHpFwiOlwiR1wiLFwixpNcIjpcIkdcIixcIuqeoFwiOlwiR1wiLFwi6p29XCI6XCJHXCIsXCLqnb5cIjpcIkdcIixcIuKSvVwiOlwiSFwiLFwi77yoXCI6XCJIXCIsXCLEpFwiOlwiSFwiLFwi4biiXCI6XCJIXCIsXCLhuKZcIjpcIkhcIixcIsieXCI6XCJIXCIsXCLhuKRcIjpcIkhcIixcIuG4qFwiOlwiSFwiLFwi4biqXCI6XCJIXCIsXCLEplwiOlwiSFwiLFwi4rGnXCI6XCJIXCIsXCLisbVcIjpcIkhcIixcIuqejVwiOlwiSFwiLFwi4pK+XCI6XCJJXCIsXCLvvKlcIjpcIklcIixcIsOMXCI6XCJJXCIsXCLDjVwiOlwiSVwiLFwiw45cIjpcIklcIixcIsSoXCI6XCJJXCIsXCLEqlwiOlwiSVwiLFwixKxcIjpcIklcIixcIsSwXCI6XCJJXCIsXCLDj1wiOlwiSVwiLFwi4biuXCI6XCJJXCIsXCLhu4hcIjpcIklcIixcIsePXCI6XCJJXCIsXCLIiFwiOlwiSVwiLFwiyIpcIjpcIklcIixcIuG7ilwiOlwiSVwiLFwixK5cIjpcIklcIixcIuG4rFwiOlwiSVwiLFwixpdcIjpcIklcIixcIuKSv1wiOlwiSlwiLFwi77yqXCI6XCJKXCIsXCLEtFwiOlwiSlwiLFwiyYhcIjpcIkpcIixcIuKTgFwiOlwiS1wiLFwi77yrXCI6XCJLXCIsXCLhuLBcIjpcIktcIixcIseoXCI6XCJLXCIsXCLhuLJcIjpcIktcIixcIsS2XCI6XCJLXCIsXCLhuLRcIjpcIktcIixcIsaYXCI6XCJLXCIsXCLisalcIjpcIktcIixcIuqdgFwiOlwiS1wiLFwi6p2CXCI6XCJLXCIsXCLqnYRcIjpcIktcIixcIuqeolwiOlwiS1wiLFwi4pOBXCI6XCJMXCIsXCLvvKxcIjpcIkxcIixcIsS/XCI6XCJMXCIsXCLEuVwiOlwiTFwiLFwixL1cIjpcIkxcIixcIuG4tlwiOlwiTFwiLFwi4bi4XCI6XCJMXCIsXCLEu1wiOlwiTFwiLFwi4bi8XCI6XCJMXCIsXCLhuLpcIjpcIkxcIixcIsWBXCI6XCJMXCIsXCLIvVwiOlwiTFwiLFwi4rGiXCI6XCJMXCIsXCLisaBcIjpcIkxcIixcIuqdiFwiOlwiTFwiLFwi6p2GXCI6XCJMXCIsXCLqnoBcIjpcIkxcIixcIseHXCI6XCJMSlwiLFwix4hcIjpcIkxqXCIsXCLik4JcIjpcIk1cIixcIu+8rVwiOlwiTVwiLFwi4bi+XCI6XCJNXCIsXCLhuYBcIjpcIk1cIixcIuG5glwiOlwiTVwiLFwi4rGuXCI6XCJNXCIsXCLGnFwiOlwiTVwiLFwi4pODXCI6XCJOXCIsXCLvvK5cIjpcIk5cIixcIse4XCI6XCJOXCIsXCLFg1wiOlwiTlwiLFwiw5FcIjpcIk5cIixcIuG5hFwiOlwiTlwiLFwixYdcIjpcIk5cIixcIuG5hlwiOlwiTlwiLFwixYVcIjpcIk5cIixcIuG5ilwiOlwiTlwiLFwi4bmIXCI6XCJOXCIsXCLIoFwiOlwiTlwiLFwixp1cIjpcIk5cIixcIuqekFwiOlwiTlwiLFwi6p6kXCI6XCJOXCIsXCLHilwiOlwiTkpcIixcIseLXCI6XCJOalwiLFwi4pOEXCI6XCJPXCIsXCLvvK9cIjpcIk9cIixcIsOSXCI6XCJPXCIsXCLDk1wiOlwiT1wiLFwiw5RcIjpcIk9cIixcIuG7klwiOlwiT1wiLFwi4buQXCI6XCJPXCIsXCLhu5ZcIjpcIk9cIixcIuG7lFwiOlwiT1wiLFwiw5VcIjpcIk9cIixcIuG5jFwiOlwiT1wiLFwiyKxcIjpcIk9cIixcIuG5jlwiOlwiT1wiLFwixYxcIjpcIk9cIixcIuG5kFwiOlwiT1wiLFwi4bmSXCI6XCJPXCIsXCLFjlwiOlwiT1wiLFwiyK5cIjpcIk9cIixcIsiwXCI6XCJPXCIsXCLDllwiOlwiT1wiLFwiyKpcIjpcIk9cIixcIuG7jlwiOlwiT1wiLFwixZBcIjpcIk9cIixcIseRXCI6XCJPXCIsXCLIjFwiOlwiT1wiLFwiyI5cIjpcIk9cIixcIsagXCI6XCJPXCIsXCLhu5xcIjpcIk9cIixcIuG7mlwiOlwiT1wiLFwi4bugXCI6XCJPXCIsXCLhu55cIjpcIk9cIixcIuG7olwiOlwiT1wiLFwi4buMXCI6XCJPXCIsXCLhu5hcIjpcIk9cIixcIseqXCI6XCJPXCIsXCLHrFwiOlwiT1wiLFwiw5hcIjpcIk9cIixcIse+XCI6XCJPXCIsXCLGhlwiOlwiT1wiLFwixp9cIjpcIk9cIixcIuqdilwiOlwiT1wiLFwi6p2MXCI6XCJPXCIsXCLGolwiOlwiT0lcIixcIuqdjlwiOlwiT09cIixcIsiiXCI6XCJPVVwiLFwi4pOFXCI6XCJQXCIsXCLvvLBcIjpcIlBcIixcIuG5lFwiOlwiUFwiLFwi4bmWXCI6XCJQXCIsXCLGpFwiOlwiUFwiLFwi4rGjXCI6XCJQXCIsXCLqnZBcIjpcIlBcIixcIuqdklwiOlwiUFwiLFwi6p2UXCI6XCJQXCIsXCLik4ZcIjpcIlFcIixcIu+8sVwiOlwiUVwiLFwi6p2WXCI6XCJRXCIsXCLqnZhcIjpcIlFcIixcIsmKXCI6XCJRXCIsXCLik4dcIjpcIlJcIixcIu+8slwiOlwiUlwiLFwixZRcIjpcIlJcIixcIuG5mFwiOlwiUlwiLFwixZhcIjpcIlJcIixcIsiQXCI6XCJSXCIsXCLIklwiOlwiUlwiLFwi4bmaXCI6XCJSXCIsXCLhuZxcIjpcIlJcIixcIsWWXCI6XCJSXCIsXCLhuZ5cIjpcIlJcIixcIsmMXCI6XCJSXCIsXCLisaRcIjpcIlJcIixcIuqdmlwiOlwiUlwiLFwi6p6mXCI6XCJSXCIsXCLqnoJcIjpcIlJcIixcIuKTiFwiOlwiU1wiLFwi77yzXCI6XCJTXCIsXCLhup5cIjpcIlNcIixcIsWaXCI6XCJTXCIsXCLhuaRcIjpcIlNcIixcIsWcXCI6XCJTXCIsXCLhuaBcIjpcIlNcIixcIsWgXCI6XCJTXCIsXCLhuaZcIjpcIlNcIixcIuG5olwiOlwiU1wiLFwi4bmoXCI6XCJTXCIsXCLImFwiOlwiU1wiLFwixZ5cIjpcIlNcIixcIuKxvlwiOlwiU1wiLFwi6p6oXCI6XCJTXCIsXCLqnoRcIjpcIlNcIixcIuKTiVwiOlwiVFwiLFwi77y0XCI6XCJUXCIsXCLhuapcIjpcIlRcIixcIsWkXCI6XCJUXCIsXCLhuaxcIjpcIlRcIixcIsiaXCI6XCJUXCIsXCLFolwiOlwiVFwiLFwi4bmwXCI6XCJUXCIsXCLhua5cIjpcIlRcIixcIsWmXCI6XCJUXCIsXCLGrFwiOlwiVFwiLFwixq5cIjpcIlRcIixcIsi+XCI6XCJUXCIsXCLqnoZcIjpcIlRcIixcIuqcqFwiOlwiVFpcIixcIuKTilwiOlwiVVwiLFwi77y1XCI6XCJVXCIsXCLDmVwiOlwiVVwiLFwiw5pcIjpcIlVcIixcIsObXCI6XCJVXCIsXCLFqFwiOlwiVVwiLFwi4bm4XCI6XCJVXCIsXCLFqlwiOlwiVVwiLFwi4bm6XCI6XCJVXCIsXCLFrFwiOlwiVVwiLFwiw5xcIjpcIlVcIixcIsebXCI6XCJVXCIsXCLHl1wiOlwiVVwiLFwix5VcIjpcIlVcIixcIseZXCI6XCJVXCIsXCLhu6ZcIjpcIlVcIixcIsWuXCI6XCJVXCIsXCLFsFwiOlwiVVwiLFwix5NcIjpcIlVcIixcIsiUXCI6XCJVXCIsXCLIllwiOlwiVVwiLFwixq9cIjpcIlVcIixcIuG7qlwiOlwiVVwiLFwi4buoXCI6XCJVXCIsXCLhu65cIjpcIlVcIixcIuG7rFwiOlwiVVwiLFwi4buwXCI6XCJVXCIsXCLhu6RcIjpcIlVcIixcIuG5slwiOlwiVVwiLFwixbJcIjpcIlVcIixcIuG5tlwiOlwiVVwiLFwi4bm0XCI6XCJVXCIsXCLJhFwiOlwiVVwiLFwi4pOLXCI6XCJWXCIsXCLvvLZcIjpcIlZcIixcIuG5vFwiOlwiVlwiLFwi4bm+XCI6XCJWXCIsXCLGslwiOlwiVlwiLFwi6p2eXCI6XCJWXCIsXCLJhVwiOlwiVlwiLFwi6p2gXCI6XCJWWVwiLFwi4pOMXCI6XCJXXCIsXCLvvLdcIjpcIldcIixcIuG6gFwiOlwiV1wiLFwi4bqCXCI6XCJXXCIsXCLFtFwiOlwiV1wiLFwi4bqGXCI6XCJXXCIsXCLhuoRcIjpcIldcIixcIuG6iFwiOlwiV1wiLFwi4rGyXCI6XCJXXCIsXCLik41cIjpcIlhcIixcIu+8uFwiOlwiWFwiLFwi4bqKXCI6XCJYXCIsXCLhuoxcIjpcIlhcIixcIuKTjlwiOlwiWVwiLFwi77y5XCI6XCJZXCIsXCLhu7JcIjpcIllcIixcIsOdXCI6XCJZXCIsXCLFtlwiOlwiWVwiLFwi4bu4XCI6XCJZXCIsXCLIslwiOlwiWVwiLFwi4bqOXCI6XCJZXCIsXCLFuFwiOlwiWVwiLFwi4bu2XCI6XCJZXCIsXCLhu7RcIjpcIllcIixcIsazXCI6XCJZXCIsXCLJjlwiOlwiWVwiLFwi4bu+XCI6XCJZXCIsXCLik49cIjpcIlpcIixcIu+8ulwiOlwiWlwiLFwixblcIjpcIlpcIixcIuG6kFwiOlwiWlwiLFwixbtcIjpcIlpcIixcIsW9XCI6XCJaXCIsXCLhupJcIjpcIlpcIixcIuG6lFwiOlwiWlwiLFwixrVcIjpcIlpcIixcIsikXCI6XCJaXCIsXCLisb9cIjpcIlpcIixcIuKxq1wiOlwiWlwiLFwi6p2iXCI6XCJaXCIsXCLik5BcIjpcImFcIixcIu+9gVwiOlwiYVwiLFwi4bqaXCI6XCJhXCIsXCLDoFwiOlwiYVwiLFwiw6FcIjpcImFcIixcIsOiXCI6XCJhXCIsXCLhuqdcIjpcImFcIixcIuG6pVwiOlwiYVwiLFwi4bqrXCI6XCJhXCIsXCLhuqlcIjpcImFcIixcIsOjXCI6XCJhXCIsXCLEgVwiOlwiYVwiLFwixINcIjpcImFcIixcIuG6sVwiOlwiYVwiLFwi4bqvXCI6XCJhXCIsXCLhurVcIjpcImFcIixcIuG6s1wiOlwiYVwiLFwiyKdcIjpcImFcIixcIsehXCI6XCJhXCIsXCLDpFwiOlwiYVwiLFwix59cIjpcImFcIixcIuG6o1wiOlwiYVwiLFwiw6VcIjpcImFcIixcIse7XCI6XCJhXCIsXCLHjlwiOlwiYVwiLFwiyIFcIjpcImFcIixcIsiDXCI6XCJhXCIsXCLhuqFcIjpcImFcIixcIuG6rVwiOlwiYVwiLFwi4bq3XCI6XCJhXCIsXCLhuIFcIjpcImFcIixcIsSFXCI6XCJhXCIsXCLisaVcIjpcImFcIixcIsmQXCI6XCJhXCIsXCLqnLNcIjpcImFhXCIsXCLDplwiOlwiYWVcIixcIse9XCI6XCJhZVwiLFwix6NcIjpcImFlXCIsXCLqnLVcIjpcImFvXCIsXCLqnLdcIjpcImF1XCIsXCLqnLlcIjpcImF2XCIsXCLqnLtcIjpcImF2XCIsXCLqnL1cIjpcImF5XCIsXCLik5FcIjpcImJcIixcIu+9glwiOlwiYlwiLFwi4biDXCI6XCJiXCIsXCLhuIVcIjpcImJcIixcIuG4h1wiOlwiYlwiLFwixoBcIjpcImJcIixcIsaDXCI6XCJiXCIsXCLJk1wiOlwiYlwiLFwi4pOSXCI6XCJjXCIsXCLvvYNcIjpcImNcIixcIsSHXCI6XCJjXCIsXCLEiVwiOlwiY1wiLFwixItcIjpcImNcIixcIsSNXCI6XCJjXCIsXCLDp1wiOlwiY1wiLFwi4biJXCI6XCJjXCIsXCLGiFwiOlwiY1wiLFwiyLxcIjpcImNcIixcIuqcv1wiOlwiY1wiLFwi4oaEXCI6XCJjXCIsXCLik5NcIjpcImRcIixcIu+9hFwiOlwiZFwiLFwi4biLXCI6XCJkXCIsXCLEj1wiOlwiZFwiLFwi4biNXCI6XCJkXCIsXCLhuJFcIjpcImRcIixcIuG4k1wiOlwiZFwiLFwi4biPXCI6XCJkXCIsXCLEkVwiOlwiZFwiLFwixoxcIjpcImRcIixcIsmWXCI6XCJkXCIsXCLJl1wiOlwiZFwiLFwi6p26XCI6XCJkXCIsXCLHs1wiOlwiZHpcIixcIseGXCI6XCJkelwiLFwi4pOUXCI6XCJlXCIsXCLvvYVcIjpcImVcIixcIsOoXCI6XCJlXCIsXCLDqVwiOlwiZVwiLFwiw6pcIjpcImVcIixcIuG7gVwiOlwiZVwiLFwi4bq/XCI6XCJlXCIsXCLhu4VcIjpcImVcIixcIuG7g1wiOlwiZVwiLFwi4bq9XCI6XCJlXCIsXCLEk1wiOlwiZVwiLFwi4biVXCI6XCJlXCIsXCLhuJdcIjpcImVcIixcIsSVXCI6XCJlXCIsXCLEl1wiOlwiZVwiLFwiw6tcIjpcImVcIixcIuG6u1wiOlwiZVwiLFwixJtcIjpcImVcIixcIsiFXCI6XCJlXCIsXCLIh1wiOlwiZVwiLFwi4bq5XCI6XCJlXCIsXCLhu4dcIjpcImVcIixcIsipXCI6XCJlXCIsXCLhuJ1cIjpcImVcIixcIsSZXCI6XCJlXCIsXCLhuJlcIjpcImVcIixcIuG4m1wiOlwiZVwiLFwiyYdcIjpcImVcIixcIsmbXCI6XCJlXCIsXCLHnVwiOlwiZVwiLFwi4pOVXCI6XCJmXCIsXCLvvYZcIjpcImZcIixcIuG4n1wiOlwiZlwiLFwixpJcIjpcImZcIixcIuqdvFwiOlwiZlwiLFwi4pOWXCI6XCJnXCIsXCLvvYdcIjpcImdcIixcIse1XCI6XCJnXCIsXCLEnVwiOlwiZ1wiLFwi4bihXCI6XCJnXCIsXCLEn1wiOlwiZ1wiLFwixKFcIjpcImdcIixcIsenXCI6XCJnXCIsXCLEo1wiOlwiZ1wiLFwix6VcIjpcImdcIixcIsmgXCI6XCJnXCIsXCLqnqFcIjpcImdcIixcIuG1uVwiOlwiZ1wiLFwi6p2/XCI6XCJnXCIsXCLik5dcIjpcImhcIixcIu+9iFwiOlwiaFwiLFwixKVcIjpcImhcIixcIuG4o1wiOlwiaFwiLFwi4binXCI6XCJoXCIsXCLIn1wiOlwiaFwiLFwi4bilXCI6XCJoXCIsXCLhuKlcIjpcImhcIixcIuG4q1wiOlwiaFwiLFwi4bqWXCI6XCJoXCIsXCLEp1wiOlwiaFwiLFwi4rGoXCI6XCJoXCIsXCLisbZcIjpcImhcIixcIsmlXCI6XCJoXCIsXCLGlVwiOlwiaHZcIixcIuKTmFwiOlwiaVwiLFwi772JXCI6XCJpXCIsXCLDrFwiOlwiaVwiLFwiw61cIjpcImlcIixcIsOuXCI6XCJpXCIsXCLEqVwiOlwiaVwiLFwixKtcIjpcImlcIixcIsStXCI6XCJpXCIsXCLDr1wiOlwiaVwiLFwi4bivXCI6XCJpXCIsXCLhu4lcIjpcImlcIixcIseQXCI6XCJpXCIsXCLIiVwiOlwiaVwiLFwiyItcIjpcImlcIixcIuG7i1wiOlwiaVwiLFwixK9cIjpcImlcIixcIuG4rVwiOlwiaVwiLFwiyahcIjpcImlcIixcIsSxXCI6XCJpXCIsXCLik5lcIjpcImpcIixcIu+9ilwiOlwialwiLFwixLVcIjpcImpcIixcIsewXCI6XCJqXCIsXCLJiVwiOlwialwiLFwi4pOaXCI6XCJrXCIsXCLvvYtcIjpcImtcIixcIuG4sVwiOlwia1wiLFwix6lcIjpcImtcIixcIuG4s1wiOlwia1wiLFwixLdcIjpcImtcIixcIuG4tVwiOlwia1wiLFwixplcIjpcImtcIixcIuKxqlwiOlwia1wiLFwi6p2BXCI6XCJrXCIsXCLqnYNcIjpcImtcIixcIuqdhVwiOlwia1wiLFwi6p6jXCI6XCJrXCIsXCLik5tcIjpcImxcIixcIu+9jFwiOlwibFwiLFwixYBcIjpcImxcIixcIsS6XCI6XCJsXCIsXCLEvlwiOlwibFwiLFwi4bi3XCI6XCJsXCIsXCLhuLlcIjpcImxcIixcIsS8XCI6XCJsXCIsXCLhuL1cIjpcImxcIixcIuG4u1wiOlwibFwiLFwixb9cIjpcImxcIixcIsWCXCI6XCJsXCIsXCLGmlwiOlwibFwiLFwiyatcIjpcImxcIixcIuKxoVwiOlwibFwiLFwi6p2JXCI6XCJsXCIsXCLqnoFcIjpcImxcIixcIuqdh1wiOlwibFwiLFwix4lcIjpcImxqXCIsXCLik5xcIjpcIm1cIixcIu+9jVwiOlwibVwiLFwi4bi/XCI6XCJtXCIsXCLhuYFcIjpcIm1cIixcIuG5g1wiOlwibVwiLFwiybFcIjpcIm1cIixcIsmvXCI6XCJtXCIsXCLik51cIjpcIm5cIixcIu+9jlwiOlwiblwiLFwix7lcIjpcIm5cIixcIsWEXCI6XCJuXCIsXCLDsVwiOlwiblwiLFwi4bmFXCI6XCJuXCIsXCLFiFwiOlwiblwiLFwi4bmHXCI6XCJuXCIsXCLFhlwiOlwiblwiLFwi4bmLXCI6XCJuXCIsXCLhuYlcIjpcIm5cIixcIsaeXCI6XCJuXCIsXCLJslwiOlwiblwiLFwixYlcIjpcIm5cIixcIuqekVwiOlwiblwiLFwi6p6lXCI6XCJuXCIsXCLHjFwiOlwibmpcIixcIuKTnlwiOlwib1wiLFwi772PXCI6XCJvXCIsXCLDslwiOlwib1wiLFwiw7NcIjpcIm9cIixcIsO0XCI6XCJvXCIsXCLhu5NcIjpcIm9cIixcIuG7kVwiOlwib1wiLFwi4buXXCI6XCJvXCIsXCLhu5VcIjpcIm9cIixcIsO1XCI6XCJvXCIsXCLhuY1cIjpcIm9cIixcIsitXCI6XCJvXCIsXCLhuY9cIjpcIm9cIixcIsWNXCI6XCJvXCIsXCLhuZFcIjpcIm9cIixcIuG5k1wiOlwib1wiLFwixY9cIjpcIm9cIixcIsivXCI6XCJvXCIsXCLIsVwiOlwib1wiLFwiw7ZcIjpcIm9cIixcIsirXCI6XCJvXCIsXCLhu49cIjpcIm9cIixcIsWRXCI6XCJvXCIsXCLHklwiOlwib1wiLFwiyI1cIjpcIm9cIixcIsiPXCI6XCJvXCIsXCLGoVwiOlwib1wiLFwi4budXCI6XCJvXCIsXCLhu5tcIjpcIm9cIixcIuG7oVwiOlwib1wiLFwi4bufXCI6XCJvXCIsXCLhu6NcIjpcIm9cIixcIuG7jVwiOlwib1wiLFwi4buZXCI6XCJvXCIsXCLHq1wiOlwib1wiLFwix61cIjpcIm9cIixcIsO4XCI6XCJvXCIsXCLHv1wiOlwib1wiLFwiyZRcIjpcIm9cIixcIuqdi1wiOlwib1wiLFwi6p2NXCI6XCJvXCIsXCLJtVwiOlwib1wiLFwixqNcIjpcIm9pXCIsXCLIo1wiOlwib3VcIixcIuqdj1wiOlwib29cIixcIuKTn1wiOlwicFwiLFwi772QXCI6XCJwXCIsXCLhuZVcIjpcInBcIixcIuG5l1wiOlwicFwiLFwixqVcIjpcInBcIixcIuG1vVwiOlwicFwiLFwi6p2RXCI6XCJwXCIsXCLqnZNcIjpcInBcIixcIuqdlVwiOlwicFwiLFwi4pOgXCI6XCJxXCIsXCLvvZFcIjpcInFcIixcIsmLXCI6XCJxXCIsXCLqnZdcIjpcInFcIixcIuqdmVwiOlwicVwiLFwi4pOhXCI6XCJyXCIsXCLvvZJcIjpcInJcIixcIsWVXCI6XCJyXCIsXCLhuZlcIjpcInJcIixcIsWZXCI6XCJyXCIsXCLIkVwiOlwiclwiLFwiyJNcIjpcInJcIixcIuG5m1wiOlwiclwiLFwi4bmdXCI6XCJyXCIsXCLFl1wiOlwiclwiLFwi4bmfXCI6XCJyXCIsXCLJjVwiOlwiclwiLFwiyb1cIjpcInJcIixcIuqdm1wiOlwiclwiLFwi6p6nXCI6XCJyXCIsXCLqnoNcIjpcInJcIixcIuKTolwiOlwic1wiLFwi772TXCI6XCJzXCIsXCLDn1wiOlwic1wiLFwixZtcIjpcInNcIixcIuG5pVwiOlwic1wiLFwixZ1cIjpcInNcIixcIuG5oVwiOlwic1wiLFwixaFcIjpcInNcIixcIuG5p1wiOlwic1wiLFwi4bmjXCI6XCJzXCIsXCLhualcIjpcInNcIixcIsiZXCI6XCJzXCIsXCLFn1wiOlwic1wiLFwiyL9cIjpcInNcIixcIuqeqVwiOlwic1wiLFwi6p6FXCI6XCJzXCIsXCLhuptcIjpcInNcIixcIuKTo1wiOlwidFwiLFwi772UXCI6XCJ0XCIsXCLhuatcIjpcInRcIixcIuG6l1wiOlwidFwiLFwixaVcIjpcInRcIixcIuG5rVwiOlwidFwiLFwiyJtcIjpcInRcIixcIsWjXCI6XCJ0XCIsXCLhubFcIjpcInRcIixcIuG5r1wiOlwidFwiLFwixadcIjpcInRcIixcIsatXCI6XCJ0XCIsXCLKiFwiOlwidFwiLFwi4rGmXCI6XCJ0XCIsXCLqnodcIjpcInRcIixcIuqcqVwiOlwidHpcIixcIuKTpFwiOlwidVwiLFwi772VXCI6XCJ1XCIsXCLDuVwiOlwidVwiLFwiw7pcIjpcInVcIixcIsO7XCI6XCJ1XCIsXCLFqVwiOlwidVwiLFwi4bm5XCI6XCJ1XCIsXCLFq1wiOlwidVwiLFwi4bm7XCI6XCJ1XCIsXCLFrVwiOlwidVwiLFwiw7xcIjpcInVcIixcIsecXCI6XCJ1XCIsXCLHmFwiOlwidVwiLFwix5ZcIjpcInVcIixcIseaXCI6XCJ1XCIsXCLhu6dcIjpcInVcIixcIsWvXCI6XCJ1XCIsXCLFsVwiOlwidVwiLFwix5RcIjpcInVcIixcIsiVXCI6XCJ1XCIsXCLIl1wiOlwidVwiLFwixrBcIjpcInVcIixcIuG7q1wiOlwidVwiLFwi4bupXCI6XCJ1XCIsXCLhu69cIjpcInVcIixcIuG7rVwiOlwidVwiLFwi4buxXCI6XCJ1XCIsXCLhu6VcIjpcInVcIixcIuG5s1wiOlwidVwiLFwixbNcIjpcInVcIixcIuG5t1wiOlwidVwiLFwi4bm1XCI6XCJ1XCIsXCLKiVwiOlwidVwiLFwi4pOlXCI6XCJ2XCIsXCLvvZZcIjpcInZcIixcIuG5vVwiOlwidlwiLFwi4bm/XCI6XCJ2XCIsXCLKi1wiOlwidlwiLFwi6p2fXCI6XCJ2XCIsXCLKjFwiOlwidlwiLFwi6p2hXCI6XCJ2eVwiLFwi4pOmXCI6XCJ3XCIsXCLvvZdcIjpcIndcIixcIuG6gVwiOlwid1wiLFwi4bqDXCI6XCJ3XCIsXCLFtVwiOlwid1wiLFwi4bqHXCI6XCJ3XCIsXCLhuoVcIjpcIndcIixcIuG6mFwiOlwid1wiLFwi4bqJXCI6XCJ3XCIsXCLisbNcIjpcIndcIixcIuKTp1wiOlwieFwiLFwi772YXCI6XCJ4XCIsXCLhuotcIjpcInhcIixcIuG6jVwiOlwieFwiLFwi4pOoXCI6XCJ5XCIsXCLvvZlcIjpcInlcIixcIuG7s1wiOlwieVwiLFwiw71cIjpcInlcIixcIsW3XCI6XCJ5XCIsXCLhu7lcIjpcInlcIixcIsizXCI6XCJ5XCIsXCLhuo9cIjpcInlcIixcIsO/XCI6XCJ5XCIsXCLhu7dcIjpcInlcIixcIuG6mVwiOlwieVwiLFwi4bu1XCI6XCJ5XCIsXCLGtFwiOlwieVwiLFwiyY9cIjpcInlcIixcIuG7v1wiOlwieVwiLFwi4pOpXCI6XCJ6XCIsXCLvvZpcIjpcInpcIixcIsW6XCI6XCJ6XCIsXCLhupFcIjpcInpcIixcIsW8XCI6XCJ6XCIsXCLFvlwiOlwielwiLFwi4bqTXCI6XCJ6XCIsXCLhupVcIjpcInpcIixcIsa2XCI6XCJ6XCIsXCLIpVwiOlwielwiLFwiyYBcIjpcInpcIixcIuKxrFwiOlwielwiLFwi6p2jXCI6XCJ6XCIsXCLOhlwiOlwizpFcIixcIs6IXCI6XCLOlVwiLFwizolcIjpcIs6XXCIsXCLOilwiOlwizplcIixcIs6qXCI6XCLOmVwiLFwizoxcIjpcIs6fXCIsXCLOjlwiOlwizqVcIixcIs6rXCI6XCLOpVwiLFwizo9cIjpcIs6pXCIsXCLOrFwiOlwizrFcIixcIs6tXCI6XCLOtVwiLFwizq5cIjpcIs63XCIsXCLOr1wiOlwizrlcIixcIs+KXCI6XCLOuVwiLFwizpBcIjpcIs65XCIsXCLPjFwiOlwizr9cIixcIs+NXCI6XCLPhVwiLFwiz4tcIjpcIs+FXCIsXCLOsFwiOlwiz4VcIixcIs+JXCI6XCLPiVwiLFwiz4JcIjpcIs+DXCJ9O3JldHVybiBhfSksYi5kZWZpbmUoXCJzZWxlY3QyL2RhdGEvYmFzZVwiLFtcIi4uL3V0aWxzXCJdLGZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoYSxjKXtiLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMpfXJldHVybiBhLkV4dGVuZChiLGEuT2JzZXJ2YWJsZSksYi5wcm90b3R5cGUuY3VycmVudD1mdW5jdGlvbihhKXt0aHJvdyBuZXcgRXJyb3IoXCJUaGUgYGN1cnJlbnRgIG1ldGhvZCBtdXN0IGJlIGRlZmluZWQgaW4gY2hpbGQgY2xhc3Nlcy5cIil9LGIucHJvdG90eXBlLnF1ZXJ5PWZ1bmN0aW9uKGEsYil7dGhyb3cgbmV3IEVycm9yKFwiVGhlIGBxdWVyeWAgbWV0aG9kIG11c3QgYmUgZGVmaW5lZCBpbiBjaGlsZCBjbGFzc2VzLlwiKX0sYi5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihhLGIpe30sYi5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe30sYi5wcm90b3R5cGUuZ2VuZXJhdGVSZXN1bHRJZD1mdW5jdGlvbihiLGMpe3ZhciBkPWIuaWQrXCItcmVzdWx0LVwiO3JldHVybiBkKz1hLmdlbmVyYXRlQ2hhcnMoNCksZCs9bnVsbCE9Yy5pZD9cIi1cIitjLmlkLnRvU3RyaW5nKCk6XCItXCIrYS5nZW5lcmF0ZUNoYXJzKDQpfSxifSksYi5kZWZpbmUoXCJzZWxlY3QyL2RhdGEvc2VsZWN0XCIsW1wiLi9iYXNlXCIsXCIuLi91dGlsc1wiLFwianF1ZXJ5XCJdLGZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGEsYil7dGhpcy4kZWxlbWVudD1hLHRoaXMub3B0aW9ucz1iLGQuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmNhbGwodGhpcyl9cmV0dXJuIGIuRXh0ZW5kKGQsYSksZC5wcm90b3R5cGUuY3VycmVudD1mdW5jdGlvbihhKXt2YXIgYj1bXSxkPXRoaXM7dGhpcy4kZWxlbWVudC5maW5kKFwiOnNlbGVjdGVkXCIpLmVhY2goZnVuY3Rpb24oKXt2YXIgYT1jKHRoaXMpLGU9ZC5pdGVtKGEpO2IucHVzaChlKX0pLGEoYil9LGQucHJvdG90eXBlLnNlbGVjdD1mdW5jdGlvbihhKXt2YXIgYj10aGlzO2lmKGEuc2VsZWN0ZWQ9ITAsYyhhLmVsZW1lbnQpLmlzKFwib3B0aW9uXCIpKXJldHVybiBhLmVsZW1lbnQuc2VsZWN0ZWQ9ITAsdm9pZCB0aGlzLiRlbGVtZW50LnRyaWdnZXIoXCJjaGFuZ2VcIik7XG5pZih0aGlzLiRlbGVtZW50LnByb3AoXCJtdWx0aXBsZVwiKSl0aGlzLmN1cnJlbnQoZnVuY3Rpb24oZCl7dmFyIGU9W107YT1bYV0sYS5wdXNoLmFwcGx5KGEsZCk7Zm9yKHZhciBmPTA7ZjxhLmxlbmd0aDtmKyspe3ZhciBnPWFbZl0uaWQ7LTE9PT1jLmluQXJyYXkoZyxlKSYmZS5wdXNoKGcpfWIuJGVsZW1lbnQudmFsKGUpLGIuJGVsZW1lbnQudHJpZ2dlcihcImNoYW5nZVwiKX0pO2Vsc2V7dmFyIGQ9YS5pZDt0aGlzLiRlbGVtZW50LnZhbChkKSx0aGlzLiRlbGVtZW50LnRyaWdnZXIoXCJjaGFuZ2VcIil9fSxkLnByb3RvdHlwZS51bnNlbGVjdD1mdW5jdGlvbihhKXt2YXIgYj10aGlzO2lmKHRoaXMuJGVsZW1lbnQucHJvcChcIm11bHRpcGxlXCIpKXJldHVybiBhLnNlbGVjdGVkPSExLGMoYS5lbGVtZW50KS5pcyhcIm9wdGlvblwiKT8oYS5lbGVtZW50LnNlbGVjdGVkPSExLHZvaWQgdGhpcy4kZWxlbWVudC50cmlnZ2VyKFwiY2hhbmdlXCIpKTp2b2lkIHRoaXMuY3VycmVudChmdW5jdGlvbihkKXtmb3IodmFyIGU9W10sZj0wO2Y8ZC5sZW5ndGg7ZisrKXt2YXIgZz1kW2ZdLmlkO2chPT1hLmlkJiYtMT09PWMuaW5BcnJheShnLGUpJiZlLnB1c2goZyl9Yi4kZWxlbWVudC52YWwoZSksYi4kZWxlbWVudC50cmlnZ2VyKFwiY2hhbmdlXCIpfSl9LGQucHJvdG90eXBlLmJpbmQ9ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzO3RoaXMuY29udGFpbmVyPWEsYS5vbihcInNlbGVjdFwiLGZ1bmN0aW9uKGEpe2Muc2VsZWN0KGEuZGF0YSl9KSxhLm9uKFwidW5zZWxlY3RcIixmdW5jdGlvbihhKXtjLnVuc2VsZWN0KGEuZGF0YSl9KX0sZC5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe3RoaXMuJGVsZW1lbnQuZmluZChcIipcIikuZWFjaChmdW5jdGlvbigpe2MucmVtb3ZlRGF0YSh0aGlzLFwiZGF0YVwiKX0pfSxkLnByb3RvdHlwZS5xdWVyeT1mdW5jdGlvbihhLGIpe3ZhciBkPVtdLGU9dGhpcyxmPXRoaXMuJGVsZW1lbnQuY2hpbGRyZW4oKTtmLmVhY2goZnVuY3Rpb24oKXt2YXIgYj1jKHRoaXMpO2lmKGIuaXMoXCJvcHRpb25cIil8fGIuaXMoXCJvcHRncm91cFwiKSl7dmFyIGY9ZS5pdGVtKGIpLGc9ZS5tYXRjaGVzKGEsZik7bnVsbCE9PWcmJmQucHVzaChnKX19KSxiKHtyZXN1bHRzOmR9KX0sZC5wcm90b3R5cGUuYWRkT3B0aW9ucz1mdW5jdGlvbihhKXtiLmFwcGVuZE1hbnkodGhpcy4kZWxlbWVudCxhKX0sZC5wcm90b3R5cGUub3B0aW9uPWZ1bmN0aW9uKGEpe3ZhciBiO2EuY2hpbGRyZW4/KGI9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9wdGdyb3VwXCIpLGIubGFiZWw9YS50ZXh0KTooYj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpLHZvaWQgMCE9PWIudGV4dENvbnRlbnQ/Yi50ZXh0Q29udGVudD1hLnRleHQ6Yi5pbm5lclRleHQ9YS50ZXh0KSxhLmlkJiYoYi52YWx1ZT1hLmlkKSxhLmRpc2FibGVkJiYoYi5kaXNhYmxlZD0hMCksYS5zZWxlY3RlZCYmKGIuc2VsZWN0ZWQ9ITApLGEudGl0bGUmJihiLnRpdGxlPWEudGl0bGUpO3ZhciBkPWMoYiksZT10aGlzLl9ub3JtYWxpemVJdGVtKGEpO3JldHVybiBlLmVsZW1lbnQ9YixjLmRhdGEoYixcImRhdGFcIixlKSxkfSxkLnByb3RvdHlwZS5pdGVtPWZ1bmN0aW9uKGEpe3ZhciBiPXt9O2lmKGI9Yy5kYXRhKGFbMF0sXCJkYXRhXCIpLG51bGwhPWIpcmV0dXJuIGI7aWYoYS5pcyhcIm9wdGlvblwiKSliPXtpZDphLnZhbCgpLHRleHQ6YS50ZXh0KCksZGlzYWJsZWQ6YS5wcm9wKFwiZGlzYWJsZWRcIiksc2VsZWN0ZWQ6YS5wcm9wKFwic2VsZWN0ZWRcIiksdGl0bGU6YS5wcm9wKFwidGl0bGVcIil9O2Vsc2UgaWYoYS5pcyhcIm9wdGdyb3VwXCIpKXtiPXt0ZXh0OmEucHJvcChcImxhYmVsXCIpLGNoaWxkcmVuOltdLHRpdGxlOmEucHJvcChcInRpdGxlXCIpfTtmb3IodmFyIGQ9YS5jaGlsZHJlbihcIm9wdGlvblwiKSxlPVtdLGY9MDtmPGQubGVuZ3RoO2YrKyl7dmFyIGc9YyhkW2ZdKSxoPXRoaXMuaXRlbShnKTtlLnB1c2goaCl9Yi5jaGlsZHJlbj1lfXJldHVybiBiPXRoaXMuX25vcm1hbGl6ZUl0ZW0oYiksYi5lbGVtZW50PWFbMF0sYy5kYXRhKGFbMF0sXCJkYXRhXCIsYiksYn0sZC5wcm90b3R5cGUuX25vcm1hbGl6ZUl0ZW09ZnVuY3Rpb24oYSl7Yy5pc1BsYWluT2JqZWN0KGEpfHwoYT17aWQ6YSx0ZXh0OmF9KSxhPWMuZXh0ZW5kKHt9LHt0ZXh0OlwiXCJ9LGEpO3ZhciBiPXtzZWxlY3RlZDohMSxkaXNhYmxlZDohMX07cmV0dXJuIG51bGwhPWEuaWQmJihhLmlkPWEuaWQudG9TdHJpbmcoKSksbnVsbCE9YS50ZXh0JiYoYS50ZXh0PWEudGV4dC50b1N0cmluZygpKSxudWxsPT1hLl9yZXN1bHRJZCYmYS5pZCYmbnVsbCE9dGhpcy5jb250YWluZXImJihhLl9yZXN1bHRJZD10aGlzLmdlbmVyYXRlUmVzdWx0SWQodGhpcy5jb250YWluZXIsYSkpLGMuZXh0ZW5kKHt9LGIsYSl9LGQucHJvdG90eXBlLm1hdGNoZXM9ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzLm9wdGlvbnMuZ2V0KFwibWF0Y2hlclwiKTtyZXR1cm4gYyhhLGIpfSxkfSksYi5kZWZpbmUoXCJzZWxlY3QyL2RhdGEvYXJyYXlcIixbXCIuL3NlbGVjdFwiLFwiLi4vdXRpbHNcIixcImpxdWVyeVwiXSxmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZChhLGIpe3ZhciBjPWIuZ2V0KFwiZGF0YVwiKXx8W107ZC5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzLGEsYiksdGhpcy5hZGRPcHRpb25zKHRoaXMuY29udmVydFRvT3B0aW9ucyhjKSl9cmV0dXJuIGIuRXh0ZW5kKGQsYSksZC5wcm90b3R5cGUuc2VsZWN0PWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMuJGVsZW1lbnQuZmluZChcIm9wdGlvblwiKS5maWx0ZXIoZnVuY3Rpb24oYixjKXtyZXR1cm4gYy52YWx1ZT09YS5pZC50b1N0cmluZygpfSk7MD09PWIubGVuZ3RoJiYoYj10aGlzLm9wdGlvbihhKSx0aGlzLmFkZE9wdGlvbnMoYikpLGQuX19zdXBlcl9fLnNlbGVjdC5jYWxsKHRoaXMsYSl9LGQucHJvdG90eXBlLmNvbnZlcnRUb09wdGlvbnM9ZnVuY3Rpb24oYSl7ZnVuY3Rpb24gZChhKXtyZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gYyh0aGlzKS52YWwoKT09YS5pZH19Zm9yKHZhciBlPXRoaXMsZj10aGlzLiRlbGVtZW50LmZpbmQoXCJvcHRpb25cIiksZz1mLm1hcChmdW5jdGlvbigpe3JldHVybiBlLml0ZW0oYyh0aGlzKSkuaWR9KS5nZXQoKSxoPVtdLGk9MDtpPGEubGVuZ3RoO2krKyl7dmFyIGo9dGhpcy5fbm9ybWFsaXplSXRlbShhW2ldKTtpZihjLmluQXJyYXkoai5pZCxnKT49MCl7dmFyIGs9Zi5maWx0ZXIoZChqKSksbD10aGlzLml0ZW0oayksbT1jLmV4dGVuZCghMCx7fSxqLGwpLG49dGhpcy5vcHRpb24obSk7ay5yZXBsYWNlV2l0aChuKX1lbHNle3ZhciBvPXRoaXMub3B0aW9uKGopO2lmKGouY2hpbGRyZW4pe3ZhciBwPXRoaXMuY29udmVydFRvT3B0aW9ucyhqLmNoaWxkcmVuKTtiLmFwcGVuZE1hbnkobyxwKX1oLnB1c2gobyl9fXJldHVybiBofSxkfSksYi5kZWZpbmUoXCJzZWxlY3QyL2RhdGEvYWpheFwiLFtcIi4vYXJyYXlcIixcIi4uL3V0aWxzXCIsXCJqcXVlcnlcIl0sZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQoYSxiKXt0aGlzLmFqYXhPcHRpb25zPXRoaXMuX2FwcGx5RGVmYXVsdHMoYi5nZXQoXCJhamF4XCIpKSxudWxsIT10aGlzLmFqYXhPcHRpb25zLnByb2Nlc3NSZXN1bHRzJiYodGhpcy5wcm9jZXNzUmVzdWx0cz10aGlzLmFqYXhPcHRpb25zLnByb2Nlc3NSZXN1bHRzKSxkLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsYSxiKX1yZXR1cm4gYi5FeHRlbmQoZCxhKSxkLnByb3RvdHlwZS5fYXBwbHlEZWZhdWx0cz1mdW5jdGlvbihhKXt2YXIgYj17ZGF0YTpmdW5jdGlvbihhKXtyZXR1cm4gYy5leHRlbmQoe30sYSx7cTphLnRlcm19KX0sdHJhbnNwb3J0OmZ1bmN0aW9uKGEsYixkKXt2YXIgZT1jLmFqYXgoYSk7cmV0dXJuIGUudGhlbihiKSxlLmZhaWwoZCksZX19O3JldHVybiBjLmV4dGVuZCh7fSxiLGEsITApfSxkLnByb3RvdHlwZS5wcm9jZXNzUmVzdWx0cz1mdW5jdGlvbihhKXtyZXR1cm4gYX0sZC5wcm90b3R5cGUucXVlcnk9ZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBkKCl7dmFyIGQ9Zi50cmFuc3BvcnQoZixmdW5jdGlvbihkKXt2YXIgZj1lLnByb2Nlc3NSZXN1bHRzKGQsYSk7ZS5vcHRpb25zLmdldChcImRlYnVnXCIpJiZ3aW5kb3cuY29uc29sZSYmY29uc29sZS5lcnJvciYmKGYmJmYucmVzdWx0cyYmYy5pc0FycmF5KGYucmVzdWx0cyl8fGNvbnNvbGUuZXJyb3IoXCJTZWxlY3QyOiBUaGUgQUpBWCByZXN1bHRzIGRpZCBub3QgcmV0dXJuIGFuIGFycmF5IGluIHRoZSBgcmVzdWx0c2Aga2V5IG9mIHRoZSByZXNwb25zZS5cIikpLGIoZil9LGZ1bmN0aW9uKCl7ZC5zdGF0dXMmJlwiMFwiPT09ZC5zdGF0dXN8fGUudHJpZ2dlcihcInJlc3VsdHM6bWVzc2FnZVwiLHttZXNzYWdlOlwiZXJyb3JMb2FkaW5nXCJ9KX0pO2UuX3JlcXVlc3Q9ZH12YXIgZT10aGlzO251bGwhPXRoaXMuX3JlcXVlc3QmJihjLmlzRnVuY3Rpb24odGhpcy5fcmVxdWVzdC5hYm9ydCkmJnRoaXMuX3JlcXVlc3QuYWJvcnQoKSx0aGlzLl9yZXF1ZXN0PW51bGwpO3ZhciBmPWMuZXh0ZW5kKHt0eXBlOlwiR0VUXCJ9LHRoaXMuYWpheE9wdGlvbnMpO1wiZnVuY3Rpb25cIj09dHlwZW9mIGYudXJsJiYoZi51cmw9Zi51cmwuY2FsbCh0aGlzLiRlbGVtZW50LGEpKSxcImZ1bmN0aW9uXCI9PXR5cGVvZiBmLmRhdGEmJihmLmRhdGE9Zi5kYXRhLmNhbGwodGhpcy4kZWxlbWVudCxhKSksdGhpcy5hamF4T3B0aW9ucy5kZWxheSYmbnVsbCE9YS50ZXJtPyh0aGlzLl9xdWVyeVRpbWVvdXQmJndpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5fcXVlcnlUaW1lb3V0KSx0aGlzLl9xdWVyeVRpbWVvdXQ9d2luZG93LnNldFRpbWVvdXQoZCx0aGlzLmFqYXhPcHRpb25zLmRlbGF5KSk6ZCgpfSxkfSksYi5kZWZpbmUoXCJzZWxlY3QyL2RhdGEvdGFnc1wiLFtcImpxdWVyeVwiXSxmdW5jdGlvbihhKXtmdW5jdGlvbiBiKGIsYyxkKXt2YXIgZT1kLmdldChcInRhZ3NcIiksZj1kLmdldChcImNyZWF0ZVRhZ1wiKTt2b2lkIDAhPT1mJiYodGhpcy5jcmVhdGVUYWc9Zik7dmFyIGc9ZC5nZXQoXCJpbnNlcnRUYWdcIik7aWYodm9pZCAwIT09ZyYmKHRoaXMuaW5zZXJ0VGFnPWcpLGIuY2FsbCh0aGlzLGMsZCksYS5pc0FycmF5KGUpKWZvcih2YXIgaD0wO2g8ZS5sZW5ndGg7aCsrKXt2YXIgaT1lW2hdLGo9dGhpcy5fbm9ybWFsaXplSXRlbShpKSxrPXRoaXMub3B0aW9uKGopO3RoaXMuJGVsZW1lbnQuYXBwZW5kKGspfX1yZXR1cm4gYi5wcm90b3R5cGUucXVlcnk9ZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQoYSxmKXtmb3IodmFyIGc9YS5yZXN1bHRzLGg9MDtoPGcubGVuZ3RoO2grKyl7dmFyIGk9Z1toXSxqPW51bGwhPWkuY2hpbGRyZW4mJiFkKHtyZXN1bHRzOmkuY2hpbGRyZW59LCEwKSxrPWkudGV4dD09PWIudGVybTtpZihrfHxqKXJldHVybiBmPyExOihhLmRhdGE9Zyx2b2lkIGMoYSkpfWlmKGYpcmV0dXJuITA7dmFyIGw9ZS5jcmVhdGVUYWcoYik7aWYobnVsbCE9bCl7dmFyIG09ZS5vcHRpb24obCk7bS5hdHRyKFwiZGF0YS1zZWxlY3QyLXRhZ1wiLCEwKSxlLmFkZE9wdGlvbnMoW21dKSxlLmluc2VydFRhZyhnLGwpfWEucmVzdWx0cz1nLGMoYSl9dmFyIGU9dGhpcztyZXR1cm4gdGhpcy5fcmVtb3ZlT2xkVGFncygpLG51bGw9PWIudGVybXx8bnVsbCE9Yi5wYWdlP3ZvaWQgYS5jYWxsKHRoaXMsYixjKTp2b2lkIGEuY2FsbCh0aGlzLGIsZCl9LGIucHJvdG90eXBlLmNyZWF0ZVRhZz1mdW5jdGlvbihiLGMpe3ZhciBkPWEudHJpbShjLnRlcm0pO3JldHVyblwiXCI9PT1kP251bGw6e2lkOmQsdGV4dDpkfX0sYi5wcm90b3R5cGUuaW5zZXJ0VGFnPWZ1bmN0aW9uKGEsYixjKXtiLnVuc2hpZnQoYyl9LGIucHJvdG90eXBlLl9yZW1vdmVPbGRUYWdzPWZ1bmN0aW9uKGIpe3ZhciBjPSh0aGlzLl9sYXN0VGFnLHRoaXMuJGVsZW1lbnQuZmluZChcIm9wdGlvbltkYXRhLXNlbGVjdDItdGFnXVwiKSk7Yy5lYWNoKGZ1bmN0aW9uKCl7dGhpcy5zZWxlY3RlZHx8YSh0aGlzKS5yZW1vdmUoKX0pfSxifSksYi5kZWZpbmUoXCJzZWxlY3QyL2RhdGEvdG9rZW5pemVyXCIsW1wianF1ZXJ5XCJdLGZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoYSxiLGMpe3ZhciBkPWMuZ2V0KFwidG9rZW5pemVyXCIpO3ZvaWQgMCE9PWQmJih0aGlzLnRva2VuaXplcj1kKSxhLmNhbGwodGhpcyxiLGMpfXJldHVybiBiLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGEsYixjKXthLmNhbGwodGhpcyxiLGMpLHRoaXMuJHNlYXJjaD1iLmRyb3Bkb3duLiRzZWFyY2h8fGIuc2VsZWN0aW9uLiRzZWFyY2h8fGMuZmluZChcIi5zZWxlY3QyLXNlYXJjaF9fZmllbGRcIil9LGIucHJvdG90eXBlLnF1ZXJ5PWZ1bmN0aW9uKGIsYyxkKXtmdW5jdGlvbiBlKGIpe3ZhciBjPWcuX25vcm1hbGl6ZUl0ZW0oYiksZD1nLiRlbGVtZW50LmZpbmQoXCJvcHRpb25cIikuZmlsdGVyKGZ1bmN0aW9uKCl7cmV0dXJuIGEodGhpcykudmFsKCk9PT1jLmlkfSk7aWYoIWQubGVuZ3RoKXt2YXIgZT1nLm9wdGlvbihjKTtlLmF0dHIoXCJkYXRhLXNlbGVjdDItdGFnXCIsITApLGcuX3JlbW92ZU9sZFRhZ3MoKSxnLmFkZE9wdGlvbnMoW2VdKX1mKGMpfWZ1bmN0aW9uIGYoYSl7Zy50cmlnZ2VyKFwic2VsZWN0XCIse2RhdGE6YX0pfXZhciBnPXRoaXM7Yy50ZXJtPWMudGVybXx8XCJcIjt2YXIgaD10aGlzLnRva2VuaXplcihjLHRoaXMub3B0aW9ucyxlKTtoLnRlcm0hPT1jLnRlcm0mJih0aGlzLiRzZWFyY2gubGVuZ3RoJiYodGhpcy4kc2VhcmNoLnZhbChoLnRlcm0pLHRoaXMuJHNlYXJjaC5mb2N1cygpKSxjLnRlcm09aC50ZXJtKSxiLmNhbGwodGhpcyxjLGQpfSxiLnByb3RvdHlwZS50b2tlbml6ZXI9ZnVuY3Rpb24oYixjLGQsZSl7Zm9yKHZhciBmPWQuZ2V0KFwidG9rZW5TZXBhcmF0b3JzXCIpfHxbXSxnPWMudGVybSxoPTAsaT10aGlzLmNyZWF0ZVRhZ3x8ZnVuY3Rpb24oYSl7cmV0dXJue2lkOmEudGVybSx0ZXh0OmEudGVybX19O2g8Zy5sZW5ndGg7KXt2YXIgaj1nW2hdO2lmKC0xIT09YS5pbkFycmF5KGosZikpe3ZhciBrPWcuc3Vic3RyKDAsaCksbD1hLmV4dGVuZCh7fSxjLHt0ZXJtOmt9KSxtPWkobCk7bnVsbCE9bT8oZShtKSxnPWcuc3Vic3RyKGgrMSl8fFwiXCIsaD0wKTpoKyt9ZWxzZSBoKyt9cmV0dXJue3Rlcm06Z319LGJ9KSxiLmRlZmluZShcInNlbGVjdDIvZGF0YS9taW5pbXVtSW5wdXRMZW5ndGhcIixbXSxmdW5jdGlvbigpe2Z1bmN0aW9uIGEoYSxiLGMpe3RoaXMubWluaW11bUlucHV0TGVuZ3RoPWMuZ2V0KFwibWluaW11bUlucHV0TGVuZ3RoXCIpLGEuY2FsbCh0aGlzLGIsYyl9cmV0dXJuIGEucHJvdG90eXBlLnF1ZXJ5PWZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gYi50ZXJtPWIudGVybXx8XCJcIixiLnRlcm0ubGVuZ3RoPHRoaXMubWluaW11bUlucHV0TGVuZ3RoP3ZvaWQgdGhpcy50cmlnZ2VyKFwicmVzdWx0czptZXNzYWdlXCIse21lc3NhZ2U6XCJpbnB1dFRvb1Nob3J0XCIsYXJnczp7bWluaW11bTp0aGlzLm1pbmltdW1JbnB1dExlbmd0aCxpbnB1dDpiLnRlcm0scGFyYW1zOmJ9fSk6dm9pZCBhLmNhbGwodGhpcyxiLGMpfSxhfSksYi5kZWZpbmUoXCJzZWxlY3QyL2RhdGEvbWF4aW11bUlucHV0TGVuZ3RoXCIsW10sZnVuY3Rpb24oKXtmdW5jdGlvbiBhKGEsYixjKXt0aGlzLm1heGltdW1JbnB1dExlbmd0aD1jLmdldChcIm1heGltdW1JbnB1dExlbmd0aFwiKSxhLmNhbGwodGhpcyxiLGMpfXJldHVybiBhLnByb3RvdHlwZS5xdWVyeT1mdW5jdGlvbihhLGIsYyl7cmV0dXJuIGIudGVybT1iLnRlcm18fFwiXCIsdGhpcy5tYXhpbXVtSW5wdXRMZW5ndGg+MCYmYi50ZXJtLmxlbmd0aD50aGlzLm1heGltdW1JbnB1dExlbmd0aD92b2lkIHRoaXMudHJpZ2dlcihcInJlc3VsdHM6bWVzc2FnZVwiLHttZXNzYWdlOlwiaW5wdXRUb29Mb25nXCIsYXJnczp7bWF4aW11bTp0aGlzLm1heGltdW1JbnB1dExlbmd0aCxpbnB1dDpiLnRlcm0scGFyYW1zOmJ9fSk6dm9pZCBhLmNhbGwodGhpcyxiLGMpfSxhfSksYi5kZWZpbmUoXCJzZWxlY3QyL2RhdGEvbWF4aW11bVNlbGVjdGlvbkxlbmd0aFwiLFtdLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShhLGIsYyl7dGhpcy5tYXhpbXVtU2VsZWN0aW9uTGVuZ3RoPWMuZ2V0KFwibWF4aW11bVNlbGVjdGlvbkxlbmd0aFwiKSxhLmNhbGwodGhpcyxiLGMpfXJldHVybiBhLnByb3RvdHlwZS5xdWVyeT1mdW5jdGlvbihhLGIsYyl7dmFyIGQ9dGhpczt0aGlzLmN1cnJlbnQoZnVuY3Rpb24oZSl7dmFyIGY9bnVsbCE9ZT9lLmxlbmd0aDowO3JldHVybiBkLm1heGltdW1TZWxlY3Rpb25MZW5ndGg+MCYmZj49ZC5tYXhpbXVtU2VsZWN0aW9uTGVuZ3RoP3ZvaWQgZC50cmlnZ2VyKFwicmVzdWx0czptZXNzYWdlXCIse21lc3NhZ2U6XCJtYXhpbXVtU2VsZWN0ZWRcIixhcmdzOnttYXhpbXVtOmQubWF4aW11bVNlbGVjdGlvbkxlbmd0aH19KTp2b2lkIGEuY2FsbChkLGIsYyl9KX0sYX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kcm9wZG93blwiLFtcImpxdWVyeVwiLFwiLi91dGlsc1wiXSxmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYSxiKXt0aGlzLiRlbGVtZW50PWEsdGhpcy5vcHRpb25zPWIsYy5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzKX1yZXR1cm4gYi5FeHRlbmQoYyxiLk9ic2VydmFibGUpLGMucHJvdG90eXBlLnJlbmRlcj1mdW5jdGlvbigpe3ZhciBiPWEoJzxzcGFuIGNsYXNzPVwic2VsZWN0Mi1kcm9wZG93blwiPjxzcGFuIGNsYXNzPVwic2VsZWN0Mi1yZXN1bHRzXCI+PC9zcGFuPjwvc3Bhbj4nKTtyZXR1cm4gYi5hdHRyKFwiZGlyXCIsdGhpcy5vcHRpb25zLmdldChcImRpclwiKSksdGhpcy4kZHJvcGRvd249YixifSxjLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKCl7fSxjLnByb3RvdHlwZS5wb3NpdGlvbj1mdW5jdGlvbihhLGIpe30sYy5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe3RoaXMuJGRyb3Bkb3duLnJlbW92ZSgpfSxjfSksYi5kZWZpbmUoXCJzZWxlY3QyL2Ryb3Bkb3duL3NlYXJjaFwiLFtcImpxdWVyeVwiLFwiLi4vdXRpbHNcIl0sZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKCl7fXJldHVybiBjLnByb3RvdHlwZS5yZW5kZXI9ZnVuY3Rpb24oYil7dmFyIGM9Yi5jYWxsKHRoaXMpLGQ9YSgnPHNwYW4gY2xhc3M9XCJzZWxlY3QyLXNlYXJjaCBzZWxlY3QyLXNlYXJjaC0tZHJvcGRvd25cIj48aW5wdXQgY2xhc3M9XCJzZWxlY3QyLXNlYXJjaF9fZmllbGRcIiB0eXBlPVwic2VhcmNoXCIgdGFiaW5kZXg9XCItMVwiIGF1dG9jb21wbGV0ZT1cIm9mZlwiIGF1dG9jb3JyZWN0PVwib2ZmXCIgYXV0b2NhcGl0YWxpemU9XCJvZmZcIiBzcGVsbGNoZWNrPVwiZmFsc2VcIiByb2xlPVwidGV4dGJveFwiIC8+PC9zcGFuPicpO3JldHVybiB0aGlzLiRzZWFyY2hDb250YWluZXI9ZCx0aGlzLiRzZWFyY2g9ZC5maW5kKFwiaW5wdXRcIiksYy5wcmVwZW5kKGQpLGN9LGMucHJvdG90eXBlLmJpbmQ9ZnVuY3Rpb24oYixjLGQpe3ZhciBlPXRoaXM7Yi5jYWxsKHRoaXMsYyxkKSx0aGlzLiRzZWFyY2gub24oXCJrZXlkb3duXCIsZnVuY3Rpb24oYSl7ZS50cmlnZ2VyKFwia2V5cHJlc3NcIixhKSxlLl9rZXlVcFByZXZlbnRlZD1hLmlzRGVmYXVsdFByZXZlbnRlZCgpfSksdGhpcy4kc2VhcmNoLm9uKFwiaW5wdXRcIixmdW5jdGlvbihiKXthKHRoaXMpLm9mZihcImtleXVwXCIpfSksdGhpcy4kc2VhcmNoLm9uKFwia2V5dXAgaW5wdXRcIixmdW5jdGlvbihhKXtlLmhhbmRsZVNlYXJjaChhKX0pLGMub24oXCJvcGVuXCIsZnVuY3Rpb24oKXtlLiRzZWFyY2guYXR0cihcInRhYmluZGV4XCIsMCksZS4kc2VhcmNoLmZvY3VzKCksd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKXtlLiRzZWFyY2guZm9jdXMoKX0sMCl9KSxjLm9uKFwiY2xvc2VcIixmdW5jdGlvbigpe2UuJHNlYXJjaC5hdHRyKFwidGFiaW5kZXhcIiwtMSksZS4kc2VhcmNoLnZhbChcIlwiKX0pLGMub24oXCJmb2N1c1wiLGZ1bmN0aW9uKCl7Yy5pc09wZW4oKSYmZS4kc2VhcmNoLmZvY3VzKCl9KSxjLm9uKFwicmVzdWx0czphbGxcIixmdW5jdGlvbihhKXtpZihudWxsPT1hLnF1ZXJ5LnRlcm18fFwiXCI9PT1hLnF1ZXJ5LnRlcm0pe3ZhciBiPWUuc2hvd1NlYXJjaChhKTtiP2UuJHNlYXJjaENvbnRhaW5lci5yZW1vdmVDbGFzcyhcInNlbGVjdDItc2VhcmNoLS1oaWRlXCIpOmUuJHNlYXJjaENvbnRhaW5lci5hZGRDbGFzcyhcInNlbGVjdDItc2VhcmNoLS1oaWRlXCIpfX0pfSxjLnByb3RvdHlwZS5oYW5kbGVTZWFyY2g9ZnVuY3Rpb24oYSl7aWYoIXRoaXMuX2tleVVwUHJldmVudGVkKXt2YXIgYj10aGlzLiRzZWFyY2gudmFsKCk7dGhpcy50cmlnZ2VyKFwicXVlcnlcIix7dGVybTpifSl9dGhpcy5fa2V5VXBQcmV2ZW50ZWQ9ITF9LGMucHJvdG90eXBlLnNob3dTZWFyY2g9ZnVuY3Rpb24oYSxiKXtyZXR1cm4hMH0sY30pLGIuZGVmaW5lKFwic2VsZWN0Mi9kcm9wZG93bi9oaWRlUGxhY2Vob2xkZXJcIixbXSxmdW5jdGlvbigpe2Z1bmN0aW9uIGEoYSxiLGMsZCl7dGhpcy5wbGFjZWhvbGRlcj10aGlzLm5vcm1hbGl6ZVBsYWNlaG9sZGVyKGMuZ2V0KFwicGxhY2Vob2xkZXJcIikpLGEuY2FsbCh0aGlzLGIsYyxkKX1yZXR1cm4gYS5wcm90b3R5cGUuYXBwZW5kPWZ1bmN0aW9uKGEsYil7Yi5yZXN1bHRzPXRoaXMucmVtb3ZlUGxhY2Vob2xkZXIoYi5yZXN1bHRzKSxhLmNhbGwodGhpcyxiKX0sYS5wcm90b3R5cGUubm9ybWFsaXplUGxhY2Vob2xkZXI9ZnVuY3Rpb24oYSxiKXtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgYiYmKGI9e2lkOlwiXCIsdGV4dDpifSksYn0sYS5wcm90b3R5cGUucmVtb3ZlUGxhY2Vob2xkZXI9ZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9Yi5zbGljZSgwKSxkPWIubGVuZ3RoLTE7ZD49MDtkLS0pe3ZhciBlPWJbZF07dGhpcy5wbGFjZWhvbGRlci5pZD09PWUuaWQmJmMuc3BsaWNlKGQsMSl9cmV0dXJuIGN9LGF9KSxiLmRlZmluZShcInNlbGVjdDIvZHJvcGRvd24vaW5maW5pdGVTY3JvbGxcIixbXCJqcXVlcnlcIl0sZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYihhLGIsYyxkKXt0aGlzLmxhc3RQYXJhbXM9e30sYS5jYWxsKHRoaXMsYixjLGQpLHRoaXMuJGxvYWRpbmdNb3JlPXRoaXMuY3JlYXRlTG9hZGluZ01vcmUoKSx0aGlzLmxvYWRpbmc9ITF9cmV0dXJuIGIucHJvdG90eXBlLmFwcGVuZD1mdW5jdGlvbihhLGIpe3RoaXMuJGxvYWRpbmdNb3JlLnJlbW92ZSgpLHRoaXMubG9hZGluZz0hMSxhLmNhbGwodGhpcyxiKSx0aGlzLnNob3dMb2FkaW5nTW9yZShiKSYmdGhpcy4kcmVzdWx0cy5hcHBlbmQodGhpcy4kbG9hZGluZ01vcmUpfSxiLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGIsYyxkKXt2YXIgZT10aGlzO2IuY2FsbCh0aGlzLGMsZCksYy5vbihcInF1ZXJ5XCIsZnVuY3Rpb24oYSl7ZS5sYXN0UGFyYW1zPWEsZS5sb2FkaW5nPSEwfSksYy5vbihcInF1ZXJ5OmFwcGVuZFwiLGZ1bmN0aW9uKGEpe2UubGFzdFBhcmFtcz1hLGUubG9hZGluZz0hMH0pLHRoaXMuJHJlc3VsdHMub24oXCJzY3JvbGxcIixmdW5jdGlvbigpe3ZhciBiPWEuY29udGFpbnMoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LGUuJGxvYWRpbmdNb3JlWzBdKTtpZighZS5sb2FkaW5nJiZiKXt2YXIgYz1lLiRyZXN1bHRzLm9mZnNldCgpLnRvcCtlLiRyZXN1bHRzLm91dGVySGVpZ2h0KCExKSxkPWUuJGxvYWRpbmdNb3JlLm9mZnNldCgpLnRvcCtlLiRsb2FkaW5nTW9yZS5vdXRlckhlaWdodCghMSk7Yys1MD49ZCYmZS5sb2FkTW9yZSgpfX0pfSxiLnByb3RvdHlwZS5sb2FkTW9yZT1mdW5jdGlvbigpe3RoaXMubG9hZGluZz0hMDt2YXIgYj1hLmV4dGVuZCh7fSx7cGFnZToxfSx0aGlzLmxhc3RQYXJhbXMpO2IucGFnZSsrLHRoaXMudHJpZ2dlcihcInF1ZXJ5OmFwcGVuZFwiLGIpfSxiLnByb3RvdHlwZS5zaG93TG9hZGluZ01vcmU9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYi5wYWdpbmF0aW9uJiZiLnBhZ2luYXRpb24ubW9yZX0sYi5wcm90b3R5cGUuY3JlYXRlTG9hZGluZ01vcmU9ZnVuY3Rpb24oKXt2YXIgYj1hKCc8bGkgY2xhc3M9XCJzZWxlY3QyLXJlc3VsdHNfX29wdGlvbiBzZWxlY3QyLXJlc3VsdHNfX29wdGlvbi0tbG9hZC1tb3JlXCJyb2xlPVwidHJlZWl0ZW1cIiBhcmlhLWRpc2FibGVkPVwidHJ1ZVwiPjwvbGk+JyksYz10aGlzLm9wdGlvbnMuZ2V0KFwidHJhbnNsYXRpb25zXCIpLmdldChcImxvYWRpbmdNb3JlXCIpO3JldHVybiBiLmh0bWwoYyh0aGlzLmxhc3RQYXJhbXMpKSxifSxifSksYi5kZWZpbmUoXCJzZWxlY3QyL2Ryb3Bkb3duL2F0dGFjaEJvZHlcIixbXCJqcXVlcnlcIixcIi4uL3V0aWxzXCJdLGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhiLGMsZCl7dGhpcy4kZHJvcGRvd25QYXJlbnQ9ZC5nZXQoXCJkcm9wZG93blBhcmVudFwiKXx8YShkb2N1bWVudC5ib2R5KSxiLmNhbGwodGhpcyxjLGQpfXJldHVybiBjLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGEsYixjKXt2YXIgZD10aGlzLGU9ITE7YS5jYWxsKHRoaXMsYixjKSxiLm9uKFwib3BlblwiLGZ1bmN0aW9uKCl7ZC5fc2hvd0Ryb3Bkb3duKCksZC5fYXR0YWNoUG9zaXRpb25pbmdIYW5kbGVyKGIpLGV8fChlPSEwLGIub24oXCJyZXN1bHRzOmFsbFwiLGZ1bmN0aW9uKCl7ZC5fcG9zaXRpb25Ecm9wZG93bigpLGQuX3Jlc2l6ZURyb3Bkb3duKCl9KSxiLm9uKFwicmVzdWx0czphcHBlbmRcIixmdW5jdGlvbigpe2QuX3Bvc2l0aW9uRHJvcGRvd24oKSxkLl9yZXNpemVEcm9wZG93bigpfSkpfSksYi5vbihcImNsb3NlXCIsZnVuY3Rpb24oKXtkLl9oaWRlRHJvcGRvd24oKSxkLl9kZXRhY2hQb3NpdGlvbmluZ0hhbmRsZXIoYil9KSx0aGlzLiRkcm9wZG93bkNvbnRhaW5lci5vbihcIm1vdXNlZG93blwiLGZ1bmN0aW9uKGEpe2Euc3RvcFByb3BhZ2F0aW9uKCl9KX0sYy5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbihhKXthLmNhbGwodGhpcyksdGhpcy4kZHJvcGRvd25Db250YWluZXIucmVtb3ZlKCl9LGMucHJvdG90eXBlLnBvc2l0aW9uPWZ1bmN0aW9uKGEsYixjKXtiLmF0dHIoXCJjbGFzc1wiLGMuYXR0cihcImNsYXNzXCIpKSxiLnJlbW92ZUNsYXNzKFwic2VsZWN0MlwiKSxiLmFkZENsYXNzKFwic2VsZWN0Mi1jb250YWluZXItLW9wZW5cIiksYi5jc3Moe3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6LTk5OTk5OX0pLHRoaXMuJGNvbnRhaW5lcj1jfSxjLnByb3RvdHlwZS5yZW5kZXI9ZnVuY3Rpb24oYil7dmFyIGM9YShcIjxzcGFuPjwvc3Bhbj5cIiksZD1iLmNhbGwodGhpcyk7cmV0dXJuIGMuYXBwZW5kKGQpLHRoaXMuJGRyb3Bkb3duQ29udGFpbmVyPWMsY30sYy5wcm90b3R5cGUuX2hpZGVEcm9wZG93bj1mdW5jdGlvbihhKXt0aGlzLiRkcm9wZG93bkNvbnRhaW5lci5kZXRhY2goKX0sYy5wcm90b3R5cGUuX2F0dGFjaFBvc2l0aW9uaW5nSGFuZGxlcj1mdW5jdGlvbihjLGQpe3ZhciBlPXRoaXMsZj1cInNjcm9sbC5zZWxlY3QyLlwiK2QuaWQsZz1cInJlc2l6ZS5zZWxlY3QyLlwiK2QuaWQsaD1cIm9yaWVudGF0aW9uY2hhbmdlLnNlbGVjdDIuXCIrZC5pZCxpPXRoaXMuJGNvbnRhaW5lci5wYXJlbnRzKCkuZmlsdGVyKGIuaGFzU2Nyb2xsKTtpLmVhY2goZnVuY3Rpb24oKXthKHRoaXMpLmRhdGEoXCJzZWxlY3QyLXNjcm9sbC1wb3NpdGlvblwiLHt4OmEodGhpcykuc2Nyb2xsTGVmdCgpLHk6YSh0aGlzKS5zY3JvbGxUb3AoKX0pfSksaS5vbihmLGZ1bmN0aW9uKGIpe3ZhciBjPWEodGhpcykuZGF0YShcInNlbGVjdDItc2Nyb2xsLXBvc2l0aW9uXCIpO2EodGhpcykuc2Nyb2xsVG9wKGMueSl9KSxhKHdpbmRvdykub24oZitcIiBcIitnK1wiIFwiK2gsZnVuY3Rpb24oYSl7ZS5fcG9zaXRpb25Ecm9wZG93bigpLGUuX3Jlc2l6ZURyb3Bkb3duKCl9KX0sYy5wcm90b3R5cGUuX2RldGFjaFBvc2l0aW9uaW5nSGFuZGxlcj1mdW5jdGlvbihjLGQpe3ZhciBlPVwic2Nyb2xsLnNlbGVjdDIuXCIrZC5pZCxmPVwicmVzaXplLnNlbGVjdDIuXCIrZC5pZCxnPVwib3JpZW50YXRpb25jaGFuZ2Uuc2VsZWN0Mi5cIitkLmlkLGg9dGhpcy4kY29udGFpbmVyLnBhcmVudHMoKS5maWx0ZXIoYi5oYXNTY3JvbGwpO2gub2ZmKGUpLGEod2luZG93KS5vZmYoZStcIiBcIitmK1wiIFwiK2cpfSxjLnByb3RvdHlwZS5fcG9zaXRpb25Ecm9wZG93bj1mdW5jdGlvbigpe3ZhciBiPWEod2luZG93KSxjPXRoaXMuJGRyb3Bkb3duLmhhc0NsYXNzKFwic2VsZWN0Mi1kcm9wZG93bi0tYWJvdmVcIiksZD10aGlzLiRkcm9wZG93bi5oYXNDbGFzcyhcInNlbGVjdDItZHJvcGRvd24tLWJlbG93XCIpLGU9bnVsbCxmPXRoaXMuJGNvbnRhaW5lci5vZmZzZXQoKTtmLmJvdHRvbT1mLnRvcCt0aGlzLiRjb250YWluZXIub3V0ZXJIZWlnaHQoITEpO3ZhciBnPXtoZWlnaHQ6dGhpcy4kY29udGFpbmVyLm91dGVySGVpZ2h0KCExKX07Zy50b3A9Zi50b3AsZy5ib3R0b209Zi50b3ArZy5oZWlnaHQ7dmFyIGg9e2hlaWdodDp0aGlzLiRkcm9wZG93bi5vdXRlckhlaWdodCghMSl9LGk9e3RvcDpiLnNjcm9sbFRvcCgpLGJvdHRvbTpiLnNjcm9sbFRvcCgpK2IuaGVpZ2h0KCl9LGo9aS50b3A8Zi50b3AtaC5oZWlnaHQsaz1pLmJvdHRvbT5mLmJvdHRvbStoLmhlaWdodCxsPXtsZWZ0OmYubGVmdCx0b3A6Zy5ib3R0b219LG09dGhpcy4kZHJvcGRvd25QYXJlbnQ7XCJzdGF0aWNcIj09PW0uY3NzKFwicG9zaXRpb25cIikmJihtPW0ub2Zmc2V0UGFyZW50KCkpO3ZhciBuPW0ub2Zmc2V0KCk7bC50b3AtPW4udG9wLGwubGVmdC09bi5sZWZ0LGN8fGR8fChlPVwiYmVsb3dcIiksa3x8IWp8fGM/IWomJmsmJmMmJihlPVwiYmVsb3dcIik6ZT1cImFib3ZlXCIsKFwiYWJvdmVcIj09ZXx8YyYmXCJiZWxvd1wiIT09ZSkmJihsLnRvcD1nLnRvcC1uLnRvcC1oLmhlaWdodCksbnVsbCE9ZSYmKHRoaXMuJGRyb3Bkb3duLnJlbW92ZUNsYXNzKFwic2VsZWN0Mi1kcm9wZG93bi0tYmVsb3cgc2VsZWN0Mi1kcm9wZG93bi0tYWJvdmVcIikuYWRkQ2xhc3MoXCJzZWxlY3QyLWRyb3Bkb3duLS1cIitlKSx0aGlzLiRjb250YWluZXIucmVtb3ZlQ2xhc3MoXCJzZWxlY3QyLWNvbnRhaW5lci0tYmVsb3cgc2VsZWN0Mi1jb250YWluZXItLWFib3ZlXCIpLmFkZENsYXNzKFwic2VsZWN0Mi1jb250YWluZXItLVwiK2UpKSx0aGlzLiRkcm9wZG93bkNvbnRhaW5lci5jc3MobCl9LGMucHJvdG90eXBlLl9yZXNpemVEcm9wZG93bj1mdW5jdGlvbigpe3ZhciBhPXt3aWR0aDp0aGlzLiRjb250YWluZXIub3V0ZXJXaWR0aCghMSkrXCJweFwifTt0aGlzLm9wdGlvbnMuZ2V0KFwiZHJvcGRvd25BdXRvV2lkdGhcIikmJihhLm1pbldpZHRoPWEud2lkdGgsYS5wb3NpdGlvbj1cInJlbGF0aXZlXCIsYS53aWR0aD1cImF1dG9cIiksdGhpcy4kZHJvcGRvd24uY3NzKGEpfSxjLnByb3RvdHlwZS5fc2hvd0Ryb3Bkb3duPWZ1bmN0aW9uKGEpe3RoaXMuJGRyb3Bkb3duQ29udGFpbmVyLmFwcGVuZFRvKHRoaXMuJGRyb3Bkb3duUGFyZW50KSx0aGlzLl9wb3NpdGlvbkRyb3Bkb3duKCksdGhpcy5fcmVzaXplRHJvcGRvd24oKX0sY30pLGIuZGVmaW5lKFwic2VsZWN0Mi9kcm9wZG93bi9taW5pbXVtUmVzdWx0c0ZvclNlYXJjaFwiLFtdLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShiKXtmb3IodmFyIGM9MCxkPTA7ZDxiLmxlbmd0aDtkKyspe3ZhciBlPWJbZF07ZS5jaGlsZHJlbj9jKz1hKGUuY2hpbGRyZW4pOmMrK31yZXR1cm4gY31mdW5jdGlvbiBiKGEsYixjLGQpe3RoaXMubWluaW11bVJlc3VsdHNGb3JTZWFyY2g9Yy5nZXQoXCJtaW5pbXVtUmVzdWx0c0ZvclNlYXJjaFwiKSx0aGlzLm1pbmltdW1SZXN1bHRzRm9yU2VhcmNoPDAmJih0aGlzLm1pbmltdW1SZXN1bHRzRm9yU2VhcmNoPTEvMCksYS5jYWxsKHRoaXMsYixjLGQpfXJldHVybiBiLnByb3RvdHlwZS5zaG93U2VhcmNoPWZ1bmN0aW9uKGIsYyl7cmV0dXJuIGEoYy5kYXRhLnJlc3VsdHMpPHRoaXMubWluaW11bVJlc3VsdHNGb3JTZWFyY2g/ITE6Yi5jYWxsKHRoaXMsYyl9LGJ9KSxiLmRlZmluZShcInNlbGVjdDIvZHJvcGRvd24vc2VsZWN0T25DbG9zZVwiLFtdLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gYSgpe31yZXR1cm4gYS5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihhLGIsYyl7dmFyIGQ9dGhpczthLmNhbGwodGhpcyxiLGMpLGIub24oXCJjbG9zZVwiLGZ1bmN0aW9uKGEpe2QuX2hhbmRsZVNlbGVjdE9uQ2xvc2UoYSl9KX0sYS5wcm90b3R5cGUuX2hhbmRsZVNlbGVjdE9uQ2xvc2U9ZnVuY3Rpb24oYSxiKXtpZihiJiZudWxsIT1iLm9yaWdpbmFsU2VsZWN0MkV2ZW50KXt2YXIgYz1iLm9yaWdpbmFsU2VsZWN0MkV2ZW50O2lmKFwic2VsZWN0XCI9PT1jLl90eXBlfHxcInVuc2VsZWN0XCI9PT1jLl90eXBlKXJldHVybn12YXIgZD10aGlzLmdldEhpZ2hsaWdodGVkUmVzdWx0cygpO2lmKCEoZC5sZW5ndGg8MSkpe3ZhciBlPWQuZGF0YShcImRhdGFcIik7bnVsbCE9ZS5lbGVtZW50JiZlLmVsZW1lbnQuc2VsZWN0ZWR8fG51bGw9PWUuZWxlbWVudCYmZS5zZWxlY3RlZHx8dGhpcy50cmlnZ2VyKFwic2VsZWN0XCIse2RhdGE6ZX0pfX0sYX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kcm9wZG93bi9jbG9zZU9uU2VsZWN0XCIsW10sZnVuY3Rpb24oKXtmdW5jdGlvbiBhKCl7fXJldHVybiBhLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGEsYixjKXt2YXIgZD10aGlzO2EuY2FsbCh0aGlzLGIsYyksYi5vbihcInNlbGVjdFwiLGZ1bmN0aW9uKGEpe2QuX3NlbGVjdFRyaWdnZXJlZChhKX0pLGIub24oXCJ1bnNlbGVjdFwiLGZ1bmN0aW9uKGEpe2QuX3NlbGVjdFRyaWdnZXJlZChhKX0pfSxhLnByb3RvdHlwZS5fc2VsZWN0VHJpZ2dlcmVkPWZ1bmN0aW9uKGEsYil7dmFyIGM9Yi5vcmlnaW5hbEV2ZW50O2MmJmMuY3RybEtleXx8dGhpcy50cmlnZ2VyKFwiY2xvc2VcIix7b3JpZ2luYWxFdmVudDpjLG9yaWdpbmFsU2VsZWN0MkV2ZW50OmJ9KX0sYX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9pMThuL2VuXCIsW10sZnVuY3Rpb24oKXtyZXR1cm57ZXJyb3JMb2FkaW5nOmZ1bmN0aW9uKCl7cmV0dXJuXCJUaGUgcmVzdWx0cyBjb3VsZCBub3QgYmUgbG9hZGVkLlwifSxpbnB1dFRvb0xvbmc6ZnVuY3Rpb24oYSl7dmFyIGI9YS5pbnB1dC5sZW5ndGgtYS5tYXhpbXVtLGM9XCJQbGVhc2UgZGVsZXRlIFwiK2IrXCIgY2hhcmFjdGVyXCI7cmV0dXJuIDEhPWImJihjKz1cInNcIiksY30saW5wdXRUb29TaG9ydDpmdW5jdGlvbihhKXt2YXIgYj1hLm1pbmltdW0tYS5pbnB1dC5sZW5ndGgsYz1cIlBsZWFzZSBlbnRlciBcIitiK1wiIG9yIG1vcmUgY2hhcmFjdGVyc1wiO3JldHVybiBjfSxsb2FkaW5nTW9yZTpmdW5jdGlvbigpe3JldHVyblwiTG9hZGluZyBtb3JlIHJlc3VsdHPigKZcIn0sbWF4aW11bVNlbGVjdGVkOmZ1bmN0aW9uKGEpe3ZhciBiPVwiWW91IGNhbiBvbmx5IHNlbGVjdCBcIithLm1heGltdW0rXCIgaXRlbVwiO3JldHVybiAxIT1hLm1heGltdW0mJihiKz1cInNcIiksYn0sbm9SZXN1bHRzOmZ1bmN0aW9uKCl7cmV0dXJuXCJObyByZXN1bHRzIGZvdW5kXCJ9LHNlYXJjaGluZzpmdW5jdGlvbigpe3JldHVyblwiU2VhcmNoaW5n4oCmXCJ9fX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kZWZhdWx0c1wiLFtcImpxdWVyeVwiLFwicmVxdWlyZVwiLFwiLi9yZXN1bHRzXCIsXCIuL3NlbGVjdGlvbi9zaW5nbGVcIixcIi4vc2VsZWN0aW9uL211bHRpcGxlXCIsXCIuL3NlbGVjdGlvbi9wbGFjZWhvbGRlclwiLFwiLi9zZWxlY3Rpb24vYWxsb3dDbGVhclwiLFwiLi9zZWxlY3Rpb24vc2VhcmNoXCIsXCIuL3NlbGVjdGlvbi9ldmVudFJlbGF5XCIsXCIuL3V0aWxzXCIsXCIuL3RyYW5zbGF0aW9uXCIsXCIuL2RpYWNyaXRpY3NcIixcIi4vZGF0YS9zZWxlY3RcIixcIi4vZGF0YS9hcnJheVwiLFwiLi9kYXRhL2FqYXhcIixcIi4vZGF0YS90YWdzXCIsXCIuL2RhdGEvdG9rZW5pemVyXCIsXCIuL2RhdGEvbWluaW11bUlucHV0TGVuZ3RoXCIsXCIuL2RhdGEvbWF4aW11bUlucHV0TGVuZ3RoXCIsXCIuL2RhdGEvbWF4aW11bVNlbGVjdGlvbkxlbmd0aFwiLFwiLi9kcm9wZG93blwiLFwiLi9kcm9wZG93bi9zZWFyY2hcIixcIi4vZHJvcGRvd24vaGlkZVBsYWNlaG9sZGVyXCIsXCIuL2Ryb3Bkb3duL2luZmluaXRlU2Nyb2xsXCIsXCIuL2Ryb3Bkb3duL2F0dGFjaEJvZHlcIixcIi4vZHJvcGRvd24vbWluaW11bVJlc3VsdHNGb3JTZWFyY2hcIixcIi4vZHJvcGRvd24vc2VsZWN0T25DbG9zZVwiLFwiLi9kcm9wZG93bi9jbG9zZU9uU2VsZWN0XCIsXCIuL2kxOG4vZW5cIl0sZnVuY3Rpb24oYSxiLGMsZCxlLGYsZyxoLGksaixrLGwsbSxuLG8scCxxLHIscyx0LHUsdix3LHgseSx6LEEsQixDKXtmdW5jdGlvbiBEKCl7dGhpcy5yZXNldCgpfUQucHJvdG90eXBlLmFwcGx5PWZ1bmN0aW9uKGwpe2lmKGw9YS5leHRlbmQoITAse30sdGhpcy5kZWZhdWx0cyxsKSxudWxsPT1sLmRhdGFBZGFwdGVyKXtpZihudWxsIT1sLmFqYXg/bC5kYXRhQWRhcHRlcj1vOm51bGwhPWwuZGF0YT9sLmRhdGFBZGFwdGVyPW46bC5kYXRhQWRhcHRlcj1tLGwubWluaW11bUlucHV0TGVuZ3RoPjAmJihsLmRhdGFBZGFwdGVyPWouRGVjb3JhdGUobC5kYXRhQWRhcHRlcixyKSksbC5tYXhpbXVtSW5wdXRMZW5ndGg+MCYmKGwuZGF0YUFkYXB0ZXI9ai5EZWNvcmF0ZShsLmRhdGFBZGFwdGVyLHMpKSxsLm1heGltdW1TZWxlY3Rpb25MZW5ndGg+MCYmKGwuZGF0YUFkYXB0ZXI9ai5EZWNvcmF0ZShsLmRhdGFBZGFwdGVyLHQpKSxsLnRhZ3MmJihsLmRhdGFBZGFwdGVyPWouRGVjb3JhdGUobC5kYXRhQWRhcHRlcixwKSksKG51bGwhPWwudG9rZW5TZXBhcmF0b3JzfHxudWxsIT1sLnRva2VuaXplcikmJihsLmRhdGFBZGFwdGVyPWouRGVjb3JhdGUobC5kYXRhQWRhcHRlcixxKSksbnVsbCE9bC5xdWVyeSl7dmFyIEM9YihsLmFtZEJhc2UrXCJjb21wYXQvcXVlcnlcIik7bC5kYXRhQWRhcHRlcj1qLkRlY29yYXRlKGwuZGF0YUFkYXB0ZXIsQyl9aWYobnVsbCE9bC5pbml0U2VsZWN0aW9uKXt2YXIgRD1iKGwuYW1kQmFzZStcImNvbXBhdC9pbml0U2VsZWN0aW9uXCIpO2wuZGF0YUFkYXB0ZXI9ai5EZWNvcmF0ZShsLmRhdGFBZGFwdGVyLEQpfX1pZihudWxsPT1sLnJlc3VsdHNBZGFwdGVyJiYobC5yZXN1bHRzQWRhcHRlcj1jLG51bGwhPWwuYWpheCYmKGwucmVzdWx0c0FkYXB0ZXI9ai5EZWNvcmF0ZShsLnJlc3VsdHNBZGFwdGVyLHgpKSxudWxsIT1sLnBsYWNlaG9sZGVyJiYobC5yZXN1bHRzQWRhcHRlcj1qLkRlY29yYXRlKGwucmVzdWx0c0FkYXB0ZXIsdykpLGwuc2VsZWN0T25DbG9zZSYmKGwucmVzdWx0c0FkYXB0ZXI9ai5EZWNvcmF0ZShsLnJlc3VsdHNBZGFwdGVyLEEpKSksbnVsbD09bC5kcm9wZG93bkFkYXB0ZXIpe2lmKGwubXVsdGlwbGUpbC5kcm9wZG93bkFkYXB0ZXI9dTtlbHNle3ZhciBFPWouRGVjb3JhdGUodSx2KTtsLmRyb3Bkb3duQWRhcHRlcj1FfWlmKDAhPT1sLm1pbmltdW1SZXN1bHRzRm9yU2VhcmNoJiYobC5kcm9wZG93bkFkYXB0ZXI9ai5EZWNvcmF0ZShsLmRyb3Bkb3duQWRhcHRlcix6KSksbC5jbG9zZU9uU2VsZWN0JiYobC5kcm9wZG93bkFkYXB0ZXI9ai5EZWNvcmF0ZShsLmRyb3Bkb3duQWRhcHRlcixCKSksbnVsbCE9bC5kcm9wZG93bkNzc0NsYXNzfHxudWxsIT1sLmRyb3Bkb3duQ3NzfHxudWxsIT1sLmFkYXB0RHJvcGRvd25Dc3NDbGFzcyl7dmFyIEY9YihsLmFtZEJhc2UrXCJjb21wYXQvZHJvcGRvd25Dc3NcIik7bC5kcm9wZG93bkFkYXB0ZXI9ai5EZWNvcmF0ZShsLmRyb3Bkb3duQWRhcHRlcixGKX1sLmRyb3Bkb3duQWRhcHRlcj1qLkRlY29yYXRlKGwuZHJvcGRvd25BZGFwdGVyLHkpfWlmKG51bGw9PWwuc2VsZWN0aW9uQWRhcHRlcil7aWYobC5tdWx0aXBsZT9sLnNlbGVjdGlvbkFkYXB0ZXI9ZTpsLnNlbGVjdGlvbkFkYXB0ZXI9ZCxudWxsIT1sLnBsYWNlaG9sZGVyJiYobC5zZWxlY3Rpb25BZGFwdGVyPWouRGVjb3JhdGUobC5zZWxlY3Rpb25BZGFwdGVyLGYpKSxsLmFsbG93Q2xlYXImJihsLnNlbGVjdGlvbkFkYXB0ZXI9ai5EZWNvcmF0ZShsLnNlbGVjdGlvbkFkYXB0ZXIsZykpLGwubXVsdGlwbGUmJihsLnNlbGVjdGlvbkFkYXB0ZXI9ai5EZWNvcmF0ZShsLnNlbGVjdGlvbkFkYXB0ZXIsaCkpLG51bGwhPWwuY29udGFpbmVyQ3NzQ2xhc3N8fG51bGwhPWwuY29udGFpbmVyQ3NzfHxudWxsIT1sLmFkYXB0Q29udGFpbmVyQ3NzQ2xhc3Mpe3ZhciBHPWIobC5hbWRCYXNlK1wiY29tcGF0L2NvbnRhaW5lckNzc1wiKTtsLnNlbGVjdGlvbkFkYXB0ZXI9ai5EZWNvcmF0ZShsLnNlbGVjdGlvbkFkYXB0ZXIsRyl9bC5zZWxlY3Rpb25BZGFwdGVyPWouRGVjb3JhdGUobC5zZWxlY3Rpb25BZGFwdGVyLGkpfWlmKFwic3RyaW5nXCI9PXR5cGVvZiBsLmxhbmd1YWdlKWlmKGwubGFuZ3VhZ2UuaW5kZXhPZihcIi1cIik+MCl7dmFyIEg9bC5sYW5ndWFnZS5zcGxpdChcIi1cIiksST1IWzBdO2wubGFuZ3VhZ2U9W2wubGFuZ3VhZ2UsSV19ZWxzZSBsLmxhbmd1YWdlPVtsLmxhbmd1YWdlXTtpZihhLmlzQXJyYXkobC5sYW5ndWFnZSkpe3ZhciBKPW5ldyBrO2wubGFuZ3VhZ2UucHVzaChcImVuXCIpO2Zvcih2YXIgSz1sLmxhbmd1YWdlLEw9MDtMPEsubGVuZ3RoO0wrKyl7dmFyIE09S1tMXSxOPXt9O3RyeXtOPWsubG9hZFBhdGgoTSl9Y2F0Y2goTyl7dHJ5e009dGhpcy5kZWZhdWx0cy5hbWRMYW5ndWFnZUJhc2UrTSxOPWsubG9hZFBhdGgoTSl9Y2F0Y2goUCl7bC5kZWJ1ZyYmd2luZG93LmNvbnNvbGUmJmNvbnNvbGUud2FybiYmY29uc29sZS53YXJuKCdTZWxlY3QyOiBUaGUgbGFuZ3VhZ2UgZmlsZSBmb3IgXCInK00rJ1wiIGNvdWxkIG5vdCBiZSBhdXRvbWF0aWNhbGx5IGxvYWRlZC4gQSBmYWxsYmFjayB3aWxsIGJlIHVzZWQgaW5zdGVhZC4nKTtjb250aW51ZX19Si5leHRlbmQoTil9bC50cmFuc2xhdGlvbnM9Sn1lbHNle3ZhciBRPWsubG9hZFBhdGgodGhpcy5kZWZhdWx0cy5hbWRMYW5ndWFnZUJhc2UrXCJlblwiKSxSPW5ldyBrKGwubGFuZ3VhZ2UpO1IuZXh0ZW5kKFEpLGwudHJhbnNsYXRpb25zPVJ9cmV0dXJuIGx9LEQucHJvdG90eXBlLnJlc2V0PWZ1bmN0aW9uKCl7ZnVuY3Rpb24gYihhKXtmdW5jdGlvbiBiKGEpe3JldHVybiBsW2FdfHxhfXJldHVybiBhLnJlcGxhY2UoL1teXFx1MDAwMC1cXHUwMDdFXS9nLGIpfWZ1bmN0aW9uIGMoZCxlKXtpZihcIlwiPT09YS50cmltKGQudGVybSkpcmV0dXJuIGU7aWYoZS5jaGlsZHJlbiYmZS5jaGlsZHJlbi5sZW5ndGg+MCl7Zm9yKHZhciBmPWEuZXh0ZW5kKCEwLHt9LGUpLGc9ZS5jaGlsZHJlbi5sZW5ndGgtMTtnPj0wO2ctLSl7dmFyIGg9ZS5jaGlsZHJlbltnXSxpPWMoZCxoKTtudWxsPT1pJiZmLmNoaWxkcmVuLnNwbGljZShnLDEpfXJldHVybiBmLmNoaWxkcmVuLmxlbmd0aD4wP2Y6YyhkLGYpfXZhciBqPWIoZS50ZXh0KS50b1VwcGVyQ2FzZSgpLGs9YihkLnRlcm0pLnRvVXBwZXJDYXNlKCk7cmV0dXJuIGouaW5kZXhPZihrKT4tMT9lOm51bGx9dGhpcy5kZWZhdWx0cz17YW1kQmFzZTpcIi4vXCIsYW1kTGFuZ3VhZ2VCYXNlOlwiLi9pMThuL1wiLGNsb3NlT25TZWxlY3Q6ITAsZGVidWc6ITEsZHJvcGRvd25BdXRvV2lkdGg6ITEsZXNjYXBlTWFya3VwOmouZXNjYXBlTWFya3VwLGxhbmd1YWdlOkMsbWF0Y2hlcjpjLG1pbmltdW1JbnB1dExlbmd0aDowLG1heGltdW1JbnB1dExlbmd0aDowLG1heGltdW1TZWxlY3Rpb25MZW5ndGg6MCxtaW5pbXVtUmVzdWx0c0ZvclNlYXJjaDowLHNlbGVjdE9uQ2xvc2U6ITEsc29ydGVyOmZ1bmN0aW9uKGEpe3JldHVybiBhfSx0ZW1wbGF0ZVJlc3VsdDpmdW5jdGlvbihhKXtyZXR1cm4gYS50ZXh0fSx0ZW1wbGF0ZVNlbGVjdGlvbjpmdW5jdGlvbihhKXtyZXR1cm4gYS50ZXh0fSx0aGVtZTpcImRlZmF1bHRcIix3aWR0aDpcInJlc29sdmVcIn19LEQucHJvdG90eXBlLnNldD1mdW5jdGlvbihiLGMpe3ZhciBkPWEuY2FtZWxDYXNlKGIpLGU9e307ZVtkXT1jO3ZhciBmPWouX2NvbnZlcnREYXRhKGUpO2EuZXh0ZW5kKHRoaXMuZGVmYXVsdHMsZil9O3ZhciBFPW5ldyBEO3JldHVybiBFfSksYi5kZWZpbmUoXCJzZWxlY3QyL29wdGlvbnNcIixbXCJyZXF1aXJlXCIsXCJqcXVlcnlcIixcIi4vZGVmYXVsdHNcIixcIi4vdXRpbHNcIl0sZnVuY3Rpb24oYSxiLGMsZCl7ZnVuY3Rpb24gZShiLGUpe2lmKHRoaXMub3B0aW9ucz1iLG51bGwhPWUmJnRoaXMuZnJvbUVsZW1lbnQoZSksdGhpcy5vcHRpb25zPWMuYXBwbHkodGhpcy5vcHRpb25zKSxlJiZlLmlzKFwiaW5wdXRcIikpe3ZhciBmPWEodGhpcy5nZXQoXCJhbWRCYXNlXCIpK1wiY29tcGF0L2lucHV0RGF0YVwiKTt0aGlzLm9wdGlvbnMuZGF0YUFkYXB0ZXI9ZC5EZWNvcmF0ZSh0aGlzLm9wdGlvbnMuZGF0YUFkYXB0ZXIsZil9fXJldHVybiBlLnByb3RvdHlwZS5mcm9tRWxlbWVudD1mdW5jdGlvbihhKXt2YXIgYz1bXCJzZWxlY3QyXCJdO251bGw9PXRoaXMub3B0aW9ucy5tdWx0aXBsZSYmKHRoaXMub3B0aW9ucy5tdWx0aXBsZT1hLnByb3AoXCJtdWx0aXBsZVwiKSksbnVsbD09dGhpcy5vcHRpb25zLmRpc2FibGVkJiYodGhpcy5vcHRpb25zLmRpc2FibGVkPWEucHJvcChcImRpc2FibGVkXCIpKSxudWxsPT10aGlzLm9wdGlvbnMubGFuZ3VhZ2UmJihhLnByb3AoXCJsYW5nXCIpP3RoaXMub3B0aW9ucy5sYW5ndWFnZT1hLnByb3AoXCJsYW5nXCIpLnRvTG93ZXJDYXNlKCk6YS5jbG9zZXN0KFwiW2xhbmddXCIpLnByb3AoXCJsYW5nXCIpJiYodGhpcy5vcHRpb25zLmxhbmd1YWdlPWEuY2xvc2VzdChcIltsYW5nXVwiKS5wcm9wKFwibGFuZ1wiKSkpLG51bGw9PXRoaXMub3B0aW9ucy5kaXImJihhLnByb3AoXCJkaXJcIik/dGhpcy5vcHRpb25zLmRpcj1hLnByb3AoXCJkaXJcIik6YS5jbG9zZXN0KFwiW2Rpcl1cIikucHJvcChcImRpclwiKT90aGlzLm9wdGlvbnMuZGlyPWEuY2xvc2VzdChcIltkaXJdXCIpLnByb3AoXCJkaXJcIik6dGhpcy5vcHRpb25zLmRpcj1cImx0clwiKSxhLnByb3AoXCJkaXNhYmxlZFwiLHRoaXMub3B0aW9ucy5kaXNhYmxlZCksYS5wcm9wKFwibXVsdGlwbGVcIix0aGlzLm9wdGlvbnMubXVsdGlwbGUpLGEuZGF0YShcInNlbGVjdDJUYWdzXCIpJiYodGhpcy5vcHRpb25zLmRlYnVnJiZ3aW5kb3cuY29uc29sZSYmY29uc29sZS53YXJuJiZjb25zb2xlLndhcm4oJ1NlbGVjdDI6IFRoZSBgZGF0YS1zZWxlY3QyLXRhZ3NgIGF0dHJpYnV0ZSBoYXMgYmVlbiBjaGFuZ2VkIHRvIHVzZSB0aGUgYGRhdGEtZGF0YWAgYW5kIGBkYXRhLXRhZ3M9XCJ0cnVlXCJgIGF0dHJpYnV0ZXMgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiBmdXR1cmUgdmVyc2lvbnMgb2YgU2VsZWN0Mi4nKSxhLmRhdGEoXCJkYXRhXCIsYS5kYXRhKFwic2VsZWN0MlRhZ3NcIikpLGEuZGF0YShcInRhZ3NcIiwhMCkpLGEuZGF0YShcImFqYXhVcmxcIikmJih0aGlzLm9wdGlvbnMuZGVidWcmJndpbmRvdy5jb25zb2xlJiZjb25zb2xlLndhcm4mJmNvbnNvbGUud2FybihcIlNlbGVjdDI6IFRoZSBgZGF0YS1hamF4LXVybGAgYXR0cmlidXRlIGhhcyBiZWVuIGNoYW5nZWQgdG8gYGRhdGEtYWpheC0tdXJsYCBhbmQgc3VwcG9ydCBmb3IgdGhlIG9sZCBhdHRyaWJ1dGUgd2lsbCBiZSByZW1vdmVkIGluIGZ1dHVyZSB2ZXJzaW9ucyBvZiBTZWxlY3QyLlwiKSxhLmF0dHIoXCJhamF4LS11cmxcIixhLmRhdGEoXCJhamF4VXJsXCIpKSxhLmRhdGEoXCJhamF4LS11cmxcIixhLmRhdGEoXCJhamF4VXJsXCIpKSk7dmFyIGU9e307ZT1iLmZuLmpxdWVyeSYmXCIxLlwiPT1iLmZuLmpxdWVyeS5zdWJzdHIoMCwyKSYmYVswXS5kYXRhc2V0P2IuZXh0ZW5kKCEwLHt9LGFbMF0uZGF0YXNldCxhLmRhdGEoKSk6YS5kYXRhKCk7dmFyIGY9Yi5leHRlbmQoITAse30sZSk7Zj1kLl9jb252ZXJ0RGF0YShmKTtmb3IodmFyIGcgaW4gZiliLmluQXJyYXkoZyxjKT4tMXx8KGIuaXNQbGFpbk9iamVjdCh0aGlzLm9wdGlvbnNbZ10pP2IuZXh0ZW5kKHRoaXMub3B0aW9uc1tnXSxmW2ddKTp0aGlzLm9wdGlvbnNbZ109ZltnXSk7cmV0dXJuIHRoaXN9LGUucHJvdG90eXBlLmdldD1mdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5vcHRpb25zW2FdfSxlLnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24oYSxiKXt0aGlzLm9wdGlvbnNbYV09Yn0sZX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9jb3JlXCIsW1wianF1ZXJ5XCIsXCIuL29wdGlvbnNcIixcIi4vdXRpbHNcIixcIi4va2V5c1wiXSxmdW5jdGlvbihhLGIsYyxkKXt2YXIgZT1mdW5jdGlvbihhLGMpe251bGwhPWEuZGF0YShcInNlbGVjdDJcIikmJmEuZGF0YShcInNlbGVjdDJcIikuZGVzdHJveSgpLHRoaXMuJGVsZW1lbnQ9YSx0aGlzLmlkPXRoaXMuX2dlbmVyYXRlSWQoYSksYz1jfHx7fSx0aGlzLm9wdGlvbnM9bmV3IGIoYyxhKSxlLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMpO3ZhciBkPWEuYXR0cihcInRhYmluZGV4XCIpfHwwO2EuZGF0YShcIm9sZC10YWJpbmRleFwiLGQpLGEuYXR0cihcInRhYmluZGV4XCIsXCItMVwiKTt2YXIgZj10aGlzLm9wdGlvbnMuZ2V0KFwiZGF0YUFkYXB0ZXJcIik7dGhpcy5kYXRhQWRhcHRlcj1uZXcgZihhLHRoaXMub3B0aW9ucyk7dmFyIGc9dGhpcy5yZW5kZXIoKTt0aGlzLl9wbGFjZUNvbnRhaW5lcihnKTt2YXIgaD10aGlzLm9wdGlvbnMuZ2V0KFwic2VsZWN0aW9uQWRhcHRlclwiKTt0aGlzLnNlbGVjdGlvbj1uZXcgaChhLHRoaXMub3B0aW9ucyksdGhpcy4kc2VsZWN0aW9uPXRoaXMuc2VsZWN0aW9uLnJlbmRlcigpLHRoaXMuc2VsZWN0aW9uLnBvc2l0aW9uKHRoaXMuJHNlbGVjdGlvbixnKTt2YXIgaT10aGlzLm9wdGlvbnMuZ2V0KFwiZHJvcGRvd25BZGFwdGVyXCIpO3RoaXMuZHJvcGRvd249bmV3IGkoYSx0aGlzLm9wdGlvbnMpLHRoaXMuJGRyb3Bkb3duPXRoaXMuZHJvcGRvd24ucmVuZGVyKCksdGhpcy5kcm9wZG93bi5wb3NpdGlvbih0aGlzLiRkcm9wZG93bixnKTt2YXIgaj10aGlzLm9wdGlvbnMuZ2V0KFwicmVzdWx0c0FkYXB0ZXJcIik7dGhpcy5yZXN1bHRzPW5ldyBqKGEsdGhpcy5vcHRpb25zLHRoaXMuZGF0YUFkYXB0ZXIpLHRoaXMuJHJlc3VsdHM9dGhpcy5yZXN1bHRzLnJlbmRlcigpLHRoaXMucmVzdWx0cy5wb3NpdGlvbih0aGlzLiRyZXN1bHRzLHRoaXMuJGRyb3Bkb3duKTt2YXIgaz10aGlzO3RoaXMuX2JpbmRBZGFwdGVycygpLHRoaXMuX3JlZ2lzdGVyRG9tRXZlbnRzKCksdGhpcy5fcmVnaXN0ZXJEYXRhRXZlbnRzKCksdGhpcy5fcmVnaXN0ZXJTZWxlY3Rpb25FdmVudHMoKSx0aGlzLl9yZWdpc3RlckRyb3Bkb3duRXZlbnRzKCksdGhpcy5fcmVnaXN0ZXJSZXN1bHRzRXZlbnRzKCksdGhpcy5fcmVnaXN0ZXJFdmVudHMoKSx0aGlzLmRhdGFBZGFwdGVyLmN1cnJlbnQoZnVuY3Rpb24oYSl7ay50cmlnZ2VyKFwic2VsZWN0aW9uOnVwZGF0ZVwiLHtkYXRhOmF9KX0pLGEuYWRkQ2xhc3MoXCJzZWxlY3QyLWhpZGRlbi1hY2Nlc3NpYmxlXCIpLGEuYXR0cihcImFyaWEtaGlkZGVuXCIsXCJ0cnVlXCIpLHRoaXMuX3N5bmNBdHRyaWJ1dGVzKCksYS5kYXRhKFwic2VsZWN0MlwiLHRoaXMpfTtyZXR1cm4gYy5FeHRlbmQoZSxjLk9ic2VydmFibGUpLGUucHJvdG90eXBlLl9nZW5lcmF0ZUlkPWZ1bmN0aW9uKGEpe3ZhciBiPVwiXCI7cmV0dXJuIGI9bnVsbCE9YS5hdHRyKFwiaWRcIik/YS5hdHRyKFwiaWRcIik6bnVsbCE9YS5hdHRyKFwibmFtZVwiKT9hLmF0dHIoXCJuYW1lXCIpK1wiLVwiK2MuZ2VuZXJhdGVDaGFycygyKTpjLmdlbmVyYXRlQ2hhcnMoNCksYj1iLnJlcGxhY2UoLyg6fFxcLnxcXFt8XFxdfCwpL2csXCJcIiksYj1cInNlbGVjdDItXCIrYn0sZS5wcm90b3R5cGUuX3BsYWNlQ29udGFpbmVyPWZ1bmN0aW9uKGEpe2EuaW5zZXJ0QWZ0ZXIodGhpcy4kZWxlbWVudCk7dmFyIGI9dGhpcy5fcmVzb2x2ZVdpZHRoKHRoaXMuJGVsZW1lbnQsdGhpcy5vcHRpb25zLmdldChcIndpZHRoXCIpKTtudWxsIT1iJiZhLmNzcyhcIndpZHRoXCIsYil9LGUucHJvdG90eXBlLl9yZXNvbHZlV2lkdGg9ZnVuY3Rpb24oYSxiKXt2YXIgYz0vXndpZHRoOigoWy0rXT8oWzAtOV0qXFwuKT9bMC05XSspKHB4fGVtfGV4fCV8aW58Y218bW18cHR8cGMpKS9pO2lmKFwicmVzb2x2ZVwiPT1iKXt2YXIgZD10aGlzLl9yZXNvbHZlV2lkdGgoYSxcInN0eWxlXCIpO3JldHVybiBudWxsIT1kP2Q6dGhpcy5fcmVzb2x2ZVdpZHRoKGEsXCJlbGVtZW50XCIpfWlmKFwiZWxlbWVudFwiPT1iKXt2YXIgZT1hLm91dGVyV2lkdGgoITEpO3JldHVybiAwPj1lP1wiYXV0b1wiOmUrXCJweFwifWlmKFwic3R5bGVcIj09Yil7dmFyIGY9YS5hdHRyKFwic3R5bGVcIik7aWYoXCJzdHJpbmdcIiE9dHlwZW9mIGYpcmV0dXJuIG51bGw7Zm9yKHZhciBnPWYuc3BsaXQoXCI7XCIpLGg9MCxpPWcubGVuZ3RoO2k+aDtoKz0xKXt2YXIgaj1nW2hdLnJlcGxhY2UoL1xccy9nLFwiXCIpLGs9ai5tYXRjaChjKTtpZihudWxsIT09ayYmay5sZW5ndGg+PTEpcmV0dXJuIGtbMV19cmV0dXJuIG51bGx9cmV0dXJuIGJ9LGUucHJvdG90eXBlLl9iaW5kQWRhcHRlcnM9ZnVuY3Rpb24oKXt0aGlzLmRhdGFBZGFwdGVyLmJpbmQodGhpcyx0aGlzLiRjb250YWluZXIpLHRoaXMuc2VsZWN0aW9uLmJpbmQodGhpcyx0aGlzLiRjb250YWluZXIpLHRoaXMuZHJvcGRvd24uYmluZCh0aGlzLHRoaXMuJGNvbnRhaW5lciksdGhpcy5yZXN1bHRzLmJpbmQodGhpcyx0aGlzLiRjb250YWluZXIpfSxlLnByb3RvdHlwZS5fcmVnaXN0ZXJEb21FdmVudHM9ZnVuY3Rpb24oKXt2YXIgYj10aGlzO3RoaXMuJGVsZW1lbnQub24oXCJjaGFuZ2Uuc2VsZWN0MlwiLGZ1bmN0aW9uKCl7Yi5kYXRhQWRhcHRlci5jdXJyZW50KGZ1bmN0aW9uKGEpe2IudHJpZ2dlcihcInNlbGVjdGlvbjp1cGRhdGVcIix7ZGF0YTphfSl9KX0pLHRoaXMuJGVsZW1lbnQub24oXCJmb2N1cy5zZWxlY3QyXCIsZnVuY3Rpb24oYSl7Yi50cmlnZ2VyKFwiZm9jdXNcIixhKX0pLHRoaXMuX3N5bmNBPWMuYmluZCh0aGlzLl9zeW5jQXR0cmlidXRlcyx0aGlzKSx0aGlzLl9zeW5jUz1jLmJpbmQodGhpcy5fc3luY1N1YnRyZWUsdGhpcyksdGhpcy4kZWxlbWVudFswXS5hdHRhY2hFdmVudCYmdGhpcy4kZWxlbWVudFswXS5hdHRhY2hFdmVudChcIm9ucHJvcGVydHljaGFuZ2VcIix0aGlzLl9zeW5jQSk7dmFyIGQ9d2luZG93Lk11dGF0aW9uT2JzZXJ2ZXJ8fHdpbmRvdy5XZWJLaXRNdXRhdGlvbk9ic2VydmVyfHx3aW5kb3cuTW96TXV0YXRpb25PYnNlcnZlcjtudWxsIT1kPyh0aGlzLl9vYnNlcnZlcj1uZXcgZChmdW5jdGlvbihjKXthLmVhY2goYyxiLl9zeW5jQSksYS5lYWNoKGMsYi5fc3luY1MpfSksdGhpcy5fb2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzLiRlbGVtZW50WzBdLHthdHRyaWJ1dGVzOiEwLGNoaWxkTGlzdDohMCxzdWJ0cmVlOiExfSkpOnRoaXMuJGVsZW1lbnRbMF0uYWRkRXZlbnRMaXN0ZW5lciYmKHRoaXMuJGVsZW1lbnRbMF0uYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUF0dHJNb2RpZmllZFwiLGIuX3N5bmNBLCExKSx0aGlzLiRlbGVtZW50WzBdLmFkZEV2ZW50TGlzdGVuZXIoXCJET01Ob2RlSW5zZXJ0ZWRcIixiLl9zeW5jUywhMSksdGhpcy4kZWxlbWVudFswXS5hZGRFdmVudExpc3RlbmVyKFwiRE9NTm9kZVJlbW92ZWRcIixiLl9zeW5jUywhMSkpfSxlLnByb3RvdHlwZS5fcmVnaXN0ZXJEYXRhRXZlbnRzPWZ1bmN0aW9uKCl7dmFyIGE9dGhpczt0aGlzLmRhdGFBZGFwdGVyLm9uKFwiKlwiLGZ1bmN0aW9uKGIsYyl7YS50cmlnZ2VyKGIsYyl9KX0sZS5wcm90b3R5cGUuX3JlZ2lzdGVyU2VsZWN0aW9uRXZlbnRzPWZ1bmN0aW9uKCl7dmFyIGI9dGhpcyxjPVtcInRvZ2dsZVwiLFwiZm9jdXNcIl07dGhpcy5zZWxlY3Rpb24ub24oXCJ0b2dnbGVcIixmdW5jdGlvbigpe2IudG9nZ2xlRHJvcGRvd24oKX0pLHRoaXMuc2VsZWN0aW9uLm9uKFwiZm9jdXNcIixmdW5jdGlvbihhKXtiLmZvY3VzKGEpfSksdGhpcy5zZWxlY3Rpb24ub24oXCIqXCIsZnVuY3Rpb24oZCxlKXstMT09PWEuaW5BcnJheShkLGMpJiZiLnRyaWdnZXIoZCxlKX0pfSxlLnByb3RvdHlwZS5fcmVnaXN0ZXJEcm9wZG93bkV2ZW50cz1mdW5jdGlvbigpe3ZhciBhPXRoaXM7dGhpcy5kcm9wZG93bi5vbihcIipcIixmdW5jdGlvbihiLGMpe2EudHJpZ2dlcihiLGMpfSl9LGUucHJvdG90eXBlLl9yZWdpc3RlclJlc3VsdHNFdmVudHM9ZnVuY3Rpb24oKXt2YXIgYT10aGlzO3RoaXMucmVzdWx0cy5vbihcIipcIixmdW5jdGlvbihiLGMpe2EudHJpZ2dlcihiLGMpfSl9LGUucHJvdG90eXBlLl9yZWdpc3RlckV2ZW50cz1mdW5jdGlvbigpe3ZhciBhPXRoaXM7dGhpcy5vbihcIm9wZW5cIixmdW5jdGlvbigpe2EuJGNvbnRhaW5lci5hZGRDbGFzcyhcInNlbGVjdDItY29udGFpbmVyLS1vcGVuXCIpfSksdGhpcy5vbihcImNsb3NlXCIsZnVuY3Rpb24oKXthLiRjb250YWluZXIucmVtb3ZlQ2xhc3MoXCJzZWxlY3QyLWNvbnRhaW5lci0tb3BlblwiKX0pLHRoaXMub24oXCJlbmFibGVcIixmdW5jdGlvbigpe2EuJGNvbnRhaW5lci5yZW1vdmVDbGFzcyhcInNlbGVjdDItY29udGFpbmVyLS1kaXNhYmxlZFwiKX0pLHRoaXMub24oXCJkaXNhYmxlXCIsZnVuY3Rpb24oKXthLiRjb250YWluZXIuYWRkQ2xhc3MoXCJzZWxlY3QyLWNvbnRhaW5lci0tZGlzYWJsZWRcIil9KSx0aGlzLm9uKFwiYmx1clwiLGZ1bmN0aW9uKCl7YS4kY29udGFpbmVyLnJlbW92ZUNsYXNzKFwic2VsZWN0Mi1jb250YWluZXItLWZvY3VzXCIpfSksdGhpcy5vbihcInF1ZXJ5XCIsZnVuY3Rpb24oYil7YS5pc09wZW4oKXx8YS50cmlnZ2VyKFwib3BlblwiLHt9KSx0aGlzLmRhdGFBZGFwdGVyLnF1ZXJ5KGIsZnVuY3Rpb24oYyl7YS50cmlnZ2VyKFwicmVzdWx0czphbGxcIix7ZGF0YTpjLHF1ZXJ5OmJ9KX0pfSksdGhpcy5vbihcInF1ZXJ5OmFwcGVuZFwiLGZ1bmN0aW9uKGIpe3RoaXMuZGF0YUFkYXB0ZXIucXVlcnkoYixmdW5jdGlvbihjKXthLnRyaWdnZXIoXCJyZXN1bHRzOmFwcGVuZFwiLHtkYXRhOmMscXVlcnk6Yn0pfSl9KSx0aGlzLm9uKFwia2V5cHJlc3NcIixmdW5jdGlvbihiKXt2YXIgYz1iLndoaWNoO2EuaXNPcGVuKCk/Yz09PWQuRVNDfHxjPT09ZC5UQUJ8fGM9PT1kLlVQJiZiLmFsdEtleT8oYS5jbG9zZSgpLGIucHJldmVudERlZmF1bHQoKSk6Yz09PWQuRU5URVI/KGEudHJpZ2dlcihcInJlc3VsdHM6c2VsZWN0XCIse30pLGIucHJldmVudERlZmF1bHQoKSk6Yz09PWQuU1BBQ0UmJmIuY3RybEtleT8oYS50cmlnZ2VyKFwicmVzdWx0czp0b2dnbGVcIix7fSksYi5wcmV2ZW50RGVmYXVsdCgpKTpjPT09ZC5VUD8oYS50cmlnZ2VyKFwicmVzdWx0czpwcmV2aW91c1wiLHt9KSxiLnByZXZlbnREZWZhdWx0KCkpOmM9PT1kLkRPV04mJihhLnRyaWdnZXIoXCJyZXN1bHRzOm5leHRcIix7fSksYi5wcmV2ZW50RGVmYXVsdCgpKTooYz09PWQuRU5URVJ8fGM9PT1kLlNQQUNFfHxjPT09ZC5ET1dOJiZiLmFsdEtleSkmJihhLm9wZW4oKSxiLnByZXZlbnREZWZhdWx0KCkpfSl9LGUucHJvdG90eXBlLl9zeW5jQXR0cmlidXRlcz1mdW5jdGlvbigpe3RoaXMub3B0aW9ucy5zZXQoXCJkaXNhYmxlZFwiLHRoaXMuJGVsZW1lbnQucHJvcChcImRpc2FibGVkXCIpKSx0aGlzLm9wdGlvbnMuZ2V0KFwiZGlzYWJsZWRcIik/KHRoaXMuaXNPcGVuKCkmJnRoaXMuY2xvc2UoKSx0aGlzLnRyaWdnZXIoXCJkaXNhYmxlXCIse30pKTp0aGlzLnRyaWdnZXIoXCJlbmFibGVcIix7fSl9LGUucHJvdG90eXBlLl9zeW5jU3VidHJlZT1mdW5jdGlvbihhLGIpe3ZhciBjPSExLGQ9dGhpcztpZighYXx8IWEudGFyZ2V0fHxcIk9QVElPTlwiPT09YS50YXJnZXQubm9kZU5hbWV8fFwiT1BUR1JPVVBcIj09PWEudGFyZ2V0Lm5vZGVOYW1lKXtpZihiKWlmKGIuYWRkZWROb2RlcyYmYi5hZGRlZE5vZGVzLmxlbmd0aD4wKWZvcih2YXIgZT0wO2U8Yi5hZGRlZE5vZGVzLmxlbmd0aDtlKyspe3ZhciBmPWIuYWRkZWROb2Rlc1tlXTtmLnNlbGVjdGVkJiYoYz0hMCl9ZWxzZSBiLnJlbW92ZWROb2RlcyYmYi5yZW1vdmVkTm9kZXMubGVuZ3RoPjAmJihjPSEwKTtlbHNlIGM9ITA7YyYmdGhpcy5kYXRhQWRhcHRlci5jdXJyZW50KGZ1bmN0aW9uKGEpe2QudHJpZ2dlcihcInNlbGVjdGlvbjp1cGRhdGVcIix7ZGF0YTphfSl9KX19LGUucHJvdG90eXBlLnRyaWdnZXI9ZnVuY3Rpb24oYSxiKXt2YXIgYz1lLl9fc3VwZXJfXy50cmlnZ2VyLGQ9e29wZW46XCJvcGVuaW5nXCIsY2xvc2U6XCJjbG9zaW5nXCIsc2VsZWN0Olwic2VsZWN0aW5nXCIsdW5zZWxlY3Q6XCJ1bnNlbGVjdGluZ1wifTtpZih2b2lkIDA9PT1iJiYoYj17fSksYSBpbiBkKXt2YXIgZj1kW2FdLGc9e3ByZXZlbnRlZDohMSxuYW1lOmEsYXJnczpifTtpZihjLmNhbGwodGhpcyxmLGcpLGcucHJldmVudGVkKXJldHVybiB2b2lkKGIucHJldmVudGVkPSEwKX1jLmNhbGwodGhpcyxhLGIpfSxlLnByb3RvdHlwZS50b2dnbGVEcm9wZG93bj1mdW5jdGlvbigpe3RoaXMub3B0aW9ucy5nZXQoXCJkaXNhYmxlZFwiKXx8KHRoaXMuaXNPcGVuKCk/dGhpcy5jbG9zZSgpOnRoaXMub3BlbigpKX0sZS5wcm90b3R5cGUub3Blbj1mdW5jdGlvbigpe3RoaXMuaXNPcGVuKCl8fHRoaXMudHJpZ2dlcihcInF1ZXJ5XCIse30pfSxlLnByb3RvdHlwZS5jbG9zZT1mdW5jdGlvbigpe3RoaXMuaXNPcGVuKCkmJnRoaXMudHJpZ2dlcihcImNsb3NlXCIse30pfSxlLnByb3RvdHlwZS5pc09wZW49ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy4kY29udGFpbmVyLmhhc0NsYXNzKFwic2VsZWN0Mi1jb250YWluZXItLW9wZW5cIil9LGUucHJvdG90eXBlLmhhc0ZvY3VzPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuJGNvbnRhaW5lci5oYXNDbGFzcyhcInNlbGVjdDItY29udGFpbmVyLS1mb2N1c1wiKX0sZS5wcm90b3R5cGUuZm9jdXM9ZnVuY3Rpb24oYSl7dGhpcy5oYXNGb2N1cygpfHwodGhpcy4kY29udGFpbmVyLmFkZENsYXNzKFwic2VsZWN0Mi1jb250YWluZXItLWZvY3VzXCIpLHRoaXMudHJpZ2dlcihcImZvY3VzXCIse30pKX0sZS5wcm90b3R5cGUuZW5hYmxlPWZ1bmN0aW9uKGEpe3RoaXMub3B0aW9ucy5nZXQoXCJkZWJ1Z1wiKSYmd2luZG93LmNvbnNvbGUmJmNvbnNvbGUud2FybiYmY29uc29sZS53YXJuKCdTZWxlY3QyOiBUaGUgYHNlbGVjdDIoXCJlbmFibGVcIilgIG1ldGhvZCBoYXMgYmVlbiBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gbGF0ZXIgU2VsZWN0MiB2ZXJzaW9ucy4gVXNlICRlbGVtZW50LnByb3AoXCJkaXNhYmxlZFwiKSBpbnN0ZWFkLicpLChudWxsPT1hfHwwPT09YS5sZW5ndGgpJiYoYT1bITBdKTt2YXIgYj0hYVswXTt0aGlzLiRlbGVtZW50LnByb3AoXCJkaXNhYmxlZFwiLGIpfSxlLnByb3RvdHlwZS5kYXRhPWZ1bmN0aW9uKCl7dGhpcy5vcHRpb25zLmdldChcImRlYnVnXCIpJiZhcmd1bWVudHMubGVuZ3RoPjAmJndpbmRvdy5jb25zb2xlJiZjb25zb2xlLndhcm4mJmNvbnNvbGUud2FybignU2VsZWN0MjogRGF0YSBjYW4gbm8gbG9uZ2VyIGJlIHNldCB1c2luZyBgc2VsZWN0MihcImRhdGFcIilgLiBZb3Ugc2hvdWxkIGNvbnNpZGVyIHNldHRpbmcgdGhlIHZhbHVlIGluc3RlYWQgdXNpbmcgYCRlbGVtZW50LnZhbCgpYC4nKTt2YXIgYT1bXTtyZXR1cm4gdGhpcy5kYXRhQWRhcHRlci5jdXJyZW50KGZ1bmN0aW9uKGIpe2E9Yn0pLGF9LGUucHJvdG90eXBlLnZhbD1mdW5jdGlvbihiKXtpZih0aGlzLm9wdGlvbnMuZ2V0KFwiZGVidWdcIikmJndpbmRvdy5jb25zb2xlJiZjb25zb2xlLndhcm4mJmNvbnNvbGUud2FybignU2VsZWN0MjogVGhlIGBzZWxlY3QyKFwidmFsXCIpYCBtZXRob2QgaGFzIGJlZW4gZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIGxhdGVyIFNlbGVjdDIgdmVyc2lvbnMuIFVzZSAkZWxlbWVudC52YWwoKSBpbnN0ZWFkLicpLG51bGw9PWJ8fDA9PT1iLmxlbmd0aClyZXR1cm4gdGhpcy4kZWxlbWVudC52YWwoKTt2YXIgYz1iWzBdO2EuaXNBcnJheShjKSYmKGM9YS5tYXAoYyxmdW5jdGlvbihhKXtyZXR1cm4gYS50b1N0cmluZygpfSkpLHRoaXMuJGVsZW1lbnQudmFsKGMpLnRyaWdnZXIoXCJjaGFuZ2VcIil9LGUucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLiRjb250YWluZXIucmVtb3ZlKCksdGhpcy4kZWxlbWVudFswXS5kZXRhY2hFdmVudCYmdGhpcy4kZWxlbWVudFswXS5kZXRhY2hFdmVudChcIm9ucHJvcGVydHljaGFuZ2VcIix0aGlzLl9zeW5jQSksbnVsbCE9dGhpcy5fb2JzZXJ2ZXI/KHRoaXMuX29ic2VydmVyLmRpc2Nvbm5lY3QoKSx0aGlzLl9vYnNlcnZlcj1udWxsKTp0aGlzLiRlbGVtZW50WzBdLnJlbW92ZUV2ZW50TGlzdGVuZXImJih0aGlzLiRlbGVtZW50WzBdLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJET01BdHRyTW9kaWZpZWRcIix0aGlzLl9zeW5jQSwhMSksdGhpcy4kZWxlbWVudFswXS5yZW1vdmVFdmVudExpc3RlbmVyKFwiRE9NTm9kZUluc2VydGVkXCIsdGhpcy5fc3luY1MsITEpLHRoaXMuJGVsZW1lbnRbMF0ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIkRPTU5vZGVSZW1vdmVkXCIsdGhpcy5fc3luY1MsITEpKSx0aGlzLl9zeW5jQT1udWxsLHRoaXMuX3N5bmNTPW51bGwsdGhpcy4kZWxlbWVudC5vZmYoXCIuc2VsZWN0MlwiKSx0aGlzLiRlbGVtZW50LmF0dHIoXCJ0YWJpbmRleFwiLHRoaXMuJGVsZW1lbnQuZGF0YShcIm9sZC10YWJpbmRleFwiKSksdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyhcInNlbGVjdDItaGlkZGVuLWFjY2Vzc2libGVcIiksdGhpcy4kZWxlbWVudC5hdHRyKFwiYXJpYS1oaWRkZW5cIixcImZhbHNlXCIpLHRoaXMuJGVsZW1lbnQucmVtb3ZlRGF0YShcInNlbGVjdDJcIiksdGhpcy5kYXRhQWRhcHRlci5kZXN0cm95KCksdGhpcy5zZWxlY3Rpb24uZGVzdHJveSgpLHRoaXMuZHJvcGRvd24uZGVzdHJveSgpLHRoaXMucmVzdWx0cy5kZXN0cm95KCksdGhpcy5kYXRhQWRhcHRlcj1udWxsLHRoaXMuc2VsZWN0aW9uPW51bGwsdGhpcy5kcm9wZG93bj1udWxsLHRoaXMucmVzdWx0cz1udWxsO1xufSxlLnByb3RvdHlwZS5yZW5kZXI9ZnVuY3Rpb24oKXt2YXIgYj1hKCc8c3BhbiBjbGFzcz1cInNlbGVjdDIgc2VsZWN0Mi1jb250YWluZXJcIj48c3BhbiBjbGFzcz1cInNlbGVjdGlvblwiPjwvc3Bhbj48c3BhbiBjbGFzcz1cImRyb3Bkb3duLXdyYXBwZXJcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L3NwYW4+PC9zcGFuPicpO3JldHVybiBiLmF0dHIoXCJkaXJcIix0aGlzLm9wdGlvbnMuZ2V0KFwiZGlyXCIpKSx0aGlzLiRjb250YWluZXI9Yix0aGlzLiRjb250YWluZXIuYWRkQ2xhc3MoXCJzZWxlY3QyLWNvbnRhaW5lci0tXCIrdGhpcy5vcHRpb25zLmdldChcInRoZW1lXCIpKSxiLmRhdGEoXCJlbGVtZW50XCIsdGhpcy4kZWxlbWVudCksYn0sZX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9jb21wYXQvdXRpbHNcIixbXCJqcXVlcnlcIl0sZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYihiLGMsZCl7dmFyIGUsZixnPVtdO2U9YS50cmltKGIuYXR0cihcImNsYXNzXCIpKSxlJiYoZT1cIlwiK2UsYShlLnNwbGl0KC9cXHMrLykpLmVhY2goZnVuY3Rpb24oKXswPT09dGhpcy5pbmRleE9mKFwic2VsZWN0Mi1cIikmJmcucHVzaCh0aGlzKX0pKSxlPWEudHJpbShjLmF0dHIoXCJjbGFzc1wiKSksZSYmKGU9XCJcIitlLGEoZS5zcGxpdCgvXFxzKy8pKS5lYWNoKGZ1bmN0aW9uKCl7MCE9PXRoaXMuaW5kZXhPZihcInNlbGVjdDItXCIpJiYoZj1kKHRoaXMpLG51bGwhPWYmJmcucHVzaChmKSl9KSksYi5hdHRyKFwiY2xhc3NcIixnLmpvaW4oXCIgXCIpKX1yZXR1cm57c3luY0Nzc0NsYXNzZXM6Yn19KSxiLmRlZmluZShcInNlbGVjdDIvY29tcGF0L2NvbnRhaW5lckNzc1wiLFtcImpxdWVyeVwiLFwiLi91dGlsc1wiXSxmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYSl7cmV0dXJuIG51bGx9ZnVuY3Rpb24gZCgpe31yZXR1cm4gZC5wcm90b3R5cGUucmVuZGVyPWZ1bmN0aW9uKGQpe3ZhciBlPWQuY2FsbCh0aGlzKSxmPXRoaXMub3B0aW9ucy5nZXQoXCJjb250YWluZXJDc3NDbGFzc1wiKXx8XCJcIjthLmlzRnVuY3Rpb24oZikmJihmPWYodGhpcy4kZWxlbWVudCkpO3ZhciBnPXRoaXMub3B0aW9ucy5nZXQoXCJhZGFwdENvbnRhaW5lckNzc0NsYXNzXCIpO2lmKGc9Z3x8YywtMSE9PWYuaW5kZXhPZihcIjphbGw6XCIpKXtmPWYucmVwbGFjZShcIjphbGw6XCIsXCJcIik7dmFyIGg9ZztnPWZ1bmN0aW9uKGEpe3ZhciBiPWgoYSk7cmV0dXJuIG51bGwhPWI/YitcIiBcIithOmF9fXZhciBpPXRoaXMub3B0aW9ucy5nZXQoXCJjb250YWluZXJDc3NcIil8fHt9O3JldHVybiBhLmlzRnVuY3Rpb24oaSkmJihpPWkodGhpcy4kZWxlbWVudCkpLGIuc3luY0Nzc0NsYXNzZXMoZSx0aGlzLiRlbGVtZW50LGcpLGUuY3NzKGkpLGUuYWRkQ2xhc3MoZiksZX0sZH0pLGIuZGVmaW5lKFwic2VsZWN0Mi9jb21wYXQvZHJvcGRvd25Dc3NcIixbXCJqcXVlcnlcIixcIi4vdXRpbHNcIl0sZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGEpe3JldHVybiBudWxsfWZ1bmN0aW9uIGQoKXt9cmV0dXJuIGQucHJvdG90eXBlLnJlbmRlcj1mdW5jdGlvbihkKXt2YXIgZT1kLmNhbGwodGhpcyksZj10aGlzLm9wdGlvbnMuZ2V0KFwiZHJvcGRvd25Dc3NDbGFzc1wiKXx8XCJcIjthLmlzRnVuY3Rpb24oZikmJihmPWYodGhpcy4kZWxlbWVudCkpO3ZhciBnPXRoaXMub3B0aW9ucy5nZXQoXCJhZGFwdERyb3Bkb3duQ3NzQ2xhc3NcIik7aWYoZz1nfHxjLC0xIT09Zi5pbmRleE9mKFwiOmFsbDpcIikpe2Y9Zi5yZXBsYWNlKFwiOmFsbDpcIixcIlwiKTt2YXIgaD1nO2c9ZnVuY3Rpb24oYSl7dmFyIGI9aChhKTtyZXR1cm4gbnVsbCE9Yj9iK1wiIFwiK2E6YX19dmFyIGk9dGhpcy5vcHRpb25zLmdldChcImRyb3Bkb3duQ3NzXCIpfHx7fTtyZXR1cm4gYS5pc0Z1bmN0aW9uKGkpJiYoaT1pKHRoaXMuJGVsZW1lbnQpKSxiLnN5bmNDc3NDbGFzc2VzKGUsdGhpcy4kZWxlbWVudCxnKSxlLmNzcyhpKSxlLmFkZENsYXNzKGYpLGV9LGR9KSxiLmRlZmluZShcInNlbGVjdDIvY29tcGF0L2luaXRTZWxlY3Rpb25cIixbXCJqcXVlcnlcIl0sZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYihhLGIsYyl7Yy5nZXQoXCJkZWJ1Z1wiKSYmd2luZG93LmNvbnNvbGUmJmNvbnNvbGUud2FybiYmY29uc29sZS53YXJuKFwiU2VsZWN0MjogVGhlIGBpbml0U2VsZWN0aW9uYCBvcHRpb24gaGFzIGJlZW4gZGVwcmVjYXRlZCBpbiBmYXZvciBvZiBhIGN1c3RvbSBkYXRhIGFkYXB0ZXIgdGhhdCBvdmVycmlkZXMgdGhlIGBjdXJyZW50YCBtZXRob2QuIFRoaXMgbWV0aG9kIGlzIG5vdyBjYWxsZWQgbXVsdGlwbGUgdGltZXMgaW5zdGVhZCBvZiBhIHNpbmdsZSB0aW1lIHdoZW4gdGhlIGluc3RhbmNlIGlzIGluaXRpYWxpemVkLiBTdXBwb3J0IHdpbGwgYmUgcmVtb3ZlZCBmb3IgdGhlIGBpbml0U2VsZWN0aW9uYCBvcHRpb24gaW4gZnV0dXJlIHZlcnNpb25zIG9mIFNlbGVjdDJcIiksdGhpcy5pbml0U2VsZWN0aW9uPWMuZ2V0KFwiaW5pdFNlbGVjdGlvblwiKSx0aGlzLl9pc0luaXRpYWxpemVkPSExLGEuY2FsbCh0aGlzLGIsYyl9cmV0dXJuIGIucHJvdG90eXBlLmN1cnJlbnQ9ZnVuY3Rpb24oYixjKXt2YXIgZD10aGlzO3JldHVybiB0aGlzLl9pc0luaXRpYWxpemVkP3ZvaWQgYi5jYWxsKHRoaXMsYyk6dm9pZCB0aGlzLmluaXRTZWxlY3Rpb24uY2FsbChudWxsLHRoaXMuJGVsZW1lbnQsZnVuY3Rpb24oYil7ZC5faXNJbml0aWFsaXplZD0hMCxhLmlzQXJyYXkoYil8fChiPVtiXSksYyhiKX0pfSxifSksYi5kZWZpbmUoXCJzZWxlY3QyL2NvbXBhdC9pbnB1dERhdGFcIixbXCJqcXVlcnlcIl0sZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYihhLGIsYyl7dGhpcy5fY3VycmVudERhdGE9W10sdGhpcy5fdmFsdWVTZXBhcmF0b3I9Yy5nZXQoXCJ2YWx1ZVNlcGFyYXRvclwiKXx8XCIsXCIsXCJoaWRkZW5cIj09PWIucHJvcChcInR5cGVcIikmJmMuZ2V0KFwiZGVidWdcIikmJmNvbnNvbGUmJmNvbnNvbGUud2FybiYmY29uc29sZS53YXJuKFwiU2VsZWN0MjogVXNpbmcgYSBoaWRkZW4gaW5wdXQgd2l0aCBTZWxlY3QyIGlzIG5vIGxvbmdlciBzdXBwb3J0ZWQgYW5kIG1heSBzdG9wIHdvcmtpbmcgaW4gdGhlIGZ1dHVyZS4gSXQgaXMgcmVjb21tZW5kZWQgdG8gdXNlIGEgYDxzZWxlY3Q+YCBlbGVtZW50IGluc3RlYWQuXCIpLGEuY2FsbCh0aGlzLGIsYyl9cmV0dXJuIGIucHJvdG90eXBlLmN1cnJlbnQ9ZnVuY3Rpb24oYixjKXtmdW5jdGlvbiBkKGIsYyl7dmFyIGU9W107cmV0dXJuIGIuc2VsZWN0ZWR8fC0xIT09YS5pbkFycmF5KGIuaWQsYyk/KGIuc2VsZWN0ZWQ9ITAsZS5wdXNoKGIpKTpiLnNlbGVjdGVkPSExLGIuY2hpbGRyZW4mJmUucHVzaC5hcHBseShlLGQoYi5jaGlsZHJlbixjKSksZX1mb3IodmFyIGU9W10sZj0wO2Y8dGhpcy5fY3VycmVudERhdGEubGVuZ3RoO2YrKyl7dmFyIGc9dGhpcy5fY3VycmVudERhdGFbZl07ZS5wdXNoLmFwcGx5KGUsZChnLHRoaXMuJGVsZW1lbnQudmFsKCkuc3BsaXQodGhpcy5fdmFsdWVTZXBhcmF0b3IpKSl9YyhlKX0sYi5wcm90b3R5cGUuc2VsZWN0PWZ1bmN0aW9uKGIsYyl7aWYodGhpcy5vcHRpb25zLmdldChcIm11bHRpcGxlXCIpKXt2YXIgZD10aGlzLiRlbGVtZW50LnZhbCgpO2QrPXRoaXMuX3ZhbHVlU2VwYXJhdG9yK2MuaWQsdGhpcy4kZWxlbWVudC52YWwoZCksdGhpcy4kZWxlbWVudC50cmlnZ2VyKFwiY2hhbmdlXCIpfWVsc2UgdGhpcy5jdXJyZW50KGZ1bmN0aW9uKGIpe2EubWFwKGIsZnVuY3Rpb24oYSl7YS5zZWxlY3RlZD0hMX0pfSksdGhpcy4kZWxlbWVudC52YWwoYy5pZCksdGhpcy4kZWxlbWVudC50cmlnZ2VyKFwiY2hhbmdlXCIpfSxiLnByb3RvdHlwZS51bnNlbGVjdD1mdW5jdGlvbihhLGIpe3ZhciBjPXRoaXM7Yi5zZWxlY3RlZD0hMSx0aGlzLmN1cnJlbnQoZnVuY3Rpb24oYSl7Zm9yKHZhciBkPVtdLGU9MDtlPGEubGVuZ3RoO2UrKyl7dmFyIGY9YVtlXTtiLmlkIT1mLmlkJiZkLnB1c2goZi5pZCl9Yy4kZWxlbWVudC52YWwoZC5qb2luKGMuX3ZhbHVlU2VwYXJhdG9yKSksYy4kZWxlbWVudC50cmlnZ2VyKFwiY2hhbmdlXCIpfSl9LGIucHJvdG90eXBlLnF1ZXJ5PWZ1bmN0aW9uKGEsYixjKXtmb3IodmFyIGQ9W10sZT0wO2U8dGhpcy5fY3VycmVudERhdGEubGVuZ3RoO2UrKyl7dmFyIGY9dGhpcy5fY3VycmVudERhdGFbZV0sZz10aGlzLm1hdGNoZXMoYixmKTtudWxsIT09ZyYmZC5wdXNoKGcpfWMoe3Jlc3VsdHM6ZH0pfSxiLnByb3RvdHlwZS5hZGRPcHRpb25zPWZ1bmN0aW9uKGIsYyl7dmFyIGQ9YS5tYXAoYyxmdW5jdGlvbihiKXtyZXR1cm4gYS5kYXRhKGJbMF0sXCJkYXRhXCIpfSk7dGhpcy5fY3VycmVudERhdGEucHVzaC5hcHBseSh0aGlzLl9jdXJyZW50RGF0YSxkKX0sYn0pLGIuZGVmaW5lKFwic2VsZWN0Mi9jb21wYXQvbWF0Y2hlclwiLFtcImpxdWVyeVwiXSxmdW5jdGlvbihhKXtmdW5jdGlvbiBiKGIpe2Z1bmN0aW9uIGMoYyxkKXt2YXIgZT1hLmV4dGVuZCghMCx7fSxkKTtpZihudWxsPT1jLnRlcm18fFwiXCI9PT1hLnRyaW0oYy50ZXJtKSlyZXR1cm4gZTtpZihkLmNoaWxkcmVuKXtmb3IodmFyIGY9ZC5jaGlsZHJlbi5sZW5ndGgtMTtmPj0wO2YtLSl7dmFyIGc9ZC5jaGlsZHJlbltmXSxoPWIoYy50ZXJtLGcudGV4dCxnKTtofHxlLmNoaWxkcmVuLnNwbGljZShmLDEpfWlmKGUuY2hpbGRyZW4ubGVuZ3RoPjApcmV0dXJuIGV9cmV0dXJuIGIoYy50ZXJtLGQudGV4dCxkKT9lOm51bGx9cmV0dXJuIGN9cmV0dXJuIGJ9KSxiLmRlZmluZShcInNlbGVjdDIvY29tcGF0L3F1ZXJ5XCIsW10sZnVuY3Rpb24oKXtmdW5jdGlvbiBhKGEsYixjKXtjLmdldChcImRlYnVnXCIpJiZ3aW5kb3cuY29uc29sZSYmY29uc29sZS53YXJuJiZjb25zb2xlLndhcm4oXCJTZWxlY3QyOiBUaGUgYHF1ZXJ5YCBvcHRpb24gaGFzIGJlZW4gZGVwcmVjYXRlZCBpbiBmYXZvciBvZiBhIGN1c3RvbSBkYXRhIGFkYXB0ZXIgdGhhdCBvdmVycmlkZXMgdGhlIGBxdWVyeWAgbWV0aG9kLiBTdXBwb3J0IHdpbGwgYmUgcmVtb3ZlZCBmb3IgdGhlIGBxdWVyeWAgb3B0aW9uIGluIGZ1dHVyZSB2ZXJzaW9ucyBvZiBTZWxlY3QyLlwiKSxhLmNhbGwodGhpcyxiLGMpfXJldHVybiBhLnByb3RvdHlwZS5xdWVyeT1mdW5jdGlvbihhLGIsYyl7Yi5jYWxsYmFjaz1jO3ZhciBkPXRoaXMub3B0aW9ucy5nZXQoXCJxdWVyeVwiKTtkLmNhbGwobnVsbCxiKX0sYX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kcm9wZG93bi9hdHRhY2hDb250YWluZXJcIixbXSxmdW5jdGlvbigpe2Z1bmN0aW9uIGEoYSxiLGMpe2EuY2FsbCh0aGlzLGIsYyl9cmV0dXJuIGEucHJvdG90eXBlLnBvc2l0aW9uPWZ1bmN0aW9uKGEsYixjKXt2YXIgZD1jLmZpbmQoXCIuZHJvcGRvd24td3JhcHBlclwiKTtkLmFwcGVuZChiKSxiLmFkZENsYXNzKFwic2VsZWN0Mi1kcm9wZG93bi0tYmVsb3dcIiksYy5hZGRDbGFzcyhcInNlbGVjdDItY29udGFpbmVyLS1iZWxvd1wiKX0sYX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kcm9wZG93bi9zdG9wUHJvcGFnYXRpb25cIixbXSxmdW5jdGlvbigpe2Z1bmN0aW9uIGEoKXt9cmV0dXJuIGEucHJvdG90eXBlLmJpbmQ9ZnVuY3Rpb24oYSxiLGMpe2EuY2FsbCh0aGlzLGIsYyk7dmFyIGQ9W1wiYmx1clwiLFwiY2hhbmdlXCIsXCJjbGlja1wiLFwiZGJsY2xpY2tcIixcImZvY3VzXCIsXCJmb2N1c2luXCIsXCJmb2N1c291dFwiLFwiaW5wdXRcIixcImtleWRvd25cIixcImtleXVwXCIsXCJrZXlwcmVzc1wiLFwibW91c2Vkb3duXCIsXCJtb3VzZWVudGVyXCIsXCJtb3VzZWxlYXZlXCIsXCJtb3VzZW1vdmVcIixcIm1vdXNlb3ZlclwiLFwibW91c2V1cFwiLFwic2VhcmNoXCIsXCJ0b3VjaGVuZFwiLFwidG91Y2hzdGFydFwiXTt0aGlzLiRkcm9wZG93bi5vbihkLmpvaW4oXCIgXCIpLGZ1bmN0aW9uKGEpe2Euc3RvcFByb3BhZ2F0aW9uKCl9KX0sYX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9zZWxlY3Rpb24vc3RvcFByb3BhZ2F0aW9uXCIsW10sZnVuY3Rpb24oKXtmdW5jdGlvbiBhKCl7fXJldHVybiBhLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGEsYixjKXthLmNhbGwodGhpcyxiLGMpO3ZhciBkPVtcImJsdXJcIixcImNoYW5nZVwiLFwiY2xpY2tcIixcImRibGNsaWNrXCIsXCJmb2N1c1wiLFwiZm9jdXNpblwiLFwiZm9jdXNvdXRcIixcImlucHV0XCIsXCJrZXlkb3duXCIsXCJrZXl1cFwiLFwia2V5cHJlc3NcIixcIm1vdXNlZG93blwiLFwibW91c2VlbnRlclwiLFwibW91c2VsZWF2ZVwiLFwibW91c2Vtb3ZlXCIsXCJtb3VzZW92ZXJcIixcIm1vdXNldXBcIixcInNlYXJjaFwiLFwidG91Y2hlbmRcIixcInRvdWNoc3RhcnRcIl07dGhpcy4kc2VsZWN0aW9uLm9uKGQuam9pbihcIiBcIiksZnVuY3Rpb24oYSl7YS5zdG9wUHJvcGFnYXRpb24oKX0pfSxhfSksZnVuY3Rpb24oYyl7XCJmdW5jdGlvblwiPT10eXBlb2YgYi5kZWZpbmUmJmIuZGVmaW5lLmFtZD9iLmRlZmluZShcImpxdWVyeS1tb3VzZXdoZWVsXCIsW1wianF1ZXJ5XCJdLGMpOlwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP21vZHVsZS5leHBvcnRzPWM6YyhhKX0oZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYihiKXt2YXIgZz1ifHx3aW5kb3cuZXZlbnQsaD1pLmNhbGwoYXJndW1lbnRzLDEpLGo9MCxsPTAsbT0wLG49MCxvPTAscD0wO2lmKGI9YS5ldmVudC5maXgoZyksYi50eXBlPVwibW91c2V3aGVlbFwiLFwiZGV0YWlsXCJpbiBnJiYobT0tMSpnLmRldGFpbCksXCJ3aGVlbERlbHRhXCJpbiBnJiYobT1nLndoZWVsRGVsdGEpLFwid2hlZWxEZWx0YVlcImluIGcmJihtPWcud2hlZWxEZWx0YVkpLFwid2hlZWxEZWx0YVhcImluIGcmJihsPS0xKmcud2hlZWxEZWx0YVgpLFwiYXhpc1wiaW4gZyYmZy5heGlzPT09Zy5IT1JJWk9OVEFMX0FYSVMmJihsPS0xKm0sbT0wKSxqPTA9PT1tP2w6bSxcImRlbHRhWVwiaW4gZyYmKG09LTEqZy5kZWx0YVksaj1tKSxcImRlbHRhWFwiaW4gZyYmKGw9Zy5kZWx0YVgsMD09PW0mJihqPS0xKmwpKSwwIT09bXx8MCE9PWwpe2lmKDE9PT1nLmRlbHRhTW9kZSl7dmFyIHE9YS5kYXRhKHRoaXMsXCJtb3VzZXdoZWVsLWxpbmUtaGVpZ2h0XCIpO2oqPXEsbSo9cSxsKj1xfWVsc2UgaWYoMj09PWcuZGVsdGFNb2RlKXt2YXIgcj1hLmRhdGEodGhpcyxcIm1vdXNld2hlZWwtcGFnZS1oZWlnaHRcIik7aio9cixtKj1yLGwqPXJ9aWYobj1NYXRoLm1heChNYXRoLmFicyhtKSxNYXRoLmFicyhsKSksKCFmfHxmPm4pJiYoZj1uLGQoZyxuKSYmKGYvPTQwKSksZChnLG4pJiYoai89NDAsbC89NDAsbS89NDApLGo9TWF0aFtqPj0xP1wiZmxvb3JcIjpcImNlaWxcIl0oai9mKSxsPU1hdGhbbD49MT9cImZsb29yXCI6XCJjZWlsXCJdKGwvZiksbT1NYXRoW20+PTE/XCJmbG9vclwiOlwiY2VpbFwiXShtL2YpLGsuc2V0dGluZ3Mubm9ybWFsaXplT2Zmc2V0JiZ0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCl7dmFyIHM9dGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtvPWIuY2xpZW50WC1zLmxlZnQscD1iLmNsaWVudFktcy50b3B9cmV0dXJuIGIuZGVsdGFYPWwsYi5kZWx0YVk9bSxiLmRlbHRhRmFjdG9yPWYsYi5vZmZzZXRYPW8sYi5vZmZzZXRZPXAsYi5kZWx0YU1vZGU9MCxoLnVuc2hpZnQoYixqLGwsbSksZSYmY2xlYXJUaW1lb3V0KGUpLGU9c2V0VGltZW91dChjLDIwMCksKGEuZXZlbnQuZGlzcGF0Y2h8fGEuZXZlbnQuaGFuZGxlKS5hcHBseSh0aGlzLGgpfX1mdW5jdGlvbiBjKCl7Zj1udWxsfWZ1bmN0aW9uIGQoYSxiKXtyZXR1cm4gay5zZXR0aW5ncy5hZGp1c3RPbGREZWx0YXMmJlwibW91c2V3aGVlbFwiPT09YS50eXBlJiZiJTEyMD09PTB9dmFyIGUsZixnPVtcIndoZWVsXCIsXCJtb3VzZXdoZWVsXCIsXCJET01Nb3VzZVNjcm9sbFwiLFwiTW96TW91c2VQaXhlbFNjcm9sbFwiXSxoPVwib253aGVlbFwiaW4gZG9jdW1lbnR8fGRvY3VtZW50LmRvY3VtZW50TW9kZT49OT9bXCJ3aGVlbFwiXTpbXCJtb3VzZXdoZWVsXCIsXCJEb21Nb3VzZVNjcm9sbFwiLFwiTW96TW91c2VQaXhlbFNjcm9sbFwiXSxpPUFycmF5LnByb3RvdHlwZS5zbGljZTtpZihhLmV2ZW50LmZpeEhvb2tzKWZvcih2YXIgaj1nLmxlbmd0aDtqOylhLmV2ZW50LmZpeEhvb2tzW2dbLS1qXV09YS5ldmVudC5tb3VzZUhvb2tzO3ZhciBrPWEuZXZlbnQuc3BlY2lhbC5tb3VzZXdoZWVsPXt2ZXJzaW9uOlwiMy4xLjEyXCIsc2V0dXA6ZnVuY3Rpb24oKXtpZih0aGlzLmFkZEV2ZW50TGlzdGVuZXIpZm9yKHZhciBjPWgubGVuZ3RoO2M7KXRoaXMuYWRkRXZlbnRMaXN0ZW5lcihoWy0tY10sYiwhMSk7ZWxzZSB0aGlzLm9ubW91c2V3aGVlbD1iO2EuZGF0YSh0aGlzLFwibW91c2V3aGVlbC1saW5lLWhlaWdodFwiLGsuZ2V0TGluZUhlaWdodCh0aGlzKSksYS5kYXRhKHRoaXMsXCJtb3VzZXdoZWVsLXBhZ2UtaGVpZ2h0XCIsay5nZXRQYWdlSGVpZ2h0KHRoaXMpKX0sdGVhcmRvd246ZnVuY3Rpb24oKXtpZih0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIpZm9yKHZhciBjPWgubGVuZ3RoO2M7KXRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcihoWy0tY10sYiwhMSk7ZWxzZSB0aGlzLm9ubW91c2V3aGVlbD1udWxsO2EucmVtb3ZlRGF0YSh0aGlzLFwibW91c2V3aGVlbC1saW5lLWhlaWdodFwiKSxhLnJlbW92ZURhdGEodGhpcyxcIm1vdXNld2hlZWwtcGFnZS1oZWlnaHRcIil9LGdldExpbmVIZWlnaHQ6ZnVuY3Rpb24oYil7dmFyIGM9YShiKSxkPWNbXCJvZmZzZXRQYXJlbnRcImluIGEuZm4/XCJvZmZzZXRQYXJlbnRcIjpcInBhcmVudFwiXSgpO3JldHVybiBkLmxlbmd0aHx8KGQ9YShcImJvZHlcIikpLHBhcnNlSW50KGQuY3NzKFwiZm9udFNpemVcIiksMTApfHxwYXJzZUludChjLmNzcyhcImZvbnRTaXplXCIpLDEwKXx8MTZ9LGdldFBhZ2VIZWlnaHQ6ZnVuY3Rpb24oYil7cmV0dXJuIGEoYikuaGVpZ2h0KCl9LHNldHRpbmdzOnthZGp1c3RPbGREZWx0YXM6ITAsbm9ybWFsaXplT2Zmc2V0OiEwfX07YS5mbi5leHRlbmQoe21vdXNld2hlZWw6ZnVuY3Rpb24oYSl7cmV0dXJuIGE/dGhpcy5iaW5kKFwibW91c2V3aGVlbFwiLGEpOnRoaXMudHJpZ2dlcihcIm1vdXNld2hlZWxcIil9LHVubW91c2V3aGVlbDpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy51bmJpbmQoXCJtb3VzZXdoZWVsXCIsYSl9fSl9KSxiLmRlZmluZShcImpxdWVyeS5zZWxlY3QyXCIsW1wianF1ZXJ5XCIsXCJqcXVlcnktbW91c2V3aGVlbFwiLFwiLi9zZWxlY3QyL2NvcmVcIixcIi4vc2VsZWN0Mi9kZWZhdWx0c1wiXSxmdW5jdGlvbihhLGIsYyxkKXtpZihudWxsPT1hLmZuLnNlbGVjdDIpe3ZhciBlPVtcIm9wZW5cIixcImNsb3NlXCIsXCJkZXN0cm95XCJdO2EuZm4uc2VsZWN0Mj1mdW5jdGlvbihiKXtpZihiPWJ8fHt9LFwib2JqZWN0XCI9PXR5cGVvZiBiKXJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgZD1hLmV4dGVuZCghMCx7fSxiKTtuZXcgYyhhKHRoaXMpLGQpfSksdGhpcztpZihcInN0cmluZ1wiPT10eXBlb2YgYil7dmFyIGQsZj1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsMSk7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciBjPWEodGhpcykuZGF0YShcInNlbGVjdDJcIik7bnVsbD09YyYmd2luZG93LmNvbnNvbGUmJmNvbnNvbGUuZXJyb3ImJmNvbnNvbGUuZXJyb3IoXCJUaGUgc2VsZWN0MignXCIrYitcIicpIG1ldGhvZCB3YXMgY2FsbGVkIG9uIGFuIGVsZW1lbnQgdGhhdCBpcyBub3QgdXNpbmcgU2VsZWN0Mi5cIiksZD1jW2JdLmFwcGx5KGMsZil9KSxhLmluQXJyYXkoYixlKT4tMT90aGlzOmR9dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBhcmd1bWVudHMgZm9yIFNlbGVjdDI6IFwiK2IpfX1yZXR1cm4gbnVsbD09YS5mbi5zZWxlY3QyLmRlZmF1bHRzJiYoYS5mbi5zZWxlY3QyLmRlZmF1bHRzPWQpLGN9KSx7ZGVmaW5lOmIuZGVmaW5lLHJlcXVpcmU6Yi5yZXF1aXJlfX0oKSxjPWIucmVxdWlyZShcImpxdWVyeS5zZWxlY3QyXCIpO3JldHVybiBhLmZuLnNlbGVjdDIuYW1kPWIsY30pOyIsIiQoZnVuY3Rpb24oKSB7XG4gICAgJCgnaW5wdXRbbmFtZT1kX2Zyb21dLCBpbnB1dFtuYW1lPWRfdG9dJykuZGF0ZXBpY2tlcih7XG4gICAgICAgIGRhdGVGb3JtYXQ6IFwieXl5eS1tbS1kZFwiXG4gICAgfSk7XG5cbiAgICAkKCdmb3JtW25hbWU9Y2F0ZWdvcmllcy1lZGl0LXN0b3Jlc10gaW5wdXRbdHlwZT1jaGVja2JveF0nKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICBcdHZhciBzZWxmID0gJCh0aGlzKSxcbiAgICBcdFx0Y2F0ZWdvcmllc0Zvcm0gPSAkKCdmb3JtW25hbWU9Y2F0ZWdvcmllcy1lZGl0LXN0b3Jlc10nKTtcblxuICAgIFx0aWYoc2VsZi5pcyhcIjpjaGVja2VkXCIpICYmIHNlbGYuYXR0cihcImRhdGEtcGFyZW50LWlkXCIpICE9IFwiMFwiKSB7XG4gICAgXHRcdGNhdGVnb3JpZXNGb3JtLmZpbmQoJ2lucHV0W2RhdGEtdWlkPScrIHNlbGYuYXR0cihcImRhdGEtcGFyZW50LWlkXCIpICsnXScpLnByb3AoXCJjaGVja2VkXCIsIGZhbHNlKS5wcm9wKFwiY2hlY2tlZFwiLCB0cnVlKTtcbiAgICBcdH0gZWxzZSBpZighc2VsZi5pcyhcIjpjaGVja2VkXCIpICYmIHNlbGYuYXR0cihcImRhdGEtcGFyZW50LWlkXCIpICE9IFwiMFwiKSB7XG4gICAgXHRcdHZhciBwYXJlbnRVbmNoZWtlZCA9IHRydWU7XG5cbiAgICBcdFx0Y2F0ZWdvcmllc0Zvcm0uZmluZCgnaW5wdXRbZGF0YS1wYXJlbnQtaWQ9Jysgc2VsZi5hdHRyKFwiZGF0YS1wYXJlbnQtaWRcIikgKyddJykuZWFjaChmdW5jdGlvbigpIHtcbiAgICBcdFx0XHRpZigkKHRoaXMpLmlzKFwiOmNoZWNrZWRcIikpIHtcbiAgICBcdFx0XHRcdHBhcmVudFVuY2hla2VkID0gZmFsc2U7XG4gICAgXHRcdFx0fVxuICAgIFx0XHR9KTtcblxuICAgIFx0XHRpZihwYXJlbnRVbmNoZWtlZCkge1xuICAgIFx0XHRcdGNhdGVnb3JpZXNGb3JtLmZpbmQoJ2lucHV0W2RhdGEtdWlkPScrIHNlbGYuYXR0cihcImRhdGEtcGFyZW50LWlkXCIpICsnXScpLnByb3AoXCJjaGVja2VkXCIsIGZhbHNlKTtcbiAgICBcdFx0fVxuICAgIFx0fVxuICAgIH0pO1xuXG5cdCQoXCIuc2VsZWN0Mi11c2Vyc1wiKS5zZWxlY3QyKHtcblx0XHRhamF4OiB7XG5cdFx0XHR1cmw6IFwiL2FkbWluL3VzZXJzL2xpc3RcIixcblx0XHRcdHR5cGU6ICdwb3N0Jyxcblx0XHRcdGRhdGFUeXBlOiAnanNvbicsXG5cdFx0XHRkZWxheTogMjUwLFxuXHRcdFx0ZGF0YTogZnVuY3Rpb24gKHBhcmFtcykge1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdGVtYWlsOiBwYXJhbXMudGVybVxuXHRcdFx0XHR9O1xuXHRcdFx0fSxcblx0XHRcdHByb2Nlc3NSZXN1bHRzOiBmdW5jdGlvbiAoZGF0YSkge1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdHJlc3VsdHM6IGRhdGFcblx0XHRcdFx0fTtcblx0XHRcdH0sXG5cdFx0XHRjYWNoZTogdHJ1ZVxuXHRcdH0sXG5cdFx0cGxhY2Vob2xkZXI6IFwi0JLRi9Cx0LXRgNC40YLQtSDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y9cIixcblx0XHRtaW5pbXVtSW5wdXRMZW5ndGg6IDFcblx0fSk7XG5cblx0JCggXCIuaW5wdXQtZGF0ZXBpY2tlclwiICkuZGF0ZXBpY2tlcih7XG5cdFx0ZGF0ZUZvcm1hdDogXCJ5eXl5LW1tLWRkXCJcblx0fSk7XG5cblx0JCgnI2NoYXJpdHktY2hlY2tib3gtMCcpLmNsaWNrKCBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIGNoZWNrZWQgPSB0aGlzLmNoZWNrZWQ7XG5cdFx0QXJyYXkuZnJvbShkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiY2hhcml0eS1jaGVja2JveFwiKSkuZm9yRWFjaChcblx0XHRcdGZ1bmN0aW9uKGVsZW1lbnQpIHtcblx0XHRcdFx0ZWxlbWVudC5jaGVja2VkID0gY2hlY2tlZDtcblx0XHRcdH1cblx0XHQpO1xuXHR9KTtcblx0XG5cdCQoJy5hamF4LWFjdGlvbicpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0dmFyIHN0YXR1cyA9ICQodGhpcykuZGF0YSgndmFsdWUnKTtcblx0XHR2YXIgaHJlZiA9ICQodGhpcykuYXR0cignaHJlZicpO1xuXHRcdHZhciBpZHMgPSAkKCcjZ3JpZC1hamF4LWFjdGlvbicpLnlpaUdyaWRWaWV3KCdnZXRTZWxlY3RlZFJvd3MnKTtcblx0XHRpZiAoIWNvbmZpcm0oJ9Cf0L7QtNGC0LLQtdGA0LTQuNGC0LUg0LjQt9C80LXQvdC10L3QuNC1INC30LDQv9C40YHQtdC5JykpIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0XHRpZiAoaWRzLmxlbmd0aCA+IDApIHtcblx0XHRcdCQuYWpheCh7XG5cdFx0XHRcdHVybDogaHJlZixcblx0XHRcdFx0dHlwZTogJ3Bvc3QnLFxuXHRcdFx0XHRkYXRhVHlwZTogJ2pzb24nLFxuXHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0c3RhdHVzOiBzdGF0dXMsXG5cdFx0XHRcdFx0aWQ6IGlkc1xuXHRcdFx0XHR9XG5cdFx0XHR9KS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdFx0JCgnI2dyaWQtYWpheC1hY3Rpb24nKS55aWlHcmlkVmlldyhcImFwcGx5RmlsdGVyXCIpO1xuXHRcdFx0XHRpZiAoZGF0YS5lcnJvciAhPSBmYWxzZSkge1xuXHRcdFx0XHRcdGFsZXJ0KCfQn9GA0L7QuNC30L7RiNC70LAg0L7RiNC40LHQutCwIScpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KS5mYWlsKGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0XHRhbGVydCgn0J/RgNC+0LjQt9C+0YjQu9CwINC+0YjQuNCx0LrQsCEnKTtcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhbGVydCgn0J3QtdC+0LHRhdC+0LTQuNC80L4g0LLRi9Cx0YDQsNGC0Ywg0Y3Qu9C10LzQtdC90YLRiyEnKVxuXHRcdH1cblx0fSk7XG5cblx0JCgnLmFqYXgtY29uZmlybScpLm9uKCdjbGljaycsZnVuY3Rpb24oZSkge1xuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHQkdGhpcz0kKHRoaXMpO1xuXHRcdGRhdGE9e1xuXHRcdFx0J3F1ZXN0aW9uJzokdGhpcy5kYXRhKCdxdWVzdGlvbicpfHwn0JLRiyDRg9Cy0YPRgNC10L3QvdGLPycsXG5cdFx0XHQndGl0bGUnOiR0aGlzLmRhdGEoJ3RpdGxlJyl8fCfQn9C+0LTRgtCy0LXRgNC20LTQtdC90LjQtSDQtNC10LnRgdGC0LLQuNGPJyxcblx0XHRcdCdjYWxsYmFja1llcyc6ZnVuY3Rpb24oKXtcblx0XHRcdFx0JHRoaXM9JCh0aGlzKTtcblx0XHRcdFx0JC5wb3N0KCcvYWRtaW4vc3RvcmVzL2ltcG9ydC1jYXQvaWQ6JyskdGhpcy5kYXRhKCdzdG9yZScpLGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0XHRcdGlmKGRhdGEuZXJyb3Ipe1xuXHRcdFx0XHRcdFx0bm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTpkYXRhLmVycm9yLHR5cGU6J2Vycid9KVxuXHRcdFx0XHRcdH1lbHNlIHtcblx0XHRcdFx0XHRcdGxvY2F0aW9uLnJlbG9hZCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSwnanNvbicpXG5cdFx0XHRcdFx0LmZhaWwoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOlwi0J7RiNC40LHQutCwINC/0LXRgNC10LTQsNGH0Lgg0LTQsNC90L3Ri9GFXCIsdHlwZTonZXJyJ30pXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9LFxuXHRcdFx0J29iaic6JHRoaXNcblx0XHR9O1xuXHRcdG5vdGlmaWNhdGlvbi5jb25maXJtKGRhdGEpXG5cdH0pXG59KTtcblxuLyokKGZ1bmN0aW9uKCkge1xuXHQkKCcuY2hfdHJlZSBpbnB1dCcpLm9uKCdjaGFuZ2UnLGZ1bmN0aW9uKCl7XG5cdFx0JHRoaXM9JCh0aGlzKVxuXHRcdGlucHV0PSR0aGlzLnBhcmVudCgpLnBhcmVudCgpLmZpbmQoJ2lucHV0Jyk7XG5cdFx0aW5wdXQucHJvcCgnY2hlY2tlZCcsJHRoaXMucHJvcCgnY2hlY2tlZCcpKVxuXHR9KVxufSk7Ki9cbiQoZnVuY3Rpb24oKSB7XG5cdCQoJy5nZXRfYWRtaXRhZCcpLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGFkPSQoJy5hZG1pdGFkX2RhdGEnKTtcblx0XHRhZC5hZGRDbGFzcygnbG9hZGluZycpO1xuXHRcdGFkLnJlbW92ZUNsYXNzKCdub3JtYWxfbG9hZCcpO1xuXHRcdGFkLnRleHQoJycpO1xuXG5cdFx0dHI9YWQuY2xvc2VzdCgndHInKTtcblx0XHRpZHM9W107XG5cdFx0Zm9yKHZhciBpPTA7aTx0ci5sZW5ndGg7aSsrKXtcblx0XHRcdGlkPXRyLmVxKGkpLmRhdGEoJ2tleScpO1xuXHRcdFx0aWYoaWQpaWRzLnB1c2goaWQpO1xuXHRcdH1cblxuXHRcdGlmKGlkcy5sZW5ndGg9PTApe1xuXHRcdFx0YWQucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcblx0XHRcdGFsZXJ0KCfQndC10YIg0LfQsNC60LDQt9C+0LIg0LTQu9GPINC/0YDQvtCy0LXRgNC60LgnKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQkLnBvc3QoJy9hZG1pbi9wYXltZW50cy9hZG1pdGFkLXRlc3QnLHsnaWRzJzppZHN9LGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0YWQ9JCgnLmFkbWl0YWRfZGF0YScpO1xuXHRcdFx0YWQudGV4dCgn0LTQsNC90L3Ri9C1INC90LUg0L3QsNC50LTQtdC90YsnKTtcblx0XHRcdGFkLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG5cblx0XHRcdHRyPWFkLmNsb3Nlc3QoJ3RyJyk7XG5cdFx0XHRmb3IodmFyIGk9MDtpPHRyLmxlbmd0aDtpKyspIHtcblx0XHRcdFx0dmFyIGl0ZW0gPSB0ci5lcShpKTtcblx0XHRcdFx0aWQgPSBpdGVtLmRhdGEoJ2tleScpO1xuXHRcdFx0XHRpZiAoIWRhdGFbaWRdKSB7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0ZHM9aXRlbS5maW5kKCcuYWRtaXRhZF9kYXRhJyk7XG5cdFx0XHRcdGZvcih2YXIgaj0wO2o8dGRzLmxlbmd0aDtqKyspIHtcblx0XHRcdFx0XHR2YXIgdGQgPSB0ZHMuZXEoaik7XG5cdFx0XHRcdFx0a2V5PXRkLmRhdGEoJ2NvbCcpO1xuXHRcdFx0XHRcdGlmKGRhdGFbaWRdW2tleV0pe1xuXHRcdFx0XHRcdFx0dGQuaHRtbChkYXRhW2lkXVtrZXldKTtcblx0XHRcdFx0XHRcdHRkLmFkZENsYXNzKCdub3JtYWxfbG9hZCcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sJ2pzb24nKS5mYWlsKGZ1bmN0aW9uICgpIHtcblx0XHRcdGFkLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG5cdFx0XHRhbGVydCgn0J7RiNC40LHQutCwINC+0LHRgNCw0LHQvtGC0LrQuCDQt9Cw0L/RgNC+0YHQsCcpXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pXG59KTsiLCJ2YXIgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG5zY3JpcHQub25sb2FkPWluaXRFZGl0b3I7XG5zY3JpcHQuc3JjID0gXCIvcGx1Z2lucy90aW55bWNlL3RpbnltY2UubWluLmpzXCI7XG5zY3JpcHQuYXN5bmMgPSB0cnVlO1xuZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpO1xuXG5mdW5jdGlvbiBpbml0RWRpdG9yKCl7XG4gIHRpbnltY2UuaW5pdCh7XG4gICAgc2VsZWN0b3I6Jy52aXN1YWxfZWRpdG9yJyxcbiAgICBoZWlnaHQ6IDUwMCxcbiAgICB0aGVtZTogJ21vZGVybicsXG4gICAgcGx1Z2luczogW1xuICAgICAgJ2Fkdmxpc3QgYXV0b2xpbmsgbGlzdHMgbGluayBpbWFnZSBjaGFybWFwIGhyIGFuY2hvciBwYWdlYnJlYWsgYWNjb3JkaW9uIGNsZWFyX2JyJyxcbiAgICAgICdzZWFyY2hyZXBsYWNlIHdvcmRjb3VudCB2aXN1YWxibG9ja3MgdmlzdWFsY2hhcnMgY29kZSBmdWxsc2NyZWVuJyxcbiAgICAgICdpbnNlcnRkYXRldGltZSBtZWRpYSBub25icmVha2luZyBzYXZlIHRhYmxlIGNvbnRleHRtZW51IGRpcmVjdGlvbmFsaXR5JyxcbiAgICAgICdlbW90aWNvbnMgdGVtcGxhdGUgcGFzdGUgdGV4dGNvbG9yIGNvbG9ycGlja2VyIHRleHRwYXR0ZXJuIGltYWdldG9vbHMgIHRvYyBoZWxwIGNvZGUnXG4gICAgXSxcbiAgICB0b29sYmFyMTogJ3VuZG8gcmVkbyB8IHN0eWxlc2VsZWN0IHwgYm9sZCBpdGFsaWMgfCBhbGlnbmxlZnQgYWxpZ25jZW50ZXIgYWxpZ25yaWdodCBhbGlnbmp1c3RpZnkgfCBidWxsaXN0IG51bWxpc3Qgb3V0ZGVudCBpbmRlbnQgfCBsaW5rIGltYWdlIHwgbWVkaWEgfCBmb3JlY29sb3IgYmFja2NvbG9yIHwgYWNjb3JkaW9uIHwgY2xlYXJfYnIgfCBjb2RlIGhlbHAgJyxcbiAgICBmaWxlX2Jyb3dzZXJfY2FsbGJhY2s6IFJveHlGaWxlQnJvd3NlcixcbiAgICBpbWFnZV9hZHZ0YWI6IHRydWUsXG4gICAgY29udGVudF9jc3MgOiBcIi9wbHVnaW5zL3RpbnltY2UvY29udGVudC5jc3NcIixcbiAgICBzdHlsZV9mb3JtYXRzOiBbXG4gICAgICB7IHRpdGxlOiAnSGVhZGVycycsIGl0ZW1zOiBbXG4gICAgICAgIHsgdGl0bGU6ICdoMScsIGJsb2NrOiAnaDEnIH0sXG4gICAgICAgIHsgdGl0bGU6ICdoMicsIGJsb2NrOiAnaDInIH0sXG4gICAgICAgIHsgdGl0bGU6ICdoMycsIGJsb2NrOiAnaDMnIH0sXG4gICAgICAgIHsgdGl0bGU6ICdoNCcsIGJsb2NrOiAnaDQnIH0sXG4gICAgICAgIHsgdGl0bGU6ICdoNScsIGJsb2NrOiAnaDUnIH0sXG4gICAgICAgIHsgdGl0bGU6ICdoNicsIGJsb2NrOiAnaDYnIH1cbiAgICAgIF0gfSxcblxuICAgICAgeyB0aXRsZTogJ0Jsb2NrcycsIGl0ZW1zOiBbXG4gICAgICAgIHsgdGl0bGU6ICdwJywgYmxvY2s6ICdwJyB9LFxuICAgICAgICB7IHRpdGxlOiAnZGl2JywgYmxvY2s6ICdkaXYnIH0sXG4gICAgICAgIHsgdGl0bGU6ICdwcmUnLCBibG9jazogJ3ByZScgfVxuICAgICAgXSB9LFxuXG4gICAgICB7IHRpdGxlOiAnQ29udGFpbmVycycsIGl0ZW1zOiBbXG4gICAgICAgIHsgdGl0bGU6ICdzZWN0aW9uJywgYmxvY2s6ICdzZWN0aW9uJywgd3JhcHBlcjogdHJ1ZSwgbWVyZ2Vfc2libGluZ3M6IGZhbHNlIH0sXG4gICAgICAgIHsgdGl0bGU6ICdhcnRpY2xlJywgYmxvY2s6ICdhcnRpY2xlJywgd3JhcHBlcjogdHJ1ZSwgbWVyZ2Vfc2libGluZ3M6IGZhbHNlIH0sXG4gICAgICAgIHsgdGl0bGU6ICdibG9ja3F1b3RlJywgYmxvY2s6ICdibG9ja3F1b3RlJywgd3JhcHBlcjogdHJ1ZSB9LFxuICAgICAgICB7IHRpdGxlOiAnaGdyb3VwJywgYmxvY2s6ICdoZ3JvdXAnLCB3cmFwcGVyOiB0cnVlIH0sXG4gICAgICAgIHsgdGl0bGU6ICdhc2lkZScsIGJsb2NrOiAnYXNpZGUnLCB3cmFwcGVyOiB0cnVlIH0sXG4gICAgICAgIHsgdGl0bGU6ICdmaWd1cmUnLCBibG9jazogJ2ZpZ3VyZScsIHdyYXBwZXI6IHRydWUgfVxuICAgICAgXSB9XG4gICAgXVxuICB9KTtcbiAgZnVuY3Rpb24gUm94eUZpbGVCcm93c2VyKGZpZWxkX25hbWUsIHVybCwgdHlwZSwgd2luKSB7XG4gICAgdmFyIHJveHlGaWxlbWFuID0gJy9wbHVnaW5zL2ZpbGVtYW4vaW5kZXguaHRtbCc7XG4gICAgaWYgKHJveHlGaWxlbWFuLmluZGV4T2YoXCI/XCIpIDwgMCkge1xuICAgICAgcm94eUZpbGVtYW4gKz0gXCI/dHlwZT1cIiArIHR5cGU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcm94eUZpbGVtYW4gKz0gXCImdHlwZT1cIiArIHR5cGU7XG4gICAgfVxuICAgIHJveHlGaWxlbWFuICs9ICcmaW5wdXQ9JyArIGZpZWxkX25hbWUgKyAnJnZhbHVlPScgKyB3aW4uZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZmllbGRfbmFtZSkudmFsdWU7XG4gICAgaWYodGlueU1DRS5hY3RpdmVFZGl0b3Iuc2V0dGluZ3MubGFuZ3VhZ2Upe1xuICAgICAgcm94eUZpbGVtYW4gKz0gJyZsYW5nQ29kZT0nICsgdGlueU1DRS5hY3RpdmVFZGl0b3Iuc2V0dGluZ3MubGFuZ3VhZ2U7XG4gICAgfVxuICAgIHRpbnlNQ0UuYWN0aXZlRWRpdG9yLndpbmRvd01hbmFnZXIub3Blbih7XG4gICAgICBmaWxlOiByb3h5RmlsZW1hbixcbiAgICAgIHRpdGxlOiAnUm94eSBGaWxlbWFuJyxcbiAgICAgIHdpZHRoOiA4NTAsXG4gICAgICBoZWlnaHQ6IDY1MCxcbiAgICAgIHJlc2l6YWJsZTogXCJ5ZXNcIixcbiAgICAgIHBsdWdpbnM6IFwibWVkaWFcIixcbiAgICAgIGlubGluZTogXCJ5ZXNcIixcbiAgICAgIGNsb3NlX3ByZXZpb3VzOiBcIm5vXCJcbiAgICB9LCB7ICAgICB3aW5kb3c6IHdpbiwgICAgIGlucHV0OiBmaWVsZF9uYW1lICAgIH0pO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBmdW5jdGlvbiBGaWxlU2VsZWN0ZWQoZmlsZSl7XG4gICAgLyoqXG4gICAgICogZmlsZSBpcyBhbiBvYmplY3QgY29udGFpbmluZyBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAgICAgKlxuICAgICAqIGZ1bGxQYXRoIC0gcGF0aCB0byB0aGUgZmlsZSAtIGFic29sdXRlIGZyb20geW91ciBzaXRlIHJvb3RcbiAgICAgKiBwYXRoIC0gZGlyZWN0b3J5IGluIHdoaWNoIHRoZSBmaWxlIGlzIGxvY2F0ZWQgLSBhYnNvbHV0ZSBmcm9tIHlvdXIgc2l0ZSByb290XG4gICAgICogc2l6ZSAtIHNpemUgb2YgdGhlIGZpbGUgaW4gYnl0ZXNcbiAgICAgKiB0aW1lIC0gdGltZXN0YW1vIG9mIGxhc3QgbW9kaWZpY2F0aW9uXG4gICAgICogbmFtZSAtIGZpbGUgbmFtZVxuICAgICAqIGV4dCAtIGZpbGUgZXh0ZW5zaW9uXG4gICAgICogd2lkdGggLSBpZiB0aGUgZmlsZSBpcyBpbWFnZSwgdGhpcyB3aWxsIGJlIHRoZSB3aWR0aCBvZiB0aGUgb3JpZ2luYWwgaW1hZ2UsIDAgb3RoZXJ3aXNlXG4gICAgICogaGVpZ2h0IC0gaWYgdGhlIGZpbGUgaXMgaW1hZ2UsIHRoaXMgd2lsbCBiZSB0aGUgaGVpZ2h0IG9mIHRoZSBvcmlnaW5hbCBpbWFnZSwgMCBvdGhlcndpc2VcbiAgICAgKlxuICAgICAqL1xuICAgICAgLy8gR2V0IHRoZSBJRCBvZiB0aGUgaW5wdXQgdG8gZmlsbFxuICAgIHZhciBmaWVsZElkID0gUm94eVV0aWxzLkdldFVybFBhcmFtKCd0eHRGaWVsZElkJyk7XG4gICAgJCh3aW5kb3cucGFyZW50LmRvY3VtZW50KS5maW5kKCcjJyArIGZpZWxkSWQpLmF0dHIoJ3ZhbHVlJywgZmlsZS5mdWxsUGF0aCk7XG4gICAgd2luZG93LnBhcmVudC5jbG9zZUN1c3RvbVJveHkyKCk7XG4gIH1cbiAgaW5pdEltYWdlU2VydmVyU2VsZWN0KCQoJy5maWxlU2VydmVyU2VsZWN0JykpO1xufTtcblxuZnVuY3Rpb24gaW5pdEltYWdlU2VydmVyU2VsZWN0KGVscyl7XG4gIGlmKGVscy5sZW5ndGg9PTApcmV0dXJuO1xuICBlbHMud3JhcCgnPGRpdiBjbGFzcz1cInNlbGVjdF9pbWdcIj4nKTtcbiAgZWxzPWVscy5wYXJlbnQoKTtcbiAgZWxzLmFwcGVuZCgnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCI+PGkgY2xhc3M9XCJtY2UtaWNvIG1jZS1pLWJyb3dzZVwiPjwvaT48L2J1dHRvbj4nKTtcbiAgZWxzLmZpbmQoJ2J1dHRvbicpLm9uKCdjbGljaycsb3BlbkN1c3RvbVJveHkyKTtcblxuICBpZigkKCcjcm94eUN1c3RvbVBhbmVsMicpLmxlbmd0aD09MCl7XG4gICAgYnJvd3NlckJsaz0nPGRpdiBpZD1cInJveHlDdXN0b21QYW5lbDJcIiBzdHlsZT1cImRpc3BsYXlfOiBub25lO1wiPic7XG4gICAgYnJvd3NlckJsays9JzxkaXY+JztcbiAgICBicm93c2VyQmxrKz0nPHNwYW4gY2xhc3M9XCJjbG9zZVwiPjwvc3Bhbj4nO1xuICAgIGJyb3dzZXJCbGsrPSc8aWZyYW1lIHNyYz1cIi9wbHVnaW5zL2ZpbGVtYW4vaW5kZXguaHRtbD9pbnRlZ3JhdGlvbj1jdXN0b20mdHlwZT1pbWFnZVwiIHN0eWxlPVwid2lkdGg6MTAwJTtoZWlnaHQ6MTAwJVwiIGZyYW1lYm9yZGVyPVwiMFwiPic7XG4gICAgYnJvd3NlckJsays9JzwvaWZyYW1lPic7XG4gICAgYnJvd3NlckJsays9JzwvZGl2Pic7XG4gICAgYnJvd3NlckJsays9JzwvZGl2Pic7XG4gICAgJCgnYm9keScpLmFwcGVuZChicm93c2VyQmxrKTtcbiAgICAkKCcjcm94eUN1c3RvbVBhbmVsMiAuY2xvc2UnKS5jbGljayhmdW5jdGlvbigpe1xuICAgICAgJCgnI3JveHlDdXN0b21QYW5lbDInKS5yZW1vdmVDbGFzcygnb3BlbicpXG4gICAgfSlcbiAgfVxufVxuXG5mdW5jdGlvbiBvcGVuQ3VzdG9tUm94eTIoKXtcbiAgY2xvc2VDdXN0b21Sb3h5Mj1jbG9zZUN1c3RvbVJveHkuYmluZCh0aGlzKVxuICAkKCcjcm94eUN1c3RvbVBhbmVsMicpLmFkZENsYXNzKCdvcGVuJylcbn1cbnZhciBjbG9zZUN1c3RvbVJveHkyO1xuZnVuY3Rpb24gY2xvc2VDdXN0b21Sb3h5KGltZyl7XG4gIGlmKGltZykge1xuICAgICQodGhpcykucGFyZW50KCkuZmluZCgnaW5wdXQnKS52YWwoaW1nKTtcbiAgfVxuICAkKCcjcm94eUN1c3RvbVBhbmVsMiAuY2xvc2UnKS5jbGljaygpXG59IiwiOyhmdW5jdGlvbigkKXtcblxuICBmdW5jdGlvbiBhamF4X3NhdmUoZWxlbWVudCl7XG4gICAgdGhpcy5pbml0KGVsZW1lbnQpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGNsZWFyQ2xhc3MoKXtcbiAgICB2YXIgb3B0aW9ucz10aGlzO1xuICAgIG9wdGlvbnMudGhpcy5wYXJlbnQoKS5yZW1vdmVDbGFzcygnYWpheFNhdmluZ0ZhaWxlZCcpO1xuICAgIG9wdGlvbnMudGhpcy5wYXJlbnQoKS5yZW1vdmVDbGFzcygnYWpheFNhdmluZ09rJyk7XG4gIH1cblxuICBhamF4X3NhdmUucHJvdG90eXBlLmluaXQ9ZnVuY3Rpb24oZWxlbWVudCl7XG4gICAgdGFnTmFtZT1lbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcbiAgICBlbGVtZW50PSQoZWxlbWVudCk7XG4gICAgaWYodGFnTmFtZT09XCJpbnB1dFwiIHx8IHRhZ05hbWU9PVwic2VsZWN0XCIpe1xuICAgICAgb2JqPWVsZW1lbnQ7XG4gICAgfWVsc2V7XG4gICAgICBvYmo9ZWxlbWVudC5maW5kKCdpbnB1dCxzZWxlY3QnKTtcbiAgICB9XG5cbiAgICBwb3N0X3VybD1lbGVtZW50LmF0dHIoJ3NhdmVfdXJsJyk7XG4gICAgdWlkPWVsZW1lbnQuYXR0cigndWlkJyk7XG5cbiAgICBmb3IodmFyIGk9MDtpPG9iai5sZW5ndGg7aSsrKXtcbiAgICAgIHZhciBvcHRpb25zPXtcbiAgICAgICAgdXJsOnBvc3RfdXJsLFxuICAgICAgICBpZDp1aWQsXG4gICAgICAgIHRoaXM6b2JqLmVxKGkpXG4gICAgICB9O1xuXG4gICAgICBvcHRpb25zLnRoaXNcbiAgICAgICAgLm9mZignY2hhbmdlJylcbiAgICAgICAgLm9uKCdjaGFuZ2UnLGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBvcHRpb25zPXRoaXM7XG4gICAgICAgIHZhciB2YWw9b3B0aW9ucy50aGlzLnZhbCgpO1xuICAgICAgICB2YXIgdHlwZT1vcHRpb25zLnRoaXMuYXR0cigndHlwZScpO1xuICAgICAgICBpZih0eXBlICYmIHR5cGUudG9Mb3dlckNhc2UoKT09J2NoZWNrYm94Jyl7XG4gICAgICAgICAgaWYoIW9wdGlvbnMudGhpcy5wcm9wKCdjaGVja2VkJykpe1xuICAgICAgICAgICAgdmFsPTA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBwb3N0PXtcbiAgICAgICAgICBpZDpvcHRpb25zLmlkLFxuICAgICAgICAgIHZhbHVlOnZhbCxcbiAgICAgICAgICBuYW1lOm9wdGlvbnMudGhpcy5hdHRyKCduYW1lJylcbiAgICAgICAgfTtcblxuICAgICAgICBvcHRpb25zLnRoaXMucGFyZW50KCkuYWRkQ2xhc3MoJ2FqYXhJblNhdmluZycpO1xuICAgICAgICAkLnBvc3Qob3B0aW9ucy51cmwscG9zdCxmdW5jdGlvbigpe1xuICAgICAgICAgIHZhciBvcHRpb25zPXRoaXM7XG4gICAgICAgICAgb3B0aW9ucy50aGlzLnBhcmVudCgpLnJlbW92ZUNsYXNzKCdhamF4SW5TYXZpbmcnKTtcbiAgICAgICAgICBvcHRpb25zLnRoaXMucGFyZW50KCkuYWRkQ2xhc3MoJ2FqYXhTYXZpbmdPaycpO1xuICAgICAgICAgIHNldFRpbWVvdXQoY2xlYXJDbGFzcy5iaW5kKG9wdGlvbnMpLDMwMDApXG4gICAgICAgIH0uYmluZChvcHRpb25zKSkuZmFpbChmdW5jdGlvbigpe1xuICAgICAgICAgIHZhciBvcHRpb25zPXRoaXM7XG4gICAgICAgICAgb3B0aW9ucy50aGlzLnBhcmVudCgpLnJlbW92ZUNsYXNzKCdhamF4SW5TYXZpbmcnKTtcbiAgICAgICAgICBvcHRpb25zLnRoaXMucGFyZW50KCkuYWRkQ2xhc3MoJ2FqYXhTYXZpbmdGYWlsZWQnKTtcbiAgICAgICAgICBzZXRUaW1lb3V0KGNsZWFyQ2xhc3MuYmluZChvcHRpb25zKSw0MDAwKVxuICAgICAgICB9LmJpbmQob3B0aW9ucykpXG4gICAgICB9LmJpbmQob3B0aW9ucykpXG4gICAgfVxuICB9O1xuXG4gICQuZm4uYWpheF9zYXZlPWZ1bmN0aW9uKCl7XG4gICAgJCh0aGlzKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICBuZXcgYWpheF9zYXZlKHRoaXMpO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbn0pKGpRdWVyeSk7XG4kKCcuYWpheF9zYXZlJykuYWpheF9zYXZlKCk7IiwiO1xuJChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gb25SZW1vdmUoKXtcbiAgICAkdGhpcz0kKHRoaXMpO1xuICAgIHBvc3Q9e1xuICAgICAgaWQ6JHRoaXMuYXR0cigndWlkJyksXG4gICAgICB0eXBlOiR0aGlzLmF0dHIoJ21vZGUnKVxuICAgIH07XG4gICAgJC5wb3N0KCR0aGlzLmF0dHIoJ3VybCcpLHBvc3QsZnVuY3Rpb24oZGF0YSl7XG4gICAgICBpZihkYXRhICYmIGRhdGE9PSdlcnInKXtcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0J3QtdCy0L7Qt9C80L7QttC90L4g0YPQtNCw0LvQuNGC0Ywg0Y3Qu9C10LzQtdC90YInLHR5cGU6J2Vycid9KTtcbiAgICAgIH1cblxuICAgICAgbW9kZT0kdGhpcy5hdHRyKCdtb2RlJyk7XG4gICAgICBpZighbW9kZSl7XG4gICAgICAgIG1vZGU9J3JtJztcbiAgICAgIH1cblxuICAgICAgaWYobW9kZT0ncm0nKSB7XG4gICAgICAgIHJtID0gJHRoaXMuY2xvc2VzdCgnLnRvX3JlbW92ZScpO1xuICAgICAgICBybV9jbGFzcyA9IHJtLmF0dHIoJ3JtX2NsYXNzJyk7XG4gICAgICAgIGlmIChybV9jbGFzcykge1xuICAgICAgICAgICQocm1fY2xhc3MpLnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcm0ucmVtb3ZlKCk7XG4gICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Cj0YHQv9C10YjQvdC+0LUg0YPQtNCw0LvQtdC90LjQtS4nLHR5cGU6J2luZm8nfSlcbiAgICAgIH1cbiAgICAgIGlmKG1vZGU9PSdyZWxvYWQnKXtcbiAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICAgIGxvY2F0aW9uLmhyZWY9bG9jYXRpb24uaHJlZjtcbiAgICAgIH1cbiAgICB9KS5mYWlsKGZ1bmN0aW9uKCl7XG4gICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOifQntGI0LjQsdC60LAg0YPQtNCw0LvQvdC40Y8nLHR5cGU6J2Vycid9KTtcbiAgICB9KVxuICB9XG5cbiAgJCgnYm9keScpLm9uKCdjbGljaycsJy5hamF4X3JlbW92ZScsZnVuY3Rpb24oKXtcbiAgICBub3RpZmljYXRpb24uY29uZmlybSh7XG4gICAgICBjYWxsYmFja1llczpvblJlbW92ZSxcbiAgICAgIG9iajokKHRoaXMpXG4gICAgfSlcbiAgfSk7XG5cbn0pO1xuIiwiLy8kKHdpbmRvdykubG9hZChmdW5jdGlvbigpIHtcblxudmFyIGFjY29yZGlvbkNvbnRyb2wgPSAkKCcuYWNjb3JkaW9uIC5hY2NvcmRpb24tY29udHJvbCcpO1xuXG5hY2NvcmRpb25Db250cm9sLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICR0aGlzID0gJCh0aGlzKTtcbiAgICAkYWNjb3JkaW9uID0gJHRoaXMuY2xvc2VzdCgnLmFjY29yZGlvbicpO1xuXG4gICAgaWYgKCRhY2NvcmRpb24uaGFzQ2xhc3MoJ29wZW4nKSkge1xuICAgICAgJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5oaWRlKDMwMCk7XG4gICAgICAkYWNjb3JkaW9uLnJlbW92ZUNsYXNzKCdvcGVuJylcbiAgICB9IGVsc2Uge1xuICAgICAgJGFjY29yZGlvbi5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5zaG93KDMwMCk7XG4gICAgICAkYWNjb3JkaW9uLmFkZENsYXNzKCdvcGVuJylcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcbmFjY29yZGlvbkNvbnRyb2wuc2hvdygpO1xuLy99KVxuXG5vYmplY3RzID0gZnVuY3Rpb24gKGEsYikge1xuICB2YXIgYyA9IGIsXG4gICAga2V5O1xuICBmb3IgKGtleSBpbiBhKSB7XG4gICAgaWYgKGEuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgY1trZXldID0ga2V5IGluIGIgPyBiW2tleV0gOiBhW2tleV07XG4gICAgfVxuICB9XG4gIHJldHVybiBjO1xufTtcblxuJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCl7XG4gICAgZGF0YT10aGlzO1xuICAgIGlmKGRhdGEudHlwZT09MCkge1xuICAgICAgZGF0YS5pbWcuYXR0cignc3JjJywgZGF0YS5zcmMpO1xuICAgIH1lbHNle1xuICAgICAgZGF0YS5pbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnK2RhdGEuc3JjKycpJyk7XG4gICAgICBkYXRhLmltZy5yZW1vdmVDbGFzcygnbm9fYXZhJyk7XG4gICAgfVxuICB9XG5cbiAgLy/RgtC10YHRgiDQu9C+0LPQviDQvNCw0LPQsNC30LjQvdCwXG4gIGltZ3M9JCgnc2VjdGlvbjpub3QoLm5hdmlnYXRpb24pJykuZmluZCgnLmxvZ28gaW1nJyk7XG4gIGZvciAodmFyIGk9MDtpPGltZ3MubGVuZ3RoO2krKyl7XG4gICAgaW1nPWltZ3MuZXEoaSk7XG4gICAgc3JjPWltZy5hdHRyKCdzcmMnKTtcbiAgICBpbWcuYXR0cignc3JjJywnL2ltYWdlcy90ZW1wbGF0ZS1sb2dvLmpwZycpO1xuICAgIGRhdGE9e1xuICAgICAgc3JjOnNyYyxcbiAgICAgIGltZzppbWcsXG4gICAgICB0eXBlOjAgLy8g0LTQu9GPIGltZ1tzcmNdXG4gICAgfTtcbiAgICBpbWFnZT0kKCc8aW1nLz4nLHtcbiAgICAgIHNyYzpzcmNcbiAgICB9KS5vbignbG9hZCcsaW1nX2xvYWRfZmluaXNoLmJpbmQoZGF0YSkpXG4gIH1cblxuICAvL9GC0LXRgdGCINCw0LLQsNGC0LDRgNC+0Log0LIg0LrQvtC80LXQvdGC0LDRgNC40Y/RhVxuICBpbWdzPSQoJy5jb21tZW50LXBob3RvJyk7XG4gIGZvciAodmFyIGk9MDtpPGltZ3MubGVuZ3RoO2krKyl7XG4gICAgaW1nPWltZ3MuZXEoaSk7XG4gICAgaWYoaW1nLmhhc0NsYXNzKCdub19hdmEnKSl7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBzcmM9aW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScpO1xuICAgIHNyYz1zcmMucmVwbGFjZSgndXJsKFwiJywnJyk7XG4gICAgc3JjPXNyYy5yZXBsYWNlKCdcIiknLCcnKTtcbiAgICBpbWcuYWRkQ2xhc3MoJ25vX2F2YScpO1xuXG4gICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgvaW1hZ2VzL25vX2F2YS5wbmcpJyk7XG4gICAgZGF0YT17XG4gICAgICBzcmM6c3JjLFxuICAgICAgaW1nOmltZyxcbiAgICAgIHR5cGU6MSAvLyDQtNC70Y8g0YTQvtC90L7QstGL0YUg0LrQsNGA0YLQuNC90L7QulxuICAgIH07XG4gICAgaW1hZ2U9JCgnPGltZy8+Jyx7XG4gICAgICBzcmM6c3JjXG4gICAgfSkub24oJ2xvYWQnLGltZ19sb2FkX2ZpbmlzaC5iaW5kKGRhdGEpKVxuICB9XG59KTtcblxuKGZ1bmN0aW9uKCkge1xuICBlbHM9JCgnLmFqYXhfbG9hZCcpO1xuICBmb3IoaT0wO2k8ZWxzLmxlbmd0aDtpKyspe1xuICAgIGVsPWVscy5lcShpKTtcbiAgICB1cmw9ZWwuYXR0cigncmVzJyk7XG4gICAgJC5nZXQodXJsLGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAkdGhpcz0kKHRoaXMpO1xuICAgICAgJHRoaXMuaHRtbChkYXRhKTtcbiAgICAgIGFqYXhGb3JtKCR0aGlzKTtcbiAgICB9LmJpbmQoZWwpKVxuICB9XG59KSgpO1xuXG4kKCdpbnB1dFt0eXBlPWZpbGVdJykub24oJ2NoYW5nZScsZnVuY3Rpb24oZXZ0KXtcbiAgdmFyIGZpbGUgPSBldnQudGFyZ2V0LmZpbGVzOyAvLyBGaWxlTGlzdCBvYmplY3RcbiAgdmFyIGYgPSBmaWxlWzBdO1xuICAvLyBPbmx5IHByb2Nlc3MgaW1hZ2UgZmlsZXMuXG4gIGlmICghZi50eXBlLm1hdGNoKCdpbWFnZS4qJykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cbiAgZGF0YT0ge1xuICAgICdlbCc6IHRoaXMsXG4gICAgJ2YnOiBmXG4gIH07XG4gIHJlYWRlci5vbmxvYWQgPSAoZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICBpbWc9JCgnW2Zvcj1cIicrZGF0YS5lbC5uYW1lKydcIl0nKTtcbiAgICAgIGlmKGltZy5sZW5ndGg+MCl7XG4gICAgICAgIGltZy5hdHRyKCdzcmMnLGUudGFyZ2V0LnJlc3VsdClcbiAgICAgIH1cbiAgICB9O1xuICB9KShkYXRhKTtcbiAgLy8gUmVhZCBpbiB0aGUgaW1hZ2UgZmlsZSBhcyBhIGRhdGEgVVJMLlxuICByZWFkZXIucmVhZEFzRGF0YVVSTChmKTtcbn0pO1xuXG4kKCdib2R5Jykub24oJ2NsaWNrJywnYS5hamF4Rm9ybU9wZW4nLGZ1bmN0aW9uKGUpe1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIGhyZWY9dGhpcy5ocmVmLnNwbGl0KCcjJyk7XG4gIGhyZWY9aHJlZltocmVmLmxlbmd0aC0xXTtcblxuICBkYXRhPXtcbiAgICBidXR0b25ZZXM6ZmFsc2UsXG4gICAgbm90eWZ5X2NsYXNzOlwibm90aWZ5X3doaXRlIGxvYWRpbmdcIixcbiAgICBxdWVzdGlvbjonJ1xuICB9O1xuICBtb2RhbF9jbGFzcz0kKHRoaXMpLmRhdGEoJ21vZGFsLWNsYXNzJyk7XG5cbiAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xuICAkLmdldCgnLycraHJlZixmdW5jdGlvbihkYXRhKXtcbiAgICAkKCcubm90aWZ5X2JveCcpLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgJCgnLm5vdGlmeV9ib3ggLm5vdGlmeV9jb250ZW50JykuaHRtbChkYXRhLmh0bWwpO1xuICAgIGFqYXhGb3JtKCQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpKTtcbiAgICBpZihtb2RhbF9jbGFzcyl7XG4gICAgICAkKCcubm90aWZ5X2JveCAubm90aWZ5X2NvbnRlbnQgLnJvdycpLmFkZENsYXNzKG1vZGFsX2NsYXNzKTtcbiAgICB9XG4gIH0sJ2pzb24nKVxufSk7XG4iLCJ2YXIgbm90aWZpY2F0aW9uID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgY29udGVpbmVyO1xuICB2YXIgbW91c2VPdmVyID0gMDtcbiAgdmFyIHRpbWVyQ2xlYXJBbGwgPSBudWxsO1xuICB2YXIgYW5pbWF0aW9uRW5kID0gJ3dlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmQnO1xuICB2YXIgdGltZSA9IDEwMDAwO1xuXG4gIHZhciBub3RpZmljYXRpb25fYm94ID1mYWxzZTtcbiAgdmFyIGlzX2luaXQ9ZmFsc2U7XG4gIHZhciBjb25maXJtX29wdD17XG4gICAgdGl0bGU6XCLQo9C00LDQu9C10L3QuNC1XCIsXG4gICAgcXVlc3Rpb246XCLQktGLINC00LXQudGB0YLQstC40YLQtdC70YzQvdC+INGF0L7RgtC40YLQtSDRg9C00LDQu9C40YLRjD9cIixcbiAgICBidXR0b25ZZXM6XCLQlNCwXCIsXG4gICAgYnV0dG9uTm86XCLQndC10YJcIixcbiAgICBjYWxsYmFja1llczpmYWxzZSxcbiAgICBjYWxsYmFja05vOmZhbHNlLFxuICAgIG9iajpmYWxzZSxcbiAgICBidXR0b25UYWc6J2RpdicsXG4gICAgYnV0dG9uWWVzRG9wOicnLFxuICAgIGJ1dHRvbk5vRG9wOicnLFxuICB9O1xuICB2YXIgYWxlcnRfb3B0PXtcbiAgICB0aXRsZTpcIlwiLFxuICAgIHF1ZXN0aW9uOlwi0KHQvtC+0LHRidC10L3QuNC1XCIsXG4gICAgYnV0dG9uWWVzOlwi0JTQsFwiLFxuICAgIGNhbGxiYWNrWWVzOmZhbHNlLFxuICAgIGJ1dHRvblRhZzonZGl2JyxcbiAgICBvYmo6ZmFsc2UsXG4gIH07XG5cblxuICBmdW5jdGlvbiBpbml0KCl7XG4gICAgaXNfaW5pdD10cnVlO1xuICAgIG5vdGlmaWNhdGlvbl9ib3g9JCgnLm5vdGlmaWNhdGlvbl9ib3gnKTtcbiAgICBpZihub3RpZmljYXRpb25fYm94Lmxlbmd0aD4wKXJldHVybjtcblxuICAgICQoJ2JvZHknKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdub3RpZmljYXRpb25fYm94Jz48L2Rpdj5cIik7XG4gICAgbm90aWZpY2F0aW9uX2JveD0kKCcubm90aWZpY2F0aW9uX2JveCcpO1xuXG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCcubm90aWZ5X2NvbnRyb2wnLGNsb3NlTW9kYWwpO1xuICAgIG5vdGlmaWNhdGlvbl9ib3gub24oJ2NsaWNrJywnLm5vdGlmeV9jbG9zZScsY2xvc2VNb2RhbCk7XG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLGNsb3NlTW9kYWxGb24pO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2VNb2RhbCgpe1xuICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnc2hvd19ub3RpZmknKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb3NlTW9kYWxGb24oZSl7XG4gICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcbiAgICBpZih0YXJnZXQuY2xhc3NOYW1lPT1cIm5vdGlmaWNhdGlvbl9ib3hcIil7XG4gICAgICBjbG9zZU1vZGFsKCk7XG4gICAgfVxuICB9XG5cbiAgdmFyIF9zZXRVcExpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xuICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnLm5vdGlmaWNhdGlvbl9jbG9zZScsIF9jbG9zZVBvcHVwKTtcbiAgICAkKCdib2R5Jykub24oJ21vdXNlZW50ZXInLCAnLm5vdGlmaWNhdGlvbl9jb250YWluZXInLCBfb25FbnRlcik7XG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWxlYXZlJywgJy5ub3RpZmljYXRpb25fY29udGFpbmVyJywgX29uTGVhdmUpO1xuICB9O1xuXG4gIHZhciBfb25FbnRlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgaWYoZXZlbnQpZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAodGltZXJDbGVhckFsbCE9bnVsbCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyQ2xlYXJBbGwpO1xuICAgICAgdGltZXJDbGVhckFsbCA9IG51bGw7XG4gICAgfVxuICAgIGNvbnRlaW5lci5maW5kKCcubm90aWZpY2F0aW9uX2l0ZW0nKS5lYWNoKGZ1bmN0aW9uKGkpe1xuICAgICAgdmFyIG9wdGlvbj0kKHRoaXMpLmRhdGEoJ29wdGlvbicpO1xuICAgICAgaWYob3B0aW9uLnRpbWVyKSB7XG4gICAgICAgIGNsZWFyVGltZW91dChvcHRpb24udGltZXIpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIG1vdXNlT3ZlciA9IDE7XG4gIH07XG5cbiAgdmFyIF9vbkxlYXZlID0gZnVuY3Rpb24oKSB7XG4gICAgY29udGVpbmVyLmZpbmQoJy5ub3RpZmljYXRpb25faXRlbScpLmVhY2goZnVuY3Rpb24oaSl7XG4gICAgICAkdGhpcz0kKHRoaXMpO1xuICAgICAgdmFyIG9wdGlvbj0kdGhpcy5kYXRhKCdvcHRpb24nKTtcbiAgICAgIGlmKG9wdGlvbi50aW1lPjApIHtcbiAgICAgICAgb3B0aW9uLnRpbWVyID0gc2V0VGltZW91dChfY2xvc2VQb3B1cC5iaW5kKG9wdGlvbi5jbG9zZSksIG9wdGlvbi50aW1lIC0gMTUwMCArIDEwMCAqIGkpO1xuICAgICAgICAkdGhpcy5kYXRhKCdvcHRpb24nLG9wdGlvbilcbiAgICAgIH1cbiAgICB9KTtcbiAgICBtb3VzZU92ZXIgPSAwO1xuICB9O1xuXG4gIHZhciBfY2xvc2VQb3B1cCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgaWYoZXZlbnQpZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciAkdGhpcyA9ICQodGhpcykucGFyZW50KCk7XG4gICAgJHRoaXMub24oYW5pbWF0aW9uRW5kLCBmdW5jdGlvbigpIHtcbiAgICAgICQodGhpcykucmVtb3ZlKCk7XG4gICAgfSk7XG4gICAgJHRoaXMuYWRkQ2xhc3MoJ25vdGlmaWNhdGlvbl9oaWRlJylcbiAgfTtcblxuICBmdW5jdGlvbiBhbGVydChkYXRhKXtcbiAgICBpZighZGF0YSlkYXRhPXt9O1xuICAgIGRhdGE9b2JqZWN0cyhhbGVydF9vcHQsZGF0YSk7XG5cbiAgICBpZighaXNfaW5pdClpbml0KCk7XG5cbiAgICBub3R5ZnlfY2xhc3M9J25vdGlmeV9ib3ggJztcbiAgICBpZihkYXRhLm5vdHlmeV9jbGFzcylub3R5ZnlfY2xhc3MrPWRhdGEubm90eWZ5X2NsYXNzO1xuXG4gICAgYm94X2h0bWw9JzxkaXYgY2xhc3M9XCInK25vdHlmeV9jbGFzcysnXCI+JztcbiAgICBib3hfaHRtbCs9JzxkaXYgY2xhc3M9XCJub3RpZnlfdGl0bGVcIj4nO1xuICAgIGJveF9odG1sKz1kYXRhLnRpdGxlO1xuICAgIGJveF9odG1sKz0nPHNwYW4gY2xhc3M9XCJub3RpZnlfY2xvc2VcIj48L3NwYW4+JztcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XG5cbiAgICBib3hfaHRtbCs9JzxkaXYgY2xhc3M9XCJub3RpZnlfY29udGVudFwiPic7XG4gICAgYm94X2h0bWwrPWRhdGEucXVlc3Rpb247XG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xuXG4gICAgaWYoZGF0YS5idXR0b25ZZXN8fGRhdGEuYnV0dG9uTm8pIHtcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uWWVzKWJveF9odG1sICs9ICc8JytkYXRhLmJ1dHRvblRhZysnIGNsYXNzPVwibm90aWZ5X2J0bl95ZXNcIiAnK2RhdGEuYnV0dG9uWWVzRG9wKyc+JyArIGRhdGEuYnV0dG9uWWVzICsgJzwvJytkYXRhLmJ1dHRvblRhZysnPic7XG4gICAgICBpZiAoZGF0YS5idXR0b25Obylib3hfaHRtbCArPSAnPCcrZGF0YS5idXR0b25UYWcrJyBjbGFzcz1cIm5vdGlmeV9idG5fbm9cIiAnK2RhdGEuYnV0dG9uTm9Eb3ArJz4nICsgZGF0YS5idXR0b25ObyArICc8LycrZGF0YS5idXR0b25UYWcrJz4nO1xuICAgICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG4gICAgfTtcblxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xuXG5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdzaG93X25vdGlmaScpO1xuICAgIH0sMTAwKVxuICB9XG5cbiAgZnVuY3Rpb24gY29uZmlybShkYXRhKXtcbiAgICBpZighZGF0YSlkYXRhPXt9O1xuICAgIGRhdGE9b2JqZWN0cyhjb25maXJtX29wdCxkYXRhKTtcblxuICAgIGlmKCFpc19pbml0KWluaXQoKTtcblxuICAgIGJveF9odG1sPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveFwiPic7XG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X3RpdGxlXCI+JztcbiAgICBib3hfaHRtbCs9ZGF0YS50aXRsZTtcbiAgICBib3hfaHRtbCs9JzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xuXG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRlbnRcIj4nO1xuICAgIGJveF9odG1sKz1kYXRhLnF1ZXN0aW9uO1xuICAgIGJveF9odG1sKz0nPC9kaXY+JztcblxuICAgIGlmKGRhdGEuYnV0dG9uWWVzfHxkYXRhLmJ1dHRvbk5vKSB7XG4gICAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250cm9sXCI+JztcbiAgICAgIGlmIChkYXRhLmJ1dHRvblllcylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5feWVzXCI+JyArIGRhdGEuYnV0dG9uWWVzICsgJzwvZGl2Pic7XG4gICAgICBpZiAoZGF0YS5idXR0b25Obylib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9idG5fbm9cIj4nICsgZGF0YS5idXR0b25ObyArICc8L2Rpdj4nO1xuICAgICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG4gICAgfVxuXG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xuICAgIG5vdGlmaWNhdGlvbl9ib3guaHRtbChib3hfaHRtbCk7XG5cbiAgICBpZihkYXRhLmNhbGxiYWNrWWVzIT1mYWxzZSl7XG4gICAgICBub3RpZmljYXRpb25fYm94LmZpbmQoJy5ub3RpZnlfYnRuX3llcycpLm9uKCdjbGljaycsZGF0YS5jYWxsYmFja1llcy5iaW5kKGRhdGEub2JqKSk7XG4gICAgfVxuICAgIGlmKGRhdGEuY2FsbGJhY2tObyE9ZmFsc2Upe1xuICAgICAgbm90aWZpY2F0aW9uX2JveC5maW5kKCcubm90aWZ5X2J0bl9ubycpLm9uKCdjbGljaycsZGF0YS5jYWxsYmFja05vLmJpbmQoZGF0YS5vYmopKTtcbiAgICB9XG5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdzaG93X25vdGlmaScpO1xuICAgIH0sMTAwKVxuXG4gIH1cblxuICBmdW5jdGlvbiBub3RpZmkoZGF0YSkge1xuICAgIGlmKCFkYXRhKWRhdGE9e307XG4gICAgdmFyIG9wdGlvbiA9IHt0aW1lIDogKGRhdGEudGltZXx8ZGF0YS50aW1lPT09MCk/ZGF0YS50aW1lOnRpbWV9O1xuICAgIGlmICghY29udGVpbmVyKSB7XG4gICAgICBjb250ZWluZXIgPSAkKCc8dWwvPicsIHtcbiAgICAgICAgJ2NsYXNzJzogJ25vdGlmaWNhdGlvbl9jb250YWluZXInXG4gICAgICB9KTtcblxuICAgICAgJCgnYm9keScpLmFwcGVuZChjb250ZWluZXIpO1xuICAgICAgX3NldFVwTGlzdGVuZXJzKCk7XG4gICAgfVxuXG4gICAgdmFyIGxpID0gJCgnPGxpLz4nLCB7XG4gICAgICBjbGFzczogJ25vdGlmaWNhdGlvbl9pdGVtJ1xuICAgIH0pO1xuXG4gICAgaWYgKGRhdGEudHlwZSl7XG4gICAgICBsaS5hZGRDbGFzcygnbm90aWZpY2F0aW9uX2l0ZW0tJyArIGRhdGEudHlwZSk7XG4gICAgfVxuXG4gICAgdmFyIGNsb3NlPSQoJzxzcGFuLz4nLHtcbiAgICAgIGNsYXNzOidub3RpZmljYXRpb25fY2xvc2UnXG4gICAgfSk7XG4gICAgb3B0aW9uLmNsb3NlPWNsb3NlO1xuICAgIGxpLmFwcGVuZChjbG9zZSk7XG5cbiAgICBpZihkYXRhLnRpdGxlICYmIGRhdGEudGl0bGUubGVuZ3RoPjApIHtcbiAgICAgIHZhciB0aXRsZSA9ICQoJzxwLz4nLCB7XG4gICAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90aXRsZVwiXG4gICAgICB9KTtcbiAgICAgIHRpdGxlLmh0bWwoZGF0YS50aXRsZSk7XG4gICAgICBsaS5hcHBlbmQodGl0bGUpO1xuICAgIH1cblxuICAgIGlmKGRhdGEuaW1nICYmIGRhdGEuaW1nLmxlbmd0aD4wKSB7XG4gICAgICB2YXIgaW1nID0gJCgnPGRpdi8+Jywge1xuICAgICAgICBjbGFzczogXCJub3RpZmljYXRpb25faW1nXCJcbiAgICAgIH0pO1xuICAgICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgnK2RhdGEuaW1nKycpJyk7XG4gICAgICBsaS5hcHBlbmQoaW1nKTtcbiAgICB9XG5cbiAgICB2YXIgY29udGVudCA9ICQoJzxkaXYvPicse1xuICAgICAgY2xhc3M6XCJub3RpZmljYXRpb25fY29udGVudFwiXG4gICAgfSk7XG4gICAgY29udGVudC5odG1sKGRhdGEubWVzc2FnZSk7XG5cbiAgICBsaS5hcHBlbmQoY29udGVudCk7XG5cbiAgICBjb250ZWluZXIuYXBwZW5kKGxpKTtcblxuICAgIGlmKG9wdGlvbi50aW1lPjApe1xuICAgICAgb3B0aW9uLnRpbWVyPXNldFRpbWVvdXQoX2Nsb3NlUG9wdXAuYmluZChjbG9zZSksIG9wdGlvbi50aW1lKTtcbiAgICB9XG4gICAgbGkuZGF0YSgnb3B0aW9uJyxvcHRpb24pXG4gIH1cblxuICByZXR1cm4ge1xuICAgIGFsZXJ0OiBhbGVydCxcbiAgICBjb25maXJtOiBjb25maXJtLFxuICAgIG5vdGlmaTogbm90aWZpLFxuICB9O1xuXG59KSgpO1xuXG5cbiQoJ1tyZWY9cG9wdXBdJykub24oJ2NsaWNrJyxmdW5jdGlvbiAoZSl7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgJHRoaXM9JCh0aGlzKTtcbiAgZWw9JCgkdGhpcy5hdHRyKCdocmVmJykpO1xuICBkYXRhPWVsLmRhdGEoKTtcblxuICBkYXRhLnF1ZXN0aW9uPWVsLmh0bWwoKTtcbiAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xufSk7XG4iLCIkKGZ1bmN0aW9uKCkge1xuXG4gIGZ1bmN0aW9uIHVwZGF0ZShkYXRhKXtcbiAgICAkdGhpcz0kKHRoaXMpO1xuICAgIG1vZGU9JHRoaXMuYXR0cignbW9kZScpO1xuICAgIGlmKG1vZGU9PSdyYXRlJyl7XG4gICAgICAkcGFyZW50PSR0aGlzLmNsb3Nlc3QoJy5hY29yZGlvbl9jb250ZW50Jyk7XG4gICAgICAkcGFyZW50PSRwYXJlbnQuZmluZCgndGFibGUnKTtcbiAgICAgIGRhdGE9JChkYXRhKTtcbiAgICAgIGRhdGEuYWpheF9zYXZlKCk7XG4gICAgICAkcGFyZW50LmFwcGVuZChkYXRhKVxuICAgIH1cblxuICAgIGlmKG1vZGU9PSd0YXJpZmYnKXtcbiAgICAgICRwYXJlbnQ9JHRoaXMuY2xvc2VzdCgnLmFjb3JkaW9uX2NvbnRlbnQnKTtcbiAgICAgIGRhdGE9JChkYXRhKTtcbiAgICAgIGRhdGEuZmluZCgnLmFqYXhfc2F2ZScpLmFqYXhfc2F2ZSgpO1xuICAgICAgJHBhcmVudC5hcHBlbmQoZGF0YSlcbiAgICB9XG5cbiAgICBpZihtb2RlPT0nYWN0aW9uJyl7XG4gICAgICAkcGFyZW50PSR0aGlzLmNsb3Nlc3QoJy5jcGFfYm94Jyk7XG4gICAgICBkYXRhPSQoZGF0YSk7XG4gICAgICBkYXRhLmZpbmQoJy5hamF4X3NhdmUnKS5hamF4X3NhdmUoKTtcbiAgICAgICRwYXJlbnQuYXBwZW5kKGRhdGEpXG4gICAgfVxuXG4gICAgaWYobW9kZT09J2NwYScpe1xuICAgICAgZGF0YT1KU09OLnBhcnNlKGRhdGEpO1xuXG4gICAgICAkcGFyZW50PSR0aGlzLmNsb3Nlc3QoJy50YXJpZl9zZWxlY3RfYmxrJyk7XG5cbiAgICAgICRwYXJlbnQucHJlcGVuZChkYXRhWyd0YWJfaGVhZF9zdWYnXSk7XG4gICAgICAkcGFyZW50LmZpbmQoJy50YWJfY29udHJvbCcpXG4gICAgICAgIC5hcHBlbmQoZGF0YVsndGFiX2hlYWRfYnV0J10pXG4gICAgICAgIC5hamF4X3NhdmUoKTtcblxuICAgICAgZGF0YT0kKGRhdGFbJ3RhYl9ib2R5J10pO1xuICAgICAgZGF0YS5maW5kKCcuYWpheF9zYXZlJykuYWpheF9zYXZlKCk7XG4gICAgICAkcGFyZW50XG4gICAgICAgIC5maW5kKCcuY29udGVudF90YWInKVxuICAgICAgICAuYXBwZW5kKGRhdGEpXG4gICAgfVxuICB9XG5cbiAgJCgnYm9keScpLm9uKCdjbGljaycsJy5hZGRfc2hvcF9lbGVtZW50JyxmdW5jdGlvbigpe1xuICAgICR0aGlzPSQodGhpcyk7XG4gICAgcG9zdD17XG4gICAgICBjb2RlOiR0aGlzLmF0dHIoJ2NvZGUnKSxcbiAgICAgIHBhcmVudDokdGhpcy5hdHRyKCdwYXJlbnQnKSxcbiAgICAgIHR5cGU6JHRoaXMuYXR0cignbW9kZScpXG4gICAgfTtcbiAgICB1cGRhdGVFbGVtZW50PXVwZGF0ZS5iaW5kKCR0aGlzKTtcbiAgICAkLnBvc3QoXCIvYWRtaW4vc3RvcmVzL2FqYXhfaW5zZXJ0L1wiKyR0aGlzLmF0dHIoJ21vZGUnKSxwb3N0LHVwZGF0ZUVsZW1lbnQpLmZhaWwoZnVuY3Rpb24oKSB7XG4gICAgICBhbGVydCggXCLQntGI0LjQsdC60LAg0LTQvtCx0LDQstC70LXQvdC40Y9cIiApO1xuICAgIH0pXG4gIH0pXG59KTtcbiIsImZ1bmN0aW9uIGFqYXhGb3JtKGVscykge1xuICB2YXIgZmlsZUFwaSA9IHdpbmRvdy5GaWxlICYmIHdpbmRvdy5GaWxlUmVhZGVyICYmIHdpbmRvdy5GaWxlTGlzdCAmJiB3aW5kb3cuQmxvYiA/IHRydWUgOiBmYWxzZTtcbiAgdmFyIGRlZmF1bHRzID0ge1xuICAgIGVycm9yX2NsYXNzOiAnLmhhcy1lcnJvcicsXG4gIH07XG5cbiAgZnVuY3Rpb24gb25Qb3N0KHBvc3Qpe1xuICAgIHZhciBkYXRhPXRoaXM7XG4gICAgZm9ybT1kYXRhLmZvcm07XG4gICAgd3JhcD1kYXRhLndyYXA7XG4gICAgaWYocG9zdC5yZW5kZXIpe1xuICAgICAgcG9zdC5ub3R5ZnlfY2xhc3M9XCJub3RpZnlfd2hpdGVcIjtcbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydChwb3N0KTtcbiAgICB9ZWxzZXtcbiAgICAgIHdyYXAucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgIHdyYXAuaHRtbChwb3N0Lmh0bWwpO1xuICAgICAgYWpheEZvcm0od3JhcCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb25GYWlsKCl7XG4gICAgdmFyIGRhdGE9dGhpcztcbiAgICBmb3JtPWRhdGEuZm9ybTtcbiAgICB3cmFwPWRhdGEud3JhcDtcbiAgICB3cmFwLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgd3JhcC5odG1sKCc8aDM+0KPQv9GBLi4uINCS0L7Qt9C90LjQutC70LAg0L3QtdC/0YDQtdC00LLQuNC00LXQvdC90LDRjyDQvtGI0LjQsdC60LAuPGgzPicgK1xuICAgICAgJzxwPtCn0LDRgdGC0L4g0Y3RgtC+INC/0YDQvtC40YHRhdC+0LTQuNGCINCyINGB0LvRg9GH0LDQtSwg0LXRgdC70Lgg0LLRiyDQvdC10YHQutC+0LvRjNC60L4g0YDQsNC3INC/0L7QtNGA0Y/QtCDQvdC10LLQtdGA0L3QviDQstCy0LXQu9C4INGB0LLQvtC4INGD0YfQtdGC0L3Ri9C1INC00LDQvdC90YvQtS4g0J3QviDQstC+0LfQvNC+0LbQvdGLINC4INC00YDRg9Cz0LjQtSDQv9GA0LjRh9C40L3Riy4g0JIg0LvRjtCx0L7QvCDRgdC70YPRh9Cw0LUg0L3QtSDRgNCw0YHRgdGC0YDQsNC40LLQsNC50YLQtdGB0Ywg0Lgg0L/RgNC+0YHRgtC+INC+0LHRgNCw0YLQuNGC0LXRgdGMINC6INC90LDRiNC10LzRgyDQvtC/0LXRgNCw0YLQvtGA0YMg0YHQu9GD0LbQsdGLINC/0L7QtNC00LXRgNC20LrQuC48L3A+PGJyPicgK1xuICAgICAgJzxwPtCh0L/QsNGB0LjQsdC+LjwvcD4nKTtcbiAgICBhamF4Rm9ybSh3cmFwKTtcblxuICB9XG5cbiAgZnVuY3Rpb24gb25TdWJtaXQoZSl7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBkYXRhPXRoaXM7XG4gICAgZm9ybT1kYXRhLmZvcm07XG4gICAgd3JhcD1kYXRhLndyYXA7XG5cbiAgICBpZihmb3JtLnlpaUFjdGl2ZUZvcm0pe1xuICAgICAgZm9ybS55aWlBY3RpdmVGb3JtKCd2YWxpZGF0ZScpO1xuICAgIH07XG5cbiAgICBpc1ZhbGlkPShmb3JtLmZpbmQoZGF0YS5wYXJhbS5lcnJvcl9jbGFzcykubGVuZ3RoPT0wKTtcblxuICAgIGlmKCFpc1ZhbGlkKXtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9ZWxzZXtcbiAgICAgIHJlcXVpcmVkPWZvcm0uZmluZCgnaW5wdXQucmVxdWlyZWQnKTtcbiAgICAgIGZvcihpPTA7aTxyZXF1aXJlZC5sZW5ndGg7aSsrKXtcbiAgICAgICAgaWYocmVxdWlyZWQuZXEoaSkudmFsKCkubGVuZ3RoPDEpe1xuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoIWZvcm0uc2VyaWFsaXplT2JqZWN0KWFkZFNSTygpO1xuXG4gICAgdmFyIHBvc3Q9Zm9ybS5zZXJpYWxpemVPYmplY3QoKTtcbiAgICBmb3JtLmFkZENsYXNzKCdsb2FkaW5nJyk7XG4gICAgZm9ybS5odG1sKCcnKTtcblxuICAgICQucG9zdChcbiAgICAgIGRhdGEudXJsLFxuICAgICAgcG9zdCxcbiAgICAgIG9uUG9zdC5iaW5kKGRhdGEpLFxuICAgICAgJ2pzb24nXG4gICAgKS5mYWlsKG9uRmFpbC5iaW5kKGRhdGEpKTtcblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGVscy5maW5kKCdbcmVxdWlyZWRdJylcbiAgICAuYWRkQ2xhc3MoJ3JlcXVpcmVkJylcbiAgICAucmVtb3ZlQXR0cigncmVxdWlyZWQnKTtcblxuICBmb3IodmFyIGk9MDtpPGVscy5sZW5ndGg7aSsrKXtcbiAgICB3cmFwPWVscy5lcShpKTtcbiAgICBmb3JtPXdyYXAuZmluZCgnZm9ybScpO1xuICAgIGRhdGE9e1xuICAgICAgZm9ybTpmb3JtLFxuICAgICAgcGFyYW06ZGVmYXVsdHMsXG4gICAgICB3cmFwOndyYXBcbiAgICB9O1xuICAgIGRhdGEudXJsPWZvcm0uYXR0cignYWN0aW9uJykgfHwgbG9jYXRpb24uaHJlZjtcbiAgICBkYXRhLm1ldGhvZD0gZm9ybS5hdHRyKCdtZXRob2QnKSB8fCAncG9zdCc7XG4gICAgZm9ybS5vZmYoJ3N1Ym1pdCcpO1xuICAgIGZvcm0ub24oJ3N1Ym1pdCcsIG9uU3VibWl0LmJpbmQoZGF0YSkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFkZFNSTygpe1xuICAkLmZuLnNlcmlhbGl6ZU9iamVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbyA9IHt9O1xuICAgIHZhciBhID0gdGhpcy5zZXJpYWxpemVBcnJheSgpO1xuICAgICQuZWFjaChhLCBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAob1t0aGlzLm5hbWVdKSB7XG4gICAgICAgIGlmICghb1t0aGlzLm5hbWVdLnB1c2gpIHtcbiAgICAgICAgICBvW3RoaXMubmFtZV0gPSBbb1t0aGlzLm5hbWVdXTtcbiAgICAgICAgfVxuICAgICAgICBvW3RoaXMubmFtZV0ucHVzaCh0aGlzLnZhbHVlIHx8ICcnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9bdGhpcy5uYW1lXSA9IHRoaXMudmFsdWUgfHwgJyc7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG87XG4gIH07XG59O1xuYWRkU1JPKCk7Il19
