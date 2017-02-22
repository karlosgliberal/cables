op.name="PointCollectorCollect";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;

render.onTriggered=function()
{
    if(!cgl.frameStore.SplinePoints)return;
    var pos=[0,0,0];
    vec3.transformMat4(pos, [0,0,0], cgl.mvMatrix);

cgl.frameStore.SplinePoints[cgl.frameStore.SplinePointCounter+0]=pos[0];
cgl.frameStore.SplinePoints[cgl.frameStore.SplinePointCounter+1]=pos[1];
cgl.frameStore.SplinePoints[cgl.frameStore.SplinePointCounter+2]=pos[2];

cgl.frameStore.SplinePointCounter+=3;

    trigger.trigger();
};
