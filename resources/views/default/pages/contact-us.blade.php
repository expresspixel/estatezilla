@extends('layouts.default')

{{-- Content --}}
@section('content')

<div class="row">

	<div class="col-sm-7">

		<!-- Headings &amp; Paragraph Copy -->
		<div class="row">

			<div class="col-sm-12">


				<div class="page-header">
					<h1><?= __('Contact us') ?></h1>
				</div><br />
				<!-- Notifications -->
				@include('notifications')
				<!-- ./ notifications -->
				@if($errors->has())
				<?= __('We encountered the following errors:') ?>
				<ul>
					@foreach($errors->all() as $message)
					<li>{{ $message }}</li>
					@endforeach
				</ul>
				@endif

				<?php echo Form::open(array('url' =>  route('contact'), 'class' => 'form')); ?>

				<fieldset>
					<div class="form-group">

						<div class="row">
							<div class="col-sm-12">
								<div class="row">
									<div class="col-sm-6">
										<div class="form-group">
											<label for="exampleInputEmail1"><?= __('First name') ?></label>
											<?= Form::text('first_name', Input::old('first_name') ? Input::old('first_name') : $first_name, array('class' => 'form-control')); ?>
										</div>
									</div>

									<div class="col-sm-6">
										<div class="form-group">
											<label for="exampleInputEmail1"><?= __('Last name') ?></label>
											<?= Form::text('last_name', Input::old('last_name') ? Input::old('last_name') : $last_name, array('class' => 'form-control')); ?>
										</div>
									</div>
								</div>

								<div class="row">
									<div class="col-sm-6">
										<div class="form-group">
											<label for="exampleInputEmail1"><?= __('Email') ?></label>
											<?= Form::text('email_address', Input::old('email') ? Input::old('email') : $email, array('class' => 'form-control')); ?>
										</div>
									</div>

									<div class="col-sm-6">
										<div class="form-group">
											<label for="exampleInputEmail1"><?= __('Phone number') ?></label>
											<?= Form::text('phone_number', Input::old('phone_number') ? Input::old('phone_number') : $phone_number, array('class' => 'form-control')); ?>
										</div>
									</div>
								</div>

								<div class="row">
									<div class="col-sm-12">
										<div class="form-group">
											<label for="exampleInputEmail1"><?= __('Your comments') ?></label>
											<?= Form::textarea('comment', $default_message, array('class' => 'form-control')); ?>
										</div>
									</div>
								</div>

							</div>
						</div>
					</div>

					<div class="row">
						<div class="col-sm-12">
							<?= Form::hidden('url', $url); ?>
							<?= Form::hidden('report_type', $report_type); ?>
							<? if(isset($property)) : ?>
							<?= Form::hidden('owner_id', $property->user_id); ?>
							<? endif; ?>
							<?= Form::submit(__('Send'), array('class' => 'btn btn-primary pull-right')); ?>
						</div>
					</div>

				</div>

			</div>
		</div>




		<div class="col-sm-4 pull-right">
			<br />
			<br />
            {!! $page->content !!}
		</div>

	</div>



	@stop
