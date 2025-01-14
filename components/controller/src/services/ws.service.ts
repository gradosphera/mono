import { SovietContract } from 'cooptypes';
import { userService } from '.';
import { User } from '../models';
import config from '../config/config';

export const updateBoard = async (action: SovietContract.Actions.Boards.UpdateBoard.IUpdateBoard): Promise<void> => {
  //сброс всех прав
  if (action.coopname != config.coopname) return;

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

  const chairman_username = action.members.find((el) => el.position == 'chairman')?.username;

  const chairman = await userService.getUserByUsername(chairman_username as string);
  chairman.role = 'chairman';
  await chairman.save();
};
