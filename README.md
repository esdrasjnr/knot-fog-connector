# KNoT Fog connector service

This is a KNoT gateway service that connects the fog with a cloud service.

## Supported services

* [FIWARE](https://github.com/CESARBR/knot-fog-connector-fiware) (under development)

## Quickstart

1. Build: `npm run build`
1. Start: `npm start`

## Creating a connector

A connector is as a library that exports by default the `Connector` class. This service will use the library as follows:

```javascript
import CustomCloudConnector from 'knot-fog-connector-customcloud';

...
const connector = new CustomCloudConnector(config);
await connector.start();
```

### Methods

#### constructor(config)

Create the connector using a configuration object that will be loaded from a JSON file and passed directly to this constructor. No work, such as connecting to a service must be done in this constructor.

##### Argument

* `config` **Object** configuration parameters defined by the connector

##### Example

```javascript
import CustomCloudConnector from 'knot-fog-connector-customcloud';

const connector = new CustomCloudConnector({
  hostname: 'localhost',
  port: 3000,
  protocol: 'ws',
  ...
});
```

#### start(): Promise&lt;Void&gt;

Start the connector.

##### Example

```javascript
import CustomCloudConnector from 'knot-fog-connector-customcloud';

const connector = new CustomCloudConnector({ ... });
await connector.start();
```

#### addDevice(device): Promise&lt;Void&gt;

Add a device to the cloud.

##### Argument

* `device` **Object** device specification containing the following properties:
  * `id` **String** device ID (KNoT ID)
  * `name` **String** device name

##### Example

```javascript
await connector.start();
await connector.addDevice({
  id: '656123c6-5666-4a5c-9e8e-e2b611a2e66b',
  name: 'Front door'
});
```

#### removeDevice(id): Promise&lt;Void&gt;

Remove a device from the cloud.

##### Argument

* `id` **String** device ID (KNoT ID)

##### Example

```javascript
await connector.start();
await connector.removeDevice('656123c6-5666-4a5c-9e8e-e2b611a2e66b');
```

#### listDevices(): Promise&lt;Object&gt;

List the devices registered on the cloud.

##### Result

* `devices` **Array** devices registered on the cloud or an empty array. Each device is an object as described in [`addDevice()`](#adddevicedevice-promisevoid)

##### Example

```javascript
await connector.start();
const devices = await connector.listDevices();
console.log(devices);
// [ { id: '656123c6-5666-4a5c-9e8e-e2b611a2e66b', name: 'Front door' },
//   { id: '254d62a9-2118-4229-8b07-5084c4cc3db6', name: 'Back door' } ]
```

#### publishData(id, data): Promise&lt;Void&gt;

Publish data as a device.

##### Argument

* `id` **String** device ID (KNoT ID)
* `data` **Array** data items to be published, each one formed by:
  * `sensor_id` **Number** sensor ID
  * `value` **Number|Boolean|String** sensor value

##### Example

```javascript
await connector.start();
await connector.publishData('656123c6-5666-4a5c-9e8e-e2b611a2e66b', {
  locked: false
});
```

#### updateSchema(id, schema): Promise&lt;Void&gt;

Update the device schema.

##### Argument

* `id` **String** device ID (KNoT ID)
* `schema` **Array** schema items, each one formed by:
  * `sensor_id` **Number** sensor ID
  * `value_type` **Number** semantic value type (voltage, current, temperature, etc)
  * `unit` **Number** sensor unit (V, A, W, W, etc)
  * `type_id` **Number** data value type (boolean, integer, etc)
  * `name` **String** sensor name

Refer to the [protocol](https://github.com/CESARBR/knot-protocol-source) for more information on the possible values for each field.

**NOTE**: `schema` will always contain the whole schema and not a difference from a last update.

##### Example

```javascript
await connector.start();
await connector.updateSchema('656123c6-5666-4a5c-9e8e-e2b611a2e66b', [
  {
    sensor_id: 1,
    value_type: 0xFFF1, // Switch
    unit: 0, // NA
    type_id: 3, // Boolean
    name: 'Door lock',
  },
  {
    sensor_id: 2,
    ...
  }
]);
```

#### updateProperties(id, properties): Promise&lt;Void&gt;

Update the device properties.

##### Argument

* `id` **String** device ID (KNoT ID)
* `properties` **Object** updated properties

**NOTE**: unlike `updateSchema`, this method receives only the properties that were updated.

##### Example

```javascript
await connector.start();
await connector.updateProperties('656123c6-5666-4a5c-9e8e-e2b611a2e66b', {
  online: true
});
```

#### onConfigUpdated(cb): Promise&lt;Void&gt;

Register a callback to handle configuration updates on the cloud.

##### Argument

* `cb` **Function** event handler defined as `cb(id, config)` where:
  * `id` **String** device ID (KNoT ID)
  * `config` **Array** configuration for each sensor, each one formed by:
    * `sensor_id` **Number** sensor ID
    * `event_flags` **Number** event flags
    * `time_sec` **Number** update interval in seconds
    * `lower_limit` **Number** (Optional) lower limit
    * `upper_limit` **Number** (Optional) upper limit

**NOTE**: `config` will always contain the whole configuration and not a difference from a last update.

##### Example

```javascript
await connector.start();
await connector.onConfigUpdated((id, config) => {
  console.log(`Configuration for device '${id}' was updated`);
  console.log(config);
  // Configuration for device '656123c6-5666-4a5c-9e8e-e2b611a2e66b' was updated
  // {
  //   sensor_id: 1,
  //   event_flags: 0,
  //   time_sec: 100 
  // }
});
```

#### onPropertiesUpdated(cb): Promise&lt;Void&gt;

Register a callback to handle properties updates on the cloud.

##### Argument

* `cb` **Function** event handler defined as `cb(id, properties)` where:
  * `id` **Number** device ID (KNoT ID)
  * `config` **Object** updated properties

**NOTE**: unlike `onConfigUpdated`'s callback, this callback receives only the properties that were updated.

##### Example

```javascript
await connector.start();
await connector.onPropertiesUpdated((id, properties) => {
  console.log(`Properties for device '${id}' were updated`);
  console.log(props);
  // Properties for device '656123c6-5666-4a5c-9e8e-e2b611a2e66b' were updated
  // {
  //   enabled: false
  //   online: false
  // }
});
```

#### onDataRequested(cb): Promise&lt;Void&gt;

Register a callback to handle data requests from the cloud.

##### Argument

* `cb` **Function** event handler defined as `cb(id, sensorId)` where:
  * `id` **Number** device ID (KNoT ID)
  * `sensorId` **String** ID of the sensor to send updated data

##### Example

```javascript
await connector.start();
await connector.onDataRequested((id, sensorId) => {
  console.log(`New data from '${sensorId}' on device '${id}' is being requested`);
  // New data from '1' on device '656123c6-5666-4a5c-9e8e-e2b611a2e66b' is being requested
});
```

#### onDataUpdated(cb): Promise&lt;Void&gt;

Register a callback to handle data updates from the cloud.

##### Argument

* `cb` **Function** event handler defined as `cb(id, sensorId, data)` where:
  * `id` **Number** device ID (KNoT ID)
  * `sensorId` **String** ID of the sensor to update
  * `data` **Number|Boolean|String** data to be written

##### Example

```javascript
await connector.start();
await connector.onDataUpdated((id, sensorId, data) => {
  console.log(`Update actuator '${sensorId}' on device '${id}' to ${data}`);
  // Update actuator '2' on device '656123c6-5666-4a5c-9e8e-e2b611a2e66b' to 1000
});
```
