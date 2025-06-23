import React from "react"
import PropTypes from "prop-types"

function Subtitle({ styleClass, children }) {
  return (
    <div
      className={`text-xl font-semibold text-black dark:text-white ${styleClass}`}
    >
      {children}
    </div>
  )
}
Subtitle.propTypes = {
  styleClass: PropTypes.string,
  children: PropTypes.node,
}

export default Subtitle
