/* share42.com | 22.08.2016 | (c) Dimox */
//window.addEventListener('load', function() {
share42 = function (){
  var e = document.getElementsByTagName('div');
  for (var k = 0; k < e.length; k++) {
    if (e[k].className.indexOf('share42init') != -1) {
      if (e[k].getAttribute('data-socials') != -1)
        var socials = JSON.parse('['+e[k].getAttribute('data-socials')+']');
      var icon_type=e[k].getAttribute('data-icon-type') != -1?
            e[k].getAttribute('data-icon-type'):'';
      if (e[k].getAttribute('data-url') != -1)
        var u = e[k].getAttribute('data-url');
      if (e[k].getAttribute('data-title') != -1)
        var t = e[k].getAttribute('data-title');
      if (e[k].getAttribute('data-image') != -1)
        var i = e[k].getAttribute('data-image');
      if (e[k].getAttribute('data-description') != -1)
        var d = e[k].getAttribute('data-description');
      if (e[k].getAttribute('data-path') != -1)
        var f = e[k].getAttribute('data-path');
      if (e[k].getAttribute('data-icons-file') != -1)
        var fn = e[k].getAttribute('data-icons-file');
      if (!f) {
        function path(name) {
          var sc = document.getElementsByTagName('script')
            , sr = new RegExp('^(.*/|)(' + name + ')([#?]|$)');
          for (var p = 0, scL = sc.length; p < scL; p++) {
            var m = String(sc[p].src).match(sr);
            if (m) {
              if (m[1].match(/^((https?|file)\:\/{2,}|\w:[\/\\])/))
                return m[1];
              if (m[1].indexOf("/") == 0)
                return m[1];
              b = document.getElementsByTagName('base');
              if (b[0] && b[0].href)
                return b[0].href + m[1];
              else
                return document.location.pathname.match(/(.*[\/\\])/)[0] + m[1];
            }
          }
          return null;
        }
        f = path('share42.js');
      }
      if (!u)
        u = location.href;
      if (!t)
        t = document.title;
      if (!fn)
        fn = 'icons.png';
      function desc() {
        var meta = document.getElementsByTagName('meta');
        for (var m = 0; m < meta.length; m++) {
          if (meta[m].name.toLowerCase() == 'description') {
            return meta[m].content;
          }
        }
        return '';
      }
      if (!d)
        d = desc();
      u = encodeURIComponent(u);
      t = encodeURIComponent(t);
      t = t.replace(/\'/g, '%27');
      i = encodeURIComponent(i);
      d_orig=d.replace(/\'/g, '%27');
      d = encodeURIComponent(d);
      d = d.replace(/\'/g, '%27');
      var fbQuery = 'u=' + u;
      if (i != 'null' && i != '')
        fbQuery = 's=100&p[url]=' + u + '&p[title]=' + t + '&p[summary]=' + d + '&p[images][0]=' + i;
      var vkImage = '';
      if (i != 'null' && i != '')
        vkImage = '&image=' + i;
      var s = new Array(
        '"#" data-count="fb" onclick="window.open(\'//www.facebook.com/sharer/sharer.php?u=' + u + '&title='+t+'&description='+d+'\', \'_blank\', \'scrollbars=0, resizable=1, menubar=0, left=100, top=100, width=550, height=440, toolbar=0, status=0\');return false" title="Поделиться в Facebook"',
        '"#" data-count="vk" onclick="window.open(\'//vk.com/share.php?url=' + u + '&title=' + t + vkImage + '&description=' + d + '\', \'_blank\', \'scrollbars=0, resizable=1, menubar=0, left=100, top=100, width=550, height=440, toolbar=0, status=0\');return false" title="Поделиться В Контакте"',
        '"#" data-count="odkl" onclick="window.open(\'//connect.ok.ru/offer?url=' + u + '&title=' + t + '&description='+ d + '\', \'_blank\', \'scrollbars=0, resizable=1, menubar=0, left=100, top=100, width=550, height=440, toolbar=0, status=0\');return false" title="Добавить в Одноклассники"',
        '"#" data-count="twi" onclick="window.open(\'//twitter.com/intent/tweet?text=' + t + '&url=' + u + '\', \'_blank\', \'scrollbars=0, resizable=1, menubar=0, left=100, top=100, width=550, height=440, toolbar=0, status=0\');return false" title="Добавить в Twitter"',
        '"#" data-count="gplus" onclick="window.open(\'//plus.google.com/share?url=' + u + '&title=' + t + '\', \'_blank\', \'scrollbars=0, resizable=1, menubar=0, left=100, top=100, width=550, height=440, toolbar=0, status=0\');return false" title="Поделиться в Google+"',
        //'"#" data-count="gplus" onclick="window.open(\'//m.google.com/app/plus/x/?v=compose&content=' + t + ' - ' + u +'\', \'gplusshare\', \'width=550,height=440,left=100,top=100\');return false" title="Поделиться в Google+"',
        '"#" data-count="mail" onclick="window.open(\'//connect.mail.ru/share?url=' + u + '&title=' + t + '&description=' + d + '&imageurl=' + i + '\', \'_blank\', \'scrollbars=0, resizable=1, menubar=0, left=100, top=100, width=550, height=440, toolbar=0, status=0\');return false" title="Поделиться в Моем Мире@Mail.Ru"',
        '"//www.livejournal.com/update.bml?event=' + u + '&subject=' + t + '" title="Опубликовать в LiveJournal"','"#" data-count="pin" onclick="window.open(\'//pinterest.com/pin/create/button/?url=' + u + '&media=' + i + '&description=' + t + '\', \'_blank\', \'scrollbars=0, resizable=1, menubar=0, left=100, top=100, width=600, height=300, toolbar=0, status=0\');return false" title="Добавить в Pinterest"',
        '"" onclick="return fav(this);" title="Сохранить в избранное браузера"',
        '"#" onclick="print();return false" title="Распечатать"');

      var l = '';

      if(socials.length>1){
        for (q = 0; q < socials.length; q++){
          j=socials[q];
          l += '<a rel="nofollow" '+getIcon(s[j],j,icon_type,f,fn)+' href=' + s[j] + ' target="_blank"></a>';
        }
      }else{
        for (j = 0; j < s.length; j++) {
          l += '<a rel="nofollow" '+getIcon(s[j],j,icon_type,f,fn)+' href=' + s[j] + ' target="_blank"></a>';
        }
      }
      e[k].innerHTML = '<span id="share42">' + l + '</span>';
    }
  }
  
//}, false);
}();

function getIcon(s,j,t,f,fn) {
  if(t=='css'){
    j=s.indexOf('data-count="')+12;
    var l=s.indexOf('"',j)-j;
    var l2=s.indexOf('.',j)-j;
    l=l<l2?l:l2;
    var icon='class="soc-icon icon-'+s.substr(j,l)+'"';
  }else{
    icon='style="display:inline-block;vertical-align:bottom;width:32px;height:32px;margin:0 6px 6px 0;padding:0;outline:none;background:url(' + f + fn + ') -' + 32 * j + 'px 0 no-repeat"'
  }
  return icon;
}
function fav(a) {
  var title = document.title;
  var url = document.location;
  try {
    window.external.AddFavorite(url, title);
  } catch (e) {
    try {
      window.sidebar.addPanel(title, url, '');
    } catch (e) {
      if (typeof (opera) == 'object' || window.sidebar) {
        a.rel = 'sidebar';
        a.title = title;
        a.url = url;
        a.href = url;
        return true;
      } else {
        alert('Нажмите Ctrl-D, чтобы добавить страницу в закладки');
      }
    }
  }
  return false;
}