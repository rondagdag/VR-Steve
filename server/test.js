/*"use strict";

var Cylon = require("cylon");

Cylon.robot({
  connections: {
    arduino: { adaptor: "firmata", port: "/dev/tty.usbmodem14131" }
  },

  devices: {
    led: { driver: "led", pin: 1 }
  },

  work: function(my) {
    every((1).second(), my.led.toggle);
  }
}).start();
*/

"use strict";

var Cylon = require("cylon");

Cylon.robot({
  connections: {
    adaptor: { adaptor: "firmata", port: "/dev/tty.usbmodem14131" }
  },

  devices: {
    servo: {
      driver: "servo",
      pin: 5,
      limits: { bottom: 20, top: 160 }
    }
  },

  work: function(my) {
    var angle = 0,
        increment = 20;

    every((1).seconds(), function() {
      angle += increment;

      my.servo.angle(angle);

      console.log("Current Angle: " + (my.servo.currentAngle()));

      if ((angle === 0) || (angle === 180)) {
        increment = -increment;
      }
    });
  }
}).start();
