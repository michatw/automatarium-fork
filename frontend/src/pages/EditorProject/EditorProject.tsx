import { PROJECT_TYPE, TASK_MODE } from 'shared/constants'

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Content, EditorContent } from './editorStyle'
import { BottomPanel, EditorPanelProject, MenubarProject, Sidepanel, ToolbarProject, ExportImage, ImportDialog, ShareUrl, ShortcutGuide } from '/src/components'
import { useActions, useEvent } from '/src/hooks'
import { useExportStore, useMetaDataStore, useProjectStore, useToolStore, useViewStore } from '/src/stores'
import { haveInputFocused } from '/src/util/actions'

import PDAStackVisualiser from '../../components/PDAStackVisualiser/stackVisualiser'
import { useAutosaveProject } from '../../hooks'
import TemplateDelConfDialog from './components/TemplateDelConfDialog/TemplateDelConfDialog'
import { Tool } from '/src/stores/useToolStore' 
import { calculateZoomFit } from '/src/hooks/useActions'

const EditorProject = () => {
  const navigate = useNavigate()
  const { setSelectedModelType, setSelectedViewType } = useMetaDataStore()    
  const { tool, setTool } = useToolStore()
  const [priorTool, setPriorTool] = useState<Tool>()
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const resetExportSettings = useExportStore(s => s.reset)
  const setViewPositionAndScale = useViewStore(s => s.setViewPositionAndScale)
  const setViewPosition = useViewStore(s => s.setViewPosition)
  const project = useProjectStore(s => s.project)
  const [mode, setMode] = useState(TASK_MODE)

  // This function will be called by a child of the menubar component in case an error occurs
  const [isErrorPopUpVisible, setIsErrorPopUpVisible] = useState(false);
  const [errorPopUpMessage, setErrorPopUpMessage] = useState<string>("");

  const setErrorPopUpVisibility = (message: string, visible: boolean) => {
    setIsErrorPopUpVisible(visible);
    setErrorPopUpMessage(message);
  };

  useEffect(() => {
    setSelectedModelType(PROJECT_TYPE)
  },[])

  useEffect(() => {
    setSelectedViewType(mode)
  },[mode])

  // Check the user has selected a project, navigate to creation page if not
  if (!project) {
    navigate('/new')
    return null
  }
  const projectType = project.config.type
  const isTask = projectType === 'T'

  // Check if the project is a task and adjust ViewType when mode changes
  useEffect(() => {
    if (isTask) {
      const values = calculateZoomFit()
      if (values) {
        setViewPosition({ x: values.x, y: values.y })
      }
    }
  }, [mode])

  // Auto save project as its edited
  useAutosaveProject()

  // Register action hotkey
  useActions(true, false)
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
      <MenubarProject mode={mode} setMode={setMode} isTask={isTask} grade={project["grade"]} setErrorMessage={(errorMessage) => setErrorPopUpVisibility(errorMessage, true)}/>
      <Content>
        <ToolbarProject />
        <EditorContent>
          <EditorPanelProject mode={mode} isErrorPopUpVisible={isErrorPopUpVisible} setErrorPopUpVisibility={setErrorPopUpVisibility} errorMessage={errorPopUpMessage}/>
          <BottomPanel />
        </EditorContent>
        {(projectType === 'PDA') &&
          <PDAStackVisualiser />
        }
        <Sidepanel />

      </Content>

      <ShortcutGuide/>

      <ExportImage />

      <ShareUrl />

      <TemplateDelConfDialog
        isOpen={confirmDialogOpen}
        setOpen={() => setConfirmDialogOpen(true)}
        setClose={() => setConfirmDialogOpen(false)}
      />

      <ImportDialog navigateFunction={navigate} />

    </>
  )
}

export default EditorProject
