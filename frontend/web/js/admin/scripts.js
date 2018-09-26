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
    box_html += '<div>'+data.title+'</div>';
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

    if (form.yiiActiveForm) {
      form.off('afterValidate')
      form.on('afterValidate', yiiValidation.bind(data));

      form.yiiActiveForm('validate', true);
      var d = form.data('yiiActiveForm');
      if (d) {
        d.validated = true;
        form.data('yiiActiveForm', d);
        form.yiiActiveForm('validate');
        isValid = d.validated;
      }
      e.stopImmediatePropagation();
      e.stopPropagation();
      return false
    }

    isValid = isValid && (form.find(data.param.error_class).length == 0);

    if (!isValid) {
      return false;
    } else {
      e.stopImmediatePropagation();
      e.stopPropagation();

      sendForm(data);
    }
  }

  function yiiValidation(e) {
    var form = data.form;

    if(form.find(data.param.error_class).length == 0){
      sendForm(this);
    }
    return true;
  }

  function sendForm(data){
    var form = data.form;

    if (!form.serializeObject)addSRO();

    var postData = form.serializeObject();
    form.addClass('loading');
    form.html('');
    data.wrap.html('<div style="text-align:center;"><p>'+lg('sending_data')+'</p></div>');

    data.url += (data.url.indexOf('?') > 0 ? '&' : '?') + 'rc=' + Math.random();
    //console.log(data.url);

    /*if(!postData.returnUrl){
      postData.returnUrl=location.href;
    }*/

    if(data.url.indexOf(lang["href_prefix"])==-1){
      data.url="/"+lang["href_prefix"]+data.url;
      data.url=data.url.replace('//','/').replace('//','/');
    }

    $.post(
      data.url,
      postData,
      onPost.bind(data),
      'json'
    ).fail(onFail.bind(data));
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
  els=$('.ajax_load').not('a');
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
    }).done(function(data) {
      $('#grid-ajax-action').yiiGridView("applyFilter");
      if (data.error != false) {
          notification.notifi({message:'Произошла ошибка!',type:'err'})
      } else {
          notification.notifi({message:'Операция выполнена!',type:'success'})
      }

    }).fail(function(data){
      if(data.status==302)return;
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
(function(){

    $('body').on('beforeValidate', 'form', function(){
        var that = this;
        var isValid = true;
        var required = $(that).find('input[required="true"], input[aria-required="true"], textarea[required="true"], textarea[aria-required="true"]');
        var firstError = true;
        for (var i = 0; i < required.length; i++) {
            if (required.eq(i).val().length < 1) {
                isValid = false;
                notification.notifi({
                    'type': 'err',
                    'message': 'Необходимо заполнить ' + required.eq(i).attr('name')
                });
                if (firstError) {
                    firstError = false;
                    //позиционирование на input
                    $('html, body').animate({scrollTop: $(required.eq(i)).offset().top}, 500);
                    var tab = $(required.eq(i)).closest('.cpa_box');
                    if (tab) {
                        var classes = tab[0].classList;
                        for (var j=0; j < classes.length; j++) {
                            if (classes[j].indexOf('tab_') > -1) {
                                var tabIndex = classes[j].substring(4);
                                $(that).find('input[type="radio"][value="'+tabIndex+'"]').prop('checked', true);
                            }
                        }
                    }
                }
            }
        }
        if (!isValid) {
            return false;
        }
    });

})();

/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 * @version 1.2.1
 *
 * http://wenzhixin.net.cn/p/multiple-select/
 */

(function ($) {

    'use strict';

    // it only does '%s', and return '' when arguments are undefined
    var sprintf = function (str) {
        var args = arguments,
            flag = true,
            i = 1;

        str = str.replace(/%s/g, function () {
            var arg = args[i++];

            if (typeof arg === 'undefined') {
                flag = false;
                return '';
            }
            return arg;
        });
        return flag ? str : '';
    };

    var removeDiacritics = function (str) {
        var defaultDiacriticsRemovalMap = [
            {'base':'A', 'letters':/[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g},
            {'base':'AA','letters':/[\uA732]/g},
            {'base':'AE','letters':/[\u00C6\u01FC\u01E2]/g},
            {'base':'AO','letters':/[\uA734]/g},
            {'base':'AU','letters':/[\uA736]/g},
            {'base':'AV','letters':/[\uA738\uA73A]/g},
            {'base':'AY','letters':/[\uA73C]/g},
            {'base':'B', 'letters':/[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g},
            {'base':'C', 'letters':/[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g},
            {'base':'D', 'letters':/[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g},
            {'base':'DZ','letters':/[\u01F1\u01C4]/g},
            {'base':'Dz','letters':/[\u01F2\u01C5]/g},
            {'base':'E', 'letters':/[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g},
            {'base':'F', 'letters':/[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g},
            {'base':'G', 'letters':/[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g},
            {'base':'H', 'letters':/[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g},
            {'base':'I', 'letters':/[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g},
            {'base':'J', 'letters':/[\u004A\u24BF\uFF2A\u0134\u0248]/g},
            {'base':'K', 'letters':/[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g},
            {'base':'L', 'letters':/[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g},
            {'base':'LJ','letters':/[\u01C7]/g},
            {'base':'Lj','letters':/[\u01C8]/g},
            {'base':'M', 'letters':/[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g},
            {'base':'N', 'letters':/[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g},
            {'base':'NJ','letters':/[\u01CA]/g},
            {'base':'Nj','letters':/[\u01CB]/g},
            {'base':'O', 'letters':/[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g},
            {'base':'OI','letters':/[\u01A2]/g},
            {'base':'OO','letters':/[\uA74E]/g},
            {'base':'OU','letters':/[\u0222]/g},
            {'base':'P', 'letters':/[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g},
            {'base':'Q', 'letters':/[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g},
            {'base':'R', 'letters':/[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g},
            {'base':'S', 'letters':/[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g},
            {'base':'T', 'letters':/[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g},
            {'base':'TZ','letters':/[\uA728]/g},
            {'base':'U', 'letters':/[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g},
            {'base':'V', 'letters':/[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g},
            {'base':'VY','letters':/[\uA760]/g},
            {'base':'W', 'letters':/[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g},
            {'base':'X', 'letters':/[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g},
            {'base':'Y', 'letters':/[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g},
            {'base':'Z', 'letters':/[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g},
            {'base':'a', 'letters':/[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g},
            {'base':'aa','letters':/[\uA733]/g},
            {'base':'ae','letters':/[\u00E6\u01FD\u01E3]/g},
            {'base':'ao','letters':/[\uA735]/g},
            {'base':'au','letters':/[\uA737]/g},
            {'base':'av','letters':/[\uA739\uA73B]/g},
            {'base':'ay','letters':/[\uA73D]/g},
            {'base':'b', 'letters':/[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g},
            {'base':'c', 'letters':/[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g},
            {'base':'d', 'letters':/[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g},
            {'base':'dz','letters':/[\u01F3\u01C6]/g},
            {'base':'e', 'letters':/[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g},
            {'base':'f', 'letters':/[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g},
            {'base':'g', 'letters':/[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g},
            {'base':'h', 'letters':/[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g},
            {'base':'hv','letters':/[\u0195]/g},
            {'base':'i', 'letters':/[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g},
            {'base':'j', 'letters':/[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g},
            {'base':'k', 'letters':/[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g},
            {'base':'l', 'letters':/[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g},
            {'base':'lj','letters':/[\u01C9]/g},
            {'base':'m', 'letters':/[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g},
            {'base':'n', 'letters':/[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g},
            {'base':'nj','letters':/[\u01CC]/g},
            {'base':'o', 'letters':/[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g},
            {'base':'oi','letters':/[\u01A3]/g},
            {'base':'ou','letters':/[\u0223]/g},
            {'base':'oo','letters':/[\uA74F]/g},
            {'base':'p','letters':/[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g},
            {'base':'q','letters':/[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g},
            {'base':'r','letters':/[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g},
            {'base':'s','letters':/[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g},
            {'base':'t','letters':/[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g},
            {'base':'tz','letters':/[\uA729]/g},
            {'base':'u','letters':/[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g},
            {'base':'v','letters':/[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g},
            {'base':'vy','letters':/[\uA761]/g},
            {'base':'w','letters':/[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g},
            {'base':'x','letters':/[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g},
            {'base':'y','letters':/[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g},
            {'base':'z','letters':/[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g}
        ];

        for (var i = 0; i < defaultDiacriticsRemovalMap.length; i++) {
            str = str.replace(defaultDiacriticsRemovalMap[i].letters, defaultDiacriticsRemovalMap[i].base);
        }

        return str;

   };

    function MultipleSelect($el, options) {
        var that = this,
            name = $el.attr('name') || options.name || '';

        this.options = options;

        // hide select element
        this.$el = $el.hide();

        // label element
        this.$label = this.$el.closest('label');
        if (this.$label.length === 0 && this.$el.attr('id')) {
            this.$label = $(sprintf('label[for="%s"]', this.$el.attr('id').replace(/:/g, '\\:')));
        }

        // restore class and title from select element
        this.$parent = $(sprintf(
            '<div class="ms-parent %s" %s/>',
            $el.attr('class') || '',
            sprintf('title="%s"', $el.attr('title'))));

        // add placeholder to choice button
        this.$choice = $(sprintf([
                '<button type="button" class="ms-choice">',
                '<span class="placeholder">%s</span>',
                '<div></div>',
                '</button>'
            ].join(''),
            this.options.placeholder));

        // default position is bottom
        this.$drop = $(sprintf('<div class="ms-drop %s"%s></div>',
            this.options.position,
            sprintf(' style="width: %s"', this.options.dropWidth)));

        this.$el.after(this.$parent);
        this.$parent.append(this.$choice);
        this.$parent.append(this.$drop);

        if (this.$el.prop('disabled')) {
            this.$choice.addClass('disabled');
        }
        this.$parent.css('width',
            this.options.width ||
            this.$el.css('width') ||
            this.$el.outerWidth() + 20);

        this.selectAllName = 'data-name="selectAll' + name + '"';
        this.selectGroupName = 'data-name="selectGroup' + name + '"';
        this.selectItemName = 'data-name="selectItem' + name + '"';

        if (!this.options.keepOpen) {
            $(document).click(function (e) {
                if ($(e.target)[0] === that.$choice[0] ||
                    $(e.target).parents('.ms-choice')[0] === that.$choice[0]) {
                    return;
                }
                if (($(e.target)[0] === that.$drop[0] ||
                    $(e.target).parents('.ms-drop')[0] !== that.$drop[0] && e.target !== $el[0]) &&
                    that.options.isOpen) {
                    that.close();
                }
            });
        }
    }

    MultipleSelect.prototype = {
        constructor: MultipleSelect,

        init: function () {
            var that = this,
                $ul = $('<ul></ul>');

            this.$drop.html('');

            if (this.options.filter) {
                this.$drop.append([
                    '<div class="ms-search">',
                    '<input type="text" autocomplete="off" autocorrect="off" autocapitilize="off" spellcheck="false">',
                    '</div>'].join('')
                );
            }

            if (this.options.selectAll && !this.options.single) {
                $ul.append([
                    '<li class="ms-select-all">',
                    '<label>',
                    sprintf('<input type="checkbox" %s /> ', this.selectAllName),
                    this.options.selectAllDelimiter[0],
                    this.options.selectAllText,
                    this.options.selectAllDelimiter[1],
                    '</label>',
                    '</li>'
                ].join(''));
            }

            $.each(this.$el.children(), function (i, elm) {
                $ul.append(that.optionToHtml(i, elm));
            });
            $ul.append(sprintf('<li class="ms-no-results">%s</li>', this.options.noMatchesFound));
            this.$drop.append($ul);

            this.$drop.find('ul').css('max-height', this.options.maxHeight + 'px');
            this.$drop.find('.multiple').css('width', this.options.multipleWidth + 'px');

            this.$searchInput = this.$drop.find('.ms-search input');
            this.$selectAll = this.$drop.find('input[' + this.selectAllName + ']');
            this.$selectGroups = this.$drop.find('input[' + this.selectGroupName + ']');
            this.$selectItems = this.$drop.find('input[' + this.selectItemName + ']:enabled');
            this.$disableItems = this.$drop.find('input[' + this.selectItemName + ']:disabled');
            this.$noResults = this.$drop.find('.ms-no-results');

            this.events();
            this.updateSelectAll(true);
            this.update(true);

            if (this.options.isOpen) {
                this.open();
            }
        },

        optionToHtml: function (i, elm, group, groupDisabled) {
            var that = this,
                $elm = $(elm),
                classes = $elm.attr('class') || '',
                title = sprintf('title="%s"', $elm.attr('title')),
                multiple = this.options.multiple ? 'multiple' : '',
                disabled,
                type = this.options.single ? 'radio' : 'checkbox';

            if ($elm.is('option')) {
                var value = $elm.val(),
                    text = that.options.textTemplate($elm),
                    selected = $elm.prop('selected'),
                    style = sprintf('style="%s"', this.options.styler(value)),
                    $el;

                disabled = groupDisabled || $elm.prop('disabled');

                $el = $([
                    sprintf('<li class="%s %s" %s %s>', multiple, classes, title, style),
                    sprintf('<label class="%s">', disabled ? 'disabled' : ''),
                    sprintf('<input type="%s" %s%s%s%s>',
                        type, this.selectItemName,
                        selected ? ' checked="checked"' : '',
                        disabled ? ' disabled="disabled"' : '',
                        sprintf(' data-group="%s"', group)),
                    sprintf('<span>%s</span>', text),
                    '</label>',
                    '</li>'
                ].join(''));
                $el.find('input').val(value);
                return $el;
            }
            if ($elm.is('optgroup')) {
                var label = that.options.labelTemplate($elm),
                    $group = $('<div/>');

                group = 'group_' + i;
                disabled = $elm.prop('disabled');

                $group.append([
                    '<li class="group">',
                    sprintf('<label class="optgroup %s" data-group="%s">', disabled ? 'disabled' : '', group),
                    this.options.hideOptgroupCheckboxes || this.options.single ? '' :
                        sprintf('<input type="checkbox" %s %s>',
                        this.selectGroupName, disabled ? 'disabled="disabled"' : ''),
                    label,
                    '</label>',
                    '</li>'
                ].join(''));

                $.each($elm.children(), function (i, elm) {
                    $group.append(that.optionToHtml(i, elm, group, disabled));
                });
                return $group.html();
            }
        },

        events: function () {
            var that = this,
                toggleOpen = function (e) {
                    e.preventDefault();
                    that[that.options.isOpen ? 'close' : 'open']();
                };

            if (this.$label) {
                this.$label.off('click').on('click', function (e) {
                    if (e.target.nodeName.toLowerCase() !== 'label' || e.target !== this) {
                        return;
                    }
                    toggleOpen(e);
                    if (!that.options.filter || !that.options.isOpen) {
                        that.focus();
                    }
                    e.stopPropagation(); // Causes lost focus otherwise
                });
            }

            this.$choice.off('click').on('click', toggleOpen)
                .off('focus').on('focus', this.options.onFocus)
                .off('blur').on('blur', this.options.onBlur);

            this.$parent.off('keydown').on('keydown', function (e) {
                switch (e.which) {
                    case 27: // esc key
                        that.close();
                        that.$choice.focus();
                        break;
                }
            });

            this.$searchInput.off('keydown').on('keydown',function (e) {
                // Ensure shift-tab causes lost focus from filter as with clicking away
                if (e.keyCode === 9 && e.shiftKey) {
                    that.close();
                }
            }).off('keyup').on('keyup', function (e) {
                // enter or space
                // Avoid selecting/deselecting if no choices made
                if (that.options.filterAcceptOnEnter && (e.which === 13 || e.which == 32) && that.$searchInput.val()) {
                    that.$selectAll.click();
                    that.close();
                    that.focus();
                    return;
                }
                that.filter();
            });

            this.$selectAll.off('click').on('click', function () {
                var checked = $(this).prop('checked'),
                    $items = that.$selectItems.filter(':visible');

                if ($items.length === that.$selectItems.length) {
                    that[checked ? 'checkAll' : 'uncheckAll']();
                } else { // when the filter option is true
                    that.$selectGroups.prop('checked', checked);
                    $items.prop('checked', checked);
                    that.options[checked ? 'onCheckAll' : 'onUncheckAll']();
                    that.update();
                }
            });
            this.$selectGroups.off('click').on('click', function () {
                var group = $(this).parent().attr('data-group'),
                    $items = that.$selectItems.filter(':visible'),
                    $children = $items.filter(sprintf('[data-group="%s"]', group)),
                    checked = $children.length !== $children.filter(':checked').length;

                $children.prop('checked', checked);
                that.updateSelectAll();
                that.update();
                that.options.onOptgroupClick({
                    label: $(this).parent().text(),
                    checked: checked,
                    children: $children.get(),
                    instance: that
                });
            });
            this.$selectItems.off('click').on('click', function () {
                that.updateSelectAll();
                that.update();
                that.updateOptGroupSelect();
                that.options.onClick({
                    label: $(this).parent().text(),
                    value: $(this).val(),
                    checked: $(this).prop('checked'),
                    instance: that
                });

                if (that.options.single && that.options.isOpen && !that.options.keepOpen) {
                    that.close();
                }

                if (that.options.single) {
                    var clickedVal = $(this).val();
                    that.$selectItems.filter(function() {
                        return $(this).val() !== clickedVal;
                    }).each(function() {
                        $(this).prop('checked', false);
                    });
                    that.update();
                }
            });
        },

        open: function () {
            if (this.$choice.hasClass('disabled')) {
                return;
            }
            this.options.isOpen = true;
            this.$choice.find('>div').addClass('open');
            this.$drop[this.animateMethod('show')]();

            // fix filter bug: no results show
            this.$selectAll.parent().show();
            this.$noResults.hide();

            // Fix #77: 'All selected' when no options
            if (!this.$el.children().length) {
                this.$selectAll.parent().hide();
                this.$noResults.show();
            }

            if (this.options.container) {
                var offset = this.$drop.offset();
                this.$drop.appendTo($(this.options.container));
                this.$drop.offset({
                    top: offset.top,
                    left: offset.left
                });
            }

            if (this.options.filter) {
                this.$searchInput.val('');
                this.$searchInput.focus();
                this.filter();
            }
            this.options.onOpen();
        },

        close: function () {
            this.options.isOpen = false;
            this.$choice.find('>div').removeClass('open');
            this.$drop[this.animateMethod('hide')]();
            if (this.options.container) {
                this.$parent.append(this.$drop);
                this.$drop.css({
                    'top': 'auto',
                    'left': 'auto'
                });
            }
            this.options.onClose();
        },

        animateMethod: function (method) {
            var methods = {
                show: {
                    fade: 'fadeIn',
                    slide: 'slideDown'
                },
                hide: {
                    fade: 'fadeOut',
                    slide: 'slideUp'
                }
            };

            return methods[method][this.options.animate] || method;
        },

        update: function (isInit) {
            var selects = this.options.displayValues ? this.getSelects() : this.getSelects('text'),
                $span = this.$choice.find('>span'),
                sl = selects.length;

            if (sl === 0) {
                $span.addClass('placeholder').html(this.options.placeholder);
            } else if (this.options.allSelected && sl === this.$selectItems.length + this.$disableItems.length) {
                $span.removeClass('placeholder').html(this.options.allSelected);
            } else if (this.options.ellipsis && sl > this.options.minimumCountSelected) {
                $span.removeClass('placeholder').text(selects.slice(0, this.options.minimumCountSelected)
                    .join(this.options.delimiter) + '...');
            } else if (this.options.countSelected && sl > this.options.minimumCountSelected) {
                $span.removeClass('placeholder').html(this.options.countSelected
                    .replace('#', selects.length)
                    .replace('%', this.$selectItems.length + this.$disableItems.length));
            } else {
                $span.removeClass('placeholder').text(selects.join(this.options.delimiter));
            }

            if (this.options.addTitle) {
                $span.prop('title', this.getSelects('text'));
            }

            // set selects to select
            this.$el.val(this.getSelects()).trigger('change');

            // add selected class to selected li
            this.$drop.find('li').removeClass('selected');
            this.$drop.find('input:checked').each(function () {
                $(this).parents('li').first().addClass('selected');
            });

            // trigger <select> change event
            if (!isInit) {
                this.$el.trigger('change');
            }
        },

        updateSelectAll: function (isInit) {
            var $items = this.$selectItems;

            if (!isInit) {
                $items = $items.filter(':visible');
            }
            this.$selectAll.prop('checked', $items.length &&
                $items.length === $items.filter(':checked').length);
            if (!isInit && this.$selectAll.prop('checked')) {
                this.options.onCheckAll();
            }
        },

        updateOptGroupSelect: function () {
            var $items = this.$selectItems.filter(':visible');
            $.each(this.$selectGroups, function (i, val) {
                var group = $(val).parent().attr('data-group'),
                    $children = $items.filter(sprintf('[data-group="%s"]', group));
                $(val).prop('checked', $children.length &&
                    $children.length === $children.filter(':checked').length);
            });
        },

        //value or text, default: 'value'
        getSelects: function (type) {
            var that = this,
                texts = [],
                values = [];
            this.$drop.find(sprintf('input[%s]:checked', this.selectItemName)).each(function () {
                texts.push($(this).parents('li').first().text());
                values.push($(this).val());
            });

            if (type === 'text' && this.$selectGroups.length) {
                texts = [];
                this.$selectGroups.each(function () {
                    var html = [],
                        text = $.trim($(this).parent().text()),
                        group = $(this).parent().data('group'),
                        $children = that.$drop.find(sprintf('[%s][data-group="%s"]', that.selectItemName, group)),
                        $selected = $children.filter(':checked');

                    if (!$selected.length) {
                        return;
                    }

                    html.push('[');
                    html.push(text);
                    if ($children.length > $selected.length) {
                        var list = [];
                        $selected.each(function () {
                            list.push($(this).parent().text());
                        });
                        html.push(': ' + list.join(', '));
                    }
                    html.push(']');
                    texts.push(html.join(''));
                });
            }
            return type === 'text' ? texts : values;
        },

        setSelects: function (values) {
            var that = this;
            this.$selectItems.prop('checked', false);
            this.$disableItems.prop('checked', false);
            $.each(values, function (i, value) {
                that.$selectItems.filter(sprintf('[value="%s"]', value)).prop('checked', true);
                that.$disableItems.filter(sprintf('[value="%s"]', value)).prop('checked', true);
            });
            this.$selectAll.prop('checked', this.$selectItems.length ===
                this.$selectItems.filter(':checked').length + this.$disableItems.filter(':checked').length);

            $.each(that.$selectGroups, function (i, val) {
                var group = $(val).parent().attr('data-group'),
                    $children = that.$selectItems.filter('[data-group="' + group + '"]');
                $(val).prop('checked', $children.length &&
                    $children.length === $children.filter(':checked').length);
            });

            this.update();
        },

        enable: function () {
            this.$choice.removeClass('disabled');
        },

        disable: function () {
            this.$choice.addClass('disabled');
        },

        checkAll: function () {
            this.$selectItems.prop('checked', true);
            this.$selectGroups.prop('checked', true);
            this.$selectAll.prop('checked', true);
            this.update();
            this.options.onCheckAll();
        },

        uncheckAll: function () {
            this.$selectItems.prop('checked', false);
            this.$selectGroups.prop('checked', false);
            this.$selectAll.prop('checked', false);
            this.update();
            this.options.onUncheckAll();
        },

        focus: function () {
            this.$choice.focus();
            this.options.onFocus();
        },

        blur: function () {
            this.$choice.blur();
            this.options.onBlur();
        },

        refresh: function () {
            this.init();
        },
		
        destroy: function () {
            this.$el.show();
            this.$parent.remove();
            this.$el.data('multipleSelect', null);
        },

        filter: function () {
            var that = this,
                text = $.trim(this.$searchInput.val()).toLowerCase();

            if (text.length === 0) {
                this.$selectAll.parent().show();
                this.$selectItems.parent().show();
                this.$disableItems.parent().show();
                this.$selectGroups.parent().show();
                this.$noResults.hide();
            } else {
                this.$selectItems.each(function () {
                    var $parent = $(this).parent();
                    $parent[removeDiacritics($parent.text().toLowerCase()).indexOf(removeDiacritics(text)) < 0 ? 'hide' : 'show']();
                });
                this.$disableItems.parent().hide();
                this.$selectGroups.each(function () {
                    var $parent = $(this).parent();
                    var group = $parent.attr('data-group'),
                        $items = that.$selectItems.filter(':visible');
                    $parent[$items.filter(sprintf('[data-group="%s"]', group)).length ? 'show' : 'hide']();
                });

                //Check if no matches found
                if (this.$selectItems.parent().filter(':visible').length) {
                    this.$selectAll.parent().show();
                    this.$noResults.hide();
                } else {
                    this.$selectAll.parent().hide();
                    this.$noResults.show();
                }
            }
            this.updateOptGroupSelect();
            this.updateSelectAll();
            this.options.onFilter(text);
        }
    };

    $.fn.multipleSelect = function () {
        var option = arguments[0],
            args = arguments,

            value,
            allowedMethods = [
                'getSelects', 'setSelects',
                'enable', 'disable',
                'open', 'close',
                'checkAll', 'uncheckAll',
                'focus', 'blur',
                'refresh', 'destroy'
            ];

        this.each(function () {
            var $this = $(this),
                data = $this.data('multipleSelect'),
                options = $.extend({}, $.fn.multipleSelect.defaults,
                    $this.data(), typeof option === 'object' && option);

            if (!data) {
                data = new MultipleSelect($this, options);
                $this.data('multipleSelect', data);
            }

            if (typeof option === 'string') {
                if ($.inArray(option, allowedMethods) < 0) {
                    throw 'Unknown method: ' + option;
                }
                value = data[option](args[1]);
            } else {
                data.init();
                if (args[1]) {
                    value = data[args[1]].apply(data, [].slice.call(args, 2));
                }
            }
        });

        return typeof value !== 'undefined' ? value : this;
    };

    $.fn.multipleSelect.defaults = {
        name: '',
        isOpen: false,
        placeholder: '',
        selectAll: true,
        selectAllDelimiter: ['[', ']'],
        minimumCountSelected: 3,
        ellipsis: false,
        multiple: false,
        multipleWidth: 80,
        single: false,
        filter: false,
        width: undefined,
        dropWidth: undefined,
        maxHeight: 250,
        container: null,
        position: 'bottom',
        keepOpen: false,
        animate: 'none', // 'none', 'fade', 'slide'
        displayValues: false,
        delimiter: ', ',
        addTitle: false,
        filterAcceptOnEnter: false,
        hideOptgroupCheckboxes: false,

        selectAllText: 'Select all',
        allSelected: 'All selected',
        countSelected: '# of % selected',
        noMatchesFound: 'No matches found',

        styler: function () {
            return false;
        },
        textTemplate: function ($elm) {
            return $elm.html();
        },
        labelTemplate: function ($elm) {
            return $elm.attr('label');
        },

        onOpen: function () {
            return false;
        },
        onClose: function () {
            return false;
        },
        onCheckAll: function () {
            return false;
        },
        onUncheckAll: function () {
            return false;
        },
        onFocus: function () {
            return false;
        },
        onBlur: function () {
            return false;
        },
        onOptgroupClick: function () {
            return false;
        },
        onClick: function () {
            return false;
        },
        onFilter: function () {
            return false;
        }
    };

  $('select[multiple]').multipleSelect();
})(jQuery);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxhbmd1YWdlLmpzIiwianF1ZXJ5Lm1lbnUtYWltLmpzIiwiY2lyY2xlcy5taW4uanMiLCJkYXRlcGlja2VyLmpzIiwianF1ZXJ5Lm5vdHkucGFja2FnZWQubWluLmpzIiwianF1ZXJ5Lm1vY2tqYXguanMiLCJqcXVlcnkuYXV0b2NvbXBsZXRlLmpzIiwic2VsZWN0Mi5mdWxsLm1pbi5qcyIsIm1haW5fYWRtaW4uanMiLCJzbGlkZXIuanMiLCJhamF4X3NhdmUuanMiLCJhamF4X3JlbW92ZS5qcyIsIm5vdGlmaWNhdGlvbi5qcyIsInN0b3Jlcy5qcyIsImpxdWVyeS5hamF4Rm9ybS5qcyIsImZvcl9hbGwuanMiLCJmb3JtLmpzIiwibXVsdGlwbGUtc2VsZWN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNub0RBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4bEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzE5QkE7QUFDQTtBQUNBO0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcmdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbFhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGxnID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgbGFuZz17fTtcbiAgdXJsPScvbGFuZ3VhZ2UvJytkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQubGFuZysnLmpzb24nO1xuICAkLmdldCh1cmwsZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAvL2NvbnNvbGUubG9nKGRhdGEpO1xuICAgIGZvcih2YXIgaW5kZXggaW4gZGF0YSkge1xuICAgICAgZGF0YVtpbmRleF09Y2xlYXJWYXIoZGF0YVtpbmRleF0pO1xuICAgIH1cbiAgICBsYW5nPWRhdGE7XG4gICAgdmFyIGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KFwibGFuZ3VhZ2VfbG9hZGVkXCIpO1xuICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgIC8vY29uc29sZS5sb2coZGF0YSwgZXZlbnQpO1xuICB9LCdqc29uJyk7XG5cbiAgZnVuY3Rpb24gY2xlYXJWYXIodHh0KXtcbiAgICB0eHQ9dHh0LnJlcGxhY2UoL1xccysvZyxcIiBcIik7Ly/Rg9C00LDQu9C10L3QuNC1INC30LDQtNCy0L7QtdC90LjQtSDQv9GA0L7QsdC10LvQvtCyXG5cbiAgICAvL9Cn0LjRgdGC0LjQvCDQv9C+0LTRgdGC0LDQstC70Y/QtdC80YvQtSDQv9C10YDQtdC80LXQvdC90YvQtVxuICAgIHN0cj10eHQubWF0Y2goL1xceyguKj8pXFx9L2cpO1xuICAgIGlmICggc3RyICE9IG51bGwpIHtcbiAgICAgIGZvciAoIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBzdHJfdD1zdHJbaV0ucmVwbGFjZSgvIC9nLFwiXCIpO1xuICAgICAgICB0eHQ9dHh0LnJlcGxhY2Uoc3RyW2ldLHN0cl90KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHR4dDtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbih0cGwsIGRhdGEpe1xuICAgIGlmKHR5cGVvZihsYW5nW3RwbF0pPT1cInVuZGVmaW5lZFwiKXtcbiAgICAgIGNvbnNvbGUubG9nKFwibGFuZyBub3QgZm91bmQ6IFwiK3RwbCk7XG4gICAgICByZXR1cm4gdHBsO1xuICAgIH1cbiAgICB0cGw9bGFuZ1t0cGxdO1xuICAgIGlmKHR5cGVvZihkYXRhKT09XCJvYmplY3RcIil7XG4gICAgICBmb3IodmFyIGluZGV4IGluIGRhdGEpIHtcbiAgICAgICAgdHBsPXRwbC5zcGxpdChcIntcIitpbmRleCtcIn1cIikuam9pbihkYXRhW2luZGV4XSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cGw7XG4gIH1cbn0pKCk7IiwiLyoqXG4gKiBtZW51LWFpbSBpcyBhIGpRdWVyeSBwbHVnaW4gZm9yIGRyb3Bkb3duIG1lbnVzIHRoYXQgY2FuIGRpZmZlcmVudGlhdGVcbiAqIGJldHdlZW4gYSB1c2VyIHRyeWluZyBob3ZlciBvdmVyIGEgZHJvcGRvd24gaXRlbSB2cyB0cnlpbmcgdG8gbmF2aWdhdGUgaW50b1xuICogYSBzdWJtZW51J3MgY29udGVudHMuXG4gKlxuICogbWVudS1haW0gYXNzdW1lcyB0aGF0IHlvdSBoYXZlIGFyZSB1c2luZyBhIG1lbnUgd2l0aCBzdWJtZW51cyB0aGF0IGV4cGFuZFxuICogdG8gdGhlIG1lbnUncyByaWdodC4gSXQgd2lsbCBmaXJlIGV2ZW50cyB3aGVuIHRoZSB1c2VyJ3MgbW91c2UgZW50ZXJzIGEgbmV3XG4gKiBkcm9wZG93biBpdGVtICphbmQqIHdoZW4gdGhhdCBpdGVtIGlzIGJlaW5nIGludGVudGlvbmFsbHkgaG92ZXJlZCBvdmVyLlxuICpcbiAqIF9fX19fX19fX19fX19fX19fX19fX19fX19fXG4gKiB8IE1vbmtleXMgID58ICAgR29yaWxsYSAgfFxuICogfCBHb3JpbGxhcyA+fCAgIENvbnRlbnQgIHxcbiAqIHwgQ2hpbXBzICAgPnwgICBIZXJlICAgICB8XG4gKiB8X19fX19fX19fX198X19fX19fX19fX19ffFxuICpcbiAqIEluIHRoZSBhYm92ZSBleGFtcGxlLCBcIkdvcmlsbGFzXCIgaXMgc2VsZWN0ZWQgYW5kIGl0cyBzdWJtZW51IGNvbnRlbnQgaXNcbiAqIGJlaW5nIHNob3duIG9uIHRoZSByaWdodC4gSW1hZ2luZSB0aGF0IHRoZSB1c2VyJ3MgY3Vyc29yIGlzIGhvdmVyaW5nIG92ZXJcbiAqIFwiR29yaWxsYXMuXCIgV2hlbiB0aGV5IG1vdmUgdGhlaXIgbW91c2UgaW50byB0aGUgXCJHb3JpbGxhIENvbnRlbnRcIiBhcmVhLCB0aGV5XG4gKiBtYXkgYnJpZWZseSBob3ZlciBvdmVyIFwiQ2hpbXBzLlwiIFRoaXMgc2hvdWxkbid0IGNsb3NlIHRoZSBcIkdvcmlsbGEgQ29udGVudFwiXG4gKiBhcmVhLlxuICpcbiAqIFRoaXMgcHJvYmxlbSBpcyBub3JtYWxseSBzb2x2ZWQgdXNpbmcgdGltZW91dHMgYW5kIGRlbGF5cy4gbWVudS1haW0gdHJpZXMgdG9cbiAqIHNvbHZlIHRoaXMgYnkgZGV0ZWN0aW5nIHRoZSBkaXJlY3Rpb24gb2YgdGhlIHVzZXIncyBtb3VzZSBtb3ZlbWVudC4gVGhpcyBjYW5cbiAqIG1ha2UgZm9yIHF1aWNrZXIgdHJhbnNpdGlvbnMgd2hlbiBuYXZpZ2F0aW5nIHVwIGFuZCBkb3duIHRoZSBtZW51LiBUaGVcbiAqIGV4cGVyaWVuY2UgaXMgaG9wZWZ1bGx5IHNpbWlsYXIgdG8gYW1hem9uLmNvbS8ncyBcIlNob3AgYnkgRGVwYXJ0bWVudFwiXG4gKiBkcm9wZG93bi5cbiAqXG4gKiBVc2UgbGlrZSBzbzpcbiAqXG4gKiAgICAgICQoXCIjbWVudVwiKS5tZW51QWltKHtcbiAqICAgICAgICAgIGFjdGl2YXRlOiAkLm5vb3AsICAvLyBmaXJlZCBvbiByb3cgYWN0aXZhdGlvblxuICogICAgICAgICAgZGVhY3RpdmF0ZTogJC5ub29wICAvLyBmaXJlZCBvbiByb3cgZGVhY3RpdmF0aW9uXG4gKiAgICAgIH0pO1xuICpcbiAqICAuLi50byByZWNlaXZlIGV2ZW50cyB3aGVuIGEgbWVudSdzIHJvdyBoYXMgYmVlbiBwdXJwb3NlZnVsbHkgKGRlKWFjdGl2YXRlZC5cbiAqXG4gKiBUaGUgZm9sbG93aW5nIG9wdGlvbnMgY2FuIGJlIHBhc3NlZCB0byBtZW51QWltLiBBbGwgZnVuY3Rpb25zIGV4ZWN1dGUgd2l0aFxuICogdGhlIHJlbGV2YW50IHJvdydzIEhUTUwgZWxlbWVudCBhcyB0aGUgZXhlY3V0aW9uIGNvbnRleHQgKCd0aGlzJyk6XG4gKlxuICogICAgICAubWVudUFpbSh7XG4gKiAgICAgICAgICAvLyBGdW5jdGlvbiB0byBjYWxsIHdoZW4gYSByb3cgaXMgcHVycG9zZWZ1bGx5IGFjdGl2YXRlZC4gVXNlIHRoaXNcbiAqICAgICAgICAgIC8vIHRvIHNob3cgYSBzdWJtZW51J3MgY29udGVudCBmb3IgdGhlIGFjdGl2YXRlZCByb3cuXG4gKiAgICAgICAgICBhY3RpdmF0ZTogZnVuY3Rpb24oKSB7fSxcbiAqXG4gKiAgICAgICAgICAvLyBGdW5jdGlvbiB0byBjYWxsIHdoZW4gYSByb3cgaXMgZGVhY3RpdmF0ZWQuXG4gKiAgICAgICAgICBkZWFjdGl2YXRlOiBmdW5jdGlvbigpIHt9LFxuICpcbiAqICAgICAgICAgIC8vIEZ1bmN0aW9uIHRvIGNhbGwgd2hlbiBtb3VzZSBlbnRlcnMgYSBtZW51IHJvdy4gRW50ZXJpbmcgYSByb3dcbiAqICAgICAgICAgIC8vIGRvZXMgbm90IG1lYW4gdGhlIHJvdyBoYXMgYmVlbiBhY3RpdmF0ZWQsIGFzIHRoZSB1c2VyIG1heSBiZVxuICogICAgICAgICAgLy8gbW91c2luZyBvdmVyIHRvIGEgc3VibWVudS5cbiAqICAgICAgICAgIGVudGVyOiBmdW5jdGlvbigpIHt9LFxuICpcbiAqICAgICAgICAgIC8vIEZ1bmN0aW9uIHRvIGNhbGwgd2hlbiBtb3VzZSBleGl0cyBhIG1lbnUgcm93LlxuICogICAgICAgICAgZXhpdDogZnVuY3Rpb24oKSB7fSxcbiAqXG4gKiAgICAgICAgICAvLyBTZWxlY3RvciBmb3IgaWRlbnRpZnlpbmcgd2hpY2ggZWxlbWVudHMgaW4gdGhlIG1lbnUgYXJlIHJvd3NcbiAqICAgICAgICAgIC8vIHRoYXQgY2FuIHRyaWdnZXIgdGhlIGFib3ZlIGV2ZW50cy4gRGVmYXVsdHMgdG8gXCI+IGxpXCIuXG4gKiAgICAgICAgICByb3dTZWxlY3RvcjogXCI+IGxpXCIsXG4gKlxuICogICAgICAgICAgLy8gWW91IG1heSBoYXZlIHNvbWUgbWVudSByb3dzIHRoYXQgYXJlbid0IHN1Ym1lbnVzIGFuZCB0aGVyZWZvcmVcbiAqICAgICAgICAgIC8vIHNob3VsZG4ndCBldmVyIG5lZWQgdG8gXCJhY3RpdmF0ZS5cIiBJZiBzbywgZmlsdGVyIHN1Ym1lbnUgcm93cyB3L1xuICogICAgICAgICAgLy8gdGhpcyBzZWxlY3Rvci4gRGVmYXVsdHMgdG8gXCIqXCIgKGFsbCBlbGVtZW50cykuXG4gKiAgICAgICAgICBzdWJtZW51U2VsZWN0b3I6IFwiKlwiLFxuICpcbiAqICAgICAgICAgIC8vIERpcmVjdGlvbiB0aGUgc3VibWVudSBvcGVucyByZWxhdGl2ZSB0byB0aGUgbWFpbiBtZW51LiBDYW4gYmVcbiAqICAgICAgICAgIC8vIGxlZnQsIHJpZ2h0LCBhYm92ZSwgb3IgYmVsb3cuIERlZmF1bHRzIHRvIFwicmlnaHRcIi5cbiAqICAgICAgICAgIHN1Ym1lbnVEaXJlY3Rpb246IFwicmlnaHRcIlxuICogICAgICB9KTtcbiAqXG4gKiBodHRwczovL2dpdGh1Yi5jb20va2FtZW5zL2pRdWVyeS1tZW51LWFpbVxuKi9cbihmdW5jdGlvbigkKSB7XG5cbiAgICAkLmZuLm1lbnVBaW0gPSBmdW5jdGlvbihvcHRzKSB7XG4gICAgICAgIC8vIEluaXRpYWxpemUgbWVudS1haW0gZm9yIGFsbCBlbGVtZW50cyBpbiBqUXVlcnkgY29sbGVjdGlvblxuICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpbml0LmNhbGwodGhpcywgb3B0cyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBpbml0KG9wdHMpIHtcbiAgICAgICAgdmFyICRtZW51ID0gJCh0aGlzKSxcbiAgICAgICAgICAgIGFjdGl2ZVJvdyA9IG51bGwsXG4gICAgICAgICAgICBtb3VzZUxvY3MgPSBbXSxcbiAgICAgICAgICAgIGxhc3REZWxheUxvYyA9IG51bGwsXG4gICAgICAgICAgICB0aW1lb3V0SWQgPSBudWxsLFxuICAgICAgICAgICAgb3B0aW9ucyA9ICQuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICByb3dTZWxlY3RvcjogXCI+IGxpXCIsXG4gICAgICAgICAgICAgICAgc3VibWVudVNlbGVjdG9yOiBcIipcIixcbiAgICAgICAgICAgICAgICBzdWJtZW51RGlyZWN0aW9uOiBcInJpZ2h0XCIsXG4gICAgICAgICAgICAgICAgdG9sZXJhbmNlOiA3NSwgIC8vIGJpZ2dlciA9IG1vcmUgZm9yZ2l2ZXkgd2hlbiBlbnRlcmluZyBzdWJtZW51XG4gICAgICAgICAgICAgICAgZW50ZXI6ICQubm9vcCxcbiAgICAgICAgICAgICAgICBleGl0OiAkLm5vb3AsXG4gICAgICAgICAgICAgICAgYWN0aXZhdGU6ICQubm9vcCxcbiAgICAgICAgICAgICAgICBkZWFjdGl2YXRlOiAkLm5vb3AsXG4gICAgICAgICAgICAgICAgZXhpdE1lbnU6ICQubm9vcFxuICAgICAgICAgICAgfSwgb3B0cyk7XG5cbiAgICAgICAgdmFyIE1PVVNFX0xPQ1NfVFJBQ0tFRCA9IDMsICAvLyBudW1iZXIgb2YgcGFzdCBtb3VzZSBsb2NhdGlvbnMgdG8gdHJhY2tcbiAgICAgICAgICAgIERFTEFZID0gMzAwOyAgLy8gbXMgZGVsYXkgd2hlbiB1c2VyIGFwcGVhcnMgdG8gYmUgZW50ZXJpbmcgc3VibWVudVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBLZWVwIHRyYWNrIG9mIHRoZSBsYXN0IGZldyBsb2NhdGlvbnMgb2YgdGhlIG1vdXNlLlxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIG1vdXNlbW92ZURvY3VtZW50ID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIG1vdXNlTG9jcy5wdXNoKHt4OiBlLnBhZ2VYLCB5OiBlLnBhZ2VZfSk7XG5cbiAgICAgICAgICAgICAgICBpZiAobW91c2VMb2NzLmxlbmd0aCA+IE1PVVNFX0xPQ1NfVFJBQ0tFRCkge1xuICAgICAgICAgICAgICAgICAgICBtb3VzZUxvY3Muc2hpZnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDYW5jZWwgcG9zc2libGUgcm93IGFjdGl2YXRpb25zIHdoZW4gbGVhdmluZyB0aGUgbWVudSBlbnRpcmVseVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIG1vdXNlbGVhdmVNZW51ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRpbWVvdXRJZCkge1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBJZiBleGl0TWVudSBpcyBzdXBwbGllZCBhbmQgcmV0dXJucyB0cnVlLCBkZWFjdGl2YXRlIHRoZVxuICAgICAgICAgICAgICAgIC8vIGN1cnJlbnRseSBhY3RpdmUgcm93IG9uIG1lbnUgZXhpdC5cbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5leGl0TWVudSh0aGlzKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYWN0aXZlUm93KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmRlYWN0aXZhdGUoYWN0aXZlUm93KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZVJvdyA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlciBhIHBvc3NpYmxlIHJvdyBhY3RpdmF0aW9uIHdoZW5ldmVyIGVudGVyaW5nIGEgbmV3IHJvdy5cbiAgICAgICAgICovXG4gICAgICAgIHZhciBtb3VzZWVudGVyUm93ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRpbWVvdXRJZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBDYW5jZWwgYW55IHByZXZpb3VzIGFjdGl2YXRpb24gZGVsYXlzXG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG9wdGlvbnMuZW50ZXIodGhpcyk7XG4gICAgICAgICAgICAgICAgcG9zc2libHlBY3RpdmF0ZSh0aGlzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtb3VzZWxlYXZlUm93ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5leGl0KHRoaXMpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAvKlxuICAgICAgICAgKiBJbW1lZGlhdGVseSBhY3RpdmF0ZSBhIHJvdyBpZiB0aGUgdXNlciBjbGlja3Mgb24gaXQuXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgY2xpY2tSb3cgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBhY3RpdmF0ZSh0aGlzKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFjdGl2YXRlIGEgbWVudSByb3cuXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgYWN0aXZhdGUgPSBmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgICAgICAgICBpZiAocm93ID09IGFjdGl2ZVJvdykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGFjdGl2ZVJvdykge1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmRlYWN0aXZhdGUoYWN0aXZlUm93KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBvcHRpb25zLmFjdGl2YXRlKHJvdyk7XG4gICAgICAgICAgICAgICAgYWN0aXZlUm93ID0gcm93O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUG9zc2libHkgYWN0aXZhdGUgYSBtZW51IHJvdy4gSWYgbW91c2UgbW92ZW1lbnQgaW5kaWNhdGVzIHRoYXQgd2VcbiAgICAgICAgICogc2hvdWxkbid0IGFjdGl2YXRlIHlldCBiZWNhdXNlIHVzZXIgbWF5IGJlIHRyeWluZyB0byBlbnRlclxuICAgICAgICAgKiBhIHN1Ym1lbnUncyBjb250ZW50LCB0aGVuIGRlbGF5IGFuZCBjaGVjayBhZ2FpbiBsYXRlci5cbiAgICAgICAgICovXG4gICAgICAgIHZhciBwb3NzaWJseUFjdGl2YXRlID0gZnVuY3Rpb24ocm93KSB7XG4gICAgICAgICAgICAgICAgdmFyIGRlbGF5ID0gYWN0aXZhdGlvbkRlbGF5KCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZGVsYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3NpYmx5QWN0aXZhdGUocm93KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgZGVsYXkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2YXRlKHJvdyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJuIHRoZSBhbW91bnQgb2YgdGltZSB0aGF0IHNob3VsZCBiZSB1c2VkIGFzIGEgZGVsYXkgYmVmb3JlIHRoZVxuICAgICAgICAgKiBjdXJyZW50bHkgaG92ZXJlZCByb3cgaXMgYWN0aXZhdGVkLlxuICAgICAgICAgKlxuICAgICAgICAgKiBSZXR1cm5zIDAgaWYgdGhlIGFjdGl2YXRpb24gc2hvdWxkIGhhcHBlbiBpbW1lZGlhdGVseS4gT3RoZXJ3aXNlLFxuICAgICAgICAgKiByZXR1cm5zIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRoYXQgc2hvdWxkIGJlIGRlbGF5ZWQgYmVmb3JlXG4gICAgICAgICAqIGNoZWNraW5nIGFnYWluIHRvIHNlZSBpZiB0aGUgcm93IHNob3VsZCBiZSBhY3RpdmF0ZWQuXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgYWN0aXZhdGlvbkRlbGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFhY3RpdmVSb3cgfHwgISQoYWN0aXZlUm93KS5pcyhvcHRpb25zLnN1Ym1lbnVTZWxlY3RvcikpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gb3RoZXIgc3VibWVudSByb3cgYWxyZWFkeSBhY3RpdmUsIHRoZW5cbiAgICAgICAgICAgICAgICAgICAgLy8gZ28gYWhlYWQgYW5kIGFjdGl2YXRlIGltbWVkaWF0ZWx5LlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gJG1lbnUub2Zmc2V0KCksXG4gICAgICAgICAgICAgICAgICAgIHVwcGVyTGVmdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IG9mZnNldC5sZWZ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogb2Zmc2V0LnRvcCAtIG9wdGlvbnMudG9sZXJhbmNlXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHVwcGVyUmlnaHQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBvZmZzZXQubGVmdCArICRtZW51Lm91dGVyV2lkdGgoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IHVwcGVyTGVmdC55XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGxvd2VyTGVmdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IG9mZnNldC5sZWZ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogb2Zmc2V0LnRvcCArICRtZW51Lm91dGVySGVpZ2h0KCkgKyBvcHRpb25zLnRvbGVyYW5jZVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBsb3dlclJpZ2h0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgeDogb2Zmc2V0LmxlZnQgKyAkbWVudS5vdXRlcldpZHRoKCksXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiBsb3dlckxlZnQueVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBsb2MgPSBtb3VzZUxvY3NbbW91c2VMb2NzLmxlbmd0aCAtIDFdLFxuICAgICAgICAgICAgICAgICAgICBwcmV2TG9jID0gbW91c2VMb2NzWzBdO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFsb2MpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCFwcmV2TG9jKSB7XG4gICAgICAgICAgICAgICAgICAgIHByZXZMb2MgPSBsb2M7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHByZXZMb2MueCA8IG9mZnNldC5sZWZ0IHx8IHByZXZMb2MueCA+IGxvd2VyUmlnaHQueCB8fFxuICAgICAgICAgICAgICAgICAgICBwcmV2TG9jLnkgPCBvZmZzZXQudG9wIHx8IHByZXZMb2MueSA+IGxvd2VyUmlnaHQueSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgcHJldmlvdXMgbW91c2UgbG9jYXRpb24gd2FzIG91dHNpZGUgb2YgdGhlIGVudGlyZVxuICAgICAgICAgICAgICAgICAgICAvLyBtZW51J3MgYm91bmRzLCBpbW1lZGlhdGVseSBhY3RpdmF0ZS5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGxhc3REZWxheUxvYyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jLnggPT0gbGFzdERlbGF5TG9jLnggJiYgbG9jLnkgPT0gbGFzdERlbGF5TG9jLnkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIG1vdXNlIGhhc24ndCBtb3ZlZCBzaW5jZSB0aGUgbGFzdCB0aW1lIHdlIGNoZWNrZWRcbiAgICAgICAgICAgICAgICAgICAgLy8gZm9yIGFjdGl2YXRpb24gc3RhdHVzLCBpbW1lZGlhdGVseSBhY3RpdmF0ZS5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gRGV0ZWN0IGlmIHRoZSB1c2VyIGlzIG1vdmluZyB0b3dhcmRzIHRoZSBjdXJyZW50bHkgYWN0aXZhdGVkXG4gICAgICAgICAgICAgICAgLy8gc3VibWVudS5cbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBtb3VzZSBpcyBoZWFkaW5nIHJlbGF0aXZlbHkgY2xlYXJseSB0b3dhcmRzXG4gICAgICAgICAgICAgICAgLy8gdGhlIHN1Ym1lbnUncyBjb250ZW50LCB3ZSBzaG91bGQgd2FpdCBhbmQgZ2l2ZSB0aGUgdXNlciBtb3JlXG4gICAgICAgICAgICAgICAgLy8gdGltZSBiZWZvcmUgYWN0aXZhdGluZyBhIG5ldyByb3cuIElmIHRoZSBtb3VzZSBpcyBoZWFkaW5nXG4gICAgICAgICAgICAgICAgLy8gZWxzZXdoZXJlLCB3ZSBjYW4gaW1tZWRpYXRlbHkgYWN0aXZhdGUgYSBuZXcgcm93LlxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgLy8gV2UgZGV0ZWN0IHRoaXMgYnkgY2FsY3VsYXRpbmcgdGhlIHNsb3BlIGZvcm1lZCBiZXR3ZWVuIHRoZVxuICAgICAgICAgICAgICAgIC8vIGN1cnJlbnQgbW91c2UgbG9jYXRpb24gYW5kIHRoZSB1cHBlci9sb3dlciByaWdodCBwb2ludHMgb2ZcbiAgICAgICAgICAgICAgICAvLyB0aGUgbWVudS4gV2UgZG8gdGhlIHNhbWUgZm9yIHRoZSBwcmV2aW91cyBtb3VzZSBsb2NhdGlvbi5cbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgY3VycmVudCBtb3VzZSBsb2NhdGlvbidzIHNsb3BlcyBhcmVcbiAgICAgICAgICAgICAgICAvLyBpbmNyZWFzaW5nL2RlY3JlYXNpbmcgYXBwcm9wcmlhdGVseSBjb21wYXJlZCB0byB0aGVcbiAgICAgICAgICAgICAgICAvLyBwcmV2aW91cydzLCB3ZSBrbm93IHRoZSB1c2VyIGlzIG1vdmluZyB0b3dhcmQgdGhlIHN1Ym1lbnUuXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAvLyBOb3RlIHRoYXQgc2luY2UgdGhlIHktYXhpcyBpbmNyZWFzZXMgYXMgdGhlIGN1cnNvciBtb3Zlc1xuICAgICAgICAgICAgICAgIC8vIGRvd24gdGhlIHNjcmVlbiwgd2UgYXJlIGxvb2tpbmcgZm9yIHRoZSBzbG9wZSBiZXR3ZWVuIHRoZVxuICAgICAgICAgICAgICAgIC8vIGN1cnNvciBhbmQgdGhlIHVwcGVyIHJpZ2h0IGNvcm5lciB0byBkZWNyZWFzZSBvdmVyIHRpbWUsIG5vdFxuICAgICAgICAgICAgICAgIC8vIGluY3JlYXNlIChzb21ld2hhdCBjb3VudGVyaW50dWl0aXZlbHkpLlxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHNsb3BlKGEsIGIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChiLnkgLSBhLnkpIC8gKGIueCAtIGEueCk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHZhciBkZWNyZWFzaW5nQ29ybmVyID0gdXBwZXJSaWdodCxcbiAgICAgICAgICAgICAgICAgICAgaW5jcmVhc2luZ0Nvcm5lciA9IGxvd2VyUmlnaHQ7XG5cbiAgICAgICAgICAgICAgICAvLyBPdXIgZXhwZWN0YXRpb25zIGZvciBkZWNyZWFzaW5nIG9yIGluY3JlYXNpbmcgc2xvcGUgdmFsdWVzXG4gICAgICAgICAgICAgICAgLy8gZGVwZW5kcyBvbiB3aGljaCBkaXJlY3Rpb24gdGhlIHN1Ym1lbnUgb3BlbnMgcmVsYXRpdmUgdG8gdGhlXG4gICAgICAgICAgICAgICAgLy8gbWFpbiBtZW51LiBCeSBkZWZhdWx0LCBpZiB0aGUgbWVudSBvcGVucyBvbiB0aGUgcmlnaHQsIHdlXG4gICAgICAgICAgICAgICAgLy8gZXhwZWN0IHRoZSBzbG9wZSBiZXR3ZWVuIHRoZSBjdXJzb3IgYW5kIHRoZSB1cHBlciByaWdodFxuICAgICAgICAgICAgICAgIC8vIGNvcm5lciB0byBkZWNyZWFzZSBvdmVyIHRpbWUsIGFzIGV4cGxhaW5lZCBhYm92ZS4gSWYgdGhlXG4gICAgICAgICAgICAgICAgLy8gc3VibWVudSBvcGVucyBpbiBhIGRpZmZlcmVudCBkaXJlY3Rpb24sIHdlIGNoYW5nZSBvdXIgc2xvcGVcbiAgICAgICAgICAgICAgICAvLyBleHBlY3RhdGlvbnMuXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuc3VibWVudURpcmVjdGlvbiA9PSBcImxlZnRcIikge1xuICAgICAgICAgICAgICAgICAgICBkZWNyZWFzaW5nQ29ybmVyID0gbG93ZXJMZWZ0O1xuICAgICAgICAgICAgICAgICAgICBpbmNyZWFzaW5nQ29ybmVyID0gdXBwZXJMZWZ0O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5zdWJtZW51RGlyZWN0aW9uID09IFwiYmVsb3dcIikge1xuICAgICAgICAgICAgICAgICAgICBkZWNyZWFzaW5nQ29ybmVyID0gbG93ZXJSaWdodDtcbiAgICAgICAgICAgICAgICAgICAgaW5jcmVhc2luZ0Nvcm5lciA9IGxvd2VyTGVmdDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuc3VibWVudURpcmVjdGlvbiA9PSBcImFib3ZlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVjcmVhc2luZ0Nvcm5lciA9IHVwcGVyTGVmdDtcbiAgICAgICAgICAgICAgICAgICAgaW5jcmVhc2luZ0Nvcm5lciA9IHVwcGVyUmlnaHQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGRlY3JlYXNpbmdTbG9wZSA9IHNsb3BlKGxvYywgZGVjcmVhc2luZ0Nvcm5lciksXG4gICAgICAgICAgICAgICAgICAgIGluY3JlYXNpbmdTbG9wZSA9IHNsb3BlKGxvYywgaW5jcmVhc2luZ0Nvcm5lciksXG4gICAgICAgICAgICAgICAgICAgIHByZXZEZWNyZWFzaW5nU2xvcGUgPSBzbG9wZShwcmV2TG9jLCBkZWNyZWFzaW5nQ29ybmVyKSxcbiAgICAgICAgICAgICAgICAgICAgcHJldkluY3JlYXNpbmdTbG9wZSA9IHNsb3BlKHByZXZMb2MsIGluY3JlYXNpbmdDb3JuZXIpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGRlY3JlYXNpbmdTbG9wZSA8IHByZXZEZWNyZWFzaW5nU2xvcGUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY3JlYXNpbmdTbG9wZSA+IHByZXZJbmNyZWFzaW5nU2xvcGUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTW91c2UgaXMgbW92aW5nIGZyb20gcHJldmlvdXMgbG9jYXRpb24gdG93YXJkcyB0aGVcbiAgICAgICAgICAgICAgICAgICAgLy8gY3VycmVudGx5IGFjdGl2YXRlZCBzdWJtZW51LiBEZWxheSBiZWZvcmUgYWN0aXZhdGluZyBhXG4gICAgICAgICAgICAgICAgICAgIC8vIG5ldyBtZW51IHJvdywgYmVjYXVzZSB1c2VyIG1heSBiZSBtb3ZpbmcgaW50byBzdWJtZW51LlxuICAgICAgICAgICAgICAgICAgICBsYXN0RGVsYXlMb2MgPSBsb2M7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBERUxBWTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsYXN0RGVsYXlMb2MgPSBudWxsO1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogSG9vayB1cCBpbml0aWFsIG1lbnUgZXZlbnRzXG4gICAgICAgICAqL1xuICAgICAgICAkbWVudVxuICAgICAgICAgICAgLm1vdXNlbGVhdmUobW91c2VsZWF2ZU1lbnUpXG4gICAgICAgICAgICAuZmluZChvcHRpb25zLnJvd1NlbGVjdG9yKVxuICAgICAgICAgICAgICAgIC5tb3VzZWVudGVyKG1vdXNlZW50ZXJSb3cpXG4gICAgICAgICAgICAgICAgLm1vdXNlbGVhdmUobW91c2VsZWF2ZVJvdylcbiAgICAgICAgICAgICAgICAuY2xpY2soY2xpY2tSb3cpO1xuXG4gICAgICAgICQoZG9jdW1lbnQpLm1vdXNlbW92ZShtb3VzZW1vdmVEb2N1bWVudCk7XG5cbiAgICB9O1xufSkoalF1ZXJ5KTtcblxuIiwiLyoqXG4gKiBjaXJjbGVzIC0gdjAuMC42IC0gMjAxNS0xMS0yN1xuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNSBsdWdvbGFic1xuICogTGljZW5zZWQgXG4gKi9cbiFmdW5jdGlvbihhLGIpe1wib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP21vZHVsZS5leHBvcnRzPWIoKTpcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtdLGIpOmEuQ2lyY2xlcz1iKCl9KHRoaXMsZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjt2YXIgYT13aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lfHx3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lfHx3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lfHx3aW5kb3cub1JlcXVlc3RBbmltYXRpb25GcmFtZXx8d2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lfHxmdW5jdGlvbihhKXtzZXRUaW1lb3V0KGEsMWUzLzYwKX0sYj1mdW5jdGlvbihhKXt2YXIgYj1hLmlkO2lmKHRoaXMuX2VsPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGIpLG51bGwhPT10aGlzLl9lbCl7dGhpcy5fcmFkaXVzPWEucmFkaXVzfHwxMCx0aGlzLl9kdXJhdGlvbj12b2lkIDA9PT1hLmR1cmF0aW9uPzUwMDphLmR1cmF0aW9uLHRoaXMuX3ZhbHVlPTAsdGhpcy5fbWF4VmFsdWU9YS5tYXhWYWx1ZXx8MTAwLHRoaXMuX3RleHQ9dm9pZCAwPT09YS50ZXh0P2Z1bmN0aW9uKGEpe3JldHVybiB0aGlzLmh0bWxpZnlOdW1iZXIoYSl9OmEudGV4dCx0aGlzLl9zdHJva2VXaWR0aD1hLndpZHRofHwxMCx0aGlzLl9jb2xvcnM9YS5jb2xvcnN8fFtcIiNFRUVcIixcIiNGMDBcIl0sdGhpcy5fc3ZnPW51bGwsdGhpcy5fbW92aW5nUGF0aD1udWxsLHRoaXMuX3dyYXBDb250YWluZXI9bnVsbCx0aGlzLl90ZXh0Q29udGFpbmVyPW51bGwsdGhpcy5fd3JwQ2xhc3M9YS53cnBDbGFzc3x8XCJjaXJjbGVzLXdycFwiLHRoaXMuX3RleHRDbGFzcz1hLnRleHRDbGFzc3x8XCJjaXJjbGVzLXRleHRcIix0aGlzLl92YWxDbGFzcz1hLnZhbHVlU3Ryb2tlQ2xhc3N8fFwiY2lyY2xlcy12YWx1ZVN0cm9rZVwiLHRoaXMuX21heFZhbENsYXNzPWEubWF4VmFsdWVTdHJva2VDbGFzc3x8XCJjaXJjbGVzLW1heFZhbHVlU3Ryb2tlXCIsdGhpcy5fc3R5bGVXcmFwcGVyPWEuc3R5bGVXcmFwcGVyPT09ITE/ITE6ITAsdGhpcy5fc3R5bGVUZXh0PWEuc3R5bGVUZXh0PT09ITE/ITE6ITA7dmFyIGM9TWF0aC5QSS8xODAqMjcwO3RoaXMuX3N0YXJ0PS1NYXRoLlBJLzE4MCo5MCx0aGlzLl9zdGFydFByZWNpc2U9dGhpcy5fcHJlY2lzZSh0aGlzLl9zdGFydCksdGhpcy5fY2lyYz1jLXRoaXMuX3N0YXJ0LHRoaXMuX2dlbmVyYXRlKCkudXBkYXRlKGEudmFsdWV8fDApfX07cmV0dXJuIGIucHJvdG90eXBlPXtWRVJTSU9OOlwiMC4wLjZcIixfZ2VuZXJhdGU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fc3ZnU2l6ZT0yKnRoaXMuX3JhZGl1cyx0aGlzLl9yYWRpdXNBZGp1c3RlZD10aGlzLl9yYWRpdXMtdGhpcy5fc3Ryb2tlV2lkdGgvMix0aGlzLl9nZW5lcmF0ZVN2ZygpLl9nZW5lcmF0ZVRleHQoKS5fZ2VuZXJhdGVXcmFwcGVyKCksdGhpcy5fZWwuaW5uZXJIVE1MPVwiXCIsdGhpcy5fZWwuYXBwZW5kQ2hpbGQodGhpcy5fd3JhcENvbnRhaW5lciksdGhpc30sX3NldFBlcmNlbnRhZ2U6ZnVuY3Rpb24oYSl7dGhpcy5fbW92aW5nUGF0aC5zZXRBdHRyaWJ1dGUoXCJkXCIsdGhpcy5fY2FsY3VsYXRlUGF0aChhLCEwKSksdGhpcy5fdGV4dENvbnRhaW5lci5pbm5lckhUTUw9dGhpcy5fZ2V0VGV4dCh0aGlzLmdldFZhbHVlRnJvbVBlcmNlbnQoYSkpfSxfZ2VuZXJhdGVXcmFwcGVyOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3dyYXBDb250YWluZXI9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSx0aGlzLl93cmFwQ29udGFpbmVyLmNsYXNzTmFtZT10aGlzLl93cnBDbGFzcyx0aGlzLl9zdHlsZVdyYXBwZXImJih0aGlzLl93cmFwQ29udGFpbmVyLnN0eWxlLnBvc2l0aW9uPVwicmVsYXRpdmVcIix0aGlzLl93cmFwQ29udGFpbmVyLnN0eWxlLmRpc3BsYXk9XCJpbmxpbmUtYmxvY2tcIiksdGhpcy5fd3JhcENvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9zdmcpLHRoaXMuX3dyYXBDb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fdGV4dENvbnRhaW5lciksdGhpc30sX2dlbmVyYXRlVGV4dDpmdW5jdGlvbigpe2lmKHRoaXMuX3RleHRDb250YWluZXI9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSx0aGlzLl90ZXh0Q29udGFpbmVyLmNsYXNzTmFtZT10aGlzLl90ZXh0Q2xhc3MsdGhpcy5fc3R5bGVUZXh0KXt2YXIgYT17cG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDowLGxlZnQ6MCx0ZXh0QWxpZ246XCJjZW50ZXJcIix3aWR0aDpcIjEwMCVcIixmb250U2l6ZTouNyp0aGlzLl9yYWRpdXMrXCJweFwiLGhlaWdodDp0aGlzLl9zdmdTaXplK1wicHhcIixsaW5lSGVpZ2h0OnRoaXMuX3N2Z1NpemUrXCJweFwifTtmb3IodmFyIGIgaW4gYSl0aGlzLl90ZXh0Q29udGFpbmVyLnN0eWxlW2JdPWFbYl19cmV0dXJuIHRoaXMuX3RleHRDb250YWluZXIuaW5uZXJIVE1MPXRoaXMuX2dldFRleHQoMCksdGhpc30sX2dldFRleHQ6ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuX3RleHQ/KHZvaWQgMD09PWEmJihhPXRoaXMuX3ZhbHVlKSxhPXBhcnNlRmxvYXQoYS50b0ZpeGVkKDIpKSxcImZ1bmN0aW9uXCI9PXR5cGVvZiB0aGlzLl90ZXh0P3RoaXMuX3RleHQuY2FsbCh0aGlzLGEpOnRoaXMuX3RleHQpOlwiXCJ9LF9nZW5lcmF0ZVN2ZzpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9zdmc9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIixcInN2Z1wiKSx0aGlzLl9zdmcuc2V0QXR0cmlidXRlKFwieG1sbnNcIixcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIpLHRoaXMuX3N2Zy5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLHRoaXMuX3N2Z1NpemUpLHRoaXMuX3N2Zy5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIix0aGlzLl9zdmdTaXplKSx0aGlzLl9nZW5lcmF0ZVBhdGgoMTAwLCExLHRoaXMuX2NvbG9yc1swXSx0aGlzLl9tYXhWYWxDbGFzcykuX2dlbmVyYXRlUGF0aCgxLCEwLHRoaXMuX2NvbG9yc1sxXSx0aGlzLl92YWxDbGFzcyksdGhpcy5fbW92aW5nUGF0aD10aGlzLl9zdmcuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJwYXRoXCIpWzFdLHRoaXN9LF9nZW5lcmF0ZVBhdGg6ZnVuY3Rpb24oYSxiLGMsZCl7dmFyIGU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIixcInBhdGhcIik7cmV0dXJuIGUuc2V0QXR0cmlidXRlKFwiZmlsbFwiLFwidHJhbnNwYXJlbnRcIiksZS5zZXRBdHRyaWJ1dGUoXCJzdHJva2VcIixjKSxlLnNldEF0dHJpYnV0ZShcInN0cm9rZS13aWR0aFwiLHRoaXMuX3N0cm9rZVdpZHRoKSxlLnNldEF0dHJpYnV0ZShcImRcIix0aGlzLl9jYWxjdWxhdGVQYXRoKGEsYikpLGUuc2V0QXR0cmlidXRlKFwiY2xhc3NcIixkKSx0aGlzLl9zdmcuYXBwZW5kQ2hpbGQoZSksdGhpc30sX2NhbGN1bGF0ZVBhdGg6ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzLl9zdGFydCthLzEwMCp0aGlzLl9jaXJjLGQ9dGhpcy5fcHJlY2lzZShjKTtyZXR1cm4gdGhpcy5fYXJjKGQsYil9LF9hcmM6ZnVuY3Rpb24oYSxiKXt2YXIgYz1hLS4wMDEsZD1hLXRoaXMuX3N0YXJ0UHJlY2lzZTxNYXRoLlBJPzA6MTtyZXR1cm5bXCJNXCIsdGhpcy5fcmFkaXVzK3RoaXMuX3JhZGl1c0FkanVzdGVkKk1hdGguY29zKHRoaXMuX3N0YXJ0UHJlY2lzZSksdGhpcy5fcmFkaXVzK3RoaXMuX3JhZGl1c0FkanVzdGVkKk1hdGguc2luKHRoaXMuX3N0YXJ0UHJlY2lzZSksXCJBXCIsdGhpcy5fcmFkaXVzQWRqdXN0ZWQsdGhpcy5fcmFkaXVzQWRqdXN0ZWQsMCxkLDEsdGhpcy5fcmFkaXVzK3RoaXMuX3JhZGl1c0FkanVzdGVkKk1hdGguY29zKGMpLHRoaXMuX3JhZGl1cyt0aGlzLl9yYWRpdXNBZGp1c3RlZCpNYXRoLnNpbihjKSxiP1wiXCI6XCJaXCJdLmpvaW4oXCIgXCIpfSxfcHJlY2lzZTpmdW5jdGlvbihhKXtyZXR1cm4gTWF0aC5yb3VuZCgxZTMqYSkvMWUzfSxodG1saWZ5TnVtYmVyOmZ1bmN0aW9uKGEsYixjKXtiPWJ8fFwiY2lyY2xlcy1pbnRlZ2VyXCIsYz1jfHxcImNpcmNsZXMtZGVjaW1hbHNcIjt2YXIgZD0oYStcIlwiKS5zcGxpdChcIi5cIiksZT0nPHNwYW4gY2xhc3M9XCInK2IrJ1wiPicrZFswXStcIjwvc3Bhbj5cIjtyZXR1cm4gZC5sZW5ndGg+MSYmKGUrPScuPHNwYW4gY2xhc3M9XCInK2MrJ1wiPicrZFsxXS5zdWJzdHJpbmcoMCwyKStcIjwvc3Bhbj5cIiksZX0sdXBkYXRlUmFkaXVzOmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLl9yYWRpdXM9YSx0aGlzLl9nZW5lcmF0ZSgpLnVwZGF0ZSghMCl9LHVwZGF0ZVdpZHRoOmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLl9zdHJva2VXaWR0aD1hLHRoaXMuX2dlbmVyYXRlKCkudXBkYXRlKCEwKX0sdXBkYXRlQ29sb3JzOmZ1bmN0aW9uKGEpe3RoaXMuX2NvbG9ycz1hO3ZhciBiPXRoaXMuX3N2Zy5nZXRFbGVtZW50c0J5VGFnTmFtZShcInBhdGhcIik7cmV0dXJuIGJbMF0uc2V0QXR0cmlidXRlKFwic3Ryb2tlXCIsYVswXSksYlsxXS5zZXRBdHRyaWJ1dGUoXCJzdHJva2VcIixhWzFdKSx0aGlzfSxnZXRQZXJjZW50OmZ1bmN0aW9uKCl7cmV0dXJuIDEwMCp0aGlzLl92YWx1ZS90aGlzLl9tYXhWYWx1ZX0sZ2V0VmFsdWVGcm9tUGVyY2VudDpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5fbWF4VmFsdWUqYS8xMDB9LGdldFZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3ZhbHVlfSxnZXRNYXhWYWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9tYXhWYWx1ZX0sdXBkYXRlOmZ1bmN0aW9uKGIsYyl7aWYoYj09PSEwKXJldHVybiB0aGlzLl9zZXRQZXJjZW50YWdlKHRoaXMuZ2V0UGVyY2VudCgpKSx0aGlzO2lmKHRoaXMuX3ZhbHVlPT1ifHxpc05hTihiKSlyZXR1cm4gdGhpczt2b2lkIDA9PT1jJiYoYz10aGlzLl9kdXJhdGlvbik7dmFyIGQsZSxmLGcsaD10aGlzLGk9aC5nZXRQZXJjZW50KCksaj0xO3JldHVybiB0aGlzLl92YWx1ZT1NYXRoLm1pbih0aGlzLl9tYXhWYWx1ZSxNYXRoLm1heCgwLGIpKSxjPyhkPWguZ2V0UGVyY2VudCgpLGU9ZD5pLGorPWQlMSxmPU1hdGguZmxvb3IoTWF0aC5hYnMoZC1pKS9qKSxnPWMvZixmdW5jdGlvbiBrKGIpe2lmKGU/aSs9ajppLT1qLGUmJmk+PWR8fCFlJiZkPj1pKXJldHVybiB2b2lkIGEoZnVuY3Rpb24oKXtoLl9zZXRQZXJjZW50YWdlKGQpfSk7YShmdW5jdGlvbigpe2guX3NldFBlcmNlbnRhZ2UoaSl9KTt2YXIgYz1EYXRlLm5vdygpLGY9Yy1iO2Y+PWc/ayhjKTpzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ayhEYXRlLm5vdygpKX0sZy1mKX0oRGF0ZS5ub3coKSksdGhpcyk6KHRoaXMuX3NldFBlcmNlbnRhZ2UodGhpcy5nZXRQZXJjZW50KCkpLHRoaXMpfX0sYi5jcmVhdGU9ZnVuY3Rpb24oYSl7cmV0dXJuIG5ldyBiKGEpfSxifSk7IiwidmFyIERhdGVwaWNrZXI7XG5cbihmdW5jdGlvbiAod2luZG93LCAkLCB1bmRlZmluZWQpIHtcbiAgICB2YXIgcGx1Z2luTmFtZSA9ICdkYXRlcGlja2VyJyxcbiAgICAgICAgYXV0b0luaXRTZWxlY3RvciA9ICcuZGF0ZXBpY2tlci1oZXJlJyxcbiAgICAgICAgJGJvZHksICRkYXRlcGlja2Vyc0NvbnRhaW5lcixcbiAgICAgICAgY29udGFpbmVyQnVpbHQgPSBmYWxzZSxcbiAgICAgICAgYmFzZVRlbXBsYXRlID0gJycgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyXCI+JyArXG4gICAgICAgICAgICAnPG5hdiBjbGFzcz1cImRhdGVwaWNrZXItLW5hdlwiPjwvbmF2PicgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1jb250ZW50XCI+PC9kaXY+JyArXG4gICAgICAgICAgICAnPC9kaXY+JyxcbiAgICAgICAgZGVmYXVsdHMgPSB7XG4gICAgICAgICAgICBjbGFzc2VzOiAnJyxcbiAgICAgICAgICAgIGlubGluZTogZmFsc2UsXG4gICAgICAgICAgICBsYW5ndWFnZTogJ3J1JyxcbiAgICAgICAgICAgIHN0YXJ0RGF0ZTogbmV3IERhdGUoKSxcbiAgICAgICAgICAgIGZpcnN0RGF5OiAnJyxcbiAgICAgICAgICAgIHdlZWtlbmRzOiBbNiwgMF0sXG4gICAgICAgICAgICBkYXRlRm9ybWF0OiAnJyxcbiAgICAgICAgICAgIGFsdEZpZWxkOiAnJyxcbiAgICAgICAgICAgIGFsdEZpZWxkRGF0ZUZvcm1hdDogJ0AnLFxuICAgICAgICAgICAgdG9nZ2xlU2VsZWN0ZWQ6IHRydWUsXG4gICAgICAgICAgICBrZXlib2FyZE5hdjogdHJ1ZSxcblxuICAgICAgICAgICAgcG9zaXRpb246ICdib3R0b20gbGVmdCcsXG4gICAgICAgICAgICBvZmZzZXQ6IDEyLFxuXG4gICAgICAgICAgICB2aWV3OiAnZGF5cycsXG4gICAgICAgICAgICBtaW5WaWV3OiAnZGF5cycsXG5cbiAgICAgICAgICAgIHNob3dPdGhlck1vbnRoczogdHJ1ZSxcbiAgICAgICAgICAgIHNlbGVjdE90aGVyTW9udGhzOiB0cnVlLFxuICAgICAgICAgICAgbW92ZVRvT3RoZXJNb250aHNPblNlbGVjdDogdHJ1ZSxcblxuICAgICAgICAgICAgc2hvd090aGVyWWVhcnM6IHRydWUsXG4gICAgICAgICAgICBzZWxlY3RPdGhlclllYXJzOiB0cnVlLFxuICAgICAgICAgICAgbW92ZVRvT3RoZXJZZWFyc09uU2VsZWN0OiB0cnVlLFxuXG4gICAgICAgICAgICBtaW5EYXRlOiAnJyxcbiAgICAgICAgICAgIG1heERhdGU6ICcnLFxuICAgICAgICAgICAgZGlzYWJsZU5hdldoZW5PdXRPZlJhbmdlOiB0cnVlLFxuXG4gICAgICAgICAgICBtdWx0aXBsZURhdGVzOiBmYWxzZSwgLy8gQm9vbGVhbiBvciBOdW1iZXJcbiAgICAgICAgICAgIG11bHRpcGxlRGF0ZXNTZXBhcmF0b3I6ICcsJyxcbiAgICAgICAgICAgIHJhbmdlOiBmYWxzZSxcblxuICAgICAgICAgICAgdG9kYXlCdXR0b246IGZhbHNlLFxuICAgICAgICAgICAgY2xlYXJCdXR0b246IGZhbHNlLFxuXG4gICAgICAgICAgICBzaG93RXZlbnQ6ICdmb2N1cycsXG4gICAgICAgICAgICBhdXRvQ2xvc2U6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyBuYXZpZ2F0aW9uXG4gICAgICAgICAgICBtb250aHNGaWVsZDogJ21vbnRoc1Nob3J0JyxcbiAgICAgICAgICAgIHByZXZIdG1sOiAnPHN2Zz48cGF0aCBkPVwiTSAxNywxMiBsIC01LDUgbCA1LDVcIj48L3BhdGg+PC9zdmc+JyxcbiAgICAgICAgICAgIG5leHRIdG1sOiAnPHN2Zz48cGF0aCBkPVwiTSAxNCwxMiBsIDUsNSBsIC01LDVcIj48L3BhdGg+PC9zdmc+JyxcbiAgICAgICAgICAgIG5hdlRpdGxlczoge1xuICAgICAgICAgICAgICAgIGRheXM6ICdNTSwgPGk+eXl5eTwvaT4nLFxuICAgICAgICAgICAgICAgIG1vbnRoczogJ3l5eXknLFxuICAgICAgICAgICAgICAgIHllYXJzOiAneXl5eTEgLSB5eXl5MidcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8vIGV2ZW50c1xuICAgICAgICAgICAgb25TZWxlY3Q6ICcnLFxuICAgICAgICAgICAgb25DaGFuZ2VNb250aDogJycsXG4gICAgICAgICAgICBvbkNoYW5nZVllYXI6ICcnLFxuICAgICAgICAgICAgb25DaGFuZ2VEZWNhZGU6ICcnLFxuICAgICAgICAgICAgb25DaGFuZ2VWaWV3OiAnJyxcbiAgICAgICAgICAgIG9uUmVuZGVyQ2VsbDogJydcbiAgICAgICAgfSxcbiAgICAgICAgaG90S2V5cyA9IHtcbiAgICAgICAgICAgICdjdHJsUmlnaHQnOiBbMTcsIDM5XSxcbiAgICAgICAgICAgICdjdHJsVXAnOiBbMTcsIDM4XSxcbiAgICAgICAgICAgICdjdHJsTGVmdCc6IFsxNywgMzddLFxuICAgICAgICAgICAgJ2N0cmxEb3duJzogWzE3LCA0MF0sXG4gICAgICAgICAgICAnc2hpZnRSaWdodCc6IFsxNiwgMzldLFxuICAgICAgICAgICAgJ3NoaWZ0VXAnOiBbMTYsIDM4XSxcbiAgICAgICAgICAgICdzaGlmdExlZnQnOiBbMTYsIDM3XSxcbiAgICAgICAgICAgICdzaGlmdERvd24nOiBbMTYsIDQwXSxcbiAgICAgICAgICAgICdhbHRVcCc6IFsxOCwgMzhdLFxuICAgICAgICAgICAgJ2FsdFJpZ2h0JzogWzE4LCAzOV0sXG4gICAgICAgICAgICAnYWx0TGVmdCc6IFsxOCwgMzddLFxuICAgICAgICAgICAgJ2FsdERvd24nOiBbMTgsIDQwXSxcbiAgICAgICAgICAgICdjdHJsU2hpZnRVcCc6IFsxNiwgMTcsIDM4XVxuICAgICAgICB9LFxuICAgICAgICBkYXRlcGlja2VyO1xuXG4gICAgRGF0ZXBpY2tlciAgPSBmdW5jdGlvbiAoZWwsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5lbCA9IGVsO1xuICAgICAgICB0aGlzLiRlbCA9ICQoZWwpO1xuXG4gICAgICAgIHRoaXMub3B0cyA9ICQuZXh0ZW5kKHRydWUsIHt9LCBkZWZhdWx0cywgb3B0aW9ucywgdGhpcy4kZWwuZGF0YSgpKTtcblxuICAgICAgICBpZiAoJGJvZHkgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAkYm9keSA9ICQoJ2JvZHknKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5vcHRzLnN0YXJ0RGF0ZSkge1xuICAgICAgICAgICAgdGhpcy5vcHRzLnN0YXJ0RGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5lbC5ub2RlTmFtZSA9PSAnSU5QVVQnKSB7XG4gICAgICAgICAgICB0aGlzLmVsSXNJbnB1dCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRzLmFsdEZpZWxkKSB7XG4gICAgICAgICAgICB0aGlzLiRhbHRGaWVsZCA9IHR5cGVvZiB0aGlzLm9wdHMuYWx0RmllbGQgPT0gJ3N0cmluZycgPyAkKHRoaXMub3B0cy5hbHRGaWVsZCkgOiB0aGlzLm9wdHMuYWx0RmllbGQ7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmluaXRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zaWxlbnQgPSBmYWxzZTsgLy8gTmVlZCB0byBwcmV2ZW50IHVubmVjZXNzYXJ5IHJlbmRlcmluZ1xuXG4gICAgICAgIHRoaXMuY3VycmVudERhdGUgPSB0aGlzLm9wdHMuc3RhcnREYXRlO1xuICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gdGhpcy5vcHRzLnZpZXc7XG4gICAgICAgIHRoaXMuX2NyZWF0ZVNob3J0Q3V0cygpO1xuICAgICAgICB0aGlzLnNlbGVjdGVkRGF0ZXMgPSBbXTtcbiAgICAgICAgdGhpcy52aWV3cyA9IHt9O1xuICAgICAgICB0aGlzLmtleXMgPSBbXTtcbiAgICAgICAgdGhpcy5taW5SYW5nZSA9ICcnO1xuICAgICAgICB0aGlzLm1heFJhbmdlID0gJyc7XG5cbiAgICAgICAgdGhpcy5pbml0KClcbiAgICB9O1xuXG4gICAgZGF0ZXBpY2tlciA9IERhdGVwaWNrZXI7XG5cbiAgICBkYXRlcGlja2VyLnByb3RvdHlwZSA9IHtcbiAgICAgICAgdmlld0luZGV4ZXM6IFsnZGF5cycsICdtb250aHMnLCAneWVhcnMnXSxcblxuICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIWNvbnRhaW5lckJ1aWx0ICYmICF0aGlzLm9wdHMuaW5saW5lICYmIHRoaXMuZWxJc0lucHV0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYnVpbGREYXRlcGlja2Vyc0NvbnRhaW5lcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fYnVpbGRCYXNlSHRtbCgpO1xuICAgICAgICAgICAgdGhpcy5fZGVmaW5lTG9jYWxlKHRoaXMub3B0cy5sYW5ndWFnZSk7XG4gICAgICAgICAgICB0aGlzLl9zeW5jV2l0aE1pbk1heERhdGVzKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmVsSXNJbnB1dCkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5vcHRzLmlubGluZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBTZXQgZXh0cmEgY2xhc3NlcyBmb3IgcHJvcGVyIHRyYW5zaXRpb25zXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldFBvc2l0aW9uQ2xhc3Nlcyh0aGlzLm9wdHMucG9zaXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9iaW5kRXZlbnRzKClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5rZXlib2FyZE5hdikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9iaW5kS2V5Ym9hcmRFdmVudHMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlci5vbignbW91c2Vkb3duJywgdGhpcy5fb25Nb3VzZURvd25EYXRlcGlja2VyLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXIub24oJ21vdXNldXAnLCB0aGlzLl9vbk1vdXNlVXBEYXRlcGlja2VyLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLmNsYXNzZXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyLmFkZENsYXNzKHRoaXMub3B0cy5jbGFzc2VzKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnZpZXdzW3RoaXMuY3VycmVudFZpZXddID0gbmV3IERhdGVwaWNrZXIuQm9keSh0aGlzLCB0aGlzLmN1cnJlbnRWaWV3LCB0aGlzLm9wdHMpO1xuICAgICAgICAgICAgdGhpcy52aWV3c1t0aGlzLmN1cnJlbnRWaWV3XS5zaG93KCk7XG4gICAgICAgICAgICB0aGlzLm5hdiA9IG5ldyBEYXRlcGlja2VyLk5hdmlnYXRpb24odGhpcywgdGhpcy5vcHRzKTtcbiAgICAgICAgICAgIHRoaXMudmlldyA9IHRoaXMuY3VycmVudFZpZXc7XG5cbiAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXIub24oJ21vdXNlZW50ZXInLCAnLmRhdGVwaWNrZXItLWNlbGwnLCB0aGlzLl9vbk1vdXNlRW50ZXJDZWxsLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlci5vbignbW91c2VsZWF2ZScsICcuZGF0ZXBpY2tlci0tY2VsbCcsIHRoaXMuX29uTW91c2VMZWF2ZUNlbGwuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgIHRoaXMuaW5pdGVkID0gdHJ1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBfY3JlYXRlU2hvcnRDdXRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLm1pbkRhdGUgPSB0aGlzLm9wdHMubWluRGF0ZSA/IHRoaXMub3B0cy5taW5EYXRlIDogbmV3IERhdGUoLTg2Mzk5OTk5MTM2MDAwMDApO1xuICAgICAgICAgICAgdGhpcy5tYXhEYXRlID0gdGhpcy5vcHRzLm1heERhdGUgPyB0aGlzLm9wdHMubWF4RGF0ZSA6IG5ldyBEYXRlKDg2Mzk5OTk5MTM2MDAwMDApO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9iaW5kRXZlbnRzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwub24odGhpcy5vcHRzLnNob3dFdmVudCArICcuYWRwJywgdGhpcy5fb25TaG93RXZlbnQuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB0aGlzLiRlbC5vbignYmx1ci5hZHAnLCB0aGlzLl9vbkJsdXIuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB0aGlzLiRlbC5vbignaW5wdXQuYWRwJywgdGhpcy5fb25JbnB1dC5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICQod2luZG93KS5vbigncmVzaXplLmFkcCcsIHRoaXMuX29uUmVzaXplLmJpbmQodGhpcykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9iaW5kS2V5Ym9hcmRFdmVudHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLm9uKCdrZXlkb3duLmFkcCcsIHRoaXMuX29uS2V5RG93bi5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHRoaXMuJGVsLm9uKCdrZXl1cC5hZHAnLCB0aGlzLl9vbktleVVwLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgdGhpcy4kZWwub24oJ2hvdEtleS5hZHAnLCB0aGlzLl9vbkhvdEtleS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc1dlZWtlbmQ6IGZ1bmN0aW9uIChkYXkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdHMud2Vla2VuZHMuaW5kZXhPZihkYXkpICE9PSAtMTtcbiAgICAgICAgfSxcblxuICAgICAgICBfZGVmaW5lTG9jYWxlOiBmdW5jdGlvbiAobGFuZykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBsYW5nID09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2MgPSBEYXRlcGlja2VyLmxhbmd1YWdlW2xhbmddO1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5sb2MpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdDYW5cXCd0IGZpbmQgbGFuZ3VhZ2UgXCInICsgbGFuZyArICdcIiBpbiBEYXRlcGlja2VyLmxhbmd1YWdlLCB3aWxsIHVzZSBcInJ1XCIgaW5zdGVhZCcpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYyA9ICQuZXh0ZW5kKHRydWUsIHt9LCBEYXRlcGlja2VyLmxhbmd1YWdlLnJ1KVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMubG9jID0gJC5leHRlbmQodHJ1ZSwge30sIERhdGVwaWNrZXIubGFuZ3VhZ2UucnUsIERhdGVwaWNrZXIubGFuZ3VhZ2VbbGFuZ10pXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubG9jID0gJC5leHRlbmQodHJ1ZSwge30sIERhdGVwaWNrZXIubGFuZ3VhZ2UucnUsIGxhbmcpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMuZGF0ZUZvcm1hdCkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9jLmRhdGVGb3JtYXQgPSB0aGlzLm9wdHMuZGF0ZUZvcm1hdFxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLmZpcnN0RGF5ICE9PSAnJykge1xuICAgICAgICAgICAgICAgIHRoaXMubG9jLmZpcnN0RGF5ID0gdGhpcy5vcHRzLmZpcnN0RGF5XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2J1aWxkRGF0ZXBpY2tlcnNDb250YWluZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnRhaW5lckJ1aWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgICRib2R5LmFwcGVuZCgnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXJzLWNvbnRhaW5lclwiIGlkPVwiZGF0ZXBpY2tlcnMtY29udGFpbmVyXCI+PC9kaXY+Jyk7XG4gICAgICAgICAgICAkZGF0ZXBpY2tlcnNDb250YWluZXIgPSAkKCcjZGF0ZXBpY2tlcnMtY29udGFpbmVyJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2J1aWxkQmFzZUh0bWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciAkYXBwZW5kVGFyZ2V0LFxuICAgICAgICAgICAgICAgICRpbmxpbmUgPSAkKCc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci1pbmxpbmVcIj4nKTtcblxuICAgICAgICAgICAgaWYodGhpcy5lbC5ub2RlTmFtZSA9PSAnSU5QVVQnKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm9wdHMuaW5saW5lKSB7XG4gICAgICAgICAgICAgICAgICAgICRhcHBlbmRUYXJnZXQgPSAkZGF0ZXBpY2tlcnNDb250YWluZXI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJGFwcGVuZFRhcmdldCA9ICRpbmxpbmUuaW5zZXJ0QWZ0ZXIodGhpcy4kZWwpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkYXBwZW5kVGFyZ2V0ID0gJGlubGluZS5hcHBlbmRUbyh0aGlzLiRlbClcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlciA9ICQoYmFzZVRlbXBsYXRlKS5hcHBlbmRUbygkYXBwZW5kVGFyZ2V0KTtcbiAgICAgICAgICAgIHRoaXMuJGNvbnRlbnQgPSAkKCcuZGF0ZXBpY2tlci0tY29udGVudCcsIHRoaXMuJGRhdGVwaWNrZXIpO1xuICAgICAgICAgICAgdGhpcy4kbmF2ID0gJCgnLmRhdGVwaWNrZXItLW5hdicsIHRoaXMuJGRhdGVwaWNrZXIpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF90cmlnZ2VyT25DaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5zZWxlY3RlZERhdGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdHMub25TZWxlY3QoJycsICcnLCB0aGlzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHNlbGVjdGVkRGF0ZXMgPSB0aGlzLnNlbGVjdGVkRGF0ZXMsXG4gICAgICAgICAgICAgICAgcGFyc2VkU2VsZWN0ZWQgPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUoc2VsZWN0ZWREYXRlc1swXSksXG4gICAgICAgICAgICAgICAgZm9ybWF0dGVkRGF0ZXMsXG4gICAgICAgICAgICAgICAgX3RoaXMgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGRhdGVzID0gbmV3IERhdGUocGFyc2VkU2VsZWN0ZWQueWVhciwgcGFyc2VkU2VsZWN0ZWQubW9udGgsIHBhcnNlZFNlbGVjdGVkLmRhdGUpO1xuXG4gICAgICAgICAgICAgICAgZm9ybWF0dGVkRGF0ZXMgPSBzZWxlY3RlZERhdGVzLm1hcChmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuZm9ybWF0RGF0ZShfdGhpcy5sb2MuZGF0ZUZvcm1hdCwgZGF0ZSlcbiAgICAgICAgICAgICAgICB9KS5qb2luKHRoaXMub3B0cy5tdWx0aXBsZURhdGVzU2VwYXJhdG9yKTtcblxuICAgICAgICAgICAgLy8gQ3JlYXRlIG5ldyBkYXRlcyBhcnJheSwgdG8gc2VwYXJhdGUgaXQgZnJvbSBvcmlnaW5hbCBzZWxlY3RlZERhdGVzXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLm11bHRpcGxlRGF0ZXMgfHwgdGhpcy5vcHRzLnJhbmdlKSB7XG4gICAgICAgICAgICAgICAgZGF0ZXMgPSBzZWxlY3RlZERhdGVzLm1hcChmdW5jdGlvbihkYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJzZWREYXRlID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKGRhdGUpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IERhdGUocGFyc2VkRGF0ZS55ZWFyLCBwYXJzZWREYXRlLm1vbnRoLCBwYXJzZWREYXRlLmRhdGUpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5vcHRzLm9uU2VsZWN0KGZvcm1hdHRlZERhdGVzLCBkYXRlcywgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGQgPSB0aGlzLnBhcnNlZERhdGUsXG4gICAgICAgICAgICAgICAgbyA9IHRoaXMub3B0cztcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy52aWV3KSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnZGF5cyc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKGQueWVhciwgZC5tb250aCArIDEsIDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoby5vbkNoYW5nZU1vbnRoKSBvLm9uQ2hhbmdlTW9udGgodGhpcy5wYXJzZWREYXRlLm1vbnRoLCB0aGlzLnBhcnNlZERhdGUueWVhcik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ21vbnRocyc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKGQueWVhciArIDEsIGQubW9udGgsIDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoby5vbkNoYW5nZVllYXIpIG8ub25DaGFuZ2VZZWFyKHRoaXMucGFyc2VkRGF0ZS55ZWFyKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAneWVhcnMnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShkLnllYXIgKyAxMCwgMCwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvLm9uQ2hhbmdlRGVjYWRlKSBvLm9uQ2hhbmdlRGVjYWRlKHRoaXMuY3VyRGVjYWRlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgcHJldjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGQgPSB0aGlzLnBhcnNlZERhdGUsXG4gICAgICAgICAgICAgICAgbyA9IHRoaXMub3B0cztcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy52aWV3KSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnZGF5cyc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKGQueWVhciwgZC5tb250aCAtIDEsIDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoby5vbkNoYW5nZU1vbnRoKSBvLm9uQ2hhbmdlTW9udGgodGhpcy5wYXJzZWREYXRlLm1vbnRoLCB0aGlzLnBhcnNlZERhdGUueWVhcik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ21vbnRocyc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSA9IG5ldyBEYXRlKGQueWVhciAtIDEsIGQubW9udGgsIDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoby5vbkNoYW5nZVllYXIpIG8ub25DaGFuZ2VZZWFyKHRoaXMucGFyc2VkRGF0ZS55ZWFyKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAneWVhcnMnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShkLnllYXIgLSAxMCwgMCwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvLm9uQ2hhbmdlRGVjYWRlKSBvLm9uQ2hhbmdlRGVjYWRlKHRoaXMuY3VyRGVjYWRlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZm9ybWF0RGF0ZTogZnVuY3Rpb24gKHN0cmluZywgZGF0ZSkge1xuICAgICAgICAgICAgZGF0ZSA9IGRhdGUgfHwgdGhpcy5kYXRlO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHN0cmluZyxcbiAgICAgICAgICAgICAgICBib3VuZGFyeSA9IHRoaXMuX2dldFdvcmRCb3VuZGFyeVJlZ0V4cCxcbiAgICAgICAgICAgICAgICBsb2NhbGUgPSB0aGlzLmxvYyxcbiAgICAgICAgICAgICAgICBkZWNhZGUgPSBkYXRlcGlja2VyLmdldERlY2FkZShkYXRlKSxcbiAgICAgICAgICAgICAgICBkID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKGRhdGUpO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKHRydWUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIC9ALy50ZXN0KHJlc3VsdCk6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKC9ALywgZGF0ZS5nZXRUaW1lKCkpO1xuICAgICAgICAgICAgICAgIGNhc2UgL2RkLy50ZXN0KHJlc3VsdCk6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCdkZCcpLCBkLmZ1bGxEYXRlKTtcbiAgICAgICAgICAgICAgICBjYXNlIC9kLy50ZXN0KHJlc3VsdCk6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCdkJyksIGQuZGF0ZSk7XG4gICAgICAgICAgICAgICAgY2FzZSAvREQvLnRlc3QocmVzdWx0KTpcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ0REJyksIGxvY2FsZS5kYXlzW2QuZGF5XSk7XG4gICAgICAgICAgICAgICAgY2FzZSAvRC8udGVzdChyZXN1bHQpOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgnRCcpLCBsb2NhbGUuZGF5c1Nob3J0W2QuZGF5XSk7XG4gICAgICAgICAgICAgICAgY2FzZSAvbW0vLnRlc3QocmVzdWx0KTpcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoYm91bmRhcnkoJ21tJyksIGQuZnVsbE1vbnRoKTtcbiAgICAgICAgICAgICAgICBjYXNlIC9tLy50ZXN0KHJlc3VsdCk6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCdtJyksIGQubW9udGggKyAxKTtcbiAgICAgICAgICAgICAgICBjYXNlIC9NTS8udGVzdChyZXN1bHQpOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgnTU0nKSwgdGhpcy5sb2MubW9udGhzW2QubW9udGhdKTtcbiAgICAgICAgICAgICAgICBjYXNlIC9NLy50ZXN0KHJlc3VsdCk6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCdNJyksIGxvY2FsZS5tb250aHNTaG9ydFtkLm1vbnRoXSk7XG4gICAgICAgICAgICAgICAgY2FzZSAveXl5eS8udGVzdChyZXN1bHQpOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShib3VuZGFyeSgneXl5eScpLCBkLnllYXIpO1xuICAgICAgICAgICAgICAgIGNhc2UgL3l5eXkxLy50ZXN0KHJlc3VsdCk6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCd5eXl5MScpLCBkZWNhZGVbMF0pO1xuICAgICAgICAgICAgICAgIGNhc2UgL3l5eXkyLy50ZXN0KHJlc3VsdCk6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCd5eXl5MicpLCBkZWNhZGVbMV0pO1xuICAgICAgICAgICAgICAgIGNhc2UgL3l5Ly50ZXN0KHJlc3VsdCk6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGJvdW5kYXJ5KCd5eScpLCBkLnllYXIudG9TdHJpbmcoKS5zbGljZSgtMikpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRXb3JkQm91bmRhcnlSZWdFeHA6IGZ1bmN0aW9uIChzaWduKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cCgnXFxcXGIoPz1bYS16QS1aMC05w6TDtsO8w5/DhMOWw5w8XSknICsgc2lnbiArICcoPyFbPmEtekEtWjAtOcOkw7bDvMOfw4TDlsOcXSknKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWxlY3REYXRlOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRzID0gX3RoaXMub3B0cyxcbiAgICAgICAgICAgICAgICBkID0gX3RoaXMucGFyc2VkRGF0ZSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZERhdGVzID0gX3RoaXMuc2VsZWN0ZWREYXRlcyxcbiAgICAgICAgICAgICAgICBsZW4gPSBzZWxlY3RlZERhdGVzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBuZXdEYXRlID0gJyc7XG5cbiAgICAgICAgICAgIGlmICghKGRhdGUgaW5zdGFuY2VvZiBEYXRlKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBpZiAoX3RoaXMudmlldyA9PSAnZGF5cycpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZS5nZXRNb250aCgpICE9IGQubW9udGggJiYgb3B0cy5tb3ZlVG9PdGhlck1vbnRoc09uU2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld0RhdGUgPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoX3RoaXMudmlldyA9PSAneWVhcnMnKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGUuZ2V0RnVsbFllYXIoKSAhPSBkLnllYXIgJiYgb3B0cy5tb3ZlVG9PdGhlclllYXJzT25TZWxlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3RGF0ZSA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgMCwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobmV3RGF0ZSkge1xuICAgICAgICAgICAgICAgIF90aGlzLnNpbGVudCA9IHRydWU7XG4gICAgICAgICAgICAgICAgX3RoaXMuZGF0ZSA9IG5ld0RhdGU7XG4gICAgICAgICAgICAgICAgX3RoaXMuc2lsZW50ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgX3RoaXMubmF2Ll9yZW5kZXIoKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob3B0cy5tdWx0aXBsZURhdGVzICYmICFvcHRzLnJhbmdlKSB7IC8vIFNldCBwcmlvcml0eSB0byByYW5nZSBmdW5jdGlvbmFsaXR5XG4gICAgICAgICAgICAgICAgaWYgKGxlbiA9PT0gb3B0cy5tdWx0aXBsZURhdGVzKSByZXR1cm47XG4gICAgICAgICAgICAgICAgaWYgKCFfdGhpcy5faXNTZWxlY3RlZChkYXRlKSkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZWxlY3RlZERhdGVzLnB1c2goZGF0ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRzLnJhbmdlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxlbiA9PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnNlbGVjdGVkRGF0ZXMgPSBbZGF0ZV07XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLm1pblJhbmdlID0gZGF0ZTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMubWF4UmFuZ2UgPSAnJztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGxlbiA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnNlbGVjdGVkRGF0ZXMucHVzaChkYXRlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFfdGhpcy5tYXhSYW5nZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5tYXhSYW5nZSA9IGRhdGU7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5taW5SYW5nZSA9IGRhdGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2VsZWN0ZWREYXRlcyA9IFtfdGhpcy5taW5SYW5nZSwgX3RoaXMubWF4UmFuZ2VdXG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZWxlY3RlZERhdGVzID0gW2RhdGVdO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5taW5SYW5nZSA9IGRhdGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5zZWxlY3RlZERhdGVzID0gW2RhdGVdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfdGhpcy5fc2V0SW5wdXRWYWx1ZSgpO1xuXG4gICAgICAgICAgICBpZiAob3B0cy5vblNlbGVjdCkge1xuICAgICAgICAgICAgICAgIF90aGlzLl90cmlnZ2VyT25DaGFuZ2UoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG9wdHMuYXV0b0Nsb3NlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFvcHRzLm11bHRpcGxlRGF0ZXMgJiYgIW9wdHMucmFuZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0cy5yYW5nZSAmJiBfdGhpcy5zZWxlY3RlZERhdGVzLmxlbmd0aCA9PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF90aGlzLnZpZXdzW3RoaXMuY3VycmVudFZpZXddLl9yZW5kZXIoKVxuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZURhdGU6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSB0aGlzLnNlbGVjdGVkRGF0ZXMsXG4gICAgICAgICAgICAgICAgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAoIShkYXRlIGluc3RhbmNlb2YgRGF0ZSkpIHJldHVybjtcblxuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGVkLnNvbWUoZnVuY3Rpb24gKGN1ckRhdGUsIGkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZXBpY2tlci5pc1NhbWUoY3VyRGF0ZSwgZGF0ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQuc3BsaWNlKGksIDEpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghX3RoaXMuc2VsZWN0ZWREYXRlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLm1pblJhbmdlID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5tYXhSYW5nZSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgX3RoaXMudmlld3NbX3RoaXMuY3VycmVudFZpZXddLl9yZW5kZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuX3NldElucHV0VmFsdWUoKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXMub3B0cy5vblNlbGVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuX3RyaWdnZXJPbkNoYW5nZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIHRvZGF5OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnZpZXcgPSB0aGlzLm9wdHMubWluVmlldztcbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkRGF0ZXMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMubWluUmFuZ2UgPSAnJztcbiAgICAgICAgICAgIHRoaXMubWF4UmFuZ2UgPSAnJztcbiAgICAgICAgICAgIHRoaXMudmlld3NbdGhpcy5jdXJyZW50Vmlld10uX3JlbmRlcigpO1xuICAgICAgICAgICAgdGhpcy5fc2V0SW5wdXRWYWx1ZSgpO1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5vblNlbGVjdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3RyaWdnZXJPbkNoYW5nZSgpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFVwZGF0ZXMgZGF0ZXBpY2tlciBvcHRpb25zXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gcGFyYW0gLSBwYXJhbWV0ZXIncyBuYW1lIHRvIHVwZGF0ZS4gSWYgb2JqZWN0IHRoZW4gaXQgd2lsbCBleHRlbmQgY3VycmVudCBvcHRpb25zXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfE51bWJlcnxPYmplY3R9IFt2YWx1ZV0gLSBuZXcgcGFyYW0gdmFsdWVcbiAgICAgICAgICovXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKHBhcmFtLCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgICAgICBpZiAobGVuID09IDIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdHNbcGFyYW1dID0gdmFsdWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxlbiA9PSAxICYmIHR5cGVvZiBwYXJhbSA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0cyA9ICQuZXh0ZW5kKHRydWUsIHRoaXMub3B0cywgcGFyYW0pXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZVNob3J0Q3V0cygpO1xuICAgICAgICAgICAgdGhpcy5fc3luY1dpdGhNaW5NYXhEYXRlcygpO1xuICAgICAgICAgICAgdGhpcy5fZGVmaW5lTG9jYWxlKHRoaXMub3B0cy5sYW5ndWFnZSk7XG4gICAgICAgICAgICB0aGlzLm5hdi5fYWRkQnV0dG9uc0lmTmVlZCgpO1xuICAgICAgICAgICAgdGhpcy5uYXYuX3JlbmRlcigpO1xuICAgICAgICAgICAgdGhpcy52aWV3c1t0aGlzLmN1cnJlbnRWaWV3XS5fcmVuZGVyKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmVsSXNJbnB1dCAmJiAhdGhpcy5vcHRzLmlubGluZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3NldFBvc2l0aW9uQ2xhc3Nlcyh0aGlzLm9wdHMucG9zaXRpb24pO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRQb3NpdGlvbih0aGlzLm9wdHMucG9zaXRpb24pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLmNsYXNzZXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyLmFkZENsYXNzKHRoaXMub3B0cy5jbGFzc2VzKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcblxuICAgICAgICBfc3luY1dpdGhNaW5NYXhEYXRlczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGN1clRpbWUgPSB0aGlzLmRhdGUuZ2V0VGltZSgpO1xuICAgICAgICAgICAgdGhpcy5zaWxlbnQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKHRoaXMubWluVGltZSA+IGN1clRpbWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSB0aGlzLm1pbkRhdGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm1heFRpbWUgPCBjdXJUaW1lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlID0gdGhpcy5tYXhEYXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zaWxlbnQgPSBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBfaXNTZWxlY3RlZDogZnVuY3Rpb24gKGNoZWNrRGF0ZSwgY2VsbFR5cGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkRGF0ZXMuc29tZShmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkYXRlcGlja2VyLmlzU2FtZShkYXRlLCBjaGVja0RhdGUsIGNlbGxUeXBlKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICBfc2V0SW5wdXRWYWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRzID0gX3RoaXMub3B0cyxcbiAgICAgICAgICAgICAgICBmb3JtYXQgPSBfdGhpcy5sb2MuZGF0ZUZvcm1hdCxcbiAgICAgICAgICAgICAgICBhbHRGb3JtYXQgPSBvcHRzLmFsdEZpZWxkRGF0ZUZvcm1hdCxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IF90aGlzLnNlbGVjdGVkRGF0ZXMubWFwKGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5mb3JtYXREYXRlKGZvcm1hdCwgZGF0ZSlcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBhbHRWYWx1ZXM7XG5cbiAgICAgICAgICAgIGlmIChvcHRzLmFsdEZpZWxkICYmIF90aGlzLiRhbHRGaWVsZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBhbHRWYWx1ZXMgPSB0aGlzLnNlbGVjdGVkRGF0ZXMubWFwKGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5mb3JtYXREYXRlKGFsdEZvcm1hdCwgZGF0ZSlcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBhbHRWYWx1ZXMgPSBhbHRWYWx1ZXMuam9pbih0aGlzLm9wdHMubXVsdGlwbGVEYXRlc1NlcGFyYXRvcik7XG4gICAgICAgICAgICAgICAgdGhpcy4kYWx0RmllbGQudmFsKGFsdFZhbHVlcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUuam9pbih0aGlzLm9wdHMubXVsdGlwbGVEYXRlc1NlcGFyYXRvcik7XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLnZhbCh2YWx1ZSlcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2sgaWYgZGF0ZSBpcyBiZXR3ZWVuIG1pbkRhdGUgYW5kIG1heERhdGVcbiAgICAgICAgICogQHBhcmFtIGRhdGUge29iamVjdH0gLSBkYXRlIG9iamVjdFxuICAgICAgICAgKiBAcGFyYW0gdHlwZSB7c3RyaW5nfSAtIGNlbGwgdHlwZVxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9pc0luUmFuZ2U6IGZ1bmN0aW9uIChkYXRlLCB0eXBlKSB7XG4gICAgICAgICAgICB2YXIgdGltZSA9IGRhdGUuZ2V0VGltZSgpLFxuICAgICAgICAgICAgICAgIGQgPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUoZGF0ZSksXG4gICAgICAgICAgICAgICAgbWluID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKHRoaXMubWluRGF0ZSksXG4gICAgICAgICAgICAgICAgbWF4ID0gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKHRoaXMubWF4RGF0ZSksXG4gICAgICAgICAgICAgICAgZE1pblRpbWUgPSBuZXcgRGF0ZShkLnllYXIsIGQubW9udGgsIG1pbi5kYXRlKS5nZXRUaW1lKCksXG4gICAgICAgICAgICAgICAgZE1heFRpbWUgPSBuZXcgRGF0ZShkLnllYXIsIGQubW9udGgsIG1heC5kYXRlKS5nZXRUaW1lKCksXG4gICAgICAgICAgICAgICAgdHlwZXMgPSB7XG4gICAgICAgICAgICAgICAgICAgIGRheTogdGltZSA+PSB0aGlzLm1pblRpbWUgJiYgdGltZSA8PSB0aGlzLm1heFRpbWUsXG4gICAgICAgICAgICAgICAgICAgIG1vbnRoOiBkTWluVGltZSA+PSB0aGlzLm1pblRpbWUgJiYgZE1heFRpbWUgPD0gdGhpcy5tYXhUaW1lLFxuICAgICAgICAgICAgICAgICAgICB5ZWFyOiBkLnllYXIgPj0gbWluLnllYXIgJiYgZC55ZWFyIDw9IG1heC55ZWFyXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiB0eXBlID8gdHlwZXNbdHlwZV0gOiB0eXBlcy5kYXlcbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0RGltZW5zaW9uczogZnVuY3Rpb24gKCRlbCkge1xuICAgICAgICAgICAgdmFyIG9mZnNldCA9ICRlbC5vZmZzZXQoKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB3aWR0aDogJGVsLm91dGVyV2lkdGgoKSxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICRlbC5vdXRlckhlaWdodCgpLFxuICAgICAgICAgICAgICAgIGxlZnQ6IG9mZnNldC5sZWZ0LFxuICAgICAgICAgICAgICAgIHRvcDogb2Zmc2V0LnRvcFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXREYXRlRnJvbUNlbGw6IGZ1bmN0aW9uIChjZWxsKSB7XG4gICAgICAgICAgICB2YXIgY3VyRGF0ZSA9IHRoaXMucGFyc2VkRGF0ZSxcbiAgICAgICAgICAgICAgICB5ZWFyID0gY2VsbC5kYXRhKCd5ZWFyJykgfHwgY3VyRGF0ZS55ZWFyLFxuICAgICAgICAgICAgICAgIG1vbnRoID0gY2VsbC5kYXRhKCdtb250aCcpID09IHVuZGVmaW5lZCA/IGN1ckRhdGUubW9udGggOiBjZWxsLmRhdGEoJ21vbnRoJyksXG4gICAgICAgICAgICAgICAgZGF0ZSA9IGNlbGwuZGF0YSgnZGF0ZScpIHx8IDE7XG5cbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgZGF0ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3NldFBvc2l0aW9uQ2xhc3NlczogZnVuY3Rpb24gKHBvcykge1xuICAgICAgICAgICAgcG9zID0gcG9zLnNwbGl0KCcgJyk7XG4gICAgICAgICAgICB2YXIgbWFpbiA9IHBvc1swXSxcbiAgICAgICAgICAgICAgICBzZWMgPSBwb3NbMV0sXG4gICAgICAgICAgICAgICAgY2xhc3NlcyA9ICdkYXRlcGlja2VyIC0nICsgbWFpbiArICctJyArIHNlYyArICctIC1mcm9tLScgKyBtYWluICsgJy0nO1xuXG4gICAgICAgICAgICBpZiAodGhpcy52aXNpYmxlKSBjbGFzc2VzICs9ICcgYWN0aXZlJztcblxuICAgICAgICAgICAgdGhpcy4kZGF0ZXBpY2tlclxuICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdjbGFzcycpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKGNsYXNzZXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldFBvc2l0aW9uOiBmdW5jdGlvbiAocG9zaXRpb24pIHtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gcG9zaXRpb24gfHwgdGhpcy5vcHRzLnBvc2l0aW9uO1xuXG4gICAgICAgICAgICB2YXIgZGltcyA9IHRoaXMuX2dldERpbWVuc2lvbnModGhpcy4kZWwpLFxuICAgICAgICAgICAgICAgIHNlbGZEaW1zID0gdGhpcy5fZ2V0RGltZW5zaW9ucyh0aGlzLiRkYXRlcGlja2VyKSxcbiAgICAgICAgICAgICAgICBwb3MgPSBwb3NpdGlvbi5zcGxpdCgnICcpLFxuICAgICAgICAgICAgICAgIHRvcCwgbGVmdCxcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSB0aGlzLm9wdHMub2Zmc2V0LFxuICAgICAgICAgICAgICAgIG1haW4gPSBwb3NbMF0sXG4gICAgICAgICAgICAgICAgc2Vjb25kYXJ5ID0gcG9zWzFdO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKG1haW4pIHtcbiAgICAgICAgICAgICAgICBjYXNlICd0b3AnOlxuICAgICAgICAgICAgICAgICAgICB0b3AgPSBkaW1zLnRvcCAtIHNlbGZEaW1zLmhlaWdodCAtIG9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gZGltcy5sZWZ0ICsgZGltcy53aWR0aCArIG9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnYm90dG9tJzpcbiAgICAgICAgICAgICAgICAgICAgdG9wID0gZGltcy50b3AgKyBkaW1zLmhlaWdodCArIG9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICAgICAgICAgIGxlZnQgPSBkaW1zLmxlZnQgLSBzZWxmRGltcy53aWR0aCAtIG9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN3aXRjaChzZWNvbmRhcnkpIHtcbiAgICAgICAgICAgICAgICBjYXNlICd0b3AnOlxuICAgICAgICAgICAgICAgICAgICB0b3AgPSBkaW1zLnRvcDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gZGltcy5sZWZ0ICsgZGltcy53aWR0aCAtIHNlbGZEaW1zLndpZHRoO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdib3R0b20nOlxuICAgICAgICAgICAgICAgICAgICB0b3AgPSBkaW1zLnRvcCArIGRpbXMuaGVpZ2h0IC0gc2VsZkRpbXMuaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgICAgICAgICAgbGVmdCA9IGRpbXMubGVmdDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnY2VudGVyJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKC9sZWZ0fHJpZ2h0Ly50ZXN0KG1haW4pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3AgPSBkaW1zLnRvcCArIGRpbXMuaGVpZ2h0LzIgLSBzZWxmRGltcy5oZWlnaHQvMjtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgPSBkaW1zLmxlZnQgKyBkaW1zLndpZHRoLzIgLSBzZWxmRGltcy53aWR0aC8yO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXJcbiAgICAgICAgICAgICAgICAuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0b3BcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIHNob3c6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb24odGhpcy5vcHRzLnBvc2l0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuJGRhdGVwaWNrZXIuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgdGhpcy52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBoaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLiRkYXRlcGlja2VyXG4gICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgICAgICAgICAgICAgIC5jc3Moe1xuICAgICAgICAgICAgICAgICAgICBsZWZ0OiAnLTEwMDAwMHB4J1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLmZvY3VzZWQgPSAnJztcbiAgICAgICAgICAgIHRoaXMua2V5cyA9IFtdO1xuXG4gICAgICAgICAgICB0aGlzLmluRm9jdXMgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy4kZWwuYmx1cigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRvd246IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgICAgICB0aGlzLl9jaGFuZ2VWaWV3KGRhdGUsICdkb3duJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXA6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgICAgICB0aGlzLl9jaGFuZ2VWaWV3KGRhdGUsICd1cCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9jaGFuZ2VWaWV3OiBmdW5jdGlvbiAoZGF0ZSwgZGlyKSB7XG4gICAgICAgICAgICBkYXRlID0gZGF0ZSB8fCB0aGlzLmZvY3VzZWQgfHwgdGhpcy5kYXRlO1xuXG4gICAgICAgICAgICB2YXIgbmV4dFZpZXcgPSBkaXIgPT0gJ3VwJyA/IHRoaXMudmlld0luZGV4ICsgMSA6IHRoaXMudmlld0luZGV4IC0gMTtcbiAgICAgICAgICAgIGlmIChuZXh0VmlldyA+IDIpIG5leHRWaWV3ID0gMjtcbiAgICAgICAgICAgIGlmIChuZXh0VmlldyA8IDApIG5leHRWaWV3ID0gMDtcblxuICAgICAgICAgICAgdGhpcy5zaWxlbnQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIDEpO1xuICAgICAgICAgICAgdGhpcy5zaWxlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMudmlldyA9IHRoaXMudmlld0luZGV4ZXNbbmV4dFZpZXddO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgX2hhbmRsZUhvdEtleTogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgdmFyIGRhdGUgPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUodGhpcy5fZ2V0Rm9jdXNlZERhdGUoKSksXG4gICAgICAgICAgICAgICAgZm9jdXNlZFBhcnNlZCxcbiAgICAgICAgICAgICAgICBvID0gdGhpcy5vcHRzLFxuICAgICAgICAgICAgICAgIG5ld0RhdGUsXG4gICAgICAgICAgICAgICAgdG90YWxEYXlzSW5OZXh0TW9udGgsXG4gICAgICAgICAgICAgICAgbW9udGhDaGFuZ2VkID0gZmFsc2UsXG4gICAgICAgICAgICAgICAgeWVhckNoYW5nZWQgPSBmYWxzZSxcbiAgICAgICAgICAgICAgICBkZWNhZGVDaGFuZ2VkID0gZmFsc2UsXG4gICAgICAgICAgICAgICAgeSA9IGRhdGUueWVhcixcbiAgICAgICAgICAgICAgICBtID0gZGF0ZS5tb250aCxcbiAgICAgICAgICAgICAgICBkID0gZGF0ZS5kYXRlO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2N0cmxSaWdodCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnY3RybFVwJzpcbiAgICAgICAgICAgICAgICAgICAgbSArPSAxO1xuICAgICAgICAgICAgICAgICAgICBtb250aENoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdjdHJsTGVmdCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnY3RybERvd24nOlxuICAgICAgICAgICAgICAgICAgICBtIC09IDE7XG4gICAgICAgICAgICAgICAgICAgIG1vbnRoQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3NoaWZ0UmlnaHQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3NoaWZ0VXAnOlxuICAgICAgICAgICAgICAgICAgICB5ZWFyQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHkgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnc2hpZnRMZWZ0JzpcbiAgICAgICAgICAgICAgICBjYXNlICdzaGlmdERvd24nOlxuICAgICAgICAgICAgICAgICAgICB5ZWFyQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHkgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnYWx0UmlnaHQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2FsdFVwJzpcbiAgICAgICAgICAgICAgICAgICAgZGVjYWRlQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHkgKz0gMTA7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2FsdExlZnQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2FsdERvd24nOlxuICAgICAgICAgICAgICAgICAgICBkZWNhZGVDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgeSAtPSAxMDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnY3RybFNoaWZ0VXAnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0b3RhbERheXNJbk5leHRNb250aCA9IGRhdGVwaWNrZXIuZ2V0RGF5c0NvdW50KG5ldyBEYXRlKHksbSkpO1xuICAgICAgICAgICAgbmV3RGF0ZSA9IG5ldyBEYXRlKHksbSxkKTtcblxuICAgICAgICAgICAgLy8gSWYgbmV4dCBtb250aCBoYXMgbGVzcyBkYXlzIHRoYW4gY3VycmVudCwgc2V0IGRhdGUgdG8gdG90YWwgZGF5cyBpbiB0aGF0IG1vbnRoXG4gICAgICAgICAgICBpZiAodG90YWxEYXlzSW5OZXh0TW9udGggPCBkKSBkID0gdG90YWxEYXlzSW5OZXh0TW9udGg7XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIG5ld0RhdGUgaXMgaW4gdmFsaWQgcmFuZ2VcbiAgICAgICAgICAgIGlmIChuZXdEYXRlLmdldFRpbWUoKSA8IHRoaXMubWluVGltZSkge1xuICAgICAgICAgICAgICAgIG5ld0RhdGUgPSB0aGlzLm1pbkRhdGU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0RhdGUuZ2V0VGltZSgpID4gdGhpcy5tYXhUaW1lKSB7XG4gICAgICAgICAgICAgICAgbmV3RGF0ZSA9IHRoaXMubWF4RGF0ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5mb2N1c2VkID0gbmV3RGF0ZTtcblxuICAgICAgICAgICAgZm9jdXNlZFBhcnNlZCA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZShuZXdEYXRlKTtcbiAgICAgICAgICAgIGlmIChtb250aENoYW5nZWQgJiYgby5vbkNoYW5nZU1vbnRoKSB7XG4gICAgICAgICAgICAgICAgby5vbkNoYW5nZU1vbnRoKGZvY3VzZWRQYXJzZWQubW9udGgsIGZvY3VzZWRQYXJzZWQueWVhcilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh5ZWFyQ2hhbmdlZCAmJiBvLm9uQ2hhbmdlWWVhcikge1xuICAgICAgICAgICAgICAgIG8ub25DaGFuZ2VZZWFyKGZvY3VzZWRQYXJzZWQueWVhcilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkZWNhZGVDaGFuZ2VkICYmIG8ub25DaGFuZ2VEZWNhZGUpIHtcbiAgICAgICAgICAgICAgICBvLm9uQ2hhbmdlRGVjYWRlKHRoaXMuY3VyRGVjYWRlKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9yZWdpc3RlcktleTogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgdmFyIGV4aXN0cyA9IHRoaXMua2V5cy5zb21lKGZ1bmN0aW9uIChjdXJLZXkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3VyS2V5ID09IGtleTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoIWV4aXN0cykge1xuICAgICAgICAgICAgICAgIHRoaXMua2V5cy5wdXNoKGtleSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfdW5SZWdpc3RlcktleTogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5rZXlzLmluZGV4T2Yoa2V5KTtcblxuICAgICAgICAgICAgdGhpcy5rZXlzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2lzSG90S2V5UHJlc3NlZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRIb3RLZXksXG4gICAgICAgICAgICAgICAgZm91bmQgPSBmYWxzZSxcbiAgICAgICAgICAgICAgICBfdGhpcyA9IHRoaXMsXG4gICAgICAgICAgICAgICAgcHJlc3NlZEtleXMgPSB0aGlzLmtleXMuc29ydCgpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBob3RLZXkgaW4gaG90S2V5cykge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRIb3RLZXkgPSBob3RLZXlzW2hvdEtleV07XG4gICAgICAgICAgICAgICAgaWYgKHByZXNzZWRLZXlzLmxlbmd0aCAhPSBjdXJyZW50SG90S2V5Lmxlbmd0aCkgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudEhvdEtleS5ldmVyeShmdW5jdGlvbiAoa2V5LCBpKSB7IHJldHVybiBrZXkgPT0gcHJlc3NlZEtleXNbaV19KSkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5fdHJpZ2dlcignaG90S2V5JywgaG90S2V5KTtcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgICAgICB9LFxuXG4gICAgICAgIF90cmlnZ2VyOiBmdW5jdGlvbiAoZXZlbnQsIGFyZ3MpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLnRyaWdnZXIoZXZlbnQsIGFyZ3MpXG4gICAgICAgIH0sXG5cbiAgICAgICAgX2ZvY3VzTmV4dENlbGw6IGZ1bmN0aW9uIChrZXlDb2RlLCB0eXBlKSB7XG4gICAgICAgICAgICB0eXBlID0gdHlwZSB8fCB0aGlzLmNlbGxUeXBlO1xuXG4gICAgICAgICAgICB2YXIgZGF0ZSA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZSh0aGlzLl9nZXRGb2N1c2VkRGF0ZSgpKSxcbiAgICAgICAgICAgICAgICB5ID0gZGF0ZS55ZWFyLFxuICAgICAgICAgICAgICAgIG0gPSBkYXRlLm1vbnRoLFxuICAgICAgICAgICAgICAgIGQgPSBkYXRlLmRhdGU7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0hvdEtleVByZXNzZWQoKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzd2l0Y2goa2V5Q29kZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMzc6IC8vIGxlZnRcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAnZGF5JyA/IChkIC09IDEpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ21vbnRoJyA/IChtIC09IDEpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ3llYXInID8gKHkgLT0gMSkgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAzODogLy8gdXBcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAnZGF5JyA/IChkIC09IDcpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ21vbnRoJyA/IChtIC09IDMpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ3llYXInID8gKHkgLT0gNCkgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAzOTogLy8gcmlnaHRcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAnZGF5JyA/IChkICs9IDEpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ21vbnRoJyA/IChtICs9IDEpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPT0gJ3llYXInID8gKHkgKz0gMSkgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSA0MDogLy8gZG93blxuICAgICAgICAgICAgICAgICAgICB0eXBlID09ICdkYXknID8gKGQgKz0gNykgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAnbW9udGgnID8gKG0gKz0gMykgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9PSAneWVhcicgPyAoeSArPSA0KSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG5kID0gbmV3IERhdGUoeSxtLGQpO1xuICAgICAgICAgICAgaWYgKG5kLmdldFRpbWUoKSA8IHRoaXMubWluVGltZSkge1xuICAgICAgICAgICAgICAgIG5kID0gdGhpcy5taW5EYXRlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuZC5nZXRUaW1lKCkgPiB0aGlzLm1heFRpbWUpIHtcbiAgICAgICAgICAgICAgICBuZCA9IHRoaXMubWF4RGF0ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5mb2N1c2VkID0gbmQ7XG5cbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0Rm9jdXNlZERhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBmb2N1c2VkICA9IHRoaXMuZm9jdXNlZCB8fCB0aGlzLnNlbGVjdGVkRGF0ZXNbdGhpcy5zZWxlY3RlZERhdGVzLmxlbmd0aCAtIDFdLFxuICAgICAgICAgICAgICAgIGQgPSB0aGlzLnBhcnNlZERhdGU7XG5cbiAgICAgICAgICAgIGlmICghZm9jdXNlZCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy52aWV3KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2RheXMnOlxuICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXNlZCA9IG5ldyBEYXRlKGQueWVhciwgZC5tb250aCwgbmV3IERhdGUoKS5nZXREYXRlKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ21vbnRocyc6XG4gICAgICAgICAgICAgICAgICAgICAgICBmb2N1c2VkID0gbmV3IERhdGUoZC55ZWFyLCBkLm1vbnRoLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICd5ZWFycyc6XG4gICAgICAgICAgICAgICAgICAgICAgICBmb2N1c2VkID0gbmV3IERhdGUoZC55ZWFyLCAwLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZvY3VzZWQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldENlbGw6IGZ1bmN0aW9uIChkYXRlLCB0eXBlKSB7XG4gICAgICAgICAgICB0eXBlID0gdHlwZSB8fCB0aGlzLmNlbGxUeXBlO1xuXG4gICAgICAgICAgICB2YXIgZCA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZShkYXRlKSxcbiAgICAgICAgICAgICAgICBzZWxlY3RvciA9ICcuZGF0ZXBpY2tlci0tY2VsbFtkYXRhLXllYXI9XCInICsgZC55ZWFyICsgJ1wiXScsXG4gICAgICAgICAgICAgICAgJGNlbGw7XG5cbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ21vbnRoJzpcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IgPSAnW2RhdGEtbW9udGg9XCInICsgZC5tb250aCArICdcIl0nO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdkYXknOlxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RvciArPSAnW2RhdGEtbW9udGg9XCInICsgZC5tb250aCArICdcIl1bZGF0YS1kYXRlPVwiJyArIGQuZGF0ZSArICdcIl0nO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRjZWxsID0gdGhpcy52aWV3c1t0aGlzLmN1cnJlbnRWaWV3XS4kZWwuZmluZChzZWxlY3Rvcik7XG5cbiAgICAgICAgICAgIHJldHVybiAkY2VsbC5sZW5ndGggPyAkY2VsbCA6ICcnO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICBfdGhpcy4kZWxcbiAgICAgICAgICAgICAgICAub2ZmKCcuYWRwJylcbiAgICAgICAgICAgICAgICAuZGF0YSgnZGF0ZXBpY2tlcicsICcnKTtcblxuICAgICAgICAgICAgX3RoaXMuc2VsZWN0ZWREYXRlcyA9IFtdO1xuICAgICAgICAgICAgX3RoaXMuZm9jdXNlZCA9ICcnO1xuICAgICAgICAgICAgX3RoaXMudmlld3MgPSB7fTtcbiAgICAgICAgICAgIF90aGlzLmtleXMgPSBbXTtcbiAgICAgICAgICAgIF90aGlzLm1pblJhbmdlID0gJyc7XG4gICAgICAgICAgICBfdGhpcy5tYXhSYW5nZSA9ICcnO1xuXG4gICAgICAgICAgICBpZiAoX3RoaXMub3B0cy5pbmxpbmUgfHwgIV90aGlzLmVsSXNJbnB1dCkge1xuICAgICAgICAgICAgICAgIF90aGlzLiRkYXRlcGlja2VyLmNsb3Nlc3QoJy5kYXRlcGlja2VyLWlubGluZScpLnJlbW92ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfdGhpcy4kZGF0ZXBpY2tlci5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfb25TaG93RXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uQmx1cjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmluRm9jdXMgJiYgdGhpcy52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uTW91c2VEb3duRGF0ZXBpY2tlcjogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHRoaXMuaW5Gb2N1cyA9IHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uTW91c2VVcERhdGVwaWNrZXI6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB0aGlzLmluRm9jdXMgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuJGVsLmZvY3VzKClcbiAgICAgICAgfSxcblxuICAgICAgICBfb25JbnB1dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHZhbCA9IHRoaXMuJGVsLnZhbCgpO1xuXG4gICAgICAgICAgICBpZiAoIXZhbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfb25SZXNpemU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFBvc2l0aW9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uS2V5RG93bjogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciBjb2RlID0gZS53aGljaDtcbiAgICAgICAgICAgIHRoaXMuX3JlZ2lzdGVyS2V5KGNvZGUpO1xuXG4gICAgICAgICAgICAvLyBBcnJvd3NcbiAgICAgICAgICAgIGlmIChjb2RlID49IDM3ICYmIGNvZGUgPD0gNDApIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fZm9jdXNOZXh0Q2VsbChjb2RlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRW50ZXJcbiAgICAgICAgICAgIGlmIChjb2RlID09IDEzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZm9jdXNlZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fZ2V0Q2VsbCh0aGlzLmZvY3VzZWQpLmhhc0NsYXNzKCctZGlzYWJsZWQtJykpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudmlldyAhPSB0aGlzLm9wdHMubWluVmlldykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kb3duKClcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhbHJlYWR5U2VsZWN0ZWQgPSB0aGlzLl9pc1NlbGVjdGVkKHRoaXMuZm9jdXNlZCwgdGhpcy5jZWxsVHlwZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYWxyZWFkeVNlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3REYXRlKHRoaXMuZm9jdXNlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGFscmVhZHlTZWxlY3RlZCAmJiB0aGlzLm9wdHMudG9nZ2xlU2VsZWN0ZWQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlRGF0ZSh0aGlzLmZvY3VzZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBFc2NcbiAgICAgICAgICAgIGlmIChjb2RlID09IDI3KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uS2V5VXA6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgY29kZSA9IGUud2hpY2g7XG4gICAgICAgICAgICB0aGlzLl91blJlZ2lzdGVyS2V5KGNvZGUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9vbkhvdEtleTogZnVuY3Rpb24gKGUsIGhvdEtleSkge1xuICAgICAgICAgICAgdGhpcy5faGFuZGxlSG90S2V5KGhvdEtleSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uTW91c2VFbnRlckNlbGw6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgJGNlbGwgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcuZGF0ZXBpY2tlci0tY2VsbCcpLFxuICAgICAgICAgICAgICAgIGRhdGUgPSB0aGlzLl9nZXREYXRlRnJvbUNlbGwoJGNlbGwpO1xuXG4gICAgICAgICAgICAvLyBQcmV2ZW50IGZyb20gdW5uZWNlc3NhcnkgcmVuZGVyaW5nIGFuZCBzZXR0aW5nIG5ldyBjdXJyZW50RGF0ZVxuICAgICAgICAgICAgdGhpcy5zaWxlbnQgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5mb2N1c2VkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5mb2N1c2VkID0gJydcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJGNlbGwuYWRkQ2xhc3MoJy1mb2N1cy0nKTtcblxuICAgICAgICAgICAgdGhpcy5mb2N1c2VkID0gZGF0ZTtcbiAgICAgICAgICAgIHRoaXMuc2lsZW50ID0gZmFsc2U7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMucmFuZ2UgJiYgdGhpcy5zZWxlY3RlZERhdGVzLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5taW5SYW5nZSA9IHRoaXMuc2VsZWN0ZWREYXRlc1swXTtcbiAgICAgICAgICAgICAgICB0aGlzLm1heFJhbmdlID0gJyc7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGVwaWNrZXIubGVzcyh0aGlzLm1pblJhbmdlLCB0aGlzLmZvY3VzZWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWF4UmFuZ2UgPSB0aGlzLm1pblJhbmdlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1pblJhbmdlID0gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMudmlld3NbdGhpcy5jdXJyZW50Vmlld10uX3VwZGF0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9vbk1vdXNlTGVhdmVDZWxsOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyICRjZWxsID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLmRhdGVwaWNrZXItLWNlbGwnKTtcblxuICAgICAgICAgICAgJGNlbGwucmVtb3ZlQ2xhc3MoJy1mb2N1cy0nKTtcblxuICAgICAgICAgICAgdGhpcy5zaWxlbnQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5mb2N1c2VkID0gJyc7XG4gICAgICAgICAgICB0aGlzLnNpbGVudCA9IGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldCBmb2N1c2VkKHZhbCkge1xuICAgICAgICAgICAgaWYgKCF2YWwgJiYgdGhpcy5mb2N1c2VkKSB7XG4gICAgICAgICAgICAgICAgdmFyICRjZWxsID0gdGhpcy5fZ2V0Q2VsbCh0aGlzLmZvY3VzZWQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCRjZWxsLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAkY2VsbC5yZW1vdmVDbGFzcygnLWZvY3VzLScpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fZm9jdXNlZCA9IHZhbDtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMucmFuZ2UgJiYgdGhpcy5zZWxlY3RlZERhdGVzLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5taW5SYW5nZSA9IHRoaXMuc2VsZWN0ZWREYXRlc1swXTtcbiAgICAgICAgICAgICAgICB0aGlzLm1heFJhbmdlID0gJyc7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGVwaWNrZXIubGVzcyh0aGlzLm1pblJhbmdlLCB0aGlzLl9mb2N1c2VkKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1heFJhbmdlID0gdGhpcy5taW5SYW5nZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5taW5SYW5nZSA9ICcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnNpbGVudCkgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5kYXRlID0gdmFsO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldCBmb2N1c2VkKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZvY3VzZWQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0IHBhcnNlZERhdGUoKSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0ZXBpY2tlci5nZXRQYXJzZWREYXRlKHRoaXMuZGF0ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0IGRhdGUgKHZhbCkge1xuICAgICAgICAgICAgaWYgKCEodmFsIGluc3RhbmNlb2YgRGF0ZSkpIHJldHVybjtcblxuICAgICAgICAgICAgdGhpcy5jdXJyZW50RGF0ZSA9IHZhbDtcblxuICAgICAgICAgICAgaWYgKHRoaXMuaW5pdGVkICYmICF0aGlzLnNpbGVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMudmlld3NbdGhpcy52aWV3XS5fcmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5uYXYuX3JlbmRlcigpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnZpc2libGUgJiYgdGhpcy5lbElzSW5wdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2YWw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0IGRhdGUgKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudERhdGVcbiAgICAgICAgfSxcblxuICAgICAgICBzZXQgdmlldyAodmFsKSB7XG4gICAgICAgICAgICB0aGlzLnZpZXdJbmRleCA9IHRoaXMudmlld0luZGV4ZXMuaW5kZXhPZih2YWwpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy52aWV3SW5kZXggPCAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnByZXZWaWV3ID0gdGhpcy5jdXJyZW50VmlldztcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFZpZXcgPSB2YWw7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmluaXRlZCkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy52aWV3c1t2YWxdKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlld3NbdmFsXSA9IG5ldyBEYXRlcGlja2VyLkJvZHkodGhpcywgdmFsLCB0aGlzLm9wdHMpXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3c1t2YWxdLl9yZW5kZXIoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdzW3RoaXMucHJldlZpZXddLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdzW3ZhbF0uc2hvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMubmF2Ll9yZW5kZXIoKTtcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdHMub25DaGFuZ2VWaWV3KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0cy5vbkNoYW5nZVZpZXcodmFsKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5lbElzSW5wdXQgJiYgdGhpcy52aXNpYmxlKSB0aGlzLnNldFBvc2l0aW9uKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB2YWxcbiAgICAgICAgfSxcblxuICAgICAgICBnZXQgdmlldygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRWaWV3O1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldCBjZWxsVHlwZSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZpZXcuc3Vic3RyaW5nKDAsIHRoaXMudmlldy5sZW5ndGggLSAxKVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldCBtaW5UaW1lKCkge1xuICAgICAgICAgICAgdmFyIG1pbiA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZSh0aGlzLm1pbkRhdGUpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKG1pbi55ZWFyLCBtaW4ubW9udGgsIG1pbi5kYXRlKS5nZXRUaW1lKClcbiAgICAgICAgfSxcblxuICAgICAgICBnZXQgbWF4VGltZSgpIHtcbiAgICAgICAgICAgIHZhciBtYXggPSBkYXRlcGlja2VyLmdldFBhcnNlZERhdGUodGhpcy5tYXhEYXRlKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZShtYXgueWVhciwgbWF4Lm1vbnRoLCBtYXguZGF0ZSkuZ2V0VGltZSgpXG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0IGN1ckRlY2FkZSgpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRlcGlja2VyLmdldERlY2FkZSh0aGlzLmRhdGUpXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gIFV0aWxzXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgZGF0ZXBpY2tlci5nZXREYXlzQ291bnQgPSBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCkgKyAxLCAwKS5nZXREYXRlKCk7XG4gICAgfTtcblxuICAgIGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZSA9IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB5ZWFyOiBkYXRlLmdldEZ1bGxZZWFyKCksXG4gICAgICAgICAgICBtb250aDogZGF0ZS5nZXRNb250aCgpLFxuICAgICAgICAgICAgZnVsbE1vbnRoOiAoZGF0ZS5nZXRNb250aCgpICsgMSkgPCAxMCA/ICcwJyArIChkYXRlLmdldE1vbnRoKCkgKyAxKSA6IGRhdGUuZ2V0TW9udGgoKSArIDEsIC8vIE9uZSBiYXNlZFxuICAgICAgICAgICAgZGF0ZTogZGF0ZS5nZXREYXRlKCksXG4gICAgICAgICAgICBmdWxsRGF0ZTogZGF0ZS5nZXREYXRlKCkgPCAxMCA/ICcwJyArIGRhdGUuZ2V0RGF0ZSgpIDogZGF0ZS5nZXREYXRlKCksXG4gICAgICAgICAgICBkYXk6IGRhdGUuZ2V0RGF5KClcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBkYXRlcGlja2VyLmdldERlY2FkZSA9IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgIHZhciBmaXJzdFllYXIgPSBNYXRoLmZsb29yKGRhdGUuZ2V0RnVsbFllYXIoKSAvIDEwKSAqIDEwO1xuXG4gICAgICAgIHJldHVybiBbZmlyc3RZZWFyLCBmaXJzdFllYXIgKyA5XTtcbiAgICB9O1xuXG4gICAgZGF0ZXBpY2tlci50ZW1wbGF0ZSA9IGZ1bmN0aW9uIChzdHIsIGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8jXFx7KFtcXHddKylcXH0vZywgZnVuY3Rpb24gKHNvdXJjZSwgbWF0Y2gpIHtcbiAgICAgICAgICAgIGlmIChkYXRhW21hdGNoXSB8fCBkYXRhW21hdGNoXSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhW21hdGNoXVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZGF0ZXBpY2tlci5pc1NhbWUgPSBmdW5jdGlvbiAoZGF0ZTEsIGRhdGUyLCB0eXBlKSB7XG4gICAgICAgIGlmICghZGF0ZTEgfHwgIWRhdGUyKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHZhciBkMSA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZShkYXRlMSksXG4gICAgICAgICAgICBkMiA9IGRhdGVwaWNrZXIuZ2V0UGFyc2VkRGF0ZShkYXRlMiksXG4gICAgICAgICAgICBfdHlwZSA9IHR5cGUgPyB0eXBlIDogJ2RheScsXG5cbiAgICAgICAgICAgIGNvbmRpdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgZGF5OiBkMS5kYXRlID09IGQyLmRhdGUgJiYgZDEubW9udGggPT0gZDIubW9udGggJiYgZDEueWVhciA9PSBkMi55ZWFyLFxuICAgICAgICAgICAgICAgIG1vbnRoOiBkMS5tb250aCA9PSBkMi5tb250aCAmJiBkMS55ZWFyID09IGQyLnllYXIsXG4gICAgICAgICAgICAgICAgeWVhcjogZDEueWVhciA9PSBkMi55ZWFyXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBjb25kaXRpb25zW190eXBlXTtcbiAgICB9O1xuXG4gICAgZGF0ZXBpY2tlci5sZXNzID0gZnVuY3Rpb24gKGRhdGVDb21wYXJlVG8sIGRhdGUsIHR5cGUpIHtcbiAgICAgICAgaWYgKCFkYXRlQ29tcGFyZVRvIHx8ICFkYXRlKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiBkYXRlLmdldFRpbWUoKSA8IGRhdGVDb21wYXJlVG8uZ2V0VGltZSgpO1xuICAgIH07XG5cbiAgICBkYXRlcGlja2VyLmJpZ2dlciA9IGZ1bmN0aW9uIChkYXRlQ29tcGFyZVRvLCBkYXRlLCB0eXBlKSB7XG4gICAgICAgIGlmICghZGF0ZUNvbXBhcmVUbyB8fCAhZGF0ZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gZGF0ZS5nZXRUaW1lKCkgPiBkYXRlQ29tcGFyZVRvLmdldFRpbWUoKTtcbiAgICB9O1xuXG4gICAgRGF0ZXBpY2tlci5sYW5ndWFnZSA9IHtcbiAgICAgICAgcnU6IHtcbiAgICAgICAgICAgIGRheXM6IFsn0JLQvtGB0LrRgNC10YHQtdC90YzQtScsICfQn9C+0L3QtdC00LXQu9GM0L3QuNC6JywgJ9CS0YLQvtGA0L3QuNC6JywgJ9Ch0YDQtdC00LAnLCAn0KfQtdGC0LLQtdGA0LMnLCAn0J/Rj9GC0L3QuNGG0LAnLCAn0KHRg9Cx0LHQvtGC0LAnXSxcbiAgICAgICAgICAgIGRheXNTaG9ydDogWyfQktC+0YEnLCfQn9C+0L0nLCfQktGC0L4nLCfQodGA0LUnLCfQp9C10YInLCfQn9GP0YInLCfQodGD0LEnXSxcbiAgICAgICAgICAgIGRheXNNaW46IFsn0JLRgScsJ9Cf0L0nLCfQktGCJywn0KHRgCcsJ9Cn0YInLCfQn9GCJywn0KHQsSddLFxuICAgICAgICAgICAgbW9udGhzOiBbJ9Cv0L3QstCw0YDRjCcsICfQpNC10LLRgNCw0LvRjCcsICfQnNCw0YDRgicsICfQkNC/0YDQtdC70YwnLCAn0JzQsNC5JywgJ9CY0Y7QvdGMJywgJ9CY0Y7Qu9GMJywgJ9CQ0LLQs9GD0YHRgicsICfQodC10L3RgtGP0LHRgNGMJywgJ9Ce0LrRgtGP0LHRgNGMJywgJ9Cd0L7Rj9Cx0YDRjCcsICfQlNC10LrQsNCx0YDRjCddLFxuICAgICAgICAgICAgbW9udGhzU2hvcnQ6IFsn0K/QvdCyJywgJ9Ck0LXQsicsICfQnNCw0YAnLCAn0JDQv9GAJywgJ9Cc0LDQuScsICfQmNGO0L0nLCAn0JjRjtC7JywgJ9CQ0LLQsycsICfQodC10L0nLCAn0J7QutGCJywgJ9Cd0L7RjycsICfQlNC10LonXSxcbiAgICAgICAgICAgIHRvZGF5OiAn0KHQtdCz0L7QtNC90Y8nLFxuICAgICAgICAgICAgY2xlYXI6ICfQntGH0LjRgdGC0LjRgtGMJyxcbiAgICAgICAgICAgIGRhdGVGb3JtYXQ6ICdkZC5tbS55eXl5JyxcbiAgICAgICAgICAgIGZpcnN0RGF5OiAxXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgJC5mbltwbHVnaW5OYW1lXSA9IGZ1bmN0aW9uICggb3B0aW9ucyApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoISQuZGF0YSh0aGlzLCBwbHVnaW5OYW1lKSkge1xuICAgICAgICAgICAgICAgICQuZGF0YSh0aGlzLCAgcGx1Z2luTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgbmV3IERhdGVwaWNrZXIoIHRoaXMsIG9wdGlvbnMgKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9ICQuZGF0YSh0aGlzLCBwbHVnaW5OYW1lKTtcblxuICAgICAgICAgICAgICAgIF90aGlzLm9wdHMgPSAkLmV4dGVuZCh0cnVlLCBfdGhpcy5vcHRzLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICBfdGhpcy51cGRhdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgICQoZnVuY3Rpb24gKCkge1xuICAgICAgICAkKGF1dG9Jbml0U2VsZWN0b3IpLmRhdGVwaWNrZXIoKTtcbiAgICB9KVxuXG59KSh3aW5kb3csIGpRdWVyeSk7XG47KGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGVtcGxhdGVzID0ge1xuICAgICAgICBkYXlzOicnICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1kYXlzIGRhdGVwaWNrZXItLWJvZHlcIj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1kYXlzLW5hbWVzXCI+PC9kaXY+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tY2VsbHMgZGF0ZXBpY2tlci0tY2VsbHMtZGF5c1wiPjwvZGl2PicgK1xuICAgICAgICAnPC9kaXY+JyxcbiAgICAgICAgbW9udGhzOiAnJyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tbW9udGhzIGRhdGVwaWNrZXItLWJvZHlcIj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1jZWxscyBkYXRlcGlja2VyLS1jZWxscy1tb250aHNcIj48L2Rpdj4nICtcbiAgICAgICAgJzwvZGl2PicsXG4gICAgICAgIHllYXJzOiAnJyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0teWVhcnMgZGF0ZXBpY2tlci0tYm9keVwiPicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLWNlbGxzIGRhdGVwaWNrZXItLWNlbGxzLXllYXJzXCI+PC9kaXY+JyArXG4gICAgICAgICc8L2Rpdj4nXG4gICAgICAgIH0sXG4gICAgICAgIEQgPSBEYXRlcGlja2VyO1xuXG4gICAgRC5Cb2R5ID0gZnVuY3Rpb24gKGQsIHR5cGUsIG9wdHMpIHtcbiAgICAgICAgdGhpcy5kID0gZDtcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy5vcHRzID0gb3B0cztcblxuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICB9O1xuXG4gICAgRC5Cb2R5LnByb3RvdHlwZSA9IHtcbiAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fYnVpbGRCYXNlSHRtbCgpO1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyKCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2JpbmRFdmVudHMoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfYmluZEV2ZW50czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwub24oJ2NsaWNrJywgJy5kYXRlcGlja2VyLS1jZWxsJywgJC5wcm94eSh0aGlzLl9vbkNsaWNrQ2VsbCwgdGhpcykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9idWlsZEJhc2VIdG1sOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLiRlbCA9ICQodGVtcGxhdGVzW3RoaXMudHlwZV0pLmFwcGVuZFRvKHRoaXMuZC4kY29udGVudCk7XG4gICAgICAgICAgICB0aGlzLiRuYW1lcyA9ICQoJy5kYXRlcGlja2VyLS1kYXlzLW5hbWVzJywgdGhpcy4kZWwpO1xuICAgICAgICAgICAgdGhpcy4kY2VsbHMgPSAkKCcuZGF0ZXBpY2tlci0tY2VsbHMnLCB0aGlzLiRlbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldERheU5hbWVzSHRtbDogZnVuY3Rpb24gKGZpcnN0RGF5LCBjdXJEYXksIGh0bWwsIGkpIHtcbiAgICAgICAgICAgIGN1ckRheSA9IGN1ckRheSAhPSB1bmRlZmluZWQgPyBjdXJEYXkgOiBmaXJzdERheTtcbiAgICAgICAgICAgIGh0bWwgPSBodG1sID8gaHRtbCA6ICcnO1xuICAgICAgICAgICAgaSA9IGkgIT0gdW5kZWZpbmVkID8gaSA6IDA7XG5cbiAgICAgICAgICAgIGlmIChpID4gNykgcmV0dXJuIGh0bWw7XG4gICAgICAgICAgICBpZiAoY3VyRGF5ID09IDcpIHJldHVybiB0aGlzLl9nZXREYXlOYW1lc0h0bWwoZmlyc3REYXksIDAsIGh0bWwsICsraSk7XG5cbiAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1kYXktbmFtZScgKyAodGhpcy5kLmlzV2Vla2VuZChjdXJEYXkpID8gXCIgLXdlZWtlbmQtXCIgOiBcIlwiKSArICdcIj4nICsgdGhpcy5kLmxvYy5kYXlzTWluW2N1ckRheV0gKyAnPC9kaXY+JztcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dldERheU5hbWVzSHRtbChmaXJzdERheSwgKytjdXJEYXksIGh0bWwsICsraSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldENlbGxDb250ZW50czogZnVuY3Rpb24gKGRhdGUsIHR5cGUpIHtcbiAgICAgICAgICAgIHZhciBjbGFzc2VzID0gXCJkYXRlcGlja2VyLS1jZWxsIGRhdGVwaWNrZXItLWNlbGwtXCIgKyB0eXBlLFxuICAgICAgICAgICAgICAgIGN1cnJlbnREYXRlID0gbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICBwYXJlbnQgPSB0aGlzLmQsXG4gICAgICAgICAgICAgICAgb3B0cyA9IHBhcmVudC5vcHRzLFxuICAgICAgICAgICAgICAgIGQgPSBELmdldFBhcnNlZERhdGUoZGF0ZSksXG4gICAgICAgICAgICAgICAgcmVuZGVyID0ge30sXG4gICAgICAgICAgICAgICAgaHRtbCA9IGQuZGF0ZTtcblxuICAgICAgICAgICAgaWYgKG9wdHMub25SZW5kZXJDZWxsKSB7XG4gICAgICAgICAgICAgICAgcmVuZGVyID0gb3B0cy5vblJlbmRlckNlbGwoZGF0ZSwgdHlwZSkgfHwge307XG4gICAgICAgICAgICAgICAgaHRtbCA9IHJlbmRlci5odG1sID8gcmVuZGVyLmh0bWwgOiBodG1sO1xuICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gcmVuZGVyLmNsYXNzZXMgPyAnICcgKyByZW5kZXIuY2xhc3NlcyA6ICcnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdkYXknOlxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyZW50LmlzV2Vla2VuZChkLmRheSkpIGNsYXNzZXMgKz0gXCIgLXdlZWtlbmQtXCI7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkLm1vbnRoICE9IHRoaXMuZC5wYXJzZWREYXRlLm1vbnRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzICs9IFwiIC1vdGhlci1tb250aC1cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghb3B0cy5zZWxlY3RPdGhlck1vbnRocykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gXCIgLWRpc2FibGVkLVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFvcHRzLnNob3dPdGhlck1vbnRocykgaHRtbCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ21vbnRoJzpcbiAgICAgICAgICAgICAgICAgICAgaHRtbCA9IHBhcmVudC5sb2NbcGFyZW50Lm9wdHMubW9udGhzRmllbGRdW2QubW9udGhdO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICd5ZWFyJzpcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRlY2FkZSA9IHBhcmVudC5jdXJEZWNhZGU7XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgPSBkLnllYXI7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkLnllYXIgPCBkZWNhZGVbMF0gfHwgZC55ZWFyID4gZGVjYWRlWzFdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzICs9ICcgLW90aGVyLWRlY2FkZS0nO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFvcHRzLnNlbGVjdE90aGVyWWVhcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzICs9IFwiIC1kaXNhYmxlZC1cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghb3B0cy5zaG93T3RoZXJZZWFycykgaHRtbCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob3B0cy5vblJlbmRlckNlbGwpIHtcbiAgICAgICAgICAgICAgICByZW5kZXIgPSBvcHRzLm9uUmVuZGVyQ2VsbChkYXRlLCB0eXBlKSB8fCB7fTtcbiAgICAgICAgICAgICAgICBodG1sID0gcmVuZGVyLmh0bWwgPyByZW5kZXIuaHRtbCA6IGh0bWw7XG4gICAgICAgICAgICAgICAgY2xhc3NlcyArPSByZW5kZXIuY2xhc3NlcyA/ICcgJyArIHJlbmRlci5jbGFzc2VzIDogJyc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcHRzLnJhbmdlKSB7XG4gICAgICAgICAgICAgICAgaWYgKEQuaXNTYW1lKHBhcmVudC5taW5SYW5nZSwgZGF0ZSwgdHlwZSkpIGNsYXNzZXMgKz0gJyAtcmFuZ2UtZnJvbS0nO1xuICAgICAgICAgICAgICAgIGlmIChELmlzU2FtZShwYXJlbnQubWF4UmFuZ2UsIGRhdGUsIHR5cGUpKSBjbGFzc2VzICs9ICcgLXJhbmdlLXRvLSc7XG5cbiAgICAgICAgICAgICAgICBpZiAocGFyZW50LnNlbGVjdGVkRGF0ZXMubGVuZ3RoID09IDEgJiYgcGFyZW50LmZvY3VzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgKEQuYmlnZ2VyKHBhcmVudC5taW5SYW5nZSwgZGF0ZSkgJiYgRC5sZXNzKHBhcmVudC5mb2N1c2VkLCBkYXRlKSkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIChELmxlc3MocGFyZW50Lm1heFJhbmdlLCBkYXRlKSAmJiBELmJpZ2dlcihwYXJlbnQuZm9jdXNlZCwgZGF0ZSkpKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzICs9ICcgLWluLXJhbmdlLSdcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChELmxlc3MocGFyZW50Lm1heFJhbmdlLCBkYXRlKSAmJiBELmlzU2FtZShwYXJlbnQuZm9jdXNlZCwgZGF0ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzZXMgKz0gJyAtcmFuZ2UtZnJvbS0nXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKEQuYmlnZ2VyKHBhcmVudC5taW5SYW5nZSwgZGF0ZSkgJiYgRC5pc1NhbWUocGFyZW50LmZvY3VzZWQsIGRhdGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzICs9ICcgLXJhbmdlLXRvLSdcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJlbnQuc2VsZWN0ZWREYXRlcy5sZW5ndGggPT0gMikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoRC5iaWdnZXIocGFyZW50Lm1pblJhbmdlLCBkYXRlKSAmJiBELmxlc3MocGFyZW50Lm1heFJhbmdlLCBkYXRlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NlcyArPSAnIC1pbi1yYW5nZS0nXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgaWYgKEQuaXNTYW1lKGN1cnJlbnREYXRlLCBkYXRlLCB0eXBlKSkgY2xhc3NlcyArPSAnIC1jdXJyZW50LSc7XG4gICAgICAgICAgICBpZiAocGFyZW50LmZvY3VzZWQgJiYgRC5pc1NhbWUoZGF0ZSwgcGFyZW50LmZvY3VzZWQsIHR5cGUpKSBjbGFzc2VzICs9ICcgLWZvY3VzLSc7XG4gICAgICAgICAgICBpZiAocGFyZW50Ll9pc1NlbGVjdGVkKGRhdGUsIHR5cGUpKSBjbGFzc2VzICs9ICcgLXNlbGVjdGVkLSc7XG4gICAgICAgICAgICBpZiAoIXBhcmVudC5faXNJblJhbmdlKGRhdGUsIHR5cGUpIHx8IHJlbmRlci5kaXNhYmxlZCkgY2xhc3NlcyArPSAnIC1kaXNhYmxlZC0nO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGh0bWw6IGh0bWwsXG4gICAgICAgICAgICAgICAgY2xhc3NlczogY2xhc3Nlc1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDYWxjdWxhdGVzIGRheXMgbnVtYmVyIHRvIHJlbmRlci4gR2VuZXJhdGVzIGRheXMgaHRtbCBhbmQgcmV0dXJucyBpdC5cbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGRhdGUgLSBEYXRlIG9iamVjdFxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX2dldERheXNIdG1sOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgdmFyIHRvdGFsTW9udGhEYXlzID0gRC5nZXREYXlzQ291bnQoZGF0ZSksXG4gICAgICAgICAgICAgICAgZmlyc3RNb250aERheSA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCAxKS5nZXREYXkoKSxcbiAgICAgICAgICAgICAgICBsYXN0TW9udGhEYXkgPSBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSwgdG90YWxNb250aERheXMpLmdldERheSgpLFxuICAgICAgICAgICAgICAgIGRheXNGcm9tUGV2TW9udGggPSBmaXJzdE1vbnRoRGF5IC0gdGhpcy5kLmxvYy5maXJzdERheSxcbiAgICAgICAgICAgICAgICBkYXlzRnJvbU5leHRNb250aCA9IDYgLSBsYXN0TW9udGhEYXkgKyB0aGlzLmQubG9jLmZpcnN0RGF5O1xuXG4gICAgICAgICAgICBkYXlzRnJvbVBldk1vbnRoID0gZGF5c0Zyb21QZXZNb250aCA8IDAgPyBkYXlzRnJvbVBldk1vbnRoICsgNyA6IGRheXNGcm9tUGV2TW9udGg7XG4gICAgICAgICAgICBkYXlzRnJvbU5leHRNb250aCA9IGRheXNGcm9tTmV4dE1vbnRoID4gNiA/IGRheXNGcm9tTmV4dE1vbnRoIC0gNyA6IGRheXNGcm9tTmV4dE1vbnRoO1xuXG4gICAgICAgICAgICB2YXIgc3RhcnREYXlJbmRleCA9IC1kYXlzRnJvbVBldk1vbnRoICsgMSxcbiAgICAgICAgICAgICAgICBtLCB5LFxuICAgICAgICAgICAgICAgIGh0bWwgPSAnJztcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IHN0YXJ0RGF5SW5kZXgsIG1heCA9IHRvdGFsTW9udGhEYXlzICsgZGF5c0Zyb21OZXh0TW9udGg7IGkgPD0gbWF4OyBpKyspIHtcbiAgICAgICAgICAgICAgICB5ID0gZGF0ZS5nZXRGdWxsWWVhcigpO1xuICAgICAgICAgICAgICAgIG0gPSBkYXRlLmdldE1vbnRoKCk7XG5cbiAgICAgICAgICAgICAgICBodG1sICs9IHRoaXMuX2dldERheUh0bWwobmV3IERhdGUoeSwgbSwgaSkpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBodG1sO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXREYXlIdG1sOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICB2YXIgY29udGVudCA9IHRoaXMuX2dldENlbGxDb250ZW50cyhkYXRlLCAnZGF5Jyk7XG5cbiAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cIicgKyBjb250ZW50LmNsYXNzZXMgKyAnXCIgJyArXG4gICAgICAgICAgICAgICAgJ2RhdGEtZGF0ZT1cIicgKyBkYXRlLmdldERhdGUoKSArICdcIiAnICtcbiAgICAgICAgICAgICAgICAnZGF0YS1tb250aD1cIicgKyBkYXRlLmdldE1vbnRoKCkgKyAnXCIgJyArXG4gICAgICAgICAgICAgICAgJ2RhdGEteWVhcj1cIicgKyBkYXRlLmdldEZ1bGxZZWFyKCkgKyAnXCI+JyArIGNvbnRlbnQuaHRtbCArICc8L2Rpdj4nO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZW5lcmF0ZXMgbW9udGhzIGh0bWxcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGRhdGUgLSBkYXRlIGluc3RhbmNlXG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfZ2V0TW9udGhzSHRtbDogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgICAgIHZhciBodG1sID0gJycsXG4gICAgICAgICAgICAgICAgZCA9IEQuZ2V0UGFyc2VkRGF0ZShkYXRlKSxcbiAgICAgICAgICAgICAgICBpID0gMDtcblxuICAgICAgICAgICAgd2hpbGUoaSA8IDEyKSB7XG4gICAgICAgICAgICAgICAgaHRtbCArPSB0aGlzLl9nZXRNb250aEh0bWwobmV3IERhdGUoZC55ZWFyLCBpKSk7XG4gICAgICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBodG1sO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRNb250aEh0bWw6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgICAgICB2YXIgY29udGVudCA9IHRoaXMuX2dldENlbGxDb250ZW50cyhkYXRlLCAnbW9udGgnKTtcblxuICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiJyArIGNvbnRlbnQuY2xhc3NlcyArICdcIiBkYXRhLW1vbnRoPVwiJyArIGRhdGUuZ2V0TW9udGgoKSArICdcIj4nICsgY29udGVudC5odG1sICsgJzwvZGl2PidcbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0WWVhcnNIdG1sOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgdmFyIGQgPSBELmdldFBhcnNlZERhdGUoZGF0ZSksXG4gICAgICAgICAgICAgICAgZGVjYWRlID0gRC5nZXREZWNhZGUoZGF0ZSksXG4gICAgICAgICAgICAgICAgZmlyc3RZZWFyID0gZGVjYWRlWzBdIC0gMSxcbiAgICAgICAgICAgICAgICBodG1sID0gJycsXG4gICAgICAgICAgICAgICAgaSA9IGZpcnN0WWVhcjtcblxuICAgICAgICAgICAgZm9yIChpOyBpIDw9IGRlY2FkZVsxXSArIDE7IGkrKykge1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gdGhpcy5fZ2V0WWVhckh0bWwobmV3IERhdGUoaSAsIDApKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldFllYXJIdG1sOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgdmFyIGNvbnRlbnQgPSB0aGlzLl9nZXRDZWxsQ29udGVudHMoZGF0ZSwgJ3llYXInKTtcblxuICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiJyArIGNvbnRlbnQuY2xhc3NlcyArICdcIiBkYXRhLXllYXI9XCInICsgZGF0ZS5nZXRGdWxsWWVhcigpICsgJ1wiPicgKyBjb250ZW50Lmh0bWwgKyAnPC9kaXY+J1xuICAgICAgICB9LFxuXG4gICAgICAgIF9yZW5kZXJUeXBlczoge1xuICAgICAgICAgICAgZGF5czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBkYXlOYW1lcyA9IHRoaXMuX2dldERheU5hbWVzSHRtbCh0aGlzLmQubG9jLmZpcnN0RGF5KSxcbiAgICAgICAgICAgICAgICAgICAgZGF5cyA9IHRoaXMuX2dldERheXNIdG1sKHRoaXMuZC5jdXJyZW50RGF0ZSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLiRjZWxscy5odG1sKGRheXMpO1xuICAgICAgICAgICAgICAgIHRoaXMuJG5hbWVzLmh0bWwoZGF5TmFtZXMpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbW9udGhzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGh0bWwgPSB0aGlzLl9nZXRNb250aHNIdG1sKHRoaXMuZC5jdXJyZW50RGF0ZSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLiRjZWxscy5odG1sKGh0bWwpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeWVhcnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IHRoaXMuX2dldFllYXJzSHRtbCh0aGlzLmQuY3VycmVudERhdGUpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy4kY2VsbHMuaHRtbChodG1sKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9yZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlclR5cGVzW3RoaXMudHlwZV0uYmluZCh0aGlzKSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF91cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciAkY2VsbHMgPSAkKCcuZGF0ZXBpY2tlci0tY2VsbCcsIHRoaXMuJGNlbGxzKSxcbiAgICAgICAgICAgICAgICBfdGhpcyA9IHRoaXMsXG4gICAgICAgICAgICAgICAgY2xhc3NlcyxcbiAgICAgICAgICAgICAgICAkY2VsbCxcbiAgICAgICAgICAgICAgICBkYXRlO1xuICAgICAgICAgICAgJGNlbGxzLmVhY2goZnVuY3Rpb24gKGNlbGwsIGkpIHtcbiAgICAgICAgICAgICAgICAkY2VsbCA9ICQodGhpcyk7XG4gICAgICAgICAgICAgICAgZGF0ZSA9IF90aGlzLmQuX2dldERhdGVGcm9tQ2VsbCgkKHRoaXMpKTtcbiAgICAgICAgICAgICAgICBjbGFzc2VzID0gX3RoaXMuX2dldENlbGxDb250ZW50cyhkYXRlLCBfdGhpcy5kLmNlbGxUeXBlKTtcbiAgICAgICAgICAgICAgICAkY2VsbC5hdHRyKCdjbGFzcycsY2xhc3Nlcy5jbGFzc2VzKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvdzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgdGhpcy5hY2l0dmUgPSB0cnVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhpZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gIEV2ZW50c1xuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAgICAgX2hhbmRsZUNsaWNrOiBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgIHZhciBkYXRlID0gZWwuZGF0YSgnZGF0ZScpIHx8IDEsXG4gICAgICAgICAgICAgICAgbW9udGggPSBlbC5kYXRhKCdtb250aCcpIHx8IDAsXG4gICAgICAgICAgICAgICAgeWVhciA9IGVsLmRhdGEoJ3llYXInKSB8fCB0aGlzLmQucGFyc2VkRGF0ZS55ZWFyO1xuICAgICAgICAgICAgLy8gQ2hhbmdlIHZpZXcgaWYgbWluIHZpZXcgZG9lcyBub3QgcmVhY2ggeWV0XG4gICAgICAgICAgICBpZiAodGhpcy5kLnZpZXcgIT0gdGhpcy5vcHRzLm1pblZpZXcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmQuZG93bihuZXcgRGF0ZSh5ZWFyLCBtb250aCwgZGF0ZSkpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFNlbGVjdCBkYXRlIGlmIG1pbiB2aWV3IGlzIHJlYWNoZWRcbiAgICAgICAgICAgIHZhciBzZWxlY3RlZERhdGUgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgZGF0ZSksXG4gICAgICAgICAgICAgICAgYWxyZWFkeVNlbGVjdGVkID0gdGhpcy5kLl9pc1NlbGVjdGVkKHNlbGVjdGVkRGF0ZSwgdGhpcy5kLmNlbGxUeXBlKTtcblxuICAgICAgICAgICAgaWYgKCFhbHJlYWR5U2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmQuc2VsZWN0RGF0ZShzZWxlY3RlZERhdGUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhbHJlYWR5U2VsZWN0ZWQgJiYgdGhpcy5vcHRzLnRvZ2dsZVNlbGVjdGVkKXtcbiAgICAgICAgICAgICAgICB0aGlzLmQucmVtb3ZlRGF0ZShzZWxlY3RlZERhdGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0sXG5cbiAgICAgICAgX29uQ2xpY2tDZWxsOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyICRlbCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5kYXRlcGlja2VyLS1jZWxsJyk7XG5cbiAgICAgICAgICAgIGlmICgkZWwuaGFzQ2xhc3MoJy1kaXNhYmxlZC0nKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICB0aGlzLl9oYW5kbGVDbGljay5iaW5kKHRoaXMpKCRlbCk7XG4gICAgICAgIH1cbiAgICB9O1xufSkoKTtcblxuOyhmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRlbXBsYXRlID0gJycgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLW5hdi1hY3Rpb25cIiBkYXRhLWFjdGlvbj1cInByZXZcIj4je3ByZXZIdG1sfTwvZGl2PicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImRhdGVwaWNrZXItLW5hdi10aXRsZVwiPiN7dGl0bGV9PC9kaXY+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiZGF0ZXBpY2tlci0tbmF2LWFjdGlvblwiIGRhdGEtYWN0aW9uPVwibmV4dFwiPiN7bmV4dEh0bWx9PC9kaXY+JyxcbiAgICAgICAgYnV0dG9uc0NvbnRhaW5lclRlbXBsYXRlID0gJzxkaXYgY2xhc3M9XCJkYXRlcGlja2VyLS1idXR0b25zXCI+PC9kaXY+JyxcbiAgICAgICAgYnV0dG9uID0gJzxzcGFuIGNsYXNzPVwiZGF0ZXBpY2tlci0tYnV0dG9uXCIgZGF0YS1hY3Rpb249XCIje2FjdGlvbn1cIj4je2xhYmVsfTwvc3Bhbj4nO1xuXG4gICAgRGF0ZXBpY2tlci5OYXZpZ2F0aW9uID0gZnVuY3Rpb24gKGQsIG9wdHMpIHtcbiAgICAgICAgdGhpcy5kID0gZDtcbiAgICAgICAgdGhpcy5vcHRzID0gb3B0cztcblxuICAgICAgICB0aGlzLiRidXR0b25zQ29udGFpbmVyID0gJyc7XG5cbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfTtcblxuICAgIERhdGVwaWNrZXIuTmF2aWdhdGlvbi5wcm90b3R5cGUgPSB7XG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuX2J1aWxkQmFzZUh0bWwoKTtcbiAgICAgICAgICAgIHRoaXMuX2JpbmRFdmVudHMoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfYmluZEV2ZW50czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5kLiRuYXYub24oJ2NsaWNrJywgJy5kYXRlcGlja2VyLS1uYXYtYWN0aW9uJywgJC5wcm94eSh0aGlzLl9vbkNsaWNrTmF2QnV0dG9uLCB0aGlzKSk7XG4gICAgICAgICAgICB0aGlzLmQuJG5hdi5vbignY2xpY2snLCAnLmRhdGVwaWNrZXItLW5hdi10aXRsZScsICQucHJveHkodGhpcy5fb25DbGlja05hdlRpdGxlLCB0aGlzKSk7XG4gICAgICAgICAgICB0aGlzLmQuJGRhdGVwaWNrZXIub24oJ2NsaWNrJywgJy5kYXRlcGlja2VyLS1idXR0b24nLCAkLnByb3h5KHRoaXMuX29uQ2xpY2tOYXZCdXR0b24sIHRoaXMpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfYnVpbGRCYXNlSHRtbDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyKCk7XG4gICAgICAgICAgICB0aGlzLl9hZGRCdXR0b25zSWZOZWVkKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2FkZEJ1dHRvbnNJZk5lZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMudG9kYXlCdXR0b24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRCdXR0b24oJ3RvZGF5JylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMuY2xlYXJCdXR0b24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRCdXR0b24oJ2NsZWFyJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGl0bGUgPSB0aGlzLl9nZXRUaXRsZSh0aGlzLmQuY3VycmVudERhdGUpLFxuICAgICAgICAgICAgICAgIGh0bWwgPSBEYXRlcGlja2VyLnRlbXBsYXRlKHRlbXBsYXRlLCAkLmV4dGVuZCh7dGl0bGU6IHRpdGxlfSwgdGhpcy5vcHRzKSk7XG4gICAgICAgICAgICB0aGlzLmQuJG5hdi5odG1sKGh0bWwpO1xuICAgICAgICAgICAgaWYgKHRoaXMuZC52aWV3ID09ICd5ZWFycycpIHtcbiAgICAgICAgICAgICAgICAkKCcuZGF0ZXBpY2tlci0tbmF2LXRpdGxlJywgdGhpcy5kLiRuYXYpLmFkZENsYXNzKCctZGlzYWJsZWQtJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldE5hdlN0YXR1cygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRUaXRsZTogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmQuZm9ybWF0RGF0ZSh0aGlzLm9wdHMubmF2VGl0bGVzW3RoaXMuZC52aWV3XSwgZGF0ZSlcbiAgICAgICAgfSxcblxuICAgICAgICBfYWRkQnV0dG9uOiBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLiRidXR0b25zQ29udGFpbmVyLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZEJ1dHRvbnNDb250YWluZXIoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHRoaXMuZC5sb2NbdHlwZV1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGh0bWwgPSBEYXRlcGlja2VyLnRlbXBsYXRlKGJ1dHRvbiwgZGF0YSk7XG5cbiAgICAgICAgICAgIGlmICgkKCdbZGF0YS1hY3Rpb249JyArIHR5cGUgKyAnXScsIHRoaXMuJGJ1dHRvbnNDb250YWluZXIpLmxlbmd0aCkgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy4kYnV0dG9uc0NvbnRhaW5lci5hcHBlbmQoaHRtbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2FkZEJ1dHRvbnNDb250YWluZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuZC4kZGF0ZXBpY2tlci5hcHBlbmQoYnV0dG9uc0NvbnRhaW5lclRlbXBsYXRlKTtcbiAgICAgICAgICAgIHRoaXMuJGJ1dHRvbnNDb250YWluZXIgPSAkKCcuZGF0ZXBpY2tlci0tYnV0dG9ucycsIHRoaXMuZC4kZGF0ZXBpY2tlcik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0TmF2U3RhdHVzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoISh0aGlzLm9wdHMubWluRGF0ZSB8fCB0aGlzLm9wdHMubWF4RGF0ZSkgfHwgIXRoaXMub3B0cy5kaXNhYmxlTmF2V2hlbk91dE9mUmFuZ2UpIHJldHVybjtcblxuICAgICAgICAgICAgdmFyIGRhdGUgPSB0aGlzLmQucGFyc2VkRGF0ZSxcbiAgICAgICAgICAgICAgICBtID0gZGF0ZS5tb250aCxcbiAgICAgICAgICAgICAgICB5ID0gZGF0ZS55ZWFyLFxuICAgICAgICAgICAgICAgIGQgPSBkYXRlLmRhdGU7XG5cbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy5kLnZpZXcpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdkYXlzJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmQuX2lzSW5SYW5nZShuZXcgRGF0ZSh5LCBtLTEsIGQpLCAnbW9udGgnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZU5hdigncHJldicpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmQuX2lzSW5SYW5nZShuZXcgRGF0ZSh5LCBtKzEsIGQpLCAnbW9udGgnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZU5hdignbmV4dCcpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnbW9udGhzJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmQuX2lzSW5SYW5nZShuZXcgRGF0ZSh5LTEsIG0sIGQpLCAneWVhcicpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlTmF2KCdwcmV2JylcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZC5faXNJblJhbmdlKG5ldyBEYXRlKHkrMSwgbSwgZCksICd5ZWFyJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVOYXYoJ25leHQnKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3llYXJzJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmQuX2lzSW5SYW5nZShuZXcgRGF0ZSh5LTEwLCBtLCBkKSwgJ3llYXInKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZU5hdigncHJldicpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmQuX2lzSW5SYW5nZShuZXcgRGF0ZSh5KzEwLCBtLCBkKSwgJ3llYXInKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZU5hdignbmV4dCcpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2Rpc2FibGVOYXY6IGZ1bmN0aW9uIChuYXYpIHtcbiAgICAgICAgICAgICQoJ1tkYXRhLWFjdGlvbj1cIicgKyBuYXYgKyAnXCJdJywgdGhpcy5kLiRuYXYpLmFkZENsYXNzKCctZGlzYWJsZWQtJylcbiAgICAgICAgfSxcblxuICAgICAgICBfYWN0aXZhdGVOYXY6IGZ1bmN0aW9uIChuYXYpIHtcbiAgICAgICAgICAgICQoJ1tkYXRhLWFjdGlvbj1cIicgKyBuYXYgKyAnXCJdJywgdGhpcy5kLiRuYXYpLnJlbW92ZUNsYXNzKCctZGlzYWJsZWQtJylcbiAgICAgICAgfSxcblxuICAgICAgICBfb25DbGlja05hdkJ1dHRvbjogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciAkZWwgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCdbZGF0YS1hY3Rpb25dJyksXG4gICAgICAgICAgICAgICAgYWN0aW9uID0gJGVsLmRhdGEoJ2FjdGlvbicpO1xuXG4gICAgICAgICAgICB0aGlzLmRbYWN0aW9uXSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9vbkNsaWNrTmF2VGl0bGU6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBpZiAoJChlLnRhcmdldCkuaGFzQ2xhc3MoJy1kaXNhYmxlZC0nKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5kLnZpZXcgPT0gJ2RheXMnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZC52aWV3ID0gJ21vbnRocydcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5kLnZpZXcgPSAneWVhcnMnO1xuICAgICAgICB9XG4gICAgfVxuXG59KSgpO1xuIiwiIWZ1bmN0aW9uKGEsYil7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXCJqcXVlcnlcIl0sYik6XCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9YihyZXF1aXJlKFwianF1ZXJ5XCIpKTpiKGEualF1ZXJ5KX0odGhpcyxmdW5jdGlvbihhKXtcImZ1bmN0aW9uXCIhPXR5cGVvZiBPYmplY3QuY3JlYXRlJiYoT2JqZWN0LmNyZWF0ZT1mdW5jdGlvbihhKXtmdW5jdGlvbiBiKCl7fXJldHVybiBiLnByb3RvdHlwZT1hLG5ldyBifSk7dmFyIGI9e2luaXQ6ZnVuY3Rpb24oYil7cmV0dXJuIHRoaXMub3B0aW9ucz1hLmV4dGVuZCh7fSxhLm5vdHkuZGVmYXVsdHMsYiksdGhpcy5vcHRpb25zLmxheW91dD10aGlzLm9wdGlvbnMuY3VzdG9tP2Eubm90eS5sYXlvdXRzLmlubGluZTphLm5vdHkubGF5b3V0c1t0aGlzLm9wdGlvbnMubGF5b3V0XSxhLm5vdHkudGhlbWVzW3RoaXMub3B0aW9ucy50aGVtZV0/dGhpcy5vcHRpb25zLnRoZW1lPWEubm90eS50aGVtZXNbdGhpcy5vcHRpb25zLnRoZW1lXTp0aGlzLm9wdGlvbnMudGhlbWVDbGFzc05hbWU9dGhpcy5vcHRpb25zLnRoZW1lLHRoaXMub3B0aW9ucz1hLmV4dGVuZCh7fSx0aGlzLm9wdGlvbnMsdGhpcy5vcHRpb25zLmxheW91dC5vcHRpb25zKSx0aGlzLm9wdGlvbnMuaWQ9XCJub3R5X1wiKyhuZXcgRGF0ZSkuZ2V0VGltZSgpKk1hdGguZmxvb3IoMWU2Kk1hdGgucmFuZG9tKCkpLHRoaXMuX2J1aWxkKCksdGhpc30sX2J1aWxkOmZ1bmN0aW9uKCl7dmFyIGI9YSgnPGRpdiBjbGFzcz1cIm5vdHlfYmFyIG5vdHlfdHlwZV8nK3RoaXMub3B0aW9ucy50eXBlKydcIj48L2Rpdj4nKS5hdHRyKFwiaWRcIix0aGlzLm9wdGlvbnMuaWQpO2lmKGIuYXBwZW5kKHRoaXMub3B0aW9ucy50ZW1wbGF0ZSkuZmluZChcIi5ub3R5X3RleHRcIikuaHRtbCh0aGlzLm9wdGlvbnMudGV4dCksdGhpcy4kYmFyPW51bGwhPT10aGlzLm9wdGlvbnMubGF5b3V0LnBhcmVudC5vYmplY3Q/YSh0aGlzLm9wdGlvbnMubGF5b3V0LnBhcmVudC5vYmplY3QpLmNzcyh0aGlzLm9wdGlvbnMubGF5b3V0LnBhcmVudC5jc3MpLmFwcGVuZChiKTpiLHRoaXMub3B0aW9ucy50aGVtZUNsYXNzTmFtZSYmdGhpcy4kYmFyLmFkZENsYXNzKHRoaXMub3B0aW9ucy50aGVtZUNsYXNzTmFtZSkuYWRkQ2xhc3MoXCJub3R5X2NvbnRhaW5lcl90eXBlX1wiK3RoaXMub3B0aW9ucy50eXBlKSx0aGlzLm9wdGlvbnMuYnV0dG9ucyl7dGhpcy5vcHRpb25zLmNsb3NlV2l0aD1bXSx0aGlzLm9wdGlvbnMudGltZW91dD0hMTt2YXIgYz1hKFwiPGRpdi8+XCIpLmFkZENsYXNzKFwibm90eV9idXR0b25zXCIpO251bGwhPT10aGlzLm9wdGlvbnMubGF5b3V0LnBhcmVudC5vYmplY3Q/dGhpcy4kYmFyLmZpbmQoXCIubm90eV9iYXJcIikuYXBwZW5kKGMpOnRoaXMuJGJhci5hcHBlbmQoYyk7dmFyIGQ9dGhpczthLmVhY2godGhpcy5vcHRpb25zLmJ1dHRvbnMsZnVuY3Rpb24oYixjKXt2YXIgZT1hKFwiPGJ1dHRvbi8+XCIpLmFkZENsYXNzKGMuYWRkQ2xhc3M/Yy5hZGRDbGFzczpcImdyYXlcIikuaHRtbChjLnRleHQpLmF0dHIoXCJpZFwiLGMuaWQ/Yy5pZDpcImJ1dHRvbi1cIitiKS5hdHRyKFwidGl0bGVcIixjLnRpdGxlKS5hcHBlbmRUbyhkLiRiYXIuZmluZChcIi5ub3R5X2J1dHRvbnNcIikpLm9uKFwiY2xpY2tcIixmdW5jdGlvbihiKXthLmlzRnVuY3Rpb24oYy5vbkNsaWNrKSYmYy5vbkNsaWNrLmNhbGwoZSxkLGIpfSl9KX10aGlzLiRtZXNzYWdlPXRoaXMuJGJhci5maW5kKFwiLm5vdHlfbWVzc2FnZVwiKSx0aGlzLiRjbG9zZUJ1dHRvbj10aGlzLiRiYXIuZmluZChcIi5ub3R5X2Nsb3NlXCIpLHRoaXMuJGJ1dHRvbnM9dGhpcy4kYmFyLmZpbmQoXCIubm90eV9idXR0b25zXCIpLGEubm90eS5zdG9yZVt0aGlzLm9wdGlvbnMuaWRdPXRoaXN9LHNob3c6ZnVuY3Rpb24oKXt2YXIgYj10aGlzO3JldHVybiBiLm9wdGlvbnMuY3VzdG9tP2Iub3B0aW9ucy5jdXN0b20uZmluZChiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikuYXBwZW5kKGIuJGJhcik6YShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikuYXBwZW5kKGIuJGJhciksYi5vcHRpb25zLnRoZW1lJiZiLm9wdGlvbnMudGhlbWUuc3R5bGUmJmIub3B0aW9ucy50aGVtZS5zdHlsZS5hcHBseShiKSxcImZ1bmN0aW9uXCI9PT1hLnR5cGUoYi5vcHRpb25zLmxheW91dC5jc3MpP3RoaXMub3B0aW9ucy5sYXlvdXQuY3NzLmFwcGx5KGIuJGJhcik6Yi4kYmFyLmNzcyh0aGlzLm9wdGlvbnMubGF5b3V0LmNzc3x8e30pLGIuJGJhci5hZGRDbGFzcyhiLm9wdGlvbnMubGF5b3V0LmFkZENsYXNzKSxiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zdHlsZS5hcHBseShhKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKSxbYi5vcHRpb25zLndpdGhpbl0pLGIuc2hvd2luZz0hMCxiLm9wdGlvbnMudGhlbWUmJmIub3B0aW9ucy50aGVtZS5zdHlsZSYmYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrLm9uU2hvdy5hcHBseSh0aGlzKSxhLmluQXJyYXkoXCJjbGlja1wiLGIub3B0aW9ucy5jbG9zZVdpdGgpPi0xJiZiLiRiYXIuY3NzKFwiY3Vyc29yXCIsXCJwb2ludGVyXCIpLm9uZShcImNsaWNrXCIsZnVuY3Rpb24oYSl7Yi5zdG9wUHJvcGFnYXRpb24oYSksYi5vcHRpb25zLmNhbGxiYWNrLm9uQ2xvc2VDbGljayYmYi5vcHRpb25zLmNhbGxiYWNrLm9uQ2xvc2VDbGljay5hcHBseShiKSxiLmNsb3NlKCl9KSxhLmluQXJyYXkoXCJob3ZlclwiLGIub3B0aW9ucy5jbG9zZVdpdGgpPi0xJiZiLiRiYXIub25lKFwibW91c2VlbnRlclwiLGZ1bmN0aW9uKCl7Yi5jbG9zZSgpfSksYS5pbkFycmF5KFwiYnV0dG9uXCIsYi5vcHRpb25zLmNsb3NlV2l0aCk+LTEmJmIuJGNsb3NlQnV0dG9uLm9uZShcImNsaWNrXCIsZnVuY3Rpb24oYSl7Yi5zdG9wUHJvcGFnYXRpb24oYSksYi5jbG9zZSgpfSksLTE9PWEuaW5BcnJheShcImJ1dHRvblwiLGIub3B0aW9ucy5jbG9zZVdpdGgpJiZiLiRjbG9zZUJ1dHRvbi5yZW1vdmUoKSxiLm9wdGlvbnMuY2FsbGJhY2sub25TaG93JiZiLm9wdGlvbnMuY2FsbGJhY2sub25TaG93LmFwcGx5KGIpLFwic3RyaW5nXCI9PXR5cGVvZiBiLm9wdGlvbnMuYW5pbWF0aW9uLm9wZW4/KGIuJGJhci5jc3MoXCJoZWlnaHRcIixiLiRiYXIuaW5uZXJIZWlnaHQoKSksYi4kYmFyLm9uKFwiY2xpY2tcIixmdW5jdGlvbihhKXtiLndhc0NsaWNrZWQ9ITB9KSxiLiRiYXIuc2hvdygpLmFkZENsYXNzKGIub3B0aW9ucy5hbmltYXRpb24ub3Blbikub25lKFwid2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZFwiLGZ1bmN0aW9uKCl7Yi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyU2hvdyYmYi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyU2hvdy5hcHBseShiKSxiLnNob3dpbmc9ITEsYi5zaG93bj0hMCxiLmhhc093blByb3BlcnR5KFwid2FzQ2xpY2tlZFwiKSYmKGIuJGJhci5vZmYoXCJjbGlja1wiLGZ1bmN0aW9uKGEpe2Iud2FzQ2xpY2tlZD0hMH0pLGIuY2xvc2UoKSl9KSk6Yi4kYmFyLmFuaW1hdGUoYi5vcHRpb25zLmFuaW1hdGlvbi5vcGVuLGIub3B0aW9ucy5hbmltYXRpb24uc3BlZWQsYi5vcHRpb25zLmFuaW1hdGlvbi5lYXNpbmcsZnVuY3Rpb24oKXtiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJTaG93JiZiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJTaG93LmFwcGx5KGIpLGIuc2hvd2luZz0hMSxiLnNob3duPSEwfSksYi5vcHRpb25zLnRpbWVvdXQmJmIuJGJhci5kZWxheShiLm9wdGlvbnMudGltZW91dCkucHJvbWlzZSgpLmRvbmUoZnVuY3Rpb24oKXtiLmNsb3NlKCl9KSx0aGlzfSxjbG9zZTpmdW5jdGlvbigpe2lmKCEodGhpcy5jbG9zZWR8fHRoaXMuJGJhciYmdGhpcy4kYmFyLmhhc0NsYXNzKFwiaS1hbS1jbG9zaW5nLW5vd1wiKSkpe3ZhciBiPXRoaXM7aWYodGhpcy5zaG93aW5nKXJldHVybiB2b2lkIGIuJGJhci5xdWV1ZShmdW5jdGlvbigpe2IuY2xvc2UuYXBwbHkoYil9KTtpZighdGhpcy5zaG93biYmIXRoaXMuc2hvd2luZyl7dmFyIGM9W107cmV0dXJuIGEuZWFjaChhLm5vdHkucXVldWUsZnVuY3Rpb24oYSxkKXtkLm9wdGlvbnMuaWQhPWIub3B0aW9ucy5pZCYmYy5wdXNoKGQpfSksdm9pZChhLm5vdHkucXVldWU9Yyl9Yi4kYmFyLmFkZENsYXNzKFwiaS1hbS1jbG9zaW5nLW5vd1wiKSxiLm9wdGlvbnMuY2FsbGJhY2sub25DbG9zZSYmYi5vcHRpb25zLmNhbGxiYWNrLm9uQ2xvc2UuYXBwbHkoYiksXCJzdHJpbmdcIj09dHlwZW9mIGIub3B0aW9ucy5hbmltYXRpb24uY2xvc2U/Yi4kYmFyLmFkZENsYXNzKGIub3B0aW9ucy5hbmltYXRpb24uY2xvc2UpLm9uZShcIndlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmRcIixmdW5jdGlvbigpe2Iub3B0aW9ucy5jYWxsYmFjay5hZnRlckNsb3NlJiZiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJDbG9zZS5hcHBseShiKSxiLmNsb3NlQ2xlYW5VcCgpfSk6Yi4kYmFyLmNsZWFyUXVldWUoKS5zdG9wKCkuYW5pbWF0ZShiLm9wdGlvbnMuYW5pbWF0aW9uLmNsb3NlLGIub3B0aW9ucy5hbmltYXRpb24uc3BlZWQsYi5vcHRpb25zLmFuaW1hdGlvbi5lYXNpbmcsZnVuY3Rpb24oKXtiLm9wdGlvbnMuY2FsbGJhY2suYWZ0ZXJDbG9zZSYmYi5vcHRpb25zLmNhbGxiYWNrLmFmdGVyQ2xvc2UuYXBwbHkoYil9KS5wcm9taXNlKCkuZG9uZShmdW5jdGlvbigpe2IuY2xvc2VDbGVhblVwKCl9KX19LGNsb3NlQ2xlYW5VcDpmdW5jdGlvbigpe3ZhciBiPXRoaXM7Yi5vcHRpb25zLm1vZGFsJiYoYS5ub3R5UmVuZGVyZXIuc2V0TW9kYWxDb3VudCgtMSksMD09YS5ub3R5UmVuZGVyZXIuZ2V0TW9kYWxDb3VudCgpJiZhKFwiLm5vdHlfbW9kYWxcIikuZmFkZU91dChiLm9wdGlvbnMuYW5pbWF0aW9uLmZhZGVTcGVlZCxmdW5jdGlvbigpe2EodGhpcykucmVtb3ZlKCl9KSksYS5ub3R5UmVuZGVyZXIuc2V0TGF5b3V0Q291bnRGb3IoYiwtMSksMD09YS5ub3R5UmVuZGVyZXIuZ2V0TGF5b3V0Q291bnRGb3IoYikmJmEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IpLnJlbW92ZSgpLFwidW5kZWZpbmVkXCIhPXR5cGVvZiBiLiRiYXImJm51bGwhPT1iLiRiYXImJihcInN0cmluZ1wiPT10eXBlb2YgYi5vcHRpb25zLmFuaW1hdGlvbi5jbG9zZT8oYi4kYmFyLmNzcyhcInRyYW5zaXRpb25cIixcImFsbCAxMDBtcyBlYXNlXCIpLmNzcyhcImJvcmRlclwiLDApLmNzcyhcIm1hcmdpblwiLDApLmhlaWdodCgwKSxiLiRiYXIub25lKFwidHJhbnNpdGlvbmVuZCB3ZWJraXRUcmFuc2l0aW9uRW5kIG9UcmFuc2l0aW9uRW5kIE1TVHJhbnNpdGlvbkVuZFwiLGZ1bmN0aW9uKCl7Yi4kYmFyLnJlbW92ZSgpLGIuJGJhcj1udWxsLGIuY2xvc2VkPSEwLGIub3B0aW9ucy50aGVtZS5jYWxsYmFjayYmYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrLm9uQ2xvc2UmJmIub3B0aW9ucy50aGVtZS5jYWxsYmFjay5vbkNsb3NlLmFwcGx5KGIpfSkpOihiLiRiYXIucmVtb3ZlKCksYi4kYmFyPW51bGwsYi5jbG9zZWQ9ITApKSxkZWxldGUgYS5ub3R5LnN0b3JlW2Iub3B0aW9ucy5pZF0sYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrJiZiLm9wdGlvbnMudGhlbWUuY2FsbGJhY2sub25DbG9zZSYmYi5vcHRpb25zLnRoZW1lLmNhbGxiYWNrLm9uQ2xvc2UuYXBwbHkoYiksYi5vcHRpb25zLmRpc21pc3NRdWV1ZXx8KGEubm90eS5vbnRhcD0hMCxhLm5vdHlSZW5kZXJlci5yZW5kZXIoKSksYi5vcHRpb25zLm1heFZpc2libGU+MCYmYi5vcHRpb25zLmRpc21pc3NRdWV1ZSYmYS5ub3R5UmVuZGVyZXIucmVuZGVyKCl9LHNldFRleHQ6ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuY2xvc2VkfHwodGhpcy5vcHRpb25zLnRleHQ9YSx0aGlzLiRiYXIuZmluZChcIi5ub3R5X3RleHRcIikuaHRtbChhKSksdGhpc30sc2V0VHlwZTpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5jbG9zZWR8fCh0aGlzLm9wdGlvbnMudHlwZT1hLHRoaXMub3B0aW9ucy50aGVtZS5zdHlsZS5hcHBseSh0aGlzKSx0aGlzLm9wdGlvbnMudGhlbWUuY2FsbGJhY2sub25TaG93LmFwcGx5KHRoaXMpKSx0aGlzfSxzZXRUaW1lb3V0OmZ1bmN0aW9uKGEpe2lmKCF0aGlzLmNsb3NlZCl7dmFyIGI9dGhpczt0aGlzLm9wdGlvbnMudGltZW91dD1hLGIuJGJhci5kZWxheShiLm9wdGlvbnMudGltZW91dCkucHJvbWlzZSgpLmRvbmUoZnVuY3Rpb24oKXtiLmNsb3NlKCl9KX1yZXR1cm4gdGhpc30sc3RvcFByb3BhZ2F0aW9uOmZ1bmN0aW9uKGEpe2E9YXx8d2luZG93LmV2ZW50LFwidW5kZWZpbmVkXCIhPXR5cGVvZiBhLnN0b3BQcm9wYWdhdGlvbj9hLnN0b3BQcm9wYWdhdGlvbigpOmEuY2FuY2VsQnViYmxlPSEwfSxjbG9zZWQ6ITEsc2hvd2luZzohMSxzaG93bjohMX07YS5ub3R5UmVuZGVyZXI9e30sYS5ub3R5UmVuZGVyZXIuaW5pdD1mdW5jdGlvbihjKXt2YXIgZD1PYmplY3QuY3JlYXRlKGIpLmluaXQoYyk7cmV0dXJuIGQub3B0aW9ucy5raWxsZXImJmEubm90eS5jbG9zZUFsbCgpLGQub3B0aW9ucy5mb3JjZT9hLm5vdHkucXVldWUudW5zaGlmdChkKTphLm5vdHkucXVldWUucHVzaChkKSxhLm5vdHlSZW5kZXJlci5yZW5kZXIoKSxcIm9iamVjdFwiPT1hLm5vdHkucmV0dXJucz9kOmQub3B0aW9ucy5pZH0sYS5ub3R5UmVuZGVyZXIucmVuZGVyPWZ1bmN0aW9uKCl7dmFyIGI9YS5ub3R5LnF1ZXVlWzBdO1wib2JqZWN0XCI9PT1hLnR5cGUoYik/Yi5vcHRpb25zLmRpc21pc3NRdWV1ZT9iLm9wdGlvbnMubWF4VmlzaWJsZT4wP2EoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IrXCIgPiBsaVwiKS5sZW5ndGg8Yi5vcHRpb25zLm1heFZpc2libGUmJmEubm90eVJlbmRlcmVyLnNob3coYS5ub3R5LnF1ZXVlLnNoaWZ0KCkpOmEubm90eVJlbmRlcmVyLnNob3coYS5ub3R5LnF1ZXVlLnNoaWZ0KCkpOmEubm90eS5vbnRhcCYmKGEubm90eVJlbmRlcmVyLnNob3coYS5ub3R5LnF1ZXVlLnNoaWZ0KCkpLGEubm90eS5vbnRhcD0hMSk6YS5ub3R5Lm9udGFwPSEwfSxhLm5vdHlSZW5kZXJlci5zaG93PWZ1bmN0aW9uKGIpe2Iub3B0aW9ucy5tb2RhbCYmKGEubm90eVJlbmRlcmVyLmNyZWF0ZU1vZGFsRm9yKGIpLGEubm90eVJlbmRlcmVyLnNldE1vZGFsQ291bnQoMSkpLGIub3B0aW9ucy5jdXN0b20/MD09Yi5vcHRpb25zLmN1c3RvbS5maW5kKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5sZW5ndGg/Yi5vcHRpb25zLmN1c3RvbS5hcHBlbmQoYShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5vYmplY3QpLmFkZENsYXNzKFwiaS1hbS1uZXdcIikpOmIub3B0aW9ucy5jdXN0b20uZmluZChiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikucmVtb3ZlQ2xhc3MoXCJpLWFtLW5ld1wiKTowPT1hKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5sZW5ndGg/YShcImJvZHlcIikuYXBwZW5kKGEoYi5vcHRpb25zLmxheW91dC5jb250YWluZXIub2JqZWN0KS5hZGRDbGFzcyhcImktYW0tbmV3XCIpKTphKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5yZW1vdmVDbGFzcyhcImktYW0tbmV3XCIpLGEubm90eVJlbmRlcmVyLnNldExheW91dENvdW50Rm9yKGIsMSksYi5zaG93KCl9LGEubm90eVJlbmRlcmVyLmNyZWF0ZU1vZGFsRm9yPWZ1bmN0aW9uKGIpe2lmKDA9PWEoXCIubm90eV9tb2RhbFwiKS5sZW5ndGgpe3ZhciBjPWEoXCI8ZGl2Lz5cIikuYWRkQ2xhc3MoXCJub3R5X21vZGFsXCIpLmFkZENsYXNzKGIub3B0aW9ucy50aGVtZSkuZGF0YShcIm5vdHlfbW9kYWxfY291bnRcIiwwKTtiLm9wdGlvbnMudGhlbWUubW9kYWwmJmIub3B0aW9ucy50aGVtZS5tb2RhbC5jc3MmJmMuY3NzKGIub3B0aW9ucy50aGVtZS5tb2RhbC5jc3MpLGMucHJlcGVuZFRvKGEoXCJib2R5XCIpKS5mYWRlSW4oYi5vcHRpb25zLmFuaW1hdGlvbi5mYWRlU3BlZWQpLGEuaW5BcnJheShcImJhY2tkcm9wXCIsYi5vcHRpb25zLmNsb3NlV2l0aCk+LTEmJmMub24oXCJjbGlja1wiLGZ1bmN0aW9uKGIpe2Eubm90eS5jbG9zZUFsbCgpfSl9fSxhLm5vdHlSZW5kZXJlci5nZXRMYXlvdXRDb3VudEZvcj1mdW5jdGlvbihiKXtyZXR1cm4gYShiLm9wdGlvbnMubGF5b3V0LmNvbnRhaW5lci5zZWxlY3RvcikuZGF0YShcIm5vdHlfbGF5b3V0X2NvdW50XCIpfHwwfSxhLm5vdHlSZW5kZXJlci5zZXRMYXlvdXRDb3VudEZvcj1mdW5jdGlvbihiLGMpe3JldHVybiBhKGIub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yKS5kYXRhKFwibm90eV9sYXlvdXRfY291bnRcIixhLm5vdHlSZW5kZXJlci5nZXRMYXlvdXRDb3VudEZvcihiKStjKX0sYS5ub3R5UmVuZGVyZXIuZ2V0TW9kYWxDb3VudD1mdW5jdGlvbigpe3JldHVybiBhKFwiLm5vdHlfbW9kYWxcIikuZGF0YShcIm5vdHlfbW9kYWxfY291bnRcIil8fDB9LGEubm90eVJlbmRlcmVyLnNldE1vZGFsQ291bnQ9ZnVuY3Rpb24oYil7cmV0dXJuIGEoXCIubm90eV9tb2RhbFwiKS5kYXRhKFwibm90eV9tb2RhbF9jb3VudFwiLGEubm90eVJlbmRlcmVyLmdldE1vZGFsQ291bnQoKStiKX0sYS5mbi5ub3R5PWZ1bmN0aW9uKGIpe3JldHVybiBiLmN1c3RvbT1hKHRoaXMpLGEubm90eVJlbmRlcmVyLmluaXQoYil9LGEubm90eT17fSxhLm5vdHkucXVldWU9W10sYS5ub3R5Lm9udGFwPSEwLGEubm90eS5sYXlvdXRzPXt9LGEubm90eS50aGVtZXM9e30sYS5ub3R5LnJldHVybnM9XCJvYmplY3RcIixhLm5vdHkuc3RvcmU9e30sYS5ub3R5LmdldD1mdW5jdGlvbihiKXtyZXR1cm4gYS5ub3R5LnN0b3JlLmhhc093blByb3BlcnR5KGIpP2Eubm90eS5zdG9yZVtiXTohMX0sYS5ub3R5LmNsb3NlPWZ1bmN0aW9uKGIpe3JldHVybiBhLm5vdHkuZ2V0KGIpP2Eubm90eS5nZXQoYikuY2xvc2UoKTohMX0sYS5ub3R5LnNldFRleHQ9ZnVuY3Rpb24oYixjKXtyZXR1cm4gYS5ub3R5LmdldChiKT9hLm5vdHkuZ2V0KGIpLnNldFRleHQoYyk6ITF9LGEubm90eS5zZXRUeXBlPWZ1bmN0aW9uKGIsYyl7cmV0dXJuIGEubm90eS5nZXQoYik/YS5ub3R5LmdldChiKS5zZXRUeXBlKGMpOiExfSxhLm5vdHkuY2xlYXJRdWV1ZT1mdW5jdGlvbigpe2Eubm90eS5xdWV1ZT1bXX0sYS5ub3R5LmNsb3NlQWxsPWZ1bmN0aW9uKCl7YS5ub3R5LmNsZWFyUXVldWUoKSxhLmVhY2goYS5ub3R5LnN0b3JlLGZ1bmN0aW9uKGEsYil7Yi5jbG9zZSgpfSl9O3ZhciBjPXdpbmRvdy5hbGVydDtyZXR1cm4gYS5ub3R5LmNvbnN1bWVBbGVydD1mdW5jdGlvbihiKXt3aW5kb3cuYWxlcnQ9ZnVuY3Rpb24oYyl7Yj9iLnRleHQ9YzpiPXt0ZXh0OmN9LGEubm90eVJlbmRlcmVyLmluaXQoYil9fSxhLm5vdHkuc3RvcENvbnN1bWVBbGVydD1mdW5jdGlvbigpe3dpbmRvdy5hbGVydD1jfSxhLm5vdHkuZGVmYXVsdHM9e2xheW91dDpcInRvcFwiLHRoZW1lOlwiZGVmYXVsdFRoZW1lXCIsdHlwZTpcImFsZXJ0XCIsdGV4dDpcIlwiLGRpc21pc3NRdWV1ZTohMCx0ZW1wbGF0ZTonPGRpdiBjbGFzcz1cIm5vdHlfbWVzc2FnZVwiPjxzcGFuIGNsYXNzPVwibm90eV90ZXh0XCI+PC9zcGFuPjxkaXYgY2xhc3M9XCJub3R5X2Nsb3NlXCI+PC9kaXY+PC9kaXY+JyxhbmltYXRpb246e29wZW46e2hlaWdodDpcInRvZ2dsZVwifSxjbG9zZTp7aGVpZ2h0OlwidG9nZ2xlXCJ9LGVhc2luZzpcInN3aW5nXCIsc3BlZWQ6NTAwLGZhZGVTcGVlZDpcImZhc3RcIn0sdGltZW91dDohMSxmb3JjZTohMSxtb2RhbDohMSxtYXhWaXNpYmxlOjUsa2lsbGVyOiExLGNsb3NlV2l0aDpbXCJjbGlja1wiXSxjYWxsYmFjazp7b25TaG93OmZ1bmN0aW9uKCl7fSxhZnRlclNob3c6ZnVuY3Rpb24oKXt9LG9uQ2xvc2U6ZnVuY3Rpb24oKXt9LGFmdGVyQ2xvc2U6ZnVuY3Rpb24oKXt9LG9uQ2xvc2VDbGljazpmdW5jdGlvbigpe319LGJ1dHRvbnM6ITF9LGEod2luZG93KS5vbihcInJlc2l6ZVwiLGZ1bmN0aW9uKCl7YS5lYWNoKGEubm90eS5sYXlvdXRzLGZ1bmN0aW9uKGIsYyl7Yy5jb250YWluZXIuc3R5bGUuYXBwbHkoYShjLmNvbnRhaW5lci5zZWxlY3RvcikpfSl9KSx3aW5kb3cubm90eT1mdW5jdGlvbihiKXtyZXR1cm4gYS5ub3R5UmVuZGVyZXIuaW5pdChiKX0sYS5ub3R5LmxheW91dHMuYm90dG9tPXtuYW1lOlwiYm90dG9tXCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9ib3R0b21fbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfYm90dG9tX2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtib3R0b206MCxsZWZ0OlwiNSVcIixwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCI5MCVcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4Ojk5OTk5OTl9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5ib3R0b21DZW50ZXI9e25hbWU6XCJib3R0b21DZW50ZXJcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2JvdHRvbUNlbnRlcl9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9ib3R0b21DZW50ZXJfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe2JvdHRvbToyMCxsZWZ0OjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLGEodGhpcykuY3NzKHtsZWZ0OihhKHdpbmRvdykud2lkdGgoKS1hKHRoaXMpLm91dGVyV2lkdGgoITEpKS8yK1wicHhcIn0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy5ib3R0b21MZWZ0PXtuYW1lOlwiYm90dG9tTGVmdFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfYm90dG9tTGVmdF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV9ib3R0b21MZWZ0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtib3R0b206MjAsbGVmdDoyMCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSksd2luZG93LmlubmVyV2lkdGg8NjAwJiZhKHRoaXMpLmNzcyh7bGVmdDo1fSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLmJvdHRvbVJpZ2h0PXtuYW1lOlwiYm90dG9tUmlnaHRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2JvdHRvbVJpZ2h0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X2JvdHRvbVJpZ2h0X2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtib3R0b206MjAscmlnaHQ6MjAscG9zaXRpb246XCJmaXhlZFwiLHdpZHRoOlwiMzEwcHhcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4OjFlN30pLHdpbmRvdy5pbm5lcldpZHRoPDYwMCYmYSh0aGlzKS5jc3Moe3JpZ2h0OjV9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuY2VudGVyPXtuYW1lOlwiY2VudGVyXCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV9jZW50ZXJfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfY2VudGVyX2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHtwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSk7dmFyIGI9YSh0aGlzKS5jbG9uZSgpLmNzcyh7dmlzaWJpbGl0eTpcImhpZGRlblwiLGRpc3BsYXk6XCJibG9ja1wiLHBvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6MCxsZWZ0OjB9KS5hdHRyKFwiaWRcIixcImR1cGVcIik7YShcImJvZHlcIikuYXBwZW5kKGIpLGIuZmluZChcIi5pLWFtLWNsb3Npbmctbm93XCIpLnJlbW92ZSgpLGIuZmluZChcImxpXCIpLmNzcyhcImRpc3BsYXlcIixcImJsb2NrXCIpO3ZhciBjPWIuaGVpZ2h0KCk7Yi5yZW1vdmUoKSxhKHRoaXMpLmhhc0NsYXNzKFwiaS1hbS1uZXdcIik/YSh0aGlzKS5jc3Moe2xlZnQ6KGEod2luZG93KS53aWR0aCgpLWEodGhpcykub3V0ZXJXaWR0aCghMSkpLzIrXCJweFwiLHRvcDooYSh3aW5kb3cpLmhlaWdodCgpLWMpLzIrXCJweFwifSk6YSh0aGlzKS5hbmltYXRlKHtsZWZ0OihhKHdpbmRvdykud2lkdGgoKS1hKHRoaXMpLm91dGVyV2lkdGgoITEpKS8yK1wicHhcIix0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0sNTAwKX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuY2VudGVyTGVmdD17bmFtZTpcImNlbnRlckxlZnRcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X2NlbnRlckxlZnRfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfY2VudGVyTGVmdF9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7bGVmdDoyMCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSk7dmFyIGI9YSh0aGlzKS5jbG9uZSgpLmNzcyh7dmlzaWJpbGl0eTpcImhpZGRlblwiLGRpc3BsYXk6XCJibG9ja1wiLHBvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6MCxsZWZ0OjB9KS5hdHRyKFwiaWRcIixcImR1cGVcIik7YShcImJvZHlcIikuYXBwZW5kKGIpLGIuZmluZChcIi5pLWFtLWNsb3Npbmctbm93XCIpLnJlbW92ZSgpLGIuZmluZChcImxpXCIpLmNzcyhcImRpc3BsYXlcIixcImJsb2NrXCIpO3ZhciBjPWIuaGVpZ2h0KCk7Yi5yZW1vdmUoKSxhKHRoaXMpLmhhc0NsYXNzKFwiaS1hbS1uZXdcIik/YSh0aGlzKS5jc3Moe3RvcDooYSh3aW5kb3cpLmhlaWdodCgpLWMpLzIrXCJweFwifSk6YSh0aGlzKS5hbmltYXRlKHt0b3A6KGEod2luZG93KS5oZWlnaHQoKS1jKS8yK1wicHhcIn0sNTAwKSx3aW5kb3cuaW5uZXJXaWR0aDw2MDAmJmEodGhpcykuY3NzKHtsZWZ0OjV9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuY2VudGVyUmlnaHQ9e25hbWU6XCJjZW50ZXJSaWdodFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfY2VudGVyUmlnaHRfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfY2VudGVyUmlnaHRfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3JpZ2h0OjIwLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KTt2YXIgYj1hKHRoaXMpLmNsb25lKCkuY3NzKHt2aXNpYmlsaXR5OlwiaGlkZGVuXCIsZGlzcGxheTpcImJsb2NrXCIscG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDowLGxlZnQ6MH0pLmF0dHIoXCJpZFwiLFwiZHVwZVwiKTthKFwiYm9keVwiKS5hcHBlbmQoYiksYi5maW5kKFwiLmktYW0tY2xvc2luZy1ub3dcIikucmVtb3ZlKCksYi5maW5kKFwibGlcIikuY3NzKFwiZGlzcGxheVwiLFwiYmxvY2tcIik7dmFyIGM9Yi5oZWlnaHQoKTtiLnJlbW92ZSgpLGEodGhpcykuaGFzQ2xhc3MoXCJpLWFtLW5ld1wiKT9hKHRoaXMpLmNzcyh7dG9wOihhKHdpbmRvdykuaGVpZ2h0KCktYykvMitcInB4XCJ9KTphKHRoaXMpLmFuaW1hdGUoe3RvcDooYSh3aW5kb3cpLmhlaWdodCgpLWMpLzIrXCJweFwifSw1MDApLHdpbmRvdy5pbm5lcldpZHRoPDYwMCYmYSh0aGlzKS5jc3Moe3JpZ2h0OjV9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMuaW5saW5lPXtuYW1lOlwiaW5saW5lXCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGNsYXNzPVwibm90eV9pbmxpbmVfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsLm5vdHlfaW5saW5lX2xheW91dF9jb250YWluZXJcIixzdHlsZTpmdW5jdGlvbigpe2EodGhpcykuY3NzKHt3aWR0aDpcIjEwMCVcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luOjAscGFkZGluZzowLGxpc3RTdHlsZVR5cGU6XCJub25lXCIsekluZGV4Ojk5OTk5OTl9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkubGF5b3V0cy50b3A9e25hbWU6XCJ0b3BcIixvcHRpb25zOnt9LGNvbnRhaW5lcjp7b2JqZWN0Oic8dWwgaWQ9XCJub3R5X3RvcF9sYXlvdXRfY29udGFpbmVyXCIgLz4nLHNlbGVjdG9yOlwidWwjbm90eV90b3BfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3RvcDowLGxlZnQ6XCI1JVwiLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjkwJVwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6OTk5OTk5OX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLnRvcENlbnRlcj17bmFtZTpcInRvcENlbnRlclwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfdG9wQ2VudGVyX2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X3RvcENlbnRlcl9sYXlvdXRfY29udGFpbmVyXCIsc3R5bGU6ZnVuY3Rpb24oKXthKHRoaXMpLmNzcyh7dG9wOjIwLGxlZnQ6MCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSksYSh0aGlzKS5jc3Moe2xlZnQ6KGEod2luZG93KS53aWR0aCgpLWEodGhpcykub3V0ZXJXaWR0aCghMSkpLzIrXCJweFwifSl9fSxwYXJlbnQ6e29iamVjdDpcIjxsaSAvPlwiLHNlbGVjdG9yOlwibGlcIixjc3M6e319LGNzczp7ZGlzcGxheTpcIm5vbmVcIix3aWR0aDpcIjMxMHB4XCJ9LGFkZENsYXNzOlwiXCJ9LGEubm90eS5sYXlvdXRzLnRvcExlZnQ9e25hbWU6XCJ0b3BMZWZ0XCIsb3B0aW9uczp7fSxjb250YWluZXI6e29iamVjdDonPHVsIGlkPVwibm90eV90b3BMZWZ0X2xheW91dF9jb250YWluZXJcIiAvPicsc2VsZWN0b3I6XCJ1bCNub3R5X3RvcExlZnRfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3RvcDoyMCxsZWZ0OjIwLHBvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjMxMHB4XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpbjowLHBhZGRpbmc6MCxsaXN0U3R5bGVUeXBlOlwibm9uZVwiLHpJbmRleDoxZTd9KSx3aW5kb3cuaW5uZXJXaWR0aDw2MDAmJmEodGhpcykuY3NzKHtsZWZ0OjV9KX19LHBhcmVudDp7b2JqZWN0OlwiPGxpIC8+XCIsc2VsZWN0b3I6XCJsaVwiLGNzczp7fX0sY3NzOntkaXNwbGF5Olwibm9uZVwiLHdpZHRoOlwiMzEwcHhcIn0sYWRkQ2xhc3M6XCJcIn0sYS5ub3R5LmxheW91dHMudG9wUmlnaHQ9e25hbWU6XCJ0b3BSaWdodFwiLG9wdGlvbnM6e30sY29udGFpbmVyOntvYmplY3Q6Jzx1bCBpZD1cIm5vdHlfdG9wUmlnaHRfbGF5b3V0X2NvbnRhaW5lclwiIC8+JyxzZWxlY3RvcjpcInVsI25vdHlfdG9wUmlnaHRfbGF5b3V0X2NvbnRhaW5lclwiLHN0eWxlOmZ1bmN0aW9uKCl7YSh0aGlzKS5jc3Moe3RvcDoyMCxyaWdodDoyMCxwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIzMTBweFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW46MCxwYWRkaW5nOjAsbGlzdFN0eWxlVHlwZTpcIm5vbmVcIix6SW5kZXg6MWU3fSksd2luZG93LmlubmVyV2lkdGg8NjAwJiZhKHRoaXMpLmNzcyh7cmlnaHQ6NX0pfX0scGFyZW50OntvYmplY3Q6XCI8bGkgLz5cIixzZWxlY3RvcjpcImxpXCIsY3NzOnt9fSxjc3M6e2Rpc3BsYXk6XCJub25lXCIsd2lkdGg6XCIzMTBweFwifSxhZGRDbGFzczpcIlwifSxhLm5vdHkudGhlbWVzLmJvb3RzdHJhcFRoZW1lPXtuYW1lOlwiYm9vdHN0cmFwVGhlbWVcIixtb2RhbDp7Y3NzOntwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIxMDAlXCIsaGVpZ2h0OlwiMTAwJVwiLGJhY2tncm91bmRDb2xvcjpcIiMwMDBcIix6SW5kZXg6MWU0LG9wYWNpdHk6LjYsZGlzcGxheTpcIm5vbmVcIixsZWZ0OjAsdG9wOjB9fSxzdHlsZTpmdW5jdGlvbigpe3ZhciBiPXRoaXMub3B0aW9ucy5sYXlvdXQuY29udGFpbmVyLnNlbGVjdG9yO3N3aXRjaChhKGIpLmFkZENsYXNzKFwibGlzdC1ncm91cFwiKSx0aGlzLiRjbG9zZUJ1dHRvbi5hcHBlbmQoJzxzcGFuIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPiZ0aW1lczs8L3NwYW4+PHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+Q2xvc2U8L3NwYW4+JyksdGhpcy4kY2xvc2VCdXR0b24uYWRkQ2xhc3MoXCJjbG9zZVwiKSx0aGlzLiRiYXIuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwLWl0ZW1cIikuY3NzKFwicGFkZGluZ1wiLFwiMHB4XCIpLHRoaXMub3B0aW9ucy50eXBlKXtjYXNlXCJhbGVydFwiOmNhc2VcIm5vdGlmaWNhdGlvblwiOnRoaXMuJGJhci5hZGRDbGFzcyhcImxpc3QtZ3JvdXAtaXRlbS1pbmZvXCIpO2JyZWFrO2Nhc2VcIndhcm5pbmdcIjp0aGlzLiRiYXIuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwLWl0ZW0td2FybmluZ1wiKTticmVhaztjYXNlXCJlcnJvclwiOnRoaXMuJGJhci5hZGRDbGFzcyhcImxpc3QtZ3JvdXAtaXRlbS1kYW5nZXJcIik7YnJlYWs7Y2FzZVwiaW5mb3JtYXRpb25cIjp0aGlzLiRiYXIuYWRkQ2xhc3MoXCJsaXN0LWdyb3VwLWl0ZW0taW5mb1wiKTticmVhaztjYXNlXCJzdWNjZXNzXCI6dGhpcy4kYmFyLmFkZENsYXNzKFwibGlzdC1ncm91cC1pdGVtLXN1Y2Nlc3NcIil9dGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRTaXplOlwiMTNweFwiLGxpbmVIZWlnaHQ6XCIxNnB4XCIsdGV4dEFsaWduOlwiY2VudGVyXCIscGFkZGluZzpcIjhweCAxMHB4IDlweFwiLHdpZHRoOlwiYXV0b1wiLHBvc2l0aW9uOlwicmVsYXRpdmVcIn0pfSxjYWxsYmFjazp7b25TaG93OmZ1bmN0aW9uKCl7fSxvbkNsb3NlOmZ1bmN0aW9uKCl7fX19LGEubm90eS50aGVtZXMuZGVmYXVsdFRoZW1lPXtuYW1lOlwiZGVmYXVsdFRoZW1lXCIsaGVscGVyczp7Ym9yZGVyRml4OmZ1bmN0aW9uKCl7aWYodGhpcy5vcHRpb25zLmRpc21pc3NRdWV1ZSl7dmFyIGI9dGhpcy5vcHRpb25zLmxheW91dC5jb250YWluZXIuc2VsZWN0b3IrXCIgXCIrdGhpcy5vcHRpb25zLmxheW91dC5wYXJlbnQuc2VsZWN0b3I7c3dpdGNoKHRoaXMub3B0aW9ucy5sYXlvdXQubmFtZSl7Y2FzZVwidG9wXCI6YShiKS5jc3Moe2JvcmRlclJhZGl1czpcIjBweCAwcHggMHB4IDBweFwifSksYShiKS5sYXN0KCkuY3NzKHtib3JkZXJSYWRpdXM6XCIwcHggMHB4IDVweCA1cHhcIn0pO2JyZWFrO2Nhc2VcInRvcENlbnRlclwiOmNhc2VcInRvcExlZnRcIjpjYXNlXCJ0b3BSaWdodFwiOmNhc2VcImJvdHRvbUNlbnRlclwiOmNhc2VcImJvdHRvbUxlZnRcIjpjYXNlXCJib3R0b21SaWdodFwiOmNhc2VcImNlbnRlclwiOmNhc2VcImNlbnRlckxlZnRcIjpjYXNlXCJjZW50ZXJSaWdodFwiOmNhc2VcImlubGluZVwiOmEoYikuY3NzKHtib3JkZXJSYWRpdXM6XCIwcHggMHB4IDBweCAwcHhcIn0pLGEoYikuZmlyc3QoKS5jc3Moe1wiYm9yZGVyLXRvcC1sZWZ0LXJhZGl1c1wiOlwiNXB4XCIsXCJib3JkZXItdG9wLXJpZ2h0LXJhZGl1c1wiOlwiNXB4XCJ9KSxhKGIpLmxhc3QoKS5jc3Moe1wiYm9yZGVyLWJvdHRvbS1sZWZ0LXJhZGl1c1wiOlwiNXB4XCIsXCJib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1c1wiOlwiNXB4XCJ9KTticmVhaztjYXNlXCJib3R0b21cIjphKGIpLmNzcyh7Ym9yZGVyUmFkaXVzOlwiMHB4IDBweCAwcHggMHB4XCJ9KSxhKGIpLmZpcnN0KCkuY3NzKHtib3JkZXJSYWRpdXM6XCI1cHggNXB4IDBweCAwcHhcIn0pfX19fSxtb2RhbDp7Y3NzOntwb3NpdGlvbjpcImZpeGVkXCIsd2lkdGg6XCIxMDAlXCIsaGVpZ2h0OlwiMTAwJVwiLGJhY2tncm91bmRDb2xvcjpcIiMwMDBcIix6SW5kZXg6MWU0LG9wYWNpdHk6LjYsZGlzcGxheTpcIm5vbmVcIixsZWZ0OjAsdG9wOjB9fSxzdHlsZTpmdW5jdGlvbigpe3N3aXRjaCh0aGlzLiRiYXIuY3NzKHtvdmVyZmxvdzpcImhpZGRlblwiLGJhY2tncm91bmQ6XCJ1cmwoJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQnNBQUFBb0NBUUFBQUNsTTBuZEFBQUFoa2xFUVZSNEFkWE8wUXJDTUJCRTBidHRrazM4L3c4V1JFUnBkeWp6Vk9jK0h4aElIcUpHTVFjRkZrcFlSUW90TExTdzBJSjVhQmRvdnJ1TVlEQS9rVDhwbEY5WktMRlFjZ0YxOGhEajFTYlFPTWxDQTRrYW8waWlYbWFoN3FCV1BkeHBvaHNnVlp5ajdlNUk5S2NJRCtFaGlESTVneEJZS0xCUVlLSEFRb0dGQW9Fa3MvWUVHSFlLQjdoRnhmMEFBQUFBU1VWT1JLNUNZSUk9JykgcmVwZWF0LXggc2Nyb2xsIGxlZnQgdG9wICNmZmZcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjEzcHhcIixsaW5lSGVpZ2h0OlwiMTZweFwiLHRleHRBbGlnbjpcImNlbnRlclwiLHBhZGRpbmc6XCI4cHggMTBweCA5cHhcIix3aWR0aDpcImF1dG9cIixwb3NpdGlvbjpcInJlbGF0aXZlXCJ9KSx0aGlzLiRjbG9zZUJ1dHRvbi5jc3Moe3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6NCxyaWdodDo0LHdpZHRoOjEwLGhlaWdodDoxMCxiYWNrZ3JvdW5kOlwidXJsKGRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQW9BQUFBS0NBUUFBQUFuT3djMkFBQUF4VWxFUVZSNEFSM01QVW9EVVJTQTBlKyt1U2trT3hDM0lBT1dOdGFDSURhQ2hmZ1hCTUVaYlFSQnl4Q3drK0Jhc2dRUlpMU1lvTGdEUWJBUnhyeThueXVtUGNWUktEZmQwQWE4QXNnRHYxenA2cFlkNWpXT3dodmViUlRiek5ORXc1QlNzSXBzai9rdXJRQm5tazdzSUZjQ0Y1eXlaUERSRzZ0clFodWpYWW9zYUZvYysyZjFNSjg5dWM3NklORDZGOUJ2bFhVZHBiNnh3RDIrNHEzbWUzYnlzaUh2dExZclVKdG83UEQvdmU3TE5IeFNnL3dvTjJrU3o0dHhhc0JkaHlpejN1Z1BHZXRUam0zWFJva0FBQUFBU1VWT1JLNUNZSUk9KVwiLGRpc3BsYXk6XCJub25lXCIsY3Vyc29yOlwicG9pbnRlclwifSksdGhpcy4kYnV0dG9ucy5jc3Moe3BhZGRpbmc6NSx0ZXh0QWxpZ246XCJyaWdodFwiLGJvcmRlclRvcDpcIjFweCBzb2xpZCAjY2NjXCIsYmFja2dyb3VuZENvbG9yOlwiI2ZmZlwifSksdGhpcy4kYnV0dG9ucy5maW5kKFwiYnV0dG9uXCIpLmNzcyh7bWFyZ2luTGVmdDo1fSksdGhpcy4kYnV0dG9ucy5maW5kKFwiYnV0dG9uOmZpcnN0XCIpLmNzcyh7bWFyZ2luTGVmdDowfSksdGhpcy4kYmFyLm9uKHttb3VzZWVudGVyOmZ1bmN0aW9uKCl7YSh0aGlzKS5maW5kKFwiLm5vdHlfY2xvc2VcIikuc3RvcCgpLmZhZGVUbyhcIm5vcm1hbFwiLDEpfSxtb3VzZWxlYXZlOmZ1bmN0aW9uKCl7YSh0aGlzKS5maW5kKFwiLm5vdHlfY2xvc2VcIikuc3RvcCgpLmZhZGVUbyhcIm5vcm1hbFwiLDApfX0pLHRoaXMub3B0aW9ucy5sYXlvdXQubmFtZSl7Y2FzZVwidG9wXCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyUmFkaXVzOlwiMHB4IDBweCA1cHggNXB4XCIsYm9yZGVyQm90dG9tOlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJMZWZ0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJSaWdodDpcIjJweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSk7YnJlYWs7Y2FzZVwidG9wQ2VudGVyXCI6Y2FzZVwiY2VudGVyXCI6Y2FzZVwiYm90dG9tQ2VudGVyXCI6Y2FzZVwiaW5saW5lXCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyUmFkaXVzOlwiNXB4XCIsYm9yZGVyOlwiMXB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsdGV4dEFsaWduOlwiY2VudGVyXCJ9KTticmVhaztjYXNlXCJ0b3BMZWZ0XCI6Y2FzZVwidG9wUmlnaHRcIjpjYXNlXCJib3R0b21MZWZ0XCI6Y2FzZVwiYm90dG9tUmlnaHRcIjpjYXNlXCJjZW50ZXJMZWZ0XCI6Y2FzZVwiY2VudGVyUmlnaHRcIjp0aGlzLiRiYXIuY3NzKHtib3JkZXJSYWRpdXM6XCI1cHhcIixib3JkZXI6XCIxcHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjEzcHhcIix0ZXh0QWxpZ246XCJsZWZ0XCJ9KTticmVhaztjYXNlXCJib3R0b21cIjp0aGlzLiRiYXIuY3NzKHtib3JkZXJSYWRpdXM6XCI1cHggNXB4IDBweCAwcHhcIixib3JkZXJUb3A6XCIycHggc29saWQgI2VlZVwiLGJvcmRlckxlZnQ6XCIycHggc29saWQgI2VlZVwiLGJvcmRlclJpZ2h0OlwiMnB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIC0ycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSk7YnJlYWs7ZGVmYXVsdDp0aGlzLiRiYXIuY3NzKHtib3JkZXI6XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pfXN3aXRjaCh0aGlzLm9wdGlvbnMudHlwZSl7Y2FzZVwiYWxlcnRcIjpjYXNlXCJub3RpZmljYXRpb25cIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkZGXCIsYm9yZGVyQ29sb3I6XCIjQ0NDXCIsY29sb3I6XCIjNDQ0XCJ9KTticmVhaztjYXNlXCJ3YXJuaW5nXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGRUFBOFwiLGJvcmRlckNvbG9yOlwiI0ZGQzIzN1wiLGNvbG9yOlwiIzgyNjIwMFwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjRkZDMjM3XCJ9KTticmVhaztjYXNlXCJlcnJvclwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcInJlZFwiLGJvcmRlckNvbG9yOlwiZGFya3JlZFwiLGNvbG9yOlwiI0ZGRlwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRXZWlnaHQ6XCJib2xkXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkIGRhcmtyZWRcIn0pO2JyZWFrO2Nhc2VcImluZm9ybWF0aW9uXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiIzU3QjdFMlwiLGJvcmRlckNvbG9yOlwiIzBCOTBDNFwiLGNvbG9yOlwiI0ZGRlwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjMEI5MEM0XCJ9KTticmVhaztjYXNlXCJzdWNjZXNzXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwibGlnaHRncmVlblwiLGJvcmRlckNvbG9yOlwiIzUwQzI0RVwiLGNvbG9yOlwiZGFya2dyZWVuXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkICM1MEMyNEVcIn0pO2JyZWFrO2RlZmF1bHQ6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGRlwiLGJvcmRlckNvbG9yOlwiI0NDQ1wiLGNvbG9yOlwiIzQ0NFwifSl9fSxjYWxsYmFjazp7b25TaG93OmZ1bmN0aW9uKCl7YS5ub3R5LnRoZW1lcy5kZWZhdWx0VGhlbWUuaGVscGVycy5ib3JkZXJGaXguYXBwbHkodGhpcyl9LG9uQ2xvc2U6ZnVuY3Rpb24oKXthLm5vdHkudGhlbWVzLmRlZmF1bHRUaGVtZS5oZWxwZXJzLmJvcmRlckZpeC5hcHBseSh0aGlzKX19fSxhLm5vdHkudGhlbWVzLnJlbGF4PXtuYW1lOlwicmVsYXhcIixoZWxwZXJzOnt9LG1vZGFsOntjc3M6e3Bvc2l0aW9uOlwiZml4ZWRcIix3aWR0aDpcIjEwMCVcIixoZWlnaHQ6XCIxMDAlXCIsYmFja2dyb3VuZENvbG9yOlwiIzAwMFwiLHpJbmRleDoxZTQsb3BhY2l0eTouNixkaXNwbGF5Olwibm9uZVwiLGxlZnQ6MCx0b3A6MH19LHN0eWxlOmZ1bmN0aW9uKCl7c3dpdGNoKHRoaXMuJGJhci5jc3Moe292ZXJmbG93OlwiaGlkZGVuXCIsbWFyZ2luOlwiNHB4IDBcIixib3JkZXJSYWRpdXM6XCIycHhcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjE0cHhcIixsaW5lSGVpZ2h0OlwiMTZweFwiLHRleHRBbGlnbjpcImNlbnRlclwiLHBhZGRpbmc6XCIxMHB4XCIsd2lkdGg6XCJhdXRvXCIscG9zaXRpb246XCJyZWxhdGl2ZVwifSksdGhpcy4kY2xvc2VCdXR0b24uY3NzKHtwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOjQscmlnaHQ6NCx3aWR0aDoxMCxoZWlnaHQ6MTAsYmFja2dyb3VuZDpcInVybChkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFvQUFBQUtDQVFBQUFBbk93YzJBQUFBeFVsRVFWUjRBUjNNUFVvRFVSU0EwZSsrdVNra094QzNJQU9XTnRhQ0lEYUNoZmdYQk1FWmJRUkJ5eEN3aytCYXNnUVJaTFNZb0xnRFFiQVJ4cnk4bnl1bVBjVlJLRGZkMEFhOEFzZ0R2MXpwNnBZZDVqV093aHZlYlJUYnpOTkV3NUJTc0lwc2ova3VyUUJubWs3c0lGY0NGNXl5WlBEUkc2dHJRaHVqWFlvc2FGb2MrMmYxTUo4OXVjNzZJTkQ2RjlCdmxYVWRwYjZ4d0QyKzRxM21lM2J5c2lIdnRMWXJVSnRvN1BEL3ZlN0xOSHhTZy93b04ya1N6NHR4YXNCZGh5aXozdWdQR2V0VGptM1hSb2tBQUFBQVNVVk9SSzVDWUlJPSlcIixkaXNwbGF5Olwibm9uZVwiLGN1cnNvcjpcInBvaW50ZXJcIn0pLHRoaXMuJGJ1dHRvbnMuY3NzKHtwYWRkaW5nOjUsdGV4dEFsaWduOlwicmlnaHRcIixib3JkZXJUb3A6XCIxcHggc29saWQgI2NjY1wiLGJhY2tncm91bmRDb2xvcjpcIiNmZmZcIn0pLHRoaXMuJGJ1dHRvbnMuZmluZChcImJ1dHRvblwiKS5jc3Moe21hcmdpbkxlZnQ6NX0pLHRoaXMuJGJ1dHRvbnMuZmluZChcImJ1dHRvbjpmaXJzdFwiKS5jc3Moe21hcmdpbkxlZnQ6MH0pLHRoaXMuJGJhci5vbih7bW91c2VlbnRlcjpmdW5jdGlvbigpe2EodGhpcykuZmluZChcIi5ub3R5X2Nsb3NlXCIpLnN0b3AoKS5mYWRlVG8oXCJub3JtYWxcIiwxKX0sbW91c2VsZWF2ZTpmdW5jdGlvbigpe2EodGhpcykuZmluZChcIi5ub3R5X2Nsb3NlXCIpLnN0b3AoKS5mYWRlVG8oXCJub3JtYWxcIiwwKX19KSx0aGlzLm9wdGlvbnMubGF5b3V0Lm5hbWUpe2Nhc2VcInRvcFwiOnRoaXMuJGJhci5jc3Moe2JvcmRlckJvdHRvbTpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyTGVmdDpcIjJweCBzb2xpZCAjZWVlXCIsYm9yZGVyUmlnaHQ6XCIycHggc29saWQgI2VlZVwiLGJvcmRlclRvcDpcIjJweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSk7YnJlYWs7Y2FzZVwidG9wQ2VudGVyXCI6Y2FzZVwiY2VudGVyXCI6Y2FzZVwiYm90dG9tQ2VudGVyXCI6Y2FzZVwiaW5saW5lXCI6dGhpcy4kYmFyLmNzcyh7Ym9yZGVyOlwiMXB4IHNvbGlkICNlZWVcIixib3hTaGFkb3c6XCIwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KSx0aGlzLiRtZXNzYWdlLmNzcyh7Zm9udFNpemU6XCIxM3B4XCIsdGV4dEFsaWduOlwiY2VudGVyXCJ9KTticmVhaztjYXNlXCJ0b3BMZWZ0XCI6Y2FzZVwidG9wUmlnaHRcIjpjYXNlXCJib3R0b21MZWZ0XCI6Y2FzZVwiYm90dG9tUmlnaHRcIjpjYXNlXCJjZW50ZXJMZWZ0XCI6Y2FzZVwiY2VudGVyUmlnaHRcIjp0aGlzLiRiYXIuY3NzKHtib3JkZXI6XCIxcHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSlcIn0pLHRoaXMuJG1lc3NhZ2UuY3NzKHtmb250U2l6ZTpcIjEzcHhcIix0ZXh0QWxpZ246XCJsZWZ0XCJ9KTticmVhaztjYXNlXCJib3R0b21cIjp0aGlzLiRiYXIuY3NzKHtib3JkZXJUb3A6XCIycHggc29saWQgI2VlZVwiLGJvcmRlckxlZnQ6XCIycHggc29saWQgI2VlZVwiLGJvcmRlclJpZ2h0OlwiMnB4IHNvbGlkICNlZWVcIixib3JkZXJCb3R0b206XCIycHggc29saWQgI2VlZVwiLGJveFNoYWRvdzpcIjAgLTJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpXCJ9KTticmVhaztkZWZhdWx0OnRoaXMuJGJhci5jc3Moe2JvcmRlcjpcIjJweCBzb2xpZCAjZWVlXCIsYm94U2hhZG93OlwiMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKVwifSl9c3dpdGNoKHRoaXMub3B0aW9ucy50eXBlKXtjYXNlXCJhbGVydFwiOmNhc2VcIm5vdGlmaWNhdGlvblwiOnRoaXMuJGJhci5jc3Moe2JhY2tncm91bmRDb2xvcjpcIiNGRkZcIixib3JkZXJDb2xvcjpcIiNkZWRlZGVcIixjb2xvcjpcIiM0NDRcIn0pO2JyZWFrO2Nhc2VcIndhcm5pbmdcIjp0aGlzLiRiYXIuY3NzKHtiYWNrZ3JvdW5kQ29sb3I6XCIjRkZFQUE4XCIsYm9yZGVyQ29sb3I6XCIjRkZDMjM3XCIsY29sb3I6XCIjODI2MjAwXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkICNGRkMyMzdcIn0pO2JyZWFrO2Nhc2VcImVycm9yXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGODE4MVwiLGJvcmRlckNvbG9yOlwiI2UyNTM1M1wiLGNvbG9yOlwiI0ZGRlwifSksdGhpcy4kbWVzc2FnZS5jc3Moe2ZvbnRXZWlnaHQ6XCJib2xkXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkIGRhcmtyZWRcIn0pO2JyZWFrO2Nhc2VcImluZm9ybWF0aW9uXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiIzc4QzVFN1wiLGJvcmRlckNvbG9yOlwiIzNiYWRkNlwiLGNvbG9yOlwiI0ZGRlwifSksdGhpcy4kYnV0dG9ucy5jc3Moe2JvcmRlclRvcDpcIjFweCBzb2xpZCAjMEI5MEM0XCJ9KTticmVhaztjYXNlXCJzdWNjZXNzXCI6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0JDRjVCQ1wiLGJvcmRlckNvbG9yOlwiIzdjZGQ3N1wiLGNvbG9yOlwiZGFya2dyZWVuXCJ9KSx0aGlzLiRidXR0b25zLmNzcyh7Ym9yZGVyVG9wOlwiMXB4IHNvbGlkICM1MEMyNEVcIn0pO2JyZWFrO2RlZmF1bHQ6dGhpcy4kYmFyLmNzcyh7YmFja2dyb3VuZENvbG9yOlwiI0ZGRlwiLGJvcmRlckNvbG9yOlwiI0NDQ1wiLGNvbG9yOlwiIzQ0NFwifSl9fSxjYWxsYmFjazp7b25TaG93OmZ1bmN0aW9uKCl7fSxvbkNsb3NlOmZ1bmN0aW9uKCl7fX19LHdpbmRvdy5ub3R5fSk7IiwiLyohXG4gKiBNb2NrSmF4IC0galF1ZXJ5IFBsdWdpbiB0byBNb2NrIEFqYXggcmVxdWVzdHNcbiAqXG4gKiBWZXJzaW9uOiAgMS41LjNcbiAqIFJlbGVhc2VkOlxuICogSG9tZTogICBodHRwOi8vZ2l0aHViLmNvbS9hcHBlbmR0by9qcXVlcnktbW9ja2pheFxuICogQXV0aG9yOiAgIEpvbmF0aGFuIFNoYXJwIChodHRwOi8vamRzaGFycC5jb20pXG4gKiBMaWNlbnNlOiAgTUlULEdQTFxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMSBhcHBlbmRUbyBMTEMuXG4gKiBEdWFsIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgb3IgR1BMIGxpY2Vuc2VzLlxuICogaHR0cDovL2FwcGVuZHRvLmNvbS9vcGVuLXNvdXJjZS1saWNlbnNlc1xuICovXG4oZnVuY3Rpb24oJCkge1xuXHR2YXIgX2FqYXggPSAkLmFqYXgsXG5cdFx0bW9ja0hhbmRsZXJzID0gW10sXG5cdFx0bW9ja2VkQWpheENhbGxzID0gW10sXG5cdFx0Q0FMTEJBQ0tfUkVHRVggPSAvPVxcPygmfCQpLyxcblx0XHRqc2MgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpO1xuXG5cblx0Ly8gUGFyc2UgdGhlIGdpdmVuIFhNTCBzdHJpbmcuXG5cdGZ1bmN0aW9uIHBhcnNlWE1MKHhtbCkge1xuXHRcdGlmICggd2luZG93LkRPTVBhcnNlciA9PSB1bmRlZmluZWQgJiYgd2luZG93LkFjdGl2ZVhPYmplY3QgKSB7XG5cdFx0XHRET01QYXJzZXIgPSBmdW5jdGlvbigpIHsgfTtcblx0XHRcdERPTVBhcnNlci5wcm90b3R5cGUucGFyc2VGcm9tU3RyaW5nID0gZnVuY3Rpb24oIHhtbFN0cmluZyApIHtcblx0XHRcdFx0dmFyIGRvYyA9IG5ldyBBY3RpdmVYT2JqZWN0KCdNaWNyb3NvZnQuWE1MRE9NJyk7XG5cdFx0XHRcdGRvYy5hc3luYyA9ICdmYWxzZSc7XG5cdFx0XHRcdGRvYy5sb2FkWE1MKCB4bWxTdHJpbmcgKTtcblx0XHRcdFx0cmV0dXJuIGRvYztcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0dHJ5IHtcblx0XHRcdHZhciB4bWxEb2MgPSAoIG5ldyBET01QYXJzZXIoKSApLnBhcnNlRnJvbVN0cmluZyggeG1sLCAndGV4dC94bWwnICk7XG5cdFx0XHRpZiAoICQuaXNYTUxEb2MoIHhtbERvYyApICkge1xuXHRcdFx0XHR2YXIgZXJyID0gJCgncGFyc2VyZXJyb3InLCB4bWxEb2MpO1xuXHRcdFx0XHRpZiAoIGVyci5sZW5ndGggPT0gMSApIHtcblx0XHRcdFx0XHR0aHJvdygnRXJyb3I6ICcgKyAkKHhtbERvYykudGV4dCgpICk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93KCdVbmFibGUgdG8gcGFyc2UgWE1MJyk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4geG1sRG9jO1xuXHRcdH0gY2F0Y2goIGUgKSB7XG5cdFx0XHR2YXIgbXNnID0gKCBlLm5hbWUgPT0gdW5kZWZpbmVkID8gZSA6IGUubmFtZSArICc6ICcgKyBlLm1lc3NhZ2UgKTtcblx0XHRcdCQoZG9jdW1lbnQpLnRyaWdnZXIoJ3htbFBhcnNlRXJyb3InLCBbIG1zZyBdKTtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG5cblx0Ly8gVHJpZ2dlciBhIGpRdWVyeSBldmVudFxuXHRmdW5jdGlvbiB0cmlnZ2VyKHMsIHR5cGUsIGFyZ3MpIHtcblx0XHQocy5jb250ZXh0ID8gJChzLmNvbnRleHQpIDogJC5ldmVudCkudHJpZ2dlcih0eXBlLCBhcmdzKTtcblx0fVxuXG5cdC8vIENoZWNrIGlmIHRoZSBkYXRhIGZpZWxkIG9uIHRoZSBtb2NrIGhhbmRsZXIgYW5kIHRoZSByZXF1ZXN0IG1hdGNoLiBUaGlzXG5cdC8vIGNhbiBiZSB1c2VkIHRvIHJlc3RyaWN0IGEgbW9jayBoYW5kbGVyIHRvIGJlaW5nIHVzZWQgb25seSB3aGVuIGEgY2VydGFpblxuXHQvLyBzZXQgb2YgZGF0YSBpcyBwYXNzZWQgdG8gaXQuXG5cdGZ1bmN0aW9uIGlzTW9ja0RhdGFFcXVhbCggbW9jaywgbGl2ZSApIHtcblx0XHR2YXIgaWRlbnRpY2FsID0gdHJ1ZTtcblx0XHQvLyBUZXN0IGZvciBzaXR1YXRpb25zIHdoZXJlIHRoZSBkYXRhIGlzIGEgcXVlcnlzdHJpbmcgKG5vdCBhbiBvYmplY3QpXG5cdFx0aWYgKHR5cGVvZiBsaXZlID09PSAnc3RyaW5nJykge1xuXHRcdFx0Ly8gUXVlcnlzdHJpbmcgbWF5IGJlIGEgcmVnZXhcblx0XHRcdHJldHVybiAkLmlzRnVuY3Rpb24oIG1vY2sudGVzdCApID8gbW9jay50ZXN0KGxpdmUpIDogbW9jayA9PSBsaXZlO1xuXHRcdH1cblx0XHQkLmVhY2gobW9jaywgZnVuY3Rpb24oaykge1xuXHRcdFx0aWYgKCBsaXZlW2tdID09PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdGlkZW50aWNhbCA9IGZhbHNlO1xuXHRcdFx0XHRyZXR1cm4gaWRlbnRpY2FsO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aWYgKCB0eXBlb2YgbGl2ZVtrXSA9PT0gJ29iamVjdCcgJiYgbGl2ZVtrXSAhPT0gbnVsbCApIHtcblx0XHRcdFx0XHRpZiAoIGlkZW50aWNhbCAmJiAkLmlzQXJyYXkoIGxpdmVba10gKSApIHtcblx0XHRcdFx0XHRcdGlkZW50aWNhbCA9ICQuaXNBcnJheSggbW9ja1trXSApICYmIGxpdmVba10ubGVuZ3RoID09PSBtb2NrW2tdLmxlbmd0aDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWRlbnRpY2FsID0gaWRlbnRpY2FsICYmIGlzTW9ja0RhdGFFcXVhbChtb2NrW2tdLCBsaXZlW2tdKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRpZiAoIG1vY2tba10gJiYgJC5pc0Z1bmN0aW9uKCBtb2NrW2tdLnRlc3QgKSApIHtcblx0XHRcdFx0XHRcdGlkZW50aWNhbCA9IGlkZW50aWNhbCAmJiBtb2NrW2tdLnRlc3QobGl2ZVtrXSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGlkZW50aWNhbCA9IGlkZW50aWNhbCAmJiAoIG1vY2tba10gPT0gbGl2ZVtrXSApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIGlkZW50aWNhbDtcblx0fVxuXG4gICAgLy8gU2VlIGlmIGEgbW9jayBoYW5kbGVyIHByb3BlcnR5IG1hdGNoZXMgdGhlIGRlZmF1bHQgc2V0dGluZ3NcbiAgICBmdW5jdGlvbiBpc0RlZmF1bHRTZXR0aW5nKGhhbmRsZXIsIHByb3BlcnR5KSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVyW3Byb3BlcnR5XSA9PT0gJC5tb2NramF4U2V0dGluZ3NbcHJvcGVydHldO1xuICAgIH1cblxuXHQvLyBDaGVjayB0aGUgZ2l2ZW4gaGFuZGxlciBzaG91bGQgbW9jayB0aGUgZ2l2ZW4gcmVxdWVzdFxuXHRmdW5jdGlvbiBnZXRNb2NrRm9yUmVxdWVzdCggaGFuZGxlciwgcmVxdWVzdFNldHRpbmdzICkge1xuXHRcdC8vIElmIHRoZSBtb2NrIHdhcyByZWdpc3RlcmVkIHdpdGggYSBmdW5jdGlvbiwgbGV0IHRoZSBmdW5jdGlvbiBkZWNpZGUgaWYgd2Vcblx0XHQvLyB3YW50IHRvIG1vY2sgdGhpcyByZXF1ZXN0XG5cdFx0aWYgKCAkLmlzRnVuY3Rpb24oaGFuZGxlcikgKSB7XG5cdFx0XHRyZXR1cm4gaGFuZGxlciggcmVxdWVzdFNldHRpbmdzICk7XG5cdFx0fVxuXG5cdFx0Ly8gSW5zcGVjdCB0aGUgVVJMIG9mIHRoZSByZXF1ZXN0IGFuZCBjaGVjayBpZiB0aGUgbW9jayBoYW5kbGVyJ3MgdXJsXG5cdFx0Ly8gbWF0Y2hlcyB0aGUgdXJsIGZvciB0aGlzIGFqYXggcmVxdWVzdFxuXHRcdGlmICggJC5pc0Z1bmN0aW9uKGhhbmRsZXIudXJsLnRlc3QpICkge1xuXHRcdFx0Ly8gVGhlIHVzZXIgcHJvdmlkZWQgYSByZWdleCBmb3IgdGhlIHVybCwgdGVzdCBpdFxuXHRcdFx0aWYgKCAhaGFuZGxlci51cmwudGVzdCggcmVxdWVzdFNldHRpbmdzLnVybCApICkge1xuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gTG9vayBmb3IgYSBzaW1wbGUgd2lsZGNhcmQgJyonIG9yIGEgZGlyZWN0IFVSTCBtYXRjaFxuXHRcdFx0dmFyIHN0YXIgPSBoYW5kbGVyLnVybC5pbmRleE9mKCcqJyk7XG5cdFx0XHRpZiAoaGFuZGxlci51cmwgIT09IHJlcXVlc3RTZXR0aW5ncy51cmwgJiYgc3RhciA9PT0gLTEgfHxcblx0XHRcdFx0XHQhbmV3IFJlZ0V4cChoYW5kbGVyLnVybC5yZXBsYWNlKC9bLVtcXF17fSgpKz8uLFxcXFxeJHwjXFxzXS9nLCBcIlxcXFwkJlwiKS5yZXBsYWNlKC9cXCovZywgJy4rJykpLnRlc3QocmVxdWVzdFNldHRpbmdzLnVybCkpIHtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gSW5zcGVjdCB0aGUgZGF0YSBzdWJtaXR0ZWQgaW4gdGhlIHJlcXVlc3QgKGVpdGhlciBQT1NUIGJvZHkgb3IgR0VUIHF1ZXJ5IHN0cmluZylcblx0XHRpZiAoIGhhbmRsZXIuZGF0YSApIHtcblx0XHRcdGlmICggISByZXF1ZXN0U2V0dGluZ3MuZGF0YSB8fCAhaXNNb2NrRGF0YUVxdWFsKGhhbmRsZXIuZGF0YSwgcmVxdWVzdFNldHRpbmdzLmRhdGEpICkge1xuXHRcdFx0XHQvLyBUaGV5J3JlIG5vdCBpZGVudGljYWwsIGRvIG5vdCBtb2NrIHRoaXMgcmVxdWVzdFxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gSW5zcGVjdCB0aGUgcmVxdWVzdCB0eXBlXG5cdFx0aWYgKCBoYW5kbGVyICYmIGhhbmRsZXIudHlwZSAmJlxuXHRcdFx0XHRoYW5kbGVyLnR5cGUudG9Mb3dlckNhc2UoKSAhPSByZXF1ZXN0U2V0dGluZ3MudHlwZS50b0xvd2VyQ2FzZSgpICkge1xuXHRcdFx0Ly8gVGhlIHJlcXVlc3QgdHlwZSBkb2Vzbid0IG1hdGNoIChHRVQgdnMuIFBPU1QpXG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRyZXR1cm4gaGFuZGxlcjtcblx0fVxuXG5cdC8vIFByb2Nlc3MgdGhlIHhociBvYmplY3RzIHNlbmQgb3BlcmF0aW9uXG5cdGZ1bmN0aW9uIF94aHJTZW5kKG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncykge1xuXG5cdFx0Ly8gVGhpcyBpcyBhIHN1YnN0aXR1dGUgZm9yIDwgMS40IHdoaWNoIGxhY2tzICQucHJveHlcblx0XHR2YXIgcHJvY2VzcyA9IChmdW5jdGlvbih0aGF0KSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiAoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dmFyIG9uUmVhZHk7XG5cblx0XHRcdFx0XHQvLyBUaGUgcmVxdWVzdCBoYXMgcmV0dXJuZWRcblx0XHRcdFx0XHR0aGlzLnN0YXR1cyAgICAgPSBtb2NrSGFuZGxlci5zdGF0dXM7XG5cdFx0XHRcdFx0dGhpcy5zdGF0dXNUZXh0ID0gbW9ja0hhbmRsZXIuc3RhdHVzVGV4dDtcblx0XHRcdFx0XHR0aGlzLnJlYWR5U3RhdGVcdD0gNDtcblxuXHRcdFx0XHRcdC8vIFdlIGhhdmUgYW4gZXhlY3V0YWJsZSBmdW5jdGlvbiwgY2FsbCBpdCB0byBnaXZlXG5cdFx0XHRcdFx0Ly8gdGhlIG1vY2sgaGFuZGxlciBhIGNoYW5jZSB0byB1cGRhdGUgaXQncyBkYXRhXG5cdFx0XHRcdFx0aWYgKCAkLmlzRnVuY3Rpb24obW9ja0hhbmRsZXIucmVzcG9uc2UpICkge1xuXHRcdFx0XHRcdFx0bW9ja0hhbmRsZXIucmVzcG9uc2Uob3JpZ1NldHRpbmdzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gQ29weSBvdmVyIG91ciBtb2NrIHRvIG91ciB4aHIgb2JqZWN0IGJlZm9yZSBwYXNzaW5nIGNvbnRyb2wgYmFjayB0b1xuXHRcdFx0XHRcdC8vIGpRdWVyeSdzIG9ucmVhZHlzdGF0ZWNoYW5nZSBjYWxsYmFja1xuXHRcdFx0XHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlID09ICdqc29uJyAmJiAoIHR5cGVvZiBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgPT0gJ29iamVjdCcgKSApIHtcblx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2VUZXh0ID0gSlNPTi5zdHJpbmdpZnkobW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0KTtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKCByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgPT0gJ3htbCcgKSB7XG5cdFx0XHRcdFx0XHRpZiAoIHR5cGVvZiBtb2NrSGFuZGxlci5yZXNwb25zZVhNTCA9PSAnc3RyaW5nJyApIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5yZXNwb25zZVhNTCA9IHBhcnNlWE1MKG1vY2tIYW5kbGVyLnJlc3BvbnNlWE1MKTtcblx0XHRcdFx0XHRcdFx0Ly9pbiBqUXVlcnkgMS45LjErLCByZXNwb25zZVhNTCBpcyBwcm9jZXNzZWQgZGlmZmVyZW50bHkgYW5kIHJlbGllcyBvbiByZXNwb25zZVRleHRcblx0XHRcdFx0XHRcdFx0dGhpcy5yZXNwb25zZVRleHQgPSBtb2NrSGFuZGxlci5yZXNwb25zZVhNTDtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2VYTUwgPSBtb2NrSGFuZGxlci5yZXNwb25zZVhNTDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhpcy5yZXNwb25zZVRleHQgPSBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmKCB0eXBlb2YgbW9ja0hhbmRsZXIuc3RhdHVzID09ICdudW1iZXInIHx8IHR5cGVvZiBtb2NrSGFuZGxlci5zdGF0dXMgPT0gJ3N0cmluZycgKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnN0YXR1cyA9IG1vY2tIYW5kbGVyLnN0YXR1cztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYoIHR5cGVvZiBtb2NrSGFuZGxlci5zdGF0dXNUZXh0ID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnN0YXR1c1RleHQgPSBtb2NrSGFuZGxlci5zdGF0dXNUZXh0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBqUXVlcnkgMi4wIHJlbmFtZWQgb25yZWFkeXN0YXRlY2hhbmdlIHRvIG9ubG9hZFxuXHRcdFx0XHRcdG9uUmVhZHkgPSB0aGlzLm9ucmVhZHlzdGF0ZWNoYW5nZSB8fCB0aGlzLm9ubG9hZDtcblxuXHRcdFx0XHRcdC8vIGpRdWVyeSA8IDEuNCBkb2Vzbid0IGhhdmUgb25yZWFkeXN0YXRlIGNoYW5nZSBmb3IgeGhyXG5cdFx0XHRcdFx0aWYgKCAkLmlzRnVuY3Rpb24oIG9uUmVhZHkgKSApIHtcblx0XHRcdFx0XHRcdGlmKCBtb2NrSGFuZGxlci5pc1RpbWVvdXQpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5zdGF0dXMgPSAtMTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG9uUmVhZHkuY2FsbCggdGhpcywgbW9ja0hhbmRsZXIuaXNUaW1lb3V0ID8gJ3RpbWVvdXQnIDogdW5kZWZpbmVkICk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmICggbW9ja0hhbmRsZXIuaXNUaW1lb3V0ICkge1xuXHRcdFx0XHRcdFx0Ly8gRml4IGZvciAxLjMuMiB0aW1lb3V0IHRvIGtlZXAgc3VjY2VzcyBmcm9tIGZpcmluZy5cblx0XHRcdFx0XHRcdHRoaXMuc3RhdHVzID0gLTE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KS5hcHBseSh0aGF0KTtcblx0XHRcdH07XG5cdFx0fSkodGhpcyk7XG5cblx0XHRpZiAoIG1vY2tIYW5kbGVyLnByb3h5ICkge1xuXHRcdFx0Ly8gV2UncmUgcHJveHlpbmcgdGhpcyByZXF1ZXN0IGFuZCBsb2FkaW5nIGluIGFuIGV4dGVybmFsIGZpbGUgaW5zdGVhZFxuXHRcdFx0X2FqYXgoe1xuXHRcdFx0XHRnbG9iYWw6IGZhbHNlLFxuXHRcdFx0XHR1cmw6IG1vY2tIYW5kbGVyLnByb3h5LFxuXHRcdFx0XHR0eXBlOiBtb2NrSGFuZGxlci5wcm94eVR5cGUsXG5cdFx0XHRcdGRhdGE6IG1vY2tIYW5kbGVyLmRhdGEsXG5cdFx0XHRcdGRhdGFUeXBlOiByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUgPT09IFwic2NyaXB0XCIgPyBcInRleHQvcGxhaW5cIiA6IHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSxcblx0XHRcdFx0Y29tcGxldGU6IGZ1bmN0aW9uKHhocikge1xuXHRcdFx0XHRcdG1vY2tIYW5kbGVyLnJlc3BvbnNlWE1MID0geGhyLnJlc3BvbnNlWE1MO1xuXHRcdFx0XHRcdG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCA9IHhoci5yZXNwb25zZVRleHQ7XG4gICAgICAgICAgICAgICAgICAgIC8vIERvbid0IG92ZXJyaWRlIHRoZSBoYW5kbGVyIHN0YXR1cy9zdGF0dXNUZXh0IGlmIGl0J3Mgc3BlY2lmaWVkIGJ5IHRoZSBjb25maWdcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzRGVmYXVsdFNldHRpbmcobW9ja0hhbmRsZXIsICdzdGF0dXMnKSkge1xuXHRcdFx0XHRcdCAgICBtb2NrSGFuZGxlci5zdGF0dXMgPSB4aHIuc3RhdHVzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0RlZmF1bHRTZXR0aW5nKG1vY2tIYW5kbGVyLCAnc3RhdHVzVGV4dCcpKSB7XG5cdFx0XHRcdFx0ICAgIG1vY2tIYW5kbGVyLnN0YXR1c1RleHQgPSB4aHIuc3RhdHVzVGV4dDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG5cdFx0XHRcdFx0dGhpcy5yZXNwb25zZVRpbWVyID0gc2V0VGltZW91dChwcm9jZXNzLCBtb2NrSGFuZGxlci5yZXNwb25zZVRpbWUgfHwgMCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyB0eXBlID09ICdQT1NUJyB8fCAnR0VUJyB8fCAnREVMRVRFJ1xuXHRcdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuYXN5bmMgPT09IGZhbHNlICkge1xuXHRcdFx0XHQvLyBUT0RPOiBCbG9ja2luZyBkZWxheVxuXHRcdFx0XHRwcm9jZXNzKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnJlc3BvbnNlVGltZXIgPSBzZXRUaW1lb3V0KHByb2Nlc3MsIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGltZSB8fCA1MCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gQ29uc3RydWN0IGEgbW9ja2VkIFhIUiBPYmplY3Rcblx0ZnVuY3Rpb24geGhyKG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncywgb3JpZ0hhbmRsZXIpIHtcblx0XHQvLyBFeHRlbmQgd2l0aCBvdXIgZGVmYXVsdCBtb2NramF4IHNldHRpbmdzXG5cdFx0bW9ja0hhbmRsZXIgPSAkLmV4dGVuZCh0cnVlLCB7fSwgJC5tb2NramF4U2V0dGluZ3MsIG1vY2tIYW5kbGVyKTtcblxuXHRcdGlmICh0eXBlb2YgbW9ja0hhbmRsZXIuaGVhZGVycyA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdG1vY2tIYW5kbGVyLmhlYWRlcnMgPSB7fTtcblx0XHR9XG5cdFx0aWYgKCBtb2NrSGFuZGxlci5jb250ZW50VHlwZSApIHtcblx0XHRcdG1vY2tIYW5kbGVyLmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddID0gbW9ja0hhbmRsZXIuY29udGVudFR5cGU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHN0YXR1czogbW9ja0hhbmRsZXIuc3RhdHVzLFxuXHRcdFx0c3RhdHVzVGV4dDogbW9ja0hhbmRsZXIuc3RhdHVzVGV4dCxcblx0XHRcdHJlYWR5U3RhdGU6IDEsXG5cdFx0XHRvcGVuOiBmdW5jdGlvbigpIHsgfSxcblx0XHRcdHNlbmQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRvcmlnSGFuZGxlci5maXJlZCA9IHRydWU7XG5cdFx0XHRcdF94aHJTZW5kLmNhbGwodGhpcywgbW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncywgb3JpZ1NldHRpbmdzKTtcblx0XHRcdH0sXG5cdFx0XHRhYm9ydDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGNsZWFyVGltZW91dCh0aGlzLnJlc3BvbnNlVGltZXIpO1xuXHRcdFx0fSxcblx0XHRcdHNldFJlcXVlc3RIZWFkZXI6IGZ1bmN0aW9uKGhlYWRlciwgdmFsdWUpIHtcblx0XHRcdFx0bW9ja0hhbmRsZXIuaGVhZGVyc1toZWFkZXJdID0gdmFsdWU7XG5cdFx0XHR9LFxuXHRcdFx0Z2V0UmVzcG9uc2VIZWFkZXI6IGZ1bmN0aW9uKGhlYWRlcikge1xuXHRcdFx0XHQvLyAnTGFzdC1tb2RpZmllZCcsICdFdGFnJywgJ2NvbnRlbnQtdHlwZScgYXJlIGFsbCBjaGVja2VkIGJ5IGpRdWVyeVxuXHRcdFx0XHRpZiAoIG1vY2tIYW5kbGVyLmhlYWRlcnMgJiYgbW9ja0hhbmRsZXIuaGVhZGVyc1toZWFkZXJdICkge1xuXHRcdFx0XHRcdC8vIFJldHVybiBhcmJpdHJhcnkgaGVhZGVyc1xuXHRcdFx0XHRcdHJldHVybiBtb2NrSGFuZGxlci5oZWFkZXJzW2hlYWRlcl07XG5cdFx0XHRcdH0gZWxzZSBpZiAoIGhlYWRlci50b0xvd2VyQ2FzZSgpID09ICdsYXN0LW1vZGlmaWVkJyApIHtcblx0XHRcdFx0XHRyZXR1cm4gbW9ja0hhbmRsZXIubGFzdE1vZGlmaWVkIHx8IChuZXcgRGF0ZSgpKS50b1N0cmluZygpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCBoZWFkZXIudG9Mb3dlckNhc2UoKSA9PSAnZXRhZycgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG1vY2tIYW5kbGVyLmV0YWcgfHwgJyc7XG5cdFx0XHRcdH0gZWxzZSBpZiAoIGhlYWRlci50b0xvd2VyQ2FzZSgpID09ICdjb250ZW50LXR5cGUnICkge1xuXHRcdFx0XHRcdHJldHVybiBtb2NrSGFuZGxlci5jb250ZW50VHlwZSB8fCAndGV4dC9wbGFpbic7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRnZXRBbGxSZXNwb25zZUhlYWRlcnM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgaGVhZGVycyA9ICcnO1xuXHRcdFx0XHQkLmVhY2gobW9ja0hhbmRsZXIuaGVhZGVycywgZnVuY3Rpb24oaywgdikge1xuXHRcdFx0XHRcdGhlYWRlcnMgKz0gayArICc6ICcgKyB2ICsgXCJcXG5cIjtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHJldHVybiBoZWFkZXJzO1xuXHRcdFx0fVxuXHRcdH07XG5cdH1cblxuXHQvLyBQcm9jZXNzIGEgSlNPTlAgbW9jayByZXF1ZXN0LlxuXHRmdW5jdGlvbiBwcm9jZXNzSnNvbnBNb2NrKCByZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MgKSB7XG5cdFx0Ly8gSGFuZGxlIEpTT05QIFBhcmFtZXRlciBDYWxsYmFja3MsIHdlIG5lZWQgdG8gcmVwbGljYXRlIHNvbWUgb2YgdGhlIGpRdWVyeSBjb3JlIGhlcmVcblx0XHQvLyBiZWNhdXNlIHRoZXJlIGlzbid0IGFuIGVhc3kgaG9vayBmb3IgdGhlIGNyb3NzIGRvbWFpbiBzY3JpcHQgdGFnIG9mIGpzb25wXG5cblx0XHRwcm9jZXNzSnNvbnBVcmwoIHJlcXVlc3RTZXR0aW5ncyApO1xuXG5cdFx0cmVxdWVzdFNldHRpbmdzLmRhdGFUeXBlID0gXCJqc29uXCI7XG5cdFx0aWYocmVxdWVzdFNldHRpbmdzLmRhdGEgJiYgQ0FMTEJBQ0tfUkVHRVgudGVzdChyZXF1ZXN0U2V0dGluZ3MuZGF0YSkgfHwgQ0FMTEJBQ0tfUkVHRVgudGVzdChyZXF1ZXN0U2V0dGluZ3MudXJsKSkge1xuXHRcdFx0Y3JlYXRlSnNvbnBDYWxsYmFjayhyZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MpO1xuXG5cdFx0XHQvLyBXZSBuZWVkIHRvIG1ha2Ugc3VyZVxuXHRcdFx0Ly8gdGhhdCBhIEpTT05QIHN0eWxlIHJlc3BvbnNlIGlzIGV4ZWN1dGVkIHByb3Blcmx5XG5cblx0XHRcdHZhciBydXJsID0gL14oXFx3KzopP1xcL1xcLyhbXlxcLz8jXSspLyxcblx0XHRcdFx0cGFydHMgPSBydXJsLmV4ZWMoIHJlcXVlc3RTZXR0aW5ncy51cmwgKSxcblx0XHRcdFx0cmVtb3RlID0gcGFydHMgJiYgKHBhcnRzWzFdICYmIHBhcnRzWzFdICE9PSBsb2NhdGlvbi5wcm90b2NvbCB8fCBwYXJ0c1syXSAhPT0gbG9jYXRpb24uaG9zdCk7XG5cblx0XHRcdHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSA9IFwic2NyaXB0XCI7XG5cdFx0XHRpZihyZXF1ZXN0U2V0dGluZ3MudHlwZS50b1VwcGVyQ2FzZSgpID09PSBcIkdFVFwiICYmIHJlbW90ZSApIHtcblx0XHRcdFx0dmFyIG5ld01vY2tSZXR1cm4gPSBwcm9jZXNzSnNvbnBSZXF1ZXN0KCByZXF1ZXN0U2V0dGluZ3MsIG1vY2tIYW5kbGVyLCBvcmlnU2V0dGluZ3MgKTtcblxuXHRcdFx0XHQvLyBDaGVjayBpZiB3ZSBhcmUgc3VwcG9zZWQgdG8gcmV0dXJuIGEgRGVmZXJyZWQgYmFjayB0byB0aGUgbW9jayBjYWxsLCBvciBqdXN0XG5cdFx0XHRcdC8vIHNpZ25hbCBzdWNjZXNzXG5cdFx0XHRcdGlmKG5ld01vY2tSZXR1cm4pIHtcblx0XHRcdFx0XHRyZXR1cm4gbmV3TW9ja1JldHVybjtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdC8vIEFwcGVuZCB0aGUgcmVxdWlyZWQgY2FsbGJhY2sgcGFyYW1ldGVyIHRvIHRoZSBlbmQgb2YgdGhlIHJlcXVlc3QgVVJMLCBmb3IgYSBKU09OUCByZXF1ZXN0XG5cdGZ1bmN0aW9uIHByb2Nlc3NKc29ucFVybCggcmVxdWVzdFNldHRpbmdzICkge1xuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLnR5cGUudG9VcHBlckNhc2UoKSA9PT0gXCJHRVRcIiApIHtcblx0XHRcdGlmICggIUNBTExCQUNLX1JFR0VYLnRlc3QoIHJlcXVlc3RTZXR0aW5ncy51cmwgKSApIHtcblx0XHRcdFx0cmVxdWVzdFNldHRpbmdzLnVybCArPSAoL1xcPy8udGVzdCggcmVxdWVzdFNldHRpbmdzLnVybCApID8gXCImXCIgOiBcIj9cIikgK1xuXHRcdFx0XHRcdChyZXF1ZXN0U2V0dGluZ3MuanNvbnAgfHwgXCJjYWxsYmFja1wiKSArIFwiPT9cIjtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKCAhcmVxdWVzdFNldHRpbmdzLmRhdGEgfHwgIUNBTExCQUNLX1JFR0VYLnRlc3QocmVxdWVzdFNldHRpbmdzLmRhdGEpICkge1xuXHRcdFx0cmVxdWVzdFNldHRpbmdzLmRhdGEgPSAocmVxdWVzdFNldHRpbmdzLmRhdGEgPyByZXF1ZXN0U2V0dGluZ3MuZGF0YSArIFwiJlwiIDogXCJcIikgKyAocmVxdWVzdFNldHRpbmdzLmpzb25wIHx8IFwiY2FsbGJhY2tcIikgKyBcIj0/XCI7XG5cdFx0fVxuXHR9XG5cblx0Ly8gUHJvY2VzcyBhIEpTT05QIHJlcXVlc3QgYnkgZXZhbHVhdGluZyB0aGUgbW9ja2VkIHJlc3BvbnNlIHRleHRcblx0ZnVuY3Rpb24gcHJvY2Vzc0pzb25wUmVxdWVzdCggcmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzICkge1xuXHRcdC8vIFN5bnRoZXNpemUgdGhlIG1vY2sgcmVxdWVzdCBmb3IgYWRkaW5nIGEgc2NyaXB0IHRhZ1xuXHRcdHZhciBjYWxsYmFja0NvbnRleHQgPSBvcmlnU2V0dGluZ3MgJiYgb3JpZ1NldHRpbmdzLmNvbnRleHQgfHwgcmVxdWVzdFNldHRpbmdzLFxuXHRcdFx0bmV3TW9jayA9IG51bGw7XG5cblxuXHRcdC8vIElmIHRoZSByZXNwb25zZSBoYW5kbGVyIG9uIHRoZSBtb29jayBpcyBhIGZ1bmN0aW9uLCBjYWxsIGl0XG5cdFx0aWYgKCBtb2NrSGFuZGxlci5yZXNwb25zZSAmJiAkLmlzRnVuY3Rpb24obW9ja0hhbmRsZXIucmVzcG9uc2UpICkge1xuXHRcdFx0bW9ja0hhbmRsZXIucmVzcG9uc2Uob3JpZ1NldHRpbmdzKTtcblx0XHR9IGVsc2Uge1xuXG5cdFx0XHQvLyBFdmFsdWF0ZSB0aGUgcmVzcG9uc2VUZXh0IGphdmFzY3JpcHQgaW4gYSBnbG9iYWwgY29udGV4dFxuXHRcdFx0aWYoIHR5cGVvZiBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgPT09ICdvYmplY3QnICkge1xuXHRcdFx0XHQkLmdsb2JhbEV2YWwoICcoJyArIEpTT04uc3RyaW5naWZ5KCBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgKSArICcpJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkLmdsb2JhbEV2YWwoICcoJyArIG1vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dCArICcpJyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gU3VjY2Vzc2Z1bCByZXNwb25zZVxuXHRcdGpzb25wU3VjY2VzcyggcmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyICk7XG5cdFx0anNvbnBDb21wbGV0ZSggcmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyICk7XG5cblx0XHQvLyBJZiB3ZSBhcmUgcnVubmluZyB1bmRlciBqUXVlcnkgMS41KywgcmV0dXJuIGEgZGVmZXJyZWQgb2JqZWN0XG5cdFx0aWYoJC5EZWZlcnJlZCl7XG5cdFx0XHRuZXdNb2NrID0gbmV3ICQuRGVmZXJyZWQoKTtcblx0XHRcdGlmKHR5cGVvZiBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgPT0gXCJvYmplY3RcIil7XG5cdFx0XHRcdG5ld01vY2sucmVzb2x2ZVdpdGgoIGNhbGxiYWNrQ29udGV4dCwgW21vY2tIYW5kbGVyLnJlc3BvbnNlVGV4dF0gKTtcblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdG5ld01vY2sucmVzb2x2ZVdpdGgoIGNhbGxiYWNrQ29udGV4dCwgWyQucGFyc2VKU09OKCBtb2NrSGFuZGxlci5yZXNwb25zZVRleHQgKV0gKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG5ld01vY2s7XG5cdH1cblxuXG5cdC8vIENyZWF0ZSB0aGUgcmVxdWlyZWQgSlNPTlAgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIHRoZSByZXF1ZXN0XG5cdGZ1bmN0aW9uIGNyZWF0ZUpzb25wQ2FsbGJhY2soIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyApIHtcblx0XHR2YXIgY2FsbGJhY2tDb250ZXh0ID0gb3JpZ1NldHRpbmdzICYmIG9yaWdTZXR0aW5ncy5jb250ZXh0IHx8IHJlcXVlc3RTZXR0aW5ncztcblx0XHR2YXIganNvbnAgPSByZXF1ZXN0U2V0dGluZ3MuanNvbnBDYWxsYmFjayB8fCAoXCJqc29ucFwiICsganNjKyspO1xuXG5cdFx0Ly8gUmVwbGFjZSB0aGUgPT8gc2VxdWVuY2UgYm90aCBpbiB0aGUgcXVlcnkgc3RyaW5nIGFuZCB0aGUgZGF0YVxuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmRhdGEgKSB7XG5cdFx0XHRyZXF1ZXN0U2V0dGluZ3MuZGF0YSA9IChyZXF1ZXN0U2V0dGluZ3MuZGF0YSArIFwiXCIpLnJlcGxhY2UoQ0FMTEJBQ0tfUkVHRVgsIFwiPVwiICsganNvbnAgKyBcIiQxXCIpO1xuXHRcdH1cblxuXHRcdHJlcXVlc3RTZXR0aW5ncy51cmwgPSByZXF1ZXN0U2V0dGluZ3MudXJsLnJlcGxhY2UoQ0FMTEJBQ0tfUkVHRVgsIFwiPVwiICsganNvbnAgKyBcIiQxXCIpO1xuXG5cblx0XHQvLyBIYW5kbGUgSlNPTlAtc3R5bGUgbG9hZGluZ1xuXHRcdHdpbmRvd1sganNvbnAgXSA9IHdpbmRvd1sganNvbnAgXSB8fCBmdW5jdGlvbiggdG1wICkge1xuXHRcdFx0ZGF0YSA9IHRtcDtcblx0XHRcdGpzb25wU3VjY2VzcyggcmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyICk7XG5cdFx0XHRqc29ucENvbXBsZXRlKCByZXF1ZXN0U2V0dGluZ3MsIGNhbGxiYWNrQ29udGV4dCwgbW9ja0hhbmRsZXIgKTtcblx0XHRcdC8vIEdhcmJhZ2UgY29sbGVjdFxuXHRcdFx0d2luZG93WyBqc29ucCBdID0gdW5kZWZpbmVkO1xuXG5cdFx0XHR0cnkge1xuXHRcdFx0XHRkZWxldGUgd2luZG93WyBqc29ucCBdO1xuXHRcdFx0fSBjYXRjaChlKSB7fVxuXG5cdFx0XHRpZiAoIGhlYWQgKSB7XG5cdFx0XHRcdGhlYWQucmVtb3ZlQ2hpbGQoIHNjcmlwdCApO1xuXHRcdFx0fVxuXHRcdH07XG5cdH1cblxuXHQvLyBUaGUgSlNPTlAgcmVxdWVzdCB3YXMgc3VjY2Vzc2Z1bFxuXHRmdW5jdGlvbiBqc29ucFN1Y2Nlc3MocmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQsIG1vY2tIYW5kbGVyKSB7XG5cdFx0Ly8gSWYgYSBsb2NhbCBjYWxsYmFjayB3YXMgc3BlY2lmaWVkLCBmaXJlIGl0IGFuZCBwYXNzIGl0IHRoZSBkYXRhXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3Muc3VjY2VzcyApIHtcblx0XHRcdHJlcXVlc3RTZXR0aW5ncy5zdWNjZXNzLmNhbGwoIGNhbGxiYWNrQ29udGV4dCwgbW9ja0hhbmRsZXIucmVzcG9uc2VUZXh0IHx8IFwiXCIsIHN0YXR1cywge30gKTtcblx0XHR9XG5cblx0XHQvLyBGaXJlIHRoZSBnbG9iYWwgY2FsbGJhY2tcblx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5nbG9iYWwgKSB7XG5cdFx0XHR0cmlnZ2VyKHJlcXVlc3RTZXR0aW5ncywgXCJhamF4U3VjY2Vzc1wiLCBbe30sIHJlcXVlc3RTZXR0aW5nc10gKTtcblx0XHR9XG5cdH1cblxuXHQvLyBUaGUgSlNPTlAgcmVxdWVzdCB3YXMgY29tcGxldGVkXG5cdGZ1bmN0aW9uIGpzb25wQ29tcGxldGUocmVxdWVzdFNldHRpbmdzLCBjYWxsYmFja0NvbnRleHQpIHtcblx0XHQvLyBQcm9jZXNzIHJlc3VsdFxuXHRcdGlmICggcmVxdWVzdFNldHRpbmdzLmNvbXBsZXRlICkge1xuXHRcdFx0cmVxdWVzdFNldHRpbmdzLmNvbXBsZXRlLmNhbGwoIGNhbGxiYWNrQ29udGV4dCwge30gLCBzdGF0dXMgKTtcblx0XHR9XG5cblx0XHQvLyBUaGUgcmVxdWVzdCB3YXMgY29tcGxldGVkXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZ2xvYmFsICkge1xuXHRcdFx0dHJpZ2dlciggXCJhamF4Q29tcGxldGVcIiwgW3t9LCByZXF1ZXN0U2V0dGluZ3NdICk7XG5cdFx0fVxuXG5cdFx0Ly8gSGFuZGxlIHRoZSBnbG9iYWwgQUpBWCBjb3VudGVyXG5cdFx0aWYgKCByZXF1ZXN0U2V0dGluZ3MuZ2xvYmFsICYmICEgLS0kLmFjdGl2ZSApIHtcblx0XHRcdCQuZXZlbnQudHJpZ2dlciggXCJhamF4U3RvcFwiICk7XG5cdFx0fVxuXHR9XG5cblxuXHQvLyBUaGUgY29yZSAkLmFqYXggcmVwbGFjZW1lbnQuXG5cdGZ1bmN0aW9uIGhhbmRsZUFqYXgoIHVybCwgb3JpZ1NldHRpbmdzICkge1xuXHRcdHZhciBtb2NrUmVxdWVzdCwgcmVxdWVzdFNldHRpbmdzLCBtb2NrSGFuZGxlcjtcblxuXHRcdC8vIElmIHVybCBpcyBhbiBvYmplY3QsIHNpbXVsYXRlIHByZS0xLjUgc2lnbmF0dXJlXG5cdFx0aWYgKCB0eXBlb2YgdXJsID09PSBcIm9iamVjdFwiICkge1xuXHRcdFx0b3JpZ1NldHRpbmdzID0gdXJsO1xuXHRcdFx0dXJsID0gdW5kZWZpbmVkO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyB3b3JrIGFyb3VuZCB0byBzdXBwb3J0IDEuNSBzaWduYXR1cmVcblx0XHRcdG9yaWdTZXR0aW5ncyA9IG9yaWdTZXR0aW5ncyB8fCB7fTtcblx0XHRcdG9yaWdTZXR0aW5ncy51cmwgPSB1cmw7XG5cdFx0fVxuXG5cdFx0Ly8gRXh0ZW5kIHRoZSBvcmlnaW5hbCBzZXR0aW5ncyBmb3IgdGhlIHJlcXVlc3Rcblx0XHRyZXF1ZXN0U2V0dGluZ3MgPSAkLmV4dGVuZCh0cnVlLCB7fSwgJC5hamF4U2V0dGluZ3MsIG9yaWdTZXR0aW5ncyk7XG5cblx0XHQvLyBJdGVyYXRlIG92ZXIgb3VyIG1vY2sgaGFuZGxlcnMgKGluIHJlZ2lzdHJhdGlvbiBvcmRlcikgdW50aWwgd2UgZmluZFxuXHRcdC8vIG9uZSB0aGF0IGlzIHdpbGxpbmcgdG8gaW50ZXJjZXB0IHRoZSByZXF1ZXN0XG5cdFx0Zm9yKHZhciBrID0gMDsgayA8IG1vY2tIYW5kbGVycy5sZW5ndGg7IGsrKykge1xuXHRcdFx0aWYgKCAhbW9ja0hhbmRsZXJzW2tdICkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0bW9ja0hhbmRsZXIgPSBnZXRNb2NrRm9yUmVxdWVzdCggbW9ja0hhbmRsZXJzW2tdLCByZXF1ZXN0U2V0dGluZ3MgKTtcblx0XHRcdGlmKCFtb2NrSGFuZGxlcikge1xuXHRcdFx0XHQvLyBObyB2YWxpZCBtb2NrIGZvdW5kIGZvciB0aGlzIHJlcXVlc3Rcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdG1vY2tlZEFqYXhDYWxscy5wdXNoKHJlcXVlc3RTZXR0aW5ncyk7XG5cblx0XHRcdC8vIElmIGxvZ2dpbmcgaXMgZW5hYmxlZCwgbG9nIHRoZSBtb2NrIHRvIHRoZSBjb25zb2xlXG5cdFx0XHQkLm1vY2tqYXhTZXR0aW5ncy5sb2coIG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MgKTtcblxuXG5cdFx0XHRpZiAoIHJlcXVlc3RTZXR0aW5ncy5kYXRhVHlwZSAmJiByZXF1ZXN0U2V0dGluZ3MuZGF0YVR5cGUudG9VcHBlckNhc2UoKSA9PT0gJ0pTT05QJyApIHtcblx0XHRcdFx0aWYgKChtb2NrUmVxdWVzdCA9IHByb2Nlc3NKc29ucE1vY2soIHJlcXVlc3RTZXR0aW5ncywgbW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncyApKSkge1xuXHRcdFx0XHRcdC8vIFRoaXMgbW9jayB3aWxsIGhhbmRsZSB0aGUgSlNPTlAgcmVxdWVzdFxuXHRcdFx0XHRcdHJldHVybiBtb2NrUmVxdWVzdDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cblx0XHRcdC8vIFJlbW92ZWQgdG8gZml4ICM1NCAtIGtlZXAgdGhlIG1vY2tpbmcgZGF0YSBvYmplY3QgaW50YWN0XG5cdFx0XHQvL21vY2tIYW5kbGVyLmRhdGEgPSByZXF1ZXN0U2V0dGluZ3MuZGF0YTtcblxuXHRcdFx0bW9ja0hhbmRsZXIuY2FjaGUgPSByZXF1ZXN0U2V0dGluZ3MuY2FjaGU7XG5cdFx0XHRtb2NrSGFuZGxlci50aW1lb3V0ID0gcmVxdWVzdFNldHRpbmdzLnRpbWVvdXQ7XG5cdFx0XHRtb2NrSGFuZGxlci5nbG9iYWwgPSByZXF1ZXN0U2V0dGluZ3MuZ2xvYmFsO1xuXG5cdFx0XHRjb3B5VXJsUGFyYW1ldGVycyhtb2NrSGFuZGxlciwgb3JpZ1NldHRpbmdzKTtcblxuXHRcdFx0KGZ1bmN0aW9uKG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncywgb3JpZ0hhbmRsZXIpIHtcblx0XHRcdFx0bW9ja1JlcXVlc3QgPSBfYWpheC5jYWxsKCQsICQuZXh0ZW5kKHRydWUsIHt9LCBvcmlnU2V0dGluZ3MsIHtcblx0XHRcdFx0XHQvLyBNb2NrIHRoZSBYSFIgb2JqZWN0XG5cdFx0XHRcdFx0eGhyOiBmdW5jdGlvbigpIHsgcmV0dXJuIHhociggbW9ja0hhbmRsZXIsIHJlcXVlc3RTZXR0aW5ncywgb3JpZ1NldHRpbmdzLCBvcmlnSGFuZGxlciApOyB9XG5cdFx0XHRcdH0pKTtcblx0XHRcdH0pKG1vY2tIYW5kbGVyLCByZXF1ZXN0U2V0dGluZ3MsIG9yaWdTZXR0aW5ncywgbW9ja0hhbmRsZXJzW2tdKTtcblxuXHRcdFx0cmV0dXJuIG1vY2tSZXF1ZXN0O1xuXHRcdH1cblxuXHRcdC8vIFdlIGRvbid0IGhhdmUgYSBtb2NrIHJlcXVlc3Rcblx0XHRpZigkLm1vY2tqYXhTZXR0aW5ncy50aHJvd1VubW9ja2VkID09PSB0cnVlKSB7XG5cdFx0XHR0aHJvdygnQUpBWCBub3QgbW9ja2VkOiAnICsgb3JpZ1NldHRpbmdzLnVybCk7XG5cdFx0fVxuXHRcdGVsc2UgeyAvLyB0cmlnZ2VyIGEgbm9ybWFsIHJlcXVlc3Rcblx0XHRcdHJldHVybiBfYWpheC5hcHBseSgkLCBbb3JpZ1NldHRpbmdzXSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCogQ29waWVzIFVSTCBwYXJhbWV0ZXIgdmFsdWVzIGlmIHRoZXkgd2VyZSBjYXB0dXJlZCBieSBhIHJlZ3VsYXIgZXhwcmVzc2lvblxuXHQqIEBwYXJhbSB7T2JqZWN0fSBtb2NrSGFuZGxlclxuXHQqIEBwYXJhbSB7T2JqZWN0fSBvcmlnU2V0dGluZ3Ncblx0Ki9cblx0ZnVuY3Rpb24gY29weVVybFBhcmFtZXRlcnMobW9ja0hhbmRsZXIsIG9yaWdTZXR0aW5ncykge1xuXHRcdC8vcGFyYW1ldGVycyBhcmVuJ3QgY2FwdHVyZWQgaWYgdGhlIFVSTCBpc24ndCBhIFJlZ0V4cFxuXHRcdGlmICghKG1vY2tIYW5kbGVyLnVybCBpbnN0YW5jZW9mIFJlZ0V4cCkpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Ly9pZiBubyBVUkwgcGFyYW1zIHdlcmUgZGVmaW5lZCBvbiB0aGUgaGFuZGxlciwgZG9uJ3QgYXR0ZW1wdCBhIGNhcHR1cmVcblx0XHRpZiAoIW1vY2tIYW5kbGVyLmhhc093blByb3BlcnR5KCd1cmxQYXJhbXMnKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR2YXIgY2FwdHVyZXMgPSBtb2NrSGFuZGxlci51cmwuZXhlYyhvcmlnU2V0dGluZ3MudXJsKTtcblx0XHQvL3RoZSB3aG9sZSBSZWdFeHAgbWF0Y2ggaXMgYWx3YXlzIHRoZSBmaXJzdCB2YWx1ZSBpbiB0aGUgY2FwdHVyZSByZXN1bHRzXG5cdFx0aWYgKGNhcHR1cmVzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjYXB0dXJlcy5zaGlmdCgpO1xuXHRcdC8vdXNlIGhhbmRsZXIgcGFyYW1zIGFzIGtleXMgYW5kIGNhcHR1cmUgcmVzdXRzIGFzIHZhbHVlc1xuXHRcdHZhciBpID0gMCxcblx0XHRjYXB0dXJlc0xlbmd0aCA9IGNhcHR1cmVzLmxlbmd0aCxcblx0XHRwYXJhbXNMZW5ndGggPSBtb2NrSGFuZGxlci51cmxQYXJhbXMubGVuZ3RoLFxuXHRcdC8vaW4gY2FzZSB0aGUgbnVtYmVyIG9mIHBhcmFtcyBzcGVjaWZpZWQgaXMgbGVzcyB0aGFuIGFjdHVhbCBjYXB0dXJlc1xuXHRcdG1heEl0ZXJhdGlvbnMgPSBNYXRoLm1pbihjYXB0dXJlc0xlbmd0aCwgcGFyYW1zTGVuZ3RoKSxcblx0XHRwYXJhbVZhbHVlcyA9IHt9O1xuXHRcdGZvciAoaTsgaSA8IG1heEl0ZXJhdGlvbnM7IGkrKykge1xuXHRcdFx0dmFyIGtleSA9IG1vY2tIYW5kbGVyLnVybFBhcmFtc1tpXTtcblx0XHRcdHBhcmFtVmFsdWVzW2tleV0gPSBjYXB0dXJlc1tpXTtcblx0XHR9XG5cdFx0b3JpZ1NldHRpbmdzLnVybFBhcmFtcyA9IHBhcmFtVmFsdWVzO1xuXHR9XG5cblxuXHQvLyBQdWJsaWNcblxuXHQkLmV4dGVuZCh7XG5cdFx0YWpheDogaGFuZGxlQWpheFxuXHR9KTtcblxuXHQkLm1vY2tqYXhTZXR0aW5ncyA9IHtcblx0XHQvL3VybDogICAgICAgIG51bGwsXG5cdFx0Ly90eXBlOiAgICAgICAnR0VUJyxcblx0XHRsb2c6ICAgICAgICAgIGZ1bmN0aW9uKCBtb2NrSGFuZGxlciwgcmVxdWVzdFNldHRpbmdzICkge1xuXHRcdFx0aWYgKCBtb2NrSGFuZGxlci5sb2dnaW5nID09PSBmYWxzZSB8fFxuXHRcdFx0XHQgKCB0eXBlb2YgbW9ja0hhbmRsZXIubG9nZ2luZyA9PT0gJ3VuZGVmaW5lZCcgJiYgJC5tb2NramF4U2V0dGluZ3MubG9nZ2luZyA9PT0gZmFsc2UgKSApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCB3aW5kb3cuY29uc29sZSAmJiBjb25zb2xlLmxvZyApIHtcblx0XHRcdFx0dmFyIG1lc3NhZ2UgPSAnTU9DSyAnICsgcmVxdWVzdFNldHRpbmdzLnR5cGUudG9VcHBlckNhc2UoKSArICc6ICcgKyByZXF1ZXN0U2V0dGluZ3MudXJsO1xuXHRcdFx0XHR2YXIgcmVxdWVzdCA9ICQuZXh0ZW5kKHt9LCByZXF1ZXN0U2V0dGluZ3MpO1xuXG5cdFx0XHRcdGlmICh0eXBlb2YgY29uc29sZS5sb2cgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhtZXNzYWdlLCByZXF1ZXN0KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coIG1lc3NhZ2UgKyAnICcgKyBKU09OLnN0cmluZ2lmeShyZXF1ZXN0KSApO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0bG9nZ2luZzogICAgICAgdHJ1ZSxcblx0XHRzdGF0dXM6ICAgICAgICAyMDAsXG5cdFx0c3RhdHVzVGV4dDogICAgXCJPS1wiLFxuXHRcdHJlc3BvbnNlVGltZTogIDUwMCxcblx0XHRpc1RpbWVvdXQ6ICAgICBmYWxzZSxcblx0XHR0aHJvd1VubW9ja2VkOiBmYWxzZSxcblx0XHRjb250ZW50VHlwZTogICAndGV4dC9wbGFpbicsXG5cdFx0cmVzcG9uc2U6ICAgICAgJycsXG5cdFx0cmVzcG9uc2VUZXh0OiAgJycsXG5cdFx0cmVzcG9uc2VYTUw6ICAgJycsXG5cdFx0cHJveHk6ICAgICAgICAgJycsXG5cdFx0cHJveHlUeXBlOiAgICAgJ0dFVCcsXG5cblx0XHRsYXN0TW9kaWZpZWQ6ICBudWxsLFxuXHRcdGV0YWc6ICAgICAgICAgICcnLFxuXHRcdGhlYWRlcnM6IHtcblx0XHRcdGV0YWc6ICdJSkZASCNAOTIzdWY4MDIzaEZPQEkjSCMnLFxuXHRcdFx0J2NvbnRlbnQtdHlwZScgOiAndGV4dC9wbGFpbidcblx0XHR9XG5cdH07XG5cblx0JC5tb2NramF4ID0gZnVuY3Rpb24oc2V0dGluZ3MpIHtcblx0XHR2YXIgaSA9IG1vY2tIYW5kbGVycy5sZW5ndGg7XG5cdFx0bW9ja0hhbmRsZXJzW2ldID0gc2V0dGluZ3M7XG5cdFx0cmV0dXJuIGk7XG5cdH07XG5cdCQubW9ja2pheENsZWFyID0gZnVuY3Rpb24oaSkge1xuXHRcdGlmICggYXJndW1lbnRzLmxlbmd0aCA9PSAxICkge1xuXHRcdFx0bW9ja0hhbmRsZXJzW2ldID0gbnVsbDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bW9ja0hhbmRsZXJzID0gW107XG5cdFx0fVxuXHRcdG1vY2tlZEFqYXhDYWxscyA9IFtdO1xuXHR9O1xuXHQkLm1vY2tqYXguaGFuZGxlciA9IGZ1bmN0aW9uKGkpIHtcblx0XHRpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT0gMSApIHtcblx0XHRcdHJldHVybiBtb2NrSGFuZGxlcnNbaV07XG5cdFx0fVxuXHR9O1xuXHQkLm1vY2tqYXgubW9ja2VkQWpheENhbGxzID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIG1vY2tlZEFqYXhDYWxscztcblx0fTtcbn0pKGpRdWVyeSk7IiwiLyoqXG4qICBBamF4IEF1dG9jb21wbGV0ZSBmb3IgalF1ZXJ5LCB2ZXJzaW9uICV2ZXJzaW9uJVxuKiAgKGMpIDIwMTUgVG9tYXMgS2lyZGFcbipcbiogIEFqYXggQXV0b2NvbXBsZXRlIGZvciBqUXVlcnkgaXMgZnJlZWx5IGRpc3RyaWJ1dGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIGFuIE1JVC1zdHlsZSBsaWNlbnNlLlxuKiAgRm9yIGRldGFpbHMsIHNlZSB0aGUgd2ViIHNpdGU6IGh0dHBzOi8vZ2l0aHViLmNvbS9kZXZicmlkZ2UvalF1ZXJ5LUF1dG9jb21wbGV0ZVxuKi9cblxuLypqc2xpbnQgIGJyb3dzZXI6IHRydWUsIHdoaXRlOiB0cnVlLCBwbHVzcGx1czogdHJ1ZSwgdmFyczogdHJ1ZSAqL1xuLypnbG9iYWwgZGVmaW5lLCB3aW5kb3csIGRvY3VtZW50LCBqUXVlcnksIGV4cG9ydHMsIHJlcXVpcmUgKi9cblxuLy8gRXhwb3NlIHBsdWdpbiBhcyBhbiBBTUQgbW9kdWxlIGlmIEFNRCBsb2FkZXIgaXMgcHJlc2VudDpcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5J10sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiByZXF1aXJlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIEJyb3dzZXJpZnlcbiAgICAgICAgZmFjdG9yeShyZXF1aXJlKCdqcXVlcnknKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgICAgIGZhY3RvcnkoalF1ZXJ5KTtcbiAgICB9XG59KGZ1bmN0aW9uICgkKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyXG4gICAgICAgIHV0aWxzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXNjYXBlUmVnRXhDaGFyczogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC9bXFwtXFxbXFxdXFwvXFx7XFx9XFwoXFwpXFwqXFwrXFw/XFwuXFxcXFxcXlxcJFxcfF0vZywgXCJcXFxcJCZcIik7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjcmVhdGVOb2RlOiBmdW5jdGlvbiAoY29udGFpbmVyQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgICAgICBkaXYuY2xhc3NOYW1lID0gY29udGFpbmVyQ2xhc3M7XG4gICAgICAgICAgICAgICAgICAgIGRpdi5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgICAgICAgICAgICAgIGRpdi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGl2O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0oKSksXG5cbiAgICAgICAga2V5cyA9IHtcbiAgICAgICAgICAgIEVTQzogMjcsXG4gICAgICAgICAgICBUQUI6IDksXG4gICAgICAgICAgICBSRVRVUk46IDEzLFxuICAgICAgICAgICAgTEVGVDogMzcsXG4gICAgICAgICAgICBVUDogMzgsXG4gICAgICAgICAgICBSSUdIVDogMzksXG4gICAgICAgICAgICBET1dOOiA0MFxuICAgICAgICB9O1xuXG4gICAgZnVuY3Rpb24gQXV0b2NvbXBsZXRlKGVsLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBub29wID0gZnVuY3Rpb24gKCkgeyB9LFxuICAgICAgICAgICAgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICBkZWZhdWx0cyA9IHtcbiAgICAgICAgICAgICAgICBhamF4U2V0dGluZ3M6IHt9LFxuICAgICAgICAgICAgICAgIGF1dG9TZWxlY3RGaXJzdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgYXBwZW5kVG86IGRvY3VtZW50LmJvZHksXG4gICAgICAgICAgICAgICAgc2VydmljZVVybDogbnVsbCxcbiAgICAgICAgICAgICAgICBsb29rdXA6IG51bGwsXG4gICAgICAgICAgICAgICAgb25TZWxlY3Q6IG51bGwsXG4gICAgICAgICAgICAgICAgd2lkdGg6ICdhdXRvJyxcbiAgICAgICAgICAgICAgICBtaW5DaGFyczogMSxcbiAgICAgICAgICAgICAgICBtYXhIZWlnaHQ6IDMwMCxcbiAgICAgICAgICAgICAgICBkZWZlclJlcXVlc3RCeTogMCxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHt9LFxuICAgICAgICAgICAgICAgIGZvcm1hdFJlc3VsdDogQXV0b2NvbXBsZXRlLmZvcm1hdFJlc3VsdCxcbiAgICAgICAgICAgICAgICBkZWxpbWl0ZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgekluZGV4OiA5OTk5LFxuICAgICAgICAgICAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgICAgICAgICAgIG5vQ2FjaGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG9uU2VhcmNoU3RhcnQ6IG5vb3AsXG4gICAgICAgICAgICAgICAgb25TZWFyY2hDb21wbGV0ZTogbm9vcCxcbiAgICAgICAgICAgICAgICBvblNlYXJjaEVycm9yOiBub29wLFxuICAgICAgICAgICAgICAgIHByZXNlcnZlSW5wdXQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lckNsYXNzOiAnYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb25zJyxcbiAgICAgICAgICAgICAgICB0YWJEaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgICAgICBjdXJyZW50UmVxdWVzdDogbnVsbCxcbiAgICAgICAgICAgICAgICB0cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0OiB0cnVlLFxuICAgICAgICAgICAgICAgIHByZXZlbnRCYWRRdWVyaWVzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGxvb2t1cEZpbHRlcjogZnVuY3Rpb24gKHN1Z2dlc3Rpb24sIG9yaWdpbmFsUXVlcnksIHF1ZXJ5TG93ZXJDYXNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdWdnZXN0aW9uLnZhbHVlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxdWVyeUxvd2VyQ2FzZSkgIT09IC0xO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcGFyYW1OYW1lOiAncXVlcnknLFxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybVJlc3VsdDogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0eXBlb2YgcmVzcG9uc2UgPT09ICdzdHJpbmcnID8gJC5wYXJzZUpTT04ocmVzcG9uc2UpIDogcmVzcG9uc2U7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzaG93Tm9TdWdnZXN0aW9uTm90aWNlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBub1N1Z2dlc3Rpb25Ob3RpY2U6ICdObyByZXN1bHRzJyxcbiAgICAgICAgICAgICAgICBvcmllbnRhdGlvbjogJ2JvdHRvbScsXG4gICAgICAgICAgICAgICAgZm9yY2VGaXhQb3NpdGlvbjogZmFsc2VcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgLy8gU2hhcmVkIHZhcmlhYmxlczpcbiAgICAgICAgdGhhdC5lbGVtZW50ID0gZWw7XG4gICAgICAgIHRoYXQuZWwgPSAkKGVsKTtcbiAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IFtdO1xuICAgICAgICB0aGF0LmJhZFF1ZXJpZXMgPSBbXTtcbiAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XG4gICAgICAgIHRoYXQuY3VycmVudFZhbHVlID0gdGhhdC5lbGVtZW50LnZhbHVlO1xuICAgICAgICB0aGF0LmludGVydmFsSWQgPSAwO1xuICAgICAgICB0aGF0LmNhY2hlZFJlc3BvbnNlID0ge307XG4gICAgICAgIHRoYXQub25DaGFuZ2VJbnRlcnZhbCA9IG51bGw7XG4gICAgICAgIHRoYXQub25DaGFuZ2UgPSBudWxsO1xuICAgICAgICB0aGF0LmlzTG9jYWwgPSBmYWxzZTtcbiAgICAgICAgdGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciA9IG51bGw7XG4gICAgICAgIHRoYXQubm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9IG51bGw7XG4gICAgICAgIHRoYXQub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBkZWZhdWx0cywgb3B0aW9ucyk7XG4gICAgICAgIHRoYXQuY2xhc3NlcyA9IHtcbiAgICAgICAgICAgIHNlbGVjdGVkOiAnYXV0b2NvbXBsZXRlLXNlbGVjdGVkJyxcbiAgICAgICAgICAgIHN1Z2dlc3Rpb246ICdhdXRvY29tcGxldGUtc3VnZ2VzdGlvbidcbiAgICAgICAgfTtcbiAgICAgICAgdGhhdC5oaW50ID0gbnVsbDtcbiAgICAgICAgdGhhdC5oaW50VmFsdWUgPSAnJztcbiAgICAgICAgdGhhdC5zZWxlY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIC8vIEluaXRpYWxpemUgYW5kIHNldCBvcHRpb25zOlxuICAgICAgICB0aGF0LmluaXRpYWxpemUoKTtcbiAgICAgICAgdGhhdC5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIEF1dG9jb21wbGV0ZS51dGlscyA9IHV0aWxzO1xuXG4gICAgJC5BdXRvY29tcGxldGUgPSBBdXRvY29tcGxldGU7XG5cbiAgICBBdXRvY29tcGxldGUuZm9ybWF0UmVzdWx0ID0gZnVuY3Rpb24gKHN1Z2dlc3Rpb24sIGN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAvLyBEbyBub3QgcmVwbGFjZSBhbnl0aGluZyBpZiB0aGVyZSBjdXJyZW50IHZhbHVlIGlzIGVtcHR5XG4gICAgICAgIGlmICghY3VycmVudFZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbi52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIHBhdHRlcm4gPSAnKCcgKyB1dGlscy5lc2NhcGVSZWdFeENoYXJzKGN1cnJlbnRWYWx1ZSkgKyAnKSc7XG5cbiAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb24udmFsdWVcbiAgICAgICAgICAgIC5yZXBsYWNlKG5ldyBSZWdFeHAocGF0dGVybiwgJ2dpJyksICc8c3Ryb25nPiQxPFxcL3N0cm9uZz4nKVxuICAgICAgICAgICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8mbHQ7KFxcLz9zdHJvbmcpJmd0Oy9nLCAnPCQxPicpO1xuICAgIH07XG5cbiAgICBBdXRvY29tcGxldGUucHJvdG90eXBlID0ge1xuXG4gICAgICAgIGtpbGxlckZuOiBudWxsLFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9uU2VsZWN0b3IgPSAnLicgKyB0aGF0LmNsYXNzZXMuc3VnZ2VzdGlvbixcbiAgICAgICAgICAgICAgICBzZWxlY3RlZCA9IHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lcjtcblxuICAgICAgICAgICAgLy8gUmVtb3ZlIGF1dG9jb21wbGV0ZSBhdHRyaWJ1dGUgdG8gcHJldmVudCBuYXRpdmUgc3VnZ2VzdGlvbnM6XG4gICAgICAgICAgICB0aGF0LmVsZW1lbnQuc2V0QXR0cmlidXRlKCdhdXRvY29tcGxldGUnLCAnb2ZmJyk7XG5cbiAgICAgICAgICAgIHRoYXQua2lsbGVyRm4gPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGlmICgkKGUudGFyZ2V0KS5jbG9zZXN0KCcuJyArIHRoYXQub3B0aW9ucy5jb250YWluZXJDbGFzcykubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQua2lsbFN1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZGlzYWJsZUtpbGxlckZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gaHRtbCgpIGRlYWxzIHdpdGggbWFueSB0eXBlczogaHRtbFN0cmluZyBvciBFbGVtZW50IG9yIEFycmF5IG9yIGpRdWVyeVxuICAgICAgICAgICAgdGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gJCgnPGRpdiBjbGFzcz1cImF1dG9jb21wbGV0ZS1uby1zdWdnZXN0aW9uXCI+PC9kaXY+JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5odG1sKHRoaXMub3B0aW9ucy5ub1N1Z2dlc3Rpb25Ob3RpY2UpLmdldCgwKTtcblxuICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciA9IEF1dG9jb21wbGV0ZS51dGlscy5jcmVhdGVOb2RlKG9wdGlvbnMuY29udGFpbmVyQ2xhc3MpO1xuXG4gICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpO1xuXG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kVG8ob3B0aW9ucy5hcHBlbmRUbyk7XG5cbiAgICAgICAgICAgIC8vIE9ubHkgc2V0IHdpZHRoIGlmIGl0IHdhcyBwcm92aWRlZDpcbiAgICAgICAgICAgIGlmIChvcHRpb25zLndpZHRoICE9PSAnYXV0bycpIHtcbiAgICAgICAgICAgICAgICBjb250YWluZXIud2lkdGgob3B0aW9ucy53aWR0aCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIExpc3RlbiBmb3IgbW91c2Ugb3ZlciBldmVudCBvbiBzdWdnZXN0aW9ucyBsaXN0OlxuICAgICAgICAgICAgY29udGFpbmVyLm9uKCdtb3VzZW92ZXIuYXV0b2NvbXBsZXRlJywgc3VnZ2VzdGlvblNlbGVjdG9yLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5hY3RpdmF0ZSgkKHRoaXMpLmRhdGEoJ2luZGV4JykpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIERlc2VsZWN0IGFjdGl2ZSBlbGVtZW50IHdoZW4gbW91c2UgbGVhdmVzIHN1Z2dlc3Rpb25zIGNvbnRhaW5lcjpcbiAgICAgICAgICAgIGNvbnRhaW5lci5vbignbW91c2VvdXQuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jaGlsZHJlbignLicgKyBzZWxlY3RlZCkucmVtb3ZlQ2xhc3Moc2VsZWN0ZWQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIExpc3RlbiBmb3IgY2xpY2sgZXZlbnQgb24gc3VnZ2VzdGlvbnMgbGlzdDpcbiAgICAgICAgICAgIGNvbnRhaW5lci5vbignY2xpY2suYXV0b2NvbXBsZXRlJywgc3VnZ2VzdGlvblNlbGVjdG9yLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QoJCh0aGlzKS5kYXRhKCdpbmRleCcpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uQ2FwdHVyZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhhdC52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS5hdXRvY29tcGxldGUnLCB0aGF0LmZpeFBvc2l0aW9uQ2FwdHVyZSk7XG5cbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2tleWRvd24uYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVByZXNzKGUpOyB9KTtcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2tleXVwLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlVcChlKTsgfSk7XG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdibHVyLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uICgpIHsgdGhhdC5vbkJsdXIoKTsgfSk7XG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdmb2N1cy5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoKSB7IHRoYXQub25Gb2N1cygpOyB9KTtcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2NoYW5nZS5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5VXAoZSk7IH0pO1xuICAgICAgICAgICAgdGhhdC5lbC5vbignaW5wdXQuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVVwKGUpOyB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkZvY3VzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuZWwudmFsKCkubGVuZ3RoID49IHRoYXQub3B0aW9ucy5taW5DaGFycykge1xuICAgICAgICAgICAgICAgIHRoYXQub25WYWx1ZUNoYW5nZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uQmx1cjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5lbmFibGVLaWxsZXJGbigpO1xuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgYWJvcnRBamF4OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICBpZiAodGhhdC5jdXJyZW50UmVxdWVzdCkge1xuICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0ID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXRPcHRpb25zOiBmdW5jdGlvbiAoc3VwcGxpZWRPcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucztcblxuICAgICAgICAgICAgJC5leHRlbmQob3B0aW9ucywgc3VwcGxpZWRPcHRpb25zKTtcblxuICAgICAgICAgICAgdGhhdC5pc0xvY2FsID0gJC5pc0FycmF5KG9wdGlvbnMubG9va3VwKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuaXNMb2NhbCkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMubG9va3VwID0gdGhhdC52ZXJpZnlTdWdnZXN0aW9uc0Zvcm1hdChvcHRpb25zLmxvb2t1cCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9wdGlvbnMub3JpZW50YXRpb24gPSB0aGF0LnZhbGlkYXRlT3JpZW50YXRpb24ob3B0aW9ucy5vcmllbnRhdGlvbiwgJ2JvdHRvbScpO1xuXG4gICAgICAgICAgICAvLyBBZGp1c3QgaGVpZ2h0LCB3aWR0aCBhbmQgei1pbmRleDpcbiAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuY3NzKHtcbiAgICAgICAgICAgICAgICAnbWF4LWhlaWdodCc6IG9wdGlvbnMubWF4SGVpZ2h0ICsgJ3B4JyxcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiBvcHRpb25zLndpZHRoICsgJ3B4JyxcbiAgICAgICAgICAgICAgICAnei1pbmRleCc6IG9wdGlvbnMuekluZGV4XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuXG4gICAgICAgIGNsZWFyQ2FjaGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuY2FjaGVkUmVzcG9uc2UgPSB7fTtcbiAgICAgICAgICAgIHRoaXMuYmFkUXVlcmllcyA9IFtdO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFyQ2FjaGUoKTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFZhbHVlID0gJyc7XG4gICAgICAgICAgICB0aGlzLnN1Z2dlc3Rpb25zID0gW107XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzYWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdGhhdC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XG4gICAgICAgICAgICB0aGF0LmFib3J0QWpheCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVuYWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZpeFBvc2l0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBVc2Ugb25seSB3aGVuIGNvbnRhaW5lciBoYXMgYWxyZWFkeSBpdHMgY29udGVudFxuXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgJGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXG4gICAgICAgICAgICAgICAgY29udGFpbmVyUGFyZW50ID0gJGNvbnRhaW5lci5wYXJlbnQoKS5nZXQoMCk7XG4gICAgICAgICAgICAvLyBGaXggcG9zaXRpb24gYXV0b21hdGljYWxseSB3aGVuIGFwcGVuZGVkIHRvIGJvZHkuXG4gICAgICAgICAgICAvLyBJbiBvdGhlciBjYXNlcyBmb3JjZSBwYXJhbWV0ZXIgbXVzdCBiZSBnaXZlbi5cbiAgICAgICAgICAgIGlmIChjb250YWluZXJQYXJlbnQgIT09IGRvY3VtZW50LmJvZHkgJiYgIXRoYXQub3B0aW9ucy5mb3JjZUZpeFBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDaG9vc2Ugb3JpZW50YXRpb25cbiAgICAgICAgICAgIHZhciBvcmllbnRhdGlvbiA9IHRoYXQub3B0aW9ucy5vcmllbnRhdGlvbixcbiAgICAgICAgICAgICAgICBjb250YWluZXJIZWlnaHQgPSAkY29udGFpbmVyLm91dGVySGVpZ2h0KCksXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gdGhhdC5lbC5vdXRlckhlaWdodCgpLFxuICAgICAgICAgICAgICAgIG9mZnNldCA9IHRoYXQuZWwub2Zmc2V0KCksXG4gICAgICAgICAgICAgICAgc3R5bGVzID0geyAndG9wJzogb2Zmc2V0LnRvcCwgJ2xlZnQnOiBvZmZzZXQubGVmdCB9O1xuXG4gICAgICAgICAgICBpZiAob3JpZW50YXRpb24gPT09ICdhdXRvJykge1xuICAgICAgICAgICAgICAgIHZhciB2aWV3UG9ydEhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKSxcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsVG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpLFxuICAgICAgICAgICAgICAgICAgICB0b3BPdmVyZmxvdyA9IC1zY3JvbGxUb3AgKyBvZmZzZXQudG9wIC0gY29udGFpbmVySGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICBib3R0b21PdmVyZmxvdyA9IHNjcm9sbFRvcCArIHZpZXdQb3J0SGVpZ2h0IC0gKG9mZnNldC50b3AgKyBoZWlnaHQgKyBjb250YWluZXJIZWlnaHQpO1xuXG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb24gPSAoTWF0aC5tYXgodG9wT3ZlcmZsb3csIGJvdHRvbU92ZXJmbG93KSA9PT0gdG9wT3ZlcmZsb3cpID8gJ3RvcCcgOiAnYm90dG9tJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG9yaWVudGF0aW9uID09PSAndG9wJykge1xuICAgICAgICAgICAgICAgIHN0eWxlcy50b3AgKz0gLWNvbnRhaW5lckhlaWdodDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3R5bGVzLnRvcCArPSBoZWlnaHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIElmIGNvbnRhaW5lciBpcyBub3QgcG9zaXRpb25lZCB0byBib2R5LFxuICAgICAgICAgICAgLy8gY29ycmVjdCBpdHMgcG9zaXRpb24gdXNpbmcgb2Zmc2V0IHBhcmVudCBvZmZzZXRcbiAgICAgICAgICAgIGlmKGNvbnRhaW5lclBhcmVudCAhPT0gZG9jdW1lbnQuYm9keSkge1xuICAgICAgICAgICAgICAgIHZhciBvcGFjaXR5ID0gJGNvbnRhaW5lci5jc3MoJ29wYWNpdHknKSxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50T2Zmc2V0RGlmZjtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoYXQudmlzaWJsZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmNzcygnb3BhY2l0eScsIDApLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcGFyZW50T2Zmc2V0RGlmZiA9ICRjb250YWluZXIub2Zmc2V0UGFyZW50KCkub2Zmc2V0KCk7XG4gICAgICAgICAgICAgICAgc3R5bGVzLnRvcCAtPSBwYXJlbnRPZmZzZXREaWZmLnRvcDtcbiAgICAgICAgICAgICAgICBzdHlsZXMubGVmdCAtPSBwYXJlbnRPZmZzZXREaWZmLmxlZnQ7XG5cbiAgICAgICAgICAgICAgICBpZiAoIXRoYXQudmlzaWJsZSl7XG4gICAgICAgICAgICAgICAgICAgICRjb250YWluZXIuY3NzKCdvcGFjaXR5Jywgb3BhY2l0eSkuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gLTJweCB0byBhY2NvdW50IGZvciBzdWdnZXN0aW9ucyBib3JkZXIuXG4gICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLndpZHRoID09PSAnYXV0bycpIHtcbiAgICAgICAgICAgICAgICBzdHlsZXMud2lkdGggPSAodGhhdC5lbC5vdXRlcldpZHRoKCkgLSAyKSArICdweCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICRjb250YWluZXIuY3NzKHN0eWxlcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5hYmxlS2lsbGVyRm46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljay5hdXRvY29tcGxldGUnLCB0aGF0LmtpbGxlckZuKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlS2lsbGVyRm46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suYXV0b2NvbXBsZXRlJywgdGhhdC5raWxsZXJGbik7XG4gICAgICAgIH0sXG5cbiAgICAgICAga2lsbFN1Z2dlc3Rpb25zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICB0aGF0LnN0b3BLaWxsU3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgICAgIHRoYXQuaW50ZXJ2YWxJZCA9IHdpbmRvdy5zZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoYXQudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGF0LnN0b3BLaWxsU3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgICAgIH0sIDUwKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzdG9wS2lsbFN1Z2dlc3Rpb25zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsSWQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzQ3Vyc29yQXRFbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICB2YWxMZW5ndGggPSB0aGF0LmVsLnZhbCgpLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25TdGFydCA9IHRoYXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydCxcbiAgICAgICAgICAgICAgICByYW5nZTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzZWxlY3Rpb25TdGFydCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZWN0aW9uU3RhcnQgPT09IHZhbExlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5zZWxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICByYW5nZSA9IGRvY3VtZW50LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSgpO1xuICAgICAgICAgICAgICAgIHJhbmdlLm1vdmVTdGFydCgnY2hhcmFjdGVyJywgLXZhbExlbmd0aCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbExlbmd0aCA9PT0gcmFuZ2UudGV4dC5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbktleVByZXNzOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICAvLyBJZiBzdWdnZXN0aW9ucyBhcmUgaGlkZGVuIGFuZCB1c2VyIHByZXNzZXMgYXJyb3cgZG93biwgZGlzcGxheSBzdWdnZXN0aW9uczpcbiAgICAgICAgICAgIGlmICghdGhhdC5kaXNhYmxlZCAmJiAhdGhhdC52aXNpYmxlICYmIGUud2hpY2ggPT09IGtleXMuRE9XTiAmJiB0aGF0LmN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoYXQuZGlzYWJsZWQgfHwgIXRoYXQudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3dpdGNoIChlLndoaWNoKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLkVTQzpcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlJJR0hUOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5oaW50ICYmIHRoYXQub3B0aW9ucy5vbkhpbnQgJiYgdGhhdC5pc0N1cnNvckF0RW5kKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0SGludCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5UQUI6XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LmhpbnQgJiYgdGhhdC5vcHRpb25zLm9uSGludCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RIaW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KHRoYXQuc2VsZWN0ZWRJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMudGFiRGlzYWJsZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlJFVFVSTjpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KHRoYXQuc2VsZWN0ZWRJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5VUDpcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5tb3ZlVXAoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLkRPV046XG4gICAgICAgICAgICAgICAgICAgIHRoYXQubW92ZURvd24oKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDYW5jZWwgZXZlbnQgaWYgZnVuY3Rpb24gZGlkIG5vdCByZXR1cm46XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uS2V5VXA6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmRpc2FibGVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzd2l0Y2ggKGUud2hpY2gpIHtcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuVVA6XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLkRPV046XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5jdXJyZW50VmFsdWUgIT09IHRoYXQuZWwudmFsKCkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmZpbmRCZXN0SGludCgpO1xuICAgICAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMuZGVmZXJSZXF1ZXN0QnkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIERlZmVyIGxvb2t1cCBpbiBjYXNlIHdoZW4gdmFsdWUgY2hhbmdlcyB2ZXJ5IHF1aWNrbHk6XG4gICAgICAgICAgICAgICAgICAgIHRoYXQub25DaGFuZ2VJbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQub25WYWx1ZUNoYW5nZSgpO1xuICAgICAgICAgICAgICAgICAgICB9LCB0aGF0Lm9wdGlvbnMuZGVmZXJSZXF1ZXN0QnkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQub25WYWx1ZUNoYW5nZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvblZhbHVlQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoYXQuZWwudmFsKCksXG4gICAgICAgICAgICAgICAgcXVlcnkgPSB0aGF0LmdldFF1ZXJ5KHZhbHVlKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0aW9uICYmIHRoYXQuY3VycmVudFZhbHVlICE9PSBxdWVyeSkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uID0gbnVsbDtcbiAgICAgICAgICAgICAgICAob3B0aW9ucy5vbkludmFsaWRhdGVTZWxlY3Rpb24gfHwgJC5ub29wKS5jYWxsKHRoYXQuZWxlbWVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcbiAgICAgICAgICAgIHRoYXQuY3VycmVudFZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgZXhpc3Rpbmcgc3VnZ2VzdGlvbiBmb3IgdGhlIG1hdGNoIGJlZm9yZSBwcm9jZWVkaW5nOlxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dCAmJiB0aGF0LmlzRXhhY3RNYXRjaChxdWVyeSkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCgwKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChxdWVyeS5sZW5ndGggPCBvcHRpb25zLm1pbkNoYXJzKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoYXQuZ2V0U3VnZ2VzdGlvbnMocXVlcnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGlzRXhhY3RNYXRjaDogZnVuY3Rpb24gKHF1ZXJ5KSB7XG4gICAgICAgICAgICB2YXIgc3VnZ2VzdGlvbnMgPSB0aGlzLnN1Z2dlc3Rpb25zO1xuXG4gICAgICAgICAgICByZXR1cm4gKHN1Z2dlc3Rpb25zLmxlbmd0aCA9PT0gMSAmJiBzdWdnZXN0aW9uc1swXS52YWx1ZS50b0xvd2VyQ2FzZSgpID09PSBxdWVyeS50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRRdWVyeTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgZGVsaW1pdGVyID0gdGhpcy5vcHRpb25zLmRlbGltaXRlcixcbiAgICAgICAgICAgICAgICBwYXJ0cztcblxuICAgICAgICAgICAgaWYgKCFkZWxpbWl0ZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJ0cyA9IHZhbHVlLnNwbGl0KGRlbGltaXRlcik7XG4gICAgICAgICAgICByZXR1cm4gJC50cmltKHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTdWdnZXN0aW9uc0xvY2FsOiBmdW5jdGlvbiAocXVlcnkpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIHF1ZXJ5TG93ZXJDYXNlID0gcXVlcnkudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgICAgICAgICBmaWx0ZXIgPSBvcHRpb25zLmxvb2t1cEZpbHRlcixcbiAgICAgICAgICAgICAgICBsaW1pdCA9IHBhcnNlSW50KG9wdGlvbnMubG9va3VwTGltaXQsIDEwKSxcbiAgICAgICAgICAgICAgICBkYXRhO1xuXG4gICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb25zOiAkLmdyZXAob3B0aW9ucy5sb29rdXAsIGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWx0ZXIoc3VnZ2VzdGlvbiwgcXVlcnksIHF1ZXJ5TG93ZXJDYXNlKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKGxpbWl0ICYmIGRhdGEuc3VnZ2VzdGlvbnMubGVuZ3RoID4gbGltaXQpIHtcbiAgICAgICAgICAgICAgICBkYXRhLnN1Z2dlc3Rpb25zID0gZGF0YS5zdWdnZXN0aW9ucy5zbGljZSgwLCBsaW1pdCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFN1Z2dlc3Rpb25zOiBmdW5jdGlvbiAocSkge1xuICAgICAgICAgICAgdmFyIHJlc3BvbnNlLFxuICAgICAgICAgICAgICAgIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgc2VydmljZVVybCA9IG9wdGlvbnMuc2VydmljZVVybCxcbiAgICAgICAgICAgICAgICBwYXJhbXMsXG4gICAgICAgICAgICAgICAgY2FjaGVLZXksXG4gICAgICAgICAgICAgICAgYWpheFNldHRpbmdzO1xuXG4gICAgICAgICAgICBvcHRpb25zLnBhcmFtc1tvcHRpb25zLnBhcmFtTmFtZV0gPSBxO1xuICAgICAgICAgICAgcGFyYW1zID0gb3B0aW9ucy5pZ25vcmVQYXJhbXMgPyBudWxsIDogb3B0aW9ucy5wYXJhbXM7XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLm9uU2VhcmNoU3RhcnQuY2FsbCh0aGF0LmVsZW1lbnQsIG9wdGlvbnMucGFyYW1zKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24ob3B0aW9ucy5sb29rdXApKXtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmxvb2t1cChxLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gZGF0YS5zdWdnZXN0aW9ucztcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgZGF0YS5zdWdnZXN0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhhdC5pc0xvY2FsKSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB0aGF0LmdldFN1Z2dlc3Rpb25zTG9jYWwocSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24oc2VydmljZVVybCkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZVVybCA9IHNlcnZpY2VVcmwuY2FsbCh0aGF0LmVsZW1lbnQsIHEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYWNoZUtleSA9IHNlcnZpY2VVcmwgKyAnPycgKyAkLnBhcmFtKHBhcmFtcyB8fCB7fSk7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB0aGF0LmNhY2hlZFJlc3BvbnNlW2NhY2hlS2V5XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlICYmICQuaXNBcnJheShyZXNwb25zZS5zdWdnZXN0aW9ucykpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gcmVzcG9uc2Uuc3VnZ2VzdGlvbnM7XG4gICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaENvbXBsZXRlLmNhbGwodGhhdC5lbGVtZW50LCBxLCByZXNwb25zZS5zdWdnZXN0aW9ucyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF0aGF0LmlzQmFkUXVlcnkocSkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmFib3J0QWpheCgpO1xuXG4gICAgICAgICAgICAgICAgYWpheFNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICB1cmw6IHNlcnZpY2VVcmwsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHBhcmFtcyxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogb3B0aW9ucy50eXBlLFxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogb3B0aW9ucy5kYXRhVHlwZVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAkLmV4dGVuZChhamF4U2V0dGluZ3MsIG9wdGlvbnMuYWpheFNldHRpbmdzKTtcblxuICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QgPSAkLmFqYXgoYWpheFNldHRpbmdzKS5kb25lKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBvcHRpb25zLnRyYW5zZm9ybVJlc3VsdChkYXRhLCBxKTtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5wcm9jZXNzUmVzcG9uc2UocmVzdWx0LCBxLCBjYWNoZUtleSk7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgcmVzdWx0LnN1Z2dlc3Rpb25zKTtcbiAgICAgICAgICAgICAgICB9KS5mYWlsKGZ1bmN0aW9uIChqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pIHtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaEVycm9yLmNhbGwodGhhdC5lbGVtZW50LCBxLCBqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBpc0JhZFF1ZXJ5OiBmdW5jdGlvbiAocSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMucHJldmVudEJhZFF1ZXJpZXMpe1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGJhZFF1ZXJpZXMgPSB0aGlzLmJhZFF1ZXJpZXMsXG4gICAgICAgICAgICAgICAgaSA9IGJhZFF1ZXJpZXMubGVuZ3RoO1xuXG4gICAgICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgICAgICAgaWYgKHEuaW5kZXhPZihiYWRRdWVyaWVzW2ldKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBoaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbih0aGF0Lm9wdGlvbnMub25IaWRlKSAmJiB0aGF0LnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICB0aGF0Lm9wdGlvbnMub25IaWRlLmNhbGwodGhhdC5lbGVtZW50LCBjb250YWluZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xuICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5oaWRlKCk7XG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQobnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3VnZ2VzdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3VnZ2VzdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zaG93Tm9TdWdnZXN0aW9uTm90aWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm9TdWdnZXN0aW9ucygpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIGdyb3VwQnkgPSBvcHRpb25zLmdyb3VwQnksXG4gICAgICAgICAgICAgICAgZm9ybWF0UmVzdWx0ID0gb3B0aW9ucy5mb3JtYXRSZXN1bHQsXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGF0LmdldFF1ZXJ5KHRoYXQuY3VycmVudFZhbHVlKSxcbiAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSB0aGF0LmNsYXNzZXMuc3VnZ2VzdGlvbixcbiAgICAgICAgICAgICAgICBjbGFzc1NlbGVjdGVkID0gdGhhdC5jbGFzc2VzLnNlbGVjdGVkLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXG4gICAgICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQodGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyKSxcbiAgICAgICAgICAgICAgICBiZWZvcmVSZW5kZXIgPSBvcHRpb25zLmJlZm9yZVJlbmRlcixcbiAgICAgICAgICAgICAgICBodG1sID0gJycsXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgZm9ybWF0R3JvdXAgPSBmdW5jdGlvbiAoc3VnZ2VzdGlvbiwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50Q2F0ZWdvcnkgPSBzdWdnZXN0aW9uLmRhdGFbZ3JvdXBCeV07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYXRlZ29yeSA9PT0gY3VycmVudENhdGVnb3J5KXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5ID0gY3VycmVudENhdGVnb3J5O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJhdXRvY29tcGxldGUtZ3JvdXBcIj48c3Ryb25nPicgKyBjYXRlZ29yeSArICc8L3N0cm9uZz48L2Rpdj4nO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy50cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0ICYmIHRoYXQuaXNFeGFjdE1hdGNoKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KDApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQnVpbGQgc3VnZ2VzdGlvbnMgaW5uZXIgSFRNTDpcbiAgICAgICAgICAgICQuZWFjaCh0aGF0LnN1Z2dlc3Rpb25zLCBmdW5jdGlvbiAoaSwgc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgICAgIGlmIChncm91cEJ5KXtcbiAgICAgICAgICAgICAgICAgICAgaHRtbCArPSBmb3JtYXRHcm91cChzdWdnZXN0aW9uLCB2YWx1ZSwgaSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cIicgKyBjbGFzc05hbWUgKyAnXCIgZGF0YS1pbmRleD1cIicgKyBpICsgJ1wiPicgKyBmb3JtYXRSZXN1bHQoc3VnZ2VzdGlvbiwgdmFsdWUpICsgJzwvZGl2Pic7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5hZGp1c3RDb250YWluZXJXaWR0aCgpO1xuXG4gICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyLmRldGFjaCgpO1xuICAgICAgICAgICAgY29udGFpbmVyLmh0bWwoaHRtbCk7XG5cbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24oYmVmb3JlUmVuZGVyKSkge1xuICAgICAgICAgICAgICAgIGJlZm9yZVJlbmRlci5jYWxsKHRoYXQuZWxlbWVudCwgY29udGFpbmVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xuICAgICAgICAgICAgY29udGFpbmVyLnNob3coKTtcblxuICAgICAgICAgICAgLy8gU2VsZWN0IGZpcnN0IHZhbHVlIGJ5IGRlZmF1bHQ6XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5hdXRvU2VsZWN0Rmlyc3QpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAwO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5zY3JvbGxUb3AoMCk7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmNoaWxkcmVuKCcuJyArIGNsYXNzTmFtZSkuZmlyc3QoKS5hZGRDbGFzcyhjbGFzc1NlbGVjdGVkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoYXQuZmluZEJlc3RIaW50KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbm9TdWdnZXN0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxuICAgICAgICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gJCh0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIpO1xuXG4gICAgICAgICAgICB0aGlzLmFkanVzdENvbnRhaW5lcldpZHRoKCk7XG5cbiAgICAgICAgICAgIC8vIFNvbWUgZXhwbGljaXQgc3RlcHMuIEJlIGNhcmVmdWwgaGVyZSBhcyBpdCBlYXN5IHRvIGdldFxuICAgICAgICAgICAgLy8gbm9TdWdnZXN0aW9uc0NvbnRhaW5lciByZW1vdmVkIGZyb20gRE9NIGlmIG5vdCBkZXRhY2hlZCBwcm9wZXJseS5cbiAgICAgICAgICAgIG5vU3VnZ2VzdGlvbnNDb250YWluZXIuZGV0YWNoKCk7XG4gICAgICAgICAgICBjb250YWluZXIuZW1wdHkoKTsgLy8gY2xlYW4gc3VnZ2VzdGlvbnMgaWYgYW55XG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kKG5vU3VnZ2VzdGlvbnNDb250YWluZXIpO1xuXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XG5cbiAgICAgICAgICAgIGNvbnRhaW5lci5zaG93KCk7XG4gICAgICAgICAgICB0aGF0LnZpc2libGUgPSB0cnVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFkanVzdENvbnRhaW5lcldpZHRoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcik7XG5cbiAgICAgICAgICAgIC8vIElmIHdpZHRoIGlzIGF1dG8sIGFkanVzdCB3aWR0aCBiZWZvcmUgZGlzcGxheWluZyBzdWdnZXN0aW9ucyxcbiAgICAgICAgICAgIC8vIGJlY2F1c2UgaWYgaW5zdGFuY2Ugd2FzIGNyZWF0ZWQgYmVmb3JlIGlucHV0IGhhZCB3aWR0aCwgaXQgd2lsbCBiZSB6ZXJvLlxuICAgICAgICAgICAgLy8gQWxzbyBpdCBhZGp1c3RzIGlmIGlucHV0IHdpZHRoIGhhcyBjaGFuZ2VkLlxuICAgICAgICAgICAgLy8gLTJweCB0byBhY2NvdW50IGZvciBzdWdnZXN0aW9ucyBib3JkZXIuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy53aWR0aCA9PT0gJ2F1dG8nKSB7XG4gICAgICAgICAgICAgICAgd2lkdGggPSB0aGF0LmVsLm91dGVyV2lkdGgoKSAtIDI7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLndpZHRoKHdpZHRoID4gMCA/IHdpZHRoIDogMzAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBmaW5kQmVzdEhpbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoYXQuZWwudmFsKCkudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgICAgICAgICBiZXN0TWF0Y2ggPSBudWxsO1xuXG4gICAgICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkLmVhY2godGhhdC5zdWdnZXN0aW9ucywgZnVuY3Rpb24gKGksIHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgZm91bmRNYXRjaCA9IHN1Z2dlc3Rpb24udmFsdWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHZhbHVlKSA9PT0gMDtcbiAgICAgICAgICAgICAgICBpZiAoZm91bmRNYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICBiZXN0TWF0Y2ggPSBzdWdnZXN0aW9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gIWZvdW5kTWF0Y2g7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KGJlc3RNYXRjaCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2lnbmFsSGludDogZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBoaW50VmFsdWUgPSAnJyxcbiAgICAgICAgICAgICAgICB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIGlmIChzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgaGludFZhbHVlID0gdGhhdC5jdXJyZW50VmFsdWUgKyBzdWdnZXN0aW9uLnZhbHVlLnN1YnN0cih0aGF0LmN1cnJlbnRWYWx1ZS5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoYXQuaGludFZhbHVlICE9PSBoaW50VmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmhpbnRWYWx1ZSA9IGhpbnRWYWx1ZTtcbiAgICAgICAgICAgICAgICB0aGF0LmhpbnQgPSBzdWdnZXN0aW9uO1xuICAgICAgICAgICAgICAgICh0aGlzLm9wdGlvbnMub25IaW50IHx8ICQubm9vcCkoaGludFZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB2ZXJpZnlTdWdnZXN0aW9uc0Zvcm1hdDogZnVuY3Rpb24gKHN1Z2dlc3Rpb25zKSB7XG4gICAgICAgICAgICAvLyBJZiBzdWdnZXN0aW9ucyBpcyBzdHJpbmcgYXJyYXksIGNvbnZlcnQgdGhlbSB0byBzdXBwb3J0ZWQgZm9ybWF0OlxuICAgICAgICAgICAgaWYgKHN1Z2dlc3Rpb25zLmxlbmd0aCAmJiB0eXBlb2Ygc3VnZ2VzdGlvbnNbMF0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICQubWFwKHN1Z2dlc3Rpb25zLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IHZhbHVlLCBkYXRhOiBudWxsIH07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzdWdnZXN0aW9ucztcbiAgICAgICAgfSxcblxuICAgICAgICB2YWxpZGF0ZU9yaWVudGF0aW9uOiBmdW5jdGlvbihvcmllbnRhdGlvbiwgZmFsbGJhY2spIHtcbiAgICAgICAgICAgIG9yaWVudGF0aW9uID0gJC50cmltKG9yaWVudGF0aW9uIHx8ICcnKS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgICAgICBpZigkLmluQXJyYXkob3JpZW50YXRpb24sIFsnYXV0bycsICdib3R0b20nLCAndG9wJ10pID09PSAtMSl7XG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb24gPSBmYWxsYmFjaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG9yaWVudGF0aW9uO1xuICAgICAgICB9LFxuXG4gICAgICAgIHByb2Nlc3NSZXNwb25zZTogZnVuY3Rpb24gKHJlc3VsdCwgb3JpZ2luYWxRdWVyeSwgY2FjaGVLZXkpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zO1xuXG4gICAgICAgICAgICByZXN1bHQuc3VnZ2VzdGlvbnMgPSB0aGF0LnZlcmlmeVN1Z2dlc3Rpb25zRm9ybWF0KHJlc3VsdC5zdWdnZXN0aW9ucyk7XG5cbiAgICAgICAgICAgIC8vIENhY2hlIHJlc3VsdHMgaWYgY2FjaGUgaXMgbm90IGRpc2FibGVkOlxuICAgICAgICAgICAgaWYgKCFvcHRpb25zLm5vQ2FjaGUpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmNhY2hlZFJlc3BvbnNlW2NhY2hlS2V5XSA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5wcmV2ZW50QmFkUXVlcmllcyAmJiByZXN1bHQuc3VnZ2VzdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuYmFkUXVlcmllcy5wdXNoKG9yaWdpbmFsUXVlcnkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUmV0dXJuIGlmIG9yaWdpbmFsUXVlcnkgaXMgbm90IG1hdGNoaW5nIGN1cnJlbnQgcXVlcnk6XG4gICAgICAgICAgICBpZiAob3JpZ2luYWxRdWVyeSAhPT0gdGhhdC5nZXRRdWVyeSh0aGF0LmN1cnJlbnRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSByZXN1bHQuc3VnZ2VzdGlvbnM7XG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhY3RpdmF0ZTogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgYWN0aXZlSXRlbSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZCA9IHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCxcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuID0gY29udGFpbmVyLmZpbmQoJy4nICsgdGhhdC5jbGFzc2VzLnN1Z2dlc3Rpb24pO1xuXG4gICAgICAgICAgICBjb250YWluZXIuZmluZCgnLicgKyBzZWxlY3RlZCkucmVtb3ZlQ2xhc3Moc2VsZWN0ZWQpO1xuXG4gICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSBpbmRleDtcblxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCAhPT0gLTEgJiYgY2hpbGRyZW4ubGVuZ3RoID4gdGhhdC5zZWxlY3RlZEluZGV4KSB7XG4gICAgICAgICAgICAgICAgYWN0aXZlSXRlbSA9IGNoaWxkcmVuLmdldCh0aGF0LnNlbGVjdGVkSW5kZXgpO1xuICAgICAgICAgICAgICAgICQoYWN0aXZlSXRlbSkuYWRkQ2xhc3Moc2VsZWN0ZWQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBhY3RpdmVJdGVtO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWxlY3RIaW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgaSA9ICQuaW5BcnJheSh0aGF0LmhpbnQsIHRoYXQuc3VnZ2VzdGlvbnMpO1xuXG4gICAgICAgICAgICB0aGF0LnNlbGVjdChpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWxlY3Q6IGZ1bmN0aW9uIChpKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgIHRoYXQub25TZWxlY3QoaSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbW92ZVVwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5jaGlsZHJlbigpLmZpcnN0KCkucmVtb3ZlQ2xhc3ModGhhdC5jbGFzc2VzLnNlbGVjdGVkKTtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcbiAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgdGhhdC5maW5kQmVzdEhpbnQoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQuYWRqdXN0U2Nyb2xsKHRoYXQuc2VsZWN0ZWRJbmRleCAtIDEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1vdmVEb3duOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09ICh0aGF0LnN1Z2dlc3Rpb25zLmxlbmd0aCAtIDEpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LmFkanVzdFNjcm9sbCh0aGF0LnNlbGVjdGVkSW5kZXggKyAxKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGp1c3RTY3JvbGw6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGFjdGl2ZUl0ZW0gPSB0aGF0LmFjdGl2YXRlKGluZGV4KTtcblxuICAgICAgICAgICAgaWYgKCFhY3RpdmVJdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgb2Zmc2V0VG9wLFxuICAgICAgICAgICAgICAgIHVwcGVyQm91bmQsXG4gICAgICAgICAgICAgICAgbG93ZXJCb3VuZCxcbiAgICAgICAgICAgICAgICBoZWlnaHREZWx0YSA9ICQoYWN0aXZlSXRlbSkub3V0ZXJIZWlnaHQoKTtcblxuICAgICAgICAgICAgb2Zmc2V0VG9wID0gYWN0aXZlSXRlbS5vZmZzZXRUb3A7XG4gICAgICAgICAgICB1cHBlckJvdW5kID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5zY3JvbGxUb3AoKTtcbiAgICAgICAgICAgIGxvd2VyQm91bmQgPSB1cHBlckJvdW5kICsgdGhhdC5vcHRpb25zLm1heEhlaWdodCAtIGhlaWdodERlbHRhO1xuXG4gICAgICAgICAgICBpZiAob2Zmc2V0VG9wIDwgdXBwZXJCb3VuZCkge1xuICAgICAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuc2Nyb2xsVG9wKG9mZnNldFRvcCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9mZnNldFRvcCA+IGxvd2VyQm91bmQpIHtcbiAgICAgICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnNjcm9sbFRvcChvZmZzZXRUb3AgLSB0aGF0Lm9wdGlvbnMubWF4SGVpZ2h0ICsgaGVpZ2h0RGVsdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXRoYXQub3B0aW9ucy5wcmVzZXJ2ZUlucHV0KSB7XG4gICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5nZXRWYWx1ZSh0aGF0LnN1Z2dlc3Rpb25zW2luZGV4XS52YWx1ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uU2VsZWN0OiBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvblNlbGVjdENhbGxiYWNrID0gdGhhdC5vcHRpb25zLm9uU2VsZWN0LFxuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb24gPSB0aGF0LnN1Z2dlc3Rpb25zW2luZGV4XTtcblxuICAgICAgICAgICAgdGhhdC5jdXJyZW50VmFsdWUgPSB0aGF0LmdldFZhbHVlKHN1Z2dlc3Rpb24udmFsdWUpO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5jdXJyZW50VmFsdWUgIT09IHRoYXQuZWwudmFsKCkgJiYgIXRoYXQub3B0aW9ucy5wcmVzZXJ2ZUlucHV0KSB7XG4gICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQobnVsbCk7XG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gW107XG4gICAgICAgICAgICB0aGF0LnNlbGVjdGlvbiA9IHN1Z2dlc3Rpb247XG5cbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24ob25TZWxlY3RDYWxsYmFjaykpIHtcbiAgICAgICAgICAgICAgICBvblNlbGVjdENhbGxiYWNrLmNhbGwodGhhdC5lbGVtZW50LCBzdWdnZXN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXRWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgZGVsaW1pdGVyID0gdGhhdC5vcHRpb25zLmRlbGltaXRlcixcbiAgICAgICAgICAgICAgICBjdXJyZW50VmFsdWUsXG4gICAgICAgICAgICAgICAgcGFydHM7XG5cbiAgICAgICAgICAgIGlmICghZGVsaW1pdGVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjdXJyZW50VmFsdWUgPSB0aGF0LmN1cnJlbnRWYWx1ZTtcbiAgICAgICAgICAgIHBhcnRzID0gY3VycmVudFZhbHVlLnNwbGl0KGRlbGltaXRlcik7XG5cbiAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50VmFsdWUuc3Vic3RyKDAsIGN1cnJlbnRWYWx1ZS5sZW5ndGggLSBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXS5sZW5ndGgpICsgdmFsdWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzcG9zZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdGhhdC5lbC5vZmYoJy5hdXRvY29tcGxldGUnKS5yZW1vdmVEYXRhKCdhdXRvY29tcGxldGUnKTtcbiAgICAgICAgICAgIHRoYXQuZGlzYWJsZUtpbGxlckZuKCk7XG4gICAgICAgICAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUuYXV0b2NvbXBsZXRlJywgdGhhdC5maXhQb3NpdGlvbkNhcHR1cmUpO1xuICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBDcmVhdGUgY2hhaW5hYmxlIGpRdWVyeSBwbHVnaW46XG4gICAgJC5mbi5hdXRvY29tcGxldGUgPSAkLmZuLmRldmJyaWRnZUF1dG9jb21wbGV0ZSA9IGZ1bmN0aW9uIChvcHRpb25zLCBhcmdzKSB7XG4gICAgICAgIHZhciBkYXRhS2V5ID0gJ2F1dG9jb21wbGV0ZSc7XG4gICAgICAgIC8vIElmIGZ1bmN0aW9uIGludm9rZWQgd2l0aG91dCBhcmd1bWVudCByZXR1cm5cbiAgICAgICAgLy8gaW5zdGFuY2Ugb2YgdGhlIGZpcnN0IG1hdGNoZWQgZWxlbWVudDpcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpcnN0KCkuZGF0YShkYXRhS2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGlucHV0RWxlbWVudCA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBpbnB1dEVsZW1lbnQuZGF0YShkYXRhS2V5KTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZSAmJiB0eXBlb2YgaW5zdGFuY2Vbb3B0aW9uc10gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2Vbb3B0aW9uc10oYXJncyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBJZiBpbnN0YW5jZSBhbHJlYWR5IGV4aXN0cywgZGVzdHJveSBpdDpcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UgJiYgaW5zdGFuY2UuZGlzcG9zZSkge1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGluc3RhbmNlID0gbmV3IEF1dG9jb21wbGV0ZSh0aGlzLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICBpbnB1dEVsZW1lbnQuZGF0YShkYXRhS2V5LCBpbnN0YW5jZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG59KSk7XG4iLCIvKiEgU2VsZWN0MiA0LjAuMyB8IGh0dHBzOi8vZ2l0aHViLmNvbS9zZWxlY3QyL3NlbGVjdDIvYmxvYi9tYXN0ZXIvTElDRU5TRS5tZCAqLyFmdW5jdGlvbihhKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtcImpxdWVyeVwiXSxhKTphKFwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP3JlcXVpcmUoXCJqcXVlcnlcIik6alF1ZXJ5KX0oZnVuY3Rpb24oYSl7dmFyIGI9ZnVuY3Rpb24oKXtpZihhJiZhLmZuJiZhLmZuLnNlbGVjdDImJmEuZm4uc2VsZWN0Mi5hbWQpdmFyIGI9YS5mbi5zZWxlY3QyLmFtZDt2YXIgYjtyZXR1cm4gZnVuY3Rpb24oKXtpZighYnx8IWIucmVxdWlyZWpzKXtiP2M9YjpiPXt9O3ZhciBhLGMsZDshZnVuY3Rpb24oYil7ZnVuY3Rpb24gZShhLGIpe3JldHVybiB1LmNhbGwoYSxiKX1mdW5jdGlvbiBmKGEsYil7dmFyIGMsZCxlLGYsZyxoLGksaixrLGwsbSxuPWImJmIuc3BsaXQoXCIvXCIpLG89cy5tYXAscD1vJiZvW1wiKlwiXXx8e307aWYoYSYmXCIuXCI9PT1hLmNoYXJBdCgwKSlpZihiKXtmb3IoYT1hLnNwbGl0KFwiL1wiKSxnPWEubGVuZ3RoLTEscy5ub2RlSWRDb21wYXQmJncudGVzdChhW2ddKSYmKGFbZ109YVtnXS5yZXBsYWNlKHcsXCJcIikpLGE9bi5zbGljZSgwLG4ubGVuZ3RoLTEpLmNvbmNhdChhKSxrPTA7azxhLmxlbmd0aDtrKz0xKWlmKG09YVtrXSxcIi5cIj09PW0pYS5zcGxpY2UoaywxKSxrLT0xO2Vsc2UgaWYoXCIuLlwiPT09bSl7aWYoMT09PWsmJihcIi4uXCI9PT1hWzJdfHxcIi4uXCI9PT1hWzBdKSlicmVhaztrPjAmJihhLnNwbGljZShrLTEsMiksay09Mil9YT1hLmpvaW4oXCIvXCIpfWVsc2UgMD09PWEuaW5kZXhPZihcIi4vXCIpJiYoYT1hLnN1YnN0cmluZygyKSk7aWYoKG58fHApJiZvKXtmb3IoYz1hLnNwbGl0KFwiL1wiKSxrPWMubGVuZ3RoO2s+MDtrLT0xKXtpZihkPWMuc2xpY2UoMCxrKS5qb2luKFwiL1wiKSxuKWZvcihsPW4ubGVuZ3RoO2w+MDtsLT0xKWlmKGU9b1tuLnNsaWNlKDAsbCkuam9pbihcIi9cIildLGUmJihlPWVbZF0pKXtmPWUsaD1rO2JyZWFrfWlmKGYpYnJlYWs7IWkmJnAmJnBbZF0mJihpPXBbZF0saj1rKX0hZiYmaSYmKGY9aSxoPWopLGYmJihjLnNwbGljZSgwLGgsZiksYT1jLmpvaW4oXCIvXCIpKX1yZXR1cm4gYX1mdW5jdGlvbiBnKGEsYyl7cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIGQ9di5jYWxsKGFyZ3VtZW50cywwKTtyZXR1cm5cInN0cmluZ1wiIT10eXBlb2YgZFswXSYmMT09PWQubGVuZ3RoJiZkLnB1c2gobnVsbCksbi5hcHBseShiLGQuY29uY2F0KFthLGNdKSl9fWZ1bmN0aW9uIGgoYSl7cmV0dXJuIGZ1bmN0aW9uKGIpe3JldHVybiBmKGIsYSl9fWZ1bmN0aW9uIGkoYSl7cmV0dXJuIGZ1bmN0aW9uKGIpe3FbYV09Yn19ZnVuY3Rpb24gaihhKXtpZihlKHIsYSkpe3ZhciBjPXJbYV07ZGVsZXRlIHJbYV0sdFthXT0hMCxtLmFwcGx5KGIsYyl9aWYoIWUocSxhKSYmIWUodCxhKSl0aHJvdyBuZXcgRXJyb3IoXCJObyBcIithKTtyZXR1cm4gcVthXX1mdW5jdGlvbiBrKGEpe3ZhciBiLGM9YT9hLmluZGV4T2YoXCIhXCIpOi0xO3JldHVybiBjPi0xJiYoYj1hLnN1YnN0cmluZygwLGMpLGE9YS5zdWJzdHJpbmcoYysxLGEubGVuZ3RoKSksW2IsYV19ZnVuY3Rpb24gbChhKXtyZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gcyYmcy5jb25maWcmJnMuY29uZmlnW2FdfHx7fX19dmFyIG0sbixvLHAscT17fSxyPXt9LHM9e30sdD17fSx1PU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHksdj1bXS5zbGljZSx3PS9cXC5qcyQvO289ZnVuY3Rpb24oYSxiKXt2YXIgYyxkPWsoYSksZT1kWzBdO3JldHVybiBhPWRbMV0sZSYmKGU9ZihlLGIpLGM9aihlKSksZT9hPWMmJmMubm9ybWFsaXplP2Mubm9ybWFsaXplKGEsaChiKSk6ZihhLGIpOihhPWYoYSxiKSxkPWsoYSksZT1kWzBdLGE9ZFsxXSxlJiYoYz1qKGUpKSkse2Y6ZT9lK1wiIVwiK2E6YSxuOmEscHI6ZSxwOmN9fSxwPXtyZXF1aXJlOmZ1bmN0aW9uKGEpe3JldHVybiBnKGEpfSxleHBvcnRzOmZ1bmN0aW9uKGEpe3ZhciBiPXFbYV07cmV0dXJuXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGI/YjpxW2FdPXt9fSxtb2R1bGU6ZnVuY3Rpb24oYSl7cmV0dXJue2lkOmEsdXJpOlwiXCIsZXhwb3J0czpxW2FdLGNvbmZpZzpsKGEpfX19LG09ZnVuY3Rpb24oYSxjLGQsZil7dmFyIGgsayxsLG0sbixzLHU9W10sdj10eXBlb2YgZDtpZihmPWZ8fGEsXCJ1bmRlZmluZWRcIj09PXZ8fFwiZnVuY3Rpb25cIj09PXYpe2ZvcihjPSFjLmxlbmd0aCYmZC5sZW5ndGg/W1wicmVxdWlyZVwiLFwiZXhwb3J0c1wiLFwibW9kdWxlXCJdOmMsbj0wO248Yy5sZW5ndGg7bis9MSlpZihtPW8oY1tuXSxmKSxrPW0uZixcInJlcXVpcmVcIj09PWspdVtuXT1wLnJlcXVpcmUoYSk7ZWxzZSBpZihcImV4cG9ydHNcIj09PWspdVtuXT1wLmV4cG9ydHMoYSkscz0hMDtlbHNlIGlmKFwibW9kdWxlXCI9PT1rKWg9dVtuXT1wLm1vZHVsZShhKTtlbHNlIGlmKGUocSxrKXx8ZShyLGspfHxlKHQsaykpdVtuXT1qKGspO2Vsc2V7aWYoIW0ucCl0aHJvdyBuZXcgRXJyb3IoYStcIiBtaXNzaW5nIFwiK2spO20ucC5sb2FkKG0ubixnKGYsITApLGkoaykse30pLHVbbl09cVtrXX1sPWQ/ZC5hcHBseShxW2FdLHUpOnZvaWQgMCxhJiYoaCYmaC5leHBvcnRzIT09YiYmaC5leHBvcnRzIT09cVthXT9xW2FdPWguZXhwb3J0czpsPT09YiYmc3x8KHFbYV09bCkpfWVsc2UgYSYmKHFbYV09ZCl9LGE9Yz1uPWZ1bmN0aW9uKGEsYyxkLGUsZil7aWYoXCJzdHJpbmdcIj09dHlwZW9mIGEpcmV0dXJuIHBbYV0/cFthXShjKTpqKG8oYSxjKS5mKTtpZighYS5zcGxpY2Upe2lmKHM9YSxzLmRlcHMmJm4ocy5kZXBzLHMuY2FsbGJhY2spLCFjKXJldHVybjtjLnNwbGljZT8oYT1jLGM9ZCxkPW51bGwpOmE9Yn1yZXR1cm4gYz1jfHxmdW5jdGlvbigpe30sXCJmdW5jdGlvblwiPT10eXBlb2YgZCYmKGQ9ZSxlPWYpLGU/bShiLGEsYyxkKTpzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7bShiLGEsYyxkKX0sNCksbn0sbi5jb25maWc9ZnVuY3Rpb24oYSl7cmV0dXJuIG4oYSl9LGEuX2RlZmluZWQ9cSxkPWZ1bmN0aW9uKGEsYixjKXtpZihcInN0cmluZ1wiIT10eXBlb2YgYSl0aHJvdyBuZXcgRXJyb3IoXCJTZWUgYWxtb25kIFJFQURNRTogaW5jb3JyZWN0IG1vZHVsZSBidWlsZCwgbm8gbW9kdWxlIG5hbWVcIik7Yi5zcGxpY2V8fChjPWIsYj1bXSksZShxLGEpfHxlKHIsYSl8fChyW2FdPVthLGIsY10pfSxkLmFtZD17alF1ZXJ5OiEwfX0oKSxiLnJlcXVpcmVqcz1hLGIucmVxdWlyZT1jLGIuZGVmaW5lPWR9fSgpLGIuZGVmaW5lKFwiYWxtb25kXCIsZnVuY3Rpb24oKXt9KSxiLmRlZmluZShcImpxdWVyeVwiLFtdLGZ1bmN0aW9uKCl7dmFyIGI9YXx8JDtyZXR1cm4gbnVsbD09YiYmY29uc29sZSYmY29uc29sZS5lcnJvciYmY29uc29sZS5lcnJvcihcIlNlbGVjdDI6IEFuIGluc3RhbmNlIG9mIGpRdWVyeSBvciBhIGpRdWVyeS1jb21wYXRpYmxlIGxpYnJhcnkgd2FzIG5vdCBmb3VuZC4gTWFrZSBzdXJlIHRoYXQgeW91IGFyZSBpbmNsdWRpbmcgalF1ZXJ5IGJlZm9yZSBTZWxlY3QyIG9uIHlvdXIgd2ViIHBhZ2UuXCIpLGJ9KSxiLmRlZmluZShcInNlbGVjdDIvdXRpbHNcIixbXCJqcXVlcnlcIl0sZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYihhKXt2YXIgYj1hLnByb3RvdHlwZSxjPVtdO2Zvcih2YXIgZCBpbiBiKXt2YXIgZT1iW2RdO1wiZnVuY3Rpb25cIj09dHlwZW9mIGUmJlwiY29uc3RydWN0b3JcIiE9PWQmJmMucHVzaChkKX1yZXR1cm4gY312YXIgYz17fTtjLkV4dGVuZD1mdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoKXt0aGlzLmNvbnN0cnVjdG9yPWF9dmFyIGQ9e30uaGFzT3duUHJvcGVydHk7Zm9yKHZhciBlIGluIGIpZC5jYWxsKGIsZSkmJihhW2VdPWJbZV0pO3JldHVybiBjLnByb3RvdHlwZT1iLnByb3RvdHlwZSxhLnByb3RvdHlwZT1uZXcgYyxhLl9fc3VwZXJfXz1iLnByb3RvdHlwZSxhfSxjLkRlY29yYXRlPWZ1bmN0aW9uKGEsYyl7ZnVuY3Rpb24gZCgpe3ZhciBiPUFycmF5LnByb3RvdHlwZS51bnNoaWZ0LGQ9Yy5wcm90b3R5cGUuY29uc3RydWN0b3IubGVuZ3RoLGU9YS5wcm90b3R5cGUuY29uc3RydWN0b3I7ZD4wJiYoYi5jYWxsKGFyZ3VtZW50cyxhLnByb3RvdHlwZS5jb25zdHJ1Y3RvciksZT1jLnByb3RvdHlwZS5jb25zdHJ1Y3RvciksZS5hcHBseSh0aGlzLGFyZ3VtZW50cyl9ZnVuY3Rpb24gZSgpe3RoaXMuY29uc3RydWN0b3I9ZH12YXIgZj1iKGMpLGc9YihhKTtjLmRpc3BsYXlOYW1lPWEuZGlzcGxheU5hbWUsZC5wcm90b3R5cGU9bmV3IGU7Zm9yKHZhciBoPTA7aDxnLmxlbmd0aDtoKyspe3ZhciBpPWdbaF07ZC5wcm90b3R5cGVbaV09YS5wcm90b3R5cGVbaV19Zm9yKHZhciBqPShmdW5jdGlvbihhKXt2YXIgYj1mdW5jdGlvbigpe307YSBpbiBkLnByb3RvdHlwZSYmKGI9ZC5wcm90b3R5cGVbYV0pO3ZhciBlPWMucHJvdG90eXBlW2FdO3JldHVybiBmdW5jdGlvbigpe3ZhciBhPUFycmF5LnByb3RvdHlwZS51bnNoaWZ0O3JldHVybiBhLmNhbGwoYXJndW1lbnRzLGIpLGUuYXBwbHkodGhpcyxhcmd1bWVudHMpfX0pLGs9MDtrPGYubGVuZ3RoO2srKyl7dmFyIGw9ZltrXTtkLnByb3RvdHlwZVtsXT1qKGwpfXJldHVybiBkfTt2YXIgZD1mdW5jdGlvbigpe3RoaXMubGlzdGVuZXJzPXt9fTtyZXR1cm4gZC5wcm90b3R5cGUub249ZnVuY3Rpb24oYSxiKXt0aGlzLmxpc3RlbmVycz10aGlzLmxpc3RlbmVyc3x8e30sYSBpbiB0aGlzLmxpc3RlbmVycz90aGlzLmxpc3RlbmVyc1thXS5wdXNoKGIpOnRoaXMubGlzdGVuZXJzW2FdPVtiXX0sZC5wcm90b3R5cGUudHJpZ2dlcj1mdW5jdGlvbihhKXt2YXIgYj1BcnJheS5wcm90b3R5cGUuc2xpY2UsYz1iLmNhbGwoYXJndW1lbnRzLDEpO3RoaXMubGlzdGVuZXJzPXRoaXMubGlzdGVuZXJzfHx7fSxudWxsPT1jJiYoYz1bXSksMD09PWMubGVuZ3RoJiZjLnB1c2goe30pLGNbMF0uX3R5cGU9YSxhIGluIHRoaXMubGlzdGVuZXJzJiZ0aGlzLmludm9rZSh0aGlzLmxpc3RlbmVyc1thXSxiLmNhbGwoYXJndW1lbnRzLDEpKSxcIipcImluIHRoaXMubGlzdGVuZXJzJiZ0aGlzLmludm9rZSh0aGlzLmxpc3RlbmVyc1tcIipcIl0sYXJndW1lbnRzKX0sZC5wcm90b3R5cGUuaW52b2tlPWZ1bmN0aW9uKGEsYil7Zm9yKHZhciBjPTAsZD1hLmxlbmd0aDtkPmM7YysrKWFbY10uYXBwbHkodGhpcyxiKX0sYy5PYnNlcnZhYmxlPWQsYy5nZW5lcmF0ZUNoYXJzPWZ1bmN0aW9uKGEpe2Zvcih2YXIgYj1cIlwiLGM9MDthPmM7YysrKXt2YXIgZD1NYXRoLmZsb29yKDM2Kk1hdGgucmFuZG9tKCkpO2IrPWQudG9TdHJpbmcoMzYpfXJldHVybiBifSxjLmJpbmQ9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gZnVuY3Rpb24oKXthLmFwcGx5KGIsYXJndW1lbnRzKX19LGMuX2NvbnZlcnREYXRhPWZ1bmN0aW9uKGEpe2Zvcih2YXIgYiBpbiBhKXt2YXIgYz1iLnNwbGl0KFwiLVwiKSxkPWE7aWYoMSE9PWMubGVuZ3RoKXtmb3IodmFyIGU9MDtlPGMubGVuZ3RoO2UrKyl7dmFyIGY9Y1tlXTtmPWYuc3Vic3RyaW5nKDAsMSkudG9Mb3dlckNhc2UoKStmLnN1YnN0cmluZygxKSxmIGluIGR8fChkW2ZdPXt9KSxlPT1jLmxlbmd0aC0xJiYoZFtmXT1hW2JdKSxkPWRbZl19ZGVsZXRlIGFbYl19fXJldHVybiBhfSxjLmhhc1Njcm9sbD1mdW5jdGlvbihiLGMpe3ZhciBkPWEoYyksZT1jLnN0eWxlLm92ZXJmbG93WCxmPWMuc3R5bGUub3ZlcmZsb3dZO3JldHVybiBlIT09Znx8XCJoaWRkZW5cIiE9PWYmJlwidmlzaWJsZVwiIT09Zj9cInNjcm9sbFwiPT09ZXx8XCJzY3JvbGxcIj09PWY/ITA6ZC5pbm5lckhlaWdodCgpPGMuc2Nyb2xsSGVpZ2h0fHxkLmlubmVyV2lkdGgoKTxjLnNjcm9sbFdpZHRoOiExfSxjLmVzY2FwZU1hcmt1cD1mdW5jdGlvbihhKXt2YXIgYj17XCJcXFxcXCI6XCImIzkyO1wiLFwiJlwiOlwiJmFtcDtcIixcIjxcIjpcIiZsdDtcIixcIj5cIjpcIiZndDtcIiwnXCInOlwiJnF1b3Q7XCIsXCInXCI6XCImIzM5O1wiLFwiL1wiOlwiJiM0NztcIn07cmV0dXJuXCJzdHJpbmdcIiE9dHlwZW9mIGE/YTpTdHJpbmcoYSkucmVwbGFjZSgvWyY8PlwiJ1xcL1xcXFxdL2csZnVuY3Rpb24oYSl7cmV0dXJuIGJbYV19KX0sYy5hcHBlbmRNYW55PWZ1bmN0aW9uKGIsYyl7aWYoXCIxLjdcIj09PWEuZm4uanF1ZXJ5LnN1YnN0cigwLDMpKXt2YXIgZD1hKCk7YS5tYXAoYyxmdW5jdGlvbihhKXtkPWQuYWRkKGEpfSksYz1kfWIuYXBwZW5kKGMpfSxjfSksYi5kZWZpbmUoXCJzZWxlY3QyL3Jlc3VsdHNcIixbXCJqcXVlcnlcIixcIi4vdXRpbHNcIl0sZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGEsYixkKXt0aGlzLiRlbGVtZW50PWEsdGhpcy5kYXRhPWQsdGhpcy5vcHRpb25zPWIsYy5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzKX1yZXR1cm4gYi5FeHRlbmQoYyxiLk9ic2VydmFibGUpLGMucHJvdG90eXBlLnJlbmRlcj1mdW5jdGlvbigpe3ZhciBiPWEoJzx1bCBjbGFzcz1cInNlbGVjdDItcmVzdWx0c19fb3B0aW9uc1wiIHJvbGU9XCJ0cmVlXCI+PC91bD4nKTtyZXR1cm4gdGhpcy5vcHRpb25zLmdldChcIm11bHRpcGxlXCIpJiZiLmF0dHIoXCJhcmlhLW11bHRpc2VsZWN0YWJsZVwiLFwidHJ1ZVwiKSx0aGlzLiRyZXN1bHRzPWIsYn0sYy5wcm90b3R5cGUuY2xlYXI9ZnVuY3Rpb24oKXt0aGlzLiRyZXN1bHRzLmVtcHR5KCl9LGMucHJvdG90eXBlLmRpc3BsYXlNZXNzYWdlPWZ1bmN0aW9uKGIpe3ZhciBjPXRoaXMub3B0aW9ucy5nZXQoXCJlc2NhcGVNYXJrdXBcIik7dGhpcy5jbGVhcigpLHRoaXMuaGlkZUxvYWRpbmcoKTt2YXIgZD1hKCc8bGkgcm9sZT1cInRyZWVpdGVtXCIgYXJpYS1saXZlPVwiYXNzZXJ0aXZlXCIgY2xhc3M9XCJzZWxlY3QyLXJlc3VsdHNfX29wdGlvblwiPjwvbGk+JyksZT10aGlzLm9wdGlvbnMuZ2V0KFwidHJhbnNsYXRpb25zXCIpLmdldChiLm1lc3NhZ2UpO2QuYXBwZW5kKGMoZShiLmFyZ3MpKSksZFswXS5jbGFzc05hbWUrPVwiIHNlbGVjdDItcmVzdWx0c19fbWVzc2FnZVwiLHRoaXMuJHJlc3VsdHMuYXBwZW5kKGQpfSxjLnByb3RvdHlwZS5oaWRlTWVzc2FnZXM9ZnVuY3Rpb24oKXt0aGlzLiRyZXN1bHRzLmZpbmQoXCIuc2VsZWN0Mi1yZXN1bHRzX19tZXNzYWdlXCIpLnJlbW92ZSgpfSxjLnByb3RvdHlwZS5hcHBlbmQ9ZnVuY3Rpb24oYSl7dGhpcy5oaWRlTG9hZGluZygpO3ZhciBiPVtdO2lmKG51bGw9PWEucmVzdWx0c3x8MD09PWEucmVzdWx0cy5sZW5ndGgpcmV0dXJuIHZvaWQoMD09PXRoaXMuJHJlc3VsdHMuY2hpbGRyZW4oKS5sZW5ndGgmJnRoaXMudHJpZ2dlcihcInJlc3VsdHM6bWVzc2FnZVwiLHttZXNzYWdlOlwibm9SZXN1bHRzXCJ9KSk7YS5yZXN1bHRzPXRoaXMuc29ydChhLnJlc3VsdHMpO2Zvcih2YXIgYz0wO2M8YS5yZXN1bHRzLmxlbmd0aDtjKyspe3ZhciBkPWEucmVzdWx0c1tjXSxlPXRoaXMub3B0aW9uKGQpO2IucHVzaChlKX10aGlzLiRyZXN1bHRzLmFwcGVuZChiKX0sYy5wcm90b3R5cGUucG9zaXRpb249ZnVuY3Rpb24oYSxiKXt2YXIgYz1iLmZpbmQoXCIuc2VsZWN0Mi1yZXN1bHRzXCIpO2MuYXBwZW5kKGEpfSxjLnByb3RvdHlwZS5zb3J0PWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMub3B0aW9ucy5nZXQoXCJzb3J0ZXJcIik7cmV0dXJuIGIoYSl9LGMucHJvdG90eXBlLmhpZ2hsaWdodEZpcnN0SXRlbT1mdW5jdGlvbigpe3ZhciBhPXRoaXMuJHJlc3VsdHMuZmluZChcIi5zZWxlY3QyLXJlc3VsdHNfX29wdGlvblthcmlhLXNlbGVjdGVkXVwiKSxiPWEuZmlsdGVyKFwiW2FyaWEtc2VsZWN0ZWQ9dHJ1ZV1cIik7Yi5sZW5ndGg+MD9iLmZpcnN0KCkudHJpZ2dlcihcIm1vdXNlZW50ZXJcIik6YS5maXJzdCgpLnRyaWdnZXIoXCJtb3VzZWVudGVyXCIpLHRoaXMuZW5zdXJlSGlnaGxpZ2h0VmlzaWJsZSgpfSxjLnByb3RvdHlwZS5zZXRDbGFzc2VzPWZ1bmN0aW9uKCl7dmFyIGI9dGhpczt0aGlzLmRhdGEuY3VycmVudChmdW5jdGlvbihjKXt2YXIgZD1hLm1hcChjLGZ1bmN0aW9uKGEpe3JldHVybiBhLmlkLnRvU3RyaW5nKCl9KSxlPWIuJHJlc3VsdHMuZmluZChcIi5zZWxlY3QyLXJlc3VsdHNfX29wdGlvblthcmlhLXNlbGVjdGVkXVwiKTtlLmVhY2goZnVuY3Rpb24oKXt2YXIgYj1hKHRoaXMpLGM9YS5kYXRhKHRoaXMsXCJkYXRhXCIpLGU9XCJcIitjLmlkO251bGwhPWMuZWxlbWVudCYmYy5lbGVtZW50LnNlbGVjdGVkfHxudWxsPT1jLmVsZW1lbnQmJmEuaW5BcnJheShlLGQpPi0xP2IuYXR0cihcImFyaWEtc2VsZWN0ZWRcIixcInRydWVcIik6Yi5hdHRyKFwiYXJpYS1zZWxlY3RlZFwiLFwiZmFsc2VcIil9KX0pfSxjLnByb3RvdHlwZS5zaG93TG9hZGluZz1mdW5jdGlvbihhKXt0aGlzLmhpZGVMb2FkaW5nKCk7dmFyIGI9dGhpcy5vcHRpb25zLmdldChcInRyYW5zbGF0aW9uc1wiKS5nZXQoXCJzZWFyY2hpbmdcIiksYz17ZGlzYWJsZWQ6ITAsbG9hZGluZzohMCx0ZXh0OmIoYSl9LGQ9dGhpcy5vcHRpb24oYyk7ZC5jbGFzc05hbWUrPVwiIGxvYWRpbmctcmVzdWx0c1wiLHRoaXMuJHJlc3VsdHMucHJlcGVuZChkKX0sYy5wcm90b3R5cGUuaGlkZUxvYWRpbmc9ZnVuY3Rpb24oKXt0aGlzLiRyZXN1bHRzLmZpbmQoXCIubG9hZGluZy1yZXN1bHRzXCIpLnJlbW92ZSgpfSxjLnByb3RvdHlwZS5vcHRpb249ZnVuY3Rpb24oYil7dmFyIGM9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO2MuY2xhc3NOYW1lPVwic2VsZWN0Mi1yZXN1bHRzX19vcHRpb25cIjt2YXIgZD17cm9sZTpcInRyZWVpdGVtXCIsXCJhcmlhLXNlbGVjdGVkXCI6XCJmYWxzZVwifTtiLmRpc2FibGVkJiYoZGVsZXRlIGRbXCJhcmlhLXNlbGVjdGVkXCJdLGRbXCJhcmlhLWRpc2FibGVkXCJdPVwidHJ1ZVwiKSxudWxsPT1iLmlkJiZkZWxldGUgZFtcImFyaWEtc2VsZWN0ZWRcIl0sbnVsbCE9Yi5fcmVzdWx0SWQmJihjLmlkPWIuX3Jlc3VsdElkKSxiLnRpdGxlJiYoYy50aXRsZT1iLnRpdGxlKSxiLmNoaWxkcmVuJiYoZC5yb2xlPVwiZ3JvdXBcIixkW1wiYXJpYS1sYWJlbFwiXT1iLnRleHQsZGVsZXRlIGRbXCJhcmlhLXNlbGVjdGVkXCJdKTtmb3IodmFyIGUgaW4gZCl7dmFyIGY9ZFtlXTtjLnNldEF0dHJpYnV0ZShlLGYpfWlmKGIuY2hpbGRyZW4pe3ZhciBnPWEoYyksaD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3Ryb25nXCIpO2guY2xhc3NOYW1lPVwic2VsZWN0Mi1yZXN1bHRzX19ncm91cFwiO2EoaCk7dGhpcy50ZW1wbGF0ZShiLGgpO2Zvcih2YXIgaT1bXSxqPTA7ajxiLmNoaWxkcmVuLmxlbmd0aDtqKyspe3ZhciBrPWIuY2hpbGRyZW5bal0sbD10aGlzLm9wdGlvbihrKTtpLnB1c2gobCl9dmFyIG09YShcIjx1bD48L3VsPlwiLHtcImNsYXNzXCI6XCJzZWxlY3QyLXJlc3VsdHNfX29wdGlvbnMgc2VsZWN0Mi1yZXN1bHRzX19vcHRpb25zLS1uZXN0ZWRcIn0pO20uYXBwZW5kKGkpLGcuYXBwZW5kKGgpLGcuYXBwZW5kKG0pfWVsc2UgdGhpcy50ZW1wbGF0ZShiLGMpO3JldHVybiBhLmRhdGEoYyxcImRhdGFcIixiKSxjfSxjLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGIsYyl7dmFyIGQ9dGhpcyxlPWIuaWQrXCItcmVzdWx0c1wiO3RoaXMuJHJlc3VsdHMuYXR0cihcImlkXCIsZSksYi5vbihcInJlc3VsdHM6YWxsXCIsZnVuY3Rpb24oYSl7ZC5jbGVhcigpLGQuYXBwZW5kKGEuZGF0YSksYi5pc09wZW4oKSYmKGQuc2V0Q2xhc3NlcygpLGQuaGlnaGxpZ2h0Rmlyc3RJdGVtKCkpfSksYi5vbihcInJlc3VsdHM6YXBwZW5kXCIsZnVuY3Rpb24oYSl7ZC5hcHBlbmQoYS5kYXRhKSxiLmlzT3BlbigpJiZkLnNldENsYXNzZXMoKX0pLGIub24oXCJxdWVyeVwiLGZ1bmN0aW9uKGEpe2QuaGlkZU1lc3NhZ2VzKCksZC5zaG93TG9hZGluZyhhKX0pLGIub24oXCJzZWxlY3RcIixmdW5jdGlvbigpe2IuaXNPcGVuKCkmJihkLnNldENsYXNzZXMoKSxkLmhpZ2hsaWdodEZpcnN0SXRlbSgpKX0pLGIub24oXCJ1bnNlbGVjdFwiLGZ1bmN0aW9uKCl7Yi5pc09wZW4oKSYmKGQuc2V0Q2xhc3NlcygpLGQuaGlnaGxpZ2h0Rmlyc3RJdGVtKCkpfSksYi5vbihcIm9wZW5cIixmdW5jdGlvbigpe2QuJHJlc3VsdHMuYXR0cihcImFyaWEtZXhwYW5kZWRcIixcInRydWVcIiksZC4kcmVzdWx0cy5hdHRyKFwiYXJpYS1oaWRkZW5cIixcImZhbHNlXCIpLGQuc2V0Q2xhc3NlcygpLGQuZW5zdXJlSGlnaGxpZ2h0VmlzaWJsZSgpfSksYi5vbihcImNsb3NlXCIsZnVuY3Rpb24oKXtkLiRyZXN1bHRzLmF0dHIoXCJhcmlhLWV4cGFuZGVkXCIsXCJmYWxzZVwiKSxkLiRyZXN1bHRzLmF0dHIoXCJhcmlhLWhpZGRlblwiLFwidHJ1ZVwiKSxkLiRyZXN1bHRzLnJlbW92ZUF0dHIoXCJhcmlhLWFjdGl2ZWRlc2NlbmRhbnRcIil9KSxiLm9uKFwicmVzdWx0czp0b2dnbGVcIixmdW5jdGlvbigpe3ZhciBhPWQuZ2V0SGlnaGxpZ2h0ZWRSZXN1bHRzKCk7MCE9PWEubGVuZ3RoJiZhLnRyaWdnZXIoXCJtb3VzZXVwXCIpfSksYi5vbihcInJlc3VsdHM6c2VsZWN0XCIsZnVuY3Rpb24oKXt2YXIgYT1kLmdldEhpZ2hsaWdodGVkUmVzdWx0cygpO2lmKDAhPT1hLmxlbmd0aCl7dmFyIGI9YS5kYXRhKFwiZGF0YVwiKTtcInRydWVcIj09YS5hdHRyKFwiYXJpYS1zZWxlY3RlZFwiKT9kLnRyaWdnZXIoXCJjbG9zZVwiLHt9KTpkLnRyaWdnZXIoXCJzZWxlY3RcIix7ZGF0YTpifSl9fSksYi5vbihcInJlc3VsdHM6cHJldmlvdXNcIixmdW5jdGlvbigpe3ZhciBhPWQuZ2V0SGlnaGxpZ2h0ZWRSZXN1bHRzKCksYj1kLiRyZXN1bHRzLmZpbmQoXCJbYXJpYS1zZWxlY3RlZF1cIiksYz1iLmluZGV4KGEpO2lmKDAhPT1jKXt2YXIgZT1jLTE7MD09PWEubGVuZ3RoJiYoZT0wKTt2YXIgZj1iLmVxKGUpO2YudHJpZ2dlcihcIm1vdXNlZW50ZXJcIik7dmFyIGc9ZC4kcmVzdWx0cy5vZmZzZXQoKS50b3AsaD1mLm9mZnNldCgpLnRvcCxpPWQuJHJlc3VsdHMuc2Nyb2xsVG9wKCkrKGgtZyk7MD09PWU/ZC4kcmVzdWx0cy5zY3JvbGxUb3AoMCk6MD5oLWcmJmQuJHJlc3VsdHMuc2Nyb2xsVG9wKGkpfX0pLGIub24oXCJyZXN1bHRzOm5leHRcIixmdW5jdGlvbigpe3ZhciBhPWQuZ2V0SGlnaGxpZ2h0ZWRSZXN1bHRzKCksYj1kLiRyZXN1bHRzLmZpbmQoXCJbYXJpYS1zZWxlY3RlZF1cIiksYz1iLmluZGV4KGEpLGU9YysxO2lmKCEoZT49Yi5sZW5ndGgpKXt2YXIgZj1iLmVxKGUpO2YudHJpZ2dlcihcIm1vdXNlZW50ZXJcIik7dmFyIGc9ZC4kcmVzdWx0cy5vZmZzZXQoKS50b3ArZC4kcmVzdWx0cy5vdXRlckhlaWdodCghMSksaD1mLm9mZnNldCgpLnRvcCtmLm91dGVySGVpZ2h0KCExKSxpPWQuJHJlc3VsdHMuc2Nyb2xsVG9wKCkraC1nOzA9PT1lP2QuJHJlc3VsdHMuc2Nyb2xsVG9wKDApOmg+ZyYmZC4kcmVzdWx0cy5zY3JvbGxUb3AoaSl9fSksYi5vbihcInJlc3VsdHM6Zm9jdXNcIixmdW5jdGlvbihhKXthLmVsZW1lbnQuYWRkQ2xhc3MoXCJzZWxlY3QyLXJlc3VsdHNfX29wdGlvbi0taGlnaGxpZ2h0ZWRcIil9KSxiLm9uKFwicmVzdWx0czptZXNzYWdlXCIsZnVuY3Rpb24oYSl7ZC5kaXNwbGF5TWVzc2FnZShhKX0pLGEuZm4ubW91c2V3aGVlbCYmdGhpcy4kcmVzdWx0cy5vbihcIm1vdXNld2hlZWxcIixmdW5jdGlvbihhKXt2YXIgYj1kLiRyZXN1bHRzLnNjcm9sbFRvcCgpLGM9ZC4kcmVzdWx0cy5nZXQoMCkuc2Nyb2xsSGVpZ2h0LWIrYS5kZWx0YVksZT1hLmRlbHRhWT4wJiZiLWEuZGVsdGFZPD0wLGY9YS5kZWx0YVk8MCYmYzw9ZC4kcmVzdWx0cy5oZWlnaHQoKTtlPyhkLiRyZXN1bHRzLnNjcm9sbFRvcCgwKSxhLnByZXZlbnREZWZhdWx0KCksYS5zdG9wUHJvcGFnYXRpb24oKSk6ZiYmKGQuJHJlc3VsdHMuc2Nyb2xsVG9wKGQuJHJlc3VsdHMuZ2V0KDApLnNjcm9sbEhlaWdodC1kLiRyZXN1bHRzLmhlaWdodCgpKSxhLnByZXZlbnREZWZhdWx0KCksYS5zdG9wUHJvcGFnYXRpb24oKSl9KSx0aGlzLiRyZXN1bHRzLm9uKFwibW91c2V1cFwiLFwiLnNlbGVjdDItcmVzdWx0c19fb3B0aW9uW2FyaWEtc2VsZWN0ZWRdXCIsZnVuY3Rpb24oYil7dmFyIGM9YSh0aGlzKSxlPWMuZGF0YShcImRhdGFcIik7cmV0dXJuXCJ0cnVlXCI9PT1jLmF0dHIoXCJhcmlhLXNlbGVjdGVkXCIpP3ZvaWQoZC5vcHRpb25zLmdldChcIm11bHRpcGxlXCIpP2QudHJpZ2dlcihcInVuc2VsZWN0XCIse29yaWdpbmFsRXZlbnQ6YixkYXRhOmV9KTpkLnRyaWdnZXIoXCJjbG9zZVwiLHt9KSk6dm9pZCBkLnRyaWdnZXIoXCJzZWxlY3RcIix7b3JpZ2luYWxFdmVudDpiLGRhdGE6ZX0pfSksdGhpcy4kcmVzdWx0cy5vbihcIm1vdXNlZW50ZXJcIixcIi5zZWxlY3QyLXJlc3VsdHNfX29wdGlvblthcmlhLXNlbGVjdGVkXVwiLGZ1bmN0aW9uKGIpe3ZhciBjPWEodGhpcykuZGF0YShcImRhdGFcIik7ZC5nZXRIaWdobGlnaHRlZFJlc3VsdHMoKS5yZW1vdmVDbGFzcyhcInNlbGVjdDItcmVzdWx0c19fb3B0aW9uLS1oaWdobGlnaHRlZFwiKSxkLnRyaWdnZXIoXCJyZXN1bHRzOmZvY3VzXCIse2RhdGE6YyxlbGVtZW50OmEodGhpcyl9KX0pfSxjLnByb3RvdHlwZS5nZXRIaWdobGlnaHRlZFJlc3VsdHM9ZnVuY3Rpb24oKXt2YXIgYT10aGlzLiRyZXN1bHRzLmZpbmQoXCIuc2VsZWN0Mi1yZXN1bHRzX19vcHRpb24tLWhpZ2hsaWdodGVkXCIpO3JldHVybiBhfSxjLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy4kcmVzdWx0cy5yZW1vdmUoKX0sYy5wcm90b3R5cGUuZW5zdXJlSGlnaGxpZ2h0VmlzaWJsZT1mdW5jdGlvbigpe3ZhciBhPXRoaXMuZ2V0SGlnaGxpZ2h0ZWRSZXN1bHRzKCk7aWYoMCE9PWEubGVuZ3RoKXt2YXIgYj10aGlzLiRyZXN1bHRzLmZpbmQoXCJbYXJpYS1zZWxlY3RlZF1cIiksYz1iLmluZGV4KGEpLGQ9dGhpcy4kcmVzdWx0cy5vZmZzZXQoKS50b3AsZT1hLm9mZnNldCgpLnRvcCxmPXRoaXMuJHJlc3VsdHMuc2Nyb2xsVG9wKCkrKGUtZCksZz1lLWQ7Zi09MiphLm91dGVySGVpZ2h0KCExKSwyPj1jP3RoaXMuJHJlc3VsdHMuc2Nyb2xsVG9wKDApOihnPnRoaXMuJHJlc3VsdHMub3V0ZXJIZWlnaHQoKXx8MD5nKSYmdGhpcy4kcmVzdWx0cy5zY3JvbGxUb3AoZil9fSxjLnByb3RvdHlwZS50ZW1wbGF0ZT1mdW5jdGlvbihiLGMpe3ZhciBkPXRoaXMub3B0aW9ucy5nZXQoXCJ0ZW1wbGF0ZVJlc3VsdFwiKSxlPXRoaXMub3B0aW9ucy5nZXQoXCJlc2NhcGVNYXJrdXBcIiksZj1kKGIsYyk7bnVsbD09Zj9jLnN0eWxlLmRpc3BsYXk9XCJub25lXCI6XCJzdHJpbmdcIj09dHlwZW9mIGY/Yy5pbm5lckhUTUw9ZShmKTphKGMpLmFwcGVuZChmKX0sY30pLGIuZGVmaW5lKFwic2VsZWN0Mi9rZXlzXCIsW10sZnVuY3Rpb24oKXt2YXIgYT17QkFDS1NQQUNFOjgsVEFCOjksRU5URVI6MTMsU0hJRlQ6MTYsQ1RSTDoxNyxBTFQ6MTgsRVNDOjI3LFNQQUNFOjMyLFBBR0VfVVA6MzMsUEFHRV9ET1dOOjM0LEVORDozNSxIT01FOjM2LExFRlQ6MzcsVVA6MzgsUklHSFQ6MzksRE9XTjo0MCxERUxFVEU6NDZ9O3JldHVybiBhfSksYi5kZWZpbmUoXCJzZWxlY3QyL3NlbGVjdGlvbi9iYXNlXCIsW1wianF1ZXJ5XCIsXCIuLi91dGlsc1wiLFwiLi4va2V5c1wiXSxmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZChhLGIpe3RoaXMuJGVsZW1lbnQ9YSx0aGlzLm9wdGlvbnM9YixkLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMpfXJldHVybiBiLkV4dGVuZChkLGIuT2JzZXJ2YWJsZSksZC5wcm90b3R5cGUucmVuZGVyPWZ1bmN0aW9uKCl7dmFyIGI9YSgnPHNwYW4gY2xhc3M9XCJzZWxlY3QyLXNlbGVjdGlvblwiIHJvbGU9XCJjb21ib2JveFwiICBhcmlhLWhhc3BvcHVwPVwidHJ1ZVwiIGFyaWEtZXhwYW5kZWQ9XCJmYWxzZVwiPjwvc3Bhbj4nKTtyZXR1cm4gdGhpcy5fdGFiaW5kZXg9MCxudWxsIT10aGlzLiRlbGVtZW50LmRhdGEoXCJvbGQtdGFiaW5kZXhcIik/dGhpcy5fdGFiaW5kZXg9dGhpcy4kZWxlbWVudC5kYXRhKFwib2xkLXRhYmluZGV4XCIpOm51bGwhPXRoaXMuJGVsZW1lbnQuYXR0cihcInRhYmluZGV4XCIpJiYodGhpcy5fdGFiaW5kZXg9dGhpcy4kZWxlbWVudC5hdHRyKFwidGFiaW5kZXhcIikpLGIuYXR0cihcInRpdGxlXCIsdGhpcy4kZWxlbWVudC5hdHRyKFwidGl0bGVcIikpLGIuYXR0cihcInRhYmluZGV4XCIsdGhpcy5fdGFiaW5kZXgpLHRoaXMuJHNlbGVjdGlvbj1iLGJ9LGQucHJvdG90eXBlLmJpbmQ9ZnVuY3Rpb24oYSxiKXt2YXIgZD10aGlzLGU9KGEuaWQrXCItY29udGFpbmVyXCIsYS5pZCtcIi1yZXN1bHRzXCIpO3RoaXMuY29udGFpbmVyPWEsdGhpcy4kc2VsZWN0aW9uLm9uKFwiZm9jdXNcIixmdW5jdGlvbihhKXtkLnRyaWdnZXIoXCJmb2N1c1wiLGEpfSksdGhpcy4kc2VsZWN0aW9uLm9uKFwiYmx1clwiLGZ1bmN0aW9uKGEpe2QuX2hhbmRsZUJsdXIoYSl9KSx0aGlzLiRzZWxlY3Rpb24ub24oXCJrZXlkb3duXCIsZnVuY3Rpb24oYSl7ZC50cmlnZ2VyKFwia2V5cHJlc3NcIixhKSxhLndoaWNoPT09Yy5TUEFDRSYmYS5wcmV2ZW50RGVmYXVsdCgpfSksYS5vbihcInJlc3VsdHM6Zm9jdXNcIixmdW5jdGlvbihhKXtkLiRzZWxlY3Rpb24uYXR0cihcImFyaWEtYWN0aXZlZGVzY2VuZGFudFwiLGEuZGF0YS5fcmVzdWx0SWQpfSksYS5vbihcInNlbGVjdGlvbjp1cGRhdGVcIixmdW5jdGlvbihhKXtkLnVwZGF0ZShhLmRhdGEpfSksYS5vbihcIm9wZW5cIixmdW5jdGlvbigpe2QuJHNlbGVjdGlvbi5hdHRyKFwiYXJpYS1leHBhbmRlZFwiLFwidHJ1ZVwiKSxkLiRzZWxlY3Rpb24uYXR0cihcImFyaWEtb3duc1wiLGUpLGQuX2F0dGFjaENsb3NlSGFuZGxlcihhKX0pLGEub24oXCJjbG9zZVwiLGZ1bmN0aW9uKCl7ZC4kc2VsZWN0aW9uLmF0dHIoXCJhcmlhLWV4cGFuZGVkXCIsXCJmYWxzZVwiKSxkLiRzZWxlY3Rpb24ucmVtb3ZlQXR0cihcImFyaWEtYWN0aXZlZGVzY2VuZGFudFwiKSxkLiRzZWxlY3Rpb24ucmVtb3ZlQXR0cihcImFyaWEtb3duc1wiKSxkLiRzZWxlY3Rpb24uZm9jdXMoKSxkLl9kZXRhY2hDbG9zZUhhbmRsZXIoYSl9KSxhLm9uKFwiZW5hYmxlXCIsZnVuY3Rpb24oKXtkLiRzZWxlY3Rpb24uYXR0cihcInRhYmluZGV4XCIsZC5fdGFiaW5kZXgpfSksYS5vbihcImRpc2FibGVcIixmdW5jdGlvbigpe2QuJHNlbGVjdGlvbi5hdHRyKFwidGFiaW5kZXhcIixcIi0xXCIpfSl9LGQucHJvdG90eXBlLl9oYW5kbGVCbHVyPWZ1bmN0aW9uKGIpe3ZhciBjPXRoaXM7d2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKXtkb2N1bWVudC5hY3RpdmVFbGVtZW50PT1jLiRzZWxlY3Rpb25bMF18fGEuY29udGFpbnMoYy4kc2VsZWN0aW9uWzBdLGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpfHxjLnRyaWdnZXIoXCJibHVyXCIsYil9LDEpfSxkLnByb3RvdHlwZS5fYXR0YWNoQ2xvc2VIYW5kbGVyPWZ1bmN0aW9uKGIpe2EoZG9jdW1lbnQuYm9keSkub24oXCJtb3VzZWRvd24uc2VsZWN0Mi5cIitiLmlkLGZ1bmN0aW9uKGIpe3ZhciBjPWEoYi50YXJnZXQpLGQ9Yy5jbG9zZXN0KFwiLnNlbGVjdDJcIiksZT1hKFwiLnNlbGVjdDIuc2VsZWN0Mi1jb250YWluZXItLW9wZW5cIik7ZS5lYWNoKGZ1bmN0aW9uKCl7dmFyIGI9YSh0aGlzKTtpZih0aGlzIT1kWzBdKXt2YXIgYz1iLmRhdGEoXCJlbGVtZW50XCIpO2Muc2VsZWN0MihcImNsb3NlXCIpfX0pfSl9LGQucHJvdG90eXBlLl9kZXRhY2hDbG9zZUhhbmRsZXI9ZnVuY3Rpb24oYil7YShkb2N1bWVudC5ib2R5KS5vZmYoXCJtb3VzZWRvd24uc2VsZWN0Mi5cIitiLmlkKX0sZC5wcm90b3R5cGUucG9zaXRpb249ZnVuY3Rpb24oYSxiKXt2YXIgYz1iLmZpbmQoXCIuc2VsZWN0aW9uXCIpO2MuYXBwZW5kKGEpfSxkLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5fZGV0YWNoQ2xvc2VIYW5kbGVyKHRoaXMuY29udGFpbmVyKX0sZC5wcm90b3R5cGUudXBkYXRlPWZ1bmN0aW9uKGEpe3Rocm93IG5ldyBFcnJvcihcIlRoZSBgdXBkYXRlYCBtZXRob2QgbXVzdCBiZSBkZWZpbmVkIGluIGNoaWxkIGNsYXNzZXMuXCIpfSxkfSksYi5kZWZpbmUoXCJzZWxlY3QyL3NlbGVjdGlvbi9zaW5nbGVcIixbXCJqcXVlcnlcIixcIi4vYmFzZVwiLFwiLi4vdXRpbHNcIixcIi4uL2tleXNcIl0sZnVuY3Rpb24oYSxiLGMsZCl7ZnVuY3Rpb24gZSgpe2UuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsYXJndW1lbnRzKX1yZXR1cm4gYy5FeHRlbmQoZSxiKSxlLnByb3RvdHlwZS5yZW5kZXI9ZnVuY3Rpb24oKXt2YXIgYT1lLl9fc3VwZXJfXy5yZW5kZXIuY2FsbCh0aGlzKTtyZXR1cm4gYS5hZGRDbGFzcyhcInNlbGVjdDItc2VsZWN0aW9uLS1zaW5nbGVcIiksYS5odG1sKCc8c3BhbiBjbGFzcz1cInNlbGVjdDItc2VsZWN0aW9uX19yZW5kZXJlZFwiPjwvc3Bhbj48c3BhbiBjbGFzcz1cInNlbGVjdDItc2VsZWN0aW9uX19hcnJvd1wiIHJvbGU9XCJwcmVzZW50YXRpb25cIj48YiByb2xlPVwicHJlc2VudGF0aW9uXCI+PC9iPjwvc3Bhbj4nKSxhfSxlLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcztlLl9fc3VwZXJfXy5iaW5kLmFwcGx5KHRoaXMsYXJndW1lbnRzKTt2YXIgZD1hLmlkK1wiLWNvbnRhaW5lclwiO3RoaXMuJHNlbGVjdGlvbi5maW5kKFwiLnNlbGVjdDItc2VsZWN0aW9uX19yZW5kZXJlZFwiKS5hdHRyKFwiaWRcIixkKSx0aGlzLiRzZWxlY3Rpb24uYXR0cihcImFyaWEtbGFiZWxsZWRieVwiLGQpLHRoaXMuJHNlbGVjdGlvbi5vbihcIm1vdXNlZG93blwiLGZ1bmN0aW9uKGEpezE9PT1hLndoaWNoJiZjLnRyaWdnZXIoXCJ0b2dnbGVcIix7b3JpZ2luYWxFdmVudDphfSl9KSx0aGlzLiRzZWxlY3Rpb24ub24oXCJmb2N1c1wiLGZ1bmN0aW9uKGEpe30pLHRoaXMuJHNlbGVjdGlvbi5vbihcImJsdXJcIixmdW5jdGlvbihhKXt9KSxhLm9uKFwiZm9jdXNcIixmdW5jdGlvbihiKXthLmlzT3BlbigpfHxjLiRzZWxlY3Rpb24uZm9jdXMoKX0pLGEub24oXCJzZWxlY3Rpb246dXBkYXRlXCIsZnVuY3Rpb24oYSl7Yy51cGRhdGUoYS5kYXRhKX0pfSxlLnByb3RvdHlwZS5jbGVhcj1mdW5jdGlvbigpe3RoaXMuJHNlbGVjdGlvbi5maW5kKFwiLnNlbGVjdDItc2VsZWN0aW9uX19yZW5kZXJlZFwiKS5lbXB0eSgpfSxlLnByb3RvdHlwZS5kaXNwbGF5PWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcy5vcHRpb25zLmdldChcInRlbXBsYXRlU2VsZWN0aW9uXCIpLGQ9dGhpcy5vcHRpb25zLmdldChcImVzY2FwZU1hcmt1cFwiKTtyZXR1cm4gZChjKGEsYikpfSxlLnByb3RvdHlwZS5zZWxlY3Rpb25Db250YWluZXI9ZnVuY3Rpb24oKXtyZXR1cm4gYShcIjxzcGFuPjwvc3Bhbj5cIil9LGUucHJvdG90eXBlLnVwZGF0ZT1mdW5jdGlvbihhKXtpZigwPT09YS5sZW5ndGgpcmV0dXJuIHZvaWQgdGhpcy5jbGVhcigpO3ZhciBiPWFbMF0sYz10aGlzLiRzZWxlY3Rpb24uZmluZChcIi5zZWxlY3QyLXNlbGVjdGlvbl9fcmVuZGVyZWRcIiksZD10aGlzLmRpc3BsYXkoYixjKTtjLmVtcHR5KCkuYXBwZW5kKGQpLGMucHJvcChcInRpdGxlXCIsYi50aXRsZXx8Yi50ZXh0KX0sZX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9zZWxlY3Rpb24vbXVsdGlwbGVcIixbXCJqcXVlcnlcIixcIi4vYmFzZVwiLFwiLi4vdXRpbHNcIl0sZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQoYSxiKXtkLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLGFyZ3VtZW50cyl9cmV0dXJuIGMuRXh0ZW5kKGQsYiksZC5wcm90b3R5cGUucmVuZGVyPWZ1bmN0aW9uKCl7dmFyIGE9ZC5fX3N1cGVyX18ucmVuZGVyLmNhbGwodGhpcyk7cmV0dXJuIGEuYWRkQ2xhc3MoXCJzZWxlY3QyLXNlbGVjdGlvbi0tbXVsdGlwbGVcIiksYS5odG1sKCc8dWwgY2xhc3M9XCJzZWxlY3QyLXNlbGVjdGlvbl9fcmVuZGVyZWRcIj48L3VsPicpLGF9LGQucHJvdG90eXBlLmJpbmQ9ZnVuY3Rpb24oYixjKXt2YXIgZT10aGlzO2QuX19zdXBlcl9fLmJpbmQuYXBwbHkodGhpcyxhcmd1bWVudHMpLHRoaXMuJHNlbGVjdGlvbi5vbihcImNsaWNrXCIsZnVuY3Rpb24oYSl7ZS50cmlnZ2VyKFwidG9nZ2xlXCIse29yaWdpbmFsRXZlbnQ6YX0pfSksdGhpcy4kc2VsZWN0aW9uLm9uKFwiY2xpY2tcIixcIi5zZWxlY3QyLXNlbGVjdGlvbl9fY2hvaWNlX19yZW1vdmVcIixmdW5jdGlvbihiKXtpZighZS5vcHRpb25zLmdldChcImRpc2FibGVkXCIpKXt2YXIgYz1hKHRoaXMpLGQ9Yy5wYXJlbnQoKSxmPWQuZGF0YShcImRhdGFcIik7ZS50cmlnZ2VyKFwidW5zZWxlY3RcIix7b3JpZ2luYWxFdmVudDpiLGRhdGE6Zn0pfX0pfSxkLnByb3RvdHlwZS5jbGVhcj1mdW5jdGlvbigpe3RoaXMuJHNlbGVjdGlvbi5maW5kKFwiLnNlbGVjdDItc2VsZWN0aW9uX19yZW5kZXJlZFwiKS5lbXB0eSgpfSxkLnByb3RvdHlwZS5kaXNwbGF5PWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcy5vcHRpb25zLmdldChcInRlbXBsYXRlU2VsZWN0aW9uXCIpLGQ9dGhpcy5vcHRpb25zLmdldChcImVzY2FwZU1hcmt1cFwiKTtyZXR1cm4gZChjKGEsYikpfSxkLnByb3RvdHlwZS5zZWxlY3Rpb25Db250YWluZXI9ZnVuY3Rpb24oKXt2YXIgYj1hKCc8bGkgY2xhc3M9XCJzZWxlY3QyLXNlbGVjdGlvbl9fY2hvaWNlXCI+PHNwYW4gY2xhc3M9XCJzZWxlY3QyLXNlbGVjdGlvbl9fY2hvaWNlX19yZW1vdmVcIiByb2xlPVwicHJlc2VudGF0aW9uXCI+JnRpbWVzOzwvc3Bhbj48L2xpPicpO3JldHVybiBifSxkLnByb3RvdHlwZS51cGRhdGU9ZnVuY3Rpb24oYSl7aWYodGhpcy5jbGVhcigpLDAhPT1hLmxlbmd0aCl7Zm9yKHZhciBiPVtdLGQ9MDtkPGEubGVuZ3RoO2QrKyl7dmFyIGU9YVtkXSxmPXRoaXMuc2VsZWN0aW9uQ29udGFpbmVyKCksZz10aGlzLmRpc3BsYXkoZSxmKTtmLmFwcGVuZChnKSxmLnByb3AoXCJ0aXRsZVwiLGUudGl0bGV8fGUudGV4dCksZi5kYXRhKFwiZGF0YVwiLGUpLGIucHVzaChmKX12YXIgaD10aGlzLiRzZWxlY3Rpb24uZmluZChcIi5zZWxlY3QyLXNlbGVjdGlvbl9fcmVuZGVyZWRcIik7Yy5hcHBlbmRNYW55KGgsYil9fSxkfSksYi5kZWZpbmUoXCJzZWxlY3QyL3NlbGVjdGlvbi9wbGFjZWhvbGRlclwiLFtcIi4uL3V0aWxzXCJdLGZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoYSxiLGMpe3RoaXMucGxhY2Vob2xkZXI9dGhpcy5ub3JtYWxpemVQbGFjZWhvbGRlcihjLmdldChcInBsYWNlaG9sZGVyXCIpKSxhLmNhbGwodGhpcyxiLGMpfXJldHVybiBiLnByb3RvdHlwZS5ub3JtYWxpemVQbGFjZWhvbGRlcj1mdW5jdGlvbihhLGIpe3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiBiJiYoYj17aWQ6XCJcIix0ZXh0OmJ9KSxifSxiLnByb3RvdHlwZS5jcmVhdGVQbGFjZWhvbGRlcj1mdW5jdGlvbihhLGIpe3ZhciBjPXRoaXMuc2VsZWN0aW9uQ29udGFpbmVyKCk7cmV0dXJuIGMuaHRtbCh0aGlzLmRpc3BsYXkoYikpLGMuYWRkQ2xhc3MoXCJzZWxlY3QyLXNlbGVjdGlvbl9fcGxhY2Vob2xkZXJcIikucmVtb3ZlQ2xhc3MoXCJzZWxlY3QyLXNlbGVjdGlvbl9fY2hvaWNlXCIpLGN9LGIucHJvdG90eXBlLnVwZGF0ZT1mdW5jdGlvbihhLGIpe3ZhciBjPTE9PWIubGVuZ3RoJiZiWzBdLmlkIT10aGlzLnBsYWNlaG9sZGVyLmlkLGQ9Yi5sZW5ndGg+MTtpZihkfHxjKXJldHVybiBhLmNhbGwodGhpcyxiKTt0aGlzLmNsZWFyKCk7dmFyIGU9dGhpcy5jcmVhdGVQbGFjZWhvbGRlcih0aGlzLnBsYWNlaG9sZGVyKTt0aGlzLiRzZWxlY3Rpb24uZmluZChcIi5zZWxlY3QyLXNlbGVjdGlvbl9fcmVuZGVyZWRcIikuYXBwZW5kKGUpfSxifSksYi5kZWZpbmUoXCJzZWxlY3QyL3NlbGVjdGlvbi9hbGxvd0NsZWFyXCIsW1wianF1ZXJ5XCIsXCIuLi9rZXlzXCJdLGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYygpe31yZXR1cm4gYy5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihhLGIsYyl7dmFyIGQ9dGhpczthLmNhbGwodGhpcyxiLGMpLG51bGw9PXRoaXMucGxhY2Vob2xkZXImJnRoaXMub3B0aW9ucy5nZXQoXCJkZWJ1Z1wiKSYmd2luZG93LmNvbnNvbGUmJmNvbnNvbGUuZXJyb3ImJmNvbnNvbGUuZXJyb3IoXCJTZWxlY3QyOiBUaGUgYGFsbG93Q2xlYXJgIG9wdGlvbiBzaG91bGQgYmUgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIHRoZSBgcGxhY2Vob2xkZXJgIG9wdGlvbi5cIiksdGhpcy4kc2VsZWN0aW9uLm9uKFwibW91c2Vkb3duXCIsXCIuc2VsZWN0Mi1zZWxlY3Rpb25fX2NsZWFyXCIsZnVuY3Rpb24oYSl7ZC5faGFuZGxlQ2xlYXIoYSl9KSxiLm9uKFwia2V5cHJlc3NcIixmdW5jdGlvbihhKXtkLl9oYW5kbGVLZXlib2FyZENsZWFyKGEsYil9KX0sYy5wcm90b3R5cGUuX2hhbmRsZUNsZWFyPWZ1bmN0aW9uKGEsYil7aWYoIXRoaXMub3B0aW9ucy5nZXQoXCJkaXNhYmxlZFwiKSl7dmFyIGM9dGhpcy4kc2VsZWN0aW9uLmZpbmQoXCIuc2VsZWN0Mi1zZWxlY3Rpb25fX2NsZWFyXCIpO2lmKDAhPT1jLmxlbmd0aCl7Yi5zdG9wUHJvcGFnYXRpb24oKTtmb3IodmFyIGQ9Yy5kYXRhKFwiZGF0YVwiKSxlPTA7ZTxkLmxlbmd0aDtlKyspe3ZhciBmPXtkYXRhOmRbZV19O2lmKHRoaXMudHJpZ2dlcihcInVuc2VsZWN0XCIsZiksZi5wcmV2ZW50ZWQpcmV0dXJufXRoaXMuJGVsZW1lbnQudmFsKHRoaXMucGxhY2Vob2xkZXIuaWQpLnRyaWdnZXIoXCJjaGFuZ2VcIiksdGhpcy50cmlnZ2VyKFwidG9nZ2xlXCIse30pfX19LGMucHJvdG90eXBlLl9oYW5kbGVLZXlib2FyZENsZWFyPWZ1bmN0aW9uKGEsYyxkKXtkLmlzT3BlbigpfHwoYy53aGljaD09Yi5ERUxFVEV8fGMud2hpY2g9PWIuQkFDS1NQQUNFKSYmdGhpcy5faGFuZGxlQ2xlYXIoYyl9LGMucHJvdG90eXBlLnVwZGF0ZT1mdW5jdGlvbihiLGMpe2lmKGIuY2FsbCh0aGlzLGMpLCEodGhpcy4kc2VsZWN0aW9uLmZpbmQoXCIuc2VsZWN0Mi1zZWxlY3Rpb25fX3BsYWNlaG9sZGVyXCIpLmxlbmd0aD4wfHwwPT09Yy5sZW5ndGgpKXt2YXIgZD1hKCc8c3BhbiBjbGFzcz1cInNlbGVjdDItc2VsZWN0aW9uX19jbGVhclwiPiZ0aW1lczs8L3NwYW4+Jyk7ZC5kYXRhKFwiZGF0YVwiLGMpLHRoaXMuJHNlbGVjdGlvbi5maW5kKFwiLnNlbGVjdDItc2VsZWN0aW9uX19yZW5kZXJlZFwiKS5wcmVwZW5kKGQpfX0sY30pLGIuZGVmaW5lKFwic2VsZWN0Mi9zZWxlY3Rpb24vc2VhcmNoXCIsW1wianF1ZXJ5XCIsXCIuLi91dGlsc1wiLFwiLi4va2V5c1wiXSxmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZChhLGIsYyl7YS5jYWxsKHRoaXMsYixjKX1yZXR1cm4gZC5wcm90b3R5cGUucmVuZGVyPWZ1bmN0aW9uKGIpe3ZhciBjPWEoJzxsaSBjbGFzcz1cInNlbGVjdDItc2VhcmNoIHNlbGVjdDItc2VhcmNoLS1pbmxpbmVcIj48aW5wdXQgY2xhc3M9XCJzZWxlY3QyLXNlYXJjaF9fZmllbGRcIiB0eXBlPVwic2VhcmNoXCIgdGFiaW5kZXg9XCItMVwiIGF1dG9jb21wbGV0ZT1cIm9mZlwiIGF1dG9jb3JyZWN0PVwib2ZmXCIgYXV0b2NhcGl0YWxpemU9XCJvZmZcIiBzcGVsbGNoZWNrPVwiZmFsc2VcIiByb2xlPVwidGV4dGJveFwiIGFyaWEtYXV0b2NvbXBsZXRlPVwibGlzdFwiIC8+PC9saT4nKTt0aGlzLiRzZWFyY2hDb250YWluZXI9Yyx0aGlzLiRzZWFyY2g9Yy5maW5kKFwiaW5wdXRcIik7dmFyIGQ9Yi5jYWxsKHRoaXMpO3JldHVybiB0aGlzLl90cmFuc2ZlclRhYkluZGV4KCksZH0sZC5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihhLGIsZCl7dmFyIGU9dGhpczthLmNhbGwodGhpcyxiLGQpLGIub24oXCJvcGVuXCIsZnVuY3Rpb24oKXtlLiRzZWFyY2gudHJpZ2dlcihcImZvY3VzXCIpfSksYi5vbihcImNsb3NlXCIsZnVuY3Rpb24oKXtlLiRzZWFyY2gudmFsKFwiXCIpLGUuJHNlYXJjaC5yZW1vdmVBdHRyKFwiYXJpYS1hY3RpdmVkZXNjZW5kYW50XCIpLGUuJHNlYXJjaC50cmlnZ2VyKFwiZm9jdXNcIil9KSxiLm9uKFwiZW5hYmxlXCIsZnVuY3Rpb24oKXtlLiRzZWFyY2gucHJvcChcImRpc2FibGVkXCIsITEpLGUuX3RyYW5zZmVyVGFiSW5kZXgoKX0pLGIub24oXCJkaXNhYmxlXCIsZnVuY3Rpb24oKXtlLiRzZWFyY2gucHJvcChcImRpc2FibGVkXCIsITApfSksYi5vbihcImZvY3VzXCIsZnVuY3Rpb24oYSl7ZS4kc2VhcmNoLnRyaWdnZXIoXCJmb2N1c1wiKX0pLGIub24oXCJyZXN1bHRzOmZvY3VzXCIsZnVuY3Rpb24oYSl7ZS4kc2VhcmNoLmF0dHIoXCJhcmlhLWFjdGl2ZWRlc2NlbmRhbnRcIixhLmlkKX0pLHRoaXMuJHNlbGVjdGlvbi5vbihcImZvY3VzaW5cIixcIi5zZWxlY3QyLXNlYXJjaC0taW5saW5lXCIsZnVuY3Rpb24oYSl7ZS50cmlnZ2VyKFwiZm9jdXNcIixhKX0pLHRoaXMuJHNlbGVjdGlvbi5vbihcImZvY3Vzb3V0XCIsXCIuc2VsZWN0Mi1zZWFyY2gtLWlubGluZVwiLGZ1bmN0aW9uKGEpe2UuX2hhbmRsZUJsdXIoYSl9KSx0aGlzLiRzZWxlY3Rpb24ub24oXCJrZXlkb3duXCIsXCIuc2VsZWN0Mi1zZWFyY2gtLWlubGluZVwiLGZ1bmN0aW9uKGEpe2Euc3RvcFByb3BhZ2F0aW9uKCksZS50cmlnZ2VyKFwia2V5cHJlc3NcIixhKSxlLl9rZXlVcFByZXZlbnRlZD1hLmlzRGVmYXVsdFByZXZlbnRlZCgpO3ZhciBiPWEud2hpY2g7aWYoYj09PWMuQkFDS1NQQUNFJiZcIlwiPT09ZS4kc2VhcmNoLnZhbCgpKXt2YXIgZD1lLiRzZWFyY2hDb250YWluZXIucHJldihcIi5zZWxlY3QyLXNlbGVjdGlvbl9fY2hvaWNlXCIpO2lmKGQubGVuZ3RoPjApe3ZhciBmPWQuZGF0YShcImRhdGFcIik7ZS5zZWFyY2hSZW1vdmVDaG9pY2UoZiksYS5wcmV2ZW50RGVmYXVsdCgpfX19KTt2YXIgZj1kb2N1bWVudC5kb2N1bWVudE1vZGUsZz1mJiYxMT49Zjt0aGlzLiRzZWxlY3Rpb24ub24oXCJpbnB1dC5zZWFyY2hjaGVja1wiLFwiLnNlbGVjdDItc2VhcmNoLS1pbmxpbmVcIixmdW5jdGlvbihhKXtyZXR1cm4gZz92b2lkIGUuJHNlbGVjdGlvbi5vZmYoXCJpbnB1dC5zZWFyY2ggaW5wdXQuc2VhcmNoY2hlY2tcIik6dm9pZCBlLiRzZWxlY3Rpb24ub2ZmKFwia2V5dXAuc2VhcmNoXCIpfSksdGhpcy4kc2VsZWN0aW9uLm9uKFwia2V5dXAuc2VhcmNoIGlucHV0LnNlYXJjaFwiLFwiLnNlbGVjdDItc2VhcmNoLS1pbmxpbmVcIixmdW5jdGlvbihhKXtpZihnJiZcImlucHV0XCI9PT1hLnR5cGUpcmV0dXJuIHZvaWQgZS4kc2VsZWN0aW9uLm9mZihcImlucHV0LnNlYXJjaCBpbnB1dC5zZWFyY2hjaGVja1wiKTt2YXIgYj1hLndoaWNoO2IhPWMuU0hJRlQmJmIhPWMuQ1RSTCYmYiE9Yy5BTFQmJmIhPWMuVEFCJiZlLmhhbmRsZVNlYXJjaChhKX0pfSxkLnByb3RvdHlwZS5fdHJhbnNmZXJUYWJJbmRleD1mdW5jdGlvbihhKXt0aGlzLiRzZWFyY2guYXR0cihcInRhYmluZGV4XCIsdGhpcy4kc2VsZWN0aW9uLmF0dHIoXCJ0YWJpbmRleFwiKSksdGhpcy4kc2VsZWN0aW9uLmF0dHIoXCJ0YWJpbmRleFwiLFwiLTFcIil9LGQucHJvdG90eXBlLmNyZWF0ZVBsYWNlaG9sZGVyPWZ1bmN0aW9uKGEsYil7dGhpcy4kc2VhcmNoLmF0dHIoXCJwbGFjZWhvbGRlclwiLGIudGV4dCl9LGQucHJvdG90eXBlLnVwZGF0ZT1mdW5jdGlvbihhLGIpe3ZhciBjPXRoaXMuJHNlYXJjaFswXT09ZG9jdW1lbnQuYWN0aXZlRWxlbWVudDt0aGlzLiRzZWFyY2guYXR0cihcInBsYWNlaG9sZGVyXCIsXCJcIiksYS5jYWxsKHRoaXMsYiksdGhpcy4kc2VsZWN0aW9uLmZpbmQoXCIuc2VsZWN0Mi1zZWxlY3Rpb25fX3JlbmRlcmVkXCIpLmFwcGVuZCh0aGlzLiRzZWFyY2hDb250YWluZXIpLHRoaXMucmVzaXplU2VhcmNoKCksYyYmdGhpcy4kc2VhcmNoLmZvY3VzKCl9LGQucHJvdG90eXBlLmhhbmRsZVNlYXJjaD1mdW5jdGlvbigpe2lmKHRoaXMucmVzaXplU2VhcmNoKCksIXRoaXMuX2tleVVwUHJldmVudGVkKXt2YXIgYT10aGlzLiRzZWFyY2gudmFsKCk7dGhpcy50cmlnZ2VyKFwicXVlcnlcIix7dGVybTphfSl9dGhpcy5fa2V5VXBQcmV2ZW50ZWQ9ITF9LGQucHJvdG90eXBlLnNlYXJjaFJlbW92ZUNob2ljZT1mdW5jdGlvbihhLGIpe3RoaXMudHJpZ2dlcihcInVuc2VsZWN0XCIse2RhdGE6Yn0pLHRoaXMuJHNlYXJjaC52YWwoYi50ZXh0KSx0aGlzLmhhbmRsZVNlYXJjaCgpfSxkLnByb3RvdHlwZS5yZXNpemVTZWFyY2g9ZnVuY3Rpb24oKXt0aGlzLiRzZWFyY2guY3NzKFwid2lkdGhcIixcIjI1cHhcIik7dmFyIGE9XCJcIjtpZihcIlwiIT09dGhpcy4kc2VhcmNoLmF0dHIoXCJwbGFjZWhvbGRlclwiKSlhPXRoaXMuJHNlbGVjdGlvbi5maW5kKFwiLnNlbGVjdDItc2VsZWN0aW9uX19yZW5kZXJlZFwiKS5pbm5lcldpZHRoKCk7ZWxzZXt2YXIgYj10aGlzLiRzZWFyY2gudmFsKCkubGVuZ3RoKzE7YT0uNzUqYitcImVtXCJ9dGhpcy4kc2VhcmNoLmNzcyhcIndpZHRoXCIsYSl9LGR9KSxiLmRlZmluZShcInNlbGVjdDIvc2VsZWN0aW9uL2V2ZW50UmVsYXlcIixbXCJqcXVlcnlcIl0sZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYigpe31yZXR1cm4gYi5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihiLGMsZCl7dmFyIGU9dGhpcyxmPVtcIm9wZW5cIixcIm9wZW5pbmdcIixcImNsb3NlXCIsXCJjbG9zaW5nXCIsXCJzZWxlY3RcIixcInNlbGVjdGluZ1wiLFwidW5zZWxlY3RcIixcInVuc2VsZWN0aW5nXCJdLGc9W1wib3BlbmluZ1wiLFwiY2xvc2luZ1wiLFwic2VsZWN0aW5nXCIsXCJ1bnNlbGVjdGluZ1wiXTtiLmNhbGwodGhpcyxjLGQpLGMub24oXCIqXCIsZnVuY3Rpb24oYixjKXtpZigtMSE9PWEuaW5BcnJheShiLGYpKXtjPWN8fHt9O3ZhciBkPWEuRXZlbnQoXCJzZWxlY3QyOlwiK2Ise3BhcmFtczpjfSk7ZS4kZWxlbWVudC50cmlnZ2VyKGQpLC0xIT09YS5pbkFycmF5KGIsZykmJihjLnByZXZlbnRlZD1kLmlzRGVmYXVsdFByZXZlbnRlZCgpKX19KX0sYn0pLGIuZGVmaW5lKFwic2VsZWN0Mi90cmFuc2xhdGlvblwiLFtcImpxdWVyeVwiLFwicmVxdWlyZVwiXSxmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYSl7dGhpcy5kaWN0PWF8fHt9fXJldHVybiBjLnByb3RvdHlwZS5hbGw9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5kaWN0fSxjLnByb3RvdHlwZS5nZXQ9ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuZGljdFthXX0sYy5wcm90b3R5cGUuZXh0ZW5kPWZ1bmN0aW9uKGIpe3RoaXMuZGljdD1hLmV4dGVuZCh7fSxiLmFsbCgpLHRoaXMuZGljdCl9LGMuX2NhY2hlPXt9LGMubG9hZFBhdGg9ZnVuY3Rpb24oYSl7aWYoIShhIGluIGMuX2NhY2hlKSl7dmFyIGQ9YihhKTtjLl9jYWNoZVthXT1kfXJldHVybiBuZXcgYyhjLl9jYWNoZVthXSl9LGN9KSxiLmRlZmluZShcInNlbGVjdDIvZGlhY3JpdGljc1wiLFtdLGZ1bmN0aW9uKCl7dmFyIGE9e1wi4pK2XCI6XCJBXCIsXCLvvKFcIjpcIkFcIixcIsOAXCI6XCJBXCIsXCLDgVwiOlwiQVwiLFwiw4JcIjpcIkFcIixcIuG6plwiOlwiQVwiLFwi4bqkXCI6XCJBXCIsXCLhuqpcIjpcIkFcIixcIuG6qFwiOlwiQVwiLFwiw4NcIjpcIkFcIixcIsSAXCI6XCJBXCIsXCLEglwiOlwiQVwiLFwi4bqwXCI6XCJBXCIsXCLhuq5cIjpcIkFcIixcIuG6tFwiOlwiQVwiLFwi4bqyXCI6XCJBXCIsXCLIplwiOlwiQVwiLFwix6BcIjpcIkFcIixcIsOEXCI6XCJBXCIsXCLHnlwiOlwiQVwiLFwi4bqiXCI6XCJBXCIsXCLDhVwiOlwiQVwiLFwix7pcIjpcIkFcIixcIseNXCI6XCJBXCIsXCLIgFwiOlwiQVwiLFwiyIJcIjpcIkFcIixcIuG6oFwiOlwiQVwiLFwi4bqsXCI6XCJBXCIsXCLhurZcIjpcIkFcIixcIuG4gFwiOlwiQVwiLFwixIRcIjpcIkFcIixcIsi6XCI6XCJBXCIsXCLisa9cIjpcIkFcIixcIuqcslwiOlwiQUFcIixcIsOGXCI6XCJBRVwiLFwix7xcIjpcIkFFXCIsXCLHolwiOlwiQUVcIixcIuqctFwiOlwiQU9cIixcIuqctlwiOlwiQVVcIixcIuqcuFwiOlwiQVZcIixcIuqculwiOlwiQVZcIixcIuqcvFwiOlwiQVlcIixcIuKSt1wiOlwiQlwiLFwi77yiXCI6XCJCXCIsXCLhuIJcIjpcIkJcIixcIuG4hFwiOlwiQlwiLFwi4biGXCI6XCJCXCIsXCLJg1wiOlwiQlwiLFwixoJcIjpcIkJcIixcIsaBXCI6XCJCXCIsXCLikrhcIjpcIkNcIixcIu+8o1wiOlwiQ1wiLFwixIZcIjpcIkNcIixcIsSIXCI6XCJDXCIsXCLEilwiOlwiQ1wiLFwixIxcIjpcIkNcIixcIsOHXCI6XCJDXCIsXCLhuIhcIjpcIkNcIixcIsaHXCI6XCJDXCIsXCLIu1wiOlwiQ1wiLFwi6py+XCI6XCJDXCIsXCLikrlcIjpcIkRcIixcIu+8pFwiOlwiRFwiLFwi4biKXCI6XCJEXCIsXCLEjlwiOlwiRFwiLFwi4biMXCI6XCJEXCIsXCLhuJBcIjpcIkRcIixcIuG4klwiOlwiRFwiLFwi4biOXCI6XCJEXCIsXCLEkFwiOlwiRFwiLFwixotcIjpcIkRcIixcIsaKXCI6XCJEXCIsXCLGiVwiOlwiRFwiLFwi6p25XCI6XCJEXCIsXCLHsVwiOlwiRFpcIixcIseEXCI6XCJEWlwiLFwix7JcIjpcIkR6XCIsXCLHhVwiOlwiRHpcIixcIuKSulwiOlwiRVwiLFwi77ylXCI6XCJFXCIsXCLDiFwiOlwiRVwiLFwiw4lcIjpcIkVcIixcIsOKXCI6XCJFXCIsXCLhu4BcIjpcIkVcIixcIuG6vlwiOlwiRVwiLFwi4buEXCI6XCJFXCIsXCLhu4JcIjpcIkVcIixcIuG6vFwiOlwiRVwiLFwixJJcIjpcIkVcIixcIuG4lFwiOlwiRVwiLFwi4biWXCI6XCJFXCIsXCLElFwiOlwiRVwiLFwixJZcIjpcIkVcIixcIsOLXCI6XCJFXCIsXCLhurpcIjpcIkVcIixcIsSaXCI6XCJFXCIsXCLIhFwiOlwiRVwiLFwiyIZcIjpcIkVcIixcIuG6uFwiOlwiRVwiLFwi4buGXCI6XCJFXCIsXCLIqFwiOlwiRVwiLFwi4bicXCI6XCJFXCIsXCLEmFwiOlwiRVwiLFwi4biYXCI6XCJFXCIsXCLhuJpcIjpcIkVcIixcIsaQXCI6XCJFXCIsXCLGjlwiOlwiRVwiLFwi4pK7XCI6XCJGXCIsXCLvvKZcIjpcIkZcIixcIuG4nlwiOlwiRlwiLFwixpFcIjpcIkZcIixcIuqdu1wiOlwiRlwiLFwi4pK8XCI6XCJHXCIsXCLvvKdcIjpcIkdcIixcIse0XCI6XCJHXCIsXCLEnFwiOlwiR1wiLFwi4bigXCI6XCJHXCIsXCLEnlwiOlwiR1wiLFwixKBcIjpcIkdcIixcIsemXCI6XCJHXCIsXCLEolwiOlwiR1wiLFwix6RcIjpcIkdcIixcIsaTXCI6XCJHXCIsXCLqnqBcIjpcIkdcIixcIuqdvVwiOlwiR1wiLFwi6p2+XCI6XCJHXCIsXCLikr1cIjpcIkhcIixcIu+8qFwiOlwiSFwiLFwixKRcIjpcIkhcIixcIuG4olwiOlwiSFwiLFwi4bimXCI6XCJIXCIsXCLInlwiOlwiSFwiLFwi4bikXCI6XCJIXCIsXCLhuKhcIjpcIkhcIixcIuG4qlwiOlwiSFwiLFwixKZcIjpcIkhcIixcIuKxp1wiOlwiSFwiLFwi4rG1XCI6XCJIXCIsXCLqno1cIjpcIkhcIixcIuKSvlwiOlwiSVwiLFwi77ypXCI6XCJJXCIsXCLDjFwiOlwiSVwiLFwiw41cIjpcIklcIixcIsOOXCI6XCJJXCIsXCLEqFwiOlwiSVwiLFwixKpcIjpcIklcIixcIsSsXCI6XCJJXCIsXCLEsFwiOlwiSVwiLFwiw49cIjpcIklcIixcIuG4rlwiOlwiSVwiLFwi4buIXCI6XCJJXCIsXCLHj1wiOlwiSVwiLFwiyIhcIjpcIklcIixcIsiKXCI6XCJJXCIsXCLhu4pcIjpcIklcIixcIsSuXCI6XCJJXCIsXCLhuKxcIjpcIklcIixcIsaXXCI6XCJJXCIsXCLikr9cIjpcIkpcIixcIu+8qlwiOlwiSlwiLFwixLRcIjpcIkpcIixcIsmIXCI6XCJKXCIsXCLik4BcIjpcIktcIixcIu+8q1wiOlwiS1wiLFwi4biwXCI6XCJLXCIsXCLHqFwiOlwiS1wiLFwi4biyXCI6XCJLXCIsXCLEtlwiOlwiS1wiLFwi4bi0XCI6XCJLXCIsXCLGmFwiOlwiS1wiLFwi4rGpXCI6XCJLXCIsXCLqnYBcIjpcIktcIixcIuqdglwiOlwiS1wiLFwi6p2EXCI6XCJLXCIsXCLqnqJcIjpcIktcIixcIuKTgVwiOlwiTFwiLFwi77ysXCI6XCJMXCIsXCLEv1wiOlwiTFwiLFwixLlcIjpcIkxcIixcIsS9XCI6XCJMXCIsXCLhuLZcIjpcIkxcIixcIuG4uFwiOlwiTFwiLFwixLtcIjpcIkxcIixcIuG4vFwiOlwiTFwiLFwi4bi6XCI6XCJMXCIsXCLFgVwiOlwiTFwiLFwiyL1cIjpcIkxcIixcIuKxolwiOlwiTFwiLFwi4rGgXCI6XCJMXCIsXCLqnYhcIjpcIkxcIixcIuqdhlwiOlwiTFwiLFwi6p6AXCI6XCJMXCIsXCLHh1wiOlwiTEpcIixcIseIXCI6XCJMalwiLFwi4pOCXCI6XCJNXCIsXCLvvK1cIjpcIk1cIixcIuG4vlwiOlwiTVwiLFwi4bmAXCI6XCJNXCIsXCLhuYJcIjpcIk1cIixcIuKxrlwiOlwiTVwiLFwixpxcIjpcIk1cIixcIuKTg1wiOlwiTlwiLFwi77yuXCI6XCJOXCIsXCLHuFwiOlwiTlwiLFwixYNcIjpcIk5cIixcIsORXCI6XCJOXCIsXCLhuYRcIjpcIk5cIixcIsWHXCI6XCJOXCIsXCLhuYZcIjpcIk5cIixcIsWFXCI6XCJOXCIsXCLhuYpcIjpcIk5cIixcIuG5iFwiOlwiTlwiLFwiyKBcIjpcIk5cIixcIsadXCI6XCJOXCIsXCLqnpBcIjpcIk5cIixcIuqepFwiOlwiTlwiLFwix4pcIjpcIk5KXCIsXCLHi1wiOlwiTmpcIixcIuKThFwiOlwiT1wiLFwi77yvXCI6XCJPXCIsXCLDklwiOlwiT1wiLFwiw5NcIjpcIk9cIixcIsOUXCI6XCJPXCIsXCLhu5JcIjpcIk9cIixcIuG7kFwiOlwiT1wiLFwi4buWXCI6XCJPXCIsXCLhu5RcIjpcIk9cIixcIsOVXCI6XCJPXCIsXCLhuYxcIjpcIk9cIixcIsisXCI6XCJPXCIsXCLhuY5cIjpcIk9cIixcIsWMXCI6XCJPXCIsXCLhuZBcIjpcIk9cIixcIuG5klwiOlwiT1wiLFwixY5cIjpcIk9cIixcIsiuXCI6XCJPXCIsXCLIsFwiOlwiT1wiLFwiw5ZcIjpcIk9cIixcIsiqXCI6XCJPXCIsXCLhu45cIjpcIk9cIixcIsWQXCI6XCJPXCIsXCLHkVwiOlwiT1wiLFwiyIxcIjpcIk9cIixcIsiOXCI6XCJPXCIsXCLGoFwiOlwiT1wiLFwi4bucXCI6XCJPXCIsXCLhu5pcIjpcIk9cIixcIuG7oFwiOlwiT1wiLFwi4bueXCI6XCJPXCIsXCLhu6JcIjpcIk9cIixcIuG7jFwiOlwiT1wiLFwi4buYXCI6XCJPXCIsXCLHqlwiOlwiT1wiLFwix6xcIjpcIk9cIixcIsOYXCI6XCJPXCIsXCLHvlwiOlwiT1wiLFwixoZcIjpcIk9cIixcIsafXCI6XCJPXCIsXCLqnYpcIjpcIk9cIixcIuqdjFwiOlwiT1wiLFwixqJcIjpcIk9JXCIsXCLqnY5cIjpcIk9PXCIsXCLIolwiOlwiT1VcIixcIuKThVwiOlwiUFwiLFwi77ywXCI6XCJQXCIsXCLhuZRcIjpcIlBcIixcIuG5llwiOlwiUFwiLFwixqRcIjpcIlBcIixcIuKxo1wiOlwiUFwiLFwi6p2QXCI6XCJQXCIsXCLqnZJcIjpcIlBcIixcIuqdlFwiOlwiUFwiLFwi4pOGXCI6XCJRXCIsXCLvvLFcIjpcIlFcIixcIuqdllwiOlwiUVwiLFwi6p2YXCI6XCJRXCIsXCLJilwiOlwiUVwiLFwi4pOHXCI6XCJSXCIsXCLvvLJcIjpcIlJcIixcIsWUXCI6XCJSXCIsXCLhuZhcIjpcIlJcIixcIsWYXCI6XCJSXCIsXCLIkFwiOlwiUlwiLFwiyJJcIjpcIlJcIixcIuG5mlwiOlwiUlwiLFwi4bmcXCI6XCJSXCIsXCLFllwiOlwiUlwiLFwi4bmeXCI6XCJSXCIsXCLJjFwiOlwiUlwiLFwi4rGkXCI6XCJSXCIsXCLqnZpcIjpcIlJcIixcIuqeplwiOlwiUlwiLFwi6p6CXCI6XCJSXCIsXCLik4hcIjpcIlNcIixcIu+8s1wiOlwiU1wiLFwi4bqeXCI6XCJTXCIsXCLFmlwiOlwiU1wiLFwi4bmkXCI6XCJTXCIsXCLFnFwiOlwiU1wiLFwi4bmgXCI6XCJTXCIsXCLFoFwiOlwiU1wiLFwi4bmmXCI6XCJTXCIsXCLhuaJcIjpcIlNcIixcIuG5qFwiOlwiU1wiLFwiyJhcIjpcIlNcIixcIsWeXCI6XCJTXCIsXCLisb5cIjpcIlNcIixcIuqeqFwiOlwiU1wiLFwi6p6EXCI6XCJTXCIsXCLik4lcIjpcIlRcIixcIu+8tFwiOlwiVFwiLFwi4bmqXCI6XCJUXCIsXCLFpFwiOlwiVFwiLFwi4bmsXCI6XCJUXCIsXCLImlwiOlwiVFwiLFwixaJcIjpcIlRcIixcIuG5sFwiOlwiVFwiLFwi4bmuXCI6XCJUXCIsXCLFplwiOlwiVFwiLFwixqxcIjpcIlRcIixcIsauXCI6XCJUXCIsXCLIvlwiOlwiVFwiLFwi6p6GXCI6XCJUXCIsXCLqnKhcIjpcIlRaXCIsXCLik4pcIjpcIlVcIixcIu+8tVwiOlwiVVwiLFwiw5lcIjpcIlVcIixcIsOaXCI6XCJVXCIsXCLDm1wiOlwiVVwiLFwixahcIjpcIlVcIixcIuG5uFwiOlwiVVwiLFwixapcIjpcIlVcIixcIuG5ulwiOlwiVVwiLFwixaxcIjpcIlVcIixcIsOcXCI6XCJVXCIsXCLHm1wiOlwiVVwiLFwix5dcIjpcIlVcIixcIseVXCI6XCJVXCIsXCLHmVwiOlwiVVwiLFwi4bumXCI6XCJVXCIsXCLFrlwiOlwiVVwiLFwixbBcIjpcIlVcIixcIseTXCI6XCJVXCIsXCLIlFwiOlwiVVwiLFwiyJZcIjpcIlVcIixcIsavXCI6XCJVXCIsXCLhu6pcIjpcIlVcIixcIuG7qFwiOlwiVVwiLFwi4buuXCI6XCJVXCIsXCLhu6xcIjpcIlVcIixcIuG7sFwiOlwiVVwiLFwi4bukXCI6XCJVXCIsXCLhubJcIjpcIlVcIixcIsWyXCI6XCJVXCIsXCLhubZcIjpcIlVcIixcIuG5tFwiOlwiVVwiLFwiyYRcIjpcIlVcIixcIuKTi1wiOlwiVlwiLFwi77y2XCI6XCJWXCIsXCLhubxcIjpcIlZcIixcIuG5vlwiOlwiVlwiLFwixrJcIjpcIlZcIixcIuqdnlwiOlwiVlwiLFwiyYVcIjpcIlZcIixcIuqdoFwiOlwiVllcIixcIuKTjFwiOlwiV1wiLFwi77y3XCI6XCJXXCIsXCLhuoBcIjpcIldcIixcIuG6glwiOlwiV1wiLFwixbRcIjpcIldcIixcIuG6hlwiOlwiV1wiLFwi4bqEXCI6XCJXXCIsXCLhuohcIjpcIldcIixcIuKxslwiOlwiV1wiLFwi4pONXCI6XCJYXCIsXCLvvLhcIjpcIlhcIixcIuG6ilwiOlwiWFwiLFwi4bqMXCI6XCJYXCIsXCLik45cIjpcIllcIixcIu+8uVwiOlwiWVwiLFwi4buyXCI6XCJZXCIsXCLDnVwiOlwiWVwiLFwixbZcIjpcIllcIixcIuG7uFwiOlwiWVwiLFwiyLJcIjpcIllcIixcIuG6jlwiOlwiWVwiLFwixbhcIjpcIllcIixcIuG7tlwiOlwiWVwiLFwi4bu0XCI6XCJZXCIsXCLGs1wiOlwiWVwiLFwiyY5cIjpcIllcIixcIuG7vlwiOlwiWVwiLFwi4pOPXCI6XCJaXCIsXCLvvLpcIjpcIlpcIixcIsW5XCI6XCJaXCIsXCLhupBcIjpcIlpcIixcIsW7XCI6XCJaXCIsXCLFvVwiOlwiWlwiLFwi4bqSXCI6XCJaXCIsXCLhupRcIjpcIlpcIixcIsa1XCI6XCJaXCIsXCLIpFwiOlwiWlwiLFwi4rG/XCI6XCJaXCIsXCLisatcIjpcIlpcIixcIuqdolwiOlwiWlwiLFwi4pOQXCI6XCJhXCIsXCLvvYFcIjpcImFcIixcIuG6mlwiOlwiYVwiLFwiw6BcIjpcImFcIixcIsOhXCI6XCJhXCIsXCLDolwiOlwiYVwiLFwi4bqnXCI6XCJhXCIsXCLhuqVcIjpcImFcIixcIuG6q1wiOlwiYVwiLFwi4bqpXCI6XCJhXCIsXCLDo1wiOlwiYVwiLFwixIFcIjpcImFcIixcIsSDXCI6XCJhXCIsXCLhurFcIjpcImFcIixcIuG6r1wiOlwiYVwiLFwi4bq1XCI6XCJhXCIsXCLhurNcIjpcImFcIixcIsinXCI6XCJhXCIsXCLHoVwiOlwiYVwiLFwiw6RcIjpcImFcIixcIsefXCI6XCJhXCIsXCLhuqNcIjpcImFcIixcIsOlXCI6XCJhXCIsXCLHu1wiOlwiYVwiLFwix45cIjpcImFcIixcIsiBXCI6XCJhXCIsXCLIg1wiOlwiYVwiLFwi4bqhXCI6XCJhXCIsXCLhuq1cIjpcImFcIixcIuG6t1wiOlwiYVwiLFwi4biBXCI6XCJhXCIsXCLEhVwiOlwiYVwiLFwi4rGlXCI6XCJhXCIsXCLJkFwiOlwiYVwiLFwi6pyzXCI6XCJhYVwiLFwiw6ZcIjpcImFlXCIsXCLHvVwiOlwiYWVcIixcIsejXCI6XCJhZVwiLFwi6py1XCI6XCJhb1wiLFwi6py3XCI6XCJhdVwiLFwi6py5XCI6XCJhdlwiLFwi6py7XCI6XCJhdlwiLFwi6py9XCI6XCJheVwiLFwi4pORXCI6XCJiXCIsXCLvvYJcIjpcImJcIixcIuG4g1wiOlwiYlwiLFwi4biFXCI6XCJiXCIsXCLhuIdcIjpcImJcIixcIsaAXCI6XCJiXCIsXCLGg1wiOlwiYlwiLFwiyZNcIjpcImJcIixcIuKTklwiOlwiY1wiLFwi772DXCI6XCJjXCIsXCLEh1wiOlwiY1wiLFwixIlcIjpcImNcIixcIsSLXCI6XCJjXCIsXCLEjVwiOlwiY1wiLFwiw6dcIjpcImNcIixcIuG4iVwiOlwiY1wiLFwixohcIjpcImNcIixcIsi8XCI6XCJjXCIsXCLqnL9cIjpcImNcIixcIuKGhFwiOlwiY1wiLFwi4pOTXCI6XCJkXCIsXCLvvYRcIjpcImRcIixcIuG4i1wiOlwiZFwiLFwixI9cIjpcImRcIixcIuG4jVwiOlwiZFwiLFwi4biRXCI6XCJkXCIsXCLhuJNcIjpcImRcIixcIuG4j1wiOlwiZFwiLFwixJFcIjpcImRcIixcIsaMXCI6XCJkXCIsXCLJllwiOlwiZFwiLFwiyZdcIjpcImRcIixcIuqdulwiOlwiZFwiLFwix7NcIjpcImR6XCIsXCLHhlwiOlwiZHpcIixcIuKTlFwiOlwiZVwiLFwi772FXCI6XCJlXCIsXCLDqFwiOlwiZVwiLFwiw6lcIjpcImVcIixcIsOqXCI6XCJlXCIsXCLhu4FcIjpcImVcIixcIuG6v1wiOlwiZVwiLFwi4buFXCI6XCJlXCIsXCLhu4NcIjpcImVcIixcIuG6vVwiOlwiZVwiLFwixJNcIjpcImVcIixcIuG4lVwiOlwiZVwiLFwi4biXXCI6XCJlXCIsXCLElVwiOlwiZVwiLFwixJdcIjpcImVcIixcIsOrXCI6XCJlXCIsXCLhurtcIjpcImVcIixcIsSbXCI6XCJlXCIsXCLIhVwiOlwiZVwiLFwiyIdcIjpcImVcIixcIuG6uVwiOlwiZVwiLFwi4buHXCI6XCJlXCIsXCLIqVwiOlwiZVwiLFwi4bidXCI6XCJlXCIsXCLEmVwiOlwiZVwiLFwi4biZXCI6XCJlXCIsXCLhuJtcIjpcImVcIixcIsmHXCI6XCJlXCIsXCLJm1wiOlwiZVwiLFwix51cIjpcImVcIixcIuKTlVwiOlwiZlwiLFwi772GXCI6XCJmXCIsXCLhuJ9cIjpcImZcIixcIsaSXCI6XCJmXCIsXCLqnbxcIjpcImZcIixcIuKTllwiOlwiZ1wiLFwi772HXCI6XCJnXCIsXCLHtVwiOlwiZ1wiLFwixJ1cIjpcImdcIixcIuG4oVwiOlwiZ1wiLFwixJ9cIjpcImdcIixcIsShXCI6XCJnXCIsXCLHp1wiOlwiZ1wiLFwixKNcIjpcImdcIixcIselXCI6XCJnXCIsXCLJoFwiOlwiZ1wiLFwi6p6hXCI6XCJnXCIsXCLhtblcIjpcImdcIixcIuqdv1wiOlwiZ1wiLFwi4pOXXCI6XCJoXCIsXCLvvYhcIjpcImhcIixcIsSlXCI6XCJoXCIsXCLhuKNcIjpcImhcIixcIuG4p1wiOlwiaFwiLFwiyJ9cIjpcImhcIixcIuG4pVwiOlwiaFwiLFwi4bipXCI6XCJoXCIsXCLhuKtcIjpcImhcIixcIuG6llwiOlwiaFwiLFwixKdcIjpcImhcIixcIuKxqFwiOlwiaFwiLFwi4rG2XCI6XCJoXCIsXCLJpVwiOlwiaFwiLFwixpVcIjpcImh2XCIsXCLik5hcIjpcImlcIixcIu+9iVwiOlwiaVwiLFwiw6xcIjpcImlcIixcIsOtXCI6XCJpXCIsXCLDrlwiOlwiaVwiLFwixKlcIjpcImlcIixcIsSrXCI6XCJpXCIsXCLErVwiOlwiaVwiLFwiw69cIjpcImlcIixcIuG4r1wiOlwiaVwiLFwi4buJXCI6XCJpXCIsXCLHkFwiOlwiaVwiLFwiyIlcIjpcImlcIixcIsiLXCI6XCJpXCIsXCLhu4tcIjpcImlcIixcIsSvXCI6XCJpXCIsXCLhuK1cIjpcImlcIixcIsmoXCI6XCJpXCIsXCLEsVwiOlwiaVwiLFwi4pOZXCI6XCJqXCIsXCLvvYpcIjpcImpcIixcIsS1XCI6XCJqXCIsXCLHsFwiOlwialwiLFwiyYlcIjpcImpcIixcIuKTmlwiOlwia1wiLFwi772LXCI6XCJrXCIsXCLhuLFcIjpcImtcIixcIsepXCI6XCJrXCIsXCLhuLNcIjpcImtcIixcIsS3XCI6XCJrXCIsXCLhuLVcIjpcImtcIixcIsaZXCI6XCJrXCIsXCLisapcIjpcImtcIixcIuqdgVwiOlwia1wiLFwi6p2DXCI6XCJrXCIsXCLqnYVcIjpcImtcIixcIuqeo1wiOlwia1wiLFwi4pObXCI6XCJsXCIsXCLvvYxcIjpcImxcIixcIsWAXCI6XCJsXCIsXCLEulwiOlwibFwiLFwixL5cIjpcImxcIixcIuG4t1wiOlwibFwiLFwi4bi5XCI6XCJsXCIsXCLEvFwiOlwibFwiLFwi4bi9XCI6XCJsXCIsXCLhuLtcIjpcImxcIixcIsW/XCI6XCJsXCIsXCLFglwiOlwibFwiLFwixppcIjpcImxcIixcIsmrXCI6XCJsXCIsXCLisaFcIjpcImxcIixcIuqdiVwiOlwibFwiLFwi6p6BXCI6XCJsXCIsXCLqnYdcIjpcImxcIixcIseJXCI6XCJsalwiLFwi4pOcXCI6XCJtXCIsXCLvvY1cIjpcIm1cIixcIuG4v1wiOlwibVwiLFwi4bmBXCI6XCJtXCIsXCLhuYNcIjpcIm1cIixcIsmxXCI6XCJtXCIsXCLJr1wiOlwibVwiLFwi4pOdXCI6XCJuXCIsXCLvvY5cIjpcIm5cIixcIse5XCI6XCJuXCIsXCLFhFwiOlwiblwiLFwiw7FcIjpcIm5cIixcIuG5hVwiOlwiblwiLFwixYhcIjpcIm5cIixcIuG5h1wiOlwiblwiLFwixYZcIjpcIm5cIixcIuG5i1wiOlwiblwiLFwi4bmJXCI6XCJuXCIsXCLGnlwiOlwiblwiLFwiybJcIjpcIm5cIixcIsWJXCI6XCJuXCIsXCLqnpFcIjpcIm5cIixcIuqepVwiOlwiblwiLFwix4xcIjpcIm5qXCIsXCLik55cIjpcIm9cIixcIu+9j1wiOlwib1wiLFwiw7JcIjpcIm9cIixcIsOzXCI6XCJvXCIsXCLDtFwiOlwib1wiLFwi4buTXCI6XCJvXCIsXCLhu5FcIjpcIm9cIixcIuG7l1wiOlwib1wiLFwi4buVXCI6XCJvXCIsXCLDtVwiOlwib1wiLFwi4bmNXCI6XCJvXCIsXCLIrVwiOlwib1wiLFwi4bmPXCI6XCJvXCIsXCLFjVwiOlwib1wiLFwi4bmRXCI6XCJvXCIsXCLhuZNcIjpcIm9cIixcIsWPXCI6XCJvXCIsXCLIr1wiOlwib1wiLFwiyLFcIjpcIm9cIixcIsO2XCI6XCJvXCIsXCLIq1wiOlwib1wiLFwi4buPXCI6XCJvXCIsXCLFkVwiOlwib1wiLFwix5JcIjpcIm9cIixcIsiNXCI6XCJvXCIsXCLIj1wiOlwib1wiLFwixqFcIjpcIm9cIixcIuG7nVwiOlwib1wiLFwi4bubXCI6XCJvXCIsXCLhu6FcIjpcIm9cIixcIuG7n1wiOlwib1wiLFwi4bujXCI6XCJvXCIsXCLhu41cIjpcIm9cIixcIuG7mVwiOlwib1wiLFwix6tcIjpcIm9cIixcIsetXCI6XCJvXCIsXCLDuFwiOlwib1wiLFwix79cIjpcIm9cIixcIsmUXCI6XCJvXCIsXCLqnYtcIjpcIm9cIixcIuqdjVwiOlwib1wiLFwiybVcIjpcIm9cIixcIsajXCI6XCJvaVwiLFwiyKNcIjpcIm91XCIsXCLqnY9cIjpcIm9vXCIsXCLik59cIjpcInBcIixcIu+9kFwiOlwicFwiLFwi4bmVXCI6XCJwXCIsXCLhuZdcIjpcInBcIixcIsalXCI6XCJwXCIsXCLhtb1cIjpcInBcIixcIuqdkVwiOlwicFwiLFwi6p2TXCI6XCJwXCIsXCLqnZVcIjpcInBcIixcIuKToFwiOlwicVwiLFwi772RXCI6XCJxXCIsXCLJi1wiOlwicVwiLFwi6p2XXCI6XCJxXCIsXCLqnZlcIjpcInFcIixcIuKToVwiOlwiclwiLFwi772SXCI6XCJyXCIsXCLFlVwiOlwiclwiLFwi4bmZXCI6XCJyXCIsXCLFmVwiOlwiclwiLFwiyJFcIjpcInJcIixcIsiTXCI6XCJyXCIsXCLhuZtcIjpcInJcIixcIuG5nVwiOlwiclwiLFwixZdcIjpcInJcIixcIuG5n1wiOlwiclwiLFwiyY1cIjpcInJcIixcIsm9XCI6XCJyXCIsXCLqnZtcIjpcInJcIixcIuqep1wiOlwiclwiLFwi6p6DXCI6XCJyXCIsXCLik6JcIjpcInNcIixcIu+9k1wiOlwic1wiLFwiw59cIjpcInNcIixcIsWbXCI6XCJzXCIsXCLhuaVcIjpcInNcIixcIsWdXCI6XCJzXCIsXCLhuaFcIjpcInNcIixcIsWhXCI6XCJzXCIsXCLhuadcIjpcInNcIixcIuG5o1wiOlwic1wiLFwi4bmpXCI6XCJzXCIsXCLImVwiOlwic1wiLFwixZ9cIjpcInNcIixcIsi/XCI6XCJzXCIsXCLqnqlcIjpcInNcIixcIuqehVwiOlwic1wiLFwi4bqbXCI6XCJzXCIsXCLik6NcIjpcInRcIixcIu+9lFwiOlwidFwiLFwi4bmrXCI6XCJ0XCIsXCLhupdcIjpcInRcIixcIsWlXCI6XCJ0XCIsXCLhua1cIjpcInRcIixcIsibXCI6XCJ0XCIsXCLFo1wiOlwidFwiLFwi4bmxXCI6XCJ0XCIsXCLhua9cIjpcInRcIixcIsWnXCI6XCJ0XCIsXCLGrVwiOlwidFwiLFwiyohcIjpcInRcIixcIuKxplwiOlwidFwiLFwi6p6HXCI6XCJ0XCIsXCLqnKlcIjpcInR6XCIsXCLik6RcIjpcInVcIixcIu+9lVwiOlwidVwiLFwiw7lcIjpcInVcIixcIsO6XCI6XCJ1XCIsXCLDu1wiOlwidVwiLFwixalcIjpcInVcIixcIuG5uVwiOlwidVwiLFwixatcIjpcInVcIixcIuG5u1wiOlwidVwiLFwixa1cIjpcInVcIixcIsO8XCI6XCJ1XCIsXCLHnFwiOlwidVwiLFwix5hcIjpcInVcIixcIseWXCI6XCJ1XCIsXCLHmlwiOlwidVwiLFwi4bunXCI6XCJ1XCIsXCLFr1wiOlwidVwiLFwixbFcIjpcInVcIixcIseUXCI6XCJ1XCIsXCLIlVwiOlwidVwiLFwiyJdcIjpcInVcIixcIsawXCI6XCJ1XCIsXCLhu6tcIjpcInVcIixcIuG7qVwiOlwidVwiLFwi4buvXCI6XCJ1XCIsXCLhu61cIjpcInVcIixcIuG7sVwiOlwidVwiLFwi4bulXCI6XCJ1XCIsXCLhubNcIjpcInVcIixcIsWzXCI6XCJ1XCIsXCLhubdcIjpcInVcIixcIuG5tVwiOlwidVwiLFwiyolcIjpcInVcIixcIuKTpVwiOlwidlwiLFwi772WXCI6XCJ2XCIsXCLhub1cIjpcInZcIixcIuG5v1wiOlwidlwiLFwiyotcIjpcInZcIixcIuqdn1wiOlwidlwiLFwiyoxcIjpcInZcIixcIuqdoVwiOlwidnlcIixcIuKTplwiOlwid1wiLFwi772XXCI6XCJ3XCIsXCLhuoFcIjpcIndcIixcIuG6g1wiOlwid1wiLFwixbVcIjpcIndcIixcIuG6h1wiOlwid1wiLFwi4bqFXCI6XCJ3XCIsXCLhuphcIjpcIndcIixcIuG6iVwiOlwid1wiLFwi4rGzXCI6XCJ3XCIsXCLik6dcIjpcInhcIixcIu+9mFwiOlwieFwiLFwi4bqLXCI6XCJ4XCIsXCLhuo1cIjpcInhcIixcIuKTqFwiOlwieVwiLFwi772ZXCI6XCJ5XCIsXCLhu7NcIjpcInlcIixcIsO9XCI6XCJ5XCIsXCLFt1wiOlwieVwiLFwi4bu5XCI6XCJ5XCIsXCLIs1wiOlwieVwiLFwi4bqPXCI6XCJ5XCIsXCLDv1wiOlwieVwiLFwi4bu3XCI6XCJ5XCIsXCLhuplcIjpcInlcIixcIuG7tVwiOlwieVwiLFwixrRcIjpcInlcIixcIsmPXCI6XCJ5XCIsXCLhu79cIjpcInlcIixcIuKTqVwiOlwielwiLFwi772aXCI6XCJ6XCIsXCLFulwiOlwielwiLFwi4bqRXCI6XCJ6XCIsXCLFvFwiOlwielwiLFwixb5cIjpcInpcIixcIuG6k1wiOlwielwiLFwi4bqVXCI6XCJ6XCIsXCLGtlwiOlwielwiLFwiyKVcIjpcInpcIixcIsmAXCI6XCJ6XCIsXCLisaxcIjpcInpcIixcIuqdo1wiOlwielwiLFwizoZcIjpcIs6RXCIsXCLOiFwiOlwizpVcIixcIs6JXCI6XCLOl1wiLFwizopcIjpcIs6ZXCIsXCLOqlwiOlwizplcIixcIs6MXCI6XCLOn1wiLFwizo5cIjpcIs6lXCIsXCLOq1wiOlwizqVcIixcIs6PXCI6XCLOqVwiLFwizqxcIjpcIs6xXCIsXCLOrVwiOlwizrVcIixcIs6uXCI6XCLOt1wiLFwizq9cIjpcIs65XCIsXCLPilwiOlwizrlcIixcIs6QXCI6XCLOuVwiLFwiz4xcIjpcIs6/XCIsXCLPjVwiOlwiz4VcIixcIs+LXCI6XCLPhVwiLFwizrBcIjpcIs+FXCIsXCLPiVwiOlwiz4lcIixcIs+CXCI6XCLPg1wifTtyZXR1cm4gYX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kYXRhL2Jhc2VcIixbXCIuLi91dGlsc1wiXSxmdW5jdGlvbihhKXtmdW5jdGlvbiBiKGEsYyl7Yi5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzKX1yZXR1cm4gYS5FeHRlbmQoYixhLk9ic2VydmFibGUpLGIucHJvdG90eXBlLmN1cnJlbnQ9ZnVuY3Rpb24oYSl7dGhyb3cgbmV3IEVycm9yKFwiVGhlIGBjdXJyZW50YCBtZXRob2QgbXVzdCBiZSBkZWZpbmVkIGluIGNoaWxkIGNsYXNzZXMuXCIpfSxiLnByb3RvdHlwZS5xdWVyeT1mdW5jdGlvbihhLGIpe3Rocm93IG5ldyBFcnJvcihcIlRoZSBgcXVlcnlgIG1ldGhvZCBtdXN0IGJlIGRlZmluZWQgaW4gY2hpbGQgY2xhc3Nlcy5cIil9LGIucHJvdG90eXBlLmJpbmQ9ZnVuY3Rpb24oYSxiKXt9LGIucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt9LGIucHJvdG90eXBlLmdlbmVyYXRlUmVzdWx0SWQ9ZnVuY3Rpb24oYixjKXt2YXIgZD1iLmlkK1wiLXJlc3VsdC1cIjtyZXR1cm4gZCs9YS5nZW5lcmF0ZUNoYXJzKDQpLGQrPW51bGwhPWMuaWQ/XCItXCIrYy5pZC50b1N0cmluZygpOlwiLVwiK2EuZ2VuZXJhdGVDaGFycyg0KX0sYn0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kYXRhL3NlbGVjdFwiLFtcIi4vYmFzZVwiLFwiLi4vdXRpbHNcIixcImpxdWVyeVwiXSxmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZChhLGIpe3RoaXMuJGVsZW1lbnQ9YSx0aGlzLm9wdGlvbnM9YixkLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMpfXJldHVybiBiLkV4dGVuZChkLGEpLGQucHJvdG90eXBlLmN1cnJlbnQ9ZnVuY3Rpb24oYSl7dmFyIGI9W10sZD10aGlzO3RoaXMuJGVsZW1lbnQuZmluZChcIjpzZWxlY3RlZFwiKS5lYWNoKGZ1bmN0aW9uKCl7dmFyIGE9Yyh0aGlzKSxlPWQuaXRlbShhKTtiLnB1c2goZSl9KSxhKGIpfSxkLnByb3RvdHlwZS5zZWxlY3Q9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcztpZihhLnNlbGVjdGVkPSEwLGMoYS5lbGVtZW50KS5pcyhcIm9wdGlvblwiKSlyZXR1cm4gYS5lbGVtZW50LnNlbGVjdGVkPSEwLHZvaWQgdGhpcy4kZWxlbWVudC50cmlnZ2VyKFwiY2hhbmdlXCIpO1xuaWYodGhpcy4kZWxlbWVudC5wcm9wKFwibXVsdGlwbGVcIikpdGhpcy5jdXJyZW50KGZ1bmN0aW9uKGQpe3ZhciBlPVtdO2E9W2FdLGEucHVzaC5hcHBseShhLGQpO2Zvcih2YXIgZj0wO2Y8YS5sZW5ndGg7ZisrKXt2YXIgZz1hW2ZdLmlkOy0xPT09Yy5pbkFycmF5KGcsZSkmJmUucHVzaChnKX1iLiRlbGVtZW50LnZhbChlKSxiLiRlbGVtZW50LnRyaWdnZXIoXCJjaGFuZ2VcIil9KTtlbHNle3ZhciBkPWEuaWQ7dGhpcy4kZWxlbWVudC52YWwoZCksdGhpcy4kZWxlbWVudC50cmlnZ2VyKFwiY2hhbmdlXCIpfX0sZC5wcm90b3R5cGUudW5zZWxlY3Q9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcztpZih0aGlzLiRlbGVtZW50LnByb3AoXCJtdWx0aXBsZVwiKSlyZXR1cm4gYS5zZWxlY3RlZD0hMSxjKGEuZWxlbWVudCkuaXMoXCJvcHRpb25cIik/KGEuZWxlbWVudC5zZWxlY3RlZD0hMSx2b2lkIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihcImNoYW5nZVwiKSk6dm9pZCB0aGlzLmN1cnJlbnQoZnVuY3Rpb24oZCl7Zm9yKHZhciBlPVtdLGY9MDtmPGQubGVuZ3RoO2YrKyl7dmFyIGc9ZFtmXS5pZDtnIT09YS5pZCYmLTE9PT1jLmluQXJyYXkoZyxlKSYmZS5wdXNoKGcpfWIuJGVsZW1lbnQudmFsKGUpLGIuJGVsZW1lbnQudHJpZ2dlcihcImNoYW5nZVwiKX0pfSxkLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpczt0aGlzLmNvbnRhaW5lcj1hLGEub24oXCJzZWxlY3RcIixmdW5jdGlvbihhKXtjLnNlbGVjdChhLmRhdGEpfSksYS5vbihcInVuc2VsZWN0XCIsZnVuY3Rpb24oYSl7Yy51bnNlbGVjdChhLmRhdGEpfSl9LGQucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLiRlbGVtZW50LmZpbmQoXCIqXCIpLmVhY2goZnVuY3Rpb24oKXtjLnJlbW92ZURhdGEodGhpcyxcImRhdGFcIil9KX0sZC5wcm90b3R5cGUucXVlcnk9ZnVuY3Rpb24oYSxiKXt2YXIgZD1bXSxlPXRoaXMsZj10aGlzLiRlbGVtZW50LmNoaWxkcmVuKCk7Zi5lYWNoKGZ1bmN0aW9uKCl7dmFyIGI9Yyh0aGlzKTtpZihiLmlzKFwib3B0aW9uXCIpfHxiLmlzKFwib3B0Z3JvdXBcIikpe3ZhciBmPWUuaXRlbShiKSxnPWUubWF0Y2hlcyhhLGYpO251bGwhPT1nJiZkLnB1c2goZyl9fSksYih7cmVzdWx0czpkfSl9LGQucHJvdG90eXBlLmFkZE9wdGlvbnM9ZnVuY3Rpb24oYSl7Yi5hcHBlbmRNYW55KHRoaXMuJGVsZW1lbnQsYSl9LGQucHJvdG90eXBlLm9wdGlvbj1mdW5jdGlvbihhKXt2YXIgYjthLmNoaWxkcmVuPyhiPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvcHRncm91cFwiKSxiLmxhYmVsPWEudGV4dCk6KGI9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9wdGlvblwiKSx2b2lkIDAhPT1iLnRleHRDb250ZW50P2IudGV4dENvbnRlbnQ9YS50ZXh0OmIuaW5uZXJUZXh0PWEudGV4dCksYS5pZCYmKGIudmFsdWU9YS5pZCksYS5kaXNhYmxlZCYmKGIuZGlzYWJsZWQ9ITApLGEuc2VsZWN0ZWQmJihiLnNlbGVjdGVkPSEwKSxhLnRpdGxlJiYoYi50aXRsZT1hLnRpdGxlKTt2YXIgZD1jKGIpLGU9dGhpcy5fbm9ybWFsaXplSXRlbShhKTtyZXR1cm4gZS5lbGVtZW50PWIsYy5kYXRhKGIsXCJkYXRhXCIsZSksZH0sZC5wcm90b3R5cGUuaXRlbT1mdW5jdGlvbihhKXt2YXIgYj17fTtpZihiPWMuZGF0YShhWzBdLFwiZGF0YVwiKSxudWxsIT1iKXJldHVybiBiO2lmKGEuaXMoXCJvcHRpb25cIikpYj17aWQ6YS52YWwoKSx0ZXh0OmEudGV4dCgpLGRpc2FibGVkOmEucHJvcChcImRpc2FibGVkXCIpLHNlbGVjdGVkOmEucHJvcChcInNlbGVjdGVkXCIpLHRpdGxlOmEucHJvcChcInRpdGxlXCIpfTtlbHNlIGlmKGEuaXMoXCJvcHRncm91cFwiKSl7Yj17dGV4dDphLnByb3AoXCJsYWJlbFwiKSxjaGlsZHJlbjpbXSx0aXRsZTphLnByb3AoXCJ0aXRsZVwiKX07Zm9yKHZhciBkPWEuY2hpbGRyZW4oXCJvcHRpb25cIiksZT1bXSxmPTA7ZjxkLmxlbmd0aDtmKyspe3ZhciBnPWMoZFtmXSksaD10aGlzLml0ZW0oZyk7ZS5wdXNoKGgpfWIuY2hpbGRyZW49ZX1yZXR1cm4gYj10aGlzLl9ub3JtYWxpemVJdGVtKGIpLGIuZWxlbWVudD1hWzBdLGMuZGF0YShhWzBdLFwiZGF0YVwiLGIpLGJ9LGQucHJvdG90eXBlLl9ub3JtYWxpemVJdGVtPWZ1bmN0aW9uKGEpe2MuaXNQbGFpbk9iamVjdChhKXx8KGE9e2lkOmEsdGV4dDphfSksYT1jLmV4dGVuZCh7fSx7dGV4dDpcIlwifSxhKTt2YXIgYj17c2VsZWN0ZWQ6ITEsZGlzYWJsZWQ6ITF9O3JldHVybiBudWxsIT1hLmlkJiYoYS5pZD1hLmlkLnRvU3RyaW5nKCkpLG51bGwhPWEudGV4dCYmKGEudGV4dD1hLnRleHQudG9TdHJpbmcoKSksbnVsbD09YS5fcmVzdWx0SWQmJmEuaWQmJm51bGwhPXRoaXMuY29udGFpbmVyJiYoYS5fcmVzdWx0SWQ9dGhpcy5nZW5lcmF0ZVJlc3VsdElkKHRoaXMuY29udGFpbmVyLGEpKSxjLmV4dGVuZCh7fSxiLGEpfSxkLnByb3RvdHlwZS5tYXRjaGVzPWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcy5vcHRpb25zLmdldChcIm1hdGNoZXJcIik7cmV0dXJuIGMoYSxiKX0sZH0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kYXRhL2FycmF5XCIsW1wiLi9zZWxlY3RcIixcIi4uL3V0aWxzXCIsXCJqcXVlcnlcIl0sZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQoYSxiKXt2YXIgYz1iLmdldChcImRhdGFcIil8fFtdO2QuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmNhbGwodGhpcyxhLGIpLHRoaXMuYWRkT3B0aW9ucyh0aGlzLmNvbnZlcnRUb09wdGlvbnMoYykpfXJldHVybiBiLkV4dGVuZChkLGEpLGQucHJvdG90eXBlLnNlbGVjdD1mdW5jdGlvbihhKXt2YXIgYj10aGlzLiRlbGVtZW50LmZpbmQoXCJvcHRpb25cIikuZmlsdGVyKGZ1bmN0aW9uKGIsYyl7cmV0dXJuIGMudmFsdWU9PWEuaWQudG9TdHJpbmcoKX0pOzA9PT1iLmxlbmd0aCYmKGI9dGhpcy5vcHRpb24oYSksdGhpcy5hZGRPcHRpb25zKGIpKSxkLl9fc3VwZXJfXy5zZWxlY3QuY2FsbCh0aGlzLGEpfSxkLnByb3RvdHlwZS5jb252ZXJ0VG9PcHRpb25zPWZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGQoYSl7cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIGModGhpcykudmFsKCk9PWEuaWR9fWZvcih2YXIgZT10aGlzLGY9dGhpcy4kZWxlbWVudC5maW5kKFwib3B0aW9uXCIpLGc9Zi5tYXAoZnVuY3Rpb24oKXtyZXR1cm4gZS5pdGVtKGModGhpcykpLmlkfSkuZ2V0KCksaD1bXSxpPTA7aTxhLmxlbmd0aDtpKyspe3ZhciBqPXRoaXMuX25vcm1hbGl6ZUl0ZW0oYVtpXSk7aWYoYy5pbkFycmF5KGouaWQsZyk+PTApe3ZhciBrPWYuZmlsdGVyKGQoaikpLGw9dGhpcy5pdGVtKGspLG09Yy5leHRlbmQoITAse30saixsKSxuPXRoaXMub3B0aW9uKG0pO2sucmVwbGFjZVdpdGgobil9ZWxzZXt2YXIgbz10aGlzLm9wdGlvbihqKTtpZihqLmNoaWxkcmVuKXt2YXIgcD10aGlzLmNvbnZlcnRUb09wdGlvbnMoai5jaGlsZHJlbik7Yi5hcHBlbmRNYW55KG8scCl9aC5wdXNoKG8pfX1yZXR1cm4gaH0sZH0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kYXRhL2FqYXhcIixbXCIuL2FycmF5XCIsXCIuLi91dGlsc1wiLFwianF1ZXJ5XCJdLGZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGEsYil7dGhpcy5hamF4T3B0aW9ucz10aGlzLl9hcHBseURlZmF1bHRzKGIuZ2V0KFwiYWpheFwiKSksbnVsbCE9dGhpcy5hamF4T3B0aW9ucy5wcm9jZXNzUmVzdWx0cyYmKHRoaXMucHJvY2Vzc1Jlc3VsdHM9dGhpcy5hamF4T3B0aW9ucy5wcm9jZXNzUmVzdWx0cyksZC5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzLGEsYil9cmV0dXJuIGIuRXh0ZW5kKGQsYSksZC5wcm90b3R5cGUuX2FwcGx5RGVmYXVsdHM9ZnVuY3Rpb24oYSl7dmFyIGI9e2RhdGE6ZnVuY3Rpb24oYSl7cmV0dXJuIGMuZXh0ZW5kKHt9LGEse3E6YS50ZXJtfSl9LHRyYW5zcG9ydDpmdW5jdGlvbihhLGIsZCl7dmFyIGU9Yy5hamF4KGEpO3JldHVybiBlLnRoZW4oYiksZS5mYWlsKGQpLGV9fTtyZXR1cm4gYy5leHRlbmQoe30sYixhLCEwKX0sZC5wcm90b3R5cGUucHJvY2Vzc1Jlc3VsdHM9ZnVuY3Rpb24oYSl7cmV0dXJuIGF9LGQucHJvdG90eXBlLnF1ZXJ5PWZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gZCgpe3ZhciBkPWYudHJhbnNwb3J0KGYsZnVuY3Rpb24oZCl7dmFyIGY9ZS5wcm9jZXNzUmVzdWx0cyhkLGEpO2Uub3B0aW9ucy5nZXQoXCJkZWJ1Z1wiKSYmd2luZG93LmNvbnNvbGUmJmNvbnNvbGUuZXJyb3ImJihmJiZmLnJlc3VsdHMmJmMuaXNBcnJheShmLnJlc3VsdHMpfHxjb25zb2xlLmVycm9yKFwiU2VsZWN0MjogVGhlIEFKQVggcmVzdWx0cyBkaWQgbm90IHJldHVybiBhbiBhcnJheSBpbiB0aGUgYHJlc3VsdHNgIGtleSBvZiB0aGUgcmVzcG9uc2UuXCIpKSxiKGYpfSxmdW5jdGlvbigpe2Quc3RhdHVzJiZcIjBcIj09PWQuc3RhdHVzfHxlLnRyaWdnZXIoXCJyZXN1bHRzOm1lc3NhZ2VcIix7bWVzc2FnZTpcImVycm9yTG9hZGluZ1wifSl9KTtlLl9yZXF1ZXN0PWR9dmFyIGU9dGhpcztudWxsIT10aGlzLl9yZXF1ZXN0JiYoYy5pc0Z1bmN0aW9uKHRoaXMuX3JlcXVlc3QuYWJvcnQpJiZ0aGlzLl9yZXF1ZXN0LmFib3J0KCksdGhpcy5fcmVxdWVzdD1udWxsKTt2YXIgZj1jLmV4dGVuZCh7dHlwZTpcIkdFVFwifSx0aGlzLmFqYXhPcHRpb25zKTtcImZ1bmN0aW9uXCI9PXR5cGVvZiBmLnVybCYmKGYudXJsPWYudXJsLmNhbGwodGhpcy4kZWxlbWVudCxhKSksXCJmdW5jdGlvblwiPT10eXBlb2YgZi5kYXRhJiYoZi5kYXRhPWYuZGF0YS5jYWxsKHRoaXMuJGVsZW1lbnQsYSkpLHRoaXMuYWpheE9wdGlvbnMuZGVsYXkmJm51bGwhPWEudGVybT8odGhpcy5fcXVlcnlUaW1lb3V0JiZ3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuX3F1ZXJ5VGltZW91dCksdGhpcy5fcXVlcnlUaW1lb3V0PXdpbmRvdy5zZXRUaW1lb3V0KGQsdGhpcy5hamF4T3B0aW9ucy5kZWxheSkpOmQoKX0sZH0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kYXRhL3RhZ3NcIixbXCJqcXVlcnlcIl0sZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYihiLGMsZCl7dmFyIGU9ZC5nZXQoXCJ0YWdzXCIpLGY9ZC5nZXQoXCJjcmVhdGVUYWdcIik7dm9pZCAwIT09ZiYmKHRoaXMuY3JlYXRlVGFnPWYpO3ZhciBnPWQuZ2V0KFwiaW5zZXJ0VGFnXCIpO2lmKHZvaWQgMCE9PWcmJih0aGlzLmluc2VydFRhZz1nKSxiLmNhbGwodGhpcyxjLGQpLGEuaXNBcnJheShlKSlmb3IodmFyIGg9MDtoPGUubGVuZ3RoO2grKyl7dmFyIGk9ZVtoXSxqPXRoaXMuX25vcm1hbGl6ZUl0ZW0oaSksaz10aGlzLm9wdGlvbihqKTt0aGlzLiRlbGVtZW50LmFwcGVuZChrKX19cmV0dXJuIGIucHJvdG90eXBlLnF1ZXJ5PWZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGEsZil7Zm9yKHZhciBnPWEucmVzdWx0cyxoPTA7aDxnLmxlbmd0aDtoKyspe3ZhciBpPWdbaF0saj1udWxsIT1pLmNoaWxkcmVuJiYhZCh7cmVzdWx0czppLmNoaWxkcmVufSwhMCksaz1pLnRleHQ9PT1iLnRlcm07aWYoa3x8ailyZXR1cm4gZj8hMTooYS5kYXRhPWcsdm9pZCBjKGEpKX1pZihmKXJldHVybiEwO3ZhciBsPWUuY3JlYXRlVGFnKGIpO2lmKG51bGwhPWwpe3ZhciBtPWUub3B0aW9uKGwpO20uYXR0cihcImRhdGEtc2VsZWN0Mi10YWdcIiwhMCksZS5hZGRPcHRpb25zKFttXSksZS5pbnNlcnRUYWcoZyxsKX1hLnJlc3VsdHM9ZyxjKGEpfXZhciBlPXRoaXM7cmV0dXJuIHRoaXMuX3JlbW92ZU9sZFRhZ3MoKSxudWxsPT1iLnRlcm18fG51bGwhPWIucGFnZT92b2lkIGEuY2FsbCh0aGlzLGIsYyk6dm9pZCBhLmNhbGwodGhpcyxiLGQpfSxiLnByb3RvdHlwZS5jcmVhdGVUYWc9ZnVuY3Rpb24oYixjKXt2YXIgZD1hLnRyaW0oYy50ZXJtKTtyZXR1cm5cIlwiPT09ZD9udWxsOntpZDpkLHRleHQ6ZH19LGIucHJvdG90eXBlLmluc2VydFRhZz1mdW5jdGlvbihhLGIsYyl7Yi51bnNoaWZ0KGMpfSxiLnByb3RvdHlwZS5fcmVtb3ZlT2xkVGFncz1mdW5jdGlvbihiKXt2YXIgYz0odGhpcy5fbGFzdFRhZyx0aGlzLiRlbGVtZW50LmZpbmQoXCJvcHRpb25bZGF0YS1zZWxlY3QyLXRhZ11cIikpO2MuZWFjaChmdW5jdGlvbigpe3RoaXMuc2VsZWN0ZWR8fGEodGhpcykucmVtb3ZlKCl9KX0sYn0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kYXRhL3Rva2VuaXplclwiLFtcImpxdWVyeVwiXSxmdW5jdGlvbihhKXtmdW5jdGlvbiBiKGEsYixjKXt2YXIgZD1jLmdldChcInRva2VuaXplclwiKTt2b2lkIDAhPT1kJiYodGhpcy50b2tlbml6ZXI9ZCksYS5jYWxsKHRoaXMsYixjKX1yZXR1cm4gYi5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihhLGIsYyl7YS5jYWxsKHRoaXMsYixjKSx0aGlzLiRzZWFyY2g9Yi5kcm9wZG93bi4kc2VhcmNofHxiLnNlbGVjdGlvbi4kc2VhcmNofHxjLmZpbmQoXCIuc2VsZWN0Mi1zZWFyY2hfX2ZpZWxkXCIpfSxiLnByb3RvdHlwZS5xdWVyeT1mdW5jdGlvbihiLGMsZCl7ZnVuY3Rpb24gZShiKXt2YXIgYz1nLl9ub3JtYWxpemVJdGVtKGIpLGQ9Zy4kZWxlbWVudC5maW5kKFwib3B0aW9uXCIpLmZpbHRlcihmdW5jdGlvbigpe3JldHVybiBhKHRoaXMpLnZhbCgpPT09Yy5pZH0pO2lmKCFkLmxlbmd0aCl7dmFyIGU9Zy5vcHRpb24oYyk7ZS5hdHRyKFwiZGF0YS1zZWxlY3QyLXRhZ1wiLCEwKSxnLl9yZW1vdmVPbGRUYWdzKCksZy5hZGRPcHRpb25zKFtlXSl9ZihjKX1mdW5jdGlvbiBmKGEpe2cudHJpZ2dlcihcInNlbGVjdFwiLHtkYXRhOmF9KX12YXIgZz10aGlzO2MudGVybT1jLnRlcm18fFwiXCI7dmFyIGg9dGhpcy50b2tlbml6ZXIoYyx0aGlzLm9wdGlvbnMsZSk7aC50ZXJtIT09Yy50ZXJtJiYodGhpcy4kc2VhcmNoLmxlbmd0aCYmKHRoaXMuJHNlYXJjaC52YWwoaC50ZXJtKSx0aGlzLiRzZWFyY2guZm9jdXMoKSksYy50ZXJtPWgudGVybSksYi5jYWxsKHRoaXMsYyxkKX0sYi5wcm90b3R5cGUudG9rZW5pemVyPWZ1bmN0aW9uKGIsYyxkLGUpe2Zvcih2YXIgZj1kLmdldChcInRva2VuU2VwYXJhdG9yc1wiKXx8W10sZz1jLnRlcm0saD0wLGk9dGhpcy5jcmVhdGVUYWd8fGZ1bmN0aW9uKGEpe3JldHVybntpZDphLnRlcm0sdGV4dDphLnRlcm19fTtoPGcubGVuZ3RoOyl7dmFyIGo9Z1toXTtpZigtMSE9PWEuaW5BcnJheShqLGYpKXt2YXIgaz1nLnN1YnN0cigwLGgpLGw9YS5leHRlbmQoe30sYyx7dGVybTprfSksbT1pKGwpO251bGwhPW0/KGUobSksZz1nLnN1YnN0cihoKzEpfHxcIlwiLGg9MCk6aCsrfWVsc2UgaCsrfXJldHVybnt0ZXJtOmd9fSxifSksYi5kZWZpbmUoXCJzZWxlY3QyL2RhdGEvbWluaW11bUlucHV0TGVuZ3RoXCIsW10sZnVuY3Rpb24oKXtmdW5jdGlvbiBhKGEsYixjKXt0aGlzLm1pbmltdW1JbnB1dExlbmd0aD1jLmdldChcIm1pbmltdW1JbnB1dExlbmd0aFwiKSxhLmNhbGwodGhpcyxiLGMpfXJldHVybiBhLnByb3RvdHlwZS5xdWVyeT1mdW5jdGlvbihhLGIsYyl7cmV0dXJuIGIudGVybT1iLnRlcm18fFwiXCIsYi50ZXJtLmxlbmd0aDx0aGlzLm1pbmltdW1JbnB1dExlbmd0aD92b2lkIHRoaXMudHJpZ2dlcihcInJlc3VsdHM6bWVzc2FnZVwiLHttZXNzYWdlOlwiaW5wdXRUb29TaG9ydFwiLGFyZ3M6e21pbmltdW06dGhpcy5taW5pbXVtSW5wdXRMZW5ndGgsaW5wdXQ6Yi50ZXJtLHBhcmFtczpifX0pOnZvaWQgYS5jYWxsKHRoaXMsYixjKX0sYX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kYXRhL21heGltdW1JbnB1dExlbmd0aFwiLFtdLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShhLGIsYyl7dGhpcy5tYXhpbXVtSW5wdXRMZW5ndGg9Yy5nZXQoXCJtYXhpbXVtSW5wdXRMZW5ndGhcIiksYS5jYWxsKHRoaXMsYixjKX1yZXR1cm4gYS5wcm90b3R5cGUucXVlcnk9ZnVuY3Rpb24oYSxiLGMpe3JldHVybiBiLnRlcm09Yi50ZXJtfHxcIlwiLHRoaXMubWF4aW11bUlucHV0TGVuZ3RoPjAmJmIudGVybS5sZW5ndGg+dGhpcy5tYXhpbXVtSW5wdXRMZW5ndGg/dm9pZCB0aGlzLnRyaWdnZXIoXCJyZXN1bHRzOm1lc3NhZ2VcIix7bWVzc2FnZTpcImlucHV0VG9vTG9uZ1wiLGFyZ3M6e21heGltdW06dGhpcy5tYXhpbXVtSW5wdXRMZW5ndGgsaW5wdXQ6Yi50ZXJtLHBhcmFtczpifX0pOnZvaWQgYS5jYWxsKHRoaXMsYixjKX0sYX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kYXRhL21heGltdW1TZWxlY3Rpb25MZW5ndGhcIixbXSxmdW5jdGlvbigpe2Z1bmN0aW9uIGEoYSxiLGMpe3RoaXMubWF4aW11bVNlbGVjdGlvbkxlbmd0aD1jLmdldChcIm1heGltdW1TZWxlY3Rpb25MZW5ndGhcIiksYS5jYWxsKHRoaXMsYixjKX1yZXR1cm4gYS5wcm90b3R5cGUucXVlcnk9ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPXRoaXM7dGhpcy5jdXJyZW50KGZ1bmN0aW9uKGUpe3ZhciBmPW51bGwhPWU/ZS5sZW5ndGg6MDtyZXR1cm4gZC5tYXhpbXVtU2VsZWN0aW9uTGVuZ3RoPjAmJmY+PWQubWF4aW11bVNlbGVjdGlvbkxlbmd0aD92b2lkIGQudHJpZ2dlcihcInJlc3VsdHM6bWVzc2FnZVwiLHttZXNzYWdlOlwibWF4aW11bVNlbGVjdGVkXCIsYXJnczp7bWF4aW11bTpkLm1heGltdW1TZWxlY3Rpb25MZW5ndGh9fSk6dm9pZCBhLmNhbGwoZCxiLGMpfSl9LGF9KSxiLmRlZmluZShcInNlbGVjdDIvZHJvcGRvd25cIixbXCJqcXVlcnlcIixcIi4vdXRpbHNcIl0sZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGEsYil7dGhpcy4kZWxlbWVudD1hLHRoaXMub3B0aW9ucz1iLGMuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmNhbGwodGhpcyl9cmV0dXJuIGIuRXh0ZW5kKGMsYi5PYnNlcnZhYmxlKSxjLnByb3RvdHlwZS5yZW5kZXI9ZnVuY3Rpb24oKXt2YXIgYj1hKCc8c3BhbiBjbGFzcz1cInNlbGVjdDItZHJvcGRvd25cIj48c3BhbiBjbGFzcz1cInNlbGVjdDItcmVzdWx0c1wiPjwvc3Bhbj48L3NwYW4+Jyk7cmV0dXJuIGIuYXR0cihcImRpclwiLHRoaXMub3B0aW9ucy5nZXQoXCJkaXJcIikpLHRoaXMuJGRyb3Bkb3duPWIsYn0sYy5wcm90b3R5cGUuYmluZD1mdW5jdGlvbigpe30sYy5wcm90b3R5cGUucG9zaXRpb249ZnVuY3Rpb24oYSxiKXt9LGMucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLiRkcm9wZG93bi5yZW1vdmUoKX0sY30pLGIuZGVmaW5lKFwic2VsZWN0Mi9kcm9wZG93bi9zZWFyY2hcIixbXCJqcXVlcnlcIixcIi4uL3V0aWxzXCJdLGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYygpe31yZXR1cm4gYy5wcm90b3R5cGUucmVuZGVyPWZ1bmN0aW9uKGIpe3ZhciBjPWIuY2FsbCh0aGlzKSxkPWEoJzxzcGFuIGNsYXNzPVwic2VsZWN0Mi1zZWFyY2ggc2VsZWN0Mi1zZWFyY2gtLWRyb3Bkb3duXCI+PGlucHV0IGNsYXNzPVwic2VsZWN0Mi1zZWFyY2hfX2ZpZWxkXCIgdHlwZT1cInNlYXJjaFwiIHRhYmluZGV4PVwiLTFcIiBhdXRvY29tcGxldGU9XCJvZmZcIiBhdXRvY29ycmVjdD1cIm9mZlwiIGF1dG9jYXBpdGFsaXplPVwib2ZmXCIgc3BlbGxjaGVjaz1cImZhbHNlXCIgcm9sZT1cInRleHRib3hcIiAvPjwvc3Bhbj4nKTtyZXR1cm4gdGhpcy4kc2VhcmNoQ29udGFpbmVyPWQsdGhpcy4kc2VhcmNoPWQuZmluZChcImlucHV0XCIpLGMucHJlcGVuZChkKSxjfSxjLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGIsYyxkKXt2YXIgZT10aGlzO2IuY2FsbCh0aGlzLGMsZCksdGhpcy4kc2VhcmNoLm9uKFwia2V5ZG93blwiLGZ1bmN0aW9uKGEpe2UudHJpZ2dlcihcImtleXByZXNzXCIsYSksZS5fa2V5VXBQcmV2ZW50ZWQ9YS5pc0RlZmF1bHRQcmV2ZW50ZWQoKX0pLHRoaXMuJHNlYXJjaC5vbihcImlucHV0XCIsZnVuY3Rpb24oYil7YSh0aGlzKS5vZmYoXCJrZXl1cFwiKX0pLHRoaXMuJHNlYXJjaC5vbihcImtleXVwIGlucHV0XCIsZnVuY3Rpb24oYSl7ZS5oYW5kbGVTZWFyY2goYSl9KSxjLm9uKFwib3BlblwiLGZ1bmN0aW9uKCl7ZS4kc2VhcmNoLmF0dHIoXCJ0YWJpbmRleFwiLDApLGUuJHNlYXJjaC5mb2N1cygpLHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZS4kc2VhcmNoLmZvY3VzKCl9LDApfSksYy5vbihcImNsb3NlXCIsZnVuY3Rpb24oKXtlLiRzZWFyY2guYXR0cihcInRhYmluZGV4XCIsLTEpLGUuJHNlYXJjaC52YWwoXCJcIil9KSxjLm9uKFwiZm9jdXNcIixmdW5jdGlvbigpe2MuaXNPcGVuKCkmJmUuJHNlYXJjaC5mb2N1cygpfSksYy5vbihcInJlc3VsdHM6YWxsXCIsZnVuY3Rpb24oYSl7aWYobnVsbD09YS5xdWVyeS50ZXJtfHxcIlwiPT09YS5xdWVyeS50ZXJtKXt2YXIgYj1lLnNob3dTZWFyY2goYSk7Yj9lLiRzZWFyY2hDb250YWluZXIucmVtb3ZlQ2xhc3MoXCJzZWxlY3QyLXNlYXJjaC0taGlkZVwiKTplLiRzZWFyY2hDb250YWluZXIuYWRkQ2xhc3MoXCJzZWxlY3QyLXNlYXJjaC0taGlkZVwiKX19KX0sYy5wcm90b3R5cGUuaGFuZGxlU2VhcmNoPWZ1bmN0aW9uKGEpe2lmKCF0aGlzLl9rZXlVcFByZXZlbnRlZCl7dmFyIGI9dGhpcy4kc2VhcmNoLnZhbCgpO3RoaXMudHJpZ2dlcihcInF1ZXJ5XCIse3Rlcm06Yn0pfXRoaXMuX2tleVVwUHJldmVudGVkPSExfSxjLnByb3RvdHlwZS5zaG93U2VhcmNoPWZ1bmN0aW9uKGEsYil7cmV0dXJuITB9LGN9KSxiLmRlZmluZShcInNlbGVjdDIvZHJvcGRvd24vaGlkZVBsYWNlaG9sZGVyXCIsW10sZnVuY3Rpb24oKXtmdW5jdGlvbiBhKGEsYixjLGQpe3RoaXMucGxhY2Vob2xkZXI9dGhpcy5ub3JtYWxpemVQbGFjZWhvbGRlcihjLmdldChcInBsYWNlaG9sZGVyXCIpKSxhLmNhbGwodGhpcyxiLGMsZCl9cmV0dXJuIGEucHJvdG90eXBlLmFwcGVuZD1mdW5jdGlvbihhLGIpe2IucmVzdWx0cz10aGlzLnJlbW92ZVBsYWNlaG9sZGVyKGIucmVzdWx0cyksYS5jYWxsKHRoaXMsYil9LGEucHJvdG90eXBlLm5vcm1hbGl6ZVBsYWNlaG9sZGVyPWZ1bmN0aW9uKGEsYil7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIGImJihiPXtpZDpcIlwiLHRleHQ6Yn0pLGJ9LGEucHJvdG90eXBlLnJlbW92ZVBsYWNlaG9sZGVyPWZ1bmN0aW9uKGEsYil7Zm9yKHZhciBjPWIuc2xpY2UoMCksZD1iLmxlbmd0aC0xO2Q+PTA7ZC0tKXt2YXIgZT1iW2RdO3RoaXMucGxhY2Vob2xkZXIuaWQ9PT1lLmlkJiZjLnNwbGljZShkLDEpfXJldHVybiBjfSxhfSksYi5kZWZpbmUoXCJzZWxlY3QyL2Ryb3Bkb3duL2luZmluaXRlU2Nyb2xsXCIsW1wianF1ZXJ5XCJdLGZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoYSxiLGMsZCl7dGhpcy5sYXN0UGFyYW1zPXt9LGEuY2FsbCh0aGlzLGIsYyxkKSx0aGlzLiRsb2FkaW5nTW9yZT10aGlzLmNyZWF0ZUxvYWRpbmdNb3JlKCksdGhpcy5sb2FkaW5nPSExfXJldHVybiBiLnByb3RvdHlwZS5hcHBlbmQ9ZnVuY3Rpb24oYSxiKXt0aGlzLiRsb2FkaW5nTW9yZS5yZW1vdmUoKSx0aGlzLmxvYWRpbmc9ITEsYS5jYWxsKHRoaXMsYiksdGhpcy5zaG93TG9hZGluZ01vcmUoYikmJnRoaXMuJHJlc3VsdHMuYXBwZW5kKHRoaXMuJGxvYWRpbmdNb3JlKX0sYi5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihiLGMsZCl7dmFyIGU9dGhpcztiLmNhbGwodGhpcyxjLGQpLGMub24oXCJxdWVyeVwiLGZ1bmN0aW9uKGEpe2UubGFzdFBhcmFtcz1hLGUubG9hZGluZz0hMH0pLGMub24oXCJxdWVyeTphcHBlbmRcIixmdW5jdGlvbihhKXtlLmxhc3RQYXJhbXM9YSxlLmxvYWRpbmc9ITB9KSx0aGlzLiRyZXN1bHRzLm9uKFwic2Nyb2xsXCIsZnVuY3Rpb24oKXt2YXIgYj1hLmNvbnRhaW5zKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxlLiRsb2FkaW5nTW9yZVswXSk7aWYoIWUubG9hZGluZyYmYil7dmFyIGM9ZS4kcmVzdWx0cy5vZmZzZXQoKS50b3ArZS4kcmVzdWx0cy5vdXRlckhlaWdodCghMSksZD1lLiRsb2FkaW5nTW9yZS5vZmZzZXQoKS50b3ArZS4kbG9hZGluZ01vcmUub3V0ZXJIZWlnaHQoITEpO2MrNTA+PWQmJmUubG9hZE1vcmUoKX19KX0sYi5wcm90b3R5cGUubG9hZE1vcmU9ZnVuY3Rpb24oKXt0aGlzLmxvYWRpbmc9ITA7dmFyIGI9YS5leHRlbmQoe30se3BhZ2U6MX0sdGhpcy5sYXN0UGFyYW1zKTtiLnBhZ2UrKyx0aGlzLnRyaWdnZXIoXCJxdWVyeTphcHBlbmRcIixiKX0sYi5wcm90b3R5cGUuc2hvd0xvYWRpbmdNb3JlPWZ1bmN0aW9uKGEsYil7cmV0dXJuIGIucGFnaW5hdGlvbiYmYi5wYWdpbmF0aW9uLm1vcmV9LGIucHJvdG90eXBlLmNyZWF0ZUxvYWRpbmdNb3JlPWZ1bmN0aW9uKCl7dmFyIGI9YSgnPGxpIGNsYXNzPVwic2VsZWN0Mi1yZXN1bHRzX19vcHRpb24gc2VsZWN0Mi1yZXN1bHRzX19vcHRpb24tLWxvYWQtbW9yZVwicm9sZT1cInRyZWVpdGVtXCIgYXJpYS1kaXNhYmxlZD1cInRydWVcIj48L2xpPicpLGM9dGhpcy5vcHRpb25zLmdldChcInRyYW5zbGF0aW9uc1wiKS5nZXQoXCJsb2FkaW5nTW9yZVwiKTtyZXR1cm4gYi5odG1sKGModGhpcy5sYXN0UGFyYW1zKSksYn0sYn0pLGIuZGVmaW5lKFwic2VsZWN0Mi9kcm9wZG93bi9hdHRhY2hCb2R5XCIsW1wianF1ZXJ5XCIsXCIuLi91dGlsc1wiXSxmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYixjLGQpe3RoaXMuJGRyb3Bkb3duUGFyZW50PWQuZ2V0KFwiZHJvcGRvd25QYXJlbnRcIil8fGEoZG9jdW1lbnQuYm9keSksYi5jYWxsKHRoaXMsYyxkKX1yZXR1cm4gYy5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihhLGIsYyl7dmFyIGQ9dGhpcyxlPSExO2EuY2FsbCh0aGlzLGIsYyksYi5vbihcIm9wZW5cIixmdW5jdGlvbigpe2QuX3Nob3dEcm9wZG93bigpLGQuX2F0dGFjaFBvc2l0aW9uaW5nSGFuZGxlcihiKSxlfHwoZT0hMCxiLm9uKFwicmVzdWx0czphbGxcIixmdW5jdGlvbigpe2QuX3Bvc2l0aW9uRHJvcGRvd24oKSxkLl9yZXNpemVEcm9wZG93bigpfSksYi5vbihcInJlc3VsdHM6YXBwZW5kXCIsZnVuY3Rpb24oKXtkLl9wb3NpdGlvbkRyb3Bkb3duKCksZC5fcmVzaXplRHJvcGRvd24oKX0pKX0pLGIub24oXCJjbG9zZVwiLGZ1bmN0aW9uKCl7ZC5faGlkZURyb3Bkb3duKCksZC5fZGV0YWNoUG9zaXRpb25pbmdIYW5kbGVyKGIpfSksdGhpcy4kZHJvcGRvd25Db250YWluZXIub24oXCJtb3VzZWRvd25cIixmdW5jdGlvbihhKXthLnN0b3BQcm9wYWdhdGlvbigpfSl9LGMucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oYSl7YS5jYWxsKHRoaXMpLHRoaXMuJGRyb3Bkb3duQ29udGFpbmVyLnJlbW92ZSgpfSxjLnByb3RvdHlwZS5wb3NpdGlvbj1mdW5jdGlvbihhLGIsYyl7Yi5hdHRyKFwiY2xhc3NcIixjLmF0dHIoXCJjbGFzc1wiKSksYi5yZW1vdmVDbGFzcyhcInNlbGVjdDJcIiksYi5hZGRDbGFzcyhcInNlbGVjdDItY29udGFpbmVyLS1vcGVuXCIpLGIuY3NzKHtwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOi05OTk5OTl9KSx0aGlzLiRjb250YWluZXI9Y30sYy5wcm90b3R5cGUucmVuZGVyPWZ1bmN0aW9uKGIpe3ZhciBjPWEoXCI8c3Bhbj48L3NwYW4+XCIpLGQ9Yi5jYWxsKHRoaXMpO3JldHVybiBjLmFwcGVuZChkKSx0aGlzLiRkcm9wZG93bkNvbnRhaW5lcj1jLGN9LGMucHJvdG90eXBlLl9oaWRlRHJvcGRvd249ZnVuY3Rpb24oYSl7dGhpcy4kZHJvcGRvd25Db250YWluZXIuZGV0YWNoKCl9LGMucHJvdG90eXBlLl9hdHRhY2hQb3NpdGlvbmluZ0hhbmRsZXI9ZnVuY3Rpb24oYyxkKXt2YXIgZT10aGlzLGY9XCJzY3JvbGwuc2VsZWN0Mi5cIitkLmlkLGc9XCJyZXNpemUuc2VsZWN0Mi5cIitkLmlkLGg9XCJvcmllbnRhdGlvbmNoYW5nZS5zZWxlY3QyLlwiK2QuaWQsaT10aGlzLiRjb250YWluZXIucGFyZW50cygpLmZpbHRlcihiLmhhc1Njcm9sbCk7aS5lYWNoKGZ1bmN0aW9uKCl7YSh0aGlzKS5kYXRhKFwic2VsZWN0Mi1zY3JvbGwtcG9zaXRpb25cIix7eDphKHRoaXMpLnNjcm9sbExlZnQoKSx5OmEodGhpcykuc2Nyb2xsVG9wKCl9KX0pLGkub24oZixmdW5jdGlvbihiKXt2YXIgYz1hKHRoaXMpLmRhdGEoXCJzZWxlY3QyLXNjcm9sbC1wb3NpdGlvblwiKTthKHRoaXMpLnNjcm9sbFRvcChjLnkpfSksYSh3aW5kb3cpLm9uKGYrXCIgXCIrZytcIiBcIitoLGZ1bmN0aW9uKGEpe2UuX3Bvc2l0aW9uRHJvcGRvd24oKSxlLl9yZXNpemVEcm9wZG93bigpfSl9LGMucHJvdG90eXBlLl9kZXRhY2hQb3NpdGlvbmluZ0hhbmRsZXI9ZnVuY3Rpb24oYyxkKXt2YXIgZT1cInNjcm9sbC5zZWxlY3QyLlwiK2QuaWQsZj1cInJlc2l6ZS5zZWxlY3QyLlwiK2QuaWQsZz1cIm9yaWVudGF0aW9uY2hhbmdlLnNlbGVjdDIuXCIrZC5pZCxoPXRoaXMuJGNvbnRhaW5lci5wYXJlbnRzKCkuZmlsdGVyKGIuaGFzU2Nyb2xsKTtoLm9mZihlKSxhKHdpbmRvdykub2ZmKGUrXCIgXCIrZitcIiBcIitnKX0sYy5wcm90b3R5cGUuX3Bvc2l0aW9uRHJvcGRvd249ZnVuY3Rpb24oKXt2YXIgYj1hKHdpbmRvdyksYz10aGlzLiRkcm9wZG93bi5oYXNDbGFzcyhcInNlbGVjdDItZHJvcGRvd24tLWFib3ZlXCIpLGQ9dGhpcy4kZHJvcGRvd24uaGFzQ2xhc3MoXCJzZWxlY3QyLWRyb3Bkb3duLS1iZWxvd1wiKSxlPW51bGwsZj10aGlzLiRjb250YWluZXIub2Zmc2V0KCk7Zi5ib3R0b209Zi50b3ArdGhpcy4kY29udGFpbmVyLm91dGVySGVpZ2h0KCExKTt2YXIgZz17aGVpZ2h0OnRoaXMuJGNvbnRhaW5lci5vdXRlckhlaWdodCghMSl9O2cudG9wPWYudG9wLGcuYm90dG9tPWYudG9wK2cuaGVpZ2h0O3ZhciBoPXtoZWlnaHQ6dGhpcy4kZHJvcGRvd24ub3V0ZXJIZWlnaHQoITEpfSxpPXt0b3A6Yi5zY3JvbGxUb3AoKSxib3R0b206Yi5zY3JvbGxUb3AoKStiLmhlaWdodCgpfSxqPWkudG9wPGYudG9wLWguaGVpZ2h0LGs9aS5ib3R0b20+Zi5ib3R0b20raC5oZWlnaHQsbD17bGVmdDpmLmxlZnQsdG9wOmcuYm90dG9tfSxtPXRoaXMuJGRyb3Bkb3duUGFyZW50O1wic3RhdGljXCI9PT1tLmNzcyhcInBvc2l0aW9uXCIpJiYobT1tLm9mZnNldFBhcmVudCgpKTt2YXIgbj1tLm9mZnNldCgpO2wudG9wLT1uLnRvcCxsLmxlZnQtPW4ubGVmdCxjfHxkfHwoZT1cImJlbG93XCIpLGt8fCFqfHxjPyFqJiZrJiZjJiYoZT1cImJlbG93XCIpOmU9XCJhYm92ZVwiLChcImFib3ZlXCI9PWV8fGMmJlwiYmVsb3dcIiE9PWUpJiYobC50b3A9Zy50b3Atbi50b3AtaC5oZWlnaHQpLG51bGwhPWUmJih0aGlzLiRkcm9wZG93bi5yZW1vdmVDbGFzcyhcInNlbGVjdDItZHJvcGRvd24tLWJlbG93IHNlbGVjdDItZHJvcGRvd24tLWFib3ZlXCIpLmFkZENsYXNzKFwic2VsZWN0Mi1kcm9wZG93bi0tXCIrZSksdGhpcy4kY29udGFpbmVyLnJlbW92ZUNsYXNzKFwic2VsZWN0Mi1jb250YWluZXItLWJlbG93IHNlbGVjdDItY29udGFpbmVyLS1hYm92ZVwiKS5hZGRDbGFzcyhcInNlbGVjdDItY29udGFpbmVyLS1cIitlKSksdGhpcy4kZHJvcGRvd25Db250YWluZXIuY3NzKGwpfSxjLnByb3RvdHlwZS5fcmVzaXplRHJvcGRvd249ZnVuY3Rpb24oKXt2YXIgYT17d2lkdGg6dGhpcy4kY29udGFpbmVyLm91dGVyV2lkdGgoITEpK1wicHhcIn07dGhpcy5vcHRpb25zLmdldChcImRyb3Bkb3duQXV0b1dpZHRoXCIpJiYoYS5taW5XaWR0aD1hLndpZHRoLGEucG9zaXRpb249XCJyZWxhdGl2ZVwiLGEud2lkdGg9XCJhdXRvXCIpLHRoaXMuJGRyb3Bkb3duLmNzcyhhKX0sYy5wcm90b3R5cGUuX3Nob3dEcm9wZG93bj1mdW5jdGlvbihhKXt0aGlzLiRkcm9wZG93bkNvbnRhaW5lci5hcHBlbmRUbyh0aGlzLiRkcm9wZG93blBhcmVudCksdGhpcy5fcG9zaXRpb25Ecm9wZG93bigpLHRoaXMuX3Jlc2l6ZURyb3Bkb3duKCl9LGN9KSxiLmRlZmluZShcInNlbGVjdDIvZHJvcGRvd24vbWluaW11bVJlc3VsdHNGb3JTZWFyY2hcIixbXSxmdW5jdGlvbigpe2Z1bmN0aW9uIGEoYil7Zm9yKHZhciBjPTAsZD0wO2Q8Yi5sZW5ndGg7ZCsrKXt2YXIgZT1iW2RdO2UuY2hpbGRyZW4/Yys9YShlLmNoaWxkcmVuKTpjKyt9cmV0dXJuIGN9ZnVuY3Rpb24gYihhLGIsYyxkKXt0aGlzLm1pbmltdW1SZXN1bHRzRm9yU2VhcmNoPWMuZ2V0KFwibWluaW11bVJlc3VsdHNGb3JTZWFyY2hcIiksdGhpcy5taW5pbXVtUmVzdWx0c0ZvclNlYXJjaDwwJiYodGhpcy5taW5pbXVtUmVzdWx0c0ZvclNlYXJjaD0xLzApLGEuY2FsbCh0aGlzLGIsYyxkKX1yZXR1cm4gYi5wcm90b3R5cGUuc2hvd1NlYXJjaD1mdW5jdGlvbihiLGMpe3JldHVybiBhKGMuZGF0YS5yZXN1bHRzKTx0aGlzLm1pbmltdW1SZXN1bHRzRm9yU2VhcmNoPyExOmIuY2FsbCh0aGlzLGMpfSxifSksYi5kZWZpbmUoXCJzZWxlY3QyL2Ryb3Bkb3duL3NlbGVjdE9uQ2xvc2VcIixbXSxmdW5jdGlvbigpe2Z1bmN0aW9uIGEoKXt9cmV0dXJuIGEucHJvdG90eXBlLmJpbmQ9ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPXRoaXM7YS5jYWxsKHRoaXMsYixjKSxiLm9uKFwiY2xvc2VcIixmdW5jdGlvbihhKXtkLl9oYW5kbGVTZWxlY3RPbkNsb3NlKGEpfSl9LGEucHJvdG90eXBlLl9oYW5kbGVTZWxlY3RPbkNsb3NlPWZ1bmN0aW9uKGEsYil7aWYoYiYmbnVsbCE9Yi5vcmlnaW5hbFNlbGVjdDJFdmVudCl7dmFyIGM9Yi5vcmlnaW5hbFNlbGVjdDJFdmVudDtpZihcInNlbGVjdFwiPT09Yy5fdHlwZXx8XCJ1bnNlbGVjdFwiPT09Yy5fdHlwZSlyZXR1cm59dmFyIGQ9dGhpcy5nZXRIaWdobGlnaHRlZFJlc3VsdHMoKTtpZighKGQubGVuZ3RoPDEpKXt2YXIgZT1kLmRhdGEoXCJkYXRhXCIpO251bGwhPWUuZWxlbWVudCYmZS5lbGVtZW50LnNlbGVjdGVkfHxudWxsPT1lLmVsZW1lbnQmJmUuc2VsZWN0ZWR8fHRoaXMudHJpZ2dlcihcInNlbGVjdFwiLHtkYXRhOmV9KX19LGF9KSxiLmRlZmluZShcInNlbGVjdDIvZHJvcGRvd24vY2xvc2VPblNlbGVjdFwiLFtdLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gYSgpe31yZXR1cm4gYS5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihhLGIsYyl7dmFyIGQ9dGhpczthLmNhbGwodGhpcyxiLGMpLGIub24oXCJzZWxlY3RcIixmdW5jdGlvbihhKXtkLl9zZWxlY3RUcmlnZ2VyZWQoYSl9KSxiLm9uKFwidW5zZWxlY3RcIixmdW5jdGlvbihhKXtkLl9zZWxlY3RUcmlnZ2VyZWQoYSl9KX0sYS5wcm90b3R5cGUuX3NlbGVjdFRyaWdnZXJlZD1mdW5jdGlvbihhLGIpe3ZhciBjPWIub3JpZ2luYWxFdmVudDtjJiZjLmN0cmxLZXl8fHRoaXMudHJpZ2dlcihcImNsb3NlXCIse29yaWdpbmFsRXZlbnQ6YyxvcmlnaW5hbFNlbGVjdDJFdmVudDpifSl9LGF9KSxiLmRlZmluZShcInNlbGVjdDIvaTE4bi9lblwiLFtdLGZ1bmN0aW9uKCl7cmV0dXJue2Vycm9yTG9hZGluZzpmdW5jdGlvbigpe3JldHVyblwiVGhlIHJlc3VsdHMgY291bGQgbm90IGJlIGxvYWRlZC5cIn0saW5wdXRUb29Mb25nOmZ1bmN0aW9uKGEpe3ZhciBiPWEuaW5wdXQubGVuZ3RoLWEubWF4aW11bSxjPVwiUGxlYXNlIGRlbGV0ZSBcIitiK1wiIGNoYXJhY3RlclwiO3JldHVybiAxIT1iJiYoYys9XCJzXCIpLGN9LGlucHV0VG9vU2hvcnQ6ZnVuY3Rpb24oYSl7dmFyIGI9YS5taW5pbXVtLWEuaW5wdXQubGVuZ3RoLGM9XCJQbGVhc2UgZW50ZXIgXCIrYitcIiBvciBtb3JlIGNoYXJhY3RlcnNcIjtyZXR1cm4gY30sbG9hZGluZ01vcmU6ZnVuY3Rpb24oKXtyZXR1cm5cIkxvYWRpbmcgbW9yZSByZXN1bHRz4oCmXCJ9LG1heGltdW1TZWxlY3RlZDpmdW5jdGlvbihhKXt2YXIgYj1cIllvdSBjYW4gb25seSBzZWxlY3QgXCIrYS5tYXhpbXVtK1wiIGl0ZW1cIjtyZXR1cm4gMSE9YS5tYXhpbXVtJiYoYis9XCJzXCIpLGJ9LG5vUmVzdWx0czpmdW5jdGlvbigpe3JldHVyblwiTm8gcmVzdWx0cyBmb3VuZFwifSxzZWFyY2hpbmc6ZnVuY3Rpb24oKXtyZXR1cm5cIlNlYXJjaGluZ+KAplwifX19KSxiLmRlZmluZShcInNlbGVjdDIvZGVmYXVsdHNcIixbXCJqcXVlcnlcIixcInJlcXVpcmVcIixcIi4vcmVzdWx0c1wiLFwiLi9zZWxlY3Rpb24vc2luZ2xlXCIsXCIuL3NlbGVjdGlvbi9tdWx0aXBsZVwiLFwiLi9zZWxlY3Rpb24vcGxhY2Vob2xkZXJcIixcIi4vc2VsZWN0aW9uL2FsbG93Q2xlYXJcIixcIi4vc2VsZWN0aW9uL3NlYXJjaFwiLFwiLi9zZWxlY3Rpb24vZXZlbnRSZWxheVwiLFwiLi91dGlsc1wiLFwiLi90cmFuc2xhdGlvblwiLFwiLi9kaWFjcml0aWNzXCIsXCIuL2RhdGEvc2VsZWN0XCIsXCIuL2RhdGEvYXJyYXlcIixcIi4vZGF0YS9hamF4XCIsXCIuL2RhdGEvdGFnc1wiLFwiLi9kYXRhL3Rva2VuaXplclwiLFwiLi9kYXRhL21pbmltdW1JbnB1dExlbmd0aFwiLFwiLi9kYXRhL21heGltdW1JbnB1dExlbmd0aFwiLFwiLi9kYXRhL21heGltdW1TZWxlY3Rpb25MZW5ndGhcIixcIi4vZHJvcGRvd25cIixcIi4vZHJvcGRvd24vc2VhcmNoXCIsXCIuL2Ryb3Bkb3duL2hpZGVQbGFjZWhvbGRlclwiLFwiLi9kcm9wZG93bi9pbmZpbml0ZVNjcm9sbFwiLFwiLi9kcm9wZG93bi9hdHRhY2hCb2R5XCIsXCIuL2Ryb3Bkb3duL21pbmltdW1SZXN1bHRzRm9yU2VhcmNoXCIsXCIuL2Ryb3Bkb3duL3NlbGVjdE9uQ2xvc2VcIixcIi4vZHJvcGRvd24vY2xvc2VPblNlbGVjdFwiLFwiLi9pMThuL2VuXCJdLGZ1bmN0aW9uKGEsYixjLGQsZSxmLGcsaCxpLGosayxsLG0sbixvLHAscSxyLHMsdCx1LHYsdyx4LHkseixBLEIsQyl7ZnVuY3Rpb24gRCgpe3RoaXMucmVzZXQoKX1ELnByb3RvdHlwZS5hcHBseT1mdW5jdGlvbihsKXtpZihsPWEuZXh0ZW5kKCEwLHt9LHRoaXMuZGVmYXVsdHMsbCksbnVsbD09bC5kYXRhQWRhcHRlcil7aWYobnVsbCE9bC5hamF4P2wuZGF0YUFkYXB0ZXI9bzpudWxsIT1sLmRhdGE/bC5kYXRhQWRhcHRlcj1uOmwuZGF0YUFkYXB0ZXI9bSxsLm1pbmltdW1JbnB1dExlbmd0aD4wJiYobC5kYXRhQWRhcHRlcj1qLkRlY29yYXRlKGwuZGF0YUFkYXB0ZXIscikpLGwubWF4aW11bUlucHV0TGVuZ3RoPjAmJihsLmRhdGFBZGFwdGVyPWouRGVjb3JhdGUobC5kYXRhQWRhcHRlcixzKSksbC5tYXhpbXVtU2VsZWN0aW9uTGVuZ3RoPjAmJihsLmRhdGFBZGFwdGVyPWouRGVjb3JhdGUobC5kYXRhQWRhcHRlcix0KSksbC50YWdzJiYobC5kYXRhQWRhcHRlcj1qLkRlY29yYXRlKGwuZGF0YUFkYXB0ZXIscCkpLChudWxsIT1sLnRva2VuU2VwYXJhdG9yc3x8bnVsbCE9bC50b2tlbml6ZXIpJiYobC5kYXRhQWRhcHRlcj1qLkRlY29yYXRlKGwuZGF0YUFkYXB0ZXIscSkpLG51bGwhPWwucXVlcnkpe3ZhciBDPWIobC5hbWRCYXNlK1wiY29tcGF0L3F1ZXJ5XCIpO2wuZGF0YUFkYXB0ZXI9ai5EZWNvcmF0ZShsLmRhdGFBZGFwdGVyLEMpfWlmKG51bGwhPWwuaW5pdFNlbGVjdGlvbil7dmFyIEQ9YihsLmFtZEJhc2UrXCJjb21wYXQvaW5pdFNlbGVjdGlvblwiKTtsLmRhdGFBZGFwdGVyPWouRGVjb3JhdGUobC5kYXRhQWRhcHRlcixEKX19aWYobnVsbD09bC5yZXN1bHRzQWRhcHRlciYmKGwucmVzdWx0c0FkYXB0ZXI9YyxudWxsIT1sLmFqYXgmJihsLnJlc3VsdHNBZGFwdGVyPWouRGVjb3JhdGUobC5yZXN1bHRzQWRhcHRlcix4KSksbnVsbCE9bC5wbGFjZWhvbGRlciYmKGwucmVzdWx0c0FkYXB0ZXI9ai5EZWNvcmF0ZShsLnJlc3VsdHNBZGFwdGVyLHcpKSxsLnNlbGVjdE9uQ2xvc2UmJihsLnJlc3VsdHNBZGFwdGVyPWouRGVjb3JhdGUobC5yZXN1bHRzQWRhcHRlcixBKSkpLG51bGw9PWwuZHJvcGRvd25BZGFwdGVyKXtpZihsLm11bHRpcGxlKWwuZHJvcGRvd25BZGFwdGVyPXU7ZWxzZXt2YXIgRT1qLkRlY29yYXRlKHUsdik7bC5kcm9wZG93bkFkYXB0ZXI9RX1pZigwIT09bC5taW5pbXVtUmVzdWx0c0ZvclNlYXJjaCYmKGwuZHJvcGRvd25BZGFwdGVyPWouRGVjb3JhdGUobC5kcm9wZG93bkFkYXB0ZXIseikpLGwuY2xvc2VPblNlbGVjdCYmKGwuZHJvcGRvd25BZGFwdGVyPWouRGVjb3JhdGUobC5kcm9wZG93bkFkYXB0ZXIsQikpLG51bGwhPWwuZHJvcGRvd25Dc3NDbGFzc3x8bnVsbCE9bC5kcm9wZG93bkNzc3x8bnVsbCE9bC5hZGFwdERyb3Bkb3duQ3NzQ2xhc3Mpe3ZhciBGPWIobC5hbWRCYXNlK1wiY29tcGF0L2Ryb3Bkb3duQ3NzXCIpO2wuZHJvcGRvd25BZGFwdGVyPWouRGVjb3JhdGUobC5kcm9wZG93bkFkYXB0ZXIsRil9bC5kcm9wZG93bkFkYXB0ZXI9ai5EZWNvcmF0ZShsLmRyb3Bkb3duQWRhcHRlcix5KX1pZihudWxsPT1sLnNlbGVjdGlvbkFkYXB0ZXIpe2lmKGwubXVsdGlwbGU/bC5zZWxlY3Rpb25BZGFwdGVyPWU6bC5zZWxlY3Rpb25BZGFwdGVyPWQsbnVsbCE9bC5wbGFjZWhvbGRlciYmKGwuc2VsZWN0aW9uQWRhcHRlcj1qLkRlY29yYXRlKGwuc2VsZWN0aW9uQWRhcHRlcixmKSksbC5hbGxvd0NsZWFyJiYobC5zZWxlY3Rpb25BZGFwdGVyPWouRGVjb3JhdGUobC5zZWxlY3Rpb25BZGFwdGVyLGcpKSxsLm11bHRpcGxlJiYobC5zZWxlY3Rpb25BZGFwdGVyPWouRGVjb3JhdGUobC5zZWxlY3Rpb25BZGFwdGVyLGgpKSxudWxsIT1sLmNvbnRhaW5lckNzc0NsYXNzfHxudWxsIT1sLmNvbnRhaW5lckNzc3x8bnVsbCE9bC5hZGFwdENvbnRhaW5lckNzc0NsYXNzKXt2YXIgRz1iKGwuYW1kQmFzZStcImNvbXBhdC9jb250YWluZXJDc3NcIik7bC5zZWxlY3Rpb25BZGFwdGVyPWouRGVjb3JhdGUobC5zZWxlY3Rpb25BZGFwdGVyLEcpfWwuc2VsZWN0aW9uQWRhcHRlcj1qLkRlY29yYXRlKGwuc2VsZWN0aW9uQWRhcHRlcixpKX1pZihcInN0cmluZ1wiPT10eXBlb2YgbC5sYW5ndWFnZSlpZihsLmxhbmd1YWdlLmluZGV4T2YoXCItXCIpPjApe3ZhciBIPWwubGFuZ3VhZ2Uuc3BsaXQoXCItXCIpLEk9SFswXTtsLmxhbmd1YWdlPVtsLmxhbmd1YWdlLEldfWVsc2UgbC5sYW5ndWFnZT1bbC5sYW5ndWFnZV07aWYoYS5pc0FycmF5KGwubGFuZ3VhZ2UpKXt2YXIgSj1uZXcgaztsLmxhbmd1YWdlLnB1c2goXCJlblwiKTtmb3IodmFyIEs9bC5sYW5ndWFnZSxMPTA7TDxLLmxlbmd0aDtMKyspe3ZhciBNPUtbTF0sTj17fTt0cnl7Tj1rLmxvYWRQYXRoKE0pfWNhdGNoKE8pe3RyeXtNPXRoaXMuZGVmYXVsdHMuYW1kTGFuZ3VhZ2VCYXNlK00sTj1rLmxvYWRQYXRoKE0pfWNhdGNoKFApe2wuZGVidWcmJndpbmRvdy5jb25zb2xlJiZjb25zb2xlLndhcm4mJmNvbnNvbGUud2FybignU2VsZWN0MjogVGhlIGxhbmd1YWdlIGZpbGUgZm9yIFwiJytNKydcIiBjb3VsZCBub3QgYmUgYXV0b21hdGljYWxseSBsb2FkZWQuIEEgZmFsbGJhY2sgd2lsbCBiZSB1c2VkIGluc3RlYWQuJyk7Y29udGludWV9fUouZXh0ZW5kKE4pfWwudHJhbnNsYXRpb25zPUp9ZWxzZXt2YXIgUT1rLmxvYWRQYXRoKHRoaXMuZGVmYXVsdHMuYW1kTGFuZ3VhZ2VCYXNlK1wiZW5cIiksUj1uZXcgayhsLmxhbmd1YWdlKTtSLmV4dGVuZChRKSxsLnRyYW5zbGF0aW9ucz1SfXJldHVybiBsfSxELnByb3RvdHlwZS5yZXNldD1mdW5jdGlvbigpe2Z1bmN0aW9uIGIoYSl7ZnVuY3Rpb24gYihhKXtyZXR1cm4gbFthXXx8YX1yZXR1cm4gYS5yZXBsYWNlKC9bXlxcdTAwMDAtXFx1MDA3RV0vZyxiKX1mdW5jdGlvbiBjKGQsZSl7aWYoXCJcIj09PWEudHJpbShkLnRlcm0pKXJldHVybiBlO2lmKGUuY2hpbGRyZW4mJmUuY2hpbGRyZW4ubGVuZ3RoPjApe2Zvcih2YXIgZj1hLmV4dGVuZCghMCx7fSxlKSxnPWUuY2hpbGRyZW4ubGVuZ3RoLTE7Zz49MDtnLS0pe3ZhciBoPWUuY2hpbGRyZW5bZ10saT1jKGQsaCk7bnVsbD09aSYmZi5jaGlsZHJlbi5zcGxpY2UoZywxKX1yZXR1cm4gZi5jaGlsZHJlbi5sZW5ndGg+MD9mOmMoZCxmKX12YXIgaj1iKGUudGV4dCkudG9VcHBlckNhc2UoKSxrPWIoZC50ZXJtKS50b1VwcGVyQ2FzZSgpO3JldHVybiBqLmluZGV4T2Yoayk+LTE/ZTpudWxsfXRoaXMuZGVmYXVsdHM9e2FtZEJhc2U6XCIuL1wiLGFtZExhbmd1YWdlQmFzZTpcIi4vaTE4bi9cIixjbG9zZU9uU2VsZWN0OiEwLGRlYnVnOiExLGRyb3Bkb3duQXV0b1dpZHRoOiExLGVzY2FwZU1hcmt1cDpqLmVzY2FwZU1hcmt1cCxsYW5ndWFnZTpDLG1hdGNoZXI6YyxtaW5pbXVtSW5wdXRMZW5ndGg6MCxtYXhpbXVtSW5wdXRMZW5ndGg6MCxtYXhpbXVtU2VsZWN0aW9uTGVuZ3RoOjAsbWluaW11bVJlc3VsdHNGb3JTZWFyY2g6MCxzZWxlY3RPbkNsb3NlOiExLHNvcnRlcjpmdW5jdGlvbihhKXtyZXR1cm4gYX0sdGVtcGxhdGVSZXN1bHQ6ZnVuY3Rpb24oYSl7cmV0dXJuIGEudGV4dH0sdGVtcGxhdGVTZWxlY3Rpb246ZnVuY3Rpb24oYSl7cmV0dXJuIGEudGV4dH0sdGhlbWU6XCJkZWZhdWx0XCIsd2lkdGg6XCJyZXNvbHZlXCJ9fSxELnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24oYixjKXt2YXIgZD1hLmNhbWVsQ2FzZShiKSxlPXt9O2VbZF09Yzt2YXIgZj1qLl9jb252ZXJ0RGF0YShlKTthLmV4dGVuZCh0aGlzLmRlZmF1bHRzLGYpfTt2YXIgRT1uZXcgRDtyZXR1cm4gRX0pLGIuZGVmaW5lKFwic2VsZWN0Mi9vcHRpb25zXCIsW1wicmVxdWlyZVwiLFwianF1ZXJ5XCIsXCIuL2RlZmF1bHRzXCIsXCIuL3V0aWxzXCJdLGZ1bmN0aW9uKGEsYixjLGQpe2Z1bmN0aW9uIGUoYixlKXtpZih0aGlzLm9wdGlvbnM9YixudWxsIT1lJiZ0aGlzLmZyb21FbGVtZW50KGUpLHRoaXMub3B0aW9ucz1jLmFwcGx5KHRoaXMub3B0aW9ucyksZSYmZS5pcyhcImlucHV0XCIpKXt2YXIgZj1hKHRoaXMuZ2V0KFwiYW1kQmFzZVwiKStcImNvbXBhdC9pbnB1dERhdGFcIik7dGhpcy5vcHRpb25zLmRhdGFBZGFwdGVyPWQuRGVjb3JhdGUodGhpcy5vcHRpb25zLmRhdGFBZGFwdGVyLGYpfX1yZXR1cm4gZS5wcm90b3R5cGUuZnJvbUVsZW1lbnQ9ZnVuY3Rpb24oYSl7dmFyIGM9W1wic2VsZWN0MlwiXTtudWxsPT10aGlzLm9wdGlvbnMubXVsdGlwbGUmJih0aGlzLm9wdGlvbnMubXVsdGlwbGU9YS5wcm9wKFwibXVsdGlwbGVcIikpLG51bGw9PXRoaXMub3B0aW9ucy5kaXNhYmxlZCYmKHRoaXMub3B0aW9ucy5kaXNhYmxlZD1hLnByb3AoXCJkaXNhYmxlZFwiKSksbnVsbD09dGhpcy5vcHRpb25zLmxhbmd1YWdlJiYoYS5wcm9wKFwibGFuZ1wiKT90aGlzLm9wdGlvbnMubGFuZ3VhZ2U9YS5wcm9wKFwibGFuZ1wiKS50b0xvd2VyQ2FzZSgpOmEuY2xvc2VzdChcIltsYW5nXVwiKS5wcm9wKFwibGFuZ1wiKSYmKHRoaXMub3B0aW9ucy5sYW5ndWFnZT1hLmNsb3Nlc3QoXCJbbGFuZ11cIikucHJvcChcImxhbmdcIikpKSxudWxsPT10aGlzLm9wdGlvbnMuZGlyJiYoYS5wcm9wKFwiZGlyXCIpP3RoaXMub3B0aW9ucy5kaXI9YS5wcm9wKFwiZGlyXCIpOmEuY2xvc2VzdChcIltkaXJdXCIpLnByb3AoXCJkaXJcIik/dGhpcy5vcHRpb25zLmRpcj1hLmNsb3Nlc3QoXCJbZGlyXVwiKS5wcm9wKFwiZGlyXCIpOnRoaXMub3B0aW9ucy5kaXI9XCJsdHJcIiksYS5wcm9wKFwiZGlzYWJsZWRcIix0aGlzLm9wdGlvbnMuZGlzYWJsZWQpLGEucHJvcChcIm11bHRpcGxlXCIsdGhpcy5vcHRpb25zLm11bHRpcGxlKSxhLmRhdGEoXCJzZWxlY3QyVGFnc1wiKSYmKHRoaXMub3B0aW9ucy5kZWJ1ZyYmd2luZG93LmNvbnNvbGUmJmNvbnNvbGUud2FybiYmY29uc29sZS53YXJuKCdTZWxlY3QyOiBUaGUgYGRhdGEtc2VsZWN0Mi10YWdzYCBhdHRyaWJ1dGUgaGFzIGJlZW4gY2hhbmdlZCB0byB1c2UgdGhlIGBkYXRhLWRhdGFgIGFuZCBgZGF0YS10YWdzPVwidHJ1ZVwiYCBhdHRyaWJ1dGVzIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gZnV0dXJlIHZlcnNpb25zIG9mIFNlbGVjdDIuJyksYS5kYXRhKFwiZGF0YVwiLGEuZGF0YShcInNlbGVjdDJUYWdzXCIpKSxhLmRhdGEoXCJ0YWdzXCIsITApKSxhLmRhdGEoXCJhamF4VXJsXCIpJiYodGhpcy5vcHRpb25zLmRlYnVnJiZ3aW5kb3cuY29uc29sZSYmY29uc29sZS53YXJuJiZjb25zb2xlLndhcm4oXCJTZWxlY3QyOiBUaGUgYGRhdGEtYWpheC11cmxgIGF0dHJpYnV0ZSBoYXMgYmVlbiBjaGFuZ2VkIHRvIGBkYXRhLWFqYXgtLXVybGAgYW5kIHN1cHBvcnQgZm9yIHRoZSBvbGQgYXR0cmlidXRlIHdpbGwgYmUgcmVtb3ZlZCBpbiBmdXR1cmUgdmVyc2lvbnMgb2YgU2VsZWN0Mi5cIiksYS5hdHRyKFwiYWpheC0tdXJsXCIsYS5kYXRhKFwiYWpheFVybFwiKSksYS5kYXRhKFwiYWpheC0tdXJsXCIsYS5kYXRhKFwiYWpheFVybFwiKSkpO3ZhciBlPXt9O2U9Yi5mbi5qcXVlcnkmJlwiMS5cIj09Yi5mbi5qcXVlcnkuc3Vic3RyKDAsMikmJmFbMF0uZGF0YXNldD9iLmV4dGVuZCghMCx7fSxhWzBdLmRhdGFzZXQsYS5kYXRhKCkpOmEuZGF0YSgpO3ZhciBmPWIuZXh0ZW5kKCEwLHt9LGUpO2Y9ZC5fY29udmVydERhdGEoZik7Zm9yKHZhciBnIGluIGYpYi5pbkFycmF5KGcsYyk+LTF8fChiLmlzUGxhaW5PYmplY3QodGhpcy5vcHRpb25zW2ddKT9iLmV4dGVuZCh0aGlzLm9wdGlvbnNbZ10sZltnXSk6dGhpcy5vcHRpb25zW2ddPWZbZ10pO3JldHVybiB0aGlzfSxlLnByb3RvdHlwZS5nZXQ9ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMub3B0aW9uc1thXX0sZS5wcm90b3R5cGUuc2V0PWZ1bmN0aW9uKGEsYil7dGhpcy5vcHRpb25zW2FdPWJ9LGV9KSxiLmRlZmluZShcInNlbGVjdDIvY29yZVwiLFtcImpxdWVyeVwiLFwiLi9vcHRpb25zXCIsXCIuL3V0aWxzXCIsXCIuL2tleXNcIl0sZnVuY3Rpb24oYSxiLGMsZCl7dmFyIGU9ZnVuY3Rpb24oYSxjKXtudWxsIT1hLmRhdGEoXCJzZWxlY3QyXCIpJiZhLmRhdGEoXCJzZWxlY3QyXCIpLmRlc3Ryb3koKSx0aGlzLiRlbGVtZW50PWEsdGhpcy5pZD10aGlzLl9nZW5lcmF0ZUlkKGEpLGM9Y3x8e30sdGhpcy5vcHRpb25zPW5ldyBiKGMsYSksZS5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzKTt2YXIgZD1hLmF0dHIoXCJ0YWJpbmRleFwiKXx8MDthLmRhdGEoXCJvbGQtdGFiaW5kZXhcIixkKSxhLmF0dHIoXCJ0YWJpbmRleFwiLFwiLTFcIik7dmFyIGY9dGhpcy5vcHRpb25zLmdldChcImRhdGFBZGFwdGVyXCIpO3RoaXMuZGF0YUFkYXB0ZXI9bmV3IGYoYSx0aGlzLm9wdGlvbnMpO3ZhciBnPXRoaXMucmVuZGVyKCk7dGhpcy5fcGxhY2VDb250YWluZXIoZyk7dmFyIGg9dGhpcy5vcHRpb25zLmdldChcInNlbGVjdGlvbkFkYXB0ZXJcIik7dGhpcy5zZWxlY3Rpb249bmV3IGgoYSx0aGlzLm9wdGlvbnMpLHRoaXMuJHNlbGVjdGlvbj10aGlzLnNlbGVjdGlvbi5yZW5kZXIoKSx0aGlzLnNlbGVjdGlvbi5wb3NpdGlvbih0aGlzLiRzZWxlY3Rpb24sZyk7dmFyIGk9dGhpcy5vcHRpb25zLmdldChcImRyb3Bkb3duQWRhcHRlclwiKTt0aGlzLmRyb3Bkb3duPW5ldyBpKGEsdGhpcy5vcHRpb25zKSx0aGlzLiRkcm9wZG93bj10aGlzLmRyb3Bkb3duLnJlbmRlcigpLHRoaXMuZHJvcGRvd24ucG9zaXRpb24odGhpcy4kZHJvcGRvd24sZyk7dmFyIGo9dGhpcy5vcHRpb25zLmdldChcInJlc3VsdHNBZGFwdGVyXCIpO3RoaXMucmVzdWx0cz1uZXcgaihhLHRoaXMub3B0aW9ucyx0aGlzLmRhdGFBZGFwdGVyKSx0aGlzLiRyZXN1bHRzPXRoaXMucmVzdWx0cy5yZW5kZXIoKSx0aGlzLnJlc3VsdHMucG9zaXRpb24odGhpcy4kcmVzdWx0cyx0aGlzLiRkcm9wZG93bik7dmFyIGs9dGhpczt0aGlzLl9iaW5kQWRhcHRlcnMoKSx0aGlzLl9yZWdpc3RlckRvbUV2ZW50cygpLHRoaXMuX3JlZ2lzdGVyRGF0YUV2ZW50cygpLHRoaXMuX3JlZ2lzdGVyU2VsZWN0aW9uRXZlbnRzKCksdGhpcy5fcmVnaXN0ZXJEcm9wZG93bkV2ZW50cygpLHRoaXMuX3JlZ2lzdGVyUmVzdWx0c0V2ZW50cygpLHRoaXMuX3JlZ2lzdGVyRXZlbnRzKCksdGhpcy5kYXRhQWRhcHRlci5jdXJyZW50KGZ1bmN0aW9uKGEpe2sudHJpZ2dlcihcInNlbGVjdGlvbjp1cGRhdGVcIix7ZGF0YTphfSl9KSxhLmFkZENsYXNzKFwic2VsZWN0Mi1oaWRkZW4tYWNjZXNzaWJsZVwiKSxhLmF0dHIoXCJhcmlhLWhpZGRlblwiLFwidHJ1ZVwiKSx0aGlzLl9zeW5jQXR0cmlidXRlcygpLGEuZGF0YShcInNlbGVjdDJcIix0aGlzKX07cmV0dXJuIGMuRXh0ZW5kKGUsYy5PYnNlcnZhYmxlKSxlLnByb3RvdHlwZS5fZ2VuZXJhdGVJZD1mdW5jdGlvbihhKXt2YXIgYj1cIlwiO3JldHVybiBiPW51bGwhPWEuYXR0cihcImlkXCIpP2EuYXR0cihcImlkXCIpOm51bGwhPWEuYXR0cihcIm5hbWVcIik/YS5hdHRyKFwibmFtZVwiKStcIi1cIitjLmdlbmVyYXRlQ2hhcnMoMik6Yy5nZW5lcmF0ZUNoYXJzKDQpLGI9Yi5yZXBsYWNlKC8oOnxcXC58XFxbfFxcXXwsKS9nLFwiXCIpLGI9XCJzZWxlY3QyLVwiK2J9LGUucHJvdG90eXBlLl9wbGFjZUNvbnRhaW5lcj1mdW5jdGlvbihhKXthLmluc2VydEFmdGVyKHRoaXMuJGVsZW1lbnQpO3ZhciBiPXRoaXMuX3Jlc29sdmVXaWR0aCh0aGlzLiRlbGVtZW50LHRoaXMub3B0aW9ucy5nZXQoXCJ3aWR0aFwiKSk7bnVsbCE9YiYmYS5jc3MoXCJ3aWR0aFwiLGIpfSxlLnByb3RvdHlwZS5fcmVzb2x2ZVdpZHRoPWZ1bmN0aW9uKGEsYil7dmFyIGM9L153aWR0aDooKFstK10/KFswLTldKlxcLik/WzAtOV0rKShweHxlbXxleHwlfGlufGNtfG1tfHB0fHBjKSkvaTtpZihcInJlc29sdmVcIj09Yil7dmFyIGQ9dGhpcy5fcmVzb2x2ZVdpZHRoKGEsXCJzdHlsZVwiKTtyZXR1cm4gbnVsbCE9ZD9kOnRoaXMuX3Jlc29sdmVXaWR0aChhLFwiZWxlbWVudFwiKX1pZihcImVsZW1lbnRcIj09Yil7dmFyIGU9YS5vdXRlcldpZHRoKCExKTtyZXR1cm4gMD49ZT9cImF1dG9cIjplK1wicHhcIn1pZihcInN0eWxlXCI9PWIpe3ZhciBmPWEuYXR0cihcInN0eWxlXCIpO2lmKFwic3RyaW5nXCIhPXR5cGVvZiBmKXJldHVybiBudWxsO2Zvcih2YXIgZz1mLnNwbGl0KFwiO1wiKSxoPTAsaT1nLmxlbmd0aDtpPmg7aCs9MSl7dmFyIGo9Z1toXS5yZXBsYWNlKC9cXHMvZyxcIlwiKSxrPWoubWF0Y2goYyk7aWYobnVsbCE9PWsmJmsubGVuZ3RoPj0xKXJldHVybiBrWzFdfXJldHVybiBudWxsfXJldHVybiBifSxlLnByb3RvdHlwZS5fYmluZEFkYXB0ZXJzPWZ1bmN0aW9uKCl7dGhpcy5kYXRhQWRhcHRlci5iaW5kKHRoaXMsdGhpcy4kY29udGFpbmVyKSx0aGlzLnNlbGVjdGlvbi5iaW5kKHRoaXMsdGhpcy4kY29udGFpbmVyKSx0aGlzLmRyb3Bkb3duLmJpbmQodGhpcyx0aGlzLiRjb250YWluZXIpLHRoaXMucmVzdWx0cy5iaW5kKHRoaXMsdGhpcy4kY29udGFpbmVyKX0sZS5wcm90b3R5cGUuX3JlZ2lzdGVyRG9tRXZlbnRzPWZ1bmN0aW9uKCl7dmFyIGI9dGhpczt0aGlzLiRlbGVtZW50Lm9uKFwiY2hhbmdlLnNlbGVjdDJcIixmdW5jdGlvbigpe2IuZGF0YUFkYXB0ZXIuY3VycmVudChmdW5jdGlvbihhKXtiLnRyaWdnZXIoXCJzZWxlY3Rpb246dXBkYXRlXCIse2RhdGE6YX0pfSl9KSx0aGlzLiRlbGVtZW50Lm9uKFwiZm9jdXMuc2VsZWN0MlwiLGZ1bmN0aW9uKGEpe2IudHJpZ2dlcihcImZvY3VzXCIsYSl9KSx0aGlzLl9zeW5jQT1jLmJpbmQodGhpcy5fc3luY0F0dHJpYnV0ZXMsdGhpcyksdGhpcy5fc3luY1M9Yy5iaW5kKHRoaXMuX3N5bmNTdWJ0cmVlLHRoaXMpLHRoaXMuJGVsZW1lbnRbMF0uYXR0YWNoRXZlbnQmJnRoaXMuJGVsZW1lbnRbMF0uYXR0YWNoRXZlbnQoXCJvbnByb3BlcnR5Y2hhbmdlXCIsdGhpcy5fc3luY0EpO3ZhciBkPXdpbmRvdy5NdXRhdGlvbk9ic2VydmVyfHx3aW5kb3cuV2ViS2l0TXV0YXRpb25PYnNlcnZlcnx8d2luZG93Lk1vek11dGF0aW9uT2JzZXJ2ZXI7bnVsbCE9ZD8odGhpcy5fb2JzZXJ2ZXI9bmV3IGQoZnVuY3Rpb24oYyl7YS5lYWNoKGMsYi5fc3luY0EpLGEuZWFjaChjLGIuX3N5bmNTKX0pLHRoaXMuX29ic2VydmVyLm9ic2VydmUodGhpcy4kZWxlbWVudFswXSx7YXR0cmlidXRlczohMCxjaGlsZExpc3Q6ITAsc3VidHJlZTohMX0pKTp0aGlzLiRlbGVtZW50WzBdLmFkZEV2ZW50TGlzdGVuZXImJih0aGlzLiRlbGVtZW50WzBdLmFkZEV2ZW50TGlzdGVuZXIoXCJET01BdHRyTW9kaWZpZWRcIixiLl9zeW5jQSwhMSksdGhpcy4kZWxlbWVudFswXS5hZGRFdmVudExpc3RlbmVyKFwiRE9NTm9kZUluc2VydGVkXCIsYi5fc3luY1MsITEpLHRoaXMuJGVsZW1lbnRbMF0uYWRkRXZlbnRMaXN0ZW5lcihcIkRPTU5vZGVSZW1vdmVkXCIsYi5fc3luY1MsITEpKX0sZS5wcm90b3R5cGUuX3JlZ2lzdGVyRGF0YUV2ZW50cz1mdW5jdGlvbigpe3ZhciBhPXRoaXM7dGhpcy5kYXRhQWRhcHRlci5vbihcIipcIixmdW5jdGlvbihiLGMpe2EudHJpZ2dlcihiLGMpfSl9LGUucHJvdG90eXBlLl9yZWdpc3RlclNlbGVjdGlvbkV2ZW50cz1mdW5jdGlvbigpe3ZhciBiPXRoaXMsYz1bXCJ0b2dnbGVcIixcImZvY3VzXCJdO3RoaXMuc2VsZWN0aW9uLm9uKFwidG9nZ2xlXCIsZnVuY3Rpb24oKXtiLnRvZ2dsZURyb3Bkb3duKCl9KSx0aGlzLnNlbGVjdGlvbi5vbihcImZvY3VzXCIsZnVuY3Rpb24oYSl7Yi5mb2N1cyhhKX0pLHRoaXMuc2VsZWN0aW9uLm9uKFwiKlwiLGZ1bmN0aW9uKGQsZSl7LTE9PT1hLmluQXJyYXkoZCxjKSYmYi50cmlnZ2VyKGQsZSl9KX0sZS5wcm90b3R5cGUuX3JlZ2lzdGVyRHJvcGRvd25FdmVudHM9ZnVuY3Rpb24oKXt2YXIgYT10aGlzO3RoaXMuZHJvcGRvd24ub24oXCIqXCIsZnVuY3Rpb24oYixjKXthLnRyaWdnZXIoYixjKX0pfSxlLnByb3RvdHlwZS5fcmVnaXN0ZXJSZXN1bHRzRXZlbnRzPWZ1bmN0aW9uKCl7dmFyIGE9dGhpczt0aGlzLnJlc3VsdHMub24oXCIqXCIsZnVuY3Rpb24oYixjKXthLnRyaWdnZXIoYixjKX0pfSxlLnByb3RvdHlwZS5fcmVnaXN0ZXJFdmVudHM9ZnVuY3Rpb24oKXt2YXIgYT10aGlzO3RoaXMub24oXCJvcGVuXCIsZnVuY3Rpb24oKXthLiRjb250YWluZXIuYWRkQ2xhc3MoXCJzZWxlY3QyLWNvbnRhaW5lci0tb3BlblwiKX0pLHRoaXMub24oXCJjbG9zZVwiLGZ1bmN0aW9uKCl7YS4kY29udGFpbmVyLnJlbW92ZUNsYXNzKFwic2VsZWN0Mi1jb250YWluZXItLW9wZW5cIil9KSx0aGlzLm9uKFwiZW5hYmxlXCIsZnVuY3Rpb24oKXthLiRjb250YWluZXIucmVtb3ZlQ2xhc3MoXCJzZWxlY3QyLWNvbnRhaW5lci0tZGlzYWJsZWRcIil9KSx0aGlzLm9uKFwiZGlzYWJsZVwiLGZ1bmN0aW9uKCl7YS4kY29udGFpbmVyLmFkZENsYXNzKFwic2VsZWN0Mi1jb250YWluZXItLWRpc2FibGVkXCIpfSksdGhpcy5vbihcImJsdXJcIixmdW5jdGlvbigpe2EuJGNvbnRhaW5lci5yZW1vdmVDbGFzcyhcInNlbGVjdDItY29udGFpbmVyLS1mb2N1c1wiKX0pLHRoaXMub24oXCJxdWVyeVwiLGZ1bmN0aW9uKGIpe2EuaXNPcGVuKCl8fGEudHJpZ2dlcihcIm9wZW5cIix7fSksdGhpcy5kYXRhQWRhcHRlci5xdWVyeShiLGZ1bmN0aW9uKGMpe2EudHJpZ2dlcihcInJlc3VsdHM6YWxsXCIse2RhdGE6YyxxdWVyeTpifSl9KX0pLHRoaXMub24oXCJxdWVyeTphcHBlbmRcIixmdW5jdGlvbihiKXt0aGlzLmRhdGFBZGFwdGVyLnF1ZXJ5KGIsZnVuY3Rpb24oYyl7YS50cmlnZ2VyKFwicmVzdWx0czphcHBlbmRcIix7ZGF0YTpjLHF1ZXJ5OmJ9KX0pfSksdGhpcy5vbihcImtleXByZXNzXCIsZnVuY3Rpb24oYil7dmFyIGM9Yi53aGljaDthLmlzT3BlbigpP2M9PT1kLkVTQ3x8Yz09PWQuVEFCfHxjPT09ZC5VUCYmYi5hbHRLZXk/KGEuY2xvc2UoKSxiLnByZXZlbnREZWZhdWx0KCkpOmM9PT1kLkVOVEVSPyhhLnRyaWdnZXIoXCJyZXN1bHRzOnNlbGVjdFwiLHt9KSxiLnByZXZlbnREZWZhdWx0KCkpOmM9PT1kLlNQQUNFJiZiLmN0cmxLZXk/KGEudHJpZ2dlcihcInJlc3VsdHM6dG9nZ2xlXCIse30pLGIucHJldmVudERlZmF1bHQoKSk6Yz09PWQuVVA/KGEudHJpZ2dlcihcInJlc3VsdHM6cHJldmlvdXNcIix7fSksYi5wcmV2ZW50RGVmYXVsdCgpKTpjPT09ZC5ET1dOJiYoYS50cmlnZ2VyKFwicmVzdWx0czpuZXh0XCIse30pLGIucHJldmVudERlZmF1bHQoKSk6KGM9PT1kLkVOVEVSfHxjPT09ZC5TUEFDRXx8Yz09PWQuRE9XTiYmYi5hbHRLZXkpJiYoYS5vcGVuKCksYi5wcmV2ZW50RGVmYXVsdCgpKX0pfSxlLnByb3RvdHlwZS5fc3luY0F0dHJpYnV0ZXM9ZnVuY3Rpb24oKXt0aGlzLm9wdGlvbnMuc2V0KFwiZGlzYWJsZWRcIix0aGlzLiRlbGVtZW50LnByb3AoXCJkaXNhYmxlZFwiKSksdGhpcy5vcHRpb25zLmdldChcImRpc2FibGVkXCIpPyh0aGlzLmlzT3BlbigpJiZ0aGlzLmNsb3NlKCksdGhpcy50cmlnZ2VyKFwiZGlzYWJsZVwiLHt9KSk6dGhpcy50cmlnZ2VyKFwiZW5hYmxlXCIse30pfSxlLnByb3RvdHlwZS5fc3luY1N1YnRyZWU9ZnVuY3Rpb24oYSxiKXt2YXIgYz0hMSxkPXRoaXM7aWYoIWF8fCFhLnRhcmdldHx8XCJPUFRJT05cIj09PWEudGFyZ2V0Lm5vZGVOYW1lfHxcIk9QVEdST1VQXCI9PT1hLnRhcmdldC5ub2RlTmFtZSl7aWYoYilpZihiLmFkZGVkTm9kZXMmJmIuYWRkZWROb2Rlcy5sZW5ndGg+MClmb3IodmFyIGU9MDtlPGIuYWRkZWROb2Rlcy5sZW5ndGg7ZSsrKXt2YXIgZj1iLmFkZGVkTm9kZXNbZV07Zi5zZWxlY3RlZCYmKGM9ITApfWVsc2UgYi5yZW1vdmVkTm9kZXMmJmIucmVtb3ZlZE5vZGVzLmxlbmd0aD4wJiYoYz0hMCk7ZWxzZSBjPSEwO2MmJnRoaXMuZGF0YUFkYXB0ZXIuY3VycmVudChmdW5jdGlvbihhKXtkLnRyaWdnZXIoXCJzZWxlY3Rpb246dXBkYXRlXCIse2RhdGE6YX0pfSl9fSxlLnByb3RvdHlwZS50cmlnZ2VyPWZ1bmN0aW9uKGEsYil7dmFyIGM9ZS5fX3N1cGVyX18udHJpZ2dlcixkPXtvcGVuOlwib3BlbmluZ1wiLGNsb3NlOlwiY2xvc2luZ1wiLHNlbGVjdDpcInNlbGVjdGluZ1wiLHVuc2VsZWN0OlwidW5zZWxlY3RpbmdcIn07aWYodm9pZCAwPT09YiYmKGI9e30pLGEgaW4gZCl7dmFyIGY9ZFthXSxnPXtwcmV2ZW50ZWQ6ITEsbmFtZTphLGFyZ3M6Yn07aWYoYy5jYWxsKHRoaXMsZixnKSxnLnByZXZlbnRlZClyZXR1cm4gdm9pZChiLnByZXZlbnRlZD0hMCl9Yy5jYWxsKHRoaXMsYSxiKX0sZS5wcm90b3R5cGUudG9nZ2xlRHJvcGRvd249ZnVuY3Rpb24oKXt0aGlzLm9wdGlvbnMuZ2V0KFwiZGlzYWJsZWRcIil8fCh0aGlzLmlzT3BlbigpP3RoaXMuY2xvc2UoKTp0aGlzLm9wZW4oKSl9LGUucHJvdG90eXBlLm9wZW49ZnVuY3Rpb24oKXt0aGlzLmlzT3BlbigpfHx0aGlzLnRyaWdnZXIoXCJxdWVyeVwiLHt9KX0sZS5wcm90b3R5cGUuY2xvc2U9ZnVuY3Rpb24oKXt0aGlzLmlzT3BlbigpJiZ0aGlzLnRyaWdnZXIoXCJjbG9zZVwiLHt9KX0sZS5wcm90b3R5cGUuaXNPcGVuPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuJGNvbnRhaW5lci5oYXNDbGFzcyhcInNlbGVjdDItY29udGFpbmVyLS1vcGVuXCIpfSxlLnByb3RvdHlwZS5oYXNGb2N1cz1mdW5jdGlvbigpe3JldHVybiB0aGlzLiRjb250YWluZXIuaGFzQ2xhc3MoXCJzZWxlY3QyLWNvbnRhaW5lci0tZm9jdXNcIil9LGUucHJvdG90eXBlLmZvY3VzPWZ1bmN0aW9uKGEpe3RoaXMuaGFzRm9jdXMoKXx8KHRoaXMuJGNvbnRhaW5lci5hZGRDbGFzcyhcInNlbGVjdDItY29udGFpbmVyLS1mb2N1c1wiKSx0aGlzLnRyaWdnZXIoXCJmb2N1c1wiLHt9KSl9LGUucHJvdG90eXBlLmVuYWJsZT1mdW5jdGlvbihhKXt0aGlzLm9wdGlvbnMuZ2V0KFwiZGVidWdcIikmJndpbmRvdy5jb25zb2xlJiZjb25zb2xlLndhcm4mJmNvbnNvbGUud2FybignU2VsZWN0MjogVGhlIGBzZWxlY3QyKFwiZW5hYmxlXCIpYCBtZXRob2QgaGFzIGJlZW4gZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIGxhdGVyIFNlbGVjdDIgdmVyc2lvbnMuIFVzZSAkZWxlbWVudC5wcm9wKFwiZGlzYWJsZWRcIikgaW5zdGVhZC4nKSwobnVsbD09YXx8MD09PWEubGVuZ3RoKSYmKGE9WyEwXSk7dmFyIGI9IWFbMF07dGhpcy4kZWxlbWVudC5wcm9wKFwiZGlzYWJsZWRcIixiKX0sZS5wcm90b3R5cGUuZGF0YT1mdW5jdGlvbigpe3RoaXMub3B0aW9ucy5nZXQoXCJkZWJ1Z1wiKSYmYXJndW1lbnRzLmxlbmd0aD4wJiZ3aW5kb3cuY29uc29sZSYmY29uc29sZS53YXJuJiZjb25zb2xlLndhcm4oJ1NlbGVjdDI6IERhdGEgY2FuIG5vIGxvbmdlciBiZSBzZXQgdXNpbmcgYHNlbGVjdDIoXCJkYXRhXCIpYC4gWW91IHNob3VsZCBjb25zaWRlciBzZXR0aW5nIHRoZSB2YWx1ZSBpbnN0ZWFkIHVzaW5nIGAkZWxlbWVudC52YWwoKWAuJyk7dmFyIGE9W107cmV0dXJuIHRoaXMuZGF0YUFkYXB0ZXIuY3VycmVudChmdW5jdGlvbihiKXthPWJ9KSxhfSxlLnByb3RvdHlwZS52YWw9ZnVuY3Rpb24oYil7aWYodGhpcy5vcHRpb25zLmdldChcImRlYnVnXCIpJiZ3aW5kb3cuY29uc29sZSYmY29uc29sZS53YXJuJiZjb25zb2xlLndhcm4oJ1NlbGVjdDI6IFRoZSBgc2VsZWN0MihcInZhbFwiKWAgbWV0aG9kIGhhcyBiZWVuIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiBsYXRlciBTZWxlY3QyIHZlcnNpb25zLiBVc2UgJGVsZW1lbnQudmFsKCkgaW5zdGVhZC4nKSxudWxsPT1ifHwwPT09Yi5sZW5ndGgpcmV0dXJuIHRoaXMuJGVsZW1lbnQudmFsKCk7dmFyIGM9YlswXTthLmlzQXJyYXkoYykmJihjPWEubWFwKGMsZnVuY3Rpb24oYSl7cmV0dXJuIGEudG9TdHJpbmcoKX0pKSx0aGlzLiRlbGVtZW50LnZhbChjKS50cmlnZ2VyKFwiY2hhbmdlXCIpfSxlLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy4kY29udGFpbmVyLnJlbW92ZSgpLHRoaXMuJGVsZW1lbnRbMF0uZGV0YWNoRXZlbnQmJnRoaXMuJGVsZW1lbnRbMF0uZGV0YWNoRXZlbnQoXCJvbnByb3BlcnR5Y2hhbmdlXCIsdGhpcy5fc3luY0EpLG51bGwhPXRoaXMuX29ic2VydmVyPyh0aGlzLl9vYnNlcnZlci5kaXNjb25uZWN0KCksdGhpcy5fb2JzZXJ2ZXI9bnVsbCk6dGhpcy4kZWxlbWVudFswXS5yZW1vdmVFdmVudExpc3RlbmVyJiYodGhpcy4kZWxlbWVudFswXS5yZW1vdmVFdmVudExpc3RlbmVyKFwiRE9NQXR0ck1vZGlmaWVkXCIsdGhpcy5fc3luY0EsITEpLHRoaXMuJGVsZW1lbnRbMF0ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIkRPTU5vZGVJbnNlcnRlZFwiLHRoaXMuX3N5bmNTLCExKSx0aGlzLiRlbGVtZW50WzBdLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJET01Ob2RlUmVtb3ZlZFwiLHRoaXMuX3N5bmNTLCExKSksdGhpcy5fc3luY0E9bnVsbCx0aGlzLl9zeW5jUz1udWxsLHRoaXMuJGVsZW1lbnQub2ZmKFwiLnNlbGVjdDJcIiksdGhpcy4kZWxlbWVudC5hdHRyKFwidGFiaW5kZXhcIix0aGlzLiRlbGVtZW50LmRhdGEoXCJvbGQtdGFiaW5kZXhcIikpLHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoXCJzZWxlY3QyLWhpZGRlbi1hY2Nlc3NpYmxlXCIpLHRoaXMuJGVsZW1lbnQuYXR0cihcImFyaWEtaGlkZGVuXCIsXCJmYWxzZVwiKSx0aGlzLiRlbGVtZW50LnJlbW92ZURhdGEoXCJzZWxlY3QyXCIpLHRoaXMuZGF0YUFkYXB0ZXIuZGVzdHJveSgpLHRoaXMuc2VsZWN0aW9uLmRlc3Ryb3koKSx0aGlzLmRyb3Bkb3duLmRlc3Ryb3koKSx0aGlzLnJlc3VsdHMuZGVzdHJveSgpLHRoaXMuZGF0YUFkYXB0ZXI9bnVsbCx0aGlzLnNlbGVjdGlvbj1udWxsLHRoaXMuZHJvcGRvd249bnVsbCx0aGlzLnJlc3VsdHM9bnVsbDtcbn0sZS5wcm90b3R5cGUucmVuZGVyPWZ1bmN0aW9uKCl7dmFyIGI9YSgnPHNwYW4gY2xhc3M9XCJzZWxlY3QyIHNlbGVjdDItY29udGFpbmVyXCI+PHNwYW4gY2xhc3M9XCJzZWxlY3Rpb25cIj48L3NwYW4+PHNwYW4gY2xhc3M9XCJkcm9wZG93bi13cmFwcGVyXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9zcGFuPjwvc3Bhbj4nKTtyZXR1cm4gYi5hdHRyKFwiZGlyXCIsdGhpcy5vcHRpb25zLmdldChcImRpclwiKSksdGhpcy4kY29udGFpbmVyPWIsdGhpcy4kY29udGFpbmVyLmFkZENsYXNzKFwic2VsZWN0Mi1jb250YWluZXItLVwiK3RoaXMub3B0aW9ucy5nZXQoXCJ0aGVtZVwiKSksYi5kYXRhKFwiZWxlbWVudFwiLHRoaXMuJGVsZW1lbnQpLGJ9LGV9KSxiLmRlZmluZShcInNlbGVjdDIvY29tcGF0L3V0aWxzXCIsW1wianF1ZXJ5XCJdLGZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoYixjLGQpe3ZhciBlLGYsZz1bXTtlPWEudHJpbShiLmF0dHIoXCJjbGFzc1wiKSksZSYmKGU9XCJcIitlLGEoZS5zcGxpdCgvXFxzKy8pKS5lYWNoKGZ1bmN0aW9uKCl7MD09PXRoaXMuaW5kZXhPZihcInNlbGVjdDItXCIpJiZnLnB1c2godGhpcyl9KSksZT1hLnRyaW0oYy5hdHRyKFwiY2xhc3NcIikpLGUmJihlPVwiXCIrZSxhKGUuc3BsaXQoL1xccysvKSkuZWFjaChmdW5jdGlvbigpezAhPT10aGlzLmluZGV4T2YoXCJzZWxlY3QyLVwiKSYmKGY9ZCh0aGlzKSxudWxsIT1mJiZnLnB1c2goZikpfSkpLGIuYXR0cihcImNsYXNzXCIsZy5qb2luKFwiIFwiKSl9cmV0dXJue3N5bmNDc3NDbGFzc2VzOmJ9fSksYi5kZWZpbmUoXCJzZWxlY3QyL2NvbXBhdC9jb250YWluZXJDc3NcIixbXCJqcXVlcnlcIixcIi4vdXRpbHNcIl0sZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGEpe3JldHVybiBudWxsfWZ1bmN0aW9uIGQoKXt9cmV0dXJuIGQucHJvdG90eXBlLnJlbmRlcj1mdW5jdGlvbihkKXt2YXIgZT1kLmNhbGwodGhpcyksZj10aGlzLm9wdGlvbnMuZ2V0KFwiY29udGFpbmVyQ3NzQ2xhc3NcIil8fFwiXCI7YS5pc0Z1bmN0aW9uKGYpJiYoZj1mKHRoaXMuJGVsZW1lbnQpKTt2YXIgZz10aGlzLm9wdGlvbnMuZ2V0KFwiYWRhcHRDb250YWluZXJDc3NDbGFzc1wiKTtpZihnPWd8fGMsLTEhPT1mLmluZGV4T2YoXCI6YWxsOlwiKSl7Zj1mLnJlcGxhY2UoXCI6YWxsOlwiLFwiXCIpO3ZhciBoPWc7Zz1mdW5jdGlvbihhKXt2YXIgYj1oKGEpO3JldHVybiBudWxsIT1iP2IrXCIgXCIrYTphfX12YXIgaT10aGlzLm9wdGlvbnMuZ2V0KFwiY29udGFpbmVyQ3NzXCIpfHx7fTtyZXR1cm4gYS5pc0Z1bmN0aW9uKGkpJiYoaT1pKHRoaXMuJGVsZW1lbnQpKSxiLnN5bmNDc3NDbGFzc2VzKGUsdGhpcy4kZWxlbWVudCxnKSxlLmNzcyhpKSxlLmFkZENsYXNzKGYpLGV9LGR9KSxiLmRlZmluZShcInNlbGVjdDIvY29tcGF0L2Ryb3Bkb3duQ3NzXCIsW1wianF1ZXJ5XCIsXCIuL3V0aWxzXCJdLGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhhKXtyZXR1cm4gbnVsbH1mdW5jdGlvbiBkKCl7fXJldHVybiBkLnByb3RvdHlwZS5yZW5kZXI9ZnVuY3Rpb24oZCl7dmFyIGU9ZC5jYWxsKHRoaXMpLGY9dGhpcy5vcHRpb25zLmdldChcImRyb3Bkb3duQ3NzQ2xhc3NcIil8fFwiXCI7YS5pc0Z1bmN0aW9uKGYpJiYoZj1mKHRoaXMuJGVsZW1lbnQpKTt2YXIgZz10aGlzLm9wdGlvbnMuZ2V0KFwiYWRhcHREcm9wZG93bkNzc0NsYXNzXCIpO2lmKGc9Z3x8YywtMSE9PWYuaW5kZXhPZihcIjphbGw6XCIpKXtmPWYucmVwbGFjZShcIjphbGw6XCIsXCJcIik7dmFyIGg9ZztnPWZ1bmN0aW9uKGEpe3ZhciBiPWgoYSk7cmV0dXJuIG51bGwhPWI/YitcIiBcIithOmF9fXZhciBpPXRoaXMub3B0aW9ucy5nZXQoXCJkcm9wZG93bkNzc1wiKXx8e307cmV0dXJuIGEuaXNGdW5jdGlvbihpKSYmKGk9aSh0aGlzLiRlbGVtZW50KSksYi5zeW5jQ3NzQ2xhc3NlcyhlLHRoaXMuJGVsZW1lbnQsZyksZS5jc3MoaSksZS5hZGRDbGFzcyhmKSxlfSxkfSksYi5kZWZpbmUoXCJzZWxlY3QyL2NvbXBhdC9pbml0U2VsZWN0aW9uXCIsW1wianF1ZXJ5XCJdLGZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoYSxiLGMpe2MuZ2V0KFwiZGVidWdcIikmJndpbmRvdy5jb25zb2xlJiZjb25zb2xlLndhcm4mJmNvbnNvbGUud2FybihcIlNlbGVjdDI6IFRoZSBgaW5pdFNlbGVjdGlvbmAgb3B0aW9uIGhhcyBiZWVuIGRlcHJlY2F0ZWQgaW4gZmF2b3Igb2YgYSBjdXN0b20gZGF0YSBhZGFwdGVyIHRoYXQgb3ZlcnJpZGVzIHRoZSBgY3VycmVudGAgbWV0aG9kLiBUaGlzIG1ldGhvZCBpcyBub3cgY2FsbGVkIG11bHRpcGxlIHRpbWVzIGluc3RlYWQgb2YgYSBzaW5nbGUgdGltZSB3aGVuIHRoZSBpbnN0YW5jZSBpcyBpbml0aWFsaXplZC4gU3VwcG9ydCB3aWxsIGJlIHJlbW92ZWQgZm9yIHRoZSBgaW5pdFNlbGVjdGlvbmAgb3B0aW9uIGluIGZ1dHVyZSB2ZXJzaW9ucyBvZiBTZWxlY3QyXCIpLHRoaXMuaW5pdFNlbGVjdGlvbj1jLmdldChcImluaXRTZWxlY3Rpb25cIiksdGhpcy5faXNJbml0aWFsaXplZD0hMSxhLmNhbGwodGhpcyxiLGMpfXJldHVybiBiLnByb3RvdHlwZS5jdXJyZW50PWZ1bmN0aW9uKGIsYyl7dmFyIGQ9dGhpcztyZXR1cm4gdGhpcy5faXNJbml0aWFsaXplZD92b2lkIGIuY2FsbCh0aGlzLGMpOnZvaWQgdGhpcy5pbml0U2VsZWN0aW9uLmNhbGwobnVsbCx0aGlzLiRlbGVtZW50LGZ1bmN0aW9uKGIpe2QuX2lzSW5pdGlhbGl6ZWQ9ITAsYS5pc0FycmF5KGIpfHwoYj1bYl0pLGMoYil9KX0sYn0pLGIuZGVmaW5lKFwic2VsZWN0Mi9jb21wYXQvaW5wdXREYXRhXCIsW1wianF1ZXJ5XCJdLGZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoYSxiLGMpe3RoaXMuX2N1cnJlbnREYXRhPVtdLHRoaXMuX3ZhbHVlU2VwYXJhdG9yPWMuZ2V0KFwidmFsdWVTZXBhcmF0b3JcIil8fFwiLFwiLFwiaGlkZGVuXCI9PT1iLnByb3AoXCJ0eXBlXCIpJiZjLmdldChcImRlYnVnXCIpJiZjb25zb2xlJiZjb25zb2xlLndhcm4mJmNvbnNvbGUud2FybihcIlNlbGVjdDI6IFVzaW5nIGEgaGlkZGVuIGlucHV0IHdpdGggU2VsZWN0MiBpcyBubyBsb25nZXIgc3VwcG9ydGVkIGFuZCBtYXkgc3RvcCB3b3JraW5nIGluIHRoZSBmdXR1cmUuIEl0IGlzIHJlY29tbWVuZGVkIHRvIHVzZSBhIGA8c2VsZWN0PmAgZWxlbWVudCBpbnN0ZWFkLlwiKSxhLmNhbGwodGhpcyxiLGMpfXJldHVybiBiLnByb3RvdHlwZS5jdXJyZW50PWZ1bmN0aW9uKGIsYyl7ZnVuY3Rpb24gZChiLGMpe3ZhciBlPVtdO3JldHVybiBiLnNlbGVjdGVkfHwtMSE9PWEuaW5BcnJheShiLmlkLGMpPyhiLnNlbGVjdGVkPSEwLGUucHVzaChiKSk6Yi5zZWxlY3RlZD0hMSxiLmNoaWxkcmVuJiZlLnB1c2guYXBwbHkoZSxkKGIuY2hpbGRyZW4sYykpLGV9Zm9yKHZhciBlPVtdLGY9MDtmPHRoaXMuX2N1cnJlbnREYXRhLmxlbmd0aDtmKyspe3ZhciBnPXRoaXMuX2N1cnJlbnREYXRhW2ZdO2UucHVzaC5hcHBseShlLGQoZyx0aGlzLiRlbGVtZW50LnZhbCgpLnNwbGl0KHRoaXMuX3ZhbHVlU2VwYXJhdG9yKSkpfWMoZSl9LGIucHJvdG90eXBlLnNlbGVjdD1mdW5jdGlvbihiLGMpe2lmKHRoaXMub3B0aW9ucy5nZXQoXCJtdWx0aXBsZVwiKSl7dmFyIGQ9dGhpcy4kZWxlbWVudC52YWwoKTtkKz10aGlzLl92YWx1ZVNlcGFyYXRvcitjLmlkLHRoaXMuJGVsZW1lbnQudmFsKGQpLHRoaXMuJGVsZW1lbnQudHJpZ2dlcihcImNoYW5nZVwiKX1lbHNlIHRoaXMuY3VycmVudChmdW5jdGlvbihiKXthLm1hcChiLGZ1bmN0aW9uKGEpe2Euc2VsZWN0ZWQ9ITF9KX0pLHRoaXMuJGVsZW1lbnQudmFsKGMuaWQpLHRoaXMuJGVsZW1lbnQudHJpZ2dlcihcImNoYW5nZVwiKX0sYi5wcm90b3R5cGUudW5zZWxlY3Q9ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzO2Iuc2VsZWN0ZWQ9ITEsdGhpcy5jdXJyZW50KGZ1bmN0aW9uKGEpe2Zvcih2YXIgZD1bXSxlPTA7ZTxhLmxlbmd0aDtlKyspe3ZhciBmPWFbZV07Yi5pZCE9Zi5pZCYmZC5wdXNoKGYuaWQpfWMuJGVsZW1lbnQudmFsKGQuam9pbihjLl92YWx1ZVNlcGFyYXRvcikpLGMuJGVsZW1lbnQudHJpZ2dlcihcImNoYW5nZVwiKX0pfSxiLnByb3RvdHlwZS5xdWVyeT1mdW5jdGlvbihhLGIsYyl7Zm9yKHZhciBkPVtdLGU9MDtlPHRoaXMuX2N1cnJlbnREYXRhLmxlbmd0aDtlKyspe3ZhciBmPXRoaXMuX2N1cnJlbnREYXRhW2VdLGc9dGhpcy5tYXRjaGVzKGIsZik7bnVsbCE9PWcmJmQucHVzaChnKX1jKHtyZXN1bHRzOmR9KX0sYi5wcm90b3R5cGUuYWRkT3B0aW9ucz1mdW5jdGlvbihiLGMpe3ZhciBkPWEubWFwKGMsZnVuY3Rpb24oYil7cmV0dXJuIGEuZGF0YShiWzBdLFwiZGF0YVwiKX0pO3RoaXMuX2N1cnJlbnREYXRhLnB1c2guYXBwbHkodGhpcy5fY3VycmVudERhdGEsZCl9LGJ9KSxiLmRlZmluZShcInNlbGVjdDIvY29tcGF0L21hdGNoZXJcIixbXCJqcXVlcnlcIl0sZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYihiKXtmdW5jdGlvbiBjKGMsZCl7dmFyIGU9YS5leHRlbmQoITAse30sZCk7aWYobnVsbD09Yy50ZXJtfHxcIlwiPT09YS50cmltKGMudGVybSkpcmV0dXJuIGU7aWYoZC5jaGlsZHJlbil7Zm9yKHZhciBmPWQuY2hpbGRyZW4ubGVuZ3RoLTE7Zj49MDtmLS0pe3ZhciBnPWQuY2hpbGRyZW5bZl0saD1iKGMudGVybSxnLnRleHQsZyk7aHx8ZS5jaGlsZHJlbi5zcGxpY2UoZiwxKX1pZihlLmNoaWxkcmVuLmxlbmd0aD4wKXJldHVybiBlfXJldHVybiBiKGMudGVybSxkLnRleHQsZCk/ZTpudWxsfXJldHVybiBjfXJldHVybiBifSksYi5kZWZpbmUoXCJzZWxlY3QyL2NvbXBhdC9xdWVyeVwiLFtdLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShhLGIsYyl7Yy5nZXQoXCJkZWJ1Z1wiKSYmd2luZG93LmNvbnNvbGUmJmNvbnNvbGUud2FybiYmY29uc29sZS53YXJuKFwiU2VsZWN0MjogVGhlIGBxdWVyeWAgb3B0aW9uIGhhcyBiZWVuIGRlcHJlY2F0ZWQgaW4gZmF2b3Igb2YgYSBjdXN0b20gZGF0YSBhZGFwdGVyIHRoYXQgb3ZlcnJpZGVzIHRoZSBgcXVlcnlgIG1ldGhvZC4gU3VwcG9ydCB3aWxsIGJlIHJlbW92ZWQgZm9yIHRoZSBgcXVlcnlgIG9wdGlvbiBpbiBmdXR1cmUgdmVyc2lvbnMgb2YgU2VsZWN0Mi5cIiksYS5jYWxsKHRoaXMsYixjKX1yZXR1cm4gYS5wcm90b3R5cGUucXVlcnk9ZnVuY3Rpb24oYSxiLGMpe2IuY2FsbGJhY2s9Yzt2YXIgZD10aGlzLm9wdGlvbnMuZ2V0KFwicXVlcnlcIik7ZC5jYWxsKG51bGwsYil9LGF9KSxiLmRlZmluZShcInNlbGVjdDIvZHJvcGRvd24vYXR0YWNoQ29udGFpbmVyXCIsW10sZnVuY3Rpb24oKXtmdW5jdGlvbiBhKGEsYixjKXthLmNhbGwodGhpcyxiLGMpfXJldHVybiBhLnByb3RvdHlwZS5wb3NpdGlvbj1mdW5jdGlvbihhLGIsYyl7dmFyIGQ9Yy5maW5kKFwiLmRyb3Bkb3duLXdyYXBwZXJcIik7ZC5hcHBlbmQoYiksYi5hZGRDbGFzcyhcInNlbGVjdDItZHJvcGRvd24tLWJlbG93XCIpLGMuYWRkQ2xhc3MoXCJzZWxlY3QyLWNvbnRhaW5lci0tYmVsb3dcIil9LGF9KSxiLmRlZmluZShcInNlbGVjdDIvZHJvcGRvd24vc3RvcFByb3BhZ2F0aW9uXCIsW10sZnVuY3Rpb24oKXtmdW5jdGlvbiBhKCl7fXJldHVybiBhLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGEsYixjKXthLmNhbGwodGhpcyxiLGMpO3ZhciBkPVtcImJsdXJcIixcImNoYW5nZVwiLFwiY2xpY2tcIixcImRibGNsaWNrXCIsXCJmb2N1c1wiLFwiZm9jdXNpblwiLFwiZm9jdXNvdXRcIixcImlucHV0XCIsXCJrZXlkb3duXCIsXCJrZXl1cFwiLFwia2V5cHJlc3NcIixcIm1vdXNlZG93blwiLFwibW91c2VlbnRlclwiLFwibW91c2VsZWF2ZVwiLFwibW91c2Vtb3ZlXCIsXCJtb3VzZW92ZXJcIixcIm1vdXNldXBcIixcInNlYXJjaFwiLFwidG91Y2hlbmRcIixcInRvdWNoc3RhcnRcIl07dGhpcy4kZHJvcGRvd24ub24oZC5qb2luKFwiIFwiKSxmdW5jdGlvbihhKXthLnN0b3BQcm9wYWdhdGlvbigpfSl9LGF9KSxiLmRlZmluZShcInNlbGVjdDIvc2VsZWN0aW9uL3N0b3BQcm9wYWdhdGlvblwiLFtdLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gYSgpe31yZXR1cm4gYS5wcm90b3R5cGUuYmluZD1mdW5jdGlvbihhLGIsYyl7YS5jYWxsKHRoaXMsYixjKTt2YXIgZD1bXCJibHVyXCIsXCJjaGFuZ2VcIixcImNsaWNrXCIsXCJkYmxjbGlja1wiLFwiZm9jdXNcIixcImZvY3VzaW5cIixcImZvY3Vzb3V0XCIsXCJpbnB1dFwiLFwia2V5ZG93blwiLFwia2V5dXBcIixcImtleXByZXNzXCIsXCJtb3VzZWRvd25cIixcIm1vdXNlZW50ZXJcIixcIm1vdXNlbGVhdmVcIixcIm1vdXNlbW92ZVwiLFwibW91c2VvdmVyXCIsXCJtb3VzZXVwXCIsXCJzZWFyY2hcIixcInRvdWNoZW5kXCIsXCJ0b3VjaHN0YXJ0XCJdO3RoaXMuJHNlbGVjdGlvbi5vbihkLmpvaW4oXCIgXCIpLGZ1bmN0aW9uKGEpe2Euc3RvcFByb3BhZ2F0aW9uKCl9KX0sYX0pLGZ1bmN0aW9uKGMpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGIuZGVmaW5lJiZiLmRlZmluZS5hbWQ/Yi5kZWZpbmUoXCJqcXVlcnktbW91c2V3aGVlbFwiLFtcImpxdWVyeVwiXSxjKTpcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1jOmMoYSl9KGZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoYil7dmFyIGc9Ynx8d2luZG93LmV2ZW50LGg9aS5jYWxsKGFyZ3VtZW50cywxKSxqPTAsbD0wLG09MCxuPTAsbz0wLHA9MDtpZihiPWEuZXZlbnQuZml4KGcpLGIudHlwZT1cIm1vdXNld2hlZWxcIixcImRldGFpbFwiaW4gZyYmKG09LTEqZy5kZXRhaWwpLFwid2hlZWxEZWx0YVwiaW4gZyYmKG09Zy53aGVlbERlbHRhKSxcIndoZWVsRGVsdGFZXCJpbiBnJiYobT1nLndoZWVsRGVsdGFZKSxcIndoZWVsRGVsdGFYXCJpbiBnJiYobD0tMSpnLndoZWVsRGVsdGFYKSxcImF4aXNcImluIGcmJmcuYXhpcz09PWcuSE9SSVpPTlRBTF9BWElTJiYobD0tMSptLG09MCksaj0wPT09bT9sOm0sXCJkZWx0YVlcImluIGcmJihtPS0xKmcuZGVsdGFZLGo9bSksXCJkZWx0YVhcImluIGcmJihsPWcuZGVsdGFYLDA9PT1tJiYoaj0tMSpsKSksMCE9PW18fDAhPT1sKXtpZigxPT09Zy5kZWx0YU1vZGUpe3ZhciBxPWEuZGF0YSh0aGlzLFwibW91c2V3aGVlbC1saW5lLWhlaWdodFwiKTtqKj1xLG0qPXEsbCo9cX1lbHNlIGlmKDI9PT1nLmRlbHRhTW9kZSl7dmFyIHI9YS5kYXRhKHRoaXMsXCJtb3VzZXdoZWVsLXBhZ2UtaGVpZ2h0XCIpO2oqPXIsbSo9cixsKj1yfWlmKG49TWF0aC5tYXgoTWF0aC5hYnMobSksTWF0aC5hYnMobCkpLCghZnx8Zj5uKSYmKGY9bixkKGcsbikmJihmLz00MCkpLGQoZyxuKSYmKGovPTQwLGwvPTQwLG0vPTQwKSxqPU1hdGhbaj49MT9cImZsb29yXCI6XCJjZWlsXCJdKGovZiksbD1NYXRoW2w+PTE/XCJmbG9vclwiOlwiY2VpbFwiXShsL2YpLG09TWF0aFttPj0xP1wiZmxvb3JcIjpcImNlaWxcIl0obS9mKSxrLnNldHRpbmdzLm5vcm1hbGl6ZU9mZnNldCYmdGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3Qpe3ZhciBzPXRoaXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7bz1iLmNsaWVudFgtcy5sZWZ0LHA9Yi5jbGllbnRZLXMudG9wfXJldHVybiBiLmRlbHRhWD1sLGIuZGVsdGFZPW0sYi5kZWx0YUZhY3Rvcj1mLGIub2Zmc2V0WD1vLGIub2Zmc2V0WT1wLGIuZGVsdGFNb2RlPTAsaC51bnNoaWZ0KGIsaixsLG0pLGUmJmNsZWFyVGltZW91dChlKSxlPXNldFRpbWVvdXQoYywyMDApLChhLmV2ZW50LmRpc3BhdGNofHxhLmV2ZW50LmhhbmRsZSkuYXBwbHkodGhpcyxoKX19ZnVuY3Rpb24gYygpe2Y9bnVsbH1mdW5jdGlvbiBkKGEsYil7cmV0dXJuIGsuc2V0dGluZ3MuYWRqdXN0T2xkRGVsdGFzJiZcIm1vdXNld2hlZWxcIj09PWEudHlwZSYmYiUxMjA9PT0wfXZhciBlLGYsZz1bXCJ3aGVlbFwiLFwibW91c2V3aGVlbFwiLFwiRE9NTW91c2VTY3JvbGxcIixcIk1vek1vdXNlUGl4ZWxTY3JvbGxcIl0saD1cIm9ud2hlZWxcImluIGRvY3VtZW50fHxkb2N1bWVudC5kb2N1bWVudE1vZGU+PTk/W1wid2hlZWxcIl06W1wibW91c2V3aGVlbFwiLFwiRG9tTW91c2VTY3JvbGxcIixcIk1vek1vdXNlUGl4ZWxTY3JvbGxcIl0saT1BcnJheS5wcm90b3R5cGUuc2xpY2U7aWYoYS5ldmVudC5maXhIb29rcylmb3IodmFyIGo9Zy5sZW5ndGg7ajspYS5ldmVudC5maXhIb29rc1tnWy0tal1dPWEuZXZlbnQubW91c2VIb29rczt2YXIgaz1hLmV2ZW50LnNwZWNpYWwubW91c2V3aGVlbD17dmVyc2lvbjpcIjMuMS4xMlwiLHNldHVwOmZ1bmN0aW9uKCl7aWYodGhpcy5hZGRFdmVudExpc3RlbmVyKWZvcih2YXIgYz1oLmxlbmd0aDtjOyl0aGlzLmFkZEV2ZW50TGlzdGVuZXIoaFstLWNdLGIsITEpO2Vsc2UgdGhpcy5vbm1vdXNld2hlZWw9YjthLmRhdGEodGhpcyxcIm1vdXNld2hlZWwtbGluZS1oZWlnaHRcIixrLmdldExpbmVIZWlnaHQodGhpcykpLGEuZGF0YSh0aGlzLFwibW91c2V3aGVlbC1wYWdlLWhlaWdodFwiLGsuZ2V0UGFnZUhlaWdodCh0aGlzKSl9LHRlYXJkb3duOmZ1bmN0aW9uKCl7aWYodGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKWZvcih2YXIgYz1oLmxlbmd0aDtjOyl0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoaFstLWNdLGIsITEpO2Vsc2UgdGhpcy5vbm1vdXNld2hlZWw9bnVsbDthLnJlbW92ZURhdGEodGhpcyxcIm1vdXNld2hlZWwtbGluZS1oZWlnaHRcIiksYS5yZW1vdmVEYXRhKHRoaXMsXCJtb3VzZXdoZWVsLXBhZ2UtaGVpZ2h0XCIpfSxnZXRMaW5lSGVpZ2h0OmZ1bmN0aW9uKGIpe3ZhciBjPWEoYiksZD1jW1wib2Zmc2V0UGFyZW50XCJpbiBhLmZuP1wib2Zmc2V0UGFyZW50XCI6XCJwYXJlbnRcIl0oKTtyZXR1cm4gZC5sZW5ndGh8fChkPWEoXCJib2R5XCIpKSxwYXJzZUludChkLmNzcyhcImZvbnRTaXplXCIpLDEwKXx8cGFyc2VJbnQoYy5jc3MoXCJmb250U2l6ZVwiKSwxMCl8fDE2fSxnZXRQYWdlSGVpZ2h0OmZ1bmN0aW9uKGIpe3JldHVybiBhKGIpLmhlaWdodCgpfSxzZXR0aW5nczp7YWRqdXN0T2xkRGVsdGFzOiEwLG5vcm1hbGl6ZU9mZnNldDohMH19O2EuZm4uZXh0ZW5kKHttb3VzZXdoZWVsOmZ1bmN0aW9uKGEpe3JldHVybiBhP3RoaXMuYmluZChcIm1vdXNld2hlZWxcIixhKTp0aGlzLnRyaWdnZXIoXCJtb3VzZXdoZWVsXCIpfSx1bm1vdXNld2hlZWw6ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMudW5iaW5kKFwibW91c2V3aGVlbFwiLGEpfX0pfSksYi5kZWZpbmUoXCJqcXVlcnkuc2VsZWN0MlwiLFtcImpxdWVyeVwiLFwianF1ZXJ5LW1vdXNld2hlZWxcIixcIi4vc2VsZWN0Mi9jb3JlXCIsXCIuL3NlbGVjdDIvZGVmYXVsdHNcIl0sZnVuY3Rpb24oYSxiLGMsZCl7aWYobnVsbD09YS5mbi5zZWxlY3QyKXt2YXIgZT1bXCJvcGVuXCIsXCJjbG9zZVwiLFwiZGVzdHJveVwiXTthLmZuLnNlbGVjdDI9ZnVuY3Rpb24oYil7aWYoYj1ifHx7fSxcIm9iamVjdFwiPT10eXBlb2YgYilyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIGQ9YS5leHRlbmQoITAse30sYik7bmV3IGMoYSh0aGlzKSxkKX0pLHRoaXM7aWYoXCJzdHJpbmdcIj09dHlwZW9mIGIpe3ZhciBkLGY9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLDEpO3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgYz1hKHRoaXMpLmRhdGEoXCJzZWxlY3QyXCIpO251bGw9PWMmJndpbmRvdy5jb25zb2xlJiZjb25zb2xlLmVycm9yJiZjb25zb2xlLmVycm9yKFwiVGhlIHNlbGVjdDIoJ1wiK2IrXCInKSBtZXRob2Qgd2FzIGNhbGxlZCBvbiBhbiBlbGVtZW50IHRoYXQgaXMgbm90IHVzaW5nIFNlbGVjdDIuXCIpLGQ9Y1tiXS5hcHBseShjLGYpfSksYS5pbkFycmF5KGIsZSk+LTE/dGhpczpkfXRocm93IG5ldyBFcnJvcihcIkludmFsaWQgYXJndW1lbnRzIGZvciBTZWxlY3QyOiBcIitiKX19cmV0dXJuIG51bGw9PWEuZm4uc2VsZWN0Mi5kZWZhdWx0cyYmKGEuZm4uc2VsZWN0Mi5kZWZhdWx0cz1kKSxjfSkse2RlZmluZTpiLmRlZmluZSxyZXF1aXJlOmIucmVxdWlyZX19KCksYz1iLnJlcXVpcmUoXCJqcXVlcnkuc2VsZWN0MlwiKTtyZXR1cm4gYS5mbi5zZWxlY3QyLmFtZD1iLGN9KTsiLCIkKGZ1bmN0aW9uKCkge1xuICAgICQoJ2lucHV0W25hbWU9ZF9mcm9tXSwgaW5wdXRbbmFtZT1kX3RvXScpLmRhdGVwaWNrZXIoe1xuICAgICAgICBkYXRlRm9ybWF0OiBcInl5eXktbW0tZGRcIlxuICAgIH0pO1xuXG4gICAgJCgnZm9ybVtuYW1lPWNhdGVnb3JpZXMtZWRpdC1zdG9yZXNdIGlucHV0W3R5cGU9Y2hlY2tib3hdJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgXHR2YXIgc2VsZiA9ICQodGhpcyksXG4gICAgXHRcdGNhdGVnb3JpZXNGb3JtID0gJCgnZm9ybVtuYW1lPWNhdGVnb3JpZXMtZWRpdC1zdG9yZXNdJyk7XG5cbiAgICBcdGlmKHNlbGYuaXMoXCI6Y2hlY2tlZFwiKSAmJiBzZWxmLmF0dHIoXCJkYXRhLXBhcmVudC1pZFwiKSAhPSBcIjBcIikge1xuICAgIFx0XHRjYXRlZ29yaWVzRm9ybS5maW5kKCdpbnB1dFtkYXRhLXVpZD0nKyBzZWxmLmF0dHIoXCJkYXRhLXBhcmVudC1pZFwiKSArJ10nKS5wcm9wKFwiY2hlY2tlZFwiLCBmYWxzZSkucHJvcChcImNoZWNrZWRcIiwgdHJ1ZSk7XG4gICAgXHR9IGVsc2UgaWYoIXNlbGYuaXMoXCI6Y2hlY2tlZFwiKSAmJiBzZWxmLmF0dHIoXCJkYXRhLXBhcmVudC1pZFwiKSAhPSBcIjBcIikge1xuICAgIFx0XHR2YXIgcGFyZW50VW5jaGVrZWQgPSB0cnVlO1xuXG4gICAgXHRcdGNhdGVnb3JpZXNGb3JtLmZpbmQoJ2lucHV0W2RhdGEtcGFyZW50LWlkPScrIHNlbGYuYXR0cihcImRhdGEtcGFyZW50LWlkXCIpICsnXScpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgXHRcdFx0aWYoJCh0aGlzKS5pcyhcIjpjaGVja2VkXCIpKSB7XG4gICAgXHRcdFx0XHRwYXJlbnRVbmNoZWtlZCA9IGZhbHNlO1xuICAgIFx0XHRcdH1cbiAgICBcdFx0fSk7XG5cbiAgICBcdFx0aWYocGFyZW50VW5jaGVrZWQpIHtcbiAgICBcdFx0XHRjYXRlZ29yaWVzRm9ybS5maW5kKCdpbnB1dFtkYXRhLXVpZD0nKyBzZWxmLmF0dHIoXCJkYXRhLXBhcmVudC1pZFwiKSArJ10nKS5wcm9wKFwiY2hlY2tlZFwiLCBmYWxzZSk7XG4gICAgXHRcdH1cbiAgICBcdH1cbiAgICB9KTtcblxuXHQkKFwiLnNlbGVjdDItdXNlcnNcIikuc2VsZWN0Mih7XG5cdFx0YWpheDoge1xuXHRcdFx0dXJsOiBcIi9hZG1pbi91c2Vycy9saXN0XCIsXG5cdFx0XHR0eXBlOiAncG9zdCcsXG5cdFx0XHRkYXRhVHlwZTogJ2pzb24nLFxuXHRcdFx0ZGVsYXk6IDI1MCxcblx0XHRcdGRhdGE6IGZ1bmN0aW9uIChwYXJhbXMpIHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRlbWFpbDogcGFyYW1zLnRlcm1cblx0XHRcdFx0fTtcblx0XHRcdH0sXG5cdFx0XHRwcm9jZXNzUmVzdWx0czogZnVuY3Rpb24gKGRhdGEpIHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRyZXN1bHRzOiBkYXRhXG5cdFx0XHRcdH07XG5cdFx0XHR9LFxuXHRcdFx0Y2FjaGU6IHRydWVcblx0XHR9LFxuXHRcdHBsYWNlaG9sZGVyOiBcItCS0YvQsdC10YDQuNGC0LUg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GPXCIsXG5cdFx0bWluaW11bUlucHV0TGVuZ3RoOiAxXG5cdH0pO1xuXG5cdCQoIFwiLmlucHV0LWRhdGVwaWNrZXJcIiApLmRhdGVwaWNrZXIoe1xuXHRcdGRhdGVGb3JtYXQ6IFwieXl5eS1tbS1kZFwiXG5cdH0pO1xuXG5cdCQoJyNjaGFyaXR5LWNoZWNrYm94LTAnKS5jbGljayggZnVuY3Rpb24gKCkge1xuXHRcdHZhciBjaGVja2VkID0gdGhpcy5jaGVja2VkO1xuXHRcdEFycmF5LmZyb20oZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImNoYXJpdHktY2hlY2tib3hcIikpLmZvckVhY2goXG5cdFx0XHRmdW5jdGlvbihlbGVtZW50KSB7XG5cdFx0XHRcdGVsZW1lbnQuY2hlY2tlZCA9IGNoZWNrZWQ7XG5cdFx0XHR9XG5cdFx0KTtcblx0fSk7XG5cblx0JCgnLmFqYXgtY29uZmlybScpLm9uKCdjbGljaycsZnVuY3Rpb24oZSkge1xuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHQkdGhpcz0kKHRoaXMpO1xuXHRcdGRhdGE9e1xuXHRcdFx0J3F1ZXN0aW9uJzokdGhpcy5kYXRhKCdxdWVzdGlvbicpfHwn0JLRiyDRg9Cy0YPRgNC10L3QvdGLPycsXG5cdFx0XHQndGl0bGUnOiR0aGlzLmRhdGEoJ3RpdGxlJyl8fCfQn9C+0LTRgtCy0LXRgNC20LTQtdC90LjQtSDQtNC10LnRgdGC0LLQuNGPJyxcblx0XHRcdCdjYWxsYmFja1llcyc6ZnVuY3Rpb24oKXtcblx0XHRcdFx0JHRoaXM9JCh0aGlzKTtcblx0XHRcdFx0JC5wb3N0KCcvYWRtaW4vc3RvcmVzL2ltcG9ydC1jYXQvaWQ6JyskdGhpcy5kYXRhKCdzdG9yZScpLGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0XHRcdGlmKGRhdGEuZXJyb3Ipe1xuXHRcdFx0XHRcdFx0bm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTpkYXRhLmVycm9yLHR5cGU6J2Vycid9KVxuXHRcdFx0XHRcdH1lbHNlIHtcblx0XHRcdFx0XHRcdGxvY2F0aW9uLnJlbG9hZCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSwnanNvbicpXG5cdFx0XHRcdFx0LmZhaWwoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOlwi0J7RiNC40LHQutCwINC/0LXRgNC10LTQsNGH0Lgg0LTQsNC90L3Ri9GFXCIsdHlwZTonZXJyJ30pXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9LFxuXHRcdFx0J29iaic6JHRoaXNcblx0XHR9O1xuXHRcdG5vdGlmaWNhdGlvbi5jb25maXJtKGRhdGEpXG5cdH0pXG59KTtcblxuLyokKGZ1bmN0aW9uKCkge1xuXHQkKCcuY2hfdHJlZSBpbnB1dCcpLm9uKCdjaGFuZ2UnLGZ1bmN0aW9uKCl7XG5cdFx0JHRoaXM9JCh0aGlzKVxuXHRcdGlucHV0PSR0aGlzLnBhcmVudCgpLnBhcmVudCgpLmZpbmQoJ2lucHV0Jyk7XG5cdFx0aW5wdXQucHJvcCgnY2hlY2tlZCcsJHRoaXMucHJvcCgnY2hlY2tlZCcpKVxuXHR9KVxufSk7Ki9cbiQoZnVuY3Rpb24oKSB7XG5cdCQoJy5nZXRfYWRtaXRhZCcpLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGhyZWY9dGhpcy5ocmVmfHxcIlwiO1xuXG5cdFx0JCgnLnVzZXJfZGF0YScpLmh0bWwoXCJcIik7XG5cdFx0YWQ9JCgnLmFkbWl0YWRfZGF0YScpO1xuXHRcdGFkLmFkZENsYXNzKCdsb2FkaW5nJyk7XG5cdFx0YWQucmVtb3ZlQ2xhc3MoJ25vcm1hbF9sb2FkJyk7XG5cdFx0YWQudGV4dCgnJyk7XG5cblx0XHR0cj1hZC5jbG9zZXN0KCd0cicpO1xuXHRcdGlkcz1bXTtcblx0XHRmb3IodmFyIGk9MDtpPHRyLmxlbmd0aDtpKyspe1xuXHRcdFx0aWQ9dHIuZXEoaSkuZGF0YSgna2V5Jyk7XG5cdFx0XHRpZihpZClpZHMucHVzaChpZCk7XG5cdFx0fVxuXG5cdFx0aWYoaWRzLmxlbmd0aD09MCl7XG5cdFx0XHRhZC5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuXHRcdFx0YWxlcnQoJ9Cd0LXRgiDQt9Cw0LrQsNC30L7QsiDQtNC70Y8g0L/RgNC+0LLQtdGA0LrQuCcpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdCQucG9zdCgnL2FkbWluL3BheW1lbnRzL2FkbWl0YWQtdGVzdCcseydpZHMnOmlkcywndXBkYXRlJzooaHJlZi5pbmRleE9mKCd1cGRhdGUnKT4wPzE6MCl9LGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0YWQ9JCgnLmFkbWl0YWRfZGF0YScpO1xuXHRcdFx0YWQudGV4dCgn0LTQsNC90L3Ri9C1INC90LUg0L3QsNC50LTQtdC90YsnKTtcblx0XHRcdGFkLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG5cblx0XHRcdHRyPWFkLmNsb3Nlc3QoJ3RyJyk7XG5cdFx0XHRmb3IodmFyIGk9MDtpPHRyLmxlbmd0aDtpKyspIHtcblx0XHRcdFx0dmFyIGl0ZW0gPSB0ci5lcShpKTtcblx0XHRcdFx0aWQgPSBpdGVtLmRhdGEoJ2tleScpO1xuXHRcdFx0XHRpZiAoIWRhdGFbaWRdKSB7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0ZHM9aXRlbS5maW5kKCcuYWRtaXRhZF9kYXRhJyk7XG5cdFx0XHRcdGZvcih2YXIgaj0wO2o8dGRzLmxlbmd0aDtqKyspIHtcblx0XHRcdFx0XHR2YXIgdGQgPSB0ZHMuZXEoaik7XG5cdFx0XHRcdFx0a2V5PXRkLmRhdGEoJ2NvbCcpO1xuXHRcdFx0XHRcdGlmKGRhdGFbaWRdW2tleV0pe1xuXHRcdFx0XHRcdFx0dGQuaHRtbChkYXRhW2lkXVtrZXldKTtcblx0XHRcdFx0XHRcdHRkLmFkZENsYXNzKCdub3JtYWxfbG9hZCcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZihkYXRhWyd1c2VyX2RhdGEnXSl7XG5cdFx0XHRcdHVzZXI9ZGF0YVsndXNlcl9kYXRhJ107XG5cdFx0XHRcdHVzZXJfZGF0YT0nPEgyPtCR0LDQu9Cw0L3RgSDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y8gJyt1c2VyWydlbWFpbCddKycgKCcrdXNlclsndWlkJ10rJykg0L7QsdC90L7QstC70LXQvTwvSDI+Jztcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0YWJsZSBjbGFzcz0ndGFibGUgdGFibGUtc3VtJz5cIlxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRyPlwiXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGg+PC90aD5cIjtcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0aD7QodGC0LDRgNGL0LUg0LTQsNC90L3Ri9C1PC90aD5cIjtcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0aD7QndC+0LLRi9C1INC00LDQvdC90YvQtTwvdGg+XCI7XG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8L3RyPlwiXG5cblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0cj5cIlxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRkPtCSINC+0LbQuNC00LDQvdC40LggKNC60L7Quy3QstC+KTwvdGQ+XCI7XG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQgY2xhc3M9J3ZhbHVlJz5cIit1c2VyWydvbGQnXVsnY250X3BlbmRpbmcnXStcIjwvdGQ+XCI7XG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQgY2xhc3M9J3ZhbHVlJz5cIit1c2VyWyduZXcnXVsnY250X3BlbmRpbmcnXStcIjwvdGQ+XCI7XG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8L3RyPlwiXG5cblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0cj5cIlxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRkPtCSINC+0LbQuNC00LDQvdC40LggKNGB0YPQvNC80LApPC90ZD5cIjtcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0ZCBjbGFzcz0ndmFsdWUnPlwiK3VzZXJbJ29sZCddWydzdW1fcGVuZGluZyddK1wiPC90ZD5cIjtcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0ZCBjbGFzcz0ndmFsdWUnPlwiK3VzZXJbJ25ldyddWydzdW1fcGVuZGluZyddK1wiPC90ZD5cIjtcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjwvdHI+XCJcblxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRyPlwiXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQ+0J7RgtC60LvQvtC90LXQvdC+ICjQutC+0Lst0LLQvik8L3RkPlwiO1xuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRkIGNsYXNzPSd2YWx1ZSc+XCIrdXNlclsnb2xkJ11bJ2NudF9kZWNsaW5lZCddK1wiPC90ZD5cIjtcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0ZCBjbGFzcz0ndmFsdWUnPlwiK3VzZXJbJ25ldyddWydjbnRfZGVjbGluZWQnXStcIjwvdGQ+XCI7XG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8L3RyPlwiXG5cblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0cj5cIlxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRkPtCe0YLQutC70L7QvdC10L3QviAo0YHRg9C80LzQsCk8L3RkPlwiO1xuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRkIGNsYXNzPSd2YWx1ZSc+XCIrdXNlclsnb2xkJ11bJ3N1bV9kZWNsaW5lZCddK1wiPC90ZD5cIjtcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0ZCBjbGFzcz0ndmFsdWUnPlwiK3VzZXJbJ25ldyddWydzdW1fZGVjbGluZWQnXStcIjwvdGQ+XCI7XG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8L3RyPlwiXG5cblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0cj5cIlxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRkPtCf0L7QtNGC0LLQtdGA0LbQtNC10L3QviAo0LrQvtC7LdCy0L4pPC90ZD5cIjtcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0ZCBjbGFzcz0ndmFsdWUnPlwiK3VzZXJbJ29sZCddWydjbnRfY29uZmlybWVkJ10rXCI8L3RkPlwiO1xuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRkIGNsYXNzPSd2YWx1ZSc+XCIrdXNlclsnbmV3J11bJ2NudF9jb25maXJtZWQnXStcIjwvdGQ+XCI7XG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8L3RyPlwiXG5cblx0XHRcdFx0dXNlcl9kYXRhKz1cIjx0cj5cIlxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRkPtCf0L7QtNGC0LLQtdGA0LbQtNC10L3QviAo0YHRg9C80LzQsCk8L3RkPlwiO1xuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRkIGNsYXNzPSd2YWx1ZSc+XCIrdXNlclsnb2xkJ11bJ3N1bV9jb25maXJtZWQnXStcIjwvdGQ+XCI7XG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQgY2xhc3M9J3ZhbHVlJz5cIit1c2VyWyduZXcnXVsnc3VtX2NvbmZpcm1lZCddK1wiPC90ZD5cIjtcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjwvdHI+XCJcblxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRyPlwiXG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQ+0JHQsNC70LDQvdGBICjQvtCx0YnQuNC5KTwvdGQ+XCI7XG5cdFx0XHRcdHVzZXJfZGF0YSs9XCI8dGQgY2xhc3M9J3ZhbHVlJz5cIit1c2VyWydvbGQnXVsnYmFsYW5zJ10rXCI8L3RkPlwiO1xuXHRcdFx0XHR1c2VyX2RhdGErPVwiPHRkIGNsYXNzPSd2YWx1ZSc+XCIrdXNlclsnbmV3J11bJ2JhbGFucyddK1wiPC90ZD5cIjtcblx0XHRcdFx0dXNlcl9kYXRhKz1cIjwvdHI+XCJcblxuXHRcdFx0XHR1c2VyX2RhdGErPVwiPC90YWJsZT5cIlxuXHRcdFx0XHQkKCcudXNlcl9kYXRhJykuaHRtbCh1c2VyX2RhdGEpO1xuXHRcdFx0fVxuXHRcdH0sJ2pzb24nKS5mYWlsKGZ1bmN0aW9uICgpIHtcblx0XHRcdGFkLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG5cdFx0XHRhbGVydCgn0J7RiNC40LHQutCwINC+0LHRgNCw0LHQvtGC0LrQuCDQt9Cw0L/RgNC+0YHQsCcpXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pXG59KTsiLCIndXNlIHN0cmljdCc7XG5cbmlmICh0eXBlb2YgbWloYWlsZGV2ID09IFwidW5kZWZpbmVkXCIgfHwgIW1paGFpbGRldikge1xuICAgIHZhciBtaWhhaWxkZXYgPSB7fTtcbiAgICBtaWhhaWxkZXYuZWxGaW5kZXIgPSB7XG4gICAgICAgIG9wZW5NYW5hZ2VyOiBmdW5jdGlvbihvcHRpb25zKXtcbiAgICAgICAgICAgIHZhciBwYXJhbXMgPSBcIm1lbnViYXI9bm8sdG9vbGJhcj1ubyxsb2NhdGlvbj1ubyxkaXJlY3Rvcmllcz1ubyxzdGF0dXM9bm8sZnVsbHNjcmVlbj1ub1wiO1xuICAgICAgICAgICAgaWYob3B0aW9ucy53aWR0aCA9PSAnYXV0bycpe1xuICAgICAgICAgICAgICAgIG9wdGlvbnMud2lkdGggPSAkKHdpbmRvdykud2lkdGgoKS8xLjU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKG9wdGlvbnMuaGVpZ2h0ID09ICdhdXRvJyl7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5oZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCkvMS41O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwYXJhbXMgPSBwYXJhbXMgKyBcIix3aWR0aD1cIiArIG9wdGlvbnMud2lkdGg7XG4gICAgICAgICAgICBwYXJhbXMgPSBwYXJhbXMgKyBcIixoZWlnaHQ9XCIgKyBvcHRpb25zLmhlaWdodDtcblxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhwYXJhbXMpO1xuICAgICAgICAgICAgdmFyIHdpbiA9IHdpbmRvdy5vcGVuKG9wdGlvbnMudXJsLCAnRWxGaW5kZXJNYW5hZ2VyJyArIG9wdGlvbnMuaWQsIHBhcmFtcyk7XG4gICAgICAgICAgICB3aW4uZm9jdXMoKVxuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbnM6IHt9LFxuICAgICAgICByZWdpc3RlcjogZnVuY3Rpb24oaWQsIGZ1bmMpe1xuICAgICAgICAgICAgdGhpcy5mdW5jdGlvbnNbaWRdID0gZnVuYztcbiAgICAgICAgfSxcbiAgICAgICAgY2FsbEZ1bmN0aW9uOiBmdW5jdGlvbihpZCwgZmlsZSl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5mdW5jdGlvbnNbaWRdKGZpbGUsIGlkKTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb25SZXR1cm5Ub0lucHV0OiBmdW5jdGlvbihmaWxlLCBpZCl7XG4gICAgICAgICAgICBqUXVlcnkoJyMnICsgaWQpLnZhbChmaWxlLnVybCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH07XG5cbn1cblxuXG5cbnZhciBtZWdhc2xpZGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNsaWRlcl9kYXRhID0gZmFsc2U7XG4gIHZhciBjb250YWluZXJfaWQgPSBcInNlY3Rpb24jbWVnYV9zbGlkZXJcIjtcbiAgdmFyIHBhcmFsbGF4X2dyb3VwID0gZmFsc2U7XG4gIHZhciBwYXJhbGxheF90aW1lciA9IGZhbHNlO1xuICB2YXIgcGFyYWxsYXhfY291bnRlciA9IDA7XG4gIHZhciBwYXJhbGxheF9kID0gMTtcbiAgdmFyIG1vYmlsZV9tb2RlID0gLTE7XG4gIHZhciBtYXhfdGltZV9sb2FkX3BpYyA9IDMwMDtcbiAgdmFyIG1vYmlsZV9zaXplID0gNzAwO1xuICB2YXIgcmVuZGVyX3NsaWRlX25vbSA9IDA7XG4gIHZhciB0b3RfaW1nX3dhaXQ7XG4gIHZhciBzbGlkZXM7XG4gIHZhciBzbGlkZV9zZWxlY3RfYm94O1xuICB2YXIgZWRpdG9yO1xuICB2YXIgdGltZW91dElkO1xuICB2YXIgc2Nyb2xsX3BlcmlvZCA9IDYwMDA7XG5cbiAgdmFyIHBvc0FyciA9IFtcbiAgICAnc2xpZGVyX190ZXh0LWx0JywgJ3NsaWRlcl9fdGV4dC1jdCcsICdzbGlkZXJfX3RleHQtcnQnLFxuICAgICdzbGlkZXJfX3RleHQtbGMnLCAnc2xpZGVyX190ZXh0LWNjJywgJ3NsaWRlcl9fdGV4dC1yYycsXG4gICAgJ3NsaWRlcl9fdGV4dC1sYicsICdzbGlkZXJfX3RleHQtY2InLCAnc2xpZGVyX190ZXh0LXJiJyxcbiAgXTtcbiAgdmFyIHBvc19saXN0ID0gW1xuICAgICfQm9C10LLQviDQstC10YDRhScsICfRhtC10L3RgtGAINCy0LXRgNGFJywgJ9C/0YDQsNCy0L4g0LLQtdGA0YUnLFxuICAgICfQm9C10LLQviDRhtC10L3RgtGAJywgJ9GG0LXQvdGC0YAnLCAn0L/RgNCw0LLQviDRhtC10L3RgtGAJyxcbiAgICAn0JvQtdCy0L4g0L3QuNC3JywgJ9GG0LXQvdGC0YAg0L3QuNC3JywgJ9C/0YDQsNCy0L4g0L3QuNC3JyxcbiAgXTtcbiAgdmFyIHNob3dfZGVsYXkgPSBbXG4gICAgJ3Nob3dfbm9fZGVsYXknLFxuICAgICdzaG93X2RlbGF5XzA1JyxcbiAgICAnc2hvd19kZWxheV8xMCcsXG4gICAgJ3Nob3dfZGVsYXlfMTUnLFxuICAgICdzaG93X2RlbGF5XzIwJyxcbiAgICAnc2hvd19kZWxheV8yNScsXG4gICAgJ3Nob3dfZGVsYXlfMzAnXG4gIF07XG4gIHZhciBoaWRlX2RlbGF5ID0gW1xuICAgICdoaWRlX25vX2RlbGF5JyxcbiAgICAnaGlkZV9kZWxheV8wNScsXG4gICAgJ2hpZGVfZGVsYXlfMTAnLFxuICAgICdoaWRlX2RlbGF5XzE1JyxcbiAgICAnaGlkZV9kZWxheV8yMCdcbiAgXTtcbiAgdmFyIHllc19ub19hcnIgPSBbXG4gICAgJ25vJyxcbiAgICAneWVzJ1xuICBdO1xuICB2YXIgeWVzX25vX3ZhbCA9IFtcbiAgICAnJyxcbiAgICAnZml4ZWRfX2Z1bGwtaGVpZ2h0J1xuICBdO1xuICB2YXIgYnRuX3N0eWxlID0gW1xuICAgICdub25lJyxcbiAgICAnYm9yZG8nLFxuICAgICdibGFjaycsXG4gICAgJ2JsdWUnLFxuICAgICdkYXJrLWJsdWUnLFxuICAgICdyZWQnLFxuICAgICdvcmFuZ2UnLFxuICAgICdncmVlbicsXG4gICAgJ2xpZ2h0LWdyZWVuJyxcbiAgICAnZGFyay1ncmVlbicsXG4gICAgJ3BpbmsnLFxuICAgICd5ZWxsb3cnXG4gIF07XG4gIHZhciBzaG93X2FuaW1hdGlvbnMgPSBbXG4gICAgXCJub3RfYW5pbWF0ZVwiLFxuICAgIFwiYm91bmNlSW5cIixcbiAgICBcImJvdW5jZUluRG93blwiLFxuICAgIFwiYm91bmNlSW5MZWZ0XCIsXG4gICAgXCJib3VuY2VJblJpZ2h0XCIsXG4gICAgXCJib3VuY2VJblVwXCIsXG4gICAgXCJmYWRlSW5cIixcbiAgICBcImZhZGVJbkRvd25cIixcbiAgICBcImZhZGVJbkxlZnRcIixcbiAgICBcImZhZGVJblJpZ2h0XCIsXG4gICAgXCJmYWRlSW5VcFwiLFxuICAgIFwiZmxpcEluWFwiLFxuICAgIFwiZmxpcEluWVwiLFxuICAgIFwibGlnaHRTcGVlZEluXCIsXG4gICAgXCJyb3RhdGVJblwiLFxuICAgIFwicm90YXRlSW5Eb3duTGVmdFwiLFxuICAgIFwicm90YXRlSW5VcExlZnRcIixcbiAgICBcInJvdGF0ZUluVXBSaWdodFwiLFxuICAgIFwiamFja0luVGhlQm94XCIsXG4gICAgXCJyb2xsSW5cIixcbiAgICBcInpvb21JblwiXG4gIF07XG5cbiAgdmFyIGhpZGVfYW5pbWF0aW9ucyA9IFtcbiAgICBcIm5vdF9hbmltYXRlXCIsXG4gICAgXCJib3VuY2VPdXRcIixcbiAgICBcImJvdW5jZU91dERvd25cIixcbiAgICBcImJvdW5jZU91dExlZnRcIixcbiAgICBcImJvdW5jZU91dFJpZ2h0XCIsXG4gICAgXCJib3VuY2VPdXRVcFwiLFxuICAgIFwiZmFkZU91dFwiLFxuICAgIFwiZmFkZU91dERvd25cIixcbiAgICBcImZhZGVPdXRMZWZ0XCIsXG4gICAgXCJmYWRlT3V0UmlnaHRcIixcbiAgICBcImZhZGVPdXRVcFwiLFxuICAgIFwiZmxpcE91dFhcIixcbiAgICBcImxpcE91dFlcIixcbiAgICBcImxpZ2h0U3BlZWRPdXRcIixcbiAgICBcInJvdGF0ZU91dFwiLFxuICAgIFwicm90YXRlT3V0RG93bkxlZnRcIixcbiAgICBcInJvdGF0ZU91dERvd25SaWdodFwiLFxuICAgIFwicm90YXRlT3V0VXBMZWZ0XCIsXG4gICAgXCJyb3RhdGVPdXRVcFJpZ2h0XCIsXG4gICAgXCJoaW5nZVwiLFxuICAgIFwicm9sbE91dFwiXG4gIF07XG4gIHZhciBzdFRhYmxlO1xuICB2YXIgcGFyYWxheFRhYmxlO1xuXG4gIGZ1bmN0aW9uIGluaXRJbWFnZVNlcnZlclNlbGVjdChlbHMpIHtcbiAgICBpZiAoZWxzLmxlbmd0aCA9PSAwKXJldHVybjtcbiAgICBlbHMud3JhcCgnPGRpdiBjbGFzcz1cInNlbGVjdF9pbWdcIj4nKTtcbiAgICBlbHMgPSBlbHMucGFyZW50KCk7XG4gICAgZWxzLmFwcGVuZCgnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJmaWxlX2J1dHRvblwiPjxpIGNsYXNzPVwibWNlLWljbyBtY2UtaS1icm93c2VcIj48L2k+PC9idXR0b24+Jyk7XG4gICAgLyplbHMuZmluZCgnYnV0dG9uJykub24oJ2NsaWNrJyxmdW5jdGlvbiAoKSB7XG4gICAgICQoJyNyb3h5Q3VzdG9tUGFuZWwyJykuYWRkQ2xhc3MoJ29wZW4nKVxuICAgICB9KTsqL1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZWwgPSBlbHMuZXEoaSkuZmluZCgnaW5wdXQnKTtcbiAgICAgIGlmICghZWwuYXR0cignaWQnKSkge1xuICAgICAgICBlbC5hdHRyKCdpZCcsICdmaWxlXycgKyBpICsgJ18nICsgRGF0ZS5ub3coKSlcbiAgICAgIH1cbiAgICAgIHZhciB0X2lkID0gZWwuYXR0cignaWQnKTtcbiAgICAgIG1paGFpbGRldi5lbEZpbmRlci5yZWdpc3Rlcih0X2lkLCBmdW5jdGlvbiAoZmlsZSwgaWQpIHtcbiAgICAgICAgLy8kKHRoaXMpLnZhbChmaWxlLnVybCkudHJpZ2dlcignY2hhbmdlJywgW2ZpbGUsIGlkXSk7XG4gICAgICAgICQoJyMnICsgaWQpLnZhbChmaWxlLnVybCkuY2hhbmdlKCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSk7XG4gICAgfVxuICAgIDtcblxuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuZmlsZV9idXR0b24nLCBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLnByZXYoKTtcbiAgICAgIHZhciBpZCA9ICR0aGlzLmF0dHIoJ2lkJyk7XG4gICAgICBtaWhhaWxkZXYuZWxGaW5kZXIub3Blbk1hbmFnZXIoe1xuICAgICAgICBcInVybFwiOiBcIi9tYW5hZ2VyL2VsZmluZGVyP2ZpbHRlcj1pbWFnZSZjYWxsYmFjaz1cIiArIGlkICsgXCImbGFuZz1ydVwiLFxuICAgICAgICBcIndpZHRoXCI6IFwiYXV0b1wiLFxuICAgICAgICBcImhlaWdodFwiOiBcImF1dG9cIixcbiAgICAgICAgXCJpZFwiOiBpZFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBnZW5JbnB1dChkYXRhKSB7XG4gICAgdmFyIGlucHV0ID0gJzxpbnB1dCBjbGFzcz1cIicgKyAoZGF0YS5pbnB1dENsYXNzIHx8ICcnKSArICdcIiB2YWx1ZT1cIicgKyAoZGF0YS52YWx1ZSB8fCAnJykgKyAnXCI+JztcbiAgICBpZiAoZGF0YS5sYWJlbCkge1xuICAgICAgaW5wdXQgPSAnPGxhYmVsPjxzcGFuPicgKyBkYXRhLmxhYmVsICsgJzwvc3Bhbj4nICsgaW5wdXQgKyAnPC9sYWJlbD4nO1xuICAgIH1cbiAgICBpZiAoZGF0YS5wYXJlbnQpIHtcbiAgICAgIGlucHV0ID0gJzwnICsgZGF0YS5wYXJlbnQgKyAnPicgKyBpbnB1dCArICc8LycgKyBkYXRhLnBhcmVudCArICc+JztcbiAgICB9XG4gICAgaW5wdXQgPSAkKGlucHV0KTtcblxuICAgIGlmIChkYXRhLm9uQ2hhbmdlKSB7XG4gICAgICB2YXIgb25DaGFuZ2U7XG4gICAgICBpZiAoZGF0YS5iaW5kKSB7XG4gICAgICAgIGRhdGEuYmluZC5pbnB1dCA9IGlucHV0LmZpbmQoJ2lucHV0Jyk7XG4gICAgICAgIG9uQ2hhbmdlID0gZGF0YS5vbkNoYW5nZS5iaW5kKGRhdGEuYmluZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvbkNoYW5nZSA9IGRhdGEub25DaGFuZ2UuYmluZChpbnB1dC5maW5kKCdpbnB1dCcpKTtcbiAgICAgIH1cbiAgICAgIGlucHV0LmZpbmQoJ2lucHV0Jykub24oJ2NoYW5nZScsIG9uQ2hhbmdlKVxuICAgIH1cbiAgICByZXR1cm4gaW5wdXQ7XG4gIH1cblxuICBmdW5jdGlvbiBnZW5TZWxlY3QoZGF0YSkge1xuICAgIHZhciBpbnB1dCA9ICQoJzxzZWxlY3QvPicpO1xuXG4gICAgdmFyIGVsID0gc2xpZGVyX2RhdGFbMF1bZGF0YS5ncl07XG4gICAgaWYgKGRhdGEuaW5kZXggIT09IGZhbHNlKSB7XG4gICAgICBlbCA9IGVsW2RhdGEuaW5kZXhdO1xuICAgIH1cblxuICAgIGlmIChlbFtkYXRhLnBhcmFtXSkge1xuICAgICAgZGF0YS52YWx1ZSA9IGVsW2RhdGEucGFyYW1dO1xuICAgIH0gZWxzZSB7XG4gICAgICBkYXRhLnZhbHVlID0gMDtcbiAgICB9XG5cbiAgICBpZiAoZGF0YS5zdGFydF9vcHRpb24pIHtcbiAgICAgIGlucHV0LmFwcGVuZChkYXRhLnN0YXJ0X29wdGlvbilcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHZhbDtcbiAgICAgIHZhciB0eHQgPSBkYXRhLmxpc3RbaV07XG4gICAgICBpZiAoZGF0YS52YWxfdHlwZSA9PSAwKSB7XG4gICAgICAgIHZhbCA9IGRhdGEubGlzdFtpXTtcbiAgICAgIH0gZWxzZSBpZiAoZGF0YS52YWxfdHlwZSA9PSAxKSB7XG4gICAgICAgIHZhbCA9IGk7XG4gICAgICB9IGVsc2UgaWYgKGRhdGEudmFsX3R5cGUgPT0gMikge1xuICAgICAgICAvL3ZhbD1kYXRhLnZhbF9saXN0W2ldO1xuICAgICAgICB2YWwgPSBpO1xuICAgICAgICB0eHQgPSBkYXRhLnZhbF9saXN0W2ldO1xuICAgICAgfVxuXG4gICAgICB2YXIgc2VsID0gKHZhbCA9PSBkYXRhLnZhbHVlID8gJ3NlbGVjdGVkJyA6ICcnKTtcbiAgICAgIGlmIChzZWwgPT0gJ3NlbGVjdGVkJykge1xuICAgICAgICBpbnB1dC5hdHRyKCd0X3ZhbCcsIGRhdGEubGlzdFtpXSk7XG4gICAgICB9XG4gICAgICB2YXIgb3B0aW9uID0gJzxvcHRpb24gdmFsdWU9XCInICsgdmFsICsgJ1wiICcgKyBzZWwgKyAnPicgKyB0eHQgKyAnPC9vcHRpb24+JztcbiAgICAgIGlmIChkYXRhLnZhbF90eXBlID09IDIpIHtcbiAgICAgICAgb3B0aW9uID0gJChvcHRpb24pLmF0dHIoJ2NvZGUnLCBkYXRhLmxpc3RbaV0pO1xuICAgICAgfVxuICAgICAgaW5wdXQuYXBwZW5kKG9wdGlvbilcbiAgICB9XG5cbiAgICBpbnB1dC5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgICAgZGF0YSA9IHRoaXM7XG4gICAgICB2YXIgdmFsID0gZGF0YS5lbC52YWwoKTtcbiAgICAgIHZhciBzbF9vcCA9IGRhdGEuZWwuZmluZCgnb3B0aW9uW3ZhbHVlPScgKyB2YWwgKyAnXScpO1xuICAgICAgdmFyIGNscyA9IHNsX29wLnRleHQoKTtcbiAgICAgIHZhciBjaCA9IHNsX29wLmF0dHIoJ2NvZGUnKTtcbiAgICAgIGlmICghY2gpY2ggPSBjbHM7XG4gICAgICBpZiAoZGF0YS5pbmRleCAhPT0gZmFsc2UpIHtcbiAgICAgICAgc2xpZGVyX2RhdGFbMF1bZGF0YS5ncl1bZGF0YS5pbmRleF1bZGF0YS5wYXJhbV0gPSB2YWw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzbGlkZXJfZGF0YVswXVtkYXRhLmdyXVtkYXRhLnBhcmFtXSA9IHZhbDtcbiAgICAgIH1cblxuICAgICAgZGF0YS5vYmoucmVtb3ZlQ2xhc3MoZGF0YS5wcmVmaXggKyBkYXRhLmVsLmF0dHIoJ3RfdmFsJykpO1xuICAgICAgZGF0YS5vYmouYWRkQ2xhc3MoZGF0YS5wcmVmaXggKyBjaCk7XG4gICAgICBkYXRhLmVsLmF0dHIoJ3RfdmFsJywgY2gpO1xuXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXG4gICAgfS5iaW5kKHtcbiAgICAgIGVsOiBpbnB1dCxcbiAgICAgIG9iajogZGF0YS5vYmosXG4gICAgICBncjogZGF0YS5ncixcbiAgICAgIGluZGV4OiBkYXRhLmluZGV4LFxuICAgICAgcGFyYW06IGRhdGEucGFyYW0sXG4gICAgICBwcmVmaXg6IGRhdGEucHJlZml4IHx8ICcnXG4gICAgfSkpO1xuXG4gICAgaWYgKGRhdGEucGFyZW50KSB7XG4gICAgICB2YXIgcGFyZW50ID0gJCgnPCcgKyBkYXRhLnBhcmVudCArICcvPicpO1xuICAgICAgcGFyZW50LmFwcGVuZChpbnB1dCk7XG4gICAgICByZXR1cm4gcGFyZW50O1xuICAgIH1cbiAgICByZXR1cm4gaW5wdXQ7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRTZWxBbmltYXRpb25Db250cm9sbChkYXRhKSB7XG4gICAgdmFyIGFuaW1fc2VsID0gW107XG4gICAgdmFyIG91dDtcblxuICAgIGlmIChkYXRhLnR5cGUgPT0gMCkge1xuICAgICAgYW5pbV9zZWwucHVzaCgnPHNwYW4+U2hvdyBhbmltYXRpb248L3NwYW4+Jyk7XG4gICAgfVxuICAgIGFuaW1fc2VsLnB1c2goZ2VuU2VsZWN0KHtcbiAgICAgIGxpc3Q6IHNob3dfYW5pbWF0aW9ucyxcbiAgICAgIHZhbF90eXBlOiAwLFxuICAgICAgb2JqOiBkYXRhLm9iaixcbiAgICAgIGdyOiBkYXRhLmdyLFxuICAgICAgaW5kZXg6IGRhdGEuaW5kZXgsXG4gICAgICBwYXJhbTogJ3Nob3dfYW5pbWF0aW9uJyxcbiAgICAgIHByZWZpeDogJ3NsaWRlXycsXG4gICAgICBwYXJlbnQ6IGRhdGEucGFyZW50XG4gICAgfSkpO1xuICAgIGlmIChkYXRhLnR5cGUgPT0gMCkge1xuICAgICAgYW5pbV9zZWwucHVzaCgnPHNwYW4+U2hvdyBkZWxheTwvc3Bhbj4nKTtcbiAgICB9XG4gICAgYW5pbV9zZWwucHVzaChnZW5TZWxlY3Qoe1xuICAgICAgbGlzdDogc2hvd19kZWxheSxcbiAgICAgIHZhbF90eXBlOiAxLFxuICAgICAgb2JqOiBkYXRhLm9iaixcbiAgICAgIGdyOiBkYXRhLmdyLFxuICAgICAgaW5kZXg6IGRhdGEuaW5kZXgsXG4gICAgICBwYXJhbTogJ3Nob3dfZGVsYXknLFxuICAgICAgcHJlZml4OiAnc2xpZGVfJyxcbiAgICAgIHBhcmVudDogZGF0YS5wYXJlbnRcbiAgICB9KSk7XG5cbiAgICBpZiAoZGF0YS50eXBlID09IDApIHtcbiAgICAgIGFuaW1fc2VsLnB1c2goJzxici8+Jyk7XG4gICAgICBhbmltX3NlbC5wdXNoKCc8c3Bhbj5IaWRlIGFuaW1hdGlvbjwvc3Bhbj4nKTtcbiAgICB9XG4gICAgYW5pbV9zZWwucHVzaChnZW5TZWxlY3Qoe1xuICAgICAgbGlzdDogaGlkZV9hbmltYXRpb25zLFxuICAgICAgdmFsX3R5cGU6IDAsXG4gICAgICBvYmo6IGRhdGEub2JqLFxuICAgICAgZ3I6IGRhdGEuZ3IsXG4gICAgICBpbmRleDogZGF0YS5pbmRleCxcbiAgICAgIHBhcmFtOiAnaGlkZV9hbmltYXRpb24nLFxuICAgICAgcHJlZml4OiAnc2xpZGVfJyxcbiAgICAgIHBhcmVudDogZGF0YS5wYXJlbnRcbiAgICB9KSk7XG4gICAgaWYgKGRhdGEudHlwZSA9PSAwKSB7XG4gICAgICBhbmltX3NlbC5wdXNoKCc8c3Bhbj5IaWRlIGRlbGF5PC9zcGFuPicpO1xuICAgIH1cbiAgICBhbmltX3NlbC5wdXNoKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OiBoaWRlX2RlbGF5LFxuICAgICAgdmFsX3R5cGU6IDEsXG4gICAgICBvYmo6IGRhdGEub2JqLFxuICAgICAgZ3I6IGRhdGEuZ3IsXG4gICAgICBpbmRleDogZGF0YS5pbmRleCxcbiAgICAgIHBhcmFtOiAnaGlkZV9kZWxheScsXG4gICAgICBwcmVmaXg6ICdzbGlkZV8nLFxuICAgICAgcGFyZW50OiBkYXRhLnBhcmVudFxuICAgIH0pKTtcblxuICAgIGlmIChkYXRhLnR5cGUgPT0gMCkge1xuICAgICAgb3V0ID0gJCgnPGRpdiBjbGFzcz1cImFuaW1fc2VsXCIvPicpO1xuICAgICAgb3V0LmFwcGVuZChhbmltX3NlbCk7XG4gICAgfVxuICAgIGlmIChkYXRhLnR5cGUgPT0gMSkge1xuICAgICAgb3V0ID0gYW5pbV9zZWw7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRfZWRpdG9yKCkge1xuICAgICQoJyN3MScpLnJlbW92ZSgpO1xuICAgICQoJyN3MV9idXR0b24nKS5yZW1vdmUoKTtcbiAgICBzbGlkZXJfZGF0YVswXS5tb2JpbGUgPSBzbGlkZXJfZGF0YVswXS5tb2JpbGUuc3BsaXQoJz8nKVswXTtcblxuICAgIHZhciBlbCA9ICQoJyNtZWdhX3NsaWRlcl9jb250cm9sZScpO1xuICAgIHZhciBidG5zX2JveCA9ICQoJzxkaXYgY2xhc3M9XCJidG5fYm94XCIvPicpO1xuXG4gICAgZWwuYXBwZW5kKCc8aDI+0KPQv9GA0LDQstC70LXQvdC40LU8L2gyPicpO1xuICAgIGVsLmFwcGVuZCgkKCc8dGV4dGFyZWEvPicsIHtcbiAgICAgIHRleHQ6IEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSxcbiAgICAgIGlkOiAnc2xpZGVfZGF0YScsXG4gICAgICBuYW1lOiBlZGl0b3JcbiAgICB9KSk7XG5cbiAgICB2YXIgYnRuID0gJCgnPGJ1dHRvbiBjbGFzcz1cIlwiLz4nKS50ZXh0KFwi0JDQutGC0LjQstC40YDQvtCy0LDRgtGMINGB0LvQsNC50LRcIik7XG4gICAgYnRuc19ib3guYXBwZW5kKGJ0bik7XG4gICAgYnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAkKCcjbWVnYV9zbGlkZXIgLnNsaWRlJykuZXEoMCkuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5yZW1vdmVDbGFzcygnaGlkZV9zbGlkZScpO1xuICAgIH0pO1xuXG4gICAgdmFyIGJ0biA9ICQoJzxidXR0b24gY2xhc3M9XCJcIi8+JykudGV4dChcItCU0LXQsNC60YLQuNCy0LjRgNC+0LLQsNGC0Ywg0YHQu9Cw0LnQtFwiKTtcbiAgICBidG5zX2JveC5hcHBlbmQoYnRuKTtcbiAgICBidG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGUnKS5lcSgwKS5yZW1vdmVDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLmFkZENsYXNzKCdoaWRlX3NsaWRlJyk7XG4gICAgfSk7XG4gICAgZWwuYXBwZW5kKGJ0bnNfYm94KTtcblxuICAgIGVsLmFwcGVuZCgnPGgyPtCe0LHRidC40LUg0L/QsNGA0LDQvNC10YLRgNGLPC9oMj4nKTtcbiAgICBlbC5hcHBlbmQoZ2VuSW5wdXQoe1xuICAgICAgdmFsdWU6IHNsaWRlcl9kYXRhWzBdLm1vYmlsZSxcbiAgICAgIGxhYmVsOiBcItCh0LvQsNC50LQg0LTQu9GPINGC0LXQu9C10YTQvtC90LBcIixcbiAgICAgIGlucHV0Q2xhc3M6IFwiZmlsZVNlbGVjdFwiLFxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0ubW9iaWxlID0gJCh0aGlzKS52YWwoKVxuICAgICAgICAkKCcubW9iX2JnJykuZXEoMCkuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgc2xpZGVyX2RhdGFbMF0ubW9iaWxlICsgJyknKTtcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxuICAgICAgfVxuICAgIH0pKTtcblxuICAgIGVsLmFwcGVuZChnZW5JbnB1dCh7XG4gICAgICB2YWx1ZTogc2xpZGVyX2RhdGFbMF0uZm9uLFxuICAgICAgbGFiZWw6IFwi0J7RgdC90L7QvdC+0Lkg0YTQvtC9XCIsXG4gICAgICBpbnB1dENsYXNzOiBcImZpbGVTZWxlY3RcIixcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLmZvbiA9ICQodGhpcykudmFsKClcbiAgICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZScpLmVxKDApLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIHNsaWRlcl9kYXRhWzBdLmZvbiArICcpJylcbiAgICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkoc2xpZGVyX2RhdGFbMF0pKVxuICAgICAgfVxuICAgIH0pKTtcblxuICAgIHZhciBidG5fY2ggPSAkKCc8ZGl2IGNsYXNzPVwiYnRuc1wiLz4nKTtcbiAgICBidG5fY2guYXBwZW5kKCc8aDM+0JrQvdC+0L/QutCwINC/0LXRgNC10YXQvtC00LAo0LTQu9GPINCf0Jog0LLQtdGA0YHQuNC4KTwvaDM+Jyk7XG4gICAgYnRuX2NoLmFwcGVuZChnZW5JbnB1dCh7XG4gICAgICB2YWx1ZTogc2xpZGVyX2RhdGFbMF0uYnV0dG9uLnRleHQsXG4gICAgICBsYWJlbDogXCLQotC10LrRgdGCXCIsXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBzbGlkZXJfZGF0YVswXS5idXR0b24udGV4dCA9ICQodGhpcykudmFsKCk7XG4gICAgICAgICQoJyNtZWdhX3NsaWRlciAuc2xpZGVyX19ocmVmJykuZXEoMCkudGV4dChzbGlkZXJfZGF0YVswXS5idXR0b24udGV4dCk7XG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcbiAgICAgIH0sXG4gICAgfSkpO1xuXG4gICAgdmFyIGJ1dF9zbCA9ICQoJyNtZWdhX3NsaWRlciAuc2xpZGVyX19ocmVmJykuZXEoMCk7XG4gICAgYnRuX2NoLmFwcGVuZChnZW5JbnB1dCh7XG4gICAgICB2YWx1ZTogc2xpZGVyX2RhdGFbMF0uYnV0dG9uLmhyZWYsXG4gICAgICBsYWJlbDogXCLQodGB0YvQu9C60LBcIixcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHNsaWRlcl9kYXRhWzBdLmJ1dHRvbi5ocmVmID0gJCh0aGlzKS52YWwoKTtcbiAgICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5zbGlkZXJfX2hyZWYnKS5lcSgwKS5hdHRyKCdocmVmJyxzbGlkZXJfZGF0YVswXS5idXR0b24uaHJlZik7XG4gICAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHNsaWRlcl9kYXRhWzBdKSlcbiAgICAgIH0sXG4gICAgfSkpO1xuXG4gICAgYnRuX2NoLmFwcGVuZCgnPGJyLz4nKTtcbiAgICB2YXIgd3JhcF9sYWIgPSAkKCc8bGFiZWwvPicpO1xuICAgIGJ0bl9jaC5hcHBlbmQod3JhcF9sYWIpO1xuICAgIHdyYXBfbGFiLmFwcGVuZCgnPHNwYW4+0J7RhNC+0YDQvNC70LXQvdC40LUg0LrQvdC+0L/QutC4PC9zcGFuPicpO1xuICAgIHdyYXBfbGFiLmFwcGVuZChnZW5TZWxlY3Qoe1xuICAgICAgbGlzdDogYnRuX3N0eWxlLFxuICAgICAgdmFsX3R5cGU6IDAsXG4gICAgICBvYmo6IGJ1dF9zbCxcbiAgICAgIGdyOiAnYnV0dG9uJyxcbiAgICAgIGluZGV4OiBmYWxzZSxcbiAgICAgIHBhcmFtOiAnY29sb3InXG4gICAgfSkpO1xuXG4gICAgYnRuX2NoLmFwcGVuZCgnPGJyLz4nKTtcbiAgICB3cmFwX2xhYiA9ICQoJzxsYWJlbC8+Jyk7XG4gICAgYnRuX2NoLmFwcGVuZCh3cmFwX2xhYik7XG4gICAgd3JhcF9sYWIuYXBwZW5kKCc8c3Bhbj7Qn9C+0LvQvtC20LXQvdC40LUg0LrQvdC+0L/QutC4PC9zcGFuPicpO1xuICAgIHdyYXBfbGFiLmFwcGVuZChnZW5TZWxlY3Qoe1xuICAgICAgbGlzdDogcG9zQXJyLFxuICAgICAgdmFsX2xpc3Q6IHBvc19saXN0LFxuICAgICAgdmFsX3R5cGU6IDIsXG4gICAgICBvYmo6IGJ1dF9zbC5wYXJlbnQoKS5wYXJlbnQoKSxcbiAgICAgIGdyOiAnYnV0dG9uJyxcbiAgICAgIGluZGV4OiBmYWxzZSxcbiAgICAgIHBhcmFtOiAncG9zJ1xuICAgIH0pKTtcblxuICAgIGJ0bl9jaC5hcHBlbmQoZ2V0U2VsQW5pbWF0aW9uQ29udHJvbGwoe1xuICAgICAgdHlwZTogMCxcbiAgICAgIG9iajogYnV0X3NsLnBhcmVudCgpLFxuICAgICAgZ3I6ICdidXR0b24nLFxuICAgICAgaW5kZXg6IGZhbHNlXG4gICAgfSkpO1xuICAgIGVsLmFwcGVuZChidG5fY2gpO1xuXG4gICAgdmFyIGxheWVyID0gJCgnPGRpdiBjbGFzcz1cImZpeGVkX2xheWVyXCIvPicpO1xuICAgIGxheWVyLmFwcGVuZCgnPGgyPtCh0YLQsNGC0LjRh9C10YHQutC40LUg0YHQu9C+0Lg8L2gyPicpO1xuICAgIHZhciB0aCA9IFwiPHRoPuKEljwvdGg+XCIgK1xuICAgICAgXCI8dGg+0JrQsNGA0YLQuNC90LrQsDwvdGg+XCIgK1xuICAgICAgXCI8dGg+0J/QvtC70L7QttC10L3QuNC1PC90aD5cIiArXG4gICAgICBcIjx0aD7QodC70L7QuSDQvdCwINCy0YHRjiDQstGL0YHQvtGC0YM8L3RoPlwiICtcbiAgICAgIFwiPHRoPtCQ0L3QuNC80LDRhtC40Y8g0L/QvtGP0LLQu9C10L3QuNGPPC90aD5cIiArXG4gICAgICBcIjx0aD7Ql9Cw0LTQtdGA0LbQutCwINC/0L7Rj9Cy0LvQtdC90LjRjzwvdGg+XCIgK1xuICAgICAgXCI8dGg+0JDQvdC40LzQsNGG0LjRjyDQuNGB0YfQtdC30L3QvtCy0LXQvdC40Y88L3RoPlwiICtcbiAgICAgIFwiPHRoPtCX0LDQtNC10YDQttC60LAg0LjRgdGH0LXQt9C90L7QstC10L3QuNGPPC90aD5cIiArXG4gICAgICBcIjx0aD7QlNC10LnRgdGC0LLQuNC1PC90aD5cIjtcbiAgICBzdFRhYmxlID0gJCgnPHRhYmxlIGJvcmRlcj1cIjFcIj48dHI+JyArIHRoICsgJzwvdHI+PC90YWJsZT4nKTtcbiAgICAvL9C10YHQu9C4INC10YHRgtGMINC/0LDRgNCw0LvQsNC60YEg0YHQu9C+0Lgg0LfQsNC/0L7Qu9C90Y/QtdC8XG4gICAgdmFyIGRhdGEgPSBzbGlkZXJfZGF0YVswXS5maXhlZDtcbiAgICBpZiAoZGF0YSAmJiBkYXRhLmxlbmd0aCA+IDApIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICBhZGRUclN0YXRpYyhkYXRhW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbGF5ZXIuYXBwZW5kKHN0VGFibGUpO1xuICAgIHZhciBhZGRCdG4gPSAkKCc8YnV0dG9uLz4nLCB7XG4gICAgICB0ZXh0OiBcItCU0L7QsdCw0LLQuNGC0Ywg0YHQu9C+0LlcIlxuICAgIH0pO1xuICAgIGFkZEJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgZGF0YSA9IGFkZFRyU3RhdGljKGZhbHNlKTtcbiAgICAgIGluaXRJbWFnZVNlcnZlclNlbGVjdChkYXRhLmVkaXRvci5maW5kKCcuZmlsZVNlbGVjdCcpKTtcbiAgICAgICQoJ3RleHRhcmVhI3NsaWRlX2RhdGEnKS50ZXh0KEpTT04uc3RyaW5naWZ5KHRoaXMuc2xpZGVyX2RhdGFbMF0pKVxuICAgIH0uYmluZCh7XG4gICAgICBzbGlkZXJfZGF0YTogc2xpZGVyX2RhdGFcbiAgICB9KSk7XG4gICAgbGF5ZXIuYXBwZW5kKGFkZEJ0bik7XG4gICAgZWwuYXBwZW5kKGxheWVyKTtcblxuICAgIHZhciBsYXllciA9ICQoJzxkaXYgY2xhc3M9XCJwYXJhbGF4X2xheWVyXCIvPicpO1xuICAgIGxheWVyLmFwcGVuZCgnPGgyPtCf0LDRgNCw0LvQsNC60YEg0YHQu9C+0Lg8L2gyPicpO1xuICAgIHZhciB0aCA9IFwiPHRoPuKEljwvdGg+XCIgK1xuICAgICAgXCI8dGg+0JrQsNGA0YLQuNC90LrQsDwvdGg+XCIgK1xuICAgICAgXCI8dGg+0J/QvtC70L7QttC10L3QuNC1PC90aD5cIiArXG4gICAgICBcIjx0aD7Qo9C00LDQu9C10L3QvdC+0YHRgtGMICjRhtC10LvQvtC1INC/0L7Qu9C+0LbQuNGC0LXQu9GM0L3QvtC1INGH0LjRgdC70L4pPC90aD5cIiArXG4gICAgICBcIjx0aD7QlNC10LnRgdGC0LLQuNC1PC90aD5cIjtcblxuICAgIHBhcmFsYXhUYWJsZSA9ICQoJzx0YWJsZSBib3JkZXI9XCIxXCI+PHRyPicgKyB0aCArICc8L3RyPjwvdGFibGU+Jyk7XG4gICAgLy/QtdGB0LvQuCDQtdGB0YLRjCDQv9Cw0YDQsNC70LDQutGBINGB0LvQvtC4INC30LDQv9C+0LvQvdGP0LXQvFxuICAgIHZhciBkYXRhID0gc2xpZGVyX2RhdGFbMF0ucGFyYWxheDtcbiAgICBpZiAoZGF0YSAmJiBkYXRhLmxlbmd0aCA+IDApIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICBhZGRUclBhcmFsYXgoZGF0YVtpXSk7XG4gICAgICB9XG4gICAgfVxuICAgIGxheWVyLmFwcGVuZChwYXJhbGF4VGFibGUpO1xuICAgIHZhciBhZGRCdG4gPSAkKCc8YnV0dG9uLz4nLCB7XG4gICAgICB0ZXh0OiBcItCU0L7QsdCw0LLQuNGC0Ywg0YHQu9C+0LlcIlxuICAgIH0pO1xuICAgIGFkZEJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgZGF0YSA9IGFkZFRyUGFyYWxheChmYWxzZSk7XG4gICAgICBpbml0SW1hZ2VTZXJ2ZXJTZWxlY3QoZGF0YS5lZGl0b3IuZmluZCgnLmZpbGVTZWxlY3QnKSk7XG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcbiAgICB9LmJpbmQoe1xuICAgICAgc2xpZGVyX2RhdGE6IHNsaWRlcl9kYXRhXG4gICAgfSkpO1xuXG4gICAgbGF5ZXIuYXBwZW5kKGFkZEJ0bik7XG4gICAgZWwuYXBwZW5kKGxheWVyKTtcblxuICAgIGluaXRJbWFnZVNlcnZlclNlbGVjdChlbC5maW5kKCcuZmlsZVNlbGVjdCcpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFRyU3RhdGljKGRhdGEpIHtcbiAgICB2YXIgaSA9IHN0VGFibGUuZmluZCgndHInKS5sZW5ndGggLSAxO1xuICAgIGlmICghZGF0YSkge1xuICAgICAgZGF0YSA9IHtcbiAgICAgICAgXCJpbWdcIjogXCJcIixcbiAgICAgICAgXCJmdWxsX2hlaWdodFwiOiAwLFxuICAgICAgICBcInBvc1wiOiAwLFxuICAgICAgICBcInNob3dfZGVsYXlcIjogMSxcbiAgICAgICAgXCJzaG93X2FuaW1hdGlvblwiOiBcImxpZ2h0U3BlZWRJblwiLFxuICAgICAgICBcImhpZGVfZGVsYXlcIjogMSxcbiAgICAgICAgXCJoaWRlX2FuaW1hdGlvblwiOiBcImJvdW5jZU91dFwiXG4gICAgICB9O1xuICAgICAgc2xpZGVyX2RhdGFbMF0uZml4ZWQucHVzaChkYXRhKTtcbiAgICAgIHZhciBmaXggPSAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwJyk7XG4gICAgICBhZGRTdGF0aWNMYXllcihkYXRhLCBmaXgsIHRydWUpO1xuICAgIH1cbiAgICA7XG5cbiAgICB2YXIgdHIgPSAkKCc8dHIvPicpO1xuICAgIHRyLmFwcGVuZCgnPHRkIGNsYXNzPVwidGRfY291bnRlclwiLz4nKTtcbiAgICB0ci5hcHBlbmQoZ2VuSW5wdXQoe1xuICAgICAgdmFsdWU6IGRhdGEuaW1nLFxuICAgICAgbGFiZWw6IGZhbHNlLFxuICAgICAgcGFyZW50OiAndGQnLFxuICAgICAgaW5wdXRDbGFzczogXCJmaWxlU2VsZWN0XCIsXG4gICAgICBiaW5kOiB7XG4gICAgICAgIGdyOiAnZml4ZWQnLFxuICAgICAgICBpbmRleDogaSxcbiAgICAgICAgcGFyYW06ICdpbWcnLFxuICAgICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLmZpbmQoJy5hbmltYXRpb25fbGF5ZXInKSxcbiAgICAgIH0sXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXM7XG4gICAgICAgIGRhdGEub2JqLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuaW5wdXQudmFsKCkgKyAnKScpO1xuICAgICAgICBzbGlkZXJfZGF0YVswXS5maXhlZFtkYXRhLmluZGV4XS5pbWcgPSBkYXRhLmlucHV0LnZhbCgpO1xuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXG4gICAgICB9XG4gICAgfSkpO1xuICAgIHRyLmFwcGVuZChnZW5TZWxlY3Qoe1xuICAgICAgbGlzdDogcG9zQXJyLFxuICAgICAgdmFsX2xpc3Q6IHBvc19saXN0LFxuICAgICAgdmFsX3R5cGU6IDIsXG4gICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLFxuICAgICAgZ3I6ICdmaXhlZCcsXG4gICAgICBpbmRleDogaSxcbiAgICAgIHBhcmFtOiAncG9zJyxcbiAgICAgIHBhcmVudDogJ3RkJyxcbiAgICB9KSk7XG4gICAgdHIuYXBwZW5kKGdlblNlbGVjdCh7XG4gICAgICBsaXN0OiB5ZXNfbm9fdmFsLFxuICAgICAgdmFsX2xpc3Q6IHllc19ub19hcnIsXG4gICAgICB2YWxfdHlwZTogMixcbiAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSksXG4gICAgICBncjogJ2ZpeGVkJyxcbiAgICAgIGluZGV4OiBpLFxuICAgICAgcGFyYW06ICdmdWxsX2hlaWdodCcsXG4gICAgICBwYXJlbnQ6ICd0ZCcsXG4gICAgfSkpO1xuICAgIHRyLmFwcGVuZChnZXRTZWxBbmltYXRpb25Db250cm9sbCh7XG4gICAgICB0eXBlOiAxLFxuICAgICAgb2JqOiAkKCcjbWVnYV9zbGlkZXIgLmZpeGVkX2dyb3VwIC5maXhlZF9fbGF5ZXInKS5lcShpKS5maW5kKCcuYW5pbWF0aW9uX2xheWVyJyksXG4gICAgICBncjogJ2ZpeGVkJyxcbiAgICAgIGluZGV4OiBpLFxuICAgICAgcGFyZW50OiAndGQnXG4gICAgfSkpO1xuICAgIHZhciBkZWxCdG4gPSAkKCc8YnV0dG9uLz4nLCB7XG4gICAgICB0ZXh0OiBcItCj0LTQsNC70LjRgtGMXCJcbiAgICB9KTtcbiAgICBkZWxCdG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcy5lbCk7XG4gICAgICBpID0gJHRoaXMuY2xvc2VzdCgndHInKS5pbmRleCgpIC0gMTtcbiAgICAgICQoJyNtZWdhX3NsaWRlciAuZml4ZWRfZ3JvdXAgLmZpeGVkX19sYXllcicpLmVxKGkpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0LvQvtC5INC90LAg0YHQu9Cw0LnQtNC10YDQtVxuICAgICAgJHRoaXMuY2xvc2VzdCgndHInKS5yZW1vdmUoKTsgLy/Rg9C00LDQu9GP0LXQvCDRgdGC0YDQvtC60YMg0LIg0YLQsNCx0LvQuNGG0LVcbiAgICAgIHRoaXMuc2xpZGVyX2RhdGFbMF0uZml4ZWQuc3BsaWNlKGksIDEpOyAvL9GD0LTQsNC70Y/QtdC8INC40Lcg0LrQvtC90YTQuNCz0LAg0YHQu9Cw0LnQtNCwXG4gICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeSh0aGlzLnNsaWRlcl9kYXRhWzBdKSlcbiAgICB9LmJpbmQoe1xuICAgICAgZWw6IGRlbEJ0bixcbiAgICAgIHNsaWRlcl9kYXRhOiBzbGlkZXJfZGF0YVxuICAgIH0pKTtcbiAgICB2YXIgZGVsQnRuVGQgPSAkKCc8dGQvPicpLmFwcGVuZChkZWxCdG4pO1xuICAgIHRyLmFwcGVuZChkZWxCdG5UZCk7XG4gICAgc3RUYWJsZS5hcHBlbmQodHIpXG5cbiAgICByZXR1cm4ge1xuICAgICAgZWRpdG9yOiB0cixcbiAgICAgIGRhdGE6IGRhdGFcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBhZGRUclBhcmFsYXgoZGF0YSkge1xuICAgIHZhciBpID0gcGFyYWxheFRhYmxlLmZpbmQoJ3RyJykubGVuZ3RoIC0gMTtcbiAgICBpZiAoIWRhdGEpIHtcbiAgICAgIGRhdGEgPSB7XG4gICAgICAgIFwiaW1nXCI6IFwiXCIsXG4gICAgICAgIFwielwiOiAxXG4gICAgICB9O1xuICAgICAgc2xpZGVyX2RhdGFbMF0ucGFyYWxheC5wdXNoKGRhdGEpO1xuICAgICAgdmFyIHBhcmFsYXhfZ3IgPSAkKCcjbWVnYV9zbGlkZXIgLnBhcmFsbGF4X19ncm91cCcpO1xuICAgICAgYWRkUGFyYWxheExheWVyKGRhdGEsIHBhcmFsYXhfZ3IpO1xuICAgIH1cbiAgICA7XG4gICAgdmFyIHRyID0gJCgnPHRyLz4nKTtcbiAgICB0ci5hcHBlbmQoJzx0ZCBjbGFzcz1cInRkX2NvdW50ZXJcIi8+Jyk7XG4gICAgdHIuYXBwZW5kKGdlbklucHV0KHtcbiAgICAgIHZhbHVlOiBkYXRhLmltZyxcbiAgICAgIGxhYmVsOiBmYWxzZSxcbiAgICAgIHBhcmVudDogJ3RkJyxcbiAgICAgIGlucHV0Q2xhc3M6IFwiZmlsZVNlbGVjdFwiLFxuICAgICAgYmluZDoge1xuICAgICAgICBpbmRleDogaSxcbiAgICAgICAgcGFyYW06ICdpbWcnLFxuICAgICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwIC5wYXJhbGxheF9fbGF5ZXInKS5lcShpKS5maW5kKCdzcGFuJyksXG4gICAgICB9LFxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzO1xuICAgICAgICBkYXRhLm9iai5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLmlucHV0LnZhbCgpICsgJyknKTtcbiAgICAgICAgc2xpZGVyX2RhdGFbMF0ucGFyYWxheFtkYXRhLmluZGV4XS5pbWcgPSBkYXRhLmlucHV0LnZhbCgpO1xuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXG4gICAgICB9XG4gICAgfSkpO1xuICAgIHRyLmFwcGVuZChnZW5TZWxlY3Qoe1xuICAgICAgbGlzdDogcG9zQXJyLFxuICAgICAgdmFsX2xpc3Q6IHBvc19saXN0LFxuICAgICAgdmFsX3R5cGU6IDIsXG4gICAgICBvYmo6ICQoJyNtZWdhX3NsaWRlciAucGFyYWxsYXhfX2dyb3VwIC5wYXJhbGxheF9fbGF5ZXInKS5lcShpKS5maW5kKCdzcGFuJyksXG4gICAgICBncjogJ3BhcmFsYXgnLFxuICAgICAgaW5kZXg6IGksXG4gICAgICBwYXJhbTogJ3BvcycsXG4gICAgICBwYXJlbnQ6ICd0ZCcsXG4gICAgICBzdGFydF9vcHRpb246ICc8b3B0aW9uIHZhbHVlPVwiXCIgY29kZT1cIlwiPtC90LAg0LLQtdGB0Ywg0Y3QutGA0LDQvTwvb3B0aW9uPidcbiAgICB9KSk7XG4gICAgdHIuYXBwZW5kKGdlbklucHV0KHtcbiAgICAgIHZhbHVlOiBkYXRhLnosXG4gICAgICBsYWJlbDogZmFsc2UsXG4gICAgICBwYXJlbnQ6ICd0ZCcsXG4gICAgICBiaW5kOiB7XG4gICAgICAgIGluZGV4OiBpLFxuICAgICAgICBwYXJhbTogJ2ltZycsXG4gICAgICAgIG9iajogJCgnI21lZ2Ffc2xpZGVyIC5wYXJhbGxheF9fZ3JvdXAgLnBhcmFsbGF4X19sYXllcicpLmVxKGkpLFxuICAgICAgfSxcbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciBkYXRhID0gdGhpcztcbiAgICAgICAgZGF0YS5vYmouYXR0cigneicsIGRhdGEuaW5wdXQudmFsKCkpO1xuICAgICAgICBzbGlkZXJfZGF0YVswXS5wYXJhbGF4W2RhdGEuaW5kZXhdLnogPSBkYXRhLmlucHV0LnZhbCgpO1xuICAgICAgICAkKCd0ZXh0YXJlYSNzbGlkZV9kYXRhJykudGV4dChKU09OLnN0cmluZ2lmeShzbGlkZXJfZGF0YVswXSkpXG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgdmFyIGRlbEJ0biA9ICQoJzxidXR0b24vPicsIHtcbiAgICAgIHRleHQ6IFwi0KPQtNCw0LvQuNGC0YxcIlxuICAgIH0pO1xuICAgIGRlbEJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdmFyICR0aGlzID0gJCh0aGlzLmVsKTtcbiAgICAgIGkgPSAkdGhpcy5jbG9zZXN0KCd0cicpLmluZGV4KCkgLSAxO1xuICAgICAgJCgnI21lZ2Ffc2xpZGVyIC5maXhlZF9ncm91cCAuZml4ZWRfX2xheWVyJykuZXEoaSkucmVtb3ZlKCk7IC8v0YPQtNCw0LvRj9C10Lwg0YHQu9C+0Lkg0L3QsCDRgdC70LDQudC00LXRgNC1XG4gICAgICAkdGhpcy5jbG9zZXN0KCd0cicpLnJlbW92ZSgpOyAvL9GD0LTQsNC70Y/QtdC8INGB0YLRgNC+0LrRgyDQsiDRgtCw0LHQu9C40YbQtVxuICAgICAgdGhpcy5zbGlkZXJfZGF0YVswXS5wYXJhbGF4LnNwbGljZShpLCAxKTsgLy/Rg9C00LDQu9GP0LXQvCDQuNC3INC60L7QvdGE0LjQs9CwINGB0LvQsNC50LTQsFxuICAgICAgJCgndGV4dGFyZWEjc2xpZGVfZGF0YScpLnRleHQoSlNPTi5zdHJpbmdpZnkodGhpcy5zbGlkZXJfZGF0YVswXSkpXG4gICAgfS5iaW5kKHtcbiAgICAgIGVsOiBkZWxCdG4sXG4gICAgICBzbGlkZXJfZGF0YTogc2xpZGVyX2RhdGFcbiAgICB9KSk7XG4gICAgdmFyIGRlbEJ0blRkID0gJCgnPHRkLz4nKS5hcHBlbmQoZGVsQnRuKTtcbiAgICB0ci5hcHBlbmQoZGVsQnRuVGQpO1xuICAgIHBhcmFsYXhUYWJsZS5hcHBlbmQodHIpXG5cbiAgICByZXR1cm4ge1xuICAgICAgZWRpdG9yOiB0cixcbiAgICAgIGRhdGE6IGRhdGFcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBhZGRfYW5pbWF0aW9uKGVsLCBkYXRhKSB7XG4gICAgdmFyIG91dCA9ICQoJzxkaXYvPicsIHtcbiAgICAgICdjbGFzcyc6ICdhbmltYXRpb25fbGF5ZXInXG4gICAgfSk7XG5cbiAgICBpZiAodHlwZW9mKGRhdGEuc2hvd19kZWxheSkgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIG91dC5hZGRDbGFzcyhzaG93X2RlbGF5W2RhdGEuc2hvd19kZWxheV0pO1xuICAgICAgaWYgKGRhdGEuc2hvd19hbmltYXRpb24pIHtcbiAgICAgICAgb3V0LmFkZENsYXNzKCdzbGlkZV8nICsgZGF0YS5zaG93X2FuaW1hdGlvbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZihkYXRhLmhpZGVfZGVsYXkpICE9ICd1bmRlZmluZWQnKSB7XG4gICAgICBvdXQuYWRkQ2xhc3MoaGlkZV9kZWxheVtkYXRhLmhpZGVfZGVsYXldKTtcbiAgICAgIGlmIChkYXRhLmhpZGVfYW5pbWF0aW9uKSB7XG4gICAgICAgIG91dC5hZGRDbGFzcygnc2xpZGVfJyArIGRhdGEuaGlkZV9hbmltYXRpb24pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGVsLmFwcGVuZChvdXQpO1xuICAgIHJldHVybiBlbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlX3NsaWRlKGRhdGEpIHtcbiAgICB2YXIgc2xpZGUgPSAkKCc8ZGl2IGNsYXNzPVwic2xpZGVcIi8+Jyk7XG5cbiAgICB2YXIgbW9iX2JnID0gJCgnPGEgY2xhc3M9XCJtb2JfYmdcIiBocmVmPVwiJyArIGRhdGEuYnV0dG9uLmhyZWYgKyAnXCIvPicpO1xuICAgIG1vYl9iZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLm1vYmlsZSArICcpJylcblxuICAgIHNsaWRlLmFwcGVuZChtb2JfYmcpO1xuICAgIGlmIChtb2JpbGVfbW9kZSkge1xuICAgICAgcmV0dXJuIHNsaWRlO1xuICAgIH1cblxuICAgIC8v0LXRgdC70Lgg0LXRgdGC0Ywg0YTQvtC9INGC0L4g0LfQsNC/0L7Qu9C90Y/QtdC8XG4gICAgaWYgKGRhdGEuZm9uKSB7XG4gICAgICBzbGlkZS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLmZvbiArICcpJylcbiAgICB9XG5cbiAgICAvL9C10YHQu9C4INC10YHRgtGMINC/0LDRgNCw0LvQsNC60YEg0YHQu9C+0Lgg0LfQsNC/0L7Qu9C90Y/QtdC8XG4gICAgaWYgKGRhdGEucGFyYWxheCAmJiBkYXRhLnBhcmFsYXgubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIHBhcmFsYXhfZ3IgPSAkKCc8ZGl2IGNsYXNzPVwicGFyYWxsYXhfX2dyb3VwXCIvPicpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLnBhcmFsYXgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYWRkUGFyYWxheExheWVyKGRhdGEucGFyYWxheFtpXSwgcGFyYWxheF9ncilcbiAgICAgIH1cbiAgICAgIHNsaWRlLmFwcGVuZChwYXJhbGF4X2dyKVxuICAgIH1cblxuICAgIHZhciBmaXggPSAkKCc8ZGl2IGNsYXNzPVwiZml4ZWRfZ3JvdXBcIi8+Jyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmZpeGVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhZGRTdGF0aWNMYXllcihkYXRhLmZpeGVkW2ldLCBmaXgpXG4gICAgfVxuXG4gICAgdmFyIGRvcF9ibGsgPSAkKFwiPGRpdiBjbGFzcz0nZml4ZWRfX2xheWVyJy8+XCIpO1xuICAgIGRvcF9ibGsuYWRkQ2xhc3MocG9zQXJyW2RhdGEuYnV0dG9uLnBvc10pO1xuICAgIHZhciBidXQgPSAkKFwiPGEgY2xhc3M9J3NsaWRlcl9faHJlZicvPlwiKTtcbiAgICBidXQuYXR0cignaHJlZicsIGRhdGEuYnV0dG9uLmhyZWYpO1xuICAgIGJ1dC50ZXh0KGRhdGEuYnV0dG9uLnRleHQpO1xuICAgIGJ1dC5hZGRDbGFzcyhkYXRhLmJ1dHRvbi5jb2xvcik7XG4gICAgZG9wX2JsayA9IGFkZF9hbmltYXRpb24oZG9wX2JsaywgZGF0YS5idXR0b24pO1xuICAgIGRvcF9ibGsuZmluZCgnZGl2JykuYXBwZW5kKGJ1dCk7XG4gICAgZml4LmFwcGVuZChkb3BfYmxrKTtcblxuICAgIHNsaWRlLmFwcGVuZChmaXgpO1xuICAgIHJldHVybiBzbGlkZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFBhcmFsYXhMYXllcihkYXRhLCBwYXJhbGF4X2dyKSB7XG4gICAgdmFyIHBhcmFsbGF4X2xheWVyID0gJCgnPGRpdiBjbGFzcz1cInBhcmFsbGF4X19sYXllclwiXFw+Jyk7XG4gICAgcGFyYWxsYXhfbGF5ZXIuYXR0cigneicsIGRhdGEueiB8fCBpICogMTApO1xuICAgIHZhciBkb3BfYmxrID0gJChcIjxzcGFuIGNsYXNzPSdzbGlkZXJfX3RleHQnLz5cIik7XG4gICAgaWYgKGRhdGEucG9zKSB7XG4gICAgICBkb3BfYmxrLmFkZENsYXNzKHBvc0FycltkYXRhLnBvc10pO1xuICAgIH1cbiAgICBkb3BfYmxrLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuaW1nICsgJyknKTtcbiAgICBwYXJhbGxheF9sYXllci5hcHBlbmQoZG9wX2Jsayk7XG4gICAgcGFyYWxheF9nci5hcHBlbmQocGFyYWxsYXhfbGF5ZXIpO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkU3RhdGljTGF5ZXIoZGF0YSwgZml4LCBiZWZvcl9idXR0b24pIHtcbiAgICB2YXIgZG9wX2JsayA9ICQoXCI8ZGl2IGNsYXNzPSdmaXhlZF9fbGF5ZXInLz5cIik7XG4gICAgZG9wX2Jsay5hZGRDbGFzcyhwb3NBcnJbZGF0YS5wb3NdKTtcbiAgICBpZiAoZGF0YS5mdWxsX2hlaWdodCkge1xuICAgICAgZG9wX2Jsay5hZGRDbGFzcygnZml4ZWRfX2Z1bGwtaGVpZ2h0Jyk7XG4gICAgfVxuICAgIGRvcF9ibGsgPSBhZGRfYW5pbWF0aW9uKGRvcF9ibGssIGRhdGEpO1xuICAgIGRvcF9ibGsuZmluZCgnLmFuaW1hdGlvbl9sYXllcicpLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGRhdGEuaW1nICsgJyknKTtcblxuICAgIGlmIChiZWZvcl9idXR0b24pIHtcbiAgICAgIGZpeC5maW5kKCcuc2xpZGVyX19ocmVmJykuY2xvc2VzdCgnLmZpeGVkX19sYXllcicpLmJlZm9yZShkb3BfYmxrKVxuICAgIH0gZWxzZSB7XG4gICAgICBmaXguYXBwZW5kKGRvcF9ibGspXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbmV4dF9zbGlkZSgpIHtcbiAgICBpZiAoJCgnI21lZ2Ffc2xpZGVyJykuaGFzQ2xhc3MoJ3N0b3Bfc2xpZGUnKSlyZXR1cm47XG5cbiAgICB2YXIgc2xpZGVfcG9pbnRzID0gJCgnLnNsaWRlX3NlbGVjdF9ib3ggLnNsaWRlX3NlbGVjdCcpXG4gICAgdmFyIHNsaWRlX2NudCA9IHNsaWRlX3BvaW50cy5sZW5ndGg7XG4gICAgdmFyIGFjdGl2ZSA9ICQoJy5zbGlkZV9zZWxlY3RfYm94IC5zbGlkZXItYWN0aXZlJykuaW5kZXgoKSArIDE7XG4gICAgaWYgKGFjdGl2ZSA+PSBzbGlkZV9jbnQpYWN0aXZlID0gMDtcbiAgICBzbGlkZV9wb2ludHMuZXEoYWN0aXZlKS5jbGljaygpO1xuXG4gICAgdGltZW91dElkPXNldFRpbWVvdXQobmV4dF9zbGlkZSwgc2Nyb2xsX3BlcmlvZCk7XG4gIH1cblxuICBmdW5jdGlvbiBpbWdfdG9fbG9hZChzcmMpIHtcbiAgICB2YXIgaW1nID0gJCgnPGltZy8+Jyk7XG4gICAgaW1nLm9uKCdsb2FkJywgZnVuY3Rpb24gKCkge1xuICAgICAgdG90X2ltZ193YWl0LS07XG5cbiAgICAgIGlmICh0b3RfaW1nX3dhaXQgPT0gMCkge1xuXG4gICAgICAgIHNsaWRlcy5hcHBlbmQoZ2VuZXJhdGVfc2xpZGUoc2xpZGVyX2RhdGFbcmVuZGVyX3NsaWRlX25vbV0pKTtcbiAgICAgICAgc2xpZGVfc2VsZWN0X2JveC5maW5kKCdsaScpLmVxKHJlbmRlcl9zbGlkZV9ub20pLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuXG4gICAgICAgIGlmIChyZW5kZXJfc2xpZGVfbm9tID09IDApIHtcbiAgICAgICAgICBzbGlkZXMuZmluZCgnLnNsaWRlJylcbiAgICAgICAgICAgIC5hZGRDbGFzcygnZmlyc3Rfc2hvdycpXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcbiAgICAgICAgICBzbGlkZV9zZWxlY3RfYm94LmZpbmQoJ2xpJykuZXEoMCkuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcblxuICAgICAgICAgIGlmICghZWRpdG9yKSB7XG4gICAgICAgICAgICBpZih0aW1lb3V0SWQpY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICB0aW1lb3V0SWQ9c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICQodGhpcykuZmluZCgnLmZpcnN0X3Nob3cnKS5yZW1vdmVDbGFzcygnZmlyc3Rfc2hvdycpO1xuICAgICAgICAgICAgfS5iaW5kKHNsaWRlcyksIHNjcm9sbF9wZXJpb2QpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChtb2JpbGVfbW9kZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHBhcmFsbGF4X2dyb3VwID0gJChjb250YWluZXJfaWQgKyAnIC5zbGlkZXItYWN0aXZlIC5wYXJhbGxheF9fZ3JvdXA+KicpO1xuICAgICAgICAgICAgcGFyYWxsYXhfY291bnRlciA9IDA7XG4gICAgICAgICAgICBwYXJhbGxheF90aW1lciA9IHNldEludGVydmFsKHJlbmRlciwgMTAwKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoZWRpdG9yKSB7XG4gICAgICAgICAgICBpbml0X2VkaXRvcigpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmKHRpbWVvdXRJZCljbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQobmV4dF9zbGlkZSwgc2Nyb2xsX3BlcmlvZCk7XG5cbiAgICAgICAgICAgICQoJy5zbGlkZV9zZWxlY3RfYm94Jykub24oJ2NsaWNrJywgJy5zbGlkZV9zZWxlY3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgICAgICAgIGlmICgkdGhpcy5oYXNDbGFzcygnc2xpZGVyLWFjdGl2ZScpKXJldHVybjtcblxuICAgICAgICAgICAgICB2YXIgaW5kZXggPSAkdGhpcy5pbmRleCgpO1xuICAgICAgICAgICAgICAkKCcuc2xpZGVfc2VsZWN0X2JveCAuc2xpZGVyLWFjdGl2ZScpLnJlbW92ZUNsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG4gICAgICAgICAgICAgICR0aGlzLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7XG5cbiAgICAgICAgICAgICAgJChjb250YWluZXJfaWQgKyAnIC5zbGlkZS5zbGlkZXItYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgJChjb250YWluZXJfaWQgKyAnIC5zbGlkZScpLmVxKGluZGV4KS5hZGRDbGFzcygnc2xpZGVyLWFjdGl2ZScpO1xuXG4gICAgICAgICAgICAgIHBhcmFsbGF4X2dyb3VwID0gJChjb250YWluZXJfaWQgKyAnIC5zbGlkZXItYWN0aXZlIC5wYXJhbGxheF9fZ3JvdXA+KicpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICQoJyNtZWdhX3NsaWRlcicpLmhvdmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgaWYodGltZW91dElkKWNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICAgICAgICAkKCcjbWVnYV9zbGlkZXInKS5hZGRDbGFzcygnc3RvcF9zbGlkZScpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KG5leHRfc2xpZGUsIHNjcm9sbF9wZXJpb2QpO1xuICAgICAgICAgICAgICAkKCcjbWVnYV9zbGlkZXInKS5yZW1vdmVDbGFzcygnc3RvcF9zbGlkZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmVuZGVyX3NsaWRlX25vbSsrO1xuICAgICAgICBpZiAocmVuZGVyX3NsaWRlX25vbSA8IHNsaWRlcl9kYXRhLmxlbmd0aCkge1xuICAgICAgICAgIGxvYWRfc2xpZGVfaW1nKClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLm9uKCdlcnJvcicsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHRvdF9pbWdfd2FpdC0tO1xuICAgIH0pO1xuICAgIGltZy5wcm9wKCdzcmMnLCBzcmMpO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9hZF9zbGlkZV9pbWcoKSB7XG4gICAgdmFyIGRhdGEgPSBzbGlkZXJfZGF0YVtyZW5kZXJfc2xpZGVfbm9tXTtcbiAgICB0b3RfaW1nX3dhaXQgPSAxO1xuXG4gICAgaWYgKG1vYmlsZV9tb2RlID09PSBmYWxzZSkge1xuICAgICAgdG90X2ltZ193YWl0Kys7XG4gICAgICBpbWdfdG9fbG9hZChkYXRhLmZvbik7XG4gICAgICAvL9C10YHQu9C4INC10YHRgtGMINC/0LDRgNCw0LvQsNC60YEg0YHQu9C+0Lgg0LfQsNC/0L7Qu9C90Y/QtdC8XG4gICAgICBpZiAoZGF0YS5wYXJhbGF4ICYmIGRhdGEucGFyYWxheC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRvdF9pbWdfd2FpdCArPSBkYXRhLnBhcmFsYXgubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEucGFyYWxheC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGltZ190b19sb2FkKGRhdGEucGFyYWxheFtpXS5pbWcpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChkYXRhLmZpeGVkICYmIGRhdGEuZml4ZWQubGVuZ3RoID4gMCkge1xuICAgICAgICB0b3RfaW1nX3dhaXQgKz0gZGF0YS5maXhlZC5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5maXhlZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGltZ190b19sb2FkKGRhdGEuZml4ZWRbaV0uaW1nKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaW1nX3RvX2xvYWQoZGF0YS5tb2JpbGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RhcnRfaW5pdF9zbGlkZShkYXRhKSB7XG4gICAgdmFyIG4gPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICB2YXIgaW1nID0gJCgnPGltZy8+Jyk7XG4gICAgaW1nLmF0dHIoJ3RpbWUnLCBuKTtcblxuICAgIGZ1bmN0aW9uIG9uX2ltZ19sb2FkKCkge1xuICAgICAgdmFyIG4gPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgIGltZyA9ICQodGhpcyk7XG4gICAgICBuID0gbiAtIHBhcnNlSW50KGltZy5hdHRyKCd0aW1lJykpO1xuICAgICAgaWYgKG4gPiBtYXhfdGltZV9sb2FkX3BpYykge1xuICAgICAgICBtb2JpbGVfbW9kZSA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbWF4X3NpemUgPSAoc2NyZWVuLmhlaWdodCA+IHNjcmVlbi53aWR0aCA/IHNjcmVlbi5oZWlnaHQgOiBzY3JlZW4ud2lkdGgpO1xuICAgICAgICBpZiAobWF4X3NpemUgPCBtb2JpbGVfc2l6ZSkge1xuICAgICAgICAgIG1vYmlsZV9tb2RlID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtb2JpbGVfbW9kZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAobW9iaWxlX21vZGUgPT0gdHJ1ZSkge1xuICAgICAgICAkKGNvbnRhaW5lcl9pZCkuYWRkQ2xhc3MoJ21vYmlsZV9tb2RlJylcbiAgICAgIH1cbiAgICAgIHJlbmRlcl9zbGlkZV9ub20gPSAwO1xuICAgICAgbG9hZF9zbGlkZV9pbWcoKTtcbiAgICAgICQoJy5zay1mb2xkaW5nLWN1YmUnKS5yZW1vdmUoKTtcbiAgICB9O1xuXG4gICAgaW1nLm9uKCdsb2FkJywgb25faW1nX2xvYWQoKSk7XG4gICAgaWYgKHNsaWRlcl9kYXRhLmxlbmd0aCA+IDApIHtcbiAgICAgIHNsaWRlcl9kYXRhWzBdLm1vYmlsZSA9IHNsaWRlcl9kYXRhWzBdLm1vYmlsZSArICc/cj0nICsgTWF0aC5yYW5kb20oKTtcbiAgICAgIGltZy5wcm9wKCdzcmMnLCBzbGlkZXJfZGF0YVswXS5tb2JpbGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvbl9pbWdfbG9hZCgpLmJpbmQoaW1nKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbml0KGRhdGEsIGVkaXRvcl9pbml0KSB7XG4gICAgc2xpZGVyX2RhdGEgPSBkYXRhO1xuICAgIGVkaXRvciA9IGVkaXRvcl9pbml0O1xuICAgIC8v0L3QsNGF0L7QtNC40Lwg0LrQvtC90YLQtdC50L3QtdGAINC4INC+0YfQuNGJ0LDQtdC8INC10LPQvlxuICAgIHZhciBjb250YWluZXIgPSAkKGNvbnRhaW5lcl9pZCk7XG4gICAgY29udGFpbmVyLmh0bWwoJycpO1xuXG4gICAgLy/RgdC+0LfQttCw0LXQvCDQsdCw0LfQvtCy0YvQtSDQutC+0L3RgtC10LnQvdC10YDRiyDQtNC70Y8g0YHQsNC80LjRhSDRgdC70LDQudC00L7QsiDQuCDQtNC70Y8g0L/QtdGA0LXQutC70Y7Rh9Cw0YLQtdC70LXQuVxuICAgIHNsaWRlcyA9ICQoJzxkaXYvPicsIHtcbiAgICAgICdjbGFzcyc6ICdzbGlkZXMnXG4gICAgfSk7XG4gICAgdmFyIHNsaWRlX2NvbnRyb2wgPSAkKCc8ZGl2Lz4nLCB7XG4gICAgICAnY2xhc3MnOiAnc2xpZGVfY29udHJvbCdcbiAgICB9KTtcbiAgICBzbGlkZV9zZWxlY3RfYm94ID0gJCgnPHVsLz4nLCB7XG4gICAgICAnY2xhc3MnOiAnc2xpZGVfc2VsZWN0X2JveCdcbiAgICB9KTtcblxuICAgIC8v0LTQvtCx0LDQstC70Y/QtdC8INC40L3QtNC40LrQsNGC0L7RgCDQt9Cw0LPRgNGD0LfQutC4XG4gICAgdmFyIGwgPSAnPGRpdiBjbGFzcz1cInNrLWZvbGRpbmctY3ViZVwiPicgK1xuICAgICAgJzxkaXYgY2xhc3M9XCJzay1jdWJlMSBzay1jdWJlXCI+PC9kaXY+JyArXG4gICAgICAnPGRpdiBjbGFzcz1cInNrLWN1YmUyIHNrLWN1YmVcIj48L2Rpdj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwic2stY3ViZTQgc2stY3ViZVwiPjwvZGl2PicgK1xuICAgICAgJzxkaXYgY2xhc3M9XCJzay1jdWJlMyBzay1jdWJlXCI+PC9kaXY+JyArXG4gICAgICAnPC9kaXY+JztcbiAgICBjb250YWluZXIuaHRtbChsKTtcblxuXG4gICAgc3RhcnRfaW5pdF9zbGlkZShkYXRhWzBdKTtcblxuICAgIC8v0LPQtdC90LXRgNC40YDRg9C10Lwg0LrQvdC+0L/QutC4INC4INGB0LvQsNC50LTRi1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgLy9zbGlkZXMuYXBwZW5kKGdlbmVyYXRlX3NsaWRlKGRhdGFbaV0pKTtcbiAgICAgIHNsaWRlX3NlbGVjdF9ib3guYXBwZW5kKCc8bGkgY2xhc3M9XCJzbGlkZV9zZWxlY3QgZGlzYWJsZWRcIi8+JylcbiAgICB9XG5cbiAgICAvKnNsaWRlcy5maW5kKCcuc2xpZGUnKS5lcSgwKVxuICAgICAuYWRkQ2xhc3MoJ3NsaWRlci1hY3RpdmUnKVxuICAgICAuYWRkQ2xhc3MoJ2ZpcnN0X3Nob3cnKTtcbiAgICAgc2xpZGVfY29udHJvbC5maW5kKCdsaScpLmVxKDApLmFkZENsYXNzKCdzbGlkZXItYWN0aXZlJyk7Ki9cblxuICAgIGNvbnRhaW5lci5hcHBlbmQoc2xpZGVzKTtcbiAgICBzbGlkZV9jb250cm9sLmFwcGVuZChzbGlkZV9zZWxlY3RfYm94KTtcbiAgICBjb250YWluZXIuYXBwZW5kKHNsaWRlX2NvbnRyb2wpO1xuXG5cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICBpZiAoIXBhcmFsbGF4X2dyb3VwKXJldHVybiBmYWxzZTtcbiAgICB2YXIgcGFyYWxsYXhfayA9IChwYXJhbGxheF9jb3VudGVyIC0gMTApIC8gMjtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyYWxsYXhfZ3JvdXAubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBlbCA9IHBhcmFsbGF4X2dyb3VwLmVxKGkpO1xuICAgICAgdmFyIGogPSBlbC5hdHRyKCd6Jyk7XG4gICAgICB2YXIgdHIgPSAncm90YXRlM2QoMC4xLDAuOCwwLCcgKyAocGFyYWxsYXhfaykgKyAnZGVnKSBzY2FsZSgnICsgKDEgKyBqICogMC41KSArICcpIHRyYW5zbGF0ZVooLScgKyAoMTAgKyBqICogMjApICsgJ3B4KSc7XG4gICAgICBlbC5jc3MoJ3RyYW5zZm9ybScsIHRyKVxuICAgIH1cbiAgICBwYXJhbGxheF9jb3VudGVyICs9IHBhcmFsbGF4X2QgKiAwLjE7XG4gICAgaWYgKHBhcmFsbGF4X2NvdW50ZXIgPj0gMjApcGFyYWxsYXhfZCA9IC1wYXJhbGxheF9kO1xuICAgIGlmIChwYXJhbGxheF9jb3VudGVyIDw9IDApcGFyYWxsYXhfZCA9IC1wYXJhbGxheF9kO1xuICB9XG5cbiAgaW5pdEltYWdlU2VydmVyU2VsZWN0KCQoJy5maWxlU2VsZWN0JykpO1xuXG4gIHJldHVybiB7XG4gICAgaW5pdDogaW5pdFxuICB9O1xufSgpKTtcbiIsIjsoZnVuY3Rpb24oJCl7XG5cbiAgZnVuY3Rpb24gYWpheF9zYXZlKGVsZW1lbnQpe1xuICAgIHRoaXMuaW5pdChlbGVtZW50KTtcbiAgfTtcblxuICBmdW5jdGlvbiBjbGVhckNsYXNzKCl7XG4gICAgdmFyIG9wdGlvbnM9dGhpcztcbiAgICBvcHRpb25zLnRoaXMucGFyZW50KCkucmVtb3ZlQ2xhc3MoJ2FqYXhTYXZpbmdGYWlsZWQnKTtcbiAgICBvcHRpb25zLnRoaXMucGFyZW50KCkucmVtb3ZlQ2xhc3MoJ2FqYXhTYXZpbmdPaycpO1xuICB9XG5cbiAgYWpheF9zYXZlLnByb3RvdHlwZS5pbml0PWZ1bmN0aW9uKGVsZW1lbnQpe1xuICAgIHRhZ05hbWU9ZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgZWxlbWVudD0kKGVsZW1lbnQpO1xuICAgIGlmKHRhZ05hbWU9PVwiaW5wdXRcIiB8fCB0YWdOYW1lPT1cInNlbGVjdFwiKXtcbiAgICAgIG9iaj1lbGVtZW50O1xuICAgIH1lbHNle1xuICAgICAgb2JqPWVsZW1lbnQuZmluZCgnaW5wdXQsc2VsZWN0Jyk7XG4gICAgfVxuXG4gICAgcG9zdF91cmw9ZWxlbWVudC5hdHRyKCdzYXZlX3VybCcpO1xuICAgIHVpZD1lbGVtZW50LmF0dHIoJ3VpZCcpO1xuXG4gICAgZm9yKHZhciBpPTA7aTxvYmoubGVuZ3RoO2krKyl7XG4gICAgICB2YXIgb3B0aW9ucz17XG4gICAgICAgIHVybDpwb3N0X3VybCxcbiAgICAgICAgaWQ6dWlkLFxuICAgICAgICB0aGlzOm9iai5lcShpKVxuICAgICAgfTtcblxuICAgICAgb3B0aW9ucy50aGlzXG4gICAgICAgIC5vZmYoJ2NoYW5nZScpXG4gICAgICAgIC5vbignY2hhbmdlJyxmdW5jdGlvbigpe1xuICAgICAgICB2YXIgb3B0aW9ucz10aGlzO1xuICAgICAgICB2YXIgdmFsPW9wdGlvbnMudGhpcy52YWwoKTtcbiAgICAgICAgdmFyIHR5cGU9b3B0aW9ucy50aGlzLmF0dHIoJ3R5cGUnKTtcbiAgICAgICAgaWYodHlwZSAmJiB0eXBlLnRvTG93ZXJDYXNlKCk9PSdjaGVja2JveCcpe1xuICAgICAgICAgIGlmKCFvcHRpb25zLnRoaXMucHJvcCgnY2hlY2tlZCcpKXtcbiAgICAgICAgICAgIHZhbD0wO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgcG9zdD17XG4gICAgICAgICAgaWQ6b3B0aW9ucy5pZCxcbiAgICAgICAgICB2YWx1ZTp2YWwsXG4gICAgICAgICAgbmFtZTpvcHRpb25zLnRoaXMuYXR0cignbmFtZScpXG4gICAgICAgIH07XG5cbiAgICAgICAgb3B0aW9ucy50aGlzLnBhcmVudCgpLmFkZENsYXNzKCdhamF4SW5TYXZpbmcnKTtcbiAgICAgICAgJC5wb3N0KG9wdGlvbnMudXJsLHBvc3QsZnVuY3Rpb24oKXtcbiAgICAgICAgICB2YXIgb3B0aW9ucz10aGlzO1xuICAgICAgICAgIG9wdGlvbnMudGhpcy5wYXJlbnQoKS5yZW1vdmVDbGFzcygnYWpheEluU2F2aW5nJyk7XG4gICAgICAgICAgb3B0aW9ucy50aGlzLnBhcmVudCgpLmFkZENsYXNzKCdhamF4U2F2aW5nT2snKTtcbiAgICAgICAgICBzZXRUaW1lb3V0KGNsZWFyQ2xhc3MuYmluZChvcHRpb25zKSwzMDAwKVxuICAgICAgICB9LmJpbmQob3B0aW9ucykpLmZhaWwoZnVuY3Rpb24oKXtcbiAgICAgICAgICB2YXIgb3B0aW9ucz10aGlzO1xuICAgICAgICAgIG9wdGlvbnMudGhpcy5wYXJlbnQoKS5yZW1vdmVDbGFzcygnYWpheEluU2F2aW5nJyk7XG4gICAgICAgICAgb3B0aW9ucy50aGlzLnBhcmVudCgpLmFkZENsYXNzKCdhamF4U2F2aW5nRmFpbGVkJyk7XG4gICAgICAgICAgc2V0VGltZW91dChjbGVhckNsYXNzLmJpbmQob3B0aW9ucyksNDAwMClcbiAgICAgICAgfS5iaW5kKG9wdGlvbnMpKVxuICAgICAgfS5iaW5kKG9wdGlvbnMpKVxuICAgIH1cbiAgfTtcblxuICAkLmZuLmFqYXhfc2F2ZT1mdW5jdGlvbigpe1xuICAgICQodGhpcykuZWFjaChmdW5jdGlvbigpe1xuICAgICAgbmV3IGFqYXhfc2F2ZSh0aGlzKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG59KShqUXVlcnkpO1xuJCgnLmFqYXhfc2F2ZScpLmFqYXhfc2F2ZSgpOyIsIjtcbiQoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIG9uUmVtb3ZlKCl7XG4gICAgJHRoaXM9JCh0aGlzKTtcbiAgICBwb3N0PXtcbiAgICAgIGlkOiR0aGlzLmF0dHIoJ3VpZCcpLFxuICAgICAgdHlwZTokdGhpcy5hdHRyKCdtb2RlJylcbiAgICB9O1xuICAgICQucG9zdCgkdGhpcy5hdHRyKCd1cmwnKSxwb3N0LGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgaWYoZGF0YSAmJiBkYXRhPT0nZXJyJyl7XG4gICAgICAgIG1zZz0kdGhpcy5kYXRhKCdyZW1vdmUtZXJyb3InKTtcbiAgICAgICAgaWYoIW1zZyl7XG4gICAgICAgICAgbXNnPSfQndC10LLQvtC30LzQvtC20L3QviDRg9C00LDQu9C40YLRjCDRjdC70LXQvNC10L3Rgic7XG4gICAgICAgIH1cbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTptc2csdHlwZTonZXJyJ30pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIG1vZGU9JHRoaXMuYXR0cignbW9kZScpO1xuICAgICAgaWYoIW1vZGUpe1xuICAgICAgICBtb2RlPSdybSc7XG4gICAgICB9XG5cbiAgICAgIGlmKG1vZGU9PSdybScpIHtcbiAgICAgICAgcm0gPSAkdGhpcy5jbG9zZXN0KCcudG9fcmVtb3ZlJyk7XG4gICAgICAgIHJtX2NsYXNzID0gcm0uYXR0cigncm1fY2xhc3MnKTtcbiAgICAgICAgaWYgKHJtX2NsYXNzKSB7XG4gICAgICAgICAgJChybV9jbGFzcykucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBybS5yZW1vdmUoKTtcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0KPRgdC/0LXRiNC90L7QtSDRg9C00LDQu9C10L3QuNC1LicsdHlwZTonaW5mbyd9KVxuICAgICAgfVxuICAgICAgaWYobW9kZT09J3JlbG9hZCcpe1xuICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgbG9jYXRpb24uaHJlZj1sb2NhdGlvbi5ocmVmO1xuICAgICAgfVxuICAgIH0pLmZhaWwoZnVuY3Rpb24oKXtcbiAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Ce0YjQuNCx0LrQsCDRg9C00LDQu9C90LjRjycsdHlwZTonZXJyJ30pO1xuICAgIH0pXG4gIH1cblxuICAkKCdib2R5Jykub24oJ2NsaWNrJywnLmFqYXhfcmVtb3ZlJyxmdW5jdGlvbigpe1xuICAgIG5vdGlmaWNhdGlvbi5jb25maXJtKHtcbiAgICAgIGNhbGxiYWNrWWVzOm9uUmVtb3ZlLFxuICAgICAgb2JqOiQodGhpcyksXG4gICAgICBub3R5ZnlfY2xhc3M6IFwibm90aWZ5X2JveC1hbGVydFwiXG4gICAgfSlcbiAgfSk7XG5cbn0pO1xuXG4iLCJ2YXIgbm90aWZpY2F0aW9uID0gKGZ1bmN0aW9uICgpIHtcbiAgdmFyIGNvbnRlaW5lcjtcbiAgdmFyIG1vdXNlT3ZlciA9IDA7XG4gIHZhciB0aW1lckNsZWFyQWxsID0gbnVsbDtcbiAgdmFyIGFuaW1hdGlvbkVuZCA9ICd3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kJztcbiAgdmFyIHRpbWUgPSAxMDAwMDtcblxuICB2YXIgbm90aWZpY2F0aW9uX2JveCA9IGZhbHNlO1xuICB2YXIgaXNfaW5pdCA9IGZhbHNlO1xuICB2YXIgY29uZmlybV9vcHQgPSB7XG4gICAgLy8gdGl0bGU6IGxnKCdkZWxldGluZycpLFxuICAgIC8vIHF1ZXN0aW9uOiBsZygnYXJlX3lvdV9zdXJlX3RvX2RlbGV0ZScpLFxuICAgIC8vIGJ1dHRvblllczogbGcoJ3llcycpLFxuICAgIC8vIGJ1dHRvbk5vOiBsZygnbm8nKSxcbiAgICBjYWxsYmFja1llczogZmFsc2UsXG4gICAgY2FsbGJhY2tObzogZmFsc2UsXG4gICAgb2JqOiBmYWxzZSxcbiAgICBidXR0b25UYWc6ICdkaXYnLFxuICAgIGJ1dHRvblllc0RvcDogJycsXG4gICAgYnV0dG9uTm9Eb3A6ICcnXG4gIH07XG4gIHZhciBhbGVydF9vcHQgPSB7XG4gICAgdGl0bGU6IFwiXCIsXG4gICAgcXVlc3Rpb246ICdtZXNzYWdlJyxcbiAgICAvLyBidXR0b25ZZXM6IGxnKCd5ZXMnKSxcbiAgICBjYWxsYmFja1llczogZmFsc2UsXG4gICAgYnV0dG9uVGFnOiAnZGl2JyxcbiAgICBvYmo6IGZhbHNlXG4gIH07XG5cbiAgZnVuY3Rpb24gdGVzdElwaG9uZSgpIHtcbiAgICBpZiAoIS8oaVBob25lfGlQYWR8aVBvZCkuKihPUyAxMSkvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpIHJldHVybjtcbiAgICBub3RpZmljYXRpb25fYm94LmNzcygncG9zaXRpb24nLCAnYWJzb2x1dGUnKTtcbiAgICBub3RpZmljYXRpb25fYm94LmNzcygndG9wJywgJChkb2N1bWVudCkuc2Nyb2xsVG9wKCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBpc19pbml0ID0gdHJ1ZTtcbiAgICBub3RpZmljYXRpb25fYm94ID0gJCgnLm5vdGlmaWNhdGlvbl9ib3gnKTtcbiAgICBpZiAobm90aWZpY2F0aW9uX2JveC5sZW5ndGggPiAwKXJldHVybjtcblxuICAgICQoJ2JvZHknKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdub3RpZmljYXRpb25fYm94Jz48L2Rpdj5cIik7XG4gICAgbm90aWZpY2F0aW9uX2JveCA9ICQoJy5ub3RpZmljYXRpb25fYm94Jyk7XG5cbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsICcubm90aWZ5X2NvbnRyb2wnLCBjbG9zZU1vZGFsKTtcbiAgICBub3RpZmljYXRpb25fYm94Lm9uKCdjbGljaycsICcubm90aWZ5X2Nsb3NlJywgY2xvc2VNb2RhbCk7XG4gICAgbm90aWZpY2F0aW9uX2JveC5vbignY2xpY2snLCBjbG9zZU1vZGFsRm9uKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb3NlTW9kYWwoKSB7XG4gICAgJCgnaHRtbCcpLnJlbW92ZUNsYXNzKCdzaG93X25vdGlmaScpO1xuICAgICQoJy5ub3RpZmljYXRpb25fYm94IC5ub3RpZnlfY29udGVudCcpLmh0bWwoJycpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2VNb2RhbEZvbihlKSB7XG4gICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcbiAgICBpZiAodGFyZ2V0LmNsYXNzTmFtZSA9PSBcIm5vdGlmaWNhdGlvbl9ib3hcIikge1xuICAgICAgY2xvc2VNb2RhbCgpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBfc2V0VXBMaXN0ZW5lcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgJCgnYm9keScpLm9uKCdjbGljaycsICcubm90aWZpY2F0aW9uX2Nsb3NlJywgX2Nsb3NlUG9wdXApO1xuICAgICQoJ2JvZHknKS5vbignbW91c2VlbnRlcicsICcubm90aWZpY2F0aW9uX2NvbnRhaW5lcicsIF9vbkVudGVyKTtcbiAgICAkKCdib2R5Jykub24oJ21vdXNlbGVhdmUnLCAnLm5vdGlmaWNhdGlvbl9jb250YWluZXInLCBfb25MZWF2ZSk7XG4gIH07XG5cbiAgdmFyIF9vbkVudGVyID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50KWV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYgKHRpbWVyQ2xlYXJBbGwgIT0gbnVsbCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyQ2xlYXJBbGwpO1xuICAgICAgdGltZXJDbGVhckFsbCA9IG51bGw7XG4gICAgfVxuICAgIGNvbnRlaW5lci5maW5kKCcubm90aWZpY2F0aW9uX2l0ZW0nKS5lYWNoKGZ1bmN0aW9uIChpKSB7XG4gICAgICB2YXIgb3B0aW9uID0gJCh0aGlzKS5kYXRhKCdvcHRpb24nKTtcbiAgICAgIGlmIChvcHRpb24udGltZXIpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KG9wdGlvbi50aW1lcik7XG4gICAgICB9XG4gICAgfSk7XG4gICAgbW91c2VPdmVyID0gMTtcbiAgfTtcblxuICB2YXIgX29uTGVhdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29udGVpbmVyLmZpbmQoJy5ub3RpZmljYXRpb25faXRlbScpLmVhY2goZnVuY3Rpb24gKGkpIHtcbiAgICAgICR0aGlzID0gJCh0aGlzKTtcbiAgICAgIHZhciBvcHRpb24gPSAkdGhpcy5kYXRhKCdvcHRpb24nKTtcbiAgICAgIGlmIChvcHRpb24udGltZSA+IDApIHtcbiAgICAgICAgb3B0aW9uLnRpbWVyID0gc2V0VGltZW91dChfY2xvc2VQb3B1cC5iaW5kKG9wdGlvbi5jbG9zZSksIG9wdGlvbi50aW1lIC0gMTUwMCArIDEwMCAqIGkpO1xuICAgICAgICAkdGhpcy5kYXRhKCdvcHRpb24nLCBvcHRpb24pXG4gICAgICB9XG4gICAgfSk7XG4gICAgbW91c2VPdmVyID0gMDtcbiAgfTtcblxuICB2YXIgX2Nsb3NlUG9wdXAgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQpZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciAkdGhpcyA9ICQodGhpcykucGFyZW50KCk7XG4gICAgJHRoaXMub24oYW5pbWF0aW9uRW5kLCBmdW5jdGlvbiAoKSB7XG4gICAgICAkKHRoaXMpLnJlbW92ZSgpO1xuICAgIH0pO1xuICAgICR0aGlzLmFkZENsYXNzKCdub3RpZmljYXRpb25faGlkZScpXG4gIH07XG5cbiAgZnVuY3Rpb24gYWxlcnQoZGF0YSkge1xuICAgIGlmICghZGF0YSlkYXRhID0ge307XG4gICAgYWxlcnRfb3B0ID0gb2JqZWN0cyhhbGVydF9vcHQsIHtcbiAgICAgICAgYnV0dG9uWWVzOiBsZygneWVzJylcbiAgICB9KTtcbiAgICBkYXRhID0gb2JqZWN0cyhhbGVydF9vcHQsIGRhdGEpO1xuXG4gICAgaWYgKCFpc19pbml0KWluaXQoKTtcbiAgICB0ZXN0SXBob25lKCk7XG5cbiAgICBub3R5ZnlfY2xhc3MgPSAnbm90aWZ5X2JveCAnO1xuICAgIGlmIChkYXRhLm5vdHlmeV9jbGFzcylub3R5ZnlfY2xhc3MgKz0gZGF0YS5ub3R5ZnlfY2xhc3M7XG5cbiAgICBib3hfaHRtbCA9ICc8ZGl2IGNsYXNzPVwiJyArIG5vdHlmeV9jbGFzcyArICdcIj4nO1xuICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X3RpdGxlXCI+JztcbiAgICBib3hfaHRtbCArPSAnPGRpdj4nK2RhdGEudGl0bGUrJzwvZGl2Pic7XG4gICAgYm94X2h0bWwgKz0gJzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG5cbiAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcbiAgICBib3hfaHRtbCArPSBkYXRhLnF1ZXN0aW9uO1xuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuXG4gICAgaWYgKGRhdGEuYnV0dG9uWWVzIHx8IGRhdGEuYnV0dG9uTm8pIHtcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uWWVzKWJveF9odG1sICs9ICc8JyArIGRhdGEuYnV0dG9uVGFnICsgJyBjbGFzcz1cIm5vdGlmeV9idG5feWVzXCIgJyArIGRhdGEuYnV0dG9uWWVzRG9wICsgJz4nICsgZGF0YS5idXR0b25ZZXMgKyAnPC8nICsgZGF0YS5idXR0b25UYWcgKyAnPic7XG4gICAgICBpZiAoZGF0YS5idXR0b25Obylib3hfaHRtbCArPSAnPCcgKyBkYXRhLmJ1dHRvblRhZyArICcgY2xhc3M9XCJub3RpZnlfYnRuX25vXCIgJyArIGRhdGEuYnV0dG9uTm9Eb3AgKyAnPicgKyBkYXRhLmJ1dHRvbk5vICsgJzwvJyArIGRhdGEuYnV0dG9uVGFnICsgJz4nO1xuICAgICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG4gICAgfVxuXG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG4gICAgbm90aWZpY2F0aW9uX2JveC5odG1sKGJveF9odG1sKTtcblxuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ3Nob3dfbm90aWZpJyk7XG4gICAgfSwgMTAwKVxuICB9XG5cbiAgZnVuY3Rpb24gY29uZmlybShkYXRhKSB7XG4gICAgaWYgKCFkYXRhKWRhdGEgPSB7fTtcbiAgICBjb25maXJtX29wdCA9IG9iamVjdHMoY29uZmlybV9vcHQsIHtcbiAgICAgICAgdGl0bGU6IGxnKCdkZWxldGluZycpLFxuICAgICAgICBxdWVzdGlvbjogbGcoJ2FyZV95b3Vfc3VyZV90b19kZWxldGUnKSxcbiAgICAgICAgYnV0dG9uWWVzOiBsZygneWVzJyksXG4gICAgICAgIGJ1dHRvbk5vOiBsZygnbm8nKVxuICAgIH0pO1xuICAgIGRhdGEgPSBvYmplY3RzKGNvbmZpcm1fb3B0LCBkYXRhKTtcbiAgICBpZiAodHlwZW9mKGRhdGEuY2FsbGJhY2tZZXMpID09ICdzdHJpbmcnKSB7XG4gICAgICB2YXIgY29kZSA9ICdkYXRhLmNhbGxiYWNrWWVzID0gZnVuY3Rpb24oKXsnK2RhdGEuY2FsbGJhY2tZZXMrJ30nO1xuICAgICAgZXZhbChjb2RlKTtcbiAgICB9XG5cbiAgICBpZiAoIWlzX2luaXQpaW5pdCgpO1xuICAgIHRlc3RJcGhvbmUoKTtcbiAgICAvL2JveF9odG1sPSc8ZGl2IGNsYXNzPVwibm90aWZ5X2JveFwiPic7XG5cbiAgICBub3R5ZnlfY2xhc3MgPSAnbm90aWZ5X2JveCAnO1xuICAgIGlmIChkYXRhLm5vdHlmeV9jbGFzcylub3R5ZnlfY2xhc3MgKz0gZGF0YS5ub3R5ZnlfY2xhc3M7XG5cbiAgICBib3hfaHRtbCA9ICc8ZGl2IGNsYXNzPVwiJyArIG5vdHlmeV9jbGFzcyArICdcIj4nO1xuXG4gICAgYm94X2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJub3RpZnlfdGl0bGVcIj4nO1xuICAgIGJveF9odG1sICs9IGRhdGEudGl0bGU7XG4gICAgYm94X2h0bWwgKz0gJzxzcGFuIGNsYXNzPVwibm90aWZ5X2Nsb3NlXCI+PC9zcGFuPic7XG4gICAgYm94X2h0bWwgKz0gJzwvZGl2Pic7XG5cbiAgICBib3hfaHRtbCArPSAnPGRpdiBjbGFzcz1cIm5vdGlmeV9jb250ZW50XCI+JztcbiAgICBib3hfaHRtbCArPSBkYXRhLnF1ZXN0aW9uO1xuICAgIGJveF9odG1sICs9ICc8L2Rpdj4nO1xuXG4gICAgaWYgKGRhdGEuYnV0dG9uWWVzIHx8IGRhdGEuYnV0dG9uTm8pIHtcbiAgICAgIGJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2NvbnRyb2xcIj4nO1xuICAgICAgaWYgKGRhdGEuYnV0dG9uWWVzKWJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2J0bl95ZXNcIj4nICsgZGF0YS5idXR0b25ZZXMgKyAnPC9kaXY+JztcbiAgICAgIGlmIChkYXRhLmJ1dHRvbk5vKWJveF9odG1sICs9ICc8ZGl2IGNsYXNzPVwibm90aWZ5X2J0bl9ub1wiPicgKyBkYXRhLmJ1dHRvbk5vICsgJzwvZGl2Pic7XG4gICAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcbiAgICB9XG5cbiAgICBib3hfaHRtbCArPSAnPC9kaXY+JztcbiAgICBub3RpZmljYXRpb25fYm94Lmh0bWwoYm94X2h0bWwpO1xuXG4gICAgaWYgKGRhdGEuY2FsbGJhY2tZZXMgIT0gZmFsc2UpIHtcbiAgICAgIG5vdGlmaWNhdGlvbl9ib3guZmluZCgnLm5vdGlmeV9idG5feWVzJykub24oJ2NsaWNrJywgZGF0YS5jYWxsYmFja1llcy5iaW5kKGRhdGEub2JqKSk7XG4gICAgfVxuICAgIGlmIChkYXRhLmNhbGxiYWNrTm8gIT0gZmFsc2UpIHtcbiAgICAgIG5vdGlmaWNhdGlvbl9ib3guZmluZCgnLm5vdGlmeV9idG5fbm8nKS5vbignY2xpY2snLCBkYXRhLmNhbGxiYWNrTm8uYmluZChkYXRhLm9iaikpO1xuICAgIH1cblxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCdzaG93X25vdGlmaScpO1xuICAgIH0sIDEwMClcblxuICB9XG5cbiAgZnVuY3Rpb24gbm90aWZpKGRhdGEpIHtcbiAgICBpZiAoIWRhdGEpZGF0YSA9IHt9O1xuICAgIHZhciBvcHRpb24gPSB7dGltZTogKGRhdGEudGltZSB8fCBkYXRhLnRpbWUgPT09IDApID8gZGF0YS50aW1lIDogdGltZX07XG4gICAgaWYgKCFjb250ZWluZXIpIHtcbiAgICAgIGNvbnRlaW5lciA9ICQoJzx1bC8+Jywge1xuICAgICAgICAnY2xhc3MnOiAnbm90aWZpY2F0aW9uX2NvbnRhaW5lcidcbiAgICAgIH0pO1xuXG4gICAgICAkKCdib2R5JykuYXBwZW5kKGNvbnRlaW5lcik7XG4gICAgICBfc2V0VXBMaXN0ZW5lcnMoKTtcbiAgICB9XG5cbiAgICB2YXIgbGkgPSAkKCc8bGkvPicsIHtcbiAgICAgIGNsYXNzOiAnbm90aWZpY2F0aW9uX2l0ZW0nXG4gICAgfSk7XG5cbiAgICBpZiAoZGF0YS50eXBlKSB7XG4gICAgICBsaS5hZGRDbGFzcygnbm90aWZpY2F0aW9uX2l0ZW0tJyArIGRhdGEudHlwZSk7XG4gICAgfVxuXG4gICAgdmFyIGNsb3NlID0gJCgnPHNwYW4vPicsIHtcbiAgICAgIGNsYXNzOiAnbm90aWZpY2F0aW9uX2Nsb3NlJ1xuICAgIH0pO1xuICAgIG9wdGlvbi5jbG9zZSA9IGNsb3NlO1xuICAgIGxpLmFwcGVuZChjbG9zZSk7XG5cbiAgICB2YXIgY29udGVudCA9ICQoJzxkaXYvPicsIHtcbiAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl9jb250ZW50XCJcbiAgICB9KTtcblxuICAgIGlmIChkYXRhLnRpdGxlICYmIGRhdGEudGl0bGUubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIHRpdGxlID0gJCgnPGg1Lz4nLCB7XG4gICAgICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl90aXRsZVwiXG4gICAgICB9KTtcbiAgICAgIHRpdGxlLmh0bWwoZGF0YS50aXRsZSk7XG4gICAgICBjb250ZW50LmFwcGVuZCh0aXRsZSk7XG4gICAgfVxuXG4gICAgdmFyIHRleHQgPSAkKCc8ZGl2Lz4nLCB7XG4gICAgICBjbGFzczogXCJub3RpZmljYXRpb25fdGV4dFwiXG4gICAgfSk7XG4gICAgdGV4dC5odG1sKGRhdGEubWVzc2FnZSk7XG5cbiAgICBpZiAoZGF0YS5pbWcgJiYgZGF0YS5pbWcubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIGltZyA9ICQoJzxkaXYvPicsIHtcbiAgICAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX2ltZ1wiXG4gICAgICB9KTtcbiAgICAgIGltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBkYXRhLmltZyArICcpJyk7XG4gICAgICB2YXIgd3JhcCA9ICQoJzxkaXYvPicsIHtcbiAgICAgICAgY2xhc3M6IFwid3JhcFwiXG4gICAgICB9KTtcblxuICAgICAgd3JhcC5hcHBlbmQoaW1nKTtcbiAgICAgIHdyYXAuYXBwZW5kKHRleHQpO1xuICAgICAgY29udGVudC5hcHBlbmQod3JhcCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRlbnQuYXBwZW5kKHRleHQpO1xuICAgIH1cbiAgICBsaS5hcHBlbmQoY29udGVudCk7XG5cbiAgICAvL1xuICAgIC8vIGlmKGRhdGEudGl0bGUgJiYgZGF0YS50aXRsZS5sZW5ndGg+MCkge1xuICAgIC8vICAgdmFyIHRpdGxlID0gJCgnPHAvPicsIHtcbiAgICAvLyAgICAgY2xhc3M6IFwibm90aWZpY2F0aW9uX3RpdGxlXCJcbiAgICAvLyAgIH0pO1xuICAgIC8vICAgdGl0bGUuaHRtbChkYXRhLnRpdGxlKTtcbiAgICAvLyAgIGxpLmFwcGVuZCh0aXRsZSk7XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gaWYoZGF0YS5pbWcgJiYgZGF0YS5pbWcubGVuZ3RoPjApIHtcbiAgICAvLyAgIHZhciBpbWcgPSAkKCc8ZGl2Lz4nLCB7XG4gICAgLy8gICAgIGNsYXNzOiBcIm5vdGlmaWNhdGlvbl9pbWdcIlxuICAgIC8vICAgfSk7XG4gICAgLy8gICBpbWcuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywndXJsKCcrZGF0YS5pbWcrJyknKTtcbiAgICAvLyAgIGxpLmFwcGVuZChpbWcpO1xuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIHZhciBjb250ZW50ID0gJCgnPGRpdi8+Jyx7XG4gICAgLy8gICBjbGFzczpcIm5vdGlmaWNhdGlvbl9jb250ZW50XCJcbiAgICAvLyB9KTtcbiAgICAvLyBjb250ZW50Lmh0bWwoZGF0YS5tZXNzYWdlKTtcbiAgICAvL1xuICAgIC8vIGxpLmFwcGVuZChjb250ZW50KTtcbiAgICAvL1xuICAgIGNvbnRlaW5lci5hcHBlbmQobGkpO1xuXG4gICAgaWYgKG9wdGlvbi50aW1lID4gMCkge1xuICAgICAgb3B0aW9uLnRpbWVyID0gc2V0VGltZW91dChfY2xvc2VQb3B1cC5iaW5kKGNsb3NlKSwgb3B0aW9uLnRpbWUpO1xuICAgIH1cbiAgICBsaS5kYXRhKCdvcHRpb24nLCBvcHRpb24pXG4gIH1cblxuICByZXR1cm4ge1xuICAgIGFsZXJ0OiBhbGVydCxcbiAgICBjb25maXJtOiBjb25maXJtLFxuICAgIG5vdGlmaTogbm90aWZpXG4gIH07XG5cbn0pKCk7XG5cblxuJCgnW3JlZj1wb3B1cF0nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICR0aGlzID0gJCh0aGlzKTtcbiAgZWwgPSAkKCR0aGlzLmF0dHIoJ2hyZWYnKSk7XG4gIGRhdGEgPSBlbC5kYXRhKCk7XG5cbiAgZGF0YS5xdWVzdGlvbiA9IGVsLmh0bWwoKTtcbiAgbm90aWZpY2F0aW9uLmFsZXJ0KGRhdGEpO1xufSk7XG5cbiQoJ1tyZWY9Y29uZmlybV0nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICR0aGlzID0gJCh0aGlzKTtcbiAgZWwgPSAkKCR0aGlzLmF0dHIoJ2hyZWYnKSk7XG4gIGRhdGEgPSBlbC5kYXRhKCk7XG4gIGRhdGEucXVlc3Rpb24gPSBlbC5odG1sKCk7XG4gIG5vdGlmaWNhdGlvbi5jb25maXJtKGRhdGEpO1xufSk7XG5cblxuJCgnLmRpc2FibGVkJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAkdGhpcyA9ICQodGhpcyk7XG4gIGRhdGEgPSAkdGhpcy5kYXRhKCk7XG4gIGlmIChkYXRhWydidXR0b25feWVzJ10pIHtcbiAgICBkYXRhWydidXR0b25ZZXMnXSA9IGRhdGFbJ2J1dHRvbl95ZXMnXTtcbiAgfVxuICBpZiAoZGF0YVsnYnV0dG9uX3llcyddID09PSBmYWxzZSkge1xuICAgIGRhdGFbJ2J1dHRvblllcyddID0gZmFsc2U7XG4gIH1cblxuICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XG59KTsiLCIkKGZ1bmN0aW9uKCkge1xuXG4gIGZ1bmN0aW9uIHVwZGF0ZShkYXRhKXtcbiAgICAkdGhpcz0kKHRoaXMpO1xuICAgIG1vZGU9JHRoaXMuYXR0cignbW9kZScpO1xuICAgIGlmKG1vZGU9PSdyYXRlJyl7XG4gICAgICAkcGFyZW50PSR0aGlzLmNsb3Nlc3QoJy5hY29yZGlvbl9jb250ZW50Jyk7XG4gICAgICAkcGFyZW50PSRwYXJlbnQuZmluZCgndGFibGUnKTtcbiAgICAgIGRhdGE9JChkYXRhKTtcbiAgICAgIGRhdGEuYWpheF9zYXZlKCk7XG4gICAgICAkcGFyZW50LmFwcGVuZChkYXRhKVxuICAgIH1cblxuICAgIGlmKG1vZGU9PSd0YXJpZmYnKXtcbiAgICAgICRwYXJlbnQ9JHRoaXMuY2xvc2VzdCgnLmFjb3JkaW9uX2NvbnRlbnQnKTtcbiAgICAgIGRhdGE9JChkYXRhKTtcbiAgICAgIGRhdGEuZmluZCgnLmFqYXhfc2F2ZScpLmFqYXhfc2F2ZSgpO1xuICAgICAgJHBhcmVudC5hcHBlbmQoZGF0YSlcbiAgICB9XG5cbiAgICBpZihtb2RlPT0nYWN0aW9uJyl7XG4gICAgICAkcGFyZW50PSR0aGlzLmNsb3Nlc3QoJy5jcGFfYm94Jyk7XG4gICAgICBkYXRhPSQoZGF0YSk7XG4gICAgICBkYXRhLmZpbmQoJy5hamF4X3NhdmUnKS5hamF4X3NhdmUoKTtcbiAgICAgICRwYXJlbnQuYXBwZW5kKGRhdGEpXG4gICAgfVxuXG4gICAgaWYobW9kZT09J2NwYScpe1xuICAgICAgZGF0YT1KU09OLnBhcnNlKGRhdGEpO1xuXG4gICAgICAkcGFyZW50PSR0aGlzLmNsb3Nlc3QoJy50YXJpZl9zZWxlY3RfYmxrJyk7XG5cbiAgICAgICRwYXJlbnQucHJlcGVuZChkYXRhWyd0YWJfaGVhZF9zdWYnXSk7XG4gICAgICAkcGFyZW50LmZpbmQoJy50YWJfY29udHJvbCcpXG4gICAgICAgIC5hcHBlbmQoZGF0YVsndGFiX2hlYWRfYnV0J10pXG4gICAgICAgIC5hamF4X3NhdmUoKTtcblxuICAgICAgZGF0YT0kKGRhdGFbJ3RhYl9ib2R5J10pO1xuICAgICAgZGF0YS5maW5kKCcuYWpheF9zYXZlJykuYWpheF9zYXZlKCk7XG4gICAgICAkcGFyZW50XG4gICAgICAgIC5maW5kKCcuY29udGVudF90YWInKVxuICAgICAgICAuYXBwZW5kKGRhdGEpXG4gICAgfVxuICB9XG5cbiAgJCgnYm9keScpLm9uKCdjbGljaycsJy5hZGRfc2hvcF9lbGVtZW50JyxmdW5jdGlvbigpe1xuICAgICR0aGlzPSQodGhpcyk7XG4gICAgcG9zdD17XG4gICAgICBjb2RlOiR0aGlzLmF0dHIoJ2NvZGUnKSxcbiAgICAgIHBhcmVudDokdGhpcy5hdHRyKCdwYXJlbnQnKSxcbiAgICAgIHR5cGU6JHRoaXMuYXR0cignbW9kZScpXG4gICAgfTtcbiAgICB1cGRhdGVFbGVtZW50PXVwZGF0ZS5iaW5kKCR0aGlzKTtcbiAgICAkLnBvc3QoXCIvYWRtaW4vc3RvcmVzL2FqYXhfaW5zZXJ0L1wiKyR0aGlzLmF0dHIoJ21vZGUnKSxwb3N0LHVwZGF0ZUVsZW1lbnQpLmZhaWwoZnVuY3Rpb24oKSB7XG4gICAgICBhbGVydCggXCLQntGI0LjQsdC60LAg0LTQvtCx0LDQstC70LXQvdC40Y9cIiApO1xuICAgIH0pXG4gIH0pO1xuXG4gICQoJ2JvZHknKS5vbignY2xpY2snLCcuY3BhX2JveF9jaGFuZ2Vfc3RvcmUnLCBmdW5jdGlvbigpe1xuICAgICQoJy5lZGl0X2Jsa19zdG9yZScpLnRvZ2dsZUNsYXNzKCdoaWRkZW4nKTtcbiAgfSlcbn0pO1xuIiwiZnVuY3Rpb24gYWpheEZvcm0oZWxzKSB7XG4gIHZhciBmaWxlQXBpID0gd2luZG93LkZpbGUgJiYgd2luZG93LkZpbGVSZWFkZXIgJiYgd2luZG93LkZpbGVMaXN0ICYmIHdpbmRvdy5CbG9iID8gdHJ1ZSA6IGZhbHNlO1xuICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgZXJyb3JfY2xhc3M6ICcuaGFzLWVycm9yJ1xuICB9O1xuICB2YXIgbGFzdF9wb3N0ID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gb25Qb3N0KHBvc3QpIHtcbiAgICBsYXN0X3Bvc3QgPSArbmV3IERhdGUoKTtcbiAgICAvL2NvbnNvbGUubG9nKHBvc3QsIHRoaXMpO1xuICAgIHZhciBkYXRhID0gdGhpcztcbiAgICB2YXIgZm9ybSA9IGRhdGEuZm9ybTtcbiAgICB2YXIgd3JhcCA9IGRhdGEud3JhcDtcbiAgICB2YXIgd3JhcF9odG1sID0gZGF0YS53cmFwX2h0bWw7XG5cbiAgICBpZiAocG9zdC5yZW5kZXIpIHtcbiAgICAgIHBvc3Qubm90eWZ5X2NsYXNzID0gXCJub3RpZnlfd2hpdGVcIjtcbiAgICAgIG5vdGlmaWNhdGlvbi5hbGVydChwb3N0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgd3JhcC5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgZm9ybS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgaWYgKHBvc3QuaHRtbCkge1xuICAgICAgICB3cmFwLmh0bWwocG9zdC5odG1sKTtcbiAgICAgICAgYWpheEZvcm0od3JhcCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIXBvc3QuZXJyb3IpIHtcbiAgICAgICAgICBmb3JtLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgICAgICAgd3JhcC5odG1sKHdyYXBfaHRtbCk7XG4gICAgICAgICAgZm9ybS5maW5kKCdpbnB1dFt0eXBlPXRleHRdLHRleHRhcmVhJykudmFsKCcnKTtcbiAgICAgICAgICBhamF4Rm9ybSh3cmFwKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgcG9zdC5lcnJvciA9PT0gXCJvYmplY3RcIikge1xuICAgICAgZm9yICh2YXIgaW5kZXggaW4gcG9zdC5lcnJvcikge1xuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcbiAgICAgICAgICAndHlwZSc6ICdlcnInLFxuICAgICAgICAgICd0aXRsZSc6IHBvc3QudGl0bGUgPyBwb3N0LnRpdGxlIDogbGcoJ2Vycm9yJyksXG4gICAgICAgICAgJ21lc3NhZ2UnOiBwb3N0LmVycm9yW2luZGV4XVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocG9zdC5lcnJvcikpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcG9zdC5lcnJvci5sZW5ndGg7IGkrKykge1xuICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHtcbiAgICAgICAgICAndHlwZSc6ICdlcnInLFxuICAgICAgICAgICd0aXRsZSc6IHBvc3QudGl0bGUgPyBwb3N0LnRpdGxlIDogbGcoJ2Vycm9yJyksXG4gICAgICAgICAgJ21lc3NhZ2UnOiBwb3N0LmVycm9yW2ldXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAocG9zdC5lcnJvciB8fCBwb3N0Lm1lc3NhZ2UpIHtcbiAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XG4gICAgICAgICAgJ3R5cGUnOiBwb3N0LmVycm9yID09PSBmYWxzZSA/ICdzdWNjZXNzJyA6ICdlcnInLFxuICAgICAgICAgICd0aXRsZSc6IHBvc3QudGl0bGUgPyBwb3N0LnRpdGxlIDogKHBvc3QuZXJyb3IgPT09IGZhbHNlID8gbGcoJ3N1Y2Nlc3MnKSA6IGxnKCdlcnJvcicpKSxcbiAgICAgICAgICAnbWVzc2FnZSc6IHBvc3QubWVzc2FnZSA/IHBvc3QubWVzc2FnZSA6IHBvc3QuZXJyb3JcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vXG4gICAgLy8gbm90aWZpY2F0aW9uLm5vdGlmaSh7XG4gICAgLy8gICAgICd0eXBlJzogcG9zdC5lcnJvciA9PT0gZmFsc2UgPyAnc3VjY2VzcycgOiAnZXJyJyxcbiAgICAvLyAgICAgJ3RpdGxlJzogcG9zdC5lcnJvciA9PT0gZmFsc2UgPyAn0KPRgdC/0LXRiNC90L4nIDogJ9Ce0YjQuNCx0LrQsCcsXG4gICAgLy8gICAgICdtZXNzYWdlJzogQXJyYXkuaXNBcnJheShwb3N0LmVycm9yKSA/IHBvc3QuZXJyb3JbMF0gOiAocG9zdC5tZXNzYWdlID8gcG9zdC5tZXNzYWdlIDogcG9zdC5lcnJvcilcbiAgICAvLyB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uRmFpbCgpIHtcbiAgICBsYXN0X3Bvc3QgPSArbmV3IERhdGUoKTtcbiAgICB2YXIgZGF0YSA9IHRoaXM7XG4gICAgdmFyIGZvcm0gPSBkYXRhLmZvcm07XG4gICAgdmFyIHdyYXAgPSBkYXRhLndyYXA7XG4gICAgd3JhcC5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgIHdyYXAuaHRtbChcbiAgICAgICAgJzxoMz4nK2xnKCdzb3JyeV9ub3RfZXhwZWN0ZWRfZXJyb3InKSsnPGgzPicgK1xuICAgICAgICBsZygnaXRfaGFwcGVuc19zb21ldGltZXMnKVxuICAgICk7XG4gICAgYWpheEZvcm0od3JhcCk7XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uU3VibWl0KGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgLy9lLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgIC8vZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgIHZhciBjdXJyZW50VGltZU1pbGxpcyA9ICtuZXcgRGF0ZSgpO1xuICAgIGlmIChjdXJyZW50VGltZU1pbGxpcyAtIGxhc3RfcG9zdCA8IDEwMDAgKiAyKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgbGFzdF9wb3N0ID0gY3VycmVudFRpbWVNaWxsaXM7XG4gICAgdmFyIGRhdGEgPSB0aGlzO1xuICAgIHZhciBmb3JtID0gZGF0YS5mb3JtO1xuICAgIHZhciB3cmFwID0gZGF0YS53cmFwO1xuICAgIGRhdGEud3JhcF9odG1sPXdyYXAuaHRtbCgpO1xuICAgIHZhciBpc1ZhbGlkID0gdHJ1ZTtcblxuICAgIC8vaW5pdCh3cmFwKTtcblxuICAgIHZhciByZXF1aXJlZCA9IGZvcm0uZmluZCgnaW5wdXQucmVxdWlyZWQsIHRleHRhcmVhLnJlcXVpcmVkLCBpbnB1dFtpZD1cInN1cHBvcnQtcmVjYXB0Y2hhXCJdJyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXF1aXJlZC5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGhlbHBCbG9jayA9IHJlcXVpcmVkLmVxKGkpLmNsb3Nlc3QoJy5mb3JtLWdyb3VwJykuZmluZCgnLmhlbHAtYmxvY2snKTtcbiAgICAgIHZhciBoZWxwTWVzc2FnZSA9IGhlbHBCbG9jayAmJiBoZWxwQmxvY2suZGF0YSgnbWVzc2FnZScpID8gaGVscEJsb2NrLmRhdGEoJ21lc3NhZ2UnKSA6IGxnKCdyZXF1aXJlZCcpO1xuXG4gICAgICBpZiAocmVxdWlyZWQuZXEoaSkudmFsKCkubGVuZ3RoIDwgMSkge1xuICAgICAgICBoZWxwQmxvY2suaHRtbChoZWxwTWVzc2FnZSk7XG4gICAgICAgIGlzVmFsaWQgPSBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGhlbHBCbG9jay5odG1sKCcnKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFpc1ZhbGlkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKGZvcm0ueWlpQWN0aXZlRm9ybSkge1xuICAgICAgZm9ybS5vZmYoJ2FmdGVyVmFsaWRhdGUnKVxuICAgICAgZm9ybS5vbignYWZ0ZXJWYWxpZGF0ZScsIHlpaVZhbGlkYXRpb24uYmluZChkYXRhKSk7XG5cbiAgICAgIGZvcm0ueWlpQWN0aXZlRm9ybSgndmFsaWRhdGUnLCB0cnVlKTtcbiAgICAgIHZhciBkID0gZm9ybS5kYXRhKCd5aWlBY3RpdmVGb3JtJyk7XG4gICAgICBpZiAoZCkge1xuICAgICAgICBkLnZhbGlkYXRlZCA9IHRydWU7XG4gICAgICAgIGZvcm0uZGF0YSgneWlpQWN0aXZlRm9ybScsIGQpO1xuICAgICAgICBmb3JtLnlpaUFjdGl2ZUZvcm0oJ3ZhbGlkYXRlJyk7XG4gICAgICAgIGlzVmFsaWQgPSBkLnZhbGlkYXRlZDtcbiAgICAgIH1cbiAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgaXNWYWxpZCA9IGlzVmFsaWQgJiYgKGZvcm0uZmluZChkYXRhLnBhcmFtLmVycm9yX2NsYXNzKS5sZW5ndGggPT0gMCk7XG5cbiAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgIHNlbmRGb3JtKGRhdGEpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHlpaVZhbGlkYXRpb24oZSkge1xuICAgIHZhciBmb3JtID0gZGF0YS5mb3JtO1xuXG4gICAgaWYoZm9ybS5maW5kKGRhdGEucGFyYW0uZXJyb3JfY2xhc3MpLmxlbmd0aCA9PSAwKXtcbiAgICAgIHNlbmRGb3JtKHRoaXMpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNlbmRGb3JtKGRhdGEpe1xuICAgIHZhciBmb3JtID0gZGF0YS5mb3JtO1xuXG4gICAgaWYgKCFmb3JtLnNlcmlhbGl6ZU9iamVjdClhZGRTUk8oKTtcblxuICAgIHZhciBwb3N0RGF0YSA9IGZvcm0uc2VyaWFsaXplT2JqZWN0KCk7XG4gICAgZm9ybS5hZGRDbGFzcygnbG9hZGluZycpO1xuICAgIGZvcm0uaHRtbCgnJyk7XG4gICAgZGF0YS53cmFwLmh0bWwoJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjtcIj48cD4nK2xnKCdzZW5kaW5nX2RhdGEnKSsnPC9wPjwvZGl2PicpO1xuXG4gICAgZGF0YS51cmwgKz0gKGRhdGEudXJsLmluZGV4T2YoJz8nKSA+IDAgPyAnJicgOiAnPycpICsgJ3JjPScgKyBNYXRoLnJhbmRvbSgpO1xuICAgIC8vY29uc29sZS5sb2coZGF0YS51cmwpO1xuXG4gICAgLyppZighcG9zdERhdGEucmV0dXJuVXJsKXtcbiAgICAgIHBvc3REYXRhLnJldHVyblVybD1sb2NhdGlvbi5ocmVmO1xuICAgIH0qL1xuXG4gICAgaWYoZGF0YS51cmwuaW5kZXhPZihsYW5nW1wiaHJlZl9wcmVmaXhcIl0pPT0tMSl7XG4gICAgICBkYXRhLnVybD1cIi9cIitsYW5nW1wiaHJlZl9wcmVmaXhcIl0rZGF0YS51cmw7XG4gICAgICBkYXRhLnVybD1kYXRhLnVybC5yZXBsYWNlKCcvLycsJy8nKS5yZXBsYWNlKCcvLycsJy8nKTtcbiAgICB9XG5cbiAgICAkLnBvc3QoXG4gICAgICBkYXRhLnVybCxcbiAgICAgIHBvc3REYXRhLFxuICAgICAgb25Qb3N0LmJpbmQoZGF0YSksXG4gICAgICAnanNvbidcbiAgICApLmZhaWwob25GYWlsLmJpbmQoZGF0YSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdCh3cmFwKSB7XG4gICAgZm9ybSA9IHdyYXAuZmluZCgnZm9ybScpO1xuICAgIGRhdGEgPSB7XG4gICAgICBmb3JtOiBmb3JtLFxuICAgICAgcGFyYW06IGRlZmF1bHRzLFxuICAgICAgd3JhcDogd3JhcFxuICAgIH07XG4gICAgZGF0YS51cmwgPSBmb3JtLmF0dHIoJ2FjdGlvbicpIHx8IGxvY2F0aW9uLmhyZWY7XG4gICAgZGF0YS5tZXRob2QgPSBmb3JtLmF0dHIoJ21ldGhvZCcpIHx8ICdwb3N0JztcbiAgICBmb3JtLnVuYmluZCgnc3VibWl0Jyk7XG4gICAgLy9mb3JtLm9mZignc3VibWl0Jyk7XG4gICAgZm9ybS5vbignc3VibWl0Jywgb25TdWJtaXQuYmluZChkYXRhKSk7XG4gIH1cblxuICBlbHMuZmluZCgnW3JlcXVpcmVkXScpXG4gICAgLmFkZENsYXNzKCdyZXF1aXJlZCcpXG4gICAgLnJlbW92ZUF0dHIoJ3JlcXVpcmVkJyk7XG5cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGVscy5sZW5ndGg7IGkrKykge1xuICAgIGluaXQoZWxzLmVxKGkpKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgcGxhY2Vob2xkZXIgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcGxhY2Vob2xkZXIoKTtcbiAgfVxuXG59XG5cbmZ1bmN0aW9uIGFkZFNSTygpIHtcbiAgJC5mbi5zZXJpYWxpemVPYmplY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG8gPSB7fTtcbiAgICB2YXIgYSA9IHRoaXMuc2VyaWFsaXplQXJyYXkoKTtcbiAgICAkLmVhY2goYSwgZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKG9bdGhpcy5uYW1lXSkge1xuICAgICAgICBpZiAoIW9bdGhpcy5uYW1lXS5wdXNoKSB7XG4gICAgICAgICAgb1t0aGlzLm5hbWVdID0gW29bdGhpcy5uYW1lXV07XG4gICAgICAgIH1cbiAgICAgICAgb1t0aGlzLm5hbWVdLnB1c2godGhpcy52YWx1ZSB8fCAnJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvW3RoaXMubmFtZV0gPSB0aGlzLnZhbHVlIHx8ICcnO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBvO1xuICB9O1xufTtcbmFkZFNSTygpOyIsIi8vJCh3aW5kb3cpLmxvYWQoZnVuY3Rpb24oKSB7XG4vL2FjY29yZGlvbi5qc1xudmFyIGFjY29yZGlvbkNvbnRyb2wgPSAkKCcuYWNjb3JkaW9uIC5hY2NvcmRpb24tY29udHJvbCcpO1xuYWNjb3JkaW9uQ29udHJvbC5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkdGhpcyA9ICQodGhpcyk7XG4gICAgJGFjY29yZGlvbiA9ICR0aGlzLmNsb3Nlc3QoJy5hY2NvcmRpb24nKTtcblxuICAgIGlmICgkYWNjb3JkaW9uLmhhc0NsYXNzKCdvcGVuJykpIHtcbiAgICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50JykuaGlkZSgzMDApO1xuICAgICAgJGFjY29yZGlvbi5yZW1vdmVDbGFzcygnb3BlbicpXG4gICAgfSBlbHNlIHtcbiAgICAgICRhY2NvcmRpb24uZmluZCgnLmFjY29yZGlvbi1jb250ZW50Jykuc2hvdygzMDApO1xuICAgICAgJGFjY29yZGlvbi5hZGRDbGFzcygnb3BlbicpXG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSk7XG5hY2NvcmRpb25Db250cm9sLnNob3coKTtcbi8vfSlcblxuXG4vL2Z1bmN0aW9ucy5qc1xub2JqZWN0cyA9IGZ1bmN0aW9uIChhLGIpIHtcbiAgdmFyIGMgPSBiLFxuICAgIGtleTtcbiAgZm9yIChrZXkgaW4gYSkge1xuICAgIGlmIChhLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIGNba2V5XSA9IGtleSBpbiBiID8gYltrZXldIDogYVtrZXldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYztcbn07XG5cbi8v0J/RgNC+0LLQtdGA0LrQsCDQsdC40YLRiyDQutCw0YDRgtC40L3QvtC6LlxuLy8gaW1mLmpzXG4kKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBpbWdfbG9hZF9maW5pc2goKXtcbiAgICBkYXRhPXRoaXM7XG4gICAgaWYoZGF0YS50eXBlPT0wKSB7XG4gICAgICBkYXRhLmltZy5hdHRyKCdzcmMnLCBkYXRhLnNyYyk7XG4gICAgfWVsc2V7XG4gICAgICBkYXRhLmltZy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcrZGF0YS5zcmMrJyknKTtcbiAgICAgIGRhdGEuaW1nLnJlbW92ZUNsYXNzKCdub19hdmEnKTtcbiAgICB9XG4gIH1cblxuICAvL9GC0LXRgdGCINC70L7Qs9C+INC80LDQs9Cw0LfQuNC90LBcbiAgaW1ncz0kKCdzZWN0aW9uOm5vdCgubmF2aWdhdGlvbiknKS5maW5kKCcubG9nbyBpbWcnKTtcbiAgZm9yICh2YXIgaT0wO2k8aW1ncy5sZW5ndGg7aSsrKXtcbiAgICBpbWc9aW1ncy5lcShpKTtcbiAgICBzcmM9aW1nLmF0dHIoJ3NyYycpO1xuICAgIGltZy5hdHRyKCdzcmMnLCcvaW1hZ2VzL3RlbXBsYXRlLWxvZ28uanBnJyk7XG4gICAgZGF0YT17XG4gICAgICBzcmM6c3JjLFxuICAgICAgaW1nOmltZyxcbiAgICAgIHR5cGU6MCAvLyDQtNC70Y8gaW1nW3NyY11cbiAgICB9O1xuICAgIGltYWdlPSQoJzxpbWcvPicse1xuICAgICAgc3JjOnNyY1xuICAgIH0pLm9uKCdsb2FkJyxpbWdfbG9hZF9maW5pc2guYmluZChkYXRhKSlcbiAgfVxuXG4gIC8v0YLQtdGB0YIg0LDQstCw0YLQsNGA0L7QuiDQsiDQutC+0LzQtdC90YLQsNGA0LjRj9GFXG4gIGltZ3M9JCgnLmNvbW1lbnQtcGhvdG8nKTtcbiAgZm9yICh2YXIgaT0wO2k8aW1ncy5sZW5ndGg7aSsrKXtcbiAgICBpbWc9aW1ncy5lcShpKTtcbiAgICBpZihpbWcuaGFzQ2xhc3MoJ25vX2F2YScpKXtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHZhciBzcmM9aW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScpO1xuICAgIHNyYz1zcmMucmVwbGFjZSgndXJsKFwiJywnJyk7XG4gICAgc3JjPXNyYy5yZXBsYWNlKCdcIiknLCcnKTtcbiAgICBpbWcuYWRkQ2xhc3MoJ25vX2F2YScpO1xuXG4gICAgaW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScsJ3VybCgvaW1hZ2VzL25vX2F2YS5wbmcpJyk7XG4gICAgZGF0YT17XG4gICAgICBzcmM6c3JjLFxuICAgICAgaW1nOmltZyxcbiAgICAgIHR5cGU6MSAvLyDQtNC70Y8g0YTQvtC90L7QstGL0YUg0LrQsNGA0YLQuNC90L7QulxuICAgIH07XG4gICAgaW1hZ2U9JCgnPGltZy8+Jyx7XG4gICAgICBzcmM6c3JjXG4gICAgfSkub24oJ2xvYWQnLGltZ19sb2FkX2ZpbmlzaC5iaW5kKGRhdGEpKVxuICB9XG59KTtcblxuKGZ1bmN0aW9uKCkge1xuICBlbHM9JCgnLmFqYXhfbG9hZCcpLm5vdCgnYScpO1xuICBmb3IoaT0wO2k8ZWxzLmxlbmd0aDtpKyspe1xuICAgIGVsPWVscy5lcShpKTtcbiAgICB1cmw9ZWwuYXR0cigncmVzJyk7XG4gICAgJC5nZXQodXJsLGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAkdGhpcz0kKHRoaXMpO1xuICAgICAgJHRoaXMuaHRtbChkYXRhKTtcbiAgICAgIGFqYXhGb3JtKCR0aGlzKTtcbiAgICB9LmJpbmQoZWwpKVxuICB9XG59KSgpO1xuXG5cbi8vZm9ybXMuanNcbiQoJ2lucHV0W3R5cGU9ZmlsZV0nKS5vbignY2hhbmdlJyxmdW5jdGlvbihldnQpe1xuICB2YXIgZmlsZSA9IGV2dC50YXJnZXQuZmlsZXM7IC8vIEZpbGVMaXN0IG9iamVjdFxuICB2YXIgZiA9IGZpbGVbMF07XG4gIC8vIE9ubHkgcHJvY2VzcyBpbWFnZSBmaWxlcy5cbiAgaWYgKCFmLnR5cGUubWF0Y2goJ2ltYWdlLionKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblxuICBkYXRhPSB7XG4gICAgJ2VsJzogdGhpcyxcbiAgICAnZic6IGZcbiAgfTtcbiAgcmVhZGVyLm9ubG9hZCA9IChmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGltZz0kKCdbZm9yPVwiJytkYXRhLmVsLm5hbWUrJ1wiXScpO1xuICAgICAgaWYoaW1nLmxlbmd0aD4wKXtcbiAgICAgICAgaW1nLmF0dHIoJ3NyYycsZS50YXJnZXQucmVzdWx0KVxuICAgICAgfVxuICAgIH07XG4gIH0pKGRhdGEpO1xuICAvLyBSZWFkIGluIHRoZSBpbWFnZSBmaWxlIGFzIGEgZGF0YSBVUkwuXG4gIHJlYWRlci5yZWFkQXNEYXRhVVJMKGYpO1xufSk7XG5cbiQoJ2JvZHknKS5vbignY2xpY2snLCdhLmFqYXhGb3JtT3BlbicsZnVuY3Rpb24oZSl7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgaHJlZj10aGlzLmhyZWYuc3BsaXQoJyMnKTtcbiAgaHJlZj1ocmVmW2hyZWYubGVuZ3RoLTFdO1xuXG4gIGRhdGE9e1xuICAgIGJ1dHRvblllczpmYWxzZSxcbiAgICBub3R5ZnlfY2xhc3M6XCJub3RpZnlfd2hpdGUgbG9hZGluZ1wiLFxuICAgIHF1ZXN0aW9uOicnXG4gIH07XG4gIG1vZGFsX2NsYXNzPSQodGhpcykuZGF0YSgnbW9kYWwtY2xhc3MnKTtcblxuICBub3RpZmljYXRpb24uYWxlcnQoZGF0YSk7XG4gICQuZ2V0KCcvJytocmVmLGZ1bmN0aW9uKGRhdGEpe1xuICAgICQoJy5ub3RpZnlfYm94JykucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAkKCcubm90aWZ5X2JveCAubm90aWZ5X2NvbnRlbnQnKS5odG1sKGRhdGEuaHRtbCk7XG4gICAgYWpheEZvcm0oJCgnLm5vdGlmeV9ib3ggLm5vdGlmeV9jb250ZW50JykpO1xuICAgIGlmKG1vZGFsX2NsYXNzKXtcbiAgICAgICQoJy5ub3RpZnlfYm94IC5ub3RpZnlfY29udGVudCAucm93JykuYWRkQ2xhc3MobW9kYWxfY2xhc3MpO1xuICAgIH1cbiAgfSwnanNvbicpXG59KTtcblxuLy8gJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoe1xuLy8gICBkZWxheToge1xuLy8gICAgIHNob3c6IDUwMCwgaGlkZTogMjAwMFxuLy8gICB9XG4vLyB9KTtcblxuLy8gJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLm9uKCdjbGljaycsZnVuY3Rpb24gKGUpIHtcbi8vICAgJHRoaXM9JCh0aGlzKTtcbi8vICAgaWYoJHRoaXMuY2xvc2VzdCgndWwnKS5oYXNDbGFzcygncGFnaW5hdGUnKSkge1xuLy8gICAgIC8v0LTQu9GPINC/0LDQs9C40L3QsNGG0LjQuCDRgdGB0YvQu9C60LAg0LTQvtC70LbQvdCwINGA0LDQsdC+0YLQsNGC0Yxcbi8vICAgICByZXR1cm4gdHJ1ZTtcbi8vICAgfVxuLy8gICBpZigkdGhpcy5oYXNDbGFzcygnd29ya0hyZWYnKSl7XG4vLyAgICAgLy/QldGB0LvQuCDRgdGB0YvQu9C60LAg0L/QvtC80LXRh9C10L3QvdCwINC60LDQuiDRgNCw0LHQvtGH0LDRjyDRgtC+INC90YPQttC90L4g0L/QtdGA0LXRhdC+0LTQuNGC0Yxcbi8vICAgICByZXR1cm4gdHJ1ZTtcbi8vICAgfVxuLy8gICBlLnByZXZlbnREZWZhdWx0KCk7XG4vLyAgIHJldHVybiBmYWxzZTtcbi8vIH0pO1xuXG5cbiQoJy5hamF4LWFjdGlvbicpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB2YXIgc3RhdHVzID0gJCh0aGlzKS5kYXRhKCd2YWx1ZScpO1xuICB2YXIgaHJlZiA9ICQodGhpcykuYXR0cignaHJlZicpO1xuICB2YXIgaWRzID0gJCgnI2dyaWQtYWpheC1hY3Rpb24nKS55aWlHcmlkVmlldygnZ2V0U2VsZWN0ZWRSb3dzJyk7XG4gIGlmIChpZHMubGVuZ3RoID4gMCkge1xuICAgIGlmICghY29uZmlybSgn0J/QvtC00YLQstC10YDQtNC40YLQtSDQuNC30LzQtdC90LXQvdC40LUg0LfQsNC/0LjRgdC10LknKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgICQuYWpheCh7XG4gICAgICB1cmw6IGhyZWYsXG4gICAgICB0eXBlOiAncG9zdCcsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgZGF0YToge1xuICAgICAgICBzdGF0dXM6IHN0YXR1cyxcbiAgICAgICAgaWQ6IGlkc1xuICAgICAgfVxuICAgIH0pLmRvbmUoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgJCgnI2dyaWQtYWpheC1hY3Rpb24nKS55aWlHcmlkVmlldyhcImFwcGx5RmlsdGVyXCIpO1xuICAgICAgaWYgKGRhdGEuZXJyb3IgIT0gZmFsc2UpIHtcbiAgICAgICAgICBub3RpZmljYXRpb24ubm90aWZpKHttZXNzYWdlOifQn9GA0L7QuNC30L7RiNC70LAg0L7RiNC40LHQutCwIScsdHlwZTonZXJyJ30pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Ce0L/QtdGA0LDRhtC40Y8g0LLRi9C/0L7Qu9C90LXQvdCwIScsdHlwZTonc3VjY2Vzcyd9KVxuICAgICAgfVxuXG4gICAgfSkuZmFpbChmdW5jdGlvbihkYXRhKXtcbiAgICAgIGlmKGRhdGEuc3RhdHVzPT0zMDIpcmV0dXJuO1xuICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7bWVzc2FnZTon0J/RgNC+0LjQt9C+0YjQu9CwINC+0YjQuNCx0LrQsCEnLHR5cGU6J2Vycid9KVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG5vdGlmaWNhdGlvbi5ub3RpZmkoe21lc3NhZ2U6J9Cd0LXQvtCx0YXQvtC00LjQvNC+INCy0YvQsdGA0LDRgtGMINGN0LvQtdC80LXQvdGC0YshJyx0eXBlOidlcnInfSlcbiAgfVxufSk7XG5cbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICQoJy5lZGl0aWJsZVtkaXNhYmxlZF0nKS5vbignY2xpY2snLGZ1bmN0aW9uICgpIHtcbiAgICAkKHRoaXMpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpXG4gIH0pXG5cbiAgJCgnLmVkaXRpYmxlW2Rpc2FibGVkXScpLm9uKCdtb3VzZWRvd24nLGZ1bmN0aW9uICgpIHtcbiAgICAkKHRoaXMpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpXG4gIH0pXG5cbiAgYnRuPSc8YnV0dG9uIGNsYXNzPXVubG9jaz48aSBjbGFzcz1cImZhIGZhLXVubG9jayBmYS00XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPjwvYnV0dG9uPic7XG4gIGJ0bj0kKGJ0bik7XG4gIGJ0bi5vbignY2xpY2snLGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICR0aGlzPSQodGhpcyk7XG4gICAgaW5wPSR0aGlzLnByZXYoKTtcbiAgICBpbnAucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcbiAgJCgnLmVkaXRpYmxlW2Rpc2FibGVkXScpLmFmdGVyKGJ0bilcbn0pO1xuXG4kKGZ1bmN0aW9uKCkge1xuICB2YXIgbWVudSA9IHtcbiAgICBjb250cm9sOiB7XG4gICAgICBoZWFkZXJTdG9yZXNNZW51OiAkKFwiI3RvcFwiKS5maW5kKFwiLnN1Ym1lbnUtaGFuZGxcIiksXG4gICAgICBzdG9yZXNTdWJtZW51czogJChcIiN0b3BcIikuZmluZChcIi5zdWJtZW51LWhhbmRsXCIpLmZpbmQoXCIuc3VibWVudVwiKSxcbiAgICAgIGV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5oZWFkZXJTdG9yZXNNZW51LmhvdmVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBzdWJtZW51ID0gJCh0aGlzKS5maW5kKCcuc3VibWVudScpO1xuICAgICAgICAgIGlmKCQod2luZG93KS53aWR0aCgpID4gOTkxKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoc2VsZi5zdG9yZUhpZGUpO1xuICAgICAgICAgICAgc2VsZi5zdG9yZXNTdWJtZW51cy5jc3MoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcbiAgICAgICAgICAgIHNlbGYuc3RvcmVTaG93ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgc3VibWVudS5jbGVhclF1ZXVlKCk7XG4gICAgICAgICAgICAgIHN1Ym1lbnUuY3NzKFwiZGlzcGxheVwiLCBcImJsb2NrXCIpLmFuaW1hdGUoe1wib3BhY2l0eVwiOiAxfSwgMzUwKTtcbiAgICAgICAgICAgICAgLy8gc2VsZi5zdG9yZXNTdWJtZW51LmNsZWFyUXVldWUoKTtcbiAgICAgICAgICAgICAgLy8gc2VsZi5zdG9yZXNTdWJtZW51LmNzcyhcImRpc3BsYXlcIiwgXCJibG9ja1wiKS5hbmltYXRlKHtcIm9wYWNpdHlcIjogMX0sIDM1MCk7XG4gICAgICAgICAgICB9LCAyMDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIHN1Ym1lbnUgPSAkKHRoaXMpLmZpbmQoJy5zdWJtZW51Jyk7XG4gICAgICAgICAgaWYoJCh3aW5kb3cpLndpZHRoKCkgPiA5OTEpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChzZWxmLnN0b3JlU2hvdyk7XG4gICAgICAgICAgICBzZWxmLnN0b3JlSGlkZSA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHN1Ym1lbnUuY2xlYXJRdWV1ZSgpO1xuICAgICAgICAgICAgICBzdWJtZW51LmFuaW1hdGUoe1wib3BhY2l0eVwiOiAwfSwgMjAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgLy8gc2VsZi5zdG9yZXNTdWJtZW51LmNsZWFyUXVldWUoKTtcbiAgICAgICAgICAgICAgLy8gc2VsZi5zdG9yZXNTdWJtZW51LmFuaW1hdGUoe1wib3BhY2l0eVwiOiAwfSwgMjAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgLy8gICAgICQodGhpcykuY3NzKFwiZGlzcGxheVwiLCBcIm5vbmVcIik7XG4gICAgICAgICAgICAgIC8vIH0pO1xuICAgICAgICAgICAgfSwgMzAwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgbWVudS5jb250cm9sLmV2ZW50cygpO1xufSk7XG5cbi8v0YfRgtC+INCxINC40YTRgNC10LnQvNGLINC4INC60LDRgNGC0LjQvdC60Lgg0L3QtSDQstGL0LvQsNC30LjQu9C4XG4vL2ltZy5qc1xuJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgLyptX3cgPSAkKCcudGV4dC1jb250ZW50Jykud2lkdGgoKVxuICBpZiAobV93IDwgNTApbV93ID0gc2NyZWVuLndpZHRoIC0gNDAqL1xuICB2YXIgbXc9c2NyZWVuLndpZHRoLTQwO1xuXG4gIGZ1bmN0aW9uIG9wdGltYXNlKGVsKXtcbiAgICB2YXIgcGFyZW50ID0gZWwucGFyZW50KCk7XG4gICAgaWYocGFyZW50Lmxlbmd0aD09MCB8fCBwYXJlbnRbMF0udGFnTmFtZT09XCJBXCIpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBtX3cgPSBwYXJlbnQud2lkdGgoKS0zMDtcbiAgICB2YXIgdz1lbC53aWR0aCgpO1xuICAgIGVsLndpZHRoKCdhdXRvJyk7XG4gICAgaWYoZWxbMF0udGFnTmFtZT09XCJJTUdcIiAmJiB3PmVsLndpZHRoKCkpdz1lbC53aWR0aCgpO1xuXG4gICAgaWYgKG13PjUwICYmIG1fdyA+IG13KW1fdyA9IG13O1xuICAgIGlmICh3Pm1fdyA+IG1fdykge1xuICAgICAgaWYoZWxbMF0udGFnTmFtZT09XCJJRlJBTUVcIil7XG4gICAgICAgIGsgPSB3IC8gbV93O1xuICAgICAgICBlbC5oZWlnaHQoZWwuaGVpZ2h0KCkgLyBrKTtcbiAgICAgIH1cbiAgICAgIGVsLndpZHRoKG1fdylcbiAgICB9ZWxzZXtcbiAgICAgIGVsLndpZHRoKHcpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGltZ19sb2FkX2ZpbmlzaCgpe1xuICAgIHZhciBlbD0kKHRoaXMpO1xuICAgIG9wdGltYXNlKGVsKTtcbiAgfVxuXG4gIHZhciBwID0gJCgnLmNvbnRhaW5lciBpbWcsLmNvbnRhaW5lciBpZnJhbWUnKTtcbiAgJCgnLmNvbnRhaW5lciBpbWcnKS5oZWlnaHQoJ2F1dG8nKTtcbiAgLy8kKCcuY29udGFpbmVyIGltZycpLndpZHRoKCdhdXRvJyk7XG4gIGZvciAoaSA9IDA7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XG4gICAgZWwgPSBwLmVxKGkpO1xuICAgIGlmKGVsWzBdLnRhZ05hbWU9PVwiSUZSQU1FXCIpIHtcbiAgICAgIG9wdGltYXNlKGVsKTtcbiAgICB9ZWxzZXtcbiAgICAgIHZhciBzcmM9ZWwuYXR0cignc3JjJyk7XG4gICAgICBpbWFnZSA9ICQoJzxpbWcvPicsIHtcbiAgICAgICAgc3JjOiBzcmNcbiAgICAgIH0pO1xuICAgICAgaW1hZ2Uub24oJ2xvYWQnLCBpbWdfbG9hZF9maW5pc2guYmluZChlbCkpO1xuXG4gICAgfVxuICB9XG59KTtcblxuLy/QtdGB0LvQuCDQvtGC0LrRgNGL0YLQviDQutCw0Log0LTQvtGH0LXRgNC90LXQtVxuLy9wYXJlbnRzX29wZW5fd2luZG93cy5qc1xuKGZ1bmN0aW9uKCl7XG4gIGlmKCF3aW5kb3cub3BlbmVyKXJldHVybjtcbiAgaWYoZG9jdW1lbnQucmVmZXJyZXIuaW5kZXhPZignc2VjcmV0ZGlzY291bnRlcicpPDApcmV0dXJuO1xuXG4gIGhyZWY9d2luZG93Lm9wZW5lci5sb2NhdGlvbi5ocmVmO1xuICBpZihcbiAgICBocmVmLmluZGV4T2YoJ3NvY2lhbHMnKT4wIHx8XG4gICAgaHJlZi5pbmRleE9mKCdsb2dpbicpPjAgfHxcbiAgICBocmVmLmluZGV4T2YoJ2FkbWluJyk+MCB8fFxuICAgIGhyZWYuaW5kZXhPZignYWNjb3VudCcpPjBcbiAgKXtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYoaHJlZi5pbmRleE9mKCdzdG9yZScpPjAgfHwgaHJlZi5pbmRleE9mKCdjb3Vwb24nKT4wIHx8IGhyZWYuaW5kZXhPZignc2V0dGluZ3MnKT4wKXtcbiAgICB3aW5kb3cub3BlbmVyLmxvY2F0aW9uLnJlbG9hZCgpO1xuICB9ZWxzZXtcbiAgICB3aW5kb3cub3BlbmVyLmxvY2F0aW9uLmhyZWY9bG9jYXRpb24uaHJlZjtcbiAgfVxuICB3aW5kb3cuY2xvc2UoKTtcbn0pKCk7XG5cbi8vaW1nLmpzXG4oZnVuY3Rpb24oKSB7XG5cbiAgZnVuY3Rpb24gaW1nX2xvYWRfZmluaXNoKCl7XG4gICAgdmFyIGRhdGE9dGhpcztcbiAgICB2YXIgaW1nID0gZGF0YS5pbWc7XG4gICAgaW1nLndyYXAoJzxkaXYgY2xhc3M9XCJkb3dubG9hZFwiPjwvZGl2PicpO1xuICAgIHZhciB3cmFwPWltZy5wYXJlbnQoKTtcbiAgICAkKCdib2R5JykuYXBwZW5kKGRhdGEuZWwpO1xuICAgIHNpemU9ZGF0YS5lbC53aWR0aCgpK1wieFwiK2RhdGEuZWwuaGVpZ2h0KCk7XG4gICAgZGF0YS5lbC5yZW1vdmUoKTtcbiAgICB3cmFwLmFwcGVuZCgnPHNwYW4+JytzaXplKyc8L3NwYW4+IDxhIGhyZWY9XCInK2RhdGEuc3JjKydcIiBkb3dubG9hZD7QodC60LDRh9Cw0YLRjDwvYT4nKVxuICB9XG5cbiAgdmFyIGltZ3MgPSAkKCcuZG93bmxvYWRzX2ltZyBpbWcnKTtcbiAgZm9yKHZhciBpPTA7aTxpbWdzLmxlbmd0aDtpKyspIHtcbiAgICB2YXIgaW1nPWltZ3MuZXEoaSk7XG4gICAgdmFyIHNyYz1pbWcuYXR0cignc3JjJyk7XG4gICAgaW1hZ2UgPSAkKCc8aW1nLz4nLCB7XG4gICAgICBzcmM6IHNyY1xuICAgIH0pO1xuICAgIGRhdGEgPSB7XG4gICAgICBzcmM6IHNyYyxcbiAgICAgIGltZzogaW1nLFxuICAgICAgZWw6aW1hZ2VcbiAgICB9O1xuICAgIGltYWdlLm9uKCdsb2FkJywgaW1nX2xvYWRfZmluaXNoLmJpbmQoZGF0YSkpXG4gIH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCl7XG5cbiAgICAkKCdib2R5Jykub24oJ2JlZm9yZVZhbGlkYXRlJywgJ2Zvcm0nLCBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIHZhciBpc1ZhbGlkID0gdHJ1ZTtcbiAgICAgICAgdmFyIHJlcXVpcmVkID0gJCh0aGF0KS5maW5kKCdpbnB1dFtyZXF1aXJlZD1cInRydWVcIl0sIGlucHV0W2FyaWEtcmVxdWlyZWQ9XCJ0cnVlXCJdLCB0ZXh0YXJlYVtyZXF1aXJlZD1cInRydWVcIl0sIHRleHRhcmVhW2FyaWEtcmVxdWlyZWQ9XCJ0cnVlXCJdJyk7XG4gICAgICAgIHZhciBmaXJzdEVycm9yID0gdHJ1ZTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXF1aXJlZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHJlcXVpcmVkLmVxKGkpLnZhbCgpLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAgICAgICBpc1ZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLm5vdGlmaSh7XG4gICAgICAgICAgICAgICAgICAgICd0eXBlJzogJ2VycicsXG4gICAgICAgICAgICAgICAgICAgICdtZXNzYWdlJzogJ9Cd0LXQvtCx0YXQvtC00LjQvNC+INC30LDQv9C+0LvQvdC40YLRjCAnICsgcmVxdWlyZWQuZXEoaSkuYXR0cignbmFtZScpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKGZpcnN0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlyc3RFcnJvciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAvL9C/0L7Qt9C40YbQuNC+0L3QuNGA0L7QstCw0L3QuNC1INC90LAgaW5wdXRcbiAgICAgICAgICAgICAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe3Njcm9sbFRvcDogJChyZXF1aXJlZC5lcShpKSkub2Zmc2V0KCkudG9wfSwgNTAwKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRhYiA9ICQocmVxdWlyZWQuZXEoaSkpLmNsb3Nlc3QoJy5jcGFfYm94Jyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0YWIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjbGFzc2VzID0gdGFiWzBdLmNsYXNzTGlzdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGo9MDsgaiA8IGNsYXNzZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2xhc3Nlc1tqXS5pbmRleE9mKCd0YWJfJykgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGFiSW5kZXggPSBjbGFzc2VzW2pdLnN1YnN0cmluZyg0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGF0KS5maW5kKCdpbnB1dFt0eXBlPVwicmFkaW9cIl1bdmFsdWU9XCInK3RhYkluZGV4KydcIl0nKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghaXNWYWxpZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKCk7XG4iLCIvKipcbiAqIEBhdXRob3IgemhpeGluIHdlbiA8d2VuemhpeGluMjAxMEBnbWFpbC5jb20+XG4gKiBAdmVyc2lvbiAxLjIuMVxuICpcbiAqIGh0dHA6Ly93ZW56aGl4aW4ubmV0LmNuL3AvbXVsdGlwbGUtc2VsZWN0L1xuICovXG5cbihmdW5jdGlvbiAoJCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gaXQgb25seSBkb2VzICclcycsIGFuZCByZXR1cm4gJycgd2hlbiBhcmd1bWVudHMgYXJlIHVuZGVmaW5lZFxuICAgIHZhciBzcHJpbnRmID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAgICAgIGZsYWcgPSB0cnVlLFxuICAgICAgICAgICAgaSA9IDE7XG5cbiAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoLyVzL2csIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBhcmcgPSBhcmdzW2krK107XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIGZsYWcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYXJnO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGZsYWcgPyBzdHIgOiAnJztcbiAgICB9O1xuXG4gICAgdmFyIHJlbW92ZURpYWNyaXRpY3MgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHZhciBkZWZhdWx0RGlhY3JpdGljc1JlbW92YWxNYXAgPSBbXG4gICAgICAgICAgICB7J2Jhc2UnOidBJywgJ2xldHRlcnMnOi9bXFx1MDA0MVxcdTI0QjZcXHVGRjIxXFx1MDBDMFxcdTAwQzFcXHUwMEMyXFx1MUVBNlxcdTFFQTRcXHUxRUFBXFx1MUVBOFxcdTAwQzNcXHUwMTAwXFx1MDEwMlxcdTFFQjBcXHUxRUFFXFx1MUVCNFxcdTFFQjJcXHUwMjI2XFx1MDFFMFxcdTAwQzRcXHUwMURFXFx1MUVBMlxcdTAwQzVcXHUwMUZBXFx1MDFDRFxcdTAyMDBcXHUwMjAyXFx1MUVBMFxcdTFFQUNcXHUxRUI2XFx1MUUwMFxcdTAxMDRcXHUwMjNBXFx1MkM2Rl0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidBQScsJ2xldHRlcnMnOi9bXFx1QTczMl0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidBRScsJ2xldHRlcnMnOi9bXFx1MDBDNlxcdTAxRkNcXHUwMUUyXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J0FPJywnbGV0dGVycyc6L1tcXHVBNzM0XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J0FVJywnbGV0dGVycyc6L1tcXHVBNzM2XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J0FWJywnbGV0dGVycyc6L1tcXHVBNzM4XFx1QTczQV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidBWScsJ2xldHRlcnMnOi9bXFx1QTczQ10vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidCJywgJ2xldHRlcnMnOi9bXFx1MDA0MlxcdTI0QjdcXHVGRjIyXFx1MUUwMlxcdTFFMDRcXHUxRTA2XFx1MDI0M1xcdTAxODJcXHUwMTgxXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J0MnLCAnbGV0dGVycyc6L1tcXHUwMDQzXFx1MjRCOFxcdUZGMjNcXHUwMTA2XFx1MDEwOFxcdTAxMEFcXHUwMTBDXFx1MDBDN1xcdTFFMDhcXHUwMTg3XFx1MDIzQlxcdUE3M0VdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonRCcsICdsZXR0ZXJzJzovW1xcdTAwNDRcXHUyNEI5XFx1RkYyNFxcdTFFMEFcXHUwMTBFXFx1MUUwQ1xcdTFFMTBcXHUxRTEyXFx1MUUwRVxcdTAxMTBcXHUwMThCXFx1MDE4QVxcdTAxODlcXHVBNzc5XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J0RaJywnbGV0dGVycyc6L1tcXHUwMUYxXFx1MDFDNF0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidEeicsJ2xldHRlcnMnOi9bXFx1MDFGMlxcdTAxQzVdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonRScsICdsZXR0ZXJzJzovW1xcdTAwNDVcXHUyNEJBXFx1RkYyNVxcdTAwQzhcXHUwMEM5XFx1MDBDQVxcdTFFQzBcXHUxRUJFXFx1MUVDNFxcdTFFQzJcXHUxRUJDXFx1MDExMlxcdTFFMTRcXHUxRTE2XFx1MDExNFxcdTAxMTZcXHUwMENCXFx1MUVCQVxcdTAxMUFcXHUwMjA0XFx1MDIwNlxcdTFFQjhcXHUxRUM2XFx1MDIyOFxcdTFFMUNcXHUwMTE4XFx1MUUxOFxcdTFFMUFcXHUwMTkwXFx1MDE4RV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidGJywgJ2xldHRlcnMnOi9bXFx1MDA0NlxcdTI0QkJcXHVGRjI2XFx1MUUxRVxcdTAxOTFcXHVBNzdCXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J0cnLCAnbGV0dGVycyc6L1tcXHUwMDQ3XFx1MjRCQ1xcdUZGMjdcXHUwMUY0XFx1MDExQ1xcdTFFMjBcXHUwMTFFXFx1MDEyMFxcdTAxRTZcXHUwMTIyXFx1MDFFNFxcdTAxOTNcXHVBN0EwXFx1QTc3RFxcdUE3N0VdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonSCcsICdsZXR0ZXJzJzovW1xcdTAwNDhcXHUyNEJEXFx1RkYyOFxcdTAxMjRcXHUxRTIyXFx1MUUyNlxcdTAyMUVcXHUxRTI0XFx1MUUyOFxcdTFFMkFcXHUwMTI2XFx1MkM2N1xcdTJDNzVcXHVBNzhEXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J0knLCAnbGV0dGVycyc6L1tcXHUwMDQ5XFx1MjRCRVxcdUZGMjlcXHUwMENDXFx1MDBDRFxcdTAwQ0VcXHUwMTI4XFx1MDEyQVxcdTAxMkNcXHUwMTMwXFx1MDBDRlxcdTFFMkVcXHUxRUM4XFx1MDFDRlxcdTAyMDhcXHUwMjBBXFx1MUVDQVxcdTAxMkVcXHUxRTJDXFx1MDE5N10vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidKJywgJ2xldHRlcnMnOi9bXFx1MDA0QVxcdTI0QkZcXHVGRjJBXFx1MDEzNFxcdTAyNDhdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonSycsICdsZXR0ZXJzJzovW1xcdTAwNEJcXHUyNEMwXFx1RkYyQlxcdTFFMzBcXHUwMUU4XFx1MUUzMlxcdTAxMzZcXHUxRTM0XFx1MDE5OFxcdTJDNjlcXHVBNzQwXFx1QTc0MlxcdUE3NDRcXHVBN0EyXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J0wnLCAnbGV0dGVycyc6L1tcXHUwMDRDXFx1MjRDMVxcdUZGMkNcXHUwMTNGXFx1MDEzOVxcdTAxM0RcXHUxRTM2XFx1MUUzOFxcdTAxM0JcXHUxRTNDXFx1MUUzQVxcdTAxNDFcXHUwMjNEXFx1MkM2MlxcdTJDNjBcXHVBNzQ4XFx1QTc0NlxcdUE3ODBdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonTEonLCdsZXR0ZXJzJzovW1xcdTAxQzddL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonTGonLCdsZXR0ZXJzJzovW1xcdTAxQzhdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonTScsICdsZXR0ZXJzJzovW1xcdTAwNERcXHUyNEMyXFx1RkYyRFxcdTFFM0VcXHUxRTQwXFx1MUU0MlxcdTJDNkVcXHUwMTlDXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J04nLCAnbGV0dGVycyc6L1tcXHUwMDRFXFx1MjRDM1xcdUZGMkVcXHUwMUY4XFx1MDE0M1xcdTAwRDFcXHUxRTQ0XFx1MDE0N1xcdTFFNDZcXHUwMTQ1XFx1MUU0QVxcdTFFNDhcXHUwMjIwXFx1MDE5RFxcdUE3OTBcXHVBN0E0XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J05KJywnbGV0dGVycyc6L1tcXHUwMUNBXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J05qJywnbGV0dGVycyc6L1tcXHUwMUNCXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J08nLCAnbGV0dGVycyc6L1tcXHUwMDRGXFx1MjRDNFxcdUZGMkZcXHUwMEQyXFx1MDBEM1xcdTAwRDRcXHUxRUQyXFx1MUVEMFxcdTFFRDZcXHUxRUQ0XFx1MDBENVxcdTFFNENcXHUwMjJDXFx1MUU0RVxcdTAxNENcXHUxRTUwXFx1MUU1MlxcdTAxNEVcXHUwMjJFXFx1MDIzMFxcdTAwRDZcXHUwMjJBXFx1MUVDRVxcdTAxNTBcXHUwMUQxXFx1MDIwQ1xcdTAyMEVcXHUwMUEwXFx1MUVEQ1xcdTFFREFcXHUxRUUwXFx1MUVERVxcdTFFRTJcXHUxRUNDXFx1MUVEOFxcdTAxRUFcXHUwMUVDXFx1MDBEOFxcdTAxRkVcXHUwMTg2XFx1MDE5RlxcdUE3NEFcXHVBNzRDXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J09JJywnbGV0dGVycyc6L1tcXHUwMUEyXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J09PJywnbGV0dGVycyc6L1tcXHVBNzRFXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J09VJywnbGV0dGVycyc6L1tcXHUwMjIyXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J1AnLCAnbGV0dGVycyc6L1tcXHUwMDUwXFx1MjRDNVxcdUZGMzBcXHUxRTU0XFx1MUU1NlxcdTAxQTRcXHUyQzYzXFx1QTc1MFxcdUE3NTJcXHVBNzU0XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J1EnLCAnbGV0dGVycyc6L1tcXHUwMDUxXFx1MjRDNlxcdUZGMzFcXHVBNzU2XFx1QTc1OFxcdTAyNEFdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonUicsICdsZXR0ZXJzJzovW1xcdTAwNTJcXHUyNEM3XFx1RkYzMlxcdTAxNTRcXHUxRTU4XFx1MDE1OFxcdTAyMTBcXHUwMjEyXFx1MUU1QVxcdTFFNUNcXHUwMTU2XFx1MUU1RVxcdTAyNENcXHUyQzY0XFx1QTc1QVxcdUE3QTZcXHVBNzgyXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J1MnLCAnbGV0dGVycyc6L1tcXHUwMDUzXFx1MjRDOFxcdUZGMzNcXHUxRTlFXFx1MDE1QVxcdTFFNjRcXHUwMTVDXFx1MUU2MFxcdTAxNjBcXHUxRTY2XFx1MUU2MlxcdTFFNjhcXHUwMjE4XFx1MDE1RVxcdTJDN0VcXHVBN0E4XFx1QTc4NF0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidUJywgJ2xldHRlcnMnOi9bXFx1MDA1NFxcdTI0QzlcXHVGRjM0XFx1MUU2QVxcdTAxNjRcXHUxRTZDXFx1MDIxQVxcdTAxNjJcXHUxRTcwXFx1MUU2RVxcdTAxNjZcXHUwMUFDXFx1MDFBRVxcdTAyM0VcXHVBNzg2XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J1RaJywnbGV0dGVycyc6L1tcXHVBNzI4XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J1UnLCAnbGV0dGVycyc6L1tcXHUwMDU1XFx1MjRDQVxcdUZGMzVcXHUwMEQ5XFx1MDBEQVxcdTAwREJcXHUwMTY4XFx1MUU3OFxcdTAxNkFcXHUxRTdBXFx1MDE2Q1xcdTAwRENcXHUwMURCXFx1MDFEN1xcdTAxRDVcXHUwMUQ5XFx1MUVFNlxcdTAxNkVcXHUwMTcwXFx1MDFEM1xcdTAyMTRcXHUwMjE2XFx1MDFBRlxcdTFFRUFcXHUxRUU4XFx1MUVFRVxcdTFFRUNcXHUxRUYwXFx1MUVFNFxcdTFFNzJcXHUwMTcyXFx1MUU3NlxcdTFFNzRcXHUwMjQ0XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J1YnLCAnbGV0dGVycyc6L1tcXHUwMDU2XFx1MjRDQlxcdUZGMzZcXHUxRTdDXFx1MUU3RVxcdTAxQjJcXHVBNzVFXFx1MDI0NV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidWWScsJ2xldHRlcnMnOi9bXFx1QTc2MF0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidXJywgJ2xldHRlcnMnOi9bXFx1MDA1N1xcdTI0Q0NcXHVGRjM3XFx1MUU4MFxcdTFFODJcXHUwMTc0XFx1MUU4NlxcdTFFODRcXHUxRTg4XFx1MkM3Ml0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidYJywgJ2xldHRlcnMnOi9bXFx1MDA1OFxcdTI0Q0RcXHVGRjM4XFx1MUU4QVxcdTFFOENdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonWScsICdsZXR0ZXJzJzovW1xcdTAwNTlcXHUyNENFXFx1RkYzOVxcdTFFRjJcXHUwMEREXFx1MDE3NlxcdTFFRjhcXHUwMjMyXFx1MUU4RVxcdTAxNzhcXHUxRUY2XFx1MUVGNFxcdTAxQjNcXHUwMjRFXFx1MUVGRV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidaJywgJ2xldHRlcnMnOi9bXFx1MDA1QVxcdTI0Q0ZcXHVGRjNBXFx1MDE3OVxcdTFFOTBcXHUwMTdCXFx1MDE3RFxcdTFFOTJcXHUxRTk0XFx1MDFCNVxcdTAyMjRcXHUyQzdGXFx1MkM2QlxcdUE3NjJdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonYScsICdsZXR0ZXJzJzovW1xcdTAwNjFcXHUyNEQwXFx1RkY0MVxcdTFFOUFcXHUwMEUwXFx1MDBFMVxcdTAwRTJcXHUxRUE3XFx1MUVBNVxcdTFFQUJcXHUxRUE5XFx1MDBFM1xcdTAxMDFcXHUwMTAzXFx1MUVCMVxcdTFFQUZcXHUxRUI1XFx1MUVCM1xcdTAyMjdcXHUwMUUxXFx1MDBFNFxcdTAxREZcXHUxRUEzXFx1MDBFNVxcdTAxRkJcXHUwMUNFXFx1MDIwMVxcdTAyMDNcXHUxRUExXFx1MUVBRFxcdTFFQjdcXHUxRTAxXFx1MDEwNVxcdTJDNjVcXHUwMjUwXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J2FhJywnbGV0dGVycyc6L1tcXHVBNzMzXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J2FlJywnbGV0dGVycyc6L1tcXHUwMEU2XFx1MDFGRFxcdTAxRTNdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonYW8nLCdsZXR0ZXJzJzovW1xcdUE3MzVdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonYXUnLCdsZXR0ZXJzJzovW1xcdUE3MzddL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonYXYnLCdsZXR0ZXJzJzovW1xcdUE3MzlcXHVBNzNCXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J2F5JywnbGV0dGVycyc6L1tcXHVBNzNEXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J2InLCAnbGV0dGVycyc6L1tcXHUwMDYyXFx1MjREMVxcdUZGNDJcXHUxRTAzXFx1MUUwNVxcdTFFMDdcXHUwMTgwXFx1MDE4M1xcdTAyNTNdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonYycsICdsZXR0ZXJzJzovW1xcdTAwNjNcXHUyNEQyXFx1RkY0M1xcdTAxMDdcXHUwMTA5XFx1MDEwQlxcdTAxMERcXHUwMEU3XFx1MUUwOVxcdTAxODhcXHUwMjNDXFx1QTczRlxcdTIxODRdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonZCcsICdsZXR0ZXJzJzovW1xcdTAwNjRcXHUyNEQzXFx1RkY0NFxcdTFFMEJcXHUwMTBGXFx1MUUwRFxcdTFFMTFcXHUxRTEzXFx1MUUwRlxcdTAxMTFcXHUwMThDXFx1MDI1NlxcdTAyNTdcXHVBNzdBXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J2R6JywnbGV0dGVycyc6L1tcXHUwMUYzXFx1MDFDNl0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidlJywgJ2xldHRlcnMnOi9bXFx1MDA2NVxcdTI0RDRcXHVGRjQ1XFx1MDBFOFxcdTAwRTlcXHUwMEVBXFx1MUVDMVxcdTFFQkZcXHUxRUM1XFx1MUVDM1xcdTFFQkRcXHUwMTEzXFx1MUUxNVxcdTFFMTdcXHUwMTE1XFx1MDExN1xcdTAwRUJcXHUxRUJCXFx1MDExQlxcdTAyMDVcXHUwMjA3XFx1MUVCOVxcdTFFQzdcXHUwMjI5XFx1MUUxRFxcdTAxMTlcXHUxRTE5XFx1MUUxQlxcdTAyNDdcXHUwMjVCXFx1MDFERF0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidmJywgJ2xldHRlcnMnOi9bXFx1MDA2NlxcdTI0RDVcXHVGRjQ2XFx1MUUxRlxcdTAxOTJcXHVBNzdDXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J2cnLCAnbGV0dGVycyc6L1tcXHUwMDY3XFx1MjRENlxcdUZGNDdcXHUwMUY1XFx1MDExRFxcdTFFMjFcXHUwMTFGXFx1MDEyMVxcdTAxRTdcXHUwMTIzXFx1MDFFNVxcdTAyNjBcXHVBN0ExXFx1MUQ3OVxcdUE3N0ZdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonaCcsICdsZXR0ZXJzJzovW1xcdTAwNjhcXHUyNEQ3XFx1RkY0OFxcdTAxMjVcXHUxRTIzXFx1MUUyN1xcdTAyMUZcXHUxRTI1XFx1MUUyOVxcdTFFMkJcXHUxRTk2XFx1MDEyN1xcdTJDNjhcXHUyQzc2XFx1MDI2NV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidodicsJ2xldHRlcnMnOi9bXFx1MDE5NV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidpJywgJ2xldHRlcnMnOi9bXFx1MDA2OVxcdTI0RDhcXHVGRjQ5XFx1MDBFQ1xcdTAwRURcXHUwMEVFXFx1MDEyOVxcdTAxMkJcXHUwMTJEXFx1MDBFRlxcdTFFMkZcXHUxRUM5XFx1MDFEMFxcdTAyMDlcXHUwMjBCXFx1MUVDQlxcdTAxMkZcXHUxRTJEXFx1MDI2OFxcdTAxMzFdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonaicsICdsZXR0ZXJzJzovW1xcdTAwNkFcXHUyNEQ5XFx1RkY0QVxcdTAxMzVcXHUwMUYwXFx1MDI0OV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidrJywgJ2xldHRlcnMnOi9bXFx1MDA2QlxcdTI0REFcXHVGRjRCXFx1MUUzMVxcdTAxRTlcXHUxRTMzXFx1MDEzN1xcdTFFMzVcXHUwMTk5XFx1MkM2QVxcdUE3NDFcXHVBNzQzXFx1QTc0NVxcdUE3QTNdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonbCcsICdsZXR0ZXJzJzovW1xcdTAwNkNcXHUyNERCXFx1RkY0Q1xcdTAxNDBcXHUwMTNBXFx1MDEzRVxcdTFFMzdcXHUxRTM5XFx1MDEzQ1xcdTFFM0RcXHUxRTNCXFx1MDE3RlxcdTAxNDJcXHUwMTlBXFx1MDI2QlxcdTJDNjFcXHVBNzQ5XFx1QTc4MVxcdUE3NDddL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonbGonLCdsZXR0ZXJzJzovW1xcdTAxQzldL2d9LFxuICAgICAgICAgICAgeydiYXNlJzonbScsICdsZXR0ZXJzJzovW1xcdTAwNkRcXHUyNERDXFx1RkY0RFxcdTFFM0ZcXHUxRTQxXFx1MUU0M1xcdTAyNzFcXHUwMjZGXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J24nLCAnbGV0dGVycyc6L1tcXHUwMDZFXFx1MjRERFxcdUZGNEVcXHUwMUY5XFx1MDE0NFxcdTAwRjFcXHUxRTQ1XFx1MDE0OFxcdTFFNDdcXHUwMTQ2XFx1MUU0QlxcdTFFNDlcXHUwMTlFXFx1MDI3MlxcdTAxNDlcXHVBNzkxXFx1QTdBNV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOiduaicsJ2xldHRlcnMnOi9bXFx1MDFDQ10vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidvJywgJ2xldHRlcnMnOi9bXFx1MDA2RlxcdTI0REVcXHVGRjRGXFx1MDBGMlxcdTAwRjNcXHUwMEY0XFx1MUVEM1xcdTFFRDFcXHUxRUQ3XFx1MUVENVxcdTAwRjVcXHUxRTREXFx1MDIyRFxcdTFFNEZcXHUwMTREXFx1MUU1MVxcdTFFNTNcXHUwMTRGXFx1MDIyRlxcdTAyMzFcXHUwMEY2XFx1MDIyQlxcdTFFQ0ZcXHUwMTUxXFx1MDFEMlxcdTAyMERcXHUwMjBGXFx1MDFBMVxcdTFFRERcXHUxRURCXFx1MUVFMVxcdTFFREZcXHUxRUUzXFx1MUVDRFxcdTFFRDlcXHUwMUVCXFx1MDFFRFxcdTAwRjhcXHUwMUZGXFx1MDI1NFxcdUE3NEJcXHVBNzREXFx1MDI3NV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidvaScsJ2xldHRlcnMnOi9bXFx1MDFBM10vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidvdScsJ2xldHRlcnMnOi9bXFx1MDIyM10vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidvbycsJ2xldHRlcnMnOi9bXFx1QTc0Rl0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidwJywnbGV0dGVycyc6L1tcXHUwMDcwXFx1MjRERlxcdUZGNTBcXHUxRTU1XFx1MUU1N1xcdTAxQTVcXHUxRDdEXFx1QTc1MVxcdUE3NTNcXHVBNzU1XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J3EnLCdsZXR0ZXJzJzovW1xcdTAwNzFcXHUyNEUwXFx1RkY1MVxcdTAyNEJcXHVBNzU3XFx1QTc1OV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidyJywnbGV0dGVycyc6L1tcXHUwMDcyXFx1MjRFMVxcdUZGNTJcXHUwMTU1XFx1MUU1OVxcdTAxNTlcXHUwMjExXFx1MDIxM1xcdTFFNUJcXHUxRTVEXFx1MDE1N1xcdTFFNUZcXHUwMjREXFx1MDI3RFxcdUE3NUJcXHVBN0E3XFx1QTc4M10vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOidzJywnbGV0dGVycyc6L1tcXHUwMDczXFx1MjRFMlxcdUZGNTNcXHUwMERGXFx1MDE1QlxcdTFFNjVcXHUwMTVEXFx1MUU2MVxcdTAxNjFcXHUxRTY3XFx1MUU2M1xcdTFFNjlcXHUwMjE5XFx1MDE1RlxcdTAyM0ZcXHVBN0E5XFx1QTc4NVxcdTFFOUJdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzondCcsJ2xldHRlcnMnOi9bXFx1MDA3NFxcdTI0RTNcXHVGRjU0XFx1MUU2QlxcdTFFOTdcXHUwMTY1XFx1MUU2RFxcdTAyMUJcXHUwMTYzXFx1MUU3MVxcdTFFNkZcXHUwMTY3XFx1MDFBRFxcdTAyODhcXHUyQzY2XFx1QTc4N10vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOid0eicsJ2xldHRlcnMnOi9bXFx1QTcyOV0vZ30sXG4gICAgICAgICAgICB7J2Jhc2UnOid1JywnbGV0dGVycyc6L1tcXHUwMDc1XFx1MjRFNFxcdUZGNTVcXHUwMEY5XFx1MDBGQVxcdTAwRkJcXHUwMTY5XFx1MUU3OVxcdTAxNkJcXHUxRTdCXFx1MDE2RFxcdTAwRkNcXHUwMURDXFx1MDFEOFxcdTAxRDZcXHUwMURBXFx1MUVFN1xcdTAxNkZcXHUwMTcxXFx1MDFENFxcdTAyMTVcXHUwMjE3XFx1MDFCMFxcdTFFRUJcXHUxRUU5XFx1MUVFRlxcdTFFRURcXHUxRUYxXFx1MUVFNVxcdTFFNzNcXHUwMTczXFx1MUU3N1xcdTFFNzVcXHUwMjg5XS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J3YnLCdsZXR0ZXJzJzovW1xcdTAwNzZcXHUyNEU1XFx1RkY1NlxcdTFFN0RcXHUxRTdGXFx1MDI4QlxcdUE3NUZcXHUwMjhDXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J3Z5JywnbGV0dGVycyc6L1tcXHVBNzYxXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J3cnLCdsZXR0ZXJzJzovW1xcdTAwNzdcXHUyNEU2XFx1RkY1N1xcdTFFODFcXHUxRTgzXFx1MDE3NVxcdTFFODdcXHUxRTg1XFx1MUU5OFxcdTFFODlcXHUyQzczXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J3gnLCdsZXR0ZXJzJzovW1xcdTAwNzhcXHUyNEU3XFx1RkY1OFxcdTFFOEJcXHUxRThEXS9nfSxcbiAgICAgICAgICAgIHsnYmFzZSc6J3knLCdsZXR0ZXJzJzovW1xcdTAwNzlcXHUyNEU4XFx1RkY1OVxcdTFFRjNcXHUwMEZEXFx1MDE3N1xcdTFFRjlcXHUwMjMzXFx1MUU4RlxcdTAwRkZcXHUxRUY3XFx1MUU5OVxcdTFFRjVcXHUwMUI0XFx1MDI0RlxcdTFFRkZdL2d9LFxuICAgICAgICAgICAgeydiYXNlJzoneicsJ2xldHRlcnMnOi9bXFx1MDA3QVxcdTI0RTlcXHVGRjVBXFx1MDE3QVxcdTFFOTFcXHUwMTdDXFx1MDE3RVxcdTFFOTNcXHUxRTk1XFx1MDFCNlxcdTAyMjVcXHUwMjQwXFx1MkM2Q1xcdUE3NjNdL2d9XG4gICAgICAgIF07XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkZWZhdWx0RGlhY3JpdGljc1JlbW92YWxNYXAubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKGRlZmF1bHREaWFjcml0aWNzUmVtb3ZhbE1hcFtpXS5sZXR0ZXJzLCBkZWZhdWx0RGlhY3JpdGljc1JlbW92YWxNYXBbaV0uYmFzZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc3RyO1xuXG4gICB9O1xuXG4gICAgZnVuY3Rpb24gTXVsdGlwbGVTZWxlY3QoJGVsLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgIG5hbWUgPSAkZWwuYXR0cignbmFtZScpIHx8IG9wdGlvbnMubmFtZSB8fCAnJztcblxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXG4gICAgICAgIC8vIGhpZGUgc2VsZWN0IGVsZW1lbnRcbiAgICAgICAgdGhpcy4kZWwgPSAkZWwuaGlkZSgpO1xuXG4gICAgICAgIC8vIGxhYmVsIGVsZW1lbnRcbiAgICAgICAgdGhpcy4kbGFiZWwgPSB0aGlzLiRlbC5jbG9zZXN0KCdsYWJlbCcpO1xuICAgICAgICBpZiAodGhpcy4kbGFiZWwubGVuZ3RoID09PSAwICYmIHRoaXMuJGVsLmF0dHIoJ2lkJykpIHtcbiAgICAgICAgICAgIHRoaXMuJGxhYmVsID0gJChzcHJpbnRmKCdsYWJlbFtmb3I9XCIlc1wiXScsIHRoaXMuJGVsLmF0dHIoJ2lkJykucmVwbGFjZSgvOi9nLCAnXFxcXDonKSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmVzdG9yZSBjbGFzcyBhbmQgdGl0bGUgZnJvbSBzZWxlY3QgZWxlbWVudFxuICAgICAgICB0aGlzLiRwYXJlbnQgPSAkKHNwcmludGYoXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cIm1zLXBhcmVudCAlc1wiICVzLz4nLFxuICAgICAgICAgICAgJGVsLmF0dHIoJ2NsYXNzJykgfHwgJycsXG4gICAgICAgICAgICBzcHJpbnRmKCd0aXRsZT1cIiVzXCInLCAkZWwuYXR0cigndGl0bGUnKSkpKTtcblxuICAgICAgICAvLyBhZGQgcGxhY2Vob2xkZXIgdG8gY2hvaWNlIGJ1dHRvblxuICAgICAgICB0aGlzLiRjaG9pY2UgPSAkKHNwcmludGYoW1xuICAgICAgICAgICAgICAgICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cIm1zLWNob2ljZVwiPicsXG4gICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwicGxhY2Vob2xkZXJcIj4lczwvc3Bhbj4nLFxuICAgICAgICAgICAgICAgICc8ZGl2PjwvZGl2PicsXG4gICAgICAgICAgICAgICAgJzwvYnV0dG9uPidcbiAgICAgICAgICAgIF0uam9pbignJyksXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMucGxhY2Vob2xkZXIpKTtcblxuICAgICAgICAvLyBkZWZhdWx0IHBvc2l0aW9uIGlzIGJvdHRvbVxuICAgICAgICB0aGlzLiRkcm9wID0gJChzcHJpbnRmKCc8ZGl2IGNsYXNzPVwibXMtZHJvcCAlc1wiJXM+PC9kaXY+JyxcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wb3NpdGlvbixcbiAgICAgICAgICAgIHNwcmludGYoJyBzdHlsZT1cIndpZHRoOiAlc1wiJywgdGhpcy5vcHRpb25zLmRyb3BXaWR0aCkpKTtcblxuICAgICAgICB0aGlzLiRlbC5hZnRlcih0aGlzLiRwYXJlbnQpO1xuICAgICAgICB0aGlzLiRwYXJlbnQuYXBwZW5kKHRoaXMuJGNob2ljZSk7XG4gICAgICAgIHRoaXMuJHBhcmVudC5hcHBlbmQodGhpcy4kZHJvcCk7XG5cbiAgICAgICAgaWYgKHRoaXMuJGVsLnByb3AoJ2Rpc2FibGVkJykpIHtcbiAgICAgICAgICAgIHRoaXMuJGNob2ljZS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLiRwYXJlbnQuY3NzKCd3aWR0aCcsXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMud2lkdGggfHxcbiAgICAgICAgICAgIHRoaXMuJGVsLmNzcygnd2lkdGgnKSB8fFxuICAgICAgICAgICAgdGhpcy4kZWwub3V0ZXJXaWR0aCgpICsgMjApO1xuXG4gICAgICAgIHRoaXMuc2VsZWN0QWxsTmFtZSA9ICdkYXRhLW5hbWU9XCJzZWxlY3RBbGwnICsgbmFtZSArICdcIic7XG4gICAgICAgIHRoaXMuc2VsZWN0R3JvdXBOYW1lID0gJ2RhdGEtbmFtZT1cInNlbGVjdEdyb3VwJyArIG5hbWUgKyAnXCInO1xuICAgICAgICB0aGlzLnNlbGVjdEl0ZW1OYW1lID0gJ2RhdGEtbmFtZT1cInNlbGVjdEl0ZW0nICsgbmFtZSArICdcIic7XG5cbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMua2VlcE9wZW4pIHtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCQoZS50YXJnZXQpWzBdID09PSB0aGF0LiRjaG9pY2VbMF0gfHxcbiAgICAgICAgICAgICAgICAgICAgJChlLnRhcmdldCkucGFyZW50cygnLm1zLWNob2ljZScpWzBdID09PSB0aGF0LiRjaG9pY2VbMF0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoKCQoZS50YXJnZXQpWzBdID09PSB0aGF0LiRkcm9wWzBdIHx8XG4gICAgICAgICAgICAgICAgICAgICQoZS50YXJnZXQpLnBhcmVudHMoJy5tcy1kcm9wJylbMF0gIT09IHRoYXQuJGRyb3BbMF0gJiYgZS50YXJnZXQgIT09ICRlbFswXSkgJiZcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5vcHRpb25zLmlzT3Blbikge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBNdWx0aXBsZVNlbGVjdC5wcm90b3R5cGUgPSB7XG4gICAgICAgIGNvbnN0cnVjdG9yOiBNdWx0aXBsZVNlbGVjdCxcblxuICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgJHVsID0gJCgnPHVsPjwvdWw+Jyk7XG5cbiAgICAgICAgICAgIHRoaXMuJGRyb3AuaHRtbCgnJyk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZmlsdGVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZHJvcC5hcHBlbmQoW1xuICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cIm1zLXNlYXJjaFwiPicsXG4gICAgICAgICAgICAgICAgICAgICc8aW5wdXQgdHlwZT1cInRleHRcIiBhdXRvY29tcGxldGU9XCJvZmZcIiBhdXRvY29ycmVjdD1cIm9mZlwiIGF1dG9jYXBpdGlsaXplPVwib2ZmXCIgc3BlbGxjaGVjaz1cImZhbHNlXCI+JyxcbiAgICAgICAgICAgICAgICAgICAgJzwvZGl2PiddLmpvaW4oJycpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zZWxlY3RBbGwgJiYgIXRoaXMub3B0aW9ucy5zaW5nbGUpIHtcbiAgICAgICAgICAgICAgICAkdWwuYXBwZW5kKFtcbiAgICAgICAgICAgICAgICAgICAgJzxsaSBjbGFzcz1cIm1zLXNlbGVjdC1hbGxcIj4nLFxuICAgICAgICAgICAgICAgICAgICAnPGxhYmVsPicsXG4gICAgICAgICAgICAgICAgICAgIHNwcmludGYoJzxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiAlcyAvPiAnLCB0aGlzLnNlbGVjdEFsbE5hbWUpLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuc2VsZWN0QWxsRGVsaW1pdGVyWzBdLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuc2VsZWN0QWxsVGV4dCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnNlbGVjdEFsbERlbGltaXRlclsxXSxcbiAgICAgICAgICAgICAgICAgICAgJzwvbGFiZWw+JyxcbiAgICAgICAgICAgICAgICAgICAgJzwvbGk+J1xuICAgICAgICAgICAgICAgIF0uam9pbignJykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkLmVhY2godGhpcy4kZWwuY2hpbGRyZW4oKSwgZnVuY3Rpb24gKGksIGVsbSkge1xuICAgICAgICAgICAgICAgICR1bC5hcHBlbmQodGhhdC5vcHRpb25Ub0h0bWwoaSwgZWxtKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICR1bC5hcHBlbmQoc3ByaW50ZignPGxpIGNsYXNzPVwibXMtbm8tcmVzdWx0c1wiPiVzPC9saT4nLCB0aGlzLm9wdGlvbnMubm9NYXRjaGVzRm91bmQpKTtcbiAgICAgICAgICAgIHRoaXMuJGRyb3AuYXBwZW5kKCR1bCk7XG5cbiAgICAgICAgICAgIHRoaXMuJGRyb3AuZmluZCgndWwnKS5jc3MoJ21heC1oZWlnaHQnLCB0aGlzLm9wdGlvbnMubWF4SGVpZ2h0ICsgJ3B4Jyk7XG4gICAgICAgICAgICB0aGlzLiRkcm9wLmZpbmQoJy5tdWx0aXBsZScpLmNzcygnd2lkdGgnLCB0aGlzLm9wdGlvbnMubXVsdGlwbGVXaWR0aCArICdweCcpO1xuXG4gICAgICAgICAgICB0aGlzLiRzZWFyY2hJbnB1dCA9IHRoaXMuJGRyb3AuZmluZCgnLm1zLXNlYXJjaCBpbnB1dCcpO1xuICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsID0gdGhpcy4kZHJvcC5maW5kKCdpbnB1dFsnICsgdGhpcy5zZWxlY3RBbGxOYW1lICsgJ10nKTtcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEdyb3VwcyA9IHRoaXMuJGRyb3AuZmluZCgnaW5wdXRbJyArIHRoaXMuc2VsZWN0R3JvdXBOYW1lICsgJ10nKTtcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEl0ZW1zID0gdGhpcy4kZHJvcC5maW5kKCdpbnB1dFsnICsgdGhpcy5zZWxlY3RJdGVtTmFtZSArICddOmVuYWJsZWQnKTtcbiAgICAgICAgICAgIHRoaXMuJGRpc2FibGVJdGVtcyA9IHRoaXMuJGRyb3AuZmluZCgnaW5wdXRbJyArIHRoaXMuc2VsZWN0SXRlbU5hbWUgKyAnXTpkaXNhYmxlZCcpO1xuICAgICAgICAgICAgdGhpcy4kbm9SZXN1bHRzID0gdGhpcy4kZHJvcC5maW5kKCcubXMtbm8tcmVzdWx0cycpO1xuXG4gICAgICAgICAgICB0aGlzLmV2ZW50cygpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVTZWxlY3RBbGwodHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSh0cnVlKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pc09wZW4pIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvcHRpb25Ub0h0bWw6IGZ1bmN0aW9uIChpLCBlbG0sIGdyb3VwLCBncm91cERpc2FibGVkKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgJGVsbSA9ICQoZWxtKSxcbiAgICAgICAgICAgICAgICBjbGFzc2VzID0gJGVsbS5hdHRyKCdjbGFzcycpIHx8ICcnLFxuICAgICAgICAgICAgICAgIHRpdGxlID0gc3ByaW50ZigndGl0bGU9XCIlc1wiJywgJGVsbS5hdHRyKCd0aXRsZScpKSxcbiAgICAgICAgICAgICAgICBtdWx0aXBsZSA9IHRoaXMub3B0aW9ucy5tdWx0aXBsZSA/ICdtdWx0aXBsZScgOiAnJyxcbiAgICAgICAgICAgICAgICBkaXNhYmxlZCxcbiAgICAgICAgICAgICAgICB0eXBlID0gdGhpcy5vcHRpb25zLnNpbmdsZSA/ICdyYWRpbycgOiAnY2hlY2tib3gnO1xuXG4gICAgICAgICAgICBpZiAoJGVsbS5pcygnb3B0aW9uJykpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSAkZWxtLnZhbCgpLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gdGhhdC5vcHRpb25zLnRleHRUZW1wbGF0ZSgkZWxtKSxcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSAkZWxtLnByb3AoJ3NlbGVjdGVkJyksXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlID0gc3ByaW50Zignc3R5bGU9XCIlc1wiJywgdGhpcy5vcHRpb25zLnN0eWxlcih2YWx1ZSkpLFxuICAgICAgICAgICAgICAgICAgICAkZWw7XG5cbiAgICAgICAgICAgICAgICBkaXNhYmxlZCA9IGdyb3VwRGlzYWJsZWQgfHwgJGVsbS5wcm9wKCdkaXNhYmxlZCcpO1xuXG4gICAgICAgICAgICAgICAgJGVsID0gJChbXG4gICAgICAgICAgICAgICAgICAgIHNwcmludGYoJzxsaSBjbGFzcz1cIiVzICVzXCIgJXMgJXM+JywgbXVsdGlwbGUsIGNsYXNzZXMsIHRpdGxlLCBzdHlsZSksXG4gICAgICAgICAgICAgICAgICAgIHNwcmludGYoJzxsYWJlbCBjbGFzcz1cIiVzXCI+JywgZGlzYWJsZWQgPyAnZGlzYWJsZWQnIDogJycpLFxuICAgICAgICAgICAgICAgICAgICBzcHJpbnRmKCc8aW5wdXQgdHlwZT1cIiVzXCIgJXMlcyVzJXM+JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGUsIHRoaXMuc2VsZWN0SXRlbU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZCA/ICcgY2hlY2tlZD1cImNoZWNrZWRcIicgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkID8gJyBkaXNhYmxlZD1cImRpc2FibGVkXCInIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBzcHJpbnRmKCcgZGF0YS1ncm91cD1cIiVzXCInLCBncm91cCkpLFxuICAgICAgICAgICAgICAgICAgICBzcHJpbnRmKCc8c3Bhbj4lczwvc3Bhbj4nLCB0ZXh0KSxcbiAgICAgICAgICAgICAgICAgICAgJzwvbGFiZWw+JyxcbiAgICAgICAgICAgICAgICAgICAgJzwvbGk+J1xuICAgICAgICAgICAgICAgIF0uam9pbignJykpO1xuICAgICAgICAgICAgICAgICRlbC5maW5kKCdpbnB1dCcpLnZhbCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRlbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgkZWxtLmlzKCdvcHRncm91cCcpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxhYmVsID0gdGhhdC5vcHRpb25zLmxhYmVsVGVtcGxhdGUoJGVsbSksXG4gICAgICAgICAgICAgICAgICAgICRncm91cCA9ICQoJzxkaXYvPicpO1xuXG4gICAgICAgICAgICAgICAgZ3JvdXAgPSAnZ3JvdXBfJyArIGk7XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQgPSAkZWxtLnByb3AoJ2Rpc2FibGVkJyk7XG5cbiAgICAgICAgICAgICAgICAkZ3JvdXAuYXBwZW5kKFtcbiAgICAgICAgICAgICAgICAgICAgJzxsaSBjbGFzcz1cImdyb3VwXCI+JyxcbiAgICAgICAgICAgICAgICAgICAgc3ByaW50ZignPGxhYmVsIGNsYXNzPVwib3B0Z3JvdXAgJXNcIiBkYXRhLWdyb3VwPVwiJXNcIj4nLCBkaXNhYmxlZCA/ICdkaXNhYmxlZCcgOiAnJywgZ3JvdXApLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuaGlkZU9wdGdyb3VwQ2hlY2tib3hlcyB8fCB0aGlzLm9wdGlvbnMuc2luZ2xlID8gJycgOlxuICAgICAgICAgICAgICAgICAgICAgICAgc3ByaW50ZignPGlucHV0IHR5cGU9XCJjaGVja2JveFwiICVzICVzPicsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdEdyb3VwTmFtZSwgZGlzYWJsZWQgPyAnZGlzYWJsZWQ9XCJkaXNhYmxlZFwiJyA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWwsXG4gICAgICAgICAgICAgICAgICAgICc8L2xhYmVsPicsXG4gICAgICAgICAgICAgICAgICAgICc8L2xpPidcbiAgICAgICAgICAgICAgICBdLmpvaW4oJycpKTtcblxuICAgICAgICAgICAgICAgICQuZWFjaCgkZWxtLmNoaWxkcmVuKCksIGZ1bmN0aW9uIChpLCBlbG0pIHtcbiAgICAgICAgICAgICAgICAgICAgJGdyb3VwLmFwcGVuZCh0aGF0Lm9wdGlvblRvSHRtbChpLCBlbG0sIGdyb3VwLCBkaXNhYmxlZCkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiAkZ3JvdXAuaHRtbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGV2ZW50czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHRvZ2dsZU9wZW4gPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXRbdGhhdC5vcHRpb25zLmlzT3BlbiA/ICdjbG9zZScgOiAnb3BlbiddKCk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuJGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kbGFiZWwub2ZmKCdjbGljaycpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlLnRhcmdldC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpICE9PSAnbGFiZWwnIHx8IGUudGFyZ2V0ICE9PSB0aGlzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdG9nZ2xlT3BlbihlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGF0Lm9wdGlvbnMuZmlsdGVyIHx8ICF0aGF0Lm9wdGlvbnMuaXNPcGVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTsgLy8gQ2F1c2VzIGxvc3QgZm9jdXMgb3RoZXJ3aXNlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuJGNob2ljZS5vZmYoJ2NsaWNrJykub24oJ2NsaWNrJywgdG9nZ2xlT3BlbilcbiAgICAgICAgICAgICAgICAub2ZmKCdmb2N1cycpLm9uKCdmb2N1cycsIHRoaXMub3B0aW9ucy5vbkZvY3VzKVxuICAgICAgICAgICAgICAgIC5vZmYoJ2JsdXInKS5vbignYmx1cicsIHRoaXMub3B0aW9ucy5vbkJsdXIpO1xuXG4gICAgICAgICAgICB0aGlzLiRwYXJlbnQub2ZmKCdrZXlkb3duJykub24oJ2tleWRvd24nLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDI3OiAvLyBlc2Mga2V5XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LiRjaG9pY2UuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLiRzZWFyY2hJbnB1dC5vZmYoJ2tleWRvd24nKS5vbigna2V5ZG93bicsZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAvLyBFbnN1cmUgc2hpZnQtdGFiIGNhdXNlcyBsb3N0IGZvY3VzIGZyb20gZmlsdGVyIGFzIHdpdGggY2xpY2tpbmcgYXdheVxuICAgICAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDkgJiYgZS5zaGlmdEtleSkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkub2ZmKCdrZXl1cCcpLm9uKCdrZXl1cCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgLy8gZW50ZXIgb3Igc3BhY2VcbiAgICAgICAgICAgICAgICAvLyBBdm9pZCBzZWxlY3RpbmcvZGVzZWxlY3RpbmcgaWYgbm8gY2hvaWNlcyBtYWRlXG4gICAgICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy5maWx0ZXJBY2NlcHRPbkVudGVyICYmIChlLndoaWNoID09PSAxMyB8fCBlLndoaWNoID09IDMyKSAmJiB0aGF0LiRzZWFyY2hJbnB1dC52YWwoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LiRzZWxlY3RBbGwuY2xpY2soKTtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhhdC5maWx0ZXIoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwub2ZmKCdjbGljaycpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgY2hlY2tlZCA9ICQodGhpcykucHJvcCgnY2hlY2tlZCcpLFxuICAgICAgICAgICAgICAgICAgICAkaXRlbXMgPSB0aGF0LiRzZWxlY3RJdGVtcy5maWx0ZXIoJzp2aXNpYmxlJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoJGl0ZW1zLmxlbmd0aCA9PT0gdGhhdC4kc2VsZWN0SXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXRbY2hlY2tlZCA/ICdjaGVja0FsbCcgOiAndW5jaGVja0FsbCddKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgLy8gd2hlbiB0aGUgZmlsdGVyIG9wdGlvbiBpcyB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuJHNlbGVjdEdyb3Vwcy5wcm9wKCdjaGVja2VkJywgY2hlY2tlZCk7XG4gICAgICAgICAgICAgICAgICAgICRpdGVtcy5wcm9wKCdjaGVja2VkJywgY2hlY2tlZCk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQub3B0aW9uc1tjaGVja2VkID8gJ29uQ2hlY2tBbGwnIDogJ29uVW5jaGVja0FsbCddKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQudXBkYXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RHcm91cHMub2ZmKCdjbGljaycpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgZ3JvdXAgPSAkKHRoaXMpLnBhcmVudCgpLmF0dHIoJ2RhdGEtZ3JvdXAnKSxcbiAgICAgICAgICAgICAgICAgICAgJGl0ZW1zID0gdGhhdC4kc2VsZWN0SXRlbXMuZmlsdGVyKCc6dmlzaWJsZScpLFxuICAgICAgICAgICAgICAgICAgICAkY2hpbGRyZW4gPSAkaXRlbXMuZmlsdGVyKHNwcmludGYoJ1tkYXRhLWdyb3VwPVwiJXNcIl0nLCBncm91cCkpLFxuICAgICAgICAgICAgICAgICAgICBjaGVja2VkID0gJGNoaWxkcmVuLmxlbmd0aCAhPT0gJGNoaWxkcmVuLmZpbHRlcignOmNoZWNrZWQnKS5sZW5ndGg7XG5cbiAgICAgICAgICAgICAgICAkY2hpbGRyZW4ucHJvcCgnY2hlY2tlZCcsIGNoZWNrZWQpO1xuICAgICAgICAgICAgICAgIHRoYXQudXBkYXRlU2VsZWN0QWxsKCk7XG4gICAgICAgICAgICAgICAgdGhhdC51cGRhdGUoKTtcbiAgICAgICAgICAgICAgICB0aGF0Lm9wdGlvbnMub25PcHRncm91cENsaWNrKHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICQodGhpcykucGFyZW50KCkudGV4dCgpLFxuICAgICAgICAgICAgICAgICAgICBjaGVja2VkOiBjaGVja2VkLFxuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbjogJGNoaWxkcmVuLmdldCgpLFxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZTogdGhhdFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RJdGVtcy5vZmYoJ2NsaWNrJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoYXQudXBkYXRlU2VsZWN0QWxsKCk7XG4gICAgICAgICAgICAgICAgdGhhdC51cGRhdGUoKTtcbiAgICAgICAgICAgICAgICB0aGF0LnVwZGF0ZU9wdEdyb3VwU2VsZWN0KCk7XG4gICAgICAgICAgICAgICAgdGhhdC5vcHRpb25zLm9uQ2xpY2soe1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJCh0aGlzKS5wYXJlbnQoKS50ZXh0KCksXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAkKHRoaXMpLnZhbCgpLFxuICAgICAgICAgICAgICAgICAgICBjaGVja2VkOiAkKHRoaXMpLnByb3AoJ2NoZWNrZWQnKSxcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2U6IHRoYXRcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMuc2luZ2xlICYmIHRoYXQub3B0aW9ucy5pc09wZW4gJiYgIXRoYXQub3B0aW9ucy5rZWVwT3Blbikge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy5zaW5nbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNsaWNrZWRWYWwgPSAkKHRoaXMpLnZhbCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LiRzZWxlY3RJdGVtcy5maWx0ZXIoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJCh0aGlzKS52YWwoKSAhPT0gY2xpY2tlZFZhbDtcbiAgICAgICAgICAgICAgICAgICAgfSkuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQudXBkYXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb3BlbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuJGNob2ljZS5oYXNDbGFzcygnZGlzYWJsZWQnKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5pc09wZW4gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy4kY2hvaWNlLmZpbmQoJz5kaXYnKS5hZGRDbGFzcygnb3BlbicpO1xuICAgICAgICAgICAgdGhpcy4kZHJvcFt0aGlzLmFuaW1hdGVNZXRob2QoJ3Nob3cnKV0oKTtcblxuICAgICAgICAgICAgLy8gZml4IGZpbHRlciBidWc6IG5vIHJlc3VsdHMgc2hvd1xuICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsLnBhcmVudCgpLnNob3coKTtcbiAgICAgICAgICAgIHRoaXMuJG5vUmVzdWx0cy5oaWRlKCk7XG5cbiAgICAgICAgICAgIC8vIEZpeCAjNzc6ICdBbGwgc2VsZWN0ZWQnIHdoZW4gbm8gb3B0aW9uc1xuICAgICAgICAgICAgaWYgKCF0aGlzLiRlbC5jaGlsZHJlbigpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbC5wYXJlbnQoKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy4kbm9SZXN1bHRzLnNob3coKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gdGhpcy4kZHJvcC5vZmZzZXQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLiRkcm9wLmFwcGVuZFRvKCQodGhpcy5vcHRpb25zLmNvbnRhaW5lcikpO1xuICAgICAgICAgICAgICAgIHRoaXMuJGRyb3Aub2Zmc2V0KHtcbiAgICAgICAgICAgICAgICAgICAgdG9wOiBvZmZzZXQudG9wLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiBvZmZzZXQubGVmdFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmZpbHRlcikge1xuICAgICAgICAgICAgICAgIHRoaXMuJHNlYXJjaElucHV0LnZhbCgnJyk7XG4gICAgICAgICAgICAgICAgdGhpcy4kc2VhcmNoSW5wdXQuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZpbHRlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uT3BlbigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNsb3NlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuaXNPcGVuID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLiRjaG9pY2UuZmluZCgnPmRpdicpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgICAgICB0aGlzLiRkcm9wW3RoaXMuYW5pbWF0ZU1ldGhvZCgnaGlkZScpXSgpO1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRwYXJlbnQuYXBwZW5kKHRoaXMuJGRyb3ApO1xuICAgICAgICAgICAgICAgIHRoaXMuJGRyb3AuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgJ3RvcCc6ICdhdXRvJyxcbiAgICAgICAgICAgICAgICAgICAgJ2xlZnQnOiAnYXV0bydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkNsb3NlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYW5pbWF0ZU1ldGhvZDogZnVuY3Rpb24gKG1ldGhvZCkge1xuICAgICAgICAgICAgdmFyIG1ldGhvZHMgPSB7XG4gICAgICAgICAgICAgICAgc2hvdzoge1xuICAgICAgICAgICAgICAgICAgICBmYWRlOiAnZmFkZUluJyxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGU6ICdzbGlkZURvd24nXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBoaWRlOiB7XG4gICAgICAgICAgICAgICAgICAgIGZhZGU6ICdmYWRlT3V0JyxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGU6ICdzbGlkZVVwJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBtZXRob2RzW21ldGhvZF1bdGhpcy5vcHRpb25zLmFuaW1hdGVdIHx8IG1ldGhvZDtcbiAgICAgICAgfSxcblxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIChpc0luaXQpIHtcbiAgICAgICAgICAgIHZhciBzZWxlY3RzID0gdGhpcy5vcHRpb25zLmRpc3BsYXlWYWx1ZXMgPyB0aGlzLmdldFNlbGVjdHMoKSA6IHRoaXMuZ2V0U2VsZWN0cygndGV4dCcpLFxuICAgICAgICAgICAgICAgICRzcGFuID0gdGhpcy4kY2hvaWNlLmZpbmQoJz5zcGFuJyksXG4gICAgICAgICAgICAgICAgc2wgPSBzZWxlY3RzLmxlbmd0aDtcblxuICAgICAgICAgICAgaWYgKHNsID09PSAwKSB7XG4gICAgICAgICAgICAgICAgJHNwYW4uYWRkQ2xhc3MoJ3BsYWNlaG9sZGVyJykuaHRtbCh0aGlzLm9wdGlvbnMucGxhY2Vob2xkZXIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuYWxsU2VsZWN0ZWQgJiYgc2wgPT09IHRoaXMuJHNlbGVjdEl0ZW1zLmxlbmd0aCArIHRoaXMuJGRpc2FibGVJdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAkc3Bhbi5yZW1vdmVDbGFzcygncGxhY2Vob2xkZXInKS5odG1sKHRoaXMub3B0aW9ucy5hbGxTZWxlY3RlZCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5lbGxpcHNpcyAmJiBzbCA+IHRoaXMub3B0aW9ucy5taW5pbXVtQ291bnRTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICRzcGFuLnJlbW92ZUNsYXNzKCdwbGFjZWhvbGRlcicpLnRleHQoc2VsZWN0cy5zbGljZSgwLCB0aGlzLm9wdGlvbnMubWluaW11bUNvdW50U2VsZWN0ZWQpXG4gICAgICAgICAgICAgICAgICAgIC5qb2luKHRoaXMub3B0aW9ucy5kZWxpbWl0ZXIpICsgJy4uLicpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuY291bnRTZWxlY3RlZCAmJiBzbCA+IHRoaXMub3B0aW9ucy5taW5pbXVtQ291bnRTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICRzcGFuLnJlbW92ZUNsYXNzKCdwbGFjZWhvbGRlcicpLmh0bWwodGhpcy5vcHRpb25zLmNvdW50U2VsZWN0ZWRcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoJyMnLCBzZWxlY3RzLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoJyUnLCB0aGlzLiRzZWxlY3RJdGVtcy5sZW5ndGggKyB0aGlzLiRkaXNhYmxlSXRlbXMubGVuZ3RoKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRzcGFuLnJlbW92ZUNsYXNzKCdwbGFjZWhvbGRlcicpLnRleHQoc2VsZWN0cy5qb2luKHRoaXMub3B0aW9ucy5kZWxpbWl0ZXIpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hZGRUaXRsZSkge1xuICAgICAgICAgICAgICAgICRzcGFuLnByb3AoJ3RpdGxlJywgdGhpcy5nZXRTZWxlY3RzKCd0ZXh0JykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBzZXQgc2VsZWN0cyB0byBzZWxlY3RcbiAgICAgICAgICAgIHRoaXMuJGVsLnZhbCh0aGlzLmdldFNlbGVjdHMoKSkudHJpZ2dlcignY2hhbmdlJyk7XG5cbiAgICAgICAgICAgIC8vIGFkZCBzZWxlY3RlZCBjbGFzcyB0byBzZWxlY3RlZCBsaVxuICAgICAgICAgICAgdGhpcy4kZHJvcC5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuICAgICAgICAgICAgdGhpcy4kZHJvcC5maW5kKCdpbnB1dDpjaGVja2VkJykuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnRzKCdsaScpLmZpcnN0KCkuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gdHJpZ2dlciA8c2VsZWN0PiBjaGFuZ2UgZXZlbnRcbiAgICAgICAgICAgIGlmICghaXNJbml0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwudHJpZ2dlcignY2hhbmdlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXBkYXRlU2VsZWN0QWxsOiBmdW5jdGlvbiAoaXNJbml0KSB7XG4gICAgICAgICAgICB2YXIgJGl0ZW1zID0gdGhpcy4kc2VsZWN0SXRlbXM7XG5cbiAgICAgICAgICAgIGlmICghaXNJbml0KSB7XG4gICAgICAgICAgICAgICAgJGl0ZW1zID0gJGl0ZW1zLmZpbHRlcignOnZpc2libGUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbC5wcm9wKCdjaGVja2VkJywgJGl0ZW1zLmxlbmd0aCAmJlxuICAgICAgICAgICAgICAgICRpdGVtcy5sZW5ndGggPT09ICRpdGVtcy5maWx0ZXIoJzpjaGVja2VkJykubGVuZ3RoKTtcbiAgICAgICAgICAgIGlmICghaXNJbml0ICYmIHRoaXMuJHNlbGVjdEFsbC5wcm9wKCdjaGVja2VkJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMub25DaGVja0FsbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZU9wdEdyb3VwU2VsZWN0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgJGl0ZW1zID0gdGhpcy4kc2VsZWN0SXRlbXMuZmlsdGVyKCc6dmlzaWJsZScpO1xuICAgICAgICAgICAgJC5lYWNoKHRoaXMuJHNlbGVjdEdyb3VwcywgZnVuY3Rpb24gKGksIHZhbCkge1xuICAgICAgICAgICAgICAgIHZhciBncm91cCA9ICQodmFsKS5wYXJlbnQoKS5hdHRyKCdkYXRhLWdyb3VwJyksXG4gICAgICAgICAgICAgICAgICAgICRjaGlsZHJlbiA9ICRpdGVtcy5maWx0ZXIoc3ByaW50ZignW2RhdGEtZ3JvdXA9XCIlc1wiXScsIGdyb3VwKSk7XG4gICAgICAgICAgICAgICAgJCh2YWwpLnByb3AoJ2NoZWNrZWQnLCAkY2hpbGRyZW4ubGVuZ3RoICYmXG4gICAgICAgICAgICAgICAgICAgICRjaGlsZHJlbi5sZW5ndGggPT09ICRjaGlsZHJlbi5maWx0ZXIoJzpjaGVja2VkJykubGVuZ3RoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vdmFsdWUgb3IgdGV4dCwgZGVmYXVsdDogJ3ZhbHVlJ1xuICAgICAgICBnZXRTZWxlY3RzOiBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHRleHRzID0gW10sXG4gICAgICAgICAgICAgICAgdmFsdWVzID0gW107XG4gICAgICAgICAgICB0aGlzLiRkcm9wLmZpbmQoc3ByaW50ZignaW5wdXRbJXNdOmNoZWNrZWQnLCB0aGlzLnNlbGVjdEl0ZW1OYW1lKSkuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGV4dHMucHVzaCgkKHRoaXMpLnBhcmVudHMoJ2xpJykuZmlyc3QoKS50ZXh0KCkpO1xuICAgICAgICAgICAgICAgIHZhbHVlcy5wdXNoKCQodGhpcykudmFsKCkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlID09PSAndGV4dCcgJiYgdGhpcy4kc2VsZWN0R3JvdXBzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRleHRzID0gW107XG4gICAgICAgICAgICAgICAgdGhpcy4kc2VsZWN0R3JvdXBzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCA9ICQudHJpbSgkKHRoaXMpLnBhcmVudCgpLnRleHQoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICBncm91cCA9ICQodGhpcykucGFyZW50KCkuZGF0YSgnZ3JvdXAnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICRjaGlsZHJlbiA9IHRoYXQuJGRyb3AuZmluZChzcHJpbnRmKCdbJXNdW2RhdGEtZ3JvdXA9XCIlc1wiXScsIHRoYXQuc2VsZWN0SXRlbU5hbWUsIGdyb3VwKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2VsZWN0ZWQgPSAkY2hpbGRyZW4uZmlsdGVyKCc6Y2hlY2tlZCcpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghJHNlbGVjdGVkLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaHRtbC5wdXNoKCdbJyk7XG4gICAgICAgICAgICAgICAgICAgIGh0bWwucHVzaCh0ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCRjaGlsZHJlbi5sZW5ndGggPiAkc2VsZWN0ZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNlbGVjdGVkLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaCgkKHRoaXMpLnBhcmVudCgpLnRleHQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwucHVzaCgnOiAnICsgbGlzdC5qb2luKCcsICcpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBodG1sLnB1c2goJ10nKTtcbiAgICAgICAgICAgICAgICAgICAgdGV4dHMucHVzaChodG1sLmpvaW4oJycpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0eXBlID09PSAndGV4dCcgPyB0ZXh0cyA6IHZhbHVlcztcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRTZWxlY3RzOiBmdW5jdGlvbiAodmFsdWVzKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RJdGVtcy5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy4kZGlzYWJsZUl0ZW1zLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XG4gICAgICAgICAgICAkLmVhY2godmFsdWVzLCBmdW5jdGlvbiAoaSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGF0LiRzZWxlY3RJdGVtcy5maWx0ZXIoc3ByaW50ZignW3ZhbHVlPVwiJXNcIl0nLCB2YWx1ZSkpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB0aGF0LiRkaXNhYmxlSXRlbXMuZmlsdGVyKHNwcmludGYoJ1t2YWx1ZT1cIiVzXCJdJywgdmFsdWUpKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEFsbC5wcm9wKCdjaGVja2VkJywgdGhpcy4kc2VsZWN0SXRlbXMubGVuZ3RoID09PVxuICAgICAgICAgICAgICAgIHRoaXMuJHNlbGVjdEl0ZW1zLmZpbHRlcignOmNoZWNrZWQnKS5sZW5ndGggKyB0aGlzLiRkaXNhYmxlSXRlbXMuZmlsdGVyKCc6Y2hlY2tlZCcpLmxlbmd0aCk7XG5cbiAgICAgICAgICAgICQuZWFjaCh0aGF0LiRzZWxlY3RHcm91cHMsIGZ1bmN0aW9uIChpLCB2YWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgZ3JvdXAgPSAkKHZhbCkucGFyZW50KCkuYXR0cignZGF0YS1ncm91cCcpLFxuICAgICAgICAgICAgICAgICAgICAkY2hpbGRyZW4gPSB0aGF0LiRzZWxlY3RJdGVtcy5maWx0ZXIoJ1tkYXRhLWdyb3VwPVwiJyArIGdyb3VwICsgJ1wiXScpO1xuICAgICAgICAgICAgICAgICQodmFsKS5wcm9wKCdjaGVja2VkJywgJGNoaWxkcmVuLmxlbmd0aCAmJlxuICAgICAgICAgICAgICAgICAgICAkY2hpbGRyZW4ubGVuZ3RoID09PSAkY2hpbGRyZW4uZmlsdGVyKCc6Y2hlY2tlZCcpLmxlbmd0aCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbmFibGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuJGNob2ljZS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLiRjaG9pY2UuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2hlY2tBbGw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEl0ZW1zLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEdyb3Vwcy5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkNoZWNrQWxsKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdW5jaGVja0FsbDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy4kc2VsZWN0SXRlbXMucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuJHNlbGVjdEdyb3Vwcy5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uVW5jaGVja0FsbCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZvY3VzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLiRjaG9pY2UuZm9jdXMoKTtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkZvY3VzKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYmx1cjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy4kY2hvaWNlLmJsdXIoKTtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkJsdXIoKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZWZyZXNoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmluaXQoKTtcbiAgICAgICAgfSxcblx0XHRcbiAgICAgICAgZGVzdHJveTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwuc2hvdygpO1xuICAgICAgICAgICAgdGhpcy4kcGFyZW50LnJlbW92ZSgpO1xuICAgICAgICAgICAgdGhpcy4kZWwuZGF0YSgnbXVsdGlwbGVTZWxlY3QnLCBudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICBmaWx0ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICB0ZXh0ID0gJC50cmltKHRoaXMuJHNlYXJjaElucHV0LnZhbCgpKS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgICAgICBpZiAodGV4dC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwucGFyZW50KCkuc2hvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMuJHNlbGVjdEl0ZW1zLnBhcmVudCgpLnNob3coKTtcbiAgICAgICAgICAgICAgICB0aGlzLiRkaXNhYmxlSXRlbXMucGFyZW50KCkuc2hvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMuJHNlbGVjdEdyb3Vwcy5wYXJlbnQoKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgdGhpcy4kbm9SZXN1bHRzLmhpZGUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kc2VsZWN0SXRlbXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciAkcGFyZW50ID0gJCh0aGlzKS5wYXJlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgJHBhcmVudFtyZW1vdmVEaWFjcml0aWNzKCRwYXJlbnQudGV4dCgpLnRvTG93ZXJDYXNlKCkpLmluZGV4T2YocmVtb3ZlRGlhY3JpdGljcyh0ZXh0KSkgPCAwID8gJ2hpZGUnIDogJ3Nob3cnXSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuJGRpc2FibGVJdGVtcy5wYXJlbnQoKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy4kc2VsZWN0R3JvdXBzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgJHBhcmVudCA9ICQodGhpcykucGFyZW50KCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBncm91cCA9ICRwYXJlbnQuYXR0cignZGF0YS1ncm91cCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJGl0ZW1zID0gdGhhdC4kc2VsZWN0SXRlbXMuZmlsdGVyKCc6dmlzaWJsZScpO1xuICAgICAgICAgICAgICAgICAgICAkcGFyZW50WyRpdGVtcy5maWx0ZXIoc3ByaW50ZignW2RhdGEtZ3JvdXA9XCIlc1wiXScsIGdyb3VwKSkubGVuZ3RoID8gJ3Nob3cnIDogJ2hpZGUnXSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy9DaGVjayBpZiBubyBtYXRjaGVzIGZvdW5kXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuJHNlbGVjdEl0ZW1zLnBhcmVudCgpLmZpbHRlcignOnZpc2libGUnKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2VsZWN0QWxsLnBhcmVudCgpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kbm9SZXN1bHRzLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZWxlY3RBbGwucGFyZW50KCkuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRub1Jlc3VsdHMuc2hvdygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudXBkYXRlT3B0R3JvdXBTZWxlY3QoKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU2VsZWN0QWxsKCk7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMub25GaWx0ZXIodGV4dCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgJC5mbi5tdWx0aXBsZVNlbGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG9wdGlvbiA9IGFyZ3VtZW50c1swXSxcbiAgICAgICAgICAgIGFyZ3MgPSBhcmd1bWVudHMsXG5cbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgYWxsb3dlZE1ldGhvZHMgPSBbXG4gICAgICAgICAgICAgICAgJ2dldFNlbGVjdHMnLCAnc2V0U2VsZWN0cycsXG4gICAgICAgICAgICAgICAgJ2VuYWJsZScsICdkaXNhYmxlJyxcbiAgICAgICAgICAgICAgICAnb3BlbicsICdjbG9zZScsXG4gICAgICAgICAgICAgICAgJ2NoZWNrQWxsJywgJ3VuY2hlY2tBbGwnLFxuICAgICAgICAgICAgICAgICdmb2N1cycsICdibHVyJyxcbiAgICAgICAgICAgICAgICAncmVmcmVzaCcsICdkZXN0cm95J1xuICAgICAgICAgICAgXTtcblxuICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICBkYXRhID0gJHRoaXMuZGF0YSgnbXVsdGlwbGVTZWxlY3QnKSxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gJC5leHRlbmQoe30sICQuZm4ubXVsdGlwbGVTZWxlY3QuZGVmYXVsdHMsXG4gICAgICAgICAgICAgICAgICAgICR0aGlzLmRhdGEoKSwgdHlwZW9mIG9wdGlvbiA9PT0gJ29iamVjdCcgJiYgb3B0aW9uKTtcblxuICAgICAgICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IG5ldyBNdWx0aXBsZVNlbGVjdCgkdGhpcywgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgJHRoaXMuZGF0YSgnbXVsdGlwbGVTZWxlY3QnLCBkYXRhKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgaWYgKCQuaW5BcnJheShvcHRpb24sIGFsbG93ZWRNZXRob2RzKSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgJ1Vua25vd24gbWV0aG9kOiAnICsgb3B0aW9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGRhdGFbb3B0aW9uXShhcmdzWzFdKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGF0YS5pbml0KCk7XG4gICAgICAgICAgICAgICAgaWYgKGFyZ3NbMV0pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBkYXRhW2FyZ3NbMV1dLmFwcGx5KGRhdGEsIFtdLnNsaWNlLmNhbGwoYXJncywgMikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSAhPT0gJ3VuZGVmaW5lZCcgPyB2YWx1ZSA6IHRoaXM7XG4gICAgfTtcblxuICAgICQuZm4ubXVsdGlwbGVTZWxlY3QuZGVmYXVsdHMgPSB7XG4gICAgICAgIG5hbWU6ICcnLFxuICAgICAgICBpc09wZW46IGZhbHNlLFxuICAgICAgICBwbGFjZWhvbGRlcjogJycsXG4gICAgICAgIHNlbGVjdEFsbDogdHJ1ZSxcbiAgICAgICAgc2VsZWN0QWxsRGVsaW1pdGVyOiBbJ1snLCAnXSddLFxuICAgICAgICBtaW5pbXVtQ291bnRTZWxlY3RlZDogMyxcbiAgICAgICAgZWxsaXBzaXM6IGZhbHNlLFxuICAgICAgICBtdWx0aXBsZTogZmFsc2UsXG4gICAgICAgIG11bHRpcGxlV2lkdGg6IDgwLFxuICAgICAgICBzaW5nbGU6IGZhbHNlLFxuICAgICAgICBmaWx0ZXI6IGZhbHNlLFxuICAgICAgICB3aWR0aDogdW5kZWZpbmVkLFxuICAgICAgICBkcm9wV2lkdGg6IHVuZGVmaW5lZCxcbiAgICAgICAgbWF4SGVpZ2h0OiAyNTAsXG4gICAgICAgIGNvbnRhaW5lcjogbnVsbCxcbiAgICAgICAgcG9zaXRpb246ICdib3R0b20nLFxuICAgICAgICBrZWVwT3BlbjogZmFsc2UsXG4gICAgICAgIGFuaW1hdGU6ICdub25lJywgLy8gJ25vbmUnLCAnZmFkZScsICdzbGlkZSdcbiAgICAgICAgZGlzcGxheVZhbHVlczogZmFsc2UsXG4gICAgICAgIGRlbGltaXRlcjogJywgJyxcbiAgICAgICAgYWRkVGl0bGU6IGZhbHNlLFxuICAgICAgICBmaWx0ZXJBY2NlcHRPbkVudGVyOiBmYWxzZSxcbiAgICAgICAgaGlkZU9wdGdyb3VwQ2hlY2tib3hlczogZmFsc2UsXG5cbiAgICAgICAgc2VsZWN0QWxsVGV4dDogJ1NlbGVjdCBhbGwnLFxuICAgICAgICBhbGxTZWxlY3RlZDogJ0FsbCBzZWxlY3RlZCcsXG4gICAgICAgIGNvdW50U2VsZWN0ZWQ6ICcjIG9mICUgc2VsZWN0ZWQnLFxuICAgICAgICBub01hdGNoZXNGb3VuZDogJ05vIG1hdGNoZXMgZm91bmQnLFxuXG4gICAgICAgIHN0eWxlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuICAgICAgICB0ZXh0VGVtcGxhdGU6IGZ1bmN0aW9uICgkZWxtKSB7XG4gICAgICAgICAgICByZXR1cm4gJGVsbS5odG1sKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGxhYmVsVGVtcGxhdGU6IGZ1bmN0aW9uICgkZWxtKSB7XG4gICAgICAgICAgICByZXR1cm4gJGVsbS5hdHRyKCdsYWJlbCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uT3BlbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuICAgICAgICBvbkNsb3NlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIG9uQ2hlY2tBbGw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgb25VbmNoZWNrQWxsOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIG9uRm9jdXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgb25CbHVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIG9uT3B0Z3JvdXBDbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuICAgICAgICBvbkNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIG9uRmlsdGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICQoJ3NlbGVjdFttdWx0aXBsZV0nKS5tdWx0aXBsZVNlbGVjdCgpO1xufSkoalF1ZXJ5KTtcbiJdfQ==
