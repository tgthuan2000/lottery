import { Input, InputRef, Tooltip, Typography } from "antd";
import { SendHorizontalIcon } from "lucide-react";
import { ReactNode, useRef } from "react";
import { cn } from "~/util";

type Props = {
  label?: ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: any;
  className?: string;
  onSubmit?: (value: number) => void;
};

export default function TicketSlotInput(props: Props) {
  const { defaultValue, label, className, onSubmit } = props;
  const ref = useRef<InputRef>(null);

  return (
    <label className={cn("flex flex-col items-start", className)}>
      {label && <Typography>{label}</Typography>}
      <Input
        ref={ref}
        defaultValue={defaultValue}
        className="w-40"
        addonAfter={
          <Tooltip title="Submit">
            <SendHorizontalIcon
              className="text-gray-700 h-5 w-5 cursor-pointer hover:opacity-60"
              onClick={() => onSubmit?.(Number(ref.current?.input?.value))}
            />
          </Tooltip>
        }
      />
    </label>
  );
}
