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
		<div class="panel-footer property-features">
			<ul class="nav nav-pills nav-justified ">
				<li><span class="fa fa-bed" aria-hidden="true"></span> <?= $property->num_bedrooms ?></li>
				<li><span class="fa fa-shower" aria-hidden="true"></span> <?= $property->num_bathrooms ?></li>
				<? if ($property->property_size): ?>
					<li><span class="fa fa-arrows-alt" aria-hidden="true"></span> <?= $property->property_size ?></li>
				<? endif; ?>
				<? if ($property->has_parking): ?>
					<li><span class="fa fa-car" aria-hidden="true"></span></li>
				<? endif; ?>
			</ul>
		</div><!-- footer -->
		</div>
	</div>
<? endforeach; ?>
