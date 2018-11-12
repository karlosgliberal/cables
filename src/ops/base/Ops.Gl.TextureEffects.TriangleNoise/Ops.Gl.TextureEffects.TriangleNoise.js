const render=op.inTrigger("Render");
const blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const amount=op.inValueSlider("Amount",1);
const scale=op.inValue("scale",10);
const angle=op.inValue("angle");
const add=op.inValue("Add");
const trigger=op.outTrigger("Next");
const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

const srcFrag=(attachments.trianglenoise_frag||'').replace("{{BLENDCODE}}",CGL.TextureEffect.getBlendCode());
shader.setSource(shader.getDefaultVertexShader(),srcFrag);

const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const amountUniform=new CGL.Uniform(shader,'f','amount',amount);
const addUniform=new CGL.Uniform(shader,'f','add',add);
const scaleUniform=new CGL.Uniform(shader,'f','scale',scale);
const angleUniform=new CGL.Uniform(shader,'f','angle',angle);
const ratioUniform=new CGL.Uniform(shader,'f','ratio',0.57);

var oldRatio=-1;

blendMode.onChange=function()
{
    CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
};

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    var ratio=cgl.canvasHeight/cgl.canvasWidth;
    if(ratio!=oldRatio)
    {
        ratioUniform.setValue(ratio);
        oldRatio=ratio;
    }

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};

