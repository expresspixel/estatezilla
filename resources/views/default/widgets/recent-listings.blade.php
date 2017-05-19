<? foreach($properties as $property) : ?>
	<div class="col-xs-4 col-md-4">
		<div class="panel panel-default">
  <div class="panel-body" style="height: 300px;">
			<a href="<?= $property->url() ?>"><img alt="<?= $property->title ?>" style="width: 100%" src="{{$property->thumbnail('listings')}}" data-holder-rendered="true"></a>
			<br />
			<br />
			<div class="caption">
				<a href="<?= $property->url() ?>"><h5 style="margin:0; font-weight: normal; padding: 0; margin-bottom: 5px;"><?= $property->title ?></a></h5>
				<strong><h4 style="margin:0; padding: 0;"><?= $property->priceFormatted ?></h4></strong>
			</div>
		</div>
		</div>
	</div>
<? endforeach; ?>
