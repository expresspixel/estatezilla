<div class="sidebar">		
	<div class="row ">
		
		
		<div class="col-xs-12">
			
			<div class="panel panel-default">
				<div class="panel-heading"><?= __('Change location and criteria') ?></div>
				<div class="panel-body">
					
					<div class="form-group">
						<div class="form-group">
							<label><?= __('Location') ?></label>
							<?= Form::text('location', urldecode(Input::get('location')), array('class' => 'form-control location-input', 'id' => 'listings-sidebar-input', 'placeholder' => __('Start typing...'))); ?>
						</div>
						<div class="location_details" style="display: none">
							<input value="<?= Input::get('lat') ?>" class="geo-lat" name="lat" data-geo="lat" />
  							<input value="<?= Input::get('lng') ?>" class="geo-lng" name="lng" data-geo="lng" />
  							<input value="<?= Input::get('bounds') ?>" class="geo-viewport" name="bounds" data-geo="viewport" />
						</div>
					</div>
					
					<? if(!isset($vars['listing_type']) || empty($vars['listing_type'])) : ?>
					<div class="form-group">
						<div class="form-group">
							<label><?= __('Buy/Rent') ?></label>
							<?= Form::select('listing_type', ['sale' => __('Sale'), 'rent' => __('Rent'), '' => __('All')], Input::get('listing_type'),array('class' => 'form-control')); ?>
						</div>
					</div>
					<? endif; ?>
					
					<div class="form-group">
						<label><?= __('Within') ?></label>
						<?= Form::select('radius',$radius_list,Input::get('radius_list'),array('class' => 'form-control')); ?>
						
					</div>
					<div class="form-group">
						<label><?= __('Beds') ?></label>
						
						<div class="row">
							<div class="col-xs-6" style="padding-right: 3px; padding-left: 15px;">
								<?= Form::select('min_beds', $bed_from, Input::get('min_beds'),array('class' => 'form-control col-xs-10')); ?>
							</div>						
							<div class="col-xs-6" style="padding-right: 15px; padding-left: 3px;">
								<?= Form::select('max_beds', $bed_to,Input::get('max_beds'),array('class' => 'form-control col-xs-10')); ?>
							</div>
						</div>
					</div>
					
					<div class="form-group">
						<label><?= __('Added') ?></label>
						<?= Form::select('days_search', $days_search,Input::get('days_search'),array('class' => 'form-control col-xs-10')); ?>
					</div>
					
					<br />
					<br />
					<div class="row">
						<div class="col-xs-12">
							<button class="btn btn-primary btn-block" style="margin: 0 auto;" type="submit"><i class="icon-refresh"></i> <?= __('Update') ?></button>
						</div>
					</div>
					
					
				</div>
			</div>
			
			
		</div>
	</div>	
	
	
	<div class="row hidden-xs">
		
		
		<div class="col-xs-12">
			
			<div class="panel panel-default">
				<div class="panel-heading">
					<a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#collapsePrice">
          				<?= __('Price range') ?>
					</a>
				</div>
				
				<div id="collapsePrice" class="panel-collapse collapse in">
					
					<div class="panel-body">
						
						
						<div class="row filter-row">
							<div class="col-xs-12">
								<div class="input-group">
									<span class="input-group-addon">{{$currency}}</span>
									<?= Form::text('min_price', Input::get('min_price'), array('class' => 'form-control price-input', 'placeholder' => "min")); ?>
								</div>
							</div>
							<div class="col-xs-1" style="width: 18px; height: 25px; line-height: 25px;margin-right: 5px;">
								<?= __('to') ?>
							</div>
							<div class="col-xs-12">
								<div class="input-group">
									<span class="input-group-addon">{{$currency}}</span>
									<?= Form::text('max_price', Input::get('max_price'), array('class' => 'form-control price-input', 'placeholder' => "max")); ?>
								</div>
							</div>
							
						</div>
						
						
					</div>
				</div>
			</div>
			
			
		</div>
	</div>			
	
	<div class="row hidden-xs">
		<div class="col-xs-12">
			<div class="panel panel-default">
				<div class="panel-heading">
					<a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#collapsePropertyTypes">
          				<?= __('Property types') ?>
					</a>
				</div>
				<div id="collapsePropertyTypes" class="panel-collapse collapse">
					<div class="panel-body">
						
						<div id="">
							<div>
								<ul class="property-types-tree">
									<? foreach($criteria_list as $criteria) : ?>
									<li class="collapsed <?= (count($criteria->property_types) == 0)?'hide-expander':'' ?>"><?= Form::checkbox('criteria['.$criteria->id.']', $criteria->id, (Input::get("criteria[$criteria->id]"))?Input::get("criteria[$criteria->id]"):1); ?><span><?= __($criteria['name']) ?></span>
										<? if(count($criteria->property_types)) : ?>
										<ul>
											<? foreach($criteria->property_types as $property_type_key => $property_type) : ?>
											<li><?= Form::checkbox("property_types[$property_type->id]", 1, (Input::get("property_types[$property_type->id]"))?Input::get("property_types[$property_type->id]"):1, array('class' => '')); ?><span><?= $property_type->name ?></span></li>
											<? endforeach; ?>
										</ul>
										<? endif; ?>
										<? endforeach; ?>
									</ul>
									
								</div>
							</div>
						</div>
					</div>
				</div>
				
				
			</div>
		</div>
		
		
		
		<div class="row hidden-xs">
			<div class="col-xs-12">
				<div class="panel panel-default">
					
					<div class="panel-heading">
						<a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#collapseConditions">
							<?= __('Condition of property') ?>
						</a>
					</div>
					
					<div id="collapseConditions" class="panel-collapse collapse">
						
						<div class="panel-body">
							
							<? foreach($conditions as $condition_id => $condition) : ?>
							<div class="checkbox">
								<label>
									<?= Form::checkbox('property_conditions[]', $condition_id, @in_array($condition_id, $vars['property_conditions'])); ?>
									{{ $condition }}
								</label>
							</div>
							<? endforeach; ?>
							
							
						</div>
					</div>
					
				</div>
			</div>
		</div>
		
		<div class="row hidden-xs">
			<div class="col-xs-12">
				<div class="panel panel-default">
					
					<div class="panel-heading">
						<a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#collapseFeatures">
							<?= __('Features and characteristics') ?>
						</a>
					</div>
					
					<div id="collapseFeatures" class="panel-collapse collapse">
						
						<div class="panel-body">
							
							<? foreach($features as $feature_id => $feature) : ?>
							
							<div class="checkbox">
								<label>
									<?= Form::checkbox("features[$feature_id]", $feature_id, (Input::get('features['.$feature_id.']'))?Input::get('features['.$feature_id.']'):0); ?>
									{{ $feature }}
								</label>
							</div>
							
							<? endforeach; ?>
							
						</div>
					</div>
				</div>
			</div>
		</div>
		
		
		
		<div class="row hidden-xs">
			<div class="col-xs-12">
				<div class="panel panel-default">
					<div class="panel-heading"><?= __('Filter listings') ?></div>
					<div class="panel-body">
						
						
						<div class="row filter-row">
							
							<div class="col-xs-12" style="text-align: center;">
								<?= Form::hidden('view_type', $view_type); ?>
								<?= Form::hidden('sort_type', $sort_type); ?>
								<button class="btn btn-primary" style="margin: 0 auto;" type="submit"><i class="icon-refresh"></i> <?= __('Update') ?></button>
								
							</div>
						</div>			
						
						
					</div>
				</div>
				
				
			</div>
		</div>
		
</div>