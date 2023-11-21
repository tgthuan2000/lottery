import { Badge } from "antd";
import dayjs from "dayjs";
import { isNil } from "lodash";
import { XCircleIcon } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { cn } from "../../util";

type TicketProps = {
  selected?: boolean;
  value: ReactNode;
  onDelete?: () => void;
};

const Ticket = {
  randomInRange(num = 1000) {
    return ~~(Math.random() * num);
  },

  useRandomSelected(selectedFinal: number) {
    const [selected, setSelected] = useState<number | undefined>(undefined);

    useEffect(() => {
      const recursive = (
        timeLoop: number = 10000,
        timeRecursive: number = 300,
        interval: number | null = null,
        timeout: number | null = null
      ) => {
        if (interval) {
          clearInterval(interval);
        }

        if (timeout) {
          clearTimeout(timeout);
        }

        if (timeLoop <= 0) {
          setSelected(selectedFinal);
          return;
        }

        interval = setInterval(() => {
          setSelected(Ticket.randomInRange());
        }, timeLoop);

        timeout = setTimeout(() => {
          timeLoop -= 100;

          recursive(timeLoop, timeRecursive, interval, timeout);
        }, timeRecursive);
      };

      recursive(5000, 200);
    }, [selectedFinal]);

    return selected;
  },

  getNumber(
    number: string | number | null | undefined,
    maxLength: number = 4,
    character: string = "0"
  ) {
    if (isNil(number)) {
      return "";
    }

    if (typeof number === "number") {
      number = number.toString();
    }

    if (number.length < maxLength) {
      number = number.padStart(maxLength, character);
    }

    return number;
  },

  generateTickets(from: number, to: number) {
    const length = to - from;

    const numbers = Array.from({ length }).reduce<number[]>(
      (result, _, index) => {
        result.push(result[index] + 1);
        return result;
      },
      [from]
    );

    // const maxLength = numbers.at(-1)!.toString().length;
    const maxLength = 4;

    return numbers.map((num) => Ticket.getNumber(num, maxLength, "0"));
  },

  TicketsFormatter(tickets: string[]) {
    return tickets.reduce<Record<string, ITicket>>((result, ticket) => {
      const _id = uuid();

      result[_id] = {
        _id,
        _createdAt: dayjs().toDate(),
        label: ticket,
        value: ticket,
      };

      return result;
    }, {});
  },

  Ticket(props: TicketProps) {
    const { selected, value, onDelete } = props;
    const canDelete = Boolean(onDelete);

    const item = (
      <div
        className={cn(
          "rounded border w-12 h-6 flex border-solid items-center justify-center font-semibold text-xs",
          { "text-red-500 border-red-500 bg-transparent": !selected },
          { "text-white border-transparent bg-red-500": selected }
        )}
      >
        {value}
      </div>
    );

    if (canDelete) {
      return (
        <Badge
          count={
            <XCircleIcon
              className="opacity-0 group-hover:opacity-100 transition-all h-4 w-4 cursor-pointer hover:opacity-50 text-red-500"
              onClick={onDelete}
            />
          }
          className="group"
        >
          {item}
        </Badge>
      );
    }

    return item;
  },
};

export default Ticket;
