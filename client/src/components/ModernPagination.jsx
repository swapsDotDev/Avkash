import React from "react"
import PropTypes from "prop-types"
import {
  FiChevronsLeft,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsRight,
} from "react-icons/fi"

const ModernPagination = ({
  total,
  pageSize = 5,
  siblingCount = 1,
  currentPage,
  onPageChange,
  showEdges = true,
}) => {
  const totalPages = Math.ceil(total / pageSize)

  const generatePaginationItems = () => {
    const items = []
    const leftSiblingIndex = Math.max(
      0,
      currentPage - siblingCount
    )
    const rightSiblingIndex = Math.min(
      totalPages - 1,
      currentPage + siblingCount
    )

    const showLeftDots = leftSiblingIndex > 1
    const showRightDots =
      rightSiblingIndex < totalPages - 2

    if (showEdges && showLeftDots) {
      items.push({ type: "page", value: 1 })
      items.push({
        type: "ellipsis",
        index: "left",
      })
    }

    for (
      let i = leftSiblingIndex;
      i <= rightSiblingIndex;
      i++
    ) {
      items.push({ type: "page", value: i + 1 })
    }

    if (showEdges && showRightDots) {
      items.push({
        type: "ellipsis",
        index: "right",
      })
      items.push({
        type: "page",
        value: totalPages,
      })
    }

    return items
  }

  const items = generatePaginationItems()

  return (
    <div className="flex items-center gap-1">
      {showEdges && (
        <button
          className="w-7 h-7 flex items-center justify-center rounded text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white disabled:opacity-50 focus:outline focus:outline-1 focus:outline-offset-1"
          onClick={() =>
            onPageChange({ selected: 0 })
          }
          disabled={currentPage === 0}
          aria-label="First page"
        >
          <FiChevronsLeft />
        </button>
      )}

      <button
        className="w-7 h-7 flex items-center justify-center rounded mr-4 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white disabled:opacity-50 focus:outline focus:outline-1 focus:outline-offset-1"
        onClick={() =>
          onPageChange({
            selected: Math.max(
              0,
              currentPage - 1
            ),
          })
        }
        disabled={currentPage === 0}
        aria-label="Previous page"
      >
        <FiChevronLeft />
      </button>

      {items.map((page) =>
        page.type === "page" ? (
          <button
            key={`page-${page.value}`}
            className={`w-7 h-7 flex items-center justify-center rounded transition focus:outline focus:outline-1 focus:outline-offset-1 ${
              currentPage === page.value - 1
                ? "bg-indigo-500 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white"
            }`}
            onClick={() =>
              onPageChange({
                selected: page.value - 1,
              })
            }
            aria-label={`Page ${page.value}`}
            aria-current={
              currentPage === page.value - 1
                ? "page"
                : undefined
            }
          >
            {page.value}
          </button>
        ) : (
          <span
            key={`ellipsis-${page.index}`}
            className="w-7 h-7 flex items-center justify-center text-gray-500 dark:text-gray-400"
            aria-hidden="true"
          >
            &#8230;
          </span>
        )
      )}

      <button
        className="w-7 h-7 flex items-center justify-center rounded ml-4 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white disabled:opacity-50 focus:outline focus:outline-1 focus:outline-offset-1"
        onClick={() =>
          onPageChange({
            selected: Math.min(
              totalPages - 1,
              currentPage + 1
            ),
          })
        }
        disabled={currentPage === totalPages - 1}
        aria-label="Next page"
      >
        <FiChevronRight />
      </button>

      {showEdges && (
        <button
          className="w-7 h-7 flex items-center justify-center rounded text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white disabled:opacity-50 focus:outline focus:outline-1 focus:outline-offset-1"
          onClick={() =>
            onPageChange({
              selected: totalPages - 1,
            })
          }
          disabled={
            currentPage === totalPages - 1
          }
          aria-label="Last page"
        >
          <FiChevronsRight />
        </button>
      )}
    </div>
  )
}

ModernPagination.propTypes = {
  total: PropTypes.number.isRequired,
  pageSize: PropTypes.number,
  siblingCount: PropTypes.number,
  currentPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  showEdges: PropTypes.bool,
}

export default ModernPagination
