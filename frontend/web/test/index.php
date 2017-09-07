<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="ru-Ru">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" /> 
	<meta http-equiv="X-UA-compatible" content="IE=edge" /> 
    <title>Slider page</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">

	<!--css-->
	<link href='https://fonts.googleapis.com/css?family=Fira+Sans:400,300,400italic,500,300italic,500italic,700,700italic&subset=latin,cyrillic' rel='stylesheet' type='text/css'>
	<link rel="stylesheet" href="/test/slider.css">
	<link rel="stylesheet" href="/test/animationsKeyFrame.css">
	<link rel="stylesheet" href="/test/normalize.css">
	<link rel="stylesheet" href="/test/filebrowser.css">

	<script type="text/javascript" src="/test/jquery.min.js"></script>
</head>
<body>
<section id="mega_slider"></section>
<section id="mega_slider_controle"></section>

<script type="text/javascript" src="/test/slider.js"></script>
<script type="text/javascript" src="/test/editor_init.js"></script>

<script type="application/javascript">
	data=[
		{
			fon:'/test/img/header_bg.jpg',
			mobile:'/test/img/maxresdefault-4-1.jpg',
			paralax:[
				{
					img:'/test/img/drops_bg_back.png',
					z:1,
				},
				{
					img:'/test/img/drops_bg_up.png',
					z:2,
				},
				{
					img:'/test/img/text_uretiyoruz_bg.png',
					pos:2,
					z:3,
				},
				{
					img:'/test/img/text_vesonra_bg.png',
					pos:8,
					z:4,
				},
			],
			fixed:[
				{
					img:'/test/img/girl.png',
					full_height:1,
					pos:0,
          show_delay:1,
          show_animation:'lightSpeedIn',
          hide_delay:1,
          hide_animation:'bounceOut',
				}
			],
			button:{
				pos:8,
				href:'/test',
				color:'bordo',
				text:'Перейти',
        show_delay:3,
        show_animation:'rollIn',
        hide_delay:0,
        hide_animation:'hinge',
			}
		}
	];
	megaslider.init(data,true)
</script>

</body>
</html>
