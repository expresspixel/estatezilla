@extends('layouts.default')
{{-- Web site Title --}}
@section('title')
{{{ $page_title }}} ::
@parent
@stop

{{-- Web site Title --}}
@section('description')
{{{ $page_description }}}
@parent
@stop

{{-- Content --}}
@section('content')
<ol class="breadcrumb">
  <li><a href="<?= url('/') ?>">Home</a></li>
  <li><a href="<?= route_page(($property->listing_type == 'sale')?'for_sale':'to_rent') ?>"><?= ($property->listing_type == 'sale')?__('For sale'):__('To rent')  ?></a></li>
  <li class="active"><?= $property->title ?></li>
</ol>
<div class="row">


	<div class="col-xs-12">

		<div class="row">
			<div class="col-xs-12">

				<? if(Session::has('last_search.type')): ?>
					<br /><a href="<?= route_page(($property->listing_type == 'sale')?'for_sale':'to_rent') ?>?<?= http_build_query(Session::get('last_search.query')) ?>#<?= $property->id ?>"><i class="fa fa-chevron-left"></i> <?= __('back to listings') ?></a>
				<? endif; ?>
			</div>
		</div>
		<div class="row">
			<div class="col-xs-8">
				<h3><?= $property->title ?></h3>
				<h6><?= $property->displayable_address ?></h6>
			</div>
			<div class="col-xs-4 pull-right">
				<h2 style="text-align: right"><?= $property->priceFormatted; ?></h2>
			</div>
		</div>
	</div>
	</div>

	<div class="row">

		<div class="col-xs-4 hidden-xs">
			<div class="row">
							<div class="col-xs-12">
		<div class="well" style="margin-top: 20px; padding:0; padding-right:5px; background: #000">


				<div id='gallery'>
					<div class='content'>
						<? foreach($property->photos as $k => $image) : ?>
							<div class="col-xs-6 col-xs-6">
								<a href="#" data-target="#carousel-example-generic" data-slide-to="<?= $k ?>" class="thumbnail text-center" data-position="<?= $k ?>" style="background: #2C3539; border-color: #000"><img alt="" src="{{ $property->singlePhoto($image->file, 'thumbs') }}" style="min-height: 70px;"/></a>
							</div>
  						<? endforeach; ?>
          </div>
          </div>
          </div>
        </div>


		</div>
		</div>

		<div class="col-sm-8 col-xs-12">
		<div class="row">
			<br />

			<div class="col-xs-12">



				<? if(count($property->photos) > 0) : ?>

				<div id="carousel-example-generic" class="carousel slide" data-ride="carousel">
      <div class="carousel-inner" role="listbox">
		  <? foreach($property->photos as $i => $image) : ?>
        <div class="item <?= ($i===0)?'active':'' ?>">
          <a href="{{ $property->singlePhoto($image->file, 'full') }}" rel="slideshow" class="slideshow"><img src="{{ $property->singlePhoto($image->file, 'slideshow')  }}" /></a>
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

	  			<? else : ?>
	  			<div class="text-center">
	  				<img class="text-center" src="{{  $property->singlePhoto('no-image', 'full') }}" style=" width: 100%;" /><br />
	  			</div>
	  			<? endif; ?>

			</div>

		</div>
		</div>

		</div>

				<div class="row">
				<div class="col-sm-8">

		<div class="row">
			<br />

			<div class="col-sm-12">
			<div class="wells">

				<div class="row">
					<div class="col-xs-12">
					<h4><?= __('Description') ?></h4>
					@if($property_info->description != "")
						{!! nl2br($property_info->description) !!}
					@else
						<?= __("We haven't received a description for this property") ?>
					@endif
					@if($property->reference)
					<br /><br />
					<span><?= __('Ref code') ?> : </span><?= $property->reference ?>
					@endif
					</div>
				</div>

				<br />
				<h4><?= __('Features') ?></h4>

				<div class="row features">
					<ul>
					<? for($i = 0; $i < 9; $i ++) : ?>
					@if(isset($property_info->features[$i]) && $property_info->features[$i]!= "" )
						<li class="col-xs-4"><?= $property_info->features[$i] ?></li>
					@endif
					<? endfor; ?>
					</ul>

				</div>
				<br />
				<br />
				<br />


			</div>
			</div>
		</div>

		<div class="row">
			<div class="col-xs-12 property-pane">

					<ul class="nav nav-tabs" id="myTab">
						<li class="active"><a data-toggle="tab" href="#map-large"><?= __('Map') ?></a></li>
						<li class=""><a data-toggle="tab" href="#additional-information"><?= __('Additional information') ?></a></li>
					</ul>

					<div class="tab-content listing-wrapper" id="myTabContent">
						<div id="map-large" class="tab-pane fade in active">
							<br />
							<div id="map-canvas" style=" height: 350px; width: 100%; display: block; background: #000"></div>

							<script>
							function initialize() {
								var myLatlng = new google.maps.LatLng(parseFloat(<?= $property->lat ?>), parseFloat(<?= $property->lng ?>));
								var mapOptions = {
									zoom: 18,
									center: myLatlng
								};

								var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
								var marker = new google.maps.Marker({
									position: myLatlng,
									map: map,
									title: '<?= $property->title ?>'
								});
							}
							window.onload = initialize;
							</script>
						</div>
						<div id="additional-information" class="tab-pane fade">
							<br />
							<table class="table table-striped">
								<tbody>
								  <tr>
								    <td width="50%"><?= __('Property type') ?></td>
								    <td><?= __(@$property->property_type->name) ?></td>
								  </tr>
								  <tr>
								    <td><?= __('Condition of property') ?></td>
								    <td><?= __('condition.'.$property->property_condition) ?></td>
								  </tr>
								  <tr>
								    <td><?= __('Property size') ?></td>
								    <td><?= $property->property_size ?> <?= __('m&#178;') ?></td>
								  </tr>
								  <tr>
								    <td><?= __('Bedrooms') ?></td>
								    <td><?= $property->num_bedrooms ?> <?= __('bedrooms') ?></td>
								  </tr>
								  <tr>
								    <td><?= __('Bathrooms') ?></td>
								    <td><?= $property->num_bathrooms ?> <?= __('bathrooms') ?></td>
								  </tr>
								  <tr>
								    <td><?= __('Floors') ?></td>
								    <td><?= $property->num_floors ?> <?= __('floors') ?></td>
								  </tr>
								  <tr>
								    <td><?= __('Receptions') ?></td>
								    <td><?= $property->num_receptions ?> <?= __('receptions') ?></td>
								  </tr>
								  <tr>
								    <td><?= __('Garden') ?></td>
								    <td><?= ($property->has_garden)?__('Yes'):__('No') ?></td>
								  </tr>
								  <tr>
								    <td><?= __('Parking') ?></td>
								    <td><?= ($property->has_parking)?__('Yes'):__('No') ?></td>
								  </tr>
								  <tr>
								    <td><?= __('Investment property') ?></td>
								    <td><?= ($property->is_investment_property)?__('Yes'):__('No') ?></td>
								  </tr>
								</tbody>
							</table>
						</div>
					</div>

				</div>
			</div>

			<br />


	</div>

	<div class="col-sm-4" id="sidebar_container">
					<div class="row">
			<div class="col-xs-12 col-sm-11 col-sm-offset-1">
		<div class="row" id="sidebar">
			<div class="col-xs-12">


		<br />
		<div id="contact_agent">
			<div class="panel panel-default">
  <div class="panel-body">

			<? if(false && $agent->agent_type == 'professional') : ?>
			<a href="#"><img alt="" src="{{ $agent->avatar() }}" /></a>
			<p><strong><?= $agent->company_name ?></strong></p>
			<p><br /><?= $agent->address ?>
			<small><br /><?= __('Phone number') ?> : <?= $agent->phone_number ?>
			<br /><?= __('Website') ?> : <a href="<?= $agent->website ?>" target="_blank"><?= $agent->website ?></a></small></p>
			<br />
			<? endif; ?>
			<div style="display: none" id="property_email">
				<div class="alert alert-info">
				  <?= __('Thanks for contacting us. We\'ll get back to you shortly.') ?>
				</div>
				<h4><?=__('What happens next?') ?></h4>
				<p style="text-align: left"><?= __('1 - <b>We send your email to</b>') ?> <?= ($agent->company_name)?$agent->company_name:$agent->name ?><br />
				<?=__('2 - <b>They will be in contact</b> with you as soon as possible.') ?><br /></p>
			</div>
			<?php echo Form::open(array('url' =>  URL::to('property/email'), 'class'=>'form hidden-print form ajax', 'id' => 'contact-agent-form')); ?>
				<h4 class="text-center"><?= __('Contact this owner') ?></h4><br />
				<fieldset>
					<div class="form-group">
						<label><?= __('Full name') ?></label>
						<?= Form::text('full_name', Input::old('full_name'), array('class' => 'form-control', 'id' => 'full_name', 'placeholder' => __("Enter your full name") )); ?>
					</div>

					<div class="form-group">
						<label><?= __('Your phone') ?></label>
						<?= Form::text('phone_number', Input::old('phone_number'), array('class' => 'form-control', 'id' => 'phone_number', 'placeholder' => __("Enter your phone number") )); ?>
					</div>

					<div class="form-group">
						<label><?= __('Your email') ?></label>
						<?= Form::email('your_email', Input::old('your_email'), array('class' => 'form-control', 'id' => 'your_email', 'required' => 'required', 'placeholder' => __("Enter your email") )); ?>
					</div>

					<div class="form-group">
						<label><?= __('Your message') ?></label>
						<?= Form::textarea('message', (Input::old('message'))?Input::old('message'):__('I would like more details about this property, please let me know when we can talk...'), array('class' => 'form-control col-xs-8', 'rows' => 3)); ?><br /><br />
					</div>
<br /><br />
					<div class="form-group text-center">
						<?= Form::hidden('property_id', $property->id); ?><br /><br />
						<button id="contact-agent" data-loading-text="<?= __('Please wait...') ?>" class="btn btn-primary center" type="submit"><i class="icon-mail-forward"></i>  <?= __('Contact agent') ?></button>
					</div>
				</fieldset>
			<?php echo Form::close(); ?>

			<div class="col-xs-12 or_call text-center">
				<span><small><?= __('or call') ?></small> <strong><?= $property->agent->phone ?></strong></span>

			</div>
			</div>
			</div>
			</div>
			</div>

			<div class="col-xs-12 hidden-print">
				<a data-confirm-title="<?= __("Please login") ?>" data-confirm-text="<?= __("You need to login to be able to save a property.<br /><br />If you don't have an account please register, it only takes a minute.") ?>" data-confirm-yes="<?= __('Login/Register') ?>" data-confirm-no="<?= __('Cancel') ?>" data-confirm-href="{{{ route_lang('auth/login') }}}" href="<?= route_lang('favourite', array($property->id)) ?>" id="save_property" class="btn btn-default btn-block <?= (Auth::guest())?'not_logged_in':'ajax' ?>" data-replace="#save_property span" data-processing="<?= __('Saving...') ?>"><i class="fa fa-save fa-fw pull-left"></i> <span><?= (!$favourite)?__('Save property'):__('Remove saved property') ?></span> </a>
				<a class="btn btn-default btn-block print-page" href="#"><i class="fa fa-print fa-fw pull-left"></i> Print </a>
				<a class="btn btn-default btn-block" href="<?= route_page('tell-friend', array($property->id)) ?>"><i class="fa fa-envelope fa-fw pull-left"></i> <?= __('Send to friend') ?> </a>
			</div>
				</div>

				<div class="row">
				<div class="col-xs-12 hidden-print">
					<hr class="dull"/>
					<h4><?= __('Want a free valuation?') ?></h4>
					<p><?= sprintf(__('Looking to sell your property? %s for a free valuation.'), "<a href=\"".route_lang('contact')."?property_id=".$property->id."&type=report\" class=\"main-link\">" . __('Contact us today') . "</a>"); ?></p>
				</div>

				<div class="col-xs-12 hidden-print">
					<hr class="dull"/>
					<h4><?= __("Can't find the  ideal property") ?></h4>
					<p><?= sprintf(__("If you can't find a property that fits your needs, %s and we'll alert you when a new property that matches your taste comes up us"), "<a href=\"".route_lang('contact')."?property_id=".$property->id."&type=feedback\" class=\"main-link\">" . __('send us a message') . "</a>"); ?></p>
				</div>

			</div>

		</div>
		</div>
		</div>
	</div>


<script>
var main_lat = parseFloat(<?= $property->lat ?>);
var main_lng = parseFloat(<?= $property->lng ?>);
</script>
@stop
