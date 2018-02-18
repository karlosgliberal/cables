var cgl=this.patch.cgl;

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var m=mat4.create();
var matrix=this.addInPort(new Port(this,"matrix",OP_PORT_TYPE_ARRAY));

render.onTriggered=function()
{
    cgl.pushViewMatrix();
    mat4.multiply(cgl.vMatrix,cgl.vMatrix,matrix.get());

    trigger.trigger();
    cgl.popViewMatrix();
};

matrix.set( [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] );
