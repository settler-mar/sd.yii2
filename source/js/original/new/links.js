(function () {
  $('.hidden-link').replaceWith(function () {
    $this = $(this)
    console.log($this);
    return '<a href="' + $(this).data('link') + '" class="' + $this[0].className + '">' + $(this).text() + '</a>';
  })
})();
