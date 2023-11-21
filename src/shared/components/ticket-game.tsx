import { Empty } from "antd";
import { isEmpty } from "lodash";
import { ReactNode } from "react";
import { cn } from "~/util";
import Ticket from "../service/ticket";

type Props<T> = {
  value: T[];
  className?: string;
  emptyText?: ReactNode;
  selectedNumber?: number;
  getItemKey: (value: T) => string;
  getItemLabel: (value: T) => ReactNode;
};

export default function TicketGame<T>(props: Props<T>) {
  const {
    value,
    emptyText = "Empty Ticket!",
    className,
    selectedNumber,
    getItemKey,
    getItemLabel,
  } = props;

  return (
    <div className={cn("h-screen flex justify-center items-center", className)}>
      {isEmpty(value) ? (
        <Empty description={emptyText} />
      ) : (
        <div className="flex flex-wrap gap-3">
          {value.map((item) => {
            const _id = getItemKey(item);
            const label = getItemLabel(item);

            return (
              <Ticket.Ticket key={_id} selected={selectedNumber === Number(label?.toString())}>
                {label}
              </Ticket.Ticket>
            );
          })}
        </div>
      )}
    </div>
  );
}
