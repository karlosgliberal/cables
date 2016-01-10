this.name='PointLight';
var cgl=this.patch.cgl;

var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var x=this.addInPort(new Port(this,"x",OP_PORT_TYPE_VALUE));
var y=this.addInPort(new Port(this,"y",OP_PORT_TYPE_VALUE));
var z=this.addInPort(new Port(this,"z",OP_PORT_TYPE_VALUE));


var r=this.addInPort(new Port(this,"r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var g=this.addInPort(new Port(this,"g",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=this.addInPort(new Port(this,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));

r.set(1);
g.set(1);
b.set(1);

exe.onTriggered=function()
{
    if(!cgl.frameStore.phong)cgl.frameStore.phong={};
    if(!cgl.frameStore.phong.lights)cgl.frameStore.phong.lights=[];
    cgl.frameStore.phong.lights[0]={};
    cgl.frameStore.phong.lights[0].pos=[
        x.get(),
        y.get(),
        z.get(),
    ];

    cgl.frameStore.phong.lights[0].color=[
        r.get(),
        g.get(),
        b.get(),
        ];

    trigger.trigger();
};
