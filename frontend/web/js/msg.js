//Всплывающее уведомления
(function () {
  names = ['Анастасия', 'Александр', 'Дмитрий', 'Анна', 'Наталья', 'Татьяна', 'Сергей', 'Елена', 'Мария', 'Даниил', 'Андрей', 'Максим',
    'Екатерина', 'Мария', 'Ольга', 'Андрей', 'Софья', 'Алексей', 'Светлана', 'Максим', 'Артём', 'Ирина', 'Михаил', 'Павел',
    'Даниил', 'Ольга', 'Андрей', 'Дарья', 'Виктория', 'Алексей', 'Максим', 'Ирина', 'Алина', 'Елизавета', 'Михаил', 'Павел',
    'Светлана', 'Артём', 'Ирина', 'Алина', 'Михаил', 'Павел', 'Иван', 'Владимир', 'Никита', 'Александра', 'Карина', 'Арина',
    'Юлия', 'Мария', 'Андрей', 'Виктория', 'Алексей', 'Максим', 'Артём', 'Ирина', 'Алина', 'Елизавета', 'Михаил', 'Павел',
    'Софья', 'Алексей', 'Максим', 'Алина', 'Елизавета', 'Михаил', 'Павел', 'Иван', 'Владимир', 'Полина', 'Алёна', 'Диана',
    'Владимир', 'Полина', 'Марина', 'Алёна', 'Никита', 'Николай', 'Александра', 'Евгения', 'Кристина', 'Кирилл', 'Денис', 'Виктор',
    'Павел', 'Ксения', 'Роман', 'Николай', 'Евгения', 'Илья', 'Кристина', 'Денис', 'Оксана', 'Константин', 'Карина', 'Людмила',
    'Александр', 'Дмитрий', 'Анна', 'Наталья', 'Татьяна', 'Сергей', 'Мария', 'Даниил', 'Андрей', 'Софья', 'Виктория', 'Алексей',
    'Владислав', 'Александра', 'Евгений', 'Илья', 'Кристина', 'Кирилл', 'Денис', 'Виктор', 'Карина', 'Вероника', 'Арина', 'Надежда',
    'Александра', 'Станислав', 'Антон', 'Артур', 'Тимофей', 'Валерий', 'Марк', 'Маргарита', 'Нина', 'Ульяна', 'Олеся', 'Элина',
    'Полина', 'Александра', 'Евгений', 'Кристина', 'Кирилл', 'Денис', 'Виктор', 'Константин', 'Ангелина', 'Яна', 'Алиса', 'Егор'
  ];

  var users;

  shops = [
    {
      'name': 'Aliexpress',
      'href': '/stores/aliexpress',
      'discount': '4'
    },
    {
      'name': '003',
      'href': '/stores/003',
      'discount': '2.5'
    },
    {
      'name': 'Adidas',
      'href': '/stores/adidas',
      'discount': '5'
    },
    {
      'name': 'Booking.com',
      'href': '/stores/booking-com',
      'discount': '2'
    },
    {
      'name': 'eBay US',
      'href': '/stores/ebay',
      'discount': '5$'
    },
    {
      'name': 'Agoda',
      'href': '/stores/agoda-com',
      'discount': '3'
    },
    {
      'name': '21vek.by',
      'href': '/stores/21vek',
      'discount': '2.5'
    },
    {
      'name': '100fabrik',
      'href': '/stores/100fabrik',
      'discount': '5'
    },
    {
      'name': 'Lamoda BY',
      'href': '/stores/lamoda-by',
      'discount': '4'
    },
    {
      'name': 'Rozetka UA',
      'href': '/stores/rozetka-ua',
      'discount': '4'
    },
    {
      'name': 'Mailganer',
      'href': '/stores/mailganer',
      'discount': '50'
    },
    {
      'name': 'ZenMate VPN',
      'href': '/stores/zenmate',
      'discount': '45'
    },
    {
      'name': 'DuMedia',
      'href': '/stores/dumedia',
      'discount': '40'
    },
    {
      'name': 'Fornex Hosting',
      'href': '/stores/fornex-hosting',
      'discount': '35'
    },
    {
      'name': 'Speedify VPN',
      'href': '/stores/speedify-vpn',
      'discount': '25'
    },
    {
      'name': 'Макхост',
      'href': '/stores/mchost',
      'discount': '25'
    },
    {
      'name': 'Fibonacci',
      'href': '/stores/fibonacci',
      'discount': '5000 руб.'
    },
    {
      'name': 'ОТП Банк RU',
      'href': '/stores/otp-bank-ru',
      'discount': '2700 руб.'
    },
    {
      'name': 'МебельЖе',
      'href': '/stores/mebelzhe',
      'discount': '2500 руб.'
    },
    {
      'name': '2can.ru',
      'href': '/stores/2can',
      'discount': '1955 руб.'
    },
    {
      'name': 'LiveTex',
      'href': '/stores/livetex',
      'discount': '1880 руб.'
    },
    {
      'name': 'ЕЦВДО',
      'href': '/stores/ecvdo',
      'discount': '1800 руб.'
    },
  ];

  function randomItem() {
    return names[Math.floor(Math.random() * names.length)]
  };

  function randomName() {
    f = randomItem();
    return randomItem() + ' ' + f[0] + '.';
  }

  function randomUser() {
    return users[Math.floor(Math.random() * users.length)]
  };

  function randomMSG(user) {
    msg = user.name + ' только что ';
    shop = shops[Math.floor(Math.random() * shops.length)];

    if (shop.discount.search(' ') > 0) {
      discount = shop.discount;
    } else {
      msg +='купил(a) со скидкой '+ shop.discount + '% и ';
      discount = Math.round(Math.random() * 100000) / 100;
      discount = discount.toFixed(2) + ' руб.';
    }
    msg += 'заработал(a) ' + discount + ' кэшбэка в ';
    msg += '<a href="' + shop.href + '">' + shop.name + '</a>';
    return msg;
  };

  function showMSG() {
    var f = this.showMSG.bind(this);

    if(window.innerWidth>700) {
      var user = randomUser();
      notification.notifi({
        message: this.randomMSG(user),
        img: user.photo,
        title: 'Новый кэшбэк',
      });
    }
    setTimeout(f, 60000 + Math.round(Math.random() * 120000));
  }

  function startShowMSG(data){
    users=data;
    var f = this.showMSG.bind(this);
    setTimeout(f,20000+Math.round(Math.random() * 40000));
  }
  f=startShowMSG.bind({showMSG:showMSG,randomMSG:randomMSG});

  $.get('/js/stores_list.json', function(data) {
     shops = data;
  }, 'json');
  $.get('/js/user_list.json', f, 'json');

}());
