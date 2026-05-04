import baseStyles from './Admin.module.css'
import profilesStyles from './AdminProfiles.module.css'
import tablesStyles from './AdminTables.module.css'
import formsStyles from './AdminForms.module.css'

const styles: Record<string, string> = {}
const sources = [baseStyles, profilesStyles, tablesStyles, formsStyles]

sources.forEach(source => {
  if (!source) return;
  Object.keys(source).forEach(key => {
    if (styles[key]) {
      styles[key] = `${styles[key]} ${source[key]}`
    } else {
      styles[key] = source[key]
    }
  })
})

export default styles
