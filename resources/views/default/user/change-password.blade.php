@extends('layouts.user')

{{-- Web site Title --}}
@section('title')
<?= __('Change password') ?> ::
@parent
@stop

{{-- Content --}}
@section('user_area')
				<!-- Notifications -->
        @include('notifications')
        <!-- ./ notifications -->
<div class="panel panel-default">
	<div class="panel-heading"><?= __('Change password') ?></div>
	<div class="panel-body">



		<?php echo Form::open(array('url' =>  route_lang('user/change-password'), 'class' => 'form-vertical')); ?>

			<fieldset>


				<div class="form-group">
					<label class="col-lg-4 control-label"><?= __('Password') ?></label>
					<div class="col-lg-9">
						<?= Form::password('password', array('class' => 'form-control')); ?>
					</div>
				</div>

				<div class="form-group">
					<br />
					<br />
					<br />
					<br />
					<label class="col-lg-4 control-label"><?= __('Confirm password') ?></label>
					<div class="col-lg-9">
						<?= Form::password('password_confirmation', array('class' => 'form-control')); ?>
					</div>
				</div>						
				<br />

				<div class="form-group">
					<div class="col-lg-9">
						<br />
						<?= Form::submit( __('Save password') , array('class' => 'btn btn-primary')); ?>
					</div>
				</div>
				<br />

			</div>

		</fieldset>
	<?php echo Form::close(); ?>


</div>


@stop
