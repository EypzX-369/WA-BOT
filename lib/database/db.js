const config = require("../../config");
const { DataTypes } = require("sequelize");
const dnb = { type: DataTypes.TEXT };
const options = { db: dnb };
const DataBase = config.DATABASE.define("data", options);
exports.setDB = async () => {
  const entries = await DataBase.findAll();
  if (entries.length < 1) {
    await DataBase.create({ db: JSON.stringify(global.db) });
  } else {
    await entries[0].update({ db: JSON.stringify(global.db) });
  }
};
exports.getDB = async () => {
  const entries = await DataBase.findAll();
  if (entries.length > 0) {
    global.db = JSON.parse(entries[0].db);
  }
};
