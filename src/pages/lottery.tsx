import Fireworks from "@fireworks-js/react";
import { Button as AntButton, Descriptions, Modal, Tooltip, Typography } from "antd";
import { XIcon } from "lucide-react";
import { Fragment, useMemo, useRef, useState } from "react";
import SlotCounter, { SlotCounterRef } from "react-slot-counter";
import Button from "~/shared/components/button";
import { SEARCH_PARAMS } from "~/shared/constants/search-param";
import useSearchParam from "~/shared/hooks/use-search-param";
import Ticket from "~/shared/service/ticket";
import { useConfig } from "~/store/config";
import { cn } from "~/util";

export default function LotteryPage() {
  const [slotParam] = useSearchParam(SEARCH_PARAMS.SLOT);
  const [historyParam] = useSearchParam(SEARCH_PARAMS.HISTORY);
  const [, setPrize] = useSearchParam(SEARCH_PARAMS.PRIZE);

  const { slot, prize, history } = useConfig((state) => {
    const slotValue = state.getSlot(slotParam);

    return {
      slot: {
        value: slotValue,
      },
      prize: {
        value: state.convertToList(slotValue?.prizes),
      },
      history: {
        value: slotValue?.history[historyParam ?? ""],
      },
    };
  });

  return (
    <>
      <Button.Back />

      {slot.value?.background && (
        <img src={slot.value?.background} className="-z-10 fixed inset-0 h-screen w-screen" />
      )}

      <div className="flex flex-col gap-5 h-screen overflow-hidden justify-center items-center">
        <Typography.Title level={1} style={{ color: slot.value?.textColor }}>
          {slot.value?.name}
        </Typography.Title>
        <Descriptions
          bordered
          layout="horizontal"
          className="min-w-[500px] [&_.ant-descriptions-view]:!border-[rgba(0,0,0,0.2)] [&_.ant-descriptions-item-label]:!border-e-[rgba(0,0,0,0.2)]"
        >
          {prize.value.map((_prize) => (
            <Descriptions.Item
              key={_prize._id}
              span={10}
              label={
                <div className="flex flex-col items-start gap-1">
                  <Typography.Title
                    level={5}
                    className="!mb-0 truncate min-w-[100px] !font-light"
                    style={{ color: slot.value?.textColor2 }}
                  >
                    {_prize.name}
                  </Typography.Title>
                  <Typography.Title
                    className="!my-0"
                    level={4}
                    style={{ color: slot.value?.textColor }}
                  >
                    {_prize.value}
                  </Typography.Title>
                </div>
              }
            >
              <div className="flex gap-5 flex-wrap justify-center items-center">
                {Array.from({ length: _prize.slot }).map((_, order) => {
                  const _ticket = history.value?.prizes[_prize._id][order];

                  const handleClick = () => {
                    setPrize((searchParam) => {
                      searchParam.set(SEARCH_PARAMS.ORDER, order.toString());
                      searchParam.set(SEARCH_PARAMS.TITLE, _prize.name);

                      return _prize._id;
                    });
                  };

                  return (
                    <Fragment key={order}>
                      {_ticket ? (
                        <Typography.Title
                          className="!my-0 cursor-pointer select-none hover:opacity-50"
                          level={4}
                          onClick={handleClick}
                          style={{ color: slot.value?.textColor }}
                        >
                          {_ticket.label}
                        </Typography.Title>
                      ) : (
                        <AntButton htmlType="button" onClick={handleClick} size="large">
                          TICKET
                        </AntButton>
                      )}
                    </Fragment>
                  );
                })}
              </div>
            </Descriptions.Item>
          ))}
        </Descriptions>
      </div>

      <LotteryModal />
    </>
  );
}

const MIN_DURATION_SEC = 1.5;
const LAST_DELAY = 4;

const LotteryModal = () => {
  const slotCounterRefs = useRef<SlotCounterRef[]>([]);

  const [, , slotParam] = useSearchParam(SEARCH_PARAMS.SLOT);
  const [, , historyParam] = useSearchParam(SEARCH_PARAMS.HISTORY);
  const [, setPrize, prizeParam] = useSearchParam(SEARCH_PARAMS.PRIZE);
  const [, , orderParam] = useSearchParam(SEARCH_PARAMS.ORDER);
  const [, , titleParam] = useSearchParam(SEARCH_PARAMS.TITLE);

  const { slot, history, ticket } = useConfig((state) => {
    const slot = state.getSlot(slotParam);

    return {
      slot: {
        value: slot,
      },
      history: {
        set: state.setHistory(slotParam, historyParam, prizeParam, Number(orderParam)),
      },
      ticket: {
        random: state.randomTicket(slotParam, prizeParam, historyParam),
      },
    };
  });

  const defaultValue = useMemo(
    () => Ticket.getNumber("0", slot.value?.maxLength, "0"),
    [slot.value?.maxLength]
  );

  const [state, setState] = useState<"pending" | "started" | "canClose">("pending");
  const [value, setValue] = useState<string>(defaultValue);

  const durationAnimationSec = value.length >= 3 ? MIN_DURATION_SEC : 3;

  const resetValue = () => {
    setValue(defaultValue);
  };

  const handleRun = () => {
    setState("started");

    const randomTicket = ticket.random();

    if (!randomTicket) return;

    setValue(Ticket.getNumber(randomTicket.value, slot.value?.maxLength, "0"));

    setTimeout(() => {
      slotCounterRefs.current.forEach((ref) => ref.startAnimation());
    }, 0);

    setTimeout(() => {
      setState("canClose");
      history.set(randomTicket);
    }, ((slot.value?.maxLength ?? 1) + LAST_DELAY) * (durationAnimationSec * 1000));
  };

  const handleClose = () => {
    resetValue();
    setState("pending");

    setPrize((searchParam) => {
      if (searchParam.has(SEARCH_PARAMS.ORDER)) {
        searchParam.delete(SEARCH_PARAMS.ORDER);
      }
      if (searchParam.has(SEARCH_PARAMS.TITLE)) {
        searchParam.delete(SEARCH_PARAMS.TITLE);
      }
      return undefined;
    });
  };

  return (
    <Modal
      open={Boolean(slotParam && historyParam && prizeParam)}
      closeIcon={false}
      closable={false}
      centered
      width="90vw"
      footer={false}
      destroyOnClose
      className="relative"
    >
      {slot.value?.background && (
        <img className="absolute inset-0 h-full w-full rounded-sm" src={slot.value?.background} />
      )}
      <div className="absolute left-1/2 -translate-x-1/2 top-8">
        <Typography.Title
          level={1}
          className="!my-0 !text-[70px] whitespace-nowrap select-none"
          style={{ color: slot.value?.textColor }}
        >
          {titleParam}
        </Typography.Title>
      </div>
      <div className="h-[90vh] flex items-center flex-col relative justify-center">
        <div
          className="flex items-center flex-nowrap justify-center gap-80"
          style={{ color: slot.value?.textColor }}
        >
          {Array.from({ length: value.length }).map((_, index) => (
            <SlotCounter
              key={index}
              ref={(ref) => ref && slotCounterRefs.current.push(ref)}
              startValue={defaultValue[index]}
              autoAnimationStart={false}
              value={value[index]}
              animateUnchanged={true}
              dummyCharacterCount={100}
              duration={
                durationAnimationSec * (index + 1 + (index === value.length - 1 ? LAST_DELAY : 0))
              }
              charClassName={cn(
                "text-7xl scale-[5] border border-solid rounded-md border-gray-700 select-none bg-white text-inherit",
                {
                  "[&>span]:!ease-out": index !== value.length - 1,
                  "[&>span]:!ease-lottery": index === value.length - 1,
                }
              )}
            />
          ))}
        </div>

        <div className="flex flex-col gap-3 absolute bottom-3">
          {state === "pending" && (
            <AntButton
              className="min-w-[200px]"
              htmlType="button"
              type="primary"
              size="large"
              onClick={handleRun}
            >
              START
            </AntButton>
          )}
        </div>
      </div>
      {["canClose", "pending"].includes(state) && (
        <Tooltip title="Close">
          <Button.Icon
            icon={<XIcon className="h-6 w-6" />}
            className="z-50 absolute top-5 right-5"
            style={{ color: slot.value?.textColor2 }}
            onClick={handleClose}
          />
        </Tooltip>
      )}
      {state === "canClose" && (
        <Fireworks
          options={{ opacity: 0.5, mouse: { click: false } }}
          style={{
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            position: "fixed",
          }}
        />
      )}
    </Modal>
  );
};
