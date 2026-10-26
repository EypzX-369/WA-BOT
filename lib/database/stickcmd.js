const { DataTypes } = require("sequelize");
const config = require("../../config");
const StickCmdDB = config.DATABASE.define("stickcmd", {
  command: {
    type: DataTypes.STRING(1e3),
    allowNull: false
  },
  file: {
    type: DataTypes.STRING(1e3),
    allowNull: false
  }
});
const stickcmd = {
  async get() {
    return await StickCmdDB.findAll();
  },
  async set(commandName, fileContent) {
    const existing = await StickCmdDB.findOne({ where: { file: fileContent } });
    if (existing) await existing.destroy();
    await StickCmdDB.create({ command: commandName, file: fileContent });
    return true;
  },
  async delete(identifier, type = "file") {
    const whereClause = type === "file" ? { file: identifier } : type === "command" ? { command: identifier } : null;
    if (!whereClause) return false;
    const result = await StickCmdDB.destroy({ where: whereClause });
    return result > 0;
  }
};
module.exports = stickcmd;
