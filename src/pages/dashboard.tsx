import { App, Tooltip, Typography } from "antd";
import { PlusIcon, SettingsIcon, TrashIcon, UploadCloudIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Button from "~/shared/components/button";
import DropdownHistory from "~/shared/components/dropdown-history";
import useConfirmPassword from "~/shared/hooks/use-confirm-password";
import { useConfig } from "../store/config";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const confirmPassword = useConfirmPassword();

  const [slots, addSlot, removeSlot, verifySlotPassword] = useConfig((state) => [
    state.convertToList(state.slots),
    state.addSlot,
    state.removeSlot,
    state.verifySlotPassword,
  ]);

  return (
    <div className="flex w-full h-screen justify-center items-center">
      <div className="flex items-center flex-col gap-5">
        <Typography.Title className="relative">
          <img
            src="/logo.png"
            className="absolute right-[calc(100%+12px)] object-cover w-12 h-12 aspect-square"
          />{" "}
          Lottery
        </Typography.Title>
        {slots.map((slot) => (
          <div key={slot._id} className="group relative flex w-full">
            <DropdownHistory slotParam={slot._id}>
              <Tooltip title="New Game">{slot.name}</Tooltip>
            </DropdownHistory>

            <div className="absolute flex items-center gap-2 group-hover:opacity-100 opacity-0 transition-all left-[calc(100%+12px)] top-1/2 -translate-y-1/2">
              <Tooltip title="Config Slot">
                <Button.Icon
                  icon={<SettingsIcon className="h-5 w-5" />}
                  onClick={() => navigate({ pathname: "/config", search: `slot=${slot._id}` })}
                />
              </Tooltip>

              <Tooltip title="Delete Slot">
                <Button.Icon
                  color="red"
                  icon={<TrashIcon className="text-red-500 h-5 w-5" />}
                  onClick={() => {
                    confirmPassword({
                      title: "Delete slot?",
                      onConfirm(value) {
                        if (value && verifySlotPassword(slot._id, value)) {
                          removeSlot(slot._id);
                          message.success("Remove successfully");
                        } else {
                          message.error("Remove unsuccessfully");
                        }
                      },
                    });
                  }}
                />
              </Tooltip>
            </div>
          </div>
        ))}
        <Button.Slot type="dashed" icon={<PlusIcon />} onClick={() => addSlot()}>
          New Slot
        </Button.Slot>
        <Link to="import">
          <Button.Slot icon={<UploadCloudIcon />}>Import Slot</Button.Slot>
        </Link>
      </div>
    </div>
  );
}
