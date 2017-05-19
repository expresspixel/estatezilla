@extends('layouts.default')

{{-- Web site Title --}}
@section('title')
{{{ String::title($page->title) }}} ::
@parent
@stop

{{-- Update the Meta Title --}}
@section('meta_title')
@parent

@stop

{{-- Update the Meta Description --}}
@section('meta_description')
@parent

@stop

{{-- Update the Meta Keywords --}}
@section('meta_keywords')
@parent

@stop

{{-- Content --}}
@section('content')

<hr class="top-line" />

<div class="container">
	<div class="row">
		<div class="col-lg-12">
			<h1>{{ $page->title }}</h1><br /><br />
			
			<div class="row">
				<div class="col-lg-12">
					{{ $page->content_str() }}
				</div>
			</div>
			<br /><br />
			
		</div>
		<br />
	</div>
</div>


@stop