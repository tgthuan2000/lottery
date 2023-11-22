import { Card, Input, Tooltip, Typography } from "antd";
import { debounce } from "lodash";
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
        setSlot: state.setPrizeSlot(slotParam),
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
    <div className="flex flex-col gap-3 max-w-5xl mx-auto my-10">
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
        onDeleteAll={ticket.deleteAll}
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
                <XIcon
                  className="text-gray-700 h-5 w-5 mt-1 cursor-pointer hover:opacity-50"
                  onClick={() => prize.delete(_prize._id)}
                />
              }
            >
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
                      defaultValue={utils.convertToList(_prize.winningTickets).length}
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
                  onDeleteAll={() => prize.deleteAllTicket(_prize._id)}
                />
              </div>
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
