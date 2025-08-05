import "server-only"
import * as handler from '#/db/handler'
import * as pg from '#/core/src/db'
const db = {  handler, pg }
export default db