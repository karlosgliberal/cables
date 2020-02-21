const
    mulAxis=op.inValue("Mul Orientation",1),
    axis1=op.outValue("Orientation Alpha"),
    axis2=op.outValue("Orientation Beta"),
    axis3=op.outValue("Orientation Gamma"),
    accX=op.outValue("Acceleration X"),
    accY=op.outValue("Acceleration Y"),
    accZ=op.outValue("Acceleration Z"),
    req=op.inTrigger("Request Permissions"),
    accNoGravX=op.outValue("Acceleration X no gravity"),
    accNoGravY=op.outValue("Acceleration Y no gravity"),
    accNoGravZ=op.outValue("Acceleration Z no gravity"),
    outObj=op.outObject("Object");

var lastTime=0;
var lastTimeAcc=0;
var obj={};

function handleDeviceMotion (event)
{
    if(CABLES.now()-lastTimeAcc>15)
    {
        lastTimeAcc=CABLES.now();
        accX.set( event.accelerationIncludingGravity.x || 0);
        accY.set( event.accelerationIncludingGravity.y || 0 );
        accZ.set( event.accelerationIncludingGravity.z || 0 );

        accNoGravX.set( event.acceleration.x || 0);
        accNoGravY.set( event.acceleration.y || 0 );
        accNoGravZ.set( event.acceleration.z || 0 );

        obj.AccelerationX=accX.get();
        obj.AccelerationY=accY.get();
        obj.AccelerationZ=accZ.get();

        outObj.set(null);
        outObj.set(obj);
    }

};

function handleDeviceOrientation (event)
{
    if(CABLES.now()-lastTime>15)
    {
        lastTime=CABLES.now();
        axis1.set( (event.alpha || 0) *mulAxis.get() );
        axis2.set( (event.beta || 0 ) *mulAxis.get() );
        axis3.set( (event.gamma || 0) *mulAxis.get() );

        obj.OrientationAlpha=axis1.get();
        obj.OrientationBeta=axis2.get();
        obj.OrientationGamma=axis3.get();

        outObj.set(null);
        outObj.set(obj);

    }
};

req.onTriggered=function()
{
    if(DeviceMotionEvent && DeviceMotionEvent.requestPermission)
    {
        DeviceMotionEvent.requestPermission()
            .then(response =>
            {
                if (response == 'granted')
                {
                    window.addEventListener("devicemotion",handleDeviceMotion, true);
                }
            })
            .catch(console.error);


        DeviceOrientationEvent.requestPermission()
            .then(response =>
            {
                if (response == 'granted')
                {
                    window.addEventListener("deviceorientation", handleDeviceOrientation, true);
                }
            })
            .catch(console.error);
    }
    else
    {
        window.addEventListener("devicemotion",handleDeviceMotion, true);
        window.addEventListener("deviceorientation", handleDeviceOrientation, true);
    }
}


