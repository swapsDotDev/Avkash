import React from "react"
import ReactPaginate from "react-paginate"
import { useTranslation } from "react-i18next"
import PropTypes from "prop-types"
const Pagination = ({
  pageCount,
  onPageChange,
  currentPage,
}) => {
  const { t } = useTranslation()
  if (pageCount <= 1) {
    return null
  }
  return (
    <ReactPaginate
      previousLabel={
        <button
          className={`previous-page text-sm ${currentPage === 0 ? "custom-pagination-disabled cursor-not-allowed text-gray-500" : "text-gray-800"}`}
        >
          {t("Previous")}
        </button>
      }
      nextLabel={
        <button
          className={` next-page text-sm ${currentPage === pageCount - 1 ? "custom-pagination-disabled cursor-not-allowed text-gray-500" : "text-gray-800"}`}
        >
          {t("Next")}
        </button>
      }
      pageCount={pageCount}
      marginPagesDisplayed={2}
      pageRangeDisplayed={5}
      onPageChange={onPageChange}
      containerClassName={
        "flex justify-center items-center space-x-2"
      }
      activeClassName={"text-gray font-medium"}
      className={"flex text-gray/80 text-sm"}
      breakClassName="py-5"
      pageClassName={"px-1 py-5 rounded"}
      previousClassName={`px-1 py-4 rounded ${currentPage === 0 ? "text-gray" : ""}`}
      nextClassName={`px-1 py-4 rounded ${currentPage === pageCount - 1 ? "text-gray" : ""}`}
    />
  )
}
Pagination.propTypes = {
  pageCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
}

export default Pagination
