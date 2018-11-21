// Global settings
CKEDITOR.disableAutoInline = true;
var app = {};

$(function () {

  //фильтры на нажатие клавиш
  //$('body').on('keypress', '.letters', only_letters_in_input);
  //$('body').on('keypress', 'input,textarea', only_no_foreign_letters_in_input);
  $('body').on('keypress', '.num', no_letters_in_input);
  //$('body').on('keypress', '.canadian_zip_key_control', canadian_zip_key_control);
  $('body').on('keypress', '.onlyFloat', float_in_input);
  $('body').on('keyup', '.onlyFloat', function () {
    this.value = this.value.replace(',', '.');
  });

  //рабоат фильтра в таблице
  //$('body').on('click', '.stopEvent', stopEvent);
  //$('body').on('click', '.showControl', showControl);
  //$('body').on('click', function () {
  //  $('.temp_show.active').removeClass("active");
  //});

  $('body').on('click',".print,.modal_open",function(){
    var $this =$(this);
    var href = $this.data('link');

    if(!href)return;
    var type = $this.data('type');

    var f = $this.hasClass('modal_open')?modal_open:print_href;

    if (type){
      if(type=="editor"){
        $.post(href,{data:JSON.stringify(editor.getData())},function(){
          var data = this;
          data.f(data.href);
        }.bind({
          href:href,
          f:f
        }));
        return true;
      }
      if(type=="send"){
        $.post(href,{data:JSON.stringify(editor.getData())});
        return;
      }
      if(type=="test"){
        href+='&'+$('.modal-body form').serialize();
        $('.modal-header .close').click();
      }
    }
    f(href);
  });

  //работа бутстраповских табов
  $('body').on('click', '[data-toggle=tab]', tab_select);

  //работа бутстраповских Popover
  $(document).on('click', '[data-toggle="popover"]', function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    var $this = $(this);
    var popover = $this.data('bs.popover');
    if(typeof (popover)!="undefined" && $this.data('bs.popover').$tip.is(':visible')){
      $(this).popover('hide');
    }else{
      $('[data-toggle="popover"]').not(this).popover('hide');
      $this.popover({html: true,trigger:"manual"}).popover('show');
    }
  });
  $(document).on('click', function (e) {
    $('[data-toggle="popover"]').popover('hide');
  });

  //работа бутстраповских радио кнопок
  //$('.btn-group-toggle')
  // $('body').on('change', '[type=radio]', function () {
  //   var parent = $(this).parent();
  //   if(!parent.hasClass('btn'))return true;
  //   parent.closest('.btn-group').find('.active').removeClass('active');
  //   parent.addClass('active');
  // });

  //фикс для календаря
  if(typeof moment !== 'undefined') {
    moment.langData()._meridiemParse = /[ap]\.?m?\.?/i
    moment.langData().meridiem = function (hours, minutes, isLower) {
      if (hours > 11) {
        return isLower ? 'pm' : 'PM';
      } else {
        return isLower ? 'am' : 'AM';
      }
    }
  }

});


var modal_open = function (href) {
  $.get(href,function(data){ //На странице шаблонов с POST не работает печать
    var modal=$('#ajaxCrudModal').modal('show');

    var head = modal.find('.modal-header');
    if(head.find('.modal-title').length==0){
      head.append('<h4 class="modal-title"/>')
    }
    modal.find('.modal-body').html(data.content);
    modal.find('.modal-footer').html(data.footer);
    modal.find('.modal-title').html(data.title);
  },'json');
};

var tab_select=function (e) {
  e.preventDefault();
  var href = this.href.split("#");
  if (href.length != 2) return;
  href = href[1];
  var tab_content = $('#' + href);
  if (tab_content.length == 0) return;

  if (tab_content.hasClass('active')) return;

  var wrap = tab_content.closest('.tab-content');
  wrap.find('.tab-pane.active').removeClass('active').removeClass('in');
  tab_content.addClass('in').addClass('active');

  var $this = $(this);
  $this.closest('.nav-tabs')
    .find('li.active')
    .removeClass('active');
  $(this).closest('li').addClass('active');

  return false;
};

//превью загрузки картинки
function testImgPrew() {
  $('input[type=file]').on('change', function (evt) {
    var file = evt.target.files; // FileList object
    var f = file[0];
    // Only process image files.
    if (!f.type.match('image.*')) {
      return false;
    }
    var reader = new FileReader();

    data = {
      'el': this,
      'f': f
    };
    reader.onload = (function (data) {
      return function (e) {
        img = $('[for="' + data.el.name + '"]');
        if (img.length > 0) {
          img.attr('src', e.target.result)
        }
      };
    })(data);
    // Read in the image file as a data URL.
    reader.readAsDataURL(f);
  });

  $('.file_select input').on('change', function (evt) {
    var img = $('[for="' + this.name + '"]');
    if (img.length > 0) {
      img.attr('src', this.value)
    }
  })
}

$(function () {
  $('body').on('click','button.file_select',function(e){
    var csrfParam = $('meta[name=csrf-param]').attr('content');
    var csrfToken = $('meta[name=csrf-token]').attr('content');
    var customData = {};
    customData[csrfParam] = csrfToken;

    param = {
      startPathHash: "",
      customData: customData,
      useBrowserHistory: false,
      resizable: false,
      width: '100%',
      height: '100%',
      zIndex: 99999,
      url: "/elfinder/connect?filter=image",
      lang: app.language.split('-')[0].toLowerCase(),
      dialogContained: true,
      getFileCallback: function (file) {
        var $this = $(this);
        var for_el = $this.attr('for');
        var input = $('[name="'+for_el+'"]');
        var img = $('img[for="'+for_el+'"]');
        input.val(file.url);
        if (img.length > 0) {
          img.attr('src', file.url)
        }
        jQuery('button.ui-dialog-titlebar-close').click();
      }.bind(this)
    };

    jQuery('<div \>').dialog({
      modal: true, width: "80%", title: app.i18n.insert_img, zIndex: 99999,
      create: function (event, ui) {
        jQuery(this).elfinder(param).elfinder('instance')
      }
    });

    $('.ui-dialog').css({
      'z-index':999999,
      //'top':'10vh'
    })
  });
});



function float_in_input(evt) {
  code = evt.keyCode || evt.charCode; // для Chrome || Firefox
  char = String.fromCharCode(code)

  if ((code >= 48 && code <= 57) || (code == 13)) return;
  if ((char == ",") || (char == ".")) {
    val = this.value;
    if (val.indexOf(',') == -1 && val.indexOf('.') == -1) return;
  }
  show_gritter(this);
  evt.preventDefault();

}

function no_letters_in_input(evt) {
  code = evt.keyCode || evt.charCode; // для Chrome || Firefox
  if ((code >= 48 && code <= 57) || (code == 13)) return;
  else {
    show_gritter(this);
    evt.preventDefault();
  }
}

function only_letters_in_input(evt) {
  code = evt.keyCode || evt.charCode;
  if (
    (code >= 97 && code <= 122) || (code == 13) ||    // enter
    (code >= 65 && code <= 90) || (code == 32))
    return;
  else {
    show_gritter(this);
    evt.preventDefault();
  }
}

function only_no_foreign_letters_in_input(evt) {
  code = evt.keyCode || evt.charCode;  // для Chrome || Firefox
  if (
    (code >= 48 && code <= 57) ||
    (code >= 97 && code <= 122) ||
    (code >= 65 && code <= 90) ||
    (code == 44) || (code == 46) ||
    (code == 13) || (code == 32)
    || (code == 33) || (code == 64) || (code == 35) || (code == 36) || (code == 37) || (code == 94) || (code == 38) || (code == 42)
    || (code == 40) || (code == 41) || (code == 95) || (code == 43) || (code == 45) || (code == 61) || (code == 8) || (code == 9) || (code == 39)  // !@#$%^&*()_+-=
  )
    return;
  else {
    show_gritter(this);
    evt.preventDefault();
  }
}

function show_gritter(current_element) { // проверяем показывать ли для данного элемента гриттер или нет.

}

function stopEvent(e) {
  e.preventDefault();
  return false;
}

//показать фильтр в таблице
function showControl(e) {
  $('.temp_show.active').removeClass('active');
  id = $(this).attr('for');
  control_d = eval(id);
  control = $("#" + id + '-wrap');
  control
    .addClass('active')
    .html(control_d);

  e.preventDefault();
  return false;
}


var template = false;

function init_template() {
  if (template) return;
  template = (function () {
    var ready = false;
    var tpls = {};

    $.get('/tpls', function (data) {
      for (index in data) {
        tpls[index] = Twig.twig({
          data: data[index],
        });
      }
      ready=true;
    }, 'json');

    function render(tpl, data) {
      if (!tpls[tpl]) return '';
      return tpls[tpl].render(data);
    }

    function isReady(){
      return ready;
    }
    return {
      render: render,
      ready: isReady
    }
  })();
}

  // Force Modal Close button to show - helps if button was previously hidden
$(function () {
  $('#ajaxCrudModal').on('show.bs.modal', function (e) {
    $('#ajaxCrudModal').find('.modal-header button.close').show();
  });


  //
  // CKEDITOR --- START
  //

  app.ckeditor_init = function (container_id) {
    CKEDITOR.inline(container_id, {
      "height": 100,
      "language": app.language,
      "toolbarGroups": [
        {"name": "undo"},
        {"name": "basicstyles", "groups": [ "basicstyles" ] },
        {"name": "paragraph", "groups": [ "list", "align" ] },
        {"name": "links", "groups": [ "links" ] },
        {"name": "insert", "groups": [ "insert" ] },
        '/',
        {"name": "styles", "groups": [ "styles" ] },
        {"name": "colors", "groups": [ "colors" ] },
        {"name": "mode"}
      ],
      "removeButtons": "Flash,Table,Smiley,SpecialChar,PageBreak,Iframe",
      "removePlugins": "elementspath",
      "extraPlugins": "sourcedialog,token,imageresizerowandcolumn",
      "resize_enabled": false,
      "filebrowserBrowseUrl": "/elfinder/manager",
      "filebrowserImageBrowseUrl": "/elfinder/manager?filter=image",
      "filebrowserFlashBrowseUrl": "/elfinder/manager?filter=flash",
      "on": {
        "instanceReady": function (ev) {
          mihaildev.ckEditor.registerOnChange(container_id);
        }
      }
    });
  };

  app.ckeditor_toggleReadOnly = function (container_id) {
    if (app.ckeditor_isReadOnly(container_id)) {
      app.ckeditor_setReadOnly(container_id, false);
    } else {
      app.ckeditor_setReadOnly(container_id, true);
    }
  };

  app.ckeditor_setReadOnly = function (container_id, isReadOnly) {
      CKEDITOR.instances[container_id].setReadOnly(isReadOnly);
  };

  app.ckeditor_isReadOnly = function (container_id) {
    return CKEDITOR.instances[container_id].readOnly;
  };

  app.ckeditor_destroy = function (container_id) {
    CKEDITOR.instances[container_id].destroy();
  };

  $('[role="ckeditor-inline"]').each(function (index, el) {
    var id = $(el).attr('id');
    if (typeof id !== "undefined") {
      app.ckeditor_init(id);
    }
  });

  //
  // CKEditor - Twig Token support implementation - START
  //
  function escapeRegExp(string){
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  CKEDITOR.plugins.add( 'token', {
    requires: 'widget',

    init: function( editor ) {
      var tokenStart = '{';
      var tokenEnd = '}';
      var tokenStartNum = tokenStart.length;
      var tokenEndNum = 0 - tokenEnd.length;

      editor.widgets.add( 'token', {
        requiredContent: 'span(cke_token)',

        init: function() {
          // Note that token markup characters are stripped for the name.
          this.setData( 'name', this.element.getText().slice( tokenStartNum, tokenEndNum ) );
        },

        data: function() {
          this.element.setText( tokenStart + this.data.name + tokenEnd );
        },

        downcast: function() {
          return new CKEDITOR.htmlParser.text( tokenStart + this.data.name + tokenEnd );
        }

      } );

      // This feature does not have a button, so it needs to be registered manually.
      editor.addFeature( editor.widgets.registered.token );

      // Handle dropping a contact by transforming the contact object into HTML.
      // Note: All pasted and dropped content is handled in one event - editor#paste.
      editor.on( 'paste', function( evt ) {
        var token = evt.data.dataTransfer.getData( 'token' );
        if ( !token ) {
          return;
        }

        evt.data.dataValue = '<span class="cke_token">' + token + '</span>'
      } );
    },

    afterInit: function( editor ) {
      var tokenStart = '{';
      var tokenEnd = '}';

      var tokenStartRegex = escapeRegExp(tokenStart);
      var tokenEndRegex = escapeRegExp(tokenEnd);
      var tokenReplaceRegex = new RegExp(tokenStartRegex + '([^' + tokenStartRegex + tokenEndRegex +'])+' + tokenEndRegex, 'g');

      editor.dataProcessor.dataFilter.addRules( {
        text: function( text, node ) {
          var dtd = node.parent && CKEDITOR.dtd[ node.parent.name ];

          // Skip the case when token is in elements like <title> or <textarea>
          // but upcast token in custom elements (no DTD).
          if ( dtd && !dtd.span ) {
            return;
          }

          return text.replace( tokenReplaceRegex, function( match ) {
            // Creating widget code.
            var widgetWrapper = null,
                innerElement = new CKEDITOR.htmlParser.element( 'span', {
                  'class': 'cke_token'
                } );

            // Adds token identifier as innertext.
            innerElement.add( new CKEDITOR.htmlParser.text( match ) );
            widgetWrapper = editor.widgets.wrapElement( innerElement, 'token' );

            // Return outerhtml of widget wrapper so it will be placed
            // as replacement.
            return widgetWrapper.getOuterHtml();
          } );
        }
      } );
    }

  } );

  // Copy-paste from https://sdk.ckeditor.com/samples/draganddrop.html
  CKEDITOR.on( 'instanceReady', function() {
    CKEDITOR.document.getById( 'tokensList' ).on( 'dragstart', function( evt ) {
      var target = evt.data.getTarget().getAscendant( 'span', true );

      CKEDITOR.plugins.clipboard.initDragDataTransfer( evt );

      var dataTransfer = evt.data.dataTransfer;

      dataTransfer.setData( 'token', target.getText() );

      dataTransfer.setData( 'text/html', target.getText() );

      if ( dataTransfer.$.setDragImage ) {
        dataTransfer.$.setDragImage( target.$, 0, 0 );
      }
    } );
  } );

  var csrfParam = $('meta[name=csrf-param]').attr('content');
  var csrfToken = $('meta[name=csrf-token]').attr('content');

  var elfNode, elfInsrance, dialogName,
      elfUrl = '/elfinder/connect', // Your connector's URL
      elfDirHashMap = { // Dialog name / elFinder holder hash Map
        image: '',
        flash: '',
        files: '',
        link: '',
        fb: 'l1_Lw' // Fall back target : `/`
      },
      imgShowMaxSize = 400, // Max image size(px) to show
      customData = {},
      // Set image size to show
      setShowImgSize = function (url, callback) {
        $('<img/>').attr('src', url).on('load', function () {
          var w = this.naturalWidth,
              h = this.naturalHeight,
              s = imgShowMaxSize;
          if (w > s || h > s) {
            if (w > h) {
              h = Math.floor(h * (s / w));
              w = s;
            } else {
              w = Math.floor(w * (s / h));
              h = s;
            }
          }
          callback({width: w, height: h});
        });
      },
      // Set values to dialog of CKEditor
      setDialogValue = function (file, fm) {
        var url = fm.convAbsUrl(file.url),
            dialog = CKEDITOR.dialog.getCurrent(),
            dialogName = dialog._.name,
            tabName = dialog._.currentTabId,
            urlObj;
        if (dialogName == 'image') {
          urlObj = 'txtUrl';
        } else if (dialogName == 'flash') {
          urlObj = 'src';
        } else if (dialogName == 'files' || dialogName == 'link') {
          urlObj = 'url';
        } else if (dialogName == 'image2') {
          urlObj = 'src';
        } else {
          return;
        }
        if (tabName == 'Upload') {
          tabName = 'info';
          dialog.selectPage(tabName);
        }
        dialog.setValueOf(tabName, urlObj, url);
        if (dialogName == 'image' && tabName == 'info') {
          setShowImgSize(url, function (size) {
            dialog.setValueOf('info', 'txtWidth', size.width);
            dialog.setValueOf('info', 'txtHeight', size.height);
            dialog.preview.$.style.width = size.width + 'px';
            dialog.preview.$.style.height = size.height + 'px';
            dialog.setValueOf('Link', 'txtUrl', url);
            dialog.setValueOf('Link', 'cmbTarget', '_blank');
          });
        } else if (dialogName == 'image2' && tabName == 'info') {
          dialog.setValueOf(tabName, 'alt', file.name + ' (' + elfInsrance.formatSize(file.size) + ')');
          setShowImgSize(url, function (size) {
            setTimeout(function () {
              dialog.setValueOf('info', 'width', size.width);
              dialog.setValueOf('info', 'height', size.height);
            }, 100);
          });
        } else if (dialogName == 'files' || dialogName == 'link') {
          try {
            dialog.setValueOf('info', 'linkDisplayText', file.name);
          } catch (e) {
          }
        }
      };

  customData[csrfParam] = csrfToken;

  // Setup upload tab in CKEditor dialog
  CKEDITOR.on('dialogDefinition', function (event) {
    var editor = event.editor,
        dialogDefinition = event.data.definition,
        tabCount = dialogDefinition.contents.length,
        browseButton, uploadButton, submitButton, inputId;

    for (var i = 0; i < tabCount; i++) {
      try {
        browseButton = dialogDefinition.contents[i].get('browse');
        uploadButton = dialogDefinition.contents[i].get('upload');
        submitButton = dialogDefinition.contents[i].get('uploadButton');
      } catch (e) {
        browseButton = uploadButton = null;
      }

      if (browseButton !== null) {
        browseButton.hidden = false;
        browseButton.onClick = function (dialog, i) {
          dialogName = CKEDITOR.dialog.getCurrent()._.name;
          if (dialogName === 'image2') {
            dialogName = 'image';
          }
          if (elfNode) {
            if (elfDirHashMap[dialogName] && elfDirHashMap[dialogName] != elfInsrance.cwd().hash) {
              elfInsrance.request({
                data: {cmd: 'open', target: elfDirHashMap[dialogName]},
                notify: {type: 'open', cnt: 1, hideCnt: true},
                syncOnFail: true
              });
            }
            elfNode.dialog('open');
          }
        }
      }

      if (uploadButton !== null && submitButton !== null) {
        uploadButton.hidden = false;
        submitButton.hidden = false;
        uploadButton.onChange = function () {
          inputId = this.domId;
        }
        // upload a file to elFinder connector
        submitButton.onClick = function (e) {
          dialogName = CKEDITOR.dialog.getCurrent()._.name;
          if (dialogName === 'image2') {
            dialogName = 'image';
          }
          var target = elfDirHashMap[dialogName] ? elfDirHashMap[dialogName] : elfDirHashMap['fb'],
              name = $('#' + inputId),
              input = name.find('iframe').contents().find('form').find('input:file'),
              error = function (err) {
                alert(elfInsrance.i18n(err).replace('<br>', '\n'));
              };

          if (input.val()) {
            var fd = new FormData();
            fd.append('cmd', 'upload');
            fd.append('target', target);
            fd.append('overwrite', 0); // Instruction to save alias when same name file exists
            $.each(customData, function (key, val) {
              fd.append(key, val);
            });
            fd.append('upload[]', input[0].files[0]);
            $.ajax({
              url: editor.config.filebrowserUploadUrl,
              type: "POST",
              data: fd,
              processData: false,
              contentType: false,
              dataType: 'json'
            })
                .done(function (data) {
                  if (data.added && data.added[0]) {
                    elfInsrance.exec('reload');
                    setDialogValue(data.added[0]);
                  } else {
                    error(data.error || data.warning || 'errUploadFile');
                  }
                })
                .fail(function () {
                  error('errUploadFile');
                })
                .always(function () {
                  input.val('');
                });
          }
          return false;
        }
      }
    }
  });

  //Create elFinder dialog for CKEditor
  CKEDITOR.on('instanceReady', function (e) {
    elfNode = $('<div style="padding:0;">');
    elfNode.dialog({
      autoOpen: false,
      modal: true,
      width: '80%',
      title: 'Server File Manager',
      create: function (event, ui) {
        var startPathHash = (elfDirHashMap[dialogName] && elfDirHashMap[dialogName]) ? elfDirHashMap[dialogName] : '';
        // elFinder configure
        elfInsrance = $(this).elfinder({
          startPathHash: startPathHash,
          useBrowserHistory: false,
          resizable: false,
          width: '100%',
          url: elfUrl,
          lang: app.language,
          dialogContained: true,
          getFileCallback: function (file, fm) {
            setDialogValue(file, fm);
            elfNode.dialog('close');
          }
        }).elfinder('instance');
      },
      open: function () {
        elfNode.find('div.elfinder-toolbar input').blur();
        setTimeout(function () {
          elfInsrance.enable();
        }, 100);
      },
      resizeStop: function () {
        elfNode.trigger('resize');
      }
    }).parent().css({'zIndex': '11000'});

    // CKEditor instance
    var cke = e.editor;

    // Setup the procedure when DnD image upload was completed
    /*cke.widgets.registered.uploadimage.onUploaded = function (upload) {
      var self = this;
      setShowImgSize(upload.url, function (size) {
        self.replaceWith('<img src="' + encodeURI(upload.url) + '" width="' + size.width + '" height="' + size.height + '"></img>');
      });
    }*/

    // Setup the procedure when send DnD image upload data to elFinder's connector
    cke.on('fileUploadRequest', function (e) {
      var target = elfDirHashMap['image'] ? elfDirHashMap['image'] : elfDirHashMap['fb'],
          fileLoader = e.data.fileLoader,
          xhr = fileLoader.xhr,
          formData = new FormData();
      e.stop();
      xhr.open('POST', fileLoader.uploadUrl, true);
      formData.append('cmd', 'upload');
      formData.append('target', target);
      formData.append('upload[]', fileLoader.file, fileLoader.fileName);
      xhr.send(formData);
    }, null, null, 4);

    // Setup the procedure when got DnD image upload response
    cke.on('fileUploadResponse', function (e) {
      var file;
      e.stop();
      var data = e.data,
          res = JSON.parse(data.fileLoader.xhr.responseText);
      if (!res.added || res.added.length < 1) {
        data.message = 'Can not upload.';
        e.cancel();
      } else {
        elfInsrance.exec('reload');
        file = res.added[0];
        if (file.url && file.url != '1') {
          data.url = file.url;
          try {
            data.url = decodeURIComponent(data.url);
          } catch (e) {
          }
        } else {
          data.url = elfInsrance.options.url + ((elfInsrance.options.url.indexOf('?') === -1) ? '?' : '&') + 'cmd=file&target=' + file.hash;
        }
        data.url = elfInsrance.convAbsUrl(data.url);
      }
    });
  });

  //
  // CKEditor - Twig Token support implementation - END
  //

  //
  // CKEDITOR --- END
  //

  //
  // SHOP START
  //

  $(document).on('click', '.shop-open-link', function(e) {
    e.preventDefault();
    var el = $(this);
    var form = $('#__visit-form__');
    modal.doRemote(el.attr('href'), 'POST', form.serialize(), {
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
      processData: true
    });
  });

  //
  // SHOP END
  //
});

$(function (){
  $(document).on('click', '.show_out_of_stock', function(e) {
    if(this.checked){
      $('.shop_item.is-not-active').show()
    }else{
      $('.shop_item.is-not-active').hide()
    }
  })
});
