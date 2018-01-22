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

var megaslider = (function() {
  var slider_data=false;
  var container_id="section#mega_slider";
  var parallax_group=false;
  var parallax_timer=false;
  var parallax_counter=0;
  var parallax_d=1;
  var mobile_mode=-1;
  var max_time_load_pic=300;
  var mobile_size=700;
  var render_slide_nom=0;
  var tot_img_wait;
  var slides;
  var slide_select_box;
  var editor;
  var timeoutId;
  var scroll_period = 5000;

  var posArr=[
    'slider__text-lt','slider__text-ct','slider__text-rt',
    'slider__text-lc','slider__text-cc','slider__text-rc',
    'slider__text-lb','slider__text-cb','slider__text-rb',
  ];
  var pos_list=[
    'Лево верх','центр верх','право верх',
    'Лево центр','центр','право центр',
    'Лево низ','центр низ','право низ',
  ];
  var show_delay=[
    'show_no_delay',
    'show_delay_05',
    'show_delay_10',
    'show_delay_15',
    'show_delay_20',
    'show_delay_25',
    'show_delay_30'
  ];
  var hide_delay=[
    'hide_no_delay',
    'hide_delay_05',
    'hide_delay_10',
    'hide_delay_15',
    'hide_delay_20'
  ];
  var yes_no_arr=[
    'no',
    'yes'
  ];
  var yes_no_val=[
    '',
    'fixed__full-height'
  ];
  var btn_style=[
    'none',
    'bordo',
  ];
  var show_animations=[
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

  var hide_animations=[
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
    if(els.length==0)return;
    els.wrap('<div class="select_img">');
    els=els.parent();
    els.append('<button type="button" class="file_button"><i class="mce-ico mce-i-browse"></i></button>');
    /*els.find('button').on('click',function () {
      $('#roxyCustomPanel2').addClass('open')
    });*/
    for (var i=0;i<els.length;i++) {
      var el=els.eq(i).find('input');
      if(!el.attr('id')){
        el.attr('id','file_'+i+'_'+Date.now())
      }
      var t_id=el.attr('id');
      mihaildev.elFinder.register(t_id, function (file, id) {
        //$(this).val(file.url).trigger('change', [file, id]);
        $('#'+id).val(file.url).change();
        return true;
      });
    };

    $(document).on('click', '.file_button', function(){
      var $this=$(this).prev();
      var id=$this.attr('id');
      mihaildev.elFinder.openManager({
        "url":"/manager/elfinder?filter=image&callback="+id+"&lang=ru",
        "width":"auto",
        "height":"auto",
        "id":id
      });
    });
  }

  function genInput(data){
    var input='<input class="' + (data.inputClass || '') + '" value="' + (data.value || '') + '">';
    if(data.label) {
      input = '<label><span>' + data.label + '</span>'+input+'</label>';
    }
    if(data.parent) {
      input = '<'+data.parent+'>'+input+'</'+data.parent+'>';
    }
    input = $(input);

    if(data.onChange){
      var onChange;
      if(data.bind){
        data.bind.input=input.find('input');
        onChange = data.onChange.bind(data.bind);
      }else{
        onChange = data.onChange.bind(input.find('input'));
      }
      input.find('input').on('change',onChange)
    }
    return input;
  }

  function genSelect(data){
    var input=$('<select/>');

    var el=slider_data[0][data.gr];
    if(data.index!==false){
      el=el[data.index];
    }

    if(el[data.param]){
      data.value=el[data.param];
    }else{
      data.value=0;
    }

    if(data.start_option){
      input.append(data.start_option)
    }

    for(var i=0;i<data.list.length;i++){
      var val;
      var txt=data.list[i];
      if(data.val_type==0){
        val=data.list[i];
      }else if(data.val_type==1){
        val=i;
      }else if(data.val_type==2){
        //val=data.val_list[i];
        val=i;
        txt=data.val_list[i];
      }

      var sel=(val==data.value?'selected':'');
      if(sel=='selected'){
        input.attr('t_val',data.list[i]);
      }
      var option='<option value="'+val+'" '+sel+'>'+txt+'</option>';
      if(data.val_type==2){
        option=$(option).attr('code',data.list[i]);
      }
      input.append(option)
    }

    input.on('change',function () {
      data=this;
      var val=data.el.val();
      var sl_op=data.el.find('option[value='+val+']');
      var cls=sl_op.text();
      var ch=sl_op.attr('code');
      if(!ch)ch=cls;
      if(data.index!==false){
        slider_data[0][data.gr][data.index][data.param]=val;
      }else{
        slider_data[0][data.gr][data.param]=val;
      }

      data.obj.removeClass(data.prefix+data.el.attr('t_val'));
      data.obj.addClass(data.prefix+ch);
      data.el.attr('t_val',ch);

      $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
    }.bind({
      el:input,
      obj:data.obj,
      gr:data.gr,
      index:data.index,
      param:data.param,
      prefix:data.prefix||''
    }));

    if(data.parent){
      var parent=$('<'+data.parent+'/>');
      parent.append(input);
      return parent;
    }
    return input;
  }

  function getSelAnimationControll(data){
    var anim_sel=[];
    var out;

    if(data.type==0) {
      anim_sel.push('<span>Анимация появления</span>');
    }
    anim_sel.push(genSelect({
      list:show_animations,
      val_type:0,
      obj:data.obj,
      gr:data.gr,
      index:data.index,
      param:'show_animation',
      prefix:'slide_',
      parent:data.parent
    }));
    if(data.type==0) {
      anim_sel.push('<span>Задержка появления</span>');
    }
    anim_sel.push(genSelect({
      list:show_delay,
      val_type:1,
      obj:data.obj,
      gr:data.gr,
      index:data.index,
      param:'show_delay',
      prefix:'slide_',
      parent:data.parent
    }));

    if(data.type==0) {
      anim_sel.push('<br/>');
      anim_sel.push('<span>Анимация исчезновения</span>');
    }
    anim_sel.push(genSelect({
      list:hide_animations,
      val_type:0,
      obj:data.obj,
      gr:data.gr,
      index:data.index,
      param:'hide_animation',
      prefix:'slide_',
      parent:data.parent
    }));
    if(data.type==0) {
      anim_sel.push('<span>Задержка исчезновения</span>');
    }
    anim_sel.push(genSelect({
      list:hide_delay,
      val_type:1,
      obj:data.obj,
      gr:data.gr,
      index:data.index,
      param:'hide_delay',
      prefix:'slide_',
      parent:data.parent
    }));

    if(data.type==0){
      out=$('<div class="anim_sel"/>');
      out.append(anim_sel);
    }
    if(data.type==1){
      out=anim_sel;
    }

    return out;
  }

  function init_editor(){
    $('#w1').remove();
    $('#w1_button').remove();
    slider_data[0].mobile=slider_data[0].mobile.split('?')[0];

    var el=$('#mega_slider_controle');
    var btns_box=$('<div class="btn_box"/>');

    el.append('<h2>Управление</h2>');
    el.append($('<textarea/>',{
      text:JSON.stringify(slider_data[0]),
      id:'slide_data',
      name: editor
    }));

    var btn=$('<button class=""/>').text("Активировать слайд");
    btns_box.append(btn);
    btn.on('click',function(e){
      e.preventDefault();
      $('#mega_slider .slide').eq(0).addClass('slider-active');
      $('#mega_slider .slide').eq(0).removeClass('hide_slide');
    });

    var btn=$('<button class=""/>').text("Деактивировать слайд");
    btns_box.append(btn);
    btn.on('click',function(e){
      e.preventDefault();
      $('#mega_slider .slide').eq(0).removeClass('slider-active');
      $('#mega_slider .slide').eq(0).addClass('hide_slide');
    });
    el.append(btns_box);

    el.append('<h2>Общие параметры</h2>');
    el.append(genInput({
      value:slider_data[0].mobile,
      label:"Слайд для телефона",
      inputClass:"fileSelect",
      onChange:function(e){
        e.preventDefault();
        slider_data[0].mobile=$(this).val()
        $('.mob_bg').eq(0).css('background-image','url('+slider_data[0].mobile+')');
        $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
      }
    }));

    el.append(genInput({
      value:slider_data[0].fon,
      label:"Осноной фон",
      inputClass:"fileSelect",
      onChange:function(e){
        e.preventDefault();
        slider_data[0].fon=$(this).val()
        $('#mega_slider .slide').eq(0).css('background-image','url('+slider_data[0].fon+')')
        $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
      }
    }));

    var btn_ch=$('<div class="btns"/>');
    btn_ch.append('<h3>Кнопка перехода(для ПК версии)</h3>');
    btn_ch.append(genInput({
      value:slider_data[0].button.text,
      label:"Текст",
      onChange:function(e){
        e.preventDefault();
        slider_data[0].button.text=$(this).val();
        $('#mega_slider .slider__href').eq(0).text(slider_data[0].button.text);
        $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
      },
    }));

    var but_sl=$('#mega_slider .slider__href').eq(0);

    btn_ch.append('<br/>');
    btn_ch.append('<span>Оформление кнопки</span>');
    btn_ch.append(genSelect({
      list:btn_style,
      val_type:0,
      obj:but_sl,
      gr:'button',
      index:false,
      param:'color'
    }));

    btn_ch.append('<br/>');
    btn_ch.append('<span>Положение кнопки</span>');
    btn_ch.append(genSelect({
      list:posArr,
      val_list:pos_list,
      val_type:2,
      obj:but_sl.parent().parent(),
      gr:'button',
      index:false,
      param:'pos'
    }));

    btn_ch.append(getSelAnimationControll({
      type:0,
      obj:but_sl.parent(),
      gr:'button',
      index:false
    }));
    el.append(btn_ch);

    var layer=$('<div class="fixed_layer"/>');
    layer.append('<h2>Статические слои</h2>');
    var th="<th>№</th>"+
            "<th>Картинка</th>"+
            "<th>Положение</th>"+
            "<th>Слой на всю высоту</th>"+
            "<th>Анимация появления</th>"+
            "<th>Задержка появления</th>"+
            "<th>Анимация исчезновения</th>"+
            "<th>Задержка исчезновения</th>"+
            "<th>Действие</th>";
    stTable=$('<table border="1"><tr>'+th+'</tr></table>');
    //если есть паралакс слои заполняем
    var data=slider_data[0].fixed;
    if(data && data.length>0){
      for(var i=0;i<data.length;i++){
        addTrStatic(data[i]);
      }
    }
    layer.append(stTable);
    var addBtn=$('<button/>',{
      text:"Добавить слой"
    });
    addBtn.on('click',function(e){
      e.preventDefault();
      data = addTrStatic(false);
      initImageServerSelect(data.editor.find('.fileSelect'));
      $('textarea#slide_data').text(JSON.stringify(this.slider_data[0]))
    }.bind({
      slider_data:slider_data
    }));
    layer.append(addBtn);
    el.append(layer);

    var layer=$('<div class="paralax_layer"/>');
    layer.append('<h2>Паралакс слои</h2>');
    var th="<th>№</th>"+
      "<th>Картинка</th>"+
      "<th>Положение</th>"+
      "<th>Удаленность (целое положительное число)</th>"+
      "<th>Действие</th>";

    paralaxTable=$('<table border="1"><tr>'+th+'</tr></table>');
    //если есть паралакс слои заполняем
    var data=slider_data[0].paralax;
    if(data && data.length>0){
      for(var i=0;i<data.length;i++){
        addTrParalax(data[i]);
      }
    }
    layer.append(paralaxTable);
    var addBtn=$('<button/>',{
      text:"Добавить слой"
    });
    addBtn.on('click',function(e){
      e.preventDefault();
      data = addTrParalax(false);
      initImageServerSelect(data.editor.find('.fileSelect'));
      $('textarea#slide_data').text(JSON.stringify(this.slider_data[0]))
    }.bind({
      slider_data:slider_data
    }));

    layer.append(addBtn);
    el.append(layer);

    initImageServerSelect(el.find('.fileSelect'));
  }

  function addTrStatic(data) {
    var i=stTable.find('tr').length-1;
    if(!data){
      data={
        "img":"",
        "full_height":0,
        "pos":0,
        "show_delay":1,
        "show_animation":"lightSpeedIn",
        "hide_delay":1,
        "hide_animation":"bounceOut"
      };
      slider_data[0].fixed.push(data);
      var fix = $('#mega_slider .fixed_group');
      addStaticLayer(data, fix,true);
    };

    var tr=$('<tr/>');
    tr.append('<td class="td_counter"/>');
    tr.append(genInput({
      value:data.img,
      label:false,
      parent:'td',
      inputClass:"fileSelect",
      bind:{
        gr:'fixed',
        index:i,
        param:'img',
        obj:$('#mega_slider .fixed_group .fixed__layer').eq(i).find('.animation_layer'),
      },
      onChange:function(e){
        e.preventDefault();
        var data=this;
        data.obj.css('background-image','url('+data.input.val()+')');
        slider_data[0].fixed[data.index].img=data.input.val();
        $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
      }
    }));
    tr.append(genSelect({
      list:posArr,
      val_list:pos_list,
      val_type:2,
      obj:$('#mega_slider .fixed_group .fixed__layer').eq(i),
      gr:'fixed',
      index:i,
      param:'pos',
      parent:'td',
    }));
    tr.append(genSelect({
      list:yes_no_val,
      val_list:yes_no_arr,
      val_type:2,
      obj:$('#mega_slider .fixed_group .fixed__layer').eq(i),
      gr:'fixed',
      index:i,
      param:'full_height',
      parent:'td',
    }));
    tr.append(getSelAnimationControll({
      type:1,
      obj:$('#mega_slider .fixed_group .fixed__layer').eq(i).find('.animation_layer'),
      gr:'fixed',
      index:i,
      parent:'td'
    }));
    var delBtn=$('<button/>',{
      text:"Удалить"
    });
    delBtn.on('click',function(e){
      e.preventDefault();
      var $this=$(this.el);
      i=$this.closest('tr').index()-1;
      $('#mega_slider .fixed_group .fixed__layer').eq(i).remove(); //удаляем слой на слайдере
      $this.closest('tr').remove(); //удаляем строку в таблице
      this.slider_data[0].fixed.splice(i, 1); //удаляем из конфига слайда
      $('textarea#slide_data').text(JSON.stringify(this.slider_data[0]))
    }.bind({
      el:delBtn,
      slider_data:slider_data
    }));
    var delBtnTd=$('<td/>').append(delBtn);
    tr.append(delBtnTd);
    stTable.append(tr)

    return {
      editor:tr,
      data:data
    }
  }

  function addTrParalax(data) {
    var i=paralaxTable.find('tr').length-1;
    if(!data){
      data={
        "img":"",
        "z":1
      };
      slider_data[0].paralax.push(data);
      var paralax_gr = $('#mega_slider .parallax__group');
      addParalaxLayer(data, paralax_gr);
    };
    var tr=$('<tr/>');
    tr.append('<td class="td_counter"/>');
    tr.append(genInput({
      value:data.img,
      label:false,
      parent:'td',
      inputClass:"fileSelect",
      bind:{
        index:i,
        param:'img',
        obj:$('#mega_slider .parallax__group .parallax__layer').eq(i).find('span'),
      },
      onChange:function(e){
        e.preventDefault();
        var data=this;
        data.obj.css('background-image','url('+data.input.val()+')');
        slider_data[0].paralax[data.index].img=data.input.val();
        $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
      }
    }));
    tr.append(genSelect({
      list:posArr,
      val_list:pos_list,
      val_type:2,
      obj:$('#mega_slider .parallax__group .parallax__layer').eq(i).find('span'),
      gr:'paralax',
      index:i,
      param:'pos',
      parent:'td',
      start_option:'<option value="" code="">на весь экран</option>'
    }));
    tr.append(genInput({
      value:data.z,
      label:false,
      parent:'td',
      bind:{
        index:i,
        param:'img',
        obj:$('#mega_slider .parallax__group .parallax__layer').eq(i),
      },
      onChange:function(e){
        e.preventDefault();
        var data=this;
        data.obj.attr('z',data.input.val());
        slider_data[0].paralax[data.index].z=data.input.val();
        $('textarea#slide_data').text(JSON.stringify(slider_data[0]))
      }
    }));

    var delBtn=$('<button/>',{
      text:"Удалить"
    });
    delBtn.on('click',function(e){
      e.preventDefault();
      var $this=$(this.el);
      i=$this.closest('tr').index()-1;
      $('#mega_slider .fixed_group .fixed__layer').eq(i).remove(); //удаляем слой на слайдере
      $this.closest('tr').remove(); //удаляем строку в таблице
      this.slider_data[0].paralax.splice(i, 1); //удаляем из конфига слайда
      $('textarea#slide_data').text(JSON.stringify(this.slider_data[0]))
    }.bind({
      el:delBtn,
      slider_data:slider_data
    }));
    var delBtnTd=$('<td/>').append(delBtn);
    tr.append(delBtnTd);
    paralaxTable.append(tr)

    return {
      editor:tr,
      data:data
    }
  }

  function add_animation(el,data){
    var out=$('<div/>',{
      'class':'animation_layer'
    });

    if(typeof(data.show_delay)!='undefined'){
      out.addClass(show_delay[data.show_delay]);
      if(data.show_animation){
        out.addClass('slide_'+data.show_animation);
      }
    }

    if(typeof(data.hide_delay)!='undefined'){
      out.addClass(hide_delay[data.hide_delay]);
      if(data.hide_animation){
        out.addClass('slide_'+data.hide_animation);
      }
    }

    el.append(out);
    return el;
  }

  function generate_slide(data){
    var slide=$('<div class="slide"/>');

    var mob_bg=$('<a class="mob_bg" href="'+data.button.href+'"/>');
    mob_bg.css('background-image','url('+data.mobile+')')

    slide.append(mob_bg);
    if(mobile_mode){
      return slide;
    }

    //если есть фон то заполняем
    if(data.fon){
      slide.css('background-image','url('+data.fon+')')
    }

    //если есть паралакс слои заполняем
    if(data.paralax && data.paralax.length>0){
      var paralax_gr=$('<div class="parallax__group"/>');
      for(var i=0;i<data.paralax.length;i++){
        addParalaxLayer(data.paralax[i],paralax_gr)
      }
      slide.append(paralax_gr)
    }

    var fix=$('<div class="fixed_group"/>');
    for(var i=0;i<data.fixed.length;i++){
      addStaticLayer(data.fixed[i],fix)
    }

    var dop_blk=$("<div class='fixed__layer'/>");
    dop_blk.addClass(posArr[data.button.pos]);
    var but=$("<a class='slider__href'/>");
    but.attr('href',data.button.href);
    but.text(data.button.text);
    but.addClass(data.button.color);
    dop_blk=add_animation(dop_blk,data.button);
    dop_blk.find('div').append(but);
    fix.append(dop_blk);

    slide.append(fix);
    return slide;
  }

  function addParalaxLayer(data,paralax_gr){
    var parallax_layer=$('<div class="parallax__layer"\>');
    parallax_layer.attr('z',data.z||i*10);
    var dop_blk=$("<span class='slider__text'/>");
    if(data.pos) {
      dop_blk.addClass(posArr[data.pos]);
    }
    dop_blk.css('background-image','url('+data.img+')');
    parallax_layer.append(dop_blk);
    paralax_gr.append(parallax_layer);
  }

  function addStaticLayer(data,fix,befor_button){
    var dop_blk=$("<div class='fixed__layer'/>");
    dop_blk.addClass(posArr[data.pos]);
    if(data.full_height){
      dop_blk.addClass('fixed__full-height');
    }
    dop_blk=add_animation(dop_blk,data);
    dop_blk.find('.animation_layer').css('background-image','url('+data.img+')');

    if(befor_button){
      fix.find('.slider__href').closest('.fixed__layer').before(dop_blk)
    }else {
      fix.append(dop_blk)
    }
  }

  function next_slide() {
    if($('#mega_slider').hasClass('stop_slide'))return;

    var slide_points=$('.slide_select_box .slide_select')
    var slide_cnt=slide_points.length;
    var active=$('.slide_select_box .slider-active').index()+1;
    if(active>=slide_cnt)active=0;
    slide_points.eq(active).click();

    setTimeout(next_slide, scroll_period);
  }

  function img_to_load(src){
    var img=$('<img/>');
    img.on('load',function(){
      tot_img_wait--;

      if(tot_img_wait==0){

        slides.append(generate_slide(slider_data[render_slide_nom]));
        slide_select_box.find('li').eq(render_slide_nom).removeClass('disabled');

        if(render_slide_nom==0){
          slides.find('.slide')
            .addClass('first_show')
            .addClass('slider-active');
          slide_select_box.find('li').eq(0).addClass('slider-active');

          if(!editor) {
            setTimeout(function () {
              $(this).find('.first_show').removeClass('first_show');
            }.bind(slides), 5000);
          }

          if(mobile_mode===false) {
            parallax_group = $(container_id + ' .slider-active .parallax__group>*');
            parallax_counter = 0;
            parallax_timer = setInterval(render, 100);
          }

          if(editor){
            init_editor()
          }else {
            timeoutId = setTimeout(next_slide, scroll_period);

            $('.slide_select_box').on('click','.slide_select',function(){
              var $this=$(this);
              if($this.hasClass('slider-active'))return;

              var index = $this.index();
              $('.slide_select_box .slider-active').removeClass('slider-active');
              $this.addClass('slider-active');

              $(container_id+' .slide.slider-active').removeClass('slider-active');
              $(container_id+' .slide').eq(index).addClass('slider-active');

              parallax_group = $(container_id + ' .slider-active .parallax__group>*');
            });

            $('#mega_slider').hover(function () {
              clearTimeout(timeoutId);
              $('#mega_slider').addClass('stop_slide');
            }, function () {
              timeoutId = setTimeout(next_slide, scroll_period);
              $('#mega_slider').removeClass('stop_slide');
            });
          }
        }

        render_slide_nom++;
        if(render_slide_nom<slider_data.length){
          load_slide_img()
        }
      }
    }).on('error',function () {
      tot_img_wait--;
    });
    img.prop('src',src);
  }

  function load_slide_img(){
    var data=slider_data[render_slide_nom];
    tot_img_wait=1;

    if(mobile_mode===false){
      tot_img_wait++;
      img_to_load(data.fon);
      //если есть паралакс слои заполняем
      if(data.paralax && data.paralax.length>0){
        tot_img_wait+=data.paralax.length;
        for(var i=0;i<data.paralax.length;i++) {
          img_to_load(data.paralax[i].img)
        }
      }
      if(data.fixed && data.fixed.length>0) {
        tot_img_wait += data.fixed.length;
        for (var i = 0; i < data.fixed.length; i++) {
          img_to_load(data.fixed[i].img)
        }
      }
    }

    img_to_load(data.mobile);
  }

  function start_init_slide(data){
    var n = performance.now();
    var img=$('<img/>');
    img.attr('time',n);

    function on_img_load(){
      var n = performance.now();
      img=$(this);
      n=n-parseInt(img.attr('time'));
      if(n>max_time_load_pic){
        mobile_mode=true;
      }else{
        var max_size=(screen.height>screen.width?screen.height:screen.width);
        if(max_size<mobile_size){
          mobile_mode=true;
        }else{
          mobile_mode=false;
        }
      }
      if(mobile_mode==true){
        $(container_id).addClass('mobile_mode')
      }
      render_slide_nom=0;
      load_slide_img();
    };

    img.on('load',on_img_load());
    if(slider_data.length>0) {
      slider_data[0].mobile = slider_data[0].mobile + '?r=' + Math.random();
      img.prop('src', slider_data[0].mobile);
    }else{
      on_img_load().bind(img);
    }
  }

  function init(data,editor_init){
    slider_data=data;
    editor=editor_init;
    //находим контейнер и очищаем его
    var container=$(container_id);
    container.html('');

    //созжаем базовые контейнеры для самих слайдов и для переключателей
    slides=$('<div/>',{
      'class':'slides'
    });
    var slide_control=$('<div/>',{
      'class':'slide_control'
    });
    slide_select_box=$('<ul/>',{
      'class':'slide_select_box'
    });

    //добавляем индикатор загрузки
    var l='<div class="sk-folding-cube">'+
       '<div class="sk-cube1 sk-cube"></div>'+
       '<div class="sk-cube2 sk-cube"></div>'+
       '<div class="sk-cube4 sk-cube"></div>'+
       '<div class="sk-cube3 sk-cube"></div>'+
       '</div>';
    container.html(l);


    start_init_slide(data[0]);

    //генерируем кнопки и слайды
    for (var i=0;i<data.length;i++){
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

  function render(){
    if(!parallax_group)return false;
    var parallax_k=(parallax_counter-10)/2;

    for(var i=0;i<parallax_group.length;i++){
      var el=parallax_group.eq(i);
      var j=el.attr('z');
      var tr='rotate3d(0.1,0.8,0,'+(parallax_k)+'deg) scale('+(1+j*0.5)+') translateZ(-'+(10+j*20)+'px)';
      el.css('transform',tr)
    }
    parallax_counter+=parallax_d*0.1;
    if(parallax_counter>=20)parallax_d=-parallax_d;
    if(parallax_counter<=0)parallax_d=-parallax_d;
  }

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpxdWVyeS5tZW51LWFpbS5qcyIsImNpcmNsZXMubWluLmpzIiwiZGF0ZXBpY2tlci5qcyIsImpxdWVyeS5ub3R5LnBhY2thZ2VkLm1pbi5qcyIsIm1haW4uanMiLCJqcXVlcnkubW9ja2pheC5qcyIsImpxdWVyeS5hdXRvY29tcGxldGUuanMiLCJzZWxlY3QyLmZ1bGwubWluLmpzIiwibWFpbl9hZG1pbi5qcyIsInNsaWRlci5qcyIsImFqYXhfc2F2ZS5qcyIsImFqYXhfcmVtb3ZlLmpzIiwiZm9yX2FsbC5qcyIsIm5vdGlmaWNhdGlvbi5qcyIsInN0b3Jlcy5qcyIsImpxdWVyeS5hamF4Rm9ybS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNub0RBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4bEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzE5QkE7QUFDQTtBQUNBO0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaDhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogbWVudS1haW0gaXMgYSBqUXVlcnkgcGx1Z2luIGZvciBkcm9wZG93biBtZW51cyB0aGF0IGNhbiBkaWZmZXJlbnRpYXRlXHJcbiAqIGJldHdlZW4gYSB1c2VyIHRyeWluZyBob3ZlciBvdmVyIGEgZHJvcGRvd24gaXRlbSB2cyB0cnlpbmcgdG8gbmF2aWdhdGUgaW50b1xyXG4gKiBhIHN1Ym1lbnUncyBjb250ZW50cy5cclxuICpcclxuICogbWVudS1haW0gYXNzdW1lcyB0aGF0IHlvdSBoYXZlIGFyZSB1c2luZyBhIG1lbnUgd2l0aCBzdWJtZW51cyB0aGF0IGV4cGFuZFxyXG4gKiB0byB0aGUgbWVudSdzIHJpZ2h0LiBJdCB3aWxsIGZpcmUgZXZlbnRzIHdoZW4gdGhlIHVzZXIncyBtb3VzZSBlbnRlcnMgYSBuZXdcclxuICogZHJvcGRvd24gaXRlbSAqYW5kKiB3aGVuIHRoYXQgaXRlbSBpcyBiZWluZyBpbnRlbnRpb25hbGx5IGhvdmVyZWQgb3Zlci5cclxuICpcclxuICogX19fX19fX19fX19fX19fX19fX19fX19fX19cclxuICogfCBNb25rZXlzICA+fCAgIEdvcmlsbGEgIHxcclxuICogfCBHb3JpbGxhcyA+fCAgIENvbnRlbnQgIHxcclxuICogfCBDaGltcHMgICA+fCAgIEhlcmUgICAgIHxcclxuICogfF9fX19fX19fX19ffF9fX19fX19fX19fX3xcclxuICpcclxuICogSW4gdGhlIGFib3ZlIGV4YW1wbGUsIFwiR29yaWxsYXNcIiBpcyBzZWxlY3RlZCBhbmQgaXRzIHN1Ym1lbnUgY29udGVudCBpc1xyXG4gKiBiZWluZyBzaG93biBvbiB0aGUgcmlnaHQuIEltYWdpbmUgdGhhdCB0aGUgdXNlcidzIGN1cnNvciBpcyBob3ZlcmluZyBvdmVyXHJcbiAqIFwiR29yaWxsYXMuXCIgV2hlbiB0aGV5IG1vdmUgdGhlaXIgbW91c2UgaW50byB0aGUgXCJHb3JpbGxhIENvbnRlbnRcIiBhcmVhLCB0aGV5XHJcbiAqIG1heSBicmllZmx5IGhvdmVyIG92ZXIgXCJDaGltcHMuXCIgVGhpcyBzaG91bGRuJ3QgY2xvc2UgdGhlIFwiR29yaWxsYSBDb250ZW50XCJcclxuICogYXJlYS5cclxuICpcclxuICogVGhpcyBwcm9ibGVtIGlzIG5vcm1hbGx5IHNvbHZlZCB1c2luZyB0aW1lb3V0cyBhbmQgZGVsYXlzLiBtZW51LWFpbSB0cmllcyB0b1xyXG4gKiBzb2x2ZSB0aGlzIGJ5IGRldGVjdGluZyB0aGUgZGlyZWN0aW9uIG9mIHRoZSB1c2VyJ3MgbW91c2UgbW92ZW1lbnQuIFRoaXMgY2FuXHJcbiAqIG1ha2UgZm9yIHF1aWNrZXIgdHJhbnNpdGlvbnMgd2hlbiBuYXZpZ2F0aW5nIHVwIGFuZCBkb3duIHRoZSBtZW51LiBUaGVcclxuICogZXhwZXJpZW5jZSBpcyBob3BlZnVsbHkgc2ltaWxhciB0byBhbWF6b24uY29tLydzIFwiU2hvcCBieSBEZXBhcnRtZW50XCJcclxuICogZHJvcGRvd24uXHJcbiAqXHJcbiAqIFVzZSBsaWtlIHNvOlxyXG4gKlxyXG4gKiAgICAgICQoXCIjbWVudVwiKS5tZW51QWltKHtcclxuICogICAgICAgICAgYWN0aXZhdGU6ICQubm9vcCwgIC8vIGZpcmVkIG9uIHJvdyBhY3RpdmF0aW9uXHJcbiAqICAgICAgICAgIGRlYWN0aXZhdGU6ICQubm9vcCAgLy8gZmlyZWQgb24gcm93IGRlYWN0aXZhdGlvblxyXG4gKiAgICAgIH0pO1xyXG4gKlxyXG4gKiAgLi4udG8gcmVjZWl2ZSBldmVudHMgd2hlbiBhIG1lbnUncyByb3cgaGFzIGJlZW4gcHVycG9zZWZ1bGx5IChkZSlhY3RpdmF0ZWQuXHJcbiAqXHJcbiAqIFRoZSBmb2xsb3dpbmcgb3B0aW9ucyBjYW4gYmUgcGFzc2VkIHRvIG1lbnVBaW0uIEFsbCBmdW5jdGlvbnMgZXhlY3V0ZSB3aXRoXHJcbiAqIHRoZSByZWxldmFudCByb3cncyBIVE1MIGVsZW1lbnQgYXMgdGhlIGV4ZWN1dGlvbiBjb250ZXh0ICgndGhpcycpOlxyXG4gKlxyXG4gKiAgICAgIC5tZW51QWltKHtcclxuICogICAgICAgICAgLy8gRnVuY3Rpb24gdG8gY2FsbCB3aGVuIGEgcm93IGlzIHB1cnBvc2VmdWxseSBhY3RpdmF0ZWQuIFVzZSB0aGlzXHJcbiAqICAgICAgICAgIC8vIHRvIHNob3cgYSBzdWJtZW51J3MgY29udGVudCBmb3IgdGhlIGFjdGl2YXRlZCByb3cuXHJcbiAqICAgICAgICAgIGFjdGl2YXRlOiBmdW5jdGlvbigpIHt9LFxyXG4gKlxyXG4gKiAgICAgICAgICAvLyBGdW5jdGlvbiB0byBjYWxsIHdoZW4gYSByb3cgaXMgZGVhY3RpdmF0ZWQuXHJcbiAqICAgICAgICAgIGRlYWN0aXZhdGU6IGZ1bmN0aW9uKCkge30sXHJcbiAqXHJcbiAqICAgICAgICAgIC8vIEZ1bmN0aW9uIHRvIGNhbGwgd2hlbiBtb3VzZSBlbnRlcnMgYSBtZW51IHJvdy4gRW50ZXJpbmcgYSByb3dcclxuICogICAgICAgICAgLy8gZG9lcyBub3QgbWVhbiB0aGUgcm93IGhhcyBiZWVuIGFjdGl2YXRlZCwgYXMgdGhlIHVzZXIgbWF5IGJlXHJcbiAqICAgICAgICAgIC8vIG1vdXNpbmcgb3ZlciB0byBhIHN1Ym1lbnUuXHJcbiAqICAgICAgICAgIGVudGVyOiBmdW5jdGlvbigpIHt9LFxyXG4gKlxyXG4gKiAgICAgICAgICAvLyBGdW5jdGlvbiB0byBjYWxsIHdoZW4gbW91c2UgZXhpdHMgYSBtZW51IHJvdy5cclxuICogICAgICAgICAgZXhpdDogZnVuY3Rpb24oKSB7fSxcclxuICpcclxuICogICAgICAgICAgLy8gU2VsZWN0b3IgZm9yIGlkZW50aWZ5aW5nIHdoaWNoIGVsZW1lbnRzIGluIHRoZSBtZW51IGFyZSByb3dzXHJcbiAqICAgICAgICAgIC8vIHRoYXQgY2FuIHRyaWdnZXIgdGhlIGFib3ZlIGV2ZW50cy4gRGVmYXVsdHMgdG8gXCI+IGxpXCIuXHJcbiAqICAgICAgICAgIHJvd1NlbGVjdG9yOiBcIj4gbGlcIixcclxuICpcclxuICogICAgICAgICAgLy8gWW91IG1heSBoYXZlIHNvbWUgbWVudSByb3dzIHRoYXQgYXJlbid0IHN1Ym1lbnVzIGFuZCB0aGVyZWZvcmVcclxuICogICAgICAgICAgLy8gc2hvdWxkbid0IGV2ZXIgbmVlZCB0byBcImFjdGl2YXRlLlwiIElmIHNvLCBmaWx0ZXIgc3VibWVudSByb3dzIHcvXHJcbiAqICAgICAgICAgIC8vIHRoaXMgc2VsZWN0b3IuIERlZmF1bHRzIHRvIFwiKlwiIChhbGwgZWxlbWVudHMpLlxyXG4gKiAgICAgICAgICBzdWJtZW51U2VsZWN0b3I6IFwiKlwiLFxyXG4gKlxyXG4gKiAgICAgICAgICAvLyBEaXJlY3Rpb24gdGhlIHN1Ym1lbnUgb3BlbnMgcmVsYXRpdmUgdG8gdGhlIG1haW4gbWVudS4gQ2FuIGJlXHJcbiAqICAgICAgICAgIC8vIGxlZnQsIHJpZ2h0LCBhYm92ZSwgb3IgYmVsb3cuIERlZmF1bHRzIHRvIFwicmlnaHRcIi5cclxuICogICAgICAgICAgc3VibWVudURpcmVjdGlvbjogXCJyaWdodFwiXHJcbiAqICAgICAgfSk7XHJcbiAqXHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9rYW1lbnMvalF1ZXJ5LW1lbnUtYWltXHJcbiovXHJcbihmdW5jdGlvbigkKSB7XHJcblxyXG4gICAgJC5mbi5tZW51QWltID0gZnVuY3Rpb24ob3B0cykge1xyXG4gICAgICAgIC8vIEluaXRpYWxpemUgbWVudS1haW0gZm9yIGFsbCBlbGVtZW50cyBpbiBqUXVlcnkgY29sbGVjdGlvblxyXG4gICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaW5pdC5jYWxsKHRoaXMsIG9wdHMpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdChvcHRzKSB7XHJcbiAgICAgICAgdmFyICRtZW51ID0gJCh0aGlzKSxcclxuICAgICAgICAgICAgYWN0aXZlUm93ID0gbnVsbCxcclxuICAgICAgICAgICAgbW91c2VMb2NzID0gW10sXHJcbiAgICAgICAgICAgIGxhc3REZWxheUxvYyA9IG51bGwsXHJcbiAgICAgICAgICAgIHRpbWVvdXRJZCA9IG51bGwsXHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSAkLmV4dGVuZCh7XHJcbiAgICAgICAgICAgICAgICByb3dTZWxlY3RvcjogXCI+IGxpXCIsXHJcbiAgICAgICAgICAgICAgICBzdWJtZW51U2VsZWN0b3I6IFwiKlwiLFxyXG4gICAgICAgICAgICAgICAgc3VibWVudURpcmVjdGlvbjogXCJyaWdodFwiLFxyXG4gICAgICAgICAgICAgICAgdG9sZXJhbmNlOiA3NSwgIC8vIGJpZ2dlciA9IG1vcmUgZm9yZ2l2ZXkgd2hlbiBlbnRlcmluZyBzdWJtZW51XHJcbiAgICAgICAgICAgICAgICBlbnRlcjogJC5ub29wLFxyXG4gICAgICAgICAgICAgICAgZXhpdDogJC5ub29wLFxyXG4gICAgICAgICAgICAgICAgYWN0aXZhdGU6ICQubm9vcCxcclxuICAgICAgICAgICAgICAgIGRlYWN0aXZhdGU6ICQubm9vcCxcclxuICAgICAgICAgICAgICAgIGV4aXRNZW51OiAkLm5vb3BcclxuICAgICAgICAgICAgfSwgb3B0cyk7XHJcblxyXG4gICAgICAgIHZhciBNT1VTRV9MT0NTX1RSQUNLRUQgPSAzLCAgLy8gbnVtYmVyIG9mIHBhc3QgbW91c2UgbG9jYXRpb25zIHRvIHRyYWNrXHJcbiAgICAgICAgICAgIERFTEFZID0gMzAwOyAgLy8gbXMgZGVsYXkgd2hlbiB1c2VyIGFwcGVhcnMgdG8gYmUgZW50ZXJpbmcgc3VibWVudVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBLZWVwIHRyYWNrIG9mIHRoZSBsYXN0IGZldyBsb2NhdGlvbnMgb2YgdGhlIG1vdXNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHZhciBtb3VzZW1vdmVEb2N1bWVudCA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIG1vdXNlTG9jcy5wdXNoKHt4OiBlLnBhZ2VYLCB5OiBlLnBhZ2VZfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG1vdXNlTG9jcy5sZW5ndGggPiBNT1VTRV9MT0NTX1RSQUNLRUQpIHtcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZUxvY3Muc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2FuY2VsIHBvc3NpYmxlIHJvdyBhY3RpdmF0aW9ucyB3aGVuIGxlYXZpbmcgdGhlIG1lbnUgZW50aXJlbHlcclxuICAgICAgICAgKi9cclxuICAgICAgICB2YXIgbW91c2VsZWF2ZU1lbnUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aW1lb3V0SWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBJZiBleGl0TWVudSBpcyBzdXBwbGllZCBhbmQgcmV0dXJucyB0cnVlLCBkZWFjdGl2YXRlIHRoZVxyXG4gICAgICAgICAgICAgICAgLy8gY3VycmVudGx5IGFjdGl2ZSByb3cgb24gbWVudSBleGl0LlxyXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZXhpdE1lbnUodGhpcykpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYWN0aXZlUm93KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuZGVhY3RpdmF0ZShhY3RpdmVSb3cpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlUm93ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVHJpZ2dlciBhIHBvc3NpYmxlIHJvdyBhY3RpdmF0aW9uIHdoZW5ldmVyIGVudGVyaW5nIGEgbmV3IHJvdy5cclxuICAgICAgICAgKi9cclxuICAgICAgICB2YXIgbW91c2VlbnRlclJvdyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRpbWVvdXRJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIENhbmNlbCBhbnkgcHJldmlvdXMgYWN0aXZhdGlvbiBkZWxheXNcclxuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLmVudGVyKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgcG9zc2libHlBY3RpdmF0ZSh0aGlzKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbW91c2VsZWF2ZVJvdyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5leGl0KHRoaXMpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIEltbWVkaWF0ZWx5IGFjdGl2YXRlIGEgcm93IGlmIHRoZSB1c2VyIGNsaWNrcyBvbiBpdC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB2YXIgY2xpY2tSb3cgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGFjdGl2YXRlKHRoaXMpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBY3RpdmF0ZSBhIG1lbnUgcm93LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHZhciBhY3RpdmF0ZSA9IGZ1bmN0aW9uKHJvdykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJvdyA9PSBhY3RpdmVSb3cpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGFjdGl2ZVJvdykge1xyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuZGVhY3RpdmF0ZShhY3RpdmVSb3cpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIG9wdGlvbnMuYWN0aXZhdGUocm93KTtcclxuICAgICAgICAgICAgICAgIGFjdGl2ZVJvdyA9IHJvdztcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUG9zc2libHkgYWN0aXZhdGUgYSBtZW51IHJvdy4gSWYgbW91c2UgbW92ZW1lbnQgaW5kaWNhdGVzIHRoYXQgd2VcclxuICAgICAgICAgKiBzaG91bGRuJ3QgYWN0aXZhdGUgeWV0IGJlY2F1c2UgdXNlciBtYXkgYmUgdHJ5aW5nIHRvIGVudGVyXHJcbiAgICAgICAgICogYSBzdWJtZW51J3MgY29udGVudCwgdGhlbiBkZWxheSBhbmQgY2hlY2sgYWdhaW4gbGF0ZXIuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdmFyIHBvc3NpYmx5QWN0aXZhdGUgPSBmdW5jdGlvbihyb3cpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkZWxheSA9IGFjdGl2YXRpb25EZWxheSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChkZWxheSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3NpYmx5QWN0aXZhdGUocm93KTtcclxuICAgICAgICAgICAgICAgICAgICB9LCBkZWxheSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2YXRlKHJvdyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybiB0aGUgYW1vdW50IG9mIHRpbWUgdGhhdCBzaG91bGQgYmUgdXNlZCBhcyBhIGRlbGF5IGJlZm9yZSB0aGVcclxuICAgICAgICAgKiBjdXJyZW50bHkgaG92ZXJlZCByb3cgaXMgYWN0aXZhdGVkLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogUmV0dXJucyAwIGlmIHRoZSBhY3RpdmF0aW9uIHNob3VsZCBoYXBwZW4gaW1tZWRpYXRlbHkuIE90aGVyd2lzZSxcclxuICAgICAgICAgKiByZXR1cm5zIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRoYXQgc2hvdWxkIGJlIGRlbGF5ZWQgYmVmb3JlXHJcbiAgICAgICAgICogY2hlY2tpbmcgYWdhaW4gdG8gc2VlIGlmIHRoZSByb3cgc2hvdWxkIGJlIGFjdGl2YXRlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB2YXIgYWN0aXZhdGlvbkRlbGF5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWFjdGl2ZVJvdyB8fCAhJChhY3RpdmVSb3cpLmlzKG9wdGlvbnMuc3VibWVudVNlbGVjdG9yKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlIGlzIG5vIG90aGVyIHN1Ym1lbnUgcm93IGFscmVhZHkgYWN0aXZlLCB0aGVuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZ28gYWhlYWQgYW5kIGFjdGl2YXRlIGltbWVkaWF0ZWx5LlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSAkbWVudS5vZmZzZXQoKSxcclxuICAgICAgICAgICAgICAgICAgICB1cHBlckxlZnQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IG9mZnNldC5sZWZ0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiBvZmZzZXQudG9wIC0gb3B0aW9ucy50b2xlcmFuY2VcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHVwcGVyUmlnaHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IG9mZnNldC5sZWZ0ICsgJG1lbnUub3V0ZXJXaWR0aCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiB1cHBlckxlZnQueVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgbG93ZXJMZWZ0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBvZmZzZXQubGVmdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgeTogb2Zmc2V0LnRvcCArICRtZW51Lm91dGVySGVpZ2h0KCkgKyBvcHRpb25zLnRvbGVyYW5jZVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgbG93ZXJSaWdodCA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeDogb2Zmc2V0LmxlZnQgKyAkbWVudS5vdXRlcldpZHRoKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IGxvd2VyTGVmdC55XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBsb2MgPSBtb3VzZUxvY3NbbW91c2VMb2NzLmxlbmd0aCAtIDFdLFxyXG4gICAgICAgICAgICAgICAgICAgIHByZXZMb2MgPSBtb3VzZUxvY3NbMF07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFsb2MpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIXByZXZMb2MpIHtcclxuICAgICAgICAgICAgICAgICAgICBwcmV2TG9jID0gbG9jO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwcmV2TG9jLnggPCBvZmZzZXQubGVmdCB8fCBwcmV2TG9jLnggPiBsb3dlclJpZ2h0LnggfHxcclxuICAgICAgICAgICAgICAgICAgICBwcmV2TG9jLnkgPCBvZmZzZXQudG9wIHx8IHByZXZMb2MueSA+IGxvd2VyUmlnaHQueSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSBwcmV2aW91cyBtb3VzZSBsb2NhdGlvbiB3YXMgb3V0c2lkZSBvZiB0aGUgZW50aXJlXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbWVudSdzIGJvdW5kcywgaW1tZWRpYXRlbHkgYWN0aXZhdGUuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGxhc3REZWxheUxvYyAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2MueCA9PSBsYXN0RGVsYXlMb2MueCAmJiBsb2MueSA9PSBsYXN0RGVsYXlMb2MueSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSBtb3VzZSBoYXNuJ3QgbW92ZWQgc2luY2UgdGhlIGxhc3QgdGltZSB3ZSBjaGVja2VkXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZm9yIGFjdGl2YXRpb24gc3RhdHVzLCBpbW1lZGlhdGVseSBhY3RpdmF0ZS5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBEZXRlY3QgaWYgdGhlIHVzZXIgaXMgbW92aW5nIHRvd2FyZHMgdGhlIGN1cnJlbnRseSBhY3RpdmF0ZWRcclxuICAgICAgICAgICAgICAgIC8vIHN1Ym1lbnUuXHJcbiAgICAgICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIG1vdXNlIGlzIGhlYWRpbmcgcmVsYXRpdmVseSBjbGVhcmx5IHRvd2FyZHNcclxuICAgICAgICAgICAgICAgIC8vIHRoZSBzdWJtZW51J3MgY29udGVudCwgd2Ugc2hvdWxkIHdhaXQgYW5kIGdpdmUgdGhlIHVzZXIgbW9yZVxyXG4gICAgICAgICAgICAgICAgLy8gdGltZSBiZWZvcmUgYWN0aXZhdGluZyBhIG5ldyByb3cuIElmIHRoZSBtb3VzZSBpcyBoZWFkaW5nXHJcbiAgICAgICAgICAgICAgICAvLyBlbHNld2hlcmUsIHdlIGNhbiBpbW1lZGlhdGVseSBhY3RpdmF0ZSBhIG5ldyByb3cuXHJcbiAgICAgICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAgICAgLy8gV2UgZGV0ZWN0IHRoaXMgYnkgY2FsY3VsYXRpbmcgdGhlIHNsb3BlIGZvcm1lZCBiZXR3ZWVuIHRoZVxyXG4gICAgICAgICAgICAgICAgLy8gY3VycmVudCBtb3VzZSBsb2NhdGlvbiBhbmQgdGhlIHVwcGVyL2xvd2VyIHJpZ2h0IHBvaW50cyBvZlxyXG4gICAgICAgICAgICAgICAgLy8gdGhlIG1lbnUuIFdlIGRvIHRoZSBzYW1lIGZvciB0aGUgcHJldmlvdXMgbW91c2UgbG9jYXRpb24uXHJcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgY3VycmVudCBtb3VzZSBsb2NhdGlvbidzIHNsb3BlcyBhcmVcclxuICAgICAgICAgICAgICAgIC8vIGluY3JlYXNpbmcvZGVjcmVhc2luZyBhcHByb3ByaWF0ZWx5IGNvbXBhcmVkIHRvIHRoZVxyXG4gICAgICAgICAgICAgICAgLy8gcHJldmlvdXMncywgd2Uga25vdyB0aGUgdXNlciBpcyBtb3ZpbmcgdG93YXJkIHRoZSBzdWJtZW51LlxyXG4gICAgICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgICAgIC8vIE5vdGUgdGhhdCBzaW5jZSB0aGUgeS1heGlzIGluY3JlYXNlcyBhcyB0aGUgY3Vyc29yIG1vdmVzXHJcbiAgICAgICAgICAgICAgICAvLyBkb3duIHRoZSBzY3JlZW4sIHdlIGFyZSBsb29raW5nIGZvciB0aGUgc2xvcGUgYmV0d2VlbiB0aGVcclxuICAgICAgICAgICAgICAgIC8vIGN1cnNvciBhbmQgdGhlIHVwcGVyIHJpZ2h0IGNvcm5lciB0byBkZWNyZWFzZSBvdmVyIHRpbWUsIG5vdFxyXG4gICAgICAgICAgICAgICAgLy8gaW5jcmVhc2UgKHNvbWV3aGF0IGNvdW50ZXJpbnR1aXRpdmVseSkuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzbG9wZShhLCBiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChiLnkgLSBhLnkpIC8gKGIueCAtIGEueCk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBkZWNyZWFzaW5nQ29ybmVyID0gdXBwZXJSaWdodCxcclxuICAgICAgICAgICAgICAgICAgICBpbmNyZWFzaW5nQ29ybmVyID0gbG93ZXJSaWdodDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBPdXIgZXhwZWN0YXRpb25zIGZvciBkZWNyZWFzaW5nIG9yIGluY3JlYXNpbmcgc2xvcGUgdmFsdWVzXHJcbiAgICAgICAgICAgICAgICAvLyBkZXBlbmRzIG9uIHdoaWNoIGRpcmVjdGlvbiB0aGUgc3VibWVudSBvcGVucyByZWxhdGl2ZSB0byB0aGVcclxuICAgICAgICAgICAgICAgIC8vIG1haW4gbWVudS4gQnkgZGVmYXVsdCwgaWYgdGhlIG1lbnUgb3BlbnMgb24gdGhlIHJpZ2h0LCB3ZVxyXG4gICAgICAgICAgICAgICAgLy8gZXhwZWN0IHRoZSBzbG9wZSBiZXR3ZWVuIHRoZSBjdXJzb3IgYW5kIHRoZSB1cHBlciByaWdodFxyXG4gICAgICAgICAgICAgICAgLy8gY29ybmVyIHRvIGRlY3JlYXNlIG92ZXIgdGltZSwgYXMgZXhwbGFpbmVkIGFib3ZlLiBJZiB0aGVcclxuICAgICAgICAgICAgICAgIC8vIHN1Ym1lbnUgb3BlbnMgaW4gYSBkaWZmZXJlbnQgZGlyZWN0aW9uLCB3ZSBjaGFuZ2Ugb3VyIHNsb3BlXHJcbiAgICAgICAgICAgICAgICAvLyBleHBlY3RhdGlvbnMuXHJcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5zdWJtZW51RGlyZWN0aW9uID09IFwibGVmdFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjcmVhc2luZ0Nvcm5lciA9IGxvd2VyTGVmdDtcclxuICAgICAgICAgICAgICAgICAgICBpbmNyZWFzaW5nQ29ybmVyID0gdXBwZXJMZWZ0O1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLnN1Ym1lbnVEaXJlY3Rpb24gPT0gXCJiZWxvd1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjcmVhc2luZ0Nvcm5lciA9IGxvd2VyUmlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5jcmVhc2luZ0Nvcm5lciA9IGxvd2VyTGVmdDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5zdWJtZW51RGlyZWN0aW9uID09IFwiYWJvdmVcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlY3JlYXNpbmdDb3JuZXIgPSB1cHBlckxlZnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5jcmVhc2luZ0Nvcm5lciA9IHVwcGVyUmlnaHQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGRlY3JlYXNpbmdTbG9wZSA9IHNsb3BlKGxvYywgZGVjcmVhc2luZ0Nvcm5lciksXHJcbiAgICAgICAgICAgICAgICAgICAgaW5jcmVhc2luZ1Nsb3BlID0gc2xvcGUobG9jLCBpbmNyZWFzaW5nQ29ybmVyKSxcclxuICAgICAgICAgICAgICAgICAgICBwcmV2RGVjcmVhc2luZ1Nsb3BlID0gc2xvcGUocHJldkxvYywgZGVjcmVhc2luZ0Nvcm5lciksXHJcbiAgICAgICAgICAgICAgICAgICAgcHJldkluY3JlYXNpbmdTbG9wZSA9IHNsb3BlKHByZXZMb2MsIGluY3JlYXNpbmdDb3JuZXIpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChkZWNyZWFzaW5nU2xvcGUgPCBwcmV2RGVjcmVhc2luZ1Nsb3BlICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY3JlYXNpbmdTbG9wZSA+IHByZXZJbmNyZWFzaW5nU2xvcGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBNb3VzZSBpcyBtb3ZpbmcgZnJvbSBwcmV2aW91cyBsb2NhdGlvbiB0b3dhcmRzIHRoZVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGN1cnJlbnRseSBhY3RpdmF0ZWQgc3VibWVudS4gRGVsYXkgYmVmb3JlIGFjdGl2YXRpbmcgYVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIG5ldyBtZW51IHJvdywgYmVjYXVzZSB1c2VyIG1heSBiZSBtb3ZpbmcgaW50byBzdWJtZW51LlxyXG4gICAgICAgICAgICAgICAgICAgIGxhc3REZWxheUxvYyA9IGxvYztcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gREVMQVk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbGFzdERlbGF5TG9jID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBIb29rIHVwIGluaXRpYWwgbWVudSBldmVudHNcclxuICAgICAgICAgKi9cclxuICAgICAgICAkbWVudVxyXG4gICAgICAgICAgICAubW91c2VsZWF2ZShtb3VzZWxlYXZlTWVudSlcclxuICAgICAgICAgICAgLmZpbmQob3B0aW9ucy5yb3dTZWxlY3RvcilcclxuICAgICAgICAgICAgICAgIC5tb3VzZWVudGVyKG1vdXNlZW50ZXJSb3cpXHJcbiAgICAgICAgICAgICAgICAubW91c2VsZWF2ZShtb3VzZWxlYXZlUm93KVxyXG4gICAgICAgICAgICAgICAgLmNsaWNrKGNsaWNrUm93KTtcclxuXHJcbiAgICAgICAgJChkb2N1bWVudCkubW91c2Vtb3ZlKG1vdXNlbW92ZURvY3VtZW50KTtcclxuXHJcbiAgICB9O1xyXG59KShqUXVlcnkpO1xyXG5cclxuIiwiLyoqXHJcbiAqIGNpcmNsZXMgLSB2MC4wLjYgLSAyMDE1LTExLTI3XHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAxNSBsdWdvbGFic1xyXG4gKiBMaWNlbnNlZCBcclxuICovXHJcbiFmdW5jdGlvbihhLGIpe1wib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP21vZHVsZS5leHBvcnRzPWIoKTpcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtdLGIpOmEuQ2lyY2xlcz1iKCl9KHRoaXMsZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjt2YXIgYT13aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lfHx3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lfHx3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lfHx3aW5kb3cub1JlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lfHxmdW5jdGlvbihhKXtzZXRUaW1lb3V0KGEsMWUzLzYwKX0sYj1mdW5jdGlvbihhKXt2YXIgYj1hLmlkO2lmKHRoaXMuX2VsPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGIpLG51bGwhPT10aGlzLl9lbCl7dGhpcy5fcmFkaXVzPWEucmFkaXVzfHwxMCx0aGlzLl9kdXJhdGlvbj12b2lkIDA9PT1hLmR1cmF0aW9uPzUwMDphLmR1cmF0aW9uLHRoaXMuX3ZhbHVlPTAsdGhpcy5fbWF4VmFsdWU9YS5tYXhWYWx1ZXx8MTAwLHRoaXMuX3RleHQ9dm9pZCAwPT09YS50ZXh0P2Z1bmN0aW9uKGEpe3JldHVybiB0aGlzLmh0bWxpZnlOdW1iZXIoYSl9OmEudGV4dCx0aGlzLl9zdHJva2VXaWR0aD1hLndpZHRofHwxMCx0aGlzLl9jb2xvcnM9YS5jb2xvcnN8fFtcIiNFRUVcIixcIiNGMDBcIl0sdGhpcy5fc3ZnPW51bGwsdGhpcy5fbW92aW5nUGF0aD1udWxsLHRoaXMuX3dyYXBDb250YWluZXI9bnVsbCx0aGlzLl90ZXh0Q29udGFpbmVyPW51bGwsdGhpcy5fd3JwQ2xhc3M9YS53cnBDbGFzc3x8XCJjaXJjbGVzLXdycFwiLHRoaXMuX3RleHRDbGFzcz1hLnRleHRDbGFzc3x8XCJjaXJjbGVzLXRleHRcIix0aGlzLl92YWxDbGFzcz1hLnZhbHVlU3Ryb2tlQ2xhc3N8fFwiY2lyY2xlcy12YWx1ZVN0cm9rZVwiLHRoaXMuX21heFZhbENsYXNzPWEubWF4VmFsdWVTdHJva2VDbGFzc3x8XCJjaXJjbGVzLW1heFZhbHVlU3Ryb2tlXCIsdGhpcy5fc3R5bGVXcmFwcGVyPWEuc3R5bGVXcmFwcGVyPT09ITE/ITE6ITAsdGhpcy5fc3R5bGVUZXh0PWEuc3R5bGVUZXh0PT09ITE/ITE6ITA7dmFyIGM9TWF0aC5QSS8xODAqMjcwO3RoaXMuX3N0YXJ0PS1NYXRoLlBJLzE4MCo5MCx0aGlzLl9zdGFydFByZWNpc2U9dGhpcy5fcHJlY2lzZSh0aGlzLl9zdGFydCksdGhpcy5fY2lyYz1jLXRoaXMuX3N0YXJ0LHRoaXMuX2dlbmVyYXRlKCkudXBkYXRlKGEudmFsdWV8fDApfX07cmV0dXJuIGIucHJvdG90eXBlPXtWRVJTSU9OOlwiMC4wLjZcIixfZ2VuZXJhdGU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fc3ZnU2l6ZT0yKnRoaXMuX3JhZGl1cyx0aGlzLl9yYWRpdXNBZGp1c3RlZD10aGlzLl9yYWRpdXMtdGhpcy5fc3Ryb2tlV2lkdGgvMix0aGlzLl9nZW5lcmF0ZVN2ZygpLl9nZW5lcmF0ZVRleHQoKS5fZ2VuZXJhdGVXcmFwcGVyKCksdGhpcy5fZWwuaW5uZXJIVE1MPVwiXCIsdGhpcy5fZWwuYXBwZW5kQ2hpbGQodGhpcy5fd3JhcENvbnRhaW5lciksdGhpc30sX3NldFBlcmNlbnRhZ2U6ZnVuY3Rpb24oYSl7dGhpcy5fbW92aW5nUGF0aC5zZXRBdHRyaWJ1dGUoXCJkXCIsdGhpcy5fY2FsY3VsYXRlUGF0aChhLCEwKSksdGhpcy5fdGV4dENvbnRhaW5lci5pbm5lckhUTUw9dGhpcy5fZ2V0VGV4dCh0aGlzLmdldFZhbHVlRnJvbVBlcmNlbnQoYSkpfSxfZ2VuZXJhdGVXcmFwcGVyOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3dyYXBDb250YWluZXI9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSx0aGlzLl93cmFwQ29udGFpbmVyLmNsYXNzTmFtZT10aGlzLl93cnBDbGFzcyx0aGlzLl9zdHlsZVdyYXBwZXImJih0aGlzLl93cmFwQ29udGFpbmVyLnN0eWxlLnBvc2l0aW9uPVwicmVsYXRpdmVcIix0aGlzLl93cmFwQ29udGFpbmVyLnN0eWxlLmRpc3BsYXk9XCJpbmxpbmUtYmxvY2tcIiksdGhpcy5fd3JhcENvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9zdmcpLHRoaXMuX3dyYXBDb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fdGV4dENvbnRhaW5lciksdGhpc30sX2dlbmVyYXRlVGV4dDpmdW5jdGlvbigpe2lmKHRoaXMuX3RleHRDb250YWluZXI9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSx0aGlzLl90ZXh0Q29udGFpbmVyLmNsYXNzTmFtZT10aGlzLl90ZXh0Q2xhc3MsdGhpcy5fc3R5bGVUZXh0KXt2YXIgYT17cG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDowLGxlZnQ6MCx0ZXh0QWxpZ246XCJjZW50ZXJcIix3aWR0aDpcIjEwMCVcIixmb250U2l6ZTouNyp0aGlzLl9yYWRpdXMrXCJweFwiLGhlaWdodDp0aGlzLl9zdmdTaXplK1wicHhcIixsaW5lSGVpZ2h0OnRoaXMuX3N2Z1NpemUrXCJweFwifTtmb3IodmFyIGIgaW4gYSl0aGlzLl90ZXh0Q29udGFpbmVyLnN0eWxlW2JdPWFbYl19cmV0dXJuIHRoaXMuX3RleHRDb250YWluZXIuaW5uZXJIVE1MPXRoaXMuX2dldFRleHQoMCksdGhpc30sX2dldFRleHQ6ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuX3RleHQ/KHZvaWQgMD09PWEmJihhPXRoaXMuX3ZhbHVlKSxhPXBhcnNlRmxvYXQoYS50b0ZpeGVkKDIpKSxcImZ1bmN0aW9uXCI9PXR5cGVvZiB0aGlzLl90ZXh0P3RoaXMuX3RleHQuY2FsbCh0aGlzLGEpOnRoaXMuX3RleHQpOlwiXCJ9LF9nZW5lcmF0ZVN2ZzpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9zdmc9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIixcInN2Z1wiKSx0aGlzLl9zdmcuc2V0QXR0cmlidXRlKFwieG1sbnNcIixcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIpLHRoaXMuX3N2Zy5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLHRoaXMuX3N2Z1NpemUpLHRoaXMuX3N2Zy5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIix0aGlzLl9zdmdTaXplKSx0aGlzLl9nZW5lcmF0ZVBhdGgoMTAwLCExLHRoaXMuX2NvbG9yc1swXSx0aGlzLl9tYXhWYWxDbGFzcykuX2dlbmVyYXRlUGF0aCgxLCEwLHRoaXMuX2NvbG9yc1sxXSx0aGlzLl92YWxDbGFzcyksdGhpcy5fbW92aW5nUGF0aD10aGlzLl9zdmcuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJwYXRoXCIpWzFdLHRoaXN9LF9nZW5lcmF0ZVBhdGg6ZnVuY3Rpb24oYSxiLGMsZCl7dmFyIGU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIixcInBhdGhcIik7cmV0dXJuIGUuc2V0QXR0cmlidXRlKFwiZmlsbFwiLFwidHJhbnNwYXJlbnRcIiksZS5zZXRBdHRyaWJ1dGUoXCJzdHJva2VcIixjKSxlLnNldEF0dHJpYnV0ZShcInN0cm9rZS13aWR0aFwiLHRoaXMuX3N0cm9rZVdpZHRoKSxlLnNldEF0dHJpYnV0ZShcImRcIix0aGlzLl9jYWxjdWxhdGVQYXRoKGEsYikpLGUuc2V0QXR0cmlidXRlKFwiY2xhc3NcIixkKSx0aGlzLl9zdmcuYXBwZW5kQ2hpbGQoZSksdGhpc30sX2NhbGN1bGF0ZVBhdGg6ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzLl9zdGFydCthLzEwMCp0aGlzLl9jaXJjLGQ9dGhpcy5fcHJlY2lzZShjKTtyZXR1cm4gdGhpcy5fYXJjKGQsYil9LF9hcmM6ZnVuY3Rpb24oYSxiKXt2YXIgYz1hLS4wMDEsZD1hLXRoaXMuX3N0YXJ0UHJlY2lzZTxNYXRoLlBJPzA6MTtyZXR1cm5bXCJNXCIsdGhpcy5fcmFkaXVzK3RoaXMuX3JhZGl1c0FkanVzdGVkKk1hdGguY29zKHRoaXMuX3N0YXJ0UHJlY2lzZSksdGhpcy5fcmFkaXVzK3RoaXMuX3JhZGl1c0FkanVzdGVkKk1hdGguc2luKHRoaXMuX3N0YXJ0UHJlY2lzZSksXCJBXCIsdGhpcy5fcmFkaXVzQWRqdXN0ZWQsdGhpcy5fcmFkaXVzQWRqdXN0ZWQsMCxkLDEsdGhpcy5fcmFkaXVzK3RoaXMuX3JhZGl1c0FkanVzdGVkKk1hdGguY29zKGMpLHRoaXMuX3JhZGl1cyt0aGlzLl9yYWRpdXNBZGp1c3RlZCpNYXRoLnNpbihjKSxiP1wiXCI6XCJaXCJdLmpvaW4oXCIgXCIpfSxfcHJlY2lzZTpmdW5jdGlvbihhKXtyZXR1cm4gTWF0aC5yb3VuZCgxZTMqYSkvMWUzfSxodG1saWZ5TnVtYmVyOmZ1bmN0aW9uKGEsYixjKXtiPWJ8fFwiY2lyY2xlcy1pbnRlZ2VyXCIsYz1jfHxcImNpcmNsZXMtZGVjaW1hbHNcIjt2YXIgZD0oYStcIlwiKS5zcGxpdChcIi5cIiksZT0nPHNwYW4gY2xhc3M9XCInK2IrJ1wiPicrZFswXStcIjwvc3Bhbj5cIjtyZXR1cm4gZC5sZW5ndGg+MSYmKGUrPScuPHNwYW4gY2xhc3M9XCInK2MrJ1wiPicrZFsxXS5zdWJzdHJpbmcoMCwyKStcIjwvc3Bhbj5cIiksZX0sdXBkYXRlUmFkaXVzOmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLl9yYWRpdXM9YSx0aGlzLl9nZW5lcmF0ZSgpLnVwZGF0ZSghMCl9LHVwZGF0ZVdpZHRoOmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLl9zdHJva2VXaWR0aD1hLHRoaXMuX2dlbmVyYXRlKCkudXBkYXRlKCEwKX0sdXBkYXRlQ29sb3JzOmZ1bmN0aW9uKGEpe3RoaXMuX2NvbG9ycz1hO3ZhciBiPXRoaXMuX3N2Zy5nZXRFbGVtZW50c0J5VGFnTmFtZShcInBhdGhcIik7cmV0dXJuIGJbMF0uc2V0QXR0cmlidXRlKFwic3Ryb2tlXCIsYVswXSksYlsxXS5zZXRBdHRyaWJ1dGUoXCJzdHJva2VcIixhWzFdKSx0aGlzfSxnZXRQZXJjZW50OmZ1bmN0aW9uKCl7cmV0dXJuIDEwMCp0aGlzLl92YWx1ZS90aGlzLl9tYXhWYWx1ZX0sZ2V0VmFsdWVGcm9tUGVyY2VudDpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5fbWF4VmFsdWUqYS8xMDB9LGdldFZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3ZhbHVlfSxnZXRNYXhWYWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9tYXhWYWx1ZX0sdXBkYXRlOmZ1bmN0aW9uKGIsYyl7aWYoYj09PSEwKXJldHVybiB0aGlzLl9zZXRQZXJjZW50YWdlKHRoaXMuZ2V0UGVyY2VudCgpKSx0aGlzO2lmKHRoaXMuX3ZhbHVlPT1ifHxpc05hTihiKSlyZXR1cm4gdGhpczt2b2lkIDA9PT1jJiYoYz10aGlzLl9kdXJhdGlvbik7dmFyIGQsZSxmLGcsaD10aGlzLGk9aC5nZXRQZXJjZW50KCksaj0xO3JldHVybiB0aGlzLl92YWx1ZT1NYXRoLm1pbih0aGlzLl9tYXhWYWx1ZSxNYXRoLm1heCgwLGIpKSxjPyhkPWguZ2V0UGVyY2VudCgpLGU9ZD5pLGorPWQlMSxmPU1hdGguZmxvb3IoTWF0aC5hYnMoZC1pKS9qKSxnPWMvZixmdW5jdGlvbiBrKGIpe2lmKGU/aSs9ajppLT1qLGUmJmk+PWR8fCFlJiZkPj1pKXJldHVybiB2b2lkIGEoZnVuY3Rpb24oKXtoLl9zZXRQZXJjZW50YWdlKGQpfSk7YShmdW5jdGlvbigpe2guX3NldFBlcmNlbnRhZ2UoaSl9KTt2YXIgYz1EYXRlLm5vdygpLGY9Yy1iO2Y+PWc/ayhjKTpzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ayhEYXRlLm5vdygpKX0sZy1mKX0oRGF0ZS5ub3coKSksdGhpcyk6KHRoaXMuX3NldFBlcmNlbnRhZ2UodGhpcy5nZXRQZXJjZW50KCkpLHRoaXMpfX0sYi5jcmVhdGU9ZnVuY3Rpb24oYSl7cmV0dXJuIG5ldyBiKGEpfSxifSk7IiwidmFyIERhdGVwaWNrZXI7XHJcblxyXG4oZnVuY3Rpb24gKHdpbmRvdywgJCwgdW5kZWZpbmVkKSB7XHJcbiAgICB2YXIgcGx1Z2luTmFtZSA9ICdkYXRlcGlja2VyJyxcclxuICAgICAgICBhdXRvSW5pdFNlbGVjdG9yID0gJy5kYXRlcGlja2VyLWhlcmUnLFxyXG4gICAgICAgICRib2R5LCAkZGF0ZXBpY2tlcnNDb250YWluZXIsXHJcbiAgICAgICAgY29udGFpbmVyQnVpbHQgPSBmYWxzZSxcclxuICAgICAgICBiYXNlVGVtcGxhdGUgPSAnJyArXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlclwiPicgK1xyXG4gICAgICAgICAgICAnPG5hdiBjbGFzcz1cImRhdGVwaWNrZXItLW5hdlwiPjwvbmF2PicgK1xyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLWNvbnRlbnRcIj48L2Rpdj4nICtcclxuICAgICAgICAgICAgJzwvZGl2PicsXHJcbiAgICAgICAgZGVmYXVsdHMgPSB7XHJcbiAgICAgICAgICAgIGNsYXNzZXM6ICcnLFxyXG4gICAgICAgICAgICBpbmxpbmU6IGZhbHNlLFxyXG4gICAgICAgICAgICBsYW5ndWFnZTogJ3J1JyxcclxuICAgICAgICAgICAgc3RhcnREYXRlOiBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgICBmaXJzdERheTogJycsXHJcbiAgICAgICAgICAgIHdlZWtlbmRzOiBbNiwgMF0sXHJcbiAgICAgICAgICAgIGRhdGVGb3JtYXQ6ICcnLFxyXG4gICAgICAgICAgICBhbHRGaWVsZDogJycsXHJcbiAgICAgICAgICAgIGFsdEZpZWxkRGF0ZUZvcm1hdDogJ0AnLFxyXG4gICAgICAgICAgICB0b2dnbGVTZWxlY3RlZDogdHJ1ZSxcclxuICAgICAgICAgICAga2V5Ym9hcmROYXY6IHRydWUsXHJcblxyXG4gICAgICAgICAgICBwb3NpdGlvbjogJ2JvdHRvbSBsZWZ0JyxcclxuICAgICAgICAgICAgb2Zmc2V0OiAxMixcclxuXHJcbiAgICAgICAgICAgIHZpZXc6ICdkYXlzJyxcclxuICAgICAgICAgICAgbWluVmlldzogJ2RheXMnLFxyXG5cclxuICAgICAgICAgICAgc2hvd090aGVyTW9udGhzOiB0cnVlLFxyXG4gICAgICAgICAgICBzZWxlY3RPdGhlck1vbnRoczogdHJ1ZSxcclxuICAgICAgICAgICAgbW92ZVRvT3RoZXJNb250aHNPblNlbGVjdDogdHJ1ZSxcclxuXHJcbiAgICAgICAgICAgIHNob3dPdGhlclllYXJzOiB0cnVlLFxyXG4gICAgICAgICAgICBzZWxlY3RPdGhlclllYXJzOiB0cnVlLFxyXG4gICAgICAgICAgICBtb3ZlVG9PdGhlclllYXJzT25TZWxlY3Q6IHRydWUsXHJcblxyXG4gICAgICAgICAgICBtaW5EYXRlOiAnJyxcclxuICAgICAgICAgICAgbWF4RGF0ZTogJycsXHJcbiAgICAgICAgICAgIGRpc2FibGVOYXZXaGVuT3V0T2ZSYW5nZTogdHJ1ZSxcclxuXHJcbiAgICAgICAgICAgIG11bHRpcGxlRGF0ZXM6IGZhbHNlLCAvLyBCb29sZWFuIG9yIE51bWJlclxyXG4gICAgICAgICAgICBtdWx0aXBsZURhdGVzU2VwYXJhdG9yOiAnLCcsXHJcbiAgICAgICAgICAgIHJhbmdlOiBmYWxzZSxcclxuXHJcbiAgICAgICAgICAgIHRvZGF5QnV0dG9uOiBmYWxzZSxcclxuICAgICAgICAgICAgY2xlYXJCdXR0b246IGZhbHNlLFxyXG5cclxuICAgICAgICAgICAgc2hvd0V2ZW50OiAnZm9jdXMnLFxyXG4gICAgICAgICAgICBhdXRvQ2xvc2U6IGZhbHNlLFxyXG5cclxuICAgICAgICAgICAgLy8gbmF2aWdhdGlvblxyXG4gICAgICAgICAgICBtb250aHNGaWVsZDogJ21vbnRoc1Nob3J0JyxcclxuICAgICAgICAgICAgcHJldkh0bWw6ICc8c3ZnPjxwYXRoIGQ9XCJNIDE3LDEyIGwgLTUsNSBsIDUsNVwiPjwvcGF0aD48L3N2Zz4nLFxyXG4gICAgICAgICAgICBuZXh0SHRtbDogJzxzdmc+PHBhdGggZD1cIk0gMTQsMTIgbCA1LDUgbCAtNSw1XCI+PC9wYXRoPjwvc3ZnPicsXHJcbiAgICAgICAgICAgIG5hdlRpdGxlczoge1xyXG4gICAgICAgICAgICAgICAgZGF5czogJ01NLCA8aT55eXl5PC9pPicsXHJcbiAgICAgICAgICAgICAgICBtb250aHM6ICd5eXl5JyxcclxuICAgICAgICAgICAgICAgIHllYXJzOiAneXl5eTEgLSB5eXl5MidcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIC8vIGV2ZW50c1xyXG4gICAgICAgICAgICBvblNlbGVjdDogJycsXHJcbiAgICAgICAgICAgIG9uQ2hhbmdlTW9udGg6ICcnLFxyXG4gICAgICAgICAgICBvbkNoYW5nZVllYXI6ICcnLFxyXG4gICAgICAgICAgICBvbkNoYW5nZURlY2FkZTogJycsXHJcbiAgICAgICAgICAgIG9uQ2hhbmdlVmlldzogJycsXHJcbiAgICAgICAgICAgIG9uUmVuZGVyQ2VsbDogJydcclxuICAgICAgICB9LFxyXG4gICAgICAgIGhvdEtleXMgPSB7XHJcbiAgICAgICAgICAgICdjdHJsUmlnaHQnOiBbMTcsIDM5XSxcclxuICAgICAgICAgICAgJ2N0cmxVcCc6IFsxNywgMzhdLFxyXG4gICAgICAgICAgICAnY3RybExlZnQnOiBbMTcsIDM3XSxcclxuICAgICAgICAgICAgJ2N0cmxEb3duJzogWzE3LCA0MF0sXHJcbiAgICAgICAgICAgICdzaGlmdFJpZ2h0JzogWzE2LCAzOV0sXHJcbiAgICAgICAgICAgICdzaGlmdFVwJzogWzE2LCAzOF0sXHJcbiAgICAgICAgICAgICdzaGlmdExlZnQnOiBbMTYsIDM3XSxcclxuICAgICAgICAgICAgJ3NoaWZ0RG93bic6IFsxNiwgNDBdLFxyXG4gICAgICAgICAgICAnYWx0VXAnOiBbMTgsIDM4XSxcclxuICAgICAgICAgICAgJ2FsdFJpZ2h0JzogWzE4LCAzOV0sXHJcbiAgICAgICAgICAgICdhbHRMZWZ0JzogWzE4LCAzN10sXHJcbiAgICAgICAgICAgICdhbHREb3duJzogWzE4LCA0MF0sXHJcbiAgICAgICAgICAgICdjdHJsU2hpZnRVcCc6IFsxNiwgMTcsIDM4XVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGF0ZXBpY2tlcjtcclxuXHJcbiAgICBEYXRlcGlja2VyICA9IGZ1bmN0aW9uIChlbCwgb3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMuZWwgPSBlbDtcclxuICAgICAgICB0aGlzLiRlbCA9ICQoZWwpO1xyXG5cclxuICAgICAgICB0aGlzLm9wdHMgPSAkLmV4dGVuZCh0cnVlLCB7fSwgZGVmYXVsdHMsIG9wdGlvbnMsIHRoaXMuJGVsLmRhdGEoKSk7XHJcblxyXG4gICAgICAgIGlmICgkYm9keSA9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgJGJvZHkgPSAkKCdib2R5Jyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXRoaXMub3B0cy5zdGFydERhdGUpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRzLnN0YXJ0RGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5lbC5ub2RlTmFtZSA9PSAnSU5QVVQnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWxJc0lucHV0ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm9wdHMuYWx0RmllbGQpIHtcclxuICAgICAgICAgICAgdGhpcy4kYWx0RmllbGQgPSB0eXBlb2YgdGhpcy5vcHRzLmFsdEZpZWxkID09ICdzdHJpbmcnID8gJCh0aGlzLm9wdHMuYWx0RmllbGQpIDogdGhpcy5vcHRzLmFsdEZpZWxkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5pbml0ZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnNpbGVudCA9IGZhbHNlOyAvLyBOZWVkIHRvIHByZXZlbnQgdW5uZWNlc3NhcnkgcmVuZGVyaW5nXHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudERhdGUgPSB0aGlzLm9wdHMuc3RhcnREYXRlO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFZpZXcgPSB0aGlzLm9wdHMudmlldztcclxuICAgICAgICB0aGlzLl9jcmVhdGVTaG9ydEN1dHMoKTtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkRGF0ZXMgPSBbXTtcclxuICAgICAgICB0aGlzLnZpZXdzID0ge307XHJcbiAgICAgICAgdGhpcy5rZXlzID0gW107XHJcbiAgICAgICAgdGhpcy5taW5SYW5nZSA9ICcnO1xyXG4gICAgICAgIHRoaXMubWF4UmFuZ2UgPSAnJztcclxuXHJcbiAgICAgICAgdGhpcy5pbml0KClcclxuICAgIH07XHJcblxyXG4gICAgZGF0ZXBpY2tlciA9IERhdGVwaWNrZXI7XHJcblxyXG4gICAgZGF0ZXBpY2tlci5wcm90b3R5cGUgPSB7XHJcbiAgICAgICAgdmlld0luZGV4ZXM6IFsnZGF5cycsICdtb250aHMnLCAneWVhcnMnXSxcclxuXHJcbiAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoIWNvbnRhaW5lckJ1aWx0ICYmICF0aGlzLm9wdHMuaW5saW5lICYmIHRoaXMuZWxJc0lucHV0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9idWlsZERhdGVwaWNrZXJzQ29udGFpbmVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fYnVpbGRCYXNlSHRtbCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9kZWZpbmVMb2NhbGUodGhpcy5vcHRzLmxhbmd1YWdlKTtcclxuICAgICAgICAgICAgdGhpcy5fc3luY1dpdGhNaW5NYXhEYXRlcygpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuZWxJc0lucHV0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMub3B0cy5pbmxpbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBTZXQgZXh0cmEgY2xhc3NlcyBmb3IgcHJvcGVyIHRyYW5zaXRpb25zXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0UG9zaXRpb25DbGFzc2VzKHRoaXMub3B0cy5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYmluZEV2ZW50cygpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRzLmtleWJvYXJkTmF2KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYmluZEtleWJvYXJkRXZlbnRzKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyLm9uKCdtb3VzZWRvd24nLCB0aGlzLl9vbk1vdXNlRG93bkRhdGVwaWNrZXIuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyLm9uKCdtb3VzZXVwJywgdGhpcy5fb25Nb3VzZVVwRGF0ZXBpY2tlci5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5jbGFzc2VzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyLmFkZENsYXNzKHRoaXMub3B0cy5jbGFzc2VzKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLnZpZXdzW3RoaXMuY3VycmVudFZpZXddID0gbmV3IERhdGVwaWNrZXIuQm9keSh0aGlzLCB0aGlzLmN1cnJlbnRWaWV3LCB0aGlzLm9wdHMpO1xyXG4gICAgICAgICAgICB0aGlzLnZpZXdzW3RoaXMuY3VycmVudFZpZXddLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5uYXYgPSBuZXcgRGF0ZXBpY2tlci5OYXZpZ2F0aW9uKHRoaXMsIHRoaXMub3B0cyk7XHJcbiAgICAgICAgICAgIHRoaXMudmlldyA9IHRoaXMuY3VycmVudFZpZXc7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyLm9uKCdtb3VzZWVudGVyJywgJy5kYXRlcGlja2VyLS1jZWxsJywgdGhpcy5fb25Nb3VzZUVudGVyQ2VsbC5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlci5vbignbW91c2VsZWF2ZScsICcuZGF0ZXBpY2tlci0tY2VsbCcsIHRoaXMuX29uTW91c2VMZWF2ZUNlbGwuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmluaXRlZCA9IHRydWU7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2NyZWF0ZVNob3J0Q3V0czogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLm1pbkRhdGUgPSB0aGlzLm9wdHMubWluRGF0ZSA/IHRoaXMub3B0cy5taW5EYXRlIDogbmV3IERhdGUoLTg2Mzk5OTk5MTM2MDAwMDApO1xyXG4gICAgICAgICAgICB0aGlzLm1heERhdGUgPSB0aGlzLm9wdHMubWF4RGF0ZSA/IHRoaXMub3B0cy5tYXhEYXRlIDogbmV3IERhdGUoODYzOTk5OTkxMzYwMDAwMCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2JpbmRFdmVudHMgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLm9uKHRoaXMub3B0cy5zaG93RXZlbnQgKyAnLmFkcCcsIHRoaXMuX29uU2hvd0V2ZW50LmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICB0aGlzLiRlbC5vbignYmx1ci5hZHAnLCB0aGlzLl9vbkJsdXIuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLm9uKCdpbnB1dC5hZHAnLCB0aGlzLl9vbklucHV0LmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS5hZHAnLCB0aGlzLl9vblJlc2l6ZS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfYmluZEtleWJvYXJkRXZlbnRzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLm9uKCdrZXlkb3duLmFkcCcsIHRoaXMuX29uS2V5RG93bi5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgdGhpcy4kZWwub24oJ2tleXVwLmFkcCcsIHRoaXMuX29uS2V5VXAuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLm9uKCdob3RLZXkuYWRwJywgdGhpcy5fb25Ib3RLZXkuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgaXNXZWVrZW5kOiBmdW5jdGlvbiAoZGF5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdHMud2Vla2VuZHMuaW5kZXhPZihkYXkpICE9PSAtMTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfZGVmaW5lTG9jYWxlOiBmdW5jdGlvbiAobGFuZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGxhbmcgPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9jID0gRGF0ZXBpY2tlci5sYW5ndWFnZVtsYW5nXTtcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5sb2MpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0NhblxcJ3QgZmluZCBsYW5ndWFnZSBcIicgKyBsYW5nICsgJ1wiIGluIERhdGVwaWNrZXIubGFuZ3VhZ2UsIHdpbGwgdXNlIFwicnVcIiBpbnN0ZWFkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2MgPSAkLmV4dGVuZCh0cnVlLCB7fSwgRGF0ZXBpY2tlci5sYW5ndWFnZS5ydSlcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYyA9ICQuZXh0ZW5kKHRydWUsIHt9LCBEYXRlcGlja2VyLmxhbmd1YWdlLnJ1LCBEYXRlcGlja2VyLmxhbmd1YWdlW2xhbmddKVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2MgPSAkLmV4dGVuZCh0cnVlLCB7fSwgRGF0ZXBpY2tlci5sYW5ndWFnZS5ydSwgbGFuZylcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5kYXRlRm9ybWF0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYy5kYXRlRm9ybWF0ID0gdGhpcy5vcHRzLmRhdGVGb3JtYXRcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5maXJzdERheSAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9jLmZpcnN0RGF5ID0gdGhpcy5vcHRzLmZpcnN0RGF5XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfYnVpbGREYXRlcGlja2Vyc0NvbnRhaW5lcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBjb250YWluZXJCdWlsdCA9IHRydWU7XHJcbiAgICAgICAgICAgICRib2R5LmFwcGVuZCgnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXJzLWNvbnRhaW5lclwiIGlkPVwiZGF0ZXBpY2tlcnMtY29udGFpbmVyXCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgICRkYXRlcGlja2Vyc0NvbnRhaW5lciA9ICQoJyNkYXRlcGlja2Vycy1jb250YWluZXInKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfYnVpbGRCYXNlSHRtbDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgJGFwcGVuZFRhcmdldCxcclxuICAgICAgICAgICAgICAgICRpbmxpbmUgPSAkKCc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci1pbmxpbmVcIj4nKTtcclxuXHJcbiAgICAgICAgICAgIGlmKHRoaXMuZWwubm9kZU5hbWUgPT0gJ0lOUFVUJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm9wdHMuaW5saW5lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGFwcGVuZFRhcmdldCA9ICRkYXRlcGlja2Vyc0NvbnRhaW5lcjtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGFwcGVuZFRhcmdldCA9ICRpbmxpbmUuaW5zZXJ0QWZ0ZXIodGhpcy4kZWwpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkYXBwZW5kVGFyZ2V0ID0gJGlubGluZS5hcHBlbmRUbyh0aGlzLiRlbClcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlciA9ICQoYmFzZVRlbXBsYXRlKS5hcHBlbmRUbygkYXBwZW5kVGFyZ2V0KTtcclxuICAgICAgICAgICAgdGhpcy4kY29udGVudCA9ICQoJy5kYXRlcGlja2VyLS1jb250ZW50JywgdGhpcy4kZGF0ZXBpY2tlcik7XHJcbiAgICAgICAgICAgIHRoaXMuJG5hdiA9ICQoJy5kYXRlcGlja2VyLS1uYXYnLCB0aGlzLiRkYXRlcGlja2VyKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfdHJpZ2dlck9uQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5zZWxlY3RlZERhdGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0cy5vblNlbGVjdCgnJywgJycsIHRoaXMpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWREYXRlcyA9IHRoaXMuc2VsZWN0ZWREYXRlcyxcclxuICAgICAgICAgICAgICAgIHBhcnNlZFNlbGVjdGVkID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKHNlbGVjdGVkRGF0ZXNbMF0pLFxyXG4gICAgICAgICAgICAgICAgZm9ybWF0dGVkRGF0ZXMsXHJcbiAgICAgICAgICAgICAgICBfdGhpcyA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBkYXRlcyA9IG5ldyBEYXRlKHBhcnNlZFNlbGVjdGVkLnllYXIsIHBhcnNlZFNlbGVjdGVkLm1vbnRoLCBwYXJzZWRTZWxlY3RlZC5kYXRlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWREYXRlcyA9IHNlbGVjdGVkRGF0ZXMubWFwKGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLmZvcm1hdERhdGUoX3RoaXMubG9jLmRhdGVGb3JtYXQsIGRhdGUpXHJcbiAgICAgICAgICAgICAgICB9KS5qb2luKHRoaXMub3B0cy5tdWx0aXBsZURhdGVzU2VwYXJhdG9yKTtcclxuXHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSBuZXcgZGF0ZXMgYXJyYXksIHRvIHNlcGFyYXRlIGl0IGZyb20gb3JpZ2luYWwgc2VsZWN0ZWREYXRlc1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLm11bHRpcGxlRGF0ZXMgfHwgdGhpcy5vcHRzLnJhbmdlKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRlcyA9IHNlbGVjdGVkRGF0ZXMubWFwKGZ1bmN0aW9uKGRhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcGFyc2VkRGF0ZSA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZShkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IERhdGUocGFyc2VkRGF0ZS55ZWFyLCBwYXJzZWREYXRlLm1vbnRoLCBwYXJzZWREYXRlLmRhdGUpXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLm9wdHMub25TZWxlY3QoZm9ybWF0dGVkRGF0ZXMsIGRhdGVzLCB0aGlzKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBkID0gdGhpcy5wYXJzZWREYXRlLFxyXG4gICAgICAgICAgICAgICAgbyA9IHRoaXMub3B0cztcclxuICAgICAgICAgICAgc3dpdGNoICh0aGlzLnZpZXcpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2RheXMnOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKGQueWVhciwgZC5tb250aCArIDEsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvLm9uQ2hhbmdlTW9udGgpIG8ub25DaGFuZ2VNb250aCh0aGlzLnBhcnNlZERhdGUubW9udGgsIHRoaXMucGFyc2VkRGF0ZS55ZWFyKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ21vbnRocyc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoZC55ZWFyICsgMSwgZC5tb250aCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG8ub25DaGFuZ2VZZWFyKSBvLm9uQ2hhbmdlWWVhcih0aGlzLnBhcnNlZERhdGUueWVhcik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICd5ZWFycyc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoZC55ZWFyICsgMTAsIDAsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvLm9uQ2hhbmdlRGVjYWRlKSBvLm9uQ2hhbmdlRGVjYWRlKHRoaXMuY3VyRGVjYWRlKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHByZXY6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGQgPSB0aGlzLnBhcnNlZERhdGUsXHJcbiAgICAgICAgICAgICAgICBvID0gdGhpcy5vcHRzO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMudmlldykge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZGF5cyc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoZC55ZWFyLCBkLm1vbnRoIC0gMSwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG8ub25DaGFuZ2VNb250aCkgby5vbkNoYW5nZU1vbnRoKHRoaXMucGFyc2VkRGF0ZS5tb250aCwgdGhpcy5wYXJzZWREYXRlLnllYXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbW9udGhzJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShkLnllYXIgLSAxLCBkLm1vbnRoLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoby5vbkNoYW5nZVllYXIpIG8ub25DaGFuZ2VZZWFyKHRoaXMucGFyc2VkRGF0ZS55ZWFyKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3llYXJzJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShkLnllYXIgLSAxMCwgMCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG8ub25DaGFuZ2VEZWNhZGUpIG8ub25DaGFuZ2VEZWNhZGUodGhpcy5jdXJEZWNhZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZm9ybWF0RGF0ZTogZnVuY3Rpb24gKHN0cmluZywgZGF0ZSkge1xyXG4gICAgICAgICAgICBkYXRlID0gZGF0ZSB8fCB0aGlzLmRhdGU7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBzdHJpbmcsXHJcbiAgICAgICAgICAgICAgICBib3VuZGFyeSA9IHRoaXMuX2dldFdvcmRCb3VuZGFyeVJlZ0V4cCxcclxuICAgICAgICAgICAgICAgIGxvY2FsZSA9IHRoaXMubG9jLFxyXG4gICAgICAgICAgICAgICAgZGVjYWRlID0gZGF0ZXBpY2tlci5nZXREZWNhZGUoZGF0ZSksXHJcbiAgICAgICAgICAgICAgICBkID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKGRhdGUpO1xyXG5cclxuICAgICAgICAgICAgc3dpdGNoICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIC9ALy50ZXN0KHJlc3VsdCk6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoL0AvLCBkYXRlLmdldFRpbWUoKSk7XHJcbiAgICAgICAgICAgICAgICBjYXNlIC9kZC8udGVzdChyZXN1bHQpOlxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCdkZCcpLCBkLmZ1bGxEYXRlKTtcclxuICAgICAgICAgICAgICAgIGNhc2UgL2QvLnRlc3QocmVzdWx0KTpcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgnZCcpLCBkLmRhdGUpO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAvREQvLnRlc3QocmVzdWx0KTpcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgnREQnKSwgbG9jYWxlLmRheXNbZC5kYXldKTtcclxuICAgICAgICAgICAgICAgIGNhc2UgL0QvLnRlc3QocmVzdWx0KTpcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgnRCcpLCBsb2NhbGUuZGF5c1Nob3J0W2QuZGF5XSk7XHJcbiAgICAgICAgICAgICAgICBjYXNlIC9tbS8udGVzdChyZXN1bHQpOlxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCdtbScpLCBkLmZ1bGxNb250aCk7XHJcbiAgICAgICAgICAgICAgICBjYXNlIC9tLy50ZXN0KHJlc3VsdCk6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ20nKSwgZC5tb250aCArIDEpO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAvTU0vLnRlc3QocmVzdWx0KTpcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgnTU0nKSwgdGhpcy5sb2MubW9udGhzW2QubW9udGhdKTtcclxuICAgICAgICAgICAgICAgIGNhc2UgL00vLnRlc3QocmVzdWx0KTpcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgnTScpLCBsb2NhbGUubW9udGhzU2hvcnRbZC5tb250aF0pO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAveXl5eS8udGVzdChyZXN1bHQpOlxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCd5eXl5JyksIGQueWVhcik7XHJcbiAgICAgICAgICAgICAgICBjYXNlIC95eXl5MS8udGVzdChyZXN1bHQpOlxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCd5eXl5MScpLCBkZWNhZGVbMF0pO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAveXl5eTIvLnRlc3QocmVzdWx0KTpcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgneXl5eTInKSwgZGVjYWRlWzFdKTtcclxuICAgICAgICAgICAgICAgIGNhc2UgL3l5Ly50ZXN0KHJlc3VsdCk6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ3l5JyksIGQueWVhci50b1N0cmluZygpLnNsaWNlKC0yKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2dldFdvcmRCb3VuZGFyeVJlZ0V4cDogZnVuY3Rpb24gKHNpZ24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoJ1xcXFxiKD89W2EtekEtWjAtOcOkw7bDvMOfw4TDlsOcPF0pJyArIHNpZ24gKyAnKD8hWz5hLXpBLVowLTnDpMO2w7zDn8OEw5bDnF0pJyk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2VsZWN0RGF0ZTogZnVuY3Rpb24gKGRhdGUpIHtcclxuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIG9wdHMgPSBfdGhpcy5vcHRzLFxyXG4gICAgICAgICAgICAgICAgZCA9IF90aGlzLnBhcnNlZERhdGUsXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZERhdGVzID0gX3RoaXMuc2VsZWN0ZWREYXRlcyxcclxuICAgICAgICAgICAgICAgIGxlbiA9IHNlbGVjdGVkRGF0ZXMubGVuZ3RoLFxyXG4gICAgICAgICAgICAgICAgbmV3RGF0ZSA9ICcnO1xyXG5cclxuICAgICAgICAgICAgaWYgKCEoZGF0ZSBpbnN0YW5jZW9mIERhdGUpKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBpZiAoX3RoaXMudmlldyA9PSAnZGF5cycpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRlLmdldE1vbnRoKCkgIT0gZC5tb250aCAmJiBvcHRzLm1vdmVUb090aGVyTW9udGhzT25TZWxlY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICBuZXdEYXRlID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIDEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoX3RoaXMudmlldyA9PSAneWVhcnMnKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZS5nZXRGdWxsWWVhcigpICE9IGQueWVhciAmJiBvcHRzLm1vdmVUb090aGVyWWVhcnNPblNlbGVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld0RhdGUgPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIDAsIDEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobmV3RGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuc2lsZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIF90aGlzLmRhdGUgPSBuZXdEYXRlO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuc2lsZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5uYXYuX3JlbmRlcigpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChvcHRzLm11bHRpcGxlRGF0ZXMgJiYgIW9wdHMucmFuZ2UpIHsgLy8gU2V0IHByaW9yaXR5IHRvIHJhbmdlIGZ1bmN0aW9uYWxpdHlcclxuICAgICAgICAgICAgICAgIGlmIChsZW4gPT09IG9wdHMubXVsdGlwbGVEYXRlcykgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFfdGhpcy5faXNTZWxlY3RlZChkYXRlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnNlbGVjdGVkRGF0ZXMucHVzaChkYXRlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRzLnJhbmdlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobGVuID09IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZWxlY3RlZERhdGVzID0gW2RhdGVdO1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLm1pblJhbmdlID0gZGF0ZTtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5tYXhSYW5nZSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChsZW4gPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnNlbGVjdGVkRGF0ZXMucHVzaChkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIV90aGlzLm1heFJhbmdlKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMubWF4UmFuZ2UgPSBkYXRlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLm1pblJhbmdlID0gZGF0ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2VsZWN0ZWREYXRlcyA9IFtfdGhpcy5taW5SYW5nZSwgX3RoaXMubWF4UmFuZ2VdXHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZWxlY3RlZERhdGVzID0gW2RhdGVdO1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLm1pblJhbmdlID0gZGF0ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLnNlbGVjdGVkRGF0ZXMgPSBbZGF0ZV07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIF90aGlzLl9zZXRJbnB1dFZhbHVlKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAob3B0cy5vblNlbGVjdCkge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuX3RyaWdnZXJPbkNoYW5nZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAob3B0cy5hdXRvQ2xvc2UpIHtcclxuICAgICAgICAgICAgICAgIGlmICghb3B0cy5tdWx0aXBsZURhdGVzICYmICFvcHRzLnJhbmdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRzLnJhbmdlICYmIF90aGlzLnNlbGVjdGVkRGF0ZXMubGVuZ3RoID09IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIF90aGlzLnZpZXdzW3RoaXMuY3VycmVudFZpZXddLl9yZW5kZXIoKVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHJlbW92ZURhdGU6IGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxlY3RlZCA9IHRoaXMuc2VsZWN0ZWREYXRlcyxcclxuICAgICAgICAgICAgICAgIF90aGlzID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIGlmICghKGRhdGUgaW5zdGFuY2VvZiBEYXRlKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGVkLnNvbWUoZnVuY3Rpb24gKGN1ckRhdGUsIGkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRlcGlja2VyLmlzU2FtZShjdXJEYXRlLCBkYXRlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkLnNwbGljZShpLCAxKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFfdGhpcy5zZWxlY3RlZERhdGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5taW5SYW5nZSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5tYXhSYW5nZSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMudmlld3NbX3RoaXMuY3VycmVudFZpZXddLl9yZW5kZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5fc2V0SW5wdXRWYWx1ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXMub3B0cy5vblNlbGVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5fdHJpZ2dlck9uQ2hhbmdlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHRvZGF5OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy52aWV3ID0gdGhpcy5vcHRzLm1pblZpZXc7XHJcbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgY2xlYXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZERhdGVzID0gW107XHJcbiAgICAgICAgICAgIHRoaXMubWluUmFuZ2UgPSAnJztcclxuICAgICAgICAgICAgdGhpcy5tYXhSYW5nZSA9ICcnO1xyXG4gICAgICAgICAgICB0aGlzLnZpZXdzW3RoaXMuY3VycmVudFZpZXddLl9yZW5kZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5fc2V0SW5wdXRWYWx1ZSgpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLm9uU2VsZWN0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl90cmlnZ2VyT25DaGFuZ2UoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVXBkYXRlcyBkYXRlcGlja2VyIG9wdGlvbnNcclxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IHBhcmFtIC0gcGFyYW1ldGVyJ3MgbmFtZSB0byB1cGRhdGUuIElmIG9iamVjdCB0aGVuIGl0IHdpbGwgZXh0ZW5kIGN1cnJlbnQgb3B0aW9uc1xyXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfE51bWJlcnxPYmplY3R9IFt2YWx1ZV0gLSBuZXcgcGFyYW0gdmFsdWVcclxuICAgICAgICAgKi9cclxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIChwYXJhbSwgdmFsdWUpIHtcclxuICAgICAgICAgICAgdmFyIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XHJcbiAgICAgICAgICAgIGlmIChsZW4gPT0gMikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcHRzW3BhcmFtXSA9IHZhbHVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxlbiA9PSAxICYmIHR5cGVvZiBwYXJhbSA9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcHRzID0gJC5leHRlbmQodHJ1ZSwgdGhpcy5vcHRzLCBwYXJhbSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5fY3JlYXRlU2hvcnRDdXRzKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3N5bmNXaXRoTWluTWF4RGF0ZXMoKTtcclxuICAgICAgICAgICAgdGhpcy5fZGVmaW5lTG9jYWxlKHRoaXMub3B0cy5sYW5ndWFnZSk7XHJcbiAgICAgICAgICAgIHRoaXMubmF2Ll9hZGRCdXR0b25zSWZOZWVkKCk7XHJcbiAgICAgICAgICAgIHRoaXMubmF2Ll9yZW5kZXIoKTtcclxuICAgICAgICAgICAgdGhpcy52aWV3c1t0aGlzLmN1cnJlbnRWaWV3XS5fcmVuZGVyKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5lbElzSW5wdXQgJiYgIXRoaXMub3B0cy5pbmxpbmUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NldFBvc2l0aW9uQ2xhc3Nlcyh0aGlzLm9wdHMucG9zaXRpb24pO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudmlzaWJsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb24odGhpcy5vcHRzLnBvc2l0aW9uKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLmNsYXNzZXMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXIuYWRkQ2xhc3ModGhpcy5vcHRzLmNsYXNzZXMpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9zeW5jV2l0aE1pbk1heERhdGVzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBjdXJUaW1lID0gdGhpcy5kYXRlLmdldFRpbWUoKTtcclxuICAgICAgICAgICAgdGhpcy5zaWxlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5taW5UaW1lID4gY3VyVGltZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdGhpcy5taW5EYXRlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5tYXhUaW1lIDwgY3VyVGltZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdGhpcy5tYXhEYXRlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2lzU2VsZWN0ZWQ6IGZ1bmN0aW9uIChjaGVja0RhdGUsIGNlbGxUeXBlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkRGF0ZXMuc29tZShmdW5jdGlvbiAoZGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGVwaWNrZXIuaXNTYW1lKGRhdGUsIGNoZWNrRGF0ZSwgY2VsbFR5cGUpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX3NldElucHV0VmFsdWU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIG9wdHMgPSBfdGhpcy5vcHRzLFxyXG4gICAgICAgICAgICAgICAgZm9ybWF0ID0gX3RoaXMubG9jLmRhdGVGb3JtYXQsXHJcbiAgICAgICAgICAgICAgICBhbHRGb3JtYXQgPSBvcHRzLmFsdEZpZWxkRGF0ZUZvcm1hdCxcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gX3RoaXMuc2VsZWN0ZWREYXRlcy5tYXAoZnVuY3Rpb24gKGRhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuZm9ybWF0RGF0ZShmb3JtYXQsIGRhdGUpXHJcbiAgICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgICAgIGFsdFZhbHVlcztcclxuXHJcbiAgICAgICAgICAgIGlmIChvcHRzLmFsdEZpZWxkICYmIF90aGlzLiRhbHRGaWVsZC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGFsdFZhbHVlcyA9IHRoaXMuc2VsZWN0ZWREYXRlcy5tYXAoZnVuY3Rpb24gKGRhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuZm9ybWF0RGF0ZShhbHRGb3JtYXQsIGRhdGUpXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGFsdFZhbHVlcyA9IGFsdFZhbHVlcy5qb2luKHRoaXMub3B0cy5tdWx0aXBsZURhdGVzU2VwYXJhdG9yKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGFsdEZpZWxkLnZhbChhbHRWYWx1ZXMpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLmpvaW4odGhpcy5vcHRzLm11bHRpcGxlRGF0ZXNTZXBhcmF0b3IpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kZWwudmFsKHZhbHVlKVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENoZWNrIGlmIGRhdGUgaXMgYmV0d2VlbiBtaW5EYXRlIGFuZCBtYXhEYXRlXHJcbiAgICAgICAgICogQHBhcmFtIGRhdGUge29iamVjdH0gLSBkYXRlIG9iamVjdFxyXG4gICAgICAgICAqIEBwYXJhbSB0eXBlIHtzdHJpbmd9IC0gY2VsbCB0eXBlXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBfaXNJblJhbmdlOiBmdW5jdGlvbiAoZGF0ZSwgdHlwZSkge1xyXG4gICAgICAgICAgICB2YXIgdGltZSA9IGRhdGUuZ2V0VGltZSgpLFxyXG4gICAgICAgICAgICAgICAgZCA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZShkYXRlKSxcclxuICAgICAgICAgICAgICAgIG1pbiA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZSh0aGlzLm1pbkRhdGUpLFxyXG4gICAgICAgICAgICAgICAgbWF4ID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKHRoaXMubWF4RGF0ZSksXHJcbiAgICAgICAgICAgICAgICBkTWluVGltZSA9IG5ldyBEYXRlKGQueWVhciwgZC5tb250aCwgbWluLmRhdGUpLmdldFRpbWUoKSxcclxuICAgICAgICAgICAgICAgIGRNYXhUaW1lID0gbmV3IERhdGUoZC55ZWFyLCBkLm1vbnRoLCBtYXguZGF0ZSkuZ2V0VGltZSgpLFxyXG4gICAgICAgICAgICAgICAgdHlwZXMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF5OiB0aW1lID49IHRoaXMubWluVGltZSAmJiB0aW1lIDw9IHRoaXMubWF4VGltZSxcclxuICAgICAgICAgICAgICAgICAgICBtb250aDogZE1pblRpbWUgPj0gdGhpcy5taW5UaW1lICYmIGRNYXhUaW1lIDw9IHRoaXMubWF4VGltZSxcclxuICAgICAgICAgICAgICAgICAgICB5ZWFyOiBkLnllYXIgPj0gbWluLnllYXIgJiYgZC55ZWFyIDw9IG1heC55ZWFyXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gdHlwZSA/IHR5cGVzW3R5cGVdIDogdHlwZXMuZGF5XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2dldERpbWVuc2lvbnM6IGZ1bmN0aW9uICgkZWwpIHtcclxuICAgICAgICAgICAgdmFyIG9mZnNldCA9ICRlbC5vZmZzZXQoKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB3aWR0aDogJGVsLm91dGVyV2lkdGgoKSxcclxuICAgICAgICAgICAgICAgIGhlaWdodDogJGVsLm91dGVySGVpZ2h0KCksXHJcbiAgICAgICAgICAgICAgICBsZWZ0OiBvZmZzZXQubGVmdCxcclxuICAgICAgICAgICAgICAgIHRvcDogb2Zmc2V0LnRvcFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2dldERhdGVGcm9tQ2VsbDogZnVuY3Rpb24gKGNlbGwpIHtcclxuICAgICAgICAgICAgdmFyIGN1ckRhdGUgPSB0aGlzLnBhcnNlZERhdGUsXHJcbiAgICAgICAgICAgICAgICB5ZWFyID0gY2VsbC5kYXRhKCd5ZWFyJykgfHwgY3VyRGF0ZS55ZWFyLFxyXG4gICAgICAgICAgICAgICAgbW9udGggPSBjZWxsLmRhdGEoJ21vbnRoJykgPT0gdW5kZWZpbmVkID8gY3VyRGF0ZS5tb250aCA6IGNlbGwuZGF0YSgnbW9udGgnKSxcclxuICAgICAgICAgICAgICAgIGRhdGUgPSBjZWxsLmRhdGEoJ2RhdGUnKSB8fCAxO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHllYXIsIG1vbnRoLCBkYXRlKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfc2V0UG9zaXRpb25DbGFzc2VzOiBmdW5jdGlvbiAocG9zKSB7XHJcbiAgICAgICAgICAgIHBvcyA9IHBvcy5zcGxpdCgnICcpO1xyXG4gICAgICAgICAgICB2YXIgbWFpbiA9IHBvc1swXSxcclxuICAgICAgICAgICAgICAgIHNlYyA9IHBvc1sxXSxcclxuICAgICAgICAgICAgICAgIGNsYXNzZXMgPSAnZGF0ZXBpY2tlciAtJyArIG1haW4gKyAnLScgKyBzZWMgKyAnLSAtZnJvbS0nICsgbWFpbiArICctJztcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnZpc2libGUpIGNsYXNzZXMgKz0gJyBhY3RpdmUnO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlclxyXG4gICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2NsYXNzJylcclxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcyhjbGFzc2VzKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzZXRQb3NpdGlvbjogZnVuY3Rpb24gKHBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uID0gcG9zaXRpb24gfHwgdGhpcy5vcHRzLnBvc2l0aW9uO1xyXG5cclxuICAgICAgICAgICAgdmFyIGRpbXMgPSB0aGlzLl9nZXREaW1lbnNpb25zKHRoaXMuJGVsKSxcclxuICAgICAgICAgICAgICAgIHNlbGZEaW1zID0gdGhpcy5fZ2V0RGltZW5zaW9ucyh0aGlzLiRkYXRlcGlja2VyKSxcclxuICAgICAgICAgICAgICAgIHBvcyA9IHBvc2l0aW9uLnNwbGl0KCcgJyksXHJcbiAgICAgICAgICAgICAgICB0b3AsIGxlZnQsXHJcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSB0aGlzLm9wdHMub2Zmc2V0LFxyXG4gICAgICAgICAgICAgICAgbWFpbiA9IHBvc1swXSxcclxuICAgICAgICAgICAgICAgIHNlY29uZGFyeSA9IHBvc1sxXTtcclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCAobWFpbikge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAndG9wJzpcclxuICAgICAgICAgICAgICAgICAgICB0b3AgPSBkaW1zLnRvcCAtIHNlbGZEaW1zLmhlaWdodCAtIG9mZnNldDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gZGltcy5sZWZ0ICsgZGltcy53aWR0aCArIG9mZnNldDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XHJcbiAgICAgICAgICAgICAgICAgICAgdG9wID0gZGltcy50b3AgKyBkaW1zLmhlaWdodCArIG9mZnNldDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgICAgICAgICAgICAgIGxlZnQgPSBkaW1zLmxlZnQgLSBzZWxmRGltcy53aWR0aCAtIG9mZnNldDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc3dpdGNoKHNlY29uZGFyeSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAndG9wJzpcclxuICAgICAgICAgICAgICAgICAgICB0b3AgPSBkaW1zLnRvcDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gZGltcy5sZWZ0ICsgZGltcy53aWR0aCAtIHNlbGZEaW1zLndpZHRoO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnYm90dG9tJzpcclxuICAgICAgICAgICAgICAgICAgICB0b3AgPSBkaW1zLnRvcCArIGRpbXMuaGVpZ2h0IC0gc2VsZkRpbXMuaGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgICAgICAgICAgICAgbGVmdCA9IGRpbXMubGVmdDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2NlbnRlcic6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKC9sZWZ0fHJpZ2h0Ly50ZXN0KG1haW4pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcCA9IGRpbXMudG9wICsgZGltcy5oZWlnaHQvMiAtIHNlbGZEaW1zLmhlaWdodC8yO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgPSBkaW1zLmxlZnQgKyBkaW1zLndpZHRoLzIgLSBzZWxmRGltcy53aWR0aC8yO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlclxyXG4gICAgICAgICAgICAgICAgLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogbGVmdCxcclxuICAgICAgICAgICAgICAgICAgICB0b3A6IHRvcFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzaG93OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb24odGhpcy5vcHRzLnBvc2l0aW9uKTtcclxuICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlci5hZGRDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgaGlkZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyXHJcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgICAgICAgICAgICAgICAuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiAnLTEwMDAwMHB4J1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmZvY3VzZWQgPSAnJztcclxuICAgICAgICAgICAgdGhpcy5rZXlzID0gW107XHJcblxyXG4gICAgICAgICAgICB0aGlzLmluRm9jdXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLmJsdXIoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBkb3duOiBmdW5jdGlvbiAoZGF0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9jaGFuZ2VWaWV3KGRhdGUsICdkb3duJyk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgdXA6IGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NoYW5nZVZpZXcoZGF0ZSwgJ3VwJyk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2NoYW5nZVZpZXc6IGZ1bmN0aW9uIChkYXRlLCBkaXIpIHtcclxuICAgICAgICAgICAgZGF0ZSA9IGRhdGUgfHwgdGhpcy5mb2N1c2VkIHx8IHRoaXMuZGF0ZTtcclxuXHJcbiAgICAgICAgICAgIHZhciBuZXh0VmlldyA9IGRpciA9PSAndXAnID8gdGhpcy52aWV3SW5kZXggKyAxIDogdGhpcy52aWV3SW5kZXggLSAxO1xyXG4gICAgICAgICAgICBpZiAobmV4dFZpZXcgPiAyKSBuZXh0VmlldyA9IDI7XHJcbiAgICAgICAgICAgIGlmIChuZXh0VmlldyA8IDApIG5leHRWaWV3ID0gMDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIDEpO1xyXG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnZpZXcgPSB0aGlzLnZpZXdJbmRleGVzW25leHRWaWV3XTtcclxuXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2hhbmRsZUhvdEtleTogZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgICB2YXIgZGF0ZSA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZSh0aGlzLl9nZXRGb2N1c2VkRGF0ZSgpKSxcclxuICAgICAgICAgICAgICAgIGZvY3VzZWRQYXJzZWQsXHJcbiAgICAgICAgICAgICAgICBvID0gdGhpcy5vcHRzLFxyXG4gICAgICAgICAgICAgICAgbmV3RGF0ZSxcclxuICAgICAgICAgICAgICAgIHRvdGFsRGF5c0luTmV4dE1vbnRoLFxyXG4gICAgICAgICAgICAgICAgbW9udGhDaGFuZ2VkID0gZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB5ZWFyQ2hhbmdlZCA9IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgZGVjYWRlQ2hhbmdlZCA9IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgeSA9IGRhdGUueWVhcixcclxuICAgICAgICAgICAgICAgIG0gPSBkYXRlLm1vbnRoLFxyXG4gICAgICAgICAgICAgICAgZCA9IGRhdGUuZGF0ZTtcclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCAoa2V5KSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdjdHJsUmlnaHQnOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAnY3RybFVwJzpcclxuICAgICAgICAgICAgICAgICAgICBtICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9udGhDaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2N0cmxMZWZ0JzpcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2N0cmxEb3duJzpcclxuICAgICAgICAgICAgICAgICAgICBtIC09IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9udGhDaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3NoaWZ0UmlnaHQnOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAnc2hpZnRVcCc6XHJcbiAgICAgICAgICAgICAgICAgICAgeWVhckNoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHkgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3NoaWZ0TGVmdCc6XHJcbiAgICAgICAgICAgICAgICBjYXNlICdzaGlmdERvd24nOlxyXG4gICAgICAgICAgICAgICAgICAgIHllYXJDaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB5IC09IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdhbHRSaWdodCc6XHJcbiAgICAgICAgICAgICAgICBjYXNlICdhbHRVcCc6XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjYWRlQ2hhbmdlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgeSArPSAxMDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2FsdExlZnQnOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAnYWx0RG93bic6XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjYWRlQ2hhbmdlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgeSAtPSAxMDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2N0cmxTaGlmdFVwJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRvdGFsRGF5c0luTmV4dE1vbnRoID0gZGF0ZXBpY2tlci5nZXREYXlzQ291bnQobmV3IERhdGUoeSxtKSk7XHJcbiAgICAgICAgICAgIG5ld0RhdGUgPSBuZXcgRGF0ZSh5LG0sZCk7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBuZXh0IG1vbnRoIGhhcyBsZXNzIGRheXMgdGhhbiBjdXJyZW50LCBzZXQgZGF0ZSB0byB0b3RhbCBkYXlzIGluIHRoYXQgbW9udGhcclxuICAgICAgICAgICAgaWYgKHRvdGFsRGF5c0luTmV4dE1vbnRoIDwgZCkgZCA9IHRvdGFsRGF5c0luTmV4dE1vbnRoO1xyXG5cclxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgbmV3RGF0ZSBpcyBpbiB2YWxpZCByYW5nZVxyXG4gICAgICAgICAgICBpZiAobmV3RGF0ZS5nZXRUaW1lKCkgPCB0aGlzLm1pblRpbWUpIHtcclxuICAgICAgICAgICAgICAgIG5ld0RhdGUgPSB0aGlzLm1pbkRhdGU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3RGF0ZS5nZXRUaW1lKCkgPiB0aGlzLm1heFRpbWUpIHtcclxuICAgICAgICAgICAgICAgIG5ld0RhdGUgPSB0aGlzLm1heERhdGU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuZm9jdXNlZCA9IG5ld0RhdGU7XHJcblxyXG4gICAgICAgICAgICBmb2N1c2VkUGFyc2VkID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKG5ld0RhdGUpO1xyXG4gICAgICAgICAgICBpZiAobW9udGhDaGFuZ2VkICYmIG8ub25DaGFuZ2VNb250aCkge1xyXG4gICAgICAgICAgICAgICAgby5vbkNoYW5nZU1vbnRoKGZvY3VzZWRQYXJzZWQubW9udGgsIGZvY3VzZWRQYXJzZWQueWVhcilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoeWVhckNoYW5nZWQgJiYgby5vbkNoYW5nZVllYXIpIHtcclxuICAgICAgICAgICAgICAgIG8ub25DaGFuZ2VZZWFyKGZvY3VzZWRQYXJzZWQueWVhcilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZGVjYWRlQ2hhbmdlZCAmJiBvLm9uQ2hhbmdlRGVjYWRlKSB7XHJcbiAgICAgICAgICAgICAgICBvLm9uQ2hhbmdlRGVjYWRlKHRoaXMuY3VyRGVjYWRlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX3JlZ2lzdGVyS2V5OiBmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgIHZhciBleGlzdHMgPSB0aGlzLmtleXMuc29tZShmdW5jdGlvbiAoY3VyS2V5KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3VyS2V5ID09IGtleTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWV4aXN0cykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlzLnB1c2goa2V5KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX3VuUmVnaXN0ZXJLZXk6IGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5rZXlzLmluZGV4T2Yoa2V5KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMua2V5cy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9pc0hvdEtleVByZXNzZWQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGN1cnJlbnRIb3RLZXksXHJcbiAgICAgICAgICAgICAgICBmb3VuZCA9IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgX3RoaXMgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgcHJlc3NlZEtleXMgPSB0aGlzLmtleXMuc29ydCgpO1xyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgaG90S2V5IGluIGhvdEtleXMpIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRIb3RLZXkgPSBob3RLZXlzW2hvdEtleV07XHJcbiAgICAgICAgICAgICAgICBpZiAocHJlc3NlZEtleXMubGVuZ3RoICE9IGN1cnJlbnRIb3RLZXkubGVuZ3RoKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudEhvdEtleS5ldmVyeShmdW5jdGlvbiAoa2V5LCBpKSB7IHJldHVybiBrZXkgPT0gcHJlc3NlZEtleXNbaV19KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLl90cmlnZ2VyKCdob3RLZXknLCBob3RLZXkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZvdW5kO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF90cmlnZ2VyOiBmdW5jdGlvbiAoZXZlbnQsIGFyZ3MpIHtcclxuICAgICAgICAgICAgdGhpcy4kZWwudHJpZ2dlcihldmVudCwgYXJncylcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfZm9jdXNOZXh0Q2VsbDogZnVuY3Rpb24gKGtleUNvZGUsIHR5cGUpIHtcclxuICAgICAgICAgICAgdHlwZSA9IHR5cGUgfHwgdGhpcy5jZWxsVHlwZTtcclxuXHJcbiAgICAgICAgICAgIHZhciBkYXRlID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKHRoaXMuX2dldEZvY3VzZWREYXRlKCkpLFxyXG4gICAgICAgICAgICAgICAgeSA9IGRhdGUueWVhcixcclxuICAgICAgICAgICAgICAgIG0gPSBkYXRlLm1vbnRoLFxyXG4gICAgICAgICAgICAgICAgZCA9IGRhdGUuZGF0ZTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0hvdEtleVByZXNzZWQoKSl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHN3aXRjaChrZXlDb2RlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM3OiAvLyBsZWZ0XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAnZGF5JyA/IChkIC09IDEpIDogJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAnbW9udGgnID8gKG0gLT0gMSkgOiAnJztcclxuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICd5ZWFyJyA/ICh5IC09IDEpIDogJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM4OiAvLyB1cFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ2RheScgPyAoZCAtPSA3KSA6ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ21vbnRoJyA/IChtIC09IDMpIDogJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAneWVhcicgPyAoeSAtPSA0KSA6ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzOTogLy8gcmlnaHRcclxuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICdkYXknID8gKGQgKz0gMSkgOiAnJztcclxuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICdtb250aCcgPyAobSArPSAxKSA6ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ3llYXInID8gKHkgKz0gMSkgOiAnJztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgNDA6IC8vIGRvd25cclxuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICdkYXknID8gKGQgKz0gNykgOiAnJztcclxuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICdtb250aCcgPyAobSArPSAzKSA6ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ3llYXInID8gKHkgKz0gNCkgOiAnJztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIG5kID0gbmV3IERhdGUoeSxtLGQpO1xyXG4gICAgICAgICAgICBpZiAobmQuZ2V0VGltZSgpIDwgdGhpcy5taW5UaW1lKSB7XHJcbiAgICAgICAgICAgICAgICBuZCA9IHRoaXMubWluRGF0ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChuZC5nZXRUaW1lKCkgPiB0aGlzLm1heFRpbWUpIHtcclxuICAgICAgICAgICAgICAgIG5kID0gdGhpcy5tYXhEYXRlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmZvY3VzZWQgPSBuZDtcclxuXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2dldEZvY3VzZWREYXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBmb2N1c2VkICA9IHRoaXMuZm9jdXNlZCB8fCB0aGlzLnNlbGVjdGVkRGF0ZXNbdGhpcy5zZWxlY3RlZERhdGVzLmxlbmd0aCAtIDFdLFxyXG4gICAgICAgICAgICAgICAgZCA9IHRoaXMucGFyc2VkRGF0ZTtcclxuXHJcbiAgICAgICAgICAgIGlmICghZm9jdXNlZCkge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnZpZXcpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdkYXlzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXNlZCA9IG5ldyBEYXRlKGQueWVhciwgZC5tb250aCwgbmV3IERhdGUoKS5nZXREYXRlKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdtb250aHMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2N1c2VkID0gbmV3IERhdGUoZC55ZWFyLCBkLm1vbnRoLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAneWVhcnMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2N1c2VkID0gbmV3IERhdGUoZC55ZWFyLCAwLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmb2N1c2VkO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9nZXRDZWxsOiBmdW5jdGlvbiAoZGF0ZSwgdHlwZSkge1xyXG4gICAgICAgICAgICB0eXBlID0gdHlwZSB8fCB0aGlzLmNlbGxUeXBlO1xyXG5cclxuICAgICAgICAgICAgdmFyIGQgPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUoZGF0ZSksXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RvciA9ICcuZGF0ZXBpY2tlci0tY2VsbFtkYXRhLXllYXI9XCInICsgZC55ZWFyICsgJ1wiXScsXHJcbiAgICAgICAgICAgICAgICAkY2VsbDtcclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbW9udGgnOlxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gJ1tkYXRhLW1vbnRoPVwiJyArIGQubW9udGggKyAnXCJdJztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2RheSc6XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IgKz0gJ1tkYXRhLW1vbnRoPVwiJyArIGQubW9udGggKyAnXCJdW2RhdGEtZGF0ZT1cIicgKyBkLmRhdGUgKyAnXCJdJztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkY2VsbCA9IHRoaXMudmlld3NbdGhpcy5jdXJyZW50Vmlld10uJGVsLmZpbmQoc2VsZWN0b3IpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICRjZWxsLmxlbmd0aCA/ICRjZWxsIDogJyc7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZGVzdHJveTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgICAgICBfdGhpcy4kZWxcclxuICAgICAgICAgICAgICAgIC5vZmYoJy5hZHAnKVxyXG4gICAgICAgICAgICAgICAgLmRhdGEoJ2RhdGVwaWNrZXInLCAnJyk7XHJcblxyXG4gICAgICAgICAgICBfdGhpcy5zZWxlY3RlZERhdGVzID0gW107XHJcbiAgICAgICAgICAgIF90aGlzLmZvY3VzZWQgPSAnJztcclxuICAgICAgICAgICAgX3RoaXMudmlld3MgPSB7fTtcclxuICAgICAgICAgICAgX3RoaXMua2V5cyA9IFtdO1xyXG4gICAgICAgICAgICBfdGhpcy5taW5SYW5nZSA9ICcnO1xyXG4gICAgICAgICAgICBfdGhpcy5tYXhSYW5nZSA9ICcnO1xyXG5cclxuICAgICAgICAgICAgaWYgKF90aGlzLm9wdHMuaW5saW5lIHx8ICFfdGhpcy5lbElzSW5wdXQpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLiRkYXRlcGlja2VyLmNsb3Nlc3QoJy5kYXRlcGlja2VyLWlubGluZScpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuJGRhdGVwaWNrZXIucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfb25TaG93RXZlbnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLnZpc2libGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX29uQmx1cjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuaW5Gb2N1cyAmJiB0aGlzLnZpc2libGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX29uTW91c2VEb3duRGF0ZXBpY2tlcjogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdGhpcy5pbkZvY3VzID0gdHJ1ZTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfb25Nb3VzZVVwRGF0ZXBpY2tlcjogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdGhpcy5pbkZvY3VzID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLmZvY3VzKClcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfb25JbnB1dDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdmFsID0gdGhpcy4kZWwudmFsKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXZhbCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX29uUmVzaXplOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnZpc2libGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb24oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9vbktleURvd246IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciBjb2RlID0gZS53aGljaDtcclxuICAgICAgICAgICAgdGhpcy5fcmVnaXN0ZXJLZXkoY29kZSk7XHJcblxyXG4gICAgICAgICAgICAvLyBBcnJvd3NcclxuICAgICAgICAgICAgaWYgKGNvZGUgPj0gMzcgJiYgY29kZSA8PSA0MCkge1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZm9jdXNOZXh0Q2VsbChjb2RlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRW50ZXJcclxuICAgICAgICAgICAgaWYgKGNvZGUgPT0gMTMpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZvY3VzZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fZ2V0Q2VsbCh0aGlzLmZvY3VzZWQpLmhhc0NsYXNzKCctZGlzYWJsZWQtJykpIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy52aWV3ICE9IHRoaXMub3B0cy5taW5WaWV3KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZG93bigpXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFscmVhZHlTZWxlY3RlZCA9IHRoaXMuX2lzU2VsZWN0ZWQodGhpcy5mb2N1c2VkLCB0aGlzLmNlbGxUeXBlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYWxyZWFkeVNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdERhdGUodGhpcy5mb2N1c2VkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhbHJlYWR5U2VsZWN0ZWQgJiYgdGhpcy5vcHRzLnRvZ2dsZVNlbGVjdGVkKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlRGF0ZSh0aGlzLmZvY3VzZWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBFc2NcclxuICAgICAgICAgICAgaWYgKGNvZGUgPT0gMjcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX29uS2V5VXA6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciBjb2RlID0gZS53aGljaDtcclxuICAgICAgICAgICAgdGhpcy5fdW5SZWdpc3RlcktleShjb2RlKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfb25Ib3RLZXk6IGZ1bmN0aW9uIChlLCBob3RLZXkpIHtcclxuICAgICAgICAgICAgdGhpcy5faGFuZGxlSG90S2V5KGhvdEtleSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX29uTW91c2VFbnRlckNlbGw6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciAkY2VsbCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5kYXRlcGlja2VyLS1jZWxsJyksXHJcbiAgICAgICAgICAgICAgICBkYXRlID0gdGhpcy5fZ2V0RGF0ZUZyb21DZWxsKCRjZWxsKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFByZXZlbnQgZnJvbSB1bm5lY2Vzc2FyeSByZW5kZXJpbmcgYW5kIHNldHRpbmcgbmV3IGN1cnJlbnREYXRlXHJcbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmZvY3VzZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZm9jdXNlZCA9ICcnXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICRjZWxsLmFkZENsYXNzKCctZm9jdXMtJyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmZvY3VzZWQgPSBkYXRlO1xyXG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5yYW5nZSAmJiB0aGlzLnNlbGVjdGVkRGF0ZXMubGVuZ3RoID09IDEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubWluUmFuZ2UgPSB0aGlzLnNlbGVjdGVkRGF0ZXNbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1heFJhbmdlID0gJyc7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZXBpY2tlci5sZXNzKHRoaXMubWluUmFuZ2UsIHRoaXMuZm9jdXNlZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1heFJhbmdlID0gdGhpcy5taW5SYW5nZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1pblJhbmdlID0gJyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdzW3RoaXMuY3VycmVudFZpZXddLl91cGRhdGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9vbk1vdXNlTGVhdmVDZWxsOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB2YXIgJGNlbGwgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcuZGF0ZXBpY2tlci0tY2VsbCcpO1xyXG5cclxuICAgICAgICAgICAgJGNlbGwucmVtb3ZlQ2xhc3MoJy1mb2N1cy0nKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5mb2N1c2VkID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2V0IGZvY3VzZWQodmFsKSB7XHJcbiAgICAgICAgICAgIGlmICghdmFsICYmIHRoaXMuZm9jdXNlZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyICRjZWxsID0gdGhpcy5fZ2V0Q2VsbCh0aGlzLmZvY3VzZWQpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICgkY2VsbC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkY2VsbC5yZW1vdmVDbGFzcygnLWZvY3VzLScpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fZm9jdXNlZCA9IHZhbDtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5yYW5nZSAmJiB0aGlzLnNlbGVjdGVkRGF0ZXMubGVuZ3RoID09IDEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubWluUmFuZ2UgPSB0aGlzLnNlbGVjdGVkRGF0ZXNbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1heFJhbmdlID0gJyc7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZXBpY2tlci5sZXNzKHRoaXMubWluUmFuZ2UsIHRoaXMuX2ZvY3VzZWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXhSYW5nZSA9IHRoaXMubWluUmFuZ2U7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5taW5SYW5nZSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNpbGVudCkgcmV0dXJuO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGUgPSB2YWw7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZ2V0IGZvY3VzZWQoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9mb2N1c2VkO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGdldCBwYXJzZWREYXRlKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKHRoaXMuZGF0ZSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2V0IGRhdGUgKHZhbCkge1xyXG4gICAgICAgICAgICBpZiAoISh2YWwgaW5zdGFuY2VvZiBEYXRlKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50RGF0ZSA9IHZhbDtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmluaXRlZCAmJiAhdGhpcy5zaWxlbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudmlld3NbdGhpcy52aWV3XS5fcmVuZGVyKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5hdi5fcmVuZGVyKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy52aXNpYmxlICYmIHRoaXMuZWxJc0lucHV0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRQb3NpdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB2YWw7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZ2V0IGRhdGUgKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50RGF0ZVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNldCB2aWV3ICh2YWwpIHtcclxuICAgICAgICAgICAgdGhpcy52aWV3SW5kZXggPSB0aGlzLnZpZXdJbmRleGVzLmluZGV4T2YodmFsKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnZpZXdJbmRleCA8IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5wcmV2VmlldyA9IHRoaXMuY3VycmVudFZpZXc7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFZpZXcgPSB2YWw7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5pbml0ZWQpIHtcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy52aWV3c1t2YWxdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3c1t2YWxdID0gbmV3IERhdGVwaWNrZXIuQm9keSh0aGlzLCB2YWwsIHRoaXMub3B0cylcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3c1t2YWxdLl9yZW5kZXIoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdzW3RoaXMucHJldlZpZXddLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudmlld3NbdmFsXS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5hdi5fcmVuZGVyKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5vbkNoYW5nZVZpZXcpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdHMub25DaGFuZ2VWaWV3KHZhbClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmVsSXNJbnB1dCAmJiB0aGlzLnZpc2libGUpIHRoaXMuc2V0UG9zaXRpb24oKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHZhbFxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGdldCB2aWV3KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50VmlldztcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBnZXQgY2VsbFR5cGUoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZpZXcuc3Vic3RyaW5nKDAsIHRoaXMudmlldy5sZW5ndGggLSAxKVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGdldCBtaW5UaW1lKCkge1xyXG4gICAgICAgICAgICB2YXIgbWluID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKHRoaXMubWluRGF0ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZShtaW4ueWVhciwgbWluLm1vbnRoLCBtaW4uZGF0ZSkuZ2V0VGltZSgpXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZ2V0IG1heFRpbWUoKSB7XHJcbiAgICAgICAgICAgIHZhciBtYXggPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUodGhpcy5tYXhEYXRlKTtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKG1heC55ZWFyLCBtYXgubW9udGgsIG1heC5kYXRlKS5nZXRUaW1lKClcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBnZXQgY3VyRGVjYWRlKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZGF0ZXBpY2tlci5nZXREZWNhZGUodGhpcy5kYXRlKVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gIFV0aWxzXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgZGF0ZXBpY2tlci5nZXREYXlzQ291bnQgPSBmdW5jdGlvbiAoZGF0ZSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSArIDEsIDApLmdldERhdGUoKTtcclxuICAgIH07XHJcblxyXG4gICAgZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlID0gZnVuY3Rpb24gKGRhdGUpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB5ZWFyOiBkYXRlLmdldEZ1bGxZZWFyKCksXHJcbiAgICAgICAgICAgIG1vbnRoOiBkYXRlLmdldE1vbnRoKCksXHJcbiAgICAgICAgICAgIGZ1bGxNb250aDogKGRhdGUuZ2V0TW9udGgoKSArIDEpIDwgMTAgPyAnMCcgKyAoZGF0ZS5nZXRNb250aCgpICsgMSkgOiBkYXRlLmdldE1vbnRoKCkgKyAxLCAvLyBPbmUgYmFzZWRcclxuICAgICAgICAgICAgZGF0ZTogZGF0ZS5nZXREYXRlKCksXHJcbiAgICAgICAgICAgIGZ1bGxEYXRlOiBkYXRlLmdldERhdGUoKSA8IDEwID8gJzAnICsgZGF0ZS5nZXREYXRlKCkgOiBkYXRlLmdldERhdGUoKSxcclxuICAgICAgICAgICAgZGF5OiBkYXRlLmdldERheSgpXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBkYXRlcGlja2VyLmdldERlY2FkZSA9IGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgdmFyIGZpcnN0WWVhciA9IE1hdGguZmxvb3IoZGF0ZS5nZXRGdWxsWWVhcigpIC8gMTApICogMTA7XHJcblxyXG4gICAgICAgIHJldHVybiBbZmlyc3RZZWFyLCBmaXJzdFllYXIgKyA5XTtcclxuICAgIH07XHJcblxyXG4gICAgZGF0ZXBpY2tlci50ZW1wbGF0ZSA9IGZ1bmN0aW9uIChzdHIsIGRhdGEpIHtcclxuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UoLyNcXHsoW1xcd10rKVxcfS9nLCBmdW5jdGlvbiAoc291cmNlLCBtYXRjaCkge1xyXG4gICAgICAgICAgICBpZiAoZGF0YVttYXRjaF0gfHwgZGF0YVttYXRjaF0gPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhW21hdGNoXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGRhdGVwaWNrZXIuaXNTYW1lID0gZnVuY3Rpb24gKGRhdGUxLCBkYXRlMiwgdHlwZSkge1xyXG4gICAgICAgIGlmICghZGF0ZTEgfHwgIWRhdGUyKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgdmFyIGQxID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKGRhdGUxKSxcclxuICAgICAgICAgICAgZDIgPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUoZGF0ZTIpLFxyXG4gICAgICAgICAgICBfdHlwZSA9IHR5cGUgPyB0eXBlIDogJ2RheScsXHJcblxyXG4gICAgICAgICAgICBjb25kaXRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgZGF5OiBkMS5kYXRlID09IGQyLmRhdGUgJiYgZDEubW9udGggPT0gZDIubW9udGggJiYgZDEueWVhciA9PSBkMi55ZWFyLFxyXG4gICAgICAgICAgICAgICAgbW9udGg6IGQxLm1vbnRoID09IGQyLm1vbnRoICYmIGQxLnllYXIgPT0gZDIueWVhcixcclxuICAgICAgICAgICAgICAgIHllYXI6IGQxLnllYXIgPT0gZDIueWVhclxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4gY29uZGl0aW9uc1tfdHlwZV07XHJcbiAgICB9O1xyXG5cclxuICAgIGRhdGVwaWNrZXIubGVzcyA9IGZ1bmN0aW9uIChkYXRlQ29tcGFyZVRvLCBkYXRlLCB0eXBlKSB7XHJcbiAgICAgICAgaWYgKCFkYXRlQ29tcGFyZVRvIHx8ICFkYXRlKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIGRhdGUuZ2V0VGltZSgpIDwgZGF0ZUNvbXBhcmVUby5nZXRUaW1lKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGRhdGVwaWNrZXIuYmlnZ2VyID0gZnVuY3Rpb24gKGRhdGVDb21wYXJlVG8sIGRhdGUsIHR5cGUpIHtcclxuICAgICAgICBpZiAoIWRhdGVDb21wYXJlVG8gfHwgIWRhdGUpIHJldHVybiBmYWxzZTtcclxuICAgICAgICByZXR1cm4gZGF0ZS5nZXRUaW1lKCkgPiBkYXRlQ29tcGFyZVRvLmdldFRpbWUoKTtcclxuICAgIH07XHJcblxyXG4gICAgRGF0ZXBpY2tlci5sYW5ndWFnZSA9IHtcclxuICAgICAgICBydToge1xyXG4gICAgICAgICAgICBkYXlzOiBbJ9CS0L7RgdC60YDQtdGB0LXQvdGM0LUnLCAn0J/QvtC90LXQtNC10LvRjNC90LjQuicsICfQktGC0L7RgNC90LjQuicsICfQodGA0LXQtNCwJywgJ9Cn0LXRgtCy0LXRgNCzJywgJ9Cf0Y/RgtC90LjRhtCwJywgJ9Ch0YPQsdCx0L7RgtCwJ10sXHJcbiAgICAgICAgICAgIGRheXNTaG9ydDogWyfQktC+0YEnLCfQn9C+0L0nLCfQktGC0L4nLCfQodGA0LUnLCfQp9C10YInLCfQn9GP0YInLCfQodGD0LEnXSxcclxuICAgICAgICAgICAgZGF5c01pbjogWyfQktGBJywn0J/QvScsJ9CS0YInLCfQodGAJywn0KfRgicsJ9Cf0YInLCfQodCxJ10sXHJcbiAgICAgICAgICAgIG1vbnRoczogWyfQr9C90LLQsNGA0YwnLCAn0KTQtdCy0YDQsNC70YwnLCAn0JzQsNGA0YInLCAn0JDQv9GA0LXQu9GMJywgJ9Cc0LDQuScsICfQmNGO0L3RjCcsICfQmNGO0LvRjCcsICfQkNCy0LPRg9GB0YInLCAn0KHQtdC90YLRj9Cx0YDRjCcsICfQntC60YLRj9Cx0YDRjCcsICfQndC+0Y/QsdGA0YwnLCAn0JTQtdC60LDQsdGA0YwnXSxcclxuICAgICAgICAgICAgbW9udGhzU2hvcnQ6IFsn0K/QvdCyJywgJ9Ck0LXQsicsICfQnNCw0YAnLCAn0JDQv9GAJywgJ9Cc0LDQuScsICfQmNGO0L0nLCAn0JjRjtC7JywgJ9CQ0LLQsycsICfQodC10L0nLCAn0J7QutGCJywgJ9Cd0L7RjycsICfQlNC10LonXSxcclxuICAgICAgICAgICAgdG9kYXk6ICfQodC10LPQvtC00L3RjycsXHJcbiAgICAgICAgICAgIGNsZWFyOiAn0J7Rh9C40YHRgtC40YLRjCcsXHJcbiAgICAgICAgICAgIGRhdGVGb3JtYXQ6ICdkZC5tbS55eXl5JyxcclxuICAgICAgICAgICAgZmlyc3REYXk6IDFcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgICQuZm5bcGx1Z2luTmFtZV0gPSBmdW5jdGlvbiAoIG9wdGlvbnMgKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghJC5kYXRhKHRoaXMsIHBsdWdpbk5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAkLmRhdGEodGhpcywgIHBsdWdpbk5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IERhdGVwaWNrZXIoIHRoaXMsIG9wdGlvbnMgKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSAkLmRhdGEodGhpcywgcGx1Z2luTmFtZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgX3RoaXMub3B0cyA9ICQuZXh0ZW5kKHRydWUsIF90aGlzLm9wdHMsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgJChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJChhdXRvSW5pdFNlbGVjdG9yKS5kYXRlcGlja2VyKCk7XHJcbiAgICB9KVxyXG5cclxufSkod2luZG93LCBqUXVlcnkpO1xyXG47KGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciB0ZW1wbGF0ZXMgPSB7XHJcbiAgICAgICAgZGF5czonJyArXHJcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1kYXlzIGRhdGVwaWNrZXItLWJvZHlcIj4nICtcclxuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLWRheXMtbmFtZXNcIj48L2Rpdj4nICtcclxuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLWNlbGxzIGRhdGVwaWNrZXItLWNlbGxzLWRheXNcIj48L2Rpdj4nICtcclxuICAgICAgICAnPC9kaXY+JyxcclxuICAgICAgICBtb250aHM6ICcnICtcclxuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLW1vbnRocyBkYXRlcGlja2VyLS1ib2R5XCI+JyArXHJcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1jZWxscyBkYXRlcGlja2VyLS1jZWxscy1tb250aHNcIj48L2Rpdj4nICtcclxuICAgICAgICAnPC9kaXY+JyxcclxuICAgICAgICB5ZWFyczogJycgK1xyXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0teWVhcnMgZGF0ZXBpY2tlci0tYm9keVwiPicgK1xyXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tY2VsbHMgZGF0ZXBpY2tlci0tY2VsbHMteWVhcnNcIj48L2Rpdj4nICtcclxuICAgICAgICAnPC9kaXY+J1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgRCA9IERhdGVwaWNrZXI7XHJcblxyXG4gICAgRC5Cb2R5ID0gZnVuY3Rpb24gKGQsIHR5cGUsIG9wdHMpIHtcclxuICAgICAgICB0aGlzLmQgPSBkO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XHJcbiAgICAgICAgdGhpcy5vcHRzID0gb3B0cztcclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICB9O1xyXG5cclxuICAgIEQuQm9keS5wcm90b3R5cGUgPSB7XHJcbiAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9idWlsZEJhc2VIdG1sKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcigpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fYmluZEV2ZW50cygpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9iaW5kRXZlbnRzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLm9uKCdjbGljaycsICcuZGF0ZXBpY2tlci0tY2VsbCcsICQucHJveHkodGhpcy5fb25DbGlja0NlbGwsIHRoaXMpKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfYnVpbGRCYXNlSHRtbDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRlbCA9ICQodGVtcGxhdGVzW3RoaXMudHlwZV0pLmFwcGVuZFRvKHRoaXMuZC4kY29udGVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuJG5hbWVzID0gJCgnLmRhdGVwaWNrZXItLWRheXMtbmFtZXMnLCB0aGlzLiRlbCk7XHJcbiAgICAgICAgICAgIHRoaXMuJGNlbGxzID0gJCgnLmRhdGVwaWNrZXItLWNlbGxzJywgdGhpcy4kZWwpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9nZXREYXlOYW1lc0h0bWw6IGZ1bmN0aW9uIChmaXJzdERheSwgY3VyRGF5LCBodG1sLCBpKSB7XHJcbiAgICAgICAgICAgIGN1ckRheSA9IGN1ckRheSAhPSB1bmRlZmluZWQgPyBjdXJEYXkgOiBmaXJzdERheTtcclxuICAgICAgICAgICAgaHRtbCA9IGh0bWwgPyBodG1sIDogJyc7XHJcbiAgICAgICAgICAgIGkgPSBpICE9IHVuZGVmaW5lZCA/IGkgOiAwO1xyXG5cclxuICAgICAgICAgICAgaWYgKGkgPiA3KSByZXR1cm4gaHRtbDtcclxuICAgICAgICAgICAgaWYgKGN1ckRheSA9PSA3KSByZXR1cm4gdGhpcy5fZ2V0RGF5TmFtZXNIdG1sKGZpcnN0RGF5LCAwLCBodG1sLCArK2kpO1xyXG5cclxuICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLWRheS1uYW1lJyArICh0aGlzLmQuaXNXZWVrZW5kKGN1ckRheSkgPyBcIiAtd2Vla2VuZC1cIiA6IFwiXCIpICsgJ1wiPicgKyB0aGlzLmQubG9jLmRheXNNaW5bY3VyRGF5XSArICc8L2Rpdj4nO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dldERheU5hbWVzSHRtbChmaXJzdERheSwgKytjdXJEYXksIGh0bWwsICsraSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2dldENlbGxDb250ZW50czogZnVuY3Rpb24gKGRhdGUsIHR5cGUpIHtcclxuICAgICAgICAgICAgdmFyIGNsYXNzZXMgPSBcImRhdGVwaWNrZXItLWNlbGwgZGF0ZXBpY2tlci0tY2VsbC1cIiArIHR5cGUsXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RGF0ZSA9IG5ldyBEYXRlKCksXHJcbiAgICAgICAgICAgICAgICBwYXJlbnQgPSB0aGlzLmQsXHJcbiAgICAgICAgICAgICAgICBvcHRzID0gcGFyZW50Lm9wdHMsXHJcbiAgICAgICAgICAgICAgICBkID0gRC5nZXRQYXJzZWREYXRlKGRhdGUpLFxyXG4gICAgICAgICAgICAgICAgcmVuZGVyID0ge30sXHJcbiAgICAgICAgICAgICAgICBodG1sID0gZC5kYXRlO1xyXG5cclxuICAgICAgICAgICAgaWYgKG9wdHMub25SZW5kZXJDZWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZW5kZXIgPSBvcHRzLm9uUmVuZGVyQ2VsbChkYXRlLCB0eXBlKSB8fCB7fTtcclxuICAgICAgICAgICAgICAgIGh0bWwgPSByZW5kZXIuaHRtbCA/IHJlbmRlci5odG1sIDogaHRtbDtcclxuICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gcmVuZGVyLmNsYXNzZXMgPyAnICcgKyByZW5kZXIuY2xhc3NlcyA6ICcnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2RheSc6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmVudC5pc1dlZWtlbmQoZC5kYXkpKSBjbGFzc2VzICs9IFwiIC13ZWVrZW5kLVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkLm1vbnRoICE9IHRoaXMuZC5wYXJzZWREYXRlLm1vbnRoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gXCIgLW90aGVyLW1vbnRoLVwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW9wdHMuc2VsZWN0T3RoZXJNb250aHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gXCIgLWRpc2FibGVkLVwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghb3B0cy5zaG93T3RoZXJNb250aHMpIGh0bWwgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdtb250aCc6XHJcbiAgICAgICAgICAgICAgICAgICAgaHRtbCA9IHBhcmVudC5sb2NbcGFyZW50Lm9wdHMubW9udGhzRmllbGRdW2QubW9udGhdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAneWVhcic6XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRlY2FkZSA9IHBhcmVudC5jdXJEZWNhZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgaHRtbCA9IGQueWVhcjtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZC55ZWFyIDwgZGVjYWRlWzBdIHx8IGQueWVhciA+IGRlY2FkZVsxXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzICs9ICcgLW90aGVyLWRlY2FkZS0nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW9wdHMuc2VsZWN0T3RoZXJZZWFycykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NlcyArPSBcIiAtZGlzYWJsZWQtXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFvcHRzLnNob3dPdGhlclllYXJzKSBodG1sID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAob3B0cy5vblJlbmRlckNlbGwpIHtcclxuICAgICAgICAgICAgICAgIHJlbmRlciA9IG9wdHMub25SZW5kZXJDZWxsKGRhdGUsIHR5cGUpIHx8IHt9O1xyXG4gICAgICAgICAgICAgICAgaHRtbCA9IHJlbmRlci5odG1sID8gcmVuZGVyLmh0bWwgOiBodG1sO1xyXG4gICAgICAgICAgICAgICAgY2xhc3NlcyArPSByZW5kZXIuY2xhc3NlcyA/ICcgJyArIHJlbmRlci5jbGFzc2VzIDogJyc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChvcHRzLnJhbmdlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoRC5pc1NhbWUocGFyZW50Lm1pblJhbmdlLCBkYXRlLCB0eXBlKSkgY2xhc3NlcyArPSAnIC1yYW5nZS1mcm9tLSc7XHJcbiAgICAgICAgICAgICAgICBpZiAoRC5pc1NhbWUocGFyZW50Lm1heFJhbmdlLCBkYXRlLCB0eXBlKSkgY2xhc3NlcyArPSAnIC1yYW5nZS10by0nO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwYXJlbnQuc2VsZWN0ZWREYXRlcy5sZW5ndGggPT0gMSAmJiBwYXJlbnQuZm9jdXNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgKEQuYmlnZ2VyKHBhcmVudC5taW5SYW5nZSwgZGF0ZSkgJiYgRC5sZXNzKHBhcmVudC5mb2N1c2VkLCBkYXRlKSkgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgKEQubGVzcyhwYXJlbnQubWF4UmFuZ2UsIGRhdGUpICYmIEQuYmlnZ2VyKHBhcmVudC5mb2N1c2VkLCBkYXRlKSkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzICs9ICcgLWluLXJhbmdlLSdcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChELmxlc3MocGFyZW50Lm1heFJhbmdlLCBkYXRlKSAmJiBELmlzU2FtZShwYXJlbnQuZm9jdXNlZCwgZGF0ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NlcyArPSAnIC1yYW5nZS1mcm9tLSdcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKEQuYmlnZ2VyKHBhcmVudC5taW5SYW5nZSwgZGF0ZSkgJiYgRC5pc1NhbWUocGFyZW50LmZvY3VzZWQsIGRhdGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gJyAtcmFuZ2UtdG8tJ1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhcmVudC5zZWxlY3RlZERhdGVzLmxlbmd0aCA9PSAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKEQuYmlnZ2VyKHBhcmVudC5taW5SYW5nZSwgZGF0ZSkgJiYgRC5sZXNzKHBhcmVudC5tYXhSYW5nZSwgZGF0ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NlcyArPSAnIC1pbi1yYW5nZS0nXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKEQuaXNTYW1lKGN1cnJlbnREYXRlLCBkYXRlLCB0eXBlKSkgY2xhc3NlcyArPSAnIC1jdXJyZW50LSc7XHJcbiAgICAgICAgICAgIGlmIChwYXJlbnQuZm9jdXNlZCAmJiBELmlzU2FtZShkYXRlLCBwYXJlbnQuZm9jdXNlZCwgdHlwZSkpIGNsYXNzZXMgKz0gJyAtZm9jdXMtJztcclxuICAgICAgICAgICAgaWYgKHBhcmVudC5faXNTZWxlY3RlZChkYXRlLCB0eXBlKSkgY2xhc3NlcyArPSAnIC1zZWxlY3RlZC0nO1xyXG4gICAgICAgICAgICBpZiAoIXBhcmVudC5faXNJblJhbmdlKGRhdGUsIHR5cGUpIHx8IHJlbmRlci5kaXNhYmxlZCkgY2xhc3NlcyArPSAnIC1kaXNhYmxlZC0nO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGh0bWw6IGh0bWwsXHJcbiAgICAgICAgICAgICAgICBjbGFzc2VzOiBjbGFzc2VzXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDYWxjdWxhdGVzIGRheXMgbnVtYmVyIHRvIHJlbmRlci4gR2VuZXJhdGVzIGRheXMgaHRtbCBhbmQgcmV0dXJucyBpdC5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gZGF0ZSAtIERhdGUgb2JqZWN0XHJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIF9nZXREYXlzSHRtbDogZnVuY3Rpb24gKGRhdGUpIHtcclxuICAgICAgICAgICAgdmFyIHRvdGFsTW9udGhEYXlzID0gRC5nZXREYXlzQ291bnQoZGF0ZSksXHJcbiAgICAgICAgICAgICAgICBmaXJzdE1vbnRoRGF5ID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIDEpLmdldERheSgpLFxyXG4gICAgICAgICAgICAgICAgbGFzdE1vbnRoRGF5ID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIHRvdGFsTW9udGhEYXlzKS5nZXREYXkoKSxcclxuICAgICAgICAgICAgICAgIGRheXNGcm9tUGV2TW9udGggPSBmaXJzdE1vbnRoRGF5IC0gdGhpcy5kLmxvYy5maXJzdERheSxcclxuICAgICAgICAgICAgICAgIGRheXNGcm9tTmV4dE1vbnRoID0gNiAtIGxhc3RNb250aERheSArIHRoaXMuZC5sb2MuZmlyc3REYXk7XHJcblxyXG4gICAgICAgICAgICBkYXlzRnJvbVBldk1vbnRoID0gZGF5c0Zyb21QZXZNb250aCA8IDAgPyBkYXlzRnJvbVBldk1vbnRoICsgNyA6IGRheXNGcm9tUGV2TW9udGg7XHJcbiAgICAgICAgICAgIGRheXNGcm9tTmV4dE1vbnRoID0gZGF5c0Zyb21OZXh0TW9udGggPiA2ID8gZGF5c0Zyb21OZXh0TW9udGggLSA3IDogZGF5c0Zyb21OZXh0TW9udGg7XHJcblxyXG4gICAgICAgICAgICB2YXIgc3RhcnREYXlJbmRleCA9IC1kYXlzRnJvbVBldk1vbnRoICsgMSxcclxuICAgICAgICAgICAgICAgIG0sIHksXHJcbiAgICAgICAgICAgICAgICBodG1sID0gJyc7XHJcblxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gc3RhcnREYXlJbmRleCwgbWF4ID0gdG90YWxNb250aERheXMgKyBkYXlzRnJvbU5leHRNb250aDsgaSA8PSBtYXg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgeSA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcclxuICAgICAgICAgICAgICAgIG0gPSBkYXRlLmdldE1vbnRoKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaHRtbCArPSB0aGlzLl9nZXREYXlIdG1sKG5ldyBEYXRlKHksIG0sIGkpKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gaHRtbDtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfZ2V0RGF5SHRtbDogZnVuY3Rpb24gKGRhdGUpIHtcclxuICAgICAgICAgICB2YXIgY29udGVudCA9IHRoaXMuX2dldENlbGxDb250ZW50cyhkYXRlLCAnZGF5Jyk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCInICsgY29udGVudC5jbGFzc2VzICsgJ1wiICcgK1xyXG4gICAgICAgICAgICAgICAgJ2RhdGEtZGF0ZT1cIicgKyBkYXRlLmdldERhdGUoKSArICdcIiAnICtcclxuICAgICAgICAgICAgICAgICdkYXRhLW1vbnRoPVwiJyArIGRhdGUuZ2V0TW9udGgoKSArICdcIiAnICtcclxuICAgICAgICAgICAgICAgICdkYXRhLXllYXI9XCInICsgZGF0ZS5nZXRGdWxsWWVhcigpICsgJ1wiPicgKyBjb250ZW50Lmh0bWwgKyAnPC9kaXY+JztcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHZW5lcmF0ZXMgbW9udGhzIGh0bWxcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gZGF0ZSAtIGRhdGUgaW5zdGFuY2VcclxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgX2dldE1vbnRoc0h0bWw6IGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgICAgIHZhciBodG1sID0gJycsXHJcbiAgICAgICAgICAgICAgICBkID0gRC5nZXRQYXJzZWREYXRlKGRhdGUpLFxyXG4gICAgICAgICAgICAgICAgaSA9IDA7XHJcblxyXG4gICAgICAgICAgICB3aGlsZShpIDwgMTIpIHtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gdGhpcy5fZ2V0TW9udGhIdG1sKG5ldyBEYXRlKGQueWVhciwgaSkpO1xyXG4gICAgICAgICAgICAgICAgaSsrXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBodG1sO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9nZXRNb250aEh0bWw6IGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gdGhpcy5fZ2V0Q2VsbENvbnRlbnRzKGRhdGUsICdtb250aCcpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiJyArIGNvbnRlbnQuY2xhc3NlcyArICdcIiBkYXRhLW1vbnRoPVwiJyArIGRhdGUuZ2V0TW9udGgoKSArICdcIj4nICsgY29udGVudC5odG1sICsgJzwvZGl2PidcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfZ2V0WWVhcnNIdG1sOiBmdW5jdGlvbiAoZGF0ZSkge1xyXG4gICAgICAgICAgICB2YXIgZCA9IEQuZ2V0UGFyc2VkRGF0ZShkYXRlKSxcclxuICAgICAgICAgICAgICAgIGRlY2FkZSA9IEQuZ2V0RGVjYWRlKGRhdGUpLFxyXG4gICAgICAgICAgICAgICAgZmlyc3RZZWFyID0gZGVjYWRlWzBdIC0gMSxcclxuICAgICAgICAgICAgICAgIGh0bWwgPSAnJyxcclxuICAgICAgICAgICAgICAgIGkgPSBmaXJzdFllYXI7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGk7IGkgPD0gZGVjYWRlWzFdICsgMTsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IHRoaXMuX2dldFllYXJIdG1sKG5ldyBEYXRlKGkgLCAwKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBodG1sO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9nZXRZZWFySHRtbDogZnVuY3Rpb24gKGRhdGUpIHtcclxuICAgICAgICAgICAgdmFyIGNvbnRlbnQgPSB0aGlzLl9nZXRDZWxsQ29udGVudHMoZGF0ZSwgJ3llYXInKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cIicgKyBjb250ZW50LmNsYXNzZXMgKyAnXCIgZGF0YS15ZWFyPVwiJyArIGRhdGUuZ2V0RnVsbFllYXIoKSArICdcIj4nICsgY29udGVudC5odG1sICsgJzwvZGl2PidcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfcmVuZGVyVHlwZXM6IHtcclxuICAgICAgICAgICAgZGF5czogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRheU5hbWVzID0gdGhpcy5fZ2V0RGF5TmFtZXNIdG1sKHRoaXMuZC5sb2MuZmlyc3REYXkpLFxyXG4gICAgICAgICAgICAgICAgICAgIGRheXMgPSB0aGlzLl9nZXREYXlzSHRtbCh0aGlzLmQuY3VycmVudERhdGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuJGNlbGxzLmh0bWwoZGF5cyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRuYW1lcy5odG1sKGRheU5hbWVzKVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBtb250aHM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBodG1sID0gdGhpcy5fZ2V0TW9udGhzSHRtbCh0aGlzLmQuY3VycmVudERhdGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuJGNlbGxzLmh0bWwoaHRtbClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgeWVhcnM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBodG1sID0gdGhpcy5fZ2V0WWVhcnNIdG1sKHRoaXMuZC5jdXJyZW50RGF0ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy4kY2VsbHMuaHRtbChodG1sKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX3JlbmRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJUeXBlc1t0aGlzLnR5cGVdLmJpbmQodGhpcykoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfdXBkYXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciAkY2VsbHMgPSAkKCcuZGF0ZXBpY2tlci0tY2VsbCcsIHRoaXMuJGNlbGxzKSxcclxuICAgICAgICAgICAgICAgIF90aGlzID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIGNsYXNzZXMsXHJcbiAgICAgICAgICAgICAgICAkY2VsbCxcclxuICAgICAgICAgICAgICAgIGRhdGU7XHJcbiAgICAgICAgICAgICRjZWxscy5lYWNoKGZ1bmN0aW9uIChjZWxsLCBpKSB7XHJcbiAgICAgICAgICAgICAgICAkY2VsbCA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgICAgICBkYXRlID0gX3RoaXMuZC5fZ2V0RGF0ZUZyb21DZWxsKCQodGhpcykpO1xyXG4gICAgICAgICAgICAgICAgY2xhc3NlcyA9IF90aGlzLl9nZXRDZWxsQ29udGVudHMoZGF0ZSwgX3RoaXMuZC5jZWxsVHlwZSk7XHJcbiAgICAgICAgICAgICAgICAkY2VsbC5hdHRyKCdjbGFzcycsY2xhc3Nlcy5jbGFzc2VzKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzaG93OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgdGhpcy5hY2l0dmUgPSB0cnVlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGhpZGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy4kZWwucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIC8vICBFdmVudHNcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgIF9oYW5kbGVDbGljazogZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRlID0gZWwuZGF0YSgnZGF0ZScpIHx8IDEsXHJcbiAgICAgICAgICAgICAgICBtb250aCA9IGVsLmRhdGEoJ21vbnRoJykgfHwgMCxcclxuICAgICAgICAgICAgICAgIHllYXIgPSBlbC5kYXRhKCd5ZWFyJykgfHwgdGhpcy5kLnBhcnNlZERhdGUueWVhcjtcclxuICAgICAgICAgICAgLy8gQ2hhbmdlIHZpZXcgaWYgbWluIHZpZXcgZG9lcyBub3QgcmVhY2ggeWV0XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmQudmlldyAhPSB0aGlzLm9wdHMubWluVmlldykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kLmRvd24obmV3IERhdGUoeWVhciwgbW9udGgsIGRhdGUpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBTZWxlY3QgZGF0ZSBpZiBtaW4gdmlldyBpcyByZWFjaGVkXHJcbiAgICAgICAgICAgIHZhciBzZWxlY3RlZERhdGUgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgZGF0ZSksXHJcbiAgICAgICAgICAgICAgICBhbHJlYWR5U2VsZWN0ZWQgPSB0aGlzLmQuX2lzU2VsZWN0ZWQoc2VsZWN0ZWREYXRlLCB0aGlzLmQuY2VsbFR5cGUpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFhbHJlYWR5U2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZC5zZWxlY3REYXRlKHNlbGVjdGVkRGF0ZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWxyZWFkeVNlbGVjdGVkICYmIHRoaXMub3B0cy50b2dnbGVTZWxlY3RlZCl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmQucmVtb3ZlRGF0ZShzZWxlY3RlZERhdGUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9vbkNsaWNrQ2VsbDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdmFyICRlbCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5kYXRlcGlja2VyLS1jZWxsJyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoJGVsLmhhc0NsYXNzKCctZGlzYWJsZWQtJykpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZUNsaWNrLmJpbmQodGhpcykoJGVsKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KSgpO1xyXG5cclxuOyhmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgdGVtcGxhdGUgPSAnJyArXHJcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1uYXYtYWN0aW9uXCIgZGF0YS1hY3Rpb249XCJwcmV2XCI+I3twcmV2SHRtbH08L2Rpdj4nICtcclxuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLW5hdi10aXRsZVwiPiN7dGl0bGV9PC9kaXY+JyArXHJcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1uYXYtYWN0aW9uXCIgZGF0YS1hY3Rpb249XCJuZXh0XCI+I3tuZXh0SHRtbH08L2Rpdj4nLFxyXG4gICAgICAgIGJ1dHRvbnNDb250YWluZXJUZW1wbGF0ZSA9ICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tYnV0dG9uc1wiPjwvZGl2PicsXHJcbiAgICAgICAgYnV0dG9uID0gJzxzcGFuIGNsYXNzPVwiZGF0ZXBpY2tlci0tYnV0dG9uXCIgZGF0YS1hY3Rpb249XCIje2FjdGlvbn1cIj4je2xhYmVsfTwvc3Bhbj4nO1xyXG5cclxuICAgIERhdGVwaWNrZXIuTmF2aWdhdGlvbiA9IGZ1bmN0aW9uIChkLCBvcHRzKSB7XHJcbiAgICAgICAgdGhpcy5kID0gZDtcclxuICAgICAgICB0aGlzLm9wdHMgPSBvcHRzO1xyXG5cclxuICAgICAgICB0aGlzLiRidXR0b25zQ29udGFpbmVyID0gJyc7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfTtcclxuXHJcbiAgICBEYXRlcGlja2VyLk5hdmlnYXRpb24ucHJvdG90eXBlID0ge1xyXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5fYnVpbGRCYXNlSHRtbCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9iaW5kRXZlbnRzKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2JpbmRFdmVudHM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5kLiRuYXYub24oJ2NsaWNrJywgJy5kYXRlcGlja2VyLS1uYXYtYWN0aW9uJywgJC5wcm94eSh0aGlzLl9vbkNsaWNrTmF2QnV0dG9uLCB0aGlzKSk7XHJcbiAgICAgICAgICAgIHRoaXMuZC4kbmF2Lm9uKCdjbGljaycsICcuZGF0ZXBpY2tlci0tbmF2LXRpdGxlJywgJC5wcm94eSh0aGlzLl9vbkNsaWNrTmF2VGl0bGUsIHRoaXMpKTtcclxuICAgICAgICAgICAgdGhpcy5kLiRkYXRlcGlja2VyLm9uKCdjbGljaycsICcuZGF0ZXBpY2tlci0tYnV0dG9uJywgJC5wcm94eSh0aGlzLl9vbkNsaWNrTmF2QnV0dG9uLCB0aGlzKSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2J1aWxkQmFzZUh0bWw6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVuZGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2FkZEJ1dHRvbnNJZk5lZWQoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfYWRkQnV0dG9uc0lmTmVlZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLnRvZGF5QnV0dG9uKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRCdXR0b24oJ3RvZGF5JylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLmNsZWFyQnV0dG9uKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRCdXR0b24oJ2NsZWFyJylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9yZW5kZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRpdGxlID0gdGhpcy5fZ2V0VGl0bGUodGhpcy5kLmN1cnJlbnREYXRlKSxcclxuICAgICAgICAgICAgICAgIGh0bWwgPSBEYXRlcGlja2VyLnRlbXBsYXRlKHRlbXBsYXRlLCAkLmV4dGVuZCh7dGl0bGU6IHRpdGxlfSwgdGhpcy5vcHRzKSk7XHJcbiAgICAgICAgICAgIHRoaXMuZC4kbmF2Lmh0bWwoaHRtbCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmQudmlldyA9PSAneWVhcnMnKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuZGF0ZXBpY2tlci0tbmF2LXRpdGxlJywgdGhpcy5kLiRuYXYpLmFkZENsYXNzKCctZGlzYWJsZWQtJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5zZXROYXZTdGF0dXMoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfZ2V0VGl0bGU6IGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmQuZm9ybWF0RGF0ZSh0aGlzLm9wdHMubmF2VGl0bGVzW3RoaXMuZC52aWV3XSwgZGF0ZSlcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfYWRkQnV0dG9uOiBmdW5jdGlvbiAodHlwZSkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuJGJ1dHRvbnNDb250YWluZXIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRCdXR0b25zQ29udGFpbmVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogdHlwZSxcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogdGhpcy5kLmxvY1t0eXBlXVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGh0bWwgPSBEYXRlcGlja2VyLnRlbXBsYXRlKGJ1dHRvbiwgZGF0YSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoJCgnW2RhdGEtYWN0aW9uPScgKyB0eXBlICsgJ10nLCB0aGlzLiRidXR0b25zQ29udGFpbmVyKS5sZW5ndGgpIHJldHVybjtcclxuICAgICAgICAgICAgdGhpcy4kYnV0dG9uc0NvbnRhaW5lci5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX2FkZEJ1dHRvbnNDb250YWluZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5kLiRkYXRlcGlja2VyLmFwcGVuZChidXR0b25zQ29udGFpbmVyVGVtcGxhdGUpO1xyXG4gICAgICAgICAgICB0aGlzLiRidXR0b25zQ29udGFpbmVyID0gJCgnLmRhdGVwaWNrZXItLWJ1dHRvbnMnLCB0aGlzLmQuJGRhdGVwaWNrZXIpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNldE5hdlN0YXR1czogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoISh0aGlzLm9wdHMubWluRGF0ZSB8fCB0aGlzLm9wdHMubWF4RGF0ZSkgfHwgIXRoaXMub3B0cy5kaXNhYmxlTmF2V2hlbk91dE9mUmFuZ2UpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHZhciBkYXRlID0gdGhpcy5kLnBhcnNlZERhdGUsXHJcbiAgICAgICAgICAgICAgICBtID0gZGF0ZS5tb250aCxcclxuICAgICAgICAgICAgICAgIHkgPSBkYXRlLnllYXIsXHJcbiAgICAgICAgICAgICAgICBkID0gZGF0ZS5kYXRlO1xyXG5cclxuICAgICAgICAgICAgc3dpdGNoICh0aGlzLmQudmlldykge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZGF5cyc6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmQuX2lzSW5SYW5nZShuZXcgRGF0ZSh5LCBtLTEsIGQpLCAnbW9udGgnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlTmF2KCdwcmV2JylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmQuX2lzSW5SYW5nZShuZXcgRGF0ZSh5LCBtKzEsIGQpLCAnbW9udGgnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlTmF2KCduZXh0JylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdtb250aHMnOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5kLl9pc0luUmFuZ2UobmV3IERhdGUoeS0xLCBtLCBkKSwgJ3llYXInKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlTmF2KCdwcmV2JylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmQuX2lzSW5SYW5nZShuZXcgRGF0ZSh5KzEsIG0sIGQpLCAneWVhcicpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVOYXYoJ25leHQnKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3llYXJzJzpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZC5faXNJblJhbmdlKG5ldyBEYXRlKHktMTAsIG0sIGQpLCAneWVhcicpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVOYXYoJ3ByZXYnKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZC5faXNJblJhbmdlKG5ldyBEYXRlKHkrMTAsIG0sIGQpLCAneWVhcicpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVOYXYoJ25leHQnKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9kaXNhYmxlTmF2OiBmdW5jdGlvbiAobmF2KSB7XHJcbiAgICAgICAgICAgICQoJ1tkYXRhLWFjdGlvbj1cIicgKyBuYXYgKyAnXCJdJywgdGhpcy5kLiRuYXYpLmFkZENsYXNzKCctZGlzYWJsZWQtJylcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfYWN0aXZhdGVOYXY6IGZ1bmN0aW9uIChuYXYpIHtcclxuICAgICAgICAgICAgJCgnW2RhdGEtYWN0aW9uPVwiJyArIG5hdiArICdcIl0nLCB0aGlzLmQuJG5hdikucmVtb3ZlQ2xhc3MoJy1kaXNhYmxlZC0nKVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9vbkNsaWNrTmF2QnV0dG9uOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB2YXIgJGVsID0gJChlLnRhcmdldCkuY2xvc2VzdCgnW2RhdGEtYWN0aW9uXScpLFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uID0gJGVsLmRhdGEoJ2FjdGlvbicpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5kW2FjdGlvbl0oKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfb25DbGlja05hdlRpdGxlOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBpZiAoJChlLnRhcmdldCkuaGFzQ2xhc3MoJy1kaXNhYmxlZC0nKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuZC52aWV3ID09ICdkYXlzJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZC52aWV3ID0gJ21vbnRocydcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5kLnZpZXcgPSAneWVhcnMnO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0pKCk7XHJcbiIsIiFmdW5jdGlvbihhLGIpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW1wianF1ZXJ5XCJdLGIpOlwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP21vZHVsZS5leHBvcnRzPWIocmVxdWlyZShcImpxdWVyeVwiKSk6YihhLmpRdWVyeSl9KHRoaXMsZnVuY3Rpb24oYSl7XCJmdW5jdGlvblwiIT10eXBlb2YgT2JqZWN0LmNyZWF0ZSYmKE9iamVjdC5jcmVhdGU9ZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYigpe31yZXR1cm4gYi5wcm90b3R5cGU9YSxuZXcgYn0pO3ZhciBiPXtpbml0OmZ1bmN0aW9uKGIpe3JldHVybiB0aGlzLm9wdGlvbnM9YS5leHRlbmQoe30sYS5ub3R5LmRlZmF1bHRzLGIpLHRoaXMub3B0aW9ucy5sYXlvdXQ9dGhpcy5vcHRpb25zLmN1c3RvbT9hLm5vdHkubGF5b3V0cy5pbmxpbmU6YS5ub3R5LmxheW91dHNbdGhpcy5vcHRpb25zLmxheW91dF0sYS5ub3R5LnRoZW1lc1t0aGlzLm9wdGlvbnMudGhlbWVdP3RoaXMub3B0aW9ucy50aGVtZT1hLm5vdHkudGhlbWVzW3RoaXMub3B0aW9ucy50aGVtZV06dGhpcy5vcHRpb25zLnRoZW1lQ2xhc3NOYW1lPXRoaXMub3B0aW9ucy50aGVtZSx0aGlzLm9wdGlvbnM9YS5leHRlbmQoe30sdGhpcy5vcHRpb25zLHRoaXMub3B0aW9ucy5sYXlvdXQub3B0aW9ucyksdGhpcy5vcHRpb25zLmlkPVwibm90eV9cIisobmV3IERhdGUpLmdldFRpbWUoKSpNYXRoLmZsb29yKDFlNipNYXRoLnJhbmRvbSgpKSx0aGlzLl9idWlsZCgpLHRoaXN9LF9idWlsZDpmdW5jdGlvbigpe3ZhciBiPWEoJzxkaXYgY2xhc3M9XCJub3R5X2JhciBub3R5X3R5cGVfJyt0aGlzLm9wdGlvbnMudHlwZSsnXCI+PC9kaXY+JykuYXR0cihcImlkXCIsdGhpcy5vcHRpb25zLmlkKTtpZihiLmFwcGVuZCh0aGlzLm9wdGlvbnMudGVtcGxhdGUpLmZpbmQoXCIubm90eV90ZXh0XCIpLmh0bWwodGhpcy5vcHRpb25zLnRleHQpLHRoaXMuJGJhcj1udWxsIT09dGhpcy5vcHRpb25zLmxheW91dC5wYXJlbnQub2JqZWN0P2EodGhpcy5vcHRpb25zLmxheW91dC5wYXJlbnQub2JqZWN0KS5jc3ModGhpcy5vcHRpb25zLmxheW91dC5wYXJlbnQuY3NzKS5hcHBlbmQoYik6Yix0aGlzLm9wdGlvbnMudGhlbWVDbGFzc05hbWUmJnRoaXMuJGJhci5hZGRDbGFzcyh0aGlzLm9wdGlvbnMudGhlbWVDbGFzc05hbWUpLmFkZENsYXNzKFwibm90eV9jb250YWluZXJfdHlwZV9cIit0aGlzLm9wdGlvbnMudHlwZSksdGhpcy5vcHRpb25zLmJ1dHRvbnMpe3RoaXMub3B0aW9ucy5jbG9zZVdpdGg9W10sdGhpcy5vcHRpb25zLnRpbWVvdXQ9ITE7dmFyIGM9YShcIjxkaXYvPlwiKS5hZGRDbGFzcyhcIm5vdHlfYnV0dG9uc1wiKTtudWxsIT09dGhpcy5vcHRpb25zLmxheW91dC5wYXJlbnQub2JqZWN0P3RoaXMuJGJhci5maW5kKFwiLm5vdHlfYmFyXCIpLmFwcGVuZChjKTp0aGlzLiRiYXIuYXBwZW5kKGMpO3ZhciBkPXRoaXM7YS5lYWNoKHRoaXMub3B0aW9ucy5idXR0b25zLGZ1bmN0aW9uKGIsYyl7dmFyIGU9YShcIjxidXR0b24vPlwiKS5hZGRDbGFzcyhjLmFkZENsYXNzP2MuYWRkQ2xhc3M6XCJncmF5XCIpLmh0bWwoYy50ZXh0KS5hdHRyKFwiaWRcIixjLmlkP2MuaWQ6XCJidXR0b24tXCIrYikuYXR0cihcInRpdGxlXCIsYy50aXRsZSkuYXBwZW5kVG8oZC4kYmFyLmZpbmQoXCIubm90eV9idXR0b25zXCIpKS5vbihcImNsaWNrXCIsZnVuY3Rpb24oYil7YS5pc0Z1bmN0aW9uKGMub25DbGljaykmJmMub25DbGljay5jYWxsKGUsZCxiKX0pfSl9dGhpcy4kbWVzc2FnZT10aGlzLiRiYXIuZmluZChcIi5ub3R5X21lc3NhZ2VcIiksdGhpcy4kY2xvc2VCdXR0b249dGhpcy4kYmFyLmZpbmQoXCIubm90eV9jbG9zZVwiKSx0aGlzLiRidXR0b25zPXRoaXMuJGJhci5maW5kKFwiLm5vdHlfYnV0dG9uc1wiKSxhLm5vdHkuc3RvcmVbdGhpcy5vcHRpb25zLmlkXT10aGlzfSxzaG93OmZ1bmN0aW9uKCl7dmFyIGI9dGhpcztyZXR1cm4gYi5vcHRpb25zLmN1c3RvbT9iLm9wdGlvbnMuY3VzdG9tLmZpbmQoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmFwcGVuZChiLiRiYXIpOmEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmFwcGVuZChiLiRiYXIpLGIub3B0aW9ucy50aGVtZSYmYi5vcHRpb25zLnRoZW1lLnN0eWxlJiZiLm9wdGlvbnMudGhlbWUuc3R5bGUuYXBwbHkoYiksXCJmdW5jdGlvblwiPT09YS50eXBlKGIub3B0aW9ucy5sYXlvdXQuY3NzKT90aGlzLm9wdGlvbnMubGF5b3V0LmNzcy5hcHBseShiLiRiYXIpOmIuJGJhci5jc3ModGhpcy5vcHRpb25zLmxheW91dC5jc3N8fHt9KSxiLiRiYXIuYWRkQ2xhc3MoYi5vcHRpb25zLmxheW91dC5hZGRDbGFzcyksYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc3R5bGUuYXBwbHkoYShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvciksW2Iub3B0aW9ucy53aXRoaW5dKSxiLnNob3dpbmc9ITAsYi5vcHRpb25zLnRoZW1lJiZiLm9wdGlvbnMudGhlbWUuc3R5bGUmJmIub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vblNob3cuYXBwbHkodGhpcyksYS5pbkFycmF5KFwiY2xpY2tcIixiLm9wdGlvbnMuY2xvc2VXaXRoKT4tMSYmYi4kYmFyLmNzcyhcImN1cnNvclwiLFwicG9pbnRlclwiKS5vbmUoXCJjbGlja1wiLGZ1bmN0aW9uKGEpe2Iuc3RvcFByb3BhZ2F0aW9uKGEpLGIub3B0aW9ucy5jYWxsYmFjay5vbkNsb3NlQ2xpY2smJmIub3B0aW9ucy5jYWxsYmFjay5vbkNsb3NlQ2xpY2suYXBwbHkoYiksYi5jbG9zZSgpfSksYS5pbkFycmF5KFwiaG92ZXJcIixiLm9wdGlvbnMuY2xvc2VXaXRoKT4tMSYmYi4kYmFyLm9uZShcIm1vdXNlZW50ZXJcIixmdW5jdGlvbigpe2IuY2xvc2UoKX0pLGEuaW5BcnJheShcImJ1dHRvblwiLGIub3B0aW9ucy5jbG9zZVdpdGgpPi0xJiZiLiRjbG9zZUJ1dHRvbi5vbmUoXCJjbGlja1wiLGZ1bmN0aW9uKGEpe2Iuc3RvcFByb3BhZ2F0aW9uKGEpLGIuY2xvc2UoKX0pLC0xPT1hLmluQXJyYXkoXCJidXR0b25cIixiLm9wdGlvbnMuY2xvc2VXaXRoKSYmYi4kY2xvc2VCdXR0b24ucmVtb3ZlKCksYi5vcHRpb25zLmNhbGxiYWNrLm9uU2hvdyYmYi5vcHRpb25zLmNhbGxiYWNrLm9uU2hvdy5hcHBseShiKSxcInN0cmluZ1wiPT10eXBlb2YgYi5vcHRpb25zLmFuaW1hdGlvbi5vcGVuPyhiLiRiYXIuY3NzKFwiaGVpZ2h0XCIsYi4kYmFyLmlubmVySGVpZ2h0KCkpLGIuJGJhci5vbihcImNsaWNrXCIsZnVuY3Rpb24oYSl7Yi53YXNDbGlja2VkPSEwfSksYi4kYmFyLnNob3coKS5hZGRDbGFzcyhiLm9wdGlvbnMuYW5pbWF0aW9uLm9wZW4pLm9uZShcIndlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmRcIixmdW5jdGlvbigpe2Iub3B0aW9ucy5jYWxsYmFjay5hZnRlclNob3cmJmIub3B0aW9ucy5jYWxsYmFjay5hZnRlclNob3cuYXBwbHkoYiksYi5zaG93aW5nPSExLGIuc2hvd249ITAsYi5oYXNPd25Qcm9wZXJ0eShcIndhc0NsaWNrZWRcIikmJihiLiRiYXIub2ZmKFwiY2xpY2tcIixmdW5jdGlvbihhKXtiLndhc0NsaWNrZWQ9ITB9KSxiLmNsb3NlKCkpfSkpOmIuJGJhci5hbmltYXRlKGIub3B0aW9ucy5hbmltYXRpb24ub3BlbixiLm9wdGlvbnMuYW5pbWF0aW9uLnNwZWVkLGIub3B0aW9ucy5hbmltYXRpb24uZWFzaW5nLGZ1bmN0aW9uKCl7Yi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyU2hvdyYmYi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyU2hvdy5hcHBseShiKSxiLnNob3dpbmc9ITEsYi5zaG93bj0hMH0pLGIub3B0aW9ucy50aW1lb3V0JiZiLiRiYXIuZGVsYXkoYi5vcHRpb25zLnRpbWVvdXQpLnByb21pc2UoKS5kb25lKGZ1bmN0aW9uKCl7Yi5jbG9zZSgpfSksdGhpc30sY2xvc2U6ZnVuY3Rpb24oKXtpZighKHRoaXMuY2xvc2VkfHx0aGlzLiRiYXImJnRoaXMuJGJhci5oYXNDbGFzcyhcImktYW0tY2xvc2luZy1ub3dcIikpKXt2YXIgYj10aGlzO2lmKHRoaXMuc2hvd2luZylyZXR1cm4gdm9pZCBiLiRiYXIucXVldWUoZnVuY3Rpb24oKXtiLmNsb3NlLmFwcGx5KGIpfSk7aWYoIXRoaXMuc2hvd24mJiF0aGlzLnNob3dpbmcpe3ZhciBjPVtdO3JldHVybiBhLmVhY2goYS5ub3R5LnF1ZXVlLGZ1bmN0aW9uKGEsZCl7ZC5vcHRpb25zLmlkIT1iLm9wdGlvbnMuaWQmJmMucHVzaChkKX0pLHZvaWQoYS5ub3R5LnF1ZXVlPWMpfWIuJGJhci5hZGRDbGFzcyhcImktYW0tY2xvc2luZy1ub3dcIiksYi5vcHRpb25zLmNhbGxiYWNrLm9uQ2xvc2UmJmIub3B0aW9ucy5jYWxsYmFjay5vbkNsb3NlLmFwcGx5KGIpLFwic3RyaW5nXCI9PXR5cGVvZiBiLm9wdGlvbnMuYW5pbWF0aW9uLmNsb3NlP2IuJGJhci5hZGRDbGFzcyhiLm9wdGlvbnMuYW5pbWF0aW9uLmNsb3NlKS5vbmUoXCJ3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kXCIsZnVuY3Rpb24oKXtiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJDbG9zZSYmYi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyQ2xvc2UuYXBwbHkoYiksYi5jbG9zZUNsZWFuVXAoKX0pOmIuJGJhci5jbGVhclF1ZXVlKCkuc3RvcCgpLmFuaW1hdGUoYi5vcHRpb25zLmFuaW1hdGlvbi5jbG9zZSxiLm9wdGlvbnMuYW5pbWF0aW9uLnNwZWVkLGIub3B0aW9ucy5hbmltYXRpb24uZWFzaW5nLGZ1bmN0aW9uKCl7Yi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyQ2xvc2UmJmIub3B0aW9ucy5jYWxsYmFjay5hZnRlckNsb3NlLmFwcGx5KGIpfSkucHJvbWlzZSgpLmRvbmUoZnVuY3Rpb24oKXtiLmNsb3NlQ2xlYW5VcCgpfSl9fSxjbG9zZUNsZWFuVXA6ZnVuY3Rpb24oKXt2YXIgYj10aGlzO2Iub3B0aW9ucy5tb2RhbCYmKGEubm90eVJlbmRlcmVyLnNldE1vZGFsQ291bnQoLTEpLDA9PWEubm90eVJlbmRlcmVyLmdldE1vZGFsQ291bnQoKSYmYShcIi5ub3R5X21vZGFsXCIpLmZhZGVPdXQoYi5vcHRpb25zLmFuaW1hdGlvbi5mYWRlU3BlZWQsZnVuY3Rpb24oKXthKHRoaXMpLnJlbW92ZSgpfSkpLGEubm90eVJlbmRlcmVyLnNldExheW91dENvdW50Rm9yKGIsLTEpLDA9PWEubm90eVJlbmRlcmVyLmdldExheW91dENvdW50Rm9yKGIpJiZhKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5yZW1vdmUoKSxcInVuZGVmaW5lZFwiIT10eXBlb2YgYi4kYmFyJiZudWxsIT09Yi4kYmFyJiYoXCJzdHJpbmdcIj09dHlwZW9mIGIub3B0aW9ucy5hbmltYXRpb24uY2xvc2U/KGIuJGJhci5jc3MoXCJ0cmFuc2l0aW9uXCIsXCJhbGwgMTAwbXMgZWFzZVwiKS5jc3MoXCJib3JkZXJcIiwwKS5jc3MoXCJtYXJnaW5cIiwwKS5oZWlnaHQoMCksYi4kYmFyLm9uZShcInRyYW5zaXRpb25lbmQgd2Via2l0VHJhbnNpdGlvbkVuZCBvVHJhbnNpdGlvbkVuZCBNU1RyYW5zaXRpb25FbmRcIixmdW5jdGlvbigpe2IuJGJhci5yZW1vdmUoKSxiLiRiYXI9bnVsbCxiLmNsb3NlZD0hMCxiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2smJmIub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vbkNsb3NlJiZiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2sub25DbG9zZS5hcHBseShiKX0pKTooYi4kYmFyLnJlbW92ZSgpLGIuJGJhcj1udWxsLGIuY2xvc2VkPSEwKSksZGVsZXRlIGEubm90eS5zdG9yZVtiLm9wdGlvbnMuaWRdLGIub3B0aW9ucy50aGVtZS5jYWxsYmFjayYmYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrLm9uQ2xvc2UmJmIub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vbkNsb3NlLmFwcGx5KGIpLGIub3B0aW9ucy5kaXNtaXNzUXVldWV8fChhLm5vdHkub250YXA9ITAsYS5ub3R5UmVuZGVyZXIucmVuZGVyKCkpLGIub3B0aW9ucy5tYXhWaXNpYmxlPjAmJmIub3B0aW9ucy5kaXNtaXNzUXVldWUmJmEubm90eVJlbmRlcmVyLnJlbmRlcigpfSxzZXRUZXh0OmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLmNsb3NlZHx8KHRoaXMub3B0aW9ucy50ZXh0PWEsdGhpcy4kYmFyLmZpbmQoXCIubm90eV90ZXh0XCIpLmh0bWwoYSkpLHRoaXN9LHNldFR5cGU6ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuY2xvc2VkfHwodGhpcy5vcHRpb25zLnR5cGU9YSx0aGlzLm9wdGlvbnMudGhlbWUuc3R5bGUuYXBwbHkodGhpcyksdGhpcy5vcHRpb25zLnRoZW1lLmNhbGxiYWNrLm9uU2hvdy5hcHBseSh0aGlzKSksdGhpc30sc2V0VGltZW91dDpmdW5jdGlvbihhKXtpZighdGhpcy5jbG9zZWQpe3ZhciBiPXRoaXM7dGhpcy5vcHRpb25zLnRpbWVvdXQ9YSxiLiRiYXIuZGVsYXkoYi5vcHRpb25zLnRpbWVvdXQpLnByb21pc2UoKS5kb25lKGZ1bmN0aW9uKCl7Yi5jbG9zZSgpfSl9cmV0dXJuIHRoaXN9LHN0b3BQcm9wYWdhdGlvbjpmdW5jdGlvbihhKXthPWF8fHdpbmRvdy5ldmVudCxcInVuZGVmaW5lZFwiIT10eXBlb2YgYS5zdG9wUHJvcGFnYXRpb24/YS5zdG9wUHJvcGFnYXRpb24oKTphLmNhbmNlbEJ1YmJsZT0hMH0sY2xvc2VkOiExLHNob3dpbmc6ITEsc2hvd246ITF9O2Eubm90eVJlbmRlcmVyPXt9LGEubm90eVJlbmRlcmVyLmluaXQ9ZnVuY3Rpb24oYyl7dmFyIGQ9T2JqZWN0LmNyZWF0ZShiKS5pbml0KGMpO3JldHVybiBkLm9wdGlvbnMua2lsbGVyJiZhLm5vdHkuY2xvc2VBbGwoKSxkLm9wdGlvbnMuZm9yY2U/YS5ub3R5LnF1ZXVlLnVuc2hpZnQoZCk6YS5ub3R5LnF1ZXVlLnB1c2goZCksYS5ub3R5UmVuZGVyZXIucmVuZGVyKCksXCJvYmplY3RcIj09YS5ub3R5LnJldHVybnM/ZDpkLm9wdGlvbnMuaWR9LGEubm90eVJlbmRlcmVyLnJlbmRlcj1mdW5jdGlvbigpe3ZhciBiPWEubm90eS5xdWV1ZVswXTtcIm9iamVjdFwiPT09YS50eXBlKGIpP2Iub3B0aW9ucy5kaXNtaXNzUXVldWU/Yi5vcHRpb25zLm1heFZpc2libGU+MD9hKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yK1wiID4gbGlcIikubGVuZ3RoPGIub3B0aW9ucy5tYXhWaXNpYmxlJiZhLm5vdHlSZW5kZXJlci5zaG93KGEubm90eS5xdWV1ZS5zaGlmdCgpKTphLm5vdHlSZW5kZXJlci5zaG93KGEubm90eS5xdWV1ZS5zaGlmdCgpKTphLm5vdHkub250YXAmJihhLm5vdHlSZW5kZXJlci5zaG93KGEubm90eS5xdWV1ZS5zaGlmdCgpKSxhLm5vdHkub250YXA9ITEpOmEubm90eS5vbnRhcD0hMH0sYS5ub3R5UmVuZGVyZXIuc2hvdz1mdW5jdGlvbihiKXtiLm9wdGlvbnMubW9kYWwmJihhLm5vdHlSZW5kZXJlci5jcmVhdGVNb2RhbEZvcihiKSxhLm5vdHlSZW5kZXJlci5zZXRNb2RhbENvdW50KDEpKSxiLm9wdGlvbnMuY3VzdG9tPzA9PWIub3B0aW9ucy5jdXN0b20uZmluZChiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikubGVuZ3RoP2Iub3B0aW9ucy5jdXN0b20uYXBwZW5kKGEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIub2JqZWN0KS5hZGRDbGFzcyhcImktYW0tbmV3XCIpKTpiLm9wdGlvbnMuY3VzdG9tLmZpbmQoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLnJlbW92ZUNsYXNzKFwiaS1hbS1uZXdcIik6MD09YShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikubGVuZ3RoP2EoXCJib2R5XCIpLmFwcGVuZChhKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLm9iamVjdCkuYWRkQ2xhc3MoXCJpLWFtLW5ld1wiKSk6YShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikucmVtb3ZlQ2xhc3MoXCJpLWFtLW5ld1wiKSxhLm5vdHlSZW5kZXJlci5zZXRMYXlvdXRDb3VudEZvcihiLDEpLGIuc2hvdygpfSxhLm5vdHlSZW5kZXJlci5jcmVhdGVNb2RhbEZvcj1mdW5jdGlvbihiKXtpZigwPT1hKFwiLm5vdHlfbW9kYWxcIikubGVuZ3RoKXt2YXIgYz1hKFwiPGRpdi8+XCIpLmFkZENsYXNzKFwibm90eV9tb2RhbFwiKS5hZGRDbGFzcyhiLm9wdGlvbnMudGhlbWUpLmRhdGEoXCJub3R5X21vZGFsX2NvdW50XCIsMCk7Yi5vcHRpb25zLnRoZW1lLm1vZGFsJiZiLm9wdGlvbnMudGhlbWUubW9kYWwuY3NzJiZjLmNzcyhiLm9wdGlvbnMudGhlbWUubW9kYWwuY3NzKSxjLnByZXBlbmRUbyhhKFwiYm9keVwiKSkuZmFkZUluKGIub3B0aW9ucy5hbmltYXRpb24uZmFkZVNwZWVkKSxhLmluQXJyYXkoXCJiYWNrZHJvcFwiLGIub3B0aW9ucy5jbG9zZVdpdGgpPi0xJiZjLm9uKFwiY2xpY2tcIixmdW5jdGlvbihiKXthLm5vdHkuY2xvc2VBbGwoKX0pfX0sYS5ub3R5UmVuZGVyZXIuZ2V0TGF5b3V0Q291bnRGb3I9ZnVuY3Rpb24oYil7cmV0dXJuIGEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLmRhdGEoXCJub3R5X2xheW91dF9jb3VudFwiKXx8MH0sYS5ub3R5UmVuZGVyZXIuc2V0TGF5b3V0Q291bnRGb3I9ZnVuY3Rpb24oYixjKXtyZXR1cm4gYShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikuZGF0YShcIm5vdHlfbGF5b3V0X2NvdW50XCIsYS5ub3R5UmVuZGVyZXIuZ2V0TGF5b3V0Q291bnRGb3IoYikrYyl9LGEubm90eVJlbmRlcmVyLmdldE1vZGFsQ291bnQ9ZnVuY3Rpb24oKXtyZXR1cm4gYShcIi5ub3R5X21vZGFsXCIpLmRhdGEoXCJub3R5X21vZGFsX2NvdW50XCIpfHwwfSxhLm5vdHlSZW5kZXJlci5zZXRNb2RhbENvdW50PWZ1bmN0aW9uKGIpe3JldHVybiBhKFwiLm5vdHlfbW9kYWxcIikuZGF0YShcIm5vdHlfbW9kYWxfY291bnRcIixhLm5vdHlSZW5kZXJlci5nZXRNb2RhbENvdW50KCkrYil9LGEuZm4ubm90eT1mdW5jdGlvbihiKXtyZXR1cm4gYi5jdXN0b209YSh0aGlzKSxhLm5vdHlSZW5kZXJlci5pbml0KGIpfSxhLm5vdHk9e30sYS5ub3R5LnF1ZXVlPVtdLGEubm90eS5vbnRhcD0hMCxhLm5vdHkubGF5b3V0cz17fSxhLm5vdHkudGhlbWVzPXt9LGEubm90eS5yZXR1cm5zPVwib2JqZWN0XCIsYS5ub3R5LnN0b3JlPXt9LGEubm90eS5nZXQ9ZnVuY3Rpb24oYil7cmV0dXJuIGEubm90eS5zdG9yZS5oYXNPd25Qcm9wZXJ0eShiKT9hLm5vdHkuc3RvcmVbYl06ITF9LGEubm90eS5jbG9zZT1mdW5jdGlvbihiKXtyZXR1cm4gYS5ub3R5LmdldChiKT9hLm5vdHkuZ2V0KGIpLmNsb3NlKCk6ITF9LGEubm90eS5zZXRUZXh0PWZ1bmN0aW9uKGIsYyl7cmV0dXJuIGEubm90eS5nZXQoYik/YS5ub3R5LmdldChiKS5zZXRUZXh0KGMpOiExfSxhLm5vdHkuc2V0VHlwZT1mdW5jdGlvbihiLGMpe3JldHVybiBhLm5vdHkuZ2V0KGIpP2Eubm90eS5nZXQoYikuc2V0VHlwZShjKTohMX0sYS5ub3R5LmNsZWFyUXVldWU9ZnVuY3Rpb24oKXthLm5vdHkucXVldWU9W119LGEubm90eS5jbG9zZUFsbD1mdW5jdGlvbigpe2Eubm90eS5jbGVhclF1ZXVlKCksYS5lYWNoKGEubm90eS5zdG9yZSxmdW5jdGlvbihhLGIpe2IuY2xvc2UoKX0pfTt2YXIgYz13aW5kb3cuYWxlcnQ7cmV0dXJuIGEubm90eS5jb25zdW1lQWxlcnQ9ZnVuY3Rpb24oYil7d2luZG93LmFsZXJ0PWZ1bmN0aW9uKGMpe2I/Yi50ZXh0PWM6Yj17dGV4dDpjfSxhLm5vdHlSZW5kZXJlci5pbml0KGIpfX0sYS5ub3R5LnN0b3BDb25zdW1lQWxlcnQ9ZnVuY3Rpb24oKXt3aW5kb3cuYWxlcnQ9Y30sYS5ub3R5LmRlZmF1bHRzPXtsYXlvdXQ6XCJ0b3BcIix0aGVtZTpcImRlZmF1bHRUaGVtZVwiLHR5cGU6XCJhbGVydFwiLHRleHQ6XCJcIixkaXNtaXNzUXVldWU6ITAsdGVtcGxhdGU6JzxkaXYgY2xhc3M9XCJub3R5X21lc3NhZ2VcIj48c3BhbiBjbGFzcz1cIm5vdHlfdGV4dFwiPjwvc3Bhbj48ZGl2IGNsYXNzPVwibm90eV9jbG9zZVwiPjwvZGl2PjwvZGl2PicsYW5pbWF0aW9uOntvcGVuOntoZWlnaHQ6XCJ0b2dnbGVcIn0sY2xvc2U6e2hlaWdodDpcInRvZ2dsZVwifSxlYXNpbmc6XCJzd2luZ1wiLHNwZWVkOjUwMCxmYWRlU3BlZWQ6XCJmYXN0XCJ9LHRpbWVvdXQ6ITEsZm9yY2U6ITEsbW9kYWw6ITEsbWF4VmlzaWJsZTo1LGtpbGxlcjohMSxjbG9zZVdpdGg6W1wiY2xpY2tcIl0sY2FsbGJhY2s6e29uU2hvdzpmdW5jdGlvbigpe30sYWZ0ZXJTaG93OmZ1bmN0aW9uKCl7fSxvbkNsb3NlOmZ1bmN0aW9uKCl7fSxhZnRlckNsb3NlOmZ1bmN0aW9uKCl7fSxvbkNsb3NlQ2xpY2s6ZnVuY3Rpb24oKXt9fSxidXR0b25zOiExfSxhKHdpbmRvdykub24oXCJyZXNpemVcIixmdW5jdGlvbigpe2EuZWFjaChhLm5vdHkubGF5b3V0cyxmdW5jdGlvbihiLGMpe2MuY29udGFpbmVyLnN0eWxlLmFwcGx5KGEoYy5jb250YWluZXIuc2VsZWN0b3IpKX0pfSksd2luZG93Lm5vdHk9ZnVuY3Rpb24oYil7cmV0dXJuIGEubm90eVJlbmRlcmVyLmluaXQoYil9LGEubm90eS5sYXlvdXRzLmJvdHRvbT17bmFtZTpcImJvdHRvbVwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfYm90dG9tX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2JvdHRvbV9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7Ym90dG9tOjAsbGVmdDpcIjUlXCIscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiOTAlXCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDo5OTk5OTk5fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuYm90dG9tQ2VudGVyPXtuYW1lOlwiYm90dG9tQ2VudGVyXCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9ib3R0b21DZW50ZXJfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfYm90dG9tQ2VudGVyX2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtib3R0b206MjAsbGVmdDowLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KSxhKHRoaXMpLmNzcyh7bGVmdDooYSh3aW5kb3cpLndpZHRoKCktYSh0aGlzKS5vdXRlcldpZHRoKCExKSkvMitcInB4XCJ9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuYm90dG9tTGVmdD17bmFtZTpcImJvdHRvbUxlZnRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2JvdHRvbUxlZnRfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfYm90dG9tTGVmdF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7Ym90dG9tOjIwLGxlZnQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLHdpbmRvdy5pbm5lcldpZHRoPDYwMCYmYSh0aGlzKS5jc3Moe2xlZnQ6NX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5ib3R0b21SaWdodD17bmFtZTpcImJvdHRvbVJpZ2h0XCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9ib3R0b21SaWdodF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9ib3R0b21SaWdodF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7Ym90dG9tOjIwLHJpZ2h0OjIwLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KSx3aW5kb3cuaW5uZXJXaWR0aDw2MDAmJmEodGhpcykuY3NzKHtyaWdodDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmNlbnRlcj17bmFtZTpcImNlbnRlclwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfY2VudGVyX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2NlbnRlcl9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7cG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pO3ZhciBiPWEodGhpcykuY2xvbmUoKS5jc3Moe3Zpc2liaWxpdHk6XCJoaWRkZW5cIixkaXNwbGF5OlwiYmxvY2tcIixwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOjAsbGVmdDowfSkuYXR0cihcImlkXCIsXCJkdXBlXCIpO2EoXCJib2R5XCIpLmFwcGVuZChiKSxiLmZpbmQoXCIuaS1hbS1jbG9zaW5nLW5vd1wiKS5yZW1vdmUoKSxiLmZpbmQoXCJsaVwiKS5jc3MoXCJkaXNwbGF5XCIsXCJibG9ja1wiKTt2YXIgYz1iLmhlaWdodCgpO2IucmVtb3ZlKCksYSh0aGlzKS5oYXNDbGFzcyhcImktYW0tbmV3XCIpP2EodGhpcykuY3NzKHtsZWZ0OihhKHdpbmRvdykud2lkdGgoKS1hKHRoaXMpLm91dGVyV2lkdGgoITEpKS8yK1wicHhcIix0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0pOmEodGhpcykuYW5pbWF0ZSh7bGVmdDooYSh3aW5kb3cpLndpZHRoKCktYSh0aGlzKS5vdXRlcldpZHRoKCExKSkvMitcInB4XCIsdG9wOihhKHdpbmRvdykuaGVpZ2h0KCktYykvMitcInB4XCJ9LDUwMCl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmNlbnRlckxlZnQ9e25hbWU6XCJjZW50ZXJMZWZ0XCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9jZW50ZXJMZWZ0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2NlbnRlckxlZnRfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe2xlZnQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pO3ZhciBiPWEodGhpcykuY2xvbmUoKS5jc3Moe3Zpc2liaWxpdHk6XCJoaWRkZW5cIixkaXNwbGF5OlwiYmxvY2tcIixwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOjAsbGVmdDowfSkuYXR0cihcImlkXCIsXCJkdXBlXCIpO2EoXCJib2R5XCIpLmFwcGVuZChiKSxiLmZpbmQoXCIuaS1hbS1jbG9zaW5nLW5vd1wiKS5yZW1vdmUoKSxiLmZpbmQoXCJsaVwiKS5jc3MoXCJkaXNwbGF5XCIsXCJibG9ja1wiKTt2YXIgYz1iLmhlaWdodCgpO2IucmVtb3ZlKCksYSh0aGlzKS5oYXNDbGFzcyhcImktYW0tbmV3XCIpP2EodGhpcykuY3NzKHt0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0pOmEodGhpcykuYW5pbWF0ZSh7dG9wOihhKHdpbmRvdykuaGVpZ2h0KCktYykvMitcInB4XCJ9LDUwMCksd2luZG93LmlubmVyV2lkdGg8NjAwJiZhKHRoaXMpLmNzcyh7bGVmdDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmNlbnRlclJpZ2h0PXtuYW1lOlwiY2VudGVyUmlnaHRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2NlbnRlclJpZ2h0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2NlbnRlclJpZ2h0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtyaWdodDoyMCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSk7dmFyIGI9YSh0aGlzKS5jbG9uZSgpLmNzcyh7dmlzaWJpbGl0eTpcImhpZGRlblwiLGRpc3BsYXk6XCJibG9ja1wiLHBvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6MCxsZWZ0OjB9KS5hdHRyKFwiaWRcIixcImR1cGVcIik7YShcImJvZHlcIikuYXBwZW5kKGIpLGIuZmluZChcIi5pLWFtLWNsb3Npbmctbm93XCIpLnJlbW92ZSgpLGIuZmluZChcImxpXCIpLmNzcyhcImRpc3BsYXlcIixcImJsb2NrXCIpO3ZhciBjPWIuaGVpZ2h0KCk7Yi5yZW1vdmUoKSxhKHRoaXMpLmhhc0NsYXNzKFwiaS1hbS1uZXdcIik/YSh0aGlzKS5jc3Moe3RvcDooYSh3aW5kb3cpLmhlaWdodCgpLWMpLzIrXCJweFwifSk6YSh0aGlzKS5hbmltYXRlKHt0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0sNTAwKSx3aW5kb3cuaW5uZXJXaWR0aDw2MDAmJmEodGhpcykuY3NzKHtyaWdodDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmlubGluZT17bmFtZTpcImlubGluZVwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBjbGFzcz1cIm5vdHlfaW5saW5lX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bC5ub3R5X2lubGluZV9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7d2lkdGg6XCIxMDAlXCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDo5OTk5OTk5fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMudG9wPXtuYW1lOlwidG9wXCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV90b3BfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfdG9wX2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHt0b3A6MCxsZWZ0OlwiNSVcIixwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCI5MCVcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4Ojk5OTk5OTl9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy50b3BDZW50ZXI9e25hbWU6XCJ0b3BDZW50ZXJcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X3RvcENlbnRlcl9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV90b3BDZW50ZXJfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3RvcDoyMCxsZWZ0OjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLGEodGhpcykuY3NzKHtsZWZ0OihhKHdpbmRvdykud2lkdGgoKS1hKHRoaXMpLm91dGVyV2lkdGgoITEpKS8yK1wicHhcIn0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy50b3BMZWZ0PXtuYW1lOlwidG9wTGVmdFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfdG9wTGVmdF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV90b3BMZWZ0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHt0b3A6MjAsbGVmdDoyMCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSksd2luZG93LmlubmVyV2lkdGg8NjAwJiZhKHRoaXMpLmNzcyh7bGVmdDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLnRvcFJpZ2h0PXtuYW1lOlwidG9wUmlnaHRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X3RvcFJpZ2h0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X3RvcFJpZ2h0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHt0b3A6MjAscmlnaHQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLHdpbmRvdy5pbm5lcldpZHRoPDYwMCYmYSh0aGlzKS5jc3Moe3JpZ2h0OjV9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LnRoZW1lcy5ib290c3RyYXBUaGVtZT17bmFtZTpcImJvb3RzdHJhcFRoZW1lXCIsbW9kYWw6e2Nzczp7cG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMTAwJVwiLGhlaWdodDpcIjEwMCVcIixiYWNrZ3JvdW5kQ29sb3I6XCIjMDAwXCIsekluZGV4OjFlNCxvcGFjaXR5Oi42LGRpc3BsYXk6XCJub25lXCIsbGVmdDowLHRvcDowfX0sc3R5bGU6ZnVuY3Rpb24oKXt2YXIgYj10aGlzLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3Rvcjtzd2l0Y2goYShiKS5hZGRDbGFzcyhcImxpc3QtZ3JvdXBcIiksdGhpcy4kY2xvc2VCdXR0b24uYXBwZW5kKCc8c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj4mdGltZXM7PC9zcGFuPjxzcGFuIGNsYXNzPVwic3Itb25seVwiPkNsb3NlPC9zcGFuPicpLHRoaXMuJGNsb3NlQnV0dG9uLmFkZENsYXNzKFwiY2xvc2VcIiksdGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtXCIpLmNzcyhcInBhZGRpbmdcIixcIjBweFwiKSx0aGlzLm9wdGlvbnMudHlwZSl7Y2FzZVwiYWxlcnRcIjpjYXNlXCJub3RpZmljYXRpb25cIjp0aGlzLiRiYXIuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwLWl0ZW0taW5mb1wiKTticmVhaztjYXNlXCJ3YXJuaW5nXCI6dGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtLXdhcm5pbmdcIik7YnJlYWs7Y2FzZVwiZXJyb3JcIjp0aGlzLiRiYXIuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwLWl0ZW0tZGFuZ2VyXCIpO2JyZWFrO2Nhc2VcImluZm9ybWF0aW9uXCI6dGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtLWluZm9cIik7YnJlYWs7Y2FzZVwic3VjY2Vzc1wiOnRoaXMuJGJhci5hZGRDbGFzcyhcImxpc3QtZ3JvdXAtaXRlbS1zdWNjZXNzXCIpfXRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjEzcHhcIixsaW5lSGVpZ2h0OlwiMTZweFwiLHRleHRBbGlnbjpcImNlbnRlclwiLHBhZGRpbmc6XCI4cHggMTBweCA5cHhcIix3aWR0aDpcImF1dG9cIixwb3NpdGlvbjpcInJlbGF0aXZlXCJ9KX0sY2FsbGJhY2s6e29uU2hvdzpmdW5jdGlvbigpe30sb25DbG9zZTpmdW5jdGlvbigpe319fSxhLm5vdHkudGhlbWVzLmRlZmF1bHRUaGVtZT17bmFtZTpcImRlZmF1bHRUaGVtZVwiLGhlbHBlcnM6e2JvcmRlckZpeDpmdW5jdGlvbigpe2lmKHRoaXMub3B0aW9ucy5kaXNtaXNzUXVldWUpe3ZhciBiPXRoaXMub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yK1wiIFwiK3RoaXMub3B0aW9ucy5sYXlvdXQucGFyZW50LnNlbGVjdG9yO3N3aXRjaCh0aGlzLm9wdGlvbnMubGF5b3V0Lm5hbWUpe2Nhc2VcInRvcFwiOmEoYikuY3NzKHtib3JkZXJSYWRpdXM6XCIwcHggMHB4IDBweCAwcHhcIn0pLGEoYikubGFzdCgpLmNzcyh7Ym9yZGVyUmFkaXVzOlwiMHB4IDBweCA1cHggNXB4XCJ9KTticmVhaztjYXNlXCJ0b3BDZW50ZXJcIjpjYXNlXCJ0b3BMZWZ0XCI6Y2FzZVwidG9wUmlnaHRcIjpjYXNlXCJib3R0b21DZW50ZXJcIjpjYXNlXCJib3R0b21MZWZ0XCI6Y2FzZVwiYm90dG9tUmlnaHRcIjpjYXNlXCJjZW50ZXJcIjpjYXNlXCJjZW50ZXJMZWZ0XCI6Y2FzZVwiY2VudGVyUmlnaHRcIjpjYXNlXCJpbmxpbmVcIjphKGIpLmNzcyh7Ym9yZGVyUmFkaXVzOlwiMHB4IDBweCAwcHggMHB4XCJ9KSxhKGIpLmZpcnN0KCkuY3NzKHtcImJvcmRlci10b3AtbGVmdC1yYWRpdXNcIjpcIjVweFwiLFwiYm9yZGVyLXRvcC1yaWdodC1yYWRpdXNcIjpcIjVweFwifSksYShiKS5sYXN0KCkuY3NzKHtcImJvcmRlci1ib3R0b20tbGVmdC1yYWRpdXNcIjpcIjVweFwiLFwiYm9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXNcIjpcIjVweFwifSk7YnJlYWs7Y2FzZVwiYm90dG9tXCI6YShiKS5jc3Moe2JvcmRlclJhZGl1czpcIjBweCAwcHggMHB4IDBweFwifSksYShiKS5maXJzdCgpLmNzcyh7Ym9yZGVyUmFkaXVzOlwiNXB4IDVweCAwcHggMHB4XCJ9KX19fX0sbW9kYWw6e2Nzczp7cG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMTAwJVwiLGhlaWdodDpcIjEwMCVcIixiYWNrZ3JvdW5kQ29sb3I6XCIjMDAwXCIsekluZGV4OjFlNCxvcGFjaXR5Oi42LGRpc3BsYXk6XCJub25lXCIsbGVmdDowLHRvcDowfX0sc3R5bGU6ZnVuY3Rpb24oKXtzd2l0Y2godGhpcy4kYmFyLmNzcyh7b3ZlcmZsb3c6XCJoaWRkZW5cIixiYWNrZ3JvdW5kOlwidXJsKCdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUJzQUFBQW9DQVFBQUFDbE0wbmRBQUFBaGtsRVFWUjRBZFhPMFFyQ01CQkUwYnR0a2szOC93OFdSRVJwZHlqelZPYytIeGhJSHFKR01RY0ZGa3BZUlFvdExMU3cwSUo1YUJkb3ZydU1ZREEva1Q4cGxGOVpLTEZRY2dGMThoRGoxU2JRT01sQ0E0a2FvMGlpWG1haDdxQldQZHhwb2hzZ1ZaeWo3ZTVJOUtjSUQrRWhpREk1Z3hCWUtMQlFZS0hBUW9HRkFvRWtzL1lFR0hZS0I3aEZ4ZjBBQUFBQVNVVk9SSzVDWUlJPScpIHJlcGVhdC14IHNjcm9sbCBsZWZ0IHRvcCAjZmZmXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsbGluZUhlaWdodDpcIjE2cHhcIix0ZXh0QWxpZ246XCJjZW50ZXJcIixwYWRkaW5nOlwiOHB4IDEwcHggOXB4XCIsd2lkdGg6XCJhdXRvXCIscG9zaXRpb246XCJyZWxhdGl2ZVwifSksdGhpcy4kY2xvc2VCdXR0b24uY3NzKHtwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOjQscmlnaHQ6NCx3aWR0aDoxMCxoZWlnaHQ6MTAsYmFja2dyb3VuZDpcInVybChkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFvQUFBQUtDQVFBQUFBbk93YzJBQUFBeFVsRVFWUjRBUjNNUFVvRFVSU0EwZSsrdVNra094QzNJQU9XTnRhQ0lEYUNoZmdYQk1FWmJRUkJ5eEN3aytCYXNnUVJaTFNZb0xnRFFiQVJ4cnk4bnl1bVBjVlJLRGZkMEFhOEFzZ0R2MXpwNnBZZDVqV093aHZlYlJUYnpOTkV3NUJTc0lwc2ova3VyUUJubWs3c0lGY0NGNXl5WlBEUkc2dHJRaHVqWFlvc2FGb2MrMmYxTUo4OXVjNzZJTkQ2RjlCdmxYVWRwYjZ4d0QyKzRxM21lM2J5c2lIdnRMWXJVSnRvN1BEL3ZlN0xOSHhTZy93b04ya1N6NHR4YXNCZGh5aXozdWdQR2V0VGptM1hSb2tBQUFBQVNVVk9SSzVDWUlJPSlcIixkaXNwbGF5Olwibm9uZVwiLGN1cnNvcjpcInBvaW50ZXJcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtwYWRkaW5nOjUsdGV4dEFsaWduOlwicmlnaHRcIixib3JkZXJUb3A6XCIxcHggc29saWQgI2NjY1wiLGJhY2tncm91bmRDb2xvcjpcIiNmZmZcIn0pLHRoaXMuJGJ1dHRvbnMuZmluZChcImJ1dHRvblwiKS5jc3Moe21hcmdpbkxlZnQ6NX0pLHRoaXMuJGJ1dHRvbnMuZmluZChcImJ1dHRvbjpmaXJzdFwiKS5jc3Moe21hcmdpbkxlZnQ6MH0pLHRoaXMuJGJhci5vbih7bW91c2VlbnRlcjpmdW5jdGlvbigpe2EodGhpcykuZmluZChcIi5ub3R5X2Nsb3NlXCIpLnN0b3AoKS5mYWRlVG8oXCJub3JtYWxcIiwxKX0sbW91c2VsZWF2ZTpmdW5jdGlvbigpe2EodGhpcykuZmluZChcIi5ub3R5X2Nsb3NlXCIpLnN0b3AoKS5mYWRlVG8oXCJub3JtYWxcIiwwKX19KSx0aGlzLm9wdGlvbnMubGF5b3V0Lm5hbWUpe2Nhc2VcInRvcFwiOnRoaXMuJGJhci5jc3Moe2JvcmRlclJhZGl1czpcIjBweCAwcHggNXB4IDVweFwiLGJvcmRlckJvdHRvbTpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyTGVmdDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyUmlnaHQ6XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pO2JyZWFrO2Nhc2VcInRvcENlbnRlclwiOmNhc2VcImNlbnRlclwiOmNhc2VcImJvdHRvbUNlbnRlclwiOmNhc2VcImlubGluZVwiOnRoaXMuJGJhci5jc3Moe2JvcmRlclJhZGl1czpcIjVweFwiLGJvcmRlcjpcIjFweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTNweFwiLHRleHRBbGlnbjpcImNlbnRlclwifSk7YnJlYWs7Y2FzZVwidG9wTGVmdFwiOmNhc2VcInRvcFJpZ2h0XCI6Y2FzZVwiYm90dG9tTGVmdFwiOmNhc2VcImJvdHRvbVJpZ2h0XCI6Y2FzZVwiY2VudGVyTGVmdFwiOmNhc2VcImNlbnRlclJpZ2h0XCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyUmFkaXVzOlwiNXB4XCIsYm9yZGVyOlwiMXB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsdGV4dEFsaWduOlwibGVmdFwifSk7YnJlYWs7Y2FzZVwiYm90dG9tXCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyUmFkaXVzOlwiNXB4IDVweCAwcHggMHB4XCIsYm9yZGVyVG9wOlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJMZWZ0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJSaWdodDpcIjJweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAtMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pO2JyZWFrO2RlZmF1bHQ6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyOlwiMnB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KX1zd2l0Y2godGhpcy5vcHRpb25zLnR5cGUpe2Nhc2VcImFsZXJ0XCI6Y2FzZVwibm90aWZpY2F0aW9uXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGRlwiLGJvcmRlckNvbG9yOlwiI0NDQ1wiLGNvbG9yOlwiIzQ0NFwifSk7YnJlYWs7Y2FzZVwid2FybmluZ1wiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkVBQThcIixib3JkZXJDb2xvcjpcIiNGRkMyMzdcIixjb2xvcjpcIiM4MjYyMDBcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgI0ZGQzIzN1wifSk7YnJlYWs7Y2FzZVwiZXJyb3JcIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCJyZWRcIixib3JkZXJDb2xvcjpcImRhcmtyZWRcIixjb2xvcjpcIiNGRkZcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250V2VpZ2h0OlwiYm9sZFwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCBkYXJrcmVkXCJ9KTticmVhaztjYXNlXCJpbmZvcm1hdGlvblwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiM1N0I3RTJcIixib3JkZXJDb2xvcjpcIiMwQjkwQzRcIixjb2xvcjpcIiNGRkZcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgIzBCOTBDNFwifSk7YnJlYWs7Y2FzZVwic3VjY2Vzc1wiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcImxpZ2h0Z3JlZW5cIixib3JkZXJDb2xvcjpcIiM1MEMyNEVcIixjb2xvcjpcImRhcmtncmVlblwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjNTBDMjRFXCJ9KTticmVhaztkZWZhdWx0OnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkZcIixib3JkZXJDb2xvcjpcIiNDQ0NcIixjb2xvcjpcIiM0NDRcIn0pfX0sY2FsbGJhY2s6e29uU2hvdzpmdW5jdGlvbigpe2Eubm90eS50aGVtZXMuZGVmYXVsdFRoZW1lLmhlbHBlcnMuYm9yZGVyRml4LmFwcGx5KHRoaXMpfSxvbkNsb3NlOmZ1bmN0aW9uKCl7YS5ub3R5LnRoZW1lcy5kZWZhdWx0VGhlbWUuaGVscGVycy5ib3JkZXJGaXguYXBwbHkodGhpcyl9fX0sYS5ub3R5LnRoZW1lcy5yZWxheD17bmFtZTpcInJlbGF4XCIsaGVscGVyczp7fSxtb2RhbDp7Y3NzOntwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIxMDAlXCIsaGVpZ2h0OlwiMTAwJVwiLGJhY2tncm91bmRDb2xvcjpcIiMwMDBcIix6SW5kZXg6MWU0LG9wYWNpdHk6LjYsZGlzcGxheTpcIm5vbmVcIixsZWZ0OjAsdG9wOjB9fSxzdHlsZTpmdW5jdGlvbigpe3N3aXRjaCh0aGlzLiRiYXIuY3NzKHtvdmVyZmxvdzpcImhpZGRlblwiLG1hcmdpbjpcIjRweCAwXCIsYm9yZGVyUmFkaXVzOlwiMnB4XCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxNHB4XCIsbGluZUhlaWdodDpcIjE2cHhcIix0ZXh0QWxpZ246XCJjZW50ZXJcIixwYWRkaW5nOlwiMTBweFwiLHdpZHRoOlwiYXV0b1wiLHBvc2l0aW9uOlwicmVsYXRpdmVcIn0pLHRoaXMuJGNsb3NlQnV0dG9uLmNzcyh7cG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDo0LHJpZ2h0OjQsd2lkdGg6MTAsaGVpZ2h0OjEwLGJhY2tncm91bmQ6XCJ1cmwoZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBb0FBQUFLQ0FRQUFBQW5Pd2MyQUFBQXhVbEVRVlI0QVIzTVBVb0RVUlNBMGUrK3VTa2tPeEMzSUFPV050YUNJRGFDaGZnWEJNRVpiUVJCeXhDd2srQmFzZ1FSWkxTWW9MZ0RRYkFSeHJ5OG55dW1QY1ZSS0RmZDBBYThBc2dEdjF6cDZwWWQ1aldPd2h2ZWJSVGJ6Tk5FdzVCU3NJcHNqL2t1clFCbm1rN3NJRmNDRjV5eVpQRFJHNnRyUWh1alhZb3NhRm9jKzJmMU1KODl1Yzc2SU5ENkY5QnZsWFVkcGI2eHdEMis0cTNtZTNieXNpSHZ0TFlyVUp0bzdQRC92ZTdMTkh4U2cvd29OMmtTejR0eGFzQmRoeWl6M3VnUEdldFRqbTNYUm9rQUFBQUFTVVZPUks1Q1lJST0pXCIsZGlzcGxheTpcIm5vbmVcIixjdXJzb3I6XCJwb2ludGVyXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7cGFkZGluZzo1LHRleHRBbGlnbjpcInJpZ2h0XCIsYm9yZGVyVG9wOlwiMXB4IHNvbGlkICNjY2NcIixiYWNrZ3JvdW5kQ29sb3I6XCIjZmZmXCJ9KSx0aGlzLiRidXR0b25zLmZpbmQoXCJidXR0b25cIikuY3NzKHttYXJnaW5MZWZ0OjV9KSx0aGlzLiRidXR0b25zLmZpbmQoXCJidXR0b246Zmlyc3RcIikuY3NzKHttYXJnaW5MZWZ0OjB9KSx0aGlzLiRiYXIub24oe21vdXNlZW50ZXI6ZnVuY3Rpb24oKXthKHRoaXMpLmZpbmQoXCIubm90eV9jbG9zZVwiKS5zdG9wKCkuZmFkZVRvKFwibm9ybWFsXCIsMSl9LG1vdXNlbGVhdmU6ZnVuY3Rpb24oKXthKHRoaXMpLmZpbmQoXCIubm90eV9jbG9zZVwiKS5zdG9wKCkuZmFkZVRvKFwibm9ybWFsXCIsMCl9fSksdGhpcy5vcHRpb25zLmxheW91dC5uYW1lKXtjYXNlXCJ0b3BcIjp0aGlzLiRiYXIuY3NzKHtib3JkZXJCb3R0b206XCIycHggc29saWQgI2VlZVwiLGJvcmRlckxlZnQ6XCIycHggc29saWQgI2VlZVwiLGJvcmRlclJpZ2h0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJUb3A6XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pO2JyZWFrO2Nhc2VcInRvcENlbnRlclwiOmNhc2VcImNlbnRlclwiOmNhc2VcImJvdHRvbUNlbnRlclwiOmNhc2VcImlubGluZVwiOnRoaXMuJGJhci5jc3Moe2JvcmRlcjpcIjFweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTNweFwiLHRleHRBbGlnbjpcImNlbnRlclwifSk7YnJlYWs7Y2FzZVwidG9wTGVmdFwiOmNhc2VcInRvcFJpZ2h0XCI6Y2FzZVwiYm90dG9tTGVmdFwiOmNhc2VcImJvdHRvbVJpZ2h0XCI6Y2FzZVwiY2VudGVyTGVmdFwiOmNhc2VcImNlbnRlclJpZ2h0XCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyOlwiMXB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsdGV4dEFsaWduOlwibGVmdFwifSk7YnJlYWs7Y2FzZVwiYm90dG9tXCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyVG9wOlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJMZWZ0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJSaWdodDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyQm90dG9tOlwiMnB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIC0ycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSk7YnJlYWs7ZGVmYXVsdDp0aGlzLiRiYXIuY3NzKHtib3JkZXI6XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pfXN3aXRjaCh0aGlzLm9wdGlvbnMudHlwZSl7Y2FzZVwiYWxlcnRcIjpjYXNlXCJub3RpZmljYXRpb25cIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkZGXCIsYm9yZGVyQ29sb3I6XCIjZGVkZWRlXCIsY29sb3I6XCIjNDQ0XCJ9KTticmVhaztjYXNlXCJ3YXJuaW5nXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGRUFBOFwiLGJvcmRlckNvbG9yOlwiI0ZGQzIzN1wiLGNvbG9yOlwiIzgyNjIwMFwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjRkZDMjM3XCJ9KTticmVhaztjYXNlXCJlcnJvclwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRjgxODFcIixib3JkZXJDb2xvcjpcIiNlMjUzNTNcIixjb2xvcjpcIiNGRkZcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250V2VpZ2h0OlwiYm9sZFwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCBkYXJrcmVkXCJ9KTticmVhaztjYXNlXCJpbmZvcm1hdGlvblwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiM3OEM1RTdcIixib3JkZXJDb2xvcjpcIiMzYmFkZDZcIixjb2xvcjpcIiNGRkZcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtib3JkZXJUb3A6XCIxcHggc29saWQgIzBCOTBDNFwifSk7YnJlYWs7Y2FzZVwic3VjY2Vzc1wiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNCQ0Y1QkNcIixib3JkZXJDb2xvcjpcIiM3Y2RkNzdcIixjb2xvcjpcImRhcmtncmVlblwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjNTBDMjRFXCJ9KTticmVhaztkZWZhdWx0OnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkZcIixib3JkZXJDb2xvcjpcIiNDQ0NcIixjb2xvcjpcIiM0NDRcIn0pfX0sY2FsbGJhY2s6e29uU2hvdzpmdW5jdGlvbigpe30sb25DbG9zZTpmdW5jdGlvbigpe319fSx3aW5kb3cubm90eX0pOyIsImpRdWVyeShkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcclxuXHQvL2NhY2hlIERPTSBlbGVtZW50c1xyXG5cdHZhciBtYWluQ29udGVudCA9ICQoJy5jZC1tYWluLWNvbnRlbnQnKSxcclxuXHRcdGhlYWRlciA9ICQoJy5jZC1tYWluLWhlYWRlcicpLFxyXG5cdFx0c2lkZWJhciA9ICQoJy5jZC1zaWRlLW5hdicpLFxyXG5cdFx0c2lkZWJhclRyaWdnZXIgPSAkKCcuY2QtbmF2LXRyaWdnZXInKSxcclxuXHRcdHRvcE5hdmlnYXRpb24gPSAkKCcuY2QtdG9wLW5hdicpLFxyXG5cdFx0c2VhcmNoRm9ybSA9ICQoJy5jZC1zZWFyY2gnKSxcclxuXHRcdGFjY291bnRJbmZvID0gJCgnLmFjY291bnQnKTtcclxuXHJcblx0Ly9vbiByZXNpemUsIG1vdmUgc2VhcmNoIGFuZCB0b3AgbmF2IHBvc2l0aW9uIGFjY29yZGluZyB0byB3aW5kb3cgd2lkdGhcclxuXHR2YXIgcmVzaXppbmcgPSBmYWxzZTtcclxuXHRtb3ZlTmF2aWdhdGlvbigpO1xyXG5cdCQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24oKXtcclxuXHRcdGlmKCAhcmVzaXppbmcgKSB7XHJcblx0XHRcdCghd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSkgPyBzZXRUaW1lb3V0KG1vdmVOYXZpZ2F0aW9uLCAzMDApIDogd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShtb3ZlTmF2aWdhdGlvbik7XHJcblx0XHRcdHJlc2l6aW5nID0gdHJ1ZTtcclxuXHRcdH1cclxuXHR9KTtcclxuXHJcblx0Ly9vbiB3aW5kb3cgc2Nyb2xsaW5nIC0gZml4IHNpZGViYXIgbmF2XHJcblx0dmFyIHNjcm9sbGluZyA9IGZhbHNlO1xyXG5cdGNoZWNrU2Nyb2xsYmFyUG9zaXRpb24oKTtcclxuXHQkKHdpbmRvdykub24oJ3Njcm9sbCcsIGZ1bmN0aW9uKCl7XHJcblx0XHRpZiggIXNjcm9sbGluZyApIHtcclxuXHRcdFx0KCF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKSA/IHNldFRpbWVvdXQoY2hlY2tTY3JvbGxiYXJQb3NpdGlvbiwgMzAwKSA6IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2hlY2tTY3JvbGxiYXJQb3NpdGlvbik7XHJcblx0XHRcdHNjcm9sbGluZyA9IHRydWU7XHJcblx0XHR9XHJcblx0fSk7XHJcblxyXG5cdC8vbW9iaWxlIG9ubHkgLSBvcGVuIHNpZGViYXIgd2hlbiB1c2VyIGNsaWNrcyB0aGUgaGFtYnVyZ2VyIG1lbnVcclxuXHRzaWRlYmFyVHJpZ2dlci5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCl7XHJcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0JChbc2lkZWJhciwgc2lkZWJhclRyaWdnZXJdKS50b2dnbGVDbGFzcygnbmF2LWlzLXZpc2libGUnKTtcclxuXHR9KTtcclxuXHJcblx0Ly9jbGljayBvbiBpdGVtIGFuZCBzaG93IHN1Ym1lbnVcclxuXHQkKCcuaGFzLWNoaWxkcmVuID4gYScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KXtcclxuXHRcdHZhciBtcSA9IGNoZWNrTVEoKSxcclxuXHRcdFx0c2VsZWN0ZWRJdGVtID0gJCh0aGlzKTtcclxuXHRcdGlmKCBtcSA9PSAnbW9iaWxlJyB8fCBtcSA9PSAndGFibGV0JyApIHtcclxuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0aWYoIHNlbGVjdGVkSXRlbS5wYXJlbnQoJ2xpJykuaGFzQ2xhc3MoJ3NlbGVjdGVkJykpIHtcclxuXHRcdFx0XHRzZWxlY3RlZEl0ZW0ucGFyZW50KCdsaScpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHNpZGViYXIuZmluZCgnLmhhcy1jaGlsZHJlbi5zZWxlY3RlZCcpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xyXG5cdFx0XHRcdGFjY291bnRJbmZvLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xyXG5cdFx0XHRcdHNlbGVjdGVkSXRlbS5wYXJlbnQoJ2xpJykuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9KTtcclxuXHJcblx0Ly9jbGljayBvbiBhY2NvdW50IGFuZCBzaG93IHN1Ym1lbnUgLSBkZXNrdG9wIHZlcnNpb24gb25seVxyXG5cdGFjY291bnRJbmZvLmNoaWxkcmVuKCdhJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpe1xyXG5cdFx0dmFyIG1xID0gY2hlY2tNUSgpLFxyXG5cdFx0XHRzZWxlY3RlZEl0ZW0gPSAkKHRoaXMpO1xyXG5cdFx0aWYoIG1xID09ICdkZXNrdG9wJykge1xyXG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRhY2NvdW50SW5mby50b2dnbGVDbGFzcygnc2VsZWN0ZWQnKTtcclxuXHRcdFx0c2lkZWJhci5maW5kKCcuaGFzLWNoaWxkcmVuLnNlbGVjdGVkJykucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XHJcblx0XHR9XHJcblx0fSk7XHJcblxyXG5cdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KXtcclxuXHRcdGlmKCAhJChldmVudC50YXJnZXQpLmlzKCcuaGFzLWNoaWxkcmVuIGEnKSApIHtcclxuXHRcdFx0c2lkZWJhci5maW5kKCcuaGFzLWNoaWxkcmVuLnNlbGVjdGVkJykucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XHJcblx0XHRcdGFjY291bnRJbmZvLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG5cclxuXHQvL29uIGRlc2t0b3AgLSBkaWZmZXJlbnRpYXRlIGJldHdlZW4gYSB1c2VyIHRyeWluZyB0byBob3ZlciBvdmVyIGEgZHJvcGRvd24gaXRlbSB2cyB0cnlpbmcgdG8gbmF2aWdhdGUgaW50byBhIHN1Ym1lbnUncyBjb250ZW50c1xyXG5cdHNpZGViYXIuY2hpbGRyZW4oJ3VsJykubWVudUFpbSh7XHJcbiAgICAgICAgYWN0aXZhdGU6IGZ1bmN0aW9uKHJvdykge1xyXG4gICAgICAgIFx0JChyb3cpLmFkZENsYXNzKCdob3ZlcicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVhY3RpdmF0ZTogZnVuY3Rpb24ocm93KSB7XHJcbiAgICAgICAgXHQkKHJvdykucmVtb3ZlQ2xhc3MoJ2hvdmVyJyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBleGl0TWVudTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgXHRzaWRlYmFyLmZpbmQoJy5ob3ZlcicpLnJlbW92ZUNsYXNzKCdob3ZlcicpO1xyXG4gICAgICAgIFx0cmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdWJtZW51U2VsZWN0b3I6IFwiLmhhcy1jaGlsZHJlblwiLFxyXG4gICAgfSk7XHJcblxyXG5cdGZ1bmN0aW9uIGNoZWNrTVEoKSB7XHJcblx0XHQvL2NoZWNrIGlmIG1vYmlsZSBvciBkZXNrdG9wIGRldmljZVxyXG5cdFx0cmV0dXJuIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jZC1tYWluLWNvbnRlbnQnKSwgJzo6YmVmb3JlJykuZ2V0UHJvcGVydHlWYWx1ZSgnY29udGVudCcpLnJlcGxhY2UoLycvZywgXCJcIikucmVwbGFjZSgvXCIvZywgXCJcIik7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBtb3ZlTmF2aWdhdGlvbigpe1xyXG4gIFx0XHR2YXIgbXEgPSBjaGVja01RKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKCBtcSA9PSAnbW9iaWxlJyAmJiB0b3BOYXZpZ2F0aW9uLnBhcmVudHMoJy5jZC1zaWRlLW5hdicpLmxlbmd0aCA9PSAwICkge1xyXG4gICAgICAgIFx0ZGV0YWNoRWxlbWVudHMoKTtcclxuXHRcdFx0dG9wTmF2aWdhdGlvbi5hcHBlbmRUbyhzaWRlYmFyKTtcclxuXHRcdFx0c2VhcmNoRm9ybS5yZW1vdmVDbGFzcygnaXMtaGlkZGVuJykucHJlcGVuZFRvKHNpZGViYXIpO1xyXG5cdFx0fSBlbHNlIGlmICggKCBtcSA9PSAndGFibGV0JyB8fCBtcSA9PSAnZGVza3RvcCcpICYmICB0b3BOYXZpZ2F0aW9uLnBhcmVudHMoJy5jZC1zaWRlLW5hdicpLmxlbmd0aCA+IDAgKSB7XHJcblx0XHRcdGRldGFjaEVsZW1lbnRzKCk7XHJcblx0XHRcdHNlYXJjaEZvcm0uaW5zZXJ0QWZ0ZXIoaGVhZGVyLmZpbmQoJy5jZC1sb2dvJykpO1xyXG5cdFx0XHR0b3BOYXZpZ2F0aW9uLmFwcGVuZFRvKGhlYWRlci5maW5kKCcuY2QtbmF2JykpO1xyXG5cdFx0fVxyXG5cdFx0Y2hlY2tTZWxlY3RlZChtcSk7XHJcblx0XHRyZXNpemluZyA9IGZhbHNlO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZGV0YWNoRWxlbWVudHMoKSB7XHJcblx0XHR0b3BOYXZpZ2F0aW9uLmRldGFjaCgpO1xyXG5cdFx0c2VhcmNoRm9ybS5kZXRhY2goKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNoZWNrU2VsZWN0ZWQobXEpIHtcclxuXHRcdC8vb24gZGVza3RvcCwgcmVtb3ZlIHNlbGVjdGVkIGNsYXNzIGZyb20gaXRlbXMgc2VsZWN0ZWQgb24gbW9iaWxlL3RhYmxldCB2ZXJzaW9uXHJcblx0XHRpZiggbXEgPT0gJ2Rlc2t0b3AnICkgJCgnLmhhcy1jaGlsZHJlbi5zZWxlY3RlZCcpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gY2hlY2tTY3JvbGxiYXJQb3NpdGlvbigpIHtcclxuXHRcdHZhciBtcSA9IGNoZWNrTVEoKTtcclxuXHRcdFxyXG5cdFx0aWYoIG1xICE9ICdtb2JpbGUnICkge1xyXG5cdFx0XHR2YXIgc2lkZWJhckhlaWdodCA9IHNpZGViYXIub3V0ZXJIZWlnaHQoKSxcclxuXHRcdFx0XHR3aW5kb3dIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCksXHJcblx0XHRcdFx0bWFpbkNvbnRlbnRIZWlnaHQgPSBtYWluQ29udGVudC5vdXRlckhlaWdodCgpLFxyXG5cdFx0XHRcdHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcclxuXHJcblx0XHRcdCggKCBzY3JvbGxUb3AgKyB3aW5kb3dIZWlnaHQgPiBzaWRlYmFySGVpZ2h0ICkgJiYgKCBtYWluQ29udGVudEhlaWdodCAtIHNpZGViYXJIZWlnaHQgIT0gMCApICkgPyBzaWRlYmFyLmFkZENsYXNzKCdpcy1maXhlZCcpLmNzcygnYm90dG9tJywgMCkgOiBzaWRlYmFyLnJlbW92ZUNsYXNzKCdpcy1maXhlZCcpLmF0dHIoJ3N0eWxlJywgJycpO1xyXG5cdFx0fVxyXG5cdFx0c2Nyb2xsaW5nID0gZmFsc2U7XHJcblx0fVxyXG59KTsiLCIvKiFcclxuICogTW9ja0pheCAtIGpRdWVyeSBQbHVnaW4gdG8gTW9jayBBamF4IHJlcXVlc3RzXHJcbiAqXHJcbiAqIFZlcnNpb246ICAxLjUuM1xyXG4gKiBSZWxlYXNlZDpcclxuICogSG9tZTogICBodHRwOi8vZ2l0aHViLmNvbS9hcHBlbmR0by9qcXVlcnktbW9ja2pheFxyXG4gKiBBdXRob3I6ICAgSm9uYXRoYW4gU2hhcnAgKGh0dHA6Ly9qZHNoYXJwLmNvbSlcclxuICogTGljZW5zZTogIE1JVCxHUExcclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDExIGFwcGVuZFRvIExMQy5cclxuICogRHVhbCBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIG9yIEdQTCBsaWNlbnNlcy5cclxuICogaHR0cDovL2FwcGVuZHRvLmNvbS9vcGVuLXNvdXJjZS1saWNlbnNlc1xyXG4gKi9cclxuKGZ1bmN0aW9uKCQpIHtcclxuXHR2YXIgX2FqYXggPSAkLmFqYXgsXHJcblx0XHRtb2NrSGFuZGxlcnMgPSBbXSxcclxuXHRcdG1vY2tlZEFqYXhDYWxscyA9IFtdLFxyXG5cdFx0Q0FMTEJBQ0tfUkVHRVggPSAvPVxcPygmfCQpLyxcclxuXHRcdGpzYyA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XHJcblxyXG5cclxuXHQvLyBQYXJzZSB0aGUgZ2l2ZW4gWE1MIHN0cmluZy5cclxuXHRmdW5jdGlvbiBwYXJzZVhNTCh4bWwpIHtcclxuXHRcdGlmICggd2luZG93LkRPTVBhcnNlciA9PSB1bmRlZmluZWQgJiYgd2luZG93LkFjdGl2ZVhPYmplY3QgKSB7XHJcblx0XHRcdERPTVBhcnNlciA9IGZ1bmN0aW9uKCkgeyB9O1xyXG5cdFx0XHRET01QYXJzZXIucHJvdG90eXBlLnBhcnNlRnJvbVN0cmluZyA9IGZ1bmN0aW9uKCB4bWxTdHJpbmcgKSB7XHJcblx0XHRcdFx0dmFyIGRvYyA9IG5ldyBBY3RpdmVYT2JqZWN0KCdNaWNyb3NvZnQuWE1MRE9NJyk7XHJcblx0XHRcdFx0ZG9jLmFzeW5jID0gJ2ZhbHNlJztcclxuXHRcdFx0XHRkb2MubG9hZFhNTCggeG1sU3RyaW5nICk7XHJcblx0XHRcdFx0cmV0dXJuIGRvYztcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHJcblx0XHR0cnkge1xyXG5cdFx0XHR2YXIgeG1sRG9jID0gKCBuZXcgRE9NUGFyc2VyKCkgKS5wYXJzZUZyb21TdHJpbmcoIHhtbCwgJ3RleHQveG1sJyApO1xyXG5cdFx0XHRpZiAoICQuaXNYTUxEb2MoIHhtbERvYyApICkge1xyXG5cdFx0XHRcdHZhciBlcnIgPSAkKCdwYXJzZXJlcnJvcicsIHhtbERvYyk7XHJcblx0XHRcdFx0aWYgKCBlcnIubGVuZ3RoID09IDEgKSB7XHJcblx0XHRcdFx0XHR0aHJvdygnRXJyb3I6ICcgKyAkKHhtbERvYykudGV4dCgpICk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRocm93KCdVbmFibGUgdG8gcGFyc2UgWE1MJyk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHhtbERvYztcclxuXHRcdH0gY2F0Y2goIGUgKSB7XHJcblx0XHRcdHZhciBtc2cgPSAoIGUubmFtZSA9PSB1bmRlZmluZWQgPyBlIDogZS5uYW1lICsgJzogJyArIGUubWVzc2FnZSApO1xyXG5cdFx0XHQkKGRvY3VtZW50KS50cmlnZ2VyKCd4bWxQYXJzZUVycm9yJywgWyBtc2cgXSk7XHJcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBUcmlnZ2VyIGEgalF1ZXJ5IGV2ZW50XHJcblx0ZnVuY3Rpb24gdHJpZ2dlcihzLCB0eXBlLCBhcmdzKSB7XHJcblx0XHQocy5jb250ZXh0ID8gJChzLmNvbnRleHQpIDogJC5ldmVudCkudHJpZ2dlcih0eXBlLCBhcmdzKTtcclxuXHR9XHJcblxyXG5cdC8vIENoZWNrIGlmIHRoZSBkYXRhIGZpZWxkIG9uIHRoZSBtb2NrIGhhbmRsZXIgYW5kIHRoZSByZXF1ZXN0IG1hdGNoLiBUaGlzXHJcblx0Ly8gY2FuIGJlIHVzZWQgdG8gcmVzdHJpY3QgYSBtb2NrIGhhbmRsZXIgdG8gYmVpbmcgdXNlZCBvbmx5IHdoZW4gYSBjZXJ0YWluXHJcblx0Ly8gc2V0IG9mIGRhdGEgaXMgcGFzc2VkIHRvIGl0LlxyXG5cdGZ1bmN0aW9uIGlzTW9ja0RhdGFFcXVhbCggbW9jaywgbGl2ZSApIHtcclxuXHRcdHZhciBpZGVudGljYWwgPSB0cnVlO1xyXG5cdFx0Ly8gVGVzdCBmb3Igc2l0dWF0aW9ucyB3aGVyZSB0aGUgZGF0YSBpcyBhIHF1ZXJ5c3RyaW5nIChub3QgYW4gb2JqZWN0KVxyXG5cdFx0aWYgKHR5cGVvZiBsaXZlID09PSAnc3RyaW5nJykge1xyXG5cdFx0XHQvLyBRdWVyeXN0cmluZyBtYXkgYmUgYSByZWdleFxyXG5cdFx0XHRyZXR1cm4gJC5pc0Z1bmN0aW9uKCBtb2NrLnRlc3QgKSA/IG1vY2sudGVzdChsaXZlKSA6IG1vY2sgPT0gbGl2ZTtcclxuXHRcdH1cclxuXHRcdCQuZWFjaChtb2NrLCBmdW5jdGlvbihrKSB7XHJcblx0XHRcdGlmICggbGl2ZVtrXSA9PT0gdW5kZWZpbmVkICkge1xyXG5cdFx0XHRcdGlkZW50aWNhbCA9IGZhbHNlO1xyXG5cdFx0XHRcdHJldHVybiBpZGVudGljYWw7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aWYgKCB0eXBlb2YgbGl2ZVtrXSA9PT0gJ29iamVjdCcgJiYgbGl2ZVtrXSAhPT0gbnVsbCApIHtcclxuXHRcdFx0XHRcdGlmICggaWRlbnRpY2FsICYmICQuaXNBcnJheSggbGl2ZVtrXSApICkge1xyXG5cdFx0XHRcdFx0XHRpZGVudGljYWwgPSAkLmlzQXJyYXkoIG1vY2tba10gKSAmJiBsaXZlW2tdLmxlbmd0aCA9PT0gbW9ja1trXS5sZW5ndGg7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZGVudGljYWwgPSBpZGVudGljYWwgJiYgaXNNb2NrRGF0YUVxdWFsKG1vY2tba10sIGxpdmVba10pO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRpZiAoIG1vY2tba10gJiYgJC5pc0Z1bmN0aW9uKCBtb2NrW2tdLnRlc3QgKSApIHtcclxuXHRcdFx0XHRcdFx0aWRlbnRpY2FsID0gaWRlbnRpY2FsICYmIG1vY2tba10udGVzdChsaXZlW2tdKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdGlkZW50aWNhbCA9IGlkZW50aWNhbCAmJiAoIG1vY2tba10gPT0gbGl2ZVtrXSApO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0cmV0dXJuIGlkZW50aWNhbDtcclxuXHR9XHJcblxyXG4gICAgLy8gU2VlIGlmIGEgbW9jayBoYW5kbGVyIHByb3BlcnR5IG1hdGNoZXMgdGhlIGRlZmF1bHQgc2V0dGluZ3NcclxuICAgIGZ1bmN0aW9uIGlzRGVmYXVsdFNldHRpbmcoaGFuZGxlciwgcHJvcGVydHkpIHtcclxuICAgICAgICByZXR1cm4gaGFuZGxlcltwcm9wZXJ0eV0gPT09ICQubW9ja2pheFNldHRpbmdzW3Byb3BlcnR5XTtcclxuICAgIH1cclxuXHJcblx0Ly8gQ2hlY2sgdGhlIGdpdmVuIGhhbmRsZXIgc2hvdWxkIG1vY2sgdGhlIGdpdmVuIHJlcXVlc3RcclxuXHRmdW5jdGlvbiBnZXRNb2NrRm9yUmVxdWVzdCggaGFuZGxlciwgcmVxdWVzdFNldHRpbmdzICkge1xyXG5cdFx0Ly8gSWYgdGhlIG1vY2sgd2FzIHJlZ2lzdGVyZWQgd2l0aCBhIGZ1bmN0aW9uLCBsZXQgdGhlIGZ1bmN0aW9uIGRlY2lkZSBpZiB3ZVxyXG5cdFx0Ly8gd2FudCB0byBtb2NrIHRoaXMgcmVxdWVzdFxyXG5cdFx0aWYgKCAkLmlzRnVuY3Rpb24oaGFuZGxlcikgKSB7XHJcblx0XHRcdHJldHVybiBoYW5kbGVyKCByZXF1ZXN0U2V0dGluZ3MgKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBJbnNwZWN0IHRoZSBVUkwgb2YgdGhlIHJlcXVlc3QgYW5kIGNoZWNrIGlmIHRoZSBtb2NrIGhhbmRsZXIncyB1cmxcclxuXHRcdC8vIG1hdGNoZXMgdGhlIHVybCBmb3IgdGhpcyBhamF4IHJlcXVlc3RcclxuXHRcdGlmICggJC5pc0Z1bmN0aW9uKGhhbmRsZXIudXJsLnRlc3QpICkge1xyXG5cdFx0XHQvLyBUaGUgdXNlciBwcm92aWRlZCBhIHJlZ2V4IGZvciB0aGUgdXJsLCB0ZXN0IGl0XHJcblx0XHRcdGlmICggIWhhbmRsZXIudXJsLnRlc3QoIHJlcXVlc3RTZXR0aW5ncy51cmwgKSApIHtcclxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gTG9vayBmb3IgYSBzaW1wbGUgd2lsZGNhcmQgJyonIG9yIGEgZGlyZWN0IFVSTCBtYXRjaFxyXG5cdFx0XHR2YXIgc3RhciA9IGhhbmRsZXIudXJsLmluZGV4T2YoJyonKTtcclxuXHRcdFx0aWYgKGhhbmRsZXIudXJsICE9PSByZXF1ZXN0U2V0dGluZ3MudXJsICYmIHN0YXIgPT09IC0xIHx8XHJcblx0XHRcdFx0XHQhbmV3IFJlZ0V4cChoYW5kbGVyLnVybC5yZXBsYWNlKC9bLVtcXF17fSgpKz8uLFxcXFxeJHwjXFxzXS9nLCBcIlxcXFwkJlwiKS5yZXBsYWNlKC9cXCovZywgJy4rJykpLnRlc3QocmVxdWVzdFNldHRpbmdzLnVybCkpIHtcclxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEluc3BlY3QgdGhlIGRhdGEgc3VibWl0dGVkIGluIHRoZSByZXF1ZXN0IChlaXRoZXIgUE9TVCBib2R5IG9yIEdFVCBxdWVyeSBzdHJpbmcpXHJcblx0XHRpZiAoIGhhbmRsZXIuZGF0YSApIHtcclxuXHRcdFx0aWYgKCAhIHJlcXVlc3RTZXR0aW5ncy5kYXRhIHx8ICFpc01vY2tEYXRhRXF1YWwoaGFuZGxlci5kYXRhLCByZXF1ZXN0U2V0dGluZ3MuZGF0YSkgKSB7XHJcblx0XHRcdFx0Ly8gVGhleSdyZSBub3QgaWRlbnRpY2FsLCBkbyBub3QgbW9jayB0aGlzIHJlcXVlc3RcclxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly8gSW5zcGVjdCB0aGUgcmVxdWVzdCB0eXBlXHJcblx0XHRpZiAoIGhhbmRsZXIgJiYgaGFuZGxlci50eXBlICYmXHJcblx0XHRcdFx0aGFuZGxlci50eXBlLnRvTG93ZXJDYXNlKCkgIT0gcmVxdWVzdFNldHRpbmdzLnR5cGUudG9Mb3dlckNhc2UoKSApIHtcclxuXHRcdFx0Ly8gVGhlIHJlcXVlc3QgdHlwZSBkb2Vzbid0IG1hdGNoIChHRVQgdnMuIFBPU1QpXHJcblx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBoYW5kbGVyO1xyXG5cdH1cclxuXHJcblx0Ly8gUHJvY2VzcyB0aGUgeGhyIG9iamVjdHMgc2VuZCBvcGVyYXRpb25cclxuXHRmdW5jdGlvbiBfeGhyU2VuZChtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MpIHtcclxuXHJcblx0XHQvLyBUaGlzIGlzIGEgc3Vic3RpdHV0ZSBmb3IgPCAxLjQgd2hpY2ggbGFja3MgJC5wcm94eVxyXG5cdFx0dmFyIHByb2Nlc3MgPSAoZnVuY3Rpb24odGhhdCkge1xyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0cmV0dXJuIChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdHZhciBvblJlYWR5O1xyXG5cclxuXHRcdFx0XHRcdC8vIFRoZSByZXF1ZXN0IGhhcyByZXR1cm5lZFxyXG5cdFx0XHRcdFx0dGhpcy5zdGF0dXMgICAgID0gbW9ja0hhbmRsZXIuc3RhdHVzO1xyXG5cdFx0XHRcdFx0dGhpcy5zdGF0dXNUZXh0ID0gbW9ja0hhbmRsZXIuc3RhdHVzVGV4dDtcclxuXHRcdFx0XHRcdHRoaXMucmVhZHlTdGF0ZVx0PSA0O1xyXG5cclxuXHRcdFx0XHRcdC8vIFdlIGhhdmUgYW4gZXhlY3V0YWJsZSBmdW5jdGlvbiwgY2FsbCBpdCB0byBnaXZlXHJcblx0XHRcdFx0XHQvLyB0aGUgbW9jayBoYW5kbGVyIGEgY2hhbmNlIHRvIHVwZGF0ZSBpdCdzIGRhdGFcclxuXHRcdFx0XHRcdGlmICggJC5pc0Z1bmN0aW9uKG1vY2tIYW5kbGVyLnJlc3BvbnNlKSApIHtcclxuXHRcdFx0XHRcdFx0bW9ja0hhbmRsZXIucmVzcG9uc2Uob3JpZ1NldHRpbmdzKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8vIENvcHkgb3ZlciBvdXIgbW9jayB0byBvdXIgeGhyIG9iamVjdCBiZWZvcmUgcGFzc2luZyBjb250cm9sIGJhY2sgdG9cclxuXHRcdFx0XHRcdC8vIGpRdWVyeSdzIG9ucmVhZHlzdGF0ZWNoYW5nZSBjYWxsYmFja1xyXG5cdFx0XHRcdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgPT0gJ2pzb24nICYmICggdHlwZW9mIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCA9PSAnb2JqZWN0JyApICkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLnJlc3BvbnNlVGV4dCA9IEpTT04uc3RyaW5naWZ5KG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCk7XHJcblx0XHRcdFx0XHR9IGVsc2UgaWYgKCByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgPT0gJ3htbCcgKSB7XHJcblx0XHRcdFx0XHRcdGlmICggdHlwZW9mIG1vY2tIYW5kbGVyLnJlc3BvbnNlWE1MID09ICdzdHJpbmcnICkge1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2VYTUwgPSBwYXJzZVhNTChtb2NrSGFuZGxlci5yZXNwb25zZVhNTCk7XHJcblx0XHRcdFx0XHRcdFx0Ly9pbiBqUXVlcnkgMS45LjErLCByZXNwb25zZVhNTCBpcyBwcm9jZXNzZWQgZGlmZmVyZW50bHkgYW5kIHJlbGllcyBvbiByZXNwb25zZVRleHRcclxuXHRcdFx0XHRcdFx0XHR0aGlzLnJlc3BvbnNlVGV4dCA9IG1vY2tIYW5kbGVyLnJlc3BvbnNlWE1MO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2VYTUwgPSBtb2NrSGFuZGxlci5yZXNwb25zZVhNTDtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5yZXNwb25zZVRleHQgPSBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQ7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZiggdHlwZW9mIG1vY2tIYW5kbGVyLnN0YXR1cyA9PSAnbnVtYmVyJyB8fCB0eXBlb2YgbW9ja0hhbmRsZXIuc3RhdHVzID09ICdzdHJpbmcnICkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLnN0YXR1cyA9IG1vY2tIYW5kbGVyLnN0YXR1cztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGlmKCB0eXBlb2YgbW9ja0hhbmRsZXIuc3RhdHVzVGV4dCA9PT0gXCJzdHJpbmdcIikge1xyXG5cdFx0XHRcdFx0XHR0aGlzLnN0YXR1c1RleHQgPSBtb2NrSGFuZGxlci5zdGF0dXNUZXh0O1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0Ly8galF1ZXJ5IDIuMCByZW5hbWVkIG9ucmVhZHlzdGF0ZWNoYW5nZSB0byBvbmxvYWRcclxuXHRcdFx0XHRcdG9uUmVhZHkgPSB0aGlzLm9ucmVhZHlzdGF0ZWNoYW5nZSB8fCB0aGlzLm9ubG9hZDtcclxuXHJcblx0XHRcdFx0XHQvLyBqUXVlcnkgPCAxLjQgZG9lc24ndCBoYXZlIG9ucmVhZHlzdGF0ZSBjaGFuZ2UgZm9yIHhoclxyXG5cdFx0XHRcdFx0aWYgKCAkLmlzRnVuY3Rpb24oIG9uUmVhZHkgKSApIHtcclxuXHRcdFx0XHRcdFx0aWYoIG1vY2tIYW5kbGVyLmlzVGltZW91dCkge1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMuc3RhdHVzID0gLTE7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0b25SZWFkeS5jYWxsKCB0aGlzLCBtb2NrSGFuZGxlci5pc1RpbWVvdXQgPyAndGltZW91dCcgOiB1bmRlZmluZWQgKTtcclxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoIG1vY2tIYW5kbGVyLmlzVGltZW91dCApIHtcclxuXHRcdFx0XHRcdFx0Ly8gRml4IGZvciAxLjMuMiB0aW1lb3V0IHRvIGtlZXAgc3VjY2VzcyBmcm9tIGZpcmluZy5cclxuXHRcdFx0XHRcdFx0dGhpcy5zdGF0dXMgPSAtMTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KS5hcHBseSh0aGF0KTtcclxuXHRcdFx0fTtcclxuXHRcdH0pKHRoaXMpO1xyXG5cclxuXHRcdGlmICggbW9ja0hhbmRsZXIucHJveHkgKSB7XHJcblx0XHRcdC8vIFdlJ3JlIHByb3h5aW5nIHRoaXMgcmVxdWVzdCBhbmQgbG9hZGluZyBpbiBhbiBleHRlcm5hbCBmaWxlIGluc3RlYWRcclxuXHRcdFx0X2FqYXgoe1xyXG5cdFx0XHRcdGdsb2JhbDogZmFsc2UsXHJcblx0XHRcdFx0dXJsOiBtb2NrSGFuZGxlci5wcm94eSxcclxuXHRcdFx0XHR0eXBlOiBtb2NrSGFuZGxlci5wcm94eVR5cGUsXHJcblx0XHRcdFx0ZGF0YTogbW9ja0hhbmRsZXIuZGF0YSxcclxuXHRcdFx0XHRkYXRhVHlwZTogcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlID09PSBcInNjcmlwdFwiID8gXCJ0ZXh0L3BsYWluXCIgOiByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUsXHJcblx0XHRcdFx0Y29tcGxldGU6IGZ1bmN0aW9uKHhocikge1xyXG5cdFx0XHRcdFx0bW9ja0hhbmRsZXIucmVzcG9uc2VYTUwgPSB4aHIucmVzcG9uc2VYTUw7XHJcblx0XHRcdFx0XHRtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgPSB4aHIucmVzcG9uc2VUZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIERvbid0IG92ZXJyaWRlIHRoZSBoYW5kbGVyIHN0YXR1cy9zdGF0dXNUZXh0IGlmIGl0J3Mgc3BlY2lmaWVkIGJ5IHRoZSBjb25maWdcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNEZWZhdWx0U2V0dGluZyhtb2NrSGFuZGxlciwgJ3N0YXR1cycpKSB7XHJcblx0XHRcdFx0XHQgICAgbW9ja0hhbmRsZXIuc3RhdHVzID0geGhyLnN0YXR1cztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzRGVmYXVsdFNldHRpbmcobW9ja0hhbmRsZXIsICdzdGF0dXNUZXh0JykpIHtcclxuXHRcdFx0XHRcdCAgICBtb2NrSGFuZGxlci5zdGF0dXNUZXh0ID0geGhyLnN0YXR1c1RleHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuXHRcdFx0XHRcdHRoaXMucmVzcG9uc2VUaW1lciA9IHNldFRpbWVvdXQocHJvY2VzcywgbW9ja0hhbmRsZXIucmVzcG9uc2VUaW1lIHx8IDApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyB0eXBlID09ICdQT1NUJyB8fCAnR0VUJyB8fCAnREVMRVRFJ1xyXG5cdFx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5hc3luYyA9PT0gZmFsc2UgKSB7XHJcblx0XHRcdFx0Ly8gVE9ETzogQmxvY2tpbmcgZGVsYXlcclxuXHRcdFx0XHRwcm9jZXNzKCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy5yZXNwb25zZVRpbWVyID0gc2V0VGltZW91dChwcm9jZXNzLCBtb2NrSGFuZGxlci5yZXNwb25zZVRpbWUgfHwgNTApO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBDb25zdHJ1Y3QgYSBtb2NrZWQgWEhSIE9iamVjdFxyXG5cdGZ1bmN0aW9uIHhocihtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MsIG9yaWdIYW5kbGVyKSB7XHJcblx0XHQvLyBFeHRlbmQgd2l0aCBvdXIgZGVmYXVsdCBtb2NramF4IHNldHRpbmdzXHJcblx0XHRtb2NrSGFuZGxlciA9ICQuZXh0ZW5kKHRydWUsIHt9LCAkLm1vY2tqYXhTZXR0aW5ncywgbW9ja0hhbmRsZXIpO1xyXG5cclxuXHRcdGlmICh0eXBlb2YgbW9ja0hhbmRsZXIuaGVhZGVycyA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuXHRcdFx0bW9ja0hhbmRsZXIuaGVhZGVycyA9IHt9O1xyXG5cdFx0fVxyXG5cdFx0aWYgKCBtb2NrSGFuZGxlci5jb250ZW50VHlwZSApIHtcclxuXHRcdFx0bW9ja0hhbmRsZXIuaGVhZGVyc1snY29udGVudC10eXBlJ10gPSBtb2NrSGFuZGxlci5jb250ZW50VHlwZTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRzdGF0dXM6IG1vY2tIYW5kbGVyLnN0YXR1cyxcclxuXHRcdFx0c3RhdHVzVGV4dDogbW9ja0hhbmRsZXIuc3RhdHVzVGV4dCxcclxuXHRcdFx0cmVhZHlTdGF0ZTogMSxcclxuXHRcdFx0b3BlbjogZnVuY3Rpb24oKSB7IH0sXHJcblx0XHRcdHNlbmQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdG9yaWdIYW5kbGVyLmZpcmVkID0gdHJ1ZTtcclxuXHRcdFx0XHRfeGhyU2VuZC5jYWxsKHRoaXMsIG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncyk7XHJcblx0XHRcdH0sXHJcblx0XHRcdGFib3J0OiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjbGVhclRpbWVvdXQodGhpcy5yZXNwb25zZVRpbWVyKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0c2V0UmVxdWVzdEhlYWRlcjogZnVuY3Rpb24oaGVhZGVyLCB2YWx1ZSkge1xyXG5cdFx0XHRcdG1vY2tIYW5kbGVyLmhlYWRlcnNbaGVhZGVyXSA9IHZhbHVlO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRnZXRSZXNwb25zZUhlYWRlcjogZnVuY3Rpb24oaGVhZGVyKSB7XHJcblx0XHRcdFx0Ly8gJ0xhc3QtbW9kaWZpZWQnLCAnRXRhZycsICdjb250ZW50LXR5cGUnIGFyZSBhbGwgY2hlY2tlZCBieSBqUXVlcnlcclxuXHRcdFx0XHRpZiAoIG1vY2tIYW5kbGVyLmhlYWRlcnMgJiYgbW9ja0hhbmRsZXIuaGVhZGVyc1toZWFkZXJdICkge1xyXG5cdFx0XHRcdFx0Ly8gUmV0dXJuIGFyYml0cmFyeSBoZWFkZXJzXHJcblx0XHRcdFx0XHRyZXR1cm4gbW9ja0hhbmRsZXIuaGVhZGVyc1toZWFkZXJdO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAoIGhlYWRlci50b0xvd2VyQ2FzZSgpID09ICdsYXN0LW1vZGlmaWVkJyApIHtcclxuXHRcdFx0XHRcdHJldHVybiBtb2NrSGFuZGxlci5sYXN0TW9kaWZpZWQgfHwgKG5ldyBEYXRlKCkpLnRvU3RyaW5nKCk7XHJcblx0XHRcdFx0fSBlbHNlIGlmICggaGVhZGVyLnRvTG93ZXJDYXNlKCkgPT0gJ2V0YWcnICkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIG1vY2tIYW5kbGVyLmV0YWcgfHwgJyc7XHJcblx0XHRcdFx0fSBlbHNlIGlmICggaGVhZGVyLnRvTG93ZXJDYXNlKCkgPT0gJ2NvbnRlbnQtdHlwZScgKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gbW9ja0hhbmRsZXIuY29udGVudFR5cGUgfHwgJ3RleHQvcGxhaW4nO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHRcdFx0Z2V0QWxsUmVzcG9uc2VIZWFkZXJzOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR2YXIgaGVhZGVycyA9ICcnO1xyXG5cdFx0XHRcdCQuZWFjaChtb2NrSGFuZGxlci5oZWFkZXJzLCBmdW5jdGlvbihrLCB2KSB7XHJcblx0XHRcdFx0XHRoZWFkZXJzICs9IGsgKyAnOiAnICsgdiArIFwiXFxuXCI7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0cmV0dXJuIGhlYWRlcnM7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHQvLyBQcm9jZXNzIGEgSlNPTlAgbW9jayByZXF1ZXN0LlxyXG5cdGZ1bmN0aW9uIHByb2Nlc3NKc29ucE1vY2soIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyApIHtcclxuXHRcdC8vIEhhbmRsZSBKU09OUCBQYXJhbWV0ZXIgQ2FsbGJhY2tzLCB3ZSBuZWVkIHRvIHJlcGxpY2F0ZSBzb21lIG9mIHRoZSBqUXVlcnkgY29yZSBoZXJlXHJcblx0XHQvLyBiZWNhdXNlIHRoZXJlIGlzbid0IGFuIGVhc3kgaG9vayBmb3IgdGhlIGNyb3NzIGRvbWFpbiBzY3JpcHQgdGFnIG9mIGpzb25wXHJcblxyXG5cdFx0cHJvY2Vzc0pzb25wVXJsKCByZXF1ZXN0U2V0dGluZ3MgKTtcclxuXHJcblx0XHRyZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgPSBcImpzb25cIjtcclxuXHRcdGlmKHJlcXVlc3RTZXR0aW5ncy5kYXRhICYmIENBTExCQUNLX1JFR0VYLnRlc3QocmVxdWVzdFNldHRpbmdzLmRhdGEpIHx8IENBTExCQUNLX1JFR0VYLnRlc3QocmVxdWVzdFNldHRpbmdzLnVybCkpIHtcclxuXHRcdFx0Y3JlYXRlSnNvbnBDYWxsYmFjayhyZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MpO1xyXG5cclxuXHRcdFx0Ly8gV2UgbmVlZCB0byBtYWtlIHN1cmVcclxuXHRcdFx0Ly8gdGhhdCBhIEpTT05QIHN0eWxlIHJlc3BvbnNlIGlzIGV4ZWN1dGVkIHByb3Blcmx5XHJcblxyXG5cdFx0XHR2YXIgcnVybCA9IC9eKFxcdys6KT9cXC9cXC8oW15cXC8/I10rKS8sXHJcblx0XHRcdFx0cGFydHMgPSBydXJsLmV4ZWMoIHJlcXVlc3RTZXR0aW5ncy51cmwgKSxcclxuXHRcdFx0XHRyZW1vdGUgPSBwYXJ0cyAmJiAocGFydHNbMV0gJiYgcGFydHNbMV0gIT09IGxvY2F0aW9uLnByb3RvY29sIHx8IHBhcnRzWzJdICE9PSBsb2NhdGlvbi5ob3N0KTtcclxuXHJcblx0XHRcdHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSA9IFwic2NyaXB0XCI7XHJcblx0XHRcdGlmKHJlcXVlc3RTZXR0aW5ncy50eXBlLnRvVXBwZXJDYXNlKCkgPT09IFwiR0VUXCIgJiYgcmVtb3RlICkge1xyXG5cdFx0XHRcdHZhciBuZXdNb2NrUmV0dXJuID0gcHJvY2Vzc0pzb25wUmVxdWVzdCggcmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzICk7XHJcblxyXG5cdFx0XHRcdC8vIENoZWNrIGlmIHdlIGFyZSBzdXBwb3NlZCB0byByZXR1cm4gYSBEZWZlcnJlZCBiYWNrIHRvIHRoZSBtb2NrIGNhbGwsIG9yIGp1c3RcclxuXHRcdFx0XHQvLyBzaWduYWwgc3VjY2Vzc1xyXG5cdFx0XHRcdGlmKG5ld01vY2tSZXR1cm4pIHtcclxuXHRcdFx0XHRcdHJldHVybiBuZXdNb2NrUmV0dXJuO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBudWxsO1xyXG5cdH1cclxuXHJcblx0Ly8gQXBwZW5kIHRoZSByZXF1aXJlZCBjYWxsYmFjayBwYXJhbWV0ZXIgdG8gdGhlIGVuZCBvZiB0aGUgcmVxdWVzdCBVUkwsIGZvciBhIEpTT05QIHJlcXVlc3RcclxuXHRmdW5jdGlvbiBwcm9jZXNzSnNvbnBVcmwoIHJlcXVlc3RTZXR0aW5ncyApIHtcclxuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLnR5cGUudG9VcHBlckNhc2UoKSA9PT0gXCJHRVRcIiApIHtcclxuXHRcdFx0aWYgKCAhQ0FMTEJBQ0tfUkVHRVgudGVzdCggcmVxdWVzdFNldHRpbmdzLnVybCApICkge1xyXG5cdFx0XHRcdHJlcXVlc3RTZXR0aW5ncy51cmwgKz0gKC9cXD8vLnRlc3QoIHJlcXVlc3RTZXR0aW5ncy51cmwgKSA/IFwiJlwiIDogXCI/XCIpICtcclxuXHRcdFx0XHRcdChyZXF1ZXN0U2V0dGluZ3MuanNvbnAgfHwgXCJjYWxsYmFja1wiKSArIFwiPT9cIjtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIGlmICggIXJlcXVlc3RTZXR0aW5ncy5kYXRhIHx8ICFDQUxMQkFDS19SRUdFWC50ZXN0KHJlcXVlc3RTZXR0aW5ncy5kYXRhKSApIHtcclxuXHRcdFx0cmVxdWVzdFNldHRpbmdzLmRhdGEgPSAocmVxdWVzdFNldHRpbmdzLmRhdGEgPyByZXF1ZXN0U2V0dGluZ3MuZGF0YSArIFwiJlwiIDogXCJcIikgKyAocmVxdWVzdFNldHRpbmdzLmpzb25wIHx8IFwiY2FsbGJhY2tcIikgKyBcIj0/XCI7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBQcm9jZXNzIGEgSlNPTlAgcmVxdWVzdCBieSBldmFsdWF0aW5nIHRoZSBtb2NrZWQgcmVzcG9uc2UgdGV4dFxyXG5cdGZ1bmN0aW9uIHByb2Nlc3NKc29ucFJlcXVlc3QoIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyApIHtcclxuXHRcdC8vIFN5bnRoZXNpemUgdGhlIG1vY2sgcmVxdWVzdCBmb3IgYWRkaW5nIGEgc2NyaXB0IHRhZ1xyXG5cdFx0dmFyIGNhbGxiYWNrQ29udGV4dCA9IG9yaWdTZXR0aW5ncyAmJiBvcmlnU2V0dGluZ3MuY29udGV4dCB8fCByZXF1ZXN0U2V0dGluZ3MsXHJcblx0XHRcdG5ld01vY2sgPSBudWxsO1xyXG5cclxuXHJcblx0XHQvLyBJZiB0aGUgcmVzcG9uc2UgaGFuZGxlciBvbiB0aGUgbW9vY2sgaXMgYSBmdW5jdGlvbiwgY2FsbCBpdFxyXG5cdFx0aWYgKCBtb2NrSGFuZGxlci5yZXNwb25zZSAmJiAkLmlzRnVuY3Rpb24obW9ja0hhbmRsZXIucmVzcG9uc2UpICkge1xyXG5cdFx0XHRtb2NrSGFuZGxlci5yZXNwb25zZShvcmlnU2V0dGluZ3MpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdC8vIEV2YWx1YXRlIHRoZSByZXNwb25zZVRleHQgamF2YXNjcmlwdCBpbiBhIGdsb2JhbCBjb250ZXh0XHJcblx0XHRcdGlmKCB0eXBlb2YgbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ID09PSAnb2JqZWN0JyApIHtcclxuXHRcdFx0XHQkLmdsb2JhbEV2YWwoICcoJyArIEpTT04uc3RyaW5naWZ5KCBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgKSArICcpJyk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0JC5nbG9iYWxFdmFsKCAnKCcgKyBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgKyAnKScpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gU3VjY2Vzc2Z1bCByZXNwb25zZVxyXG5cdFx0anNvbnBTdWNjZXNzKCByZXF1ZXN0U2V0dGluZ3MsIGNhbGxiYWNrQ29udGV4dCwgbW9ja0hhbmRsZXIgKTtcclxuXHRcdGpzb25wQ29tcGxldGUoIHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0LCBtb2NrSGFuZGxlciApO1xyXG5cclxuXHRcdC8vIElmIHdlIGFyZSBydW5uaW5nIHVuZGVyIGpRdWVyeSAxLjUrLCByZXR1cm4gYSBkZWZlcnJlZCBvYmplY3RcclxuXHRcdGlmKCQuRGVmZXJyZWQpe1xyXG5cdFx0XHRuZXdNb2NrID0gbmV3ICQuRGVmZXJyZWQoKTtcclxuXHRcdFx0aWYodHlwZW9mIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCA9PSBcIm9iamVjdFwiKXtcclxuXHRcdFx0XHRuZXdNb2NrLnJlc29sdmVXaXRoKCBjYWxsYmFja0NvbnRleHQsIFttb2NrSGFuZGxlci5yZXNwb25zZVRleHRdICk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRuZXdNb2NrLnJlc29sdmVXaXRoKCBjYWxsYmFja0NvbnRleHQsIFskLnBhcnNlSlNPTiggbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0ICldICk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBuZXdNb2NrO1xyXG5cdH1cclxuXHJcblxyXG5cdC8vIENyZWF0ZSB0aGUgcmVxdWlyZWQgSlNPTlAgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIHRoZSByZXF1ZXN0XHJcblx0ZnVuY3Rpb24gY3JlYXRlSnNvbnBDYWxsYmFjayggcmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzICkge1xyXG5cdFx0dmFyIGNhbGxiYWNrQ29udGV4dCA9IG9yaWdTZXR0aW5ncyAmJiBvcmlnU2V0dGluZ3MuY29udGV4dCB8fCByZXF1ZXN0U2V0dGluZ3M7XHJcblx0XHR2YXIganNvbnAgPSByZXF1ZXN0U2V0dGluZ3MuanNvbnBDYWxsYmFjayB8fCAoXCJqc29ucFwiICsganNjKyspO1xyXG5cclxuXHRcdC8vIFJlcGxhY2UgdGhlID0/IHNlcXVlbmNlIGJvdGggaW4gdGhlIHF1ZXJ5IHN0cmluZyBhbmQgdGhlIGRhdGFcclxuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmRhdGEgKSB7XHJcblx0XHRcdHJlcXVlc3RTZXR0aW5ncy5kYXRhID0gKHJlcXVlc3RTZXR0aW5ncy5kYXRhICsgXCJcIikucmVwbGFjZShDQUxMQkFDS19SRUdFWCwgXCI9XCIgKyBqc29ucCArIFwiJDFcIik7XHJcblx0XHR9XHJcblxyXG5cdFx0cmVxdWVzdFNldHRpbmdzLnVybCA9IHJlcXVlc3RTZXR0aW5ncy51cmwucmVwbGFjZShDQUxMQkFDS19SRUdFWCwgXCI9XCIgKyBqc29ucCArIFwiJDFcIik7XHJcblxyXG5cclxuXHRcdC8vIEhhbmRsZSBKU09OUC1zdHlsZSBsb2FkaW5nXHJcblx0XHR3aW5kb3dbIGpzb25wIF0gPSB3aW5kb3dbIGpzb25wIF0gfHwgZnVuY3Rpb24oIHRtcCApIHtcclxuXHRcdFx0ZGF0YSA9IHRtcDtcclxuXHRcdFx0anNvbnBTdWNjZXNzKCByZXF1ZXN0U2V0dGluZ3MsIGNhbGxiYWNrQ29udGV4dCwgbW9ja0hhbmRsZXIgKTtcclxuXHRcdFx0anNvbnBDb21wbGV0ZSggcmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyICk7XHJcblx0XHRcdC8vIEdhcmJhZ2UgY29sbGVjdFxyXG5cdFx0XHR3aW5kb3dbIGpzb25wIF0gPSB1bmRlZmluZWQ7XHJcblxyXG5cdFx0XHR0cnkge1xyXG5cdFx0XHRcdGRlbGV0ZSB3aW5kb3dbIGpzb25wIF07XHJcblx0XHRcdH0gY2F0Y2goZSkge31cclxuXHJcblx0XHRcdGlmICggaGVhZCApIHtcclxuXHRcdFx0XHRoZWFkLnJlbW92ZUNoaWxkKCBzY3JpcHQgKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cdC8vIFRoZSBKU09OUCByZXF1ZXN0IHdhcyBzdWNjZXNzZnVsXHJcblx0ZnVuY3Rpb24ganNvbnBTdWNjZXNzKHJlcXVlc3RTZXR0aW5ncywgY2FsbGJhY2tDb250ZXh0LCBtb2NrSGFuZGxlcikge1xyXG5cdFx0Ly8gSWYgYSBsb2NhbCBjYWxsYmFjayB3YXMgc3BlY2lmaWVkLCBmaXJlIGl0IGFuZCBwYXNzIGl0IHRoZSBkYXRhXHJcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5zdWNjZXNzICkge1xyXG5cdFx0XHRyZXF1ZXN0U2V0dGluZ3Muc3VjY2Vzcy5jYWxsKCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCB8fCBcIlwiLCBzdGF0dXMsIHt9ICk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gRmlyZSB0aGUgZ2xvYmFsIGNhbGxiYWNrXHJcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5nbG9iYWwgKSB7XHJcblx0XHRcdHRyaWdnZXIocmVxdWVzdFNldHRpbmdzLCBcImFqYXhTdWNjZXNzXCIsIFt7fSwgcmVxdWVzdFNldHRpbmdzXSApO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gVGhlIEpTT05QIHJlcXVlc3Qgd2FzIGNvbXBsZXRlZFxyXG5cdGZ1bmN0aW9uIGpzb25wQ29tcGxldGUocmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQpIHtcclxuXHRcdC8vIFByb2Nlc3MgcmVzdWx0XHJcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5jb21wbGV0ZSApIHtcclxuXHRcdFx0cmVxdWVzdFNldHRpbmdzLmNvbXBsZXRlLmNhbGwoIGNhbGxiYWNrQ29udGV4dCwge30gLCBzdGF0dXMgKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBUaGUgcmVxdWVzdCB3YXMgY29tcGxldGVkXHJcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5nbG9iYWwgKSB7XHJcblx0XHRcdHRyaWdnZXIoIFwiYWpheENvbXBsZXRlXCIsIFt7fSwgcmVxdWVzdFNldHRpbmdzXSApO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEhhbmRsZSB0aGUgZ2xvYmFsIEFKQVggY291bnRlclxyXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZ2xvYmFsICYmICEgLS0kLmFjdGl2ZSApIHtcclxuXHRcdFx0JC5ldmVudC50cmlnZ2VyKCBcImFqYXhTdG9wXCIgKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cclxuXHQvLyBUaGUgY29yZSAkLmFqYXggcmVwbGFjZW1lbnQuXHJcblx0ZnVuY3Rpb24gaGFuZGxlQWpheCggdXJsLCBvcmlnU2V0dGluZ3MgKSB7XHJcblx0XHR2YXIgbW9ja1JlcXVlc3QsIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXI7XHJcblxyXG5cdFx0Ly8gSWYgdXJsIGlzIGFuIG9iamVjdCwgc2ltdWxhdGUgcHJlLTEuNSBzaWduYXR1cmVcclxuXHRcdGlmICggdHlwZW9mIHVybCA9PT0gXCJvYmplY3RcIiApIHtcclxuXHRcdFx0b3JpZ1NldHRpbmdzID0gdXJsO1xyXG5cdFx0XHR1cmwgPSB1bmRlZmluZWQ7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyB3b3JrIGFyb3VuZCB0byBzdXBwb3J0IDEuNSBzaWduYXR1cmVcclxuXHRcdFx0b3JpZ1NldHRpbmdzID0gb3JpZ1NldHRpbmdzIHx8IHt9O1xyXG5cdFx0XHRvcmlnU2V0dGluZ3MudXJsID0gdXJsO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEV4dGVuZCB0aGUgb3JpZ2luYWwgc2V0dGluZ3MgZm9yIHRoZSByZXF1ZXN0XHJcblx0XHRyZXF1ZXN0U2V0dGluZ3MgPSAkLmV4dGVuZCh0cnVlLCB7fSwgJC5hamF4U2V0dGluZ3MsIG9yaWdTZXR0aW5ncyk7XHJcblxyXG5cdFx0Ly8gSXRlcmF0ZSBvdmVyIG91ciBtb2NrIGhhbmRsZXJzIChpbiByZWdpc3RyYXRpb24gb3JkZXIpIHVudGlsIHdlIGZpbmRcclxuXHRcdC8vIG9uZSB0aGF0IGlzIHdpbGxpbmcgdG8gaW50ZXJjZXB0IHRoZSByZXF1ZXN0XHJcblx0XHRmb3IodmFyIGsgPSAwOyBrIDwgbW9ja0hhbmRsZXJzLmxlbmd0aDsgaysrKSB7XHJcblx0XHRcdGlmICggIW1vY2tIYW5kbGVyc1trXSApIHtcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0bW9ja0hhbmRsZXIgPSBnZXRNb2NrRm9yUmVxdWVzdCggbW9ja0hhbmRsZXJzW2tdLCByZXF1ZXN0U2V0dGluZ3MgKTtcclxuXHRcdFx0aWYoIW1vY2tIYW5kbGVyKSB7XHJcblx0XHRcdFx0Ly8gTm8gdmFsaWQgbW9jayBmb3VuZCBmb3IgdGhpcyByZXF1ZXN0XHJcblx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdG1vY2tlZEFqYXhDYWxscy5wdXNoKHJlcXVlc3RTZXR0aW5ncyk7XHJcblxyXG5cdFx0XHQvLyBJZiBsb2dnaW5nIGlzIGVuYWJsZWQsIGxvZyB0aGUgbW9jayB0byB0aGUgY29uc29sZVxyXG5cdFx0XHQkLm1vY2tqYXhTZXR0aW5ncy5sb2coIG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MgKTtcclxuXHJcblxyXG5cdFx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSAmJiByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUudG9VcHBlckNhc2UoKSA9PT0gJ0pTT05QJyApIHtcclxuXHRcdFx0XHRpZiAoKG1vY2tSZXF1ZXN0ID0gcHJvY2Vzc0pzb25wTW9jayggcmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzICkpKSB7XHJcblx0XHRcdFx0XHQvLyBUaGlzIG1vY2sgd2lsbCBoYW5kbGUgdGhlIEpTT05QIHJlcXVlc3RcclxuXHRcdFx0XHRcdHJldHVybiBtb2NrUmVxdWVzdDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblxyXG5cdFx0XHQvLyBSZW1vdmVkIHRvIGZpeCAjNTQgLSBrZWVwIHRoZSBtb2NraW5nIGRhdGEgb2JqZWN0IGludGFjdFxyXG5cdFx0XHQvL21vY2tIYW5kbGVyLmRhdGEgPSByZXF1ZXN0U2V0dGluZ3MuZGF0YTtcclxuXHJcblx0XHRcdG1vY2tIYW5kbGVyLmNhY2hlID0gcmVxdWVzdFNldHRpbmdzLmNhY2hlO1xyXG5cdFx0XHRtb2NrSGFuZGxlci50aW1lb3V0ID0gcmVxdWVzdFNldHRpbmdzLnRpbWVvdXQ7XHJcblx0XHRcdG1vY2tIYW5kbGVyLmdsb2JhbCA9IHJlcXVlc3RTZXR0aW5ncy5nbG9iYWw7XHJcblxyXG5cdFx0XHRjb3B5VXJsUGFyYW1ldGVycyhtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzKTtcclxuXHJcblx0XHRcdChmdW5jdGlvbihtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzLCBvcmlnU2V0dGluZ3MsIG9yaWdIYW5kbGVyKSB7XHJcblx0XHRcdFx0bW9ja1JlcXVlc3QgPSBfYWpheC5jYWxsKCQsICQuZXh0ZW5kKHRydWUsIHt9LCBvcmlnU2V0dGluZ3MsIHtcclxuXHRcdFx0XHRcdC8vIE1vY2sgdGhlIFhIUiBvYmplY3RcclxuXHRcdFx0XHRcdHhocjogZnVuY3Rpb24oKSB7IHJldHVybiB4aHIoIG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncywgb3JpZ0hhbmRsZXIgKTsgfVxyXG5cdFx0XHRcdH0pKTtcclxuXHRcdFx0fSkobW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncywgb3JpZ1NldHRpbmdzLCBtb2NrSGFuZGxlcnNba10pO1xyXG5cclxuXHRcdFx0cmV0dXJuIG1vY2tSZXF1ZXN0O1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFdlIGRvbid0IGhhdmUgYSBtb2NrIHJlcXVlc3RcclxuXHRcdGlmKCQubW9ja2pheFNldHRpbmdzLnRocm93VW5tb2NrZWQgPT09IHRydWUpIHtcclxuXHRcdFx0dGhyb3coJ0FKQVggbm90IG1vY2tlZDogJyArIG9yaWdTZXR0aW5ncy51cmwpO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7IC8vIHRyaWdnZXIgYSBub3JtYWwgcmVxdWVzdFxyXG5cdFx0XHRyZXR1cm4gX2FqYXguYXBwbHkoJCwgW29yaWdTZXR0aW5nc10pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0KiBDb3BpZXMgVVJMIHBhcmFtZXRlciB2YWx1ZXMgaWYgdGhleSB3ZXJlIGNhcHR1cmVkIGJ5IGEgcmVndWxhciBleHByZXNzaW9uXHJcblx0KiBAcGFyYW0ge09iamVjdH0gbW9ja0hhbmRsZXJcclxuXHQqIEBwYXJhbSB7T2JqZWN0fSBvcmlnU2V0dGluZ3NcclxuXHQqL1xyXG5cdGZ1bmN0aW9uIGNvcHlVcmxQYXJhbWV0ZXJzKG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MpIHtcclxuXHRcdC8vcGFyYW1ldGVycyBhcmVuJ3QgY2FwdHVyZWQgaWYgdGhlIFVSTCBpc24ndCBhIFJlZ0V4cFxyXG5cdFx0aWYgKCEobW9ja0hhbmRsZXIudXJsIGluc3RhbmNlb2YgUmVnRXhwKSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHQvL2lmIG5vIFVSTCBwYXJhbXMgd2VyZSBkZWZpbmVkIG9uIHRoZSBoYW5kbGVyLCBkb24ndCBhdHRlbXB0IGEgY2FwdHVyZVxyXG5cdFx0aWYgKCFtb2NrSGFuZGxlci5oYXNPd25Qcm9wZXJ0eSgndXJsUGFyYW1zJykpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0dmFyIGNhcHR1cmVzID0gbW9ja0hhbmRsZXIudXJsLmV4ZWMob3JpZ1NldHRpbmdzLnVybCk7XHJcblx0XHQvL3RoZSB3aG9sZSBSZWdFeHAgbWF0Y2ggaXMgYWx3YXlzIHRoZSBmaXJzdCB2YWx1ZSBpbiB0aGUgY2FwdHVyZSByZXN1bHRzXHJcblx0XHRpZiAoY2FwdHVyZXMubGVuZ3RoID09PSAxKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdGNhcHR1cmVzLnNoaWZ0KCk7XHJcblx0XHQvL3VzZSBoYW5kbGVyIHBhcmFtcyBhcyBrZXlzIGFuZCBjYXB0dXJlIHJlc3V0cyBhcyB2YWx1ZXNcclxuXHRcdHZhciBpID0gMCxcclxuXHRcdGNhcHR1cmVzTGVuZ3RoID0gY2FwdHVyZXMubGVuZ3RoLFxyXG5cdFx0cGFyYW1zTGVuZ3RoID0gbW9ja0hhbmRsZXIudXJsUGFyYW1zLmxlbmd0aCxcclxuXHRcdC8vaW4gY2FzZSB0aGUgbnVtYmVyIG9mIHBhcmFtcyBzcGVjaWZpZWQgaXMgbGVzcyB0aGFuIGFjdHVhbCBjYXB0dXJlc1xyXG5cdFx0bWF4SXRlcmF0aW9ucyA9IE1hdGgubWluKGNhcHR1cmVzTGVuZ3RoLCBwYXJhbXNMZW5ndGgpLFxyXG5cdFx0cGFyYW1WYWx1ZXMgPSB7fTtcclxuXHRcdGZvciAoaTsgaSA8IG1heEl0ZXJhdGlvbnM7IGkrKykge1xyXG5cdFx0XHR2YXIga2V5ID0gbW9ja0hhbmRsZXIudXJsUGFyYW1zW2ldO1xyXG5cdFx0XHRwYXJhbVZhbHVlc1trZXldID0gY2FwdHVyZXNbaV07XHJcblx0XHR9XHJcblx0XHRvcmlnU2V0dGluZ3MudXJsUGFyYW1zID0gcGFyYW1WYWx1ZXM7XHJcblx0fVxyXG5cclxuXHJcblx0Ly8gUHVibGljXHJcblxyXG5cdCQuZXh0ZW5kKHtcclxuXHRcdGFqYXg6IGhhbmRsZUFqYXhcclxuXHR9KTtcclxuXHJcblx0JC5tb2NramF4U2V0dGluZ3MgPSB7XHJcblx0XHQvL3VybDogICAgICAgIG51bGwsXHJcblx0XHQvL3R5cGU6ICAgICAgICdHRVQnLFxyXG5cdFx0bG9nOiAgICAgICAgICBmdW5jdGlvbiggbW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncyApIHtcclxuXHRcdFx0aWYgKCBtb2NrSGFuZGxlci5sb2dnaW5nID09PSBmYWxzZSB8fFxyXG5cdFx0XHRcdCAoIHR5cGVvZiBtb2NrSGFuZGxlci5sb2dnaW5nID09PSAndW5kZWZpbmVkJyAmJiAkLm1vY2tqYXhTZXR0aW5ncy5sb2dnaW5nID09PSBmYWxzZSApICkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoIHdpbmRvdy5jb25zb2xlICYmIGNvbnNvbGUubG9nICkge1xyXG5cdFx0XHRcdHZhciBtZXNzYWdlID0gJ01PQ0sgJyArIHJlcXVlc3RTZXR0aW5ncy50eXBlLnRvVXBwZXJDYXNlKCkgKyAnOiAnICsgcmVxdWVzdFNldHRpbmdzLnVybDtcclxuXHRcdFx0XHR2YXIgcmVxdWVzdCA9ICQuZXh0ZW5kKHt9LCByZXF1ZXN0U2V0dGluZ3MpO1xyXG5cclxuXHRcdFx0XHRpZiAodHlwZW9mIGNvbnNvbGUubG9nID09PSAnZnVuY3Rpb24nKSB7XHJcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhtZXNzYWdlLCByZXF1ZXN0KTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coIG1lc3NhZ2UgKyAnICcgKyBKU09OLnN0cmluZ2lmeShyZXF1ZXN0KSApO1xyXG5cdFx0XHRcdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhtZXNzYWdlKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0XHRsb2dnaW5nOiAgICAgICB0cnVlLFxyXG5cdFx0c3RhdHVzOiAgICAgICAgMjAwLFxyXG5cdFx0c3RhdHVzVGV4dDogICAgXCJPS1wiLFxyXG5cdFx0cmVzcG9uc2VUaW1lOiAgNTAwLFxyXG5cdFx0aXNUaW1lb3V0OiAgICAgZmFsc2UsXHJcblx0XHR0aHJvd1VubW9ja2VkOiBmYWxzZSxcclxuXHRcdGNvbnRlbnRUeXBlOiAgICd0ZXh0L3BsYWluJyxcclxuXHRcdHJlc3BvbnNlOiAgICAgICcnLFxyXG5cdFx0cmVzcG9uc2VUZXh0OiAgJycsXHJcblx0XHRyZXNwb25zZVhNTDogICAnJyxcclxuXHRcdHByb3h5OiAgICAgICAgICcnLFxyXG5cdFx0cHJveHlUeXBlOiAgICAgJ0dFVCcsXHJcblxyXG5cdFx0bGFzdE1vZGlmaWVkOiAgbnVsbCxcclxuXHRcdGV0YWc6ICAgICAgICAgICcnLFxyXG5cdFx0aGVhZGVyczoge1xyXG5cdFx0XHRldGFnOiAnSUpGQEgjQDkyM3VmODAyM2hGT0BJI0gjJyxcclxuXHRcdFx0J2NvbnRlbnQtdHlwZScgOiAndGV4dC9wbGFpbidcclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHQkLm1vY2tqYXggPSBmdW5jdGlvbihzZXR0aW5ncykge1xyXG5cdFx0dmFyIGkgPSBtb2NrSGFuZGxlcnMubGVuZ3RoO1xyXG5cdFx0bW9ja0hhbmRsZXJzW2ldID0gc2V0dGluZ3M7XHJcblx0XHRyZXR1cm4gaTtcclxuXHR9O1xyXG5cdCQubW9ja2pheENsZWFyID0gZnVuY3Rpb24oaSkge1xyXG5cdFx0aWYgKCBhcmd1bWVudHMubGVuZ3RoID09IDEgKSB7XHJcblx0XHRcdG1vY2tIYW5kbGVyc1tpXSA9IG51bGw7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRtb2NrSGFuZGxlcnMgPSBbXTtcclxuXHRcdH1cclxuXHRcdG1vY2tlZEFqYXhDYWxscyA9IFtdO1xyXG5cdH07XHJcblx0JC5tb2NramF4LmhhbmRsZXIgPSBmdW5jdGlvbihpKSB7XHJcblx0XHRpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT0gMSApIHtcclxuXHRcdFx0cmV0dXJuIG1vY2tIYW5kbGVyc1tpXTtcclxuXHRcdH1cclxuXHR9O1xyXG5cdCQubW9ja2pheC5tb2NrZWRBamF4Q2FsbHMgPSBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiBtb2NrZWRBamF4Q2FsbHM7XHJcblx0fTtcclxufSkoalF1ZXJ5KTsiLCIvKipcclxuKiAgQWpheCBBdXRvY29tcGxldGUgZm9yIGpRdWVyeSwgdmVyc2lvbiAldmVyc2lvbiVcclxuKiAgKGMpIDIwMTUgVG9tYXMgS2lyZGFcclxuKlxyXG4qICBBamF4IEF1dG9jb21wbGV0ZSBmb3IgalF1ZXJ5IGlzIGZyZWVseSBkaXN0cmlidXRhYmxlIHVuZGVyIHRoZSB0ZXJtcyBvZiBhbiBNSVQtc3R5bGUgbGljZW5zZS5cclxuKiAgRm9yIGRldGFpbHMsIHNlZSB0aGUgd2ViIHNpdGU6IGh0dHBzOi8vZ2l0aHViLmNvbS9kZXZicmlkZ2UvalF1ZXJ5LUF1dG9jb21wbGV0ZVxyXG4qL1xyXG5cclxuLypqc2xpbnQgIGJyb3dzZXI6IHRydWUsIHdoaXRlOiB0cnVlLCBwbHVzcGx1czogdHJ1ZSwgdmFyczogdHJ1ZSAqL1xyXG4vKmdsb2JhbCBkZWZpbmUsIHdpbmRvdywgZG9jdW1lbnQsIGpRdWVyeSwgZXhwb3J0cywgcmVxdWlyZSAqL1xyXG5cclxuLy8gRXhwb3NlIHBsdWdpbiBhcyBhbiBBTUQgbW9kdWxlIGlmIEFNRCBsb2FkZXIgaXMgcHJlc2VudDpcclxuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcbiAgICAgICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxyXG4gICAgICAgIGRlZmluZShbJ2pxdWVyeSddLCBmYWN0b3J5KTtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiByZXF1aXJlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgLy8gQnJvd3NlcmlmeVxyXG4gICAgICAgIGZhY3RvcnkocmVxdWlyZSgnanF1ZXJ5JykpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBCcm93c2VyIGdsb2JhbHNcclxuICAgICAgICBmYWN0b3J5KGpRdWVyeSk7XHJcbiAgICB9XHJcbn0oZnVuY3Rpb24gKCQpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXJcclxuICAgICAgICB1dGlscyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBlc2NhcGVSZWdFeENoYXJzOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvW1xcLVxcW1xcXVxcL1xce1xcfVxcKFxcKVxcKlxcK1xcP1xcLlxcXFxcXF5cXCRcXHxdL2csIFwiXFxcXCQmXCIpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGNyZWF0ZU5vZGU6IGZ1bmN0aW9uIChjb250YWluZXJDbGFzcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgICAgICAgICAgICBkaXYuY2xhc3NOYW1lID0gY29udGFpbmVyQ2xhc3M7XHJcbiAgICAgICAgICAgICAgICAgICAgZGl2LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcclxuICAgICAgICAgICAgICAgICAgICBkaXYuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGl2O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0oKSksXHJcblxyXG4gICAgICAgIGtleXMgPSB7XHJcbiAgICAgICAgICAgIEVTQzogMjcsXHJcbiAgICAgICAgICAgIFRBQjogOSxcclxuICAgICAgICAgICAgUkVUVVJOOiAxMyxcclxuICAgICAgICAgICAgTEVGVDogMzcsXHJcbiAgICAgICAgICAgIFVQOiAzOCxcclxuICAgICAgICAgICAgUklHSFQ6IDM5LFxyXG4gICAgICAgICAgICBET1dOOiA0MFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gQXV0b2NvbXBsZXRlKGVsLCBvcHRpb25zKSB7XHJcbiAgICAgICAgdmFyIG5vb3AgPSBmdW5jdGlvbiAoKSB7IH0sXHJcbiAgICAgICAgICAgIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICBkZWZhdWx0cyA9IHtcclxuICAgICAgICAgICAgICAgIGFqYXhTZXR0aW5nczoge30sXHJcbiAgICAgICAgICAgICAgICBhdXRvU2VsZWN0Rmlyc3Q6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYXBwZW5kVG86IGRvY3VtZW50LmJvZHksXHJcbiAgICAgICAgICAgICAgICBzZXJ2aWNlVXJsOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgbG9va3VwOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgb25TZWxlY3Q6IG51bGwsXHJcbiAgICAgICAgICAgICAgICB3aWR0aDogJ2F1dG8nLFxyXG4gICAgICAgICAgICAgICAgbWluQ2hhcnM6IDEsXHJcbiAgICAgICAgICAgICAgICBtYXhIZWlnaHQ6IDMwMCxcclxuICAgICAgICAgICAgICAgIGRlZmVyUmVxdWVzdEJ5OiAwLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7fSxcclxuICAgICAgICAgICAgICAgIGZvcm1hdFJlc3VsdDogQXV0b2NvbXBsZXRlLmZvcm1hdFJlc3VsdCxcclxuICAgICAgICAgICAgICAgIGRlbGltaXRlcjogbnVsbCxcclxuICAgICAgICAgICAgICAgIHpJbmRleDogOTk5OSxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgbm9DYWNoZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBvblNlYXJjaFN0YXJ0OiBub29wLFxyXG4gICAgICAgICAgICAgICAgb25TZWFyY2hDb21wbGV0ZTogbm9vcCxcclxuICAgICAgICAgICAgICAgIG9uU2VhcmNoRXJyb3I6IG5vb3AsXHJcbiAgICAgICAgICAgICAgICBwcmVzZXJ2ZUlucHV0OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lckNsYXNzOiAnYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb25zJyxcclxuICAgICAgICAgICAgICAgIHRhYkRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50UmVxdWVzdDogbnVsbCxcclxuICAgICAgICAgICAgICAgIHRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBwcmV2ZW50QmFkUXVlcmllczogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGxvb2t1cEZpbHRlcjogZnVuY3Rpb24gKHN1Z2dlc3Rpb24sIG9yaWdpbmFsUXVlcnksIHF1ZXJ5TG93ZXJDYXNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb24udmFsdWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHF1ZXJ5TG93ZXJDYXNlKSAhPT0gLTE7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcGFyYW1OYW1lOiAncXVlcnknLFxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtUmVzdWx0OiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIHJlc3BvbnNlID09PSAnc3RyaW5nJyA/ICQucGFyc2VKU09OKHJlc3BvbnNlKSA6IHJlc3BvbnNlO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHNob3dOb1N1Z2dlc3Rpb25Ob3RpY2U6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgbm9TdWdnZXN0aW9uTm90aWNlOiAnTm8gcmVzdWx0cycsXHJcbiAgICAgICAgICAgICAgICBvcmllbnRhdGlvbjogJ2JvdHRvbScsXHJcbiAgICAgICAgICAgICAgICBmb3JjZUZpeFBvc2l0aW9uOiBmYWxzZVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBTaGFyZWQgdmFyaWFibGVzOlxyXG4gICAgICAgIHRoYXQuZWxlbWVudCA9IGVsO1xyXG4gICAgICAgIHRoYXQuZWwgPSAkKGVsKTtcclxuICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gW107XHJcbiAgICAgICAgdGhhdC5iYWRRdWVyaWVzID0gW107XHJcbiAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XHJcbiAgICAgICAgdGhhdC5jdXJyZW50VmFsdWUgPSB0aGF0LmVsZW1lbnQudmFsdWU7XHJcbiAgICAgICAgdGhhdC5pbnRlcnZhbElkID0gMDtcclxuICAgICAgICB0aGF0LmNhY2hlZFJlc3BvbnNlID0ge307XHJcbiAgICAgICAgdGhhdC5vbkNoYW5nZUludGVydmFsID0gbnVsbDtcclxuICAgICAgICB0aGF0Lm9uQ2hhbmdlID0gbnVsbDtcclxuICAgICAgICB0aGF0LmlzTG9jYWwgPSBmYWxzZTtcclxuICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyID0gbnVsbDtcclxuICAgICAgICB0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIgPSBudWxsO1xyXG4gICAgICAgIHRoYXQub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBkZWZhdWx0cywgb3B0aW9ucyk7XHJcbiAgICAgICAgdGhhdC5jbGFzc2VzID0ge1xyXG4gICAgICAgICAgICBzZWxlY3RlZDogJ2F1dG9jb21wbGV0ZS1zZWxlY3RlZCcsXHJcbiAgICAgICAgICAgIHN1Z2dlc3Rpb246ICdhdXRvY29tcGxldGUtc3VnZ2VzdGlvbidcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoYXQuaGludCA9IG51bGw7XHJcbiAgICAgICAgdGhhdC5oaW50VmFsdWUgPSAnJztcclxuICAgICAgICB0aGF0LnNlbGVjdGlvbiA9IG51bGw7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgYW5kIHNldCBvcHRpb25zOlxyXG4gICAgICAgIHRoYXQuaW5pdGlhbGl6ZSgpO1xyXG4gICAgICAgIHRoYXQuc2V0T3B0aW9ucyhvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBBdXRvY29tcGxldGUudXRpbHMgPSB1dGlscztcclxuXHJcbiAgICAkLkF1dG9jb21wbGV0ZSA9IEF1dG9jb21wbGV0ZTtcclxuXHJcbiAgICBBdXRvY29tcGxldGUuZm9ybWF0UmVzdWx0ID0gZnVuY3Rpb24gKHN1Z2dlc3Rpb24sIGN1cnJlbnRWYWx1ZSkge1xyXG4gICAgICAgIC8vIERvIG5vdCByZXBsYWNlIGFueXRoaW5nIGlmIHRoZXJlIGN1cnJlbnQgdmFsdWUgaXMgZW1wdHlcclxuICAgICAgICBpZiAoIWN1cnJlbnRWYWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbi52YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIHBhdHRlcm4gPSAnKCcgKyB1dGlscy5lc2NhcGVSZWdFeENoYXJzKGN1cnJlbnRWYWx1ZSkgKyAnKSc7XHJcblxyXG4gICAgICAgIHJldHVybiBzdWdnZXN0aW9uLnZhbHVlXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKG5ldyBSZWdFeHAocGF0dGVybiwgJ2dpJyksICc8c3Ryb25nPiQxPFxcL3N0cm9uZz4nKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcclxuICAgICAgICAgICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvJmx0OyhcXC8/c3Ryb25nKSZndDsvZywgJzwkMT4nKTtcclxuICAgIH07XHJcblxyXG4gICAgQXV0b2NvbXBsZXRlLnByb3RvdHlwZSA9IHtcclxuXHJcbiAgICAgICAga2lsbGVyRm46IG51bGwsXHJcblxyXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgc3VnZ2VzdGlvblNlbGVjdG9yID0gJy4nICsgdGhhdC5jbGFzc2VzLnN1Z2dlc3Rpb24sXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZCA9IHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgICBjb250YWluZXI7XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgYXV0b2NvbXBsZXRlIGF0dHJpYnV0ZSB0byBwcmV2ZW50IG5hdGl2ZSBzdWdnZXN0aW9uczpcclxuICAgICAgICAgICAgdGhhdC5lbGVtZW50LnNldEF0dHJpYnV0ZSgnYXV0b2NvbXBsZXRlJywgJ29mZicpO1xyXG5cclxuICAgICAgICAgICAgdGhhdC5raWxsZXJGbiA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJChlLnRhcmdldCkuY2xvc2VzdCgnLicgKyB0aGF0Lm9wdGlvbnMuY29udGFpbmVyQ2xhc3MpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQua2lsbFN1Z2dlc3Rpb25zKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5kaXNhYmxlS2lsbGVyRm4oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vIGh0bWwoKSBkZWFscyB3aXRoIG1hbnkgdHlwZXM6IGh0bWxTdHJpbmcgb3IgRWxlbWVudCBvciBBcnJheSBvciBqUXVlcnlcclxuICAgICAgICAgICAgdGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gJCgnPGRpdiBjbGFzcz1cImF1dG9jb21wbGV0ZS1uby1zdWdnZXN0aW9uXCI+PC9kaXY+JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmh0bWwodGhpcy5vcHRpb25zLm5vU3VnZ2VzdGlvbk5vdGljZSkuZ2V0KDApO1xyXG5cclxuICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciA9IEF1dG9jb21wbGV0ZS51dGlscy5jcmVhdGVOb2RlKG9wdGlvbnMuY29udGFpbmVyQ2xhc3MpO1xyXG5cclxuICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRUbyhvcHRpb25zLmFwcGVuZFRvKTtcclxuXHJcbiAgICAgICAgICAgIC8vIE9ubHkgc2V0IHdpZHRoIGlmIGl0IHdhcyBwcm92aWRlZDpcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMud2lkdGggIT09ICdhdXRvJykge1xyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyLndpZHRoKG9wdGlvbnMud2lkdGgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBMaXN0ZW4gZm9yIG1vdXNlIG92ZXIgZXZlbnQgb24gc3VnZ2VzdGlvbnMgbGlzdDpcclxuICAgICAgICAgICAgY29udGFpbmVyLm9uKCdtb3VzZW92ZXIuYXV0b2NvbXBsZXRlJywgc3VnZ2VzdGlvblNlbGVjdG9yLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmFjdGl2YXRlKCQodGhpcykuZGF0YSgnaW5kZXgnKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gRGVzZWxlY3QgYWN0aXZlIGVsZW1lbnQgd2hlbiBtb3VzZSBsZWF2ZXMgc3VnZ2VzdGlvbnMgY29udGFpbmVyOlxyXG4gICAgICAgICAgICBjb250YWluZXIub24oJ21vdXNlb3V0LmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmNoaWxkcmVuKCcuJyArIHNlbGVjdGVkKS5yZW1vdmVDbGFzcyhzZWxlY3RlZCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gTGlzdGVuIGZvciBjbGljayBldmVudCBvbiBzdWdnZXN0aW9ucyBsaXN0OlxyXG4gICAgICAgICAgICBjb250YWluZXIub24oJ2NsaWNrLmF1dG9jb21wbGV0ZScsIHN1Z2dlc3Rpb25TZWxlY3RvciwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QoJCh0aGlzKS5kYXRhKCdpbmRleCcpKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uQ2FwdHVyZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGF0LnZpc2libGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS5hdXRvY29tcGxldGUnLCB0aGF0LmZpeFBvc2l0aW9uQ2FwdHVyZSk7XHJcblxyXG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdrZXlkb3duLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlQcmVzcyhlKTsgfSk7XHJcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2tleXVwLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlVcChlKTsgfSk7XHJcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2JsdXIuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKCkgeyB0aGF0Lm9uQmx1cigpOyB9KTtcclxuICAgICAgICAgICAgdGhhdC5lbC5vbignZm9jdXMuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKCkgeyB0aGF0Lm9uRm9jdXMoKTsgfSk7XHJcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2NoYW5nZS5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5VXAoZSk7IH0pO1xyXG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdpbnB1dC5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5VXAoZSk7IH0pO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG9uRm9jdXM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuZWwudmFsKCkubGVuZ3RoID49IHRoYXQub3B0aW9ucy5taW5DaGFycykge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5vblZhbHVlQ2hhbmdlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBvbkJsdXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5lbmFibGVLaWxsZXJGbigpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXHJcbiAgICAgICAgYWJvcnRBamF4OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgaWYgKHRoYXQuY3VycmVudFJlcXVlc3QpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QuYWJvcnQoKTtcclxuICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2V0T3B0aW9uczogZnVuY3Rpb24gKHN1cHBsaWVkT3B0aW9ucykge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zO1xyXG5cclxuICAgICAgICAgICAgJC5leHRlbmQob3B0aW9ucywgc3VwcGxpZWRPcHRpb25zKTtcclxuXHJcbiAgICAgICAgICAgIHRoYXQuaXNMb2NhbCA9ICQuaXNBcnJheShvcHRpb25zLmxvb2t1cCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhhdC5pc0xvY2FsKSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLmxvb2t1cCA9IHRoYXQudmVyaWZ5U3VnZ2VzdGlvbnNGb3JtYXQob3B0aW9ucy5sb29rdXApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBvcHRpb25zLm9yaWVudGF0aW9uID0gdGhhdC52YWxpZGF0ZU9yaWVudGF0aW9uKG9wdGlvbnMub3JpZW50YXRpb24sICdib3R0b20nKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkanVzdCBoZWlnaHQsIHdpZHRoIGFuZCB6LWluZGV4OlxyXG4gICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAnbWF4LWhlaWdodCc6IG9wdGlvbnMubWF4SGVpZ2h0ICsgJ3B4JyxcclxuICAgICAgICAgICAgICAgICd3aWR0aCc6IG9wdGlvbnMud2lkdGggKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgJ3otaW5kZXgnOiBvcHRpb25zLnpJbmRleFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG5cclxuXHJcbiAgICAgICAgY2xlYXJDYWNoZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNhY2hlZFJlc3BvbnNlID0ge307XHJcbiAgICAgICAgICAgIHRoaXMuYmFkUXVlcmllcyA9IFtdO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xlYXJDYWNoZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRWYWx1ZSA9ICcnO1xyXG4gICAgICAgICAgICB0aGlzLnN1Z2dlc3Rpb25zID0gW107XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZGlzYWJsZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgIHRoYXQuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XHJcbiAgICAgICAgICAgIHRoYXQuYWJvcnRBamF4KCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZW5hYmxlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBmaXhQb3NpdGlvbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBVc2Ugb25seSB3aGVuIGNvbnRhaW5lciBoYXMgYWxyZWFkeSBpdHMgY29udGVudFxyXG5cclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgJGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXHJcbiAgICAgICAgICAgICAgICBjb250YWluZXJQYXJlbnQgPSAkY29udGFpbmVyLnBhcmVudCgpLmdldCgwKTtcclxuICAgICAgICAgICAgLy8gRml4IHBvc2l0aW9uIGF1dG9tYXRpY2FsbHkgd2hlbiBhcHBlbmRlZCB0byBib2R5LlxyXG4gICAgICAgICAgICAvLyBJbiBvdGhlciBjYXNlcyBmb3JjZSBwYXJhbWV0ZXIgbXVzdCBiZSBnaXZlbi5cclxuICAgICAgICAgICAgaWYgKGNvbnRhaW5lclBhcmVudCAhPT0gZG9jdW1lbnQuYm9keSAmJiAhdGhhdC5vcHRpb25zLmZvcmNlRml4UG9zaXRpb24pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQ2hvb3NlIG9yaWVudGF0aW9uXHJcbiAgICAgICAgICAgIHZhciBvcmllbnRhdGlvbiA9IHRoYXQub3B0aW9ucy5vcmllbnRhdGlvbixcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lckhlaWdodCA9ICRjb250YWluZXIub3V0ZXJIZWlnaHQoKSxcclxuICAgICAgICAgICAgICAgIGhlaWdodCA9IHRoYXQuZWwub3V0ZXJIZWlnaHQoKSxcclxuICAgICAgICAgICAgICAgIG9mZnNldCA9IHRoYXQuZWwub2Zmc2V0KCksXHJcbiAgICAgICAgICAgICAgICBzdHlsZXMgPSB7ICd0b3AnOiBvZmZzZXQudG9wLCAnbGVmdCc6IG9mZnNldC5sZWZ0IH07XHJcblxyXG4gICAgICAgICAgICBpZiAob3JpZW50YXRpb24gPT09ICdhdXRvJykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHZpZXdQb3J0SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpLFxyXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKSxcclxuICAgICAgICAgICAgICAgICAgICB0b3BPdmVyZmxvdyA9IC1zY3JvbGxUb3AgKyBvZmZzZXQudG9wIC0gY29udGFpbmVySGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgICAgIGJvdHRvbU92ZXJmbG93ID0gc2Nyb2xsVG9wICsgdmlld1BvcnRIZWlnaHQgLSAob2Zmc2V0LnRvcCArIGhlaWdodCArIGNvbnRhaW5lckhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb24gPSAoTWF0aC5tYXgodG9wT3ZlcmZsb3csIGJvdHRvbU92ZXJmbG93KSA9PT0gdG9wT3ZlcmZsb3cpID8gJ3RvcCcgOiAnYm90dG9tJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKG9yaWVudGF0aW9uID09PSAndG9wJykge1xyXG4gICAgICAgICAgICAgICAgc3R5bGVzLnRvcCArPSAtY29udGFpbmVySGVpZ2h0O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc3R5bGVzLnRvcCArPSBoZWlnaHQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIElmIGNvbnRhaW5lciBpcyBub3QgcG9zaXRpb25lZCB0byBib2R5LFxyXG4gICAgICAgICAgICAvLyBjb3JyZWN0IGl0cyBwb3NpdGlvbiB1c2luZyBvZmZzZXQgcGFyZW50IG9mZnNldFxyXG4gICAgICAgICAgICBpZihjb250YWluZXJQYXJlbnQgIT09IGRvY3VtZW50LmJvZHkpIHtcclxuICAgICAgICAgICAgICAgIHZhciBvcGFjaXR5ID0gJGNvbnRhaW5lci5jc3MoJ29wYWNpdHknKSxcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnRPZmZzZXREaWZmO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoYXQudmlzaWJsZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRjb250YWluZXIuY3NzKCdvcGFjaXR5JywgMCkuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBwYXJlbnRPZmZzZXREaWZmID0gJGNvbnRhaW5lci5vZmZzZXRQYXJlbnQoKS5vZmZzZXQoKTtcclxuICAgICAgICAgICAgICAgIHN0eWxlcy50b3AgLT0gcGFyZW50T2Zmc2V0RGlmZi50b3A7XHJcbiAgICAgICAgICAgICAgICBzdHlsZXMubGVmdCAtPSBwYXJlbnRPZmZzZXREaWZmLmxlZnQ7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGF0LnZpc2libGUpe1xyXG4gICAgICAgICAgICAgICAgICAgICRjb250YWluZXIuY3NzKCdvcGFjaXR5Jywgb3BhY2l0eSkuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAtMnB4IHRvIGFjY291bnQgZm9yIHN1Z2dlc3Rpb25zIGJvcmRlci5cclxuICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy53aWR0aCA9PT0gJ2F1dG8nKSB7XHJcbiAgICAgICAgICAgICAgICBzdHlsZXMud2lkdGggPSAodGhhdC5lbC5vdXRlcldpZHRoKCkgLSAyKSArICdweCc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICRjb250YWluZXIuY3NzKHN0eWxlcyk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZW5hYmxlS2lsbGVyRm46IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vbignY2xpY2suYXV0b2NvbXBsZXRlJywgdGhhdC5raWxsZXJGbik7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZGlzYWJsZUtpbGxlckZuOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5hdXRvY29tcGxldGUnLCB0aGF0LmtpbGxlckZuKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBraWxsU3VnZ2VzdGlvbnM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICB0aGF0LnN0b3BLaWxsU3VnZ2VzdGlvbnMoKTtcclxuICAgICAgICAgICAgdGhhdC5pbnRlcnZhbElkID0gd2luZG93LnNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGF0LnZpc2libGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmN1cnJlbnRWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoYXQuc3RvcEtpbGxTdWdnZXN0aW9ucygpO1xyXG4gICAgICAgICAgICB9LCA1MCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc3RvcEtpbGxTdWdnZXN0aW9uczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsSWQpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGlzQ3Vyc29yQXRFbmQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgdmFsTGVuZ3RoID0gdGhhdC5lbC52YWwoKS5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25TdGFydCA9IHRoYXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydCxcclxuICAgICAgICAgICAgICAgIHJhbmdlO1xyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzZWxlY3Rpb25TdGFydCA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxlY3Rpb25TdGFydCA9PT0gdmFsTGVuZ3RoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5zZWxlY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIHJhbmdlID0gZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCk7XHJcbiAgICAgICAgICAgICAgICByYW5nZS5tb3ZlU3RhcnQoJ2NoYXJhY3RlcicsIC12YWxMZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbExlbmd0aCA9PT0gcmFuZ2UudGV4dC5sZW5ndGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgb25LZXlQcmVzczogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgc3VnZ2VzdGlvbnMgYXJlIGhpZGRlbiBhbmQgdXNlciBwcmVzc2VzIGFycm93IGRvd24sIGRpc3BsYXkgc3VnZ2VzdGlvbnM6XHJcbiAgICAgICAgICAgIGlmICghdGhhdC5kaXNhYmxlZCAmJiAhdGhhdC52aXNpYmxlICYmIGUud2hpY2ggPT09IGtleXMuRE9XTiAmJiB0aGF0LmN1cnJlbnRWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LmRpc2FibGVkIHx8ICF0aGF0LnZpc2libGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc3dpdGNoIChlLndoaWNoKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuRVNDOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5SSUdIVDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5oaW50ICYmIHRoYXQub3B0aW9ucy5vbkhpbnQgJiYgdGhhdC5pc0N1cnNvckF0RW5kKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RIaW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuVEFCOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LmhpbnQgJiYgdGhhdC5vcHRpb25zLm9uSGludCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdEhpbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCh0aGF0LnNlbGVjdGVkSW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMudGFiRGlzYWJsZWQgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuUkVUVVJOOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KHRoYXQuc2VsZWN0ZWRJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuVVA6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5tb3ZlVXAoKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5ET1dOOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQubW92ZURvd24oKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBDYW5jZWwgZXZlbnQgaWYgZnVuY3Rpb24gZGlkIG5vdCByZXR1cm46XHJcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBvbktleVVwOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhhdC5kaXNhYmxlZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2ggKGUud2hpY2gpIHtcclxuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5VUDpcclxuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5ET1dOOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuY3VycmVudFZhbHVlICE9PSB0aGF0LmVsLnZhbCgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmZpbmRCZXN0SGludCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy5kZWZlclJlcXVlc3RCeSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBEZWZlciBsb29rdXAgaW4gY2FzZSB3aGVuIHZhbHVlIGNoYW5nZXMgdmVyeSBxdWlja2x5OlxyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQub25DaGFuZ2VJbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5vblZhbHVlQ2hhbmdlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhhdC5vcHRpb25zLmRlZmVyUmVxdWVzdEJ5KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5vblZhbHVlQ2hhbmdlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBvblZhbHVlQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoYXQuZWwudmFsKCksXHJcbiAgICAgICAgICAgICAgICBxdWVyeSA9IHRoYXQuZ2V0UXVlcnkodmFsdWUpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0aW9uICYmIHRoYXQuY3VycmVudFZhbHVlICE9PSBxdWVyeSkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb24gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgKG9wdGlvbnMub25JbnZhbGlkYXRlU2VsZWN0aW9uIHx8ICQubm9vcCkuY2FsbCh0aGF0LmVsZW1lbnQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XHJcbiAgICAgICAgICAgIHRoYXQuY3VycmVudFZhbHVlID0gdmFsdWU7XHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xyXG5cclxuICAgICAgICAgICAgLy8gQ2hlY2sgZXhpc3Rpbmcgc3VnZ2VzdGlvbiBmb3IgdGhlIG1hdGNoIGJlZm9yZSBwcm9jZWVkaW5nOlxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy50cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0ICYmIHRoYXQuaXNFeGFjdE1hdGNoKHF1ZXJ5KSkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QoMCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChxdWVyeS5sZW5ndGggPCBvcHRpb25zLm1pbkNoYXJzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuZ2V0U3VnZ2VzdGlvbnMocXVlcnkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgaXNFeGFjdE1hdGNoOiBmdW5jdGlvbiAocXVlcnkpIHtcclxuICAgICAgICAgICAgdmFyIHN1Z2dlc3Rpb25zID0gdGhpcy5zdWdnZXN0aW9ucztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAoc3VnZ2VzdGlvbnMubGVuZ3RoID09PSAxICYmIHN1Z2dlc3Rpb25zWzBdLnZhbHVlLnRvTG93ZXJDYXNlKCkgPT09IHF1ZXJ5LnRvTG93ZXJDYXNlKCkpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGdldFF1ZXJ5OiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICAgICAgdmFyIGRlbGltaXRlciA9IHRoaXMub3B0aW9ucy5kZWxpbWl0ZXIsXHJcbiAgICAgICAgICAgICAgICBwYXJ0cztcclxuXHJcbiAgICAgICAgICAgIGlmICghZGVsaW1pdGVyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGFydHMgPSB2YWx1ZS5zcGxpdChkZWxpbWl0ZXIpO1xyXG4gICAgICAgICAgICByZXR1cm4gJC50cmltKHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBnZXRTdWdnZXN0aW9uc0xvY2FsOiBmdW5jdGlvbiAocXVlcnkpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcclxuICAgICAgICAgICAgICAgIHF1ZXJ5TG93ZXJDYXNlID0gcXVlcnkudG9Mb3dlckNhc2UoKSxcclxuICAgICAgICAgICAgICAgIGZpbHRlciA9IG9wdGlvbnMubG9va3VwRmlsdGVyLFxyXG4gICAgICAgICAgICAgICAgbGltaXQgPSBwYXJzZUludChvcHRpb25zLmxvb2t1cExpbWl0LCAxMCksXHJcbiAgICAgICAgICAgICAgICBkYXRhO1xyXG5cclxuICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb25zOiAkLmdyZXAob3B0aW9ucy5sb29rdXAsIGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpbHRlcihzdWdnZXN0aW9uLCBxdWVyeSwgcXVlcnlMb3dlckNhc2UpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGlmIChsaW1pdCAmJiBkYXRhLnN1Z2dlc3Rpb25zLmxlbmd0aCA+IGxpbWl0KSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhLnN1Z2dlc3Rpb25zID0gZGF0YS5zdWdnZXN0aW9ucy5zbGljZSgwLCBsaW1pdCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGdldFN1Z2dlc3Rpb25zOiBmdW5jdGlvbiAocSkge1xyXG4gICAgICAgICAgICB2YXIgcmVzcG9uc2UsXHJcbiAgICAgICAgICAgICAgICB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgICBzZXJ2aWNlVXJsID0gb3B0aW9ucy5zZXJ2aWNlVXJsLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zLFxyXG4gICAgICAgICAgICAgICAgY2FjaGVLZXksXHJcbiAgICAgICAgICAgICAgICBhamF4U2V0dGluZ3M7XHJcblxyXG4gICAgICAgICAgICBvcHRpb25zLnBhcmFtc1tvcHRpb25zLnBhcmFtTmFtZV0gPSBxO1xyXG4gICAgICAgICAgICBwYXJhbXMgPSBvcHRpb25zLmlnbm9yZVBhcmFtcyA/IG51bGwgOiBvcHRpb25zLnBhcmFtcztcclxuXHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLm9uU2VhcmNoU3RhcnQuY2FsbCh0aGF0LmVsZW1lbnQsIG9wdGlvbnMucGFyYW1zKSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihvcHRpb25zLmxvb2t1cCkpe1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5sb29rdXAocSwgZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gZGF0YS5zdWdnZXN0aW9ucztcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIGRhdGEuc3VnZ2VzdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LmlzTG9jYWwpIHtcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gdGhhdC5nZXRTdWdnZXN0aW9uc0xvY2FsKHEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihzZXJ2aWNlVXJsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VVcmwgPSBzZXJ2aWNlVXJsLmNhbGwodGhhdC5lbGVtZW50LCBxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhY2hlS2V5ID0gc2VydmljZVVybCArICc/JyArICQucGFyYW0ocGFyYW1zIHx8IHt9KTtcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gdGhhdC5jYWNoZWRSZXNwb25zZVtjYWNoZUtleV07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChyZXNwb25zZSAmJiAkLmlzQXJyYXkocmVzcG9uc2Uuc3VnZ2VzdGlvbnMpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gcmVzcG9uc2Uuc3VnZ2VzdGlvbnM7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgcmVzcG9uc2Uuc3VnZ2VzdGlvbnMpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF0aGF0LmlzQmFkUXVlcnkocSkpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuYWJvcnRBamF4KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgYWpheFNldHRpbmdzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDogc2VydmljZVVybCxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBwYXJhbXMsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogb3B0aW9ucy50eXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBvcHRpb25zLmRhdGFUeXBlXHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICQuZXh0ZW5kKGFqYXhTZXR0aW5ncywgb3B0aW9ucy5hamF4U2V0dGluZ3MpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QgPSAkLmFqYXgoYWpheFNldHRpbmdzKS5kb25lKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdDtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBvcHRpb25zLnRyYW5zZm9ybVJlc3VsdChkYXRhLCBxKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LnByb2Nlc3NSZXNwb25zZShyZXN1bHQsIHEsIGNhY2hlS2V5KTtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIHJlc3VsdC5zdWdnZXN0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICB9KS5mYWlsKGZ1bmN0aW9uIChqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pIHtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoRXJyb3IuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgW10pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgaXNCYWRRdWVyeTogZnVuY3Rpb24gKHEpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMucHJldmVudEJhZFF1ZXJpZXMpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgYmFkUXVlcmllcyA9IHRoaXMuYmFkUXVlcmllcyxcclxuICAgICAgICAgICAgICAgIGkgPSBiYWRRdWVyaWVzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIHdoaWxlIChpLS0pIHtcclxuICAgICAgICAgICAgICAgIGlmIChxLmluZGV4T2YoYmFkUXVlcmllc1tpXSkgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGhpZGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24odGhhdC5vcHRpb25zLm9uSGlkZSkgJiYgdGhhdC52aXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0Lm9wdGlvbnMub25IaWRlLmNhbGwodGhhdC5lbGVtZW50LCBjb250YWluZXIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGF0LnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcclxuICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIHRoYXQuc2lnbmFsSGludChudWxsKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzdWdnZXN0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnN1Z2dlc3Rpb25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zaG93Tm9TdWdnZXN0aW9uTm90aWNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub1N1Z2dlc3Rpb25zKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgZ3JvdXBCeSA9IG9wdGlvbnMuZ3JvdXBCeSxcclxuICAgICAgICAgICAgICAgIGZvcm1hdFJlc3VsdCA9IG9wdGlvbnMuZm9ybWF0UmVzdWx0LFxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGF0LmdldFF1ZXJ5KHRoYXQuY3VycmVudFZhbHVlKSxcclxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IHRoYXQuY2xhc3Nlcy5zdWdnZXN0aW9uLFxyXG4gICAgICAgICAgICAgICAgY2xhc3NTZWxlY3RlZCA9IHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCxcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXHJcbiAgICAgICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gJCh0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIpLFxyXG4gICAgICAgICAgICAgICAgYmVmb3JlUmVuZGVyID0gb3B0aW9ucy5iZWZvcmVSZW5kZXIsXHJcbiAgICAgICAgICAgICAgICBodG1sID0gJycsXHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIGZvcm1hdEdyb3VwID0gZnVuY3Rpb24gKHN1Z2dlc3Rpb24sIGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50Q2F0ZWdvcnkgPSBzdWdnZXN0aW9uLmRhdGFbZ3JvdXBCeV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2F0ZWdvcnkgPT09IGN1cnJlbnRDYXRlZ29yeSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5ID0gY3VycmVudENhdGVnb3J5O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiYXV0b2NvbXBsZXRlLWdyb3VwXCI+PHN0cm9uZz4nICsgY2F0ZWdvcnkgKyAnPC9zdHJvbmc+PC9kaXY+JztcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dCAmJiB0aGF0LmlzRXhhY3RNYXRjaCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KDApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBCdWlsZCBzdWdnZXN0aW9ucyBpbm5lciBIVE1MOlxyXG4gICAgICAgICAgICAkLmVhY2godGhhdC5zdWdnZXN0aW9ucywgZnVuY3Rpb24gKGksIHN1Z2dlc3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIGlmIChncm91cEJ5KXtcclxuICAgICAgICAgICAgICAgICAgICBodG1sICs9IGZvcm1hdEdyb3VwKHN1Z2dlc3Rpb24sIHZhbHVlLCBpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwiJyArIGNsYXNzTmFtZSArICdcIiBkYXRhLWluZGV4PVwiJyArIGkgKyAnXCI+JyArIGZvcm1hdFJlc3VsdChzdWdnZXN0aW9uLCB2YWx1ZSkgKyAnPC9kaXY+JztcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFkanVzdENvbnRhaW5lcldpZHRoKCk7XHJcblxyXG4gICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyLmRldGFjaCgpO1xyXG4gICAgICAgICAgICBjb250YWluZXIuaHRtbChodG1sKTtcclxuXHJcbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24oYmVmb3JlUmVuZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgYmVmb3JlUmVuZGVyLmNhbGwodGhhdC5lbGVtZW50LCBjb250YWluZXIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5zaG93KCk7XHJcblxyXG4gICAgICAgICAgICAvLyBTZWxlY3QgZmlyc3QgdmFsdWUgYnkgZGVmYXVsdDpcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuYXV0b1NlbGVjdEZpcnN0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAwO1xyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyLnNjcm9sbFRvcCgwKTtcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jaGlsZHJlbignLicgKyBjbGFzc05hbWUpLmZpcnN0KCkuYWRkQ2xhc3MoY2xhc3NTZWxlY3RlZCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoYXQudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoYXQuZmluZEJlc3RIaW50KCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgbm9TdWdnZXN0aW9uczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKSxcclxuICAgICAgICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gJCh0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hZGp1c3RDb250YWluZXJXaWR0aCgpO1xyXG5cclxuICAgICAgICAgICAgLy8gU29tZSBleHBsaWNpdCBzdGVwcy4gQmUgY2FyZWZ1bCBoZXJlIGFzIGl0IGVhc3kgdG8gZ2V0XHJcbiAgICAgICAgICAgIC8vIG5vU3VnZ2VzdGlvbnNDb250YWluZXIgcmVtb3ZlZCBmcm9tIERPTSBpZiBub3QgZGV0YWNoZWQgcHJvcGVybHkuXHJcbiAgICAgICAgICAgIG5vU3VnZ2VzdGlvbnNDb250YWluZXIuZGV0YWNoKCk7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5lbXB0eSgpOyAvLyBjbGVhbiBzdWdnZXN0aW9ucyBpZiBhbnlcclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZChub1N1Z2dlc3Rpb25zQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoYXQudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgYWRqdXN0Q29udGFpbmVyV2lkdGg6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgd2lkdGgsXHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgd2lkdGggaXMgYXV0bywgYWRqdXN0IHdpZHRoIGJlZm9yZSBkaXNwbGF5aW5nIHN1Z2dlc3Rpb25zLFxyXG4gICAgICAgICAgICAvLyBiZWNhdXNlIGlmIGluc3RhbmNlIHdhcyBjcmVhdGVkIGJlZm9yZSBpbnB1dCBoYWQgd2lkdGgsIGl0IHdpbGwgYmUgemVyby5cclxuICAgICAgICAgICAgLy8gQWxzbyBpdCBhZGp1c3RzIGlmIGlucHV0IHdpZHRoIGhhcyBjaGFuZ2VkLlxyXG4gICAgICAgICAgICAvLyAtMnB4IHRvIGFjY291bnQgZm9yIHN1Z2dlc3Rpb25zIGJvcmRlci5cclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMud2lkdGggPT09ICdhdXRvJykge1xyXG4gICAgICAgICAgICAgICAgd2lkdGggPSB0aGF0LmVsLm91dGVyV2lkdGgoKSAtIDI7XHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIud2lkdGgod2lkdGggPiAwID8gd2lkdGggOiAzMDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZmluZEJlc3RIaW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gdGhhdC5lbC52YWwoKS50b0xvd2VyQ2FzZSgpLFxyXG4gICAgICAgICAgICAgICAgYmVzdE1hdGNoID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIGlmICghdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgJC5lYWNoKHRoYXQuc3VnZ2VzdGlvbnMsIGZ1bmN0aW9uIChpLCBzdWdnZXN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZm91bmRNYXRjaCA9IHN1Z2dlc3Rpb24udmFsdWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHZhbHVlKSA9PT0gMDtcclxuICAgICAgICAgICAgICAgIGlmIChmb3VuZE1hdGNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoID0gc3VnZ2VzdGlvbjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiAhZm91bmRNYXRjaDtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQoYmVzdE1hdGNoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzaWduYWxIaW50OiBmdW5jdGlvbiAoc3VnZ2VzdGlvbikge1xyXG4gICAgICAgICAgICB2YXIgaGludFZhbHVlID0gJycsXHJcbiAgICAgICAgICAgICAgICB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgaWYgKHN1Z2dlc3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIGhpbnRWYWx1ZSA9IHRoYXQuY3VycmVudFZhbHVlICsgc3VnZ2VzdGlvbi52YWx1ZS5zdWJzdHIodGhhdC5jdXJyZW50VmFsdWUubGVuZ3RoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhhdC5oaW50VmFsdWUgIT09IGhpbnRWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5oaW50VmFsdWUgPSBoaW50VmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmhpbnQgPSBzdWdnZXN0aW9uO1xyXG4gICAgICAgICAgICAgICAgKHRoaXMub3B0aW9ucy5vbkhpbnQgfHwgJC5ub29wKShoaW50VmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgdmVyaWZ5U3VnZ2VzdGlvbnNGb3JtYXQ6IGZ1bmN0aW9uIChzdWdnZXN0aW9ucykge1xyXG4gICAgICAgICAgICAvLyBJZiBzdWdnZXN0aW9ucyBpcyBzdHJpbmcgYXJyYXksIGNvbnZlcnQgdGhlbSB0byBzdXBwb3J0ZWQgZm9ybWF0OlxyXG4gICAgICAgICAgICBpZiAoc3VnZ2VzdGlvbnMubGVuZ3RoICYmIHR5cGVvZiBzdWdnZXN0aW9uc1swXSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkLm1hcChzdWdnZXN0aW9ucywgZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IHZhbHVlLCBkYXRhOiBudWxsIH07XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb25zO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHZhbGlkYXRlT3JpZW50YXRpb246IGZ1bmN0aW9uKG9yaWVudGF0aW9uLCBmYWxsYmFjaykge1xyXG4gICAgICAgICAgICBvcmllbnRhdGlvbiA9ICQudHJpbShvcmllbnRhdGlvbiB8fCAnJykudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgICAgIGlmKCQuaW5BcnJheShvcmllbnRhdGlvbiwgWydhdXRvJywgJ2JvdHRvbScsICd0b3AnXSkgPT09IC0xKXtcclxuICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uID0gZmFsbGJhY2s7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBvcmllbnRhdGlvbjtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBwcm9jZXNzUmVzcG9uc2U6IGZ1bmN0aW9uIChyZXN1bHQsIG9yaWdpbmFsUXVlcnksIGNhY2hlS2V5KSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnM7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQuc3VnZ2VzdGlvbnMgPSB0aGF0LnZlcmlmeVN1Z2dlc3Rpb25zRm9ybWF0KHJlc3VsdC5zdWdnZXN0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICAvLyBDYWNoZSByZXN1bHRzIGlmIGNhY2hlIGlzIG5vdCBkaXNhYmxlZDpcclxuICAgICAgICAgICAgaWYgKCFvcHRpb25zLm5vQ2FjaGUpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuY2FjaGVkUmVzcG9uc2VbY2FjaGVLZXldID0gcmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMucHJldmVudEJhZFF1ZXJpZXMgJiYgcmVzdWx0LnN1Z2dlc3Rpb25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuYmFkUXVlcmllcy5wdXNoKG9yaWdpbmFsUXVlcnkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBSZXR1cm4gaWYgb3JpZ2luYWxRdWVyeSBpcyBub3QgbWF0Y2hpbmcgY3VycmVudCBxdWVyeTpcclxuICAgICAgICAgICAgaWYgKG9yaWdpbmFsUXVlcnkgIT09IHRoYXQuZ2V0UXVlcnkodGhhdC5jdXJyZW50VmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSByZXN1bHQuc3VnZ2VzdGlvbnM7XHJcbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGFjdGl2YXRlOiBmdW5jdGlvbiAoaW5kZXgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgYWN0aXZlSXRlbSxcclxuICAgICAgICAgICAgICAgIHNlbGVjdGVkID0gdGhhdC5jbGFzc2VzLnNlbGVjdGVkLFxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKSxcclxuICAgICAgICAgICAgICAgIGNoaWxkcmVuID0gY29udGFpbmVyLmZpbmQoJy4nICsgdGhhdC5jbGFzc2VzLnN1Z2dlc3Rpb24pO1xyXG5cclxuICAgICAgICAgICAgY29udGFpbmVyLmZpbmQoJy4nICsgc2VsZWN0ZWQpLnJlbW92ZUNsYXNzKHNlbGVjdGVkKTtcclxuXHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IGluZGV4O1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCAhPT0gLTEgJiYgY2hpbGRyZW4ubGVuZ3RoID4gdGhhdC5zZWxlY3RlZEluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICBhY3RpdmVJdGVtID0gY2hpbGRyZW4uZ2V0KHRoYXQuc2VsZWN0ZWRJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAkKGFjdGl2ZUl0ZW0pLmFkZENsYXNzKHNlbGVjdGVkKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBhY3RpdmVJdGVtO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzZWxlY3RIaW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIGkgPSAkLmluQXJyYXkodGhhdC5oaW50LCB0aGF0LnN1Z2dlc3Rpb25zKTtcclxuXHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0KGkpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNlbGVjdDogZnVuY3Rpb24gKGkpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICB0aGF0LmhpZGUoKTtcclxuICAgICAgICAgICAgdGhhdC5vblNlbGVjdChpKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBtb3ZlVXA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5jaGlsZHJlbigpLmZpcnN0KCkucmVtb3ZlQ2xhc3ModGhhdC5jbGFzc2VzLnNlbGVjdGVkKTtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5maW5kQmVzdEhpbnQoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhhdC5hZGp1c3RTY3JvbGwodGhhdC5zZWxlY3RlZEluZGV4IC0gMSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgbW92ZURvd246IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gKHRoYXQuc3VnZ2VzdGlvbnMubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhhdC5hZGp1c3RTY3JvbGwodGhhdC5zZWxlY3RlZEluZGV4ICsgMSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgYWRqdXN0U2Nyb2xsOiBmdW5jdGlvbiAoaW5kZXgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgYWN0aXZlSXRlbSA9IHRoYXQuYWN0aXZhdGUoaW5kZXgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFhY3RpdmVJdGVtKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBvZmZzZXRUb3AsXHJcbiAgICAgICAgICAgICAgICB1cHBlckJvdW5kLFxyXG4gICAgICAgICAgICAgICAgbG93ZXJCb3VuZCxcclxuICAgICAgICAgICAgICAgIGhlaWdodERlbHRhID0gJChhY3RpdmVJdGVtKS5vdXRlckhlaWdodCgpO1xyXG5cclxuICAgICAgICAgICAgb2Zmc2V0VG9wID0gYWN0aXZlSXRlbS5vZmZzZXRUb3A7XHJcbiAgICAgICAgICAgIHVwcGVyQm91bmQgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnNjcm9sbFRvcCgpO1xyXG4gICAgICAgICAgICBsb3dlckJvdW5kID0gdXBwZXJCb3VuZCArIHRoYXQub3B0aW9ucy5tYXhIZWlnaHQgLSBoZWlnaHREZWx0YTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvZmZzZXRUb3AgPCB1cHBlckJvdW5kKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnNjcm9sbFRvcChvZmZzZXRUb3ApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9mZnNldFRvcCA+IGxvd2VyQm91bmQpIHtcclxuICAgICAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuc2Nyb2xsVG9wKG9mZnNldFRvcCAtIHRoYXQub3B0aW9ucy5tYXhIZWlnaHQgKyBoZWlnaHREZWx0YSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghdGhhdC5vcHRpb25zLnByZXNlcnZlSW5wdXQpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuZ2V0VmFsdWUodGhhdC5zdWdnZXN0aW9uc1tpbmRleF0udmFsdWUpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQobnVsbCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChpbmRleCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvblNlbGVjdENhbGxiYWNrID0gdGhhdC5vcHRpb25zLm9uU2VsZWN0LFxyXG4gICAgICAgICAgICAgICAgc3VnZ2VzdGlvbiA9IHRoYXQuc3VnZ2VzdGlvbnNbaW5kZXhdO1xyXG5cclxuICAgICAgICAgICAgdGhhdC5jdXJyZW50VmFsdWUgPSB0aGF0LmdldFZhbHVlKHN1Z2dlc3Rpb24udmFsdWUpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoYXQuY3VycmVudFZhbHVlICE9PSB0aGF0LmVsLnZhbCgpICYmICF0aGF0Lm9wdGlvbnMucHJlc2VydmVJbnB1dCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQobnVsbCk7XHJcbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSBbXTtcclxuICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb24gPSBzdWdnZXN0aW9uO1xyXG5cclxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihvblNlbGVjdENhbGxiYWNrKSkge1xyXG4gICAgICAgICAgICAgICAgb25TZWxlY3RDYWxsYmFjay5jYWxsKHRoYXQuZWxlbWVudCwgc3VnZ2VzdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBnZXRWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIGRlbGltaXRlciA9IHRoYXQub3B0aW9ucy5kZWxpbWl0ZXIsXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50VmFsdWUsXHJcbiAgICAgICAgICAgICAgICBwYXJ0cztcclxuXHJcbiAgICAgICAgICAgIGlmICghZGVsaW1pdGVyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGN1cnJlbnRWYWx1ZSA9IHRoYXQuY3VycmVudFZhbHVlO1xyXG4gICAgICAgICAgICBwYXJ0cyA9IGN1cnJlbnRWYWx1ZS5zcGxpdChkZWxpbWl0ZXIpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gY3VycmVudFZhbHVlLnN1YnN0cigwLCBjdXJyZW50VmFsdWUubGVuZ3RoIC0gcGFydHNbcGFydHMubGVuZ3RoIC0gMV0ubGVuZ3RoKSArIHZhbHVlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGRpc3Bvc2U6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICB0aGF0LmVsLm9mZignLmF1dG9jb21wbGV0ZScpLnJlbW92ZURhdGEoJ2F1dG9jb21wbGV0ZScpO1xyXG4gICAgICAgICAgICB0aGF0LmRpc2FibGVLaWxsZXJGbigpO1xyXG4gICAgICAgICAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUuYXV0b2NvbXBsZXRlJywgdGhhdC5maXhQb3NpdGlvbkNhcHR1cmUpO1xyXG4gICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gQ3JlYXRlIGNoYWluYWJsZSBqUXVlcnkgcGx1Z2luOlxyXG4gICAgJC5mbi5hdXRvY29tcGxldGUgPSAkLmZuLmRldmJyaWRnZUF1dG9jb21wbGV0ZSA9IGZ1bmN0aW9uIChvcHRpb25zLCBhcmdzKSB7XHJcbiAgICAgICAgdmFyIGRhdGFLZXkgPSAnYXV0b2NvbXBsZXRlJztcclxuICAgICAgICAvLyBJZiBmdW5jdGlvbiBpbnZva2VkIHdpdGhvdXQgYXJndW1lbnQgcmV0dXJuXHJcbiAgICAgICAgLy8gaW5zdGFuY2Ugb2YgdGhlIGZpcnN0IG1hdGNoZWQgZWxlbWVudDpcclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maXJzdCgpLmRhdGEoZGF0YUtleSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGlucHV0RWxlbWVudCA9ICQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IGlucHV0RWxlbWVudC5kYXRhKGRhdGFLZXkpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlICYmIHR5cGVvZiBpbnN0YW5jZVtvcHRpb25zXSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlW29wdGlvbnNdKGFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgaW5zdGFuY2UgYWxyZWFkeSBleGlzdHMsIGRlc3Ryb3kgaXQ6XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UgJiYgaW5zdGFuY2UuZGlzcG9zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLmRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGluc3RhbmNlID0gbmV3IEF1dG9jb21wbGV0ZSh0aGlzLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIGlucHV0RWxlbWVudC5kYXRhKGRhdGFLZXksIGluc3RhbmNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxufSkpO1xyXG4iLCIvKiEgU2VsZWN0MiA0LjAuMyB8IGh0dHBzOi8vZ2l0aHViLmNvbS9zZWxlY3QyL3NlbGVjdDIvYmxvYi9tYXN0ZXIvTElDRU5TRS5tZCAqLyFmdW5jdGlvbihhKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtcImpxdWVyeVwiXSxhKTphKFwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP3JlcXVpcmUoXCJqcXVlcnlcIik6alF1ZXJ5KX0oZnVuY3Rpb24oYSl7dmFyIGI9ZnVuY3Rpb24oKXtpZihhJiZhLmZuJiZhLmZuLnNlbGVjdDImJmEuZm4uc2VsZWN0Mi5hbWQpdmFyIGI9YS5mbi5zZWxlY3QyLmFtZDt2YXIgYjtyZXR1cm4gZnVuY3Rpb24oKXtpZighYnx8IWIucmVxdWlyZWpzKXtiP2M9YjpiPXt9O3ZhciBhLGMsZDshZnVuY3Rpb24oYil7ZnVuY3Rpb24gZShhLGIpe3JldHVybiB1LmNhbGwoYSxiKX1mdW5jdGlvbiBmKGEsYil7dmFyIGMsZCxlLGYsZyxoLGksaixrLGwsbSxuPWImJmIuc3BsaXQoXCIvXCIpLG89cy5tYXAscD1vJiZvW1wiKlwiXXx8e307aWYoYSYmXCIuXCI9PT1hLmNoYXJBdCgwKSlpZihiKXtmb3IoYT1hLnNwbGl0KFwiL1wiKSxnPWEubGVuZ3RoLTEscy5ub2RlSWRDb21wYXQmJncudGVzdChhW2ddKSYmKGFbZ109YVtnXS5yZXBsYWNlKHcsXCJcIikpLGE9bi5zbGljZSgwLG4ubGVuZ3RoLTEpLmNvbmNhdChhKSxrPTA7azxhLmxlbmd0aDtrKz0xKWlmKG09YVtrXSxcIi5cIj09PW0pYS5zcGxpY2UoaywxKSxrLT0xO2Vsc2UgaWYoXCIuLlwiPT09bSl7aWYoMT09PWsmJihcIi4uXCI9PT1hWzJdfHxcIi4uXCI9PT1hWzBdKSlicmVhaztrPjAmJihhLnNwbGljZShrLTEsMiksay09Mil9YT1hLmpvaW4oXCIvXCIpfWVsc2UgMD09PWEuaW5kZXhPZihcIi4vXCIpJiYoYT1hLnN1YnN0cmluZygyKSk7aWYoKG58fHApJiZvKXtmb3IoYz1hLnNwbGl0KFwiL1wiKSxrPWMubGVuZ3RoO2s+MDtrLT0xKXtpZihkPWMuc2xpY2UoMCxrKS5qb2luKFwiL1wiKSxuKWZvcihsPW4ubGVuZ3RoO2w+MDtsLT0xKWlmKGU9b1tuLnNsaWNlKDAsbCkuam9pbihcIi9cIildLGUmJihlPWVbZF0pKXtmPWUsaD1rO2JyZWFrfWlmKGYpYnJlYWs7IWkmJnAmJnBbZF0mJihpPXBbZF0saj1rKX0hZiYmaSYmKGY9aSxoPWopLGYmJihjLnNwbGljZSgwLGgsZiksYT1jLmpvaW4oXCIvXCIpKX1yZXR1cm4gYX1mdW5jdGlvbiBnKGEsYyl7cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIGQ9di5jYWxsKGFyZ3VtZW50cywwKTtyZXR1cm5cInN0cmluZ1wiIT10eXBlb2YgZFswXSYmMT09PWQubGVuZ3RoJiZkLnB1c2gobnVsbCksbi5hcHBseShiLGQuY29uY2F0KFthLGNdKSl9fWZ1bmN0aW9uIGgoYSl7cmV0dXJuIGZ1bmN0aW9uKGIpe3JldHVybiBmKGIsYSl9fWZ1bmN0aW9uIGkoYSl7cmV0dXJuIGZ1bmN0aW9uKGIpe3FbYV09Yn19ZnVuY3Rpb24gaihhKXtpZihlKHIsYSkpe3ZhciBjPXJbYV07ZGVsZXRlIHJbYV0sdFthXT0hMCxtLmFwcGx5KGIsYyl9aWYoIWUocSxhKSYmIWUodCxhKSl0aHJvdyBuZXcgRXJyb3IoXCJObyBcIithKTtyZXR1cm4gcVthXX1mdW5jdGlvbiBrKGEpe3ZhciBiLGM9YT9hLmluZGV4T2YoXCIhXCIpOi0xO3JldHVybiBjPi0xJiYoYj1hLnN1YnN0cmluZygwLGMpLGE9YS5zdWJzdHJpbmcoYysxLGEubGVuZ3RoKSksW2IsYV19ZnVuY3Rpb24gbChhKXtyZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gcyYmcy5jb25maWcmJnMuY29uZmlnW2FdfHx7fX19dmFyIG0sbixvLHAscT17fSxyPXt9LHM9e30sdD17fSx1PU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHksdj1bXS5zbGljZSx3PS9cXC5qcyQvO289ZnVuY3Rpb24oYSxiKXt2YXIgYyxkPWsoYSksZT1kWzBdO3JldHVybiBhPWRbMV0sZSYmKGU9ZihlLGIpLGM9aihlKSksZT9hPWMmJmMubm9ybWFsaXplP2Mubm9ybWFsaXplKGEsaChiKSk6ZihhLGIpOihhPWYoYSxiKSxkPWsoYSksZT1kWzBdLGE9ZFsxXSxlJiYoYz1qKGUpKSkse2Y6ZT9lK1wiIVwiK2E6YSxuOmEscHI6ZSxwOmN9fSxwPXtyZXF1aXJlOmZ1bmN0aW9uKGEpe3JldHVybiBnKGEpfSxleHBvcnRzOmZ1bmN0aW9uKGEpe3ZhciBiPXFbYV07cmV0dXJuXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGI/YjpxW2FdPXt9fSxtb2R1bGU6ZnVuY3Rpb24oYSl7cmV0dXJue2lkOmEsdXJpOlwiXCIsZXhwb3J0czpxW2FdLGNvbmZpZzpsKGEpfX19LG09ZnVuY3Rpb24oYSxjLGQsZil7dmFyIGgsayxsLG0sbixzLHU9W10sdj10eXBlb2YgZDtpZihmPWZ8fGEsXCJ1bmRlZmluZWRcIj09PXZ8fFwiZnVuY3Rpb25cIj09PXYpe2ZvcihjPSFjLmxlbmd0aCYmZC5sZW5ndGg/W1wicmVxdWlyZVwiLFwiZXhwb3J0c1wiLFwibW9kdWxlXCJdOmMsbj0wO248Yy5sZW5ndGg7bis9MSlpZihtPW8oY1tuXSxmKSxrPW0uZixcInJlcXVpcmVcIj09PWspdVtuXT1wLnJlcXVpcmUoYSk7ZWxzZSBpZihcImV4cG9ydHNcIj09PWspdVtuXT1wLmV4cG9ydHMoYSkscz0hMDtlbHNlIGlmKFwibW9kdWxlXCI9PT1rKWg9dVtuXT1wLm1vZHVsZShhKTtlbHNlIGlmKGUocSxrKXx8ZShyLGspfHxlKHQsaykpdVtuXT1qKGspO2Vsc2V7aWYoIW0ucCl0aHJvdyBuZXcgRXJyb3IoYStcIiBtaXNzaW5nIFwiK2spO20ucC5sb2FkKG0ubixnKGYsITApLGkoaykse30pLHVbbl09cVtrXX1sPWQ/ZC5hcHBseShxW2FdLHUpOnZvaWQgMCxhJiYoaCYmaC5leHBvcnRzIT09YiYmaC5leHBvcnRzIT09cVthXT9xW2FdPWguZXhwb3J0czpsPT09YiYmc3x8KHFbYV09bCkpfWVsc2UgYSYmKHFbYV09ZCl9LGE9Yz1uPWZ1bmN0aW9uKGEsYyxkLGUsZil7aWYoXCJzdHJpbmdcIj09dHlwZW9mIGEpcmV0dXJuIHBbYV0/cFthXShjKTpqKG8oYSxjKS5mKTtpZighYS5zcGxpY2Upe2lmKHM9YSxzLmRlcHMmJm4ocy5kZXBzLHMuY2FsbGJhY2spLCFjKXJldHVybjtjLnNwbGljZT8oYT1jLGM9ZCxkPW51bGwpOmE9Yn1yZXR1cm4gYz1jfHxmdW5jdGlvbigpe30sXCJmdW5jdGlvblwiPT10eXBlb2YgZCYmKGQ9ZSxlPWYpLGU/bShiLGEsYyxkKTpzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7bShiLGEsYyxkKX0sNCksbn0sbi5jb25maWc9ZnVuY3Rpb24oYSl7cmV0dXJuIG4oYSl9LGEuX2RlZmluZWQ9cSxkPWZ1bmN0aW9uKGEsYixjKXtpZihcInN0cmluZ1wiIT10eXBlb2YgYSl0aHJvdyBuZXcgRXJyb3IoXCJTZWUgYWxtb25kIFJFQURNRTogaW5jb3JyZWN0IG1vZHVsZSBidWlsZCwgbm8gbW9kdWxlIG5hbWVcIik7Yi5zcGxpY2V8fChjPWIsYj1bXSksZShxLGEpfHxlKHIsYSl8fChyW2FdPVthLGIsY10pfSxkLmFtZD17alF1ZXJ5OiEwfX0oKSxiLnJlcXVpcmVqcz1hLGIucmVxdWlyZT1jLGIuZGVmaW5lPWR9fSgpLGIuZGVmaW5lKFwiYWxtb25kXCIsZnVuY3Rpb24oKXt9KSxiLmRlZmluZShcImpxdWVyeVwiLFtdLGZ1bmN0aW9uKCl7dmFyIGI9YXx8JDtyZXR1cm4gbnVsbD09YiYmY29uc29sZSYmY29uc29sZS5lcnJvciYmY29uc29sZS5lcnJvcihcIlNlbGVjdDI6IEFuIGluc3RhbmNlIG9mIGpRdWVyeSBvciBhIGpRdWVyeS1jb21wYXRpYmxlIGxpYnJhcnkgd2FzIG5vdCBmb3VuZC4gTWFrZSBzdXJlIHRoYXQgeW91IGFyZSBpbmNsdWRpbmcgalF1ZXJ5IGJlZm9yZSBTZWxlY3QyIG9uIHlvdXIgd2ViIHBhZ2UuXCIpLGJ9KSxiLmRlZmluZShcInNlbGVjdDIvdXRpbHNcIixbXCJqcXVlcnlcIl0sZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYihhKXt2YXIgYj1hLnByb3RvdHlwZSxjPVtdO2Zvcih2YXIgZCBpbiBiKXt2YXIgZT1iW2RdO1wiZnVuY3Rpb25cIj09dHlwZW9mIGUmJlwiY29uc3RydWN0b3JcIiE9PWQmJmMucHVzaChkKX1yZXR1cm4gY312YXIgYz17fTtjLkV4dGVuZD1mdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoKXt0aGlzLmNvbnN0cnVjdG9yPWF9dmFyIGQ9e30uaGFzT3duUHJvcGVydHk7Zm9yKHZhciBlIGluIGIpZC5jYWxsKGIsZSkmJihhW2VdPWJbZV0pO3JldHVybiBjLnByb3RvdHlwZT1iLnByb3RvdHlwZSxhLnByb3RvdHlwZT1uZXcgYyxhLl9fc3VwZXJfXz1iLnByb3RvdHlwZSxhfSxjLkRlY29yYXRlPWZ1bmN0aW9uKGEsYyl7ZnVuY3Rpb24gZCgpe3ZhciBiPUFycmF5LnByb3RvdHlwZS51bnNoaWZ0LGQ9Yy5wcm90b3R5cGUuY29uc3RydWN0b3IubGVuZ3RoLGU9YS5wcm90b3R5cGUuY29uc3RydWN0b3I7ZD4wJiYoYi5jYWxsKGFyZ3VtZW50cyxhLnByb3RvdHlwZS5jb25zdHJ1Y3RvciksZT1jLnByb3RvdHlwZS5jb25zdHJ1Y3RvciksZS5hcHBseSh0aGlzLGFyZ3VtZW50cyl9ZnVuY3Rpb24gZSgpe3RoaXMuY29uc3RydWN0b3I9ZH12YXIgZj1iKGMpLGc9YihhKTtjLmRpc3BsYXlOYW1lPWEuZGlzcGxheU5hbWUsZC5wcm90b3R5cGU9bmV3IGU7Zm9yKHZhciBoPTA7aDxnLmxlbmd0aDtoKyspe3ZhciBpPWdbaF07ZC5wcm90b3R5cGVbaV09YS5wcm90b3R5cGVbaV19Zm9yKHZhciBqPShmdW5jdGlvbihhKXt2YXIgYj1mdW5jdGlvbigpe307YSBpbiBkLnByb3RvdHlwZSYmKGI9ZC5wcm90b3R5cGVbYV0pO3ZhciBlPWMucHJvdG90eXBlW2FdO3JldHVybiBmdW5jdGlvbigpe3ZhciBhPUFycmF5LnByb3RvdHlwZS51bnNoaWZ0O3JldHVybiBhLmNhbGwoYXJndW1lbnRzLGIpLGUuYXBwbHkodGhpcyxhcmd1bWVudHMpfX0pLGs9MDtrPGYubGVuZ3RoO2srKyl7dmFyIGw9ZltrXTtkLnByb3RvdHlwZVtsXT1qKGwpfXJldHVybiBkfTt2YXIgZD1mdW5jdGlvbigpe3RoaXMubGlzdGVuZXJzPXt9fTtyZXR1cm4gZC5wcm90b3R5cGUub249ZnVuY3Rpb24oYSxiKXt0aGlzLmxpc3RlbmVycz10aGlzLmxpc3RlbmVyc3x8e30sYSBpbiB0aGlzLmxpc3RlbmVycz90aGlzLmxpc3RlbmVyc1thXS5wdXNoKGIpOnRoaXMubGlzdGVuZXJzW2FdPVtiXX0sZC5wcm90b3R5cGUudHJpZ2dlcj1mdW5jdGlvbihhKXt2YXIgYj1BcnJheS5wcm90b3R5cGUuc2xpY2UsYz1iLmNhbGwoYXJndW1lbnRzLDEpO3RoaXMubGlzdGVuZXJzPXRoaXMubGlzdGVuZXJzfHx7fSxudWxsPT1jJiYoYz1bXSksMD09PWMubGVuZ3RoJiZjLnB1c2goe30pLGNbMF0uX3R5cGU9YSxhIGluIHRoaXMubGlzdGVuZXJzJiZ0aGlzLmludm9rZSh0aGlzLmxpc3RlbmVyc1thXSxiLmNhbGwoYXJndW1lbnRzLDEpKSxcIipcImluIHRoaXMubGlzdGVuZXJzJiZ0aGlzLmludm9rZSh0aGlzLmxpc3RlbmVyc1tcIipcIl0sYXJndW1lbnRzKX0sZC5wcm90b3R5cGUuaW52b2tlPWZ1bmN0aW9uKGEsYil7Zm9yKHZhciBjPTAsZD1hLmxlbmd0aDtkPmM7YysrKWFbY10uYXBwbHkodGhpcyxiKX0sYy5PYnNlcnZhYmxlPWQsYy5nZW5lcmF0ZUNoYXJzPWZ1bmN0aW9uKGEpe2Zvcih2YXIgYj1cIlwiLGM9MDthPmM7YysrKXt2YXIgZD1NYXRoLmZsb29yKDM2Kk1hdGgucmFuZG9tKCkpO2IrPWQudG9TdHJpbmcoMzYpfXJldHVybiBifSxjLmJpbmQ9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gZnVuY3Rpb24oKXthLmFwcGx5KGIsYXJndW1lbnRzKX19LGMuX2NvbnZlcnREYXRhPWZ1bmN0aW9uKGEpe2Zvcih2YXIgYiBpbiBhKXt2YXIgYz1iLnNwbGl0KFwiLVwiKSxkPWE7aWYoMSE9PWMubGVuZ3RoKXtmb3IodmFyIGU9MDtlPGMubGVuZ3RoO2UrKyl7dmFyIGY9Y1tlXTtmPWYuc3Vic3RyaW5nKDAsMSkudG9Mb3dlckNhc2UoKStmLnN1YnN0cmluZygxKSxmIGluIGR8fChkW2ZdPXt9KSxlPT1jLmxlbmd0aC0xJiYoZFtmXT1hW2JdKSxkPWRbZl19ZGVsZXRlIGFbYl19fXJldHVybiBhfSxjLmhhc1Njcm9sbD1mdW5jdGlvbihiLGMpe3ZhciBkPWEoYyksZT1jLnN0eWxlLm92ZXJmbG93WCxmPWMuc3R5bGUub3ZlcmZsb3dZO3JldHVybiBlIT09Znx8XCJoaWRkZW5cIiE9PWYmJlwidmlzaWJsZVwiIT09Zj9cInNjcm9sbFwiPT09ZXx8XCJzY3JvbGxcIj09PWY/ITA6ZC5pbm5lckhlaWdodCgpPGMuc2Nyb2xsSGVpZ2h0fHxkLmlubmVyV2lkdGgoKTxjLnNjcm9sbFdpZHRoOiExfSxjLmVzY2FwZU1hcmt1cD1mdW5jdGlvbihhKXt2YXIgYj17XCJcXFxcXCI6XCImIzkyO1wiLFwiJlwiOlwiJmFtcDtcIixcIjxcIjpcIiZsdDtcIixcIj5cIjpcIiZndDtcIiwnXCInOlwiJnF1b3Q7XCIsXCInXCI6XCImIzM5O1wiLFwiL1wiOlwiJiM0NztcIn07cmV0dXJuXCJzdHJpbmdcIiE9dHlwZW9mIGE/YTpTdHJpbmcoYSkucmVwbGFjZSgvWyY8PlwiJ1xcL1xcXFxdL2csZnVuY3Rpb24oYSl7cmV0dXJuIGJbYV19KX0sYy5hcHBlbmRNYW55PWZ1bmN0aW9uKGIsYyl7aWYoXCIxLjdcIj09PWEuZm4uanF1ZXJ5LnN1YnN0cigwLDMpKXt2YXIgZD1hKCk7YS5tYXAoYyxmdW5jdGlvbihhKXtkPWQuYWRkKGEpfSksYz1kfWIuYXBwZW5kKGMpfSxjfSksYi5kZWZpbmUoXCJzZWxlY3QyL3Jlc3VsdHNcIixbXCJqcXVlcnlcIixcIi4vdXRpbHNcIl0sZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGEsYixkKXt0aGlzLiRlbGVtZW50PWEsdGhpcy5kYXRhPWQsdGhpcy5vcHRpb25zPWIsYy5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzKX1yZXR1cm4gYi5FeHRlbmQoYyxiLk9ic2VydmFibGUpLGMucHJvdG90eXBlLnJlbmRlcj1mdW5jdGlvbigpe3ZhciBiPWEoJzx1bCBjbGFzcz1cInNlbGVjdDItcmVzdWx0c19fb3B0aW9uc1wiIHJvbGU9XCJ0cmVlXCI+PC91bD4nKTtyZXR1cm4gdGhpcy5vcHRpb25zLmdldChcIm11bHRpcGxlXCIpJiZiLmF0dHIoXCJhcmlhLW11bHRpc2VsZWN0YWJsZVwiLFwidHJ1ZVwiKSx0aGlzLiRyZXN1bHRzPWIsYn0sYy5wcm90b3R5cGUuY2xlYXI9ZnVuY3Rpb24oKXt0aGlzLiRyZXN1bHRzLmVtcHR5KCl9LGMucHJvdG90eXBlLmRpc3BsYXlNZXNzYWdlPWZ1bmN0aW9uKGIpe3ZhciBjPXRoaXMub3B0aW9ucy5nZXQoXCJlc2NhcGVNYXJrdXBcIik7dGhpcy5jbGVhcigpLHRoaXMuaGlkZUxvYWRpbmcoKTt2YXIgZD1hKCc8bGkgcm9sZT1cInRyZWVpdGVtXCIgYXJpYS1saXZlPVwiYXNzZXJ0aXZlXCIgY2xhc3M9XCJzZWxlY3QyLXJlc3VsdHNfX29wdGlvblwiPjwvbGk+JyksZT10aGlzLm9wdGlvbnMuZ2V0KFwidHJhbnNsYXRpb25zXCIpLmdldChiLm1lc3NhZ2UpO2QuYXBwZW5kKGMoZShiLmFyZ3MpKSksZFswXS5jbGFzc05hbWUrPVwiIHNlbGVjdDItcmVzdWx0c19fbWVzc2FnZVwiLHRoaXMuJHJlc3VsdHMuYXBwZW5kKGQpfSxjLnByb3RvdHlwZS5oaWRlTWVzc2FnZXM9ZnVuY3Rpb24oKXt0aGlzLiRyZXN1bHRzLmZpbmQoXCIuc2VsZWN0Mi1yZXN1bHRzX19tZXNzYWdlXCIpLnJlbW92ZSgpfSxjLnByb3RvdHlwZS5hcHBlbmQ9ZnVuY3Rpb24oYSl7dGhpcy5oaWRlTG9hZGluZygpO3ZhciBiPVtdO2lmKG51bGw9PWEucmVzdWx0c3x8MD09PWEucmVzdWx0cy5sZW5ndGgpcmV0dXJuIHZvaWQoMD09PXRoaXMuJHJlc3VsdHMuY2hpbGRyZW4oKS5sZW5ndGgmJnRoaXMudHJpZ2dlcihcInJlc3VsdHM6bWVzc2FnZVwiLHttZXNzYWdlOlwibm9SZXN1bHRzXCJ9KSk7YS5yZXN1bHRzPXRoaXMuc29ydChhLnJlc3VsdHMpO2Zvcih2YXIgYz0wO2M8YS5yZXN1bHRzLmxlbmd0aDtjKyspe3ZhciBkPWEucmVzdWx0c1tjXSxlPXRoaXMub3B0aW9uKGQpO2IucHVzaChlKX10aGlzLiRyZXN1bHRzLmFwcGVuZChiKX0sYy5wcm90b3R5cGUucG9zaXRpb249ZnVuY3Rpb24oYSxiKXt2YXIgYz1iLmZpbmQoXCIuc2VsZWN0Mi1yZXN1bHRzXCIpO2MuYXBwZW5kKGEpfSxjLnByb3RvdHlwZS5zb3J0PWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMub3B0aW9ucy5nZXQoXCJzb3J0ZXJcIik7cmV0dXJuIGIoYSl9LGMucHJvdG90eXBlLmhpZ2hsaWdodEZpcnN0SXRlbT1mdW5jdGlvbigpe3ZhciBhPXRoaXMuJHJlc3VsdHMuZmluZChcIi5zZWxlY3QyLXJlc3VsdHNfX29wdGlvblthcmlhLXNlbGVjdGVkXVwiKSxiPWEuZmlsdGVyKFwiW2FyaWEtc2VsZWN0ZWQ9dHJ1ZV1cIik7Yi5sZW5ndGg+MD9iLmZpcnN0KCkudHJpZ2dlcihcIm1vdXNlZW50ZXJcIik6YS5maXJzdCgpLnRyaWdnZXIoXCJtb3VzZWVudGVyXCIpLHRoaXMuZW5zdXJlSGlnaGxpZ2h0VmlzaWJsZSgpfSxjLnByb3RvdHlwZS5zZXRDbGFzc2VzPWZ1bmN0aW9uKCl7dmFyIGI9dGhpczt0aGlzLmRhdGEuY3VycmVudChmdW5jdGlvbihjKXt2YXIgZD1hLm1hcChjLGZ1bmN0aW9uKGEpe3JldHVybiBhLmlkLnRvU3RyaW5nKCl9KSxlPWIuJHJlc3VsdHMuZmluZChcIi5zZWxlY3QyLXJlc3VsdHNfX29wdGlvblthcmlhLXNlbGVjdGVkXVwiKTtlLmVhY2goZnVuY3Rpb24oKXt2YXIgYj1hKHRoaXMpLGM9YS5kYXRhKHRoaXMsXCJkYXRhXCIpLGU9XCJcIitjLmlkO251bGwhPWMuZWxlbWVudCYmYy5lbGVtZW50LnNlbGVjdGVkfHxudWxsPT1jLmVsZW1lbnQmJmEuaW5BcnJheShlLGQpPi0xP2IuYXR0cihcImFyaWEtc2VsZWN0ZWRcIixcInRydWVcIik6Yi5hdHRyKFwiYXJpYS1zZWxlY3RlZFwiLFwiZmFsc2VcIil9KX0pfSxjLnByb3RvdHlwZS5zaG93TG9hZGluZz1mdW5jdGlvbihhKXt0aGlzLmhpZGVMb2FkaW5nKCk7dmFyIGI9dGhpcy5vcHRpb25zLmdldChcInRyYW5zbGF0aW9uc1wiKS5nZXQoXCJzZWFyY2hpbmdcIiksYz17ZGlzYWJsZWQ6ITAsbG9hZGluZzohMCx0ZXh0OmIoYSl9LGQ9dGhpcy5vcHRpb24oYyk7ZC5jbGFzc05hbWUrPVwiIGxvYWRpbmctcmVzdWx0c1wiLHRoaXMuJHJlc3VsdHMucHJlcGVuZChkKX0sYy5wcm90b3R5cGUuaGlkZUxvYWRpbmc9ZnVuY3Rpb24oKXt0aGlzLiRyZXN1bHRzLmZpbmQoXCIubG9hZGluZy1yZXN1bHRzXCIpLnJlbW92ZSgpfSxjLnByb3RvdHlwZS5vcHRpb249ZnVuY3Rpb24oYil7dmFyIGM9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO2MuY2xhc3NOYW1lPVwic2VsZWN0Mi1yZXN1bHRzX19vcHRpb25cIjt2YXIgZD17cm9sZTpcInRyZWVpdGVtXCIsXCJhcmlhLXNlbGVjdGVkXCI6XCJmYWxzZVwifTtiLmRpc2FibGVkJiYoZGVsZXRlIGRbXCJhcmlhLXNlbGVjdGVkXCJdLGRbXCJhcmlhLWRpc2FibGVkXCJdPVwidHJ1ZVwiKSxudWxsPT1iLmlkJiZkZWxldGUgZFtcImFyaWEtc2VsZWN0ZWRcIl0sbnVsbCE9Yi5fcmVzdWx0SWQmJihjLmlkPWIuX3Jlc3VsdElkKSxiLnRpdGxlJiYoYy50aXRsZT1iLnRpdGxlKSxiLmNoaWxkcmVuJiYoZC5yb2xlPVwiZ3JvdXBcIixkW1wiYXJpYS1sYWJlbFwiXT1iLnRleHQsZGVsZXRlIGRbXCJhcmlhLXNlbGVjdGVkXCJdKTtmb3IodmFyIGUgaW4gZCl7dmFyIGY9ZFtlXTtjLnNldEF0dHJpYnV0ZShlLGYpfWlmKGIuY2hpbGRyZW4pe3ZhciBnPWEoYyksaD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3Ryb25nXCIpO2guY2xhc3NOYW1lPVwic2VsZWN0Mi1yZXN1bHRzX19ncm91cFwiO2EoaCk7dGhpcy50ZW1wbGF0ZShiLGgpO2Zvcih2YXIgaT1bXSxqPTA7ajxiLmNoaWxkcmVuLmxlbmd0aDtqKyspe3ZhciBrPWIuY2hpbGRyZW5bal0sbD10aGlzLm9wdGlvbihrKTtpLnB1c2gobCl9dmFyIG09YShcIjx1bD48L3VsPlwiLHtcImNsYXNzXCI6XCJzZWxlY3QyLXJlc3VsdHNfX29wdGlvbnMgc2VsZWN0Mi1yZXN1bHRzX19vcHRpb25zLS1uZXN0ZWRcIn0pO20uYXBwZW5kKGkpLGcuYXBwZW5kKGgpLGcuYXBwZW5kKG0pfWVsc2UgdGhpcy50ZW1wbGF0ZShiLGMpO3JldHVybiBhLmRhdGEoYyxcImRhdGFcIixiKSxjfSxjLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGIsYyl7dmFyIGQ9dGhpcyxlPWIuaWQrXCItcmVzdWx0c1wiO3RoaXMuJHJlc3VsdHMuYXR0cihcImlkXCIsZSksYi5vbihcInJlc3VsdHM6YWxsXCIsZnVuY3Rpb24oYSl7ZC5jbGVhcigpLGQuYXBwZW5kKGEuZGF0YSksYi5pc09wZW4oKSYmKGQuc2V0Q2xhc3NlcygpLGQuaGlnaGxpZ2h0Rmlyc3RJdGVtKCkpfSksYi5vbihcInJlc3VsdHM6YXBwZW5kXCIsZnVuY3Rpb24oYSl7ZC5hcHBlbmQoYS5kYXRhKSxiLmlzT3BlbigpJiZkLnNldENsYXNzZXMoKX0pLGIub24oXCJxdWVyeVwiLGZ1bmN0aW9uKGEpe2QuaGlkZU1lc3NhZ2VzKCksZC5zaG93TG9hZGluZyhhKX0pLGIub24oXCJzZWxlY3RcIixmdW5jdGlvbigpe2IuaXNPcGVuKCkmJihkLnNldENsYXNzZXMoKSxkLmhpZ2hsaWdodEZpcnN0SXRlbSgpKX0pLGIub24oXCJ1bnNlbGVjdFwiLGZ1bmN0aW9uKCl7Yi5pc09wZW4oKSYmKGQuc2V0Q2xhc3NlcygpLGQuaGlnaGxpZ2h0Rmlyc3RJdGVtKCkpfSksYi5vbihcIm9wZW5cIixmdW5jdGlvbigpe2QuJHJlc3VsdHMuYXR0cihcImFyaWEtZXhwYW5kZWRcIixcInRydWVcIiksZC4kcmVzdWx0cy5hdHRyKFwiYXJpYS1oaWRkZW5cIixcImZhbHNlXCIpLGQuc2V0Q2xhc3NlcygpLGQuZW5zdXJlSGlnaGxpZ2h0VmlzaWJsZSgpfSksYi5vbihcImNsb3NlXCIsZnVuY3Rpb24oKXtkLiRyZXN1bHRzLmF0dHIoXCJhcmlhLWV4cGFuZGVkXCIsXCJmYWxzZVwiKSxkLiRyZXN1bHRzLmF0dHIoXCJhcmlhLWhpZGRlblwiLFwidHJ1ZVwiKSxkLiRyZXN1bHRzLnJlbW92ZUF0dHIoXCJhcmlhLWFjdGl2ZWRlc2NlbmRhbnRcIil9KSxiLm9uKFwicmVzdWx0czp0b2dnbGVcIixmdW5jdGlvbigpe3ZhciBhPWQuZ2V0SGlnaGxpZ2h0ZWRSZXN1bHRzKCk7MCE9PWEubGVuZ3RoJiZhLnRyaWdnZXIoXCJtb3VzZXVwXCIpfSksYi5vbihcInJlc3VsdHM6c2VsZWN0XCIsZnVuY3Rpb24oKXt2YXIgYT1kLmdldEhpZ2hsaWdodGVkUmVzdWx0cygpO2lmKDAhPT1hLmxlbmd0aCl7dmFyIGI9YS5kYXRhKFwiZGF0YVwiKTtcInRydWVcIj09YS5hdHRyKFwiYXJpYS1zZWxlY3RlZFwiKT9kLnRyaWdnZXIoXCJjbG9zZVwiLHt9KTpkLnRyaWdnZXIoXCJzZWxlY3RcIix7ZGF0YTpifSl9fSksYi5vbihcInJlc3VsdHM6cHJldmlvdXNcIixmdW5jdGlvbigpe3ZhciBhPWQuZ2V0SGlnaGxpZ2h0ZWRSZXN1bHRzKCksYj1kLiRyZXN1bHRzLmZpbmQoXCJbYXJpYS1zZWxlY3RlZF1cIiksYz1iLmluZGV4KGEpO2lmKDAhPT1jKXt2YXIgZT1jLTE7MD09PWEubGVuZ3RoJiYoZT0wKTt2YXIgZj1iLmVxKGUpO2YudHJpZ2dlcihcIm1vdXNlZW50ZXJcIik7dmFyIGc9ZC4kcmVzdWx0cy5vZmZzZXQoKS50b3AsaD1mLm9mZnNldCgpLnRvcCxpPWQuJHJlc3VsdHMuc2Nyb2xsVG9wKCkrKGgtZyk7MD09PWU/ZC4kcmVzdWx0cy5zY3JvbGxUb3AoMCk6MD5oLWcmJmQuJHJlc3VsdHMuc2Nyb2xsVG9wKGkpfX0pLGIub24oXCJyZXN1bHRzOm5leHRcIixmdW5jdGlvbigpe3ZhciBhPWQuZ2V0SGlnaGxpZ2h0ZWRSZXN1bHRzKCksYj1kLiRyZXN1bHRzLmZpbmQoXCJbYXJpYS1zZWxlY3RlZF1cIiksYz1iLmluZGV4KGEpLGU9YysxO2lmKCEoZT49Yi5sZW5ndGgpKXt2YXIgZj1iLmVxKGUpO2YudHJpZ2dlcihcIm1vdXNlZW50ZXJcIik7dmFyIGc9ZC4kcmVzdWx0cy5vZmZzZXQoKS50b3ArZC4kcmVzdWx0cy5vdXRlckhlaWdodCghMSksaD1mLm9mZnNldCgpLnRvcCtmLm91dGVySGVpZ2h0KCExKSxpPWQuJHJlc3VsdHMuc2Nyb2xsVG9wKCkraC1nOzA9PT1lP2QuJHJlc3VsdHMuc2Nyb2xsVG9wKDApOmg+ZyYmZC4kcmVzdWx0cy5zY3JvbGxUb3AoaSl9fSksYi5vbihcInJlc3VsdHM6Zm9jdXNcIixmdW5jdGlvbihhKXthLmVsZW1lbnQuYWRkQ2xhc3MoXCJzZWxlY3QyLXJlc3VsdHNfX29wdGlvbi0taGlnaGxpZ2h0ZWRcIil9KSxiLm9uKFwicmVzdWx0czptZXNzYWdlXCIsZnVuY3Rpb24oYSl7ZC5kaXNwbGF5TWVzc2FnZShhKX0pLGEuZm4ubW91c2V3aGVlbCYmdGhpcy4kcmVzdWx0cy5vbihcIm1vdXNld2hlZWxcIixmdW5jdGlvbihhKXt2YXIgYj1kLiRyZXN1bHRzLnNjcm9sbFRvcCgpLGM9ZC4kcmVzdWx0cy5nZXQoMCkuc2Nyb2xsSGVpZ2h0LWIrYS5kZWx0YVksZT1hLmRlbHRhWT4wJiZiLWEuZGVsdGFZPD0wLGY9YS5kZWx0YVk8MCYmYzw9ZC4kcmVzdWx0cy5oZWlnaHQoKTtlPyhkLiRyZXN1bHRzLnNjcm9sbFRvcCgwKSxhLnByZXZlbnREZWZhdWx0KCksYS5zdG9wUHJvcGFnYXRpb24oKSk6ZiYmKGQuJHJlc3VsdHMuc2Nyb2xsVG9wKGQuJHJlc3VsdHMuZ2V0KDApLnNjcm9sbEhlaWdodC1kLiRyZXN1bHRzLmhlaWdodCgpKSxhLnByZXZlbnREZWZhdWx0KCksYS5zdG9wUHJvcGFnYXRpb24oKSl9KSx0aGlzLiRyZXN1bHRzLm9uKFwibW91c2V1cFwiLFwiLnNlbGVjdDItcmVzdWx0c19fb3B0aW9uW2FyaWEtc2VsZWN0ZWRdXCIsZnVuY3Rpb24oYil7dmFyIGM9YSh0aGlzKSxlPWMuZGF0YShcImRhdGFcIik7cmV0dXJuXCJ0cnVlXCI9PT1jLmF0dHIoXCJhcmlhLXNlbGVjdGVkXCIpP3ZvaWQoZC5vcHRpb25zLmdldChcIm11bHRpcGxlXCIpP2QudHJpZ2dlcihcInVuc2VsZWN0XCIse29yaWdpbmFsRXZlbnQ6YixkYXRhOmV9KTpkLnRyaWdnZXIoXCJjbG9zZVwiLHt9KSk6dm9pZCBkLnRyaWdnZXIoXCJzZWxlY3RcIix7b3JpZ2luYWxFdmVudDpiLGRhdGE6ZX0pfSksdGhpcy4kcmVzdWx0cy5vbihcIm1vdXNlZW50ZXJcIixcIi5zZWxlY3QyLXJlc3VsdHNfX29wdGlvblthcmlhLXNlbGVjdGVkXVwiLGZ1bmN0aW9uKGIpe3ZhciBjPWEodGhpcykuZGF0YShcImRhdGFcIik7ZC5nZXRIaWdobGlnaHRlZFJlc3VsdHMoKS5yZW1vdmVDbGFzcyhcInNlbGVjdDItcmVzdWx0c19fb3B0aW9uLS1oaWdobGlnaHRlZFwiKSxkLnRyaWdnZXIoXCJyZXN1bHRzOmZvY3VzXCIse2RhdGE6YyxlbGVtZW50OmEodGhpcyl9KX0pfSxjLnByb3RvdHlwZS5nZXRIaWdobGlnaHRlZFJlc3VsdHM9ZnVuY3Rpb24oKXt2YXIgYT10aGlzLiRyZXN1bHRzLmZpbmQoXCIuc2VsZWN0Mi1yZXN1bHRzX19vcHRpb24tLWhpZ2hsaWdodGVkXCIpO3JldHVybiBhfSxjLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy4kcmVzdWx0cy5yZW1vdmUoKX0sYy5wcm90b3R5cGUuZW5zdXJlSGlnaGxpZ2h0VmlzaWJsZT1mdW5jdGlvbigpe3ZhciBhPXRoaXMuZ2V0SGlnaGxpZ2h0ZWRSZXN1bHRzKCk7aWYoMCE9PWEubGVuZ3RoKXt2YXIgYj10aGlzLiRyZXN1bHRzLmZpbmQoXCJbYXJpYS1zZWxlY3RlZF1cIiksYz1iLmluZGV4KGEpLGQ9dGhpcy4kcmVzdWx0cy5vZmZzZXQoKS50b3AsZT1hLm9mZnNldCgpLnRvcCxmPXRoaXMuJHJlc3VsdHMuc2Nyb2xsVG9wKCkrKGUtZCksZz1lLWQ7Zi09MiphLm91dGVySGVpZ2h0KCExKSwyPj1jP3RoaXMuJHJlc3VsdHMuc2Nyb2xsVG9wKDApOihnPnRoaXMuJHJlc3VsdHMub3V0ZXJIZWlnaHQoKXx8MD5nKSYmdGhpcy4kcmVzdWx0cy5zY3JvbGxUb3AoZil9fSxjLnByb3RvdHlwZS50ZW1wbGF0ZT1mdW5jdGlvbihiLGMpe3ZhciBkPXRoaXMub3B0aW9ucy5nZXQoXCJ0ZW1wbGF0ZVJlc3VsdFwiKSxlPXRoaXMub3B0aW9ucy5nZXQoXCJlc2NhcGVNYXJrdXBcIiksZj1kKGIsYyk7bnVsbD09Zj9jLnN0eWxlLmRpc3BsYXk9XCJub25lXCI6XCJzdHJpbmdcIj09dHlwZW9mIGY/Yy5pbm5lckhUTUw9ZShmKTphKGMpLmFwcGVuZChmKX0sY30pLGIuZGVmaW5lKFwic2VsZWN0Mi9rZXlzXCIsW10sZnVuY3Rpb24oKXt2YXIgYT17QkFDS1NQQUNFOjgsVEFCOjksRU5URVI6MTMsU0hJRlQ6MTYsQ1RSTDoxNyxBTFQ6MTgsRVNDOjI3LFNQQUNFOjMyLFBBR0VfVVA6MzMsUEFHRV9ET1dOOjM0LEVORDozNSxIT01FOjM2LExFRlQ6MzcsVVA6MzgsUklHSFQ6MzksRE9XTjo0MCxERUxFVEU6NDZ9O3JldHVybiBhfSksYi5kZWZpbmUoXCJzZWxlY3QyL3NlbGVjdGlvbi9iYXNlXCIsW1wianF1ZXJ5XCIsXCIuLi91dGlsc1wiLFwiLi4va2V5c1wiXSxmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZChhLGIpe3RoaXMuJGVsZW1lbnQ9YSx0aGlzLm9wdGlvbnM9YixkLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMpfXJldHVybiBiLkV4dGVuZChkLGIuT2JzZXJ2YWJsZSksZC5wcm90b3R5cGUucmVuZGVyPWZ1bmN0aW9uKCl7dmFyIGI9YSgnPHNwYW4gY2xhc3M9XCJzZWxlY3QyLXNlbGVjdGlvblwiIHJvbGU9XCJjb21ib2JveFwiICBhcmlhLWhhc3BvcHVwPVwidHJ1ZVwiIGFyaWEtZXhwYW5kZWQ9XCJmYWxzZVwiPjwvc3Bhbj4nKTtyZXR1cm4gdGhpcy5fdGFiaW5kZXg9MCxudWxsIT10aGlzLiRlbGVtZW50LmRhdGEoXCJvbGQtdGFiaW5kZXhcIik/dGhpcy5fdGFiaW5kZXg9dGhpcy4kZWxlbWVudC5kYXRhKFwib2xkLXRhYmluZGV4XCIpOm51bGwhPXRoaXMuJGVsZW1lbnQuYXR0cihcInRhYmluZGV4XCIpJiYodGhpcy5fdGFiaW5kZXg9dGhpcy4kZWxlbWVudC5hdHRyKFwidGFiaW5kZXhcIikpLGIuYXR0cihcInRpdGxlXCIsdGhpcy4kZWxlbWVudC5hdHRyKFwidGl0bGVcIikpLGIuYXR0cihcInRhYmluZGV4XCIsdGhpcy5fdGFiaW5kZXgpLHRoaXMuJHNlbGVjdGlvbj1iLGJ9LGQucHJvdG90eXBlLmJpbmQ9ZnVuY3Rpb24oYSxiKXt2YXIgZD10aGlzLGU9KGEuaWQrXCItY29udGFpbmVyXCIsYS5pZCtcIi1yZXN1bHRzXCIpO3RoaXMuY29udGFpbmVyPWEsdGhpcy4kc2VsZWN0aW9uLm9uKFwiZm9jdXNcIixmdW5jdGlvbihhKXtkLnRyaWdnZXIoXCJmb2N1c1wiLGEpfSksdGhpcy4kc2VsZWN0aW9uLm9uKFwiYmx1clwiLGZ1bmN0aW9uKGEpe2QuX2hhbmRsZUJsdXIoYSl9KSx0aGlzLiRzZWxlY3Rpb24ub24oXCJrZXlkb3duXCIsZnVuY3Rpb24oYSl7ZC50cmlnZ2VyKFwia2V5cHJlc3NcIixhKSxhLndoaWNoPT09Yy5TUEFDRSYmYS5wcmV2ZW50RGVmYXVsdCgpfSksYS5vbihcInJlc3VsdHM6Zm9jdXNcIixmdW5jdGlvbihhKXtkLiRzZWxlY3Rpb24uYXR0cihcImFyaWEtYWN0aXZlZGVzY2VuZGFudFwiLGEuZGF0YS5fcmVzdWx0SWQpfSksYS5vbihcInNlbGVjdGlvbjp1cGRhdGVcIixmdW5jdGlvbihhKXtkLnVwZGF0ZShhLmRhdGEpfSksYS5vbihcIm9wZW5cIixmdW5jdGlvbigpe2QuJHNlbGVjdGlvbi5hdHRyKFwiYXJpYS1leHBhbmRlZFwiLFwidHJ1ZVwiKSxkLiRzZWxlY3Rpb24uYXR0cihcImFyaWEtb3duc1wiLGUpLGQuX2F0dGFjaENsb3NlSGFuZGxlcihhKX0pLGEub24oXCJjbG9zZVwiLGZ1bmN0aW9uKCl7ZC4kc2VsZWN0aW9uLmF0dHIoXCJhcmlhLWV4cGFuZGVkXCIsXCJmYWxzZVwiKSxkLiRzZWxlY3Rpb24ucmVtb3ZlQXR0cihcImFyaWEtYWN0aXZlZGVzY2VuZGFudFwiKSxkLiRzZWxlY3Rpb24ucmVtb3ZlQXR0cihcImFyaWEtb3duc1wiKSxkLiRzZWxlY3Rpb24uZm9jdXMoKSxkLl9kZXRhY2hDbG9zZUhhbmRsZXIoYSl9KSxhLm9uKFwiZW5hYmxlXCIsZnVuY3Rpb24oKXtkLiRzZWxlY3Rpb24uYXR0cihcInRhYmluZGV4XCIsZC5fdGFiaW5kZXgpfSksYS5vbihcImRpc2FibGVcIixmdW5jdGlvbigpe2QuJHNlbGVjdGlvbi5hdHRyKFwidGFiaW5kZXhcIixcIi0xXCIpfSl9LGQucHJvdG90eXBlLl9oYW5kbGVCbHVyPWZ1bmN0aW9uKGIpe3ZhciBjPXRoaXM7d2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKXtkb2N1bWVudC5hY3RpdmVFbGVtZW50PT1jLiRzZWxlY3Rpb25bMF18fGEuY29udGFpbnMoYy4kc2VsZWN0aW9uWzBdLGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpfHxjLnRyaWdnZXIoXCJibHVyXCIsYil9LDEpfSxkLnByb3RvdHlwZS5fYXR0YWNoQ2xvc2VIYW5kbGVyPWZ1bmN0aW9uKGIpe2EoZG9jdW1lbnQuYm9keSkub24oXCJtb3VzZWRvd24uc2VsZWN0Mi5cIitiLmlkLGZ1bmN0aW9uKGIpe3ZhciBjPWEoYi50YXJnZXQpLGQ9Yy5jbG9zZXN0KFwiLnNlbGVjdDJcIiksZT1hKFwiLnNlbGVjdDIuc2VsZWN0Mi1jb250YWluZXItLW9wZW5cIik7ZS5lYWNoKGZ1bmN0aW9uKCl7dmFyIGI9YSh0aGlzKTtpZih0aGlzIT1kWzBdKXt2YXIgYz1iLmRhdGEoXCJlbGVtZW50XCIpO2Muc2VsZWN0MihcImNsb3NlXCIpfX0pfSl9LGQucHJvdG90eXBlLl9kZXRhY2hDbG9zZUhhbmRsZXI9ZnVuY3Rpb24oYil7YShkb2N1bWVudC5ib2R5KS5vZmYoXCJtb3VzZWRvd24uc2VsZWN0Mi5cIitiLmlkKX0sZC5wcm90b3R5cGUucG9zaXRpb249ZnVuY3Rpb24oYSxiKXt2YXIgYz1iLmZpbmQoXCIuc2VsZWN0aW9uXCIpO2MuYXBwZW5kKGEpfSxkLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5fZGV0YWNoQ2xvc2VIYW5kbGVyKHRoaXMuY29udGFpbmVyKX0sZC5wcm90b3R5cGUudXBkYXRlPWZ1bmN0aW9uKGEpe3Rocm93IG5ldyBFcnJvcihcIlRoZSBgdXBkYXRlYCBtZXRob2QgbXVzdCBiZSBkZWZpbmVkIGluIGNoaWxkIGNsYXNzZXMuXCIpfSxkfSksYi5kZWZpbmUoXCJzZWxlY3QyL3NlbGVjdGlvbi9zaW5nbGVcIixbXCJqcXVlcnlcIixcIi4vYmFzZVwiLFwiLi4vdXRpbHNcIixcIi4uL2tleXNcIl0sZnVuY3Rpb24oYSxiLGMsZCl7ZnVuY3Rpb24gZSgpe2UuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsYXJndW1lbnRzKX1yZXR1cm4gYy5FeHRlbmQoZSxiKSxlLnByb3RvdHlwZS5yZW5kZXI9ZnVuY3Rpb24oKXt2YXIgYT1lLl9fc3VwZXJfXy5yZW5kZXIuY2FsbCh0aGlzKTtyZXR1cm4gYS5hZGRDbGFzcyhcInNlbGVjdDItc2VsZWN0aW9uLS1zaW5nbGVcIiksYS5odG1sKCc8c3BhbiBjbGFzcz1cInNlbGVjdDItc2VsZWN0aW9uX19yZW5kZXJlZFwiPjwvc3Bhbj48c3BhbiBjbGFzcz1cInNlbGVjdDItc2VsZWN0aW9uX19hcnJvd1wiIHJvbGU9XCJwcmVzZW50YXRpb25cIj48YiByb2xlPVwicHJlc2VudGF0aW9uXCI+PC9iPjwvc3Bhbj4nKSxhfSxlLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcztlLl9fc3VwZXJfXy5iaW5kLmFwcGx5KHRoaXMsYXJndW1lbnRzKTt2YXIgZD1hLmlkK1wiLWNvbnRhaW5lclwiO3RoaXMuJHNlbGVjdGlvbi5maW5kKFwiLnNlbGVjdDItc2VsZWN0aW9uX19yZW5kZXJlZFwiKS5hdHRyKFwiaWRcIixkKSx0aGlzLiRzZWxlY3Rpb24uYXR0cihcImFyaWEtbGFiZWxsZWRieVwiLGQpLHRoaXMuJHNlbGVjdGlvbi5vbihcIm1vdXNlZG93blwiLGZ1bmN0aW9uKGEpezE9PT1hLndoaWNoJiZjLnRyaWdnZXIoXCJ0b2dnbGVcIix7b3JpZ2luYWxFdmVudDphfSl9KSx0aGlzLiRzZWxlY3Rpb24ub24oXCJmb2N1c1wiLGZ1bmN0aW9uKGEpe30pLHRoaXMuJHNlbGVjdGlvbi5vbihcImJsdXJcIixmdW5jdGlvbihhKXt9KSxhLm9uKFwiZm9jdXNcIixmdW5jdGlvbihiKXthLmlzT3BlbigpfHxjLiRzZWxlY3Rpb24uZm9jdXMoKX0pLGEub24oXCJzZWxlY3Rpb246dXBkYXRlXCIsZnVuY3Rpb24oYSl7Yy51cGRhdGUoYS5kYXRhKX0pfSxlLnByb3RvdHlwZS5jbGVhcj1mdW5jdGlvbigpe3RoaXMuJHNlbGVjdGlvbi5maW5kKFwiLnNlbGVjdDItc2VsZWN0aW9uX19yZW5kZXJlZFwiKS5lbXB0eSgpfSxlLnByb3RvdHlwZS5kaXNwbGF5PWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcy5vcHRpb25zLmdldChcInRlbXBsYXRlU2VsZWN0aW9uXCIpLGQ9dGhpcy5vcHRpb25zLmdldChcImVzY2FwZU1hcmt1cFwiKTtyZXR1cm4gZChjKGEsYikpfSxlLnByb3RvdHlwZS5zZWxlY3Rpb25Db250YWluZXI9ZnVuY3Rpb24oKXtyZXR1cm4gYShcIjxzcGFuPjwvc3Bhbj5cIil9LGUucHJvdG90eXBlLnVwZGF0ZT1mdW5jdGlvbihhKXtpZigwPT09YS5sZW5ndGgpcmV0dXJuIHZvaWQgdGhpcy5jbGVhcigpO3ZhciBiPWFbMF0sYz10aGlzLiRzZWxlY3Rpb24uZmluZChcIi5zZWxlY3QyLXNlbGVjdGlvbl9fcmVuZGVyZWRcIiksZD10aGlzLmRpc3BsYXkoYixjKTtjLmVtcHR5KCkuYXBwZW5kKGQpLGMucHJvcChcInRpdGxlXCIsYi50aXRsZXx8Yi50ZXh0KX0sZX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9zZWxlY3Rpb24vbXVsdGlwbGVcIixbXCJqcXVlcnlcIixcIi4vYmFzZVwiLFwiLi4vdXRpbHNcIl0sZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQoYSxiKXtkLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLGFyZ3VtZW50cyl9cmV0dXJuIGMuRXh0ZW5kKGQsYiksZC5wcm90b3R5cGUucmVuZGVyPWZ1bmN0aW9uKCl7dmFyIGE9ZC5fX3N1cGVyX18ucmVuZGVyLmNhbGwodGhpcyk7cmV0dXJuIGEuYWRkQ2xhc3MoXCJzZWxlY3QyLXNlbGVjdGlvbi0tbXVsdGlwbGVcIiksYS5odG1sKCc8dWwgY2xhc3M9XCJzZWxlY3QyLXNlbGVjdGlvbl9fcmVuZGVyZWRcIj48L3VsPicpLGF9LGQucHJvdG90eXBlLmJpbmQ9ZnVuY3Rpb24oYixjKXt2YXIgZT10aGlzO2QuX19zdXBlcl9fLmJpbmQuYXBwbHkodGhpcyxhcmd1bWVudHMpLHRoaXMuJHNlbGVjdGlvbi5vbihcImNsaWNrXCIsZnVuY3Rpb24oYSl7ZS50cmlnZ2VyKFwidG9nZ2xlXCIse29yaWdpbmFsRXZlbnQ6YX0pfSksdGhpcy4kc2VsZWN0aW9uLm9uKFwiY2xpY2tcIixcIi5zZWxlY3QyLXNlbGVjdGlvbl9fY2hvaWNlX19yZW1vdmVcIixmdW5jdGlvbihiKXtpZighZS5vcHRpb25zLmdldChcImRpc2FibGVkXCIpKXt2YXIgYz1hKHRoaXMpLGQ9Yy5wYXJlbnQoKSxmPWQuZGF0YShcImRhdGFcIik7ZS50cmlnZ2VyKFwidW5zZWxlY3RcIix7b3JpZ2luYWxFdmVudDpiLGRhdGE6Zn0pfX0pfSxkLnByb3RvdHlwZS5jbGVhcj1mdW5jdGlvbigpe3RoaXMuJHNlbGVjdGlvbi5maW5kKFwiLnNlbGVjdDItc2VsZWN0aW9uX19yZW5kZXJlZFwiKS5lbXB0eSgpfSxkLnByb3RvdHlwZS5kaXNwbGF5PWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcy5vcHRpb25zLmdldChcInRlbXBsYXRlU2VsZWN0aW9uXCIpLGQ9dGhpcy5vcHRpb25zLmdldChcImVzY2FwZU1hcmt1cFwiKTtyZXR1cm4gZChjKGEsYikpfSxkLnByb3RvdHlwZS5zZWxlY3Rpb25Db250YWluZXI9ZnVuY3Rpb24oKXt2YXIgYj1hKCc8bGkgY2xhc3M9XCJzZWxlY3QyLXNlbGVjdGlvbl9fY2hvaWNlXCI+PHNwYW4gY2xhc3M9XCJzZWxlY3QyLXNlbGVjdGlvbl9fY2hvaWNlX19yZW1vdmVcIiByb2xlPVwicHJlc2VudGF0aW9uXCI+JnRpbWVzOzwvc3Bhbj48L2xpPicpO3JldHVybiBifSxkLnByb3RvdHlwZS51cGRhdGU9ZnVuY3Rpb24oYSl7aWYodGhpcy5jbGVhcigpLDAhPT1hLmxlbmd0aCl7Zm9yKHZhciBiPVtdLGQ9MDtkPGEubGVuZ3RoO2QrKyl7dmFyIGU9YVtkXSxmPXRoaXMuc2VsZWN0aW9uQ29udGFpbmVyKCksZz10aGlzLmRpc3BsYXkoZSxmKTtmLmFwcGVuZChnKSxmLnByb3AoXCJ0aXRsZVwiLGUudGl0bGV8fGUudGV4dCksZi5kYXRhKFwiZGF0YVwiLGUpLGIucHVzaChmKX12YXIgaD10aGlzLiRzZWxlY3Rpb24uZmluZChcIi5zZWxlY3QyLXNlbGVjdGlvbl9fcmVuZGVyZWRcIik7Yy5hcHBlbmRNYW55KGgsYil9fSxkfSksYi5kZWZpbmUoXCJzZWxlY3QyL3NlbGVjdGlvbi9wbGFjZWhvbGRlclwiLFtcIi4uL3V0aWxzXCJdLGZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoYSxiLGMpe3RoaXMucGxhY2Vob2xkZXI9dGhpcy5ub3JtYWxpemVQbGFjZWhvbGRlcihjLmdldChcInBsYWNlaG9sZGVyXCIpKSxhLmNhbGwodGhpcyxiLGMpfXJldHVybiBiLnByb3RvdHlwZS5ub3JtYWxpemVQbGFjZWhvbGRlcj1mdW5jdGlvbihhLGIpe3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiBiJiYoYj17aWQ6XCJcIix0ZXh0OmJ9KSxifSxiLnByb3RvdHlwZS5jcmVhdGVQbGFjZWhvbGRlcj1mdW5jdGlvbihhLGIpe3ZhciBjPXRoaXMuc2VsZWN0aW9uQ29udGFpbmVyKCk7cmV0dXJuIGMuaHRtbCh0aGlzLmRpc3BsYXkoYikpLGMuYWRkQ2xhc3MoXCJzZWxlY3QyLXNlbGVjdGlvbl9fcGxhY2Vob2xkZXJcIikucmVtb3ZlQ2xhc3MoXCJzZWxlY3QyLXNlbGVjdGlvbl9fY2hvaWNlXCIpLGN9LGIucHJvdG90eXBlLnVwZGF0ZT1mdW5jdGlvbihhLGIpe3ZhciBjPTE9PWIubGVuZ3RoJiZiWzBdLmlkIT10aGlzLnBsYWNlaG9sZGVyLmlkLGQ9Yi5sZW5ndGg+MTtpZihkfHxjKXJldHVybiBhLmNhbGwodGhpcyxiKTt0aGlzLmNsZWFyKCk7dmFyIGU9dGhpcy5jcmVhdGVQbGFjZWhvbGRlcih0aGlzLnBsYWNlaG9sZGVyKTt0aGlzLiRzZWxlY3Rpb24uZmluZChcIi5zZWxlY3QyLXNlbGVjdGlvbl9fcmVuZGVyZWRcIikuYXBwZW5kKGUpfSxifSksYi5kZWZpbmUoXCJzZWxlY3QyL3NlbGVjdGlvbi9hbGxvd0NsZWFyXCIsW1wianF1ZXJ5XCIsXCIuLi9rZXlzXCJdLGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYygpe31yZXR1cm4gYy5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihhLGIsYyl7dmFyIGQ9dGhpczthLmNhbGwodGhpcyxiLGMpLG51bGw9PXRoaXMucGxhY2Vob2xkZXImJnRoaXMub3B0aW9ucy5nZXQoXCJkZWJ1Z1wiKSYmd2luZG93LmNvbnNvbGUmJmNvbnNvbGUuZXJyb3ImJmNvbnNvbGUuZXJyb3IoXCJTZWxlY3QyOiBUaGUgYGFsbG93Q2xlYXJgIG9wdGlvbiBzaG91bGQgYmUgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIHRoZSBgcGxhY2Vob2xkZXJgIG9wdGlvbi5cIiksdGhpcy4kc2VsZWN0aW9uLm9uKFwibW91c2Vkb3duXCIsXCIuc2VsZWN0Mi1zZWxlY3Rpb25fX2NsZWFyXCIsZnVuY3Rpb24oYSl7ZC5faGFuZGxlQ2xlYXIoYSl9KSxiLm9uKFwia2V5cHJlc3NcIixmdW5jdGlvbihhKXtkLl9oYW5kbGVLZXlib2FyZENsZWFyKGEsYil9KX0sYy5wcm90b3R5cGUuX2hhbmRsZUNsZWFyPWZ1bmN0aW9uKGEsYil7aWYoIXRoaXMub3B0aW9ucy5nZXQoXCJkaXNhYmxlZFwiKSl7dmFyIGM9dGhpcy4kc2VsZWN0aW9uLmZpbmQoXCIuc2VsZWN0Mi1zZWxlY3Rpb25fX2NsZWFyXCIpO2lmKDAhPT1jLmxlbmd0aCl7Yi5zdG9wUHJvcGFnYXRpb24oKTtmb3IodmFyIGQ9Yy5kYXRhKFwiZGF0YVwiKSxlPTA7ZTxkLmxlbmd0aDtlKyspe3ZhciBmPXtkYXRhOmRbZV19O2lmKHRoaXMudHJpZ2dlcihcInVuc2VsZWN0XCIsZiksZi5wcmV2ZW50ZWQpcmV0dXJufXRoaXMuJGVsZW1lbnQudmFsKHRoaXMucGxhY2Vob2xkZXIuaWQpLnRyaWdnZXIoXCJjaGFuZ2VcIiksdGhpcy50cmlnZ2VyKFwidG9nZ2xlXCIse30pfX19LGMucHJvdG90eXBlLl9oYW5kbGVLZXlib2FyZENsZWFyPWZ1bmN0aW9uKGEsYyxkKXtkLmlzT3BlbigpfHwoYy53aGljaD09Yi5ERUxFVEV8fGMud2hpY2g9PWIuQkFDS1NQQUNFKSYmdGhpcy5faGFuZGxlQ2xlYXIoYyl9LGMucHJvdG90eXBlLnVwZGF0ZT1mdW5jdGlvbihiLGMpe2lmKGIuY2FsbCh0aGlzLGMpLCEodGhpcy4kc2VsZWN0aW9uLmZpbmQoXCIuc2VsZWN0Mi1zZWxlY3Rpb25fX3BsYWNlaG9sZGVyXCIpLmxlbmd0aD4wfHwwPT09Yy5sZW5ndGgpKXt2YXIgZD1hKCc8c3BhbiBjbGFzcz1cInNlbGVjdDItc2VsZWN0aW9uX19jbGVhclwiPiZ0aW1lczs8L3NwYW4+Jyk7ZC5kYXRhKFwiZGF0YVwiLGMpLHRoaXMuJHNlbGVjdGlvbi5maW5kKFwiLnNlbGVjdDItc2VsZWN0aW9uX19yZW5kZXJlZFwiKS5wcmVwZW5kKGQpfX0sY30pLGIuZGVmaW5lKFwic2VsZWN0Mi9zZWxlY3Rpb24vc2VhcmNoXCIsW1wianF1ZXJ5XCIsXCIuLi91dGlsc1wiLFwiLi4va2V5c1wiXSxmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZChhLGIsYyl7YS5jYWxsKHRoaXMsYixjKX1yZXR1cm4gZC5wcm90b3R5cGUucmVuZGVyPWZ1bmN0aW9uKGIpe3ZhciBjPWEoJzxsaSBjbGFzcz1cInNlbGVjdDItc2VhcmNoIHNlbGVjdDItc2VhcmNoLS1pbmxpbmVcIj48aW5wdXQgY2xhc3M9XCJzZWxlY3QyLXNlYXJjaF9fZmllbGRcIiB0eXBlPVwic2VhcmNoXCIgdGFiaW5kZXg9XCItMVwiIGF1dG9jb21wbGV0ZT1cIm9mZlwiIGF1dG9jb3JyZWN0PVwib2ZmXCIgYXV0b2NhcGl0YWxpemU9XCJvZmZcIiBzcGVsbGNoZWNrPVwiZmFsc2VcIiByb2xlPVwidGV4dGJveFwiIGFyaWEtYXV0b2NvbXBsZXRlPVwibGlzdFwiIC8+PC9saT4nKTt0aGlzLiRzZWFyY2hDb250YWluZXI9Yyx0aGlzLiRzZWFyY2g9Yy5maW5kKFwiaW5wdXRcIik7dmFyIGQ9Yi5jYWxsKHRoaXMpO3JldHVybiB0aGlzLl90cmFuc2ZlclRhYkluZGV4KCksZH0sZC5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihhLGIsZCl7dmFyIGU9dGhpczthLmNhbGwodGhpcyxiLGQpLGIub24oXCJvcGVuXCIsZnVuY3Rpb24oKXtlLiRzZWFyY2gudHJpZ2dlcihcImZvY3VzXCIpfSksYi5vbihcImNsb3NlXCIsZnVuY3Rpb24oKXtlLiRzZWFyY2gudmFsKFwiXCIpLGUuJHNlYXJjaC5yZW1vdmVBdHRyKFwiYXJpYS1hY3RpdmVkZXNjZW5kYW50XCIpLGUuJHNlYXJjaC50cmlnZ2VyKFwiZm9jdXNcIil9KSxiLm9uKFwiZW5hYmxlXCIsZnVuY3Rpb24oKXtlLiRzZWFyY2gucHJvcChcImRpc2FibGVkXCIsITEpLGUuX3RyYW5zZmVyVGFiSW5kZXgoKX0pLGIub24oXCJkaXNhYmxlXCIsZnVuY3Rpb24oKXtlLiRzZWFyY2gucHJvcChcImRpc2FibGVkXCIsITApfSksYi5vbihcImZvY3VzXCIsZnVuY3Rpb24oYSl7ZS4kc2VhcmNoLnRyaWdnZXIoXCJmb2N1c1wiKX0pLGIub24oXCJyZXN1bHRzOmZvY3VzXCIsZnVuY3Rpb24oYSl7ZS4kc2VhcmNoLmF0dHIoXCJhcmlhLWFjdGl2ZWRlc2NlbmRhbnRcIixhLmlkKX0pLHRoaXMuJHNlbGVjdGlvbi5vbihcImZvY3VzaW5cIixcIi5zZWxlY3QyLXNlYXJjaC0taW5saW5lXCIsZnVuY3Rpb24oYSl7ZS50cmlnZ2VyKFwiZm9jdXNcIixhKX0pLHRoaXMuJHNlbGVjdGlvbi5vbihcImZvY3Vzb3V0XCIsXCIuc2VsZWN0Mi1zZWFyY2gtLWlubGluZVwiLGZ1bmN0aW9uKGEpe2UuX2hhbmRsZUJsdXIoYSl9KSx0aGlzLiRzZWxlY3Rpb24ub24oXCJrZXlkb3duXCIsXCIuc2VsZWN0Mi1zZWFyY2gtLWlubGluZVwiLGZ1bmN0aW9uKGEpe2Euc3RvcFByb3BhZ2F0aW9uKCksZS50cmlnZ2VyKFwia2V5cHJlc3NcIixhKSxlLl9rZXlVcFByZXZlbnRlZD1hLmlzRGVmYXVsdFByZXZlbnRlZCgpO3ZhciBiPWEud2hpY2g7aWYoYj09PWMuQkFDS1NQQUNFJiZcIlwiPT09ZS4kc2VhcmNoLnZhbCgpKXt2YXIgZD1lLiRzZWFyY2hDb250YWluZXIucHJldihcIi5zZWxlY3QyLXNlbGVjdGlvbl9fY2hvaWNlXCIpO2lmKGQubGVuZ3RoPjApe3ZhciBmPWQuZGF0YShcImRhdGFcIik7ZS5zZWFyY2hSZW1vdmVDaG9pY2UoZiksYS5wcmV2ZW50RGVmYXVsdCgpfX19KTt2YXIgZj1kb2N1bWVudC5kb2N1bWVudE1vZGUsZz1mJiYxMT49Zjt0aGlzLiRzZWxlY3Rpb24ub24oXCJpbnB1dC5zZWFyY2hjaGVja1wiLFwiLnNlbGVjdDItc2VhcmNoLS1pbmxpbmVcIixmdW5jdGlvbihhKXtyZXR1cm4gZz92b2lkIGUuJHNlbGVjdGlvbi5vZmYoXCJpbnB1dC5zZWFyY2ggaW5wdXQuc2VhcmNoY2hlY2tcIik6dm9pZCBlLiRzZWxlY3Rpb24ub2ZmKFwia2V5dXAuc2VhcmNoXCIpfSksdGhpcy4kc2VsZWN0aW9uLm9uKFwia2V5dXAuc2VhcmNoIGlucHV0LnNlYXJjaFwiLFwiLnNlbGVjdDItc2VhcmNoLS1pbmxpbmVcIixmdW5jdGlvbihhKXtpZihnJiZcImlucHV0XCI9PT1hLnR5cGUpcmV0dXJuIHZvaWQgZS4kc2VsZWN0aW9uLm9mZihcImlucHV0LnNlYXJjaCBpbnB1dC5zZWFyY2hjaGVja1wiKTt2YXIgYj1hLndoaWNoO2IhPWMuU0hJRlQmJmIhPWMuQ1RSTCYmYiE9Yy5BTFQmJmIhPWMuVEFCJiZlLmhhbmRsZVNlYXJjaChhKX0pfSxkLnByb3RvdHlwZS5fdHJhbnNmZXJUYWJJbmRleD1mdW5jdGlvbihhKXt0aGlzLiRzZWFyY2guYXR0cihcInRhYmluZGV4XCIsdGhpcy4kc2VsZWN0aW9uLmF0dHIoXCJ0YWJpbmRleFwiKSksdGhpcy4kc2VsZWN0aW9uLmF0dHIoXCJ0YWJpbmRleFwiLFwiLTFcIil9LGQucHJvdG90eXBlLmNyZWF0ZVBsYWNlaG9sZGVyPWZ1bmN0aW9uKGEsYil7dGhpcy4kc2VhcmNoLmF0dHIoXCJwbGFjZWhvbGRlclwiLGIudGV4dCl9LGQucHJvdG90eXBlLnVwZGF0ZT1mdW5jdGlvbihhLGIpe3ZhciBjPXRoaXMuJHNlYXJjaFswXT09ZG9jdW1lbnQuYWN0aXZlRWxlbWVudDt0aGlzLiRzZWFyY2guYXR0cihcInBsYWNlaG9sZGVyXCIsXCJcIiksYS5jYWxsKHRoaXMsYiksdGhpcy4kc2VsZWN0aW9uLmZpbmQoXCIuc2VsZWN0Mi1zZWxlY3Rpb25fX3JlbmRlcmVkXCIpLmFwcGVuZCh0aGlzLiRzZWFyY2hDb250YWluZXIpLHRoaXMucmVzaXplU2VhcmNoKCksYyYmdGhpcy4kc2VhcmNoLmZvY3VzKCl9LGQucHJvdG90eXBlLmhhbmRsZVNlYXJjaD1mdW5jdGlvbigpe2lmKHRoaXMucmVzaXplU2VhcmNoKCksIXRoaXMuX2tleVVwUHJldmVudGVkKXt2YXIgYT10aGlzLiRzZWFyY2gudmFsKCk7dGhpcy50cmlnZ2VyKFwicXVlcnlcIix7dGVybTphfSl9dGhpcy5fa2V5VXBQcmV2ZW50ZWQ9ITF9LGQucHJvdG90eXBlLnNlYXJjaFJlbW92ZUNob2ljZT1mdW5jdGlvbihhLGIpe3RoaXMudHJpZ2dlcihcInVuc2VsZWN0XCIse2RhdGE6Yn0pLHRoaXMuJHNlYXJjaC52YWwoYi50ZXh0KSx0aGlzLmhhbmRsZVNlYXJjaCgpfSxkLnByb3RvdHlwZS5yZXNpemVTZWFyY2g9ZnVuY3Rpb24oKXt0aGlzLiRzZWFyY2guY3NzKFwid2lkdGhcIixcIjI1cHhcIik7dmFyIGE9XCJcIjtpZihcIlwiIT09dGhpcy4kc2VhcmNoLmF0dHIoXCJwbGFjZWhvbGRlclwiKSlhPXRoaXMuJHNlbGVjdGlvbi5maW5kKFwiLnNlbGVjdDItc2VsZWN0aW9uX19yZW5kZXJlZFwiKS5pbm5lcldpZHRoKCk7ZWxzZXt2YXIgYj10aGlzLiRzZWFyY2gudmFsKCkubGVuZ3RoKzE7YT0uNzUqYitcImVtXCJ9dGhpcy4kc2VhcmNoLmNzcyhcIndpZHRoXCIsYSl9LGR9KSxiLmRlZmluZShcInNlbGVjdDIvc2VsZWN0aW9uL2V2ZW50UmVsYXlcIixbXCJqcXVlcnlcIl0sZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYigpe31yZXR1cm4gYi5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihiLGMsZCl7dmFyIGU9dGhpcyxmPVtcIm9wZW5cIixcIm9wZW5pbmdcIixcImNsb3NlXCIsXCJjbG9zaW5nXCIsXCJzZWxlY3RcIixcInNlbGVjdGluZ1wiLFwidW5zZWxlY3RcIixcInVuc2VsZWN0aW5nXCJdLGc9W1wib3BlbmluZ1wiLFwiY2xvc2luZ1wiLFwic2VsZWN0aW5nXCIsXCJ1bnNlbGVjdGluZ1wiXTtiLmNhbGwodGhpcyxjLGQpLGMub24oXCIqXCIsZnVuY3Rpb24oYixjKXtpZigtMSE9PWEuaW5BcnJheShiLGYpKXtjPWN8fHt9O3ZhciBkPWEuRXZlbnQoXCJzZWxlY3QyOlwiK2Ise3BhcmFtczpjfSk7ZS4kZWxlbWVudC50cmlnZ2VyKGQpLC0xIT09YS5pbkFycmF5KGIsZykmJihjLnByZXZlbnRlZD1kLmlzRGVmYXVsdFByZXZlbnRlZCgpKX19KX0sYn0pLGIuZGVmaW5lKFwic2VsZWN0Mi90cmFuc2xhdGlvblwiLFtcImpxdWVyeVwiLFwicmVxdWlyZVwiXSxmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYSl7dGhpcy5kaWN0PWF8fHt9fXJldHVybiBjLnByb3RvdHlwZS5hbGw9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5kaWN0fSxjLnByb3RvdHlwZS5nZXQ9ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuZGljdFthXX0sYy5wcm90b3R5cGUuZXh0ZW5kPWZ1bmN0aW9uKGIpe3RoaXMuZGljdD1hLmV4dGVuZCh7fSxiLmFsbCgpLHRoaXMuZGljdCl9LGMuX2NhY2hlPXt9LGMubG9hZFBhdGg9ZnVuY3Rpb24oYSl7aWYoIShhIGluIGMuX2NhY2hlKSl7dmFyIGQ9YihhKTtjLl9jYWNoZVthXT1kfXJldHVybiBuZXcgYyhjLl9jYWNoZVthXSl9LGN9KSxiLmRlZmluZShcInNlbGVjdDIvZGlhY3JpdGljc1wiLFtdLGZ1bmN0aW9uKCl7dmFyIGE9e1wi4pK2XCI6XCJBXCIsXCLvvKFcIjpcIkFcIixcIsOAXCI6XCJBXCIsXCLDgVwiOlwiQVwiLFwiw4JcIjpcIkFcIixcIuG6plwiOlwiQVwiLFwi4bqkXCI6XCJBXCIsXCLhuqpcIjpcIkFcIixcIuG6qFwiOlwiQVwiLFwiw4NcIjpcIkFcIixcIsSAXCI6XCJBXCIsXCLEglwiOlwiQVwiLFwi4bqwXCI6XCJBXCIsXCLhuq5cIjpcIkFcIixcIuG6tFwiOlwiQVwiLFwi4bqyXCI6XCJBXCIsXCLIplwiOlwiQVwiLFwix6BcIjpcIkFcIixcIsOEXCI6XCJBXCIsXCLHnlwiOlwiQVwiLFwi4bqiXCI6XCJBXCIsXCLDhVwiOlwiQVwiLFwix7pcIjpcIkFcIixcIseNXCI6XCJBXCIsXCLIgFwiOlwiQVwiLFwiyIJcIjpcIkFcIixcIuG6oFwiOlwiQVwiLFwi4bqsXCI6XCJBXCIsXCLhurZcIjpcIkFcIixcIuG4gFwiOlwiQVwiLFwixIRcIjpcIkFcIixcIsi6XCI6XCJBXCIsXCLisa9cIjpcIkFcIixcIuqcslwiOlwiQUFcIixcIsOGXCI6XCJBRVwiLFwix7xcIjpcIkFFXCIsXCLHolwiOlwiQUVcIixcIuqctFwiOlwiQU9cIixcIuqctlwiOlwiQVVcIixcIuqcuFwiOlwiQVZcIixcIuqculwiOlwiQVZcIixcIuqcvFwiOlwiQVlcIixcIuKSt1wiOlwiQlwiLFwi77yiXCI6XCJCXCIsXCLhuIJcIjpcIkJcIixcIuG4hFwiOlwiQlwiLFwi4biGXCI6XCJCXCIsXCLJg1wiOlwiQlwiLFwixoJcIjpcIkJcIixcIsaBXCI6XCJCXCIsXCLikrhcIjpcIkNcIixcIu+8o1wiOlwiQ1wiLFwixIZcIjpcIkNcIixcIsSIXCI6XCJDXCIsXCLEilwiOlwiQ1wiLFwixIxcIjpcIkNcIixcIsOHXCI6XCJDXCIsXCLhuIhcIjpcIkNcIixcIsaHXCI6XCJDXCIsXCLIu1wiOlwiQ1wiLFwi6py+XCI6XCJDXCIsXCLikrlcIjpcIkRcIixcIu+8pFwiOlwiRFwiLFwi4biKXCI6XCJEXCIsXCLEjlwiOlwiRFwiLFwi4biMXCI6XCJEXCIsXCLhuJBcIjpcIkRcIixcIuG4klwiOlwiRFwiLFwi4biOXCI6XCJEXCIsXCLEkFwiOlwiRFwiLFwixotcIjpcIkRcIixcIsaKXCI6XCJEXCIsXCLGiVwiOlwiRFwiLFwi6p25XCI6XCJEXCIsXCLHsVwiOlwiRFpcIixcIseEXCI6XCJEWlwiLFwix7JcIjpcIkR6XCIsXCLHhVwiOlwiRHpcIixcIuKSulwiOlwiRVwiLFwi77ylXCI6XCJFXCIsXCLDiFwiOlwiRVwiLFwiw4lcIjpcIkVcIixcIsOKXCI6XCJFXCIsXCLhu4BcIjpcIkVcIixcIuG6vlwiOlwiRVwiLFwi4buEXCI6XCJFXCIsXCLhu4JcIjpcIkVcIixcIuG6vFwiOlwiRVwiLFwixJJcIjpcIkVcIixcIuG4lFwiOlwiRVwiLFwi4biWXCI6XCJFXCIsXCLElFwiOlwiRVwiLFwixJZcIjpcIkVcIixcIsOLXCI6XCJFXCIsXCLhurpcIjpcIkVcIixcIsSaXCI6XCJFXCIsXCLIhFwiOlwiRVwiLFwiyIZcIjpcIkVcIixcIuG6uFwiOlwiRVwiLFwi4buGXCI6XCJFXCIsXCLIqFwiOlwiRVwiLFwi4bicXCI6XCJFXCIsXCLEmFwiOlwiRVwiLFwi4biYXCI6XCJFXCIsXCLhuJpcIjpcIkVcIixcIsaQXCI6XCJFXCIsXCLGjlwiOlwiRVwiLFwi4pK7XCI6XCJGXCIsXCLvvKZcIjpcIkZcIixcIuG4nlwiOlwiRlwiLFwixpFcIjpcIkZcIixcIuqdu1wiOlwiRlwiLFwi4pK8XCI6XCJHXCIsXCLvvKdcIjpcIkdcIixcIse0XCI6XCJHXCIsXCLEnFwiOlwiR1wiLFwi4bigXCI6XCJHXCIsXCLEnlwiOlwiR1wiLFwixKBcIjpcIkdcIixcIsemXCI6XCJHXCIsXCLEolwiOlwiR1wiLFwix6RcIjpcIkdcIixcIsaTXCI6XCJHXCIsXCLqnqBcIjpcIkdcIixcIuqdvVwiOlwiR1wiLFwi6p2+XCI6XCJHXCIsXCLikr1cIjpcIkhcIixcIu+8qFwiOlwiSFwiLFwixKRcIjpcIkhcIixcIuG4olwiOlwiSFwiLFwi4bimXCI6XCJIXCIsXCLInlwiOlwiSFwiLFwi4bikXCI6XCJIXCIsXCLhuKhcIjpcIkhcIixcIuG4qlwiOlwiSFwiLFwixKZcIjpcIkhcIixcIuKxp1wiOlwiSFwiLFwi4rG1XCI6XCJIXCIsXCLqno1cIjpcIkhcIixcIuKSvlwiOlwiSVwiLFwi77ypXCI6XCJJXCIsXCLDjFwiOlwiSVwiLFwiw41cIjpcIklcIixcIsOOXCI6XCJJXCIsXCLEqFwiOlwiSVwiLFwixKpcIjpcIklcIixcIsSsXCI6XCJJXCIsXCLEsFwiOlwiSVwiLFwiw49cIjpcIklcIixcIuG4rlwiOlwiSVwiLFwi4buIXCI6XCJJXCIsXCLHj1wiOlwiSVwiLFwiyIhcIjpcIklcIixcIsiKXCI6XCJJXCIsXCLhu4pcIjpcIklcIixcIsSuXCI6XCJJXCIsXCLhuKxcIjpcIklcIixcIsaXXCI6XCJJXCIsXCLikr9cIjpcIkpcIixcIu+8qlwiOlwiSlwiLFwixLRcIjpcIkpcIixcIsmIXCI6XCJKXCIsXCLik4BcIjpcIktcIixcIu+8q1wiOlwiS1wiLFwi4biwXCI6XCJLXCIsXCLHqFwiOlwiS1wiLFwi4biyXCI6XCJLXCIsXCLEtlwiOlwiS1wiLFwi4bi0XCI6XCJLXCIsXCLGmFwiOlwiS1wiLFwi4rGpXCI6XCJLXCIsXCLqnYBcIjpcIktcIixcIuqdglwiOlwiS1wiLFwi6p2EXCI6XCJLXCIsXCLqnqJcIjpcIktcIixcIuKTgVwiOlwiTFwiLFwi77ysXCI6XCJMXCIsXCLEv1wiOlwiTFwiLFwixLlcIjpcIkxcIixcIsS9XCI6XCJMXCIsXCLhuLZcIjpcIkxcIixcIuG4uFwiOlwiTFwiLFwixLtcIjpcIkxcIixcIuG4vFwiOlwiTFwiLFwi4bi6XCI6XCJMXCIsXCLFgVwiOlwiTFwiLFwiyL1cIjpcIkxcIixcIuKxolwiOlwiTFwiLFwi4rGgXCI6XCJMXCIsXCLqnYhcIjpcIkxcIixcIuqdhlwiOlwiTFwiLFwi6p6AXCI6XCJMXCIsXCLHh1wiOlwiTEpcIixcIseIXCI6XCJMalwiLFwi4pOCXCI6XCJNXCIsXCLvvK1cIjpcIk1cIixcIuG4vlwiOlwiTVwiLFwi4bmAXCI6XCJNXCIsXCLhuYJcIjpcIk1cIixcIuKxrlwiOlwiTVwiLFwixpxcIjpcIk1cIixcIuKTg1wiOlwiTlwiLFwi77yuXCI6XCJOXCIsXCLHuFwiOlwiTlwiLFwixYNcIjpcIk5cIixcIsORXCI6XCJOXCIsXCLhuYRcIjpcIk5cIixcIsWHXCI6XCJOXCIsXCLhuYZcIjpcIk5cIixcIsWFXCI6XCJOXCIsXCLhuYpcIjpcIk5cIixcIuG5iFwiOlwiTlwiLFwiyKBcIjpcIk5cIixcIsadXCI6XCJOXCIsXCLqnpBcIjpcIk5cIixcIuqepFwiOlwiTlwiLFwix4pcIjpcIk5KXCIsXCLHi1wiOlwiTmpcIixcIuKThFwiOlwiT1wiLFwi77yvXCI6XCJPXCIsXCLDklwiOlwiT1wiLFwiw5NcIjpcIk9cIixcIsOUXCI6XCJPXCIsXCLhu5JcIjpcIk9cIixcIuG7kFwiOlwiT1wiLFwi4buWXCI6XCJPXCIsXCLhu5RcIjpcIk9cIixcIsOVXCI6XCJPXCIsXCLhuYxcIjpcIk9cIixcIsisXCI6XCJPXCIsXCLhuY5cIjpcIk9cIixcIsWMXCI6XCJPXCIsXCLhuZBcIjpcIk9cIixcIuG5klwiOlwiT1wiLFwixY5cIjpcIk9cIixcIsiuXCI6XCJPXCIsXCLIsFwiOlwiT1wiLFwiw5ZcIjpcIk9cIixcIsiqXCI6XCJPXCIsXCLhu45cIjpcIk9cIixcIsWQXCI6XCJPXCIsXCLHkVwiOlwiT1wiLFwiyIxcIjpcIk9cIixcIsiOXCI6XCJPXCIsXCLGoFwiOlwiT1wiLFwi4bucXCI6XCJPXCIsXCLhu5pcIjpcIk9cIixcIuG7oFwiOlwiT1wiLFwi4bueXCI6XCJPXCIsXCLhu6JcIjpcIk9cIixcIuG7jFwiOlwiT1wiLFwi4buYXCI6XCJPXCIsXCLHqlwiOlwiT1wiLFwix6xcIjpcIk9cIixcIsOYXCI6XCJPXCIsXCLHvlwiOlwiT1wiLFwixoZcIjpcIk9cIixcIsafXCI6XCJPXCIsXCLqnYpcIjpcIk9cIixcIuqdjFwiOlwiT1wiLFwixqJcIjpcIk9JXCIsXCLqnY5cIjpcIk9PXCIsXCLIolwiOlwiT1VcIixcIuKThVwiOlwiUFwiLFwi77ywXCI6XCJQXCIsXCLhuZRcIjpcIlBcIixcIuG5llwiOlwiUFwiLFwixqRcIjpcIlBcIixcIuKxo1wiOlwiUFwiLFwi6p2QXCI6XCJQXCIsXCLqnZJcIjpcIlBcIixcIuqdlFwiOlwiUFwiLFwi4pOGXCI6XCJRXCIsXCLvvLFcIjpcIlFcIixcIuqdllwiOlwiUVwiLFwi6p2YXCI6XCJRXCIsXCLJilwiOlwiUVwiLFwi4pOHXCI6XCJSXCIsXCLvvLJcIjpcIlJcIixcIsWUXCI6XCJSXCIsXCLhuZhcIjpcIlJcIixcIsWYXCI6XCJSXCIsXCLIkFwiOlwiUlwiLFwiyJJcIjpcIlJcIixcIuG5mlwiOlwiUlwiLFwi4bmcXCI6XCJSXCIsXCLFllwiOlwiUlwiLFwi4bmeXCI6XCJSXCIsXCLJjFwiOlwiUlwiLFwi4rGkXCI6XCJSXCIsXCLqnZpcIjpcIlJcIixcIuqeplwiOlwiUlwiLFwi6p6CXCI6XCJSXCIsXCLik4hcIjpcIlNcIixcIu+8s1wiOlwiU1wiLFwi4bqeXCI6XCJTXCIsXCLFmlwiOlwiU1wiLFwi4bmkXCI6XCJTXCIsXCLFnFwiOlwiU1wiLFwi4bmgXCI6XCJTXCIsXCLFoFwiOlwiU1wiLFwi4bmmXCI6XCJTXCIsXCLhuaJcIjpcIlNcIixcIuG5qFwiOlwiU1wiLFwiyJhcIjpcIlNcIixcIsWeXCI6XCJTXCIsXCLisb5cIjpcIlNcIixcIuqeqFwiOlwiU1wiLFwi6p6EXCI6XCJTXCIsXCLik4lcIjpcIlRcIixcIu+8tFwiOlwiVFwiLFwi4bmqXCI6XCJUXCIsXCLFpFwiOlwiVFwiLFwi4bmsXCI6XCJUXCIsXCLImlwiOlwiVFwiLFwixaJcIjpcIlRcIixcIuG5sFwiOlwiVFwiLFwi4bmuXCI6XCJUXCIsXCLFplwiOlwiVFwiLFwixqxcIjpcIlRcIixcIsauXCI6XCJUXCIsXCLIvlwiOlwiVFwiLFwi6p6GXCI6XCJUXCIsXCLqnKhcIjpcIlRaXCIsXCLik4pcIjpcIlVcIixcIu+8tVwiOlwiVVwiLFwiw5lcIjpcIlVcIixcIsOaXCI6XCJVXCIsXCLDm1wiOlwiVVwiLFwixahcIjpcIlVcIixcIuG5uFwiOlwiVVwiLFwixapcIjpcIlVcIixcIuG5ulwiOlwiVVwiLFwixaxcIjpcIlVcIixcIsOcXCI6XCJVXCIsXCLHm1wiOlwiVVwiLFwix5dcIjpcIlVcIixcIseVXCI6XCJVXCIsXCLHmVwiOlwiVVwiLFwi4bumXCI6XCJVXCIsXCLFrlwiOlwiVVwiLFwixbBcIjpcIlVcIixcIseTXCI6XCJVXCIsXCLIlFwiOlwiVVwiLFwiyJZcIjpcIlVcIixcIsavXCI6XCJVXCIsXCLhu6pcIjpcIlVcIixcIuG7qFwiOlwiVVwiLFwi4buuXCI6XCJVXCIsXCLhu6xcIjpcIlVcIixcIuG7sFwiOlwiVVwiLFwi4bukXCI6XCJVXCIsXCLhubJcIjpcIlVcIixcIsWyXCI6XCJVXCIsXCLhubZcIjpcIlVcIixcIuG5tFwiOlwiVVwiLFwiyYRcIjpcIlVcIixcIuKTi1wiOlwiVlwiLFwi77y2XCI6XCJWXCIsXCLhubxcIjpcIlZcIixcIuG5vlwiOlwiVlwiLFwixrJcIjpcIlZcIixcIuqdnlwiOlwiVlwiLFwiyYVcIjpcIlZcIixcIuqdoFwiOlwiVllcIixcIuKTjFwiOlwiV1wiLFwi77y3XCI6XCJXXCIsXCLhuoBcIjpcIldcIixcIuG6glwiOlwiV1wiLFwixbRcIjpcIldcIixcIuG6hlwiOlwiV1wiLFwi4bqEXCI6XCJXXCIsXCLhuohcIjpcIldcIixcIuKxslwiOlwiV1wiLFwi4pONXCI6XCJYXCIsXCLvvLhcIjpcIlhcIixcIuG6ilwiOlwiWFwiLFwi4bqMXCI6XCJYXCIsXCLik45cIjpcIllcIixcIu+8uVwiOlwiWVwiLFwi4buyXCI6XCJZXCIsXCLDnVwiOlwiWVwiLFwixbZcIjpcIllcIixcIuG7uFwiOlwiWVwiLFwiyLJcIjpcIllcIixcIuG6jlwiOlwiWVwiLFwixbhcIjpcIllcIixcIuG7tlwiOlwiWVwiLFwi4bu0XCI6XCJZXCIsXCLGs1wiOlwiWVwiLFwiyY5cIjpcIllcIixcIuG7vlwiOlwiWVwiLFwi4pOPXCI6XCJaXCIsXCLvvLpcIjpcIlpcIixcIsW5XCI6XCJaXCIsXCLhupBcIjpcIlpcIixcIsW7XCI6XCJaXCIsXCLFvVwiOlwiWlwiLFwi4bqSXCI6XCJaXCIsXCLhupRcIjpcIlpcIixcIsa1XCI6XCJaXCIsXCLIpFwiOlwiWlwiLFwi4rG/XCI6XCJaXCIsXCLisatcIjpcIlpcIixcIuqdolwiOlwiWlwiLFwi4pOQXCI6XCJhXCIsXCLvvYFcIjpcImFcIixcIuG6mlwiOlwiYVwiLFwiw6BcIjpcImFcIixcIsOhXCI6XCJhXCIsXCLDolwiOlwiYVwiLFwi4bqnXCI6XCJhXCIsXCLhuqVcIjpcImFcIixcIuG6q1wiOlwiYVwiLFwi4bqpXCI6XCJhXCIsXCLDo1wiOlwiYVwiLFwixIFcIjpcImFcIixcIsSDXCI6XCJhXCIsXCLhurFcIjpcImFcIixcIuG6r1wiOlwiYVwiLFwi4bq1XCI6XCJhXCIsXCLhurNcIjpcImFcIixcIsinXCI6XCJhXCIsXCLHoVwiOlwiYVwiLFwiw6RcIjpcImFcIixcIsefXCI6XCJhXCIsXCLhuqNcIjpcImFcIixcIsOlXCI6XCJhXCIsXCLHu1wiOlwiYVwiLFwix45cIjpcImFcIixcIsiBXCI6XCJhXCIsXCLIg1wiOlwiYVwiLFwi4bqhXCI6XCJhXCIsXCLhuq1cIjpcImFcIixcIuG6t1wiOlwiYVwiLFwi4biBXCI6XCJhXCIsXCLEhVwiOlwiYVwiLFwi4rGlXCI6XCJhXCIsXCLJkFwiOlwiYVwiLFwi6pyzXCI6XCJhYVwiLFwiw6ZcIjpcImFlXCIsXCLHvVwiOlwiYWVcIixcIsejXCI6XCJhZVwiLFwi6py1XCI6XCJhb1wiLFwi6py3XCI6XCJhdVwiLFwi6py5XCI6XCJhdlwiLFwi6py7XCI6XCJhdlwiLFwi6py9XCI6XCJheVwiLFwi4pORXCI6XCJiXCIsXCLvvYJcIjpcImJcIixcIuG4g1wiOlwiYlwiLFwi4biFXCI6XCJiXCIsXCLhuIdcIjpcImJcIixcIsaAXCI6XCJiXCIsXCLGg1wiOlwiYlwiLFwiyZNcIjpcImJcIixcIuKTklwiOlwiY1wiLFwi772DXCI6XCJjXCIsXCLEh1wiOlwiY1wiLFwixIlcIjpcImNcIixcIsSLXCI6XCJjXCIsXCLEjVwiOlwiY1wiLFwiw6dcIjpcImNcIixcIuG4iVwiOlwiY1wiLFwixohcIjpcImNcIixcIsi8XCI6XCJjXCIsXCLqnL9cIjpcImNcIixcIuKGhFwiOlwiY1wiLFwi4pOTXCI6XCJkXCIsXCLvvYRcIjpcImRcIixcIuG4i1wiOlwiZFwiLFwixI9cIjpcImRcIixcIuG4jVwiOlwiZFwiLFwi4biRXCI6XCJkXCIsXCLhuJNcIjpcImRcIixcIuG4j1wiOlwiZFwiLFwixJFcIjpcImRcIixcIsaMXCI6XCJkXCIsXCLJllwiOlwiZFwiLFwiyZdcIjpcImRcIixcIuqdulwiOlwiZFwiLFwix7NcIjpcImR6XCIsXCLHhlwiOlwiZHpcIixcIuKTlFwiOlwiZVwiLFwi772FXCI6XCJlXCIsXCLDqFwiOlwiZVwiLFwiw6lcIjpcImVcIixcIsOqXCI6XCJlXCIsXCLhu4FcIjpcImVcIixcIuG6v1wiOlwiZVwiLFwi4buFXCI6XCJlXCIsXCLhu4NcIjpcImVcIixcIuG6vVwiOlwiZVwiLFwixJNcIjpcImVcIixcIuG4lVwiOlwiZVwiLFwi4biXXCI6XCJlXCIsXCLElVwiOlwiZVwiLFwixJdcIjpcImVcIixcIsOrXCI6XCJlXCIsXCLhurtcIjpcImVcIixcIsSbXCI6XCJlXCIsXCLIhVwiOlwiZVwiLFwiyIdcIjpcImVcIixcIuG6uVwiOlwiZVwiLFwi4buHXCI6XCJlXCIsXCLIqVwiOlwiZVwiLFwi4bidXCI6XCJlXCIsXCLEmVwiOlwiZVwiLFwi4biZXCI6XCJlXCIsXCLhuJtcIjpcImVcIixcIsmHXCI6XCJlXCIsXCLJm1wiOlwiZVwiLFwix51cIjpcImVcIixcIuKTlVwiOlwiZlwiLFwi772GXCI6XCJmXCIsXCLhuJ9cIjpcImZcIixcIsaSXCI6XCJmXCIsXCLqnbxcIjpcImZcIixcIuKTllwiOlwiZ1wiLFwi772HXCI6XCJnXCIsXCLHtVwiOlwiZ1wiLFwixJ1cIjpcImdcIixcIuG4oVwiOlwiZ1wiLFwixJ9cIjpcImdcIixcIsShXCI6XCJnXCIsXCLHp1wiOlwiZ1wiLFwixKNcIjpcImdcIixcIselXCI6XCJnXCIsXCLJoFwiOlwiZ1wiLFwi6p6hXCI6XCJnXCIsXCLhtblcIjpcImdcIixcIuqdv1wiOlwiZ1wiLFwi4pOXXCI6XCJoXCIsXCLvvYhcIjpcImhcIixcIsSlXCI6XCJoXCIsXCLhuKNcIjpcImhcIixcIuG4p1wiOlwiaFwiLFwiyJ9cIjpcImhcIixcIuG4pVwiOlwiaFwiLFwi4bipXCI6XCJoXCIsXCLhuKtcIjpcImhcIixcIuG6llwiOlwiaFwiLFwixKdcIjpcImhcIixcIuKxqFwiOlwiaFwiLFwi4rG2XCI6XCJoXCIsXCLJpVwiOlwiaFwiLFwixpVcIjpcImh2XCIsXCLik5hcIjpcImlcIixcIu+9iVwiOlwiaVwiLFwiw6xcIjpcImlcIixcIsOtXCI6XCJpXCIsXCLDrlwiOlwiaVwiLFwixKlcIjpcImlcIixcIsSrXCI6XCJpXCIsXCLErVwiOlwiaVwiLFwiw69cIjpcImlcIixcIuG4r1wiOlwiaVwiLFwi4buJXCI6XCJpXCIsXCLHkFwiOlwiaVwiLFwiyIlcIjpcImlcIixcIsiLXCI6XCJpXCIsXCLhu4tcIjpcImlcIixcIsSvXCI6XCJpXCIsXCLhuK1cIjpcImlcIixcIsmoXCI6XCJpXCIsXCLEsVwiOlwiaVwiLFwi4pOZXCI6XCJqXCIsXCLvvYpcIjpcImpcIixcIsS1XCI6XCJqXCIsXCLHsFwiOlwialwiLFwiyYlcIjpcImpcIixcIuKTmlwiOlwia1wiLFwi772LXCI6XCJrXCIsXCLhuLFcIjpcImtcIixcIsepXCI6XCJrXCIsXCLhuLNcIjpcImtcIixcIsS3XCI6XCJrXCIsXCLhuLVcIjpcImtcIixcIsaZXCI6XCJrXCIsXCLisapcIjpcImtcIixcIuqdgVwiOlwia1wiLFwi6p2DXCI6XCJrXCIsXCLqnYVcIjpcImtcIixcIuqeo1wiOlwia1wiLFwi4pObXCI6XCJsXCIsXCLvvYxcIjpcImxcIixcIsWAXCI6XCJsXCIsXCLEulwiOlwibFwiLFwixL5cIjpcImxcIixcIuG4t1wiOlwibFwiLFwi4bi5XCI6XCJsXCIsXCLEvFwiOlwibFwiLFwi4bi9XCI6XCJsXCIsXCLhuLtcIjpcImxcIixcIsW/XCI6XCJsXCIsXCLFglwiOlwibFwiLFwixppcIjpcImxcIixcIsmrXCI6XCJsXCIsXCLisaFcIjpcImxcIixcIuqdiVwiOlwibFwiLFwi6p6BXCI6XCJsXCIsXCLqnYdcIjpcImxcIixcIseJXCI6XCJsalwiLFwi4pOcXCI6XCJtXCIsXCLvvY1cIjpcIm1cIixcIuG4v1wiOlwibVwiLFwi4bmBXCI6XCJtXCIsXCLhuYNcIjpcIm1cIixcIsmxXCI6XCJtXCIsXCLJr1wiOlwibVwiLFwi4pOdXCI6XCJuXCIsXCLvvY5cIjpcIm5cIixcIse5XCI6XCJuXCIsXCLFhFwiOlwiblwiLFwiw7FcIjpcIm5cIixcIuG5hVwiOlwiblwiLFwixYhcIjpcIm5cIixcIuG5h1wiOlwiblwiLFwixYZcIjpcIm5cIixcIuG5i1wiOlwiblwiLFwi4bmJXCI6XCJuXCIsXCLGnlwiOlwiblwiLFwiybJcIjpcIm5cIixcIsWJXCI6XCJuXCIsXCLqnpFcIjpcIm5cIixcIuqepVwiOlwiblwiLFwix4xcIjpcIm5qXCIsXCLik55cIjpcIm9cIixcIu+9j1wiOlwib1wiLFwiw7JcIjpcIm9cIixcIsOzXCI6XCJvXCIsXCLDtFwiOlwib1wiLFwi4buTXCI6XCJvXCIsXCLhu5FcIjpcIm9cIixcIuG7l1wiOlwib1wiLFwi4buVXCI6XCJvXCIsXCLDtVwiOlwib1wiLFwi4bmNXCI6XCJvXCIsXCLIrVwiOlwib1wiLFwi4bmPXCI6XCJvXCIsXCLFjVwiOlwib1wiLFwi4bmRXCI6XCJvXCIsXCLhuZNcIjpcIm9cIixcIsWPXCI6XCJvXCIsXCLIr1wiOlwib1wiLFwiyLFcIjpcIm9cIixcIsO2XCI6XCJvXCIsXCLIq1wiOlwib1wiLFwi4buPXCI6XCJvXCIsXCLFkVwiOlwib1wiLFwix5JcIjpcIm9cIixcIsiNXCI6XCJvXCIsXCLIj1wiOlwib1wiLFwixqFcIjpcIm9cIixcIuG7nVwiOlwib1wiLFwi4bubXCI6XCJvXCIsXCLhu6FcIjpcIm9cIixcIuG7n1wiOlwib1wiLFwi4bujXCI6XCJvXCIsXCLhu41cIjpcIm9cIixcIuG7mVwiOlwib1wiLFwix6tcIjpcIm9cIixcIsetXCI6XCJvXCIsXCLDuFwiOlwib1wiLFwix79cIjpcIm9cIixcIsmUXCI6XCJvXCIsXCLqnYtcIjpcIm9cIixcIuqdjVwiOlwib1wiLFwiybVcIjpcIm9cIixcIsajXCI6XCJvaVwiLFwiyKNcIjpcIm91XCIsXCLqnY9cIjpcIm9vXCIsXCLik59cIjpcInBcIixcIu+9kFwiOlwicFwiLFwi4bmVXCI6XCJwXCIsXCLhuZdcIjpcInBcIixcIsalXCI6XCJwXCIsXCLhtb1cIjpcInBcIixcIuqdkVwiOlwicFwiLFwi6p2TXCI6XCJwXCIsXCLqnZVcIjpcInBcIixcIuKToFwiOlwicVwiLFwi772RXCI6XCJxXCIsXCLJi1wiOlwicVwiLFwi6p2XXCI6XCJxXCIsXCLqnZlcIjpcInFcIixcIuKToVwiOlwiclwiLFwi772SXCI6XCJyXCIsXCLFlVwiOlwiclwiLFwi4bmZXCI6XCJyXCIsXCLFmVwiOlwiclwiLFwiyJFcIjpcInJcIixcIsiTXCI6XCJyXCIsXCLhuZtcIjpcInJcIixcIuG5nVwiOlwiclwiLFwixZdcIjpcInJcIixcIuG5n1wiOlwiclwiLFwiyY1cIjpcInJcIixcIsm9XCI6XCJyXCIsXCLqnZtcIjpcInJcIixcIuqep1wiOlwiclwiLFwi6p6DXCI6XCJyXCIsXCLik6JcIjpcInNcIixcIu+9k1wiOlwic1wiLFwiw59cIjpcInNcIixcIsWbXCI6XCJzXCIsXCLhuaVcIjpcInNcIixcIsWdXCI6XCJzXCIsXCLhuaFcIjpcInNcIixcIsWhXCI6XCJzXCIsXCLhuadcIjpcInNcIixcIuG5o1wiOlwic1wiLFwi4bmpXCI6XCJzXCIsXCLImVwiOlwic1wiLFwixZ9cIjpcInNcIixcIsi/XCI6XCJzXCIsXCLqnqlcIjpcInNcIixcIuqehVwiOlwic1wiLFwi4bqbXCI6XCJzXCIsXCLik6NcIjpcInRcIixcIu+9lFwiOlwidFwiLFwi4bmrXCI6XCJ0XCIsXCLhupdcIjpcInRcIixcIsWlXCI6XCJ0XCIsXCLhua1cIjpcInRcIixcIsibXCI6XCJ0XCIsXCLFo1wiOlwidFwiLFwi4bmxXCI6XCJ0XCIsXCLhua9cIjpcInRcIixcIsWnXCI6XCJ0XCIsXCLGrVwiOlwidFwiLFwiyohcIjpcInRcIixcIuKxplwiOlwidFwiLFwi6p6HXCI6XCJ0XCIsXCLqnKlcIjpcInR6XCIsXCLik6RcIjpcInVcIixcIu+9lVwiOlwidVwiLFwiw7lcIjpcInVcIixcIsO6XCI6XCJ1XCIsXCLDu1wiOlwidVwiLFwixalcIjpcInVcIixcIuG5uVwiOlwidVwiLFwixatcIjpcInVcIixcIuG5u1wiOlwidVwiLFwixa1cIjpcInVcIixcIsO8XCI6XCJ1XCIsXCLHnFwiOlwidVwiLFwix5hcIjpcInVcIixcIseWXCI6XCJ1XCIsXCLHmlwiOlwidVwiLFwi4bunXCI6XCJ1XCIsXCLFr1wiOlwidVwiLFwixbFcIjpcInVcIixcIseUXCI6XCJ1XCIsXCLIlVwiOlwidVwiLFwiyJdcIjpcInVcIixcIsawXCI6XCJ1XCIsXCLhu6tcIjpcInVcIixcIuG7qVwiOlwidVwiLFwi4buvXCI6XCJ1XCIsXCLhu61cIjpcInVcIixcIuG7sVwiOlwidVwiLFwi4bulXCI6XCJ1XCIsXCLhubNcIjpcInVcIixcIsWzXCI6XCJ1XCIsXCLhubdcIjpcInVcIixcIuG5tVwiOlwidVwiLFwiyolcIjpcInVcIixcIuKTpVwiOlwidlwiLFwi772WXCI6XCJ2XCIsXCLhub1cIjpcInZcIixcIuG5v1wiOlwidlwiLFwiyotcIjpcInZcIixcIuqdn1wiOlwidlwiLFwiyoxcIjpcInZcIixcIuqdoVwiOlwidnlcIixcIuKTplwiOlwid1wiLFwi772XXCI6XCJ3XCIsXCLhuoFcIjpcIndcIixcIuG6g1wiOlwid1wiLFwixbVcIjpcIndcIixcIuG6h1wiOlwid1wiLFwi4bqFXCI6XCJ3XCIsXCLhuphcIjpcIndcIixcIuG6iVwiOlwid1wiLFwi4rGzXCI6XCJ3XCIsXCLik6dcIjpcInhcIixcIu+9mFwiOlwieFwiLFwi4bqLXCI6XCJ4XCIsXCLhuo1cIjpcInhcIixcIuKTqFwiOlwieVwiLFwi772ZXCI6XCJ5XCIsXCLhu7NcIjpcInlcIixcIsO9XCI6XCJ5XCIsXCLFt1wiOlwieVwiLFwi4bu5XCI6XCJ5XCIsXCLIs1wiOlwieVwiLFwi4bqPXCI6XCJ5XCIsXCLDv1wiOlwieVwiLFwi4bu3XCI6XCJ5XCIsXCLhuplcIjpcInlcIixcIuG7tVwiOlwieVwiLFwixrRcIjpcInlcIixcIsmPXCI6XCJ5XCIsXCLhu79cIjpcInlcIixcIuKTqVwiOlwielwiLFwi772aXCI6XCJ6XCIsXCLFulwiOlwielwiLFwi4bqRXCI6XCJ6XCIsXCLFvFwiOlwielwiLFwixb5cIjpcInpcIixcIuG6k1wiOlwielwiLFwi4bqVXCI6XCJ6XCIsXCLGtlwiOlwielwiLFwiyKVcIjpcInpcIixcIsmAXCI6XCJ6XCIsXCLisaxcIjpcInpcIixcIuqdo1wiOlwielwiLFwizoZcIjpcIs6RXCIsXCLOiFwiOlwizpVcIixcIs6JXCI6XCLOl1wiLFwizopcIjpcIs6ZXCIsXCLOqlwiOlwizplcIixcIs6MXCI6XCLOn1wiLFwizo5cIjpcIs6lXCIsXCLOq1wiOlwizqVcIixcIs6PXCI6XCLOqVwiLFwizqxcIjpcIs6xXCIsXCLOrVwiOlwizrVcIixcIs6uXCI6XCLOt1wiLFwizq9cIjpcIs65XCIsXCLPilwiOlwizrlcIixcIs6QXCI6XCLOuVwiLFwiz4xcIjpcIs6/XCIsXCLPjVwiOlwiz4VcIixcIs+LXCI6XCLPhVwiLFwizrBcIjpcIs+FXCIsXCLPiVwiOlwiz4lcIixcIs+CXCI6XCLPg1wifTtyZXR1cm4gYX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kYXRhL2Jhc2VcIixbXCIuLi91dGlsc1wiXSxmdW5jdGlvbihhKXtmdW5jdGlvbiBiKGEsYyl7Yi5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzKX1yZXR1cm4gYS5FeHRlbmQoYixhLk9ic2VydmFibGUpLGIucHJvdG90eXBlLmN1cnJlbnQ9ZnVuY3Rpb24oYSl7dGhyb3cgbmV3IEVycm9yKFwiVGhlIGBjdXJyZW50YCBtZXRob2QgbXVzdCBiZSBkZWZpbmVkIGluIGNoaWxkIGNsYXNzZXMuXCIpfSxiLnByb3RvdHlwZS5xdWVyeT1mdW5jdGlvbihhLGIpe3Rocm93IG5ldyBFcnJvcihcIlRoZSBgcXVlcnlgIG1ldGhvZCBtdXN0IGJlIGRlZmluZWQgaW4gY2hpbGQgY2xhc3Nlcy5cIil9LGIucHJvdG90eXBlLmJpbmQ9ZnVuY3Rpb24oYSxiKXt9LGIucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt9LGIucHJvdG90eXBlLmdlbmVyYXRlUmVzdWx0SWQ9ZnVuY3Rpb24oYixjKXt2YXIgZD1iLmlkK1wiLXJlc3VsdC1cIjtyZXR1cm4gZCs9YS5nZW5lcmF0ZUNoYXJzKDQpLGQrPW51bGwhPWMuaWQ/XCItXCIrYy5pZC50b1N0cmluZygpOlwiLVwiK2EuZ2VuZXJhdGVDaGFycyg0KX0sYn0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kYXRhL3NlbGVjdFwiLFtcIi4vYmFzZVwiLFwiLi4vdXRpbHNcIixcImpxdWVyeVwiXSxmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZChhLGIpe3RoaXMuJGVsZW1lbnQ9YSx0aGlzLm9wdGlvbnM9YixkLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMpfXJldHVybiBiLkV4dGVuZChkLGEpLGQucHJvdG90eXBlLmN1cnJlbnQ9ZnVuY3Rpb24oYSl7dmFyIGI9W10sZD10aGlzO3RoaXMuJGVsZW1lbnQuZmluZChcIjpzZWxlY3RlZFwiKS5lYWNoKGZ1bmN0aW9uKCl7dmFyIGE9Yyh0aGlzKSxlPWQuaXRlbShhKTtiLnB1c2goZSl9KSxhKGIpfSxkLnByb3RvdHlwZS5zZWxlY3Q9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcztpZihhLnNlbGVjdGVkPSEwLGMoYS5lbGVtZW50KS5pcyhcIm9wdGlvblwiKSlyZXR1cm4gYS5lbGVtZW50LnNlbGVjdGVkPSEwLHZvaWQgdGhpcy4kZWxlbWVudC50cmlnZ2VyKFwiY2hhbmdlXCIpO1xyXG5pZih0aGlzLiRlbGVtZW50LnByb3AoXCJtdWx0aXBsZVwiKSl0aGlzLmN1cnJlbnQoZnVuY3Rpb24oZCl7dmFyIGU9W107YT1bYV0sYS5wdXNoLmFwcGx5KGEsZCk7Zm9yKHZhciBmPTA7ZjxhLmxlbmd0aDtmKyspe3ZhciBnPWFbZl0uaWQ7LTE9PT1jLmluQXJyYXkoZyxlKSYmZS5wdXNoKGcpfWIuJGVsZW1lbnQudmFsKGUpLGIuJGVsZW1lbnQudHJpZ2dlcihcImNoYW5nZVwiKX0pO2Vsc2V7dmFyIGQ9YS5pZDt0aGlzLiRlbGVtZW50LnZhbChkKSx0aGlzLiRlbGVtZW50LnRyaWdnZXIoXCJjaGFuZ2VcIil9fSxkLnByb3RvdHlwZS51bnNlbGVjdD1mdW5jdGlvbihhKXt2YXIgYj10aGlzO2lmKHRoaXMuJGVsZW1lbnQucHJvcChcIm11bHRpcGxlXCIpKXJldHVybiBhLnNlbGVjdGVkPSExLGMoYS5lbGVtZW50KS5pcyhcIm9wdGlvblwiKT8oYS5lbGVtZW50LnNlbGVjdGVkPSExLHZvaWQgdGhpcy4kZWxlbWVudC50cmlnZ2VyKFwiY2hhbmdlXCIpKTp2b2lkIHRoaXMuY3VycmVudChmdW5jdGlvbihkKXtmb3IodmFyIGU9W10sZj0wO2Y8ZC5sZW5ndGg7ZisrKXt2YXIgZz1kW2ZdLmlkO2chPT1hLmlkJiYtMT09PWMuaW5BcnJheShnLGUpJiZlLnB1c2goZyl9Yi4kZWxlbWVudC52YWwoZSksYi4kZWxlbWVudC50cmlnZ2VyKFwiY2hhbmdlXCIpfSl9LGQucHJvdG90eXBlLmJpbmQ9ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzO3RoaXMuY29udGFpbmVyPWEsYS5vbihcInNlbGVjdFwiLGZ1bmN0aW9uKGEpe2Muc2VsZWN0KGEuZGF0YSl9KSxhLm9uKFwidW5zZWxlY3RcIixmdW5jdGlvbihhKXtjLnVuc2VsZWN0KGEuZGF0YSl9KX0sZC5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe3RoaXMuJGVsZW1lbnQuZmluZChcIipcIikuZWFjaChmdW5jdGlvbigpe2MucmVtb3ZlRGF0YSh0aGlzLFwiZGF0YVwiKX0pfSxkLnByb3RvdHlwZS5xdWVyeT1mdW5jdGlvbihhLGIpe3ZhciBkPVtdLGU9dGhpcyxmPXRoaXMuJGVsZW1lbnQuY2hpbGRyZW4oKTtmLmVhY2goZnVuY3Rpb24oKXt2YXIgYj1jKHRoaXMpO2lmKGIuaXMoXCJvcHRpb25cIil8fGIuaXMoXCJvcHRncm91cFwiKSl7dmFyIGY9ZS5pdGVtKGIpLGc9ZS5tYXRjaGVzKGEsZik7bnVsbCE9PWcmJmQucHVzaChnKX19KSxiKHtyZXN1bHRzOmR9KX0sZC5wcm90b3R5cGUuYWRkT3B0aW9ucz1mdW5jdGlvbihhKXtiLmFwcGVuZE1hbnkodGhpcy4kZWxlbWVudCxhKX0sZC5wcm90b3R5cGUub3B0aW9uPWZ1bmN0aW9uKGEpe3ZhciBiO2EuY2hpbGRyZW4/KGI9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9wdGdyb3VwXCIpLGIubGFiZWw9YS50ZXh0KTooYj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpLHZvaWQgMCE9PWIudGV4dENvbnRlbnQ/Yi50ZXh0Q29udGVudD1hLnRleHQ6Yi5pbm5lclRleHQ9YS50ZXh0KSxhLmlkJiYoYi52YWx1ZT1hLmlkKSxhLmRpc2FibGVkJiYoYi5kaXNhYmxlZD0hMCksYS5zZWxlY3RlZCYmKGIuc2VsZWN0ZWQ9ITApLGEudGl0bGUmJihiLnRpdGxlPWEudGl0bGUpO3ZhciBkPWMoYiksZT10aGlzLl9ub3JtYWxpemVJdGVtKGEpO3JldHVybiBlLmVsZW1lbnQ9YixjLmRhdGEoYixcImRhdGFcIixlKSxkfSxkLnByb3RvdHlwZS5pdGVtPWZ1bmN0aW9uKGEpe3ZhciBiPXt9O2lmKGI9Yy5kYXRhKGFbMF0sXCJkYXRhXCIpLG51bGwhPWIpcmV0dXJuIGI7aWYoYS5pcyhcIm9wdGlvblwiKSliPXtpZDphLnZhbCgpLHRleHQ6YS50ZXh0KCksZGlzYWJsZWQ6YS5wcm9wKFwiZGlzYWJsZWRcIiksc2VsZWN0ZWQ6YS5wcm9wKFwic2VsZWN0ZWRcIiksdGl0bGU6YS5wcm9wKFwidGl0bGVcIil9O2Vsc2UgaWYoYS5pcyhcIm9wdGdyb3VwXCIpKXtiPXt0ZXh0OmEucHJvcChcImxhYmVsXCIpLGNoaWxkcmVuOltdLHRpdGxlOmEucHJvcChcInRpdGxlXCIpfTtmb3IodmFyIGQ9YS5jaGlsZHJlbihcIm9wdGlvblwiKSxlPVtdLGY9MDtmPGQubGVuZ3RoO2YrKyl7dmFyIGc9YyhkW2ZdKSxoPXRoaXMuaXRlbShnKTtlLnB1c2goaCl9Yi5jaGlsZHJlbj1lfXJldHVybiBiPXRoaXMuX25vcm1hbGl6ZUl0ZW0oYiksYi5lbGVtZW50PWFbMF0sYy5kYXRhKGFbMF0sXCJkYXRhXCIsYiksYn0sZC5wcm90b3R5cGUuX25vcm1hbGl6ZUl0ZW09ZnVuY3Rpb24oYSl7Yy5pc1BsYWluT2JqZWN0KGEpfHwoYT17aWQ6YSx0ZXh0OmF9KSxhPWMuZXh0ZW5kKHt9LHt0ZXh0OlwiXCJ9LGEpO3ZhciBiPXtzZWxlY3RlZDohMSxkaXNhYmxlZDohMX07cmV0dXJuIG51bGwhPWEuaWQmJihhLmlkPWEuaWQudG9TdHJpbmcoKSksbnVsbCE9YS50ZXh0JiYoYS50ZXh0PWEudGV4dC50b1N0cmluZygpKSxudWxsPT1hLl9yZXN1bHRJZCYmYS5pZCYmbnVsbCE9dGhpcy5jb250YWluZXImJihhLl9yZXN1bHRJZD10aGlzLmdlbmVyYXRlUmVzdWx0SWQodGhpcy5jb250YWluZXIsYSkpLGMuZXh0ZW5kKHt9LGIsYSl9LGQucHJvdG90eXBlLm1hdGNoZXM9ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzLm9wdGlvbnMuZ2V0KFwibWF0Y2hlclwiKTtyZXR1cm4gYyhhLGIpfSxkfSksYi5kZWZpbmUoXCJzZWxlY3QyL2RhdGEvYXJyYXlcIixbXCIuL3NlbGVjdFwiLFwiLi4vdXRpbHNcIixcImpxdWVyeVwiXSxmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZChhLGIpe3ZhciBjPWIuZ2V0KFwiZGF0YVwiKXx8W107ZC5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzLGEsYiksdGhpcy5hZGRPcHRpb25zKHRoaXMuY29udmVydFRvT3B0aW9ucyhjKSl9cmV0dXJuIGIuRXh0ZW5kKGQsYSksZC5wcm90b3R5cGUuc2VsZWN0PWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMuJGVsZW1lbnQuZmluZChcIm9wdGlvblwiKS5maWx0ZXIoZnVuY3Rpb24oYixjKXtyZXR1cm4gYy52YWx1ZT09YS5pZC50b1N0cmluZygpfSk7MD09PWIubGVuZ3RoJiYoYj10aGlzLm9wdGlvbihhKSx0aGlzLmFkZE9wdGlvbnMoYikpLGQuX19zdXBlcl9fLnNlbGVjdC5jYWxsKHRoaXMsYSl9LGQucHJvdG90eXBlLmNvbnZlcnRUb09wdGlvbnM9ZnVuY3Rpb24oYSl7ZnVuY3Rpb24gZChhKXtyZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gYyh0aGlzKS52YWwoKT09YS5pZH19Zm9yKHZhciBlPXRoaXMsZj10aGlzLiRlbGVtZW50LmZpbmQoXCJvcHRpb25cIiksZz1mLm1hcChmdW5jdGlvbigpe3JldHVybiBlLml0ZW0oYyh0aGlzKSkuaWR9KS5nZXQoKSxoPVtdLGk9MDtpPGEubGVuZ3RoO2krKyl7dmFyIGo9dGhpcy5fbm9ybWFsaXplSXRlbShhW2ldKTtpZihjLmluQXJyYXkoai5pZCxnKT49MCl7dmFyIGs9Zi5maWx0ZXIoZChqKSksbD10aGlzLml0ZW0oayksbT1jLmV4dGVuZCghMCx7fSxqLGwpLG49dGhpcy5vcHRpb24obSk7ay5yZXBsYWNlV2l0aChuKX1lbHNle3ZhciBvPXRoaXMub3B0aW9uKGopO2lmKGouY2hpbGRyZW4pe3ZhciBwPXRoaXMuY29udmVydFRvT3B0aW9ucyhqLmNoaWxkcmVuKTtiLmFwcGVuZE1hbnkobyxwKX1oLnB1c2gobyl9fXJldHVybiBofSxkfSksYi5kZWZpbmUoXCJzZWxlY3QyL2RhdGEvYWpheFwiLFtcIi4vYXJyYXlcIixcIi4uL3V0aWxzXCIsXCJqcXVlcnlcIl0sZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQoYSxiKXt0aGlzLmFqYXhPcHRpb25zPXRoaXMuX2FwcGx5RGVmYXVsdHMoYi5nZXQoXCJhamF4XCIpKSxudWxsIT10aGlzLmFqYXhPcHRpb25zLnByb2Nlc3NSZXN1bHRzJiYodGhpcy5wcm9jZXNzUmVzdWx0cz10aGlzLmFqYXhPcHRpb25zLnByb2Nlc3NSZXN1bHRzKSxkLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsYSxiKX1yZXR1cm4gYi5FeHRlbmQoZCxhKSxkLnByb3RvdHlwZS5fYXBwbHlEZWZhdWx0cz1mdW5jdGlvbihhKXt2YXIgYj17ZGF0YTpmdW5jdGlvbihhKXtyZXR1cm4gYy5leHRlbmQoe30sYSx7cTphLnRlcm19KX0sdHJhbnNwb3J0OmZ1bmN0aW9uKGEsYixkKXt2YXIgZT1jLmFqYXgoYSk7cmV0dXJuIGUudGhlbihiKSxlLmZhaWwoZCksZX19O3JldHVybiBjLmV4dGVuZCh7fSxiLGEsITApfSxkLnByb3RvdHlwZS5wcm9jZXNzUmVzdWx0cz1mdW5jdGlvbihhKXtyZXR1cm4gYX0sZC5wcm90b3R5cGUucXVlcnk9ZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBkKCl7dmFyIGQ9Zi50cmFuc3BvcnQoZixmdW5jdGlvbihkKXt2YXIgZj1lLnByb2Nlc3NSZXN1bHRzKGQsYSk7ZS5vcHRpb25zLmdldChcImRlYnVnXCIpJiZ3aW5kb3cuY29uc29sZSYmY29uc29sZS5lcnJvciYmKGYmJmYucmVzdWx0cyYmYy5pc0FycmF5KGYucmVzdWx0cyl8fGNvbnNvbGUuZXJyb3IoXCJTZWxlY3QyOiBUaGUgQUpBWCByZXN1bHRzIGRpZCBub3QgcmV0dXJuIGFuIGFycmF5IGluIHRoZSBgcmVzdWx0c2Aga2V5IG9mIHRoZSByZXNwb25zZS5cIikpLGIoZil9LGZ1bmN0aW9uKCl7ZC5zdGF0dXMmJlwiMFwiPT09ZC5zdGF0dXN8fGUudHJpZ2dlcihcInJlc3VsdHM6bWVzc2FnZVwiLHttZXNzYWdlOlwiZXJyb3JMb2FkaW5nXCJ9KX0pO2UuX3JlcXVlc3Q9ZH12YXIgZT10aGlzO251bGwhPXRoaXMuX3JlcXVlc3QmJihjLmlzRnVuY3Rpb24odGhpcy5fcmVxdWVzdC5hYm9ydCkmJnRoaXMuX3JlcXVlc3QuYWJvcnQoKSx0aGlzLl9yZXF1ZXN0PW51bGwpO3ZhciBmPWMuZXh0ZW5kKHt0eXBlOlwiR0VUXCJ9LHRoaXMuYWpheE9wdGlvbnMpO1wiZnVuY3Rpb25cIj09dHlwZW9mIGYudXJsJiYoZi51cmw9Zi51cmwuY2FsbCh0aGlzLiRlbGVtZW50LGEpKSxcImZ1bmN0aW9uXCI9PXR5cGVvZiBmLmRhdGEmJihmLmRhdGE9Zi5kYXRhLmNhbGwodGhpcy4kZWxlbWVudCxhKSksdGhpcy5hamF4T3B0aW9ucy5kZWxheSYmbnVsbCE9YS50ZXJtPyh0aGlzLl9xdWVyeVRpbWVvdXQmJndpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5fcXVlcnlUaW1lb3V0KSx0aGlzLl9xdWVyeVRpbWVvdXQ9d2luZG93LnNldFRpbWVvdXQoZCx0aGlzLmFqYXhPcHRpb25zLmRlbGF5KSk6ZCgpfSxkfSksYi5kZWZpbmUoXCJzZWxlY3QyL2RhdGEvdGFnc1wiLFtcImpxdWVyeVwiXSxmdW5jdGlvbihhKXtmdW5jdGlvbiBiKGIsYyxkKXt2YXIgZT1kLmdldChcInRhZ3NcIiksZj1kLmdldChcImNyZWF0ZVRhZ1wiKTt2b2lkIDAhPT1mJiYodGhpcy5jcmVhdGVUYWc9Zik7dmFyIGc9ZC5nZXQoXCJpbnNlcnRUYWdcIik7aWYodm9pZCAwIT09ZyYmKHRoaXMuaW5zZXJ0VGFnPWcpLGIuY2FsbCh0aGlzLGMsZCksYS5pc0FycmF5KGUpKWZvcih2YXIgaD0wO2g8ZS5sZW5ndGg7aCsrKXt2YXIgaT1lW2hdLGo9dGhpcy5fbm9ybWFsaXplSXRlbShpKSxrPXRoaXMub3B0aW9uKGopO3RoaXMuJGVsZW1lbnQuYXBwZW5kKGspfX1yZXR1cm4gYi5wcm90b3R5cGUucXVlcnk9ZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQoYSxmKXtmb3IodmFyIGc9YS5yZXN1bHRzLGg9MDtoPGcubGVuZ3RoO2grKyl7dmFyIGk9Z1toXSxqPW51bGwhPWkuY2hpbGRyZW4mJiFkKHtyZXN1bHRzOmkuY2hpbGRyZW59LCEwKSxrPWkudGV4dD09PWIudGVybTtpZihrfHxqKXJldHVybiBmPyExOihhLmRhdGE9Zyx2b2lkIGMoYSkpfWlmKGYpcmV0dXJuITA7dmFyIGw9ZS5jcmVhdGVUYWcoYik7aWYobnVsbCE9bCl7dmFyIG09ZS5vcHRpb24obCk7bS5hdHRyKFwiZGF0YS1zZWxlY3QyLXRhZ1wiLCEwKSxlLmFkZE9wdGlvbnMoW21dKSxlLmluc2VydFRhZyhnLGwpfWEucmVzdWx0cz1nLGMoYSl9dmFyIGU9dGhpcztyZXR1cm4gdGhpcy5fcmVtb3ZlT2xkVGFncygpLG51bGw9PWIudGVybXx8bnVsbCE9Yi5wYWdlP3ZvaWQgYS5jYWxsKHRoaXMsYixjKTp2b2lkIGEuY2FsbCh0aGlzLGIsZCl9LGIucHJvdG90eXBlLmNyZWF0ZVRhZz1mdW5jdGlvbihiLGMpe3ZhciBkPWEudHJpbShjLnRlcm0pO3JldHVyblwiXCI9PT1kP251bGw6e2lkOmQsdGV4dDpkfX0sYi5wcm90b3R5cGUuaW5zZXJ0VGFnPWZ1bmN0aW9uKGEsYixjKXtiLnVuc2hpZnQoYyl9LGIucHJvdG90eXBlLl9yZW1vdmVPbGRUYWdzPWZ1bmN0aW9uKGIpe3ZhciBjPSh0aGlzLl9sYXN0VGFnLHRoaXMuJGVsZW1lbnQuZmluZChcIm9wdGlvbltkYXRhLXNlbGVjdDItdGFnXVwiKSk7Yy5lYWNoKGZ1bmN0aW9uKCl7dGhpcy5zZWxlY3RlZHx8YSh0aGlzKS5yZW1vdmUoKX0pfSxifSksYi5kZWZpbmUoXCJzZWxlY3QyL2RhdGEvdG9rZW5pemVyXCIsW1wianF1ZXJ5XCJdLGZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoYSxiLGMpe3ZhciBkPWMuZ2V0KFwidG9rZW5pemVyXCIpO3ZvaWQgMCE9PWQmJih0aGlzLnRva2VuaXplcj1kKSxhLmNhbGwodGhpcyxiLGMpfXJldHVybiBiLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGEsYixjKXthLmNhbGwodGhpcyxiLGMpLHRoaXMuJHNlYXJjaD1iLmRyb3Bkb3duLiRzZWFyY2h8fGIuc2VsZWN0aW9uLiRzZWFyY2h8fGMuZmluZChcIi5zZWxlY3QyLXNlYXJjaF9fZmllbGRcIil9LGIucHJvdG90eXBlLnF1ZXJ5PWZ1bmN0aW9uKGIsYyxkKXtmdW5jdGlvbiBlKGIpe3ZhciBjPWcuX25vcm1hbGl6ZUl0ZW0oYiksZD1nLiRlbGVtZW50LmZpbmQoXCJvcHRpb25cIikuZmlsdGVyKGZ1bmN0aW9uKCl7cmV0dXJuIGEodGhpcykudmFsKCk9PT1jLmlkfSk7aWYoIWQubGVuZ3RoKXt2YXIgZT1nLm9wdGlvbihjKTtlLmF0dHIoXCJkYXRhLXNlbGVjdDItdGFnXCIsITApLGcuX3JlbW92ZU9sZFRhZ3MoKSxnLmFkZE9wdGlvbnMoW2VdKX1mKGMpfWZ1bmN0aW9uIGYoYSl7Zy50cmlnZ2VyKFwic2VsZWN0XCIse2RhdGE6YX0pfXZhciBnPXRoaXM7Yy50ZXJtPWMudGVybXx8XCJcIjt2YXIgaD10aGlzLnRva2VuaXplcihjLHRoaXMub3B0aW9ucyxlKTtoLnRlcm0hPT1jLnRlcm0mJih0aGlzLiRzZWFyY2gubGVuZ3RoJiYodGhpcy4kc2VhcmNoLnZhbChoLnRlcm0pLHRoaXMuJHNlYXJjaC5mb2N1cygpKSxjLnRlcm09aC50ZXJtKSxiLmNhbGwodGhpcyxjLGQpfSxiLnByb3RvdHlwZS50b2tlbml6ZXI9ZnVuY3Rpb24oYixjLGQsZSl7Zm9yKHZhciBmPWQuZ2V0KFwidG9rZW5TZXBhcmF0b3JzXCIpfHxbXSxnPWMudGVybSxoPTAsaT10aGlzLmNyZWF0ZVRhZ3x8ZnVuY3Rpb24oYSl7cmV0dXJue2lkOmEudGVybSx0ZXh0OmEudGVybX19O2g8Zy5sZW5ndGg7KXt2YXIgaj1nW2hdO2lmKC0xIT09YS5pbkFycmF5KGosZikpe3ZhciBrPWcuc3Vic3RyKDAsaCksbD1hLmV4dGVuZCh7fSxjLHt0ZXJtOmt9KSxtPWkobCk7bnVsbCE9bT8oZShtKSxnPWcuc3Vic3RyKGgrMSl8fFwiXCIsaD0wKTpoKyt9ZWxzZSBoKyt9cmV0dXJue3Rlcm06Z319LGJ9KSxiLmRlZmluZShcInNlbGVjdDIvZGF0YS9taW5pbXVtSW5wdXRMZW5ndGhcIixbXSxmdW5jdGlvbigpe2Z1bmN0aW9uIGEoYSxiLGMpe3RoaXMubWluaW11bUlucHV0TGVuZ3RoPWMuZ2V0KFwibWluaW11bUlucHV0TGVuZ3RoXCIpLGEuY2FsbCh0aGlzLGIsYyl9cmV0dXJuIGEucHJvdG90eXBlLnF1ZXJ5PWZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gYi50ZXJtPWIudGVybXx8XCJcIixiLnRlcm0ubGVuZ3RoPHRoaXMubWluaW11bUlucHV0TGVuZ3RoP3ZvaWQgdGhpcy50cmlnZ2VyKFwicmVzdWx0czptZXNzYWdlXCIse21lc3NhZ2U6XCJpbnB1dFRvb1Nob3J0XCIsYXJnczp7bWluaW11bTp0aGlzLm1pbmltdW1JbnB1dExlbmd0aCxpbnB1dDpiLnRlcm0scGFyYW1zOmJ9fSk6dm9pZCBhLmNhbGwodGhpcyxiLGMpfSxhfSksYi5kZWZpbmUoXCJzZWxlY3QyL2RhdGEvbWF4aW11bUlucHV0TGVuZ3RoXCIsW10sZnVuY3Rpb24oKXtmdW5jdGlvbiBhKGEsYixjKXt0aGlzLm1heGltdW1JbnB1dExlbmd0aD1jLmdldChcIm1heGltdW1JbnB1dExlbmd0aFwiKSxhLmNhbGwodGhpcyxiLGMpfXJldHVybiBhLnByb3RvdHlwZS5xdWVyeT1mdW5jdGlvbihhLGIsYyl7cmV0dXJuIGIudGVybT1iLnRlcm18fFwiXCIsdGhpcy5tYXhpbXVtSW5wdXRMZW5ndGg+MCYmYi50ZXJtLmxlbmd0aD50aGlzLm1heGltdW1JbnB1dExlbmd0aD92b2lkIHRoaXMudHJpZ2dlcihcInJlc3VsdHM6bWVzc2FnZVwiLHttZXNzYWdlOlwiaW5wdXRUb29Mb25nXCIsYXJnczp7bWF4aW11bTp0aGlzLm1heGltdW1JbnB1dExlbmd0aCxpbnB1dDpiLnRlcm0scGFyYW1zOmJ9fSk6dm9pZCBhLmNhbGwodGhpcyxiLGMpfSxhfSksYi5kZWZpbmUoXCJzZWxlY3QyL2RhdGEvbWF4aW11bVNlbGVjdGlvbkxlbmd0aFwiLFtdLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShhLGIsYyl7dGhpcy5tYXhpbXVtU2VsZWN0aW9uTGVuZ3RoPWMuZ2V0KFwibWF4aW11bVNlbGVjdGlvbkxlbmd0aFwiKSxhLmNhbGwodGhpcyxiLGMpfXJldHVybiBhLnByb3RvdHlwZS5xdWVyeT1mdW5jdGlvbihhLGIsYyl7dmFyIGQ9dGhpczt0aGlzLmN1cnJlbnQoZnVuY3Rpb24oZSl7dmFyIGY9bnVsbCE9ZT9lLmxlbmd0aDowO3JldHVybiBkLm1heGltdW1TZWxlY3Rpb25MZW5ndGg+MCYmZj49ZC5tYXhpbXVtU2VsZWN0aW9uTGVuZ3RoP3ZvaWQgZC50cmlnZ2VyKFwicmVzdWx0czptZXNzYWdlXCIse21lc3NhZ2U6XCJtYXhpbXVtU2VsZWN0ZWRcIixhcmdzOnttYXhpbXVtOmQubWF4aW11bVNlbGVjdGlvbkxlbmd0aH19KTp2b2lkIGEuY2FsbChkLGIsYyl9KX0sYX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kcm9wZG93blwiLFtcImpxdWVyeVwiLFwiLi91dGlsc1wiXSxmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYSxiKXt0aGlzLiRlbGVtZW50PWEsdGhpcy5vcHRpb25zPWIsYy5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzKX1yZXR1cm4gYi5FeHRlbmQoYyxiLk9ic2VydmFibGUpLGMucHJvdG90eXBlLnJlbmRlcj1mdW5jdGlvbigpe3ZhciBiPWEoJzxzcGFuIGNsYXNzPVwic2VsZWN0Mi1kcm9wZG93blwiPjxzcGFuIGNsYXNzPVwic2VsZWN0Mi1yZXN1bHRzXCI+PC9zcGFuPjwvc3Bhbj4nKTtyZXR1cm4gYi5hdHRyKFwiZGlyXCIsdGhpcy5vcHRpb25zLmdldChcImRpclwiKSksdGhpcy4kZHJvcGRvd249YixifSxjLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKCl7fSxjLnByb3RvdHlwZS5wb3NpdGlvbj1mdW5jdGlvbihhLGIpe30sYy5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe3RoaXMuJGRyb3Bkb3duLnJlbW92ZSgpfSxjfSksYi5kZWZpbmUoXCJzZWxlY3QyL2Ryb3Bkb3duL3NlYXJjaFwiLFtcImpxdWVyeVwiLFwiLi4vdXRpbHNcIl0sZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKCl7fXJldHVybiBjLnByb3RvdHlwZS5yZW5kZXI9ZnVuY3Rpb24oYil7dmFyIGM9Yi5jYWxsKHRoaXMpLGQ9YSgnPHNwYW4gY2xhc3M9XCJzZWxlY3QyLXNlYXJjaCBzZWxlY3QyLXNlYXJjaC0tZHJvcGRvd25cIj48aW5wdXQgY2xhc3M9XCJzZWxlY3QyLXNlYXJjaF9fZmllbGRcIiB0eXBlPVwic2VhcmNoXCIgdGFiaW5kZXg9XCItMVwiIGF1dG9jb21wbGV0ZT1cIm9mZlwiIGF1dG9jb3JyZWN0PVwib2ZmXCIgYXV0b2NhcGl0YWxpemU9XCJvZmZcIiBzcGVsbGNoZWNrPVwiZmFsc2VcIiByb2xlPVwidGV4dGJveFwiIC8+PC9zcGFuPicpO3JldHVybiB0aGlzLiRzZWFyY2hDb250YWluZXI9ZCx0aGlzLiRzZWFyY2g9ZC5maW5kKFwiaW5wdXRcIiksYy5wcmVwZW5kKGQpLGN9LGMucHJvdG90eXBlLmJpbmQ9ZnVuY3Rpb24oYixjLGQpe3ZhciBlPXRoaXM7Yi5jYWxsKHRoaXMsYyxkKSx0aGlzLiRzZWFyY2gub24oXCJrZXlkb3duXCIsZnVuY3Rpb24oYSl7ZS50cmlnZ2VyKFwia2V5cHJlc3NcIixhKSxlLl9rZXlVcFByZXZlbnRlZD1hLmlzRGVmYXVsdFByZXZlbnRlZCgpfSksdGhpcy4kc2VhcmNoLm9uKFwiaW5wdXRcIixmdW5jdGlvbihiKXthKHRoaXMpLm9mZihcImtleXVwXCIpfSksdGhpcy4kc2VhcmNoLm9uKFwia2V5dXAgaW5wdXRcIixmdW5jdGlvbihhKXtlLmhhbmRsZVNlYXJjaChhKX0pLGMub24oXCJvcGVuXCIsZnVuY3Rpb24oKXtlLiRzZWFyY2guYXR0cihcInRhYmluZGV4XCIsMCksZS4kc2VhcmNoLmZvY3VzKCksd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKXtlLiRzZWFyY2guZm9jdXMoKX0sMCl9KSxjLm9uKFwiY2xvc2VcIixmdW5jdGlvbigpe2UuJHNlYXJjaC5hdHRyKFwidGFiaW5kZXhcIiwtMSksZS4kc2VhcmNoLnZhbChcIlwiKX0pLGMub24oXCJmb2N1c1wiLGZ1bmN0aW9uKCl7Yy5pc09wZW4oKSYmZS4kc2VhcmNoLmZvY3VzKCl9KSxjLm9uKFwicmVzdWx0czphbGxcIixmdW5jdGlvbihhKXtpZihudWxsPT1hLnF1ZXJ5LnRlcm18fFwiXCI9PT1hLnF1ZXJ5LnRlcm0pe3ZhciBiPWUuc2hvd1NlYXJjaChhKTtiP2UuJHNlYXJjaENvbnRhaW5lci5yZW1vdmVDbGFzcyhcInNlbGVjdDItc2VhcmNoLS1oaWRlXCIpOmUuJHNlYXJjaENvbnRhaW5lci5hZGRDbGFzcyhcInNlbGVjdDItc2VhcmNoLS1oaWRlXCIpfX0pfSxjLnByb3RvdHlwZS5oYW5kbGVTZWFyY2g9ZnVuY3Rpb24oYSl7aWYoIXRoaXMuX2tleVVwUHJldmVudGVkKXt2YXIgYj10aGlzLiRzZWFyY2gudmFsKCk7dGhpcy50cmlnZ2VyKFwicXVlcnlcIix7dGVybTpifSl9dGhpcy5fa2V5VXBQcmV2ZW50ZWQ9ITF9LGMucHJvdG90eXBlLnNob3dTZWFyY2g9ZnVuY3Rpb24oYSxiKXtyZXR1cm4hMH0sY30pLGIuZGVmaW5lKFwic2VsZWN0Mi9kcm9wZG93bi9oaWRlUGxhY2Vob2xkZXJcIixbXSxmdW5jdGlvbigpe2Z1bmN0aW9uIGEoYSxiLGMsZCl7dGhpcy5wbGFjZWhvbGRlcj10aGlzLm5vcm1hbGl6ZVBsYWNlaG9sZGVyKGMuZ2V0KFwicGxhY2Vob2xkZXJcIikpLGEuY2FsbCh0aGlzLGIsYyxkKX1yZXR1cm4gYS5wcm90b3R5cGUuYXBwZW5kPWZ1bmN0aW9uKGEsYil7Yi5yZXN1bHRzPXRoaXMucmVtb3ZlUGxhY2Vob2xkZXIoYi5yZXN1bHRzKSxhLmNhbGwodGhpcyxiKX0sYS5wcm90b3R5cGUubm9ybWFsaXplUGxhY2Vob2xkZXI9ZnVuY3Rpb24oYSxiKXtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgYiYmKGI9e2lkOlwiXCIsdGV4dDpifSksYn0sYS5wcm90b3R5cGUucmVtb3ZlUGxhY2Vob2xkZXI9ZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9Yi5zbGljZSgwKSxkPWIubGVuZ3RoLTE7ZD49MDtkLS0pe3ZhciBlPWJbZF07dGhpcy5wbGFjZWhvbGRlci5pZD09PWUuaWQmJmMuc3BsaWNlKGQsMSl9cmV0dXJuIGN9LGF9KSxiLmRlZmluZShcInNlbGVjdDIvZHJvcGRvd24vaW5maW5pdGVTY3JvbGxcIixbXCJqcXVlcnlcIl0sZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYihhLGIsYyxkKXt0aGlzLmxhc3RQYXJhbXM9e30sYS5jYWxsKHRoaXMsYixjLGQpLHRoaXMuJGxvYWRpbmdNb3JlPXRoaXMuY3JlYXRlTG9hZGluZ01vcmUoKSx0aGlzLmxvYWRpbmc9ITF9cmV0dXJuIGIucHJvdG90eXBlLmFwcGVuZD1mdW5jdGlvbihhLGIpe3RoaXMuJGxvYWRpbmdNb3JlLnJlbW92ZSgpLHRoaXMubG9hZGluZz0hMSxhLmNhbGwodGhpcyxiKSx0aGlzLnNob3dMb2FkaW5nTW9yZShiKSYmdGhpcy4kcmVzdWx0cy5hcHBlbmQodGhpcy4kbG9hZGluZ01vcmUpfSxiLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGIsYyxkKXt2YXIgZT10aGlzO2IuY2FsbCh0aGlzLGMsZCksYy5vbihcInF1ZXJ5XCIsZnVuY3Rpb24oYSl7ZS5sYXN0UGFyYW1zPWEsZS5sb2FkaW5nPSEwfSksYy5vbihcInF1ZXJ5OmFwcGVuZFwiLGZ1bmN0aW9uKGEpe2UubGFzdFBhcmFtcz1hLGUubG9hZGluZz0hMH0pLHRoaXMuJHJlc3VsdHMub24oXCJzY3JvbGxcIixmdW5jdGlvbigpe3ZhciBiPWEuY29udGFpbnMoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LGUuJGxvYWRpbmdNb3JlWzBdKTtpZighZS5sb2FkaW5nJiZiKXt2YXIgYz1lLiRyZXN1bHRzLm9mZnNldCgpLnRvcCtlLiRyZXN1bHRzLm91dGVySGVpZ2h0KCExKSxkPWUuJGxvYWRpbmdNb3JlLm9mZnNldCgpLnRvcCtlLiRsb2FkaW5nTW9yZS5vdXRlckhlaWdodCghMSk7Yys1MD49ZCYmZS5sb2FkTW9yZSgpfX0pfSxiLnByb3RvdHlwZS5sb2FkTW9yZT1mdW5jdGlvbigpe3RoaXMubG9hZGluZz0hMDt2YXIgYj1hLmV4dGVuZCh7fSx7cGFnZToxfSx0aGlzLmxhc3RQYXJhbXMpO2IucGFnZSsrLHRoaXMudHJpZ2dlcihcInF1ZXJ5OmFwcGVuZFwiLGIpfSxiLnByb3RvdHlwZS5zaG93TG9hZGluZ01vcmU9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYi5wYWdpbmF0aW9uJiZiLnBhZ2luYXRpb24ubW9yZX0sYi5wcm90b3R5cGUuY3JlYXRlTG9hZGluZ01vcmU9ZnVuY3Rpb24oKXt2YXIgYj1hKCc8bGkgY2xhc3M9XCJzZWxlY3QyLXJlc3VsdHNfX29wdGlvbiBzZWxlY3QyLXJlc3VsdHNfX29wdGlvbi0tbG9hZC1tb3JlXCJyb2xlPVwidHJlZWl0ZW1cIiBhcmlhLWRpc2FibGVkPVwidHJ1ZVwiPjwvbGk+JyksYz10aGlzLm9wdGlvbnMuZ2V0KFwidHJhbnNsYXRpb25zXCIpLmdldChcImxvYWRpbmdNb3JlXCIpO3JldHVybiBiLmh0bWwoYyh0aGlzLmxhc3RQYXJhbXMpKSxifSxifSksYi5kZWZpbmUoXCJzZWxlY3QyL2Ryb3Bkb3duL2F0dGFjaEJvZHlcIixbXCJqcXVlcnlcIixcIi4uL3V0aWxzXCJdLGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhiLGMsZCl7dGhpcy4kZHJvcGRvd25QYXJlbnQ9ZC5nZXQoXCJkcm9wZG93blBhcmVudFwiKXx8YShkb2N1bWVudC5ib2R5KSxiLmNhbGwodGhpcyxjLGQpfXJldHVybiBjLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGEsYixjKXt2YXIgZD10aGlzLGU9ITE7YS5jYWxsKHRoaXMsYixjKSxiLm9uKFwib3BlblwiLGZ1bmN0aW9uKCl7ZC5fc2hvd0Ryb3Bkb3duKCksZC5fYXR0YWNoUG9zaXRpb25pbmdIYW5kbGVyKGIpLGV8fChlPSEwLGIub24oXCJyZXN1bHRzOmFsbFwiLGZ1bmN0aW9uKCl7ZC5fcG9zaXRpb25Ecm9wZG93bigpLGQuX3Jlc2l6ZURyb3Bkb3duKCl9KSxiLm9uKFwicmVzdWx0czphcHBlbmRcIixmdW5jdGlvbigpe2QuX3Bvc2l0aW9uRHJvcGRvd24oKSxkLl9yZXNpemVEcm9wZG93bigpfSkpfSksYi5vbihcImNsb3NlXCIsZnVuY3Rpb24oKXtkLl9oaWRlRHJvcGRvd24oKSxkLl9kZXRhY2hQb3NpdGlvbmluZ0hhbmRsZXIoYil9KSx0aGlzLiRkcm9wZG93bkNvbnRhaW5lci5vbihcIm1vdXNlZG93blwiLGZ1bmN0aW9uKGEpe2Euc3RvcFByb3BhZ2F0aW9uKCl9KX0sYy5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbihhKXthLmNhbGwodGhpcyksdGhpcy4kZHJvcGRvd25Db250YWluZXIucmVtb3ZlKCl9LGMucHJvdG90eXBlLnBvc2l0aW9uPWZ1bmN0aW9uKGEsYixjKXtiLmF0dHIoXCJjbGFzc1wiLGMuYXR0cihcImNsYXNzXCIpKSxiLnJlbW92ZUNsYXNzKFwic2VsZWN0MlwiKSxiLmFkZENsYXNzKFwic2VsZWN0Mi1jb250YWluZXItLW9wZW5cIiksYi5jc3Moe3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6LTk5OTk5OX0pLHRoaXMuJGNvbnRhaW5lcj1jfSxjLnByb3RvdHlwZS5yZW5kZXI9ZnVuY3Rpb24oYil7dmFyIGM9YShcIjxzcGFuPjwvc3Bhbj5cIiksZD1iLmNhbGwodGhpcyk7cmV0dXJuIGMuYXBwZW5kKGQpLHRoaXMuJGRyb3Bkb3duQ29udGFpbmVyPWMsY30sYy5wcm90b3R5cGUuX2hpZGVEcm9wZG93bj1mdW5jdGlvbihhKXt0aGlzLiRkcm9wZG93bkNvbnRhaW5lci5kZXRhY2goKX0sYy5wcm90b3R5cGUuX2F0dGFjaFBvc2l0aW9uaW5nSGFuZGxlcj1mdW5jdGlvbihjLGQpe3ZhciBlPXRoaXMsZj1cInNjcm9sbC5zZWxlY3QyLlwiK2QuaWQsZz1cInJlc2l6ZS5zZWxlY3QyLlwiK2QuaWQsaD1cIm9yaWVudGF0aW9uY2hhbmdlLnNlbGVjdDIuXCIrZC5pZCxpPXRoaXMuJGNvbnRhaW5lci5wYXJlbnRzKCkuZmlsdGVyKGIuaGFzU2Nyb2xsKTtpLmVhY2goZnVuY3Rpb24oKXthKHRoaXMpLmRhdGEoXCJzZWxlY3QyLXNjcm9sbC1wb3NpdGlvblwiLHt4OmEodGhpcykuc2Nyb2xsTGVmdCgpLHk6YSh0aGlzKS5zY3JvbGxUb3AoKX0pfSksaS5vbihmLGZ1bmN0aW9uKGIpe3ZhciBjPWEodGhpcykuZGF0YShcInNlbGVjdDItc2Nyb2xsLXBvc2l0aW9uXCIpO2EodGhpcykuc2Nyb2xsVG9wKGMueSl9KSxhKHdpbmRvdykub24oZitcIiBcIitnK1wiIFwiK2gsZnVuY3Rpb24oYSl7ZS5fcG9zaXRpb25Ecm9wZG93bigpLGUuX3Jlc2l6ZURyb3Bkb3duKCl9KX0sYy5wcm90b3R5cGUuX2RldGFjaFBvc2l0aW9uaW5nSGFuZGxlcj1mdW5jdGlvbihjLGQpe3ZhciBlPVwic2Nyb2xsLnNlbGVjdDIuXCIrZC5pZCxmPVwicmVzaXplLnNlbGVjdDIuXCIrZC5pZCxnPVwib3JpZW50YXRpb25jaGFuZ2Uuc2VsZWN0Mi5cIitkLmlkLGg9dGhpcy4kY29udGFpbmVyLnBhcmVudHMoKS5maWx0ZXIoYi5oYXNTY3JvbGwpO2gub2ZmKGUpLGEod2luZG93KS5vZmYoZStcIiBcIitmK1wiIFwiK2cpfSxjLnByb3RvdHlwZS5fcG9zaXRpb25Ecm9wZG93bj1mdW5jdGlvbigpe3ZhciBiPWEod2luZG93KSxjPXRoaXMuJGRyb3Bkb3duLmhhc0NsYXNzKFwic2VsZWN0Mi1kcm9wZG93bi0tYWJvdmVcIiksZD10aGlzLiRkcm9wZG93bi5oYXNDbGFzcyhcInNlbGVjdDItZHJvcGRvd24tLWJlbG93XCIpLGU9bnVsbCxmPXRoaXMuJGNvbnRhaW5lci5vZmZzZXQoKTtmLmJvdHRvbT1mLnRvcCt0aGlzLiRjb250YWluZXIub3V0ZXJIZWlnaHQoITEpO3ZhciBnPXtoZWlnaHQ6dGhpcy4kY29udGFpbmVyLm91dGVySGVpZ2h0KCExKX07Zy50b3A9Zi50b3AsZy5ib3R0b209Zi50b3ArZy5oZWlnaHQ7dmFyIGg9e2hlaWdodDp0aGlzLiRkcm9wZG93bi5vdXRlckhlaWdodCghMSl9LGk9e3RvcDpiLnNjcm9sbFRvcCgpLGJvdHRvbTpiLnNjcm9sbFRvcCgpK2IuaGVpZ2h0KCl9LGo9aS50b3A8Zi50b3AtaC5oZWlnaHQsaz1pLmJvdHRvbT5mLmJvdHRvbStoLmhlaWdodCxsPXtsZWZ0OmYubGVmdCx0b3A6Zy5ib3R0b219LG09dGhpcy4kZHJvcGRvd25QYXJlbnQ7XCJzdGF0aWNcIj09PW0uY3NzKFwicG9zaXRpb25cIikmJihtPW0ub2Zmc2V0UGFyZW50KCkpO3ZhciBuPW0ub2Zmc2V0KCk7bC50b3AtPW4udG9wLGwubGVmdC09bi5sZWZ0LGN8fGR8fChlPVwiYmVsb3dcIiksa3x8IWp8fGM/IWomJmsmJmMmJihlPVwiYmVsb3dcIik6ZT1cImFib3ZlXCIsKFwiYWJvdmVcIj09ZXx8YyYmXCJiZWxvd1wiIT09ZSkmJihsLnRvcD1nLnRvcC1uLnRvcC1oLmhlaWdodCksbnVsbCE9ZSYmKHRoaXMuJGRyb3Bkb3duLnJlbW92ZUNsYXNzKFwic2VsZWN0Mi1kcm9wZG93bi0tYmVsb3cgc2VsZWN0Mi1kcm9wZG93bi0tYWJvdmVcIikuYWRkQ2xhc3MoXCJzZWxlY3QyLWRyb3Bkb3duLS1cIitlKSx0aGlzLiRjb250YWluZXIucmVtb3ZlQ2xhc3MoXCJzZWxlY3QyLWNvbnRhaW5lci0tYmVsb3cgc2VsZWN0Mi1jb250YWluZXItLWFib3ZlXCIpLmFkZENsYXNzKFwic2VsZWN0Mi1jb250YWluZXItLVwiK2UpKSx0aGlzLiRkcm9wZG93bkNvbnRhaW5lci5jc3MobCl9LGMucHJvdG90eXBlLl9yZXNpemVEcm9wZG93bj1mdW5jdGlvbigpe3ZhciBhPXt3aWR0aDp0aGlzLiRjb250YWluZXIub3V0ZXJXaWR0aCghMSkrXCJweFwifTt0aGlzLm9wdGlvbnMuZ2V0KFwiZHJvcGRvd25BdXRvV2lkdGhcIikmJihhLm1pbldpZHRoPWEud2lkdGgsYS5wb3NpdGlvbj1cInJlbGF0aXZlXCIsYS53aWR0aD1cImF1dG9cIiksdGhpcy4kZHJvcGRvd24uY3NzKGEpfSxjLnByb3RvdHlwZS5fc2hvd0Ryb3Bkb3duPWZ1bmN0aW9uKGEpe3RoaXMuJGRyb3Bkb3duQ29udGFpbmVyLmFwcGVuZFRvKHRoaXMuJGRyb3Bkb3duUGFyZW50KSx0aGlzLl9wb3NpdGlvbkRyb3Bkb3duKCksdGhpcy5fcmVzaXplRHJvcGRvd24oKX0sY30pLGIuZGVmaW5lKFwic2VsZWN0Mi9kcm9wZG93bi9taW5pbXVtUmVzdWx0c0ZvclNlYXJjaFwiLFtdLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShiKXtmb3IodmFyIGM9MCxkPTA7ZDxiLmxlbmd0aDtkKyspe3ZhciBlPWJbZF07ZS5jaGlsZHJlbj9jKz1hKGUuY2hpbGRyZW4pOmMrK31yZXR1cm4gY31mdW5jdGlvbiBiKGEsYixjLGQpe3RoaXMubWluaW11bVJlc3VsdHNGb3JTZWFyY2g9Yy5nZXQoXCJtaW5pbXVtUmVzdWx0c0ZvclNlYXJjaFwiKSx0aGlzLm1pbmltdW1SZXN1bHRzRm9yU2VhcmNoPDAmJih0aGlzLm1pbmltdW1SZXN1bHRzRm9yU2VhcmNoPTEvMCksYS5jYWxsKHRoaXMsYixjLGQpfXJldHVybiBiLnByb3RvdHlwZS5zaG93U2VhcmNoPWZ1bmN0aW9uKGIsYyl7cmV0dXJuIGEoYy5kYXRhLnJlc3VsdHMpPHRoaXMubWluaW11bVJlc3VsdHNGb3JTZWFyY2g/ITE6Yi5jYWxsKHRoaXMsYyl9LGJ9KSxiLmRlZmluZShcInNlbGVjdDIvZHJvcGRvd24vc2VsZWN0T25DbG9zZVwiLFtdLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gYSgpe31yZXR1cm4gYS5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihhLGIsYyl7dmFyIGQ9dGhpczthLmNhbGwodGhpcyxiLGMpLGIub24oXCJjbG9zZVwiLGZ1bmN0aW9uKGEpe2QuX2hhbmRsZVNlbGVjdE9uQ2xvc2UoYSl9KX0sYS5wcm90b3R5cGUuX2hhbmRsZVNlbGVjdE9uQ2xvc2U9ZnVuY3Rpb24oYSxiKXtpZihiJiZudWxsIT1iLm9yaWdpbmFsU2VsZWN0MkV2ZW50KXt2YXIgYz1iLm9yaWdpbmFsU2VsZWN0MkV2ZW50O2lmKFwic2VsZWN0XCI9PT1jLl90eXBlfHxcInVuc2VsZWN0XCI9PT1jLl90eXBlKXJldHVybn12YXIgZD10aGlzLmdldEhpZ2hsaWdodGVkUmVzdWx0cygpO2lmKCEoZC5sZW5ndGg8MSkpe3ZhciBlPWQuZGF0YShcImRhdGFcIik7bnVsbCE9ZS5lbGVtZW50JiZlLmVsZW1lbnQuc2VsZWN0ZWR8fG51bGw9PWUuZWxlbWVudCYmZS5zZWxlY3RlZHx8dGhpcy50cmlnZ2VyKFwic2VsZWN0XCIse2RhdGE6ZX0pfX0sYX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kcm9wZG93bi9jbG9zZU9uU2VsZWN0XCIsW10sZnVuY3Rpb24oKXtmdW5jdGlvbiBhKCl7fXJldHVybiBhLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGEsYixjKXt2YXIgZD10aGlzO2EuY2FsbCh0aGlzLGIsYyksYi5vbihcInNlbGVjdFwiLGZ1bmN0aW9uKGEpe2QuX3NlbGVjdFRyaWdnZXJlZChhKX0pLGIub24oXCJ1bnNlbGVjdFwiLGZ1bmN0aW9uKGEpe2QuX3NlbGVjdFRyaWdnZXJlZChhKX0pfSxhLnByb3RvdHlwZS5fc2VsZWN0VHJpZ2dlcmVkPWZ1bmN0aW9uKGEsYil7dmFyIGM9Yi5vcmlnaW5hbEV2ZW50O2MmJmMuY3RybEtleXx8dGhpcy50cmlnZ2VyKFwiY2xvc2VcIix7b3JpZ2luYWxFdmVudDpjLG9yaWdpbmFsU2VsZWN0MkV2ZW50OmJ9KX0sYX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9pMThuL2VuXCIsW10sZnVuY3Rpb24oKXtyZXR1cm57ZXJyb3JMb2FkaW5nOmZ1bmN0aW9uKCl7cmV0dXJuXCJUaGUgcmVzdWx0cyBjb3VsZCBub3QgYmUgbG9hZGVkLlwifSxpbnB1dFRvb0xvbmc6ZnVuY3Rpb24oYSl7dmFyIGI9YS5pbnB1dC5sZW5ndGgtYS5tYXhpbXVtLGM9XCJQbGVhc2UgZGVsZXRlIFwiK2IrXCIgY2hhcmFjdGVyXCI7cmV0dXJuIDEhPWImJihjKz1cInNcIiksY30saW5wdXRUb29TaG9ydDpmdW5jdGlvbihhKXt2YXIgYj1hLm1pbmltdW0tYS5pbnB1dC5sZW5ndGgsYz1cIlBsZWFzZSBlbnRlciBcIitiK1wiIG9yIG1vcmUgY2hhcmFjdGVyc1wiO3JldHVybiBjfSxsb2FkaW5nTW9yZTpmdW5jdGlvbigpe3JldHVyblwiTG9hZGluZyBtb3JlIHJlc3VsdHPigKZcIn0sbWF4aW11bVNlbGVjdGVkOmZ1bmN0aW9uKGEpe3ZhciBiPVwiWW91IGNhbiBvbmx5IHNlbGVjdCBcIithLm1heGltdW0rXCIgaXRlbVwiO3JldHVybiAxIT1hLm1heGltdW0mJihiKz1cInNcIiksYn0sbm9SZXN1bHRzOmZ1bmN0aW9uKCl7cmV0dXJuXCJObyByZXN1bHRzIGZvdW5kXCJ9LHNlYXJjaGluZzpmdW5jdGlvbigpe3JldHVyblwiU2VhcmNoaW5n4oCmXCJ9fX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kZWZhdWx0c1wiLFtcImpxdWVyeVwiLFwicmVxdWlyZVwiLFwiLi9yZXN1bHRzXCIsXCIuL3NlbGVjdGlvbi9zaW5nbGVcIixcIi4vc2VsZWN0aW9uL211bHRpcGxlXCIsXCIuL3NlbGVjdGlvbi9wbGFjZWhvbGRlclwiLFwiLi9zZWxlY3Rpb24vYWxsb3dDbGVhclwiLFwiLi9zZWxlY3Rpb24vc2VhcmNoXCIsXCIuL3NlbGVjdGlvbi9ldmVudFJlbGF5XCIsXCIuL3V0aWxzXCIsXCIuL3RyYW5zbGF0aW9uXCIsXCIuL2RpYWNyaXRpY3NcIixcIi4vZGF0YS9zZWxlY3RcIixcIi4vZGF0YS9hcnJheVwiLFwiLi9kYXRhL2FqYXhcIixcIi4vZGF0YS90YWdzXCIsXCIuL2RhdGEvdG9rZW5pemVyXCIsXCIuL2RhdGEvbWluaW11bUlucHV0TGVuZ3RoXCIsXCIuL2RhdGEvbWF4aW11bUlucHV0TGVuZ3RoXCIsXCIuL2RhdGEvbWF4aW11bVNlbGVjdGlvbkxlbmd0aFwiLFwiLi9kcm9wZG93blwiLFwiLi9kcm9wZG93bi9zZWFyY2hcIixcIi4vZHJvcGRvd24vaGlkZVBsYWNlaG9sZGVyXCIsXCIuL2Ryb3Bkb3duL2luZmluaXRlU2Nyb2xsXCIsXCIuL2Ryb3Bkb3duL2F0dGFjaEJvZHlcIixcIi4vZHJvcGRvd24vbWluaW11bVJlc3VsdHNGb3JTZWFyY2hcIixcIi4vZHJvcGRvd24vc2VsZWN0T25DbG9zZVwiLFwiLi9kcm9wZG93bi9jbG9zZU9uU2VsZWN0XCIsXCIuL2kxOG4vZW5cIl0sZnVuY3Rpb24oYSxiLGMsZCxlLGYsZyxoLGksaixrLGwsbSxuLG8scCxxLHIscyx0LHUsdix3LHgseSx6LEEsQixDKXtmdW5jdGlvbiBEKCl7dGhpcy5yZXNldCgpfUQucHJvdG90eXBlLmFwcGx5PWZ1bmN0aW9uKGwpe2lmKGw9YS5leHRlbmQoITAse30sdGhpcy5kZWZhdWx0cyxsKSxudWxsPT1sLmRhdGFBZGFwdGVyKXtpZihudWxsIT1sLmFqYXg/bC5kYXRhQWRhcHRlcj1vOm51bGwhPWwuZGF0YT9sLmRhdGFBZGFwdGVyPW46bC5kYXRhQWRhcHRlcj1tLGwubWluaW11bUlucHV0TGVuZ3RoPjAmJihsLmRhdGFBZGFwdGVyPWouRGVjb3JhdGUobC5kYXRhQWRhcHRlcixyKSksbC5tYXhpbXVtSW5wdXRMZW5ndGg+MCYmKGwuZGF0YUFkYXB0ZXI9ai5EZWNvcmF0ZShsLmRhdGFBZGFwdGVyLHMpKSxsLm1heGltdW1TZWxlY3Rpb25MZW5ndGg+MCYmKGwuZGF0YUFkYXB0ZXI9ai5EZWNvcmF0ZShsLmRhdGFBZGFwdGVyLHQpKSxsLnRhZ3MmJihsLmRhdGFBZGFwdGVyPWouRGVjb3JhdGUobC5kYXRhQWRhcHRlcixwKSksKG51bGwhPWwudG9rZW5TZXBhcmF0b3JzfHxudWxsIT1sLnRva2VuaXplcikmJihsLmRhdGFBZGFwdGVyPWouRGVjb3JhdGUobC5kYXRhQWRhcHRlcixxKSksbnVsbCE9bC5xdWVyeSl7dmFyIEM9YihsLmFtZEJhc2UrXCJjb21wYXQvcXVlcnlcIik7bC5kYXRhQWRhcHRlcj1qLkRlY29yYXRlKGwuZGF0YUFkYXB0ZXIsQyl9aWYobnVsbCE9bC5pbml0U2VsZWN0aW9uKXt2YXIgRD1iKGwuYW1kQmFzZStcImNvbXBhdC9pbml0U2VsZWN0aW9uXCIpO2wuZGF0YUFkYXB0ZXI9ai5EZWNvcmF0ZShsLmRhdGFBZGFwdGVyLEQpfX1pZihudWxsPT1sLnJlc3VsdHNBZGFwdGVyJiYobC5yZXN1bHRzQWRhcHRlcj1jLG51bGwhPWwuYWpheCYmKGwucmVzdWx0c0FkYXB0ZXI9ai5EZWNvcmF0ZShsLnJlc3VsdHNBZGFwdGVyLHgpKSxudWxsIT1sLnBsYWNlaG9sZGVyJiYobC5yZXN1bHRzQWRhcHRlcj1qLkRlY29yYXRlKGwucmVzdWx0c0FkYXB0ZXIsdykpLGwuc2VsZWN0T25DbG9zZSYmKGwucmVzdWx0c0FkYXB0ZXI9ai5EZWNvcmF0ZShsLnJlc3VsdHNBZGFwdGVyLEEpKSksbnVsbD09bC5kcm9wZG93bkFkYXB0ZXIpe2lmKGwubXVsdGlwbGUpbC5kcm9wZG93bkFkYXB0ZXI9dTtlbHNle3ZhciBFPWouRGVjb3JhdGUodSx2KTtsLmRyb3Bkb3duQWRhcHRlcj1FfWlmKDAhPT1sLm1pbmltdW1SZXN1bHRzRm9yU2VhcmNoJiYobC5kcm9wZG93bkFkYXB0ZXI9ai5EZWNvcmF0ZShsLmRyb3Bkb3duQWRhcHRlcix6KSksbC5jbG9zZU9uU2VsZWN0JiYobC5kcm9wZG93bkFkYXB0ZXI9ai5EZWNvcmF0ZShsLmRyb3Bkb3duQWRhcHRlcixCKSksbnVsbCE9bC5kcm9wZG93bkNzc0NsYXNzfHxudWxsIT1sLmRyb3Bkb3duQ3NzfHxudWxsIT1sLmFkYXB0RHJvcGRvd25Dc3NDbGFzcyl7dmFyIEY9YihsLmFtZEJhc2UrXCJjb21wYXQvZHJvcGRvd25Dc3NcIik7bC5kcm9wZG93bkFkYXB0ZXI9ai5EZWNvcmF0ZShsLmRyb3Bkb3duQWRhcHRlcixGKX1sLmRyb3Bkb3duQWRhcHRlcj1qLkRlY29yYXRlKGwuZHJvcGRvd25BZGFwdGVyLHkpfWlmKG51bGw9PWwuc2VsZWN0aW9uQWRhcHRlcil7aWYobC5tdWx0aXBsZT9sLnNlbGVjdGlvbkFkYXB0ZXI9ZTpsLnNlbGVjdGlvbkFkYXB0ZXI9ZCxudWxsIT1sLnBsYWNlaG9sZGVyJiYobC5zZWxlY3Rpb25BZGFwdGVyPWouRGVjb3JhdGUobC5zZWxlY3Rpb25BZGFwdGVyLGYpKSxsLmFsbG93Q2xlYXImJihsLnNlbGVjdGlvbkFkYXB0ZXI9ai5EZWNvcmF0ZShsLnNlbGVjdGlvbkFkYXB0ZXIsZykpLGwubXVsdGlwbGUmJihsLnNlbGVjdGlvbkFkYXB0ZXI9ai5EZWNvcmF0ZShsLnNlbGVjdGlvbkFkYXB0ZXIsaCkpLG51bGwhPWwuY29udGFpbmVyQ3NzQ2xhc3N8fG51bGwhPWwuY29udGFpbmVyQ3NzfHxudWxsIT1sLmFkYXB0Q29udGFpbmVyQ3NzQ2xhc3Mpe3ZhciBHPWIobC5hbWRCYXNlK1wiY29tcGF0L2NvbnRhaW5lckNzc1wiKTtsLnNlbGVjdGlvbkFkYXB0ZXI9ai5EZWNvcmF0ZShsLnNlbGVjdGlvbkFkYXB0ZXIsRyl9bC5zZWxlY3Rpb25BZGFwdGVyPWouRGVjb3JhdGUobC5zZWxlY3Rpb25BZGFwdGVyLGkpfWlmKFwic3RyaW5nXCI9PXR5cGVvZiBsLmxhbmd1YWdlKWlmKGwubGFuZ3VhZ2UuaW5kZXhPZihcIi1cIik+MCl7dmFyIEg9bC5sYW5ndWFnZS5zcGxpdChcIi1cIiksST1IWzBdO2wubGFuZ3VhZ2U9W2wubGFuZ3VhZ2UsSV19ZWxzZSBsLmxhbmd1YWdlPVtsLmxhbmd1YWdlXTtpZihhLmlzQXJyYXkobC5sYW5ndWFnZSkpe3ZhciBKPW5ldyBrO2wubGFuZ3VhZ2UucHVzaChcImVuXCIpO2Zvcih2YXIgSz1sLmxhbmd1YWdlLEw9MDtMPEsubGVuZ3RoO0wrKyl7dmFyIE09S1tMXSxOPXt9O3RyeXtOPWsubG9hZFBhdGgoTSl9Y2F0Y2goTyl7dHJ5e009dGhpcy5kZWZhdWx0cy5hbWRMYW5ndWFnZUJhc2UrTSxOPWsubG9hZFBhdGgoTSl9Y2F0Y2goUCl7bC5kZWJ1ZyYmd2luZG93LmNvbnNvbGUmJmNvbnNvbGUud2FybiYmY29uc29sZS53YXJuKCdTZWxlY3QyOiBUaGUgbGFuZ3VhZ2UgZmlsZSBmb3IgXCInK00rJ1wiIGNvdWxkIG5vdCBiZSBhdXRvbWF0aWNhbGx5IGxvYWRlZC4gQSBmYWxsYmFjayB3aWxsIGJlIHVzZWQgaW5zdGVhZC4nKTtjb250aW51ZX19Si5leHRlbmQoTil9bC50cmFuc2xhdGlvbnM9Sn1lbHNle3ZhciBRPWsubG9hZFBhdGgodGhpcy5kZWZhdWx0cy5hbWRMYW5ndWFnZUJhc2UrXCJlblwiKSxSPW5ldyBrKGwubGFuZ3VhZ2UpO1IuZXh0ZW5kKFEpLGwudHJhbnNsYXRpb25zPVJ9cmV0dXJuIGx9LEQucHJvdG90eXBlLnJlc2V0PWZ1bmN0aW9uKCl7ZnVuY3Rpb24gYihhKXtmdW5jdGlvbiBiKGEpe3JldHVybiBsW2FdfHxhfXJldHVybiBhLnJlcGxhY2UoL1teXFx1MDAwMC1cXHUwMDdFXS9nLGIpfWZ1bmN0aW9uIGMoZCxlKXtpZihcIlwiPT09YS50cmltKGQudGVybSkpcmV0dXJuIGU7aWYoZS5jaGlsZHJlbiYmZS5jaGlsZHJlbi5sZW5ndGg+MCl7Zm9yKHZhciBmPWEuZXh0ZW5kKCEwLHt9LGUpLGc9ZS5jaGlsZHJlbi5sZW5ndGgtMTtnPj0wO2ctLSl7dmFyIGg9ZS5jaGlsZHJlbltnXSxpPWMoZCxoKTtudWxsPT1pJiZmLmNoaWxkcmVuLnNwbGljZShnLDEpfXJldHVybiBmLmNoaWxkcmVuLmxlbmd0aD4wP2Y6YyhkLGYpfXZhciBqPWIoZS50ZXh0KS50b1VwcGVyQ2FzZSgpLGs9YihkLnRlcm0pLnRvVXBwZXJDYXNlKCk7cmV0dXJuIGouaW5kZXhPZihrKT4tMT9lOm51bGx9dGhpcy5kZWZhdWx0cz17YW1kQmFzZTpcIi4vXCIsYW1kTGFuZ3VhZ2VCYXNlOlwiLi9pMThuL1wiLGNsb3NlT25TZWxlY3Q6ITAsZGVidWc6ITEsZHJvcGRvd25BdXRvV2lkdGg6ITEsZXNjYXBlTWFya3VwOmouZXNjYXBlTWFya3VwLGxhbmd1YWdlOkMsbWF0Y2hlcjpjLG1pbmltdW1JbnB1dExlbmd0aDowLG1heGltdW1JbnB1dExlbmd0aDowLG1heGltdW1TZWxlY3Rpb25MZW5ndGg6MCxtaW5pbXVtUmVzdWx0c0ZvclNlYXJjaDowLHNlbGVjdE9uQ2xvc2U6ITEsc29ydGVyOmZ1bmN0aW9uKGEpe3JldHVybiBhfSx0ZW1wbGF0ZVJlc3VsdDpmdW5jdGlvbihhKXtyZXR1cm4gYS50ZXh0fSx0ZW1wbGF0ZVNlbGVjdGlvbjpmdW5jdGlvbihhKXtyZXR1cm4gYS50ZXh0fSx0aGVtZTpcImRlZmF1bHRcIix3aWR0aDpcInJlc29sdmVcIn19LEQucHJvdG90eXBlLnNldD1mdW5jdGlvbihiLGMpe3ZhciBkPWEuY2FtZWxDYXNlKGIpLGU9e307ZVtkXT1jO3ZhciBmPWouX2NvbnZlcnREYXRhKGUpO2EuZXh0ZW5kKHRoaXMuZGVmYXVsdHMsZil9O3ZhciBFPW5ldyBEO3JldHVybiBFfSksYi5kZWZpbmUoXCJzZWxlY3QyL29wdGlvbnNcIixbXCJyZXF1aXJlXCIsXCJqcXVlcnlcIixcIi4vZGVmYXVsdHNcIixcIi4vdXRpbHNcIl0sZnVuY3Rpb24oYSxiLGMsZCl7ZnVuY3Rpb24gZShiLGUpe2lmKHRoaXMub3B0aW9ucz1iLG51bGwhPWUmJnRoaXMuZnJvbUVsZW1lbnQoZSksdGhpcy5vcHRpb25zPWMuYXBwbHkodGhpcy5vcHRpb25zKSxlJiZlLmlzKFwiaW5wdXRcIikpe3ZhciBmPWEodGhpcy5nZXQoXCJhbWRCYXNlXCIpK1wiY29tcGF0L2lucHV0RGF0YVwiKTt0aGlzLm9wdGlvbnMuZGF0YUFkYXB0ZXI9ZC5EZWNvcmF0ZSh0aGlzLm9wdGlvbnMuZGF0YUFkYXB0ZXIsZil9fXJldHVybiBlLnByb3RvdHlwZS5mcm9tRWxlbWVudD1mdW5jdGlvbihhKXt2YXIgYz1bXCJzZWxlY3QyXCJdO251bGw9PXRoaXMub3B0aW9ucy5tdWx0aXBsZSYmKHRoaXMub3B0aW9ucy5tdWx0aXBsZT1hLnByb3AoXCJtdWx0aXBsZVwiKSksbnVsbD09dGhpcy5vcHRpb25zLmRpc2FibGVkJiYodGhpcy5vcHRpb25zLmRpc2FibGVkPWEucHJvcChcImRpc2FibGVkXCIpKSxudWxsPT10aGlzLm9wdGlvbnMubGFuZ3VhZ2UmJihhLnByb3AoXCJsYW5nXCIpP3RoaXMub3B0aW9ucy5sYW5ndWFnZT1hLnByb3AoXCJsYW5nXCIpLnRvTG93ZXJDYXNlKCk6YS5jbG9zZXN0KFwiW2xhbmddXCIpLnByb3AoXCJsYW5nXCIpJiYodGhpcy5vcHRpb25zLmxhbmd1YWdlPWEuY2xvc2VzdChcIltsYW5nXVwiKS5wcm9wKFwibGFuZ1wiKSkpLG51bGw9PXRoaXMub3B0aW9ucy5kaXImJihhLnByb3AoXCJkaXJcIik/dGhpcy5vcHRpb25zLmRpcj1hLnByb3AoXCJkaXJcIik6YS5jbG9zZXN0KFwiW2Rpcl1cIikucHJvcChcImRpclwiKT90aGlzLm9wdGlvbnMuZGlyPWEuY2xvc2VzdChcIltkaXJdXCIpLnByb3AoXCJkaXJcIik6dGhpcy5vcHRpb25zLmRpcj1cImx0clwiKSxhLnByb3AoXCJkaXNhYmxlZFwiLHRoaXMub3B0aW9ucy5kaXNhYmxlZCksYS5wcm9wKFwibXVsdGlwbGVcIix0aGlzLm9wdGlvbnMubXVsdGlwbGUpLGEuZGF0YShcInNlbGVjdDJUYWdzXCIpJiYodGhpcy5vcHRpb25zLmRlYnVnJiZ3aW5kb3cuY29uc29sZSYmY29uc29sZS53YXJuJiZjb25zb2xlLndhcm4oJ1NlbGVjdDI6IFRoZSBgZGF0YS1zZWxlY3QyLXRhZ3NgIGF0dHJpYnV0ZSBoYXMgYmVlbiBjaGFuZ2VkIHRvIHVzZSB0aGUgYGRhdGEtZGF0YWAgYW5kIGBkYXRhLXRhZ3M9XCJ0cnVlXCJgIGF0dHJpYnV0ZXMgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiBmdXR1cmUgdmVyc2lvbnMgb2YgU2VsZWN0Mi4nKSxhLmRhdGEoXCJkYXRhXCIsYS5kYXRhKFwic2VsZWN0MlRhZ3NcIikpLGEuZGF0YShcInRhZ3NcIiwhMCkpLGEuZGF0YShcImFqYXhVcmxcIikmJih0aGlzLm9wdGlvbnMuZGVidWcmJndpbmRvdy5jb25zb2xlJiZjb25zb2xlLndhcm4mJmNvbnNvbGUud2FybihcIlNlbGVjdDI6IFRoZSBgZGF0YS1hamF4LXVybGAgYXR0cmlidXRlIGhhcyBiZWVuIGNoYW5nZWQgdG8gYGRhdGEtYWpheC0tdXJsYCBhbmQgc3VwcG9ydCBmb3IgdGhlIG9sZCBhdHRyaWJ1dGUgd2lsbCBiZSByZW1vdmVkIGluIGZ1dHVyZSB2ZXJzaW9ucyBvZiBTZWxlY3QyLlwiKSxhLmF0dHIoXCJhamF4LS11cmxcIixhLmRhdGEoXCJhamF4VXJsXCIpKSxhLmRhdGEoXCJhamF4LS11cmxcIixhLmRhdGEoXCJhamF4VXJsXCIpKSk7dmFyIGU9e307ZT1iLmZuLmpxdWVyeSYmXCIxLlwiPT1iLmZuLmpxdWVyeS5zdWJzdHIoMCwyKSYmYVswXS5kYXRhc2V0P2IuZXh0ZW5kKCEwLHt9LGFbMF0uZGF0YXNldCxhLmRhdGEoKSk6YS5kYXRhKCk7dmFyIGY9Yi5leHRlbmQoITAse30sZSk7Zj1kLl9jb252ZXJ0RGF0YShmKTtmb3IodmFyIGcgaW4gZiliLmluQXJyYXkoZyxjKT4tMXx8KGIuaXNQbGFpbk9iamVjdCh0aGlzLm9wdGlvbnNbZ10pP2IuZXh0ZW5kKHRoaXMub3B0aW9uc1tnXSxmW2ddKTp0aGlzLm9wdGlvbnNbZ109ZltnXSk7cmV0dXJuIHRoaXN9LGUucHJvdG90eXBlLmdldD1mdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5vcHRpb25zW2FdfSxlLnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24oYSxiKXt0aGlzLm9wdGlvbnNbYV09Yn0sZX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9jb3JlXCIsW1wianF1ZXJ5XCIsXCIuL29wdGlvbnNcIixcIi4vdXRpbHNcIixcIi4va2V5c1wiXSxmdW5jdGlvbihhLGIsYyxkKXt2YXIgZT1mdW5jdGlvbihhLGMpe251bGwhPWEuZGF0YShcInNlbGVjdDJcIikmJmEuZGF0YShcInNlbGVjdDJcIikuZGVzdHJveSgpLHRoaXMuJGVsZW1lbnQ9YSx0aGlzLmlkPXRoaXMuX2dlbmVyYXRlSWQoYSksYz1jfHx7fSx0aGlzLm9wdGlvbnM9bmV3IGIoYyxhKSxlLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMpO3ZhciBkPWEuYXR0cihcInRhYmluZGV4XCIpfHwwO2EuZGF0YShcIm9sZC10YWJpbmRleFwiLGQpLGEuYXR0cihcInRhYmluZGV4XCIsXCItMVwiKTt2YXIgZj10aGlzLm9wdGlvbnMuZ2V0KFwiZGF0YUFkYXB0ZXJcIik7dGhpcy5kYXRhQWRhcHRlcj1uZXcgZihhLHRoaXMub3B0aW9ucyk7dmFyIGc9dGhpcy5yZW5kZXIoKTt0aGlzLl9wbGFjZUNvbnRhaW5lcihnKTt2YXIgaD10aGlzLm9wdGlvbnMuZ2V0KFwic2VsZWN0aW9uQWRhcHRlclwiKTt0aGlzLnNlbGVjdGlvbj1uZXcgaChhLHRoaXMub3B0aW9ucyksdGhpcy4kc2VsZWN0aW9uPXRoaXMuc2VsZWN0aW9uLnJlbmRlcigpLHRoaXMuc2VsZWN0aW9uLnBvc2l0aW9uKHRoaXMuJHNlbGVjdGlvbixnKTt2YXIgaT10aGlzLm9wdGlvbnMuZ2V0KFwiZHJvcGRvd25BZGFwdGVyXCIpO3RoaXMuZHJvcGRvd249bmV3IGkoYSx0aGlzLm9wdGlvbnMpLHRoaXMuJGRyb3Bkb3duPXRoaXMuZHJvcGRvd24ucmVuZGVyKCksdGhpcy5kcm9wZG93bi5wb3NpdGlvbih0aGlzLiRkcm9wZG93bixnKTt2YXIgaj10aGlzLm9wdGlvbnMuZ2V0KFwicmVzdWx0c0FkYXB0ZXJcIik7dGhpcy5yZXN1bHRzPW5ldyBqKGEsdGhpcy5vcHRpb25zLHRoaXMuZGF0YUFkYXB0ZXIpLHRoaXMuJHJlc3VsdHM9dGhpcy5yZXN1bHRzLnJlbmRlcigpLHRoaXMucmVzdWx0cy5wb3NpdGlvbih0aGlzLiRyZXN1bHRzLHRoaXMuJGRyb3Bkb3duKTt2YXIgaz10aGlzO3RoaXMuX2JpbmRBZGFwdGVycygpLHRoaXMuX3JlZ2lzdGVyRG9tRXZlbnRzKCksdGhpcy5fcmVnaXN0ZXJEYXRhRXZlbnRzKCksdGhpcy5fcmVnaXN0ZXJTZWxlY3Rpb25FdmVudHMoKSx0aGlzLl9yZWdpc3RlckRyb3Bkb3duRXZlbnRzKCksdGhpcy5fcmVnaXN0ZXJSZXN1bHRzRXZlbnRzKCksdGhpcy5fcmVnaXN0ZXJFdmVudHMoKSx0aGlzLmRhdGFBZGFwdGVyLmN1cnJlbnQoZnVuY3Rpb24oYSl7ay50cmlnZ2VyKFwic2VsZWN0aW9uOnVwZGF0ZVwiLHtkYXRhOmF9KX0pLGEuYWRkQ2xhc3MoXCJzZWxlY3QyLWhpZGRlbi1hY2Nlc3NpYmxlXCIpLGEuYXR0cihcImFyaWEtaGlkZGVuXCIsXCJ0cnVlXCIpLHRoaXMuX3N5bmNBdHRyaWJ1dGVzKCksYS5kYXRhKFwic2VsZWN0MlwiLHRoaXMpfTtyZXR1cm4gYy5FeHRlbmQoZSxjLk9ic2VydmFibGUpLGUucHJvdG90eXBlLl9nZW5lcmF0ZUlkPWZ1bmN0aW9uKGEpe3ZhciBiPVwiXCI7cmV0dXJuIGI9bnVsbCE9YS5hdHRyKFwiaWRcIik/YS5hdHRyKFwiaWRcIik6bnVsbCE9YS5hdHRyKFwibmFtZVwiKT9hLmF0dHIoXCJuYW1lXCIpK1wiLVwiK2MuZ2VuZXJhdGVDaGFycygyKTpjLmdlbmVyYXRlQ2hhcnMoNCksYj1iLnJlcGxhY2UoLyg6fFxcLnxcXFt8XFxdfCwpL2csXCJcIiksYj1cInNlbGVjdDItXCIrYn0sZS5wcm90b3R5cGUuX3BsYWNlQ29udGFpbmVyPWZ1bmN0aW9uKGEpe2EuaW5zZXJ0QWZ0ZXIodGhpcy4kZWxlbWVudCk7dmFyIGI9dGhpcy5fcmVzb2x2ZVdpZHRoKHRoaXMuJGVsZW1lbnQsdGhpcy5vcHRpb25zLmdldChcIndpZHRoXCIpKTtudWxsIT1iJiZhLmNzcyhcIndpZHRoXCIsYil9LGUucHJvdG90eXBlLl9yZXNvbHZlV2lkdGg9ZnVuY3Rpb24oYSxiKXt2YXIgYz0vXndpZHRoOigoWy0rXT8oWzAtOV0qXFwuKT9bMC05XSspKHB4fGVtfGV4fCV8aW58Y218bW18cHR8cGMpKS9pO2lmKFwicmVzb2x2ZVwiPT1iKXt2YXIgZD10aGlzLl9yZXNvbHZlV2lkdGgoYSxcInN0eWxlXCIpO3JldHVybiBudWxsIT1kP2Q6dGhpcy5fcmVzb2x2ZVdpZHRoKGEsXCJlbGVtZW50XCIpfWlmKFwiZWxlbWVudFwiPT1iKXt2YXIgZT1hLm91dGVyV2lkdGgoITEpO3JldHVybiAwPj1lP1wiYXV0b1wiOmUrXCJweFwifWlmKFwic3R5bGVcIj09Yil7dmFyIGY9YS5hdHRyKFwic3R5bGVcIik7aWYoXCJzdHJpbmdcIiE9dHlwZW9mIGYpcmV0dXJuIG51bGw7Zm9yKHZhciBnPWYuc3BsaXQoXCI7XCIpLGg9MCxpPWcubGVuZ3RoO2k+aDtoKz0xKXt2YXIgaj1nW2hdLnJlcGxhY2UoL1xccy9nLFwiXCIpLGs9ai5tYXRjaChjKTtpZihudWxsIT09ayYmay5sZW5ndGg+PTEpcmV0dXJuIGtbMV19cmV0dXJuIG51bGx9cmV0dXJuIGJ9LGUucHJvdG90eXBlLl9iaW5kQWRhcHRlcnM9ZnVuY3Rpb24oKXt0aGlzLmRhdGFBZGFwdGVyLmJpbmQodGhpcyx0aGlzLiRjb250YWluZXIpLHRoaXMuc2VsZWN0aW9uLmJpbmQodGhpcyx0aGlzLiRjb250YWluZXIpLHRoaXMuZHJvcGRvd24uYmluZCh0aGlzLHRoaXMuJGNvbnRhaW5lciksdGhpcy5yZXN1bHRzLmJpbmQodGhpcyx0aGlzLiRjb250YWluZXIpfSxlLnByb3RvdHlwZS5fcmVnaXN0ZXJEb21FdmVudHM9ZnVuY3Rpb24oKXt2YXIgYj10aGlzO3RoaXMuJGVsZW1lbnQub24oXCJjaGFuZ2Uuc2VsZWN0MlwiLGZ1bmN0aW9uKCl7Yi5kYXRhQWRhcHRlci5jdXJyZW50KGZ1bmN0aW9uKGEpe2IudHJpZ2dlcihcInNlbGVjdGlvbjp1cGRhdGVcIix7ZGF0YTphfSl9KX0pLHRoaXMuJGVsZW1lbnQub24oXCJmb2N1cy5zZWxlY3QyXCIsZnVuY3Rpb24oYSl7Yi50cmlnZ2VyKFwiZm9jdXNcIixhKX0pLHRoaXMuX3N5bmNBPWMuYmluZCh0aGlzLl9zeW5jQXR0cmlidXRlcyx0aGlzKSx0aGlzLl9zeW5jUz1jLmJpbmQodGhpcy5fc3luY1N1YnRyZWUsdGhpcyksdGhpcy4kZWxlbWVudFswXS5hdHRhY2hFdmVudCYmdGhpcy4kZWxlbWVudFswXS5hdHRhY2hFdmVudChcIm9ucHJvcGVydHljaGFuZ2VcIix0aGlzLl9zeW5jQSk7dmFyIGQ9d2luZG93Lk11dGF0aW9uT2JzZXJ2ZXJ8fHdpbmRvdy5XZWJLaXRNdXRhdGlvbk9ic2VydmVyfHx3aW5kb3cuTW96TXV0YXRpb25PYnNlcnZlcjtudWxsIT1kPyh0aGlzLl9vYnNlcnZlcj1uZXcgZChmdW5jdGlvbihjKXthLmVhY2goYyxiLl9zeW5jQSksYS5lYWNoKGMsYi5fc3luY1MpfSksdGhpcy5fb2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzLiRlbGVtZW50WzBdLHthdHRyaWJ1dGVzOiEwLGNoaWxkTGlzdDohMCxzdWJ0cmVlOiExfSkpOnRoaXMuJGVsZW1lbnRbMF0uYWRkRXZlbnRMaXN0ZW5lciYmKHRoaXMuJGVsZW1lbnRbMF0uYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUF0dHJNb2RpZmllZFwiLGIuX3N5bmNBLCExKSx0aGlzLiRlbGVtZW50WzBdLmFkZEV2ZW50TGlzdGVuZXIoXCJET01Ob2RlSW5zZXJ0ZWRcIixiLl9zeW5jUywhMSksdGhpcy4kZWxlbWVudFswXS5hZGRFdmVudExpc3RlbmVyKFwiRE9NTm9kZVJlbW92ZWRcIixiLl9zeW5jUywhMSkpfSxlLnByb3RvdHlwZS5fcmVnaXN0ZXJEYXRhRXZlbnRzPWZ1bmN0aW9uKCl7dmFyIGE9dGhpczt0aGlzLmRhdGFBZGFwdGVyLm9uKFwiKlwiLGZ1bmN0aW9uKGIsYyl7YS50cmlnZ2VyKGIsYyl9KX0sZS5wcm90b3R5cGUuX3JlZ2lzdGVyU2VsZWN0aW9uRXZlbnRzPWZ1bmN0aW9uKCl7dmFyIGI9dGhpcyxjPVtcInRvZ2dsZVwiLFwiZm9jdXNcIl07dGhpcy5zZWxlY3Rpb24ub24oXCJ0b2dnbGVcIixmdW5jdGlvbigpe2IudG9nZ2xlRHJvcGRvd24oKX0pLHRoaXMuc2VsZWN0aW9uLm9uKFwiZm9jdXNcIixmdW5jdGlvbihhKXtiLmZvY3VzKGEpfSksdGhpcy5zZWxlY3Rpb24ub24oXCIqXCIsZnVuY3Rpb24oZCxlKXstMT09PWEuaW5BcnJheShkLGMpJiZiLnRyaWdnZXIoZCxlKX0pfSxlLnByb3RvdHlwZS5fcmVnaXN0ZXJEcm9wZG93bkV2ZW50cz1mdW5jdGlvbigpe3ZhciBhPXRoaXM7dGhpcy5kcm9wZG93bi5vbihcIipcIixmdW5jdGlvbihiLGMpe2EudHJpZ2dlcihiLGMpfSl9LGUucHJvdG90eXBlLl9yZWdpc3RlclJlc3VsdHNFdmVudHM9ZnVuY3Rpb24oKXt2YXIgYT10aGlzO3RoaXMucmVzdWx0cy5vbihcIipcIixmdW5jdGlvbihiLGMpe2EudHJpZ2dlcihiLGMpfSl9LGUucHJvdG90eXBlLl9yZWdpc3RlckV2ZW50cz1mdW5jdGlvbigpe3ZhciBhPXRoaXM7dGhpcy5vbihcIm9wZW5cIixmdW5jdGlvbigpe2EuJGNvbnRhaW5lci5hZGRDbGFzcyhcInNlbGVjdDItY29udGFpbmVyLS1vcGVuXCIpfSksdGhpcy5vbihcImNsb3NlXCIsZnVuY3Rpb24oKXthLiRjb250YWluZXIucmVtb3ZlQ2xhc3MoXCJzZWxlY3QyLWNvbnRhaW5lci0tb3BlblwiKX0pLHRoaXMub24oXCJlbmFibGVcIixmdW5jdGlvbigpe2EuJGNvbnRhaW5lci5yZW1vdmVDbGFzcyhcInNlbGVjdDItY29udGFpbmVyLS1kaXNhYmxlZFwiKX0pLHRoaXMub24oXCJkaXNhYmxlXCIsZnVuY3Rpb24oKXthLiRjb250YWluZXIuYWRkQ2xhc3MoXCJzZWxlY3QyLWNvbnRhaW5lci0tZGlzYWJsZWRcIil9KSx0aGlzLm9uKFwiYmx1clwiLGZ1bmN0aW9uKCl7YS4kY29udGFpbmVyLnJlbW92ZUNsYXNzKFwic2VsZWN0Mi1jb250YWluZXItLWZvY3VzXCIpfSksdGhpcy5vbihcInF1ZXJ5XCIsZnVuY3Rpb24oYil7YS5pc09wZW4oKXx8YS50cmlnZ2VyKFwib3BlblwiLHt9KSx0aGlzLmRhdGFBZGFwdGVyLnF1ZXJ5KGIsZnVuY3Rpb24oYyl7YS50cmlnZ2VyKFwicmVzdWx0czphbGxcIix7ZGF0YTpjLHF1ZXJ5OmJ9KX0pfSksdGhpcy5vbihcInF1ZXJ5OmFwcGVuZFwiLGZ1bmN0aW9uKGIpe3RoaXMuZGF0YUFkYXB0ZXIucXVlcnkoYixmdW5jdGlvbihjKXthLnRyaWdnZXIoXCJyZXN1bHRzOmFwcGVuZFwiLHtkYXRhOmMscXVlcnk6Yn0pfSl9KSx0aGlzLm9uKFwia2V5cHJlc3NcIixmdW5jdGlvbihiKXt2YXIgYz1iLndoaWNoO2EuaXNPcGVuKCk/Yz09PWQuRVNDfHxjPT09ZC5UQUJ8fGM9PT1kLlVQJiZiLmFsdEtleT8oYS5jbG9zZSgpLGIucHJldmVudERlZmF1bHQoKSk6Yz09PWQuRU5URVI/KGEudHJpZ2dlcihcInJlc3VsdHM6c2VsZWN0XCIse30pLGIucHJldmVudERlZmF1bHQoKSk6Yz09PWQuU1BBQ0UmJmIuY3RybEtleT8oYS50cmlnZ2VyKFwicmVzdWx0czp0b2dnbGVcIix7fSksYi5wcmV2ZW50RGVmYXVsdCgpKTpjPT09ZC5VUD8oYS50cmlnZ2VyKFwicmVzdWx0czpwcmV2aW91c1wiLHt9KSxiLnByZXZlbnREZWZhdWx0KCkpOmM9PT1kLkRPV04mJihhLnRyaWdnZXIoXCJyZXN1bHRzOm5leHRcIix7fSksYi5wcmV2ZW50RGVmYXVsdCgpKTooYz09PWQuRU5URVJ8fGM9PT1kLlNQQUNFfHxjPT09ZC5ET1dOJiZiLmFsdEtleSkmJihhLm9wZW4oKSxiLnByZXZlbnREZWZhdWx0KCkpfSl9LGUucHJvdG90eXBlLl9zeW5jQXR0cmlidXRlcz1mdW5jdGlvbigpe3RoaXMub3B0aW9ucy5zZXQoXCJkaXNhYmxlZFwiLHRoaXMuJGVsZW1lbnQucHJvcChcImRpc2FibGVkXCIpKSx0aGlzLm9wdGlvbnMuZ2V0KFwiZGlzYWJsZWRcIik/KHRoaXMuaXNPcGVuKCkmJnRoaXMuY2xvc2UoKSx0aGlzLnRyaWdnZXIoXCJkaXNhYmxlXCIse30pKTp0aGlzLnRyaWdnZXIoXCJlbmFibGVcIix7fSl9LGUucHJvdG90eXBlLl9zeW5jU3VidHJlZT1mdW5jdGlvbihhLGIpe3ZhciBjPSExLGQ9dGhpcztpZighYXx8IWEudGFyZ2V0fHxcIk9QVElPTlwiPT09YS50YXJnZXQubm9kZU5hbWV8fFwiT1BUR1JPVVBcIj09PWEudGFyZ2V0Lm5vZGVOYW1lKXtpZihiKWlmKGIuYWRkZWROb2RlcyYmYi5hZGRlZE5vZGVzLmxlbmd0aD4wKWZvcih2YXIgZT0wO2U8Yi5hZGRlZE5vZGVzLmxlbmd0aDtlKyspe3ZhciBmPWIuYWRkZWROb2Rlc1tlXTtmLnNlbGVjdGVkJiYoYz0hMCl9ZWxzZSBiLnJlbW92ZWROb2RlcyYmYi5yZW1vdmVkTm9kZXMubGVuZ3RoPjAmJihjPSEwKTtlbHNlIGM9ITA7YyYmdGhpcy5kYXRhQWRhcHRlci5jdXJyZW50KGZ1bmN0aW9uKGEpe2QudHJpZ2dlcihcInNlbGVjdGlvbjp1cGRhdGVcIix7ZGF0YTphfSl9KX19LGUucHJvdG90eXBlLnRyaWdnZXI9ZnVuY3Rpb24oYSxiKXt2YXIgYz1lLl9fc3VwZXJfXy50cmlnZ2VyLGQ9e29wZW46XCJvcGVuaW5nXCIsY2xvc2U6XCJjbG9zaW5nXCIsc2VsZWN0Olwic2VsZWN0aW5nXCIsdW5zZWxlY3Q6XCJ1bnNlbGVjdGluZ1wifTtpZih2b2lkIDA9PT1iJiYoYj17fSksYSBpbiBkKXt2YXIgZj1kW2FdLGc9e3ByZXZlbnRlZDohMSxuYW1lOmEsYXJnczpifTtpZihjLmNhbGwodGhpcyxmLGcpLGcucHJldmVudGVkKXJldHVybiB2b2lkKGIucHJldmVudGVkPSEwKX1jLmNhbGwodGhpcyxhLGIpfSxlLnByb3RvdHlwZS50b2dnbGVEcm9wZG93bj1mdW5jdGlvbigpe3RoaXMub3B0aW9ucy5nZXQoXCJkaXNhYmxlZFwiKXx8KHRoaXMuaXNPcGVuKCk/dGhpcy5jbG9zZSgpOnRoaXMub3BlbigpKX0sZS5wcm90b3R5cGUub3Blbj1mdW5jdGlvbigpe3RoaXMuaXNPcGVuKCl8fHRoaXMudHJpZ2dlcihcInF1ZXJ5XCIse30pfSxlLnByb3RvdHlwZS5jbG9zZT1mdW5jdGlvbigpe3RoaXMuaXNPcGVuKCkmJnRoaXMudHJpZ2dlcihcImNsb3NlXCIse30pfSxlLnByb3RvdHlwZS5pc09wZW49ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy4kY29udGFpbmVyLmhhc0NsYXNzKFwic2VsZWN0Mi1jb250YWluZXItLW9wZW5cIil9LGUucHJvdG90eXBlLmhhc0ZvY3VzPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuJGNvbnRhaW5lci5oYXNDbGFzcyhcInNlbGVjdDItY29udGFpbmVyLS1mb2N1c1wiKX0sZS5wcm90b3R5cGUuZm9jdXM9ZnVuY3Rpb24oYSl7dGhpcy5oYXNGb2N1cygpfHwodGhpcy4kY29udGFpbmVyLmFkZENsYXNzKFwic2VsZWN0Mi1jb250YWluZXItLWZvY3VzXCIpLHRoaXMudHJpZ2dlcihcImZvY3VzXCIse30pKX0sZS5wcm90b3R5cGUuZW5hYmxlPWZ1bmN0aW9uKGEpe3RoaXMub3B0aW9ucy5nZXQoXCJkZWJ1Z1wiKSYmd2luZG93LmNvbnNvbGUmJmNvbnNvbGUud2FybiYmY29uc29sZS53YXJuKCdTZWxlY3QyOiBUaGUgYHNlbGVjdDIoXCJlbmFibGVcIilgIG1ldGhvZCBoYXMgYmVlbiBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gbGF0ZXIgU2VsZWN0MiB2ZXJzaW9ucy4gVXNlICRlbGVtZW50LnByb3AoXCJkaXNhYmxlZFwiKSBpbnN0ZWFkLicpLChudWxsPT1hfHwwPT09YS5sZW5ndGgpJiYoYT1bITBdKTt2YXIgYj0hYVswXTt0aGlzLiRlbGVtZW50LnByb3AoXCJkaXNhYmxlZFwiLGIpfSxlLnByb3RvdHlwZS5kYXRhPWZ1bmN0aW9uKCl7dGhpcy5vcHRpb25zLmdldChcImRlYnVnXCIpJiZhcmd1bWVudHMubGVuZ3RoPjAmJndpbmRvdy5jb25zb2xlJiZjb25zb2xlLndhcm4mJmNvbnNvbGUud2FybignU2VsZWN0MjogRGF0YSBjYW4gbm8gbG9uZ2VyIGJlIHNldCB1c2luZyBgc2VsZWN0MihcImRhdGFcIilgLiBZb3Ugc2hvdWxkIGNvbnNpZGVyIHNldHRpbmcgdGhlIHZhbHVlIGluc3RlYWQgdXNpbmcgYCRlbGVtZW50LnZhbCgpYC4nKTt2YXIgYT1bXTtyZXR1cm4gdGhpcy5kYXRhQWRhcHRlci5jdXJyZW50KGZ1bmN0aW9uKGIpe2E9Yn0pLGF9LGUucHJvdG90eXBlLnZhbD1mdW5jdGlvbihiKXtpZih0aGlzLm9wdGlvbnMuZ2V0KFwiZGVidWdcIikmJndpbmRvdy5jb25zb2xlJiZjb25zb2xlLndhcm4mJmNvbnNvbGUud2FybignU2VsZWN0MjogVGhlIGBzZWxlY3QyKFwidmFsXCIpYCBtZXRob2QgaGFzIGJlZW4gZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIGxhdGVyIFNlbGVjdDIgdmVyc2lvbnMuIFVzZSAkZWxlbWVudC52YWwoKSBpbnN0ZWFkLicpLG51bGw9PWJ8fDA9PT1iLmxlbmd0aClyZXR1cm4gdGhpcy4kZWxlbWVudC52YWwoKTt2YXIgYz1iWzBdO2EuaXNBcnJheShjKSYmKGM9YS5tYXAoYyxmdW5jdGlvbihhKXtyZXR1cm4gYS50b1N0cmluZygpfSkpLHRoaXMuJGVsZW1lbnQudmFsKGMpLnRyaWdnZXIoXCJjaGFuZ2VcIil9LGUucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLiRjb250YWluZXIucmVtb3ZlKCksdGhpcy4kZWxlbWVudFswXS5kZXRhY2hFdmVudCYmdGhpcy4kZWxlbWVudFswXS5kZXRhY2hFdmVudChcIm9ucHJvcGVydHljaGFuZ2VcIix0aGlzLl9zeW5jQSksbnVsbCE9dGhpcy5fb2JzZXJ2ZXI/KHRoaXMuX29ic2VydmVyLmRpc2Nvbm5lY3QoKSx0aGlzLl9vYnNlcnZlcj1udWxsKTp0aGlzLiRlbGVtZW50WzBdLnJlbW92ZUV2ZW50TGlzdGVuZXImJih0aGlzLiRlbGVtZW50WzBdLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJET01BdHRyTW9kaWZpZWRcIix0aGlzLl9zeW5jQSwhMSksdGhpcy4kZWxlbWVudFswXS5yZW1vdmVFdmVudExpc3RlbmVyKFwiRE9NTm9kZUluc2VydGVkXCIsdGhpcy5fc3luY1MsITEpLHRoaXMuJGVsZW1lbnRbMF0ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIkRPTU5vZGVSZW1vdmVkXCIsdGhpcy5fc3luY1MsITEpKSx0aGlzLl9zeW5jQT1udWxsLHRoaXMuX3N5bmNTPW51bGwsdGhpcy4kZWxlbWVudC5vZmYoXCIuc2VsZWN0MlwiKSx0aGlzLiRlbGVtZW50LmF0dHIoXCJ0YWJpbmRleFwiLHRoaXMuJGVsZW1lbnQuZGF0YShcIm9sZC10YWJpbmRleFwiKSksdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyhcInNlbGVjdDItaGlkZGVuLWFjY2Vzc2libGVcIiksdGhpcy4kZWxlbWVudC5hdHRyKFwiYXJpYS1oaWRkZW5cIixcImZhbHNlXCIpLHRoaXMuJGVsZW1lbnQucmVtb3ZlRGF0YShcInNlbGVjdDJcIiksdGhpcy5kYXRhQWRhcHRlci5kZXN0cm95KCksdGhpcy5zZWxlY3Rpb24uZGVzdHJveSgpLHRoaXMuZHJvcGRvd24uZGVzdHJveSgpLHRoaXMucmVzdWx0cy5kZXN0cm95KCksdGhpcy5kYXRhQWRhcHRlcj1udWxsLHRoaXMuc2VsZWN0aW9uPW51bGwsdGhpcy5kcm9wZG93bj1udWxsLHRoaXMucmVzdWx0cz1udWxsO1xyXG59LGUucHJvdG90eXBlLnJlbmRlcj1mdW5jdGlvbigpe3ZhciBiPWEoJzxzcGFuIGNsYXNzPVwic2VsZWN0MiBzZWxlY3QyLWNvbnRhaW5lclwiPjxzcGFuIGNsYXNzPVwic2VsZWN0aW9uXCI+PC9zcGFuPjxzcGFuIGNsYXNzPVwiZHJvcGRvd24td3JhcHBlclwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvc3Bhbj48L3NwYW4+Jyk7cmV0dXJuIGIuYXR0cihcImRpclwiLHRoaXMub3B0aW9ucy5nZXQoXCJkaXJcIikpLHRoaXMuJGNvbnRhaW5lcj1iLHRoaXMuJGNvbnRhaW5lci5hZGRDbGFzcyhcInNlbGVjdDItY29udGFpbmVyLS1cIit0aGlzLm9wdGlvbnMuZ2V0KFwidGhlbWVcIikpLGIuZGF0YShcImVsZW1lbnRcIix0aGlzLiRlbGVtZW50KSxifSxlfSksYi5kZWZpbmUoXCJzZWxlY3QyL2NvbXBhdC91dGlsc1wiLFtcImpxdWVyeVwiXSxmdW5jdGlvbihhKXtmdW5jdGlvbiBiKGIsYyxkKXt2YXIgZSxmLGc9W107ZT1hLnRyaW0oYi5hdHRyKFwiY2xhc3NcIikpLGUmJihlPVwiXCIrZSxhKGUuc3BsaXQoL1xccysvKSkuZWFjaChmdW5jdGlvbigpezA9PT10aGlzLmluZGV4T2YoXCJzZWxlY3QyLVwiKSYmZy5wdXNoKHRoaXMpfSkpLGU9YS50cmltKGMuYXR0cihcImNsYXNzXCIpKSxlJiYoZT1cIlwiK2UsYShlLnNwbGl0KC9cXHMrLykpLmVhY2goZnVuY3Rpb24oKXswIT09dGhpcy5pbmRleE9mKFwic2VsZWN0Mi1cIikmJihmPWQodGhpcyksbnVsbCE9ZiYmZy5wdXNoKGYpKX0pKSxiLmF0dHIoXCJjbGFzc1wiLGcuam9pbihcIiBcIikpfXJldHVybntzeW5jQ3NzQ2xhc3NlczpifX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9jb21wYXQvY29udGFpbmVyQ3NzXCIsW1wianF1ZXJ5XCIsXCIuL3V0aWxzXCJdLGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhhKXtyZXR1cm4gbnVsbH1mdW5jdGlvbiBkKCl7fXJldHVybiBkLnByb3RvdHlwZS5yZW5kZXI9ZnVuY3Rpb24oZCl7dmFyIGU9ZC5jYWxsKHRoaXMpLGY9dGhpcy5vcHRpb25zLmdldChcImNvbnRhaW5lckNzc0NsYXNzXCIpfHxcIlwiO2EuaXNGdW5jdGlvbihmKSYmKGY9Zih0aGlzLiRlbGVtZW50KSk7dmFyIGc9dGhpcy5vcHRpb25zLmdldChcImFkYXB0Q29udGFpbmVyQ3NzQ2xhc3NcIik7aWYoZz1nfHxjLC0xIT09Zi5pbmRleE9mKFwiOmFsbDpcIikpe2Y9Zi5yZXBsYWNlKFwiOmFsbDpcIixcIlwiKTt2YXIgaD1nO2c9ZnVuY3Rpb24oYSl7dmFyIGI9aChhKTtyZXR1cm4gbnVsbCE9Yj9iK1wiIFwiK2E6YX19dmFyIGk9dGhpcy5vcHRpb25zLmdldChcImNvbnRhaW5lckNzc1wiKXx8e307cmV0dXJuIGEuaXNGdW5jdGlvbihpKSYmKGk9aSh0aGlzLiRlbGVtZW50KSksYi5zeW5jQ3NzQ2xhc3NlcyhlLHRoaXMuJGVsZW1lbnQsZyksZS5jc3MoaSksZS5hZGRDbGFzcyhmKSxlfSxkfSksYi5kZWZpbmUoXCJzZWxlY3QyL2NvbXBhdC9kcm9wZG93bkNzc1wiLFtcImpxdWVyeVwiLFwiLi91dGlsc1wiXSxmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYSl7cmV0dXJuIG51bGx9ZnVuY3Rpb24gZCgpe31yZXR1cm4gZC5wcm90b3R5cGUucmVuZGVyPWZ1bmN0aW9uKGQpe3ZhciBlPWQuY2FsbCh0aGlzKSxmPXRoaXMub3B0aW9ucy5nZXQoXCJkcm9wZG93bkNzc0NsYXNzXCIpfHxcIlwiO2EuaXNGdW5jdGlvbihmKSYmKGY9Zih0aGlzLiRlbGVtZW50KSk7dmFyIGc9dGhpcy5vcHRpb25zLmdldChcImFkYXB0RHJvcGRvd25Dc3NDbGFzc1wiKTtpZihnPWd8fGMsLTEhPT1mLmluZGV4T2YoXCI6YWxsOlwiKSl7Zj1mLnJlcGxhY2UoXCI6YWxsOlwiLFwiXCIpO3ZhciBoPWc7Zz1mdW5jdGlvbihhKXt2YXIgYj1oKGEpO3JldHVybiBudWxsIT1iP2IrXCIgXCIrYTphfX12YXIgaT10aGlzLm9wdGlvbnMuZ2V0KFwiZHJvcGRvd25Dc3NcIil8fHt9O3JldHVybiBhLmlzRnVuY3Rpb24oaSkmJihpPWkodGhpcy4kZWxlbWVudCkpLGIuc3luY0Nzc0NsYXNzZXMoZSx0aGlzLiRlbGVtZW50LGcpLGUuY3NzKGkpLGUuYWRkQ2xhc3MoZiksZX0sZH0pLGIuZGVmaW5lKFwic2VsZWN0Mi9jb21wYXQvaW5pdFNlbGVjdGlvblwiLFtcImpxdWVyeVwiXSxmdW5jdGlvbihhKXtmdW5jdGlvbiBiKGEsYixjKXtjLmdldChcImRlYnVnXCIpJiZ3aW5kb3cuY29uc29sZSYmY29uc29sZS53YXJuJiZjb25zb2xlLndhcm4oXCJTZWxlY3QyOiBUaGUgYGluaXRTZWxlY3Rpb25gIG9wdGlvbiBoYXMgYmVlbiBkZXByZWNhdGVkIGluIGZhdm9yIG9mIGEgY3VzdG9tIGRhdGEgYWRhcHRlciB0aGF0IG92ZXJyaWRlcyB0aGUgYGN1cnJlbnRgIG1ldGhvZC4gVGhpcyBtZXRob2QgaXMgbm93IGNhbGxlZCBtdWx0aXBsZSB0aW1lcyBpbnN0ZWFkIG9mIGEgc2luZ2xlIHRpbWUgd2hlbiB0aGUgaW5zdGFuY2UgaXMgaW5pdGlhbGl6ZWQuIFN1cHBvcnQgd2lsbCBiZSByZW1vdmVkIGZvciB0aGUgYGluaXRTZWxlY3Rpb25gIG9wdGlvbiBpbiBmdXR1cmUgdmVyc2lvbnMgb2YgU2VsZWN0MlwiKSx0aGlzLmluaXRTZWxlY3Rpb249Yy5nZXQoXCJpbml0U2VsZWN0aW9uXCIpLHRoaXMuX2lzSW5pdGlhbGl6ZWQ9ITEsYS5jYWxsKHRoaXMsYixjKX1yZXR1cm4gYi5wcm90b3R5cGUuY3VycmVudD1mdW5jdGlvbihiLGMpe3ZhciBkPXRoaXM7cmV0dXJuIHRoaXMuX2lzSW5pdGlhbGl6ZWQ/dm9pZCBiLmNhbGwodGhpcyxjKTp2b2lkIHRoaXMuaW5pdFNlbGVjdGlvbi5jYWxsKG51bGwsdGhpcy4kZWxlbWVudCxmdW5jdGlvbihiKXtkLl9pc0luaXRpYWxpemVkPSEwLGEuaXNBcnJheShiKXx8KGI9W2JdKSxjKGIpfSl9LGJ9KSxiLmRlZmluZShcInNlbGVjdDIvY29tcGF0L2lucHV0RGF0YVwiLFtcImpxdWVyeVwiXSxmdW5jdGlvbihhKXtmdW5jdGlvbiBiKGEsYixjKXt0aGlzLl9jdXJyZW50RGF0YT1bXSx0aGlzLl92YWx1ZVNlcGFyYXRvcj1jLmdldChcInZhbHVlU2VwYXJhdG9yXCIpfHxcIixcIixcImhpZGRlblwiPT09Yi5wcm9wKFwidHlwZVwiKSYmYy5nZXQoXCJkZWJ1Z1wiKSYmY29uc29sZSYmY29uc29sZS53YXJuJiZjb25zb2xlLndhcm4oXCJTZWxlY3QyOiBVc2luZyBhIGhpZGRlbiBpbnB1dCB3aXRoIFNlbGVjdDIgaXMgbm8gbG9uZ2VyIHN1cHBvcnRlZCBhbmQgbWF5IHN0b3Agd29ya2luZyBpbiB0aGUgZnV0dXJlLiBJdCBpcyByZWNvbW1lbmRlZCB0byB1c2UgYSBgPHNlbGVjdD5gIGVsZW1lbnQgaW5zdGVhZC5cIiksYS5jYWxsKHRoaXMsYixjKX1yZXR1cm4gYi5wcm90b3R5cGUuY3VycmVudD1mdW5jdGlvbihiLGMpe2Z1bmN0aW9uIGQoYixjKXt2YXIgZT1bXTtyZXR1cm4gYi5zZWxlY3RlZHx8LTEhPT1hLmluQXJyYXkoYi5pZCxjKT8oYi5zZWxlY3RlZD0hMCxlLnB1c2goYikpOmIuc2VsZWN0ZWQ9ITEsYi5jaGlsZHJlbiYmZS5wdXNoLmFwcGx5KGUsZChiLmNoaWxkcmVuLGMpKSxlfWZvcih2YXIgZT1bXSxmPTA7Zjx0aGlzLl9jdXJyZW50RGF0YS5sZW5ndGg7ZisrKXt2YXIgZz10aGlzLl9jdXJyZW50RGF0YVtmXTtlLnB1c2guYXBwbHkoZSxkKGcsdGhpcy4kZWxlbWVudC52YWwoKS5zcGxpdCh0aGlzLl92YWx1ZVNlcGFyYXRvcikpKX1jKGUpfSxiLnByb3RvdHlwZS5zZWxlY3Q9ZnVuY3Rpb24oYixjKXtpZih0aGlzLm9wdGlvbnMuZ2V0KFwibXVsdGlwbGVcIikpe3ZhciBkPXRoaXMuJGVsZW1lbnQudmFsKCk7ZCs9dGhpcy5fdmFsdWVTZXBhcmF0b3IrYy5pZCx0aGlzLiRlbGVtZW50LnZhbChkKSx0aGlzLiRlbGVtZW50LnRyaWdnZXIoXCJjaGFuZ2VcIil9ZWxzZSB0aGlzLmN1cnJlbnQoZnVuY3Rpb24oYil7YS5tYXAoYixmdW5jdGlvbihhKXthLnNlbGVjdGVkPSExfSl9KSx0aGlzLiRlbGVtZW50LnZhbChjLmlkKSx0aGlzLiRlbGVtZW50LnRyaWdnZXIoXCJjaGFuZ2VcIil9LGIucHJvdG90eXBlLnVuc2VsZWN0PWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcztiLnNlbGVjdGVkPSExLHRoaXMuY3VycmVudChmdW5jdGlvbihhKXtmb3IodmFyIGQ9W10sZT0wO2U8YS5sZW5ndGg7ZSsrKXt2YXIgZj1hW2VdO2IuaWQhPWYuaWQmJmQucHVzaChmLmlkKX1jLiRlbGVtZW50LnZhbChkLmpvaW4oYy5fdmFsdWVTZXBhcmF0b3IpKSxjLiRlbGVtZW50LnRyaWdnZXIoXCJjaGFuZ2VcIil9KX0sYi5wcm90b3R5cGUucXVlcnk9ZnVuY3Rpb24oYSxiLGMpe2Zvcih2YXIgZD1bXSxlPTA7ZTx0aGlzLl9jdXJyZW50RGF0YS5sZW5ndGg7ZSsrKXt2YXIgZj10aGlzLl9jdXJyZW50RGF0YVtlXSxnPXRoaXMubWF0Y2hlcyhiLGYpO251bGwhPT1nJiZkLnB1c2goZyl9Yyh7cmVzdWx0czpkfSl9LGIucHJvdG90eXBlLmFkZE9wdGlvbnM9ZnVuY3Rpb24oYixjKXt2YXIgZD1hLm1hcChjLGZ1bmN0aW9uKGIpe3JldHVybiBhLmRhdGEoYlswXSxcImRhdGFcIil9KTt0aGlzLl9jdXJyZW50RGF0YS5wdXNoLmFwcGx5KHRoaXMuX2N1cnJlbnREYXRhLGQpfSxifSksYi5kZWZpbmUoXCJzZWxlY3QyL2NvbXBhdC9tYXRjaGVyXCIsW1wianF1ZXJ5XCJdLGZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoYil7ZnVuY3Rpb24gYyhjLGQpe3ZhciBlPWEuZXh0ZW5kKCEwLHt9LGQpO2lmKG51bGw9PWMudGVybXx8XCJcIj09PWEudHJpbShjLnRlcm0pKXJldHVybiBlO2lmKGQuY2hpbGRyZW4pe2Zvcih2YXIgZj1kLmNoaWxkcmVuLmxlbmd0aC0xO2Y+PTA7Zi0tKXt2YXIgZz1kLmNoaWxkcmVuW2ZdLGg9YihjLnRlcm0sZy50ZXh0LGcpO2h8fGUuY2hpbGRyZW4uc3BsaWNlKGYsMSl9aWYoZS5jaGlsZHJlbi5sZW5ndGg+MClyZXR1cm4gZX1yZXR1cm4gYihjLnRlcm0sZC50ZXh0LGQpP2U6bnVsbH1yZXR1cm4gY31yZXR1cm4gYn0pLGIuZGVmaW5lKFwic2VsZWN0Mi9jb21wYXQvcXVlcnlcIixbXSxmdW5jdGlvbigpe2Z1bmN0aW9uIGEoYSxiLGMpe2MuZ2V0KFwiZGVidWdcIikmJndpbmRvdy5jb25zb2xlJiZjb25zb2xlLndhcm4mJmNvbnNvbGUud2FybihcIlNlbGVjdDI6IFRoZSBgcXVlcnlgIG9wdGlvbiBoYXMgYmVlbiBkZXByZWNhdGVkIGluIGZhdm9yIG9mIGEgY3VzdG9tIGRhdGEgYWRhcHRlciB0aGF0IG92ZXJyaWRlcyB0aGUgYHF1ZXJ5YCBtZXRob2QuIFN1cHBvcnQgd2lsbCBiZSByZW1vdmVkIGZvciB0aGUgYHF1ZXJ5YCBvcHRpb24gaW4gZnV0dXJlIHZlcnNpb25zIG9mIFNlbGVjdDIuXCIpLGEuY2FsbCh0aGlzLGIsYyl9cmV0dXJuIGEucHJvdG90eXBlLnF1ZXJ5PWZ1bmN0aW9uKGEsYixjKXtiLmNhbGxiYWNrPWM7dmFyIGQ9dGhpcy5vcHRpb25zLmdldChcInF1ZXJ5XCIpO2QuY2FsbChudWxsLGIpfSxhfSksYi5kZWZpbmUoXCJzZWxlY3QyL2Ryb3Bkb3duL2F0dGFjaENvbnRhaW5lclwiLFtdLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShhLGIsYyl7YS5jYWxsKHRoaXMsYixjKX1yZXR1cm4gYS5wcm90b3R5cGUucG9zaXRpb249ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPWMuZmluZChcIi5kcm9wZG93bi13cmFwcGVyXCIpO2QuYXBwZW5kKGIpLGIuYWRkQ2xhc3MoXCJzZWxlY3QyLWRyb3Bkb3duLS1iZWxvd1wiKSxjLmFkZENsYXNzKFwic2VsZWN0Mi1jb250YWluZXItLWJlbG93XCIpfSxhfSksYi5kZWZpbmUoXCJzZWxlY3QyL2Ryb3Bkb3duL3N0b3BQcm9wYWdhdGlvblwiLFtdLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gYSgpe31yZXR1cm4gYS5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihhLGIsYyl7YS5jYWxsKHRoaXMsYixjKTt2YXIgZD1bXCJibHVyXCIsXCJjaGFuZ2VcIixcImNsaWNrXCIsXCJkYmxjbGlja1wiLFwiZm9jdXNcIixcImZvY3VzaW5cIixcImZvY3Vzb3V0XCIsXCJpbnB1dFwiLFwia2V5ZG93blwiLFwia2V5dXBcIixcImtleXByZXNzXCIsXCJtb3VzZWRvd25cIixcIm1vdXNlZW50ZXJcIixcIm1vdXNlbGVhdmVcIixcIm1vdXNlbW92ZVwiLFwibW91c2VvdmVyXCIsXCJtb3VzZXVwXCIsXCJzZWFyY2hcIixcInRvdWNoZW5kXCIsXCJ0b3VjaHN0YXJ0XCJdO3RoaXMuJGRyb3Bkb3duLm9uKGQuam9pbihcIiBcIiksZnVuY3Rpb24oYSl7YS5zdG9wUHJvcGFnYXRpb24oKX0pfSxhfSksYi5kZWZpbmUoXCJzZWxlY3QyL3NlbGVjdGlvbi9zdG9wUHJvcGFnYXRpb25cIixbXSxmdW5jdGlvbigpe2Z1bmN0aW9uIGEoKXt9cmV0dXJuIGEucHJvdG90eXBlLmJpbmQ9ZnVuY3Rpb24oYSxiLGMpe2EuY2FsbCh0aGlzLGIsYyk7dmFyIGQ9W1wiYmx1clwiLFwiY2hhbmdlXCIsXCJjbGlja1wiLFwiZGJsY2xpY2tcIixcImZvY3VzXCIsXCJmb2N1c2luXCIsXCJmb2N1c291dFwiLFwiaW5wdXRcIixcImtleWRvd25cIixcImtleXVwXCIsXCJrZXlwcmVzc1wiLFwibW91c2Vkb3duXCIsXCJtb3VzZWVudGVyXCIsXCJtb3VzZWxlYXZlXCIsXCJtb3VzZW1vdmVcIixcIm1vdXNlb3ZlclwiLFwibW91c2V1cFwiLFwic2VhcmNoXCIsXCJ0b3VjaGVuZFwiLFwidG91Y2hzdGFydFwiXTt0aGlzLiRzZWxlY3Rpb24ub24oZC5qb2luKFwiIFwiKSxmdW5jdGlvbihhKXthLnN0b3BQcm9wYWdhdGlvbigpfSl9LGF9KSxmdW5jdGlvbihjKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBiLmRlZmluZSYmYi5kZWZpbmUuYW1kP2IuZGVmaW5lKFwianF1ZXJ5LW1vdXNld2hlZWxcIixbXCJqcXVlcnlcIl0sYyk6XCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9YzpjKGEpfShmdW5jdGlvbihhKXtmdW5jdGlvbiBiKGIpe3ZhciBnPWJ8fHdpbmRvdy5ldmVudCxoPWkuY2FsbChhcmd1bWVudHMsMSksaj0wLGw9MCxtPTAsbj0wLG89MCxwPTA7aWYoYj1hLmV2ZW50LmZpeChnKSxiLnR5cGU9XCJtb3VzZXdoZWVsXCIsXCJkZXRhaWxcImluIGcmJihtPS0xKmcuZGV0YWlsKSxcIndoZWVsRGVsdGFcImluIGcmJihtPWcud2hlZWxEZWx0YSksXCJ3aGVlbERlbHRhWVwiaW4gZyYmKG09Zy53aGVlbERlbHRhWSksXCJ3aGVlbERlbHRhWFwiaW4gZyYmKGw9LTEqZy53aGVlbERlbHRhWCksXCJheGlzXCJpbiBnJiZnLmF4aXM9PT1nLkhPUklaT05UQUxfQVhJUyYmKGw9LTEqbSxtPTApLGo9MD09PW0/bDptLFwiZGVsdGFZXCJpbiBnJiYobT0tMSpnLmRlbHRhWSxqPW0pLFwiZGVsdGFYXCJpbiBnJiYobD1nLmRlbHRhWCwwPT09bSYmKGo9LTEqbCkpLDAhPT1tfHwwIT09bCl7aWYoMT09PWcuZGVsdGFNb2RlKXt2YXIgcT1hLmRhdGEodGhpcyxcIm1vdXNld2hlZWwtbGluZS1oZWlnaHRcIik7aio9cSxtKj1xLGwqPXF9ZWxzZSBpZigyPT09Zy5kZWx0YU1vZGUpe3ZhciByPWEuZGF0YSh0aGlzLFwibW91c2V3aGVlbC1wYWdlLWhlaWdodFwiKTtqKj1yLG0qPXIsbCo9cn1pZihuPU1hdGgubWF4KE1hdGguYWJzKG0pLE1hdGguYWJzKGwpKSwoIWZ8fGY+bikmJihmPW4sZChnLG4pJiYoZi89NDApKSxkKGcsbikmJihqLz00MCxsLz00MCxtLz00MCksaj1NYXRoW2o+PTE/XCJmbG9vclwiOlwiY2VpbFwiXShqL2YpLGw9TWF0aFtsPj0xP1wiZmxvb3JcIjpcImNlaWxcIl0obC9mKSxtPU1hdGhbbT49MT9cImZsb29yXCI6XCJjZWlsXCJdKG0vZiksay5zZXR0aW5ncy5ub3JtYWxpemVPZmZzZXQmJnRoaXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KXt2YXIgcz10aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO289Yi5jbGllbnRYLXMubGVmdCxwPWIuY2xpZW50WS1zLnRvcH1yZXR1cm4gYi5kZWx0YVg9bCxiLmRlbHRhWT1tLGIuZGVsdGFGYWN0b3I9ZixiLm9mZnNldFg9byxiLm9mZnNldFk9cCxiLmRlbHRhTW9kZT0wLGgudW5zaGlmdChiLGosbCxtKSxlJiZjbGVhclRpbWVvdXQoZSksZT1zZXRUaW1lb3V0KGMsMjAwKSwoYS5ldmVudC5kaXNwYXRjaHx8YS5ldmVudC5oYW5kbGUpLmFwcGx5KHRoaXMsaCl9fWZ1bmN0aW9uIGMoKXtmPW51bGx9ZnVuY3Rpb24gZChhLGIpe3JldHVybiBrLnNldHRpbmdzLmFkanVzdE9sZERlbHRhcyYmXCJtb3VzZXdoZWVsXCI9PT1hLnR5cGUmJmIlMTIwPT09MH12YXIgZSxmLGc9W1wid2hlZWxcIixcIm1vdXNld2hlZWxcIixcIkRPTU1vdXNlU2Nyb2xsXCIsXCJNb3pNb3VzZVBpeGVsU2Nyb2xsXCJdLGg9XCJvbndoZWVsXCJpbiBkb2N1bWVudHx8ZG9jdW1lbnQuZG9jdW1lbnRNb2RlPj05P1tcIndoZWVsXCJdOltcIm1vdXNld2hlZWxcIixcIkRvbU1vdXNlU2Nyb2xsXCIsXCJNb3pNb3VzZVBpeGVsU2Nyb2xsXCJdLGk9QXJyYXkucHJvdG90eXBlLnNsaWNlO2lmKGEuZXZlbnQuZml4SG9va3MpZm9yKHZhciBqPWcubGVuZ3RoO2o7KWEuZXZlbnQuZml4SG9va3NbZ1stLWpdXT1hLmV2ZW50Lm1vdXNlSG9va3M7dmFyIGs9YS5ldmVudC5zcGVjaWFsLm1vdXNld2hlZWw9e3ZlcnNpb246XCIzLjEuMTJcIixzZXR1cDpmdW5jdGlvbigpe2lmKHRoaXMuYWRkRXZlbnRMaXN0ZW5lcilmb3IodmFyIGM9aC5sZW5ndGg7YzspdGhpcy5hZGRFdmVudExpc3RlbmVyKGhbLS1jXSxiLCExKTtlbHNlIHRoaXMub25tb3VzZXdoZWVsPWI7YS5kYXRhKHRoaXMsXCJtb3VzZXdoZWVsLWxpbmUtaGVpZ2h0XCIsay5nZXRMaW5lSGVpZ2h0KHRoaXMpKSxhLmRhdGEodGhpcyxcIm1vdXNld2hlZWwtcGFnZS1oZWlnaHRcIixrLmdldFBhZ2VIZWlnaHQodGhpcykpfSx0ZWFyZG93bjpmdW5jdGlvbigpe2lmKHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcilmb3IodmFyIGM9aC5sZW5ndGg7YzspdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKGhbLS1jXSxiLCExKTtlbHNlIHRoaXMub25tb3VzZXdoZWVsPW51bGw7YS5yZW1vdmVEYXRhKHRoaXMsXCJtb3VzZXdoZWVsLWxpbmUtaGVpZ2h0XCIpLGEucmVtb3ZlRGF0YSh0aGlzLFwibW91c2V3aGVlbC1wYWdlLWhlaWdodFwiKX0sZ2V0TGluZUhlaWdodDpmdW5jdGlvbihiKXt2YXIgYz1hKGIpLGQ9Y1tcIm9mZnNldFBhcmVudFwiaW4gYS5mbj9cIm9mZnNldFBhcmVudFwiOlwicGFyZW50XCJdKCk7cmV0dXJuIGQubGVuZ3RofHwoZD1hKFwiYm9keVwiKSkscGFyc2VJbnQoZC5jc3MoXCJmb250U2l6ZVwiKSwxMCl8fHBhcnNlSW50KGMuY3NzKFwiZm9udFNpemVcIiksMTApfHwxNn0sZ2V0UGFnZUhlaWdodDpmdW5jdGlvbihiKXtyZXR1cm4gYShiKS5oZWlnaHQoKX0sc2V0dGluZ3M6e2FkanVzdE9sZERlbHRhczohMCxub3JtYWxpemVPZmZzZXQ6ITB9fTthLmZuLmV4dGVuZCh7bW91c2V3aGVlbDpmdW5jdGlvbihhKXtyZXR1cm4gYT90aGlzLmJpbmQoXCJtb3VzZXdoZWVsXCIsYSk6dGhpcy50cmlnZ2VyKFwibW91c2V3aGVlbFwiKX0sdW5tb3VzZXdoZWVsOmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLnVuYmluZChcIm1vdXNld2hlZWxcIixhKX19KX0pLGIuZGVmaW5lKFwianF1ZXJ5LnNlbGVjdDJcIixbXCJqcXVlcnlcIixcImpxdWVyeS1tb3VzZXdoZWVsXCIsXCIuL3NlbGVjdDIvY29yZVwiLFwiLi9zZWxlY3QyL2RlZmF1bHRzXCJdLGZ1bmN0aW9uKGEsYixjLGQpe2lmKG51bGw9PWEuZm4uc2VsZWN0Mil7dmFyIGU9W1wib3BlblwiLFwiY2xvc2VcIixcImRlc3Ryb3lcIl07YS5mbi5zZWxlY3QyPWZ1bmN0aW9uKGIpe2lmKGI9Ynx8e30sXCJvYmplY3RcIj09dHlwZW9mIGIpcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciBkPWEuZXh0ZW5kKCEwLHt9LGIpO25ldyBjKGEodGhpcyksZCl9KSx0aGlzO2lmKFwic3RyaW5nXCI9PXR5cGVvZiBiKXt2YXIgZCxmPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywxKTtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIGM9YSh0aGlzKS5kYXRhKFwic2VsZWN0MlwiKTtudWxsPT1jJiZ3aW5kb3cuY29uc29sZSYmY29uc29sZS5lcnJvciYmY29uc29sZS5lcnJvcihcIlRoZSBzZWxlY3QyKCdcIitiK1wiJykgbWV0aG9kIHdhcyBjYWxsZWQgb24gYW4gZWxlbWVudCB0aGF0IGlzIG5vdCB1c2luZyBTZWxlY3QyLlwiKSxkPWNbYl0uYXBwbHkoYyxmKX0pLGEuaW5BcnJheShiLGUpPi0xP3RoaXM6ZH10aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGFyZ3VtZW50cyBmb3IgU2VsZWN0MjogXCIrYil9fXJldHVybiBudWxsPT1hLmZuLnNlbGVjdDIuZGVmYXVsdHMmJihhLmZuLnNlbGVjdDIuZGVmYXVsdHM9ZCksY30pLHtkZWZpbmU6Yi5kZWZpbmUscmVxdWlyZTpiLnJlcXVpcmV9fSgpLGM9Yi5yZXF1aXJlKFwianF1ZXJ5LnNlbGVjdDJcIik7cmV0dXJuIGEuZm4uc2VsZWN0Mi5hbWQ9YixjfSk7IiwiJChmdW5jdGlvbigpIHtcclxuICAgICQoJ2lucHV0W25hbWU9ZF9mcm9tXSwgaW5wdXRbbmFtZT1kX3RvXScpLmRhdGVwaWNrZXIoe1xyXG4gICAgICAgIGRhdGVGb3JtYXQ6IFwieXl5eS1tbS1kZFwiXHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCdmb3JtW25hbWU9Y2F0ZWdvcmllcy1lZGl0LXN0b3Jlc10gaW5wdXRbdHlwZT1jaGVja2JveF0nKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgIFx0dmFyIHNlbGYgPSAkKHRoaXMpLFxyXG4gICAgXHRcdGNhdGVnb3JpZXNGb3JtID0gJCgnZm9ybVtuYW1lPWNhdGVnb3JpZXMtZWRpdC1zdG9yZXNdJyk7XHJcblxyXG4gICAgXHRpZihzZWxmLmlzKFwiOmNoZWNrZWRcIikgJiYgc2VsZi5hdHRyKFwiZGF0YS1wYXJlbnQtaWRcIikgIT0gXCIwXCIpIHtcclxuICAgIFx0XHRjYXRlZ29yaWVzRm9ybS5maW5kKCdpbnB1dFtkYXRhLXVpZD0nKyBzZWxmLmF0dHIoXCJkYXRhLXBhcmVudC1pZFwiKSArJ10nKS5wcm9wKFwiY2hlY2tlZFwiLCBmYWxzZSkucHJvcChcImNoZWNrZWRcIiwgdHJ1ZSk7XHJcbiAgICBcdH0gZWxzZSBpZighc2VsZi5pcyhcIjpjaGVja2VkXCIpICYmIHNlbGYuYXR0cihcImRhdGEtcGFyZW50LWlkXCIpICE9IFwiMFwiKSB7XHJcbiAgICBcdFx0dmFyIHBhcmVudFVuY2hla2VkID0gdHJ1ZTtcclxuXHJcbiAgICBcdFx0Y2F0ZWdvcmllc0Zvcm0uZmluZCgnaW5wdXRbZGF0YS1wYXJlbnQtaWQ9Jysgc2VsZi5hdHRyKFwiZGF0YS1wYXJlbnQtaWRcIikgKyddJykuZWFjaChmdW5jdGlvbigpIHtcclxuICAgIFx0XHRcdGlmKCQodGhpcykuaXMoXCI6Y2hlY2tlZFwiKSkge1xyXG4gICAgXHRcdFx0XHRwYXJlbnRVbmNoZWtlZCA9IGZhbHNlO1xyXG4gICAgXHRcdFx0fVxyXG4gICAgXHRcdH0pO1xyXG5cclxuICAgIFx0XHRpZihwYXJlbnRVbmNoZWtlZCkge1xyXG4gICAgXHRcdFx0Y2F0ZWdvcmllc0Zvcm0uZmluZCgnaW5wdXRbZGF0YS11aWQ9Jysgc2VsZi5hdHRyKFwiZGF0YS1wYXJlbnQtaWRcIikgKyddJykucHJvcChcImNoZWNrZWRcIiwgZmFsc2UpO1xyXG4gICAgXHRcdH1cclxuICAgIFx0fVxyXG4gICAgfSk7XHJcblxyXG5cdCQoXCIuc2VsZWN0Mi11c2Vyc1wiKS5zZWxlY3QyKHtcclxuXHRcdGFqYXg6IHtcclxuXHRcdFx0dXJsOiBcIi9hZG1pbi91c2Vycy9saXN0XCIsXHJcblx0XHRcdHR5cGU6ICdwb3N0JyxcclxuXHRcdFx0ZGF0YVR5cGU6ICdqc29uJyxcclxuXHRcdFx0ZGVsYXk6IDI1MCxcclxuXHRcdFx0ZGF0YTogZnVuY3Rpb24gKHBhcmFtcykge1xyXG5cdFx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0XHRlbWFpbDogcGFyYW1zLnRlcm1cclxuXHRcdFx0XHR9O1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRwcm9jZXNzUmVzdWx0czogZnVuY3Rpb24gKGRhdGEpIHtcclxuXHRcdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdFx0cmVzdWx0czogZGF0YVxyXG5cdFx0XHRcdH07XHJcblx0XHRcdH0sXHJcblx0XHRcdGNhY2hlOiB0cnVlXHJcblx0XHR9LFxyXG5cdFx0cGxhY2Vob2xkZXI6IFwi0JLRi9Cx0LXRgNC40YLQtSDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y9cIixcclxuXHRcdG1pbmltdW1JbnB1dExlbmd0aDogMVxyXG5cdH0pO1xyXG5cclxuXHQkKCBcIi5pbnB1dC1kYXRlcGlja2VyXCIgKS5kYXRlcGlja2VyKHtcclxuXHRcdGRhdGVGb3JtYXQ6IFwieXl5eS1tbS1kZFwiXHJcblx0fSk7XHJcblxyXG5cdCQoJyNjaGFyaXR5LWNoZWNrYm94LTAnKS5jbGljayggZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIGNoZWNrZWQgPSB0aGlzLmNoZWNrZWQ7XHJcblx0XHRBcnJheS5mcm9tKGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJjaGFyaXR5LWNoZWNrYm94XCIpKS5mb3JFYWNoKFxyXG5cdFx0XHRmdW5jdGlvbihlbGVtZW50KSB7XHJcblx0XHRcdFx0ZWxlbWVudC5jaGVja2VkID0gY2hlY2tlZDtcclxuXHRcdFx0fVxyXG5cdFx0KTtcclxuXHR9KTtcclxuXHJcblx0JCgnLmFqYXgtY29uZmlybScpLm9uKCdjbGljaycsZnVuY3Rpb24oZSkge1xyXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0JHRoaXM9JCh0aGlzKTtcclxuXHRcdGRhdGE9e1xyXG5cdFx0XHQncXVlc3Rpb24nOiR0aGlzLmRhdGEoJ3F1ZXN0aW9uJyl8fCfQktGLINGD0LLRg9GA0LXQvdC90Ys/JyxcclxuXHRcdFx0J3RpdGxlJzokdGhpcy5kYXRhKCd0aXRsZScpfHwn0J/QvtC00YLQstC10YDQttC00LXQvdC40LUg0LTQtdC50YHRgtCy0LjRjycsXHJcblx0XHRcdCdjYWxsYmFja1llcyc6ZnVuY3Rpb24oKXtcclxuXHRcdFx0XHQkdGhpcz0kKHRoaXMpO1xyXG5cdFx0XHRcdCQucG9zdCgnL2FkbWluL3N0b3Jlcy9pbXBvcnQtY2F0L2lkOicrJHRoaXMuZGF0YSgnc3RvcmUnKSxmdW5jdGlvbihkYXRhKXtcclxuXHRcdFx0XHRcdGlmKGRhdGEuZXJyb3Ipe1xyXG5cdFx0XHRcdFx0XHRub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOmRhdGEuZXJyb3IsdHlwZTonZXJyJ30pXHJcblx0XHRcdFx0XHR9ZWxzZSB7XHJcblx0XHRcdFx0XHRcdGxvY2F0aW9uLnJlbG9hZCgpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0sJ2pzb24nKVxyXG5cdFx0XHRcdFx0LmZhaWwoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6XCLQntGI0LjQsdC60LAg0L/QtdGA0LXQtNCw0YfQuCDQtNCw0L3QvdGL0YVcIix0eXBlOidlcnInfSlcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHQnb2JqJzokdGhpc1xyXG5cdFx0fTtcclxuXHRcdG5vdGlmaWNhdGlvbi5jb25maXJtKGRhdGEpXHJcblx0fSlcclxufSk7XHJcblxyXG4vKiQoZnVuY3Rpb24oKSB7XHJcblx0JCgnLmNoX3RyZWUgaW5wdXQnKS5vbignY2hhbmdlJyxmdW5jdGlvbigpe1xyXG5cdFx0JHRoaXM9JCh0aGlzKVxyXG5cdFx0aW5wdXQ9JHRoaXMucGFyZW50KCkucGFyZW50KCkuZmluZCgnaW5wdXQnKTtcclxuXHRcdGlucHV0LnByb3AoJ2NoZWNrZWQnLCR0aGlzLnByb3AoJ2NoZWNrZWQnKSlcclxuXHR9KVxyXG59KTsqL1xyXG4kKGZ1bmN0aW9uKCkge1xyXG5cdCQoJy5nZXRfYWRtaXRhZCcpLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XHJcblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRocmVmPXRoaXMuaHJlZnx8XCJcIjtcclxuXHJcblx0XHQkKCcudXNlcl9kYXRhJykuaHRtbChcIlwiKTtcclxuXHRcdGFkPSQoJy5hZG1pdGFkX2RhdGEnKTtcclxuXHRcdGFkLmFkZENsYXNzKCdsb2FkaW5nJyk7XHJcblx0XHRhZC5yZW1vdmVDbGFzcygnbm9ybWFsX2xvYWQnKTtcclxuXHRcdGFkLnRleHQoJycpO1xyXG5cclxuXHRcdHRyPWFkLmNsb3Nlc3QoJ3RyJyk7XHJcblx0XHRpZHM9W107XHJcblx0XHRmb3IodmFyIGk9MDtpPHRyLmxlbmd0aDtpKyspe1xyXG5cdFx0XHRpZD10ci5lcShpKS5kYXRhKCdrZXknKTtcclxuXHRcdFx0aWYoaWQpaWRzLnB1c2goaWQpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmKGlkcy5sZW5ndGg9PTApe1xyXG5cdFx0XHRhZC5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xyXG5cdFx0XHRhbGVydCgn0J3QtdGCINC30LDQutCw0LfQvtCyINC00LvRjyDQv9GA0L7QstC10YDQutC4Jyk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHQkLnBvc3QoJy9hZG1pbi9wYXltZW50cy9hZG1pdGFkLXRlc3QnLHsnaWRzJzppZHMsJ3VwZGF0ZSc6KGhyZWYuaW5kZXhPZigndXBkYXRlJyk+MD8xOjApfSxmdW5jdGlvbihkYXRhKXtcclxuXHRcdFx0YWQ9JCgnLmFkbWl0YWRfZGF0YScpO1xyXG5cdFx0XHRhZC50ZXh0KCfQtNCw0L3QvdGL0LUg0L3QtSDQvdCw0LnQtNC10L3RiycpO1xyXG5cdFx0XHRhZC5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xyXG5cclxuXHRcdFx0dHI9YWQuY2xvc2VzdCgndHInKTtcclxuXHRcdFx0Zm9yKHZhciBpPTA7aTx0ci5sZW5ndGg7aSsrKSB7XHJcblx0XHRcdFx0dmFyIGl0ZW0gPSB0ci5lcShpKTtcclxuXHRcdFx0XHRpZCA9IGl0ZW0uZGF0YSgna2V5Jyk7XHJcblx0XHRcdFx0aWYgKCFkYXRhW2lkXSkge1xyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR0ZHM9aXRlbS5maW5kKCcuYWRtaXRhZF9kYXRhJyk7XHJcblx0XHRcdFx0Zm9yKHZhciBqPTA7ajx0ZHMubGVuZ3RoO2orKykge1xyXG5cdFx0XHRcdFx0dmFyIHRkID0gdGRzLmVxKGopO1xyXG5cdFx0XHRcdFx0a2V5PXRkLmRhdGEoJ2NvbCcpO1xyXG5cdFx0XHRcdFx0aWYoZGF0YVtpZF1ba2V5XSl7XHJcblx0XHRcdFx0XHRcdHRkLmh0bWwoZGF0YVtpZF1ba2V5XSk7XHJcblx0XHRcdFx0XHRcdHRkLmFkZENsYXNzKCdub3JtYWxfbG9hZCcpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYoZGF0YVsndXNlcl9kYXRhJ10pe1xyXG5cdFx0XHRcdHVzZXI9ZGF0YVsndXNlcl9kYXRhJ107XHJcblx0XHRcdFx0dXNlcl9kYXRhPSc8SDI+0JHQsNC70LDQvdGBINC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRjyAnK3VzZXJbJ2VtYWlsJ10rJyAoJyt1c2VyWyd1aWQnXSsnKSDQvtCx0L3QvtCy0LvQtdC9PC9IMj4nO1xyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGFibGUgY2xhc3M9J3RhYmxlIHRhYmxlLXN1bSc+XCJcclxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRyPlwiXHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0aD48L3RoPlwiO1xyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGg+0KHRgtCw0YDRi9C1INC00LDQvdC90YvQtTwvdGg+XCI7XHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0aD7QndC+0LLRi9C1INC00LDQvdC90YvQtTwvdGg+XCI7XHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjwvdHI+XCJcclxuXHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0cj5cIlxyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQ+0JIg0L7QttC40LTQsNC90LjQuCAo0LrQvtC7LdCy0L4pPC90ZD5cIjtcclxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRkIGNsYXNzPSd2YWx1ZSc+XCIrdXNlclsnb2xkJ11bJ2NudF9wZW5kaW5nJ10rXCI8L3RkPlwiO1xyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQgY2xhc3M9J3ZhbHVlJz5cIit1c2VyWyduZXcnXVsnY250X3BlbmRpbmcnXStcIjwvdGQ+XCI7XHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjwvdHI+XCJcclxuXHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0cj5cIlxyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQ+0JIg0L7QttC40LTQsNC90LjQuCAo0YHRg9C80LzQsCk8L3RkPlwiO1xyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQgY2xhc3M9J3ZhbHVlJz5cIit1c2VyWydvbGQnXVsnc3VtX3BlbmRpbmcnXStcIjwvdGQ+XCI7XHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0ZCBjbGFzcz0ndmFsdWUnPlwiK3VzZXJbJ25ldyddWydzdW1fcGVuZGluZyddK1wiPC90ZD5cIjtcclxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPC90cj5cIlxyXG5cclxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRyPlwiXHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0ZD7QntGC0LrQu9C+0L3QtdC90L4gKNC60L7Quy3QstC+KTwvdGQ+XCI7XHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0ZCBjbGFzcz0ndmFsdWUnPlwiK3VzZXJbJ29sZCddWydjbnRfZGVjbGluZWQnXStcIjwvdGQ+XCI7XHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0ZCBjbGFzcz0ndmFsdWUnPlwiK3VzZXJbJ25ldyddWydjbnRfZGVjbGluZWQnXStcIjwvdGQ+XCI7XHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjwvdHI+XCJcclxuXHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0cj5cIlxyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQ+0J7RgtC60LvQvtC90LXQvdC+ICjRgdGD0LzQvNCwKTwvdGQ+XCI7XHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0ZCBjbGFzcz0ndmFsdWUnPlwiK3VzZXJbJ29sZCddWydzdW1fZGVjbGluZWQnXStcIjwvdGQ+XCI7XHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0ZCBjbGFzcz0ndmFsdWUnPlwiK3VzZXJbJ25ldyddWydzdW1fZGVjbGluZWQnXStcIjwvdGQ+XCI7XHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjwvdHI+XCJcclxuXHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0cj5cIlxyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQ+0J/QvtC00YLQstC10YDQttC00LXQvdC+ICjQutC+0Lst0LLQvik8L3RkPlwiO1xyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQgY2xhc3M9J3ZhbHVlJz5cIit1c2VyWydvbGQnXVsnY250X2NvbmZpcm1lZCddK1wiPC90ZD5cIjtcclxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRkIGNsYXNzPSd2YWx1ZSc+XCIrdXNlclsnbmV3J11bJ2NudF9jb25maXJtZWQnXStcIjwvdGQ+XCI7XHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjwvdHI+XCJcclxuXHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0cj5cIlxyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQ+0J/QvtC00YLQstC10YDQttC00LXQvdC+ICjRgdGD0LzQvNCwKTwvdGQ+XCI7XHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0ZCBjbGFzcz0ndmFsdWUnPlwiK3VzZXJbJ29sZCddWydzdW1fY29uZmlybWVkJ10rXCI8L3RkPlwiO1xyXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQgY2xhc3M9J3ZhbHVlJz5cIit1c2VyWyduZXcnXVsnc3VtX2NvbmZpcm1lZCddK1wiPC90ZD5cIjtcclxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPC90cj5cIlxyXG5cclxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRyPlwiXHJcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0ZD7QkdCw0LvQsNC90YEgKNC+0LHRidC40LkpPC90ZD5cIjtcclxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRkIGNsYXNzPSd2YWx1ZSc+XCIrdXNlclsnb2xkJ11bJ2JhbGFucyddK1wiPC90ZD5cIjtcclxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRkIGNsYXNzPSd2YWx1ZSc+XCIrdXNlclsnbmV3J11bJ2JhbGFucyddK1wiPC90ZD5cIjtcclxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPC90cj5cIlxyXG5cclxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPC90YWJsZT5cIlxyXG5cdFx0XHRcdCQoJy51c2VyX2RhdGEnKS5odG1sKHVzZXJfZGF0YSk7XHJcblx0XHRcdH1cclxuXHRcdH0sJ2pzb24nKS5mYWlsKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0YWQucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuXHRcdFx0YWxlcnQoJ9Ce0YjQuNCx0LrQsCDQvtCx0YDQsNCx0L7RgtC60Lgg0LfQsNC/0YDQvtGB0LAnKVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH0pXHJcbn0pOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBtZWdhc2xpZGVyID0gKGZ1bmN0aW9uKCkge1xyXG4gIHZhciBzbGlkZXJfZGF0YT1mYWxzZTtcclxuICB2YXIgY29udGFpbmVyX2lkPVwic2VjdGlvbiNtZWdhX3NsaWRlclwiO1xyXG4gIHZhciBwYXJhbGxheF9ncm91cD1mYWxzZTtcclxuICB2YXIgcGFyYWxsYXhfdGltZXI9ZmFsc2U7XHJcbiAgdmFyIHBhcmFsbGF4X2NvdW50ZXI9MDtcclxuICB2YXIgcGFyYWxsYXhfZD0xO1xyXG4gIHZhciBtb2JpbGVfbW9kZT0tMTtcclxuICB2YXIgbWF4X3RpbWVfbG9hZF9waWM9MzAwO1xyXG4gIHZhciBtb2JpbGVfc2l6ZT03MDA7XHJcbiAgdmFyIHJlbmRlcl9zbGlkZV9ub209MDtcclxuICB2YXIgdG90X2ltZ193YWl0O1xyXG4gIHZhciBzbGlkZXM7XHJcbiAgdmFyIHNsaWRlX3NlbGVjdF9ib3g7XHJcbiAgdmFyIGVkaXRvcjtcclxuICB2YXIgdGltZW91dElkO1xyXG4gIHZhciBzY3JvbGxfcGVyaW9kID0gNTAwMDtcclxuXHJcbiAgdmFyIHBvc0Fycj1bXHJcbiAgICAnc2xpZGVyX190ZXh0LWx0Jywnc2xpZGVyX190ZXh0LWN0Jywnc2xpZGVyX190ZXh0LXJ0JyxcclxuICAgICdzbGlkZXJfX3RleHQtbGMnLCdzbGlkZXJfX3RleHQtY2MnLCdzbGlkZXJfX3RleHQtcmMnLFxyXG4gICAgJ3NsaWRlcl9fdGV4dC1sYicsJ3NsaWRlcl9fdGV4dC1jYicsJ3NsaWRlcl9fdGV4dC1yYicsXHJcbiAgXTtcclxuICB2YXIgcG9zX2xpc3Q9W1xyXG4gICAgJ9Cb0LXQstC+INCy0LXRgNGFJywn0YbQtdC90YLRgCDQstC10YDRhScsJ9C/0YDQsNCy0L4g0LLQtdGA0YUnLFxyXG4gICAgJ9Cb0LXQstC+INGG0LXQvdGC0YAnLCfRhtC10L3RgtGAJywn0L/RgNCw0LLQviDRhtC10L3RgtGAJyxcclxuICAgICfQm9C10LLQviDQvdC40LcnLCfRhtC10L3RgtGAINC90LjQtycsJ9C/0YDQsNCy0L4g0L3QuNC3JyxcclxuICBdO1xyXG4gIHZhciBzaG93X2RlbGF5PVtcclxuICAgICdzaG93X25vX2RlbGF5JyxcclxuICAgICdzaG93X2RlbGF5XzA1JyxcclxuICAgICdzaG93X2RlbGF5XzEwJyxcclxuICAgICdzaG93X2RlbGF5XzE1JyxcclxuICAgICdzaG93X2RlbGF5XzIwJyxcclxuICAgICdzaG93X2RlbGF5XzI1JyxcclxuICAgICdzaG93X2RlbGF5XzMwJ1xyXG4gIF07XHJcbiAgdmFyIGhpZGVfZGVsYXk9W1xyXG4gICAgJ2hpZGVfbm9fZGVsYXknLFxyXG4gICAgJ2hpZGVfZGVsYXlfMDUnLFxyXG4gICAgJ2hpZGVfZGVsYXlfMTAnLFxyXG4gICAgJ2hpZGVfZGVsYXlfMTUnLFxyXG4gICAgJ2hpZGVfZGVsYXlfMjAnXHJcbiAgXTtcclxuICB2YXIgeWVzX25vX2Fycj1bXHJcbiAgICAnbm8nLFxyXG4gICAgJ3llcydcclxuICBdO1xyXG4gIHZhciB5ZXNfbm9fdmFsPVtcclxuICAgICcnLFxyXG4gICAgJ2ZpeGVkX19mdWxsLWhlaWdodCdcclxuICBdO1xyXG4gIHZhciBidG5fc3R5bGU9W1xyXG4gICAgJ25vbmUnLFxyXG4gICAgJ2JvcmRvJyxcclxuICBdO1xyXG4gIHZhciBzaG93X2FuaW1hdGlvbnM9W1xyXG4gICAgXCJub3RfYW5pbWF0ZVwiLFxyXG4gICAgXCJib3VuY2VJblwiLFxyXG4gICAgXCJib3VuY2VJbkRvd25cIixcclxuICAgIFwiYm91bmNlSW5MZWZ0XCIsXHJcbiAgICBcImJvdW5jZUluUmlnaHRcIixcclxuICAgIFwiYm91bmNlSW5VcFwiLFxyXG4gICAgXCJmYWRlSW5cIixcclxuICAgIFwiZmFkZUluRG93blwiLFxyXG4gICAgXCJmYWRlSW5MZWZ0XCIsXHJcbiAgICBcImZhZGVJblJpZ2h0XCIsXHJcbiAgICBcImZhZGVJblVwXCIsXHJcbiAgICBcImZsaXBJblhcIixcclxuICAgIFwiZmxpcEluWVwiLFxyXG4gICAgXCJsaWdodFNwZWVkSW5cIixcclxuICAgIFwicm90YXRlSW5cIixcclxuICAgIFwicm90YXRlSW5Eb3duTGVmdFwiLFxyXG4gICAgXCJyb3RhdGVJblVwTGVmdFwiLFxyXG4gICAgXCJyb3RhdGVJblVwUmlnaHRcIixcclxuICAgIFwiamFja0luVGhlQm94XCIsXHJcbiAgICBcInJvbGxJblwiLFxyXG4gICAgXCJ6b29tSW5cIlxyXG4gIF07XHJcblxyXG4gIHZhciBoaWRlX2FuaW1hdGlvbnM9W1xyXG4gICAgXCJub3RfYW5pbWF0ZVwiLFxyXG4gICAgXCJib3VuY2VPdXRcIixcclxuICAgIFwiYm91bmNlT3V0RG93blwiLFxyXG4gICAgXCJib3VuY2VPdXRMZWZ0XCIsXHJcbiAgICBcImJvdW5jZU91dFJpZ2h0XCIsXHJcbiAgICBcImJvdW5jZU91dFVwXCIsXHJcbiAgICBcImZhZGVPdXRcIixcclxuICAgIFwiZmFkZU91dERvd25cIixcclxuICAgIFwiZmFkZU91dExlZnRcIixcclxuICAgIFwiZmFkZU91dFJpZ2h0XCIsXHJcbiAgICBcImZhZGVPdXRVcFwiLFxyXG4gICAgXCJmbGlwT3V0WFwiLFxyXG4gICAgXCJsaXBPdXRZXCIsXHJcbiAgICBcImxpZ2h0U3BlZWRPdXRcIixcclxuICAgIFwicm90YXRlT3V0XCIsXHJcbiAgICBcInJvdGF0ZU91dERvd25MZWZ0XCIsXHJcbiAgICBcInJvdGF0ZU91dERvd25SaWdodFwiLFxyXG4gICAgXCJyb3RhdGVPdXRVcExlZnRcIixcclxuICAgIFwicm90YXRlT3V0VXBSaWdodFwiLFxyXG4gICAgXCJoaW5nZVwiLFxyXG4gICAgXCJyb2xsT3V0XCJcclxuICBdO1xyXG4gIHZhciBzdFRhYmxlO1xyXG4gIHZhciBwYXJhbGF4VGFibGU7XHJcblxyXG4gIGZ1bmN0aW9uIGluaXRJbWFnZVNlcnZlclNlbGVjdChlbHMpIHtcclxuICAgIGlmKGVscy5sZW5ndGg9PTApcmV0dXJuO1xyXG4gICAgZWxzLndyYXAoJzxkaXYgY2xhc3M9XCJzZWxlY3RfaW1nXCI+Jyk7XHJcbiAgICBlbHM9ZWxzLnBhcmVudCgpO1xyXG4gICAgZWxzLmFwcGVuZCgnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJmaWxlX2J1dHRvblwiPjxpIGNsYXNzPVwibWNlLWljbyBtY2UtaS1icm93c2VcIj48L2k+PC9idXR0b24+Jyk7XHJcbiAgICAvKmVscy5maW5kKCdidXR0b24nKS5vbignY2xpY2snLGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCgnI3JveHlDdXN0b21QYW5lbDInKS5hZGRDbGFzcygnb3BlbicpXHJcbiAgICB9KTsqL1xyXG4gICAgZm9yICh2YXIgaT0wO2k8ZWxzLmxlbmd0aDtpKyspIHtcclxuICAgICAgdmFyIGVsPWVscy5lcShpKS5maW5kKCdpbnB1dCcpO1xyXG4gICAgICBpZighZWwuYXR0cignaWQnKSl7XHJcbiAgICAgICAgZWwuYXR0cignaWQnLCdmaWxlXycraSsnXycrRGF0ZS5ub3coKSlcclxuICAgICAgfVxyXG4gICAgICB2YXIgdF9pZD1lbC5hdHRyKCdpZCcpO1xyXG4gICAgICBtaWhhaWxkZXYuZWxGaW5kZXIucmVnaXN0ZXIodF9pZCwgZnVuY3Rpb24gKGZpbGUsIGlkKSB7XHJcbiAgICAgICAgLy8kKHRoaXMpLnZhbChmaWxlLnVybCkudHJpZ2dlcignY2hhbmdlJywgW2ZpbGUsIGlkXSk7XHJcbiAgICAgICAgJCgnIycraWQpLnZhbChmaWxlLnVybCkuY2hhbmdlKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmZpbGVfYnV0dG9uJywgZnVuY3Rpb24oKXtcclxuICAgICAgdmFyICR0aGlzPSQodGhpcykucHJldigpO1xyXG4gICAgICB2YXIgaWQ9JHRoaXMuYXR0cignaWQnKTtcclxuICAgICAgbWloYWlsZGV2LmVsRmluZGVyLm9wZW5NYW5hZ2VyKHtcclxuICAgICAgICBcInVybFwiOlwiL21hbmFnZXIvZWxmaW5kZXI/ZmlsdGVyPWltYWdlJmNhbGxiYWNrPVwiK2lkK1wiJmxhbmc9cnVcIixcclxuICAgICAgICBcIndpZHRoXCI6XCJhdXRvXCIsXHJcbiAgICAgICAgXCJoZWlnaHRcIjpcImF1dG9cIixcclxuICAgICAgICBcImlkXCI6aWRcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdlbklucHV0KGRhdGEpe1xyXG4gICAgdmFyIGlucHV0PSc8aW5wdXQgY2xhc3M9XCInICsgKGRhdGEuaW5wdXRDbGFzcyB8fCAnJykgKyAnXCIgdmFsdWU9XCInICsgKGRhdGEudmFsdWUgfHwgJycpICsgJ1wiPic7XHJcbiAgICBpZihkYXRhLmxhYmVsKSB7XHJcbiAgICAgIGlucHV0ID0gJzxsYWJlbD48c3Bhbj4nICsgZGF0YS5sYWJlbCArICc8L3NwYW4+JytpbnB1dCsnPC9sYWJlbD4nO1xyXG4gICAgfVxyXG4gICAgaWYoZGF0YS5wYXJlbnQpIHtcclxuICAgICAgaW5wdXQgPSAnPCcrZGF0YS5wYXJlbnQrJz4nK2lucHV0Kyc8LycrZGF0YS5wYXJlbnQrJz4nO1xyXG4gICAgfVxyXG4gICAgaW5wdXQgPSAkKGlucHV0KTtcclxuXHJcbiAgICBpZihkYXRhLm9uQ2hhbmdlKXtcclxuICAgICAgdmFyIG9uQ2hhbmdlO1xyXG4gICAgICBpZihkYXRhLmJpbmQpe1xyXG4gICAgICAgIGRhdGEuYmluZC5pbnB1dD1pbnB1dC5maW5kKCdpbnB1dCcpO1xyXG4gICAgICAgIG9uQ2hhbmdlID0gZGF0YS5vbkNoYW5nZS5iaW5kKGRhdGEuYmluZCk7XHJcbiAgICAgIH1lbHNle1xyXG4gICAgICAgIG9uQ2hhbmdlID0gZGF0YS5vbkNoYW5nZS5iaW5kKGlucHV0LmZpbmQoJ2lucHV0JykpO1xyXG4gICAgICB9XHJcbiAgICAgIGlucHV0LmZpbmQoJ2lucHV0Jykub24oJ2NoYW5nZScsb25DaGFuZ2UpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gaW5wdXQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZW5TZWxlY3QoZGF0YSl7XHJcbiAgICB2YXIgaW5wdXQ9JCgnPHNlbGVjdC8+Jyk7XHJcblxyXG4gICAgdmFyIGVsPXNsaWRlcl9kYXRhWzBdW2RhdGEuZ3JdO1xyXG4gICAgaWYoZGF0YS5pbmRleCE9PWZhbHNlKXtcclxuICAgICAgZWw9ZWxbZGF0YS5pbmRleF07XHJcbiAgICB9XHJcblxyXG4gICAgaWYoZWxbZGF0YS5wYXJhbV0pe1xyXG4gICAgICBkYXRhLnZhbHVlPWVsW2RhdGEucGFyYW1dO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIGRhdGEudmFsdWU9MDtcclxuICAgIH1cclxuXHJcbiAgICBpZihkYXRhLnN0YXJ0X29wdGlvbil7XHJcbiAgICAgIGlucHV0LmFwcGVuZChkYXRhLnN0YXJ0X29wdGlvbilcclxuICAgIH1cclxuXHJcbiAgICBmb3IodmFyIGk9MDtpPGRhdGEubGlzdC5sZW5ndGg7aSsrKXtcclxuICAgICAgdmFyIHZhbDtcclxuICAgICAgdmFyIHR4dD1kYXRhLmxpc3RbaV07XHJcbiAgICAgIGlmKGRhdGEudmFsX3R5cGU9PTApe1xyXG4gICAgICAgIHZhbD1kYXRhLmxpc3RbaV07XHJcbiAgICAgIH1lbHNlIGlmKGRhdGEudmFsX3R5cGU9PTEpe1xyXG4gICAgICAgIHZhbD1pO1xyXG4gICAgICB9ZWxzZSBpZihkYXRhLnZhbF90eXBlPT0yKXtcclxuICAgICAgICAvL3ZhbD1kYXRhLnZhbF9saXN0W2ldO1xyXG4gICAgICAgIHZhbD1pO1xyXG4gICAgICAgIHR4dD1kYXRhLnZhbF9saXN0W2ldO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgc2VsPSh2YWw9PWRhdGEudmFsdWU/J3NlbGVjdGVkJzonJyk7XHJcbiAgICAgIGlmKHNlbD09J3NlbGVjdGVkJyl7XHJcbiAgICAgICAgaW5wdXQuYXR0cigndF92YWwnLGRhdGEubGlzdFtpXSk7XHJcbiAgICAgIH1cclxuICAgICAgdmFyIG9wdGlvbj0nPG9wdGlvbiB2YWx1ZT1cIicrdmFsKydcIiAnK3NlbCsnPicrdHh0Kyc8L29wdGlvbj4nO1xyXG4gICAgICBpZihkYXRhLnZhbF90eXBlPT0yKXtcclxuICAgICAgICBvcHRpb249JChvcHRpb24pLmF0dHIoJ2NvZGUnLGRhdGEubGlzdFtpXSk7XHJcbiAgICAgIH1cclxuICAgICAgaW5wdXQuYXBwZW5kKG9wdGlvbilcclxuICAgIH1cclxuXHJcbiAgICBpbnB1dC5vbignY2hhbmdlJyxmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGRhdGE9dGhpcztcclxuICAgICAgdmFyIHZhbD1kYXRhLmVsLnZhbCgpO1xyXG4gICAgICB2YXIgc2xfb3A9ZGF0YS5lbC5maW5kKCdvcHRpb25bdmFsdWU9Jyt2YWwrJ10nKTtcclxuICAgICAgdmFyIGNscz1zbF9vcC50ZXh0KCk7XHJcbiAgICAgIHZhciBjaD1zbF9vcC5hdHRyKCdjb2RlJyk7XHJcbiAgICAgIGlmKCFjaCljaD1jbHM7XHJcbiAgICAgIGlmKGRhdGEuaW5kZXghPT1mYWxzZSl7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF1bZGF0YS5ncl1bZGF0YS5pbmRleF1bZGF0YS5wYXJhbV09dmFsO1xyXG4gICAgICB9ZWxzZXtcclxuICAgICAgICBzbGlkZXJfZGF0YVswXVtkYXRhLmdyXVtkYXRhLnBhcmFtXT12YWw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGRhdGEub2JqLnJlbW92ZUNsYXNzKGRhdGEucHJlZml4K2RhdGEuZWwuYXR0cigndF92YWwnKSk7XHJcbiAgICAgIGRhdGEub2JqLmFkZENsYXNzKGRhdGEucHJlZml4K2NoKTtcclxuICAgICAgZGF0YS5lbC5hdHRyKCd0X3ZhbCcsY2gpO1xyXG5cclxuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgfS5iaW5kKHtcclxuICAgICAgZWw6aW5wdXQsXHJcbiAgICAgIG9iajpkYXRhLm9iaixcclxuICAgICAgZ3I6ZGF0YS5ncixcclxuICAgICAgaW5kZXg6ZGF0YS5pbmRleCxcclxuICAgICAgcGFyYW06ZGF0YS5wYXJhbSxcclxuICAgICAgcHJlZml4OmRhdGEucHJlZml4fHwnJ1xyXG4gICAgfSkpO1xyXG5cclxuICAgIGlmKGRhdGEucGFyZW50KXtcclxuICAgICAgdmFyIHBhcmVudD0kKCc8JytkYXRhLnBhcmVudCsnLz4nKTtcclxuICAgICAgcGFyZW50LmFwcGVuZChpbnB1dCk7XHJcbiAgICAgIHJldHVybiBwYXJlbnQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaW5wdXQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRTZWxBbmltYXRpb25Db250cm9sbChkYXRhKXtcclxuICAgIHZhciBhbmltX3NlbD1bXTtcclxuICAgIHZhciBvdXQ7XHJcblxyXG4gICAgaWYoZGF0YS50eXBlPT0wKSB7XHJcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPtCQ0L3QuNC80LDRhtC40Y8g0L/QvtGP0LLQu9C10L3QuNGPPC9zcGFuPicpO1xyXG4gICAgfVxyXG4gICAgYW5pbV9zZWwucHVzaChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0OnNob3dfYW5pbWF0aW9ucyxcclxuICAgICAgdmFsX3R5cGU6MCxcclxuICAgICAgb2JqOmRhdGEub2JqLFxyXG4gICAgICBncjpkYXRhLmdyLFxyXG4gICAgICBpbmRleDpkYXRhLmluZGV4LFxyXG4gICAgICBwYXJhbTonc2hvd19hbmltYXRpb24nLFxyXG4gICAgICBwcmVmaXg6J3NsaWRlXycsXHJcbiAgICAgIHBhcmVudDpkYXRhLnBhcmVudFxyXG4gICAgfSkpO1xyXG4gICAgaWYoZGF0YS50eXBlPT0wKSB7XHJcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxzcGFuPtCX0LDQtNC10YDQttC60LAg0L/QvtGP0LLQu9C10L3QuNGPPC9zcGFuPicpO1xyXG4gICAgfVxyXG4gICAgYW5pbV9zZWwucHVzaChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0OnNob3dfZGVsYXksXHJcbiAgICAgIHZhbF90eXBlOjEsXHJcbiAgICAgIG9iajpkYXRhLm9iaixcclxuICAgICAgZ3I6ZGF0YS5ncixcclxuICAgICAgaW5kZXg6ZGF0YS5pbmRleCxcclxuICAgICAgcGFyYW06J3Nob3dfZGVsYXknLFxyXG4gICAgICBwcmVmaXg6J3NsaWRlXycsXHJcbiAgICAgIHBhcmVudDpkYXRhLnBhcmVudFxyXG4gICAgfSkpO1xyXG5cclxuICAgIGlmKGRhdGEudHlwZT09MCkge1xyXG4gICAgICBhbmltX3NlbC5wdXNoKCc8YnIvPicpO1xyXG4gICAgICBhbmltX3NlbC5wdXNoKCc8c3Bhbj7QkNC90LjQvNCw0YbQuNGPINC40YHRh9C10LfQvdC+0LLQtdC90LjRjzwvc3Bhbj4nKTtcclxuICAgIH1cclxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDpoaWRlX2FuaW1hdGlvbnMsXHJcbiAgICAgIHZhbF90eXBlOjAsXHJcbiAgICAgIG9iajpkYXRhLm9iaixcclxuICAgICAgZ3I6ZGF0YS5ncixcclxuICAgICAgaW5kZXg6ZGF0YS5pbmRleCxcclxuICAgICAgcGFyYW06J2hpZGVfYW5pbWF0aW9uJyxcclxuICAgICAgcHJlZml4OidzbGlkZV8nLFxyXG4gICAgICBwYXJlbnQ6ZGF0YS5wYXJlbnRcclxuICAgIH0pKTtcclxuICAgIGlmKGRhdGEudHlwZT09MCkge1xyXG4gICAgICBhbmltX3NlbC5wdXNoKCc8c3Bhbj7Ql9Cw0LTQtdGA0LbQutCwINC40YHRh9C10LfQvdC+0LLQtdC90LjRjzwvc3Bhbj4nKTtcclxuICAgIH1cclxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDpoaWRlX2RlbGF5LFxyXG4gICAgICB2YWxfdHlwZToxLFxyXG4gICAgICBvYmo6ZGF0YS5vYmosXHJcbiAgICAgIGdyOmRhdGEuZ3IsXHJcbiAgICAgIGluZGV4OmRhdGEuaW5kZXgsXHJcbiAgICAgIHBhcmFtOidoaWRlX2RlbGF5JyxcclxuICAgICAgcHJlZml4OidzbGlkZV8nLFxyXG4gICAgICBwYXJlbnQ6ZGF0YS5wYXJlbnRcclxuICAgIH0pKTtcclxuXHJcbiAgICBpZihkYXRhLnR5cGU9PTApe1xyXG4gICAgICBvdXQ9JCgnPGRpdiBjbGFzcz1cImFuaW1fc2VsXCIvPicpO1xyXG4gICAgICBvdXQuYXBwZW5kKGFuaW1fc2VsKTtcclxuICAgIH1cclxuICAgIGlmKGRhdGEudHlwZT09MSl7XHJcbiAgICAgIG91dD1hbmltX3NlbDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gb3V0O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW5pdF9lZGl0b3IoKXtcclxuICAgICQoJyN3MScpLnJlbW92ZSgpO1xyXG4gICAgJCgnI3cxX2J1dHRvbicpLnJlbW92ZSgpO1xyXG4gICAgc2xpZGVyX2RhdGFbMF0ubW9iaWxlPXNsaWRlcl9kYXRhWzBdLm1vYmlsZS5zcGxpdCgnPycpWzBdO1xyXG5cclxuICAgIHZhciBlbD0kKCcjbWVnYV9zbGlkZXJfY29udHJvbGUnKTtcclxuICAgIHZhciBidG5zX2JveD0kKCc8ZGl2IGNsYXNzPVwiYnRuX2JveFwiLz4nKTtcclxuXHJcbiAgICBlbC5hcHBlbmQoJzxoMj7Qo9C/0YDQsNCy0LvQtdC90LjQtTwvaDI+Jyk7XHJcbiAgICBlbC5hcHBlbmQoJCgnPHRleHRhcmVhLz4nLHtcclxuICAgICAgdGV4dDpKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSksXHJcbiAgICAgIGlkOidzbGlkZV9kYXRhJyxcclxuICAgICAgbmFtZTogZWRpdG9yXHJcbiAgICB9KSk7XHJcblxyXG4gICAgdmFyIGJ0bj0kKCc8YnV0dG9uIGNsYXNzPVwiXCIvPicpLnRleHQoXCLQkNC60YLQuNCy0LjRgNC+0LLQsNGC0Ywg0YHQu9Cw0LnQtFwiKTtcclxuICAgIGJ0bnNfYm94LmFwcGVuZChidG4pO1xyXG4gICAgYnRuLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XHJcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5yZW1vdmVDbGFzcygnaGlkZV9zbGlkZScpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIGJ0bj0kKCc8YnV0dG9uIGNsYXNzPVwiXCIvPicpLnRleHQoXCLQlNC10LDQutGC0LjQstC40YDQvtCy0LDRgtGMINGB0LvQsNC50LRcIik7XHJcbiAgICBidG5zX2JveC5hcHBlbmQoYnRuKTtcclxuICAgIGJ0bi5vbignY2xpY2snLGZ1bmN0aW9uKGUpe1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5yZW1vdmVDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkuYWRkQ2xhc3MoJ2hpZGVfc2xpZGUnKTtcclxuICAgIH0pO1xyXG4gICAgZWwuYXBwZW5kKGJ0bnNfYm94KTtcclxuXHJcbiAgICBlbC5hcHBlbmQoJzxoMj7QntCx0YnQuNC1INC/0LDRgNCw0LzQtdGC0YDRizwvaDI+Jyk7XHJcbiAgICBlbC5hcHBlbmQoZ2VuSW5wdXQoe1xyXG4gICAgICB2YWx1ZTpzbGlkZXJfZGF0YVswXS5tb2JpbGUsXHJcbiAgICAgIGxhYmVsOlwi0KHQu9Cw0LnQtCDQtNC70Y8g0YLQtdC70LXRhNC+0L3QsFwiLFxyXG4gICAgICBpbnB1dENsYXNzOlwiZmlsZVNlbGVjdFwiLFxyXG4gICAgICBvbkNoYW5nZTpmdW5jdGlvbihlKXtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0ubW9iaWxlPSQodGhpcykudmFsKClcclxuICAgICAgICAkKCcubW9iX2JnJykuZXEoMCkuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrc2xpZGVyX2RhdGFbMF0ubW9iaWxlKycpJyk7XHJcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxyXG4gICAgICB9XHJcbiAgICB9KSk7XHJcblxyXG4gICAgZWwuYXBwZW5kKGdlbklucHV0KHtcclxuICAgICAgdmFsdWU6c2xpZGVyX2RhdGFbMF0uZm9uLFxyXG4gICAgICBsYWJlbDpcItCe0YHQvdC+0L3QvtC5INGE0L7QvVwiLFxyXG4gICAgICBpbnB1dENsYXNzOlwiZmlsZVNlbGVjdFwiLFxyXG4gICAgICBvbkNoYW5nZTpmdW5jdGlvbihlKXtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0uZm9uPSQodGhpcykudmFsKClcclxuICAgICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrc2xpZGVyX2RhdGFbMF0uZm9uKycpJylcclxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXHJcbiAgICAgIH1cclxuICAgIH0pKTtcclxuXHJcbiAgICB2YXIgYnRuX2NoPSQoJzxkaXYgY2xhc3M9XCJidG5zXCIvPicpO1xyXG4gICAgYnRuX2NoLmFwcGVuZCgnPGgzPtCa0L3QvtC/0LrQsCDQv9C10YDQtdGF0L7QtNCwKNC00LvRjyDQn9CaINCy0LXRgNGB0LjQuCk8L2gzPicpO1xyXG4gICAgYnRuX2NoLmFwcGVuZChnZW5JbnB1dCh7XHJcbiAgICAgIHZhbHVlOnNsaWRlcl9kYXRhWzBdLmJ1dHRvbi50ZXh0LFxyXG4gICAgICBsYWJlbDpcItCi0LXQutGB0YJcIixcclxuICAgICAgb25DaGFuZ2U6ZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi50ZXh0PSQodGhpcykudmFsKCk7XHJcbiAgICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZXJfX2hyZWYnKS5lcSgwKS50ZXh0KHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi50ZXh0KTtcclxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXHJcbiAgICAgIH0sXHJcbiAgICB9KSk7XHJcblxyXG4gICAgdmFyIGJ1dF9zbD0kKCcjbWVnYV9zbGlkZXIgLnNsaWRlcl9faHJlZicpLmVxKDApO1xyXG5cclxuICAgIGJ0bl9jaC5hcHBlbmQoJzxici8+Jyk7XHJcbiAgICBidG5fY2guYXBwZW5kKCc8c3Bhbj7QntGE0L7RgNC80LvQtdC90LjQtSDQutC90L7Qv9C60Lg8L3NwYW4+Jyk7XHJcbiAgICBidG5fY2guYXBwZW5kKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6YnRuX3N0eWxlLFxyXG4gICAgICB2YWxfdHlwZTowLFxyXG4gICAgICBvYmo6YnV0X3NsLFxyXG4gICAgICBncjonYnV0dG9uJyxcclxuICAgICAgaW5kZXg6ZmFsc2UsXHJcbiAgICAgIHBhcmFtOidjb2xvcidcclxuICAgIH0pKTtcclxuXHJcbiAgICBidG5fY2guYXBwZW5kKCc8YnIvPicpO1xyXG4gICAgYnRuX2NoLmFwcGVuZCgnPHNwYW4+0J/QvtC70L7QttC10L3QuNC1INC60L3QvtC/0LrQuDwvc3Bhbj4nKTtcclxuICAgIGJ0bl9jaC5hcHBlbmQoZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDpwb3NBcnIsXHJcbiAgICAgIHZhbF9saXN0OnBvc19saXN0LFxyXG4gICAgICB2YWxfdHlwZToyLFxyXG4gICAgICBvYmo6YnV0X3NsLnBhcmVudCgpLnBhcmVudCgpLFxyXG4gICAgICBncjonYnV0dG9uJyxcclxuICAgICAgaW5kZXg6ZmFsc2UsXHJcbiAgICAgIHBhcmFtOidwb3MnXHJcbiAgICB9KSk7XHJcblxyXG4gICAgYnRuX2NoLmFwcGVuZChnZXRTZWxBbmltYXRpb25Db250cm9sbCh7XHJcbiAgICAgIHR5cGU6MCxcclxuICAgICAgb2JqOmJ1dF9zbC5wYXJlbnQoKSxcclxuICAgICAgZ3I6J2J1dHRvbicsXHJcbiAgICAgIGluZGV4OmZhbHNlXHJcbiAgICB9KSk7XHJcbiAgICBlbC5hcHBlbmQoYnRuX2NoKTtcclxuXHJcbiAgICB2YXIgbGF5ZXI9JCgnPGRpdiBjbGFzcz1cImZpeGVkX2xheWVyXCIvPicpO1xyXG4gICAgbGF5ZXIuYXBwZW5kKCc8aDI+0KHRgtCw0YLQuNGH0LXRgdC60LjQtSDRgdC70L7QuDwvaDI+Jyk7XHJcbiAgICB2YXIgdGg9XCI8dGg+4oSWPC90aD5cIitcclxuICAgICAgICAgICAgXCI8dGg+0JrQsNGA0YLQuNC90LrQsDwvdGg+XCIrXHJcbiAgICAgICAgICAgIFwiPHRoPtCf0L7Qu9C+0LbQtdC90LjQtTwvdGg+XCIrXHJcbiAgICAgICAgICAgIFwiPHRoPtCh0LvQvtC5INC90LAg0LLRgdGOINCy0YvRgdC+0YLRgzwvdGg+XCIrXHJcbiAgICAgICAgICAgIFwiPHRoPtCQ0L3QuNC80LDRhtC40Y8g0L/QvtGP0LLQu9C10L3QuNGPPC90aD5cIitcclxuICAgICAgICAgICAgXCI8dGg+0JfQsNC00LXRgNC20LrQsCDQv9C+0Y/QstC70LXQvdC40Y88L3RoPlwiK1xyXG4gICAgICAgICAgICBcIjx0aD7QkNC90LjQvNCw0YbQuNGPINC40YHRh9C10LfQvdC+0LLQtdC90LjRjzwvdGg+XCIrXHJcbiAgICAgICAgICAgIFwiPHRoPtCX0LDQtNC10YDQttC60LAg0LjRgdGH0LXQt9C90L7QstC10L3QuNGPPC90aD5cIitcclxuICAgICAgICAgICAgXCI8dGg+0JTQtdC50YHRgtCy0LjQtTwvdGg+XCI7XHJcbiAgICBzdFRhYmxlPSQoJzx0YWJsZSBib3JkZXI9XCIxXCI+PHRyPicrdGgrJzwvdHI+PC90YWJsZT4nKTtcclxuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcclxuICAgIHZhciBkYXRhPXNsaWRlcl9kYXRhWzBdLmZpeGVkO1xyXG4gICAgaWYoZGF0YSAmJiBkYXRhLmxlbmd0aD4wKXtcclxuICAgICAgZm9yKHZhciBpPTA7aTxkYXRhLmxlbmd0aDtpKyspe1xyXG4gICAgICAgIGFkZFRyU3RhdGljKGRhdGFbaV0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBsYXllci5hcHBlbmQoc3RUYWJsZSk7XHJcbiAgICB2YXIgYWRkQnRuPSQoJzxidXR0b24vPicse1xyXG4gICAgICB0ZXh0Olwi0JTQvtCx0LDQstC40YLRjCDRgdC70L7QuVwiXHJcbiAgICB9KTtcclxuICAgIGFkZEJ0bi5vbignY2xpY2snLGZ1bmN0aW9uKGUpe1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGRhdGEgPSBhZGRUclN0YXRpYyhmYWxzZSk7XHJcbiAgICAgIGluaXRJbWFnZVNlcnZlclNlbGVjdChkYXRhLmVkaXRvci5maW5kKCcuZmlsZVNlbGVjdCcpKTtcclxuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkodGhpcy5zbGlkZXJfZGF0YVswXSkpXHJcbiAgICB9LmJpbmQoe1xyXG4gICAgICBzbGlkZXJfZGF0YTpzbGlkZXJfZGF0YVxyXG4gICAgfSkpO1xyXG4gICAgbGF5ZXIuYXBwZW5kKGFkZEJ0bik7XHJcbiAgICBlbC5hcHBlbmQobGF5ZXIpO1xyXG5cclxuICAgIHZhciBsYXllcj0kKCc8ZGl2IGNsYXNzPVwicGFyYWxheF9sYXllclwiLz4nKTtcclxuICAgIGxheWVyLmFwcGVuZCgnPGgyPtCf0LDRgNCw0LvQsNC60YEg0YHQu9C+0Lg8L2gyPicpO1xyXG4gICAgdmFyIHRoPVwiPHRoPuKEljwvdGg+XCIrXHJcbiAgICAgIFwiPHRoPtCa0LDRgNGC0LjQvdC60LA8L3RoPlwiK1xyXG4gICAgICBcIjx0aD7Qn9C+0LvQvtC20LXQvdC40LU8L3RoPlwiK1xyXG4gICAgICBcIjx0aD7Qo9C00LDQu9C10L3QvdC+0YHRgtGMICjRhtC10LvQvtC1INC/0L7Qu9C+0LbQuNGC0LXQu9GM0L3QvtC1INGH0LjRgdC70L4pPC90aD5cIitcclxuICAgICAgXCI8dGg+0JTQtdC50YHRgtCy0LjQtTwvdGg+XCI7XHJcblxyXG4gICAgcGFyYWxheFRhYmxlPSQoJzx0YWJsZSBib3JkZXI9XCIxXCI+PHRyPicrdGgrJzwvdHI+PC90YWJsZT4nKTtcclxuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcclxuICAgIHZhciBkYXRhPXNsaWRlcl9kYXRhWzBdLnBhcmFsYXg7XHJcbiAgICBpZihkYXRhICYmIGRhdGEubGVuZ3RoPjApe1xyXG4gICAgICBmb3IodmFyIGk9MDtpPGRhdGEubGVuZ3RoO2krKyl7XHJcbiAgICAgICAgYWRkVHJQYXJhbGF4KGRhdGFbaV0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBsYXllci5hcHBlbmQocGFyYWxheFRhYmxlKTtcclxuICAgIHZhciBhZGRCdG49JCgnPGJ1dHRvbi8+Jyx7XHJcbiAgICAgIHRleHQ6XCLQlNC+0LHQsNCy0LjRgtGMINGB0LvQvtC5XCJcclxuICAgIH0pO1xyXG4gICAgYWRkQnRuLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZGF0YSA9IGFkZFRyUGFyYWxheChmYWxzZSk7XHJcbiAgICAgIGluaXRJbWFnZVNlcnZlclNlbGVjdChkYXRhLmVkaXRvci5maW5kKCcuZmlsZVNlbGVjdCcpKTtcclxuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkodGhpcy5zbGlkZXJfZGF0YVswXSkpXHJcbiAgICB9LmJpbmQoe1xyXG4gICAgICBzbGlkZXJfZGF0YTpzbGlkZXJfZGF0YVxyXG4gICAgfSkpO1xyXG5cclxuICAgIGxheWVyLmFwcGVuZChhZGRCdG4pO1xyXG4gICAgZWwuYXBwZW5kKGxheWVyKTtcclxuXHJcbiAgICBpbml0SW1hZ2VTZXJ2ZXJTZWxlY3QoZWwuZmluZCgnLmZpbGVTZWxlY3QnKSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGRUclN0YXRpYyhkYXRhKSB7XHJcbiAgICB2YXIgaT1zdFRhYmxlLmZpbmQoJ3RyJykubGVuZ3RoLTE7XHJcbiAgICBpZighZGF0YSl7XHJcbiAgICAgIGRhdGE9e1xyXG4gICAgICAgIFwiaW1nXCI6XCJcIixcclxuICAgICAgICBcImZ1bGxfaGVpZ2h0XCI6MCxcclxuICAgICAgICBcInBvc1wiOjAsXHJcbiAgICAgICAgXCJzaG93X2RlbGF5XCI6MSxcclxuICAgICAgICBcInNob3dfYW5pbWF0aW9uXCI6XCJsaWdodFNwZWVkSW5cIixcclxuICAgICAgICBcImhpZGVfZGVsYXlcIjoxLFxyXG4gICAgICAgIFwiaGlkZV9hbmltYXRpb25cIjpcImJvdW5jZU91dFwiXHJcbiAgICAgIH07XHJcbiAgICAgIHNsaWRlcl9kYXRhWzBdLmZpeGVkLnB1c2goZGF0YSk7XHJcbiAgICAgIHZhciBmaXggPSAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwJyk7XHJcbiAgICAgIGFkZFN0YXRpY0xheWVyKGRhdGEsIGZpeCx0cnVlKTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIHRyPSQoJzx0ci8+Jyk7XHJcbiAgICB0ci5hcHBlbmQoJzx0ZCBjbGFzcz1cInRkX2NvdW50ZXJcIi8+Jyk7XHJcbiAgICB0ci5hcHBlbmQoZ2VuSW5wdXQoe1xyXG4gICAgICB2YWx1ZTpkYXRhLmltZyxcclxuICAgICAgbGFiZWw6ZmFsc2UsXHJcbiAgICAgIHBhcmVudDondGQnLFxyXG4gICAgICBpbnB1dENsYXNzOlwiZmlsZVNlbGVjdFwiLFxyXG4gICAgICBiaW5kOntcclxuICAgICAgICBncjonZml4ZWQnLFxyXG4gICAgICAgIGluZGV4OmksXHJcbiAgICAgICAgcGFyYW06J2ltZycsXHJcbiAgICAgICAgb2JqOiQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLmZpbmQoJy5hbmltYXRpb25fbGF5ZXInKSxcclxuICAgICAgfSxcclxuICAgICAgb25DaGFuZ2U6ZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHZhciBkYXRhPXRoaXM7XHJcbiAgICAgICAgZGF0YS5vYmouY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5pbnB1dC52YWwoKSsnKScpO1xyXG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLmZpeGVkW2RhdGEuaW5kZXhdLmltZz1kYXRhLmlucHV0LnZhbCgpO1xyXG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcclxuICAgICAgfVxyXG4gICAgfSkpO1xyXG4gICAgdHIuYXBwZW5kKGdlblNlbGVjdCh7XHJcbiAgICAgIGxpc3Q6cG9zQXJyLFxyXG4gICAgICB2YWxfbGlzdDpwb3NfbGlzdCxcclxuICAgICAgdmFsX3R5cGU6MixcclxuICAgICAgb2JqOiQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLFxyXG4gICAgICBncjonZml4ZWQnLFxyXG4gICAgICBpbmRleDppLFxyXG4gICAgICBwYXJhbToncG9zJyxcclxuICAgICAgcGFyZW50Oid0ZCcsXHJcbiAgICB9KSk7XHJcbiAgICB0ci5hcHBlbmQoZ2VuU2VsZWN0KHtcclxuICAgICAgbGlzdDp5ZXNfbm9fdmFsLFxyXG4gICAgICB2YWxfbGlzdDp5ZXNfbm9fYXJyLFxyXG4gICAgICB2YWxfdHlwZToyLFxyXG4gICAgICBvYmo6JCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSksXHJcbiAgICAgIGdyOidmaXhlZCcsXHJcbiAgICAgIGluZGV4OmksXHJcbiAgICAgIHBhcmFtOidmdWxsX2hlaWdodCcsXHJcbiAgICAgIHBhcmVudDondGQnLFxyXG4gICAgfSkpO1xyXG4gICAgdHIuYXBwZW5kKGdldFNlbEFuaW1hdGlvbkNvbnRyb2xsKHtcclxuICAgICAgdHlwZToxLFxyXG4gICAgICBvYmo6JCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSkuZmluZCgnLmFuaW1hdGlvbl9sYXllcicpLFxyXG4gICAgICBncjonZml4ZWQnLFxyXG4gICAgICBpbmRleDppLFxyXG4gICAgICBwYXJlbnQ6J3RkJ1xyXG4gICAgfSkpO1xyXG4gICAgdmFyIGRlbEJ0bj0kKCc8YnV0dG9uLz4nLHtcclxuICAgICAgdGV4dDpcItCj0LTQsNC70LjRgtGMXCJcclxuICAgIH0pO1xyXG4gICAgZGVsQnRuLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgdmFyICR0aGlzPSQodGhpcy5lbCk7XHJcbiAgICAgIGk9JHRoaXMuY2xvc2VzdCgndHInKS5pbmRleCgpLTE7XHJcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0LvQvtC5INC90LAg0YHQu9Cw0LnQtNC10YDQtVxyXG4gICAgICAkdGhpcy5jbG9zZXN0KCd0cicpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0YLRgNC+0LrRgyDQsiDRgtCw0LHQu9C40YbQtVxyXG4gICAgICB0aGlzLnNsaWRlcl9kYXRhWzBdLmZpeGVkLnNwbGljZShpLCAxKTsgLy/Rg9C00LDQu9GP0LXQvCDQuNC3INC60L7QvdGE0LjQs9CwINGB0LvQsNC50LTQsFxyXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcclxuICAgIH0uYmluZCh7XHJcbiAgICAgIGVsOmRlbEJ0bixcclxuICAgICAgc2xpZGVyX2RhdGE6c2xpZGVyX2RhdGFcclxuICAgIH0pKTtcclxuICAgIHZhciBkZWxCdG5UZD0kKCc8dGQvPicpLmFwcGVuZChkZWxCdG4pO1xyXG4gICAgdHIuYXBwZW5kKGRlbEJ0blRkKTtcclxuICAgIHN0VGFibGUuYXBwZW5kKHRyKVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVkaXRvcjp0cixcclxuICAgICAgZGF0YTpkYXRhXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGRUclBhcmFsYXgoZGF0YSkge1xyXG4gICAgdmFyIGk9cGFyYWxheFRhYmxlLmZpbmQoJ3RyJykubGVuZ3RoLTE7XHJcbiAgICBpZighZGF0YSl7XHJcbiAgICAgIGRhdGE9e1xyXG4gICAgICAgIFwiaW1nXCI6XCJcIixcclxuICAgICAgICBcInpcIjoxXHJcbiAgICAgIH07XHJcbiAgICAgIHNsaWRlcl9kYXRhWzBdLnBhcmFsYXgucHVzaChkYXRhKTtcclxuICAgICAgdmFyIHBhcmFsYXhfZ3IgPSAkKCcjbWVnYV9zbGlkZXIgLnBhcmFsbGF4X19ncm91cCcpO1xyXG4gICAgICBhZGRQYXJhbGF4TGF5ZXIoZGF0YSwgcGFyYWxheF9ncik7XHJcbiAgICB9O1xyXG4gICAgdmFyIHRyPSQoJzx0ci8+Jyk7XHJcbiAgICB0ci5hcHBlbmQoJzx0ZCBjbGFzcz1cInRkX2NvdW50ZXJcIi8+Jyk7XHJcbiAgICB0ci5hcHBlbmQoZ2VuSW5wdXQoe1xyXG4gICAgICB2YWx1ZTpkYXRhLmltZyxcclxuICAgICAgbGFiZWw6ZmFsc2UsXHJcbiAgICAgIHBhcmVudDondGQnLFxyXG4gICAgICBpbnB1dENsYXNzOlwiZmlsZVNlbGVjdFwiLFxyXG4gICAgICBiaW5kOntcclxuICAgICAgICBpbmRleDppLFxyXG4gICAgICAgIHBhcmFtOidpbWcnLFxyXG4gICAgICAgIG9iajokKCcjbWVnYV9zbGlkZXIgLnBhcmFsbGF4X19ncm91cCAucGFyYWxsYXhfX2xheWVyJykuZXEoaSkuZmluZCgnc3BhbicpLFxyXG4gICAgICB9LFxyXG4gICAgICBvbkNoYW5nZTpmdW5jdGlvbihlKXtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgdmFyIGRhdGE9dGhpcztcclxuICAgICAgICBkYXRhLm9iai5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCd1cmwoJytkYXRhLmlucHV0LnZhbCgpKycpJyk7XHJcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0ucGFyYWxheFtkYXRhLmluZGV4XS5pbWc9ZGF0YS5pbnB1dC52YWwoKTtcclxuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXHJcbiAgICAgIH1cclxuICAgIH0pKTtcclxuICAgIHRyLmFwcGVuZChnZW5TZWxlY3Qoe1xyXG4gICAgICBsaXN0OnBvc0FycixcclxuICAgICAgdmFsX2xpc3Q6cG9zX2xpc3QsXHJcbiAgICAgIHZhbF90eXBlOjIsXHJcbiAgICAgIG9iajokKCcjbWVnYV9zbGlkZXIgLnBhcmFsbGF4X19ncm91cCAucGFyYWxsYXhfX2xheWVyJykuZXEoaSkuZmluZCgnc3BhbicpLFxyXG4gICAgICBncjoncGFyYWxheCcsXHJcbiAgICAgIGluZGV4OmksXHJcbiAgICAgIHBhcmFtOidwb3MnLFxyXG4gICAgICBwYXJlbnQ6J3RkJyxcclxuICAgICAgc3RhcnRfb3B0aW9uOic8b3B0aW9uIHZhbHVlPVwiXCIgY29kZT1cIlwiPtC90LAg0LLQtdGB0Ywg0Y3QutGA0LDQvTwvb3B0aW9uPidcclxuICAgIH0pKTtcclxuICAgIHRyLmFwcGVuZChnZW5JbnB1dCh7XHJcbiAgICAgIHZhbHVlOmRhdGEueixcclxuICAgICAgbGFiZWw6ZmFsc2UsXHJcbiAgICAgIHBhcmVudDondGQnLFxyXG4gICAgICBiaW5kOntcclxuICAgICAgICBpbmRleDppLFxyXG4gICAgICAgIHBhcmFtOidpbWcnLFxyXG4gICAgICAgIG9iajokKCcjbWVnYV9zbGlkZXIgLnBhcmFsbGF4X19ncm91cCAucGFyYWxsYXhfX2xheWVyJykuZXEoaSksXHJcbiAgICAgIH0sXHJcbiAgICAgIG9uQ2hhbmdlOmZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB2YXIgZGF0YT10aGlzO1xyXG4gICAgICAgIGRhdGEub2JqLmF0dHIoJ3onLGRhdGEuaW5wdXQudmFsKCkpO1xyXG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLnBhcmFsYXhbZGF0YS5pbmRleF0uej1kYXRhLmlucHV0LnZhbCgpO1xyXG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcclxuICAgICAgfVxyXG4gICAgfSkpO1xyXG5cclxuICAgIHZhciBkZWxCdG49JCgnPGJ1dHRvbi8+Jyx7XHJcbiAgICAgIHRleHQ6XCLQo9C00LDQu9C40YLRjFwiXHJcbiAgICB9KTtcclxuICAgIGRlbEJ0bi5vbignY2xpY2snLGZ1bmN0aW9uKGUpe1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIHZhciAkdGhpcz0kKHRoaXMuZWwpO1xyXG4gICAgICBpPSR0aGlzLmNsb3Nlc3QoJ3RyJykuaW5kZXgoKS0xO1xyXG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKS5yZW1vdmUoKTsgLy/Rg9C00LDQu9GP0LXQvCDRgdC70L7QuSDQvdCwINGB0LvQsNC50LTQtdGA0LVcclxuICAgICAgJHRoaXMuY2xvc2VzdCgndHInKS5yZW1vdmUoKTsgLy/Rg9C00LDQu9GP0LXQvCDRgdGC0YDQvtC60YMg0LIg0YLQsNCx0LvQuNGG0LVcclxuICAgICAgdGhpcy5zbGlkZXJfZGF0YVswXS5wYXJhbGF4LnNwbGljZShpLCAxKTsgLy/Rg9C00LDQu9GP0LXQvCDQuNC3INC60L7QvdGE0LjQs9CwINGB0LvQsNC50LTQsFxyXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcclxuICAgIH0uYmluZCh7XHJcbiAgICAgIGVsOmRlbEJ0bixcclxuICAgICAgc2xpZGVyX2RhdGE6c2xpZGVyX2RhdGFcclxuICAgIH0pKTtcclxuICAgIHZhciBkZWxCdG5UZD0kKCc8dGQvPicpLmFwcGVuZChkZWxCdG4pO1xyXG4gICAgdHIuYXBwZW5kKGRlbEJ0blRkKTtcclxuICAgIHBhcmFsYXhUYWJsZS5hcHBlbmQodHIpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZWRpdG9yOnRyLFxyXG4gICAgICBkYXRhOmRhdGFcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZF9hbmltYXRpb24oZWwsZGF0YSl7XHJcbiAgICB2YXIgb3V0PSQoJzxkaXYvPicse1xyXG4gICAgICAnY2xhc3MnOidhbmltYXRpb25fbGF5ZXInXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZih0eXBlb2YoZGF0YS5zaG93X2RlbGF5KSE9J3VuZGVmaW5lZCcpe1xyXG4gICAgICBvdXQuYWRkQ2xhc3Moc2hvd19kZWxheVtkYXRhLnNob3dfZGVsYXldKTtcclxuICAgICAgaWYoZGF0YS5zaG93X2FuaW1hdGlvbil7XHJcbiAgICAgICAgb3V0LmFkZENsYXNzKCdzbGlkZV8nK2RhdGEuc2hvd19hbmltYXRpb24pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYodHlwZW9mKGRhdGEuaGlkZV9kZWxheSkhPSd1bmRlZmluZWQnKXtcclxuICAgICAgb3V0LmFkZENsYXNzKGhpZGVfZGVsYXlbZGF0YS5oaWRlX2RlbGF5XSk7XHJcbiAgICAgIGlmKGRhdGEuaGlkZV9hbmltYXRpb24pe1xyXG4gICAgICAgIG91dC5hZGRDbGFzcygnc2xpZGVfJytkYXRhLmhpZGVfYW5pbWF0aW9uKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGVsLmFwcGVuZChvdXQpO1xyXG4gICAgcmV0dXJuIGVsO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2VuZXJhdGVfc2xpZGUoZGF0YSl7XHJcbiAgICB2YXIgc2xpZGU9JCgnPGRpdiBjbGFzcz1cInNsaWRlXCIvPicpO1xyXG5cclxuICAgIHZhciBtb2JfYmc9JCgnPGEgY2xhc3M9XCJtb2JfYmdcIiBocmVmPVwiJytkYXRhLmJ1dHRvbi5ocmVmKydcIi8+Jyk7XHJcbiAgICBtb2JfYmcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5tb2JpbGUrJyknKVxyXG5cclxuICAgIHNsaWRlLmFwcGVuZChtb2JfYmcpO1xyXG4gICAgaWYobW9iaWxlX21vZGUpe1xyXG4gICAgICByZXR1cm4gc2xpZGU7XHJcbiAgICB9XHJcblxyXG4gICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDRhNC+0L0g0YLQviDQt9Cw0L/QvtC70L3Rj9C10LxcclxuICAgIGlmKGRhdGEuZm9uKXtcclxuICAgICAgc2xpZGUuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5mb24rJyknKVxyXG4gICAgfVxyXG5cclxuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcclxuICAgIGlmKGRhdGEucGFyYWxheCAmJiBkYXRhLnBhcmFsYXgubGVuZ3RoPjApe1xyXG4gICAgICB2YXIgcGFyYWxheF9ncj0kKCc8ZGl2IGNsYXNzPVwicGFyYWxsYXhfX2dyb3VwXCIvPicpO1xyXG4gICAgICBmb3IodmFyIGk9MDtpPGRhdGEucGFyYWxheC5sZW5ndGg7aSsrKXtcclxuICAgICAgICBhZGRQYXJhbGF4TGF5ZXIoZGF0YS5wYXJhbGF4W2ldLHBhcmFsYXhfZ3IpXHJcbiAgICAgIH1cclxuICAgICAgc2xpZGUuYXBwZW5kKHBhcmFsYXhfZ3IpXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGZpeD0kKCc8ZGl2IGNsYXNzPVwiZml4ZWRfZ3JvdXBcIi8+Jyk7XHJcbiAgICBmb3IodmFyIGk9MDtpPGRhdGEuZml4ZWQubGVuZ3RoO2krKyl7XHJcbiAgICAgIGFkZFN0YXRpY0xheWVyKGRhdGEuZml4ZWRbaV0sZml4KVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBkb3BfYmxrPSQoXCI8ZGl2IGNsYXNzPSdmaXhlZF9fbGF5ZXInLz5cIik7XHJcbiAgICBkb3BfYmxrLmFkZENsYXNzKHBvc0FycltkYXRhLmJ1dHRvbi5wb3NdKTtcclxuICAgIHZhciBidXQ9JChcIjxhIGNsYXNzPSdzbGlkZXJfX2hyZWYnLz5cIik7XHJcbiAgICBidXQuYXR0cignaHJlZicsZGF0YS5idXR0b24uaHJlZik7XHJcbiAgICBidXQudGV4dChkYXRhLmJ1dHRvbi50ZXh0KTtcclxuICAgIGJ1dC5hZGRDbGFzcyhkYXRhLmJ1dHRvbi5jb2xvcik7XHJcbiAgICBkb3BfYmxrPWFkZF9hbmltYXRpb24oZG9wX2JsayxkYXRhLmJ1dHRvbik7XHJcbiAgICBkb3BfYmxrLmZpbmQoJ2RpdicpLmFwcGVuZChidXQpO1xyXG4gICAgZml4LmFwcGVuZChkb3BfYmxrKTtcclxuXHJcbiAgICBzbGlkZS5hcHBlbmQoZml4KTtcclxuICAgIHJldHVybiBzbGlkZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZFBhcmFsYXhMYXllcihkYXRhLHBhcmFsYXhfZ3Ipe1xyXG4gICAgdmFyIHBhcmFsbGF4X2xheWVyPSQoJzxkaXYgY2xhc3M9XCJwYXJhbGxheF9fbGF5ZXJcIlxcPicpO1xyXG4gICAgcGFyYWxsYXhfbGF5ZXIuYXR0cigneicsZGF0YS56fHxpKjEwKTtcclxuICAgIHZhciBkb3BfYmxrPSQoXCI8c3BhbiBjbGFzcz0nc2xpZGVyX190ZXh0Jy8+XCIpO1xyXG4gICAgaWYoZGF0YS5wb3MpIHtcclxuICAgICAgZG9wX2Jsay5hZGRDbGFzcyhwb3NBcnJbZGF0YS5wb3NdKTtcclxuICAgIH1cclxuICAgIGRvcF9ibGsuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5pbWcrJyknKTtcclxuICAgIHBhcmFsbGF4X2xheWVyLmFwcGVuZChkb3BfYmxrKTtcclxuICAgIHBhcmFsYXhfZ3IuYXBwZW5kKHBhcmFsbGF4X2xheWVyKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZFN0YXRpY0xheWVyKGRhdGEsZml4LGJlZm9yX2J1dHRvbil7XHJcbiAgICB2YXIgZG9wX2Jsaz0kKFwiPGRpdiBjbGFzcz0nZml4ZWRfX2xheWVyJy8+XCIpO1xyXG4gICAgZG9wX2Jsay5hZGRDbGFzcyhwb3NBcnJbZGF0YS5wb3NdKTtcclxuICAgIGlmKGRhdGEuZnVsbF9oZWlnaHQpe1xyXG4gICAgICBkb3BfYmxrLmFkZENsYXNzKCdmaXhlZF9fZnVsbC1oZWlnaHQnKTtcclxuICAgIH1cclxuICAgIGRvcF9ibGs9YWRkX2FuaW1hdGlvbihkb3BfYmxrLGRhdGEpO1xyXG4gICAgZG9wX2Jsay5maW5kKCcuYW5pbWF0aW9uX2xheWVyJykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5pbWcrJyknKTtcclxuXHJcbiAgICBpZihiZWZvcl9idXR0b24pe1xyXG4gICAgICBmaXguZmluZCgnLnNsaWRlcl9faHJlZicpLmNsb3Nlc3QoJy5maXhlZF9fbGF5ZXInKS5iZWZvcmUoZG9wX2JsaylcclxuICAgIH1lbHNlIHtcclxuICAgICAgZml4LmFwcGVuZChkb3BfYmxrKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbmV4dF9zbGlkZSgpIHtcclxuICAgIGlmKCQoJyNtZWdhX3NsaWRlcicpLmhhc0NsYXNzKCdzdG9wX3NsaWRlJykpcmV0dXJuO1xyXG5cclxuICAgIHZhciBzbGlkZV9wb2ludHM9JCgnLnNsaWRlX3NlbGVjdF9ib3ggLnNsaWRlX3NlbGVjdCcpXHJcbiAgICB2YXIgc2xpZGVfY250PXNsaWRlX3BvaW50cy5sZW5ndGg7XHJcbiAgICB2YXIgYWN0aXZlPSQoJy5zbGlkZV9zZWxlY3RfYm94IC5zbGlkZXItYWN0aXZlJykuaW5kZXgoKSsxO1xyXG4gICAgaWYoYWN0aXZlPj1zbGlkZV9jbnQpYWN0aXZlPTA7XHJcbiAgICBzbGlkZV9wb2ludHMuZXEoYWN0aXZlKS5jbGljaygpO1xyXG5cclxuICAgIHNldFRpbWVvdXQobmV4dF9zbGlkZSwgc2Nyb2xsX3BlcmlvZCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbWdfdG9fbG9hZChzcmMpe1xyXG4gICAgdmFyIGltZz0kKCc8aW1nLz4nKTtcclxuICAgIGltZy5vbignbG9hZCcsZnVuY3Rpb24oKXtcclxuICAgICAgdG90X2ltZ193YWl0LS07XHJcblxyXG4gICAgICBpZih0b3RfaW1nX3dhaXQ9PTApe1xyXG5cclxuICAgICAgICBzbGlkZXMuYXBwZW5kKGdlbmVyYXRlX3NsaWRlKHNsaWRlcl9kYXRhW3JlbmRlcl9zbGlkZV9ub21dKSk7XHJcbiAgICAgICAgc2xpZGVfc2VsZWN0X2JveC5maW5kKCdsaScpLmVxKHJlbmRlcl9zbGlkZV9ub20pLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xyXG5cclxuICAgICAgICBpZihyZW5kZXJfc2xpZGVfbm9tPT0wKXtcclxuICAgICAgICAgIHNsaWRlcy5maW5kKCcuc2xpZGUnKVxyXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ2ZpcnN0X3Nob3cnKVxyXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcclxuICAgICAgICAgIHNsaWRlX3NlbGVjdF9ib3guZmluZCgnbGknKS5lcSgwKS5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG5cclxuICAgICAgICAgIGlmKCFlZGl0b3IpIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgJCh0aGlzKS5maW5kKCcuZmlyc3Rfc2hvdycpLnJlbW92ZUNsYXNzKCdmaXJzdF9zaG93Jyk7XHJcbiAgICAgICAgICAgIH0uYmluZChzbGlkZXMpLCA1MDAwKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZihtb2JpbGVfbW9kZT09PWZhbHNlKSB7XHJcbiAgICAgICAgICAgIHBhcmFsbGF4X2dyb3VwID0gJChjb250YWluZXJfaWQgKyAnIC5zbGlkZXItYWN0aXZlIC5wYXJhbGxheF9fZ3JvdXA+KicpO1xyXG4gICAgICAgICAgICBwYXJhbGxheF9jb3VudGVyID0gMDtcclxuICAgICAgICAgICAgcGFyYWxsYXhfdGltZXIgPSBzZXRJbnRlcnZhbChyZW5kZXIsIDEwMCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYoZWRpdG9yKXtcclxuICAgICAgICAgICAgaW5pdF9lZGl0b3IoKVxyXG4gICAgICAgICAgfWVsc2Uge1xyXG4gICAgICAgICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KG5leHRfc2xpZGUsIHNjcm9sbF9wZXJpb2QpO1xyXG5cclxuICAgICAgICAgICAgJCgnLnNsaWRlX3NlbGVjdF9ib3gnKS5vbignY2xpY2snLCcuc2xpZGVfc2VsZWN0JyxmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgIHZhciAkdGhpcz0kKHRoaXMpO1xyXG4gICAgICAgICAgICAgIGlmKCR0aGlzLmhhc0NsYXNzKCdzbGlkZXItYWN0aXZlJykpcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICB2YXIgaW5kZXggPSAkdGhpcy5pbmRleCgpO1xyXG4gICAgICAgICAgICAgICQoJy5zbGlkZV9zZWxlY3RfYm94IC5zbGlkZXItYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAkdGhpcy5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG5cclxuICAgICAgICAgICAgICAkKGNvbnRhaW5lcl9pZCsnIC5zbGlkZS5zbGlkZXItYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAkKGNvbnRhaW5lcl9pZCsnIC5zbGlkZScpLmVxKGluZGV4KS5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xyXG5cclxuICAgICAgICAgICAgICBwYXJhbGxheF9ncm91cCA9ICQoY29udGFpbmVyX2lkICsgJyAuc2xpZGVyLWFjdGl2ZSAucGFyYWxsYXhfX2dyb3VwPionKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkKCcjbWVnYV9zbGlkZXInKS5ob3ZlcihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XHJcbiAgICAgICAgICAgICAgJCgnI21lZ2Ffc2xpZGVyJykuYWRkQ2xhc3MoJ3N0b3Bfc2xpZGUnKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQobmV4dF9zbGlkZSwgc2Nyb2xsX3BlcmlvZCk7XHJcbiAgICAgICAgICAgICAgJCgnI21lZ2Ffc2xpZGVyJykucmVtb3ZlQ2xhc3MoJ3N0b3Bfc2xpZGUnKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZW5kZXJfc2xpZGVfbm9tKys7XHJcbiAgICAgICAgaWYocmVuZGVyX3NsaWRlX25vbTxzbGlkZXJfZGF0YS5sZW5ndGgpe1xyXG4gICAgICAgICAgbG9hZF9zbGlkZV9pbWcoKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSkub24oJ2Vycm9yJyxmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRvdF9pbWdfd2FpdC0tO1xyXG4gICAgfSk7XHJcbiAgICBpbWcucHJvcCgnc3JjJyxzcmMpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbG9hZF9zbGlkZV9pbWcoKXtcclxuICAgIHZhciBkYXRhPXNsaWRlcl9kYXRhW3JlbmRlcl9zbGlkZV9ub21dO1xyXG4gICAgdG90X2ltZ193YWl0PTE7XHJcblxyXG4gICAgaWYobW9iaWxlX21vZGU9PT1mYWxzZSl7XHJcbiAgICAgIHRvdF9pbWdfd2FpdCsrO1xyXG4gICAgICBpbWdfdG9fbG9hZChkYXRhLmZvbik7XHJcbiAgICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0L/QsNGA0LDQu9Cw0LrRgSDRgdC70L7QuCDQt9Cw0L/QvtC70L3Rj9C10LxcclxuICAgICAgaWYoZGF0YS5wYXJhbGF4ICYmIGRhdGEucGFyYWxheC5sZW5ndGg+MCl7XHJcbiAgICAgICAgdG90X2ltZ193YWl0Kz1kYXRhLnBhcmFsYXgubGVuZ3RoO1xyXG4gICAgICAgIGZvcih2YXIgaT0wO2k8ZGF0YS5wYXJhbGF4Lmxlbmd0aDtpKyspIHtcclxuICAgICAgICAgIGltZ190b19sb2FkKGRhdGEucGFyYWxheFtpXS5pbWcpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmKGRhdGEuZml4ZWQgJiYgZGF0YS5maXhlZC5sZW5ndGg+MCkge1xyXG4gICAgICAgIHRvdF9pbWdfd2FpdCArPSBkYXRhLmZpeGVkLmxlbmd0aDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEuZml4ZWQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGltZ190b19sb2FkKGRhdGEuZml4ZWRbaV0uaW1nKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGltZ190b19sb2FkKGRhdGEubW9iaWxlKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHN0YXJ0X2luaXRfc2xpZGUoZGF0YSl7XHJcbiAgICB2YXIgbiA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgdmFyIGltZz0kKCc8aW1nLz4nKTtcclxuICAgIGltZy5hdHRyKCd0aW1lJyxuKTtcclxuXHJcbiAgICBmdW5jdGlvbiBvbl9pbWdfbG9hZCgpe1xyXG4gICAgICB2YXIgbiA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgICBpbWc9JCh0aGlzKTtcclxuICAgICAgbj1uLXBhcnNlSW50KGltZy5hdHRyKCd0aW1lJykpO1xyXG4gICAgICBpZihuPm1heF90aW1lX2xvYWRfcGljKXtcclxuICAgICAgICBtb2JpbGVfbW9kZT10cnVlO1xyXG4gICAgICB9ZWxzZXtcclxuICAgICAgICB2YXIgbWF4X3NpemU9KHNjcmVlbi5oZWlnaHQ+c2NyZWVuLndpZHRoP3NjcmVlbi5oZWlnaHQ6c2NyZWVuLndpZHRoKTtcclxuICAgICAgICBpZihtYXhfc2l6ZTxtb2JpbGVfc2l6ZSl7XHJcbiAgICAgICAgICBtb2JpbGVfbW9kZT10cnVlO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgbW9iaWxlX21vZGU9ZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmKG1vYmlsZV9tb2RlPT10cnVlKXtcclxuICAgICAgICAkKGNvbnRhaW5lcl9pZCkuYWRkQ2xhc3MoJ21vYmlsZV9tb2RlJylcclxuICAgICAgfVxyXG4gICAgICByZW5kZXJfc2xpZGVfbm9tPTA7XHJcbiAgICAgIGxvYWRfc2xpZGVfaW1nKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGltZy5vbignbG9hZCcsb25faW1nX2xvYWQoKSk7XHJcbiAgICBpZihzbGlkZXJfZGF0YS5sZW5ndGg+MCkge1xyXG4gICAgICBzbGlkZXJfZGF0YVswXS5tb2JpbGUgPSBzbGlkZXJfZGF0YVswXS5tb2JpbGUgKyAnP3I9JyArIE1hdGgucmFuZG9tKCk7XHJcbiAgICAgIGltZy5wcm9wKCdzcmMnLCBzbGlkZXJfZGF0YVswXS5tb2JpbGUpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIG9uX2ltZ19sb2FkKCkuYmluZChpbWcpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW5pdChkYXRhLGVkaXRvcl9pbml0KXtcclxuICAgIHNsaWRlcl9kYXRhPWRhdGE7XHJcbiAgICBlZGl0b3I9ZWRpdG9yX2luaXQ7XHJcbiAgICAvL9C90LDRhdC+0LTQuNC8INC60L7QvdGC0LXQudC90LXRgCDQuCDQvtGH0LjRidCw0LXQvCDQtdCz0L5cclxuICAgIHZhciBjb250YWluZXI9JChjb250YWluZXJfaWQpO1xyXG4gICAgY29udGFpbmVyLmh0bWwoJycpO1xyXG5cclxuICAgIC8v0YHQvtC30LbQsNC10Lwg0LHQsNC30L7QstGL0LUg0LrQvtC90YLQtdC50L3QtdGA0Ysg0LTQu9GPINGB0LDQvNC40YUg0YHQu9Cw0LnQtNC+0LIg0Lgg0LTQu9GPINC/0LXRgNC10LrQu9GO0YfQsNGC0LXQu9C10LlcclxuICAgIHNsaWRlcz0kKCc8ZGl2Lz4nLHtcclxuICAgICAgJ2NsYXNzJzonc2xpZGVzJ1xyXG4gICAgfSk7XHJcbiAgICB2YXIgc2xpZGVfY29udHJvbD0kKCc8ZGl2Lz4nLHtcclxuICAgICAgJ2NsYXNzJzonc2xpZGVfY29udHJvbCdcclxuICAgIH0pO1xyXG4gICAgc2xpZGVfc2VsZWN0X2JveD0kKCc8dWwvPicse1xyXG4gICAgICAnY2xhc3MnOidzbGlkZV9zZWxlY3RfYm94J1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy/QtNC+0LHQsNCy0LvRj9C10Lwg0LjQvdC00LjQutCw0YLQvtGAINC30LDQs9GA0YPQt9C60LhcclxuICAgIHZhciBsPSc8ZGl2IGNsYXNzPVwic2stZm9sZGluZy1jdWJlXCI+JytcclxuICAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTEgc2stY3ViZVwiPjwvZGl2PicrXHJcbiAgICAgICAnPGRpdiBjbGFzcz1cInNrLWN1YmUyIHNrLWN1YmVcIj48L2Rpdj4nK1xyXG4gICAgICAgJzxkaXYgY2xhc3M9XCJzay1jdWJlNCBzay1jdWJlXCI+PC9kaXY+JytcclxuICAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTMgc2stY3ViZVwiPjwvZGl2PicrXHJcbiAgICAgICAnPC9kaXY+JztcclxuICAgIGNvbnRhaW5lci5odG1sKGwpO1xyXG5cclxuXHJcbiAgICBzdGFydF9pbml0X3NsaWRlKGRhdGFbMF0pO1xyXG5cclxuICAgIC8v0LPQtdC90LXRgNC40YDRg9C10Lwg0LrQvdC+0L/QutC4INC4INGB0LvQsNC50LTRi1xyXG4gICAgZm9yICh2YXIgaT0wO2k8ZGF0YS5sZW5ndGg7aSsrKXtcclxuICAgICAgLy9zbGlkZXMuYXBwZW5kKGdlbmVyYXRlX3NsaWRlKGRhdGFbaV0pKTtcclxuICAgICAgc2xpZGVfc2VsZWN0X2JveC5hcHBlbmQoJzxsaSBjbGFzcz1cInNsaWRlX3NlbGVjdCBkaXNhYmxlZFwiLz4nKVxyXG4gICAgfVxyXG5cclxuICAgIC8qc2xpZGVzLmZpbmQoJy5zbGlkZScpLmVxKDApXHJcbiAgICAgIC5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpXHJcbiAgICAgIC5hZGRDbGFzcygnZmlyc3Rfc2hvdycpO1xyXG4gICAgc2xpZGVfY29udHJvbC5maW5kKCdsaScpLmVxKDApLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7Ki9cclxuXHJcbiAgICBjb250YWluZXIuYXBwZW5kKHNsaWRlcyk7XHJcbiAgICBzbGlkZV9jb250cm9sLmFwcGVuZChzbGlkZV9zZWxlY3RfYm94KTtcclxuICAgIGNvbnRhaW5lci5hcHBlbmQoc2xpZGVfY29udHJvbCk7XHJcblxyXG5cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlbmRlcigpe1xyXG4gICAgaWYoIXBhcmFsbGF4X2dyb3VwKXJldHVybiBmYWxzZTtcclxuICAgIHZhciBwYXJhbGxheF9rPShwYXJhbGxheF9jb3VudGVyLTEwKS8yO1xyXG5cclxuICAgIGZvcih2YXIgaT0wO2k8cGFyYWxsYXhfZ3JvdXAubGVuZ3RoO2krKyl7XHJcbiAgICAgIHZhciBlbD1wYXJhbGxheF9ncm91cC5lcShpKTtcclxuICAgICAgdmFyIGo9ZWwuYXR0cigneicpO1xyXG4gICAgICB2YXIgdHI9J3JvdGF0ZTNkKDAuMSwwLjgsMCwnKyhwYXJhbGxheF9rKSsnZGVnKSBzY2FsZSgnKygxK2oqMC41KSsnKSB0cmFuc2xhdGVaKC0nKygxMCtqKjIwKSsncHgpJztcclxuICAgICAgZWwuY3NzKCd0cmFuc2Zvcm0nLHRyKVxyXG4gICAgfVxyXG4gICAgcGFyYWxsYXhfY291bnRlcis9cGFyYWxsYXhfZCowLjE7XHJcbiAgICBpZihwYXJhbGxheF9jb3VudGVyPj0yMClwYXJhbGxheF9kPS1wYXJhbGxheF9kO1xyXG4gICAgaWYocGFyYWxsYXhfY291bnRlcjw9MClwYXJhbGxheF9kPS1wYXJhbGxheF9kO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGluaXQ6IGluaXRcclxuICB9O1xyXG59KCkpO1xyXG4iLCI7KGZ1bmN0aW9uKCQpe1xyXG5cclxuICBmdW5jdGlvbiBhamF4X3NhdmUoZWxlbWVudCl7XHJcbiAgICB0aGlzLmluaXQoZWxlbWVudCk7XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gY2xlYXJDbGFzcygpe1xyXG4gICAgdmFyIG9wdGlvbnM9dGhpcztcclxuICAgIG9wdGlvbnMudGhpcy5wYXJlbnQoKS5yZW1vdmVDbGFzcygnYWpheFNhdmluZ0ZhaWxlZCcpO1xyXG4gICAgb3B0aW9ucy50aGlzLnBhcmVudCgpLnJlbW92ZUNsYXNzKCdhamF4U2F2aW5nT2snKTtcclxuICB9XHJcblxyXG4gIGFqYXhfc2F2ZS5wcm90b3R5cGUuaW5pdD1mdW5jdGlvbihlbGVtZW50KXtcclxuICAgIHRhZ05hbWU9ZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XHJcbiAgICBlbGVtZW50PSQoZWxlbWVudCk7XHJcbiAgICBpZih0YWdOYW1lPT1cImlucHV0XCIgfHwgdGFnTmFtZT09XCJzZWxlY3RcIil7XHJcbiAgICAgIG9iaj1lbGVtZW50O1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIG9iaj1lbGVtZW50LmZpbmQoJ2lucHV0LHNlbGVjdCcpO1xyXG4gICAgfVxyXG5cclxuICAgIHBvc3RfdXJsPWVsZW1lbnQuYXR0cignc2F2ZV91cmwnKTtcclxuICAgIHVpZD1lbGVtZW50LmF0dHIoJ3VpZCcpO1xyXG5cclxuICAgIGZvcih2YXIgaT0wO2k8b2JqLmxlbmd0aDtpKyspe1xyXG4gICAgICB2YXIgb3B0aW9ucz17XHJcbiAgICAgICAgdXJsOnBvc3RfdXJsLFxyXG4gICAgICAgIGlkOnVpZCxcclxuICAgICAgICB0aGlzOm9iai5lcShpKVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgb3B0aW9ucy50aGlzXHJcbiAgICAgICAgLm9mZignY2hhbmdlJylcclxuICAgICAgICAub24oJ2NoYW5nZScsZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgb3B0aW9ucz10aGlzO1xyXG4gICAgICAgIHZhciB2YWw9b3B0aW9ucy50aGlzLnZhbCgpO1xyXG4gICAgICAgIHZhciB0eXBlPW9wdGlvbnMudGhpcy5hdHRyKCd0eXBlJyk7XHJcbiAgICAgICAgaWYodHlwZSAmJiB0eXBlLnRvTG93ZXJDYXNlKCk9PSdjaGVja2JveCcpe1xyXG4gICAgICAgICAgaWYoIW9wdGlvbnMudGhpcy5wcm9wKCdjaGVja2VkJykpe1xyXG4gICAgICAgICAgICB2YWw9MDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHBvc3Q9e1xyXG4gICAgICAgICAgaWQ6b3B0aW9ucy5pZCxcclxuICAgICAgICAgIHZhbHVlOnZhbCxcclxuICAgICAgICAgIG5hbWU6b3B0aW9ucy50aGlzLmF0dHIoJ25hbWUnKVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIG9wdGlvbnMudGhpcy5wYXJlbnQoKS5hZGRDbGFzcygnYWpheEluU2F2aW5nJyk7XHJcbiAgICAgICAgJC5wb3N0KG9wdGlvbnMudXJsLHBvc3QsZnVuY3Rpb24oKXtcclxuICAgICAgICAgIHZhciBvcHRpb25zPXRoaXM7XHJcbiAgICAgICAgICBvcHRpb25zLnRoaXMucGFyZW50KCkucmVtb3ZlQ2xhc3MoJ2FqYXhJblNhdmluZycpO1xyXG4gICAgICAgICAgb3B0aW9ucy50aGlzLnBhcmVudCgpLmFkZENsYXNzKCdhamF4U2F2aW5nT2snKTtcclxuICAgICAgICAgIHNldFRpbWVvdXQoY2xlYXJDbGFzcy5iaW5kKG9wdGlvbnMpLDMwMDApXHJcbiAgICAgICAgfS5iaW5kKG9wdGlvbnMpKS5mYWlsKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICB2YXIgb3B0aW9ucz10aGlzO1xyXG4gICAgICAgICAgb3B0aW9ucy50aGlzLnBhcmVudCgpLnJlbW92ZUNsYXNzKCdhamF4SW5TYXZpbmcnKTtcclxuICAgICAgICAgIG9wdGlvbnMudGhpcy5wYXJlbnQoKS5hZGRDbGFzcygnYWpheFNhdmluZ0ZhaWxlZCcpO1xyXG4gICAgICAgICAgc2V0VGltZW91dChjbGVhckNsYXNzLmJpbmQob3B0aW9ucyksNDAwMClcclxuICAgICAgICB9LmJpbmQob3B0aW9ucykpXHJcbiAgICAgIH0uYmluZChvcHRpb25zKSlcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAkLmZuLmFqYXhfc2F2ZT1mdW5jdGlvbigpe1xyXG4gICAgJCh0aGlzKS5lYWNoKGZ1bmN0aW9uKCl7XHJcbiAgICAgIG5ldyBhamF4X3NhdmUodGhpcyk7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbn0pKGpRdWVyeSk7XHJcbiQoJy5hamF4X3NhdmUnKS5hamF4X3NhdmUoKTsiLCI7XHJcbiQoZnVuY3Rpb24oKSB7XHJcbiAgZnVuY3Rpb24gb25SZW1vdmUoKXtcclxuICAgICR0aGlzPSQodGhpcyk7XHJcbiAgICBwb3N0PXtcclxuICAgICAgaWQ6JHRoaXMuYXR0cigndWlkJyksXHJcbiAgICAgIHR5cGU6JHRoaXMuYXR0cignbW9kZScpXHJcbiAgICB9O1xyXG4gICAgJC5wb3N0KCR0aGlzLmF0dHIoJ3VybCcpLHBvc3QsZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgIGlmKGRhdGEgJiYgZGF0YT09J2Vycicpe1xyXG4gICAgICAgIG1zZz0kdGhpcy5kYXRhKCdyZW1vdmUtZXJyb3InKTtcclxuICAgICAgICBpZighbXNnKXtcclxuICAgICAgICAgIG1zZz0n0J3QtdCy0L7Qt9C80L7QttC90L4g0YPQtNCw0LvQuNGC0Ywg0Y3Qu9C10LzQtdC90YInO1xyXG4gICAgICAgIH1cclxuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOm1zZyx0eXBlOidlcnInfSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBtb2RlPSR0aGlzLmF0dHIoJ21vZGUnKTtcclxuICAgICAgaWYoIW1vZGUpe1xyXG4gICAgICAgIG1vZGU9J3JtJztcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYobW9kZT09J3JtJykge1xyXG4gICAgICAgIHJtID0gJHRoaXMuY2xvc2VzdCgnLnRvX3JlbW92ZScpO1xyXG4gICAgICAgIHJtX2NsYXNzID0gcm0uYXR0cigncm1fY2xhc3MnKTtcclxuICAgICAgICBpZiAocm1fY2xhc3MpIHtcclxuICAgICAgICAgICQocm1fY2xhc3MpLnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcm0ucmVtb3ZlKCk7XHJcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0KPRgdC/0LXRiNC90L7QtSDRg9C00LDQu9C10L3QuNC1LicsdHlwZTonaW5mbyd9KVxyXG4gICAgICB9XHJcbiAgICAgIGlmKG1vZGU9PSdyZWxvYWQnKXtcclxuICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgICAgICBsb2NhdGlvbi5ocmVmPWxvY2F0aW9uLmhyZWY7XHJcbiAgICAgIH1cclxuICAgIH0pLmZhaWwoZnVuY3Rpb24oKXtcclxuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0J7RiNC40LHQutCwINGD0LTQsNC70L3QuNGPJyx0eXBlOidlcnInfSk7XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgJCgnYm9keScpLm9uKCdjbGljaycsJy5hamF4X3JlbW92ZScsZnVuY3Rpb24oKXtcclxuICAgIG5vdGlmaWNhdGlvbi5jb25maXJtKHtcclxuICAgICAgY2FsbGJhY2tZZXM6b25SZW1vdmUsXHJcbiAgICAgIG9iajokKHRoaXMpXHJcbiAgICB9KVxyXG4gIH0pO1xyXG5cclxufSk7XHJcblxyXG4iLCIvLyQod2luZG93KS5sb2FkKGZ1bmN0aW9uKCkge1xyXG5cclxudmFyIGFjY29yZGlvbkNvbnRyb2wgPSAkKCcuYWNjb3JkaW9uIC5hY2NvcmRpb24tY29udHJvbCcpO1xyXG5cclxuYWNjb3JkaW9uQ29udHJvbC5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgJGFjY29yZGlvbiA9ICR0aGlzLmNsb3Nlc3QoJy5hY2NvcmRpb24nKTtcclxuXHJcbiAgICBpZiAoJGFjY29yZGlvbi5oYXNDbGFzcygnb3BlbicpKSB7XHJcbiAgICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50JykuaGlkZSgzMDApO1xyXG4gICAgICAkYWNjb3JkaW9uLnJlbW92ZUNsYXNzKCdvcGVuJylcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50Jykuc2hvdygzMDApO1xyXG4gICAgICAkYWNjb3JkaW9uLmFkZENsYXNzKCdvcGVuJylcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9KTtcclxuYWNjb3JkaW9uQ29udHJvbC5zaG93KCk7XHJcbi8vfSlcclxuXHJcbm9iamVjdHMgPSBmdW5jdGlvbiAoYSxiKSB7XHJcbiAgdmFyIGMgPSBiLFxyXG4gICAga2V5O1xyXG4gIGZvciAoa2V5IGluIGEpIHtcclxuICAgIGlmIChhLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgY1trZXldID0ga2V5IGluIGIgPyBiW2tleV0gOiBhW2tleV07XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBjO1xyXG59O1xyXG5cclxuJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcclxuICBmdW5jdGlvbiBpbWdfbG9hZF9maW5pc2goKXtcclxuICAgIGRhdGE9dGhpcztcclxuICAgIGlmKGRhdGEudHlwZT09MCkge1xyXG4gICAgICBkYXRhLmltZy5hdHRyKCdzcmMnLCBkYXRhLnNyYyk7XHJcbiAgICB9ZWxzZXtcclxuICAgICAgZGF0YS5pbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnK2RhdGEuc3JjKycpJyk7XHJcbiAgICAgIGRhdGEuaW1nLnJlbW92ZUNsYXNzKCdub19hdmEnKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8v0YLQtdGB0YIg0LvQvtCz0L4g0LzQsNCz0LDQt9C40L3QsFxyXG4gIGltZ3M9JCgnc2VjdGlvbjpub3QoLm5hdmlnYXRpb24pJykuZmluZCgnLmxvZ28gaW1nJyk7XHJcbiAgZm9yICh2YXIgaT0wO2k8aW1ncy5sZW5ndGg7aSsrKXtcclxuICAgIGltZz1pbWdzLmVxKGkpO1xyXG4gICAgc3JjPWltZy5hdHRyKCdzcmMnKTtcclxuICAgIGltZy5hdHRyKCdzcmMnLCcvaW1hZ2VzL3RlbXBsYXRlLWxvZ28uanBnJyk7XHJcbiAgICBkYXRhPXtcclxuICAgICAgc3JjOnNyYyxcclxuICAgICAgaW1nOmltZyxcclxuICAgICAgdHlwZTowIC8vINC00LvRjyBpbWdbc3JjXVxyXG4gICAgfTtcclxuICAgIGltYWdlPSQoJzxpbWcvPicse1xyXG4gICAgICBzcmM6c3JjXHJcbiAgICB9KS5vbignbG9hZCcsaW1nX2xvYWRfZmluaXNoLmJpbmQoZGF0YSkpXHJcbiAgfVxyXG5cclxuICAvL9GC0LXRgdGCINCw0LLQsNGC0LDRgNC+0Log0LIg0LrQvtC80LXQvdGC0LDRgNC40Y/RhVxyXG4gIGltZ3M9JCgnLmNvbW1lbnQtcGhvdG8nKTtcclxuICBmb3IgKHZhciBpPTA7aTxpbWdzLmxlbmd0aDtpKyspe1xyXG4gICAgaW1nPWltZ3MuZXEoaSk7XHJcbiAgICBpZihpbWcuaGFzQ2xhc3MoJ25vX2F2YScpKXtcclxuICAgICAgY29udGludWU7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNyYz1pbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJyk7XHJcbiAgICBzcmM9c3JjLnJlcGxhY2UoJ3VybChcIicsJycpO1xyXG4gICAgc3JjPXNyYy5yZXBsYWNlKCdcIiknLCcnKTtcclxuICAgIGltZy5hZGRDbGFzcygnbm9fYXZhJyk7XHJcblxyXG4gICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgvaW1hZ2VzL25vX2F2YS5wbmcpJyk7XHJcbiAgICBkYXRhPXtcclxuICAgICAgc3JjOnNyYyxcclxuICAgICAgaW1nOmltZyxcclxuICAgICAgdHlwZToxIC8vINC00LvRjyDRhNC+0L3QvtCy0YvRhSDQutCw0YDRgtC40L3QvtC6XHJcbiAgICB9O1xyXG4gICAgaW1hZ2U9JCgnPGltZy8+Jyx7XHJcbiAgICAgIHNyYzpzcmNcclxuICAgIH0pLm9uKCdsb2FkJyxpbWdfbG9hZF9maW5pc2guYmluZChkYXRhKSlcclxuICB9XHJcbn0pO1xyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gIGVscz0kKCcuYWpheF9sb2FkJyk7XHJcbiAgZm9yKGk9MDtpPGVscy5sZW5ndGg7aSsrKXtcclxuICAgIGVsPWVscy5lcShpKTtcclxuICAgIHVybD1lbC5hdHRyKCdyZXMnKTtcclxuICAgICQuZ2V0KHVybCxmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAkdGhpcz0kKHRoaXMpO1xyXG4gICAgICAkdGhpcy5odG1sKGRhdGEpO1xyXG4gICAgICBhamF4Rm9ybSgkdGhpcyk7XHJcbiAgICB9LmJpbmQoZWwpKVxyXG4gIH1cclxufSkoKTtcclxuXHJcbiQoJ2lucHV0W3R5cGU9ZmlsZV0nKS5vbignY2hhbmdlJyxmdW5jdGlvbihldnQpe1xyXG4gIHZhciBmaWxlID0gZXZ0LnRhcmdldC5maWxlczsgLy8gRmlsZUxpc3Qgb2JqZWN0XHJcbiAgdmFyIGYgPSBmaWxlWzBdO1xyXG4gIC8vIE9ubHkgcHJvY2VzcyBpbWFnZSBmaWxlcy5cclxuICBpZiAoIWYudHlwZS5tYXRjaCgnaW1hZ2UuKicpKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG5cclxuICBkYXRhPSB7XHJcbiAgICAnZWwnOiB0aGlzLFxyXG4gICAgJ2YnOiBmXHJcbiAgfTtcclxuICByZWFkZXIub25sb2FkID0gKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbihlKSB7XHJcbiAgICAgIGltZz0kKCdbZm9yPVwiJytkYXRhLmVsLm5hbWUrJ1wiXScpO1xyXG4gICAgICBpZihpbWcubGVuZ3RoPjApe1xyXG4gICAgICAgIGltZy5hdHRyKCdzcmMnLGUudGFyZ2V0LnJlc3VsdClcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9KShkYXRhKTtcclxuICAvLyBSZWFkIGluIHRoZSBpbWFnZSBmaWxlIGFzIGEgZGF0YSBVUkwuXHJcbiAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZik7XHJcbn0pO1xyXG5cclxuJCgnYm9keScpLm9uKCdjbGljaycsJ2EuYWpheEZvcm1PcGVuJyxmdW5jdGlvbihlKXtcclxuICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgaHJlZj10aGlzLmhyZWYuc3BsaXQoJyMnKTtcclxuICBocmVmPWhyZWZbaHJlZi5sZW5ndGgtMV07XHJcblxyXG4gIGRhdGE9e1xyXG4gICAgYnV0dG9uWWVzOmZhbHNlLFxyXG4gICAgbm90eWZ5X2NsYXNzOlwibm90aWZ5X3doaXRlIGxvYWRpbmdcIixcclxuICAgIHF1ZXN0aW9uOicnXHJcbiAgfTtcclxuICBtb2RhbF9jbGFzcz0kKHRoaXMpLmRhdGEoJ21vZGFsLWNsYXNzJyk7XHJcblxyXG4gIG5vdGlmaWNhdGlvbi5hbGVydChkYXRhKTtcclxuICAkLmdldCgnLycraHJlZixmdW5jdGlvbihkYXRhKXtcclxuICAgICQoJy5ub3RpZnlfYm94JykucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgICQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpLmh0bWwoZGF0YS5odG1sKTtcclxuICAgIGFqYXhGb3JtKCQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCcpKTtcclxuICAgIGlmKG1vZGFsX2NsYXNzKXtcclxuICAgICAgJCgnLm5vdGlmeV9ib3ggLm5vdGlmeV9jb250ZW50IC5yb3cnKS5hZGRDbGFzcyhtb2RhbF9jbGFzcyk7XHJcbiAgICB9XHJcbiAgfSwnanNvbicpXHJcbn0pO1xyXG5cclxuJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoe1xyXG4gIGRlbGF5OiB7XHJcbiAgICBzaG93OiA1MDAsIGhpZGU6IDIwMDBcclxuICB9XHJcbn0pO1xyXG4kKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykub24oJ2NsaWNrJyxmdW5jdGlvbiAoZSkge1xyXG4gICR0aGlzPSQodGhpcyk7XHJcbiAgaWYoJHRoaXMuY2xvc2VzdCgndWwnKS5oYXNDbGFzcygncGFnaW5hdGUnKSkge1xyXG4gICAgLy/QtNC70Y8g0L/QsNCz0LjQvdCw0YbQuNC4INGB0YHRi9C70LrQsCDQtNC+0LvQttC90LAg0YDQsNCx0L7RgtCw0YLRjFxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gIGlmKCR0aGlzLmhhc0NsYXNzKCd3b3JrSHJlZicpKXtcclxuICAgIC8v0JXRgdC70Lgg0YHRgdGL0LvQutCwINC/0L7QvNC10YfQtdC90L3QsCDQutCw0Log0YDQsNCx0L7Rh9Cw0Y8g0YLQviDQvdGD0LbQvdC+INC/0LXRgNC10YXQvtC00LjRgtGMXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIHJldHVybiBmYWxzZTtcclxufSk7XHJcblxyXG5cclxuJCgnLmFqYXgtYWN0aW9uJykuY2xpY2soZnVuY3Rpb24oZSkge1xyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxuICB2YXIgc3RhdHVzID0gJCh0aGlzKS5kYXRhKCd2YWx1ZScpO1xyXG4gIHZhciBocmVmID0gJCh0aGlzKS5hdHRyKCdocmVmJyk7XHJcbiAgdmFyIGlkcyA9ICQoJyNncmlkLWFqYXgtYWN0aW9uJykueWlpR3JpZFZpZXcoJ2dldFNlbGVjdGVkUm93cycpO1xyXG4gIGlmIChpZHMubGVuZ3RoID4gMCkge1xyXG4gICAgaWYgKCFjb25maXJtKCfQn9C+0LTRgtCy0LXRgNC00LjRgtC1INC40LfQvNC10L3QtdC90LjQtSDQt9Cw0L/QuNGB0LXQuScpKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgJC5hamF4KHtcclxuICAgICAgdXJsOiBocmVmLFxyXG4gICAgICB0eXBlOiAncG9zdCcsXHJcbiAgICAgIGRhdGFUeXBlOiAnanNvbicsXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICBzdGF0dXM6IHN0YXR1cyxcclxuICAgICAgICBpZDogaWRzXHJcbiAgICAgIH1cclxuICAgIH0pLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAkKCcjZ3JpZC1hamF4LWFjdGlvbicpLnlpaUdyaWRWaWV3KFwiYXBwbHlGaWx0ZXJcIik7XHJcbiAgICAgIGlmIChkYXRhLmVycm9yICE9IGZhbHNlKSB7XHJcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0J/RgNC+0LjQt9C+0YjQu9CwINC+0YjQuNCx0LrQsCEnLHR5cGU6J2Vycid9KVxyXG4gICAgICB9XHJcbiAgICB9KS5mYWlsKGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOifQn9GA0L7QuNC30L7RiNC70LAg0L7RiNC40LHQutCwIScsdHlwZTonZXJyJ30pXHJcbiAgICB9KTtcclxuICB9IGVsc2Uge1xyXG4gICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0J3QtdC+0LHRhdC+0LTQuNC80L4g0LLRi9Cx0YDQsNGC0Ywg0Y3Qu9C10LzQtdC90YLRiyEnLHR5cGU6J2Vycid9KVxyXG4gIH1cclxufSk7XHJcblxyXG4kKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICQoJy5lZGl0aWJsZVtkaXNhYmxlZF0nKS5vbignY2xpY2snLGZ1bmN0aW9uICgpIHtcclxuICAgICQodGhpcykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSlcclxuICB9KVxyXG5cclxuICAkKCcuZWRpdGlibGVbZGlzYWJsZWRdJykub24oJ21vdXNlZG93bicsZnVuY3Rpb24gKCkge1xyXG4gICAgJCh0aGlzKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKVxyXG4gIH0pXHJcblxyXG4gIGJ0bj0nPGJ1dHRvbiBjbGFzcz11bmxvY2s+PGkgY2xhc3M9XCJmYSBmYS11bmxvY2sgZmEtNFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT48L2J1dHRvbj4nO1xyXG4gIGJ0bj0kKGJ0bik7XHJcbiAgYnRuLm9uKCdjbGljaycsZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICR0aGlzPSQodGhpcyk7XHJcbiAgICBpbnA9JHRoaXMucHJldigpO1xyXG4gICAgaW5wLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH0pO1xyXG4gICQoJy5lZGl0aWJsZVtkaXNhYmxlZF0nKS5hZnRlcihidG4pXHJcbn0pO1xyXG5cclxuJChmdW5jdGlvbigpIHtcclxuXHJcbiAgdmFyIG1lbnUgPSB7XHJcbiAgICBjb250cm9sOiB7XHJcbiAgICAgIGhlYWRlclN0b3Jlc01lbnU6ICQoXCIjdG9wXCIpLmZpbmQoXCIuc3VibWVudS1oYW5kbFwiKSxcclxuICAgICAgc3RvcmVzU3VibWVudXM6ICQoXCIjdG9wXCIpLmZpbmQoXCIuc3VibWVudS1oYW5kbFwiKS5maW5kKFwiLnN1Ym1lbnVcIiksXHJcbiAgICAgIGV2ZW50czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHNlbGYuaGVhZGVyU3RvcmVzTWVudS5ob3ZlcihmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHZhciBzdWJtZW51ID0gJCh0aGlzKS5maW5kKCcuc3VibWVudScpO1xyXG4gICAgICAgICAgaWYoJCh3aW5kb3cpLndpZHRoKCkgPiA5OTEpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYuc3RvcmVIaWRlKTtcclxuICAgICAgICAgICAgc2VsZi5zdG9yZXNTdWJtZW51cy5jc3MoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcclxuICAgICAgICAgICAgc2VsZi5zdG9yZVNob3cgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIHN1Ym1lbnUuY2xlYXJRdWV1ZSgpO1xyXG4gICAgICAgICAgICAgIHN1Ym1lbnUuY3NzKFwiZGlzcGxheVwiLCBcImJsb2NrXCIpLmFuaW1hdGUoe1wib3BhY2l0eVwiOiAxfSwgMzUwKTtcclxuICAgICAgICAgICAgICAvLyBzZWxmLnN0b3Jlc1N1Ym1lbnUuY2xlYXJRdWV1ZSgpO1xyXG4gICAgICAgICAgICAgIC8vIHNlbGYuc3RvcmVzU3VibWVudS5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIikuYW5pbWF0ZSh7XCJvcGFjaXR5XCI6IDF9LCAzNTApO1xyXG4gICAgICAgICAgICB9LCAyMDApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgdmFyIHN1Ym1lbnUgPSAkKHRoaXMpLmZpbmQoJy5zdWJtZW51Jyk7XHJcbiAgICAgICAgICBpZigkKHdpbmRvdykud2lkdGgoKSA+IDk5MSkge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoc2VsZi5zdG9yZVNob3cpO1xyXG4gICAgICAgICAgICBzZWxmLnN0b3JlSGlkZSA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgc3VibWVudS5jbGVhclF1ZXVlKCk7XHJcbiAgICAgICAgICAgICAgc3VibWVudS5hbmltYXRlKHtcIm9wYWNpdHlcIjogMH0sIDIwMCwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIC8vIHNlbGYuc3RvcmVzU3VibWVudS5jbGVhclF1ZXVlKCk7XHJcbiAgICAgICAgICAgICAgLy8gc2VsZi5zdG9yZXNTdWJtZW51LmFuaW1hdGUoe1wib3BhY2l0eVwiOiAwfSwgMjAwLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAvLyAgICAgJCh0aGlzKS5jc3MoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcclxuICAgICAgICAgICAgICAvLyB9KTtcclxuICAgICAgICAgICAgfSwgMzAwKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcbiAgbWVudS5jb250cm9sLmV2ZW50cygpO1xyXG59KTtcclxuXHJcbi8v0YfRgtC+INCxINC40YTRgNC10LnQvNGLINC4INC60LDRgNGC0LjQvdC60Lgg0L3QtSDQstGL0LvQsNC30LjQu9C4XHJcbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgLyptX3cgPSAkKCcudGV4dC1jb250ZW50Jykud2lkdGgoKVxyXG4gIGlmIChtX3cgPCA1MCltX3cgPSBzY3JlZW4ud2lkdGggLSA0MCovXHJcbiAgbXc9c2NyZWVuLndpZHRoLTQwO1xyXG4gIHAgPSAkKCcuY29udGFpbmVyIGltZywuY29udGFpbmVyIGlmcmFtZScpO1xyXG4gICQoJy5jb250YWluZXIgaW1nJykuaGVpZ2h0KCdhdXRvJyk7XHJcbiAgZm9yIChpID0gMDsgaSA8IHAubGVuZ3RoOyBpKyspIHtcclxuICAgIGVsID0gcC5lcShpKTtcclxuICAgIHZhciBwYXJlbnQgPSBlbC5wYXJlbnQoKTtcclxuICAgIGlmKHBhcmVudFswXS50YWdOYW1lPT1cIkFcIil7XHJcbiAgICAgIGNvbnRpbnVlO1xyXG4gICAgfVxyXG4gICAgbV93ID0gcGFyZW50LndpZHRoKCk7XHJcbiAgICBpZiAobV93ID4gbXcpbV93ID0gbXc7XHJcbiAgICBpZiAoZWwud2lkdGgoKSA+IG1fdykge1xyXG4gICAgICBrID0gZWwud2lkdGgoKSAvIG1fdztcclxuICAgICAgZWwuaGVpZ2h0KGVsLmhlaWdodCgpIC8gayk7XHJcbiAgICAgIGVsLndpZHRoKG1fdylcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuLy/QtdGB0LvQuCDQvtGC0LrRgNGL0YLQviDQutCw0Log0LTQvtGH0LXRgNC90LXQtVxyXG4oZnVuY3Rpb24oKXtcclxuICBpZighd2luZG93Lm9wZW5lcilyZXR1cm47XHJcbiAgaWYoZG9jdW1lbnQucmVmZXJyZXIuaW5kZXhPZignc2VjcmV0ZGlzY291bnRlcicpPDApcmV0dXJuO1xyXG5cclxuICBocmVmPXdpbmRvdy5vcGVuZXIubG9jYXRpb24uaHJlZjtcclxuICBpZihcclxuICAgIGhyZWYuaW5kZXhPZignc29jaWFscycpPjAgfHxcclxuICAgIGhyZWYuaW5kZXhPZignbG9naW4nKT4wIHx8XHJcbiAgICBocmVmLmluZGV4T2YoJ2FkbWluJyk+MCB8fFxyXG4gICAgaHJlZi5pbmRleE9mKCdhY2NvdW50Jyk+MFxyXG4gICl7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG4gIGlmKGhyZWYuaW5kZXhPZignc3RvcmUnKT4wIHx8IGhyZWYuaW5kZXhPZignY291cG9uJyk+MCB8fCBocmVmLmluZGV4T2YoJ3NldHRpbmdzJyk+MCl7XHJcbiAgICB3aW5kb3cub3BlbmVyLmxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gIH1lbHNle1xyXG4gICAgd2luZG93Lm9wZW5lci5sb2NhdGlvbi5ocmVmPWxvY2F0aW9uLmhyZWY7XHJcbiAgfVxyXG4gIHdpbmRvdy5jbG9zZSgpO1xyXG59KSgpO1xyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG5cclxuICBmdW5jdGlvbiBpbWdfbG9hZF9maW5pc2goKXtcclxuICAgIHZhciBkYXRhPXRoaXM7XHJcbiAgICB2YXIgaW1nID0gZGF0YS5pbWc7XHJcbiAgICBpbWcud3JhcCgnPGRpdiBjbGFzcz1cImRvd25sb2FkXCI+PC9kaXY+Jyk7XHJcbiAgICB2YXIgd3JhcD1pbWcucGFyZW50KCk7XHJcbiAgICAkKCdib2R5JykuYXBwZW5kKGRhdGEuZWwpO1xyXG4gICAgc2l6ZT1kYXRhLmVsLndpZHRoKCkrXCJ4XCIrZGF0YS5lbC5oZWlnaHQoKTtcclxuICAgIGRhdGEuZWwucmVtb3ZlKCk7XHJcbiAgICB3cmFwLmFwcGVuZCgnPHNwYW4+JytzaXplKyc8L3NwYW4+IDxhIGhyZWY9XCInK2RhdGEuc3JjKydcIiBkb3dubG9hZD7QodC60LDRh9Cw0YLRjDwvYT4nKVxyXG4gIH1cclxuXHJcbiAgdmFyIGltZ3MgPSAkKCcuZG93bmxvYWRzX2ltZyBpbWcnKTtcclxuICBmb3IodmFyIGk9MDtpPGltZ3MubGVuZ3RoO2krKykge1xyXG4gICAgdmFyIGltZz1pbWdzLmVxKGkpO1xyXG4gICAgdmFyIHNyYz1pbWcuYXR0cignc3JjJyk7XHJcbiAgICBpbWFnZSA9ICQoJzxpbWcvPicsIHtcclxuICAgICAgc3JjOiBzcmNcclxuICAgIH0pO1xyXG4gICAgZGF0YSA9IHtcclxuICAgICAgc3JjOiBzcmMsXHJcbiAgICAgIGltZzogaW1nLFxyXG4gICAgICBlbDppbWFnZVxyXG4gICAgfTtcclxuICAgIGltYWdlLm9uKCdsb2FkJywgaW1nX2xvYWRfZmluaXNoLmJpbmQoZGF0YSkpXHJcbiAgfVxyXG59KSgpOyIsInZhciBub3RpZmljYXRpb24gPSAoZnVuY3Rpb24oKSB7XHJcbiAgdmFyIGNvbnRlaW5lcjtcclxuICB2YXIgbW91c2VPdmVyID0gMDtcclxuICB2YXIgdGltZXJDbGVhckFsbCA9IG51bGw7XHJcbiAgdmFyIGFuaW1hdGlvbkVuZCA9ICd3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kJztcclxuICB2YXIgdGltZSA9IDEwMDAwO1xyXG5cclxuICB2YXIgbm90aWZpY2F0aW9uX2JveCA9ZmFsc2U7XHJcbiAgdmFyIGlzX2luaXQ9ZmFsc2U7XHJcbiAgdmFyIGNvbmZpcm1fb3B0PXtcclxuICAgIHRpdGxlOlwi0KPQtNCw0LvQtdC90LjQtVwiLFxyXG4gICAgcXVlc3Rpb246XCLQktGLINC00LXQudGB0YLQstC40YLQtdC70YzQvdC+INGF0L7RgtC40YLQtSDRg9C00LDQu9C40YLRjD9cIixcclxuICAgIGJ1dHRvblllczpcItCU0LBcIixcclxuICAgIGJ1dHRvbk5vOlwi0J3QtdGCXCIsXHJcbiAgICBjYWxsYmFja1llczpmYWxzZSxcclxuICAgIGNhbGxiYWNrTm86ZmFsc2UsXHJcbiAgICBvYmo6ZmFsc2UsXHJcbiAgICBidXR0b25UYWc6J2RpdicsXHJcbiAgICBidXR0b25ZZXNEb3A6JycsXHJcbiAgICBidXR0b25Ob0RvcDonJyxcclxuICB9O1xyXG4gIHZhciBhbGVydF9vcHQ9e1xyXG4gICAgdGl0bGU6XCJcIixcclxuICAgIHF1ZXN0aW9uOlwi0KHQvtC+0LHRidC10L3QuNC1XCIsXHJcbiAgICBidXR0b25ZZXM6XCLQlNCwXCIsXHJcbiAgICBjYWxsYmFja1llczpmYWxzZSxcclxuICAgIGJ1dHRvblRhZzonZGl2JyxcclxuICAgIG9iajpmYWxzZSxcclxuICB9O1xyXG5cclxuXHJcbiAgZnVuY3Rpb24gaW5pdCgpe1xyXG4gICAgaXNfaW5pdD10cnVlO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveD0kKCcubm90aWZpY2F0aW9uX2JveCcpO1xyXG4gICAgaWYobm90aWZpY2F0aW9uX2JveC5sZW5ndGg+MClyZXR1cm47XHJcblxyXG4gICAgJCgnYm9keScpLmFwcGVuZChcIjxkaXYgY2xhc3M9J25vdGlmaWNhdGlvbl9ib3gnPjwvZGl2PlwiKTtcclxuICAgIG5vdGlmaWNhdGlvbl9ib3g9JCgnLm5vdGlmaWNhdGlvbl9ib3gnKTtcclxuXHJcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsJy5ub3RpZnlfY29udHJvbCcsY2xvc2VNb2RhbCk7XHJcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsJy5ub3RpZnlfY2xvc2UnLGNsb3NlTW9kYWwpO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLGNsb3NlTW9kYWxGb24pO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY2xvc2VNb2RhbCgpe1xyXG4gICAgJCgnaHRtbCcpLnJlbW92ZUNsYXNzKCdzaG93X25vdGlmaScpO1xyXG4gICAgJCgnLm5vdGlmaWNhdGlvbl9ib3ggLm5vdGlmeV9jb250ZW50JykuaHRtbCgnJylcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNsb3NlTW9kYWxGb24oZSl7XHJcbiAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xyXG4gICAgaWYodGFyZ2V0LmNsYXNzTmFtZT09XCJub3RpZmljYXRpb25fYm94XCIpe1xyXG4gICAgICBjbG9zZU1vZGFsKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB2YXIgX3NldFVwTGlzdGVuZXJzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5ub3RpZmljYXRpb25fY2xvc2UnLCBfY2xvc2VQb3B1cCk7XHJcbiAgICAkKCdib2R5Jykub24oJ21vdXNlZW50ZXInLCAnLm5vdGlmaWNhdGlvbl9jb250YWluZXInLCBfb25FbnRlcik7XHJcbiAgICAkKCdib2R5Jykub24oJ21vdXNlbGVhdmUnLCAnLm5vdGlmaWNhdGlvbl9jb250YWluZXInLCBfb25MZWF2ZSk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIF9vbkVudGVyID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGlmKGV2ZW50KWV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBpZiAodGltZXJDbGVhckFsbCE9bnVsbCkge1xyXG4gICAgICBjbGVhclRpbWVvdXQodGltZXJDbGVhckFsbCk7XHJcbiAgICAgIHRpbWVyQ2xlYXJBbGwgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgY29udGVpbmVyLmZpbmQoJy5ub3RpZmljYXRpb25faXRlbScpLmVhY2goZnVuY3Rpb24oaSl7XHJcbiAgICAgIHZhciBvcHRpb249JCh0aGlzKS5kYXRhKCdvcHRpb24nKTtcclxuICAgICAgaWYob3B0aW9uLnRpbWVyKSB7XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KG9wdGlvbi50aW1lcik7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgbW91c2VPdmVyID0gMTtcclxuICB9O1xyXG5cclxuICB2YXIgX29uTGVhdmUgPSBmdW5jdGlvbigpIHtcclxuICAgIGNvbnRlaW5lci5maW5kKCcubm90aWZpY2F0aW9uX2l0ZW0nKS5lYWNoKGZ1bmN0aW9uKGkpe1xyXG4gICAgICAkdGhpcz0kKHRoaXMpO1xyXG4gICAgICB2YXIgb3B0aW9uPSR0aGlzLmRhdGEoJ29wdGlvbicpO1xyXG4gICAgICBpZihvcHRpb24udGltZT4wKSB7XHJcbiAgICAgICAgb3B0aW9uLnRpbWVyID0gc2V0VGltZW91dChfY2xvc2VQb3B1cC5iaW5kKG9wdGlvbi5jbG9zZSksIG9wdGlvbi50aW1lIC0gMTUwMCArIDEwMCAqIGkpO1xyXG4gICAgICAgICR0aGlzLmRhdGEoJ29wdGlvbicsb3B0aW9uKVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIG1vdXNlT3ZlciA9IDA7XHJcbiAgfTtcclxuXHJcbiAgdmFyIF9jbG9zZVBvcHVwID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGlmKGV2ZW50KWV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKS5wYXJlbnQoKTtcclxuICAgICR0aGlzLm9uKGFuaW1hdGlvbkVuZCwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICQodGhpcykucmVtb3ZlKCk7XHJcbiAgICB9KTtcclxuICAgICR0aGlzLmFkZENsYXNzKCdub3RpZmljYXRpb25faGlkZScpXHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gYWxlcnQoZGF0YSl7XHJcbiAgICBpZighZGF0YSlkYXRhPXt9O1xyXG4gICAgZGF0YT1vYmplY3RzKGFsZXJ0X29wdCxkYXRhKTtcclxuXHJcbiAgICBpZighaXNfaW5pdClpbml0KCk7XHJcblxyXG4gICAgbm90eWZ5X2NsYXNzPSdub3RpZnlfYm94ICc7XHJcbiAgICBpZihkYXRhLm5vdHlmeV9jbGFzcylub3R5ZnlfY2xhc3MrPWRhdGEubm90eWZ5X2NsYXNzO1xyXG5cclxuICAgIGJveF9odG1sPSc8ZGl2IGNsYXNzPVwiJytub3R5ZnlfY2xhc3MrJ1wiPic7XHJcbiAgICBib3hfaHRtbCs9JzxkaXYgY2xhc3M9XCJub3RpZnlfdGl0bGVcIj4nO1xyXG4gICAgYm94X2h0bWwrPWRhdGEudGl0bGU7XHJcbiAgICBib3hfaHRtbCs9JzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XHJcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XHJcblxyXG4gICAgYm94X2h0bWwrPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRlbnRcIj4nO1xyXG4gICAgYm94X2h0bWwrPWRhdGEucXVlc3Rpb247XHJcbiAgICBib3hfaHRtbCs9JzwvZGl2Pic7XHJcblxyXG4gICAgaWYoZGF0YS5idXR0b25ZZXN8fGRhdGEuYnV0dG9uTm8pIHtcclxuICAgICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfY29udHJvbFwiPic7XHJcbiAgICAgIGlmIChkYXRhLmJ1dHRvblllcylib3hfaHRtbCArPSAnPCcrZGF0YS5idXR0b25UYWcrJyBjbGFzcz1cIm5vdGlmeV9idG5feWVzXCIgJytkYXRhLmJ1dHRvblllc0RvcCsnPicgKyBkYXRhLmJ1dHRvblllcyArICc8LycrZGF0YS5idXR0b25UYWcrJz4nO1xyXG4gICAgICBpZiAoZGF0YS5idXR0b25Obylib3hfaHRtbCArPSAnPCcrZGF0YS5idXR0b25UYWcrJyBjbGFzcz1cIm5vdGlmeV9idG5fbm9cIiAnK2RhdGEuYnV0dG9uTm9Eb3ArJz4nICsgZGF0YS5idXR0b25ObyArICc8LycrZGF0YS5idXR0b25UYWcrJz4nO1xyXG4gICAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcclxuICAgIH07XHJcblxyXG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveC5odG1sKGJveF9odG1sKTtcclxuXHJcblxyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdzaG93X25vdGlmaScpO1xyXG4gICAgfSwxMDApXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjb25maXJtKGRhdGEpe1xyXG4gICAgaWYoIWRhdGEpZGF0YT17fTtcclxuICAgIGRhdGE9b2JqZWN0cyhjb25maXJtX29wdCxkYXRhKTtcclxuXHJcbiAgICBpZighaXNfaW5pdClpbml0KCk7XHJcblxyXG4gICAgYm94X2h0bWw9JzxkaXYgY2xhc3M9XCJub3RpZnlfYm94XCI+JztcclxuICAgIGJveF9odG1sKz0nPGRpdiBjbGFzcz1cIm5vdGlmeV90aXRsZVwiPic7XHJcbiAgICBib3hfaHRtbCs9ZGF0YS50aXRsZTtcclxuICAgIGJveF9odG1sKz0nPHNwYW4gY2xhc3M9XCJub3RpZnlfY2xvc2VcIj48L3NwYW4+JztcclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuXHJcbiAgICBib3hfaHRtbCs9JzxkaXYgY2xhc3M9XCJub3RpZnlfY29udGVudFwiPic7XHJcbiAgICBib3hfaHRtbCs9ZGF0YS5xdWVzdGlvbjtcclxuICAgIGJveF9odG1sKz0nPC9kaXY+JztcclxuXHJcbiAgICBpZihkYXRhLmJ1dHRvblllc3x8ZGF0YS5idXR0b25Obykge1xyXG4gICAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250cm9sXCI+JztcclxuICAgICAgaWYgKGRhdGEuYnV0dG9uWWVzKWJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2J0bl95ZXNcIj4nICsgZGF0YS5idXR0b25ZZXMgKyAnPC9kaXY+JztcclxuICAgICAgaWYgKGRhdGEuYnV0dG9uTm8pYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfYnRuX25vXCI+JyArIGRhdGEuYnV0dG9uTm8gKyAnPC9kaXY+JztcclxuICAgICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XHJcbiAgICB9XHJcblxyXG4gICAgYm94X2h0bWwrPSc8L2Rpdj4nO1xyXG4gICAgbm90aWZpY2F0aW9uX2JveC5odG1sKGJveF9odG1sKTtcclxuXHJcbiAgICBpZihkYXRhLmNhbGxiYWNrWWVzIT1mYWxzZSl7XHJcbiAgICAgIG5vdGlmaWNhdGlvbl9ib3guZmluZCgnLm5vdGlmeV9idG5feWVzJykub24oJ2NsaWNrJyxkYXRhLmNhbGxiYWNrWWVzLmJpbmQoZGF0YS5vYmopKTtcclxuICAgIH1cclxuICAgIGlmKGRhdGEuY2FsbGJhY2tObyE9ZmFsc2Upe1xyXG4gICAgICBub3RpZmljYXRpb25fYm94LmZpbmQoJy5ub3RpZnlfYnRuX25vJykub24oJ2NsaWNrJyxkYXRhLmNhbGxiYWNrTm8uYmluZChkYXRhLm9iaikpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnc2hvd19ub3RpZmknKTtcclxuICAgIH0sMTAwKVxyXG5cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG5vdGlmaShkYXRhKSB7XHJcbiAgICBpZighZGF0YSlkYXRhPXt9O1xyXG4gICAgdmFyIG9wdGlvbiA9IHt0aW1lIDogKGRhdGEudGltZXx8ZGF0YS50aW1lPT09MCk/ZGF0YS50aW1lOnRpbWV9O1xyXG4gICAgaWYgKCFjb250ZWluZXIpIHtcclxuICAgICAgY29udGVpbmVyID0gJCgnPHVsLz4nLCB7XHJcbiAgICAgICAgJ2NsYXNzJzogJ25vdGlmaWNhdGlvbl9jb250YWluZXInXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgJCgnYm9keScpLmFwcGVuZChjb250ZWluZXIpO1xyXG4gICAgICBfc2V0VXBMaXN0ZW5lcnMoKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgbGkgPSAkKCc8bGkvPicsIHtcclxuICAgICAgY2xhc3M6ICdub3RpZmljYXRpb25faXRlbSdcclxuICAgIH0pO1xyXG5cclxuICAgIGlmIChkYXRhLnR5cGUpe1xyXG4gICAgICBsaS5hZGRDbGFzcygnbm90aWZpY2F0aW9uX2l0ZW0tJyArIGRhdGEudHlwZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNsb3NlPSQoJzxzcGFuLz4nLHtcclxuICAgICAgY2xhc3M6J25vdGlmaWNhdGlvbl9jbG9zZSdcclxuICAgIH0pO1xyXG4gICAgb3B0aW9uLmNsb3NlPWNsb3NlO1xyXG4gICAgbGkuYXBwZW5kKGNsb3NlKTtcclxuXHJcbiAgICB2YXIgY29udGVudCA9ICQoJzxkaXYvPicse1xyXG4gICAgICBjbGFzczpcIm5vdGlmaWNhdGlvbl9jb250ZW50XCJcclxuICAgIH0pO1xyXG5cclxuICAgIGlmKGRhdGEudGl0bGUgJiYgZGF0YS50aXRsZS5sZW5ndGg+MCkge1xyXG4gICAgICB2YXIgdGl0bGUgPSAkKCc8aDUvPicsIHtcclxuICAgICAgICBjbGFzczogXCJub3RpZmljYXRpb25fdGl0bGVcIlxyXG4gICAgICB9KTtcclxuICAgICAgdGl0bGUuaHRtbChkYXRhLnRpdGxlKTtcclxuICAgICAgY29udGVudC5hcHBlbmQodGl0bGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB0ZXh0PSAkKCc8ZGl2Lz4nLHtcclxuICAgICAgY2xhc3M6XCJub3RpZmljYXRpb25fdGV4dFwiXHJcbiAgICB9KTtcclxuICAgIHRleHQuaHRtbChkYXRhLm1lc3NhZ2UpO1xyXG5cclxuICAgIGlmKGRhdGEuaW1nICYmIGRhdGEuaW1nLmxlbmd0aD4wKSB7XHJcbiAgICAgIHZhciBpbWcgPSAkKCc8ZGl2Lz4nLCB7XHJcbiAgICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX2ltZ1wiXHJcbiAgICAgIH0pO1xyXG4gICAgICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5pbWcrJyknKTtcclxuICAgICAgdmFyIHdyYXAgPSAkKCc8ZGl2Lz4nLCB7XHJcbiAgICAgICAgY2xhc3M6IFwid3JhcFwiXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgd3JhcC5hcHBlbmQoaW1nKTtcclxuICAgICAgd3JhcC5hcHBlbmQodGV4dCk7XHJcbiAgICAgIGNvbnRlbnQuYXBwZW5kKHdyYXApO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIGNvbnRlbnQuYXBwZW5kKHRleHQpO1xyXG4gICAgfVxyXG4gICAgbGkuYXBwZW5kKGNvbnRlbnQpO1xyXG5cclxuICAgIC8vXHJcbiAgICAvLyBpZihkYXRhLnRpdGxlICYmIGRhdGEudGl0bGUubGVuZ3RoPjApIHtcclxuICAgIC8vICAgdmFyIHRpdGxlID0gJCgnPHAvPicsIHtcclxuICAgIC8vICAgICBjbGFzczogXCJub3RpZmljYXRpb25fdGl0bGVcIlxyXG4gICAgLy8gICB9KTtcclxuICAgIC8vICAgdGl0bGUuaHRtbChkYXRhLnRpdGxlKTtcclxuICAgIC8vICAgbGkuYXBwZW5kKHRpdGxlKTtcclxuICAgIC8vIH1cclxuICAgIC8vXHJcbiAgICAvLyBpZihkYXRhLmltZyAmJiBkYXRhLmltZy5sZW5ndGg+MCkge1xyXG4gICAgLy8gICB2YXIgaW1nID0gJCgnPGRpdi8+Jywge1xyXG4gICAgLy8gICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl9pbWdcIlxyXG4gICAgLy8gICB9KTtcclxuICAgIC8vICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgnK2RhdGEuaW1nKycpJyk7XHJcbiAgICAvLyAgIGxpLmFwcGVuZChpbWcpO1xyXG4gICAgLy8gfVxyXG4gICAgLy9cclxuICAgIC8vIHZhciBjb250ZW50ID0gJCgnPGRpdi8+Jyx7XHJcbiAgICAvLyAgIGNsYXNzOlwibm90aWZpY2F0aW9uX2NvbnRlbnRcIlxyXG4gICAgLy8gfSk7XHJcbiAgICAvLyBjb250ZW50Lmh0bWwoZGF0YS5tZXNzYWdlKTtcclxuICAgIC8vXHJcbiAgICAvLyBsaS5hcHBlbmQoY29udGVudCk7XHJcbiAgICAvL1xyXG4gICAgIGNvbnRlaW5lci5hcHBlbmQobGkpO1xyXG5cclxuICAgIGlmKG9wdGlvbi50aW1lPjApe1xyXG4gICAgICBvcHRpb24udGltZXI9c2V0VGltZW91dChfY2xvc2VQb3B1cC5iaW5kKGNsb3NlKSwgb3B0aW9uLnRpbWUpO1xyXG4gICAgfVxyXG4gICAgbGkuZGF0YSgnb3B0aW9uJyxvcHRpb24pXHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgYWxlcnQ6IGFsZXJ0LFxyXG4gICAgY29uZmlybTogY29uZmlybSxcclxuICAgIG5vdGlmaTogbm90aWZpLFxyXG4gIH07XHJcblxyXG59KSgpO1xyXG5cclxuXHJcbiQoJ1tyZWY9cG9wdXBdJykub24oJ2NsaWNrJyxmdW5jdGlvbiAoZSl7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICR0aGlzPSQodGhpcyk7XHJcbiAgZWw9JCgkdGhpcy5hdHRyKCdocmVmJykpO1xyXG4gIGRhdGE9ZWwuZGF0YSgpO1xyXG5cclxuICBkYXRhLnF1ZXN0aW9uPWVsLmh0bWwoKTtcclxuICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XHJcbn0pO1xyXG4iLCIkKGZ1bmN0aW9uKCkge1xyXG5cclxuICBmdW5jdGlvbiB1cGRhdGUoZGF0YSl7XHJcbiAgICAkdGhpcz0kKHRoaXMpO1xyXG4gICAgbW9kZT0kdGhpcy5hdHRyKCdtb2RlJyk7XHJcbiAgICBpZihtb2RlPT0ncmF0ZScpe1xyXG4gICAgICAkcGFyZW50PSR0aGlzLmNsb3Nlc3QoJy5hY29yZGlvbl9jb250ZW50Jyk7XHJcbiAgICAgICRwYXJlbnQ9JHBhcmVudC5maW5kKCd0YWJsZScpO1xyXG4gICAgICBkYXRhPSQoZGF0YSk7XHJcbiAgICAgIGRhdGEuYWpheF9zYXZlKCk7XHJcbiAgICAgICRwYXJlbnQuYXBwZW5kKGRhdGEpXHJcbiAgICB9XHJcblxyXG4gICAgaWYobW9kZT09J3RhcmlmZicpe1xyXG4gICAgICAkcGFyZW50PSR0aGlzLmNsb3Nlc3QoJy5hY29yZGlvbl9jb250ZW50Jyk7XHJcbiAgICAgIGRhdGE9JChkYXRhKTtcclxuICAgICAgZGF0YS5maW5kKCcuYWpheF9zYXZlJykuYWpheF9zYXZlKCk7XHJcbiAgICAgICRwYXJlbnQuYXBwZW5kKGRhdGEpXHJcbiAgICB9XHJcblxyXG4gICAgaWYobW9kZT09J2FjdGlvbicpe1xyXG4gICAgICAkcGFyZW50PSR0aGlzLmNsb3Nlc3QoJy5jcGFfYm94Jyk7XHJcbiAgICAgIGRhdGE9JChkYXRhKTtcclxuICAgICAgZGF0YS5maW5kKCcuYWpheF9zYXZlJykuYWpheF9zYXZlKCk7XHJcbiAgICAgICRwYXJlbnQuYXBwZW5kKGRhdGEpXHJcbiAgICB9XHJcblxyXG4gICAgaWYobW9kZT09J2NwYScpe1xyXG4gICAgICBkYXRhPUpTT04ucGFyc2UoZGF0YSk7XHJcblxyXG4gICAgICAkcGFyZW50PSR0aGlzLmNsb3Nlc3QoJy50YXJpZl9zZWxlY3RfYmxrJyk7XHJcblxyXG4gICAgICAkcGFyZW50LnByZXBlbmQoZGF0YVsndGFiX2hlYWRfc3VmJ10pO1xyXG4gICAgICAkcGFyZW50LmZpbmQoJy50YWJfY29udHJvbCcpXHJcbiAgICAgICAgLmFwcGVuZChkYXRhWyd0YWJfaGVhZF9idXQnXSlcclxuICAgICAgICAuYWpheF9zYXZlKCk7XHJcblxyXG4gICAgICBkYXRhPSQoZGF0YVsndGFiX2JvZHknXSk7XHJcbiAgICAgIGRhdGEuZmluZCgnLmFqYXhfc2F2ZScpLmFqYXhfc2F2ZSgpO1xyXG4gICAgICAkcGFyZW50XHJcbiAgICAgICAgLmZpbmQoJy5jb250ZW50X3RhYicpXHJcbiAgICAgICAgLmFwcGVuZChkYXRhKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgJCgnYm9keScpLm9uKCdjbGljaycsJy5hZGRfc2hvcF9lbGVtZW50JyxmdW5jdGlvbigpe1xyXG4gICAgJHRoaXM9JCh0aGlzKTtcclxuICAgIHBvc3Q9e1xyXG4gICAgICBjb2RlOiR0aGlzLmF0dHIoJ2NvZGUnKSxcclxuICAgICAgcGFyZW50OiR0aGlzLmF0dHIoJ3BhcmVudCcpLFxyXG4gICAgICB0eXBlOiR0aGlzLmF0dHIoJ21vZGUnKVxyXG4gICAgfTtcclxuICAgIHVwZGF0ZUVsZW1lbnQ9dXBkYXRlLmJpbmQoJHRoaXMpO1xyXG4gICAgJC5wb3N0KFwiL2FkbWluL3N0b3Jlcy9hamF4X2luc2VydC9cIiskdGhpcy5hdHRyKCdtb2RlJykscG9zdCx1cGRhdGVFbGVtZW50KS5mYWlsKGZ1bmN0aW9uKCkge1xyXG4gICAgICBhbGVydCggXCLQntGI0LjQsdC60LAg0LTQvtCx0LDQstC70LXQvdC40Y9cIiApO1xyXG4gICAgfSlcclxuICB9KVxyXG59KTtcclxuIiwiZnVuY3Rpb24gYWpheEZvcm0oZWxzKSB7XHJcbiAgdmFyIGZpbGVBcGkgPSB3aW5kb3cuRmlsZSAmJiB3aW5kb3cuRmlsZVJlYWRlciAmJiB3aW5kb3cuRmlsZUxpc3QgJiYgd2luZG93LkJsb2IgPyB0cnVlIDogZmFsc2U7XHJcbiAgdmFyIGRlZmF1bHRzID0ge1xyXG4gICAgZXJyb3JfY2xhc3M6ICcuaGFzLWVycm9yJyxcclxuICB9O1xyXG5cclxuICBmdW5jdGlvbiBvblBvc3QocG9zdCl7XHJcbiAgICB2YXIgZGF0YT10aGlzO1xyXG4gICAgZm9ybT1kYXRhLmZvcm07XHJcbiAgICB3cmFwPWRhdGEud3JhcDtcclxuICAgIGlmKHBvc3QucmVuZGVyKXtcclxuICAgICAgcG9zdC5ub3R5ZnlfY2xhc3M9XCJub3RpZnlfd2hpdGVcIjtcclxuICAgICAgbm90aWZpY2F0aW9uLmFsZXJ0KHBvc3QpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIHdyYXAucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgICAgd3JhcC5odG1sKHBvc3QuaHRtbCk7XHJcbiAgICAgIGFqYXhGb3JtKHdyYXApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gb25GYWlsKCl7XHJcbiAgICB2YXIgZGF0YT10aGlzO1xyXG4gICAgZm9ybT1kYXRhLmZvcm07XHJcbiAgICB3cmFwPWRhdGEud3JhcDtcclxuICAgIHdyYXAucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcclxuICAgIHdyYXAuaHRtbCgnPGgzPtCj0L/RgS4uLiDQktC+0LfQvdC40LrQu9CwINC90LXQv9GA0LXQtNCy0LjQtNC10L3QvdCw0Y8g0L7RiNC40LHQutCwPGgzPicgK1xyXG4gICAgICAnPHA+0KfQsNGB0YLQviDRjdGC0L4g0L/RgNC+0LjRgdGF0L7QtNC40YIg0LIg0YHQu9GD0YfQsNC1LCDQtdGB0LvQuCDQstGLINC90LXRgdC60L7Qu9GM0LrQviDRgNCw0Lcg0L/QvtC00YDRj9C0INC90LXQstC10YDQvdC+INCy0LLQtdC70Lgg0YHQstC+0Lgg0YPRh9C10YLQvdGL0LUg0LTQsNC90L3Ri9C1LiDQndC+INCy0L7Qt9C80L7QttC90Ysg0Lgg0LTRgNGD0LPQuNC1INC/0YDQuNGH0LjQvdGLLiDQkiDQu9GO0LHQvtC8INGB0LvRg9GH0LDQtSDQvdC1INGA0LDRgdGB0YLRgNCw0LjQstCw0LnRgtC10YHRjCDQuCDQv9GA0L7RgdGC0L4g0L7QsdGA0LDRgtC40YLQtdGB0Ywg0Log0L3QsNGI0LXQvNGDINC+0L/QtdGA0LDRgtC+0YDRgyDRgdC70YPQttCx0Ysg0L/QvtC00LTQtdGA0LbQutC4LjwvcD48YnI+JyArXHJcbiAgICAgICc8cD7QodC/0LDRgdC40LHQvi48L3A+Jyk7XHJcbiAgICBhamF4Rm9ybSh3cmFwKTtcclxuXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBvblN1Ym1pdChlKXtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciBkYXRhPXRoaXM7XHJcbiAgICBmb3JtPWRhdGEuZm9ybTtcclxuICAgIHdyYXA9ZGF0YS53cmFwO1xyXG5cclxuICAgIGlmKGZvcm0ueWlpQWN0aXZlRm9ybSl7XHJcbiAgICAgIGZvcm0ueWlpQWN0aXZlRm9ybSgndmFsaWRhdGUnKTtcclxuICAgIH07XHJcblxyXG4gICAgaXNWYWxpZD0oZm9ybS5maW5kKGRhdGEucGFyYW0uZXJyb3JfY2xhc3MpLmxlbmd0aD09MCk7XHJcblxyXG4gICAgaWYoIWlzVmFsaWQpe1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9ZWxzZXtcclxuICAgICAgcmVxdWlyZWQ9Zm9ybS5maW5kKCdpbnB1dC5yZXF1aXJlZCcpO1xyXG4gICAgICBmb3IoaT0wO2k8cmVxdWlyZWQubGVuZ3RoO2krKyl7XHJcbiAgICAgICAgaWYocmVxdWlyZWQuZXEoaSkudmFsKCkubGVuZ3RoPDEpe1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYoIWZvcm0uc2VyaWFsaXplT2JqZWN0KWFkZFNSTygpO1xyXG5cclxuICAgIHZhciBwb3N0PWZvcm0uc2VyaWFsaXplT2JqZWN0KCk7XHJcbiAgICBmb3JtLmFkZENsYXNzKCdsb2FkaW5nJyk7XHJcbiAgICBmb3JtLmh0bWwoJycpO1xyXG4gICAgd3JhcC5odG1sKCc8ZGl2IHN0eWxlPVwidGV4dC1hbGlnbjpjZW50ZXI7XCI+PHA+0J7RgtC/0YDQsNCy0LrQsCDQtNCw0L3QvdGL0YU8L3A+PC9kaXY+Jyk7XHJcblxyXG4gICAgZGF0YS51cmwrPShkYXRhLnVybC5pbmRleE9mKCc/Jyk+MD8nJic6Jz8nKSsncmM9JytNYXRoLnJhbmRvbSgpO1xyXG5cclxuICAgICQucG9zdChcclxuICAgICAgZGF0YS51cmwsXHJcbiAgICAgIHBvc3QsXHJcbiAgICAgIG9uUG9zdC5iaW5kKGRhdGEpLFxyXG4gICAgICAnanNvbidcclxuICAgICkuZmFpbChvbkZhaWwuYmluZChkYXRhKSk7XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgZWxzLmZpbmQoJ1tyZXF1aXJlZF0nKVxyXG4gICAgLmFkZENsYXNzKCdyZXF1aXJlZCcpXHJcbiAgICAucmVtb3ZlQXR0cigncmVxdWlyZWQnKTtcclxuXHJcbiAgZm9yKHZhciBpPTA7aTxlbHMubGVuZ3RoO2krKyl7XHJcbiAgICB3cmFwPWVscy5lcShpKTtcclxuICAgIGZvcm09d3JhcC5maW5kKCdmb3JtJyk7XHJcbiAgICBkYXRhPXtcclxuICAgICAgZm9ybTpmb3JtLFxyXG4gICAgICBwYXJhbTpkZWZhdWx0cyxcclxuICAgICAgd3JhcDp3cmFwXHJcbiAgICB9O1xyXG4gICAgZGF0YS51cmw9Zm9ybS5hdHRyKCdhY3Rpb24nKSB8fCBsb2NhdGlvbi5ocmVmO1xyXG4gICAgZGF0YS5tZXRob2Q9IGZvcm0uYXR0cignbWV0aG9kJykgfHwgJ3Bvc3QnO1xyXG4gICAgZm9ybS5vZmYoJ3N1Ym1pdCcpO1xyXG4gICAgZm9ybS5vbignc3VibWl0Jywgb25TdWJtaXQuYmluZChkYXRhKSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBhZGRTUk8oKXtcclxuICAkLmZuLnNlcmlhbGl6ZU9iamVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBvID0ge307XHJcbiAgICB2YXIgYSA9IHRoaXMuc2VyaWFsaXplQXJyYXkoKTtcclxuICAgICQuZWFjaChhLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGlmIChvW3RoaXMubmFtZV0pIHtcclxuICAgICAgICBpZiAoIW9bdGhpcy5uYW1lXS5wdXNoKSB7XHJcbiAgICAgICAgICBvW3RoaXMubmFtZV0gPSBbb1t0aGlzLm5hbWVdXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgb1t0aGlzLm5hbWVdLnB1c2godGhpcy52YWx1ZSB8fCAnJyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgb1t0aGlzLm5hbWVdID0gdGhpcy52YWx1ZSB8fCAnJztcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbztcclxuICB9O1xyXG59O1xyXG5hZGRTUk8oKTsiXX0=
