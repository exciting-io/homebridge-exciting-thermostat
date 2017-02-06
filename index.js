var request = require("request");
var Service, Characteristic;

module.exports = function(homebridge){
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-exciting-thermostat", "Heating", HeatingAccessory);
}

function HeatingAccessory(log, config) {
  this.log = log;

  // url info
  this.ip_address  = config["ip_address"];
  this.username    = config["username"];
  this.password    = config["password"];
  this.name        = config["name"];
}

HeatingAccessory.prototype = {

  httpRequest: function(url, method, callback) {
    request({
      url: "http://" + this.ip_address + "/thermostats/1.json",
      method: method,
      'auth': { 'username': this.username, 'password': this.password }
    },
    function (error, response, body) {

      var data = JSON.parse(body);

      callback(error, response, data)
    })
  },

  getCurrentHeatingCoolingState: function(callback) {
    this.log("getCurrentHeatingCoolingState");

    //Characteristic.CurrentHeatingCoolingState.OFF = 0;
    //Characteristic.CurrentHeatingCoolingState.HEAT = 1;
    //Characteristic.CurrentHeatingCoolingState.COOL = 2;

    this.httpRequest("http://" + this.ip_address + "/thermostats/1.json", "GET", function(error, response, data) {
      if (error) {
        this.log('getTargetTemperature: %s', error);
        callback(error);
      }
      else {
        this.log('getTargetTemperature succeeded!');
        var m = data["mode"];
        var mode;

        if( m == "cool" ){
          mode = Characteristic.CurrentHeatingCoolingState.COOL;
        }else if( m == "heat" ){
          mode = Characteristic.CurrentHeatingCoolingState.HEAT;
        }else{
          mode = Characteristic.CurrentHeatingCoolingState.OFF;
        }

        callback(null, mode);
      }
    }.bind(this));
  },

  setTargetHeatingCoolingState: function(targetHeatingCoolingState, callback){
    //Do something

    callback(null);//No error
  },

  getTargetHeatingCoolingState: function(callback){
    this.log("getTargetHeatingCoolingState");

    this.httpRequest("http://" + this.ip_address + "/thermostats/1.json", "GET", function(error, response, data) {
      if (error) {
        this.log('getTargetTemperature: %s', error);
        callback(error);
      }
      else {
        this.log('getTargetTemperature succeeded!');
        var m = data["mode"];
        var mode;

        if( m == "cool" ){
          mode = Characteristic.CurrentHeatingCoolingState.COOL;
        }else if( m == "heat" ){
          mode = Characteristic.CurrentHeatingCoolingState.HEAT;
        }else{
          mode = Characteristic.CurrentHeatingCoolingState.OFF;
        }

        callback(null, mode);
      }
    }.bind(this));
  },

  getCurrentTemperature: function(callback) {
    this.log("getCurrentTemperature");

    this.httpRequest("http://" + this.ip_address + "/thermostats/1.json", "GET", function(error, response, data) {
      if (error) {
        this.log('getCurrentTemperature: %s', error);
        callback(error);
      }
      else {
        this.log('getCurrentTemperature succeeded!');

        var c = data["current_temperature"];

	this.log('data: ', JSON.stringify(data));
        callback(null, c);
      }
    }.bind(this));
  },

  getTargetTemperature: function(callback) {
    this.log("getTargetTemperature");

    this.httpRequest("http://" + this.ip_address + "/thermostats/1.json", "GET", function(error, response, data) {
      if (error) {
        this.log('getTargetTemperature: %s', error);
        callback(error);
      }
      else {
        this.log('getTargetTemperature succeeded!');
        var c = data["target_temperature"];

        callback(null, c);
      }
    }.bind(this));
  },

  setTargetTemperature: function(targetTemperature, callback){
    this.log("setTargetTemperature");
    this.log(targetTemperature);

    request({
      url: "http://" + this.ip_address + "/thermostats/1",
      method: "PATCH",
      'auth': { 'username': this.username, 'password': this.password },
      form: { "override_value":'0.25', "thermostat[override_target_temperature]" : targetTemperature, "thermostat[override_hysteresis]" : "1.0", "thermostat[override_mode]" : "override_mode_cool" }
    },
    function (error, response, body) {
      //var data = JSON.parse(body);
      callback(null);//No error
    })
  },

  getTemperatureDisplayUnits: function(callback) {
    this.log("getTemperatureDisplayUnits");

    callback(null, Characteristic.TemperatureDisplayUnits.CELSIUS);
  },

  setTemperatureDisplayUnits: function(displayUnits, callback){
    this.log("setTemperatureDisplayUnits");
    this.log(displayUnits);

    callback(null);//No error
  },

  getName: function(callback) {
    this.log("getName");

    callback(null, this.name);
  },

  identify: function(callback) {
    this.log("Identify requested!");
    callback(); // success
  },

  getServices: function() {

    // you can OPTIONALLY create an information service if you wish to override
    // the default values for things like serial number, model, etc.
    var informationService = new Service.AccessoryInformation();

    informationService
      .setCharacteristic(Characteristic.Manufacturer, "James Adam")
      .setCharacteristic(Characteristic.Model, "Heating")
      .setCharacteristic(Characteristic.SerialNumber, "1");

    var thermostatService = new Service.Thermostat(this.name);

    thermostatService.getCharacteristic( Characteristic.CurrentHeatingCoolingState ).on( 'get', this.getCurrentHeatingCoolingState.bind(this) );

    thermostatService.getCharacteristic( Characteristic.TargetHeatingCoolingState ).on( 'set', this.setTargetHeatingCoolingState.bind(this) );
    thermostatService.getCharacteristic( Characteristic.TargetHeatingCoolingState ).on( 'get', this.getTargetHeatingCoolingState.bind(this) );

    thermostatService.getCharacteristic( Characteristic.CurrentTemperature ).on( 'get', this.getCurrentTemperature.bind(this) );

    thermostatService.getCharacteristic( Characteristic.TargetTemperature ).on( 'set', this.setTargetTemperature.bind(this) );
    thermostatService.getCharacteristic( Characteristic.TargetTemperature ).on( 'get', this.getTargetTemperature.bind(this) );

    thermostatService.getCharacteristic( Characteristic.TemperatureDisplayUnits ).on( 'set', this.setTemperatureDisplayUnits.bind(this) );
    thermostatService.getCharacteristic( Characteristic.TemperatureDisplayUnits ).on( 'get', this.getTemperatureDisplayUnits.bind(this) );

    //thermostatService.getCharacteristic( new Characteristic.Name() ).on( 'get', this.getName.bind(this) );

    return [informationService, thermostatService];
  }
};
