const db = require("../config/database");

const auditLog = (action, tableName) => {
  return async (req, res, next) => {
    const originalSend = res.send;

    res.send = function (data) {
      res.send = originalSend;

      // Only log successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const logData = {
          user_id: req.user?.id || null,
          action,
          table_name: tableName,
          record_id: req.params.id || null,
          new_data: req.body || {},
          ip_address: req.ip || req.connection.remoteAddress,
          user_agent: req.get("user-agent"),
        };

        // Async logging without blocking response
        db.query(
          `INSERT INTO audit_logs (user_id, action, table_name, record_id, new_data, ip_address, user_agent)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            logData.user_id,
            logData.action,
            logData.table_name,
            logData.record_id,
            JSON.stringify(logData.new_data),
            logData.ip_address,
            logData.user_agent,
          ],
        ).catch((err) => console.error("Audit log error:", err));
      }

      return originalSend.call(this, data);
    };

    next();
  };
};

module.exports = auditLog;
