import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { useProjectStore, useProjectsStore } from '/src/stores'

import { useParseFileProject } from '/src/hooks/useActions'
import { showWarning } from '/src/components/Warning/Warning'
import { decodeData } from '/src/util/encoding'
import { StoredProject } from '/src/stores/useProjectStore'
import {v4 as uuidv4} from 'uuid'
import Landing from '../Landing/Landing'

const ShareProject = () => {
  const { type, data } = useParams()
  const navigate = useNavigate()
  const setProject = useProjectStore(s => s.set)
  const addProject = useProjectsStore(s => s.upsertProject)
  const projects = useProjectsStore(s => s.projects)
  const project = useProjectStore(s => s.project)

  useEffect(() => {
    switch (type) {
      case 'raw': {
        decodeData(data).then((decodedJson) => {
          const dataJson = new File([JSON.stringify(decodedJson)], 'Shared Project')
          useParseFileProject(onData, 'Failed to load file.', dataJson, handleLoadSuccess, handleLoadFail)
        })
        break
      }
      default: {
        showWarning(`Unknown share type ${type}`)
        handleLoadFail()
        break
      }
    }
  }, [data])

  const onData = (newProject: StoredProject) => {
    const existingProject = projects.find(p => p._id === newProject._id) || newProject._id == project._id || false

    if (existingProject) {
      window.alert('A project with the same ID already exists. A copy will be created.');
      newProject._id = uuidv4();
      newProject.meta.name = `${newProject.meta.name} (copy)`;
    }
    setProject(newProject)
    addProject(newProject)
  }

  const handleLoadSuccess = () => {
    navigate('/editor')
  }

  const handleLoadFail = () => {
    navigate('/new')
  }

  return (
    <Landing></Landing>
  )
}

export default ShareProject
