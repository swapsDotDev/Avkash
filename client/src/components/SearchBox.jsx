import React from "react"
import { IoIosSearch } from "react-icons/io"
import PropTypes from "prop-types"

const SearchBox = ({
  placeholder,
  searchValue,
  handleOnchange,
  heightBox = "30px",
}) => {
  return (
    <div
      className="flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-2"
      style={{ height: heightBox }}
    >
      <IoIosSearch className="text-gray-700 dark:text-gray-400 mr-3" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) =>
          handleOnchange(e.target.value)
        }
        className="bg-transparent text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none w-full text-sm"
      />
    </div>
  )
}

SearchBox.propTypes = {
  placeholder: PropTypes.string.isRequired,
  searchValue: PropTypes.string.isRequired,
  handleOnchange: PropTypes.func.isRequired,
  heightBox: PropTypes.string,
}
export default SearchBox
