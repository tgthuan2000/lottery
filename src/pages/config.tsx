import { useMutation } from "@tanstack/react-query";
import { App, Card, Input, Tooltip, Typography } from "antd";
import { MD5 } from "crypto-js";
import { debounce } from "lodash";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  LockIcon,
  MaximizeIcon,
  MinusIcon,
  UploadCloudIcon,
  XIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "~/config/db";
import { queryClient } from "~/config/query-client";
import Button from "~/shared/components/button";
import DropdownHistory from "~/shared/components/dropdown-history";
import TicketList from "~/shared/components/ticket-list";
import TicketRangeInput from "~/shared/components/ticket-range-input";
import { GET_SLOTS } from "~/shared/constants/query-key";
import { SEARCH_PARAMS } from "~/shared/constants/search-param";
import useConfirmPassword from "~/shared/hooks/use-confirm-password";
import useSearchParam from "~/shared/hooks/use-search-param";
import { useConfig } from "~/store/config";
import { cn } from "~/util";

export default function ConfigPage() {
  const { modal, message } = App.useApp();
  const navigate = useNavigate();
  const [slotParam] = useSearchParam(SEARCH_PARAMS.SLOT);
  const confirmPassword = useConfirmPassword();

  const { slot, ticket, prize, utils } = useConfig((state) => {
    const slotValue = state.getSlot(slotParam);

    return {
      slot: {
        value: slotValue,
        set: state.setSlot(slotParam),
        generateTicket: state.generateTicket(slotParam),
        createHistory: state.createHistoryGame(slotParam),
      },
      ticket: {
        delete: state.deleteTicket(slotParam),
        deleteAll: state.deleteAllTicket(slotParam),
      },
      prize: {
        value: state.convertToList(slotValue?.prizes),
        create: state.addPrize(slotParam),
        set: state.setPrize(slotParam),
        setSlot: state.setPrizeSlot(slotParam),
        delete: state.deletePrize(slotParam),
        minimize: state.minimizePrize(slotParam),
        maximize: state.maximizePrize(slotParam),
        deleteTicket: state.deletePrizeTicket(slotParam),
        deleteAllTicket: state.deleteAllPrizeTicket(slotParam),
        addTicket: state.addPrizeTicket(slotParam),
        generateTicket: state.generatePrizeTicket(slotParam),
      },
      utils: {
        convertToList: state.convertToList,
      },
    };
  });

  const uploadCloud = useMutation({
    async mutationFn(slotValue: ISlot) {
      await db.createOrReplace({
        _type: "slot",
        _id: slotValue._id,
        name: slotValue.name,
        value: JSON.stringify(slotValue),
      });
    },
    onSuccess() {
      message.success("Published!");
      queryClient.invalidateQueries({ type: "all", queryKey: GET_SLOTS });
    },
    onError() {
      message.error("Publish unsuccessfully!");
    },
  });

  const handleUploadCloud = () => {
    slot.value && uploadCloud.mutate(slot.value);
  };

  const handleSetPassword = () => {
    confirmPassword({
      title: "Set Password",
      onConfirm(value) {
        if (value) {
          slot.set("password", MD5(value).toString());
          message.success("Set password was successful");
        } else {
          message.error("Set password failed");
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-3 max-w-5xl px-3 mx-auto my-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tooltip title="Back">
            <Button.Icon icon={<ArrowLeftIcon />} onClick={() => navigate(-1)} />
          </Tooltip>
          <Typography.Title>{slot.value?.name || "Slot Name"}</Typography.Title>
        </div>

        <div className="flex gap-3 items-center">
          <Tooltip title="Set Password" placement="bottom">
            <Button.Icon
              icon={<LockIcon />}
              className="h-10 !w-12 flex items-center justify-center"
              onClick={handleSetPassword}
            />
          </Tooltip>
          <Tooltip title="Publish" placement="bottom">
            <Button.Icon
              icon={<UploadCloudIcon />}
              className="h-10 !w-12 flex items-center justify-center"
              onClick={handleUploadCloud}
              loading={uploadCloud.isPending}
            />
          </Tooltip>
          <DropdownHistory type="primary" slotParam={slotParam!}>
            <div className="flex items-center">
              NEW GAME
              <ArrowRightIcon className="ml-2" />
            </div>
          </DropdownHistory>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <label>
          <Typography>Slot Name</Typography>
          <Input
            defaultValue={slot.value?.name}
            onChange={debounce((e) => slot.set("name", e.target.value), 1000)}
            className="w-fit"
          />
        </label>

        <TicketRangeInput
          from={slot.value?.from}
          to={slot.value?.to}
          onSubmit={slot.generateTicket}
        />
      </div>

      <TicketList
        value={utils.convertToList(slot.value?.tickets)}
        getItemKey={(item) => item._id}
        getItemLabel={(item) => item.label}
        onDeleteItem={ticket.delete}
        onDeleteAll={() => {
          modal.confirm({ content: "Are you sure?" }).then(
            (confirmed) => confirmed && ticket.deleteAll(),
            () => {}
          );
        }}
        minimized={slot.value?.minimizeTicket}
        onScale={(minimized) => slot.set("minimizeTicket", minimized)}
      />

      <div className="mt-5">
        <Typography.Title level={4}>Prize</Typography.Title>
        <div className="flex flex-col gap-3">
          {prize.value.map((_prize, index) => (
            <Card
              size="small"
              title={
                <Typography.Title level={3} className="!mb-0">
                  #{index + 1}
                </Typography.Title>
              }
              key={_prize._id}
              extra={
                <div
                  className={cn("space-x-2 opacity-0 group-hover:opacity-100", {
                    "opacity-100": !_prize.minimized,
                  })}
                >
                  {_prize.minimized ? (
                    <MaximizeIcon
                      className="text-gray-700 h-5 w-5 mt-1 cursor-pointer hover:opacity-50"
                      onClick={() => prize.maximize(_prize._id)}
                    />
                  ) : (
                    <MinusIcon
                      className="text-gray-700 h-5 w-5 mt-1 cursor-pointer hover:opacity-50"
                      onClick={() => prize.minimize(_prize._id)}
                    />
                  )}
                  <XIcon
                    className="text-gray-700 h-5 w-5 mt-1 cursor-pointer hover:opacity-50"
                    onClick={() => {
                      modal.confirm({ content: "Are you sure?" }).then(
                        (confirmed) => confirmed && prize.delete(_prize._id),
                        () => {}
                      );
                    }}
                  />
                </div>
              }
              className={cn("group", { "[&>.ant-card-body]:p-0": _prize.minimized })}
            >
              {!_prize.minimized && (
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-5 flex-wrap">
                    <label>
                      <Typography>Name</Typography>
                      <Input
                        defaultValue={_prize.name}
                        onChange={debounce(
                          (e) => prize.set(_prize._id, "name", e.target.value),
                          1000
                        )}
                        className="w-fit"
                      />
                    </label>

                    <label>
                      <Typography>Value</Typography>
                      <Input
                        value={_prize.value}
                        onChange={(e) => prize.set(_prize._id, "value", e.target.value)}
                        className="w-fit"
                      />
                    </label>

                    <label>
                      <Typography>Slot</Typography>
                      <Input
                        defaultValue={_prize.slot}
                        className="w-40"
                        onChange={debounce(
                          (e) => prize.setSlot(_prize._id, Number(e.target.value)),
                          1000
                        )}
                      />
                    </label>

                    <TicketRangeInput
                      label="Ticket"
                      min={slot.value?.from}
                      max={slot.value?.to}
                      onSubmit={(from, to) => prize.generateTicket(_prize._id, from, to)}
                    />
                  </div>

                  <TicketList
                    value={utils.convertToList(_prize.tickets)}
                    getItemKey={(item) => item._id}
                    getItemLabel={(item) => item.label}
                    onDeleteItem={(ticketId) => prize.deleteTicket(_prize._id, ticketId)}
                    onDeleteAll={() => {
                      modal.confirm({ content: "Are you sure?" }).then(
                        (confirmed) => confirmed && prize.deleteAllTicket(_prize._id),
                        () => {}
                      );
                    }}
                  />
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
      <Button.Slot type="dashed" onClick={() => prize.create()} block>
        + Add Prize
      </Button.Slot>
    </div>
  );
}
