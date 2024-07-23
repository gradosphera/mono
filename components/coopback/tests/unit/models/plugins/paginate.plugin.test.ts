import mongoose, { PaginateModel } from 'mongoose';
import { setupTestDB } from '../../../utils/setupTestDB';
import { paginate } from '../../../../src/models/plugins';

interface IProject extends mongoose.Document {
  name: string;
}

interface ITask extends mongoose.Document {
  name: string;
  project: mongoose.Schema.Types.ObjectId;
}

const projectSchema = new mongoose.Schema<IProject>({
  name: {
    type: String,
    required: true,
  },
});

projectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
});

projectSchema.plugin(paginate);

const Project = mongoose.model<IProject, PaginateModel<IProject>>('Project', projectSchema);

const taskSchema = new mongoose.Schema<ITask>({
  name: {
    type: String,
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
});

taskSchema.plugin(paginate);

const Task = mongoose.model<ITask, PaginateModel<ITask>>('Task', taskSchema);

setupTestDB();

describe('paginate plugin', () => {
  describe('populate option', () => {
    test('should populate the specified data fields', async () => {
      const project = await Project.create({ name: 'Project One' });
      const task = await Task.create({ name: 'Task One', project: project._id });

      const taskPages = await Task.paginate({ _id: task._id }, { populate: 'project' });

      expect(taskPages.results[0].project).toHaveProperty('_id', project._id);
    });

    test('should populate nested fields', async () => {
      const project = await Project.create({ name: 'Project One' });
      const task = await Task.create({ name: 'Task One', project: project._id });

      const projectPages = await Project.paginate({ _id: project._id }, { populate: 'tasks.project' });
      const { tasks } = projectPages.results[0] as any;

      expect(tasks).toHaveLength(1);
      expect(tasks[0]).toHaveProperty('_id', task._id);
      expect(tasks[0].project).toHaveProperty('_id', project._id);
    });
  });
});
