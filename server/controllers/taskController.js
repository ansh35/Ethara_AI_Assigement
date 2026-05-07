import asyncHandler from 'express-async-handler';
import Task from '../models/Task.js';
import Project from '../models/Project.js';

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  const { status, priority, projectId } = req.query;
  
  let filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (projectId) filter.project = projectId;

  let tasks;
  if (req.user.role === 'ADMIN') {
    tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .sort({ createdAt: -1 });
  } else {
    // Member sees tasks from projects they are members of
    const userProjects = await Project.find({ members: req.user._id }).select('_id');
    const projectIds = userProjects.map(p => p._id);
    
    filter.project = projectId ? projectId : { $in: projectIds };
    
    tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .sort({ createdAt: -1 });
  }

  res.json(tasks);
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email')
    .populate('project', 'title members');

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // If member, check if they are part of the project
  if (req.user.role !== 'ADMIN') {
    const isMember = task.project.members.some(
      memberId => memberId.toString() === req.user._id.toString()
    );
    if (!isMember) {
      res.status(403);
      throw new Error('Not authorized to view this task');
    }
  }

  res.json(task);
});

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate, assignedTo, project } = req.body;

  const projectExists = await Project.findById(project);
  if (!projectExists) {
    res.status(404);
    throw new Error('Project not found');
  }

  const task = new Task({
    title,
    description,
    status,
    priority,
    dueDate,
    assignedTo,
    project,
    createdBy: req.user._id,
  });

  const createdTask = await task.save();
  res.status(201).json(createdTask);
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate, assignedTo } = req.body;

  const task = await Task.findById(req.params.id).populate('project');

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Admin can update everything. Member can only update status if they are assigned to it or in the project.
  if (req.user.role === 'ADMIN') {
    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.dueDate = dueDate || task.dueDate;
    task.assignedTo = assignedTo || task.assignedTo;
  } else {
    // Member access control
    const isMember = task.project.members.some(
      memberId => memberId.toString() === req.user._id.toString()
    );
    if (isMember) {
      // Allow member to only update status
      if (status) task.status = status;
    } else {
      res.status(403);
      throw new Error('Not authorized to update this task');
    }
  }

  const updatedTask = await task.save();
  res.json(updatedTask);
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (task) {
    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } else {
    res.status(404);
    throw new Error('Task not found');
  }
});

export {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
