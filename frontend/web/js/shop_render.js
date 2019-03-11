var shopRender = (function () {
  var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

  var is_main;
  var params = {};
  var first_render = true;
  var root_url;

  function init(_is_main,_root_url){
    is_main=!!_is_main;
    root_url = _root_url;

    renderPage()
  }

  function renderPage(){
    console.log('Start render');

    //если не стартовая то убираем блоки идущие после основного блока рендера
    if(!is_main){
      $('#content').closest('.page-wrap-flex').nextAll().remove();
      //грузим блок контента
    }

    //часть действий зависят от того первый раз страница отрисовавается или уже повторно
    if(first_render){
      first_render=false;
      //грузим меню
      loadHtmlBlock('menu',is_main?0:100,'left_menu');
    }else{
      //загрузка мета данных
    }

    //загрузка блока под меню

  }

  function toLoadingHtml(type,block_id){
    $.post(root_url+'/ajax/'+type,function (data) {
      var params = this;
      var wrap = $('#'+params.block_id);

      setBlockContent(wrap,data);
    }.bind({
      'type':type,
      'block_id':block_id,
    }))
  }

  function setBlockContent(wrap,data){
    if(wrap.find('.block_hide')){
      setTimeout(setBlockContent,100,wrap,data);
    }

    wrap
      .removeClass('loading_process')
      .html(data)
      .find('>*')
      .addClass('block_show')
  }

  function loadHtmlBlock(type,delay,block_id){
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
      setTimeout(toLoadingHtml,delay,type,block_id)
    }else{
      toLoadingHtml(type,block_id);
    }
  }

  return {
    'init':init,
  }
})();
console.log('shopRender');