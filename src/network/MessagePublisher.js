const exchangeName = 'connOut';
const exchangeControl = 'control';
const expirationTime = 10000;

class MessagePublisher {
  constructor(queue) {
    this.queue = queue;
  }

  async sendRegisteredDevice(body) {
    await this.queue.send(exchangeName, 'device.registered', body);
  }

  async sendAuthenticatedDevice(body) {
    await this.queue.send(exchangeName, 'device.auth', body);
  }

  async sendSchemaUpdated(body) {
    await this.queue.send(exchangeName, 'schema.updated', body);
  }

  async sendList(body) {
    await this.queue.send(exchangeName, 'device.list', body);
  }

  async sendDataUpdate(body) {
    await this.queue.send(exchangeName, 'data.update', body, expirationTime);
  }

  async sendDataRequest(body) {
    await this.queue.send(exchangeName, 'data.request', body, expirationTime);
  }

  async sendUnregisteredDevice(body) {
    await this.queue.send(exchangeName, 'device.unregistered', body);
  }

  async sendDisconnected() {
    await this.queue.send(exchangeControl, 'disconnected', {});
  }

  async sendReconnected() {
    await this.queue.send(exchangeControl, 'reconnected', {});
  }
}

export default MessagePublisher;
