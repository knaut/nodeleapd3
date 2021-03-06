// new version of the same program

/* on init
	- append finger panels (finger panels -2 )
	- build out svgs(2) and rects (5 each)
	- set ids and classes
	- set attributes width, height, fill, x, y
	- fire leap loop

* on leap loop
	- pass in loop parameters
	- set snapshot updater

* on update
	- bind data to svgs using d3

• achieve no erros

then…

- set config options for finger bars
	- set x, y, z, to be recieve data (r,g,b) on trigger "on"
	- set finger bar height to be finger lenth, or palm y dist from origin
*/

// sugar
// do you like your strings camelized?
// hey baby, can i camelize your strings?
// hey sugar, want those string camel'd?	// this method gave me <5 pickup line ideas
String.prototype.camelize = function () {
    return this.replace (/(?:^|[-_])(\w)/g, function (_, c) {
      return c ? c.toUpperCase () : '';
    })
};

// we need a socket on the client to get the message
var socket = io.connect('http://localhost');				
socket.on('msg', function (data) {
	console.log( data );
	//socket.emit('msg', 1);
});


// global variables from the leap sample
var paused = false;
var pauseOnGesture = false;

var controllerOptions = { enableGestures: true };

// our main program
var main = {

	// decs
	$firstHandSVG: null,
	$secondHandSVG: null,
	$firstHandBars: null,
	$secondHandBars: null,

	fingerSVGH: 400,
	fbarH: 10,			// minimum height
	fbarW: 75,
	fbarFill: '#3C3F40',
	lastFrame: null,
	lastFrameHands: null,

	// our data filter obj
	dataFilter: {},

	// default dataset for fingerbars
	noData: [20, 20, 20, 20, 20],

	// arbitrary value to turn it down a notch
	notch: .3,

	// scales
	distanceScale: null,
	colorScale: null,
	oscDistScale: null,
	oscColorScale: null,
	oscVelScale: null,
	oscPosScale: null,

	// declare our prototype objects

	// initialize
	init: function() {

		$firstHandSVG = d3.select('#first-hand svg');
		$firstHandBars = $firstHandSVG.selectAll('rect');

		$secondHandSVG = d3.select('#second-hand svg');
		$secondHandBars = $secondHandSVG.selectAll('rect');

		// set the x offsets
		var xOffset = 100;

		// offset our bars programmatically
		$('#first-hand .finger-bar').each( function(index) {
			// we offset their x by multiplying their index
			// by some arbitrary distance
			index *= xOffset;
			this.setAttribute('x', index);
		});

		// same for the second hand
		$('#second-hand .finger-bar').each( function(index) {
			// we offset their x by multiplying their index
			// by some arbitrary distance
			index *= xOffset;
			index += 100; // compensation for lack of right-side alignment
			this.setAttribute('x', index);
		});

		// init scales
		this.distanceScale = d3.scale.linear().domain([0, 500]).range([0, 400]);
		this.colorScale = d3.scale.linear().domain([-250, 250]).range([0, 255]);

		this.oscLengthScale = d3.scale.linear().domain([0, 200]).range([0, 1]);
		this.oscDistScale = d3.scale.linear().domain([0, 500]).range([0, 1]);
		this.oscColorScale = d3.scale.linear().domain([-250, 250]).range([0, 1]);
		this.oscVelScale = d3.scale.linear().domain([0, 500]).range([0, 1]);
		this.oscPosScale = d3.scale.linear().domain([-250, 250]).range([0, 1]);


		// initialize our dataFilter
		this.initDataFilter();

		// start the leap loop
		this.leapLoop( 10 );

		// setup the ui
		ui.setup();
		
	},

	initDataFilter: function() {
		// we set our initial states for the data filter
		// based on the attributes already set in the DOM.
		
		// for each subheading, scan for btns
		$('#left').find('.btn').each( function() {
			
			var thisId = $( this ).attr( 'id' );				
			var thisState = $( this ).data( 'ui-state' );				
			
			// push the state value from the buttons, using their element's id as a key
			// these will be the values when we initialize
			main.dataFilter[ thisId ] = thisState;

		});
	},

	updateDataFilter: function( id, state ) {
		var thisId = id;
		var thisState = state;

		// we check if the id passed matches a property
		if ( main.dataFilter.hasOwnProperty( thisId ) ) {

			// if so, we set its value to the passed state
			main.dataFilter[ thisId ] = thisState;

			console.log('updated dataFilter: ' + thisId);
		}
	},

	// main program functions
	leapLoop: function( interval ) { 	

		// we set an interval to catch our data
		var thisInterval = interval;

		Leap.loop(controllerOptions, function(frame) {

		 	if (paused) {
				return; // Skip this update
			}
		 	
		 	main.lastFrame = frame;	// save this frame

		});

		// we update on an interval 
		this.leapInterval = setInterval( function() {

			// check theres a hand
			main.update();	

		}, thisInterval);
	},

	update: function() {

		// on the first fire, the frame hasn't been stored yet.
		// this creates the first error.

		// here we just check that the hand is visible
		if ( this.lastFrame.hands[0] ) {

			// bind the data, which must be some kind of array
			$firstHandBars.data( this.lastFrame.hands[0].fingers ).transition()

				// animate bar height
				.attr('height', function(d) {
					if (main.dataFilter.length === "active" ) {
						var thisData = main.oscLengthScale( d.length.toFixed(1) * 4 );

						var msgName = 'finger' + d.id + 'Msg';

						// send it via our socket
						socket.emit(msgName, thisData);

						return d.length.toFixed(1) * 4 
					}

					if (main.dataFilter.speed === "active" ) { 

						// store our OSC data locally
						var thisData = main.oscVelScale( Math.abs( d.tipVelocity[1].toFixed(1) ) );

						var msgName = 'finger' + d.id + 'Msg';

						// send it via our socket
						socket.emit(msgName, thisData);

						// return it for d3 viz
						return Math.abs( d.tipVelocity[1].toFixed(1) )
					}

					if (main.dataFilter.origin === "active" ) {  
						var thisData = main.oscDistScale( Math.abs( d.tipPosition[1]).toFixed(1));

						var msgName = 'finger' + d.id + 'Msg';

						// send it via our socket
						socket.emit(msgName, thisData);

						return main.distanceScale(Math.abs( d.tipPosition[1]).toFixed(1));
					}
				})
				.attr('y', function(d) {
					if (main.dataFilter.length === "active" ) {  
						return 400 - d.length.toFixed(1) * 4 
					}

					if (main.dataFilter.speed === "active" ) { 
						return 400 - Math.abs( d.tipVelocity[1].toFixed(1) )
					}

					if (main.dataFilter.origin === "active" ) {  
						return 400 - main.distanceScale(Math.abs( d.tipPosition[1]).toFixed(1));
					}

				})
				.attr('fill', function(d) {
					
					// make a color strings that holds our rgb fill vals
					var thisR, thisG, thisB;

					thisR = thisG = thisB = 0;	// set them all to 0

					// set color channel vals based on this tip speed
					if (main.dataFilter.tipSpeed === "active") {

						// rgb corresponds to xyz
						if (main.dataFilter.r === "active") {
							thisR = (Math.abs(d.tipVelocity[0] * 10).toFixed(1));

							var thisRData = main.oscColorScale(Math.abs(d.tipVelocity[0] * 10).toFixed(1));

							var msgName = 'finger' + d.id + 'Msg';

							// send it via our socket
							socket.emit(msgName, thisRData);
						}

						if (main.dataFilter.g === "active") {
							thisG = (Math.abs(d.tipVelocity[1] * 10).toFixed(1) * main.notch);
						
							var thisGData = main.oscColorScale(Math.abs(d.tipVelocity[1] * 10).toFixed(1) * main.notch);
						
							var msgName = 'finger' + d.id + 'Msg';

							// send it via our socket
							socket.emit(msgName, thisGData);
						}

						if (main.dataFilter.b === "active") {
							thisB = (Math.abs(d.tipVelocity[2] * 10).toFixed(1) * main.notch);
						
							var thisBData = (Math.abs(d.tipVelocity[2] * 10).toFixed(1) * main.notch);

							var msgName = 'finger' + d.id + 'Msg';

							// send it via our socket
							socket.emit(msgName, thisBData);
						}

					}

					// set color channel vals based on this tip position
					if (main.dataFilter.tipPosition === "active") {

						// rgb corresponds to xyz
						if (main.dataFilter.r === "active") {
							thisR = main.colorScale(d.tipPosition[0]).toFixed(1);

							var thisRPosData = main.oscPosScale( d.tipPosition[0].toFixed(1) );

							var msgName = 'finger' + d.id + 'Msg';

							// send it via our socket
							socket.emit(msgName, thisRPosData);
						}

						if (main.dataFilter.g === "active") {
							thisG = main.colorScale(d.tipPosition[1]).toFixed(1);

							var thisGPosData = main.oscPosScale( d.tipPosition[1].toFixed(1) );

							var msgName = 'finger' + d.id + 'Msg';

							// send it via our socket
							socket.emit(msgName, thisGPosData);
						}

						if (main.dataFilter.b === "active") {
							thisB = main.colorScale(d.tipPosition[2]).toFixed(1);

							var thisBPosData = main.oscPosScale( d.tipPosition[2].toFixed(1) );

							var msgName = 'finger' + d.id + 'Msg';

							// send it via our socket
							socket.emit(msgName, thisBPosData);
						}

					}

					return 'rgb( ' + thisR + ', ' + thisG + ', ' + thisB + ' )';
				});
		
		} else {

			$firstHandBars.data( main.noData ).transition()
				.attr( 'height', function(d) {
					return d;
				})
				.attr( 'y', function(d) {
					return 400 - d; 
				})
				.attr( 'fill', function(d) {
					return 'rgb( ' + d + ', ' + d + ', ' + d + ' )';
				});
		}

		// here we just check that the other hand is visible
		if ( this.lastFrame.hands[1] ) {

			$secondHandBars.data( this.lastFrame.hands[1].fingers ).transition()

				// animate bar height
				.attr('height', function(d) {
					if (main.dataFilter.length === "active" ) {  
						return d.length.toFixed(1) * 4 
					}

					if (main.dataFilter.speed === "active" ) {  
						return Math.abs( (d.tipVelocity[1].toFixed(1) * .75) )
					}

					if (main.dataFilter.origin === "active" ) {  
						return main.distanceScale(Math.abs( d.tipPosition[1] ).toFixed(1));
					}

				})
				.attr('y', function(d) {
					if (main.dataFilter.length === "active" ) {  
						return 400 - d.length.toFixed(1) * 4 
					}

					if (main.dataFilter.speed === "active" ) {  
						return 400 - Math.abs( (d.tipVelocity[1].toFixed(1) * .75) )
					}

					if (main.dataFilter.origin === "active" ) {  
						return 400 - main.distanceScale(Math.abs( d.tipPosition[1] ).toFixed(1));
					}

				})
				.attr('fill', function(d) {

					// make a color strings that holds our rgb fill vals
					var thisR, thisG, thisB;

					thisR = thisG = thisB = 0;	// set them all to 0

					// set color channel vals based on this tip speed
					if (main.dataFilter.tipSpeed === "active") {

						// rgb corresponds to xyz
						if (main.dataFilter.r === "active") {
							thisR = (Math.abs(d.tipVelocity[0] * 10).toFixed(1));
						}

						if (main.dataFilter.g === "active") {
							thisG = (Math.abs(d.tipVelocity[1] * 10).toFixed(1) * main.notch);
						}

						if (main.dataFilter.b === "active") {
							thisB = (Math.abs(d.tipVelocity[2] * 10).toFixed(1) * main.notch);
						}

					}

					// set color channel vals based on this tip position
					if (main.dataFilter.tipPosition === "active") {

						// rgb corresponds to xyz
						if (main.dataFilter.r === "active") {
							thisR = main.colorScale(Math.abs(d.tipPosition[0]).toFixed(1));
						}

						if (main.dataFilter.g === "active") {
							thisG = main.colorScale(Math.abs(d.tipPosition[1]).toFixed(1));
						}

						if (main.dataFilter.b === "active") {
							thisB = main.colorScale(Math.abs(d.tipPosition[2]).toFixed(1));
						}

					}

					return 'rgb( ' + thisR + ', ' + thisG + ', ' + thisB + ' )';
				});
		
		} else {

			$secondHandBars.data( main.noData ).transition()
				.attr( 'height', function(d) {
					return d;
				})
				.attr( 'y', function(d) {
					return 400 - d; 
				})
				.attr( 'fill', function(d) {
					return 'rgb( ' + d + ', ' + d + ', ' + d + ' )';
				});
		}
	}
}


