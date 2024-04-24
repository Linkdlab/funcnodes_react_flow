import './App.css'
import FuncnodesReactFlow, {
  WebSocketWorker
} from '@linkdlab/funcnodes_react_flow'
import '@linkdlab/funcnodes_react_flow/dist/css/style.css'

function App() {
  const worker = new WebSocketWorker({
    url: 'ws://localhost:9382',
    uuid: '1234'
  })
  return (
    <div
      className='App'
      style={{
        height: '98vh',
        width: '98vw',
        marginLeft: '1vw',
        marginTop: '1vh'
      }}
    >
      <FuncnodesReactFlow
        useWorkerManager={false}
        default_worker={worker}
      ></FuncnodesReactFlow>
    </div>
  )
}
export default App
