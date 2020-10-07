const { Schema } = require('mongoose');

const LogSchema = new Schema({
  eventId: { type: Schema.Types.ObjectId, required: true, index: true },
  dreamId: { type: Schema.Types.ObjectId, index: true },
  createdAt: { type: Date, required: true, default: Date.now },
  userId: Schema.Types.ObjectId,
});

const FlagRaisedSchema = new Schema({
  guidelineId: { type: Schema.Types.ObjectId },
  comment: String,
});

const FlagResolvedSchema = new Schema({
  guidelineId: { type: Schema.Types.ObjectId },
  resolvingFlagId: Schema.Types.ObjectId,
  comment: String,
});

function createLogModels(db) {
  const discriminatorOptions = { discriminatorKey: 'kind' };
  const Log = db.model('Log', LogSchema);

  const FlagRaisedLog = Log.discriminator(
    'FlagRaised',
    FlagRaisedSchema,
    discriminatorOptions
  );

  const FlagResolvedLog = Log.discriminator(
    'FlagResolved',
    FlagResolvedSchema,
    discriminatorOptions
  );

  return {
    Log,
    FlagRaisedLog,
    FlagResolvedLog,
  };
}

module.exports = { createLogModels };
