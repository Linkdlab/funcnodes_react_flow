import './App.css'
import FuncnodesReactFlow from '@linkdlab/funcnodes_react_flow'
import '@linkdlab/funcnodes_react_flow/dist/css/style.css'

function App() {
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
      <FuncnodesReactFlow></FuncnodesReactFlow>
    </div>
  )
}
export default App
