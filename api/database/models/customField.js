const { Schema } = require("mongoose");

const CustomFieldSchema = new Schema({
    eventId: { type: Schema.Types.ObjectId, required: true },
    value: Schema.Types.Mixed,
})

module.exports = CustomFieldSchema;