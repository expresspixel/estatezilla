<!DOCTYPE html>
<html lang="en" ng-app="myApp">
	<head>
		<!-- Basic Page Needs
		================================================== -->
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>@yield('title', $page_title ." :: " . $settings['website_name'])</title>
		<meta name="description" content="@yield('meta_description', $meta_description)" />
		<meta name="keywords" content="@yield('meta_keywords', $meta_keywords)" />

		<!-- Mobile Specific Metas
			================================================== -->
		<meta name="viewport" content="width=device-width, initial-scale=1.0">

		<!-- Latest compiled and minified CSS -->
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">

		<!-- Optional theme -->
		<?/*<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap-theme.min.css">*/?>
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootswatch/3.3.5/cosmo/bootstrap.min.css">
		<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jquery.perfect-scrollbar/0.6.3/css/perfect-scrollbar.min.css">
		<style>
			.container {
				max-width: 970px;
			}
			.scrollFix {
				line-height: 1.35;
				overflow: hidden;
			}
			h4, h5, h6 {
			font-weight: bold;
			}
			.accordion-toggle {
				color: #000;
			}
			.carousel-caption{
				background: rgba(0,0,0,0.8);
			}
			#gallery { position:relative; margin:20px auto; padding:0px; height: 307px; overflow: hidden; }
			#gallery .content { height: 307px; }
			.ps-container > .ps-scrollbar-x-rail, .ps-container > .ps-scrollbar-y-rail {
			  opacity: 0.6;
			}

			.property-types-tree {
				padding: 0;
				list-style-type: none;
			}
			.property-types-tree ul {
				margin-left: -20px;
				list-style-type: none;
			}
			.property-types-tree li {
				list-style-type: none;
			}
			.property-types-tree li > span {
				padding-left: 5px;
			}
			.property-features {
				padding: 0;
			}
			.property-features li {
				padding: 10px;
				border-right: 1px solid rgb(221,221,221);
			}
			.property-features li:last-child {
				border:0;
			}

			.panel-heading .accordion-toggle:after {
				/* symbol for "opening" panels */
				font-family: 'Glyphicons Halflings';  /* essential for enabling glyphicon */
				content: "\e114";    /* adjust as needed, taken from bootstrap.css */
				float: right;        /* adjust as needed */
				color: grey;         /* adjust as needed */
			}
			.panel-heading .accordion-toggle.collapsed:after {
				/* symbol for "collapsed" panels */
				content: "\e080";    /* adjust as needed, taken from bootstrap.css */
			}
		</style>
		<!-- HTML5 shim, for IE6-8 support of HTML5 elements -->
		<!--[if lt IE 9]>
		<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
		<![endif]-->

		<!-- Favicons
		================================================== -->
		<link rel="apple-touch-icon-precomposed" sizes="144x144" href="{{{ asset('assets/ico/apple-touch-icon-144.png') }}}">
		<link rel="apple-touch-icon-precomposed" sizes="114x114" href="{{{ asset('assets/ico/apple-touch-icon-114.png') }}}">
		<link rel="apple-touch-icon-precomposed" sizes="72x72" href="{{{ asset('assets/ico/apple-touch-icon-72.png') }}}">
		<link rel="apple-touch-icon-precomposed" href="{{{ asset('assets/ico/apple-touch-icon-57.png') }}}">
		<link rel="shortcut icon" href="{{{ asset('assets/ico/favicon.png') }}}">
		<link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
		<link rel="icon" href="/favicon.ico" type="image/x-icon">
	</head>

	<body>
	<div class="container">
	<br />
		 <!-- Static navbar -->
      <nav class="navbar navbar-default">
        <div class="container-fluid">
          <div class="navbar-header">
            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
              <span class="sr-only">{{ ('Toggle navigation') }}</span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="{{route_lang('')}}">{{$website_name}}</a>
          </div>
          <div id="navbar" class="navbar-collapse collapse">
            <ul class="nav navbar-nav">
            	<? if($menu_main) : ?>
				<? foreach($menu_main->roots() as $item) : ?>
					<li {{ (Request::is('/') ? ' class="active"' : '') }}><a href="<?= $item->url() ?>"><?= $item->title ?></a></li>
				<? endforeach; ?>
				<? endif; ?>
            </ul>
            <ul class="nav navbar-nav navbar-right">
				@if (Auth::check())
					<li class="dropdown">
					<a href="#" data-toggle="dropdown" class="dropdown-toggle">
					  {{ __('My account') }} <span class="caret"></span>
					</a>
					<ul role="menu" class="dropdown-menu">
					  <li><a href="{{{ route_lang('user/favourites') }}}"><?= __('Saved properties') ?></a></li>
					  <?/*<li><a href="{{{ route_lang('user/add_credits') }}}"><?= __('Saved searches') ?></a></li>*/?>
					  <li><a class="post-btn" href="{{{ route_lang('user/profile') }}}"><?= __('Account details') ?></a></li>
					  <li><a class="post-btn" href="{{{ route_lang('user/change-password') }}}"><?= __('Change password') ?></a></li>
					  <li class="divider"></li>
					  <li><a href="{{{ route_lang('auth/logout') }}}"><?= __('Log out') ?></a></li>
					</ul>
				  </li>
        		@else
						<li {{ (Request::is('login') ? ' class="active"' : '') }}><a href="{{{ route_lang('auth/login') }}}"><?= __('Login/Register') ?></a></li>
				@endif

				@if(count($available_locales) > 1):
				<li class="dropdown">
									<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"><?= __('Language') ?> <span class="caret"></span></a>
									<ul class="dropdown-menu">
						<? foreach($available_locales as $locale_code => $locale_name) : ?>
							<li><a href="<?= URL::to( $locale_code ) ?>" class="lang_selector_main" data-lang="<?= $locale_code ?>"><?= $locale_name ?></a></li>
						<? endforeach; ?>
									</ul>
								</li>
				@endif

            </ul>
          </div><!--/.nav-collapse -->
        </div><!--/.container-fluid -->
      </nav>
		<!-- ./ navbar -->

			<!-- Content -->
				@yield('content')
			<!-- ./ content -->

<br />
<br />
<footer>



					<div class="col-xs-6">
				<p><strong>&copy; {{$settings['website_name']}} {{date('Y')}} - <?= __('All rights reserved') ?></strong>
				<br />{{('Powered by') }} <a href="//estatezilla.com">estatezilla</a><br />
				<!--<span class="text-muted">This page took {{ number_format((microtime(true) - LARAVEL_START), 2) }}s to render</span>-->
				</p>
			  </div>

				<div class="col-xs-6">
					<p class="pull-right">
						<? if($menu_footer) : ?>
						<? foreach($menu_footer->roots() as $item) : ?>
							<a href="<?= $item->url() ?>"><?= $item->title ?></a>&nbsp;&nbsp;&nbsp;&nbsp;
						<? endforeach; ?>
						<? endif; ?>

					</p>
			  </div>


		</footer>

    <!-- Javascripts
    ================================================== -->

    <!-- Bootstrap core JavaScript
    ================================================== -->
    <!-- Placed at the end of the document so the pages load faster -->
	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
	<script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
  <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery.perfect-scrollbar/0.6.3/js/min/perfect-scrollbar.jquery.min.js"></script>
	<script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&libraries=places&key=AIzaSyDlMF20lVDPeQaUE--_ltRsFWwS6sC_wfA"></script>
	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/equalize.js/1.0.2/equalize.min.js"></script>
	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/geocomplete/1.6.5/jquery.geocomplete.min.js"></script>
	<script>
      function site_url(path) {
          return '{{URL::to('')}}/'+path;
      }
      function base_url(path) {
          return '{{URL::to('')}}/'+path;
      }
      var current_lang = '<?= $current_lang ?>';
  </script>

	<script src="{{{ theme_asset('eldarion-ajax.min.js') }}}"></script>
	<script src="{{{ theme_asset('global.js') }}}"></script>

	</body>
</html>
