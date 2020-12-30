import React from "react";
import PropTypes from "prop-types";
import { formatDate } from "../libs/utils";
import { createDiffColumnsFromColumns } from "./diff-table";
import { AdvancedFilterTable } from "./advanced-filter-table";

const DEFAULT_COLUMNS = [
    { Header: "Last Name", accessor: "applicant.last_name" },
    { Header: "First Name", accessor: "applicant.first_name" },
    { Header: "Position Code", accessor: "position.position_code" },
    { Header: "Hours", accessor: "hours", className: "number-cell" },
    {
        Header: "Start",
        accessor: "start_date",
        Cell: (row) => formatDate(row.value) || "",
    },
    {
        Header: "End",
        accessor: "end_date",
        Cell: (row) => formatDate(row.value) || "",
    },
];

/**
 * Display a DiffSpec array of assignments and highlight the changes.
 *
 * @export
 * @param {*} { modifiedInstructors }
 * @returns
 */
export function AssignmentsDiffList({ modifiedAssignments }) {
    return (
        <AssignmentsList
            assignments={modifiedAssignments}
            columns={createDiffColumnsFromColumns(DEFAULT_COLUMNS)}
        />
    );
}

function AssignmentsList(props) {
    const { assignments, columns = DEFAULT_COLUMNS } = props;
    return <AdvancedFilterTable data={assignments} columns={columns} />;
}
AssignmentsList.propTypes = {
    assignments: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            position: PropTypes.object,
            applicant: PropTypes.object,
        })
    ).isRequired,
};

export { AssignmentsList };
