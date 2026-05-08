import Agents from '@/models/Agents';
import User from '@/models/User';

export async function deleteAgentById(agentId: string) {
  const agent = await Agents.findById(agentId);

  if (!agent) return null;

  const user = await User.findById(agent.userId);

  if (user?.role !== 'Admin') {
    await User.findByIdAndDelete(agent.userId);
  }

  await Agents.findByIdAndDelete(agentId);

  return true;
}
