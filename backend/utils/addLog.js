// utils/addLog.js
// utils/addLog.js
import Log from "../models/Log.js";

const addLog = async (message, type) => {
  await Log.create({ message, type });
};

export default addLog;