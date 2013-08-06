leapmotion - CustomCursorControl
================================

Overview
--------
Easy way to control page using [leapmotion senzor](http://www.leapmotion.com), leapmotion/leapjs#1, gilmoreorless/jquery-nearest#1  and jQuery library.

Features
--------

- custom cursor : use any html element as cursor
- timed click : automatic click after hovering clickable element defined time period
- gesture click : click by performing "key tap" gesture
- variable fps : customize refresh rate of cursor movement
- variable size of control plain : define your own size of control plain above senzor

How to use
----------

```
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js"></script>
<script src="js/jquery.nearest.min.js"></script>
<script src="js/leap.cursorcontrol.js"></script>

<div id="cursor" style="position:static;z-index:500;">X</div>
<a href="#" class="clickable">Click me!</a> 
<script>
$(document).ready(function(){
  var controller = new Leap.Controller({enableGestures:true});
	var leapBox = new LeapmotionCursorControl.LeapControl(controller,
		{cursorSelector:"#cursor",clickableSelector:".clickable"});
	controller.on("connect",function(){
		controller.loop(function(frame){
			leapBox.leapFrameHandler(frame);
		});
	});
});
</script>
```

Options
-------

```
var leapBox = new LeapmotionCursorControl.LeapControl(
	controller,
	{
		cursorSelector : "#cursor",
		clickableSelector : ".clickable",
		gestureClickOn : "true",
		timeClickOn : "true",
		clickTimer : 2000,
		fps : 60,
		bottomPadding : 100,
		sideLength : 150
	},
	function(percentageTimeHover,id){}
	);
```
Description (default values are in code above):
- cursorSelector : selector of element which is moving (our cursor)
- clickableSelector : selector or selectors (separated by commas) which can be clicked
- gestureClickOn : turn on/off clicking by performing "key tap" gesture
- timeClickOn : turn on/off clicking by hovering cursor over element
- clickTimer : period (in ms) for performing click
- fps : refresh rate of cursor movement
- bottomPadding : length above senzor (in mm) of start working plain
- sideLength : length of square side (in mm) of working plain

Demo
----

Demo is available at http://kandosvk.github.io/leapmotion-CustomCursorControl.
Please note that demo is using [bootstrap](http://getbootstrap.com/) , aterrien/jQuery-Knob#1 .
