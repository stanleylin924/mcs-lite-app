/**
 *
 * The MIT License (MIT)
 *
 * Devify Platform
 *
 * Copyright (c) 2016 Devify, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

'use strict';

/**
 * Main WoT Framework
 */
var WoT = require('wotcity.io');

/**
 * WoT Modules
 */
var Framework = WoT.Framework
  , WebsocketBroker = WoT.WebsocketBroker
  , WebsocketRouter = WoT.WebsocketRouter
  , RequestHandlers = WoT.WebsocketRequestHandlers
  , Runtime = WoT.Runtime;

/**
 * Util Modules
 */
var merge = require('utils-merge');

var management = function(pathname, connection, clients) {
    connection.pathname = pathname;

    /*
     * convert sender pathname to viewer pathname
     * eg. '/object/mbedtaiwan/send' to '/object/mbedtaiwan/viewer'
     */
    var paths = pathname.split('/');

    // remove the rear string 'send'
    var viewer = paths.slice(0, -1).join('/').replace('/12312313123123', '');
    // console.log('management: '+ viewer);
    connection.viewer = viewer + '/viewer';
    connection.statusViewer = viewer + '/status';

    /*
     * initial storage for this viewer
     */
    for (var path in clients) {
        if (path === connection.viewer)
            return;
    }

    clients[connection.viewer] = [];
    clients[connection.statusViewer] = [];
}


/**
 * Websocket URL Router
 */
var wsHandlers = {
   "/object/([A-Za-z0-9/]+)/send$": RequestHandlers.send,
   "/object/([A-Za-z0-9/]+)/viewer$": RequestHandlers.viewer,
   "/object/([A-Za-z0-9/]+)/status$": RequestHandlers.status,
   '/management/12312313123123/send': management,
   '/management/viewer': RequestHandlers.viewer,
};

/*
 * Prototype and Class
 */
var Server = function () {
};

/**
 * The server event handlers
 */
Server.prototype.onNewThing = function(thing) {
  // at this server, the thing description is included via a local file
  // or it can be accessed by invoking HTTP api from remote device
  // console.log(thing);
  var def = require('./thing');
  var thing = merge(def, thing);

  // register a new thing to WoT framework
  this.registerThing(thing);

  if (typeof(this._options.onnewthing) === 'function') {
    this._options.onnewthing(thing);
  }
};

Server.prototype.onData = function(payload) {
  if (typeof(this._options.onmessage) === 'function') {
    this._options.onmessage(payload);
  }

  // Send hardware data to FBP network.
  var data = {
    upproc: 'devify-device',
    upport: 'out',
    payload: payload
  };
  this._network.send(data);
};

/**
 * Create an WoT server.
 *
 * @return {Object}
 * @api public
 */
function createServer(options) {
  var instance = new Server();

  // Create FBP Runtime
  var network = new Runtime();
  instance._network = network;

  return merge(instance, options);
}

/**
 * Start a Websocket server.
 *
 * @return {None}
 * @api public
 */
Server.prototype.start = function(options) {
  var port = process.env.PORT || 8000;
  var host = process.env.HOST || 'localhost';
  var options = options || {};

  for (var prop in options) {
    if (options.hasOwnProperty(prop)
        && typeof(this._options[prop]) === 'undefined')
      this._options[prop] = options[prop];
  }

  // Load components
  this._network.load(this._options.components || {});

  // Start FBP Network Runtime
  this._network.runtime(this._options.graph || {});

  var server = new WebsocketBroker({
    port: port,
    host: host
  });
  var router = new WebsocketRouter();
  // console.log(this);
  // Thing events from WoT framework
  server.on('newThing', this.onNewThing.bind(this));
  server.on('data', this.onData.bind(this));
  // console.log()
  server.start(router.route, wsHandlers);
};

/**
 * Create the server instance.
 */
var wsBrokerImpl = createServer({
  events: {
  }
});

/**
 * Combined server with framework instance.
 */
var wsServer = new Framework({
  server: wsBrokerImpl
});

/**
 * Export the server.
 */
module.exports = wsServer;
