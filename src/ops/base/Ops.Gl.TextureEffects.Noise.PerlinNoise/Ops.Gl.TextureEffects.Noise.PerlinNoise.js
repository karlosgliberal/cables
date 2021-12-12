const
    render = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    inMode = op.inSwitch("Color", ["Mono", "RGB"], "Mono"),
    scale = op.inValue("Scale", 22),
    rangeMul = op.inValue("Multiply", 1),
    x = op.inValue("X", 0),
    y = op.inValue("Y", 0),
    z = op.inValue("Z", 0),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "perlinnoise");

op.setPortGroup("Position", [x, y, z]);

shader.setSource(shader.getDefaultVertexShader(), attachments.perlinnoise3d_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    textureUniformOffZ = new CGL.Uniform(shader, "t", "texOffsetZ", 1),

    uniZ = new CGL.Uniform(shader, "f", "z", z),
    uniX = new CGL.Uniform(shader, "f", "x", x),
    uniY = new CGL.Uniform(shader, "f", "y", y),
    uniScale = new CGL.Uniform(shader, "f", "scale", scale),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    rangeMulUniform = new CGL.Uniform(shader, "f", "rangeMul", rangeMul);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

// offsetMap

const
    inTexOffsetZ = op.inTexture("Offset"),
    inOffsetMul = op.inFloat("Offset Multiply", 1),
    offsetX = op.inSwitch("Offset X", ["None", "R", "G", "B"], "None"),
    offsetY = op.inSwitch("Offset Y", ["None", "R", "G", "B"], "None"),
    offsetZ = op.inSwitch("Offset Z", ["None", "R", "G", "B"], "R");

op.setPortGroup("Offset Map", [inTexOffsetZ, offsetZ, offsetY, offsetX, inOffsetMul]);

const uniOffMul = new CGL.Uniform(shader, "f", "offMul", inOffsetMul);

offsetX.onChange =
offsetY.onChange =
offsetZ.onChange =
inTexOffsetZ.onChange = () =>
{
    shader.toggleDefine("HAS_TEX_OFFSETMAP", inTexOffsetZ.get());

    shader.toggleDefine("OFFSET_X_R", offsetX.get() == "R");
    shader.toggleDefine("OFFSET_X_G", offsetX.get() == "G");
    shader.toggleDefine("OFFSET_X_B", offsetX.get() == "B");

    shader.toggleDefine("OFFSET_Y_R", offsetY.get() == "R");
    shader.toggleDefine("OFFSET_Y_G", offsetY.get() == "G");
    shader.toggleDefine("OFFSET_Y_B", offsetY.get() == "B");

    shader.toggleDefine("OFFSET_Z_R", offsetZ.get() == "R");
    shader.toggleDefine("OFFSET_Z_G", offsetZ.get() == "G");
    shader.toggleDefine("OFFSET_Z_B", offsetZ.get() == "B");

    offsetX.setUiAttribs({ "greyout": !inTexOffsetZ.isLinked() });
    offsetY.setUiAttribs({ "greyout": !inTexOffsetZ.isLinked() });
    offsetZ.setUiAttribs({ "greyout": !inTexOffsetZ.isLinked() });
    inOffsetMul.setUiAttribs({ "greyout": !inTexOffsetZ.isLinked() });
};

// end offsetmap

inMode.onChange = () =>
{
    shader.toggleDefine("RGB", inMode.get() == "RGB");
};

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    if (inTexOffsetZ.get()) cgl.setTexture(1, inTexOffsetZ.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
