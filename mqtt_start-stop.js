class MqttClient {
  constructor() {
    this.mqttClient = null;
    this.config = {
      host: "ws://broker.emqx.io:8083/mqtt",
      clientId: "client" + Math.random().toString(36).substring(7),
      options: {
        keepalive: 60,
        protocolId: "MQTT",
        protocolVersion: 4,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000,
      },
    };
    this.connectToBroker();
    this.subscribeToTopic();
  }

  connectToBroker() {
    this.mqttClient = mqtt.connect(this.config.host, this.config.options);

    this.mqttClient.on("error", (err) => {
      console.log("Error: ", err);
      this.mqttClient.end();
    });

    this.mqttClient.on("reconnect", () => {
      console.log("Reconnecting...");
    });

    this.mqttClient.on("connect", () => {
      console.log("Client connected:" + this.config.clientId);
    });

    this.mqttClient.on("message", this.handleMessage.bind(this));

    this.setupButtons();
  }

  setupButtons() {
    const startBtn = document.getElementById("startButton");
    const stopBtn = document.getElementById("stopButton");

    startBtn.addEventListener("click", () => {
      this.publishMessage("startProcess", "0");
      this.publishMessage("robotInChargingPos", "True"); // test value
      this.publishMessage("systemStatus", "250"); // test value
    });
    stopBtn.addEventListener("click", () => {
      this.publishMessage("endProcess", "1");
      this.publishMessage("robotOK", "True"); // test value
      this.publishMessage("systemStatus", "250"); // test value
    });
  }

  publishMessage(topic, message) {
    console.log(`Sending Topic: ${topic}, Message: ${message}`);
    this.mqttClient.publish(topic, message, {
      qos: 2,
      retain: false,
    });
  }

  handleMessage(topic, message, packet) {
    console.log(
      "Received Message: " + message.toString() + "\nOn topic: " + topic
    );
    const messageTextArea = document.querySelector("#message");
    messageTextArea.value += topic +", "+ message + "\r\n";

    // const msgConfirmation = document.querySelector(".status");
    if (topic.toString() == "startProcess") {
      document.getElementById("statStartProcess").value = "Topic startProcess: " + message;
      document.getElementById("statEndProcess").value = "Topic endProcess:";
    }
    if (topic.toString() == "robotOK") {
      document.getElementById("statRobotOK").value = "Topic robotOK: " + message;
      document.getElementById("statRobotInChargingPos").value = "Topic RobotInChargingPos:";
    }
    if (topic.toString() == "robotInChargingPos") {
      document.getElementById("statRobotInChargingPos").value = "Topic RobotInChargingPos: " + message;
      document.getElementById("statRobotOK").value = "Topic robotOK:";
    }
    if (topic.toString() == "endProcess") {
      document.getElementById("statEndProcess").value = "Topic endProcess: " + message;
      document.getElementById("statStartProcess").value = "Topic startProcess:";
    }
    if (topic.toString() == "systemStatus") {
      document.getElementById("statSystemStatus").value = "Topic systemStatus: " + message;
    }
  }

  subscribeToTopic() {
  this.mqttClient.subscribe("robotOK", { qos: 2 }); 
  this.mqttClient.subscribe("robotInChargingPos", { qos: 2 });
  this.mqttClient.subscribe("systemStatus", { qos: 2 });
  
  this.mqttClient.subscribe("startProcess", { qos: 2 });
  this.mqttClient.subscribe("endProcess", { qos: 2 });
  }
}

  let mqttt = new MqttClient();