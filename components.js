var map;

var GtMap = React.createClass({
	getInitialState: function() {
		return {
			visible: false,
			cityName: '',
			trackName: '',
			previewUrl: '',
			currentTrack: null
		};
	},
	componentDidMount: function() {
		this.mountMap();

		// Get data and loop over all points
		for (var i = 0; i < 1; i++) {
			var marker = new google.maps.Marker({
				position: {
					lat: 59.224443,
					lng: 17.7768621
				},
				map: map,
				index: i,
				cityName: 'Stockholm',
				spotifyTrackId: '0eGsygTp906u18L0Oimnem'  
			});

			google.maps.event.addListener(marker, 'click', function() {
				console.log(marker);
				this.playSong(marker);
			}.bind(this));
		}
	},
	playSong: function(marker) {
		console.log(marker.spotifyTrackId);
		this.getSongInfo(marker.spotifyTrackId, function(songInfo) {
			this.setState({
				cityName: marker.cityName,
				trackName: songInfo.name + ' — ' + songInfo.album.name,
				previewUrl: songInfo.preview_url,
				currentTrack: new buzz.sound(songInfo.preview_url, { formats: ['mp3'] })
			});

			this.state.currentTrack.fadeIn().play();
		}.bind(this));
	},
	getSongInfo: function(spotifyTrackId, callback){
		$.ajax({
			url: 'https://api.spotify.com/v1/tracks/' + spotifyTrackId,
			success: function(res) {
				callback(res);
			}
		});
	},
	mountMap: function() {
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
		}

		map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	},
	render: function() {
		return (
			<div>
				<div id="ovl-wrap">
					<div id="ovl-hd">
						<div id="ovl-cityname" className="opensans">
							{this.state.cityName}
						</div>
						<div id="ovl-trackname" className="playfair">
							{this.state.trackName}
						</div>
					</div>
				</div>
				<div id="progress-wrap">
					<div id="progress-bar">
					</div>
				</div>
			</div>
		);
	}
});

React.render(<GtMap />, document.getElementById('map-actions'));