var searchAnalize = (function() {

    var yandexDomElementChangeCheckTimeOut = null;
    var yandexDomElementResultChangeTimeOut = null;
    var searchEngines = {
        'google': {
            'search_selector': '#lst-ib',
            'location_href': 'google',
            'location_href_index': 1,
            'result_selector': '#res',
            'result_first_item': 1,
            'repeat': 1,
            'styles': '',

            'analiseHREF':'#res h3 a[href]',
            'closest':'div.g'
        },
        'bing': {
            'search_selector': '#sb_form_q',
            'location_href': 'bing',
            'location_href_index': 1,
            'result_selector': '#b_results',
            'result_first_item': 0,
            'repeat': 1,
            'styles': '',

            'analiseHREF':'#b_results h2 a[href]',
            'closest':'li.b_algo'
        },
        'yandex': {
            'search_selector': 'div.serp-header__main input.input__control',
            'location_href': 'yandex',
            'location_href_index': [0, 1],
            'result_selector': '.serp-list',
            'result_first_item': 0,
            'dom_change_selector': '.main .main__center .main__content',
            'repeat': 5, //повтор вывода
            'styles': 'margin-left:-23px;',

            'analiseHREF':'.serp-list .serp-item .path a[href] b',
            'byText': true,
            'closest':'li.serp-item',
            'adcDetect':function(wrap){
                //return (wrap.getAttribute('data-lxgv')!=null) || (wrap.getAttribute('data-qjey')!=null);
                /*var els=wrap.querySelectorAll('.organic__subtitle span');

                for(var i=0;i<els.length;i++){
                  //if(els[i].innerText.toLocaleLowerCase()=='реклама') return true;
                  console.log(els[i].shadowRoot.querySelector("span"))
                }*/
                for(var i=0;i<wrap.attributes.length;i++) {
                    var d=wrap.attributes[i].name.toLocaleLowerCase();
                    if(d.indexOf('data-')<0)continue;

                    d=d.replace('data-','');
                    if(d=='cid'||d=='lognode')continue;
                    if(d.length<4)continue;
                    if(d.length>6)continue;
                    return true;
                }
                return false;
            }
        }
    };

    //изменение поиска
// function checkSearch(searchString, engine) {
//   if (storageDataStores == null || storageDataStores.stores.length == 0) {
//     return null;
//   }
//   var div = document.createElement('div');
//   var message = false;
//   storageDataStores.stores.forEach(function (item) {
//     //проверка, что строка поиска включена в название или урл магазина
//     if ((item.name.toUpperCase().indexOf(searchString) >= 0 || item.url.toUpperCase().indexOf(searchString) >= 0) && !message) {
//       if (debug) {
//         console.log(item, usersData);
//       }
//       message = utils.replaceTemplate(storageDataStores.searchtext, {
//         'cashback': utils.makeCashback(item.displayed_cashback, item.currency, item.action_id),
//         'currentUrl': siteUrl + item.url,
//         'storename': utils.ucfirst(item.name)
//       });
//       var url = '';
//       if (usersData && usersData.user) {
//         url = siteUrl + 'goto/store:' + item.uid;
//       } else {
//         url = siteUrl + 'stores/' + item.store_route + '#login';
//       }
//       div.innerHTML = "<a href='" + url + "'target='_blank'>" +
//         // "<span style='margin-right:5px;height:18px;vertical-align:middle'>"+searchFormImage+"</span>"+message;
//         searchFormImage + message;
//       div.id = 'secretdiscounter-search';
//       div.className = 'secretdiscounter-search';
//       div.setAttribute('style', engine.styles);
//
//       if (engine.repeat < 2) {
//         //просто положить
//         var searchResult = document.querySelector(engine.result_selector);
//         if (searchResult && !document.querySelector('#secretdiscounter-search')) {
//           //имеется блок, куда есть выкладывать и нет нашего блока
//           var nextElement = engine.result_first_item ? searchResult.parentNode.childNodes[0] : searchResult;
//           searchResult.parentElement.insertBefore(div, nextElement);
//         }
//       } else {
//         //делаем повторы, если нет нашего блока
//         var repeatTimes = engine.repeat;
//         var searchResultInterval = setInterval(function () {
//           var searchResult = document.querySelector(engine.result_selector);
//           if (searchResult && !document.querySelector('#secretdiscounter-search')) {
//             //имеется блок, куда есть выкладывать и нет нашего блока
//             var nextElement = engine.result_first_item ? searchResult.parentNode.childNodes[0] : searchResult;
//             searchResult.parentElement.insertBefore(div, nextElement);
//           }
//           repeatTimes--;
//           if (repeatTimes < 1) {
//             clearInterval(searchResultInterval);
//           }
//         }, 1000);
//       }
//       return false;
//     }
//   })
// }

    function checkLocation(href, index, key) {
        if (index instanceof Array) {
            for (var i = 0; i < index.length; i++) {
                if (href[index[i]] === key) {
                    return true;
                }
            }
        } else if (typeof(index) === 'number') {
            return href[index] === key
        }
        return false;
    }

    function displayShopFinders(item){
        var data = this;
        var engine = data.engine;
        var el = data.el;

        generateSearchLink(item, el, engine);
    }

    function generateSearchLink(item, el, engine){

        if(el.querySelectorAll('.sd_link_finder').length>0) return;

        var div = document.createElement('div');
        message = utils.replaceTemplate(storageDataStores.searchtext, {
            'cashback': utils.makeCashback(item.displayed_cashback, item.currency, item.action_id),
            'currentUrl': siteUrl + item.url,
            'storename': utils.ucfirst(item.name)
        });
        var url = '';
        if (usersData && usersData.user) {
            url = siteUrl + 'goto/store:' + item.uid;
        } else {
            url = siteUrl + 'stores/' + item.store_route + '#login';
        }
        div.innerHTML = "<a data-store='"+item.store_route+"' href='" + url + "'target='_blank' class='sd_link_finder'>" +
            // "<span style='margin-right:5px;height:18px;vertical-align:middle'>"+searchFormImage+"</span>"+message;
            favicon + message;
        div.id = 'secretdiscounter-search';
        div.className = 'secretdiscounter-search';
        div.setAttribute('style', engine.styles);

        el.prepend(div);
        utils.makeHrefs(el);

    }


    function checkSearchLink(){
        repeatTimes--;
        if(repeatTimes<=0) return;

        if(document.querySelectorAll('.sd_link_finder').length>0){
            setTimeout(checkSearchLink,1000);
            return;
        }
        analizPage();
    }

    function analizeSearch(){
        //для гугл,  бинг, яндекс
        var locationHref = location.hostname.split('.');

        for (key in searchEngines) {
            var engine = searchEngines[key];
            if(!checkLocation(locationHref, engine.location_href_index, engine.location_href))continue;

            var els=document.querySelectorAll(engine.analiseHREF);
            if(els.length==0)return;
            if (debug) {
                console.log(els);
            }
            for(var k=0;k<els.length;k++) {
                var el=els[k];
                var url;
                var wrap = el.closest(engine.closest);

                //если есть алгоритм детекции рекламы то проверяем на рекламу
                if(engine.adcDetect && engine.adcDetect(wrap)) continue;

                if (engine.byText) {
                    url = el.innerText;
                } else {
                    url = el.href.split('//');
                    if (url.length == 2) {
                        url = url[1]
                    }

                    url = url.split('/');
                    url = url[0].split('?');
                    url = url[0];
                }

                storeUtil.findShop(storageDataStores.stores, url, displayShopFinders.bind({
                    engine: engine,
                    el: wrap
                }));
            }

            if(repeatTimes===false)repeatTimes=engine.repeat;
            setTimeout(checkSearchLink,1000);
        }
    }

    var yandexSearchResultChangeHandler = function(){
        //console.log('yandex search content change');
        clearTimeout(yandexDomElementChangeCheckTimeOut);
        yandexDomElementChangeCheckTimeOut = setTimeout(function(){
            //пока меняется содержимое результата поиска и не успокоится -  500 запуск невозможен
            //теперь запускаем, и 8000  не отслеживаем, чтобы было время нам поменять содержимое, не запуская поиск
            if (yandexDomElementResultChangeTimeOut === null) {
                yandexDomElementResultChangeTimeOut = setTimeout(function () {
                    clearTimeout(yandexDomElementResultChangeTimeOut);
                    yandexDomElementResultChangeTimeOut = null;
                }, 8000);
                //запускаем проверку поиска, после этого 8000 запуск невозможен
                //console.log('yandex run search');
                analizeSearch();
            }

        }, 500);
    };

    function yandexHandlerSet() {
        //событие для яндекса при повторном поиске айаксом
        var yandexDomElementChange = document.querySelector(searchEngines.yandex.dom_change_selector);
        var yandexInput = document.querySelector(searchEngines.yandex.search_selector);
        if (yandexDomElementChange && yandexInput) {
            yandexDomElementChange.addEventListener('DOMSubtreeModified', yandexSearchResultChangeHandler);
        }
    }


    return {
        analize: analizeSearch,
        yandexHandlerSet: yandexHandlerSet
    }



})();