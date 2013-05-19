leapd3
======

#LeapD3

LeapD3 is a simple visualizer application for the Leap device. It uses D3.js to render scalable vector graphics (SVG) in the browser.

For more info and to watch for updates, visit http://knaut.net
If you're like to get in touch directly, drop me a line at info@knaut.net

This is a work in progress and not yet designed for public consumption, however, feel free to pick it apart or hack it for your own ends.

##Roadmap
LeapD3 is currently being wrapped into NodeJS. Using node-osc, visualized data from the Leap will also output OSC signals which can be used with other software or hardware such as Ableton, Quartz Composer, or VDMX. Different visualizations will yield different data outputs.

##To-dos
- fix osc signals sent from nodejs server. currently exceeds call stack. why?
- fix color channel toggles bug (use jquery ui instead?)
- add a 'start' or 'init' trigger

##Wishlist
- righthand drawer with osc channel outputs & readouts
- store data sessions with mongodb and add visualized playback (JSON loops) - bottom/top drawer?


##Contact
https://twitter.com/_knaut
knaut.net
info@knaut.net

