@extends('layouts.default')

{{-- Content --}}
@section('content')
<ol class="breadcrumb">
	<li><a href="/"><?= __('Home') ?></a></li>
	<li class="active"><?= $page_title ?></li>
</ol>
<div class="row">
	<div class="col-sm-4">
		@include('listings.listing_sidebar')
	</div>

	<div class="col-sm-8 listings">


		<div id="ajax-loading" class="" style="display: none;">
		    <?/*<strong><?= __('Loading...') ?></strong>*/?>

			<div class="progress progress-striped active" style="width: 100%;">
		  		<div class="progress-bar"  role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%">
				</div>
			</div>
		</div>

		<div id="listings_view">
			<div class="listings_view_content">

				@include('listings.view')
			</div>
		</div>
	</div>

</div>


@stop
