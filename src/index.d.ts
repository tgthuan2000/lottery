interface IBase {
  _id: string;
  _createdAt: Date;
}

interface ISlot extends IBase {
  name: string;
  prizes: Record<string, IPrize>;
  tickets: Record<string, ITicket>;
}

interface IPrize extends IBase {
  name: string;
  value: number | string;
  asset?: string;
  tickets: Record<string, ITicket>;
  winningTickets: Record<string, IWinningTicket>;
}

interface IWinningTicket extends IBase {
  ticket?: ITicket;
}

interface ITicket extends IBase {
  label: number | string;
  value: number | string;
  owner?: string;
}
