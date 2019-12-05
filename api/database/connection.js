import mongoose from 'mongoose';

const uri = process.env.MONGO_URL;

let connection = null;

export const getConnection = async () => {
  if (connection == null) {
    connection = await mongoose.createConnection(uri, {
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // and MongoDB driver buffering
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
  }
  return connection;
};
