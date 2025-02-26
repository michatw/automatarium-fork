import { useEffect, useState } from 'react'
import { useEvent } from '/src/hooks'

import { useExpressionStore } from '/src/stores'

import { Copy } from 'lucide-react'
import { Button, Input, Modal } from '/src/components'

import { CopyRowWrapper, CopySuccessDiv } from './shareUrlStyle'
import { encodeExpressionData } from '/src/util/encoding'

const ShareUrlExpression = () => {
  const [exportUrlOpen, setExportUrlOpen] = useState(false)
  const privateExpression = JSON.parse(JSON.stringify(useExpressionStore(s => s.expression)))
  privateExpression['grade'] = null
  const showPrivateLink = privateExpression['isSolutionVisible'] && privateExpression["type"] == "TE"
  const publicExpression = JSON.parse(JSON.stringify(privateExpression))
  publicExpression['isSolutionVisible'] = false // The public link should not show the solution
  publicExpression['grade'] = null

  const [base64PublicExpression, setBase64PublicExpression] = useState('')
  const [base64PrivateExpression, setBase64PrivateExpression] = useState('')

  useEffect (() => {
    if (exportUrlOpen) {
      encodeExpressionData(publicExpression).then(setBase64PublicExpression)
      encodeExpressionData(privateExpression).then(setBase64PrivateExpression)
    }
  },[exportUrlOpen])

  const sharePublicLink = `${window.location.origin}/share/expression/raw/${base64PublicExpression}`
  const sharePrivateLink = `${window.location.origin}/share/expression/raw/${base64PrivateExpression}`

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

  useEvent('showSharingExpression', () => setExportUrlOpen(true))
  
  return <>
    <Modal
      title='Export Expression as URL'
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

export default ShareUrlExpression
