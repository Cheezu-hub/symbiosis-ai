const { pool } = require('./models/database');
(async () => {
    try {
        const result = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'industries'");
        console.log("Columns:", result.rows.map(r => r.column_name));
    } catch(err) {
        console.error("DB Error:", err);
    } finally {
        pool.end();
        process.exit(0);
    }
})();
