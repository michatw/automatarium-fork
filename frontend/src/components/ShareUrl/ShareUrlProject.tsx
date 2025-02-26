import { useEffect, useState } from 'react'
import { useEvent } from '/src/hooks'

import { useProjectStore } from '/src/stores'

import { Copy } from 'lucide-react'
import { Button, Input, Modal } from '/src/components'

import { CopyRowWrapper, CopySuccessDiv } from './shareUrlStyle'
import { encodeData } from '/src/util/encoding'

const ShareUrl = () => {
  const [exportUrlOpen, setExportUrlOpen] = useState(false)
  const privateProject = JSON.parse(JSON.stringify(useProjectStore(s => s.project)))
  privateProject['grade'] = null
  const showPrivateLink = privateProject['isSolutionVisible'] && privateProject["projectType"] == "T"
  const publicProject = JSON.parse(JSON.stringify(privateProject))
  publicProject['isSolutionVisible'] = false // The public link should not show the solution
  publicProject['grade'] = null
  const [base64ProjectPublic, setBase64ProjectPublic] = useState('')
  const [base64ProjectPrivate, setBase64ProjectPrivate] = useState('')

  useEffect (() => {
    if (exportUrlOpen) {
      encodeData(publicProject).then(setBase64ProjectPublic)
      encodeData(privateProject).then(setBase64ProjectPrivate)
    }
  },[exportUrlOpen])

  const sharePublicLink = `${window.location.origin}/share/raw/${base64ProjectPublic}`
  const sharePrivateLink = `${window.location.origin}/share/raw/${base64ProjectPrivate}`

  const [copySuccess, setCopySuccess] = useState(false)
  const [dataCopySuccess, setDataCopySuccess] = useState(false)

  const handleClose = () => {
    setExportUrlOpen(false)
    setCopySuccess(false)
    setDataCopySuccess(false)
  }

  useEffect(() => {
    const timeout = setTimeout(() => setCopySuccess(false), 3000)
    return () => clearTimeout(timeout)
  }, [copySuccess])

  useEffect(() => {
    const timeout = setTimeout(() => setDataCopySuccess(false), 3000)
    return () => clearTimeout(timeout)
  }, [dataCopySuccess])

  const handleCopyPublicUrl = () => {
    navigator.clipboard.writeText(sharePublicLink)
    setCopySuccess(true)
  }

  const handleCopyPrivateURL = () => {
    navigator.clipboard.writeText(sharePrivateLink)
    setDataCopySuccess(true)
  }

  useEvent('showSharing', () => setExportUrlOpen(true))

  return <>
    <Modal
      title='Export Machine as URL'
      isOpen={exportUrlOpen}
      onClose={handleClose}
      actions={<Button secondary onClick={handleClose}>Close</Button>}
    >
    {showPrivateLink &&
      <>  
        Private URL
        <CopyRowWrapper>
          <Input
            readOnly
            value={sharePrivateLink}
          />
          <Button onClick={handleCopyPrivateURL} style={{ height: '100%' }}>
            <Copy size='18px' />
          </Button>
        </CopyRowWrapper>
      </>
    }
      {dataCopySuccess ? <CopySuccessDiv>Copied to clipboard!</CopySuccessDiv> : <></>}
      
      Public URL
      <CopyRowWrapper>
        <Input
          readOnly
          value={sharePublicLink}
        />
        <Button onClick={handleCopyPublicUrl} style={{ height: '100%' }}>
          <Copy size='18px' />
        </Button>
      </CopyRowWrapper>
      {copySuccess ? <CopySuccessDiv>Copied to clipboard!</CopySuccessDiv> : <></>}
    </Modal>
  </>
}

export default ShareUrl
