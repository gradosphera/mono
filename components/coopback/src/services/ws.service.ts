import { SovietContract } from 'cooptypes';
import { userService } from '.';
import { User } from '../models';

export const updateBoard = async (action: SovietContract.Actions.Boards.UpdateBoard.IUpdateBoard): Promise<void> => {
  //сброс всех прав
  const users = await User.find({ role: { $in: ['member', 'chairman'] } }).exec();
  for (const user of users) {
    user.role = 'user';
    await user.save();
  }

  for (const member of action.members) {
    const user = await userService.getUserByUsername(member.username);
    user.role = 'member';
    await user.save();
  }

  const chairman = await userService.getUserByUsername(action.chairman);
  chairman.role = 'chairman';
  await chairman.save();
};
