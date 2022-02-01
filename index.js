import moment from "moment";
import mqtt from "mqtt";

const str = "28/01/2022,17:10:17 10.0.254.251 TCP_MISS/200 GET https://securepubads.g.doubleclick.net/pcs/view?xai=AKAOjsspWoOztIFPP0Pg-qrie14fE_G092S7bdi7RDrtuWcWccpsaUaHDZG_eCr3FP6W4s7lTnPD6UzegvNSs86tCeMdzHHJXcUcMZTAV_VAOEbheluT9_sOQxkrLGIBlN2o1KsyRy2dFBIXRzee5qM34c_BMnfIXXQFzi-ImKdxm-OegAjDlMps8YxWMA3IWDwHrqUwDc6ABPY7-o3oHT6rNC-alZQf6yA16RVqS09CdWVFEBivtL6nu5dWR_wGjK9HBRpzWhbVO1AAxXAaMr_w6NGG3jIlu_UI_kj7mvYtqfbJbkfYoSm-u7TghSzxM3slHQv8AxE7lsBU2FIIiX2o8GUG1W6IQqYX5QcO5cLS&sai=AMfl-YS_m_LWTYX_qZrbQYXNmFN5bqOPA4KyVH2ePKiLzdX6NJ-Na_kFWM2HI3Okggit3CUPPpNsmg9CmwUH5mTqOX96jBbXqg6s9QCqkFKcUHms0xZ03udkGgrtpXhXKy75wGwX2-Tyd1C5-Nt9z5w&sig=Cg0ArKJSzO-n5kusfny0EAE&uach_m=[UACH]&urlfix=1&adurl=";
const mqttUrl = "mqtt://test.mosquitto.org";
const topic = "presence";

class Index {
    constructor(){
        this.mqttclient = null;

        let connect = {};
        connect.url = mqttUrl;
        if(typeof username != "undefined" && typeof password != "undefined"){
            connect.username = username;
            connect.password = password;
        }
        if(typeof topic != "undefined"){
            connect.topic = topic;
        }
        this.ConnectMQTT(connect);
    }
    ConnectMQTT(connect){
        let that = this;
        const client = mqtt.connect(connect.url, connect);
        client.on("connect", function(){
            client.subscribe(connect.topic, function(err){
                if(err){
                    console.log("Error subscribing to topic: " + err);
                    return
                }
                client.publish('presence', str)
            });
            client.on("message", function(topic, message){
                let obj = that.ParseString(message.toString());
                that.SubmitToServer(obj);
            });
        });
    }

    SubmitToServer(obj){
        console.log("Submitting to server")
    }
    ParseString(str){
        let parts = str.split(" ");
        let dateTime = parts[0];
        let ip_address = parts[1];
        let protocol = parts[2];
        let response_code = protocol.split("/")[1];
        let method = parts[3];
        let url = parts[4];
        let transport = url.split(":")[0];
        let domain = url.split("/")[2];
        //extract get parameters from url
        let getParams = url.split("?");
        let get_params = {};
        if(getParams[1]){
            let getParamsArray = getParams[1].split("&");
            for(let i = 0; i < getParamsArray.length; i++){
                let keyValue = getParamsArray[i].split("=");
                get_params[keyValue[0]] = keyValue[1];
            }
        }

        let path = url.replace(transport + "://", "").replace(domain, "").split("?")[0];
        let o = {
            raw: str,
            date: new moment(dateTime, "DD/MM/YYYY,HH:mm:ss").toISOString(),
            ip_address,
            protocol,
            method,
            url: url,
            transport,
            domain,
            path,
            response_code,
            get_params
        }
        return o
    }






}



var a = new Index();