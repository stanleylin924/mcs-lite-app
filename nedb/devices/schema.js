module.exports = {
  type: 'object',
  properties: {
    createUserId: { type: 'string' },
    deviceId: { type: 'string' },
    deviceKey: { type: 'string' },
    deviceName: { type: 'string' },
    deviceDescription: { type: 'string' },
    deviceImageURL: { type: 'string'},
    prototypeId: { type: 'prototypeId' },
    updatedAt: { type: 'integer' },
    createdAt: { type: 'integer' },
    isHeartbeating: { type: 'boolean' },
    isPublic: { type: 'boolean' },
    fwId: {type: 'string'},
    isActive: { type: 'boolean' },
  },
};