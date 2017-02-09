op.name="Lfo";

CABLES.WebAudio.createAudioContext(op);

// TODO:
// - Add units?
// - Support Frequency as "C4"?

// defaults
var TYPES = ["sine", "square", "triangle", "sawtooth"];
var NORMAL_RANGE_MIN = 0;
var NORMAL_RANGE_MAX = 1;

var FREQUENCY_DEFAULT = 440;
var AMPLITUDE_DEFAULT = 1.0;
var MIN_DEFAULT = 300;
var MAX_DEFAULT = 700;
var TYPE_DEFAULT = "sine";
var PHASE_DEFAULT = 0;
var PHASE_MIN = 0;
var PHASE_MAX = 180;
var MUTE_DEFAULT = false;
var DETUNE_DEFAULT = 0;
var VOLUME_DEFAULT = -6;
var VOLUME_MIN = -100;
var VOLUME_MAX = 0;

// vars
var node = new Tone.LFO(FREQUENCY_DEFAULT, MIN_DEFAULT, MAX_DEFAULT).start();

// input ports
var frequencyPort = CABLES.WebAudio.createAudioParamInPort(op, "Frequency", node.frequency, null, FREQUENCY_DEFAULT);
var amplitudePort = CABLES.WebAudio.createAudioParamInPort(op, "Amplitude", node.amplitude, AMPLITUDE_DEFAULT);
var minPort = op.inValue("Min", MIN_DEFAULT);
var maxPort = op.inValue("Max", MAX_DEFAULT);
var typePort = op.addInPort( new Port( op, "Type", OP_PORT_TYPE_VALUE, { display: 'dropdown', values: TYPES } ) );
typePort.set("sine");
var phasePort = op.addInPort( new Port( op, "Phase", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': PHASE_MIN, 'max': PHASE_MAX }, PHASE_DEFAULT ));
phasePort.set(PHASE_DEFAULT);
var detunePort = CABLES.WebAudio.createAudioParamInPort(op, "Detune", node.detune, null, DETUNE_DEFAULT);
var volumePort = CABLES.WebAudio.createAudioParamInPort(op, "Volume", node.volume, {'display': 'range', 'min': VOLUME_MIN, 'max': VOLUME_MAX}, VOLUME_DEFAULT);
var mutePort = op.addInPort( new Port( op, "Mute", OP_PORT_TYPE_VALUE, { display: 'bool' } ) );
mutePort.set(false);

// change listeners
minPort.onChange = function() {setNodeValue("min", minPort.get());};
maxPort.onChange = function() {setNodeValue("max", maxPort.get());};
typePort.onChange = function() {setNodeValue("type", typePort.get());};
phasePort.onChange = function() {setNodeValue("phase", phasePort.get());};
mutePort.onChange = function() {setNodeValue("mute", mutePort.get());};


// functions
function setNodeValue(key, value) {
    op.log("setting key: ", key, " to value: ", value);
    node.set(key, value);
}

// output ports
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", node);