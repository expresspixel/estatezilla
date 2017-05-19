<? time() ?>
@if($properties->total() == 0)
	<div id="ajax-loading" class="alert alert-info" >

	    <?= __('Sorry, no results found. Please try and broaden your search criteria') ?>

	</div>
@else

@if($message)
	<em><?= sprintf(__("The location '%s' was not found. Showing all results."), Input::get('location')); ?></em>
@endif
<div class="row" style="margin-top: 5px;">
	<div class="col-xs-12">
		<ul class="nav nav-tabs">
			<li class="<?= ($view_type == 'grid')?'active':'' ?>"><a href="#grid-view" data-toggle="tab"> <i class="fa fa-th fa-fw"></i><?= __('Grid view') ?></a></li>
			<li class="<?= ($view_type == 'list')?'active':'' ?>"><a href="#list-view" data-toggle="tab"><i class="fa fa-reorder fa-fw"></i> <?= __('List view') ?></a></li>
		</ul>
	</div>
</div>

<div class="row">

	<div class="col-xs-12">
<div class="panel panel-default" style="border-top: 0">
  <div class="panel-body">
			<div class="row">
				<div class="col-xs-6">
					<strong><?= $properties->perPage()*($properties->currentPage()-1)+1 ?> - <?= ($properties->perPage()*$properties->currentPage() <= $properties->total())?$properties->perPage()*$properties->currentPage():$properties->total() ?> of <?= $properties->total() ?> <?= __('properties') ?></strong>
				</div>


				<div class="col-xs-6 text-right">
							<?= __('Sort by') ?>  : &nbsp;&nbsp;
						<?= Form::select('sort', $sort_types, $sort_type, array('class' => '')); ?>
				</div>

			</div>
		</div>
		</div>
	</div>
</div>


<div class="tab-content">

	<div class="tab-pane <?= ($view_type == 'grid')?'active':'' ?>" id="grid-view">

		<div class="row grid-row">

		<? foreach($properties as $property) : ?>
			<div class="col-xs-4 grid-box " id="grid-<?= $property->id ?>">
				<div class="well">
					<div class="row ">
						<div class="col-xs-12">
							<a href="<?= $property->url() ?>" class="thumbnail">
								<img alt="" src="{{$property->thumbnail('listings')}}" width="176" height="120" style="min-height: 70px;"/>
							</a>
							<h2 style="margin-top: 0; margin-bottom: 0px; color: #007200;  font-size: 15px;"><a style="font-weight: bold;color: #007200;  font-size: 15px;"href="<?= $property->url() ?>"><?= $property->priceFormatted() ?></a></h2>
						</div>

						<div class="col-xs-12">
							<a style="color: #004889; font-size: 15px" href="<?= $property->url() ?>">
								<strong>{{ $property->title }}</strong>
							</a>
							<p>{{ $property->displayable_address }}{{ $property->has_parking }}</p>
						</div>
					</div>
				</div>
			</div>
		<? endforeach; ?>
		</div>
	</div>

	<div class="tab-pane <?= ($view_type == 'list')?'active':'' ?>" id="list-view">
	<? foreach($properties as $property) : ?>
		<div class="row listing-row" id="list-<?= $property->id ?>">
			<div class="col-sm-12">
			<div class="well">
			<div class="row">
			<div class="col-xs-3">
				<a href="<?= $property->url() ?>" class="thumbnail">
					<img alt="" src="{{$property->thumbnail('listings')}}">
				</a>
				@if($property->num_bedrooms)
				<h6><?= __('Bedrooms') ?>: <?= $property->num_bedrooms; ?></h6>
				<h6><?= __('Bathrooms') ?>: <?= $property->num_bathrooms; ?></h6>
				@endif
			</div>

			<div class="col-xs-9">
				<h3 style="margin-top: 0; margin-bottom: 10px; "><a href="<?= $property->url() ?>">{{ $property->priceFormatted()  }}</a></h3>
				<p style="margin-top: 0; margin-bottom: 10px;"><a href="<?= $property->url() ?>"><h4><?= $property->title ?></h4></a></p>
				<p><strong>{{ $property->displayable_address }}</strong></p>
				<p><?= str_limit($property->summary, 350) ?></p>
			</div>

		</div>
		</div>
		</div>
		</div>
	<? endforeach; ?>
	</div>
	
</div>

<?php echo $properties->render(); ?>
@endif
