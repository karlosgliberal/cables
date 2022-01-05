let inVibrate = op.inTriggerButton("Vibrate");
let outSupported = op.outValue("Supported");

navigator.vibrate = navigator.vibrate || navigator.webkitVibrate ||
navigator.mozVibrate || navigator.msVibrate;

if (navigator.vibrate) outSupported.set(true);
else outSupported.set(false);

inVibrate.onTriggered = function ()
{
    if (navigator.vibrate)
    {
        navigator.vibrate(1500);
    }
};

if (window.self !== window.top)
{
    op.setUiError("iframe", "Device Vibratge does not work in an iframe, open the patch without an iframe to get it to work", 1);
    op.warn("Device Vibratge does not work in an iframe, open the patch without an iframe to get it to work");
}
