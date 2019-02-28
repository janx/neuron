import { app } from 'electron'
import * as path from 'path'

const isDevMode = !app.isPackaged
const env = {
  isDevMode,
  mainURL: isDevMode ? 'http://localhost:3000' : `file://${path.join(__dirname, '../ui/index.html')}`,
}

export default env
