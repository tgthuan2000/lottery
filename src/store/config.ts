/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from "dayjs";
import { isEmpty } from "lodash";
import { v4 as uuid } from "uuid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import Ticket from "~/shared/service/ticket";

const createBase = (): IBase => {
  return {
    _id: uuid(),
    _createdAt: dayjs().toDate(),
  };
};

const createDefaultSlot = (): ISlot => {
  return {
    ...createBase(),
    name: "",
    prizes: {},
    tickets: {},
  };
};

const defaultValue = {
  prizeName: "Prize 1",
  slotName: "Slot 1",
};

const generateDefaultSlot = (options: { prizeName?: string; slotName?: string } = defaultValue) => {
  const { prizeName, slotName } = options;
  const slotId = uuid();
  const ticketId = uuid();
  const prizeId = uuid();
  const winnerTicketId = uuid();

  const _createdAt = dayjs().toDate();

  const defaultTicket = {
    [ticketId]: {
      _id: ticketId,
      _createdAt,
      label: "001",
      value: 1,
      owner: undefined,
    },
  };

  const defaultPrize: Record<string, IPrize> = {
    [prizeId]: {
      _id: prizeId,
      _createdAt,
      name: prizeName ?? defaultValue.prizeName,
      value: 1000,
      tickets: defaultTicket,
      winningTickets: {
        [winnerTicketId]: {
          _id: winnerTicketId,
          _createdAt,
          ticket: undefined,
        },
      },
      asset: undefined,
    },
  };

  const defaultSlot: ISlot = {
    _id: slotId,
    _createdAt,
    name: slotName ?? defaultValue.slotName,
    tickets: defaultTicket,
    prizes: defaultPrize,
  };

  return { ...createDefaultSlot(), ...defaultSlot };
};

export type ConfigStore = {
  /**
   * SLOT
   */
  slots: Record<string, ISlot>;
  addSlot(slotName?: string): void;
  setSlot(
    slotId: string | undefined
  ): <T extends ISlot = ISlot>(field: keyof T, value: T[keyof T]) => void;
  getSlot(slotId: string | undefined): ISlot | undefined;
  removeSlot(slotId: string): void;
  generateTicket(slotId: string | undefined): (from: number, to: number) => void;

  /**
   * TICKET
   */
  deleteTicket(slotId: string | undefined): (ticketId: string) => void;
  deleteAllTicket(slotId: string | undefined): () => void;

  /**
   * PRIZE
   */
  addPrize(slotId: string | undefined): (prizeName?: string) => void;
  setPrize(
    slotId: string | undefined
  ): <T extends IPrize = IPrize>(prizeId: string, field: keyof T, value: T[keyof T]) => void;
  setPrizeSlot(slotId: string | undefined): (prizeId: string, slotNum: number) => void;
  deletePrize(slotId: string | undefined): (prizeId: string) => void;
  deletePrizeTicket(slotId: string | undefined): (prizeId: string, ticketId: string) => void;
  deleteAllPrizeTicket(slotId: string | undefined): (prizeId: string) => void;
  addPrizeTicket(
    slotId: string | undefined
  ): (
    prizeId: string,
    ticketId: string,
    payload?: Partial<Omit<ITicket, "_id" | "_createdAt">>
  ) => void;
  generatePrizeTicket(
    slotId: string | undefined
  ): (prizeId: string, from: number, to: number) => void;

  /**
   * UTILS
   */
  convertToList: <T>(object: Record<string, T> | undefined) => T[];
};

export const useConfig = create<ConfigStore>()(
  persist(
    (setConfig, getConfig) => {
      /**
       * PRIVATE
       */

      const defaultSlot = generateDefaultSlot();

      return {
        /**
         * SLOT
         */
        slots: { [defaultSlot._id]: defaultSlot },

        addSlot(slotName = `Slot ${Object.keys(getConfig().slots).length + 1}`) {
          setConfig((state) => {
            const slot = generateDefaultSlot({ slotName });

            state.slots[slot._id] = slot;

            return { slots: state.slots };
          });
        },

        setSlot(slotId) {
          return (field, value) => {
            if (!slotId) return;

            setConfig((state) => {
              state.slots[slotId][field as keyof ISlot] = value as never;

              return { slots: state.slots };
            });
          };
        },

        getSlot(slotId) {
          if (!slotId) {
            return;
          }

          const { slots } = getConfig();

          return slots[slotId];
        },

        removeSlot(slotId) {
          setConfig((state) => {
            delete state.slots[slotId];

            return {
              slots: state.slots,
            };
          });
        },

        generateTicket(slotId) {
          return (from, to) => {
            if (!slotId) return;

            setConfig((state) => {
              if (!state.slots[slotId]) {
                return { slots: state.slots };
              }

              const tickets = Ticket.generateTickets(from, to);

              state.slots[slotId].tickets = Ticket.TicketsFormatter(tickets);
              state.slots[slotId].maxLength = to.toString().length;
              state.slots[slotId].from = from;
              state.slots[slotId].to = to;

              return { slots: state.slots };
            });
          };
        },

        /**
         * TICKET
         */
        deleteTicket(slotId) {
          return (ticketId) => {
            if (!slotId) return;

            setConfig((state) => {
              if (!state.slots[slotId]) {
                return { slots: state.slots };
              }

              delete state.slots[slotId].tickets[ticketId];

              return { slots: state.slots };
            });
          };
        },

        deleteAllTicket(slotId) {
          return () => {
            if (!slotId) return;

            setConfig((state) => {
              if (!state.slots[slotId]) {
                return { slots: state.slots };
              }

              state.slots[slotId].tickets = {};

              return { slots: state.slots };
            });
          };
        },

        /**
         * PRIZE
         */
        addPrize(slotId) {
          return (prizeName = "New Prize") => {
            if (!slotId) return;

            setConfig((state) => {
              const newPrizeId = uuid();

              state.slots[slotId].prizes[newPrizeId] = {
                _id: newPrizeId,
                _createdAt: dayjs().toDate(),
                name: prizeName,
                value: prizeName,
                tickets: {},
                winningTickets: {},
                asset: undefined,
              };

              return { slots: state.slots };
            });
          };
        },

        setPrize(slotId) {
          return (prizeId, field, value) => {
            if (!slotId) return;

            setConfig((state) => {
              state.slots[slotId].prizes[prizeId][field as keyof IPrize] = value as never;

              return { slots: state.slots };
            });
          };
        },

        setPrizeSlot(slotId) {
          return (prizeId, slotNum) => {
            if (!slotId) return;

            setConfig((state) => {
              state.slots[slotId].prizes[prizeId].winningTickets = Array.from({
                length: slotNum,
              }).reduce<Record<string, IWinningTicket>>((result) => {
                const _id = uuid();

                result[_id] = {
                  _id,
                  _createdAt: dayjs().toDate(),
                  ticket: undefined,
                };

                return result;
              }, {});

              return { slots: state.slots };
            });
          };
        },

        deletePrize(slotId) {
          return (prizeId) => {
            if (!slotId) return;

            setConfig((state) => {
              delete state.slots[slotId].prizes[prizeId];

              return { slots: state.slots };
            });
          };
        },

        deletePrizeTicket(slotId) {
          return (prizeId, ticketId) => {
            if (!slotId) return;

            setConfig((state) => {
              delete state.slots[slotId].prizes[prizeId].tickets[ticketId];

              return { slots: state.slots };
            });
          };
        },

        deleteAllPrizeTicket(slotId) {
          return (prizeId) => {
            if (!slotId) return;

            setConfig((state) => {
              state.slots[slotId].prizes[prizeId].tickets = {};

              return { slots: state.slots };
            });
          };
        },

        addPrizeTicket(slotId) {
          return (prizeId, ticketId) => {
            if (!slotId) return;

            setConfig((state) => {
              delete state.slots[slotId].prizes[prizeId].tickets[ticketId];

              return { slots: state.slots };
            });
          };
        },

        generatePrizeTicket(slotId) {
          return (prizeId, from, to) => {
            if (!slotId) return;

            setConfig((state) => {
              if (!state.slots[slotId]) {
                return { slots: state.slots };
              }

              const tickets = Ticket.generateTickets(from, to, state.slots[slotId].maxLength);

              state.slots[slotId].prizes[prizeId].tickets = Ticket.TicketsFormatter(tickets);

              return {
                slots: state.slots,
              };
            });
          };
        },

        /**
         * UTILS
         */
        convertToList(object) {
          if (!object || isEmpty(object)) {
            return [];
          }

          return Object.values(object);
        },
      };
    },
    {
      name: "lottery",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
