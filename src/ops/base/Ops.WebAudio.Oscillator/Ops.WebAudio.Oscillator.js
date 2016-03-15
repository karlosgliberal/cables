this.name='Oscillator';

if(!window.audioContext){ audioContext = new AudioContext(); }

var oscillator = audioContext.createOscillator();
oscillator.start(0);

oscillator.frequency.value = 200;

function updateFrequency()
{
    oscillator.frequency.value=frequency.get();
}

function updateType()
{
    oscillator.type=type.get();
}


var type=this.addInPort(new Port(this,"type",OP_PORT_TYPE_VALUE,{display:'dropdown',values:[ 'sine','square','sawtooth','triangle' ]}));
type.set('sawtooth');
type.onValueChange(updateType);

var frequency=this.addInPort(new Port(this,"frequency",OP_PORT_TYPE_VALUE));
frequency.onValueChange(updateFrequency);

var audioOut=this.addOutPort(new Port(this, "audio out",OP_PORT_TYPE_OBJECT));
audioOut.set( oscillator );

frequency.set(200);
