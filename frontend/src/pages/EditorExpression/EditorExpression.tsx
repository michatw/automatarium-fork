import { useEffect, useState } from 'react'

import { Content, EditorContent } from './editorStyle'
import { BottomPanel, ExportImage, ShortcutGuide, MenubarExpression, EditorPanelExpression } from '/src/components'
import { useActions, useEvent } from '/src/hooks'
import { useExportStore, useExpressionStore, useMetaDataStore, useToolStore, useViewStore } from '/src/stores'
import { haveInputFocused } from '/src/util/actions'

import TemplateDelConfDialog from './components/TemplateDelConfDialog/TemplateDelConfDialog'
import { Tool } from '/src/stores/useToolStore'
import RegexEditor from './RegexEditor/RegexEditor'
import ToolbarExpression from '/src/components/ToolbarExpression/ToolbarExpression'
import { EXPRESSION_TYPE, TASK_MODE } from 'shared/constants'
import useAutosaveExpression from '/src/hooks/useAutosaveExpression'
import ShareUrlExpression from '/src/components/ShareUrl/ShareUrlExpression'
import { logger } from 'shared/logging'

const EditorExpressions = () => {
  const { tool, setTool } = useToolStore()
  const [priorTool, setPriorTool] = useState<Tool>()
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const resetExportSettings = useExportStore(s => s.reset)
  const setViewPositionAndScale = useViewStore(s => s.setViewPositionAndScale)
  const expression = useExpressionStore(s => s.expression)
  const [mode, setMode] = useState(TASK_MODE)
  const { setSelectedModelType, setSelectedViewType } = useMetaDataStore()

  // This function will be called by a child of the menubar component in case an error occurs
  const [isErrorPopUpVisible, setIsErrorPopUpVisible] = useState(false);
  const [errorPopUpMessage, setErrorPopUpMessage] = useState<string>("");
  const setErrorPopUpVisibility = (message: string, visible: boolean) => {
    logger.info("Set error pop up visibility.")
    setIsErrorPopUpVisible(visible);
    setErrorPopUpMessage(message);
  };

  useEffect(() => {
    setSelectedModelType(EXPRESSION_TYPE)
  },[])

  useEffect(() => {
    setSelectedViewType(mode)
  },[mode])

  const expressionType = expression.type
  const isTask = expressionType === 'TE'


  useAutosaveExpression()
  if (isTask) {
    // Register action hotkey
    useActions(true, false)
  } else {
    useActions(true, true) // Needs to be changed as soon as Regex convertion is part of expression and not a temp project anymore.
  }

  // Project must be set
  useEffect(() => {
    resetExportSettings()
    setViewPositionAndScale({ x: 0, y: 0 }, 1)
  }, [])
  // Change tool when holding certain keys
  useEvent('keydown', e => {
    // Hotkeys are disabled if an input is focused
    if (haveInputFocused(e)) return

    if (!priorTool && e.code === 'Space') {
      setPriorTool(tool)
      setTool('hand')
    }
    if (e.code === 'Space') {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [tool, priorTool])

  useEvent('keyup', e => {
    // Hotkeys are disabled if an input is focused
    if (haveInputFocused(e)) return

    if (priorTool && e.code === 'Space') {
      setTool(priorTool)
      setPriorTool(undefined)
    }
    if (e.code === 'Space') {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [tool, priorTool])

  // Middle mouse pan
  useEvent('svg:mousedown', e => {
    if (!priorTool && e.detail.originalEvent.button === 1) {
      setPriorTool(tool)
      setTool('hand')
    }
  }, [tool, priorTool])

  useEvent('svg:mouseup', e => {
    if (priorTool && e.detail.originalEvent.button === 1) {
      setTool(priorTool)
      setPriorTool(undefined)
    }
  }, [tool, priorTool])

  return (
    <>
      <MenubarExpression isTask={isTask} mode={mode} setMode={setMode} grade={expression["grade"]} setErrorMessage={(errorMessage) => setErrorPopUpVisibility(errorMessage, true)}/>
      <Content>
        <ToolbarExpression mode={mode} isTask={isTask}/>
        <EditorContent>
            {mode == TASK_MODE && <RegexEditor></RegexEditor>}
            <EditorPanelExpression mode={mode} isErrorPopUpVisible={isErrorPopUpVisible} setErrorPopUpVisibility={setErrorPopUpVisibility} errorMessage={errorPopUpMessage}/>
            <BottomPanel />
        </EditorContent>
      </Content>

      <ShortcutGuide/>

      <ExportImage />

      <ShareUrlExpression />

      <TemplateDelConfDialog
        isOpen={confirmDialogOpen}
        setOpen={() => setConfirmDialogOpen(true)}
        setClose={() => setConfirmDialogOpen(false)}
      />
    </>
  )
}

export default EditorExpressions
