import { useContext } from 'react'
import {
  FuncNodesReactFlowZustandInterface,
  RenderOptions
} from '../../../states/fnrfzst.t'
import { FuncNodesContext } from '../../funcnodesreactflow'
import { pick_best_io_type } from './io'
import { SortableTable } from '../../utils/table'
import JSONDataDisplay from '../../utils/jsondata'
import { Base64ImageRenderer } from '../../datarenderer/images'
import { IOType } from '../../../states/nodeio.t'
import React from 'react'

const TableOutput = ({ io }: { io: IOType }) => {
  let value = io.fullvalue
  if (value == undefined) value = io.value
  if (value === undefined) {
    value = []
  }

  return <SortableTable tabledata={value} />
}

const DictOutput = ({ io }: { io: IOType }) => {
  let value = io.fullvalue

  if (value === undefined) value = io.value
  if (value === undefined) {
    value = {}
  }

  return <JSONDataDisplay data={value} />
}

const Base64ImageOutput = ({ io }: { io: IOType }) => {
  let value = io.fullvalue
  if (value == undefined) value = io.value
  if (value === undefined) {
    value = ''
  }

  return <Base64ImageRenderer value={value} />
}

const SingleValueOutput = ({ io }: { io: IOType }) => {
  let value = io.fullvalue
  if (value == undefined) value = io.value
  if (value === undefined) {
    value = ''
  } else {
    value = JSON.stringify(io.value).replace(/\\n/g, '\n') //respect "\n" in strings
  }

  return (
    <div>
      <pre>{value}</pre>
    </div>
  )
}

const HandlePreviouGenerators: {
  [key: string]: ({ io }: { io: IOType }) => JSX.Element
} = {
  string: SingleValueOutput,
  table: TableOutput,
  image: Base64ImageOutput,
  dict: DictOutput
}

const PreviewHandleDataRendererForIo = (io: IOType) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext)
  const render: RenderOptions = fnrf_zst.render_options()

  const [typestring] = pick_best_io_type(io.type, render.typemap || {})

  return typestring && HandlePreviouGenerators[typestring]
    ? HandlePreviouGenerators[typestring]
    : DictOutput
}

export { PreviewHandleDataRendererForIo }
