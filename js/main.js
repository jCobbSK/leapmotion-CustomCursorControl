
/**
 * @class
 * Basic class for handling events
 */
var HANDLER = function(){}
/**
 * Method for handling click on buttons
 * @param {Object} elem
 */
HANDLER.click = function(elem){
	elem.addClass("btn-success");
}
/**
 * Method for generating buttons
 * @param {Object} containerSelector
 * @param {Object} number
 */
HANDLER.generateButtons = function(containerSelector, number){
	for(var i=0;i<number;i++)
		$(containerSelector).append("<div class='btn clickabl' id='button"+i+"' onclick='HANDLER.click($(this))' style='margin:10px 10px 10px 10px;'>"+i+"</div>");
}



$(document).ready(function(){
	
	HANDLER.generateButtons("#workplace",300);
	
	$(".knob").knob();
	
	//leap motion init
	var controller = new Leap.Controller({enableGestures:true});
	var hbox = new LeapmotionCursorControl.LeapControl(controller,
		{cursorSelector:"#kurzor",clickableSelector:".clickabl",clickTimer:1000,gestureClickOn:"true"},
		function(percentage,id){
			if(percentage != -1)
			{
				$("#cursor-input").val(percentage).trigger("change");
			}
			else
			{
				$("#cursor-input").val(0).trigger("change");
			}
			
		});
	controller.on('connect',function(){
		controller.loop(function(frame){
			hbox.leapFrameHandler(frame);
		});
	});
	
	controller.connect();
});
