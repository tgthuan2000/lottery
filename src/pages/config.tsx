import { useMutation } from "@tanstack/react-query";
import { App, Card, Dropdown, Input, Tooltip, Typography } from "antd";
import { MenuProps } from "antd/lib";
import dayjs from "dayjs";
import { debounce } from "lodash";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  MaximizeIcon,
  MinusIcon,
  UploadCloudIcon,
  XIcon,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "~/config/db";
import Button from "~/shared/components/button";
import TicketList from "~/shared/components/ticket-list";
import TicketRangeInput from "~/shared/components/ticket-range-input";
import { SEARCH_PARAMS } from "~/shared/constants/search-param";
import useSearchParam from "~/shared/hooks/use-search-param";
import { useConfig } from "~/store/config";
import { cn } from "~/util";

export default function ConfigPage() {
  const { modal, message } = App.useApp();
  const navigate = useNavigate();
  const [slotParam] = useSearchParam(SEARCH_PARAMS.SLOT);

  const { slot, ticket, prize, history, utils } = useConfig((state) => {
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
      history: {
        value: state.convertToList(slotValue?.history),
        delete: state.deleteSlotHistory(slotParam),
      },
      utils: {
        convertToList: state.convertToList,
      },
    };
  });

  const lottery = (historyId?: string) => {
    navigate({
      pathname: "/lottery",
      search: `${SEARCH_PARAMS.SLOT}=${slotParam}&${SEARCH_PARAMS.HISTORY}=${
        historyId ?? slot.createHistory()
      }`,
    });
  };

  const items = useMemo<MenuProps["items"]>(() => {
    return history.value.map((_history) => {
      return {
        key: _history._id,
        label: (
          <div className="relative group">
            {_history.name ?? _history._id.slice(0, 4)} -{" "}
            {dayjs(_history._createdAt).format("HH:mm DD/MM/YY")}
            <Button.Icon
              danger
              onClick={(e) => {
                e.stopPropagation();

                modal.confirm({ content: "Are you sure?" }).then(
                  (confirmed) => confirmed && history.delete(_history._id),
                  () => {}
                );
              }}
              className="absolute left-[calc(100%+20px)] opacity-0 group-hover:opacity-100 top-1/2 -translate-y-1/2"
              icon={<XIcon />}
            />
          </div>
        ),
      };
    });
  }, [history, modal]);

  const uploadCloud = useMutation({
    async mutationFn(slotValue: ISlot) {
      await db.nP_Slot.create({
        data: {
          value: JSON.stringify(slotValue),
          label: slotValue.name,
        },
      });
    },
    onSuccess() {
      message.success("Upload successfully!");
    },
    onError() {
      message.error("Upload unsuccessfully!");
    },
  });

  const handleUploadCloud = () => {
    slot.value && uploadCloud.mutate(slot.value);
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
          <Tooltip title="Upload to Cloud" placement="bottom">
            <Button.Icon
              icon={<UploadCloudIcon />}
              className="h-10 !w-12 flex items-center justify-center"
              onClick={handleUploadCloud}
              loading={uploadCloud.isPending}
            />
          </Tooltip>
          <Dropdown.Button
            htmlType="button"
            size="large"
            type="primary"
            menu={{ items, onClick: (value) => lottery(value.key) }}
            onClick={() => lottery()}
          >
            <div className="flex items-center">
              NEW GAME
              <ArrowRightIcon className="ml-2" />
            </div>
          </Dropdown.Button>
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
