import { createContext, useEffect, useState } from 'react'
import FuncNodesWorker from '../../funcnodes/funcnodesworker'
import FuncNodesReactFlowZustand from '../../states/fnrfzst'
import React from 'react'
import { WorkerManager } from '../../funcnodes'

import FuncnodesHeader from '../header'
import Library from '../lib'
import ReactFlowLayer from './react_flow_layer'
import {
  FuncNodesReactFlowZustandInterface,
  FuncnodesReactFlowProps
} from '../../states/fnrfzst.t'

const FuncNodesContext = createContext<FuncNodesReactFlowZustandInterface>(
  FuncNodesReactFlowZustand({})
)

const InnerFuncnodesReactFlow = ({
  fnrf_zst
}: {
  fnrf_zst: FuncNodesReactFlowZustandInterface
}) => {
  const [workermanageruri, setWorkermanageruri] = useState<string>('')
  const [worker, setWorker] = useState<FuncNodesWorker | undefined>(
    fnrf_zst.options.default_worker
  )

  useEffect(() => {
    async function fetch_worker_manager() {
      let response = await fetch('/worker_manager')
      let workerewsuri = await response.text()
      setWorkermanageruri(workerewsuri)
    }
    if (fnrf_zst.options.useWorkerManager) fetch_worker_manager()
  }, [])

  useEffect(() => {
    if (workermanageruri) {
      const workermanager = new WorkerManager(workermanageruri, fnrf_zst)
      workermanager.on_setWorker = setWorker
      fnrf_zst.workermanager = workermanager
    }
  }, [workermanageruri])

  fnrf_zst.worker = worker
  fnrf_zst.auto_progress()
  // const worker = new WebSocketWorker("ws://localhost:9382", fnrf_zst);
  // fnrf_zst.worker = worker;

  return (
    <FuncNodesContext.Provider value={fnrf_zst}>
      <div className='funcnodesreactflowcontainer'>
        <FuncnodesHeader></FuncnodesHeader>

        <div className='funcnodesreactflowbody'>
          <Library></Library>
          <ReactFlowLayer></ReactFlowLayer>
        </div>
      </div>
    </FuncNodesContext.Provider>
  )
}

const FuncnodesReactFlow = ({
  useWorkerManager = true,
  default_worker = undefined
}: FuncnodesReactFlowProps) => {
  if (!useWorkerManager && default_worker === undefined) {
    return (
      <div>
        Error: If you don't use a worker manager, you must provide a default
        worker.
      </div>
    )
  }

  const fnrf_zst = FuncNodesReactFlowZustand({
    useWorkerManager,
    default_worker
  })

  if (default_worker) {
    default_worker.set_zustand(fnrf_zst)
  }

  // @ts-ignore
  window.fnrf_zst = fnrf_zst // For debugging
  return <InnerFuncnodesReactFlow fnrf_zst={fnrf_zst} />
}

export default FuncnodesReactFlow
export { FuncNodesContext }
