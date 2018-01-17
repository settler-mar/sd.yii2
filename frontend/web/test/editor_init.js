//<script src="/plugins/tinymce/tinymce.min.js"></script>
/*


 <div id="roxyCustomPanel2" style="display: none;">
 <iframe src="/plugins/fileman/index.html?integration=custom&type=image&txtFieldId=txtSelectedFile" style="width:100%;height:100%" frameborder="0">
 </iframe>
 </div>
 */

var script = document.createElement('script');
script.onload=initEditor;
script.src = "/plugins/tinymce/tinymce.min.js";
script.async = true;
document.head.appendChild(script);

function initEditor(){
  tinymce.init({
    selector:'.visual_editor',
    height: 500,
    theme: 'modern',
    plugins: [
    'advlist autolink lists link image charmap hr anchor pagebreak',
    'searchreplace wordcount visualblocks visualchars code fullscreen',
    'insertdatetime media nonbreaking save table contextmenu directionality',
    'emoticons template paste textcolor colorpicker textpattern imagetools  toc help'
  ],
    toolbar1: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | media | forecolor backcolor |  help ',
    file_browser_callback: RoxyFileBrowser,
    image_advtab: true,
    style_formats: [
    { title: 'Headers', items: [
      { title: 'h1', block: 'h1' },
      { title: 'h2', block: 'h2' },
      { title: 'h3', block: 'h3' },
      { title: 'h4', block: 'h4' },
      { title: 'h5', block: 'h5' },
      { title: 'h6', block: 'h6' }
    ] },

    { title: 'Blocks', items: [
      { title: 'p', block: 'p' },
      { title: 'div', block: 'div' },
      { title: 'pre', block: 'pre' }
    ] },

    { title: 'Containers', items: [
      { title: 'section', block: 'section', wrapper: true, merge_siblings: false },
      { title: 'article', block: 'article', wrapper: true, merge_siblings: false },
      { title: 'blockquote', block: 'blockquote', wrapper: true },
      { title: 'hgroup', block: 'hgroup', wrapper: true },
      { title: 'aside', block: 'aside', wrapper: true },
      { title: 'figure', block: 'figure', wrapper: true }
    ] }
  ]
  });
  function RoxyFileBrowser(field_name, url, type, win) {
    var roxyFileman = 'plugins/fileman/index.html';
    if (roxyFileman.indexOf("?") < 0) {
      roxyFileman += "?type=" + type;
    }
    else {
      roxyFileman += "&type=" + type;
    }
    roxyFileman += '&input=' + field_name + '&value=' + win.document.getElementById(field_name).value;
    if(tinyMCE.activeEditor.settings.language){
      roxyFileman += '&langCode=' + tinyMCE.activeEditor.settings.language;
    }
    tinyMCE.activeEditor.windowManager.open({
      file: roxyFileman,
      title: 'Roxy Fileman',
      width: 850,
      height: 650,
      resizable: "yes",
      plugins: "media",
      inline: "yes",
      close_previous: "no"
    }, {     window: win,     input: field_name    });
    return false;
  }
  function FileSelected(file){
    /**
     * file is an object containing following properties:
     *
     * fullPath - path to the file - absolute from your site root
     * path - directory in which the file is located - absolute from your site root
     * size - size of the file in bytes
     * time - timestamo of last modification
     * name - file name
     * ext - file extension
     * width - if the file is image, this will be the width of the original image, 0 otherwise
     * height - if the file is image, this will be the height of the original image, 0 otherwise
     *
     */
      // Get the ID of the input to fill
    var fieldId = RoxyUtils.GetUrlParam('txtFieldId');
    $(window.parent.document).find('#' + fieldId).attr('value', file.fullPath);
    window.parent.closeCustomRoxy2();
  }
  initImageServerSelect($('.fileServerSelect'));
};

function initImageServerSelect(els){
  if(els.length==0)return;
  els.wrap('<div class="select_img">');
  els=els.parent();
  els.append('<button type="button"><i class="mce-ico mce-i-browse"></i></button>');
  els.find('button').on('click',openCustomRoxy2);

  if($('#roxyCustomPanel2').length==0){
    browserBlk='<div id="roxyCustomPanel2" style="display_: none;">';
    browserBlk+='<div>';
    browserBlk+='<span class="close"></span>';
    browserBlk+='<iframe src="/plugins/fileman/index.html?integration=custom&type=image" style="width:100%;height:100%" frameborder="0">';
    browserBlk+='</iframe>';
    browserBlk+='</div>';
    browserBlk+='</div>';
    $('body').append(browserBlk);
    $('#roxyCustomPanel2 .close').click(function(){
      $('#roxyCustomPanel2').removeClass('open')
    })
  }
}

function openCustomRoxy2(){
  closeCustomRoxy2=closeCustomRoxy.bind(this);
  $('#roxyCustomPanel2').addClass('open')
}
var closeCustomRoxy2;
function closeCustomRoxy(img){
  if(img) {
    if(img[0]!=="/"){
      img='/'+img;
    }
    img_el=$(this).parent().find('input')
    img_el.val(img);
    img_el.change();
  }
  $('#roxyCustomPanel2 .close').click()
}
