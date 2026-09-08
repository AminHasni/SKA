import db from "./src/db/sqlite";
try { db.exec("ALTER TABLE fiches_travail ADD COLUMN metrage TEXT"); } catch (e) { console.log(e.message); }
try { db.exec("ALTER TABLE fiches_travail ADD COLUMN cout REAL"); } catch (e) { console.log(e.message); }
console.log("DB patched");
