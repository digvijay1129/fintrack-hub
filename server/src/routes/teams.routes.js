import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import {
  acceptInvitation, archiveTeam, cancelInvitation, createInvitation, createTeam,
  getTeam, listMyInvitations, listTeams, rejectInvitation, removeTeamMember, updateTeam
} from "../controllers/teams.controller.js";

const router = Router();
router.use(authenticate);
router.get("/invitations/mine", listMyInvitations);
router.post("/invitations/:invitationId/accept", acceptInvitation);
router.post("/invitations/:invitationId/reject", rejectInvitation);
router.get("/", listTeams);
router.post("/", createTeam);
router.get("/:id", getTeam);
router.patch("/:id", updateTeam);
router.delete("/:id", archiveTeam);
router.post("/:id/invitations", createInvitation);
router.delete("/:id/invitations/:invitationId", cancelInvitation);
router.delete("/:id/members/:userId", removeTeamMember);
export default router;
