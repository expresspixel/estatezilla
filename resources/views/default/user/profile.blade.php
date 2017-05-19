@extends('layouts.user')

@section('title')
<?= __('Edit your profile') ?> ::
@parent
@stop

{{-- Content --}}
@section('user_area')

<?php echo Form::open(array('url' =>  route_lang('user/profile'), 'files'=> true, 'id'=>'edit_profile', 'class' => 'form-vertical')); ?>
<!-- Notifications -->
@include('notifications')
<!-- ./ notifications -->

<div class="panel panel-default form-horizontal">
	<div class="panel-heading"><?= __('Your profile') ?></div>
	<div class="panel-body">
		
		<fieldset>
			
			<div class="form-group">
				<label class="col-sm-3 control-label"><?= __('Title') ?></label>
				<div class="col-lg-8">
					<?= Form::text('title', Input::old('title') ? Input::old('title') : $user->display_name, array('class' => 'form-control')); ?>
				</div>
			</div>
			<div class="form-group">
				<label class="col-sm-3 control-label"><?= __('First name') ?></label>
				<div class="col-lg-8">
					<?= Form::text('display_name', Input::old('display_name') ? Input::old('display_name') : $user->display_name, array('class' => 'form-control')); ?>
				</div>
			</div>
			
			<div class="form-group">
				<label class="col-sm-3 control-label"><?= __('Last name') ?></label>
				<div class="col-lg-8">
					<?= Form::text('company_name', Input::old('company_name') ? Input::old('company_name') : $user->company_name, array('class' => 'form-control')); ?>
				</div>
			</div>
			
			
			<div class="form-group">
				<label class="col-sm-3 control-label"><?= __('Email') ?></label>
				<div class="col-lg-8">
					<?= Form::text('email', Input::old('email') ? Input::old('email') : $user->email, array('class' => 'form-control')); ?>
				</div>
			</div>
			
			
			<div class="form-group">
				<label class="col-sm-3 control-label"><?= __('Mobile number') ?></label>
				<div class="col-sm-9">
					<?= Form::text('mobile', Input::old('mobile') ? Input::old('mobile') : $user->mobile, array('class' => 'form-control')); ?>
				</div>
			</div>
			
			<div class="form-group">
				<label class="col-sm-3 control-label"><?= __('Phone number') ?></label>
				<div class="col-sm-9">
					<?= Form::text('phone', Input::old('phone') ? Input::old('phone') : $user->phone, array('class' => 'form-control')); ?>
				</div>
			</div>	
			
			<div class="form-group">
				<label class="col-sm-3 control-label"><?= __('Fax') ?></label>
				<div class="col-sm-9">
					<?= Form::text('fax', Input::old('fax') ? Input::old('fax') : $user->fax, array('class' => 'form-control')); ?>
				</div>
			</div>
			
		</div>
		
		
	</div>
	
	
	<div class="panel panel-default form-horizontal">
		<div class="panel-heading"><?= __('Your address') ?></div>
		<div class="panel-body">
			
			
			<div class="form-group">
				<label class="col-sm-3 control-label"><?= __('Address') ?></label>
				<div class="col-lg-8">
					<?= Form::textarea('address', Input::old('address') ? Input::old('address') : $user->address, array('class' => 'form-control', 'rows' => 3)); ?>
				</div>
			</div>
			
			<div class="form-group">
				<label class="col-sm-3 control-label"><?= __('Town') ?></label>
				<div class="col-lg-8">
					<?= Form::text('address', Input::old('address') ? Input::old('address') : $user->address, array('class' => 'form-control')); ?>
				</div>
			</div>
			
			<div class="form-group">
				<label class="col-sm-3 control-label"><?= __('County') ?></label>
				<div class="col-lg-8">
					<?= Form::text('address', Input::old('address') ? Input::old('address') : $user->address, array('class' => 'form-control')); ?>
				</div>
			</div>
			
			<div class="form-group">
				<label class="col-sm-3 control-label"><?= __('Postcode') ?></label>
				<div class="col-lg-8">
					<?= Form::text('address', Input::old('address') ? Input::old('address') : $user->address, array('class' => 'form-control')); ?>
				</div>
			</div>
			
			
			
		</div>
		
	</fieldset>
	
	
	
</div>

<div class="panel panel-default form-horizontal">
	<div class="panel-body">
		<?= Form::submit(__('Save profile'), array('class' => 'btn btn-primary pull-right')); ?>
	</div>
</div>


<?php echo Form::close(); ?>

<script>
	var disabled_profile_fields = <?= json_encode($disabled_fields) ?>
</script>
@stop
