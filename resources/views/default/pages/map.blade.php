@extends('layouts.default')

{{-- Content --}}
@section('content')

<ol class="breadcrumb">
	<li><a href="<?= route_page('/') ?>"><?= __('Home') ?></a></li>
	<li class="active"><?= $page_title ?></li>
</ol>
<div class="row">

	<div class="col-sm-4">
		@include('listings.map_sidebar')
	</div>

	<div class="col-sm-8 listings">
		<div id="ajax-loading" class="" style="display: none;">

			<div class="progress progress-striped active" style="width: 100%;">
		  		<div class="progress-bar"  role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%">
				</div>
			</div>
		</div>

		<script>var map_locations = <?= json_encode($map_locations); ?></script>
		<div id="map_canvas" style="width: 100%; height: 500px; "></div>
	</div>


</div>
<script>
var map_lat = parseFloat(<?= $map->lat ?>);
var map_lng = parseFloat(<?= $map->lng ?>);
var map_zoom = parseFloat(<?= $map->zoom ?>);
</script>
@stop
