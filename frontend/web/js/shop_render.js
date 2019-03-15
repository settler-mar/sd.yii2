var shopRender = (function () {
  var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

  var is_main;
  var params = {};
  var root_url;

  function init(_is_main, _root_url) {
    is_main = !!_is_main;
    root_url = _root_url;

    $('#left_menu').on('click', 'a.shops-category-menu_link', function (e) {
      if (e.target.tagName != 'A') {
        var wrap = $(this).closest('li');
        if (wrap.hasClass('menu-group')) {
          if (wrap.hasClass('open')) {
            wrap.removeClass('open')
          } else {
            wrap.addClass('open')
          }
        }
        e.preventDefault();
        return;
      }

      gotoUrl(this.href, 1);
      e.preventDefault();
    });

    renderPage(0);
  }

  function gotoUrl(href, renderPriority, params) {
    if (params && params.length > 1) {
      if (params[0] != '?') {
        params = '?' + params;
      }
      href += params;
    }
    history.pushState(null, null, href);
    renderPage(renderPriority);
  }

  function parseURLParams(url) {
    var queryStart = url.indexOf("?") + 1,
      queryEnd = url.indexOf("#") + 1 || url.length + 1,
      query = url.slice(queryStart, queryEnd - 1),
      pairs = query.replace(/\+/g, " ").split("&"),
      parms = {}, i, n, v, nv;

    if (query === url || query === "") return;

    for (i = 0; i < pairs.length; i++) {
      nv = pairs[i].split("=", 2);
      n = decodeURIComponent(nv[0]);
      v = decodeURIComponent(nv[1]);

      if (!parms.hasOwnProperty(n)) parms[n] = [];
      parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
  }

  function renderPage(renderPriority) {
    if (!renderPriority) renderPriority = 0;
    /*
      чем ниже renderPriority тем больше отрисовывем.
      отрисовывем все пукты что больше renderPriority
      1) меню
      2) фильтр
      4) контент
     */

    console.log('Start render');
    params = parseURLParams(location.search);
    if (!params) params = {};
    params.url = getUrl();

    //если не стартовая то внезависимо от приоритета
    if (!is_main) {
      //убираем блоки идущие после основного блока рендера
      $('#content').closest('.page-wrap-flex').nextAll().not('.ajax_update').remove();

      //грузим блок контента
      loadHtmlBlock('content', 0, 'content',after_content_render);
    }

    //часть действий зависят от того первый раз страница отрисовавается или уже повторно
    if (renderPriority < 1) {
      //грузим меню
      loadHtmlBlock('menu', is_main ? 0 : 80, 'left_menu', menu_active);
    } else {
      //активируем пункт в меню
      menu_active();

      //загрузка мета данных
      loadMeta();

      //скролим вверх
      var top_pos = $('#content').offset().top;
      var menu_h = $('#header').children();
      for(var k=0; k<menu_h.length;k++){
        top_pos-=menu_h.eq(k).outerHeight();
      }
      $("html, body").animate({ scrollTop:top_pos }, 600);
    }

    //загрузка блока под меню
    // - грузим фильтр
    if (renderPriority < 2) {
      loadHtmlBlock('filter', 100, 'left_filter', product_filter);
    }

    is_main = false;
  }

  function menu_active() {
    $('#left_menu .active')
      .removeClass('active')
      .replaceWithTag('a');

    var active = $('#left_menu [href="' + getUrl() + '"]');
    if (active.length == 0) {
      return;
    }

    active = active
      .addClass('active')
      .replaceWithTag('span');

    var wrap = active.closest('li');
    while (wrap.hasClass('menu-group') && !wrap.hasClass('open')) {
      wrap.addClass('open');
      wrap = wrap.closest('li');
    }
    console.log(active);
  }

  function toLoadingHtml(type, block_id, callback) {
    params._csrf = yii.getCsrfToken();
    $.post(root_url + '/ajax/' + type, params, function (data) {
      var params = this;
      var wrap = $('#' + params.block_id);

      setBlockContent(wrap, data, callback);
    }.bind({
      'type': type,
      'block_id': block_id,
      'callback': callback
    }))
  }

  function setBlockContent(wrap, data, callback) {
    if (wrap.find('.block_hide').length > 0) {
      setTimeout(setBlockContent, 100, wrap, data, callback);
      return;
    }

    wrap
      .removeClass('loading_process')
      .html(data)
      .find('>*')
      .addClass('block_show')
      .off(animationEnd);

    wrap.find('meta').remove();
    if (callback) {
      callback();
    }
  }

  function loadMeta(){
    $('.breadcumbs_catalog').closest('section').remove();
    $('#additional_content').html('');

    $.post(root_url + '/ajax/meta',params,function(data){
      if(data.breadcrumbs && data.breadcrumbs.length>100){
        $('#content-wrap').prepend(data.breadcrumbs)
      }

      if(data.h1 && data.h1.length>5){
        $('#content-wrap h1').html(data.h1)
      }

      if(data.content && data.content.length>5){
        $('#content-wrap h1').next().html(data.content)
      }

      if(data.additional_content && data.additional_content.length>5){
        $('#additional_content').html(data.additional_content)
      }

      if(data.title && data.title.length>5){
        document.title = data.title
      }


      console.log(data);
    },'json');
  }

  function loadHtmlBlock(type, delay, block_id, callback) {
    if (!callback) callback = false;
    var innerData = $('#' + block_id)
      .addClass('loading_process')
      .find('>*');

    if (innerData.length > 0) {
      innerData
        .removeClass('block_show')
      setTimeout('innerData.addClass(\'block_hide\')', 1, innerData);
      setTimeout('innerData.remove()', 350, innerData);
    }

    if (!delay) {
      delay = 5;
    }
    setTimeout(toLoadingHtml, delay, type, block_id, callback)

  }

  function getUrl() {
    var url = location.pathname;
    url = url.split('/');
    if(url[url.length-1].substr(0,5)=='page-'){
      params['page']=url[url.length-1].substr(5);
      url.pop();
    }

    return url.join('/');
  };

  function product_filter() {

    var slider = $("#filter-slider-price");
    if(slider.length) {
      var textStart = $('#slider-price-start');

      var textFinish = $('#slider-price-end');
      var startRange = parseInt($(textStart).data('range'), 10),
        finishRange = parseInt($(textFinish).data('range'), 10),
        startUser = parseInt($(textStart).data('user'), 10) || startRange,
        finishUser = parseInt($(textFinish).data('user'), 10) || finishRange;

      //console.log(startRange, finishRange, startUser, finishUser);
      slider.slider({
        range: true,
        min: startRange,
        max: finishRange,
        values: [startUser, finishUser],
        slide: function (event, ui) {
          // console.log(ui.values[ 0 ] + " - " + ui.values[ 1 ]);
          $(textStart).val(ui.values[0]);
          $(textFinish).val(ui.values[1]);
        }
      });


      function priceStartChange(e) {
        var that = $(this),
          strValue = that.val(),
          intValue = parseInt(strValue) || 0,//если неправильно, то 0
          startRange = parseInt(that.data('range')),
          finishRange = parseInt(textFinish.val());

        if (intValue < startRange) { //если меньше диапазона, то по нижнему пределу
          intValue = startRange;
        }
        if (intValue > finishRange) { //если выше диапазона, то  верхниму пределу
          intValue = finishRange;
        }
        slider.slider('values', 0, intValue); //новое значение слайдера
        that.val(intValue);  //повтрояем его для самого поля
      }

      function priceFinishChange(e) {
        var that = $(this),
          startRange = parseInt(textStart.val()),
          strValue = that.val(),
          finishRange = parseInt(that.data('range')),
          intValue = parseInt(strValue) || finishRange;//если неправильно, то максимум

        if (intValue < startRange) { //если меньше диапазона, то по нижнему пределу
          intValue = startRange;
        }
        if (intValue > finishRange) { //если выше диапазона, то  верхниму пределу
          intValue = finishRange;
        }
        slider.slider('values', 1, intValue); //новое значение слайдера
        that.val(intValue);  //повтрояем его для самого поля

      }

      textStart.on('change', priceStartChange);//при изменениии полей ввода цены
      textFinish.on('change', priceFinishChange);//при изменениии полей ввода цены
    }

    $('input.catalog_product_filter-checkbox_item-checkbox').on('change', function () {
      if ($(this).prop('checked')) {
        $(this).parent().addClass('checked');
      } else {
        $(this).parent().removeClass('checked');
      }
    });

    //фильтр производителей - фильтрация элементов
    $('.catalog_product_filter-input-wrap input').keyup(function () {
      var val = $(this).val().length > 2 ? $(this).val().toUpperCase() : false;
      var openCount = 0;
      var list = $(this).closest('.catalog_product_filter-items-item-checkbox');
      if (!val) {
        $(list).removeClass('accordion_hide');
      }
      $('.catalog_product_filter-checkbox_item').each(function (index, item) {
        var name = $(item).find('label').text();
        if (!val) {
          $(item).removeClass('hide');
        } else {
          name = name.substring(0, val.length).toUpperCase();
          if (name == val) {
            $(item).removeClass('hide');
            openCount++;
          } else {
            $(item).addClass('hide');
          }
        }
      });
      if (val && openCount <= 10) {
        $(list).addClass('accordion_hide');
      }
    });

    $('#left_filter form').on('submit', function (e) {
      e.preventDefault();
      var $this = $(this);
      var data = $this.serialize();

      if (params.sort) {
        if (data.length > 0) {
          data += "&";
        }
        data += "sort=" + params.sort;
      }

      if (params.limit) {
        if (data.length > 0) {
          data += "&";
        }
        data += "limit=" + params.limit;
      }

      gotoUrl(getUrl(), 2, data);
      //console.log(params);
      //renderPage(1);
    })
  }

  function after_content_render() {
    $('#content').find('.paginate,.sd-select-drop').on('click', 'a', function (e) {
      gotoUrl(this.href, 4);
      e.preventDefault();
    })
  }

  return {
    'init': init,
  }
})();
console.log('shopRender');

document.addEventListener('DOMContentLoaded', function () {
  $.fn.replaceWithTag = function (tagName) {
    var result = [];
    this.each(function () {
      var newElem = $('<' + tagName + '>').get(0);
      for (var i = 0; i < this.attributes.length; i++) {
        newElem.setAttribute(
          this.attributes[i].name, this.attributes[i].value
        );
      }
      newElem = $(this).wrapInner(newElem).children(0).unwrap().get(0);
      result.push(newElem);
    });
    return $(result);
  };
});