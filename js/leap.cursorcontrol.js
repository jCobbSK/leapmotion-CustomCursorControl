/**
 * @class HandleBox
 * 
 * Class for interacting with webpage with various controllers (leapmotion implemented)
 * 
 * @constructor
 * 
 * @param {associative array} settings -- movementType, cursorSensitivity
 */
LeapmotionCursorControl = {};

LeapmotionCursorControl.LeapControl = function(controller, settings, timeClickCallback){
	this.controller = controller;
	if(typeof settings != 'undefined'){
		this.cursorSelector = settings.cursorSelector || "#cursor";
		this.clickableSelector = settings.clickableSelector || ".clickable";
		this.sideLength = settings.sideLength || 150;
		this.bottomPadding = settings.bottomPadding || 100;
		this.clickTimer = settings.clickTimer || 2000;
		this.fps = settings.fps || 60;
		this.timeClickOn = settings.timeClickOn || "true";
		this.gestureClickOn = settings.gestureClickOn || "true";
	}
	if(typeof timeClickCallback != 'undefined')
		_timeClickElapsed = timeClickCallback;
	
};

LeapmotionCursorControl.LeapControl.prototype = {
	
	/**
	 * Main controller
	 * @type{Leap.Controller} controller
	 */
	controller : null,
	
	/**
	 * Selector of cursor div
	 * @type{string}
	 */
	cursorSelector : "#cursor",
	
	/**
	 * selector for clickable elements (e.q. "#clickable", "#clickable, .click")
	 * @type{string}
	 */
	clickableSelector : ".clickable",
	
	/**
	 * FPS count of moving cursor because sensor can send up to 200 fps
	 * @type{int}
	 */
	fps : 60,
	
	/**
	 * length of side (in milimeters) of virtual work plain over the senzor
	 * @type{int}
	 */
	sideLength : 150,
	
	/**
	 * Padding above cursor for virtual work plain
	 * @type{int}
	 */
	bottomPadding : 100,
	
	/**
	 * Time in miliseconds needed over single .clickable element to trigger click
	 * @type{number}
	 */
	clickTimer : 2000,
	
	/**
	 * Bool if gesture click is turn on
	 * @type{boolean}
	 */
	gestureClickOn : "true",
	
	/**
	 * Bool if time click is turn on
	 * @type{boolean}
	 */
	timeClickOn : "true",
	
	/**
	 * Timestamp of last move of cursor (for using fps)
	 * @type{Date}
	 * @private
	 */
	_lastMove : new Date(),
	
	/**
	 * Last leading pointer id
	 * @type{string}
	 * @private
	 */
	_lastPointerId : -1,
	
	/**
	 * Function get by user in constructor which we call with % amount of time for click
	 * @type{function}
	 * @private
	 */
	_timeClickElapsed : null,
	
	/**
	 * Last element .clickable which was cursor near by
	 * @type{element}
	 */
	_lastNearestElement : null,
	
	/**
	 * Time when change of nearest element occur
	 * @type{Date}
	 */
	_lastChangeOfNearestElem : new Date(),
	
	/**
	 * Method for moving cursor defined by vector and chosen type of @attrb movementType,
	 * its moving DOM element with id "cursor"  
 	 * @param {Vector} vector of movement
 	 * @return {number[]} x,y position of center of cursor in pixels
	 */
	moveCursor : function(pos){
		
		$(this.cursorSelector).css({"bottom":pos.y,"left":pos.x});	
	},
	
	/**
	 * Method responsible for time clicking if is cursor hover over .clickable element
	 */
	timeClickHandle : function(_x,_y){
		var newNearest = $.touching({x:_x,y:_y},this.clickableSelector);
		if(newNearest.attr("id") === undefined)
		{
			this.clickTime(-1,"undefined");
			this._lastNearestElement = null;
			return;
		}
		if(this._lastNearestElement == null)
		{
			this._lastNearestElement = newNearest;
			this._lastChangeOfNearestElem = new Date().getTime();
		}
		else
		{
			if(this._lastNearestElement.attr("id") == newNearest.attr("id")){
				var percentTimer = (new Date().getTime() - this._lastChangeOfNearestElem)/this.clickTimer*100;
				if(percentTimer >= 100){
					this._clickCursor(_x,_y);
					this._lastNearestElement = null;
					return;
				}
				this.clickTime(percentTimer,this._lastNearestElement.attr("id"));
			}else{
				this._lastChangeOfNearestElem = new Date().getTime();
				this._lastNearestElement = newNearest;
			}
		}
	},
	
	/**
	 * Transform senzor position to window position
	 * @param{Vector} vector
	 * @return{numbers[]} x,y
	 */
	transformPosition : function(vector){
		return {x : ((vector[0]+this.sideLength)/(this.sideLength*2))*($(window).width()),
				y : ((vector[1]-this.bottomPadding)/(this.sideLength*2))*($(window).height())
		};
	},
	
	/**
	 * Check gestures with leap SDK based gesture recognition
	 * @param {leapjs.frame} frame
	 * @private
	 */
	_gestureSearcher : function(frame){
		var pos,width,height;
		for(var i=0;i<frame.gestures.length;i++){
			if(frame.gestures[i].type == "keyTap")
			{
				//find out where was cursor when event started by checking stored old frames
				var ff = this._getOldFrame(frame.timestamp,frame.gestures[i].duration);
				if(ff != null){
					pos = this.transformPosition(ff.pointable(this._lastPointerId).stabilizedTipPosition);
					width = parseInt($(this.cursorSelector).css("width"));
					height = parseInt($(this.cursorSelector).css("height"));
					this._clickCursor(pos.x+width/2,$(window).height()-pos.y-height/2);
				}
			}
		}
	},
	
	/**
	 * Look up for old frames from controller's pool
	 * @param{timestamp} currentTime
	 * @param{number} timeAgo how many microseconds ago we want our frame (currentTime - timeAgo)
	 * @return{Leap.Frame} the most close frame to our time destination
	 * @private
	 */
	_getOldFrame : function(currentTime,timeAgo){
		var i=0;
		var frame;
		var targetTime = currentTime - timeAgo;
		while((frame=this.controller.frame(i)) != Leap.Frame.Invalid){
			i++;
			if(Math.abs(frame.timestamp-targetTime) <= 10){
				return frame;
			}
		}
		return null;
	},
	
	/**
	 * Click on position with coords in pixels relative to monitor (must be some clickable element)
	 * @param{number} _x
	 * @param{number} _y 
	 * @private
	 */
	_clickCursor : function(_x,_y){
		$($.nearest({x:_x,y:_y},$(this.clickableSelector))).trigger("click");
	},
	
	/**
	 * Method which handle all actions needed to do with frame (leapmotion)
	 * 
	 * @param {leapjs.Frame} frame from leapmotion controller loop
	 */
	leapFrameHandler : function(frame){
		//discard invalid frame
		if(frame == Leap.Frame.Invalid)
			return;
			
		//if we havent control point or id has been removed
		if(this._lastPointerId == -1 || frame.pointable(this._lastPointerId)==Leap.Pointable.Invalid)
			this._lastPointerId = this._findControlPoint(frame);
		
		//check for fps and move cursor
		if(((new Date().getTime() - this._lastMove.getTime()) >= 1000/this.fps)	&& (this._lastPointerId != -1))
		{
			var pos = this.transformPosition(frame.pointable(this._lastPointerId).stabilizedTipPosition);
			this.moveCursor(pos);
			if(this.timeClickOn == "true"){
				var centerX = pos.x + parseInt($(this.cursorSelector).css("width"))/2;
				var centerY = $(window).height()-pos.y-(parseInt($(this.cursorSelector).css("height"))/2);
				this.timeClickHandle(centerX,centerY);
			}	
			this._lastMove = new Date();
		}
		
		//look for gestures
		if(frame != null && frame != Leap.Frame.Invalid && this.gestureClickOn=="true")
			this._gestureSearcher(frame);
	},
	
	/**
	 * Find closest point to monitor from frame
	 * @param{leapjs.Frame} frame
	 * @return{string} id of finded pointable if not return -1
	 * @private
	 */ 
	 _findControlPoint : function(frame){
	 	var tools = frame.pointables;
		var point = 1000; // init value for finding minimum
		var vector = null;
		var pointable = null;
		for(var i=0;i<tools.length;i++){
			if(tools[i].stabilizedTipPosition[2] < point)
			{
				point = tools[i].stabilizedTipPosition[2];
				vector = tools[i].stabilizedTipPosition;
				pointable = tools[i];
			}
		}
		return (pointable==null)?-1:pointable.id;
	 },
	 
	 /**
	  * Send % part of clickTime when cursor is over same clickable element
	  * @param{number} % number of time on same element from 
	  * @return calling callback with % amount
	  */
	 clickTime : function(timeOnElement, id){
	 	_timeClickElapsed(timeOnElement,id);
	 }
};


