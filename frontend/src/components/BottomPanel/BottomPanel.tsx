import { useState } from 'react'

import { useEvent } from '/src/hooks'

import { Wrapper, Panel } from './bottomPanelStyle'
import { TMTapeLab } from './Panels'

interface Panel {
  label: string
  value: string
  element: JSX.Element
}

const panels = [
  {
    label: 'TMTapeLab',
    value: 'tmTape',
    element: <TMTapeLab />
  }
]

const BottomPanel = () => {
  const [activePanel, setActivePanel] = useState<Panel>()

  // Open panel via event
  useEvent('bottomPanel:open', e => {
    const panel = panels.find(p => p.value === e.detail.panel)
    setActivePanel(activePanel?.value === panel.value ? undefined : panel)
  }, [activePanel])

  useEvent('bottomPanel:close', () => {
    setActivePanel(undefined)
  }, [activePanel])

  return (
        <Wrapper>
            {activePanel && (
                <Panel >
                    <div>
                        {activePanel.element}
                    </div>
                </Panel>
            )}
        </Wrapper>

  )
}

export default BottomPanel
