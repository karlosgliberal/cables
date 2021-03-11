const inTrigger = op.inTrigger("send");
const inSocket = op.inObject("socket", null, "socketcluster");
const inTopic = op.inString("topic", "main");
const inData = op.inBool("data");
const inDelay = op.inInt("delay (ms)", 0);

const send = () =>
{
    const socket = inSocket.get();
    if (socket && socket.channelName && socket.allowSend)
    {
        const payload = { "topic": inTopic.get(), "clientId": socket.clientId, "payload": inData.get() };
        let delay = 0;
        const localDelay = inDelay.get();
        if (inDelay.get() > 0 || socket.globalDelay > 0)
        {
            delay = socket.globalDelay;
            if (localDelay)
            {
                delay = localDelay;
            }
        }
        setTimeout(() =>
        {
            socket.transmitPublish(socket.channelName + "/booleans", payload);
        }, delay);
    }
};

inTrigger.onTriggered = send;
