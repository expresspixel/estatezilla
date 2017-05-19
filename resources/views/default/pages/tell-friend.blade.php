@extends('layouts.default')

{{-- Content --}}
@section('content')

<hr class="top-line" />

<div class="container narrow">




<div class="row">
	
	<div class="col-lg-7">
		
		<!-- Headings &amp; Paragraph Copy -->
		<div class="row">
			
			<div class="col-lg-12">
			<div class="col-lg-12">


			<div class="page-header">
				<h1><?= __('Tell a friend about this property') ?></h1>
			</div><br />
					<!-- Notifications -->
        @include('notifications')
        <!-- ./ notifications -->
        @if($errors->has())
        {{ ('We encountered the following errors:') }}
        <ul>
            @foreach($errors->all() as $message)
            <li>{{ $message }}</li>
            @endforeach
        </ul>
        @endif

			<?php echo Form::open(array('url' =>  Request::URL(), 'class' => 'form')); ?>

			<fieldset>
			<div class="form-group">

<div class="row">
				<div class="col-lg-12">
					<div class="row">
						<div class="col-lg-6">
							<div class="form-group">
								<label for="exampleInputEmail1"><?= __('Your name') ?></label>
								<?= Form::text('your_name', Input::old('your_name') ? Input::old('your_name') : $your_name, array('class' => 'form-control')); ?>
							</div>
						</div>
						
						<div class="col-lg-6">
							<div class="form-group">
								<label for="exampleInputEmail1"><?= __('Your friend\'s name') ?></label>
								<?= Form::text('friend_name', Input::old('friend_name') ? Input::old('friend_name') : '', array('class' => 'form-control')); ?>
							</div>
						</div>
					</div>					

					<div class="row">
						<div class="col-lg-6">
							<div class="form-group">
								<label for="exampleInputEmail1"><?= __('Your email') ?></label>
								<?= Form::text('your_email', Input::old('your_email') ? Input::old('your_email') : $your_email, array('class' => 'form-control')); ?>
							</div>
						</div>

						<div class="col-lg-6">
							<div class="form-group">
								<label for="exampleInputEmail1"><?= __('Your friend\'s email') ?></label>
								<?= Form::text('friend_email', Input::old('friend_email') ? Input::old('friend_email') : '', array('class' => 'form-control')); ?>
							</div>
						</div>
					</div>			

					<div class="row">
						<div class="col-lg-12">
							<div class="form-group">
								<label for="exampleInputEmail1"><?= __('Comments') ?></label>
								<?= Form::textarea('comment', $default_message, array('class' => 'form-control')); ?>
							</div>
						</div>
					</div>

				</div>
				</div>
			</div>

			<div class="row">
				<div class="col-lg-12">
					<?= Form::submit(__('Send'), array('class' => 'btn btn-primary pull-right')); ?>
				</div>
			</div>
				
			</div>

			</div>




			
			<!-- Misc Elements -->
			
		</div><!-- /row -->
		
	</div>

		<div class="col-lg-4 pull-right">
<br />
<br />
<br />
			<h3>{{ ('Property you are sending') }}</h3>

			<div class="row">
				<div class="col-lg-12">
					<a href="<?= route_lang('property', array($property->id)) ?>" class="thumbnail">
						<img alt="" src="{{$property->thumbnail('listings')}}">
					</a><br />
					<br />
					<p style="margin-top: 0; margin-bottom: 10px;"><a href="<?= route_lang('property', array($property->id)) ?>"><strong><?= $property->title ?></strong></a> (<a href="<?= route_lang('property', array($property->id)) ?>"><?= $property->priceFormatted(); ?></a>)<br />
						<?= $property->displayable_address ?><br /><?= __('Bedrooms') ?>: <?= $property->num_bedrooms; ?></p>
				</div>	 

			</div>
			
			<h4><?= __('Note') ?></h4>
			<p><?= sprintf(__('%s will not send any promotional email to you or your friend by using this page.'), $website_name) ?></p>


		</div>
	
</div>
<br />
<br />
<br />
<br />
<br />
<br />



</div>
@stop
