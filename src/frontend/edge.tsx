import { EdgeProps, getBezierPath, BaseEdge } from 'reactflow'
import './edge.scss'
import React from 'react'

const DefaultEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  ...props
}: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  })

  return (
    <>
      <BaseEdge id={id} path={edgePath} {...props} />
    </>
  )
}

export default DefaultEdge
