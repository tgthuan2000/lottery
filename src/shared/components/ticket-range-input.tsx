import { InputNumber, Space, Tooltip, Typography } from "antd";
import { SendHorizontalIcon } from "lucide-react";
import { ReactNode, useRef } from "react";
import { cn } from "~/util";

type Props = {
  label?: ReactNode;
  className?: string;
  min?: number;
  max?: number;
  from?: number;
  to?: number;
  onSubmit: (from: number, to: number) => void;
};

export default function TicketRangeInput(props: Props) {
  const { label = "Tickets", className, max, min, from, to, onSubmit } = props;

  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);

  return (
    <label className={cn("flex flex-col items-start", className)}>
      <Typography>{label}</Typography>
      <Space.Compact>
        <InputNumber
          ref={fromRef}
          min={min}
          max={max}
          defaultValue={min ?? from}
          placeholder="From (Ex: 1)"
          className="w-32"
        />

        <InputNumber
          ref={toRef}
          min={min}
          max={max}
          defaultValue={max ?? to}
          placeholder="To (Ex: 1000)"
          className="w-40"
          addonAfter={
            <Tooltip title="Submit">
              <SendHorizontalIcon
                className="text-gray-700 h-5 w-5 cursor-pointer hover:opacity-60"
                onClick={() =>
                  onSubmit(Number(fromRef.current?.value), Number(toRef.current?.value))
                }
              />
            </Tooltip>
          }
        />
      </Space.Compact>
    </label>
  );
}
