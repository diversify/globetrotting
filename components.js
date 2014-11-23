'use strict';

var map;
var overlay;
var places;
var loadingTrack = false;
var cx = React.addons.classSet;
var GtMap = React.createClass({
	getInitialState: function() {
		return {
			visible: false,
			queuing: false,
			playing: false,
			queue: [],
			cityName: '',
			countryName: '',
			trackName: '',
			previewUrl: '',
			progressPercent: 0,
			lastQueueMarker: null,
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
				var tempMarkers = [];
				trackData = trackData.cities;
				for (var i = 0; i < trackData.length; i++) {
					tempMarkers.push(this.createMarker({
						lat: trackData[i].latitude * 1,
						lng: trackData[i].longitude * 1,
						cityName: trackData[i].city,
						countryName: trackData[i].country,
						spotifyTrackIds: trackData[i].trackIDS
					}));
				}
				var markerCluster = new MarkerClusterer(map, tempMarkers, {
					styles: [{
						url: 'images/pin3.png',
						width: 20,
						height: 25,
						anchor: [10, 25],
						textColor: '#fff',
						textSize: 8
					}],
					gridSize: 30,
					maxZoom: 20
				});
				google.maps.event.addListener(markerCluster, 'click', function (c) {
					console.log(c);
				});
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
		var markerImage = {
			url: 'images/pin.png',
			anchorPoint: new google.maps.Point(10, 30),
			size: new google.maps.Size(20, 25),
			scaledSize: new google.maps.Size(20, 25)
		}
		var marker = new google.maps.Marker({
			position: {
				lat: markerInfo.lat,
				lng: markerInfo.lng,
			},
			//map: map,
			title: markerInfo.cityName + ', ' + markerInfo.countryName,
			icon: markerImage,
			cityName: markerInfo.cityName,
			countryName: markerInfo.countryName,
			spotifyTrackIds: markerInfo.spotifyTrackIds
		});

		google.maps.event.addListener(marker, 'click', function(e) {
			if (!this.state.visible) {
				this.showPulse(overlay.getProjection().fromLatLngToContainerPixel(e.latLng));
			}
			if (this.state.queuing && this.state.currentTrack && !this.state.currentTrack.isEnded()) {
				var tempQueue = this.state.queue;
				tempQueue.push({
					marker: marker,
					trackPos: Math.round(Math.random() * 10)
				});
				this.drawPolyLine(marker);
				this.setState({
					queue: tempQueue
				});
			} else {
				this.playTrack(marker, Math.round(Math.random() * 10)); // Start with first in playlist
			}
		}.bind(this));

		return marker;
	},
	showPulse: function(projection) {
		var $pulse = $('#pulse');
		$pulse.css({
			display: 'block',
			top: projection.y - $pulse.height() / 2,
			left: projection.x - $pulse.width() / 2
		}).velocity({
			scale: [30, 0.3],
			opacity: [0, 0.8]
		}, {
			easing: [0.165, 0.84, 0.44, 1],
			duration: 2000,
			begin: function() {
				setTimeout(function() {
					$pulse.hide();
				}, 1000);
			}
		});
	},
	toggleQueuing: function() {
		this.setState({
			queue: [],
			queuing: !this.state.queuing
		});
	},
	showRing: function(projection) {
		var $ring = $('#ring');
		$ring.css({
			display: 'block',
			transform: 'scale(0)',
			top: projection.y - $ring.height() / 2,
			left: projection.x - $ring.width() / 2
		}).stop(true).velocity({
			scale: [1, 0],
			opacity: [1, 0]
		},{
			easing: [0.1, 0.885, 0.07, 1.1],
			duration: 1000
		}).velocity({
			scale: [0.8, 1]
		}, {
			loop: true,
			easing: [0.215, 0.61, 0.355, 1]
		});
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
			if (!this.state.queuing) this.drawPolyLine(marker);

			this.setState({
				cityName: marker.cityName,
				countryName: marker.countryName,
				trackName: trackInfo.name + ' - ' + trackInfo.artists[0].name,
				previewUrl: trackInfo.preview_url,
				progressPercent: 0,
				currentMarker: marker,
				currentTrack: new buzz.sound(trackInfo.preview_url, { formats: ['mp3'] }),
				currentTrackIndex: trackIndex,
				playing: true
			});

			this.state.currentTrack.fadeIn().play();
			this.state.currentTrack.bind('timeupdate', function() {
				this.setState({
					progressPercent: buzz.toPercent(this.state.currentTrack.getTime(), this.state.currentTrack.getDuration(), 2)
				});
			}.bind(this))
			.bind('ended', function() {
				this.skipTrack();
			}.bind(this));
			this.getPlacesInfo(marker);
		}.bind(this));
	},
	getPlacesInfo: function(marker) {
		console.log(places);
		places.textSearch({
			query: marker.cityName + ', ' + marker.countryName,
			radius: 500,
			location: new google.maps.LatLng(marker.position.k, marker.position.B)
		}, function(res) {
			if (!res) return false;
			console.log(res);
			places.getDetails({ 
				placeId: res[0].place_id
			}, function(placeInfo) {
				console.log(placeInfo);
			});
		});
	},
	playPauseTrack: function() {
		if (this.state.currentTrack.isPaused()) {
			this.state.currentTrack.play();
			this.setState({
				playing: true 
			});
		} else {
			this.state.currentTrack.pause();
			this.setState({
				playing: false 
			});
		}
	},
	drawPolyLine: function(newMarker) {
		var linePathLatLng = [];

		if (this.state.lastQueueMarker && this.state.lastQueueMarker.cityName !== newMarker.cityName) {
			linePathLatLng = [
				new google.maps.LatLng(this.state.lastQueueMarker.position.k, this.state.lastQueueMarker.position.B),
				new google.maps.LatLng(newMarker.position.k, newMarker.position.B)
			];
		}

		this.setState({
			lastQueueMarker: newMarker 
		});

		if (!linePathLatLng.length) {
			return false;
		}

		new google.maps.Polyline({
			path: linePathLatLng,
			geodesic: true,
			strokeColor: '#ffffff',
			strokeOpacity: 0.6,
			strokeWeight: 2,
			map: map
		});
	},
	skipTrack: function() {
		if (this.state.queuing && this.state.queue.length > 0) {
			this.playTrack(this.state.queue[0].marker, this.state.queue[0].trackPos);

			var tempQueue = this.state.queue;
			tempQueue.shift();

			this.setState({
				queue: tempQueue
			});
		} else {
			this.playTrack(this.state.currentMarker, this.state.currentTrackIndex + 1);
		}
	},
	animateIn: function() {
		$(this.refs.ovlWrap.getDOMNode()).find('div').velocity('transition.slideUpIn', {
			duration: 500,
			stagger: 100
		});
	},
	getTrackInfo: function(spotifyTrackId, callback){
		if (loadingTrack) return false;
		loadingTrack = true;
		$.ajax({
			url: 'https://api.spotify.com/v1/tracks/' + spotifyTrackId,
			success: function(res) {
				loadingTrack = false;
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
			center: new google.maps.LatLng(20, 0),
			zoom: 3,
			maxZoom: 20,
			minZoom: 3,
			scrollwheel: false,
			//navigationControl: false,
			//mapTypeControl: false,
			scaleControl: true,
			zoomControl: true,
			zoomControlOptions: {
				style: google.maps.ZoomControlStyle.LARGE,
				position: google.maps.ControlPosition.RIGHT_CENTER
			},
			//draggable: false,
			panControl: false,
			//zoomControl: false,
			streetViewControl: false,
			//overviewMapControl: false,
			//disableDoubleClickZoom: true,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			styles: mapStyle
		}

		map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
		places = new google.maps.places.PlacesService(map);

		overlay = new google.maps.OverlayView();
		overlay.draw = function() {};
		overlay.setMap(map);
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
				<div id="track-controls" className="cf">
					<div id="play-pause-btn" className={this.state.playing ? 'pause' : 'play'} onClick={this.playPauseTrack}>
					</div>
					<div id="skip-btn" onClick={this.skipTrack}></div>
					<div id="toggle-queue" onClick={this.toggleQueuing} className={
						cx({
							opensans: true,
							active: this.state.queuing 
						})
					}>
						{this.state.queuing ? 'Turn off queuing' : 'Turn on queuing'}
					</div>
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