op.name="AutoFilter";

CABLES.WebAudio.createAudioContext(op);

// TODO: Add filter / filter-op needed?

// vars
var node = new Tone.AutoFilter("4n").start(); // TODO: create start / stop nodes!?

// default values
var DEPTH_DEFAULT = 1;
var DEPTH_MIN = 0;
var DEPTH_MAX = 1;
var FREQUENCY_DEFAULT = 200;
var OSCILLATOR_TYPES = ["sine", "square", "triangle", "sawtooth"];
var MIN_DEFAULT = 100; // ??
var OCTAVES_DEFAULT = 2.6;
var OCTAVES_MIN = -1;
var OCTAVES_MAX = 10;
var WET_DEFAULT = 1.0;
var WET_MIN = 0.0;
var WET_MAX = 1.0;

// input ports
var audioInPort = CABLES.WebAudio.createAudioInPort(op, "Audio In", node);
var depthPort = CABLES.WebAudio.createAudioParamInPort(op, "Depth", node.depth, {"display": "range", "min": DEPTH_MIN, "max": DEPTH_MAX}, DEPTH_DEFAULT);
var frequencyPort = CABLES.WebAudio.createAudioParamInPort(op, "Frequency", node.frequency, null, FREQUENCY_DEFAULT);
//var filterPort = op.inObject("Filter");
var typePort = this.addInPort( new Port( op, "Type", OP_PORT_TYPE_VALUE, { display: 'dropdown', values: OSCILLATOR_TYPES }, OSCILLATOR_TYPES[0] ) );
typePort.set(OSCILLATOR_TYPES[0]);
var minPort = op.inValue("Min", MIN_DEFAULT);
var octavesPort = op.inValue("Octaves", OCTAVES_DEFAULT);
var wetPort = CABLES.WebAudio.createAudioParamInPort(op, "Wet", node.wet, {"display": "range", "min": WET_MIN, "max": WET_MAX}, WET_DEFAULT);

// change listeners
minPort.onChange = function() {
    node.set("min", minPort.get());
};

octavesPort.onChange = function() {
    var octaves = octavesPort.get();
    if(octaves) {
        octaves = Math.round(parseFloat(octaves));
        if(octaves && octaves >= OCTAVES_MIN && octaves <= OCTAVES_MAX) {
            node.set("octaves", octaves);    
        }
    }
};

typePort.onChange = function() {
    node.set("type", typePort.get());
};

// output ports
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", node);

