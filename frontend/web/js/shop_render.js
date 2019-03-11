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

  function renderPage(){
    console.log('Start render');
    params = {
      'url':getUrl()
    };
    //если не стартовая то:
    if(!is_main){
      //убираем блоки идущие после основного блока рендера
      $('#content').closest('.page-wrap-flex').nextAll().remove();
      //грузим блок контента
    }

    //часть действий зависят от того первый раз страница отрисовавается или уже повторно
    if(first_render){
      first_render=false;
      //грузим меню
      loadHtmlBlock('menu',is_main?0:100,'left_menu',menu_active);
    }else{
      //активируем пункт в меню
      menu_active();
      //загрузка мета данных
    }

    //загрузка блока под меню

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
      .replaceWithTag('span')
      .addClass('active');

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
      innerData.on(animationEnd, function () {
        $(this).remove();
      });
      innerData.addClass('block_hide')
    }

    if(delay){
      setTimeout(toLoadingHtml,delay,type,block_id,callback)
    }else{
      toLoadingHtml(type,block_id,callback);
    }
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