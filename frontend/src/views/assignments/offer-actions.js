import React from "react";
import { connect } from "react-redux";
import { offerTableSelector } from "../offertable/actions";
import { assignmentsSelector } from "../../api/actions";
import {
    offerForAssignmentCreate,
    offerForAssignmentEmail,
    offerForAssignmentNag,
    offerForAssignmentWithdraw,
    setOfferForAssignmentAccepted,
    setOfferForAssignmentRejected,
} from "../../api/actions";
import {
    FaEnvelope,
    FaBan,
    FaCheck,
    FaUserTimes,
    FaUserClock,
    FaUserPlus,
} from "react-icons/fa";
import { ActionButton } from "../../components/action-buttons";
import { Button, Modal } from "react-bootstrap";

/**
 * Functions to test what actions you can do with a particular assignment
 */
const OfferTest = {
    canCreate(assignment) {
        return (
            assignment.active_offer_status == null ||
            assignment.active_offer_status === "withdrawn"
        );
    },
    canEmail(assignment) {
        return assignment.active_offer_status != null;
    },
    canNag(assignment) {
        return assignment.active_offer_status === "pending";
    },
    canWithdraw(assignment) {
        return assignment.active_offer_status != null;
    },
    canAccept(assignment) {
        return assignment.active_offer_status != null;
    },
    canReject(assignment) {
        return assignment.active_offer_status != null;
    },
};

function OfferActionButtons(props) {
    const selectedAssignments = props.assignments;
    const {
        offerForAssignmentCreate,
        offerForAssignmentEmail,
        offerForAssignmentNag,
        offerForAssignmentWithdraw,
        setOfferForAssignmentAccepted,
        setOfferForAssignmentRejected,
    } = props;

    const [show, setShow] = React.useState(false);
    const [offerBrief, setOfferBrief] = React.useState("");

    const hideOfferWithdrawConfirmation = () => setShow(false);
    const showOfferWithdrawConfirmation = () => setShow(true);
    const setMultipleOfferWithdrawBrief = (briefString) =>
        setOfferBrief(briefString);

    function createOffers() {
        for (const assignment of selectedAssignments) {
            offerForAssignmentCreate(assignment);
        }
    }
    function confirmOfferWithdraw() {
        // if withdrawing multiple offers at once, show confirmation
        if (selectedAssignments?.length > 1) {
            let multipleOfferWithdrawBrief = "";

            selectedAssignments.forEach((selectedAssignment) => {
                multipleOfferWithdrawBrief += `${selectedAssignment.applicant.first_name} ${selectedAssignment.applicant.last_name}: ${selectedAssignment.position.position_code} (${selectedAssignment.hours} hrs)\n`;
            });

            setMultipleOfferWithdrawBrief(multipleOfferWithdrawBrief);
            showOfferWithdrawConfirmation();
        } else {
            // does not need confirmation if only withdrawing one offer
            withdrawOffers();
        }
    }
    function withdrawOffers() {
        for (const assignment of selectedAssignments) {
            offerForAssignmentWithdraw(assignment);
        }
        hideOfferWithdrawConfirmation();
    }
    function emailOffers() {
        for (const assignment of selectedAssignments) {
            offerForAssignmentEmail(assignment);
        }
    }
    function nagOffers() {
        for (const assignment of selectedAssignments) {
            offerForAssignmentNag(assignment);
        }
    }
    function acceptOffers() {
        for (const assignment of selectedAssignments) {
            setOfferForAssignmentAccepted(assignment);
        }
    }
    function rejectOffers() {
        for (const assignment of selectedAssignments) {
            setOfferForAssignmentRejected(assignment);
        }
    }

    const actionPermitted = {};
    for (const key of [
        "canCreate",
        "canEmail",
        "canNag",
        "canWithdraw",
        "canAccept",
        "canReject",
    ]) {
        actionPermitted[key] =
            selectedAssignments.length !== 0 &&
            selectedAssignments.every(OfferTest[key]);
    }

    return (
        <React.Fragment>
            <ActionButton
                icon={<FaUserPlus />}
                onClick={createOffers}
                disabled={!actionPermitted.canCreate}
            >
                Create Offer
            </ActionButton>
            <ActionButton
                icon={<FaUserTimes />}
                onClick={confirmOfferWithdraw}
                disabled={!actionPermitted.canWithdraw}
            >
                Withdraw Offer
            </ActionButton>
            <ActionButton
                icon={<FaEnvelope />}
                onClick={emailOffers}
                disabled={!actionPermitted.canEmail}
            >
                Email Offer
            </ActionButton>
            <ActionButton
                icon={<FaUserClock />}
                onClick={nagOffers}
                disabled={!actionPermitted.canNag}
            >
                Nag Offer
            </ActionButton>
            <ActionButton
                icon={<FaCheck />}
                onClick={acceptOffers}
                disabled={!actionPermitted.canAccept}
            >
                Set as Accepted
            </ActionButton>
            <ActionButton
                icon={<FaBan />}
                onClick={rejectOffers}
                disabled={!actionPermitted.canReject}
            >
                Set as Rejected
            </ActionButton>
            <Modal show={show} onHide={hideOfferWithdrawConfirmation}>
                <Modal.Header closeButton>
                    <Modal.Title>Withdrawing Multiple Offers</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    You are withdrawing from the following{" "}
                    {selectedAssignments?.length} offers!
                    <br />
                    <br />
                    <div style={{ whiteSpace: "pre-line" }}>{offerBrief}</div>
                    <br />
                    Are you sure?
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={hideOfferWithdrawConfirmation}
                        variant="light"
                    >
                        Cancel
                    </Button>
                    <Button onClick={withdrawOffers}>Withdraw</Button>
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    );
}
export const ConnectedOfferActionButtons = connect(
    (state) => {
        // pass in the currently selected assignments.
        const { selectedAssignmentIds } = offerTableSelector(state);
        const assignments = assignmentsSelector(state);
        return {
            assignments: assignments.filter((x) =>
                selectedAssignmentIds.includes(x.id)
            ),
        };
    },
    {
        offerForAssignmentCreate,
        offerForAssignmentEmail,
        offerForAssignmentNag,
        offerForAssignmentWithdraw,
        setOfferForAssignmentAccepted,
        setOfferForAssignmentRejected,
    }
)(OfferActionButtons);
