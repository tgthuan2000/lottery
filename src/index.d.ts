interface IBase {
  _id: string;
  _createdAt: Date;
}

interface ISlot extends IBase {
  name: string;
  textColor?: string;
  textColor2?: string;
  maxLength?: number;
  from?: number;
  to?: number;
  prizes: Record<string, IPrize>;
  tickets: Record<string, ITicket>;
  minimizeTicket?: boolean;
  history: Record<string, IHistory>;
  password?: string;
  background?: string;
}

interface IPrize extends IBase {
  name: string;
  value: number | string;
  asset?: string;
  tickets: Record<string, ITicket>;
  slot: number;
  minimized?: boolean;
}

interface ITicket extends IBase {
  label: number | string;
  value: number | string;
  owner?: string;
}

interface IHistory extends IBase {
  name?: string;
  prizes: Record<string, Record<number, ITicket>>;
}
