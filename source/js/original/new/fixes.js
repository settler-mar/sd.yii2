//для айфона фиксим съехавший курсор
 $(document).ready(function() {
  // Detect ios 11_x_x affected
  // NEED TO BE UPDATED if new versions are affected
  var ua = navigator.userAgent,
    iOS = /iPad|iPhone|iPod/.test(ua),
    iOS11 = /OS 11_0_1|OS 11_0_2|OS 11_0_3|OS 11_1|OS 11_1_1|OS 11_1_2|OS 11_2|OS 11_2_1/.test(ua);

  // ios 11 bug caret position
  if ( iOS && iOS11 ) {

    // Add CSS class to body
    $("body").addClass("iosBugFixCaret");
  }
});


// https://stackoverflow.com/questions/46339063/ios-11-safari-bootstrap-modal-text-area-outside-of-cursor
//еще вариант фикса
(function() {
  if (!/(iPhone|iPad|iPod).*(OS 11_[0-2]_[0-5])/.test(navigator.userAgent)) return

  document.addEventListener('focusin', function(e) {
    if (!e.target.tagName == 'INPUT' && !e.target.tagName != 'TEXTAREA') return
    var container = getFixedContainer(e.target)
    if (!container) return
    var org_styles = {};
    ['position', 'top', 'height'].forEach(function(key) {
      org_styles[key] = container.style[key]
    })
    toAbsolute(container)
    e.target.addEventListener('blur', function(v) {
      restoreStyles(container, org_styles)
      v.target.removeEventListener(v.type, arguments.callee)
    })
  })

  function toAbsolute(modal) {
    var rect = modal.getBoundingClientRect()
    modal.style.position = 'absolute'
    modal.style.top = (document.body.scrollTop + rect.y) + 'px'
    modal.style.height = (rect.height) + 'px'
  }

  function restoreStyles(modal, styles) {
    for (var key in styles) {
      modal.style[key] = styles[key]
    }
  }

  function getFixedContainer(elem) {
    for (; elem && elem !== document; elem = elem.parentNode) {
      if (window.getComputedStyle(elem).getPropertyValue('position') === 'fixed') return elem
    }
    return null
  }
})()