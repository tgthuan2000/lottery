import Fireworks from "@fireworks-js/react";
import { Button as AntButton, Descriptions, Modal, Typography } from "antd";
import { Fragment, useMemo, useRef, useState } from "react";
import SlotCounter, { SlotCounterRef } from "react-slot-counter";
import Button from "~/shared/components/button";
import { SEARCH_PARAMS } from "~/shared/constants/search-param";
import useSearchParam from "~/shared/hooks/use-search-param";
import Ticket from "~/shared/service/ticket";
import { useConfig } from "~/store/config";

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

      <div className="flex flex-col gap-5 h-screen overflow-hidden justify-center items-center">
        <Typography.Title level={1}>{slot.value?.name}</Typography.Title>
        <Descriptions bordered layout="horizontal" className="min-w-[500px]">
          {prize.value.map((_prize) => (
            <Descriptions.Item
              key={_prize._id}
              span={10}
              label={
                <div className="flex flex-col items-start gap-1">
                  <Typography.Title level={5} className="!mb-0 truncate min-w-[100px] !font-light">
                    {_prize.name}
                  </Typography.Title>
                  <Typography.Title className="!my-0" level={4}>
                    {_prize.value}
                  </Typography.Title>
                </div>
              }
            >
              <div className="flex gap-5 flex-wrap justify-center items-center">
                {Array.from({ length: _prize.slot }).map((_, order) => {
                  const _ticket = history.value?.prizes[_prize._id][order];

                  return (
                    <Fragment key={order}>
                      {_ticket ? (
                        <Typography.Title className="!my-0" level={4}>
                          {_ticket.label}
                        </Typography.Title>
                      ) : (
                        <AntButton
                          htmlType="button"
                          onClick={() =>
                            setPrize((searchParam) => {
                              searchParam.set(SEARCH_PARAMS.ORDER, order.toString());

                              return _prize._id;
                            })
                          }
                          size="large"
                        >
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

const LotteryModal = () => {
  const slotCounterRefs = useRef<SlotCounterRef[]>([]);

  const [, , slotParam] = useSearchParam(SEARCH_PARAMS.SLOT);
  const [, , historyParam] = useSearchParam(SEARCH_PARAMS.HISTORY);
  const [, setPrize, prizeParam] = useSearchParam(SEARCH_PARAMS.PRIZE);
  const [, , orderParam] = useSearchParam(SEARCH_PARAMS.ORDER);

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

  const resetValue = () => {
    setValue(defaultValue);
  };

  const handleRun = () => {
    setState("started");

    const randomTicket = ticket.random();

    if (!randomTicket) return;

    setValue(Ticket.getNumber(randomTicket.value, slot.value?.maxLength, "0"));

    history.set(randomTicket);

    setTimeout(() => {
      slotCounterRefs.current.forEach((ref) => ref.startAnimation());
    }, 0);

    setTimeout(() => {
      setState("canClose");
    }, (slot.value?.maxLength ?? 1) * 3000);
  };

  const handleClose = () => {
    resetValue();
    setState("pending");

    setPrize(undefined);
  };

  return (
    <Modal
      open={Boolean(slotParam && historyParam && prizeParam)}
      closeIcon={false}
      closable={false}
      centered
      width={1000}
      footer={false}
      destroyOnClose
    >
      <div className="h-[500px] flex items-center flex-col relative justify-center">
        <div className="flex items-center flex-nowrap justify-center gap-16">
          {Array.from({ length: value.length }).map((_, index) => (
            <SlotCounter
              key={index}
              ref={(ref) => ref && slotCounterRefs.current.push(ref)}
              startValue={defaultValue[index]}
              autoAnimationStart={false}
              value={value[index]}
              animateUnchanged={true}
              dummyCharacterCount={100 * (index + 1)}
              duration={3 * (index + 1)}
              charClassName="text-7xl scale-[2]"
            />
          ))}
        </div>

        <div className="flex flex-col gap-3 absolute bottom-3">
          {state === "pending" && (
            <>
              <AntButton
                className="min-w-[200px]"
                htmlType="button"
                type="primary"
                size="large"
                onClick={handleRun}
              >
                START
              </AntButton>
              <AntButton
                className="min-w-[200px]"
                htmlType="button"
                size="large"
                onClick={handleClose}
              >
                CLOSE
              </AntButton>
            </>
          )}

          {state === "canClose" && (
            <AntButton
              className="min-w-[200px] z-50"
              htmlType="button"
              size="large"
              onClick={handleClose}
            >
              CLOSE
            </AntButton>
          )}
        </div>
      </div>

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
