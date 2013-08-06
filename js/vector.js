var Vector3d = function(x,y,z){
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
};

Vector3d.prototype = {
	toString : function(){
		return "["+this.x+","+this.y+","+this.z+"]";
	},
	randomize : function(){
		this.x = (Math.random() <= 0.5)?Math.random():Math.random()*-1;
		this.y = (Math.random() <= 0.5)?Math.random():Math.random()*-1;
		this.z = (Math.random() <= 0.5)?Math.random():Math.random()*-1;
	}
}
