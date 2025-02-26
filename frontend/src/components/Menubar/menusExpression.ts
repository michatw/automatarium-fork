import { APP_VERSION } from '/src/config/projects'
import { ContextItems } from '/src/components/ContextMenus/contextItem'

const menusExpression: ContextItems = [
  {
    label: 'File',
    items: [
      {
        label: "Export as an Automatarium file",
        action: 'SAVE_FILE_AS'
      },
      {
        label: 'Import Automatarium file',
        action: 'IMPORT_AUTOMATARIUM_EXPRESSION'
      }
    ]
  },
  {
    label: 'Tools',
    items: [
      {
        label: 'Convert to DFA',
        action: 'CONVERT_REGEX_TO_DFA'
      },
      { 
        label: 'Grade your Solution',
        action: 'GRADE_SOLUTION_EXPRESSION'
      }
    ]
  },
  {
    label: 'Help',
    items: [
      {
        label: 'View documentation',
        action: 'OPEN_DOCS'
      },
      {
        label: 'Tutorial videos',
        action: 'TUTORIAL_VIDEOS'
      },
      {
        label: 'Keyboard shortcuts',
        action: 'KEYBOARD_SHORTCUTS'
      },
      'hr',
      {
        label: 'Privacy policy',
        action: 'PRIVACY_POLICY'
      },
      {
        label: 'About Automatarium',
        action: 'OPEN_ABOUT'
      },
      'hr',
      {
        label: `Version ${APP_VERSION}`
      }
    ]
  },
]

export default menusExpression
