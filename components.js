'use strict';

var map = null;
var GtMap = React.createClass({
	getInitialState: function() {
		return {
			visible: false,
			cityName: '',
			countryName: '',
			trackName: '',
			previewUrl: '',
			progressPercent: 0,
			currentMarker: null,
			currentTrack: null,
			currentTrackIndex: 0
		};
	},
	componentDidMount: function() {
		this.mountMap();

		$.ajax({
			url: 'data.json',
			success: function(trackData) {
				trackData = trackData.cities;
				for (var i = 0; i < trackData.length; i++) {
					this.createMarker({
						lat: trackData[i].latitude * 1,
						lng: trackData[i].longitude * 1,
						cityName: trackData[i].city,
						countryName: trackData[i].country,
						spotifyTrackIds: trackData[i].trackIDS
					});
				}
			}.bind(this)
		});

		// Get data and loop over all points
		var trackList = [
			{
				lat: 59.224443,
				lng: 17.7768621,
				cityName: 'Stockholm',
				spotifyTrackIds: ['0eGsygTp906u18L0Oimnem', '4i9sYtSIlR80bxje5B3rUb']
			},
			{
				lat: 51.5073510,
				lng: -0.1277580,
				cityName: 'London',
				spotifyTrackIds: ['4i9sYtSIlR80bxje5B3rUb', '0eGsygTp906u18L0Oimnem']
			}
		];
	},
	createMarker: function(markerInfo) {
		var marker = new google.maps.Marker({
			position: {
				lat: markerInfo.lat,
				lng: markerInfo.lng,
			},
			map: map,
			cityName: markerInfo.cityName,
			countryName: markerInfo.countryName,
			spotifyTrackIds: markerInfo.spotifyTrackIds
		});

		google.maps.event.addListener(marker, 'click', function() {
			this.playTrack(marker, 0); // Start with first in playlist
		}.bind(this));
	},
	playTrack: function(marker, trackIndex) {
		this.getTrackInfo(marker.spotifyTrackIds[trackIndex], function(trackInfo) {
			// Animate in for first time, fancy
			if (!this.state.visible || this.state.currentMarker.cityName !== marker.cityName) {
				this.setState({
					visible: true
				});
				this.animateIn();
			}

			if (this.state.currentTrack) this.state.currentTrack.stop();

			this.drawPolyLine(marker);

			this.setState({
				cityName: marker.cityName,
				countryName: marker.countryName,
				trackName: trackInfo.name + ' — ' + trackInfo.album.name,
				previewUrl: trackInfo.preview_url,
				progressPercent: 0,
				currentMarker: marker,
				currentTrack: new buzz.sound(trackInfo.preview_url, { formats: ['mp3'] }),
				currentTrackIndex: trackIndex
			});

			this.state.currentTrack.fadeIn().play();
			this.state.currentTrack.bind('timeupdate', function() {
				this.setState({
					progressPercent: buzz.toPercent(this.state.currentTrack.getTime(), this.state.currentTrack.getDuration(), 2)
				});
			}.bind(this));
		}.bind(this));
	},
	drawPolyLine: function(newMarker) {
		if (this.state.currentMarker && this.state.currentMarker.cityName !== newMarker.cityName) {

			var linePathLatLng = [
				new google.maps.LatLng(this.state.currentMarker.position.k, this.state.currentMarker.position.B),
				new google.maps.LatLng(newMarker.position.k, newMarker.position.B)
			];

			console.log(linePathLatLng);

			new google.maps.Polyline({
				path: linePathLatLng,
				geodesic: true,
				strokeColor: '#81b900',
				strokeOpacity: 1,
				strokeWeight: 2,
				map: map
			});
		}
	},
	skipTrack: function() {
		this.playTrack(this.state.currentMarker, this.state.currentTrackIndex + 1);
	},
	playpauseTrack:function(){
		var fieldNameElement = document.getElementById('playpauseBtn');
		if(this.state.currentTrack.isPaused()){
			this.state.currentTrack.play();
			fieldNameElement.innerHTML = "PLAY";
		}else{
			this.state.currentTrack.pause();
			fieldNameElement.innerHTML = "PAUSE";
		}
	},
	animateIn: function() {
		$(this.refs.ovlWrap.getDOMNode()).find('div').velocity('transition.slideUpIn', {
			duration: 500,
			stagger: 100
		});
	},
	getTrackInfo: function(spotifyTrackId, callback){
		$.ajax({
			url: 'https://api.spotify.com/v1/tracks/' + spotifyTrackId,
			success: function(res) {
				callback(res);
			}
		});
	},
	setProgress: function(e) {
		this.state.currentTrack.setPercent(e.clientX / $(window).width() * 100);
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
			center: new google.maps.LatLng(20, 50),
			zoom: 3,
			maxZoom: 6,
			minZoom: 3,
			scrollwheel: false,
			//navigationControl: false,
			//mapTypeControl: false,
			//scaleControl: false,
			//draggable: false,
			//panControl: false,
			//zoomControl: false,
			streetViewControl: false,
			//overviewMapControl: false,
			//disableDoubleClickZoom: true,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			styles: mapStyle
		}

		map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	},
	render: function() {
		var progressStyle = {
			width: this.state.progressPercent + '%'
		}
		return (
			<div>
				<div id="ovl-wrap" ref="ovlWrap">
					<div id="ovl-hd">
						<div id="ovl-cityname" className="opensans">
							{this.state.cityName}, {this.state.countryName}
						</div>
						<div id="ovl-trackname" className="playfair">
							{this.state.trackName}
						</div>
					</div>
				<div onClick={this.skipTrack}>
					SKIP IT
				</div>
				<div id="playpauseBtn" onClick={this.playpauseTrack}>
					PLAY
				</div>
				</div>
				<div id="progress-wrap" onClick={this.setProgress}>
					<div id="progress-bar" style={progressStyle}>
					</div>
				</div>
			</div>
		);
	}
});

React.render(<GtMap />, document.getElementById('map-actions'));