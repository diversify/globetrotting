
/*$(function() {
	var ui = {
		visible: false,
		setCityName: function(cityVal) {
			$('#ovl-cityname').html('straight from ' + cityVal);
		},
		setTrackName: function(trackVal) {
			$('#ovl-trackname').html(trackVal);
		},
		setTrackProgress: function(percentVal) {
			$('#progress-bar').css({
				width: percentVal + '%'
			})
		},
		animateIn: function(){
			$('#ovl-wrap').find('div').velocity('transition.slideUpIn', {
				duration: 500,
				stagger: 100
			});
		}
	}
	function initialize() {
		var mapStyle = [{
		    "featureType": "water",
		    "elementType": "geometry",
		    "stylers": [{
		        "color": "#000000"
		    }, {
		        "lightness": 17
		    }]
		}, {
		    "featureType": "landscape",
		    "elementType": "geometry",
		    "stylers": [{
		        "color": "#666666"
		    }]
		}, {
		    "featureType": "road.highway",
		    "elementType": "geometry.fill",
		    "stylers": [{
		        "color": "#000000"
		    }, {
		        "lightness": 17
		    }]
		}, {
		    "featureType": "road.highway",
		    "elementType": "geometry.stroke",
		    "stylers": [{
		        "color": "#000000"
		    }, {
		        "lightness": 29
		    }, {
		        "weight": 0.2
		    }]
		}, {
		    "featureType": "road.arterial",
		    "elementType": "geometry",
		    "stylers": [{
		        "color": "#000000"
		    }, {
		        "lightness": 18
		    }]
		}, {
		    "featureType": "road.local",
		    "elementType": "geometry",
		    "stylers": [{
		        "color": "#000000"
		    }, {
		        "lightness": 16
		    }]
		}, {
		    "featureType": "poi",
		    "elementType": "geometry",
		    "stylers": [{
		        "color": "#000000"
		    }, {
		        "lightness": 21
		    }]
		}, {
		    "elementType": "labels.text.stroke",
		    "stylers": [{
		        "visibility": "off"
		    }, {
		        "color": "#000000"
		    }, {
		        "lightness": 16
		    }]
		}, {
		    "elementType": "labels.text.fill",
		    "stylers": [{
		    	"visibility": "off"
		    },
		    {
		        "saturation": 36
		    }, {
		        "color": "#000000"
		    }, {
		        "lightness": 40
		    }]
		}, {
		    "elementType": "labels.icon",
		    "stylers": [{
		        "visibility": "off"
		    }]
		}, {
		    "featureType": "transit",
		    "elementType": "geometry",
		    "stylers": [{
		        "color": "#000000"
		    }, {
		        "lightness": 19
		    }]
		}, {
		    "featureType": "administrative",
		    "elementType": "geometry.fill",
		    "stylers": [{
		        "color": "#000000"
		    }, {
		        "lightness": 20
		    }]
		}, {
		    "featureType": "administrative",
		    "elementType": "geometry.stroke",
		    "stylers": [{
		        "color": "#000000"
		    }, {
		        "lightness": 17
		    }, {
		        "weight": 1.2
		    }]
		}];

		var mapOptions = {
			center: new google.maps.LatLng(20, 30),
			zoom: 3,
			scrollwheel: false,
			navigationControl: false,
			mapTypeControl: false,
			scaleControl: false,
			draggable: false,
			panControl: false,
			zoomControl: false,
			streetViewControl: false,
			overviewMapControl: false,
			disableDoubleClickZoom: true,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			styles: mapStyle
		};
		var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

		google.maps.event.addListener(map, 'click', function(e) {
			console.log(e);
			return false;
		});

		//http://maps.googleapis.com/maps/api/geocode/json?address=Stockholm&sensor=false
		// for each track, add a marker with click event

		var track;

		for (var i = 0; i < 100; i++) {
			var marker = new google.maps.Marker({
				position: {
					lat: 59.224443,
					lng: 17.7768621
				},
				map: map,
				icon: {
					url: '/images/pin.png' 
				},
				customInfo: 'Stockholm'
			});
			google.maps.event.addListener(marker, 'click', function() {
				$.ajax({
					url: 'https://api.spotify.com/v1/tracks/0eGsygTp906u18L0Oimnem',
					type: 'get',
					success: function(res) {
						if (!ui.visible) ui.animateIn();

						for(var i in buzz.sounds) {
							buzz.sounds[i].stop();
						}

						ui.setCityName(marker.customInfo);
						ui.setTrackName(res.name + ' — ' + res.album.name);

						track = new buzz.sound(res.preview_url, {
							formats: ['mp3']
						});

						track.fadeIn().play();
						track.bind('timeupdate', function() {
							ui.setTrackProgress(buzz.toPercent(track.getTime(), track.getDuration(), 2));
						});
					}
				});
			});
		}
	}
	var cities;
	$.ajax({
		url: '/data.json',
		success: function(cities) {
			cities = cities.cities;
			initialize();
		}
	});
});*/