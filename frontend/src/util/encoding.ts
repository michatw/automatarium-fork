import { encode, decode } from '@msgpack/msgpack'
import { gunzip, gzip } from 'zlib'
import { StoredProject } from '/src/stores/useProjectStore'
import { StoredExpression } from '../stores/useExpressionStore'

const urlSafe = (data: string) => data.replaceAll('/', '_')

const urlUnsafe = (data: string) => data.replaceAll('_', '/')

export const encodeData = async (data: StoredProject) => {
  // msgpack javascript object
  // zip
  // base64
  // make url safe
  const getGZip = new Promise<Buffer>((resolve) => {
    gzip(Buffer.from(encode(data)), (_, buffer) => {
      resolve(buffer)
    })
  })
  const results = await getGZip
  return urlSafe(Buffer.from(results).toString('base64'))
}

export const encodeExpressionData = async (data: StoredExpression) => {
  // msgpack javascript object
  // zip
  // base64
  // make url safe
  const getGZip = new Promise<Buffer>((resolve) => {
    gzip(Buffer.from(encode(data)), (_, buffer) => {
      resolve(buffer)
    })
  })
  const results = await getGZip
  return urlSafe(Buffer.from(results).toString('base64'))
}

export const decodeData = async (data: string) => {
  // undo url safe replacements
  // base64
  // unzip
  // inflate
  const getGUnzip = new Promise<Buffer>((resolve) => {
    gunzip(Buffer.from(urlUnsafe(data), 'base64'), (_, buffer) => {
      resolve(buffer)
    })
  })
  const results = await getGUnzip
  return decode(results) as StoredProject
}

export const decodeExpressionData = async (data: string) => {
  // undo url safe replacements
  // base64
  // unzip
  // inflate
  const getGUnzip = new Promise<Buffer>((resolve) => {
    gunzip(Buffer.from(urlUnsafe(data), 'base64'), (_, buffer) => {
      resolve(buffer)
    })
  })
  const results = await getGUnzip
  return decode(results) as StoredExpression
}
