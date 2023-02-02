const
    cgl = op.patch.cgl,
    pUpdate = op.inTrigger("update"),
    // inNormalize = op.inSwitch("Coordinate", ["Pixel", "Normalized"], "Pixel"),
    inX = op.inInt("X", 0),
    inY = op.inInt("Y", 0),
    tex = op.inTexture("texture"),
    outTrigger = op.outTrigger("trigger"),
    outR = op.outNumber("Red"),
    outG = op.outNumber("Green"),
    outB = op.outNumber("Blue"),
    outA = op.outNumber("Alpha");

let
    pbo = null,
    fb = null,
    pixelData = null,
    wasTriggered = true,
    texChanged = false;

tex.onChange = function () { texChanged = true; };

let isFloatingPoint = false;
let channelType = op.patch.cgl.gl.UNSIGNED_BYTE;

function fence()
{
    return new Promise(function (resolve)
    {
        const gl = op.patch.cgl.gl;
        let sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush(); // Ensure the fence is submitted.
        function check()
        {
            let status = gl.getSyncParameter(sync, gl.SYNC_STATUS);
            if (status == gl.SIGNALED)
            {
                gl.deleteSync(sync);
                resolve();
            }
            else
            {
                setTimeout(check, 0);
            }
        }

        setTimeout(check, 0);
    });
}

op.patch.cgl.on("endframe", () =>
{
    if (!wasTriggered) return;

    const gl = cgl.gl;

    fence().then(function ()
    {
        if (!pbo)
        {
            pbo = gl.createBuffer();
            gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pbo);
            gl.bufferData(gl.PIXEL_PACK_BUFFER, 4 * 4, gl.DYNAMIC_READ);
            gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
        }

        let starttime = performance.now();
        wasTriggered = false;

        if (isFloatingPoint) channelType = gl.FLOAT;
        else channelType = gl.UNSIGNED_BYTE;

        const size = 4 * 4;
        if (!pixelData)
            if (isFloatingPoint) pixelData = new Float32Array(size);
            else pixelData = new Uint8Array(size);

        texChanged = false;
        // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        // }

        // gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

        // gl.bindFramebuffer(gl.GL_PIXEL_PACK_BUFFER, fb);

        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pbo);
        //   gl.readPixels(mouse.x, pickingTexture.height - mouse.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, 0);

        gl.readPixels(
            inX.get(), inY.get(),
            1, 1,
            gl.RGBA,
            channelType,
            0
        );

        gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, pixelData);
        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        // gl.bindFramebuffer(gl.GL_PIXEL_PACK_BUFFER, null);

        if (isFloatingPoint)
        {
            outR.set(pixelData[0]);
            outG.set(pixelData[1]);
            outB.set(pixelData[2]);
            outA.set(pixelData[3]);
        }
        else
        {
            outR.set(pixelData[0] / 255);
            outG.set(pixelData[1] / 255);
            outB.set(pixelData[2] / 255);
            outA.set(pixelData[3] / 255);
        }

        // console.log(Math.round(performance.now()-starttime ));
    });
});

pUpdate.onTriggered = function ()
{
    wasTriggered = true;

    // gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    const realTexture = tex.get();
    const gl = cgl.gl;

    if (!realTexture) return;
    if (!fb) fb = gl.createFramebuffer();
    isFloatingPoint = realTexture.textureType == CGL.Texture.TYPE_FLOAT;

    // if (texChanged)
    // {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D, realTexture.tex, 0
    );

    // gl.readPixels(
    //     inX.get(), inY.get(),
    //     1, 1,
    //     gl.RGBA,
    //     channelType,
    //     pixelData
    // );

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    outTrigger.trigger();
};
