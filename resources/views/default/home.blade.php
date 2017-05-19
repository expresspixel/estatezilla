@extends('layouts.default')

{{-- Content --}}

@section('content')

<div class="row">
	<div class="col-sm-4 hidden-xs">
		@include('partials.home_form')
	</div>

	<div class="col-sm-8">
		@include('partials.home_carousel')
	</div>
</div>
<br />
<div class="row">
	<div class="col-sm-12">
		<div class="row">
			<div class="col-xs-12">
				<h3 class="text-left">{{$regions['home_data']->heading1}}</h3>
				<p class="text-left">{{$regions['home_data']->slogan1}}</p>
			</div>
		</div>

		<div class="row">
			@widget('listings', ['count' => 6, 'sort_field' => 'published_at', 'sort_direction' => 'DESC'])
		</div>
	</div>

</div>
	<br />

<div class="row">

	<div class="col-sm-8 col-sm-offset-2">
<hr />
</div>
</div>


<br />
<div class="row">
	<div class="col-sm-12 text-center">
	<div class="well">
		<blockquote style="border-left: none;">
  <p>{{$regions['home_data']->quote_text}}</p>
  <footer>{!!$regions['home_data']->quote_author!!}</footer>
</blockquote>
</div>
</div>
</div>

	<div class="row">

	<div class="col-sm-8 col-sm-offset-2">
<hr />
</div>
</div>
	<br />
	<div class="row">

		<div class="col-sm-6">
<div class="list-group">
	<? if(isset($regions['home_data']->links)) : ?>
	<? foreach($regions['home_data']->links as $link): ?>
      <a href="{{$link->url}}" class="list-group-item">
        <h4 class="list-group-item-heading">{{$link->title}}</h4>
        <p class="list-group-item-text">{{$link->caption}}</p>
      </a>
	  <? endforeach; ?>
	<? endif; ?>
	  </div>
		</div>
		<div class="col-sm-6">
<div class="panel panel-default">
  <div class="panel-body" style="height: 194px;">
	  <br />
	  <blockquote>

  <p style="font-size: 15px">{{$regions['home_data']->testimonial_text}}<br /><br /></p>
  <footer>{!!$regions['home_data']->testimonial_author!!}</footer>
</blockquote>


  </div>
</div>

		</div>

	</div>


@stop
