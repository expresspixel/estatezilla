<?php echo Form::open(array('url' => url('map/search'), 'method' => 'get', 'id'=>'map_listings', 'class' => 'form-vertical form-listings')); ?>
@include('listings.sidebar')
<?php echo Form::close(); ?>