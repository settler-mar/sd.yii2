<div class="input_file input_file-image">
  <div class="prew_blk">
    <div class="img_blk tpl">
      <div class="img"></div>
      <div class="del"></div>
    </div>
    <?php
      foreach ($value as $item){
    ?>
        <div class="img_blk">
          <div class="img">
            <img src="<?=$item;?>">
          </div>
          <div class="del"></div>
        </div>
    <?php
      }
    ?>
  </div>
  <div class="btn-block">
    <div class="btn-add">
      Добавить фото
      <?=$file_input;?>
    </div>
  </div>
</div>