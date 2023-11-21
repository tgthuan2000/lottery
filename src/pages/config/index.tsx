import { Card, Input, Tooltip, Typography } from "antd";
import { ArrowLeftIcon, ArrowRightIcon, XIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Button from "~/shared/components/button";
import TicketList from "~/shared/components/ticket-list";
import TicketRangeInput from "~/shared/components/ticket-range-input";
import { SEARCH_PARAMS } from "~/shared/constants/search-param";
import useSearchParam from "~/shared/hooks/use-search-param";
import { useConfig } from "~/store/config";

export default function ConfigPage() {
  const navigate = useNavigate();
  const [slotParam] = useSearchParam(SEARCH_PARAMS.SLOT);

  const { slot, ticket, prize, utils } = useConfig((state) => {
    const slotValue = state.getSlot(slotParam);

    return {
      slot: {
        value: slotValue,
        set: state.setSlot(slotParam),
        generateTicket: state.generateTicket(slotParam),
      },
      ticket: {
        delete: state.deleteTicket(slotParam),
        deleteAll: state.deleteAllTicket(slotParam),
      },
      prize: {
        value: state.convertToList(slotValue?.prizes),
        create: state.addPrize(slotParam),
        set: state.setPrize(slotParam),
        delete: state.deletePrize(slotParam),
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

  return (
    <div className="flex flex-col gap-3 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tooltip title="Back">
            <Button.Icon icon={<ArrowLeftIcon />} onClick={() => navigate(-1)} />
          </Tooltip>
          <Typography.Title>{slot.value?.name || "Slot Name"}</Typography.Title>
        </div>

        <Link to={{ pathname: "/lottery", search: `slot=${slotParam}` }}>
          <Button.Slot type="primary" htmlType="button">
            Start
            <ArrowRightIcon className="ml-2" />
          </Button.Slot>
        </Link>
      </div>

      <label className="space-y-1">
        <Typography>Slot Name</Typography>
        <Input value={slot.value?.name} onChange={(e) => slot.set({ name: e.target.value })} />
      </label>

      <TicketRangeInput onSubmit={slot.generateTicket} />

      <TicketList
        value={utils.convertToList(slot.value?.tickets)}
        getItemKey={(item) => item._id}
        getItemLabel={(item) => item.label}
        onDeleteItem={ticket.delete}
        onDeleteAll={ticket.deleteAll}
      />

      {prize.value.map((_prize, index) => (
        <Card
          size="small"
          title={_prize.name || `Prize ${index + 1}`}
          key={_prize._id}
          extra={
            <XIcon
              className="text-gray-700 h-5 w-5 mt-1 cursor-pointer hover:opacity-50"
              onClick={() => {
                prize.delete(_prize._id);
              }}
            />
          }
        >
          <div className="flex flex-col gap-5">
            <label>
              <Typography>Name</Typography>
              <Input
                value={_prize.name}
                onChange={(e) => prize.set(_prize._id, { name: e.target.value })}
              />
            </label>

            <TicketRangeInput onSubmit={(from, to) => prize.generateTicket(_prize._id, from, to)} />

            <TicketList
              value={utils.convertToList(_prize.tickets)}
              getItemKey={(item) => item._id}
              getItemLabel={(item) => item.label}
              onDeleteItem={(ticketId) => prize.deleteTicket(_prize._id, ticketId)}
              onDeleteAll={() => prize.deleteAllTicket(_prize._id)}
            />
          </div>
        </Card>
      ))}

      <Button.Slot type="dashed" onClick={() => prize.create()} block className="mb-10">
        + Add Prize
      </Button.Slot>
    </div>
  );
}
