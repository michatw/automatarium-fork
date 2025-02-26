import dayjs from 'dayjs'
import { Settings } from 'lucide-react'
import { RefObject, createRef, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button, Header, Main, ProjectCard, ImportDialog } from '/src/components'
import { PROJECT_THUMBNAIL_WIDTH } from '/src/config/rendering'
import { usePreferencesStore, useProjectStore, useProjectsStore, useThumbnailStore, useExpressionStore} from '/src/stores'
import { StoredProject, createNewProject } from '/src/stores/useProjectStore' // #HACK
import { createNewExpression, StoredExpression } from '/src/stores/useExpressionStore' // #HACK
import { dispatchCustomEvent } from '/src/util/events'

import { CardList, DeleteConfirmationDialog, NewProjectCard } from './components'
import FSA from './images/FSA'
import PDA from './images/PDA'
import TM from './images/TM'
import { ButtonGroup, HeaderRow, NoResultSpan, PreferencesButton } from './newFileStyle'
import KebabMenu from '/src/components/KebabMenu/KebabMenu'
import { Coordinate, ProjectType } from '/src/types/ProjectTypes'
import { ExpressionType } from '/src/types/ExpressionTypes'
import useExpressionsStore from '/src/stores/useExpressionsStore'
import ExpressionCard from '/src/components/ExpressionCard/ExpressionCard'
import { EXPRESSION_TYPE, PROJECT_TYPE } from 'shared/constants'
import T from './images/T'
import TE from './images/TE'
import RE from './images/RE'

const NewFile = () => {
  const navigate = useNavigate()
  const projects = useProjectsStore(s => s.projects)
  const expressions = useExpressionsStore(s => s.expressions)
  const setProject = useProjectStore(s => s.set)
  const setExpression = useExpressionStore(e => e.set)
  const thumbnails = useThumbnailStore(s => s.thumbnails)
  const removeThumbnail = useThumbnailStore(s => s.removeThumbnail)
  const preferences = usePreferencesStore(state => state.preferences)
  // We find the tallest card using method shown here
  // https://legacy.reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
  const [height, setHeight] = useState(0)
  const cardsRef = useCallback((node: HTMLDivElement) => {
    if (node === null) return
    // Get the height of the tallest card, we will set the rest of the cards to it
    setHeight(Math.max(...[...node.children].map(it => it.getBoundingClientRect().height)))
  }, [])
  const deleteProject = useProjectsStore(s => s.deleteProject)
  const deleteExpression = useExpressionsStore(s => s.deleteExpression)
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false)
  const [deleteConfirmationExpressionVisible, setDeleteConfirmationExpressionVisible] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [selectedExpressionId, setSelectedExpressionId] = useState('')
  const [selectedProjectName, setSelectedProjectName] = useState('')
  const [selectedExpressionName, setSelectedExpressionName] = useState('')
  const [kebabOpen, setKebabOpen] = useState(false)
  const [kebabOpenExpression, setKebabOpenExpression] = useState(false)
  const [coordinates, setCoordinates] = useState<Coordinate>({ x: 0, y: 0 })
  const [kebabRefs, setKebabRefs] = useState<Array<RefObject<HTMLAnchorElement>>>()
  const [kebabExpressionRefs, setKebabExpressionRefs] = useState<Array<RefObject<HTMLAnchorElement>>>()

  // Dynamic styling values for new project thumbnails
  // Will likely be extended to 'Your Projects' list
  // If matching system theme, don't append a theme to css vars
  const theme = preferences.theme === 'system' ? '' : `-${preferences.theme}`
  const getThumbTheme = useCallback((id: string) => {
    const thumbTheme = preferences.theme === 'system'
      ? window.matchMedia && window.matchMedia('prefer-color-scheme: dark').matches ? '-dark' : ''
      : preferences.theme === 'dark' ? '-dark' : ''
    return `${id}${thumbTheme}`
  }, [preferences.theme])
  const stylingVals = {
    stateFill: `var(--state-bg${theme})`,
    strokeColor: `var(--stroke${theme})`
  }

  // Remove old thumbnails
  useEffect(() => {
    if (projects.length) {
      Object.keys(thumbnails).forEach(id => !id.startsWith('tmp') && !projects.some(p => p._id === id || `${p._id}-dark` === id) && removeThumbnail(id))
    }
  }, [projects, thumbnails])

  // Create and update refs when projects changes
  useEffect(() => {
    setKebabRefs(Array.from({ length: projects.length }, () => createRef<HTMLAnchorElement>()))
  }, [projects])

  // Create and update refs when expressions changes
  useEffect(() => {
    setKebabExpressionRefs(Array.from({ length: expressions.length }, () => createRef<HTMLAnchorElement>()))
  }, [expressions])

  const handleNewExpressionFile = (type: ExpressionType) => {
    setExpression(createNewExpression(type))
    navigate('/editorExpression')
  }
  
  const handleNewFile = (type: ProjectType) => {
    setProject(createNewProject(type))
    navigate('/editor')
  }

  const handleLoadProject = (project: StoredProject) => {
    setProject(project)
    navigate('/editor')
  }

  const handleDeleteProject = (pid: string) => {
    deleteProject(pid)
  }

  const importProject = () => {
    // promptLoadFile(setProject, 'The file format provided is not valid. Please only open Automatarium .json or JFLAP .jff file formats.', '.jff,.json', () => navigate('/editor'))
    dispatchCustomEvent('modal:import', null)
  }

  const handleLoadExpression = (expression: StoredExpression) => {
    setExpression(expression)
    navigate('/editorExpression')
  }

  const handleDeleteExpression = (eid: string) => {
    deleteExpression(eid)
  }

  return <Main wide>
    <HeaderRow>
      <Header linkTo="/" />
      <div style={{ flex: 1 }} />
      <ButtonGroup>
        <PreferencesButton title="Preferences" type="button" onClick={() => dispatchCustomEvent('modal:preferences', null)}><Settings /></PreferencesButton>
      </ButtonGroup>
    </HeaderRow>

    <CardList
      title="New Project"
      button={<Button disabled={true} onClick={importProject}>Import...</Button>}
      innerRef={cardsRef}
    >
      <NewProjectCard
        title="Finite State Automaton"
        description="Create a deterministic or non-deterministic automaton with finite states. Capable of representing regular grammars."
        onClick={() => handleNewFile('FSA')}
        height={height}
        image={<FSA {...stylingVals} />}
      />
      <NewProjectCard
        title="Push Down Automaton"
        description="Create an automaton with a push-down stack capable of representing context-free grammars."
        onClick={() => handleNewFile('PDA')}
        height={height}
        image={<PDA {...stylingVals} />}
      />
      <NewProjectCard
        title="Turing Machine"
        description="Create a turing machine capable of representing recursively enumerable grammars."
        onClick={() => handleNewFile('TM')}
        height={height}
        image={<TM {...stylingVals} />}
      />
      <NewProjectCard
        title="Task"
        description="Create a Task including an description and a solution."
        onClick={() => handleNewFile('T')}
        height={height}
        image={<T {...stylingVals} />}
      />
    </CardList>

    <CardList
      title="Your Projects"
      style={{ gap: '1.5em .4em' }}
    >
      {projects.filter(p => !p._id.startsWith('temp')).sort((a, b) => b.meta.dateEdited - a.meta.dateEdited).map((p, i) =>
        <ProjectCard
          key={p._id}
          name={p?.meta?.name ?? '<Untitled>'}
          type={p?.config?.type ?? '???'}
          date={dayjs(p?.meta?.dateEdited)}
          image={thumbnails[getThumbTheme(p._id)]}
          width={PROJECT_THUMBNAIL_WIDTH}
          onClick={() => handleLoadProject(p)}
          $kebabClick={(event) => {
            event.stopPropagation()
            // dispatchCustomEvent('modal:deleteConfirm', null)
            setKebabOpen(true)
            const thisRef = kebabRefs[i] === null
              // Set default values if not done yet to prevent crashes
              ? { offsetLeft: 0, offsetTop: 0, offsetHeight: 0 }
              : kebabRefs[i].current
            const coords = {
              x: thisRef.offsetLeft,
              y: thisRef.offsetTop + thisRef.offsetHeight
            } as Coordinate
            setCoordinates(coords)
            setSelectedProjectId(p._id)
            setSelectedProjectName(p?.meta?.name ?? '<Untitled>')
          }}
          $kebabRef={ kebabRefs === undefined ? null : kebabRefs[i] }
          $istemplate={false}
        />
      )}
      {projects.filter(p => !p._id.startsWith('temp')).length === 0 && <NoResultSpan>No projects yet</NoResultSpan>}
    </CardList>

    <CardList
      title="New Expression"
    >
      <NewProjectCard
        title="Regular Expression"
        description="Create a regular Expression"
        onClick={() => handleNewExpressionFile('RE')}
        height={height}
        image={<RE {...stylingVals} />}
      />
      <NewProjectCard
        title="Expression Task"
        description="Create an Expression Task"
        onClick={() => handleNewExpressionFile('TE')}
        height={height}
        image={<TE {...stylingVals} />}
      />
    </CardList>

    <CardList
      title="Your Expressions"
      style={{ gap: '1.5em .4em' }}
    >
      {expressions.sort((a, b) => b.meta.dateEdited - a.meta.dateEdited).map((e, i) =>
        <ExpressionCard
          key={e._id}
          name={e?.meta?.name ?? '<Untitled>'}
          type={e?.type ?? '???'}
          date={dayjs(e?.meta?.dateEdited)}
          image={thumbnails[getThumbTheme(e._id)]}
          width={PROJECT_THUMBNAIL_WIDTH}
          onClick={() => handleLoadExpression(e)}
          $kebabClick={(event) => {
            event.stopPropagation()
            setKebabOpenExpression(true)
            const thisRef = kebabExpressionRefs[i] === null
              // Set default values if not done yet to prevent crashes
              ? { offsetLeft: 0, offsetTop: 0, offsetHeight: 0 }
              : kebabExpressionRefs[i].current
            const coords = {
              x: thisRef.offsetLeft,
              y: thisRef.offsetTop + thisRef.offsetHeight
            } as Coordinate
            setCoordinates(coords)
            setSelectedExpressionId(e._id)
            setSelectedExpressionName(e?.meta?.name ?? '<Untitled>')
          }}
          $kebabRef={ kebabExpressionRefs === undefined ? null : kebabExpressionRefs[i] }
          $istemplate={false}
        />
      )}
      {expressions.length == 0 && <NoResultSpan>No expressions yet</NoResultSpan>}
    </CardList>

    <KebabMenu
      x={coordinates.x}
      y={coordinates.y}
      isOpen={kebabOpen}
      onClose={() => setKebabOpen(false)}
      type={PROJECT_TYPE}
    />

    <DeleteConfirmationDialog
      type={PROJECT_TYPE}
      projectName={selectedProjectName}
      isOpen={deleteConfirmationVisible}
      isOpenReducer={setDeleteConfirmationVisible}
      onClose={() => setDeleteConfirmationVisible(false)}
      onConfirm={() => {
        handleDeleteProject(selectedProjectId)
        setDeleteConfirmationVisible(false)
      }}
    />

    <KebabMenu
      x={coordinates.x}
      y={coordinates.y}
      isOpen={kebabOpenExpression}
      onClose={() => setKebabOpenExpression(false)}
      type={EXPRESSION_TYPE}
    />

    <DeleteConfirmationDialog
      type={EXPRESSION_TYPE}
      projectName={selectedExpressionName}
      isOpen={deleteConfirmationExpressionVisible}
      isOpenReducer={setDeleteConfirmationExpressionVisible}
      onClose={() => setDeleteConfirmationExpressionVisible(false)}
      onConfirm={() => {
        handleDeleteExpression(selectedExpressionId)
        setDeleteConfirmationExpressionVisible(false)
      }}
    />

    <ImportDialog navigateFunction={navigate} />
  </Main>
}

export default NewFile
