/**
 * Import function triggers from their respective submodules:
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { setGlobalOptions } = require("firebase-functions");
const { onValueUpdated } = require("firebase-functions/v2/database");
const logger = require("firebase-functions/logger");

// Global configuration for your Cloud Functions
setGlobalOptions({ maxInstances: 10 });

// 1. Monitor Deposits Path for Auto-Deletion
exports.deleteDepositOnStatusChange = onValueUpdated("/deposits/{userId}/{depositId}", async (event) => {
    // If the data does not exist (already deleted), exit to stop infinite loops
    if (!event.data.after.exists()) return null;

    const current = event.data.after.val();
    const previous = event.data.before.val();

    // Trigger deletion if status becomes "approved" or "rejected"
    if ((current?.status === "approved" || current?.status === "rejected") && previous?.status !== current.status) {
        try {
            await event.data.after.ref.remove();
            logger.info(`Auto-deleted deposit ${event.params.depositId} for user ${event.params.userId} (Status: ${current.status})`);
        } catch (error) {
            logger.error("Failed to delete deposit:", error);
        }
    }
    return null;
});

// 2. Monitor Withdrawals Path for Auto-Deletion
exports.deleteWithdrawalOnStatusChange = onValueUpdated("/withdrawals/{userId}/{withdrawalId}", async (event) => {
    // If the data does not exist (already deleted), exit to stop infinite loops
    if (!event.data.after.exists()) return null;

    const current = event.data.after.val();
    const previous = event.data.before.val();

    // Trigger deletion if status becomes "approved" or "rejected"
    if ((current?.status === "approved" || current?.status === "rejected") && previous?.status !== current.status) {
        try {
            await event.data.after.ref.remove();
            logger.info(`Auto-deleted withdrawal ${event.params.withdrawalId} for user ${event.params.userId} (Status: ${current.status})`);
        } catch (error) {
            logger.error("Failed to delete withdrawal:", error);
        }
    }
    return null;
});
