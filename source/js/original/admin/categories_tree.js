(function ($) {
    if (typeof category_data !== 'undefined') {
        var data = JSON.parse(category_data);

        $('.category_tree_input').each(function (key, input) {
            make_list(input, data);
        });
    }

    function make_list(input, data) {
        input = $(input);
        input.hide();
        input.data('data', data);
        var root_name = input.data('root') || 'Вся категория';
        var callback = input.data('callback');
        var id = input.val();
        el = get_el_by_id(id, data);

        input.after(getSelectByParent(el.id, data));
        while (el) {
            input.after(getSelectByParent(el.parent, data, el.id));
            if (el.parent == 0) break;
            el = get_el_by_id(el.parent, data);
        }

        function get_el_by_id(id, data) {
            if (!data) {
                return false;
            }
            for (var i = 0; i < data.length; i++) {
                if (data[i].id == id) return data[i];
            }
            return false;
        }

        function getSelectByParent(id, data, sel) {
            if (!data) {
                return false;
            }
            var k = 0;
            var out = '<select class=\"form-control\" style=\"margin-top:5px;margin-bottom:5px;\">';
            if (id > 0) {
                out += '<option value=0>'+root_name+'</option>';
            } else {
                out += '<option value=\"\">Выберите категорию</option>';
            }
            for (var i = 0; i < data.length; i++) {
                if (data[i].parent == id) {
                    k++;
                    out += '<option value=' + data[i].id + ' data-index=' + i + '  ' + (data[i].id == sel ? 'selected' : '') + '>' + data[i].name + '</option>';
                }
            }
            out += '</select>';
            if (k == 0) {
                return false;
            }
            out = $(out);
            out.on('change', function () {
                var $this = $(this);
                $this.nextAll().remove();
                var input = $this.closest('.form-group').find('input');
                if ($this.val() === '0') {
                    input.val($this.prev().val());
                    return;
                } else if ($this.val() === '') {
                    input.val('');
                    return;
                }
                input.val($this.val());
                var data = input.data('data');
                var el = get_el_by_id(input.val(), data);
                $this.after(getSelectByParent(el.id, data));
                if (callback) {
                    callback($this);
                }
            });

            return out;
        }
    }
})(jQuery);
