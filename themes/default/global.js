//Map page
var map;
var infowindow = new google.maps.InfoWindow({
    maxWidth: 350,
    maxHeight: 80
});
var markersArray = [];
google.maps.Map.prototype.clearOverlays = function() {
  for (var i = 0; i < markersArray.length; i++ ) {
    markersArray[i].setMap(null);
  }
  markersArray.length = 0;
}
function initialize_map() {
	if($('#map_canvas').length == 0)
		return;
		
	var myLatlng = new google.maps.LatLng(map_lat,map_lng);
	var myOptions = {
		zoom: map_zoom,
		center: myLatlng,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
}

$(function(){
	$('#gallery').perfectScrollbar();	
	$('.grid-row').equalize({children: '.grid-box .well', equalize: 'innerHeight', reset: true});

	$("input.location-input").geocomplete({
		details: ".location-form",
		detailsAttribute: "data-geo",
		blur: true
	});
});

//property page
$(function () {
	
	$(document).on("eldarion-ajax:begin", function(evt, $el) {
		$('#ajax-loading').show();
	});
	
	$(document).on("eldarion-ajax:complete", function(evt, $el) {
		$('#ajax-loading').hide();
		$('.grid-row').equalize({children: '.grid-box .well', equalize: 'innerHeight', reset: true});
	});

	$('.print-page').click(function(ev) {
        window.print();
        return false;
    });

	$(document).on("click", ".property-types-tree > li > input", function(event){
		console.log('checked', $(this).prop('checked'));
		if($(this).prop('checked')) {
			//select all
			console.log($(this).parent());
			$(this).parent().find('ul input').prop('checked', true);
		} else {
			$(this).parent().find('ul input').prop('checked', false);
		}
		update_ajax_search()
		return true;
	});

	refresh_ajax_search();
	//$('#form_listings input:not(#listings-sidebar-input), #form_listings select').change(update_ajax_search);

	$(document).on("change", "select[name=sort]", function(event){
		$('input[name=sort_type]').val($(this).val());
		update_ajax_search()
		return false;
	});

	$( "#form_listings" ).submit(function(event) {
		update_ajax_search();
		return false;
	});
	
	if($('#map_canvas').length > 0) {
		initialize_map();
		map_ajax_search();
		$( "#map_listings" ).submit(function(event) {
			map_ajax_search();
			return false;
		});
	}

});

function refresh_ajax_search() {
	console.log('refresh_ajax_search');
	$(document).on("click", ".pagination a", function(event){
		var myurl = $(this).attr('href');
		$.ajax(
		{
			url: myurl,
			type: "get",
			datatype: "html",
			beforeSend: function()
			{
				$('#ajax-loading').show();
				$('html, body').animate({scrollTop: '0px'}, 300);
			}
		})
		.done(function(data)
		{
			$('#ajax-loading').hide();
			$("#listings_view").empty().html(data.html);
			$('.grid-row').equalize({children: '.grid-box .well', equalize: 'innerHeight', reset: true});
		})
		.fail(function(jqXHR, ajaxOptions, thrownError)
		{
			  alert('No response from server');
		});
		return false;
	});
}

function map_ajax_search() {
	var myurl = $('#map_listings').attr('action');
	var data = $('#map_listings').serialize();
	
	$.ajax(
	{
		url: myurl,
		type: "get",
		datatype: "html",
		data: data,
		beforeSend: function()
		{
			$('#ajax-loading').show();
		}
	})
	.done(function(data)
	{
		$('#ajax-loading').hide();
		map.clearOverlays();
		console.log(data);
		$.each(data.properties, function(key, value) {
			console.log(key, value);
			
			var marker = new google.maps.Marker({
				position: new google.maps.LatLng(parseFloat(value.lat), parseFloat(value.lng)),
				map: map,
				scrollwheel: false,
				streetViewControl:true,
				title: value.title
			});
			
			google.maps.event.addListener( marker, 'click', function() {
				// Setting the content of the InfoWindow
				var content = '<div class="scrollFix"><div class="row" style="overflow:hidden;line-height:1.35;min-width:350px; height: 110px;"><div id="info" class="col-xs-12"><div class="row">' + '<div class="col-xs-5"><img src="'+value.main_image+'" class="thumbnail" style="width:135px"/></div>' + '<div class="col-xs-7"><h4 style="margin-top: 5px">' + value.title + '</h4>' + '<strong>' + value.price_formatted + '</strong>' + '<p><a href="'+value.url+'">View property >></a></p>' + '</div></div></div></div></div>';
				infowindow.setContent(content );
				infowindow.open(map, marker);
			});
			markersArray.push(marker);
			
		});
		
	})
	.fail(function(jqXHR, ajaxOptions, thrownError)
	{
		  alert('No response from server');
	});
}

function update_ajax_search() {
	var myurl = $('#form_listings').attr('action');
	var data = $('#form_listings').serialize();

	$.ajax(
	{
		url: myurl,
		type: "get",
		datatype: "html",
		data: data,
		beforeSend: function()
		{
			$('#ajax-loading').show();
		}
	})
	.done(function(data)
	{
		$('#ajax-loading').hide();
		$("#listings_view").empty().html(data.html);
		$('.grid-row').equalize({children: '.grid-box .well', equalize: 'innerHeight', reset: true});
	})
	.fail(function(jqXHR, ajaxOptions, thrownError)
	{
		  alert('No response from server');
	});
}
