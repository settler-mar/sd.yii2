var shopRender = (function () {
  var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

  var is_main;
  var params = {};
  var first_render = true;
  var root_url;

  function init(_is_main,_root_url){
    is_main=!!_is_main;
    root_url = _root_url;

    $('#left_menu').on('click','a.shops-category-menu_link',function(e){
      if(e.target.tagName!='A'){
        var wrap = $(this).closest('li');
        if(wrap.hasClass('menu-group')){
          if(wrap.hasClass('open')){
            wrap.removeClass('open')
          }else{
            wrap.addClass('open')
          }
        }
        e.preventDefault();
        return;
      }

      history.pushState(null, null, this.href);
      e.preventDefault();

      renderPage();
    });

    renderPage();
  }

  function parseURLParams(url) {
    var queryStart = url.indexOf("?") + 1,
      queryEnd   = url.indexOf("#") + 1 || url.length + 1,
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

  function renderPage(){
    console.log('Start render');
    params = parseURLParams(location.search);
    params.url = getUrl();


    //если не стартовая то:
    if(!is_main){
      //убираем блоки идущие после основного блока рендера
      $('#content').closest('.page-wrap-flex').nextAll().remove();

      //грузим блок контента
      loadHtmlBlock('content',0,'content');
    }

    //часть действий зависят от того первый раз страница отрисовавается или уже повторно
    if(first_render){
      first_render=false;
      //грузим меню
      loadHtmlBlock('menu',is_main?0:80,'left_menu',menu_active);
    }else{
      //активируем пункт в меню
      menu_active();
      //загрузка мета данных
    }

    //загрузка блока под меню
    loadHtmlBlock('filter',100,'left_filter');

    is_main = false;
  }

  function menu_active(){
    $('#left_menu .active')
      .removeClass('active')
      .replaceWithTag('a');

    var active = $('#left_menu [href="'+getUrl()+'"]');
    if(active.length==0){
      return;
    }

    active=active
      .addClass('active')
      .replaceWithTag('span');

    var wrap = active.closest('li');
    while (wrap.hasClass('menu-group') && !wrap.hasClass('open')){
      wrap.addClass('open');
      wrap = wrap.closest('li');
    }
    console.log(active);
  }

  function toLoadingHtml(type,block_id,callback){
    params._csrf=yii.getCsrfToken();
    $.post(root_url+'/ajax/'+type,params,function (data) {
      var params = this;
      var wrap = $('#'+params.block_id);

      setBlockContent(wrap,data,callback);
    }.bind({
      'type':type,
      'block_id':block_id,
      'callback':callback
    }))
  }

  function setBlockContent(wrap,data,callback){
    if(wrap.find('.block_hide').length>0){
      setTimeout(setBlockContent,100,wrap,data,callback);
      return;
    }

    wrap
      .removeClass('loading_process')
      .html(data)
      .find('>*')
      .addClass('block_show')
      .off(animationEnd);

    wrap.find('meta').remove();
    if(callback){
      callback();
    }
  }

  function loadHtmlBlock(type,delay,block_id,callback){
    if(!callback)callback=false;
    var innerData = $('#'+block_id)
      .addClass('loading_process')
      .find('>*');

    if(innerData.length>0){
      innerData
        .removeClass('block_show')
      setTimeout('innerData.addClass(\'block_hide\')',1,innerData);
      setTimeout('innerData.remove()',350,innerData);
    }

    if(!delay) {
      delay = 5;
    }
    setTimeout(toLoadingHtml,delay,type,block_id,callback)

  }

  function getUrl(){
    return location.pathname;
  };

  return {
    'init':init,
  }
})();
console.log('shopRender');

document.addEventListener('DOMContentLoaded', function() {
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