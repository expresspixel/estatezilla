<?php echo Form::open(array('url' =>  Request::url(), 'method' => 'get', 'id'=>'form_listings', 'class' => 'form-vertical form-listings ajax location-form', 'data-replace-inner' => ".listings_view_content")); ?>
@include('listings.sidebar')
<?php echo Form::close(); ?>