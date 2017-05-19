<div class="sidebar-account">		
	<div class="row ">
		<div class="col-lg-12">
			<div class="panel panel-default">
				<div class="panel-heading"><?= __('My account') ?></div>
				<div class="panel-body">
					<ul class="nav">
					  <li><a href="{{{ route_lang('user/favourites') }}}"><?= __('Saved properties') ?></a></li>
					  <?/*<li><a href="{{{ route_lang('user/add_credits') }}}"><?= __('Saved searches') ?></a></li>*/?>
					  <li><a class="post-btn" href="{{{ route_lang('user/profile') }}}"><?= __('Account details') ?></a></li>
					  <li><a class="post-btn" href="{{{ route_lang('user/change-password') }}}"><?= __('Change password') ?></a></li>
					  <li class="divider"></li>
					  <li><a href="{{{ URL::to('auth/logout') }}}"><?= __('Log out') ?></a></li>
					</ul>

				</div>
			</div>
		</div>
	</div>


</div>