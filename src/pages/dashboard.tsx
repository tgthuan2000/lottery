import { Typography } from "antd";
import { ImportIcon, PlusIcon, TrashIcon } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "~/shared/components/button";
import { useConfig } from "../store/config";

export default function DashboardPage() {
  const [slots, addSlot, removeSlot] = useConfig((state) => [
    state.convertToList(state.slots),
    state.addSlot,
    state.removeSlot,
  ]);

  return (
    <div className="flex w-full h-screen justify-center items-center">
      <div className="flex items-center flex-col gap-5">
        <Typography.Title>Lottery</Typography.Title>
        {slots.map((slot) => (
          <div key={slot._id} className="group relative">
            <Link
              to={{
                pathname: "/config",
                search: `slot=${slot._id}`,
              }}
            >
              <Button.Slot>{slot.name}</Button.Slot>
            </Link>
            <div className="absolute group-hover:opacity-100 opacity-0 transition-all left-[calc(100%+12px)] top-1/2 -translate-y-1/2">
              <Button.Icon
                color="red"
                icon={<TrashIcon className="text-red-500 h-5 w-5" />}
                onClick={() => removeSlot(slot._id)}
              />
            </div>
          </div>
        ))}
        <Button.Slot type="dashed" icon={<PlusIcon />} onClick={() => addSlot()}>
          New Slot
        </Button.Slot>
        <Link to="import">
          <Button.Slot icon={<ImportIcon />}>Import Slot</Button.Slot>
        </Link>
      </div>
    </div>
  );
}
