<? if(isset($regions['slideshow'])) : ?>
<div id="carousel-example-generic" class="carousel slide" data-ride="carousel">
	<ol class="carousel-indicators">
		<? foreach($regions['slideshow'] as $i => $block) : ?>
		<li data-target="#carousel-example-generic" data-slide-to="0" class="<?= ($i===0)?'active':'' ?>"></li>
		<? endforeach; ?>
	</ol>
	<div class="carousel-inner" role="listbox">
		<? foreach($regions['slideshow'] as $i => $block) : ?>
        <div class="item <?= ($i===0)?'active':'' ?>">

			<a href="<?= $block->url ?>"><img alt="{!!$block->title!!}" src="{!! url( $block->image ) !!}" data-holder-rendered="true" /></a>
		    <a  href="<?= $block->url ?>" class="carousel-caption" style="padding-top: 0; color:  #fff; text-decoration:  none;">
				<h3>{!!$block->title!!}</h3>
				<p>{!!$block->caption!!}</p>
			</a>
		</div>
		<? endforeach; ?>
	</div>
	<a class="left carousel-control" href="#carousel-example-generic" role="button" data-slide="prev">
        <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
        <span class="sr-only">{{ __('Previous') }}</span>
	</a>
	<a class="right carousel-control" href="#carousel-example-generic" role="button" data-slide="next">
        <span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
        <span class="sr-only">{{ __('Next') }}</span>
	</a>
</div>
<? else: ?>
<div id="carousel-example-generic" class="carousel slide" data-ride="carousel">
	<img src="https://placeholdit.imgix.net/~text?txtsize=62&txt=620%C3%97330&w=620&h=336" />
</div>
<? endif; ?>
