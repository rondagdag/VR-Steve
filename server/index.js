// (C) Copyright 2014 by Autodesk, Inc.
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.

//- Written by Cyrille Fauvel, Autodesk Developer Network (ADN)
//- http://www.autodesk.com/joinadn
//- October 20th, 2014
//

// To avoid the EXDEV rename error, see http://stackoverflow.com/q/21071303/76173
//process.env.TMPDIR ='tmp' ;
//process.env ['NODE_TLS_REJECT_UNAUTHORIZED'] ='0' ; // Ignore 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' authorization error
console.log ('Working directory: ' + __dirname) ;

var express =require ('express') ;
var request =require ('request') ;
var bodyParser =require ('body-parser') ;
var fs =require ('fs') ;

var lmvToken =require ('./lmv-token') ;

var fist = false;
var isOpen = false;
var Cylon = require('cylon');

Cylon.robot({
  name: 'chappie',

  // This is how we define custom events that will be registered
  // by the API.
  events: ['turned_on', 'turned_off', 'show', 'hide'],

  // These are the commands that will be availble in the API
  // Commands method needs to return an object with the aliases
  // to the robot methods.
  commands: function() {
    return {
      turn_on: this.turnOn,
      turn_off: this.turnOff,
      show : this.show,
      //toggle: this.toggle
    };
  },

  connections: {
    arduino: { adaptor: "firmata", port: "/dev/tty.usbmodem14131" },
    leapmotion: { adaptor: 'leapmotion' },
    //arduino: { adaptor: 'firmata', port: '/dev/tty.usbmodem1411' }

  },

  devices: {
    led: { driver: "led", pin: 1 },
    //button: { driver: "button", pin: 0 },
    leapmotion: { driver: 'leapmotion' },

    //button: { driver: "button", pin: 0 }
    button0: { driver: "button", pin: 0 },
    sensor1: { driver: "analogSensor", pin: 0, upperLimit: 500, lowerLimit: 10 },
    sensor2: { driver: "analogSensor", pin: 1, upperLimit: 500, lowerLimit: 10 }
  },


  turnOn: function() {
    //this.led.turnOn();
    this.emit('turned_on');
  },

  turnOff: function() {
    //this.led.turnOff();
    this.emit('turned_off');
  },


  show: function() {
      //this.led.turnOff();
      this.emit('show');
  },

  //toggle: function() {
  //  this.led.toggle();
  //  if (this.led.isOn()) {
  //    this.emit('turned_on');
  //  } else {
  //    this.emit('turned_off');
  //  }
  //},

  work: function(my) {

    //my.button.on("push", function() { console.log('push')});
  /*  my.sensor1.on("analogRead", function(val) {
      console.log("analog read value:", val);
      console.log("analog read value:", my.sensor1.analogRead());
    });
*/

   /*my.sensor2.on("analogRead", function(val) {
      console.log("analog read value:", val);
      console.log("analog read value:", my.sensor2.analogRead());
    });

    my.sensor1.on("upperLimit", function(val) {
      console.log("Upper limit reached ===> " + val);

      my.emit('show');
    });
*/
    my.sensor2.on("upperLimit", function(val) {
      console.log("Upper limit reached ===> " + val);
      my.emit('show');
    });

    my.button0.on("push", function(val) {
        console.log("button pushed");
        //console.log("digital read value:", my.button0.digitalRead());
        my.emit('hide');

      });


      my.button0.on("release", function(val) {
        console.log("button released");
        //console.log("digital read value:", my.button0.digitalRead());
      });
/*
    my.sensor1.on("lowerLimit", function(val) {
      console.log("Lower limit reached ===> " + val);
      my.emit('hide');
    });

    my.sensor2.on("lowerLimit", function(val) {
      console.log("Lower limit reached ===> " + val);
      my.emit('hide');
    });
*/
    /*my.button.on("push", function(payload) {
        console.log("pushed");
        my.led.toggle();
      });*/

    my.leapmotion.on('hand', function(payload) {
      //console.log(payload.toString());
      //my.emit('turned_on');

			//console.log(payload.frame);

			if (payload.frame.hands[0].grabStrength > 0.5)
			{
				isOpen = false;
				my.emit('turned_off');
				console.log('turn off');
			} else
			{
				isOpen = true;
				my.emit('turned_on');
				console.log('turn on');
			}

    var frame = payload.frame;
    if(frame.valid && frame.gestures.length > 0){

      //if(frame.valid && frame.gestures.length > 0){
    frame.gestures.forEach(function(gesture){
        switch (gesture.type){
          case "circle":
              console.log("Circle Gesture");
              my.emit('turned_off');
              break;
          case "keyTap":
              console.log("Key Tap Gesture");
              my.emit('show');
              break;
          case "screenTap":
              console.log("Screen Tap Gesture");
              my.emit('show');
              break;
          case "swipe":
              console.log("Swipe Gesture");
              //my.emit('turned_on');
              break;
        }
    });

    }
    /*var gesture = frame.gestures[0].
          switch (gesture.type){
            case "circle":
                console.log("Circle Gesture");
                my.emit('show');
                break;
            case "keyTap":
                console.log("Key Tap Gesture");
                my.emit('show');
                break;
            case "screenTap":
                console.log("Screen Tap Gesture");
                my.emit('show');
                break;
            case "swipe":
                console.log("Swipe Gesture");
                break;
          }
        }
      }
      */

		});


		every((2).second(), function() {
      //my.led.toggle();

			console.log(fist);
			if (fist == true)
			{
				if (!isOpen)
				{
					isOpen = true;
					my.emit('turned_on');
				} else
				{
					isOpen = false;
					my.emit('turned_off');
				}
				fist = false;
			}
		});
  },


});

// We setup the api specifying `socketio`
// as the preffered plugin
Cylon.api(
  'socketio',
  {
  host: '0.0.0.0',
  port: '8001'
});

/*var Myo = require('myo');

var myMyo = Myo.create();

myMyo.on('fist', function(edge){
    if(!edge) return;
    console.log('Hello Myo!');
    //myMyo.vibrate();
		fist = true;
});
*/
Cylon.start();

var app =express () ;
app.use (bodyParser.json ()) ;
app.use (express.static (__dirname + '/../www')) ;
app.use ('/api', lmvToken) ;

app.set ('port', process.env.PORT || 8000) ;
var server =app.listen (app.get ('port'), function () {
	console.log ('Server listening on port ' + server.address ().port) ;
}) ;
