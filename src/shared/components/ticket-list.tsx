import { Empty } from "antd";
import { isEmpty } from "lodash";
import { MaximizeIcon, MinusIcon, TrashIcon } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "~/util";
import Ticket from "../service/ticket";
import Button from "./button";

type Props<T> = {
  value: T[];
  className?: string;
  emptyText?: ReactNode;
  minimized?: boolean;
  onScale?: (minimized: boolean) => void;
  onDeleteItem?: (itemId: string) => void;
  onDeleteAll?: () => void;
  getItemKey: (value: T) => string;
  getItemLabel: (value: T) => ReactNode;
};

export default function TicketList<T>(props: Props<T>) {
  const {
    value,
    emptyText = "Empty Ticket!",
    className,
    minimized,
    onScale,
    onDeleteItem,
    onDeleteAll,
    getItemKey,
    getItemLabel,
  } = props;

  return (
    <div className={cn("border border-solid border-gray-100 rounded-md", className)}>
      {isEmpty(value) ? (
        <Empty description={emptyText} className="p-3" />
      ) : (
        <div className="flex flex-col gap-3 relative">
          {onScale && (
            <div className="absolute bottom-[calc(100%+4px)] right-1">
              <Button.Icon
                icon={minimized ? <MaximizeIcon /> : <MinusIcon />}
                onClick={() => onScale(!minimized)}
              />
            </div>
          )}
          {!minimized && (
            <>
              <div className="flex flex-wrap gap-3 max-h-[40vh] overflow-auto p-3">
                {value.map((item) => {
                  const _id = getItemKey(item);
                  const label = getItemLabel(item);

                  return (
                    <Ticket.Ticket onDelete={() => onDeleteItem?.(_id)} key={_id}>
                      {label}
                    </Ticket.Ticket>
                  );
                })}
              </div>
              {onDeleteAll && (
                <div className="px-3 pb-3">
                  <Button.Slot
                    block
                    danger
                    size="middle"
                    icon={<TrashIcon className="h-4 w-4" />}
                    onClick={onDeleteAll}
                  >
                    Clear All
                  </Button.Slot>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
