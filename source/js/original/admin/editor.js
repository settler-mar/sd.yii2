//Редактор
editor = function () {
  var template = false;
  init_template();

  function init_template() {
    if (template) return;
    template = (function () {
      var ready = false;
      var tpls = {};

      $.get('/ru/admin/template/tpls', function (data) {
        for (index in data) {
          tpls[index] = Twig.twig({
            data: data[index]
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

  var editor_ctnr = 0;

  var sort_params = {
    revert: true,
    placeholder: "sortable-placeholder",
    connectWith: ".editor-content-row,.editor-content",
    handle: '.handle',
    stop: function (event, ui) {
      if (ui.item.hasClass('ui-draggable')) {
        //чистим все стили и данные отродительского блока
        ui.item[0].removeAttribute("class");
        ui.item[0].removeAttribute("style");

        var tag = ui.item.data('tag');
        var sub_tag = ui.item.data('sub-tag');

        if (tag == "row") {
          sub_tag = [];
          var cols = ui.item.find('.blockbuilder-column');
          for (col_k in cols) {
            var col = cols[col_k];
            for (class_k in col.classList) {
              var class_name = col.classList[class_k];
              if (class_name.indexOf("col-") == 0) {
                sub_tag.push(class_name.substr(4));
                break;
              }
            }
          }
        }
        generateBlock(ui.item, tag, {}, sub_tag);
      }

      var row = ui.item.closest('.editor-content-row');
      if (row.length > 0 && row.find('.tag_wrap').length > 0) {
        row.removeClass("col-empty");
      }
    },
    start: function (event, ui) {
      var row = ui.item.closest('.editor-content-row');
      if (row.length > 0 && row.find('.tag_wrap').length == 1) {
        row.addClass("col-empty");
      }
    }
  };

  $('#editor-components li').draggable({
    connectToSortable: ".editor-content,.editor-content-row",
    helper: "clone",
    revert: "invalid",
    opacity: 0.5
  }).disableSelection();

  $('#editor-row li').draggable({
    connectToSortable: ".editor-content",
    helper: "clone",
    revert: "invalid",
    opacity: 0.5
  }).disableSelection();

  $('.editor-content').on('click', 'a', function (e) {
    e.preventDefault();
    e.preventDefault();
    e.stopPropagation();
    return false;
  });

  $('.editor-panel .width').on('change', function () {
    $(".editor-content").css('width', this.value)
  });

  $('.editor-panel .color').closest('.form-group').find('input')
    .on('change', liveChangeBg)
    .on('input', liveChangeBg)
    .on('keyup', liveChangeBg);

  function liveChangeBg() {
    var $this = $(this);
    var $inputs = $this.closest('.form-group').find('input');
    var color = $this.val();
    $inputs.val(color);

    $(".editor-full").css('background-color', color)
  }

  $('[name=language]').on('change', function () {
    var in_edit = $('.editor-content .on_edit');
    if (in_edit.length > 0) {
      in_edit.removeClass('on_edit');
      in_edit.click();
    }

    var lg = $('[name=language]:checked').val();

    var hasLanguage = $('.editor-content .hasLanguage');
    for (var i = 0; i < hasLanguage.length; i++) {
      var el = hasLanguage.eq(i);
      var lg_var = el.data('lg_var');
      var data = el.data('data');
      var params = el.data('params');

      for (name_i in lg_var) {
        var name = lg_var[name_i];

        if (params[name].type == "ckeditor") {
          CKEDITOR.instances[params[name].editor_id].setData(data[name][lg]);
          continue;
        }
        var val = typeof (data[name])!="undefined"&&typeof (data[name][lg])!="undefined"?data[name][lg]:'';
        liveChange.bind({
          name: name,
          value: val,
          el: el
        })();
      }
    }

    hasLanguage = $('#content-subject,#content-text').find('.hasLanguage');
    for (var i = 0; i < hasLanguage.length; i++) {
      var el = hasLanguage.eq(i);
      var data = el.data('data');
      var val = typeof (data[lg])!="undefined"?data[lg]:'';
      el.val(val);
      el.html(test_editor(val).split("\n").join("<br>\n"));
    }
  });

  function getArrayKey(arr) {
    var keys = [];
    for (var key in arr) {
      if (arr.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    return keys;
  }

  function liveChange(el) {
    var par;

    if (typeof(el) == 'object') {
      par = $('.on_edit');
    } else {
      par = this.el;
    }
    var name = this.name;
    var value = this.value;

    var params = par.data('params');
    var data = par.data('data');
    var pr_val = "";

    if (params[name].isLanguage) {
      var lg = $('[name=language]:checked').val();
      pr_val = data[name][lg];
      data[name][lg] = value;
    } else {
      pr_val = data[name];
      data[name] = value;
    }

    par.data('data', data);

    params = params[name];
    if (params.sufix) {
      value += params.sufix;
      pr_val += params.sufix;
    }
    if (params.prefix) {
      value = params.prefix + value;
      pr_val = params.prefix + pr_val;
    }
    var el = params.el == "this" ? par : par.find(params.el);
    for (param_k in params.params) {
      var param = params.params[param_k];

      if (param.indexOf('style.') == 0) {
        param = param.split('style.')[1];
        el[0].style[param] = value;
      } else {
        if (param == "class") {
          el.removeClass(pr_val);
          el.addClass(value);
        } else {
          el[0][param] = value
        }
      }
    }
  }

  function generateBlock(item, tag, datas, sub_tag) {
    var block = create_block(tag, datas, sub_tag);
    if (!block) {
      item.remove();
      return;
    }

    var set_default = true;

    item.addClass('tag_wrap');
    item.html(block);

    item.find('.col-empty').attr('empty_msg', "No content here. Drag content from components.");

    var wrap = item.find('.li_wrap');
    if (datas) {
      wrap.data('data', datas);
    }
    item.data('tag', tag);
    get_options(tag, wrap, true, sub_tag);

    if (tag == "table") {
      item.data('sub-tag', sub_tag);
      var sort_list = item.eq(0).find('.sort_list');
      sort_list.sortable({
        revert: true,
        placeholder: "sortable-placeholder",
        stop: function (event, ui) {
          var wrap = ui.item.closest('.li_wrap');
          var els = ui.item.parent().find('li');
          var data = wrap.data('data');

          var list = [];
          for (var i = 0; i < els.length; i++) {
            var name = els.eq(i).data('name');
            if (name) list.push(name);
          }
          data.items = list;
          wrap.data('data', data);
        }
      }).disableSelection();

      var data = Object.assign(wrap.data('data'));
      if (typeof (datas.items) != "undefined") {
        data.items = datas.items;
      } else {
        data.items = getArrayKey(table_list[sub_tag].list);
      }
      if (typeof(datas.hidden) != 'undefined') {
        data.hidden = datas.hidden;
      } else {
        data.hidden = [];
      }
      wrap.data('data', data);

      sort_list.find('.hide_show').on('click', function () {
        var per = $(this).closest('li');
        var name = per.data('name');
        var el = per.closest('.li_wrap');
        var data = el.data('data');
        if (typeof (data.hidden) == "undefined") data.hidden = [];
        var index = data.hidden.indexOf(name);

        if (per.hasClass('el_hidden')) {
          per.removeClass('el_hidden');
          if (index >= 0) {
            data.hidden.splice(index, 1);
          }
        } else {
          per.addClass('el_hidden');
          if (index == -1) {
            data.hidden.push(name)
          }
        }
        el.data('data', data);
      })
    }

    if (tag == "row") {
      var rows = item.find('.blockbuilder-row-tool-editor ul').sortable(sort_params);
      if (typeof (datas.items) != "undefined") {
        for (var j = 0; j < datas.items.length; j++) {
          generateUl(rows.eq(j), datas.items[j]);
        }
      }
    }
  }


  $('.editor-content').sortable(sort_params)
  //.disableSelection()
    .on('click', '.li_wrap', function (e) {
      $this = $(this);
      if ($this.hasClass('on_edit')) return;
      $this.closest('.editor-content').find('.on_edit').removeClass('on_edit');
      $this.addClass('on_edit');

      var ok = $('.editor-panel [href="#editor-option"]');
      ok.parent().removeClass('hidden');
      tab_select.bind(ok[0])(e);
      var options = $('#editor-option');
      options.html(get_options($this.parent().data('tag'), $this,false,$this.parent().data('subTag')));
      options.find('input,select')
        .on('change', liveChange)
        .on('input', liveChange)
        .on('keyup', liveChange);
      return false;
    })
    .on('click', '.trash', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var $this = $(this);
      var el = $this.closest('.tag_wrap');
      if ($this.closest('.li_wrap').hasClass('on_edit')) {
        var ok = $('.editor-panel [href="#editor-option"]');
        if (ok.parent().hasClass('active')) {
          tab_select.bind(ok.closest('ul').find('li:first').find('a')[0])(e);
        }
        ok.parent().addClass('hidden');
      }


      var row = $this.closest('.editor-content-row');
      if (row.length > 0) {
        if (row.find('.tag_wrap').length == 1) {
          row.addClass("col-empty");
        }
      }

      el.remove();
    });

  function create_block(type, data, sub_type) {
    if (!options_list[type]) {
      return false;
    }

    if (!data) {
      data = {};
    } else {
      data = Object.assign(data);
    }
    data.editor = true;
    if (type == "table") {
      if (!table_list[sub_type]) {
        return false;
      }
      data.table = Object.assign(table_list[sub_type]);
      if (typeof(data.items) != 'undefined') {
        data.table_list = data.items;
      }
      if (typeof(data.hidden) != 'undefined') {
        data.table.hidden = data.hidden;
      } else {
        data.table.hidden = [];
      }
      if (typeof(data.direction) != 'undefined') {
        data.table.type = data.direction;
      } else {
        data.direction = data.table.type;
      }
      if (typeof(data.items) == 'undefined') {
        data.items = Object.keys(data.table.list);
      }
    } else if (type == "row") {
      if (typeof(data.rows) == "undefined") {
        data.rows = sub_type;
      }
    }

    if(sub_type){
      data['sub_type']=sub_type;
    }
    var out = template.render('editor_' + type, data);
    if (!out) return false;

    out = "<div class=li_wrap type='" + (type == "row" ? "row" : "content") + "'>" +
      out +
      "<i class=\"glyphicon glyphicon-move handle\"></i>" +
      "<i class=\"glyphicon glyphicon-trash trash\"></i>" +
      "</div>";
    return out;
  }

  function get_options(tag, el, set_def, sub_tag) {
    var out = "";
    var data = {};
    if (!el.data('data')) {
      data = {};
      if (tag == 'table') {
        var type = table_list[sub_tag].type;
        data.direction = type;
      }
    } else {
      data = el.data('data');
    }
    var hide={};
    if(sub_tag && table_list[sub_tag] && table_list[sub_tag].hide){
      hide=table_list[sub_tag].hide;
    }
    var el_params = {};
    var lg_var = [];
    tag_params = options_list[tag];
    var lg = $('[name=language]:checked').val();
    var lgs = $('[name=language]');

    for (var i = 0; i < tag_params.length; i++) {
      title = tag_params[i].title || tag_params[i].name;
      out += "<h4>" + title + "</h4>";
      for (var j = 0; j < tag_params[i].items.length; j++) {
        var value;
        var ctrl = tag_params[i].items[j].element == "this" ? el : el.find(tag_params[i].items[j].element);
        var name = tag_params[i].items[j].name;
        var params = false;
        el_params[name] = {};

        if (typeof(tag_params[i].items[j].param) != "undefined") {
          params = tag_params[i].items[j].param.split('|');
          el_params[name].params = params;
          if (tag_params[i].items[j].sufix) {
            el_params[name].sufix = tag_params[i].items[j].sufix;
          }
          if (tag_params[i].items[j].prefix) {
            el_params[name].prefix = tag_params[i].items[j].prefix;
          }
        }

        var type = tag_params[i].items[j].type;
        el_params[name].type = type;
        el_params[name].el = tag_params[i].items[j].element;
        el_params[name].isLanguage = !!tag_params[i].items[j].isLanguage;

        if (set_def) {
          if(hide[name]){
            value=hide[name];
          }else if (data[name]) {
            if (tag_params[i].items[j].isLanguage) {
              value = data[name][lg];
            } else {
              value = data[name];
            }
          } else {
            value = typeof (tag_params[i].items[j].default) == "undefined" ? data[name] : tag_params[i].items[j].default;
          }

          if (tag_params[i].items[j].isLanguage) {
            el.addClass('hasLanguage');
            lg_var.push(name);

            if (typeof(data[name]) == "undefined") {
              data[name] = {};
              for (var k = 0; k < lgs.length; k++) {
                var lg_ = lgs.eq(k).val();
                data[name][lg_] = lg_ + " " + value;
              }
              value = data[name][lg];
            } else {
              data[name][lg] = value;
            }
          } else {
            data[name] = value;
          }
          if (tag_params[i].items[j].sufix) {
            value += tag_params[i].items[j].sufix;
          }
          if (tag_params[i].items[j].prefix) {
            value = tag_params[i].items[j].prefix + value;
          }
          if (params) {
            for (param_k in params) {
              var param = params[param_k];
              var style = false;
              if (param.indexOf('style.') == 0) {
                style = true;
                param = param.split('style.')[1];
              }
              if (ctrl.length > 0) {
                if (style) {
                  ctrl[0].style[param] = value
                } else {
                  if (ctrl[0][param] == "style") {
                    ctrl.addClass(value);
                  } else {
                    ctrl[0][param] = value
                  }
                }
              }
            }
          }
        } else {
          if (tag_params[i].items[j].isLanguage) {
            value = data[name][lg];
          } else {
            value = data[name];
          }
        }

        if (type == 'none' || hide[name]) continue;

        if (type == "ckeditor") {
          el_params[name].editor_id = ctrl.attr('id');

          if (!el_params[name].editor_id) {
            while ($('#cedit_' + editor_ctnr).length > 0) {
              editor_ctnr++;
            }
            ;

            el_params[name].editor_id = 'cedit_' + editor_ctnr;

            ctrl.attr('id', 'cedit_' + editor_ctnr);
            ctrl.attr('name', name);
            ctrl.html(value);
            ctrl.on('change', function () {
              var el = this.el;
              var par = this.parent;
              var name = el.attr('name');

              var params = par.data('params');
              var data = par.data('data');

              var value = el.val();
              var pr_val = "";

              if (params[name].isLanguage) {
                var lg = $('[name=language]:checked').val();
                pr_val = data[name][lg];
                data[name][lg] = value;
              } else {
                pr_val = data[name];
                data[name] = value;
              }
              par.data('data', data);

            }.bind({
              el: ctrl,
              parent: el
            }));
            app.ckeditor_init('cedit_' + editor_ctnr);

            ctrl.data('data', data);
          }
          continue;
        }

        var title = tag_params[i].items[j].title || tag_params[i].items[j].name;

        var list = typeof (tag_params[i].items[j].list) != "undefined" ? tag_params[i].items[j].list : [];

        if (tag_params[i].items[j].isLanguage) {
          out += "<label class='isLanguage'><span>" + title + "</span><br>";
        } else {
          out += "<label>" + title + "<br>";
        }
        if (type == "text") {
          out += '<input name="' + name + '" value="' + value + '">';
        }
        if (type == "number") {
          out += '<input name="' + name + '" class=num value="' + value + '">';
        }
        if (type == "color") {
          out += '<input name="' + name + '" type=color value="' + value + '">';
        }
        if (type == "font") {
          list = ['Arial', 'Verdana', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New', 'Lucida Console'];
          type = "select";
        }
        if (type == "align") {
          list = align_list;
          type = "select";
        }
        if (type == "select") {
          out += '<select name="' + name + '">';

          for (var list_i in list) {
            var code = Array.isArray(list) ? list[list_i] : list_i;
            var sel = code == value ? "  selected" : "";
            out += "<option value='" + code + "'" + sel + ">" + list[list_i] + "</option>";
          }
          out += '</select>';
        }
        out += "</label>";

      }
    }

    if (set_def) {
      el.data('data', data);
      el.data('lg_var', lg_var);
    }
    el.data('params', el_params);
    return out;
  }

  function getDataLavel(parent) {
    var out = [];
    var els = parent.find('>li');
    for (var i = 0; i < els.length; i++) {
      var el = els.eq(i);
      var data = Object.assign(el.find('>.li_wrap').data('data'));
      var type = el.data('tag');
      var sub_type = el.data('sub-tag');

      var item = {
        type: type,
        data: data
      };

      if (type == 'table') {
        item.sub_type = sub_type;
        if (item.data && item.data.table) {
          delete item.data.table;
        }
      }

      if (item.data && item.data.editor) {
        delete item.data.editor;
      }

      if (type == 'row') {
        $sub_ul = el.find('.editor-content-row');
        item.data.items = [];
        for (var j = 0; j < $sub_ul.length; j++) {
          item.data.items.push(getDataLavel($sub_ul.eq(j)));
        }
      }

      out.push(item);
    }

    return out;
  }

  function getData() {
    data= {
      "data":getDataLavel($('.editor-content'))
    };
    els=$('#content-subject,#content-text').find('.hasLanguage');
    for (var i = 0; i < els.length; i++) {
      var el = els.eq(i);
      var d = el.data('data');
      data[el.attr('name')]=d;
    }

    return data;
  }

  function generateUl(ul, data){
    ul.html("");
    for (var i = 0; i < data.length; i++) {
      var item = $("<li/>");
      ul.append(item);
      generateBlock(item, data[i].type, data[i].data, data[i].sub_type);
    }
    if(ul.find('>li').length>0)ul.removeClass("col-empty")
  }

  function setData(data) {

    if(!template.ready()){
      setTimeout(function(){
        editor.setData(this)
      }.bind(data),100);
      return;
    }
    if (typeof(data) == "string") {
      data = JSON.parse(data);
    }
    var ul = $('.editor-content');

    if(typeof(data.data)!="undefined"){
      generateUl(ul,data.data);
    }
    if(typeof(data.subject)!="undefined"){
      $('#content-subject .editor-content-input').data('data',data.subject)
    }
    if(typeof(data.text)!="undefined"){
      $('#content-text .editor-content-textarea').data('data',data.text);
    }
    $('[name=language]').change();
  }

  function setInputData() {
    var lg = $('[name=language]:checked').val();
    var value;
    if (this.nodeName === "DIV") {
      value = html_to_text($(this).html());
     } else {
      value = $(this).val();
    }
    var data = $(this).data('data');
    data[lg] = value;
    $(this).data('data', data);
  }

  function test_editor_e(e){
    el=this;
    var str =  test_editor(el.innerHTML, el.classList.contains("is_string"));
    if(el.innerHTML != str){
      el.innerHTML=str;
      var range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  function test_editor(str,is_line){
    //str=str.replace(/^<p>/g,'').replace(/<\/p>$/g,'');
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
    str = str.replace(tags, function ($0, $1) {
      if ("<span>".indexOf('<' + $1.toLowerCase() + '>') > -1) return $0;
      if (!is_line && "<div><p><br>".indexOf('<' + $1.toLowerCase() + '>') > -1) return $0;
      return "";
    });

    var twig = /\{\/?([a-z0-9\.\ _]*)\}/gi;
    str=str.replace(twig, function ($0, $1) {
      return "<span contentEditable = false>{ <span>"+$1.trim()+"</span> }</span>";
    });

    return str;
    //return "<p>"+str+"</p>"
  }

  function html_to_text(str){
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
    str = str.replace(tags, function ($0, $1) {
      if ("<div><p><br>".indexOf('<' + $1.toLowerCase() + '>') > -1) return "\n";
      return "";
    });
    return str;
  }

  var input = $('<div/>',{
      'class':"hasLanguage editor-content-input form-control is_string",
      'contenteditable':"true",
      'name':'subject'
    })
    .data('data',{})
    .on('input',test_editor_e)
    .on('keyup',setInputData);
  $('#content-subject')
    .append('Тема письма')
    .append(input);

  var input = $('<div/>',{
    'class':"hasLanguage editor-content-textarea",
    'contenteditable':"true",
    'name':'text'
    })
    .data('data',{})
    .on('input',test_editor_e)
    .on('keyup',setInputData);
  $('#content-text')
    .find('div')
    .append(input);

  var tx=$('.w_editor');
  if(tx.length==1){
    tx.hide();

    setData(JSON.parse(tx.val()));

    $('.editor-panel .btn-save').on('click',function(){
      $('.w_editor').val(JSON.stringify(getData()));
      $('.w_editor').closest('form').submit()
    });
  }

  $('.editor-panel .btn-send').on('click', function(){
      var data = {
          'action': $('.w_editor').closest('form').attr('action'),
          'language': $('[name=language]:checked').val(),
          'data': JSON.stringify(getData()),
          '_csrf-frontend': $('.w_editor').closest('form').find('[name=_csrf-frontend]').val()
      };
      $.post('ru/admin/template/preview?db=1', data, function (data) {

          var data_msg = {
              buttonYes: false,
              notyfy_class: 'send-email',
              question: data.html
          };

          if (data.title) {
              data_msg['title']=data.title;
          }
          notification.alert(data_msg);
          ajaxForm($('.notify_box .notify_content'));
      }, 'json');
  });

  return {
    getData: getData,
    setData: setData,
    sort_params: sort_params
  }
}();