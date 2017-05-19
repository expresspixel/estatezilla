<div class="well">
		
		<form class="form-vertical" action="<?= route_page('listings') ?>">
			<fieldset>
				<div class="row">
					<div class="col-sm-12">
						
						
						
						<div class="row">
							
							<div class="col-sm-12">
								
								<div class="form-group">
							    	<label><?= __('Buy/Rent') ?></label>
									<?= Form::select('listing_type', ['sale' => 'Sale', 'rent' => 'Rent', '' => 'All'], Input::get('listing_type'),array('class' => 'form-control')); ?>

								</div>
							</div>
							
						</div>	
						<div class="row">
							<div class="col-sm-12">	
								
								<div class="form-group">
							    	<label><?= __('Property types') ?></label>
									<?= Form::select('criteria_main', $criteria_main, Input::get('criteria_main'),array('class' => 'form-control')); ?>

								</div>
								
							</div>
						</div>							
						<div class="row hidden-sm">						  
							<div class="col-sm-6">	
								
								<div class="form-group">
							    	<label><?= __('Minimum Price') ?></label>
									<?= Form::select('min_price', $min_price_list, Input::get('min_price'),array('class' => 'form-control')); ?>
								</div>
								
							</div>
							<div class="col-sm-6">	
								
								<div class="form-group">
							    	<label><?= __('Maximum Price') ?></label>
									<?= Form::select('max_price', $max_price_list, Input::get('max_price', 0),array('class' => 'form-control')); ?>
								</div>
								
							</div>		
							
						</div>	
						
					</div>
				</div>
				<div class="row">	
					
					<div class="col-sm-6 col-sm-offset-6" >
						<button class="btn btn-primary btn-block" type="submit"><?= __('Search') ?> <i class="fa fa-chevron-right"></i></button>
						
					</div>
				</div>						
				
			</fieldset>
		</form>

    
</div>

