/*
На странице
https://www.travelpayouts.com/campaigns
после авторизации выполняем скрипт в консоли браузера
 */
var els=$('.cps-list-campaign');
var out={};

for (var i=0;i<els.length;i++){
  var el=els.eq(i);
  var item={};
  var h2=el.find('h2')
    .text()
    .trim()
    .replace(' — ',' - ')
    .replace(' – ',' - ')
    .split(' - ');
  if(h2.length==1){
    h2=h2[0].split(': ');
  }
  item.title=h2[0].trim();
  item.comment=h2[1].trim();
  var img = el.find('img.cps-list-campaign-info__logo');
  item.img=img.attr('src')
  tr_href=img.parent().attr('href');
  var id=tr_href.trim().split('/');
  id=id[id.length-1];
  item.id=id;
  var status=el.find('.cps-list-campaign-header__subscribed').text().trim();
  item.status=0;
  if(status=="Вы подписаны")item.status=1;
  out[id]=item;

  $.get(tr_href,function(data){
    data=data.split('//<![CDATA[');
    data=data[1].split('//]]>');
    data=data[0];
    eval(data);
    var campaign=gon.campaign;
    var id=campaign.id;
    out[id].advertiser_id=campaign.advertiser_id;
    out[id].description=campaign.description;
    out[id].required_params=campaign.required_params;
    out[id].approver=campaign.approver;
    out[id].published=campaign.published;
  })

  $.get((tr_href+"/promos").replace("//","/"),function(data){
    id=this;
    out[id].link=$(data).find(".campaign-promos-item__body a").attr('href')
  }.bind(id))
}

//выполнить после того как закончатся все запросы
console.log(JSON.stringify(out))

/*
Получившиеся данные сохраняем в console/controllers/travelpayouts.json
 */