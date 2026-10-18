import crypto from "node:crypto";
import mongoose from "mongoose";
import { z } from "zod";
import Team from "../models/Team.js";
import TeamInvitation from "../models/TeamInvitation.js";
import User from "../models/User.js";
import { createTeamSchema, updateTeamSchema, teamQuerySchema, inviteSchema, acceptInvitationSchema } from "../validators/team.schemas.js";
import { sendValidationError } from "../utils/validation.js";
import { httpError } from "../utils/http-error.js";

const regexSpecials = new Set(["\\\\", ".", "*", "+", "?", "^", "$", "{", "}", "(", ")", "|", "[", "]"]);
const escapeRegex = (value) => Array.from(value).map((ch) => regexSpecials.has(ch) ? "\\\\" + ch : ch).join("");
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
function ensureId(id, code) {
  if (!mongoose.isValidObjectId(id)) throw httpError(404, code, "The requested resource was not found.");
}
async function accessibleTeam(teamId, userId, ownerOnly = false) {
  ensureId(teamId, "TEAM_NOT_FOUND");
  const team = await Team.findOne({
    _id: teamId,
    "members.user": userId,
    status: "active"
  });
  if (!team) throw httpError(404, "TEAM_NOT_FOUND", "Team not found.");
  if (ownerOnly && String(team.owner) !== String(userId)) {
    throw httpError(403, "TEAM_OWNER_REQUIRED", "Only the team owner can perform this operation.");
  }
  return team;
}
function serializeTeam(team, userId) {
  return {
    id: String(team._id), name: team.name, description: team.description,
    ownerId: String(team.owner), membership: String(team.owner) === String(userId) ? "owner" : "member",
    memberCount: team.members.length, status: team.status, createdAt: team.createdAt, updatedAt: team.updatedAt
  };
}
export async function createTeam(req, res) {
  const parsed = createTeamSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  const team = await Team.create({
    ...parsed.data, owner: req.user.id, members: [{ user: req.user.id, joinedAt: new Date() }]
  });
  return res.status(201).json({ success: true, data: { team: serializeTeam(team, req.user.id) } });
}
export async function listTeams(req, res) {
  const parsed = teamQuerySchema.safeParse(req.query);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  const filter = { "members.user": req.user.id, status: "active" };
  if (parsed.data.membership === "owned") filter.owner = req.user.id;
  if (parsed.data.membership === "joined") filter.owner = { $ne: new mongoose.Types.ObjectId(req.user.id) };
  if (parsed.data.search) filter.name = { $regex: escapeRegex(parsed.data.search), $options: "i" };
  const teams = await Team.find(filter).sort({ updatedAt: -1 }).lean();
  return res.status(200).json({ success: true, data: { items: teams.map((team) => serializeTeam(team, req.user.id)) } });
}
export async function getTeam(req, res) {
  const team = await accessibleTeam(req.params.id, req.user.id);
  await team.populate("owner", "name email");
  await team.populate("members.user", "name email");
  return res.status(200).json({ success: true, data: { team: {
    ...serializeTeam(team, req.user.id),
    owner: team.owner ? { id: String(team.owner._id), name: team.owner.name, email: team.owner.email } : null,
    members: team.members.filter((member) => member.user).map((member) => ({
      id: String(member.user._id), name: member.user.name, email: member.user.email,
      joinedAt: member.joinedAt, isOwner: String(member.user._id) === String(team.owner?._id)
    }))
  } } });
}
export async function updateTeam(req, res) {
  const parsed = updateTeamSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  const team = await accessibleTeam(req.params.id, req.user.id, true);
  Object.assign(team, parsed.data);
  await team.save();
  return res.status(200).json({ success: true, data: { team: serializeTeam(team, req.user.id) } });
}
export async function archiveTeam(req, res) {
  const team = await accessibleTeam(req.params.id, req.user.id, true);
  team.status = "archived";
  await team.save();
  return res.status(200).json({ success: true, data: { message: "Team archived. Team records are preserved." } });
}
export async function createInvitation(req, res) {
  const team = await accessibleTeam(req.params.id, req.user.id, true);
  const parsed = inviteSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  if (team.members.length >= 100) throw httpError(409, "TEAM_MEMBER_LIMIT", "A team can have at most 100 members.");
  const existingUser = await User.findOne({ email: parsed.data.email }).select("_id");
  if (existingUser && team.members.some((member) => String(member.user) === String(existingUser._id))) {
    throw httpError(409, "ALREADY_TEAM_MEMBER", "This account is already a member of the team.");
  }
  const existingInvite = await TeamInvitation.findOne({
    team: team._id, email: parsed.data.email, status: "pending", expiresAt: { $gt: new Date() }
  });
  if (existingInvite) throw httpError(409, "INVITATION_ALREADY_PENDING", "An invitation for this email is already pending.");
  const token = crypto.randomBytes(24).toString("hex");
  const invitation = await TeamInvitation.create({
    team: team._id, email: parsed.data.email, invitedBy: req.user.id,
    tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 7 * 86_400_000)
  });
  // No email provider is configured yet. Show the one-time token only to the authorized inviter
  // so it can be shared out-of-band. Only the hash is stored in MongoDB.
  return res.status(201).json({ success: true, data: {
    invitation: { id: String(invitation._id), email: invitation.email, status: invitation.status, expiresAt: invitation.expiresAt },
    token
  } });
}
export async function listMyInvitations(req, res) {
  const now = new Date();
  await TeamInvitation.updateMany({ email: req.user.email, status: "pending", expiresAt: { $lte: now } }, { $set: { status: "expired" } });
  const invitations = await TeamInvitation.find({ email: req.user.email, status: "pending", expiresAt: { $gt: now } })
    .sort({ createdAt: -1 }).populate("team", "name description status owner").lean();
  return res.status(200).json({ success: true, data: { items: invitations.filter((item) => item.team?.status === "active").map((item) => ({
    id: String(item._id), teamId: String(item.team._id), teamName: item.team.name,
    description: item.team.description, expiresAt: item.expiresAt, createdAt: item.createdAt
  })) } });
}
export async function acceptInvitation(req, res) {
  ensureId(req.params.invitationId, "INVITATION_NOT_FOUND");
  const parsed = acceptInvitationSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  const invitation = await TeamInvitation.findOne({
    _id: req.params.invitationId,
    email: req.user.email,
    status: "pending",
    expiresAt: { $gt: new Date() },
    tokenHash: hashToken(parsed.data.token)
  });
  if (!invitation) throw httpError(404, "INVITATION_NOT_FOUND", "Invitation is invalid or expired.");
  const team = await Team.findOne({ _id: invitation.team, status: "active" });
  if (!team) throw httpError(404, "TEAM_NOT_FOUND", "This team is no longer available.");
  if (!team.members.some((member) => String(member.user) === req.user.id)) {
    if (team.members.length >= 100) throw httpError(409, "TEAM_MEMBER_LIMIT", "This team has reached the member limit.");
    await Team.updateOne(
      { _id: team._id, status: "active", "members.user": { $ne: req.user.id } },
      { $push: { members: { user: req.user.id, joinedAt: new Date() } } }
    );
  }
  invitation.status = "accepted";
  invitation.respondedAt = new Date();
  await invitation.save();
  return res.status(200).json({ success: true, data: { message: "Invitation accepted.", teamId: String(team._id) } });
}
export async function rejectInvitation(req, res) {
  ensureId(req.params.invitationId, "INVITATION_NOT_FOUND");
  const parsed = acceptInvitationSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  const invitation = await TeamInvitation.findOne({
    _id: req.params.invitationId, email: req.user.email, status: "pending",
    expiresAt: { $gt: new Date() }, tokenHash: hashToken(parsed.data.token)
  });
  if (!invitation) throw httpError(404, "INVITATION_NOT_FOUND", "Invitation is invalid or expired.");
  invitation.status = "rejected";
  invitation.respondedAt = new Date();
  await invitation.save();
  return res.status(200).json({ success: true, data: { message: "Invitation rejected." } });
}
export async function cancelInvitation(req, res) {
  const team = await accessibleTeam(req.params.id, req.user.id, true);
  ensureId(req.params.invitationId, "INVITATION_NOT_FOUND");
  const invitation = await TeamInvitation.findOneAndUpdate(
    { _id: req.params.invitationId, team: team._id, status: "pending" },
    { $set: { status: "cancelled", respondedAt: new Date() } },
    { new: true }
  );
  if (!invitation) throw httpError(404, "INVITATION_NOT_FOUND", "Pending invitation not found.");
  return res.status(200).json({ success: true, data: { message: "Invitation cancelled." } });
}
export async function removeTeamMember(req, res) {
  const team = await accessibleTeam(req.params.id, req.user.id, true);
  ensureId(req.params.userId, "TEAM_MEMBER_NOT_FOUND");
  if (String(team.owner) === String(req.params.userId)) {
    throw httpError(409, "CANNOT_REMOVE_OWNER", "The team owner cannot be removed; transfer ownership is not enabled in this phase.");
  }
  const result = await Team.updateOne(
    { _id: team._id, "members.user": req.params.userId },
    { $pull: { members: { user: new mongoose.Types.ObjectId(req.params.userId) } } }
  );
  if (result.modifiedCount === 0) throw httpError(404, "TEAM_MEMBER_NOT_FOUND", "Team member not found.");
  return res.status(200).json({ success: true, data: { message: "Member removed from the active team." } });
}
