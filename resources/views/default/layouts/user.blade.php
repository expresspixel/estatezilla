@extends('layouts.default')

{{-- Web site Title --}}
@section('title')
@parent
@stop

{{-- Content --}}
@section('content')
<ol class="breadcrumb">
  <li><a href="#"><?= __('My account') ?></a></li>
  <li class="active"><?= __('Saved properties') ?></li>
</ol>

		<div class="row">

			<div class="col-sm-3 hiden-xs">
				@include('user.menu')
			</div>

			<div class="col-sm-9">
				@yield('user_area')
			</div>

        </div>

@stop
