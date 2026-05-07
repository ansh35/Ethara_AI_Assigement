import asyncHandler from 'express-async-handler';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Team from '../models/Team.js';

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
  let projects;
  if (req.user.role === 'ADMIN') {
    projects = await Project.find({}).populate('createdBy', 'name email').populate('members', 'name email role').populate({
      path: 'team',
      populate: { path: 'members', select: 'name email role' }
    });
  } else {
    // Find teams user belongs to
    const userTeams = await Team.find({ members: req.user._id });
    const teamIds = userTeams.map(t => t._id);

    projects = await Project.find({
      $or: [
        { members: req.user._id },
        { team: { $in: teamIds } }
      ]
    }).populate('createdBy', 'name email').populate('members', 'name email role').populate({
      path: 'team',
      populate: { path: 'members', select: 'name email role' }
    });
  }
  res.json(projects);
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('createdBy', 'name email').populate('members', 'name email role');

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Check if member is part of the project, part of the team, or is admin
  const isMember = project.members.some(member => member._id.toString() === req.user._id.toString());
  
  let isTeamMember = false;
  if (project.team) {
    const team = await Team.findById(project.team);
    if (team && team.members.some(m => m.toString() === req.user._id.toString())) {
      isTeamMember = true;
    }
  }

  if (req.user.role !== 'ADMIN' && !isMember && !isTeamMember) {
    res.status(403);
    throw new Error('Not authorized to view this project');
  }

  res.json(project);
});

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = asyncHandler(async (req, res) => {
  const { title, description, members, team } = req.body;

  const project = new Project({
    title,
    description,
    team: team || undefined,
    createdBy: req.user._id,
    members: members || [req.user._id], // Include creator as member by default
  });

  const createdProject = await project.save();
  res.status(201).json(createdProject);
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  const project = await Project.findById(req.params.id);

  if (project) {
    project.title = title || project.title;
    project.description = description || project.description;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (project) {
    await project.deleteOne();
    res.json({ message: 'Project removed' });
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
});

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private/Admin
const addMember = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('User to add not found');
  }

  if (project.members.includes(user._id)) {
    res.status(400);
    throw new Error('User is already a member');
  }

  project.members.push(user._id);
  await project.save();

  res.status(200).json(project);
});

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:memberId
// @access  Private/Admin
const removeMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  project.members = project.members.filter(
    (memberId) => memberId.toString() !== req.params.memberId
  );

  await project.save();
  res.status(200).json(project);
});

export {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
